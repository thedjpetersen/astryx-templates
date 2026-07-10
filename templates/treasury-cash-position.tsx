// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Ledgerline daily cash-position
 *   surface for Northwind Industrial Group. Suite "today" anchor: value
 *   date Wed 8 Jul 2026, desk clock frozen at 11:20 ET (a fixture string —
 *   no clock reads, no randomness, no timers, no network assets).
 *   Treasury rate card (07:30 ET fix, applied to every FX sweep):
 *   EUR 1.1000 · GBP 1.3000 · JPY 0.0070 · BRL 0.2000 · CNY 0.1400.
 *
 *   Opening balances (native millions) and the USD cross-checks every stat
 *   derives from — 7 entities x 6 currencies:
 *   NYC IHB USD 42.60 = $42.60M; Frankfurt EUR 9.40 x 1.10 = $10.34M +
 *   USD 1.20 = $11.54M; Amsterdam EUR 5.80 x 1.10 = $6.38M; London GBP
 *   6.70 x 1.30 = $8.71M + USD 0.80 = $9.51M; Tokyo JPY 980 x 0.0070 =
 *   $6.86M + USD 0.40 = $7.26M; São Paulo BRL 31.50 x 0.20 = $6.30M +
 *   USD 0.60 = $6.90M; Shanghai CNY 45.00 x 0.14 = $6.30M.
 *   Group total $90.49M; IHB concentration 42.60/90.49 = 47.1%; trapped
 *   cash (restricted BR + CN entities) 6.90 + 6.30 = $13.20M.
 *   Proposed sweeps (amount = balance − operating floor): SWP-2201 EUR
 *   6.00 -> $6.60M; SWP-2202 EUR 2.50 -> $2.75M; SWP-2203 GBP 3.50 ->
 *   $4.55M; SWP-2204 JPY 400 -> $2.80M (BOJ-NET cutoff passed — blocked);
 *   SWP-2205 BRL 18.00 -> $3.60M (CADOC gate; releases $3.60M of trapped
 *   cash). Executing all four available sweeps lifts concentration to
 *   (42.60 + 17.50)/90.49 = 66.4% — rate-card FX keeps the group total
 *   invariant, which is the cross-check the stat band relies on.
 * @output Treasury Cash Position — a group treasurer's working surface: an
 *   entity x currency cash matrix (sticky entity rail, per-cell floor /
 *   deficit / restricted states, live per-currency totals row) under a
 *   derived stat band, with an SVG sweep-arrow overlay that draws every
 *   proposed sweep as a dashed brand arrow from its source cell into the
 *   NY in-house bank's USD cell. The signature interaction: executing a
 *   sweep from the queue rail moves the money in ONE state update — the
 *   source cell drops to its operating floor, the IHB USD cell and its
 *   column total rise by the rate-card conversion, the concentration and
 *   trapped-cash stats re-derive, the arrow flips from dashed brand to a
 *   solid settled stroke, and the action log appends a fixture-timestamped
 *   entry. A settlement-window strip (06:00–18:00 ET, frozen now-line at
 *   11:20) gates the queue: the JPY sweep refuses with the BOJ-NET cutoff
 *   reason, the two EUR sweeps carry a closing-soon countdown, and the
 *   Brazil sweep is locked behind a CADOC-on-file confirmation.
 * @position Page template; emitted by `astryx template treasury-cash-position`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 48px (Ledgerline mark + group/value-date line | desk-clock
 *   chip + base-currency chip + sweep-queue toggle (narrow band only) +
 *   treasurer avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (stat band 64px > matrix scrollport (flex, sticky
 *       entity rail, right-edge fade hint on a NON-scrolling wrapper) >
 *       settlement strip ~150px > legend strip 32px)
 *     | sweep queue rail 340px (>=1180) / 300px (960–1180): queue header
 *       40px > sweep cards + action log, own scroll.
 * Container policy: app-shell archetype — matrix rows, rails, strips, and
 *   panels; no Cards. Sweep cards are framed sections in the rail, not
 *   marketing cards.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   BRAND = light-dark(#1D4ED8, #60A5FA) — blue. Contrast math: #1D4ED8 on
 *   white = 6.7:1; #60A5FA on #1E1E1E = 6.6:1 — both clear 4.5:1. Declared
 *   usages: the Ledgerline mark, proposed sweep arrows (matrix + legend
 *   swatch) + source-cell sweep dots, the selected sweep card border, and
 *   the selected-endpoint cell rings. State colors are light-dark
 *   pairs with math beside each literal; every state pairs with a shape
 *   channel (dashed vs solid arrow, ring vs fill, hatch, lock glyph),
 *   never color alone.
 *
 * FIXED DENSITY GRID (verbatim, repeated in the CSS and the overlay
 * geometry): header bar 48px; stat band 64px; matrix header row 40px;
 * matrix entity rows 44px; totals row 36px; entity rail 210px wide-band /
 * 190px demo-band; currency columns 112px wide-band / 104px demo-band;
 * settlement lanes 18px x 6 + 18px axis; queue rail 340/300px; sweep cards
 * min 96px; log rows 28px; legend strip 32px; single gutter token
 * GUTTER = 12 (all padding/margins are GUTTER or GUTTER/2 = 6); mono
 * numerals 12px tabular; body 13px; section labels 11px uppercase
 * tracking 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 * ResizeObserver (the demo stage is ~1045–1075px inside a 1440px window;
 * viewport media queries never fire there — a viewport query covers only
 * the first pre-observer frame):
 * - W >= 1180: rail 340px; entity col 210px + 6 x 112px = 882px of grid.
 * - 960 <= W < 1180 (canonical demo band): rail 300px; entity col 190px +
 *   6 x 104px = 814px, wider than the ~745px scroller — the matrix
 *   horizontal-scrolls inside its single scroller (entity rail sticky-left
 *   INSIDE it so rows never misalign) and a gradient fade + chevron on the
 *   non-scrolling wrapper marks clipped columns; the arrows live inside
 *   the scroller so they pan with the cells they connect.
 * - W < 960: the queue rail leaves the flex flow and becomes a 320px
 *   absolute overlay (right 0, shadow) opened from the header
 *   "Sweeps · n" toggle; Escape closes it and restores focus to the
 *   toggle. Subtraction, not squeeze.
 * - 390px embed iframe: media queries DO fire there — the stat band wraps
 *   2x2, the header drops the group line, and settlement lane end-labels
 *   shorten (max-width: 640px block in TEMPLATE_CSS).
 * Corner map: top-left Ledgerline mark + group/value-date line; top-right
 * desk-clock chip + base-currency chip + treasurer avatar; bottom-left
 * legend strip; bottom-right queue rail's action log (or the settlement
 * axis when the rail is the overlay).
 * Fixture policy: fixed strings and literal arrays only. Column totals,
 * row USD totals, the group total, concentration, trapped cash, and the
 * executable-sweep count all derive from the balances map at render;
 * executed-sweep timestamps come from a fixture time table indexed by
 * execution order, so replaying the same clicks always yields the same
 * log.
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
  ArrowDownToLineIcon,
  BanknoteIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  ClockIcon,
  LockIcon,
  LocateIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// with contrast math. Data-viz categorical tokens are not injected by the
// demo, so state colors carry repo-standard fallbacks.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (blue). #1D4ED8 on white = 6.7:1; #60A5FA on
// #1E1E1E = 6.6:1. Usages: Ledgerline mark, proposed sweep arrows +
// source-cell sweep dots, selected sweep card border.
const BRAND = 'light-dark(#1D4ED8, #60A5FA)';
const BRAND_SOFT = 'light-dark(rgba(29, 78, 216, 0.08), rgba(96, 165, 250, 0.14))';

// Settled / open-window green: #0B991F on white = 4.6:1; #34C759 on
// #1E1E1E = 8.1:1.
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const OK_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
// Closing-soon amber: #B45309 on white = 4.6:1; #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Deficit / cutoff-passed red: #DC2626 on white = 4.5:1; #F87171 on
// #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.15))';
// Restricted-jurisdiction hatch stripe (grey family — restriction is a
// status, not an alarm; the lock glyph is the second channel).
const HATCH_GREY = 'light-dark(rgba(60, 60, 67, 0.14), rgba(235, 235, 245, 0.16))';

// Single gutter token — all padding/margins on this page are GUTTER or
// GUTTER/2 = 6 (density-grid law).
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// SCOPED CSS — every selector prefixed with the tpl-treasury-cash-position
// scope class. Transitions animate color/opacity only and collapse under
// prefers-reduced-motion. The <=640px block is the 390px-embed contract.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.tpl-treasury-cash-position {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-treasury-cash-position .tcp-header-bar {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 48px;
  padding: 0 ${GUTTER}px;
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-group-line {
  display: flex;
  align-items: baseline;
  gap: ${GUTTER / 2}px;
  min-width: 0;
  overflow: hidden;
}
.tpl-treasury-cash-position .tcp-mono {
  font-family: ${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-treasury-cash-position .tcp-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-treasury-cash-position .tcp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  white-space: nowrap;
  color: var(--color-text-secondary);
  background: transparent;
}
.tpl-treasury-cash-position .tcp-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.tpl-treasury-cash-position .tcp-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
/* Stat band — 64px, four derived tiles. */
.tpl-treasury-cash-position .tcp-stat-band {
  display: flex;
  align-items: stretch;
  gap: ${GUTTER}px;
  height: 64px;
  padding: ${GUTTER / 2}px ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.tpl-treasury-cash-position .tcp-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-stat-value {
  font-family: ${MONO};
  font-size: 17px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* Matrix scrollport — the fade hint lives on this NON-scrolling wrapper. */
.tpl-treasury-cash-position .tcp-matrix-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-treasury-cash-position .tcp-scroller {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
}
.tpl-treasury-cash-position .tcp-scroll-hint {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 44px;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 3px;
  background: linear-gradient(to right, transparent, var(--color-background) 72%);
}
.tpl-treasury-cash-position .tcp-grid {
  position: relative;
  width: max-content;
  min-width: 100%;
}
.tpl-treasury-cash-position .tcp-grid-row {
  display: flex;
  align-items: stretch;
}
.tpl-treasury-cash-position .tcp-rail-cell {
  position: sticky;
  left: 0;
  z-index: 3;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 ${GUTTER}px;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-head-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 1px;
  height: 40px;
  padding: 0 ${GUTTER}px;
  flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.tpl-treasury-cash-position .tcp-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  height: 44px;
  padding: 0 ${GUTTER}px;
  flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  font-family: ${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.tpl-treasury-cash-position button.tcp-cell {
  appearance: none;
  border-left: none;
  border-top: none;
  border-right: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
}
.tpl-treasury-cash-position .tcp-cell-restricted {
  background-image: repeating-linear-gradient(
    45deg, ${HATCH_GREY} 0px, ${HATCH_GREY} 2px, transparent 2px, transparent 8px);
}
.tpl-treasury-cash-position .tcp-total-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 36px;
  padding: 0 ${GUTTER}px;
  flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
  font-family: ${MONO};
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: var(--color-background);
}
/* Settlement strip — 6 lanes x 18px + 18px axis. */
.tpl-treasury-cash-position .tcp-settle {
  flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
  padding: ${GUTTER / 2}px ${GUTTER}px;
}
.tpl-treasury-cash-position .tcp-lane {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  height: 18px;
}
.tpl-treasury-cash-position .tcp-lane-label {
  width: 108px;
  flex-shrink: 0;
  font-family: ${MONO};
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-treasury-cash-position .tcp-lane-track {
  position: relative;
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: visible;
}
.tpl-treasury-cash-position .tcp-lane-status {
  width: 148px;
  flex-shrink: 0;
  font-family: ${MONO};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}
/* Sweep queue rail. */
.tpl-treasury-cash-position .tcp-rail {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.tpl-treasury-cash-position .tcp-rail-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.tpl-treasury-cash-position .tcp-rail-head {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  height: 40px;
  padding: 0 ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.tpl-treasury-cash-position .tcp-rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${GUTTER}px;
}
.tpl-treasury-cash-position .tcp-sweep-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  padding: ${GUTTER / 2}px ${GUTTER}px ${GUTTER}px;
  margin-bottom: ${GUTTER}px;
  display: flex;
  flex-direction: column;
  gap: ${GUTTER / 2}px;
  min-height: 96px;
  cursor: pointer;
}
.tpl-treasury-cash-position .tcp-sweep-card[data-selected='true'] {
  border-color: ${BRAND};
  background: ${BRAND_SOFT};
}
.tpl-treasury-cash-position .tcp-sweep-head {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-window-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-treasury-cash-position .tcp-log-row {
  display: flex;
  align-items: baseline;
  gap: ${GUTTER / 2}px;
  min-height: 28px;
  padding: 3px 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
/* Legend strip — bottom-left corner owner, 32px. */
.tpl-treasury-cash-position .tcp-legend {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 32px;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}
.tpl-treasury-cash-position .tcp-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
/* Shared interactive plumbing. */
.tpl-treasury-cash-position button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.tpl-treasury-cash-position .tcp-fade {
  transition: color 160ms ease, background-color 160ms ease,
    border-color 160ms ease, opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-treasury-cash-position .tcp-fade {
    transition: none;
  }
}
.tpl-treasury-cash-position .tcp-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
/* 390px embed / full-screen phone. */
@media (max-width: 640px) {
  .tpl-treasury-cash-position .tcp-group-line {
    display: none;
  }
  .tpl-treasury-cash-position .tcp-stat-band {
    height: auto;
    flex-wrap: wrap;
  }
  .tpl-treasury-cash-position .tcp-stat {
    flex: 1 1 40%;
  }
  .tpl-treasury-cash-position .tcp-lane-status {
    width: 84px;
  }
  .tpl-treasury-cash-position .tcp-lane-label {
    width: 64px;
  }
}
`;

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Northwind Industrial Group, value date
// Wed 8 Jul 2026, desk clock frozen at 11:20 ET. All USD math uses the
// 07:30 ET rate card below; the cross-check arithmetic lives in @input.
// ---------------------------------------------------------------------------

type Ccy = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BRL' | 'CNY';

const CURRENCIES: Ccy[] = ['USD', 'EUR', 'GBP', 'JPY', 'BRL', 'CNY'];

// Treasury rate card, 07:30 ET fix — USD per unit of currency. Applied to
// every FX sweep so the group USD total is invariant under sweeping.
const RATES: Record<Ccy, number> = {
  USD: 1.0,
  EUR: 1.1,
  GBP: 1.3,
  JPY: 0.007,
  BRL: 0.2,
  CNY: 0.14,
};

// Identity consts — entities and sweeps are referenced by identity.
const E_NYC = 'E-NYC';
const E_FRA = 'E-FRA';
const E_AMS = 'E-AMS';
const E_LON = 'E-LON';
const E_TYO = 'E-TYO';
const E_SAO = 'E-SAO';
const E_SHA = 'E-SHA';

interface Entity {
  id: string;
  name: string;
  shortName: string; // sweep cards and log lines
  city: string;
  restricted?: string; // reason label; presence = restricted jurisdiction
}

// E-AMS's 46-char legal name is the sticky-rail truncation stress fixture.
const ENTITIES: Entity[] = [
  {id: E_NYC, name: 'Northwind Treasury Center LLC (NY IHB)', shortName: 'NY IHB', city: 'New York'},
  {id: E_FRA, name: 'Northwind Manufacturing GmbH', shortName: 'Frankfurt', city: 'Frankfurt'},
  {
    id: E_AMS,
    name: 'Northwind Advanced Materials Coöperatief U.A.',
    shortName: 'Amsterdam',
    city: 'Amsterdam',
  },
  {id: E_LON, name: 'Northwind UK Ltd', shortName: 'London', city: 'London'},
  {id: E_TYO, name: 'Northwind Japan KK', shortName: 'Tokyo', city: 'Tokyo'},
  {
    id: E_SAO,
    name: 'Northwind do Brasil Ltda',
    shortName: 'São Paulo',
    city: 'São Paulo',
    restricted: 'BCB registration required',
  },
  {
    id: E_SHA,
    name: 'Northwind (Shanghai) Trading Co., Ltd',
    shortName: 'Shanghai',
    city: 'Shanghai',
    restricted: 'SAFE quota applies',
  },
];

const ENTITY_INDEX = new Map(ENTITIES.map((e, i) => [e.id, i]));
const ENTITY_BY_ID = new Map(ENTITIES.map(e => [e.id, e]));

type Balances = Record<string, Partial<Record<Ccy, number>>>;

// Opening balances, native millions (arithmetic cross-checked in @input).
const INITIAL_BALANCES: Balances = {
  [E_NYC]: {USD: 42.6},
  [E_FRA]: {USD: 1.2, EUR: 9.4},
  [E_AMS]: {EUR: 5.8},
  [E_LON]: {USD: 0.8, GBP: 6.7},
  [E_TYO]: {USD: 0.4, JPY: 980},
  [E_SAO]: {USD: 0.6, BRL: 31.5},
  [E_SHA]: {CNY: 45.0},
};

// Operating floors (native millions). A cell AT its floor after a sweep
// renders the at-floor ring; BELOW a floor renders the deficit state —
// Tokyo's USD 0.40 vs a 1.00 floor is the seeded deficit stress fixture.
const FLOORS: Record<string, Partial<Record<Ccy, number>>> = {
  [E_FRA]: {EUR: 3.4},
  [E_AMS]: {EUR: 3.3},
  [E_LON]: {GBP: 3.2},
  [E_TYO]: {JPY: 580, USD: 1.0},
  [E_SAO]: {BRL: 13.5},
};

// ---------------------------------------------------------------------------
// Settlement windows — track domain 06:00–18:00 ET; fractions are
// (hour − 6) / 12 precomputed as literals. The desk clock is frozen at
// 11:20 ET -> NOW_FRAC = (11h20 − 6h) / 12h = 0.4444.
// ---------------------------------------------------------------------------

const NOW_LABEL = '11:20 ET';
const NOW_FRAC = 0.4444;

type WindowState = 'open' | 'closing' | 'closed';

interface SettlementWindow {
  ccy: Ccy;
  system: string;
  state: WindowState;
  openFrac: number; // clamped to track domain
  cutoffFrac: number;
  statusLine: string; // right-edge label
  shortStatus: string; // queue chips
}

const WINDOWS: SettlementWindow[] = [
  {ccy: 'USD', system: 'Fedwire', state: 'open', openFrac: 0.25, cutoffFrac: 1.0, statusLine: 'cutoff 18:00 · 6h40m left', shortStatus: 'open 6h40m'},
  {ccy: 'EUR', system: 'TARGET2', state: 'closing', openFrac: 0.0, cutoffFrac: 0.5, statusLine: 'cutoff 12:00 · 0h40m left', shortStatus: 'closes 0h40m'},
  {ccy: 'GBP', system: 'CHAPS', state: 'open', openFrac: 0.0, cutoffFrac: 0.6111, statusLine: 'cutoff 13:20 · 2h00m left', shortStatus: 'open 2h00m'},
  {ccy: 'JPY', system: 'BOJ-NET', state: 'closed', openFrac: 0.0, cutoffFrac: 0.0, statusLine: 'closed 03:00 · reopens 19:30', shortStatus: 'cutoff passed'},
  {ccy: 'BRL', system: 'SPB', state: 'open', openFrac: 0.1667, cutoffFrac: 0.9167, statusLine: 'cutoff 17:00 · 5h40m left', shortStatus: 'open 5h40m'},
  {ccy: 'CNY', system: 'CNAPS', state: 'closed', openFrac: 0.0, cutoffFrac: 0.0, statusLine: 'closed 04:30 · reopens 20:30', shortStatus: 'cutoff passed'},
];

const WINDOW_BY_CCY = new Map(WINDOWS.map(w => [w.ccy, w]));

// ---------------------------------------------------------------------------
// Sweeps — amount = source balance − operating floor; usdAmount = amount x
// rate-card rate (both stored as dual fields AND re-checkable from RATES).
// ---------------------------------------------------------------------------

type SweepStatus = 'proposed' | 'executed';

interface Sweep {
  id: string;
  srcEntityId: string;
  ccy: Ccy;
  amount: number; // native millions
  usdAmount: number; // = amount x RATES[ccy]
  note: string;
  gate?: 'cadoc'; // Brazil outbound requires CADOC confirmation
  status: SweepStatus;
  executedAt?: string; // fixture time, set on execution
}

const SWP_2201 = 'SWP-2201';
const SWP_2202 = 'SWP-2202';
const SWP_2203 = 'SWP-2203';
const SWP_2204 = 'SWP-2204';
const SWP_2205 = 'SWP-2205';

const INITIAL_SWEEPS: Sweep[] = [
  {
    id: SWP_2201,
    srcEntityId: E_FRA,
    ccy: 'EUR',
    amount: 6.0,
    usdAmount: 6.6,
    note: 'ZBA sweep to concentration target · leaves €3.40M operating floor',
    status: 'proposed',
  },
  {
    id: SWP_2202,
    srcEntityId: E_AMS,
    ccy: 'EUR',
    amount: 2.5,
    usdAmount: 2.75,
    note: 'Weekly pool sweep · leaves €3.30M operating floor',
    status: 'proposed',
  },
  {
    id: SWP_2203,
    srcEntityId: E_LON,
    ccy: 'GBP',
    amount: 3.5,
    usdAmount: 4.55,
    note: 'ZBA sweep · leaves £3.20M operating floor',
    status: 'proposed',
  },
  {
    id: SWP_2204,
    srcEntityId: E_TYO,
    ccy: 'JPY',
    amount: 400,
    usdAmount: 2.8,
    note: 'Quarterly repatriation · leaves ¥580M operating floor',
    status: 'proposed',
  },
  {
    id: SWP_2205,
    srcEntityId: E_SAO,
    ccy: 'BRL',
    amount: 18.0,
    usdAmount: 3.6,
    note: 'Intercompany dividend · CADOC registration BR-2214-C',
    gate: 'cadoc',
    status: 'proposed',
  },
];

// Fixture execution clock — indexed by how many sweeps have executed this
// session, so replaying the same clicks always yields the same log.
const EXEC_TIMES = ['11:21 ET', '11:22 ET', '11:24 ET', '11:26 ET', '11:29 ET'];

interface LogEntry {
  time: string;
  text: string;
}

// Pre-seeded morning history — teaches the log line format before any
// interaction happens.
const INITIAL_LOG: LogEntry[] = [
  {time: '09:02 ET', text: 'SWP-2198 executed · GBP 2.20M @ 1.3000 -> $2.86M · London -> NY IHB'},
  {time: '07:31 ET', text: 'Rate card refreshed (5 pairs) · desk operator O. Calloway'},
  {time: '06:45 ET', text: 'Prior-day reconciliation complete · 0 breaks'},
];

const TREASURER = {name: 'Owen Calloway', initials: 'OC'};
const GROUP_LINE = 'Northwind Industrial Group · value date Wed 8 Jul 2026';

// ---------------------------------------------------------------------------
// FORMATTING + DERIVATION — every stat on the page funnels through these.
// ---------------------------------------------------------------------------

function fmtNative(ccy: Ccy, value: number): string {
  return ccy === 'JPY' ? value.toFixed(0) : value.toFixed(2);
}

function fmtUsdM(value: number): string {
  return `$${value.toFixed(2)}M`;
}

function fmtPct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

function entityUsdTotal(balances: Balances, entityId: string): number {
  const row = balances[entityId] ?? {};
  return CURRENCIES.reduce((sum, ccy) => sum + (row[ccy] ?? 0) * RATES[ccy], 0);
}

function groupUsdTotal(balances: Balances): number {
  return ENTITIES.reduce((sum, e) => sum + entityUsdTotal(balances, e.id), 0);
}

function currencyColumnTotal(balances: Balances, ccy: Ccy): number {
  return ENTITIES.reduce((sum, e) => sum + (balances[e.id]?.[ccy] ?? 0), 0);
}

function trappedUsdTotal(balances: Balances): number {
  return ENTITIES.filter(e => e.restricted != null).reduce(
    (sum, e) => sum + entityUsdTotal(balances, e.id),
    0,
  );
}

type CellState = 'plain' | 'deficit' | 'at-floor' | 'sweep-source' | 'restricted';

function cellState(entity: Entity, ccy: Ccy, value: number, hasProposedSweep: boolean): CellState {
  const floor = FLOORS[entity.id]?.[ccy];
  if (floor != null && value < floor - 0.005) return 'deficit';
  if (hasProposedSweep) return 'sweep-source';
  if (floor != null && Math.abs(value - floor) <= 0.005) return 'at-floor';
  if (entity.restricted != null) return 'restricted';
  return 'plain';
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (house pattern; see the responsive
// contract in the header comment).
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
// LEDGERLINE MARK — 24px inline SVG: three ledger rules with a coin dot
// sliding onto the top line. Brand usage: mark.
// ---------------------------------------------------------------------------

function LedgerlineMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <line x1={4} y1={7} x2={20} y2={7} stroke={BRAND} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={4} y1={12} x2={16} y2={12} stroke={BRAND} strokeWidth={2.2} strokeLinecap="round" opacity={0.65} />
      <line x1={4} y1={17} x2={12} y2={17} stroke={BRAND} strokeWidth={2.2} strokeLinecap="round" opacity={0.4} />
      <circle cx={18.5} cy={16} r={3.2} fill="none" stroke={BRAND} strokeWidth={2} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MATRIX GEOMETRY — the density-grid numbers the CSS, the flex rows, AND
// the arrow overlay all share, so arrows land on cell centers by
// construction. Header row 40px, entity rows 44px, totals row 36px.
// ---------------------------------------------------------------------------

const HEAD_H = 40;
const ROW_H = 44;

interface MatrixGeometry {
  entityW: number;
  ccyW: number;
  showLegalNames: boolean;
}

function cellCenter(geometry: MatrixGeometry, rowIndex: number, ccy: Ccy): {x: number; y: number} {
  const colIndex = CURRENCIES.indexOf(ccy);
  return {
    x: geometry.entityW + colIndex * geometry.ccyW + geometry.ccyW / 2,
    y: HEAD_H + rowIndex * ROW_H + ROW_H / 2,
  };
}

// ---------------------------------------------------------------------------
// SweepArrowOverlay — fully custom SVG; the DS has no vocabulary for
// "money moves from this cell to that cell". Absolutely positioned INSIDE
// the matrix scroller so arrows pan with the cells they connect (the
// sticky entity rail intentionally floats above them, z-index 3 > 2).
// Proposed = dashed brand curve; executed = solid settled green at low
// opacity; blocked = dashed danger; selected = 3px stroke. Pointer-events
// none — the queue rail and source cells own interaction.
// ---------------------------------------------------------------------------

interface SweepArrowOverlayProps {
  sweeps: Sweep[];
  geometry: MatrixGeometry;
  selectedId: string | null;
  gridHeight: number;
  gridWidth: number;
}

function sweepArrowPath(geometry: MatrixGeometry, sweep: Sweep): string {
  const srcRow = ENTITY_INDEX.get(sweep.srcEntityId) ?? 0;
  const from = cellCenter(geometry, srcRow, sweep.ccy);
  const to = cellCenter(geometry, ENTITY_INDEX.get(E_NYC) ?? 0, 'USD');
  // Lift the curve toward the header band so long diagonals do not lie flat
  // across intermediate rows; end 12px short of the target center so the
  // arrowhead does not cover the balance figure.
  const endY = to.y + 14;
  const c1x = from.x;
  const c1y = Math.max(from.y - 70, to.y);
  const c2x = to.x + 40;
  const c2y = endY + 30;
  return `M ${from.x} ${from.y - 12} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x + 8} ${endY}`;
}

function SweepArrowOverlay({sweeps, geometry, selectedId, gridHeight, gridWidth}: SweepArrowOverlayProps) {
  return (
    <svg
      aria-hidden
      width={gridWidth}
      height={gridHeight}
      viewBox={`0 0 ${gridWidth} ${gridHeight}`}
      style={{position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none'}}>
      <defs>
        <marker
          id="tcp-arrowhead-brand"
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={7}
          markerHeight={7}
          orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={BRAND} />
        </marker>
        <marker
          id="tcp-arrowhead-danger"
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={7}
          markerHeight={7}
          orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={DANGER} />
        </marker>
      </defs>
      {sweeps.map(sweep => {
        const window = WINDOW_BY_CCY.get(sweep.ccy);
        const blocked = sweep.status === 'proposed' && window?.state === 'closed';
        const isSelected = selectedId === sweep.id;
        const stroke =
          sweep.status === 'executed' ? OK_GREEN : blocked ? DANGER : BRAND;
        return (
          <path
            key={sweep.id}
            className="tcp-fade"
            d={sweepArrowPath(geometry, sweep)}
            fill="none"
            stroke={stroke}
            strokeWidth={isSelected ? 3 : 1.75}
            strokeDasharray={sweep.status === 'executed' ? undefined : blocked ? '3 4' : '6 5'}
            opacity={sweep.status === 'executed' ? (isSelected ? 0.8 : 0.45) : isSelected ? 1 : 0.75}
            markerEnd={
              sweep.status === 'executed'
                ? undefined
                : blocked
                  ? 'url(#tcp-arrowhead-danger)'
                  : 'url(#tcp-arrowhead-brand)'
            }
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MatrixScrollport — non-scrolling wrapper that owns the right-edge fade +
// chevron whenever currency columns remain off-screen (a fade on the
// scroller itself would scroll away with the content). At the canonical
// demo band the grid is 814px in a ~745px scroller, so the hint is live.
// ---------------------------------------------------------------------------

function MatrixScrollport({children}: {children: ReactNode}) {
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
    <div className="tcp-matrix-viewport">
      <div ref={scrollerRef} className="tcp-scroller" onScroll={updateOverflow}>
        {children}
      </div>
      {canScrollRight ? (
        <div className="tcp-scroll-hint" aria-hidden>
          <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CashMatrix — entity x currency grid with sticky entity rail, per-cell
// state channels, live totals row, and the arrow overlay. Sweep-source
// cells are real <button>s that select their sweep in the queue rail.
// ---------------------------------------------------------------------------

interface CashMatrixProps {
  balances: Balances;
  sweeps: Sweep[];
  geometry: MatrixGeometry;
  selectedId: string | null;
  onSelectSweep: (id: string) => void;
}

function CashMatrix({balances, sweeps, geometry, selectedId, onSelectSweep}: CashMatrixProps) {
  const {entityW, ccyW, showLegalNames} = geometry;
  const gridWidth = entityW + CURRENCIES.length * ccyW;
  const gridHeight = HEAD_H + ENTITIES.length * ROW_H;
  const proposedByCell = new Map<string, Sweep>();
  for (const sweep of sweeps) {
    if (sweep.status === 'proposed') {
      proposedByCell.set(`${sweep.srcEntityId}:${sweep.ccy}`, sweep);
    }
  }
  const selectedSweep = sweeps.find(s => s.id === selectedId) ?? null;

  return (
    <div className="tcp-grid" role="table" aria-label="Entity by currency cash matrix, native millions">
      <SweepArrowOverlay
        sweeps={sweeps}
        geometry={geometry}
        selectedId={selectedId}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
      />
      {/* Header row */}
      <div className="tcp-grid-row" role="row">
        <div
          className="tcp-rail-cell"
          role="columnheader"
          style={{width: entityW, height: HEAD_H, zIndex: 4}}>
          <span className="tcp-section-label">Entity</span>
        </div>
        {CURRENCIES.map(ccy => {
          const window = WINDOW_BY_CCY.get(ccy);
          return (
            <div key={ccy} className="tcp-head-cell" role="columnheader" style={{width: ccyW}}>
              <span className="tcp-mono" style={{fontWeight: 600}}>
                {ccy}
              </span>
              <span
                className="tcp-mono"
                style={{
                  fontSize: 9,
                  color:
                    window?.state === 'closed'
                      ? DANGER
                      : window?.state === 'closing'
                        ? WARN
                        : 'var(--color-text-secondary)',
                }}>
                {window?.state === 'closed' ? 'closed' : window?.shortStatus}
              </span>
            </div>
          );
        })}
      </div>
      {/* Entity rows */}
      {ENTITIES.map(entity => {
        const row = balances[entity.id] ?? {};
        const isSweepRowSelected =
          selectedSweep != null &&
          (selectedSweep.srcEntityId === entity.id || entity.id === E_NYC);
        return (
          <div key={entity.id} className="tcp-grid-row" role="row">
            <div
              className="tcp-rail-cell"
              role="rowheader"
              style={{
                width: entityW,
                height: ROW_H,
                backgroundColor: isSweepRowSelected ? 'var(--color-background-muted)' : undefined,
              }}>
              {entity.restricted != null ? (
                <span title={entity.restricted} style={{display: 'inline-flex', flexShrink: 0, color: 'var(--color-text-secondary)'}}>
                  <LockIcon size={11} strokeWidth={2.5} aria-label={`Restricted — ${entity.restricted}`} />
                </span>
              ) : null}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: entity.id === E_NYC ? 600 : 400,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={entity.name}>
                {showLegalNames ? entity.name : entity.shortName}
              </span>
              <span style={{flex: 1}} aria-hidden />
              <span className="tcp-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                {fmtUsdM(entityUsdTotal(balances, entity.id))}
              </span>
            </div>
            {CURRENCIES.map(ccy => {
              const value = row[ccy];
              const sweep = value != null ? proposedByCell.get(`${entity.id}:${ccy}`) : undefined;
              const state = value != null ? cellState(entity, ccy, value, sweep != null) : 'plain';
              const isEndpoint =
                selectedSweep != null &&
                ((selectedSweep.srcEntityId === entity.id && selectedSweep.ccy === ccy) ||
                  (entity.id === E_NYC && ccy === 'USD'));
              const floor = FLOORS[entity.id]?.[ccy];
              const shared = {
                width: ccyW,
                boxShadow: isEndpoint
                  ? `inset 0 0 0 2px ${BRAND}`
                  : state === 'deficit'
                    ? `inset 0 0 0 1px ${DANGER}`
                    : state === 'at-floor'
                      ? `inset 0 0 0 1px ${OK_GREEN}`
                      : undefined,
              };
              const body =
                value == null ? (
                  <span aria-hidden style={{color: 'var(--color-text-secondary)', opacity: 0.5}}>
                    —
                  </span>
                ) : (
                  <>
                    <span style={{color: state === 'deficit' ? DANGER : undefined}}>
                      {fmtNative(ccy, value)}
                    </span>
                    {state === 'deficit' && floor != null ? (
                      <span style={{fontSize: 9, color: DANGER}}>
                        {`floor ${fmtNative(ccy, floor)}`}
                      </span>
                    ) : state === 'at-floor' ? (
                      <span style={{fontSize: 9, color: OK_GREEN}}>at floor</span>
                    ) : null}
                  </>
                );
              // Sweep-source cells are buttons: clicking a cell selects its
              // sweep so the queue card, arrow, and endpoints light together.
              return sweep != null && value != null ? (
                <button
                  key={ccy}
                  type="button"
                  role="cell"
                  className={`tcp-cell tcp-fade${entity.restricted != null ? ' tcp-cell-restricted' : ''}`}
                  style={shared}
                  aria-label={`${entity.shortName} ${ccy} ${fmtNative(ccy, value)} million — proposed sweep ${sweep.id}, select`}
                  aria-pressed={selectedId === sweep.id}
                  onClick={() => onSelectSweep(sweep.id)}>
                  {body}
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: BRAND,
                    }}
                  />
                </button>
              ) : (
                <div
                  key={ccy}
                  role="cell"
                  className={`tcp-cell${entity.restricted != null ? ' tcp-cell-restricted' : ''}`}
                  style={shared}
                  aria-label={
                    value == null
                      ? `${entity.shortName} holds no ${ccy}`
                      : `${entity.shortName} ${ccy} ${fmtNative(ccy, value)} million${state === 'deficit' ? ', below operating floor' : state === 'at-floor' ? ', at operating floor' : ''}`
                  }>
                  {body}
                </div>
              );
            })}
          </div>
        );
      })}
      {/* Totals row — derived live from the balances map. */}
      <div className="tcp-grid-row" role="row">
        <div
          className="tcp-rail-cell"
          role="rowheader"
          style={{width: entityW, height: 36, borderTop: 'var(--border-width) solid var(--color-border)'}}>
          <span className="tcp-section-label">Group total</span>
          <span style={{flex: 1}} aria-hidden />
          <span className="tcp-mono" style={{fontWeight: 600}}>
            {fmtUsdM(groupUsdTotal(balances))}
          </span>
        </div>
        {CURRENCIES.map(ccy => (
          <div key={ccy} className="tcp-total-cell" role="cell" style={{width: ccyW}}>
            {fmtNative(ccy, currencyColumnTotal(balances, ccy))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SettlementStrip — six 18px currency lanes over a 06:00–18:00 ET track
// with the frozen 11:20 now-line. Closed systems draw no bar and say why.
// aria-hidden geometry + a visually hidden text summary.
// ---------------------------------------------------------------------------

function SettlementStrip() {
  const summary = WINDOWS.map(w => `${w.ccy} ${w.system} ${w.statusLine}`).join('; ');
  return (
    <div className="tcp-settle" aria-label="Settlement windows">
      <div style={{display: 'flex', alignItems: 'center', gap: GUTTER / 2, height: 18}}>
        <span className="tcp-section-label">Settlement windows · 06:00–18:00 ET</span>
        <span style={{flex: 1}} aria-hidden />
        <span className="tcp-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
          {`now ${NOW_LABEL}`}
        </span>
      </div>
      <div style={{position: 'relative'}} aria-hidden>
        {WINDOWS.map(window => (
          <div key={window.ccy} className="tcp-lane">
            <span className="tcp-lane-label">{`${window.ccy} · ${window.system}`}</span>
            <span className="tcp-lane-track">
              {window.state !== 'closed' ? (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${window.openFrac * 100}%`,
                    width: `${(window.cutoffFrac - window.openFrac) * 100}%`,
                    borderRadius: 999,
                    backgroundColor: window.state === 'closing' ? WARN : OK_GREEN,
                    opacity: 0.55,
                  }}
                />
              ) : null}
            </span>
            <span
              className="tcp-lane-status"
              style={
                window.state === 'closed'
                  ? {color: DANGER}
                  : window.state === 'closing'
                    ? {color: WARN}
                    : undefined
              }>
              {window.statusLine}
            </span>
          </div>
        ))}
        {/* Frozen now-line spans all six lanes; offsets mirror the lane
            label (108+6) and status (148+6) columns. */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(114px + (100% - 114px - 154px) * ${NOW_FRAC})`,
            width: 2,
            backgroundColor: 'var(--color-text-primary)',
            opacity: 0.55,
          }}
        />
      </div>
      <span className="tcp-vh">{`Settlement windows as of ${NOW_LABEL}: ${summary}.`}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SweepQueue — the rail: executable sweep cards (window-gated, CADOC-gated)
// + the append-only action log. Presentational; execution lives in the page.
// ---------------------------------------------------------------------------

interface SweepQueueProps {
  width: number;
  isOverlay: boolean;
  sweeps: Sweep[];
  log: LogEntry[];
  selectedId: string | null;
  cadocConfirmed: boolean;
  executableCount: number;
  onSelect: (id: string) => void;
  onExecute: (id: string) => void;
  onExecuteAll: () => void;
  onCadocChange: (checked: boolean) => void;
  onClose: () => void;
}

function windowChip(window: SettlementWindow | undefined) {
  if (window == null) return null;
  const palette =
    window.state === 'closed'
      ? {backgroundColor: DANGER_SOFT, color: DANGER}
      : window.state === 'closing'
        ? {backgroundColor: WARN_SOFT, color: WARN}
        : {backgroundColor: OK_SOFT, color: OK_GREEN};
  return (
    <span className="tcp-window-chip" style={palette}>
      <ClockIcon size={10} strokeWidth={2.5} aria-hidden />
      {window.shortStatus}
    </span>
  );
}

function SweepQueue({
  width,
  isOverlay,
  sweeps,
  log,
  selectedId,
  cadocConfirmed,
  executableCount,
  onSelect,
  onExecute,
  onExecuteAll,
  onCadocChange,
  onClose,
}: SweepQueueProps) {
  const pending = sweeps.filter(s => s.status === 'proposed');
  const executed = sweeps.filter(s => s.status === 'executed');
  return (
    <aside
      className={`tcp-rail${isOverlay ? ' tcp-rail-overlay' : ''}`}
      style={{width}}
      aria-label="Sweep queue and action log">
      <div className="tcp-rail-head">
        <Icon icon={ArrowDownToLineIcon} size="sm" color="secondary" />
        {/* Semantic h2 stays in the outline; the visible label is sized for
            the 40px rail head. */}
        <h2 className="tcp-vh">Sweep queue</h2>
        <Text type="label" size="sm">
          Sweep queue
        </Text>
        <span style={{flex: 1}} aria-hidden />
        <Button
          label={`Execute all (${executableCount})`}
          variant="secondary"
          size="sm"
          isDisabled={executableCount === 0}
          icon={<Icon icon={ZapIcon} size="sm" />}
          onClick={onExecuteAll}
        />
        {isOverlay ? (
          <Button
            label="Close sweep queue"
            isIconOnly
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className="tcp-rail-scroll">
        {pending.length === 0 ? (
          <div style={{padding: `${GUTTER}px 0`}}>
            <Text type="supporting" size="xsm" color="secondary">
              Queue clear — every window-eligible sweep has settled. The JPY
              repatriation re-queues when BOJ-NET reopens at 19:30 ET.
            </Text>
          </div>
        ) : null}
        {pending.map(sweep => {
          const entity = ENTITY_BY_ID.get(sweep.srcEntityId);
          const window = WINDOW_BY_CCY.get(sweep.ccy);
          const blocked = window?.state === 'closed';
          const gated = sweep.gate === 'cadoc' && !cadocConfirmed;
          const isSelected = selectedId === sweep.id;
          return (
            // The card is NOT itself a button (it contains real interactive
            // children); the Locate icon-button and the matrix source cell
            // are the two accessible selection affordances. The card
            // onClick is a pointer convenience that mirrors them.
            <div
              key={sweep.id}
              className="tcp-sweep-card tcp-fade"
              data-selected={isSelected}
              onClick={() => onSelect(sweep.id)}>
              <div className="tcp-sweep-head">
                <span className="tcp-mono" style={{fontWeight: 600}}>
                  {sweep.id}
                </span>
                {windowChip(window)}
                <span style={{flex: 1}} aria-hidden />
                {sweep.gate === 'cadoc' ? (
                  <Token size="sm" color={cadocConfirmed ? 'green' : 'gray'} label="CADOC" />
                ) : null}
                <span onClick={event => event.stopPropagation()}>
                  <Button
                    label={`${isSelected ? 'Deselect' : 'Locate'} ${sweep.id} in the matrix`}
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={LocateIcon} size="sm" />}
                    onClick={() => onSelect(sweep.id)}
                  />
                </span>
              </div>
              <span className="tcp-mono" style={{fontSize: 12}}>
                {`${entity?.shortName} -> NY IHB · ${sweep.ccy} ${fmtNative(sweep.ccy, sweep.amount)}M @ ${RATES[sweep.ccy].toFixed(4)} -> ${fmtUsdM(sweep.usdAmount)}`}
              </span>
              <Text type="supporting" size="xsm" color="secondary" maxLines={2}>
                {sweep.note}
              </Text>
              {sweep.gate === 'cadoc' ? (
                <div onClick={event => event.stopPropagation()}>
                  <CheckboxInput
                    label="CADOC BR-2214-C confirmed on file"
                    value={cadocConfirmed}
                    onChange={onCadocChange}
                  />
                </div>
              ) : null}
              {blocked ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 6, color: DANGER}}>
                  <CircleAlertIcon size={12} strokeWidth={2.5} aria-hidden />
                  <Text type="supporting" size="xsm" color="inherit" maxLines={2}>
                    BOJ-NET cutoff passed 03:00 ET — resubmit after the 19:30 ET reopen.
                  </Text>
                </div>
              ) : (
                <div onClick={event => event.stopPropagation()}>
                  <Button
                    label={gated ? 'Confirm CADOC to execute' : `Execute ${sweep.id}`}
                    variant="primary"
                    size="sm"
                    isDisabled={gated}
                    onClick={() => onExecute(sweep.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
        {executed.length > 0 ? (
          <>
            <span className="tcp-section-label">Settled this session</span>
            {executed.map(sweep => {
              const entity = ENTITY_BY_ID.get(sweep.srcEntityId);
              return (
                <div
                  key={sweep.id}
                  style={{display: 'flex', alignItems: 'center', gap: 6, minHeight: 32}}>
                  <CheckIcon size={13} strokeWidth={3} color={OK_GREEN} aria-hidden />
                  <span className="tcp-mono" style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
                    {`${sweep.id} · ${entity?.shortName} · ${fmtUsdM(sweep.usdAmount)} · ${sweep.executedAt ?? ''}`}
                  </span>
                </div>
              );
            })}
            <div style={{height: GUTTER / 2}} aria-hidden />
          </>
        ) : null}
        <span className="tcp-section-label">Action log</span>
        <div role="log" aria-label="Treasury action log">
          {log.map((entry, index) => (
            <div key={`${entry.time}-${index}`} className="tcp-log-row">
              <span className="tcp-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)', flexShrink: 0}}>
                {entry.time}
              </span>
              <span style={{fontSize: 11, minWidth: 0}}>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// LEGEND — cell/arrow encoding key, 32px strip. Bottom-left corner owner.
// ---------------------------------------------------------------------------

function LegendStrip() {
  return (
    <div className="tcp-legend" aria-label="Matrix encoding legend">
      <span className="tcp-legend-key">
        <span aria-hidden style={{width: 6, height: 6, borderRadius: 999, backgroundColor: BRAND}} />
        <Text type="supporting" size="xsm" color="secondary">
          Proposed sweep source
        </Text>
      </span>
      <span className="tcp-legend-key">
        <svg width={20} height={8} aria-hidden>
          <line x1={0} y1={4} x2={20} y2={4} stroke={BRAND} strokeWidth={1.75} strokeDasharray="6 5" />
        </svg>
        <Text type="supporting" size="xsm" color="secondary">
          Pending
        </Text>
      </span>
      <span className="tcp-legend-key">
        <svg width={20} height={8} aria-hidden>
          <line x1={0} y1={4} x2={20} y2={4} stroke={OK_GREEN} strokeWidth={1.75} opacity={0.6} />
        </svg>
        <Text type="supporting" size="xsm" color="secondary">
          Settled
        </Text>
      </span>
      <span className="tcp-legend-key">
        <span aria-hidden style={{width: 10, height: 10, boxShadow: `inset 0 0 0 1px ${DANGER}`}} />
        <Text type="supporting" size="xsm" color="secondary">
          Below floor
        </Text>
      </span>
      <span className="tcp-legend-key">
        <span aria-hidden style={{width: 10, height: 10, boxShadow: `inset 0 0 0 1px ${OK_GREEN}`}} />
        <Text type="supporting" size="xsm" color="secondary">
          At floor
        </Text>
      </span>
      <span className="tcp-legend-key">
        <span
          aria-hidden
          style={{
            width: 14,
            height: 10,
            border: 'var(--border-width) solid var(--color-border)',
            backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_GREY} 0px, ${HATCH_GREY} 2px, transparent 2px, transparent 5px)`,
          }}
        />
        <Text type="supporting" size="xsm" color="secondary">
          Restricted jurisdiction
        </Text>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. One executeSweep mutation moves money in the
