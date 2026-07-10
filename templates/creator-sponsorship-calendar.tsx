// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Adlane sponsorship desk for
 *   creator Mara Chen (@marabuilds) over a fixed July 2026 grid: 35 day
 *   cells, Sun 28 Jun (index 0) → Sat 1 Aug (index 34); Jul N maps to
 *   index N+2; suite "today" anchor Fri 10 Jul 2026 = index 12. Three
 *   accepted deals (D-198 Loamly $6,500 · D-201 TunnelPeak $18,000 ·
 *   D-204 Hexcode $12,000) and four pending offers (O-311 NordShield
 *   $22,000 · O-314 Brewline $4,200 · O-317 Stackfoundry $9,800 · O-319
 *   Kilnworks $3,000), every flight/exclusivity range stored as BOTH grid
 *   indices and display strings. No Date.now(), no Math.random(), no
 *   timers, no network assets.
 *   Checkpoint policy: signing 30% · delivery 50% · net-30 20%; per-deal
 *   splits verified by hand: D-198 1,950+3,250+1,300 = 6,500 ✓ · D-201
 *   5,400+9,000+3,600 = 18,000 ✓ · D-204 3,600+6,000+2,400 = 12,000 ✓ ·
 *   O-311 6,600+11,000+4,400 = 22,000 ✓ · O-314 1,260+2,100+840 =
 *   4,200 ✓ · O-317 2,940+4,900+1,960 = 9,800 ✓ · O-319 900+1,500+600 =
 *   3,000 ✓. Ledger stats derive live: booked = 6,500+18,000+12,000 =
 *   $36,500; collected (paid rows) = 1,950+5,400+3,600 = $10,950;
 *   outstanding = 36,500 − 10,950 = $25,550 ✓.
 * @output Creator Sponsorship Calendar — a creator-business surface: a
 *   July 2026 month grid where accepted campaigns render as lane-packed
 *   span bars (deliverable diamonds pinned to their day, continuation
 *   arrows past the grid edge, today ring on Jul 10), category-exclusivity
 *   CONFLICT BANDS hatch the exact overlap days whenever one accepted
 *   deal's flight intrudes on another's exclusivity window, and a rail
 *   with the offer inbox + payout checkpoint ledger. SIGNATURE: Accept an
 *   offer → its span bar lands on the calendar in the first free lane,
 *   the conflict engine re-runs per ordered pair (accepting NordShield
 *   hatches Jul 13–22 where its flight breaches TunnelPeak's window, plus
 *   the reciprocal Jul 6–17 band, and badges both bars), the payout
 *   ledger appends the offer's three checkpoint rows in date order, and
 *   the booked-revenue chip re-derives — one store, one commit. Decline
 *   files the offer as a struck row; toggling a deliverable done flips
 *   the deal's delivery checkpoint scheduled → invoiced when the last one
 *   lands.
 * @position Page template; emitted by `astryx template
 *   creator-sponsorship-calendar`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 52px (Adlane mark + creator identity | conflict chip
 *   (cascade-only) + booked-revenue chip + aria-live ticker + avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | calendar column (weekday header 28px > five 116px week rows in
 *       one vertical scroller > legend strip 32px)
 *     | rail 360px (offer inbox cards > selected-deal detail > payout
 *       ledger rows 40px > totals footer 44px), own scroll.
 * Container policy: app-shell archetype — the calendar is a hand-rolled
 *   grid of positioned divs (the DS has no month-span vocabulary), the
 *   rail is stacked panels; no Cards. Offer cards are bordered divs with
 *   real button actions.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   BRAND = light-dark(#C2186B, #F978C2) — hot pink. Contrast math:
 *   #C2186B on #FFFFFF = 5.8:1; #F978C2 on #1E1E1E = 6.7:1 — both clear
 *   4.5:1, legal as text and fill. Category colors are light-dark pairs
 *   used as bar left-accents and 10–16% soft fills behind PRIMARY-token
 *   text (never colored text on colored fill); checkpoint states pair
 *   color with shape (solid / hollow / dashed ring), and conflicts pair
 *   the danger hue with 45° hatch geometry + a triangle glyph.
 *
 * Density grid (FIXED, repeated verbatim in the CSS): header bar 52px;
 * weekday header 28px; week row 116px = 24px date row + 4 bar lanes ×
 * 22px + 4px pad; span bar 20px in a 22px lane; deliverable diamond 8px;
 * legend strip 32px; rail 360px (400px ≥1200, overlay <1000); rail head
 * 44px; deliverable rows 40px; ledger rows 40px; totals footer 44px;
 * single gutter
 * GUTTER = 12 (all padding/margins GUTTER or GUTTER/2 = 6); mono
 * metadata 12px; body 13px; section labels 11px uppercase tracking
 * 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(rootRef)
 * ResizeObserver (the inline demo stage is ~1045–1075px inside a 1440px
 * window, so viewport media queries would lie; width 0 = first
 * pre-observer frame, treated as the wide band):
 * - W >= 1200: rail 400px; bars show brand + value; ledger shows the
 *   deal column.
 * - 1000 <= W < 1200 (canonical demo band): rail 360px; bars show brand
 *   only (value lives in the rail); ledger drops the deal column into
 *   the row's second line.
 * - W < 1000: rail leaves the flex flow and becomes a 360px absolute
 *   overlay (right 0, shadow) opened by the header Offers button or any
 *   bar/offer selection; X closes and focus returns to the opener.
 * - W < 640 (the real 390px embed iframe): bars drop text for a brand
 *   initial, deliverable diamonds stay, weekday header shows one-letter
 *   days, overlay rail goes full-width. Subtraction, not squeeze.
 * Corner map: top-left Adlane mark + creator; top-right conflict chip +
 * booked chip + ticker + avatar; bottom-left calendar legend strip;
 * bottom-right rail totals footer (overlay closed: the legend owns the
 * whole bottom edge).
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  CheckIcon,
  InboxIcon,
  MailIcon,
  PlayIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark()
// pair with contrast math at the declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (hot pink). #C2186B on #FFFFFF = 5.8:1;
// #F978C2 on #1E1E1E = 6.7:1 — legal as text and fill on both schemes.
const BRAND = 'light-dark(#C2186B, #F978C2)';
const BRAND_SOFT = 'light-dark(rgba(194, 24, 107, 0.08), rgba(249, 120, 194, 0.14))';

// Conflict danger: #DC2626 on white = 4.5:1; #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.16))';
// Conflict hatch stripe — geometry carries the meaning, color reinforces.
const HATCH_DANGER = 'light-dark(rgba(220, 38, 38, 0.20), rgba(248, 113, 113, 0.24))';
// Paid green: #0B7A2C on white = 5.3:1; #4ADE80 on #1E1E1E = 9.1:1.
const OK_GREEN = 'light-dark(#0B7A2C, #4ADE80)';
// Invoiced amber: #A16207 on white = 5.0:1; #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'light-dark(#A16207, #FBBF24)';

// Category accents — bar left-edge solids (≥3:1 as graphics on both
// surfaces) and 10–16% soft fills; bar TEXT is always the primary token.
// vpn #0B69D4 white 4.9:1 / #4C9EFF dark 6.9:1 · devtools #7C3AED white
// 5.3:1 / #A78BFA dark 6.0:1 · coffee #B45309 white 4.6:1 / #FBBF24 dark
// 9.9:1 · d2c #0B7A2C white 5.3:1 / #4ADE80 dark 9.1:1.
type Category = 'vpn' | 'devtools' | 'coffee' | 'd2c';

const CATEGORY_META: Record<Category, {label: string; color: string; soft: string}> = {
  vpn: {label: 'VPN', color: 'light-dark(#0B69D4, #4C9EFF)', soft: 'light-dark(rgba(11, 105, 212, 0.10), rgba(76, 158, 255, 0.16))'},
  devtools: {label: 'Dev tools', color: 'light-dark(#7C3AED, #A78BFA)', soft: 'light-dark(rgba(124, 58, 237, 0.10), rgba(167, 139, 250, 0.16))'},
  coffee: {label: 'Coffee', color: 'light-dark(#B45309, #FBBF24)', soft: 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))'},
  d2c: {label: 'D2C', color: 'light-dark(#0B7A2C, #4ADE80)', soft: 'light-dark(rgba(11, 122, 44, 0.10), rgba(74, 222, 128, 0.16))'},
};

const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';
const SCOPE = 'tpl-creator-sponsorship-calendar';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all page CSS; every selector prefixed with the scope
// class. Transitions animate color/opacity only; the bar-landing fade
// collapses under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${SCOPE}.csc-root { height: 100dvh; width: 100%; }
.${SCOPE} button { font-family: inherit; }
.${SCOPE} .csc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.${SCOPE} .csc-fade { transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease; }
@keyframes csc-land {
  from { opacity: 0; }
  to { opacity: 1; }
}
.${SCOPE} .csc-land { animation: csc-land 260ms ease; }
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .csc-fade { transition: none; }
  .${SCOPE} .csc-land { animation: none; }
}

