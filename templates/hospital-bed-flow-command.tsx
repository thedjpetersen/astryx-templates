// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file hospital-bed-flow-command.tsx
 * @input Deterministic Wardline fixtures only: four hand-authored inpatient
 *   units (4W Med-Surg 14 beds, 5T Telemetry 10, MICU-2 8, OBS 6 — 38 beds
 *   total, every bed a literal with room/slot, private/telemetry/negative-
 *   pressure capability flags, and an authored state), plus six pending
 *   admits with boarded-hours figures that cross-check by hand:
 *   6.4 + 4.1 + 2.8 + 1.2 + 0.9 + 3.6 = 19.0 boarding hours. Initial
 *   occupancy: occupied 23 + discharge-pending 3 = 26 of 38 = 68%
 *   (4W: 8 occ + 2 dc · 5T: 6 occ + 1 dc · MICU: 6 occ · OBS: 3 occ).
 *   Initial available beds: 8 (4W 403-B + 407, 5T 504 + 509, MICU 204 +
 *   208, OBS 2 + 5). No clock reads, no randomness, no timers, no
 *   network assets; every clock string is a fixed fixture.
 * @output Wardline — Hospital Bed Flow Command: a house-supervisor surface.
 *   A brand header with four derived stat tiles (available beds, pending
 *   admits, boarding hours, occupancy %) sits over a two-region body: the
 *   unit floor — four unit sections, each a 44px unit header, a 12px
 *   segmented census bar, and a grid of 64px state-coded bed tiles
 *   (occupied / discharge-pending / cleaning / blocked / available /
 *   assigned, with private / telemetry / negative-pressure capability
 *   glyphs) — beside a 328px pending-admit rail whose cards carry
 *   demographics, working diagnosis, unit + telemetry + isolation
 *   requirement chips, and an age-tinted boarding chip. Signature move:
 *   arming an admit card highlights every COMPATIBLE available bed and
 *   dims the rest; tapping a highlighted tile assigns — the tile flips to
 *   assigned, the unit census bar re-segments, and the boarding-hours and
 *   available-bed stats re-derive in the same render — while tapping an
 *   incompatible bed REFUSES with the exact rule that failed ("403-B is a
 *   semi-private room — contact isolation requires a private room") in a
 *   notice banner, an error ring on the tile, and the live region. The
 *   whole bed lifecycle is tappable with no admit armed: discharge-pending
 *   → complete discharge (bed goes to EVS clean), cleaning → mark clean
 *   (bed opens), assigned → release the bed and return the admit to the
 *   pending queue. Every mutation appends to the shift log.
 * @position Page template; emitted by `astryx template hospital-bed-flow-command`
 *
 * Frame: Layout height="fill" → LayoutHeader (brand + stat strip) →
 *   LayoutContent padding 0 → `.hbf-body` hand-rolled grid
 *   `minmax(0, 1fr) 328px` (hand-rolled rather than LayoutPanel so the
 *   <=900px restructure — rail becomes a horizontal admit strip ABOVE the
 *   floor — is pure CSS; a DS panel would pin the rail's width inline and
 *   defeat the media query). Left cell scrolls the unit floor; right cell
 *   scrolls the admit rail + shift log. One state owner: `beds`,
 *   `admits`, `armedAdmitId`, `notice`, `log`, `announcement` — assign,
 *   refuse, discharge, clean, and release all flow through the same two
 *   setState reducers, so census bars, stat tiles, tile states, and the
 *   log can never disagree.
 * Container policy: rows, rails, tiles, and one notice banner — no card
 *   grids. Bed tiles and admit cards are real <button>s (the displayed
 *   state IS the affordance); stat tiles are static derived readouts.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Wardline teal) as a light-dark() pair with contrast math at the
 *   declaration; bed-state and boarding-age colors are also light-dark()
 *   pairs, each with math. The nonexistent bare text token is never
 *   used — text is --color-text-primary / --color-text-secondary
 *   throughout.
 * Density grid (repeated verbatim): 12px page gutter · 16px unit section
 *   gap · 44px unit header row · 12px census bar · bed tiles
 *   minmax(96px, 1fr) × 64px on an 8px grid gap · 328px admit rail ·
 *   admit cards 12px padding · 60px stat tiles · 40px minimum hit
 *   targets · 2px focus ring at 2px offset. Type: 13px/600 tile ids and
 *   card names · 12px body meta · 11px/600 chips and overlines — nothing
 *   under 11px; tabular-nums on every count, hour, and percent.
 * Fixture policy: fixed strings for all times ("DC order 14:00");
 *   boarding hours are literal decimals summed live from the un-assigned
 *   admit set, so the 19.0 header stat is a derivation, not a caption.
 *   Stress rows live in the data: A-4114's 57-character working
 *   diagnosis exercises card wrapping, and 4W deliberately offers Reyes
 *   (contact isolation) one compatible bed (407) and one refusal bed
 *   (403-B, semi-private) so the refusal path is reachable in two taps.
 *
 * Responsive contract:
 * - >= 901px (including the ~1045px inline demo stage, where viewport
 *   media queries never fire — this default IS the stage layout): floor
 *   grid + 328px admit rail side by side; bed grid auto-fills
 *   minmax(96px, 1fr) columns so the floor tracks the stage width with
 *   no breakpoint.
 * - <= 900px: the body drops to one column; the admit rail becomes a
 *   horizontal scroll strip of 280px cards pinned ABOVE the floor
 *   (subtraction + reorder, not a squeeze); the shift log moves below
 *   the floor.
 * - <= 560px (the 390px embed iframe): stat tiles wrap two-up, bed tiles
 *   relax to minmax(88px, 1fr), the header subtitle drops, and every
 *   control keeps a >= 40px hit target.
 * - prefers-reduced-motion collapses the target pulse and refusal shake
 *   to static outline styling.
 */

import {useMemo, useState, type KeyboardEvent as ReactKeyboardEvent} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  ActivityIcon,
  BedDoubleIcon,
  ClipboardListIcon,
  DoorClosedIcon,
  FanIcon,
  ShieldIcon,
  WindIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Wardline brand accent (teal). #0F766E on #FFFFFF ≈ 5.6:1
// (passes 4.5:1 for 11px+ text); #4CD9CC on the dark body (~#17191C) ≈ 9.2:1.
const BRAND_ACCENT = 'light-dark(#0F766E, #4CD9CC)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #0F766E ≈ 4.7:1;
// #06302B on #4CD9CC ≈ 8.1:1 (white on #4CD9CC would fail at ≈1.6:1).
const BRAND_ON = 'light-dark(#FFFFFF, #06302B)';
// Brand wash for available tiles / armed cards. Text on the wash is
// BRAND_ACCENT: #0F766E on rgba(15,118,110,.10)-over-white (≈ #E7F1F0)
// ≈ 5.1:1; #4CD9CC on rgba(76,217,204,.14)-over-#17191C ≈ 7.8:1.
const BRAND_TINT = 'light-dark(rgba(15, 118, 110, 0.10), rgba(76, 217, 204, 0.14))';

