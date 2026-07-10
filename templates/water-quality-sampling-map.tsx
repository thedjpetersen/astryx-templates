// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Tributary field picture for
 *   sampling run WQ-2026-081 (Alder Creek watershed, Thu Jul 9 2026) with a
 *   FIXED field clock at 09:42 (582 min after midnight). Nine sites in run
 *   order S-01…S-09; four collected before load, five pending. Courier
 *   departs staging at 13:30 (810); lab receipt at 13:55 (835). Hold math is
 *   hand-checked at first render:
 *     E. coli (Colilert) hold = 6 h (360 min) from collection:
 *       S-01 collected 07:05 (425) → expires 13:05 (785); 785 − 835 = −50
 *            → EXPIRES BEFORE LAB RECEIPT (walk-in required)
 *       S-02 collected 08:04 (484) → expires 14:04 (844); margin +9  → TIGHT
 *       S-03 collected 08:31 (511) → expires 14:31 (871); margin +36 → TIGHT
 *       S-04 collected 08:58 (538) → expires 14:58 (898); margin +63 → OK
 *     (tight = margin < 45 min vs 13:55 receipt; every other analyte holds
 *     48 h or longer, so all non-BAC margins are ≥ 46 h → OK.)
 *   ⇒ header chips at load: sites 4/9 collected · 12 bottles on ice
 *   (3+3+4+2) · holds 1 expiring + 2 tight. Pending bottle count 17
 *   (3+3+4+5+2) makes the 29-row manifest. New collections stamp a
 *   deterministic crew cadence — 09:42 + 12·k for the k-th log — so a
 *   logged site's E. coli expires no earlier than 15:42 (margin ≥ +107).
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Tributary — Water Quality Sampling Map: a field chain-of-custody
 *   console for one sampling run. A 56px brand header (confluence mark, run
 *   title, live collected/on-ice/hold-risk chips) over a two-region frame:
 *   left, a 330px schematic watershed SVG (mainstem + tributaries drawn as
 *   stroked channels over a water-tint wash, a WWTP outfall square, the
 *   run-order polyline whose legs solidify as sites are logged, and nine
 *   focusable site pins state-coded collected/pending/dry) above the
 *   29-row bottle manifest (32px site group headers, 40px bottle rows with
 *   analyte, method, container/preservative, and a live hold-time chip);
 *   right, a 380px custody rail owning the selected site — status, notes,
 *   the Log-collection / Mark-dry / Undo mutations, a five-step
 *   chain-of-custody spine (prepared → collected → on ice → courier →
 *   lab), and the run-wide "tightest holds" board sorted by margin against
 *   the 13:55 lab receipt. Signature move: logging a collection stamps the
 *   next crew-cadence time and, in the same render, fills the map pin,
 *   solidifies its polyline leg, appends the custody event, flips that
 *   site's manifest rows from "awaiting" to live countdown chips, re-sorts
 *   the tightest-holds board, and re-derives every header chip — with a
 *   snapshot-exact Undo and a polite announcement.
 * @position Page template; emitted by `astryx template water-quality-sampling-map`
 *
 * Frame: root 100dvh div > Layout height="fill". Header (brand + derived
 *   chips) | content grid: minmax(0,1fr) work column (map stage 330px fixed
 *   height → manifest scroller flex 1 minHeight 0) + 380px custody rail
 *   (own scroll). No dialogs; the rail is the one editing surface and the
 *   map/manifest are two synchronized views of the same selection.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): 1fr + 380
 *   grid → the map column gets ≈660px; the SVG scales by aspect ratio and
 *   every manifest column fits. Nothing squeezes.
 * - <= 980px: the grid stacks — map, then manifest, then the custody rail
 *   full-width below (rail loses its fixed height and grows with content).
 * - <= 640px (390px embed): the manifest drops its container/preservative
 *   column and group headers keep code + name (the stamp/bottle meta
 *   drops) — subtraction, not squeeze; header chips wrap; rail actions
 *   stay 40px+ and go full-width. Pin halos (r=16, ≈2.3× the visible pin
 *   area) help, but the honest touch path is that every pin action also
 *   exists as a full-width 32px manifest group row and 40px rail buttons.
 * Container policy: work-surface archetype — frame rows, one SVG stage,
 *   one dense table, one rail; no Cards. Site pins and manifest group
 *   headers are real <button>s (aria-pressed on the selection); every
 *   numeric cell is tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Tributary
 *   aqua): light-dark(#0E7490, #53DDF2) — #0E7490 on #FFFFFF ≈ 5.4:1,
 *   #53DDF2 on ~#1C1C1E ≈ 10.5:1 — used for the mark, water strokes, the
 *   selected ring, and collected pins. State pairs with math at the
 *   declaration: ok green light-dark(#15803D, #4ADE80) (≈5.0:1 / ≈9.6:1),
 *   tight amber light-dark(#B45309, #FBBF24) (≈4.7:1 / ≈10.1:1), expiring
 *   red light-dark(#DC2626, #F87171) (≈4.5:1 / ≈7.2:1). Tints are ≤16%
 *   alpha washes under text that keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · map stage 330 ·
 *   manifest group headers 32 · bottle rows 40 · custody rail 380 ·
 *   custody events 52 · deadline rows 44 · action buttons 40 · chips 22 ·
 *   pin r=9 with r=16 invisible halo. TYPE: 15/600 rail titles · 13/400–500
 *   row primary · 11/500 overlines + chips; tabular-nums on every time,
 *   count, and margin figure.
 * Fixture policy: one event log `Array<{siteId, kind, stamp}>` is the
 *   single state owner; site status, pin paint, polyline legs, manifest
 *   chips, custody spines, the deadline board, and all header chips
 *   re-derive from fixtures + events every render, so no aggregate can
 *   drift from the rows. Undo pops the last event; nothing else is stored.
 */

import {useMemo, useState} from 'react';

import {
  CheckCircle2Icon,
  ClipboardCheckIcon,
  DropletsIcon,
  FlaskConicalIcon,
  MapPinIcon,
  SnowflakeIcon,
  TimerIcon,
  TriangleAlertIcon,
  TruckIcon,
  UndoIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-water-quality-sampling-map';

// THE quarantined Tributary brand aqua. #0E7490 on #FFFFFF ≈ 5.4:1 (passes
// 4.5:1 for the 11–13px chip text it colors); #53DDF2 on a ~#1C1C1E dark
// surface ≈ 10.5:1. Water strokes, collected pins, selection rings.
const BRAND = 'light-dark(#0E7490, #53DDF2)';
// Text/glyph ON a solid brand fill (collected pin check): #FFFFFF on
// #0E7490 ≈ 5.4:1; #06272C on #53DDF2 ≈ 9.4:1 (white on #53DDF2 fails ~1.4:1).
const BRAND_ON = 'light-dark(#FFFFFF, #06272C)';
// Brand wash for selected rows/chips — a ≤14% tint; overlaid text uses
// BRAND or text tokens, which carry their own ratios.
const BRAND_TINT = 'light-dark(rgba(14, 116, 144, 0.10), rgba(83, 221, 242, 0.14))';
// OK/collected green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Tight-hold amber: #B45309 on #FFFFFF ≈ 4.7:1; #FBBF24 on #1C1C1E ≈ 10.1:1.
const TIGHT = 'light-dark(#B45309, #FBBF24)';
const TIGHT_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';
// Expiring/dry red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on #1C1C1E ≈ 7.2:1.
const EXPIRE = 'light-dark(#DC2626, #F87171)';
const EXPIRE_TINT = 'light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.14))';
// Water body wash under the stroked channels — a graphic tint, not text.
const WATER_TINT = 'light-dark(rgba(14, 116, 144, 0.10), rgba(83, 221, 242, 0.08))';

// ---------------------------------------------------------------------------
// TIME MODEL — minutes after midnight, all fixed. The demo's "now" is 09:42.
// ---------------------------------------------------------------------------

/** Fixed field clock: 09:42 = 582 min. */
const NOW_MIN = 582;
/** Courier leaves the staging cooler at 13:30 = 810 min. */
const COURIER_MIN = 810;
/** Samples are logged in at Cascade Analytical at 13:55 = 835 min. */
const LAB_MIN = 835;
/** Crew cadence: the k-th new collection stamps 09:42 + 12·k. */
const CADENCE_MIN = 12;

function fmtClock(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtDuration(min: number): string {
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) {
    return `${min < 0 ? '−' : ''}${m}m`;
  }
  return `${min < 0 ? '−' : ''}${h}h ${String(m).padStart(2, '0')}m`;
}

// ---------------------------------------------------------------------------
// ANALYTE TABLE — holds, methods, containers, preservatives.
// ---------------------------------------------------------------------------

type AnalyteId = 'BAC' | 'NUT' | 'TP' | 'TSS' | 'ME';

interface AnalyteSpec {
  id: AnalyteId;
  label: string;
  method: string;
  container: string;
  preservative: string;
  /** Regulatory hold time from collection, in minutes. */
  holdMin: number;
  holdLabel: string;
}

const ANALYTES: Record<AnalyteId, AnalyteSpec> = {
  BAC: {
    id: 'BAC',
    label: 'E. coli (Colilert)',
    method: 'SM 9223B',
    container: '250 mL sterile poly',
    preservative: 'Na₂S₂O₃ · ≤10 °C',
    holdMin: 360,
    holdLabel: '6 h',
  },
  NUT: {
    id: 'NUT',
    label: 'Nitrate + nitrite',
    method: 'EPA 353.2',
    container: '500 mL poly',
    preservative: 'H₂SO₄ to pH <2 · ≤6 °C',
    holdMin: 2880,
    holdLabel: '48 h',
  },
  TP: {
    id: 'TP',
    label: 'Total phosphorus',
    method: 'SM 4500-P E',
    container: '125 mL poly',
    preservative: 'H₂SO₄ to pH <2',
    holdMin: 40320,
    holdLabel: '28 d',
  },
  TSS: {
    id: 'TSS',
    label: 'Total suspended solids',
    method: 'SM 2540 D',
    container: '1 L poly',
    preservative: '≤6 °C',
    holdMin: 10080,
    holdLabel: '7 d',
  },
  ME: {
    id: 'ME',
    label: 'Dissolved metals (Cu, Zn, Pb)',
    method: 'EPA 200.8',
    container: '500 mL poly · field-filtered 0.45 µm',
    preservative: 'HNO₃ to pH <2',
    holdMin: 259200,
    holdLabel: '6 mo',
  },
};

// ---------------------------------------------------------------------------
// SITE FIXTURES — nine sites in run order along the schematic watershed.
// Coordinates live in the 760×520 SVG space; every pin sits ON a channel
// path. Seed states: S-01…S-04 collected pre-load (stamps hand-checked in
// the @input header); S-05…S-09 pending.
// ---------------------------------------------------------------------------

type SiteKind = 'mainstem' | 'tributary' | 'confluence' | 'outfall';

interface SiteFixture {
  id: string;
  /** Run order 1–9; the polyline visits sites in this order. */
  order: number;
  name: string;
  kind: SiteKind;
  x: number;
  y: number;
  /** Analyte panel — one bottle per entry; 'BACFD' is the field duplicate. */
  panel: Array<AnalyteId | 'BACFD'>;
  /** Pre-load collection stamp in minutes, if the crew already visited. */
  seedCollectedMin?: number;
  note?: string;
}

const RUN = {
  id: 'WQ-2026-081',
  title: 'Alder Creek watershed · Thu Jul 9, 2026',
  crew: 'Crew 2 — R. Okafor · D. Whitfield',
  cooler: 'Cooler C2 · wet ice · 3.8 °C at 09:30 check',
  lab: 'Cascade Analytical, Fairhaven',
};

const SITES: SiteFixture[] = [
  {
    id: 'S-01',
    order: 1,
    name: 'Alder Creek at River Rd bridge',
    kind: 'mainstem',
    x: 100,
    y: 452,
    panel: ['BAC', 'NUT', 'TP'],
    seedCollectedMin: 425, // 07:05
  },
  {
    id: 'S-02',
    order: 2,
    name: 'Alder Creek below Barlow weir',
    kind: 'mainstem',
    x: 215,
    y: 388,
    panel: ['BAC', 'NUT', 'TSS'],
    seedCollectedMin: 484, // 08:04
  },
  {
    id: 'S-03',
    order: 3,
    name: 'Millrace Slough confluence',
    kind: 'confluence',
    x: 330,
    y: 300,
    panel: ['BAC', 'NUT', 'TP', 'ME'],
    seedCollectedMin: 511, // 08:31
  },
  {
    id: 'S-04',
    order: 4,
    name: 'Millrace Slough at Quarry Rd culvert',
    kind: 'tributary',
    x: 228,
    y: 208,
    panel: ['BAC', 'TSS'],
    seedCollectedMin: 538, // 08:58
  },
  {
    id: 'S-05',
    order: 5,
    name: 'Alder Creek at Fairhaven gauge (USGS 14211814)',
    kind: 'mainstem',
    x: 432,
    y: 243,
    panel: ['BAC', 'NUT', 'TP'],
  },
  {
    id: 'S-06',
    order: 6,
    name: 'Cold Spring Branch at Larkin Meadow',
    kind: 'tributary',
    x: 565,
    y: 272,
    panel: ['BAC', 'NUT', 'ME'],
    note: 'Access gate locked — call ranger dispatch before entry.',
  },
  {
    id: 'S-07',
    order: 7,
    name: 'Cold Spring Branch headwater spring box',
    kind: 'tributary',
    x: 698,
    y: 312,
    panel: ['BAC', 'BACFD', 'NUT', 'TP'],
    note: 'QA plan requires a field duplicate for E. coli at this site.',
  },
  {
    // Stress fixture: the 58-char site name exercises pin-callout and
    // manifest-header truncation.
    id: 'S-08',
    order: 8,
    name: 'Unnamed trib below Fairhaven WWTP Outfall 002 (right bank)',
    kind: 'outfall',
    x: 512,
    y: 168,
    panel: ['BAC', 'NUT', 'TP', 'TSS', 'ME'],
    note: 'Expanded panel — permit compliance point downstream of Outfall 002.',
  },
  {
    id: 'S-09',
    order: 9,
    name: 'Alder Creek headwaters at Forest Rd 23',
    kind: 'mainstem',
    x: 662,
    y: 78,
    panel: ['BAC', 'NUT'],
  },
];

const SITE_BY_ID = new Map(SITES.map(site => [site.id, site]));

const KIND_LABELS: Record<SiteKind, string> = {
  mainstem: 'Mainstem',
  tributary: 'Tributary',
  confluence: 'Confluence',
  outfall: 'Outfall reach',
};

// ---------------------------------------------------------------------------
// DERIVATION — one event log is the single state owner. Everything below
// (site status, pins, chips, custody spines, deadline board, header stats)
// is a pure function of SITES + events.
// ---------------------------------------------------------------------------

interface FieldEvent {
  siteId: string;
  kind: 'collected' | 'dry';
  stamp: number;
}

type SiteStatus =
  | {state: 'collected'; stamp: number; viaEvent: boolean}
  | {state: 'dry'; stamp: number; viaEvent: boolean}
  | {state: 'pending'};

function siteStatus(site: SiteFixture, events: FieldEvent[]): SiteStatus {
  const event = events.find(entry => entry.siteId === site.id);
  if (event != null) {
    return {state: event.kind, stamp: event.stamp, viaEvent: true};
  }
  if (site.seedCollectedMin != null) {
    return {state: 'collected', stamp: site.seedCollectedMin, viaEvent: false};
  }
  return {state: 'pending'};
}

type HoldState = 'awaiting' | 'ok' | 'tight' | 'expiring' | 'nosample';

interface BottleRow {
  bottleId: string;
  siteId: string;
  analyte: AnalyteSpec;
  isFieldDup: boolean;
  hold: HoldState;
  /** Hold expiry in minutes, when collected. */
  expiresMin?: number;
  /** expiry − lab receipt (13:55); negative = expires before receipt. */
  labMarginMin?: number;
  collectedMin?: number;
}

/**
 * Hold-chip ladder, checked against the 13:55 lab receipt:
 *   expiring  = expiry < receipt (the sample dies in the courier van)
 *   tight     = margin < 45 min
 *   ok        = everything else
 */
function bottleRows(site: SiteFixture, status: SiteStatus): BottleRow[] {
  return site.panel.map(entry => {
    const isFieldDup = entry === 'BACFD';
    const analyte = ANALYTES[isFieldDup ? 'BAC' : (entry as AnalyteId)];
    const bottleId = `WQ-081-${site.id.replace('-', '')}-${
      isFieldDup ? 'BAC-FD' : analyte.id
    }`;
    if (status.state === 'dry') {
      return {bottleId, siteId: site.id, analyte, isFieldDup, hold: 'nosample'};
    }
    if (status.state === 'pending') {
      return {bottleId, siteId: site.id, analyte, isFieldDup, hold: 'awaiting'};
    }
    const expiresMin = status.stamp + analyte.holdMin;
    const labMarginMin = expiresMin - LAB_MIN;
    const hold: HoldState =
      labMarginMin < 0 ? 'expiring' : labMarginMin < 45 ? 'tight' : 'ok';
    return {
      bottleId,
      siteId: site.id,
      analyte,
      isFieldDup,
      hold,
      expiresMin,
      labMarginMin,
      collectedMin: status.stamp,
    };
  });
}

const HOLD_META: Record<HoldState, {label: string; color: string; tint: string}> = {
  awaiting: {
    label: 'Awaiting collection',
    color: 'var(--color-text-secondary)',
    tint: 'transparent',
  },
  ok: {label: 'On ice · OK', color: OK, tint: OK_TINT},
  tight: {label: 'Tight hold', color: TIGHT, tint: TIGHT_TINT},
  expiring: {label: 'Expires pre-receipt', color: EXPIRE, tint: EXPIRE_TINT},
  nosample: {label: 'No sample — site dry', color: EXPIRE, tint: EXPIRE_TINT},
};

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector is prefixed with the scope class. The density
// grid repeats verbatim: header 56 · map stage 330 · group headers 32 ·
// bottle rows 40 · rail 380 · custody events 52 · deadline rows 44 · action
// buttons 40 · chips 22.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  background: var(--color-background-body);
}
.${SCOPE} .wqs-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
}
.${SCOPE} :is(button, [role='button']):focus-visible {
  outline: 2px solid ${BRAND};
  outline-offset: 2px;
}
/* ---- header chips (22px) ------------------------------------------------ */
.${SCOPE} .wqs-brandmark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${BRAND_TINT};
  flex-shrink: 0;
}
.${SCOPE} .wqs-chiprow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${SCOPE} .wqs-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.${SCOPE} .wqs-chip[data-tone='brand'] { color: ${BRAND}; background: ${BRAND_TINT}; border-color: transparent; }
.${SCOPE} .wqs-chip[data-tone='ok'] { color: ${OK}; background: ${OK_TINT}; border-color: transparent; }
.${SCOPE} .wqs-chip[data-tone='tight'] { color: ${TIGHT}; background: ${TIGHT_TINT}; border-color: transparent; }
.${SCOPE} .wqs-chip[data-tone='expire'] { color: ${EXPIRE}; background: ${EXPIRE_TINT}; border-color: transparent; }
/* ---- frame: 1fr work column + 380px custody rail ------------------------ */
.${SCOPE} .wqs-frame {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
}
.${SCOPE} .wqs-work {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: var(--border-width) solid var(--color-border);
}
/* ---- map stage (330px) --------------------------------------------------- */
.${SCOPE} .wqs-mapstage {
  position: relative;
  height: 330px;
  flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  overflow: hidden;
}
.${SCOPE} .wqs-mapsvg {
  display: block;
  width: 100%;
  height: 100%;
}
.${SCOPE} .wqs-pin {
  cursor: pointer;
}
.${SCOPE} .wqs-pin circle,
.${SCOPE} .wqs-pin path,
.${SCOPE} .wqs-pin polygon {
  transition: transform 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .wqs-pin circle,
  .${SCOPE} .wqs-pin path,
  .${SCOPE} .wqs-pin polygon,
  .${SCOPE} .wqs-runleg { transition: none; }
}
.${SCOPE} .wqs-maplegend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: color-mix(in srgb, var(--color-background-body) 90%, transparent);
  pointer-events: none;
}
.${SCOPE} .wqs-legendrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* ---- manifest table ------------------------------------------------------ */
.${SCOPE} .wqs-manifest {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${SCOPE} .wqs-manifesthead {
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) minmax(0, 1fr) 168px;
  gap: var(--spacing-2);
  align-items: center;
  height: 32px;
  padding: 0 var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* Site group header: a full-row 32px button; aria-pressed = selected site. */
.${SCOPE} .wqs-grouprow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  min-height: 32px;
  padding: 2px var(--spacing-4);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  text-align: left;
  cursor: pointer;
}
.${SCOPE} .wqs-grouprow[aria-pressed='true'] {
  background: ${BRAND_TINT};
  box-shadow: inset 2px 0 0 0 ${BRAND};
}
.${SCOPE} .wqs-groupcode {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${BRAND};
  flex-shrink: 0;
  width: 34px;
}
.${SCOPE} .wqs-groupname {
  min-width: 0;
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .wqs-groupmeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}
/* Bottle rows: 40px, four columns matching the sticky head. */
.${SCOPE} .wqs-bottlerow {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) minmax(0, 1fr) 168px;
  gap: var(--spacing-2);
  align-items: center;
  min-height: 40px;
  padding: 0 var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .wqs-bottlerow[data-selected='true'] {
  background: color-mix(in srgb, var(--color-background-muted) 60%, transparent);
}
.${SCOPE} .wqs-bottleid {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .wqs-analyte {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${SCOPE} .wqs-analyte .wqs-primary {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .wqs-analyte .wqs-secondary,
.${SCOPE} .wqs-container {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .wqs-holdcell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.${SCOPE} .wqs-holdchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .wqs-holdsub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* ---- custody rail (380px) ------------------------------------------------ */
.${SCOPE} .wqs-rail {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${SCOPE} .wqs-railsection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${SCOPE} .wqs-railtitle {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}
.${SCOPE} .wqs-overline {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .wqs-notebox {
  padding: 8px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${SCOPE} .wqs-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
/* Custody spine: 52px events with a rail dot + connector. */
.${SCOPE} .wqs-spine {
  display: flex;
  flex-direction: column;
}
.${SCOPE} .wqs-event {
  position: relative;
  display: flex;
  gap: var(--spacing-3);
  min-height: 52px;
  padding-left: 2px;
}
.${SCOPE} .wqs-eventdot {
  position: relative;
  width: 12px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.${SCOPE} .wqs-eventdot::before {
  content: '';
  position: absolute;
  top: 16px;
  bottom: -4px;
  width: 2px;
  background: var(--color-border);
}
.${SCOPE} .wqs-event:last-child .wqs-eventdot::before { display: none; }
.${SCOPE} .wqs-eventdot::after {
  content: '';
  position: absolute;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-background-body);
}
.${SCOPE} .wqs-event[data-done='true'] .wqs-eventdot::after {
  border-color: ${BRAND};
  background: ${BRAND};
}
.${SCOPE} .wqs-event[data-alert='true'] .wqs-eventdot::after {
  border-color: ${EXPIRE};
  background: ${EXPIRE};
}
.${SCOPE} .wqs-eventbody {
  min-width: 0;
  padding-bottom: var(--spacing-2);
}
.${SCOPE} .wqs-eventtitle { font-size: 13px; font-weight: 500; }
.${SCOPE} .wqs-event[data-done='false'] .wqs-eventtitle { color: var(--color-text-secondary); font-weight: 400; }
.${SCOPE} .wqs-eventmeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
/* Deadline board: 44px rows sorted by lab margin. */
.${SCOPE} .wqs-deadline {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 4px 8px;
  border-radius: 8px;
}
.${SCOPE} .wqs-deadline + .wqs-deadline { margin-top: 4px; }
.${SCOPE} .wqs-deadlinebody { min-width: 0; flex: 1; }
.${SCOPE} .wqs-deadlineid {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .wqs-deadlinemeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .wqs-margin {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* ---- responsive subtraction ---------------------------------------------- */
@media (max-width: 980px) {
  .${SCOPE} { height: auto; min-height: 100dvh; }
  .${SCOPE} .wqs-frame { grid-template-columns: minmax(0, 1fr); }
  .${SCOPE} .wqs-work { border-right: none; }
  .${SCOPE} .wqs-manifest { flex: none; max-height: 480px; }
  .${SCOPE} .wqs-rail { border-top: var(--border-width) solid var(--color-border); }
}
@media (max-width: 640px) {
  .${SCOPE} .wqs-manifesthead,
  .${SCOPE} .wqs-bottlerow { grid-template-columns: minmax(0, 1fr) 148px; }
  .${SCOPE} .wqs-bottleid, .${SCOPE} .wqs-container,
  .${SCOPE} .wqs-manifesthead > :nth-child(1),
  .${SCOPE} .wqs-manifesthead > :nth-child(3) { display: none; }
  .${SCOPE} .wqs-groupmeta { display: none; }
  .${SCOPE} .wqs-actions > * { width: 100%; }
  .${SCOPE} .wqs-mapstage { height: 300px; }
}
`;

// ---------------------------------------------------------------------------
// BRAND MARK — Tributary: three streams converging to one channel.
// ---------------------------------------------------------------------------

function TributaryMark() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden focusable="false">
      <path
        d="M3 3 C 5 8, 7 10, 10 11.5"
        fill="none"
        stroke={BRAND}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M17 3 C 15 8, 13 10, 10 11.5"
        fill="none"
        stroke={BRAND}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M10 5.5 V 11.5"
        fill="none"
        stroke={BRAND}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M10 11.5 C 10 14.5, 10 16, 10 17.5"
        fill="none"
        stroke={BRAND}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// WATERSHED MAP — schematic SVG. Channels are stroked paths over a wash; the
// run-order polyline solidifies leg by leg; pins are focusable buttons.
// ---------------------------------------------------------------------------

/** Channel geometry (760×520 space). Site pins sit on these paths. */
const CHANNELS = [
  {
    id: 'mainstem',
    label: 'Alder Creek',
    d: 'M 690 50 C 620 120 560 170 470 220 C 380 270 300 330 230 380 C 170 424 120 450 60 480',
    width: 9,
  },
  {
    id: 'millrace',
    label: 'Millrace Slough',
    d: 'M 150 110 C 200 180 260 240 330 300',
    width: 5.5,
  },
  {
    id: 'coldspring',
    label: 'Cold Spring Branch',
    d: 'M 720 316 C 640 300 555 280 462 236',
    width: 5.5,
  },
  {
    id: 'unnamed',
    label: '',
    d: 'M 545 118 C 530 142 512 172 480 210',
    width: 3.5,
  },
] as const;

/** Downstream flow chevrons along the mainstem (pure decoration). */
const FLOW_ARROWS = [
  {x: 520, y: 196, angle: 208},
  {x: 292, y: 336, angle: 216},
  {x: 128, y: 446, angle: 222},
];

interface PinPaint {
  state: 'collected' | 'pending' | 'dry';
  selected: boolean;
}

function WatershedMap({
  statuses,
  selectedId,
  onSelect,
}: {
  statuses: Map<string, SiteStatus>;
  selectedId: string;
  onSelect: (siteId: string) => void;
}) {
  const ordered = [...SITES].sort((a, b) => a.order - b.order);
  return (
    <svg
      className="wqs-mapsvg"
      viewBox="0 0 760 520"
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Schematic map of the Alder Creek watershed with nine sampling sites">
      {/* Valley wash behind the channels. */}
      <path
        d="M 690 50 C 620 120 560 170 470 220 C 380 270 300 330 230 380 C 170 424 120 450 60 480 L 60 520 L 760 520 L 760 50 Z"
        fill={WATER_TINT}
        opacity={0.35}
      />
      {/* Channels. */}
      {CHANNELS.map(channel => (
        <path
          key={channel.id}
          d={channel.d}
          fill="none"
          stroke={BRAND}
          strokeOpacity={0.55}
          strokeWidth={channel.width}
          strokeLinecap="round"
        />
      ))}
      {/* Channel names ride their paths' clear side. */}
      <text x={352} y={452} fontSize={12} fontStyle="italic" fill="var(--color-text-secondary)">
        Alder Creek
      </text>
      <text x={132} y={158} fontSize={11} fontStyle="italic" fill="var(--color-text-secondary)">
        Millrace Slough
      </text>
      <text x={556} y={320} fontSize={11} fontStyle="italic" fill="var(--color-text-secondary)">
        Cold Spring Branch
      </text>
      {/* Flow chevrons. */}
      {FLOW_ARROWS.map(arrow => (
        <g
          key={`${arrow.x}-${arrow.y}`}
          transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
          aria-hidden>
          <polyline
            points="-5,-4 3,0 -5,4"
            fill="none"
            stroke={BRAND}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        </g>
      ))}
      {/* WWTP Outfall 002 marker: a small plant square + discharge tick. */}
      <g aria-hidden>
        <rect
          x={536}
          y={92}
          width={18}
          height={18}
          rx={3}
          fill="var(--color-background-body)"
          stroke="var(--color-text-secondary)"
          strokeWidth={1.5}
        />
        <path
          d="M 540 106 v -6 h 3 v 6 m 2 0 v -8 h 3 v 8"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth={1.4}
        />
        <text x={560} y={100} fontSize={10} fill="var(--color-text-secondary)">
          WWTP Outfall 002
        </text>
      </g>
      {/* Run-order polyline: legs solidify once the downstream stop is
          visited (collected or dry). */}
      {ordered.slice(0, -1).map((site, index) => {
        const next = ordered[index + 1];
        const nextStatus = statuses.get(next.id);
        const done = nextStatus != null && nextStatus.state !== 'pending';
        return (
          <line
            key={`leg-${site.id}`}
            className="wqs-runleg"
            x1={site.x}
            y1={site.y}
            x2={next.x}
            y2={next.y}
            stroke={done ? BRAND : 'var(--color-text-secondary)'}
            strokeOpacity={done ? 0.9 : 0.35}
            strokeWidth={done ? 2.5 : 1.5}
            strokeDasharray={done ? undefined : '4 5'}
          />
        );
      })}
      {/* Site pins — real focusable buttons with an invisible r=16 halo. */}
      {ordered.map(site => {
        const status = statuses.get(site.id) ?? {state: 'pending' as const};
        const paint: PinPaint = {
          state: status.state,
          selected: site.id === selectedId,
        };
        const statusText =
          status.state === 'collected'
            ? `collected at ${fmtClock(status.stamp)}`
            : status.state === 'dry'
              ? `marked dry at ${fmtClock(status.stamp)}`
              : 'pending collection';
        return (
          <g
            key={site.id}
            className="wqs-pin"
            role="button"
            tabIndex={0}
            aria-pressed={paint.selected}
            aria-label={`${site.id} — ${site.name}, ${statusText}`}
            onClick={() => onSelect(site.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(site.id);
              }
            }}>
            <circle cx={site.x} cy={site.y} r={16} fill="transparent" />
            {paint.selected && (
              <circle
                cx={site.x}
                cy={site.y}
                r={13.5}
                fill="none"
                stroke={BRAND}
                strokeWidth={2}
              />
            )}
            {paint.state === 'dry' ? (
              <g>
                <polygon
                  points={`${site.x},${site.y - 10} ${site.x + 10},${site.y + 8} ${site.x - 10},${site.y + 8}`}
                  fill={EXPIRE_TINT}
                  stroke={EXPIRE}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <line
                  x1={site.x}
                  y1={site.y - 4}
                  x2={site.x}
                  y2={site.y + 2}
                  stroke={EXPIRE}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle cx={site.x} cy={site.y + 5.4} r={1.2} fill={EXPIRE} />
              </g>
            ) : paint.state === 'collected' ? (
              <g>
                <circle cx={site.x} cy={site.y} r={9} fill={BRAND} />
                <path
                  d={`M ${site.x - 4} ${site.y} l 3 3 l 5.5 -6`}
                  fill="none"
                  stroke={BRAND_ON}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              <circle
                cx={site.x}
                cy={site.y}
                r={9}
                fill="var(--color-background-body)"
                stroke="var(--color-text-secondary)"
                strokeWidth={2.4}
                strokeDasharray="3 3"
              />
            )}
            {/* Pin label with a background halo so it reads over channels. */}
            <text
              x={site.x}
              y={site.y - 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="var(--color-text-primary)"
              stroke="var(--color-background-muted)"
              strokeWidth={3}
              paintOrder="stroke"
              pointerEvents="none">
              {site.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HOLD CHIP — the manifest's live countdown cell.
// ---------------------------------------------------------------------------

function HoldChipCell({row}: {row: BottleRow}) {
  const meta = HOLD_META[row.hold];
  return (
    <div className="wqs-holdcell">
      <span
        className="wqs-holdchip"
        style={{color: meta.color, background: meta.tint}}>
        {row.hold === 'expiring' || row.hold === 'nosample' ? (
          <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
        ) : row.hold === 'ok' ? (
          <Icon icon={SnowflakeIcon} size="xsm" color="inherit" />
        ) : row.hold === 'tight' ? (
          <Icon icon={TimerIcon} size="xsm" color="inherit" />
        ) : null}
        {meta.label}
      </span>
      {row.expiresMin != null && row.labMarginMin != null ? (
        <span className="wqs-holdsub">
          expires {fmtClock(row.expiresMin)} ·{' '}
          {row.labMarginMin < 0
            ? `${fmtDuration(row.labMarginMin)} vs 13:55 receipt`
            : `${fmtDuration(row.labMarginMin)} margin`}
        </span>
      ) : (
        <span className="wqs-holdsub">
          {row.hold === 'awaiting' ? `hold ${row.analyte.holdLabel} once drawn` : 'run exception logged'}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function WaterQualitySamplingMapTemplate() {
  // THE single state owner: the field event log. Site status, pins, chips,
  // custody spines, the deadline board, and header stats all re-derive.
  const [events, setEvents] = useState<FieldEvent[]>([]);
  const [selectedId, setSelectedId] = useState('S-05');
  const [announcement, setAnnouncement] = useState('');

  const statuses = useMemo(() => {
    const map = new Map<string, SiteStatus>();
    for (const site of SITES) {
      map.set(site.id, siteStatus(site, events));
    }
    return map;
  }, [events]);

  const manifest = useMemo(() => {
    const ordered = [...SITES].sort((a, b) => a.order - b.order);
    return ordered.map(site => ({
      site,
      status: statuses.get(site.id) ?? ({state: 'pending'} as SiteStatus),
      bottles: bottleRows(site, statuses.get(site.id) ?? {state: 'pending'}),
    }));
  }, [statuses]);

  // ---- derived run aggregates (cross-check: 4/9 · 12 on ice · 1 expiring ·
  // 2 tight at first render, per the @input arithmetic) ----
  const collectedCount = manifest.filter(entry => entry.status.state === 'collected').length;
  const dryCount = manifest.filter(entry => entry.status.state === 'dry').length;
  const allBottles = manifest.flatMap(entry => entry.bottles);
  const onIceCount = allBottles.filter(
    row => row.hold === 'ok' || row.hold === 'tight' || row.hold === 'expiring',
  ).length;
  const expiringCount = allBottles.filter(row => row.hold === 'expiring').length;
  const tightCount = allBottles.filter(row => row.hold === 'tight').length;

  /** Tightest holds across the run: collected bottles by lab margin. */
  const deadlineBoard = allBottles
    .filter(row => row.labMarginMin != null)
    .sort((a, b) => (a.labMarginMin ?? 0) - (b.labMarginMin ?? 0))
    .slice(0, 6);

  const selected = SITE_BY_ID.get(selectedId) ?? SITES[0];
  const selectedStatus = statuses.get(selected.id) ?? {state: 'pending' as const};
  const selectedBottles = bottleRows(selected, selectedStatus);

  /** The k-th field log stamps 09:42 + 12·k — the crew cadence. */
  const nextStamp = NOW_MIN + CADENCE_MIN * events.length;

  const logCollection = () => {
    if (selectedStatus.state !== 'pending') {
      return;
    }
    setEvents(prev => {
      const stamp = NOW_MIN + CADENCE_MIN * prev.length;
      return [...prev, {siteId: selected.id, kind: 'collected', stamp}];
    });
    setAnnouncement(
      `${selected.id} collected at ${fmtClock(nextStamp)} — ${selected.panel.length} bottles on ice, custody event appended, hold clocks started.`,
    );
  };

  const markDry = () => {
    if (selectedStatus.state !== 'pending') {
      return;
    }
    setEvents(prev => {
      const stamp = NOW_MIN + CADENCE_MIN * prev.length;
      return [...prev, {siteId: selected.id, kind: 'dry', stamp}];
    });
    setAnnouncement(
      `${selected.id} marked dry at ${fmtClock(nextStamp)} — ${selected.panel.length} bottles canceled, run exception logged.`,
    );
  };

  const undoFieldLog = () => {
    if (!('viaEvent' in selectedStatus) || !selectedStatus.viaEvent) {
      return;
    }
    setEvents(prev => prev.filter(entry => entry.siteId !== selected.id));
    setAnnouncement(`Field log for ${selected.id} undone — site is pending again.`);
  };

  const selectSite = (siteId: string) => {
    setSelectedId(siteId);
    const site = SITE_BY_ID.get(siteId);
    if (site != null) {
      setAnnouncement(`Selected ${siteId} — ${site.name}.`);
    }
  };

  // ---- custody spine for the selected site --------------------------------
  const spine: Array<{
    title: string;
    meta: string;
    done: boolean;
    alert?: boolean;
  }> =
    selectedStatus.state === 'dry'
      ? [
          {title: 'Bottle set prepared', meta: '05:40 · staging, Cooler C2', done: true},
          {
            title: 'Site dry — no flow, no sample',
            meta: `${fmtClock(selectedStatus.stamp)} · ${RUN.crew}`,
            done: true,
            alert: true,
          },
          {title: 'On ice — Cooler C2', meta: 'Not applicable — no sample', done: false},
          {title: 'Courier pickup', meta: 'Not applicable — no sample', done: false},
          {title: `Lab receipt — ${RUN.lab}`, meta: 'Not applicable — no sample', done: false},
        ]
      : [
          {title: 'Bottle set prepared', meta: '05:40 · staging, Cooler C2', done: true},
          {
            title: 'Sample collected',
            meta:
              selectedStatus.state === 'collected'
                ? `${fmtClock(selectedStatus.stamp)} · ${RUN.crew}`
                : `Pending · next crew stamp ${fmtClock(nextStamp)}`,
            done: selectedStatus.state === 'collected',
          },
          {
            title: 'On ice — Cooler C2',
            meta:
              selectedStatus.state === 'collected'
                ? `${fmtClock(selectedStatus.stamp)} · with collection · wet ice`
                : 'Follows collection',
            done: selectedStatus.state === 'collected',
          },
          {title: 'Courier pickup', meta: `${fmtClock(COURIER_MIN)} · staging`, done: false},
          {title: `Lab receipt — ${RUN.lab}`, meta: `${fmtClock(LAB_MIN)} · scheduled`, done: false},
        ];

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <div className="wqs-vh" aria-live="polite">
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
            <span className="wqs-brandmark">
              <TributaryMark />
            </span>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Tributary · Run {RUN.id}</Heading>
                <Text type="supporting" size="sm" color="secondary">
                  {RUN.title} · {RUN.crew}
                </Text>
              </VStack>
            </StackItem>
            <div className="wqs-chiprow">
              <span className="wqs-chip" data-tone="brand">
                <Icon icon={TimerIcon} size="xsm" color="inherit" />
                Field clock {fmtClock(NOW_MIN)}
              </span>
              <span className="wqs-chip">
                <Icon icon={MapPinIcon} size="xsm" color="inherit" />
                {collectedCount}/{SITES.length} sites collected
              </span>
              <span className="wqs-chip">
                <Icon icon={SnowflakeIcon} size="xsm" color="inherit" />
                {onIceCount} bottles on ice
              </span>
              {expiringCount > 0 && (
                <span className="wqs-chip" data-tone="expire">
                  <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                  {expiringCount} expiring
                </span>
              )}
              {tightCount > 0 && (
                <span className="wqs-chip" data-tone="tight">
                  <Icon icon={TimerIcon} size="xsm" color="inherit" />
                  {tightCount} tight
                </span>
              )}
              {expiringCount === 0 && tightCount === 0 && (
                <span className="wqs-chip" data-tone="ok">
                  <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
                  Holds clear
                </span>
              )}
              {dryCount > 0 && (
                <span className="wqs-chip" data-tone="expire">
                  {dryCount} site{dryCount === 1 ? '' : 's'} dry
                </span>
              )}
              <span className="wqs-chip">
                <Icon icon={TruckIcon} size="xsm" color="inherit" />
                Courier {fmtClock(COURIER_MIN)} → lab {fmtClock(LAB_MIN)}
              </span>
            </div>
          </HStack>
          </LayoutHeader>
        }
        content={
        <LayoutContent padding={0} role="main" label="Sampling run">
          <div className="wqs-frame">
            {/* -------- work column: map stage + bottle manifest -------- */}
            <div className="wqs-work">
              <div className="wqs-mapstage">
                <WatershedMap
                  statuses={statuses}
                  selectedId={selectedId}
                  onSelect={selectSite}
                />
                <div className="wqs-maplegend" aria-hidden>
                  <span className="wqs-legendrow">
                    <svg width={14} height={14} viewBox="0 0 14 14">
                      <circle cx={7} cy={7} r={5.5} fill={BRAND} />
                      <path d="M 4.4 7 l 1.8 1.8 l 3.4 -3.8" fill="none" stroke={BRAND_ON} strokeWidth={1.6} strokeLinecap="round" />
                    </svg>
                    Collected
                  </span>
                  <span className="wqs-legendrow">
                    <svg width={14} height={14} viewBox="0 0 14 14">
                      <circle cx={7} cy={7} r={5} fill="none" stroke="var(--color-text-secondary)" strokeWidth={1.8} strokeDasharray="2.4 2.4" />
                    </svg>
                    Pending
                  </span>
                  <span className="wqs-legendrow">
                    <svg width={14} height={14} viewBox="0 0 14 14">
                      <polygon points="7,1.5 13,12.5 1,12.5" fill={EXPIRE_TINT} stroke={EXPIRE} strokeWidth={1.4} strokeLinejoin="round" />
                    </svg>
                    Dry / exception
                  </span>
                </div>
              </div>
              {/* -------- bottle manifest: 29 rows, grouped by site -------- */}
              <div className="wqs-manifest" role="region" aria-label="Bottle manifest">
                <div className="wqs-manifesthead" aria-hidden>
                  <span>Bottle</span>
                  <span>Analyte · method</span>
                  <span>Container · preservative</span>
                  <span>Hold status</span>
                </div>
                {manifest.map(entry => (
                  <div key={entry.site.id}>
                    <button
                      type="button"
                      className="wqs-grouprow"
                      aria-pressed={entry.site.id === selectedId}
                      onClick={() => selectSite(entry.site.id)}>
                      <span className="wqs-groupcode">{entry.site.id}</span>
                      <span className="wqs-groupname">{entry.site.name}</span>
                      <span className="wqs-groupmeta">
                        {entry.status.state === 'collected'
                          ? `collected ${fmtClock(entry.status.stamp)}`
                          : entry.status.state === 'dry'
                            ? `dry ${fmtClock(entry.status.stamp)}`
                            : `stop ${entry.site.order} · pending`}
                        {' · '}
                        {entry.bottles.length} bottle{entry.bottles.length === 1 ? '' : 's'}
                      </span>
                    </button>
                    {entry.bottles.map(row => (
                      <div
                        key={row.bottleId}
                        className="wqs-bottlerow"
                        data-selected={entry.site.id === selectedId}>
                        <span className="wqs-bottleid">{row.bottleId}</span>
                        <span className="wqs-analyte">
                          <span className="wqs-primary">
                            {row.analyte.label}
                            {row.isFieldDup ? ' — field duplicate' : ''}
                          </span>
                          <span className="wqs-secondary">
                            {row.analyte.method} · hold {row.analyte.holdLabel}
                          </span>
                        </span>
                        <span className="wqs-container">
                          {row.analyte.container} · {row.analyte.preservative}
                        </span>
                        <HoldChipCell row={row} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* -------- custody rail (380px) -------- */}
            <div className="wqs-rail" role="complementary" aria-label="Site custody">
              <div className="wqs-railsection">
                <span className="wqs-overline">
                  Stop {selected.order} of {SITES.length} · {KIND_LABELS[selected.kind]}
                </span>
                <h2 className="wqs-railtitle">
                  {selected.id} — {selected.name}
                </h2>
                {selected.note != null && (
                  <div className="wqs-notebox">{selected.note}</div>
                )}
                <div className="wqs-chiprow">
                  {selectedStatus.state === 'collected' ? (
                    <span className="wqs-chip" data-tone="ok">
                      <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
                      Collected {fmtClock(selectedStatus.stamp)}
                    </span>
                  ) : selectedStatus.state === 'dry' ? (
                    <span className="wqs-chip" data-tone="expire">
                      <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                      Dry {fmtClock(selectedStatus.stamp)}
                    </span>
                  ) : (
                    <span className="wqs-chip">
                      <Icon icon={DropletsIcon} size="xsm" color="inherit" />
                      Pending · {selectedBottles.length} bottles staged
                    </span>
                  )}
                </div>
                <div className="wqs-actions">
                  {selectedStatus.state === 'pending' && (
                    <>
                      <Button
                        label={`Log collection · ${fmtClock(nextStamp)}`}
                        icon={<Icon icon={ClipboardCheckIcon} size="sm" />}
                        onClick={logCollection}
                      />
                      <Button
                        label="Mark site dry"
                        variant="secondary"
                        icon={<Icon icon={TriangleAlertIcon} size="sm" />}
                        onClick={markDry}
                      />
                    </>
                  )}
                  {'viaEvent' in selectedStatus && selectedStatus.viaEvent && (
                    <Button
                      label="Undo field log"
                      variant="ghost"
                      icon={<Icon icon={UndoIcon} size="sm" />}
                      onClick={undoFieldLog}
                    />
                  )}
                  {selectedStatus.state === 'collected' &&
                    !('viaEvent' in selectedStatus && selectedStatus.viaEvent) && (
                      <Text type="supporting" size="sm" color="secondary">
                        Logged before this session — custody locked.
                      </Text>
                    )}
                </div>
              </div>
              <div className="wqs-railsection">
                <span className="wqs-overline">Chain of custody</span>
                <div className="wqs-spine">
                  {spine.map(step => (
                    <div
                      key={step.title}
                      className="wqs-event"
                      data-done={step.done}
                      data-alert={step.alert === true}>
                      <span className="wqs-eventdot" aria-hidden />
                      <div className="wqs-eventbody">
                        <div className="wqs-eventtitle">{step.title}</div>
                        <div className="wqs-eventmeta">{step.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Text type="supporting" size="sm" color="secondary">
                  {RUN.cooler}
                </Text>
              </div>
              <div className="wqs-railsection">
                <span className="wqs-overline">
                  Tightest holds · vs {fmtClock(LAB_MIN)} lab receipt
                </span>
                {deadlineBoard.map(row => {
                  const meta = HOLD_META[row.hold];
                  return (
                    <div
                      key={row.bottleId}
                      className="wqs-deadline"
                      style={{background: meta.tint}}>
                      <Icon icon={FlaskConicalIcon} size="sm" color="secondary" />
                      <div className="wqs-deadlinebody">
                        <div className="wqs-deadlineid">{row.bottleId}</div>
                        <div className="wqs-deadlinemeta">
                          {row.analyte.label} · collected{' '}
                          {row.collectedMin != null ? fmtClock(row.collectedMin) : '—'} ·
                          expires {row.expiresMin != null ? fmtClock(row.expiresMin) : '—'}
                        </div>
                      </div>
                      <span className="wqs-margin" style={{color: meta.color}}>
                        {row.labMarginMin != null ? fmtDuration(row.labMarginMin) : '—'}
                      </span>
                    </div>
                  );
                })}
                {deadlineBoard.some(row => row.hold === 'expiring') && (
                  <div className="wqs-notebox">
                    A bottle expires before the {fmtClock(LAB_MIN)} receipt — radio
                    the courier for an early walk-in at {RUN.lab}, or the result
                    is reported with a hold-time qualifier.
                  </div>
                )}
              </div>
            </div>
          </div>
        </LayoutContent>
        }
      />
    </div>
  );
}

