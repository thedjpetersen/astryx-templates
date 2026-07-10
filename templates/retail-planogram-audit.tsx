// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Shelfright audit packet for
 *   Store #214 (Cedar Falls): two 4-ft gondola bays on the beverage aisle,
 *   Bay 12 "Carbonated Soft Drinks" (4 shelves, 5+6+6+7 = 24 positions) and
 *   Bay 13 "Hydration & Energy" (4 shelves, 5+6+5+6 = 22 positions), 46
 *   audit positions total. Every shelf's layout units sum to exactly 24
 *   (the 4-ft section width), so the schematic flex widths are true to the
 *   planogram: e.g. Bay 12 S1 = 5+5+4+5+5 = 24, Bay 12 S4 =
 *   4+3+3+4+3+4+3 = 24. District rollup carries five sibling stores with
 *   frozen compliance percentages (96, 91, 88, 83, 74); Store #214's bar
 *   and the district mean derive live from the verdict map. No clock
 *   reads, no randomness, no timers, no network assets — the audit clock
 *   is the fixed string "Thu Jul 9 · 10:42 AM".
 * @output Shelfright — Planogram Audit: a district auditor's shelf-truth
 *   console. Main column: bay switcher, then a shelf-schematic wall — four
 *   shelf bands per bay, each position drawn as a real <button> whose width
 *   is its planogram unit share, carrying an SVG product silhouette (can /
 *   bottle / two-liter / multipack / case / pouch) on its family livery
 *   wash — over a facing detail strip for the selected position and a
 *   district compliance rollup with per-store bars. End panel (336px):
 *   the audit checklist grouped by shelf with per-row verdict buttons, and
 *   a follow-ups lane derived from failing verdicts. Signature move: mark
 *   any position Compliant / Missing / Misplaced from the schematic strip
 *   OR the checklist — one verdict map drives both surfaces, so the
 *   schematic tile restyles (check badge, red hatch, amber dash), the
 *   checklist row ticks, the header audited/compliance chips re-derive,
 *   shelf headers earn completion checks, Store #214's district bar moves
 *   against its frozen siblings, and Missing/Misplaced verdicts mint
 *   replenish/reset follow-up tasks — all in the same render, with
 *   undo by re-marking or clearing the verdict.
 * @position Page template; emitted by `astryx template retail-planogram-audit`
 *
 * Frame: a 100dvh root div (scope class tpl-retail-planogram-audit) gives
 *   Layout height="fill" a definite height in auto-height hosts.
 *   LayoutHeader carries the Shelfright mark, store identity, and the two
 *   derived chips (audited n/46, compliance %). LayoutContent owns the main
 *   column — bay SegmentedControl-style switcher, schematic wall, facing
 *   detail strip, district rollup — scrolling as one column. The checklist
 *   + follow-ups share a fixed 336px end LayoutPanel with its own scroll.
 *
 * Responsive contract:
 * - Desktop stage (~1045px, no media query needed): main column gets
 *   ~700px; a 24-unit shelf renders positions at ~27px/unit so the
 *   narrowest 3-unit case tile is ~81px — labels inside tiles ellipsize,
 *   never wrap. The end panel keeps 336px.
 * - <=760px (fires in the 390px embed iframe and narrow full-screen): the
 *   end panel unmounts and the checklist + follow-ups stack under the
 *   district rollup in one scroll column (subtraction, not squeeze). Tile
 *   price labels drop (CSS), verdict buttons stay 40px, and the detail
 *   strip's meta grid wraps to two columns.
 * - 390px: header sheds the store city and the compliance chip keeps its
 *   bare number, the bay switcher stays full-width, and shelf tiles keep
 *   >=44px hit height because the band height is fixed, not fluid.
 *
 * Container policy (field-audit console archetype): shelf bands, dense
 *   checklist rows, and panels — no marketing cards. The only card-like
 *   surface is the facing detail strip, which is a workbench, not a widget.
 *
 * Color policy: token chrome throughout (--color-border, --color-text-*,
 *   --color-background-card/-muted/-body). ONE quarantined brand accent:
 *   Shelfright cherry, light-dark(#A61E3C, #FF8FA8) — #A61E3C on #FFFFFF
 *   ~7.3:1, #FF8FA8 on ~#1C1C1E ~7.9:1 (math at the declaration). Verdict
 *   state colors are light-dark pairs with math (green/red/amber). Product
 *   family liveries are graphic washes only — text on tiles always uses
 *   --color-text-primary/secondary, never the livery.
 *
 * Density grid (repeated verbatim in the CSS): shelf band 104px (78px
 *   product zone + 8px shelf rail + 18px price rail) · shelf gap 10px ·
 *   checklist rows 56px · shelf group headers 32px · verdict buttons
 *   40x40 · detail strip min 148px · district rows 36px · end panel 336px
 *   · 12px gutters (var(--spacing-3)) · tabular-nums on every count,
 *   percent, price, and unit figure.
 *
 * Fixture policy: fixed data only. The verdict map is the single state
 *   owner; audited count, compliance %, shelf completion, Store #214's
 *   bar, the district mean, and the follow-ups lane are all derived from
 *   it live — nothing is stored twice. Cross-checks: 24 + 22 = 46
 *   positions; each shelf's units sum to 24; seed verdicts = 4 compliant +
 *   1 misplaced + 1 missing = 6 audited, compliance 4/6 = 67%; district
 *   mean at load = (96+91+88+83+74+67)/6 = 83.2 -> 83%; frozen-store sum
 *   96+91+88+83+74 = 432 is the FROZEN_PCT_SUM constant.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
  CheckIcon,
  ClipboardCheckIcon,
  EraserIcon,
  MoveIcon,
  PackageXIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Shelfright brand accent (cherry). #A61E3C on #FFFFFF
// ~7.3:1; #FF8FA8 on the dark body (~#1C1C1E, L~0.012) ~7.9:1 — both clear
// 4.5:1 for text down to 11px and 3:1 for glyph strokes.
const BRAND_ACCENT = 'light-dark(#A61E3C, #FF8FA8)';
// Text/glyphs sitting ON a solid brand fill (header mark): #FFFFFF on
// #A61E3C ~7.3:1; #2B060F on #FF8FA8 ~9.2:1 (white on #FF8FA8 ~1.7:1 fails).
const BRAND_ON = 'light-dark(#FFFFFF, #2B060F)';
// Brand tint wash behind the active bay tab / selected checklist row.
// Brand-accent text over the wash: #A61E3C on rgba(166,30,60,.10)-over-
// white (~#F5E4E8) ~6.6:1; #FF8FA8 on rgba(255,143,168,.14)-over-#1C1C1E
// ~6.7:1.
const BRAND_TINT =
  'light-dark(rgba(166, 30, 60, 0.10), rgba(255, 143, 168, 0.14))';

// Verdict: COMPLIANT (green). #15803D on #FFFFFF ~4.6:1; #4ADE80 on
// #1C1C1E ~10.2:1.
const OK_COLOR = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))';
// Verdict: MISSING / out-of-stock (red). #B42318 on #FFFFFF ~6.3:1;
// #F97066 on #1C1C1E ~6.4:1.
const MISS_COLOR = 'light-dark(#B42318, #F97066)';
const MISS_TINT =
  'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))';
