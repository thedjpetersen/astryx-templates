// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person platform
 *   company) Software Engineering pay-band structure: 15 bands (levels
 *   L3–L7 × SF HQ / Lisbon / Remote-US), a 52-person engineering ladder
 *   roster with fixed base salaries (51 plotted + 1 hire mid-onboarding),
 *   derived market percentiles from the fictional Meridian Tech Comp Survey
 *   (2026 H1), and 2 pending band-driven adjustments. Money in USD, fixed
 *   July-2026 dates. No clocks, no randomness, no network media.
 * @output Compensation Bands — the comp-admin band explorer of a workforce
 *   platform. A level × geo band matrix (L3–L7 rows; SF HQ, Lisbon,
 *   Remote-US columns) of clickable min/mid/max cells with in-band
 *   headcounts; a band range bar for the selected cell with market
 *   percentile ticks (P25/P50/P75), min/mid/max axis labels, and
 *   employee-placement dots (below-band outlier flagged red in a tinted
 *   below-min zone); a band-detail end panel with percentile markers,
 *   band metadata, and the in-band employees listed with compa-ratios; a
 *   proposed-adjustment queue (2 pending, approve/deny updates the dots
 *   and compa-ratios); and a market-data refresh footer with source,
 *   refresh date, and band effective date.
 * @position Page template; emitted by `astryx template hr-compensation-bands`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, job-family Selector, ladder headcount)
 *   | content (band matrix Table, band range bar, adjustment queue —
 *   one vertical scroller) | end panel 340 (band detail, scrolls)
 *   | footer (market-data refresh strip).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The range bar, matrix cells, and queue rows are styled divs
 *   inside frame sections; the band detail is a LayoutPanel.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens
 *   (geo dots, in-band placement dots) and the below-band red pair
 *   `light-dark(#DC2626, #F87171)` used for the outlier dot, the
 *   below-min zone tint, and the below-band Token.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 340px band-detail end panel.
 * - <= 1180px: the end panel is dropped; the same band detail renders
 *   inline between the range bar and the adjustment queue.
 * - <= 860px: the header row wraps; the matrix table scrolls horizontally
 *   (pixel-floored geo columns) instead of crushing cells; queue rows
 *   stack their action buttons under the adjustment summary.
 * - The content column and the end panel scroll independently
 *   (`minHeight: 0` down every flex chain); header and footer are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowRightIcon,
  BadgeDollarSignIcon,
  CheckIcon,
  DatabaseIcon,
  LockIcon,
  MapPinIcon,
  ScaleIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Selector} from '@astryxdesign/core/Selector';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

/** Unstyled-button reset shared by the matrix cells and employee rows. */
const BUTTON_RESET: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'start',
  margin: 0,
  border: 'none',
  borderRadius: 'var(--radius-container)',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  sectionGap: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)'},
  // Matrix ------------------------------------------------------------------
  matrixScroll: {
    // <=860px: pixel-floored geo columns scroll horizontally instead of
    // crushing the min–max readouts.
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  numeric: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  levelName: {whiteSpace: 'nowrap'},
  // Whole-cell button: the matrix cell is the selection target. Inset
  // ring on selection so it never bleeds onto neighboring cells.
  cellButton: {...BUTTON_RESET, padding: 'var(--spacing-2)'},
  cellButtonSelected: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  geoDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  // Range bar ---------------------------------------------------------------
  // One shared %-of-domain scale: the domain runs min−10%·span .. max+10%·span
  // so the below-band zone and headroom are visible; ticks, dots, fill, and
  // axis labels all derive from the same domain.
  trackWrap: {
    position: 'relative',
    // Reserved headroom/footroom: percentile labels above, min/mid/max axis
    // labels below — dots at 0%/100% never collide with text.
    paddingTop: 26,
    paddingBottom: 24,
    // Edge labels are centered on their tick; side padding keeps them
    // inside the section at the extremes.
    marginInline: 28,
  },
  track: {
    position: 'relative',
    height: 56,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  bandFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'var(--color-accent-background)',
    opacity: 0.35,
  },
  belowZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))',
    borderTopLeftRadius: 'var(--radius-container)',
    borderBottomLeftRadius: 'var(--radius-container)',
  },
  boundaryLine: {position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'var(--color-border)'},
  midLine: {position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'var(--color-accent)', opacity: 0.7},
  tickLine: {position: 'absolute', top: -6, bottom: -6, width: 1, borderInlineStart: '1px dashed var(--color-text-secondary)', opacity: 0.55},
  tickLabel: {position: 'absolute', top: 0, transform: 'translateX(-50%)', whiteSpace: 'nowrap'},
  axisLabel: {position: 'absolute', bottom: 0, transform: 'translateX(-50%)', whiteSpace: 'nowrap'},
  // Employee placement dots: <button>s absolutely positioned on the shared
  // scale; two-row deterministic stagger (by index parity) so near-equal
  // salaries stay legible.
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '2px solid var(--color-background-card)',
    boxShadow: 'var(--shadow-low, 0 1px 2px rgba(0,0,0,0.2))',
    padding: 0,
    cursor: 'pointer',
    transform: 'translateX(-50%)',
  },
  dotActive: {outline: '2px solid var(--color-accent)', outlineOffset: 1},
  legendSwatch: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  legendTick: {width: 1, height: 12, borderInlineStart: '1px dashed var(--color-text-secondary)', flexShrink: 0},
  // Adjustment queue --------------------------------------------------------
  queueRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  // Band detail -------------------------------------------------------------
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  detailInline: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-4)',
  },
  employeeRow: {minWidth: 0},
  employeeRowButton: {...BUTTON_RESET, padding: 'var(--spacing-1) var(--spacing-2)'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const CAT = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

/** Below-band red — dark side shifts to the lighter 400-weight hue. */
const BELOW_BAND_RED = 'light-dark(#DC2626, #F87171)';

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company), July 2026. Software
// Engineering ladder: 52 employees (Engineering dept headcount, canonical
// across the suite) = 51 plotted below + Ava Lindqvist (L4 · SF HQ) still
// mid-onboarding, excluded from the plot until payroll setup completes.
// Bands effective Jul 1 2026; market data refreshed Jun 15 2026.
// ---------------------------------------------------------------------------

