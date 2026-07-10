// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Groundtruth physical-risk model
 *   for Meridian Coast Holdings' 12-asset Carraway Sound portfolio.
 *   Insured values sum to $375M (86+22+18+34+29+31+12+41+54+23+16+9 = 375
 *   ✓). Each asset carries four RAW hazard scores (flood/heat/wildfire/
 *   outage, 0–100, worse = higher); the composite is derived live as
 *   0.35·flood + 0.20·heat + 0.25·wildfire + 0.20·outage (weights sum to
 *   1.00 ✓) and graded A(<20) B(<35) C(<50) D(<70) E(≥70). Eight mitigation
 *   projects P-101…P-108 (two complete, one funded at load, five proposed)
 *   whose deltas subtract from the linked asset's hazard score only while
 *   funded/complete; capex budget $2,300k with $875k committed at load
 *   (310+145+420 = 875 ✓ → $1,425k remaining; the five proposals total
 *   $1,500k, so the last one hits an honest over-budget refusal). Five base
 *   insurance-evidence rows. No clock reads, no randomness, no timers, no
 *   network tiles — the map is a hand-drawn inline SVG schematic, never a
 *   real map.
 * @output Groundtruth — Climate Risk Asset Map: a portfolio resilience
 *   console. A brand header (contour-ring brand mark, portfolio name,
 *   derived stat cluster: value-weighted portfolio risk score + grade chip,
 *   pts eased vs unmitigated, $375M insured, budget remaining) over a
 *   working frame: the map column (48px lens/layer toolbar — a pin-lens
 *   chip row recoloring every pin by composite grade or a single hazard,
 *   and four hazard-layer toggles that show/hide the floodplain, heat
 *   island, wildland-urban interface, and transmission-corridor overlays on
 *   the 760×560 schematic SVG of Carraway Sound), 28px grade-lettered
 *   asset pins as real overlaid buttons (40px hit), a legend strip, and a
 *   selected-asset detail band (per-hazard 8px score bars whose mitigated
 *   share renders as a brand-tinted tail with a −N pts label, linked
 *   project chips) — beside a 340px tracker rail: budget meter, mitigation
 *   project cards (hazard chip, −pts, cost, Fund/Undo), and the insurance
 *   evidence ledger. Signature move: funding a proposal applies its delta
 *   in the same render — the linked pin's grade letter and color ease on
 *   the map, the detail band's bar grows a mitigated tail, the portfolio
 *   score and eased-pts header stats re-derive, the budget meter drains,
 *   and a funding-memo row (pending carrier review) appends to the
 *   evidence ledger; Undo reverses every one of those surfaces, and a
 *   proposal that exceeds remaining budget refuses with the exact shortfall.
 * @position Page template; emitted by `astryx template
 *   climate-risk-asset-map`
 *
 * Frame: root 100dvh div (scope class tpl-climate-risk-asset-map) wrapping
 *   Layout height="fill". LayoutHeader owns brand + stats. LayoutContent
 *   padding 0 hosts a CSS grid `minmax(0, 1fr) 340px`: the map column
 *   scrolls vertically as one unit (toolbar, map, legend, detail band); the
 *   rail scrolls independently. Pins are absolutely-positioned HTML
 *   <button>s over the aria-hidden SVG (percent coordinates from the same
 *   fixture x/y the schematic uses), so focus rings, tooltips, and 40px
 *   targets come free instead of fighting SVG focus semantics.
 *
 * Responsive contract:
 * - ~1045px (inline demo stage): default layout fits by design — 340px
 *   rail + ~705px map column; the SVG scales by viewBox so no media query
 *   is needed for the map to render correctly.
 * - <=880px (full-screen tablets / 390px embed): the grid stacks to one
 *   column — map column first, tracker rail below it at natural height;
 *   the toolbar chip rows wrap instead of clipping.
 * - <=460px: header stat chips wrap to a second row; detail-band hazard
 *   rows keep their 8px bars and drop only the verbose caption.
 *
 * Container policy (map-console archetype): frame-first — a toolbar, one
 *   drawing surface, bands, and rail rows. Project cards are working rows
 *   with actions, not marketing cards; evidence is a ledger list.
 *
 * Color policy: token chrome. ONE quarantined brand accent — Groundtruth
 *   earth green, text pair light-dark(#3F6212, #A3E635) (#3F6212 on
 *   #FFFFFF ≈ 6.6:1; #A3E635 on ~#1C1C1E ≈ 10.6:1), fill pair
 *   light-dark(#4D7C0F, #84CC16) (#4D7C0F vs #FFFFFF ≈ 4.6:1 — clears the
 *   3:1 graphic floor). Hazard hues and the A–E grade ramp are data
 *   semantics, each a light-dark() pair with math at the declaration; pin
 *   glyph text uses light-dark(#FFFFFF, #18181B) over the ramp fills
 *   (white ≥4.6:1 on every light-scheme fill; #18181B ≥6:1 on every
 *   dark-scheme fill). The bare --color-text token does not exist and is
 *   never referenced — SVG text uses --color-text-primary/-secondary
 *   explicitly.
 *
 * Density grid (repeated verbatim in the CSS): toolbar 48 ·
 *   map viewBox 760×560 · pin 28 visual in a 40px hit target · legend chip
 *   24 · detail band hazard row 32 with an 8px bar · rail 340 · budget
 *   meter 10 · project card 96 min · evidence row 44 · tabular-nums on
 *   every score, dollar, and delta column.
 *
 * Fixture policy: one state owner (the page component) holds project
 *   statuses, the selected asset, lens, and layer set; effective hazard
 *   scores, composites, grades, the portfolio score, eased pts, budget
 *   remaining, and the evidence ledger are all derived from the same
 *   status map in render — funding a project moves every surface at once
 *   because none of them stores its own copy.
 */

import {useMemo, useState} from 'react';

import {
  Building2Icon,
  FactoryIcon,
  FileCheckIcon,
  HeartPulseIcon,
  MapPinIcon,
  ServerIcon,
  TruckIcon,
  WarehouseIcon,
  ZapIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Groundtruth earth green). Text pair:
// #3F6212 on #FFFFFF ≈ 6.6:1; #A3E635 on ~#1C1C1E ≈ 10.6:1.
const BRAND_TEXT = 'light-dark(#3F6212, #A3E635)';
// Graphic fill (brand mark, budget meter, mitigated bar tail): #4D7C0F vs
// #FFFFFF ≈ 4.6:1; #84CC16 vs ~#1C1C1E ≈ 8.0:1.
const BRAND_FILL = 'light-dark(#4D7C0F, #84CC16)';
// Text/glyphs over a BRAND_FILL surface: #FFFFFF on #4D7C0F ≈ 4.6:1;
// #1A2E05 on #84CC16 ≈ 8.2:1 (white on #84CC16 would fail at ~1.7:1).
const BRAND_ON = 'light-dark(#FFFFFF, #1A2E05)';
// Brand wash (mitigated tails, funded rows); overlaid text stays
// BRAND_TEXT: #3F6212 on rgba(77,124,15,.14)-over-white ≈ 5.9:1.
const BRAND_TINT =
  'light-dark(rgba(77, 124, 15, 0.14), rgba(132, 204, 22, 0.16))';

// Hazard hues (data semantics, not chrome). Light values vs #FFFFFF /
// dark values vs ~#1C1C1E: flood #1D4ED8 ≈ 6.3:1 / #60A5FA ≈ 6.6:1; heat
// #C2410C ≈ 4.9:1 / #FB923C ≈ 7.4:1; wildfire #B91C1C ≈ 5.9:1 / #F87171 ≈
// 6.6:1; outage #6D28D9 ≈ 6.9:1 / #A78BFA ≈ 5.9:1.
const FLOOD_HUE = 'light-dark(#1D4ED8, #60A5FA)';
const FLOOD_TINT =
  'light-dark(rgba(29, 78, 216, 0.12), rgba(96, 165, 250, 0.16))';
const HEAT_HUE = 'light-dark(#C2410C, #FB923C)';
const HEAT_TINT =
  'light-dark(rgba(194, 65, 12, 0.12), rgba(251, 146, 60, 0.16))';
const FIRE_HUE = 'light-dark(#B91C1C, #F87171)';
const FIRE_TINT =
  'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';
const OUTAGE_HUE = 'light-dark(#6D28D9, #A78BFA)';
const OUTAGE_TINT =
  'light-dark(rgba(109, 40, 217, 0.10), rgba(167, 139, 250, 0.14))';

// A–E grade ramp (pin fills, grade chips). Same contrast basis as above:
// A #15803D ≈ 4.7:1 / #4ADE80 ≈ 9.0:1 · B #4D7C0F ≈ 4.6:1 / #A3E635 ≈
// 10.6:1 · C #A16207 ≈ 4.6:1 / #FACC15 ≈ 10.9:1 · D #C2410C ≈ 4.9:1 /
// #FB923C ≈ 7.4:1 · E #B91C1C ≈ 5.9:1 / #F87171 ≈ 6.6:1.
const GRADE_HUES: Record<string, string> = {
  A: 'light-dark(#15803D, #4ADE80)',
  B: 'light-dark(#4D7C0F, #A3E635)',
  C: 'light-dark(#A16207, #FACC15)',
  D: 'light-dark(#C2410C, #FB923C)',
  E: 'light-dark(#B91C1C, #F87171)',
};
// Pin glyph over a GRADE fill: #FFFFFF ≥4.6:1 on every light-scheme value;
// #18181B ≥6.0:1 on every dark-scheme value.
const GRADE_ON = 'light-dark(#FFFFFF, #18181B)';

// Map water wash (graphic, needs only to read as a region).
const WATER_TINT =
  'light-dark(rgba(29, 78, 216, 0.08), rgba(96, 165, 250, 0.10))';

const SCOPE = 'tpl-climate-risk-asset-map';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector prefixed with the scope class. Density grid
// (verbatim): toolbar 48 · map viewBox 760×560 · pin 28 in a 40px hit
// target · legend chip 24 · detail hazard row 32 / 8px bar · rail 340 ·
// budget meter 10 · project card 96 min · evidence row 44.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.${SCOPE} button:disabled { cursor: default; }
.${SCOPE} button:focus-visible {
  outline: 2px solid ${BRAND_FILL};
  outline-offset: 2px;
  border-radius: 6px;
}
.${SCOPE} .crm-num { font-variant-numeric: tabular-nums; }
.${SCOPE} .crm-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- Header chrome ---- */
.${SCOPE} .crm-brandmark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${BRAND_FILL};
  color: ${BRAND_ON};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${SCOPE} .crm-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${SCOPE} .crm-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding-inline: 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  white-space: nowrap;
}
.${SCOPE} .crm-gradechip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 5px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: ${GRADE_ON};
}

