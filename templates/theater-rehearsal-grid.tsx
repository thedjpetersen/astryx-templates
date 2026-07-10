// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Greenroom scheduling picture for
 *   Fairweather Repertory's production of "Salt & Cedar" (rehearsal week
 *   Mon Jul 13 – Sat Jul 18, 2026; two periods per day, AFT 2:00–5:00p and
 *   EVE 6:30–9:30p). Twelve scenes totalling 80 script pages:
 *   8+6+7+5+8+4+7+5+7+9+5+9 = 80. Eight company members with fixed
 *   unavailability windows. Five scenes pre-scheduled at first render:
 *     1.1 → Mon AFT · Studio A (8pp)   1.2 → Mon EVE · Studio B (6pp)
 *     1.3 → Tue AFT · Studio A (7pp)   1.4 → Thu AFT · Studio B (5pp)
 *     1.5 → Wed EVE · Annex (8pp)
 *   ⇒ scheduled pages 8+6+7+5+8 = 34 → coverage 34/80 = 42.5%, rendered
 *   43%. Conflicts at first render, hand-checked: Jonah Trask is
 *   unavailable Mon EVE (ferry-line shift) and is cast in 1.2 @ Mon EVE;
 *   Sofia Whitehall is unavailable Thu AFT (voice class) and is cast in
 *   1.4 @ Thu AFT ⇒ exactly 2 conflicts. Room holds: Studio A holds 5
 *   slots, Studio B holds 4, the Annex holds 4 ⇒ 13 holds, 5 consumed by
 *   the pre-schedule ⇒ 8 free. Every header chip and rail count re-derives
 *   those exact numbers live from the schedule map. No clock reads, no
 *   randomness, no timers, no network assets.
 * @output Greenroom — Theater Rehearsal Grid: a stage-management scheduling
 *   surface for one rehearsal week. A 56px brand header (spotlight mark,
 *   production title, week label) over a 44px derived stat strip (coverage
 *   ring + pages chip, scenes-scheduled chip, conflict chip, free-holds
 *   chip), then the working band: an actor × scene coverage matrix — a
 *   sticky 240px scene column of 44px scene-row buttons beside eight 60px
 *   actor columns whose 64px header buttons focus an actor and whose cells
 *   are cast pips (hollow = unscheduled, brand fill = rehearsing, amber ! =
 *   conflict) — with a 36px per-actor coverage footer, beside a 300px
 *   room-hold rail listing three rooms' held slots as 40px chips (consumed
 *   chips name their scene; free chips become live "Place" buttons when a
 *   scene is selected, each previewing its conflict count before commit).
 *   A min-96px detail bar owns the selected scene: cast chips with per-slot
 *   availability, the current assignment, and Clear hold. Signature move:
 *   select an unscheduled scene, then place it into any free room hold —
 *   the coverage ring and pages chip, the per-actor footer counts, the
 *   matrix pips (including new amber conflicts for cast unavailable in
 *   that slot or double-booked across rooms), the room chip, and the
 *   free-holds counter all re-derive from the one schedule map in the
 *   same render, and the change is announced politely.
 * @position Page template; emitted by `astryx template theater-rehearsal-grid`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader (brand +
 *   production + week) | LayoutContent padding 0 → content column: stat
 *   strip 44 → body row (matrix scroller flex 1 · room-hold rail 300,
 *   border-left) → detail bar (min 96, flex-shrink 0). The matrix is the
 *   page; the rail is the placement surface; the detail bar is the one
 *   editing readout. No Cards anywhere.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): scene
 *   column 240 + 8 × 60 actor columns = 720 matrix + 300 rail + borders ≈
 *   1022 — fits with zero horizontal scroll. Nothing squeezes.
 * - <= 900px: actor columns narrow to 48 and the scene rows drop their
 *   assignment meta line (the pip states still carry it); rail narrows
 *   to 260.
 * - <= 640px (390px embed): the body row stacks — matrix first (its
 *   scroller keeps the sticky 132px scene column and scrolls the actor
 *   columns horizontally, subtraction not squeeze), rail below at full
 *   width, detail-bar actions wrap. Stat chips scroll horizontally in
 *   their 44px strip at every width.
 * Container policy: work-surface archetype — a two-axis matrix grid, one
 *   rail of hold chips, frame rows. Scene rows, actor headers, hold chips,
 *   and stat filter chips are real <button>s (aria-pressed where they
 *   toggle). All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Greenroom
 *   magenta): light-dark(#A61E4D, #F06595) — #A61E4D on #FFFFFF ≈ 7.0:1,
 *   #F06595 on ~#1C1C1E ≈ 6.9:1 — used for the mark, the coverage ring,
 *   scheduled pips, consumed hold chips, and focus rings. Text/glyph on a
 *   solid brand fill: #FFFFFF on #A61E4D ≈ 7.0:1; #2B0714 on #F06595 ≈
 *   8.3:1 (white on #F06595 would fail at ~1.9:1). State pairs with math
 *   at the declaration: conflict amber light-dark(#B45309, #F5A623)
 *   (≈4.7:1 / ≈8.8:1), clear green light-dark(#15803D, #4ADE80) (≈5.0:1 /
 *   ≈9.6:1). Tints are ≤16%-alpha washes under text that keeps its own
 *   ≥4.5:1 pair.
 * Density grid (repeated verbatim in the CSS): header 56 · stat strip 44 ·
 *   actor header row 64 · scene rows 44 · footer row 36 · scene column
 *   240 · actor columns 60 · rail 300 · hold chips 40 · detail bar min 96
 *   · pips 18. Matrix pips are 18px dots inside 44px rows — the
 *   pip itself is not a target; every pip state is reachable through the
 *   44px scene-row button and the 40px hold chips, and pip meaning is
 *   mirrored in the row tooltip text.
 * Fixture policy: ONE schedule map `Record<sceneId, {slotKey, roomId} |
 *   null>` is the single state owner. Coverage, conflict lists,
 *   double-bookings, per-actor footer counts, hold-chip states, and the
 *   detail copy ALL re-derive from fixtures + that map every render, so
 *   no aggregate can drift from the grid. Selecting a scene or focusing
 *   an actor is local UI state and mutates nothing.
 */

import {useMemo, useState, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  DoorOpenIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-theater-rehearsal-grid';

// THE quarantined Greenroom brand magenta. #A61E4D on #FFFFFF ≈ 7.0:1
// (clears 4.5:1 down to the 11px overline it colors); #F06595 on a
// ~#1C1C1E dark surface ≈ 6.9:1.
const BRAND = 'light-dark(#A61E4D, #F06595)';
// Text/glyph ON a solid brand fill (consumed hold chips, scheduled pips):
// #FFFFFF on #A61E4D ≈ 7.0:1; #2B0714 on #F06595 ≈ 8.3:1 (white on
// #F06595 would fail at ~1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #2B0714)';
// Brand wash for selected rows / place-target chips (12% / 16% alpha) —
// text on it keeps its own ≥4.5:1 pair; the tint only nudges the surface.
const BRAND_TINT = 'light-dark(rgba(166, 30, 77, 0.12), rgba(240, 101, 149, 0.16))';
// Conflict amber: #B45309 on #FFFFFF ≈ 4.7:1; #F5A623 on #1C1C1E ≈ 8.8:1.
const WARN = 'light-dark(#B45309, #F5A623)';
const WARN_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(245, 166, 35, 0.16))';
// Clear/covered green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';

// ---------------------------------------------------------------------------
// WEEK MODEL — Mon Jul 13 … Sat Jul 18, 2026; two periods per day. A slot
// key is `${dayId}-${periodId}` ("tue-eve"). Nothing reads a clock: the
// week, the dates, and every label are fixed strings.
// ---------------------------------------------------------------------------

type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
type PeriodId = 'aft' | 'eve';
type SlotKey = `${DayId}-${PeriodId}`;

interface DayDef {
  id: DayId;
  label: string;
  date: string;
}

const DAYS: DayDef[] = [
  {id: 'mon', label: 'Mon', date: 'Jul 13'},
  {id: 'tue', label: 'Tue', date: 'Jul 14'},
  {id: 'wed', label: 'Wed', date: 'Jul 15'},
  {id: 'thu', label: 'Thu', date: 'Jul 16'},
  {id: 'fri', label: 'Fri', date: 'Jul 17'},
  {id: 'sat', label: 'Sat', date: 'Jul 18'},
];

interface PeriodDef {
  id: PeriodId;
  label: string;
  time: string;
}

const PERIODS: PeriodDef[] = [
  {id: 'aft', label: 'AFT', time: '2:00–5:00p'},
  {id: 'eve', label: 'EVE', time: '6:30–9:30p'},
];

function slotDay(key: SlotKey): DayDef {
  const dayId = key.split('-')[0] as DayId;
  return DAYS.find(d => d.id === dayId) as DayDef;
}

function slotPeriod(key: SlotKey): PeriodDef {
  const periodId = key.split('-')[1] as PeriodId;
  return PERIODS.find(p => p.id === periodId) as PeriodDef;
}

/** "Tue EVE" — the short chip form. */
function slotShort(key: SlotKey): string {
  return `${slotDay(key).label} ${slotPeriod(key).label}`;
}

/** "Tue Jul 14 · EVE 6:30–9:30p" — the detail-bar form. */
function slotLong(key: SlotKey): string {
  const day = slotDay(key);
  const period = slotPeriod(key);
  return `${day.label} ${day.date} · ${period.label} ${period.time}`;
}

// ---------------------------------------------------------------------------
// COMPANY — eight members by identity. Unavailability windows are fixed
// slot keys with a human reason; the conflict engine reads only these.
// ---------------------------------------------------------------------------

type ActorId = 'am' | 'jt' | 'pk' | 'do' | 'lb' | 'rt' | 'sw' | 'gh';

interface Actor {
  id: ActorId;
  name: string;
  role: string;
  initials: string;
  unavailable: {slot: SlotKey; reason: string}[];
}

const ACTORS: Actor[] = [
  {
    id: 'am',
    name: 'Amara Ellison',
    role: 'Maren',
    initials: 'AE',
    unavailable: [{slot: 'sat-eve', reason: 'family commitment'}],
  },
  {
    id: 'jt',
    name: 'Jonah Trask',
    role: 'Theo',
    initials: 'JT',
    unavailable: [
      {slot: 'mon-eve', reason: 'ferry-line shift'},
      {slot: 'tue-eve', reason: 'ferry-line shift'},
    ],
  },
  {
    id: 'pk',
    name: 'Priya Kellner',
    role: 'Ida',
    initials: 'PK',
    unavailable: [{slot: 'fri-aft', reason: 'clinic shift'}],
  },
  {
    id: 'do',
    name: 'Marcus Okafor',
    role: 'Dez',
    initials: 'MO',
    unavailable: [{slot: 'wed-aft', reason: 'teaches percussion'}],
  },
  {
    id: 'lb',
    name: 'Lena Brook',
    role: 'Grandmother Ash',
    initials: 'LB',
    unavailable: [
      {slot: 'thu-eve', reason: 'evening seminar'},
      {slot: 'fri-eve', reason: 'evening seminar'},
    ],
  },
  {
    id: 'rt',
    name: 'Ruben Tal',
    role: 'Callum',
    initials: 'RT',
    unavailable: [{slot: 'sat-aft', reason: 'wedding gig'}],
  },
  {
    id: 'sw',
    name: 'Sofia Whitehall',
    role: 'June / u.s. Maren',
    initials: 'SW',
    unavailable: [{slot: 'thu-aft', reason: 'voice class'}],
  },
  {
    id: 'gh',
    name: 'Gideon Hale',
    role: 'Fisherman / ensemble',
    initials: 'GH',
    unavailable: [{slot: 'mon-aft', reason: 'boat charter'}],
  },
];

const ACTOR_BY_ID: Record<ActorId, Actor> = Object.fromEntries(
  ACTORS.map(a => [a.id, a]),
) as Record<ActorId, Actor>;

function unavailabilityFor(actorId: ActorId, slot: SlotKey) {
  return ACTOR_BY_ID[actorId].unavailable.find(u => u.slot === slot) ?? null;
}

// ---------------------------------------------------------------------------
// SCENES — 12 scenes, 80 pages total (8+6+7+5+8+4+7+5+7+9+5+9 = 80).
// `pages` is the display range; `pageCount` is the math field the coverage
// ring reads — the ranges are inclusive and contiguous 1–80, so the pair
// stays consistent by construction. Scene 1.4 carries the long stress
// title that exercises row ellipsis.
// ---------------------------------------------------------------------------

interface Scene {
  id: string;
  code: string;
  title: string;
  pages: string;
  pageCount: number;
  cast: ActorId[];
  note?: string;
}

const SCENES: Scene[] = [
  {
    id: 's11',
    code: '1.1',
    title: 'Arrival — the cottage at low tide',
    pages: 'pp. 1–8',
    pageCount: 8,
    cast: ['am', 'jt', 'lb'],
  },
  {
    id: 's12',
    code: '1.2',
    title: 'Nets and ledgers',
    pages: 'pp. 9–14',
    pageCount: 6,
    cast: ['jt', 'do', 'gh'],
  },
  {
    id: 's13',
    code: '1.3',
    title: "Ida's bargain",
    pages: 'pp. 15–21',
    pageCount: 7,
    cast: ['pk', 'am', 'rt'],
  },
  {
    id: 's14',
    code: '1.4',
    title: 'The letter that should have stayed unsent (storm flashback)',
    pages: 'pp. 22–26',
    pageCount: 5,
    cast: ['am', 'lb', 'sw', 'gh'],
    note: 'Needs rain loop cue from sound.',
  },
  {
    id: 's15',
    code: '1.5',
    title: 'Supper, interrupted',
    pages: 'pp. 27–34',
    pageCount: 8,
    cast: ['am', 'jt', 'pk', 'do', 'lb', 'rt'],
    note: 'Full table setting — props pull required.',
  },
  {
    id: 's16',
    code: '1.6',
    title: 'Callum on the breakwater',
    pages: 'pp. 35–38',
    pageCount: 4,
    cast: ['rt', 'gh'],
  },
  {
    id: 's21',
    code: '2.1',
    title: 'Morning after the blow',
    pages: 'pp. 39–45',
    pageCount: 7,
    cast: ['am', 'jt', 'pk'],
  },
  {
    id: 's22',
    code: '2.2',
    title: 'Dez counts the boats',
    pages: 'pp. 46–50',
    pageCount: 5,
    cast: ['do', 'gh', 'sw'],
  },
  {
    id: 's23',
    code: '2.3',
    title: 'Grandmother Ash speaks plainly',
    pages: 'pp. 51–57',
    pageCount: 7,
    cast: ['lb', 'am'],
  },
  {
    id: 's24',
    code: '2.4',
    title: 'The auction',
    pages: 'pp. 58–66',
    pageCount: 9,
    cast: ['jt', 'do', 'pk', 'rt', 'gh'],
    note: 'Fight call: staged shove — fight captain must be present.',
  },
  {
    id: 's25',
    code: '2.5',
    title: "June's confession",
    pages: 'pp. 67–71',
    pageCount: 5,
    cast: ['sw', 'am', 'rt'],
  },
  {
    id: 's26',
    code: '2.6',
    title: 'Cedar smoke — finale',
    pages: 'pp. 72–80',
    pageCount: 9,
    cast: ['am', 'jt', 'pk', 'do', 'lb', 'rt', 'sw', 'gh'],
    note: 'Full company. Music rehearsal folds in here.',
  },
];

const TOTAL_PAGES = SCENES.reduce((sum, s) => sum + s.pageCount, 0); // 80

// ---------------------------------------------------------------------------
// ROOMS + HOLDS — the company holds 13 room-slots this week (5 + 4 + 4).
// A hold is a room × slot the company may use; the schedule map decides
// which holds are consumed.
// ---------------------------------------------------------------------------

type RoomId = 'studio-a' | 'studio-b' | 'annex';

interface Room {
  id: RoomId;
  name: string;
  features: string;
  holds: SlotKey[];
}

const ROOMS: Room[] = [
  {
    id: 'studio-a',
    name: 'Studio A',
    features: 'Sprung floor · upright piano',
    holds: ['mon-aft', 'tue-aft', 'wed-aft', 'thu-eve', 'sat-aft'],
  },
  {
    id: 'studio-b',
    name: 'Studio B',
    features: 'Mirror wall · full tape-out',
    holds: ['mon-eve', 'tue-eve', 'thu-aft', 'fri-aft'],
  },
  {
    id: 'annex',
    name: 'Annex Black Box',
    features: 'True ground plan · props access',
    holds: ['wed-eve', 'fri-eve', 'sat-aft', 'sat-eve'],
  },
];

const ROOM_BY_ID: Record<RoomId, Room> = Object.fromEntries(
  ROOMS.map(r => [r.id, r]),
) as Record<RoomId, Room>;

const TOTAL_HOLDS = ROOMS.reduce((sum, r) => sum + r.holds.length, 0); // 13

// ---------------------------------------------------------------------------
// INITIAL SCHEDULE — the single state owner's seed. 34 of 80 pages placed
// (43% coverage) with exactly two seeded conflicts: Jonah @ 1.2 Mon EVE
// (ferry-line shift) and Sofia @ 1.4 Thu AFT (voice class).
// ---------------------------------------------------------------------------

interface Assignment {
  slot: SlotKey;
  roomId: RoomId;
}

type ScheduleMap = Record<string, Assignment | null>;

const INITIAL_SCHEDULE: ScheduleMap = {
  s11: {slot: 'mon-aft', roomId: 'studio-a'},
  s12: {slot: 'mon-eve', roomId: 'studio-b'},
  s13: {slot: 'tue-aft', roomId: 'studio-a'},
  s14: {slot: 'thu-aft', roomId: 'studio-b'},
  s15: {slot: 'wed-eve', roomId: 'annex'},
  s16: null,
  s21: null,
  s22: null,
  s23: null,
  s24: null,
  s25: null,
  s26: null,
};

// ---------------------------------------------------------------------------
// DERIVATION ENGINE — everything below re-derives from (fixtures, schedule)
// on every render. No aggregate is stored anywhere; the schedule map is the
// only mutable value the mutations touch.
// ---------------------------------------------------------------------------

/** One conflict: a cast member who cannot attend the slot their scene is
 * scheduled into — either a fixed unavailability window or a double-booking
 * (the same actor in two scenes scheduled into the same slot). */
interface Conflict {
  sceneId: string;
  actorId: ActorId;
  slot: SlotKey;
  kind: 'unavailable' | 'double-booked';
  reason: string;
}

interface DerivedBoard {
  scheduledScenes: number;
  scheduledPages: number;
  coveragePct: number; // 0–100, rounded
  conflicts: Conflict[];
  /** conflict lookup: `${sceneId}:${actorId}` → Conflict */
  conflictByCell: Map<string, Conflict>;
  /** actorId → scenes of theirs currently scheduled */
  actorScheduled: Record<ActorId, number>;
  /** actorId → total scenes they appear in (static, but derived here so the
   * footer can never disagree with the cast lists) */
  actorTotal: Record<ActorId, number>;
  /** actorId → true when any current conflict involves them */
  actorHasConflict: Record<ActorId, boolean>;
  freeHolds: number;
  consumedHolds: number;
}

function deriveBoard(schedule: ScheduleMap): DerivedBoard {
  const conflicts: Conflict[] = [];

  // Slot → cast index for double-booking detection: an actor appearing in
  // two scenes that share a slot cannot be in both rooms.
  const slotCast = new Map<SlotKey, {sceneId: string; actorId: ActorId}[]>();
  for (const scene of SCENES) {
    const assignment = schedule[scene.id];
    if (assignment == null) {
      continue;
    }
    for (const actorId of scene.cast) {
      const list = slotCast.get(assignment.slot) ?? [];
      list.push({sceneId: scene.id, actorId});
      slotCast.set(assignment.slot, list);
    }
  }

  let scheduledScenes = 0;
  let scheduledPages = 0;
  for (const scene of SCENES) {
    const assignment = schedule[scene.id];
    if (assignment == null) {
      continue;
    }
    scheduledScenes += 1;
    scheduledPages += scene.pageCount;
    for (const actorId of scene.cast) {
      const window = unavailabilityFor(actorId, assignment.slot);
      if (window != null) {
        conflicts.push({
          sceneId: scene.id,
          actorId,
          slot: assignment.slot,
          kind: 'unavailable',
          reason: window.reason,
        });
        continue;
      }
      const sharers = (slotCast.get(assignment.slot) ?? []).filter(
        entry => entry.actorId === actorId && entry.sceneId !== scene.id,
      );
      if (sharers.length > 0) {
        const other = SCENES.find(s => s.id === sharers[0].sceneId);
        conflicts.push({
          sceneId: scene.id,
          actorId,
          slot: assignment.slot,
          kind: 'double-booked',
          reason: `also called for ${other ? other.code : 'another scene'} in this slot`,
        });
      }
    }
  }

  const conflictByCell = new Map<string, Conflict>();
  for (const conflict of conflicts) {
    conflictByCell.set(`${conflict.sceneId}:${conflict.actorId}`, conflict);
  }

  const actorScheduled = {} as Record<ActorId, number>;
  const actorTotal = {} as Record<ActorId, number>;
  const actorHasConflict = {} as Record<ActorId, boolean>;
  for (const actor of ACTORS) {
    actorTotal[actor.id] = SCENES.filter(s => s.cast.includes(actor.id)).length;
    actorScheduled[actor.id] = SCENES.filter(
      s => s.cast.includes(actor.id) && schedule[s.id] != null,
    ).length;
    actorHasConflict[actor.id] = conflicts.some(c => c.actorId === actor.id);
  }

  const consumedHolds = SCENES.filter(s => schedule[s.id] != null).length;

  return {
    scheduledScenes,
    scheduledPages,
    coveragePct: Math.round((scheduledPages / TOTAL_PAGES) * 100),
    conflicts,
    conflictByCell,
    actorScheduled,
    actorTotal,
    actorHasConflict,
    freeHolds: TOTAL_HOLDS - consumedHolds,
    consumedHolds,
  };
}

/** Hold-chip state for one room × slot under the current schedule. */
interface HoldState {
  slot: SlotKey;
  roomId: RoomId;
  scene: Scene | null; // consuming scene, if any
}

function deriveHolds(schedule: ScheduleMap): Map<string, HoldState> {
  const map = new Map<string, HoldState>();
  for (const room of ROOMS) {
    for (const slot of room.holds) {
      const consumer =
        SCENES.find(s => {
          const a = schedule[s.id];
          return a != null && a.roomId === room.id && a.slot === slot;
        }) ?? null;
      map.set(`${room.id}:${slot}`, {slot, roomId: room.id, scene: consumer});
    }
  }
  return map;
}

/** Preview the conflicts that WOULD exist if `scene` were placed at
 * `slot` — the number each free hold chip wears while a scene is selected.
 * Counts fixed unavailability plus double-bookings against scenes already
 * scheduled into the same slot (any room). */
function previewConflicts(
  scene: Scene,
  slot: SlotKey,
  schedule: ScheduleMap,
): {actorId: ActorId; reason: string}[] {
  const result: {actorId: ActorId; reason: string}[] = [];
  for (const actorId of scene.cast) {
    const window = unavailabilityFor(actorId, slot);
    if (window != null) {
      result.push({actorId, reason: window.reason});
      continue;
    }
    const clash = SCENES.find(s => {
      if (s.id === scene.id) {
        return false;
      }
      const a = schedule[s.id];
      return a != null && a.slot === slot && s.cast.includes(actorId);
    });
    if (clash != null) {
      result.push({actorId, reason: `also called for ${clash.code} in this slot`});
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-theater-rehearsal-grid.
// Density grid repeated verbatim: header 56 · stat strip 44 · actor header
// row 64 · scene rows 44 · footer row 36 · scene column 240 · actor columns
// 60 · rail 300 · hold chips 40 · detail bar min 96 · pips 18.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  font-family: var(--font-family-sans);
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
}
.${SCOPE} .trg-focusable:focus-visible {
  outline: 2px solid ${BRAND};
  outline-offset: 2px;
}
.${SCOPE} .trg-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- header (56px) ------------------------------------------------------- */
.${SCOPE} .trg-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${SCOPE} .trg-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${BRAND};
}
.${SCOPE} .trg-overline {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${BRAND};
  white-space: nowrap;
}
/* --- content column ------------------------------------------------------ */
.${SCOPE} .trg-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .trg-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
/* --- stat strip (44px) --------------------------------------------------- */
.${SCOPE} .trg-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  overflow-x: auto;
}
.${SCOPE} .trg-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  white-space: nowrap;
}
.${SCOPE} .trg-stat strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.${SCOPE} .trg-stat--brand {
  border-color: ${BRAND};
  color: ${BRAND};
  background: ${BRAND_TINT};
}
.${SCOPE} .trg-stat--brand strong { color: ${BRAND}; }
.${SCOPE} .trg-stat--warn {
  border-color: ${WARN};
  color: ${WARN};
  background: ${WARN_TINT};
}
.${SCOPE} .trg-stat--warn strong { color: ${WARN}; }
.${SCOPE} .trg-stat--ok {
  border-color: ${OK};
  color: ${OK};
  background: ${OK_TINT};
}
.${SCOPE} .trg-stat--ok strong { color: ${OK}; }
/* Coverage ring: 28px SVG inside the 44px strip. */
.${SCOPE} .trg-ring {
  flex-shrink: 0;
  display: inline-flex;
}
/* --- matrix -------------------------------------------------------------- */
.${SCOPE} .trg-matrix-scroll {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
.${SCOPE} .trg-matrix {
  display: grid;
  grid-template-columns: 240px repeat(${ACTORS.length}, 60px);
  width: max-content;
  min-width: 100%;
}
/* Corner cell + actor header row: 64px, sticky top. */
.${SCOPE} .trg-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 6;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 0 var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
}
.${SCOPE} .trg-corner-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .trg-corner-meta {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .trg-actorhead {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px 2px;
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: none;
  border-right: none;
  border-top: none;
  cursor: pointer;
}
.${SCOPE} .trg-actorhead[aria-pressed='true'] {
  background: ${BRAND_TINT};
  box-shadow: inset 0 -2px 0 0 ${BRAND};
}
.${SCOPE} .trg-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${BRAND};
  border: var(--border-width) solid ${BRAND};
  background: ${BRAND_TINT};
}
.${SCOPE} .trg-actorhead[aria-pressed='true'] .trg-avatar {
  background: ${BRAND};
  color: ${BRAND_ON};
}
.${SCOPE} .trg-actorname {
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-actorwarn {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  color: ${WARN};
}
/* Scene rows: 44px; the scene cell is a sticky-left 240px button. */
.${SCOPE} .trg-scenecell {
  position: sticky;
  left: 0;
  z-index: 4;
  height: 44px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding: 4px var(--spacing-3);
  text-align: left;
  background: var(--color-background-surface);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  cursor: pointer;
  overflow: hidden;
}
.${SCOPE} .trg-scenecell[aria-pressed='true'] {
  background: ${BRAND_TINT};
  box-shadow: inset 3px 0 0 0 ${BRAND};
}
.${SCOPE} .trg-scenetitle {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${SCOPE} .trg-scenetitle .trg-code {
  font-variant-numeric: tabular-nums;
  color: ${BRAND};
  flex-shrink: 0;
}
.${SCOPE} .trg-scenetitle .trg-name {
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .trg-scenemeta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .trg-scenemeta--set { color: ${BRAND}; }
.${SCOPE} .trg-scenemeta--conflict { color: ${WARN}; }
/* Matrix body cells: 44px, pip-centered. */
.${SCOPE} .trg-cell {
  height: 44px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .trg-row--dim .trg-cell,
.${SCOPE} .trg-row--dim.trg-scenecell {
  opacity: 0.4;
}
/* Pips: 18px. Hollow = cast but unscheduled; fill = rehearsing; warn = !. */
.${SCOPE} .trg-pip {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}
.${SCOPE} .trg-pip--open {
  border: 2px solid light-dark(rgba(166, 30, 77, 0.45), rgba(240, 101, 149, 0.5));
}
.${SCOPE} .trg-pip--set {
  background: ${BRAND};
  color: ${BRAND_ON};
}
.${SCOPE} .trg-pip--warn {
  background: ${WARN};
  color: light-dark(#FFFFFF, #241503);
}
/* Footer row: 36px per-actor coverage counts, sticky bottom. */
.${SCOPE} .trg-foot {
  position: sticky;
  bottom: 0;
  z-index: 4;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  border-top: var(--border-width) solid var(--color-border);
}
.${SCOPE} .trg-foot--label {
  left: 0;
  position: sticky;
  z-index: 5;
  justify-content: flex-start;
  padding: 0 var(--spacing-3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-right: var(--border-width) solid var(--color-border);
}
.${SCOPE} .trg-foot--full { color: ${OK}; }
.${SCOPE} .trg-foot--conflict { color: ${WARN}; }
/* Focused-actor strip (appears over the matrix top when an actor header is
   pressed): unavailability chips for that actor. */
.${SCOPE} .trg-focusstrip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  background: ${BRAND_TINT};
  font-size: 12px;
  color: var(--color-text-primary);
}
.${SCOPE} .trg-focusstrip strong { color: ${BRAND}; }
.${SCOPE} .trg-unavail-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: var(--border-width) solid ${WARN};
  color: ${WARN};
  background: ${WARN_TINT};
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
/* --- room-hold rail (300px) ---------------------------------------------- */
.${SCOPE} .trg-rail {
  width: 300px;
  flex-shrink: 0;
  box-sizing: border-box;
  border-left: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .trg-rail-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-room {
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .trg-room-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.${SCOPE} .trg-room-name .trg-room-free {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-room-features {
  margin: 2px 0 var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-holds {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
/* Hold chips: 40px rows. Consumed chips wear the brand tint + scene code;
   free chips are dashed; place-target chips become solid brand buttons. */
.${SCOPE} .trg-hold {
  min-height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  text-align: left;
}
.${SCOPE} .trg-hold-slot {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-primary);
  width: 64px;
  flex-shrink: 0;
}
.${SCOPE} .trg-hold-what {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-hold--consumed {
  border-color: ${BRAND};
  background: ${BRAND_TINT};
}
.${SCOPE} .trg-hold--consumed .trg-hold-what { color: ${BRAND}; font-weight: 600; }
.${SCOPE} .trg-hold--consumed.trg-hold--conflict {
  border-color: ${WARN};
  background: ${WARN_TINT};
}
.${SCOPE} .trg-hold--consumed.trg-hold--conflict .trg-hold-what { color: ${WARN}; }
.${SCOPE} .trg-hold--free {
  border-style: dashed;
}
.${SCOPE} button.trg-hold--target {
  border-style: solid;
  border-color: ${BRAND};
  background: ${BRAND_TINT};
  cursor: pointer;
}
.${SCOPE} button.trg-hold--target .trg-hold-what {
  color: ${BRAND};
  font-weight: 700;
}
.${SCOPE} .trg-hold-warncount {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${WARN};
  border: var(--border-width) solid ${WARN};
  background: ${WARN_TINT};
  white-space: nowrap;
}
.${SCOPE} .trg-hold-okcount {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  color: ${OK};
  border: var(--border-width) solid ${OK};
  background: ${OK_TINT};
  white-space: nowrap;
}
/* --- detail bar (min 96px) ----------------------------------------------- */
.${SCOPE} .trg-detail {
  flex-shrink: 0;
  min-height: 96px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  padding: var(--spacing-2) var(--spacing-4);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${SCOPE} .trg-detail-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.${SCOPE} .trg-detail-title .trg-code { color: ${BRAND}; font-variant-numeric: tabular-nums; }
.${SCOPE} .trg-detail-meta {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-castchips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.${SCOPE} .trg-castchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${SCOPE} .trg-castchip--warn {
  border-color: ${WARN};
  color: ${WARN};
  background: ${WARN_TINT};
}
.${SCOPE} .trg-detail-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${SCOPE} .trg-detail-hint strong { color: ${BRAND}; }
/* --- responsive subtraction ---------------------------------------------- */
@media (max-width: 900px) {
  .${SCOPE} .trg-matrix {
    grid-template-columns: 240px repeat(${ACTORS.length}, 48px);
  }
  .${SCOPE} .trg-scenemeta { display: none; }
  .${SCOPE} .trg-scenecell { justify-content: center; }
  .${SCOPE} .trg-rail { width: 260px; }
}
@media (max-width: 640px) {
  .${SCOPE} .trg-body { flex-direction: column; }
  .${SCOPE} .trg-matrix-scroll { flex: none; max-height: 46dvh; }
  .${SCOPE} .trg-matrix {
    grid-template-columns: 132px repeat(${ACTORS.length}, 48px);
  }
  .${SCOPE} .trg-scenetitle { font-size: 11.5px; }
  .${SCOPE} .trg-rail {
    width: 100%;
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    flex: 1;
    min-height: 0;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${SCOPE} .trg-hold,
  .${SCOPE} .trg-pip,
  .${SCOPE} .trg-scenecell,
  .${SCOPE} .trg-actorhead {
    transition: background-color 120ms ease, border-color 120ms ease,
      opacity 120ms ease;
  }
}
`;

// ---------------------------------------------------------------------------
// BRAND MARK — Greenroom spotlight: a beam wedge falling onto a stage line
// with a hot spot. Tiny inline SVG, currentColor only (the header paints it
// with the quarantined brand accent).
// ---------------------------------------------------------------------------

function GreenroomMark() {
  return (
    <span className="trg-mark" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        {/* beam */}
        <path d="M8.2 2.4 L13.4 2.4 L18.4 16.2 L3.2 16.2 Z" fill="currentColor" opacity="0.32" />
        {/* lamp head */}
        <rect x="7.4" y="1.2" width="7.2" height="3.4" rx="1.7" fill="currentColor" />
        {/* hot spot on the deck */}
        <ellipse cx="10.8" cy="16.2" rx="6.4" ry="1.9" fill="currentColor" opacity="0.75" />
        {/* stage line */}
        <rect x="1" y="19" width="20" height="1.6" rx="0.8" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// COVERAGE RING — 28px SVG donut in the stat strip. Stroke-dasharray math:
// r=11 → circumference 2π·11 ≈ 69.115; the arc length is pct/100 of that.
// Deterministic: pure function of the derived coverage percent.
// ---------------------------------------------------------------------------

function CoverageRing({pct}: {pct: number}) {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const arc = (pct / 100) * circumference;
  return (
    <span className="trg-ring" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle
          cx="14"
          cy="14"
          r={radius}
          stroke="var(--color-border)"
          strokeWidth="3.5"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          stroke={BRAND}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference - arc}`}
          transform="rotate(-90 14 14)"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// MATRIX PIECES
// ---------------------------------------------------------------------------

type PipState = 'out' | 'open' | 'set' | 'warn';

/** One matrix cell. The pip is presentational (18px, inside a 44px row);
 * its full meaning lives on the cell title and the scene-row aria-label. */
function MatrixCell({
  scene,
  actor,
  pip,
  conflict,
  isDim,
}: {
  scene: Scene;
  actor: Actor;
  pip: PipState;
  conflict: Conflict | null;
  isDim: boolean;
}) {
  let title: string | undefined;
  if (pip === 'warn' && conflict != null) {
    title = `${actor.name} — ${conflict.reason} — conflicts with ${scene.code} @ ${slotShort(conflict.slot)}`;
  } else if (pip === 'set') {
    title = `${actor.name} rehearses ${scene.code}`;
  } else if (pip === 'open') {
    title = `${actor.name} is in ${scene.code} (not yet scheduled)`;
  }
  return (
    <div className={`trg-cell${isDim ? ' trg-row--dim' : ''}`} title={title}>
      {pip === 'open' && <span className="trg-pip trg-pip--open" />}
      {pip === 'set' && <span className="trg-pip trg-pip--set" />}
      {pip === 'warn' && <span className="trg-pip trg-pip--warn">!</span>}
    </div>
  );
}

/** Sticky-left 240px scene cell: a real 44px button that selects the scene.
 * Line 1: code + title (ellipsis). Line 2: pages + assignment/meta. */
function SceneCell({
  scene,
  assignment,
  conflictCount,
  isSelected,
  isDim,
  onSelect,
}: {
  scene: Scene;
  assignment: Assignment | null;
  conflictCount: number;
  isSelected: boolean;
  isDim: boolean;
  onSelect: (sceneId: string) => void;
}) {
  const room = assignment != null ? ROOM_BY_ID[assignment.roomId] : null;
  const assignmentLabel =
    assignment != null && room != null
      ? `${slotShort(assignment.slot)} · ${room.name}`
      : 'Unscheduled';
  const ariaLabel = `Scene ${scene.code}, ${scene.title}, ${scene.pages}, ${
    assignment != null && room != null
      ? `scheduled ${slotLong(assignment.slot)} in ${room.name}${
          conflictCount > 0 ? `, ${conflictCount} conflict${conflictCount === 1 ? '' : 's'}` : ''
        }`
      : 'unscheduled'
  }`;
  return (
    <button
      type="button"
      className={`trg-scenecell trg-focusable${isDim ? ' trg-row--dim' : ''}`}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      onClick={() => onSelect(scene.id)}>
      <span className="trg-scenetitle">
        <span className="trg-code">{scene.code}</span>
        <span className="trg-name">{scene.title}</span>
      </span>
      <span
        className={`trg-scenemeta${
          conflictCount > 0
            ? ' trg-scenemeta--conflict'
            : assignment != null
              ? ' trg-scenemeta--set'
              : ''
        }`}>
        {scene.pages} · {scene.pageCount}pp · {assignmentLabel}
        {conflictCount > 0 &&
          ` · ${conflictCount} conflict${conflictCount === 1 ? '' : 's'}`}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ROOM-HOLD RAIL PIECES
// ---------------------------------------------------------------------------

/** One 40px hold chip. Three shapes:
 *  - consumed: static chip naming the consuming scene (amber if that scene
 *    currently carries conflicts);
 *  - free + a scene is selected: a live "Place <code>" button previewing
 *    the conflict count that placement would create;
 *  - free + nothing selected: a dashed static chip. */
function HoldChip({
  hold,
  selectedScene,
  conflictCountForConsumer,
  schedule,
  onPlace,
}: {
  hold: HoldState;
  selectedScene: Scene | null;
  conflictCountForConsumer: number;
  schedule: ScheduleMap;
  onPlace: (sceneId: string, slot: SlotKey, roomId: RoomId) => void;
}) {
  const slotLabel = slotShort(hold.slot);
  if (hold.scene != null) {
    const hasConflict = conflictCountForConsumer > 0;
    return (
      <div
        className={`trg-hold trg-hold--consumed${hasConflict ? ' trg-hold--conflict' : ''}`}
        title={`${hold.scene.code} ${hold.scene.title} — ${slotLong(hold.slot)}`}>
        <span className="trg-hold-slot">{slotLabel}</span>
        <span className="trg-hold-what">
          {hold.scene.code} · {hold.scene.title}
        </span>
        {hasConflict && (
          <span className="trg-hold-warncount">
            <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
            {conflictCountForConsumer}
          </span>
        )}
      </div>
    );
  }
  // Free hold. If a selected scene is unplaced (or placed elsewhere), the
  // chip becomes the placement affordance with a conflict preview.
  if (selectedScene != null) {
    const preview = previewConflicts(selectedScene, hold.slot, schedule);
    const previewNames = preview
      .map(p => ACTOR_BY_ID[p.actorId].name.split(' ')[0])
      .join(', ');
    return (
      <button
        type="button"
        className="trg-hold trg-hold--target trg-focusable"
        aria-label={`Place scene ${selectedScene.code} into ${ROOM_BY_ID[hold.roomId].name}, ${slotLong(hold.slot)}${
          preview.length > 0
            ? `, would create ${preview.length} conflict${preview.length === 1 ? '' : 's'}: ${previewNames}`
            : ', no conflicts'
        }`}
        title={
          preview.length > 0
            ? preview
                .map(p => `${ACTOR_BY_ID[p.actorId].name}: ${p.reason}`)
                .join('\n')
            : undefined
        }
        onClick={() => onPlace(selectedScene.id, hold.slot, hold.roomId)}>
        <span className="trg-hold-slot">{slotLabel}</span>
        <span className="trg-hold-what">Place {selectedScene.code} here</span>
        {preview.length > 0 ? (
          <span className="trg-hold-warncount">
            <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
            {preview.length}
          </span>
        ) : (
          <span className="trg-hold-okcount">
            <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
            clear
          </span>
        )}
      </button>
    );
  }
  return (
    <div className="trg-hold trg-hold--free" title={slotLong(hold.slot)}>
      <span className="trg-hold-slot">{slotLabel}</span>
      <span className="trg-hold-what">Held — free</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one schedule map owns every mutation; selection + actor focus are
// pure UI state. All aggregates re-derive per render via useMemo.
// ---------------------------------------------------------------------------

export default function TheaterRehearsalGridTemplate() {
  const [schedule, setSchedule] = useState<ScheduleMap>(INITIAL_SCHEDULE);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>('s26');
  const [focusedActorId, setFocusedActorId] = useState<ActorId | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const board = useMemo(() => deriveBoard(schedule), [schedule]);
  const holds = useMemo(() => deriveHolds(schedule), [schedule]);

  const selectedScene =
    selectedSceneId != null
      ? (SCENES.find(s => s.id === selectedSceneId) ?? null)
      : null;
  const selectedAssignment =
    selectedScene != null ? schedule[selectedScene.id] : null;
  const focusedActor =
    focusedActorId != null ? ACTOR_BY_ID[focusedActorId] : null;

  const conflictCountForScene = (sceneId: string) =>
    board.conflicts.filter(c => c.sceneId === sceneId).length;

  // --- mutations (the only two writers of the schedule map) ---------------

  const placeScene = (sceneId: string, slot: SlotKey, roomId: RoomId) => {
    const scene = SCENES.find(s => s.id === sceneId);
    if (scene == null) {
      return;
    }
    const preview = previewConflicts(scene, slot, schedule);
    setSchedule(prev => ({...prev, [sceneId]: {slot, roomId}}));
    const room = ROOM_BY_ID[roomId];
    setAnnouncement(
      `Scene ${scene.code} placed ${slotLong(slot)} in ${room.name}. ` +
        (preview.length > 0
          ? `${preview.length} conflict${preview.length === 1 ? '' : 's'}: ${preview
              .map(p => ACTOR_BY_ID[p.actorId].name)
              .join(', ')}.`
          : 'No conflicts.'),
    );
  };

  const clearScene = (sceneId: string) => {
    const scene = SCENES.find(s => s.id === sceneId);
    const assignment = schedule[sceneId];
    if (scene == null || assignment == null) {
      return;
    }
    setSchedule(prev => ({...prev, [sceneId]: null}));
    setAnnouncement(
      `Scene ${scene.code} cleared from ${slotShort(assignment.slot)} — the ${ROOM_BY_ID[assignment.roomId].name} hold is free again.`,
    );
  };

  // --- header --------------------------------------------------------------

  const header = (
    <LayoutHeader hasDivider>
      <div className="trg-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <GreenroomMark />
          <StackItem size="fill" style={{minWidth: 0}}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <span className="trg-overline">Greenroom</span>
              <Heading level={2}>Salt &amp; Cedar — rehearsal grid</Heading>
              <Badge label="Fairweather Rep" variant="neutral" />
            </HStack>
          </StackItem>
          <HStack gap={2} vAlign="center">
            <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Week of Jul 13–18, 2026 · tech Aug 3 · first preview Aug 6
            </Text>
          </HStack>
        </HStack>
      </div>
    </LayoutHeader>
  );

  // --- stat strip (44px, all derived) ---------------------------------------

  const statStrip = (
    <div className="trg-stats" role="status" aria-label="Week readiness">
      <CoverageRing pct={board.coveragePct} />
      <span className="trg-stat trg-stat--brand">
        <strong>{board.coveragePct}%</strong> coverage ·{' '}
        <strong>{board.scheduledPages}</strong>/{TOTAL_PAGES} pp
      </span>
      <span className="trg-stat">
        <Icon icon={Clock3Icon} size="xsm" color="inherit" />
        <strong>{board.scheduledScenes}</strong>/{SCENES.length} scenes scheduled
      </span>
      <span
        className={`trg-stat ${board.conflicts.length > 0 ? 'trg-stat--warn' : 'trg-stat--ok'}`}>
        {board.conflicts.length > 0 ? (
          <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
        ) : (
          <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
        )}
        <strong>{board.conflicts.length}</strong> conflict
        {board.conflicts.length === 1 ? '' : 's'}
      </span>
      <span className="trg-stat">
        <Icon icon={DoorOpenIcon} size="xsm" color="inherit" />
        <strong>{board.freeHolds}</strong>/{TOTAL_HOLDS} holds free
      </span>
      <span className="trg-stat">
        <Icon icon={UsersIcon} size="xsm" color="inherit" />
        <strong>{ACTORS.length}</strong> company
      </span>
    </div>
  );

  // --- matrix ---------------------------------------------------------------

  const matrix = (
    <div className="trg-matrix-scroll">
      {/* Visual matrix built on CSS grid. Deliberately NOT role="grid":
          the interactive cells are ordinary buttons with complete
          aria-labels, which reads better than a half-implemented grid
          pattern (no arrow-key cell navigation is provided). */}
      <div className="trg-matrix" aria-label="Actor by scene coverage matrix">
        {/* header row */}
        <div className="trg-corner">
          <span className="trg-corner-title">Scene ↓ · Actor →</span>
          <span className="trg-corner-meta">
            {SCENES.length} scenes · {TOTAL_PAGES} pages
          </span>
        </div>
        {ACTORS.map(actor => (
          <button
            key={actor.id}
            type="button"
            style={{position: 'relative'}}
            className="trg-actorhead trg-focusable"
            aria-pressed={focusedActorId === actor.id}
            aria-label={`${actor.name} as ${actor.role}. ${
              board.actorScheduled[actor.id]
            } of ${board.actorTotal[actor.id]} scenes scheduled.${
              board.actorHasConflict[actor.id] ? ' Has a conflict.' : ''
            } Toggle to focus.`}
            title={`${actor.name} — ${actor.role}`}
            onClick={() =>
              setFocusedActorId(prev => (prev === actor.id ? null : actor.id))
            }>
            {board.actorHasConflict[actor.id] && (
              <span className="trg-actorwarn" aria-hidden>
                <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
              </span>
            )}
            <span className="trg-avatar" aria-hidden>
              {actor.initials}
            </span>
            <span className="trg-actorname">{actor.name.split(' ')[0]}</span>
          </button>
        ))}
        {/* scene rows */}
        {SCENES.map(scene => {
          const assignment = schedule[scene.id];
          const rowConflicts = conflictCountForScene(scene.id);
          const isDim =
            focusedActorId != null && !scene.cast.includes(focusedActorId);
          return (
            <RowFragment key={scene.id}>
              <SceneCell
                scene={scene}
                assignment={assignment}
                conflictCount={rowConflicts}
                isSelected={selectedSceneId === scene.id}
                isDim={isDim}
                onSelect={id =>
                  setSelectedSceneId(prev => (prev === id ? null : id))
                }
              />
              {ACTORS.map(actor => {
                const inCast = scene.cast.includes(actor.id);
                const conflict =
                  board.conflictByCell.get(`${scene.id}:${actor.id}`) ?? null;
                const pip: PipState = !inCast
                  ? 'out'
                  : conflict != null
                    ? 'warn'
                    : assignment != null
                      ? 'set'
                      : 'open';
                return (
                  <MatrixCell
                    key={actor.id}
                    scene={scene}
                    actor={actor}
                    pip={pip}
                    conflict={conflict}
                    isDim={isDim}
                  />
                );
              })}
            </RowFragment>
          );
        })}
        {/* footer row: per-actor coverage counts */}
        <div className="trg-foot trg-foot--label">Scheduled / in show</div>
        {ACTORS.map(actor => {
          const done = board.actorScheduled[actor.id];
          const total = board.actorTotal[actor.id];
          const cls = board.actorHasConflict[actor.id]
            ? ' trg-foot--conflict'
            : done === total
              ? ' trg-foot--full'
              : '';
          return (
            <div
              key={actor.id}
              className={`trg-foot${cls}`}
              title={`${actor.name}: ${done} of ${total} scenes scheduled`}>
              {done}/{total}
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- room-hold rail --------------------------------------------------------

  const rail = (
    <aside className="trg-rail" aria-label="Room holds">
      <div className="trg-rail-head">
        <Icon icon={DoorOpenIcon} size="xsm" color="inherit" />
        Room holds · week of Jul 13
        <span style={{marginLeft: 'auto', fontVariantNumeric: 'tabular-nums'}}>
          {board.freeHolds} free
        </span>
      </div>
      {ROOMS.map(room => {
        const roomHolds = room.holds.map(
          slot => holds.get(`${room.id}:${slot}`) as HoldState,
        );
        const freeCount = roomHolds.filter(h => h.scene == null).length;
        return (
          <section key={room.id} className="trg-room" aria-label={room.name}>
            <div className="trg-room-name">
              <Icon icon={DoorOpenIcon} size="xsm" color="inherit" />
              {room.name}
              <span className="trg-room-free">
                {freeCount}/{roomHolds.length} free
              </span>
            </div>
            <p className="trg-room-features">{room.features}</p>
            <div className="trg-holds">
              {roomHolds.map(hold => (
                <HoldChip
                  key={`${hold.roomId}:${hold.slot}`}
                  hold={hold}
                  selectedScene={
                    // A consumed chip never doubles as a target; a selected
                    // scene may re-place from one free hold to another.
                    selectedScene != null &&
                    (selectedAssignment == null ||
                      selectedAssignment.slot !== hold.slot ||
                      selectedAssignment.roomId !== hold.roomId)
                      ? selectedScene
                      : null
                  }
                  conflictCountForConsumer={
                    hold.scene != null ? conflictCountForScene(hold.scene.id) : 0
                  }
                  schedule={schedule}
                  onPlace={placeScene}
                />
              ))}
            </div>
          </section>
        );
      })}
    </aside>
  );

  // --- detail bar --------------------------------------------------------------

  const detail = (
    <div className="trg-detail">
      {selectedScene == null ? (
        <>
          <Text type="body" weight="semibold">
            No scene selected
          </Text>
          <span className="trg-detail-hint">
            Click a scene row to select it, then place it into any free room
            hold on the right. Coverage, conflicts, and holds re-derive
            together.
          </span>
        </>
      ) : (
        <>
          <div style={{minWidth: 0}}>
            <div className="trg-detail-title">
              <span className="trg-code">{selectedScene.code}</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {selectedScene.title}
              </span>
            </div>
            <div className="trg-detail-meta">
              {selectedScene.pages} · {selectedScene.pageCount}pp ·{' '}
              {selectedAssignment != null
                ? `${slotLong(selectedAssignment.slot)} · ${ROOM_BY_ID[selectedAssignment.roomId].name}`
                : 'unscheduled'}
              {selectedScene.note != null && ` · ${selectedScene.note}`}
            </div>
          </div>
          <div className="trg-castchips" aria-label="Cast availability">
            {selectedScene.cast.map(actorId => {
              const actor = ACTOR_BY_ID[actorId];
              const cellConflict =
                board.conflictByCell.get(`${selectedScene.id}:${actorId}`) ??
                null;
              return (
                <Tooltip
                  key={actorId}
                  content={
                    cellConflict != null
                      ? `${actor.name}: ${cellConflict.reason}`
                      : `${actor.name} — ${actor.role}`
                  }>
                  <span
                    className={`trg-castchip${cellConflict != null ? ' trg-castchip--warn' : ''}`}>
                    {cellConflict != null && (
                      <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
                    )}
                    {actor.name.split(' ')[0]} <em>({actor.role})</em>
                  </span>
                </Tooltip>
              );
            })}
          </div>
          <StackItem size="fill">
            <span className="trg-detail-hint">
              {selectedAssignment != null ? (
                <>
                  Placed. Pick another <strong>free hold</strong> to move it,
                  or clear it.
                </>
              ) : (
                <>
                  Pick a <strong>free hold</strong> in the rail — each shows
                  the conflicts it would create.
                </>
              )}
            </span>
          </StackItem>
          {selectedAssignment != null && (
            <Button
              label="Clear hold"
              variant="ghost"
              size="sm"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              onClick={() => clearScene(selectedScene.id)}
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="trg-content">
              <div aria-live="polite" className="trg-vh">
                {announcement}
              </div>
              {statStrip}
              {focusedActor != null && (
                <div className="trg-focusstrip">
                  <strong>{focusedActor.name}</strong>
                  <span>
                    {focusedActor.role} · in{' '}
                    {board.actorTotal[focusedActor.id]} scenes ·{' '}
                    {board.actorScheduled[focusedActor.id]} scheduled
                  </span>
                  {focusedActor.unavailable.length === 0 ? (
                    <span className="trg-unavail-chip" style={{borderColor: OK, color: OK, background: OK_TINT}}>
                      <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
                      fully available
                    </span>
                  ) : (
                    focusedActor.unavailable.map(u => (
                      <span key={u.slot} className="trg-unavail-chip">
                        <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
                        {slotShort(u.slot)} — {u.reason}
                      </span>
                    ))
                  )}
                </div>
              )}
              <div className="trg-body">
                {matrix}
                {rail}
              </div>
              {detail}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

/** Keyed grid-row fragment: CSS grid ignores the wrapper via display:
 * contents, so the scene cell + eight pips still land on one 44px row. */
function RowFragment({children}: {children: ReactNode}) {
  return <div style={{display: 'contents'}}>{children}</div>;
}