// Verdict: MISPLACED (amber). #B45309 on #FFFFFF ~4.6:1; #FDB022 on
// #1C1C1E ~9.4:1.
const WARN_COLOR = 'light-dark(#B45309, #FDB022)';
const WARN_TINT =
  'light-dark(rgba(180, 83, 9, 0.12), rgba(253, 176, 34, 0.14))';

// Product family liveries — GRAPHIC washes only (tile fills, legend dots,
// silhouette fills). No text ever renders in these; tile text is token
// ink, so the washes only need to read as distinct hues, not pass text
// contrast. The `ink` value strokes the product silhouette against its own
// wash (>=3:1 vs the wash-over-surface blend in both schemes).
type FamilyKey = 'cola' | 'citrus' | 'craft' | 'water' | 'energy' | 'iso';

const LIVERY: Record<FamilyKey, {wash: string; ink: string; label: string}> = {
  cola: {
    wash: 'light-dark(rgba(122, 40, 24, 0.16), rgba(214, 108, 84, 0.22))',
    ink: 'light-dark(#7A2818, #D66C54)',
    label: 'Cola',
  },
  citrus: {
    wash: 'light-dark(rgba(58, 122, 28, 0.16), rgba(148, 210, 106, 0.22))',
    ink: 'light-dark(#3A7A1C, #94D26A)',
    label: 'Citrus',
  },
  craft: {
    wash: 'light-dark(rgba(146, 100, 16, 0.16), rgba(226, 178, 92, 0.22))',
    ink: 'light-dark(#926410, #E2B25C)',
    label: 'Craft soda',
  },
  water: {
    wash: 'light-dark(rgba(22, 96, 154, 0.14), rgba(112, 184, 240, 0.20))',
    ink: 'light-dark(#16609A, #70B8F0)',
    label: 'Water',
  },
  energy: {
    wash: 'light-dark(rgba(104, 52, 158, 0.14), rgba(184, 140, 236, 0.20))',
    ink: 'light-dark(#68349E, #B88CEC)',
    label: 'Energy',
  },
  iso: {
    wash: 'light-dark(rgba(186, 74, 16, 0.14), rgba(244, 148, 96, 0.20))',
    ink: 'light-dark(#BA4A10, #F49460)',
    label: 'Isotonic',
  },
};

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector scoped under .tpl-retail-planogram-audit.
// Density grid (verbatim from the header): shelf band 104px (78 product
// zone + 8 shelf rail + 18 price rail) · shelf gap 10px · checklist rows
// 56px · shelf group headers 32px · verdict buttons 40x40 · detail strip
// min 148px · district rows 36px · end panel 336px · 12px gutters.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.tpl-retail-planogram-audit {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-retail-planogram-audit *,
.tpl-retail-planogram-audit *::before,
.tpl-retail-planogram-audit *::after {
  box-sizing: border-box;
}
.tpl-retail-planogram-audit button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-retail-planogram-audit button:focus-visible,
.tpl-retail-planogram-audit [tabindex]:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.tpl-retail-planogram-audit .pa-num {
  font-variant-numeric: tabular-nums;
}
.tpl-retail-planogram-audit .pa-vh {
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
.tpl-retail-planogram-audit .pa-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
  width: 100%;
}
.tpl-retail-planogram-audit .pa-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${BRAND_ACCENT};
  color: ${BRAND_ON};
  flex: none;
}
.tpl-retail-planogram-audit .pa-header-id {
  min-width: 0;
  flex: 1 1 auto;
}
.tpl-retail-planogram-audit .pa-header-title {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-header-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-header-chips {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: none;
}
.tpl-retail-planogram-audit .pa-chip {
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
.tpl-retail-planogram-audit .pa-chip b {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.tpl-retail-planogram-audit .pa-chip-label {
  color: var(--color-text-secondary);
}
@media (max-width: 480px) {
  .tpl-retail-planogram-audit .pa-chip-label,
  .tpl-retail-planogram-audit .pa-header-sub .pa-city {
    display: none;
  }
}

/* ---- main column ---- */
.tpl-retail-planogram-audit .pa-scroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}
.tpl-retail-planogram-audit .pa-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  min-width: 0;
}
.tpl-retail-planogram-audit .pa-section-title {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 24px;
}

/* ---- bay switcher (44px row) ---- */
.tpl-retail-planogram-audit .pa-bays {
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
}
.tpl-retail-planogram-audit .pa-bay-tab {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: 6px 12px;
  border-radius: 10px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  min-height: 44px;
}
.tpl-retail-planogram-audit .pa-bay-tab[aria-pressed='true'] {
  border-color: ${BRAND_ACCENT};
  background: ${BRAND_TINT};
}
.tpl-retail-planogram-audit .pa-bay-tab-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-bay-tab-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-retail-planogram-audit .pa-bay-tab[aria-pressed='true'] .pa-bay-tab-name {
  color: ${BRAND_ACCENT};
}

/* ---- shelf schematic wall ----
   Shelf band = 104px: 78px product zone sitting on an 8px shelf rail with
   an 18px price rail below. Position tiles are real buttons whose flex
   grows by planogram units (each shelf sums to 24 units). */
.tpl-retail-planogram-audit .pa-wall {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--spacing-3);
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-shelf {
  display: flex;
  flex-direction: column;
}
.tpl-retail-planogram-audit .pa-shelf-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  min-height: 20px;
}
.tpl-retail-planogram-audit .pa-shelf-label .pa-shelf-done {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: ${OK_COLOR};
  font-weight: 600;
}
.tpl-retail-planogram-audit .pa-shelf-band {
  display: flex;
  align-items: stretch;
  gap: 3px;
  height: 78px;
  border-bottom: 8px solid var(--color-border);
  border-radius: 2px 2px 0 0;
}
.tpl-retail-planogram-audit .pa-price-rail {
  display: flex;
  gap: 3px;
  height: 18px;
  background: var(--color-background-muted);
  border-radius: 0 0 3px 3px;
}
.tpl-retail-planogram-audit .pa-price-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
}
@media (max-width: 760px) {
  .tpl-retail-planogram-audit .pa-price-rail {
    display: none;
  }
}

