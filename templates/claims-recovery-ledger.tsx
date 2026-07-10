// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic Recoup fixtures only: 16 recovery cases (14 open,
 *   1 recovered, 1 written off) for a payment-integrity team, "as of" an
 *   internal frozen date of Jul 8, 2026 — day counts are fixed integers,
 *   never computed from a clock. Aging-bucket arithmetic, cross-checked by
 *   hand: 0–30d = 12,480.00 + 3,214.55 + 842.60 = $16,537.15 (3 cases);
 *   31–60d = 6,905.12 + 1,733.28 + 24,660.00 + 9,118.74 = $42,417.14 (4);
 *   61–90d = 148,230.19 + 42.10 + 4,377.90 = $152,650.19 (3);
 *   91–120d = 2,250.00 + 18,905.40 = $21,155.40 (2);
 *   120+d = 7,612.83 + 11,048.00 = $18,660.83 (2); gross open
 *   16,537.15 + 42,417.14 + 152,650.19 + 21,155.40 + 18,660.83
 *   = $251,420.71 ✓. Recovered QTD $5,120.75; written off $2,864.00.
 *   Stage census at load: 4 identified / 4 notified / 3 acknowledged /
 *   3 scheduled = 14 open ✓. Expected yield = Σ round(amount × stage
 *   probability) with probabilities .35/.55/.75/.92 — ≈ $180.3K at load,
 *   always derived live from the case set, never stored. Amounts are dual
 *   fields (integer cents for math; strings only at render). No clock
 *   reads, no randomness, no timers, no network assets.
 * @output Recoup — Claims Recovery Ledger: a full-width payment-integrity
 *   surface. Top, the aging waterfall band: five clickable aging-bucket
 *   columns (0–30 → 120+) whose bars stack per-stage segments filled with
 *   the brand indigo at opacity equal to the stage's recovery probability
 *   (35/55/75/92%), then a divider into terminal Recovered / Written-off
 *   pools; beneath it a four-tile stat strip (gross open, expected yield,
 *   recovered QTD, written off). Below, a sticky filter bar (stage chips,
 *   bucket-scope echo, oldest/largest sort) over a dense 44px-row ledger —
 *   case, payer + claim, reason code, aging chip, stage chip with
 *   probability, amount, expected yield — where every row expands into its
 *   evidence packet (36px document rows with attached/requested status)
 *   and the action footer. Signature interaction: advancing a case stage
 *   re-derives its expected-yield cell, the yield total, and its bucket
 *   bar's stage mix in one render; posting a recovery visibly moves the
 *   dollars out of the aging column into the Recovered pool and bumps
 *   recovered-QTD; a payer notice cannot be sent from an empty evidence
 *   packet (the $42.10 credit-balance case ships with zero documents to
 *   prove the refusal path).
 * @position Page template; emitted by `astryx template claims-recovery-ledger`
 *
 * Frame: a 100dvh root gives Layout height="fill" a definite height.
 *   LayoutHeader carries the Recoup mark, ledger title, and as-of chip.
 *   LayoutContent owns one scrolling column (the page scrolls; there are no
 *   side panels — a vertical analytic ledger, deliberately distinct from a
 *   rail/inspector triptych): waterfall band → stat strip → sticky filter
 *   bar → ledger. The band and stat strip scroll away; the filter bar
 *   sticks to the top of the scroll container above the rows.
 *
 * Responsive contract:
 * - Default desktop (the ~1045px inline demo stage, where viewport media
 *   queries never fire): the ledger grid is 28px chevron · 96px case ·
 *   flexible payer cell (~360px at stage width) · 64px reason · 96px aging
 *   · 132px stage · 110px amount · 110px yield — sized so every column
 *   fits at 1045px with no breakpoint. Wider windows widen the payer cell.
 * - <=860px: the reason-code column is subtracted (the code re-appears in
 *   the expanded packet note), and band columns tighten their gaps.
 * - <=640px (390px embed iframe): the stage and yield columns are
 *   subtracted too (the packet shows both), filter chips grow to 40px
 *   targets, stat tiles wrap 2-up, the as-of chip drops, and the waterfall
 *   band scrolls horizontally inside its own body rather than widening
 *   the page.
 *
 * Container policy (analytic-ledger archetype): a chart band, stat tiles,
 *   and dense expandable table rows. No cards for list content — the
 *   evidence packet expands inline under its row; the only card-like
 *   objects are the four stat tiles.
 *
 * Color policy: token-first chrome. ONE quarantined brand accent — Recoup
 *   indigo light-dark(#4338CA, #A5B4FC): #4338CA on #FFFFFF ≈ 7.9:1;
 *   #A5B4FC on ~#1C1C1E ≈ 8.5:1. State pairs with math: recovered green
 *   light-dark(#067647, #75E0A7) ≈ 5.6:1 / 9.6:1; aging-warning amber
 *   light-dark(#B54708, #FDB022) ≈ 5.4:1 / 9.2:1; aging-critical red
 *   light-dark(#B42318, #F97066) ≈ 6.6:1 / 6.1:1. Bar segments are the
 *   accent at opacity .35/.55/.75/.92 — graphics, not text, and each bar
 *   carries a solid-color value label above it. Tints at ≤0.16 alpha only
 *   ever back text set in the paired solid. NEVER the phantom bare
 *   color-text token; text uses --color-text-primary/secondary.
 *
 * Density grid (repeated verbatim in the CSS): 56px header · 120px bucket
 *   bars (plus value and label rows) · 64px stat tiles · 44px ledger rows ·
 *   36px evidence rows · 28px filter chips (40px under 640px) · 20px stage
 *   chips · 18px aging and doc-status chips · var(--spacing-3) section
 *   gutters · tabular-nums on every dollar, day count, and page count.
 *
 * Fixture policy: fixed data only. Case stages are the single state owner;
 *   bucket totals, bar stacks, stage censuses, expected yield (per row and
 *   total), recovered QTD, and written-off totals are all derived from the
 *   case array in render. Advancing, recovering, and writing off mutate one
 *   case record through one update path; a toast and a polite live region
 *   narrate each mutation. Closed-case dates are fixed strings ("Jun 30"),
 *   never computed.
 */

import {useMemo, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ArrowRightIcon,
  BanIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  FileTextIcon,
  MailIcon,
  PhoneIcon,
  ReceiptIcon,
} from 'lucide-react';

const SCOPE = 'tpl-claims-recovery-ledger';

// ============= BRAND + STATE COLORS =============
// THE quarantined Recoup brand accent (indigo). Contrast math:
// #4338CA on #FFFFFF ≈ 7.9:1; #A5B4FC on the dark surface (~#1C1C1E) ≈ 8.5:1.
const ACCENT = 'light-dark(#4338CA, #A5B4FC)';
// Wash behind accent text/selected chrome; text on a wash is always the
// solid ACCENT pair — ≤0.16-alpha washes shift backing luminance <6%.
const ACCENT_TINT =
  'light-dark(rgba(67, 56, 202, 0.08), rgba(165, 180, 252, 0.12))';
// Recovered (terminal success): #067647 on #FFFFFF ≈ 5.6:1;
// #75E0A7 on ~#1C1C1E ≈ 9.6:1.
const RECOVERED = 'light-dark(#067647, #75E0A7)';
const RECOVERED_TINT =
  'light-dark(rgba(6, 118, 71, 0.10), rgba(117, 224, 167, 0.14))';
// Aging warning (61–120 days): #B54708 on #FFFFFF ≈ 5.4:1;
// #FDB022 on ~#1C1C1E ≈ 9.2:1.
const WARN = 'light-dark(#B54708, #FDB022)';
const WARN_TINT =
  'light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.16))';
// Aging critical (120+ days) and write-off affordances:
// #B42318 on #FFFFFF ≈ 6.6:1; #F97066 on ~#1C1C1E ≈ 6.1:1.
const CRIT = 'light-dark(#B42318, #F97066)';
const CRIT_TINT =
  'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))';

// ============= TEMPLATE CSS =============
// Density grid (verbatim from the header): 56px header · 120px bucket bars
// (plus value and label rows) · 64px stat tiles · 44px ledger rows · 36px
// evidence rows · 28px filter chips (40px under 640px) · 20px stage chips ·
// 18px aging and doc-status chips · var(--spacing-3) gutters.

const TEMPLATE_CSS = `
.${SCOPE} {
  --crl-accent: ${ACCENT};
  --crl-accent-tint: ${ACCENT_TINT};
  --crl-recovered: ${RECOVERED};
  --crl-recovered-tint: ${RECOVERED_TINT};
  --crl-warn: ${WARN};
  --crl-warn-tint: ${WARN_TINT};
  --crl-crit: ${CRIT};
  --crl-crit-tint: ${CRIT_TINT};
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
}
.${SCOPE} *,
.${SCOPE} *::before,
.${SCOPE} *::after {
  box-sizing: border-box;
}
.${SCOPE} button {
  font-family: inherit;
}
.${SCOPE} button:focus-visible {
  outline: 2px solid var(--crl-accent);
  outline-offset: 2px;
}

/* ---- header ---- */
.${SCOPE} .headerRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  min-width: 0;
  width: 100%;
}
.${SCOPE} .brandLockup {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  min-width: 0;
}
.${SCOPE} .brandMeta {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.${SCOPE} .spring {
  flex: 1;
}
.${SCOPE} .asOfChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  white-space: nowrap;
}

/* ---- scroll column ---- */
.${SCOPE} .surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

/* ---- aging waterfall band: 120px bars, 148px incl. labels ---- */
.${SCOPE} .bandSection {
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
}
.${SCOPE} .bandScroll {
  overflow-x: auto;
}
.${SCOPE} .band {
  align-items: flex-end;
  display: flex;
  gap: var(--spacing-3);
  min-width: 560px;
}
.${SCOPE} .bucketCol {
  background: transparent;
  border: var(--border-width) solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 72px;
  padding: var(--spacing-1);
}
.${SCOPE} .bucketCol[aria-pressed="true"] {
  background: var(--crl-accent-tint);
  border-color: var(--crl-accent);
}
.${SCOPE} .bucketTotal {
  color: var(--color-text-primary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  text-align: center;
}
.${SCOPE} .bucketBar {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  height: 120px;
  justify-content: flex-end;
}
.${SCOPE} .bucketSeg {
  background: var(--crl-accent);
  min-height: 3px;
  transition: height 220ms ease, opacity 220ms ease;
}
.${SCOPE} .bucketSeg:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.${SCOPE} .bucketBar.bbEmpty {
  border-bottom: 2px dashed var(--color-border);
}
.${SCOPE} .bucketLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}
.${SCOPE} .bucketCol[aria-pressed="true"] .bucketLabel {
  color: var(--crl-accent);
  font-weight: 600;
}
.${SCOPE} .bandDivider {
  align-items: center;
  align-self: stretch;
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  padding-bottom: 22px;
}
.${SCOPE} .terminalCol {
  display: grid;
  flex: none;
  gap: 4px;
  min-width: 84px;
  padding: var(--spacing-1);
}
.${SCOPE} .terminalBar {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  height: 120px;
  justify-content: flex-end;
}
.${SCOPE} .terminalFill {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  min-height: 4px;
  transition: height 220ms ease;
}
.${SCOPE} .terminalFill.tRecovered {
  background: var(--crl-recovered);
}
.${SCOPE} .terminalFill.tWrittenOff {
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
}
.${SCOPE} .bucketTotal.tRecoveredText {
  color: var(--crl-recovered);
}
.${SCOPE} .bandLegend {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin: var(--spacing-2) 0 0;
}
.${SCOPE} .bandLegend b {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ---- stat strip: 64px tiles ---- */
.${SCOPE} .statStrip {
  border-bottom: var(--border-width) solid var(--color-border);
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: var(--spacing-2) var(--spacing-3);
}
.${SCOPE} .statTile {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: grid;
  gap: 2px;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-3);
}
.${SCOPE} .statLabel {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.${SCOPE} .statValue {
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.${SCOPE} .statValue.svAccent {
  color: var(--crl-accent);
}
.${SCOPE} .statValue.svRecovered {
  color: var(--crl-recovered);
}
.${SCOPE} .statHint {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}

/* ---- sticky filter bar: 28px chips ---- */
.${SCOPE} .filterBar {
  align-items: center;
  background: var(--color-background);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 3;
}
.${SCOPE} .filterChip {
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
.${SCOPE} .filterChip[aria-pressed="true"] {
  background: var(--crl-accent-tint);
  border-color: var(--crl-accent);
  color: var(--crl-accent);
  font-weight: 600;
}
.${SCOPE} .bucketEcho {
  align-items: center;
  background: var(--crl-accent-tint);
  border: var(--border-width) solid var(--crl-accent);
  border-radius: 999px;
  color: var(--crl-accent);
  cursor: pointer;
  display: inline-flex;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 5px;
  min-height: 28px;
  padding: 0 10px;
}
.${SCOPE} .sortGroup {
  display: inline-flex;
  gap: 4px;
  margin-left: auto;
}

/* ---- ledger: 44px rows ----
   Hand-rolled grid table: the <=860px / <=640px column subtraction below
   needs media queries that a DS Table's inline styles would defeat.
   Columns: 28 chevron · 96 case · flex payer · 64 reason · 96 aging ·
   132 stage · 110 amount · 110 yield. */
.${SCOPE} .ledgerHead,
.${SCOPE} .caseRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 28px 96px minmax(0, 1fr) 64px 96px 132px 110px 110px;
  padding: 0 var(--spacing-3);
}
.${SCOPE} .ledgerHead {
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.04em;
  min-height: 36px;
  text-transform: uppercase;
}
.${SCOPE} .caseRow {
  background: transparent;
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  color: inherit;
  cursor: pointer;
  min-height: 44px;
  text-align: left;
  width: 100%;
}
.${SCOPE} .caseRow[aria-expanded="true"] {
  background: var(--crl-accent-tint);
  border-bottom-color: transparent;
}
.${SCOPE} .caseRow.rowClosed .payerName,
.${SCOPE} .caseRow.rowClosed .caseId {
  color: var(--color-text-secondary);
}
.${SCOPE} .cellRight {
  text-align: right;
}
.${SCOPE} .chev {
  align-items: center;
  color: var(--color-text-secondary);
  display: inline-flex;
  justify-content: center;
}
.${SCOPE} .caseId {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  white-space: nowrap;
}
.${SCOPE} .payerCell {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.${SCOPE} .payerName {
  font-size: 12.5px;
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .payerSub {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .reasonChip {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 10.5px;
  font-weight: 650;
  height: 20px;
  justify-content: center;
  letter-spacing: 0.04em;
  padding: 0 6px;
  width: fit-content;
}
.${SCOPE} .agingCell {
  align-items: center;
  display: inline-flex;
  gap: 6px;
}
.${SCOPE} .agingDays {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .agingChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 10px;
  font-weight: 650;
  height: 18px;
  padding: 0 6px;
  white-space: nowrap;
}
.${SCOPE} .agingChip.agCalm {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${SCOPE} .agingChip.agWarn {
  background: var(--crl-warn-tint);
  color: var(--crl-warn);
}
.${SCOPE} .agingChip.agCrit {
  background: var(--crl-crit-tint);
  color: var(--crl-crit);
}
.${SCOPE} .stageChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  gap: 4px;
  height: 20px;
  padding: 0 8px;
  white-space: nowrap;
  width: fit-content;
}
.${SCOPE} .stageChip.sgIdentified {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${SCOPE} .stageChip.sgOpen {
  background: var(--crl-accent-tint);
  color: var(--crl-accent);
}
.${SCOPE} .stageChip.sgRecovered {
  background: var(--crl-recovered-tint);
  color: var(--crl-recovered);
}
.${SCOPE} .stageChip.sgWrittenOff {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  text-decoration: line-through;
}
.${SCOPE} .money {
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .money.mStrong {
  font-weight: 650;
}
.${SCOPE} .money.mYield {
  color: var(--crl-accent);
  font-weight: 600;
}
.${SCOPE} .money.mMuted {
  color: var(--color-text-secondary);
  text-decoration: line-through;
}
.${SCOPE} .money.mRecovered {
  color: var(--crl-recovered);
  font-weight: 650;
}

/* ---- expanded evidence packet: 36px doc rows ---- */
.${SCOPE} .packet {
  background: var(--crl-accent-tint);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: 0 var(--spacing-3) var(--spacing-3)
    calc(28px + var(--spacing-3) + var(--spacing-2));
}
.${SCOPE} .packetInner {
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: grid;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.${SCOPE} .packetLabel {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}
.${SCOPE} .docList {
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
}
.${SCOPE} .docRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 20px 84px minmax(0, 1fr) 56px 64px auto;
  min-height: 36px;
}
.${SCOPE} .docRow + .docRow {
  border-top: var(--border-width) solid var(--color-border);
}
.${SCOPE} .docIcon {
  align-items: center;
  color: var(--color-text-secondary);
  display: inline-flex;
}
.${SCOPE} .docId {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .docLabel {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .docPages,
.${SCOPE} .docAdded {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}
.${SCOPE} .docStatus {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 10px;
  font-weight: 650;
  height: 18px;
  padding: 0 6px;
}
.${SCOPE} .docStatus.dsAttached {
  background: var(--crl-recovered-tint);
  color: var(--crl-recovered);
}
.${SCOPE} .docStatus.dsRequested {
  background: var(--crl-warn-tint);
  color: var(--crl-warn);
}
.${SCOPE} .docEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  padding: var(--spacing-3);
  text-align: center;
}
.${SCOPE} .packetNote {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
.${SCOPE} .packetNote b {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${SCOPE} .packetFoot {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.${SCOPE} .advanceBtn {
  align-items: center;
  background: var(--crl-accent);
  border: 0;
  border-radius: 8px;
  /* On-accent text: #FFFFFF on #4338CA ≈ 7.9:1 (light); #1E1B4B on
     #A5B4FC ≈ 7.4:1 (dark) — white on #A5B4FC would fail at ~1.7:1. */
  color: light-dark(#FFFFFF, #1E1B4B);
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  font-weight: 650;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
}
.${SCOPE} .advanceBtn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.${SCOPE} .writeOffBtn {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--crl-crit);
  border-radius: 8px;
  color: var(--crl-crit);
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  font-weight: 650;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
}
.${SCOPE} .gateReason {
  color: var(--crl-warn);
  font-size: 11.5px;
  font-weight: 600;
}
.${SCOPE} .yieldEcho {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .closedBanner {
  border-radius: 8px;
  display: grid;
  gap: 2px;
  padding: var(--spacing-2) var(--spacing-3);
}
.${SCOPE} .closedBanner.cbRecovered {
  background: var(--crl-recovered-tint);
}
.${SCOPE} .closedBanner.cbWrittenOff {
  background: var(--color-background-muted);
}
.${SCOPE} .closedTitle {
  font-size: 12.5px;
  font-weight: 650;
}
.${SCOPE} .cbRecovered .closedTitle {
  color: var(--crl-recovered);
}
.${SCOPE} .closedMeta {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}
.${SCOPE} .ledgerEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.5;
  margin: var(--spacing-3);
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
}

.${SCOPE} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- <=860px: subtract the reason column ---- */
@media (max-width: 860px) {
  .${SCOPE} .ledgerHead,
  .${SCOPE} .caseRow {
    grid-template-columns: 28px 96px minmax(0, 1fr) 96px 132px 110px 110px;
  }
  .${SCOPE} .colReason {
    display: none;
  }
  .${SCOPE} .band {
    gap: var(--spacing-2);
  }
}

/* ---- <=640px (390px embed): subtract stage + yield; 40px targets ---- */
@media (max-width: 640px) {
  .${SCOPE} .ledgerHead,
  .${SCOPE} .caseRow {
    gap: var(--spacing-1);
    grid-template-columns: 24px 88px minmax(0, 1fr) 84px 96px;
  }
  .${SCOPE} .colYield,
  .${SCOPE} .colStage {
    display: none;
  }
  .${SCOPE} .statStrip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .${SCOPE} .filterChip,
  .${SCOPE} .bucketEcho {
    min-height: 40px;
  }
  .${SCOPE} .asOfChip {
    display: none;
  }
  .${SCOPE} .packet {
    padding-left: var(--spacing-3);
  }
  .${SCOPE} .docRow {
    grid-template-columns: 20px minmax(0, 1fr) 64px auto;
  }
  .${SCOPE} .docId,
  .${SCOPE} .docPages {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .bucketSeg,
  .${SCOPE} .terminalFill {
    transition: none;
  }
}
`;

// ============= DOMAIN MODEL =============

type Stage =
  | 'identified'
  | 'notified'
  | 'acknowledged'
  | 'scheduled'
  | 'recovered'
  | 'written_off';

type OpenStage = 'identified' | 'notified' | 'acknowledged' | 'scheduled';

type BucketId = 'b0' | 'b1' | 'b2' | 'b3' | 'b4';

type ReasonCode = 'DUP' | 'COB' | 'UNB' | 'FSV' | 'CRB' | 'MNA' | 'TFD';

type DocKind = 'eob' | 'worksheet' | 'letter' | 'remit' | 'call';

interface EvidenceDoc {
  id: string;
  kind: DocKind;
  label: string;
  pages: number;
  addedOn: string;
  status: 'attached' | 'requested';
}

interface RecoveryCase {
  id: string;
  payerId: string;
  claim: string;
  reason: ReasonCode;
  /** Dual field: integer cents for math; formatted only at render. */
  amountCents: number;
  /** Fixed day count as of the frozen Jul 8, 2026 "today". */
  daysOut: number;
  openedOn: string;
  stage: Stage;
  /** Fixed close date for terminal stages ('' while open). */
  closedOn: string;
  owner: string;
  note: string;
  evidence: EvidenceDoc[];
}

// Stage meta: recovery probability drives expected yield AND the bar-segment
// opacity in the waterfall band, so the two can never drift apart.
const STAGE_META: Record<
  Stage,
  {label: string; probability: number; action: string | null; next: Stage | null}
> = {
  identified: {
    label: 'Identified',
    probability: 0.35,
    action: 'Send payer notice',
    next: 'notified',
  },
  notified: {
    label: 'Notified',
    probability: 0.55,
    action: 'Record acknowledgement',
    next: 'acknowledged',
  },
  acknowledged: {
    label: 'Acknowledged',
    probability: 0.75,
    action: 'Schedule repayment',
    next: 'scheduled',
  },
  scheduled: {
    label: 'Scheduled',
    probability: 0.92,
    action: 'Post recovery',
    next: 'recovered',
  },
  recovered: {label: 'Recovered', probability: 1, action: null, next: null},
  written_off: {label: 'Written off', probability: 0, action: null, next: null},
};

const OPEN_STAGES: OpenStage[] = [
  'identified',
  'notified',
  'acknowledged',
  'scheduled',
];

const BUCKETS: Array<{id: BucketId; label: string; min: number; max: number | null}> = [
  {id: 'b0', label: '0–30d', min: 0, max: 30},
  {id: 'b1', label: '31–60d', min: 31, max: 60},
  {id: 'b2', label: '61–90d', min: 61, max: 90},
  {id: 'b3', label: '91–120d', min: 91, max: 120},
  {id: 'b4', label: '120+d', min: 121, max: null},
];

function bucketOf(daysOut: number): BucketId {
  if (daysOut <= 30) {
    return 'b0';
  }
  if (daysOut <= 60) {
    return 'b1';
  }
  if (daysOut <= 90) {
    return 'b2';
  }
  if (daysOut <= 120) {
    return 'b3';
  }
  return 'b4';
}

const REASON_LABEL: Record<ReasonCode, string> = {
  DUP: 'Duplicate payment',
  COB: 'COB — primary liability',
  UNB: 'Unbundled procedure codes',
  FSV: 'Fee schedule variance',
  CRB: 'Credit balance',
  MNA: 'Medical necessity audit',
  TFD: 'Timely filing dispute',
};

// Payers by identity so cross-references never drift. The Consolidated
// Mutual name is the long-label stress fixture for the flexible payer cell.
const PAYERS: Record<string, string> = {
  meridian: 'Meridian Health Plan',
  cascadia: 'Cascadia BlueShield',
  atlas: "Atlas Workers' Comp",
  pinnacle: 'Pinnacle Medicare Advantage',
  consolidated: 'Consolidated Mutual Health & Casualty of the Northern Plains',
};

const DOC_ICON: Record<DocKind, typeof FileTextIcon> = {
  eob: FileTextIcon,
  worksheet: CalculatorIcon,
  letter: MailIcon,
  remit: ReceiptIcon,
  call: PhoneIcon,
};

function doc(
  id: string,
  kind: DocKind,
  label: string,
  pages: number,
  addedOn: string,
  status: 'attached' | 'requested' = 'attached',
): EvidenceDoc {
  return {id, kind, label, pages, addedOn, status};
}

// 16 cases; bucket sums and stage census are hand-checked in the @input
// comment. daysOut values are frozen as of Jul 8, 2026; openedOn strings
// were derived from daysOut by hand (e.g. 142d before Jul 8 = Feb 16).
const INITIAL_CASES: RecoveryCase[] = [
  {
    id: 'RCP-2026-041',
    payerId: 'meridian',
    claim: 'CLM-88104-C',
    reason: 'DUP',
    amountCents: 1248000, // $12,480.00
    daysOut: 12,
    openedOn: 'Jun 26',
    stage: 'notified',
    closedOn: '',
    owner: 'J. Whitfield',
    note: 'Same-day duplicate of the professional claim; both remits cleared. Notice cites the second trace number.',
    evidence: [
      doc('DOC-5201', 'remit', 'Duplicate remittance pair (835)', 4, 'Jun 26'),
      doc('DOC-5202', 'worksheet', 'Overpayment worksheet', 2, 'Jun 27'),
      doc('DOC-5203', 'letter', 'Payer notice — first demand', 1, 'Jun 30'),
    ],
  },
  {
    id: 'RCP-2026-039',
    payerId: 'cascadia',
    claim: 'CLM-87911-A',
    reason: 'COB',
    amountCents: 321455, // $3,214.55
    daysOut: 19,
    openedOn: 'Jun 19',
    stage: 'identified',
    closedOn: '',
    owner: 'A. Romero',
    note: 'Commercial primary discovered after our payment; COB questionnaire back from the member is outstanding.',
    evidence: [
      doc('DOC-5188', 'eob', 'Primary carrier EOB', 3, 'Jun 19'),
      doc('DOC-5189', 'worksheet', 'COB questionnaire', 2, 'Jun 20', 'requested'),
    ],
  },
  {
    id: 'RCP-2026-036',
    payerId: 'meridian',
    claim: 'CLM-87740-B',
    reason: 'UNB',
    amountCents: 84260, // $842.60
    daysOut: 27,
    openedOn: 'Jun 11',
    stage: 'identified',
    closedOn: '',
    owner: 'K. Tran',
    note: 'Venipuncture billed separately from the E/M visit; NCCI edit supports rebundling.',
    evidence: [
      doc('DOC-5164', 'worksheet', 'Audit worksheet — NCCI edit 99213/36415', 2, 'Jun 11'),
      doc('DOC-5165', 'eob', 'Coding review memo', 1, 'Jun 12'),
    ],
  },
  {
    id: 'RCP-2026-034',
    payerId: 'atlas',
    claim: 'CLM-87652-D',
    reason: 'FSV',
    amountCents: 690512, // $6,905.12
    daysOut: 38,
    openedOn: 'May 31',
    stage: 'acknowledged',
    closedOn: '',
    owner: 'M. Adeyemi',
    note: 'Paid at the 2024 fee schedule after the 2026 update; adjuster acknowledged the variance on Jun 24.',
    evidence: [
      doc('DOC-5142', 'worksheet', 'Fee schedule extract — 2026 vs paid', 3, 'May 31'),
      doc('DOC-5143', 'letter', 'Acknowledgement letter', 1, 'Jun 24'),
      doc('DOC-5144', 'call', 'Adjuster call log', 1, 'Jun 24'),
    ],
  },
  {
    id: 'RCP-2026-031',
    payerId: 'cascadia',
    claim: 'CLM-87488-A',
    reason: 'CRB',
    amountCents: 173328, // $1,733.28
    daysOut: 44,
    openedOn: 'May 25',
    stage: 'notified',
    closedOn: '',
    owner: 'J. Whitfield',
    note: 'Patient and plan both paid the coinsurance; credit sits on the account pending payer instruction.',
    evidence: [
      doc('DOC-5120', 'worksheet', 'Credit balance report', 2, 'May 25'),
      doc('DOC-5121', 'letter', 'Payer notice — refund offer', 1, 'Jun 2'),
    ],
  },
  {
    id: 'RCP-2026-029',
    payerId: 'pinnacle',
    claim: 'CLM-87301-E',
    reason: 'DUP',
    amountCents: 2466000, // $24,660.00
    daysOut: 52,
    openedOn: 'May 17',
    stage: 'scheduled',
    closedOn: '',
    owner: 'A. Romero',
    note: 'Repayment agreement signed; recoupment posts against the Jul 15 remittance cycle.',
    evidence: [
      doc('DOC-5098', 'remit', 'Duplicate remittance pair (835)', 6, 'May 17'),
      doc('DOC-5099', 'letter', 'Repayment agreement — countersigned', 2, 'Jun 20'),
      doc('DOC-5100', 'remit', 'ERA preview — Jul 15 cycle', 1, 'Jul 1'),
    ],
  },
  {
    id: 'RCP-2026-027',
    payerId: 'consolidated',
    claim: 'CLM-87215-F',
    reason: 'COB',
    amountCents: 911874, // $9,118.74
    daysOut: 59,
    openedOn: 'May 10',
    stage: 'notified',
    closedOn: '',
    owner: 'K. Tran',
    note: 'Auto liability carrier is primary per the police report; payer’s COB unit has the demand under review.',
    evidence: [
      doc('DOC-5076', 'eob', 'Primary carrier EOB', 2, 'May 10'),
      doc('DOC-5077', 'letter', 'Payer notice — subrogation demand', 3, 'May 21'),
      doc('DOC-5078', 'call', 'COB unit call log', 1, 'Jun 18'),
    ],
  },
  {
    id: 'RCP-2026-024',
    payerId: 'pinnacle',
    claim: 'CLM-86987-E',
    reason: 'MNA',
    // Stress fixture: the largest balance in the ledger — dominates the
    // 61–90 bucket bar and exercises right-aligned tabular money cells.
    amountCents: 14823019, // $148,230.19
    daysOut: 66,
    openedOn: 'May 3',
    stage: 'acknowledged',
    closedOn: '',
    owner: 'M. Adeyemi',
    note: 'Inpatient stay reclassified to observation on audit; appeal window lapsed Jun 30 with no provider appeal.',
    evidence: [
      doc('DOC-5044', 'worksheet', 'Audit findings — DRG 291 → observation', 44, 'May 3'),
      doc('DOC-5045', 'eob', 'Medical records receipt', 1, 'May 9'),
      doc('DOC-5046', 'letter', 'Acknowledgement letter', 1, 'Jun 2'),
      doc('DOC-5047', 'letter', 'Appeal-window lapse memo', 1, 'Jul 1'),
    ],
  },
  {
    id: 'RCP-2026-022',
    payerId: 'meridian',
    claim: 'CLM-86854-C',
    reason: 'CRB',
    // Stress fixture: smallest balance AND zero evidence documents — the
    // empty-packet state and the notice-gate refusal both hang off this row.
    amountCents: 4210, // $42.10
    daysOut: 73,
    openedOn: 'Apr 26',
    stage: 'identified',
    closedOn: '',
    owner: 'K. Tran',
    note: 'Small-balance copay credit surfaced by the quarterly sweep; worksheet auto-generation is queued.',
    evidence: [],
  },
  {
    id: 'RCP-2026-019',
    payerId: 'atlas',
    claim: 'CLM-86620-D',
    reason: 'FSV',
    amountCents: 437790, // $4,377.90
    daysOut: 88,
    openedOn: 'Apr 11',
    stage: 'scheduled',
    closedOn: '',
    owner: 'J. Whitfield',
    note: 'Carrier agreed to reprice; check scheduled with the Jul 20 payment run.',
    evidence: [
      doc('DOC-4988', 'worksheet', 'Fee schedule extract', 2, 'Apr 11'),
      doc('DOC-4989', 'letter', 'Repayment agreement', 1, 'Jun 9'),
    ],
  },
  {
    id: 'RCP-2026-016',
    payerId: 'cascadia',
    claim: 'CLM-86412-A',
    reason: 'UNB',
    amountCents: 225000, // $2,250.00
    daysOut: 97,
    openedOn: 'Apr 2',
    stage: 'acknowledged',
    closedOn: '',
    owner: 'A. Romero',
    note: 'Therapy units billed individually across the same session; payer coding unit concurs with rebundling.',
    evidence: [
      doc('DOC-4952', 'eob', 'Coding review — 97110 units', 2, 'Apr 2'),
      doc('DOC-4953', 'letter', 'Acknowledgement letter', 1, 'May 14'),
    ],
  },
  {
    id: 'RCP-2026-014',
    payerId: 'pinnacle',
    claim: 'CLM-86200-E',
    reason: 'DUP',
    amountCents: 1890540, // $18,905.40
    daysOut: 104,
    openedOn: 'Mar 26',
    stage: 'notified',
    closedOn: '',
    owner: 'M. Adeyemi',
    note: 'First demand unanswered for 45 days; second notice drafted and queued for certified mail.',
    evidence: [
      doc('DOC-4901', 'remit', 'Duplicate remittance pair (835)', 5, 'Mar 26'),
      doc('DOC-4902', 'letter', 'Payer notice — first demand', 1, 'Apr 8'),
      doc('DOC-4903', 'letter', 'Second notice — certified', 1, 'Jul 2', 'requested'),
    ],
  },
  {
    id: 'RCP-2026-011',
    payerId: 'meridian',
    claim: 'CLM-85977-B',
    reason: 'COB',
    amountCents: 761283, // $7,612.83
    daysOut: 131,
    openedOn: 'Feb 27',
    stage: 'scheduled',
    closedOn: '',
    owner: 'J. Whitfield',
    note: 'Medicare primary confirmed; conditional payment recoupment scheduled against the Jul 22 cycle.',
    evidence: [
      doc('DOC-4844', 'eob', 'Primary carrier EOB', 2, 'Feb 27'),
      doc('DOC-4845', 'letter', 'Repayment agreement', 2, 'May 30'),
      doc('DOC-4846', 'call', 'COB unit call log', 1, 'Jun 12'),
    ],
  },
  {
    id: 'RCP-2026-008',
    payerId: 'atlas',
    claim: 'CLM-85714-D',
    reason: 'MNA',
    amountCents: 1104800, // $11,048.00
    daysOut: 142,
    openedOn: 'Feb 16',
    stage: 'identified',
    closedOn: '',
    owner: 'A. Romero',
    note: 'Oldest open balance on the ledger. Records request to the treating clinic is still outstanding — escalate before the 180-day contract bar.',
    evidence: [
      doc('DOC-4790', 'worksheet', 'Audit findings — utilization review', 12, 'Feb 16'),
      doc('DOC-4791', 'eob', 'Records request — treating clinic', 1, 'Feb 20', 'requested'),
    ],
  },
  {
    id: 'RCP-2026-005',
    payerId: 'cascadia',
    claim: 'CLM-85510-A',
    reason: 'CRB',
    amountCents: 512075, // $5,120.75
    daysOut: 159,
    openedOn: 'Jan 30',
    stage: 'recovered',
    closedOn: 'Jun 30',
    owner: 'A. Romero',
    note: 'Refund check 004417 cleared Jun 30; account credit zeroed.',
    evidence: [
      doc('DOC-4711', 'worksheet', 'Credit balance report', 2, 'Jan 30'),
      doc('DOC-4712', 'remit', 'Refund check 004417 — cleared', 1, 'Jun 30'),
    ],
  },
  {
    id: 'RCP-2026-003',
    payerId: 'consolidated',
    claim: 'CLM-85342-F',
    reason: 'TFD',
    amountCents: 286400, // $2,864.00
    daysOut: 149,
    openedOn: 'Feb 9',
    stage: 'written_off',
    closedOn: 'May 22',
    owner: 'K. Tran',
    note: 'Payer’s timely-filing denial upheld on second-level review; balance written off May 22 per policy FIN-114.',
    evidence: [
      doc('DOC-4730', 'letter', 'Denial upheld — second-level review', 2, 'May 20'),
    ],
  },
];

// ============= DERIVATION HELPERS =============

function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, '0');
  const grouped = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${grouped}.${remainder}`;
}

/** Compact label for band columns: K notation from $10,000 up. */
function formatMoneyShort(cents: number): string {
  if (cents >= 1000000) {
    const thousandsOfDollars = cents / 100000; // e.g. $152,650.19 → 152.65019
    return `$${(Math.round(thousandsOfDollars * 10) / 10).toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}K`;
  }
  const dollars = Math.round(cents / 100);
  return `$${String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function expectedYieldCents(recoveryCase: RecoveryCase): number {
  if (recoveryCase.stage === 'recovered' || recoveryCase.stage === 'written_off') {
    return 0;
  }
  return Math.round(
    recoveryCase.amountCents * STAGE_META[recoveryCase.stage].probability,
  );
}

function isOpen(recoveryCase: RecoveryCase): boolean {
  return (
    recoveryCase.stage !== 'recovered' && recoveryCase.stage !== 'written_off'
  );
}

function agingSeverity(daysOut: number): 'agCalm' | 'agWarn' | 'agCrit' {
  if (daysOut > 120) {
    return 'agCrit';
  }
  if (daysOut > 60) {
    return 'agWarn';
  }
  return 'agCalm';
}

function attachedDocCount(recoveryCase: RecoveryCase): number {
  return recoveryCase.evidence.filter(item => item.status === 'attached').length;
}

/**
 * The notice gate: a payer notice (identified → notified) cannot be sent
 * from an empty evidence packet. Returns the refusal reason, or null when
 * the advance is allowed.
 */
function advanceBlockReason(recoveryCase: RecoveryCase): string | null {
  if (
    recoveryCase.stage === 'identified' &&
    attachedDocCount(recoveryCase) === 0
  ) {
    return 'Notice blocked — attach at least one evidence document before demanding repayment.';
  }
  return null;
}

// ============= BRAND MARK =============
// Recoup: a return-arrow curling back into a ledger baseline — tiny inline
// SVG, strokes follow currentColor so it themes with the accent pair.

function BrandMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden
      style={{color: 'var(--crl-accent)', flex: 'none'}}>
      <path
        d="M21 11a8 8 0 1 0-2.3 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21 5.5V11h-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 22h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============= PAGE =============

type StageFilter = 'open' | OpenStage | 'closed';
type SortMode = 'oldest' | 'largest';

export default function ClaimsRecoveryLedgerTemplate() {
  const toast = useToast();

  const [cases, setCases] = useState<RecoveryCase[]>(INITIAL_CASES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>('open');
  const [bucketFilter, setBucketFilter] = useState<BucketId | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('oldest');
  const [announcement, setAnnouncement] = useState('');

  // ---- derived state (single source of truth: the cases array) ----

  const openCases = cases.filter(isOpen);
  const grossOpenCents = openCases.reduce((sum, item) => sum + item.amountCents, 0);
  const expectedYieldTotalCents = openCases.reduce(
    (sum, item) => sum + expectedYieldCents(item),
    0,
  );
  const recoveredCases = cases.filter(item => item.stage === 'recovered');
  const recoveredCents = recoveredCases.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  );
  const writtenOffCases = cases.filter(item => item.stage === 'written_off');
  const writtenOffCents = writtenOffCases.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  );

  // Per-bucket, per-stage cents for the waterfall band (open cases only).
  const bucketStacks = useMemo(() => {
    const stacks: Record<BucketId, Record<OpenStage, number>> = {
      b0: {identified: 0, notified: 0, acknowledged: 0, scheduled: 0},
      b1: {identified: 0, notified: 0, acknowledged: 0, scheduled: 0},
      b2: {identified: 0, notified: 0, acknowledged: 0, scheduled: 0},
      b3: {identified: 0, notified: 0, acknowledged: 0, scheduled: 0},
      b4: {identified: 0, notified: 0, acknowledged: 0, scheduled: 0},
    };
    for (const item of cases) {
      if (isOpen(item)) {
        stacks[bucketOf(item.daysOut)][item.stage as OpenStage] +=
          item.amountCents;
      }
    }
    return stacks;
  }, [cases]);

  const bucketTotals = useMemo(() => {
    const totals: Record<BucketId, number> = {b0: 0, b1: 0, b2: 0, b3: 0, b4: 0};
    for (const bucket of BUCKETS) {
      totals[bucket.id] = OPEN_STAGES.reduce(
        (sum, stage) => sum + bucketStacks[bucket.id][stage],
        0,
      );
    }
    return totals;
  }, [bucketStacks]);

  const bucketCounts = useMemo(() => {
    const counts: Record<BucketId, number> = {b0: 0, b1: 0, b2: 0, b3: 0, b4: 0};
    for (const item of cases) {
      if (isOpen(item)) {
        counts[bucketOf(item.daysOut)] += 1;
      }
    }
    return counts;
  }, [cases]);

  // Shared 120px height scale across bucket bars and terminal pools.
  const scaleMaxCents = Math.max(
    ...BUCKETS.map(bucket => bucketTotals[bucket.id]),
    recoveredCents,
    writtenOffCents,
    1,
  );
  const barPx = (cents: number) => Math.round((cents / scaleMaxCents) * 120);

  const stageCounts = useMemo(() => {
    const counts: Record<OpenStage, number> = {
      identified: 0,
      notified: 0,
      acknowledged: 0,
      scheduled: 0,
    };
    for (const item of cases) {
      if (isOpen(item)) {
        counts[item.stage as OpenStage] += 1;
      }
    }
    return counts;
  }, [cases]);

  const closedCount = cases.length - openCases.length;

  // ---- ledger row set: stage filter ∩ bucket scope, then sort ----

  const visibleCases = useMemo(() => {
    const filtered = cases.filter(item => {
      if (stageFilter === 'open' && !isOpen(item)) {
        return false;
      }
      if (stageFilter === 'closed' && isOpen(item)) {
        return false;
      }
      if (
        stageFilter !== 'open' &&
        stageFilter !== 'closed' &&
        item.stage !== stageFilter
      ) {
        return false;
      }
      if (bucketFilter !== null) {
        if (!isOpen(item)) {
          return false;
        }
        if (bucketOf(item.daysOut) !== bucketFilter) {
          return false;
        }
      }
      return true;
    });
    return [...filtered].sort((a, b) =>
      sortMode === 'oldest' ? b.daysOut - a.daysOut : b.amountCents - a.amountCents,
    );
  }, [cases, stageFilter, bucketFilter, sortMode]);

  // ---- handlers (one update path for every mutation) ----

  const mutateCase = (caseId: string, patch: Partial<RecoveryCase>) => {
    setCases(prev =>
      prev.map(item => (item.id === caseId ? {...item, ...patch} : item)),
    );
  };

  const advanceCase = (recoveryCase: RecoveryCase) => {
    const blocked = advanceBlockReason(recoveryCase);
    if (blocked !== null) {
      setAnnouncement(`${recoveryCase.id}: ${blocked}`);
      return;
    }
    const nextStage = STAGE_META[recoveryCase.stage].next;
    if (nextStage === null) {
      return;
    }
    const bucketId = bucketOf(recoveryCase.daysOut);
    const bucketLabel = BUCKETS.find(bucket => bucket.id === bucketId)?.label ?? '';
    if (nextStage === 'recovered') {
      mutateCase(recoveryCase.id, {stage: 'recovered', closedOn: 'Jul 8'});
      const newBucketCents = bucketTotals[bucketId] - recoveryCase.amountCents;
      toast({
        body: `${recoveryCase.id} recovered ${formatMoney(recoveryCase.amountCents)} — ${bucketLabel} bucket now ${formatMoney(newBucketCents)}`,
        isAutoHide: true,
      });
      setAnnouncement(
        `${recoveryCase.id} recovered ${formatMoney(recoveryCase.amountCents)}. Dollars moved from the ${bucketLabel} aging bucket to the recovered pool; recovered QTD is now ${formatMoney(recoveredCents + recoveryCase.amountCents)}.`,
      );
      return;
    }
    const oldYield = expectedYieldCents(recoveryCase);
    const newYield = Math.round(
      recoveryCase.amountCents * STAGE_META[nextStage].probability,
    );
    mutateCase(recoveryCase.id, {stage: nextStage});
    toast({
      body: `${recoveryCase.id} → ${STAGE_META[nextStage].label} — expected yield +${formatMoney(newYield - oldYield)}`,
      isAutoHide: true,
    });
    setAnnouncement(
      `${recoveryCase.id} advanced to ${STAGE_META[nextStage].label}. Expected yield rose ${formatMoney(newYield - oldYield)} to ${formatMoney(expectedYieldTotalCents - oldYield + newYield)} total.`,
    );
  };

  const writeOffCase = (recoveryCase: RecoveryCase) => {
    const bucketId = bucketOf(recoveryCase.daysOut);
    const bucketLabel = BUCKETS.find(bucket => bucket.id === bucketId)?.label ?? '';
    mutateCase(recoveryCase.id, {stage: 'written_off', closedOn: 'Jul 8'});
    toast({
      body: `${recoveryCase.id} written off ${formatMoney(recoveryCase.amountCents)} — removed from ${bucketLabel}`,
      isAutoHide: true,
    });
    setAnnouncement(
      `${recoveryCase.id} written off ${formatMoney(recoveryCase.amountCents)}. Dollars left the ${bucketLabel} aging bucket; written-off total is now ${formatMoney(writtenOffCents + recoveryCase.amountCents)}.`,
    );
  };

  const toggleBucket = (bucketId: BucketId) => {
    const next = bucketFilter === bucketId ? null : bucketId;
    setBucketFilter(next);
    const label = BUCKETS.find(bucket => bucket.id === bucketId)?.label ?? '';
    setAnnouncement(
      next === null
        ? 'Bucket scope cleared — showing all aging buckets.'
        : `Ledger scoped to the ${label} aging bucket (${bucketCounts[bucketId]} open cases, ${formatMoney(bucketTotals[bucketId])}).`,
    );
  };

  // ---- waterfall band ----

  const bandSection = (
    <section className="bandSection" aria-label="Aging waterfall">
      <div className="bandScroll">
        <div className="band">
          {BUCKETS.map(bucket => {
            const totalCents = bucketTotals[bucket.id];
            const count = bucketCounts[bucket.id];
            return (
              <button
                key={bucket.id}
                type="button"
                className="bucketCol"
                aria-pressed={bucketFilter === bucket.id}
                aria-label={`${bucket.label} aging bucket: ${formatMoney(totalCents)} across ${count} open case${count === 1 ? '' : 's'}. ${
                  bucketFilter === bucket.id
                    ? 'Selected — click to clear the bucket scope.'
                    : 'Click to scope the ledger to this bucket.'
                }`}
                onClick={() => toggleBucket(bucket.id)}>
                <span className="bucketTotal">{formatMoneyShort(totalCents)}</span>
                <span
                  className={`bucketBar${totalCents === 0 ? ' bbEmpty' : ''}`}
                  aria-hidden>
                  {/* Bottom-anchored column: the LAST DOM child sits at the
                      base, so iterating identified → scheduled puts the
                      most-certain stage at the base. Fill opacity = stage
                      recovery probability, so the bar literally solidifies
                      as its cases advance. */}
                  {OPEN_STAGES.filter(
                    stage => bucketStacks[bucket.id][stage] > 0,
                  ).map(stage => (
                    <span
                      key={stage}
                      className="bucketSeg"
                      style={{
                        height: barPx(bucketStacks[bucket.id][stage]),
                        opacity: STAGE_META[stage].probability,
                      }}
                    />
                  ))}
                </span>
                <span className="bucketLabel">
                  {bucket.label} · {count}
                </span>
              </button>
            );
          })}
          <span className="bandDivider" aria-hidden>
            <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
          </span>
          <div
            className="terminalCol"
            role="img"
            aria-label={`Recovered pool: ${formatMoney(recoveredCents)} across ${recoveredCases.length} case${recoveredCases.length === 1 ? '' : 's'}`}>
            <span className="bucketTotal tRecoveredText">
              {formatMoneyShort(recoveredCents)}
            </span>
            <span className="terminalBar" aria-hidden>
              <span
                className="terminalFill tRecovered"
                style={{height: barPx(recoveredCents)}}
              />
            </span>
            <span className="bucketLabel">Recovered · {recoveredCases.length}</span>
          </div>
          <div
            className="terminalCol"
            role="img"
            aria-label={`Written-off pool: ${formatMoney(writtenOffCents)} across ${writtenOffCases.length} case${writtenOffCases.length === 1 ? '' : 's'}`}>
            <span className="bucketTotal">{formatMoneyShort(writtenOffCents)}</span>
            <span className="terminalBar" aria-hidden>
              <span
                className="terminalFill tWrittenOff"
                style={{height: barPx(writtenOffCents)}}
              />
            </span>
            <span className="bucketLabel">Written off · {writtenOffCases.length}</span>
          </div>
        </div>
      </div>
      <p className="bandLegend">
        Bars are open dollars by aging bucket; <b>fill opacity = stage recovery
        probability</b> (Identified 35% · Notified 55% · Acknowledged 75% ·
        Scheduled 92%), so a bucket solidifies as its cases advance. Click a
        bucket to scope the ledger. Posting a recovery moves its dollars into
        the green pool on the right.
      </p>
    </section>
  );

  // ---- stat strip ----

  const statStrip = (
    <section className="statStrip" aria-label="Recovery totals">
      <div className="statTile">
        <span className="statLabel">Gross open</span>
        <span className="statValue">{formatMoney(grossOpenCents)}</span>
        <span className="statHint">{openCases.length} open cases</span>
      </div>
      <div className="statTile">
        <span className="statLabel">Expected yield</span>
        <span className="statValue svAccent">
          {formatMoney(expectedYieldTotalCents)}
        </span>
        <span className="statHint">probability-weighted, live</span>
      </div>
      <div className="statTile">
        <span className="statLabel">Recovered QTD</span>
        <span className="statValue svRecovered">{formatMoney(recoveredCents)}</span>
        <span className="statHint">
          {recoveredCases.length} case{recoveredCases.length === 1 ? '' : 's'} posted
        </span>
      </div>
      <div className="statTile">
        <span className="statLabel">Written off</span>
        <span className="statValue">{formatMoney(writtenOffCents)}</span>
        <span className="statHint">
          {writtenOffCases.length} case{writtenOffCases.length === 1 ? '' : 's'} per policy FIN-114
        </span>
      </div>
    </section>
  );

  // ---- filter bar ----

  const stageFilterChips: Array<{id: StageFilter; label: string; count: number}> = [
    {id: 'open', label: 'All open', count: openCases.length},
    ...OPEN_STAGES.map(stage => ({
      id: stage as StageFilter,
      label: STAGE_META[stage].label,
      count: stageCounts[stage],
    })),
    {id: 'closed', label: 'Closed', count: closedCount},
  ];

  const activeBucket =
    bucketFilter === null
      ? null
      : BUCKETS.find(bucket => bucket.id === bucketFilter) ?? null;

  const filterBar = (
    <div className="filterBar" role="group" aria-label="Ledger filters">
      {stageFilterChips.map(chip => (
        <button
          key={chip.id}
          type="button"
          className="filterChip"
          aria-pressed={stageFilter === chip.id}
          onClick={() => setStageFilter(chip.id)}>
          {chip.label}
          <span aria-hidden>({chip.count})</span>
        </button>
      ))}
      {activeBucket !== null && (
        <button
          type="button"
          className="bucketEcho"
          aria-label={`Clear the ${activeBucket.label} bucket scope`}
          onClick={() => toggleBucket(activeBucket.id)}>
          {activeBucket.label} bucket ×
        </button>
      )}
      <span className="sortGroup" role="group" aria-label="Sort order">
        <button
          type="button"
          className="filterChip"
          aria-pressed={sortMode === 'oldest'}
          onClick={() => setSortMode('oldest')}>
          Oldest first
        </button>
        <button
          type="button"
          className="filterChip"
          aria-pressed={sortMode === 'largest'}
          onClick={() => setSortMode('largest')}>
          Largest first
        </button>
      </span>
    </div>
  );

  // ---- ledger ----

  const ledgerHead = (
    <div className="ledgerHead" aria-hidden>
      <span />
      <span>Case</span>
      <span>Payer / claim</span>
      <span className="colReason">Reason</span>
      <span>Aging</span>
      <span className="colStage">Stage</span>
      <span className="cellRight">Amount</span>
      <span className="cellRight colYield">Exp. yield</span>
    </div>
  );

  const renderPacket = (recoveryCase: RecoveryCase) => {
    const meta = STAGE_META[recoveryCase.stage];
    const blocked = advanceBlockReason(recoveryCase);
    const yieldCents = expectedYieldCents(recoveryCase);
    return (
      <div className="packet">
        <div className="packetInner">
          <p className="packetLabel">
            Evidence packet · {recoveryCase.evidence.length} document
            {recoveryCase.evidence.length === 1 ? '' : 's'} ·{' '}
            {REASON_LABEL[recoveryCase.reason]} · {recoveryCase.owner}
          </p>
          {recoveryCase.evidence.length === 0 ? (
            <div className="docEmpty">
              No evidence attached yet. {recoveryCase.note}
            </div>
          ) : (
            <ul className="docList">
              {recoveryCase.evidence.map(item => (
                <li key={item.id} className="docRow">
                  <span className="docIcon">
                    <Icon icon={DOC_ICON[item.kind]} size="sm" color="inherit" />
                  </span>
                  <span className="docId">{item.id}</span>
                  <span className="docLabel">{item.label}</span>
                  <span className="docPages">
                    {item.pages} pp
                  </span>
                  <span className="docAdded">{item.addedOn}</span>
                  <span
                    className={`docStatus ${
                      item.status === 'attached' ? 'dsAttached' : 'dsRequested'
                    }`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {recoveryCase.evidence.length > 0 && (
            <p className="packetNote">
              <b>Working note.</b> {recoveryCase.note}
            </p>
          )}
          {isOpen(recoveryCase) ? (
            <div className="packetFoot">
              <button
                type="button"
                className="advanceBtn"
                disabled={blocked !== null}
                onClick={() => advanceCase(recoveryCase)}>
                <Icon
                  icon={
                    meta.next === 'recovered' ? CircleDollarSignIcon : ArrowRightIcon
                  }
                  size="sm"
                  color="inherit"
                />
                {meta.action}
              </button>
              <button
                type="button"
                className="writeOffBtn"
                onClick={() => writeOffCase(recoveryCase)}>
                <Icon icon={BanIcon} size="sm" color="inherit" />
                Write off
              </button>
              {blocked !== null ? (
                <span className="gateReason">{blocked}</span>
              ) : (
                <span className="yieldEcho">
                  {STAGE_META[recoveryCase.stage].label} ·{' '}
                  {Math.round(meta.probability * 100)}% × {formatMoney(recoveryCase.amountCents)}{' '}
                  = {formatMoney(yieldCents)} expected
                </span>
              )}
            </div>
          ) : (
            <div
              className={`closedBanner ${
                recoveryCase.stage === 'recovered' ? 'cbRecovered' : 'cbWrittenOff'
              }`}>
              <span className="closedTitle">
                {recoveryCase.stage === 'recovered'
                  ? `Recovered ${formatMoney(recoveryCase.amountCents)}`
                  : `Written off ${formatMoney(recoveryCase.amountCents)}`}
              </span>
              <span className="closedMeta">
                Closed {recoveryCase.closedOn} · opened {recoveryCase.openedOn} ·{' '}
                {recoveryCase.note}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRow = (recoveryCase: RecoveryCase) => {
    const isExpanded = expandedId === recoveryCase.id;
    const open = isOpen(recoveryCase);
    const meta = STAGE_META[recoveryCase.stage];
    const yieldCents = expectedYieldCents(recoveryCase);
    const payerName = PAYERS[recoveryCase.payerId];
    const stageClass =
      recoveryCase.stage === 'identified'
        ? 'sgIdentified'
        : recoveryCase.stage === 'recovered'
          ? 'sgRecovered'
          : recoveryCase.stage === 'written_off'
            ? 'sgWrittenOff'
            : 'sgOpen';
    return (
      <div key={recoveryCase.id}>
        <button
          type="button"
          className={`caseRow${open ? '' : ' rowClosed'}`}
          aria-expanded={isExpanded}
          aria-label={`${recoveryCase.id}, ${payerName}, ${REASON_LABEL[recoveryCase.reason]}, ${formatMoney(recoveryCase.amountCents)}, ${meta.label}${
            open ? `, ${recoveryCase.daysOut} days outstanding` : `, closed ${recoveryCase.closedOn}`
          }. ${isExpanded ? 'Collapse' : 'Expand'} evidence packet.`}
          onClick={() =>
            setExpandedId(current =>
              current === recoveryCase.id ? null : recoveryCase.id,
            )
          }>
          <span className="chev" aria-hidden>
            <Icon
              icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
              size="sm"
              color="inherit"
            />
          </span>
          <span className="caseId">{recoveryCase.id}</span>
          <span className="payerCell">
            <span className="payerName">{payerName}</span>
            <span className="payerSub">
              {recoveryCase.claim} · {recoveryCase.owner}
            </span>
          </span>
          <span className="colReason">
            <span className="reasonChip" title={REASON_LABEL[recoveryCase.reason]}>
              {recoveryCase.reason}
            </span>
          </span>
          <span className="agingCell">
            {open ? (
              <>
                <span className="agingDays">{recoveryCase.daysOut}d</span>
                <span className={`agingChip ${agingSeverity(recoveryCase.daysOut)}`}>
                  {BUCKETS.find(bucket => bucket.id === bucketOf(recoveryCase.daysOut))
                    ?.label ?? ''}
                </span>
              </>
            ) : (
              <span className="agingDays">— {recoveryCase.closedOn}</span>
            )}
          </span>
          <span className="colStage">
            <span className={`stageChip ${stageClass}`}>
              {meta.label}
              {open && <span aria-hidden>· {Math.round(meta.probability * 100)}%</span>}
            </span>
          </span>
          <span
            className={`money cellRight${
              recoveryCase.stage === 'written_off'
                ? ' mMuted'
                : recoveryCase.stage === 'recovered'
                  ? ' mRecovered'
                  : ' mStrong'
            }`}>
            {formatMoney(recoveryCase.amountCents)}
          </span>
          <span className="colYield cellRight">
            <span className={`money${open ? ' mYield' : ''}`}>
              {open ? formatMoney(yieldCents) : '—'}
            </span>
          </span>
        </button>
        {isExpanded && renderPacket(recoveryCase)}
      </div>
    );
  };

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
                    Recoup · Recovery Ledger
                  </Heading>
                  <Text type="supporting" size="sm" color="secondary" maxLines={1}>
                    Payment integrity — overpayments &amp; subrogation
                  </Text>
                </div>
              </div>
              <span className="spring" />
              <Badge
                label={`${openCases.length} open · ${formatMoneyShort(grossOpenCents)}`}
                variant="neutral"
              />
              <span className="asOfChip">As of Jul 8, 2026</span>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="visuallyHidden">
              {announcement}
            </div>
            <div className="surface">
              {bandSection}
              {statStrip}
              {filterBar}
              <section aria-label="Recovery ledger">
                {ledgerHead}
                {visibleCases.length === 0 ? (
                  <div className="ledgerEmpty">
                    No cases match the current scope. Clear the bucket chip or
                    pick a different stage — closed cases live under the
                    “Closed” filter and ignore bucket scopes.
                  </div>
                ) : (
                  visibleCases.map(renderRow)
                )}
              </section>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