/* Header bar 52px ---------------------------------------------------------*/
.${SCOPE} .csc-header {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 52px;
  padding: 0 ${GUTTER}px;
}
.${SCOPE} .csc-mono {
  font-family: ${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .csc-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .csc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${BRAND};
  background: ${BRAND_SOFT};
  color: ${BRAND};
  white-space: nowrap;
}
.${SCOPE} .csc-chip.is-conflict {
  border-color: ${DANGER};
  background: ${DANGER_SOFT};
  color: ${DANGER};
}
.${SCOPE} .csc-ticker {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* View + calendar column --------------------------------------------------*/
.${SCOPE} .csc-view {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.${SCOPE} .csc-cal-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.${SCOPE} .csc-weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 28px;
  align-items: center;
  padding: 0 ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${SCOPE} .csc-weekday {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}
.${SCOPE} .csc-cal-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 ${GUTTER}px; }

/* Week rows 116px = 24px date row + 4 lanes x 22px + 4px pad --------------*/
.${SCOPE} .csc-week {
  position: relative;
  height: 116px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .csc-week-days {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.${SCOPE} .csc-day {
  border-right: var(--border-width) solid var(--color-border);
  padding: 3px 6px 0;
}
.${SCOPE} .csc-day:last-child { border-right: none; }
.${SCOPE} .csc-day.is-outside { background: var(--color-background-muted); }
.${SCOPE} .csc-day-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  font-family: ${MONO};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .csc-day-num.is-today {
  border: 2px solid ${BRAND};
  color: ${BRAND};
  font-weight: 700;
}
/* Conflict band — hatched overlay across the exact overlap days, behind
   the bars (z 1 vs bar z 2). Geometry (45° stripes) carries the state. */
.${SCOPE} .csc-conflict-band {
  position: absolute;
  top: 24px;
  bottom: 2px;
  z-index: 1;
  background-image: repeating-linear-gradient(45deg, ${HATCH_DANGER} 0px, ${HATCH_DANGER} 3px, transparent 3px, transparent 9px);
  border-left: 2px solid ${DANGER};
  border-right: 2px solid ${DANGER};
  pointer-events: none;
}
/* Span bars — real buttons, 20px tall in a 22px lane. */
.${SCOPE} .csc-bar {
  appearance: none;
  position: absolute;
  z-index: 2;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  color: var(--color-text-primary);
}
.${SCOPE} .csc-bar[aria-pressed='true'] {
  border-color: ${BRAND};
  box-shadow: 0 0 0 1px ${BRAND};
}
.${SCOPE} .csc-bar.is-cont-right { border-top-right-radius: 0; border-bottom-right-radius: 0; border-right-style: dashed; }
.${SCOPE} .csc-bar.is-cont-left { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left-style: dashed; }
.${SCOPE} .csc-bar-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-left: -6px;
  border-radius: 5px 0 0 5px;
}
.${SCOPE} .csc-bar-text {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .csc-bar-value {
  font-family: ${MONO};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${SCOPE} .csc-deliv {
  position: absolute;
  top: 6px;
  width: 8px;
  height: 8px;
  transform: translateX(-50%) rotate(45deg);
  border: var(--border-width) solid var(--color-background);
}
.${SCOPE} .csc-legend {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 32px;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.${SCOPE} .csc-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* Rail ---------------------------------------------------------------------*/
.${SCOPE} .csc-rail {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.${SCOPE} .csc-rail.is-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.${SCOPE} .csc-rail-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: ${GUTTER}px; }
.${SCOPE} .csc-rail-head {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 44px;
  padding: 0 ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${SCOPE} .csc-offer {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  padding: ${GUTTER / 2}px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${SCOPE} .csc-offer.is-declined { opacity: 0.55; }
.${SCOPE} .csc-offer-warn {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px;
  border-radius: var(--radius-container);
  background: ${DANGER_SOFT};
  color: ${DANGER};
}
.${SCOPE} .csc-ledger-row {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  min-height: 40px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .csc-ledger-row:last-child { border-bottom: none; }
.${SCOPE} .csc-ledger-row.is-highlight { background: ${BRAND_SOFT}; }
.${SCOPE} .csc-cp-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
.${SCOPE} .csc-rail-totals {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 44px;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${SCOPE} .csc-deliv-row {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  width: 100%;
  min-height: 40px;
  padding: 0 ${GUTTER / 2}px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  border-radius: var(--radius-container);
}
.${SCOPE} .csc-deliv-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${SCOPE} .csc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${GUTTER / 2}px;
  padding: ${GUTTER * 2}px ${GUTTER}px;
  text-align: center;
}
.${SCOPE} .csc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
`;

// ---------------------------------------------------------------------------
// GRID GEOMETRY — 35 cells, Sun 28 Jun (index 0) → Sat 1 Aug (index 34).
// Jul N = index N+2. Today = Fri 10 Jul 2026 = index 12. Pure arithmetic
// from literal boundaries; no Date construction anywhere.
// ---------------------------------------------------------------------------

const GRID_DAYS: Array<{num: number; month: 'Jun' | 'Jul' | 'Aug'; inJuly: boolean}> = [];
for (let i = 0; i < 35; i += 1) {
  if (i < 3) GRID_DAYS.push({num: 28 + i, month: 'Jun', inJuly: false});
  else if (i < 34) GRID_DAYS.push({num: i - 2, month: 'Jul', inJuly: true});
  else GRID_DAYS.push({num: 1, month: 'Aug', inJuly: false});
}
const TODAY_IDX = 12; // Fri 10 Jul 2026
const TODAY_LABEL = 'Fri 10 Jul 2026';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_STARTS = [0, 7, 14, 21, 28];

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Mara Chen's July 2026 sponsorship book.
// Every range is dual-field (grid indices for math, strings for display).
// ---------------------------------------------------------------------------

type DealStatus = 'active' | 'pending' | 'declined';
type CheckpointKind = 'signing' | 'delivery' | 'net30';
type CheckpointState = 'paid' | 'invoiced' | 'scheduled';
type DeliverableKind = 'video' | 'short' | 'newsletter';

interface Deliverable {
  id: string;
  kind: DeliverableKind;
  label: string;
  dayIdx: number;
  dateLabel: string;
  done: boolean;
}

interface Checkpoint {
  kind: CheckpointKind;
  amount: number; // integer dollars — 30/50/20 split, verified in @input
  dueLabel: string;
  sortKey: number; // yyyymmdd for date-ordered ledger interleave
  paid?: boolean;
}

interface Deal {
  id: string;
  brand: string;
  category: Category;
  value: number;
  status: DealStatus;
  startIdx: number;
  endIdx: number; // clamped to 34 for display; trueEndLabel keeps the truth
  flightLabel: string;
  continuesPastGrid?: boolean;
  exclDays: number;
  exclStartIdx: number;
  exclEndIdx: number;
  exclLabel: string;
  deliverables: Deliverable[];
  checkpoints: Checkpoint[];
  contact: string;
  note?: string;
}

// Identity consts — referenced by identity, never retyped.
const D_LOAMLY = 'D-198';
const D_TUNNELPEAK = 'D-201';
const D_HEXCODE = 'D-204';
const O_NORDSHIELD = 'O-311';
const O_BREWLINE = 'O-314';
const O_STACKFOUNDRY = 'O-317';
const O_KILNWORKS = 'O-319';

// Seven deals. O-311 is the seeded conflict fixture (its flight sits fully
// inside TunnelPeak's VPN exclusivity, Jun 29 – Jul 24). O-317 both
// overlaps Hexcode's dev-tools exclusivity AND continues past the grid
// edge (flight ends Aug 7). O-319 carries the 48-char brand-name
// truncation stress. Checkpoint splits are hand-verified in @input.
const INITIAL_DEALS: Deal[] = [
  {
    id: D_LOAMLY,
    brand: 'Loamly',
    category: 'd2c',
    value: 6500,
    status: 'active',
    startIdx: 4,
    endIdx: 11,
    flightLabel: 'Jul 2 – Jul 9',
    exclDays: 3,
    exclStartIdx: 1,
    exclEndIdx: 14,
    exclLabel: 'D2C exclusive Jun 29 – Jul 12',
    deliverables: [
      {id: 'dl-1', kind: 'video', label: 'YT integration (90s)', dayIdx: 9, dateLabel: 'Jul 7', done: true},
      {id: 'dl-2', kind: 'short', label: 'Short — raised-bed reveal', dayIdx: 11, dateLabel: 'Jul 9', done: true},
    ],
    checkpoints: [
      {kind: 'signing', amount: 1950, dueLabel: 'Paid 20 Jun', sortKey: 20260620, paid: true},
      {kind: 'delivery', amount: 3250, dueLabel: 'Due 9 Jul', sortKey: 20260709},
      {kind: 'net30', amount: 1300, dueLabel: 'Due 8 Aug', sortKey: 20260808},
    ],
    contact: 'sasha@loamly.example',
  },
  {
    id: D_TUNNELPEAK,
    brand: 'TunnelPeak',
    category: 'vpn',
    value: 18000,
    status: 'active',
    startIdx: 8,
    endIdx: 19,
    flightLabel: 'Jul 6 – Jul 17',
    exclDays: 7,
    exclStartIdx: 1,
    exclEndIdx: 26,
    exclLabel: 'VPN exclusive Jun 29 – Jul 24',
    deliverables: [
      {id: 'tp-1', kind: 'video', label: 'YT integration (120s)', dayIdx: 10, dateLabel: 'Jul 8', done: true},
      {id: 'tp-2', kind: 'newsletter', label: 'Newsletter feature', dayIdx: 16, dateLabel: 'Jul 14', done: false},
      {id: 'tp-3', kind: 'short', label: 'Short — travel router bit', dayIdx: 18, dateLabel: 'Jul 16', done: false},
    ],
    checkpoints: [
      {kind: 'signing', amount: 5400, dueLabel: 'Paid 29 Jun', sortKey: 20260629, paid: true},
      {kind: 'delivery', amount: 9000, dueLabel: 'Due 17 Jul', sortKey: 20260717},
      {kind: 'net30', amount: 3600, dueLabel: 'Due 16 Aug', sortKey: 20260816},
    ],
    contact: 'partnerships@tunnelpeak.example',
    note: 'Category exclusivity is contractual — a competing VPN flight inside the window is a breach.',
  },
  {
    id: D_HEXCODE,
    brand: 'Hexcode',
    category: 'devtools',
    value: 12000,
    status: 'active',
    startIdx: 22,
    endIdx: 33,
    flightLabel: 'Jul 20 – Jul 31',
    exclDays: 5,
    exclStartIdx: 17,
    exclEndIdx: 38,
    exclLabel: 'Dev-tools exclusive Jul 15 – Aug 5',
    deliverables: [
      {id: 'hx-1', kind: 'video', label: 'YT deep-dive review', dayIdx: 24, dateLabel: 'Jul 22', done: false},
      {id: 'hx-2', kind: 'newsletter', label: 'Newsletter walkthrough', dayIdx: 30, dateLabel: 'Jul 28', done: false},
    ],
    checkpoints: [
      {kind: 'signing', amount: 3600, dueLabel: 'Paid 6 Jul', sortKey: 20260706, paid: true},
      {kind: 'delivery', amount: 6000, dueLabel: 'Due 31 Jul', sortKey: 20260731},
      {kind: 'net30', amount: 2400, dueLabel: 'Due 30 Aug', sortKey: 20260830},
    ],
    contact: 'creators@hexcode.example',
  },
  {
    id: O_NORDSHIELD,
    brand: 'NordShield',
    category: 'vpn',
    value: 22000,
    status: 'pending',
    startIdx: 15,
    endIdx: 24,
    flightLabel: 'Jul 13 – Jul 22',
    exclDays: 7,
    exclStartIdx: 8,
    exclEndIdx: 31,
    exclLabel: 'Wants VPN exclusive Jul 6 – Jul 29',
    deliverables: [
      {id: 'ns-1', kind: 'video', label: 'YT integration (120s)', dayIdx: 17, dateLabel: 'Jul 15', done: false},
      {id: 'ns-2', kind: 'short', label: 'Short — speed test', dayIdx: 22, dateLabel: 'Jul 20', done: false},
    ],
    checkpoints: [
      {kind: 'signing', amount: 6600, dueLabel: 'Due on accept (10 Jul)', sortKey: 20260710},
      {kind: 'delivery', amount: 11000, dueLabel: 'Due 22 Jul', sortKey: 20260722},
      {kind: 'net30', amount: 4400, dueLabel: 'Due 21 Aug', sortKey: 20260821},
    ],
    contact: 'talent@nordshield.example',
    note: 'Highest CPM offer this quarter. Flight sits inside the TunnelPeak window.',
  },
  {
    id: O_BREWLINE,
    brand: 'Brewline',
    category: 'coffee',
    value: 4200,
    status: 'pending',
    startIdx: 10,
    endIdx: 16,
    flightLabel: 'Jul 8 – Jul 14',
    exclDays: 0,
    exclStartIdx: 10,
    exclEndIdx: 16,
    exclLabel: 'No exclusivity ask',
    deliverables: [
      {id: 'bl-1', kind: 'short', label: 'Short — morning bench brew', dayIdx: 13, dateLabel: 'Jul 11', done: false},
      {id: 'bl-2', kind: 'newsletter', label: 'Newsletter mention', dayIdx: 16, dateLabel: 'Jul 14', done: false},
    ],
    checkpoints: [
      {kind: 'signing', amount: 1260, dueLabel: 'Due on accept (10 Jul)', sortKey: 20260710},
      {kind: 'delivery', amount: 2100, dueLabel: 'Due 14 Jul', sortKey: 20260714},
      {kind: 'net30', amount: 840, dueLabel: 'Due 13 Aug', sortKey: 20260813},
    ],
    contact: 'hey@brewline.example',
  },
  {
    id: O_STACKFOUNDRY,
    brand: 'Stackfoundry',
    category: 'devtools',
    value: 9800,
    status: 'pending',
    startIdx: 29,
    endIdx: 34, // display clamp — flight truly ends Aug 7 (continues past grid)
    flightLabel: 'Jul 27 – Aug 7',
    continuesPastGrid: true,
    exclDays: 5,
    exclStartIdx: 24,
    exclEndIdx: 34,
    exclLabel: 'Wants dev-tools exclusive Jul 22 – Aug 12',
    deliverables: [
      {id: 'sf-1', kind: 'video', label: 'YT sponsored segment', dayIdx: 31, dateLabel: 'Jul 29', done: false},
    ],
    checkpoints: [
      {kind: 'signing', amount: 2940, dueLabel: 'Due on accept (10 Jul)', sortKey: 20260710},
      {kind: 'delivery', amount: 4900, dueLabel: 'Due 7 Aug', sortKey: 20260807},
      {kind: 'net30', amount: 1960, dueLabel: 'Due 6 Sep', sortKey: 20260906},
    ],
    contact: 'sponsor@stackfoundry.example',
  },
  {
    id: O_KILNWORKS,
    brand: 'Kilnworks Ceramics Studio & Makerspace of Portland',
    category: 'd2c',
    value: 3000,
    status: 'pending',
    startIdx: 26,
    endIdx: 28,
    flightLabel: 'Jul 24 – Jul 26',
    exclDays: 0,
    exclStartIdx: 26,
    exclEndIdx: 28,
    exclLabel: 'No exclusivity ask',
    deliverables: [
      {id: 'kw-1', kind: 'short', label: 'Short — studio tour', dayIdx: 27, dateLabel: 'Jul 25', done: false},
    ],
    checkpoints: [
      {kind: 'signing', amount: 900, dueLabel: 'Due on accept (10 Jul)', sortKey: 20260710},
      {kind: 'delivery', amount: 1500, dueLabel: 'Due 26 Jul', sortKey: 20260726},
      {kind: 'net30', amount: 600, dueLabel: 'Due 25 Aug', sortKey: 20260825},
    ],
    contact: 'kiln@kilnworkspdx.example',
  },
];

const CREATOR = {name: 'Mara Chen', handle: '@marabuilds', channel: 'workshop + maker tech'};

const DELIVERABLE_GLYPH: Record<DeliverableKind, string> = {
  video: 'YT',
  short: 'SH',
  newsletter: 'NL',
};

// ---------------------------------------------------------------------------
// DERIVATIONS — conflicts, ledger, lane packing, and stats all derive from
// the deals array every render; nothing aggregate is ever typed.
// ---------------------------------------------------------------------------

function fmtUSD(value: number): string {
  return `$${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function idxToLabel(idx: number): string {
  const day = GRID_DAYS[idx];
  return day == null ? '—' : `${day.month} ${day.num}`;
}

interface Conflict {
  offenderId: string; // the flight that intrudes
  holderId: string; // the deal whose exclusivity window is breached
  startIdx: number;
  endIdx: number;
}

/**
 * A conflict exists per ORDERED pair of accepted same-category deals when
 * the offender's flight days intersect the holder's exclusivity window.
 * Both directions are checked, so a mutual breach yields two bands.
 */
function deriveConflicts(deals: Deal[]): Conflict[] {
  const active = deals.filter(deal => deal.status === 'active');
  const out: Conflict[] = [];
  for (const holder of active) {
    for (const offender of active) {
      if (holder.id === offender.id || holder.category !== offender.category) continue;
      const start = Math.max(holder.exclStartIdx, offender.startIdx, 0);
      const end = Math.min(holder.exclEndIdx, offender.endIdx, 34);
      if (start <= end) {
        out.push({offenderId: offender.id, holderId: holder.id, startIdx: start, endIdx: end});
      }
    }
  }
  return out;
}

/** Pending-offer risk preview: which accepted exclusivity windows would the
 * offer's flight breach (and vice versa) if accepted right now. */
function offerConflictNotes(offer: Deal, deals: Deal[]): string[] {
  const notes: string[] = [];
  for (const deal of deals) {
    if (deal.status !== 'active' || deal.category !== offer.category) continue;
    const flightInWindow =
      Math.max(deal.exclStartIdx, offer.startIdx) <= Math.min(deal.exclEndIdx, offer.endIdx);
    const windowOverFlight =
      Math.max(offer.exclStartIdx, deal.startIdx) <= Math.min(offer.exclEndIdx, deal.endIdx);
    if (flightInWindow) {
      notes.push(`Flight breaches ${deal.brand} — ${deal.exclLabel}`);
    } else if (windowOverFlight) {
      notes.push(`Asked window covers the live ${deal.brand} flight`);
    }
  }
  return notes;
}

function checkpointState(deal: Deal, checkpoint: Checkpoint): CheckpointState {
  if (checkpoint.paid === true) return 'paid';
  if (checkpoint.kind === 'signing') return 'invoiced'; // due on accept
  if (checkpoint.kind === 'delivery') {
    const allDone = deal.deliverables.length > 0 && deal.deliverables.every(d => d.done);
    return allDone ? 'invoiced' : 'scheduled';
  }
  return 'scheduled';
}

const CP_STATE_META: Record<CheckpointState, {label: string; color: string}> = {
  paid: {label: 'Paid', color: OK_GREEN},
  invoiced: {label: 'Invoiced', color: WARN},
  scheduled: {label: 'Scheduled', color: 'var(--color-text-secondary)'},
};

const CP_KIND_LABEL: Record<CheckpointKind, string> = {
  signing: 'Signing 30%',
  delivery: 'Delivery 50%',
  net30: 'Net-30 20%',
};

interface LedgerEntry {
  dealId: string;
  brand: string;
  checkpoint: Checkpoint;
  state: CheckpointState;
}

function deriveLedger(deals: Deal[]): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  for (const deal of deals) {
    if (deal.status !== 'active') continue;
    for (const checkpoint of deal.checkpoints) {
      entries.push({dealId: deal.id, brand: deal.brand, checkpoint, state: checkpointState(deal, checkpoint)});
    }
  }
  entries.sort((a, b) =>
    a.checkpoint.sortKey === b.checkpoint.sortKey
      ? a.dealId.localeCompare(b.dealId)
      : a.checkpoint.sortKey - b.checkpoint.sortKey,
  );
  return entries;
}

interface WeekSegment {
  deal: Deal;
  lane: number;
  segStart: number; // grid idx within this week
  segEnd: number;
  contLeft: boolean;
  contRight: boolean;
}

// Lanes are packed per MONTH, not per week, so a deal keeps ONE lane across
// week boundaries (a bar that hops lanes at a row break reads as two deals).
// Greedy first-free-lane, deterministic: sorted by flight start then id.
// Four 22px lanes fit the 116px row; the fixture book peaks at 3 lanes
// (Jul 12 week: NordShield L0, TunnelPeak L1, Brewline L2) with every
// offer accepted.
function packLanes(deals: Deal[]): Map<string, number> {
  const active = deals
    .filter(deal => deal.status === 'active')
    .sort((a, b) => (a.startIdx === b.startIdx ? a.id.localeCompare(b.id) : a.startIdx - b.startIdx));
  const laneEnds: number[] = [];
  const byId = new Map<string, number>();
  for (const deal of active) {
    let lane = laneEnds.findIndex(end => end < deal.startIdx);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(deal.endIdx);
    } else {
      laneEnds[lane] = deal.endIdx;
    }
    byId.set(deal.id, lane);
  }
  return byId;
}

/** Clip active deals to one week row using the stable month lanes. */
function segmentsForWeek(weekStart: number, deals: Deal[], lanes: Map<string, number>): WeekSegment[] {
  const weekEnd = weekStart + 6;
  const segments: WeekSegment[] = [];
  for (const deal of deals) {
    if (deal.status !== 'active' || deal.startIdx > weekEnd || deal.endIdx < weekStart) continue;
    segments.push({
      deal,
      lane: lanes.get(deal.id) ?? 0,
      segStart: Math.max(deal.startIdx, weekStart),
      segEnd: Math.min(deal.endIdx, weekEnd),
      contLeft: deal.startIdx < weekStart,
      contRight: deal.endIdx > weekEnd || (deal.continuesPastGrid === true && weekEnd >= 34),
    });
  }
  return segments;
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (house pattern): the inline demo
// stage is ~1045–1075px inside a 1440px window, so viewport media queries
// would lie. Width 0 = first pre-observer frame; callers treat 0 as wide.
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
// ADLANE MARK — 24px inline SVG: a calendar tile with a span bar landing
// across it (the product gesture). Brand accent as stroke/fill.
// ---------------------------------------------------------------------------

function AdlaneMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <rect x={3} y={4} width={18} height={17} rx={2.5} fill="none" stroke={BRAND} strokeWidth={2} />
      <path d="M3 9h18" stroke={BRAND} strokeWidth={2} />
      <rect x={6.5} y={12.5} width={11} height={4} rx={2} fill={BRAND} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CALENDAR — the domain surface the DS has no vocabulary for. Each week
// row is a positioned canvas: a 7-col background day grid, hatched
// conflict bands (z1), then lane-packed bar buttons (z2). All horizontal
// positions are day-fraction percentages so one geometry serves every
// band. Deliverable diamonds ride ON the bar at their day's midpoint.
// ---------------------------------------------------------------------------

function pctLeft(dayInWeek: number): string {
  return `${(dayInWeek / 7) * 100}%`;
}

function pctWidth(days: number): string {
  return `${(days / 7) * 100}%`;
}

interface DealBarProps {
  segment: WeekSegment;
  weekStart: number;
  isSelected: boolean;
  hasConflict: boolean;
  justLanded: boolean;
  barDetail: 'full' | 'brand' | 'initial';
  onSelect: (dealId: string) => void;
}

function DealBar({segment, weekStart, isSelected, hasConflict, justLanded, barDetail, onSelect}: DealBarProps) {
  const {deal, lane, segStart, segEnd, contLeft, contRight} = segment;
  const meta = CATEGORY_META[deal.category];
  const spanDays = segEnd - segStart + 1;
  const doneCount = deal.deliverables.filter(d => d.done).length;
  return (
    <button
      type="button"
      className={`csc-bar csc-focusable csc-fade${contLeft ? ' is-cont-left' : ''}${contRight ? ' is-cont-right' : ''}${
        justLanded ? ' csc-land' : ''
      }`}
      style={{
        left: `calc(${pctLeft(segStart - weekStart)} + 1px)`,
        width: `calc(${pctWidth(spanDays)} - 2px)`,
        top: 24 + lane * 22,
        background: meta.soft,
      }}
      aria-pressed={isSelected}
      onClick={() => onSelect(deal.id)}
      aria-label={`${deal.brand}, ${meta.label}, ${deal.flightLabel}, ${fmtUSD(deal.value)}, ${doneCount} of ${
        deal.deliverables.length
      } deliverables done${hasConflict ? ', exclusivity conflict' : ''}`}>
      <span className="csc-bar-accent" style={{background: meta.color}} aria-hidden />
      {hasConflict ? (
        <span style={{color: DANGER, display: 'inline-flex', flexShrink: 0}} aria-hidden>
          <TriangleAlertIcon size={11} strokeWidth={2.5} />
        </span>
      ) : null}
      {barDetail === 'initial' ? (
        <span className="csc-bar-text" aria-hidden>
          {deal.brand.slice(0, 1)}
        </span>
      ) : (
        <span className="csc-bar-text" aria-hidden>
          {deal.brand}
        </span>
      )}
      {barDetail === 'full' && !contLeft ? (
        <span className="csc-bar-value" aria-hidden>
          {fmtUSD(deal.value)}
        </span>
      ) : null}
      {contRight ? (
        <span className="csc-bar-value" style={{marginLeft: 'auto'}} aria-hidden>
          →
        </span>
      ) : null}
      {deal.deliverables.map(deliverable =>
        deliverable.dayIdx >= segStart && deliverable.dayIdx <= segEnd ? (
          <span
            key={deliverable.id}
            className="csc-deliv"
            style={{
              left: `${((deliverable.dayIdx - segStart + 0.5) / spanDays) * 100}%`,
              background: deliverable.done ? meta.color : 'var(--color-background)',
              boxShadow: `inset 0 0 0 1.5px ${meta.color}`,
            }}
            aria-hidden
          />
        ) : null,
      )}
    </button>
  );
}

interface WeekRowProps {
  weekStart: number;
  deals: Deal[];
  lanes: Map<string, number>;
  conflicts: Conflict[];
  selectedDealId: string | null;
  conflictedDealIds: ReadonlySet<string>;
  justLandedId: string | null;
  barDetail: 'full' | 'brand' | 'initial';
  onSelect: (dealId: string) => void;
}

function WeekRow({
  weekStart,
  deals,
  lanes,
  conflicts,
  selectedDealId,
  conflictedDealIds,
  justLandedId,
  barDetail,
  onSelect,
}: WeekRowProps) {
  const segments = segmentsForWeek(weekStart, deals, lanes);
  const weekEnd = weekStart + 6;
  const weekConflicts = conflicts
    .map(conflict => ({
      ...conflict,
      startIdx: Math.max(conflict.startIdx, weekStart),
      endIdx: Math.min(conflict.endIdx, weekEnd),
    }))
    .filter(conflict => conflict.startIdx <= conflict.endIdx);
  return (
    <div className="csc-week">
      <div className="csc-week-days" aria-hidden>
        {Array.from({length: 7}, (_, offset) => {
          const idx = weekStart + offset;
          const day = GRID_DAYS[idx];
          if (day == null) return <span key={idx} className="csc-day" />;
          return (
            <span key={idx} className={`csc-day${day.inJuly ? '' : ' is-outside'}`}>
              <span className={`csc-day-num${idx === TODAY_IDX ? ' is-today' : ''}`}>
                {day.num === 1 || idx === 0 ? `${day.month} ${day.num}` : day.num}
              </span>
            </span>
          );
        })}
      </div>
      {weekConflicts.map(conflict => (
        <span
          key={`${conflict.offenderId}-${conflict.holderId}`}
          className="csc-conflict-band"
          style={{
            left: pctLeft(conflict.startIdx - weekStart),
            width: pctWidth(conflict.endIdx - conflict.startIdx + 1),
          }}
          aria-hidden
        />
      ))}
      {segments.map(segment => (
        <DealBar
          key={segment.deal.id}
          segment={segment}
          weekStart={weekStart}
          isSelected={selectedDealId === segment.deal.id}
          hasConflict={conflictedDealIds.has(segment.deal.id)}
          justLanded={justLandedId === segment.deal.id}
          barDetail={barDetail}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RAIL PIECES — offer cards, selected-deal detail, and the payout ledger.
// Purely presentational; accept/decline/toggle all report to the store.
// ---------------------------------------------------------------------------

interface OfferCardProps {
  offer: Deal;
  conflictNotes: string[];
  onAccept: () => void;
  onDecline: () => void;
}

function OfferCard({offer, conflictNotes, onAccept, onDecline}: OfferCardProps) {
  const meta = CATEGORY_META[offer.category];
  const isDeclined = offer.status === 'declined';
  return (
    <div className={`csc-offer${isDeclined ? ' is-declined' : ''}`}>
      <HStack gap={2} vAlign="center">
        <span
          aria-hidden
          style={{width: 8, height: 8, borderRadius: 2, background: meta.color, flexShrink: 0}}
        />
        <span className="csc-mono" style={{color: 'var(--color-text-secondary)'}}>
          {offer.id}
        </span>
        <StackItem size="fill">
          <Text type="label" size="sm" maxLines={1}>
            <span style={isDeclined ? {textDecoration: 'line-through'} : undefined}>{offer.brand}</span>
          </Text>
        </StackItem>
        <span className="csc-mono" style={{fontWeight: 700}}>
          {fmtUSD(offer.value)}
        </span>
      </HStack>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers maxLines={1}>
        {offer.flightLabel} · {meta.label} · {offer.deliverables.length} deliverable
        {offer.deliverables.length === 1 ? '' : 's'} · {offer.exclLabel}
      </Text>
      {offer.note != null && !isDeclined ? (
        <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
          {offer.note}
        </Text>
      ) : null}
      {conflictNotes.length > 0 && !isDeclined ? (
        <div className="csc-offer-warn">
          <span style={{display: 'inline-flex', flexShrink: 0, paddingTop: 1}} aria-hidden>
            <TriangleAlertIcon size={12} strokeWidth={2.5} />
          </span>
          <VStack gap={0}>
            {conflictNotes.map(note => (
              <Text key={note} type="supporting" size="xsm" color="inherit" maxLines={2}>
                {note}
              </Text>
            ))}
          </VStack>
        </div>
      ) : null}
      {isDeclined ? (
        <Text type="supporting" size="xsm" color="secondary">
          Declined {TODAY_LABEL} — kept for the quarter log.
        </Text>
      ) : (
        <HStack gap={2} vAlign="center">
          <Button
            label={conflictNotes.length > 0 ? 'Accept anyway' : 'Accept'}
            variant={conflictNotes.length > 0 ? 'secondary' : 'primary'}
            size="sm"
            icon={<Icon icon={CheckIcon} size="sm" />}
            onClick={onAccept}
          />
          <Button label="Decline" variant="ghost" size="sm" icon={<Icon icon={XIcon} size="sm" />} onClick={onDecline} />
        </HStack>
      )}
    </div>
  );
}

interface DealDetailProps {
  deal: Deal;
  conflicts: Conflict[];
  dealById: ReadonlyMap<string, Deal>;
  onToggleDeliverable: (dealId: string, deliverableId: string) => void;
}

function DealDetail({deal, conflicts, dealById, onToggleDeliverable}: DealDetailProps) {
  const meta = CATEGORY_META[deal.category];
  const doneCount = deal.deliverables.filter(d => d.done).length;
  const myConflicts = conflicts.filter(c => c.offenderId === deal.id || c.holderId === deal.id);
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <span aria-hidden style={{width: 10, height: 10, borderRadius: 2, background: meta.color, flexShrink: 0}} />
        <StackItem size="fill">
          <Heading level={3} maxLines={1}>
            {deal.brand}
          </Heading>
        </StackItem>
        <Token size="sm" color="default" label={meta.label} />
      </HStack>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        {deal.flightLabel} · {fmtUSD(deal.value)} · {deal.exclLabel} · {deal.contact}
      </Text>
      {myConflicts.map(conflict => {
        const other = dealById.get(conflict.offenderId === deal.id ? conflict.holderId : conflict.offenderId);
        return (
          <div key={`${conflict.offenderId}-${conflict.holderId}`} className="csc-offer-warn" role="status">
            <span style={{display: 'inline-flex', flexShrink: 0, paddingTop: 1}} aria-hidden>
              <TriangleAlertIcon size={12} strokeWidth={2.5} />
            </span>
            <Text type="supporting" size="xsm" color="inherit" maxLines={2}>
              {conflict.offenderId === deal.id
                ? `This flight breaches ${other?.brand ?? '—'} exclusivity ${idxToLabel(conflict.startIdx)} – ${idxToLabel(conflict.endIdx)}.`
                : `${other?.brand ?? '—'} flight sits inside this deal's window ${idxToLabel(conflict.startIdx)} – ${idxToLabel(conflict.endIdx)}.`}
            </Text>
          </div>
        );
      })}
      <VStack gap={0}>
        <HStack gap={2} vAlign="center">
          <span className="csc-label">Deliverables</span>
          <span className="csc-mono" style={{color: 'var(--color-text-secondary)'}}>
            {doneCount}/{deal.deliverables.length}
          </span>
        </HStack>
        {deal.deliverables.map(deliverable => (
          <button
            key={deliverable.id}
            type="button"
            className="csc-deliv-row csc-focusable csc-fade"
            aria-pressed={deliverable.done}
            onClick={() => onToggleDeliverable(deal.id, deliverable.id)}
            aria-label={`${deliverable.label}, ${deliverable.dateLabel}, ${
              deliverable.done ? 'done — press to reopen' : 'open — press to mark done'
            }`}>
            <span
              className="csc-deliv-box"
              style={deliverable.done ? {background: meta.color, borderColor: meta.color} : undefined}
              aria-hidden>
              {deliverable.done ? <CheckIcon size={11} strokeWidth={3} color="var(--color-background)" /> : null}
            </span>
            <span className="csc-mono" style={{width: 22, flexShrink: 0, color: 'var(--color-text-secondary)'}}>
              {DELIVERABLE_GLYPH[deliverable.kind]}
            </span>
            <StackItem size="fill">
              <Text type="body" size="sm" maxLines={1}>
                {deliverable.label}
              </Text>
            </StackItem>
            <span className="csc-mono" style={{color: 'var(--color-text-secondary)'}}>
              {deliverable.dateLabel}
            </span>
          </button>
        ))}
      </VStack>
    </VStack>
  );
}

interface PayoutLedgerProps {
  entries: LedgerEntry[];
  selectedDealId: string | null;
  showDealColumn: boolean;
}

function PayoutLedger({entries, selectedDealId, showDealColumn}: PayoutLedgerProps) {
  return (
    <VStack gap={0}>
      {entries.map(entry => {
        const stateMeta = CP_STATE_META[entry.state];
        return (
          <div
            key={`${entry.dealId}-${entry.checkpoint.kind}`}
            className={`csc-ledger-row csc-fade${selectedDealId === entry.dealId ? ' is-highlight' : ''}`}>
            {/* Shape channel: solid = paid, hollow ring = invoiced, dashed
                ring = scheduled — color never stands alone. */}
            <span
              className="csc-cp-dot"
              style={
                entry.state === 'paid'
                  ? {background: stateMeta.color}
                  : entry.state === 'invoiced'
                    ? {border: `2px solid ${stateMeta.color}`}
                    : {border: '2px dashed var(--color-border)'}
              }
              aria-hidden
            />
            <StackItem size="fill">
              <VStack gap={0}>
                <HStack gap={2} vAlign="center">
                  <Text type="body" size="sm" maxLines={1}>
                    {CP_KIND_LABEL[entry.checkpoint.kind]}
                  </Text>
                  {showDealColumn ? (
                    <span className="csc-mono" style={{color: 'var(--color-text-secondary)'}}>
                      {entry.brand.length > 14 ? `${entry.brand.slice(0, 13)}…` : entry.brand}
                    </span>
                  ) : null}
                </HStack>
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers maxLines={1}>
                  {showDealColumn ? entry.checkpoint.dueLabel : `${entry.brand} · ${entry.checkpoint.dueLabel}`}
                </Text>
              </VStack>
            </StackItem>
            <span className="csc-mono" style={{fontWeight: 600}}>
              {fmtUSD(entry.checkpoint.amount)}
            </span>
            <span className="csc-mono" style={{width: 64, textAlign: 'right', color: stateMeta.color, fontSize: 10}}>
              {stateMeta.label}
            </span>
          </div>
        );
      })}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE OWNER — single source of truth: the deals array plus one
// updateDeal(id, patch). Conflicts, lanes, ledger entries, and the three
// revenue stats derive from the array every render, so Accept / Decline /
// deliverable toggles cascade across calendar, rail, and header in one
// commit. The last mutation is announced via the aria-live ticker.
// ---------------------------------------------------------------------------

export default function CreatorSponsorshipCalendar() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(D_TUNNELPEAK);
  const [railOpen, setRailOpen] = useState(false);
  const [justLandedId, setJustLandedId] = useState<string | null>(null);
  const [ticker, setTicker] = useState('July book loaded — 3 live campaigns, 4 offers waiting.');

  const rootRef = useRef<HTMLDivElement | null>(null);
  const offersButtonRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(rootRef);

  // Band flags — width 0 (first pre-observer frame) is treated as wide.
  const isWide = width === 0 || width >= 1200;
  const isOverlayBand = width > 0 && width < 1000;
  const isPhoneBand = width > 0 && width < 640;
  const railWidth = isPhoneBand ? width : isWide && !isOverlayBand ? 400 : 360;
  const barDetail: 'full' | 'brand' | 'initial' = isPhoneBand ? 'initial' : isWide ? 'full' : 'brand';

  const dealById = useMemo(() => new Map(deals.map(deal => [deal.id, deal])), [deals]);
  const lanes = useMemo(() => packLanes(deals), [deals]);
  const conflicts = useMemo(() => deriveConflicts(deals), [deals]);
  const conflictedDealIds = useMemo(() => {
    const ids = new Set<string>();
    for (const conflict of conflicts) {
      ids.add(conflict.offenderId);
      ids.add(conflict.holderId);
    }
    return ids;
  }, [conflicts]);
  const ledger = useMemo(() => deriveLedger(deals), [deals]);

  const booked = deals.reduce((sum, deal) => sum + (deal.status === 'active' ? deal.value : 0), 0);
  const collected = ledger.reduce((sum, entry) => sum + (entry.state === 'paid' ? entry.checkpoint.amount : 0), 0);
  const outstanding = booked - collected;
  // Ordered pairs double-count a mutual breach; report distinct pairs.
  const conflictPairCount = useMemo(() => {
    const pairs = new Set<string>();
    for (const conflict of conflicts) {
      pairs.add([conflict.offenderId, conflict.holderId].sort().join('+'));
    }
    return pairs.size;
  }, [conflicts]);

  const pendingOffers = deals.filter(deal => deal.status === 'pending');
  const declinedOffers = deals.filter(deal => deal.status === 'declined');
  const selectedDeal = selectedDealId != null ? dealById.get(selectedDealId) ?? null : null;

  const updateDeal = (id: string, patch: Partial<Deal>) => {
    setDeals(previous => previous.map(deal => (deal.id === id ? {...deal, ...patch} : deal)));
  };

  const handleSelectDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    if (isOverlayBand) setRailOpen(true);
  };

  const handleAccept = (offer: Deal) => {
    const notes = offerConflictNotes(offer, deals);
    updateDeal(offer.id, {status: 'active'});
    setJustLandedId(offer.id);
    setSelectedDealId(offer.id);
    setTicker(
      notes.length > 0
        ? `${offer.id} ${offer.brand} accepted with an exclusivity conflict — bands hatched, ${fmtUSD(offer.value)} booked.`
        : `${offer.id} ${offer.brand} accepted — bar landed ${offer.flightLabel}, 3 checkpoints added, ${fmtUSD(offer.value)} booked.`,
    );
  };

  const handleDecline = (offer: Deal) => {
    updateDeal(offer.id, {status: 'declined'});
    if (selectedDealId === offer.id) setSelectedDealId(null);
    setTicker(`${offer.id} ${offer.brand} declined — logged, calendar unchanged.`);
  };

  const handleToggleDeliverable = (dealId: string, deliverableId: string) => {
    const deal = dealById.get(dealId);
    if (deal == null) return;
    const nextDeliverables = deal.deliverables.map(deliverable =>
      deliverable.id === deliverableId ? {...deliverable, done: !deliverable.done} : deliverable,
    );
    updateDeal(dealId, {deliverables: nextDeliverables});
    const allDone = nextDeliverables.length > 0 && nextDeliverables.every(d => d.done);
    const toggled = deal.deliverables.find(d => d.id === deliverableId);
    setTicker(
      allDone
        ? `${deal.brand}: all deliverables in — delivery checkpoint moved to Invoiced.`
        : `${deal.brand}: ${toggled?.label ?? 'deliverable'} ${toggled?.done === true ? 'reopened' : 'marked done'}.`,
    );
  };

  const handleCloseRail = () => {
    setRailOpen(false);
    const opener = offersButtonRef.current?.querySelector('button');
    opener?.focus();
  };

  const showRail = !isOverlayBand || railOpen;

  return (
    <div ref={rootRef} className={`${SCOPE} csc-root`}>
      <style>{TEMPLATE_CSS}</style>
      <Layout height="fill">
        <LayoutHeader>
          <div className="csc-header">
            <AdlaneMark />
            <VStack gap={0}>
              <Text type="label" size="sm">
                Adlane
              </Text>
              <span className="csc-mono" style={{color: 'var(--color-text-secondary)', fontSize: 10}}>
                {CREATOR.handle} · July 2026 · {TODAY_LABEL}
              </span>
            </VStack>
            <StackItem size="fill">
              <span />
            </StackItem>
            <span className="csc-ticker" aria-live="polite">
              {ticker}
            </span>
            {conflictPairCount > 0 ? (
              <span
                className="csc-chip is-conflict"
                aria-label={`${conflictPairCount} exclusivity conflict${conflictPairCount === 1 ? '' : 's'} on the calendar`}>
                <TriangleAlertIcon size={12} strokeWidth={2.5} aria-hidden />
                <span className="csc-mono" style={{color: 'inherit', fontWeight: 700}}>
                  {conflictPairCount}
                </span>
                {!isPhoneBand ? (
                  <Text type="supporting" size="xsm" color="inherit">
                    conflict{conflictPairCount === 1 ? '' : 's'}
                  </Text>
                ) : null}
              </span>
            ) : null}
            <span className="csc-chip" aria-label={`Booked July revenue ${fmtUSD(booked)}, derived from accepted deals`}>
              <Icon icon={BadgeDollarSignIcon} size="xsm" color="inherit" />
              <span className="csc-mono" style={{color: 'inherit', fontWeight: 700}}>
                {fmtUSD(booked)}
              </span>
              {!isPhoneBand ? (
                <Text type="supporting" size="xsm" color="inherit">
                  booked
                </Text>
              ) : null}
            </span>
            {isOverlayBand ? (
              <div ref={offersButtonRef} style={{display: 'inline-flex'}}>
                <Button
                  label={`Offers (${pendingOffers.length})`}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={InboxIcon} size="sm" />}
                  onClick={() => setRailOpen(previous => !previous)}
                />
              </div>
            ) : null}
            <Avatar size="small" name={CREATOR.name} alt={`${CREATOR.name}, ${CREATOR.handle}`} />
          </div>
        </LayoutHeader>
        <LayoutContent>
          <div className="csc-view">
            <div className="csc-cal-col">
              <div className="csc-weekday-row" aria-hidden>
                {WEEKDAYS.map(day => (
                  <span key={day} className="csc-weekday">
                    {isPhoneBand ? day.slice(0, 1) : day}
                  </span>
                ))}
              </div>
              <div className="csc-cal-scroll">
                {WEEK_STARTS.map(weekStart => (
                  <WeekRow
                    key={weekStart}
                    weekStart={weekStart}
                    deals={deals}
                    lanes={lanes}
                    conflicts={conflicts}
                    selectedDealId={selectedDealId}
                    conflictedDealIds={conflictedDealIds}
                    justLandedId={justLandedId}
                    barDetail={barDetail}
                    onSelect={handleSelectDeal}
                  />
                ))}
              </div>
              {/* Bottom-left corner owner: the legend strip. */}
              <div className="csc-legend">
                {!isPhoneBand
                  ? (Object.keys(CATEGORY_META) as Category[]).map(category => (
                      <span key={category} className="csc-legend-key">
                        <span
                          aria-hidden
                          style={{width: 8, height: 8, borderRadius: 2, background: CATEGORY_META[category].color}}
                        />
                        {CATEGORY_META[category].label}
                      </span>
                    ))
                  : null}
                <span className="csc-legend-key">
                  <span
                    aria-hidden
                    style={{
                      width: 14,
                      height: 10,
                      backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_DANGER} 0px, ${HATCH_DANGER} 3px, transparent 3px, transparent 9px)`,
                      border: `1px solid ${DANGER}`,
                    }}
                  />
                  exclusivity conflict
                </span>
                <span className="csc-legend-key">
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      transform: 'rotate(45deg)',
                      background: 'var(--color-text-secondary)',
                    }}
                  />
                  deliverable
                </span>
                <StackItem size="fill">
                  <span />
                </StackItem>
                <span className="csc-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                  {deals.filter(deal => deal.status === 'active').length} live · {pendingOffers.length} pending
                </span>
              </div>
            </div>
            {showRail ? (
              <aside
                className={`csc-rail${isOverlayBand ? ' is-overlay' : ''}`}
                style={{width: railWidth}}
                aria-label="Offers and payouts"
                onKeyDown={event => {
                  if (event.key === 'Escape' && isOverlayBand) handleCloseRail();
                }}>
                <div className="csc-rail-head">
                  <Icon icon={MailIcon} size="sm" color="secondary" />
                  <StackItem size="fill">
                    <Heading level={2}>Offer inbox · {pendingOffers.length}</Heading>
                  </StackItem>
                  {isOverlayBand ? (
                    <Button
                      label="Close panel"
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={XIcon} size="sm" />}
                      onClick={handleCloseRail}
                    />
                  ) : null}
                </div>
                <div className="csc-rail-scroll">
                  <VStack gap={3}>
                    {pendingOffers.length === 0 && declinedOffers.length === 0 ? (
                      <div className="csc-empty">
                        <Icon icon={InboxIcon} size="lg" color="secondary" />
                        <Text type="supporting" size="sm" color="secondary">
                          Inbox zero — every July offer is resolved.
                        </Text>
                      </div>
                    ) : (
                      <VStack gap={2}>
                        {pendingOffers.map(offer => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            conflictNotes={offerConflictNotes(offer, deals)}
                            onAccept={() => handleAccept(offer)}
                            onDecline={() => handleDecline(offer)}
                          />
                        ))}
                        {declinedOffers.map(offer => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            conflictNotes={[]}
                            onAccept={() => handleAccept(offer)}
                            onDecline={() => handleDecline(offer)}
                          />
                        ))}
                      </VStack>
                    )}
                    <Divider />
                    {selectedDeal != null && selectedDeal.status === 'active' ? (
                      <DealDetail
                        deal={selectedDeal}
                        conflicts={conflicts}
                        dealById={dealById}
                        onToggleDeliverable={handleToggleDeliverable}
                      />
                    ) : (
                      <HStack gap={2} vAlign="center">
                        <Icon icon={PlayIcon} size="xsm" color="secondary" />
                        <Text type="supporting" size="xsm" color="secondary">
                          Select a campaign bar to see deliverables and conflicts.
                        </Text>
                      </HStack>
                    )}
                    <Divider />
                    <VStack gap={1}>
                      <HStack gap={2} vAlign="center">
                        <Icon icon={CalendarDaysIcon} size="xsm" color="secondary" />
                        <span className="csc-label">Payout checkpoints · 30/50/20</span>
                      </HStack>
                      <PayoutLedger entries={ledger} selectedDealId={selectedDealId} showDealColumn={isWide} />
                    </VStack>
                  </VStack>
                </div>
                {/* Bottom-right corner owner: derived totals, never typed. */}
                <div className="csc-rail-totals">
                  <VStack gap={0}>
                    <span className="csc-label">Collected</span>
                    <span className="csc-mono" style={{fontWeight: 700, color: OK_GREEN}}>
                      {fmtUSD(collected)}
                    </span>
                  </VStack>
                  <VStack gap={0}>
                    <span className="csc-label">Outstanding</span>
                    <span className="csc-mono" style={{fontWeight: 700}}>
                      {fmtUSD(outstanding)}
                    </span>
                  </VStack>
                  <StackItem size="fill">
                    <span />
                  </StackItem>
                  <VStack gap={0}>
                    <span className="csc-label">Booked Jul</span>
                    <span className="csc-mono" style={{fontWeight: 700, color: BRAND}}>
                      {fmtUSD(booked)}
                    </span>
                  </VStack>
                </div>
              </aside>
            ) : null}
          </div>
        </LayoutContent>
      </Layout>
    </div>
  );
}