/* Position tile — width via flex-grow = planogram units. */
.tpl-retail-planogram-audit .pa-tile {
  position: relative;
  flex: var(--pa-units) 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  padding: 4px 3px 3px;
  border-radius: 6px 6px 0 0;
  border: var(--border-width, 1px) solid transparent;
  border-bottom: none;
  background: var(--pa-wash);
  transition: background-color 150ms ease, border-color 150ms ease;
}
.tpl-retail-planogram-audit .pa-tile[aria-pressed='true'] {
  border-color: ${BRAND_ACCENT};
  box-shadow: inset 0 0 0 1px ${BRAND_ACCENT};
}
.tpl-retail-planogram-audit .pa-tile-sku {
  max-width: 100%;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-tile-glyphs {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  min-height: 40px;
}
/* Verdict skins — the same verdict map paints checklist rows. */
.tpl-retail-planogram-audit .pa-tile.is-ok {
  background: ${OK_TINT};
}
.tpl-retail-planogram-audit .pa-tile.is-missing {
  background: repeating-linear-gradient(
    135deg,
    ${MISS_TINT} 0 6px,
    transparent 6px 12px
  );
  border-color: ${MISS_COLOR};
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-tile.is-missing .pa-tile-glyphs {
  opacity: 0.25;
}
.tpl-retail-planogram-audit .pa-tile.is-misplaced {
  background: ${WARN_TINT};
  border-style: dashed;
  border-color: ${WARN_COLOR};
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-tile-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.tpl-retail-planogram-audit .pa-tile-badge.is-ok {
  background: ${OK_COLOR};
  color: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-tile-badge.is-missing {
  background: ${MISS_COLOR};
  color: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-tile-badge.is-misplaced {
  background: ${WARN_COLOR};
  color: var(--color-background-card);
}

/* Legend row under the wall. */
.tpl-retail-planogram-audit .pa-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-3);
  padding-top: 2px;
}
.tpl-retail-planogram-audit .pa-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}

/* ---- facing detail strip (min 148px workbench) ---- */
.tpl-retail-planogram-audit .pa-detail {
  display: flex;
  gap: var(--spacing-3);
  min-height: 148px;
  padding: var(--spacing-3);
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-detail-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  flex: none;
  border-radius: 10px;
  background: var(--pa-wash);
}
.tpl-retail-planogram-audit .pa-detail-body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-retail-planogram-audit .pa-detail-name {
  font-size: 14px;
  font-weight: 650;
  line-height: 1.3;
}
.tpl-retail-planogram-audit .pa-detail-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-2) var(--spacing-3);
}
@media (max-width: 760px) {
  .tpl-retail-planogram-audit .pa-detail {
    flex-direction: column;
  }
  .tpl-retail-planogram-audit .pa-detail-glyph {
    width: 100%;
    min-height: 64px;
  }
  .tpl-retail-planogram-audit .pa-detail-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.tpl-retail-planogram-audit .pa-meta-label {
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-meta-value {
  font-size: 12.5px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Verdict buttons — 40x40 minimum everywhere they appear. */
.tpl-retail-planogram-audit .pa-verdicts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: center;
}
.tpl-retail-planogram-audit .pa-verdict-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-retail-planogram-audit .pa-verdict-btn.v-ok[aria-pressed='true'] {
  color: ${OK_COLOR};
  border-color: ${OK_COLOR};
  background: ${OK_TINT};
}
.tpl-retail-planogram-audit .pa-verdict-btn.v-missing[aria-pressed='true'] {
  color: ${MISS_COLOR};
  border-color: ${MISS_COLOR};
  background: ${MISS_TINT};
}
.tpl-retail-planogram-audit .pa-verdict-btn.v-misplaced[aria-pressed='true'] {
  color: ${WARN_COLOR};
  border-color: ${WARN_COLOR};
  background: ${WARN_TINT};
}
.tpl-retail-planogram-audit .pa-verdict-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-verdict-clear:hover {
  background: var(--color-background-muted);
}

/* ---- district rollup (36px store rows) ---- */
.tpl-retail-planogram-audit .pa-district {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-3);
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-store-row {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) 44px;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 36px;
}
@media (max-width: 480px) {
  .tpl-retail-planogram-audit .pa-store-row {
    grid-template-columns: 104px minmax(0, 1fr) 44px;
  }
}
.tpl-retail-planogram-audit .pa-store-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-store-row.is-live .pa-store-name {
  font-weight: 650;
  color: ${BRAND_ACCENT};
}
.tpl-retail-planogram-audit .pa-store-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.tpl-retail-planogram-audit .pa-store-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  background: var(--color-text-secondary);
  transition: width 200ms ease;
}
.tpl-retail-planogram-audit .pa-store-row.is-live .pa-store-fill {
  background: ${BRAND_ACCENT};
}
.tpl-retail-planogram-audit .pa-store-pct {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.tpl-retail-planogram-audit .pa-district-foot {
  padding-top: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ---- end panel: checklist + follow-ups ---- */
.tpl-retail-planogram-audit .pa-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tpl-retail-planogram-audit .pa-panel-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--spacing-3) var(--spacing-3);
}
.tpl-retail-planogram-audit .pa-panel-head {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
}
/* Shelf group header — 32px, sticky inside the panel scroll. */
.tpl-retail-planogram-audit .pa-group-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 32px;
  background: var(--color-background-body);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-group-count {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.tpl-retail-planogram-audit .pa-group-count.is-done {
  color: ${OK_COLOR};
}
/* Checklist row — 56px: select button + three 40x40 verdict squares. */
.tpl-retail-planogram-audit .pa-check-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 56px;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-retail-planogram-audit .pa-check-row:last-child {
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-check-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 4px;
  border-radius: 8px;
  min-height: 48px;
  justify-content: center;
}
.tpl-retail-planogram-audit .pa-check-main[aria-pressed='true'] {
  background: ${BRAND_TINT};
}
.tpl-retail-planogram-audit .pa-check-name {
  font-size: 12.5px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-check-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-check-actions {
  display: flex;
  gap: 4px;
  flex: none;
}
.tpl-retail-planogram-audit .pa-square {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: var(--border-width, 1px) solid var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-square.v-ok[aria-pressed='true'] {
  color: ${OK_COLOR};
  border-color: ${OK_COLOR};
  background: ${OK_TINT};
}
.tpl-retail-planogram-audit .pa-square.v-missing[aria-pressed='true'] {
  color: ${MISS_COLOR};
  border-color: ${MISS_COLOR};
  background: ${MISS_TINT};
}
.tpl-retail-planogram-audit .pa-square.v-misplaced[aria-pressed='true'] {
  color: ${WARN_COLOR};
  border-color: ${WARN_COLOR};
  background: ${WARN_TINT};
}

/* Follow-ups lane. */
.tpl-retail-planogram-audit .pa-task {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-2) 0;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-retail-planogram-audit .pa-task:last-child {
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-task-icon {
  flex: none;
  display: inline-flex;
  margin-top: 1px;
}
.tpl-retail-planogram-audit .pa-task-icon.is-missing { color: ${MISS_COLOR}; }
.tpl-retail-planogram-audit .pa-task-icon.is-misplaced { color: ${WARN_COLOR}; }
.tpl-retail-planogram-audit .pa-task-text {
  font-size: 12px;
  line-height: 1.35;
  min-width: 0;
}
.tpl-retail-planogram-audit .pa-task-text b {
  font-weight: 650;
}
.tpl-retail-planogram-audit .pa-empty {
  padding: var(--spacing-3) 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Reduced motion: collapse the only transitions (color/width). */
@media (prefers-reduced-motion: reduce) {
  .tpl-retail-planogram-audit .pa-tile,
  .tpl-retail-planogram-audit .pa-verdict-btn,
  .tpl-retail-planogram-audit .pa-store-fill {
    transition: none;
  }
}
`;

// ---------------------------------------------------------------------------
// FIXTURES — the Store #214 audit packet. Two bays, 46 positions; every
// shelf's units sum to 24 (verified in the @input comment).
// ---------------------------------------------------------------------------

type GlyphKey = 'can' | 'bottle' | 'twoLiter' | 'multipack' | 'caseBox' | 'pouch';

type BayId = 'bay-12' | 'bay-13';

interface PositionFixture {
  /** Stable identity: p-<bay>-s<shelf>-<pos>. */
  id: string;
  bay: BayId;
  /** Shelf 1 = eye level (top), 4 = base deck. */
  shelf: 1 | 2 | 3 | 4;
  /** 1-based position from the left rail. */
  pos: number;
  /** Planogram width units — each shelf sums to 24. */
  units: number;
  /** Expected facing count for the checklist ("x3 facings"). */
  facings: number;
  sku: string;
  name: string;
  size: string;
  price: string;
  family: FamilyKey;
  glyph: GlyphKey;
}

interface BayFixture {
  id: BayId;
  name: string;
  aisle: string;
  planogramRev: string;
}

const BAYS: BayFixture[] = [
  {
    id: 'bay-12',
    name: 'Carbonated Soft Drinks',
    aisle: 'Aisle 4 · Bay 12',
    planogramRev: 'POG CSD-4B rev 2026.06',
  },
  {
    id: 'bay-13',
    name: 'Hydration & Energy',
    aisle: 'Aisle 4 · Bay 13',
    planogramRev: 'POG HYD-2A rev 2026.05',
  },
];

function position(
  bay: BayId,
  shelf: 1 | 2 | 3 | 4,
  pos: number,
  units: number,
  facings: number,
  sku: string,
  name: string,
  size: string,
  price: string,
  family: FamilyKey,
  glyph: GlyphKey,
): PositionFixture {
  return {
    id: `p-${bay}-s${shelf}-${pos}`,
    bay,
    shelf,
    pos,
    units,
    facings,
    sku,
    name,
    size,
    price,
    family,
    glyph,
  };
}

const POSITIONS: PositionFixture[] = [
  // -------- Bay 12 · Shelf 1 (eye level, 20oz singles) — units 5+5+4+5+5=24
  position('bay-12', 1, 1, 5, 5, 'CSD-1104', 'Cascara Cola Classic', '20 oz', '$2.49', 'cola', 'bottle'),
  position('bay-12', 1, 2, 5, 5, 'CSD-1105', 'Cascara Cola Zero', '20 oz', '$2.49', 'cola', 'bottle'),
  position('bay-12', 1, 3, 4, 4, 'CSD-1131', 'Brightleaf Citrus Twist', '20 oz', '$2.29', 'citrus', 'bottle'),
  position('bay-12', 1, 4, 5, 5, 'CSD-1160', 'Pemberly Ginger Ale', '20 oz', '$2.59', 'craft', 'bottle'),
  position('bay-12', 1, 5, 5, 5, 'CSD-1178', 'Nimbus Sparkling Lime', '20 oz', '$1.99', 'water', 'bottle'),
  // -------- Bay 12 · Shelf 2 (12-packs) — units 4x6=24
  position('bay-12', 2, 1, 4, 2, 'CSD-2210', 'Cascara Cola Classic 12-pk', '12 oz ×12', '$6.99', 'cola', 'multipack'),
  position('bay-12', 2, 2, 4, 2, 'CSD-2211', 'Cascara Cola Zero 12-pk', '12 oz ×12', '$6.99', 'cola', 'multipack'),
  position('bay-12', 2, 3, 4, 2, 'CSD-2240', 'Brightleaf Citrus 12-pk', '12 oz ×12', '$6.79', 'citrus', 'multipack'),
  position('bay-12', 2, 4, 4, 2, 'CSD-2262', 'Pemberly Ginger Ale 12-pk', '12 oz ×12', '$7.49', 'craft', 'multipack'),
  position('bay-12', 2, 5, 4, 2, 'CSD-2280', 'Nimbus Sparkling Variety 12-pk', '12 oz ×12', '$5.99', 'water', 'multipack'),
  position('bay-12', 2, 6, 4, 2, 'CSD-2291', 'Foxglove Root Beer 12-pk', '12 oz ×12', '$7.29', 'craft', 'multipack'),
  // -------- Bay 12 · Shelf 3 (2-liters) — units 4x6=24
  position('bay-12', 3, 1, 4, 2, 'CSD-3310', 'Cascara Cola Classic', '2 L', '$2.79', 'cola', 'twoLiter'),
  position('bay-12', 3, 2, 4, 2, 'CSD-3311', 'Cascara Cola Zero', '2 L', '$2.79', 'cola', 'twoLiter'),
  position('bay-12', 3, 3, 4, 2, 'CSD-3340', 'Brightleaf Citrus Twist', '2 L', '$2.59', 'citrus', 'twoLiter'),
  position('bay-12', 3, 4, 4, 2, 'CSD-3355', 'Foxglove Root Beer', '2 L', '$2.89', 'craft', 'twoLiter'),
  position('bay-12', 3, 5, 4, 2, 'CSD-3372', 'Valu-Pop Cola', '2 L', '$1.19', 'cola', 'twoLiter'),
  position('bay-12', 3, 6, 4, 2, 'CSD-3380', 'Nimbus Tonic', '2 L', '$2.19', 'water', 'twoLiter'),
  // -------- Bay 12 · Shelf 4 (base deck cases) — units 4+3+3+4+3+4+3=24
  position('bay-12', 4, 1, 4, 2, 'CSD-4410', 'Cascara Cola Classic 24-pk case', '12 oz ×24', '$12.99', 'cola', 'caseBox'),
  position('bay-12', 4, 2, 3, 1, 'CSD-4411', 'Cascara Cola Zero 24-pk case', '12 oz ×24', '$12.99', 'cola', 'caseBox'),
  position('bay-12', 4, 3, 3, 1, 'CSD-4440', 'Brightleaf Citrus 24-pk case', '12 oz ×24', '$12.49', 'citrus', 'caseBox'),
  // Stress fixture: 58-char name exercises tile/checklist truncation.
  position('bay-12', 4, 4, 4, 2, 'CSD-4462', 'Pemberly Small-Batch Blood Orange Ginger Ale Collector 24', '12 oz ×24', '$16.99', 'craft', 'caseBox'),
  position('bay-12', 4, 5, 3, 1, 'CSD-4471', 'Valu-Pop Variety 24-pk case', '12 oz ×24', '$8.99', 'cola', 'caseBox'),
  position('bay-12', 4, 6, 4, 2, 'CSD-4480', 'Nimbus Sparkling 24-pk case', '12 oz ×24', '$10.99', 'water', 'caseBox'),
  position('bay-12', 4, 7, 3, 1, 'CSD-4491', 'Foxglove Root Beer 24-pk case', '12 oz ×24', '$13.99', 'craft', 'caseBox'),
  // -------- Bay 13 · Shelf 1 (energy singles) — units 5+5+4+5+5=24
  position('bay-13', 1, 1, 5, 5, 'HYD-1502', 'Voltcharge Original', '16 oz', '$3.29', 'energy', 'can'),
  position('bay-13', 1, 2, 5, 5, 'HYD-1503', 'Voltcharge Zero Sugar', '16 oz', '$3.29', 'energy', 'can'),
  position('bay-13', 1, 3, 4, 4, 'HYD-1521', 'Ionix Berry Surge', '16 oz', '$2.99', 'energy', 'can'),
  position('bay-13', 1, 4, 5, 5, 'HYD-1522', 'Ionix Tropical Rush', '16 oz', '$2.99', 'energy', 'can'),
  position('bay-13', 1, 5, 5, 5, 'HYD-1540', 'Kestrel Yerba Mate', '15.5 oz', '$3.49', 'craft', 'can'),
  // -------- Bay 13 · Shelf 2 (4-packs + isotonic) — units 4x6=24
  position('bay-13', 2, 1, 4, 2, 'HYD-2610', 'Voltcharge Original 4-pk', '16 oz ×4', '$9.99', 'energy', 'multipack'),
  position('bay-13', 2, 2, 4, 2, 'HYD-2611', 'Ionix Berry 4-pk', '16 oz ×4', '$8.99', 'energy', 'multipack'),
  position('bay-13', 2, 3, 4, 4, 'HYD-2630', 'Aquaflow Electrolyte Citrus', '28 oz', '$2.19', 'iso', 'bottle'),
  position('bay-13', 2, 4, 4, 4, 'HYD-2631', 'Aquaflow Electrolyte Zero', '28 oz', '$2.19', 'iso', 'bottle'),
  position('bay-13', 2, 5, 4, 4, 'HYD-2650', 'Peakline Isotonic Orange', '28 oz', '$1.89', 'iso', 'bottle'),
  position('bay-13', 2, 6, 4, 4, 'HYD-2651', 'Peakline Isotonic Glacier', '28 oz', '$1.89', 'iso', 'bottle'),
  // -------- Bay 13 · Shelf 3 (still waters) — units 5+5+4+5+5=24
  position('bay-13', 3, 1, 5, 5, 'HYD-3710', 'Nimbus Spring Water', '1 L', '$1.49', 'water', 'bottle'),
  position('bay-13', 3, 2, 5, 5, 'HYD-3711', 'Nimbus Spring Sport Cap', '700 mL', '$1.29', 'water', 'bottle'),
  position('bay-13', 3, 3, 4, 4, 'HYD-3730', 'Clearbrook Alkaline pH9', '1 L', '$2.29', 'water', 'bottle'),
  position('bay-13', 3, 4, 5, 5, 'HYD-3731', 'Clearbrook Alkaline pH9', '1.5 L', '$2.99', 'water', 'bottle'),
  position('bay-13', 3, 5, 5, 5, 'HYD-3750', 'Aquaflow Powder Sticks 10-ct', '10 ct', '$5.49', 'iso', 'pouch'),
  // -------- Bay 13 · Shelf 4 (base deck cases) — units 4x6=24
  position('bay-13', 4, 1, 4, 2, 'HYD-4810', 'Nimbus Spring 24-pk case', '500 mL ×24', '$4.99', 'water', 'caseBox'),
  position('bay-13', 4, 2, 4, 2, 'HYD-4811', 'Clearbrook Alkaline 12-pk case', '1 L ×12', '$18.99', 'water', 'caseBox'),
  position('bay-13', 4, 3, 4, 2, 'HYD-4830', 'Aquaflow Electrolyte 12-pk case', '28 oz ×12', '$21.99', 'iso', 'caseBox'),
  position('bay-13', 4, 4, 4, 2, 'HYD-4831', 'Peakline Isotonic 12-pk case', '28 oz ×12', '$17.99', 'iso', 'caseBox'),
  position('bay-13', 4, 5, 4, 2, 'HYD-4850', 'Voltcharge 12-pk case', '16 oz ×12', '$26.99', 'energy', 'caseBox'),
  position('bay-13', 4, 6, 4, 2, 'HYD-4851', 'Ionix Variety 12-pk case', '16 oz ×12', '$23.99', 'energy', 'caseBox'),
];

/** Frozen sibling stores; Store #214's row derives live from verdicts. */
const DISTRICT_STORES: Array<{id: string; name: string; pct: number}> = [
  {id: 's-208', name: '#208 Maple Grove', pct: 96},
  {id: 's-221', name: '#221 Larkspur', pct: 91},
  {id: 's-219', name: '#219 Prairie Ridge', pct: 88},
  {id: 's-233', name: '#233 Fenwick', pct: 83},
  {id: 's-227', name: '#227 Beacon Hill', pct: 74},
];

const AUDIT_CLOCK = 'Thu Jul 9 · 10:42 AM';
const AUDITOR = 'D. Okafor (district 7)';

// ---------------------------------------------------------------------------
// VERDICT MODEL — the single state owner is Record<positionId, Verdict>.
// ---------------------------------------------------------------------------

type Verdict = 'ok' | 'missing' | 'misplaced';

const VERDICT_META: Record<
  Verdict,
  {label: string; short: string; className: string}
> = {
  ok: {label: 'Compliant', short: 'OK', className: 'is-ok'},
  missing: {label: 'Missing / OOS', short: 'OOS', className: 'is-missing'},
  misplaced: {label: 'Misplaced', short: 'MISPL', className: 'is-misplaced'},
};

function shelfPositions(bay: BayId, shelf: number): PositionFixture[] {
  return POSITIONS.filter(p => p.bay === bay && p.shelf === shelf);
}

function positionOf(id: string): PositionFixture {
  return POSITIONS.find(p => p.id === id) ?? POSITIONS[0];
}

const SHELF_LABELS: Record<number, string> = {
  1: 'Shelf 1 · eye level',
  2: 'Shelf 2',
  3: 'Shelf 3',
  4: 'Shelf 4 · base deck',
};

// ---------------------------------------------------------------------------
// DOMAIN GLYPHS — inline SVG product silhouettes. Each is a pure stroke/
// fill drawing in the family ink over the family wash; sized by the tile.
// One silhouette per units? No — one per FACING, capped at 4 to keep the
// densest tiles readable (the cap is visual shorthand, the checklist
// carries the true facing count).
// ---------------------------------------------------------------------------

interface GlyphProps {
  glyph: GlyphKey;
  ink: string;
  height?: number;
}

function ProductGlyph({glyph, ink, height = 36}: GlyphProps) {
  const common = {
    fill: ink,
    fillOpacity: 0.55,
    stroke: ink,
    strokeWidth: 1.2,
  } as const;
  switch (glyph) {
    case 'can':
      return (
        <svg width={height * 0.42} height={height} viewBox="0 0 10 24" aria-hidden>
          <rect x="1" y="3" width="8" height="20" rx="1.6" {...common} />
          <line x1="1.4" y1="5.5" x2="8.6" y2="5.5" stroke={ink} strokeWidth="0.8" />
          <ellipse cx="5" cy="3" rx="4" ry="1.4" fill={ink} />
        </svg>
      );
    case 'bottle':
      return (
        <svg width={height * 0.4} height={height} viewBox="0 0 10 26" aria-hidden>
          <rect x="3.4" y="0.5" width="3.2" height="2.4" rx="0.6" fill={ink} />
          <path
            d="M3.4 3 L2 7.5 L2 24 Q2 25.4 3.4 25.4 L6.6 25.4 Q8 25.4 8 24 L8 7.5 L6.6 3 Z"
            {...common}
          />
        </svg>
      );
    case 'twoLiter':
      return (
        <svg width={height * 0.5} height={height} viewBox="0 0 13 26" aria-hidden>
          <rect x="5" y="0.5" width="3" height="2.6" rx="0.6" fill={ink} />
          <path
            d="M5 3.4 L3 8 L3 23.4 Q3 25.4 5 25.4 L8 25.4 Q10 25.4 10 23.4 L10 8 L8 3.4 Z"
            {...common}
          />
          <line x1="3.4" y1="12" x2="9.6" y2="12" stroke={ink} strokeWidth="0.8" />
          <line x1="3.4" y1="18" x2="9.6" y2="18" stroke={ink} strokeWidth="0.8" />
        </svg>
      );
    case 'multipack':
      return (
        <svg width={height * 1.05} height={height * 0.72} viewBox="0 0 30 20" aria-hidden>
          <rect x="1" y="4" width="28" height="15" rx="1.6" {...common} />
          <path d="M1 8 L8 1.5 L22 1.5 L29 8" fill="none" stroke={ink} strokeWidth="1.2" />
          <circle cx="8" cy="12" r="2" fill={ink} />
          <circle cx="15" cy="12" r="2" fill={ink} />
          <circle cx="22" cy="12" r="2" fill={ink} />
        </svg>
      );
    case 'caseBox':
      return (
        <svg width={height * 1.15} height={height * 0.66} viewBox="0 0 32 18" aria-hidden>
          <rect x="1" y="1" width="30" height="16" rx="1.4" {...common} />
          <line x1="1" y1="6" x2="31" y2="6" stroke={ink} strokeWidth="1" />
          <rect x="11" y="9" width="10" height="5" rx="1" fill={ink} />
        </svg>
      );
    case 'pouch':
      return (
        <svg width={height * 0.62} height={height} viewBox="0 0 16 26" aria-hidden>
          <path
            d="M3 2 L13 2 L14.5 24 Q14.5 25.4 13 25.4 L3 25.4 Q1.5 25.4 1.5 24 Z"
            {...common}
          />
          <line x1="3" y1="5" x2="13.4" y2="5" stroke={ink} strokeWidth="1.4" />
        </svg>
      );
  }
}

/** Shelfright mark: three shelf lines earning a check. */
function ShelfrightMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <line x1="2" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="14" x2="7" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 12.5 L13 15 L17 9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

/**
 * Seed verdicts so the surface opens mid-audit: 4 compliant + 1 missing +
 * 1 misplaced = 6 audited, compliance 4/6 = 67%, two follow-ups minted.
 */
const SEED_VERDICTS: Record<string, Verdict> = {
  'p-bay-12-s1-1': 'ok',
  'p-bay-12-s1-2': 'ok',
  'p-bay-12-s1-3': 'ok',
  'p-bay-12-s1-4': 'misplaced',
  'p-bay-12-s1-5': 'ok',
  'p-bay-12-s2-3': 'missing',
};

const FROZEN_PCT_SUM = DISTRICT_STORES.reduce((sum, s) => sum + s.pct, 0); // 432

export default function RetailPlanogramAuditTemplate() {
  const toast = useToast();
  // Fires in the 390px embed iframe / narrow full-screen, never in the
  // ~1045px inline stage (viewport there is 1440px) — see the contract.
  const isCompact = useMediaQuery('(max-width: 760px)');

  const [bayId, setBayId] = useState<BayId>('bay-12');
  const [selectedId, setSelectedId] = useState<string>('p-bay-12-s2-3');
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>(
    SEED_VERDICTS,
  );
  const [announcement, setAnnouncement] = useState('');

  // ---- derivations (single source of truth: the verdict map) ----

  const auditedCount = Object.keys(verdicts).length;
  const okCount = Object.values(verdicts).filter(v => v === 'ok').length;
  const compliancePct =
    auditedCount === 0 ? null : Math.round((okCount / auditedCount) * 100);

  const districtMean =
    compliancePct === null
      ? Math.round(FROZEN_PCT_SUM / DISTRICT_STORES.length)
      : Math.round(
          (FROZEN_PCT_SUM + compliancePct) / (DISTRICT_STORES.length + 1),
        );

  const followUps = useMemo(
    () =>
      POSITIONS.filter(p => {
        const v = verdicts[p.id];
        return v === 'missing' || v === 'misplaced';
      }),
    [verdicts],
  );

  const bay = BAYS.find(b => b.id === bayId) ?? BAYS[0];
  const selected = positionOf(selectedId);
  const selectedVerdict: Verdict | null = verdicts[selectedId] ?? null;

  const bayAudited = (id: BayId) =>
    POSITIONS.filter(p => p.bay === id && verdicts[p.id] !== undefined).length;
  const bayTotal = (id: BayId) => POSITIONS.filter(p => p.bay === id).length;

  // ---- handlers ----

  const selectPosition = (id: string) => {
    const pos = positionOf(id);
    setSelectedId(id);
    if (pos.bay !== bayId) {
      setBayId(pos.bay);
    }
  };

  /** The one mutation every surface calls. null clears the verdict. */
  const applyVerdict = (id: string, verdict: Verdict | null) => {
    const pos = positionOf(id);
    const next: Record<string, Verdict> = {...verdicts};
    if (verdict === null) {
      delete next[id];
    } else {
      next[id] = verdict;
    }
    // Derive the post-mutation stats once so the toast matches the render.
    const nextAudited = Object.keys(next).length;
    const nextOk = Object.values(next).filter(v => v === 'ok').length;
    const nextPct =
      nextAudited === 0 ? null : Math.round((nextOk / nextAudited) * 100);
    setVerdicts(next);
    setSelectedId(id);
    if (verdict === null) {
      toast({body: `${pos.sku} verdict cleared`, isAutoHide: true});
      setAnnouncement(`${pos.sku} verdict cleared.`);
      return;
    }
    const followUpNote =
      verdict === 'missing'
        ? ' — replenish follow-up added'
        : verdict === 'misplaced'
          ? ' — reset follow-up added'
          : '';
    toast({
      body: `${pos.sku} marked ${VERDICT_META[verdict].label} · compliance ${
        nextPct ?? 0
      }%${followUpNote}`,
      isAutoHide: true,
    });
    setAnnouncement(
      `${pos.sku} marked ${VERDICT_META[verdict].label}. Audited ${nextAudited} of ${POSITIONS.length}, compliance ${nextPct ?? 0} percent.`,
    );
  };

  /** Toggle semantics: pressing the active verdict clears it. */
  const toggleVerdict = (id: string, verdict: Verdict) => {
    applyVerdict(id, verdicts[id] === verdict ? null : verdict);
  };

  // ---- schematic wall ----

  const shelfBand = (shelf: 1 | 2 | 3 | 4) => {
    const row = shelfPositions(bayId, shelf);
    const auditedOnShelf = row.filter(p => verdicts[p.id] !== undefined).length;
    const shelfDone = auditedOnShelf === row.length;
    return (
      <div className="pa-shelf" key={`${bayId}-s${shelf}`}>
        <div className="pa-shelf-label">
          <span>{SHELF_LABELS[shelf]}</span>
          <span className="pa-num">
            {auditedOnShelf}/{row.length}
          </span>
          {shelfDone && (
            <span className="pa-shelf-done">
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
              audited
            </span>
          )}
        </div>
        <div className="pa-shelf-band" role="group" aria-label={SHELF_LABELS[shelf]}>
          {row.map(p => {
            const v = verdicts[p.id];
            const livery = LIVERY[p.family];
            const glyphCount = Math.min(p.facings, 4);
            return (
              <button
                key={p.id}
                type="button"
                className={`pa-tile${v !== undefined ? ` ${VERDICT_META[v].className}` : ''}`}
                style={
                  {
                    '--pa-units': p.units,
                    '--pa-wash': livery.wash,
                  } as CSSProperties
                }
                aria-pressed={p.id === selectedId}
                aria-label={`${p.sku} ${p.name}, shelf ${p.shelf} position ${p.pos}${
                  v !== undefined ? `, marked ${VERDICT_META[v].label}` : ', not audited'
                }`}
                onClick={() => selectPosition(p.id)}>
                {v !== undefined && (
                  <span
                    className={`pa-tile-badge ${VERDICT_META[v].className}`}
                    aria-hidden>
                    <Icon
                      icon={
                        v === 'ok'
                          ? CheckIcon
                          : v === 'missing'
                            ? PackageXIcon
                            : MoveIcon
                      }
                      size="xsm"
                      color="inherit"
                    />
                  </span>
                )}
                <span className="pa-tile-glyphs" aria-hidden>
                  {Array.from({length: glyphCount}, (_, i) => (
                    <ProductGlyph
                      key={i}
                      glyph={p.glyph}
                      ink={livery.ink}
                      height={p.glyph === 'multipack' || p.glyph === 'caseBox' ? 30 : 36}
                    />
                  ))}
                </span>
                <span className="pa-tile-sku">{p.sku}</span>
              </button>
            );
          })}
        </div>
        <div className="pa-price-rail" aria-hidden>
          {row.map(p => (
            <span
              key={p.id}
              className="pa-price-cell"
              style={{flex: `${p.units} 1 0`}}>
              {p.price}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const wall = (
    <section aria-label={`Shelf schematic — ${bay.name}`}>
      <div className="pa-section-head">
        <span className="pa-section-title">Shelf schematic</span>
        <span className="pa-bay-tab-meta">{bay.planogramRev}</span>
      </div>
      <div className="pa-wall">
        {([1, 2, 3, 4] as const).map(shelf => shelfBand(shelf))}
        <div className="pa-legend" aria-hidden>
          {(Object.keys(LIVERY) as FamilyKey[]).map(key => (
            <span key={key} className="pa-legend-item">
              <span
                className="pa-legend-dot"
                style={{background: LIVERY[key].ink, opacity: 0.7}}
              />
              {LIVERY[key].label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );

  // ---- facing detail strip ----

  const selectedLivery = LIVERY[selected.family];
  const detailStrip = (
    <section aria-label="Facing detail">
      <div
        className="pa-detail"
        style={{'--pa-wash': selectedLivery.wash} as CSSProperties}>
        <span className="pa-detail-glyph" aria-hidden>
          <ProductGlyph
            glyph={selected.glyph}
            ink={selectedLivery.ink}
            height={52}
          />
        </span>
        <div className="pa-detail-body">
          <div className="pa-detail-name">{selected.name}</div>
          <div className="pa-detail-meta">
            <div>
              <div className="pa-meta-label">SKU</div>
              <div className="pa-meta-value">{selected.sku}</div>
            </div>
            <div>
              <div className="pa-meta-label">Slot</div>
              <div className="pa-meta-value">
                S{selected.shelf} · P{selected.pos}
              </div>
            </div>
            <div>
              <div className="pa-meta-label">Facings</div>
              <div className="pa-meta-value">
                ×{selected.facings} ({selected.units}u)
              </div>
            </div>
            <div>
              <div className="pa-meta-label">Tag price</div>
              <div className="pa-meta-value">
                {selected.price} · {selected.size}
              </div>
            </div>
          </div>
          <div
            className="pa-verdicts"
            role="group"
            aria-label={`Verdict for ${selected.sku}`}>
            {(Object.keys(VERDICT_META) as Verdict[]).map(v => (
              <button
                key={v}
                type="button"
                className={`pa-verdict-btn v-${v}`}
                aria-pressed={selectedVerdict === v}
                onClick={() => toggleVerdict(selected.id, v)}>
                <Icon
                  icon={
                    v === 'ok'
                      ? CheckIcon
                      : v === 'missing'
                        ? PackageXIcon
                        : MoveIcon
                  }
                  size="sm"
                  color="inherit"
                />
                {VERDICT_META[v].label}
              </button>
            ))}
            {selectedVerdict !== null && (
              <button
                type="button"
                className="pa-verdict-clear"
                onClick={() => applyVerdict(selected.id, null)}>
                <Icon icon={EraserIcon} size="sm" color="inherit" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // ---- district rollup ----

  const liveLabel =
    compliancePct === null ? '—' : `${compliancePct}%`;
  const districtRows = [
    ...DISTRICT_STORES.map(s => ({...s, isLive: false})),
    {
      id: 's-214',
      name: '#214 Cedar Falls (this audit)',
      pct: compliancePct ?? 0,
      isLive: true,
    },
  ].sort((a, b) => b.pct - a.pct);

  const district = (
    <section aria-label="District compliance rollup">
      <div className="pa-section-head">
        <span className="pa-section-title">District 7 rollup</span>
        <span className="pa-bay-tab-meta">
          mean {districtMean}% · {DISTRICT_STORES.length + 1} stores
        </span>
      </div>
      <div className="pa-district">
        {districtRows.map(s => (
          <div
            key={s.id}
            className={`pa-store-row${s.isLive ? ' is-live' : ''}`}>
            <span className="pa-store-name">{s.name}</span>
            <span
              className="pa-store-bar"
              role="img"
              aria-label={`${s.name}: ${
                s.isLive ? liveLabel : `${s.pct}%`
              } compliant`}>
              <span
                className="pa-store-fill"
                style={{width: `${s.isLive ? (compliancePct ?? 0) : s.pct}%`}}
              />
            </span>
            <span className="pa-store-pct">
              {s.isLive ? liveLabel : `${s.pct}%`}
            </span>
          </div>
        ))}
        <div className="pa-district-foot">
          Store #214 recomputes from this audit&apos;s verdicts; sibling
          stores are last week&apos;s certified walks.
        </div>
      </div>
    </section>
  );

  // ---- checklist + follow-ups (end panel, or stacked when compact) ----

  const checklist = (
    <section aria-label="Audit checklist">
      {([1, 2, 3, 4] as const).map(shelf => {
        const row = shelfPositions(bayId, shelf);
        const audited = row.filter(p => verdicts[p.id] !== undefined).length;
        return (
          <div key={`cl-${bayId}-${shelf}`}>
            <div className="pa-group-head">
              <span>{SHELF_LABELS[shelf]}</span>
              <span
                className={`pa-group-count pa-num${
                  audited === row.length ? ' is-done' : ''
                }`}>
                {audited}/{row.length}
              </span>
            </div>
            {row.map(p => {
              const v = verdicts[p.id];
              return (
                <div className="pa-check-row" key={`cl-${p.id}`}>
                  <button
                    type="button"
                    className="pa-check-main"
                    aria-pressed={p.id === selectedId}
                    aria-label={`Select ${p.sku} ${p.name}`}
                    onClick={() => selectPosition(p.id)}>
                    <span className="pa-check-name">{p.name}</span>
                    <span className="pa-check-sub">
                      {p.sku} · ×{p.facings} · {p.price}
                    </span>
                  </button>
                  <div
                    className="pa-check-actions"
                    role="group"
                    aria-label={`Verdict for ${p.sku}`}>
                    {(Object.keys(VERDICT_META) as Verdict[]).map(verdict => (
                      <button
                        key={verdict}
                        type="button"
                        className={`pa-square v-${verdict}`}
                        aria-pressed={v === verdict}
                        aria-label={`Mark ${p.sku} ${VERDICT_META[verdict].label}`}
                        onClick={() => toggleVerdict(p.id, verdict)}>
                        <Icon
                          icon={
                            verdict === 'ok'
                              ? CheckIcon
                              : verdict === 'missing'
                                ? PackageXIcon
                                : MoveIcon
                          }
                          size="sm"
                          color="inherit"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );

  const followUpsLane = (
    <section aria-label="Follow-up tasks">
      <div className="pa-group-head">
        <span>Follow-ups</span>
        <span className="pa-group-count pa-num">{followUps.length}</span>
      </div>
      {followUps.length === 0 ? (
        <div className="pa-empty">
          No follow-ups yet — Missing and Misplaced verdicts mint replenish
          and reset tasks here.
        </div>
      ) : (
        followUps.map(p => {
          const v = verdicts[p.id] as Verdict;
          return (
            <div className="pa-task" key={`task-${p.id}`}>
              <span className={`pa-task-icon ${VERDICT_META[v].className}`}>
                <Icon
                  icon={v === 'missing' ? PackageXIcon : MoveIcon}
                  size="sm"
                  color="inherit"
                />
              </span>
              <span className="pa-task-text">
                {v === 'missing' ? (
                  <>
                    Replenish <b>{p.sku}</b> — {p.name} ({p.facings} facings,{' '}
                    {p.bay === 'bay-12' ? 'Bay 12' : 'Bay 13'} S{p.shelf} P
                    {p.pos})
                  </>
                ) : (
                  <>
                    Reset <b>{p.sku}</b> to{' '}
                    {p.bay === 'bay-12' ? 'Bay 12' : 'Bay 13'} shelf {p.shelf},
                    position {p.pos} per {p.bay === 'bay-12'
                      ? BAYS[0].planogramRev
                      : BAYS[1].planogramRev}
                  </>
                )}
              </span>
            </div>
          );
        })
      )}
    </section>
  );

  const panelBody = (
    <div className="pa-panel">
      <div className="pa-panel-head">
        <span className="pa-section-title">Audit checklist — {bay.name}</span>
      </div>
      <div className="pa-panel-scroll">
        {checklist}
        {followUpsLane}
      </div>
    </div>
  );

  // ---- bay switcher ----

  const baySwitcher = (
    <div className="pa-bays" role="group" aria-label="Bay switcher">
      {BAYS.map(b => (
        <button
          key={b.id}
          type="button"
          className="pa-bay-tab"
          aria-pressed={b.id === bayId}
          onClick={() => setBayId(b.id)}>
          <span style={{minWidth: 0}}>
            <span className="pa-bay-tab-name">{b.name}</span>
            <br />
            <span className="pa-bay-tab-meta">{b.aisle}</span>
          </span>
          <span className="pa-bay-tab-meta pa-num">
            {bayAudited(b.id)}/{bayTotal(b.id)}
          </span>
        </button>
      ))}
    </div>
  );

  // ---- frame ----

  return (
    <div className="tpl-retail-planogram-audit">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="pa-header">
              <span className="pa-mark" aria-hidden>
                <ShelfrightMark />
              </span>
              <div className="pa-header-id">
                <h1 className="pa-header-title">Shelfright · Planogram Audit</h1>
                <div className="pa-header-sub">
                  Store #214<span className="pa-city"> — Cedar Falls</span> ·{' '}
                  {AUDIT_CLOCK} · {AUDITOR}
                </div>
              </div>
              <div className="pa-header-chips">
                <span className="pa-chip">
                  <Icon icon={ClipboardCheckIcon} size="xsm" color="secondary" />
                  <span className="pa-chip-label">Audited</span>
                  <b>
                    {auditedCount}/{POSITIONS.length}
                  </b>
                </span>
                <span className="pa-chip">
                  <span className="pa-chip-label">Compliance</span>
                  <b>{compliancePct === null ? '—' : `${compliancePct}%`}</b>
                </span>
              </div>
            </div>
          </LayoutHeader>
        }
        end={
          !isCompact ? (
            <LayoutPanel hasDivider width={336} padding={0} label="Audit checklist">
              {panelBody}
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="pa-vh">
              {announcement}
            </div>
            <div className="pa-scroll">
              <div className="pa-main">
                {baySwitcher}
                {wall}
                {detailStrip}
                {district}
                {isCompact && panelBody}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