// Discharge-pending amber. Text pair on card surfaces: #92400E on #FFFFFF
// ≈ 7.3:1; #F2B84B on #17191C ≈ 9.8:1. Tint is a wash only.
const DC_TEXT = 'light-dark(#92400E, #F2B84B)';
const DC_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(242, 184, 75, 0.14))';
// EVS-cleaning blue: #1D4ED8 on #FFFFFF ≈ 6.3:1; #8AB4FF on #17191C ≈ 8.6:1.
const CLEAN_TEXT = 'light-dark(#1D4ED8, #8AB4FF)';
const CLEAN_TINT = 'light-dark(rgba(29, 78, 216, 0.10), rgba(138, 180, 255, 0.14))';
// Blocked / refusal red: #B42318 on #FFFFFF ≈ 6.4:1; #FF8A7A on #17191C ≈ 7.4:1.
const BLOCK_TEXT = 'light-dark(#B42318, #FF8A7A)';
const BLOCK_TINT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(255, 138, 122, 0.14))';
// Boarding-age chip ramp reuses DC_TEXT (>= 4h) and BLOCK_TEXT (>= 6h);
// under 4h the chip stays on text-secondary — no extra literals needed.

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES
// ---------------------------------------------------------------------------

type BedState =
  | 'occupied'
  | 'dc-pending'
  | 'cleaning'
  | 'available'
  | 'blocked'
  | 'assigned';

type IsolationNeed = 'none' | 'contact' | 'droplet' | 'airborne' | 'protective';

interface Bed {
  id: string;
  unitId: string;
  /** Room-slot label rendered on the tile, e.g. "403-B". */
  label: string;
  isPrivate: boolean;
  telemetry: boolean;
  negPressure: boolean;
  state: BedState;
  /** Occupant line for occupied / dc-pending / assigned tiles. */
  occupant: string | null;
  /** Fixed sub-note: "DC order 14:00", "EVS started 13:10", … */
  note: string | null;
}

interface Admit {
  id: string;
  patient: string;
  /** "67F", "54M" … */
  ageSex: string;
  /** Working diagnosis — A-4114 is the 62-char wrap stress fixture. */
  dx: string;
  source: string;
  /** Unit ids this admit can land on, in preference order. */
  units: string[];
  telemetry: boolean;
  isolation: IsolationNeed;
  /** Literal decimal hours boarded; header stat = live sum = 19.0 at load. */
  boardedHours: number;
}

interface UnitMeta {
  id: string;
  name: string;
  descriptor: string;
}

const UNITS: UnitMeta[] = [
  {id: '4W', name: '4 West — Med-Surg', descriptor: '6 semi-private rooms + 2 private'},
  {id: '5T', name: '5 Tower — Telemetry', descriptor: '10 private monitored rooms'},
  {id: 'MICU', name: 'MICU-2', descriptor: '8 private rooms · 204/205 negative pressure'},
  {id: 'OBS', name: 'Observation', descriptor: '6 open bays · no isolation capability'},
];

const ISOLATION_LABEL: Record<IsolationNeed, string> = {
  none: 'Standard precautions',
  contact: 'Contact isolation',
  droplet: 'Droplet isolation',
  airborne: 'Airborne isolation',
  protective: 'Protective environment',
};

