// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Trackside possession-planning
 *   surface for the North Vale corridor engineering shift of
 *   Sat 18 Jul 2026, 22:00 → Sun 19 Jul 2026, 08:00 (plan anchor; the plan
 *   is frozen at T-12h, there is no live clock). The time axis is minutes
 *   0..720 measured from 20:00; every displayed time is derived by pure
 *   arithmetic from those integers (no clock reads, no randomness, no
 *   timers, no network assets).
 *   World: 7 schematic nodes (Kelford Jct → Netherfield Jct) spanning
 *   6 track sections; 5 possessions; 11 train paths contributing exactly
 *   52 section passes (2C49 6, 1K86 6, 6V38 6, 1K88 6, 2C47 6, 2C51 6,
 *   3S09 1, 6M02 2, 5T02 1, 1K02 6, 2C02 6 → 6·8 + 1 + 2 + 1 = 52).
 *   Pre-seeded, visible before any interaction: exactly ONE train conflict
 *   (freight 6M02 passes section S4 01:15–01:29, inside possession
 *   P-2419's 00:45–04:45 window) and exactly ONE hand-back risk
 *   (P-2418 hands back S1 at 05:45; ECS 5T02 passes at 06:00 — a 15-min
 *   margin against the 30-min rule). Both are re-derived from the row
 *   sets at render, never typed as counts.
 * @output Rail Maintenance Window Planner — a possession planner's working
 *   surface: a corridor schematic (SVG double-line diagram with junction
 *   ladders, tunnel portals and per-section possession/conflict paint), a
 *   sections-by-minutes possession board (train passes drawn as direction
 *   glyphs on each section lane, possession blocks as shiftable buttons),
 *   and an aside that pairs the selected possession's isolation/worksite
 *   detail with the whole shift's crew staging list. The signature
 *   interaction: shifting a possession window in 15-minute steps (arrow
 *   keys on the focused block, or the aside's nudge buttons) re-derives
 *   train conflicts, hand-back margins, the header risk chips, the
 *   schematic section paint, and the crew staging order — the staging list
 *   resequences live because report times are derived (start − 45 min).
 * @position Page template; emitted by `astryx template rail-maintenance-window`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 48px (Trackside mark + corridor label | conflict chip +
 *   hand-back chip + plan-frozen note + planner avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (schematic band 172px > board scroller with sticky
 *       28px ruler > legend strip 30px)
 *     | aside 320px (possession detail > crew staging list), own scroll.
 * Container policy: app-shell archetype — frame bands, lanes and panels
 *   only; no Cards. The schematic, lanes, blocks and staging rows are
 *   styled divs/buttons on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (BRAND = light-dark(#C2410C, #FB923C), signal orange) used exactly
 *   twice: the Trackside logo SVG and the selected possession block's
 *   2px outline — both fills/strokes, never text. Contrast math:
 *   #C2410C on #FFFFFF ≈ 4.8:1; #FB923C on #1E1E1E ≈ 7.9:1 (fills only,
 *   held to ≥3:1 non-text and clearing 4.5:1 anyway). State colors ride
 *   the data-viz categorical vars with repo-standard light-dark
 *   fallbacks; every state pairs a shape channel (hatch overlay /
 *   triangle badge / clock chip / pass-glyph geometry) with its color,
 *   never color alone.
 *
 * FIXED DENSITY GRID (verbatim, repeated in code): header bar 48px;
 * schematic band 172px; time ruler 28px; section lanes 56px; possession
 * blocks 36px tall; lane label rail 168px wide (144px in the mid band,
 * 120px narrow); aside 320px (300px mid); staging rows 44px; legend strip
 * 30px; single gutter token GUTTER = 12 (all padding/margins are GUTTER
 * or GUTTER/2 = 6); mono metadata 12px; body text 13px; section labels
 * 11px uppercase tracking 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 * ResizeObserver (the demo stage is ~1045–1075px inside a 1440px window,
 * so viewport media queries would lie there; a viewport query covers only
 * the first pre-observer frame):
 * - W >= 1180: aside 320px, label rail 168px, px/min fills the remaining
 *   width (clamped 0.72–1.30).
 * - 980 <= W < 1180 (canonical demo band): aside 300px, label rail 144px
 *   (the chainage line drops), px/min ≈ 0.82 at 1045px so all 720 minutes
 *   fit the lane scroller with zero horizontal scroll — subtraction, not
 *   squeeze.
 * - W < 980: the aside leaves the flex flow and becomes a 320px absolute
 *   overlay (right 0, shadow, opens on selection, X / Escape closes and
 *   restores focus to the triggering block); label rail 120px with section
 *   codes only. The board horizontal-scrolls at the 0.72 px/min floor with
 *   the label rail sticky-left INSIDE the scroller; whenever minutes
 *   remain off-screen right, a gradient fade + chevron sits on a
 *   NON-scrolling wrapper (a fade on the scroller would scroll away).
 * Corner map: top-left Trackside mark + corridor label; top-right risk
 * chips + plan-frozen note + planner avatar; bottom-left legend strip;
 * bottom-right aside footer line (staging roll-call count / empty hint).
 * Fixture policy: fixed strings and integer minutes only. Aggregates are
 * derived live: the header conflict/hand-back chips, the schematic paint,
 * per-block badges and the staging order all re-derive from the single
 * possession store in the same render — the @input cross-checks above
 * hold at load and after every shift.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  ConeIcon,
  HardHatIcon,
  TrainFrontIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (signal orange). Exactly two usages: the
// Trackside logo SVG and the selected possession block's 2px outline. Both
// are fills/strokes, never text. #C2410C on #FFF ≈ 4.8:1; #FB923C on
// #1E1E1E ≈ 7.9:1.
const BRAND = 'light-dark(#C2410C, #FB923C)';

// Hand-back margin warning: #B45309 on white = 4.6:1, #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'light-dark(#B45309, #FBBF24)';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Conflict danger: #DC2626 on white = 4.5:1, #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const INFO_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
// Possession fill on the board and schematic — teal family so the brand
// orange stays quarantined. #0F766E on white = 5.5:1; #2DD4BF on #1E1E1E = 9.2:1.
const POSSESSION = 'var(--color-data-categorical-teal, light-dark(#0F766E, #2DD4BF))';
const POSSESSION_SOFT = 'light-dark(rgba(15, 118, 110, 0.12), rgba(45, 212, 191, 0.16))';
// Conflict hatch stripe over a possession block / schematic section span.
const HATCH_DANGER = 'light-dark(rgba(220, 38, 38, 0.30), rgba(248, 113, 113, 0.34))';

// Single gutter token — all padding/margins on this page are GUTTER or
// GUTTER/2 = 6 (density grid law).
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Scope class — every TEMPLATE_CSS selector below is prefixed with it.
const SCOPE = 'tpl-rail-maintenance-window';
const S = `.${SCOPE}`;

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all page CSS lives here, every selector prefixed with the
// scope class. Transitions animate color/opacity/box-shadow only; the
// conflict pulse collapses to a static badge under prefers-reduced-motion.
// FIXED DENSITY GRID repeated: header 48px, schematic 172px, ruler 28px,
// lanes 56px, blocks 36px, label rail 168/144/120px, aside 320/300px,
// staging rows 44px, legend 30px, gutter 12.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
${S} { height: 100dvh; width: 100%; font-family: var(--font-family-sans); }
${S} .rmw-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
${S} .rmw-fade { transition: opacity 160ms ease, background-color 160ms ease, box-shadow 160ms ease; }
${S} .rmw-header {
  display: flex; align-items: center; gap: ${GUTTER}px;
  height: 48px; padding: 0 ${GUTTER}px;
}
${S} .rmw-logo { display: inline-flex; align-items: center; flex-shrink: 0; }
${S} .rmw-mono {
  font-family: ${MONO}; font-size: 12px;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
${S} .rmw-sectionlabel {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-secondary); white-space: nowrap;
}
${S} .rmw-chip {
  display: inline-flex; align-items: center; gap: 6px;
  height: 24px; padding: 0 8px; border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap;
  color: var(--color-text-primary);
}
${S} .rmw-chip-danger { border-color: ${DANGER}; background: ${DANGER_SOFT}; color: ${DANGER}; }
${S} .rmw-chip-warn { border-color: ${WARN}; background: ${WARN_SOFT}; color: ${WARN}; }
${S} .rmw-viewroot {
  display: flex; height: 100%; min-height: 0;
  overflow: hidden; position: relative;
}
${S} .rmw-maincol { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
/* Schematic band 172px — the SVG corridor diagram. */
${S} .rmw-schematic {
  height: 172px; flex-shrink: 0; overflow: hidden;
  border-bottom: var(--border-width) solid var(--color-border);
  padding: 0 ${GUTTER}px;
}
${S} .rmw-section-hit { cursor: pointer; }
${S} .rmw-section-hit:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
/* Non-scrolling wrapper that owns the right-edge overflow affordance — the
   fade must NOT live on the scroller itself or it scrolls away with the
   content. */
${S} .rmw-boardviewport { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
${S} .rmw-scroller { flex: 1; min-height: 0; overflow: auto; position: relative; }
${S} .rmw-scrollhint {
  position: absolute; top: 0; right: 0; bottom: 0; width: 44px; z-index: 5;
  pointer-events: none; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 3px;
  background: linear-gradient(to right, transparent, var(--color-background) 72%);
}
/* Time ruler 28px — sticky above the lanes inside the scroller. */
${S} .rmw-ruler {
  position: sticky; top: 0; z-index: 3; display: flex; height: 28px;
  background: var(--color-background);
}
${S} .rmw-rulerlabelcell {
  position: sticky; left: 0; z-index: 4; flex-shrink: 0;
  display: flex; align-items: flex-end; padding: 0 ${GUTTER}px 4px;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .rmw-rulertrack {
  position: relative; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .rmw-hourtick {
  position: absolute; top: 16px; bottom: 0;
  border-left: var(--border-width) solid var(--color-border);
}
${S} .rmw-hourlabel {
  position: absolute; top: 2px; transform: translateX(-50%);
  font-family: ${MONO}; font-size: 10px; font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary); white-space: nowrap;
}
/* Section lanes 56px. */
${S} .rmw-lane { display: flex; align-items: stretch; height: 56px; }
${S} .rmw-lanelabel {
  position: sticky; left: 0; z-index: 2; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center; gap: 1px;
  padding: 0 ${GUTTER}px; overflow: hidden;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .rmw-lanelabel-name {
  font-size: 12px; font-weight: 600; color: var(--color-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
${S} .rmw-lanelabel-sub {
  font-size: 10px; color: var(--color-text-secondary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
${S} .rmw-lanetrack {
  position: relative; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .rmw-lanegrid {
  position: absolute; top: 0; bottom: 0;
  border-left: var(--border-width) solid var(--color-border);
  opacity: 0.5; pointer-events: none;
}
/* Train pass glyph — an SVG direction chevron on the lane centerline.
   Passenger = solid stroke, freight = thick square-cap stroke, ECS =
   dashed: kind is a geometry channel, never color alone. */
${S} .rmw-pass { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
/* Possession block — a real button, 36px tall, centered in the 56px lane. */
${S} .rmw-block {
  position: absolute; top: 10px; height: 36px;
  appearance: none; border: none; margin: 0;
  display: flex; align-items: center; gap: 6px;
  padding: 0 6px; border-radius: 5px;
  background: ${POSSESSION_SOFT};
  box-shadow: inset 0 0 0 1px ${POSSESSION};
  font-family: inherit; font-size: 12px; color: var(--color-text-primary);
  cursor: pointer; overflow: hidden; white-space: nowrap; text-align: left;
}
${S} .rmw-block:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
/* BRAND usage 2 of 2: the selected block's 2px signal-orange outline. */
${S} .rmw-block-selected { box-shadow: inset 0 0 0 2px ${BRAND}; }
${S} .rmw-block-conflict {
  background-image: repeating-linear-gradient(45deg, ${HATCH_DANGER} 0px, ${HATCH_DANGER} 2px, transparent 2px, transparent 8px);
  box-shadow: inset 0 0 0 1px ${DANGER};
}
${S} .rmw-block-selected.rmw-block-conflict { box-shadow: inset 0 0 0 2px ${BRAND}, inset 0 0 0 3px ${DANGER}; }
${S} .rmw-block-id { font-family: ${MONO}; font-size: 11px; font-variant-numeric: tabular-nums; flex-shrink: 0; }
${S} .rmw-block-title { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
${S} .rmw-badge {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-family: ${MONO}; font-size: 10px; font-variant-numeric: tabular-nums;
}
${S} .rmw-badge-conflict { color: ${DANGER}; }
${S} .rmw-badge-handback { color: ${WARN}; }
@keyframes rmw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
${S} .rmw-pulse { animation: rmw-pulse 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  ${S} .rmw-pulse { animation: none; }
  ${S} .rmw-fade { transition: none; }
}
/* Legend strip 30px. */
${S} .rmw-legend {
  display: flex; align-items: center; gap: ${GUTTER}px; height: 30px;
  padding: 0 ${GUTTER}px; overflow: hidden; flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
}
${S} .rmw-legendkey { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
/* Aside 320px (300 mid; 320 overlay under 980). */
${S} .rmw-aside {
  flex: none; display: flex; flex-direction: column; min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
${S} .rmw-aside-overlay {
  position: absolute; top: 0; right: 0; bottom: 0; width: 320px; z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
${S} .rmw-asidehead {
  display: flex; align-items: center; gap: ${GUTTER}px; height: 56px;
  padding: 0 ${GUTTER}px; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .rmw-asidescroll { flex: 1; min-height: 0; overflow-y: auto; padding: ${GUTTER}px; }
${S} .rmw-asidefooter {
  display: flex; align-items: center; height: 32px; flex-shrink: 0;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
}
${S} .rmw-detailrow { display: flex; align-items: center; gap: ${GUTTER}px; min-height: 32px; }
${S} .rmw-detaillabel { width: 84px; flex-shrink: 0; }
${S} .rmw-nudgegroup { display: inline-flex; align-items: center; gap: 6px; height: 40px; }
${S} .rmw-utilbar {
  position: relative; height: 6px; border-radius: 999px;
  background: var(--color-background-muted); overflow: hidden;
}
${S} .rmw-utilfill { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 999px; background: ${POSSESSION}; }
${S} .rmw-conflictrow {
  display: flex; align-items: center; gap: 6px; min-height: 32px;
  padding: 0 ${GUTTER / 2}px; border-radius: var(--radius-container);
  background: ${DANGER_SOFT}; color: ${DANGER}; overflow: hidden;
}
${S} .rmw-emptystate {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: ${GUTTER / 2}px; padding: ${GUTTER * 2}px;
  text-align: center;
}
/* Crew staging rows 44px — the resequencing surface. */
${S} .rmw-stagingrow {
  display: flex; align-items: center; gap: ${GUTTER / 2}px; min-height: 44px;
  padding: 0 ${GUTTER / 2}px; border-radius: var(--radius-container);
}
${S} .rmw-stagingrow-active { background: var(--color-background-muted); }
${S} .rmw-visuallyhidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
`;

// ---------------------------------------------------------------------------
// TIME MODEL — the axis is integer minutes 0..720 measured from 20:00 on the
// plan-anchor evening. formatMin is pure arithmetic on that integer; no
// clock reads anywhere on this page.
// ---------------------------------------------------------------------------

const AXIS_START_HOUR = 20; // min 0 == 20:00
const AXIS_MINUTES = 720; // 20:00 → 08:00
const SHIFT_STEP = 15; // signature-interaction nudge step, minutes
const HANDBACK_RULE_MIN = 30; // margin below this raises a hand-back risk
const REPORT_LEAD_MIN = 45; // crews report 45 min before the window opens

function formatMin(min: number): string {
  const total = AXIS_START_HOUR * 60 + min;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`;
}

// ---------------------------------------------------------------------------
// DATA — one deterministic world: the North Vale corridor, Sat 18 Jul 2026
// engineering shift. Signed-in user: possession planner Nadia Reyes ("NR").
// Sections and possessions are referenced by identity consts, never retyped.
// ---------------------------------------------------------------------------

const S1 = 'S1';
const S2 = 'S2';
const S3 = 'S3';
const S4 = 'S4';
const S5 = 'S5';
const S6 = 'S6';
const P_2417 = 'P-2417';
const P_2418 = 'P-2418';
const P_2419 = 'P-2419';
const P_2420 = 'P-2420';
const P_2421 = 'P-2421';

const PLANNER = {name: 'Nadia Reyes', initials: 'NR'};

interface TrackSection {
  id: string;
  code: string;
  name: string;
  lines: string; // running lines blocked by a possession of this section
  chainage: string;
}

// 'Corsley Bridge — Netherfield Jct' + 'UP & DOWN MAIN' is the label-rail
// truncation stress at the 144px mid-band rail width.
const SECTIONS: TrackSection[] = [
  {id: S1, code: 'S1', name: 'Kelford Jct — Ashmoor', lines: 'UP & DOWN MAIN', chainage: '12m 40ch – 15m 08ch'},
  {id: S2, code: 'S2', name: 'Ashmoor — Denmoor Vale', lines: 'UP MAIN', chainage: '15m 08ch – 19m 62ch'},
  {id: S3, code: 'S3', name: 'Denmoor Vale — Harnett Tunnel', lines: 'DOWN MAIN', chainage: '19m 62ch – 23m 31ch'},
  {id: S4, code: 'S4', name: 'Harnett Tunnel — Weald Sidings', lines: 'UP & DOWN MAIN', chainage: '23m 31ch – 27m 19ch'},
  {id: S5, code: 'S5', name: 'Weald Sidings — Corsley Bridge', lines: 'DOWN MAIN', chainage: '27m 19ch – 30m 55ch'},
  {id: S6, code: 'S6', name: 'Corsley Bridge — Netherfield Jct', lines: 'UP & DOWN MAIN', chainage: '30m 55ch – 34m 72ch'},
];

const SECTION_BY_ID = new Map(SECTIONS.map(s => [s.id, s]));

// Schematic nodes bracket the six sections west → east. Junction ladders
// render at Kelford and Netherfield; tunnel portals bracket Harnett; the
// yard tick marks Weald Sidings.
const NODES: Array<{id: string; label: string; kind: 'junction' | 'station' | 'tunnel' | 'yard'}> = [
  {id: 'KLF', label: 'Kelford Jct', kind: 'junction'},
  {id: 'ASH', label: 'Ashmoor', kind: 'station'},
  {id: 'DNM', label: 'Denmoor Vale', kind: 'station'},
  {id: 'HRT', label: 'Harnett Tnl', kind: 'tunnel'},
  {id: 'WLD', label: 'Weald Sdgs', kind: 'yard'},
  {id: 'CSB', label: 'Corsley Br', kind: 'station'},
  {id: 'NTF', label: 'Netherfield Jct', kind: 'junction'},
];

type TrainKind = 'passenger' | 'freight' | 'ecs';
type Direction = 'up' | 'down';

interface TrainPass {
  sectionId: string;
  at: number; // axis minute the train enters the section
  dur: number; // minutes occupying the section
}

interface TrainPath {
  id: string; // headcode
  label: string;
  kind: TrainKind;
  direction: Direction;
  locked?: boolean; // path cannot flex — the possession must move instead
  passes: TrainPass[];
}

// 11 paths / 52 passes (arithmetic in the @input comment). 6M02 originates
// on the Denmoor Vale quarry branch, so it only touches S3 + S4 — its
// 01:15–01:29 S4 pass is the pre-seeded conflict with P-2419 (00:45–04:45).
const TRAINS: TrainPath[] = [
  {
    id: '2C49', label: 'Netherfield → Kelford stopping', kind: 'passenger', direction: 'down',
    passes: [
      {sectionId: S6, at: 45, dur: 6}, {sectionId: S5, at: 57, dur: 5}, {sectionId: S4, at: 68, dur: 6},
      {sectionId: S3, at: 80, dur: 5}, {sectionId: S2, at: 90, dur: 6}, {sectionId: S1, at: 100, dur: 6},
    ],
  },
  {
    id: '1K86', label: 'Kelford → Netherfield fast', kind: 'passenger', direction: 'up',
    passes: [
      {sectionId: S1, at: 70, dur: 4}, {sectionId: S2, at: 76, dur: 5}, {sectionId: S3, at: 83, dur: 4},
      {sectionId: S4, at: 90, dur: 5}, {sectionId: S5, at: 97, dur: 4}, {sectionId: S6, at: 104, dur: 5},
    ],
  },
  {
    id: '6V38', label: 'Netherfield → Southam cement', kind: 'freight', direction: 'down',
    passes: [
      {sectionId: S6, at: 120, dur: 7}, {sectionId: S5, at: 130, dur: 8}, {sectionId: S4, at: 141, dur: 9},
      {sectionId: S3, at: 152, dur: 7}, {sectionId: S2, at: 161, dur: 8}, {sectionId: S1, at: 172, dur: 7},
    ],
  },
  {
    id: '1K88', label: 'Kelford → Netherfield fast (last up fast)', kind: 'passenger', direction: 'up',
    passes: [
      {sectionId: S1, at: 130, dur: 5}, {sectionId: S2, at: 137, dur: 5}, {sectionId: S3, at: 145, dur: 4},
      {sectionId: S4, at: 152, dur: 5}, {sectionId: S5, at: 160, dur: 5}, {sectionId: S6, at: 168, dur: 5},
    ],
  },
  {
    id: '2C47', label: 'Netherfield → Kelford stopping (last down)', kind: 'passenger', direction: 'down',
    passes: [
      {sectionId: S6, at: 105, dur: 6}, {sectionId: S5, at: 117, dur: 5}, {sectionId: S4, at: 128, dur: 6},
      {sectionId: S3, at: 140, dur: 5}, {sectionId: S2, at: 150, dur: 6}, {sectionId: S1, at: 160, dur: 7},
    ],
  },
  {
    id: '2C51', label: 'Kelford → Netherfield stopping (last up)', kind: 'passenger', direction: 'up',
    passes: [
      {sectionId: S1, at: 165, dur: 6}, {sectionId: S2, at: 174, dur: 6}, {sectionId: S3, at: 184, dur: 5},
      {sectionId: S4, at: 194, dur: 5}, {sectionId: S5, at: 204, dur: 5}, {sectionId: S6, at: 214, dur: 6},
    ],
  },
  {
    id: '3S09', label: 'RHTT railhead treatment (turns back at Ashmoor)', kind: 'ecs', direction: 'up',
    passes: [{sectionId: S1, at: 225, dur: 6}],
  },
  {
    id: '6M02', label: 'Denmoor Vale Quarry → Weald Sidings aggregates', kind: 'freight', direction: 'up',
    locked: true,
    passes: [{sectionId: S3, at: 306, dur: 7}, {sectionId: S4, at: 315, dur: 14}],
  },
  {
    id: '5T02', label: 'Kelford depot → Ashmoor ECS (first)', kind: 'ecs', direction: 'up',
    passes: [{sectionId: S1, at: 600, dur: 6}],
  },
  {
    id: '1K02', label: 'Kelford → Netherfield fast (first up)', kind: 'passenger', direction: 'up',
    passes: [
      {sectionId: S1, at: 620, dur: 5}, {sectionId: S2, at: 628, dur: 6}, {sectionId: S3, at: 636, dur: 5},
      {sectionId: S4, at: 643, dur: 5}, {sectionId: S5, at: 650, dur: 5}, {sectionId: S6, at: 657, dur: 5},
    ],
  },
  {
    id: '2C02', label: 'Netherfield → Kelford stopping (first down)', kind: 'passenger', direction: 'down',
    passes: [
      {sectionId: S6, at: 570, dur: 6}, {sectionId: S5, at: 582, dur: 5}, {sectionId: S4, at: 598, dur: 6},
      {sectionId: S3, at: 610, dur: 5}, {sectionId: S2, at: 620, dur: 6}, {sectionId: S1, at: 631, dur: 6},
    ],
  },
];

interface CrewPlan {
  picop: string; // Person In Charge Of Possession
  es: string; // Engineering Supervisor
  headcount: number;
  stagingPoint: string;
  plant: string;
}

type PossessionStatus = 'confirmed' | 'provisional';

interface Possession {
  id: string;
  sectionId: string;
  title: string;
  protection: string;
  status: PossessionStatus;
  startMin: number; // THE mutable field — everything else derives from it
  durationMin: number; // window length is fixed; shifting moves the window
  requiredMin: number; // engineering estimate; utilization = required/duration
  isolation?: string; // OLE isolation reference — omit-when-undefined
  crew: CrewPlan;
}

// P-2418's 68-char title is the block-label truncation stress. Crew report
// times are DERIVED (start − 45), never stored, so the staging list must
// resequence whenever a window shifts. Initial derived order by report
// minute: P-2417/P-2420 tie at 165 (22:45, id tiebreak), P-2421 180
// (23:00), P-2418 210 (23:30), P-2419 240 (00:00).
const INITIAL_POSSESSIONS: Possession[] = [
  {
    id: P_2417, sectionId: S2, title: 'Rail grinding — Ashmoor curves', protection: 'T-3 possession',
    status: 'confirmed', startMin: 210, durationMin: 300, requiredMin: 270,
    crew: {picop: 'R. Sandoval', es: 'M. Ferreira', headcount: 6, stagingPoint: 'Ashmoor yard, access gate 4', plant: 'Grinding unit DR 79271'},
  },
  {
    id: P_2418, sectionId: S1, title: 'S&C renewal — Ashmoor Jct 2143A/B points and crossing (stage 2 of 3)', protection: 'T-3 possession + line block',
    status: 'confirmed', startMin: 255, durationMin: 330, requiredMin: 300,
    crew: {picop: 'A. Okwuosa', es: 'T. Brandt', headcount: 14, stagingPoint: 'Kelford Jct compound', plant: 'Kirow 250 crane + 2 engineering trains'},
  },
  {
    id: P_2419, sectionId: S4, title: 'OLE wire run renewal — Harnett east portal', protection: 'T-3 possession',
    status: 'provisional', startMin: 285, durationMin: 240, requiredMin: 220,
    isolation: 'Isolation E-114 (Harnett feeder)',
    crew: {picop: 'L. Havlíček', es: 'S. Nakagawa', headcount: 9, stagingPoint: 'Weald Sidings, gate 1', plant: 'MEWP ×3 + wiring train'},
  },
  {
    id: P_2420, sectionId: S5, title: 'Drainage clearance — Corsley culverts', protection: 'Line block',
    status: 'confirmed', startMin: 210, durationMin: 180, requiredMin: 150,
    crew: {picop: 'D. Whitmore', es: 'P. Iyer', headcount: 5, stagingPoint: 'Corsley Bridge access point', plant: 'Vacuum excavator RRV'},
  },
  {
    id: P_2421, sectionId: S6, title: 'Vegetation clearance — Netherfield approach', protection: 'Line block',
    status: 'confirmed', startMin: 225, durationMin: 315, requiredMin: 290,
    crew: {picop: 'J. Maciel', es: 'K. Osei', headcount: 7, stagingPoint: 'Netherfield Jct compound', plant: 'MPV + chipper trailers'},
  },
];

// ---------------------------------------------------------------------------
// DERIVATIONS — conflicts and hand-back margins are pure functions of
// (possession, TRAINS). Nothing is stored; the header chips, block badges,
// schematic paint and staging order all re-derive every render.
// ---------------------------------------------------------------------------

interface ConflictHit {
  trainId: string;
  trainLabel: string;
  kind: TrainKind;
  locked: boolean;
  passStart: number;
  passEnd: number;
}

function conflictsFor(possession: Possession): ConflictHit[] {
  const start = possession.startMin;
  const end = possession.startMin + possession.durationMin;
  const hits: ConflictHit[] = [];
  for (const train of TRAINS) {
    for (const pass of train.passes) {
      if (pass.sectionId !== possession.sectionId) continue;
      const passEnd = pass.at + pass.dur;
      if (pass.at < end && passEnd > start) {
        hits.push({
          trainId: train.id,
          trainLabel: train.label,
          kind: train.kind,
          locked: train.locked === true,
          passStart: pass.at,
          passEnd,
        });
      }
    }
  }
  return hits;
}

interface HandbackInfo {
  trainId: string;
  at: number;
  margin: number;
}

/** First pass on the possession's section at/after hand-back; null when the
 * remaining paths never revisit the section before 08:00. */
function handbackFor(possession: Possession): HandbackInfo | null {
  const end = possession.startMin + possession.durationMin;
  let best: HandbackInfo | null = null;
  for (const train of TRAINS) {
    for (const pass of train.passes) {
      if (pass.sectionId !== possession.sectionId || pass.at < end) continue;
      if (best == null || pass.at < best.at) {
        best = {trainId: train.id, at: pass.at, margin: pass.at - end};
      }
    }
  }
  return best;
}

interface PossessionDerived {
  possession: Possession;
  conflicts: ConflictHit[];
  handback: HandbackInfo | null;
  handbackRisk: boolean;
  reportMin: number; // staging report time = start − REPORT_LEAD_MIN
}

function derivePossession(possession: Possession): PossessionDerived {
  const conflicts = conflictsFor(possession);
  const handback = handbackFor(possession);
  return {
    possession,
    conflicts,
    handback,
    handbackRisk: handback != null && handback.margin < HANDBACK_RULE_MIN,
    reportMin: possession.startMin - REPORT_LEAD_MIN,
  };
}

function possessionAriaLabel(d: PossessionDerived): string {
  const p = d.possession;
  const parts = [
    `Possession ${p.id}, ${p.title}`,
    `section ${p.sectionId}`,
    `${formatMin(p.startMin)} to ${formatMin(p.startMin + p.durationMin)}`,
  ];
  if (d.conflicts.length > 0) {
    parts.push(
      `${d.conflicts.length} train conflict${d.conflicts.length === 1 ? '' : 's'}: ${d.conflicts.map(c => c.trainId).join(', ')}`,
    );
  }
  if (d.handbackRisk && d.handback != null) {
    parts.push(`hand-back margin ${d.handback.margin} minutes, below the ${HANDBACK_RULE_MIN} minute rule`);
  }
  parts.push('arrow keys shift the window in 15 minute steps');
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (house pattern): the demo stage
// renders this page in a ~1045–1075px container inside a 1440px window, so
// viewport media queries would lie. Width 0 = first pre-observer frame; the
// caller falls back to a viewport query for that frame only.
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
// TRACKSIDE MARK — 24px inline SVG: two running rails, a sleeper tie, and a
// signal-head dot. BRAND usage 1 of 2.
// ---------------------------------------------------------------------------

function TracksideMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <path d="M3 10 H21" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" />
      <path d="M3 16 H21" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      <path d="M8 7 V19" fill="none" stroke={BRAND} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
      <circle cx={17} cy={5} r={2.4} fill={BRAND} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CorridorSchematic — fully custom SVG; the DS has no vocabulary for a
// double-line track diagram. West → east: junction ladders at Kelford and
// Netherfield, tunnel portal brackets at Harnett, a yard tick at Weald
// Sidings. Each section span is a real <button>-like focusable hit target
// (SVG <g role=button>) that selects the section's possession; spans paint
// teal while possessed, add the red hatch while conflicted, and stay
// border-grey when idle (S3 is the idle proof). Purely presentational —
// selection state and derived flags arrive via props.
// ---------------------------------------------------------------------------

interface CorridorSchematicProps {
  derived: PossessionDerived[];
  selectedId: string | null;
  onSelectPossession: (id: string) => void;
}

function CorridorSchematic({derived, selectedId, onSelectPossession}: CorridorSchematicProps) {
  // ViewBox is 1000x150; the SVG scales to the band width. Node xs are
  // evenly spaced with margins for the junction ladders.
  const xs = [60, 210, 360, 510, 660, 810, 940];
  const yUp = 62; // up main
  const yDown = 86; // down main
  const byId = new Map(derived.map(d => [d.possession.sectionId, d]));

  return (
    <div className="rmw-schematic">
      <svg
        viewBox="0 0 1000 150"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="North Vale corridor schematic, Kelford Junction to Netherfield Junction">
        <defs>
          <pattern id="rmw-hatch" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={8} height={8} fill="transparent" />
            <rect width={2.5} height={8} fill={HATCH_DANGER} />
          </pattern>
        </defs>
        {/* Base running lines. */}
        <line x1={xs[0]} y1={yUp} x2={xs[6]} y2={yUp} stroke="var(--color-border)" strokeWidth={3} />
        <line x1={xs[0]} y1={yDown} x2={xs[6]} y2={yDown} stroke="var(--color-border)" strokeWidth={3} />
        {/* Junction ladders — crossovers fanning off both ends. */}
        <path d={`M${xs[0] - 34} ${yUp - 26} L${xs[0]} ${yUp}`} stroke="var(--color-border)" strokeWidth={2.5} fill="none" />
        <path d={`M${xs[0] - 34} ${yDown + 26} L${xs[0]} ${yDown}`} stroke="var(--color-border)" strokeWidth={2.5} fill="none" />
        <path d={`M${xs[0] + 18} ${yUp} L${xs[0] + 44} ${yDown}`} stroke="var(--color-border)" strokeWidth={2} fill="none" />
        <path d={`M${xs[6] + 34} ${yUp - 26} L${xs[6]} ${yUp}`} stroke="var(--color-border)" strokeWidth={2.5} fill="none" />
        <path d={`M${xs[6] + 34} ${yDown + 26} L${xs[6]} ${yDown}`} stroke="var(--color-border)" strokeWidth={2.5} fill="none" />
        <path d={`M${xs[6] - 44} ${yDown} L${xs[6] - 18} ${yUp}`} stroke="var(--color-border)" strokeWidth={2} fill="none" />
        {/* Yard tick at Weald Sidings (node index 4). */}
        <path
          d={`M${xs[4] - 16} ${yDown} L${xs[4] - 4} ${yDown + 20} H${xs[4] + 28}`}
          stroke="var(--color-border)"
          strokeWidth={2}
          fill="none"
        />
        {/* Section spans — painted per derived possession state. */}
        {SECTIONS.map((section, i) => {
          const d = byId.get(section.id);
          const hasConflict = d != null && d.conflicts.length > 0;
          const isSelected = d != null && d.possession.id === selectedId;
          const x1 = xs[i] + 10;
          const x2 = xs[i + 1] - 10;
          const stroke = d == null ? 'var(--color-border)' : hasConflict ? DANGER : POSSESSION;
          const label = d == null
            ? `${section.code} ${section.name}: no possession tonight`
            : `${section.code} ${section.name}: possession ${d.possession.id} ${formatMin(d.possession.startMin)} to ${formatMin(d.possession.startMin + d.possession.durationMin)}${hasConflict ? `, ${d.conflicts.length} conflict${d.conflicts.length === 1 ? '' : 's'}` : ''}`;
          const span = (
            <>
              {/* Possession paints BOTH schematic lines when it blocks both. */}
              <line x1={x1} y1={yUp} x2={x2} y2={yUp} stroke={stroke} strokeWidth={d == null ? 3 : 6} strokeLinecap="round" opacity={d == null ? 1 : 0.9} />
              <line
                x1={x1} y1={yDown} x2={x2} y2={yDown}
                stroke={d != null && SECTION_BY_ID.get(section.id)?.lines.includes('DOWN') === true ? stroke : 'var(--color-border)'}
                strokeWidth={d != null && SECTION_BY_ID.get(section.id)?.lines.includes('DOWN') === true ? 6 : 3}
                strokeLinecap="round"
                opacity={d == null ? 1 : 0.9}
              />
              {hasConflict ? (
                <rect x={x1} y={yUp - 8} width={x2 - x1} height={yDown - yUp + 16} fill="url(#rmw-hatch)" pointerEvents="none" />
              ) : null}
              {isSelected ? (
                <rect
                  x={x1 - 4}
                  y={yUp - 12}
                  width={x2 - x1 + 8}
                  height={yDown - yUp + 24}
                  rx={6}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  pointerEvents="none"
                />
              ) : null}
              {/* Section code + possession id under the span. */}
              <text
                x={(x1 + x2) / 2}
                y={yDown + 34}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-family-sans)"
                fill="var(--color-text-secondary)">
                {section.code}
                {d != null ? ` · ${d.possession.id}` : ''}
              </text>
            </>
          );
          return d != null ? (
            <g
              key={section.id}
              className="rmw-section-hit"
              role="button"
              tabIndex={0}
              aria-label={label}
              onClick={() => onSelectPossession(d.possession.id)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectPossession(d.possession.id);
                }
              }}>
              {span}
            </g>
          ) : (
            <g key={section.id} aria-label={label} role="img">
              {span}
            </g>
          );
        })}
        {/* Nodes on top of the spans. */}
        {NODES.map((node, i) => (
          <g key={node.id}>
            {node.kind === 'tunnel' ? (
              // Portal brackets instead of a dot.
              <>
                <path d={`M${xs[i] - 9} ${yUp - 12} V${yDown + 12}`} stroke="var(--color-text-secondary)" strokeWidth={2} fill="none" />
                <path d={`M${xs[i] + 9} ${yUp - 12} V${yDown + 12}`} stroke="var(--color-text-secondary)" strokeWidth={2} fill="none" />
              </>
            ) : (
              <>
                <circle cx={xs[i]} cy={yUp} r={node.kind === 'junction' ? 5 : 4} fill="var(--color-background)" stroke="var(--color-text-secondary)" strokeWidth={2} />
                <circle cx={xs[i]} cy={yDown} r={node.kind === 'junction' ? 5 : 4} fill="var(--color-background)" stroke="var(--color-text-secondary)" strokeWidth={2} />
              </>
            )}
            <text
              x={xs[i]}
              y={yUp - 22}
              textAnchor="middle"
              fontSize={11}
              fontFamily="var(--font-family-sans)"
              fill="var(--color-text-primary)">
              {node.label}
            </text>
          </g>
        ))}
        {/* Line direction annotations. */}
        <text x={xs[0] - 46} y={yUp + 4} textAnchor="end" fontSize={10} fontFamily={'ui-monospace, monospace'} fill="var(--color-text-secondary)">UP</text>
        <text x={xs[0] - 46} y={yDown + 4} textAnchor="end" fontSize={10} fontFamily={'ui-monospace, monospace'} fill="var(--color-text-secondary)">DN</text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PassGlyph — a train pass on a lane: direction chevron + occupancy tick.
// Geometry encodes kind (passenger solid / freight thick square-cap / ECS
// dashed) so color is never the only channel. Non-interactive; each lane
// exposes the passes via its aria-label instead.
// ---------------------------------------------------------------------------

function PassGlyph({pass, train, pxPerMin}: {pass: TrainPass; train: TrainPath; pxPerMin: number}) {
  const left = pass.at * pxPerMin;
  const width = Math.max(pass.dur * pxPerMin, 6);
  const stroke =
    train.kind === 'passenger' ? INFO_BLUE : train.kind === 'freight' ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)';
  const strokeWidth = train.kind === 'freight' ? 3 : 1.5;
  const dash = train.kind === 'ecs' ? '3 2' : undefined;
  const pointRight = train.direction === 'up';
  const h = 14;
  const chevron = pointRight
    ? `M${width - 5} ${h / 2 - 4} L${width - 1} ${h / 2} L${width - 5} ${h / 2 + 4}`
    : `M5 ${h / 2 - 4} L1 ${h / 2} L5 ${h / 2 + 4}`;
  return (
    <svg
      className="rmw-pass"
      style={{left}}
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      aria-hidden>
      <line
        x1={pointRight ? 0 : 6}
        y1={h / 2}
        x2={pointRight ? width - 6 : width}
        y2={h / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeLinecap={train.kind === 'freight' ? 'square' : 'round'}
      />
      <path d={chevron} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PossessionBlock — the signature-interaction surface: a real <button>,
// 36px tall, absolutely positioned on its lane at startMin·pxPerMin.
// ArrowLeft/ArrowRight shift the window by 15 minutes (the owner clamps to
// the axis); Enter/Space selects. Badges: red triangle-count while
// conflicted, amber clock+margin while inside the 30-min hand-back rule.
// ---------------------------------------------------------------------------

interface PossessionBlockProps {
  derived: PossessionDerived;
  pxPerMin: number;
  isSelected: boolean;
  compact: boolean; // narrow band: id only
  onSelect: (id: string) => void;
  onShift: (id: string, deltaMin: number) => void;
  registerRef: (id: string) => (el: HTMLButtonElement | null) => void;
}

function PossessionBlock({derived, pxPerMin, isSelected, compact, onSelect, onShift, registerRef}: PossessionBlockProps) {
  const p = derived.possession;
  const hasConflict = derived.conflicts.length > 0;
  const classes = [
    'rmw-block',
    'rmw-fade',
    isSelected ? 'rmw-block-selected' : '',
    hasConflict ? 'rmw-block-conflict' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      ref={registerRef(p.id)}
      className={classes}
      style={{left: p.startMin * pxPerMin, width: Math.max(p.durationMin * pxPerMin, 56)}}
      aria-pressed={isSelected}
      aria-label={possessionAriaLabel(derived)}
      onClick={() => onSelect(p.id)}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onShift(p.id, -SHIFT_STEP);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          onShift(p.id, SHIFT_STEP);
        }
      }}>
      <span className="rmw-block-id">{p.id}</span>
      {compact ? null : <span className="rmw-block-title">{p.title}</span>}
      <span className="rmw-block-id" aria-hidden>
        {formatMin(p.startMin)}–{formatMin(p.startMin + p.durationMin)}
      </span>
      {hasConflict ? (
        <span className={`rmw-badge rmw-badge-conflict${isSelected ? '' : ' rmw-pulse'}`} aria-hidden>
          <TriangleAlertIcon size={11} strokeWidth={2.5} />
          {derived.conflicts.length}
        </span>
      ) : null}
      {derived.handbackRisk && derived.handback != null ? (
        <span className="rmw-badge rmw-badge-handback" aria-hidden>
          <Clock3Icon size={11} strokeWidth={2.5} />
          {derived.handback.margin}m
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PossessionBoard — sections × minutes. ONE scroller owns both the sticky
// 28px ruler, the sticky-left label rail and the lanes so rows can never
// misalign. Hour gridlines repeat on ruler and lanes from the same minute
// math. Purely presentational; the owner passes derived rows + callbacks.
// ---------------------------------------------------------------------------

interface BoardGeometry {
  railW: number;
  pxPerMin: number;
  showLaneSub: boolean; // chainage/lines line under the section name
  compactBlocks: boolean;
}

interface PossessionBoardProps {
  derivedRows: PossessionDerived[];
  selectedId: string | null;
  geometry: BoardGeometry;
  onSelect: (id: string) => void;
  onShift: (id: string, deltaMin: number) => void;
  registerRef: (id: string) => (el: HTMLButtonElement | null) => void;
}

const HOURS = Array.from({length: AXIS_MINUTES / 60 + 1}, (_, i) => i * 60);

function PossessionBoard({derivedRows, selectedId, geometry, onSelect, onShift, registerRef}: PossessionBoardProps) {
  const {railW, pxPerMin, showLaneSub, compactBlocks} = geometry;
  const trackW = AXIS_MINUTES * pxPerMin;
  const bysection = new Map(derivedRows.map(d => [d.possession.sectionId, d]));

  return (
    <div style={{width: 'max-content', minWidth: '100%'}}>
      <div className="rmw-ruler" style={{width: railW + trackW}}>
        <div className="rmw-rulerlabelcell" style={{width: railW}}>
          <span className="rmw-sectionlabel">Sections</span>
        </div>
        <div className="rmw-rulertrack" style={{width: trackW}}>
          {HOURS.map(min => (
            <span key={min}>
              <span className="rmw-hourtick" style={{left: min * pxPerMin}} aria-hidden />
              {/* First and last labels anchor inward so they never clip. */}
              <span
                className="rmw-hourlabel"
                style={
                  min === 0
                    ? {left: 2, transform: 'none'}
                    : min === AXIS_MINUTES
                      ? {left: trackW - 2, transform: 'translateX(-100%)'}
                      : {left: min * pxPerMin}
                }>
                {formatMin(min)}
              </span>
            </span>
          ))}
        </div>
      </div>
      {SECTIONS.map(section => {
        const d = bysection.get(section.id);
        const lanePasses: Array<{train: TrainPath; pass: TrainPass}> = [];
        for (const train of TRAINS) {
          for (const pass of train.passes) {
            if (pass.sectionId === section.id) lanePasses.push({train, pass});
          }
        }
        const passSummary = lanePasses
          .map(({train, pass}) => `${train.id} at ${formatMin(pass.at)}`)
          .join(', ');
        return (
          <div key={section.id} className="rmw-lane" style={{width: railW + trackW}}>
            <div className="rmw-lanelabel" style={{width: railW}}>
              <span className="rmw-lanelabel-name">
                {showLaneSub ? `${section.code} · ${section.name}` : section.code}
              </span>
              {showLaneSub ? (
                <span className="rmw-lanelabel-sub">{section.lines}</span>
              ) : (
                <span className="rmw-lanelabel-sub">{section.lines.replace(' MAIN', '')}</span>
              )}
              {geometry.railW >= 168 ? (
                <span className="rmw-lanelabel-sub">{section.chainage}</span>
              ) : null}
            </div>
            <div
              className="rmw-lanetrack"
              style={{width: trackW}}
              role="group"
              aria-label={`${section.code} ${section.name} lane. Train passes: ${passSummary === '' ? 'none' : passSummary}`}>
              {HOURS.map(min =>
                min === 0 || min === AXIS_MINUTES ? null : (
                  <span key={min} className="rmw-lanegrid" style={{left: min * pxPerMin}} aria-hidden />
                ),
              )}
              {lanePasses.map(({train, pass}) => (
                <PassGlyph key={`${train.id}-${pass.at}`} pass={pass} train={train} pxPerMin={pxPerMin} />
              ))}
              {d != null ? (
                <PossessionBlock
                  derived={d}
                  pxPerMin={pxPerMin}
                  isSelected={selectedId === d.possession.id}
                  compact={compactBlocks}
                  onSelect={onSelect}
                  onShift={onShift}
                  registerRef={registerRef}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BoardScrollport — non-scrolling wrapper around the board scroller. When
// minutes remain off-screen right (scrollLeft + clientWidth < scrollWidth),
// it overlays a right-edge gradient fade + chevron so a clipped 06:00 can
// never read as the end of the shift. The affordance lives on THIS wrapper,
// not the scroller — a fade on the scroll container would scroll away with
// the content. At the canonical demo band the full 720 minutes fit and the
// hint never renders; it is defense for the sub-980 band.
// ---------------------------------------------------------------------------

function BoardScrollport({children}: {children: ReactNode}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (el == null) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el == null) return undefined;
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateOverflow]);

  return (
    <div className="rmw-boardviewport">
      <div ref={scrollerRef} className="rmw-scroller" onScroll={updateOverflow}>
        {children}
      </div>
      {canScrollRight ? (
        <div className="rmw-scrollhint" aria-hidden>
          <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LegendStrip — 30px key for block/pass encodings. Bottom-left corner owner.
// ---------------------------------------------------------------------------

function LegendStrip() {
  return (
    <div className="rmw-legend" aria-label="Board encoding legend">
      <span className="rmw-legendkey">
        <span
          aria-hidden
          style={{
            width: 18,
            height: 10,
            borderRadius: 3,
            background: POSSESSION_SOFT,
            boxShadow: `inset 0 0 0 1px ${POSSESSION}`,
          }}
        />
        <Text type="supporting" size="xsm" color="secondary">
          Possession
        </Text>
      </span>
      <span className="rmw-legendkey">
        <span
          aria-hidden
          style={{
            width: 18,
            height: 10,
            borderRadius: 3,
            boxShadow: `inset 0 0 0 1px ${DANGER}`,
            backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_DANGER} 0px, ${HATCH_DANGER} 2px, transparent 2px, transparent 6px)`,
          }}
        />
        <Text type="supporting" size="xsm" color="secondary">
          Train conflict
        </Text>
      </span>
      <span className="rmw-legendkey">
        <Clock3Icon size={11} strokeWidth={2.5} color="currentColor" style={{color: 'var(--color-text-secondary)'}} aria-hidden />
        <Text type="supporting" size="xsm" color="secondary">
          Hand-back &lt; 30m
        </Text>
      </span>
      <span className="rmw-legendkey">
        <svg width={20} height={10} viewBox="0 0 20 10" aria-hidden>
          <line x1={0} y1={5} x2={14} y2={5} stroke={INFO_BLUE} strokeWidth={1.5} strokeLinecap="round" />
          <path d="M15 1 L19 5 L15 9" fill="none" stroke={INFO_BLUE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Text type="supporting" size="xsm" color="secondary">
          Passenger
        </Text>
      </span>
      <span className="rmw-legendkey">
        <svg width={20} height={10} viewBox="0 0 20 10" aria-hidden>
          <line x1={0} y1={5} x2={14} y2={5} stroke="var(--color-text-secondary)" strokeWidth={3} strokeLinecap="square" />
          <path d="M15 1 L19 5 L15 9" fill="none" stroke="var(--color-text-secondary)" strokeWidth={3} strokeLinecap="square" />
        </svg>
        <Text type="supporting" size="xsm" color="secondary">
          Freight
        </Text>
      </span>
      <span className="rmw-legendkey">
        <svg width={20} height={10} viewBox="0 0 20 10" aria-hidden>
          <line x1={0} y1={5} x2={14} y2={5} stroke="var(--color-text-secondary)" strokeWidth={1.5} strokeDasharray="3 2" strokeLinecap="round" />
          <path d="M15 1 L19 5 L15 9" fill="none" stroke="var(--color-text-secondary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Text type="supporting" size="xsm" color="secondary">
          ECS / on-track machine
        </Text>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StagingList — the shift's crew roll-call, sorted by DERIVED report time
// (start − 45), id tiebreak. Rows are 44px; the row belonging to the
// selected possession is highlighted, and the most recently shifted
// possession's row carries a "moved" token so a resequence is observable
// even when the order happens not to change.
// ---------------------------------------------------------------------------

interface StagingListProps {
  derived: PossessionDerived[];
  selectedId: string | null;
  lastShiftedId: string | null;
  onSelect: (id: string) => void;
}

function StagingList({derived, selectedId, lastShiftedId, onSelect}: StagingListProps) {
  const ordered = [...derived].sort((a, b) =>
    a.reportMin !== b.reportMin ? a.reportMin - b.reportMin : a.possession.id.localeCompare(b.possession.id),
  );
  return (
    <VStack gap={1}>
      <span className="rmw-sectionlabel">Crew staging — report order</span>
      <ol style={{listStyle: 'none', margin: 0, padding: 0}} aria-label="Crew staging list in report-time order">
        {ordered.map(d => {
          const p = d.possession;
          const isActive = selectedId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`rmw-stagingrow rmw-focusable rmw-fade${isActive ? ' rmw-stagingrow-active' : ''}`}
                style={{
                  width: '100%',
                  appearance: 'none',
                  border: 'none',
                  background: isActive ? undefined : 'transparent',
                  font: 'inherit',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                aria-pressed={isActive}
                aria-label={`${p.id} crew: report ${formatMin(d.reportMin)} at ${p.crew.stagingPoint}, PICOP ${p.crew.picop}, ${p.crew.headcount} staff`}
                onClick={() => onSelect(p.id)}>
                <span className="rmw-mono" style={{color: 'var(--color-text-secondary)', width: 44, flexShrink: 0}}>
                  {formatMin(d.reportMin)}
                </span>
                <Icon icon={HardHatIcon} size="xsm" color="secondary" />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <HStack gap={2} vAlign="center">
                      <span className="rmw-mono">{p.id}</span>
                      <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                        {p.crew.picop} · {p.crew.headcount} staff
                      </Text>
                      {lastShiftedId === p.id ? (
                        <span style={{flexShrink: 0}}>
                          <Token size="sm" color="orange" label="moved" />
                        </span>
                      ) : null}
                    </HStack>
                    <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                      {p.crew.stagingPoint}
                    </Text>
                  </VStack>
                </StackItem>
              </button>
            </li>
          );
        })}
      </ol>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// AsidePanel — selected possession detail (32px label/value rows, 40px
// nudge group, utilization bar, conflict rows) above the staging list.
// Empty state until first selection. Bottom-right corner owner: the footer
// roll-call line.
// ---------------------------------------------------------------------------

function DetailRow({label, value, sub}: {label: string; value: string; sub?: string}) {
  return (
    <div className="rmw-detailrow">
      <span className="rmw-sectionlabel rmw-detaillabel">{label}</span>
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" size="sm" hasTabularNumbers>
            {value}
          </Text>
          {sub != null ? (
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {sub}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
    </div>
  );
}

interface AsidePanelProps {
  isOverlay: boolean;
  width: number;
  derived: PossessionDerived[];
  selected: PossessionDerived | null;
  lastShiftedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onShift: (id: string, deltaMin: number) => void;
}

function AsidePanel({isOverlay, width, derived, selected, lastShiftedId, onClose, onSelect, onShift}: AsidePanelProps) {
  const totalHeadcount = derived.reduce((sum, d) => sum + d.possession.crew.headcount, 0);
  return (
    <aside
      className={`rmw-aside${isOverlay ? ' rmw-aside-overlay' : ''}`}
      style={isOverlay ? undefined : {width}}
      aria-label="Possession detail and crew staging">
      <div className="rmw-asidehead">
        {selected == null ? (
          <Heading level={2}>Tonight&rsquo;s possessions</Heading>
        ) : (
          <StackItem size="fill">
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <span className="rmw-mono">{selected.possession.id}</span>
                <span style={{flexShrink: 0}}>
                  <Token
                    size="sm"
                    color={selected.possession.status === 'confirmed' ? 'green' : 'gray'}
                    label={selected.possession.status}
                  />
                </span>
              </HStack>
              <Heading level={2} maxLines={1}>
                {selected.possession.title}
              </Heading>
            </VStack>
          </StackItem>
        )}
        {isOverlay ? (
          <Button
            label="Close possession detail"
            isIconOnly
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className="rmw-asidescroll">
        {selected == null ? (
          <div className="rmw-emptystate">
            <Icon icon={ConeIcon} size="lg" color="secondary" />
            <Heading level={3}>Nothing selected</Heading>
            <Text type="supporting" size="sm" color="secondary">
              Select a possession block, a schematic section, or a staging row
            </Text>
          </div>
        ) : (
          <VStack gap={3}>
            <VStack gap={1}>
              <DetailRow
                label="Window"
                value={`${formatMin(selected.possession.startMin)} – ${formatMin(selected.possession.startMin + selected.possession.durationMin)}`}
                sub={`${formatDuration(selected.possession.durationMin)} window · ${formatDuration(selected.possession.requiredMin)} work required`}
              />
              <DetailRow
                label="Section"
                value={`${selected.possession.sectionId} · ${SECTION_BY_ID.get(selected.possession.sectionId)?.name ?? ''}`}
                sub={`${SECTION_BY_ID.get(selected.possession.sectionId)?.lines ?? ''} · ${SECTION_BY_ID.get(selected.possession.sectionId)?.chainage ?? ''}`}
              />
              <DetailRow label="Protection" value={selected.possession.protection} />
              {selected.possession.isolation != null ? (
                <DetailRow label="Isolation" value={selected.possession.isolation} />
              ) : null}
              {/* Utilization: required work vs window length — recomputes as
                  the header times do, since duration is fixed. */}
              <div className="rmw-detailrow">
                <span className="rmw-sectionlabel rmw-detaillabel">Utilization</span>
                <StackItem size="fill">
                  <VStack gap={1}>
                    <div
                      className="rmw-utilbar"
                      role="img"
                      aria-label={`Work occupies ${Math.round((selected.possession.requiredMin / selected.possession.durationMin) * 100)} percent of the window`}>
                      <span
                        className="rmw-utilfill"
                        style={{width: `${Math.min((selected.possession.requiredMin / selected.possession.durationMin) * 100, 100)}%`}}
                      />
                    </div>
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      {Math.round((selected.possession.requiredMin / selected.possession.durationMin) * 100)}% of window ·{' '}
                      {formatDuration(selected.possession.durationMin - selected.possession.requiredMin)} contingency
                    </Text>
                  </VStack>
                </StackItem>
              </div>
            </VStack>
            <Divider />
            {/* Nudge group — the pointer path for the signature interaction
                (arrow keys on the block are the keyboard path). */}
            <VStack gap={1}>
              <span className="rmw-sectionlabel">Shift window (15-minute steps)</span>
              <div className="rmw-nudgegroup">
                <Button
                  label="Shift 15 minutes earlier"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ChevronLeftIcon} size="sm" />}
                  onClick={() => onShift(selected.possession.id, -SHIFT_STEP)}
                />
                <span className="rmw-mono" style={{minWidth: 96, textAlign: 'center'}}>
                  {formatMin(selected.possession.startMin)} – {formatMin(selected.possession.startMin + selected.possession.durationMin)}
                </span>
                <Button
                  label="Shift 15 minutes later"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ChevronRightIcon} size="sm" />}
                  onClick={() => onShift(selected.possession.id, SHIFT_STEP)}
                />
              </div>
            </VStack>
            {/* Conflicts + hand-back — observable consequences, re-derived. */}
            {selected.conflicts.length > 0 ? (
              <VStack gap={1}>
                <span className="rmw-sectionlabel">Train conflicts</span>
                {selected.conflicts.map(hit => (
                  <div key={`${hit.trainId}-${hit.passStart}`} className="rmw-conflictrow">
                    <Icon icon={TrainFrontIcon} size="xsm" color="inherit" />
                    <span className="rmw-mono" style={{color: 'inherit'}}>{hit.trainId}</span>
                    <Text type="supporting" size="xsm" color="inherit" maxLines={1}>
                      {formatMin(hit.passStart)}–{formatMin(hit.passEnd)} · {hit.trainLabel}
                      {hit.locked ? ' · path locked' : ''}
                    </Text>
                  </div>
                ))}
                <Text type="supporting" size="xsm" color="secondary">
                  Locked paths cannot flex — shift this window clear of the pass.
                </Text>
              </VStack>
            ) : (
              <HStack gap={2} vAlign="center">
                <StatusDot variant="success" label="No train conflicts" />
                <Text type="supporting" size="xsm" color="secondary">
                  No train conflicts in this window
                </Text>
              </HStack>
            )}
            {selected.handback != null ? (
              <HStack gap={2} vAlign="center">
                <Clock3Icon
                  size={12}
                  strokeWidth={2.5}
                  aria-hidden
                  style={{color: selected.handbackRisk ? WARN : 'var(--color-text-secondary)', flexShrink: 0}}
                />
                <Text type="supporting" size="xsm" color={selected.handbackRisk ? 'primary' : 'secondary'} hasTabularNumbers>
                  Hand-back {formatMin(selected.possession.startMin + selected.possession.durationMin)} · next train{' '}
                  {selected.handback.trainId} at {formatMin(selected.handback.at)} · margin {selected.handback.margin}m
                  {selected.handbackRisk ? ` (below ${HANDBACK_RULE_MIN}m rule)` : ''}
                </Text>
              </HStack>
            ) : null}
            <Divider />
            {/* Crew card for the selected possession. */}
            <VStack gap={1}>
              <span className="rmw-sectionlabel">Worksite crew</span>
              <DetailRow label="PICOP" value={selected.possession.crew.picop} sub={`ES ${selected.possession.crew.es}`} />
              <DetailRow
                label="Report"
                value={`${formatMin(selected.reportMin)} · ${selected.possession.crew.stagingPoint}`}
                sub={`${selected.possession.crew.headcount} staff · ${selected.possession.crew.plant}`}
              />
            </VStack>
            <Divider />
            <StagingList derived={derived} selectedId={selected.possession.id} lastShiftedId={lastShiftedId} onSelect={onSelect} />
          </VStack>
        )}
        {selected == null ? (
          <StagingList derived={derived} selectedId={null} lastShiftedId={lastShiftedId} onSelect={onSelect} />
        ) : null}
      </div>
      <div className="rmw-asidefooter">
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {derived.length} possessions · {totalHeadcount} staff on shift
        </Text>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. The ONLY mutable domain state is
// possessions[].startMin (plus selection); conflicts, hand-back margins,
// header chips, schematic paint and staging order are all re-derived from
// it in the same render, so a shift from ANY surface (block arrow keys,
// aside nudge buttons) moves every dependent surface at once.
// ---------------------------------------------------------------------------

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

export default function RailMaintenanceWindowTemplate() {
  // Responsive bands measured on the VIEW ROOT container, not the viewport
  // (see the responsive contract in the header comment). Width 0 = first
  // pre-observer frame; viewport queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1179px)');
  const isViewportNarrow = useMediaQuery('(max-width: 979px)');
  const isMid = viewWidth > 0 ? viewWidth < 1180 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 980 : isViewportNarrow;

  const asideW = isMid && !isNarrow ? 300 : 320;
  const railW = isNarrow ? 120 : isMid ? 144 : 168;
  // px/min fills the board width, clamped 0.72–1.30. At the canonical
  // 1045px demo width: (1045 − 300 − 144 − 12) / 720 ≈ 0.82 — all 720
  // minutes fit with zero horizontal scroll.
  const boardW = isNarrow ? viewWidth : Math.max(viewWidth - asideW, 0);
  const rawPxPerMin = boardW > 0 ? (boardW - railW - GUTTER) / AXIS_MINUTES : 0.82;
  const pxPerMin = Math.min(Math.max(rawPxPerMin, 0.72), 1.3);

  const geometry: BoardGeometry = {
    railW,
    pxPerMin,
    showLaneSub: !isNarrow,
    compactBlocks: isNarrow,
  };

  // ---- THE single state owner ---------------------------------------------
  const [possessions, setPossessions] = useState<Possession[]>(INITIAL_POSSESSIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastShiftedId, setLastShiftedId] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const blockRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerBlockRef = useCallback(
    (id: string) => (el: HTMLButtonElement | null) => {
      const map = blockRefs.current;
      if (el == null) map.delete(id);
      else map.set(id, el);
    },
    [],
  );

  // Derived world — recomputed every render from the single store. The
  // header chips, schematic, board badges, aside and staging order all read
  // from THIS array, so one shift moves every surface.
  const derived = possessions.map(derivePossession);
  const derivedById = new Map(derived.map(d => [d.possession.id, d]));
  const conflictCount = derived.reduce((sum, d) => sum + d.conflicts.length, 0);
  const handbackRiskCount = derived.filter(d => d.handbackRisk).length;
  const selected = selectedId != null ? (derivedById.get(selectedId) ?? null) : null;

  const selectPossession = useCallback((id: string) => {
    setSelectedId(id);
    setOverlayOpen(true);
  }, []);

  // The signature interaction. Functional setState; clamps keep the window
  // on the 20:00–08:00 axis. The announcement reports the post-shift
  // conflict/margin state so screen readers hear the consequence, not just
  // the movement.
  const shiftPossession = useCallback((id: string, deltaMin: number) => {
    setPossessions(prev => {
      const target = prev.find(p => p.id === id);
      if (target == null) return prev;
      const nextStart = Math.min(
        Math.max(target.startMin + deltaMin, 0),
        AXIS_MINUTES - target.durationMin,
      );
      if (nextStart === target.startMin) return prev;
      const next = prev.map(p => (p.id === id ? {...p, startMin: nextStart} : p));
      const nextDerived = derivePossession({...target, startMin: nextStart});
      const conflictNote =
        nextDerived.conflicts.length > 0
          ? `${nextDerived.conflicts.length} train conflict${nextDerived.conflicts.length === 1 ? '' : 's'} (${nextDerived.conflicts.map(c => c.trainId).join(', ')})`
          : 'no train conflicts';
      const marginNote =
        nextDerived.handback != null
          ? `, hand-back margin ${nextDerived.handback.margin} minutes`
          : '';
      setAnnouncement(
        `${id} shifted to ${formatMin(nextStart)}–${formatMin(nextStart + target.durationMin)}: ${conflictNote}${marginNote}. Crew report ${formatMin(nextStart - REPORT_LEAD_MIN)}.`,
      );
      return next;
    });
    setSelectedId(id);
    setLastShiftedId(id);
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    if (selectedId != null) blockRefs.current.get(selectedId)?.focus();
  }, [selectedId]);

  // Escape layering: overlay aside first, then selection. Never fires while
  // typing (no inputs on this page, but the guard is the house pattern).
  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || isTypingTarget(event.target)) return;
    if (isNarrow && overlayOpen) {
      closeOverlay();
    } else if (selectedId != null) {
      setSelectedId(null);
    }
  };

  const asideVisible = !isNarrow || overlayOpen;

  return (
    <div className={SCOPE} onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <span aria-live="polite" role="status" className="rmw-visuallyhidden">
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div className="rmw-header">
              {/* Top-left corner: Trackside mark + corridor label. */}
              <span className="rmw-logo">
                <TracksideMark />
              </span>
              <Text type="label" size="sm">
                Trackside
              </Text>
              <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                North Vale corridor · possession plan · Sat 18 Jul 2026, 22:00 → 08:00
              </Text>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: derived risk chips + plan-frozen note +
                  planner avatar. Chips are shape+count, not color alone. */}
              <Tooltip content="Train passes overlapping a possession window">
                <span className={`rmw-chip${conflictCount > 0 ? ' rmw-chip-danger' : ''}`}>
                  <TriangleAlertIcon size={12} strokeWidth={2.5} aria-hidden />
                  {conflictCount} conflict{conflictCount === 1 ? '' : 's'}
                </span>
              </Tooltip>
              <Tooltip content={`Hand-back margins under ${HANDBACK_RULE_MIN} minutes`}>
                <span className={`rmw-chip${handbackRiskCount > 0 ? ' rmw-chip-warn' : ''}`}>
                  <Clock3Icon size={12} strokeWidth={2.5} aria-hidden />
                  {handbackRiskCount} hand-back
                </span>
              </Tooltip>
              {isMid ? null : (
                <HStack gap={2} vAlign="center">
                  <StatusDot variant="success" label="Plan status" />
                  <Text type="supporting" size="xsm" color="secondary">
                    Plan frozen T-12h
                  </Text>
                </HStack>
              )}
              <Avatar name={PLANNER.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} className="rmw-viewroot">
              <div className="rmw-maincol">
                <CorridorSchematic derived={derived} selectedId={selectedId} onSelectPossession={selectPossession} />
                <BoardScrollport>
                  <PossessionBoard
                    derivedRows={derived}
                    selectedId={selectedId}
                    geometry={geometry}
                    onSelect={selectPossession}
                    onShift={shiftPossession}
                    registerRef={registerBlockRef}
                  />
                </BoardScrollport>
                <LegendStrip />
              </div>
              {asideVisible ? (
                <AsidePanel
                  isOverlay={isNarrow}
                  width={asideW}
                  derived={derived}
                  selected={selected}
                  lastShiftedId={lastShiftedId}
                  onClose={closeOverlay}
                  onSelect={selectPossession}
                  onShift={shiftPossession}
                />
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
