// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Cadence fitness week frozen at
 *   Sat, Jul 11 (week Sun Jul 5 – Sat Jul 11, 2026): 7 day fixtures with
 *   Move calories / Exercise minutes / Stand hours against fixed goals
 *   620 CAL · 30 MIN · 12 HRS. Ring percents DERIVE from the raw values
 *   (never hand-typed): today = Move 486/620 → 78%, Exercise 42/30 →
 *   capped 100%, Stand 7/12 → 58% (the spec's 78/100/58 ✓). Weekly
 *   aggregates derive too: exercise goal days {Sun 34, Mon 41, Fri 36,
 *   Sat 42} = 4 of 7; perfect days = Mon only (645/41/12) = 1; rest days
 *   = Wed = 1. Milestone metrics Steps 9,214 · Distance 4.8 mi ·
 *   Flights 12. No Date.now(), no Math.random(), no network media.
 * @output Cadence — Activity Rings Close: a 390px MOBILE fitness
 *   day-summary. NavBar (activity mark · 'Rings' · 44px Replay) over a
 *   large-title row, then the centerpiece: three concentric SVG rings
 *   (Move outer r118 / Exercise r94 / Stand r70, 20px stroke, round
 *   caps) that sweep closed on mount via stroke-dashoffset transitions
 *   (900ms decelerate bezier, sequential 220ms delays). The Exercise
 *   ring closing at 100% fires an overshoot glow pulse + a ring-cap dot
 *   spark at the 12-o'clock cap, and a 'Goal hit · Exercise' chip drops
 *   into a reserved 36px row with a spring; the toast dock announces it.
 *   Center hub: big tabular count-up of Move calories (0→486 over 800ms,
 *   interval-driven fixed steps). A week strip of 7 mini-ring day
 *   buttons (S–S, today highlighted, Wed is the rest day with dashed
 *   empty rings) RE-RUNS the choreography with that day's values — all
 *   three rings retarget with the same staged transitions and the
 *   count-up restarts. Below: a Today's-rings listCard (3 value/goal
 *   rows), a This-week card (derived aggregates), and three Milestones
 *   metric cards whose numbers tick up only when they first scroll into
 *   view (IntersectionObserver, once; Replay re-ticks them). Replay
 *   resets the rings open and replays everything.
 * @position Page template; emitted by `astryx template mobile-activity-rings-close`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no fake OS chrome — the 52px
 *   sticky navBar at y=0 is the first pixel). No overlays/sheets here,
 *   so the shell never scroll-locks; position:fixed is banned. ONE
 *   polite toast dock (aria-live) rides a sticky bottom:0 zero-height
 *   dock with the toast absolute at bottom:16 (no tabBar on this
 *   surface); one toast at a time, a new toast REPLACES the old, 4.2s
 *   auto-dismiss timer (cleaned up) + a 44×44 dismiss button.
 * Animation contract: transform/opacity + SVG stroke-dashoffset ONLY —
 *   ring sweeps are stroke-dashoffset transitions (cubic-bezier(0.22, 1,
 *   0.36, 1), delays 0/220/440ms), the Goal-hit chip springs in with
 *   cubic-bezier(0.34, 1.56, 0.64, 1), glow/spark are one-shot
 *   transform+opacity keyframes mounted at the settle beat (staged
 *   1.5s setTimeout, cleaned up). Count-ups are setInterval with fixed
 *   step counts. Button paths: the week-strip day buttons and the 44px
 *   navBar Replay ARE the interaction surface (no gestures to pair).
 *   REDUCED MOTION (matchMedia read in a useEffect with a change
 *   listener): rings render at final values (transition:'none'), no
 *   count-ups (numbers render final), glow/spark/spring are REMOVED,
 *   'Goal hit' appears statically.
 * Container policy: inset-grouped listCards (12px radius, 1px border,
 *   hairline rowDividers inset 16/60); no desktop frames, no tables.
 * Color policy: token-pure chrome. THE quarantined brand literal
 *   MOVE_ACCENT = light-dark(#D6336C, #F06595) — as the Move ring fill
 *   vs the body/card surface: #D6336C on #FFFFFF ≈ 4.9:1, #F06595 on
 *   #1F1F22 ≈ 5.6:1 (both clear the ≥3:1 fill bar); as the 34px/700
 *   center count (large text, 3:1 bar) it passes the same math.
 *   Exercise ring = var(--color-success) (#0D8626 ≈ 4.8:1 light /
 *   ≈ 3.5:1 dark, ≥3:1 fill ✓); Stand ring = var(--color-accent)
 *   (#0064E0 ≈ 4.7:1 light, #2694FE ≈ 4.6:1 dark ✓). Ring rest tracks
 *   are decorative underlays (color-mix 20% of each ring color into the
 *   body token) — the meaningful values ride the sweeps plus the
 *   value/goal text rows; the rest day's EMPTY state is carried by
 *   dashed border-emphasized circles + explicit 'Rest day' text, never
 *   color alone. Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20 hairline;
 *   ring stage 280×280 centered (280+2×16=312 < 320 ✓); reserved 36px
 *   chip row (zero layout shift); week strip 7 flex:1 day buttons ≥44px
 *   tall; rows 60px two-line; metric cards 3-up grid. TYPE (Figtree via
 *   --font-family-body): 34/700 center count · 28/700 large title ·
 *   17/600 nav title · 16/400 body floor · 13/400 meta · 11/500
 *   overlines; tabular-nums on every count. Touch: every target ≥44×44.
 *
 * Responsive contract:
 * - Fluid 320–430: ring stage fixed 280 centered; week strip buttons
 *   flex:1 minWidth 0 (7×44=308 ≥ 320−32=288 → buttons compress to
 *   ~41px wide but keep ≥44px HEIGHT and merged full-column hits);
 *   metric grid stays 3-up (cards ≈ 88px at 320, numbers 20/700 fit).
 *   overflowX:'clip' backstop.
 * - Desktop stage: useElementWidth on the wrapper (container width, not
 *   viewport); >560px renders the standard centered phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline) on a
 *   var(--color-background-muted) backdrop — never a stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  ActivityIcon,
  Building2Icon,
  CheckIcon,
  DumbbellIcon,
  FlameIcon,
  FootprintsIcon,
  MoonIcon,
  PersonStandingIcon,
  RefreshCwIcon,
  RouteIcon,
  TargetIcon,
  TrophyIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Cadence Move coral). As the Move ring
