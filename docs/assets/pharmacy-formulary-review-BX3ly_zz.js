var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic Compendia fixtures only: a 9-member P&T committee
 *   roster (one member, Dr. Ellison, recused on M-2026-044 for a declared
 *   conflict), a 7-class × 5-placement therapeutic coverage matrix (agent
 *   placements per class: Statins 10, GLP-1 7, SGLT2 4, DOAC 4, Biologic
 *   DMARDs 7, ICS/LABA 6, SSRI/SNRI 8 — 46 tracked agents, row sums stated
 *   per fixture and asserted in the matrix footer), and a 7-motion docket
 *   with pre-recorded votes. Pre-recorded vote cross-check, done by hand:
 *   M-038 4F/1A/1Ab (6), M-039 2F (2), M-040 none (0), M-041 2F/3A/1Ab (6),
 *   M-042 none (0), M-043 2F/0A/1Ab (3), M-044 3F/2A (5, Ellison recused);
 *   totals 13 For + 6 Against + 3 Abstain = 22 recorded ✓. Quorum is 6
 *   recorded ballots (abstentions count toward quorum, not toward the
 *   majority), so at load M-038 sits at quorum-and-passing, M-041 at
 *   quorum-and-failing, and M-044 one ballot short of quorum. No clock
 *   reads, no randomness, no timers, no network assets — appended minute
 *   timestamps derive from a frozen 13:47 session clock advancing a fixed
 *   3 minutes per recorded decision.
 * @output Compendia — P&T Formulary Motion Board: a committee-session
 *   surface for a Pharmacy & Therapeutics quarterly review. Left, the
 *   therapeutic-class coverage matrix (class rows × T1/T2/T3/PA-ST/NC
 *   placement columns) with the selected motion's from→to cells outlined
 *   and ratified deltas ringed in the brand accent, above the running
 *   session minutes. Center, the motion docket: filterable motion cards
 *   carrying tier-movement chips, evidence chips, a stacked For/Against/
 *   Abstain tally bar, and a recorded-ballots dot strip. Right, the vote
 *   recorder for the selected motion: per-member For/Against/Abstain
 *   segmented ballot buttons (toggle to clear; recused rows locked), a
 *   6-segment quorum meter, a full-width tally bar, and the decision gate.
 *   Signature interaction: recording a ballot re-derives the tally bar,
 *   quorum meter, readiness chip, and docket card in the same render;
 *   ratifying a passing motion moves the agent count between the two
 *   matrix cells it names, appends a session-minute entry, bumps the
 *   docket-progress stat, and locks the roster — abstentions visibly fill
 *   quorum without moving the majority needle.
 * @position Page template; emitted by \`astryx template pharmacy-formulary-review\`
 *
 * Frame: a 100dvh root gives Layout height="fill" a definite height.
 *   LayoutHeader carries the Compendia mark, session title, docket-progress
 *   badge, and attendance chip. LayoutContent owns a hand-rolled 3-column
 *   CSS grid (296px matrix rail · minmax(0,1fr) docket · 344px recorder) —
 *   hand-rolled because the responsive contract restacks regions with media
 *   queries that a DS grid's inline styles would defeat. Each column scrolls
 *   independently (overflow-y auto, min-height 0).
 *
 * Responsive contract:
 * - Default desktop (the ~1045px inline demo stage, where viewport media
 *   queries never fire): all three columns render side by side — 296 + 344
 *   fixed leaves the docket ~400px, which the card column is designed for
 *   (single-column cards, movement chip wraps under the title). No
 *   breakpoint is needed at the stage width; wider full-screen windows
 *   only widen the docket column.
 * - <=920px: the grid restacks to one scrolling column in reading order —
 *   docket, vote recorder, coverage matrix + minutes — and the page owns
 *   the scroll instead of the columns (subtraction of the side-by-side
 *   arrangement, not a squeeze).
 * - <=560px (390px embed iframe): ballot buttons grow to 44px hit targets,
 *   the header sheds the attendance chip, the matrix table scrolls
 *   horizontally inside its own body, and filter chips grow to 40px and
 *   wrap to extra rows.
 *
 * Container policy (committee-session archetype): the matrix is a dense
 *   table, the docket is a list of selectable motion cards (cards earn
 *   their keep here — each motion is a self-contained ballot object with
 *   its own tally), the recorder is a panel of 48px roster rows. No
 *   marketing layout, no hero.
 *
 * Color policy: token-first chrome (var(--color-*), var(--spacing-*)).
 *   ONE quarantined brand accent — Compendia emerald
 *   light-dark(#047857, #34D399): #047857 on #FFFFFF ≈ 5.5:1 (passes 4.5:1
 *   text), #34D399 on ~#1C1C1E ≈ 8.9:1. Ballot state pairs, each with math:
 *   Against light-dark(#B42318, #F97066) ≈ 6.6:1 / 6.1:1; Abstain
 *   light-dark(#B54708, #FDB022) ≈ 5.4:1 / 9.2:1. Tints are the same hues
 *   at ≤0.16 alpha and only ever carry text in the paired solid color.
 *   NEVER the phantom bare color-text token — all text paints from
 *   --color-text-primary / --color-text-secondary.
 *
 * Density grid (repeated verbatim in the CSS): 56px header · 296px matrix
 *   rail · 344px recorder panel · 36px matrix rows · 48px roster rows ·
 *   40px minute rows · 10px tally bars (8px compact on docket cards) ·
 *   12px quorum segments · 28px ballot buttons (44px under 560px) ·
 *   var(--spacing-3) column gutters · tabular-nums on every count, sum,
 *   and tally figure.
 *
 * Fixture policy: fixed data only. Ballots, decisions, and minutes live in
 *   one state owner; tallies, quorum, readiness, matrix deltas, and docket
 *   progress are all derived from that state in render — nothing is stored
 *   twice, so every surface that shows a number recomputes from the same
 *   ballots. Appended minute clocks step a frozen counter (13:47 + 3min ×
 *   decisions recorded); no clock reads anywhere.
 */

import {useMemo, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {
  CheckIcon,
  FileTextIcon,
  GavelIcon,
  MinusIcon,
  ScaleIcon,
  ShieldAlertIcon,
  XIcon,
} from 'lucide-react';

const SCOPE = 'tpl-pharmacy-formulary-review';

// ============= BRAND + STATE COLORS =============
// THE quarantined Compendia brand accent (emerald). Contrast math:
// #047857 on #FFFFFF ≈ 5.5:1 (passes 4.5:1 for text at any size);
// #34D399 on the dark surface (~#1C1C1E) ≈ 8.9:1.
const ACCENT = 'light-dark(#047857, #34D399)';
// Wash behind accent-colored text/cells; text on a wash is always the solid
// ACCENT pair, never a tinted color — rgba washes at ≤0.16 alpha shift the
// backing luminance by <6%, keeping the pairs above their 4.5:1 floors.
const ACCENT_TINT =
  'light-dark(rgba(4, 120, 87, 0.10), rgba(52, 211, 153, 0.14))';
// Against (opposed ballots): #B42318 on #FFFFFF ≈ 6.6:1;
// #F97066 on ~#1C1C1E ≈ 6.1:1.
const AGAINST = 'light-dark(#B42318, #F97066)';
const AGAINST_TINT =
  'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))';
// Abstain (present, not voting): #B54708 on #FFFFFF ≈ 5.4:1;
// #FDB022 on ~#1C1C1E ≈ 9.2:1.
const ABSTAIN = 'light-dark(#B54708, #FDB022)';
const ABSTAIN_TINT =
  'light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.16))';

// ============= TEMPLATE CSS =============
// Density grid (verbatim from the header): 56px header · 296px matrix rail ·
// 344px recorder panel · 36px matrix rows · 48px roster rows · 40px minute
// rows · 10px tally bars (8px compact on docket cards) · 12px quorum
// segments · 28px ballot buttons (44px under 560px) · var(--spacing-3)
// gutters.

const TEMPLATE_CSS = \`
.\${SCOPE} {
  --pfr-accent: \${ACCENT};
  --pfr-accent-tint: \${ACCENT_TINT};
  --pfr-against: \${AGAINST};
  --pfr-against-tint: \${AGAINST_TINT};
  --pfr-abstain: \${ABSTAIN};
  --pfr-abstain-tint: \${ABSTAIN_TINT};
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
}
.\${SCOPE} *,
.\${SCOPE} *::before,
.\${SCOPE} *::after {
  box-sizing: border-box;
}
.\${SCOPE} button {
  font-family: inherit;
}
.\${SCOPE} button:focus-visible {
  outline: 2px solid var(--pfr-accent);
  outline-offset: 2px;
}

/* ---- header ---- */
.\${SCOPE} .brandLockup {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  min-width: 0;
}
.\${SCOPE} .brandMark {
  flex: none;
}
.\${SCOPE} .brandMeta {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.\${SCOPE} .headerRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  min-width: 0;
  width: 100%;
}
.\${SCOPE} .headerRight {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-2);
}
.\${SCOPE} .attendanceChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  white-space: nowrap;
}

/* ---- 3-column session frame ----
   Hand-rolled grid: the <=920px restack below needs media queries that a
   DS grid's inline styles would defeat. 296px rail + 344px recorder leaves
   ~400px for the docket at the ~1045px demo stage. */
.\${SCOPE} .frame {
  display: grid;
  grid-template-columns: 296px minmax(0, 1fr) 344px;
  height: 100%;
  min-height: 0;
}
.\${SCOPE} .pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
}
.\${SCOPE} .paneMatrix {
  border-right: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .paneRecorder {
  border-left: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .paneSection {
  flex: none;
  padding: var(--spacing-3);
}
.\${SCOPE} .paneSection + .paneSection {
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .sectionLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  margin: 0 0 var(--spacing-2);
  text-transform: uppercase;
}

/* ---- coverage matrix: 36px rows ---- */
.\${SCOPE} .matrixScroll {
  overflow-x: auto;
}
.\${SCOPE} .matrix {
  border-collapse: collapse;
  min-width: 264px;
  width: 100%;
}
.\${SCOPE} .matrix th,
.\${SCOPE} .matrix td {
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12px;
  height: 36px;
  padding: 0 4px;
}
.\${SCOPE} .matrix thead th {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
}
.\${SCOPE} .matrix thead th.clsHead {
  text-align: left;
}
.\${SCOPE} .matrix .clsName {
  color: var(--color-text-primary);
  font-weight: 550;
  max-width: 122px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .matrix tr.clsActive .clsName {
  color: var(--pfr-accent);
}
.\${SCOPE} .matrix tr.clsActive td {
  background: var(--pfr-accent-tint);
}
.\${SCOPE} .matrix td.cell {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.\${SCOPE} .matrix td.cell .cellPill {
  border: var(--border-width) solid transparent;
  border-radius: 6px;
  display: inline-block;
  line-height: 22px;
  min-width: 24px;
  padding: 0 2px;
}
/* Selected motion's movement: dashed FROM cell, solid TO cell. */
.\${SCOPE} .matrix td.cellFrom .cellPill {
  border-color: var(--pfr-accent);
  border-style: dashed;
  color: var(--color-text-primary);
}
.\${SCOPE} .matrix td.cellTo .cellPill {
  border-color: var(--pfr-accent);
  color: var(--color-text-primary);
}
/* Cells already moved by a ratified motion this session. */
.\${SCOPE} .matrix td.cellChanged .cellPill {
  background: var(--pfr-accent-tint);
  color: var(--pfr-accent);
  font-weight: 650;
}
.\${SCOPE} .matrix tfoot td,
.\${SCOPE} .matrix tfoot th {
  border-bottom: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  height: 32px;
  text-align: center;
}
.\${SCOPE} .matrix tfoot th {
  text-align: left;
}
.\${SCOPE} .matrixLegend {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin: var(--spacing-2) 0 0;
}
.\${SCOPE} .matrixLegend b {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ---- session minutes: 40px rows ---- */
.\${SCOPE} .minutes {
  display: grid;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
.\${SCOPE} .minuteRow {
  align-items: baseline;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 40px minmax(0, 1fr);
  min-height: 40px;
  padding: var(--spacing-1) 0;
}
.\${SCOPE} .minuteRow + .minuteRow {
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .minuteClock {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .minuteText {
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.45;
}
.\${SCOPE} .minuteRow.minuteNew .minuteText {
  color: var(--pfr-accent);
}

/* ---- docket column ---- */
.\${SCOPE} .docketHead {
  background: var(--color-background);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 2;
}
.\${SCOPE} .filterRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}
.\${SCOPE} .filterChip {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: inline-flex;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  gap: 5px;
  min-height: 28px;
  padding: 0 10px;
}
.\${SCOPE} .filterChip[aria-pressed="true"] {
  background: var(--pfr-accent-tint);
  border-color: var(--pfr-accent);
  color: var(--pfr-accent);
  font-weight: 600;
}
.\${SCOPE} .docketBody {
  display: grid;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.\${SCOPE} .docketEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.5;
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
}

/* ---- motion cards ---- */
.\${SCOPE} .motionCard {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  text-align: left;
  width: 100%;
}
.\${SCOPE} .motionCard[aria-pressed="true"] {
  border-color: var(--pfr-accent);
  box-shadow: inset 3px 0 0 var(--pfr-accent);
}
.\${SCOPE} .motionTop {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
}
.\${SCOPE} .motionId {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.\${SCOPE} .spring {
  flex: 1;
}
.\${SCOPE} .motionTitle {
  font-size: 13.5px;
  font-weight: 620;
  line-height: 1.35;
  margin: 0;
}
.\${SCOPE} .motionMetaRow {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  font-size: 11.5px;
  gap: var(--spacing-2);
}
.\${SCOPE} .moveChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  display: inline-flex;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 4px;
  height: 20px;
  padding: 0 6px;
  white-space: nowrap;
}
.\${SCOPE} .moveChip .moveTo {
  color: var(--pfr-accent);
}
.\${SCOPE} .evidenceRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}
.\${SCOPE} .evidenceChip {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  gap: 4px;
  height: 20px;
  padding: 0 6px;
  white-space: nowrap;
}
.\${SCOPE} .motionFoot {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
}
.\${SCOPE} .ballotDots {
  display: inline-flex;
  flex: none;
  gap: 3px;
}
.\${SCOPE} .ballotDot {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 6px;
  width: 6px;
}
.\${SCOPE} .ballotDot.dotFilled {
  background: var(--pfr-accent);
}
.\${SCOPE} .ballotCount {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ---- tally bar: 10px track ---- */
.\${SCOPE} .tallyBar {
  background: var(--color-background-muted);
  border-radius: 999px;
  display: flex;
  height: 10px;
  overflow: hidden;
  width: 100%;
}
.\${SCOPE} .tallyBar.tallyCompact {
  height: 8px;
}
.\${SCOPE} .tallySeg {
  height: 100%;
  transition: width 220ms ease;
}
.\${SCOPE} .tallySeg.segFor {
  background: var(--pfr-accent);
}
.\${SCOPE} .tallySeg.segAgainst {
  background: var(--pfr-against);
}
.\${SCOPE} .tallySeg.segAbstain {
  background: var(--pfr-abstain);
}
.\${SCOPE} .tallyLegend {
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  gap: var(--spacing-2);
}
.\${SCOPE} .tallyLegend .lgFor {
  color: var(--pfr-accent);
  font-weight: 600;
}
.\${SCOPE} .tallyLegend .lgAgainst {
  color: var(--pfr-against);
  font-weight: 600;
}
.\${SCOPE} .tallyLegend .lgAbstain {
  color: var(--pfr-abstain);
  font-weight: 600;
}

/* ---- readiness chips ---- */
.\${SCOPE} .stateChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  flex: none;
  font-size: 10.5px;
  font-weight: 650;
  gap: 4px;
  height: 20px;
  letter-spacing: 0.02em;
  padding: 0 8px;
  white-space: nowrap;
}
.\${SCOPE} .stateChip.stCollecting {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.\${SCOPE} .stateChip.stPassing {
  background: var(--pfr-accent-tint);
  color: var(--pfr-accent);
}
.\${SCOPE} .stateChip.stFailing {
  background: var(--pfr-against-tint);
  color: var(--pfr-against);
}
.\${SCOPE} .stateChip.stRatified {
  background: var(--pfr-accent);
  /* On-accent text: #FFFFFF on #047857 ≈ 5.5:1 (light); #06251B on
     #34D399 ≈ 8:1 (dark) — white on #34D399 would fail at ~1.9:1. */
  color: light-dark(#FFFFFF, #06251B);
}
.\${SCOPE} .stateChip.stFailed {
  background: var(--pfr-against);
  /* #FFFFFF on #B42318 ≈ 6.6:1 (light); #2A0A08 on #F97066 ≈ 5.6:1 (dark). */
  color: light-dark(#FFFFFF, #2A0A08);
}

/* ---- vote recorder ---- */
.\${SCOPE} .recorderHead {
  display: grid;
  gap: var(--spacing-2);
}
.\${SCOPE} .recorderTitle {
  font-size: 14px;
  font-weight: 650;
  line-height: 1.35;
  margin: 0;
}
.\${SCOPE} .recorderRationale {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
.\${SCOPE} .recorderRationale b {
  color: var(--color-text-primary);
  font-weight: 600;
}
.\${SCOPE} .tallyStack {
  display: grid;
  gap: var(--spacing-2);
}
.\${SCOPE} .quorumMeter {
  display: grid;
  gap: 6px;
}
.\${SCOPE} .quorumTrack {
  display: flex;
  gap: 4px;
}
.\${SCOPE} .quorumSeg {
  background: var(--color-background-muted);
  border-radius: 3px;
  flex: 1;
  height: 12px;
  transition: background-color 180ms ease;
}
.\${SCOPE} .quorumSeg.qFilled {
  background: var(--pfr-accent);
}
.\${SCOPE} .quorumSeg.qOverflow {
  background: var(--pfr-accent);
  flex: none;
  opacity: 0.45;
  width: 18px;
}
.\${SCOPE} .quorumLabel {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .quorumLabel.qMet {
  color: var(--pfr-accent);
  font-weight: 600;
}

/* ---- roster: 48px rows, 28px ballot buttons ---- */
.\${SCOPE} .roster {
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
}
.\${SCOPE} .rosterRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 28px minmax(0, 1fr) auto;
  min-height: 48px;
  padding: var(--spacing-1) 0;
}
.\${SCOPE} .rosterRow + .rosterRow {
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .memberAvatar {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 10px;
  font-weight: 650;
  height: 28px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 28px;
}
.\${SCOPE} .memberMeta {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.\${SCOPE} .memberName {
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .memberRole {
  color: var(--color-text-secondary);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .memberRecused {
  color: var(--pfr-abstain);
  font-size: 11px;
  font-weight: 600;
}
.\${SCOPE} .ballotGroup {
  display: inline-flex;
  gap: 4px;
}
.\${SCOPE} .ballotBtn {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: inline-flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 32px;
}
.\${SCOPE} .ballotBtn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.\${SCOPE} .ballotBtn.bFor[aria-pressed="true"] {
  background: var(--pfr-accent-tint);
  border-color: var(--pfr-accent);
  color: var(--pfr-accent);
}
.\${SCOPE} .ballotBtn.bAgainst[aria-pressed="true"] {
  background: var(--pfr-against-tint);
  border-color: var(--pfr-against);
  color: var(--pfr-against);
}
.\${SCOPE} .ballotBtn.bAbstain[aria-pressed="true"] {
  background: var(--pfr-abstain-tint);
  border-color: var(--pfr-abstain);
  color: var(--pfr-abstain);
}

/* ---- decision gate ---- */
.\${SCOPE} .gate {
  display: grid;
  gap: var(--spacing-2);
}
.\${SCOPE} .gateBtn {
  align-items: center;
  border: var(--border-width) solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-size: 12.5px;
  font-weight: 650;
  gap: var(--spacing-2);
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  width: 100%;
}
.\${SCOPE} .gateBtn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.\${SCOPE} .gateBtn.gatePrimary {
  background: var(--pfr-accent);
  /* On-accent text math is at .stateChip.stRatified above. */
  color: light-dark(#FFFFFF, #06251B);
}
.\${SCOPE} .gateBtn.gateDanger {
  background: transparent;
  border-color: var(--pfr-against);
  color: var(--pfr-against);
}
.\${SCOPE} .gateHint {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  line-height: 1.5;
}
.\${SCOPE} .decidedBanner {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: grid;
  gap: 4px;
  padding: var(--spacing-2) var(--spacing-3);
}
.\${SCOPE} .decidedBanner.dbRatified {
  background: var(--pfr-accent-tint);
  border-color: var(--pfr-accent);
}
.\${SCOPE} .decidedBanner.dbFailed {
  background: var(--pfr-against-tint);
  border-color: var(--pfr-against);
}
.\${SCOPE} .decidedTitle {
  font-size: 12.5px;
  font-weight: 650;
}
.\${SCOPE} .dbRatified .decidedTitle {
  color: var(--pfr-accent);
}
.\${SCOPE} .dbFailed .decidedTitle {
  color: var(--pfr-against);
}
.\${SCOPE} .decidedMeta {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}

.\${SCOPE} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: restack under 920px (subtraction, not squeeze) ---- */
@media (max-width: 920px) {
  .\${SCOPE} .frame {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .\${SCOPE} .pane {
    overflow-y: visible;
  }
  .\${SCOPE} .paneMatrix {
    border-right: none;
    border-top: var(--border-width) solid var(--color-border);
    order: 3;
  }
  .\${SCOPE} .paneDocket {
    order: 1;
  }
  .\${SCOPE} .paneRecorder {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    order: 2;
  }
  .\${SCOPE} .docketHead {
    position: static;
  }
}

/* ---- 390px embed: 44px hit targets, header sheds the attendance chip ---- */
@media (max-width: 560px) {
  .\${SCOPE} .attendanceChip {
    display: none;
  }
  .\${SCOPE} .ballotBtn {
    height: 44px;
    width: 40px;
  }
  .\${SCOPE} .rosterRow {
    min-height: 56px;
  }
  .\${SCOPE} .filterChip {
    min-height: 40px;
  }
  .\${SCOPE} .motionCard {
    padding: var(--spacing-3) var(--spacing-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .tallySeg,
  .\${SCOPE} .quorumSeg {
    transition: none;
  }
}
\`;

// ============= DOMAIN MODEL =============

type Ballot = 'for' | 'against' | 'abstain';
type PlacementId = 't1' | 't2' | 't3' | 'pa' | 'nc';
type Decision = 'ratified' | 'failed';

interface Member {
  id: string;
  name: string;
  initials: string;
  role: string;
}

interface TherapeuticClass {
  id: string;
  name: string;
  /** Agent placements at session open; row sum = agents tracked. */
  base: Record<PlacementId, number>;
}

interface Motion {
  id: string;
  title: string;
  classId: string;
  /** Placement movement applied to the matrix on ratification. */
  from: PlacementId;
  to: PlacementId;
  requestedBy: string;
  rationale: string;
  evidence: string[];
  /** Members barred from this ballot (declared conflicts). */
  recused: string[];
}

const QUORUM = 6;

const PLACEMENTS: Array<{id: PlacementId; label: string}> = [
  {id: 't1', label: 'T1'},
  {id: 't2', label: 'T2'},
  {id: 't3', label: 'T3'},
  {id: 'pa', label: 'PA/ST'},
  {id: 'nc', label: 'NC'},
];

const PLACEMENT_LABEL: Record<PlacementId, string> = {
  t1: 'Tier 1 (generic)',
  t2: 'Tier 2 (preferred)',
  t3: 'Tier 3 (non-preferred)',
  pa: 'PA / step therapy',
  nc: 'Not covered',
};

// 9 voting members; the surface persona is the recording secretary.
const MEMBERS: Member[] = [
  {id: 'raghavan', name: 'Dr. Priya Raghavan', initials: 'PR', role: 'Chair · Clinical Pharmacy'},
  {id: 'osei', name: 'Dr. Samuel Osei', initials: 'SO', role: 'Infectious Diseases'},
  {id: 'vasquez', name: 'Dr. Elena Vasquez', initials: 'EV', role: 'Cardiology'},
  {id: 'chen', name: 'Dr. Marcus Chen', initials: 'MC', role: 'Endocrinology'},
  {id: 'weiss', name: 'Dr. Hannah Weiss', initials: 'HW', role: 'Psychiatry'},
  {id: 'okafor', name: 'Teresa Okafor, RN', initials: 'TO', role: 'Nursing Practice Council'},
  {id: 'lindqvist', name: 'David Lindqvist, PharmD', initials: 'DL', role: 'Drug Information Service'},
  {id: 'njoroge', name: 'Grace Njoroge', initials: 'GN', role: 'Pharmacy Benefits & Finance'},
  {id: 'ellison', name: 'Dr. Robert Ellison', initials: 'RE', role: 'Quality & Patient Safety'},
];

// Coverage matrix at session open. Row sums (agents tracked): Statins 10,
// GLP-1 7, SGLT2 4, DOAC 4, DMARD 7, ICS/LABA 6, SSRI/SNRI 8 = 46 agents.
const CLASSES: TherapeuticClass[] = [
  {
    id: 'cls-statin',
    name: 'Statins & lipid agents',
    base: {t1: 5, t2: 2, t3: 1, pa: 1, nc: 1}, // = 10
  },
  {
    id: 'cls-glp1',
    name: 'GLP-1 receptor agonists',
    base: {t1: 0, t2: 2, t3: 2, pa: 1, nc: 2}, // = 7
  },
  {
    id: 'cls-sglt2',
    name: 'SGLT2 inhibitors',
    base: {t1: 0, t2: 2, t3: 1, pa: 0, nc: 1}, // = 4
  },
  {
    id: 'cls-doac',
    name: 'Direct oral anticoagulants',
    base: {t1: 0, t2: 2, t3: 1, pa: 0, nc: 1}, // = 4
  },
  {
    id: 'cls-dmard',
    name: 'Biologic DMARDs',
    base: {t1: 0, t2: 1, t3: 2, pa: 3, nc: 1}, // = 7
  },
  {
    id: 'cls-ics',
    name: 'Inhaled corticosteroids / LABA',
    base: {t1: 2, t2: 2, t3: 1, pa: 0, nc: 1}, // = 6
  },
  {
    id: 'cls-ssri',
    name: 'SSRIs & SNRIs',
    base: {t1: 6, t2: 2, t3: 0, pa: 0, nc: 0}, // = 8
  },
];

// The Q3 docket. "Add" motions move an agent out of the NC column, so every
// class's tracked-agent total is invariant across the session (footer row
// always sums to 46).
const MOTIONS: Motion[] = [
  {
    id: 'M-2026-038',
    // Stress fixture: longest title on the docket — exercises two-line
    // wrapping on the ~400px docket column and the recorder header.
    title:
      'Add tirzepatide (Zepbound) 2.5–15 mg pen to Tier 3 with prior authorization and BMI ≥ 30 documentation',
    classId: 'cls-glp1',
    from: 'nc',
    to: 'pa',
    requestedBy: 'Endocrinology service line',
    rationale:
      'SURMOUNT-4 sustained −25.3% mean body weight at 88 weeks. Budget impact is the docket’s largest; PA criteria mirror the semaglutide policy to prevent dual-agent overlap.',
    evidence: ['Monograph 18 pp', 'Budget impact $1.42M/yr', 'Forecast 640 members'],
    recused: [],
  },
  {
    id: 'M-2026-039',
    title: 'Move rosuvastatin 40 mg to Tier 1 at generic parity',
    classId: 'cls-statin',
    from: 't2',
    to: 't1',
    requestedBy: 'Pharmacy Benefits & Finance',
    rationale:
      'Generic price is now within 4% of atorvastatin; parity removes a step-down prior-notification burden on 2,118 current utilizers.',
    evidence: ['Cost delta −$0.11/day', 'Utilization 2,118 members'],
    recused: [],
  },
  {
    id: 'M-2026-040',
    title: 'Add edoxaban (Savaysa) to Tier 3 non-preferred',
    classId: 'cls-doac',
    from: 'nc',
    to: 't3',
    requestedBy: 'Anticoagulation stewardship',
    rationale:
      'Closes the renal-dosing gap for CrCl 15–50 mL/min where apixaban interactions preclude use; expected volume is under 40 members.',
    evidence: ['Monograph 11 pp', 'Forecast 38 members'],
    recused: [],
  },
  {
    id: 'M-2026-041',
    title: 'Require adalimumab-adaz step before ustekinumab in new starts',
    classId: 'cls-dmard',
    from: 't3',
    to: 'pa',
    requestedBy: 'Specialty pharmacy program',
    rationale:
      'The biosimilar step saves $31,800 per naive start, but rheumatology cites a 14-week median delay to effective therapy in the crossover cohort. Committee opinion is split.',
    evidence: ['Budget impact −$860K/yr', 'Crossover cohort n=212', 'Rheumatology dissent memo'],
    recused: [],
  },
  {
    id: 'M-2026-042',
    title: 'Move fluticasone/salmeterol DPI (Wixela) to Tier 1',
    classId: 'cls-ics',
    from: 't2',
    to: 't1',
    requestedBy: 'Population health — asthma registry',
    rationale:
      'Registry adherence rises 9 points when maintenance inhalers carry a $0 generic copay; device technique is interchangeable with the brand DPI.',
    evidence: ['Adherence +9.2 pts', 'Cost delta −$14.60/mo'],
    recused: [],
  },
  {
    id: 'M-2026-043',
    title: 'Move vilazodone (Viibryd) to Tier 3 non-preferred',
    classId: 'cls-ssri',
    from: 't2',
    to: 't3',
    requestedBy: 'Drug Information Service',
    rationale:
      'No comparative-efficacy advantage over six Tier 1 generics in the 2026 class review; 94% of new starts show no prior generic trial.',
    evidence: ['Class review 22 pp', 'New starts 117/qtr'],
    recused: [],
  },
  {
    id: 'M-2026-044',
    title: 'Add bexagliflozin (Brenzavvy) to Tier 2 preferred',
    classId: 'cls-sglt2',
    from: 'nc',
    to: 't2',
    requestedBy: 'Pharmacy Benefits & Finance',
    rationale:
      'Acquisition cost is 71% below the preferred SGLT2 pair. Dr. Ellison is recused: declared advisory-board honoraria from the manufacturer (Feb 2026 COI filing).',
    evidence: ['Cost delta −71%', 'Monograph 9 pp', 'COI filing on record'],
    recused: ['ellison'],
  },
];

// Pre-recorded ballots at session open (see @input cross-check: 13 For,
// 6 Against, 3 Abstain — 22 recorded across the docket).
const INITIAL_BALLOTS: Record<string, Record<string, Ballot>> = {
  'M-2026-038': {
    raghavan: 'for',
    osei: 'for',
    vasquez: 'against',
    chen: 'for',
    okafor: 'for',
    lindqvist: 'abstain',
  },
  'M-2026-039': {chen: 'for', njoroge: 'for'},
  'M-2026-040': {},
  'M-2026-041': {
    raghavan: 'against',
    osei: 'for',
    vasquez: 'against',
    weiss: 'against',
    lindqvist: 'for',
    ellison: 'abstain',
  },
  'M-2026-042': {},
  'M-2026-043': {weiss: 'for', okafor: 'abstain', njoroge: 'for'},
  'M-2026-044': {
    raghavan: 'for',
    chen: 'for',
    njoroge: 'for',
    vasquez: 'against',
    osei: 'against',
  },
};

interface MinuteEntry {
  clock: string;
  text: string;
  isNew?: boolean;
}

// Fixed pre-session minutes; appended entries advance a frozen counter.
const SEED_MINUTES: MinuteEntry[] = [
  {
    clock: '13:32',
    text: 'Session opened. 9 of 9 voting members present; quorum threshold set at 6 ballots.',
  },
  {
    clock: '13:38',
    text: 'Consent agenda ratified — M-2026-037, annual insulin biosimilar interchange list renewal.',
  },
  {
    clock: '13:44',
    text: 'Dr. Ellison’s conflict declaration on M-2026-044 read into the record; recusal accepted.',
  },
];

const MINUTE_START = 13 * 60 + 47; // 13:47 frozen session clock
const MINUTE_STEP = 3; // minutes advanced per recorded decision

function minuteClock(decisionIndex: number): string {
  const total = MINUTE_START + decisionIndex * MINUTE_STEP;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return \`\${hh}:\${mm}\`;
}

// ============= DERIVATION HELPERS =============

interface Tally {
  forCount: number;
  againstCount: number;
  abstainCount: number;
  recorded: number;
  eligible: number;
  quorumMet: boolean;
  carries: boolean;
}

function tallyOf(motion: Motion, ballots: Record<string, Ballot>): Tally {
  let forCount = 0;
  let againstCount = 0;
  let abstainCount = 0;
  for (const member of MEMBERS) {
    if (motion.recused.includes(member.id)) {
      continue;
    }
    const ballot = ballots[member.id];
    if (ballot === 'for') {
      forCount += 1;
    } else if (ballot === 'against') {
      againstCount += 1;
    } else if (ballot === 'abstain') {
      abstainCount += 1;
    }
  }
  const recorded = forCount + againstCount + abstainCount;
  const quorumMet = recorded >= QUORUM;
  return {
    forCount,
    againstCount,
    abstainCount,
    recorded,
    eligible: MEMBERS.length - motion.recused.length,
    quorumMet,
    // Carries on a simple majority of For over Against; abstentions fill
    // quorum but never move the majority needle.
    carries: quorumMet && forCount > againstCount,
  };
}

type Readiness = 'collecting' | 'passing' | 'failing';

function readinessOf(tally: Tally): Readiness {
  if (!tally.quorumMet) {
    return 'collecting';
  }
  return tally.carries ? 'passing' : 'failing';
}

function classOf(classId: string): TherapeuticClass {
  return CLASSES.find(cls => cls.id === classId) ?? CLASSES[0];
}

function motionOf(motionId: string): Motion {
  return MOTIONS.find(motion => motion.id === motionId) ?? MOTIONS[0];
}

function placementShort(id: PlacementId): string {
  return PLACEMENTS.find(placement => placement.id === id)?.label ?? id;
}

// ============= BRAND MARK =============
// Compendia: two offset "monograph pages" with a check — a tiny inline SVG
// whose strokes follow currentColor, so it themes with the accent pair.

function BrandMark() {
  return (
    <svg
      className="brandMark"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden
      style={{color: 'var(--pfr-accent)'}}>
      <rect
        x="6.5"
        y="3.5"
        width="14"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 7.5v12A3.5 3.5 0 0 0 8.5 23H18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.5 11.5l2.2 2.2 4-4.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============= SUBCOMPONENTS =============

function TallyBar({tally, isCompact}: {tally: Tally; isCompact?: boolean}) {
  const pct = (count: number) => (count / tally.eligible) * 100;
  return (
    <div
      className={\`tallyBar\${isCompact === true ? ' tallyCompact' : ''}\`}
      role="img"
      aria-label={\`Tally: \${tally.forCount} for, \${tally.againstCount} against, \${tally.abstainCount} abstaining, \${
        tally.eligible - tally.recorded
      } not yet recorded of \${tally.eligible} eligible\`}>
      <span className="tallySeg segFor" style={{width: \`\${pct(tally.forCount)}%\`}} />
      <span className="tallySeg segAgainst" style={{width: \`\${pct(tally.againstCount)}%\`}} />
      <span className="tallySeg segAbstain" style={{width: \`\${pct(tally.abstainCount)}%\`}} />
    </div>
  );
}

function QuorumMeter({tally}: {tally: Tally}) {
  const segments = [];
  for (let index = 0; index < QUORUM; index += 1) {
    segments.push(
      <span
        key={index}
        className={\`quorumSeg\${index < Math.min(tally.recorded, QUORUM) ? ' qFilled' : ''}\`}
      />,
    );
  }
  const overflow = Math.max(0, tally.recorded - QUORUM);
  return (
    <div className="quorumMeter">
      <div
        className="quorumTrack"
        role="img"
        aria-label={
          tally.quorumMet
            ? \`Quorum met: \${tally.recorded} ballots recorded, quorum is \${QUORUM}\`
            : \`\${tally.recorded} of \${QUORUM} ballots toward quorum\`
        }>
        {segments}
        {overflow > 0 && <span className="quorumSeg qOverflow" />}
      </div>
      <span className={\`quorumLabel\${tally.quorumMet ? ' qMet' : ''}\`}>
        {tally.quorumMet
          ? \`Quorum met — \${tally.recorded} of \${tally.eligible} eligible ballots recorded\`
          : \`\${tally.recorded} of \${QUORUM} ballots toward quorum (\${tally.eligible} eligible)\`}
      </span>
    </div>
  );
}

function StateChip({readiness, decision}: {readiness: Readiness; decision?: Decision}) {
  if (decision === 'ratified') {
    return <span className="stateChip stRatified">Ratified</span>;
  }
  if (decision === 'failed') {
    return <span className="stateChip stFailed">Failed</span>;
  }
  if (readiness === 'passing') {
    return <span className="stateChip stPassing">At quorum · passing</span>;
  }
  if (readiness === 'failing') {
    return <span className="stateChip stFailing">At quorum · failing</span>;
  }
  return <span className="stateChip stCollecting">Collecting ballots</span>;
}

// ============= PAGE =============

type DocketFilter = 'all' | 'open' | 'ready' | 'decided';

const DOCKET_FILTERS: Array<{id: DocketFilter; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'open', label: 'Open'},
  {id: 'ready', label: 'Ready to ratify'},
  {id: 'decided', label: 'Decided'},
];

export default function PharmacyFormularyReviewTemplate() {
  const toast = useToast();

  const [ballots, setBallots] =
    useState<Record<string, Record<string, Ballot>>>(INITIAL_BALLOTS);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [minutes, setMinutes] = useState<MinuteEntry[]>(SEED_MINUTES);
  const [selectedMotionId, setSelectedMotionId] = useState<string>(MOTIONS[0].id);
  const [docketFilter, setDocketFilter] = useState<DocketFilter>('all');
  const [announcement, setAnnouncement] = useState('');

  // ---- derived state (single source of truth: ballots + decisions) ----

  const tallies = useMemo(() => {
    const map: Record<string, Tally> = {};
    for (const motion of MOTIONS) {
      map[motion.id] = tallyOf(motion, ballots[motion.id] ?? {});
    }
    return map;
  }, [ballots]);

  const decidedCount = MOTIONS.filter(motion => decisions[motion.id] !== undefined).length;
  const ratifiedMotions = useMemo(
    () => MOTIONS.filter(motion => decisions[motion.id] === 'ratified'),
    [decisions],
  );

  // Live coverage matrix = base placements + deltas from ratified motions.
  const matrix = useMemo(() => {
    const cells: Record<string, Record<PlacementId, number>> = {};
    const changed: Record<string, Partial<Record<PlacementId, boolean>>> = {};
    for (const cls of CLASSES) {
      cells[cls.id] = {...cls.base};
      changed[cls.id] = {};
    }
    for (const motion of ratifiedMotions) {
      cells[motion.classId][motion.from] -= 1;
      cells[motion.classId][motion.to] += 1;
      changed[motion.classId][motion.from] = true;
      changed[motion.classId][motion.to] = true;
    }
    return {cells, changed};
  }, [ratifiedMotions]);

  const selectedMotion = motionOf(selectedMotionId);
  const selectedTally = tallies[selectedMotion.id];
  const selectedReadiness = readinessOf(selectedTally);
  const selectedDecision = decisions[selectedMotion.id];
  const selectedClass = classOf(selectedMotion.classId);
  const selectedBallots = ballots[selectedMotion.id] ?? {};

  const filterCounts: Record<DocketFilter, number> = {
    all: MOTIONS.length,
    open: MOTIONS.filter(motion => decisions[motion.id] === undefined).length,
    ready: MOTIONS.filter(
      motion =>
        decisions[motion.id] === undefined &&
        readinessOf(tallies[motion.id]) === 'passing',
    ).length,
    decided: decidedCount,
  };

  const docketMotions = MOTIONS.filter(motion => {
    if (docketFilter === 'open') {
      return decisions[motion.id] === undefined;
    }
    if (docketFilter === 'ready') {
      return (
        decisions[motion.id] === undefined &&
        readinessOf(tallies[motion.id]) === 'passing'
      );
    }
    if (docketFilter === 'decided') {
      return decisions[motion.id] !== undefined;
    }
    return true;
  });

  // ---- handlers ----

  const recordBallot = (memberId: string, ballot: Ballot) => {
    if (selectedDecision !== undefined) {
      return;
    }
    const member = MEMBERS.find(entry => entry.id === memberId);
    const current = selectedBallots[memberId];
    const next: Record<string, Ballot> = {...selectedBallots};
    let action: string;
    if (current === ballot) {
      delete next[memberId];
      action = \`ballot cleared for \${member?.name ?? memberId}\`;
    } else {
      next[memberId] = ballot;
      action = \`\${member?.name ?? memberId} recorded \${ballot}\`;
    }
    setBallots(prev => ({...prev, [selectedMotion.id]: next}));
    const tally = tallyOf(selectedMotion, next);
    const readiness = readinessOf(tally);
    setAnnouncement(
      \`\${selectedMotion.id}: \${action}. \${tally.forCount} for, \${tally.againstCount} against, \${tally.abstainCount} abstaining — \${
        readiness === 'collecting'
          ? \`\${tally.recorded} of \${QUORUM} toward quorum\`
          : readiness === 'passing'
            ? 'at quorum and passing'
            : 'at quorum and failing'
      }.\`,
    );
  };

  const decideMotion = (outcome: Decision) => {
    if (selectedDecision !== undefined) {
      return;
    }
    const tally = selectedTally;
    const clock = minuteClock(decidedCount);
    const voteLine = \`\${tally.forCount}–\${tally.againstCount}, \${tally.abstainCount} abstaining\`;
    const entry: MinuteEntry = {
      clock,
      text:
        outcome === 'ratified'
          ? \`\${selectedMotion.id} ratified \${voteLine}. \${selectedClass.name}: agent moves \${placementShort(selectedMotion.from)} → \${placementShort(selectedMotion.to)}.\`
          : \`\${selectedMotion.id} recorded as failed \${voteLine}. Coverage matrix unchanged.\`,
      isNew: true,
    };
    setDecisions(prev => ({...prev, [selectedMotion.id]: outcome}));
    setMinutes(prev => [...prev.map(item => ({...item, isNew: false})), entry]);
    toast({
      body:
        outcome === 'ratified'
          ? \`\${selectedMotion.id} ratified \${voteLine} — \${selectedClass.name} matrix updated\`
          : \`\${selectedMotion.id} failed \${voteLine} — recorded in minutes\`,
      isAutoHide: true,
    });
    setAnnouncement(
      outcome === 'ratified'
        ? \`\${selectedMotion.id} ratified. \${selectedClass.name} coverage moved from \${PLACEMENT_LABEL[selectedMotion.from]} to \${PLACEMENT_LABEL[selectedMotion.to]}.\`
        : \`\${selectedMotion.id} recorded as failed. Coverage matrix unchanged.\`,
    );
  };

  // ---- matrix + minutes rail ----

  const matrixPane = (
    <aside
      className="pane paneMatrix"
      aria-label="Therapeutic class coverage matrix and session minutes">
      <div className="paneSection">
        <h2 className="sectionLabel">Coverage matrix</h2>
        <div className="matrixScroll">
          <table className="matrix">
            <thead>
              <tr>
                <th className="clsHead" scope="col">
                  Class
                </th>
                {PLACEMENTS.map(placement => (
                  <th key={placement.id} scope="col" title={PLACEMENT_LABEL[placement.id]}>
                    {placement.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASSES.map(cls => {
                const isActive = cls.id === selectedMotion.classId;
                return (
                  <tr key={cls.id} className={isActive ? 'clsActive' : undefined}>
                    <th className="clsName" scope="row" title={cls.name}>
                      {cls.name}
                    </th>
                    {PLACEMENTS.map(placement => {
                      const count = matrix.cells[cls.id][placement.id];
                      const isChanged = matrix.changed[cls.id][placement.id] === true;
                      const isFrom =
                        isActive &&
                        selectedDecision === undefined &&
                        placement.id === selectedMotion.from;
                      const isTo =
                        isActive &&
                        selectedDecision === undefined &&
                        placement.id === selectedMotion.to;
                      const cellClass = [
                        'cell',
                        isFrom ? 'cellFrom' : '',
                        isTo ? 'cellTo' : '',
                        isChanged ? 'cellChanged' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');
                      return (
                        <td key={placement.id} className={cellClass}>
                          <span className="cellPill">{count}</span>
                          {(isFrom || isTo) && (
                            <span className="visuallyHidden">
                              {isFrom
                                ? 'moves out under the selected motion'
                                : 'gains under the selected motion'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">46 agents</th>
                {PLACEMENTS.map(placement => (
                  <td key={placement.id}>
                    {CLASSES.reduce(
                      (sum, cls) => sum + matrix.cells[cls.id][placement.id],
                      0,
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="matrixLegend">
          <b>T1</b> generic · <b>T2</b> preferred · <b>T3</b> non-preferred · <b>PA/ST</b>{' '}
          prior auth / step therapy · <b>NC</b> not covered. Dashed cell = moves out under
          the selected motion; solid outline = gains. Filled cells were changed by a
          ratification this session.
        </p>
      </div>
      <div className="paneSection">
        <h2 className="sectionLabel">Session minutes</h2>
        <ol className="minutes">
          {minutes.map((entry, index) => (
            <li
              key={\`\${entry.clock}-\${index}\`}
              className={\`minuteRow\${entry.isNew === true ? ' minuteNew' : ''}\`}>
              <span className="minuteClock">{entry.clock}</span>
              <span className="minuteText">{entry.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );

  // ---- motion docket ----

  const docketPane = (
    <section className="pane paneDocket" aria-label="Motion docket">
      <div className="docketHead">
        <Heading level={4} accessibilityLevel={2}>
          Q3 docket
        </Heading>
        <div className="filterRow" role="group" aria-label="Docket filters">
          {DOCKET_FILTERS.map(filter => (
            <button
              key={filter.id}
              type="button"
              className="filterChip"
              aria-pressed={docketFilter === filter.id}
              onClick={() => setDocketFilter(filter.id)}>
              {filter.label}
              <span aria-hidden>({filterCounts[filter.id]})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="docketBody">
        {docketMotions.length === 0 ? (
          <div className="docketEmpty">
            No motions match this filter yet. Record ballots in the vote recorder — motions
            land in “Ready to ratify” the moment they reach quorum with a passing majority.
          </div>
        ) : (
          docketMotions.map(motion => {
            const tally = tallies[motion.id];
            const readiness = readinessOf(tally);
            const decision = decisions[motion.id];
            const cls = classOf(motion.classId);
            const dots = [];
            for (let index = 0; index < QUORUM; index += 1) {
              dots.push(
                <span
                  key={index}
                  className={\`ballotDot\${
                    index < Math.min(tally.recorded, QUORUM) ? ' dotFilled' : ''
                  }\`}
                />,
              );
            }
            return (
              <button
                key={motion.id}
                type="button"
                className="motionCard"
                aria-pressed={motion.id === selectedMotionId}
                onClick={() => setSelectedMotionId(motion.id)}>
                <span className="motionTop">
                  <span className="motionId">{motion.id}</span>
                  <span className="spring" />
                  <StateChip readiness={readiness} decision={decision} />
                </span>
                <span className="motionTitle">{motion.title}</span>
                <span className="motionMetaRow">
                  <span>{cls.name}</span>
                  <span className="moveChip">
                    {placementShort(motion.from)}
                    <span aria-hidden>→</span>
                    <span className="moveTo">{placementShort(motion.to)}</span>
                    <span className="visuallyHidden">
                      — moves from {PLACEMENT_LABEL[motion.from]} to {PLACEMENT_LABEL[motion.to]}
                    </span>
                  </span>
                </span>
                <span className="evidenceRow">
                  {motion.evidence.map(item => (
                    <span key={item} className="evidenceChip">
                      <Icon icon={FileTextIcon} size="sm" color="inherit" />
                      {item}
                    </span>
                  ))}
                </span>
                <span className="motionFoot">
                  <TallyBar tally={tally} isCompact />
                  <span className="ballotDots" aria-hidden>
                    {dots}
                  </span>
                  <span className="ballotCount">
                    {tally.recorded}/{QUORUM}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );

  // ---- vote recorder ----

  const remainingToQuorum = QUORUM - selectedTally.recorded;

  const recorderPane = (
    <aside className="pane paneRecorder" aria-label="Vote recorder">
      <div className="paneSection recorderHead">
        <h2 className="sectionLabel">Vote recorder</h2>
        <div className="motionTop">
          <span className="motionId">{selectedMotion.id}</span>
          <span className="spring" />
          <StateChip readiness={selectedReadiness} decision={selectedDecision} />
        </div>
        <p className="recorderTitle">{selectedMotion.title}</p>
        <div className="motionMetaRow">
          <span>{selectedClass.name}</span>
          <span className="moveChip">
            {placementShort(selectedMotion.from)}
            <span aria-hidden>→</span>
            <span className="moveTo">{placementShort(selectedMotion.to)}</span>
          </span>
        </div>
        <p className="recorderRationale">
          <b>Requested by {selectedMotion.requestedBy}.</b> {selectedMotion.rationale}
        </p>
      </div>
      <div className="paneSection">
        <h3 className="sectionLabel">Tally</h3>
        <div className="tallyStack">
          <TallyBar tally={selectedTally} />
          <div className="tallyLegend">
            <span className="lgFor">{selectedTally.forCount} For</span>
            <span className="lgAgainst">{selectedTally.againstCount} Against</span>
            <span className="lgAbstain">{selectedTally.abstainCount} Abstain</span>
            <span>{selectedTally.eligible - selectedTally.recorded} unrecorded</span>
          </div>
          <QuorumMeter tally={selectedTally} />
        </div>
      </div>
      <div className="paneSection">
        <h3 className="sectionLabel">Roster — record ballots</h3>
        <ul className="roster">
          {MEMBERS.map(member => {
            const isRecused = selectedMotion.recused.includes(member.id);
            const ballot = isRecused ? undefined : selectedBallots[member.id];
            const locked = isRecused || selectedDecision !== undefined;
            return (
              <li key={member.id} className="rosterRow">
                <span className="memberAvatar" aria-hidden>
                  {member.initials}
                </span>
                <span className="memberMeta">
                  <span className="memberName">{member.name}</span>
                  {isRecused ? (
                    <span className="memberRecused">Recused — conflict declared</span>
                  ) : (
                    <span className="memberRole">{member.role}</span>
                  )}
                </span>
                <span className="ballotGroup" role="group" aria-label={\`Ballot for \${member.name}\`}>
                  <button
                    type="button"
                    className="ballotBtn bFor"
                    aria-pressed={ballot === 'for'}
                    aria-label={\`\${member.name}: vote for\`}
                    disabled={locked}
                    onClick={() => recordBallot(member.id, 'for')}>
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                  </button>
                  <button
                    type="button"
                    className="ballotBtn bAgainst"
                    aria-pressed={ballot === 'against'}
                    aria-label={\`\${member.name}: vote against\`}
                    disabled={locked}
                    onClick={() => recordBallot(member.id, 'against')}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                  <button
                    type="button"
                    className="ballotBtn bAbstain"
                    aria-pressed={ballot === 'abstain'}
                    aria-label={\`\${member.name}: abstain\`}
                    disabled={locked}
                    onClick={() => recordBallot(member.id, 'abstain')}>
                    <Icon icon={MinusIcon} size="sm" color="inherit" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="paneSection gate">
        <h3 className="sectionLabel">Decision</h3>
        {selectedDecision !== undefined ? (
          <div
            className={\`decidedBanner \${
              selectedDecision === 'ratified' ? 'dbRatified' : 'dbFailed'
            }\`}>
            <span className="decidedTitle">
              {selectedDecision === 'ratified' ? 'Motion ratified' : 'Motion failed'}
            </span>
            <span className="decidedMeta">
              {selectedTally.forCount}–{selectedTally.againstCount},{' '}
              {selectedTally.abstainCount} abstaining ·{' '}
              {selectedDecision === 'ratified'
                ? \`\${selectedClass.name}: \${placementShort(selectedMotion.from)} → \${placementShort(selectedMotion.to)} applied to the matrix\`
                : 'coverage matrix unchanged'}{' '}
              · entered in minutes
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="gateBtn gatePrimary"
              disabled={selectedReadiness !== 'passing'}
              onClick={() => decideMotion('ratified')}>
              <Icon icon={GavelIcon} size="sm" color="inherit" />
              Ratify motion
            </button>
            <button
              type="button"
              className="gateBtn gateDanger"
              disabled={!selectedTally.quorumMet}
              onClick={() => decideMotion('failed')}>
              <Icon icon={ShieldAlertIcon} size="sm" color="inherit" />
              Record as failed
            </button>
            <span className="gateHint">
              {selectedReadiness === 'collecting'
                ? \`Needs \${remainingToQuorum} more ballot\${remainingToQuorum === 1 ? '' : 's'} to reach quorum. Abstentions count toward quorum but not toward the majority.\`
                : selectedReadiness === 'passing'
                  ? 'Quorum met with a passing majority — ratifying moves the agent count in the coverage matrix and enters the result in the minutes.'
                  : 'Quorum met but the majority opposes. Record as failed, or keep collecting ballots.'}
            </span>
          </>
        )}
      </div>
    </aside>
  );

  // ---- frame ----

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="headerRow">
              <div className="brandLockup">
                <BrandMark />
                <div className="brandMeta">
                  <Heading level={5} accessibilityLevel={1} maxLines={1}>
                    Compendia · P&amp;T Committee
                  </Heading>
                  <Text type="supporting" size="sm" color="secondary" maxLines={1}>
                    Q3 formulary session — Jul 14, 2026
                  </Text>
                </div>
              </div>
              <span className="spring" />
              <div className="headerRight">
                <Badge
                  label={\`\${decidedCount} of \${MOTIONS.length} decided\`}
                  variant={decidedCount === MOTIONS.length ? 'success' : 'neutral'}
                />
                <span className="attendanceChip">
                  <Icon icon={ScaleIcon} size="sm" color="inherit" />9 present · quorum{' '}
                  {QUORUM}
                </span>
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="visuallyHidden">
              {announcement}
            </div>
            <div className="frame">
              {matrixPane}
              {docketPane}
              {recorderPane}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};