type LevelId = 'L3' | 'L4' | 'L5' | 'L6' | 'L7';
type GeoId = 'sf' | 'lisbon' | 'remote';

interface LevelMeta {
  id: LevelId;
  title: string;
}

const LEVELS: LevelMeta[] = [
  {id: 'L3', title: 'Engineer'},
  {id: 'L4', title: 'Senior Engineer'},
  {id: 'L5', title: 'Staff Engineer'},
  {id: 'L6', title: 'Senior Staff Engineer'},
  {id: 'L7', title: 'Principal Engineer'},
];

const LEVEL_TITLE = Object.fromEntries(
  LEVELS.map(level => [level.id, level.title]),
) as Record<LevelId, string>;

interface GeoMeta {
  id: GeoId;
  label: string;
  /** Multiplier vs the SF HQ anchor, disclosed in the band detail. */
  factor: string;
  dotColor: string;
}

const GEOS: GeoMeta[] = [
  {id: 'sf', label: 'SF HQ', factor: '1.00', dotColor: CAT.blue},
  {id: 'lisbon', label: 'Lisbon', factor: '0.55', dotColor: CAT.teal},
  {id: 'remote', label: 'Remote-US', factor: '0.90', dotColor: CAT.purple},
];

const GEO_META = Object.fromEntries(
  GEOS.map(geo => [geo.id, geo]),
) as Record<GeoId, GeoMeta>;

interface Band {
  min: number;
  mid: number;
  max: number;
}

type BandKey = `${LevelId}-${GeoId}`;

// Annual base salary bands, USD. mid === (min + max) / 2 for every band.
// The SF L6 band (195k / 217.5k / 240k) is the same band the employee
// profile surface shows for Marcus Webb (IC6 · Engineering).
// Geo bands = SF × factor, rounded to the nearest $500.
const BANDS: Record<BandKey, Band> = {
  'L3-sf': {min: 128_000, mid: 142_000, max: 156_000},
  'L4-sf': {min: 148_000, mid: 166_500, max: 185_000},
  'L5-sf': {min: 170_000, mid: 191_000, max: 212_000},
  'L6-sf': {min: 195_000, mid: 217_500, max: 240_000},
  'L7-sf': {min: 228_000, mid: 256_500, max: 285_000},
  'L3-lisbon': {min: 70_500, mid: 78_000, max: 85_500},
  'L4-lisbon': {min: 81_500, mid: 91_500, max: 101_500},
  'L5-lisbon': {min: 93_500, mid: 105_000, max: 116_500},
  'L6-lisbon': {min: 107_000, mid: 119_500, max: 132_000},
  'L7-lisbon': {min: 125_500, mid: 141_000, max: 156_500},
  'L3-remote': {min: 115_000, mid: 128_000, max: 141_000},
  'L4-remote': {min: 133_000, mid: 150_000, max: 167_000},
  'L5-remote': {min: 153_000, mid: 172_000, max: 191_000},
  'L6-remote': {min: 176_000, mid: 196_000, max: 216_000},
  'L7-remote': {min: 205_000, mid: 231_000, max: 257_000},
};

function bandKey(level: LevelId, geo: GeoId): BandKey {
  return `${level}-${geo}`;
}

/**
 * Market percentiles (Meridian Tech Comp Survey, 2026 H1 cut) — derived
 * deterministically from each band so the fixture never drifts: Kestrel
 * positions band mid slightly above survey P50 (~P52), with P25/P75 at
 * fixed fractions of the band span, rounded to $500.
 */
function marketPercentiles(band: Band): {p25: number; p50: number; p75: number} {
  const span = band.max - band.min;
  const round500 = (value: number) => Math.round(value / 500) * 500;
  return {
    p25: round500(band.min + 0.12 * span),
    p50: round500(band.min + 0.46 * span),
    p75: round500(band.min + 0.78 * span),
  };
}

// ---------------------------------------------------------------------------
// ROSTER — 51 plotted engineering employees. Per-cell counts sum to the
// canonical Engineering headcount with the in-flight hire:
//   SF 24 (L3 4 · L4 7 · L5 7 · L6 4 · L7 2)
//   Remote-US 17 (L3 3 · L4 6 · L5 5 · L6 2 · L7 1)
//   Lisbon 10 (L3 3 · L4 4 · L5 2 · L6 1)
//   51 plotted + Ava Lindqvist (L4 · SF, onboarding) = 52.
// Established people keep their suite-wide roles: Marcus Webb (Platform
// Lead, L6 · SF, base $218,400 — matches his employee-profile record) and
// Priya Raman (VP Engineering, L7 · SF). Owen Caldwell is the only
// below-band outlier (L6 · SF, $191,500 < $195,000 min).
// ---------------------------------------------------------------------------

interface Employee {
  id: string;
  name: string;
  level: LevelId;
  geo: GeoId;
  base: number;
  /** Title override for the suite-established people. */
  title?: string;
}

// Tuple spec: [name, level, geo, base, titleOverride?]
type EmployeeSpec = [string, LevelId, GeoId, number, string?];