// fill: #D6336C on the #FFFFFF light surface ≈ 4.9:1; #F06595 on the
// #1F1F22 dark card ≈ 5.6:1 — both ≥3:1. As the 34px/700 center count
// (large text, 3:1 bar) the same math applies.
const MOVE_ACCENT = 'light-dark(#D6336C, #F06595)';
// Brand-tinted wash for the nav mark seat / Move row icon seat.
const MOVE_TINT_14 = `color-mix(in srgb, ${MOVE_ACCENT} 14%, transparent)`;

// Token ring colors (contrast math in the header Color policy).
const RING_EXERCISE = 'var(--color-success)';
const RING_STAND = 'var(--color-accent)';

// Decorative rest-track underlays — 20% of each ring color mixed into the
// body token (the data rides the sweep + the value/goal rows; the rest
// day's empty state is dashed strokes + explicit text, not color alone).
function trackOf(ringColor: string): string {
  return `color-mix(in srgb, ${ringColor} 20%, var(--color-background-body))`;
}

// ---------------------------------------------------------------------------
// INJECTED CSS — `arc-` prefix. Button reset, :focus-visible rings,
// visually-hidden, and the one-shot choreography keyframes (transform/
// opacity only). Reduced-motion guard removes them entirely (JS gates the
// mounts too — belt and suspenders).
// ---------------------------------------------------------------------------

