// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Keyline Radio contest cockpit
 *   frozen mid-session at 'CQ WW SSB · Sat 11:00–12:00Z' (a string const,
 *   never a clock): a 24-entry longest-prefix DXCC table, 25 station
 *   identity consts (STATIONS.K3LR … STATIONS.VP8_G4XYZ_P), a 14-QSO seed
 *   log with dual fields (timeDisplay '11:38Z' + minutesUtc 698), a
 *   44-entry prior-multiplier map from earlier in the contest, and an
 *   ordered 12-spot fixture bandmap the whole demo replays from. No
 *   Date.now, no Math.random, no network assets.
 * @output Ham Contest Logger — a keystroke-driven QSO logging cockpit
 *   where every commit is scored: a 44px header bar (KeylineMark +
 *   wordmark + contest chip; band segments 160/80/40/20/15/10, CW/SSB
 *   toggle, live score readout), an 88px entry bar whose
 *   CallsignResolverField hosts progressive prefix resolution inside its
 *   own chrome (entity badge, CQ-zone badge, continent glyph) with
 *   whole-field dupe/new-mult tinting, a 32px-row log table with sticky
 *   28px column header and 28px summary footer, and a 380px rail:
 *   240-cell multiplier bitfield, 180px dual-needle beam dial with
 *   grayline arc, and an 84/hr rate meter pinned at rail bottom.
 * @position Page template; emitted by `astryx template ham-contest-logger`
 *
 * Frame: root 100dvh div > Layout height="fill" > LayoutContent(0) >
 *   view root (flex row, height 100%, minHeight 0, overflow hidden) >
 *   [ main column: 44px header bar > 88px entry bar > scrollable log
 *     (flex 1, minHeight 0) > 28px sticky summary footer ] +
 *   [ aside 380px, flexShrink 0, borderLeft, own scroll, 12px padding:
 *     MultiplierGrid panel > BeamHeadingDial panel > RateMeter card
 *     pinned at rail bottom via marginTop auto ].
 * Container policy: dense-cockpit archetype — the main column is frame
 *   rows and a role=table log, all styled divs/buttons; the only Card on
 *   the page is the RateMeter (a thin DS Card wrapper). No card-grid.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (#D97A1F as a light-dark pair) used as a runtime value for the mark,
 *   needles, worked cells, and the newest-row accent; BRAND_TEXT is a
 *   separate darker pair for brand-tinted text (contrast math at the
 *   const). Dupe-red and mult-amber washes are declared once as
 *   light-dark pairs. Transitions animate transform/color only and
 *   collapse under prefers-reduced-motion.
 *
 * DENSITY GRID (fixed, repeat verbatim everywhere): 44px header bar;
 * 88px entry bar; 32px log table rows; 28px sticky log footer; 380px
 * right rail (12px inner padding, 356px inner width); 16px multiplier
 * cells with 1px gap; 180px beam dial diameter; 12px gutter token
 * (--gutter: 12px) used for all inter-panel spacing. No other spacing
 * constants may be invented.
 *
 * Corner map: top-left KeylineMark + wordmark + contest chip; top-right
 * band segments + mode toggle + '2,209 pts'; bottom-left the sticky 28px
 * footer '14 QSOs · 47 mults · 21 pts × 47 = 2,209' (arithmetically
 * equal to the top-right score by construction — both derive from the
 * same store); bottom-right the RateMeter pinned at rail bottom.
 *
 * Responsive contract (subtraction, not reflow — breakpoint 1120px):
 * - > 1120px: full frame with the 380px rail.
 * - <= 1120px: the entire rail is REMOVED (MultiplierGrid,
 *   BeamHeadingDial, RateMeter gone — no stacking); the header gains one
 *   compact 'Mults 47 · 84/hr' chip so the score story survives; the
 *   entry bar, log table, and footer keep their exact 44/88/32/28px
 *   metrics and column widths; the log region scrolls horizontally when
 *   narrower than 620px. Nothing moves position; things only disappear.
 *
 * A11y: one polite live region fed by store.announce (dupe typing and
 * every commit are announced with real derived numbers); the resolver
 * has a real <label> and conveys DUPE/NEW MULT as text, never color
 * alone; the log is role=table with button rows carrying full
 * aria-labels; the bitfield is role=grid with per-cell worked/needed
 * labels; the dial is role=img with a full-sentence label; focus returns
 * to the callsign input after every commit and row re-arm; Escape in the
 * callsign field wipes the entry; :focus-visible rings via GLOBAL_CSS.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react';

import {ChevronRightIcon, SparklesIcon} from 'lucide-react';

import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue).
// ---------------------------------------------------------------------------

// The ONE quarantined brand literal — Keyline orange, used as a runtime FILL
// value only (mark lever, worked cells, needles, newest-row accent).
const BRAND = 'light-dark(#D97A1F, #E8955A)';
// Brand-tinted TEXT is a different value: #8F4E0E on white = 5.6:1,
// #F0A468 on #1E1E1E = 7.9:1 — both pass 4.5:1.
const BRAND_TEXT = 'light-dark(#8F4E0E, #F0A468)';
// Worked multiplier cells: brand at 85% per spec, derived from the single
// quarantined literal so the hex is declared exactly once.
const BRAND_FILL_85 = `color-mix(in srgb, ${BRAND} 85%, transparent)`;
// Dupe (red) family: text #B91C1C on the 10% wash = 5.9:1; #FCA5A5 on
// #1E1E1E = 8.9:1.
const DUPE_BG = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.16))';
const DUPE_BORDER = 'light-dark(#DC2626, #F87171)';
const DUPE_TEXT = 'light-dark(#B91C1C, #FCA5A5)';
// New-mult (amber) family: text #92400E on the 14% wash = 6.5:1; #FCD34D
// on #1E1E1E = 10.9:1.
const MULT_BG = 'light-dark(rgba(217, 119, 6, 0.14), rgba(251, 191, 36, 0.16))';
const MULT_BORDER = 'light-dark(#D97706, #FBBF24)';
const MULT_TEXT = 'light-dark(#92400E, #FCD34D)';
// Grayline arc on the beam dial — slate-300 at ~50%, fixed fixture band.
const GRAYLINE = 'light-dark(rgba(148, 163, 184, 0.5), rgba(148, 163, 184, 0.38))';
// Zone digit sits on the BRAND_FILL_85 cell: white on #D97A1F = 4.6:1
// (8px bold decorative digit; the zone is also in the cell's aria-label).
const CELL_DIGIT = 'light-dark(#FFFFFF, #241203)';

// ---------------------------------------------------------------------------
// GLOBAL CSS — :focus-visible rings (unreachable from inline style objects),
// the 600ms mult-cell pop, the 900ms row flash, and the 220ms needle sweep.
// All of it animates transform/color only and collapses under
// prefers-reduced-motion (cell keeps its static amber ring; row and needle
// snap instantly).
// ---------------------------------------------------------------------------

