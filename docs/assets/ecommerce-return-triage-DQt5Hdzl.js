var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Retriage inbound-dock queue for
 *   Thu Jul 9, shift A: 18 return cases across four reason clusters
 *   (Fit & sizing 5, Damaged in transit 5, Not as described 4, Changed
 *   mind 4 — 5+5+4+4 = 18). Each case carries dual display/math prices
 *   (price string + priceCents), an inspection grade (A/B/C, or null while
 *   the parcel is still inbound), days-since-delivery, and a fraud-signal
 *   list whose weights SUM to the fraud score (derived in code, capped at
 *   100 — e.g. RMA-30351: empty-box 45 + short-weight 35 = 80). The
 *   session opens with two seed routings — RMA-30405 refunded ($72.00) and
 *   RMA-30393 denied (score 70, top signal "serial swap") — so at load:
 *   16 open, refunded $72.00, 1 denial, 1 fraud pattern flagged, and open
 *   column values are Fit $697.00 (129+78+249+96+145), Damaged $589.00
 *   (89+329+64+48+59), Not-as-described $361.00 (168+54+139), Changed
 *   mind $366.00 (45+289+32). No clock reads, no randomness, no timers,
 *   no network assets.
 * @output Retriage — Returns Triage: an inbound returns disposition desk.
 *   Main column: a disposition tally strip (refunded $, exchanges,
 *   denials, fraud patterns flagged with per-pattern chips) over a 2x2
 *   reason-cluster board — four lanes with live open counts and open-value
 *   rollups, each case a dense card with a fraud-score pill banded
 *   low/elevated/high. End panel (360px): the inspection detail for the
 *   selected case — item and customer blocks, a fraud-signal METER (SVG
 *   gauge with 0-30 / 30-60 / 60-100 threshold zones and a needle at the
 *   derived score) above the itemized signal rows, then the refund routing
 *   tray (Refund / Exchange / Deny, 44px), then the session log. Signature
 *   move: routing a case appends to the ONE ordered session log that
 *   everything derives from — the card leaves its lane, lane count and
 *   open-$ re-derive, the tally strip moves, a Deny at score >=60 flags
 *   its fraud pattern chip, and every log row carries a real Undo that
 *   puts the case back. Cases still inbound (no arrival scan) REFUSE
 *   routing with the reason spelled out in the tray.
 * @position Page template; emitted by \`astryx template ecommerce-return-triage\`
 *
 * Frame: a 100dvh root div (scope class tpl-ecommerce-return-triage) gives
 *   Layout height="fill" a definite height in auto-height hosts.
 *   LayoutHeader carries the Retriage mark, dock identity, and derived
 *   open/refunded chips. LayoutContent scrolls the main column (tally
 *   strip + cluster board); the inspection detail owns a fixed 360px end
 *   LayoutPanel with its own scroll.
 *
 * Responsive contract:
 * - Desktop stage (~1045px, no media query needed): main column ~660px;
 *   the board is a 2x2 grid so each lane gets ~320px — card meta rows
 *   ellipsize, never wrap the lane. The end panel keeps 360px. No
 *   min-width query upgrades the grid: viewport queries would fire off the
 *   1440px window while the stage container is ~1045px, so the 2x2 shape
 *   IS the desktop shape.
 * - <=760px (fires in the 390px embed iframe and narrow full-screen): the
 *   end panel unmounts; the board collapses to one column and the
 *   inspection detail + session log stack under it in the same scroll.
 *   Routing buttons stay 44px; the tally strip wraps 2x2.
 * - 390px: header sheds chip labels to bare figures; fraud-meter SVG
 *   scales via viewBox (width 100%), signal rows keep single-line
 *   truncation.
 *
 * Container policy (triage-desk archetype): lanes, dense case cards, and
 *   one workbench panel. Cards here are work objects with a selected
 *   state, not marketing widgets; every other region is rows and strips.
 *
 * Color policy: token chrome (--color-border, --color-text-*,
 *   --color-background-card/-muted/-body). ONE quarantined brand accent:
 *   Retriage turquoise light-dark(#0C7076, #4FD8CE) — #0C7076 on #FFFFFF
 *   ~5.8:1, #4FD8CE on ~#1C1C1E ~9.7:1 (math at declaration). Fraud bands
 *   and dispositions are light-dark pairs with math: band low = green,
 *   elevated = amber, high = red; refund = brand, exchange = violet,
 *   deny = red. Meter zone fills are graphic tints only; all meter text is
 *   token ink.
 *
 * Density grid (repeated verbatim in the CSS): tally strip cells 64px ·
 *   lane header 40px · case cards 92px min · card gap 8px · signal rows
 *   40px · routing buttons 44px · log rows 44px · end panel 360px · 12px
 *   gutters (var(--spacing-3)) · tabular-nums on every count, dollar,
 *   score, day, and weight figure.
 *
 * Fixture policy: fixed data only. The ordered session log is the single
 *   state owner; the routes map, lane membership, open counts, open-value
 *   rollups, tally strip, fraud-pattern chips, and the routing tray's
 *   routed/blocked states all derive from it live. Fraud scores are never
 *   stored — always the sum of signal weights (cap 100). Undo = removing
 *   a log entry; every consequence reverses because nothing else holds
 *   the value.
 */

import {useMemo, useState} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftRightIcon,
  BanIcon,
  PackageSearchIcon,
  TruckIcon,
  Undo2Icon,
  WalletIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Retriage brand accent (turquoise). #0C7076 on #FFFFFF
// ~5.8:1; #4FD8CE on the dark body (~#1C1C1E, L~0.012) ~9.7:1 — clears
// 4.5:1 for text and 3:1 for strokes in both schemes.
const BRAND_ACCENT = 'light-dark(#0C7076, #4FD8CE)';
// Ink ON a solid brand fill (header mark): #FFFFFF on #0C7076 ~5.8:1;
// #04302D on #4FD8CE ~9.9:1 (white on #4FD8CE fails at ~1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #04302D)';
// Brand tint wash (selected card ring fill, refund tray hover). Brand text
// over the wash: #0C7076 on rgba(12,112,118,.10)-over-white ~5.4:1;
// #4FD8CE on rgba(79,216,206,.14)-over-#1C1C1E ~8.2:1.
const BRAND_TINT =
  'light-dark(rgba(12, 112, 118, 0.10), rgba(79, 216, 206, 0.14))';

// Fraud band LOW (0-29, green). #15803D on #FFFFFF ~4.6:1; #4ADE80 on
// #1C1C1E ~10.2:1.
const LOW_COLOR = 'light-dark(#15803D, #4ADE80)';
const LOW_TINT = 'light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))';
// Fraud band ELEVATED (30-59, amber). #B45309 on #FFFFFF ~4.6:1; #FDB022
// on #1C1C1E ~9.4:1.
const ELEV_COLOR = 'light-dark(#B45309, #FDB022)';
const ELEV_TINT =
  'light-dark(rgba(180, 83, 9, 0.12), rgba(253, 176, 34, 0.14))';
// Fraud band HIGH (60-100, red) — also the Deny disposition. #B42318 on
// #FFFFFF ~6.3:1; #F97066 on #1C1C1E ~6.4:1.
const HIGH_COLOR = 'light-dark(#B42318, #F97066)';
const HIGH_TINT =
  'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))';
// Exchange disposition (violet). #6D28D9 on #FFFFFF ~6.9:1; #C4B5FD on
// #1C1C1E ~10.8:1.
const EXCH_COLOR = 'light-dark(#6D28D9, #C4B5FD)';
const EXCH_TINT =
  'light-dark(rgba(109, 40, 217, 0.10), rgba(196, 181, 253, 0.14))';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector scoped under .tpl-ecommerce-return-triage.
// Density grid (verbatim from the header): tally strip cells 64px · lane
// header 40px · case cards 92px min · card gap 8px · signal rows 40px ·
// routing buttons 44px · log rows 44px · end panel 360px · 12px gutters.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.tpl-ecommerce-return-triage {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-ecommerce-return-triage *,
.tpl-ecommerce-return-triage *::before,
.tpl-ecommerce-return-triage *::after {
  box-sizing: border-box;
}
.tpl-ecommerce-return-triage button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-ecommerce-return-triage button:disabled {
  cursor: default;
}
.tpl-ecommerce-return-triage button:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.tpl-ecommerce-return-triage .rt-num {
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce-return-triage .rt-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header ---- */
.tpl-ecommerce-return-triage .rt-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
  width: 100%;
}
.tpl-ecommerce-return-triage .rt-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
  flex: none;
}
.tpl-ecommerce-return-triage .rt-header-id {
  min-width: 0;
  flex: 1 1 auto;
}
.tpl-ecommerce-return-triage .rt-header-title {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-header-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-header-chips {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: none;
}
.tpl-ecommerce-return-triage .rt-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  font-size: 12px;
  white-space: nowrap;
}
.tpl-ecommerce-return-triage .rt-chip b {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce-return-triage .rt-chip-label {
  color: var(--color-text-secondary);
}
@media (max-width: 480px) {
  .tpl-ecommerce-return-triage .rt-chip-label {
    display: none;
  }
}

/* ---- main column ---- */
.tpl-ecommerce-return-triage .rt-scroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}
.tpl-ecommerce-return-triage .rt-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  min-width: 0;
}
.tpl-ecommerce-return-triage .rt-section-title {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ---- disposition tally strip (64px cells) ---- */
.tpl-ecommerce-return-triage .rt-tallies {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-2);
}
@media (max-width: 760px) {
  .tpl-ecommerce-return-triage .rt-tallies {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.tpl-ecommerce-return-triage .rt-tally {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 64px;
  padding: 8px 12px;
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-card);
  min-width: 0;
}
.tpl-ecommerce-return-triage .rt-tally-label {
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-tally-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.tpl-ecommerce-return-triage .rt-tally-value.d-refund { color: \${BRAND_ACCENT}; }
.tpl-ecommerce-return-triage .rt-tally-value.d-exchange { color: \${EXCH_COLOR}; }
.tpl-ecommerce-return-triage .rt-tally-value.d-deny { color: \${HIGH_COLOR}; }
.tpl-ecommerce-return-triage .rt-tally-sub {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-pattern-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tpl-ecommerce-return-triage .rt-pattern-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  color: \${HIGH_COLOR};
  background: \${HIGH_TINT};
}

/* ---- reason-cluster board: 2x2 lanes on desktop, 1-col <=760px ---- */
.tpl-ecommerce-return-triage .rt-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-3);
  align-items: start;
}
@media (max-width: 760px) {
  .tpl-ecommerce-return-triage .rt-board {
    grid-template-columns: minmax(0, 1fr);
  }
}
.tpl-ecommerce-return-triage .rt-lane {
  display: flex;
  flex-direction: column;
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-muted);
  padding: var(--spacing-2);
  gap: 8px;
  min-width: 0;
}
.tpl-ecommerce-return-triage .rt-lane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 40px;
  padding: 0 4px;
}
.tpl-ecommerce-return-triage .rt-lane-name {
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-lane-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-ecommerce-return-triage .rt-lane-empty {
  padding: var(--spacing-3);
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

/* Case card — 92px min, real button. */
.tpl-ecommerce-return-triage .rt-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 92px;
  padding: 10px 12px;
  border-radius: 10px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  min-width: 0;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.tpl-ecommerce-return-triage .rt-card[aria-pressed='true'] {
  border-color: \${BRAND_ACCENT};
  box-shadow: inset 0 0 0 1px \${BRAND_ACCENT};
  background: \${BRAND_TINT};
}
.tpl-ecommerce-return-triage .rt-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-card-rma {
  font-size: 11px;
  font-weight: 650;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.tpl-ecommerce-return-triage .rt-score-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  padding: 1px 7px;
  border-radius: 999px;
}
.tpl-ecommerce-return-triage .rt-score-pill.b-low { color: \${LOW_COLOR}; background: \${LOW_TINT}; }
.tpl-ecommerce-return-triage .rt-score-pill.b-elevated { color: \${ELEV_COLOR}; background: \${ELEV_TINT}; }
.tpl-ecommerce-return-triage .rt-score-pill.b-high { color: \${HIGH_COLOR}; background: \${HIGH_TINT}; }
.tpl-ecommerce-return-triage .rt-card-name {
  font-size: 12.5px;
  font-weight: 550;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
}
.tpl-ecommerce-return-triage .rt-grade {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
}
.tpl-ecommerce-return-triage .rt-grade.g-transit {
  color: \${ELEV_COLOR};
}

/* ---- inspection detail panel ---- */
.tpl-ecommerce-return-triage .rt-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tpl-ecommerce-return-triage .rt-panel-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--spacing-3) var(--spacing-3);
}
.tpl-ecommerce-return-triage .rt-panel-head {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tpl-ecommerce-return-triage .rt-panel-rma {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.tpl-ecommerce-return-triage .rt-panel-rma h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce-return-triage .rt-cluster-chip {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width, 1px) solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-ecommerce-return-triage .rt-panel-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-block {
  padding: var(--spacing-2) 0;
  border-top: var(--border-width, 1px) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-block-title {
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-item-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}
.tpl-ecommerce-return-triage .rt-kv-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-2) var(--spacing-3);
}
.tpl-ecommerce-return-triage .rt-kv-label {
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-kv-value {
  font-size: 12.5px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-note {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

/* Fraud meter + signal rows (40px). */
.tpl-ecommerce-return-triage .rt-meter-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tpl-ecommerce-return-triage .rt-meter-svg {
  width: 100%;
  height: auto;
  display: block;
}
.tpl-ecommerce-return-triage .rt-signal-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 40px;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-ecommerce-return-triage .rt-signal-row:last-child {
  border-bottom: none;
}
.tpl-ecommerce-return-triage .rt-signal-label {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-signal-weight {
  flex: none;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-signal-none {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: var(--spacing-2) 0;
}

/* Routing tray — 44px buttons; refuses while inbound. */
.tpl-ecommerce-return-triage .rt-tray {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-tray-row {
  display: flex;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-route-btn {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 10px;
  border-radius: 10px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  font-size: 12.5px;
  font-weight: 650;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-ecommerce-return-triage .rt-route-btn.d-refund { color: \${BRAND_ACCENT}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-exchange { color: \${EXCH_COLOR}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-deny { color: \${HIGH_COLOR}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-refund:not(:disabled):hover { background: \${BRAND_TINT}; border-color: \${BRAND_ACCENT}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-exchange:not(:disabled):hover { background: \${EXCH_TINT}; border-color: \${EXCH_COLOR}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-deny:not(:disabled):hover { background: \${HIGH_TINT}; border-color: \${HIGH_COLOR}; }
.tpl-ecommerce-return-triage .rt-route-btn:disabled {
  opacity: 0.45;
}
.tpl-ecommerce-return-triage .rt-tray-note {
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-tray-note.is-blocked {
  color: \${ELEV_COLOR};
  font-weight: 550;
}
.tpl-ecommerce-return-triage .rt-routed-stamp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 650;
}
.tpl-ecommerce-return-triage .rt-routed-stamp.d-refund { color: \${BRAND_ACCENT}; background: \${BRAND_TINT}; }
.tpl-ecommerce-return-triage .rt-routed-stamp.d-exchange { color: \${EXCH_COLOR}; background: \${EXCH_TINT}; }
.tpl-ecommerce-return-triage .rt-routed-stamp.d-deny { color: \${HIGH_COLOR}; background: \${HIGH_TINT}; }

/* Session log — 44px rows with per-row Undo. */
.tpl-ecommerce-return-triage .rt-log-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-ecommerce-return-triage .rt-log-row:last-child {
  border-bottom: none;
}
.tpl-ecommerce-return-triage .rt-log-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tpl-ecommerce-return-triage .rt-log-line {
  font-size: 12px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-log-line .d-refund { color: \${BRAND_ACCENT}; }
.tpl-ecommerce-return-triage .rt-log-line .d-exchange { color: \${EXCH_COLOR}; }
.tpl-ecommerce-return-triage .rt-log-line .d-deny { color: \${HIGH_COLOR}; }
.tpl-ecommerce-return-triage .rt-log-sub {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-undo-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width, 1px) solid var(--color-border);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-undo-btn:hover {
  background: var(--color-background-muted);
}
.tpl-ecommerce-return-triage .rt-log-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: var(--spacing-2) 0;
}

/* Reduced motion: collapse the only transitions (color-only). */
@media (prefers-reduced-motion: reduce) {
  .tpl-ecommerce-return-triage .rt-card,
  .tpl-ecommerce-return-triage .rt-route-btn {
    transition: none;
  }
}
\`;

// ---------------------------------------------------------------------------
// FIXTURES — 18 return cases across four reason clusters (5+5+4+4).
// ---------------------------------------------------------------------------

type ClusterKey = 'fit' | 'damaged' | 'nad' | 'mind';
type Disposition = 'refund' | 'exchange' | 'deny';
type Grade = 'A' | 'B' | 'C';

const CLUSTERS: Array<{id: ClusterKey; name: string; hint: string}> = [
  {id: 'fit', name: 'Fit & sizing', hint: 'size swaps, comfort returns'},
  {id: 'damaged', name: 'Damaged in transit', hint: 'carrier claims eligible'},
  {id: 'nad', name: 'Not as described', hint: 'listing accuracy review'},
  {id: 'mind', name: 'Changed mind', hint: 'standard 30-day window'},
];

/**
 * Fraud-signal catalog. A case's fraud score is ALWAYS derived as the sum
 * of its signal weights (capped at 100) — never stored. \`pattern\` names
 * the fraud pattern the signal evidences; a denied case at score >=60
 * flags the pattern of its heaviest signal.
 */
const SIGNAL_CATALOG = {
  velocity: {label: 'High return velocity (4+ in 90d)', weight: 25, pattern: 'Velocity abuse'},
  serial: {label: 'Serial number mismatch vs shipped unit', weight: 40, pattern: 'Serial swap'},
  wardrobe: {label: 'Wear indicators on inspection photos', weight: 20, pattern: 'Wardrobing'},
  window: {label: 'Filed on last eligible day of window', weight: 10, pattern: 'Window gaming'},
  priceDrop: {label: 'Repurchased same SKU at lower price', weight: 30, pattern: 'Price arbitrage'},
  address: {label: 'Return address differs from delivery', weight: 15, pattern: 'Address mismatch'},
  shortWeight: {label: 'Inbound parcel 38% under shipped weight', weight: 35, pattern: 'Short-ship weight'},
  emptyBox: {label: 'Prior empty-box claim on account', weight: 45, pattern: 'Empty box'},
} as const;

type SignalKey = keyof typeof SIGNAL_CATALOG;

interface ReturnCase {
  id: string;
  orderId: string;
  cluster: ClusterKey;
  customer: {name: string; lifetimeOrders: number; returns12mo: number};
  item: {sku: string; name: string; price: string; priceCents: number};
  /** Customer's requested resolution. */
  requested: 'refund' | 'exchange';
  /** Inspection grade after arrival scan; null while still inbound. */
  grade: Grade | null;
  daysSinceDelivery: number;
  photos: number;
  signals: SignalKey[];
  note: string;
}

function fraudScore(c: ReturnCase): number {
  const sum = c.signals.reduce((t, s) => t + SIGNAL_CATALOG[s].weight, 0);
  return Math.min(100, sum);
}

type Band = 'low' | 'elevated' | 'high';

function bandOf(score: number): Band {
  if (score >= 60) return 'high';
  if (score >= 30) return 'elevated';
  return 'low';
}

const BAND_LABEL: Record<Band, string> = {
  low: 'low',
  elevated: 'elevated',
  high: 'high',
};

/** Fraud pattern of a case = pattern of its heaviest signal (null if none). */
function patternOf(c: ReturnCase): string | null {
  if (c.signals.length === 0) return null;
  const heaviest = [...c.signals].sort(
    (a, b) => SIGNAL_CATALOG[b].weight - SIGNAL_CATALOG[a].weight,
  )[0];
  return SIGNAL_CATALOG[heaviest].pattern;
}

function dollars(cents: number): string {
  const whole = Math.floor(cents / 100);
  const frac = String(cents % 100).padStart(2, '0');
  return \`$\${whole.toLocaleString('en-US')}.\${frac}\`;
}

const RETURNS: ReturnCase[] = [
  // ---- Fit & sizing (5) — open value at load 129+78+249+96+145 = $697.00
  {
    id: 'RMA-30412',
    orderId: 'ORD-88213',
    cluster: 'fit',
    customer: {name: 'Dana Whitfield', lifetimeOrders: 24, returns12mo: 1},
    item: {sku: 'FW-2214-95', name: 'Meridian Trail Runner GTX Low, Basalt, W 9.5', price: '$129.00', priceCents: 12900},
    requested: 'exchange',
    grade: 'A',
    daysSinceDelivery: 6,
    photos: 2,
    signals: [],
    note: 'Runs a half size small per customer; wants W 10. Box and tags intact — clean exchange candidate.',
  },
  {
    id: 'RMA-30398',
    orderId: 'ORD-88102',
    cluster: 'fit',
    customer: {name: 'Miles Arceneaux', lifetimeOrders: 7, returns12mo: 2},
    item: {sku: 'AP-1108-MS', name: 'Halcyon Merino Base Layer Crew, Heather Slate, M', price: '$78.00', priceCents: 7800},
    requested: 'refund',
    grade: 'B',
    daysSinceDelivery: 12,
    photos: 1,
    signals: ['window'],
    note: 'Filed on day 30 of 30. Light pilling at cuff — grade B; resellable as open-box.',
  },
  {
    id: 'RMA-30371',
    orderId: 'ORD-87944',
    cluster: 'fit',
    customer: {name: 'Priya Raghunathan', lifetimeOrders: 41, returns12mo: 5},
    // Stress fixture: 70+ char item name exercises card/panel truncation.
    item: {sku: 'AP-3301-CL', name: 'Northgate Alpine Bib, Carbon, L — pro fit kit with suspenders and gusset', price: '$249.00', priceCents: 24900},
    requested: 'exchange',
    grade: 'A',
    daysSinceDelivery: 3,
    photos: 3,
    signals: ['velocity'],
    note: 'Fifth return this year but all size-related; account is high-LTV. Wants XL.',
  },
  {
    id: 'RMA-30355',
    orderId: 'ORD-87820',
    cluster: 'fit',
    customer: {name: 'Renata Solis', lifetimeOrders: 3, returns12mo: 2},
    item: {sku: 'AP-1740-TS', name: 'Coveline Wrap Dress, Terracotta, S', price: '$96.00', priceCents: 9600},
    requested: 'refund',
    grade: null,
    daysSinceDelivery: 9,
    photos: 0,
    signals: ['velocity', 'address'],
    note: 'Label created, parcel not yet scanned at dock. Return address differs from delivery address.',
  },
  {
    id: 'RMA-30340',
    orderId: 'ORD-87701',
    cluster: 'fit',
    customer: {name: 'Theo Brandt', lifetimeOrders: 12, returns12mo: 4},
    item: {sku: 'FW-4410-44', name: 'Ferro Cycling Shoe SPD, 44', price: '$145.00', priceCents: 14500},
    requested: 'refund',
    grade: 'C',
    daysSinceDelivery: 27,
    photos: 4,
    signals: ['wardrobe', 'window', 'velocity'],
    note: 'Cleat marks and sole wear across 27 days — inspection photos show sustained outdoor use.',
  },
  // ---- Damaged in transit (5) — open value at load 89+329+64+48+59 = $589.00
  {
    id: 'RMA-30410',
    orderId: 'ORD-88190',
    cluster: 'damaged',
    customer: {name: 'June Okonkwo', lifetimeOrders: 18, returns12mo: 0},
    item: {sku: 'HM-5521-JN', name: 'Lumen 4-qt Enameled Dutch Oven, Juniper', price: '$89.00', priceCents: 8900},
    requested: 'refund',
    grade: 'C',
    daysSinceDelivery: 4,
    photos: 4,
    signals: [],
    note: 'Chipped enamel on rim, carton crushed at corner. Carrier claim CL-99120 already opened.',
  },
  {
    id: 'RMA-30402',
    orderId: 'ORD-88144',
    cluster: 'damaged',
    customer: {name: 'Harlan Pruitt', lifetimeOrders: 5, returns12mo: 1},
    item: {sku: 'EL-7788-4K', name: 'Solace 27-inch 4K Monitor', price: '$329.00', priceCents: 32900},
    requested: 'refund',
    grade: 'C',
    daysSinceDelivery: 2,
    photos: 5,
    signals: ['shortWeight'],
    note: 'Panel cracked — but inbound parcel weighed 38% under shipped. Verify panel serial before crediting.',
  },
  {
    id: 'RMA-30389',
    orderId: 'ORD-88061',
    cluster: 'damaged',
    customer: {name: 'Sofia Marchetti', lifetimeOrders: 9, returns12mo: 1},
    item: {sku: 'HM-3302-BR', name: 'Aria Table Lamp, Brass', price: '$64.00', priceCents: 6400},
    requested: 'refund',
    grade: null,
    daysSinceDelivery: 5,
    photos: 2,
    signals: [],
    note: 'Customer photos show bent shade arm. Parcel inbound — carrier scan expected tomorrow.',
  },
  {
    id: 'RMA-30366',
    orderId: 'ORD-87890',
    cluster: 'damaged',
    customer: {name: 'Wes Tanaka', lifetimeOrders: 31, returns12mo: 2},
    item: {sku: 'HM-6114-GS', name: 'Cascade 12-pc Glassware Set', price: '$48.00', priceCents: 4800},
    requested: 'exchange',
    grade: 'C',
    daysSinceDelivery: 8,
    photos: 3,
    signals: [],
    note: 'Three tumblers shattered; rest intact. Customer wants a replacement set, not credit.',
  },
  {
    id: 'RMA-30351',
    orderId: 'ORD-87766',
    cluster: 'damaged',
    customer: {name: 'Gable Fontaine', lifetimeOrders: 4, returns12mo: 3},
    item: {sku: 'EL-2200-PB', name: 'Voltaic 20,000 mAh Power Bank', price: '$59.00', priceCents: 5900},
    requested: 'refund',
    grade: 'B',
    daysSinceDelivery: 15,
    photos: 1,
    signals: ['emptyBox', 'shortWeight'],
    note: '"Arrived dead" claim; unit received is a different production batch. Account has a prior empty-box claim.',
  },
  // ---- Not as described (4) — open value at load 168+54+139 = $361.00
  //      (RMA-30393 is seed-denied, so it is out of the lane at load)
  {
    id: 'RMA-30407',
    orderId: 'ORD-88171',
    cluster: 'nad',
    customer: {name: 'Imogen Vasquez', lifetimeOrders: 14, returns12mo: 1},
    item: {sku: 'BD-8812-QF', name: 'Juniper & Ash Linen Duvet, Queen, Fog', price: '$168.00', priceCents: 16800},
    requested: 'refund',
    grade: 'A',
    daysSinceDelivery: 7,
    photos: 2,
    signals: ['priceDrop'],
    note: '"Grayer than photos." Same SKU repurchased 40 minutes later at the markdown price.',
  },
  {
    id: 'RMA-30393',
    orderId: 'ORD-88077',
    cluster: 'nad',
    customer: {name: 'Corin Ashby', lifetimeOrders: 6, returns12mo: 4},
    item: {sku: 'EL-9903-WN', name: 'Backbeat Studio Headphones, Walnut', price: '$199.00', priceCents: 19900},
    requested: 'refund',
    grade: 'B',
    daysSinceDelivery: 10,
    photos: 3,
    signals: ['serial', 'priceDrop'],
    note: 'Returned unit serial does not match the shipped unit. Shipped serial still registers online weekly.',
  },
  {
    id: 'RMA-30377',
    orderId: 'ORD-87961',
    cluster: 'nad',
    customer: {name: 'Anselm Duarte', lifetimeOrders: 22, returns12mo: 1},
    item: {sku: 'HM-4419-PO', name: 'Tessera Ceramic Pour-Over Set', price: '$54.00', priceCents: 5400},
    requested: 'exchange',
    grade: 'A',
    daysSinceDelivery: 5,
    photos: 1,
    signals: [],
    note: 'Listing said 4-cup; carafe is 2-cup. Listing copy fix filed as CX-4471. Wants the larger set.',
  },
  {
    id: 'RMA-30348',
    orderId: 'ORD-87712',
    cluster: 'nad',
    customer: {name: 'Lena Korhonen', lifetimeOrders: 10, returns12mo: 3},
    item: {sku: 'BG-1177-35', name: 'Atlas Convertible Backpack 35L', price: '$139.00', priceCents: 13900},
    requested: 'refund',
    grade: 'B',
    daysSinceDelivery: 21,
    photos: 2,
    signals: ['wardrobe', 'window'],
    note: 'Airline tag residue on handle; "straps thinner than advertised." Filed on final eligible day.',
  },
  // ---- Changed mind (4) — open value at load 45+289+32 = $366.00
  //      (RMA-30405 is seed-refunded, so it is out of the lane at load)
  {
    id: 'RMA-30405',
    orderId: 'ORD-88160',
    cluster: 'mind',
    customer: {name: 'Ottilie Reyes', lifetimeOrders: 16, returns12mo: 1},
    item: {sku: 'HM-2216-OT', name: 'Fable & Fir Wool Throw, Oat', price: '$72.00', priceCents: 7200},
    requested: 'refund',
    grade: 'A',
    daysSinceDelivery: 3,
    photos: 0,
    signals: [],
    note: 'Unopened, gift duplicate. Straightforward restock.',
  },
  {
    id: 'RMA-30386',
    orderId: 'ORD-88019',
    cluster: 'mind',
    customer: {name: 'Booker Lindqvist', lifetimeOrders: 8, returns12mo: 0},
    item: {sku: 'HM-7730-CI', name: 'Kindling Cast Iron Skillet, 12-inch', price: '$45.00', priceCents: 4500},
    requested: 'refund',
    grade: 'A',
    daysSinceDelivery: 6,
    photos: 0,
    signals: [],
    note: 'Never seasoned, factory wax intact. First return on the account.',
  },
  {
    id: 'RMA-30362',
    orderId: 'ORD-87858',
    cluster: 'mind',
    customer: {name: 'Saskia Ferreira', lifetimeOrders: 2, returns12mo: 2},
    item: {sku: 'KA-8850-EG', name: 'Sundial Espresso Grinder', price: '$289.00', priceCents: 28900},
    requested: 'refund',
    grade: 'A',
    daysSinceDelivery: 1,
    photos: 1,
    signals: ['velocity', 'priceDrop'],
    note: 'Returned day after delivery; identical grinder ordered from the outlet listing at $214.',
  },
  {
    id: 'RMA-30337',
    orderId: 'ORD-87655',
    cluster: 'mind',
    customer: {name: 'Ezra Nakagawa', lifetimeOrders: 27, returns12mo: 2},
    item: {sku: 'OF-3340-XL', name: 'Prism Desk Mat XL, Charcoal', price: '$32.00', priceCents: 3200},
    requested: 'refund',
    grade: 'B',
    daysSinceDelivery: 18,
    photos: 0,
    signals: ['window'],
    note: 'Desk rearranged; mat no longer fits. Minor corner curl — grade B.',
  },
];

function caseOf(id: string): ReturnCase {
  return RETURNS.find(c => c.id === id) ?? RETURNS[0];
}

const DOCK_CLOCK = 'Thu Jul 9 · shift A · dock 3';
const INSPECTOR = 'M. Calloway';

// ---------------------------------------------------------------------------
// DISPOSITION META
// ---------------------------------------------------------------------------

const DISPOSITION_META: Record<
  Disposition,
  {label: string; pastLabel: string; className: string}
> = {
  refund: {label: 'Refund', pastLabel: 'Refunded', className: 'd-refund'},
  exchange: {label: 'Exchange', pastLabel: 'Exchanged', className: 'd-exchange'},
  deny: {label: 'Deny', pastLabel: 'Denied', className: 'd-deny'},
};

/** Retriage mark: a return arrow folding back into a box. */
function RetriageMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect
        x="2"
        y="7"
        width="14"
        height="9"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M13 4.5 H7.5 M7.5 4.5 L10 2 M7.5 4.5 L10 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FRAUD METER — SVG gauge with threshold zones (0-30 low / 30-60 elevated /
// 60-100 high) and a needle at the derived score. Scales via viewBox; all
// text is token ink (currentColor / explicit pairs), zone fills are tints.
// ---------------------------------------------------------------------------

interface FraudMeterProps {
  score: number;
  band: Band;
}

function FraudMeter({score, band}: FraudMeterProps) {
  // Track geometry: x 8..292 maps 0..100.
  const trackX = 8;
  const trackW = 284;
  const x = (v: number) => trackX + (trackW * v) / 100;
  const needleX = x(score);
  const bandColor =
    band === 'high' ? HIGH_COLOR : band === 'elevated' ? ELEV_COLOR : LOW_COLOR;
  return (
    <svg
      className="rt-meter-svg"
      viewBox="0 0 300 62"
      role="img"
      aria-label={\`Fraud signal meter: score \${score} of 100, \${BAND_LABEL[band]} band\`}>
      {/* zone tints */}
      <rect x={x(0)} y={24} width={x(30) - x(0)} height={14} rx={3} style={{fill: LOW_TINT}} />
      <rect x={x(30)} y={24} width={x(60) - x(30)} height={14} style={{fill: ELEV_TINT}} />
      <rect x={x(60)} y={24} width={x(100) - x(60)} height={14} rx={3} style={{fill: HIGH_TINT}} />
      {/* threshold ticks */}
      {[30, 60].map(t => (
        <line
          key={t}
          x1={x(t)}
          y1={22}
          x2={x(t)}
          y2={40}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
      ))}
      {/* score fill up to the needle, in the band color */}
      <rect
        x={x(0)}
        y={28}
        width={Math.max(0, needleX - x(0))}
        height={6}
        rx={3}
        style={{fill: bandColor}}
      />
      {/* needle */}
      <polygon
        points={\`\${needleX - 5},14 \${needleX + 5},14 \${needleX},23\`}
        style={{fill: bandColor}}
      />
      {/* score label rides the needle, clamped inside the track */}
      <text
        x={Math.min(Math.max(needleX, 22), 278)}
        y={10}
        textAnchor="middle"
        style={{
          fill: bandColor,
          fontSize: 12,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}>
        {score}
      </text>
      {/* zone captions */}
      <text x={x(0)} y={54} style={{fill: 'var(--color-text-secondary)', fontSize: 9}}>
        0 · low
      </text>
      <text x={x(30)} y={54} style={{fill: 'var(--color-text-secondary)', fontSize: 9}}>
        30 · elevated
      </text>
      <text x={x(60)} y={54} style={{fill: 'var(--color-text-secondary)', fontSize: 9}}>
        60 · high
      </text>
      <text
        x={x(100)}
        y={54}
        textAnchor="end"
        style={{fill: 'var(--color-text-secondary)', fontSize: 9}}>
        100
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface LogEntry {
  caseId: string;
  disposition: Disposition;
}

/**
 * Seed routings so the desk opens mid-shift: RMA-30405 refunded ($72.00)
 * and RMA-30393 denied (score 40+30 = 70 -> "Serial swap" pattern flag).
 */
const SEED_LOG: LogEntry[] = [
  {caseId: 'RMA-30405', disposition: 'refund'},
  {caseId: 'RMA-30393', disposition: 'deny'},
];

export default function EcommerceReturnTriageTemplate() {
  const toast = useToast();
  // Fires in the 390px embed iframe / narrow full-screen, never in the
  // ~1045px inline stage (viewport there is 1440px) — see the contract.
  const isCompact = useMediaQuery('(max-width: 760px)');

  // THE single state owner: an ordered session log. Everything else —
  // routes, lane membership, tallies, pattern flags — derives from it.
  const [log, setLog] = useState<LogEntry[]>(SEED_LOG);
  const [selectedId, setSelectedId] = useState<string>('RMA-30402');
  const [announcement, setAnnouncement] = useState('');

  // ---- derivations ----

  const routes = useMemo(() => {
    const map = new Map<string, Disposition>();
    for (const entry of log) {
      map.set(entry.caseId, entry.disposition);
    }
    return map;
  }, [log]);

  const openCases = RETURNS.filter(c => !routes.has(c.id));

  const refundedCents = log
    .filter(e => e.disposition === 'refund')
    .reduce((t, e) => t + caseOf(e.caseId).item.priceCents, 0);
  const exchangeCount = log.filter(e => e.disposition === 'exchange').length;
  const denyCount = log.filter(e => e.disposition === 'deny').length;

  /** Fraud patterns flagged = denied cases at score >=60, by pattern. */
  const flaggedPatterns = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of log) {
      if (entry.disposition !== 'deny') continue;
      const c = caseOf(entry.caseId);
      if (fraudScore(c) < 60) continue;
      const pattern = patternOf(c);
      if (pattern === null) continue;
      counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
    }
    return counts;
  }, [log]);
  const flaggedTotal = [...flaggedPatterns.values()].reduce((a, b) => a + b, 0);

  const selected = caseOf(selectedId);
  const selectedScore = fraudScore(selected);
  const selectedBand = bandOf(selectedScore);
  const selectedRoute = routes.get(selectedId) ?? null;
  const selectedInbound = selected.grade === null;

  const laneCases = (cluster: ClusterKey) =>
    openCases.filter(c => c.cluster === cluster);
  const laneValueCents = (cluster: ClusterKey) =>
    laneCases(cluster).reduce((t, c) => t + c.item.priceCents, 0);

  // ---- handlers ----

  /** The one mutation: append a routing to the session log. */
  const routeCase = (id: string, disposition: Disposition) => {
    const c = caseOf(id);
    if (c.grade === null || routes.has(id)) {
      return; // inbound cases and already-routed cases never reach here
    }
    const nextLog = [...log, {caseId: id, disposition}];
    setLog(nextLog);
    const score = fraudScore(c);
    const flagged = disposition === 'deny' && score >= 60;
    const pattern = flagged ? patternOf(c) : null;
    const amount =
      disposition === 'refund' ? \` \${dollars(c.item.priceCents)}\` : '';
    toast({
      body: \`\${c.id} → \${DISPOSITION_META[disposition].pastLabel}\${amount}\${
        pattern !== null ? \` · pattern flagged: \${pattern}\` : ''
      }\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`\${c.id} routed \${DISPOSITION_META[disposition].label}. \${
        RETURNS.length - nextLog.length
      } cases open.\${pattern !== null ? \` Fraud pattern \${pattern} flagged.\` : ''}\`,
    );
  };

  /** Undo = remove the entry; every derived surface reverses. */
  const undoRoute = (id: string) => {
    const c = caseOf(id);
    setLog(prev => prev.filter(e => e.caseId !== id));
    setSelectedId(id);
    toast({body: \`\${c.id} routing undone — back in triage\`, isAutoHide: true});
    setAnnouncement(\`\${c.id} routing undone. Case returned to its lane.\`);
  };

  // ---- tally strip ----

  const tallyStrip = (
    <section aria-label="Disposition tallies">
      <div className="rt-tallies">
        <div className="rt-tally">
          <span className="rt-tally-label">Refunded</span>
          <span className="rt-tally-value d-refund">
            {dollars(refundedCents)}
          </span>
          <span className="rt-tally-sub">
            {log.filter(e => e.disposition === 'refund').length} case
            {log.filter(e => e.disposition === 'refund').length === 1 ? '' : 's'}{' '}
            this session
          </span>
        </div>
        <div className="rt-tally">
          <span className="rt-tally-label">Exchanges</span>
          <span className="rt-tally-value d-exchange">{exchangeCount}</span>
          <span className="rt-tally-sub">replacement units queued</span>
        </div>
        <div className="rt-tally">
          <span className="rt-tally-label">Denied</span>
          <span className="rt-tally-value d-deny">{denyCount}</span>
          <span className="rt-tally-sub">
            {dollars(
              log
                .filter(e => e.disposition === 'deny')
                .reduce((t, e) => t + caseOf(e.caseId).item.priceCents, 0),
            )}{' '}
            loss avoided
          </span>
        </div>
        <div className="rt-tally">
          <span className="rt-tally-label">Fraud patterns flagged</span>
          <span className="rt-tally-value">{flaggedTotal}</span>
          {flaggedPatterns.size === 0 ? (
            <span className="rt-tally-sub">
              denials at score ≥60 flag here
            </span>
          ) : (
            <span className="rt-pattern-chips">
              {[...flaggedPatterns.entries()].map(([pattern, count]) => (
                <span key={pattern} className="rt-pattern-chip">
                  {pattern}
                  {count > 1 ? \` ×\${count}\` : ''}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </section>
  );

  // ---- cluster board ----

  const board = (
    <section aria-label="Reason-cluster triage board">
      <div className="rt-board">
        {CLUSTERS.map(cluster => {
          const cases = laneCases(cluster.id);
          return (
            <div className="rt-lane" key={cluster.id}>
              <div className="rt-lane-head">
                <span style={{minWidth: 0}}>
                  <span className="rt-lane-name">{cluster.name}</span>
                  <br />
                  <span className="rt-lane-meta">{cluster.hint}</span>
                </span>
                <span className="rt-lane-meta rt-num">
                  {cases.length} open · {dollars(laneValueCents(cluster.id))}
                </span>
              </div>
              {cases.length === 0 ? (
                <div className="rt-lane-empty">
                  Lane clear — every case routed. Undo from the session log
                  to reopen one.
                </div>
              ) : (
                cases.map(c => {
                  const score = fraudScore(c);
                  const band = bandOf(score);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="rt-card"
                      aria-pressed={c.id === selectedId}
                      aria-label={\`\${c.id}, \${c.item.name}, fraud score \${score}, \${
                        c.grade === null
                          ? 'inbound'
                          : \`grade \${c.grade}\`
                      }\`}
                      onClick={() => setSelectedId(c.id)}>
                      <span className="rt-card-top">
                        <span className="rt-card-rma">{c.id}</span>
                        <span className={\`rt-score-pill b-\${band}\`}>
                          {score}
                        </span>
                      </span>
                      <span className="rt-card-name">{c.item.name}</span>
                      <span className="rt-card-meta">
                        <span>{c.item.price}</span>
                        <span>·</span>
                        <span>{c.daysSinceDelivery}d since delivery</span>
                        <span>·</span>
                        {c.grade === null ? (
                          <span className="rt-grade g-transit">
                            <Icon icon={TruckIcon} size="xsm" color="inherit" />
                            inbound
                          </span>
                        ) : (
                          <span className="rt-grade">grade {c.grade}</span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  // ---- inspection detail ----

  const selectedCluster =
    CLUSTERS.find(c => c.id === selected.cluster) ?? CLUSTERS[0];

  const routingTray = (
    <div className="rt-tray" role="group" aria-label={\`Route \${selected.id}\`}>
      {selectedRoute !== null ? (
        <>
          <div
            className={\`rt-routed-stamp \${DISPOSITION_META[selectedRoute].className}\`}>
            <span>
              {DISPOSITION_META[selectedRoute].pastLabel}
              {selectedRoute === 'refund'
                ? \` \${dollars(selected.item.priceCents)}\`
                : ''}
            </span>
            <button
              type="button"
              className="rt-undo-btn"
              onClick={() => undoRoute(selected.id)}>
              <Icon icon={Undo2Icon} size="xsm" color="inherit" />
              Undo
            </button>
          </div>
          <div className="rt-tray-note">
            Undo returns {selected.id} to the {selectedCluster.name} lane and
            reverses every tally it moved.
          </div>
        </>
      ) : (
        <>
          <div className="rt-tray-row">
            <button
              type="button"
              className="rt-route-btn d-refund"
              disabled={selectedInbound}
              onClick={() => routeCase(selected.id, 'refund')}>
              <Icon icon={WalletIcon} size="sm" color="inherit" />
              Refund
            </button>
            <button
              type="button"
              className="rt-route-btn d-exchange"
              disabled={selectedInbound}
              onClick={() => routeCase(selected.id, 'exchange')}>
              <Icon icon={ArrowLeftRightIcon} size="sm" color="inherit" />
              Exchange
            </button>
            <button
              type="button"
              className="rt-route-btn d-deny"
              disabled={selectedInbound}
              onClick={() => routeCase(selected.id, 'deny')}>
              <Icon icon={BanIcon} size="sm" color="inherit" />
              Deny
            </button>
          </div>
          {selectedInbound ? (
            <div className="rt-tray-note is-blocked">
              Routing blocked — no arrival scan yet. Grade the unit at the
              dock before any disposition.
            </div>
          ) : (
            <div className="rt-tray-note">
              Refund credits {dollars(selected.item.priceCents)} to the
              original tender. Denying at score ≥60 flags the case&apos;s
              fraud pattern.
            </div>
          )}
        </>
      )}
    </div>
  );

  const sessionLog = (
    <div className="rt-block">
      <span className="rt-block-title">Session log</span>
      {log.length === 0 ? (
        <div className="rt-log-empty">
          No routings yet this session — dispositions land here with an
          undo.
        </div>
      ) : (
        [...log].reverse().map(entry => {
          const c = caseOf(entry.caseId);
          return (
            <div className="rt-log-row" key={entry.caseId}>
              <div className="rt-log-main">
                <span className="rt-log-line">
                  {c.id} →{' '}
                  <span className={DISPOSITION_META[entry.disposition].className}>
                    {DISPOSITION_META[entry.disposition].pastLabel}
                    {entry.disposition === 'refund'
                      ? \` \${dollars(c.item.priceCents)}\`
                      : ''}
                  </span>
                </span>
                <span className="rt-log-sub">{c.item.name}</span>
              </div>
              <button
                type="button"
                className="rt-undo-btn"
                aria-label={\`Undo routing for \${c.id}\`}
                onClick={() => undoRoute(entry.caseId)}>
                <Icon icon={Undo2Icon} size="xsm" color="inherit" />
                Undo
              </button>
            </div>
          );
        })
      )}
    </div>
  );

  const detail = (
    <div className="rt-panel">
      <div className="rt-panel-head">
        <div className="rt-panel-rma">
          <h2>{selected.id}</h2>
          <span className="rt-cluster-chip">{selectedCluster.name}</span>
        </div>
        <span className="rt-panel-sub">
          {selected.orderId} · requested{' '}
          {selected.requested === 'refund' ? 'refund' : 'exchange'} ·{' '}
          {selected.photos} photo{selected.photos === 1 ? '' : 's'} on file
        </span>
      </div>
      <div className="rt-panel-scroll">
        <div className="rt-block">
          <span className="rt-block-title">Item</span>
          <span className="rt-item-name">{selected.item.name}</span>
          <div className="rt-kv-grid">
            <div>
              <div className="rt-kv-label">SKU</div>
              <div className="rt-kv-value">{selected.item.sku}</div>
            </div>
            <div>
              <div className="rt-kv-label">Value</div>
              <div className="rt-kv-value">{selected.item.price}</div>
            </div>
            <div>
              <div className="rt-kv-label">Condition</div>
              <div className="rt-kv-value">
                {selected.grade === null
                  ? 'inbound'
                  : \`grade \${selected.grade}\`}
              </div>
            </div>
          </div>
          <p className="rt-note">{selected.note}</p>
        </div>
        <div className="rt-block">
          <span className="rt-block-title">Customer</span>
          <div className="rt-kv-grid">
            <div>
              <div className="rt-kv-label">Name</div>
              <div className="rt-kv-value">{selected.customer.name}</div>
            </div>
            <div>
              <div className="rt-kv-label">Lifetime orders</div>
              <div className="rt-kv-value">
                {selected.customer.lifetimeOrders}
              </div>
            </div>
            <div>
              <div className="rt-kv-label">Returns · 12 mo</div>
              <div className="rt-kv-value">{selected.customer.returns12mo}</div>
            </div>
          </div>
        </div>
        <div className="rt-block">
          <span className="rt-block-title">
            Fraud signals — score {selectedScore}/100
          </span>
          <div className="rt-meter-wrap">
            <FraudMeter score={selectedScore} band={selectedBand} />
          </div>
          {selected.signals.length === 0 ? (
            <div className="rt-signal-none">
              No fraud signals on this case — the meter reads 0.
            </div>
          ) : (
            selected.signals.map(key => (
              <div className="rt-signal-row" key={key}>
                <span className="rt-signal-label">
                  {SIGNAL_CATALOG[key].label}
                </span>
                <span className="rt-signal-weight">
                  +{SIGNAL_CATALOG[key].weight}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="rt-block">
          <span className="rt-block-title">Refund routing</span>
          {routingTray}
        </div>
        {sessionLog}
      </div>
    </div>
  );

  // ---- frame ----

  return (
    <div className="tpl-ecommerce-return-triage">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="rt-header">
              <span className="rt-mark" aria-hidden>
                <RetriageMark />
              </span>
              <div className="rt-header-id">
                <h1 className="rt-header-title">Retriage · Returns Triage</h1>
                <div className="rt-header-sub">
                  {DOCK_CLOCK} · inspector {INSPECTOR}
                </div>
              </div>
              <div className="rt-header-chips">
                <span className="rt-chip">
                  <Icon icon={PackageSearchIcon} size="xsm" color="secondary" />
                  <span className="rt-chip-label">Open</span>
                  <b>
                    {openCases.length}/{RETURNS.length}
                  </b>
                </span>
                <span className="rt-chip">
                  <span className="rt-chip-label">Refunded</span>
                  <b>{dollars(refundedCents)}</b>
                </span>
              </div>
            </div>
          </LayoutHeader>
        }
        end={
          !isCompact ? (
            <LayoutPanel
              hasDivider
              width={360}
              padding={0}
              label="Inspection detail">
              {detail}
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="rt-vh">
              {announcement}
            </div>
            <div className="rt-scroll">
              <div className="rt-main">
                {tallyStrip}
                {board}
                {isCompact && detail}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};