// balances map; the matrix cells, column totals, arrows, stat band,
// executed list, and action log all re-derive from the same update.
// ---------------------------------------------------------------------------

interface TreasuryState {
  balances: Balances;
  sweeps: Sweep[];
  log: LogEntry[];
  execCount: number; // indexes EXEC_TIMES
}

const INITIAL_STATE: TreasuryState = {
  balances: INITIAL_BALANCES,
  sweeps: INITIAL_SWEEPS,
  log: INITIAL_LOG,
  execCount: 0,
};

/** Applies one sweep to a state snapshot; shared by execute and execute-all. */
function settleSweep(state: TreasuryState, sweepId: string): TreasuryState {
  const sweep = state.sweeps.find(s => s.id === sweepId);
  if (sweep == null || sweep.status !== 'proposed') return state;
  const entity = ENTITY_BY_ID.get(sweep.srcEntityId);
  const time = EXEC_TIMES[Math.min(state.execCount, EXEC_TIMES.length - 1)];
  const srcRow = {...(state.balances[sweep.srcEntityId] ?? {})};
  const hqRow = {...(state.balances[E_NYC] ?? {})};
  srcRow[sweep.ccy] = Math.round(((srcRow[sweep.ccy] ?? 0) - sweep.amount) * 100) / 100;
  hqRow.USD = Math.round(((hqRow.USD ?? 0) + sweep.usdAmount) * 100) / 100;
  return {
    balances: {...state.balances, [sweep.srcEntityId]: srcRow, [E_NYC]: hqRow},
    sweeps: state.sweeps.map(s =>
      s.id === sweepId ? {...s, status: 'executed' as const, executedAt: time} : s,
    ),
    log: [
      {
        time,
        text: `${sweep.id} executed · ${sweep.ccy} ${fmtNative(sweep.ccy, sweep.amount)}M @ ${RATES[sweep.ccy].toFixed(4)} -> ${fmtUsdM(sweep.usdAmount)} · ${entity?.shortName ?? sweep.srcEntityId} -> NY IHB`,
      },
      ...state.log,
    ],
    execCount: state.execCount + 1,
  };
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

export default function TreasuryCashPositionTemplate() {
  // Responsive bands measured on the VIEW ROOT container (see the
  // responsive contract in the header comment). Width 0 = first
  // pre-observer frame; viewport queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1279px)');
  const isViewportNarrow = useMediaQuery('(max-width: 1023px)');
  const isMid = viewWidth > 0 ? viewWidth < 1180 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 960 : isViewportNarrow;

  const geometry: MatrixGeometry = isMid
    ? {entityW: 190, ccyW: 104, showLegalNames: false}
    : {entityW: 210, ccyW: 112, showLegalNames: true};
  const railWidth = isNarrow ? 320 : isMid ? 300 : 340;

  // ---- THE single state owner ---------------------------------------------
  const [treasury, setTreasury] = useState<TreasuryState>(INITIAL_STATE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cadocConfirmed, setCadocConfirmed] = useState(false);
  const [railOpen, setRailOpen] = useState(false); // narrow band only
  const [announcement, setAnnouncement] = useState('');
  const railToggleRef = useRef<HTMLButtonElement | null>(null);

  // ---- Derived aggregates (all computed from the balances map) -------------
  const total = groupUsdTotal(treasury.balances);
  const hqUsd = treasury.balances[E_NYC]?.USD ?? 0;
  const concentration = total > 0 ? hqUsd / total : 0;
  const trapped = trappedUsdTotal(treasury.balances);
  const pendingSweeps = treasury.sweeps.filter(s => s.status === 'proposed');
  const isExecutable = useCallback(
    (sweep: Sweep) =>
      sweep.status === 'proposed' &&
      WINDOW_BY_CCY.get(sweep.ccy)?.state !== 'closed' &&
      (sweep.gate !== 'cadoc' || cadocConfirmed),
    [cadocConfirmed],
  );
  const executableCount = pendingSweeps.filter(isExecutable).length;
  const blockedCount = pendingSweeps.filter(
    s => WINDOW_BY_CCY.get(s.ccy)?.state === 'closed',
  ).length;
  const gatedCount = pendingSweeps.filter(
    s => s.gate === 'cadoc' && !cadocConfirmed && WINDOW_BY_CCY.get(s.ccy)?.state !== 'closed',
  ).length;

  const executeSweep = useCallback(
    (sweepId: string) => {
      const sweep = treasury.sweeps.find(s => s.id === sweepId);
      if (sweep == null || !isExecutable(sweep)) return;
      const entity = ENTITY_BY_ID.get(sweep.srcEntityId);
      setTreasury(prev => settleSweep(prev, sweepId));
      // Post-sweep concentration, announced from the same arithmetic the
      // stat band derives (total is invariant under rate-card FX).
      const nextConcentration = total > 0 ? (hqUsd + sweep.usdAmount) / total : 0;
      setAnnouncement(
        `${sweep.id} executed: ${sweep.ccy} ${fmtNative(sweep.ccy, sweep.amount)} million swept from ${entity?.shortName ?? 'source'} to the in-house bank. Concentration now ${fmtPct(nextConcentration)}.`,
      );
    },
    [treasury.sweeps, isExecutable, total, hqUsd],
  );

  const executeAll = useCallback(() => {
    const runnable = treasury.sweeps.filter(isExecutable);
    if (runnable.length === 0) return;
    setTreasury(prev =>
      runnable.reduce((state, sweep) => settleSweep(state, sweep.id), prev),
    );
    const movedUsd = runnable.reduce((sum, s) => sum + s.usdAmount, 0);
    const nextConcentration = total > 0 ? (hqUsd + movedUsd) / total : 0;
    setAnnouncement(
      `${runnable.length} sweeps executed, ${fmtUsdM(movedUsd)} concentrated to the in-house bank. Concentration now ${fmtPct(nextConcentration)}.`,
    );
  }, [treasury.sweeps, isExecutable, total, hqUsd]);

  const selectSweep = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const closeRail = useCallback(() => {
    setRailOpen(false);
    railToggleRef.current?.focus();
  }, []);

  // Escape layering: overlay rail closes first (focus restored to the
  // toggle), then any sweep selection clears.
  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || isTypingTarget(event.target)) return;
    if (isNarrow && railOpen) {
      closeRail();
    } else if (selectedId != null) {
      setSelectedId(null);
    }
  };

  const railVisible = !isNarrow || railOpen;

  return (
    <div className="tpl-treasury-cash-position" onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <span aria-live="polite" role="status" className="tcp-vh">
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div className="tcp-header-bar">
              {/* Top-left corner: Ledgerline mark + group/value-date line. */}
              <LedgerlineMark />
              <Text type="label" size="sm">
                Ledgerline
              </Text>
              {/* Semantic page title lives in the outline; the visible line
                  is sized for the 48px bar. */}
              <h1 className="tcp-vh">Ledgerline treasury cash position — Northwind Industrial Group</h1>
              <div className="tcp-group-line">
                <Text type="label" size="sm" maxLines={1}>
                  Cash position
                </Text>
                <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                  {GROUP_LINE}
                </Text>
              </div>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: frozen desk clock + base currency +
                  (narrow band) queue toggle + treasurer avatar. */}
              <span className="tcp-chip">
                <ClockIcon size={12} aria-hidden />
                <span className="tcp-mono" style={{color: 'inherit'}}>
                  {NOW_LABEL}
                </span>
              </span>
              <span className="tcp-chip">
                <BanknoteIcon size={12} aria-hidden />
                Base USD
              </span>
              {isNarrow ? (
                <button
                  type="button"
                  ref={railToggleRef}
                  className="tcp-chip tcp-fade"
                  style={{cursor: 'pointer', fontFamily: 'inherit'}}
                  aria-expanded={railOpen}
                  onClick={() => setRailOpen(prev => !prev)}>
                  <ArrowDownToLineIcon size={12} aria-hidden />
                  {`Sweeps · ${pendingSweeps.length}`}
                </button>
              ) : null}
              <Avatar name={TREASURER.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} className="tcp-view-root">
              <div className="tcp-main-col">
                {/* Stat band — every figure derives from the balances map. */}
                <div className="tcp-stat-band">
                  <div className="tcp-stat" style={{minWidth: 128}}>
                    <span className="tcp-section-label">Group position</span>
                    <span className="tcp-stat-value">{fmtUsdM(total)}</span>
                  </div>
                  <div className="tcp-stat" style={{minWidth: 148}}>
                    <span className="tcp-section-label">IHB concentration</span>
                    <span className="tcp-stat-value tcp-fade">
                      {fmtPct(concentration)}
                      <span style={{fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)'}}>
                        {` · ${fmtUsdM(hqUsd)}`}
                      </span>
                    </span>
                  </div>
                  <div className="tcp-stat" style={{minWidth: 128}}>
                    <span className="tcp-section-label">Trapped cash</span>
                    <span className="tcp-stat-value tcp-fade" style={{color: trapped > 10 ? WARN : undefined}}>
                      {fmtUsdM(trapped)}
                      <span style={{fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)'}}>
                        {` · ${fmtPct(total > 0 ? trapped / total : 0)}`}
                      </span>
                    </span>
                  </div>
                  <div className="tcp-stat" style={{minWidth: 148}}>
                    <span className="tcp-section-label">Sweeps pending</span>
                    <span className="tcp-stat-value">
                      {pendingSweeps.length}
                      <span style={{fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)'}}>
                        {` · ${executableCount} ready · ${gatedCount} gated · ${blockedCount} blocked`}
                      </span>
                    </span>
                  </div>
                  <span style={{flex: 1}} aria-hidden />
                  <div className="tcp-stat" style={{alignItems: 'flex-end'}}>
                    <span className="tcp-section-label">Rate card 07:30 ET</span>
                    <span className="tcp-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                      EUR 1.1000 · GBP 1.3000 · JPY 0.0070
                    </span>
                    <span className="tcp-mono" style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
                      BRL 0.2000 · CNY 0.1400
                    </span>
                  </div>
                </div>
                <MatrixScrollport>
                  <CashMatrix
                    balances={treasury.balances}
                    sweeps={treasury.sweeps}
                    geometry={geometry}
                    selectedId={selectedId}
                    onSelectSweep={selectSweep}
                  />
                </MatrixScrollport>
                <SettlementStrip />
                <LegendStrip />
              </div>
              {railVisible ? (
                <SweepQueue
                  width={railWidth}
                  isOverlay={isNarrow}
                  sweeps={treasury.sweeps}
                  log={treasury.log}
                  selectedId={selectedId}
                  cadocConfirmed={cadocConfirmed}
                  executableCount={executableCount}
                  onSelect={selectSweep}
                  onExecute={executeSweep}
                  onExecuteAll={executeAll}
                  onCadocChange={setCadocConfirmed}
                  onClose={closeRail}
                />
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
