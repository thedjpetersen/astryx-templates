var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Tarmac ramp-control picture for
 *   Meridian International, Concourse B, on Wed Jul 8 2026 with a FIXED
 *   now-line at 17:12 (t=72 on a minute axis where t=0 is 16:00). Six turns
 *   across stands B2–B7 plus one open stand (B8). Hand-checked ledger at
 *   first render:
 *     B2  NG 208  departed 16:52 vs SOBT 16:55  → on time (actual)
 *     B3  NG 214  proj off-block 17:30 vs 17:35 → on time  (fuel end 86 is
 *         the driver: max(82,86,66,84)+4 = 90 = 17:30)
 *     B4  CQ 3412 proj 17:28 vs 17:30 → TIGHT, 2-min margin
 *         (max(84,78,78)+4 = 88 = 17:28)
 *     B5  NG 771  proj 17:40 vs 17:50 → on time (cabin: pending sched 70 <
 *         now → starts 72, +24 = 96; max(74,75,68,96)+4 = 100 = 17:40)
 *     B6  NG 590  proj 17:46 vs 17:40 → LATE +6 (cabin waits on catering:
 *         max(84,86,72)=86, +16 = 102; max(100,92,86,102)+4 = 106 = 17:46)
 *     B7  CQ 3287 inbound ETA 17:25; proj 17:53 vs 18:02 → on time
 *         (max(109,104,102,105)+4 = 113 = 17:53)
 *   ⇒ OTP 5/6 = 83% · 1 late · 1 tight · 6 projected late minutes. Every
 *   header chip repeats those exact derivations live from the row set. No
 *   clock reads, no randomness, no timers, no network assets.
 * @output Tarmac — Turnaround Board: an airline ramp-control Gantt for one
 *   concourse. A 56px brand header (hold-short-bar mark, ops-window title,
 *   live OTP / late-minutes chips) over a 44px derived stat strip, then the
 *   board: a frozen 232px stand column (stand, flight pair, tail + type
 *   with an aircraft-silhouette glyph, pushback-risk chip) beside a
 *   840px minute-axis timeline (16:00–18:20 at 6px/min) with a fixed
 *   17:12 now-line. Each stand row carries four 22px task lanes — fuel /
 *   bags / catering / cabin — whose segments are real buttons; the
 *   critical (pushback-driving) segment wears a flag. A 108px+ detail bar
 *   owns the selected segment: sched vs projected, the dependency note,
 *   and the mutation buttons. Signature move: Complete now / Slip +5 /
 *   Slip +15 on any segment reflows every downstream segment through the
 *   dependency graph in the same render — the turn's risk chip, the
 *   critical-path flag, the OTP counter, and the late-minutes chip all
 *   re-derive from one override map, and the change is announced politely.
 * @position Page template; emitted by \`astryx template aviation-turnaround-board\`
 *
 * Frame: root 100dvh div > Layout height="fill". header (brand + OTP
 *   chips) | content column: stat strip 44 → board scroller (flex 1,
 *   two-axis: sticky top axis row 32, sticky left stand column 232) →
 *   detail bar (min 108, flex-shrink 0). No side panels — the Gantt IS the
 *   page; the detail bar is the one editing surface.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): stand
 *   column 232 + timeline 840 = 1072 board width → a few px of deliberate
 *   horizontal scroll inside the board scroller; header and stat strip fit
 *   on single lines. Nothing squeezes.
 * - <= 900px: stand column narrows to 148 (route + tail line hides, the
 *   risk chip keeps its row); stat chips wrap to two lines.
 * - <= 600px (390px embed): stand column 116 (stand code + risk chip
 *   only), header stacks its chip row under the title, detail-bar actions
 *   wrap; the timeline keeps its true 840px width and scrolls — the axis
 *   is the one honest two-axis scroll region (subtraction, not squeeze).
 * Container policy: work-surface archetype — frame rows, a board grid,
 *   and one detail bar; no Cards. Task segments, stand cells, and stat
 *   chips are styled real <button>s (aria-pressed on the selected
 *   segment). All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Tarmac
 *   amber): light-dark(#B45309, #F5A623) — #B45309 on #FFFFFF ≈ 4.7:1,
 *   #F5A623 on #1C1C1E ≈ 8.8:1 — used for the mark, the now-line, active
 *   segments, and TIGHT risk. State pairs with math at the declaration:
 *   done/on-time green light-dark(#15803D, #4ADE80) (≈5.0:1 / ≈9.6:1),
 *   late red light-dark(#DC2626, #F87171) (≈4.5:1 / ≈7.2:1). Tints are
 *   sub-16% alpha washes under text that keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · stat strip 44 ·
 *   axis row 32 · stand rows 116 (four 22px lanes, 4px lane gaps, 8px row
 *   padding: 8+22·4+4·3+8 = 116) · stand column 232 · timeline 840
 *   (140 min × 6 px/min) · detail bar min 108 · action buttons 40 · risk
 *   chips 22. Segment buttons are 22px tall — under the 40px touch floor,
 *   which is compensated: segments are tabbable with visible focus rings
 *   and every mutation also has a 40px button path in the detail bar.
 * Fixture policy: one override map \`Record<turnId.taskId, {completedAt?,
 *   slip}>\` is the single state owner; ALL schedule math (segment
 *   geometry, risk chips, OTP, late minutes, critical flags, detail copy)
 *   re-derives from fixtures + overrides every render, so no aggregate
 *   can drift from the rows.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FlagIcon,
  FuelIcon,
  LuggageIcon,
  PlaneLandingIcon,
  RotateCcwIcon,
  SparklesIcon,
  TimerIcon,
  UtensilsIcon,
  type LucideIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-aviation-turnaround-board';

// THE quarantined Tarmac brand amber. #B45309 on #FFFFFF ≈ 4.7:1 (passes
// 4.5:1 for the 11–13px chip text it colors); #F5A623 on a ~#1C1C1E dark
// surface ≈ 8.8:1. Also the now-line and the TIGHT risk hue.
const BRAND = 'light-dark(#B45309, #F5A623)';
// Text/glyph ON a solid brand fill (now-chip): #FFFFFF on #B45309 ≈ 4.7:1;
// #231A08 on #F5A623 ≈ 8.3:1 (white on #F5A623 would fail at ~1.8:1).
const BRAND_ON = 'light-dark(#FFFFFF, #231A08)';
// Active-segment / tight-chip wash. Text on it keeps its own ≥4.5:1 pair;
// the tint only nudges the surface (12% / 16% alpha).
const BRAND_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(245, 166, 35, 0.16))';
// Done / on-time green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Late red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on #1C1C1E ≈ 7.2:1.
const LATE = 'light-dark(#DC2626, #F87171)';
const LATE_TINT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';

// ---------------------------------------------------------------------------
// TIME MODEL — one minute axis. t = minutes after 16:00 local; the axis runs
// t 0…140 (16:00–18:20) at 6 px/min = 840px. The demo's "now" is FIXED at
// t=72 (17:12); nothing on the page reads a clock.
// ---------------------------------------------------------------------------

const AXIS_MIN = 0;
const AXIS_MAX = 140;
const PX_PER_MIN = 6;
const TIMELINE_W = (AXIS_MAX - AXIS_MIN) * PX_PER_MIN; // 840
const NOW_MIN = 72; // 17:12
const PUSH_BUFFER = 4; // doors-closed → off-block, minutes

/** t (minutes after 16:00) → "17:12". Valid for the 16:00–18:20 window. */
function clock(t: number): string {
  const h = 16 + Math.floor(t / 60);
  const m = t % 60;
  return \`\${h}:\${m < 10 ? '0' : ''}\${m}\`;
}

/** Signed minute delta → "+6m" / "−4m" / "0m" (true minus sign). */
function signedMin(d: number): string {
  if (d === 0) {
    return '0m';
  }
  return d > 0 ? \`+\${d}m\` : \`−\${Math.abs(d)}m\`;
}

// ---------------------------------------------------------------------------
// DOMAIN TYPES + TASK META — the four ramp task lanes, in fixed lane order.
// ---------------------------------------------------------------------------

type TaskType = 'fuel' | 'bags' | 'catering' | 'cabin';

const LANE_ORDER: TaskType[] = ['fuel', 'bags', 'catering', 'cabin'];

const TASK_META: Record<TaskType, {label: string; icon: LucideIcon; lane: number}> = {
  fuel: {label: 'Fuel uplift', icon: FuelIcon, lane: 0},
  bags: {label: 'Bags unload + load', icon: LuggageIcon, lane: 1},
  catering: {label: 'Catering exchange', icon: UtensilsIcon, lane: 2},
  cabin: {label: 'Cabin service', icon: SparklesIcon, lane: 3},
};

/** Fixture progress at the frozen now (t=72). */
type TaskProgress =
  | {kind: 'done'; start: number; end: number}
  | {kind: 'active'; started: number}
  | {kind: 'pending'};

type TurnTask = {
  id: TaskType;
  /** Scheduled start, minutes after 16:00. */
  sched: number;
  /** Planned duration, minutes. */
  dur: number;
  /** Task ids that must END before this one can start (pending tasks only —
   * a task that is already running has visibly cleared its dependencies). */
  deps?: TaskType[];
  progress: TaskProgress;
  /** Detail-bar context line — vendor, crew, gate story. */
  note: string;
};

type Turn =
  | {
      kind: 'departed';
      id: string;
      stand: string;
      inbound: string;
      outbound: string;
      route: string;
      tail: string;
      type: string;
      body: 'narrow' | 'wide';
      onBlocks: number;
      sobt: number;
      offBlock: number; // actual
      tasks: TurnTask[];
    }
  | {
      kind: 'active' | 'inbound';
      id: string;
      stand: string;
      inbound: string;
      outbound: string;
      route: string;
      tail: string;
      type: string;
      body: 'narrow' | 'wide';
      /** Actual on-blocks for active turns; ETA on-blocks for inbound. */
      onBlocks: number;
      sobt: number;
      tasks: TurnTask[];
    }
  | {kind: 'open'; id: string; stand: string; note: string};

// ---------------------------------------------------------------------------
// FIXTURES — Northgale Air (NG) mainline + Cascadia Connect (CQ) regional at
// Meridian International, Concourse B. Task times reconcile with the ledger
// in the @input comment; comments mark each stress fixture.
// ---------------------------------------------------------------------------

const TURNS: Turn[] = [
  {
    // Completed turn — proves the departed rendering + counts toward OTP
    // with ACTUAL (not projected) performance.
    kind: 'departed',
    id: 'b2',
    stand: 'B2',
    inbound: 'NG 145 · PDX',
    outbound: 'NG 208 · SAN',
    route: 'San Diego Intl',
    tail: 'N481NG',
    type: 'A320neo',
    body: 'narrow',
    onBlocks: 4, // 16:04
    sobt: 55, // 16:55
    offBlock: 52, // 16:52 — on time
    tasks: [
      {id: 'fuel', sched: 12, dur: 18, progress: {kind: 'done', start: 12, end: 30}, note: 'AvGold truck 4 · 11,900 lb uplift complete.'},
      {id: 'bags', sched: 8, dur: 30, progress: {kind: 'done', start: 8, end: 38}, note: '96 bags off / 88 on · belt 2 crew of 4.'},
      {id: 'catering', sched: 10, dur: 16, progress: {kind: 'done', start: 10, end: 26}, note: 'SkyGalley cart swap, fwd + aft galleys.'},
      {id: 'cabin', sched: 14, dur: 20, progress: {kind: 'done', start: 14, end: 34}, note: 'Turn clean, 5-crew sweep.'},
    ],
  },
  {
    // The seeded story row: fuel truck arrived 12 min late (sched 16:50,
    // started 17:02) and is now the pushback driver. Default selection.
    kind: 'active',
    id: 'b3',
    stand: 'B3',
    inbound: 'NG 517 · SEA',
    outbound: 'NG 214 · AUS',
    route: 'Austin–Bergstrom Intl',
    tail: 'N8703J',
    type: 'B737-8',
    body: 'narrow',
    onBlocks: 38, // 16:38
    sobt: 95, // 17:35
    tasks: [
      {id: 'fuel', sched: 50, dur: 24, progress: {kind: 'active', started: 62}, note: 'AvGold truck 7 held at B5 heavy — started 12 min late. 14,600 lb planned.'},
      {id: 'bags', sched: 42, dur: 40, progress: {kind: 'active', started: 42}, note: '124 bags off / 131 on · transfer cart for AUS bank staged.'},
      {id: 'catering', sched: 46, dur: 20, progress: {kind: 'done', start: 46, end: 66}, note: 'SkyGalley done 17:06 — aft galley sealed.'},
      {id: 'cabin', sched: 66, dur: 18, deps: ['catering'], progress: {kind: 'active', started: 66}, note: 'Crew of 4 aboard; waits on catering carts clearing the aft door.'},
    ],
  },
  {
    // Quick regional turn, NO catering (stress: an intentionally empty
    // lane with an inline reason). TIGHT at a 2-minute margin.
    kind: 'active',
    id: 'b4',
    stand: 'B4',
    inbound: 'CQ 3305 · BOI',
    outbound: 'CQ 3412 · OKC',
    route: 'Will Rogers World',
    tail: 'N612CQ',
    type: 'E175',
    body: 'narrow',
    onBlocks: 58, // 16:58
    sobt: 90, // 17:30
    tasks: [
      {id: 'fuel', sched: 64, dur: 14, progress: {kind: 'active', started: 64}, note: 'AvGold truck 2 · 7,100 lb — short uplift, tabs only.'},
      {id: 'bags', sched: 62, dur: 22, progress: {kind: 'active', started: 62}, note: '58 bags off / 61 on · single belt, crew of 3.'},
      {id: 'cabin', sched: 66, dur: 12, progress: {kind: 'active', started: 66}, note: 'Quick-turn tidy — seat pockets and lavs only.'},
    ],
  },
  {
    // Widebody long turn (stress: 46-char destination label exercises the
    // stand-cell ellipsis; scaled silhouette glyph).
    kind: 'active',
    id: 'b5',
    stand: 'B5',
    inbound: 'NG 770 · HNL',
    outbound: 'NG 771 · HNL',
    route: 'Honolulu — Daniel K. Inouye International',
    tail: 'N771NG',
    type: 'B767-300',
    body: 'wide',
    onBlocks: 10, // 16:10
    sobt: 110, // 17:50
    tasks: [
      {id: 'fuel', sched: 30, dur: 45, progress: {kind: 'active', started: 30}, note: 'AvGold truck 7 · 84,300 lb transpac uplift, dual-point.'},
      {id: 'bags', sched: 16, dur: 58, progress: {kind: 'active', started: 16}, note: '212 bags + 9 AKE cans · two belts, crew of 6.'},
      {id: 'catering', sched: 20, dur: 50, progress: {kind: 'done', start: 20, end: 68}, note: 'Double cart exchange finished 17:08, 2 min early.'},
      {id: 'cabin', sched: 70, dur: 24, deps: ['catering'], progress: {kind: 'pending'}, note: 'Deep-clean crew of 8 staged at the jet bridge.'},
    ],
  },
  {
    // THE late row at first render: inbound arrived 22 min late, the whole
    // turn is compressed and cabin still waits on catering → +6 late.
    kind: 'active',
    id: 'b6',
    stand: 'B6',
    inbound: 'NG 433 · ORD (arr +22)',
    outbound: 'NG 590 · MSY',
    route: 'Louis Armstrong New Orleans Intl',
    tail: 'N321NG',
    type: 'A321',
    body: 'narrow',
    onBlocks: 62, // 17:02
    sobt: 100, // 17:40
    tasks: [
      {id: 'fuel', sched: 70, dur: 22, progress: {kind: 'active', started: 70}, note: 'AvGold truck 5 · 16,900 lb — normal pace.'},
      {id: 'bags', sched: 66, dur: 34, progress: {kind: 'active', started: 66}, note: '141 bags off / 138 on · compressed after the late arrival.'},
      {id: 'catering', sched: 68, dur: 18, progress: {kind: 'active', started: 68}, note: 'SkyGalley single exchange — aft door blocked until carts clear.'},
      {id: 'cabin', sched: 84, dur: 16, deps: ['catering'], progress: {kind: 'pending'}, note: 'Crew of 5 waiting on the aft galley — the recoverable link in the chain.'},
    ],
  },
  {
    // Inbound not yet on stand: every segment renders hollow, Complete is
    // refused with a reason, Slip still reflows the projection.
    kind: 'inbound',
    id: 'b7',
    stand: 'B7',
    inbound: 'CQ 3286 · GEG',
    outbound: 'CQ 3287 · TUS',
    route: 'Tucson Intl',
    tail: 'N644CQ',
    type: 'E175',
    body: 'narrow',
    onBlocks: 85, // ETA 17:25
    sobt: 122, // 18:02
    tasks: [
      {id: 'fuel', sched: 91, dur: 13, progress: {kind: 'pending'}, note: 'AvGold truck 2 rolls from B4 after the CQ 3412 push.'},
      {id: 'bags', sched: 89, dur: 20, progress: {kind: 'pending'}, note: '49 bags expected off / 55 on.'},
      {id: 'catering', sched: 90, dur: 12, progress: {kind: 'pending'}, note: 'Snack-cart top-up only.'},
      {id: 'cabin', sched: 93, dur: 12, progress: {kind: 'pending'}, note: 'Quick-turn tidy.'},
    ],
  },
  {
    // Zero-state stand — the board shows capacity, not just work.
    kind: 'open',
    id: 'b8',
    stand: 'B8',
    note: 'Open · next arrival NG 902 · SLC at 18:40 (outside this window)',
  },
];

// ---------------------------------------------------------------------------
// DERIVATION ENGINE — the single source of schedule truth. Overrides are the
// only mutable state; everything below is recomputed from fixtures +
// overrides on every render.
// ---------------------------------------------------------------------------

/** One override per segment; keyed \`\${turnId}.\${taskId}\`. */
type SegmentOverride = {completedAt?: number; slip: number};
type Overrides = Record<string, SegmentOverride>;

type DerivedTask = {
  task: TurnTask;
  start: number;
  end: number;
  status: 'done' | 'active' | 'pending';
  slip: number;
  /** True when this task's end drives the projected off-block. */
  isCritical: boolean;
  /** Active task projected past its planned end (started + dur + slip). */
  isOverrun: boolean;
};

type RiskState = 'ontime' | 'tight' | 'late';

type DerivedTurn = {
  turn: Turn;
  tasks: DerivedTask[];
  /** Projected (or actual, for departed) off-block, minutes. */
  offBlock: number;
  /** offBlock − SOBT; positive = late. */
  delta: number;
  risk: RiskState;
};

function riskOf(delta: number): RiskState {
  if (delta > 0) {
    return 'late';
  }
  // Margin under 5 minutes is flagged TIGHT (still on time for OTP).
  return -delta < 5 ? 'tight' : 'ontime';
}

/**
 * Reflow one turn. Rules (each observable on the board):
 * - done: fixed [start, end] — or the override's completedAt for a task the
 *   controller completed early (end clamps to the completion minute).
 * - active: end = max(started + dur + slip, NOW) — work cannot finish in
 *   the past; slipping pushes the end right.
 * - pending: start = max(sched, every dep's end, NOW) — a task that hasn't
 *   started cannot start in the past, and waits for its dependencies.
 * - projected off-block = latest task end + 4 min pushback buffer.
 * Tasks are declared in dependency order, so a single pass resolves.
 */
function deriveTurn(turn: Turn, overrides: Overrides): DerivedTurn {
  if (turn.kind === 'open') {
    return {turn, tasks: [], offBlock: 0, delta: 0, risk: 'ontime'};
  }
  if (turn.kind === 'departed') {
    const tasks: DerivedTask[] = turn.tasks.map(task => ({
      task,
      start: task.progress.kind === 'done' ? task.progress.start : task.sched,
      end: task.progress.kind === 'done' ? task.progress.end : task.sched + task.dur,
      status: 'done' as const,
      slip: 0,
      isCritical: false,
      isOverrun: false,
    }));
    const delta = turn.offBlock - turn.sobt;
    return {turn, tasks, offBlock: turn.offBlock, delta, risk: riskOf(delta)};
  }

  const ends = new Map<TaskType, number>();
  const tasks: DerivedTask[] = turn.tasks.map(task => {
    const ov = overrides[\`\${turn.id}.\${task.id}\`] ?? {slip: 0};
    let start: number;
    let end: number;
    let status: DerivedTask['status'];
    let isOverrun = false;
    if (task.progress.kind === 'done') {
      start = task.progress.start;
      end = task.progress.end;
      status = 'done';
    } else if (task.progress.kind === 'active') {
      start = task.progress.started;
      if (ov.completedAt !== undefined) {
        end = ov.completedAt;
        status = 'done';
      } else {
        end = Math.max(start + task.dur + ov.slip, NOW_MIN);
        status = 'active';
        isOverrun = end > start + task.dur;
      }
    } else {
      const depEnd = (task.deps ?? []).reduce((acc, dep) => Math.max(acc, ends.get(dep) ?? 0), 0);
      start = Math.max(task.sched, depEnd, NOW_MIN);
      // Inbound turns: nothing can start before the aircraft is on blocks.
      if (turn.kind === 'inbound') {
        start = Math.max(start, task.sched);
      }
      end = start + task.dur + ov.slip;
      status = 'pending';
    }
    ends.set(task.id, end);
    return {task, start, end, status, slip: ov.slip, isCritical: false, isOverrun};
  });

  const latest = tasks.reduce((acc, t) => Math.max(acc, t.end), 0);
  for (const t of tasks) {
    // Exactly one critical flag per turn — the first lane-ordered driver.
    if (t.end === latest) {
      t.isCritical = true;
      break;
    }
  }
  const offBlock = latest + PUSH_BUFFER;
  const delta = offBlock - turn.sobt;
  return {turn, tasks, offBlock, delta, risk: riskOf(delta)};
}

type BoardStats = {
  turns: number;
  onTime: number;
  late: number;
  tight: number;
  lateMinutes: number;
};

/** OTP counts departed turns by ACTUAL performance and the rest by the live
 * projection — so completing or slipping a segment moves the counter. */
function deriveStats(derived: DerivedTurn[]): BoardStats {
  let turns = 0;
  let onTime = 0;
  let late = 0;
  let tight = 0;
  let lateMinutes = 0;
  for (const d of derived) {
    if (d.turn.kind === 'open') {
      continue;
    }
    turns += 1;
    if (d.delta <= 0) {
      onTime += 1;
      // A departed turn is finished — only live turns can be "tight".
      if (d.risk === 'tight' && d.turn.kind !== 'departed') {
        tight += 1;
      }
    } else {
      late += 1;
      lateMinutes += d.delta;
    }
  }
  return {turns, onTime, late, tight, lateMinutes};
}

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-aviation-turnaround-board.
// Density grid repeated verbatim: header 56 · stat strip 44 · axis row 32 ·
// stand rows 116 (22px lanes, 4px gaps, 8px padding) · stand column 232 ·
// timeline 840 · detail bar min 108 · action buttons 40 · risk chips 22.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .atb-focusable:focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: 2px;
}
.\${SCOPE} .atb-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.\${SCOPE} .atb-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${BRAND};
}
.\${SCOPE} .atb-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- stat strip: 44px of derived chips ---------------------------------- */
.\${SCOPE} .atb-stats {
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
.\${SCOPE} .atb-stat {
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
.\${SCOPE} .atb-stat strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .atb-stat--late {
  border-color: \${LATE};
  color: \${LATE};
  background: \${LATE_TINT};
}
.\${SCOPE} .atb-stat--late strong { color: \${LATE}; }
.\${SCOPE} .atb-stat--tight {
  border-color: \${BRAND};
  color: \${BRAND};
  background: \${BRAND_TINT};
}
.\${SCOPE} .atb-stat--tight strong { color: \${BRAND}; }
.\${SCOPE} .atb-stat--ok {
  border-color: \${OK};
  color: \${OK};
  background: \${OK_TINT};
}
.\${SCOPE} .atb-stat--ok strong { color: \${OK}; }
/* --- board scroller ------------------------------------------------------ */
.\${SCOPE} .atb-board {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
}
.\${SCOPE} .atb-grid {
  display: grid;
  grid-template-columns: 232px \${TIMELINE_W}px;
  width: max-content;
}
/* Axis row: 32px, sticky top. Corner cell sticky both axes. */
.\${SCOPE} .atb-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 6;
  height: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .atb-axis {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 32px;
  box-sizing: border-box;
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  position: sticky;
}
.\${SCOPE} .atb-axis-inner {
  position: relative;
  width: \${TIMELINE_W}px;
  height: 100%;
}
.\${SCOPE} .atb-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  transform: translateX(-50%);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .atb-now-chip {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  padding: 1px 8px;
  border-radius: 999px;
  background: \${BRAND};
  color: \${BRAND_ON};
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  white-space: nowrap;
  z-index: 1;
}
/* Stand column cells: sticky left, 116px rows. */
.\${SCOPE} .atb-stand {
  position: sticky;
  left: 0;
  z-index: 4;
  height: 116px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 8px var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  overflow: hidden;
}
.\${SCOPE} .atb-stand-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.\${SCOPE} .atb-stand-code {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .atb-plane {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
.\${SCOPE} .atb-flightline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.\${SCOPE} .atb-flightline .atb-route {
  font-weight: 400;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.\${SCOPE} .atb-tailline {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 22px risk chip — text keeps its own ≥4.5:1 pair on the wash. */
.\${SCOPE} .atb-risk {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  height: 22px;
  box-sizing: border-box;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.\${SCOPE} .atb-risk--ontime { color: \${OK}; border-color: \${OK}; background: \${OK_TINT}; }
.\${SCOPE} .atb-risk--tight { color: \${BRAND}; border-color: \${BRAND}; background: \${BRAND_TINT}; }
.\${SCOPE} .atb-risk--late { color: \${LATE}; border-color: \${LATE}; background: \${LATE_TINT}; }
/* Timeline cells */
.\${SCOPE} .atb-lanecell {
  position: relative;
  height: 116px;
  box-sizing: border-box;
  border-bottom: var(--border-width) solid var(--color-border);
  background:
    repeating-linear-gradient(
      to right,
      var(--color-border) 0,
      var(--color-border) 1px,
      transparent 1px,
      transparent \${20 * PX_PER_MIN}px
    );
  background-color: var(--color-background-body);
}
.\${SCOPE} .atb-lanecell--departed { opacity: 0.55; }
.\${SCOPE} .atb-stand--departed > :not(.atb-risk) { opacity: 0.55; }
.\${SCOPE} .atb-nowline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
  background: \${BRAND};
  opacity: 0.85;
  pointer-events: none;
}
.\${SCOPE} .atb-openrow {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 var(--spacing-4);
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* Segments: 22px-tall real buttons on 26px lane pitch (8px row padding). */
.\${SCOPE} .atb-seg {
  position: absolute;
  height: 22px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 6px;
  border-radius: 5px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 120ms ease, color 120ms ease;
}
.\${SCOPE} .atb-seg--done {
  border-color: \${OK};
  color: \${OK};
  background: \${OK_TINT};
}
.\${SCOPE} .atb-seg--active {
  border-color: \${BRAND};
  color: \${BRAND};
  /* elapsed portion painted via --atb-pct set inline per segment */
  background: linear-gradient(
    to right,
    \${BRAND_TINT} var(--atb-pct, 0%),
    var(--color-background-surface) var(--atb-pct, 0%)
  );
}
.\${SCOPE} .atb-seg--pending {
  border-style: dashed;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.\${SCOPE} .atb-seg--overrun,
.\${SCOPE} .atb-seg--latecrit {
  border-color: \${LATE};
  color: \${LATE};
}
.\${SCOPE} .atb-seg--selected {
  box-shadow: 0 0 0 2px var(--color-accent);
}
.\${SCOPE} .atb-seg-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .atb-seg-flag {
  display: inline-flex;
  flex-shrink: 0;
}
.\${SCOPE} .atb-lane-empty {
  position: absolute;
  height: 22px;
  display: flex;
  align-items: center;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  opacity: 0.8;
  white-space: nowrap;
}
/* --- detail bar ----------------------------------------------------------- */
.\${SCOPE} .atb-detail {
  flex-shrink: 0;
  min-height: 108px;
  box-sizing: border-box;
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  padding: var(--spacing-2) var(--spacing-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2) var(--spacing-5);
}
.\${SCOPE} .atb-detail-main {
  min-width: 260px;
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .atb-detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  min-width: 0;
}
.\${SCOPE} .atb-detail-title .atb-detail-flight {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .atb-detail-note {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .atb-detail-times {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .atb-detail-times strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.\${SCOPE} .atb-detail-driver { color: \${LATE}; font-weight: 600; }
.\${SCOPE} .atb-detail-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2);
}
/* Density-grid contract: the detail bar's mutation buttons are the 40px
   touch path that compensates for the 22px segments. */
.\${SCOPE} .atb-detail-actions button {
  min-height: 40px;
}
.\${SCOPE} .atb-detail-hint {
  font-size: 12.5px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .atb-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .\${SCOPE} .atb-grid { grid-template-columns: 148px \${TIMELINE_W}px; }
  .\${SCOPE} .atb-flightline .atb-route { display: none; }
  .\${SCOPE} .atb-tailline { display: none; }
}
@media (max-width: 600px) {
  .\${SCOPE} .atb-grid { grid-template-columns: 116px \${TIMELINE_W}px; }
  .\${SCOPE} .atb-flightline { display: none; }
  .\${SCOPE} .atb-plane { display: none; }
  .\${SCOPE} .atb-detail { padding-bottom: var(--spacing-3); }
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .atb-seg { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK + AIRCRAFT GLYPH — tiny inline SVGs, no emoji, no network art.
// ---------------------------------------------------------------------------

/** Tarmac mark: a taxiway hold-short marking — two solid bars over two
 * dashed bars — in the brand amber. */
function TarmacMark({size = 22}: {size?: number}) {
  return (
    <span className="atb-mark" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="2" y="8.4" width="18" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="2" y="13" width="4.4" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="8.8" y="13" width="4.4" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="15.6" y="13" width="4.4" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="2" y="17.4" width="4.4" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="8.8" y="17.4" width="4.4" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="15.6" y="17.4" width="4.4" height="2.6" rx="1.3" fill="currentColor" />
      </svg>
    </span>
  );
}

/** Top-view aircraft silhouette; widebodies render 15% larger. */
function AircraftGlyph({body}: {body: 'narrow' | 'wide'}) {
  const size = body === 'wide' ? 21 : 18;
  return (
    <span className="atb-plane" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.2 1.6c.3-.9 1.3-.9 1.6 0l.7 2.2c.1.4.2.9.2 1.3v2.6l6.7 3.6c.4.2.6.6.6 1v1.1c0 .3-.3.5-.6.4l-6.7-1.9v3.4l1.9 1.5c.2.2.4.5.4.8v.9c0 .3-.3.5-.6.4l-3.4-.9-3.4.9c-.3.1-.6-.1-.6-.4v-.9c0-.3.1-.6.4-.8l1.9-1.5v-3.4l-6.7 1.9c-.3.1-.6-.1-.6-.4v-1.1c0-.4.2-.8.6-1l6.7-3.6V5.1c0-.4.1-.9.2-1.3l.7-2.2Z" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const AXIS_TICKS = [0, 20, 40, 60, 80, 100, 120, 140]; // 16:00 … 18:20

type Selection = {turnId: string; taskId: TaskType} | null;

export default function AviationTurnaroundBoardTemplate() {
  // ONE state owner: the override map. Selection + announcement are view
  // state; every number on the page re-derives from TURNS + overrides.
  const [overrides, setOverrides] = useState<Overrides>({});
  const [selection, setSelection] = useState<Selection>({turnId: 'b3', taskId: 'fuel'});
  const [announcement, setAnnouncement] = useState('');

  const derived = useMemo(() => TURNS.map(turn => deriveTurn(turn, overrides)), [overrides]);
  const stats = useMemo(() => deriveStats(derived), [derived]);
  const otpPct = stats.turns === 0 ? 0 : Math.round((stats.onTime / stats.turns) * 100);

  const selectedTurn =
    selection !== null ? derived.find(d => d.turn.id === selection.turnId) : undefined;
  const selectedTask =
    selectedTurn !== undefined && selection !== null
      ? selectedTurn.tasks.find(t => t.task.id === selection.taskId)
      : undefined;

  // ---- mutations — every path builds \`next\` from the CURRENT map, commits
  // it, and announces the re-derived board consequence (pure updaters; the
  // announcement is computed outside setState so StrictMode can't double it).
  const commit = (turnId: string, prefix: string, next: Overrides) => {
    setOverrides(next);
    const turn = TURNS.find(t => t.id === turnId);
    if (turn === undefined || turn.kind === 'open' || turn.kind === 'departed') {
      return;
    }
    const d = deriveTurn(turn, next);
    const nextStats = deriveStats(TURNS.map(t => deriveTurn(t, next)));
    const pct = Math.round((nextStats.onTime / nextStats.turns) * 100);
    const riskText =
      d.delta > 0
        ? \`\${d.delta} min late\`
        : d.risk === 'tight'
          ? \`tight, \${-d.delta}-min margin\`
          : \`on time, \${-d.delta}-min margin\`;
    setAnnouncement(
      \`\${prefix} \${turn.outbound} now projects off-block \${clock(d.offBlock)} — \${riskText}. OTP \${nextStats.onTime} of \${nextStats.turns} (\${pct}%).\`,
    );
  };

  const completeNow = (turnId: string, taskId: TaskType) => {
    const key = \`\${turnId}.\${taskId}\`;
    const next = {...overrides, [key]: {...(overrides[key] ?? {slip: 0}), completedAt: NOW_MIN}};
    commit(turnId, \`\${TASK_META[taskId].label} completed at \${clock(NOW_MIN)}.\`, next);
  };

  const slipTask = (turnId: string, taskId: TaskType, minutes: number) => {
    const key = \`\${turnId}.\${taskId}\`;
    const cur = overrides[key] ?? {slip: 0};
    const next = {...overrides, [key]: {...cur, slip: cur.slip + minutes}};
    commit(turnId, \`\${TASK_META[taskId].label} slipped +\${minutes} min.\`, next);
  };

  const resetTask = (turnId: string, taskId: TaskType) => {
    const key = \`\${turnId}.\${taskId}\`;
    const next = {...overrides};
    delete next[key];
    commit(turnId, \`\${TASK_META[taskId].label} reset to plan.\`, next);
  };

  // ---- header ----
  const header = (
    <LayoutHeader>
      <div className="atb-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
        <TarmacMark />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Heading level={2}>Tarmac · Turnaround Board</Heading>
              <Badge label="Concourse B" variant="neutral" />
            </HStack>
            <Text type="supporting" color="secondary">
              Meridian International · Wed Jul 8, 2026 · ops window 16:00–18:20 · ramp controller
              D. Ibarra
            </Text>
          </VStack>
        </StackItem>
        <span
          className={\`atb-stat \${stats.late > 0 ? 'atb-stat--late' : 'atb-stat--ok'}\`}
          role="status"
          aria-label={\`On-time performance \${stats.onTime} of \${stats.turns} turns, \${otpPct} percent\`}>
          <Icon icon={Clock3Icon} size="xsm" color="inherit" />
          OTP <strong>{stats.onTime}/{stats.turns}</strong> · {otpPct}%
        </span>
        </HStack>
      </div>
    </LayoutHeader>
  );

  // ---- stat strip: every chip re-derives from the same derived array ----
  const statStrip = (
    <div className="atb-stats" role="group" aria-label="Derived window statistics">
      <span className="atb-stat">
        Turns in window <strong>{stats.turns}</strong>
      </span>
      <span className={\`atb-stat \${stats.late > 0 ? 'atb-stat--late' : 'atb-stat--ok'}\`}>
        {stats.late > 0 ? (
          <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
        ) : (
          <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
        )}
        <strong>{stats.late}</strong> late
      </span>
      <span className={\`atb-stat \${stats.tight > 0 ? 'atb-stat--tight' : ''}\`}>
        <Icon icon={TimerIcon} size="xsm" color="inherit" />
        <strong>{stats.tight}</strong> tight (&lt;5m margin)
      </span>
      <span className={\`atb-stat \${stats.lateMinutes > 0 ? 'atb-stat--late' : 'atb-stat--ok'}\`}>
        Projected late minutes <strong>{stats.lateMinutes}</strong>
      </span>
      <span className="atb-stat">
        <Icon icon={PlaneLandingIcon} size="xsm" color="inherit" />
        Now <strong>{clock(NOW_MIN)}</strong>
      </span>
    </div>
  );

  // ---- board ----
  const board = (
    <div className="atb-board" role="group" aria-label="Turnaround Gantt, stands B2 to B8">
      <div className="atb-grid">
        {/* axis row */}
        <div className="atb-corner">Stand / Turn</div>
        <div className="atb-axis" aria-hidden="true">
          <div className="atb-axis-inner">
            {AXIS_TICKS.map(t => (
              <span key={t} className="atb-tick" style={{left: (t - AXIS_MIN) * PX_PER_MIN}}>
                {clock(t)}
              </span>
            ))}
            <span className="atb-now-chip" style={{left: (NOW_MIN - AXIS_MIN) * PX_PER_MIN}}>
              NOW {clock(NOW_MIN)}
            </span>
          </div>
        </div>

        {derived.map(d => {
          const {turn} = d;
          if (turn.kind === 'open') {
            return (
              <StandRowOpen key={turn.id} stand={turn.stand} note={turn.note} />
            );
          }
          const isDeparted = turn.kind === 'departed';
          const riskLabel =
            isDeparted
              ? d.delta <= 0
                ? \`Departed \${clock(turn.offBlock)} · on time\`
                : \`Departed \${clock(turn.offBlock)} · \${signedMin(d.delta)}\`
              : d.delta > 0
                ? \`\${signedMin(d.delta)} late · proj \${clock(d.offBlock)}\`
                : d.risk === 'tight'
                  ? \`Tight · \${-d.delta}m margin\`
                  : \`On time · \${-d.delta}m margin\`;
          return (
            <StandRow
              key={turn.id}
              derived={d}
              riskLabel={riskLabel}
              selection={selection}
              onSelect={(taskId: TaskType) => setSelection({turnId: turn.id, taskId})}
            />
          );
        })}
      </div>
    </div>
  );

  // ---- detail bar ----
  let detail: ReactNode;
  if (
    selectedTurn === undefined ||
    selectedTask === undefined ||
    selectedTurn.turn.kind === 'open'
  ) {
    detail = (
      <div className="atb-detail">
        <span className="atb-detail-hint">
          Select a task segment on the board to see its schedule, dependency note, and the
          Complete / Slip controls.
        </span>
      </div>
    );
  } else {
    const turn = selectedTurn.turn;
    const meta = TASK_META[selectedTask.task.id];
    const isDeparted = turn.kind === 'departed';
    const isInbound = turn.kind === 'inbound';
    const canComplete = !isDeparted && selectedTask.status === 'active';
    const canSlip = !isDeparted && selectedTask.status !== 'done';
    const hasOverride = overrides[\`\${turn.id}.\${selectedTask.task.id}\`] !== undefined;
    const critical = selectedTurn.tasks.find(t => t.isCritical);
    detail = (
      <div className="atb-detail">
        <div className="atb-detail-main">
          <span className="atb-detail-title">
            <Icon icon={meta.icon} size="sm" color="inherit" />
            {meta.label}
            <span className="atb-detail-flight">
              {turn.outbound} · stand {turn.stand} · {turn.tail}
            </span>
          </span>
          <span className="atb-detail-note">{selectedTask.task.note}</span>
          <div className="atb-detail-times">
            <span>
              Sched <strong>{clock(selectedTask.task.sched)}–{clock(selectedTask.task.sched + selectedTask.task.dur)}</strong>
            </span>
            <span>
              {selectedTask.status === 'done' ? 'Actual' : 'Projected'}{' '}
              <strong>{clock(selectedTask.start)}–{clock(selectedTask.end)}</strong>
              {selectedTask.slip > 0 ? \` (slip +\${selectedTask.slip}m)\` : ''}
            </span>
            <span>
              SOBT <strong>{clock(turn.sobt)}</strong> · proj off-block{' '}
              <strong>{clock(selectedTurn.offBlock)}</strong>{' '}
              {selectedTurn.delta > 0 ? (
                <span className="atb-detail-driver">{signedMin(selectedTurn.delta)} late</span>
              ) : (
                \`(\${-selectedTurn.delta}m margin)\`
              )}
            </span>
            {critical !== undefined && (
              <span>
                Driver:{' '}
                <strong>
                  {TASK_META[critical.task.id].label} ends {clock(critical.end)}
                </strong>{' '}
                → off-block {clock(selectedTurn.offBlock)}
              </span>
            )}
          </div>
        </div>
        <div className="atb-detail-actions">
          {isDeparted ? (
            <Text type="supporting" color="secondary">
              Turn closed — departed {clock(turn.offBlock)}.
            </Text>
          ) : (
            <>
              {canComplete ? (
                <Button
                  label={\`Complete now (\${clock(NOW_MIN)})\`}
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
                  onClick={() => completeNow(turn.id, selectedTask.task.id)}
                />
              ) : (
                <Tooltip
                  content={
                    selectedTask.status === 'done'
                      ? 'Already complete'
                      : isInbound
                        ? \`Aircraft not on stand — ETA \${clock(turn.onBlocks)}\`
                        : \`Not started — begins \${clock(selectedTask.start)}\`
                  }>
                  <span>
                    <Button
                      label={\`Complete now (\${clock(NOW_MIN)})\`}
                      variant="primary"
                      size="sm"
                      isDisabled
                      icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
                    />
                  </span>
                </Tooltip>
              )}
              <Button
                label="Slip +5m"
                variant="secondary"
                size="sm"
                isDisabled={!canSlip}
                onClick={() => slipTask(turn.id, selectedTask.task.id, 5)}
              />
              <Button
                label="Slip +15m"
                variant="secondary"
                size="sm"
                isDisabled={!canSlip}
                onClick={() => slipTask(turn.id, selectedTask.task.id, 15)}
              />
              <Button
                label="Reset to plan"
                variant="ghost"
                size="sm"
                isDisabled={!hasOverride}
                icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                onClick={() => resetTask(turn.id, selectedTask.task.id)}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="atb-content">
              <div aria-live="polite" className="atb-vh">
                {announcement}
              </div>
              {statStrip}
              {board}
              {detail}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOARD ROWS
// ---------------------------------------------------------------------------

function StandRowOpen({stand, note}: {stand: string; note: string}) {
  return (
    <>
      <div className="atb-stand">
        <div className="atb-stand-top">
          <span className="atb-stand-code">{stand}</span>
        </div>
        <span className="atb-risk">Open</span>
      </div>
      <div className="atb-lanecell">
        <div className="atb-nowline" style={{left: (NOW_MIN - AXIS_MIN) * PX_PER_MIN}} />
        <div className="atb-openrow">{note}</div>
      </div>
    </>
  );
}

function StandRow({
  derived,
  riskLabel,
  selection,
  onSelect,
}: {
  derived: DerivedTurn;
  riskLabel: string;
  selection: Selection;
  onSelect: (taskId: TaskType) => void;
}) {
  const turn = derived.turn;
  if (turn.kind === 'open') {
    return null;
  }
  const isDeparted = turn.kind === 'departed';
  const presentTypes = new Set(derived.tasks.map(t => t.task.id));

  return (
    <>
      <div className={\`atb-stand\${isDeparted ? ' atb-stand--departed' : ''}\`}>
        <div className="atb-stand-top">
          <span className="atb-stand-code">{turn.stand}</span>
          <AircraftGlyph body={turn.body} />
          <span className="atb-flightline">
            {turn.outbound}
            <span className="atb-route">{turn.route}</span>
          </span>
        </div>
        <span className="atb-tailline">
          {turn.tail} · {turn.type} · in {turn.inbound} ·{' '}
          {turn.kind === 'inbound' ? \`ETA \${clock(turn.onBlocks)}\` : \`on blocks \${clock(turn.onBlocks)}\`}{' '}
          · SOBT {clock(turn.sobt)}
        </span>
        <span className={\`atb-risk atb-risk--\${derived.risk === 'late' ? 'late' : isDeparted || derived.risk === 'ontime' ? 'ontime' : 'tight'}\`}>
          {derived.risk === 'late' ? (
            <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
          ) : (
            <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
          )}
          {riskLabel}
        </span>
      </div>
      <div className={\`atb-lanecell\${isDeparted ? ' atb-lanecell--departed' : ''}\`}>
        <div className="atb-nowline" style={{left: (NOW_MIN - AXIS_MIN) * PX_PER_MIN}} />
        {derived.tasks.map(t => (
          <TaskSegment
            key={t.task.id}
            turnId={turn.id}
            flight={turn.outbound}
            derivedTask={t}
            isSelected={
              selection !== null && selection.turnId === turn.id && selection.taskId === t.task.id
            }
            isTurnLate={derived.delta > 0}
            onSelect={onSelect}
          />
        ))}
        {/* Intentionally-absent lanes get an inline reason (B4 no catering). */}
        {LANE_ORDER.filter(type => !presentTypes.has(type)).map(type => (
          <span
            key={type}
            className="atb-lane-empty"
            style={{
              top: 8 + TASK_META[type].lane * 26,
              left: (NOW_MIN - AXIS_MIN) * PX_PER_MIN + 10,
            }}>
            No {type} this turn — quick-turn profile
          </span>
        ))}
      </div>
    </>
  );
}

function TaskSegment({
  turnId,
  flight,
  derivedTask,
  isSelected,
  isTurnLate,
  onSelect,
}: {
  turnId: string;
  flight: string;
  derivedTask: DerivedTask;
  isSelected: boolean;
  isTurnLate: boolean;
  onSelect: (taskId: TaskType) => void;
}) {
  const {task, start, end, status, isCritical, isOverrun} = derivedTask;
  const meta = TASK_META[task.id];
  const left = (start - AXIS_MIN) * PX_PER_MIN;
  const width = Math.max((end - start) * PX_PER_MIN, 16);
  // Elapsed wash for active segments (fixed now → deterministic).
  const pct =
    status === 'active' ? Math.round(Math.min(Math.max((NOW_MIN - start) / (end - start), 0), 1) * 100) : 0;
  const showLabel = width >= 96;
  const stateClass =
    status === 'done' ? 'atb-seg--done' : status === 'active' ? 'atb-seg--active' : 'atb-seg--pending';
  const alarmClass = isOverrun ? ' atb-seg--overrun' : isCritical && isTurnLate ? ' atb-seg--latecrit' : '';

  return (
    <button
      type="button"
      className={\`atb-seg atb-focusable \${stateClass}\${alarmClass}\${isSelected ? ' atb-seg--selected' : ''}\`}
      style={
        {
          left,
          width,
          top: 8 + meta.lane * 26,
          '--atb-pct': \`\${pct}%\`,
        } as CSSProperties
      }
      aria-pressed={isSelected}
      aria-label={\`\${meta.label}, \${flight}: \${status}, \${clock(start)} to \${clock(end)}\${
        isCritical ? ', pushback driver' : ''
      }\`}
      onClick={() => onSelect(task.id)}>
      <Icon icon={meta.icon} size="xsm" color="inherit" />
      {showLabel && (
        <span className="atb-seg-label">
          {meta.label} {clock(start)}–{clock(end)}
        </span>
      )}
      {isCritical && (
        <Tooltip content="Pushback driver — this task's end sets the off-block time">
          <span className="atb-seg-flag">
            <Icon icon={FlagIcon} size="xsm" color="inherit" />
          </span>
        </Tooltip>
      )}
    </button>
  );
}
`;export{e as default};