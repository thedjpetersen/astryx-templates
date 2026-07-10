var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Fieldset RFI desk for "Alder &
 *   9th — Phase 2, core & shell" (GC Cordova Builders; the demo's internal
 *   today is Site day 148 · Thu Jul 9, a fixed string). Twelve RFIs
 *   (RFI-206…RFI-232): nine open, three answered at load. Open cost
 *   exposure cross-checked by hand: 84,500 + 62,000 + 18,400 + 9,750 +
 *   4,200 + 7,600 + 3,100 + 12,900 + 0 (RFI-232 pricing TBD) = $202,450.
 *   Per-trade split re-adds to the same total: Concrete 84,500 ·
 *   Curtainwall 62,000 · Mechanical 18,400 · Steel 17,100 (4,200 + 12,900)
 *   · Electrical 9,750 · Plumbing 7,600 · Drywall 3,100 = 202,450 ✓.
 *   Committed changes open at $5,400 (RFI-211, cost accepted). Answer-aging
 *   buckets from the fixed daysOpen set {17, 15, 11, 9, 6, 5, 3, 2, 1}:
 *   0–3 d → 3 · 4–7 d → 2 · 8–14 d → 2 · 15+ d → 2 = 9 open ✓. Scorecard
 *   opens: Atelier KDA 3 open / 2 answered / 5.0 d avg ((4 + 6) / 2);
 *   Meridian Structural 3 / 1 / 9.0; Halvorsen MEP 2 / 0 / —; Cordova
 *   field 1 / 0 / —. Every firm, sheet number, and dollar figure is
 *   invented. No clock reads, no randomness, no timers, no network assets.
 * @output Fieldset — Construction RFI Tracker: a jobsite answer desk.
 *   Header: brick Fieldset mark, project title, fixed site-day readout,
 *   open-count badge. An analytics band of three 168px panels — answer-
 *   aging histogram (four derived bucket bars), cost-exposure rollup
 *   (open total, committed total, seven proportional trade bars), and a
 *   ball-in-court scorecard (per-responder open / answered / avg days).
 *   Below, a status filter row (All / Open / Overdue >10 d / Answered with
 *   derived counts) over the RFI ledger: 68px rows led by a bespoke
 *   drawing-sheet thumbnail whose brick revision cloud is drawn per-RFI
 *   from fixture coordinates by a scalloped-arc path generator, then
 *   subject, sheet/detail reference, trade, responder, a days-open chip
 *   that recolors by aging bucket, exposure dollars, and status. A 372px
 *   detail panel opens the selected RFI: enlarged sheet thumbnail,
 *   question text, proposed response, and the answer composer. Signature
 *   interaction: choose a disposition (no cost / accept cost) and log the
 *   answer → the row flips to Answered, its aging-bucket bar shrinks, open
 *   exposure rolls down (accepted dollars move to Committed), and the
 *   responder's scorecard line updates open/answered/avg in the same
 *   render; Reopen reverses every one of those moves.
 * @position Page template; emitted by \`astryx template construction-rfi-tracker\`
 *
 * Frame: root 100dvh column (scope class tpl-construction-rfi-tracker)
 *   wrapping Layout height="fill"; LayoutHeader is the only DS chrome band.
 *   Content is a hand-rolled grid \`minmax(0,1fr) 372px\` (CSS comment says
 *   why: the detail panel must drop BELOW the ledger at phone widths, which
 *   a fixed DS rail cannot do). The main column owns vertical scroll; the
 *   detail panel scrolls independently at desktop widths.
 *
 * Responsive contract:
 * - Default (stage ~1045px, no media query needed): analytics band is a
 *   three-across grid; ledger rows show thumbnail + two-line main cell +
 *   days chip + exposure + status; detail panel fixed 372px.
 * - <=920px: body collapses to one column (detail panel after the ledger);
 *   analytics band goes 1-across; root height goes auto so the page
 *   scrolls as one document.
 * - <=520px: ledger rows drop the exposure column (subtraction — the
 *   detail panel still shows it), day chips keep 24px height, filter chips
 *   wrap; all interactive rows stay ≥44px tall.
 * - Nothing scrolls horizontally at any width.
 *
 * Container policy (ledger + rail archetype): frame-first rows and panels;
 *   no Cards. Analytics panels are bordered tiles with derived SVG/div
 *   bars; ledger rows are full-width <button>s (aria-pressed selection);
 *   the composer is real buttons with one primary action. Sheet thumbnails
 *   are inline SVG scenery (aria-hidden) beside real text.
 *
 * Color policy: token chrome throughout. ONE quarantined brand accent —
 *   Fieldset brick light-dark(#9A3412, #FF8A5C): #9A3412 on #FFFFFF ≈
 *   7.3:1, #FF8A5C on ~#1C1C1E ≈ 7.3:1 (both clear 4.5:1 text). On-accent
 *   ink light-dark(#FFFFFF, #3B1103): white on #9A3412 ≈ 7.3:1, #3B1103 on
 *   #FF8A5C ≈ 6.9:1. State pairs with math at declaration: overdue/danger
 *   light-dark(#B91C1C, #F87171) ≈ 6.3:1 / 6.6:1, caution light-dark(
 *   #B45309, #FBBF24) ≈ 4.6:1 / 10.9:1 (≥11px weight 600 only), success
 *   light-dark(#15803D, #4ADE80) ≈ 4.8:1 / 9.7:1. Revision clouds and
 *   trade bars reuse the brick accent; sheet linework is border tokens so
 *   thumbnails re-theme free.
 *
 * Density grid (repeated verbatim in CSS comments): analytics panels 168 ·
 *   ledger rows 68 · sheet thumbs 56×42 · detail panel 372 · filter bar 40
 *   · day chips 24 · section bars 34 · gutter var(--spacing-3).
 *   tabular-nums on every dollar, day, and count figure.
 *
 * Fixture policy: one state owner — \`overrides\` (RFI id → 'no-cost' |
 *   'cost' | 'reopened') layered over the base fixture statuses, plus
 *   \`selectedId\`, \`statusFilter\`, and the composer's disposition choice.
 *   Effective status, aging buckets, open/committed dollars, trade bars,
 *   scorecard lines, filter counts, and the ledger sort all re-derive from
 *   the same overlay in the same render; Reopen deletes the override (or
 *   marks a pre-answered RFI reopened) and every surface walks back.
 *   Answering uses the RFI's fixed daysOpen as its response days — the
 *   demo clock never ticks.
 */

import {useMemo, useState} from 'react';

import {
  ArchiveIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  DollarSignIcon,
  FileQuestionIcon,
  HardHatIcon,
  SendIcon,
  TimerIcon,
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
// its contrast math. ONE brand accent (Fieldset brick), quarantined here.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-construction-rfi-tracker';

// THE brand accent. #9A3412 on #FFFFFF ≈ 7.3:1; #FF8A5C on ~#1C1C1E ≈ 7.3:1.
const ACCENT = 'light-dark(#9A3412, #FF8A5C)';
// Ink over an ACCENT fill: #FFFFFF on #9A3412 ≈ 7.3:1; #3B1103 on #FF8A5C ≈
// 6.9:1 (white on #FF8A5C would fail at ≈1.6:1, hence the umber ink).
const ACCENT_ON = 'light-dark(#FFFFFF, #3B1103)';
// Selection / trade-bar wash (graphic only — a 3px accent keyline carries
// the selected state; the wash just warms the row).
const ACCENT_TINT =
  'light-dark(rgba(154, 52, 18, 0.08), rgba(255, 138, 92, 0.14))';
// Overdue / danger: #B91C1C on #FFFFFF ≈ 6.3:1; #F87171 on ~#1C1C1E ≈ 6.6:1.
const DANGER = 'light-dark(#B91C1C, #F87171)';
const DANGER_TINT =
  'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';
// Caution (8–14 d aging chip): #B45309 on #FFFFFF ≈ 4.6:1; #FBBF24 on
// ~#1C1C1E ≈ 10.9:1. Rendered at ≥11px weight 600 only.
const CAUTION = 'light-dark(#B45309, #FBBF24)';
const CAUTION_TINT =
  'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';
// Answered / success: #15803D on #FFFFFF ≈ 4.8:1; #4ADE80 on ~#1C1C1E ≈ 9.7:1.
const SUCCESS = 'light-dark(#15803D, #4ADE80)';
const SUCCESS_TINT =
  'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

/** The demo's internal today — fixed strings, never a real clock. */
const SITE_DAY = 'Site day 148 · Thu Jul 9';

// ---------------------------------------------------------------------------
// RESPONDERS — ball-in-court parties, referenced by identity everywhere.
// ---------------------------------------------------------------------------

interface Responder {
  id: string;
  firm: string;
  role: string;
  short: string;
}

const RESPONDERS: Responder[] = [
  {id: 'kda', firm: 'Atelier KDA', role: 'Architect', short: 'KDA'},
  {id: 'mse', firm: 'Meridian Structural', role: 'EOR', short: 'MSE'},
  {id: 'hve', firm: 'Halvorsen MEP', role: 'Engineer', short: 'HMEP'},
  {id: 'gc', firm: 'Cordova field', role: 'GC', short: 'CDV'},
];

const RESPONDER_BY_ID: Record<string, Responder> = Object.fromEntries(
  RESPONDERS.map(r => [r.id, r]),
);

// ---------------------------------------------------------------------------
// RFIS — twelve rows. \`daysOpen\` doubles as response days once answered
// (the demo clock never ticks). \`cloud\` is the revision-cloud rectangle on
// the sheet thumbnail, in the thumb's 56×42 coordinate space.
// ---------------------------------------------------------------------------

type Disposition = 'no-cost' | 'cost';

interface Rfi {
  id: string;
  subject: string;
  question: string;
  proposedAnswer: string;
  trade: string;
  responderId: string;
  sheet: string;
  detail: string | null;
  daysOpen: number;
  costExposure: number;
  isPricingTbd: boolean;
  scheduleDays: number;
  baseStatus: 'open' | 'answered';
  baseDisposition: Disposition | null;
  cloud: {x: number; y: number; w: number; h: number};
}

const RFIS: Rfi[] = [
  // ----- open at load (nine): exposure sums to $202,450 -----
  {
    id: 'RFI-214',
    subject: 'Rebar congestion at L3 transfer beam TB-3',
    question:
      'Bottom mat #11 bars at TB-3 clash with column verticals at grid C-4. ' +
      'Can we bundle per ACI 318 25.6, or is a redesign required?',
    proposedAnswer:
      'Bundle bottom-mat #11s in pairs per ACI 318 25.6.1.1; maintain 2 in. ' +
      'clear to column verticals. Revised section to follow on S-501 R4.',
    trade: 'Concrete',
    responderId: 'mse',
    sheet: 'S-501',
    detail: '5/S-501',
    daysOpen: 17,
    costExposure: 84_500,
    isPricingTbd: false,
    scheduleDays: 6,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 30, y: 8, w: 18, h: 12},
  },
  {
    id: 'RFI-217',
    subject: 'Curtainwall anchor embed conflicts with PT tendon drape',
    question:
      'Embed plates at L5 slab edge, grids 2–6, land on the PT tendon high ' +
      'points. Shift embeds or re-drape?',
    proposedAnswer:
      'Shift embeds 3 in. north at the flagged grids; tendon drape is not ' +
      'to be modified. Field-verify tendon heads before layout.',
    trade: 'Curtainwall',
    responderId: 'mse',
    sheet: 'S-320',
    detail: null,
    daysOpen: 15,
    costExposure: 62_000,
    isPricingTbd: false,
    scheduleDays: 4,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 6, y: 6, w: 22, h: 10},
  },
  {
    id: 'RFI-221',
    subject: 'Duct main clashes with beam penetration zone, grids 4–5',
    question:
      '30×16 supply main at L2 corridor cannot clear W21 beam web zone D. ' +
      'Acceptable to split into two 16×16 runs?',
    proposedAnswer:
      'Split into twin 16×16 runs through the reinforced web openings shown ' +
      'in 3/S-210; wrap both runs per spec 23 07 13.',
    trade: 'Mechanical',
    responderId: 'hve',
    sheet: 'M-301',
    detail: '3/S-210',
    daysOpen: 11,
    costExposure: 18_400,
    isPricingTbd: false,
    scheduleDays: 2,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 18, y: 16, w: 20, h: 12},
  },
  {
    id: 'RFI-223',
    subject: 'Electrical room clearance vs switchgear pad, NEC 110.26',
    question:
      'Room 108 depth gives 40 in. in front of the gear; NEC 110.26 requires ' +
      '42 in. minimum. Rotate gear or widen room?',
    proposedAnswer:
      'Rotate switchgear 90° per attached sketch SK-E-14; door swing clears. ' +
      'No wall relocation.',
    trade: 'Electrical',
    responderId: 'hve',
    sheet: 'E-104',
    detail: 'SK-E-14',
    daysOpen: 9,
    costExposure: 9_750,
    isPricingTbd: false,
    scheduleDays: 0,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 8, y: 20, w: 16, h: 10},
  },
  {
    id: 'RFI-226',
    subject: 'Stair 2 handrail extension conflicts with door swing',
    question:
      'The 12 in. rail extension at L1 landing intrudes into the door 118A ' +
      'swing. Return the extension to the wall early?',
    proposedAnswer:
      'Return the extension at 8 in. with a 90° wall return; complies with ' +
      'IBC 1014.6 exception 1.',
    trade: 'Steel',
    responderId: 'kda',
    sheet: 'A-402',
    detail: null,
    daysOpen: 6,
    costExposure: 4_200,
    isPricingTbd: false,
    scheduleDays: 0,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 34, y: 18, w: 14, h: 12},
  },
  {
    id: 'RFI-228',
    subject: 'Roof drain overflow routing at parapet, detail 9',
    question:
      'Detail 9/P-202 shows the overflow daylighting through the parapet at ' +
      'the neighbor setback. Confirm discharge location.',
    proposedAnswer:
      'Route overflow to the east scupper per revised 9/P-202; lamb’s ' +
      'tongue at 24 in. above grade.',
    trade: 'Plumbing',
    responderId: 'kda',
    sheet: 'P-202',
    detail: '9/P-202',
    daysOpen: 5,
    costExposure: 7_600,
    isPricingTbd: false,
    scheduleDays: 1,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 10, y: 8, w: 14, h: 10},
  },
  {
    id: 'RFI-230',
    subject: 'Level 2 corridor RCP vs sprinkler main elevation',
    question:
      'Sprinkler main sits 2 in. below the 9′-0″ RCP ceiling at corridor ' +
      'C2. Drop ceiling to 8′-10″ or reroute main?',
    proposedAnswer:
      'Hold 9′-0″; reroute the main through the storage bay per HMEP ' +
      'sketch to follow.',
    trade: 'Drywall',
    responderId: 'kda',
    sheet: 'A-251',
    detail: null,
    daysOpen: 3,
    costExposure: 3_100,
    isPricingTbd: false,
    scheduleDays: 0,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 22, y: 6, w: 24, h: 10},
  },
  {
    id: 'RFI-231',
    subject: 'Fireproofing thickness at W24 girder, UL X772 substitution',
    question:
      'Applied thickness for the W24×76 under UL X772 with the substituted ' +
      'SFRM product: 1-3/8 in. or 1-5/8 in. for 2-hour?',
    proposedAnswer:
      'Use 1-5/8 in. at the W24×76; the substitution letter covers beams ' +
      'W/D ≥ 0.83 only at that thickness.',
    trade: 'Steel',
    responderId: 'mse',
    sheet: 'S-210',
    detail: null,
    daysOpen: 2,
    costExposure: 12_900,
    isPricingTbd: false,
    scheduleDays: 1,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 14, y: 12, w: 18, h: 14},
  },
  {
    // Stress fixture: 111-char subject exercises row and panel truncation;
    // $0 exposure renders as "TBD", and the cost disposition disables.
    id: 'RFI-232',
    subject:
      'Owner-furnished generator pad location vs transformer clearances and fence line — civil/electrical coordination',
    question:
      'The OFCI generator pad per C-110 encroaches on the utility ' +
      'transformer 10 ft clearance and the property fence. Need a ' +
      'coordinated location before the Jul 18 pour.',
    proposedAnswer:
      'Shift pad 6 ft west per civil markup; Cordova to confirm fence ' +
      'easement with the owner before repricing.',
    trade: 'Electrical',
    responderId: 'gc',
    sheet: 'E-002',
    detail: 'C-110',
    daysOpen: 1,
    costExposure: 0,
    isPricingTbd: true,
    scheduleDays: 0,
    baseStatus: 'open',
    baseDisposition: null,
    cloud: {x: 6, y: 14, w: 26, h: 12},
  },
  // ----- answered at load (three) -----
  {
    id: 'RFI-208',
    subject: 'Slab edge dimension discrepancy at grid A',
    question:
      'Plan shows 1′-2″ edge distance at grid A; section shows 1′-4″. ' +
      'Which governs?',
    proposedAnswer: 'Hold 1′-4″ per section 2/S-101; plan corrected in R3.',
    trade: 'Concrete',
    responderId: 'kda',
    sheet: 'S-101',
    detail: '2/S-101',
    daysOpen: 4,
    costExposure: 2_800,
    isPricingTbd: false,
    scheduleDays: 0,
    baseStatus: 'answered',
    baseDisposition: 'no-cost',
    cloud: {x: 12, y: 10, w: 16, h: 10},
  },
  {
    id: 'RFI-211',
    subject: 'CMU control joint spacing at stair core',
    question:
      'Elevations show CJ at 24 ft o.c.; spec 04 22 00 says 20 ft. Confirm ' +
      'spacing at the stair core walls.',
    proposedAnswer:
      'Use 20 ft o.c. per spec; added joint at grid B.5 — cost accepted for ' +
      'the extra joint and sealant.',
    trade: 'Masonry',
    responderId: 'kda',
    sheet: 'A-301',
    detail: null,
    daysOpen: 6,
    costExposure: 5_400,
    isPricingTbd: false,
    scheduleDays: 0,
    baseStatus: 'answered',
    baseDisposition: 'cost',
    cloud: {x: 28, y: 14, w: 16, h: 12},
  },
  {
    id: 'RFI-206',
    subject: 'Elevator divider beam attachment at hoistway',
    question:
      'Divider beam connection per 7/S-410 hits the rail bracket embeds. ' +
      'Acceptable to offset the clip angle?',
    proposedAnswer:
      'Offset clip 2 in. max with (2) additional ¾ in. bolts; see revised ' +
      '7/S-410.',
    trade: 'Steel',
    responderId: 'mse',
    sheet: 'S-410',
    detail: '7/S-410',
    daysOpen: 9,
    costExposure: 6_100,
    isPricingTbd: false,
    scheduleDays: 0,
    baseStatus: 'answered',
    baseDisposition: 'no-cost',
    cloud: {x: 20, y: 18, w: 18, h: 12},
  },
];

// ---------------------------------------------------------------------------
// AGING BUCKETS — derived from effectively-open RFIs only.
// ---------------------------------------------------------------------------

interface AgingBucket {
  id: string;
  label: string;
  min: number;
  max: number; // inclusive; Infinity for the tail
  tone: 'ok' | 'mid' | 'warn' | 'late';
}

const AGING_BUCKETS: AgingBucket[] = [
  {id: 'b0', label: '0–3 d', min: 0, max: 3, tone: 'ok'},
  {id: 'b4', label: '4–7 d', min: 4, max: 7, tone: 'mid'},
  {id: 'b8', label: '8–14 d', min: 8, max: 14, tone: 'warn'},
  {id: 'b15', label: '15+ d', min: 15, max: Infinity, tone: 'late'},
];

const bucketFor = (days: number): AgingBucket =>
  AGING_BUCKETS.find(b => days >= b.min && days <= b.max) ?? AGING_BUCKETS[3];

/** Overdue threshold for the filter and row chips: > 10 days in court. */
const OVERDUE_DAYS = 10;

// ---------------------------------------------------------------------------
// EFFECTIVE-STATE OVERLAY — the single state owner is \`overrides\`:
//   'no-cost' | 'cost'  → answered in this session with that disposition
//   'reopened'          → a base-answered RFI put back in court
// ---------------------------------------------------------------------------

type Override = Disposition | 'reopened';

interface EffectiveRfi {
  rfi: Rfi;
  isOpen: boolean;
  disposition: Disposition | null;
  isOverdue: boolean;
}

function deriveEffective(overrides: Record<string, Override>): EffectiveRfi[] {
  return RFIS.map(rfi => {
    const ov = overrides[rfi.id];
    let isOpen = rfi.baseStatus === 'open';
    let disposition = rfi.baseDisposition;
    if (ov === 'reopened') {
      isOpen = true;
      disposition = null;
    } else if (ov === 'no-cost' || ov === 'cost') {
      isOpen = false;
      disposition = ov;
    }
    return {
      rfi,
      isOpen,
      disposition,
      isOverdue: isOpen && rfi.daysOpen > OVERDUE_DAYS,
    };
  });
}

const formatUsd = (n: number) => \`$\${n.toLocaleString('en-US')}\`;

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector is scoped under .tpl-construction-rfi-tracker.
// Density grid (verbatim): analytics panels 168 · ledger rows 68 · sheet
// thumbs 56×42 · detail panel 372 · filter bar 40 · day chips 24 · section
// bars 34 · gutter var(--spacing-3).
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} .crt-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.\${SCOPE} .crt-btn:disabled { cursor: not-allowed; }
.\${SCOPE} button:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: 2px;
}
.\${SCOPE} .crt-num { font-variant-numeric: tabular-nums; }
.\${SCOPE} .crt-mono { font-family: \${MONO}; }

/* Body: hand-rolled grid instead of LayoutPanel — the 372px detail panel
   must drop BELOW the ledger at phone widths, which a fixed DS rail cannot
   do. Default (stage ~1045px) needs no media query: 1fr + 372. */
.\${SCOPE} .crt-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 372px;
  height: 100%;
  min-height: 0;
}
.\${SCOPE} .crt-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.\${SCOPE} .crt-detail {
  min-height: 0;
  overflow-y: auto;
  border-inline-start: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* ----- analytics band: three 168px panels ----- */
.\${SCOPE} .crt-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-3);
}
.\${SCOPE} .crt-panel {
  min-height: 168px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
}
.\${SCOPE} .crt-panel-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

/* aging histogram: four bucket columns, bars scale to the max count */
.\${SCOPE} .crt-hist {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-2);
  align-items: end;
  min-height: 84px;
}
.\${SCOPE} .crt-hist-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}
.\${SCOPE} .crt-hist-count {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .crt-hist-bar {
  width: 70%;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  background: var(--color-border);
}
.\${SCOPE} .crt-hist-bar.tone-ok { background: \${SUCCESS}; opacity: 0.75; }
.\${SCOPE} .crt-hist-bar.tone-mid { background: var(--color-text-secondary); opacity: 0.55; }
.\${SCOPE} .crt-hist-bar.tone-warn { background: \${CAUTION}; opacity: 0.85; }
.\${SCOPE} .crt-hist-bar.tone-late { background: \${DANGER}; }
.\${SCOPE} .crt-hist-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* exposure rollup: totals + proportional trade bars */
.\${SCOPE} .crt-exp-total {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.\${SCOPE} .crt-exp-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .crt-trade-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 64px;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 16px;
}
.\${SCOPE} .crt-trade-name {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .crt-trade-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.\${SCOPE} .crt-trade-fill {
  height: 100%;
  border-radius: 999px;
  background: \${ACCENT};
}
.\${SCOPE} .crt-trade-amt {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: end;
  white-space: nowrap;
}

/* scorecard mini-table */
.\${SCOPE} .crt-score-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px 62px 58px;
  gap: var(--spacing-1);
  align-items: baseline;
  min-height: 26px;
  font-size: 12px;
}
.\${SCOPE} .crt-score-row.is-head {
  color: var(--color-text-secondary);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  min-height: 18px;
}
.\${SCOPE} .crt-score-firm {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}
.\${SCOPE} .crt-score-firm small {
  font-weight: 400;
  color: var(--color-text-secondary);
}
.\${SCOPE} .crt-score-cell {
  font-variant-numeric: tabular-nums;
  text-align: end;
}
.\${SCOPE} .crt-score-cell.is-late { color: \${DANGER}; font-weight: 600; }

/* ----- filter bar: 40px chip row ----- */
.\${SCOPE} .crt-filters {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .crt-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px; /* 40px+ hit target */
  padding-inline: var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-background-card);
}
@media (hover: hover) {
  .\${SCOPE} .crt-chip:hover { background: var(--color-background-muted); }
}
.\${SCOPE} .crt-chip[aria-pressed='true'] {
  background: \${ACCENT};
  border-color: \${ACCENT};
  color: \${ACCENT_ON};
}
.\${SCOPE} .crt-chip-count {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

/* ----- ledger: 68px rows led by 56×42 sheet thumbs ----- */
.\${SCOPE} .crt-ledger {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  overflow: hidden;
}
.\${SCOPE} .crt-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 76px 96px 92px;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-height: 68px;
  padding-inline: var(--spacing-3);
  padding-block: var(--spacing-2);
  border-bottom: var(--border-width) solid var(--color-border);
  cursor: pointer;
}
.\${SCOPE} .crt-row:last-child { border-bottom: none; }
@media (hover: hover) {
  .\${SCOPE} .crt-row:hover { background: var(--color-background-muted); }
}
.\${SCOPE} .crt-row.is-selected {
  box-shadow: inset 3px 0 0 \${ACCENT};
  background: \${ACCENT_TINT};
}
.\${SCOPE} .crt-row-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .crt-row-subject {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .crt-row-subject .crt-rfi-no {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  color: \${ACCENT};
}
.\${SCOPE} .crt-row-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .crt-day-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-width: 52px;
  padding-inline: var(--spacing-2);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  justify-self: end;
}
.\${SCOPE} .crt-day-chip.tone-ok { color: \${SUCCESS}; background: \${SUCCESS_TINT}; }
.\${SCOPE} .crt-day-chip.tone-mid { color: var(--color-text-secondary); background: var(--color-background-muted); }
.\${SCOPE} .crt-day-chip.tone-warn { color: \${CAUTION}; background: \${CAUTION_TINT}; }
.\${SCOPE} .crt-day-chip.tone-late { color: \${DANGER}; background: \${DANGER_TINT}; }
.\${SCOPE} .crt-day-chip.is-done { color: var(--color-text-secondary); background: transparent; border: var(--border-width) solid var(--color-border); }
.\${SCOPE} .crt-row-exp {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: end;
  white-space: nowrap;
}
.\${SCOPE} .crt-row-exp small {
  display: block;
  font-size: 10px;
  font-weight: 400;
  color: var(--color-text-secondary);
}
.\${SCOPE} .crt-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding-inline: var(--spacing-2);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  justify-self: end;
  white-space: nowrap;
}
.\${SCOPE} .crt-status.is-open { color: \${ACCENT}; background: \${ACCENT_TINT}; }
.\${SCOPE} .crt-status.is-answered { color: \${SUCCESS}; background: \${SUCCESS_TINT}; }
.\${SCOPE} .crt-ledger-empty {
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ----- detail panel ----- */
.\${SCOPE} .crt-detail-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .crt-detail-subject {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
}
.\${SCOPE} .crt-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1) var(--spacing-3);
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .crt-quote {
  margin: 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-inline-start: 3px solid var(--color-border);
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text-primary);
  background: var(--color-background-muted);
  border-radius: 0 6px 6px 0;
}
.\${SCOPE} .crt-quote.is-answer { border-inline-start-color: \${ACCENT}; }
.\${SCOPE} .crt-quote-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}
.\${SCOPE} .crt-dispo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2);
}
.\${SCOPE} .crt-dispo-btn {
  min-height: 44px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-card);
  font-size: 12px;
  font-weight: 600;
  padding: var(--spacing-1) var(--spacing-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
}
@media (hover: hover) {
  .\${SCOPE} .crt-dispo-btn:hover:not(:disabled) { background: var(--color-background-muted); }
}
.\${SCOPE} .crt-dispo-btn[aria-pressed='true'] {
  border-color: \${ACCENT};
  box-shadow: inset 0 0 0 1px \${ACCENT};
  background: \${ACCENT_TINT};
}
.\${SCOPE} .crt-dispo-btn:disabled { opacity: 0.5; }
.\${SCOPE} .crt-dispo-sub {
  font-size: 10px;
  font-weight: 400;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .crt-answered-note {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  border: var(--border-width) solid \${SUCCESS};
  background: \${SUCCESS_TINT};
  border-radius: 6px;
  font-size: 12px;
}
.\${SCOPE} .crt-detail-empty {
  padding: var(--spacing-6) var(--spacing-3);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* live status line above the ledger */
.\${SCOPE} .crt-live {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-height: 16px;
}

/* section bars: 34px */
.\${SCOPE} .crt-section {
  height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .crt-section h2 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin: 0;
}
.\${SCOPE} .crt-section .crt-section-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ----- responsive: subtraction, not squeeze ----- */
@media (max-width: 920px) {
  .\${SCOPE} { height: auto; min-height: 100dvh; }
  .\${SCOPE} .crt-body { grid-template-columns: minmax(0, 1fr); height: auto; }
  .\${SCOPE} .crt-main { overflow-y: visible; }
  .\${SCOPE} .crt-detail {
    border-inline-start: none;
    border-top: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
  .\${SCOPE} .crt-band { grid-template-columns: minmax(0, 1fr); }
  .\${SCOPE} .crt-panel { min-height: 0; }
}
@media (max-width: 520px) {
  /* subtraction: rows drop the exposure column; the detail panel keeps it */
  .\${SCOPE} .crt-row { grid-template-columns: 56px minmax(0, 1fr) 76px 92px; }
  .\${SCOPE} .crt-row-exp { display: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .\${SCOPE} .crt-chip,
  .\${SCOPE} .crt-dispo-btn,
  .\${SCOPE} .crt-row { transition: background-color 140ms ease; }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — Fieldset: a brick tile with a field-book page and cloud dot.
// Tiny inline SVG, never an emoji.
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden focusable="false">
      <rect x={1} y={1} width={20} height={20} rx={5} fill={ACCENT} />
      <rect
        x={5}
        y={4.5}
        width={12}
        height={13}
        rx={1.5}
        fill="none"
        stroke={ACCENT_ON}
        strokeWidth={1.5}
      />
      <line x1={7.5} y1={8} x2={14.5} y2={8} stroke={ACCENT_ON} strokeWidth={1.3} />
      <line x1={7.5} y1={11} x2={14.5} y2={11} stroke={ACCENT_ON} strokeWidth={1.3} />
      <circle cx={13.5} cy={14.5} r={2} fill={ACCENT_ON} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// REVISION CLOUD — scalloped-arc path generator. Clockwise traversal with
// sweep=1 makes every bump bulge outward, exactly like a drafter's cloud.
// Pure math on fixture coordinates: deterministic, identical every render.
// ---------------------------------------------------------------------------

function cloudPath(x: number, y: number, w: number, h: number): string {
  const r = 2.6; // scallop radius in sheet units
  const step = 2 * r;
  let d = \`M \${x} \${y}\`;
  for (let cx = x; cx < x + w - 0.1; cx += step) {
    d += \` A \${r} \${r} 0 0 1 \${Math.min(cx + step, x + w)} \${y}\`;
  }
  for (let cy = y; cy < y + h - 0.1; cy += step) {
    d += \` A \${r} \${r} 0 0 1 \${x + w} \${Math.min(cy + step, y + h)}\`;
  }
  for (let cx = x + w; cx > x + 0.1; cx -= step) {
    d += \` A \${r} \${r} 0 0 1 \${Math.max(cx - step, x)} \${y + h}\`;
  }
  for (let cy = y + h; cy > y + 0.1; cy -= step) {
    d += \` A \${r} \${r} 0 0 1 \${x} \${Math.max(cy - step, y)}\`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// SHEET THUMB — 56×42 drawing-sheet glyph: border + title block + faint
// gridlines in border tokens, plus the RFI's brick revision cloud from its
// fixture rectangle. Scales up in the detail panel (same viewBox). Scenery:
// aria-hidden; the row text carries the sheet reference.
// ---------------------------------------------------------------------------

function SheetThumb({rfi, width = 56}: {rfi: Rfi; width?: number}) {
  return (
    <svg
      width={width}
      height={(width / 56) * 42}
      viewBox="0 0 56 42"
      aria-hidden
      focusable="false">
      <rect
        x={0.75}
        y={0.75}
        width={54.5}
        height={40.5}
        rx={2}
        fill="var(--color-background-muted)"
        stroke="var(--color-border)"
        strokeWidth={1}
      />
      {/* title block strip along the bottom */}
      <line x1={1} y1={35} x2={55} y2={35} stroke="var(--color-border)" strokeWidth={0.8} />
      <line x1={38} y1={35} x2={38} y2={41} stroke="var(--color-border)" strokeWidth={0.8} />
      {/* faint plan linework */}
      <g stroke="var(--color-border)" strokeWidth={0.6} opacity={0.6}>
        <line x1={8} y1={6} x2={8} y2={32} />
        <line x1={24} y1={6} x2={24} y2={32} />
        <line x1={42} y1={6} x2={42} y2={32} />
        <line x1={4} y1={14} x2={52} y2={14} />
        <line x1={4} y1={26} x2={52} y2={26} />
      </g>
      {/* the revision cloud — the reason this RFI exists */}
      <path
        d={cloudPath(rfi.cloud.x, rfi.cloud.y, rfi.cloud.w, rfi.cloud.h)}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AGING HISTOGRAM — four bucket columns; bar heights scale to the largest
// bucket so the answered RFI visibly shrinks its bar. Presentational only.
// ---------------------------------------------------------------------------

function AgingHistogram({counts}: {counts: number[]}) {
  const max = Math.max(1, ...counts);
  return (
    <div
      className="crt-hist"
      role="img"
      aria-label={\`Answer aging: \${AGING_BUCKETS.map(
        (b, i) => \`\${counts[i]} open at \${b.label}\`,
      ).join(', ')}\`}>
      {AGING_BUCKETS.map((bucket, i) => (
        <div className="crt-hist-col" key={bucket.id}>
          <span className="crt-hist-count">{counts[i]}</span>
          <span
            className={\`crt-hist-bar tone-\${bucket.tone}\`}
            style={{height: \`\${Math.round((counts[i] / max) * 64)}px\`}}
          />
          <span className="crt-hist-label">{bucket.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner (\`overrides\`); every region derives per render.
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | 'open' | 'overdue' | 'answered';

export default function ConstructionRfiTrackerTemplate() {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  // Opens on the oldest RFI so the composer and the 15+ d bucket connect
  // visibly on first interaction.
  const [selectedId, setSelectedId] = useState<string | null>('RFI-214');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dispoChoice, setDispoChoice] = useState<Disposition | null>(null);
  const [liveLine, setLiveLine] = useState(
    \`Loaded — 9 open · \${formatUsd(202_450)} exposure · \${SITE_DAY}\`,
  );

  const effective = useMemo(() => deriveEffective(overrides), [overrides]);
  const effectiveById = useMemo(
    () => new Map(effective.map(e => [e.rfi.id, e])),
    [effective],
  );

  const openRows = effective.filter(e => e.isOpen);
  const answeredRows = effective.filter(e => !e.isOpen);
  const overdueCount = effective.filter(e => e.isOverdue).length;

  const agingCounts = AGING_BUCKETS.map(
    b =>
      openRows.filter(
        e => e.rfi.daysOpen >= b.min && e.rfi.daysOpen <= b.max,
      ).length,
  );
  const openExposure = openRows.reduce((sum, e) => sum + e.rfi.costExposure, 0);
  const committed = answeredRows.reduce(
    (sum, e) => sum + (e.disposition === 'cost' ? e.rfi.costExposure : 0),
    0,
  );
  const tbdCount = openRows.filter(e => e.rfi.isPricingTbd).length;

  // Per-trade rollup of open exposure, sorted descending.
  const tradeRollup = useMemo(() => {
    const byTrade = new Map<string, number>();
    for (const e of openRows) {
      byTrade.set(e.rfi.trade, (byTrade.get(e.rfi.trade) ?? 0) + e.rfi.costExposure);
    }
    return [...byTrade.entries()]
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1]);
    // openRows derives from \`effective\`, which is memoized on overrides.
  }, [openRows]);
  const tradeMax = Math.max(1, ...tradeRollup.map(([, amt]) => amt));

  // Ball-in-court scorecard.
  const scorecard = RESPONDERS.map(responder => {
    const mine = effective.filter(e => e.rfi.responderId === responder.id);
    const open = mine.filter(e => e.isOpen);
    const answered = mine.filter(e => !e.isOpen);
    const avg =
      answered.length > 0
        ? answered.reduce((s, e) => s + e.rfi.daysOpen, 0) / answered.length
        : null;
    const worst = open.reduce((m, e) => Math.max(m, e.rfi.daysOpen), 0);
    return {responder, open: open.length, answered: answered.length, avg, worst};
  });

  // Ledger: filtered, open first by days-in-court descending.
  const filtered = effective.filter(e => {
    if (statusFilter === 'open') {
      return e.isOpen;
    }
    if (statusFilter === 'overdue') {
      return e.isOverdue;
    }
    if (statusFilter === 'answered') {
      return !e.isOpen;
    }
    return true;
  });
  const ledgerRows = [
    ...filtered.filter(e => e.isOpen).sort((a, b) => b.rfi.daysOpen - a.rfi.daysOpen),
    ...filtered.filter(e => !e.isOpen).sort((a, b) => b.rfi.daysOpen - a.rfi.daysOpen),
  ];

  const selected = selectedId != null ? (effectiveById.get(selectedId) ?? null) : null;

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
    setDispoChoice(null);
  };

  const handleAnswer = () => {
    if (selected == null || !selected.isOpen || dispoChoice == null) {
      return;
    }
    const {rfi} = selected;
    const next = {...overrides, [rfi.id]: dispoChoice};
    const nextEffective = deriveEffective(next);
    const nextOpenExposure = nextEffective
      .filter(e => e.isOpen)
      .reduce((s, e) => s + e.rfi.costExposure, 0);
    setOverrides(next);
    setDispoChoice(null);
    setLiveLine(
      dispoChoice === 'cost'
        ? \`Answered \${rfi.id} — cost accepted, \${formatUsd(rfi.costExposure)} moved to committed · open exposure now \${formatUsd(nextOpenExposure)}\`
        : \`Answered \${rfi.id} — no cost impact · open exposure now \${formatUsd(nextOpenExposure)}\`,
    );
  };

  const handleReopen = () => {
    if (selected == null || selected.isOpen) {
      return;
    }
    const {rfi} = selected;
    const next = {...overrides};
    if (overrides[rfi.id] === 'no-cost' || overrides[rfi.id] === 'cost') {
      delete next[rfi.id]; // answered this session — walk it back
    } else {
      next[rfi.id] = 'reopened'; // answered in the base fixture
    }
    const nextEffective = deriveEffective(next);
    const nextOpenExposure = nextEffective
      .filter(e => e.isOpen)
      .reduce((s, e) => s + e.rfi.costExposure, 0);
    setOverrides(next);
    setDispoChoice(null);
    setLiveLine(
      \`Reopened \${rfi.id} — back in \${RESPONDER_BY_ID[rfi.responderId].firm}'s court · open exposure now \${formatUsd(nextOpenExposure)}\`,
    );
  };

  const filterDefs: Array<{id: StatusFilter; label: string; count: number}> = [
    {id: 'all', label: 'All', count: effective.length},
    {id: 'open', label: 'Open', count: openRows.length},
    {id: 'overdue', label: \`Overdue >\${OVERDUE_DAYS} d\`, count: overdueCount},
    {id: 'answered', label: 'Answered', count: answeredRows.length},
  ];

  // ----- header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center">
        <BrandMark />
        <Heading level={1}>Fieldset</Heading>
        <Badge label="RFI desk" variant="neutral" />
        <Text type="supporting" color="secondary">
          Alder &amp; 9th — Phase 2, core &amp; shell
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {SITE_DAY}
        </Text>
        {/* Count chip reuses the ledger status-chip anatomy; it recolors
            brick while anything is overdue and green once the court clears. */}
        <span
          className={\`crt-status \${overdueCount > 0 ? 'is-open' : 'is-answered'} crt-num\`}>
          {openRows.length} open
          {overdueCount > 0 ? \` · \${overdueCount} overdue\` : ''}
        </span>
      </HStack>
    </LayoutHeader>
  );

  // ----- analytics band -----
  const analytics = (
    <div className="crt-band">
      <div className="crt-panel">
        <h3 className="crt-panel-title">
          <Icon icon={TimerIcon} size="sm" color="inherit" /> Answer aging ·{' '}
          {openRows.length} open
        </h3>
        <AgingHistogram counts={agingCounts} />
      </div>
      <div className="crt-panel">
        <h3 className="crt-panel-title">
          <Icon icon={DollarSignIcon} size="sm" color="inherit" /> Cost exposure
        </h3>
        <div>
          <div className="crt-exp-total">{formatUsd(openExposure)}</div>
          <div className="crt-exp-sub">
            open potential · {formatUsd(committed)} committed
            {tbdCount > 0 && \` · \${tbdCount} pricing TBD\`}
          </div>
        </div>
        <div>
          {tradeRollup.map(([trade, amt]) => (
            <div className="crt-trade-row" key={trade}>
              <span className="crt-trade-name">{trade}</span>
              <span className="crt-trade-track">
                <span
                  className="crt-trade-fill"
                  style={{
                    display: 'block',
                    width: \`\${Math.max(3, Math.round((amt / tradeMax) * 100))}%\`,
                  }}
                />
              </span>
              <span className="crt-trade-amt">{formatUsd(amt)}</span>
            </div>
          ))}
          {tradeRollup.length === 0 && (
            <Text type="supporting" color="secondary">
              No open exposure — every priced RFI is answered.
            </Text>
          )}
        </div>
      </div>
      <div className="crt-panel">
        <h3 className="crt-panel-title">
          <Icon icon={HardHatIcon} size="sm" color="inherit" /> Ball in court
        </h3>
        <div>
          <div className="crt-score-row is-head">
            <span>Responder</span>
            <span className="crt-score-cell">Open</span>
            <span className="crt-score-cell">Answered</span>
            <span className="crt-score-cell">Avg d</span>
          </div>
          {scorecard.map(({responder, open, answered, avg, worst}) => (
            <div className="crt-score-row" key={responder.id}>
              <span className="crt-score-firm">
                {responder.firm} <small>· {responder.role}</small>
              </span>
              <span
                className={\`crt-score-cell\${worst > OVERDUE_DAYS ? ' is-late' : ''}\`}>
                {open}
              </span>
              <span className="crt-score-cell">{answered}</span>
              <span className="crt-score-cell">
                {avg != null ? avg.toFixed(1) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ----- ledger -----
  const ledger = (
    <div className="crt-ledger">
      {ledgerRows.map(e => {
        const {rfi} = e;
        const responder = RESPONDER_BY_ID[rfi.responderId];
        const bucket = bucketFor(rfi.daysOpen);
        return (
          <button
            key={rfi.id}
            type="button"
            className={\`crt-btn crt-row\${selectedId === rfi.id ? ' is-selected' : ''}\`}
            aria-pressed={selectedId === rfi.id}
            aria-label={\`\${rfi.id}, \${rfi.subject}, \${
              e.isOpen
                ? \`open \${rfi.daysOpen} days with \${responder.firm}\`
                : \`answered in \${rfi.daysOpen} days\`
            }, exposure \${
              rfi.isPricingTbd ? 'to be priced' : formatUsd(rfi.costExposure)
            }\`}
            onClick={() => handleSelect(rfi.id)}>
            <SheetThumb rfi={rfi} />
            <span className="crt-row-main">
              <span className="crt-row-subject">
                <span className="crt-rfi-no">{rfi.id}</span> · {rfi.subject}
              </span>
              <span className="crt-row-meta">
                {rfi.sheet}
                {rfi.detail != null && \` · \${rfi.detail}\`} · {rfi.trade} ·{' '}
                {responder.firm}
                {rfi.scheduleDays > 0 && \` · +\${rfi.scheduleDays} d schedule\`}
              </span>
            </span>
            <span
              className={\`crt-day-chip \${e.isOpen ? \`tone-\${bucket.tone}\` : 'is-done'}\`}>
              {rfi.daysOpen} d
            </span>
            <span className="crt-row-exp">
              {rfi.isPricingTbd && e.isOpen ? (
                <>
                  TBD<small>pricing</small>
                </>
              ) : e.isOpen ? (
                formatUsd(rfi.costExposure)
              ) : e.disposition === 'cost' ? (
                <>
                  {formatUsd(rfi.costExposure)}
                  <small>committed</small>
                </>
              ) : (
                <>
                  $0<small>no cost</small>
                </>
              )}
            </span>
            <span className={\`crt-status \${e.isOpen ? 'is-open' : 'is-answered'}\`}>
              {e.isOpen ? (e.isOverdue ? 'OVERDUE' : 'OPEN') : 'ANSWERED'}
            </span>
          </button>
        );
      })}
      {ledgerRows.length === 0 && (
        <div className="crt-ledger-empty">
          No RFIs match this filter — the{' '}
          {statusFilter === 'overdue' ? 'overdue queue is clear' : 'view is empty'}.
        </div>
      )}
    </div>
  );

  // ----- detail panel -----
  let detailBody = (
    <div className="crt-detail-empty">
      <Icon icon={FileQuestionIcon} size="md" color="secondary" />
      <p>Select an RFI to read the question and log an answer.</p>
    </div>
  );
  if (selected != null) {
    const {rfi} = selected;
    const responder = RESPONDER_BY_ID[rfi.responderId];
    detailBody = (
      <>
        <div className="crt-detail-head">
          <Badge label={rfi.id} variant="neutral" />
          <span
            className={\`crt-status \${selected.isOpen ? 'is-open' : 'is-answered'}\`}>
            {selected.isOpen ? (selected.isOverdue ? 'OVERDUE' : 'OPEN') : 'ANSWERED'}
          </span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <span className="crt-day-chip is-done crt-num">{rfi.daysOpen} d</span>
        </div>
        <h3 className="crt-detail-subject">{rfi.subject}</h3>
        <div className="crt-detail-meta">
          <span className="crt-mono">
            {rfi.sheet}
            {rfi.detail != null && \` · \${rfi.detail}\`}
          </span>
          <span>{rfi.trade}</span>
          <span>
            {responder.firm} ({responder.role})
          </span>
          <span>
            {rfi.isPricingTbd
              ? 'exposure TBD'
              : \`exposure \${formatUsd(rfi.costExposure)}\`}
          </span>
          {rfi.scheduleDays > 0 && <span>+{rfi.scheduleDays} d schedule</span>}
        </div>
        <SheetThumb rfi={rfi} width={200} />
        <blockquote className="crt-quote">
          <span className="crt-quote-label">Question — Cordova field</span>
          {rfi.question}
        </blockquote>
        <blockquote className="crt-quote is-answer">
          <span className="crt-quote-label">
            Proposed response — {responder.firm}
          </span>
          {rfi.proposedAnswer}
        </blockquote>
        {selected.isOpen ? (
          <>
            <div className="crt-dispo" role="group" aria-label="Disposition">
              <button
                type="button"
                className="crt-dispo-btn"
                aria-pressed={dispoChoice === 'no-cost'}
                onClick={() =>
                  setDispoChoice(prev => (prev === 'no-cost' ? null : 'no-cost'))
                }>
                No cost impact
                <span className="crt-dispo-sub">
                  {rfi.isPricingTbd
                    ? 'closes without pricing'
                    : \`clears \${formatUsd(rfi.costExposure)} exposure\`}
                </span>
              </button>
              <button
                type="button"
                className="crt-dispo-btn"
                aria-pressed={dispoChoice === 'cost'}
                disabled={rfi.isPricingTbd}
                title={rfi.isPricingTbd ? 'Pricing TBD — nothing to accept yet' : undefined}
                onClick={() =>
                  setDispoChoice(prev => (prev === 'cost' ? null : 'cost'))
                }>
                Accept cost
                <span className="crt-dispo-sub">
                  {rfi.isPricingTbd
                    ? 'pricing TBD'
                    : \`+\${formatUsd(rfi.costExposure)} committed\`}
                </span>
              </button>
            </div>
            <Button
              label="Log answer"
              variant="primary"
              size="md"
              isDisabled={dispoChoice == null}
              onClick={handleAnswer}
            />
            <Text type="supporting" color="secondary">
              Logging the answer shrinks the {bucketFor(rfi.daysOpen).label}{' '}
              aging bar, rolls the exposure total, and updates{' '}
              {responder.firm}&rsquo;s scorecard line.
            </Text>
          </>
        ) : (
          <>
            <div className="crt-answered-note">
              <span style={{color: SUCCESS, display: 'inline-flex'}}>
                <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
              </span>
              <span>
                Answered —{' '}
                {selected.disposition === 'cost'
                  ? \`cost accepted, \${formatUsd(rfi.costExposure)} committed\`
                  : 'no cost impact'}{' '}
                · {rfi.daysOpen} d response by {responder.firm}.
              </span>
            </div>
            <Button
              label="Reopen RFI"
              variant="secondary"
              size="md"
              onClick={handleReopen}
            />
          </>
        )}
      </>
    );
  }

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="crt-body">
              <div className="crt-main">
                {analytics}
                <div className="crt-section">
                  <Icon icon={ClipboardListIcon} size="sm" color="secondary" />
                  <h2>RFI ledger</h2>
                  <span className="crt-section-meta">
                    {effective.length} total · open first, longest in court on top
                  </span>
                </div>
                <div className="crt-filters" role="group" aria-label="Status filter">
                  {filterDefs.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className="crt-chip"
                      aria-pressed={statusFilter === f.id}
                      onClick={() => setStatusFilter(f.id)}>
                      {f.label}
                      <span className="crt-chip-count">{f.count}</span>
                    </button>
                  ))}
                  <StackItem size="fill">
                    <span />
                  </StackItem>
                  <span className="crt-live" role="status" aria-live="polite">
                    {liveLine}
                  </span>
                </div>
                {ledger}
                <div className="crt-section">
                  <Icon icon={ArchiveIcon} size="sm" color="secondary" />
                  <h2>Desk notes</h2>
                </div>
                <Text type="supporting" color="secondary">
                  Answer aging counts only RFIs still in court; a logged answer
                  freezes its days-in-court as the response time. Accepted-cost
                  answers move dollars from open exposure to committed changes
                  — reopening walks every number back.{' '}
                  <span className="crt-num">
                    Overdue threshold {OVERDUE_DAYS} d per the Cordova
                    subcontract rider.
                  </span>
                </Text>
              </div>
              <aside className="crt-detail" aria-label="RFI detail">
                <div className="crt-section">
                  <Icon icon={SendIcon} size="sm" color="secondary" />
                  <h2>Answer composer</h2>
                  {selected != null && selected.isOpen && (
                    <span className="crt-section-meta">
                      ball in {RESPONDER_BY_ID[selected.rfi.responderId].short}
                      &rsquo;s court
                    </span>
                  )}
                </div>
                {detailBody}
              </aside>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



`;export{e as default};