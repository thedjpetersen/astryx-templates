// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Vitrine collections-care surface
 *   for the Halloran Museum of Decorative Arts, Gallery 4, exhibition
 *   "Fire & Sand: Venetian Glass 1500–1700", ahead of outgoing loan
 *   LN-2026-031 to the Corning Museum of Glass (deinstall Fri 26 Jun 2026).
 *   Suite "today" anchor: Fri 12 Jun 2026 — every date and day-count is a
 *   pre-computed string/number pair (no clock reads, no randomness, no
 *   timers, no network assets).
 *   12 loan-listed objects across 4 locations (Case C1 4 + Case C2 4 +
 *   Case C3 3 + Wall W1 1 = 12 ✓). Check-recency policy is 30 days; the
 *   seeded days-since-check values are 15, 22, 13, 17, 39, 37, 14, 12, 16,
 *   18, 11, 43 — exactly three exceed 30 (1978.4.61 at 39d, 1978.4.66 at
 *   37d, 2003.5.1 at 43d), so checks-current opens at 9/12 ✓. The RH
 *   series is 56 literal points = 14 days × 4 samples (May 30 00:00 →
 *   Jun 12 18:00, 6-hourly); series minimum 41.2% sits at index 14 inside
 *   acknowledged low excursion E-201 (indices 12–15, all < 45), series
 *   maximum 63.4% at index 38 inside OPEN high excursion E-207 (logger
 *   window indices 36–39). Grade-D count opens at 0, so the movement gate
 *   opens at 1 of 3 requirements met (only "no grade D" passes).
 * @output Museum Exhibit Condition Log — a conservator's pre-movement
 *   working surface: a gallery OBJECT WALL of condition-graded tiles
 *   grouped by vitrine case (custom silhouette glyphs per object form,
 *   A–D grade badges, days-since-check due chips, droplet badges on cases
 *   inside an open humidity excursion); an ENVIRONMENT strip (14-day RH
 *   strip chart with 45–55% safe band, excursion windows as clickable
 *   overlays — open = red hatch, acknowledged = grey outline + tick — and
 *   a detail row with an Acknowledge action); a CONSERVATION LEDGER rail
 *   (append-only event spine: accession reports, checks, treatments,
 *   excursion acknowledgements, movement events, auto-filtered to the
 *   selected object) with a LOG CONDITION CHECK composer (A–D grade
 *   radiogroup with per-grade criteria, observation tag chips, note
 *   field); and a MOVEMENT GATE bar deriving three requirements live
 *   (12/12 checks current · 0 open excursions · 0 grade-D objects) that
 *   unlocks "Request movement approval". Signature move: logging a check
 *   updates the tile grade + last-checked on the wall, appends a ledger
 *   entry, and re-derives the gate counters; acknowledging E-207 restyles
 *   the chart window, clears the droplet badges on Case C2's four tiles,
 *   and ticks the second requirement; a grade-D check re-locks a granted
 *   gate to "On hold" — one store, five surfaces, both directions.
 * @position Page template; emitted by `astryx template
 *   museum-exhibit-condition-log`
 *
 * Frame: root 100dvh div (scope class) wrapping Layout height="fill".
 *   LayoutHeader owns the Vitrine chrome (mark + gallery/loan line | gate
 *   chip + live RH chip + conservator avatar). LayoutContent padding={0}
 *   hosts a hand-rolled `.mel-frame` CSS grid `minmax(0,1fr) 376px`
 *   (hand-rolled because the rail restacks via a media query, which DS
 *   grid inline styles would defeat). The main column is itself a grid
 *   `minmax(0,1fr) auto`: a scrolling wall+environment stack over the
 *   pinned 56px movement-gate bar. The aside is a grid `auto auto
 *   minmax(0,1fr)`: selected-object identity, check composer, scrolling
 *   ledger — so the composer never scrolls out from under the conservator.
 *
 * Responsive contract (the inline demo stage is ~1045–1075px and viewport
 * media queries DO NOT fire there — the default layout is designed to be
 * correct at ~1045px with no breakpoint):
 * - Default desktop: main ≈ 669px beside the 376px rail; the wall grid is
 *   repeat(auto-fill, minmax(150px, 1fr)) → 4 tiles per row (4×150 +
 *   3×12 gaps = 636 ≤ 645 content width ✓); the RH chart fills the main
 *   width (viewBox 672×152, scales fluidly).
 * - <=980px (full-screen narrow / tablet): `.mel-frame` becomes one
 *   column; the rail follows the main stack full-width and the ledger
 *   caps at 384px (6 × 64px rows) with its own scroll.
 * - <=640px (390px embed iframe): tiles relax to minmax(132px,1fr)
 *   (2-up at 390), the RH chart gains a 560px min-width inside an
 *   overflow-x scroller (subtraction, not squeeze), the gate bar wraps to
 *   two lines, the header drops the gallery + loan subtitles, and every
 *   action stays >=40px tall.
 * Corner map: top-left Vitrine mark + gallery/loan identity; top-right
 * gate chip + RH-now chip + conservator avatar; bottom-left movement-gate
 * bar (pinned inside the main column); bottom-right ledger tail /
 * composer actions in the rail.
 *
 * Container policy (collections-workbench archetype): frame-first rows,
 *   rails, tiles, and bordered section blocks — no marketing cards. The
 *   object wall is a tile grid of real <button>s; the chart is an inline
 *   SVG fed by a literal array; the ledger is a dense event spine.
 *
 * Color policy: token-pure chrome. ONE quarantined brand accent — Vitrine
 *   burgundy light-dark(#7C2437, #E58BA0): #7C2437 on #FFFFFF ≈ 9.7:1,
 *   #E58BA0 on #1E1E1E ≈ 6.8:1 (both clear 4.5:1 as text). Grade/state
 *   pairs, each with math at the declaration: A green light-dark(#15803D,
 *   #4ADE80) ≈ 4.6:1 / 10.1:1; B blue light-dark(#1D4ED8, #93C5FD) ≈
 *   6.3:1 / 8.6:1; C + check-due amber light-dark(#B45309, #FBBF24) ≈
 *   4.6:1 / 11.7:1; D + open-excursion red light-dark(#B91C1C, #F87171)
 *   ≈ 5.9:1 / 6.9:1; humidity cyan light-dark(#0E7490, #22D3EE) ≈ 4.9:1
 *   / 9.9:1. Every state color pairs with a non-color channel (grade
 *   LETTER in the badge, dashed tile border for overdue, hatch vs outline
 *   + tick for open vs acknowledged windows, droplet glyph). NEVER the
 *   nonexistent bare text token — text tokens are --color-text-primary /
 *   --color-text-secondary throughout.
 *
 * Density grid (repeated verbatim in the CSS): header bar 48 · case
 *   section header 30 · object tiles 128 tall on minmax(150px,1fr)
 *   columns · grade badge 20 · RH chart viewBox 672×152 · excursion
 *   detail row 64 min · aside rail 376 · ledger rows 64 min · composer
 *   grade blocks 44×40 · gate bar 56 · gutter var(--spacing-3) · 11px
 *   overlines · tabular-nums on every date, count, and percentage.
 *
 * Fixture policy: ONE state owner (the `gallery` store). logCheck,
 *   acknowledgeExcursion, and requestApproval flow through single mutation
 *   paths that re-derive the wall tiles, due chips, droplet badges, chart
 *   window styling, gate requirement counters, header gate chip, and the
 *   ledger in the same render. Aggregates cross-check by construction —
 *   every count on screen derives from the object/excursion rows, never
 *   stored twice. Day counts carry dual fields (lastChecked display
 *   string + daysSinceCheck number, verified in @input above).
 */

import {useState} from 'react';

import {
  ArchiveIcon,
  BrushIcon,
  CheckIcon,
  ClipboardCheckIcon,
  DropletsIcon,
  LockIcon,
  LockOpenIcon,
  TriangleAlertIcon,
  TruckIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// contrast math. ONE quarantined brand accent; grade/state families.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-museum-exhibit-condition-log';

// THE quarantined brand accent. #7C2437 on #FFFFFF ≈ 9.7:1; #E58BA0 on
// #1E1E1E ≈ 6.8:1 — safe as text and fill on both schemes.
const BRAND = 'light-dark(#7C2437, #E58BA0)';
const BRAND_TINT = 'light-dark(rgba(124, 36, 55, 0.08), rgba(229, 139, 160, 0.14))';

// Grade A / requirement-pass green: #15803D on #FFF ≈ 4.6:1; #4ADE80 on
// #1E1E1E ≈ 10.1:1.
const GREEN = 'light-dark(#15803D, #4ADE80)';
const GREEN_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Grade B blue: #1D4ED8 on #FFF ≈ 6.3:1; #93C5FD on #1E1E1E ≈ 8.6:1.
const BLUE = 'light-dark(#1D4ED8, #93C5FD)';
const BLUE_TINT = 'light-dark(rgba(29, 78, 216, 0.09), rgba(147, 197, 253, 0.14))';
// Grade C / check-due amber: #B45309 on #FFF ≈ 4.6:1; #FBBF24 on #1E1E1E
// ≈ 11.7:1.
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';
// Grade D / open-excursion red: #B91C1C on #FFF ≈ 5.9:1; #F87171 on
// #1E1E1E ≈ 6.9:1.
const RED = 'light-dark(#B91C1C, #F87171)';
const RED_TINT = 'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';
// Humidity cyan (RH trace + droplet badges): #0E7490 on #FFF ≈ 4.9:1;
// #22D3EE on #1E1E1E ≈ 9.9:1.
const CYAN = 'light-dark(#0E7490, #22D3EE)';
const CYAN_TINT = 'light-dark(rgba(14, 116, 144, 0.10), rgba(34, 211, 238, 0.14))';
// Excursion hatch stripes (translucent — sit over the chart surface).
const HATCH_RED = 'light-dark(rgba(185, 28, 28, 0.22), rgba(248, 113, 113, 0.26))';
const HATCH_GREY = 'light-dark(rgba(60, 60, 67, 0.16), rgba(235, 235, 245, 0.18))';
// Safe-band fill on the chart (green family, very light).
const BAND_TINT = 'light-dark(rgba(21, 128, 61, 0.07), rgba(74, 222, 128, 0.09))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors prefixed with the scope class. Density grid
// verbatim: header 48 · case header 30 · tiles 128 on minmax(150px,1fr) ·
// grade badge 20 · chart viewBox 672×152 · excursion row 64 · rail 376 ·
// ledger rows 64 · grade blocks 44×40 · gate bar 56 · gutter spacing-3.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${SCOPE} .mel-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${SCOPE} .mel-mono {
  font-family: ${MONO};
  font-variant-numeric: tabular-nums;
}
.${SCOPE} button:focus-visible {
  outline: 2px solid ${BRAND};
  outline-offset: 1px;
}
.${SCOPE} .mel-fade {
  transition: background-color 160ms ease, border-color 160ms ease,
    color 160ms ease, opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .mel-fade { transition: none; }
}

/* ---- Header bar 48px ---- */
.${SCOPE} .mel-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-height: 48px;
  min-width: 0;
}
.${SCOPE} .mel-brandCol { display: flex; flex-direction: column; min-width: 0; }
.${SCOPE} .mel-brandLine {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.${SCOPE} .mel-brandName { font-size: 14px; font-weight: 650; letter-spacing: 0.01em; }
.${SCOPE} .mel-brandGallery {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .mel-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .mel-spring { flex: 1; }
.${SCOPE} .mel-headChip {
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
.${SCOPE} .mel-headChip.is-locked { color: var(--color-text-secondary); border-color: var(--color-border); }
.${SCOPE} .mel-headChip.is-ready { color: ${GREEN}; background: ${GREEN_TINT}; }
.${SCOPE} .mel-headChip.is-requested { color: ${BRAND}; background: ${BRAND_TINT}; }
.${SCOPE} .mel-headChip.is-hold { color: ${RED}; background: ${RED_TINT}; }
.${SCOPE} .mel-rhChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${CYAN};
  white-space: nowrap;
}

/* ---- Frame: main column + 376px rail. Hand-rolled grid so the <=980px
   restack is a real media query, not a squeezed flex row. ---- */
.${SCOPE} .mel-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 376px;
  height: 100%;
  min-height: 0;
}
.${SCOPE} .mel-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}
.${SCOPE} .mel-mainScroll {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${SCOPE} .mel-rail {
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

/* ---- Object wall ---- */
.${SCOPE} .mel-caseSection { display: flex; flex-direction: column; gap: var(--spacing-2); }
.${SCOPE} .mel-caseHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 30px;
  min-width: 0;
}
.${SCOPE} .mel-caseName {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .mel-caseRule { flex: 1; height: 1px; background: var(--color-border); }
.${SCOPE} .mel-caseMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.${SCOPE} .mel-caseMeta.is-exc { color: ${CYAN}; }
.${SCOPE} .mel-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-3);
}
.${SCOPE} .mel-tile {
  font: inherit;
  color: inherit;
  text-align: left;
  margin: 0;
  cursor: pointer;
  height: 128px;
  padding: 9px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  position: relative;
}
.${SCOPE} .mel-tile.is-overdue { border-style: dashed; border-color: ${AMBER}; }
.${SCOPE} .mel-tile.is-selected {
  border-color: ${BRAND};
  border-style: solid;
  box-shadow: inset 0 0 0 1px ${BRAND};
  background: ${BRAND_TINT};
}
@media (hover: hover) {
  .${SCOPE} .mel-tile:hover { background: var(--color-background-muted); }
  .${SCOPE} .mel-tile.is-selected:hover { background: ${BRAND_TINT}; }
}
.${SCOPE} .mel-tileTop {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}
.${SCOPE} .mel-tileAcc {
  font-family: ${MONO};
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.${SCOPE} .mel-tileMid {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex: 1;
  min-height: 0;
  min-width: 0;
}
.${SCOPE} .mel-tileGlyph { flex-shrink: 0; color: var(--color-text-secondary); }
.${SCOPE} .mel-tile.is-selected .mel-tileGlyph { color: ${BRAND}; }
.${SCOPE} .mel-tileTitle {
  font-size: 12px;
  line-height: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-width: 0;
}
.${SCOPE} .mel-tileFoot {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  min-width: 0;
}
.${SCOPE} .mel-tileDate {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.${SCOPE} .mel-dueChip {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding-inline: 5px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: ${AMBER};
  background: ${AMBER_TINT};
  white-space: nowrap;
  flex-shrink: 0;
}
.${SCOPE} .mel-dropBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  color: ${CYAN};
  background: ${CYAN_TINT};
  flex-shrink: 0;
}

/* ---- Grade badge (20px, letter is the shape channel) ---- */
.${SCOPE} .mel-grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.${SCOPE} .mel-grade.is-a { color: ${GREEN}; background: ${GREEN_TINT}; }
.${SCOPE} .mel-grade.is-b { color: ${BLUE}; background: ${BLUE_TINT}; }
.${SCOPE} .mel-grade.is-c { color: ${AMBER}; background: ${AMBER_TINT}; }
.${SCOPE} .mel-grade.is-d { color: ${RED}; background: ${RED_TINT}; }

/* ---- Environment section ---- */
.${SCOPE} .mel-envCard {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${SCOPE} .mel-envHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  flex-wrap: wrap;
}
.${SCOPE} .mel-envTitle { font-size: 12px; font-weight: 650; white-space: nowrap; }
.${SCOPE} .mel-envLegend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-left: auto;
  flex-wrap: wrap;
}
.${SCOPE} .mel-legendKey {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .mel-chartScroll { overflow-x: auto; }
.${SCOPE} .mel-chartWrap { position: relative; min-width: 0; }
.${SCOPE} .mel-chartSvg { display: block; width: 100%; height: auto; }
.${SCOPE} .mel-winBtn {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.${SCOPE} .mel-winBtn[aria-pressed='true'] {
  outline: 2px solid ${BRAND};
  outline-offset: -2px;
  border-radius: 3px;
}
.${SCOPE} .mel-excRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-2);
  border-top: var(--border-width) solid var(--color-border);
  flex-wrap: wrap;
}
.${SCOPE} .mel-excIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  flex-shrink: 0;
}
.${SCOPE} .mel-excIcon.is-open { color: ${RED}; background: ${RED_TINT}; }
.${SCOPE} .mel-excIcon.is-acked { color: var(--color-text-secondary); background: var(--color-background-muted); }
.${SCOPE} .mel-excBody { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 2px; }
.${SCOPE} .mel-excTitle { font-size: 12px; font-weight: 650; }
.${SCOPE} .mel-excMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .mel-excAck {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: ${GREEN};
  white-space: nowrap;
}

/* ---- Movement gate bar 56px, pinned under the main scroller ---- */
.${SCOPE} .mel-gateBar {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-3);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  flex-wrap: wrap;
}
.${SCOPE} .mel-gateTitle { display: flex; flex-direction: column; min-width: 0; }
.${SCOPE} .mel-gateName { font-size: 12px; font-weight: 650; white-space: nowrap; }
.${SCOPE} .mel-gateSub {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .mel-req {
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
.${SCOPE} .mel-req.is-pass { color: ${GREEN}; background: ${GREEN_TINT}; border-color: transparent; }
.${SCOPE} .mel-req.is-fail { color: ${AMBER}; background: ${AMBER_TINT}; border-color: transparent; }
.${SCOPE} .mel-req.is-block { color: ${RED}; background: ${RED_TINT}; border-color: transparent; }
.${SCOPE} .mel-gateAction { margin-left: auto; display: flex; align-items: center; gap: var(--spacing-2); }

/* ---- Rail: identity, composer, ledger ---- */
.${SCOPE} .mel-idBlock {
  padding: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.${SCOPE} .mel-idTop { display: flex; align-items: center; gap: 7px; min-width: 0; }
.${SCOPE} .mel-idAcc {
  font-family: ${MONO};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${SCOPE} .mel-idFacts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  font-size: 11px;
}
.${SCOPE} .mel-idFactLabel {
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  align-self: baseline;
  white-space: nowrap;
}
.${SCOPE} .mel-idFactValue { font-variant-numeric: tabular-nums; min-width: 0; }
.${SCOPE} .mel-emptyRail {
  padding: var(--spacing-4) var(--spacing-3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  border-bottom: var(--border-width) solid var(--color-border);
}

/* ---- Composer ---- */
.${SCOPE} .mel-composer {
  padding: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${SCOPE} .mel-overline {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.${SCOPE} .mel-gradeRow { display: flex; gap: 6px; }
.${SCOPE} .mel-gradeBlock {
  font: inherit;
  margin: 0;
  cursor: pointer;
  width: 44px;
  height: 40px;
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.${SCOPE} .mel-gradeBlock[aria-checked='true'].is-a { color: ${GREEN}; background: ${GREEN_TINT}; border-color: ${GREEN}; }
.${SCOPE} .mel-gradeBlock[aria-checked='true'].is-b { color: ${BLUE}; background: ${BLUE_TINT}; border-color: ${BLUE}; }
.${SCOPE} .mel-gradeBlock[aria-checked='true'].is-c { color: ${AMBER}; background: ${AMBER_TINT}; border-color: ${AMBER}; }
.${SCOPE} .mel-gradeBlock[aria-checked='true'].is-d { color: ${RED}; background: ${RED_TINT}; border-color: ${RED}; }
.${SCOPE} .mel-gradeDesc {
  min-height: 30px;
  font-size: 11px;
  line-height: 15px;
  color: var(--color-text-secondary);
}
.${SCOPE} .mel-tagRow { display: flex; flex-wrap: wrap; gap: 6px; }
.${SCOPE} .mel-tagChip {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .mel-tagChip[aria-pressed='true'] {
  color: ${BRAND};
  background: ${BRAND_TINT};
  border-color: ${BRAND};
}
.${SCOPE} .mel-composeActions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  justify-content: flex-end;
}

/* ---- Ledger ---- */
.${SCOPE} .mel-ledger {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.${SCOPE} .mel-ledgerHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 36px;
  padding: 0 var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .mel-ledgerScope {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 24px;
  padding-inline: 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  margin-left: auto;
}
.${SCOPE} .mel-ledgerScope[aria-pressed='true'] {
  color: ${BRAND};
  border-color: ${BRAND};
  background: ${BRAND_TINT};
}
.${SCOPE} .mel-ledgerList {
  min-height: 0;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0 0 var(--spacing-3);
}
.${SCOPE} .mel-ledgerRow {
  display: flex;
  gap: 9px;
  min-height: 64px;
  padding: 9px var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .mel-ledgerRow.is-new { background: ${BRAND_TINT}; }
.${SCOPE} .mel-ledgerGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-top: 1px;
}
.${SCOPE} .mel-ledgerBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${SCOPE} .mel-ledgerTopLine {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}
.${SCOPE} .mel-ledgerObj {
  font-family: ${MONO};
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .mel-ledgerKind { font-size: 11px; font-weight: 650; white-space: nowrap; }
.${SCOPE} .mel-ledgerDate {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  margin-left: auto;
}
.${SCOPE} .mel-ledgerNote {
  font-size: 11px;
  line-height: 15px;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.${SCOPE} .mel-ledgerTags { display: flex; flex-wrap: wrap; gap: 4px; }
.${SCOPE} .mel-ledgerTag {
  font-size: 10px;
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  padding: 0 6px;
  line-height: 15px;
  white-space: nowrap;
}

/* ---- <=980px: rail restacks under the main column ---- */
@media (max-width: 980px) {
  .${SCOPE} .mel-frame { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto; }
  .${SCOPE} .mel-rail { border-left: none; border-top: var(--border-width) solid var(--color-border); }
  .${SCOPE} .mel-ledgerList { max-height: 384px; }
}

/* ---- <=640px (390px embed): subtraction, not squeeze ---- */
@media (max-width: 640px) {
  .${SCOPE} .mel-wall { grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); }
  .${SCOPE} .mel-chartWrap { min-width: 560px; }
  .${SCOPE} .mel-brandSub { display: none; }
  .${SCOPE} .mel-brandGallery { display: none; }
  .${SCOPE} .mel-gateAction { margin-left: 0; width: 100%; justify-content: flex-start; }
}
`;

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Vitrine at the Halloran Museum of
// Decorative Arts, Gallery 4, ahead of outgoing loan LN-2026-031. "Today"
// anchor: Fri 12 Jun 2026. All dates are pre-computed strings; day counts
// are pre-computed dual fields (verified against the anchor in the @input
// header comment).
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Fri 12 Jun 2026';
const TODAY_SHORT = '12 Jun 2026';
const CHECK_POLICY_DAYS = 30;

const LOAN = {
  id: 'LN-2026-031',
  borrower: 'Corning Museum of Glass',
  deinstall: '26 Jun 2026',
};

const CONSERVATOR = 'Mara Ellison';
const REGISTRAR = 'Tomás Reyes';

type Grade = 'A' | 'B' | 'C' | 'D';

const GRADE_META: Record<Grade, {cls: string; label: string; desc: string}> = {
  A: {
    cls: 'is-a',
    label: 'Grade A',
    desc: 'Excellent — stable; no change since the previous report.',
  },
  B: {
    cls: 'is-b',
    label: 'Grade B',
    desc: 'Good — minor, stable wear or old repairs noted.',
  },
  C: {
    cls: 'is-c',
    label: 'Grade C',
    desc: 'Fair — active or newly observed deterioration; monitor closely.',
  },
  D: {
    cls: 'is-d',
    label: 'Grade D',
    desc: 'Poor — unstable; movement blocked pending registrar review.',
  },
};

const GRADES: Grade[] = ['A', 'B', 'C', 'D'];

// Observation vocabulary for the check composer. 'Mount contact abrasion'
// (22 chars) is the chip-wrap stress fixture at the 376px rail width.
const OBSERVATION_TAGS = [
  'No change',
  'New chip / loss',
  'Crizzling active',
  'Gilding flaking',
  'Old repair stable',
  'Surface dust',
  'Mount contact abrasion',
];

type GlyphKind =
  | 'goblet'
  | 'wineglass'
  | 'tazza'
  | 'ewer'
  | 'flask'
  | 'bowl'
  | 'dish'
  | 'beaker'
  | 'mirror';

interface CaseDef {
  id: string;
  label: string;
}

const CASES: CaseDef[] = [
  {id: 'C1', label: 'Case C1 — Cristallo'},
  {id: 'C2', label: 'Case C2 — Filigrana'},
  {id: 'C3', label: 'Case C3 — Lattimo & Enamel'},
  {id: 'W1', label: 'Wall W1 — Mirrors'},
];

interface ArtObject {
  id: string; // accession number — referenced by identity everywhere
  title: string;
  maker: string;
  dated: string;
  material: string;
  glyph: GlyphKind;
  caseId: string;
  grade: Grade;
  lastChecked: string; // display field
  daysSinceCheck: number; // math dual field (vs the 12 Jun anchor)
}

// 12 objects: C1 4 + C2 4 + C3 3 + W1 1. 1952.7.19's 71-char title is the
// 3-line-clamp stress fixture; 1978.4.61 (39d), 1978.4.66 (37d), and
// 2003.5.1 (43d) are the three overdue checks that hold the gate at 9/12.
const INITIAL_OBJECTS: ArtObject[] = [
  {
    id: '1952.7.14',
    title: 'Goblet with serpent stem',
    maker: 'Venice',
    dated: 'ca. 1600',
    material: 'Cristallo glass',
    glyph: 'goblet',
    caseId: 'C1',
    grade: 'A',
    lastChecked: '28 May 2026',
    daysSinceCheck: 15,
  },
  {
    id: '1952.7.19',
    title: 'Covered goblet with diamond-point engraved arms of the Contarini family',
    maker: 'Venice',
    dated: 'ca. 1620',
    material: 'Cristallo glass, diamond-point engraving',
    glyph: 'goblet',
    caseId: 'C1',
    grade: 'B',
    lastChecked: '21 May 2026',
    daysSinceCheck: 22,
  },
  {
    id: '1961.3.8',
    title: 'Wineglass with ladder stem',
    maker: 'Venice or façon de Venise',
    dated: 'ca. 1660',
    material: 'Colorless glass',
    glyph: 'wineglass',
    caseId: 'C1',
    grade: 'A',
    lastChecked: '30 May 2026',
    daysSinceCheck: 13,
  },
  {
    id: '1948.11.2',
    title: 'Tazza with millefiori canes',
    maker: 'Venice',
    dated: 'ca. 1550',
    material: 'Millefiori glass',
    glyph: 'tazza',
    caseId: 'C1',
    grade: 'B',
    lastChecked: '26 May 2026',
    daysSinceCheck: 17,
  },
  {
    id: '1978.4.61',
    title: 'Ewer, vetro a fili',
    maker: 'Venice',
    dated: 'ca. 1575',
    material: 'Filigrana glass, gilt handle terminal',
    glyph: 'ewer',
    caseId: 'C2',
    grade: 'C',
    lastChecked: '4 May 2026',
    daysSinceCheck: 39,
  },
  {
    id: '1978.4.66',
    title: 'Flask, vetro a retorti',
    maker: 'Venice',
    dated: 'ca. 1580',
    material: 'Filigrana glass',
    glyph: 'flask',
    caseId: 'C2',
    grade: 'B',
    lastChecked: '6 May 2026',
    daysSinceCheck: 37,
  },
  {
    id: '1955.2.31',
    title: 'Bowl, vetro a reticello',
    maker: 'Venice',
    dated: 'ca. 1560',
    material: 'Filigrana glass',
    glyph: 'bowl',
    caseId: 'C2',
    grade: 'B',
    lastChecked: '29 May 2026',
    daysSinceCheck: 14,
  },
  {
    id: '1949.9.5',
    title: 'Dish with folded rim, vetro a fili',
    maker: 'Venice',
    dated: 'ca. 1570',
    material: 'Filigrana glass',
    glyph: 'dish',
    caseId: 'C2',
    grade: 'A',
    lastChecked: '31 May 2026',
    daysSinceCheck: 12,
  },
  {
    id: '1960.6.22',
    title: 'Lattimo beaker with enameled portrait',
    maker: 'Venice',
    dated: 'ca. 1500',
    material: 'Opaque white glass, enamel',
    glyph: 'beaker',
    caseId: 'C3',
    grade: 'B',
    lastChecked: '27 May 2026',
    daysSinceCheck: 16,
  },
  {
    id: '1946.1.77',
    title: 'Pilgrim flask with gilt enamel',
    maker: 'Venice',
    dated: 'ca. 1510',
    material: 'Blue glass, enamel, gilding',
    glyph: 'flask',
    caseId: 'C3',
    grade: 'B',
    lastChecked: '25 May 2026',
    daysSinceCheck: 18,
  },
  {
    id: '1972.8.3',
    title: 'Armorial plate with enamel decoration',
    maker: 'Venice',
    dated: 'ca. 1520',
    material: 'Colorless glass, enamel, gilding',
    glyph: 'dish',
    caseId: 'C3',
    grade: 'A',
    lastChecked: '1 Jun 2026',
    daysSinceCheck: 11,
  },
  {
    id: '2003.5.1',
    title: 'Mirror in carved and gilt frame',
    maker: 'Venice',
    dated: 'ca. 1680',
    material: 'Mirror plate, carved giltwood',
    glyph: 'mirror',
    caseId: 'W1',
    grade: 'B',
    lastChecked: '30 Apr 2026',
    daysSinceCheck: 43,
  },
];

// ---------------------------------------------------------------------------
// RH SERIES — 56 literal points = 14 days × 4 samples (00/06/12/18h),
// May 30 00:00 → Jun 12 18:00. Safe band 45–55%. Series min 41.2 (idx 14,
// inside E-201); series max 63.4 (idx 38, inside E-207). The header RH-now
// chip reads the LAST point (50.6).
// ---------------------------------------------------------------------------

// prettier-ignore
const RH_SERIES = [
  50.1, 49.8, 50.4, 50.0, // 30 May
  49.6, 49.2, 50.3, 50.6, // 31 May
  49.9, 48.7, 47.9, 46.8, //  1 Jun
  44.1, 41.9, 41.2, 43.6, //  2 Jun — E-201 low excursion (idx 12–15)
  46.4, 47.8, 48.9, 49.4, //  3 Jun
  49.8, 50.2, 50.7, 50.3, //  4 Jun
  50.0, 49.5, 49.1, 49.7, //  5 Jun
  50.4, 50.9, 51.3, 50.8, //  6 Jun
  50.2, 49.8, 50.5, 51.1, //  7 Jun
  53.9, 58.6, 63.4, 56.2, //  8 Jun — E-207 high excursion (idx 36–39)
  52.8, 51.6, 50.9, 50.4, //  9 Jun
  50.1, 49.7, 50.2, 50.6, // 10 Jun
  50.9, 51.2, 50.8, 50.5, // 11 Jun
  50.7, 51.0, 50.8, 50.6, // 12 Jun
];

// Axis day labels — one per 8 samples (every 2nd day) keeps the 672px-wide
// axis uncrowded at the ~669px default main width.
const RH_DAY_TICKS: Array<{idx: number; label: string}> = [
  {idx: 0, label: '30 May'},
  {idx: 8, label: '1 Jun'},
  {idx: 16, label: '3 Jun'},
  {idx: 24, label: '5 Jun'},
  {idx: 32, label: '7 Jun'},
  {idx: 40, label: '9 Jun'},
  {idx: 48, label: '11 Jun'},
];

const RH_SAFE_MIN = 45;
const RH_SAFE_MAX = 55;

type ExcursionState = 'open' | 'acknowledged';

interface Excursion {
  id: string;
  kind: 'high' | 'low';
  startIdx: number; // index into RH_SERIES
  endIdx: number;
  dateLabel: string;
  peakLabel: string; // logger-derived display figure
  durationLabel: string;
  cause: string;
  caseIds: string[];
  state: ExcursionState;
  ackLine?: string; // present only when acknowledged
}

const INITIAL_EXCURSIONS: Excursion[] = [
  {
    id: 'E-201',
    kind: 'low',
    startIdx: 12,
    endIdx: 15,
    dateLabel: '2 Jun 2026',
    peakLabel: 'trough 41.2% RH',
    durationLabel: '11h below 45%',
    cause: 'HVAC economizer fault; work order WO-8841 closed 3 Jun.',
    caseIds: ['C1', 'C3'],
    state: 'acknowledged',
    ackLine: `Acknowledged by M. Ellison — 3 Jun 2026`,
  },
  {
    id: 'E-207',
    kind: 'high',
    startIdx: 36,
    endIdx: 39,
    dateLabel: '8 Jun 2026',
    peakLabel: 'peak 63.4% RH',
    durationLabel: '9h above 55%',
    cause: 'Case C2 opened during gallery deep-clean; reseated gasket suspected.',
    caseIds: ['C2'],
    state: 'open',
  },
];

type LedgerKind = 'accession' | 'check' | 'treatment' | 'excursion' | 'movement';

interface LedgerEvent {
  id: string;
  kind: LedgerKind;
  objectId: string | null; // null = gallery-level event
  date: string;
  author: string;
  grade?: Grade; // present on check events
  tags?: string[]; // present on check events
  note: string;
}

// Seed ledger, oldest → newest (ids ascend with time; the UI renders it
// newest-first). Next live event id is LE-238.
const INITIAL_LEDGER: LedgerEvent[] = [
  {
    id: 'LE-230',
    kind: 'accession',
    objectId: '2003.5.1',
    date: '12 Mar 2026',
    author: `${REGISTRAR} (Registrar)`,
    note:
      'Baseline condition report for loan LN-2026-031 packing list: carved ' +
      'giltwood frame stable; scattered foxing to mirror plate; two age ' +
      'cracks in the lower member, unchanged since the 2019 survey.',
  },
  {
    id: 'LE-231',
    kind: 'treatment',
    objectId: '1978.4.61',
    date: '22 May 2026',
    author: CONSERVATOR,
    note:
      'Consolidated flaking gilding at the handle terminal with 2% Paraloid ' +
      'B-72 in acetone; 24h re-check clean. Grade held at C pending a ' +
      'stability window.',
  },
  {
    id: 'LE-232',
    kind: 'check',
    objectId: '1955.2.31',
    date: '29 May 2026',
    author: CONSERVATOR,
    grade: 'B',
    tags: ['Old repair stable'],
    note: 'Historic rim repair unchanged since the March report; adhesive line stable under UV.',
  },
  {
    id: 'LE-233',
    kind: 'check',
    objectId: '1961.3.8',
    date: '30 May 2026',
    author: CONSERVATOR,
    grade: 'A',
    tags: ['No change', 'Surface dust'],
    note: 'Light dust on the foot; removed with soft brush. No new condition issues.',
  },
  {
    id: 'LE-234',
    kind: 'check',
    objectId: '1949.9.5',
    date: '31 May 2026',
    author: CONSERVATOR,
    grade: 'A',
    tags: ['No change'],
    note: 'Fili canes crisp, rim fold intact.',
  },
  {
    id: 'LE-235',
    kind: 'check',
    objectId: '1972.8.3',
    date: '1 Jun 2026',
    author: CONSERVATOR,
    grade: 'A',
    tags: ['No change'],
    note: 'Enamel and gilding stable under raking light; no new losses.',
  },
  {
    id: 'LE-236',
    kind: 'excursion',
    objectId: null,
    date: '3 Jun 2026',
    author: CONSERVATOR,
    note:
      'E-201 acknowledged: overnight RH trough 41.2% (11h below 45%) from an ' +
      'HVAC economizer fault. Cases C1 and C3 spot-checked — no crizzling ' +
      'response observed. WO-8841 closed.',
  },
  {
    id: 'LE-237',
    kind: 'excursion',
    objectId: null,
    date: '8 Jun 2026',
    author: 'Vitrine environment monitor',
    note:
      'E-207 detected: RH above 55% in Case C2 for 9h (peak 63.4%) during ' +
      'the gallery deep-clean. Acknowledgement with a case spot-check is ' +
      'required before movement approval.',
  },
];

const NEXT_EVENT_NUM = 238;

// ---------------------------------------------------------------------------
// VITRINE MARK — 22px inline SVG: a display case (vitrine) on a plinth with
// an object dot inside. Brand accent as stroke/fill — never as body text.
// ---------------------------------------------------------------------------

function VitrineMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden style={{flexShrink: 0}}>
      <rect x={4.5} y={2.5} width={13} height={12} rx={1.5} fill="none" stroke={BRAND} strokeWidth={1.8} />
      <circle cx={11} cy={9.5} r={2.2} fill={BRAND} />
      <path d="M3 17.5h16M8 17.5v2.5M14 17.5v2.5" fill="none" stroke={BRAND} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// OBJECT GLYPHS — 24px stroke silhouettes, one per object form. Fully custom
// domain vocabulary: no icon set distinguishes a tazza from a beaker. All
// use currentColor so tile selection recolors them via CSS.
// ---------------------------------------------------------------------------

const GLYPH_PATHS: Record<GlyphKind, string> = {
  goblet: 'M8 3h8c0 4.5-1.6 7.5-4 7.5S8 7.5 8 3ZM12 10.5V18M8.5 20.5h7M12 18c0 1.4-1.2 2.5-3.5 2.5M12 18c0 1.4 1.2 2.5 3.5 2.5',
  wineglass: 'M9 3h6c0 5-1.2 8-3 8s-3-3-3-8ZM12 11v8M9 20.5h6',
  tazza: 'M5.5 6h13c-1 3.2-3.4 5-6.5 5S6.5 9.2 5.5 6ZM12 11v6.5M8.5 20.5h7M12 17.5c0 1.5-1.3 3-3.5 3M12 17.5c0 1.5 1.3 3 3.5 3',
  ewer: 'M10 3.5h4l1 3c1.8 1.2 3 3.2 3 5.5 0 3.5-2.7 6.5-6 6.5s-6-3-6-6.5c0-2.3 1.2-4.3 3-5.5l1-3ZM8.5 20.5h7M15 7l3.5-2v4',
  flask: 'M10.5 3h3v4.5c2.6 1 4.5 3.4 4.5 6.3 0 3.7-2.7 6.7-6 6.7s-6-3-6-6.7c0-2.9 1.9-5.3 4.5-6.3V3Z',
  bowl: 'M4.5 9.5h15a7.5 7.5 0 0 1-15 0ZM9 20.5h6M12 17v3.5',
  dish: 'M3.5 11.5h17M5.5 11.5c0 2.5 2.9 4.5 6.5 4.5s6.5-2 6.5-4.5M8 20.5h8M12 16v4.5',
  beaker: 'M8.5 3.5h7l-1 17h-5l-1-17ZM8.8 8h6.4',
  mirror: 'M6.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V4a1.5 1.5 0 0 1 1.5-1.5ZM8 5.5h6v11H8ZM9.5 8l3 3',
};

function ObjectGlyph({kind}: {kind: GlyphKind}) {
  return (
    <svg
      className="mel-tileGlyph"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={GLYPH_PATHS[kind]} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// GradeBadge — 20px letter badge. The LETTER is the non-color channel; the
// tint family doubles it.
// ---------------------------------------------------------------------------

function GradeBadge({grade}: {grade: Grade}) {
  return (
    <span className={`mel-grade ${GRADE_META[grade].cls}`} aria-hidden>
      {grade}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ObjectTile — 128px condition tile, a real <button>. Omit-when-clear
// segments: the due chip renders only past the 30-day policy, the droplet
// only while the object's case sits inside an OPEN excursion.
// ---------------------------------------------------------------------------

interface ObjectTileProps {
  object: ArtObject;
  isSelected: boolean;
  inOpenExcursion: boolean;
  onSelect: () => void;
}

function ObjectTile({object, isSelected, inOpenExcursion, onSelect}: ObjectTileProps) {
  const overdue = object.daysSinceCheck > CHECK_POLICY_DAYS;
  const labelParts = [
    object.id,
    object.title,
    `grade ${object.grade}`,
    `last checked ${object.lastChecked}`,
  ];
  if (overdue) labelParts.push(`check overdue by ${object.daysSinceCheck - CHECK_POLICY_DAYS} days`);
  if (inOpenExcursion) labelParts.push('inside an open humidity excursion');
  return (
    <button
      type="button"
      className={`mel-tile mel-fade${overdue ? ' is-overdue' : ''}${isSelected ? ' is-selected' : ''}`}
      aria-pressed={isSelected}
      aria-label={labelParts.join(', ')}
      onClick={onSelect}>
      <span className="mel-tileTop">
        <span className="mel-tileAcc">{object.id}</span>
        {inOpenExcursion ? (
          <Tooltip content="Case inside an open humidity excursion">
            <span className="mel-dropBadge">
              <DropletsIcon size={11} aria-hidden />
            </span>
          </Tooltip>
        ) : null}
        <GradeBadge grade={object.grade} />
      </span>
      <span className="mel-tileMid">
        <ObjectGlyph kind={object.glyph} />
        <span className="mel-tileTitle">{object.title}</span>
      </span>
      <span className="mel-tileFoot">
        <span className="mel-tileDate">Checked {object.lastChecked}</span>
        {overdue ? <span className="mel-dueChip">{object.daysSinceCheck}d</span> : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// RH STRIP CHART — inline SVG, viewBox 672×152, fed by the literal series.
// Geometry: plot x 34→664 (x = 34 + idx · 630/55), y maps 35–70% RH onto
// 12→130 (y = 12 + (70 − v) · 118/35). Safe band 45–55 as a green-tint
// rect; excursion windows as hatch (open, red) or outline + tick
// (acknowledged, grey). Window hit areas are REAL HTML <button>s absolutely
// positioned over the SVG (SVG rects are not focusable controls), widened
// by half a sample each side so the smallest window still exceeds 40px.
// ---------------------------------------------------------------------------

const CHART_W = 672;
const CHART_H = 152;
const PLOT_X0 = 34;
const PLOT_X1 = 664;
const PLOT_Y0 = 12;
const PLOT_Y1 = 130;
const RH_AXIS_MAX = 70;
const RH_AXIS_MIN = 35;

function chartX(idx: number): number {
  return PLOT_X0 + (idx * (PLOT_X1 - PLOT_X0)) / (RH_SERIES.length - 1);
}

function chartY(value: number): number {
  return PLOT_Y0 + ((RH_AXIS_MAX - value) * (PLOT_Y1 - PLOT_Y0)) / (RH_AXIS_MAX - RH_AXIS_MIN);
}

const RH_POLYLINE = RH_SERIES.map(
  (value, idx) => `${chartX(idx).toFixed(1)},${chartY(value).toFixed(1)}`,
).join(' ');

interface RhStripChartProps {
  excursions: Excursion[];
  selectedExcursionId: string | null;
  onSelectExcursion: (id: string) => void;
}

function RhStripChart({excursions, selectedExcursionId, onSelectExcursion}: RhStripChartProps) {
  return (
    <div className="mel-chartScroll">
      <div className="mel-chartWrap">
        <svg
          className="mel-chartSvg"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          role="img"
          aria-label={
            'Relative humidity, 30 May to 12 June, 6-hourly. Safe band 45 to 55 percent. ' +
            excursions
              .map(e => `Excursion ${e.id} on ${e.dateLabel}, ${e.peakLabel}, ${e.state}.`)
              .join(' ')
          }>
          {/* Safe band 45–55% */}
          <rect
            x={PLOT_X0}
            y={chartY(RH_SAFE_MAX)}
            width={PLOT_X1 - PLOT_X0}
            height={chartY(RH_SAFE_MIN) - chartY(RH_SAFE_MAX)}
            fill={BAND_TINT}
          />
          <line
            x1={PLOT_X0}
            x2={PLOT_X1}
            y1={chartY(RH_SAFE_MAX)}
            y2={chartY(RH_SAFE_MAX)}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <line
            x1={PLOT_X0}
            x2={PLOT_X1}
            y1={chartY(RH_SAFE_MIN)}
            y2={chartY(RH_SAFE_MIN)}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          {/* y-axis labels */}
          {[70, 55, 45, 35].map(v => (
            <text
              key={v}
              x={PLOT_X0 - 6}
              y={chartY(v) + 3.5}
              textAnchor="end"
              fontSize={9}
              fill="var(--color-text-secondary)"
              style={{fontVariantNumeric: 'tabular-nums'}}>
              {v}
            </text>
          ))}
          {/* Excursion windows — hatch for open, outline + tick for acked */}
          {excursions.map(exc => {
            const x0 = chartX(exc.startIdx);
            const x1 = chartX(exc.endIdx);
            const isOpen = exc.state === 'open';
            return (
              <g key={exc.id}>
                <rect
                  x={x0}
                  y={PLOT_Y0}
                  width={x1 - x0}
                  height={PLOT_Y1 - PLOT_Y0}
                  fill={isOpen ? 'url(#mel-hatch-open)' : 'none'}
                  stroke={isOpen ? RED : 'var(--color-text-secondary)'}
                  strokeDasharray={isOpen ? undefined : '3 3'}
                />
                <text
                  x={(x0 + x1) / 2}
                  y={PLOT_Y0 - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={650}
                  fill={isOpen ? RED : 'var(--color-text-secondary)'}
                  style={{fontVariantNumeric: 'tabular-nums'}}>
                  {exc.id}
                </text>
                {!isOpen ? (
                  <path
                    d={`M${x1 - 10} ${PLOT_Y0 + 9} l3 3 l5 -6`}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </g>
            );
          })}
          <defs>
            <pattern id="mel-hatch-open" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width={6} height={6} fill="transparent" />
              <rect width={2} height={6} fill={HATCH_RED} />
            </pattern>
            <pattern id="mel-hatch-grey" width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width={6} height={6} fill="transparent" />
              <rect width={2} height={6} fill={HATCH_GREY} />
            </pattern>
          </defs>
          {/* RH trace */}
          <polyline points={RH_POLYLINE} fill="none" stroke={CYAN} strokeWidth={1.6} strokeLinejoin="round" />
          {/* x-axis day ticks */}
          {RH_DAY_TICKS.map(tick => (
            <g key={tick.idx}>
              <line
                x1={chartX(tick.idx)}
                x2={chartX(tick.idx)}
                y1={PLOT_Y1}
                y2={PLOT_Y1 + 4}
                stroke="var(--color-border)"
              />
              <text
                x={chartX(tick.idx)}
                y={PLOT_Y1 + 15}
                textAnchor="middle"
                fontSize={9}
                fill="var(--color-text-secondary)"
                style={{fontVariantNumeric: 'tabular-nums'}}>
                {tick.label}
              </text>
            </g>
          ))}
          <line x1={PLOT_X0} x2={PLOT_X1} y1={PLOT_Y1} y2={PLOT_Y1} stroke="var(--color-border)" />
        </svg>
        {/* Real-button hit areas over the excursion windows (±half a sample
            so the narrowest window clears a 40px hit width at default
            scale: E-201 spans idx 11.5–15.5 ≈ 46px). */}
        {excursions.map(exc => {
          const x0 = chartX(Math.max(exc.startIdx - 0.5, 0));
          const x1 = chartX(Math.min(exc.endIdx + 0.5, RH_SERIES.length - 1));
          return (
            <button
              key={exc.id}
              type="button"
              className="mel-winBtn"
              style={{left: `${(x0 / CHART_W) * 100}%`, width: `${((x1 - x0) / CHART_W) * 100}%`}}
              aria-pressed={selectedExcursionId === exc.id}
              aria-label={`Excursion ${exc.id}, ${exc.dateLabel}, ${exc.peakLabel}, ${
                exc.state === 'open' ? 'open — acknowledgement required' : 'acknowledged'
              }`}
              onClick={() => onSelectExcursion(exc.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LEDGER ROW — dense event spine row (64px min). Kind glyph + top line
// (object chip · kind · date) + tags + clamped note.
// ---------------------------------------------------------------------------

const LEDGER_KIND_META: Record<LedgerKind, {label: string; icon: typeof CheckIcon}> = {
  accession: {label: 'Condition report', icon: ArchiveIcon},
  check: {label: 'Condition check', icon: ClipboardCheckIcon},
  treatment: {label: 'Treatment', icon: BrushIcon},
  excursion: {label: 'Environment', icon: DropletsIcon},
  movement: {label: 'Movement', icon: TruckIcon},
};

function LedgerRowView({event, isNew}: {event: LedgerEvent; isNew: boolean}) {
  const meta = LEDGER_KIND_META[event.kind];
  const KindIcon = meta.icon;
  return (
    <li className={`mel-ledgerRow mel-fade${isNew ? ' is-new' : ''}`}>
      <span className="mel-ledgerGlyph" aria-hidden>
        <KindIcon size={13} />
      </span>
      <div className="mel-ledgerBody">
        <div className="mel-ledgerTopLine">
          <span className="mel-ledgerObj">{event.objectId ?? 'Gallery 4'}</span>
          <span className="mel-ledgerKind">{meta.label}</span>
          {event.grade != null ? <GradeBadge grade={event.grade} /> : null}
          <span className="mel-ledgerDate">
            {event.date} · {event.author}
          </span>
        </div>
        {event.tags != null && event.tags.length > 0 ? (
          <div className="mel-ledgerTags">
            {event.tags.map(tag => (
              <span key={tag} className="mel-ledgerTag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mel-ledgerNote" style={{margin: 0}}>
          {event.note}
        </p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// CHECK COMPOSER — grade radiogroup (44×40 blocks), observation tag chips,
// note input. Purely presentational: submission goes up to the owner. Keyed
// by object id in the page so drafts reset per object.
// ---------------------------------------------------------------------------

interface CheckComposerProps {
  object: ArtObject;
  onLogCheck: (grade: Grade, tags: string[], note: string) => void;
}

function CheckComposer({object, onLogCheck}: CheckComposerProps) {
  const [draftGrade, setDraftGrade] = useState<Grade>(object.grade);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftNote, setDraftNote] = useState('');

  const toggleTag = (tag: string) => {
    setDraftTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const submit = () => {
    onLogCheck(draftGrade, draftTags, draftNote.trim());
    setDraftTags([]);
    setDraftNote('');
  };

  return (
    <div className="mel-composer">
      <span className="mel-overline">Log condition check — {TODAY_SHORT}</span>
      <div className="mel-gradeRow" role="radiogroup" aria-label="Condition grade">
        {GRADES.map(grade => (
          <button
            key={grade}
            type="button"
            role="radio"
            aria-checked={draftGrade === grade}
            aria-label={`${GRADE_META[grade].label}: ${GRADE_META[grade].desc}`}
            className={`mel-gradeBlock mel-fade ${GRADE_META[grade].cls}`}
            onClick={() => setDraftGrade(grade)}>
            {grade}
          </button>
        ))}
      </div>
      <div className="mel-gradeDesc">{`${GRADE_META[draftGrade].label} — ${GRADE_META[draftGrade].desc}`}</div>
      <div className="mel-tagRow" role="group" aria-label="Observations">
        {OBSERVATION_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            className="mel-tagChip mel-fade"
            aria-pressed={draftTags.includes(tag)}
            onClick={() => toggleTag(tag)}>
            {tag}
          </button>
        ))}
      </div>
      <TextInput
        label="Check note"
        isLabelHidden
        size="sm"
        placeholder="Note (optional) — e.g. raking-light result"
        value={draftNote}
        onChange={setDraftNote}
        onEnter={submit}
      />
      <div className="mel-composeActions">
        {draftGrade === 'D' ? (
          <Text type="supporting" size="xsm" color="secondary">
            Grade D blocks the movement gate
          </Text>
        ) : null}
        <Button
          label={`Log check for ${object.id}`}
          variant="primary"
          size="sm"
          icon={<Icon icon={ClipboardCheckIcon} size="sm" />}
          onClick={submit}>
          Log check
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. Every mutation (logCheck / acknowledge /
// request) flows through the `gallery` store and re-derives the wall, the
// chart, the gate, the header chips, and the ledger in the same render.
// ---------------------------------------------------------------------------

interface GalleryStore {
  objects: ArtObject[];
  excursions: Excursion[];
  ledger: LedgerEvent[]; // oldest → newest; UI renders reversed
  approvalRequested: boolean;
  nextEventNum: number;
}

const INITIAL_STORE: GalleryStore = {
  objects: INITIAL_OBJECTS,
  excursions: INITIAL_EXCURSIONS,
  ledger: INITIAL_LEDGER,
  approvalRequested: false,
  nextEventNum: NEXT_EVENT_NUM,
};

type GateStatus = 'locked' | 'ready' | 'requested' | 'hold';

export default function MuseumExhibitConditionLogTemplate() {
  const [gallery, setGallery] = useState<GalleryStore>(INITIAL_STORE);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedExcursionId, setSelectedExcursionId] = useState<string | null>(null);
  const [ledgerScopeAll, setLedgerScopeAll] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // ---- Derived aggregates (always from the rows, never stored twice) ------
  const {objects, excursions, ledger, approvalRequested} = gallery;
  const checksCurrent = objects.filter(o => o.daysSinceCheck <= CHECK_POLICY_DAYS).length;
  const openExcursions = excursions.filter(e => e.state === 'open');
  const openExcursionCaseIds = new Set(openExcursions.flatMap(e => e.caseIds));
  const gradeDObjects = objects.filter(o => o.grade === 'D');
  const gateReady =
    checksCurrent === objects.length && openExcursions.length === 0 && gradeDObjects.length === 0;
  const requirementsMet =
    (checksCurrent === objects.length ? 1 : 0) +
    (openExcursions.length === 0 ? 1 : 0) +
    (gradeDObjects.length === 0 ? 1 : 0);
  const gateStatus: GateStatus = approvalRequested
    ? gateReady
      ? 'requested'
      : 'hold'
    : gateReady
      ? 'ready'
      : 'locked';
  const rhNow = RH_SERIES[RH_SERIES.length - 1];

  const selectedObject = objects.find(o => o.id === selectedObjectId) ?? null;
  // Environment detail row: explicit selection wins; otherwise the first
  // open excursion keeps the acknowledgement affordance visible.
  const detailExcursion =
    excursions.find(e => e.id === selectedExcursionId) ?? openExcursions[0] ?? null;

  // ---- Mutations — one store, observable consequences everywhere ----------
  const logCheck = (objectId: string, grade: Grade, tags: string[], note: string) => {
    const eventId = `LE-${gallery.nextEventNum}`;
    const nextObjects = gallery.objects.map(o =>
      o.id === objectId ? {...o, grade, lastChecked: TODAY_SHORT, daysSinceCheck: 0} : o,
    );
    const event: LedgerEvent = {
      id: eventId,
      kind: 'check',
      objectId,
      date: TODAY_SHORT,
      author: CONSERVATOR,
      grade,
      tags: tags.length > 0 ? tags : undefined,
      note:
        note.length > 0
          ? note
          : `Routine pre-movement check ahead of ${LOAN.id}; graded ${grade}.`,
    };
    setGallery(prev => ({
      ...prev,
      objects: nextObjects,
      ledger: [...prev.ledger, event],
      nextEventNum: prev.nextEventNum + 1,
    }));
    const nextCurrent = nextObjects.filter(o => o.daysSinceCheck <= CHECK_POLICY_DAYS).length;
    setAnnouncement(
      `Check logged for ${objectId}, grade ${grade}. Checks current ${nextCurrent} of ${nextObjects.length}.` +
        (grade === 'D' ? ' Grade D blocks the movement gate pending registrar review.' : ''),
    );
  };

  const acknowledgeExcursion = (excursionId: string) => {
    const exc = gallery.excursions.find(e => e.id === excursionId);
    if (exc == null || exc.state !== 'open') return;
    const eventId = `LE-${gallery.nextEventNum}`;
    const event: LedgerEvent = {
      id: eventId,
      kind: 'excursion',
      objectId: null,
      date: TODAY_SHORT,
      author: CONSERVATOR,
      note:
        `${exc.id} acknowledged: ${exc.peakLabel}, ${exc.durationLabel} on ` +
        `${exc.dateLabel} (cases ${exc.caseIds.join(', ')}). ${exc.cause} ` +
        'Case spot-check clean — no condition response observed.',
    };
    setGallery(prev => ({
      ...prev,
      excursions: prev.excursions.map(e =>
        e.id === excursionId
          ? {...e, state: 'acknowledged' as const, ackLine: `Acknowledged by M. Ellison — ${TODAY_SHORT}`}
          : e,
      ),
      ledger: [...prev.ledger, event],
      nextEventNum: prev.nextEventNum + 1,
    }));
    const remainingOpen = gallery.excursions.filter(
      e => e.state === 'open' && e.id !== excursionId,
    ).length;
    setAnnouncement(
      `Excursion ${excursionId} acknowledged. ${remainingOpen} open excursion${
        remainingOpen === 1 ? '' : 's'
      } remaining.`,
    );
  };

  const requestApproval = () => {
    if (!gateReady || gallery.approvalRequested) return;
    const eventId = `LE-${gallery.nextEventNum}`;
    const event: LedgerEvent = {
      id: eventId,
      kind: 'movement',
      objectId: null,
      date: TODAY_SHORT,
      author: CONSERVATOR,
      note:
        `Movement approval requested for ${LOAN.id} (${gallery.objects.length} objects, ` +
        `deinstall ${LOAN.deinstall}) — sent to ${REGISTRAR} for registrar countersign.`,
    };
    setGallery(prev => ({
      ...prev,
      approvalRequested: true,
      ledger: [...prev.ledger, event],
      nextEventNum: prev.nextEventNum + 1,
    }));
    setAnnouncement(`Movement approval requested for loan ${LOAN.id}.`);
  };

  // ---- Ledger view (newest first; scoped to the selection unless the
  // conservator flips the All-gallery chip) --------------------------------
  const scopedToObject = selectedObject != null && !ledgerScopeAll;
  const visibleLedger = [...ledger]
    .reverse()
    .filter(event => (scopedToObject ? event.objectId === selectedObject.id : true));
  // Session-created events highlight: seed ids stop below NEXT_EVENT_NUM.
  const isSessionEvent = (id: string) => Number(id.slice(3)) >= NEXT_EVENT_NUM;

  const selectObject = (id: string) => {
    setSelectedObjectId(prev => (prev === id ? null : id));
    setLedgerScopeAll(false);
  };

  // ---- Header chip -----------------------------------------------------
  const gateChip =
    gateStatus === 'locked' ? (
      <span className="mel-headChip is-locked mel-fade">
        <LockIcon size={12} aria-hidden />
        Gate {requirementsMet}/3
      </span>
    ) : gateStatus === 'ready' ? (
      <span className="mel-headChip is-ready mel-fade">
        <LockOpenIcon size={12} aria-hidden />
        Ready to request
      </span>
    ) : gateStatus === 'requested' ? (
      <span className="mel-headChip is-requested mel-fade">
        <CheckIcon size={12} aria-hidden />
        Approval requested
      </span>
    ) : (
      <span className="mel-headChip is-hold mel-fade">
        <TriangleAlertIcon size={12} aria-hidden />
        Approval on hold
      </span>
    );

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      {/* Polite live region — every mutation announces its consequence. */}
      <div className="mel-vh" aria-live="polite">
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="mel-headRow">
              <VitrineMark />
              <div className="mel-brandCol">
                <div className="mel-brandLine">
                  <span className="mel-brandName">Vitrine</span>
                  <span className="mel-brandGallery">
                    Halloran Museum · Gallery 4 — Fire &amp; Sand: Venetian Glass 1500–1700
                  </span>
                </div>
                <span className="mel-brandSub">
                  Loan {LOAN.id} → {LOAN.borrower} · deinstall {LOAN.deinstall} · today {TODAY_LABEL}
                </span>
              </div>
              <div className="mel-spring" />
              {gateChip}
              <Tooltip content="Gallery 4 relative humidity — latest 6-hour sample">
                <span className="mel-rhChip">
                  <DropletsIcon size={12} aria-hidden />
                  {rhNow.toFixed(1)}% RH
                </span>
              </Tooltip>
              <Avatar name={CONSERVATOR} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div className="mel-frame">
              <main className="mel-main">
                <div className="mel-mainScroll">
                  {/* ---- Object wall, grouped by case ---- */}
                  {CASES.map(caseDef => {
                    const caseObjects = objects.filter(o => o.caseId === caseDef.id);
                    const caseCurrent = caseObjects.filter(
                      o => o.daysSinceCheck <= CHECK_POLICY_DAYS,
                    ).length;
                    const caseOpenExc = openExcursions.find(e => e.caseIds.includes(caseDef.id));
                    return (
                      <section
                        key={caseDef.id}
                        className="mel-caseSection"
                        aria-label={caseDef.label}>
                        <div className="mel-caseHead">
                          <h2 className="mel-caseName" style={{margin: 0}}>
                            {caseDef.label}
                          </h2>
                          <span className="mel-caseRule" aria-hidden />
                          {caseOpenExc != null ? (
                            <span className="mel-caseMeta is-exc">
                              <DropletsIcon size={11} aria-hidden />
                              {caseOpenExc.id} open
                            </span>
                          ) : null}
                          <span className="mel-caseMeta">
                            {caseCurrent}/{caseObjects.length} checks current
                          </span>
                        </div>
                        <div className="mel-wall">
                          {caseObjects.map(object => (
                            <ObjectTile
                              key={object.id}
                              object={object}
                              isSelected={selectedObjectId === object.id}
                              inOpenExcursion={openExcursionCaseIds.has(object.caseId)}
                              onSelect={() => selectObject(object.id)}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                  {/* ---- Environment strip ---- */}
                  <section className="mel-envCard" aria-label="Gallery 4 environment">
                    <div className="mel-envHead">
                      <DropletsIcon size={14} aria-hidden style={{flexShrink: 0}} />
                      <span className="mel-envTitle">Relative humidity — 14 days, 6-hourly</span>
                      <div className="mel-envLegend" aria-hidden>
                        <span className="mel-legendKey">
                          <span
                            style={{
                              width: 14,
                              height: 8,
                              background: BAND_TINT,
                              border: 'var(--border-width) solid var(--color-border)',
                            }}
                          />
                          45–55% safe band
                        </span>
                        <span className="mel-legendKey">
                          <span
                            style={{
                              width: 14,
                              height: 8,
                              border: `1px solid ${RED}`,
                              backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_RED} 0 2px, transparent 2px 5px)`,
                            }}
                          />
                          Open excursion
                        </span>
                        <span className="mel-legendKey">
                          <span
                            style={{
                              width: 14,
                              height: 8,
                              border: '1px dashed var(--color-text-secondary)',
                            }}
                          />
                          Acknowledged
                        </span>
                      </div>
                    </div>
                    <RhStripChart
                      excursions={excursions}
                      selectedExcursionId={detailExcursion?.id ?? null}
                      onSelectExcursion={id =>
                        setSelectedExcursionId(prev => (prev === id ? null : id))
                      }
                    />
                    {detailExcursion != null ? (
                      <div className="mel-excRow">
                        <span
                          className={`mel-excIcon ${
                            detailExcursion.state === 'open' ? 'is-open' : 'is-acked'
                          }`}
                          aria-hidden>
                          {detailExcursion.state === 'open' ? (
                            <TriangleAlertIcon size={15} />
                          ) : (
                            <CheckIcon size={15} />
                          )}
                        </span>
                        <div className="mel-excBody">
                          <span className="mel-excTitle">
                            {detailExcursion.id} —{' '}
                            {detailExcursion.kind === 'high' ? 'High RH' : 'Low RH'} ·{' '}
                            {detailExcursion.dateLabel}
                          </span>
                          <span className="mel-excMeta">
                            {detailExcursion.peakLabel} · {detailExcursion.durationLabel} · Cases{' '}
                            {detailExcursion.caseIds.join(', ')}
                          </span>
                          <span className="mel-excMeta">{detailExcursion.cause}</span>
                        </div>
                        {detailExcursion.state === 'open' ? (
                          <Button
                            label={`Acknowledge excursion ${detailExcursion.id}`}
                            variant="secondary"
                            size="sm"
                            icon={<Icon icon={CheckIcon} size="sm" />}
                            onClick={() => acknowledgeExcursion(detailExcursion.id)}>
                            Acknowledge
                          </Button>
                        ) : (
                          <span className="mel-excAck">
                            <CheckIcon size={12} aria-hidden />
                            {detailExcursion.ackLine}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </section>
                </div>
                {/* ---- Movement gate bar (bottom-left corner owner) ---- */}
                <div className="mel-gateBar">
                  {gateStatus === 'requested' ? (
                    <LockOpenIcon size={16} aria-hidden style={{flexShrink: 0}} />
                  ) : (
                    <LockIcon size={16} aria-hidden style={{flexShrink: 0}} />
                  )}
                  <div className="mel-gateTitle">
                    <span className="mel-gateName">Movement gate — {LOAN.id}</span>
                    <span className="mel-gateSub">
                      Deinstall {LOAN.deinstall} · {LOAN.borrower}
                    </span>
                  </div>
                  <span
                    className={`mel-req mel-fade ${
                      checksCurrent === objects.length ? 'is-pass' : 'is-fail'
                    }`}>
                    {checksCurrent === objects.length ? (
                      <CheckIcon size={11} aria-hidden />
                    ) : (
                      <ClipboardCheckIcon size={11} aria-hidden />
                    )}
                    Checks ≤{CHECK_POLICY_DAYS}d · {checksCurrent}/{objects.length}
                  </span>
                  <span
                    className={`mel-req mel-fade ${
                      openExcursions.length === 0 ? 'is-pass' : 'is-fail'
                    }`}>
                    {openExcursions.length === 0 ? (
                      <CheckIcon size={11} aria-hidden />
                    ) : (
                      <DropletsIcon size={11} aria-hidden />
                    )}
                    Open excursions · {openExcursions.length}
                  </span>
                  <span
                    className={`mel-req mel-fade ${
                      gradeDObjects.length === 0 ? 'is-pass' : 'is-block'
                    }`}>
                    {gradeDObjects.length === 0 ? (
                      <CheckIcon size={11} aria-hidden />
                    ) : (
                      <TriangleAlertIcon size={11} aria-hidden />
                    )}
                    Grade D · {gradeDObjects.length}
                    {gradeDObjects.length > 0 ? ` (${gradeDObjects.map(o => o.id).join(', ')})` : ''}
                  </span>
                  <div className="mel-gateAction">
                    {gateStatus === 'requested' ? (
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        Requested {TODAY_SHORT} · awaiting registrar countersign ({REGISTRAR})
                      </Text>
                    ) : gateStatus === 'hold' ? (
                      <Text type="supporting" size="xsm" color="secondary">
                        Request on hold — clear the failed requirement to resume
                      </Text>
                    ) : (
                      <Button
                        label="Request movement approval"
                        variant="primary"
                        size="sm"
                        icon={<Icon icon={TruckIcon} size="sm" />}
                        isDisabled={!gateReady}
                        onClick={requestApproval}
                      />
                    )}
                  </div>
                </div>
              </main>
              {/* ---- Rail: identity · composer · ledger ---- */}
              <aside className="mel-rail" aria-label="Selected object and conservation ledger">
                {selectedObject != null ? (
                  <div className="mel-idBlock">
                    <div className="mel-idTop">
                      <span className="mel-idAcc">{selectedObject.id}</span>
                      <GradeBadge grade={selectedObject.grade} />
                      {selectedObject.daysSinceCheck > CHECK_POLICY_DAYS ? (
                        <span className="mel-dueChip">
                          check overdue · {selectedObject.daysSinceCheck}d
                        </span>
                      ) : null}
                    </div>
                    <Heading level={2} maxLines={2}>
                      {selectedObject.title}
                    </Heading>
                    <div className="mel-idFacts">
                      <span className="mel-idFactLabel">Maker</span>
                      <span className="mel-idFactValue">
                        {selectedObject.maker}, {selectedObject.dated}
                      </span>
                      <span className="mel-idFactLabel">Material</span>
                      <span className="mel-idFactValue">{selectedObject.material}</span>
                      <span className="mel-idFactLabel">Location</span>
                      <span className="mel-idFactValue">
                        {CASES.find(c => c.id === selectedObject.caseId)?.label ?? selectedObject.caseId}
                      </span>
                      <span className="mel-idFactLabel">Last check</span>
                      <span className="mel-idFactValue">
                        {selectedObject.lastChecked} · {selectedObject.daysSinceCheck}d ago ·{' '}
                        {GRADE_META[selectedObject.grade].label}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mel-emptyRail">
                    <Heading level={2}>No object selected</Heading>
                    <Text type="supporting" size="sm" color="secondary">
                      Select a tile on the object wall to review its ledger and log a
                      condition check. {objects.length - checksCurrent} of {objects.length}{' '}
                      loan-listed objects still need a check inside the {CHECK_POLICY_DAYS}-day
                      window.
                    </Text>
                  </div>
                )}
                {selectedObject != null ? (
                  // Keyed so grade/tag drafts reset per object.
                  <CheckComposer
                    key={selectedObject.id}
                    object={selectedObject}
                    onLogCheck={(grade, tags, note) =>
                      logCheck(selectedObject.id, grade, tags, note)
                    }
                  />
                ) : (
                  <div />
                )}
                <div className="mel-ledger">
                  <div className="mel-ledgerHead">
                    <span className="mel-overline">Conservation ledger</span>
                    <span className="mel-caseMeta">{visibleLedger.length}</span>
                    {selectedObject != null ? (
                      <button
                        type="button"
                        className="mel-ledgerScope mel-fade"
                        aria-pressed={ledgerScopeAll}
                        onClick={() => setLedgerScopeAll(prev => !prev)}>
                        {ledgerScopeAll ? 'All gallery' : `Only ${selectedObject.id}`}
                      </button>
                    ) : null}
                  </div>
                  <ul className="mel-ledgerList" aria-label="Conservation events, newest first">
                    {visibleLedger.length === 0 ? (
                      <li className="mel-ledgerRow">
                        <div className="mel-ledgerBody">
                          <span className="mel-ledgerKind">No events yet</span>
                          <p className="mel-ledgerNote" style={{margin: 0}}>
                            {selectedObject != null
                              ? `No ledger events for ${selectedObject.id}. Log the first condition check above.`
                              : 'No ledger events.'}
                          </p>
                        </div>
                      </li>
                    ) : (
                      visibleLedger.map(event => (
                        <LedgerRowView
                          key={event.id}
                          event={event}
                          isNew={isSessionEvent(event.id)}
                        />
                      ))
                    )}
                  </ul>
                </div>
              </aside>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
