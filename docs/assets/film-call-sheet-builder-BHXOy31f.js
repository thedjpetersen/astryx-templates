var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Callslate strip board for the
 *   independent feature "NORTHLIGHT" (Gravel Road Pictures), board window
 *   shoot Days 14–16 (Wed 15 – Fri 17 Jul 2026). Suite "today" anchor:
 *   Mon 13 Jul 2026, 1st AD Priya Anand signed in. No clock reads, no
 *   randomness, no timers, no network assets — every time on screen is
 *   derived from minutes-since-midnight integers by a pure schedule
 *   builder. Seed arithmetic (re-verified by the builder at render):
 *   Day 14 (crew call 07:00, first shot +0:30, hard out 19:00) carries
 *   scenes 42+43+24+47+51+52 = 90+60+180+90+105+60 = 585m of setups plus
 *   TWO 45m company moves (Stage 3 → Millbrook Farm → Stage 3, both
 *   caused by Sc 24) plus a 60m lunch = 735m → est wrap 19:45, 45m past
 *   the hard out ✗; the first turnover past the 5h (300m) lunch target
 *   lands after Sc 24, which ends 6h15 (375m > 360m) into the day →
 *   meal-penalty risk on Sc 24 ✗. Sending Sc 24 to Day 15 re-derives
 *   BOTH columns: Day 14 becomes 405m + 60m lunch = 465m → wrap 15:15 ✓,
 *   lunch 13:15 ✓, pages 5 6/8 → 4 2/8; Day 15 (165+150+90 = 405m,
 *   wrap 15:15) absorbs it to 585m + 60m lunch = 645m → wrap 18:15 ✓
 *   (< 19:00 hard out), pages 4 4/8 → 6 0/8. Day 16 (crew call 06:30)
 *   runs 105+150+90 = 345m with NO lunch row (its last turnover, 255m,
 *   never reaches the 300m target) → wrap 12:45. Turnaround rule ≥ 11h
 *   (660m): Day 14 → Day 15 opens at 675m = 11h15 (tight pass, amber)
 *   and relaxes to 945m = 15h45 after the move. Pages are dual fields
 *   (label + eighths): Day 14 = 46/8 = 5 6/8, Day 15 = 36/8 = 4 4/8,
 *   Day 16 = 35/8 = 4 3/8.
 * @output Film Call Sheet Builder — a 1st AD's day-strip board: three
 *   DAY COLUMNS of production strips (56px real <button>s, 4px color
 *   edge by INT/EXT × DAY/NIGHT/DAWN in the industry strip-color idiom,
 *   with scene number, I/E·D/N tag, set name, cast numbers, page eighths,
 *   and est setup minutes) interleaved with DERIVED interstitial rows the
 *   AD cannot drag (45m company moves wherever adjacent strips change
 *   location, and the auto-placed 60m lunch row with its clock time,
 *   red-flagged when it lands past 6h); a derived CREW & CAST CALL TABLE
 *   in the rail (crew call / shooting call / lunch / est wrap / hard
 *   out, then per-cast pickup → HMU → on-set rows computed from each
 *   actor's first scene of the day and personal HMU duration); a SCENE
 *   DETAIL panel with within-day nudge and send-to-day controls; and a
 *   per-day PUBLISH GATE deriving three requirements live (wrap ≤ hard
 *   out · 0 meal-penalty risks · ≥ 11h turnaround into the next day).
 *   Signature move: sending a strip to another day reflows both columns'
 *   company moves and lunch rows, re-derives wrap clocks, page totals,
 *   cast call times, meal-penalty flags, and the publish gate in one
 *   render; publishing Day 14 locks its strips (every move affordance
 *   disables with a reason) and flips the header chip — one store, six
 *   surfaces.
 * @position Page template; emitted by \`astryx template
 *   film-call-sheet-builder\`
 *
 * Frame: root 100dvh div (scope class) wrapping Layout height="fill".
 *   LayoutHeader owns the Callslate chrome (clapper mark + production
 *   line | focus-day gate chip + AD avatar). LayoutContent padding={0}
 *   hosts a hand-rolled \`.fcs-frame\` CSS grid \`minmax(0,1fr) 376px\`
 *   (hand-rolled because the rail restacks via a media query, which DS
 *   grid inline styles would defeat). The main column is a grid
 *   \`minmax(0,1fr) auto\`: a scrolling 3-up board over a pinned 32px
 *   strip-color legend. The rail is a grid \`auto minmax(0,1fr) auto\`:
 *   scene detail · scrolling call table · publish gate — the gate never
 *   scrolls out from under the AD.
 *
 * Responsive contract (the inline demo stage is ~1045–1075px and viewport
 * media queries DO NOT fire there — the default layout must be right at
 * ~1045px with no breakpoint):
 * - Default desktop: main ≈ 669px beside the 376px rail; three day
 *   columns of (645 − 2×12)/3 ≈ 207px. Strips are engineered for 207px:
 *   set names truncate single-line (Sc 25's 61-char set is the stress
 *   fixture), cast numbers and page eighths keep their width, and the
 *   lock/penalty glyphs stay pinned at the strip's right edge.
 * - <=980px: \`.fcs-frame\` becomes one column; the rail follows the board
 *   full-width; the call table caps at 396px (11 × 36px rows) with its
 *   own scroll.
 * - <=640px (390px embed iframe): the board stacks to ONE day column per
 *   row (subtraction, not squeeze — columns never shrink below strip
 *   legibility) and the header drops the production subtitles; every
 *   strip keeps its ≥56px hit area.
 * Corner map: top-left Callslate mark + production identity; top-right
 * focus-day gate chip + AD avatar; bottom-left strip-color legend
 * (pinned under the board); bottom-right publish gate panel (pinned at
 * the rail's foot).
 *
 * Container policy (strip-board archetype): frame-first columns, strips,
 *   rails, and bordered panels — no marketing cards. Strips are real
 *   <button>s; derived rows are inert dashed rows; the call table is a
 *   dense 36px row grid.
 *
 * Color policy: token-pure chrome. ONE quarantined brand accent —
 *   Callslate yellow light-dark(#856A00, #F5D90A): #856A00 on #FFFFFF ≈
 *   5.1:1, #F5D90A on #1E1E1E ≈ 11.7:1 (both clear 4.5:1 as text); the
 *   EXT·DAY strip family deliberately rides the same yellow pair — the
 *   industry strip color IS the brand family. Other strip/state pairs,
 *   each with math at the declaration: INT·NIGHT blue light-dark(#1D4ED8,
 *   #93C5FD) ≈ 6.3:1 / 8.6:1; EXT·NIGHT green light-dark(#15803D,
 *   #4ADE80) ≈ 4.6:1 / 10.1:1; DAWN/DUSK violet light-dark(#7E22CE,
 *   #D8B4FE) ≈ 7.0:1 / 9.4:1; INT·DAY neutral (border + secondary text
 *   tokens); violation red light-dark(#B91C1C, #F87171) ≈ 5.9:1 / 6.9:1;
 *   caution amber light-dark(#B45309, #FBBF24) ≈ 4.6:1 / 11.7:1. Every
 *   state pairs with a non-color channel (the I/E·D/N text tag on each
 *   strip, dashed borders on derived rows, warning glyphs and words on
 *   every gate chip). NEVER the nonexistent bare text token — text
 *   tokens are --color-text-primary / --color-text-secondary throughout.
 *
 * Density grid (repeated verbatim in the CSS): header bar 48 · day
 *   column header 64 · scene strips 56 · strip color edge 4 · derived
 *   interstitial rows 24 · rail 376 · call-table rows 36 · gate chips
 *   26 · legend strip 32 · gutter var(--spacing-3) · 11px overlines ·
 *   tabular-nums on every clock, page count, and eighth.
 *
 * Fixture policy: ONE state owner (the \`board\` store: per-day scene-id
 *   order + publish lines). moveScene, nudgeScene, and publishDay are
 *   the only mutations; EVERYTHING else on screen — company moves,
 *   lunch placement, meal-penalty flags, wrap clocks, page totals, cast
 *   call times, turnaround margins, gate verdicts — is derived by the
 *   pure \`buildDaySchedule\` at render, so aggregates cross-check by
 *   construction and can never drift from the strips.
 */

import {useState} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  LockIcon,
  SendIcon,
  TriangleAlertIcon,
  TruckIcon,
  UtensilsIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// contrast math. ONE quarantined brand accent; strip/state families.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-film-call-sheet-builder';

// THE quarantined brand accent — Callslate yellow. #856A00 on #FFFFFF ≈
// 5.1:1; #F5D90A on #1E1E1E ≈ 11.7:1. The EXT·DAY strip family rides the
// same pair on purpose: the industry strip color IS the brand family.
const BRAND = 'light-dark(#856A00, #F5D90A)';
const BRAND_TINT = 'light-dark(rgba(133, 106, 0, 0.10), rgba(245, 217, 10, 0.13))';

// INT·NIGHT blue: #1D4ED8 on #FFF ≈ 6.3:1; #93C5FD on #1E1E1E ≈ 8.6:1.
const BLUE = 'light-dark(#1D4ED8, #93C5FD)';
const BLUE_TINT = 'light-dark(rgba(29, 78, 216, 0.09), rgba(147, 197, 253, 0.14))';
// EXT·NIGHT green: #15803D on #FFF ≈ 4.6:1; #4ADE80 on #1E1E1E ≈ 10.1:1.
const GREEN = 'light-dark(#15803D, #4ADE80)';
const GREEN_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// DAWN/DUSK violet: #7E22CE on #FFF ≈ 7.0:1; #D8B4FE on #1E1E1E ≈ 9.4:1.
const VIOLET = 'light-dark(#7E22CE, #D8B4FE)';
const VIOLET_TINT = 'light-dark(rgba(126, 34, 206, 0.08), rgba(216, 180, 254, 0.14))';
// Violation red (hard-out overrun, meal penalty, turnaround break):
// #B91C1C on #FFF ≈ 5.9:1; #F87171 on #1E1E1E ≈ 6.9:1.
const RED = 'light-dark(#B91C1C, #F87171)';
const RED_TINT = 'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';
// Caution amber (tight-but-passing margins): #B45309 on #FFF ≈ 4.6:1;
// #FBBF24 on #1E1E1E ≈ 11.7:1.
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors prefixed with the scope class. Density grid
// verbatim: header 48 · day header 64 · strips 56 · edge 4 · derived rows
// 24 · rail 376 · call rows 36 · gate chips 26 · legend 32 · gutter
// spacing-3.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} .fcs-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.\${SCOPE} .fcs-mono {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} button:focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: 1px;
}
.\${SCOPE} .fcs-fade {
  transition: background-color 160ms ease, border-color 160ms ease,
    color 160ms ease, opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .fcs-fade { transition: none; }
}

/* ---- Header bar 48px ---- */
.\${SCOPE} .fcs-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-height: 48px;
  min-width: 0;
}
.\${SCOPE} .fcs-brandCol { display: flex; flex-direction: column; min-width: 0; }
.\${SCOPE} .fcs-brandLine { display: flex; align-items: center; gap: 7px; min-width: 0; }
.\${SCOPE} .fcs-brandName { font-size: 14px; font-weight: 650; letter-spacing: 0.01em; }
.\${SCOPE} .fcs-brandProd {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .fcs-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .fcs-spring { flex: 1; }
.\${SCOPE} .fcs-headChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid transparent;
}
.\${SCOPE} .fcs-headChip.is-blocked { color: \${RED}; background: \${RED_TINT}; }
.\${SCOPE} .fcs-headChip.is-ready { color: \${GREEN}; background: \${GREEN_TINT}; }
.\${SCOPE} .fcs-headChip.is-published { color: \${BRAND}; background: \${BRAND_TINT}; }

/* ---- Frame: board + 376px rail. Hand-rolled grid so the <=980px restack
   is a real media query, not a squeezed flex row. ---- */
.\${SCOPE} .fcs-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 376px;
  height: 100%;
  min-height: 0;
}
.\${SCOPE} .fcs-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}
.\${SCOPE} .fcs-boardScroll {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
}
.\${SCOPE} .fcs-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-3);
  align-items: start;
}
.\${SCOPE} .fcs-rail {
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

/* ---- Day column ---- */
.\${SCOPE} .fcs-dayCol {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.\${SCOPE} .fcs-dayHead {
  min-height: 64px;
  padding: 8px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.\${SCOPE} .fcs-dayTitleRow { display: flex; align-items: center; gap: 6px; min-width: 0; }
.\${SCOPE} .fcs-dayName { font-size: 12px; font-weight: 700; white-space: nowrap; }
.\${SCOPE} .fcs-dayDate {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.\${SCOPE} .fcs-pubBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding-inline: 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 650;
  color: \${BRAND};
  background: \${BRAND_TINT};
  white-space: nowrap;
  flex-shrink: 0;
}
.\${SCOPE} .fcs-dayStatRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.\${SCOPE} .fcs-dayStat {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.\${SCOPE} .fcs-dayStat.is-bad { color: \${RED}; font-weight: 650; }
.\${SCOPE} .fcs-dayStat.is-tight { color: \${AMBER}; font-weight: 650; }
.\${SCOPE} .fcs-dayBody {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 6px;
  min-width: 0;
}

/* ---- Scene strip (56px, real button, 4px color edge) ---- */
.\${SCOPE} .fcs-strip {
  font: inherit;
  color: inherit;
  text-align: left;
  margin: 0;
  cursor: pointer;
  min-height: 56px;
  padding: 6px 8px 6px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
}
.\${SCOPE} .fcs-stripEdge {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 6px 0 0 6px;
}
.\${SCOPE} .fcs-strip.is-selected {
  border-color: \${BRAND};
  box-shadow: inset 0 0 0 1px \${BRAND};
  background: \${BRAND_TINT};
}
@media (hover: hover) {
  .\${SCOPE} .fcs-strip:hover { background: var(--color-background-muted); }
  .\${SCOPE} .fcs-strip.is-selected:hover { background: \${BRAND_TINT}; }
}
.\${SCOPE} .fcs-stripTop { display: flex; align-items: center; gap: 6px; min-width: 0; }
.\${SCOPE} .fcs-sceneNum {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.\${SCOPE} .fcs-ieTag {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding-inline: 5px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}
.\${SCOPE} .fcs-stripSet {
  font-size: 11px;
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.\${SCOPE} .fcs-stripMeta {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .fcs-stripCast {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.\${SCOPE} .fcs-stripPages { white-space: nowrap; flex-shrink: 0; }
.\${SCOPE} .fcs-stripEst { white-space: nowrap; flex-shrink: 0; }
.\${SCOPE} .fcs-penaltyFlag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: \${RED};
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
  flex-shrink: 0;
}
.\${SCOPE} .fcs-lockGlyph {
  color: var(--color-text-secondary);
  display: inline-flex;
  flex-shrink: 0;
}

/* ---- Derived interstitial rows (24px, dashed — not draggable) ---- */
.\${SCOPE} .fcs-derivedRow {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border: 1px dashed var(--color-border);
  border-radius: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 0;
}
.\${SCOPE} .fcs-derivedRow.is-lunch { color: \${GREEN}; border-color: \${GREEN}; background: \${GREEN_TINT}; }
.\${SCOPE} .fcs-derivedRow.is-lateLunch { color: \${RED}; border-color: \${RED}; background: \${RED_TINT}; }
.\${SCOPE} .fcs-derivedLabel {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* ---- Legend strip 32px (bottom-left corner owner) ---- */
.\${SCOPE} .fcs-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 32px;
  padding: 0 var(--spacing-3);
  border-top: var(--border-width) solid var(--color-border);
  overflow-x: auto;
}
.\${SCOPE} .fcs-legendKey {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .fcs-legendSwatch { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

/* ---- Rail: scene detail ---- */
.\${SCOPE} .fcs-detail {
  padding: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.\${SCOPE} .fcs-overline {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.\${SCOPE} .fcs-detailTitleRow { display: flex; align-items: center; gap: 7px; min-width: 0; }
.\${SCOPE} .fcs-detailFacts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  font-size: 11px;
}
.\${SCOPE} .fcs-factLabel {
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  white-space: nowrap;
  align-self: baseline;
}
.\${SCOPE} .fcs-factValue { font-variant-numeric: tabular-nums; min-width: 0; }
.\${SCOPE} .fcs-moveRow { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.\${SCOPE} .fcs-dayBtn {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 28px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.\${SCOPE} .fcs-dayBtn:disabled { opacity: 0.4; cursor: not-allowed; }
.\${SCOPE} .fcs-dayBtn.is-current {
  color: \${BRAND};
  border-color: \${BRAND};
  background: \${BRAND_TINT};
}
@media (hover: hover) {
  .\${SCOPE} .fcs-dayBtn:not(:disabled):not(.is-current):hover {
    background: var(--color-background-muted);
    color: var(--color-text-primary);
  }
}
.\${SCOPE} .fcs-nudgeBtn {
  font: inherit;
  margin: 0;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.\${SCOPE} .fcs-nudgeBtn:disabled { opacity: 0.35; cursor: not-allowed; }
@media (hover: hover) {
  .\${SCOPE} .fcs-nudgeBtn:not(:disabled):hover {
    color: var(--color-text-primary);
    background: var(--color-background-muted);
  }
}

/* ---- Call table (36px rows) ---- */
.\${SCOPE} .fcs-callTable {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.\${SCOPE} .fcs-callHead {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .fcs-dayTab {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 24px;
  padding-inline: 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 10px;
  font-weight: 650;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .fcs-dayTab[aria-pressed='true'] {
  color: \${BRAND};
  border-color: \${BRAND};
  background: \${BRAND_TINT};
}
.\${SCOPE} .fcs-callScroll { min-height: 0; overflow-y: auto; padding-bottom: var(--spacing-2); }
.\${SCOPE} .fcs-callRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  min-width: 0;
}
.\${SCOPE} .fcs-callRow.is-section {
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  min-height: 28px;
  background: var(--color-background-muted);
  border-bottom: none;
}
.\${SCOPE} .fcs-callLabel {
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .fcs-callSub {
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .fcs-callTime {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}
.\${SCOPE} .fcs-callTime.is-bad { color: \${RED}; font-weight: 700; }
.\${SCOPE} .fcs-castNum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-family: \${MONO};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* ---- Publish gate panel (rail foot, bottom-right corner owner) ---- */
.\${SCOPE} .fcs-gate {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.\${SCOPE} .fcs-gateReqRow { display: flex; flex-wrap: wrap; gap: 6px; }
.\${SCOPE} .fcs-req {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.\${SCOPE} .fcs-req.is-pass { color: \${GREEN}; background: \${GREEN_TINT}; border-color: transparent; }
.\${SCOPE} .fcs-req.is-fail { color: \${RED}; background: \${RED_TINT}; border-color: transparent; }
.\${SCOPE} .fcs-req.is-tight { color: \${AMBER}; background: \${AMBER_TINT}; border-color: transparent; }
.\${SCOPE} .fcs-gateFoot { display: flex; align-items: center; gap: var(--spacing-2); justify-content: flex-end; }

/* ---- <=980px: rail restacks under the board ---- */
@media (max-width: 980px) {
  .\${SCOPE} .fcs-frame { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto; }
  .\${SCOPE} .fcs-rail { border-left: none; border-top: var(--border-width) solid var(--color-border); }
  .\${SCOPE} .fcs-callScroll { max-height: 396px; }
}

/* ---- <=640px (390px embed): one day column per row ---- */
@media (max-width: 640px) {
  .\${SCOPE} .fcs-board { grid-template-columns: minmax(0, 1fr); }
  .\${SCOPE} .fcs-brandSub { display: none; }
  .\${SCOPE} .fcs-brandProd { display: none; }
}
\`;

// ---------------------------------------------------------------------------
// DATA — one deterministic world: NORTHLIGHT Days 14–16. "Today" anchor:
// Mon 13 Jul 2026. Times are minutes-since-midnight integers; every clock
// string on screen is derived by minutesToClock at render.
// ---------------------------------------------------------------------------

const TODAY_SHORT = '13 Jul 2026';
const PRODUCTION = 'NORTHLIGHT';
const PROD_CO = 'Gravel Road Pictures';
const FIRST_AD = 'Priya Anand';

// Schedule rules (documented on the derived rows they produce):
// - First shot is 30m after crew call.
// - A 45m company move is inserted wherever adjacent strips change location.
// - Lunch (60m) is auto-placed at the first turnover >= 300m (5h) after
//   first shot, provided scenes remain; if a scene ENDS past 360m (6h)
//   before lunch could be placed, it carries a meal-penalty risk.
// - Publish gate: wrap <= hard out · 0 meal penalties · >= 660m (11h)
//   turnaround into the next day's crew call. 660–719m passes but shows
//   amber ("tight").
const FIRST_SHOT_OFFSET = 30;
const COMPANY_MOVE_MIN = 45;
const LUNCH_MIN = 60;
const LUNCH_TARGET = 300;
const PENALTY_AT = 360;
const TURNAROUND_MIN = 660;
const TURNAROUND_TIGHT = 720;

function minutesToClock(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return \`\${h}:\${mm < 10 ? '0' : ''}\${mm}\`;
}

function minutesToDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return \`\${m}m\`;
  return m === 0 ? \`\${h}h\` : \`\${h}h\${m < 10 ? '0' : ''}\${m}\`;
}

function eighthsToPages(eighths: number): string {
  const whole = Math.floor(eighths / 8);
  const rest = eighths % 8;
  if (whole === 0) return \`\${rest}/8\`;
  return rest === 0 ? \`\${whole} 0/8\` : \`\${whole} \${rest}/8\`;
}

// ---- Cast roster (referenced by number, industry style) -------------------

interface CastMember {
  num: number;
  name: string;
  character: string;
  hmuMinutes: number; // personal hair/make-up duration; pickup = HMU − 30m
}

const CAST: CastMember[] = [
  {num: 1, name: 'Elias Ward', character: 'Ray Harrow', hmuMinutes: 50},
  {num: 2, name: 'Nadia Sohn', character: 'June Harrow', hmuMinutes: 75},
  {num: 5, name: 'Marcus Bell', character: 'Deputy Cole', hmuMinutes: 40},
  {num: 6, name: 'Ana Reyes', character: 'Tess', hmuMinutes: 45},
  {num: 7, name: 'Peter Okafor', character: 'Vernon', hmuMinutes: 30},
];

const CAST_BY_NUM = new Map(CAST.map(c => [c.num, c]));
const PICKUP_BEFORE_HMU = 30;

// ---- Scenes ---------------------------------------------------------------

type Ie = 'INT' | 'EXT';
type Dn = 'DAY' | 'NIGHT' | 'DAWN';

interface Scene {
  id: string;
  num: string;
  ie: Ie;
  dn: Dn;
  set: string;
  location: string; // company-move key
  castNums: number[];
  pagesLabel: string; // display dual field
  pagesEighths: number; // math dual field
  estMinutes: number;
  synopsis: string;
}

// Sc 25's 61-char set name is the single-line truncation stress fixture at
// the ~207px column width.
const SCENES: Scene[] = [
  {
    id: 'SC-42',
    num: '42',
    ie: 'INT',
    dn: 'DAY',
    set: 'Harrow House — Kitchen',
    location: 'Stage 3',
    castNums: [1, 2],
    pagesLabel: '1 2/8',
    pagesEighths: 10,
    estMinutes: 90,
    synopsis: 'Ray burns the letter; June catches him at the sink.',
  },
  {
    id: 'SC-43',
    num: '43',
    ie: 'INT',
    dn: 'DAY',
    set: 'Harrow House — Kitchen',
    location: 'Stage 3',
    castNums: [1, 2, 6],
    pagesLabel: '4/8',
    pagesEighths: 4,
    estMinutes: 60,
    synopsis: 'Tess arrives with the county paperwork; breakfast goes cold.',
  },
  {
    id: 'SC-24',
    num: '24',
    ie: 'EXT',
    dn: 'DAY',
    set: 'Farmhouse — Yard',
    location: 'Millbrook Farm',
    castNums: [1, 5],
    pagesLabel: '1 4/8',
    pagesEighths: 12,
    estMinutes: 180,
    synopsis: 'Deputy Cole walks the fence line with Ray; the dog finds the culvert.',
  },
  {
    id: 'SC-47',
    num: '47',
    ie: 'INT',
    dn: 'NIGHT',
    set: 'Harrow House — Hallway',
    location: 'Stage 3',
    castNums: [2],
    pagesLabel: '6/8',
    pagesEighths: 6,
    estMinutes: 90,
    synopsis: 'June listens at the study door; the floorboard gives her away.',
  },
  {
    id: 'SC-51',
    num: '51',
    ie: 'INT',
    dn: 'NIGHT',
    set: 'Harrow House — Study',
    location: 'Stage 3',
    castNums: [1, 2, 7],
    pagesLabel: '1 1/8',
    pagesEighths: 9,
    estMinutes: 105,
    synopsis: 'Vernon names his price. June sees the ledger for the first time.',
  },
  {
    id: 'SC-52',
    num: '52',
    ie: 'INT',
    dn: 'NIGHT',
    set: 'Harrow House — Study',
    location: 'Stage 3',
    castNums: [1, 7],
    pagesLabel: '5/8',
    pagesEighths: 5,
    estMinutes: 60,
    synopsis: 'Ray signs. Vernon leaves the pen behind.',
  },
  {
    id: 'SC-25',
    num: '25',
    ie: 'EXT',
    dn: 'DAY',
    set: 'Farmhouse — Yard, apple orchard boundary fence (continuation)',
    location: 'Millbrook Farm',
    castNums: [1, 5],
    pagesLabel: '2 1/8',
    pagesEighths: 17,
    estMinutes: 165,
    synopsis: 'Continuation of the fence-line walk; Cole photographs the cut wire.',
  },
  {
    id: 'SC-26',
    num: '26',
    ie: 'EXT',
    dn: 'DAY',
    set: 'Farmhouse — Barn',
    location: 'Millbrook Farm',
    castNums: [1, 5, 6],
    pagesLabel: '1 3/8',
    pagesEighths: 11,
    estMinutes: 150,
    synopsis: 'Tess shows them the empty stalls; Cole finds the second padlock.',
  },
  {
    id: 'SC-28',
    num: '28',
    ie: 'INT',
    dn: 'DAY',
    set: 'Barn — Tack Room',
    location: 'Millbrook Farm',
    castNums: [5, 6],
    pagesLabel: '1 0/8',
    pagesEighths: 8,
    estMinutes: 90,
    synopsis: 'Cole and Tess compare dates; the feed receipts do not add up.',
  },
  {
    id: 'SC-31',
    num: '31',
    ie: 'EXT',
    dn: 'DAWN',
    set: 'Ridge Road — Overlook',
    location: 'Ridge Rd',
    castNums: [1, 2],
    pagesLabel: '1 2/8',
    pagesEighths: 10,
    estMinutes: 105,
    synopsis: 'Magic hour: Ray and June watch the valley lights come up.',
  },
  {
    id: 'SC-33',
    num: '33',
    ie: 'EXT',
    dn: 'DAY',
    set: 'Ridge Road — Moving Car',
    location: 'Ridge Rd',
    castNums: [1, 2],
    pagesLabel: '2 0/8',
    pagesEighths: 16,
    estMinutes: 150,
    synopsis: 'The argument in the car; June makes Ray pull over.',
  },
  {
    id: 'SC-34',
    num: '34',
    ie: 'INT',
    dn: 'DAY',
    set: 'Car (process trailer)',
    location: 'Ridge Rd',
    castNums: [1, 2],
    pagesLabel: '1 1/8',
    pagesEighths: 9,
    estMinutes: 90,
    synopsis: 'Coverage of the argument; June reads the ledger page aloud.',
  },
];

const SCENE_BY_ID = new Map(SCENES.map(s => [s.id, s]));

// ---- Days -------------------------------------------------------------

interface ShootDay {
  id: string;
  label: string;
  date: string; // 'Wed 15 Jul'
  unitNote: string;
  crewCallMin: number; // minutes since midnight
  hardOutMin: number;
}

const DAYS: ShootDay[] = [
  {
    id: 'D14',
    label: 'Day 14',
    date: 'Wed 15 Jul',
    unitNote: 'Stage 3 · Harrow House sets',
    crewCallMin: 420, // 07:00
    hardOutMin: 1140, // 19:00 studio hard out
  },
  {
    id: 'D15',
    label: 'Day 15',
    date: 'Thu 16 Jul',
    unitNote: 'Millbrook Farm (location)',
    crewCallMin: 420, // 07:00
    hardOutMin: 1140, // 19:00 location curfew
  },
  {
    id: 'D16',
    label: 'Day 16',
    date: 'Fri 17 Jul',
    unitNote: 'Ridge Rd (dawn unit)',
    crewCallMin: 390, // 06:30 for the dawn scene
    hardOutMin: 1110, // 18:30
  },
];

const DAY_BY_ID = new Map(DAYS.map(d => [d.id, d]));

// Initial board: Sc 24 sits mid-Day 14 (the AD scheduled the farmhouse
// exterior for midday light) — it drags two 45m company moves and the
// meal-penalty risk with it. Sending it to Day 15 is the demo move.
const INITIAL_ORDER: Record<string, string[]> = {
  D14: ['SC-42', 'SC-43', 'SC-24', 'SC-47', 'SC-51', 'SC-52'],
  D15: ['SC-25', 'SC-26', 'SC-28'],
  D16: ['SC-31', 'SC-33', 'SC-34'],
};

// ---------------------------------------------------------------------------
// SCHEDULE BUILDER — the pure derivation everything reads. Input: a day and
// its ordered scenes. Output: entry list (scene/move/lunch with offsets
// from first shot), wrap, penalties, totals. No state, no clocks.
// ---------------------------------------------------------------------------

interface ScheduleSceneEntry {
  type: 'scene';
  scene: Scene;
  startOffset: number; // minutes after first shot
  endOffset: number;
  mealPenalty: boolean;
}

interface ScheduleMoveEntry {
  type: 'move';
  startOffset: number;
  fromLocation: string;
  toLocation: string;
}

interface ScheduleLunchEntry {
  type: 'lunch';
  startOffset: number;
  isLate: boolean; // placed past the 6h penalty line
}

type ScheduleEntry = ScheduleSceneEntry | ScheduleMoveEntry | ScheduleLunchEntry;

interface DaySchedule {
  day: ShootDay;
  entries: ScheduleEntry[];
  totalEighths: number;
  totalSceneMinutes: number;
  lunchOffset: number | null; // null = no lunch row (short day)
  mealPenaltySceneIds: string[];
  firstShotMin: number; // clock minutes
  wrapMin: number; // clock minutes
  hardOutOk: boolean;
  castOnSetOffset: Map<number, number>; // cast num → first-scene start offset
}

function buildDaySchedule(day: ShootDay, scenes: Scene[]): DaySchedule {
  const entries: ScheduleEntry[] = [];
  const castOnSetOffset = new Map<number, number>();
  const mealPenaltySceneIds: string[] = [];
  let offset = 0;
  let lunchOffset: number | null = null;
  let prevLocation: string | null = null;

  for (const scene of scenes) {
    if (prevLocation != null && scene.location !== prevLocation) {
      entries.push({type: 'move', startOffset: offset, fromLocation: prevLocation, toLocation: scene.location});
      offset += COMPANY_MOVE_MIN;
    }
    if (lunchOffset == null && offset >= LUNCH_TARGET) {
      lunchOffset = offset;
      entries.push({type: 'lunch', startOffset: offset, isLate: offset > PENALTY_AT});
      offset += LUNCH_MIN;
    }
    const startOffset = offset;
    offset += scene.estMinutes;
    const mealPenalty = lunchOffset == null && offset > PENALTY_AT;
    if (mealPenalty) mealPenaltySceneIds.push(scene.id);
    entries.push({type: 'scene', scene, startOffset, endOffset: offset, mealPenalty});
    for (const num of scene.castNums) {
      if (!castOnSetOffset.has(num)) castOnSetOffset.set(num, startOffset);
    }
    prevLocation = scene.location;
  }

  const firstShotMin = day.crewCallMin + FIRST_SHOT_OFFSET;
  const wrapMin = firstShotMin + offset;
  return {
    day,
    entries,
    totalEighths: scenes.reduce((sum, s) => sum + s.pagesEighths, 0),
    totalSceneMinutes: scenes.reduce((sum, s) => sum + s.estMinutes, 0),
    lunchOffset,
    mealPenaltySceneIds,
    firstShotMin,
    wrapMin,
    hardOutOk: wrapMin <= day.hardOutMin,
    castOnSetOffset,
  };
}

// Turnaround from a day's wrap into the NEXT day's crew call (next
// calendar day, hence +1440). Returns null for the last board day.
function turnaroundMinutes(schedule: DaySchedule, nextDay: ShootDay | undefined): number | null {
  if (nextDay == null) return null;
  return nextDay.crewCallMin + 1440 - schedule.wrapMin;
}

// ---------------------------------------------------------------------------
// CALLSLATE MARK — 22px inline SVG clapper slate: hinged sticks with
// diagonal stripes over the board. Brand accent as stroke/fill only.
// ---------------------------------------------------------------------------

function CallslateMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden style={{flexShrink: 0}}>
      <path d="M3 9.5 18.5 6l.8 3.4L3.8 12.9Z" fill="none" stroke={BRAND} strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M6 8.8 8 5.6M10.5 7.8l2-3.2M15 6.8l2-3.2" stroke={BRAND} strokeWidth={1.7} strokeLinecap="round" />
      <rect x={3.5} y={12.5} width={15} height={6.5} rx={1.2} fill="none" stroke={BRAND} strokeWidth={1.7} />
      <circle cx={7} cy={15.7} r={1.1} fill={BRAND} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STRIP COLOR FAMILIES — the industry strip-color idiom, always paired with
// the I/E·D/N text tag (never color alone). DAWN/DUSK outranks INT/EXT.
// ---------------------------------------------------------------------------

interface StripFamily {
  tag: string;
  color: string; // edge + tag text
  tint: string; // tag background
}

function stripFamily(scene: Scene): StripFamily {
  const tag = \`\${scene.ie === 'INT' ? 'I' : 'E'}·\${
    scene.dn === 'DAY' ? 'D' : scene.dn === 'NIGHT' ? 'N' : 'DAWN'
  }\`;
  if (scene.dn === 'DAWN') return {tag, color: VIOLET, tint: VIOLET_TINT};
  if (scene.dn === 'NIGHT') {
    return scene.ie === 'INT'
      ? {tag, color: BLUE, tint: BLUE_TINT}
      : {tag, color: GREEN, tint: GREEN_TINT};
  }
  // DAY
  return scene.ie === 'EXT'
    ? {tag, color: BRAND, tint: BRAND_TINT}
    : {tag, color: 'var(--color-text-secondary)', tint: 'var(--color-background-muted)'};
}

// ---------------------------------------------------------------------------
// SceneStrip — 56px production strip, a real <button>. Shows scene number,
// I/E·D/N tag, set, cast numbers, page eighths, est minutes; a lock glyph
// on published days and a MEAL flag when the schedule builder marked it.
// ---------------------------------------------------------------------------

interface SceneStripProps {
  scene: Scene;
  isSelected: boolean;
  isLocked: boolean;
  mealPenalty: boolean;
  onSelect: () => void;
}

function SceneStrip({scene, isSelected, isLocked, mealPenalty, onSelect}: SceneStripProps) {
  const family = stripFamily(scene);
  const labelParts = [
    \`Scene \${scene.num}\`,
    \`\${scene.ie} \${scene.dn}\`,
    scene.set,
    \`cast \${scene.castNums.join(', ')}\`,
    \`\${scene.pagesLabel} pages\`,
    \`estimated \${minutesToDuration(scene.estMinutes)}\`,
  ];
  if (mealPenalty) labelParts.push('meal penalty risk');
  if (isLocked) labelParts.push('day published — locked');
  return (
    <button
      type="button"
      className={\`fcs-strip fcs-fade\${isSelected ? ' is-selected' : ''}\`}
      aria-pressed={isSelected}
      aria-label={labelParts.join(', ')}
      onClick={onSelect}>
      <span className="fcs-stripEdge" style={{background: family.color}} aria-hidden />
      <span className="fcs-stripTop">
        <span className="fcs-sceneNum">{scene.num}</span>
        <span className="fcs-ieTag" style={{color: family.color, background: family.tint}}>
          {family.tag}
        </span>
        <span className="fcs-stripSet">{scene.set}</span>
        {isLocked ? (
          <span className="fcs-lockGlyph" aria-hidden>
            <LockIcon size={11} />
          </span>
        ) : null}
      </span>
      <span className="fcs-stripMeta">
        <span className="fcs-stripCast">{scene.castNums.join(' ')}</span>
        <span className="fcs-stripPages">{scene.pagesLabel} pgs</span>
        <span className="fcs-stripEst">{minutesToDuration(scene.estMinutes)}</span>
        {mealPenalty ? (
          <span className="fcs-penaltyFlag">
            <UtensilsIcon size={10} aria-hidden />
            MEAL
          </span>
        ) : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// DayColumn — day header (derived stats) + strips interleaved with the
// builder's derived move/lunch rows. Purely presentational.
// ---------------------------------------------------------------------------

interface DayColumnProps {
  schedule: DaySchedule;
  publishedLine: string | null;
  turnaroundIn: number | null; // minutes of rest INTO this day (from prev)
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
}

function DayColumn({
  schedule,
  publishedLine,
  turnaroundIn,
  selectedSceneId,
  onSelectScene,
}: DayColumnProps) {
  const {day} = schedule;
  const wrapClock = minutesToClock(schedule.wrapMin);
  const isLocked = publishedLine != null;
  const turnaroundBad = turnaroundIn != null && turnaroundIn < TURNAROUND_MIN;
  const turnaroundTight =
    turnaroundIn != null && turnaroundIn >= TURNAROUND_MIN && turnaroundIn < TURNAROUND_TIGHT;
  return (
    <section className="fcs-dayCol" aria-label={\`\${day.label}, \${day.date}\`}>
      <header className="fcs-dayHead">
        <div className="fcs-dayTitleRow">
          <span className="fcs-dayName">{day.label}</span>
          <span className="fcs-dayDate">
            {day.date} · {day.unitNote}
          </span>
          {isLocked ? (
            <span className="fcs-pubBadge">
              <CheckIcon size={10} aria-hidden />
              Published
            </span>
          ) : null}
        </div>
        <div className="fcs-dayStatRow">
          <span className="fcs-dayStat">
            <ClockIcon size={10} aria-hidden />
            call {minutesToClock(day.crewCallMin)}
          </span>
          <span className="fcs-dayStat">{eighthsToPages(schedule.totalEighths)} pgs</span>
          <span className={\`fcs-dayStat\${schedule.hardOutOk ? '' : ' is-bad'}\`}>
            wrap {wrapClock}
            {schedule.hardOutOk ? '' : \` › out \${minutesToClock(day.hardOutMin)}\`}
          </span>
          {schedule.mealPenaltySceneIds.length > 0 ? (
            <span className="fcs-dayStat is-bad">
              <UtensilsIcon size={10} aria-hidden />
              penalty ×{schedule.mealPenaltySceneIds.length}
            </span>
          ) : null}
          {turnaroundBad || turnaroundTight ? (
            <span className={\`fcs-dayStat \${turnaroundBad ? 'is-bad' : 'is-tight'}\`}>
              TA {minutesToDuration(turnaroundIn ?? 0)}
            </span>
          ) : null}
        </div>
      </header>
      <div className="fcs-dayBody">
        {schedule.entries.length === 0 ? (
          <div className="fcs-derivedRow">
            <span className="fcs-derivedLabel">No scenes boarded — send a strip here</span>
          </div>
        ) : (
          schedule.entries.map(entry => {
            if (entry.type === 'move') {
              return (
                <div
                  key={\`move-\${entry.startOffset}\`}
                  className="fcs-derivedRow"
                  aria-label={\`Derived company move, 45 minutes, \${entry.fromLocation} to \${entry.toLocation}\`}>
                  <TruckIcon size={11} aria-hidden />
                  <span className="fcs-derivedLabel">
                    Move {COMPANY_MOVE_MIN}m · {entry.fromLocation} → {entry.toLocation}
                  </span>
                </div>
              );
            }
            if (entry.type === 'lunch') {
              const lunchClock = minutesToClock(schedule.firstShotMin + entry.startOffset);
              return (
                <div
                  key={\`lunch-\${entry.startOffset}\`}
                  className={\`fcs-derivedRow \${entry.isLate ? 'is-lateLunch' : 'is-lunch'}\`}
                  aria-label={\`Derived lunch, 60 minutes, \${lunchClock}\${entry.isLate ? ', past the 6 hour line' : ''}\`}>
                  <UtensilsIcon size={11} aria-hidden />
                  <span className="fcs-derivedLabel">
                    Lunch {LUNCH_MIN}m · {lunchClock}
                    {entry.isLate ? ' · past 6h' : ''}
                  </span>
                </div>
              );
            }
            return (
              <SceneStrip
                key={entry.scene.id}
                scene={entry.scene}
                isSelected={selectedSceneId === entry.scene.id}
                isLocked={isLocked}
                mealPenalty={entry.mealPenalty}
                onSelect={() => onSelectScene(entry.scene.id)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CALL TABLE — derived unit + cast call times for the active day. 36px rows.
// Cast rows derive pickup → HMU → on-set from the actor's first scene of
// the day and personal HMU duration; no time here is stored anywhere.
// ---------------------------------------------------------------------------

function CallTimeCell({min, isBad}: {min: number; isBad?: boolean}) {
  return <span className={\`fcs-callTime\${isBad === true ? ' is-bad' : ''}\`}>{minutesToClock(min)}</span>;
}

function CallTable({schedule}: {schedule: DaySchedule}) {
  const {day} = schedule;
  const castOnDay = CAST.filter(c => schedule.castOnSetOffset.has(c.num));
  return (
    <div className="fcs-callScroll">
      <div className="fcs-callRow is-section">
        <span className="fcs-callLabel">Unit — {day.label}</span>
      </div>
      <div className="fcs-callRow">
        <span className="fcs-callLabel">Crew call</span>
        <CallTimeCell min={day.crewCallMin} />
      </div>
      <div className="fcs-callRow">
        <span className="fcs-callLabel">Shooting call (first shot)</span>
        <CallTimeCell min={schedule.firstShotMin} />
      </div>
      <div className="fcs-callRow">
        <span className="fcs-callLabel">
          Lunch (auto-placed)
          {schedule.lunchOffset == null ? <span className="fcs-callSub"> — short day, none</span> : null}
        </span>
        {schedule.lunchOffset != null ? (
          <CallTimeCell
            min={schedule.firstShotMin + schedule.lunchOffset}
            isBad={schedule.lunchOffset > PENALTY_AT}
          />
        ) : (
          <span className="fcs-callTime">—</span>
        )}
      </div>
      <div className="fcs-callRow">
        <span className="fcs-callLabel">Estimated wrap</span>
        <CallTimeCell min={schedule.wrapMin} isBad={!schedule.hardOutOk} />
      </div>
      <div className="fcs-callRow">
        <span className="fcs-callLabel">Hard out</span>
        <CallTimeCell min={day.hardOutMin} />
      </div>
      <div className="fcs-callRow is-section">
        <span className="fcs-callLabel">Cast — pickup · HMU · on set</span>
      </div>
      {castOnDay.length === 0 ? (
        <div className="fcs-callRow">
          <span className="fcs-callLabel">
            <span className="fcs-callSub">No cast boarded on {day.label}.</span>
          </span>
        </div>
      ) : (
        castOnDay.map(member => {
          const onSetMin = schedule.firstShotMin + (schedule.castOnSetOffset.get(member.num) ?? 0);
          const hmuMin = onSetMin - member.hmuMinutes;
          const pickupMin = hmuMin - PICKUP_BEFORE_HMU;
          return (
            <div className="fcs-callRow" key={member.num}>
              <span className="fcs-castNum" aria-hidden>
                {member.num}
              </span>
              <span className="fcs-callLabel">
                {member.name}
                <br />
                <span className="fcs-callSub">{member.character}</span>
              </span>
              <span
                className="fcs-vh">{\`Cast \${member.num} \${member.name} as \${member.character}: pickup \${minutesToClock(pickupMin)}, hair and makeup \${minutesToClock(hmuMin)}, on set \${minutesToClock(onSetMin)}\`}</span>
              <CallTimeCell min={pickupMin} />
              <CallTimeCell min={hmuMin} />
              <CallTimeCell min={onSetMin} />
            </div>
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GATE EVALUATION — pure verdict over a schedule + its following day.
// ---------------------------------------------------------------------------

interface GateVerdict {
  hardOutOk: boolean;
  penaltyCount: number;
  turnaround: number | null;
  turnaroundOk: boolean;
  turnaroundTight: boolean;
  allPass: boolean;
  failCount: number;
}

function evaluateGate(schedule: DaySchedule, nextDay: ShootDay | undefined): GateVerdict {
  const turnaround = turnaroundMinutes(schedule, nextDay);
  const turnaroundOk = turnaround == null || turnaround >= TURNAROUND_MIN;
  const turnaroundTight =
    turnaround != null && turnaround >= TURNAROUND_MIN && turnaround < TURNAROUND_TIGHT;
  const penaltyCount = schedule.mealPenaltySceneIds.length;
  const failCount =
    (schedule.hardOutOk ? 0 : 1) + (penaltyCount === 0 ? 0 : 1) + (turnaroundOk ? 0 : 1);
  return {
    hardOutOk: schedule.hardOutOk,
    penaltyCount,
    turnaround,
    turnaroundOk,
    turnaroundTight,
    allPass: failCount === 0,
    failCount,
  };
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. The store is only strip order + publish lines;
// every schedule fact is re-derived by buildDaySchedule each render.
// ---------------------------------------------------------------------------

interface BoardStore {
  order: Record<string, string[]>;
  published: Record<string, string | null>;
}

const INITIAL_STORE: BoardStore = {
  order: INITIAL_ORDER,
  published: {D14: null, D15: null, D16: null},
};

export default function FilmCallSheetBuilderTemplate() {
  const [board, setBoard] = useState<BoardStore>(INITIAL_STORE);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [activeDayId, setActiveDayId] = useState<string>('D14');
  const [announcement, setAnnouncement] = useState('');

  // ---- Derivation: schedules, turnarounds, gates — all from the store ----
  const scenesFor = (order: Record<string, string[]>, dayId: string): Scene[] =>
    (order[dayId] ?? []).map(id => SCENE_BY_ID.get(id)).filter((s): s is Scene => s != null);

  const schedules = DAYS.map(day => buildDaySchedule(day, scenesFor(board.order, day.id)));
  const scheduleByDayId = new Map(schedules.map(s => [s.day.id, s]));
  const gates = schedules.map((schedule, index) => evaluateGate(schedule, DAYS[index + 1]));
  const gateByDayId = new Map(schedules.map((s, index) => [s.day.id, gates[index]]));

  const dayIdOfScene = (sceneId: string): string | undefined =>
    DAYS.find(day => (board.order[day.id] ?? []).includes(sceneId))?.id;

  const selectedScene = selectedSceneId != null ? (SCENE_BY_ID.get(selectedSceneId) ?? null) : null;
  const selectedSceneDayId = selectedSceneId != null ? dayIdOfScene(selectedSceneId) : undefined;

  const activeDay = DAY_BY_ID.get(activeDayId) ?? DAYS[0];
  const activeSchedule = scheduleByDayId.get(activeDay.id) ?? schedules[0];
  const activeGate = gateByDayId.get(activeDay.id) ?? gates[0];
  const activeNextDay = DAYS[DAYS.findIndex(d => d.id === activeDay.id) + 1];
  const activePublished = board.published[activeDay.id] ?? null;

  // ---- Mutations ----------------------------------------------------------
  const selectScene = (sceneId: string) => {
    setSelectedSceneId(prev => (prev === sceneId ? null : sceneId));
    const dayId = dayIdOfScene(sceneId);
    if (dayId != null) setActiveDayId(dayId);
  };

  const moveScene = (sceneId: string, targetDayId: string) => {
    const sourceDayId = dayIdOfScene(sceneId);
    if (sourceDayId == null || sourceDayId === targetDayId) return;
    if (board.published[sourceDayId] != null || board.published[targetDayId] != null) return;
    const nextOrder: Record<string, string[]> = {
      ...board.order,
      [sourceDayId]: (board.order[sourceDayId] ?? []).filter(id => id !== sceneId),
      [targetDayId]: [...(board.order[targetDayId] ?? []), sceneId],
    };
    setBoard(prev => ({...prev, order: nextOrder}));
    setActiveDayId(targetDayId);
    // Announce the re-derived consequences on BOTH columns.
    const sourceDay = DAY_BY_ID.get(sourceDayId);
    const targetDay = DAY_BY_ID.get(targetDayId);
    if (sourceDay != null && targetDay != null) {
      const nextSource = buildDaySchedule(sourceDay, scenesFor(nextOrder, sourceDayId));
      const nextTarget = buildDaySchedule(targetDay, scenesFor(nextOrder, targetDayId));
      const scene = SCENE_BY_ID.get(sceneId);
      setAnnouncement(
        \`Scene \${scene?.num ?? sceneId} sent to \${targetDay.label}. \` +
          \`\${sourceDay.label} wrap now \${minutesToClock(nextSource.wrapMin)}; \` +
          \`\${targetDay.label} wrap now \${minutesToClock(nextTarget.wrapMin)}.\`,
      );
    }
  };

  const nudgeScene = (sceneId: string, direction: -1 | 1) => {
    const dayId = dayIdOfScene(sceneId);
    if (dayId == null || board.published[dayId] != null) return;
    const current = board.order[dayId] ?? [];
    const index = current.indexOf(sceneId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= current.length) return;
    const next = [...current];
    next[index] = next[swapWith];
    next[swapWith] = sceneId;
    setBoard(prev => ({...prev, order: {...prev.order, [dayId]: next}}));
    const scene = SCENE_BY_ID.get(sceneId);
    setAnnouncement(
      \`Scene \${scene?.num ?? sceneId} moved \${direction === -1 ? 'earlier' : 'later'} in \${
        DAY_BY_ID.get(dayId)?.label ?? dayId
      }.\`,
    );
  };

  const publishDay = (dayId: string) => {
    const gate = gateByDayId.get(dayId);
    if (gate == null || !gate.allPass || board.published[dayId] != null) return;
    const line = \`Published \${TODAY_SHORT} · sent to 58 recipients\`;
    setBoard(prev => ({...prev, published: {...prev.published, [dayId]: line}}));
    setAnnouncement(
      \`\${DAY_BY_ID.get(dayId)?.label ?? dayId} call sheet published. Strips on that day are locked.\`,
    );
  };

  // ---- Header chip for the focus day (Day 14 — first unpublished day) ----
  const focusDay = DAYS.find(day => board.published[day.id] == null) ?? DAYS[DAYS.length - 1];
  const focusGate = gateByDayId.get(focusDay.id) ?? gates[0];
  const focusPublished = board.published[focusDay.id] != null;
  const headChip = focusPublished ? (
    <span className="fcs-headChip is-published fcs-fade">
      <CheckIcon size={12} aria-hidden />
      {focusDay.label} published
    </span>
  ) : focusGate.allPass ? (
    <span className="fcs-headChip is-ready fcs-fade">
      <SendIcon size={12} aria-hidden />
      {focusDay.label} ready to publish
    </span>
  ) : (
    <span className="fcs-headChip is-blocked fcs-fade">
      <TriangleAlertIcon size={12} aria-hidden />
      {focusDay.label} blocked · {focusGate.failCount}
    </span>
  );

  // ---- Selected scene derived facts ---------------------------------------
  const selectedEntry =
    selectedScene != null && selectedSceneDayId != null
      ? scheduleByDayId
          .get(selectedSceneDayId)
          ?.entries.find(
            (entry): entry is ScheduleSceneEntry =>
              entry.type === 'scene' && entry.scene.id === selectedScene.id,
          )
      : undefined;
  const selectedSchedule =
    selectedSceneDayId != null ? scheduleByDayId.get(selectedSceneDayId) : undefined;
  const selectedDayLocked =
    selectedSceneDayId != null && board.published[selectedSceneDayId] != null;
  const selectedIndex =
    selectedScene != null && selectedSceneDayId != null
      ? (board.order[selectedSceneDayId] ?? []).indexOf(selectedScene.id)
      : -1;
  const selectedDayCount =
    selectedSceneDayId != null ? (board.order[selectedSceneDayId] ?? []).length : 0;

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      {/* Polite live region — every mutation announces its consequences. */}
      <div className="fcs-vh" aria-live="polite">
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="fcs-headRow">
              <CallslateMark />
              <div className="fcs-brandCol">
                <div className="fcs-brandLine">
                  <span className="fcs-brandName">Callslate</span>
                  <span className="fcs-brandProd">
                    {PRODUCTION} — {PROD_CO} · strip board, Days 14–16
                  </span>
                </div>
                <span className="fcs-brandSub">
                  1st AD {FIRST_AD} · today Mon {TODAY_SHORT} · Day 14 sheet due 18:00
                </span>
              </div>
              <div className="fcs-spring" />
              {headChip}
              <Avatar name={FIRST_AD} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div className="fcs-frame">
              <main className="fcs-main">
                <div className="fcs-boardScroll">
                  <div className="fcs-board">
                    {schedules.map((schedule, index) => {
                      const prevSchedule = index > 0 ? schedules[index - 1] : undefined;
                      const turnaroundIn =
                        prevSchedule != null
                          ? turnaroundMinutes(prevSchedule, schedule.day)
                          : null;
                      return (
                        <DayColumn
                          key={schedule.day.id}
                          schedule={schedule}
                          publishedLine={board.published[schedule.day.id] ?? null}
                          turnaroundIn={turnaroundIn}
                          selectedSceneId={selectedSceneId}
                          onSelectScene={selectScene}
                        />
                      );
                    })}
                  </div>
                </div>
                {/* Bottom-left corner owner: strip-color legend. */}
                <div className="fcs-legend" aria-label="Strip color legend">
                  <span className="fcs-legendKey">
                    <span className="fcs-legendSwatch" style={{background: BRAND}} />
                    EXT·D
                  </span>
                  <span className="fcs-legendKey">
                    <span
                      className="fcs-legendSwatch"
                      style={{border: 'var(--border-width) solid var(--color-border)'}}
                    />
                    INT·D
                  </span>
                  <span className="fcs-legendKey">
                    <span className="fcs-legendSwatch" style={{background: BLUE}} />
                    INT·N
                  </span>
                  <span className="fcs-legendKey">
                    <span className="fcs-legendSwatch" style={{background: GREEN}} />
                    EXT·N
                  </span>
                  <span className="fcs-legendKey">
                    <span className="fcs-legendSwatch" style={{background: VIOLET}} />
                    DAWN
                  </span>
                  <span className="fcs-legendKey">
                    <span
                      className="fcs-legendSwatch"
                      style={{border: '1px dashed var(--color-border)', borderRadius: 3}}
                    />
                    derived move / lunch
                  </span>
                  <span className="fcs-legendKey">
                    <UtensilsIcon size={10} aria-hidden />
                    meal-penalty risk
                  </span>
                </div>
              </main>
              {/* ---- Rail: scene detail · call table · publish gate ---- */}
              <aside className="fcs-rail" aria-label="Scene detail, call times, and publish gate">
                <div className="fcs-detail">
                  {selectedScene != null && selectedSchedule != null ? (
                    <>
                      <span className="fcs-overline">
                        Scene detail — {DAY_BY_ID.get(selectedSceneDayId ?? '')?.label}
                        {selectedDayLocked ? ' (published, locked)' : ''}
                      </span>
                      <div className="fcs-detailTitleRow">
                        <span className="fcs-sceneNum">Sc {selectedScene.num}</span>
                        <span
                          className="fcs-ieTag"
                          style={{
                            color: stripFamily(selectedScene).color,
                            background: stripFamily(selectedScene).tint,
                          }}>
                          {stripFamily(selectedScene).tag}
                        </span>
                      </div>
                      <Heading level={2} maxLines={2}>
                        {selectedScene.set}
                      </Heading>
                      <Text type="supporting" size="xsm" color="secondary">
                        {selectedScene.synopsis}
                      </Text>
                      <div className="fcs-detailFacts">
                        <span className="fcs-factLabel">Cast</span>
                        <span className="fcs-factValue">
                          {selectedScene.castNums
                            .map(num => {
                              const member = CAST_BY_NUM.get(num);
                              return member != null ? \`\${num} \${member.name}\` : String(num);
                            })
                            .join(' · ')}
                        </span>
                        <span className="fcs-factLabel">Pages</span>
                        <span className="fcs-factValue">
                          {selectedScene.pagesLabel} ({selectedScene.pagesEighths}/8)
                        </span>
                        <span className="fcs-factLabel">Est</span>
                        <span className="fcs-factValue">
                          {minutesToDuration(selectedScene.estMinutes)}
                        </span>
                        <span className="fcs-factLabel">Location</span>
                        <span className="fcs-factValue">{selectedScene.location}</span>
                        {selectedEntry != null ? (
                          <>
                            <span className="fcs-factLabel">Sched</span>
                            <span className="fcs-factValue">
                              {minutesToClock(selectedSchedule.firstShotMin + selectedEntry.startOffset)}
                              –{minutesToClock(selectedSchedule.firstShotMin + selectedEntry.endOffset)}
                              {selectedEntry.mealPenalty ? ' · MEAL PENALTY RISK' : ''}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div className="fcs-moveRow" role="group" aria-label="Send scene to another day">
                        <span className="fcs-overline">Send to</span>
                        {DAYS.map(day => {
                          const isCurrent = day.id === selectedSceneDayId;
                          const targetLocked = board.published[day.id] != null;
                          const disabled = isCurrent || targetLocked || selectedDayLocked;
                          return (
                            <button
                              key={day.id}
                              type="button"
                              className={\`fcs-dayBtn fcs-fade\${isCurrent ? ' is-current' : ''}\`}
                              disabled={disabled}
                              aria-label={
                                isCurrent
                                  ? \`\${day.label} (current day)\`
                                  : targetLocked
                                    ? \`\${day.label} is published and locked\`
                                    : selectedDayLocked
                                      ? \`Cannot move — \${DAY_BY_ID.get(selectedSceneDayId ?? '')?.label} is published\`
                                      : \`Send scene \${selectedScene.num} to \${day.label}\`
                              }
                              onClick={() => moveScene(selectedScene.id, day.id)}>
                              {targetLocked && !isCurrent ? <LockIcon size={11} aria-hidden /> : null}
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="fcs-moveRow" role="group" aria-label="Reorder scene within its day">
                        <span className="fcs-overline">Order</span>
                        <button
                          type="button"
                          className="fcs-nudgeBtn fcs-fade"
                          disabled={selectedDayLocked || selectedIndex <= 0}
                          aria-label={\`Move scene \${selectedScene.num} earlier in the day\`}
                          onClick={() => nudgeScene(selectedScene.id, -1)}>
                          <ChevronUpIcon size={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="fcs-nudgeBtn fcs-fade"
                          disabled={selectedDayLocked || selectedIndex >= selectedDayCount - 1}
                          aria-label={\`Move scene \${selectedScene.num} later in the day\`}
                          onClick={() => nudgeScene(selectedScene.id, 1)}>
                          <ChevronDownIcon size={14} aria-hidden />
                        </button>
                        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                          Strip {selectedIndex + 1} of {selectedDayCount}
                        </Text>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="fcs-overline">Scene detail</span>
                      <Heading level={2}>No strip selected</Heading>
                      <Text type="supporting" size="sm" color="secondary">
                        Select a strip on the board to see its schedule window, send it to
                        another day, or reorder it. Sending Sc 24 off Day 14 clears both the
                        hard-out overrun and the meal-penalty risk.
                      </Text>
                    </>
                  )}
                </div>
                <div className="fcs-callTable">
                  <div className="fcs-callHead">
                    <span className="fcs-overline">Call times</span>
                    <span className="fcs-spring" />
                    {DAYS.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        className="fcs-dayTab fcs-fade"
                        aria-pressed={activeDayId === day.id}
                        onClick={() => setActiveDayId(day.id)}>
                        {day.label.replace('Day ', 'D')}
                      </button>
                    ))}
                  </div>
                  <CallTable schedule={activeSchedule} />
                </div>
                {/* Bottom-right corner owner: the publish gate. */}
                <div className="fcs-gate" aria-label={\`Publish gate for \${activeDay.label}\`}>
                  <span className="fcs-overline">
                    Publish gate — {activeDay.label} · {activeDay.date}
                  </span>
                  <div className="fcs-gateReqRow">
                    <span className={\`fcs-req fcs-fade \${activeGate.hardOutOk ? 'is-pass' : 'is-fail'}\`}>
                      {activeGate.hardOutOk ? (
                        <CheckIcon size={11} aria-hidden />
                      ) : (
                        <TriangleAlertIcon size={11} aria-hidden />
                      )}
                      Wrap {minutesToClock(activeSchedule.wrapMin)}
                      {activeGate.hardOutOk ? '' : \` > out \${minutesToClock(activeDay.hardOutMin)}\`}
                    </span>
                    <span
                      className={\`fcs-req fcs-fade \${activeGate.penaltyCount === 0 ? 'is-pass' : 'is-fail'}\`}>
                      {activeGate.penaltyCount === 0 ? (
                        <CheckIcon size={11} aria-hidden />
                      ) : (
                        <UtensilsIcon size={11} aria-hidden />
                      )}
                      Meal penalty · {activeGate.penaltyCount}
                    </span>
                    <span
                      className={\`fcs-req fcs-fade \${
                        !activeGate.turnaroundOk
                          ? 'is-fail'
                          : activeGate.turnaroundTight
                            ? 'is-tight'
                            : 'is-pass'
                      }\`}>
                      {activeGate.turnaroundOk ? (
                        <CheckIcon size={11} aria-hidden />
                      ) : (
                        <TriangleAlertIcon size={11} aria-hidden />
                      )}
                      {activeGate.turnaround == null
                        ? 'Turnaround · last board day'
                        : \`Turnaround \${minutesToDuration(activeGate.turnaround)} → \${activeNextDay?.label ?? ''}\`}
                    </span>
                  </div>
                  <div className="fcs-gateFoot">
                    {activePublished != null ? (
                      <Tooltip content="Distribution: cast, crew, studio safety, transpo">
                        <span className="fcs-req is-pass">
                          <CheckIcon size={11} aria-hidden />
                          {activePublished}
                        </span>
                      </Tooltip>
                    ) : (
                      <>
                        {!activeGate.allPass ? (
                          <Text type="supporting" size="xsm" color="secondary">
                            Clear {activeGate.failCount} requirement
                            {activeGate.failCount === 1 ? '' : 's'} to publish
                          </Text>
                        ) : null}
                        <Button
                          label={\`Publish \${activeDay.label} call sheet\`}
                          variant="primary"
                          size="sm"
                          icon={<Icon icon={SendIcon} size="sm" />}
                          isDisabled={!activeGate.allPass}
                          onClick={() => publishDay(activeDay.id)}>
                          Publish
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};