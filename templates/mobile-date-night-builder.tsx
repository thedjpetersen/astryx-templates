// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Emberly's Friday plan for You + Sam:
 *   three stops on a 6:00 PM–1:00 AM evening rail (Vireo Wine Bar 6:30–7:45
 *   $50 · Casa Molino 8:00–9:45 $90 reservation-locked · Hi-Lo Lounge
 *   10:15–11:30 $40 with a $28 happy-hour price before 10:00 PM), budget cap
 *   $200 (50+90+40 = $180 spent, $20 remaining ✓), walk total 0.6+0.5 =
 *   1.1 mi ✓, an 8-venue swap corpus (Under $40 matches 3 of 8 · ≤10 min
 *   walk 2 of 8 · Open late 5 of 8 ✓) inside a 16-spot directory, and Sam's
 *   approvals {pregame ✓, main ✓, nightcap pending} sent 'yesterday,
 *   4:12 PM'. No Date.now(), no Math.random(), no network media — venue art
 *   is id-derived CSS gradients.
 * @output Emberly — Date Night Builder: a 390px MOBILE thumb-first
 *   run-sheet. NavBar (ticket-stub heart mark · fade-in title · 24px
 *   BudgetRing button) over a Plan tab whose EveningRail draws stops at
 *   duration-proportional heights (2px/min: 150/210/150px cards, 30/60px
 *   walk buffers) with live drag + Earlier/Later steppers, a Spots tab
 *   (search flow, 8+8 paged 72px rows, skeleton refresh, pushed venue
 *   detail), a Shared tab whose ApprovalChips go stale-amber the moment an
 *   approved stop changes, and a Profile tab (budget-cap stepper, switches,
 *   Reset alert). Signature move: long-press-drag (or step) the nightcap —
 *   buffers re-derive live, a ConflictHatch paints the overlap past Casa
 *   Molino's 9:45 end, the happy-hour rule reprices $40→$28 below 10:00 PM,
 *   and the navBar BudgetRing re-cuts its per-stop arcs in the same render.
 * @position Page template; emitted by `astryx template mobile-date-night-builder`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at y=0
 *   is the first pixel). All overlays (scrim, sheets, action sheet, alert)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet/alert is open, shell locks to {height:'100dvh',overflow:'hidden'}
 *   and restores on close. The toast dock is sticky-in-flow (bottom 76,
 *   height-0 anchor) per the foundations amendment — shell-absolute would
 *   pin it to the document bottom on tall scrolling tabs.
 * Container policy: inset-grouped mobile listCards (12px radius, hairline,
 *   rowDividers inset 16 / 68 for media rows); no desktop frames, no side
 *   asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Emberly ember — the demo --color-brand is the demo logo
 *   blue, so the spec hex is quarantined per house rule). Sanctioned
 *   non-brand literals, each with contrast math at the declaration: brand
 *   fill text, small brand text, CONTROL_REST (≥3:1 rest fills — switch OFF
 *   track + ring remainder, per the batch-2 amendment), stale amber pair,
 *   conflict hatch red pair, savings green pair, scrim. Per-stop ring arcs
 *   use var(--color-data-categorical-N, light-dark(...)) fallbacks.
 * Density grid (MOBILE MASTER NUMBERS, verbatim): navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); largeTitle row 52px in flow
 *   (28px/700 'Friday · You + Sam' at 16px gutter) — total header 104px;
 *   meta strip 44px (13px/500 secondary tabular '3 stops · $180 of $200 ·
 *   1.1 mi walk'); tabBar 64px sticky bottom z20, 4 flex:1 tabItems (24px
 *   icon + 11px/500 label + 4px gap). Gutters: 16px screen inset · 12px
 *   card gaps · 24px section gaps · 8px chip gaps. EVENING RAIL: 2px/min;
 *   6:00 PM–1:00 AM = 420 min = 840px; hour gridlines every 120px (8 labels
 *   6p..1a = 7×120 = 840 ✓); 15-min detent = 30px; columns 16 gutter + 48
 *   timeGutter + fluid track + 16 gutter (310px track at 390 ✓); stop cards
 *   150/210/150px = real minutes ×2; rail sum 60 lead + 150 + 30 + 210 +
 *   60 + 150 + 180 tail = 840px ✓ (30+75+15+105+30+75+90 = 420 min ✓).
 *   BudgetRing 24px, 3px stroke, r=10.5, C = 65.97 ≈ 66px dash space. Rows:
 *   44px utility / 60px two-line / 72px media (48px thumb r12); dividers
 *   inset 16 / 68. Buttons: 48px primary full-width, 36px secondary/Swap,
 *   44×44 icon + stepper hits (stepper track 96×32 r8). Sheet: 24px grabber
 *   zone (36×5 pill 8px from top), 52px header, MEDIUM 55%, LARGE
 *   calc(100% − 56px). Type: 28/700 · 22/700 · 17/600 · 16/400 · 13/400 ·
 *   11/500; tabular-nums on every price, time, and count. Toast dock sticky
 *   bottom 76 z30 (156 on Shared, clearing its sticky footer).
 *
 * Responsive contract:
 * - Fluid 320–430: zero width literals; rail track flex-fills (240px at
 *   320 → 350px at 430); vertical rail arithmetic is width-independent. At
 *   <340px container the Swap button drops its text for a 44×44 Repeat2
 *   icon (wrap is banned inside duration-height cards). Meta strip
 *   ellipsizes its middle segment first; delta badges never wrap.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport); ≥720px renders the phone experience as a
 *   centered 430px column with hairline borders — never a stretched
 *   relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CalendarHeartIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  Repeat2Icon,
  SearchIcon,
  SearchXIcon,
  UserRoundIcon,
  UsersRoundIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Emberly ember). #E85D4A on #FFFFFF ≈ 3.5:1
// — legal as a FILL and as an interactive boundary (≥3:1), never as small
// text. Dark side lifts to #F2907F (on ~#1C1C1E card ≈ 7.5:1 as a fill).
const BRAND_ACCENT = 'light-dark(#E85D4A, #F2907F)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #E85D4A ≈ 3.5:1 — used
// ONLY at ≥600 weight ≥16px on 48px primary buttons (spec rule). Dark:
// #2A1410 on #F2907F ≈ 8.9:1 per spec (recomputed ≈ 7.5:1 — passes).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #2A1410)';
// Small brand-tinted TEXT (Undo, active tab, 13px labels): #C43F2E on
// #FFFFFF ≈ 5.1:1; #F2907F on #1C1C1E ≈ 7.5:1 — both clear 4.5:1.
const BRAND_TEXT = 'light-dark(#C43F2E, #F2907F)';
// Brand washes for active-chip / selected fills (text on them is BRAND_TEXT).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// AMENDMENT PAIR — meaningful rest fills & control boundaries need ≥3:1
// against their ACTUAL surface. #8F867D on #FFFFFF ≈ 3.5:1; #77706A on
// #1C1C1E ≈ 3.6:1. Used for: switch OFF tracks, the BudgetRing remainder
// arc (the 'still available' rest fill), and unchecked chip boundaries.
const CONTROL_REST = 'light-dark(#8F867D, #77706A)';
// Stale-approval amber. Text pair #8A5A00 / #F5C97B on the matching 14%
// tint over the card: #8A5A00 on the light tint ≈ 5.3:1 (5.8:1 on plain
// white); #F5C97B on the dark tint ≈ 10:1 — both clear 4.5:1 at 11px/500.
const STALE_AMBER = 'light-dark(#8A5A00, #F5C97B)';
const STALE_TINT = `color-mix(in srgb, ${STALE_AMBER} 14%, transparent)`;
// Conflict hatch (spec literal): stripes at 22% over the card surface;
// caption text uses the full-strength pair — #B3261E on #FFFFFF ≈ 6.5:1,
// #F2B8B5 on #1C1C1E ≈ 10.9:1.
const HATCH_RED = 'light-dark(#B3261E, #F2B8B5)';
const HATCH_STRIPE = `color-mix(in srgb, ${HATCH_RED} 22%, transparent)`;
// Savings deltas (−$7): #166534 on #FFFFFF ≈ 7.3:1; #86EFAC on #1C1C1E ≈
// 12.5:1.
const SAVE_GREEN = 'light-dark(#166534, #86EFAC)';
// Approved-chip tint (CheckIcon + text in SAVE_GREEN on it: ≈ 6.6:1 light).
const SAVE_TINT = `color-mix(in srgb, ${SAVE_GREEN} 12%, transparent)`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// Per-stop BudgetRing arc + swatch colors — repo-standard categorical
// fallbacks; extra stops (Duplicate) cycle the array.
const STOP_SWATCHES = [
  'var(--color-data-categorical-1, light-dark(#0E7490, #67E8F9))',
  'var(--color-data-categorical-3, light-dark(#6D28D9, #C4B5FD))',
  'var(--color-data-categorical-2, light-dark(#B45309, #FCD34D))',
  'var(--color-data-categorical-5, light-dark(#BE185D, #F9A8D4))',
  'var(--color-data-categorical-4, light-dark(#15803D, #86EFAC))',
  'var(--color-data-categorical-6, light-dark(#475569, #CBD5E1))',
];