const EMPLOYEE_SPECS: EmployeeSpec[] = [
  // ---- SF HQ · L7 (2) ----
  ['Priya Raman', 'L7', 'sf', 268_000, 'VP Engineering'],
  ['Goran Ilic', 'L7', 'sf', 249_000],
  // ---- SF HQ · L6 (4) ----
  ['Rohan Mehta', 'L6', 'sf', 224_500],
  ['Marcus Webb', 'L6', 'sf', 218_400, 'Platform Lead'],
  ['Lena Fischer', 'L6', 'sf', 209_000],
  ['Owen Caldwell', 'L6', 'sf', 191_500], // below band — adjustment ADJ-2026-041
  // ---- SF HQ · L5 (7) ----
  ['Noor Haddad', 'L5', 'sf', 205_500],
  ['Daniel Okafor', 'L5', 'sf', 199_000],
  ['Mei-Lin Chu', 'L5', 'sf', 194_000],
  ['Sam Whitaker', 'L5', 'sf', 191_000],
  ['Irina Sokolova', 'L5', 'sf', 186_500],
  ['Jorge Batista', 'L5', 'sf', 180_000],
  ['Ankita Shah', 'L5', 'sf', 174_500],
  // ---- SF HQ · L4 (7) ----
  ['Leah Kim', 'L4', 'sf', 172_000],
  ['Tyler Brooks', 'L4', 'sf', 168_500],
  ['Fatima El-Sayed', 'L4', 'sf', 165_000],
  ['Chris Nguyen', 'L4', 'sf', 162_000],
  ['Hana Yoshida', 'L4', 'sf', 158_500],
  ['Derek Olsen', 'L4', 'sf', 153_000],
  ['Maya Lindstrom', 'L4', 'sf', 149_500],
  // ---- SF HQ · L3 (4) ----
  ['Josh Peterman', 'L3', 'sf', 150_500],
  ['Alina Petrova', 'L3', 'sf', 144_000],
  ['Ben Carter', 'L3', 'sf', 138_500],
  ['Grace Obi', 'L3', 'sf', 131_000],
  // ---- Remote-US · L7 (1) ----
  ['Sandra Kohl', 'L7', 'remote', 240_000],
  // ---- Remote-US · L6 (2) ----
  ['Victor Reyes', 'L6', 'remote', 205_000],
  ['Emily Stanton', 'L6', 'remote', 189_000],
  // ---- Remote-US · L5 (5) ----
  ['Aaron Blake', 'L5', 'remote', 186_000],
  ['Nina Petrescu', 'L5', 'remote', 178_500],
  ['Cole Bennett', 'L5', 'remote', 172_000],
  ['Jamal Wright', 'L5', 'remote', 167_000],
  ['Olivia Tran', 'L5', 'remote', 158_500],
  // ---- Remote-US · L4 (6) ----
  ['Ethan Ross', 'L4', 'remote', 164_000],
  ['Zoe Aldana', 'L4', 'remote', 158_000],
  ['Kevin Zhao', 'L4', 'remote', 152_500],
  ['Lucy Moran', 'L4', 'remote', 148_000],
  ['Ian McAllister', 'L4', 'remote', 141_500],
  ['Tara Singh', 'L4', 'remote', 136_000],
  // ---- Remote-US · L3 (3) ----
  ['Miles Turner', 'L3', 'remote', 137_000],
  ['Ada Nwosu', 'L3', 'remote', 128_500],
  ['Sean Gallagher', 'L3', 'remote', 119_000],
  // ---- Lisbon · L6 (1) ----
  ['Catarina Lopes', 'L6', 'lisbon', 124_000],
  // ---- Lisbon · L5 (2) ----
  ['Miguel Ferreira', 'L5', 'lisbon', 111_500],
  ['Beatriz Santos', 'L5', 'lisbon', 101_000],
  // ---- Lisbon · L4 (4) ----
  ['Tiago Almeida', 'L4', 'lisbon', 97_500],
  ['Marta Vieira', 'L4', 'lisbon', 93_000],
  ['Ines Duarte', 'L4', 'lisbon', 88_000], // adjustment ADJ-2026-044
  ['Nuno Barros', 'L4', 'lisbon', 84_500],
  // ---- Lisbon · L3 (3) ----
  ['Rui Costa', 'L3', 'lisbon', 82_000],
  ['Ana Pinheiro', 'L3', 'lisbon', 77_500],
  ['Pedro Matos', 'L3', 'lisbon', 71_500],
];

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z]+/g, '-');
}

const INITIAL_EMPLOYEES: Employee[] = EMPLOYEE_SPECS.map(
  ([name, level, geo, base, title]) => ({
    id: slug(name),
    name,
    level,
    geo,
    base,
    title,
  }),
);

/** In-flight hire — counted in the 52, never plotted (suite-wide rule). */
const ONBOARDING_NOTE =
  'Ava Lindqvist (L4 · SF HQ, started Jul 1) joins the plot once payroll setup completes.';

const LADDER_HEADCOUNT = 52; // 51 plotted + 1 onboarding — Engineering dept total

// ---------------------------------------------------------------------------
// ADJUSTMENT QUEUE — 2 pending band-driven proposals. Approving updates the
// employee's base (dot moves, compa-ratio recomputes, the below-band flag
// clears); denying records the decision without a comp change. Queue impact
// reconciles: +$4,500 + $4,500 = +$9,000 annualized while both are pending.
// ---------------------------------------------------------------------------

type AdjustmentStatus = 'pending' | 'approved' | 'denied';

interface Adjustment {
  id: string;
  ref: string;
  employeeId: string;
  level: LevelId;
  geo: GeoId;
  currentBase: number;
  proposedBase: number;
  reason: string;
  requestedBy: string;
  requestedOn: string; // ISO date
  effectiveOn: string; // ISO date
  status: AdjustmentStatus;
}