// 38 beds, hand-authored. Initial census (cross-checked in the header
// comment): 4W 8 occ + 2 dc + 1 cleaning + 2 avail + 1 blocked = 14;
// 5T 6 occ + 1 dc + 1 cleaning + 2 avail = 10; MICU 6 occ + 2 avail = 8;
// OBS 3 occ + 1 cleaning + 2 avail = 6.
// prettier-ignore
const INITIAL_BEDS: Bed[] = [
  // --- 4 West: rooms 401–406 semi-private A/B, 407–408 private -------------
  {id: '4w-401a', unitId: '4W', label: '401-A', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'H. Vance', note: 'LOS 3d'},
  {id: '4w-401b', unitId: '4W', label: '401-B', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'C. Amado', note: 'LOS 1d'},
  {id: '4w-402a', unitId: '4W', label: '402-A', isPrivate: false, telemetry: false, negPressure: false, state: 'dc-pending', occupant: 'L. Petrov', note: 'DC order 14:00 · ride pending'},
  {id: '4w-402b', unitId: '4W', label: '402-B', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'M. Duarte', note: 'LOS 5d'},
  {id: '4w-403a', unitId: '4W', label: '403-A', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'J. Okon', note: 'LOS 2d'},
  {id: '4w-403b', unitId: '4W', label: '403-B', isPrivate: false, telemetry: false, negPressure: false, state: 'available', occupant: null, note: 'Clean 12:40'},
  {id: '4w-404a', unitId: '4W', label: '404-A', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'R. Feld', note: 'LOS 4d'},
  {id: '4w-404b', unitId: '4W', label: '404-B', isPrivate: false, telemetry: false, negPressure: false, state: 'blocked', occupant: null, note: 'Facilities · HVAC fault'},
  {id: '4w-405a', unitId: '4W', label: '405-A', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'S. Ngata', note: 'LOS 1d'},
  {id: '4w-405b', unitId: '4W', label: '405-B', isPrivate: false, telemetry: false, negPressure: false, state: 'cleaning', occupant: null, note: 'EVS started 13:10'},
  {id: '4w-406a', unitId: '4W', label: '406-A', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'B. Corr', note: 'LOS 6d'},
  {id: '4w-406b', unitId: '4W', label: '406-B', isPrivate: false, telemetry: false, negPressure: false, state: 'dc-pending', occupant: 'A. Slate', note: 'DC order 11:30 · awaiting PT'},
  {id: '4w-407',  unitId: '4W', label: '407',   isPrivate: true,  telemetry: false, negPressure: false, state: 'available', occupant: null, note: 'Clean 09:55'},
  {id: '4w-408',  unitId: '4W', label: '408',   isPrivate: true,  telemetry: false, negPressure: false, state: 'occupied', occupant: 'E. Marsh', note: 'Contact iso · LOS 8d'},
  // --- 5 Tower: 501–510, all private telemetry -----------------------------
  {id: '5t-501', unitId: '5T', label: '501', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'G. Havel', note: 'LOS 2d'},
  {id: '5t-502', unitId: '5T', label: '502', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'N. Iwu', note: 'LOS 1d'},
  {id: '5t-503', unitId: '5T', label: '503', isPrivate: true, telemetry: true, negPressure: false, state: 'dc-pending', occupant: 'F. Reyna', note: 'DC order 13:15 · scripts ready'},
  {id: '5t-504', unitId: '5T', label: '504', isPrivate: true, telemetry: true, negPressure: false, state: 'available', occupant: null, note: 'Clean 12:05'},
  {id: '5t-505', unitId: '5T', label: '505', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'K. Brandt', note: 'LOS 3d'},
  {id: '5t-506', unitId: '5T', label: '506', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'O. Sesay', note: 'LOS 2d'},
  {id: '5t-507', unitId: '5T', label: '507', isPrivate: true, telemetry: true, negPressure: false, state: 'cleaning', occupant: null, note: 'EVS started 12:48'},
  {id: '5t-508', unitId: '5T', label: '508', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'D. Quill', note: 'LOS 4d'},
  {id: '5t-509', unitId: '5T', label: '509', isPrivate: true, telemetry: true, negPressure: false, state: 'available', occupant: null, note: 'Clean 11:20'},
  {id: '5t-510', unitId: '5T', label: '510', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'P. Anand', note: 'LOS 1d'},
  // --- MICU-2: 201–208, all private tele; 204/205 negative pressure --------
  {id: 'micu-201', unitId: 'MICU', label: '201', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'T. Ibarra', note: 'Vent · LOS 5d'},
  {id: 'micu-202', unitId: 'MICU', label: '202', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'W. Cho', note: 'LOS 2d'},
  {id: 'micu-203', unitId: 'MICU', label: '203', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'V. Roan', note: 'CRRT · LOS 3d'},
  {id: 'micu-204', unitId: 'MICU', label: '204', isPrivate: true, telemetry: true, negPressure: true, state: 'available', occupant: null, note: 'Neg-pressure verified 10:30'},
  {id: 'micu-205', unitId: 'MICU', label: '205', isPrivate: true, telemetry: true, negPressure: true, state: 'occupied', occupant: 'Y. Toure', note: 'Airborne iso · LOS 2d'},
  {id: 'micu-206', unitId: 'MICU', label: '206', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'Z. Kellen', note: 'LOS 1d'},
  {id: 'micu-207', unitId: 'MICU', label: '207', isPrivate: true, telemetry: true, negPressure: false, state: 'occupied', occupant: 'I. Faro', note: 'LOS 6d'},
  {id: 'micu-208', unitId: 'MICU', label: '208', isPrivate: true, telemetry: true, negPressure: false, state: 'available', occupant: null, note: 'Clean 13:02'},
  // --- Observation: open bays, no isolation capability ----------------------
  {id: 'obs-1', unitId: 'OBS', label: 'OBS-1', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'U. Pryce', note: 'Obs 9h'},
  {id: 'obs-2', unitId: 'OBS', label: 'OBS-2', isPrivate: false, telemetry: false, negPressure: false, state: 'available', occupant: null, note: 'Clean 12:15'},
  {id: 'obs-3', unitId: 'OBS', label: 'OBS-3', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'Q. Salas', note: 'Obs 14h'},
  {id: 'obs-4', unitId: 'OBS', label: 'OBS-4', isPrivate: false, telemetry: false, negPressure: false, state: 'cleaning', occupant: null, note: 'EVS started 13:22'},
  {id: 'obs-5', unitId: 'OBS', label: 'OBS-5', isPrivate: false, telemetry: false, negPressure: false, state: 'available', occupant: null, note: 'Clean 10:48'},
  {id: 'obs-6', unitId: 'OBS', label: 'OBS-6', isPrivate: false, telemetry: false, negPressure: false, state: 'occupied', occupant: 'X. Marek', note: 'Obs 4h'},
];

// Six pending admits. Boarded hours cross-check:
// 6.4 + 4.1 + 2.8 + 1.2 + 0.9 + 3.6 = 19.0 (the header stat derives live).
const INITIAL_ADMITS: Admit[] = [
  {
    id: 'A-4102',
    patient: 'M. Okafor',
    ageSex: '67F',
    dx: 'CHF exacerbation, BNP 1,840',
    source: 'ED bay 6',
    units: ['5T'],
    telemetry: true,
    isolation: 'none',
    boardedHours: 6.4,
  },
  {
    id: 'A-4096',
    patient: 'D. Reyes',
    ageSex: '54M',
    dx: 'Cellulitis L leg, MRSA history',
    source: 'ED bay 11',
    units: ['4W'],
    telemetry: false,
    isolation: 'contact',
    boardedHours: 4.1,
  },
  {
    id: 'A-4107',
    patient: 'S. Whitfield',
    ageSex: '73M',
    dx: 'Syncope, monitor for arrhythmia',
    source: 'ED bay 2',
    units: ['5T'],
    telemetry: true,
    isolation: 'none',
    boardedHours: 3.6,
  },
  {
    id: 'A-4110',
    patient: 'P. Lindqvist',
    ageSex: '81F',
    dx: 'Pulmonary TB rule-out, cavitary lesion on CT',
    source: 'ED resus 1',
    units: ['MICU'],
    telemetry: true,
    isolation: 'airborne',
    boardedHours: 2.8,
  },
  {
    id: 'A-4114',
    patient: 'R. Chaudhary',
    ageSex: '45M',
    // 57-char wrap stress fixture — exercises two-line dx wrapping on cards.
    dx: 'Neutropenic fever day 9 post-consolidation chemo, ANC 210',
    source: 'Direct — Oncology clinic',
    units: ['4W', '5T'],
    telemetry: false,
    isolation: 'protective',
    boardedHours: 1.2,
  },
  {
    id: 'A-4088',
    patient: 'T. Boone',
    ageSex: '38M',
    dx: 'Post-op lap appendectomy, overnight obs',
    source: 'PACU',
    units: ['4W'],
    telemetry: false,
    isolation: 'none',
    boardedHours: 0.9,
  },
];

// ---------------------------------------------------------------------------
// PLACEMENT RULES — one pure function, quoted verbatim in refusal notices.
// ---------------------------------------------------------------------------

type FitResult = {ok: true} | {ok: false; reason: string};

/**
 * Placement compatibility, checked in triage order. The FIRST failing rule
 * becomes the refusal reason, so notices always name a single concrete fix.
 */
