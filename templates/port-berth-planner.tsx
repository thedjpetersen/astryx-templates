// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Quayside berth plan for Anselm
 *   Bay Container Terminal, plan window Thu 16 Jul 2026 06:00 → Sun 19 Jul
 *   2026 06:00 (72 h). The time axis is integer minutes 0..4320 measured
 *   from Thu 06:00; every displayed time is pure arithmetic on those
 *   integers (no clock reads, no randomness, no timers, no network
 *   assets). The tide is a literal 73-point hourly height table (m above
 *   chart datum, min 1.3 / max 6.3) interpolated linearly between hours.
 *   World: 4 berths (B1 15.2 m CD … B4 10.5 m CD), 6 quay cranes QC1–QC6
 *   (QC3 rail-shared by B1/B2, QC4 by B2/B3), 6 vessels — 5 alongside,
 *   1 at anchorage. Vessel work is derived, never typed: alongside hours
 *   = ceil(moves / (28 lifts·h⁻¹ × gangs)) + 2 h lines/lashing, so
 *   MV Corsten Reach 1,840 mv / 3 gangs → 22 + 2 = 24 h (ETB Thu 08:00 →
 *   ETD Fri 08:00), MV Baltic Merit 1,120 / 2 → 20 + 2 = 22 h, Arna
 *   Trader 420 / 1 → 15 + 2 = 17 h, Meridian Voyager 1,510 / 2 → 27 + 2
 *   = 29 h, Sable Wind 610 / 1 → 22 + 2 = 24 h. Pro-forma deltas sum to
 *   +4 h 00 m at load (60 + 0 + 60 + 60 + 60 min). Pre-seeded and visible
 *   before any interaction: exactly ONE violation — MV Baltic Merit
 *   (13.3 m draft) grounding risk at B3: low water 1.3 m gives
 *   12.6 + 1.3 = 13.9 m of water against 13.3 + 0.8 m UKC = 14.1 m
 *   required. All aggregates re-derive from the vessel store at render.
 * @output Port Berth Planner — a berth planner's working surface: a
 *   berths-by-hours Gantt (vessel blocks as shiftable buttons, quay-crane
 *   chips on each block) drawn over a tide-curve underlay strip whose
 *   dashed threshold line re-anchors to the selected vessel's required
 *   sailing tide, an anchorage strip for waiting arrivals, and an aside
 *   with vessel particulars, ±1 h window nudges, crane gang toggles,
 *   berth reassignment with per-berth fit notes, and a live violation
 *   list. The signature interaction: shifting or reassigning a vessel —
 *   or toggling a crane, which re-derives the alongside duration itself —
 *   recomputes grounding and sailing-tide violations, crane
 *   double-bookings, berth overlaps, and the pro-forma delay stat across
 *   the header, the blocks, the tide strip and the aside in one render.
 * @position Page template; emitted by `astryx template port-berth-planner`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 48px (Quayside mark + terminal label | violations chip +
 *   pro-forma delay chip + planner avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (anchorage strip 48px > board scroller with sticky
 *       28px ruler + 64px tide strip + 68px berth lanes > legend 30px)
 *     | aside 340px (vessel detail > berth roster), own scroll.
 * Container policy: app-shell archetype — frame strips, lanes and panels
 *   only; no Cards. Blocks, chips and roster rows are styled
 *   divs/buttons on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (BRAND = light-dark(#1E3A8A, #93C5FD), harbor navy) used exactly
 *   twice: the Quayside logo SVG and the selected vessel block's 2px
 *   outline — both fills/strokes, never text. Contrast math: #1E3A8A on
 *   #FFFFFF ≈ 10.3:1; #93C5FD on #1E1E1E ≈ 9.4:1 (fills only). State
 *   colors ride the data-viz categorical vars with repo-standard
 *   light-dark fallbacks; every violation pairs an icon glyph channel
 *   (anchor = grounding, wave = sailing tide, crane frame =
 *   double-booking, ship = berth overlap) with its color, never color
 *   alone.
 *
 * FIXED DENSITY GRID (verbatim, repeated in code): header bar 48px;
 * anchorage strip 48px; time ruler 28px; tide strip 64px; berth lanes
 * 68px; vessel blocks 52px tall; berth label rail 140px (152px wide
 * band, 120px narrow); aside 340px (320px mid); crane chips 28px;
 * roster rows 44px; legend strip 30px; single gutter token GUTTER = 12
 * (all padding/margins are GUTTER or GUTTER/2 = 6); mono metadata 12px;
 * body text 13px; section labels 11px uppercase tracking 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 * ResizeObserver (the demo stage is ~1045–1075px inside a 1440px window,
 * so viewport media queries would lie there; a viewport query covers only
 * the first pre-observer frame):
 * - W >= 1180: aside 340px, label rail 152px, px/h fills the remaining
 *   width (clamped 8–14).
 * - 980 <= W < 1180 (canonical demo band): aside 320px, label rail 140px,
 *   px/h ≈ 8 at 1045px so all 72 hours fit the scroller with zero
 *   horizontal scroll (140 + 72×8 = 716 ≤ 725) — subtraction, not
 *   squeeze; ruler labels thin to every 6 h.
 * - W < 980: the aside leaves the flex flow and becomes a 340px absolute
 *   overlay (right 0, shadow, opens on selection, X / Escape closes and
 *   restores focus to the triggering block); label rail 120px, berth code
 *   + depth only; block labels drop to voyage code + violation badges.
 *   The board horizontal-scrolls at the 8 px/h floor with the label rail
 *   sticky-left INSIDE the scroller; whenever hours remain off-screen
 *   right, a gradient fade + chevron sits on a NON-scrolling wrapper (a
 *   fade on the scroller would scroll away with the content).
 * Corner map: top-left Quayside mark + terminal label; top-right
 * violations chip + delay chip + planner avatar; bottom-left legend
 * strip; bottom-right aside footer (pro-forma delay roll-up).
 * Fixture policy: fixed strings and integer minutes only. ETDs, delay
 * totals, violations, and the tide threshold line are derived live from
 * the single vessel store in the same render — the @input cross-checks
 * above hold at load and after every shift, toggle, or reassignment.
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
  AnchorIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ConstructionIcon,
  ShipIcon,
  TriangleAlertIcon,
  WavesIcon,
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
// (dark side shifted to the lighter 300-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (harbor navy). Exactly two usages: the
// Quayside logo SVG and the selected vessel block's 2px outline. Both are
// fills/strokes, never text. #1E3A8A on #FFF ≈ 10.3:1; #93C5FD on #1E1E1E
// ≈ 9.4:1.
const BRAND = 'light-dark(#1E3A8A, #93C5FD)';

// Violation danger: #DC2626 on white = 4.5:1, #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Crane / schedule warning: #B45309 on white = 4.6:1, #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'light-dark(#B45309, #FBBF24)';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Tide curve + water annotations.
const TIDE_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const TIDE_FILL = 'light-dark(rgba(1, 113, 227, 0.10), rgba(76, 158, 255, 0.14))';
// Vessel block fill — steel family so the brand navy stays quarantined.
// #475569 on white = 7.4:1; #94A3B8 on #1E1E1E = 7.0:1.
const VESSEL = 'light-dark(#475569, #94A3B8)';
const VESSEL_SOFT = 'light-dark(rgba(71, 85, 105, 0.10), rgba(148, 163, 184, 0.16))';
// Violation hatch stripe over a vessel block.
const HATCH_DANGER = 'light-dark(rgba(220, 38, 38, 0.30), rgba(248, 113, 113, 0.34))';

// Single gutter token — all padding/margins on this page are GUTTER or
// GUTTER/2 = 6 (density grid law).
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Scope class — every TEMPLATE_CSS selector below is prefixed with it.
const SCOPE = 'tpl-port-berth-planner';
const S = `.${SCOPE}`;

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all page CSS lives here, every selector prefixed with the
// scope class. Transitions animate color/opacity/box-shadow only; the
// violation pulse collapses to a static badge under prefers-reduced-motion.
// FIXED DENSITY GRID repeated: header 48px, anchorage 48px, ruler 28px,
// tide strip 64px, lanes 68px, blocks 52px, label rail 152/140/120px,
// aside 340/320px, crane chips 28px, roster rows 44px, legend 30px,
// gutter 12.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
${S} { height: 100dvh; width: 100%; font-family: var(--font-family-sans); }
${S} .pbp-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
${S} .pbp-fade { transition: opacity 160ms ease, background-color 160ms ease, box-shadow 160ms ease; }
${S} .pbp-header {
  display: flex; align-items: center; gap: ${GUTTER}px;
  height: 48px; padding: 0 ${GUTTER}px;
}
${S} .pbp-logo { display: inline-flex; align-items: center; flex-shrink: 0; }
${S} .pbp-mono {
  font-family: ${MONO}; font-size: 12px;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
${S} .pbp-sectionlabel {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-secondary); white-space: nowrap;
}
${S} .pbp-chip {
  display: inline-flex; align-items: center; gap: 6px;
  height: 24px; padding: 0 8px; border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap;
  color: var(--color-text-primary);
}
${S} .pbp-chip-danger { border-color: ${DANGER}; background: ${DANGER_SOFT}; color: ${DANGER}; }
${S} .pbp-chip-warn { border-color: ${WARN}; background: ${WARN_SOFT}; color: ${WARN}; }
${S} .pbp-viewroot {
  display: flex; height: 100%; min-height: 0;
  overflow: hidden; position: relative;
}
${S} .pbp-maincol { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
/* Anchorage strip 48px — waiting arrivals as dashed chips. */
${S} .pbp-anchorage {
  display: flex; align-items: center; gap: ${GUTTER}px; height: 48px;
  padding: 0 ${GUTTER}px; flex-shrink: 0; overflow: hidden;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-anchorchip {
  appearance: none; display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 10px; border-radius: 999px;
  border: 1.5px dashed ${VESSEL}; background: transparent;
  font-family: inherit; font-size: 12px; color: var(--color-text-primary);
  cursor: pointer; white-space: nowrap;
}
${S} .pbp-anchorchip[aria-pressed="true"] { background: ${VESSEL_SOFT}; }
/* Non-scrolling wrapper that owns the right-edge overflow affordance — the
   fade must NOT live on the scroller itself or it scrolls away with the
   content. */
${S} .pbp-boardviewport { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
${S} .pbp-scroller { flex: 1; min-height: 0; overflow: auto; position: relative; }
${S} .pbp-scrollhint {
  position: absolute; top: 0; right: 0; bottom: 0; width: 44px; z-index: 5;
  pointer-events: none; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 3px;
  background: linear-gradient(to right, transparent, var(--color-background) 72%);
}
/* Time ruler 28px — sticky above tide strip + lanes inside the scroller. */
${S} .pbp-ruler {
  position: sticky; top: 0; z-index: 3; display: flex; height: 28px;
  background: var(--color-background);
}
${S} .pbp-rulerlabelcell {
  position: sticky; left: 0; z-index: 4; flex-shrink: 0;
  display: flex; align-items: flex-end; padding: 0 ${GUTTER}px 4px;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-rulertrack {
  position: relative; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-hourtick {
  position: absolute; top: 16px; bottom: 0;
  border-left: var(--border-width) solid var(--color-border);
}
${S} .pbp-hourlabel {
  position: absolute; top: 2px; transform: translateX(-50%);
  font-family: ${MONO}; font-size: 10px; font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary); white-space: nowrap;
}
/* Tide strip 64px — the curve underlay row. */
${S} .pbp-tiderow { display: flex; align-items: stretch; height: 64px; }
${S} .pbp-tidelabel {
  position: sticky; left: 0; z-index: 2; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center; gap: 1px;
  padding: 0 ${GUTTER}px; overflow: hidden;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-tidetrack {
  position: relative; flex-shrink: 0; overflow: hidden;
  border-bottom: var(--border-width) solid var(--color-border);
}
/* Berth lanes 68px. */
${S} .pbp-lane { display: flex; align-items: stretch; height: 68px; }
${S} .pbp-lanelabel {
  position: sticky; left: 0; z-index: 2; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center; gap: 1px;
  padding: 0 ${GUTTER}px; overflow: hidden;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-lanelabel-name {
  font-size: 12px; font-weight: 600; color: var(--color-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
${S} .pbp-lanelabel-sub {
  font-size: 10px; color: var(--color-text-secondary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
${S} .pbp-lanetrack {
  position: relative; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-lanegrid {
  position: absolute; top: 0; bottom: 0;
  border-left: var(--border-width) solid var(--color-border);
  opacity: 0.5; pointer-events: none;
}
/* Vessel block — a real button, 52px tall, centered in the 68px lane. */
${S} .pbp-block {
  position: absolute; top: 8px; height: 52px;
  appearance: none; border: none; margin: 0;
  display: flex; flex-direction: column; align-items: flex-start;
  justify-content: center; gap: 2px;
  padding: 0 8px; border-radius: 6px;
  background: ${VESSEL_SOFT};
  box-shadow: inset 0 0 0 1px ${VESSEL};
  font-family: inherit; font-size: 12px; color: var(--color-text-primary);
  cursor: pointer; overflow: hidden; white-space: nowrap; text-align: left;
}
${S} .pbp-block:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
/* BRAND usage 2 of 2: the selected block's 2px harbor-navy outline. */
${S} .pbp-block-selected { box-shadow: inset 0 0 0 2px ${BRAND}; }
${S} .pbp-block-violation {
  background-image: repeating-linear-gradient(45deg, ${HATCH_DANGER} 0px, ${HATCH_DANGER} 2px, transparent 2px, transparent 9px);
  box-shadow: inset 0 0 0 1px ${DANGER};
}
${S} .pbp-block-selected.pbp-block-violation { box-shadow: inset 0 0 0 2px ${BRAND}, inset 0 0 0 3px ${DANGER}; }
${S} .pbp-blockline { display: flex; align-items: center; gap: 6px; max-width: 100%; }
${S} .pbp-blockname {
  overflow: hidden; text-overflow: ellipsis; min-width: 0; font-weight: 600;
}
${S} .pbp-cranetag {
  display: inline-flex; align-items: center; height: 14px; padding: 0 4px;
  border-radius: 3px; flex-shrink: 0;
  border: var(--border-width) solid var(--color-border);
  font-family: ${MONO}; font-size: 9px; color: var(--color-text-secondary);
}
${S} .pbp-cranetag-clash { border-color: ${WARN}; color: ${WARN}; background: ${WARN_SOFT}; }
${S} .pbp-badge {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-family: ${MONO}; font-size: 10px; font-variant-numeric: tabular-nums;
}
${S} .pbp-badge-danger { color: ${DANGER}; }
${S} .pbp-badge-warn { color: ${WARN}; }
@keyframes pbp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
${S} .pbp-pulse { animation: pbp-pulse 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  ${S} .pbp-pulse { animation: none; }
  ${S} .pbp-fade { transition: none; }
}
/* Legend strip 30px. */
${S} .pbp-legend {
  display: flex; align-items: center; gap: ${GUTTER}px; height: 30px;
  padding: 0 ${GUTTER}px; overflow: hidden; flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
}
${S} .pbp-legendkey { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
/* Aside 340px (320 mid; 340 overlay under 980). */
${S} .pbp-aside {
  flex: none; display: flex; flex-direction: column; min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
${S} .pbp-aside-overlay {
  position: absolute; top: 0; right: 0; bottom: 0; width: 340px; z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
${S} .pbp-asidehead {
  display: flex; align-items: center; gap: ${GUTTER}px; height: 56px;
  padding: 0 ${GUTTER}px; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${S} .pbp-asidescroll { flex: 1; min-height: 0; overflow-y: auto; padding: ${GUTTER}px; }
${S} .pbp-asidefooter {
  display: flex; align-items: center; height: 32px; flex-shrink: 0;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
}
${S} .pbp-detailrow { display: flex; align-items: center; gap: ${GUTTER}px; min-height: 32px; }
${S} .pbp-detaillabel { width: 84px; flex-shrink: 0; }
${S} .pbp-nudgegroup { display: inline-flex; align-items: center; gap: 6px; height: 40px; }
/* Crane toggle chips 28px — real buttons with aria-pressed. */
${S} .pbp-cranebtn {
  appearance: none; display: inline-flex; align-items: center; gap: 4px;
  height: 28px; padding: 0 10px; border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent; font-family: ${MONO}; font-size: 11px;
  color: var(--color-text-primary); cursor: pointer; white-space: nowrap;
}
${S} .pbp-cranebtn[aria-pressed="true"] {
  background: ${VESSEL_SOFT}; border-color: ${VESSEL}; font-weight: 600;
}
${S} .pbp-cranebtn-clash { border-color: ${WARN}; color: ${WARN}; background: ${WARN_SOFT}; }
/* Berth reassign rows — 44px buttons with fit notes. */
${S} .pbp-berthbtn {
  appearance: none; display: flex; align-items: center; gap: ${GUTTER / 2}px;
  width: 100%; min-height: 44px; padding: 0 ${GUTTER / 2}px;
  border-radius: var(--radius-container);
  border: var(--border-width) solid var(--color-border);
  background: transparent; font-family: inherit; font-size: 12px;
  color: var(--color-text-primary); cursor: pointer; text-align: left;
}
${S} .pbp-berthbtn[aria-pressed="true"] { background: var(--color-background-muted); border-color: ${VESSEL}; }
${S} .pbp-berthbtn:disabled { cursor: not-allowed; opacity: 0.55; }
${S} .pbp-violationrow {
  display: flex; align-items: center; gap: 6px; min-height: 32px;
  padding: 0 ${GUTTER / 2}px; border-radius: var(--radius-container);
  background: ${DANGER_SOFT}; color: ${DANGER}; overflow: hidden;
}
${S} .pbp-violationrow-warn { background: ${WARN_SOFT}; color: ${WARN}; }
/* Berth roster rows 44px. */
${S} .pbp-rosterrow {
  display: flex; align-items: center; gap: ${GUTTER / 2}px; min-height: 44px;
  padding: 0 ${GUTTER / 2}px; border-radius: var(--radius-container);
}
${S} .pbp-rosterrow-active { background: var(--color-background-muted); }
${S} .pbp-emptystate {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: ${GUTTER / 2}px; padding: ${GUTTER * 2}px;
  text-align: center;
}
${S} .pbp-visuallyhidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
`;

// ---------------------------------------------------------------------------
// TIME MODEL — the axis is integer minutes 0..4320 measured from Thu 16 Jul
// 2026 06:00. formatMin is pure arithmetic on that integer; no clock reads
// anywhere on this page.
// ---------------------------------------------------------------------------

const AXIS_START_HOUR = 6; // min 0 == Thu 06:00
const AXIS_MINUTES = 4320; // 72 h → Sun 06:00
const SHIFT_STEP = 60; // signature-interaction nudge step, minutes
const DAY_NAMES = ['Thu', 'Fri', 'Sat', 'Sun'];

function formatMin(min: number): string {
  const total = AXIS_START_HOUR * 60 + min;
  const day = DAY_NAMES[Math.floor(total / 1440)] ?? 'Sun';
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${day} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatClock(min: number): string {
  const total = AXIS_START_HOUR * 60 + min;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDelta(min: number): string {
  const sign = min > 0 ? '+' : min < 0 ? '−' : '±';
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}h ${String(m).padStart(2, '0')}m`;
}

// ---------------------------------------------------------------------------
// TIDE — literal 73-point hourly height table, m above chart datum, index =
// hours after Thu 06:00. Semidiurnal, springs: HW ≈ 6.2–6.3 m, LW 1.3–1.5 m
// (overall min 1.3 at h8/h58/h70, max 6.3 at h14/h27/h39/h52/h64).
// heightAt() interpolates linearly between the hourly points — pure
// arithmetic, no clock.
// ---------------------------------------------------------------------------

const TIDE_HEIGHTS: number[] = [
  4.2, 5.4, 6.2, 6.0, 5.1, 3.9, 2.7, 1.8, 1.3, 1.5, 2.3, 3.5, // h0–h11
  4.7, 5.7, 6.3, 6.1, 5.3, 4.1, 2.9, 1.9, 1.4, 1.4, 2.0, 3.1, // h12–h23
  4.3, 5.3, 5.9, 6.3, 5.9, 5.2, 4.2, 3.0, 1.9, 1.4, 1.6, 2.4, // h24–h35
  3.6, 4.8, 5.8, 6.3, 6.2, 5.4, 4.2, 3.0, 2.0, 1.5, 1.4, 2.1, // h36–h47
  3.2, 4.4, 5.4, 6.1, 6.3, 5.8, 4.8, 3.6, 2.4, 1.6, 1.3, 1.6, // h48–h59
  2.5, 3.7, 4.9, 5.9, 6.3, 6.1, 5.2, 4.0, 2.8, 1.8, 1.3, 1.5, // h60–h71
  2.3, // h72
];

function tideAt(min: number): number {
  const h = Math.min(Math.max(min / 60, 0), 72);
  const i = Math.floor(h);
  const frac = h - i;
  const a = TIDE_HEIGHTS[i] ?? TIDE_HEIGHTS[TIDE_HEIGHTS.length - 1];
  const b = TIDE_HEIGHTS[Math.min(i + 1, TIDE_HEIGHTS.length - 1)] ?? a;
  return a + (b - a) * frac;
}

/** Minimum hourly tide across [startMin, endMin] — hourly samples plus the
 * two endpoints, which is exact for a piecewise-linear curve. */
function minTideOver(startMin: number, endMin: number): number {
  let min = Math.min(tideAt(startMin), tideAt(endMin));
  const firstHour = Math.ceil(startMin / 60);
  const lastHour = Math.floor(endMin / 60);
  for (let h = firstHour; h <= lastHour; h += 1) {
    const v = TIDE_HEIGHTS[Math.min(Math.max(h, 0), 72)];
    if (v != null && v < min) min = v;
  }
  return min;
}

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Anselm Bay Container Terminal, plan window
// Thu 16 Jul → Sun 19 Jul 2026. Signed-in user: berth planner Marta
// Oyelaran ("MO"). Berths, cranes and vessels are referenced by identity
// consts, never retyped.
// ---------------------------------------------------------------------------

const B1 = 'B1';
const B2 = 'B2';
const B3 = 'B3';
const B4 = 'B4';
const V_CORSTEN = 'V-CORSTEN';
const V_BALTIC = 'V-BALTIC';
const V_ARNA = 'V-ARNA';
const V_MERIDIAN = 'V-MERIDIAN';
const V_SABLE = 'V-SABLE';
const V_PELAGIA = 'V-PELAGIA';

const PLANNER = {name: 'Marta Oyelaran', initials: 'MO'};

// UKC rule at berth: water (berth depth + tide) must cover draft + 0.8 m.
const UKC_BERTH_M = 0.8;
// Sailing rule: the approach channel is dredged to 12.4 m CD; departure
// needs tide ≥ draft + 1.0 − 12.4 at the ETD instant.
const CHANNEL_DEPTH_M = 12.4;
const UKC_CHANNEL_M = 1.0;
// Crane productivity model: 28 lifts/h per gang, +2 h lines/lashing.
const LIFTS_PER_GANG_HOUR = 28;
const LINES_LASHING_HOURS = 2;

interface Berth {
  id: string;
  name: string;
  depthM: number; // at chart datum
  loaMaxM: number;
  craneIds: string[]; // rail-mounted reach — QC3 shared B1/B2, QC4 B2/B3
}

const BERTHS: Berth[] = [
  {id: B1, name: 'Berth 1 · Deepwater', depthM: 15.2, loaMaxM: 330, craneIds: ['QC1', 'QC2', 'QC3']},
  {id: B2, name: 'Berth 2 · Main quay', depthM: 14.4, loaMaxM: 300, craneIds: ['QC3', 'QC4']},
  {id: B3, name: 'Berth 3 · Main quay', depthM: 12.6, loaMaxM: 260, craneIds: ['QC4', 'QC5']},
  {id: B4, name: 'Berth 4 · Feeder', depthM: 10.5, loaMaxM: 185, craneIds: ['QC6']},
];

const BERTH_BY_ID = new Map(BERTHS.map(b => [b.id, b]));

interface Vessel {
  id: string;
  name: string;
  voyage: string; // service + voyage code, e.g. 'AEX-4 · 026W'
  imo: string;
  loaM: number;
  beamM: number;
  draftM: number; // sailing draft
  moves: number; // container moves — duration derives from this
  berthId: string | null; // null = at anchorage
  etbMin: number; // for anchorage vessels this is the ETA off the fairway
  proFormaEtdMin: number;
  craneIds: string[]; // assigned gangs, only from the berth's crane set
  requestedGangs: number; // planning figure shown while unassigned
  cargoNote: string;
}

// 'MV Meridian Voyager Atlantic Express' (36 chars) is the block-label and
// roster truncation stress. Durations derive from moves — see the @input
// arithmetic. Baltic Merit at B3 is the pre-seeded grounding violation.
const INITIAL_VESSELS: Vessel[] = [
  {
    id: V_CORSTEN, name: 'MV Corsten Reach', voyage: 'AEX-4 · 026W', imo: '9743218',
    loaM: 294, beamM: 40.0, draftM: 13.6, moves: 1840,
    berthId: B1, etbMin: 120, proFormaEtdMin: 1500,
    craneIds: ['QC1', 'QC2', 'QC3'], requestedGangs: 3,
    cargoNote: '412 reefers · 18 OOG flats aft',
  },
  {
    id: V_BALTIC, name: 'MV Baltic Merit', voyage: 'NSX-2 · 114E', imo: '9587412',
    loaM: 252, beamM: 35.2, draftM: 13.3, moves: 1120,
    berthId: B3, etbMin: 240, proFormaEtdMin: 1560,
    craneIds: ['QC4', 'QC5'], requestedGangs: 2,
    cargoNote: 'Laden import leg · deep sailing draft',
  },
  {
    id: V_ARNA, name: 'MV Arna Trader', voyage: 'FDR-9 · 891N', imo: '9412776',
    loaM: 168, beamM: 27.2, draftM: 8.9, moves: 420,
    berthId: B4, etbMin: 300, proFormaEtdMin: 1260,
    craneIds: ['QC6'], requestedGangs: 1,
    cargoNote: 'Feeder relay to Skarven Sund',
  },
  {
    id: V_MERIDIAN, name: 'MV Meridian Voyager Atlantic Express', voyage: 'AEX-4 · 027W', imo: '9812043',
    loaM: 289, beamM: 42.8, draftM: 12.1, moves: 1510,
    berthId: B2, etbMin: 1620, proFormaEtdMin: 3300,
    craneIds: ['QC3', 'QC4'], requestedGangs: 2,
    cargoNote: '388 reefers · hazmat class 3 on deck',
  },
  {
    id: V_SABLE, name: 'MV Sable Wind', voyage: 'NSX-2 · 115W', imo: '9650327',
    loaM: 199, beamM: 30.4, draftM: 10.2, moves: 610,
    berthId: B1, etbMin: 1740, proFormaEtdMin: 3120,
    craneIds: ['QC1'], requestedGangs: 1,
    cargoNote: 'Export empties sweep · 84 flat racks',
  },
  {
    id: V_PELAGIA, name: 'MV Pelagia Dawn', voyage: 'MDS-7 · 442S', imo: '9705589',
    loaM: 228, beamM: 32.3, draftM: 11.8, moves: 940,
    berthId: null, etbMin: 1440, proFormaEtdMin: 2760,
    craneIds: [], requestedGangs: 2,
    cargoNote: 'At anchorage — awaiting berth assignment',
  },
];

// ---------------------------------------------------------------------------
// DERIVATIONS — ETD, violations and delay are pure functions of the vessel
// store + BERTHS + TIDE_HEIGHTS. Nothing is stored; the header chips, block
// hatches, tide threshold and aside list all re-derive every render.
// ---------------------------------------------------------------------------

function gangCount(vessel: Vessel): number {
  return vessel.berthId == null ? vessel.requestedGangs : vessel.craneIds.length;
}

/** Alongside duration in minutes: ceil(moves / (28 × gangs)) + 2 h. With no
 * crane assigned the math runs on 1 gang (and a no-crane violation flags). */
function durationMin(vessel: Vessel): number {
  const gangs = Math.max(gangCount(vessel), 1);
  const workHours = Math.ceil(vessel.moves / (LIFTS_PER_GANG_HOUR * gangs));
  return (workHours + LINES_LASHING_HOURS) * 60;
}

function etdMin(vessel: Vessel): number {
  return vessel.etbMin + durationMin(vessel);
}

type ViolationKind = 'grounding' | 'sailing-tide' | 'crane-double' | 'berth-overlap' | 'no-crane';

interface Violation {
  kind: ViolationKind;
  vesselId: string;
  message: string;
  severity: 'danger' | 'warn';
}

/** Every violation on the plan, derived in one pass. */
function deriveViolations(vessels: Vessel[]): Violation[] {
  const out: Violation[] = [];
  const assigned = vessels.filter(v => v.berthId != null);
  for (const vessel of assigned) {
    const berth = BERTH_BY_ID.get(vessel.berthId ?? '');
    if (berth == null) continue;
    const etb = vessel.etbMin;
    const etd = etdMin(vessel);
    // Grounding at berth: min water over the stay vs draft + UKC.
    const minWater = berth.depthM + minTideOver(etb, Math.min(etd, AXIS_MINUTES));
    const required = vessel.draftM + UKC_BERTH_M;
    if (minWater < required) {
      out.push({
        kind: 'grounding',
        vesselId: vessel.id,
        severity: 'danger',
        message: `Grounding risk at ${berth.id}: ${minWater.toFixed(1)} m water at low tide < ${required.toFixed(1)} m required (${vessel.draftM.toFixed(1)} m draft + ${UKC_BERTH_M.toFixed(1)} m UKC)`,
      });
    }
    // Sailing tide in the channel at the ETD instant.
    const neededTide = vessel.draftM + UKC_CHANNEL_M - CHANNEL_DEPTH_M;
    if (etd <= AXIS_MINUTES && neededTide > 0 && tideAt(etd) < neededTide) {
      out.push({
        kind: 'sailing-tide',
        vesselId: vessel.id,
        severity: 'danger',
        message: `Sailing tide: ${tideAt(etd).toFixed(1)} m at ETD ${formatMin(etd)} < ${neededTide.toFixed(1)} m needed for the 12.4 m channel`,
      });
    }
    // LOA over berth limit (kept as a flag; assignment refuses it up front).
    if (vessel.loaM > berth.loaMaxM) {
      out.push({
        kind: 'berth-overlap',
        vesselId: vessel.id,
        severity: 'danger',
        message: `LOA ${vessel.loaM} m exceeds ${berth.id} limit ${berth.loaMaxM} m`,
      });
    }
    if (vessel.craneIds.length === 0) {
      out.push({
        kind: 'no-crane',
        vesselId: vessel.id,
        severity: 'warn',
        message: `No crane gang assigned — schedule assumes 1 gang (${Math.ceil(vessel.moves / LIFTS_PER_GANG_HOUR) + LINES_LASHING_HOURS} h alongside)`,
      });
    }
  }
  // Pairwise: berth overlaps and crane double-bookings.
  for (let i = 0; i < assigned.length; i += 1) {
    for (let j = i + 1; j < assigned.length; j += 1) {
      const a = assigned[i];
      const b = assigned[j];
      const overlap = a.etbMin < etdMin(b) && etdMin(a) > b.etbMin;
      if (!overlap) continue;
      if (a.berthId === b.berthId) {
        out.push({
          kind: 'berth-overlap',
          vesselId: a.id,
          severity: 'danger',
          message: `${a.berthId} double-booked: ${a.name} and ${b.name} overlap ${formatMin(Math.max(a.etbMin, b.etbMin))}–${formatMin(Math.min(etdMin(a), etdMin(b)))}`,
        });
      }
      for (const crane of a.craneIds) {
        if (b.craneIds.includes(crane)) {
          out.push({
            kind: 'crane-double',
            vesselId: a.id,
            severity: 'warn',
            message: `${crane} double-booked: ${a.name} and ${b.name} overlap ${formatMin(Math.max(a.etbMin, b.etbMin))}–${formatMin(Math.min(etdMin(a), etdMin(b)))}`,
          });
        }
      }
    }
  }
  return out;
}

/** Cranes on this vessel that are double-booked (for chip styling). */
function clashedCranes(vessel: Vessel, vessels: Vessel[]): Set<string> {
  const clashed = new Set<string>();
  if (vessel.berthId == null) return clashed;
  for (const other of vessels) {
    if (other.id === vessel.id || other.berthId == null) continue;
    const overlap = vessel.etbMin < etdMin(other) && etdMin(vessel) > other.etbMin;
    if (!overlap) continue;
    for (const crane of vessel.craneIds) {
      if (other.craneIds.includes(crane)) clashed.add(crane);
    }
  }
  return clashed;
}

function vesselAriaLabel(vessel: Vessel, violations: Violation[]): string {
  const mine = violations.filter(v => v.vesselId === vessel.id);
  const parts = [
    `${vessel.name}, voyage ${vessel.voyage}`,
    vessel.berthId == null
      ? `at anchorage, ETA ${formatMin(vessel.etbMin)}`
      : `berth ${vessel.berthId}, alongside ${formatMin(vessel.etbMin)} to ${formatMin(etdMin(vessel))}`,
    `${vessel.moves} moves, ${gangCount(vessel)} gang${gangCount(vessel) === 1 ? '' : 's'}`,
  ];
  if (mine.length > 0) {
    parts.push(`${mine.length} violation${mine.length === 1 ? '' : 's'}: ${mine.map(v => v.kind).join(', ')}`);
  }
  if (vessel.berthId != null) {
    parts.push('arrow keys shift the window in 1 hour steps');
  }
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
// QUAYSIDE MARK — 24px inline SVG: a quay edge with two bollard dots and a
// rising tide arc. BRAND usage 1 of 2.
// ---------------------------------------------------------------------------

function QuaysideMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <path d="M3 8 H21" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" />
      <circle cx={8} cy={5} r={1.6} fill={BRAND} />
      <circle cx={16} cy={5} r={1.6} fill={BRAND} />
      <path d="M3 14 Q7.5 10.5 12 14 T21 14" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      <path d="M3 19 Q7.5 15.5 12 19 T21 19" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TideStrip — the 64px curve underlay: a filled polyline through all 73
// hourly points, HW/LW gridlines at 2/4/6 m, and — when a vessel is
// selected and tide-constrained — a dashed threshold line at its required
// sailing tide plus a marker at its ETD. The threshold re-anchors on every
// selection and the ETD marker moves on every shift/toggle: the strip is a
// consequence surface, not a decoration.
// ---------------------------------------------------------------------------

const TIDE_MAX_M = 7; // y-scale headroom above the 6.3 m spring high water

interface TideStripProps {
  trackW: number;
  pxPerHour: number;
  selected: Vessel | null;
}

function tideY(heightM: number): number {
  // 64px strip, 4px padding top and bottom.
  return 60 - (heightM / TIDE_MAX_M) * 56;
}

function TideStrip({trackW, pxPerHour, selected}: TideStripProps) {
  const points = TIDE_HEIGHTS.map((h, i) => `${(i * pxPerHour).toFixed(1)},${tideY(h).toFixed(1)}`);
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${trackW},64 L0,64 Z`;
  const neededTide =
    selected != null && selected.berthId != null
      ? selected.draftM + UKC_CHANNEL_M - CHANNEL_DEPTH_M
      : 0;
  const showThreshold = neededTide > 0;
  const selectedEtd = selected != null && selected.berthId != null ? etdMin(selected) : null;
  const ariaLine =
    `Tide curve, ${TIDE_HEIGHTS.length} hourly heights from 1.3 to 6.3 metres above chart datum` +
    (showThreshold && selected != null
      ? `. ${selected.name} needs at least ${neededTide.toFixed(1)} metres to sail the channel`
      : '');
  return (
    <svg width={trackW} height={64} viewBox={`0 0 ${trackW} 64`} role="img" aria-label={ariaLine} style={{display: 'block'}}>
      {[2, 4, 6].map(m => (
        <g key={m}>
          <line x1={0} y1={tideY(m)} x2={trackW} y2={tideY(m)} stroke="var(--color-border)" strokeWidth={1} opacity={0.5} />
          <text x={2} y={tideY(m) - 2} fontSize={8} fontFamily={'ui-monospace, monospace'} fill="var(--color-text-secondary)">
            {m}m
          </text>
        </g>
      ))}
      <path d={areaPath} fill={TIDE_FILL} stroke="none" />
      <path d={linePath} fill="none" stroke={TIDE_BLUE} strokeWidth={1.5} />
      {showThreshold ? (
        <>
          <line
            x1={0}
            y1={tideY(neededTide)}
            x2={trackW}
            y2={tideY(neededTide)}
            stroke={DANGER}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <text
            x={4}
            y={tideY(neededTide) + 10}
            fontSize={9}
            fontFamily={'ui-monospace, monospace'}
            fill={DANGER}>
            {`sail ≥ ${neededTide.toFixed(1)}m`}
          </text>
        </>
      ) : null}
      {selectedEtd != null && selectedEtd <= AXIS_MINUTES ? (
        <>
          <line
            x1={(selectedEtd / 60) * pxPerHour}
            y1={4}
            x2={(selectedEtd / 60) * pxPerHour}
            y2={60}
            stroke={VESSEL}
            strokeWidth={1.5}
            strokeDasharray="2 3"
          />
          <circle
            cx={(selectedEtd / 60) * pxPerHour}
            cy={tideY(tideAt(selectedEtd))}
            r={3}
            fill={showThreshold && tideAt(selectedEtd) < neededTide ? DANGER : TIDE_BLUE}
          />
        </>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// VesselBlock — the signature-interaction surface: a real <button>, 52px
// tall, absolutely positioned on its berth lane at etb·px/min. Arrow keys
// shift the window ±60 min (the owner clamps to the axis); Enter/Space
// selects. Two content lines: name + violation badges, then the mono
// window + crane tags (clashed tags restyle amber). Badge glyphs are the
// violation-kind channel: anchor = grounding, wave = sailing tide, crane
// frame = double-booking, ship = berth overlap.
// ---------------------------------------------------------------------------

const VIOLATION_GLYPH: Record<ViolationKind, typeof AnchorIcon> = {
  grounding: AnchorIcon,
  'sailing-tide': WavesIcon,
  'crane-double': ConstructionIcon,
  'berth-overlap': ShipIcon,
  'no-crane': ConstructionIcon,
};

interface VesselBlockProps {
  vessel: Vessel;
  violations: Violation[];
  clashed: Set<string>;
  pxPerMin: number;
  isSelected: boolean;
  compact: boolean;
  onSelect: (id: string) => void;
  onShift: (id: string, deltaMin: number) => void;
  registerRef: (id: string) => (el: HTMLButtonElement | null) => void;
}

function VesselBlock({vessel, violations, clashed, pxPerMin, isSelected, compact, onSelect, onShift, registerRef}: VesselBlockProps) {
  const mine = violations.filter(v => v.vesselId === vessel.id);
  const hasDanger = mine.some(v => v.severity === 'danger');
  const etd = etdMin(vessel);
  const classes = [
    'pbp-block',
    'pbp-fade',
    isSelected ? 'pbp-block-selected' : '',
    hasDanger ? 'pbp-block-violation' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const kinds = Array.from(new Set(mine.map(v => v.kind)));
  return (
    <button
      type="button"
      ref={registerRef(vessel.id)}
      className={classes}
      style={{left: vessel.etbMin * pxPerMin, width: Math.max((etd - vessel.etbMin) * pxPerMin, 64)}}
      aria-pressed={isSelected}
      aria-label={vesselAriaLabel(vessel, violations)}
      onClick={() => onSelect(vessel.id)}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onShift(vessel.id, -SHIFT_STEP);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          onShift(vessel.id, SHIFT_STEP);
        }
      }}>
      <span className="pbp-blockline">
        <span className="pbp-blockname">{compact ? vessel.voyage : vessel.name}</span>
        {kinds.map(kind => {
          const Glyph = VIOLATION_GLYPH[kind];
          const danger = kind === 'grounding' || kind === 'sailing-tide' || kind === 'berth-overlap';
          return (
            <span
              key={kind}
              className={`pbp-badge ${danger ? 'pbp-badge-danger' : 'pbp-badge-warn'}${danger && !isSelected ? ' pbp-pulse' : ''}`}
              aria-hidden>
              <Glyph size={11} strokeWidth={2.5} />
            </span>
          );
        })}
      </span>
      {compact ? null : (
        <span className="pbp-blockline">
          <span className="pbp-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
            {formatClock(vessel.etbMin)}–{formatClock(etd)} · {vessel.moves.toLocaleString('en-US')} mv
          </span>
          {vessel.craneIds.map(crane => (
            <span key={crane} className={`pbp-cranetag${clashed.has(crane) ? ' pbp-cranetag-clash' : ''}`} aria-hidden>
              {crane}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// BerthBoard — berths × hours over the tide strip. ONE scroller owns the
// sticky 28px ruler, the sticky-left label rail, the tide row and the four
// lanes so rows can never misalign. Gridlines repeat every 6 h on ruler and
// lanes from the same hour math; day boundaries carry the day name.
// ---------------------------------------------------------------------------

interface BoardGeometry {
  railW: number;
  pxPerHour: number;
  showLaneSub: boolean;
  compactBlocks: boolean;
}

interface BerthBoardProps {
  vessels: Vessel[];
  violations: Violation[];
  selectedId: string | null;
  geometry: BoardGeometry;
  onSelect: (id: string) => void;
  onShift: (id: string, deltaMin: number) => void;
  registerRef: (id: string) => (el: HTMLButtonElement | null) => void;
}

const RULER_HOURS = Array.from({length: 72 / 3 + 1}, (_, i) => i * 3); // ticks every 3 h

function BerthBoard({vessels, violations, selectedId, geometry, onSelect, onShift, registerRef}: BerthBoardProps) {
  const {railW, pxPerHour, showLaneSub, compactBlocks} = geometry;
  const trackW = 72 * pxPerHour;
  const pxPerMin = pxPerHour / 60;
  const selected = vessels.find(v => v.id === selectedId) ?? null;

  return (
    <div style={{width: 'max-content', minWidth: '100%'}}>
      <div className="pbp-ruler" style={{width: railW + trackW}}>
        <div className="pbp-rulerlabelcell" style={{width: railW}}>
          <span className="pbp-sectionlabel">Berths</span>
        </div>
        <div className="pbp-rulertrack" style={{width: trackW}}>
          {RULER_HOURS.map(h => {
            const min = h * 60;
            const isDayStart = (h + AXIS_START_HOUR) % 24 === 0; // 00:00 boundaries
            const showLabel = h % 6 === 0;
            return (
              <span key={h}>
                <span className="pbp-hourtick" style={{left: h * pxPerHour, top: isDayStart ? 10 : 16}} aria-hidden />
                {showLabel ? (
                  <span
                    className="pbp-hourlabel"
                    style={
                      h === 0
                        ? {left: 2, transform: 'none'}
                        : h === 72
                          ? {left: trackW - 2, transform: 'translateX(-100%)'}
                          : {left: h * pxPerHour}
                    }>
                    {isDayStart ? formatMin(min).slice(0, 3) : formatClock(min)}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
      <div className="pbp-tiderow" style={{width: railW + trackW}}>
        <div className="pbp-tidelabel" style={{width: railW}}>
          <span className="pbp-sectionlabel">Tide</span>
          <span className="pbp-lanelabel-sub">m above CD · LW 1.3 / HW 6.3</span>
        </div>
        <div className="pbp-tidetrack" style={{width: trackW}}>
          <TideStrip trackW={trackW} pxPerHour={pxPerHour} selected={selected} />
        </div>
      </div>
      {BERTHS.map(berth => {
        const laneVessels = vessels.filter(v => v.berthId === berth.id);
        const occupancy =
          laneVessels.length === 0
            ? 'clear'
            : laneVessels.map(v => `${v.name} ${formatMin(v.etbMin)} to ${formatMin(etdMin(v))}`).join('; ');
        return (
          <div key={berth.id} className="pbp-lane" style={{width: railW + trackW}}>
            <div className="pbp-lanelabel" style={{width: railW}}>
              <span className="pbp-lanelabel-name">{showLaneSub ? berth.name : berth.id}</span>
              <span className="pbp-lanelabel-sub">
                {berth.depthM.toFixed(1)} m CD · LOA ≤ {berth.loaMaxM} m
              </span>
              {showLaneSub ? (
                <span className="pbp-lanelabel-sub">{berth.craneIds.join(' · ')}</span>
              ) : null}
            </div>
            <div
              className="pbp-lanetrack"
              style={{width: trackW}}
              role="group"
              aria-label={`${berth.name}, ${berth.depthM.toFixed(1)} metres at chart datum. ${occupancy}`}>
              {RULER_HOURS.map(h =>
                h % 6 === 0 && h !== 0 && h !== 72 ? (
                  <span key={h} className="pbp-lanegrid" style={{left: h * pxPerHour}} aria-hidden />
                ) : null,
              )}
              {laneVessels.map(vessel => (
                <VesselBlock
                  key={vessel.id}
                  vessel={vessel}
                  violations={violations}
                  clashed={clashedCranes(vessel, vessels)}
                  pxPerMin={pxPerMin}
                  isSelected={selectedId === vessel.id}
                  compact={compactBlocks}
                  onSelect={onSelect}
                  onShift={onShift}
                  registerRef={registerRef}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BoardScrollport — non-scrolling wrapper around the board scroller. When
// hours remain off-screen right, it overlays a right-edge gradient fade +
// chevron so a clipped Sunday can never read as the end of the plan. The
// affordance lives on THIS wrapper, not the scroller — a fade on the scroll
// container would scroll away with the content. At the canonical demo band
// all 72 hours fit (140 + 72×8 = 716px) and the hint never renders.
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
    <div className="pbp-boardviewport">
      <div ref={scrollerRef} className="pbp-scroller" onScroll={updateOverflow}>
        {children}
      </div>
      {canScrollRight ? (
        <div className="pbp-scrollhint" aria-hidden>
          <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LegendStrip — 30px key for block, tide and violation-glyph encodings.
// Bottom-left corner owner.
// ---------------------------------------------------------------------------

function LegendStrip() {
  return (
    <div className="pbp-legend" aria-label="Board encoding legend">
      <span className="pbp-legendkey">
        <span
          aria-hidden
          style={{
            width: 18,
            height: 10,
            borderRadius: 3,
            background: VESSEL_SOFT,
            boxShadow: `inset 0 0 0 1px ${VESSEL}`,
          }}
        />
        <Text type="supporting" size="xsm" color="secondary">
          Vessel alongside
        </Text>
      </span>
      <span className="pbp-legendkey">
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
          Violation
        </Text>
      </span>
      <span className="pbp-legendkey">
        <AnchorIcon size={11} strokeWidth={2.5} aria-hidden style={{color: DANGER}} />
        <Text type="supporting" size="xsm" color="secondary">
          Grounding
        </Text>
      </span>
      <span className="pbp-legendkey">
        <WavesIcon size={11} strokeWidth={2.5} aria-hidden style={{color: DANGER}} />
        <Text type="supporting" size="xsm" color="secondary">
          Sailing tide
        </Text>
      </span>
      <span className="pbp-legendkey">
        <ConstructionIcon size={11} strokeWidth={2.5} aria-hidden style={{color: WARN}} />
        <Text type="supporting" size="xsm" color="secondary">
          Crane clash
        </Text>
      </span>
      <span className="pbp-legendkey">
        <svg width={20} height={10} viewBox="0 0 20 10" aria-hidden>
          <path d="M0 8 Q5 1 10 5 T20 4" fill="none" stroke={TIDE_BLUE} strokeWidth={1.5} />
        </svg>
        <Text type="supporting" size="xsm" color="secondary">
          Tide (m CD)
        </Text>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnchorageStrip — 48px strip of dashed chips for vessels waiting off the
// fairway. Selecting a chip opens the aside's berth-assignment panel; the
// strip empties as vessels land on the board (the chip's disappearance IS
// the observable consequence of an assignment).
// ---------------------------------------------------------------------------

interface AnchorageStripProps {
  waiting: Vessel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function AnchorageStrip({waiting, selectedId, onSelect}: AnchorageStripProps) {
  return (
    <div className="pbp-anchorage">
      <span className="pbp-sectionlabel">Anchorage</span>
      {waiting.length === 0 ? (
        <Text type="supporting" size="xsm" color="secondary">
          Clear — every arrival has a berth
        </Text>
      ) : (
        waiting.map(vessel => (
          <button
            key={vessel.id}
            type="button"
            className="pbp-anchorchip pbp-focusable pbp-fade"
            aria-pressed={selectedId === vessel.id}
            aria-label={`${vessel.name}, waiting at anchorage, ETA ${formatMin(vessel.etbMin)} — open berth assignment`}
            onClick={() => onSelect(vessel.id)}>
            <AnchorIcon size={12} strokeWidth={2.5} aria-hidden />
            <span className="pbp-mono">{vessel.voyage}</span>
            {vessel.name}
            <span className="pbp-mono" style={{color: 'var(--color-text-secondary)'}}>
              ETA {formatClock(vessel.etbMin)}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AsidePanel — vessel particulars, window nudges, crane gang toggles, berth
// reassignment with per-berth fit notes, the vessel's violation list, and
// the berth roster. Empty state until first selection. Bottom-right corner
// owner: the pro-forma delay roll-up footer.
// ---------------------------------------------------------------------------

function DetailRow({label, value, sub}: {label: string; value: string; sub?: string}) {
  return (
    <div className="pbp-detailrow">
      <span className="pbp-sectionlabel pbp-detaillabel">{label}</span>
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

/** Fit summary for one candidate berth × vessel — powers the reassign rows. */
function berthFitNote(berth: Berth, vessel: Vessel, vessels: Vessel[]): {ok: boolean; refused: boolean; note: string} {
  if (vessel.loaM > berth.loaMaxM) {
    return {ok: false, refused: true, note: `LOA ${vessel.loaM} m > ${berth.loaMaxM} m limit — refused`};
  }
  const minWater = berth.depthM + 1.3; // overall LW of the plan window
  const required = vessel.draftM + UKC_BERTH_M;
  const draftNote =
    minWater < required
      ? `${(required - minWater).toFixed(1)} m short at LW`
      : `${(minWater - required).toFixed(1)} m spare at LW`;
  const occupant = vessels.find(
    v =>
      v.id !== vessel.id &&
      v.berthId === berth.id &&
      vessel.etbMin < etdMin(v) &&
      vessel.etbMin + durationMin(vessel) > v.etbMin,
  );
  const occupancyNote = occupant != null ? ` · overlaps ${occupant.name}` : '';
  return {ok: minWater >= required && occupant == null, refused: false, note: `${draftNote}${occupancyNote}`};
}

interface AsidePanelProps {
  isOverlay: boolean;
  width: number;
  vessels: Vessel[];
  violations: Violation[];
  selected: Vessel | null;
  totalDelayMin: number;
  onClose: () => void;
  onSelect: (id: string) => void;
  onShift: (id: string, deltaMin: number) => void;
  onToggleCrane: (id: string, craneId: string) => void;
  onAssignBerth: (id: string, berthId: string) => void;
}

function AsidePanel({
  isOverlay,
  width,
  vessels,
  violations,
  selected,
  totalDelayMin,
  onClose,
  onSelect,
  onShift,
  onToggleCrane,
  onAssignBerth,
}: AsidePanelProps) {
  const mine = selected != null ? violations.filter(v => v.vesselId === selected.id) : [];
  const berth = selected?.berthId != null ? BERTH_BY_ID.get(selected.berthId) : undefined;
  const clashed = selected != null ? clashedCranes(selected, vessels) : new Set<string>();
  const alongside = vessels.filter(v => v.berthId != null).sort((a, b) => a.etbMin - b.etbMin);

  return (
    <aside
      className={`pbp-aside${isOverlay ? ' pbp-aside-overlay' : ''}`}
      style={isOverlay ? undefined : {width}}
      aria-label="Vessel detail and berth roster">
      <div className="pbp-asidehead">
        {selected == null ? (
          <Heading level={2}>Berth plan</Heading>
        ) : (
          <StackItem size="fill">
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <span className="pbp-mono">{selected.voyage}</span>
                <span style={{flexShrink: 0}}>
                  <Token
                    size="sm"
                    color={selected.berthId == null ? 'gray' : mine.some(v => v.severity === 'danger') ? 'red' : 'green'}
                    label={selected.berthId == null ? 'anchorage' : selected.berthId}
                  />
                </span>
              </HStack>
              <Heading level={2} maxLines={1}>
                {selected.name}
              </Heading>
            </VStack>
          </StackItem>
        )}
        {isOverlay ? (
          <Button
            label="Close vessel detail"
            isIconOnly
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className="pbp-asidescroll">
        {selected == null ? (
          <div className="pbp-emptystate">
            <Icon icon={ShipIcon} size="lg" color="secondary" />
            <Heading level={3}>Nothing selected</Heading>
            <Text type="supporting" size="sm" color="secondary">
              Select a vessel block or an anchorage chip
            </Text>
          </div>
        ) : (
          <VStack gap={3}>
            <VStack gap={1}>
              <DetailRow
                label="Particulars"
                value={`LOA ${selected.loaM.toFixed(0)} m · beam ${selected.beamM.toFixed(1)} m · draft ${selected.draftM.toFixed(1)} m`}
                sub={`IMO ${selected.imo} · ${selected.cargoNote}`}
              />
              <DetailRow
                label="Workload"
                value={`${selected.moves.toLocaleString('en-US')} moves · ${gangCount(selected)} gang${gangCount(selected) === 1 ? '' : 's'}`}
                sub={`ceil(${selected.moves} / (28 × ${Math.max(gangCount(selected), 1)})) + 2 h lashing = ${durationMin(selected) / 60} h alongside`}
              />
              {selected.berthId == null ? (
                <DetailRow label="ETA" value={formatMin(selected.etbMin)} sub="Off the fairway — assign a berth below" />
              ) : (
                <DetailRow
                  label="Window"
                  value={`${formatMin(selected.etbMin)} → ${formatMin(etdMin(selected))}`}
                  sub={`Pro-forma ETD ${formatMin(selected.proFormaEtdMin)} · ${formatDelta(etdMin(selected) - selected.proFormaEtdMin)}`}
                />
              )}
            </VStack>
            {selected.berthId != null ? (
              <>
                <Divider />
                {/* Nudge group — the pointer path for the signature
                    interaction (arrow keys on the block are the keyboard
                    path). */}
                <VStack gap={1}>
                  <span className="pbp-sectionlabel">Shift window (1-hour steps)</span>
                  <div className="pbp-nudgegroup">
                    <Button
                      label="Shift 1 hour earlier"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={ChevronLeftIcon} size="sm" />}
                      onClick={() => onShift(selected.id, -SHIFT_STEP)}
                    />
                    <span className="pbp-mono" style={{minWidth: 128, textAlign: 'center'}}>
                      {formatClock(selected.etbMin)} – {formatClock(etdMin(selected))}
                    </span>
                    <Button
                      label="Shift 1 hour later"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={ChevronRightIcon} size="sm" />}
                      onClick={() => onShift(selected.id, SHIFT_STEP)}
                    />
                  </div>
                </VStack>
                {/* Crane gang toggles — toggling re-derives the alongside
                    duration, so the block WIDTH and ETD move with it. */}
                {berth != null ? (
                  <VStack gap={1}>
                    <span className="pbp-sectionlabel">Crane gangs — {berth.id} rail</span>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      {berth.craneIds.map(craneId => {
                        const assignedHere = selected.craneIds.includes(craneId);
                        return (
                          <button
                            key={craneId}
                            type="button"
                            className={`pbp-cranebtn pbp-focusable pbp-fade${clashed.has(craneId) ? ' pbp-cranebtn-clash' : ''}`}
                            aria-pressed={assignedHere}
                            aria-label={`${craneId} ${assignedHere ? 'assigned — remove gang' : 'available — add gang'}${clashed.has(craneId) ? ', double-booked' : ''}`}
                            onClick={() => onToggleCrane(selected.id, craneId)}>
                            <ConstructionIcon size={12} strokeWidth={2.5} aria-hidden />
                            {craneId}
                          </button>
                        );
                      })}
                    </HStack>
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      {gangCount(selected)} gang{gangCount(selected) === 1 ? '' : 's'} → {durationMin(selected) / 60} h alongside · ETD{' '}
                      {formatMin(etdMin(selected))}
                    </Text>
                  </VStack>
                ) : null}
              </>
            ) : null}
            <Divider />
            {/* Berth assignment — per-berth fit notes; LOA violations refuse
                up front, everything else lands and flags. */}
            <VStack gap={1}>
              <span className="pbp-sectionlabel">
                {selected.berthId == null ? 'Assign berth' : 'Reassign berth'}
              </span>
              {BERTHS.map(candidate => {
                const fit = berthFitNote(candidate, selected, vessels);
                const isCurrent = selected.berthId === candidate.id;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    className="pbp-berthbtn pbp-focusable pbp-fade"
                    aria-pressed={isCurrent}
                    disabled={fit.refused}
                    aria-label={`${candidate.name}: ${fit.refused ? fit.note : `${fit.note}${isCurrent ? ', current berth' : ''}`}`}
                    onClick={() => onAssignBerth(selected.id, candidate.id)}>
                    <span className="pbp-mono" style={{width: 24, flexShrink: 0}}>{candidate.id}</span>
                    <StackItem size="fill">
                      <VStack gap={0}>
                        <Text type="body" size="sm" maxLines={1}>
                          {candidate.name} · {candidate.depthM.toFixed(1)} m
                        </Text>
                        <Text type="supporting" size="xsm" color="secondary" maxLines={1} hasTabularNumbers>
                          {fit.note}
                        </Text>
                      </VStack>
                    </StackItem>
                    {isCurrent ? (
                      <span style={{flexShrink: 0}}>
                        <Token size="sm" color="blue" label="current" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </VStack>
            <Divider />
            {/* Violations — observable consequences, re-derived. */}
            {mine.length > 0 ? (
              <VStack gap={1}>
                <span className="pbp-sectionlabel">Violations</span>
                {mine.map((violation, index) => {
                  const Glyph = VIOLATION_GLYPH[violation.kind];
                  return (
                    <div
                      key={`${violation.kind}-${index}`}
                      className={`pbp-violationrow${violation.severity === 'warn' ? ' pbp-violationrow-warn' : ''}`}>
                      <Glyph size={12} strokeWidth={2.5} aria-hidden style={{flexShrink: 0}} />
                      <Text type="supporting" size="xsm" color="inherit" maxLines={2}>
                        {violation.message}
                      </Text>
                    </div>
                  );
                })}
              </VStack>
            ) : (
              <HStack gap={2} vAlign="center">
                <StatusDot variant="success" label="No violations" />
                <Text type="supporting" size="xsm" color="secondary">
                  No violations on this call
                </Text>
              </HStack>
            )}
            <Divider />
            {/* Berth roster — resequences as ETBs shift. */}
            <VStack gap={1}>
              <span className="pbp-sectionlabel">Berth roster — by ETB</span>
              <ol style={{listStyle: 'none', margin: 0, padding: 0}} aria-label="Alongside vessels in ETB order">
                {alongside.map(vessel => {
                  const isActive = selected.id === vessel.id;
                  const delta = etdMin(vessel) - vessel.proFormaEtdMin;
                  return (
                    <li key={vessel.id}>
                      <button
                        type="button"
                        className={`pbp-rosterrow pbp-focusable pbp-fade${isActive ? ' pbp-rosterrow-active' : ''}`}
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
                        onClick={() => onSelect(vessel.id)}>
                        <span className="pbp-mono" style={{width: 24, flexShrink: 0, color: 'var(--color-text-secondary)'}}>
                          {vessel.berthId}
                        </span>
                        <StackItem size="fill">
                          <VStack gap={0}>
                            <Text type="body" size="sm" maxLines={1}>
                              {vessel.name}
                            </Text>
                            <Text type="supporting" size="xsm" color="secondary" maxLines={1} hasTabularNumbers>
                              {formatMin(vessel.etbMin)} → {formatMin(etdMin(vessel))}
                            </Text>
                          </VStack>
                        </StackItem>
                        <span
                          className="pbp-mono"
                          style={{flexShrink: 0, color: delta > 0 ? WARN : 'var(--color-text-secondary)'}}>
                          {formatDelta(delta)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </VStack>
          </VStack>
        )}
      </div>
      <div className="pbp-asidefooter">
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          Σ {formatDelta(totalDelayMin)} vs pro-forma · {alongside.length} alongside
        </Text>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. The ONLY mutable domain state is the vessel
// store (etbMin / berthId / craneIds); ETDs, durations, violations, the
// delay stat, the tide threshold and the roster order all re-derive from it
// in the same render, so a mutation from ANY surface (block arrow keys,
// nudge buttons, crane toggles, berth buttons, anchorage chips) moves every
// dependent surface at once.
// ---------------------------------------------------------------------------

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

export default function PortBerthPlannerTemplate() {
  // Responsive bands measured on the VIEW ROOT container, not the viewport
  // (see the responsive contract in the header comment). Width 0 = first
  // pre-observer frame; viewport queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1179px)');
  const isViewportNarrow = useMediaQuery('(max-width: 979px)');
  const isMid = viewWidth > 0 ? viewWidth < 1180 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 980 : isViewportNarrow;

  const asideW = isMid && !isNarrow ? 320 : 340;
  const railW = isNarrow ? 120 : isMid ? 140 : 152;
  // px/h fills the board width, clamped 8–14. At the canonical 1045px demo
  // width: (1045 − 320 − 140 − 12) / 72 ≈ 8.0 — all 72 hours fit with zero
  // horizontal scroll.
  const boardW = isNarrow ? viewWidth : Math.max(viewWidth - asideW, 0);
  const rawPxPerHour = boardW > 0 ? (boardW - railW - GUTTER) / 72 : 8;
  const pxPerHour = Math.min(Math.max(rawPxPerHour, 8), 14);

  const geometry: BoardGeometry = {
    railW,
    pxPerHour,
    showLaneSub: !isNarrow,
    compactBlocks: isNarrow,
  };

  // ---- THE single state owner ---------------------------------------------
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  // Derived world — recomputed every render from the single store.
  const violations = deriveViolations(vessels);
  const dangerCount = violations.filter(v => v.severity === 'danger').length;
  const warnCount = violations.length - dangerCount;
  const totalDelayMin = vessels
    .filter(v => v.berthId != null)
    .reduce((sum, v) => sum + (etdMin(v) - v.proFormaEtdMin), 0);
  const waiting = vessels.filter(v => v.berthId == null);
  const selected = selectedId != null ? (vessels.find(v => v.id === selectedId) ?? null) : null;

  const selectVessel = useCallback((id: string) => {
    setSelectedId(id);
    setOverlayOpen(true);
  }, []);

  /** Announce the post-mutation consequence for one vessel. */
  const announceFor = useCallback((next: Vessel[], id: string, prefix: string) => {
    const vessel = next.find(v => v.id === id);
    if (vessel == null) return;
    const nextViolations = deriveViolations(next).filter(v => v.vesselId === id);
    const violationNote =
      nextViolations.length > 0
        ? `${nextViolations.length} violation${nextViolations.length === 1 ? '' : 's'}: ${nextViolations.map(v => v.kind).join(', ')}`
        : 'no violations';
    setAnnouncement(
      `${prefix} ${vessel.name}: ${formatMin(vessel.etbMin)} to ${formatMin(etdMin(vessel))}, ${violationNote}.`,
    );
  }, []);

  // Signature interaction 1: shift the window (blocks + nudge buttons).
  const shiftVessel = useCallback(
    (id: string, deltaMin: number) => {
      setVessels(prev => {
        const target = prev.find(v => v.id === id);
        if (target == null || target.berthId == null) return prev;
        const dur = durationMin(target);
        const nextEtb = Math.min(Math.max(target.etbMin + deltaMin, 0), AXIS_MINUTES - dur);
        if (nextEtb === target.etbMin) return prev;
        const next = prev.map(v => (v.id === id ? {...v, etbMin: nextEtb} : v));
        announceFor(next, id, 'Shifted');
        return next;
      });
      setSelectedId(id);
    },
    [announceFor],
  );

  // Signature interaction 2: crane gangs change the DURATION, so the block
  // width, ETD, delay stat and overlap math all move together.
  const toggleCrane = useCallback(
    (id: string, craneId: string) => {
      setVessels(prev => {
        const target = prev.find(v => v.id === id);
        if (target == null || target.berthId == null) return prev;
        const berth = BERTH_BY_ID.get(target.berthId);
        if (berth == null || !berth.craneIds.includes(craneId)) return prev;
        const craneIds = target.craneIds.includes(craneId)
          ? target.craneIds.filter(c => c !== craneId)
          : [...target.craneIds, craneId];
        const next = prev.map(v => (v.id === id ? {...v, craneIds} : v));
        announceFor(next, id, `${craneIds.length} gangs on`);
        return next;
      });
    },
    [announceFor],
  );

  // Signature interaction 3: berth assignment. LOA refusals never mutate —
  // the announcement carries the reason instead.
  const assignBerth = useCallback(
    (id: string, berthId: string) => {
      const berth = BERTH_BY_ID.get(berthId);
      setVessels(prev => {
        const target = prev.find(v => v.id === id);
        if (target == null || berth == null || target.berthId === berthId) return prev;
        if (target.loaM > berth.loaMaxM) {
          setAnnouncement(
            `Refused: ${target.name} LOA ${target.loaM} metres exceeds ${berth.id} limit ${berth.loaMaxM} metres.`,
          );
          return prev;
        }
        // Cranes carry over only where the new berth's rail reaches;
        // otherwise seed the requested gang count from the new rail.
        const kept = target.craneIds.filter(c => berth.craneIds.includes(c));
        const craneIds =
          kept.length > 0 ? kept : berth.craneIds.slice(0, Math.min(target.requestedGangs, berth.craneIds.length));
        const next = prev.map(v => (v.id === id ? {...v, berthId, craneIds} : v));
        announceFor(next, id, `Assigned to ${berth.id}:`);
        return next;
      });
      setSelectedId(id);
    },
    [announceFor],
  );

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    if (selectedId != null) blockRefs.current.get(selectedId)?.focus();
  }, [selectedId]);

  // Escape layering: overlay aside first, then selection.
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
      <span aria-live="polite" role="status" className="pbp-visuallyhidden">
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div className="pbp-header">
              {/* Top-left corner: Quayside mark + terminal label. */}
              <span className="pbp-logo">
                <QuaysideMark />
              </span>
              <Text type="label" size="sm">
                Quayside
              </Text>
              <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                Anselm Bay Container Terminal · berth plan · Thu 16 – Sun 19 Jul 2026
              </Text>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: derived violation + delay chips + planner
                  avatar. Chips pair count + glyph, never color alone. */}
              <Tooltip content="Grounding, sailing-tide, berth and crane violations across the plan">
                <span className={`pbp-chip${dangerCount > 0 ? ' pbp-chip-danger' : warnCount > 0 ? ' pbp-chip-warn' : ''}`}>
                  <TriangleAlertIcon size={12} strokeWidth={2.5} aria-hidden />
                  {violations.length} violation{violations.length === 1 ? '' : 's'}
                </span>
              </Tooltip>
              <Tooltip content="Total ETD delta vs the pro-forma schedule, alongside vessels">
                <span className={`pbp-chip${totalDelayMin > 0 ? ' pbp-chip-warn' : ''}`}>
                  <ShipIcon size={12} strokeWidth={2.5} aria-hidden />
                  {formatDelta(totalDelayMin)} vs pro-forma
                </span>
              </Tooltip>
              <Avatar name={PLANNER.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} className="pbp-viewroot">
              <div className="pbp-maincol">
                <AnchorageStrip waiting={waiting} selectedId={selectedId} onSelect={selectVessel} />
                <BoardScrollport>
                  <BerthBoard
                    vessels={vessels}
                    violations={violations}
                    selectedId={selectedId}
                    geometry={geometry}
                    onSelect={selectVessel}
                    onShift={shiftVessel}
                    registerRef={registerBlockRef}
                  />
                </BoardScrollport>
                <LegendStrip />
              </div>
              {asideVisible ? (
                <AsidePanel
                  isOverlay={isNarrow}
                  width={asideW}
                  vessels={vessels}
                  violations={violations}
                  selected={selected}
                  totalDelayMin={totalDelayMin}
                  onClose={closeOverlay}
                  onSelect={selectVessel}
                  onShift={shiftVessel}
                  onToggleCrane={toggleCrane}
                  onAssignBerth={assignBerth}
                />
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