/* ---- Frame: map column | 340px rail ---- */
.${SCOPE} .crm-frame {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
}
.${SCOPE} .crm-mapcol {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ---- Toolbar (48px, wraps) ---- */
.${SCOPE} .crm-toolbar {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  row-gap: var(--spacing-1);
  flex-wrap: wrap;
  padding-inline: var(--spacing-3);
  padding-block: 6px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .crm-toolbar-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .crm-chip {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .crm-chip[aria-pressed='true'] {
  background: ${BRAND_FILL};
  border-color: ${BRAND_FILL};
  color: ${BRAND_ON};
}
.${SCOPE} .crm-chip-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ---- Map stage: SVG schematic + overlaid pin buttons ---- */
.${SCOPE} .crm-map {
  position: relative;
  margin: var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  overflow: hidden;
  background: var(--color-background-muted);
}
.${SCOPE} .crm-map svg { display: block; width: 100%; height: auto; }
.${SCOPE} .crm-pin {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.${SCOPE} .crm-pin-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${GRADE_ON};
  border: 2px solid light-dark(#FFFFFF, #18181B);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.30);
  transition: transform 140ms ease;
}
.${SCOPE} .crm-pin[aria-pressed='true'] .crm-pin-dot {
  transform: scale(1.25);
  border-color: ${BRAND_FILL};
}
@media (hover: hover) {
  .${SCOPE} .crm-pin:hover .crm-pin-dot { transform: scale(1.15); }
  .${SCOPE} .crm-pin[aria-pressed='true']:hover .crm-pin-dot {
    transform: scale(1.25);
  }
}

/* ---- Legend strip ---- */
.${SCOPE} .crm-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  padding-inline: var(--spacing-3);
  padding-bottom: var(--spacing-2);
}
.${SCOPE} .crm-legend-item {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .crm-legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  color: ${GRADE_ON};
}

/* ---- Selected-asset detail band ---- */
.${SCOPE} .crm-detail {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.${SCOPE} .crm-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  row-gap: 4px;
}
.${SCOPE} .crm-hazard-row {
  min-height: 32px;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) 112px;
  align-items: center;
  gap: 10px;
}
.${SCOPE} .crm-hazard-name {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.${SCOPE} .crm-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}
.${SCOPE} .crm-bar-fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  border-radius: 999px;
}
.${SCOPE} .crm-bar-eased {
  position: absolute;
  inset-block: 0;
  background: ${BRAND_TINT};
  border-inline-start: 2px solid ${BRAND_FILL};
}
.${SCOPE} .crm-hazard-meta {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  text-align: end;
  white-space: nowrap;
}
.${SCOPE} .crm-eased-note { color: ${BRAND_TEXT}; font-weight: 600; }
.${SCOPE} .crm-detail-projects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.${SCOPE} .crm-projchip {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding-inline: 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .crm-projchip--active {
  border-color: ${BRAND_FILL};
  background: ${BRAND_TINT};
  color: ${BRAND_TEXT};
}
.${SCOPE} .crm-detail-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}

/* ---- Tracker rail (340px) ---- */
.${SCOPE} .crm-rail {
  min-height: 0;
  overflow-y: auto;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  display: flex;
  flex-direction: column;
}
.${SCOPE} .crm-rail-section {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .crm-meter {
  height: 10px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}
.${SCOPE} .crm-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: ${BRAND_FILL};
  transition: width 200ms ease;
}
.${SCOPE} .crm-meter-caption {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .crm-project {
  min-height: 96px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.${SCOPE} .crm-project--funded { border-color: ${BRAND_FILL}; }
.${SCOPE} .crm-project-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.${SCOPE} .crm-project-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.${SCOPE} .crm-project-asset {
  font-size: 11px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .crm-project-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 6px;
}
.${SCOPE} .crm-hazardchip {
  height: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-inline: 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.${SCOPE} .crm-project-cost {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  font-weight: 600;
  white-space: nowrap;
}
.${SCOPE} .crm-project-delta {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: ${BRAND_TEXT};
  font-weight: 700;
  white-space: nowrap;
}
.${SCOPE} .crm-project-refusal {
  font-size: 11px;
  line-height: 1.35;
  color: ${FIRE_HUE};
}
.${SCOPE} .crm-evidence {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-block: 6px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .crm-evidence:last-child { border-bottom: none; }
.${SCOPE} .crm-evidence-label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.${SCOPE} .crm-evidence--new { background: ${BRAND_TINT}; border-radius: 6px; padding-inline: 6px; }

/* ---- Responsive: stack rail below the map column ---- */
@media (max-width: 880px) {
  .${SCOPE} .crm-frame {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    overflow-y: auto;
    display: block;
  }
  .${SCOPE} .crm-mapcol { overflow-y: visible; }
  .${SCOPE} .crm-rail {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
}
@media (max-width: 460px) {
  .${SCOPE} .crm-hazard-row { grid-template-columns: 64px minmax(0, 1fr) 96px; }
  .${SCOPE} .crm-hazard-caption { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .crm-pin-dot,
  .${SCOPE} .crm-meter-fill { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// DOMAIN VOCABULARY — hazards and asset types as meta tables so every
// surface (toolbar, pins, bars, chips) reads one source of names/colors.
// ---------------------------------------------------------------------------

type HazardId = 'flood' | 'heat' | 'wildfire' | 'outage';

interface HazardMeta {
  id: HazardId;
  label: string;
  short: string;
  hue: string;
  tint: string;
  weight: number; // composite weight; the four sum to 1.00
}

const HAZARDS: HazardMeta[] = [
  {id: 'flood', label: 'Flood', short: 'FLD', hue: FLOOD_HUE, tint: FLOOD_TINT, weight: 0.35},
  {id: 'heat', label: 'Extreme heat', short: 'HEAT', hue: HEAT_HUE, tint: HEAT_TINT, weight: 0.2},
  {id: 'wildfire', label: 'Wildfire', short: 'WUI', hue: FIRE_HUE, tint: FIRE_TINT, weight: 0.25},
  {id: 'outage', label: 'Grid outage', short: 'OUT', hue: OUTAGE_HUE, tint: OUTAGE_TINT, weight: 0.2},
];

const HAZARD_BY_ID = new Map(HAZARDS.map(h => [h.id, h]));

type AssetType =
  | 'warehouse'
  | 'data-center'
  | 'clinic'
  | 'substation'
  | 'depot'
  | 'plant'
  | 'office';

const ASSET_TYPE_META: Record<AssetType, {label: string; icon: typeof ZapIcon}> = {
  warehouse: {label: 'Warehouse', icon: WarehouseIcon},
  'data-center': {label: 'Data center', icon: ServerIcon},
  clinic: {label: 'Clinic', icon: HeartPulseIcon},
  substation: {label: 'Substation', icon: ZapIcon},
  depot: {label: 'Depot', icon: TruckIcon},
  plant: {label: 'Treatment plant', icon: FactoryIcon},
  office: {label: 'Office', icon: Building2Icon},
};

// ---------------------------------------------------------------------------
// ASSETS — 12 sites by identity. x/y are 760×560 schematic coordinates
// shared by the SVG drawing and the overlaid pin buttons (as percentages).
// Scores are RAW (pre-mitigation); insured values sum to $375M ✓.
// ---------------------------------------------------------------------------

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  x: number;
  y: number;
  valueM: number; // insured value, $M
  scores: Record<HazardId, number>; // raw 0–100, worse = higher
}

const ASSETS: Asset[] = [
  {
    id: 'a-tidewater',
    name: 'Tidewater Data Center',
    type: 'data-center',
    x: 150,
    y: 210,
    valueM: 86,
    scores: {flood: 78, heat: 41, wildfire: 12, outage: 55},
  },
  {
    id: 'a-pier',
    name: 'Carraway Pier Depot',
    type: 'depot',
    x: 118,
    y: 322,
    valueM: 22,
    scores: {flood: 84, heat: 30, wildfire: 8, outage: 47},
  },
  {
    id: 'a-northgate',
    name: 'Northgate Clinic',
    type: 'clinic',
    x: 330,
    y: 118,
    valueM: 18,
    scores: {flood: 22, heat: 63, wildfire: 10, outage: 38},
  },
  {
    id: 'a-millrace',
    name: 'Millrace Substation',
    type: 'substation',
    x: 298,
    y: 296,
    valueM: 34,
    scores: {flood: 71, heat: 35, wildfire: 18, outage: 66},
  },
  {
    id: 'a-eastridge',
    name: 'Eastridge Logistics Hub',
    type: 'warehouse',
    x: 600,
    y: 178,
    valueM: 29,
    scores: {flood: 14, heat: 44, wildfire: 72, outage: 41},
  },
  {
    id: 'a-foothill',
    name: 'Foothill Cold Storage',
    type: 'warehouse',
    x: 642,
    y: 300,
    valueM: 31,
    scores: {flood: 9, heat: 57, wildfire: 66, outage: 52},
  },
  {
    id: 'a-civic',
    name: 'Civic Center Annex',
    type: 'office',
    x: 392,
    y: 228,
    valueM: 12,
    scores: {flood: 18, heat: 74, wildfire: 6, outage: 29},
  },
  {
    id: 'a-harborline',
    name: 'Harborline Fulfillment',
    type: 'warehouse',
    x: 202,
    y: 420,
    valueM: 41,
    scores: {flood: 62, heat: 38, wildfire: 9, outage: 33},
  },
  {
    id: 'a-ridgeview',
    name: 'Ridgeview Water Treatment',
    type: 'plant',
    x: 556,
    y: 92,
    valueM: 54,
    scores: {flood: 26, heat: 31, wildfire: 58, outage: 61},
  },
  {
    id: 'a-southbank',
    name: 'Southbank Micro-DC',
    type: 'data-center',
    x: 422,
    y: 352,
    valueM: 23,
    scores: {flood: 44, heat: 68, wildfire: 11, outage: 49},
  },
  {
    id: 'a-alderflats',
    name: 'Alder Flats Clinic',
    type: 'clinic',
    x: 312,
    y: 402,
    valueM: 16,
    scores: {flood: 57, heat: 49, wildfire: 13, outage: 36},
  },
  {
    id: 'a-gateway',
    name: 'Gateway Fleet Yard',
    type: 'depot',
    x: 470,
    y: 468,
    valueM: 9,
    scores: {flood: 12, heat: 52, wildfire: 31, outage: 24},
  },
];

const ASSET_BY_ID = new Map(ASSETS.map(a => [a.id, a]));
const TOTAL_VALUE_M = ASSETS.reduce((sum, a) => sum + a.valueM, 0); // 375

// ---------------------------------------------------------------------------
// MITIGATION PROJECTS — P-101…P-108. Deltas subtract from the linked
// asset's hazard score only while status is funded/complete. Budget
// $2,300k; committed at load = 310 + 145 + 420 = $875k ✓.
// ---------------------------------------------------------------------------

type ProjectStatus = 'proposed' | 'funded' | 'complete';

interface Project {
  id: string;
  name: string;
  assetId: string;
  hazard: HazardId;
  costK: number; // $k
  delta: number; // score points removed while funded/complete
  initialStatus: ProjectStatus;
  /** Funded before this session — shows the Funded badge but no Undo
   * (its funding memo is already with the carrier). */
  isLockedFunding?: boolean;
}

const PROJECTS: Project[] = [
  {
    id: 'P-101',
    name: 'Flood barrier & dry floodproofing',
    assetId: 'a-pier',
    hazard: 'flood',
    costK: 310,
    delta: 26,
    initialStatus: 'complete',
  },
  {
    id: 'P-102',
    name: 'Cool-roof retrofit',
    assetId: 'a-civic',
    hazard: 'heat',
    costK: 145,
    delta: 21,
    initialStatus: 'complete',
  },
  {
    id: 'P-103',
    name: 'Switchgear elevation +2.4 m',
    assetId: 'a-tidewater',
    hazard: 'flood',
    costK: 420,
    delta: 24,
    initialStatus: 'funded',
    isLockedFunding: true,
  },
  {
    id: 'P-104',
    name: 'Backup microgrid + 72 h battery',
    assetId: 'a-millrace',
    hazard: 'outage',
    costK: 640,
    delta: 32,
    initialStatus: 'proposed',
  },
  {
    id: 'P-105',
    name: 'Defensible-space clearing, 30 m',
    assetId: 'a-eastridge',
    hazard: 'wildfire',
    costK: 90,
    delta: 28,
    initialStatus: 'proposed',
  },
  {
    id: 'P-106',
    name: 'Stormwater bioswales + check dam',
    assetId: 'a-harborline',
    hazard: 'flood',
    costK: 260,
    delta: 19,
    initialStatus: 'proposed',
  },
  {
    id: 'P-107',
    name: 'Ember-resistant vents & IR sensors',
    assetId: 'a-foothill',
    hazard: 'wildfire',
    costK: 130,
    delta: 22,
    initialStatus: 'proposed',
  },
  {
    id: 'P-108',
    name: 'District chiller loop tie-in',
    assetId: 'a-southbank',
    hazard: 'heat',
    costK: 380,
    delta: 25,
    initialStatus: 'proposed',
  },
];

const PROJECT_BY_ID = new Map(PROJECTS.map(p => [p.id, p]));
const BUDGET_TOTAL_K = 2300;

// ---------------------------------------------------------------------------
// INSURANCE EVIDENCE — base ledger; funding a project appends a memo row.
// ---------------------------------------------------------------------------

interface EvidenceRow {
  id: string;
  label: string;
  status: 'on file' | 'pending review';
  isNew?: boolean; // appended this session — gets the brand-tinted row
}

const BASE_EVIDENCE: EvidenceRow[] = [
  {
    id: 'EV-01',
    label: 'Elevation certificate — Tidewater Data Center',
    status: 'on file',
  },
  {
    id: 'EV-02',
    label: 'P-101 completion report — flood barrier, Carraway Pier Depot',
    status: 'on file',
  },
  {
    id: 'EV-03',
    label: 'P-102 cool-roof spec & thermal scan — Civic Center Annex',
    status: 'on file',
  },
  {
    id: 'EV-04',
    label: 'P-103 funding memo — switchgear elevation, Tidewater DC',
    status: 'pending review',
  },
  {
    id: 'EV-05',
    label: 'Wildland-urban interface survey — Eastridge corridor',
    status: 'on file',
  },
];

// ---------------------------------------------------------------------------
// DERIVATIONS — effective scores, composites, grades, portfolio rollups.
// All pure functions of (statuses); nothing caches a copy.
// ---------------------------------------------------------------------------

type StatusMap = Record<string, ProjectStatus>;

const INITIAL_STATUSES: StatusMap = Object.fromEntries(
  PROJECTS.map(p => [p.id, p.initialStatus]),
);

function isActive(status: ProjectStatus): boolean {
  return status === 'funded' || status === 'complete';
}

/** Effective hazard score after every active project's delta. */
function effectiveScore(
  asset: Asset,
  hazard: HazardId,
  statuses: StatusMap,
): number {
  let score = asset.scores[hazard];
  for (const p of PROJECTS) {
    if (p.assetId === asset.id && p.hazard === hazard && isActive(statuses[p.id])) {
      score = Math.max(0, score - p.delta);
    }
  }
  return score;
}

/** Weighted composite 0–100 (weights sum to 1.00). */
function compositeScore(asset: Asset, statuses: StatusMap): number {
  let total = 0;
  for (const h of HAZARDS) {
    total += h.weight * effectiveScore(asset, h.id, statuses);
  }
  return Math.round(total * 10) / 10;
}

type Grade = 'A' | 'B' | 'C' | 'D' | 'E';

function gradeFor(score: number): Grade {
  if (score < 20) {
    return 'A';
  }
  if (score < 35) {
    return 'B';
  }
  if (score < 50) {
    return 'C';
  }
  if (score < 70) {
    return 'D';
  }
  return 'E';
}

/** Value-weighted portfolio composite. */
function portfolioScore(statuses: StatusMap): number {
  let weighted = 0;
  for (const asset of ASSETS) {
    weighted += compositeScore(asset, statuses) * asset.valueM;
  }
  return Math.round((weighted / TOTAL_VALUE_M) * 10) / 10;
}

/** Unmitigated baseline for the "pts eased" header stat. */
const UNMITIGATED_STATUSES: StatusMap = Object.fromEntries(
  PROJECTS.map(p => [p.id, 'proposed' as ProjectStatus]),
);
const UNMITIGATED_PORTFOLIO = portfolioScore(UNMITIGATED_STATUSES);

function committedK(statuses: StatusMap): number {
  return PROJECTS.reduce(
    (sum, p) => (isActive(statuses[p.id]) ? sum + p.costK : sum),
    0,
  );
}

const formatK = (k: number) =>
  k >= 1000
    ? `$${(k / 1000).toFixed(k % 1000 === 0 ? 1 : 2)}M`
    : `$${k}k`;

// ---------------------------------------------------------------------------
// BRAND MARK — Groundtruth: three nested elevation contours (tiny inline
// SVG, not an emoji).
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <span className="crm-brandmark" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4.5c4.7 0 8 2.6 8 6.2 0 4.3-3.9 8.8-8 8.8s-8-4.5-8-8.8c0-3.6 3.3-6.2 8-6.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12 8c2.9 0 5 1.5 5 3.6 0 2.5-2.4 5.2-5 5.2s-5-2.7-5-5.2C7 9.5 9.1 8 12 8Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12.4" r="1.7" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SCHEMATIC MAP — hand-drawn 760×560 region SVG: Carraway Sound water body,
// the Alder River, contoured Eastridge Hills, faint arterial roads, and
// four toggleable hazard overlays. Deliberately schematic — no tiles, no
// network imagery. aria-hidden: the interactive layer is the HTML pin
// buttons rendered on top by the page.
// ---------------------------------------------------------------------------

function SchematicMap({layers}: {layers: Record<HazardId, boolean>}) {
  return (
    <svg viewBox="0 0 760 560" role="presentation" aria-hidden>
      {/* Water: Carraway Sound along the west edge. */}
      <path
        d="M0 0 H96 C124 70 88 150 118 235 C146 315 66 395 104 470 C122 508 96 536 88 560 H0 Z"
        fill={WATER_TINT}
        stroke={FLOOD_HUE}
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      {/* Alder River: north fork down into the sound. */}
      <path
        d="M436 0 C404 88 344 138 332 218 C322 282 262 320 242 378 C224 430 164 448 118 468"
        fill="none"
        stroke={FLOOD_HUE}
        strokeOpacity="0.45"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Eastridge Hills: three contour lines. */}
      <path
        d="M540 60 C610 40 700 70 752 120"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <path
        d="M528 140 C606 112 706 150 756 214"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <path
        d="M540 236 C620 204 716 250 758 320"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      {/* Arterial roads: faint grid strokes. */}
      <path
        d="M180 60 L720 520 M120 250 H744 M300 8 L470 552 M540 20 L360 548"
        fill="none"
        stroke="var(--color-border)"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      {/* ---- Hazard overlays (toggled) ---- */}
      {layers.flood && (
        <path
          // 100-year floodplain: coastal strip + the river corridor.
          d="M96 0 C128 70 92 150 122 235 C150 315 70 395 108 470 C126 508 100 536 92 560 H210 C186 500 232 452 268 402 C300 356 348 306 362 244 C376 180 448 92 470 0 Z"
          fill={FLOOD_TINT}
          stroke={FLOOD_HUE}
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      )}
      {layers.heat && (
        <path
          // Urban heat island over the civic core / Southbank.
          d="M330 170 C388 148 470 168 486 232 C500 292 470 372 416 392 C356 412 306 366 296 300 C288 240 296 192 330 170 Z"
          fill={HEAT_TINT}
          stroke={HEAT_HUE}
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      )}
      {layers.wildfire && (
        <path
          // Wildland-urban interface along the Eastridge Hills.
          d="M520 30 C610 6 716 44 760 96 V368 C700 344 626 356 566 320 C518 290 508 216 520 150 Z"
          fill={FIRE_TINT}
          stroke={FIRE_HUE}
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      )}
      {layers.outage && (
        <g>
          {/* 115 kV transmission corridor feeding the west shore. */}
          <path
            d="M758 424 L560 380 L422 332 L298 296 L150 210"
            fill="none"
            stroke={OUTAGE_HUE}
            strokeOpacity="0.7"
            strokeWidth="2.5"
            strokeDasharray="10 6"
          />
          {[
            [560, 380],
            [422, 332],
            [298, 296],
          ].map(([px, py]) => (
            <path
              key={`${px}-${py}`}
              d={`M${px - 7} ${py + 9} L${px} ${py - 9} L${px + 7} ${py + 9}`}
              fill="none"
              stroke={OUTAGE_HUE}
              strokeOpacity="0.7"
              strokeWidth="2"
            />
          ))}
        </g>
      )}
      {/* ---- Place labels: SVG text uses the explicit text tokens — the
           bare --color-text token does not exist and paints black. ---- */}
      <text
        x="46"
        y="290"
        fill="var(--color-text-secondary)"
        fontSize="12"
        fontWeight="600"
        letterSpacing="2"
        transform="rotate(-78 46 290)">
        CARRAWAY SOUND
      </text>
      <text
        x="352"
        y="150"
        fill="var(--color-text-secondary)"
        fontSize="11"
        fontStyle="italic"
        transform="rotate(58 352 150)">
        Alder River
      </text>
      <text x="600" y="52" fill="var(--color-text-secondary)" fontSize="11">
        Eastridge Hills
      </text>
      <text x="366" y="264" fill="var(--color-text-secondary)" fontSize="11">
        Civic core
      </text>
      <text x="196" y="472" fill="var(--color-text-secondary)" fontSize="11">
        Harbor flats
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HAZARD BAR ROW — 32px grid row: hue-dotted name · 8px score bar whose
// mitigated share renders as a brand-tinted tail · raw → effective meta.
// ---------------------------------------------------------------------------

function HazardBarRow({
  hazard,
  raw,
  effective,
}: {
  hazard: HazardMeta;
  raw: number;
  effective: number;
}) {
  const eased = raw - effective;
  return (
    <div className="crm-hazard-row">
      <span className="crm-hazard-name" style={{color: hazard.hue}}>
        {hazard.label}
      </span>
      <div
        className="crm-bar"
        role="img"
        aria-label={
          eased > 0
            ? `${hazard.label} score ${effective} after mitigation, down from ${raw}`
            : `${hazard.label} score ${raw}`
        }>
        <span
          className="crm-bar-fill"
          style={{width: `${effective}%`, background: hazard.hue}}
        />
        {eased > 0 && (
          <span
            className="crm-bar-eased"
            style={{left: `${effective}%`, width: `${eased}%`}}
          />
        )}
      </div>
      <span className="crm-hazard-meta">
        {eased > 0 ? (
          <>
            <span className="crm-num">
              {raw} → {effective}
            </span>{' '}
            <span className="crm-eased-note crm-num">−{eased} pts</span>
          </>
        ) : (
          <span className="crm-num">{raw}</span>
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. Project statuses are the one source of
// truth; pin grades, detail bars, portfolio stats, the budget meter, and
// the evidence ledger all derive from the same status map in one render.
// ---------------------------------------------------------------------------

export default function ClimateRiskAssetMapTemplate() {
  const [statuses, setStatuses] = useState<StatusMap>(INITIAL_STATUSES);
  /** Projects funded THIS session, in funding order — drives Undo and the
   * appended (brand-tinted) evidence rows. */
  const [sessionFunded, setSessionFunded] = useState<string[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    'a-tidewater',
  );
  const [lens, setLens] = useState<'composite' | HazardId>('composite');
  const [layers, setLayers] = useState<Record<HazardId, boolean>>({
    flood: true,
    heat: false,
    wildfire: true,
    outage: false,
  });
  const [refusal, setRefusal] = useState<{
    projectId: string;
    text: string;
  } | null>(null);
  const [statusMsg, setStatusMsg] = useState(
    'Groundtruth portfolio loaded. Select a pin or fund a mitigation project.',
  );

  // ---- Derivations -----------------------------------------------------
  const assetViews = useMemo(() => {
    return ASSETS.map(asset => {
      const composite = compositeScore(asset, statuses);
      return {
        asset,
        composite,
        grade: gradeFor(composite),
        effective: Object.fromEntries(
          HAZARDS.map(h => [h.id, effectiveScore(asset, h.id, statuses)]),
        ) as Record<HazardId, number>,
      };
    });
  }, [statuses]);
  const viewById = useMemo(
    () => new Map(assetViews.map(v => [v.asset.id, v])),
    [assetViews],
  );

  const currentPortfolio = useMemo(() => portfolioScore(statuses), [statuses]);
  const easedPts =
    Math.round((UNMITIGATED_PORTFOLIO - currentPortfolio) * 10) / 10;
  const committed = useMemo(() => committedK(statuses), [statuses]);
  const remaining = BUDGET_TOTAL_K - committed;

  const evidence = useMemo<EvidenceRow[]>(() => {
    const appended = sessionFunded
      .map((projectId, index): EvidenceRow | null => {
        const p = PROJECT_BY_ID.get(projectId);
        const asset = p != null ? ASSET_BY_ID.get(p.assetId) : null;
        if (p == null || asset == null) {
          return null;
        }
        return {
          id: `EV-${String(BASE_EVIDENCE.length + index + 1).padStart(2, '0')}`,
          label: `${p.id} funding memo — ${p.name.toLowerCase()}, ${asset.name}`,
          status: 'pending review',
          isNew: true,
        };
      })
      .filter((row): row is EvidenceRow => row != null);
    return [...BASE_EVIDENCE, ...appended];
  }, [sessionFunded]);

  const selectedView =
    selectedAssetId != null ? (viewById.get(selectedAssetId) ?? null) : null;

  // ---- Mutations -------------------------------------------------------
  const fundProject = (projectId: string) => {
    const project = PROJECT_BY_ID.get(projectId);
    if (project == null || statuses[projectId] !== 'proposed') {
      return;
    }
    if (project.costK > remaining) {
      const shortfall = project.costK - remaining;
      setRefusal({
        projectId,
        text: `Needs ${formatK(project.costK)} but only ${formatK(remaining)} remains — short ${formatK(shortfall)}. Undo another funding or raise the capex envelope.`,
      });
      setStatusMsg(
        `Refused: ${project.id} exceeds the remaining budget by ${formatK(shortfall)}.`,
      );
      return;
    }
    const asset = ASSET_BY_ID.get(project.assetId);
    setStatuses(prev => ({...prev, [projectId]: 'funded'}));
    setSessionFunded(prev => [...prev, projectId]);
    setRefusal(null);
    setSelectedAssetId(project.assetId);
    setStatusMsg(
      `${project.id} funded — ${asset ? asset.name : project.assetId} ${
        HAZARD_BY_ID.get(project.hazard)?.label ?? project.hazard
      } eases by ${project.delta} pts; funding memo added to evidence.`,
    );
  };

  const undoFund = (projectId: string) => {
    const project = PROJECT_BY_ID.get(projectId);
    if (project == null || !sessionFunded.includes(projectId)) {
      return;
    }
    setStatuses(prev => ({...prev, [projectId]: 'proposed'}));
    setSessionFunded(prev => prev.filter(id => id !== projectId));
    setRefusal(null);
    setStatusMsg(
      `${project.id} funding reverted — scores, budget, and evidence restored.`,
    );
  };

  const toggleLayer = (hazard: HazardId) => {
    setLayers(prev => ({...prev, [hazard]: !prev[hazard]}));
  };

  // ---- Render ----------------------------------------------------------
  const portfolioGrade = gradeFor(currentPortfolio);

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center">
        <BrandMark />
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Heading level={1}>Meridian Coast Holdings</Heading>
            <Badge label="Carraway Sound region" variant="neutral" />
          </HStack>
        </StackItem>
        <div className="crm-stats">
          <span
            className="crm-stat"
            title="Value-weighted composite across all 12 assets">
            <Text type="supporting" color="secondary">
              Portfolio risk
            </Text>
            <Text type="supporting" weight="semibold" hasTabularNumbers>
              {currentPortfolio.toFixed(1)}
            </Text>
            <span
              className="crm-gradechip"
              style={{background: GRADE_HUES[portfolioGrade]}}>
              {portfolioGrade}
            </span>
          </span>
          <span
            className="crm-stat"
            title="Points eased vs the unmitigated baseline">
            <Text type="supporting" color="secondary">
              Eased
            </Text>
            <Text type="supporting" weight="semibold" hasTabularNumbers>
              −{easedPts.toFixed(1)} pts
            </Text>
          </span>
          <span className="crm-stat" title="Total insured value">
            <Text type="supporting" hasTabularNumbers>
              ${TOTAL_VALUE_M}M · {ASSETS.length} assets
            </Text>
          </span>
          <span className="crm-stat" title="Capex budget remaining">
            <Text type="supporting" color="secondary">
              Budget
            </Text>
            <Text type="supporting" weight="semibold" hasTabularNumbers>
              {formatK(remaining)} left
            </Text>
          </span>
        </div>
      </HStack>
    </LayoutHeader>
  );

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="crm-vh" role="status" aria-live="polite">
              {statusMsg}
            </div>
            <div className="crm-frame">
              {/* ---- Map column ---- */}
              <div className="crm-mapcol">
                <div className="crm-toolbar">
                  <span className="crm-toolbar-label">Pin lens</span>
                  <div
                    role="group"
                    aria-label="Color pins by"
                    style={{display: 'contents'}}>
                    <button
                      type="button"
                      className="crm-chip"
                      aria-pressed={lens === 'composite'}
                      onClick={() => setLens('composite')}>
                      Composite grade
                    </button>
                    {HAZARDS.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        className="crm-chip"
                        aria-pressed={lens === h.id}
                        onClick={() => setLens(h.id)}>
                        <span
                          className="crm-chip-swatch"
                          style={{background: h.hue}}
                          aria-hidden
                        />
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <span className="crm-toolbar-label">Layers</span>
                  <div
                    role="group"
                    aria-label="Hazard overlays"
                    style={{display: 'contents'}}>
                    {HAZARDS.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        className="crm-chip"
                        aria-pressed={layers[h.id]}
                        title={`${layers[h.id] ? 'Hide' : 'Show'} the ${h.label.toLowerCase()} overlay`}
                        onClick={() => toggleLayer(h.id)}>
                        {h.short}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="crm-map">
                  <SchematicMap layers={layers} />
                  {assetViews.map(view => {
                    const {asset} = view;
                    const pinScore =
                      lens === 'composite'
                        ? view.composite
                        : view.effective[lens];
                    const pinGrade = gradeFor(pinScore);
                    const pinText =
                      lens === 'composite' ? view.grade : String(pinScore);
                    const lensLabel =
                      lens === 'composite'
                        ? `composite ${view.composite.toFixed(1)} (grade ${view.grade})`
                        : `${HAZARD_BY_ID.get(lens)?.label ?? lens} score ${pinScore}`;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        className="crm-pin"
                        style={{
                          left: `${(asset.x / 760) * 100}%`,
                          top: `${(asset.y / 560) * 100}%`,
                        }}
                        aria-pressed={selectedAssetId === asset.id}
                        aria-label={`${asset.name}: ${lensLabel}`}
                        title={`${asset.name} — ${lensLabel}`}
                        onClick={() =>
                          setSelectedAssetId(prev =>
                            prev === asset.id ? null : asset.id,
                          )
                        }>
                        <span
                          className="crm-pin-dot"
                          style={{background: GRADE_HUES[pinGrade]}}>
                          {pinText}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="crm-legend" aria-label="Grade legend">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(g => (
                    <span key={g} className="crm-legend-item">
                      <span
                        className="crm-legend-dot"
                        style={{background: GRADE_HUES[g]}}>
                        {g}
                      </span>
                      {g === 'A' && '< 20'}
                      {g === 'B' && '20–34'}
                      {g === 'C' && '35–49'}
                      {g === 'D' && '50–69'}
                      {g === 'E' && '≥ 70'}
                    </span>
                  ))}
                  <span className="crm-legend-item">
                    {lens === 'composite'
                      ? 'Pins show composite grade'
                      : `Pins show ${HAZARD_BY_ID.get(lens)?.label.toLowerCase() ?? lens} score`}
                  </span>
                </div>
                {/* ---- Selected-asset detail band ---- */}
                <div className="crm-detail" aria-label="Selected asset detail">
                  {selectedView == null ? (
                    <div className="crm-detail-empty">
                      <Icon icon={MapPinIcon} size="sm" color="secondary" />
                      <Text type="supporting" color="secondary">
                        Select an asset pin to inspect its hazard profile and
                        linked mitigation projects.
                      </Text>
                    </div>
                  ) : (
                    <>
                      <div className="crm-detail-head">
                        <Icon
                          icon={ASSET_TYPE_META[selectedView.asset.type].icon}
                          size="sm"
                          color="secondary"
                        />
                        <Heading level={2}>{selectedView.asset.name}</Heading>
                        <span
                          className="crm-gradechip"
                          style={{background: GRADE_HUES[selectedView.grade]}}>
                          {selectedView.grade}
                        </span>
                        <Text type="supporting" hasTabularNumbers>
                          composite {selectedView.composite.toFixed(1)}
                        </Text>
                        <Text
                          type="supporting"
                          color="secondary"
                          hasTabularNumbers>
                          {ASSET_TYPE_META[selectedView.asset.type].label} ·
                          insured ${selectedView.asset.valueM}M
                        </Text>
                      </div>
                      <Text type="supporting" color="secondary">
                        <span className="crm-hazard-caption">
                          Bars show the mitigated score; the tinted tail is
                          what active projects removed.
                        </span>
                      </Text>
                      {HAZARDS.map(h => (
                        <HazardBarRow
                          key={h.id}
                          hazard={h}
                          raw={selectedView.asset.scores[h.id]}
                          effective={selectedView.effective[h.id]}
                        />
                      ))}
                      <div className="crm-detail-projects">
                        {PROJECTS.filter(
                          p => p.assetId === selectedView.asset.id,
                        ).map(p => (
                          <span
                            key={p.id}
                            className={
                              isActive(statuses[p.id])
                                ? 'crm-projchip crm-projchip--active'
                                : 'crm-projchip'
                            }>
                            {p.id} · {statuses[p.id]} · −{p.delta} pts
                          </span>
                        ))}
                        {PROJECTS.every(
                          p => p.assetId !== selectedView.asset.id,
                        ) && (
                          <span className="crm-projchip">
                            No mitigation projects proposed yet
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* ---- Tracker rail ---- */}
              <aside className="crm-rail" aria-label="Mitigation tracker">
                <div className="crm-rail-section">
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Heading level={2}>Capex budget</Heading>
                    </StackItem>
                    <Text type="supporting" hasTabularNumbers>
                      {formatK(BUDGET_TOTAL_K)}
                    </Text>
                  </HStack>
                  <div
                    className="crm-meter"
                    role="img"
                    aria-label={`${formatK(committed)} committed of ${formatK(BUDGET_TOTAL_K)}`}>
                    <div
                      className="crm-meter-fill"
                      style={{
                        width: `${(committed / BUDGET_TOTAL_K) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="crm-meter-caption">
                    <span>{formatK(committed)} committed</span>
                    <span>{formatK(remaining)} remaining</span>
                  </div>
                </div>
                <div className="crm-rail-section">
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Heading level={2}>Mitigation projects</Heading>
                    </StackItem>
                    <Badge
                      label={`${PROJECTS.filter(p => isActive(statuses[p.id])).length}/${PROJECTS.length} active`}
                      variant="info"
                    />
                  </HStack>
                  {PROJECTS.map(project => {
                    const status = statuses[project.id];
                    const hazard = HAZARD_BY_ID.get(project.hazard);
                    const asset = ASSET_BY_ID.get(project.assetId);
                    const isSessionFunded = sessionFunded.includes(project.id);
                    return (
                      <div
                        key={project.id}
                        className={
                          isActive(status)
                            ? 'crm-project crm-project--funded'
                            : 'crm-project'
                        }>
                        <div className="crm-project-top">
                          <div style={{flex: 1, minWidth: 0}}>
                            <div className="crm-project-name">
                              {project.id} · {project.name}
                            </div>
                            <div
                              className="crm-project-asset"
                              title={asset?.name}>
                              {asset?.name}
                            </div>
                          </div>
                          <Badge
                            label={
                              status === 'complete'
                                ? 'Complete'
                                : status === 'funded'
                                  ? 'Funded'
                                  : 'Proposed'
                            }
                            variant={
                              status === 'complete'
                                ? 'success'
                                : status === 'funded'
                                  ? 'info'
                                  : 'neutral'
                            }
                          />
                        </div>
                        <div className="crm-project-row">
                          {hazard != null && (
                            <span
                              className="crm-hazardchip"
                              style={{
                                background: hazard.tint,
                                color: hazard.hue,
                              }}>
                              {hazard.short}
                            </span>
                          )}
                          <span className="crm-project-delta">
                            −{project.delta} pts
                          </span>
                          <span className="crm-project-cost">
                            {formatK(project.costK)}
                          </span>
                          <StackItem size="fill">
                            <span />
                          </StackItem>
                          {status === 'proposed' && (
                            <Button
                              label="Fund"
                              variant="primary"
                              size="sm"
                              onClick={() => fundProject(project.id)}
                            />
                          )}
                          {status === 'funded' && isSessionFunded && (
                            <Button
                              label="Undo"
                              variant="ghost"
                              size="sm"
                              onClick={() => undoFund(project.id)}
                            />
                          )}
                          {status === 'funded' &&
                            !isSessionFunded &&
                            project.isLockedFunding && (
                              <Text type="supporting" color="secondary">
                                In carrier review
                              </Text>
                            )}
                        </div>
                        {refusal != null &&
                          refusal.projectId === project.id && (
                            <span
                              className="crm-project-refusal"
                              role="alert">
                              {refusal.text}
                            </span>
                          )}
                      </div>
                    );
                  })}
                </div>
                <div className="crm-rail-section">
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Heading level={2}>Insurance evidence</Heading>
                    </StackItem>
                    <Badge label={`${evidence.length} items`} variant="neutral" />
                  </HStack>
                  <div>
                    {evidence.map(row => (
                      <div
                        key={row.id}
                        className={
                          row.isNew
                            ? 'crm-evidence crm-evidence--new'
                            : 'crm-evidence'
                        }>
                        <Icon
                          icon={FileCheckIcon}
                          size="sm"
                          color="secondary"
                        />
                        <span className="crm-evidence-label">
                          <span className="crm-num">{row.id}</span> ·{' '}
                          {row.label}
                        </span>
                        <Badge
                          label={row.status}
                          variant={
                            row.status === 'on file' ? 'success' : 'info'
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



