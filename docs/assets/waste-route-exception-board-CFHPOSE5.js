var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Haulcheck dispatch picture for
 *   Barlow Heights Thursday residential routes on Thu Jul 9 2026 with a
 *   FIXED board clock at 13:05 (785 min). Six trucks, hand-checked ledger
 *   at first render (served = progress pointer minus open exceptions at or
 *   before it):
 *     T-41 R-112 Kestrel Hills      82 stops · progress 63 · exc {34,55} → served 61
 *     T-38 R-108 Old Mill north     76 stops · progress 76 · none        → served 76 ✓ complete
 *     T-52 R-115 Fairground loop    88 stops · progress 50 · exc {12,29,41} → served 47
 *     T-19 R-103 Cannery flats      71 stops · progress 59 · exc {22}    → served 58
 *     T-44 R-119 Hillside terraces  93 stops · progress 40 · exc {18}    → served 39
 *     T-27 R-121 Riverbend court    64 stops · progress 55 · none        → served 55
 *   ⇒ served 61+76+47+58+39+55 = 336 of 474 stops = 70.9% ≈ 71% addressed ·
 *   7 open exceptions · 2 notices queued. Projected finishes vs the 16:30
 *   route cutoff (990): T-38 finished 12:41; T-41 15:40, T-52 16:25, T-19
 *   15:05, T-27 14:50 on pace; T-44 16:55 past cutoff → "4 on pace · 1
 *   complete · 1 past cutoff". Each Return-&-serve adds exactly +6 min to
 *   that truck's finish, so resolving a T-52 exception by return moves
 *   16:25 → 16:31 and flips T-52 past the cutoff — an engineered
 *   consequence. Resolution stamps follow 13:05 + 4·k for the k-th
 *   resolution. No clock reads, no randomness, no timers, no network
 *   assets.
 * @output Haulcheck — Waste Route Exception Board: a sanitation dispatch
 *   surface for one service day. A 56px brand header (bin-check mark, day
 *   title, live addressed-% / open-exception / notice / cutoff chips) over
 *   per-truck route strips (84px each: a 224px truck cell with driver +
 *   pace chip, a full-width stop-tick band — served ticks, pending ticks,
 *   amber notice ticks, and tappable exception diamonds — and a 96px stat
 *   cell with addressed % and projected finish), then a wrap grid of open
 *   exception cards (custom bin-glyph per type: blocked, not-out,
 *   contamination, overflow, damaged, missed). The 400px resolution rail
 *   owns the selected exception: full narrative, a REQUIRED proof picker
 *   (driver photo / supervisor verification / resident call log — photo
 *   disabled when none on file), the two resolution paths, the
 *   resident-notice queue, and the session resolution log with undo.
 *   Signature move: resolving with proof clears the strip's diamond into a
 *   served or notice tick, re-derives the truck's addressed % and
 *   projected finish (+6 min on returns — which can push a route past the
 *   16:30 cutoff and flip its pace chip), bumps the day's addressed
 *   counter, appends to the notice queue when a notice is left, logs the
 *   stamped resolution, and announces politely — all in one render.
 * @position Page template; emitted by \`astryx template waste-route-exception-board\`
 *
 * Frame: root 100dvh div > Layout height="fill". Header | content grid:
 *   minmax(0,1fr) work column (route strips block, then the open-exception
 *   card grid, one shared scroll) + 400px resolution rail (own scroll).
 *   The rail is the only editing surface; strips and cards are two
 *   synchronized views of the same selection.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): 1fr + 400
 *   grid → the work column gets ≈645px and each band ≈270px; ticks are
 *   flex:1 cells with a 1px floor (93 ticks + gaps ≈ 185px), so 64–93
 *   stops always fit without scroll. Cards wrap at min 240px.
 * - <= 980px: the grid stacks — strips, cards, then the rail full-width.
 * - <= 640px (390px embed): truck cells keep id + pace chip only and
 *   narrow to 120px, the stat cell keeps just its % (subtraction, not
 *   squeeze), tick gaps collapse to 0 so 93 stops still fit a 390px band,
 *   cards go single-column, rail buttons go full-width.
 * Container policy: work-surface archetype — strips, one card grid (the
 *   exception queue is genuinely card-shaped: photo count, narrative,
 *   glyph), and one rail. Exception diamonds in the band are real
 *   <button>s but only ~8px wide, which is compensated: every exception
 *   also has a >=40px card and every mutation lives on 40px rail buttons.
 *   All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Haulcheck
 *   olive): light-dark(#556B2F, #B8C255) — #556B2F on #FFFFFF ≈ 6.0:1,
 *   #B8C255 on ~#1C1C1E ≈ 8.8:1 — used for the mark, served ticks, and
 *   selected rings. State pairs with math at the declaration: complete/on
 *   pace green light-dark(#15803D, #4ADE80) (≈5.0:1 / ≈9.6:1), notice
 *   amber light-dark(#B45309, #FBBF24) (≈4.7:1 / ≈10.1:1), exception red
 *   light-dark(#DC2626, #F87171) (≈4.5:1 / ≈7.2:1). Tints are ≤16% alpha
 *   washes under text that keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · route strips 84
 *   (truck cell 224 · tick band 36 · stat cell 96) · exception cards min
 *   240 wide · rail 400 · notice rows 44 · log rows 44 · action buttons
 *   40 · chips 22 · proof options 40. TYPE: 15/600 rail titles · 13/400–500
 *   primary · 11/500 overlines + chips; tabular-nums on every count, %,
 *   and time.
 * Fixture policy: one ordered resolution log \`Array<{excId, action, proof,
 *   stamp}>\` is the single state owner; stop-tick states, per-truck served
 *   counts and finishes, day aggregates, the notice queue, the card grid,
 *   and the rail all re-derive from fixtures + resolutions every render,
 *   so no aggregate can drift from the ticks. Undo pops the last entry.
 */

import {useMemo, useState} from 'react';

import {
  CameraIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  FlagIcon,
  MailIcon,
  PhoneIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  TimerIcon,
  TriangleAlertIcon,
  UndoIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-waste-route-exception-board';

// THE quarantined Haulcheck brand olive. #556B2F on #FFFFFF ≈ 6.0:1 (passes
// 4.5:1 for the 11–13px chip text it colors); #B8C255 on a ~#1C1C1E dark
// surface ≈ 8.8:1. Served ticks, the mark, selection rings.
const BRAND = 'light-dark(#556B2F, #B8C255)';
// Text/glyph ON a solid brand fill (mark check): #FFFFFF on #556B2F ≈ 6.0:1;
// #22270D on #B8C255 ≈ 7.4:1 (white on #B8C255 would fail at ~1.7:1).
const BRAND_ON = 'light-dark(#FFFFFF, #22270D)';
// Brand wash for selected cards/chips — a ≤14% tint; overlaid text uses
// BRAND or text tokens, which carry their own ratios.
const BRAND_TINT = 'light-dark(rgba(85, 107, 47, 0.10), rgba(184, 194, 85, 0.14))';
// Complete / on-pace green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Notice amber: #B45309 on #FFFFFF ≈ 4.7:1; #FBBF24 on #1C1C1E ≈ 10.1:1.
const NOTICE = 'light-dark(#B45309, #FBBF24)';
const NOTICE_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';
// Exception / past-cutoff red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on #1C1C1E ≈ 7.2:1.
const EXC = 'light-dark(#DC2626, #F87171)';
const EXC_TINT = 'light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.14))';

// ---------------------------------------------------------------------------
// TIME MODEL — minutes after midnight, all fixed. The board clock is 13:05.
// ---------------------------------------------------------------------------

/** Fixed board clock: 13:05 = 785 min. */
const NOW_MIN = 785;
/** Route cutoff — trucks must clear their routes by 16:30 = 990 min. */
const CUTOFF_MIN = 990;
/** Each Return-&-serve detour adds exactly 6 min to the truck's finish. */
const RETURN_PENALTY_MIN = 6;
/** The k-th resolution this session stamps 13:05 + 4·k. */
const RESOLUTION_CADENCE_MIN = 4;

function fmtClock(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
}

// ---------------------------------------------------------------------------
// FIXTURES — trucks, open exceptions, seeded notices. Served counts derive
// from a progress pointer minus the open exception stops at or before it
// (arithmetic hand-checked in the @input header).
// ---------------------------------------------------------------------------

interface TruckFixture {
  id: string;
  route: string;
  area: string;
  driver: string;
  stops: number;
  /** Last stop index the truck has passed (1-based, inclusive). */
  progress: number;
  /** Projected finish at first render, minutes after midnight. */
  projFinishMin: number;
}

const DAY = {
  district: 'Barlow Heights · Thursday residential',
  date: 'Thu Jul 9, 2026',
  depot: 'Transfer Station 3, Gate B',
};

const TRUCKS: TruckFixture[] = [
  {id: 'T-41', route: 'R-112', area: 'Kestrel Hills', driver: 'M. Duarte', stops: 82, progress: 63, projFinishMin: 940}, // 15:40
  {id: 'T-38', route: 'R-108', area: 'Old Mill north', driver: 'J. Okonkwo', stops: 76, progress: 76, projFinishMin: 761}, // finished 12:41
  {id: 'T-52', route: 'R-115', area: 'Fairground loop', driver: 'P. Lindqvist', stops: 88, progress: 50, projFinishMin: 985}, // 16:25
  {id: 'T-19', route: 'R-103', area: 'Cannery flats', driver: 'S. Whitcomb', stops: 71, progress: 59, projFinishMin: 905}, // 15:05
  {id: 'T-44', route: 'R-119', area: 'Hillside terraces', driver: 'A. Benally', stops: 93, progress: 40, projFinishMin: 1015}, // 16:55 — past cutoff
  {id: 'T-27', route: 'R-121', area: 'Riverbend court', driver: 'L. Fontaine', stops: 64, progress: 55, projFinishMin: 890}, // 14:50
];

const TRUCK_BY_ID = new Map(TRUCKS.map(truck => [truck.id, truck]));

type ExceptionType =
  | 'blocked'
  | 'notout'
  | 'contamination'
  | 'overflow'
  | 'damaged'
  | 'missed';

interface ExceptionFixture {
  id: string;
  truckId: string;
  /** 1-based stop index on the truck's route. */
  stop: number;
  type: ExceptionType;
  address: string;
  narrative: string;
  reportedMin: number;
  /** Driver photos on file — gates the photo proof option. */
  photos: number;
}

const EXCEPTIONS: ExceptionFixture[] = [
  {
    id: 'E-01',
    truckId: 'T-41',
    stop: 34,
    type: 'blocked',
    address: '1418 Kestrel Wy',
    narrative:
      'Cart enclosure blocked by a parked silver sedan; driver could not stage the arm. Two photos on file show plate and clearance.',
    reportedMin: 552, // 09:12
    photos: 2,
  },
  {
    id: 'E-02',
    truckId: 'T-41',
    stop: 55,
    type: 'notout',
    address: '902 Larkspur Ct',
    narrative:
      'Cart not at curb at pass (10:44). Resident called 311 at 10:41 claiming set-out by 06:30; one drive-by photo on file shows empty curb.',
    reportedMin: 644, // 10:44
    photos: 1,
  },
  {
    id: 'E-03',
    truckId: 'T-52',
    stop: 12,
    type: 'contamination',
    address: '77 Fairground Rd',
    narrative:
      'Recycling cart roughly 40% plastic film plus a garden hose wrapped around the paper load. Left unserviced per contamination policy.',
    reportedMin: 511, // 08:31
    photos: 2,
  },
  {
    id: 'E-04',
    truckId: 'T-52',
    stop: 29,
    type: 'overflow',
    address: '310 Midway Ave',
    narrative:
      'Lid open past 60° with three extra bags stacked beside the cart. Third overflow at this address this cycle.',
    reportedMin: 598, // 09:58
    photos: 1,
  },
  {
    id: 'E-05',
    truckId: 'T-52',
    stop: 41,
    type: 'damaged',
    address: '5 Carousel Ln',
    narrative:
      'Cracked lid hinge and a missing rear wheel — cart tips on the lift cycle. Driver skipped the tip to avoid a spill; no photo taken.',
    reportedMin: 637, // 10:37
    photos: 0,
  },
  {
    id: 'E-06',
    truckId: 'T-19',
    stop: 22,
    type: 'blocked',
    address: '66 Cannery Row W',
    narrative:
      'Construction dumpster from the mill renovation is parked across the alley enclosure. GC contact posted on the fence; photo on file.',
    reportedMin: 675, // 11:15
    photos: 1,
  },
  {
    id: 'E-07',
    truckId: 'T-44',
    stop: 18,
    // Stress fixture: 49-char address exercises card + rail truncation.
    type: 'missed',
    address: '2201 Terrace View Dr, Bldg C rear alley (shared)',
    narrative:
      'Route deviation around the Terrace View water-main dig skipped stops 16–19 on the first pass; stop 18 confirmed missed by the resident and the supervisor drive-back.',
    reportedMin: 740, // 12:20
    photos: 0,
  },
];

const EXCEPTION_BY_ID = new Map(EXCEPTIONS.map(exc => [exc.id, exc]));

const TYPE_META: Record<ExceptionType, {label: string; noticeTemplate: string}> = {
  blocked: {label: 'Blocked bin', noticeTemplate: 'Access blocked — reschedule card'},
  notout: {label: 'Cart not out', noticeTemplate: 'Cart not out — courtesy card'},
  contamination: {
    label: 'Contaminated cart',
    noticeTemplate: 'Contamination — education mailer',
  },
  overflow: {label: 'Overflowing cart', noticeTemplate: 'Overflow — extra-bag fee notice'},
  damaged: {label: 'Damaged cart', noticeTemplate: 'Damaged cart — replacement order'},
  missed: {label: 'Missed pickup', noticeTemplate: 'Missed pickup — make-up day card'},
};

/** Notices already queued before this session. */
const SEED_NOTICES = [
  {
    id: 'N-01',
    address: '445 Alder St',
    template: 'Cart not out — courtesy card',
    filed: '08:12 · T-27',
  },
  {
    id: 'N-02',
    address: '12 Quarry Rd',
    template: 'Contamination — education mailer',
    filed: '09:05 · T-38',
  },
];

// ---------------------------------------------------------------------------
// DERIVATION — one ordered resolution log is the single state owner.
// ---------------------------------------------------------------------------

type ProofKind = 'photo' | 'supervisor' | 'resident-call';

const PROOF_LABELS: Record<ProofKind, string> = {
  photo: 'Driver photo',
  supervisor: 'Supervisor verification',
  'resident-call': 'Resident call log',
};

interface Resolution {
  excId: string;
  action: 'return' | 'notice';
  proof: ProofKind;
  stamp: number;
}

type StopState = 'served' | 'pending' | 'exception' | 'notice';

interface TruckDerived {
  truck: TruckFixture;
  stopStates: StopState[];
  served: number;
  noticed: number;
  addressed: number;
  addressedPct: number;
  openExceptions: ExceptionFixture[];
  finishMin: number;
  pace: 'complete' | 'onpace' | 'pastcutoff';
}

function deriveTruck(truck: TruckFixture, resolutions: Resolution[]): TruckDerived {
  const resolutionByExc = new Map(resolutions.map(res => [res.excId, res]));
  const excByStop = new Map<number, ExceptionFixture>();
  for (const exc of EXCEPTIONS) {
    if (exc.truckId === truck.id) {
      excByStop.set(exc.stop, exc);
    }
  }
  const stopStates: StopState[] = [];
  const openExceptions: ExceptionFixture[] = [];
  let served = 0;
  let noticed = 0;
  let returns = 0;
  for (let stop = 1; stop <= truck.stops; stop++) {
    const exc = excByStop.get(stop);
    if (exc != null) {
      const res = resolutionByExc.get(exc.id);
      if (res == null) {
        stopStates.push('exception');
        openExceptions.push(exc);
      } else if (res.action === 'return') {
        stopStates.push('served');
        served++;
        returns++;
      } else {
        stopStates.push('notice');
        noticed++;
      }
      continue;
    }
    if (stop <= truck.progress) {
      stopStates.push('served');
      served++;
    } else {
      stopStates.push('pending');
    }
  }
  const addressed = served + noticed;
  const finishMin = truck.projFinishMin + returns * RETURN_PENALTY_MIN;
  const pace: TruckDerived['pace'] =
    addressed === truck.stops && openExceptions.length === 0
      ? 'complete'
      : finishMin > CUTOFF_MIN
        ? 'pastcutoff'
        : 'onpace';
  return {
    truck,
    stopStates,
    served,
    noticed,
    addressed,
    addressedPct: Math.round((addressed / truck.stops) * 100),
    openExceptions,
    finishMin,
    pace,
  };
}

const PACE_META: Record<TruckDerived['pace'], {label: string; color: string; tint: string}> = {
  complete: {label: 'Complete', color: OK, tint: OK_TINT},
  onpace: {label: 'On pace', color: BRAND, tint: BRAND_TINT},
  pastcutoff: {label: 'Past 16:30 cutoff', color: EXC, tint: EXC_TINT},
};

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector is prefixed with the scope class. The density
// grid repeats verbatim: header 56 · strips 84 (truck cell 224 · band 36 ·
// stat cell 96) · cards min 240 · rail 400 · notice/log rows 44 · buttons 40
// · chips 22 · proof options 40.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  background: var(--color-background-body);
}
.\${SCOPE} .hc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.\${SCOPE} button { font: inherit; color: inherit; }
.\${SCOPE} :is(button, [role='button'], input):focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: 2px;
}
/* ---- header ---------------------------------------------------------------- */
.\${SCOPE} .hc-brandmark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: \${BRAND_TINT};
  flex-shrink: 0;
}
.\${SCOPE} .hc-chiprow { display: flex; align-items: center; gap: var(--spacing-2); flex-wrap: wrap; }
.\${SCOPE} .hc-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.\${SCOPE} .hc-chip[data-tone='brand'] { color: \${BRAND}; background: \${BRAND_TINT}; border-color: transparent; }
.\${SCOPE} .hc-chip[data-tone='ok'] { color: \${OK}; background: \${OK_TINT}; border-color: transparent; }
.\${SCOPE} .hc-chip[data-tone='notice'] { color: \${NOTICE}; background: \${NOTICE_TINT}; border-color: transparent; }
.\${SCOPE} .hc-chip[data-tone='exc'] { color: \${EXC}; background: \${EXC_TINT}; border-color: transparent; }
/* ---- frame: 1fr work column + 400px resolution rail ------------------------ */
.\${SCOPE} .hc-frame {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
}
.\${SCOPE} .hc-work {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  border-right: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .hc-sectionhead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 36px;
  padding: 6px var(--spacing-4) 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* ---- route strips: 84px = truck cell 224 + band + stat cell 96 ------------- */
.\${SCOPE} .hc-strip {
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr) 96px;
  gap: var(--spacing-3);
  align-items: center;
  min-height: 84px;
  padding: 8px var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .hc-truckcell { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.\${SCOPE} .hc-truckline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
}
.\${SCOPE} .hc-truckid { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.\${SCOPE} .hc-truckroute { font-size: 12px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.\${SCOPE} .hc-truckarea {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .hc-pacechip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
/* Tick band: 36px tall; each stop is a flex:1 cell so 64–93 stops always fit. */
.\${SCOPE} .hc-band {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 36px;
  min-width: 0;
}
.\${SCOPE} .hc-tick { flex: 1 1 0; min-width: 1px; border-radius: 1px; }
.\${SCOPE} .hc-tick[data-state='served'] { height: 16px; background: \${BRAND}; opacity: 0.85; }
.\${SCOPE} .hc-tick[data-state='pending'] { height: 8px; background: var(--color-border); }
.\${SCOPE} .hc-tick[data-state='notice'] { height: 16px; background: \${NOTICE}; }
/* Exception diamonds: real buttons, ~10px wide — compensated by the 40px+
   cards and rail buttons (see the container-policy note in the header). */
.\${SCOPE} .hc-tickbtn {
  flex: 1.6 1 0;
  min-width: 8px;
  height: 26px;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.\${SCOPE} .hc-tickbtn svg { display: block; }
.\${SCOPE} .hc-statcell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;
}
.\${SCOPE} .hc-statpct { font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.\${SCOPE} .hc-statsub { font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
/* ---- exception cards: wrap grid, min 240px --------------------------------- */
.\${SCOPE} .hc-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-5);
}
.\${SCOPE} .hc-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  text-align: left;
  cursor: pointer;
  min-height: 40px;
}
.\${SCOPE} .hc-card[aria-pressed='true'] {
  border-color: \${BRAND};
  background: \${BRAND_TINT};
  box-shadow: inset 0 0 0 1px \${BRAND};
}
.\${SCOPE} .hc-cardtop { display: flex; align-items: center; gap: 8px; min-width: 0; }
.\${SCOPE} .hc-cardtype { font-size: 13px; font-weight: 600; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.\${SCOPE} .hc-cardstop { font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
.\${SCOPE} .hc-cardaddress {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .hc-cardmeta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .hc-emptycards {
  padding: var(--spacing-4);
  margin: var(--spacing-3) var(--spacing-4) var(--spacing-5);
  border: var(--border-width) dashed var(--color-border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}
/* ---- resolution rail (400px) ------------------------------------------------ */
.\${SCOPE} .hc-rail {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.\${SCOPE} .hc-railsection { display: flex; flex-direction: column; gap: var(--spacing-2); }
.\${SCOPE} .hc-railtitle { font-size: 15px; font-weight: 600; margin: 0; }
.\${SCOPE} .hc-overline {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .hc-narrative {
  padding: 8px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
/* Proof picker: 40px radio rows; the resolve buttons gate on a selection. */
.\${SCOPE} .hc-proof {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  cursor: pointer;
  font-size: 13px;
}
.\${SCOPE} .hc-proof[data-checked='true'] {
  border-color: \${BRAND};
  background: \${BRAND_TINT};
  box-shadow: inset 0 0 0 1px \${BRAND};
}
.\${SCOPE} .hc-proof[data-disabled='true'] { opacity: 0.5; cursor: not-allowed; }
.\${SCOPE} .hc-proof input { position: absolute; opacity: 0; pointer-events: none; }
.\${SCOPE} .hc-proofmeta { margin-left: auto; font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
.\${SCOPE} .hc-actions { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
/* Notice queue + resolution log: 44px rows. */
.\${SCOPE} .hc-listrow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 4px 8px;
  border-radius: 8px;
}
.\${SCOPE} .hc-listrow + .hc-listrow { margin-top: 2px; }
.\${SCOPE} .hc-listrow[data-fresh='true'] { background: \${NOTICE_TINT}; }
.\${SCOPE} .hc-listbody { min-width: 0; flex: 1; }
.\${SCOPE} .hc-listprimary {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .hc-listmeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .hc-listtrail { font-size: 11px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
/* ---- responsive subtraction -------------------------------------------------- */
@media (max-width: 980px) {
  .\${SCOPE} { height: auto; min-height: 100dvh; }
  .\${SCOPE} .hc-frame { grid-template-columns: minmax(0, 1fr); }
  .\${SCOPE} .hc-work { border-right: none; overflow-y: visible; }
  .\${SCOPE} .hc-rail { border-top: var(--border-width) solid var(--color-border); }
}
@media (max-width: 640px) {
  .\${SCOPE} .hc-strip { grid-template-columns: 120px minmax(0, 1fr) 56px; gap: var(--spacing-2); }
  .\${SCOPE} .hc-truckarea, .\${SCOPE} .hc-truckroute { display: none; }
  .\${SCOPE} .hc-statsub { display: none; }
  .\${SCOPE} .hc-band { gap: 0; }
  .\${SCOPE} .hc-cardgrid { grid-template-columns: minmax(0, 1fr); }
  .\${SCOPE} .hc-actions > * { width: 100%; }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — Haulcheck: a wheeled cart carrying a check.
// ---------------------------------------------------------------------------

function HaulcheckMark() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden focusable="false">
      <path
        d="M 5 6 h 10 l -1.2 8.5 a 1.6 1.6 0 0 1 -1.6 1.4 h -4.4 a 1.6 1.6 0 0 1 -1.6 -1.4 Z"
        fill={BRAND}
      />
      <rect x={4} y={4} width={12} height={2} rx={1} fill={BRAND} />
      <rect x={8} y={2.4} width={4} height={2} rx={1} fill={BRAND} />
      <path
        d="M 7.6 10 l 1.8 1.8 l 3.2 -3.6"
        fill="none"
        stroke={BRAND_ON}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// EXCEPTION GLYPHS — a tiny domain glyph set: one 22×22 cart silhouette with
// per-type overlays (car block, dashed ghost, film ribbon, open lid + bags,
// crack, clock). Currents through \`color\` so cards/rail can tone them.
// ---------------------------------------------------------------------------

function CartBase({ghost = false}: {ghost?: boolean}) {
  return (
    <g
      stroke="currentColor"
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={ghost ? '2.4 2.2' : undefined}>
      <path d="M 6 7.5 h 10 l -1 9 a 1.5 1.5 0 0 1 -1.5 1.3 h -5 a 1.5 1.5 0 0 1 -1.5 -1.3 Z" />
      <path d="M 5 7.5 h 12" />
    </g>
  );
}

function ExceptionGlyph({type}: {type: ExceptionType}) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      aria-hidden
      focusable="false"
      style={{flexShrink: 0}}>
      {type === 'notout' ? <CartBase ghost /> : <CartBase />}
      {type === 'blocked' && (
        <g fill="currentColor">
          {/* Car silhouette nosing across the cart. */}
          <path d="M 1.5 15.5 q 1.2 -2.6 2.6 -2.6 h 3.4 q 1.4 0 2.2 1.6 l 0.6 1 h -8.8 Z" opacity={0.9} />
          <rect x={1} y={15.3} width={10} height={2} rx={1} />
          <circle cx={4} cy={18.4} r={1.3} />
          <circle cx={9} cy={18.4} r={1.3} />
        </g>
      )}
      {type === 'notout' && (
        <path
          d="M 9.2 11 q 1.8 -2.6 3.6 0"
          stroke="currentColor"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {type === 'contamination' && (
        <g>
          {/* Film ribbon snagged out of the load. */}
          <path
            d="M 8 7 q 1 -3.4 3 -4.4 q 3 -1.4 3.6 1 q 0.4 1.8 -2.2 2.2"
            stroke="currentColor"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={11} cy={12.6} r={1.1} fill="currentColor" />
          <rect x={10.3} y={9} width={1.4} height={2.4} rx={0.7} fill="currentColor" />
        </g>
      )}
      {type === 'overflow' && (
        <g>
          {/* Lid propped open with bags beside. */}
          <path
            d="M 6 7.5 l 8.6 -3.4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <circle cx={19} cy={15} r={2.2} fill="currentColor" opacity={0.85} />
          <circle cx={18} cy={18.4} r={1.7} fill="currentColor" opacity={0.85} />
        </g>
      )}
      {type === 'damaged' && (
        <path
          d="M 9 7.5 l 1.6 3.2 l -2.4 1.8 l 2.2 3"
          stroke="currentColor"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {type === 'missed' && (
        <g stroke="currentColor" strokeWidth={1.3} fill="none" strokeLinecap="round">
          <circle cx={17} cy={5.4} r={3.4} fill="var(--color-background-body)" />
          <path d="M 17 3.6 v 1.9 l 1.4 0.9" />
        </g>
      )}
    </svg>
  );
}

/** The band's exception diamond (drawn at tick scale). */
function ExceptionDiamond({selected}: {selected: boolean}) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden focusable="false">
      <rect
        x={3.2}
        y={3.2}
        width={7.6}
        height={7.6}
        rx={1.4}
        transform="rotate(45 7 7)"
        fill={EXC}
        stroke={selected ? 'var(--color-text-primary)' : 'transparent'}
        strokeWidth={1.4}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function WasteRouteExceptionBoardTemplate() {
  // THE single state owner: the ordered resolution log. Tick states, truck
  // pace, day aggregates, the card grid, the notice queue, and the rail all
  // re-derive from it every render.
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [selectedExcId, setSelectedExcId] = useState('E-01');
  const [proofByExc, setProofByExc] = useState<Record<string, ProofKind>>({});
  const [announcement, setAnnouncement] = useState('');

  const derived = useMemo(
    () => TRUCKS.map(truck => deriveTruck(truck, resolutions)),
    [resolutions],
  );
  const derivedByTruck = new Map(derived.map(entry => [entry.truck.id, entry]));

  // ---- day aggregates (cross-check: 336/474 = 71% · 7 open · 2 notices ·
  // 4 on pace + 1 complete + 1 past cutoff at first render) ----
  const totalStops = derived.reduce((sum, entry) => sum + entry.truck.stops, 0);
  const totalAddressed = derived.reduce((sum, entry) => sum + entry.addressed, 0);
  const addressedPct = Math.round((totalAddressed / totalStops) * 100);
  const openExceptions = EXCEPTIONS.filter(
    exc => !resolutions.some(res => res.excId === exc.id),
  ).sort((a, b) => a.reportedMin - b.reportedMin);
  const onPaceCount = derived.filter(entry => entry.pace === 'onpace').length;
  const completeCount = derived.filter(entry => entry.pace === 'complete').length;
  const pastCutoffCount = derived.filter(entry => entry.pace === 'pastcutoff').length;

  const noticeQueue = [
    ...SEED_NOTICES.map(notice => ({...notice, fresh: false})),
    ...resolutions
      .filter(res => res.action === 'notice')
      .map(res => {
        const exc = EXCEPTION_BY_ID.get(res.excId);
        return {
          id: \`N-\${res.excId}\`,
          address: exc?.address ?? '—',
          template: exc != null ? TYPE_META[exc.type].noticeTemplate : '—',
          filed: \`\${fmtClock(res.stamp)} · \${exc?.truckId ?? '—'}\`,
          fresh: true,
        };
      }),
  ];

  const selectedExc = EXCEPTION_BY_ID.get(selectedExcId);
  const selectedResolution = resolutions.find(res => res.excId === selectedExcId);
  const selectedTruck =
    selectedExc != null ? derivedByTruck.get(selectedExc.truckId) : undefined;
  const currentProof: ProofKind | undefined =
    selectedExc != null
      ? proofByExc[selectedExc.id] ?? (selectedExc.photos > 0 ? 'photo' : undefined)
      : undefined;

  const selectException = (excId: string) => {
    setSelectedExcId(excId);
    const exc = EXCEPTION_BY_ID.get(excId);
    if (exc != null) {
      setAnnouncement(
        \`Selected \${excId} — \${TYPE_META[exc.type].label} at \${exc.address}, \${exc.truckId} stop \${exc.stop}.\`,
      );
    }
  };

  const resolve = (action: 'return' | 'notice') => {
    if (selectedExc == null || selectedResolution != null || currentProof == null) {
      return;
    }
    const exc = selectedExc;
    const proof = currentProof;
    const truckBefore = derivedByTruck.get(exc.truckId);
    setResolutions(prev => [
      ...prev,
      {
        excId: exc.id,
        action,
        proof,
        stamp: NOW_MIN + RESOLUTION_CADENCE_MIN * (prev.length + 1),
      },
    ]);
    // Advance the selection to the next open exception so triage flows.
    const nextOpen = openExceptions.find(entry => entry.id !== exc.id);
    if (nextOpen != null) {
      setSelectedExcId(nextOpen.id);
    }
    if (truckBefore != null) {
      const newAddressed = truckBefore.addressed + 1;
      const newPct = Math.round((newAddressed / truckBefore.truck.stops) * 100);
      if (action === 'return') {
        const newFinish = truckBefore.finishMin + RETURN_PENALTY_MIN;
        setAnnouncement(
          \`\${exc.id} resolved — returned and served with \${PROOF_LABELS[proof].toLowerCase()}. \${exc.truckId} is now \${newPct}% addressed, projected finish \${fmtClock(newFinish)}\${
            newFinish > CUTOFF_MIN ? ' — past the 16:30 cutoff' : ''
          }.\`,
        );
      } else {
        setAnnouncement(
          \`\${exc.id} resolved — notice queued (\${TYPE_META[exc.type].noticeTemplate}). \${exc.truckId} is now \${newPct}% addressed.\`,
        );
      }
    }
  };

  const undoLast = () => {
    const last = resolutions[resolutions.length - 1];
    if (last == null) {
      return;
    }
    setResolutions(prev => prev.slice(0, -1));
    setSelectedExcId(last.excId);
    setAnnouncement(\`Resolution of \${last.excId} undone — exception reopened.\`);
  };

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <div className="hc-vh" aria-live="polite">
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <span className="hc-brandmark">
                <HaulcheckMark />
              </span>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={1}>Haulcheck · Route Exception Board</Heading>
                  <Text type="supporting" size="sm" color="secondary">
                    {DAY.district} · {DAY.date} · {DAY.depot}
                  </Text>
                </VStack>
              </StackItem>
              <div className="hc-chiprow">
                <span className="hc-chip" data-tone="brand">
                  <Icon icon={TimerIcon} size="xsm" color="inherit" />
                  Board clock {fmtClock(NOW_MIN)}
                </span>
                <span className="hc-chip" data-tone="brand">
                  {totalAddressed}/{totalStops} addressed · {addressedPct}%
                </span>
                <span
                  className="hc-chip"
                  data-tone={openExceptions.length > 0 ? 'exc' : 'ok'}>
                  <Icon
                    icon={openExceptions.length > 0 ? TriangleAlertIcon : CheckCircle2Icon}
                    size="xsm"
                    color="inherit"
                  />
                  {openExceptions.length > 0
                    ? \`\${openExceptions.length} open exception\${openExceptions.length === 1 ? '' : 's'}\`
                    : 'Exceptions clear'}
                </span>
                <span className="hc-chip" data-tone="notice">
                  <Icon icon={MailIcon} size="xsm" color="inherit" />
                  {noticeQueue.length} notices queued
                </span>
                <span className="hc-chip" data-tone={pastCutoffCount > 0 ? 'exc' : 'ok'}>
                  <Icon icon={FlagIcon} size="xsm" color="inherit" />
                  {onPaceCount} on pace · {completeCount} complete · {pastCutoffCount} past
                  cutoff
                </span>
              </div>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="Route exception board">
            <div className="hc-frame">
              {/* -------- work column: strips + exception cards -------- */}
              <div className="hc-work">
                <div className="hc-sectionhead">
                  Route strips · stop ticks · cutoff {fmtClock(CUTOFF_MIN)}
                </div>
                {derived.map(entry => {
                  const pace = PACE_META[entry.pace];
                  return (
                    <div className="hc-strip" key={entry.truck.id}>
                      <div className="hc-truckcell">
                        <span className="hc-truckline">
                          <span className="hc-truckid">{entry.truck.id}</span>
                          <span className="hc-truckroute">
                            {entry.truck.route} · {entry.truck.area}
                          </span>
                        </span>
                        <span className="hc-truckarea">{entry.truck.driver}</span>
                        <span
                          className="hc-pacechip"
                          style={{color: pace.color, background: pace.tint}}>
                          {pace.label}
                          {entry.pace !== 'complete' && \` · \${fmtClock(entry.finishMin)}\`}
                        </span>
                      </div>
                      <div
                        className="hc-band"
                        role="group"
                        aria-label={\`\${entry.truck.id} stop ticks: \${entry.served} served, \${entry.noticed} noticed, \${entry.openExceptions.length} open exceptions, \${
                          entry.truck.stops - entry.addressed - entry.openExceptions.length
                        } pending of \${entry.truck.stops}\`}>
                        {entry.stopStates.map((state, index) => {
                          const stopNo = index + 1;
                          if (state === 'exception') {
                            const exc = entry.openExceptions.find(
                              candidate => candidate.stop === stopNo,
                            );
                            if (exc != null) {
                              return (
                                <button
                                  key={stopNo}
                                  type="button"
                                  className="hc-tickbtn"
                                  aria-pressed={exc.id === selectedExcId}
                                  aria-label={\`\${exc.id} — \${TYPE_META[exc.type].label} at stop \${stopNo}, \${exc.address}\`}
                                  onClick={() => selectException(exc.id)}>
                                  <ExceptionDiamond selected={exc.id === selectedExcId} />
                                </button>
                              );
                            }
                          }
                          return (
                            <span
                              key={stopNo}
                              className="hc-tick"
                              data-state={state}
                              aria-hidden
                            />
                          );
                        })}
                      </div>
                      <div className="hc-statcell">
                        <span className="hc-statpct">{entry.addressedPct}%</span>
                        <span className="hc-statsub">
                          {entry.served}/{entry.truck.stops} served
                        </span>
                        <span className="hc-statsub">
                          {entry.pace === 'complete'
                            ? \`done \${fmtClock(entry.finishMin)}\`
                            : \`finish \${fmtClock(entry.finishMin)}\`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="hc-sectionhead">
                  Open exceptions · oldest first · {openExceptions.length}
                </div>
                {openExceptions.length === 0 ? (
                  <div className="hc-emptycards">
                    All exceptions resolved — {noticeQueue.length} notices queued for the
                    Friday mail run. Undo from the resolution log to reopen one.
                  </div>
                ) : (
                  <div className="hc-cardgrid">
                    {openExceptions.map(exc => (
                      <button
                        key={exc.id}
                        type="button"
                        className="hc-card"
                        aria-pressed={exc.id === selectedExcId}
                        onClick={() => selectException(exc.id)}>
                        <span className="hc-cardtop">
                          <span style={{color: EXC, display: 'inline-flex'}}>
                            <ExceptionGlyph type={exc.type} />
                          </span>
                          <span className="hc-cardtype">{TYPE_META[exc.type].label}</span>
                          <span className="hc-cardstop">
                            {exc.truckId} · stop {exc.stop}
                          </span>
                        </span>
                        <span className="hc-cardaddress">{exc.address}</span>
                        <span className="hc-cardmeta">
                          <span>{exc.id}</span>
                          <span>reported {fmtClock(exc.reportedMin)}</span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}>
                            <Icon icon={CameraIcon} size="xsm" color="inherit" />
                            {exc.photos}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* -------- resolution rail (400px) -------- */}
              <div className="hc-rail" role="complementary" aria-label="Exception resolution">
                {selectedExc != null ? (
                  <div className="hc-railsection">
                    <span className="hc-overline">
                      {selectedExc.id} · {selectedExc.truckId}{' '}
                      {TRUCK_BY_ID.get(selectedExc.truckId)?.route} · stop {selectedExc.stop}{' '}
                      of {TRUCK_BY_ID.get(selectedExc.truckId)?.stops}
                    </span>
                    <h2 className="hc-railtitle">
                      {TYPE_META[selectedExc.type].label} — {selectedExc.address}
                    </h2>
                    <div className="hc-narrative">{selectedExc.narrative}</div>
                    <div className="hc-chiprow">
                      <span className="hc-chip">
                        reported {fmtClock(selectedExc.reportedMin)}
                      </span>
                      <span className="hc-chip">
                        <Icon icon={CameraIcon} size="xsm" color="inherit" />
                        {selectedExc.photos} photo{selectedExc.photos === 1 ? '' : 's'} on
                        file
                      </span>
                      {selectedTruck != null && (
                        <span
                          className="hc-chip"
                          data-tone={selectedTruck.pace === 'pastcutoff' ? 'exc' : 'brand'}>
                          {selectedExc.truckId} finish {fmtClock(selectedTruck.finishMin)}
                        </span>
                      )}
                    </div>
                    {selectedResolution != null ? (
                      <div className="hc-narrative">
                        Resolved at {fmtClock(selectedResolution.stamp)} —{' '}
                        {selectedResolution.action === 'return'
                          ? 'returned & served'
                          : 'notice queued'}{' '}
                        with {PROOF_LABELS[selectedResolution.proof].toLowerCase()}. Undo
                        from the resolution log to reopen.
                      </div>
                    ) : (
                      <>
                        <span className="hc-overline">Proof — required to resolve</span>
                        {(
                          [
                            ['photo', CameraIcon, selectedExc.photos === 0, selectedExc.photos > 0 ? \`\${selectedExc.photos} on file\` : 'none on file'],
                            ['supervisor', ShieldCheckIcon, false, 'radio S. Ferro'],
                            ['resident-call', PhoneIcon, false, '311 call log'],
                          ] as Array<[ProofKind, typeof CameraIcon, boolean, string]>
                        ).map(([kind, ProofIcon, disabled, meta]) => (
                          <label
                            key={kind}
                            className="hc-proof"
                            data-checked={currentProof === kind}
                            data-disabled={disabled}>
                            <input
                              type="radio"
                              name={\`hc-proof-\${selectedExc.id}\`}
                              checked={currentProof === kind}
                              disabled={disabled}
                              onChange={() =>
                                setProofByExc(prev => ({...prev, [selectedExc.id]: kind}))
                              }
                            />
                            <Icon icon={ProofIcon} size="sm" color="secondary" />
                            {PROOF_LABELS[kind]}
                            <span className="hc-proofmeta">{meta}</span>
                          </label>
                        ))}
                        <div className="hc-actions">
                          <Button
                            label={\`Return & serve · +\${RETURN_PENALTY_MIN} min\`}
                            icon={<Icon icon={RotateCcwIcon} size="sm" />}
                            isDisabled={currentProof == null}
                            onClick={() => resolve('return')}
                          />
                          <Button
                            label={\`Leave notice · \${TYPE_META[selectedExc.type].noticeTemplate.split(' — ')[1] ?? 'card'}\`}
                            variant="secondary"
                            icon={<Icon icon={MailIcon} size="sm" />}
                            isDisabled={currentProof == null}
                            onClick={() => resolve('notice')}
                          />
                        </div>
                        {currentProof == null && (
                          <Text type="supporting" size="sm" color="secondary">
                            Select a proof source to enable resolution — no photo is on
                            file for this exception.
                          </Text>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hc-railsection">
                    <h2 className="hc-railtitle">No exception selected</h2>
                    <Text type="supporting" size="sm" color="secondary">
                      Pick a diamond on a route strip or an exception card to triage it.
                    </Text>
                  </div>
                )}
                <div className="hc-railsection">
                  <span className="hc-overline">
                    Resident notice queue · mails Fri Jul 10
                  </span>
                  {noticeQueue.map(notice => (
                    <div className="hc-listrow" key={notice.id} data-fresh={notice.fresh}>
                      <Icon icon={MailIcon} size="sm" color="secondary" />
                      <div className="hc-listbody">
                        <div className="hc-listprimary">{notice.template}</div>
                        <div className="hc-listmeta">{notice.address}</div>
                      </div>
                      <span className="hc-listtrail">{notice.filed}</span>
                    </div>
                  ))}
                </div>
                <div className="hc-railsection">
                  <span className="hc-overline">Resolution log · this session</span>
                  {resolutions.length === 0 ? (
                    <Text type="supporting" size="sm" color="secondary">
                      Nothing resolved yet. Resolutions stamp {fmtClock(NOW_MIN)} + 4 min
                      each and land here with their proof source.
                    </Text>
                  ) : (
                    <>
                      {resolutions.map(res => {
                        const exc = EXCEPTION_BY_ID.get(res.excId);
                        return (
                          <div className="hc-listrow" key={res.excId}>
                            <Icon icon={ClipboardCheckIcon} size="sm" color="secondary" />
                            <div className="hc-listbody">
                              <div className="hc-listprimary">
                                {res.excId} ·{' '}
                                {res.action === 'return'
                                  ? 'Returned & served'
                                  : 'Notice queued'}
                              </div>
                              <div className="hc-listmeta">
                                {exc?.address} · proof: {PROOF_LABELS[res.proof]}
                              </div>
                            </div>
                            <span className="hc-listtrail">{fmtClock(res.stamp)}</span>
                          </div>
                        );
                      })}
                      <div className="hc-actions">
                        <Button
                          label="Undo last resolution"
                          variant="ghost"
                          icon={<Icon icon={UndoIcon} size="sm" />}
                          onClick={undoLast}
                        />
                      </div>
                    </>
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
`;export{e as default};