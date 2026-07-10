var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Bidframe evaluation of
 *   RFP-2026-014 "Fleet Telematics Platform" for Northwind Regional
 *   Transit: 5 sealed bids × 6 weighted criteria, scored by a 3-person
 *   panel. Every consensus score is DERIVED as the mean of the three
 *   authored panelist scores (e.g. Novora TECH = (9.5+9+8.5)/3 = 9.0), so
 *   matrix and breakdown can never drift. Weighted total = Σ consensus ×
 *   (points/Σpoints) × 10. Committee-baseline weights TECH 25 · SEC 20 ·
 *   IMPL 15 · SLA 10 · COST 20 · VIA 10 (Σ = 100 ✓) give totals verified
 *   by hand: Novora 82.25 → 82.3, Kestrel 80.75 → 80.8, Meridian 76.75 →
 *   76.8, Atlas 72.00, Orbitline 66.25 → 66.3. Cost-focused preset
 *   (15/15/10/10/40/10) reorders to Novora 79.0, Meridian 76.5 (▲1),
 *   Atlas 76.25 (▲1), Kestrel 74.5 (▼2), Orbitline 73.25 ✓. Security-first
 *   preset (20/35/10/15/10/10) flips the podium: Kestrel 85.75 (▲1),
 *   Novora 82.5 (▼1), Meridian 76.75, Atlas 68.75, Orbitline 61.25 ✓.
 *   Award target Aug 14 2026; bids opened Jun 30 2026 — fixed strings, no
 *   Date.now(), no Math.random(), no timers, no network assets.
 * @output Bidframe — Procurement Bid Evaluator: a weighted-scoring
 *   war-room. Header (Bidframe frame-and-bars mark, RFP title, Evaluation
 *   Badge, live leader + margin readout, award-target date) over a 300px
 *   WEIGHTS RAIL (three preset chips — Committee baseline / Cost-focused /
 *   Security-first — plus six criterion rows, each a 0–40-point Slider
 *   with its derived effective % and a ±pp delta vs baseline, and a
 *   weight-points sum readout) beside the main column: a RANK PODIUM
 *   (2nd/1st/3rd blocks sized by rank with totals, movement markers, and
 *   a compliance warning when a conditional vendor reaches the podium),
 *   the VENDOR × CRITERIA MATRIX (5 rows live-sorted by weighted total;
 *   rank + ▲/▼ movement vs the committee baseline, bid price, consensus
 *   cells with micro score bars and amber divergence dots where the panel
 *   spread ≥ 2.0, and a total column with a ±delta vs baseline), and a
 *   PANEL BREAKDOWN strip that opens the three panelist scores, spread,
 *   weighted contribution, and scorer note for any clicked cell, and an
 *   AWARD-READINESS gate panel (scorecards recorded ✓; leader clear of
 *   compliance conditions — reopens if a flagged vendor reaches #1; and a
 *   decisive ≥3.0-pt margin gate: baseline margin 1.5 keeps it open with
 *   a BAFO recommendation, security-first's 3.3-pt margin closes it). A
 *   matrix footer row names the panel-best consensus per criterion.
 *   Signature move: dragging one criterion slider re-normalizes every
 *   effective weight, recomputes all five totals, reorders the matrix and
 *   podium with movement markers, restyles the deltas, re-derives the
 *   leader margin in the header, and flips the award-readiness verdict —
 *   one weights object, six surfaces.
 * @position Page template; emitted by \`astryx template procurement-bid-evaluator\`
 *
 * Frame: root 100dvh div wrapping Layout height="fill"; LayoutHeader owns
 *   the RFP chrome; LayoutContent padding={0} hosts a hand-rolled
 *   \`.pbe-frame\` CSS grid \`300px minmax(0,1fr)\` (hand-rolled because the
 *   rail restack below 980px must be a real media query, which DS grid
 *   inline styles would defeat). Rail and main scroll independently.
 *
 * Responsive contract:
 * - Default desktop (~1045px inline stage, no breakpoint needed): rail
 *   300px + main ≈745px; the matrix (200px vendor + 6 × minmax(64px,1fr)
 *   + 104px total = 688px min) fits without scrolling.
 * - <=980px: \`.pbe-frame\` stacks — rail first (its criterion rows flow
 *   into a 2-up grid so six sliders don't cost 500px of height), then
 *   podium/matrix/breakdown full-width.
 * - <=640px (390px embed iframe): the matrix keeps its 688px min-width
 *   inside an overflow-x scroller (subtraction, not squeeze); the podium
 *   wraps; rail criterion rows return to one column; header stats wrap.
 *   Sliders and preset chips keep >=40px hit height at every width.
 *
 * Container policy (decision-matrix archetype): frame-first panels and
 *   dense rows. The podium is the one intentionally display-grade band
 *   (it is the meeting-room projection surface); everything else is rows,
 *   rails, and a bordered breakdown strip. No marketing cards.
 *
 * Color policy: token-pure chrome. ONE quarantined brand accent —
 *   Bidframe orange light-dark(#C2410C, #FFA94D): #C2410C on #FFFFFF ≈
 *   5.2:1, #FFA94D on #1C1C1E ≈ 9.7:1 (both clear 4.5:1 text). Movement /
 *   delta pairs with math at the declaration: gain green light-dark(
 *   #15803D, #4ADE80) ≈ 4.6:1 / 10.1:1; drop red light-dark(#B91C1C,
 *   #F87171) ≈ 5.9:1 / 6.9:1; divergence amber light-dark(#B45309,
 *   #FBBF24) ≈ 4.6:1 / 11.7:1. NEVER var(--color-text) — text tokens are
 *   --color-text-primary / --color-text-secondary throughout.
 *
 * Density grid (repeated verbatim in the CSS): rail 300 · criterion rows
 *   84 · preset chips 40 hit · podium blocks 116/96/84 · matrix header
 *   40 · matrix rows 56 · matrix footer 34 · total column 104 · vendor
 *   column 200 · breakdown strip min 112 · gate rows 44 · gutter
 *   var(--spacing-4) · 11px overlines · tabular-nums on every score,
 *   weight, price, and total.
 *
 * Fixture policy: one state owner (the \`weights\` record) plus a selected
 *   cell pointer. Sliders and preset chips are the only weight mutators;
 *   consensus scores, totals, ranks, movement, deltas, podium order,
 *   leader margin, and breakdown contributions are all derived during
 *   render from the authored panelist triples — nothing numeric is stored
 *   twice, so every surface re-derives together.
 */

import {useState} from 'react';

import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  MinusIcon,
  ScaleIcon,
  UsersIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Slider} from '@astryxdesign/core/Slider';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// contrast math. ONE quarantined brand accent; three semantic pairs.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-procurement-bid-evaluator';

// THE brand accent (Bidframe orange). #C2410C vs #FFFFFF ≈ 5.2:1 (passes
// 4.5:1); #FFA94D vs the dark card (~#1C1C1E) ≈ 9.7:1.
const ACCENT = 'light-dark(#C2410C, #FFA94D)';
// Accent wash for selected cells / the podium band — surface tint only.
const ACCENT_TINT = 'light-dark(rgba(194, 65, 12, 0.10), rgba(255, 169, 77, 0.14))';
// Stronger wash for the #1 podium block (still a graphic fill; the text on
// it stays on the foreground tokens).
const ACCENT_TINT_STRONG = 'light-dark(rgba(194, 65, 12, 0.16), rgba(255, 169, 77, 0.20))';

// Rank-gain green: #15803D on #FFFFFF ≈ 4.6:1; #4ADE80 on #1C1C1E ≈ 10.1:1.
const GREEN = 'light-dark(#15803D, #4ADE80)';
// Green wash for the passing verdict chip — surface tint only.
const GREEN_TINT = 'light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))';
// Rank-drop red: #B91C1C on #FFFFFF ≈ 5.9:1; #F87171 on #1C1C1E ≈ 6.9:1.
const RED = 'light-dark(#B91C1C, #F87171)';
// Panel-divergence amber: #B45309 on #FFFFFF ≈ 4.6:1; #FBBF24 on #1C1C1E ≈ 11.7:1.
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(251, 191, 36, 0.16))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors prefixed with the scope class. Density grid
// verbatim: rail 300 · criterion rows 84 · podium 116/96/84 · matrix header
// 40 · matrix rows 56 · total col 104 · breakdown min 112 · gutter spacing-4.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} .pbe-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.\${SCOPE} .pbe-btn:focus-visible,
.\${SCOPE} .pbe-presetChip:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: -2px;
}
.\${SCOPE} .pbe-mono {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pbe-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.\${SCOPE} .pbe-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ---- Frame: 300px weights rail + main; hand-rolled so the <=980px restack
   is a real media query. ---- */
.\${SCOPE} .pbe-frame {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}
.\${SCOPE} .pbe-rail {
  min-height: 0;
  overflow-y: auto;
  border-right: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.\${SCOPE} .pbe-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* ---- Header ---- */
.\${SCOPE} .pbe-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  flex-wrap: wrap;
  row-gap: var(--spacing-2);
}
.\${SCOPE} .pbe-headRow .pbe-spring { flex: 1; }
.\${SCOPE} .pbe-brandCol { display: flex; flex-direction: column; min-width: 0; }
.\${SCOPE} .pbe-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .pbe-headStats {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.\${SCOPE} .pbe-stat { display: flex; align-items: baseline; gap: 5px; }
.\${SCOPE} .pbe-statValue {
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .pbe-statLabel { font-size: 11px; color: var(--color-text-secondary); }

/* ---- Weights rail: preset chips (40px hit) + 84px criterion rows ---- */
.\${SCOPE} .pbe-presetWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.\${SCOPE} .pbe-presetChip {
  font: inherit;
  cursor: pointer;
  min-height: 40px;
  padding: 6px 12px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: none;
  font-size: 12px;
  color: var(--color-text-primary);
}
.\${SCOPE} .pbe-presetChip:hover { background: var(--color-background-muted); }
.\${SCOPE} .pbe-presetChip[aria-pressed='true'] {
  border-color: \${ACCENT};
  color: \${ACCENT};
  background: \${ACCENT_TINT};
  font-weight: 650;
}
.\${SCOPE} .pbe-critList { display: flex; flex-direction: column; }
.\${SCOPE} .pbe-critRow {
  min-height: 84px;
  padding-block: var(--spacing-2);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.\${SCOPE} .pbe-critRow:last-child { border-bottom: none; }
.\${SCOPE} .pbe-critTop { display: flex; align-items: baseline; gap: var(--spacing-2); }
.\${SCOPE} .pbe-critCode {
  font-family: \${MONO};
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.\${SCOPE} .pbe-critName {
  font-size: 12.5px;
  font-weight: 600;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.\${SCOPE} .pbe-critEff {
  font-size: 12.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .pbe-critDelta {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .pbe-critDelta.is-up { color: \${GREEN}; font-weight: 650; }
.\${SCOPE} .pbe-critDelta.is-down { color: \${RED}; font-weight: 650; }
.\${SCOPE} .pbe-critDelta.is-flat { color: var(--color-text-secondary); }
.\${SCOPE} .pbe-critBottom {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  font-size: 10.5px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pbe-critBottom .pbe-spring { flex: 1; }
.\${SCOPE} .pbe-critPts { font-variant-numeric: tabular-nums; }
.\${SCOPE} .pbe-sumRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pbe-sumRow b {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

/* ---- Podium: blocks 116/96/84, displayed 2nd · 1st · 3rd ---- */
.\${SCOPE} .pbe-podium {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.\${SCOPE} .pbe-podiumBlock {
  flex: 1;
  min-width: 150px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: \${ACCENT_TINT};
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  min-height: 96px;
}
.\${SCOPE} .pbe-podiumBlock.is-first {
  min-height: 116px;
  background: \${ACCENT_TINT_STRONG};
  border-color: \${ACCENT};
}
.\${SCOPE} .pbe-podiumBlock.is-third { min-height: 84px; }
.\${SCOPE} .pbe-podiumRank {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: \${ACCENT};
  display: flex;
  align-items: center;
  gap: 6px;
}
.\${SCOPE} .pbe-podiumName {
  font-size: 13.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .pbe-podiumTotal {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.\${SCOPE} .pbe-podiumMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pbe-podiumWarn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 650;
  color: \${AMBER};
}

/* ---- Movement markers ---- */
.\${SCOPE} .pbe-move {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .pbe-move.is-up { color: \${GREEN}; }
.\${SCOPE} .pbe-move.is-down { color: \${RED}; }
.\${SCOPE} .pbe-move.is-flat { color: var(--color-text-secondary); }

/* ---- Section cards ---- */
.\${SCOPE} .pbe-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-card);
  overflow: hidden;
}
.\${SCOPE} .pbe-cardHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .pbe-cardHead .pbe-spring { flex: 1; }

/* ---- Matrix: 200px vendor + 6 × minmax(64px,1fr) + 104px total.
   Header 40px, rows 56px, min-width 688px in a scroller. ---- */
.\${SCOPE} .pbe-matrixScroll { overflow-x: auto; }
.\${SCOPE} .pbe-matrix {
  display: grid;
  grid-template-columns: 200px repeat(6, minmax(64px, 1fr)) 104px;
  min-width: 688px;
}
.\${SCOPE} .pbe-mxColHead {
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-bottom: var(--border-width) solid var(--color-border);
  padding-inline: 4px;
}
.\${SCOPE} .pbe-colCode {
  font-family: \${MONO};
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.05em;
}
.\${SCOPE} .pbe-colWeight {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pbe-mxColHead.is-vendor {
  align-items: flex-start;
  padding-inline: var(--spacing-3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pbe-mxColHead.is-total { align-items: flex-end; padding-inline: var(--spacing-3); }
.\${SCOPE} .pbe-vendorCell {
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.\${SCOPE} .pbe-rankNum {
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}
.\${SCOPE} .pbe-vendorInfo { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.\${SCOPE} .pbe-vendorName {
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .pbe-vendorBid {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .pbe-flagChip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 650;
  color: \${AMBER};
  white-space: nowrap;
}
.\${SCOPE} .pbe-scoreCell {
  position: relative;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
.\${SCOPE} button.pbe-scoreCell:hover { background: var(--color-background-muted); }
.\${SCOPE} .pbe-scoreCell[aria-pressed='true'] {
  background: \${ACCENT_TINT};
  box-shadow: inset 0 0 0 1px \${ACCENT};
}
.\${SCOPE} .pbe-scoreVal {
  font-size: 13.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.\${SCOPE} .pbe-scoreBar {
  width: 34px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.\${SCOPE} .pbe-scoreBarFill {
  height: 100%;
  border-radius: 999px;
  background: \${ACCENT};
}
.\${SCOPE} .pbe-divergeDot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: \${AMBER};
}
.\${SCOPE} .pbe-totalCell {
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .pbe-totalVal {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.\${SCOPE} .pbe-totalDelta {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .pbe-totalDelta.is-up { color: \${GREEN}; font-weight: 650; }
.\${SCOPE} .pbe-totalDelta.is-down { color: \${RED}; font-weight: 650; }
.\${SCOPE} .pbe-totalDelta.is-flat { color: var(--color-text-secondary); }

/* ---- Matrix footer: 34px "panel best" row ---- */
.\${SCOPE} .pbe-mxFoot {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-left: var(--border-width) solid var(--color-border);
  font-size: 10.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pbe-mxFoot .pbe-mxFootVendor {
  font-family: \${MONO};
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: \${ACCENT};
}
.\${SCOPE} .pbe-mxFoot.is-label {
  border-left: none;
  justify-content: flex-start;
  padding-inline: var(--spacing-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 10px;
}
.\${SCOPE} .pbe-mxFoot.is-total { justify-content: flex-end; padding-inline: var(--spacing-3); }

/* ---- Award-readiness gates: 44px rows + verdict chip ---- */
.\${SCOPE} .pbe-gateRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 44px;
  padding-inline: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12.5px;
}
.\${SCOPE} .pbe-gateRow:last-child { border-bottom: none; }
.\${SCOPE} .pbe-gateIcon { display: flex; flex-shrink: 0; }
.\${SCOPE} .pbe-gateIcon.is-pass { color: \${GREEN}; }
.\${SCOPE} .pbe-gateIcon.is-warn { color: \${AMBER}; }
.\${SCOPE} .pbe-gateName { flex: 1; min-width: 0; }
.\${SCOPE} .pbe-gateDetail {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.\${SCOPE} .pbe-verdictChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.\${SCOPE} .pbe-verdictChip.is-ready { color: \${GREEN}; background: \${GREEN_TINT}; }
.\${SCOPE} .pbe-verdictChip.is-open { color: \${AMBER}; background: \${AMBER_TINT}; }

/* ---- Breakdown strip ---- */
.\${SCOPE} .pbe-breakdown {
  min-height: 112px;
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.\${SCOPE} .pbe-bdTop {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .pbe-bdTitle { font-size: 13px; font-weight: 650; }
.\${SCOPE} .pbe-bdMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pbe-panelWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); align-items: center; }
.\${SCOPE} .pbe-panelChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding-inline: 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 11.5px;
}
.\${SCOPE} .pbe-panelChip b {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.\${SCOPE} .pbe-spreadChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding-inline: 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pbe-spreadChip.is-diverged { color: \${AMBER}; background: \${AMBER_TINT}; }
.\${SCOPE} .pbe-spreadChip.is-tight {
  color: var(--color-text-secondary);
  background: var(--color-background-muted);
}
.\${SCOPE} .pbe-bdNote {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  border-left: 2px solid var(--color-border);
  padding-left: var(--spacing-3);
  margin: 0;
}

/* ---- Responsive: restack at 980; matrix scroller persists ---- */
@media (max-width: 980px) {
  .\${SCOPE} .pbe-frame { display: block; overflow-y: auto; }
  .\${SCOPE} .pbe-rail {
    border-right: none;
    border-bottom: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
  .\${SCOPE} .pbe-main { overflow-y: visible; }
  .\${SCOPE} .pbe-critList {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--spacing-4);
  }
}
@media (max-width: 640px) {
  .\${SCOPE} .pbe-critList { display: flex; flex-direction: column; }
  .\${SCOPE} .pbe-podiumBlock { min-width: 120px; }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN VOCABULARY — the sourcing event, criteria, panel, and vendors.
// ---------------------------------------------------------------------------

const RFP_ID = 'RFP-2026-014';
const RFP_TITLE = 'Fleet Telematics Platform';
const BUYER = 'Northwind Regional Transit';
const AWARD_TARGET = 'Aug 14, 2026';
const BIDS_OPENED = 'Jun 30, 2026';

type CritId = 'TECH' | 'SEC' | 'IMPL' | 'SLA' | 'COST' | 'VIA';
type VendorId = 'novora' | 'kestrel' | 'meridian' | 'atlas' | 'orbitline';

interface CriterionMeta {
  id: CritId;
  name: string;
  hint: string;
}

const CRITERIA: CriterionMeta[] = [
  {id: 'TECH', name: 'Technical fit', hint: 'GPS density, CAN-bus depth, API surface'},
  {id: 'SEC', name: 'Security & compliance', hint: 'SOC 2, encryption, breach history'},
  {id: 'IMPL', name: 'Implementation plan', hint: 'Rollout phasing across 412 vehicles'},
  {id: 'SLA', name: 'Support & SLA', hint: 'Response tiers, uptime commitments'},
  {id: 'COST', name: '3-year TCO', hint: 'Licenses, hardware, install, data fees'},
  {id: 'VIA', name: 'Vendor viability', hint: 'Financials, references, roadmap'},
];

const CRIT_BY_ID = new Map(CRITERIA.map(c => [c.id, c]));

type Weights = Record<CritId, number>;

/** Committee-baseline weight points (Σ = 100). Movement markers and every
 * ±delta compare the live weights against this anchor. */
const BASELINE_WEIGHTS: Weights = {
  TECH: 25, SEC: 20, IMPL: 15, SLA: 10, COST: 20, VIA: 10,
};

const PRESETS: {id: string; label: string; weights: Weights}[] = [
  {id: 'baseline', label: 'Committee baseline', weights: BASELINE_WEIGHTS},
  {
    id: 'cost',
    label: 'Cost-focused',
    weights: {TECH: 15, SEC: 15, IMPL: 10, SLA: 10, COST: 40, VIA: 10},
  },
  {
    id: 'security',
    label: 'Security-first',
    weights: {TECH: 20, SEC: 35, IMPL: 10, SLA: 15, COST: 10, VIA: 10},
  },
];

/** Evaluation panel by identity — breakdown chips reference this roster. */
const PANEL = [
  {id: 'okafor', name: 'Rina Okafor', role: 'Engineering lead'},
  {id: 'whitfield', name: 'Sam Whitfield', role: 'Security architect'},
  {id: 'paredes', name: 'Julia Paredes', role: 'Procurement officer'},
];

interface VendorMeta {
  id: VendorId;
  name: string;
  city: string;
  bid: string; // display 3-yr TCO
  detail: string;
  flag: string | null; // compliance condition, if any
}

const VENDORS: VendorMeta[] = [
  {
    id: 'novora',
    name: 'Novora Systems',
    city: 'Columbus, OH',
    bid: '$1.42M',
    detail: '640 fleet deployments · incumbent at two peer agencies',
    flag: null,
  },
  {
    id: 'kestrel',
    name: 'Kestrel Dynamics',
    city: 'Bellevue, WA',
    bid: '$1.65M',
    detail: 'FedRAMP Moderate · strongest security posture in the pool',
    flag: null,
  },
  {
    id: 'meridian',
    name: 'Meridian Trackworks',
    city: 'Denver, CO',
    bid: '$1.31M',
    detail: 'Balanced bid · regional install crews on staff',
    flag: null,
  },
  {
    id: 'atlas',
    name: 'Atlas FleetIQ',
    city: 'Austin, TX',
    bid: '$1.18M',
    detail: 'Aggressive pricing · support desk is US business hours only',
    flag: null,
  },
  {
    id: 'orbitline',
    name: 'Orbitline Labs',
    city: 'Raleigh, NC',
    bid: '$0.98M',
    detail: 'Lowest bid · 3-year-old company, 2 transit references',
    flag: 'SOC 2 Type II pending',
  },
];

const VENDOR_BY_ID = new Map(VENDORS.map(v => [v.id, v]));

// ---------------------------------------------------------------------------
// PANEL SCORES — [Okafor, Whitfield, Paredes] per vendor × criterion.
// Consensus = mean of the triple (derived, never stored). Divergence dot
// when max − min >= 2.0. Triples are authored so the means land exactly on
// the totals verified in the @input header comment.
// ---------------------------------------------------------------------------

type ScoreTriple = [number, number, number];

interface CellNote {
  text: string;
}

const SCORES: Record<VendorId, Record<CritId, ScoreTriple>> = {
  novora: {
    TECH: [9.5, 9, 8.5],
    SEC: [8, 8, 8],
    IMPL: [9, 8.5, 8],
    SLA: [8.5, 8, 7.5],
    COST: [7, 7, 7],
    VIA: [9, 9, 9],
  },
  kestrel: {
    TECH: [9, 8.5, 8],
    SEC: [10, 9.5, 9],
    IMPL: [8, 8, 8],
    SLA: [9.5, 9, 8.5],
    COST: [6, 5.5, 5],
    VIA: [8.5, 8.5, 8.5],
  },
  meridian: {
    TECH: [8, 7.5, 7],
    SEC: [7.5, 7.5, 7.5],
    IMPL: [8.5, 8, 7.5],
    SLA: [8, 8, 8],
    COST: [7.5, 7.5, 7.5],
    VIA: [8, 8, 8],
  },
  atlas: {
    TECH: [8, 7, 6], // spread 2.0 — divergence
    SEC: [7, 6.5, 6],
    IMPL: [7, 7, 7],
    SLA: [7, 6, 5], // spread 2.0 — divergence
    COST: [9, 9, 9],
    VIA: [7, 7, 7],
  },
  orbitline: {
    TECH: [7.5, 6.5, 5.5], // spread 2.0 — divergence
    SEC: [6, 5, 4], // spread 2.0 — divergence
    IMPL: [6, 6, 6],
    SLA: [6.5, 6.5, 6.5],
    COST: [9.5, 9.5, 9.5],
    VIA: [6.5, 5.5, 4.5], // spread 2.0 — divergence
  },
};

/** Scorer notes for contested or notable cells; keyed \`\${vendorId}:\${critId}\`. */
const CELL_NOTES: Record<string, CellNote> = {
  'novora:TECH': {
    text: 'Okafor: deepest CAN-bus signal catalog in the pool; live API sandbox handled our 412-vehicle simulation without throttling.',
  },
  'novora:COST': {
    text: 'Paredes: mid-pack pricing, but the incumbent-adjacent integrations at two peer agencies de-risk the install line item.',
  },
  'kestrel:SEC': {
    text: 'Whitfield: only bidder with FedRAMP Moderate and a clean 3-year breach history; keys rotate through their own HSM.',
  },
  'kestrel:COST': {
    text: 'Paredes: premium hardware pushes the 3-year TCO 68% above the low bid — strongest candidate for a BAFO price round.',
  },
  'meridian:IMPL': {
    text: 'Okafor: phased depot-by-depot rollout with their own regional install crews; the 14-week plan matched our blackout calendar.',
  },
  'atlas:TECH': {
    text: 'Panel split 8/7/6: Okafor liked the driver-coaching module; Paredes scored down for the closed data-export format.',
  },
  'atlas:SLA': {
    text: 'Panel split 7/6/5: US-business-hours support only — night-service coverage for the bus fleet is an open clarification.',
  },
  'orbitline:TECH': {
    text: 'Panel split 7.5/6.5/5.5: slick dashboard, but the CAN-bus catalog covers only 60% of our coach models today.',
  },
  'orbitline:SEC': {
    text: 'Whitfield: SOC 2 Type II audit still in fieldwork — score capped until the report lands; award would be conditional.',
  },
  'orbitline:VIA': {
    text: 'Panel split 6.5/5.5/4.5: 3-year-old company, two transit references; Paredes flagged single-datacenter hosting.',
  },
};

/** Divergence threshold: max − min of the panel triple, in score points. */
const DIVERGENCE_SPREAD = 2.0;

// ---------------------------------------------------------------------------
// DERIVATIONS — consensus, totals, ranking, movement. All pure.
// ---------------------------------------------------------------------------

function consensusOf(triple: ScoreTriple): number {
  // Triples are authored in 0.5-point steps whose sums divide evenly by 3,
  // so every mean lands on an exact tenth (verified in the header comment);
  // the rounding only absorbs binary float noise.
  return Math.round(((triple[0] + triple[1] + triple[2]) / 3) * 10) / 10;
}

function spreadOf(triple: ScoreTriple): number {
  return (
    Math.round(
      (Math.max(triple[0], triple[1], triple[2]) -
        Math.min(triple[0], triple[1], triple[2])) *
        10,
    ) / 10
  );
}

function sumWeights(weights: Weights): number {
  return CRITERIA.reduce((n, c) => n + weights[c.id], 0);
}

/** Weighted total on a 0–100 scale: Σ consensus × effectiveWeight × 10. */
function totalFor(vendorId: VendorId, weights: Weights): number {
  const sum = sumWeights(weights);
  if (sum === 0) {
    return 0;
  }
  let total = 0;
  for (const c of CRITERIA) {
    total += consensusOf(SCORES[vendorId][c.id]) * (weights[c.id] / sum) * 10;
  }
  return Math.round(total * 10) / 10;
}

interface RankedVendor {
  vendor: VendorMeta;
  total: number;
  rank: number; // 1-based under the live weights
  baselineRank: number; // 1-based under BASELINE_WEIGHTS
  baselineTotal: number;
  movement: number; // baselineRank − rank (positive = climbed)
  totalDelta: number; // total − baselineTotal
}

function rankVendors(weights: Weights): RankedVendor[] {
  const baselineOrder = VENDORS.map(v => ({
    id: v.id,
    total: totalFor(v.id, BASELINE_WEIGHTS),
  })).sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));
  const baselineRankOf = new Map(baselineOrder.map((e, i) => [e.id, i + 1]));
  const baselineTotalOf = new Map(baselineOrder.map(e => [e.id, e.total]));

  return VENDORS.map(v => ({vendor: v, total: totalFor(v.id, weights)}))
    .sort((a, b) => b.total - a.total || a.vendor.id.localeCompare(b.vendor.id))
    .map((e, i) => {
      const baselineRank = baselineRankOf.get(e.vendor.id) ?? i + 1;
      const baselineTotal = baselineTotalOf.get(e.vendor.id) ?? e.total;
      return {
        vendor: e.vendor,
        total: e.total,
        rank: i + 1,
        baselineRank,
        baselineTotal,
        movement: baselineRank - (i + 1),
        totalDelta: Math.round((e.total - baselineTotal) * 10) / 10,
      };
    });
}

function weightsEqual(a: Weights, b: Weights): boolean {
  return CRITERIA.every(c => a[c.id] === b[c.id]);
}

const fmt1 = (n: number) => n.toFixed(1);
const signed1 = (n: number) => \`\${n > 0 ? '+' : ''}\${n.toFixed(1)}\`;

// ---------------------------------------------------------------------------
// BRAND MARK — Bidframe: an orange frame with three ranked bars (a scoring
// matrix distilled to a favicon). Inline SVG, no emoji.
// ---------------------------------------------------------------------------

function BidframeMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden focusable="false">
      <rect
        x="1.5"
        y="1.5"
        width="23"
        height="23"
        rx="6"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.2"
      />
      <rect x="6.5" y="13" width="3.6" height="6.5" rx="1.2" fill={ACCENT} />
      <rect x="11.2" y="8" width="3.6" height="11.5" rx="1.2" fill={ACCENT} />
      <rect x="15.9" y="10.8" width="3.6" height="8.7" rx="1.2" fill={ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MOVEMENT MARKER — ▲n / ▼n / — vs the committee-baseline ranking.
// ---------------------------------------------------------------------------

function MoveMarker({movement}: {movement: number}) {
  if (movement > 0) {
    return (
      <span className="pbe-move is-up" aria-label={\`up \${movement} vs baseline\`}>
        <ArrowUpIcon size={11} aria-hidden />
        {movement}
      </span>
    );
  }
  if (movement < 0) {
    return (
      <span
        className="pbe-move is-down"
        aria-label={\`down \${Math.abs(movement)} vs baseline\`}>
        <ArrowDownIcon size={11} aria-hidden />
        {Math.abs(movement)}
      </span>
    );
  }
  return (
    <span className="pbe-move is-flat" aria-label="unchanged vs baseline">
      <MinusIcon size={11} aria-hidden />
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner (\`weights\`) + a selected-cell pointer; totals,
// ranks, movement, podium, deltas, and breakdown all derive during render.
// ---------------------------------------------------------------------------

interface SelectedCell {
  vendor: VendorId;
  crit: CritId;
}

export default function ProcurementBidEvaluatorTemplate() {
  const [weights, setWeights] = useState<Weights>(BASELINE_WEIGHTS);
  // Opens on a contested cell so the divergence affordance is discoverable.
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>({
    vendor: 'atlas',
    crit: 'SLA',
  });

  // ----- Derivations -----
  const ranked = rankVendors(weights);
  const weightSum = sumWeights(weights);
  const isBaseline = weightsEqual(weights, BASELINE_WEIGHTS);
  const leader = ranked[0];
  const margin = Math.round((ranked[0].total - ranked[1].total) * 10) / 10;
  const activePresetId =
    PRESETS.find(p => weightsEqual(weights, p.weights))?.id ?? null;
  const effPct = (critId: CritId) =>
    weightSum === 0 ? 0 : (weights[critId] / weightSum) * 100;
  const baselineSum = sumWeights(BASELINE_WEIGHTS); // 100
  const effDeltaPp = (critId: CritId) =>
    Math.round(
      (effPct(critId) - (BASELINE_WEIGHTS[critId] / baselineSum) * 100) * 10,
    ) / 10;

  const setWeight = (critId: CritId, points: number) => {
    setWeights(prev => ({...prev, [critId]: points}));
  };

  const toggleCell = (vendor: VendorId, crit: CritId) => {
    setSelectedCell(prev =>
      prev != null && prev.vendor === vendor && prev.crit === crit
        ? null
        : {vendor, crit},
    );
  };

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <div className="pbe-headRow">
        <BidframeMark />
        <div className="pbe-brandCol">
          <Heading level={1}>Bidframe — Bid Evaluator</Heading>
          <span className="pbe-brandSub">
            {RFP_ID} · {RFP_TITLE} · {BUYER}
          </span>
        </div>
        <Badge label="Evaluation" variant="info" />
        <div className="pbe-spring" />
        <div className="pbe-headStats">
          <div className="pbe-stat">
            <span className="pbe-statValue">{VENDORS.length}</span>
            <span className="pbe-statLabel">sealed bids · opened {BIDS_OPENED}</span>
          </div>
          <div className="pbe-stat">
            <span className="pbe-statValue">{leader.vendor.name}</span>
            <span className="pbe-statLabel">leads by {fmt1(margin)} pts</span>
          </div>
          <div className="pbe-stat">
            <span className="pbe-statValue">{AWARD_TARGET}</span>
            <span className="pbe-statLabel">award target</span>
          </div>
        </div>
      </div>
    </LayoutHeader>
  );

  // ----- Weights rail -----
  const rail = (
    <aside className="pbe-rail" aria-label="Evaluation weights">
      <span className="pbe-overline">Evaluation weights</span>
      <div className="pbe-presetWrap">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            className="pbe-presetChip"
            aria-pressed={activePresetId === preset.id}
            onClick={() => setWeights(preset.weights)}>
            {preset.label}
          </button>
        ))}
      </div>
      <div className="pbe-critList">
        {CRITERIA.map(c => {
          const deltaPp = effDeltaPp(c.id);
          const deltaCls =
            deltaPp > 0
              ? 'pbe-critDelta is-up'
              : deltaPp < 0
                ? 'pbe-critDelta is-down'
                : 'pbe-critDelta is-flat';
          return (
            <div key={c.id} className="pbe-critRow">
              <div className="pbe-critTop">
                <span className="pbe-critCode">{c.id}</span>
                <span className="pbe-critName" title={c.hint}>
                  {c.name}
                </span>
                <span className="pbe-critEff">{effPct(c.id).toFixed(1)}%</span>
              </div>
              <Slider
                label={\`\${c.name} weight (points)\`}
                isLabelHidden
                value={weights[c.id]}
                min={0}
                max={40}
                step={1}
                valueDisplay="none"
                formatValue={v => \`\${v} points\`}
                width="100%"
                onChange={(v: number) => setWeight(c.id, v)}
              />
              <div className="pbe-critBottom">
                <span className="pbe-critPts">{weights[c.id]} pts</span>
                <div className="pbe-spring" />
                <span className={deltaCls}>
                  {deltaPp === 0 ? 'at baseline' : \`\${signed1(deltaPp)} pp vs baseline\`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pbe-sumRow">
        <Icon icon={ScaleIcon} size="sm" color="secondary" />
        <span>
          Weight points: <b>{weightSum}</b> · effective weights normalize
          automatically
        </span>
      </div>
      <Button
        label="Reset to committee baseline"
        variant="secondary"
        size="sm"
        isDisabled={isBaseline}
        onClick={() => setWeights(BASELINE_WEIGHTS)}
      />
    </aside>
  );

  // ----- Podium (displayed 2nd · 1st · 3rd) -----
  const podiumOrder = [ranked[1], ranked[0], ranked[2]];
  const podium = (
    <section className="pbe-podium" aria-label="Rank podium">
      {podiumOrder.map(entry => {
        const cls =
          entry.rank === 1
            ? 'pbe-podiumBlock is-first'
            : entry.rank === 3
              ? 'pbe-podiumBlock is-third'
              : 'pbe-podiumBlock';
        return (
          <div key={entry.vendor.id} className={cls}>
            <span className="pbe-podiumRank">
              #{entry.rank}
              <MoveMarker movement={entry.movement} />
            </span>
            <span className="pbe-podiumName">{entry.vendor.name}</span>
            <span className="pbe-podiumTotal">{fmt1(entry.total)}</span>
            <span className="pbe-podiumMeta">
              <span>{entry.vendor.bid} 3-yr TCO</span>
              {!isBaseline && (
                <span
                  className={
                    entry.totalDelta > 0
                      ? 'pbe-totalDelta is-up'
                      : entry.totalDelta < 0
                        ? 'pbe-totalDelta is-down'
                        : 'pbe-totalDelta is-flat'
                  }>
                  {signed1(entry.totalDelta)} vs baseline
                </span>
              )}
            </span>
            {entry.vendor.flag != null && (
              <span className="pbe-podiumWarn">
                <AlertTriangleIcon size={11} aria-hidden />
                Conditional — {entry.vendor.flag}
              </span>
            )}
          </div>
        );
      })}
    </section>
  );

  // ----- Scoring matrix -----
  const matrixCard = (
    <section className="pbe-card" aria-label="Vendor by criteria scoring matrix">
      <div className="pbe-cardHead">
        <span className="pbe-overline">Scoring matrix — vendors × criteria</span>
        <div className="pbe-spring" />
        <Text type="supporting" color="secondary">
          {isBaseline ? 'committee-baseline weights' : 'adjusted weights'} · click a
          cell for the panel breakdown
        </Text>
      </div>
      <div className="pbe-matrixScroll">
        <div className="pbe-matrix">
          <div className="pbe-mxColHead is-vendor">Vendor / bid</div>
          {CRITERIA.map(c => (
            <div key={c.id} className="pbe-mxColHead" title={\`\${c.name} — \${c.hint}\`}>
              <span className="pbe-colCode">{c.id}</span>
              <span className="pbe-colWeight">{effPct(c.id).toFixed(1)}%</span>
            </div>
          ))}
          <div className="pbe-mxColHead is-total">
            <span className="pbe-colCode">TOTAL</span>
            <span className="pbe-colWeight">of 100</span>
          </div>
          {ranked.map(entry => (
            <div key={entry.vendor.id} style={{display: 'contents'}}>
              <div className="pbe-vendorCell">
                <span className="pbe-rankNum">{entry.rank}</span>
                <MoveMarker movement={entry.movement} />
                <span className="pbe-vendorInfo">
                  <span className="pbe-vendorName" title={entry.vendor.detail}>
                    {entry.vendor.name}
                  </span>
                  <span className="pbe-vendorBid">
                    {entry.vendor.bid} · {entry.vendor.city}
                  </span>
                  {entry.vendor.flag != null && (
                    <span className="pbe-flagChip">
                      <AlertTriangleIcon size={9} aria-hidden />
                      {entry.vendor.flag}
                    </span>
                  )}
                </span>
              </div>
              {CRITERIA.map(c => {
                const triple = SCORES[entry.vendor.id][c.id];
                const consensus = consensusOf(triple);
                const spread = spreadOf(triple);
                const isDiverged = spread >= DIVERGENCE_SPREAD;
                const isSelected =
                  selectedCell != null &&
                  selectedCell.vendor === entry.vendor.id &&
                  selectedCell.crit === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="pbe-btn pbe-scoreCell"
                    aria-pressed={isSelected}
                    aria-label={\`\${entry.vendor.name}, \${c.name}: consensus \${fmt1(
                      consensus,
                    )} of 10, panel spread \${fmt1(spread)}\${
                      isDiverged ? ' (diverged)' : ''
                    }\`}
                    onClick={() => toggleCell(entry.vendor.id, c.id)}>
                    <span className="pbe-scoreVal">{fmt1(consensus)}</span>
                    <span className="pbe-scoreBar" aria-hidden>
                      <span
                        className="pbe-scoreBarFill"
                        style={{width: \`\${consensus * 10}%\`}}
                      />
                    </span>
                    {isDiverged && (
                      <span
                        className="pbe-divergeDot"
                        title={\`Panel spread \${fmt1(spread)} — scores diverge\`}
                      />
                    )}
                  </button>
                );
              })}
              <div className="pbe-totalCell">
                <span className="pbe-totalVal">{fmt1(entry.total)}</span>
                <span
                  className={
                    isBaseline
                      ? 'pbe-totalDelta is-flat'
                      : entry.totalDelta > 0
                        ? 'pbe-totalDelta is-up'
                        : entry.totalDelta < 0
                          ? 'pbe-totalDelta is-down'
                          : 'pbe-totalDelta is-flat'
                  }>
                  {isBaseline ? 'baseline' : signed1(entry.totalDelta)}
                </span>
              </div>
            </div>
          ))}
          {/* Footer: the panel's best consensus per criterion — a quick
              cross-check row for "who wins each column" independent of
              weights; the total corner shows the live leader margin. */}
          <div className="pbe-mxFoot is-label">Panel best</div>
          {CRITERIA.map(c => {
            let bestVendor = VENDORS[0];
            let bestScore = -1;
            for (const v of VENDORS) {
              const s = consensusOf(SCORES[v.id][c.id]);
              if (s > bestScore) {
                bestScore = s;
                bestVendor = v;
              }
            }
            return (
              <div key={c.id} className="pbe-mxFoot" title={\`\${bestVendor.name} leads \${c.name}\`}>
                {fmt1(bestScore)}
                <span className="pbe-mxFootVendor">
                  {bestVendor.name.split(' ')[0].toUpperCase()}
                </span>
              </div>
            );
          })}
          <div className="pbe-mxFoot is-total">Δ {fmt1(margin)} pts</div>
        </div>
      </div>
    </section>
  );

  // ----- Award-readiness gates: derived from the live ranking, so weight
  // changes flip them (baseline margin 1.5 keeps the BAFO gate open;
  // security-first's 3.3-pt margin closes it; a flagged vendor at #1
  // reopens the compliance gate). -----
  const gates: {
    id: string;
    label: string;
    state: 'pass' | 'warn';
    detail: string;
  }[] = [
    {
      id: 'scores',
      label: 'All panel scorecards recorded',
      state: 'pass',
      detail: '30 cells × 3 scorers = 90 scores',
    },
    {
      id: 'compliance',
      label: 'Leader clear of compliance conditions',
      state: leader.vendor.flag == null ? 'pass' : 'warn',
      detail:
        leader.vendor.flag == null
          ? \`no conditions on \${leader.vendor.name}\`
          : \`conditional — \${leader.vendor.flag}\`,
    },
    {
      id: 'margin',
      label: 'Decisive margin over runner-up (≥ 3.0 pts)',
      state: margin >= 3 ? 'pass' : 'warn',
      detail:
        margin >= 3
          ? \`\${fmt1(margin)} pts vs \${ranked[1].vendor.name}\`
          : \`\${fmt1(margin)} pts vs \${ranked[1].vendor.name} — recommend a BAFO round\`,
    },
  ];
  const openGates = gates.reduce((n, g) => n + (g.state !== 'pass' ? 1 : 0), 0);

  const gatesCard = (
    <section className="pbe-card" aria-label="Award readiness gates">
      <div className="pbe-cardHead">
        <span className="pbe-overline">Award readiness</span>
        <div className="pbe-spring" />
        <span
          className={
            openGates === 0 ? 'pbe-verdictChip is-ready' : 'pbe-verdictChip is-open'
          }>
          {openGates === 0 ? (
            <CheckCircle2Icon size={12} aria-hidden />
          ) : (
            <AlertTriangleIcon size={12} aria-hidden />
          )}
          {openGates === 0
            ? \`Ready to recommend \${leader.vendor.name}\`
            : \`Not ready — \${openGates} gate\${openGates === 1 ? '' : 's'} open\`}
        </span>
      </div>
      <div>
        {gates.map(gate => (
          <div key={gate.id} className="pbe-gateRow">
            <span className={\`pbe-gateIcon is-\${gate.state}\`}>
              {gate.state === 'pass' ? (
                <CheckCircle2Icon size={15} aria-hidden />
              ) : (
                <AlertTriangleIcon size={15} aria-hidden />
              )}
            </span>
            <span className="pbe-gateName">{gate.label}</span>
            <span className="pbe-gateDetail">{gate.detail}</span>
          </div>
        ))}
      </div>
    </section>
  );

  // ----- Panel breakdown strip -----
  const selectedVendor =
    selectedCell != null ? VENDOR_BY_ID.get(selectedCell.vendor) : undefined;
  const selectedCrit =
    selectedCell != null ? CRIT_BY_ID.get(selectedCell.crit) : undefined;
  const selectedRanked =
    selectedCell != null
      ? ranked.find(e => e.vendor.id === selectedCell.vendor)
      : undefined;

  let breakdownBody = (
    <Text type="supporting" color="secondary">
      Click any score cell to see the three panelist scores behind the
      consensus, the spread, and this cell's weighted contribution.
    </Text>
  );
  if (
    selectedCell != null &&
    selectedVendor != null &&
    selectedCrit != null &&
    selectedRanked != null
  ) {
    const triple = SCORES[selectedCell.vendor][selectedCell.crit];
    const consensus = consensusOf(triple);
    const spread = spreadOf(triple);
    const isDiverged = spread >= DIVERGENCE_SPREAD;
    const contribution =
      Math.round(consensus * (effPct(selectedCell.crit) / 100) * 10 * 10) / 10;
    const note = CELL_NOTES[\`\${selectedCell.vendor}:\${selectedCell.crit}\`];
    breakdownBody = (
      <>
        <div className="pbe-bdTop">
          <span className="pbe-bdTitle">
            {selectedVendor.name} · {selectedCrit.name}
          </span>
          <span className="pbe-bdMeta">
            {selectedCrit.id} · effective weight {effPct(selectedCell.crit).toFixed(1)}%
            · contributes {fmt1(contribution)} of {fmt1(selectedRanked.total)} pts
          </span>
        </div>
        <div className="pbe-panelWrap">
          {PANEL.map((panelist, i) => (
            <span key={panelist.id} className="pbe-panelChip" title={panelist.role}>
              {panelist.name} <b>{fmt1(triple[i])}</b>
            </span>
          ))}
          <span
            className={
              isDiverged ? 'pbe-spreadChip is-diverged' : 'pbe-spreadChip is-tight'
            }>
            spread {fmt1(spread)}
          </span>
          <span className="pbe-spreadChip is-tight">consensus {fmt1(consensus)}</span>
        </div>
        {note != null ? (
          <p className="pbe-bdNote">{note.text}</p>
        ) : (
          <Text type="supporting" color="secondary">
            No scorer note on this cell — the panel scored within{' '}
            {fmt1(spread)} points of each other.
          </Text>
        )}
      </>
    );
  }

  const breakdownCard = (
    <section className="pbe-card" aria-label="Panel breakdown">
      <div className="pbe-cardHead">
        <Icon icon={UsersIcon} size="sm" color="secondary" />
        <span className="pbe-overline">Panel breakdown</span>
        <div className="pbe-spring" />
        <Text type="supporting" color="secondary">
          {PANEL.length} scorers · consensus = panel mean
        </Text>
      </div>
      <div className="pbe-breakdown">{breakdownBody}</div>
    </section>
  );

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      {/* Polite live region — re-ranking announces the new leader. */}
      <div className="pbe-vh" aria-live="polite">
        {\`\${leader.vendor.name} leads at \${fmt1(leader.total)} points\`}
      </div>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="pbe-frame">
              {rail}
              <main className="pbe-main">
                {podium}
                {matrixCard}
                {breakdownCard}
                {gatesCard}
              </main>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};