function checkFit(admit: Admit, bed: Bed): FitResult {
  if (bed.state !== 'available') {
    const stateWord: Record<BedState, string> = {
      occupied: 'occupied',
      'dc-pending': 'occupied with a pending discharge',
      cleaning: 'still with EVS',
      blocked: 'blocked by facilities',
      assigned: 'already assigned to an incoming patient',
      available: 'available',
    };
    return {ok: false, reason: `${bed.label} is ${stateWord[bed.state]}.`};
  }
  if (!admit.units.includes(bed.unitId)) {
    return {
      ok: false,
      reason: `${bed.label} is on ${bed.unitId} — ${admit.patient} is accepted for ${admit.units.join(' or ')}.`,
    };
  }
  if (admit.telemetry && !bed.telemetry) {
    return {
      ok: false,
      reason: `${bed.label} has no telemetry — ${admit.patient} requires continuous monitoring.`,
    };
  }
  if (admit.isolation === 'airborne' && !bed.negPressure) {
    return {
      ok: false,
      reason: `${bed.label} is not negative pressure — airborne isolation requires a negative-pressure room.`,
    };
  }
  if (
    (admit.isolation === 'contact' ||
      admit.isolation === 'droplet' ||
      admit.isolation === 'protective') &&
    !bed.isPrivate
  ) {
    return {
      ok: false,
      reason: `${bed.label} is a ${bed.unitId === 'OBS' ? 'shared open bay' : 'semi-private room'} — ${ISOLATION_LABEL[admit.isolation].toLowerCase()} requires a private room.`,
    };
  }
  return {ok: true};
}

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-hospital-bed-flow-command.
// Density grid repeated verbatim: 12px page gutter · 16px unit section gap ·
// 44px unit header · 12px census bar · tiles minmax(96px,1fr)×64 on 8px gaps ·
// 328px rail · 60px stat tiles · 40px hit targets · 2px focus ring offset 2.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.tpl-hospital-bed-flow-command {
  --hbf-accent: ${BRAND_ACCENT};
  --hbf-on-accent: ${BRAND_ON};
  --hbf-accent-tint: ${BRAND_TINT};
  --hbf-dc-text: ${DC_TEXT};
  --hbf-dc-tint: ${DC_TINT};
  --hbf-clean-text: ${CLEAN_TEXT};
  --hbf-clean-tint: ${CLEAN_TINT};
  --hbf-block-text: ${BLOCK_TEXT};
  --hbf-block-tint: ${BLOCK_TINT};
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100%;
  min-height: 0;
}
.tpl-hospital-bed-flow-command *,
.tpl-hospital-bed-flow-command *::before,
.tpl-hospital-bed-flow-command *::after {
  box-sizing: border-box;
}
.tpl-hospital-bed-flow-command button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-hospital-bed-flow-command button:focus-visible {
  outline: 2px solid var(--hbf-accent);
  outline-offset: 2px;
}
.tpl-hospital-bed-flow-command .hbf-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header ------------------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  width: 100%;
}
.tpl-hospital-bed-flow-command .hbf-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-hospital-bed-flow-command .hbf-brand-mark {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--hbf-accent);
  color: var(--hbf-on-accent);
}
.tpl-hospital-bed-flow-command .hbf-brand-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tpl-hospital-bed-flow-command .hbf-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-stats {
  display: flex;
  gap: var(--spacing-2);
  margin-inline-start: auto;
  flex-wrap: wrap;
}
/* 60px stat tiles (density grid). */
.tpl-hospital-bed-flow-command .hbf-stat {
  min-width: 108px;
  height: 60px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.tpl-hospital-bed-flow-command .hbf-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.tpl-hospital-bed-flow-command .hbf-stat-value.is-accent { color: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-stat-value.is-warn { color: var(--hbf-dc-text); }

/* ---- body grid ------------------------------------------------------------
   Hand-rolled minmax(0,1fr)/328px grid (not LayoutPanel) so the <=900px
   restructure — rail reordered ABOVE the floor as a horizontal strip — stays
   a pure CSS media query; a DS panel would pin its width inline. */
.tpl-hospital-bed-flow-command .hbf-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 328px;
  gap: 12px;
  padding: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.tpl-hospital-bed-flow-command .hbf-floor {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-inline-end: 4px;
}
.tpl-hospital-bed-flow-command .hbf-rail {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- unit sections -------------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-unit {
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* 44px unit header row (density grid). */
.tpl-hospital-bed-flow-command .hbf-unit-head {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.tpl-hospital-bed-flow-command .hbf-unit-name {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}
.tpl-hospital-bed-flow-command .hbf-unit-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-unit-count {
  margin-inline-start: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-unit-count strong {
  color: var(--hbf-accent);
  font-weight: 700;
}

/* 12px segmented census bar (density grid); segments animate width. */
.tpl-hospital-bed-flow-command .hbf-census {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-background-muted);
}
.tpl-hospital-bed-flow-command .hbf-census-seg {
  height: 100%;
  transition: width 240ms ease;
}
.tpl-hospital-bed-flow-command .hbf-census-seg.is-occupied { background: color-mix(in oklab, var(--color-text-secondary) 55%, var(--color-background-muted)); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-dc { background: var(--hbf-dc-text); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-assigned { background: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-cleaning { background: var(--hbf-clean-text); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-blocked { background: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-available { background: color-mix(in oklab, var(--hbf-accent) 22%, var(--color-background-muted)); }
.tpl-hospital-bed-flow-command .hbf-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tpl-hospital-bed-flow-command .hbf-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-hospital-bed-flow-command .hbf-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

/* ---- bed tiles: minmax(96px,1fr) × 64px on an 8px grid gap ---------------- */
.tpl-hospital-bed-flow-command .hbf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}
.tpl-hospital-bed-flow-command .hbf-tile {
  position: relative;
  height: 64px;
  padding: 6px 8px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: border-color 160ms ease, background-color 160ms ease, opacity 160ms ease;
}
.tpl-hospital-bed-flow-command .hbf-tile-top {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.tpl-hospital-bed-flow-command .hbf-tile-id {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-tile-caps {
  margin-inline-start: auto;
  display: inline-flex;
  gap: 3px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-tile-caps svg { display: block; }
.tpl-hospital-bed-flow-command .hbf-tile-sub {
  font-size: 11px;
  line-height: 1.25;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* State coats. Occupied stays quiet; everything actionable gets a hue. */
.tpl-hospital-bed-flow-command .hbf-tile.is-occupied { background: var(--color-background-muted); }
.tpl-hospital-bed-flow-command .hbf-tile.is-occupied .hbf-tile-id { color: var(--color-text-secondary); }
.tpl-hospital-bed-flow-command .hbf-tile.is-dc-pending { background: var(--hbf-dc-tint); border-color: color-mix(in srgb, var(--hbf-dc-text) 45%, var(--color-border)); }
.tpl-hospital-bed-flow-command .hbf-tile.is-dc-pending .hbf-tile-sub { color: var(--hbf-dc-text); }
.tpl-hospital-bed-flow-command .hbf-tile.is-cleaning { background: var(--hbf-clean-tint); border-color: color-mix(in srgb, var(--hbf-clean-text) 45%, var(--color-border)); }
.tpl-hospital-bed-flow-command .hbf-tile.is-cleaning .hbf-tile-sub { color: var(--hbf-clean-text); }
.tpl-hospital-bed-flow-command .hbf-tile.is-blocked { background: var(--hbf-block-tint); border-color: color-mix(in srgb, var(--hbf-block-text) 45%, var(--color-border)); cursor: not-allowed; }
.tpl-hospital-bed-flow-command .hbf-tile.is-blocked .hbf-tile-sub { color: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-tile.is-available { background: var(--hbf-accent-tint); border-color: color-mix(in srgb, var(--hbf-accent) 45%, var(--color-border)); }
.tpl-hospital-bed-flow-command .hbf-tile.is-available .hbf-tile-sub { color: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned { background: var(--hbf-accent); border-color: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned .hbf-tile-id,
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned .hbf-tile-sub,
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned .hbf-tile-caps { color: var(--hbf-on-accent); }
/* Armed-admit targeting: compatible beds pulse, the rest recede. */
.tpl-hospital-bed-flow-command .hbf-tile.is-target {
  border-color: var(--hbf-accent);
  box-shadow: 0 0 0 1px var(--hbf-accent);
  animation: hbf-target-pulse 1.4s ease-in-out infinite;
}
.tpl-hospital-bed-flow-command .hbf-tile.is-dim { opacity: 0.45; }
.tpl-hospital-bed-flow-command .hbf-tile.is-refused {
  border-color: var(--hbf-block-text);
  box-shadow: 0 0 0 1px var(--hbf-block-text);
  animation: hbf-refuse-shake 320ms ease;
}
@keyframes hbf-target-pulse {
  0%, 100% { box-shadow: 0 0 0 1px var(--hbf-accent); }
  50% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--hbf-accent) 55%, transparent); }
}
@keyframes hbf-refuse-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
@media (hover: hover) {
  .tpl-hospital-bed-flow-command .hbf-tile:not(.is-blocked):hover {
    border-color: color-mix(in srgb, var(--color-text-primary) 35%, var(--color-border));
  }
  .tpl-hospital-bed-flow-command .hbf-tile.is-target:hover {
    border-color: var(--hbf-accent);
    background: color-mix(in srgb, var(--hbf-accent) 22%, var(--color-background-body));
  }
}

/* ---- pending-admit rail ---------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-rail-head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}
.tpl-hospital-bed-flow-command .hbf-rail-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
}
.tpl-hospital-bed-flow-command .hbf-rail-sum {
  margin-inline-start: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-admit {
  width: 100%;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.tpl-hospital-bed-flow-command .hbf-admit.is-armed {
  border-color: var(--hbf-accent);
  background: var(--hbf-accent-tint);
  box-shadow: 0 0 0 1px var(--hbf-accent);
}
@media (hover: hover) {
  .tpl-hospital-bed-flow-command .hbf-admit:hover {
    border-color: color-mix(in srgb, var(--color-text-primary) 35%, var(--color-border));
  }
}
.tpl-hospital-bed-flow-command .hbf-admit-top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tpl-hospital-bed-flow-command .hbf-admit-name {
  font-size: 13px;
  font-weight: 600;
}
.tpl-hospital-bed-flow-command .hbf-admit-agesex {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-hospital-bed-flow-command .hbf-board-chip {
  margin-inline-start: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Boarding-age ramp: >=4h amber, >=6h red (thresholds in BOARDING_WARN/CRIT). */
.tpl-hospital-bed-flow-command .hbf-board-chip.is-warn { background: var(--hbf-dc-tint); color: var(--hbf-dc-text); }
.tpl-hospital-bed-flow-command .hbf-board-chip.is-crit { background: var(--hbf-block-tint); color: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-admit-dx {
  font-size: 12px;
  line-height: 1.35;
  color: var(--color-text-primary);
}
.tpl-hospital-bed-flow-command .hbf-admit-src {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-needs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tpl-hospital-bed-flow-command .hbf-need {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-need.is-iso { border-color: color-mix(in srgb, var(--hbf-block-text) 45%, var(--color-border)); color: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-admit-hint {
  font-size: 11px;
  font-weight: 600;
  color: var(--hbf-accent);
}

/* ---- notice + shift log ----------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
}
.tpl-hospital-bed-flow-command .hbf-notice.is-refusal {
  background: var(--hbf-block-tint);
  color: var(--hbf-block-text);
  border: var(--border-width) solid color-mix(in srgb, var(--hbf-block-text) 45%, var(--color-border));
}
.tpl-hospital-bed-flow-command .hbf-notice.is-info {
  background: var(--hbf-accent-tint);
  color: var(--hbf-accent);
  border: var(--border-width) solid color-mix(in srgb, var(--hbf-accent) 45%, var(--color-border));
}
.tpl-hospital-bed-flow-command .hbf-notice-dismiss {
  margin-inline-start: auto;
  flex: none;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: inherit;
}
.tpl-hospital-bed-flow-command .hbf-log {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tpl-hospital-bed-flow-command .hbf-log-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0;
}
.tpl-hospital-bed-flow-command .hbf-log-row {
  font-size: 12px;
  line-height: 1.35;
  color: var(--color-text-secondary);
  display: flex;
  gap: 6px;
}
.tpl-hospital-bed-flow-command .hbf-log-row::before {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hbf-accent);
  margin-top: 5px;
}
.tpl-hospital-bed-flow-command .hbf-log-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ---- responsive: subtraction + reorder, never a squeeze ---------------------- */
@media (max-width: 900px) {
  .tpl-hospital-bed-flow-command .hbf-body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    overflow-y: auto;
  }
  .tpl-hospital-bed-flow-command .hbf-rail {
    order: -1;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }
  .tpl-hospital-bed-flow-command .hbf-rail-head,
  .tpl-hospital-bed-flow-command .hbf-notice,
  .tpl-hospital-bed-flow-command .hbf-log { flex: none; }
  .tpl-hospital-bed-flow-command .hbf-admit { min-width: 280px; max-width: 280px; }
  .tpl-hospital-bed-flow-command .hbf-log { min-width: 260px; }
  .tpl-hospital-bed-flow-command .hbf-floor { overflow-y: visible; }
}
@media (max-width: 560px) {
  .tpl-hospital-bed-flow-command .hbf-brand-sub { display: none; }
  .tpl-hospital-bed-flow-command .hbf-stats { margin-inline-start: 0; width: 100%; }
  .tpl-hospital-bed-flow-command .hbf-stat { flex: 1 1 40%; min-width: 0; }
  .tpl-hospital-bed-flow-command .hbf-grid { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); }
  .tpl-hospital-bed-flow-command .hbf-admit { min-width: 252px; max-width: 252px; }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-hospital-bed-flow-command .hbf-tile.is-target,
  .tpl-hospital-bed-flow-command .hbf-tile.is-refused { animation: none; }
  .tpl-hospital-bed-flow-command .hbf-tile,
  .tpl-hospital-bed-flow-command .hbf-admit,
  .tpl-hospital-bed-flow-command .hbf-census-seg { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// PRESENTATIONAL PIECES — all state lifts to the page owner below.
// ---------------------------------------------------------------------------

/** Wardline mark: a bed silhouette reduced to a headboard + rail glyph. */
function BrandMark() {
  return (
    <span className="hbf-brand-mark" aria-hidden>
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path
          d="M2 3v10M2 9h12M14 13V9M4.5 9V6.5A1.5 1.5 0 0 1 6 5h4a3 3 0 0 1 3 3v1"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const CENSUS_SEGMENTS: Array<{state: BedState; label: string}> = [
  {state: 'occupied', label: 'Occupied'},
  {state: 'dc-pending', label: 'DC pending'},
  {state: 'assigned', label: 'Assigned'},
  {state: 'cleaning', label: 'Cleaning'},
  {state: 'blocked', label: 'Blocked'},
  {state: 'available', label: 'Available'},
];

const LEGEND_DOT_BG: Record<BedState, string> = {
  occupied: 'color-mix(in oklab, var(--color-text-secondary) 55%, var(--color-background-muted))',
  'dc-pending': 'var(--hbf-dc-text)',
  assigned: 'var(--hbf-accent)',
  cleaning: 'var(--hbf-clean-text)',
  blocked: 'var(--hbf-block-text)',
  available: 'color-mix(in oklab, var(--hbf-accent) 22%, var(--color-background-muted))',
};

/**
 * 12px segmented census bar + count legend. Widths are percentages of the
 * unit's bed count, so an assignment visibly re-segments the bar.
 */
function CensusBar({unitBeds}: {unitBeds: Bed[]}) {
  const counts = new Map<BedState, number>();
  for (const bed of unitBeds) {
    counts.set(bed.state, (counts.get(bed.state) ?? 0) + 1);
  }
  const total = unitBeds.length;
  const summary = CENSUS_SEGMENTS.filter(seg => (counts.get(seg.state) ?? 0) > 0)
    .map(seg => `${counts.get(seg.state)} ${seg.label.toLowerCase()}`)
    .join(', ');
  return (
    <>
      <div
        className="hbf-census"
        role="img"
        aria-label={`Census: ${summary} of ${total} beds`}>
        {CENSUS_SEGMENTS.map(seg => {
          const count = counts.get(seg.state) ?? 0;
          return count > 0 ? (
            <div
              key={seg.state}
              className={`hbf-census-seg is-${seg.state}`}
              style={{width: `${(count / total) * 100}%`}}
            />
          ) : null;
        })}
      </div>
      <div className="hbf-legend" aria-hidden>
        {CENSUS_SEGMENTS.map(seg => {
          const count = counts.get(seg.state) ?? 0;
          return count > 0 ? (
            <span key={seg.state} className="hbf-legend-item">
              <span
                className="hbf-legend-dot"
                style={{background: LEGEND_DOT_BG[seg.state]}}
              />
              {seg.label} {count}
            </span>
          ) : null;
        })}
      </div>
    </>
  );
}

const STATE_WORD: Record<BedState, string> = {
  occupied: 'occupied',
  'dc-pending': 'discharge pending — tap to complete discharge',
  cleaning: 'with EVS — tap to mark clean',
  available: 'available',
  blocked: 'blocked',
  assigned: 'assigned to incoming — tap to release',
};

/**
 * One bed tile: real <button>, 64px, state-coated, capability glyphs at the
 * top-right (door = private, activity = telemetry, fan = negative pressure).
 * Targeting classes come from the page owner while an admit is armed.
 */
function BedTile({
  bed,
  targeting,
  isRefused,
  onActivate,
}: {
  bed: Bed;
  targeting: 'target' | 'dim' | null;
  isRefused: boolean;
  onActivate: (bed: Bed) => void;
}) {
  const sub =
    bed.state === 'available' || bed.state === 'cleaning' || bed.state === 'blocked'
      ? bed.note
      : bed.occupant != null
        ? `${bed.occupant}${bed.state === 'dc-pending' ? ' · DC' : ''}`
        : bed.note;
  const ariaLabel = `Bed ${bed.label}, ${bed.unitId}, ${STATE_WORD[bed.state]}${
    targeting === 'target' ? ' — compatible with the armed admit, tap to assign' : ''
  }`;
  return (
    <button
      type="button"
      className={[
        'hbf-tile',
        `is-${bed.state}`,
        targeting === 'target' ? 'is-target' : '',
        targeting === 'dim' ? 'is-dim' : '',
        isRefused ? 'is-refused' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onClick={() => onActivate(bed)}>
      <span className="hbf-tile-top">
        <span className="hbf-tile-id">{bed.label}</span>
        <span className="hbf-tile-caps">
          {bed.negPressure ? <Icon icon={FanIcon} size="xsm" color="inherit" /> : null}
          {bed.telemetry ? <Icon icon={ActivityIcon} size="xsm" color="inherit" /> : null}
          {bed.isPrivate ? <Icon icon={DoorClosedIcon} size="xsm" color="inherit" /> : null}
        </span>
      </span>
      <span className="hbf-tile-sub">{sub}</span>
    </button>
  );
}

const BOARDING_WARN = 4; // hours — chip goes amber
const BOARDING_CRIT = 6; // hours — chip goes red

/** One pending-admit card: real <button>; arming is aria-pressed. */
function AdmitCard({
  admit,
  isArmed,
  onToggle,
}: {
  admit: Admit;
  isArmed: boolean;
  onToggle: (admit: Admit) => void;
}) {
  const chipClass =
    admit.boardedHours >= BOARDING_CRIT
      ? 'hbf-board-chip is-crit'
      : admit.boardedHours >= BOARDING_WARN
        ? 'hbf-board-chip is-warn'
        : 'hbf-board-chip';
  return (
    <button
      type="button"
      className={`hbf-admit${isArmed ? ' is-armed' : ''}`}
      aria-pressed={isArmed}
      aria-label={`${admit.patient}, ${admit.ageSex}, ${admit.dx}. Needs ${admit.units.join(
        ' or ',
      )}${admit.telemetry ? ', telemetry' : ''}, ${ISOLATION_LABEL[
        admit.isolation
      ].toLowerCase()}. Boarding ${admit.boardedHours.toFixed(1)} hours. ${
        isArmed ? 'Armed — pick a highlighted bed, or tap again to cancel.' : 'Tap to arm for assignment.'
      }`}
      onClick={() => onToggle(admit)}>
      <span className="hbf-admit-top">
        <span className="hbf-admit-name">{admit.patient}</span>
        <span className="hbf-admit-agesex">{admit.ageSex}</span>
        <span className={chipClass}>{admit.boardedHours.toFixed(1)} h</span>
      </span>
      <span className="hbf-admit-dx">{admit.dx}</span>
      <span className="hbf-admit-src">
        {admit.id} · {admit.source}
      </span>
      <span className="hbf-needs" aria-hidden>
        <span className="hbf-need">{admit.units.join(' / ')}</span>
        {admit.telemetry ? (
          <span className="hbf-need">
            <Icon icon={ActivityIcon} size="xsm" color="inherit" />
            TELE
          </span>
        ) : null}
        {admit.isolation !== 'none' ? (
          <span className="hbf-need is-iso">
            <Icon
              icon={admit.isolation === 'airborne' ? WindIcon : ShieldIcon}
              size="xsm"
              color="inherit"
            />
            {ISOLATION_LABEL[admit.isolation]}
          </span>
        ) : null}
      </span>
      {isArmed ? (
        <span className="hbf-admit-hint">
          Assign mode — tap a highlighted bed. Esc or tap again to cancel.
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. Assign / refuse / discharge / clean /
// release all mutate `beds` + `admits` here, so census bars, stat tiles,
// tile coats, the notice, the log, and the live region re-derive together.
// ---------------------------------------------------------------------------

interface Notice {
  kind: 'refusal' | 'info';
  text: string;
}

export default function HospitalBedFlowCommand() {
  const [beds, setBeds] = useState<Bed[]>(INITIAL_BEDS);
  const [admits, setAdmits] = useState<Admit[]>(INITIAL_ADMITS);
  /** Admit ids that have landed in a bed (bed id recorded for release/undo). */
  const [placements, setPlacements] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [armedAdmitId, setArmedAdmitId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [refusedBedId, setRefusedBedId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  const armedAdmit = armedAdmitId != null
    ? admits.find(admit => admit.id === armedAdmitId) ?? null
    : null;

  // ---- derived stats (live from the row sets — never captions) ----
  const pendingAdmits = useMemo(
    () => admits.filter(admit => !placements.has(admit.id)),
    [admits, placements],
  );
  const boardingHours = pendingAdmits.reduce(
    (sum, admit) => sum + admit.boardedHours,
    0,
  );
  const availableCount = beds.filter(bed => bed.state === 'available').length;
  const inUseCount = beds.filter(
    bed =>
      bed.state === 'occupied' ||
      bed.state === 'dc-pending' ||
      bed.state === 'assigned',
  ).length;
  const occupancyPct = Math.round((inUseCount / beds.length) * 100);

  /** Compatibility verdict per bed while an admit is armed (else null). */
  const targetingByBed = useMemo(() => {
    if (armedAdmit == null) {
      return null;
    }
    const map = new Map<string, 'target' | 'dim'>();
    for (const bed of beds) {
      map.set(bed.id, checkFit(armedAdmit, bed).ok ? 'target' : 'dim');
    }
    return map;
  }, [armedAdmit, beds]);

  const pushLog = (entry: string) => {
    setLog(prev => [entry, ...prev].slice(0, 6));
  };

  const say = (text: string) => {
    setAnnouncement(text);
  };

  // ---- interactions ----
  const toggleArm = (admit: Admit) => {
    setNotice(null);
    setRefusedBedId(null);
    if (armedAdmitId === admit.id) {
      setArmedAdmitId(null);
      say(`Assignment cancelled for ${admit.patient}.`);
      return;
    }
    setArmedAdmitId(admit.id);
    const targets = beds.filter(bed => checkFit(admit, bed).ok);
    say(
      targets.length > 0
        ? `${admit.patient} armed. ${targets.length} compatible bed${
            targets.length === 1 ? '' : 's'
          }: ${targets.map(bed => bed.label).join(', ')}.`
        : `${admit.patient} armed, but no compatible bed is open right now.`,
    );
  };

  const assign = (admit: Admit, bed: Bed) => {
    setBeds(prev =>
      prev.map(entry =>
        entry.id === bed.id
          ? {
              ...entry,
              state: 'assigned' as const,
              occupant: admit.patient,
              note: `Incoming · ${admit.id}`,
            }
          : entry,
      ),
    );
    setPlacements(prev => {
      const next = new Map(prev);
      next.set(admit.id, bed.id);
      return next;
    });
    setArmedAdmitId(null);
    setRefusedBedId(null);
    setNotice({
      kind: 'info',
      text: `${admit.patient} assigned to ${bed.label} (${bed.unitId}). Boarding clock stopped at ${admit.boardedHours.toFixed(1)} h.`,
    });
    pushLog(`Assigned ${admit.patient} (${admit.id}) → ${bed.label} ${bed.unitId}`);
    say(
      `${admit.patient} assigned to bed ${bed.label} on ${bed.unitId}. ${bed.unitId} census updated.`,
    );
  };

  const refuse = (admit: Admit, bed: Bed, reason: string) => {
    setNotice({kind: 'refusal', text: `Refused: ${reason}`});
    setRefusedBedId(bed.id);
    say(`Refused. ${reason}`);
  };

  const release = (bed: Bed) => {
    let releasedId: string | null = null;
    for (const [admitId, bedId] of placements) {
      if (bedId === bed.id) {
        releasedId = admitId;
      }
    }
    const admit = admits.find(entry => entry.id === releasedId) ?? null;
    setBeds(prev =>
      prev.map(entry =>
        entry.id === bed.id
          ? {...entry, state: 'available' as const, occupant: null, note: 'Held clean'}
          : entry,
      ),
    );
    if (releasedId != null) {
      setPlacements(prev => {
        const next = new Map(prev);
        next.delete(releasedId);
        return next;
      });
    }
    const who = admit?.patient ?? 'incoming patient';
    setNotice({
      kind: 'info',
      text: `${bed.label} released — ${who} returned to the pending queue.`,
    });
    pushLog(`Released ${bed.label} — ${who} back to queue`);
    say(`Bed ${bed.label} released. ${who} is pending again.`);
  };

  const completeDischarge = (bed: Bed) => {
    setBeds(prev =>
      prev.map(entry =>
        entry.id === bed.id
          ? {
              ...entry,
              state: 'cleaning' as const,
              occupant: null,
              note: 'EVS requested',
            }
          : entry,
      ),
    );
    pushLog(`Discharged ${bed.occupant ?? 'patient'} from ${bed.label} — EVS requested`);
    say(`Discharge complete in ${bed.label}. Bed sent to EVS.`);
  };

  const markClean = (bed: Bed) => {
    setBeds(prev =>
      prev.map(entry =>
        entry.id === bed.id
          ? {...entry, state: 'available' as const, occupant: null, note: 'Just cleaned'}
          : entry,
      ),
    );
    pushLog(`${bed.label} cleaned — now available`);
    say(`Bed ${bed.label} is clean and available.`);
  };

  const handleBedActivate = (bed: Bed) => {
    setRefusedBedId(null);
    if (armedAdmit != null) {
      const fit = checkFit(armedAdmit, bed);
      if (fit.ok) {
        assign(armedAdmit, bed);
      } else {
        refuse(armedAdmit, bed, fit.reason);
      }
      return;
    }
    switch (bed.state) {
      case 'dc-pending':
        completeDischarge(bed);
        break;
      case 'cleaning':
        markClean(bed);
        break;
      case 'assigned':
        release(bed);
        break;
      case 'available':
        say(`Bed ${bed.label} is available. Arm a pending admit to assign it.`);
        break;
      case 'blocked':
        say(`Bed ${bed.label} is blocked: ${bed.note ?? 'facilities hold'}.`);
        break;
      default:
        say(
          `Bed ${bed.label} is occupied by ${bed.occupant ?? 'a patient'} (${
            bed.note ?? 'no note'
          }).`,
        );
        break;
    }
  };

  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && armedAdmitId != null) {
      event.stopPropagation();
      setArmedAdmitId(null);
      say('Assignment cancelled.');
    }
  };

  // ---- render ----
  return (
    <div
      className="tpl-hospital-bed-flow-command"
      onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="hbf-head">
              <div className="hbf-brand">
                <BrandMark />
                <div>
                  <h1 className="hbf-brand-name" style={{margin: 0}}>
                    Wardline · St. Alder Regional
                  </h1>
                  <div className="hbf-brand-sub">
                    Bed flow command · Day shift · 38 staffed beds
                  </div>
                </div>
              </div>
              <div className="hbf-stats">
                <div className="hbf-stat">
                  <span className="hbf-stat-label">Available beds</span>
                  <span className="hbf-stat-value is-accent">{availableCount}</span>
                </div>
                <div className="hbf-stat">
                  <span className="hbf-stat-label">Pending admits</span>
                  <span className="hbf-stat-value">{pendingAdmits.length}</span>
                </div>
                <div className="hbf-stat">
                  <span className="hbf-stat-label">Boarding hrs</span>
                  <span
                    className={`hbf-stat-value${boardingHours >= 12 ? ' is-warn' : ''}`}>
                    {boardingHours.toFixed(1)}
                  </span>
                </div>
                <div className="hbf-stat">
                  <span className="hbf-stat-label">Occupancy</span>
                  <span className="hbf-stat-value">{occupancyPct}%</span>
                </div>
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="Bed flow command">
            <div aria-live="polite" className="hbf-vh">
              {announcement}
            </div>
            <div className="hbf-body">
              {/* Unit floor */}
              <div className="hbf-floor" aria-label="Unit floor">
                {UNITS.map(unit => {
                  const unitBeds = beds.filter(bed => bed.unitId === unit.id);
                  const open = unitBeds.filter(
                    bed => bed.state === 'available',
                  ).length;
                  return (
                    <section key={unit.id} className="hbf-unit">
                      <div className="hbf-unit-head">
                        <h2 className="hbf-unit-name">{unit.name}</h2>
                        <span className="hbf-unit-desc">{unit.descriptor}</span>
                        <span className="hbf-unit-count">
                          <strong>{open}</strong> open · {unitBeds.length} beds
                        </span>
                      </div>
                      <CensusBar unitBeds={unitBeds} />
                      <div className="hbf-grid">
                        {unitBeds.map(bed => (
                          <BedTile
                            key={bed.id}
                            bed={bed}
                            targeting={targetingByBed?.get(bed.id) ?? null}
                            isRefused={refusedBedId === bed.id}
                            onActivate={handleBedActivate}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Pending-admit rail */}
              <div className="hbf-rail" aria-label="Pending admits">
                <div className="hbf-rail-head">
                  <Icon icon={ClipboardListIcon} size="sm" color="secondary" />
                  <h2 className="hbf-rail-title">Pending admits</h2>
                  <span className="hbf-rail-sum">
                    {pendingAdmits.length} waiting · {boardingHours.toFixed(1)} h
                  </span>
                </div>

                {notice != null ? (
                  <div
                    className={`hbf-notice is-${notice.kind}`}
                    role={notice.kind === 'refusal' ? 'alert' : undefined}>
                    <Icon
                      icon={notice.kind === 'refusal' ? XIcon : BedDoubleIcon}
                      size="sm"
                      color="inherit"
                    />
                    <span style={{flex: 1}}>{notice.text}</span>
                    <button
                      type="button"
                      className="hbf-notice-dismiss"
                      aria-label="Dismiss notice"
                      onClick={() => {
                        setNotice(null);
                        setRefusedBedId(null);
                      }}>
                      <Icon icon={XIcon} size="xsm" color="inherit" />
                    </button>
                  </div>
                ) : null}

                {pendingAdmits.length === 0 ? (
                  <div className="hbf-log">
                    <p className="hbf-log-title">Queue clear</p>
                    <span className="hbf-log-empty">
                      Every pending admit has a bed. Boarding clock at 0.0 h.
                    </span>
                  </div>
                ) : (
                  pendingAdmits.map(admit => (
                    <AdmitCard
                      key={admit.id}
                      admit={admit}
                      isArmed={armedAdmitId === admit.id}
                      onToggle={toggleArm}
                    />
                  ))
                )}

                <div className="hbf-log">
                  <p className="hbf-log-title">Shift log</p>
                  {log.length === 0 ? (
                    <span className="hbf-log-empty">
                      No moves yet this session. Tap a discharge-pending or
                      cleaning tile to advance it; arm an admit to assign a bed.
                    </span>
                  ) : (
                    log.map((entry, index) => (
                      <span key={`${entry}-${index}`} className="hbf-log-row">
                        {entry}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