const INITIAL_ADJUSTMENTS: Adjustment[] = [
  {
    id: 'adj-owen',
    ref: 'ADJ-2026-041',
    employeeId: 'owen-caldwell',
    level: 'L6',
    geo: 'sf',
    currentBase: 191_500,
    proposedBase: 196_000,
    reason:
      'Below band after the Jul 1 band refresh raised the L6 · SF minimum to $195,000. Bring to min + 0.5%.',
    requestedBy: 'Priya Raman',
    requestedOn: '2026-06-26',
    effectiveOn: '2026-08-01',
    status: 'pending',
  },
  {
    id: 'adj-ines',
    ref: 'ADJ-2026-044',
    employeeId: 'ines-duarte',
    level: 'L4',
    geo: 'lisbon',
    currentBase: 88_000,
    proposedBase: 92_500,
    reason:
      'Meridian 2026 H1 refresh moved the Lisbon L4 mid +4%; compa 0.96 with a manager-flagged retention risk. Align to band mid + 1%.',
    requestedBy: 'Dana Whitfield',
    requestedOn: '2026-06-29',
    effectiveOn: '2026-08-01',
    status: 'pending',
  },
];

/** Fixed in-world "today" — decisions record this date, not a live clock. */
const DECISION_DATE = 'Jul 3, 2026';

