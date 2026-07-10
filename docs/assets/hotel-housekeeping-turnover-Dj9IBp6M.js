var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file hotel-housekeeping-turnover.tsx
 * @input Deterministic Turndown fixtures only: the Bellwether Hotel's three
 *   guest floors for Fri Jul 10 — 36 rooms, every one a literal with
 *   number, type code (K / QQ / STE), and an authored housekeeping state.
 *   Initial state census cross-checks by hand: 10 ready + 9 occupied
 *   (stayovers) + 7 dirty + 4 cleaning + 5 awaiting inspection + 1 out of
 *   order = 36; "left to turn" = 7 + 4 + 5 = 16 (Floor 4: 2+2+3 = 7 ·
 *   Floor 3: 2+1+1 = 4 · Floor 2: 3+1+1 = 5). Eight authored arrivals
 *   map to rooms by id — exactly TWO of their rooms (302, 202) start
 *   ready, so arrivals readiness opens at 2/8 = 25%. The inspection
 *   queue opens with 5 rooms split Marisol 3 / Ken 2. Four attendants
 *   rotate onto new cleans in a fixed order. No clock reads, no
 *   randomness, no timers, no network assets; every ETA is a fixed
 *   string.
 * @output Turndown — Hotel Housekeeping Turnover: an exec-housekeeper
 *   surface for the 3:00 PM check-in push. A brand header (turned-sheet
 *   mark, property + date scope, four derived stat tiles: arrivals today,
 *   arrivals ready %, awaiting inspection, rooms left to turn) sits over
 *   a two-region body: the FLOOR BOARD — three floor sections, each a
 *   48px floor header with a live turned/left readout and a grid of 72px
 *   state-coded room tiles (ready / stayover / dirty / cleaning with
 *   attendant name / awaiting inspection / out of order, plus arrival-ETA
 *   chips, VIP stars, and REDO badges) — beside a 328px rail stacking the
 *   INSPECTOR QUEUE (ordered cards per inspector with Pass and Fail
 *   actions; Fail expands an inline three-reason picker), the ARRIVALS
 *   list (guest, ETA, VIP flag, and a room-state chip that live-tracks
 *   the tile), and the housekeeping log. Signature move: the whole state
 *   machine is drivable — tapping a dirty tile starts a clean (attendant
 *   assigned from the fixed rotation), tapping that cleaning tile sends
 *   it to the least-loaded inspector's queue, and PASSING it flips the
 *   tile to ready, re-derives arrivals readiness and left-to-turn, and
 *   shrinks the queue in the same render — while FAILING it (Linens /
 *   Bathroom / Amenities) BOUNCES the tile back to cleaning with a REDO
 *   badge and a shake, and the arrival chip tracking that room falls
 *   back with it. Stayover and out-of-order tiles refuse with the exact
 *   reason ("Room 311 is out of order — engineering ticket EN-2214,
 *   back Jul 12"). Tapping an arrival highlights its room tile; Escape
 *   clears. Every mutation appends to the log and announces through a
 *   visually hidden live region.
 * @position Page template; emitted by \`astryx template hotel-housekeeping-turnover\`
 *
 * Frame: Layout height="fill" → LayoutHeader (brand + stat strip) →
 *   LayoutContent padding 0 → \`.hht-body\` hand-rolled grid
 *   \`minmax(0, 1fr) 328px\` (hand-rolled rather than LayoutPanel so the
 *   <=900px restructure — the inspector queue re-stacks ABOVE the floors
 *   as a horizontal strip — is pure CSS; a DS panel would pin the rail
 *   width inline and defeat the media query). Left cell scrolls the
 *   floor board; right cell scrolls queue + arrivals + log. ONE state
 *   owner: \`rooms\`, \`queue\`, \`assignCounter\`, \`focusRoomId\`, \`failFor\`,
 *   \`log\`, \`announcement\` — start-clean, finish-clean, pass, fail,
 *   refuse, and highlight all flow through the same reducers, so tiles,
 *   queue cards, arrival chips, floor readouts, and stat tiles can never
 *   disagree.
 * Container policy: tiles, rails, rows, and cards-with-a-job (queue
 *   cards carry the verdict buttons) — no decorative card grids. Room
 *   tiles and arrival rows are real <button>s: the displayed state IS
 *   the affordance. Stat tiles are static derived readouts.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Turndown lavender) as a light-dark() pair with contrast math at
 *   the declaration; the dirty amber, cleaning blue, ready green, and
 *   out-of-order red state pairs each carry their own math. The
 *   nonexistent bare text token is never used — text is
 *   --color-text-primary / --color-text-secondary throughout.
 * Density grid (repeated verbatim): 12px page gutter · 16px floor
 *   section gap · 48px floor header · room tiles minmax(104px, 1fr) ×
 *   min 72px on an 8px grid gap · 328px rail · queue cards 12px
 *   padding · 48px arrival rows · 56px stat tiles · 40px minimum hit
 *   targets · 2px focus ring at 2px offset. Type: 14px/700 room
 *   numbers · 13px/600 guest names · 12px body meta · 11px/600 chips,
 *   overlines, and type codes — nothing under 11px; tabular-nums on
 *   every room number, count, percent, and ETA.
 * Fixture policy: fixed strings for every clock ("ETA 3:00 PM",
 *   "back Jul 12"); readiness percentages derive live from the room
 *   set, never captioned. Stress rows live in the data: the VIP guest's
 *   23-character name exercises arrival-row truncation, room 311's
 *   out-of-order note exercises the refusal path, and rooms 302/202
 *   start ready so the arrival-chip happy path is visible before any
 *   mutation.
 *
 * Responsive contract:
 * - >= 901px (including the ~1045px inline demo stage, where viewport
 *   media queries never fire — this default IS the stage layout): floor
 *   board + 328px rail side by side; room tiles auto-fill
 *   minmax(104px, 1fr) columns so the board tracks the stage width with
 *   no breakpoint.
 * - <= 900px: the body drops to one column (subtraction + reorder, not
 *   a squeeze): the inspector queue re-stacks ABOVE the floor board as
 *   a horizontal scroll strip of 300px cards; arrivals and the log
 *   follow below the board full-width.
 * - <= 560px (the 390px embed iframe): stat tiles wrap two-up, the
 *   header subtitle drops, room tiles relax to minmax(96px, 1fr), and
 *   every control keeps a >= 40px hit target.
 * - prefers-reduced-motion collapses the pass flash and fail shake to
 *   static outline styling.
 */

import {useMemo, useState, type KeyboardEvent as ReactKeyboardEvent} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  BedDoubleIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  ConciergeBellIcon,
  SparklesIcon,
  StarIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Turndown brand accent (lavender). #6D28D9 on #FFFFFF
// ≈ 6.3:1 (passes 4.5:1 for 11px+ text); #C4B5FD on the dark body
// (~#17191C) ≈ 10.5:1.
const BRAND_ACCENT = 'light-dark(#6D28D9, #C4B5FD)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #6D28D9 ≈ 6.3:1;
// #2B1A5E on #C4B5FD ≈ 8.4:1 (white on #C4B5FD would fail at ≈2.0:1).
const BRAND_ON = 'light-dark(#FFFFFF, #2B1A5E)';
// Brand wash for awaiting-inspection tiles / highlighted rows. Text on
// the wash is BRAND_ACCENT: #6D28D9 on rgba(109,40,217,.10)-over-white
// (≈ #EFE9FB) ≈ 5.6:1; #C4B5FD on rgba(196,181,253,.14)-over-#17191C
// ≈ 8.9:1.
const BRAND_TINT = 'light-dark(rgba(109, 40, 217, 0.10), rgba(196, 181, 253, 0.14))';

// Dirty / checkout amber: #92400E on #FFFFFF ≈ 7.3:1; #F2B84B on
// #17191C ≈ 9.8:1. Tints are washes only.
const DIRTY_TEXT = 'light-dark(#92400E, #F2B84B)';
const DIRTY_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(242, 184, 75, 0.14))';
// Cleaning-in-progress blue: #1D4ED8 on #FFFFFF ≈ 6.3:1; #8AB4FF on
// #17191C ≈ 8.6:1.
const CLEAN_TEXT = 'light-dark(#1D4ED8, #8AB4FF)';
const CLEAN_TINT = 'light-dark(rgba(29, 78, 216, 0.10), rgba(138, 180, 255, 0.14))';
// Ready green: #15803D on #FFFFFF ≈ 4.9:1; #6FDB96 on #17191C ≈ 9.4:1.
const READY_TEXT = 'light-dark(#15803D, #6FDB96)';
const READY_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(111, 219, 150, 0.14))';
// Out-of-order / fail red: #B42318 on #FFFFFF ≈ 6.4:1; #FF8A7A on
// #17191C ≈ 7.4:1.
const OOO_TEXT = 'light-dark(#B42318, #FF8A7A)';
const OOO_TINT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(255, 138, 122, 0.14))';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES
// ---------------------------------------------------------------------------

/**
 * The housekeeping state machine:
 *   dirty → cleaning → inspect → ready, with inspect --fail--> cleaning
 * (REDO). \`occupied\` (stayover) and \`ooo\` (out of order) never enter the
 * cycle today and refuse with a reason.
 */
type RoomState = 'ready' | 'occupied' | 'dirty' | 'cleaning' | 'inspect' | 'ooo';

type RoomType = 'K' | 'QQ' | 'STE';

interface Room {
  id: string;
  /** Display number — "412". */
  number: string;
  floor: number;
  type: RoomType;
  state: RoomState;
  /** Attendant currently on (or last on) the room, for cleaning/REDO. */
  attendant: string | null;
  /** True after a failed inspection bounced it back to cleaning. */
  redo: boolean;
  /** Fixed out-of-order note (state === 'ooo' only). */
  oooNote?: string;
}

interface Arrival {
  id: string;
  guest: string;
  roomId: string;
  eta: string;
  /** Compact chip ETA — "3p". */
  etaShort: string;
  isVip: boolean;
}

interface QueueEntry {
  roomId: string;
  inspector: string;
}

interface LogEntry {
  id: string;
  text: string;
  tone: 'pass' | 'fail' | 'move';
}

const PROPERTY = 'The Bellwether Hotel';
const DATE_LABEL = 'Fri Jul 10 · check-in 3:00 PM';

const INSPECTORS = ['Marisol Duarte', 'Ken Watanabe'] as const;
/** Fixed rotation for newly started cleans — deterministic by counter. */
const ATTENDANT_ROTATION = [
  'Rosa Ibarra',
  'Dmitri Sokolov',
  'Lena Fournier',
  'Paulo Reis',
] as const;

const FAIL_REASONS = [
  {id: 'linens', label: 'Linens', detail: 'linens below standard'},
  {id: 'bathroom', label: 'Bathroom', detail: 'bathroom not reset'},
  {id: 'amenities', label: 'Amenities', detail: 'amenity tray incomplete'},
] as const;

/**
 * 36 rooms across floors 4/3/2. Census cross-check (also in the header):
 * ready 10 · occupied 9 · dirty 7 · cleaning 4 · inspect 5 · ooo 1 = 36.
 */
// prettier-ignore
const INITIAL_ROOMS: Room[] = [
  // Floor 4 — the VIP floor. Left to turn: 2 dirty + 2 cleaning + 3 inspect = 7.
  {id: 'r401', number: '401', floor: 4, type: 'K',   state: 'ready',    attendant: null,             redo: false},
  {id: 'r402', number: '402', floor: 4, type: 'K',   state: 'occupied', attendant: null,             redo: false},
  {id: 'r403', number: '403', floor: 4, type: 'QQ',  state: 'dirty',    attendant: null,             redo: false},
  {id: 'r404', number: '404', floor: 4, type: 'K',   state: 'cleaning', attendant: 'Rosa Ibarra',    redo: false},
  {id: 'r405', number: '405', floor: 4, type: 'QQ',  state: 'inspect',  attendant: 'Lena Fournier',  redo: false},
  {id: 'r406', number: '406', floor: 4, type: 'K',   state: 'ready',    attendant: null,             redo: false},
  {id: 'r407', number: '407', floor: 4, type: 'K',   state: 'occupied', attendant: null,             redo: false},
  {id: 'r408', number: '408', floor: 4, type: 'QQ',  state: 'dirty',    attendant: null,             redo: false},
  {id: 'r409', number: '409', floor: 4, type: 'K',   state: 'inspect',  attendant: 'Paulo Reis',     redo: false},
  {id: 'r410', number: '410', floor: 4, type: 'QQ',  state: 'ready',    attendant: null,             redo: false},
  {id: 'r411', number: '411', floor: 4, type: 'K',   state: 'cleaning', attendant: 'Dmitri Sokolov', redo: false},
  {id: 'r412', number: '412', floor: 4, type: 'STE', state: 'inspect',  attendant: 'Rosa Ibarra',    redo: false},
  // Floor 3. Left to turn: 2 dirty + 1 cleaning + 1 inspect = 4.
  {id: 'r301', number: '301', floor: 3, type: 'K',   state: 'occupied', attendant: null,             redo: false},
  {id: 'r302', number: '302', floor: 3, type: 'QQ',  state: 'ready',    attendant: null,             redo: false},
  {id: 'r303', number: '303', floor: 3, type: 'K',   state: 'dirty',    attendant: null,             redo: false},
  {id: 'r304', number: '304', floor: 3, type: 'QQ',  state: 'occupied', attendant: null,             redo: false},
  {id: 'r305', number: '305', floor: 3, type: 'K',   state: 'inspect',  attendant: 'Lena Fournier',  redo: false},
  {id: 'r306', number: '306', floor: 3, type: 'QQ',  state: 'cleaning', attendant: 'Lena Fournier',  redo: false},
  {id: 'r307', number: '307', floor: 3, type: 'K',   state: 'ready',    attendant: null,             redo: false},
  {id: 'r308', number: '308', floor: 3, type: 'QQ',  state: 'dirty',    attendant: null,             redo: false},
  {id: 'r309', number: '309', floor: 3, type: 'K',   state: 'occupied', attendant: null,             redo: false},
  {id: 'r310', number: '310', floor: 3, type: 'QQ',  state: 'ready',    attendant: null,             redo: false},
  {id: 'r311', number: '311', floor: 3, type: 'K',   state: 'ooo',      attendant: null,             redo: false, oooNote: 'engineering ticket EN-2214, back Jul 12'},
  {id: 'r312', number: '312', floor: 3, type: 'STE', state: 'occupied', attendant: null,             redo: false},
  // Floor 2. Left to turn: 3 dirty + 1 cleaning + 1 inspect = 5.
  {id: 'r201', number: '201', floor: 2, type: 'QQ',  state: 'dirty',    attendant: null,             redo: false},
  {id: 'r202', number: '202', floor: 2, type: 'K',   state: 'ready',    attendant: null,             redo: false},
  {id: 'r203', number: '203', floor: 2, type: 'QQ',  state: 'occupied', attendant: null,             redo: false},
  {id: 'r204', number: '204', floor: 2, type: 'K',   state: 'cleaning', attendant: 'Paulo Reis',     redo: false},
  {id: 'r205', number: '205', floor: 2, type: 'QQ',  state: 'ready',    attendant: null,             redo: false},
  {id: 'r206', number: '206', floor: 2, type: 'K',   state: 'inspect',  attendant: 'Dmitri Sokolov', redo: false},
  {id: 'r207', number: '207', floor: 2, type: 'QQ',  state: 'occupied', attendant: null,             redo: false},
  {id: 'r208', number: '208', floor: 2, type: 'K',   state: 'dirty',    attendant: null,             redo: false},
  {id: 'r209', number: '209', floor: 2, type: 'QQ',  state: 'ready',    attendant: null,             redo: false},
  {id: 'r210', number: '210', floor: 2, type: 'K',   state: 'occupied', attendant: null,             redo: false},
  {id: 'r211', number: '211', floor: 2, type: 'QQ',  state: 'dirty',    attendant: null,             redo: false},
  {id: 'r212', number: '212', floor: 2, type: 'K',   state: 'ready',    attendant: null,             redo: false},
];

/**
 * Today's eight arrivals. Exactly two rooms (302, 202) start ready →
 * arrivals readiness opens at 2/8 = 25%. The VIP suite (412) opens in
 * the inspection queue at position 1 — the whole rail exists to get
 * that tile green before the 2:00 PM ETA.
 */
// prettier-ignore
const ARRIVALS: Arrival[] = [
  {id: 'a1', guest: 'Okonkwo-Baptiste, Amara', roomId: 'r412', eta: '2:00 PM', etaShort: '2p',    isVip: true},
  {id: 'a2', guest: 'Chen, Rosalind',          roomId: 'r403', eta: '3:00 PM', etaShort: '3p',    isVip: false},
  {id: 'a3', guest: 'Ferreira, Luca',          roomId: 'r206', eta: '3:00 PM', etaShort: '3p',    isVip: false},
  {id: 'a4', guest: 'Nkemelu, Daniel',         roomId: 'r302', eta: '3:00 PM', etaShort: '3p',    isVip: false},
  {id: 'a5', guest: 'Silva, Teresa',           roomId: 'r303', eta: '3:30 PM', etaShort: '3:30p', isVip: false},
  {id: 'a6', guest: 'Park, Minji',             roomId: 'r405', eta: '4:15 PM', etaShort: '4:15p', isVip: false},
  {id: 'a7', guest: 'Goldberg, Hannah',        roomId: 'r208', eta: '5:00 PM', etaShort: '5p',    isVip: false},
  {id: 'a8', guest: 'Whitcombe, Priya',        roomId: 'r202', eta: '6:45 PM', etaShort: '6:45p', isVip: false},
];

const ARRIVAL_BY_ROOM = new Map(ARRIVALS.map(arrival => [arrival.roomId, arrival]));

/** Opening inspection queue: Marisol 3 / Ken 2, VIP suite first. */
const INITIAL_QUEUE: QueueEntry[] = [
  {roomId: 'r412', inspector: 'Marisol Duarte'},
  {roomId: 'r405', inspector: 'Ken Watanabe'},
  {roomId: 'r305', inspector: 'Marisol Duarte'},
  {roomId: 'r206', inspector: 'Ken Watanabe'},
  {roomId: 'r409', inspector: 'Marisol Duarte'},
];

const FLOORS = [4, 3, 2] as const;

const STATE_META: Record<RoomState, {label: string; tileWord: string}> = {
  ready: {label: 'Ready', tileWord: 'Ready'},
  occupied: {label: 'Stayover', tileWord: 'Stayover'},
  dirty: {label: 'Dirty — checkout', tileWord: 'Dirty'},
  cleaning: {label: 'Cleaning in progress', tileWord: 'Cleaning'},
  inspect: {label: 'Awaiting inspection', tileWord: 'Inspect'},
  ooo: {label: 'Out of order', tileWord: 'OOO'},
};

const TYPE_LABELS: Record<RoomType, string> = {
  K: 'King',
  QQ: 'Double queen',
  STE: 'Suite',
};

// ---------------------------------------------------------------------------
// PURE HELPERS
// ---------------------------------------------------------------------------

/** First name only — tiles are 104px wide. */
function firstName(full: string): string {
  return full.split(' ')[0];
}

/** Rooms still in the turnover cycle (dirty / cleaning / inspect). */
function isInCycle(room: Room): boolean {
  return (
    room.state === 'dirty' || room.state === 'cleaning' || room.state === 'inspect'
  );
}

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-hotel-housekeeping-turnover
// ---------------------------------------------------------------------------
// Density grid (verbatim from the header): 12px page gutter · 16px floor
// section gap · 48px floor header · room tiles minmax(104px, 1fr) × min
// 72px on an 8px grid gap · 328px rail · queue cards 12px padding · 48px
// arrival rows · 56px stat tiles · 40px minimum hit targets · 2px focus
// ring at 2px offset.

const TEMPLATE_CSS = \`
.tpl-hotel-housekeeping-turnover {
  --hht-accent: \${BRAND_ACCENT};
  --hht-on-accent: \${BRAND_ON};
  --hht-accent-tint: \${BRAND_TINT};
  --hht-dirty-text: \${DIRTY_TEXT};
  --hht-dirty-tint: \${DIRTY_TINT};
  --hht-clean-text: \${CLEAN_TEXT};
  --hht-clean-tint: \${CLEAN_TINT};
  --hht-ready-text: \${READY_TEXT};
  --hht-ready-tint: \${READY_TINT};
  --hht-ooo-text: \${OOO_TEXT};
  --hht-ooo-tint: \${OOO_TINT};
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100%;
  min-height: 0;
}
.tpl-hotel-housekeeping-turnover *,
.tpl-hotel-housekeeping-turnover *::before,
.tpl-hotel-housekeeping-turnover *::after {
  box-sizing: border-box;
}
.tpl-hotel-housekeeping-turnover button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-hotel-housekeeping-turnover button:focus-visible {
  outline: 2px solid var(--hht-accent);
  outline-offset: 2px;
}
.tpl-hotel-housekeeping-turnover .hht-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header ---- */
.tpl-hotel-housekeeping-turnover .hht-head {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
}
.tpl-hotel-housekeeping-turnover .hht-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.tpl-hotel-housekeeping-turnover .hht-brand-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.tpl-hotel-housekeeping-turnover .hht-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-hotel-housekeeping-turnover .hht-stats {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}
.tpl-hotel-housekeeping-turnover .hht-stat {
  min-height: 56px;
  min-width: 116px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  background: var(--color-background-body);
}
.tpl-hotel-housekeeping-turnover .hht-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-hotel-housekeeping-turnover .hht-stat-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.tpl-hotel-housekeeping-turnover .hht-stat-value.is-accent {
  color: var(--hht-accent);
}
.tpl-hotel-housekeeping-turnover .hht-stat-value.is-ready {
  color: var(--hht-ready-text);
}
.tpl-hotel-housekeeping-turnover .hht-stat-value.is-hot {
  color: var(--hht-ooo-text);
}
.tpl-hotel-housekeeping-turnover .hht-stat-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ---- body split: floor board | 328px rail ---- */
.tpl-hotel-housekeeping-turnover .hht-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 328px;
  gap: 16px;
  padding: 12px;
  height: 100%;
  min-height: 0;
}
.tpl-hotel-housekeeping-turnover .hht-board {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tpl-hotel-housekeeping-turnover .hht-rail {
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 2px;
}

/* ---- floor sections ---- */
.tpl-hotel-housekeeping-turnover .hht-floor {
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-body);
}
.tpl-hotel-housekeeping-turnover .hht-floor-head {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-hotel-housekeeping-turnover .hht-floor-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.tpl-hotel-housekeeping-turnover .hht-floor-note {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.tpl-hotel-housekeeping-turnover .hht-floor-left {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-radius: 999px;
  padding: 3px 8px;
  color: var(--hht-accent);
  background: var(--hht-accent-tint);
}
.tpl-hotel-housekeeping-turnover .hht-floor-left.is-done {
  color: var(--hht-ready-text);
  background: var(--hht-ready-tint);
}
.tpl-hotel-housekeeping-turnover .hht-floor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 8px;
  padding: 8px;
}

/* ---- room tiles (real buttons; state-coded) ---- */
.tpl-hotel-housekeeping-turnover .hht-tile {
  min-height: 72px;
  border-radius: 10px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  transition: border-color 120ms ease, background-color 120ms ease;
}
@media (hover: hover) {
  .tpl-hotel-housekeeping-turnover .hht-tile:hover {
    border-color: var(--hht-accent);
  }
}
.tpl-hotel-housekeeping-turnover .hht-tile-top {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}
.tpl-hotel-housekeeping-turnover .hht-tile-num {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tpl-hotel-housekeeping-turnover .hht-tile-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}
.tpl-hotel-housekeeping-turnover .hht-tile-vip {
  margin-left: auto;
  display: inline-flex;
  color: var(--hht-accent);
}
.tpl-hotel-housekeeping-turnover .hht-tile-state {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-hotel-housekeeping-turnover .hht-tile-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: auto;
}
.tpl-hotel-housekeeping-turnover .hht-chip {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-radius: 5px;
  padding: 1px 5px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.tpl-hotel-housekeeping-turnover .hht-chip.is-arrival {
  color: var(--hht-accent);
  background: var(--hht-accent-tint);
}
.tpl-hotel-housekeeping-turnover .hht-chip.is-redo {
  color: var(--hht-ooo-text);
  background: var(--hht-ooo-tint);
  letter-spacing: 0.04em;
}
/* state variants */
.tpl-hotel-housekeeping-turnover .hht-tile.is-ready {
  background: var(--hht-ready-tint);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-ready .hht-tile-state {
  color: var(--hht-ready-text);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-dirty {
  background: var(--hht-dirty-tint);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-dirty .hht-tile-state {
  color: var(--hht-dirty-text);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-cleaning {
  background: var(--hht-clean-tint);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-cleaning .hht-tile-state {
  color: var(--hht-clean-text);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-inspect {
  background: var(--hht-accent-tint);
  border-style: dashed;
  border-color: var(--hht-accent);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-inspect .hht-tile-state {
  color: var(--hht-accent);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-occupied {
  opacity: 0.72;
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-ooo {
  background: var(--hht-ooo-tint);
  border-style: dashed;
  border-color: var(--hht-ooo-text);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-ooo .hht-tile-state {
  color: var(--hht-ooo-text);
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-focus {
  border: 2px solid var(--hht-accent);
  padding: 7px;
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-flash {
  animation: hht-pass-flash 900ms ease-out 1;
}
.tpl-hotel-housekeeping-turnover .hht-tile.is-shake {
  animation: hht-fail-shake 360ms ease-in-out 1;
}
@keyframes hht-pass-flash {
  0% { box-shadow: 0 0 0 3px var(--hht-ready-text); }
  100% { box-shadow: 0 0 0 0 transparent; }
}
@keyframes hht-fail-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-hotel-housekeeping-turnover .hht-tile.is-flash {
    animation: none;
    box-shadow: 0 0 0 2px var(--hht-ready-text);
  }
  .tpl-hotel-housekeeping-turnover .hht-tile.is-shake {
    animation: none;
    box-shadow: 0 0 0 2px var(--hht-ooo-text);
  }
  .tpl-hotel-housekeeping-turnover .hht-tile {
    transition: none;
  }
}

/* ---- rail sections ---- */
.tpl-hotel-housekeeping-turnover .hht-section {
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-body);
  display: flex;
  flex-direction: column;
}
.tpl-hotel-housekeeping-turnover .hht-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-hotel-housekeeping-turnover .hht-section-title {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-hotel-housekeeping-turnover .hht-section-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--hht-accent);
  background: var(--hht-accent-tint);
  border-radius: 999px;
  padding: 2px 8px;
}
.tpl-hotel-housekeeping-turnover .hht-section-body {
  display: flex;
  flex-direction: column;
}

/* ---- inspector queue cards ---- */
.tpl-hotel-housekeeping-turnover .hht-q {
  padding: 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tpl-hotel-housekeeping-turnover .hht-q:last-child {
  border-bottom: none;
}
.tpl-hotel-housekeeping-turnover .hht-q-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.tpl-hotel-housekeeping-turnover .hht-q-pos {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--hht-on-accent);
  background: var(--hht-accent);
  flex-shrink: 0;
}
.tpl-hotel-housekeeping-turnover .hht-q-room {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tpl-hotel-housekeeping-turnover .hht-q-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-hotel-housekeeping-turnover .hht-q-vipchip {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--hht-accent);
  background: var(--hht-accent-tint);
  border-radius: 5px;
  padding: 2px 6px;
  flex-shrink: 0;
}
.tpl-hotel-housekeeping-turnover .hht-q-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-hotel-housekeeping-turnover .hht-q-actions {
  display: flex;
  gap: 8px;
}
.tpl-hotel-housekeeping-turnover .hht-btn {
  min-height: 40px;
  flex: 1;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  border: var(--border-width) solid var(--color-border);
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-hotel-housekeeping-turnover .hht-btn.is-pass {
  background: var(--hht-accent);
  border-color: transparent;
  color: var(--hht-on-accent);
}
@media (hover: hover) {
  .tpl-hotel-housekeeping-turnover .hht-btn.is-pass:hover {
    filter: brightness(1.06);
  }
  .tpl-hotel-housekeeping-turnover .hht-btn.is-fail:hover {
    border-color: var(--hht-ooo-text);
    color: var(--hht-ooo-text);
  }
  .tpl-hotel-housekeeping-turnover .hht-btn.is-reason:hover {
    border-color: var(--hht-ooo-text);
    color: var(--hht-ooo-text);
  }
}
.tpl-hotel-housekeeping-turnover .hht-q-reasons {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tpl-hotel-housekeeping-turnover .hht-q-reasons-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--hht-ooo-text);
  flex-shrink: 0;
}
.tpl-hotel-housekeeping-turnover .hht-btn.is-reason {
  min-height: 40px;
  font-size: 11px;
}

/* ---- arrivals ---- */
.tpl-hotel-housekeeping-turnover .hht-arr {
  min-height: 48px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color 120ms ease;
}
.tpl-hotel-housekeeping-turnover .hht-arr:last-child {
  border-bottom: none;
}
@media (hover: hover) {
  .tpl-hotel-housekeeping-turnover .hht-arr:hover {
    background: var(--color-background-muted);
  }
}
.tpl-hotel-housekeeping-turnover .hht-arr.is-focus {
  background: var(--hht-accent-tint);
}
.tpl-hotel-housekeeping-turnover .hht-arr-id {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tpl-hotel-housekeeping-turnover .hht-arr-guest {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.tpl-hotel-housekeeping-turnover .hht-arr-guest .hht-arr-star {
  color: var(--hht-accent);
  display: inline-flex;
  flex-shrink: 0;
}
.tpl-hotel-housekeeping-turnover .hht-arr-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-hotel-housekeeping-turnover .hht-arr-state {
  font-size: 11px;
  font-weight: 600;
  border-radius: 5px;
  padding: 2px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.tpl-hotel-housekeeping-turnover .hht-arr-state.is-ready {
  color: var(--hht-ready-text);
  background: var(--hht-ready-tint);
}
.tpl-hotel-housekeeping-turnover .hht-arr-state.is-dirty {
  color: var(--hht-dirty-text);
  background: var(--hht-dirty-tint);
}
.tpl-hotel-housekeeping-turnover .hht-arr-state.is-cleaning {
  color: var(--hht-clean-text);
  background: var(--hht-clean-tint);
}
.tpl-hotel-housekeeping-turnover .hht-arr-state.is-inspect {
  color: var(--hht-accent);
  background: var(--hht-accent-tint);
}

/* ---- readiness bar (arrivals section head) ---- */
.tpl-hotel-housekeeping-turnover .hht-readybar {
  height: 6px;
  border-radius: 3px;
  background: var(--color-background-muted);
  overflow: hidden;
  margin: 0 12px 10px;
}
.tpl-hotel-housekeeping-turnover .hht-readybar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--hht-ready-text);
  transition: width 240ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-hotel-housekeeping-turnover .hht-readybar-fill {
    transition: none;
  }
}

/* ---- log ---- */
.tpl-hotel-housekeeping-turnover .hht-log-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12px;
  line-height: 1.4;
}
.tpl-hotel-housekeeping-turnover .hht-log-row:last-child {
  border-bottom: none;
}
.tpl-hotel-housekeeping-turnover .hht-log-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
.tpl-hotel-housekeeping-turnover .hht-log-dot.is-pass {
  background: var(--hht-ready-text);
}
.tpl-hotel-housekeeping-turnover .hht-log-dot.is-fail {
  background: var(--hht-ooo-text);
}
.tpl-hotel-housekeeping-turnover .hht-log-dot.is-move {
  background: var(--hht-accent);
}
.tpl-hotel-housekeeping-turnover .hht-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}
.tpl-hotel-housekeeping-turnover .hht-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--hht-ready-text);
}

/* ---- notice banner (refusals) ---- */
.tpl-hotel-housekeeping-turnover .hht-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 4px;
  padding: 10px 12px;
  border: var(--border-width) solid var(--hht-ooo-text);
  border-radius: 10px;
  background: var(--hht-ooo-tint);
  font-size: 12px;
  line-height: 1.4;
}
.tpl-hotel-housekeeping-turnover .hht-notice-text {
  flex: 1;
  min-width: 0;
}
.tpl-hotel-housekeeping-turnover .hht-notice-close {
  width: 40px;
  height: 40px;
  margin: -8px -8px -8px 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--hht-ooo-text);
  flex-shrink: 0;
}

/* ---- responsive: <= 900px re-stack (subtraction + reorder) ---- */
@media (max-width: 900px) {
  .tpl-hotel-housekeeping-turnover .hht-body {
    grid-template-columns: minmax(0, 1fr);
    overflow-y: auto;
  }
  .tpl-hotel-housekeeping-turnover .hht-board {
    order: 2;
    overflow: visible;
    min-height: auto;
  }
  .tpl-hotel-housekeeping-turnover .hht-rail {
    display: contents;
  }
  .tpl-hotel-housekeeping-turnover .hht-section.is-queue {
    order: 1;
  }
  .tpl-hotel-housekeeping-turnover .hht-section.is-queue .hht-section-body {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
    padding: 8px;
  }
  .tpl-hotel-housekeeping-turnover .hht-section.is-queue .hht-q {
    flex: 0 0 300px;
    border: var(--border-width) solid var(--color-border);
    border-radius: 10px;
  }
  .tpl-hotel-housekeeping-turnover .hht-section.is-arrivals {
    order: 3;
  }
  .tpl-hotel-housekeeping-turnover .hht-section.is-log {
    order: 4;
  }
}

/* ---- responsive: <= 560px (390px embed) ---- */
@media (max-width: 560px) {
  .tpl-hotel-housekeeping-turnover .hht-brand-sub {
    display: none;
  }
  .tpl-hotel-housekeeping-turnover .hht-stats {
    margin-left: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .tpl-hotel-housekeeping-turnover .hht-stat {
    min-width: 0;
  }
  .tpl-hotel-housekeeping-turnover .hht-floor-grid {
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  }
  .tpl-hotel-housekeeping-turnover .hht-section.is-queue .hht-q {
    flex-basis: 272px;
  }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — Turndown: a bed with the sheet corner folded back.
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      role="img"
      aria-label="Turndown"
      style={{flexShrink: 0}}>
      <rect width={28} height={28} rx={8} fill="var(--hht-accent)" />
      {/* Mattress line + folded sheet triangle. */}
      <path
        d="M5.5 18.5v-5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v5"
        fill="none"
        stroke="var(--hht-on-accent)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M5.5 18.5h17" stroke="var(--hht-on-accent)" strokeWidth={2} strokeLinecap="round" />
      {/* The turndown: sheet corner folded into a triangle. */}
      <path d="M15 11.5h5.5l-5.5 4.6z" fill="var(--hht-on-accent)" />
      {/* Pillow dot. */}
      <rect x={7.8} y={13.4} width={4.6} height={2.6} rx={1.3} fill="var(--hht-on-accent)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ROOM TILE — one room; a real <button> whose state IS the affordance.
// ---------------------------------------------------------------------------

interface RoomTileProps {
  room: Room;
  arrival: Arrival | undefined;
  isFocus: boolean;
  isFlash: boolean;
  isShake: boolean;
  onActivate: (room: Room) => void;
}

function RoomTile({room, arrival, isFocus, isFlash, isShake, onActivate}: RoomTileProps) {
  const classes = [
    'hht-tile',
    \`is-\${room.state}\`,
    isFocus ? 'is-focus' : '',
    isFlash ? 'is-flash' : '',
    isShake ? 'is-shake' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const stateText =
    room.state === 'cleaning' && room.attendant != null
      ? firstName(room.attendant)
      : STATE_META[room.state].tileWord;
  const actionHint =
    room.state === 'dirty'
      ? 'tap to start cleaning'
      : room.state === 'cleaning'
        ? 'tap when clean to queue inspection'
        : room.state === 'inspect'
          ? 'awaiting inspector verdict'
          : '';
  const label = [
    \`Room \${room.number}, \${TYPE_LABELS[room.type]}, \${STATE_META[room.state].label}\`,
    room.state === 'cleaning' && room.attendant != null ? \`with \${room.attendant}\` : '',
    room.redo ? 'redo after failed inspection' : '',
    arrival != null
      ? \`\${arrival.isVip ? 'VIP arrival' : 'arrival'} \${arrival.guest} at \${arrival.eta}\`
      : '',
    actionHint,
  ]
    .filter(Boolean)
    .join(' — ');
  return (
    <button type="button" className={classes} aria-label={label} onClick={() => onActivate(room)}>
      <span className="hht-tile-top">
        <span className="hht-tile-num">{room.number}</span>
        <span className="hht-tile-type">{room.type}</span>
        {arrival?.isVip === true && (
          <span className="hht-tile-vip" aria-hidden>
            <Icon icon={StarIcon} size="xsm" color="inherit" />
          </span>
        )}
      </span>
      <span className="hht-tile-state">{stateText}</span>
      <span className="hht-tile-chips">
        {arrival != null && <span className="hht-chip is-arrival">{arrival.etaShort}</span>}
        {room.redo && <span className="hht-chip is-redo">REDO</span>}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// INSPECTOR QUEUE CARD — Pass / Fail; Fail expands the reason picker.
// ---------------------------------------------------------------------------

interface QueueCardProps {
  position: number;
  entry: QueueEntry;
  room: Room;
  arrival: Arrival | undefined;
  isFailOpen: boolean;
  onPass: (roomId: string) => void;
  onFailOpen: (roomId: string) => void;
  onFailCommit: (roomId: string, reasonId: string) => void;
}

function QueueCard({
  position,
  entry,
  room,
  arrival,
  isFailOpen,
  onPass,
  onFailOpen,
  onFailCommit,
}: QueueCardProps) {
  return (
    <article className="hht-q" aria-label={\`Inspection \${position}: room \${room.number}\`}>
      <div className="hht-q-top">
        <span className="hht-q-pos" aria-hidden>
          {position}
        </span>
        <span className="hht-q-room">Room {room.number}</span>
        <span className="hht-q-meta">
          {TYPE_LABELS[room.type]} · {entry.inspector.split(' ')[0]}
        </span>
        {arrival?.isVip === true && (
          <span className="hht-q-vipchip">
            <Icon icon={StarIcon} size="xsm" color="inherit" />
            VIP {arrival.eta}
          </span>
        )}
      </div>
      <div className="hht-q-sub">
        Cleaned by {room.attendant ?? '—'}
        {room.redo ? ' · redo pass' : ''}
        {arrival != null && !arrival.isVip ? \` · arrival \${arrival.eta}\` : ''}
      </div>
      {isFailOpen ? (
        <div className="hht-q-reasons" role="group" aria-label={\`Fail reason for room \${room.number}\`}>
          <span className="hht-q-reasons-label">Fail:</span>
          {FAIL_REASONS.map(reason => (
            <button
              key={reason.id}
              type="button"
              className="hht-btn is-reason"
              onClick={() => onFailCommit(room.id, reason.id)}>
              {reason.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="hht-q-actions">
          <button type="button" className="hht-btn is-pass" onClick={() => onPass(room.id)}>
            <Icon icon={ClipboardCheckIcon} size="sm" color="inherit" />
            Pass
          </button>
          <button type="button" className="hht-btn is-fail" onClick={() => onFailOpen(room.id)}>
            <Icon icon={XIcon} size="sm" color="inherit" />
            Fail…
          </button>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// ARRIVAL ROW — the room-state chip live-tracks the tile.
// ---------------------------------------------------------------------------

interface ArrivalRowProps {
  arrival: Arrival;
  room: Room;
  isFocus: boolean;
  onToggle: (roomId: string) => void;
}

function ArrivalRow({arrival, room, isFocus, onToggle}: ArrivalRowProps) {
  const chipClass =
    room.state === 'ready'
      ? 'is-ready'
      : room.state === 'cleaning'
        ? 'is-cleaning'
        : room.state === 'inspect'
          ? 'is-inspect'
          : 'is-dirty';
  return (
    <button
      type="button"
      className={\`hht-arr\${isFocus ? ' is-focus' : ''}\`}
      aria-pressed={isFocus}
      aria-label={\`\${arrival.guest}\${arrival.isVip ? ', VIP' : ''}, room \${room.number}, ETA \${arrival.eta}, room is \${STATE_META[room.state].label} — highlight the tile\`}
      onClick={() => onToggle(arrival.roomId)}>
      <span className="hht-arr-id">
        <span className="hht-arr-guest">
          {arrival.isVip && (
            <span className="hht-arr-star" aria-hidden>
              <Icon icon={StarIcon} size="xsm" color="inherit" />
            </span>
          )}
          {arrival.guest}
        </span>
        <span className="hht-arr-meta">
          Room {room.number} · {TYPE_LABELS[room.type]} · ETA {arrival.eta}
        </span>
      </span>
      <span className={\`hht-arr-state \${chipClass}\`}>{STATE_META[room.state].tileWord}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner; every transition flows through the reducers below.
// ---------------------------------------------------------------------------

export default function HotelHousekeepingTurnoverTemplate() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
  /** Fixed-rotation pointer for newly started cleans. */
  const [assignCounter, setAssignCounter] = useState(0);
  const [focusRoomId, setFocusRoomId] = useState<string | null>(null);
  /** Room id whose queue card is showing the fail-reason picker. */
  const [failFor, setFailFor] = useState<string | null>(null);
  const [flashRoomId, setFlashRoomId] = useState<string | null>(null);
  const [shakeRoomId, setShakeRoomId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const roomById = useMemo(() => new Map(rooms.map(room => [room.id, room])), [rooms]);

  // ---- derived stats (every tile is a derivation, not a caption) ----
  const leftToTurn = useMemo(() => rooms.filter(isInCycle).length, [rooms]);
  const inspectCount = useMemo(
    () => rooms.filter(room => room.state === 'inspect').length,
    [rooms],
  );
  const arrivalsReady = useMemo(
    () =>
      ARRIVALS.filter(arrival => roomById.get(arrival.roomId)?.state === 'ready')
        .length,
    [roomById],
  );
  const readyPct = Math.round((arrivalsReady / ARRIVALS.length) * 100);
  const vipArrival = ARRIVALS.find(arrival => arrival.isVip);
  const vipReady =
    vipArrival != null && roomById.get(vipArrival.roomId)?.state === 'ready';

  const leftByFloor = useMemo(() => {
    const map = new Map<number, number>();
    for (const floor of FLOORS) {
      map.set(floor, 0);
    }
    for (const room of rooms) {
      if (isInCycle(room)) {
        map.set(room.floor, (map.get(room.floor) ?? 0) + 1);
      }
    }
    return map;
  }, [rooms]);

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const floor of FLOORS) {
      map.set(
        floor,
        rooms.filter(room => room.floor === floor),
      );
    }
    return map;
  }, [rooms]);

  // ---- shared plumbing ----
  const appendLog = (text: string, tone: LogEntry['tone']) => {
    setLogCounter(prev => prev + 1);
    setLog(prev => [{id: \`log-\${logCounter + 1}\`, text, tone}, ...prev]);
  };

  const patchRoom = (roomId: string, patch: Partial<Room>) => {
    setRooms(prev =>
      prev.map(room => (room.id === roomId ? {...room, ...patch} : room)),
    );
  };

  /** Least-loaded inspector for a newly finished clean; tie → Marisol. */
  const nextInspector = (currentQueue: QueueEntry[]): string => {
    const loads = INSPECTORS.map(
      inspector =>
        currentQueue.filter(entry => entry.inspector === inspector).length,
    );
    return loads[1] < loads[0] ? INSPECTORS[1] : INSPECTORS[0];
  };

  // ---- the state machine ----
  const activateRoom = (room: Room) => {
    setNotice(null);
    if (room.state === 'dirty') {
      const attendant = ATTENDANT_ROTATION[assignCounter % ATTENDANT_ROTATION.length];
      setAssignCounter(prev => prev + 1);
      patchRoom(room.id, {state: 'cleaning', attendant});
      appendLog(\`Clean started · Room \${room.number} · \${attendant}\`, 'move');
      setAnnouncement(\`Room \${room.number}: cleaning started, \${attendant} assigned.\`);
      return;
    }
    if (room.state === 'cleaning') {
      const inspector = nextInspector(queue);
      setQueue(prev => [...prev, {roomId: room.id, inspector}]);
      patchRoom(room.id, {state: 'inspect'});
      appendLog(
        \`Clean finished · Room \${room.number} → \${inspector.split(' ')[0]}'s queue\`,
        'move',
      );
      setAnnouncement(
        \`Room \${room.number} is ready for inspection — queued for \${inspector}.\`,
      );
      return;
    }
    if (room.state === 'inspect') {
      setAnnouncement(
        \`Room \${room.number} is awaiting its inspector — verdicts happen in the queue.\`,
      );
      return;
    }
    if (room.state === 'ready') {
      const arrival = ARRIVAL_BY_ROOM.get(room.id);
      setAnnouncement(
        arrival != null
          ? \`Room \${room.number} is ready for \${arrival.guest}, ETA \${arrival.eta}.\`
          : \`Room \${room.number} is ready — no arrival assigned today.\`,
      );
      return;
    }
    // Refusals: stayover + out of order, each with the exact reason.
    const reason =
      room.state === 'occupied'
        ? \`Room \${room.number} is a stayover — no turnover scheduled today.\`
        : \`Room \${room.number} is out of order — \${room.oooNote ?? 'engineering hold'}.\`;
    setNotice(reason);
    setShakeRoomId(room.id);
    setAnnouncement(reason);
  };

  const passRoom = (roomId: string) => {
    const room = roomById.get(roomId);
    if (room == null) {
      return;
    }
    setQueue(prev => prev.filter(entry => entry.roomId !== roomId));
    setFailFor(prev => (prev === roomId ? null : prev));
    patchRoom(roomId, {state: 'ready', redo: false, attendant: null});
    setFlashRoomId(roomId);
    setShakeRoomId(null);
    const arrival = ARRIVAL_BY_ROOM.get(roomId);
    appendLog(\`Passed · Room \${room.number}\${arrival != null ? \` · \${arrival.guest}\` : ''}\`, 'pass');
    setAnnouncement(
      arrival != null
        ? \`Room \${room.number} passed inspection — ready for \${arrival.guest} at \${arrival.eta}. Arrivals readiness updated.\`
        : \`Room \${room.number} passed inspection and is ready.\`,
    );
  };

  const failRoom = (roomId: string, reasonId: string) => {
    const room = roomById.get(roomId);
    const reason = FAIL_REASONS.find(entry => entry.id === reasonId);
    if (room == null || reason == null) {
      return;
    }
    setQueue(prev => prev.filter(entry => entry.roomId !== roomId));
    setFailFor(null);
    patchRoom(roomId, {state: 'cleaning', redo: true});
    setShakeRoomId(roomId);
    setFlashRoomId(null);
    appendLog(
      \`Failed · Room \${room.number} · \${reason.label} — back to \${room.attendant ?? 'attendant'}\`,
      'fail',
    );
    setAnnouncement(
      \`Room \${room.number} failed inspection: \${reason.detail}. Bounced back to \${room.attendant ?? 'the attendant'} as a redo.\`,
    );
  };

  const toggleRoomFocus = (roomId: string) => {
    const room = roomById.get(roomId);
    setFocusRoomId(prev => {
      const next = prev === roomId ? null : roomId;
      setAnnouncement(
        next == null
          ? 'Cleared the room highlight.'
          : \`Highlighting room \${room?.number ?? roomId} on the floor board.\`,
      );
      return next;
    });
  };

  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === 'Escape' &&
      (focusRoomId != null || failFor != null || notice != null)
    ) {
      event.stopPropagation();
      setFocusRoomId(null);
      setFailFor(null);
      setNotice(null);
      setAnnouncement('Cleared highlights and open pickers.');
    }
  };

  // ---- render ----
  return (
    <div className="tpl-hotel-housekeeping-turnover" onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="hht-head">
              <div className="hht-brand">
                <BrandMark />
                <div>
                  <h1 className="hht-brand-name">Turndown · {PROPERTY}</h1>
                  <div className="hht-brand-sub">
                    Housekeeping turnover · {DATE_LABEL} · {rooms.length} rooms
                  </div>
                </div>
              </div>
              <div className="hht-stats">
                <div className="hht-stat">
                  <span className="hht-stat-label">Arrivals today</span>
                  <span className="hht-stat-value">{ARRIVALS.length}</span>
                  <span className="hht-stat-sub">
                    {vipReady ? 'VIP suite ready' : 'VIP suite not ready'}
                  </span>
                </div>
                <div className="hht-stat">
                  <span className="hht-stat-label">Arrivals ready</span>
                  <span
                    className={\`hht-stat-value\${readyPct === 100 ? ' is-ready' : readyPct < 50 ? ' is-hot' : ' is-accent'}\`}>
                    {readyPct}%
                  </span>
                  <span className="hht-stat-sub">
                    {arrivalsReady} of {ARRIVALS.length} rooms
                  </span>
                </div>
                <div className="hht-stat">
                  <span className="hht-stat-label">Awaiting inspection</span>
                  <span className="hht-stat-value is-accent">{inspectCount}</span>
                  <span className="hht-stat-sub">{queue.length} queued</span>
                </div>
                <div className="hht-stat">
                  <span className="hht-stat-label">Left to turn</span>
                  <span
                    className={\`hht-stat-value\${leftToTurn === 0 ? ' is-ready' : ''}\`}>
                    {leftToTurn}
                  </span>
                  <span className="hht-stat-sub">dirty · cleaning · inspect</span>
                </div>
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="Housekeeping turnover board">
            <div aria-live="polite" className="hht-vh">
              {announcement}
            </div>
            <div className="hht-body">
              {/* ---- floor board ---- */}
              <div
                className="hht-board"
                role="region"
                aria-label="Floor board — room status tiles">
                {notice != null && (
                  <div className="hht-notice" role="status">
                    <Icon icon={WrenchIcon} size="sm" color="inherit" />
                    <span className="hht-notice-text">{notice}</span>
                    <button
                      type="button"
                      className="hht-notice-close"
                      aria-label="Dismiss notice"
                      onClick={() => setNotice(null)}>
                      <Icon icon={XIcon} size="sm" color="inherit" />
                    </button>
                  </div>
                )}
                {FLOORS.map(floor => {
                  const floorRooms = roomsByFloor.get(floor) ?? [];
                  const left = leftByFloor.get(floor) ?? 0;
                  return (
                    <section key={floor} className="hht-floor" aria-label={\`Floor \${floor}\`}>
                      <div className="hht-floor-head">
                        <Icon icon={BedDoubleIcon} size="sm" color="secondary" />
                        <h2 className="hht-floor-title">Floor {floor}</h2>
                        {floor === 4 && <span className="hht-floor-note">VIP floor</span>}
                        <span className={\`hht-floor-left\${left === 0 ? ' is-done' : ''}\`}>
                          {left === 0 ? 'All turned' : \`\${left} to turn\`}
                        </span>
                      </div>
                      <div className="hht-floor-grid">
                        {floorRooms.map(room => (
                          <RoomTile
                            key={room.id}
                            room={room}
                            arrival={ARRIVAL_BY_ROOM.get(room.id)}
                            isFocus={focusRoomId === room.id}
                            isFlash={flashRoomId === room.id}
                            isShake={shakeRoomId === room.id}
                            onActivate={activateRoom}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* ---- rail: inspector queue · arrivals · log ---- */}
              <div className="hht-rail">
                <section className="hht-section is-queue" aria-label="Inspector queue">
                  <div className="hht-section-head">
                    <Icon icon={ClipboardCheckIcon} size="sm" color="secondary" />
                    <h2 className="hht-section-title">Inspector queue</h2>
                    <span className="hht-section-count">{queue.length}</span>
                  </div>
                  <div className="hht-section-body">
                    {queue.length === 0 ? (
                      <div className="hht-empty">
                        <Icon icon={SparklesIcon} size="md" color="secondary" />
                        <span className="hht-empty-title">Queue clear</span>
                        <span>
                          Finished cleans land here for a Pass / Fail verdict.
                        </span>
                      </div>
                    ) : (
                      queue.map((entry, index) => {
                        const room = roomById.get(entry.roomId);
                        if (room == null) {
                          return null;
                        }
                        return (
                          <QueueCard
                            key={entry.roomId}
                            position={index + 1}
                            entry={entry}
                            room={room}
                            arrival={ARRIVAL_BY_ROOM.get(entry.roomId)}
                            isFailOpen={failFor === entry.roomId}
                            onPass={passRoom}
                            onFailOpen={roomId =>
                              setFailFor(prev => (prev === roomId ? null : roomId))
                            }
                            onFailCommit={failRoom}
                          />
                        );
                      })
                    )}
                  </div>
                </section>

                <section
                  className="hht-section is-arrivals"
                  aria-label="Today's arrivals">
                  <div className="hht-section-head">
                    <Icon icon={ConciergeBellIcon} size="sm" color="secondary" />
                    <h2 className="hht-section-title">Arrivals · {readyPct}% ready</h2>
                    <span className="hht-section-count">
                      {arrivalsReady}/{ARRIVALS.length}
                    </span>
                  </div>
                  <div
                    className="hht-readybar"
                    role="progressbar"
                    aria-label="Arrivals readiness"
                    aria-valuenow={readyPct}
                    aria-valuemin={0}
                    aria-valuemax={100}>
                    <div className="hht-readybar-fill" style={{width: \`\${readyPct}%\`}} />
                  </div>
                  <div className="hht-section-body">
                    {ARRIVALS.map(arrival => {
                      const room = roomById.get(arrival.roomId);
                      if (room == null) {
                        return null;
                      }
                      return (
                        <ArrivalRow
                          key={arrival.id}
                          arrival={arrival}
                          room={room}
                          isFocus={focusRoomId === arrival.roomId}
                          onToggle={toggleRoomFocus}
                        />
                      );
                    })}
                  </div>
                </section>

                <section className="hht-section is-log" aria-label="Housekeeping log">
                  <div className="hht-section-head">
                    <Icon icon={ClipboardListIcon} size="sm" color="secondary" />
                    <h2 className="hht-section-title">Housekeeping log</h2>
                    <span className="hht-section-count">{log.length}</span>
                  </div>
                  <div className="hht-section-body">
                    {log.length === 0 ? (
                      <div className="hht-empty">
                        <span>
                          Cleans, verdicts, and redos land here as an audit trail.
                        </span>
                      </div>
                    ) : (
                      log.map(entry => (
                        <div key={entry.id} className="hht-log-row">
                          <span className={\`hht-log-dot is-\${entry.tone}\`} aria-hidden />
                          <span>{entry.text}</span>
                        </div>
                      ))
                    )}
                  </div>
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