const GLOBAL_CSS = `
@keyframes hcl-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.35); }
  100% { transform: scale(1); }
}
.hcl-just-lit { animation: hcl-pop 600ms ease-out; }
@keyframes hcl-row-flash {
  0% { background-color: ${MULT_BG}; }
  100% { background-color: transparent; }
}
.hcl-row-flash { animation: hcl-row-flash 900ms ease-out; }
.hcl-needle { transition: transform 220ms ease; }
.hcl-btn:focus-visible,
.hcl-cell:focus-visible,
.hcl-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
  z-index: 2;
}
.hcl-call-input:focus { outline: none; }
@media (prefers-reduced-motion: reduce) {
  .hcl-just-lit, .hcl-row-flash { animation: none; }
  .hcl-needle { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// FIXTURES — the whole session replays from these consts. The demo's frozen
// session is 'CQ WW SSB · Sat 11:00–12:00Z'; its internal "now" is 11:39Z
// (minutesUtc 699) and every commit stamps that fixture minute. No clocks.
// ---------------------------------------------------------------------------

type Band = '160m' | '80m' | '40m' | '20m' | '15m' | '10m';
type Mode = 'CW' | 'SSB';
type Continent = 'EU' | 'NA' | 'SA' | 'AS' | 'AF' | 'OC';

const BANDS: Band[] = ['160m', '80m', '40m', '20m', '15m', '10m'];
const BAND_WORDS: Record<Band, string> = {
  '160m': '160 meters',
  '80m': '80 meters',
  '40m': '40 meters',
  '20m': '20 meters',
  '15m': '15 meters',
  '10m': '10 meters',
};

const CONTEST_LABEL = 'CQ WW SSB · Sat 11:00–12:00Z';
// Frozen commit stamp — the fixture "now". Bucket window below covers
// minutesUtc 690–699 (11:30Z–11:39Z), so every demo commit lands in the
// last (initially zero-height) rate bar.
const COMMIT_TIME = {timeDisplay: '11:39Z', minutesUtc: 699};
const BUCKET_START = 690; // 11:30Z

interface PrefixEntry {
  prefix: string;
  entityAbbr: string;
  entityName: string;
  continent: Continent;
  zone: number;
  bearingSpDeg: number;
  bearingLpDeg: number;
}

// 24-entry longest-prefix table. 'KL7' and 'UA9' exist to exercise the
// longest-prefix rule over 'K' and 'UA'; 'E7' carries the 18-char
// 'Bosnia-Herzegovina' entityName that truncates in the dial center block.
const PREFIXES: PrefixEntry[] = [
  {prefix: 'K', entityAbbr: 'K', entityName: 'United States', continent: 'NA', zone: 5, bearingSpDeg: 292, bearingLpDeg: 112},
  {prefix: 'KL7', entityAbbr: 'KL', entityName: 'Alaska', continent: 'NA', zone: 1, bearingSpDeg: 325, bearingLpDeg: 145},
  {prefix: 'VE', entityAbbr: 'VE', entityName: 'Canada', continent: 'NA', zone: 5, bearingSpDeg: 350, bearingLpDeg: 170},
  {prefix: 'XE', entityAbbr: 'XE', entityName: 'Mexico', continent: 'NA', zone: 6, bearingSpDeg: 235, bearingLpDeg: 55},
  {prefix: 'DL', entityAbbr: 'DL', entityName: 'Germany', continent: 'EU', zone: 14, bearingSpDeg: 45, bearingLpDeg: 225},
  {prefix: 'G', entityAbbr: 'G', entityName: 'England', continent: 'EU', zone: 14, bearingSpDeg: 51, bearingLpDeg: 231},
  {prefix: 'F', entityAbbr: 'F', entityName: 'France', continent: 'EU', zone: 14, bearingSpDeg: 53, bearingLpDeg: 233},
  {prefix: 'EA', entityAbbr: 'EA', entityName: 'Spain', continent: 'EU', zone: 14, bearingSpDeg: 68, bearingLpDeg: 248},
  {prefix: 'I', entityAbbr: 'I', entityName: 'Italy', continent: 'EU', zone: 15, bearingSpDeg: 58, bearingLpDeg: 238},
  {prefix: 'E7', entityAbbr: 'E7', entityName: 'Bosnia-Herzegovina', continent: 'EU', zone: 15, bearingSpDeg: 52, bearingLpDeg: 232},
  {prefix: 'OH', entityAbbr: 'OH', entityName: 'Finland', continent: 'EU', zone: 15, bearingSpDeg: 35, bearingLpDeg: 215},
  {prefix: 'TF', entityAbbr: 'TF', entityName: 'Iceland', continent: 'EU', zone: 40, bearingSpDeg: 22, bearingLpDeg: 202},
  {prefix: 'UA', entityAbbr: 'UA', entityName: 'European Russia', continent: 'EU', zone: 16, bearingSpDeg: 28, bearingLpDeg: 208},
  {prefix: 'UA9', entityAbbr: 'UA9', entityName: 'Asiatic Russia', continent: 'AS', zone: 17, bearingSpDeg: 12, bearingLpDeg: 192},
  {prefix: 'JA', entityAbbr: 'JA', entityName: 'Japan', continent: 'AS', zone: 25, bearingSpDeg: 330, bearingLpDeg: 150},
  {prefix: 'HL', entityAbbr: 'HL', entityName: 'South Korea', continent: 'AS', zone: 25, bearingSpDeg: 335, bearingLpDeg: 155},
  {prefix: '9M', entityAbbr: '9M', entityName: 'West Malaysia', continent: 'AS', zone: 28, bearingSpDeg: 315, bearingLpDeg: 135},
  {prefix: 'VK', entityAbbr: 'VK', entityName: 'Australia', continent: 'OC', zone: 30, bearingSpDeg: 260, bearingLpDeg: 80},
  {prefix: 'ZL', entityAbbr: 'ZL', entityName: 'New Zealand', continent: 'OC', zone: 32, bearingSpDeg: 42, bearingLpDeg: 222},
  {prefix: 'PY', entityAbbr: 'PY', entityName: 'Brazil', continent: 'SA', zone: 11, bearingSpDeg: 148, bearingLpDeg: 328},
  {prefix: 'LU', entityAbbr: 'LU', entityName: 'Argentina', continent: 'SA', zone: 13, bearingSpDeg: 155, bearingLpDeg: 335},
  {prefix: 'VP8', entityAbbr: 'VP8', entityName: 'Falkland Is.', continent: 'SA', zone: 13, bearingSpDeg: 160, bearingLpDeg: 340},
  {prefix: '5N', entityAbbr: '5N', entityName: 'Nigeria', continent: 'AF', zone: 35, bearingSpDeg: 95, bearingLpDeg: 275},
  {prefix: 'ZS', entityAbbr: 'ZS', entityName: 'South Africa', continent: 'AF', zone: 38, bearingSpDeg: 110, bearingLpDeg: 290},
];

const PREFIXES_BY_LENGTH = [...PREFIXES].sort(
  (a, b) => b.prefix.length - a.prefix.length,
);

/** Longest-prefix resolution — purely derived, re-runs on every keystroke.
 * 'VP8/G4XYZ/P' resolves through 'VP8'; 'UA9BA' picks 'UA9' over 'UA'. */
function longestPrefixMatch(call: string): PrefixEntry | null {
  if (call.length === 0) return null;
  return PREFIXES_BY_LENGTH.find(p => call.startsWith(p.prefix)) ?? null;
}

/** Demo scoring rule (fixture law, not contest law): own country 1, other
 * NA 2, EU 1, OC 3, everything else 2. The seed log's stored points all
 * equal pointsFor(station) — sum is 21 by construction. */
function pointsFor(meta: PrefixEntry): 1 | 2 | 3 {
  if (meta.entityName === 'United States') return 1;
  if (meta.continent === 'NA') return 2;
  if (meta.continent === 'EU') return 1;
  if (meta.continent === 'OC') return 3;
  return 2;
}

interface Station extends PrefixEntry {
  callsign: string;
}

// Station identity consts — each spreads its PREFIXES row, so station meta
// and the resolver table agree by construction (cross-check by identity).
function station(callsign: string, prefix: string): Station {
  const entry = PREFIXES.find(p => p.prefix === prefix);
  if (entry == null) throw new Error(`Unknown prefix fixture: ${prefix}`);
  return {callsign, ...entry};
}

const STATIONS = {
  // Seed-log stations (this session, all 20m SSB)
  K3LR: station('K3LR', 'K'),
  VE3EJ: station('VE3EJ', 'VE'),
  KL7RA: station('KL7RA', 'KL7'),
  DL8QS: station('DL8QS', 'DL'),
  G4BUO: station('G4BUO', 'G'),
  F6BEE: station('F6BEE', 'F'),
  I4UFH: station('I4UFH', 'I'),
  OH2BH: station('OH2BH', 'OH'),
  TF3AM: station('TF3AM', 'TF'),
  UA9BA: station('UA9BA', 'UA9'),
  JA1NUT: station('JA1NUT', 'JA'),
  PY2XB: station('PY2XB', 'PY'),
  // 11-char compound callsign — stresses the 110px callsign column and the
  // resolver's longest-prefix logic (stress fixture 1).
  VP8_G4XYZ_P: station('VP8/G4XYZ/P', 'VP8'),
  ZS1C: station('ZS1C', 'ZS'),
  // Bandmap-only stations
  E77DX: station('E77DX', 'E7'),
  VK2GR: station('VK2GR', 'VK'),
  LU8YE: station('LU8YE', 'LU'),
  UA9MA: station('UA9MA', 'UA9'),
  ZL2AGY: station('ZL2AGY', 'ZL'),
  XE2S: station('XE2S', 'XE'),
  HL5IVL: station('HL5IVL', 'HL'),
  F5IN: station('F5IN', 'F'),
  ZS6EZ: station('ZS6EZ', 'ZS'),
  UA3DPX: station('UA3DPX', 'UA'),
  JA3YBK: station('JA3YBK', 'JA'),
};

interface Qso {
  id: string;
  callsign: string;
  band: Band;
  mode: Mode;
  rstS: string;
  rstR: string;
  zone: number; // numeric twin — feeds mults and the grid
  /** Received exchange as logged; undefined on q5 renders the
   * omit-when-undefined zone segment (stress fixture 5). */
  exch?: string;
  points: 1 | 2 | 3;
  timeDisplay: string; // '11:38Z' — display twin
  minutesUtc: number; // 698 — numeric twin, feeds the rate buckets
  newMultZone?: number;
  entityName: string;
}

function seedQso(
  id: string,
  st: Station,
  timeDisplay: string,
  minutesUtc: number,
  extras: {newMultZone?: number; omitExch?: boolean} = {},
): Qso {
  return {
    id,
    callsign: st.callsign,
    band: '20m',
    mode: 'SSB',
    rstS: '59',
    rstR: '59',
    zone: st.zone,
    exch: extras.omitExch ? undefined : String(st.zone),
    points: pointsFor(st),
    timeDisplay,
    minutesUtc,
    newMultZone: extras.newMultZone,
    entityName: st.entityName,
  };
}

// 14 seed QSOs, chronological q1→q14 (ORDER below is newest-first).
// Cross-checks: sum(points) = 2+1+1+1+1+2+2+1+2+2+2+1+1+2 = 21; the three
// newMultZone rows (zones 1, 17, 40) turn the 44 prior mults into 47 at
// load, so header and footer both read 21 pts × 47 = 2,209. Rate buckets:
// all 14 QSOs sit in minutesUtc [690, 700) → 14 × 6 = 84/hr, with minutes
// 692 and 699 empty (the zero-height bars, stress fixture 7). Zones 1 and
// 40 exercise both grid banks' edges (stress fixture 6).
const SEED_LOG: Qso[] = [
  seedQso('q1', STATIONS.VE3EJ, '11:30Z', 690),
  seedQso('q2', STATIONS.K3LR, '11:31Z', 691), // scripted dupe target (bandmap spot 3)
  seedQso('q3', STATIONS.G4BUO, '11:31Z', 691),
  seedQso('q4', STATIONS.DL8QS, '11:33Z', 693),
  seedQso('q5', STATIONS.F6BEE, '11:33Z', 693, {omitExch: true}), // stress 5: empty exchange
  seedQso('q6', STATIONS.ZS1C, '11:34Z', 694),
  seedQso('q7', STATIONS.PY2XB, '11:35Z', 695),
  seedQso('q8', STATIONS.I4UFH, '11:35Z', 695),
  seedQso('q9', STATIONS.KL7RA, '11:35Z', 695, {newMultZone: 1}), // bank-1 edge
  seedQso('q10', STATIONS.UA9BA, '11:36Z', 696, {newMultZone: 17}),
  seedQso('q11', STATIONS.JA1NUT, '11:37Z', 697),
  seedQso('q12', STATIONS.TF3AM, '11:37Z', 697, {newMultZone: 40}), // bank-2 edge
  seedQso('q13', STATIONS.OH2BH, '11:38Z', 698),
  seedQso('q14', STATIONS.VP8_G4XYZ_P, '11:38Z', 698), // stress 1: 11-char compound, newest row
];

interface WorkedCell {
  callsign: string;
  timeDisplay: string;
  qsoId?: string; // present only for this session's rows — those cells jump the log
}

// 44 band-zone multipliers worked BEFORE this session (00:12Z–10:18Z).
// Counts: 160m 2 + 80m 7 + 40m 13 + 20m 22 = 44. With the session's three
// new mults (20m zones 1, 17, 40) the load-time total is 47. 20m-32 is
// deliberately absent — bandmap spot 6 (ZL2AGY) is the scripted NEW MULT.
const PRIOR_MULTS: Record<string, WorkedCell> = {
  '160m-5': {callsign: 'W8JI', timeDisplay: '00:12Z'},
  '160m-8': {callsign: 'C6ARW', timeDisplay: '00:18Z'},
  '80m-4': {callsign: 'W4RM', timeDisplay: '01:08Z'},
  '80m-5': {callsign: 'K3ZM', timeDisplay: '01:04Z'},
  '80m-8': {callsign: 'NP4Z', timeDisplay: '01:15Z'},
  '80m-9': {callsign: '9Y4W', timeDisplay: '01:21Z'},
  '80m-14': {callsign: 'DR1A', timeDisplay: '00:32Z'},
  '80m-15': {callsign: 'HG1S', timeDisplay: '00:36Z'},
  '80m-16': {callsign: 'EW2A', timeDisplay: '00:41Z'},
  '40m-3': {callsign: 'VE7GL', timeDisplay: '03:12Z'},
  '40m-4': {callsign: 'W8MJ', timeDisplay: '03:08Z'},
  '40m-5': {callsign: 'K1AR', timeDisplay: '03:05Z'},
  '40m-8': {callsign: 'KP2M', timeDisplay: '03:22Z'},
  '40m-9': {callsign: 'P49Y', timeDisplay: '03:26Z'},
  '40m-11': {callsign: 'PT5J', timeDisplay: '03:31Z'},
  '40m-13': {callsign: 'LO7H', timeDisplay: '03:36Z'},
  '40m-14': {callsign: 'DJ5MW', timeDisplay: '02:12Z'},
  '40m-15': {callsign: 'IR4X', timeDisplay: '02:16Z'},
  '40m-16': {callsign: 'UA4M', timeDisplay: '02:20Z'},
  '40m-20': {callsign: 'LZ9W', timeDisplay: '02:25Z'},
  '40m-25': {callsign: 'JH2FXK', timeDisplay: '02:44Z'},
  '40m-33': {callsign: 'EA8ZS', timeDisplay: '02:51Z'},
  '20m-3': {callsign: 'W7RN', timeDisplay: '09:44Z'},
  '20m-4': {callsign: 'W9RE', timeDisplay: '09:41Z'},
  '20m-5': {callsign: 'W3LPL', timeDisplay: '09:38Z'},
  '20m-6': {callsign: 'XE1KK', timeDisplay: '09:52Z'},
  '20m-7': {callsign: 'TI5W', timeDisplay: '10:02Z'},
  '20m-8': {callsign: 'P40W', timeDisplay: '10:05Z'},
  '20m-9': {callsign: 'PJ4G', timeDisplay: '10:07Z'},
  '20m-10': {callsign: 'HK1NA', timeDisplay: '10:11Z'},
  '20m-11': {callsign: 'PY5EG', timeDisplay: '10:14Z'},
  '20m-13': {callsign: 'CE3AA', timeDisplay: '10:18Z'},
  '20m-14': {callsign: 'DF9ZP', timeDisplay: '07:03Z'},
  '20m-15': {callsign: '9A1A', timeDisplay: '07:06Z'},
  '20m-16': {callsign: 'RU1A', timeDisplay: '07:09Z'},
  '20m-20': {callsign: 'SV9CVY', timeDisplay: '07:15Z'},
  '20m-25': {callsign: 'JH4UYB', timeDisplay: '08:21Z'},
  '20m-27': {callsign: 'DU1IST', timeDisplay: '08:27Z'},
  '20m-28': {callsign: 'YB0ECT', timeDisplay: '08:31Z'},
  '20m-30': {callsign: 'VK4KW', timeDisplay: '08:36Z'},
  '20m-33': {callsign: 'CN2R', timeDisplay: '07:22Z'},
  '20m-35': {callsign: 'D4C', timeDisplay: '07:29Z'},
  '20m-37': {callsign: '5Z4B', timeDisplay: '07:35Z'},
  '20m-38': {callsign: 'ZS4TX', timeDisplay: '07:41Z'},
};

export interface BandmapSpot {
  id: string;
  station: Station;
  freqDisplay: string; // '14,205.3' — display twin
  freqKhz: number; // 14205.3 — numeric twin
  note: string;
}

// Ordered fixture bandmap — the dial replays it; commit and 'Next spot'
// both advance bandmapIndex (wrapping). Index 2 duplicates seed q2 (K3LR on
// 20m — the scripted red-dupe demo, stress fixture 3); index 5 is the
// scripted zone-32 NEW MULT flash (stress fixture 4). Index 0 (E77DX)
// puts the truncating 'Bosnia-Herzegovina' entity name in the dial center
// block at load (stress fixture 2).
const BANDMAP: BandmapSpot[] = [
  {id: 's1', station: STATIONS.E77DX, freqDisplay: '14,190.0', freqKhz: 14190.0, note: 'Spotted by VE7CC-1 · running NA, big signal'},
  {id: 's2', station: STATIONS.VK2GR, freqDisplay: '14,195.5', freqKhz: 14195.5, note: 'Long-path opening · QSB, listen twice'},
  {id: 's3', station: STATIONS.K3LR, freqDisplay: '14,205.3', freqKhz: 14205.3, note: 'Spotted by W3LPL · 14205.3 · loud, running EU'},
  {id: 's4', station: STATIONS.LU8YE, freqDisplay: '14,212.8', freqKhz: 14212.8, note: 'Steady S8 · quick exchange, no pileup'},
  {id: 's5', station: STATIONS.UA9MA, freqDisplay: '14,216.2', freqKhz: 14216.2, note: 'Spotted by RU1A · CQ contest, fast op'},
  {id: 's6', station: STATIONS.ZL2AGY, freqDisplay: '14,222.4', freqKhz: 14222.4, note: 'QSX up 2 · pileup thinning'},
  {id: 's7', station: STATIONS.XE2S, freqDisplay: '14,226.0', freqKhz: 14226.0, note: 'S7 and rising · short calls win'},
  {id: 's8', station: STATIONS.HL5IVL, freqDisplay: '14,231.7', freqKhz: 14231.7, note: 'Spotted by JH4UYB · over the pole, watch QSB'},
  {id: 's9', station: STATIONS.F5IN, freqDisplay: '14,237.9', freqKhz: 14237.9, note: 'Simplex · S9+, one-call copy'},
  {id: 's10', station: STATIONS.ZS6EZ, freqDisplay: '14,243.5', freqKhz: 14243.5, note: 'Spotted by D4C · long path fades in 20 min'},
  {id: 's11', station: STATIONS.UA3DPX, freqDisplay: '14,251.1', freqKhz: 14251.1, note: 'CQ WW test · needs one call'},
  {id: 's12', station: STATIONS.JA3YBK, freqDisplay: '14,258.4', freqKhz: 14258.4, note: 'Big club station · workable now, grayline soon'},
];

// ---------------------------------------------------------------------------
// STYLES — density grid verbatim: 44px header bar; 88px entry bar; 32px log
// rows; 28px sticky footer; 380px rail (12px padding, 356px inner); 16px
// cells + 1px gap; 180px dial; 12px gutter for all inter-panel spacing.
// ---------------------------------------------------------------------------

const GUTTER = 12; // --gutter: 12px — the only inter-panel spacing constant
const MONO = 'var(--font-family-code, monospace)';
// Log columns: time 56, callsign 110, band 44, mode 44, RST-sent 44,
// RST-rcvd 44, zone 40, points 48, mult badge 72.
const LOG_COLUMNS = '56px 110px 44px 44px 44px 44px 40px 48px 72px';

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  viewRoot: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // 44px header bar --------------------------------------------------------
  headerBar: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  markWrap: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  headerSpacer: {flex: 1},
  scoreReadout: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 88px entry bar ---------------------------------------------------------
  entryBar: {
    height: 88,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-end',
    gap: GUTTER,
    paddingInline: GUTTER,
    paddingBottom: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  fieldColumn: {display: 'flex', flexDirection: 'column', gap: 4},
  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  // CallsignResolverField: 44px tall, 300px wide; suffix segment 132px.
  resolverShell: {
    display: 'flex',
    alignItems: 'stretch',
    width: 300,
    height: 44,
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  resolverShellDupe: {
    backgroundColor: DUPE_BG,
    borderColor: DUPE_BORDER,
  },
  resolverShellMult: {
    backgroundColor: MULT_BG,
    borderColor: MULT_BORDER,
  },
  callInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: MONO,
    fontSize: 18,
    textTransform: 'uppercase',
    paddingInline: 12,
    color: 'var(--color-text-primary)',
  },
  resolverSuffix: {
    width: 132,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 6,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  resolverSuffixRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // Abstract DXCC entity badge — text letters only, NEVER real flag art.
  entityGlyph: {
    width: 24,
    height: 16,
    flexShrink: 0,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-selected, var(--color-background))',
    border: 'var(--border-width) solid var(--color-border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
  zoneBadge: {fontFamily: MONO, fontSize: 11, color: 'var(--color-text-secondary)'},
  continentGlyph: {fontSize: 11, color: 'var(--color-text-secondary)'},
  dupeLabel: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    color: DUPE_TEXT,
    whiteSpace: 'nowrap',
  },
  multLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 10,
    fontWeight: 700,
    color: MULT_TEXT,
    whiteSpace: 'nowrap',
  },
  entryHint: {alignSelf: 'center', whiteSpace: 'nowrap'},
  // Log region ---------------------------------------------------------------
  logRegion: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'auto', // below 620px the fixed columns scroll, never squeeze
  },
  logTable: {minWidth: 620},
  logHeaderRow: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: LOG_COLUMNS,
    columnGap: 8,
    alignItems: 'center',
    height: 28, // sticky 28px column-header row
    paddingInline: GUTTER,
    backgroundColor: 'var(--color-background)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  logHeaderCell: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  logRow: {
    display: 'grid',
    gridTemplateColumns: LOG_COLUMNS,
    columnGap: 8,
    alignItems: 'center',
    width: '100%',
    height: 32, // 32px log table rows
    paddingInline: GUTTER,
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: MONO,
    fontSize: 13,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  logRowNewest: {boxShadow: `inset 3px 0 0 0 ${BRAND}`},
  logCell: {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  logCallCell: {fontWeight: 700},
  logNumCell: {textAlign: 'right'},
  multBadge: {
    display: 'inline-block',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: MONO,
    backgroundColor: MULT_BG,
    color: MULT_TEXT,
  },
  // 28px sticky summary footer ---------------------------------------------
  footer: {
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: GUTTER,
    gap: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // 380px right rail ---------------------------------------------------------
  rail: {
    width: 380,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
    padding: GUTTER, // 12px inner padding → 356px inner width
    borderLeft: 'var(--border-width) solid var(--color-border)',
    overflowY: 'auto',
    minHeight: 0,
  },
  railSection: {display: 'flex', flexDirection: 'column', gap: 6},
  railSectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    whiteSpace: 'nowrap',
  },
  // MultiplierGrid: two banks of 21 columns (16px band-label col + 20 cells)
  // with 1px gap → 21×16 + 20×1 = 356px, exactly the rail's inner width.
  bank: {
    display: 'grid',
    gridTemplateColumns: 'repeat(21, 16px)',
    gap: 1,
    width: 356,
  },
  bankHeader: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
  },
  rulerCell: {
    height: 14, // 14px zone-number ruler row
    fontSize: 9,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    lineHeight: '14px',
    overflow: 'hidden',
  },
  bandLabelCell: {
    fontSize: 8,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    textAlign: 'right',
    lineHeight: '16px',
    paddingRight: 1,
    overflow: 'hidden',
  },
  bandLabelActive: {color: BRAND_TEXT, fontWeight: 700},
  cell: {
    width: 16,
    height: 16,
    padding: 0,
    border: 'none',
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellWorked: {
    backgroundColor: BRAND_FILL_85,
    boxShadow: 'none',
  },
  // Static amber ring while justLitKey points here; the 600ms pop rides on
  // the .hcl-just-lit class (reduced motion: ring only, instant fill).
  cellLit: {boxShadow: `0 0 0 2px ${MULT_BORDER}`},
  cellDigit: {
    fontSize: 8,
    fontWeight: 700,
    fontFamily: MONO,
    color: CELL_DIGIT,
    lineHeight: '16px',
    pointerEvents: 'none',
  },
  // BeamHeadingDial ----------------------------------------------------------
  dialWrap: {
    position: 'relative',
    width: 180, // 180px beam dial diameter
    height: 180,
    alignSelf: 'center',
  },
  dialCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    maxWidth: 96,
    padding: '2px 6px',
    borderRadius: 6,
    backgroundColor: 'var(--color-background-card)',
    pointerEvents: 'none',
  },
  dialCallsign: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    maxWidth: 88,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 'Bosnia-Herzegovina' (E77DX, spot 1) truncates here — stress fixture 2.
  dialEntity: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    maxWidth: 88,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dialBearings: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  dialFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  dialNote: {flex: 1, minWidth: 0},
  nextSpotBtn: {
    height: 24, // 24px ghost button
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 6,
    border: 'none',
    borderRadius: 4,
    background: 'transparent',
    color: BRAND_TEXT,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // RateMeter ------------------------------------------------------------
  rateCard: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: GUTTER,
    marginTop: 'auto', // pinned at rail bottom (bottom-right corner owner)
  },
  rateBig: {
    fontFamily: MONO,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  rateCaption: {fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  rateBars: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 36, // 6 QSOs/min ceiling × 6px
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  rateBar: {width: 8, backgroundColor: BRAND},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// KeylineMark — pure SVG, 24×24: bold brand diagonal (the telegraph-key
// lever) over three morse marks (— · ·) reading as an abstract K.
// ---------------------------------------------------------------------------

function KeylineMark({size = 24}: {size?: 20 | 24}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x={2} y={18.5} width={7} height={3} rx={1} fill="currentColor" />
      <rect x={12} y={18.5} width={3} height={3} rx={1} fill="currentColor" />
      <rect x={18} y={18.5} width={3} height={3} rx={1} fill="currentColor" />
      <line x1={6} y1={20} x2={18} y2={4} stroke={BRAND} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CallsignResolverField — 44×300 field inside the 88px entry bar; the suffix
// segment (132px) fills in as the operator types. Purely presentational:
// the owner computes meta/dupe/isNewMult and this component only tints.
// ---------------------------------------------------------------------------

interface CallsignResolverFieldProps {
  value: string;
  meta: PrefixEntry | null;
  dupe: {band: Band; timeDisplay: string} | null;
  isNewMult: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
  onWipe: () => void;
  inputRef: Ref<HTMLInputElement>;
}

function CallsignResolverField({
  value,
  meta,
  dupe,
  isNewMult,
  onChange,
  onCommit,
  onWipe,
  inputRef,
}: CallsignResolverFieldProps) {
  const shellStyle: CSSProperties = dupe
    ? {...styles.resolverShell, ...styles.resolverShellDupe}
    : isNewMult
      ? {...styles.resolverShell, ...styles.resolverShellMult}
      : styles.resolverShell;
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onWipe();
    }
  };
  return (
    <div style={styles.fieldColumn}>
      <label htmlFor="hcl-callsign" style={styles.fieldLabel}>
        Callsign
      </label>
      <div style={shellStyle}>
        <input
          id="hcl-callsign"
          ref={inputRef}
          className="hcl-call-input"
          style={styles.callInput}
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          // Dupe/new-mult are conveyed as text in the live region and the
          // suffix labels below — never color alone.
          aria-describedby="hcl-resolver-state"
        />
        {/* Suffix meta is aria-hidden; the resolution is folded into the
            live-region announce text owned by ContestLoggerRoot. */}
        <div style={styles.resolverSuffix} aria-hidden>
          {dupe != null ? (
            <span style={styles.dupeLabel}>
              DUPE · {dupe.band} {dupe.timeDisplay}
            </span>
          ) : meta != null ? (
            <>
              <span style={styles.resolverSuffixRow}>
                <span style={styles.entityGlyph}>{meta.entityAbbr}</span>
                <span style={styles.zoneBadge}>Z{meta.zone}</span>
                <span style={styles.continentGlyph}>{meta.continent}</span>
              </span>
              {isNewMult ? (
                <span style={styles.multLabel}>
                  <Icon icon={SparklesIcon} size="xsm" color="inherit" />
                  NEW MULT
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <span id="hcl-resolver-state" style={styles.visuallyHidden}>
        {dupe != null
          ? `Duplicate — already worked on ${BAND_WORDS[dupe.band]} at ${dupe.timeDisplay}`
          : meta != null
            ? `${meta.entityName}, zone ${meta.zone}, ${meta.continent}${isNewMult ? ', new multiplier' : ''}`
            : 'No prefix match yet'}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MultiplierGrid — two stacked banks (zones 1–20, 21–40) of 6 band rows ×
// 20 cells; cells exactly 16×16 with 1px gap. A cell lighting up is the
// payoff of a commit; clicking a worked session cell jumps the log.
// ---------------------------------------------------------------------------

interface MultiplierGridProps {
  worked: Record<string, WorkedCell>;
  justLitKey: string | null;
  activeBand: Band;
  onCellClick: (key: string) => void;
}

function GridBank({
  zoneStart,
  worked,
  justLitKey,
  activeBand,
  onCellClick,
}: MultiplierGridProps & {zoneStart: 1 | 21}) {
  const zones = Array.from({length: 20}, (_, i) => zoneStart + i);
  const bankCount = Object.keys(worked).filter(key => {
    const zone = Number(key.split('-')[1]);
    return zone >= zoneStart && zone < zoneStart + 20;
  }).length;
  return (
    <div style={styles.railSection}>
      <div style={styles.bankHeader}>
        <Text type="label" size="xsm">
          Zones {zoneStart}–{zoneStart + 19}
        </Text>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          ×{bankCount}
        </Text>
      </div>
      <div style={styles.bank} role="grid" aria-label={`Multipliers, zones ${zoneStart} to ${zoneStart + 19}`}>
        <div role="row" style={{display: 'contents'}}>
          <span role="columnheader" aria-label="Band" style={styles.rulerCell} />
          {zones.map(zone => (
            <span key={zone} role="columnheader" style={styles.rulerCell}>
              {zone}
            </span>
          ))}
        </div>
        {BANDS.map(bnd => (
          <div
            key={bnd}
            role="row"
            aria-label={`${BAND_WORDS[bnd]}, zones ${zoneStart} to ${zoneStart + 19}`}
            style={{display: 'contents'}}>
            <span
              role="rowheader"
              style={
                bnd === activeBand
                  ? {...styles.bandLabelCell, ...styles.bandLabelActive}
                  : styles.bandLabelCell
              }>
              {bnd.slice(0, -1)}
            </span>
            {zones.map(zone => {
              const key = `${bnd}-${zone}`;
              const cell = worked[key];
              const isLit = justLitKey === key;
              const label = `Zone ${zone} · ${bnd} · ${
                cell ? `worked ${cell.callsign} ${cell.timeDisplay}` : 'needed'
              }`;
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  className={isLit ? 'hcl-cell hcl-just-lit' : 'hcl-cell'}
                  title={label}
                  aria-label={label}
                  onClick={() => onCellClick(key)}
                  style={
                    cell
                      ? isLit
                        ? {...styles.cell, ...styles.cellWorked, ...styles.cellLit}
                        : {...styles.cell, ...styles.cellWorked}
                      : styles.cell
                  }>
                  {cell ? <span style={styles.cellDigit}>{zone}</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiplierGrid(props: MultiplierGridProps) {
  return (
    <>
      <GridBank {...props} zoneStart={1} />
      <GridBank {...props} zoneStart={21} />
    </>
  );
}

// ---------------------------------------------------------------------------
// BeamHeadingDial — 180px SVG rose: 16 tick marks, fixed grayline arc
// (48°→132°), solid BRAND short-path needle with arrowhead, dashed
// half-length long-path needle. 220ms sweep on target change (none under
// reduced motion). Driven by the fixture bandmap; commit auto-advances it.
// ---------------------------------------------------------------------------

function polar(deg: number, r: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: 90 + r * Math.sin(rad), y: 90 - r * Math.cos(rad)};
}

const GRAYLINE_START = polar(48, 71);
const GRAYLINE_END = polar(132, 71);
// 14px-wide annular band centered on r=71 → covers r 64–78.
const GRAYLINE_PATH = `M ${GRAYLINE_START.x.toFixed(2)} ${GRAYLINE_START.y.toFixed(2)} A 71 71 0 0 1 ${GRAYLINE_END.x.toFixed(2)} ${GRAYLINE_END.y.toFixed(2)}`;

const CARDINALS: ReadonlyArray<{label: string; deg: number}> = [
  {label: 'N', deg: 0},
  {label: 'E', deg: 90},
  {label: 'S', deg: 180},
  {label: 'W', deg: 270},
];

interface BeamHeadingDialProps {
  target: BandmapSpot;
  onNext: () => void;
}

function BeamHeadingDial({target, onNext}: BeamHeadingDialProps) {
  const st = target.station;
  return (
    <>
      <div
        style={styles.dialWrap}
        role="img"
        aria-label={`Beam heading to ${st.callsign}, ${st.entityName}, short path ${st.bearingSpDeg} degrees, long path ${st.bearingLpDeg} degrees`}>
        <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden focusable="false">
          <circle cx={90} cy={90} r={88} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
          <path d={GRAYLINE_PATH} fill="none" stroke={GRAYLINE} strokeWidth={14} />
          {Array.from({length: 16}, (_, i) => {
            const deg = i * 22.5;
            const isMajor = deg % 90 === 0;
            const outer = polar(deg, 88);
            const inner = polar(deg, isMajor ? 80 : 84);
            return (
              <line
                key={deg}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--color-text-secondary)"
                strokeWidth={isMajor ? 1.5 : 1}
              />
            );
          })}
          {CARDINALS.map(({label, deg}) => {
            const pos = polar(deg, 72);
            return (
              <text
                key={label}
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-text-secondary)">
                {label}
              </text>
            );
          })}
          {/* Long path: dashed, half length */}
          <g
            className="hcl-needle"
            style={{transform: `rotate(${st.bearingLpDeg}deg)`, transformOrigin: '90px 90px'}}>
            <line x1={90} y1={90} x2={90} y2={55} stroke="var(--color-text-secondary)" strokeWidth={2.5} strokeDasharray="4 2" />
          </g>
          {/* Short path: solid BRAND, full length with arrowhead */}
          <g
            className="hcl-needle"
            style={{transform: `rotate(${st.bearingSpDeg}deg)`, transformOrigin: '90px 90px'}}>
            <line x1={90} y1={90} x2={90} y2={22} stroke={BRAND} strokeWidth={2.5} />
            <polygon points="90,14 85.5,23 94.5,23" fill={BRAND} />
          </g>
          <circle cx={90} cy={90} r={3} fill={BRAND} />
        </svg>
        <div style={styles.dialCenter}>
          <span style={styles.dialCallsign}>{st.callsign}</span>
          <span style={styles.dialEntity}>{st.entityName}</span>
          <span style={styles.dialBearings}>
            SP {st.bearingSpDeg}° / LP {st.bearingLpDeg}°
          </span>
        </div>
      </div>
      <div style={styles.dialFooter}>
        <span style={styles.dialNote}>
          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
            {target.freqDisplay} · {target.note}
          </Text>
        </span>
        <button type="button" className="hcl-btn" style={styles.nextSpotBtn} onClick={onNext}>
          Next spot
          <Icon icon={ChevronRightIcon} size="xsm" color="inherit" />
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// QsoLogRow — 32px dense composite row; the entire row is a button that
// re-arms the entry with its callsign (one click demonstrates the dupe
// tint). The mult-badge segment renders ONLY when newMultZone is defined.
// ---------------------------------------------------------------------------

interface QsoLogRowProps {
  qso: Qso;
  isNewest: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  onFlashEnd: () => void;
  rowRef: (el: HTMLButtonElement | null) => void;
}

function QsoLogRow({qso, isNewest, isHighlighted, onClick, onFlashEnd, rowRef}: QsoLogRowProps) {
  const label =
    `${qso.callsign}, ${BAND_WORDS[qso.band]}, ${qso.mode}, sent ${qso.rstS}, ` +
    `received ${qso.rstR}, zone ${qso.zone}, ${qso.points} ${qso.points === 1 ? 'point' : 'points'}` +
    `${qso.newMultZone != null ? `, new multiplier zone ${qso.newMultZone}` : ''}, ` +
    `logged ${qso.timeDisplay}. Re-arms the entry with this callsign.`;
  return (
    <button
      type="button"
      role="row"
      ref={rowRef}
      className={isHighlighted ? 'hcl-row hcl-row-flash' : 'hcl-row'}
      onAnimationEnd={isHighlighted ? onFlashEnd : undefined}
      aria-label={label}
      onClick={onClick}
      style={isNewest ? {...styles.logRow, ...styles.logRowNewest} : styles.logRow}>
      <span role="cell" style={styles.logCell}>
        {qso.timeDisplay}
      </span>
      <span role="cell" style={{...styles.logCell, ...styles.logCallCell}} title={qso.callsign}>
        {qso.callsign}
      </span>
      <span role="cell" style={styles.logCell}>
        {qso.band}
      </span>
      <span role="cell" style={styles.logCell}>
        {qso.mode}
      </span>
      <span role="cell" style={styles.logCell}>
        {qso.rstS}
      </span>
      <span role="cell" style={styles.logCell}>
        {qso.rstR}
      </span>
      {/* exch is undefined on q5 (F6BEE) — the omit-when-undefined segment */}
      <span role="cell" style={styles.logCell}>
        {qso.exch ?? ''}
      </span>
      <span role="cell" style={{...styles.logCell, ...styles.logNumCell}}>
        {qso.points}
      </span>
      <span role="cell" style={styles.logCell}>
        {qso.newMultZone != null ? (
          <span style={styles.multBadge}>MULT Z{qso.newMultZone}</span>
        ) : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// RateMeter — thin wrapper over DS Card: big rate figure + 10 one-minute
// bars (bar height = count × 6px). Buckets are derived by the owner from
// qso.minutesUtc — zero clock reads. Minute 692 and (until the first demo
// commit) 699 are the zero-height bars.
// ---------------------------------------------------------------------------

interface RateMeterProps {
  ratePerHour: number;
  buckets: number[];
}

function RateMeter({ratePerHour, buckets}: RateMeterProps) {
  return (
    <Card style={styles.rateCard} aria-label={`Rate ${ratePerHour} per hour over the last 10 minutes`}>
      <div>
        <div style={styles.rateBig}>{ratePerHour}/hr</div>
        <div style={styles.rateCaption}>last 10 min</div>
      </div>
      <div style={styles.rateBars} aria-hidden>
        {buckets.map((count, i) => (
          <span
            key={i}
            title={`11:${30 + i} — ${count} QSO${count === 1 ? '' : 's'}`}
            style={{...styles.rateBar, height: Math.min(count, 6) * 6}}
          />
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// PAGE — ContestLoggerRoot: the ONE state owner. Everything on screen is
// derived from this store; every surface mutates it through update(id,
// patch) with id ∈ {'entry', 'session', qsoId}.
// ---------------------------------------------------------------------------

interface EntryState {
  call: string;
  rstS: string;
  rstR: string;
  exch: string;
}

interface Store {
  qsos: Record<string, Qso>;
  order: string[]; // newest first — index 0 carries the brand accent bar
  entry: EntryState;
  band: Band;
  mode: Mode;
  bandmapIndex: number;
  highlightQsoId: string | null;
  justLitKey: string | null;
  announce: string;
}

const INITIAL_STORE: Store = {
  qsos: Object.fromEntries(SEED_LOG.map(q => [q.id, q])),
  order: [...SEED_LOG].reverse().map(q => q.id),
  entry: {call: '', rstS: '59', rstR: '59', exch: ''},
  band: '20m',
  mode: 'SSB',
  bandmapIndex: 0,
  highlightQsoId: null,
  justLitKey: null,
  announce: '',
};

type UpdatePatch = Partial<EntryState> | Partial<Store> | Partial<Qso>;

const LOG_HEADERS = ['Time', 'Call', 'Band', 'Mode', 'Sent', 'Rcvd', 'Zone', 'Pts', 'Mult'];

export default function HamContestLoggerTemplate() {
  // <=1120px the entire rail is removed and the header gains the compact
  // mults/rate chip — subtraction, never reflow.
  const isNarrow = useMediaQuery('(max-width: 1120px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const {qsos, order, entry, band, mode, bandmapIndex, highlightQsoId, justLitKey, announce} =
    store;

  // The single mutation door. id 'entry' patches the entry draft, id
  // 'session' patches top-level session state, any other id patches that QSO.
  const update = (id: 'entry' | 'session' | (string & {}), patch: UpdatePatch) => {
    setStore(prev => {
      if (id === 'entry') {
        return {...prev, entry: {...prev.entry, ...(patch as Partial<EntryState>)}};
      }
      if (id === 'session') {
        return {...prev, ...(patch as Partial<Store>)};
      }
      const qso = prev.qsos[id];
      if (qso == null) return prev;
      return {...prev, qsos: {...prev.qsos, [id]: {...qso, ...(patch as Partial<Qso>)}}};
    });
  };

  // ----- Derivations: everything below re-derives from the store ---------
  const meta = longestPrefixMatch(entry.call);
  const dupe =
    order
      .map(id => qsos[id])
      .find(q => q.callsign === entry.call && q.band === band) ?? null;

  // Worked band-zone map: prior-contest baseline + this session's rows.
  // Earliest owner keeps the cell, so prior mults never get overwritten.
  const worked: Record<string, WorkedCell> = {...PRIOR_MULTS};
  for (let i = order.length - 1; i >= 0; i--) {
    const q = qsos[order[i]];
    const key = `${q.band}-${q.zone}`;
    if (worked[key] == null) {
      worked[key] = {callsign: q.callsign, timeDisplay: q.timeDisplay, qsoId: q.id};
    }
  }
  const multCount = Object.keys(worked).length; // 47 at load (44 prior + 3 seed)
  const pointsSum = order.reduce((sum, id) => sum + qsos[id].points, 0); // 21 at load
  const score = pointsSum * multCount; // 2,209 at load — header AND footer
  const isNewMult =
    meta != null && dupe == null && worked[`${band}-${meta.zone}`] == null;

  const buckets = Array.from({length: 10}, () => 0);
  for (const id of order) {
    const minute = qsos[id].minutesUtc - BUCKET_START;
    if (minute >= 0 && minute < 10) buckets[minute] += 1;
  }
  const ratePerHour = buckets.reduce((a, b) => a + b, 0) * 6; // 84 at load

  const target = BANDMAP[bandmapIndex % BANDMAP.length];

  // ----- Wiring ------------------------------------------------------------
  const callsignRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (highlightQsoId == null) return;
    rowRefs.current[highlightQsoId]?.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [highlightQsoId, prefersReducedMotion]);

  const handleCallChange = (raw: string) => {
    const call = raw.toUpperCase().replace(/\s+/g, '');
    update('entry', {call});
    const nextDupe = order
      .map(id => qsos[id])
      .find(q => q.callsign === call && q.band === band);
    if (nextDupe != null && dupe == null) {
      update('session', {
        announce: `Duplicate: ${call} already worked on ${BAND_WORDS[band]} at ${nextDupe.timeDisplay}`,
      });
    }
  };

  const wipeEntry = () => {
    update('entry', {call: '', exch: ''});
    update('session', {announce: 'Entry cleared'});
  };

  // commitQso — a composition of update() calls plus the ONE prepend.
  const commitQso = () => {
    const call = entry.call;
    if (meta == null || call.length < 3) {
      update('session', {announce: 'Callsign not recognized — nothing logged'});
      return;
    }
    if (dupe != null) {
      update('session', {
        announce: `Duplicate: ${call} already worked on ${BAND_WORDS[band]} at ${dupe.timeDisplay} — not logged`,
      });
      return;
    }
    const id = `q${Object.keys(qsos).length + 1}`;
    const points = pointsFor(meta);
    const key = `${band}-${meta.zone}`;
    const newMult = worked[key] == null;
    const nextScore = (pointsSum + points) * (multCount + (newMult ? 1 : 0));
    const qso: Qso = {
      id,
      callsign: call,
      band,
      mode,
      rstS: entry.rstS,
      rstR: entry.rstR,
      zone: meta.zone,
      exch: entry.exch === '' ? String(meta.zone) : entry.exch,
      points,
      timeDisplay: COMMIT_TIME.timeDisplay,
      minutesUtc: COMMIT_TIME.minutesUtc,
      newMultZone: newMult ? meta.zone : undefined,
      entityName: meta.entityName,
    };
    // The one prepend: log grows at the top and takes the accent bar.
    setStore(prev => ({
      ...prev,
      qsos: {...prev.qsos, [id]: qso},
      order: [id, ...prev.order],
    }));
    update('session', {
      bandmapIndex: (bandmapIndex + 1) % BANDMAP.length, // dial sweeps to next spot
      justLitKey: newMult ? key : null, // grid cell flash-fills
      highlightQsoId: null,
      announce: `Logged ${call}, ${points} ${points === 1 ? 'point' : 'points'}, ${
        newMult ? `new multiplier zone ${meta.zone}, ` : ''
      }score ${nextScore.toLocaleString('en-US')}`,
    });
    update('entry', {call: '', exch: ''});
    callsignRef.current?.focus(); // focus returns to the callsign input
  };

  const handleBand = (value: string) => update('session', {band: value as Band});
  const handleMode = (value: string) => {
    const nextMode = value as Mode;
    update('session', {mode: nextMode});
    // Observable consequence in the entry bar: CW re-arms 599 reports.
    const rst = nextMode === 'CW' ? '599' : '59';
    update('entry', {rstS: rst, rstR: rst});
  };

  const handleCellClick = (key: string) => {
    const cell = worked[key];
    if (cell == null) {
      update('session', {announce: `${key.replace('-', ' zone ')} still needed`});
      return;
    }
    if (cell.qsoId != null) {
      // Log scrolls to and amber-flashes that row.
      update('session', {
        highlightQsoId: cell.qsoId,
        announce: `${cell.callsign} logged at ${cell.timeDisplay}`,
      });
    } else {
      update('session', {
        announce: `${cell.callsign} worked before this session at ${cell.timeDisplay}`,
      });
    }
  };

  const armEntryWith = (call: string) => {
    // One click on any log row demonstrates the red dupe tint.
    update('entry', {call});
    callsignRef.current?.focus();
  };

  const summaryLine = `${order.length} QSOs · ${multCount} mults · ${pointsSum} pts × ${multCount} = ${score.toLocaleString('en-US')}`;

  return (
    <div style={styles.root}>
      <style>{GLOBAL_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div style={styles.viewRoot}>
              <span style={styles.visuallyHidden}>
                <Heading level={1}>Keyline Radio contest logger</Heading>
              </span>
              <div aria-live="polite" role="status" style={styles.visuallyHidden}>
                {announce}
              </div>
              <div style={styles.main}>
                {/* 44px header bar — top-left mark/wordmark/contest chip;
                    top-right band segments, mode toggle, live score */}
                <header style={styles.headerBar}>
                  <span style={styles.markWrap} aria-hidden>
                    <KeylineMark size={24} />
                  </span>
                  <Text type="label" size="sm">
                    Keyline Radio
                  </Text>
                  <Token size="sm" color="gray" label={CONTEST_LABEL} />
                  <span style={styles.headerSpacer} aria-hidden />
                  {isNarrow ? (
                    // The rail is gone below 1120px — this chip keeps the
                    // mult/rate story alive in the header.
                    <Token
                      size="sm"
                      color="orange"
                      label={`Mults ${multCount} · ${ratePerHour}/hr`}
                    />
                  ) : null}
                  <SegmentedControl value={band} onChange={handleBand} label="Band" size="sm">
                    {BANDS.map(b => (
                      <SegmentedControlItem key={b} value={b} label={b.slice(0, -1)} />
                    ))}
                  </SegmentedControl>
                  <SegmentedControl value={mode} onChange={handleMode} label="Mode" size="sm">
                    <SegmentedControlItem value="CW" label="CW" />
                    <SegmentedControlItem value="SSB" label="SSB" />
                  </SegmentedControl>
                  <Text type="label" size="sm" hasTabularNumbers style={styles.scoreReadout}>
                    {score.toLocaleString('en-US')} pts
                  </Text>
                </header>
                {/* 88px entry bar */}
                <div style={styles.entryBar}>
                  <CallsignResolverField
                    value={entry.call}
                    meta={meta}
                    dupe={dupe != null ? {band: dupe.band, timeDisplay: dupe.timeDisplay} : null}
                    isNewMult={isNewMult}
                    onChange={handleCallChange}
                    onCommit={commitQso}
                    onWipe={wipeEntry}
                    inputRef={callsignRef}
                  />
                  <TextInput
                    label="RST sent"
                    value={entry.rstS}
                    onChange={value => update('entry', {rstS: value})}
                    onEnter={commitQso}
                    width={64}
                    size="md"
                  />
                  <TextInput
                    label="RST rcvd"
                    value={entry.rstR}
                    onChange={value => update('entry', {rstR: value})}
                    onEnter={commitQso}
                    width={64}
                    size="md"
                  />
                  <TextInput
                    label="Exchange"
                    value={entry.exch}
                    onChange={value => update('entry', {exch: value})}
                    onEnter={commitQso}
                    placeholder={meta != null ? String(meta.zone) : ''}
                    width={96}
                    size="md"
                  />
                  <span style={styles.entryHint}>
                    <Text type="supporting" size="xsm" color="secondary">
                      Enter logs · Esc wipes
                    </Text>
                  </span>
                </div>
                {/* Scrollable log — sticky 28px column header, 32px rows */}
                <div style={styles.logRegion}>
                  <div style={styles.logTable} role="table" aria-label="Contest log, newest first">
                    <div role="rowgroup">
                      <div role="row" style={styles.logHeaderRow}>
                        {LOG_HEADERS.map(header => (
                          <span key={header} role="columnheader" style={styles.logHeaderCell}>
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div role="rowgroup">
                      {order.map((id, index) => {
                        const qso = qsos[id];
                        return (
                          <QsoLogRow
                            key={id}
                            qso={qso}
                            isNewest={index === 0}
                            isHighlighted={highlightQsoId === id}
                            onClick={() => armEntryWith(qso.callsign)}
                            onFlashEnd={() => update('session', {highlightQsoId: null})}
                            rowRef={el => {
                              rowRefs.current[id] = el;
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* 28px sticky summary footer — must equal the header score */}
                <div style={styles.footer}>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {summaryLine}
                  </Text>
                </div>
              </div>
              {isNarrow ? null : (
                <aside style={styles.rail} aria-label="Multipliers, beam heading, and rate">
                  <section style={styles.railSection} aria-label="Multipliers">
                    <div style={styles.railSectionHeader}>
                      <Heading level={2}>Multipliers</Heading>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {multCount} worked · {240 - multCount} open
                      </Text>
                    </div>
                    <MultiplierGrid
                      worked={worked}
                      justLitKey={justLitKey}
                      activeBand={band}
                      onCellClick={handleCellClick}
                    />
                  </section>
                  <section style={styles.railSection} aria-label="Beam heading">
                    <div style={styles.railSectionHeader}>
                      <Heading level={2}>Beam heading</Heading>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        Spot {(bandmapIndex % BANDMAP.length) + 1} of {BANDMAP.length}
                      </Text>
                    </div>
                    <BeamHeadingDial
                      target={target}
                      onNext={() =>
                        update('session', {bandmapIndex: (bandmapIndex + 1) % BANDMAP.length})
                      }
                    />
                  </section>
                  <RateMeter ratePerHour={ratePerHour} buckets={buckets} />
                </aside>
              )}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