// Venue-thumb gradients — id-derived (charcode hash), decorative only
// (aria-hidden); no network photos by law.
const THUMB_HUES = [
  ['light-dark(#F2B8A0, #7A4632)', 'light-dark(#D97757, #B25B3F)'],
  ['light-dark(#B7C9E8, #2F4368)', 'light-dark(#7591C4, #4E699C)'],
  ['light-dark(#C9E4C5, #2F5233)', 'light-dark(#7FB77E, #4F7A50)'],
  ['light-dark(#EAD1DC, #5C3247)', 'light-dark(#C77DA0, #8F5573)'],
  ['light-dark(#F4E1B9, #6B5423)', 'light-dark(#D9B45B, #A17F31)'],
  ['light-dark(#CBD5E1, #334155)', 'light-dark(#94A3B8, #64748B)'],
];

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible brand ring (+2 offset,
// everywhere including tabItems and the grabber), visually-hidden helper,
// overshoot pulse + skeleton shimmer (both REMOVED under reduced motion —
// static color still encodes the state), sheet slide-in (fade under reduced
// motion).
// ---------------------------------------------------------------------------

const EMB_CSS = `
.emb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.emb-btn:disabled { cursor: default; }
.emb-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.emb-fade { transition: opacity 200ms ease; }
@keyframes emb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.emb-sheet-in { animation: emb-sheet-in 240ms ease; }
@keyframes emb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.emb-pulse { animation: emb-pulse 1s ease-in-out infinite; }
@keyframes emb-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.emb-shimmer { animation: emb-shimmer 1.6s linear infinite; }
.emb-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .emb-fade { transition: none; }
  .emb-sheet-in { animation: none; }
  .emb-pulse { animation: none; }
  .emb-shimmer { animation: none; display: none; }
}
`;

// ---------------------------------------------------------------------------
// RAIL GEOMETRY — 2px per minute over 6:00 PM–1:00 AM. Minutes are counted
// from NOON, so 360 = 6:00 PM origin and 780 = 1:00 AM end; 420 min × 2 =
// 840px rail; hour lines every 60 min = 120px.
// ---------------------------------------------------------------------------

const RAIL_START_MIN = 360; // 6:00 PM
const RAIL_END_MIN = 780; // 1:00 AM
const PX_PER_MIN = 2;
const RAIL_HEIGHT = (RAIL_END_MIN - RAIL_START_MIN) * PX_PER_MIN; // 840 ✓
const HOUR_LABELS = ['6p', '7p', '8p', '9p', '10p', '11p', '12a', '1a'];
const SNAP_MIN = 15; // one drag detent = 30px

/** Minutes-since-noon → y px on the rail. */
function railY(min: number): number {
  return (min - RAIL_START_MIN) * PX_PER_MIN;
}

/** Minutes-since-noon → '6:30 PM' / '12:15 AM'. */
function fmtClock(min: number): string {
  const h24 = (12 + Math.floor(min / 60)) % 24;
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Whole-dollar fixture money → '$180'. */
function fmtUsd(usd: number): string {
  return `$${usd}`;
}

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields (display strings AND numeric
// minutes/dollars), aggregates cross-checked by hand:
//   spent 50+90+40 = $180 · cap $200 · remaining $20 ✓
//   ring arcs on C≈66: 50/200=16.5 · 90/200=29.7 · 40/200=13.2 · rest 6.6
//     → 16.5+29.7+13.2+6.6 = 66 ✓
//   happy hour (nightcap start < 600 = 10:00 PM): $28 → total $168, arcs
//     16.5/29.7/9.24 + remainder 10.56 = 66 ✓
//   over-cap stress: main → chef's tasting $128 → 50+128+40 = $218,
//     overshoot $18 = 9% of cap = 5.94px error arc ✓
//   walk meta 0.6+0.5 = 1.1 mi ✓
// ---------------------------------------------------------------------------

type Approval = 'approved' | 'pending' | 'stale';

interface Stop {
  id: string;
  venue: string;
  category: string;
  startMin: number; // since noon: 390 = 6:30 PM
  startLabel: string; // shipped dual field; re-derived via fmtClock on edit
  durationMin: number;
  priceUsd: number;
  priceLabel: string;
  walkToNextMin: number; // walk leg to the NEXT stop (0 on the last)
  walkToNextMi: number;
  walkToNextLabel: string;
  locked?: boolean; // Casa Molino holds the 8:00 reservation
  happyHour?: {endsMin: number; priceUsd: number};
}

const STOP_PREGAME: Stop = {
  id: 'pregame',
  venue: 'Vireo Wine Bar',
  category: 'Wine bar',
  startMin: 390,
  startLabel: '6:30 PM',
  durationMin: 75, // 150px card ✓
  priceUsd: 50,
  priceLabel: '$50',
  walkToNextMin: 15,
  walkToNextMi: 0.6,
  walkToNextLabel: '15 min walk · 0.6 mi',
};

const STOP_MAIN: Stop = {
  id: 'main',
  venue: 'Casa Molino',
  category: 'Italian dining',
  startMin: 480,
  startLabel: '8:00 PM',
  durationMin: 105, // 210px card ✓ · ends 585 = 9:45 PM
  priceUsd: 90,
  priceLabel: '$90',
  walkToNextMin: 12,
  walkToNextMi: 0.5,
  walkToNextLabel: '12 min walk · 0.5 mi',
  locked: true,
};

const STOP_NIGHTCAP: Stop = {
  id: 'nightcap',
  venue: 'Hi-Lo Lounge',
  category: 'Cocktail lounge',
  startMin: 615, // 10:15 PM — gap after main = 615−585 = 30 min = 60px ✓
  startLabel: '10:15 PM',
  durationMin: 75, // ends 690 = 11:30 PM; tail 780−690 = 90 min = 180px ✓
  priceUsd: 40,
  priceLabel: '$40',
  walkToNextMin: 0,
  walkToNextMi: 0,
  walkToNextLabel: '',
  happyHour: {endsMin: 600, priceUsd: 28}, // start < 10:00 PM → $28
};

const INITIAL_STOPS: Stop[] = [STOP_PREGAME, STOP_MAIN, STOP_NIGHTCAP];

interface Venue {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  priceLabel: string;
  walkMin: number; // walk from the previous plan stop
  walkMi: number;
  openLate: boolean;
}

// SWAP CORPUS = Spots page 1 (8 rows). Filter-chip cross-checks against
// THESE eight: Under $40 → 33, 29, 38 = 3 ✓ · ≤10 min walk → 8, 9 = 2 ✓ ·
// Open late → Copper Owl, Nightjar, Salt Fox, Juniper Twelve, Gilt & Ash =
// 5 ✓. Peek order (first three) carries the spec deltas vs the current
// nightcap ($40 / 12-min walk): +$14/+12 min · −$7/+4 min · ±$0/+9 min ✓.
// alt_understudy's 44-char name is the 240px-card truncation stress.
const SWAP_VENUES: Venue[] = [
  {id: 'alt_copper', name: 'Copper Owl', category: 'Cocktail lounge', priceUsd: 54, priceLabel: '$54', walkMin: 24, walkMi: 1.0, openLate: true},
  {id: 'alt_nightjar', name: 'Nightjar', category: 'Listening bar', priceUsd: 33, priceLabel: '$33', walkMin: 16, walkMi: 0.7, openLate: true},
  {id: 'alt_vesper', name: 'Vesper Rooftop', category: 'Rooftop bar', priceUsd: 40, priceLabel: '$40', walkMin: 21, walkMi: 0.9, openLate: false},
  {id: 'alt_saltfox', name: 'Salt Fox', category: 'Natural wine bar', priceUsd: 58, priceLabel: '$58', walkMin: 8, walkMi: 0.3, openLate: true},
  {id: 'alt_juniper', name: 'Juniper Twelve', category: 'Amaro bar', priceUsd: 29, priceLabel: '$29', walkMin: 30, walkMi: 1.2, openLate: true},
  {id: 'alt_gilt', name: 'Gilt & Ash', category: 'Piano bar', priceUsd: 47, priceLabel: '$47', walkMin: 9, walkMi: 0.4, openLate: true},
  {id: 'alt_casatasting', name: "Casa Molino — chef's tasting", category: 'Tasting menu', priceUsd: 128, priceLabel: '$128', walkMin: 12, walkMi: 0.5, openLate: false},
  {id: 'alt_understudy', name: 'The Understudy at Pearl & Rye Listening Room', category: 'Listening room', priceUsd: 38, priceLabel: '$38', walkMin: 18, walkMi: 0.8, openLate: false},
];

// Spots page 2 (Show 8 more → 'All 16 spots'). Query 'zq' matches none —
// the filtered-empty stress.
const MORE_VENUES: Venue[] = [
  {id: 'spot_vireo', name: 'Vireo Wine Bar', category: 'Wine bar', priceUsd: 50, priceLabel: '$50', walkMin: 15, walkMi: 0.6, openLate: false},
  {id: 'spot_casa', name: 'Casa Molino', category: 'Italian dining', priceUsd: 90, priceLabel: '$90', walkMin: 12, walkMi: 0.5, openLate: false},
  {id: 'spot_hilo', name: 'Hi-Lo Lounge', category: 'Cocktail lounge', priceUsd: 40, priceLabel: '$40', walkMin: 12, walkMi: 0.5, openLate: true},
  {id: 'spot_marlow', name: "Marlow's Corner", category: 'Neighborhood bistro', priceUsd: 36, priceLabel: '$36', walkMin: 26, walkMi: 1.1, openLate: false},
  {id: 'spot_moonstone', name: 'Moonstone Diner', category: 'Late-night diner', priceUsd: 22, priceLabel: '$22', walkMin: 22, walkMi: 0.9, openLate: true},
  {id: 'spot_arcadia', name: 'Arcadia Games Hall', category: 'Arcade bar', priceUsd: 31, priceLabel: '$31', walkMin: 17, walkMi: 0.7, openLate: true},
  {id: 'spot_ferryhouse', name: 'Ferryhouse Oysters', category: 'Oyster bar', priceUsd: 73, priceLabel: '$73', walkMin: 26, walkMi: 1.1, openLate: false},
  {id: 'spot_cielo', name: 'Cielo Azul Mezcaleria', category: 'Mezcalería', priceUsd: 49, priceLabel: '$49', walkMin: 19, walkMi: 0.8, openLate: true},
];

const ALL_VENUES: Venue[] = [...SWAP_VENUES, ...MORE_VENUES]; // 16 total ✓

const SPOTS_PAGE_SIZE = 8;
const SEARCH_RECENTS = ['rooftop', 'oyster'];
// Skeleton widths are DETERMINISTIC (spec pattern), never random.
const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

const PARTNER = 'Sam';
const INITIAL_APPROVALS: Record<string, Approval> = {
  pregame: 'approved',
  main: 'approved',
  nightcap: 'pending',
};
const INITIAL_SENT_AT = 'Sent yesterday, 4:12 PM'; // fixed string — no clock

// ---------------------------------------------------------------------------
// PURE DERIVATIONS
// ---------------------------------------------------------------------------

/** Happy-hour rule: nightcap start strictly before 10:00 PM → $28. */
function effectivePrice(stop: Stop, startMin: number): number {
  if (stop.happyHour != null && startMin < stop.happyHour.endsMin) {
    return stop.happyHour.priceUsd;
  }
  return stop.priceUsd;
}

/** A stop's live start — the drag preview wins while a drag is armed. */
function liveStart(stop: Stop, drag: {stopId: string; startMin: number} | null): number {
  return drag != null && drag.stopId === stop.id ? drag.startMin : stop.startMin;
}

/** Deterministic venue-art pick: charcode sum → THUMB_HUES index. */
function thumbGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * 7) % 997;
  const [from, to] = THUMB_HUES[hash % THUMB_HUES.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// BudgetRing geometry: 24px box, r=10.5 → C = 2π·10.5 = 65.97 ≈ 66px of
// dash space; stroke 3. CLAMP RULE (explicit per spec): stop arcs are cut
// at price/cap × C in plan order, cumulatively CLAMPED at C (an arc that
// would run past 12 o'clock is truncated — 16.5/42.24/13.2 = 71.94 →
// 16.5/42.24/7.26 drawn); the overshoot (spent−cap)/cap × C is a SEPARATE
// error arc from 12 o'clock (capped at a full lap).
const RING_R = 10.5;
const RING_C = 2 * Math.PI * RING_R; // 65.97

interface RingArc {
  id: string;
  color: string;
  offset: number; // px from 12 o'clock
  length: number; // px
}

function ringArcs(stops: Stop[], drag: {stopId: string; startMin: number} | null, cap: number): {
  arcs: RingArc[];
  spent: number;
  overshootLen: number;
} {
  const arcs: RingArc[] = [];
  let cursor = 0;
  let spent = 0;
  stops.forEach((stop, index) => {
    const price = effectivePrice(stop, liveStart(stop, drag));
    spent += price;
    const raw = (price / cap) * RING_C;
    const length = Math.max(0, Math.min(raw, RING_C - cursor)); // cumulative clamp
    arcs.push({id: stop.id, color: STOP_SWATCHES[index % STOP_SWATCHES.length], offset: cursor, length});
    cursor += length;
  });
  const overshootLen = spent > cap ? Math.min(((spent - cap) / cap) * RING_C, RING_C) : 0;
  return {arcs, spent, overshootLen};
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — planStore: three entities + one update(id, patch).
// Every surface writes through it; every mutation ripples (RIPPLE LAW:
// buffers, meta strip, BudgetRing dasharray, SharedPreviewCard, and stale
// flips all re-derive from the same stops array in render).
// ---------------------------------------------------------------------------

type TabId = 'plan' | 'spots' | 'shared' | 'profile';
type SwapFilter = 'under40' | 'walk10' | 'late';

interface ToastState {
  seq: number;
  text: string;
  undo: boolean;
  status: boolean; // role=status for refresh results
}

interface RemovedEntry {
  stop: Stop;
  index: number;
  approval: Approval;
}

interface PlanEntity {
  stops: Stop[];
  budgetCap: number; // Profile stepper: $25 steps, 100–400
  approvals: Record<string, Approval>;
  sentAt: string;
  notifNudges: boolean;
  notifHappyHour: boolean;
}

interface SpotsEntity {
  query: string;
  searchFocused: boolean;
  recents: string[];
  shownCount: number;
  skeleton: boolean;
  detailId: string | null; // pushed venue screen — persists per-tab
}

interface UiEntity {
  activeTab: TabId;
  scrollByTab: Record<TabId, number>;
  openSheet: 'swap' | 'budget' | null;
  swapStopId: string | null;
  swapFilter: SwapFilter | null;
  sheetDetent: 'medium' | 'large';
  actionStopId: string | null; // stop ellipsis action sheet
  resetOpen: boolean; // Profile 'Reset plan?' alert
  dragPreview: {stopId: string; startMin: number} | null;
  toast: ToastState | null; // NO auto-dismiss timer — replaced by mutations
  removedStack: RemovedEntry[]; // Undo chain restores in original order
}

interface EmberlyEntities {
  plan: PlanEntity;
  spots: SpotsEntity;
  ui: UiEntity;
}

const INITIAL_ENTITIES: EmberlyEntities = {
  plan: {
    stops: INITIAL_STOPS,
    budgetCap: 200,
    approvals: INITIAL_APPROVALS,
    sentAt: INITIAL_SENT_AT,
    notifNudges: true,
    notifHappyHour: false,
  },
  spots: {
    query: '',
    searchFocused: false,
    recents: SEARCH_RECENTS,
    shownCount: SPOTS_PAGE_SIZE,
    skeleton: false,
    detailId: null,
  },
  ui: {
    activeTab: 'plan',
    scrollByTab: {plan: 0, spots: 0, shared: 0, profile: 0},
    openSheet: null,
    swapStopId: null,
    swapFilter: null,
    sheetDetent: 'medium',
    actionStopId: null,
    resetOpen: false,
    dragPreview: null,
    toast: null,
    removedStack: [],
  },
};

function usePlanStore() {
  const [entities, setEntities] = useState<EmberlyEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof EmberlyEntities>(id: K, patch: Partial<EmberlyEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

/**
 * Container-width hook (grid-feeder-console pattern) — the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the wrapper
 * can tell the 390px mobile stage from the desktop stage.
 */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) return undefined;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) setWidth(rect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function findScroller(node: HTMLElement | null): HTMLElement {
  let parent = node?.parentElement ?? null;
  while (parent != null) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

/** Focus trap — sheets/alerts trap Tab; Escape layering is handled globally. */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input, [role="spinbutton"]',
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  // THE SHELL CONTRACT (mobile foundations, verbatim).
  shell: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100dvh',
    background: 'var(--color-background-body)',
    overflowX: 'clip',
    fontFamily: 'var(--font-family-body)',
    color: 'var(--color-text-primary)',
  },
  // Scroll lock while any sheet / action sheet / alert is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {maxWidth: 430, marginInline: 'auto', borderInline: '1px solid var(--color-border)'},
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline ALWAYS ON
  // (noted choice per contract — scroll-under is not wired to the border).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  backBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 4,
    borderRadius: 12,
    color: BRAND_TEXT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // LARGE TITLE — 52px row in flow below the sticky navBar (Plan tab only).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  // META STRIP — 44px, 13/500 secondary, tabular; middle segment ellipsizes
  // first (minWidth 0 on the flexible middle span).
  metaStrip: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  metaMiddle: {minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'},
  metaOver: {color: 'var(--color-error)', fontWeight: 600},
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // EVENING RAIL — 16 gutter + 48 timeGutter + fluid track + 16 gutter.
  railWrap: {
    display: 'flex',
    paddingInline: 16,
    paddingBottom: 24,
    position: 'relative',
  },
  timeGutter: {position: 'relative', width: 48, flexShrink: 0, height: RAIL_HEIGHT},
  hourLabel: {
    position: 'absolute',
    left: 0,
    transform: 'translateY(-50%)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  track: {position: 'relative', flex: 1, minWidth: 0, height: RAIL_HEIGHT},
  gridline: {
    position: 'absolute',
    left: -8,
    right: 0,
    height: 1,
    background: 'var(--color-border)', // passive separator — hairline legal
  },
  // STOP CARD — absolute on the track; height = durationMin × 2.
  stopCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    touchAction: 'pan-y',
  },
  stopCardDragging: {
    zIndex: 10,
    boxShadow: '0 8px 24px var(--color-shadow)',
    borderColor: BRAND_ACCENT,
  },
  stopRow1: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  stopTime: {borderRadius: 6, whiteSpace: 'nowrap'},
  stopCost: {marginLeft: 'auto', whiteSpace: 'nowrap'},
  stopVenue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stopMeta: {
    marginTop: 2,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stopHH: {color: STALE_AMBER, fontWeight: 500},
  stopBar: {
    marginTop: 'auto',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // Stepper — 96×32 visual track; each half's HIT is 48×44 (parent-padded).
  stepperWrap: {position: 'relative', width: 96, height: 44, flexShrink: 0, display: 'flex'},
  stepperTrackVisual: {
    position: 'absolute',
    insetInline: 0,
    top: 6,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    pointerEvents: 'none',
  },
  stepperHairline: {
    position: 'absolute',
    left: '50%',
    top: 12,
    width: 1,
    height: 20,
    background: 'var(--color-border)',
    pointerEvents: 'none',
  },
  stepperHalf: {
    position: 'relative',
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    borderRadius: 8,
  },
  stepperHalfDisabled: {opacity: 0.35},
  swapBtnHit: {height: 44, display: 'flex', alignItems: 'center', marginLeft: 'auto'},
  swapBtnPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
  },
  lockChip: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // BUFFER SEGMENT — dashed connector + centered walk pill; heights derive
  // live from adjacent stop times.
  bufferSeg: {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  bufferLine: {
    position: 'absolute',
    left: '50%',
    top: 2,
    bottom: 2,
    width: 0,
    borderLeft: '2px dashed var(--color-border)', // passive separator
  },
  bufferPill: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bufferPillTight: {background: STALE_TINT, border: `1px solid ${STALE_AMBER}`, color: STALE_AMBER},
  noTravelCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    transform: 'translateY(-50%)',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  noTravelPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: `1px solid ${HATCH_RED}`,
    fontSize: 11,
    fontWeight: 500,
    color: HATCH_RED,
    whiteSpace: 'nowrap',
  },
  // CONFLICT HATCH — 45° stripe band over the overlapping card slice.
  hatchBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    background: `repeating-linear-gradient(45deg, ${HATCH_STRIPE} 0 6px, transparent 6px 12px)`,
    pointerEvents: 'none',
  },
  hatchCaption: {
    position: 'relative',
    marginTop: 2,
    fontSize: 11,
    fontWeight: 500,
    color: HATCH_RED,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EMPTY STATE (true-empty + filtered-empty share the block).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
  },
  // SEARCH — 52px bar below the navBar (same blur surface).
  searchBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    fontSize: 16, // 16 is the input floor — below it mobile browsers zoom
    color: 'var(--color-text-primary)',
    outline: 'none',
    padding: 0,
  },
  searchClearHit: {
    width: 44,
    height: 36,
    marginRight: -12,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  searchCancel: {height: 44, display: 'flex', alignItems: 'center', fontSize: 16, color: BRAND_TEXT, flexShrink: 0},
  recentClear: {height: 44, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: BRAND_TEXT},
  recentRow: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInlineStart: 16,
    fontSize: 16,
    color: 'var(--color-text-primary)',
  },
  // SPOTS — 72px media rows, 48px gradient thumb r12.
  spotRow: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  spotThumb: {width: 48, height: 48, borderRadius: 12, flexShrink: 0},
  spotText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  spotPrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  spotSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  spotPrice: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_TEXT,
  },
  terminalCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    margin: '16px 0 0',
  },
  // SKELETON — 72px rows, deterministic staggered widths, shared shimmer.
  skeletonRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelThumb: {width: 48, height: 48, borderRadius: 12, background: 'var(--color-background-muted)', flexShrink: 0},
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  shimmerHost: {position: 'relative', overflow: 'hidden'},
  shimmerSweep: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent 20%, color-mix(in srgb, var(--color-background-card) 55%, transparent) 50%, transparent 80%)',
    pointerEvents: 'none',
  },
  // SPOT DETAIL (pushed screen).
  detailHero: {height: 160, marginInline: 16, borderRadius: 12, marginTop: 12},
  detailName: {fontSize: 22, fontWeight: 700, margin: '16px 16px 2px'},
  detailMeta: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 16px 12px', fontVariantNumeric: 'tabular-nums'},
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityValue: {
    marginLeft: 'auto',
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  detailFooterPad: {padding: 16},
  // SHARED tab.
  sharedRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  swatchDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  sharedText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  sharedPrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  sharedSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px'},
  chip: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  chipApproved: {background: SAVE_TINT, color: SAVE_GREEN},
  chipPending: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  chipStale: {background: STALE_TINT, color: STALE_AMBER},
  approvalCount: {
    padding: '12px 16px 0',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  sentCaption: {padding: '8px 16px 12px', fontSize: 13, color: 'var(--color-text-secondary)'},
  // Shared sticky footer — sits 64px up, above the tabBar, same blur.
  sharedFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // PROFILE — switches + cap stepper.
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    transition: 'background 200ms ease',
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF', // white thumb in both schemes per contract
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    transition: 'transform 200ms ease',
  },
  // TAB BAR — 64px sticky bottom z20; 4 flex:1 items.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_TEXT, fontWeight: 600},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500, letterSpacing: '0.01em'},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow height-0 anchor (amendment): pins 76px
  // above the viewport bottom mid-scroll; 156 on Shared to clear its
  // footer. Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastCard: {
    position: 'absolute',
    bottom: 0,
    insetInline: 16,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // SHEETS — scrim z40, sheet z41, absolute inside shell.
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  grabberZone: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    touchAction: 'none',
  },
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  filterChipRow: {display: 'flex', gap: 8, padding: '4px 16px 12px', overflowX: 'auto'},
  filterChipHit: {height: 44, display: 'flex', alignItems: 'center', flexShrink: 0},
  filterChip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  filterChipOn: {border: `1px solid ${BRAND_ACCENT}`, background: BRAND_TINT_12, color: BRAND_TEXT},
  altRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  altText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  // Delta badges: fixed-width right-aligned tabular; ±$0 neutral, savings
  // SAVE_GREEN, increases text-primary. Radius 6 per corner map.
  deltaCol: {display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0},
  deltaBadge: {
    minWidth: 44,
    textAlign: 'right',
    padding: '1px 6px',
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  deltaWalk: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // BUDGET SHEET rows — 8px leading swatches echo the ring arcs.
  budgetSwatch: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // ACTION SHEET — two stacked cards, 8px apart, insetInline 16 bottom 16.
  actionSheetWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionRowCancel: {fontWeight: 600},
  actionDivider: {height: 1, background: 'var(--color-border)'},
  // ALERT — the one blocking overlay (Reset plan). Scrim does NOT dismiss.
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(280px, calc(100% - 64px))',
    zIndex: 61,
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  alertBody: {padding: 20, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '8px 0 0'},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// BRAND MARK — two overlapping ticket-stub rects whose intersection is
// notched as a heart; 24px SVG in a 44×44 button (text-primary + ember).
// ---------------------------------------------------------------------------

function EmberlyMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={2.5} y={5.5} width={13} height={9} rx={2.5} transform="rotate(-8 9 10)" stroke="var(--color-text-primary)" strokeWidth={1.6} />
      <rect x={8.5} y={9.5} width={13} height={9} rx={2.5} transform="rotate(6 15 14)" stroke={BRAND_ACCENT} strokeWidth={1.6} />
      <path
        d="M12 15.6c-1.5-1.1-2.4-2-2.4-3 0-.8.6-1.4 1.3-1.4.5 0 .9.3 1.1.7.2-.4.6-.7 1.1-.7.7 0 1.3.6 1.3 1.4 0 1-.9 1.9-2.4 3z"
        fill={BRAND_ACCENT}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BUDGET RING — 24px donut, r=10.5, C≈66; per-stop arcs from 12 o'clock,
// CONTROL_REST remainder (the ≥3:1 'still available' rest fill), separate
// pulsing error overshoot arc past cap (static under reduced motion —
// color still encodes the state).
// ---------------------------------------------------------------------------

interface BudgetRingProps {
  arcs: RingArc[];
  overshootLen: number;
}

function BudgetRing({arcs, overshootLen}: BudgetRingProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <g transform="rotate(-90 12 12)">
        {/* Remainder rest fill — CONTROL_REST ≈3.5:1 light / 3.6:1 dark vs
            the navBar surface (amendment: meaningful rest fills need ≥3:1). */}
        <circle cx={12} cy={12} r={RING_R} stroke={CONTROL_REST} strokeWidth={3} opacity={0.55} />
        {arcs.map(arc =>
          arc.length > 0 ? (
            <circle
              key={arc.id}
              cx={12}
              cy={12}
              r={RING_R}
              stroke={arc.color}
              strokeWidth={3}
              strokeDasharray={`${arc.length.toFixed(2)} ${(RING_C - arc.length).toFixed(2)}`}
              strokeDashoffset={-arc.offset.toFixed(2)}
            />
          ) : null,
        )}
        {overshootLen > 0 ? (
          <circle
            className="emb-pulse"
            cx={12}
            cy={12}
            r={RING_R}
            stroke="var(--color-error)"
            strokeWidth={3}
            strokeDasharray={`${overshootLen.toFixed(2)} ${(RING_C - overshootLen).toFixed(2)}`}
          />
        ) : null}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STOP CARD — duration-height card on the rail. Long-press (450ms, 8px
// cancel) arms drag; Δpx/2 maps to minutes; release snaps to the 15-min
// (30px) detent with the spec bezier (instant under reduced motion). The
// MANDATORY button path is the Earlier/Later stepper (one detent per tap,
// disabled at collision/limits at 35% opacity) plus the row-1 spinbutton
// (ArrowUp/Down = ±15 min).
// ---------------------------------------------------------------------------

interface StopCardProps {
  stop: Stop;
  prevStop: Stop | null;
  nextStart: number; // next stop's live start, or RAIL_END
  liveStartMin: number; // drag preview wins
  isDragging: boolean;
  narrow: boolean; // <340px container: Swap collapses to a 44×44 icon
  reducedMotion: boolean;
  onDragPreview: (stopId: string, startMin: number | null) => void;
  onCommitStart: (stopId: string, startMin: number) => void;
  onSwap: (stopId: string, opener: HTMLElement) => void;
  onMenu: (stopId: string, opener: HTMLElement) => void;
}

function StopCard({
  stop,
  prevStop,
  nextStart,
  liveStartMin,
  isDragging,
  narrow,
  reducedMotion,
  onDragPreview,
  onCommitStart,
  onSwap,
  onMenu,
}: StopCardProps) {
  const [snapOffset, setSnapOffset] = useState(0);
  const pressTimerRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const origStartRef = useRef(stop.startMin);
  const draggingRef = useRef(false);

  const prevEnd = prevStop != null ? prevStop.startMin + prevStop.durationMin : RAIL_START_MIN;
  const endMin = liveStartMin + stop.durationMin;
  const price = effectivePrice(stop, liveStartMin);
  const happyHourOn = stop.happyHour != null && liveStartMin < stop.happyHour.endsMin;
  // Overlap slice vs the previous stop's committed end (conflict is a
  // WARNING, not a validation block — happy hour still fires alongside it).
  const overlapMin = Math.max(0, prevEnd - liveStartMin);
  const maxStart = RAIL_END_MIN - stop.durationMin;
  const canEarlier = liveStartMin - SNAP_MIN >= prevEnd && liveStartMin - SNAP_MIN >= RAIL_START_MIN;
  const canLater = endMin + SNAP_MIN <= nextStart && liveStartMin + SNAP_MIN <= maxStart;

  const clearTimer = () => {
    if (pressTimerRef.current != null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, [role="spinbutton"]') != null) return;
    startYRef.current = event.clientY;
    origStartRef.current = stop.startMin;
    event.currentTarget.setPointerCapture(event.pointerId);
    clearTimer();
    pressTimerRef.current = window.setTimeout(() => {
      draggingRef.current = true;
      onDragPreview(stop.id, stop.startMin);
    }, 450);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dy = event.clientY - startYRef.current;
    if (!draggingRef.current) {
      if (Math.abs(dy) > 8) clearTimer(); // moved before 450ms — a scroll
      return;
    }
    const preview = Math.max(RAIL_START_MIN, Math.min(maxStart, origStartRef.current + dy / PX_PER_MIN));
    onDragPreview(stop.id, preview);
  };
  const endDrag = () => {
    clearTimer();
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const snapped = Math.max(
      RAIL_START_MIN,
      Math.min(maxStart, Math.round(liveStartMin / SNAP_MIN) * SNAP_MIN),
    );
    const residual = (liveStartMin - snapped) * PX_PER_MIN;
    onCommitStart(stop.id, snapped);
    onDragPreview(stop.id, null);
    if (Math.abs(residual) > 0.5 && !reducedMotion) {
      setSnapOffset(residual);
      requestAnimationFrame(() => requestAnimationFrame(() => setSnapOffset(0)));
    }
  };

  const step = (delta: number) => {
    const next = liveStartMin + delta;
    if (delta < 0 && !canEarlier) return;
    if (delta > 0 && !canLater) return;
    onCommitStart(stop.id, next);
  };

  const timeRange = `${fmtClock(liveStartMin)} – ${fmtClock(endMin)}`;
  const metaBits = [stop.category];
  if (stop.walkToNextLabel !== '') metaBits.push(stop.walkToNextLabel);
  if (stop.locked === true) metaBits.push('reserved');

  return (
    <div
      style={{
        ...styles.stopCard,
        top: railY(liveStartMin),
        height: stop.durationMin * PX_PER_MIN,
        ...(isDragging ? styles.stopCardDragging : null),
        transform: snapOffset !== 0 ? `translateY(${snapOffset}px)` : undefined,
        transition:
          isDragging || reducedMotion
            ? 'none'
            : 'transform 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)', // spec snap easing
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}>
      {overlapMin > 0 ? (
        <div
          style={{
            ...styles.hatchBand,
            height: Math.min(overlapMin, stop.durationMin) * PX_PER_MIN,
          }}
          aria-hidden
        />
      ) : null}
      <div style={styles.stopRow1}>
        <span
          className="emb-focusable"
          style={styles.stopTime}
          role="spinbutton"
          tabIndex={0}
          aria-valuenow={liveStartMin}
          aria-valuemin={RAIL_START_MIN}
          aria-valuemax={maxStart}
          aria-valuetext={fmtClock(liveStartMin)}
          aria-label={`${stop.venue} start time — ArrowUp later, ArrowDown earlier`}
          onKeyDown={event => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              step(SNAP_MIN);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              step(-SNAP_MIN);
            }
          }}>
          {timeRange}
        </span>
        <span style={styles.stopCost}>{fmtUsd(price)}</span>
      </div>
      <div style={styles.stopVenue}>{stop.venue}</div>
      <div style={styles.stopMeta}>
        {metaBits.join(' · ')}
        {happyHourOn ? <span style={styles.stopHH}> · happy hour</span> : null}
      </div>
      {overlapMin > 0 && prevStop != null ? (
        <div style={styles.hatchCaption}>
          Overlaps {prevStop.venue} until {fmtClock(prevEnd)}
        </div>
      ) : null}
      <div style={styles.stopBar}>
        <div style={styles.stepperWrap}>
          <span style={styles.stepperTrackVisual} aria-hidden />
          <span style={styles.stepperHairline} aria-hidden />
          <button
            type="button"
            className="emb-btn emb-focusable"
            style={{...styles.stepperHalf, ...(canEarlier ? null : styles.stepperHalfDisabled)}}
            aria-label={`Earlier — move ${stop.venue} 15 minutes earlier`}
            disabled={!canEarlier}
            onClick={() => step(-SNAP_MIN)}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <button
            type="button"
            className="emb-btn emb-focusable"
            style={{...styles.stepperHalf, ...(canLater ? null : styles.stepperHalfDisabled)}}
            aria-label={`Later — move ${stop.venue} 15 minutes later`}
            disabled={!canLater}
            onClick={() => step(SNAP_MIN)}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </div>
        {narrow ? (
          <button
            type="button"
            className="emb-btn emb-focusable"
            style={{...styles.iconBtn, marginLeft: 'auto'}}
            aria-label={`Swap ${stop.venue}`}
            onClick={event => onSwap(stop.id, event.currentTarget)}>
            <Icon icon={Repeat2Icon} size="md" color="inherit" />
          </button>
        ) : (
          <button
            type="button"
            className="emb-btn emb-focusable"
            style={styles.swapBtnHit}
            onClick={event => onSwap(stop.id, event.currentTarget)}>
            <span style={styles.swapBtnPill}>Swap</span>
          </button>
        )}
        <button
          type="button"
          className="emb-btn emb-focusable"
          style={styles.iconBtn}
          aria-label={`More actions for ${stop.venue}`}
          onClick={event => onMenu(stop.id, event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EVENING RAIL — 840px vertical track at 2px/min; hour gridlines every
// 120px; duration-height StopCards; BufferSegments re-derive live between
// consecutive stops (tight amber < 10 min, 'No travel time' at overlap).
// ---------------------------------------------------------------------------

interface EveningRailProps {
  stops: Stop[];
  dragPreview: {stopId: string; startMin: number} | null;
  narrow: boolean;
  reducedMotion: boolean;
  onDragPreview: (stopId: string, startMin: number | null) => void;
  onCommitStart: (stopId: string, startMin: number) => void;
  onSwap: (stopId: string, opener: HTMLElement) => void;
  onMenu: (stopId: string, opener: HTMLElement) => void;
}

function EveningRail({
  stops,
  dragPreview,
  narrow,
  reducedMotion,
  onDragPreview,
  onCommitStart,
  onSwap,
  onMenu,
}: EveningRailProps) {
  return (
    <div style={styles.railWrap}>
      <div style={styles.timeGutter} aria-hidden>
        {HOUR_LABELS.map((label, index) => (
          <span key={label} style={{...styles.hourLabel, top: index * 120}}>
            {label}
          </span>
        ))}
      </div>
      <div style={styles.track}>
        {HOUR_LABELS.map((label, index) => (
          <div key={label} style={{...styles.gridline, top: index * 120}} aria-hidden />
        ))}
        {/* Buffers first (below cards). Heights derive from LIVE starts. */}
        {stops.slice(0, -1).map((stop, index) => {
          const next = stops[index + 1];
          const aEnd = liveStart(stop, dragPreview) + stop.durationMin;
          const bStart = liveStart(next, dragPreview);
          const gapMin = bStart - aEnd;
          if (gapMin <= 0) {
            return (
              <div key={`buf-${stop.id}`} style={{...styles.noTravelCaption, top: railY(bStart)}}>
                <span style={styles.noTravelPill}>No travel time</span>
              </div>
            );
          }
          const tight = gapMin < 10;
          return (
            <div
              key={`buf-${stop.id}`}
              style={{...styles.bufferSeg, top: railY(aEnd), height: gapMin * PX_PER_MIN}}>
              <span style={styles.bufferLine} aria-hidden />
              <span style={{...styles.bufferPill, ...(tight ? styles.bufferPillTight : null)}}>
                {tight ? `${gapMin} min gap · tight` : stop.walkToNextLabel || `${gapMin} min gap`}
              </span>
            </div>
          );
        })}
        {stops.map((stop, index) => (
          <StopCard
            key={stop.id}
            stop={stop}
            prevStop={index > 0 ? stops[index - 1] : null}
            nextStart={index < stops.length - 1 ? liveStart(stops[index + 1], dragPreview) : RAIL_END_MIN}
            liveStartMin={liveStart(stop, dragPreview)}
            isDragging={dragPreview != null && dragPreview.stopId === stop.id}
            narrow={narrow}
            reducedMotion={reducedMotion}
            onDragPreview={onDragPreview}
            onCommitStart={onCommitStart}
            onSwap={onSwap}
            onMenu={onMenu}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — two detents (MEDIUM 55% / LARGE calc(100%−56px)); the
// grabber is a real 'Resize sheet' button (click toggles, drag is garnish,
// >120px past medium closes); 52px header with 44×44 X; focus trapped.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
  // Transient pointer delta only — the detent lives in the state owner.
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startYRef.current = event.clientY;
    movedRef.current = false;
    setDragY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragY == null) return;
    const dy = event.clientY - startYRef.current;
    if (Math.abs(dy) > 8) movedRef.current = true;
    setDragY(dy);
  };
  const onGrabberPointerUp = () => {
    if (dragY == null) return;
    const dy = dragY;
    setDragY(null);
    if (!movedRef.current) return; // plain click → onClick toggles
    if (dy > 120 && detent === 'medium') onClose();
    else if (dy > 60 && detent === 'large') onDetentChange('medium');
    else if (dy < -60 && detent === 'medium') onDetentChange('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetentChange(detent === 'medium' ? 'large' : 'medium');
  };

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="emb-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="emb-btn emb-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="emb-btn emb-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWAP SHEET BODY — filter chips (first focus lands here, not on close) +
// AlternateRows whose DeltaBadges compute against the CURRENT plan stop.
// MEDIUM peeks 3 alternates + chips; LARGE scrolls all 8 (the one legal
// inner scroller is the sheetBody).
// ---------------------------------------------------------------------------

const SWAP_FILTERS: {id: SwapFilter; label: string; pred: (v: Venue) => boolean}[] = [
  {id: 'under40', label: 'Under $40', pred: v => v.priceUsd < 40}, // 3 of 8 ✓
  {id: 'walk10', label: '≤10 min walk', pred: v => v.walkMin <= 10}, // 2 of 8 ✓
  {id: 'late', label: 'Open late', pred: v => v.openLate}, // 5 of 8 ✓
];

interface SwapSheetBodyProps {
  stop: Stop;
  baseWalkMin: number; // the incoming walk leg being replaced
  filter: SwapFilter | null;
  onFilter: (filter: SwapFilter | null) => void;
  onChoose: (venue: Venue) => void;
}

function SwapSheetBody({stop, baseWalkMin, filter, onFilter, onChoose}: SwapSheetBodyProps) {
  const active = SWAP_FILTERS.find(f => f.id === filter) ?? null;
  const rows = active == null ? SWAP_VENUES : SWAP_VENUES.filter(active.pred);
  return (
    <div>
      <div style={styles.filterChipRow} role="group" aria-label="Filter alternates">
        {SWAP_FILTERS.map((f, index) => {
          const on = filter === f.id;
          const count = SWAP_VENUES.filter(f.pred).length; // derives live ✓
          return (
            <button
              key={f.id}
              type="button"
              data-first-focus={index === 0 ? true : undefined}
              className="emb-btn emb-focusable"
              style={styles.filterChipHit}
              aria-pressed={on}
              onClick={() => onFilter(on ? null : f.id)}>
              <span style={{...styles.filterChip, ...(on ? styles.filterChipOn : null)}}>
                {f.label} · {count}
              </span>
            </button>
          );
        })}
      </div>
      {rows.map((venue, index) => {
        const dPrice = venue.priceUsd - stop.priceUsd;
        const dWalk = venue.walkMin - baseWalkMin;
        const priceText = dPrice > 0 ? `+$${dPrice}` : dPrice < 0 ? `−$${-dPrice}` : '±$0';
        const priceColor =
          dPrice > 0 ? 'var(--color-text-primary)' : dPrice < 0 ? SAVE_GREEN : 'var(--color-text-secondary)';
        const walkText = dWalk === 0 ? 'same walk' : `${dWalk > 0 ? '+' : '−'}${Math.abs(dWalk)} min walk`;
        return (
          <div key={venue.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={styles.altRow}
              aria-label={`Swap to ${venue.name}, ${venue.priceLabel}, ${priceText}, ${walkText}`}
              onClick={() => onChoose(venue)}>
              <span style={styles.altText}>
                <span style={styles.spotPrimary}>{venue.name}</span>
                <span style={styles.spotSecondary}>
                  {venue.category} · {venue.priceLabel}
                  {venue.openLate ? ' · open late' : ''}
                </span>
              </span>
              <span style={styles.deltaCol}>
                <span style={{...styles.deltaBadge, color: priceColor}}>{priceText}</span>
                <span style={styles.deltaWalk}>{walkText}</span>
              </span>
            </button>
          </div>
        );
      })}
      {rows.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={SearchXIcon} size="lg" color="inherit" />
          </span>
          <h3 style={styles.emptyTitle}>No matches</h3>
          <p style={styles.emptyBody}>Clear the filter to see all 8 alternates.</p>
          <button type="button" className="emb-btn emb-focusable" style={styles.secondaryBtn} onClick={() => onFilter(null)}>
            Clear filter
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — the phone's verb picker for a stop's ellipsis: context
// header, Move to top / Duplicate / Remove stop (destructive LAST), then
// the separate Cancel card; first focus is Cancel (the safe default).
// ---------------------------------------------------------------------------

interface StopActionSheetProps {
  stop: Stop;
  canMoveTop: boolean;
  cancelRef: RefObject<HTMLButtonElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  onMoveTop: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onCancel: () => void;
}

function StopActionSheet({
  stop,
  canMoveTop,
  cancelRef,
  containerRef,
  onMoveTop,
  onDuplicate,
  onRemove,
  onCancel,
}: StopActionSheetProps) {
  const headerId = 'emb-action-header';
  return (
    <div
      ref={containerRef}
      style={styles.actionSheetWrap}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headerId}
      className="emb-sheet-in"
      onKeyDown={event => trapTabKey(event as ReactKeyboardEvent<HTMLDivElement>, containerRef.current)}>
      <div style={styles.actionCard}>
        <div id={headerId} style={styles.actionHeader}>
          {stop.venue} · {fmtClock(stop.startMin)} – {fmtClock(stop.startMin + stop.durationMin)}
        </div>
        {canMoveTop ? (
          <>
            <button type="button" className="emb-btn emb-focusable" style={styles.actionRow} onClick={onMoveTop}>
              Move to top
            </button>
            <div style={styles.actionDivider} />
          </>
        ) : null}
        <button type="button" className="emb-btn emb-focusable" style={styles.actionRow} onClick={onDuplicate}>
          Duplicate
        </button>
        <div style={styles.actionDivider} />
        <button
          type="button"
          className="emb-btn emb-focusable"
          style={{...styles.actionRow, ...styles.actionRowDestructive}}
          onClick={onRemove}>
          Remove stop
        </button>
      </div>
      <div style={styles.actionCard}>
        <button
          type="button"
          ref={cancelRef}
          className="emb-btn emb-focusable"
          style={{...styles.actionRow, ...styles.actionRowCancel}}
          onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SPOT ROW — 72px media row; matched substrings render at weight 600
// (weight, not color) while a query is active.
// ---------------------------------------------------------------------------

function matchedName(name: string, query: string): ReactNode {
  if (query === '') return name;
  const index = name.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return name;
  return (
    <>
      {name.slice(0, index)}
      <span style={{fontWeight: 600}}>{name.slice(index, index + query.length)}</span>
      {name.slice(index + query.length)}
    </>
  );
}

interface SpotRowProps {
  venue: Venue;
  query: string;
  onPress: () => void;
}

function SpotRow({venue, query, onPress}: SpotRowProps) {
  return (
    <button
      type="button"
      data-spot-row
      className="emb-btn emb-focusable"
      style={styles.spotRow}
      aria-label={`${venue.name}, ${venue.category}, ${venue.priceLabel}, ${venue.walkMin} minute walk`}
      onClick={onPress}>
      <span style={{...styles.spotThumb, background: thumbGradient(venue.id)}} aria-hidden />
      <span style={styles.spotText}>
        <span style={styles.spotPrimary}>{matchedName(venue.name, query)}</span>
        <span style={styles.spotSecondary}>
          {venue.category} · {venue.walkMin} min walk · {venue.walkMi} mi
          {venue.openLate ? ' · open late' : ''}
        </span>
      </span>
      <span style={styles.spotPrice}>{venue.priceLabel}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SWITCH ROW — 51×31 track, 27px white thumb, whole 44px row is the
// role=switch button. OFF track uses CONTROL_REST (≥3:1 amendment pair),
// ON track uses the brand fill.
// ---------------------------------------------------------------------------

interface SwitchRowProps {
  label: string;
  checked: boolean;
  isLast?: boolean;
  onToggle: () => void;
}

function SwitchRow({label, checked, isLast, onToggle}: SwitchRowProps) {
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="emb-btn emb-focusable"
        style={{...styles.utilityRow, width: '100%'}}
        onClick={onToggle}>
        <span style={{flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {label}
        </span>
        <span
          style={{...styles.switchTrack, background: checked ? BRAND_ACCENT : CONTROL_REST}}
          aria-hidden>
          <span
            style={{...styles.switchThumb, transform: checked ? 'translateX(20px)' : undefined}}
          />
        </span>
      </button>
      {isLast === true ? null : <div style={styles.rowDivider} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_DEFS: {id: TabId; label: string; icon: typeof MapPinIcon}[] = [
  {id: 'plan', label: 'Plan', icon: CalendarHeartIcon},
  {id: 'spots', label: 'Spots', icon: MapPinIcon},
  {id: 'shared', label: 'Shared', icon: UsersRoundIcon},
  {id: 'profile', label: 'Profile', icon: UserRoundIcon},
];

/** The venue payload that travels between rail slots (Move to top). */
function payloadOf(stop: Stop): Pick<Stop, 'venue' | 'category' | 'priceUsd' | 'priceLabel' | 'happyHour' | 'locked'> {
  return {
    venue: stop.venue,
    category: stop.category,
    priceUsd: stop.priceUsd,
    priceLabel: stop.priceLabel,
    happyHour: stop.happyHour,
    locked: stop.locked,
  };
}

export default function MobileDateNightBuilderTemplate() {
  // Container-width column decision (desktop stage ≥720px of WRAPPER width
  // → centered 430px phone column); viewport query is first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const narrow = wrapWidth > 0 && wrapWidth < 340; // Swap → 44×44 icon
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = usePlanStore();
  const {plan, spots, ui} = entities;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const alertCancelRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const alertOpenerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const spotsListRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  const [titleUnder, setTitleUnder] = useState(false);

  // ---- DERIVED (all in render — the RIPPLE LAW is free this way) ----------
  const stops = plan.stops;
  const drag = ui.dragPreview;
  const {arcs, spent, overshootLen} = ringArcs(stops, drag, plan.budgetCap);
  const over = spent > plan.budgetCap;
  const walkMi = Math.round(stops.slice(0, -1).reduce((sum, s) => sum + s.walkToNextMi, 0) * 10) / 10;
  const approvedCount = stops.filter(s => plan.approvals[s.id] === 'approved').length;
  const staleCount = stops.filter(s => plan.approvals[s.id] === 'stale').length;
  const overlayOpen = ui.openSheet != null || ui.actionStopId != null || ui.resetOpen;
  const detailVenue = spots.detailId != null ? ALL_VENUES.find(v => v.id === spots.detailId) ?? null : null;
  const swapStop = ui.swapStopId != null ? stops.find(s => s.id === ui.swapStopId) ?? null : null;
  const swapStopIndex = swapStop != null ? stops.indexOf(swapStop) : -1;
  const actionStop = ui.actionStopId != null ? stops.find(s => s.id === ui.actionStopId) ?? null : null;
  const queryTrim = spots.query.trim();
  const searchResults = queryTrim === ''
    ? []
    : ALL_VENUES.filter(
        v =>
          v.name.toLowerCase().includes(queryTrim.toLowerCase()) ||
          v.category.toLowerCase().includes(queryTrim.toLowerCase()),
      );

  const toastPatch = (text: string, opts?: {undo?: boolean; status?: boolean}) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo: opts?.undo === true, status: opts?.status === true}};
  };

  // ---- EFFECTS -------------------------------------------------------------

  // Large-title collapse — sentinel above the largeTitle; unobserved →
  // navBar title fades in (opacity swap only under reduced motion).
  useEffect(() => {
    if (ui.activeTab !== 'plan') return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(observed => {
      setTitleUnder(!(observed[0]?.isIntersecting ?? true));
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [ui.activeTab, stops.length]);

  // Focus into an opening sheet — preventScroll (amendment: plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen). Swap sheet's first focus lands on
  // the filter chip group, not the close button (a11y plan).
  useEffect(() => {
    if (ui.openSheet == null) return;
    const target =
      sheetRef.current?.querySelector<HTMLElement>('[data-first-focus]') ?? sheetRef.current;
    target?.focus({preventScroll: true});
    if (shellRef.current != null) shellRef.current.scrollTop = 0;
  }, [ui.openSheet]);
  useEffect(() => {
    if (ui.actionStopId != null) actionCancelRef.current?.focus({preventScroll: true});
  }, [ui.actionStopId]);
  useEffect(() => {
    if (ui.resetOpen) alertCancelRef.current?.focus({preventScroll: true});
  }, [ui.resetOpen]);

  // ---- OVERLAY LIFECYCLE ---------------------------------------------------

  const openSheet = (kind: 'swap' | 'budget', stopId: string | null, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {openSheet: kind, swapStopId: stopId, swapFilter: null, sheetDetent: 'medium', actionStopId: null});
  };
  const closeSheet = (focusTarget?: HTMLElement | null) => {
    update('ui', {openSheet: null, swapStopId: null, sheetDetent: 'medium'});
    (focusTarget ?? sheetOpenerRef.current)?.focus();
  };
  const openActionSheet = (stopId: string, opener: HTMLElement) => {
    actionOpenerRef.current = opener;
    update('ui', {actionStopId: stopId, openSheet: null});
  };
  const closeActionSheet = () => {
    update('ui', {actionStopId: null});
    actionOpenerRef.current?.focus();
  };
  const closeAlert = () => {
    update('ui', {resetOpen: false});
    alertOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: alert > action sheet > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.resetOpen) closeAlert();
      else if (ui.actionStopId != null) closeActionSheet();
      else if (ui.openSheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.resetOpen, ui.actionStopId, ui.openSheet]);

  // ---- MUTATIONS (every commit ripples: buffers, meta, ring, Shared) ------

  /** Core edit: patch a stop, re-sort by start, flip approved → stale. */
  const editStop = (
    stopId: string,
    patch: Partial<Stop>,
    extraUi?: Partial<UiEntity>,
  ) => {
    setEntities(prev => {
      const nextStops = prev.plan.stops
        .map(s => (s.id === stopId ? {...s, ...patch} : s))
        .sort((a, b) => a.startMin - b.startMin);
      const approvals =
        prev.plan.approvals[stopId] === 'approved'
          ? {...prev.plan.approvals, [stopId]: 'stale' as Approval}
          : prev.plan.approvals;
      return {
        ...prev,
        plan: {...prev.plan, stops: nextStops, approvals},
        ui: {...prev.ui, ...extraUi},
      };
    });
  };

  const commitStart = (stopId: string, startMin: number) => {
    editStop(stopId, {startMin, startLabel: fmtClock(startMin)});
  };
  const setDragPreview = (stopId: string, startMin: number | null) => {
    update('ui', {dragPreview: startMin == null ? null : {stopId, startMin}});
  };

  const chooseAlternate = (venue: Venue) => {
    if (swapStop == null) return;
    const prevStop = swapStopIndex > 0 ? stops[swapStopIndex - 1] : null;
    const dPrice = venue.priceUsd - swapStop.priceUsd;
    const deltaText = dPrice < 0 ? `$${-dPrice} under plan` : dPrice > 0 ? `$${dPrice} over plan` : 'matches plan';
    setEntities(prev => {
      const nextStops = prev.plan.stops.map(s => {
        if (s.id === swapStop.id) {
          // Swapping the venue drops the outgoing venue's happy-hour deal.
          return {
            ...s,
            venue: venue.name,
            category: venue.category,
            priceUsd: venue.priceUsd,
            priceLabel: venue.priceLabel,
            happyHour: undefined,
            locked: undefined,
          };
        }
        if (prevStop != null && s.id === prevStop.id) {
          return {
            ...s,
            walkToNextMin: venue.walkMin,
            walkToNextMi: venue.walkMi,
            walkToNextLabel: `${venue.walkMin} min walk · ${venue.walkMi} mi`,
          };
        }
        return s;
      });
      const approvals =
        prev.plan.approvals[swapStop.id] === 'approved'
          ? {...prev.plan.approvals, [swapStop.id]: 'stale' as Approval}
          : prev.plan.approvals;
      return {
        ...prev,
        plan: {...prev.plan, stops: nextStops, approvals},
        ui: {
          ...prev.ui,
          openSheet: null,
          swapStopId: null,
          sheetDetent: 'medium',
          ...toastPatch(`Swapped to ${venue.name} — ${deltaText}`),
        },
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // Move to top — the venue payload rotates into the FIRST rail slot (slot
  // times and walk legs stay put); every touched approved slot goes stale.
  const moveToTop = (stopId: string) => {
    const index = stops.findIndex(s => s.id === stopId);
    if (index <= 0) return;
    setEntities(prev => {
      const ordered = prev.plan.stops;
      const payloads = ordered.map(payloadOf);
      const moved = payloads[index];
      const rotated = [moved, ...payloads.slice(0, index), ...payloads.slice(index + 1)];
      const nextStops = ordered.map((s, i) => ({...s, ...rotated[i]}));
      const approvals = {...prev.plan.approvals};
      for (let i = 0; i <= index; i++) {
        const id = ordered[i].id;
        if (approvals[id] === 'approved') approvals[id] = 'stale';
      }
      return {
        ...prev,
        plan: {...prev.plan, stops: nextStops, approvals},
        ui: {
          ...prev.ui,
          actionStopId: null,
          ...toastPatch(`${moved.venue} moved to ${fmtClock(ordered[0].startMin)}`),
        },
      };
    });
    actionOpenerRef.current?.focus();
  };

  const duplicateStop = (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    if (stop == null) return;
    const last = stops[stops.length - 1];
    const lastEnd = last.startMin + last.durationMin;
    const startMin = Math.max(RAIL_START_MIN, Math.min(lastEnd + 15, RAIL_END_MIN - stop.durationMin));
    const copyCount = stops.filter(s => s.id.startsWith(`${stopId}-copy`)).length;
    const newId = `${stopId}-copy${copyCount + 1}`;
    setEntities(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        stops: [
          ...prev.plan.stops,
          {...stop, id: newId, startMin, startLabel: fmtClock(startMin), walkToNextMin: 0, walkToNextMi: 0, walkToNextLabel: ''},
        ].sort((a, b) => a.startMin - b.startMin),
        approvals: {...prev.plan.approvals, [newId]: 'pending'},
      },
      ui: {...prev.ui, actionStopId: null, ...toastPatch(`${stop.venue} duplicated · ${fmtClock(startMin)}`)},
    }));
    actionOpenerRef.current?.focus();
  };

  // UNDO OVER CONFIRM — remove executes immediately; the persistent toast
  // (no timer) offers Undo; the chain restores in original order.
  const removeStop = (stopId: string) => {
    const index = stops.findIndex(s => s.id === stopId);
    if (index < 0) return;
    const stop = stops[index];
    setEntities(prev => {
      const approvals = {...prev.plan.approvals};
      const approval = approvals[stopId] ?? 'pending';
      delete approvals[stopId];
      return {
        ...prev,
        plan: {...prev.plan, stops: prev.plan.stops.filter(s => s.id !== stopId), approvals},
        ui: {
          ...prev.ui,
          actionStopId: null,
          removedStack: [...prev.ui.removedStack, {stop, index, approval}],
          ...toastPatch(`${stop.venue} removed`, {undo: true}),
        },
      };
    });
    actionOpenerRef.current?.focus();
  };
  const undoRemove = () => {
    setEntities(prev => {
      const stack = prev.ui.removedStack;
      if (stack.length === 0) return prev;
      const entry = stack[stack.length - 1];
      const nextStops = [...prev.plan.stops];
      nextStops.splice(Math.min(entry.index, nextStops.length), 0, entry.stop);
      return {
        ...prev,
        plan: {
          ...prev.plan,
          stops: nextStops.sort((a, b) => a.startMin - b.startMin),
          approvals: {...prev.plan.approvals, [entry.stop.id]: entry.approval},
        },
        ui: {
          ...prev.ui,
          removedStack: stack.slice(0, -1),
          ...toastPatch(`${entry.stop.venue} restored`, {undo: stack.length > 1}),
        },
      };
    });
  };

  const addFirstStop = () => {
    setEntities(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        stops: [{...STOP_PREGAME}],
        approvals: {...prev.plan.approvals, pregame: 'pending'},
      },
      ui: {...prev.ui, ...toastPatch('Stop added · 6:30 PM')},
    }));
  };

  const sendUpdate = () => {
    setEntities(prev => {
      const approvals = Object.fromEntries(
        Object.entries(prev.plan.approvals).map(([id, a]) => [id, a === 'stale' ? 'pending' : a]),
      ) as Record<string, Approval>;
      return {
        ...prev,
        plan: {...prev.plan, approvals, sentAt: 'Sent just now'},
        ui: {...prev.ui, ...toastPatch(`Update sent to ${PARTNER}`)},
      };
    });
  };

  // Honest reset (the one alert-worthy irreversible): restores the shipped
  // fixture wholesale.
  const resetPlan = () => {
    setEntities({
      ...INITIAL_ENTITIES,
      ui: {...INITIAL_ENTITIES.ui, activeTab: 'profile', ...toastPatch('Plan reset to the Friday draft')},
    });
  };

  // ---- TABS (per-tab persistence; the one legal reset) ---------------------

  const selectTab = (next: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (ui.activeTab === next) {
      // Re-tapping the active tab pops to root + scrolls to top.
      scroller.scrollTop = 0;
      setEntities(prev => ({
        ...prev,
        spots: next === 'spots' ? {...prev.spots, detailId: null} : prev.spots,
        ui: {...prev.ui, scrollByTab: {...prev.ui.scrollByTab, [next]: 0}},
      }));
      return;
    }
    const departingTop = scroller.scrollTop;
    const restoreTop = ui.scrollByTab[next] ?? 0;
    setEntities(prev => ({
      ...prev,
      // Overlays close on tab switch (they belong to their moment); the
      // toast dock, queries, pushed detail, and scroll offsets persist.
      ui: {
        ...prev.ui,
        activeTab: next,
        openSheet: null,
        swapStopId: null,
        actionStopId: null,
        resetOpen: false,
        dragPreview: null,
        scrollByTab: {...prev.ui.scrollByTab, [prev.ui.activeTab]: departingTop},
      },
    }));
    requestAnimationFrame(() => {
      scroller.scrollTop = restoreTop;
    });
  };

  // ---- SPOTS ---------------------------------------------------------------

  const refreshSpots = () => {
    update('spots', {skeleton: true});
    update('ui', toastPatch('Loading', {status: true}));
  };
  // Skeleton resolves on the NEXT user interaction (never a timer).
  const onShellPointerDownCapture = () => {
    if (spots.skeleton) {
      update('spots', {skeleton: false});
      update('ui', toastPatch('Updated just now', {status: true}));
    }
  };
  const runSearch = (query: string) => {
    update('spots', {query, skeleton: false});
  };
  const announceResults = () => {
    if (queryTrim === '') return;
    update('ui', toastPatch(`${searchResults.length} spots for “${queryTrim}”`, {status: true}));
  };
  const cancelSearch = () => {
    update('spots', {query: '', searchFocused: false});
    searchInputRef.current?.blur();
  };
  const loadMoreSpots = () => {
    update('spots', {shownCount: ALL_VENUES.length});
    update('ui', toastPatch('8 more loaded', {status: true}));
    requestAnimationFrame(() => {
      const rows = spotsListRef.current?.querySelectorAll<HTMLElement>('[data-spot-row]');
      rows?.[SPOTS_PAGE_SIZE]?.focus();
    });
  };
  const swapFromDetail = (venue: Venue, opener: HTMLElement) => {
    if (stops.length === 0) {
      setEntities(prev => ({
        ...prev,
        plan: {
          ...prev.plan,
          stops: [
            {
              ...STOP_NIGHTCAP,
              id: 'nightcap',
              venue: venue.name,
              category: venue.category,
              priceUsd: venue.priceUsd,
              priceLabel: venue.priceLabel,
              happyHour: undefined,
            },
          ],
          approvals: {...prev.plan.approvals, nightcap: 'pending'},
        },
        ui: {...prev.ui, ...toastPatch(`${venue.name} added · 10:15 PM`)},
      }));
      return;
    }
    sheetOpenerRef.current = opener;
    update('ui', {openSheet: 'swap', swapStopId: stops[stops.length - 1].id, swapFilter: null, sheetDetent: 'medium'});
  };

  // ---- PROFILE -------------------------------------------------------------

  const stepCap = (delta: number) => {
    const next = Math.max(100, Math.min(400, plan.budgetCap + delta));
    if (next !== plan.budgetCap) update('plan', {budgetCap: next});
  };

  // ---- RENDER --------------------------------------------------------------

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const navTitleVisible = ui.activeTab !== 'plan' || stops.length === 0 || titleUnder;
  const navTitleText =
    ui.activeTab === 'spots' && detailVenue != null ? detailVenue.name : `Friday · You + ${PARTNER}`;
  const shownVenues = ALL_VENUES.slice(0, spots.shownCount);
  const spotsExhausted = spots.shownCount >= ALL_VENUES.length;
  const approvalLine =
    staleCount > 0
      ? `${PARTNER} approved ${approvedCount} of ${stops.length} stops · ${staleCount} changed`
      : `${PARTNER} approved ${approvedCount} of ${stops.length} stops`;

  const renderPlan = () => (
    <>
      <div ref={sentinelRef} aria-hidden />
      <div style={styles.largeTitle}>
        <h1 style={styles.largeTitleText}>Friday · You + {PARTNER}</h1>
      </div>
      <div style={styles.metaStrip}>
        <span>{stops.length} stops</span>
        <span aria-hidden>·</span>
        <span style={{...styles.metaMiddle, ...(over ? styles.metaOver : null)}}>
          {fmtUsd(spent)} of {fmtUsd(plan.budgetCap)}
          {over ? ` · $${spent - plan.budgetCap} over` : ''}
        </span>
        <span aria-hidden>·</span>
        <span>{walkMi} mi walk</span>
      </div>
      {stops.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={CalendarIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No stops planned</h2>
          <p style={styles.emptyBody}>Build the evening one spot at a time.</p>
          {/* 48px primary — creation IS this screen's verb. */}
          <button type="button" className="emb-btn emb-focusable" style={styles.primaryBtn} onClick={addFirstStop}>
            Add your first stop
          </button>
        </div>
      ) : (
        <EveningRail
          stops={stops}
          dragPreview={drag}
          narrow={narrow}
          reducedMotion={reducedMotion}
          onDragPreview={setDragPreview}
          onCommitStart={commitStart}
          onSwap={(stopId, opener) => openSheet('swap', stopId, opener)}
          onMenu={openActionSheet}
        />
      )}
    </>
  );

  const renderSpotsRoot = () => (
    <>
      <h2 className="emb-vh">Spots</h2>
      <div style={styles.searchBar}>
        <div style={styles.searchField}>
          <Icon icon={SearchIcon} size="sm" color="inherit" />
          <input
            ref={searchInputRef}
            type="search"
            className="emb-focusable"
            style={styles.searchInput}
            placeholder="Search spots"
            aria-label="Search spots"
            value={spots.query}
            onFocus={() => update('spots', {searchFocused: true})}
            onChange={event => runSearch(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') announceResults();
              if (event.key === 'Escape') {
                if (spots.query !== '') runSearch('');
                else cancelSearch();
              }
            }}
          />
          {spots.query !== '' ? (
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={styles.searchClearHit}
              aria-label="Clear search"
              onClick={() => {
                runSearch('');
                searchInputRef.current?.focus();
              }}>
              <Icon icon={XCircleIcon} size="sm" color="inherit" />
            </button>
          ) : null}
        </div>
        {spots.searchFocused || spots.query !== '' ? (
          <button type="button" className="emb-btn emb-focusable" style={styles.searchCancel} onClick={cancelSearch}>
            Cancel
          </button>
        ) : null}
      </div>
      {spots.skeleton ? (
        <div style={{...styles.listCard, ...styles.shimmerHost, marginTop: 12}} aria-busy="true">
          {SKELETON_PRIMARY.map((primary, index) => (
            <div key={primary + index}>
              {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
              <div style={styles.skeletonRow} aria-hidden>
                <span style={styles.skelThumb} />
                <span style={styles.skelBars}>
                  <span style={{...styles.skelBar, width: primary}} />
                  <span style={{...styles.skelBar, width: SKELETON_SECONDARY[index]}} />
                </span>
              </div>
            </div>
          ))}
          <div className="emb-shimmer" style={styles.shimmerSweep} aria-hidden />
        </div>
      ) : spots.searchFocused && spots.query === '' ? (
        <>
          <div style={{...styles.sectionHeader, display: 'flex', alignItems: 'center'}}>
            <span style={{flex: 1}}>Recent</span>
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={styles.recentClear}
              onClick={() => update('spots', {recents: []})}>
              Clear
            </button>
          </div>
          <div style={styles.listCard}>
            {spots.recents.length === 0 ? (
              <div style={{...styles.utilityRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
                No recent searches
              </div>
            ) : (
              spots.recents.map((recent, index) => (
                <div key={recent}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <button
                      type="button"
                      className="emb-btn emb-focusable"
                      style={styles.recentRow}
                      onClick={() => {
                        runSearch(recent);
                        update('ui', toastPatch(`${ALL_VENUES.filter(v => v.name.toLowerCase().includes(recent) || v.category.toLowerCase().includes(recent)).length} spots for “${recent}”`, {status: true}));
                      }}>
                      <Icon icon={ClockIcon} size="sm" color="secondary" />
                      <span style={{flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {recent}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="emb-btn emb-focusable"
                      style={styles.iconBtn}
                      aria-label={`Remove recent search ${recent}`}
                      onClick={() => update('spots', {recents: spots.recents.filter(r => r !== recent)})}>
                      <Icon icon={XIcon} size="sm" color="inherit" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : queryTrim !== '' ? (
        searchResults.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyCircle}>
              <Icon icon={SearchXIcon} size="lg" color="inherit" />
            </span>
            <h3 style={styles.emptyTitle}>No spots for “{queryTrim}”</h3>
            <p style={styles.emptyBody}>Try a venue name or a category.</p>
            <button type="button" className="emb-btn emb-focusable" style={styles.secondaryBtn} onClick={() => runSearch('')}>
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div style={{...styles.listCard, marginTop: 12}}>
              {searchResults.map((venue, index) => (
                <div key={venue.id}>
                  {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                  <SpotRow venue={venue} query={queryTrim} onPress={() => update('spots', {detailId: venue.id})} />
                </div>
              ))}
            </div>
            <p style={styles.terminalCaption}>
              {searchResults.length} of {ALL_VENUES.length} spots match
            </p>
          </>
        )
      ) : (
        <>
          <div ref={spotsListRef} style={{...styles.listCard, marginTop: 12}}>
            {shownVenues.map((venue, index) => (
              <div key={venue.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                <SpotRow venue={venue} query="" onPress={() => update('spots', {detailId: venue.id})} />
              </div>
            ))}
            {!spotsExhausted ? (
              <>
                <div style={styles.rowDivider} />
                <button type="button" className="emb-btn emb-focusable" style={styles.loadMoreRow} onClick={loadMoreSpots}>
                  Show {ALL_VENUES.length - spots.shownCount} more
                </button>
              </>
            ) : null}
          </div>
          {spotsExhausted ? <p style={styles.terminalCaption}>All {ALL_VENUES.length} spots</p> : null}
        </>
      )}
    </>
  );

  const renderSpotDetail = (venue: Venue) => (
    <>
      <div style={{...styles.detailHero, background: thumbGradient(venue.id)}} aria-hidden />
      <h2 style={styles.detailName}>{venue.name}</h2>
      <p style={styles.detailMeta}>
        {venue.category} · {venue.walkMin} min walk · {venue.walkMi} mi
      </p>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span>Estimated spend</span>
          <span style={styles.utilityValue}>{venue.priceLabel} for two</span>
        </div>
        <div style={styles.rowDivider} />
        <div style={styles.utilityRow}>
          <span>Open late</span>
          <span style={styles.utilityValue}>{venue.openLate ? 'Past 1 AM' : 'Closes midnight'}</span>
        </div>
        <div style={styles.rowDivider} />
        <div style={styles.utilityRow}>
          <span>Walk from previous stop</span>
          <span style={styles.utilityValue}>{venue.walkMin} min</span>
        </div>
      </div>
      <div style={styles.detailFooterPad}>
        <button
          type="button"
          className="emb-btn emb-focusable"
          style={styles.primaryBtn}
          onClick={event => swapFromDetail(venue, event.currentTarget)}>
          {stops.length === 0 ? 'Add as first stop' : `Swap in for ${stops[stops.length - 1].venue}`}
        </button>
      </div>
    </>
  );

  const renderShared = () => (
    <>
      <h2 style={styles.sectionHeader}>What {PARTNER} sees</h2>
      <div style={styles.listCard}>
        {stops.length === 0 ? (
          <div style={{...styles.utilityRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
            Nothing shared yet — the plan is empty
          </div>
        ) : (
          stops.map((stop, index) => (
            <div key={stop.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.sharedRow}>
                <span
                  style={{...styles.swatchDot, background: STOP_SWATCHES[index % STOP_SWATCHES.length]}}
                  aria-hidden
                />
                <span style={styles.sharedText}>
                  <span style={styles.sharedPrimary}>{stop.venue}</span>
                  <span style={styles.sharedSecondary}>
                    {fmtClock(stop.startMin)} – {fmtClock(stop.startMin + stop.durationMin)} ·{' '}
                    {fmtUsd(effectivePrice(stop, stop.startMin))}
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={styles.approvalCount}>{approvalLine}</div>
      <div style={{...styles.chipRow, paddingTop: 8}}>
        {stops.map(stop => {
          const approval = plan.approvals[stop.id] ?? 'pending';
          const chipStyle =
            approval === 'approved' ? styles.chipApproved : approval === 'stale' ? styles.chipStale : styles.chipPending;
          const stateLabel =
            approval === 'approved' ? `${PARTNER} ✓` : approval === 'stale' ? 'Changed since approval' : 'Pending';
          return (
            <span
              key={stop.id}
              style={{...styles.chip, ...chipStyle}}
              aria-label={`${stop.venue}: ${approval === 'stale' ? 'changed since approval' : approval}`}>
              {approval === 'approved' ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
              {stop.venue.split(' ')[0]} · {stateLabel}
            </span>
          );
        })}
      </div>
      <div style={styles.sentCaption}>{plan.sentAt}</div>
    </>
  );

  const renderProfile = () => (
    <>
      <h2 style={styles.sectionHeader}>Budget</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={{flex: 1}}>Evening cap</span>
          <div style={styles.stepperWrap}>
            <span style={styles.stepperTrackVisual} aria-hidden />
            <span style={styles.stepperHairline} aria-hidden />
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={{...styles.stepperHalf, ...(plan.budgetCap <= 100 ? styles.stepperHalfDisabled : null)}}
              aria-label="Decrease evening cap"
              disabled={plan.budgetCap <= 100}
              onClick={() => stepCap(-25)}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={{...styles.stepperHalf, ...(plan.budgetCap >= 400 ? styles.stepperHalfDisabled : null)}}
              aria-label="Increase evening cap"
              disabled={plan.budgetCap >= 400}
              onClick={() => stepCap(25)}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </div>
          <span
            className="emb-focusable"
            style={{...styles.utilityValue, marginLeft: 8, color: 'var(--color-text-primary)'}}
            role="spinbutton"
            tabIndex={0}
            aria-valuenow={plan.budgetCap}
            aria-valuemin={100}
            aria-valuemax={400}
            aria-valuetext={`$${plan.budgetCap}`}
            aria-label="Evening cap in dollars — ArrowUp and ArrowDown step $25"
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                stepCap(25);
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                stepCap(-25);
              }
            }}>
            {fmtUsd(plan.budgetCap)}
          </span>
        </div>
      </div>
      <h2 style={styles.sectionHeader}>Notifications</h2>
      <div style={styles.listCard}>
        <SwitchRow
          label="Reservation nudges"
          checked={plan.notifNudges}
          onToggle={() => update('plan', {notifNudges: !plan.notifNudges})}
        />
        <SwitchRow
          label="Happy-hour alerts"
          checked={plan.notifHappyHour}
          isLast
          onToggle={() => update('plan', {notifHappyHour: !plan.notifHappyHour})}
        />
      </div>
      <h2 style={styles.sectionHeader}>Plan</h2>
      <div style={styles.listCard}>
        <button
          type="button"
          className="emb-btn emb-focusable"
          style={{...styles.utilityRow, width: '100%', color: 'var(--color-error)', fontWeight: 500}}
          onClick={event => {
            alertOpenerRef.current = event.currentTarget;
            update('ui', {resetOpen: true});
          }}>
          Reset plan
        </button>
      </div>
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{EMB_CSS}</style>
      <div ref={shellRef} style={shellStyle} onPointerDownCapture={onShellPointerDownCapture}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {ui.activeTab === 'spots' && detailVenue != null ? (
              <button
                type="button"
                className="emb-btn emb-focusable"
                style={styles.backBtn}
                aria-label="Back to Spots"
                onClick={() => update('spots', {detailId: null})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Spots</span>
              </button>
            ) : (
              <button
                type="button"
                className="emb-btn emb-focusable"
                style={styles.iconBtn}
                aria-label="Emberly — back to top"
                onClick={() => selectTab(ui.activeTab)}>
                <EmberlyMark />
              </button>
            )}
          </div>
          <span className="emb-fade" style={{...styles.navTitle, opacity: navTitleVisible ? 1 : 0}}>
            {navTitleText}
          </span>
          <div style={styles.navTrailing}>
            {ui.activeTab === 'spots' && detailVenue == null ? (
              <button
                type="button"
                className="emb-btn emb-focusable"
                style={styles.iconBtn}
                aria-label="Refresh spots"
                onClick={refreshSpots}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : null}
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={styles.iconBtn}
              aria-label={
                over
                  ? `$${spent} of $${plan.budgetCap} planned, $${spent - plan.budgetCap} over — view breakdown`
                  : `$${spent} of $${plan.budgetCap} planned — view breakdown`
              }
              onClick={event => openSheet('budget', null, event.currentTarget)}>
              <BudgetRing arcs={arcs} overshootLen={overshootLen} />
            </button>
          </div>
        </header>

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {ui.activeTab !== 'plan' ? <h1 className="emb-vh">Friday · You + {PARTNER}</h1> : null}
          {ui.activeTab === 'plan' ? renderPlan() : null}
          {ui.activeTab === 'spots' ? (detailVenue != null ? renderSpotDetail(detailVenue) : renderSpotsRoot()) : null}
          {ui.activeTab === 'shared' ? renderShared() : null}
          {ui.activeTab === 'profile' ? renderProfile() : null}
          <div style={styles.bottomSpacer} />
        </main>

        {/* THE single polite live region — sticky dock 76px above the
            viewport bottom (156 on Shared, clearing its sticky footer);
            Undo toasts persist until replaced (no timers). */}
        <div
          style={{...styles.toastAnchor, bottom: ui.activeTab === 'shared' ? 156 : 76}}
          aria-live="polite">
          {ui.toast != null ? (
            <div
              key={ui.toast.seq}
              style={styles.toastCard}
              className="emb-fade"
              role={ui.toast.status ? 'status' : undefined}>
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undo ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="emb-btn emb-focusable" style={styles.undoBtn} onClick={undoRemove}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {ui.activeTab === 'shared' ? (
          <div style={styles.sharedFooter}>
            {/* Never disabled — even all-stale plans can be sent. */}
            <button type="button" className="emb-btn emb-focusable" style={styles.primaryBtn} onClick={sendUpdate}>
              Send update to {PARTNER}
            </button>
          </div>
        ) : null}

        <nav style={styles.tabBar} aria-label="Emberly tabs">
          {TAB_DEFS.map(tab => {
            const active = ui.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="emb-btn emb-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-current={active ? 'page' : undefined}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'shared' && staleCount > 0 ? (
                    <span style={styles.tabBadge}>{staleCount}</span>
                  ) : null}
                </span>
                <span style={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {ui.openSheet != null || ui.actionStopId != null ? (
          <div
            style={styles.sheetScrim}
            onClick={() => (ui.actionStopId != null ? closeActionSheet() : closeSheet())}
            aria-hidden
          />
        ) : null}
        {ui.openSheet === 'swap' && swapStop != null ? (
          <Sheet
            titleId="emb-swap-title"
            title={`Swap ${swapStop.venue}`}
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={() => closeSheet()}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <SwapSheetBody
              stop={swapStop}
              baseWalkMin={swapStopIndex > 0 ? stops[swapStopIndex - 1].walkToNextMin : 0}
              filter={ui.swapFilter}
              onFilter={filter => update('ui', {swapFilter: filter})}
              onChoose={chooseAlternate}
            />
          </Sheet>
        ) : null}
        {ui.openSheet === 'budget' ? (
          <Sheet
            titleId="emb-budget-title"
            title="Budget breakdown"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={() => closeSheet()}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <div>
              {stops.map((stop, index) => (
                <div key={stop.id}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <div style={styles.sharedRow}>
                    <span
                      style={{...styles.budgetSwatch, background: STOP_SWATCHES[index % STOP_SWATCHES.length]}}
                      aria-hidden
                    />
                    <span style={styles.sharedText}>
                      <span style={styles.sharedPrimary}>{stop.venue}</span>
                      <span style={styles.sharedSecondary}>
                        {fmtClock(liveStart(stop, drag))} – {fmtClock(liveStart(stop, drag) + stop.durationMin)}
                      </span>
                    </span>
                    <span style={styles.spotPrice}>{fmtUsd(effectivePrice(stop, liveStart(stop, drag)))}</span>
                  </div>
                </div>
              ))}
              <div style={styles.rowDivider} />
              <div style={styles.utilityRow}>
                <span style={{fontWeight: 600}}>Evening cap</span>
                <span style={{...styles.utilityValue, fontWeight: 600, color: 'var(--color-text-primary)'}}>
                  {fmtUsd(plan.budgetCap)}
                </span>
              </div>
              <div style={styles.utilityRow}>
                <span style={{color: over ? 'var(--color-error)' : 'var(--color-text-secondary)'}}>
                  {over ? `$${spent - plan.budgetCap} over cap` : `$${plan.budgetCap - spent} remaining`}
                </span>
              </div>
            </div>
          </Sheet>
        ) : null}
        {actionStop != null ? (
          <StopActionSheet
            stop={actionStop}
            canMoveTop={stops.indexOf(actionStop) > 0}
            cancelRef={actionCancelRef}
            containerRef={actionSheetRef}
            onMoveTop={() => moveToTop(actionStop.id)}
            onDuplicate={() => duplicateStop(actionStop.id)}
            onRemove={() => removeStop(actionStop.id)}
            onCancel={closeActionSheet}
          />
        ) : null}
        {ui.resetOpen ? (
          <>
            {/* Alert scrim does NOT dismiss — an alert demands a choice. */}
            <div style={styles.alertScrim} aria-hidden />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="emb-reset-title"
              aria-describedby="emb-reset-body"
              style={styles.alert}
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={styles.alertBody}>
                <h2 id="emb-reset-title" style={styles.alertTitle}>
                  Reset plan?
                </h2>
                <p id="emb-reset-body" style={styles.alertText}>
                  Every stop, edit, and approval goes back to the Friday draft. This can't be undone.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  ref={alertCancelRef}
                  className="emb-btn emb-focusable"
                  style={styles.alertBtn}
                  onClick={closeAlert}>
                  Cancel
                </button>
                <span style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="emb-btn emb-focusable"
                  style={{...styles.alertBtn, fontWeight: 600, color: 'var(--color-error)'}}
                  onClick={resetPlan}>
                  Reset
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
