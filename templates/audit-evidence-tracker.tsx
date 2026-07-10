// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Attest FY2026 ICFR fieldwork
 *   ledger for Meridian Foods Co.: 34 PBC evidence requests PBC-101..134
 *   across 7 control areas (REV 6 + TRS 4 + PAY 4 + INV 5 + ITG 6 + FXA 4 +
 *   CLS 5 = 34 ✓) with initial statuses accepted 15 + in review 6 +
 *   received 5 + requested 6 + returned 2 = 34 ✓. Fieldwork runs Mar 2 –
 *   Mar 27 2026 over 20 business days; the demo's internal "today" is
 *   Wed Mar 18 (index 12). Burn-down history (remaining open = 34 −
 *   accepted) is the fixed 12-point series 34,34,33,32,31,29,28,27,25,23,
 *   22,20 for Mar 2–17; today's point derives live: 34 − 15 accepted = 19
 *   open ✓. Projection velocity = (remaining 5 bd ago − remaining today)/5
 *   = (27 − 19)/5 = 1.6/bd; ceil(19 / 1.6) = 12 bd after Mar 18 lands
 *   Apr 3 = +5 bd past the Mar 27 target ⇒ initial "At risk". Accepting 4
 *   queued items reaches 15 open, velocity 2.4, ceil(15/2.4) = 7 bd =
 *   Mar 27 exactly ⇒ the banner flips to "On track" live. Late = due
 *   before Mar 18 and not accepted: PBC-105 (due Mar 16), PBC-114 (Mar 17),
 *   PBC-121 (Mar 13) = 3 ✓. No Date.now(), no Math.random(), no timers,
 *   no network assets.
 * @output Attest — Audit Evidence Tracker: an engagement-wide PBC command
 *   surface. A header row (Attest seal mark, engagement title, Fieldwork
 *   Badge, live accepted/open/late stats and the projection risk chip)
 *   over a two-region frame: the main column stacks the PBC MATRIX (7
 *   control-area rows × 5 status columns of clickable count cells with
 *   per-status underline bars, row/column totals, and a pulse on every
 *   count that changes), then a two-up band of the LATE-CLOSE BURN-DOWN
 *   (SVG: ideal line, fixed 12-point actual history, live today dot, and
 *   a dashed projection that re-aims at the derived finish date vs the
 *   Mar 27 target line) beside the ACTIVITY LEDGER (append-only decision
 *   log with one-step Undo), then the CONTROL-OWNER SCORECARD (7 derived
 *   rows: assigned/accepted/open/reworks + completion bar). The 384px
 *   right rail is the REVIEWER QUEUE — matrix-cell clicks filter it — with
 *   a detail card offering the status-true action for every row: Accept /
 *   Return-with-reason on in-review items, Start review on received,
 *   Send reminder on requested, Log resubmission on returned. Signature
 *   move: accepting or returning evidence advances the matrix cell (both
 *   affected cells pulse), drops the burn-down's today point and re-aims
 *   the projection, re-derives the owner scorecard row and every header
 *   stat, and appends an undoable ledger entry — one store, six surfaces.
 * @position Page template; emitted by `astryx template audit-evidence-tracker`
 *
 * Frame: root 100dvh div wrapping Layout height="fill"; LayoutHeader owns
 *   the engagement chrome; LayoutContent padding={0} hosts a hand-rolled
 *   `.aet-frame` CSS grid `minmax(0,1fr) 384px` (hand-rolled because the
 *   rail must restack via a media query, which DS grid inline styles would
 *   defeat). Both columns scroll independently (`minHeight: 0`); the rail
 *   is itself a grid of filter bar / scrolling queue / detail card so the
 *   queue never pushes the decision actions off-screen.
 *
 * Responsive contract:
 * - Default desktop (~1045px inline stage, no breakpoint needed): main
 *   column ≈645px beside the 384px rail; the matrix's 7 columns (176px
 *   label + 5 × minmax(64px,1fr) + 72px total) fit without scrolling.
 * - <=980px: `.aet-frame` becomes one block column; the rail follows the
 *   main stack full-width and the queue caps at 336px (5 × 64px rows)
 *   with its own scroll. The burn-down/ledger two-up also stacks.
 * - <=640px (390px embed iframe): the matrix keeps a 560px min-width
 *   inside an overflow-x scroller (subtraction, not squeeze); the
 *   scorecard drops its Reworks column; the detail meta grid goes single
 *   column; header stats wrap; every action stays >=40px tall.
 *
 * Container policy (workbench archetype): frame-first rows, rails, and
 *   bordered section cards only — no marketing cards. The matrix, queue,
 *   scorecard, and ledger are dense row surfaces; the burn-down is an
 *   inline SVG fed by literal arrays plus two derived points.
 *
 * Color policy: token-pure chrome. ONE quarantined brand accent — Attest
 *   slate-blue light-dark(#3E5C94, #8FB0E8): #3E5C94 on #FFFFFF ≈ 6.6:1,
 *   #8FB0E8 on #1C1C1E ≈ 7.8:1 (both clear 4.5:1 text). State pairs, each
 *   with math at the declaration: accepted green light-dark(#15803D,
 *   #4ADE80) ≈ 4.6:1 / 10.1:1; review amber light-dark(#B45309, #FBBF24)
 *   ≈ 4.6:1 / 11.7:1; received cyan light-dark(#0E7490, #22D3EE) ≈ 4.9:1
 *   / 9.9:1; returned/late red light-dark(#B91C1C, #F87171) ≈ 5.9:1 /
 *   6.9:1. NEVER var(--color-text) — text tokens are --color-text-primary
 *   / --color-text-secondary throughout.
 *
 * Density grid (repeated verbatim in the CSS): matrix column header 34 ·
 *   matrix rows 44 · queue rows 64 · scorecard rows 40 · scorecard header
 *   34 · ledger rows 34 · burn-down viewBox 640×200 · rail 384 · gutter
 *   var(--spacing-4) · action buttons and reason chips >=40px hit height ·
 *   11px overlines · tabular-nums on every count, date, and percentage.
 *
 * Fixture policy: one state owner (the `requests` array). Accept, return,
 *   start-review, remind, resubmit, and undo all flow through a single
 *   mutate path that re-derives the matrix, burn-down, projection,
 *   scorecard, header stats, and ledger in the same render. Aggregates
 *   cross-check by construction — every count on screen is derived from
 *   the row set, never stored twice.
 */

import {useState} from 'react';

import {
  AlertTriangleIcon,
  ArchiveIcon,
  CheckCircle2Icon,
  FileTextIcon,
  FilterXIcon,
  HistoryIcon,
  InboxIcon,
  PaperclipIcon,
  Undo2Icon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// contrast math. ONE quarantined brand accent; four state families.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-audit-evidence-tracker';

// THE brand accent (Attest slate-blue). #3E5C94 vs #FFFFFF ≈ 6.6:1 (passes
// 4.5:1 with margin); #8FB0E8 vs the dark card (~#1C1C1E) ≈ 7.8:1.
const ACCENT = 'light-dark(#3E5C94, #8FB0E8)';
// Accent wash for selected cells/rows — a surface tint, never a text color.
const ACCENT_TINT = 'light-dark(rgba(62, 92, 148, 0.10), rgba(143, 176, 232, 0.14))';

// Accepted green: #15803D on #FFFFFF ≈ 4.6:1; #4ADE80 on #1C1C1E ≈ 10.1:1.
const GREEN = 'light-dark(#15803D, #4ADE80)';
const GREEN_TINT = 'light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))';
// In-review amber: #B45309 on #FFFFFF ≈ 4.6:1; #FBBF24 on #1C1C1E ≈ 11.7:1.
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(251, 191, 36, 0.16))';
// Received cyan: #0E7490 on #FFFFFF ≈ 4.9:1; #22D3EE on #1C1C1E ≈ 9.9:1.
const CYAN = 'light-dark(#0E7490, #22D3EE)';
const CYAN_TINT = 'light-dark(rgba(14, 116, 144, 0.12), rgba(34, 211, 238, 0.14))';
// Returned/late red: #B91C1C on #FFFFFF ≈ 5.9:1; #F87171 on #1C1C1E ≈ 6.9:1.
const RED = 'light-dark(#B91C1C, #F87171)';
const RED_TINT = 'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors prefixed with the scope class. Density grid
// verbatim: matrix col header 34 · matrix rows 44 · queue rows 64 ·
// scorecard rows 40 · ledger rows 34 · rail 384 · gutter spacing-4.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${SCOPE} .aet-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.${SCOPE} .aet-btn:focus-visible,
.${SCOPE} .aet-chipBtn:focus-visible {
  outline: 2px solid ${ACCENT};
  outline-offset: -2px;
}
.${SCOPE} .aet-mono {
  font-family: ${MONO};
  font-variant-numeric: tabular-nums;
}

/* ---- Frame: main column + 384px rail; hand-rolled grid so the <=980px
   restack is a real media query, not a squeezed flex row. ---- */
.${SCOPE} .aet-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 384px;
  height: 100%;
  min-height: 0;
}
.${SCOPE} .aet-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${SCOPE} .aet-rail {
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.${SCOPE} .aet-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- Header stat cluster ---- */
.${SCOPE} .aet-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  flex-wrap: wrap;
  row-gap: var(--spacing-2);
}
.${SCOPE} .aet-headRow .aet-spring { flex: 1; }
.${SCOPE} .aet-brandCol { display: flex; flex-direction: column; min-width: 0; }
.${SCOPE} .aet-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .aet-headStats {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${SCOPE} .aet-stat { display: flex; align-items: baseline; gap: 5px; }
.${SCOPE} .aet-statValue {
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .aet-statValue.is-late { color: ${RED}; }
.${SCOPE} .aet-statLabel { font-size: 11px; color: var(--color-text-secondary); }
.${SCOPE} .aet-riskChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .aet-riskChip.is-late { color: ${RED}; background: ${RED_TINT}; }
.${SCOPE} .aet-riskChip.is-ok { color: ${GREEN}; background: ${GREEN_TINT}; }

/* ---- Section cards ---- */
.${SCOPE} .aet-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-card);
  overflow: hidden;
}
.${SCOPE} .aet-cardHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .aet-cardHead .aet-spring { flex: 1; }
.${SCOPE} .aet-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ---- PBC matrix: 176px area label + 5 status columns + 72px total.
   Rows 44px, column header 34px. ---- */
.${SCOPE} .aet-matrixScroll { overflow-x: auto; }
.${SCOPE} .aet-matrix {
  display: grid;
  grid-template-columns: 176px repeat(5, minmax(64px, 1fr)) 72px;
  min-width: 560px;
}
.${SCOPE} .aet-mxCorner {
  height: 34px;
  display: flex;
  align-items: center;
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-scoreBarWrap { display: flex; align-items: center; gap: var(--spacing-2); }
.${SCOPE} .aet-scoreBarWrap .aet-scorePct {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}
.${SCOPE} .aet-scoreBarWrap .aet-scoreBarTrack { flex: 1; }
.${SCOPE} .aet-mxColHead {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  padding-inline: 4px;
}
.${SCOPE} button.aet-mxColHead:hover { background: var(--color-background-muted); }
.${SCOPE} .aet-mxColHead[aria-pressed='true'] {
  color: var(--color-text-primary);
  background: ${ACCENT_TINT};
  box-shadow: inset 0 -2px 0 0 ${ACCENT};
}
.${SCOPE} .aet-mxDot { width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0; }
.${SCOPE} .aet-mxRowHead {
  width: 100%;
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.${SCOPE} button.aet-mxRowHead:hover { background: var(--color-background-muted); }
.${SCOPE} .aet-mxRowHead[aria-pressed='true'] {
  background: ${ACCENT_TINT};
  box-shadow: inset 2px 0 0 0 ${ACCENT};
}
.${SCOPE} .aet-mxRowName {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .aet-mxRowOwner {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .aet-mxCell {
  position: relative;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
.${SCOPE} button.aet-mxCell:hover { background: var(--color-background-muted); }
.${SCOPE} .aet-mxCell[aria-pressed='true'] {
  background: ${ACCENT_TINT};
  box-shadow: inset 0 0 0 1px ${ACCENT};
}
.${SCOPE} .aet-mxCount {
  font-size: 14px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.${SCOPE} .aet-mxCount.is-zero { color: var(--color-text-secondary); opacity: 0.55; }
.${SCOPE} .aet-mxBar {
  width: 26px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${SCOPE} .aet-mxBarFill { height: 100%; border-radius: 999px; }
.${SCOPE} .aet-mxTotal {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-mxFoot {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-mxFoot.is-label {
  border-left: none;
  justify-content: flex-start;
  padding-inline: var(--spacing-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}
@keyframes aet-pulse {
  0% { background: ${ACCENT_TINT}; }
  100% { background: transparent; }
}
.${SCOPE} .aet-pulse { animation: aet-pulse 900ms ease-out; }

/* ---- Burn-down + ledger two-up ---- */
.${SCOPE} .aet-twoUp {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--spacing-4);
  align-items: stretch;
}
.${SCOPE} .aet-burnBody { padding: var(--spacing-3) var(--spacing-4) var(--spacing-4); }
.${SCOPE} .aet-burnSvg { width: 100%; height: auto; display: block; }
.${SCOPE} .aet-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  padding-top: var(--spacing-2);
}
.${SCOPE} .aet-legendItem {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-legendSwatch {
  width: 14px;
  height: 0;
  border-top-width: 2px;
  border-top-style: solid;
}

/* ---- Activity ledger: 34px rows, latest first ---- */
.${SCOPE} .aet-ledger {
  list-style: none;
  margin: 0;
  padding: var(--spacing-2) 0;
  overflow-y: auto;
  max-height: 244px;
}
.${SCOPE} .aet-ledgerRow {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-4);
  font-size: 12px;
}
.${SCOPE} .aet-ledgerWhen {
  font-family: ${MONO};
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  width: 46px;
}
.${SCOPE} .aet-ledgerText {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* ---- Owner scorecard: 40px rows, 34px header row ---- */
.${SCOPE} .aet-scoreRow {
  display: grid;
  grid-template-columns: minmax(150px, 1.5fr) 62px 62px 52px 62px minmax(110px, 1fr);
  align-items: center;
  height: 40px;
  padding-inline: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  column-gap: var(--spacing-2);
}
.${SCOPE} .aet-scoreRow:last-child { border-bottom: none; }
.${SCOPE} .aet-scoreRow.is-head {
  height: 34px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-scoreNum {
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.${SCOPE} .aet-scoreRow.is-head .aet-scoreNum { font-size: 11px; }
.${SCOPE} .aet-scoreOwner { min-width: 0; display: flex; flex-direction: column; }
.${SCOPE} .aet-scoreOwner b {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .aet-scoreOwner span {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .aet-scoreBarTrack {
  height: 5px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${SCOPE} .aet-scoreBarFill {
  height: 100%;
  border-radius: 999px;
  background: ${GREEN};
  transition: width 300ms ease;
}

/* ---- Rail: filter bar / queue (64px rows) / detail ---- */
.${SCOPE} .aet-filterBar {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  flex-wrap: wrap;
}
.${SCOPE} .aet-filterBar .aet-spring { flex: 1; }
.${SCOPE} .aet-filterChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding-inline: 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${ACCENT_TINT};
  color: ${ACCENT};
  white-space: nowrap;
}
.${SCOPE} .aet-queue { overflow-y: auto; min-height: 0; }
.${SCOPE} .aet-queueRow {
  width: 100%;
  min-height: 64px;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  column-gap: var(--spacing-2);
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .aet-queueRow:hover { background: var(--color-background-muted); }
.${SCOPE} .aet-queueRow[aria-pressed='true'] {
  background: ${ACCENT_TINT};
  box-shadow: inset 2px 0 0 0 ${ACCENT};
}
.${SCOPE} .aet-qDot { width: 8px; height: 8px; border-radius: 999px; }
.${SCOPE} .aet-qMain { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${SCOPE} .aet-qTop { display: flex; align-items: baseline; gap: var(--spacing-2); min-width: 0; }
.${SCOPE} .aet-qId {
  font-family: ${MONO};
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${SCOPE} .aet-qTitle {
  font-size: 12.5px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${SCOPE} .aet-qMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
  min-width: 0;
}
.${SCOPE} .aet-qArea {
  font-family: ${MONO};
  font-size: 10px;
  letter-spacing: 0.04em;
}
.${SCOPE} .aet-dueChip {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-dueChip.is-late { color: ${RED}; font-weight: 650; }
.${SCOPE} .aet-dueChip.is-today { color: ${AMBER}; font-weight: 650; }
.${SCOPE} .aet-emptyQueue {
  padding: var(--spacing-6) var(--spacing-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  text-align: center;
}

/* ---- Detail card ---- */
.${SCOPE} .aet-detail {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 46dvh;
  overflow-y: auto;
}
.${SCOPE} .aet-detailTop { display: flex; align-items: center; gap: var(--spacing-2); }
.${SCOPE} .aet-detailTop .aet-spring { flex: 1; }
.${SCOPE} .aet-statusChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding-inline: 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.${SCOPE} .aet-metaGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2) var(--spacing-3);
  margin: 0;
}
.${SCOPE} .aet-metaItem { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.${SCOPE} .aet-metaItem dt {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .aet-metaItem dd {
  margin: 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .aet-fileWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.${SCOPE} .aet-fileChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding-inline: 8px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 11px;
  max-width: 100%;
  min-width: 0;
}
.${SCOPE} .aet-fileChip span {
  font-family: ${MONO};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${SCOPE} .aet-fileChip i {
  font-style: normal;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.${SCOPE} .aet-note {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  border-left: 2px solid var(--color-border);
  padding-left: var(--spacing-3);
  margin: 0;
}
.${SCOPE} .aet-actions { display: flex; gap: var(--spacing-2); flex-wrap: wrap; }
.${SCOPE} .aet-reasonWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.${SCOPE} .aet-chipBtn {
  font: inherit;
  border: var(--border-width) solid var(--color-border);
  background: none;
  cursor: pointer;
  min-height: 40px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--color-text-primary);
}
.${SCOPE} .aet-chipBtn:hover { background: var(--color-background-muted); }
.${SCOPE} .aet-chipBtn[aria-pressed='true'] {
  border-color: ${RED};
  color: ${RED};
  background: ${RED_TINT};
  font-weight: 600;
}

/* ---- Responsive: restack at 980; matrix scroller + column drops at 640 ---- */
@media (max-width: 980px) {
  .${SCOPE} .aet-frame { display: block; overflow-y: auto; }
  .${SCOPE} .aet-main { overflow-y: visible; }
  .${SCOPE} .aet-rail {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .aet-queue { max-height: 336px; } /* 5 × 64px rows + hairlines */
  .${SCOPE} .aet-twoUp { grid-template-columns: minmax(0, 1fr); }
  .${SCOPE} .aet-detail { max-height: none; }
}
@media (max-width: 640px) {
  .${SCOPE} .aet-scoreRow {
    grid-template-columns: minmax(120px, 1.5fr) 62px 62px 62px minmax(90px, 1fr);
  }
  .${SCOPE} .aet-scoreReworks { display: none; }
  .${SCOPE} .aet-metaGrid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .aet-pulse { animation: none; }
  .${SCOPE} .aet-scoreBarFill { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// DOMAIN VOCABULARY — control areas, statuses, the fieldwork calendar.
// ---------------------------------------------------------------------------

type AreaId = 'REV' | 'TRS' | 'PAY' | 'INV' | 'ITG' | 'FXA' | 'CLS';
type Status = 'requested' | 'received' | 'inReview' | 'accepted' | 'returned';

interface AreaMeta {
  id: AreaId;
  name: string;
  owner: string;
  ownerRole: string;
}

/** Control areas by identity — the matrix rows AND the scorecard rows both
 * reference this table, so owner names never drift between surfaces. */
const AREAS: AreaMeta[] = [
  {id: 'REV', name: 'Revenue & Receivables', owner: 'Priya Raman', ownerRole: 'VP Revenue Ops'},
  {id: 'TRS', name: 'Treasury & Cash', owner: 'Marcus Webb', ownerRole: 'Treasurer'},
  {id: 'PAY', name: 'Payroll & Benefits', owner: 'Elena Sotelo', ownerRole: 'Payroll Director'},
  {id: 'INV', name: 'Inventory & Costing', owner: 'Daniel Cho', ownerRole: 'Supply Chain Controller'},
  {id: 'ITG', name: 'ITGC · Access & Change', owner: 'Farah Aziz', ownerRole: 'IT Compliance Lead'},
  {id: 'FXA', name: 'Fixed Assets & Leases', owner: 'Tom Ostrander', ownerRole: 'Controller — Assets'},
  {id: 'CLS', name: 'Financial Close & Reporting', owner: 'Grace Lindqvist', ownerRole: 'Assistant Controller'},
];

const AREA_BY_ID = new Map(AREAS.map(a => [a.id, a]));

const STATUS_ORDER: Status[] = [
  'requested',
  'received',
  'inReview',
  'accepted',
  'returned',
];

const STATUS_META: Record<Status, {label: string; short: string; color: string; tint: string}> = {
  // Requested has no literal hue — it is the neutral "not in hand" state.
  requested: {label: 'Requested', short: 'Req', color: 'var(--color-text-secondary)', tint: 'var(--color-background-muted)'},
  received: {label: 'Received', short: 'Rcvd', color: CYAN, tint: CYAN_TINT},
  inReview: {label: 'In review', short: 'Rev', color: AMBER, tint: AMBER_TINT},
  accepted: {label: 'Accepted', short: 'Acc', color: GREEN, tint: GREEN_TINT},
  returned: {label: 'Returned', short: 'Ret', color: RED, tint: RED_TINT},
};

/** Fieldwork business days Mar 2 – Mar 27 2026 (20) plus a 5-day slip
 * runway to Apr 3 for the projection axis. Index 12 = today (Mar 18);
 * index 19 = the Mar 27 close target. */
const AXIS_DAYS = [
  'Mar 2', 'Mar 3', 'Mar 4', 'Mar 5', 'Mar 6',
  'Mar 9', 'Mar 10', 'Mar 11', 'Mar 12', 'Mar 13',
  'Mar 16', 'Mar 17', 'Mar 18', 'Mar 19', 'Mar 20',
  'Mar 23', 'Mar 24', 'Mar 25', 'Mar 26', 'Mar 27',
  'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3',
];
const TODAY_IDX = 12; // Mar 18
const TARGET_IDX = 19; // Mar 27
const TOTAL_REQUESTS = 34;

/** Remaining-open history for Mar 2 – Mar 17 (indices 0..11). Today's point
 * (index 12) is DERIVED live: 34 − accepted count. */
const BURNDOWN_HISTORY = [34, 34, 33, 32, 31, 29, 28, 27, 25, 23, 22, 20];

/** Trailing 5-business-day velocity anchor: remaining on Mar 11 (index 7 =
 * HISTORY.length − 5) minus remaining today, over 5 bd. */
const VELOCITY_ANCHOR = BURNDOWN_HISTORY[BURNDOWN_HISTORY.length - 5]; // 27

const ENGAGEMENT = 'Meridian Foods Co. — FY2026 ICFR audit';
const SIGNED_IN = 'Jordan Ellis'; // engagement senior — the acting reviewer

const RETURN_REASONS = [
  'Illegible scan',
  'Wrong period',
  'Incomplete population',
  'Missing approval',
  'Stale system report',
];

// ---------------------------------------------------------------------------
// FIXTURES — 34 evidence requests. Statuses: accepted 15 · inReview 6 ·
// received 5 · requested 6 · returned 2 (= 34). Late (dueIdx < 12, not
// accepted): PBC-105, PBC-114, PBC-121.
// ---------------------------------------------------------------------------

interface FileRef {
  name: string;
  size: string;
}

interface EvidenceRequest {
  id: string;
  area: AreaId;
  controlRef: string;
  title: string;
  status: Status;
  sample: string | null;
  files: FileRef[];
  requestedOn: string;
  receivedOn: string | null;
  dueIdx: number; // index into AXIS_DAYS
  reviewer: string | null;
  reworkCount: number;
  note: string | null;
  remindedOn: string | null;
}

const REQUESTS: EvidenceRequest[] = [
  // ---- REV · Revenue & Receivables (6) ----
  {
    id: 'PBC-101', area: 'REV', controlRef: 'REV-01.1', status: 'accepted',
    title: 'Revenue recognition policy memo + ASC 606 position papers',
    sample: 'Policy set · 3 documents',
    files: [{name: 'rev_recognition_memo_fy26.pdf', size: '1.2 MB'}],
    requestedOn: 'Mar 2', receivedOn: 'Mar 4', dueIdx: 4,
    reviewer: 'Ana Duarte', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-102', area: 'REV', controlRef: 'REV-03.2', status: 'accepted',
    title: 'Dec/Jan sales cutoff — last 5 invoices of Dec + first 5 of Jan',
    sample: '10 of 10 selections',
    files: [
      {name: 'cutoff_selections_dec_jan.xlsx', size: '412 KB'},
      {name: 'bol_scans_batch1.pdf', size: '8.4 MB'},
    ],
    requestedOn: 'Mar 2', receivedOn: 'Mar 9', dueIdx: 7,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-103', area: 'REV', controlRef: 'REV-04.1', status: 'inReview',
    title: 'Credit memo register Q4 with approval evidence for memos > $25k',
    sample: '12 of 214 memos',
    files: [
      {name: 'credit_memo_register_q4.xlsx', size: '1.8 MB'},
      {name: 'approvals_gt25k.zip', size: '22.1 MB'},
    ],
    requestedOn: 'Mar 5', receivedOn: 'Mar 16', dueIdx: 13,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-104', area: 'REV', controlRef: 'REV-02.3', status: 'accepted',
    title: 'AR aging at Dec 31 tied to GL 12000 with reconciliation',
    sample: null,
    files: [
      {name: 'ar_aging_1231.xlsx', size: '2.6 MB'},
      {name: 'ar_recon_dec.pdf', size: '190 KB'},
    ],
    requestedOn: 'Mar 2', receivedOn: 'Mar 5', dueIdx: 5,
    reviewer: 'Ravi Menon', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-105', area: 'REV', controlRef: 'REV-05.2', status: 'requested',
    title: 'SSP analysis refresh for bundled arrangements (FY24–FY26 comparative)',
    sample: null, files: [],
    requestedOn: 'Mar 9', receivedOn: null, dueIdx: 10, // due Mar 16 — LATE
    reviewer: null, reworkCount: 0,
    note: 'Revenue Ops flagged a dependency on the pricing team refresh; no revised ETA yet.',
    remindedOn: null,
  },
  {
    id: 'PBC-106', area: 'REV', controlRef: 'REV-03.4', status: 'received',
    title: 'Manual journal entries to revenue accounts in the close window (Dec 28 – Jan 8)',
    sample: 'All 17 entries over $50k',
    files: [{name: 'manual_jes_rev_close.xlsx', size: '640 KB'}],
    requestedOn: 'Mar 10', receivedOn: 'Mar 17', dueIdx: 14,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },

  // ---- TRS · Treasury & Cash (4) ----
  {
    id: 'PBC-107', area: 'TRS', controlRef: 'TRS-01.2', status: 'accepted',
    title: 'Bank confirmations — all 9 operating and sweep accounts',
    sample: '9 of 9 accounts',
    files: [{name: 'confirmation_control_sheet.pdf', size: '480 KB'}],
    requestedOn: 'Mar 2', receivedOn: 'Mar 6', dueIdx: 6,
    reviewer: 'Ana Duarte', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-108', area: 'TRS', controlRef: 'TRS-02.1', status: 'accepted',
    title: 'December bank reconciliations with outstanding-item aging',
    sample: 'Main operating account',
    files: [{name: 'bank_rec_dec_operating.xlsx', size: '310 KB'}],
    requestedOn: 'Mar 3', receivedOn: 'Mar 9', dueIdx: 7,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-109', area: 'TRS', controlRef: 'TRS-03.3', status: 'inReview',
    title: 'FX forward contract register + Dec 31 mark-to-market support',
    sample: 'All 14 open contracts',
    files: [
      {name: 'fx_forward_register.xlsx', size: '220 KB'},
      {name: 'mtm_dec31_chatham.pdf', size: '2.9 MB'},
    ],
    requestedOn: 'Mar 6', receivedOn: 'Mar 13', dueIdx: 12, // due today
    reviewer: 'Ana Duarte', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-110', area: 'TRS', controlRef: 'TRS-04.1', status: 'requested',
    title: 'Debt covenant compliance certificates Q2–Q4 with bank acknowledgements',
    sample: null, files: [],
    requestedOn: 'Mar 11', receivedOn: null, dueIdx: 14,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },

  // ---- PAY · Payroll & Benefits (4) ----
  {
    id: 'PBC-111', area: 'PAY', controlRef: 'PAY-01.1', status: 'accepted',
    title: 'Payroll register to GL tie-out — July and December cycles',
    sample: '2 of 24 cycles',
    files: [{name: 'payroll_gl_tieout_jul_dec.xlsx', size: '940 KB'}],
    requestedOn: 'Mar 3', receivedOn: 'Mar 6', dueIdx: 6,
    reviewer: 'Ravi Menon', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-112', area: 'PAY', controlRef: 'PAY-02.4', status: 'accepted',
    title: 'New-hire onboarding approvals — 8 selections with signed offer + I-9',
    sample: '8 of 112 hires',
    files: [{name: 'newhire_selections_fy26.zip', size: '14.7 MB'}],
    requestedOn: 'Mar 4', receivedOn: 'Mar 10', dueIdx: 8,
    reviewer: 'Ana Duarte', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-113', area: 'PAY', controlRef: 'PAY-03.2', status: 'received',
    title: 'Termination access-removal evidence for 6 December leavers',
    sample: '6 of 6 leavers',
    files: [{name: 'term_access_removal_dec.xlsx', size: '96 KB'}],
    requestedOn: 'Mar 9', receivedOn: 'Mar 16', dueIdx: 13,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-114', area: 'PAY', controlRef: 'PAY-04.1', status: 'returned',
    title: 'Bonus accrual calculation with CFO approval — Dec 31 balance $2.41M',
    sample: null,
    files: [{name: 'bonus_accrual_dec31_v1.xlsx', size: '1.1 MB'}],
    requestedOn: 'Mar 5', receivedOn: 'Mar 12', dueIdx: 11, // due Mar 17 — LATE
    reviewer: 'Jordan Ellis', reworkCount: 1,
    note: 'Returned Mar 16: population ties to the GL, but the workbook is missing the CFO approval tab referenced in the control description.',
    remindedOn: null,
  },

  // ---- INV · Inventory & Costing (5) ----
  {
    id: 'PBC-115', area: 'INV', controlRef: 'INV-01.2', status: 'accepted',
    title: 'Physical count instructions + count-sheet index — Reno and Camden DCs',
    sample: null,
    files: [{name: 'count_instructions_fy26.pdf', size: '2.2 MB'}],
    requestedOn: 'Mar 2', receivedOn: 'Mar 5', dueIdx: 5,
    reviewer: 'Ravi Menon', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-116', area: 'INV', controlRef: 'INV-02.1', status: 'accepted',
    title: 'Count variance resolution log — Reno DC (23 variances > $5k)',
    sample: '23 of 23 variances',
    files: [{name: 'variance_log_reno.xlsx', size: '350 KB'}],
    requestedOn: 'Mar 4', receivedOn: 'Mar 11', dueIdx: 9,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-117', area: 'INV', controlRef: 'INV-03.3', status: 'inReview',
    title: 'Standard cost roll-forward FY25→FY26 with PPV bridge by commodity',
    sample: 'Top 20 SKUs · 84% of value',
    files: [
      {name: 'std_cost_rollforward.xlsx', size: '3.4 MB'},
      {name: 'ppv_bridge_fy26.pptx', size: '5.2 MB'},
    ],
    requestedOn: 'Mar 6', receivedOn: 'Mar 13', dueIdx: 13,
    reviewer: 'Ravi Menon', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-118', area: 'INV', controlRef: 'INV-04.2', status: 'received',
    title: 'E&O reserve model Dec 31 with demand-signal inputs from S&OP',
    sample: null,
    files: [{name: 'eo_reserve_model_dec31.xlsx', size: '4.8 MB'}],
    requestedOn: 'Mar 10', receivedOn: 'Mar 17', dueIdx: 14,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-119', area: 'INV', controlRef: 'INV-05.1', status: 'requested',
    title: 'In-transit inventory support — 12 shipments open at Dec 31 (BOL + receiving)',
    sample: '12 of 12 shipments', files: [],
    requestedOn: 'Mar 12', receivedOn: null, dueIdx: 15,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },

  // ---- ITG · ITGC — Access & Change (6) ----
  {
    id: 'PBC-120', area: 'ITG', controlRef: 'ITG-01.1', status: 'accepted',
    title: 'AD quarterly access review certifications Q1–Q4 (Sailpoint exports)',
    sample: '4 of 4 quarters',
    files: [{name: 'sailpoint_certs_q1_q4.zip', size: '9.3 MB'}],
    requestedOn: 'Mar 3', receivedOn: 'Mar 9', dueIdx: 7,
    reviewer: 'Katya Blum', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-121', area: 'ITG', controlRef: 'ITG-02.3', status: 'requested',
    title: 'Privileged-access roster with quarterly recert evidence — Oracle ERP + Snowflake',
    sample: null, files: [],
    requestedOn: 'Mar 5', receivedOn: null, dueIdx: 9, // due Mar 13 — LATE
    reviewer: null, reworkCount: 0,
    note: 'Re-requested after scope clarification — now includes Snowflake SYSADMIN role grants alongside the domain-admin roster.',
    remindedOn: null,
  },
  {
    id: 'PBC-122', area: 'ITG', controlRef: 'ITG-03.2', status: 'inReview',
    title: 'Change tickets for 25 ERP transports sampled from the FY26 release log',
    sample: '25 of 412 transports',
    files: [
      {name: 'transport_sample_25.xlsx', size: '780 KB'},
      {name: 'servicenow_chg_export.csv', size: '1.6 MB'},
    ],
    requestedOn: 'Mar 4', receivedOn: 'Mar 12', dueIdx: 12, // due today
    reviewer: 'Katya Blum', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-123', area: 'ITG', controlRef: 'ITG-04.1', status: 'accepted',
    title: 'Batch job failure monitoring — December Control-M incident queue',
    sample: null,
    files: [{name: 'controlm_incidents_dec.xlsx', size: '270 KB'}],
    requestedOn: 'Mar 4', receivedOn: 'Mar 10', dueIdx: 8,
    reviewer: 'Katya Blum', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-124', area: 'ITG', controlRef: 'ITG-05.4', status: 'received',
    title: 'Firewall rule recertification — DMZ segment, H2 review workpapers',
    sample: null,
    files: [{name: 'fw_recert_dmz_h2.pdf', size: '3.1 MB'}],
    requestedOn: 'Mar 11', receivedOn: 'Mar 17', dueIdx: 15,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },
  {
    // Stress row: 80-char title + double rework — exercises queue-title
    // ellipsis and the rework badge path.
    id: 'PBC-125', area: 'ITG', controlRef: 'ITG-02.5', status: 'returned',
    title: 'Terminated-user access removal within 24h — 15 selections across ERP, AD, and Okta',
    sample: '15 of 61 leavers',
    files: [{name: 'term_access_evidence_v2.zip', size: '18.9 MB'}],
    requestedOn: 'Mar 4', receivedOn: 'Mar 13', dueIdx: 13,
    reviewer: 'Katya Blum', reworkCount: 2,
    note: 'Second return Mar 17: Okta deprovision timestamps still missing for 4 of 15 selections; AD and ERP evidence is now complete.',
    remindedOn: null,
  },

  // ---- FXA · Fixed Assets & Leases (4) ----
  {
    id: 'PBC-126', area: 'FXA', controlRef: 'FXA-01.1', status: 'accepted',
    title: 'FY26 capex additions listing tied to the fixed asset register',
    sample: 'Additions ≥ $10k',
    files: [{name: 'capex_additions_fy26.xlsx', size: '1.5 MB'}],
    requestedOn: 'Mar 3', receivedOn: 'Mar 9', dueIdx: 6,
    reviewer: 'Ravi Menon', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-127', area: 'FXA', controlRef: 'FXA-02.2', status: 'accepted',
    title: 'Lease modification memos — 3 amended DC leases with ASC 842 remeasurement',
    sample: '3 of 3 amendments',
    files: [{name: 'lease_mod_memos.pdf', size: '2.0 MB'}],
    requestedOn: 'Mar 5', receivedOn: 'Mar 11', dueIdx: 9,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-128', area: 'FXA', controlRef: 'FXA-03.1', status: 'inReview',
    title: 'Impairment triggers assessment — Camden line 4 idle equipment ($3.8M NBV)',
    sample: null,
    files: [
      {name: 'impairment_assessment_camden.docx', size: '410 KB'},
      {name: 'idle_asset_register.xlsx', size: '150 KB'},
    ],
    requestedOn: 'Mar 9', receivedOn: 'Mar 16', dueIdx: 14,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-129', area: 'FXA', controlRef: 'FXA-04.3', status: 'requested',
    title: 'CIP aging with capitalization-readiness notes at Dec 31',
    sample: null, files: [],
    requestedOn: 'Mar 12', receivedOn: null, dueIdx: 16,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },

  // ---- CLS · Financial Close & Reporting (5) ----
  {
    id: 'PBC-130', area: 'CLS', controlRef: 'CLS-01.2', status: 'accepted',
    title: 'Close checklist sign-offs — December (Workiva export with reviewer stamps)',
    sample: null,
    files: [{name: 'close_checklist_dec.pdf', size: '860 KB'}],
    requestedOn: 'Mar 3', receivedOn: 'Mar 10', dueIdx: 7,
    reviewer: 'Ana Duarte', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-131', area: 'CLS', controlRef: 'CLS-02.1', status: 'accepted',
    title: 'Account reconciliation index Dec 31 — status by owner from Blackline',
    sample: null,
    files: [{name: 'blackline_recon_index.xlsx', size: '520 KB'}],
    requestedOn: 'Mar 4', receivedOn: 'Mar 11', dueIdx: 8,
    reviewer: 'Jordan Ellis', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-132', area: 'CLS', controlRef: 'CLS-03.4', status: 'inReview',
    title: 'Top-side journal entries FY26 with business rationale and CFO approval',
    sample: 'All 6 top-side entries',
    files: [{name: 'topside_je_support.xlsx', size: '520 KB'}],
    requestedOn: 'Mar 10', receivedOn: 'Mar 16', dueIdx: 13,
    reviewer: 'Ana Duarte', reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-133', area: 'CLS', controlRef: 'CLS-04.1', status: 'received',
    title: 'Subsequent events support — legal letters + cash receipts through Mar 13',
    sample: null,
    files: [{name: 'subsequent_events_pack.pdf', size: '6.7 MB'}],
    requestedOn: 'Mar 11', receivedOn: 'Mar 16', dueIdx: 15,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },
  {
    id: 'PBC-134', area: 'CLS', controlRef: 'CLS-05.2', status: 'requested',
    title: 'Management representation letter draft — FY26 tailoring vs prior year',
    sample: null, files: [],
    requestedOn: 'Mar 13', receivedOn: null, dueIdx: 17,
    reviewer: null, reworkCount: 0, note: null, remindedOn: null,
  },
];

interface LogEntry {
  id: number;
  when: string;
  text: string;
  undoable: boolean;
}

const INITIAL_LOG: LogEntry[] = [
  {id: 5, when: 'Mar 18', text: 'PBC-131 accepted by J. Ellis — recon index ties to Blackline', undoable: false},
  {id: 4, when: 'Mar 17', text: 'PBC-125 returned to F. Aziz — Okta timestamps missing (2nd return)', undoable: false},
  {id: 3, when: 'Mar 17', text: 'PBC-124 received from F. Aziz — firewall recert workpapers', undoable: false},
  {id: 2, when: 'Mar 16', text: 'PBC-114 returned to E. Sotelo — CFO approval tab missing', undoable: false},
  {id: 1, when: 'Mar 16', text: 'PBC-103 moved to review — assigned J. Ellis', undoable: false},
];

// ---------------------------------------------------------------------------
// DERIVATIONS — every aggregate on screen flows from the request array.
// ---------------------------------------------------------------------------

type MatrixCounts = Record<AreaId, Record<Status, number>>;

function countMatrix(requests: EvidenceRequest[]): MatrixCounts {
  const counts = {} as MatrixCounts;
  for (const area of AREAS) {
    counts[area.id] = {requested: 0, received: 0, inReview: 0, accepted: 0, returned: 0};
  }
  for (const r of requests) {
    counts[r.area][r.status] += 1;
  }
  return counts;
}

function isLate(r: EvidenceRequest): boolean {
  return r.dueIdx < TODAY_IDX && r.status !== 'accepted';
}

/** Projection off the trailing 5-bd velocity. remaining = open (non-accepted)
 * requests; velocity = (remaining on Mar 11 − remaining today) / 5. */
function deriveProjection(remaining: number): {
  velocity: number;
  projIdx: number; // AXIS_DAYS index where remaining hits 0 (clamped)
  clamped: boolean;
  slipBd: number; // business days past the Mar 27 target (negative = early)
} {
  const velocity = (VELOCITY_ANCHOR - remaining) / 5;
  if (velocity <= 0) {
    return {velocity: 0, projIdx: AXIS_DAYS.length - 1, clamped: true, slipBd: 99};
  }
  const rawIdx = TODAY_IDX + Math.ceil(remaining / velocity);
  const projIdx = Math.min(rawIdx, AXIS_DAYS.length - 1);
  return {velocity, projIdx, clamped: rawIdx > AXIS_DAYS.length - 1, slipBd: rawIdx - TARGET_IDX};
}

/** Short label for the due chip: "Due Mar 19", "Due today", "Late · Mar 16". */
function dueLabel(r: EvidenceRequest): {text: string; cls: string} {
  if (isLate(r)) {
    return {text: `Late · ${AXIS_DAYS[r.dueIdx]}`, cls: 'aet-dueChip is-late'};
  }
  if (r.dueIdx === TODAY_IDX && r.status !== 'accepted') {
    return {text: 'Due today', cls: 'aet-dueChip is-today'};
  }
  return {text: `Due ${AXIS_DAYS[r.dueIdx]}`, cls: 'aet-dueChip'};
}

/** Abbreviate "Jordan Ellis" -> "J. Ellis" for ledger copy. */
function shortName(name: string): string {
  const [first, ...rest] = name.split(' ');
  return rest.length > 0 ? `${first[0]}. ${rest.join(' ')}` : name;
}

// ---------------------------------------------------------------------------
// BRAND MARK — Attest seal: a slate-blue rounded square holding a check
// stroke over a baseline rule (a "stamped" tick). Inline SVG, no emoji.
// ---------------------------------------------------------------------------

function AttestMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden focusable="false">
      <rect x="1" y="1" width="24" height="24" rx="7" fill={ACCENT} />
      <path
        d="M7.5 13.4 L11.2 17 L18.5 8.8"
        fill="none"
        stroke="light-dark(#FFFFFF, #101A2C)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 20.4 H18.5"
        fill="none"
        stroke="light-dark(rgba(255,255,255,0.55), rgba(16,26,44,0.55))"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BURN-DOWN CHART — fixed 640×200 viewBox. Ideal line 34→0 across the 20
// fieldwork days; actual = 12 fixed history points + the live today dot;
// projection = dashed accent from today to the derived zero-crossing.
// ---------------------------------------------------------------------------

const BD_W = 640;
const BD_H = 200;
const BD_LEFT = 30;
const BD_RIGHT = 632;
const BD_TOP = 12;
const BD_BOTTOM = 158;

function bdX(dayIdx: number): number {
  return BD_LEFT + (dayIdx / (AXIS_DAYS.length - 1)) * (BD_RIGHT - BD_LEFT);
}

function bdY(remaining: number): number {
  return BD_TOP + (1 - remaining / TOTAL_REQUESTS) * (BD_BOTTOM - BD_TOP);
}

const BD_X_TICKS: {idx: number; label: string}[] = [
  {idx: 0, label: 'Mar 2'},
  {idx: 5, label: 'Mar 9'},
  {idx: 10, label: 'Mar 16'},
  {idx: 15, label: 'Mar 23'},
  {idx: 19, label: 'Mar 27'},
  {idx: 24, label: 'Apr 3'},
];

function BurnDownChart({
  remaining,
  projIdx,
  clamped,
}: {
  remaining: number;
  projIdx: number;
  clamped: boolean;
}) {
  const actualPoints = [
    ...BURNDOWN_HISTORY.map((v, i) => `${bdX(i)},${bdY(v)}`),
    `${bdX(TODAY_IDX)},${bdY(remaining)}`,
  ].join(' ');
  const onTrack = projIdx <= TARGET_IDX && !clamped;
  const projLabel = clamped ? `${AXIS_DAYS[projIdx]}+` : AXIS_DAYS[projIdx];
  return (
    <svg
      className="aet-burnSvg"
      viewBox={`0 0 ${BD_W} ${BD_H}`}
      role="img"
      aria-label={`Burn-down: ${remaining} of ${TOTAL_REQUESTS} requests open; projected finish ${projLabel} vs the Mar 27 target`}>
      {/* Horizontal grid + y labels at 0/10/20/30 */}
      {[0, 10, 20, 30].map(v => (
        <g key={v}>
          <line
            x1={BD_LEFT}
            x2={BD_RIGHT}
            y1={bdY(v)}
            y2={bdY(v)}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            x={BD_LEFT - 6}
            y={bdY(v) + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--color-text-secondary)">
            {v}
          </text>
        </g>
      ))}
      {/* X ticks */}
      {BD_X_TICKS.map(t => (
        <g key={t.idx}>
          <line
            x1={bdX(t.idx)}
            x2={bdX(t.idx)}
            y1={BD_BOTTOM}
            y2={BD_BOTTOM + 4}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            x={bdX(t.idx)}
            y={BD_BOTTOM + 15}
            textAnchor="middle"
            fontSize="9"
            fill="var(--color-text-secondary)">
            {t.label}
          </text>
        </g>
      ))}
      {/* Mar 27 target vline */}
      <line
        x1={bdX(TARGET_IDX)}
        x2={bdX(TARGET_IDX)}
        y1={BD_TOP - 2}
        y2={BD_BOTTOM}
        stroke={RED}
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.7"
      />
      <text
        x={bdX(TARGET_IDX)}
        y={BD_TOP - 3}
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fill={RED}>
        Target
      </text>
      {/* Ideal line: 34 -> 0 across the 20 fieldwork days */}
      <line
        x1={bdX(0)}
        y1={bdY(TOTAL_REQUESTS)}
        x2={bdX(TARGET_IDX)}
        y2={bdY(0)}
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        opacity="0.55"
      />
      {/* Projection: dashed accent from the live today point to zero */}
      <line
        x1={bdX(TODAY_IDX)}
        y1={bdY(remaining)}
        x2={bdX(projIdx)}
        y2={bdY(0)}
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      {/* Actual: fixed history + derived today point */}
      <polyline
        points={actualPoints}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={bdX(TODAY_IDX)} cy={bdY(remaining)} r="4" fill={ACCENT} />
      <text
        x={bdX(TODAY_IDX) + 7}
        y={bdY(remaining) - 6}
        fontSize="10"
        fontWeight="650"
        fill="var(--color-text-primary)">
        {remaining} open
      </text>
      {/* Projected landing marker */}
      <circle
        cx={bdX(projIdx)}
        cy={bdY(0)}
        r="3.5"
        fill="none"
        stroke={onTrack ? GREEN : RED}
        strokeWidth="1.8"
      />
      <text
        x={Math.min(bdX(projIdx), BD_RIGHT - 34)}
        y={bdY(0) - 8}
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="650"
        fill={onTrack ? GREEN : RED}>
        {projLabel}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner (`requests`); accept/return/start-review/remind/
// resubmit/undo all flow through `mutate`, and every surface re-derives.
// ---------------------------------------------------------------------------

interface CellFilter {
  area: AreaId | null;
  status: Status | null;
}

export default function AuditEvidenceTrackerTemplate() {
  const [requests, setRequests] = useState<EvidenceRequest[]>(REQUESTS);
  const [filter, setFilter] = useState<CellFilter>({area: null, status: 'inReview'});
  const [selectedId, setSelectedId] = useState('PBC-103');
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>(INITIAL_LOG);
  const [lastDecision, setLastDecision] = useState<EvidenceRequest | null>(null);
  // Matrix pulse: bumping a cell's counter remounts it with the .aet-pulse
  // class so the highlight animation retriggers on every count change.
  const [pulses, setPulses] = useState<Record<string, number>>({});

  // ----- Derivations (all from the single request array) -----
  const matrix = countMatrix(requests);
  const acceptedCount = requests.reduce(
    (n, r) => n + (r.status === 'accepted' ? 1 : 0),
    0,
  );
  const remaining = TOTAL_REQUESTS - acceptedCount;
  const lateCount = requests.reduce((n, r) => n + (isLate(r) ? 1 : 0), 0);
  const acceptedPct = Math.round((acceptedCount / TOTAL_REQUESTS) * 100);
  const {velocity, projIdx, clamped, slipBd} = deriveProjection(remaining);
  const onTrack = slipBd <= 0;
  const projLabel = clamped ? `${AXIS_DAYS[projIdx]}+` : AXIS_DAYS[projIdx];
  const daysToClose = TARGET_IDX - TODAY_IDX;

  const colTotals: Record<Status, number> = {
    requested: 0, received: 0, inReview: 0, accepted: 0, returned: 0,
  };
  for (const area of AREAS) {
    for (const s of STATUS_ORDER) {
      colTotals[s] += matrix[area.id][s];
    }
  }

  const queue = requests
    .filter(
      r =>
        (filter.area == null || r.area === filter.area) &&
        (filter.status == null || r.status === filter.status),
    )
    .sort((a, b) => {
      const lateDiff = Number(isLate(b)) - Number(isLate(a));
      if (lateDiff !== 0) {
        return lateDiff;
      }
      if (a.dueIdx !== b.dueIdx) {
        return a.dueIdx - b.dueIdx;
      }
      return a.id.localeCompare(b.id);
    });

  const selected = requests.find(r => r.id === selectedId) ?? null;
  const selectedArea = selected != null ? AREA_BY_ID.get(selected.area) : undefined;

  // ----- Mutations -----
  const appendLog = (text: string, undoable: boolean) => {
    setLog(prev => [
      {id: prev[0].id + 1, when: 'Mar 18', text, undoable},
      ...prev,
    ]);
  };

  const bumpCells = (area: AreaId, from: Status, to: Status) => {
    setPulses(prev => ({
      ...prev,
      [`${area}:${from}`]: (prev[`${area}:${from}`] ?? 0) + 1,
      [`${area}:${to}`]: (prev[`${area}:${to}`] ?? 0) + 1,
    }));
  };

  const mutate = (
    id: string,
    patch: Partial<EvidenceRequest>,
    logText: string,
    undoable: boolean,
  ) => {
    const current = requests.find(r => r.id === id);
    if (current == null) {
      return;
    }
    setRequests(prev => prev.map(r => (r.id === id ? {...r, ...patch} : r)));
    if (patch.status != null && patch.status !== current.status) {
      bumpCells(current.area, current.status, patch.status);
    }
    appendLog(logText, undoable);
    if (undoable) {
      setLastDecision(current);
    }
  };

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setIsReturning(false);
    setReturnReason(null);
  };

  const acceptSelected = () => {
    if (selected == null) {
      return;
    }
    mutate(
      selected.id,
      {status: 'accepted', reviewer: SIGNED_IN},
      `${selected.id} accepted by ${shortName(SIGNED_IN)} — evidence sufficient`,
      true,
    );
    setIsReturning(false);
    setReturnReason(null);
  };

  const confirmReturn = () => {
    if (selected == null || selectedArea == null || returnReason == null) {
      return;
    }
    mutate(
      selected.id,
      {
        status: 'returned',
        reviewer: SIGNED_IN,
        reworkCount: selected.reworkCount + 1,
        note: `Returned Mar 18: ${returnReason.toLowerCase()} — resubmission requested from ${selectedArea.owner}.`,
      },
      `${selected.id} returned to ${shortName(selectedArea.owner)} — ${returnReason.toLowerCase()}`,
      true,
    );
    setIsReturning(false);
    setReturnReason(null);
  };

  const startReview = () => {
    if (selected == null) {
      return;
    }
    mutate(
      selected.id,
      {status: 'inReview', reviewer: SIGNED_IN},
      `${selected.id} moved to review — assigned ${shortName(SIGNED_IN)}`,
      false,
    );
  };

  const sendReminder = () => {
    if (selected == null || selectedArea == null) {
      return;
    }
    mutate(
      selected.id,
      {remindedOn: 'Mar 18'},
      `Reminder sent to ${shortName(selectedArea.owner)} for ${selected.id}`,
      false,
    );
  };

  const logResubmission = () => {
    if (selected == null || selectedArea == null) {
      return;
    }
    mutate(
      selected.id,
      {status: 'received', receivedOn: 'Mar 18'},
      `${selected.id} resubmitted by ${shortName(selectedArea.owner)} — back in Received`,
      false,
    );
  };

  const undoLast = () => {
    if (lastDecision == null) {
      return;
    }
    const snapshot = lastDecision;
    const current = requests.find(r => r.id === snapshot.id);
    setRequests(prev => prev.map(r => (r.id === snapshot.id ? snapshot : r)));
    if (current != null && current.status !== snapshot.status) {
      bumpCells(snapshot.area, current.status, snapshot.status);
    }
    appendLog(`Undo — ${snapshot.id} restored to ${STATUS_META[snapshot.status].label}`, false);
    setLastDecision(null);
  };

  const toggleCellFilter = (area: AreaId | null, status: Status | null) => {
    setFilter(prev =>
      prev.area === area && prev.status === status
        ? {area: null, status: null}
        : {area, status},
    );
  };

  const hasFilter = filter.area != null || filter.status != null;

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <div className="aet-headRow">
        <AttestMark />
        <div className="aet-brandCol">
          <Heading level={1}>Attest — Evidence Tracker</Heading>
          <span className="aet-brandSub">{ENGAGEMENT}</span>
        </div>
        <Badge label="Fieldwork" variant="info" />
        <div className="aet-spring" />
        <div className="aet-headStats">
          <div className="aet-stat">
            <span className="aet-statValue">
              {acceptedCount}/{TOTAL_REQUESTS}
            </span>
            <span className="aet-statLabel">accepted · {acceptedPct}%</span>
          </div>
          <div className="aet-stat">
            <span className="aet-statValue">{remaining}</span>
            <span className="aet-statLabel">open</span>
          </div>
          <div className="aet-stat">
            <span className={lateCount > 0 ? 'aet-statValue is-late' : 'aet-statValue'}>
              {lateCount}
            </span>
            <span className="aet-statLabel">late</span>
          </div>
          <div className="aet-stat">
            <span className="aet-statValue">{daysToClose}</span>
            <span className="aet-statLabel">bd to close</span>
          </div>
          <span className={onTrack ? 'aet-riskChip is-ok' : 'aet-riskChip is-late'}>
            {onTrack ? (
              <CheckCircle2Icon size={12} aria-hidden />
            ) : (
              <AlertTriangleIcon size={12} aria-hidden />
            )}
            {onTrack
              ? `On track · proj ${projLabel}`
              : `At risk · proj ${projLabel} (+${clamped ? '5+' : slipBd} bd)`}
          </span>
        </div>
      </div>
    </LayoutHeader>
  );

  // ----- PBC matrix -----
  const matrixCard = (
    <section className="aet-card" aria-label="PBC matrix by control area and status">
      <div className="aet-cardHead">
        <span className="aet-overline">PBC matrix — control area × status</span>
        <div className="aet-spring" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {TOTAL_REQUESTS} requests · click a cell to filter the queue
        </Text>
      </div>
      <div className="aet-matrixScroll">
        <div className="aet-matrix">
          <div className="aet-mxCorner">Control area</div>
          {STATUS_ORDER.map(s => (
            <button
              key={s}
              type="button"
              className="aet-btn aet-mxColHead"
              aria-pressed={filter.status === s && filter.area == null}
              aria-label={`Filter queue to ${STATUS_META[s].label} (${colTotals[s]})`}
              onClick={() => toggleCellFilter(null, s)}>
              <span className="aet-mxDot" style={{background: STATUS_META[s].color}} />
              {STATUS_META[s].label}
            </button>
          ))}
          <div className="aet-mxColHead">Total</div>
          {AREAS.map(area => {
            const rowTotal = STATUS_ORDER.reduce(
              (n, s) => n + matrix[area.id][s],
              0,
            );
            return (
              <div key={area.id} style={{display: 'contents'}}>
                <button
                  type="button"
                  className="aet-btn aet-mxRowHead"
                  aria-pressed={filter.area === area.id && filter.status == null}
                  aria-label={`Filter queue to ${area.name} (${rowTotal} requests, owner ${area.owner})`}
                  onClick={() => toggleCellFilter(area.id, null)}>
                  <span className="aet-mxRowName">{area.name}</span>
                  <span className="aet-mxRowOwner">
                    {area.id} · {area.owner}
                  </span>
                </button>
                {STATUS_ORDER.map(s => {
                  const count = matrix[area.id][s];
                  const pulseKey = pulses[`${area.id}:${s}`] ?? 0;
                  return (
                    <button
                      key={`${area.id}:${s}:${pulseKey}`}
                      type="button"
                      className={
                        pulseKey > 0 ? 'aet-btn aet-mxCell aet-pulse' : 'aet-btn aet-mxCell'
                      }
                      aria-pressed={filter.area === area.id && filter.status === s}
                      aria-label={`${area.name}, ${STATUS_META[s].label}: ${count} ${
                        count === 1 ? 'request' : 'requests'
                      }`}
                      onClick={() => toggleCellFilter(area.id, s)}>
                      <span className={count === 0 ? 'aet-mxCount is-zero' : 'aet-mxCount'}>
                        {count === 0 ? '–' : count}
                      </span>
                      <span className="aet-mxBar" aria-hidden>
                        <span
                          className="aet-mxBarFill"
                          style={{
                            width: `${rowTotal === 0 ? 0 : (count / rowTotal) * 100}%`,
                            background: STATUS_META[s].color,
                          }}
                        />
                      </span>
                    </button>
                  );
                })}
                <div className="aet-mxTotal">{rowTotal}</div>
              </div>
            );
          })}
          <div className="aet-mxFoot is-label">All areas</div>
          {STATUS_ORDER.map(s => (
            <div key={s} className="aet-mxFoot">
              {colTotals[s]}
            </div>
          ))}
          <div className="aet-mxFoot">{TOTAL_REQUESTS}</div>
        </div>
      </div>
    </section>
  );

  // ----- Burn-down + activity ledger -----
  const burnDownCard = (
    <section className="aet-card" aria-label="Late-close burn-down">
      <div className="aet-cardHead">
        <span className="aet-overline">Late-close burn-down</span>
        <div className="aet-spring" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {velocity > 0 ? `${velocity.toFixed(1)}/bd pace` : 'no pace yet'}
        </Text>
      </div>
      <div className="aet-burnBody">
        <BurnDownChart remaining={remaining} projIdx={projIdx} clamped={clamped} />
        <div className="aet-legend" aria-hidden>
          <span className="aet-legendItem">
            <span className="aet-legendSwatch" style={{borderTopColor: ACCENT}} />
            Actual open
          </span>
          <span className="aet-legendItem">
            <span
              className="aet-legendSwatch"
              style={{borderTopColor: 'var(--color-text-secondary)', borderTopStyle: 'dashed'}}
            />
            Ideal
          </span>
          <span className="aet-legendItem">
            <span
              className="aet-legendSwatch"
              style={{borderTopColor: ACCENT, borderTopStyle: 'dashed'}}
            />
            Projection
          </span>
          <span className="aet-legendItem">
            <span
              className="aet-legendSwatch"
              style={{borderTopColor: RED, borderTopStyle: 'dashed'}}
            />
            Mar 27 target
          </span>
        </div>
      </div>
    </section>
  );

  const ledgerCard = (
    <section className="aet-card" aria-label="Activity ledger">
      <div className="aet-cardHead">
        <Icon icon={HistoryIcon} size="sm" color="secondary" />
        <span className="aet-overline">Activity</span>
        <div className="aet-spring" />
        <Button
          label="Undo"
          variant="ghost"
          size="sm"
          isDisabled={lastDecision == null}
          onClick={undoLast}
        />
      </div>
      <ol className="aet-ledger">
        {log.map(entry => (
          <li key={entry.id} className="aet-ledgerRow">
            <span className="aet-ledgerWhen">{entry.when}</span>
            <span className="aet-ledgerText" title={entry.text}>
              {entry.text}
            </span>
            {entry.undoable && entry.id === log[0].id && lastDecision != null && (
              <Icon icon={Undo2Icon} size="sm" color="secondary" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );

  // ----- Control-owner scorecard -----
  const scorecard = (
    <section className="aet-card" aria-label="Control-owner scorecard">
      <div className="aet-cardHead">
        <span className="aet-overline">Control-owner scorecard</span>
        <div className="aet-spring" />
        <Text type="supporting" color="secondary">
          derived live from the request set
        </Text>
      </div>
      <div>
        <div className="aet-scoreRow is-head" aria-hidden>
          <span>Owner</span>
          <span className="aet-scoreNum">Assigned</span>
          <span className="aet-scoreNum">Accepted</span>
          <span className="aet-scoreNum aet-scoreReworks">Reworks</span>
          <span className="aet-scoreNum">Open</span>
          <span>Complete</span>
        </div>
        {AREAS.map(area => {
          const rows = requests.filter(r => r.area === area.id);
          const accepted = rows.reduce(
            (n, r) => n + (r.status === 'accepted' ? 1 : 0),
            0,
          );
          const reworks = rows.reduce((n, r) => n + r.reworkCount, 0);
          const open = rows.length - accepted;
          const pct = rows.length === 0 ? 0 : Math.round((accepted / rows.length) * 100);
          return (
            <div key={area.id} className="aet-scoreRow">
              <span className="aet-scoreOwner">
                <b>{area.owner}</b>
                <span>
                  {area.name} · {area.ownerRole}
                </span>
              </span>
              <span className="aet-scoreNum">{rows.length}</span>
              <span className="aet-scoreNum">{accepted}</span>
              <span className="aet-scoreNum aet-scoreReworks">{reworks}</span>
              <span className="aet-scoreNum">{open}</span>
              <span className="aet-scoreBarWrap">
                <span
                  className="aet-scoreBarTrack"
                  role="img"
                  aria-label={`${pct}% of ${area.owner}'s requests accepted`}>
                  <span className="aet-scoreBarFill" style={{width: `${pct}%`}} />
                </span>
                <span className="aet-scorePct">{pct}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );

  // ----- Rail: filter bar + queue + detail -----
  const filterBar = (
    <div className="aet-filterBar">
      <Icon icon={InboxIcon} size="sm" color="secondary" />
      <Text type="body" weight="semibold">
        Reviewer queue
      </Text>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {queue.length}
      </Text>
      <div className="aet-spring" />
      {filter.status != null && (
        <span className="aet-filterChip">{STATUS_META[filter.status].label}</span>
      )}
      {filter.area != null && <span className="aet-filterChip">{filter.area}</span>}
      {hasFilter && (
        <Tooltip content="Clear filter">
          <Button
            label="Clear"
            variant="ghost"
            size="sm"
            onClick={() => setFilter({area: null, status: null})}
          />
        </Tooltip>
      )}
    </div>
  );

  const queueList = (
    <div className="aet-queue" role="list" aria-label="Evidence requests">
      {queue.length === 0 && (
        <div className="aet-emptyQueue">
          <Icon icon={FilterXIcon} size="md" color="secondary" />
          <Text type="body" weight="semibold">
            No requests match this cell
          </Text>
          <Text type="supporting" color="secondary">
            Clear the matrix filter to see the full queue.
          </Text>
          <Button
            label="Clear filter"
            variant="secondary"
            size="sm"
            onClick={() => setFilter({area: null, status: null})}
          />
        </div>
      )}
      {queue.map(r => {
        const due = dueLabel(r);
        return (
          <button
            key={r.id}
            type="button"
            role="listitem"
            className="aet-btn aet-queueRow"
            aria-pressed={r.id === selectedId}
            onClick={() => selectRequest(r.id)}>
            <span
              className="aet-qDot"
              style={{background: STATUS_META[r.status].color}}
              aria-hidden
            />
            <span className="aet-qMain">
              <span className="aet-qTop">
                <span className="aet-qId">{r.id}</span>
                <span className="aet-qTitle">{r.title}</span>
              </span>
              <span className="aet-qMeta">
                <span className="aet-qArea">{r.controlRef}</span>
                <span>{AREA_BY_ID.get(r.area)?.owner}</span>
                {r.files.length > 0 && (
                  <span>
                    <PaperclipIcon size={10} aria-hidden style={{verticalAlign: '-1px'}} />{' '}
                    {r.files.length}
                  </span>
                )}
                {r.reworkCount > 0 && (
                  <span style={{color: RED, fontWeight: 650}}>×{r.reworkCount} rework</span>
                )}
              </span>
            </span>
            <span className={due.cls}>{due.text}</span>
          </button>
        );
      })}
    </div>
  );

  const detail = selected != null && selectedArea != null && (
    <div className="aet-detail" aria-label={`Detail for ${selected.id}`}>
      <div className="aet-detailTop">
        <span className="aet-mono">{selected.id}</span>
        <span
          className="aet-statusChip"
          style={{
            color: STATUS_META[selected.status].color,
            background: STATUS_META[selected.status].tint,
          }}>
          {STATUS_META[selected.status].label}
        </span>
        {selected.reworkCount > 0 && (
          <span className="aet-statusChip" style={{color: RED, background: RED_TINT}}>
            Rework ×{selected.reworkCount}
          </span>
        )}
        {selected.remindedOn != null && (
          <span className="aet-statusChip" style={{color: AMBER, background: AMBER_TINT}}>
            Reminded {selected.remindedOn}
          </span>
        )}
        <div className="aet-spring" />
      </div>
      <Text type="body" weight="semibold">
        {selected.title}
      </Text>
      <dl className="aet-metaGrid">
        <div className="aet-metaItem">
          <dt>Control ref</dt>
          <dd className="aet-mono">{selected.controlRef}</dd>
        </div>
        <div className="aet-metaItem">
          <dt>Owner</dt>
          <dd>{selectedArea.owner}</dd>
        </div>
        <div className="aet-metaItem">
          <dt>Requested</dt>
          <dd>{selected.requestedOn}</dd>
        </div>
        <div className="aet-metaItem">
          <dt>Received</dt>
          <dd>{selected.receivedOn ?? '—'}</dd>
        </div>
        <div className="aet-metaItem">
          <dt>Due</dt>
          <dd style={isLate(selected) ? {color: RED, fontWeight: 650} : undefined}>
            {AXIS_DAYS[selected.dueIdx]}
            {isLate(selected) ? ' · late' : ''}
          </dd>
        </div>
        <div className="aet-metaItem">
          <dt>Reviewer</dt>
          <dd>{selected.reviewer ?? 'Unassigned'}</dd>
        </div>
        {selected.sample != null && (
          <div className="aet-metaItem">
            <dt>Sample</dt>
            <dd>{selected.sample}</dd>
          </div>
        )}
      </dl>
      {selected.files.length > 0 ? (
        <div className="aet-fileWrap">
          {selected.files.map(f => (
            <span key={f.name} className="aet-fileChip">
              <Icon icon={FileTextIcon} size="sm" color="secondary" />
              <span>{f.name}</span>
              <i>{f.size}</i>
            </span>
          ))}
        </div>
      ) : (
        <Text type="supporting" color="secondary">
          No files yet — the client has not uploaded evidence.
        </Text>
      )}
      {selected.note != null && <p className="aet-note">{selected.note}</p>}
      {!isReturning && selected.status === 'inReview' && (
        <div className="aet-actions">
          <Button label="Accept evidence" variant="primary" onClick={acceptSelected} />
          <Button
            label="Return…"
            variant="secondary"
            onClick={() => setIsReturning(true)}
          />
        </div>
      )}
      {isReturning && selected.status === 'inReview' && (
        <>
          <span className="aet-overline">Return reason (required)</span>
          <div className="aet-reasonWrap">
            {RETURN_REASONS.map(reason => (
              <button
                key={reason}
                type="button"
                className="aet-chipBtn"
                aria-pressed={returnReason === reason}
                onClick={() =>
                  setReturnReason(prev => (prev === reason ? null : reason))
                }>
                {reason}
              </button>
            ))}
          </div>
          <div className="aet-actions">
            <Button
              label="Confirm return"
              variant="primary"
              isDisabled={returnReason == null}
              onClick={confirmReturn}
            />
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => {
                setIsReturning(false);
                setReturnReason(null);
              }}
            />
          </div>
        </>
      )}
      {selected.status === 'received' && (
        <div className="aet-actions">
          <Button
            label="Start review"
            variant="primary"
            onClick={startReview}
          />
          <Text type="supporting" color="secondary">
            Assigns {SIGNED_IN} and moves it to In review.
          </Text>
        </div>
      )}
      {selected.status === 'requested' && (
        <div className="aet-actions">
          <Button
            label={selected.remindedOn != null ? 'Reminder sent' : 'Send reminder'}
            variant="secondary"
            isDisabled={selected.remindedOn != null}
            onClick={sendReminder}
          />
        </div>
      )}
      {selected.status === 'returned' && (
        <div className="aet-actions">
          <Button label="Log resubmission" variant="primary" onClick={logResubmission} />
          <Text type="supporting" color="secondary">
            Moves it back to Received for a fresh review pass.
          </Text>
        </div>
      )}
      {selected.status === 'accepted' && (
        <div className="aet-actions">
          <Icon icon={ArchiveIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Filed to the audit binder{selected.reviewer != null ? ` by ${selected.reviewer}` : ''}.
            Use Undo in the activity ledger to reverse the latest decision.
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      {/* Polite live region — decisions announce their ledger line. */}
      <div className="aet-vh" aria-live="polite">
        {log[0].text}
      </div>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="aet-frame">
              <main className="aet-main">
                {matrixCard}
                <div className="aet-twoUp">
                  {burnDownCard}
                  {ledgerCard}
                </div>
                {scorecard}
              </main>
              <aside className="aet-rail" aria-label="Reviewer queue and detail">
                {filterBar}
                {queueList}
                {detail}
              </aside>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