const MARKET_SOURCE = {
  name: 'Meridian Tech Comp Survey',
  cut: '2026 H1 · 1,140 companies',
  refreshedOn: 'Jun 15, 2026',
  nextRefresh: 'Dec 15, 2026',
  effectiveOn: 'Jul 1, 2026',
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

/** Compact matrix readout: $166.5k / $128k. */
function formatK(value: number): string {
  const k = value / 1000;
  return Number.isInteger(k) ? `$${k}k` : `$${k.toFixed(1)}k`;
}

function compaRatio(base: number, band: Band): string {
  return (base / band.mid).toFixed(2);
}

/** Compa-ratio Token color: red < 0.90, orange < 0.95, blue > 1.05. */
function compaColor(base: number, band: Band): 'red' | 'orange' | 'gray' | 'blue' {
  const ratio = base / band.mid;
  if (ratio < 0.9) {
    return 'red';
  }
  if (ratio < 0.95) {
    return 'orange';
  }
  if (ratio > 1.05) {
    return 'blue';
  }
  return 'gray';
}

/** Range spread as a % of min — disclosed in the band detail. */
function spreadPct(band: Band): number {
  return Math.round(((band.max - band.min) / band.min) * 100);
}

/**
 * Shared placement scale for the range bar: domain = band ± 10% of span so
 * the below-min zone and top headroom stay visible. Everything on the bar
 * (fill, ticks, dots, axis labels) positions through this one function.
 */
function makeScale(band: Band): (value: number) => number {
  const span = band.max - band.min;
  const lo = band.min - 0.1 * span;
  const domain = 1.2 * span;
  return (value: number) => ((value - lo) / domain) * 100;
}

// ---------------------------------------------------------------------------
// BAND MATRIX — level × geo Table; each geo cell is one selection button
// showing min–max, mid, and the in-band headcount. The below-band outlier's
// cell carries a red flag dot so the exception is visible from the matrix.
// ---------------------------------------------------------------------------

// The Table generic requires rows assignable to Record<string, unknown>.
interface LevelRow extends Record<string, unknown> {
  id: LevelId;
  title: string;
}

const LEVEL_ROWS: LevelRow[] = LEVELS.map(level => ({
  id: level.id,
  title: level.title,
}));

interface CellState {
  count: number;
  belowBandCount: number;
}

function BandCell({
  level,
  geo,
  cell,
  isSelected,
  onSelect,
}: {
  level: LevelId;
  geo: GeoId;
  cell: CellState;
  isSelected: boolean;
  onSelect: (level: LevelId, geo: GeoId) => void;
}) {
  const band = BANDS[bandKey(level, geo)];
  return (
    <button
      type="button"
      style={{
        ...styles.cellButton,
        ...(isSelected ? styles.cellButtonSelected : null),
      }}
      aria-pressed={isSelected}
      aria-label={`${level} ${GEO_META[geo].label} band, ${formatMoney(band.min)} to ${formatMoney(band.max)}, midpoint ${formatMoney(band.mid)}, ${cell.count} employees in band${cell.belowBandCount > 0 ? `, ${cell.belowBandCount} below band` : ''}`}
      onClick={() => onSelect(level, geo)}>
      <VStack gap={1}>
        <Text type="label" hasTabularNumbers style={styles.numeric}>
          {formatK(band.min)} – {formatK(band.max)}
        </Text>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers style={styles.numeric}>
              mid {formatK(band.mid)}
            </Text>
          </StackItem>
          {cell.belowBandCount > 0 ? (
            <span
              style={{...styles.geoDot, backgroundColor: BELOW_BAND_RED}}
              title={`${cell.belowBandCount} below band`}
            />
          ) : null}
          <span style={styles.countChip}>
            <Icon icon={UsersIcon} size="xsm" color="inherit" />
            {cell.count}
          </span>
        </HStack>
      </VStack>
    </button>
  );
}

function buildMatrixColumns(
  cells: Record<BandKey, CellState>,
  selected: BandKey,
  onSelect: (level: LevelId, geo: GeoId) => void,
): TableColumn<LevelRow>[] {
  // Footgun: Table cells carry max-width: 0 — fixed columns need both
  // width and minWidth on the header cell (pixel/proportional set both).
  const columns: TableColumn<LevelRow>[] = [
    {
      key: 'level',
      header: 'Level',
      // 150 + 3×174 = 672 — the matrix fits the demo content column
      // (678px) beside the 340px end panel without horizontal clipping.
      width: pixel(150),
      renderCell: (row: LevelRow) => (
        <VStack gap={0}>
          <Text type="label">{row.id}</Text>
          <Text type="supporting" color="secondary" maxLines={1} style={styles.levelName}>
            {row.title}
          </Text>
        </VStack>
      ),
    },
  ];
  for (const geo of GEOS) {
    columns.push({
      key: geo.id,
      header: (
        <HStack gap={1} vAlign="center">
          <span style={{...styles.geoDot, backgroundColor: geo.dotColor}} />
          <Text type="label" size="sm">
            {geo.label}
          </Text>
        </HStack>
      ),
      width: proportional(1, {minWidth: 174}),
      renderCell: (row: LevelRow) => (
        <BandCell
          level={row.id}
          geo={geo.id}
          cell={cells[bandKey(row.id, geo.id)]}
          isSelected={selected === bandKey(row.id, geo.id)}
          onSelect={onSelect}
        />
      ),
    });
  }
  return columns;
}

// ---------------------------------------------------------------------------
// RANGE BAR — the selected band on one shared %-of-domain scale: band fill
// between min/max boundary lines, an accent midpoint line, dashed market
// percentile ticks labeled above, min/mid/max axis labels below, and one
// placement <button> dot per employee (below-band outlier red, in the
// tinted below-min zone). Clicking a dot highlights the employee in the
// band detail.
// ---------------------------------------------------------------------------

function RangeBar({
  band,
  geo,
  employees,
  activeEmployeeId,
  onSelectEmployee,
}: {
  band: Band;
  geo: GeoId;
  employees: Employee[];
  activeEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
}) {
  const scale = makeScale(band);
  const market = marketPercentiles(band);
  const geoColor = GEO_META[geo].dotColor;
  const ticks: {label: string; value: number}[] = [
    {label: 'P25', value: market.p25},
    {label: 'P50', value: market.p50},
    {label: 'P75', value: market.p75},
  ];
  return (
    <div style={styles.trackWrap}>
      {/* Market percentile labels — above the track, centered on the tick. */}
      {ticks.map(tick => (
        <span
          key={tick.label}
          style={{...styles.tickLabel, left: `${scale(tick.value)}%`}}>
          <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
            {tick.label} {formatK(tick.value)}
          </Text>
        </span>
      ))}
      <div style={styles.track}>
        <div style={{...styles.belowZone, width: `${scale(band.min)}%`}} />
        <div
          style={{
            ...styles.bandFill,
            left: `${scale(band.min)}%`,
            width: `${scale(band.max) - scale(band.min)}%`,
          }}
        />
        <div style={{...styles.boundaryLine, left: `${scale(band.min)}%`}} />
        <div style={{...styles.boundaryLine, left: `${scale(band.max)}%`}} />
        <div style={{...styles.midLine, left: `${scale(band.mid)}%`}} />
        {ticks.map(tick => (
          <div
            key={tick.label}
            style={{...styles.tickLine, left: `${scale(tick.value)}%`}}
          />
        ))}
        {/* Placement dots — deterministic two-row stagger by index parity so
            near-equal salaries stay legible. */}
        {employees.map((employee, index) => {
          const isBelow = employee.base < band.min;
          const isActive = employee.id === activeEmployeeId;
          return (
            <button
              key={employee.id}
              type="button"
              style={{
                ...styles.dot,
                left: `${scale(employee.base)}%`,
                top: index % 2 === 0 ? 10 : 32,
                backgroundColor: isBelow ? BELOW_BAND_RED : geoColor,
                ...(isActive ? styles.dotActive : null),
              }}
              title={`${employee.name} · ${formatMoney(employee.base)}`}
              aria-pressed={isActive}
              aria-label={`${employee.name}, base ${formatMoney(employee.base)}, compa-ratio ${compaRatio(employee.base, band)}${isBelow ? ', below band' : ''}`}
              onClick={() => onSelectEmployee(employee.id)}
            />
          );
        })}
      </div>
      {/* Axis — band min / mid / max, labeled (no axis-less charts). */}
      <span style={{...styles.axisLabel, left: `${scale(band.min)}%`}}>
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          min {formatK(band.min)}
        </Text>
      </span>
      <span style={{...styles.axisLabel, left: `${scale(band.mid)}%`}}>
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          mid {formatK(band.mid)}
        </Text>
      </span>
      <span style={{...styles.axisLabel, left: `${scale(band.max)}%`}}>
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          max {formatK(band.max)}
        </Text>
      </span>
    </div>
  );
}

function RangeLegend({geo}: {geo: GeoId}) {
  return (
    <HStack gap={4} vAlign="center" wrap="wrap">
      <HStack gap={1} vAlign="center">
        <span
          style={{...styles.legendSwatch, backgroundColor: GEO_META[geo].dotColor}}
        />
        <Text type="supporting" color="secondary">
          Employee base
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span style={{...styles.legendSwatch, backgroundColor: BELOW_BAND_RED}} />
        <Text type="supporting" color="secondary">
          Below band
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span style={styles.legendTick} />
        <Text type="supporting" color="secondary">
          Market percentile (Meridian 2026 H1)
        </Text>
      </HStack>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// BAND DETAIL — metadata, percentile markers, and the in-band employee list
// with compa-ratios. Rendered in the 340px end panel (>1180px) or inline
// between the range bar and the queue (<=1180px).
// ---------------------------------------------------------------------------

function positionInBand(value: number, band: Band): number {
  return Math.round(((value - band.min) / (band.max - band.min)) * 100);
}

function BandDetail({
  level,
  geo,
  employees,
  activeEmployeeId,
  onSelectEmployee,
  pendingRefByEmployee,
}: {
  level: LevelId;
  geo: GeoId;
  employees: Employee[];
  activeEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  pendingRefByEmployee: Map<string, string>;
}) {
  const band = BANDS[bandKey(level, geo)];
  const market = marketPercentiles(band);
  const midVsP50 = band.mid - market.p50;
  const belowCount = employees.filter(e => e.base < band.min).length;
  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>
          {level} · {GEO_META[geo].label}
        </Heading>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token size="sm" color="gray" label={LEVEL_TITLE[level]} />
          <Token
            size="sm"
            color="gray"
            icon={<Icon icon={MapPinIcon} size="xsm" color="inherit" />}
            label={GEO_META[geo].label}
          />
          {belowCount > 0 ? (
            <Token size="sm" color="red" label={`${belowCount} below band`} />
          ) : null}
        </HStack>
      </VStack>

      <MetadataList columns={1} label={{position: 'start', width: 110}}>
        <MetadataListItem label="Minimum">
          <Text type="body" hasTabularNumbers>
            {formatMoney(band.min)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Midpoint">
          <Text type="body" hasTabularNumbers>
            {formatMoney(band.mid)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Maximum">
          <Text type="body" hasTabularNumbers>
            {formatMoney(band.max)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Range spread">
          <Text type="body" hasTabularNumbers>
            {spreadPct(band)}% of min
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Geo factor">
          <Text type="body" hasTabularNumbers>
            {GEO_META[geo].factor} × SF HQ anchor
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Mid vs P50">
          <Text type="body" hasTabularNumbers>
            +{formatMoney(midVsP50)} over market P50
          </Text>
        </MetadataListItem>
        <MetadataListItem label="In band">
          <Text type="body" hasTabularNumbers>
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
          </Text>
        </MetadataListItem>
      </MetadataList>

      <Divider />

      {/* Percentile markers — value + where each sits inside the band. */}
      <VStack gap={2}>
        <Text type="label">Market percentiles</Text>
        {[
          {label: 'P25', value: market.p25},
          {label: 'P50', value: market.p50},
          {label: 'P75', value: market.p75},
        ].map(tick => (
          <HStack key={tick.label} gap={2} vAlign="center">
            <span style={styles.legendTick} />
            <StackItem size="fill">
              <Text type="body">{tick.label}</Text>
            </StackItem>
            <Text type="body" color="secondary" hasTabularNumbers>
              {formatMoney(tick.value)}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {positionInBand(tick.value, band)}% of band
            </Text>
          </HStack>
        ))}
        <Text type="supporting" color="secondary">
          {MARKET_SOURCE.name}, {MARKET_SOURCE.refreshedOn} refresh. Band mid
          targets ~P52.
        </Text>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label">
          Employees in band ({employees.length})
        </Text>
        {employees.map(employee => {
          const isBelow = employee.base < band.min;
          const pendingRef = pendingRefByEmployee.get(employee.id);
          const isActive = employee.id === activeEmployeeId;
          return (
            <button
              key={employee.id}
              type="button"
              style={{
                ...styles.employeeRowButton,
                ...(isActive
                  ? {boxShadow: 'inset 0 0 0 1px var(--color-accent)'}
                  : null),
              }}
              aria-pressed={isActive}
              onClick={() => onSelectEmployee(employee.id)}>
              <HStack gap={2} vAlign="center" style={styles.employeeRow}>
                <Avatar name={employee.name} size="small" />
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Text type="body" maxLines={1}>
                      {employee.name}
                    </Text>
                    {/* maxLines 2: in the 340px panel, title + pending ref
                        truncated mid-ref ("… · ADJ…") on one line. */}
                    <Text type="supporting" color="secondary" maxLines={2}>
                      {employee.title ?? LEVEL_TITLE[employee.level]}
                      {pendingRef !== undefined ? ` · ${pendingRef} pending` : ''}
                    </Text>
                  </VStack>
                </StackItem>
                <VStack gap={0} hAlign="end">
                  <Text type="body" hasTabularNumbers style={styles.numeric}>
                    {formatMoney(employee.base)}
                  </Text>
                  <Token
                    size="sm"
                    color={isBelow ? 'red' : compaColor(employee.base, band)}
                    label={`compa ${compaRatio(employee.base, band)}`}
                  />
                </VStack>
              </HStack>
            </button>
          );
        })}
        {employees.length === 0 ? (
          <Text type="supporting" color="secondary">
            No employees in this band yet.
          </Text>
        ) : null}
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// ADJUSTMENT QUEUE — framed rows (no Cards), one per proposal: employee,
// band, current → proposed with delta %, reason, requester, effective date,
// and approve/deny. Decisions swap the actions for a status Token and (on
// approve) move the employee's placement dot.
// ---------------------------------------------------------------------------

function deltaPct(adjustment: Adjustment): string {
  const pct =
    ((adjustment.proposedBase - adjustment.currentBase) /
      adjustment.currentBase) *
    100;
  return `+${pct.toFixed(1)}%`;
}

function AdjustmentRow({
  adjustment,
  employeeName,
  isCompact,
  onApprove,
  onDeny,
  onJumpToBand,
}: {
  adjustment: Adjustment;
  employeeName: string;
  isCompact: boolean;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onJumpToBand: (level: LevelId, geo: GeoId) => void;
}) {
  const actions =
    adjustment.status === 'pending' ? (
      <HStack gap={2} vAlign="center">
        <Button
          label="Approve"
          variant="secondary"
          size="sm"
          icon={<Icon icon={CheckIcon} size="sm" />}
          onClick={() => onApprove(adjustment.id)}
        />
        <Button
          label="Deny"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" />}
          onClick={() => onDeny(adjustment.id)}
        />
      </HStack>
    ) : (
      <VStack gap={0} hAlign={isCompact ? 'start' : 'end'}>
        <Token
          size="sm"
          color={adjustment.status === 'approved' ? 'green' : 'gray'}
          icon={
            <Icon
              icon={adjustment.status === 'approved' ? CheckIcon : XIcon}
              size="xsm"
              color="inherit"
            />
          }
          label={adjustment.status === 'approved' ? 'Approved' : 'Denied'}
        />
        <Text type="supporting" color="secondary">
          Decided {DECISION_DATE}
        </Text>
      </VStack>
    );

  return (
    <div style={styles.queueRow}>
      <Avatar name={employeeName} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="label">{employeeName}</Text>
            <Button
              label={`${adjustment.level} · ${GEO_META[adjustment.geo].label}`}
              variant="ghost"
              size="sm"
              onClick={() => onJumpToBand(adjustment.level, adjustment.geo)}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {adjustment.ref}
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="body" hasTabularNumbers style={styles.numeric}>
              {formatMoney(adjustment.currentBase)}
            </Text>
            <Icon icon={ArrowRightIcon} size="xsm" color="secondary" />
            <Text type="body" hasTabularNumbers style={styles.numeric}>
              {formatMoney(adjustment.proposedBase)}
            </Text>
            <Token size="sm" color="blue" label={deltaPct(adjustment)} />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              +{formatMoney(adjustment.proposedBase - adjustment.currentBase)}/yr
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            {adjustment.reason}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Requested by {adjustment.requestedBy} · Jun{' '}
            {adjustment.requestedOn.slice(8)} · Effective Aug 1, 2026 payroll
          </Text>
          {isCompact ? actions : null}
        </VStack>
      </StackItem>
      {isCompact ? null : actions}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const FAMILY_OPTIONS = [
  {value: 'engineering', label: 'Software Engineering'},
  {value: 'design', label: 'Design'},
  {value: 'gtm', label: 'GTM'},
];

/** Ladders that have not published bands yet — honest empty states. */
const UNPUBLISHED_FAMILY_NOTE: Record<string, string> = {
  design: 'The Design ladder (D2–D6) publishes with the Jul 15, 2026 refresh.',
  gtm: 'GTM bands are commission-weighted and publish with the Jul 15, 2026 refresh.',
};

export default function HrCompensationBandsTemplate() {
  const [family, setFamily] = useState('engineering');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [adjustments, setAdjustments] =
    useState<Adjustment[]>(INITIAL_ADJUSTMENTS);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>('L6');
  const [selectedGeo, setSelectedGeo] = useState<GeoId>('sf');
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(
    'owen-caldwell',
  );
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the end panel (band detail renders
  // inline); <=860px wraps the header and stacks queue actions.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const selectedKey = bandKey(selectedLevel, selectedGeo);
  const selectedBand = BANDS[selectedKey];

  // Per-cell counts + below-band flags, derived during render.
  const cells = useMemo(() => {
    const map = {} as Record<BandKey, CellState>;
    for (const level of LEVELS) {
      for (const geo of GEOS) {
        map[bandKey(level.id, geo.id)] = {count: 0, belowBandCount: 0};
      }
    }
    for (const employee of employees) {
      const key = bandKey(employee.level, employee.geo);
      const cell = map[key];
      cell.count += 1;
      if (employee.base < BANDS[key].min) {
        cell.belowBandCount += 1;
      }
    }
    return map;
  }, [employees]);

  const selectBand = (level: LevelId, geo: GeoId) => {
    setSelectedLevel(level);
    setSelectedGeo(geo);
    setActiveEmployeeId(null);
  };

  const matrixColumns = useMemo(
    () => buildMatrixColumns(cells, selectedKey, selectBand),
    // selectBand is recreated per render but only touches setState —
    // cells + selectedKey are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cells, selectedKey],
  );

  // Employees plotted for the selected band, highest base first so the
  // detail list reads top-of-band down.
  const selectedEmployees = useMemo(
    () =>
      employees
        .filter(
          employee =>
            employee.level === selectedLevel && employee.geo === selectedGeo,
        )
        .sort((a, b) => b.base - a.base),
    [employees, selectedLevel, selectedGeo],
  );

  const pendingAdjustments = adjustments.filter(
    adjustment => adjustment.status === 'pending',
  );
  const pendingAnnualized = pendingAdjustments.reduce(
    (sum, adjustment) =>
      sum + (adjustment.proposedBase - adjustment.currentBase),
    0,
  );
  const pendingRefByEmployee = useMemo(
    () =>
      new Map(
        adjustments
          .filter(adjustment => adjustment.status === 'pending')
          .map(adjustment => [adjustment.employeeId, adjustment.ref]),
      ),
    [adjustments],
  );

  const employeeNameById = useMemo(
    () => new Map(employees.map(employee => [employee.id, employee.name])),
    [employees],
  );

  const approveAdjustment = (id: string) => {
    const adjustment = adjustments.find(item => item.id === id);
    if (adjustment === undefined || adjustment.status !== 'pending') {
      return;
    }
    setAdjustments(prev =>
      prev.map(item =>
        item.id === id ? {...item, status: 'approved' as const} : item,
      ),
    );
    setEmployees(prev =>
      prev.map(employee =>
        employee.id === adjustment.employeeId
          ? {...employee, base: adjustment.proposedBase}
          : employee,
      ),
    );
    const name = employeeNameById.get(adjustment.employeeId) ?? 'Employee';
    setAnnouncement(
      `Approved ${adjustment.ref} — ${name}'s base updates to ${formatMoney(adjustment.proposedBase)} effective Aug 1, 2026`,
    );
  };

  const denyAdjustment = (id: string) => {
    const adjustment = adjustments.find(item => item.id === id);
    if (adjustment === undefined || adjustment.status !== 'pending') {
      return;
    }
    setAdjustments(prev =>
      prev.map(item =>
        item.id === id ? {...item, status: 'denied' as const} : item,
      ),
    );
    const name = employeeNameById.get(adjustment.employeeId) ?? 'Employee';
    setAnnouncement(`Denied ${adjustment.ref} for ${name} — no comp change`);
  };

  // ----- header: brand, job-family Selector, restricted-access token -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ScaleIcon} size="md" color="secondary" />
          <Heading level={1}>Compensation bands</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Selector
          label="Job family"
          isLabelHidden
          options={FAMILY_OPTIONS}
          value={family}
          onChange={setFamily}
          size="sm"
          width={210}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {LADDER_HEADCOUNT} in ladder
        </Text>
        <Token
          size="sm"
          color="gray"
          icon={<Icon icon={LockIcon} size="xsm" color="inherit" />}
          label="HR admins only"
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- footer: market-data refresh note (source + dates, pinned) -----
  const footer = (
    <LayoutFooter hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        {/* One dot-separated run — a split here read as a broken gap, and
            the full string wrapped the footer to two rows at 1440px. */}
        <HStack gap={2} vAlign="center">
          <Icon icon={DatabaseIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {MARKET_SOURCE.name} · {MARKET_SOURCE.cut} · Refreshed{' '}
            {MARKET_SOURCE.refreshedOn} · Next refresh {MARKET_SOURCE.nextRefresh}
          </Text>
        </HStack>
        <StackItem size="fill" />
        <HStack gap={2} vAlign="center">
          <Icon icon={BadgeDollarSignIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Bands effective {MARKET_SOURCE.effectiveOn}
          </Text>
        </HStack>
        <Button label="View methodology" variant="ghost" size="sm" />
      </HStack>
    </LayoutFooter>
  );

  const bandDetail = (
    <BandDetail
      level={selectedLevel}
      geo={selectedGeo}
      employees={selectedEmployees}
      activeEmployeeId={activeEmployeeId}
      onSelectEmployee={setActiveEmployeeId}
      pendingRefByEmployee={pendingRefByEmployee}
    />
  );

  // ----- content: matrix, range bar, (inline detail), adjustment queue -----
  const selectedCell = cells[selectedKey];
  const mainContent =
    family !== 'engineering' ? (
      <EmptyState
        icon={<Icon icon={ScaleIcon} size="lg" />}
        title="No published bands for this ladder yet"
        description={UNPUBLISHED_FAMILY_NOTE[family]}
        actions={
          <Button
            label="Back to Software Engineering"
            variant="secondary"
            size="sm"
            onClick={() => setFamily('engineering')}
          />
        }
      />
    ) : (
      <div style={styles.sectionGap}>
        {/* Band matrix ---------------------------------------------------- */}
        <VStack gap={2}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={2}>Band matrix</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Annual base salary, USD · L3–L7 × 3 geos · Bands effective{' '}
                  {MARKET_SOURCE.effectiveOn}
                </Text>
              </VStack>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {LADDER_HEADCOUNT} employees · 51 plotted · 1 onboarding
            </Text>
          </HStack>
          <div style={styles.matrixScroll}>
            <Table<LevelRow>
              data={LEVEL_ROWS}
              columns={matrixColumns}
              idKey="id"
              density="balanced"
              dividers="rows"
            />
          </div>
          <Text type="supporting" color="secondary">
            {ONBOARDING_NOTE}
          </Text>
        </VStack>

        {/* Band range bar ------------------------------------------------- */}
        <VStack gap={2}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={2}>
                  Band range — {selectedLevel} · {GEO_META[selectedGeo].label}
                </Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {formatMoney(selectedBand.min)} – {formatMoney(selectedBand.max)}{' '}
                  · {selectedCell.count} in band
                  {selectedCell.belowBandCount > 0
                    ? ` · ${selectedCell.belowBandCount} below band`
                    : ''}
                </Text>
              </VStack>
            </StackItem>
            <RangeLegend geo={selectedGeo} />
          </HStack>
          <RangeBar
            band={selectedBand}
            geo={selectedGeo}
            employees={selectedEmployees}
            activeEmployeeId={activeEmployeeId}
            onSelectEmployee={setActiveEmployeeId}
          />
          {selectedCell.belowBandCount > 0 ? (
            <HStack gap={2} vAlign="center">
              <Icon icon={TriangleAlertIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                Below-band placements are flagged red and queue a bring-to-min
                adjustment below.
              </Text>
            </HStack>
          ) : null}
        </VStack>

        {/* Inline band detail when the end panel is dropped ---------------- */}
        {isPanelHidden ? <div style={styles.detailInline}>{bandDetail}</div> : null}

        {/* Adjustment queue ------------------------------------------------ */}
        <VStack gap={2}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={2}>Proposed adjustments</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {pendingAdjustments.length} pending
                  {pendingAdjustments.length > 0
                    ? ` · +${formatMoney(pendingAnnualized)} annualized if approved`
                    : ' · queue clear'}
                </Text>
              </VStack>
            </StackItem>
            <Token
              size="sm"
              color={pendingAdjustments.length > 0 ? 'orange' : 'green'}
              label={
                pendingAdjustments.length > 0
                  ? `${pendingAdjustments.length} awaiting decision`
                  : 'All decided'
              }
            />
          </HStack>
          {adjustments.map(adjustment => (
            <AdjustmentRow
              key={adjustment.id}
              adjustment={adjustment}
              employeeName={
                employeeNameById.get(adjustment.employeeId) ?? 'Employee'
              }
              isCompact={isCompact}
              onApprove={approveAdjustment}
              onDeny={denyAdjustment}
              onJumpToBand={selectBand}
            />
          ))}
        </VStack>
      </div>
    );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        footer={footer}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <div style={styles.contentScroll}>{mainContent}</div>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelHidden && family === 'engineering' ? (
            <LayoutPanel width={340} padding={0} hasDivider label="Band detail">
              <div style={styles.panelScroll}>{bandDetail}</div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
