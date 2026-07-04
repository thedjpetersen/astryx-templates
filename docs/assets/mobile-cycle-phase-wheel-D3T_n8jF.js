var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic, date-free fixtures only — the Lunara cycle tracker
 *   mid-cycle on day 16 of a 28-day cycle: four phase definitions
 *   (menstrual 1–5, follicular 6–13, ovulatory 14–16, luteal 17–28;
 *   5+8+3+12 = 28 = CYCLE_LENGTH), a days-9–22 fertile window with a
 *   solid 12–16 core and ±2d hatched confidence caps, six tri-level
 *   symptoms, an 11-day log record (16 entries, 5 strong), and a
 *   three-cycle length history averaging exactly 28d. No Date objects,
 *   no month names, no clocks, no randomness, no network media.
 * @output Lunara Cycle Wheel — MOBILE template (390px stage). A 320px
 *   28-day circular wheel with per-day tick buttons over four phase-band
 *   arcs (predicted days 17–28 at 45% opacity plus 45° hatch), a 176px
 *   hub readout, prev/next day stepper, phase legend, phase insight card
 *   with 2-line clamp and predicted banner, a 14-segment graded-confidence
 *   fertile-window band with a you-are-here needle, a 3×2 tri-level
 *   symptom chip grid whose edits echo log dots back onto the wheel, a
 *   recent-days list, an Insights view (stat tiles, symptom frequency,
 *   cycle lengths), a 64px tab bar (Today · Log-as-sheet-trigger ·
 *   Insights), and a medium/large two-detent log sheet writing through
 *   the same state as the chips.
 * @position Page template; emitted by \`astryx template mobile-cycle-phase-wheel\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative',
 *   display:'flex', flexDirection:'column', width:'100%',
 *   minHeight:'100dvh', background:'var(--color-background-body)',
 *   overflowX:'clip'}. No simulated OS chrome: no status bar, notch, or
 *   home indicator — the 52px navBar is the first pixel at y=0. The stage
 *   clips to --radius-container 16px; the template never draws its own
 *   outer radius. While the log sheet is open, shell (and the inner
 *   column) switch to {height:'100dvh', overflow:'hidden'} and restore on
 *   close. position:fixed is banned; scrim (40) and sheet (41) are
 *   absolute inside the column; the toast live region (45) is absolute
 *   inside the sticky tab-bar dock at bottom:76 so it stays
 *   viewport-visible above the tabBar on pages taller than the screen
 *   (micro-deviation from the shell-absolute wording, same 76px seat);
 *   navBar and the tab-bar dock are sticky zIndex 20.
 * Container policy: inset-grouped list language — \`listCard\` cards inset
 *   by the 16px gutter, \`rowDivider\` 1px hairlines inset 16, none on the
 *   last row. navBar hairline is ALWAYS ON (no scroll wiring — the
 *   compact title is always visible and there is no large-title row;
 *   both choices noted per the kit contract).
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#C24B7A, #E58BAD). Contrast math: white
 *   13–16px/600 text on #C24B7A ≈ 5.0:1 (passes 4.5:1); #3A1220 text on
 *   #E58BAD ≈ 8.9:1 (passes) — see BRAND_ON. The four phase colors are
 *   NOT new literals but a color-mix ramp of the single accent
 *   (menstrual 100%, ovulatory 78%, follicular 45%, luteal 22% over the
 *   card bg); 11px overlines never sit on ramp fills — they sit on a
 *   15%-mix tinted pill and their text mixes the ramp 45% into
 *   --color-text-primary so every phase passes 4.5:1 in both schemes.
 * Density grid (mobile, verbatim): 16px screen gutter on every content
 *   block (zero on full-bleed hairlines); 12px between stacked cards;
 *   24px between sections; 8px between chips. Rows: 44px single-line
 *   (Insights frequency + cycle lengths), 60px two-line (Recent days),
 *   52px sheet symptom rows; row padding 16 inline; rows are full-width
 *   <button>s. sectionHeader 13px/600 uppercase, letterSpacing .06em,
 *   32px from the stage edge, 20px top / 8px bottom. Type scale: 28/700
 *   hub numeral, 22/700 stat tiles, 17/600 nav + card + sheet titles,
 *   16/400 row primaries, 13/400 secondary (13/500 chips), 11/500 tab
 *   labels/overlines/wheel numerals — nothing below 11px; tabular-nums
 *   on every updating numeral. Buttons: 48px primary (Save log), 36px
 *   segmented track, 44×44 icon buttons. Chrome: navBar 52px / tabBar
 *   64px exactly.
 * A11y deviation (documented, per spec geometry note): the 28 wheel day
 *   ticks are 26×64px rotated hit rects — 26px tangential is the
 *   physical maximum at this diameter (2π·118/28 = 26.5px pitch; a true
 *   44px pitch needs a 392px wheel). Mitigation is triple: the ticks are
 *   the ONLY sub-44 dimension in the template, the 44×44 chevron stepper
 *   reaches every day one tap at a time, and the radiogroup arrow keys
 *   (Home=1, End=28) give exact selection.
 * Decision note: the Log action tab always opens the sheet for
 *   selectedDay; on predicted days (17–28) the sheet's rows and Save
 *   render disabled with the same 'Prediction only' caption as the chip
 *   grid, so the no-logging-into-predictions law holds on every path.
 * Responsive contract: authored at 390, fluid 320–430 — no width:390
 *   literals. wheelBox = min(320, measured hero width) via a
 *   useElementWidth ResizeObserver; all wheel radii scale by size/320
 *   (288px wheel at the 320 stage; tick hit rects stay 26×64). Chip grid
 *   stays 3-up; confidence segments are contentWidth/14 via flex; the
 *   legend wraps below 350px. DESKTOP STAGE (~1045px): centered phone
 *   column, not adaptive relayout — when the measured shell width
 *   exceeds 560px the inner column clamps to maxWidth 430 with
 *   marginInline auto and hairline borderInline; navBar/tabBar stick
 *   within the column and all overlays stay column-anchored. (The width
 *   is measured on \`shell\`, which never changes width itself — measuring
 *   the clamped column would feed back.)
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject} from 'react';

import {
  BarChart3Icon,
  CalendarClockIcon,
  CalendarSyncIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDotIcon,
  PlusCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// BRAND_ACCENT is the ONE quarantined brand literal (Lunara rose).
// Contrast math: #FFFFFF on #C24B7A ≈ 5.0:1 (≥4.5:1 ✓); #3A1220 on
// #E58BAD ≈ 8.9:1 (✓). BRAND_ON is the brand-FILL text pair — brand fill
// and brand text are different values per house rule.
// ---------------------------------------------------------------------------

const BRAND_ACCENT = 'light-dark(#C24B7A, #E58BAD)';
const BRAND_ON = 'light-dark(#FFFFFF, #3A1220)';
// Kit-contract scrim pair (mobile foundations).
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// Phase ramp — NOT new literals: a color-mix ramp of the single accent
// over the card surface (menstrual 100%, ovulatory 78%, follicular 45%,
// luteal 22%).
const RAMP_MENSTRUAL = BRAND_ACCENT;
const RAMP_OVULATORY = \`color-mix(in srgb, \${BRAND_ACCENT} 78%, var(--color-background-card))\`;
const RAMP_FOLLICULAR = \`color-mix(in srgb, \${BRAND_ACCENT} 45%, var(--color-background-card))\`;
const RAMP_LUTEAL = \`color-mix(in srgb, \${BRAND_ACCENT} 22%, var(--color-background-card))\`;

// Derived washes/lines (mixes of the quarantined literal, not new hexes).
const HATCH_LINE = \`color-mix(in srgb, \${BRAND_ACCENT} 40%, transparent)\`;
const CAP_FILL = \`color-mix(in srgb, \${BRAND_ACCENT} 40%, var(--color-background-muted))\`;
const CHIP_FILL = \`color-mix(in srgb, \${BRAND_ACCENT} 22%, var(--color-background-card))\`;
const OVERLINE_BG = \`color-mix(in srgb, \${BRAND_ACCENT} 15%, var(--color-background-card))\`;
const TICK_LINE = 'color-mix(in srgb, var(--color-background-card) 70%, transparent)';

// Overline TEXT color per phase: ramp mixed 45% into the text token so
// even the pale luteal ramp stays a readable text color in both schemes
// (the pill background carries the phase tint; the text keeps ≥4.5:1).
const overlineText = (ramp: string): string =>
  \`color-mix(in srgb, \${ramp} 45%, var(--color-text-primary))\`;

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, hover tint behind the canHover
// guard, sheet/scrim entrances collapsing under prefers-reduced-motion.
// The JS reduced-motion guard (useMediaQuery) handles inline transitions.
// ---------------------------------------------------------------------------

const MCPW_CSS = \`
.mcpw-btn {
  border: none;
  background: none;
  margin: 0;
  padding: 0;
  font-family: inherit;
  color: inherit;
  text-align: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.mcpw-btn:disabled { cursor: default; }
.mcpw-btn:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
@media (hover: hover) {
  .mcpw-hoverable:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  }
}
@keyframes mcpw-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes mcpw-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.mcpw-sheet { animation: mcpw-slide-up 240ms ease-out; }
.mcpw-scrim { animation: mcpw-fade-in 240ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .mcpw-sheet { animation: mcpw-fade-in 120ms ease-out; }
  .mcpw-scrim { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// FIXTURES — deterministic, date-free, dual fields, identity consts.
// ---------------------------------------------------------------------------

const CYCLE_LENGTH = 28;
const TODAY_DAY = 16;

type PhaseId = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

interface Phase {
  id: PhaseId;
  label: string;
  startDay: number;
  endDay: number;
  days: number;
  ramp: string;
  copy: string;
}

// Cross-check: 5 + 8 + 3 + 12 = 28 = CYCLE_LENGTH.
// Luteal copy is authored long on purpose — it proves the insight card's
// 2-line clamp; ovulatory copy is authored short to prove the card holds
// its ~116px anatomy without collapsing.
const PHASES: Phase[] = [
  {
    id: 'menstrual',
    label: 'Menstrual',
    startDay: 1,
    endDay: 5,
    days: 5,
    ramp: RAMP_MENSTRUAL,
    copy: 'Energy usually sits lowest of the cycle; iron-forward meals and lighter training tend to feel better through day 5.',
  },
  {
    id: 'follicular',
    label: 'Follicular',
    startDay: 6,
    endDay: 13,
    days: 8,
    ramp: RAMP_FOLLICULAR,
    copy: 'Rising estrogen lifts energy and focus — this stretch usually suits harder training blocks and new starts.',
  },
  {
    id: 'ovulatory',
    label: 'Ovulatory',
    startDay: 14,
    endDay: 16,
    days: 3,
    ramp: RAMP_OVULATORY,
    copy: 'Peak-fertility days with the highest energy of the cycle.',
  },
  {
    id: 'luteal',
    label: 'Luteal',
    startDay: 17,
    endDay: 28,
    days: 12,
    ramp: RAMP_LUTEAL,
    copy: 'Progesterone climbs and then falls across this twelve-day stretch, so sleep quality, temperature, and mood often drift late in the phase; steadier meals, earlier wind-downs, and gentler training loads usually make the final week feel less jagged.',
  },
];

// Fertile window: days 9–22 → 22 − 9 + 1 = 14 segments. Solid core
// 12–16 (5 cells); ±2d hatched caps 10–11 and 17–18 (4 cells); muted
// flanks 9 and 19–22 (5 cells). Check: 5 + 4 + 5 = 14.
const WINDOW = {
  firstDay: 9,
  lastDay: 22,
  segments: 14,
  coreStart: 12,
  coreEnd: 16,
  capDays: 2,
  capLabel: '±2d',
};

type SymptomId = 'cramps' | 'headache' | 'energy' | 'bloating' | 'mood' | 'sleep';

interface Symptom {
  id: SymptomId;
  label: string;
}

// 'Mood swings' / 'Poor sleep' / 'Low energy' are the two-word labels
// that stress the 114px→90px chip ellipsis at the 320px stage.
const SYMPTOMS: Symptom[] = [
  {id: 'cramps', label: 'Cramps'},
  {id: 'headache', label: 'Headache'},
  {id: 'energy', label: 'Low energy'},
  {id: 'bloating', label: 'Bloating'},
  {id: 'mood', label: 'Mood swings'},
  {id: 'sleep', label: 'Poor sleep'},
];

type Level = 0 | 1 | 2;
type LoggedLevel = 1 | 2;
type DayLog = Partial<Record<SymptomId, LoggedLevel>>;

const LEVEL_LABEL: Record<Level, string> = {0: 'none', 1: 'mild', 2: 'strong'};

// LOGS keyed 'd1'..'d16' (days 5, 7, 9, 11, 13 empty; 17–28 absent =
// predicted). ARITHMETIC CROSS-CHECKS, all re-derivable from this record:
//   logged days {1,2,3,4,6,8,10,12,14,15,16} = 11 → stat tile '11 / 16';
//   entries 2+2+2+1+1+1+1+1+2+1+2 = 16 → stat tile '16';
//   per-symptom day counts: Cramps 5 (strong 2), Headache 3 (strong 1),
//   Bloating 3 (strong 1), Mood swings 2 (strong 1), Poor sleep 2,
//   Low energy 1 — 5+3+3+2+2+1 = 16 = total entries;
//   strong 2+1+1+1+0+0 = 5 → stat tile '5'; mild 11; 5+11 = 16.
// Day 5 (menstrual, unlogged) is the empty-chip-state stress fixture.
const LOGS: Record<string, DayLog> = {
  d1: {cramps: 2, bloating: 1},
  d2: {cramps: 2, headache: 1},
  d3: {cramps: 1, sleep: 1},
  d4: {cramps: 1},
  d6: {energy: 1},
  d8: {headache: 1},
  d10: {mood: 1},
  d12: {bloating: 1},
  d14: {cramps: 1, mood: 2},
  d15: {bloating: 2},
  d16: {headache: 2, sleep: 1},
};

interface CycleRecord {
  label: string;
  days: number;
  display: string;
}

// Average (29 + 27 + 28) / 3 = 84 / 3 = 28 → 'Average - 28d'.
const CYCLE_HISTORY: CycleRecord[] = [
  {label: 'Last cycle', days: 29, display: '29d'},
  {label: '2 cycles ago', days: 27, display: '27d'},
  {label: '3 cycles ago', days: 28, display: '28d'},
];
const CYCLE_AVERAGE_DISPLAY = '28d';
// Days left in the current cycle = 28 − 16 = 12 (days 17–28).
const DAYS_LEFT = CYCLE_LENGTH - TODAY_DAY;

// ---------------------------------------------------------------------------
// DERIVED HELPERS — every aggregate recomputes from \`logs\` each render so
// chip/sheet edits ripple to the wheel dots, hub caption, stat tiles,
// frequency rows, and recent-days summaries.
// ---------------------------------------------------------------------------

const dayKey = (day: number): string => \`d\${day}\`;

const phaseOf = (day: number): Phase =>
  PHASES.find(p => day >= p.startDay && day <= p.endDay) ?? PHASES[0];

const dayLogOf = (logs: Record<string, DayLog>, day: number): DayLog =>
  logs[dayKey(day)] ?? {};

const entryCountOf = (logs: Record<string, DayLog>, day: number): number =>
  Object.keys(dayLogOf(logs, day)).length;

/** 'Headache strong - Poor sleep mild' — SYMPTOMS order, live from logs. */
const summaryOf = (logs: Record<string, DayLog>, day: number): string => {
  const log = dayLogOf(logs, day);
  return SYMPTOMS.filter(s => log[s.id] != null)
    .map(s => \`\${s.label} \${LEVEL_LABEL[log[s.id] ?? 1]}\`)
    .join(' - ');
};

// ---------------------------------------------------------------------------
// WHEEL GEOMETRY — 320 base, all radii scale by s = size/320. Day d center
// angle = -90 + (d - 0.5)·(360/28)°; arcs span exact day boundaries
// (menstrual -90° → -25.71°, etc.). Tangential tick pitch 2π·118/28 = 26.5px.
// ---------------------------------------------------------------------------

const WHEEL_BASE = 320;
const WHEEL_CENTER = 160;
const BAND_R = 118;
const BAND_STROKE = 28;
const DOT_R = 142;
const NUMERAL_R = 150;
const HUB_SIZE = 176;
const DAY_DEG = 360 / CYCLE_LENGTH;

const dayAngle = (day: number): number => -90 + (day - 0.5) * DAY_DEG;

const polar = (deg: number, r: number, c: number): {x: number; y: number} => {
  const rad = (deg * Math.PI) / 180;
  return {x: c + r * Math.cos(rad), y: c + r * Math.sin(rad)};
};

const arcPath = (startDeg: number, endDeg: number, r: number): string => {
  const a = polar(startDeg, r, WHEEL_CENTER);
  const b = polar(endDeg, r, WHEEL_CENTER);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return \`M \${a.x.toFixed(2)} \${a.y.toFixed(2)} A \${r} \${r} 0 \${large} 1 \${b.x.toFixed(2)} \${b.y.toFixed(2)}\`;
};

// ---------------------------------------------------------------------------
// STYLES — binding kit vocabulary: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, sheetGrabber, listCard, row, rowDivider, sectionHeader.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // MOBILE SHELL CONTRACT root — never draws its own corner radius.
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop-width demo (~1045px): centered 430px phone column. Overlays
  // anchor here (position relative), so sheet/scrim/toast stay in-column.
  column: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100dvh',
    flex: 1,
  },
  columnWide: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    height: 52,
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    // Always-on hairline (choice noted in the header comment).
    borderBottom: '1px solid var(--color-border)',
  },
  navSlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  navSlotTrailing: {justifySelf: 'end'},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '22px',
    textAlign: 'center',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  // Content blocks: 16px screen gutter; 24px between sections.
  block: {paddingInline: 16},
  heroBlock: {paddingInline: 16, paddingTop: 20},
  wheelBox: {position: 'relative', marginInline: 'auto'},
  wheelSvg: {position: 'absolute', inset: 0},
  dayTick: {position: 'absolute', width: 26, height: 64},
  tickLine: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: 16,
    borderRadius: 1,
    background: TICK_LINE,
    pointerEvents: 'none',
  },
  todayRing: {
    position: 'absolute',
    left: 2,
    top: 21,
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: \`2px solid \${BRAND_ACCENT}\`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  selectedDisc: {
    position: 'absolute',
    left: 4,
    top: 23,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  logDot: {
    position: 'absolute',
    left: 11,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  wheelNumeral: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
  },
  hub: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    pointerEvents: 'none',
  },
  hubOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '2px 8px',
    borderRadius: 8,
    background: OVERLINE_BG,
  },
  hubDay: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: '32px',
    fontVariantNumeric: 'tabular-nums',
  },
  hubOf: {fontSize: 13, fontWeight: 400, color: 'var(--color-text-secondary)'},
  hubLogged: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    marginTop: 12,
  },
  stepperLabel: {
    minWidth: 140,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  phaseLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 4,
    minHeight: 28,
    marginTop: 12,
    paddingInline: 16,
  },
  legendItem: {display: 'flex', alignItems: 'center', gap: 6},
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    border: '1px solid var(--color-border)',
  },
  legendLabel: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // Inset-grouped card language.
  listCard: {
    background: 'var(--color-background-card)',
    borderRadius: 'var(--radius-element)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  paddedCard: {
    background: 'var(--color-background-card)',
    borderRadius: 'var(--radius-element)',
    border: '1px solid var(--color-border)',
    padding: 16,
  },
  rowDivider: {height: 1, marginLeft: 16, background: 'var(--color-border)'},
  sectionHeader: {
    margin: '20px 16px 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  overline: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '2px 8px',
    borderRadius: 8,
    background: OVERLINE_BG,
  },
  insightTitle: {fontSize: 17, fontWeight: 600, lineHeight: '22px', marginTop: 8},
  insightCopy: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    marginTop: 4,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  predictedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    fontSize: 13,
    fontWeight: 500,
    color: overlineText(RAMP_MENSTRUAL),
  },
  bandHeader: {display: 'flex', alignItems: 'center', justifyContent: 'space-between'},
  bandTitle: {fontSize: 13, fontWeight: 600},
  bandPill: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontVariantNumeric: 'tabular-nums',
  },
  bandStripWrap: {position: 'relative', marginTop: 18},
  bandStrip: {
    display: 'flex',
    height: 18,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bandSegment: {flex: 1},
  bandNeedle: {
    position: 'absolute',
    top: -8,
    width: 2,
    height: 26,
    borderRadius: 1,
    background: BRAND_ACCENT,
    transform: 'translateX(-50%)',
  },
  bandTriangle: {
    position: 'absolute',
    top: -15,
    width: 0,
    height: 0,
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: \`6px solid \${BRAND_ACCENT}\`,
    transform: 'translateX(-50%)',
  },
  bandAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bandCaption: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  chipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  chip: {
    position: 'relative',
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingInline: 10,
    minWidth: 0,
  },
  chipStrong: {borderColor: BRAND_ACCENT},
  chipFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: '8px 0 0 8px',
    background: CHIP_FILL,
    pointerEvents: 'none',
  },
  chipLabel: {
    position: 'relative',
    fontSize: 13,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  chipDots: {position: 'relative', display: 'flex', gap: 3, flexShrink: 0},
  chipDot: {width: 4, height: 4, borderRadius: '50%', background: BRAND_ACCENT},
  chipCaption: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  // Recent-days 60px two-line rows (full-width <button>s).
  row: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    height: 60,
    paddingInline: 16,
  },
  rowSelectedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: BRAND_ACCENT,
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  rowSecondary: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowTrailing: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // Insights.
  statRow: {display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12},
  statTile: {
    height: 72,
    padding: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    boxSizing: 'border-box',
  },
  statNumeral: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: '24px',
    fontVariantNumeric: 'tabular-nums',
  },
  statCaption: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  utilityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    paddingInline: 16,
  },
  utilityLabel: {fontSize: 16, fontWeight: 400},
  utilityValue: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  freqRow: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    paddingInline: 16,
    paddingBlock: 6,
  },
  freqTop: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  freqTrack: {
    width: '50%',
    maxWidth: 160,
    height: 4,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  freqFill: {height: '100%', borderRadius: 8, background: BRAND_ACCENT},
  // Sticky dock: tab bar + the toast that rides 12px above it, so the
  // live region stays viewport-visible even when the Today page is
  // taller than the screen (position:fixed stays banned).
  dockWrap: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    marginTop: 24,
  },
  // Tab bar — exactly 64px.
  tabBar: {
    display: 'flex',
    height: 64,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  // Active tab carries the quarantined Lunara rose, not var(--color-brand)
  // (that token is the demo-logo blue and would break the single-accent law).
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // Log sheet — medium/large two-detent bottom sheet.
  sheetScrim: {
    position: 'absolute',
    inset: 0,
    background: SCRIM,
    zIndex: 40,
    border: 'none',
    padding: 0,
    cursor: 'default',
  },
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
  sheetGrabberZone: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 24,
    paddingTop: 8,
    width: '100%',
    flexShrink: 0,
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 999,
    background: 'var(--color-border)',
  },
  sheetHeader: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    flexShrink: 0,
  },
  sheetTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  sheetClose: {position: 'absolute', right: 8, top: 4},
  sheetContent: {flex: 1, minHeight: 0, overflowY: 'auto', paddingInline: 16},
  sheetRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    height: 52,
  },
  sheetRowLabel: {fontSize: 16, fontWeight: 400},
  segTrack: {
    display: 'flex',
    alignItems: 'center',
    height: 36,
    padding: 3,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  segItem: {
    height: 30,
    paddingInline: 10,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
  segItemActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {opacity: 0.45},
  // Toast / single polite live region — 76px from the dock bottom =
  // 12px above the 64px tabBar.
  toastRegion: {
    position: 'absolute',
    bottom: 76,
    insetInline: 16,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'auto',
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// useElementWidth — container-width ResizeObserver (grid-feeder-console
// pattern): the demo stage is ~1045px inside a 1440px window, so viewport
// queries never fire there. Width 0 = first pre-observer frame.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useLunara: {view, selectedDay, logs, sheetOpen,
// sheetDetent, toast} with update(id, patch) as the only mutation door.
// update('ui', {...}) merges UI fields; update('day-16', {sleep: 0})
// merges a symptom-level patch into logs.d16 (level 0 deletes the key; a
// day whose record empties loses its wheel dot).
// ---------------------------------------------------------------------------

interface LunaraState {
  view: 'today' | 'insights';
  selectedDay: number;
  logs: Record<string, DayLog>;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  toast: string | null;
}

type UiPatch = Partial<Omit<LunaraState, 'logs'>>;
type SymptomPatch = Partial<Record<SymptomId, Level>>;

function useLunara(): {
  state: LunaraState;
  update: (id: string, patch: UiPatch | SymptomPatch) => void;
} {
  const [state, setState] = useState<LunaraState>(() => ({
    view: 'today',
    selectedDay: TODAY_DAY,
    logs: {...LOGS},
    sheetOpen: false,
    sheetDetent: 'medium',
    toast: null,
  }));

  const update = useCallback((id: string, patch: UiPatch | SymptomPatch) => {
    setState(prev => {
      if (id === 'ui') {
        return {...prev, ...(patch as UiPatch)};
      }
      if (id.startsWith('day-')) {
        const key = dayKey(Number(id.slice(4)));
        const nextDay: DayLog = {...prev.logs[key]};
        for (const [symptom, level] of Object.entries(patch) as Array<[SymptomId, Level]>) {
          if (level === 0) {
            delete nextDay[symptom];
          } else {
            nextDay[symptom] = level;
          }
        }
        const logs = {...prev.logs};
        if (Object.keys(nextDay).length === 0) {
          delete logs[key];
        } else {
          logs[key] = nextDay;
        }
        return {...prev, logs};
      }
      return prev;
    });
  }, []);

  return {state, update};
}

// ---------------------------------------------------------------------------
// OrreryMark — 28px inline-SVG brand mark: r=12 circle (stroke 1.5), one
// 3px orbiting dot at 40°, quarter-arc of 5 graduated ticks 0°→90°.
// ---------------------------------------------------------------------------

function OrreryMark() {
  const dot = polar(40, 12, 14);
  const ticks = [0, 22.5, 45, 67.5, 90].map((deg, i) => {
    const outer = polar(deg, 12, 14);
    const inner = polar(deg, 12 - (2 + i * 0.5), 14);
    return {x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y, key: deg};
  });
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden style={{display: 'block'}}>
      <circle
        cx={14}
        cy={14}
        r={12}
        fill="none"
        strokeWidth={1.5}
        style={{stroke: BRAND_ACCENT}}
      />
      {ticks.map(t => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          strokeWidth={1}
          style={{stroke: BRAND_ACCENT}}
        />
      ))}
      <circle cx={dot.x} cy={dot.y} r={1.5} style={{fill: BRAND_ACCENT}} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CycleWheel — SVG phase-band underlay + 28 rotated day-tick <button>s
// (role=radio in a 'Cycle day' radiogroup, roving tabindex, Left/Down -1,
// Right/Up +1, Home=1, End=28), today ring, selected disc, r=142 log
// dots, r=150 anchor numerals, 176px hub readout. All radii scale by
// s = size/320; tick hit rects stay 26×64 (documented a11y deviation).
// ---------------------------------------------------------------------------

interface CycleWheelProps {
  size: number;
  selectedDay: number;
  logs: Record<string, DayLog>;
  onSelect: (day: number) => void;
}

function CycleWheel({size, selectedDay, logs, onSelect}: CycleWheelProps) {
  const s = size / WHEEL_BASE;
  const c = size / 2;
  const tickRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedEntries = entryCountOf(logs, selectedDay);
  const phase = phaseOf(selectedDay);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = Math.max(1, selectedDay - 1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      next = Math.min(CYCLE_LENGTH, selectedDay + 1);
    } else if (event.key === 'Home') {
      next = 1;
    } else if (event.key === 'End') {
      next = CYCLE_LENGTH;
    }
    if (next != null) {
      event.preventDefault();
      onSelect(next);
      tickRefs.current[next - 1]?.focus();
    }
  };

  const days: number[] = [];
  for (let d = 1; d <= CYCLE_LENGTH; d++) {
    days.push(d);
  }

  return (
    <div
      role="radiogroup"
      aria-label={\`Cycle day, day \${selectedDay} of \${CYCLE_LENGTH} selected\`}
      onKeyDown={onKeyDown}
      style={{...styles.wheelBox, width: size, height: size}}>
      <svg
        width={size}
        height={size}
        viewBox={\`0 0 \${WHEEL_BASE} \${WHEEL_BASE}\`}
        style={styles.wheelSvg}
        aria-hidden>
        <defs>
          <pattern
            id="mcpw-hatch"
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} strokeWidth={1.5} style={{stroke: HATCH_LINE}} />
          </pattern>
        </defs>
        {PHASES.map(p => {
          const start = -90 + (p.startDay - 1) * DAY_DEG;
          const end = -90 + p.endDay * DAY_DEG;
          const d = arcPath(start, end, BAND_R);
          // Predicted days (17–28) = luteal exactly, since TODAY_DAY (16)
          // ends the ovulatory phase: 45% band + hatch overlay.
          const isPredicted = p.startDay > TODAY_DAY;
          return (
            <g key={p.id}>
              <path
                d={d}
                fill="none"
                strokeWidth={BAND_STROKE}
                opacity={isPredicted ? 0.45 : 1}
                style={{stroke: p.ramp}}
              />
              {isPredicted ? (
                <path d={d} fill="none" strokeWidth={BAND_STROKE} stroke="url(#mcpw-hatch)" />
              ) : null}
            </g>
          );
        })}
      </svg>
      {days.map(d => {
        const angle = dayAngle(d);
        const pos = polar(angle, BAND_R * s, c);
        const hasLog = entryCountOf(logs, d) > 0;
        const isToday = d === TODAY_DAY;
        const isSelected = d === selectedDay;
        return (
          <button
            key={d}
            ref={el => {
              tickRefs.current[d - 1] = el;
            }}
            type="button"
            className="mcpw-btn"
            role="radio"
            aria-checked={isSelected}
            aria-label={\`Day \${d}\${isToday ? ', today' : ''}\${hasLog ? ', logged' : ''}\`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(d)}
            style={{
              ...styles.dayTick,
              left: pos.x,
              top: pos.y,
              transform: \`translate(-50%, -50%) rotate(\${(angle + 90).toFixed(2)}deg)\`,
            }}>
            <span style={styles.tickLine} aria-hidden />
            {isToday ? <span style={styles.todayRing} aria-hidden /> : null}
            {isSelected ? <span style={styles.selectedDisc} aria-hidden /> : null}
            {hasLog ? (
              <span
                style={{...styles.logDot, top: 32 - (DOT_R - BAND_R) * s - 2}}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
      {[1, 8, 15, 22].map(d => {
        const pos = polar(dayAngle(d), NUMERAL_R * s, c);
        return (
          <span key={d} style={{...styles.wheelNumeral, left: pos.x, top: pos.y}} aria-hidden>
            {d}
          </span>
        );
      })}
      <div style={{...styles.hub, width: HUB_SIZE * s, height: HUB_SIZE * s}}>
        <span style={{...styles.hubOverline, color: overlineText(phase.ramp)}}>
          {phase.label}
        </span>
        <span style={styles.hubDay}>Day {selectedDay}</span>
        <span style={styles.hubOf}>of {CYCLE_LENGTH}</span>
        {selectedEntries > 0 ? (
          <span style={styles.hubLogged}>
            {selectedEntries} logged
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConfidenceBand — 14 contiguous segments covering days 9–22: solid brand
// core 12–16, 45°-hatched 40%-mix caps 10–11 and 17–18, muted flanks 9
// and 19–22, ±2d pill, selectedDay needle (out-of-window caption when the
// selected day sits outside 9–22). Non-interactive display — its
// affordance is the wheel's day ticks.
// ---------------------------------------------------------------------------

function ConfidenceBand({selectedDay}: {selectedDay: number}) {
  const inWindow = selectedDay >= WINDOW.firstDay && selectedDay <= WINDOW.lastDay;
  const segments: number[] = [];
  for (let d = WINDOW.firstDay; d <= WINDOW.lastDay; d++) {
    segments.push(d);
  }
  const capHatch = \`repeating-linear-gradient(45deg, transparent 0 3px, \${HATCH_LINE} 3px 6px)\`;
  const needleLeft = \`\${(((selectedDay - WINDOW.firstDay + 0.5) / WINDOW.segments) * 100).toFixed(3)}%\`;
  return (
    <div style={styles.paddedCard}>
      <div style={styles.bandHeader}>
        <span style={styles.bandTitle}>Fertile window</span>
        <span style={styles.bandPill}>{WINDOW.capLabel}</span>
      </div>
      <div style={styles.bandStripWrap}>
        <div style={styles.bandStrip} aria-hidden>
          {segments.map(d => {
            const isCore = d >= WINDOW.coreStart && d <= WINDOW.coreEnd;
            const isCap =
              (d >= WINDOW.coreStart - WINDOW.capDays && d < WINDOW.coreStart) ||
              (d > WINDOW.coreEnd && d <= WINDOW.coreEnd + WINDOW.capDays);
            const segStyle: CSSProperties = isCore
              ? {background: BRAND_ACCENT}
              : isCap
                ? {background: CAP_FILL, backgroundImage: capHatch}
                : {background: 'var(--color-background-muted)'};
            return <div key={d} style={{...styles.bandSegment, ...segStyle}} />;
          })}
        </div>
        {inWindow ? (
          <>
            <span style={{...styles.bandTriangle, left: needleLeft}} aria-hidden />
            <span style={{...styles.bandNeedle, left: needleLeft}} aria-hidden />
          </>
        ) : null}
      </div>
      <div style={styles.bandAxis} aria-hidden>
        <span>Day {WINDOW.firstDay}</span>
        <span>Day {WINDOW.lastDay}</span>
      </div>
      {!inWindow ? (
        <div style={styles.bandCaption}>Day {selectedDay} is outside this window</div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TriLevelChip — 44px chip <button> cycling none→mild→strong with a
// proportional 0/50/100% interior fill bar and 0/1/2 trailing dot
// cluster; disabled variant for predicted days. Announces only via the
// shared live region on sheet save (chip taps stay silent by design).
// ---------------------------------------------------------------------------

interface TriLevelChipProps {
  symptom: Symptom;
  level: Level;
  isDisabled: boolean;
  isMotionReduced: boolean;
  onCycle: () => void;
}

function TriLevelChip({symptom, level, isDisabled, isMotionReduced, onCycle}: TriLevelChipProps) {
  const fillWidth = level === 0 ? '0%' : level === 1 ? '50%' : '100%';
  return (
    <button
      type="button"
      className="mcpw-btn mcpw-hoverable"
      disabled={isDisabled}
      aria-label={\`\${symptom.label}: \${LEVEL_LABEL[level]}\`}
      onClick={onCycle}
      style={{
        ...styles.chip,
        ...(level === 2 ? styles.chipStrong : null),
        ...(isDisabled ? {opacity: 0.45} : null),
      }}>
      <span
        style={{
          ...styles.chipFill,
          width: fillWidth,
          transition: isMotionReduced ? 'none' : 'width 180ms ease-out',
        }}
        aria-hidden
      />
      <span style={styles.chipLabel}>{symptom.label}</span>
      <span style={styles.chipDots} aria-hidden>
        {level >= 1 ? <span style={styles.chipDot} /> : null}
        {level >= 2 ? <span style={styles.chipDot} /> : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SegmentedLevel — 36px None/Mild/Strong track (radiogroup, arrow keys)
// inside the sheet's 52px symptom rows; writes through the same update
// path as the chips.
// ---------------------------------------------------------------------------

interface SegmentedLevelProps {
  symptom: Symptom;
  level: Level;
  isDisabled: boolean;
  onChange: (level: Level) => void;
}

const SEGMENT_LABELS: Array<{level: Level; label: string}> = [
  {level: 0, label: 'None'},
  {level: 1, label: 'Mild'},
  {level: 2, label: 'Strong'},
];

function SegmentedLevel({symptom, level, isDisabled, onChange}: SegmentedLevelProps) {
  const segRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: Level | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = Math.max(0, level - 1) as Level;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = Math.min(2, level + 1) as Level;
    }
    if (next != null) {
      event.preventDefault();
      onChange(next);
      segRefs.current[next]?.focus();
    }
  };
  return (
    <div
      role="radiogroup"
      aria-label={\`\${symptom.label} level\`}
      onKeyDown={onKeyDown}
      style={styles.segTrack}>
      {SEGMENT_LABELS.map((segment, i) => (
        <button
          key={segment.level}
          ref={el => {
            segRefs.current[i] = el;
          }}
          type="button"
          className="mcpw-btn"
          role="radio"
          aria-checked={level === segment.level}
          tabIndex={level === segment.level ? 0 : -1}
          disabled={isDisabled}
          onClick={() => onChange(segment.level)}
          style={{
            ...styles.segItem,
            ...(level === segment.level ? styles.segItemActive : null),
          }}>
          {segment.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogSheet — medium/large two-detent bottom sheet: button grabber toggles
// detents, six 52px symptom rows with segmented radiogroups bound to the
// same logs state as the chips, sticky Save footer, sentinel focus trap.
// Scrim click, X, and Escape all close; focus restores to the Log tab on
// every close path (handled by the caller's closeSheet).
// ---------------------------------------------------------------------------

interface LogSheetProps {
  selectedDay: number;
  detent: 'medium' | 'large';
  logs: Record<string, DayLog>;
  isPredicted: boolean;
  onToggleDetent: () => void;
  onSetLevel: (symptom: SymptomId, level: Level) => void;
  onSave: () => void;
  onClose: () => void;
}

function LogSheet({
  selectedDay,
  detent,
  logs,
  isPredicted,
  onToggleDetent,
  onSetLevel,
  onSave,
  onClose,
}: LogSheetProps) {
  const grabberRef = useRef<HTMLButtonElement | null>(null);
  const saveRef = useRef<HTMLButtonElement | null>(null);
  const log = dayLogOf(logs, selectedDay);

  useEffect(() => {
    // preventScroll is load-bearing: during the slide-up animation the
    // sheet extends below the locked overflow-hidden column, and a plain
    // focus() makes the browser scroll-reveal it — permanently offsetting
    // the column's scrollTop and beaching the sheet mid-screen.
    grabberRef.current?.focus({preventScroll: true});
  }, []);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <>
      <button
        type="button"
        className="mcpw-btn mcpw-scrim"
        style={styles.sheetScrim}
        aria-label="Close log sheet"
        tabIndex={-1}
        onClick={onClose}
      />
      {/* Focus-trap sentinel: wraps Tab from before the sheet to Save. */}
      <div
        tabIndex={0}
        onFocus={() => saveRef.current?.focus()}
        style={{position: 'absolute', width: 0, height: 0}}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcpw-sheet-title"
        className="mcpw-sheet"
        onKeyDown={onKeyDown}
        style={{
          ...styles.sheet,
          height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        }}>
        <div style={styles.sheetGrabberZone}>
          <button
            ref={grabberRef}
            type="button"
            className="mcpw-btn"
            aria-label="Resize sheet"
            onClick={onToggleDetent}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 24,
              marginTop: -8,
              borderRadius: 8,
            }}>
            <span style={styles.sheetGrabber} aria-hidden />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <h2 id="mcpw-sheet-title" style={styles.sheetTitle}>
            Log - Day {selectedDay}
          </h2>
          <button
            type="button"
            className="mcpw-btn mcpw-hoverable"
            aria-label="Close log sheet"
            onClick={onClose}
            style={{...styles.iconBtn, ...styles.sheetClose}}>
            <Icon icon={XIcon} size="md" color="inherit" />
          </button>
        </div>
        <div style={styles.sheetContent}>
          {isPredicted ? (
            <div style={{...styles.chipCaption, paddingTop: 4}}>
              Prediction only - logging opens when the day arrives
            </div>
          ) : null}
          {SYMPTOMS.map((symptom, i) => (
            <div key={symptom.id}>
              {i > 0 ? <div style={{...styles.rowDivider, marginLeft: 0}} /> : null}
              <div style={styles.sheetRow}>
                <span style={{...styles.sheetRowLabel, ...(isPredicted ? {opacity: 0.45} : null)}}>
                  {symptom.label}
                </span>
                <SegmentedLevel
                  symptom={symptom}
                  level={log[symptom.id] ?? 0}
                  isDisabled={isPredicted}
                  onChange={level => onSetLevel(symptom.id, level)}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={styles.sheetFooter}>
          <button
            ref={saveRef}
            type="button"
            className="mcpw-btn"
            aria-disabled={isPredicted}
            onClick={() => {
              if (!isPredicted) {
                onSave();
              }
            }}
            style={{
              ...styles.saveButton,
              ...(isPredicted ? styles.saveButtonDisabled : null),
            }}>
            Save log
          </button>
        </div>
      </div>
      {/* Focus-trap sentinel: wraps Tab from after the sheet to grabber. */}
      <div
        tabIndex={0}
        onFocus={() => grabberRef.current?.focus()}
        style={{position: 'absolute', width: 0, height: 0}}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileCyclePhaseWheelTemplate() {
  const {state, update} = useLunara();
  const {view, selectedDay, logs, sheetOpen, sheetDetent, toast} = state;

  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Measure shell (never the clamped column — feedback loop). Width 0 =
  // first pre-observer frame: assume the phone stage so the mobile shot
  // never flashes the bordered column.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const shellWidth = useElementWidth(shellRef);
  const isWide = shellWidth > 560;
  // Wheel sizing: min(320, measured hero content width); 0 → 320 fallback.
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroWidth = useElementWidth(heroRef);
  const wheelSize = Math.min(WHEEL_BASE, heroWidth > 0 ? heroWidth : WHEEL_BASE);

  const logTabRef = useRef<HTMLButtonElement | null>(null);
  const todayTabRef = useRef<HTMLButtonElement | null>(null);
  const insightsTabRef = useRef<HTMLButtonElement | null>(null);

  const phase = phaseOf(selectedDay);
  const dayInPhase = selectedDay - phase.startDay + 1;
  const isPredicted = selectedDay > TODAY_DAY;
  const selectedLog = dayLogOf(logs, selectedDay);
  const selectedEntries = Object.keys(selectedLog).length;

  // Derived aggregates — recomputed from logs each render so every chip
  // and sheet edit ripples through tiles, bars, and summaries.
  let totalEntries = 0;
  let strongTotal = 0;
  let daysLogged = 0;
  for (let d = 1; d <= TODAY_DAY; d++) {
    const log = dayLogOf(logs, d);
    const entries = Object.values(log);
    if (entries.length > 0) {
      daysLogged++;
    }
    totalEntries += entries.length;
    strongTotal += entries.filter(level => level === 2).length;
  }
  const frequencies = SYMPTOMS.map(symptom => {
    let days = 0;
    let strong = 0;
    for (let d = 1; d <= TODAY_DAY; d++) {
      const level = dayLogOf(logs, d)[symptom.id];
      if (level != null) {
        days++;
        if (level === 2) {
          strong++;
        }
      }
    }
    return {symptom, days, strong};
  }).sort((a, b) => b.days - a.days); // stable: ties keep SYMPTOMS order
  const maxFrequency = Math.max(1, ...frequencies.map(f => f.days));
  const recentDays: number[] = [];
  for (let d = TODAY_DAY; d >= 1 && recentDays.length < 5; d--) {
    if (entryCountOf(logs, d) > 0) {
      recentDays.push(d);
    }
  }

  const selectDay = (day: number) => update('ui', {selectedDay: day});
  const closeSheet = () => {
    update('ui', {sheetOpen: false});
    logTabRef.current?.focus();
  };
  const saveSheet = () => {
    const count = entryCountOf(logs, selectedDay);
    update('ui', {
      sheetOpen: false,
      toast: \`Day \${selectedDay} log saved - \${count} symptom\${count === 1 ? '' : 's'}\`,
    });
    logTabRef.current?.focus();
  };
  const returnToToday = () => {
    update('ui', {selectedDay: TODAY_DAY, toast: 'Returned to today'});
  };
  const cycleChip = (symptom: SymptomId) => {
    const current: Level = selectedLog[symptom] ?? 0;
    update(\`day-\${selectedDay}\`, {[symptom]: ((current + 1) % 3) as Level});
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = view === 'today' ? 'insights' : 'today';
      update('ui', {view: next});
      (next === 'today' ? todayTabRef : insightsTabRef).current?.focus();
    }
  };

  const lockStyle = sheetOpen ? styles.shellLocked : null;

  return (
    <div ref={shellRef} style={{...styles.shell, ...lockStyle}}>
      <style>{MCPW_CSS}</style>
      <div
        style={{
          ...styles.column,
          ...(isWide ? styles.columnWide : null),
          ...(sheetOpen ? {height: '100dvh', overflow: 'hidden', minHeight: 0} : null),
        }}>
        <header style={styles.navBar}>
          <div style={styles.navSlot} aria-hidden>
            <OrreryMark />
          </div>
          <h1 style={styles.navTitle}>This cycle</h1>
          <button
            type="button"
            className="mcpw-btn mcpw-hoverable"
            aria-label="Return to today"
            disabled={selectedDay === TODAY_DAY}
            onClick={returnToToday}
            style={{
              ...styles.iconBtn,
              ...styles.navSlotTrailing,
              ...(selectedDay === TODAY_DAY ? {opacity: 0.4} : null),
            }}>
            <Icon icon={CalendarSyncIcon} size="md" color="inherit" />
          </button>
        </header>

        {view === 'today' ? (
          <main>
            {/* 1) WHEEL HERO */}
            <div ref={heroRef} style={styles.heroBlock}>
              <CycleWheel
                size={wheelSize}
                selectedDay={selectedDay}
                logs={logs}
                onSelect={selectDay}
              />
            </div>
            {/* 2) DAY STEPPER — 44×44 chevrons reach every day (gesture-free
                parity for the sub-44 wheel ticks). */}
            <div style={styles.stepperRow}>
              <button
                type="button"
                className="mcpw-btn mcpw-hoverable"
                aria-label="Previous day"
                disabled={selectedDay === 1}
                onClick={() => selectDay(selectedDay - 1)}
                style={{...styles.iconBtn, ...(selectedDay === 1 ? {opacity: 0.4} : null)}}>
                <Icon icon={ChevronLeftIcon} size="lg" color="inherit" />
              </button>
              <span style={styles.stepperLabel}>
                Day {selectedDay} - {phase.label}
              </span>
              <button
                type="button"
                className="mcpw-btn mcpw-hoverable"
                aria-label="Next day"
                disabled={selectedDay === CYCLE_LENGTH}
                onClick={() => selectDay(selectedDay + 1)}
                style={{
                  ...styles.iconBtn,
                  ...(selectedDay === CYCLE_LENGTH ? {opacity: 0.4} : null),
                }}>
                <Icon icon={ChevronRightIcon} size="lg" color="inherit" />
              </button>
            </div>
            {/* 3) PHASE LEGEND */}
            <div style={styles.phaseLegend}>
              {PHASES.map(p => (
                <span key={p.id} style={styles.legendItem}>
                  <span style={{...styles.legendSwatch, background: p.ramp}} aria-hidden />
                  <span style={styles.legendLabel}>{p.label}</span>
                </span>
              ))}
            </div>
            {/* 4) PHASE INSIGHT CARD */}
            <div style={{...styles.block, marginTop: 24}}>
              <div style={styles.paddedCard}>
                <span style={{...styles.overline, color: overlineText(phase.ramp)}}>
                  {phase.label}
                </span>
                <div style={styles.insightTitle}>
                  Day {selectedDay} - {phase.label} - day {dayInPhase} of {phase.days} in phase
                </div>
                <div style={styles.insightCopy}>{phase.copy}</div>
                {isPredicted ? (
                  <div style={styles.predictedBanner}>
                    <Icon icon={CalendarClockIcon} size="sm" color="inherit" />
                    Predicted - hatched on the wheel
                  </div>
                ) : null}
              </div>
            </div>
            {/* 5) CONFIDENCE BAND CARD — 12px below the insight card */}
            <div style={{...styles.block, marginTop: 12}}>
              <ConfidenceBand selectedDay={selectedDay} />
            </div>
            {/* 6–7) SYMPTOMS */}
            <h2 style={styles.sectionHeader}>Symptoms - Day {selectedDay}</h2>
            <div style={styles.block}>
              {isPredicted ? (
                <div style={styles.chipCaption}>
                  Prediction only - logging opens when the day arrives
                </div>
              ) : selectedEntries === 0 ? (
                <div style={styles.chipCaption}>
                  No symptoms logged for day {selectedDay}
                </div>
              ) : null}
              <div style={styles.chipGrid}>
                {SYMPTOMS.map(symptom => (
                  <TriLevelChip
                    key={symptom.id}
                    symptom={symptom}
                    level={selectedLog[symptom.id] ?? 0}
                    isDisabled={isPredicted}
                    isMotionReduced={isMotionReduced}
                    onCycle={() => cycleChip(symptom.id)}
                  />
                ))}
              </div>
            </div>
            {/* 8) RECENT DAYS — history rows re-select the wheel from below */}
            <h2 style={styles.sectionHeader}>Recent days</h2>
            <div style={styles.block}>
              <div style={styles.listCard}>
                {recentDays.map((day, i) => {
                  const count = entryCountOf(logs, day);
                  return (
                    <div key={day}>
                      {i > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        className="mcpw-btn mcpw-hoverable"
                        aria-label={\`Day \${day} - \${phaseOf(day).label}\`}
                        onClick={() => selectDay(day)}
                        style={styles.row}>
                        {day === selectedDay ? (
                          <span style={styles.rowSelectedBar} aria-hidden />
                        ) : null}
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>
                            Day {day} - {phaseOf(day).label}
                          </span>
                          <span style={styles.rowSecondary}>{summaryOf(logs, day)}</span>
                        </span>
                        <span style={styles.rowTrailing}>{count}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* 9) bottom spacer before the tab bar */}
            <div style={styles.bottomSpacer} />
          </main>
        ) : (
          <main>
            <div style={{...styles.block, paddingTop: 20}}>
              <div style={styles.statRow}>
                <div style={styles.statTile}>
                  <span style={styles.statNumeral}>{totalEntries}</span>
                  <span style={styles.statCaption}>Entries</span>
                </div>
                <div style={styles.statTile}>
                  <span style={styles.statNumeral}>
                    {daysLogged} / {TODAY_DAY}
                  </span>
                  <span style={styles.statCaption}>Days logged</span>
                </div>
                <div style={styles.statTile}>
                  <span style={styles.statNumeral}>{strongTotal}</span>
                  <span style={styles.statCaption}>Strong</span>
                </div>
              </div>
            </div>
            <h2 style={styles.sectionHeader}>Symptom frequency</h2>
            <div style={styles.block}>
              <div style={styles.listCard}>
                {frequencies.map((f, i) => (
                  <div key={f.symptom.id}>
                    {i > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.freqRow}>
                      <div style={styles.freqTop}>
                        <span style={styles.utilityLabel}>{f.symptom.label}</span>
                        <span style={styles.utilityValue}>
                          {f.days} day{f.days === 1 ? '' : 's'} - {f.strong} strong
                        </span>
                      </div>
                      <div style={styles.freqTrack} aria-hidden>
                        <div
                          style={{
                            ...styles.freqFill,
                            width: \`\${Math.round((f.days / maxFrequency) * 100)}%\`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <h2 style={styles.sectionHeader}>Cycle length</h2>
            <div style={styles.block}>
              <div style={styles.listCard}>
                {CYCLE_HISTORY.map((record, i) => (
                  <div key={record.label}>
                    {i > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.utilityRow}>
                      <span style={styles.utilityLabel}>{record.label}</span>
                      <span style={styles.utilityValue}>{record.display}</span>
                    </div>
                  </div>
                ))}
                <div style={styles.rowDivider} />
                <div style={styles.utilityRow}>
                  <span style={{...styles.utilityLabel, fontWeight: 500}}>
                    Average - {CYCLE_AVERAGE_DISPLAY}
                  </span>
                </div>
              </div>
            </div>
            <div style={{...styles.block, marginTop: 12}}>
              <div style={{...styles.paddedCard, minHeight: 60, boxSizing: 'border-box'}}>
                <div style={{...styles.rowPrimary, whiteSpace: 'normal'}}>
                  Current cycle - Day {TODAY_DAY} of {CYCLE_LENGTH} predicted
                </div>
                <div style={{...styles.rowSecondary, marginTop: 2}}>
                  {DAYS_LEFT} days left in this cycle
                </div>
              </div>
            </div>
            <div style={styles.bottomSpacer} />
          </main>
        )}

        {/* TAB BAR — Today · Log (action tab, opens the sheet, never takes
            active state — the archetype's 'Log as sheet trigger'
            resolution) · Insights. The toast region rides the same sticky
            dock 12px above the bar. */}
        <div style={styles.dockWrap}>
          {/* Single polite live region — always mounted; toast card only
              when set. User-driven close (no timers, deterministic). */}
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div style={styles.toastCard}>
                <span>{toast}</span>
                <button
                  type="button"
                  className="mcpw-btn mcpw-hoverable"
                  aria-label="Dismiss message"
                  onClick={() => update('ui', {toast: null})}
                  style={styles.iconBtn}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>
          <nav style={styles.tabBar} role="tablist" aria-label="Lunara views">
          <button
            ref={todayTabRef}
            type="button"
            className="mcpw-btn mcpw-hoverable"
            role="tab"
            aria-selected={view === 'today'}
            tabIndex={view === 'today' ? 0 : -1}
            onKeyDown={onTabKeyDown}
            onClick={() => update('ui', {view: 'today'})}
            style={{...styles.tabItem, ...(view === 'today' ? styles.tabItemActive : null)}}>
            <Icon icon={CircleDotIcon} size="lg" color="inherit" />
            <span
              style={{...styles.tabLabel, ...(view === 'today' ? styles.tabLabelActive : null)}}>
              Today
            </span>
          </button>
          <button
            ref={logTabRef}
            type="button"
            className="mcpw-btn mcpw-hoverable"
            aria-haspopup="dialog"
            onClick={() => update('ui', {sheetOpen: true, sheetDetent: 'medium'})}
            style={styles.tabItem}>
            <Icon icon={PlusCircleIcon} size="lg" color="inherit" />
            <span style={styles.tabLabel}>Log</span>
          </button>
          <button
            ref={insightsTabRef}
            type="button"
            className="mcpw-btn mcpw-hoverable"
            role="tab"
            aria-selected={view === 'insights'}
            tabIndex={view === 'insights' ? 0 : -1}
            onKeyDown={onTabKeyDown}
            onClick={() => update('ui', {view: 'insights'})}
            style={{...styles.tabItem, ...(view === 'insights' ? styles.tabItemActive : null)}}>
            <Icon icon={BarChart3Icon} size="lg" color="inherit" />
            <span
              style={{
                ...styles.tabLabel,
                ...(view === 'insights' ? styles.tabLabelActive : null),
              }}>
              Insights
            </span>
          </button>
          </nav>
        </div>

        {sheetOpen ? (
          <LogSheet
            selectedDay={selectedDay}
            detent={sheetDetent}
            logs={logs}
            isPredicted={isPredicted}
            onToggleDetent={() =>
              update('ui', {sheetDetent: sheetDetent === 'medium' ? 'large' : 'medium'})
            }
            onSetLevel={(symptom, level) => update(\`day-\${selectedDay}\`, {[symptom]: level})}
            onSave={saveSheet}
            onClose={closeSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};