const ARC_CSS = `
.arc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.arc-btn:disabled { cursor: default; }
.arc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.arc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes arc-chip-drop {
  from { transform: translateY(-14px) scale(0.85); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.arc-chip-drop { animation: arc-chip-drop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes arc-glow {
  from { transform: scale(1); opacity: 0.5; }
  to { transform: scale(1.08); opacity: 0; }
}
.arc-glow {
  transform-box: fill-box;
  transform-origin: center;
  animation: arc-glow 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes arc-spark {
  0% { transform: scale(0); opacity: 0.9; }
  55% { transform: scale(1.9); opacity: 1; }
  100% { transform: scale(0.4); opacity: 0; }
}
.arc-spark {
  transform-box: fill-box;
  transform-origin: center;
  animation: arc-spark 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes arc-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.arc-toast-in { animation: arc-toast-in 220ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) {
  .arc-chip-drop, .arc-toast-in { animation: none; }
  .arc-glow, .arc-spark { animation: none; opacity: 0; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {background: 'var(--color-background-muted)'},
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, always-on hairline.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSeat: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: MOVE_TINT_14,
    color: MOVE_ACCENT,
  },
  replayBtn: {
    height: 44,
    paddingInline: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-accent)',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LARGE TITLE row — 28/700 + date caption at the 16px gutter.
  largeTitleRow: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingInline: 16,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0, whiteSpace: 'nowrap'},
  largeTitleDate: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // RING STAGE — 280×280 SVG centered; hub overlay; reserved 36px chip
  // row below so the Goal-hit chip never shifts layout.
  ringSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingInline: 16,
    paddingTop: 4,
  },
  ringZone: {position: 'relative', width: 280, height: 280, flexShrink: 0},
  ringHub: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  hubStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2},
  hubOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  hubCount: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.05,
    color: MOVE_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  hubGoal: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  hubRest: {fontSize: 22, fontWeight: 700, lineHeight: 1.1},
  chipRow: {height: 36, display: 'grid', placeItems: 'center'},
  goalChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  goalChipIcon: {color: RING_EXERCISE, display: 'inline-flex'},
  restChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px dashed var(--color-border-emphasized)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // WEEK STRIP — inset card, 7 flex:1 day buttons (≥44px tall columns).
  sectionHeader: {
    margin: '24px 0 8px',
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
  weekRow: {display: 'flex', padding: 6, gap: 2},
  dayBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 84,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 10,
    paddingBlock: 6,
  },
  dayBtnSelected: {background: 'var(--color-background-muted)'},
  dayLetter: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
  },
  dayLetterToday: {color: 'var(--color-text-accent)'},
  dayDate: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TODAY'S RINGS + THIS WEEK — 60px two-line rows.
  row60: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 60},
  iconSeat: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
  },
  rowText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  rowValueUnit: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.04em',
  },
  // MILESTONES — 3-up metric card grid; numbers tick on first view.
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginInline: 16,
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    minWidth: 0,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  footerCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '24px 16px 0',
    fontVariantNumeric: 'tabular-nums',
  },
  spacer24: {height: 24},
  // TOAST DOCK — sticky bottom:0 zero-height dock; the single polite
  // toast rides absolute at bottom:16 (no tabBar on this surface).
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 30, height: 0},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
    insetInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  toastDismiss: {
    width: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic by law. Every percent on screen derives from the
// raw value/goal pairs below; nothing is hand-typed twice.
// ---------------------------------------------------------------------------

const MOVE_GOAL_CAL = 620;
const EXERCISE_GOAL_MIN = 30;
const STAND_GOAL_HR = 12;
const TODAY_INDEX = 6; // Sat, Jul 11

interface DayFixture {
  id: string;
  letter: string; // week strip letter (S M T W T F S)
  dayName: string; // large-title name when selected
  dateLabel: string; // 'Jul 5'
  moveCal: number;
  exerciseMin: number;
  standHr: number;
  isRest: boolean;
}

// Week of Sun Jul 5 – Sat Jul 11, 2026. CROSS-CHECKS (all derived via the
// pct helpers, never hand-typed): today Sat = 486/620→78%, 42/30→100%
// (capped), 7/12→58% — the spec's 78/100/58 ✓. Exercise-goal days
// {Sun 34, Mon 41, Fri 36, Sat 42} = 4 of 7; perfect days = Mon
// (645≥620, 41≥30, 12≥12) = 1; rest days = Wed = 1.
const WEEK: DayFixture[] = [
  {id: 'sun', letter: 'S', dayName: 'Sunday', dateLabel: 'Jul 5', moveCal: 385, exerciseMin: 34, standHr: 9, isRest: false},
  {id: 'mon', letter: 'M', dayName: 'Monday', dateLabel: 'Jul 6', moveCal: 645, exerciseMin: 41, standHr: 12, isRest: false},
  {id: 'tue', letter: 'T', dayName: 'Tuesday', dateLabel: 'Jul 7', moveCal: 546, exerciseMin: 18, standHr: 10, isRest: false},
  {id: 'wed', letter: 'W', dayName: 'Wednesday', dateLabel: 'Jul 8', moveCal: 0, exerciseMin: 0, standHr: 0, isRest: true},
  {id: 'thu', letter: 'T', dayName: 'Thursday', dateLabel: 'Jul 9', moveCal: 440, exerciseMin: 14, standHr: 8, isRest: false},
  {id: 'fri', letter: 'F', dayName: 'Friday', dateLabel: 'Jul 10', moveCal: 577, exerciseMin: 36, standHr: 11, isRest: false},
  {id: 'sat', letter: 'S', dayName: 'Saturday', dateLabel: 'Jul 11', moveCal: 486, exerciseMin: 42, standHr: 7, isRest: false},
];

/** Ring sweep percent — capped at 100 (rings never overlap themselves). */
function pctOf(value: number, goal: number): number {
  return Math.min(100, Math.round((value / goal) * 100));
}
function movePct(day: DayFixture): number {
  return pctOf(day.moveCal, MOVE_GOAL_CAL);
}
function exercisePct(day: DayFixture): number {
  return pctOf(day.exerciseMin, EXERCISE_GOAL_MIN);
}
function standPct(day: DayFixture): number {
  return pctOf(day.standHr, STAND_GOAL_HR);
}

// Derived weekly aggregates (asserted in the WEEK comment).
const EXERCISE_GOAL_DAYS = WEEK.filter(day => exercisePct(day) >= 100).length; // 4
const PERFECT_DAYS = WEEK.filter(
  day => movePct(day) >= 100 && exercisePct(day) >= 100 && standPct(day) >= 100,
).length; // 1 (Mon)
const REST_DAYS = WEEK.filter(day => day.isRest).length; // 1 (Wed)

// Milestone metrics (today) — tick up on first scroll-into-view.
const STEPS_TARGET = 9214;
const DISTANCE_TENTHS = 48; // 4.8 mi, ticked in tenths
const FLIGHTS_TARGET = 12;

// Ring geometry — 280×280 stage, 20px strokes, 4px gaps (118−94 = 94−70
// = 24 = 20 + 4 ✓). Sweeps start at 12 o'clock via rotate(-90).
const RING_STAGE = 280;
const RING_CENTER = RING_STAGE / 2;
const RING_STROKE = 20;
const R_MOVE = 118;
const R_EXERCISE = 94;
const R_STAND = 70;
const RING_DELAYS_MS = [0, 220, 440]; // Move → Exercise → Stand
const SWEEP_MS = 900;
// Settle beat = last delay + sweep + slack; fires the goal choreography.
const SETTLE_MS = 1500;

function circumference(radius: number): number {
  return 2 * Math.PI * radius;
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Container width via ResizeObserver (demo-stage rule — never viewport). */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** prefers-reduced-motion via matchMedia, with a change listener. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Interval-driven count-up with FIXED steps (deterministic — no
 * wall-clock reads). When `animate` is false the value renders final.
 */
function useTickUp(
  target: number,
  durationMs: number,
  runKey: string,
  animate: boolean,
): number {
  const [value, setValue] = useState(animate ? 0 : target);
  useEffect(() => {
    if (!animate) {
      setValue(target);
      return undefined;
    }
    setValue(0);
    const steps = 24;
    const stepMs = Math.max(16, Math.round(durationMs / steps));
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      if (step >= steps) {
        setValue(target);
        clearInterval(id);
      } else {
        setValue(Math.round((target * step) / steps));
      }
    }, stepMs);
    return () => clearInterval(id);
  }, [target, durationMs, runKey, animate]);
  return value;
}

// ---------------------------------------------------------------------------
// RING PIECES
// ---------------------------------------------------------------------------

interface RingSpec {
  radius: number;
  color: string;
  pct: number;
  delayMs: number;
}

function ringDashOffset(radius: number, pct: number): number {
  return circumference(radius) * (1 - pct / 100);
}

interface ActivityRingsProps {
  day: DayFixture;
  armed: boolean; // false = rings held open (offset = full circumference)
  settled: boolean; // settle beat passed — goal glow/spark may mount
  reducedMotion: boolean;
}

function ActivityRings({day, armed, settled, reducedMotion}: ActivityRingsProps) {
  const rings: RingSpec[] = [
    {radius: R_MOVE, color: MOVE_ACCENT, pct: movePct(day), delayMs: RING_DELAYS_MS[0]},
    {radius: R_EXERCISE, color: RING_EXERCISE, pct: exercisePct(day), delayMs: RING_DELAYS_MS[1]},
    {radius: R_STAND, color: RING_STAND, pct: standPct(day), delayMs: RING_DELAYS_MS[2]},
  ];
  const goalFired = settled && exercisePct(day) >= 100 && !reducedMotion;
  const label = day.isRest
    ? `${day.dayName} ${day.dateLabel} — rest day, no ring data`
    : `${day.dayName} ${day.dateLabel} — Move ${day.moveCal} of ${MOVE_GOAL_CAL} calories (${movePct(day)}%), Exercise ${day.exerciseMin} of ${EXERCISE_GOAL_MIN} minutes (${exercisePct(day)}%), Stand ${day.standHr} of ${STAND_GOAL_HR} hours (${standPct(day)}%)`;
  return (
    <svg
      width={RING_STAGE}
      height={RING_STAGE}
      viewBox={`0 0 ${RING_STAGE} ${RING_STAGE}`}
      role="img"
      aria-label={label}>
      <g transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}>
        {rings.map(ring => (
          <circle
            key={`track-${ring.radius}`}
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={ring.radius}
            fill="none"
            stroke={day.isRest ? 'none' : trackOf(ring.color)}
            strokeWidth={RING_STROKE}
          />
        ))}
        {/* Rest-day EMPTY state — dashed hint circles, never color alone
            (the hub + chip say 'Rest day' in text). */}
        {day.isRest &&
          rings.map(ring => (
            <circle
              key={`rest-${ring.radius}`}
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={ring.radius}
              fill="none"
              stroke="var(--color-border-emphasized)"
              strokeWidth={2}
              strokeDasharray="3 7"
            />
          ))}
        {rings.map(ring => {
          const circ = circumference(ring.radius);
          return (
            <circle
              key={`sweep-${ring.radius}`}
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={ring.radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={circ}
              style={{
                strokeDashoffset: armed ? ringDashOffset(ring.radius, ring.pct) : circ,
                transition:
                  armed && !reducedMotion
                    ? `stroke-dashoffset ${SWEEP_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${ring.delayMs}ms`
                    : 'none',
              }}
            />
          );
        })}
        {/* Exercise 100% — one-shot overshoot glow pulse (transform +
            opacity only), mounted at the settle beat. */}
        {goalFired && (
          <circle
            className="arc-glow"
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={R_EXERCISE}
            fill="none"
            stroke={RING_EXERCISE}
            strokeWidth={RING_STROKE}
            pointerEvents="none"
          />
        )}
      </g>
      {/* Ring-cap dot spark at the Exercise 12-o'clock cap. */}
      {goalFired && (
        <circle
          className="arc-spark"
          cx={RING_CENTER}
          cy={RING_CENTER - R_EXERCISE}
          r={7}
          fill={RING_EXERCISE}
          pointerEvents="none"
        />
      )}
    </svg>
  );
}

function MiniRings({day}: {day: DayFixture}) {
  const rings: RingSpec[] = [
    {radius: 15, color: MOVE_ACCENT, pct: movePct(day), delayMs: 0},
    {radius: 11, color: RING_EXERCISE, pct: exercisePct(day), delayMs: 0},
    {radius: 7, color: RING_STAND, pct: standPct(day), delayMs: 0},
  ];
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" aria-hidden="true">
      <g transform="rotate(-90 18 18)">
        {rings.map(ring =>
          day.isRest ? (
            <circle
              key={`mrest-${ring.radius}`}
              cx={18}
              cy={18}
              r={ring.radius}
              fill="none"
              stroke="var(--color-border-emphasized)"
              strokeWidth={1.5}
              strokeDasharray="2 3"
            />
          ) : (
            <g key={`mday-${ring.radius}`}>
              <circle
                cx={18}
                cy={18}
                r={ring.radius}
                fill="none"
                stroke={trackOf(ring.color)}
                strokeWidth={3}
              />
              <circle
                cx={18}
                cy={18}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={circumference(ring.radius)}
                strokeDashoffset={ringDashOffset(ring.radius, ring.pct)}
              />
            </g>
          ),
        )}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface CycleState {
  key: number;
  fromZero: boolean; // Replay opens the rings first; day taps retarget
}

interface ToastState {
  seq: number;
  text: string;
}

export default function MobileActivityRingsCloseTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktopColumn = wrapWidth > 560;
  const reducedMotion = usePrefersReducedMotion();

  const [selectedIdx, setSelectedIdx] = useState(TODAY_INDEX);
  const [cycle, setCycle] = useState<CycleState>({key: 0, fromZero: true});
  const [armed, setArmed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [metricsSeen, setMetricsSeen] = useState(false);
  const [metricsRun, setMetricsRun] = useState(0);
  const metricsRef = useRef<HTMLDivElement | null>(null);

  const day = WEEK[selectedIdx];

  // CHOREOGRAPHY — staged timers per cycle (cleaned up): arm the sweep
  // transitions one frame after a from-zero reset, then a settle beat at
  // 1.5s fires the goal pulse/spark/chip + the toast announcement.
  // Reduced motion: everything renders final immediately, statically.
  useEffect(() => {
    if (reducedMotion) {
      setArmed(true);
      setSettled(true);
      if (exercisePct(WEEK[selectedIdx]) >= 100) {
        setToast(prev => ({
          seq: (prev?.seq ?? 0) + 1,
          text: `Exercise goal hit — ${WEEK[selectedIdx].exerciseMin} of ${EXERCISE_GOAL_MIN} min`,
        }));
      }
      return undefined;
    }
    setSettled(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (cycle.fromZero) {
      setArmed(false);
      timers.push(setTimeout(() => setArmed(true), 40));
    }
    timers.push(
      setTimeout(() => {
        setSettled(true);
        if (exercisePct(WEEK[selectedIdx]) >= 100) {
          setToast(prev => ({
            seq: (prev?.seq ?? 0) + 1,
            text: `Exercise goal hit — ${WEEK[selectedIdx].exerciseMin} of ${EXERCISE_GOAL_MIN} min`,
          }));
        }
      }, SETTLE_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [cycle, selectedIdx, reducedMotion]);

  // Toast auto-dismiss (one polite dock; a new toast replaces the old).
  useEffect(() => {
    if (toast == null) {
      return undefined;
    }
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);

  // Milestone tick-ups fire ONCE on first scroll-into-view.
  useEffect(() => {
    const element = metricsRef.current;
    if (element == null || metricsSeen) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setMetricsSeen(true);
          observer.disconnect();
        }
      },
      {threshold: 0.4},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [metricsSeen]);

  const replay = useCallback(() => {
    setCycle(prev => ({key: prev.key + 1, fromZero: true}));
    setMetricsRun(prev => prev + 1);
    setToast(null);
  }, []);

  const selectDay = useCallback((index: number) => {
    setSelectedIdx(index);
    // Retarget, don't reset — the three sweeps transition from their
    // current values to the new day's with the same staged delays.
    setCycle(prev => ({key: prev.key + 1, fromZero: false}));
  }, []);

  // Center Move-calorie count-up (0→486 over 800ms today).
  const hubCal = useTickUp(
    day.moveCal,
    800,
    `cal-${cycle.key}`,
    !reducedMotion && !day.isRest,
  );

  // Milestone tick-ups (~700ms) — gated behind first visibility.
  const metricsAnimate = metricsSeen && !reducedMotion;
  const stepsValue = useTickUp(STEPS_TARGET, 700, `steps-${metricsRun}`, metricsAnimate);
  const distanceTenths = useTickUp(DISTANCE_TENTHS, 700, `dist-${metricsRun}`, metricsAnimate);
  const flightsValue = useTickUp(FLIGHTS_TARGET, 700, `fl-${metricsRun}`, metricsAnimate);
  // Before first visibility (with motion) the numbers hold at 0; the
  // tick-up runs once when the observer fires. Reduced motion → final.
  const metricsVisibleValue = (value: number) =>
    metricsSeen || reducedMotion ? value : 0;

  const goalHit = exercisePct(day) >= 100;
  const isToday = selectedIdx === TODAY_INDEX;

  const ringRows = [
    {
      id: 'move',
      label: 'Move',
      icon: FlameIcon,
      seatBg: MOVE_TINT_14,
      seatColor: MOVE_ACCENT,
      pct: movePct(day),
      value: day.isRest ? '—' : `${day.moveCal} / ${MOVE_GOAL_CAL}`,
      unit: 'CAL',
    },
    {
      id: 'exercise',
      label: 'Exercise',
      icon: DumbbellIcon,
      seatBg: 'var(--color-success-muted)',
      seatColor: RING_EXERCISE,
      pct: exercisePct(day),
      value: day.isRest ? '—' : `${day.exerciseMin} / ${EXERCISE_GOAL_MIN}`,
      unit: 'MIN',
    },
    {
      id: 'stand',
      label: 'Stand',
      icon: PersonStandingIcon,
      seatBg: 'var(--color-accent-muted)',
      seatColor: RING_STAND,
      pct: standPct(day),
      value: day.isRest ? '—' : `${day.standHr} / ${STAND_GOAL_HR}`,
      unit: 'HRS',
    },
  ];

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{ARC_CSS}</style>
      <div style={{...styles.shell, ...(isDesktopColumn ? styles.shellDesktop : null)}}>
        <h1 className="arc-vh">Cadence — activity rings day summary</h1>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <div style={styles.brandSeat} aria-hidden="true">
              <span style={styles.brandMark}>
                <Icon icon={ActivityIcon} size="sm" color="inherit" />
              </span>
            </div>
          </div>
          <p style={styles.navTitle}>Rings</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="arc-btn arc-focusable"
              style={styles.replayBtn}
              onClick={replay}
              aria-label="Replay ring animation">
              <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
              Replay
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* LARGE TITLE */}
          <div style={styles.largeTitleRow}>
            <h2 style={styles.largeTitle}>{isToday ? 'Today' : day.dayName}</h2>
            <span style={styles.largeTitleDate}>
              {isToday ? `Sat, ${day.dateLabel}` : day.dateLabel} · 2026
            </span>
          </div>

          {/* RING STAGE */}
          <section style={styles.ringSection} aria-label="Activity rings">
            <div style={styles.ringZone}>
              <ActivityRings
                day={day}
                armed={armed}
                settled={settled}
                reducedMotion={reducedMotion}
              />
              <div style={styles.ringHub}>
                {day.isRest ? (
                  <div style={styles.hubStack}>
                    <span style={styles.hubOverline}>Rest day</span>
                    <span style={styles.hubRest}>No rings</span>
                    <span style={styles.hubGoal}>Recovery scheduled</span>
                  </div>
                ) : (
                  <div style={styles.hubStack}>
                    <span style={styles.hubOverline}>Move cal</span>
                    <span style={styles.hubCount}>{reducedMotion ? day.moveCal : hubCal}</span>
                    <span style={styles.hubGoal}>of {MOVE_GOAL_CAL}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Reserved 36px chip row — zero layout shift. */}
            <div style={styles.chipRow}>
              {day.isRest ? (
                <span style={styles.restChip}>
                  <Icon icon={MoonIcon} size="sm" color="inherit" />
                  Rest day — rings paused
                </span>
              ) : settled && goalHit ? (
                <span
                  className={reducedMotion ? undefined : 'arc-chip-drop'}
                  style={styles.goalChip}>
                  <span style={styles.goalChipIcon}>
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                  </span>
                  Goal hit · Exercise
                </span>
              ) : null}
            </div>
          </section>

          {/* WEEK STRIP */}
          <h3 style={styles.sectionHeader}>This week</h3>
          <div style={styles.listCard}>
            <div style={styles.weekRow} role="group" aria-label="Pick a day to replay its rings">
              {WEEK.map((weekDay, index) => (
                <button
                  key={weekDay.id}
                  type="button"
                  className="arc-btn arc-focusable"
                  style={{
                    ...styles.dayBtn,
                    ...(index === selectedIdx ? styles.dayBtnSelected : null),
                  }}
                  aria-pressed={index === selectedIdx}
                  aria-label={
                    weekDay.isRest
                      ? `${weekDay.dayName} ${weekDay.dateLabel}, rest day`
                      : `${weekDay.dayName} ${weekDay.dateLabel} — Move ${movePct(weekDay)}%, Exercise ${exercisePct(weekDay)}%, Stand ${standPct(weekDay)}%`
                  }
                  onClick={() => selectDay(index)}>
                  <span
                    style={{
                      ...styles.dayLetter,
                      ...(index === TODAY_INDEX ? styles.dayLetterToday : null),
                    }}>
                    {weekDay.letter}
                  </span>
                  <MiniRings day={weekDay} />
                  <span style={styles.dayDate}>{weekDay.dateLabel.slice(4)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TODAY'S RINGS DETAIL */}
          <h3 style={styles.sectionHeader}>{isToday ? "Today's rings" : `${day.dayName}'s rings`}</h3>
          <div style={styles.listCard}>
            {ringRows.map((row, index) => (
              <div key={row.id}>
                {index > 0 && <div style={styles.rowDivider} />}
                <div style={styles.row60}>
                  <span style={{...styles.iconSeat, background: row.seatBg, color: row.seatColor}}>
                    <Icon icon={row.icon} size="sm" color="inherit" />
                  </span>
                  <div style={styles.rowText}>
                    <span style={styles.rowPrimary}>{row.label}</span>
                    <span style={styles.rowSecondary}>
                      {day.isRest ? 'Rest day' : `${row.pct}% of goal`}
                    </span>
                  </div>
                  <span style={styles.rowValue}>
                    {row.value} <span style={styles.rowValueUnit}>{row.unit}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* WEEK AGGREGATES */}
          <h3 style={styles.sectionHeader}>Week recap</h3>
          <div style={styles.listCard}>
            <div style={styles.row60}>
              <span
                style={{
                  ...styles.iconSeat,
                  background: 'var(--color-success-muted)',
                  color: RING_EXERCISE,
                }}>
                <Icon icon={TargetIcon} size="sm" color="inherit" />
              </span>
              <div style={styles.rowText}>
                <span style={styles.rowPrimary}>Exercise goals hit</span>
                <span style={styles.rowSecondary}>Sun · Mon · Fri · Sat</span>
              </div>
              <span style={styles.rowValue}>
                {EXERCISE_GOAL_DAYS} of {WEEK.length}
              </span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.row60}>
              <span style={{...styles.iconSeat, background: MOVE_TINT_14, color: MOVE_ACCENT}}>
                <Icon icon={TrophyIcon} size="sm" color="inherit" />
              </span>
              <div style={styles.rowText}>
                <span style={styles.rowPrimary}>Perfect days</span>
                <span style={styles.rowSecondary}>All three rings closed — Mon, Jul 6</span>
              </div>
              <span style={styles.rowValue}>{PERFECT_DAYS}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.row60}>
              <span
                style={{
                  ...styles.iconSeat,
                  background: 'var(--color-background-muted)',
                  color: 'var(--color-text-secondary)',
                }}>
                <Icon icon={MoonIcon} size="sm" color="inherit" />
              </span>
              <div style={styles.rowText}>
                <span style={styles.rowPrimary}>Rest days</span>
                <span style={styles.rowSecondary}>Wed, Jul 8 — recovery</span>
              </div>
              <span style={styles.rowValue}>{REST_DAYS}</span>
            </div>
          </div>

          {/* MILESTONES — tick up on first view (IntersectionObserver, once) */}
          <h3 style={styles.sectionHeader}>Milestones · today</h3>
          <div ref={metricsRef} style={styles.metricGrid}>
            <div style={styles.metricCard}>
              <span
                style={{
                  ...styles.iconSeat,
                  background: 'var(--color-accent-muted)',
                  color: 'var(--color-icon-accent)',
                }}>
                <Icon icon={FootprintsIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.metricNumber}>
                {metricsVisibleValue(stepsValue).toLocaleString('en-US')}
              </span>
              <span style={styles.metricLabel}>Steps</span>
            </div>
            <div style={styles.metricCard}>
              <span
                style={{
                  ...styles.iconSeat,
                  background: 'var(--color-success-muted)',
                  color: RING_EXERCISE,
                }}>
                <Icon icon={RouteIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.metricNumber}>
                {(metricsVisibleValue(distanceTenths) / 10).toFixed(1)} mi
              </span>
              <span style={styles.metricLabel}>Distance</span>
            </div>
            <div style={styles.metricCard}>
              <span style={{...styles.iconSeat, background: MOVE_TINT_14, color: MOVE_ACCENT}}>
                <Icon icon={Building2Icon} size="sm" color="inherit" />
              </span>
              <span style={styles.metricNumber}>
                {metricsVisibleValue(flightsValue)}
              </span>
              <span style={styles.metricLabel}>Flights</span>
            </div>
          </div>

          <p style={styles.footerCaption}>
            Week of Jul 5 – 11 · Goals {MOVE_GOAL_CAL} CAL · {EXERCISE_GOAL_MIN} MIN ·{' '}
            {STAND_GOAL_HR} HRS
          </p>
          <div style={styles.spacer24} />
        </main>

        {/* TOAST DOCK — the single polite live region. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite">
            {toast != null && (
              <div
                key={toast.seq}
                className={reducedMotion ? undefined : 'arc-toast-in'}
                style={styles.toast}>
                <span style={styles.goalChipIcon} aria-hidden="true">
                  <Icon icon={CheckIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  type="button"
                  className="arc-btn arc-focusable"
                  style={styles.toastDismiss}
                  onClick={() => setToast(null)}
                  aria-label="Dismiss notification">
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
