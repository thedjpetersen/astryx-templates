var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Seatsmith renewal audit of
 *   Lumenary Inc's Datawell Analytics contract (240 assigned seats, renews
 *   Sep 30 2026 — 82 days out from the demo's internal Jul 10 today:
 *   21 remaining July days + 31 Aug + 30 Sep = 82 ✓). Cross-checks
 *   verified by hand:
 *   - 90-day activity histogram buckets 9 + 16 + 24 + 40 + 63 + 88 = 240 ✓
 *   - Licensed tier mix 64 Enterprise + 132 Pro + 44 Viewer = 240 ✓
 *   - 16 flagged seats = 9 reclaim candidates (all nine 0-day seats:
 *     4 Enterprise × $948 = $3,792 · 5 Pro × $540 = $2,700 → $6,492) +
 *     7 downgrade candidates (3 Ent→Pro × $408 = $1,224 · 4 Pro→Viewer ×
 *     $396 = $1,584 → $2,808); identified = 6,492 + 2,808 = $9,300/yr ✓
 *   - Downgrade deltas: 948 − 540 = 408 ✓ · 540 − 144 = 396 ✓
 *   - One reclaim candidate (svc-boardroom, $540) is contract-locked under
 *     SOW #DW-7, so addressable = 9,300 − 540 = $8,760/yr ✓
 *   - Every seat's 12-week strip is active DAYS per week and sums to its
 *     daysActive90 field (reclaims are all-zero rows; e.g. s14:
 *     1+2+1+0+1+2+0+1+1+0+1+1 = 11 ✓)
 *   - Full-plan tier projection: Ent 64−4−3 = 57 · Pro 132−4+3−4 = 127 ·
 *     Viewer 44+4 = 48 → 232 = 240 − 8 executed reclaims ✓
 *   - Initial batch {s03, s07, s11} = 948 + 540 + 408 = $1,896/yr ✓
 *   No Date.now(), no Math.random(), no timers, no network assets.
 * @output Seatsmith — SaaS Seat Audit: a license-optimization console for
 *   one vendor contract. Header (Seatsmith four-seat mark, contract title,
 *   renewal countdown badge, plan-export action) over a main column —
 *   analytics band (four 88px KPI tiles + an interactive 90-day
 *   seat-utilization histogram whose buckets filter the table), a filter
 *   row (search, All/Reclaim/Downgrade segmented control, active-bucket
 *   pill), and the entitlement drift table (48px rows: identity, tier
 *   chip, last-active, 12-week activity strip + drift reason, $/yr,
 *   add-to-batch) — beside a 336px reclaim-plan tray (license-tier bar
 *   pair "Today → After plan" with a hatched reclaimed gap, live projected
 *   savings counter vs the $9,300 identified, grouped batch list, export
 *   log). Signature move: adding a seat to the reclaim batch re-derives
 *   the savings counter, redraws both tier bars, regroups the tray, and
 *   restyles the row — while the contract-locked boardroom seat REFUSES
 *   with an inline SOW reason instead of batching.
 * @position Page template; emitted by \`astryx template saas-seat-audit\`
 *
 * Frame: root .tpl-saas-seat-audit 100dvh div (\`Layout height="fill"\`
 *   collapses in the demo's auto-height stage) > Layout: header (56px row)
 *   | content (analytics band → filter row → scrolling drift table) | end
 *   tray panel 336 (scrolls independently). Below 980px (fullscreen /
 *   embed only — the inline stage never fires viewport media queries) the
 *   end panel is dropped via useMediaQuery and the tray renders as a
 *   full-width section after the table inside the one content scroller.
 * Responsive contract (subtraction, not squeeze):
 * - Default stage ≥ ~1045px: full frame; the table keeps all seven
 *   segments at 1045 − 336 tray = ~709px of main column.
 * - <= 980px: the tray leaves the end slot and stacks under the table
 *   (useMediaQuery, not CSS, because Layout owns the slot).
 * - <= 640px: KPI tiles wrap 2×2, the histogram scrolls horizontally,
 *   and rows drop their last-active + activity-strip segments (CSS media
 *   query — real in the 390px embed iframe and fullscreen).
 * Container policy: dense-tool archetype — frame rows and panels, no
 *   Cards. Histogram buckets, segmented filters, add-to-batch controls,
 *   and tray remove buttons are real \`<button>\`s; the drift table is a
 *   semantic <table> with a sticky 32px header.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Seatsmith gold) as a light-dark() pair with contrast math at the
 *   declaration; supporting state literals (reclaim red, downgrade blue,
 *   confirm green) are also light-dark() pairs with math. Text tokens are
 *   --color-text-primary / --color-text-secondary only.
 * Density grid (repeated verbatim): header 56 · KPI tiles 88 · histogram
 *   plot 112 · bucket columns 96 · table header 32 · seat rows 48 · tray
 *   336 · tray rows 56 · 16px page gutter · 12px intra-panel gutter.
 *   fontVariantNumeric: tabular-nums on every count, date, and dollar.
 * Fixture policy: fixed strings and literal arrays only (see @input);
 *   aggregates that a mutation can move (savings counter, tier bars,
 *   batch grouping, addressable totals) are DERIVED live from the row
 *   set, never restated as literals.
 */

import {useMemo, useState} from 'react';
import {
  ArchiveIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  CheckIcon,
  DownloadIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  TrendingDownIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Seatsmith brand accent (audit gold). #8A6400 on #FFFFFF
// ≈ 5.4:1 (passes 4.5:1 for every text size used); #F2C24B on the dark
// body (~#1C1C1E) ≈ 10.2:1.
const ACCENT = 'light-dark(#8A6400, #F2C24B)';
// Text/glyphs over an ACCENT fill: #FFFFFF on #8A6400 ≈ 5.4:1;
// #241A00 on #F2C24B ≈ 9.8:1 (white on #F2C24B would fail at ~1.6:1).
const ACCENT_ON = 'light-dark(#FFFFFF, #241A00)';
// Accent wash for selected/batched surfaces — ACCENT text on this wash
// stays ≥ 4.6:1 in both schemes (the wash only nudges the surface ~10%).
const ACCENT_TINT = 'light-dark(rgba(138, 100, 0, 0.10), rgba(242, 194, 75, 0.14))';
// Reclaim (seat removed) tag/state. #C13515 on #FFFFFF ≈ 4.9:1;
// #FF9A80 on #1C1C1E ≈ 8.6:1.
const RECLAIM = 'light-dark(#C13515, #FF9A80)';
const RECLAIM_TINT = 'light-dark(rgba(193, 53, 21, 0.10), rgba(255, 154, 128, 0.14))';
// Downgrade (tier drop) tag/state — also the Pro-tier hue in the bars.
// #0A66C2 on #FFFFFF ≈ 5.2:1; #6CB4F5 on #1C1C1E ≈ 8.1:1.
const DOWNGRADE = 'light-dark(#0A66C2, #6CB4F5)';
const DOWNGRADE_TINT = 'light-dark(rgba(10, 102, 194, 0.10), rgba(108, 180, 245, 0.14))';
// Confirmation (plan exported) hue. #137333 on #FFFFFF ≈ 5.9:1;
// #57D48F on #1C1C1E ≈ 9.0:1.
const CONFIRM = 'light-dark(#137333, #57D48F)';
// Enterprise bar segments reuse ACCENT and Pro reuses DOWNGRADE; the Viewer
// segment uses the muted-background token, so the bars add no new literal.
// Segment fills are graphics (≥3:1 floor) and all clear it in both schemes.

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector scoped under .tpl-saas-seat-audit.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.tpl-saas-seat-audit {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.tpl-saas-seat-audit .ssa-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-saas-seat-audit .ssa-btn:disabled { cursor: default; }
.tpl-saas-seat-audit button:focus-visible,
.tpl-saas-seat-audit input:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: 2px;
}
.tpl-saas-seat-audit .ssa-num { font-variant-numeric: tabular-nums; }
.tpl-saas-seat-audit .ssa-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-header-row {
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
  box-sizing: border-box;
}
.tpl-saas-seat-audit .ssa-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: \${ACCENT};
  color: \${ACCENT_ON};
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-renewal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  border: var(--border-width) solid \${ACCENT};
  color: \${ACCENT};
  background: \${ACCENT_TINT};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ---- content column --------------------------------------------------- */
.tpl-saas-seat-audit .ssa-main {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* On the stacked (<=980px) layout the whole main column scrolls instead
   of the table alone, so the tray section is reachable. */
.tpl-saas-seat-audit .ssa-main.ssa-main-stacked { overflow-y: auto; }
.tpl-saas-seat-audit .ssa-main.ssa-main-stacked .ssa-table-scroll {
  flex: none;
  overflow-y: visible;
  min-height: auto;
}
.tpl-saas-seat-audit .ssa-band {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  align-items: stretch;
}
.tpl-saas-seat-audit .ssa-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(148px, 1fr));
  gap: 12px;
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-kpi {
  height: 88px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 0 14px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
  min-width: 0;
}
.tpl-saas-seat-audit .ssa-kpi-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-kpi-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- histogram --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-histo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
  box-sizing: border-box;
}
.tpl-saas-seat-audit .ssa-histo-scroll {
  display: flex;
  gap: 8px;
  align-items: stretch;
  overflow-x: auto;
  min-width: 0;
}
.tpl-saas-seat-audit .ssa-bucket {
  width: 96px;
  min-width: 72px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  border-radius: 8px;
  padding: 6px 6px 8px;
  border: var(--border-width) solid transparent;
}
.tpl-saas-seat-audit .ssa-bucket[aria-pressed='true'] {
  border-color: \${ACCENT};
  background: \${ACCENT_TINT};
}
@media (hover: hover) {
  .tpl-saas-seat-audit .ssa-bucket:hover { background: var(--color-background-muted); }
  .tpl-saas-seat-audit .ssa-bucket[aria-pressed='true']:hover { background: \${ACCENT_TINT}; }
}
.tpl-saas-seat-audit .ssa-bucket-plot {
  height: 112px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.tpl-saas-seat-audit .ssa-bucket-bar {
  width: 70%;
  border-radius: 4px 4px 0 0;
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
  border-bottom: none;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
/* Flagged share of the bucket — an accent block at the base of the bar so a
   bucket reads "N seats, M flagged" at a glance. */
.tpl-saas-seat-audit .ssa-bucket-flagged { width: 100%; background: \${ACCENT}; }
.tpl-saas-seat-audit .ssa-bucket-count {
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-bucket-range {
  font-size: 10.5px;
  font-weight: 600;
  text-align: center;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-bucket-flag-note {
  font-size: 10px;
  text-align: center;
  color: \${ACCENT};
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-height: 12px;
}

/* ---- filter row --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-filter-row {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-saas-seat-audit .ssa-search { width: 240px; max-width: 100%; }
.tpl-saas-seat-audit .ssa-seg {
  display: inline-flex;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-seg button {
  min-height: 28px;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-seg button[aria-pressed='true'] {
  background: \${ACCENT};
  color: \${ACCENT_ON};
}
.tpl-saas-seat-audit .ssa-bucket-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px 3px 10px;
  border-radius: 999px;
  border: var(--border-width) solid \${ACCENT};
  background: \${ACCENT_TINT};
  color: \${ACCENT};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-bucket-pill .ssa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: inherit;
}

/* ---- drift table --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-table-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.tpl-saas-seat-audit .ssa-table { width: 100%; border-collapse: collapse; }
.tpl-saas-seat-audit .ssa-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 32px;
  box-sizing: border-box;
  padding: 0 10px;
  background: var(--color-background-body);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-align: left;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-table thead th.ssa-col-right { text-align: right; }
.tpl-saas-seat-audit .ssa-table tbody td {
  height: 48px;
  box-sizing: border-box;
  padding: 4px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  vertical-align: middle;
  font-size: 12.5px;
  color: var(--color-text-primary);
}
.tpl-saas-seat-audit tbody tr.ssa-row-batched { background: \${ACCENT_TINT}; }
@media (hover: hover) {
  .tpl-saas-seat-audit .ssa-table tbody tr:hover { background: var(--color-background-muted); }
  .tpl-saas-seat-audit tbody tr.ssa-row-batched:hover { background: \${ACCENT_TINT}; }
}
.tpl-saas-seat-audit .ssa-seat-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}
.tpl-saas-seat-audit .ssa-seat-email {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}
.tpl-saas-seat-audit .ssa-tier-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-tier-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-action-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-action-reclaim { color: \${RECLAIM}; background: \${RECLAIM_TINT}; }
.tpl-saas-seat-audit .ssa-action-downgrade { color: \${DOWNGRADE}; background: \${DOWNGRADE_TINT}; }
.tpl-saas-seat-audit .ssa-drift-note {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 210px;
  display: block;
  margin-top: 2px;
}
.tpl-saas-seat-audit .ssa-cell-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-savings-val { font-weight: 700; }
.tpl-saas-seat-audit .ssa-spark {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 22px;
  width: 108px;
}
.tpl-saas-seat-audit .ssa-spark span {
  flex: 1;
  min-height: 2px;
  border-radius: 1px;
  background: var(--color-border);
}
.tpl-saas-seat-audit .ssa-spark span.ssa-spark-on { background: \${ACCENT}; }
/* Add/remove batch control — 40px hit target inside a 48px row. */
.tpl-saas-seat-audit .ssa-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  font-family: inherit;
  cursor: pointer;
}
.tpl-saas-seat-audit .ssa-add-btn[aria-pressed='true'] {
  border-color: \${ACCENT};
  background: \${ACCENT};
  color: \${ACCENT_ON};
}
.tpl-saas-seat-audit .ssa-lock-reason {
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  font-weight: 600;
  color: \${RECLAIM};
  white-space: normal;
  max-width: 210px;
}
.tpl-saas-seat-audit .ssa-empty { padding: var(--spacing-8) var(--spacing-4); text-align: center; }

/* ---- reclaim tray --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-tray {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-saas-seat-audit .ssa-tray-stacked {
  border-top: var(--border-width) solid var(--color-border);
  height: auto;
}
.tpl-saas-seat-audit .ssa-tray-header {
  flex-shrink: 0;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-saas-seat-audit .ssa-tray-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tpl-saas-seat-audit .ssa-tray-stacked .ssa-tray-scroll { overflow-y: visible; }
.tpl-saas-seat-audit .ssa-savings-counter {
  border: var(--border-width) solid \${ACCENT};
  border-radius: var(--radius-container);
  background: \${ACCENT_TINT};
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-saas-seat-audit .ssa-savings-big {
  font-size: 26px;
  font-weight: 800;
  color: \${ACCENT};
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.tpl-saas-seat-audit .ssa-savings-meter {
  height: 6px;
  border-radius: 3px;
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
  overflow: hidden;
  margin-top: 6px;
}
.tpl-saas-seat-audit .ssa-savings-meter > span {
  display: block;
  height: 100%;
  background: \${ACCENT};
}
/* Tier bars — "Today" vs "After plan"; both bars keep the 240-seat scale so
   executed reclaims read as a hatched gap at the end of the after bar. */
.tpl-saas-seat-audit .ssa-tierbar-row { display: flex; flex-direction: column; gap: 3px; }
.tpl-saas-seat-audit .ssa-tierbar-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-tierbar {
  display: flex;
  height: 16px;
  border-radius: 5px;
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
}
.tpl-saas-seat-audit .ssa-tierbar > span { display: block; height: 100%; }
.tpl-saas-seat-audit .ssa-tierseg-ent { background: \${ACCENT}; }
.tpl-saas-seat-audit .ssa-tierseg-pro { background: \${DOWNGRADE}; }
.tpl-saas-seat-audit .ssa-tierseg-viewer { background: var(--color-background-muted); }
.tpl-saas-seat-audit .ssa-tierseg-gap {
  background: repeating-linear-gradient(-45deg, transparent 0 4px, \${RECLAIM_TINT} 4px 8px);
}
.tpl-saas-seat-audit .ssa-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-legend i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  margin-right: 4px;
  border: var(--border-width) solid var(--color-border);
  vertical-align: -1px;
  font-style: normal;
}
.tpl-saas-seat-audit .ssa-tray-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-saas-seat-audit .ssa-tray-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  box-sizing: border-box;
  padding: 6px 8px 6px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
}
.tpl-saas-seat-audit .ssa-tray-item-main { min-width: 0; flex: 1; }
.tpl-saas-seat-audit .ssa-tray-item-name {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-saas-seat-audit .ssa-tray-item-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-export-entry {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-export-check {
  display: inline-flex;
  color: \${CONFIRM};
  flex-shrink: 0;
  margin-top: 1px;
}

/* ---- responsive subtraction (fires in fullscreen + the 390px embed) ---- */
@media (max-width: 640px) {
  .tpl-saas-seat-audit .ssa-band { flex-direction: column; }
  .tpl-saas-seat-audit .ssa-kpis { grid-template-columns: repeat(2, 1fr); }
  .tpl-saas-seat-audit .ssa-col-lastactive,
  .tpl-saas-seat-audit .ssa-col-activity { display: none; }
  .tpl-saas-seat-audit .ssa-seat-name,
  .tpl-saas-seat-audit .ssa-seat-email { max-width: 130px; }
}
@media (prefers-reduced-motion: no-preference) {
  .tpl-saas-seat-audit .ssa-tierbar > span { transition: width 240ms ease; }
  .tpl-saas-seat-audit .ssa-bucket,
  .tpl-saas-seat-audit .ssa-add-btn {
    transition: background-color 140ms ease, border-color 140ms ease;
  }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES — Lumenary Inc × Datawell Analytics (see @input
// for the hand-checked arithmetic).
// ---------------------------------------------------------------------------

type TierId = 'enterprise' | 'pro' | 'viewer';

const TIERS: Record<TierId, {label: string; annual: number; monthly: number; dot: string}> = {
  enterprise: {label: 'Enterprise', annual: 948, monthly: 79, dot: ACCENT},
  pro: {label: 'Pro', annual: 540, monthly: 45, dot: DOWNGRADE},
  viewer: {label: 'Viewer', annual: 144, monthly: 12, dot: 'var(--color-text-secondary)'},
};

// Licensed mix today: 64 + 132 + 44 = 240 ✓
const TIER_COUNTS_TODAY: Record<TierId, number> = {enterprise: 64, pro: 132, viewer: 44};
const TOTAL_SEATS = 240;

type BucketId = '0' | '1-5' | '6-15' | '16-30' | '31-60' | '61-90';

// 90-day active-day buckets across all 240 seats: 9+16+24+40+63+88 = 240 ✓
const BUCKETS: {id: BucketId; range: string; total: number}[] = [
  {id: '0', range: '0 days', total: 9},
  {id: '1-5', range: '1–5', total: 16},
  {id: '6-15', range: '6–15', total: 24},
  {id: '16-30', range: '16–30', total: 40},
  {id: '31-60', range: '31–60', total: 63},
  {id: '61-90', range: '61–90', total: 88},
];

type DriftAction = 'reclaim' | 'downgrade';

type Seat = {
  id: string;
  name: string;
  email: string;
  dept: string;
  tier: TierId;
  /** Only set for downgrade candidates. */
  toTier?: TierId;
  action: DriftAction;
  /** Annual $ recovered if the action executes (dual field: matches the
   * tier-table deltas — reclaim = full annual, downgrade = tier diff). */
  savings: number;
  lastActive: string;
  daysActive90: number;
  bucket: BucketId;
  /** Active days per week, 12 weeks; sums to daysActive90 (checked in @input). */
  weeks: number[];
  driftNote: string;
  /** Contract-locked seats refuse batching with this reason. */
  lockReason?: string;
};

// The 16 flagged seats. Reclaims (all 0-day) first, then downgrades.
const SEATS: Seat[] = [
  {
    id: 's01',
    name: 'Priya Natarajan',
    email: 'priya.natarajan@lumenary.com',
    dept: 'Finance',
    tier: 'enterprise',
    action: 'reclaim',
    savings: 948,
    lastActive: 'Feb 19',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'No sign-in for 141 days; owns 0 dashboards',
  },
  {
    id: 's02',
    name: 'Miguel Duarte',
    email: 'miguel.duarte@lumenary.com',
    dept: 'Sales Ops',
    tier: 'pro',
    action: 'reclaim',
    savings: 540,
    lastActive: 'Mar 02',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Team migrated to the Salesforce connector in Q1',
  },
  {
    id: 's03',
    name: 'Hannah Beck',
    email: 'hannah.beck@lumenary.com',
    dept: 'Marketing',
    tier: 'enterprise',
    action: 'reclaim',
    savings: 948,
    lastActive: 'Jan 27',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'On extended leave; seat idle since January',
  },
  {
    id: 's04',
    name: 'Aleksandrina Konstantinopolous-Whitfield',
    email: 'aleksandrina.konstantinopolous-whitfield@lumenary.com',
    dept: 'Customer Success',
    tier: 'pro',
    action: 'reclaim',
    savings: 540,
    lastActive: 'Mar 11',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Duplicate of her Datawell SSO alias seat',
  },
  {
    id: 's05',
    name: 'Tom Alvarez',
    email: 'tom.alvarez@ext.lumenary.com',
    dept: 'Engineering',
    tier: 'enterprise',
    action: 'reclaim',
    savings: 948,
    lastActive: 'Dec 12',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Contractor offboarded via HRIS Apr 1 — SSO already suspended',
  },
  {
    id: 's06',
    name: 'Jonah Kim',
    email: 'jonah.kim@lumenary.com',
    dept: 'Legal',
    tier: 'pro',
    action: 'reclaim',
    savings: 540,
    lastActive: 'Feb 06',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Requested access for one audit; never returned',
  },
  {
    id: 's07',
    name: 'Renee Okafor',
    email: 'renee.okafor@lumenary.com',
    dept: 'Support',
    tier: 'pro',
    action: 'reclaim',
    savings: 540,
    lastActive: 'Mar 22',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Moved to Tier-1 queue; uses the embedded views only',
  },
  {
    id: 's08',
    name: 'David Lindgren',
    email: 'david.lindgren@lumenary.com',
    dept: 'IT',
    tier: 'enterprise',
    action: 'reclaim',
    savings: 948,
    lastActive: 'Jan 15',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Break-glass admin seat superseded by svc-datawell-admin',
  },
  {
    id: 's09',
    name: 'svc-boardroom (shared display)',
    email: 'svc-boardroom@lumenary.com',
    dept: 'Facilities',
    tier: 'pro',
    action: 'reclaim',
    savings: 540,
    lastActive: '—',
    daysActive90: 0,
    bucket: '0',
    weeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    driftNote: 'Boardroom wallboard login; zero interactive sessions',
    lockReason: 'Locked: reserved under Datawell SOW #DW-7 through renewal',
  },
  {
    id: 's10',
    name: 'Grace Whitcombe',
    email: 'grace.whitcombe@lumenary.com',
    dept: 'Product',
    tier: 'enterprise',
    toTier: 'pro',
    action: 'downgrade',
    savings: 408,
    lastActive: 'Jul 02',
    daysActive90: 4,
    bucket: '1-5',
    weeks: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    driftNote: 'Views dashboards only — no Enterprise modeling features used',
  },
  {
    id: 's11',
    name: 'Omar Haddad',
    email: 'omar.haddad@lumenary.com',
    dept: 'Design',
    tier: 'enterprise',
    toTier: 'pro',
    action: 'downgrade',
    savings: 408,
    lastActive: 'Jun 24',
    daysActive90: 3,
    bucket: '1-5',
    weeks: [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    driftNote: 'Last touched the SQL runner in the previous contract year',
  },
  {
    id: 's12',
    name: 'Lena Vogel',
    email: 'lena.vogel@lumenary.com',
    dept: 'Finance',
    tier: 'enterprise',
    toTier: 'pro',
    action: 'downgrade',
    savings: 408,
    lastActive: 'Jul 01',
    daysActive90: 5,
    bucket: '1-5',
    weeks: [0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    driftNote: 'Month-end close checks only; Pro covers scheduled exports',
  },
  {
    id: 's13',
    name: 'Sam Torres',
    email: 'sam.torres@lumenary.com',
    dept: 'Sales',
    tier: 'pro',
    toTier: 'viewer',
    action: 'downgrade',
    savings: 396,
    lastActive: 'Jun 28',
    daysActive90: 8,
    bucket: '6-15',
    weeks: [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    driftNote: 'Opens shared pipeline dashboards; never edits',
  },
  {
    id: 's14',
    name: 'Ivy Chen',
    email: 'ivy.chen@lumenary.com',
    dept: 'Support',
    tier: 'pro',
    toTier: 'viewer',
    action: 'downgrade',
    savings: 396,
    lastActive: 'Jul 06',
    daysActive90: 11,
    bucket: '6-15',
    weeks: [1, 2, 1, 0, 1, 2, 0, 1, 1, 0, 1, 1],
    driftNote: 'Reads the CSAT board daily; Viewer covers read-only',
  },
  {
    id: 's15',
    name: 'Noel Baptiste',
    email: 'noel.baptiste@lumenary.com',
    dept: 'Ops',
    tier: 'pro',
    toTier: 'viewer',
    action: 'downgrade',
    savings: 396,
    lastActive: 'Jul 03',
    daysActive90: 9,
    bucket: '6-15',
    weeks: [0, 1, 1, 1, 0, 1, 2, 0, 1, 0, 1, 1],
    driftNote: 'Subscribed digests only — zero ad-hoc queries in 90d',
  },
  {
    id: 's16',
    name: 'Ruth Adeyemi',
    email: 'ruth.adeyemi@lumenary.com',
    dept: 'HR',
    tier: 'pro',
    toTier: 'viewer',
    action: 'downgrade',
    savings: 396,
    lastActive: 'Jul 07',
    daysActive90: 14,
    bucket: '6-15',
    weeks: [2, 1, 1, 2, 0, 1, 1, 2, 1, 1, 1, 1],
    driftNote: 'Headcount board reader; edit rights unused since March',
  },
];

const SEAT_BY_ID = new Map(SEATS.map(seat => [seat.id, seat]));

// Identified = every flagged seat's savings; addressable excludes locked
// seats. Both derived, never restated (see Color/Fixture policy).
const IDENTIFIED_TOTAL = SEATS.reduce((sum, seat) => sum + seat.savings, 0);
const ADDRESSABLE_TOTAL = SEATS.filter(seat => seat.lockReason === undefined).reduce(
  (sum, seat) => sum + seat.savings,
  0,
);

// Flagged-per-bucket, derived from the row set so the histogram's accent
// blocks can never drift from the table.
const FLAGGED_BY_BUCKET: Record<string, number> = {};
for (const seat of SEATS) {
  FLAGGED_BY_BUCKET[seat.bucket] = (FLAGGED_BY_BUCKET[seat.bucket] ?? 0) + 1;
}

const HISTO_MAX = Math.max(...BUCKETS.map(bucket => bucket.total));

function dollars(value: number): string {
  return \`$\${value.toLocaleString('en-US')}\`;
}

// ---------------------------------------------------------------------------
// BRAND MARK — four seats in a 2×2 grid; the top-right seat is hollow
// (the reclaimed one). Inline SVG, currentColor only.
// ---------------------------------------------------------------------------

function SeatsmithMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="7" height="7" rx="2" fill="currentColor" />
      <rect
        x="10.75"
        y="1.75"
        width="5.5"
        height="5.5"
        rx="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.4 1.8"
      />
      <rect x="1" y="10" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

function KpiTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="ssa-kpi">
      <span className="ssa-kpi-label">
        <Icon icon={icon} size="xsm" color="inherit" />
        {label}
      </span>
      <span className="ssa-kpi-value">{value}</span>
      <span className="ssa-kpi-sub">{sub}</span>
    </div>
  );
}

function BucketColumn({
  bucket,
  isActive,
  onToggle,
}: {
  bucket: (typeof BUCKETS)[number];
  isActive: boolean;
  onToggle: (id: BucketId) => void;
}) {
  const flagged = FLAGGED_BY_BUCKET[bucket.id] ?? 0;
  // Bars scale to the tallest bucket (88 seats) with a 10px floor so the
  // 9-seat bucket still reads as a bar, not a sliver.
  const barPct = Math.max(10, Math.round((bucket.total / HISTO_MAX) * 100));
  const flaggedPct = bucket.total > 0 ? Math.round((flagged / bucket.total) * 100) : 0;
  return (
    <button
      type="button"
      className="ssa-btn ssa-bucket"
      aria-pressed={isActive}
      onClick={() => onToggle(bucket.id)}
      aria-label={\`\${bucket.range} active days — \${bucket.total} seats, \${flagged} flagged. \${
        isActive ? 'Clear this filter.' : 'Filter the table to this band.'
      }\`}>
      <span className="ssa-bucket-plot">
        <span className="ssa-bucket-bar" style={{height: \`\${barPct}%\`}}>
          <span className="ssa-bucket-flagged" style={{height: \`\${flaggedPct}%\`}} />
        </span>
      </span>
      <span className="ssa-bucket-count">{bucket.total}</span>
      <span className="ssa-bucket-range">{bucket.range}</span>
      <span className="ssa-bucket-flag-note">{flagged > 0 ? \`\${flagged} flagged\` : '\xA0'}</span>
    </button>
  );
}

function TierChip({tier}: {tier: TierId}) {
  const meta = TIERS[tier];
  return (
    <span className="ssa-tier-chip">
      <span className="ssa-tier-dot" style={{background: meta.dot}} />
      {meta.label}
    </span>
  );
}

function ActivityStrip({seat}: {seat: Seat}) {
  // 12 weekly cells; height maps active days 0–7 onto the 22px strip.
  return (
    <span
      className="ssa-spark"
      role="img"
      aria-label={\`\${seat.daysActive90} active days in the last 90\`}>
      {seat.weeks.map((days, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key -- fixed-length literal fixture
          key={index}
          className={days > 0 ? 'ssa-spark-on' : undefined}
          style={{height: \`\${Math.max(2, Math.round((days / 7) * 22))}px\`}}
        />
      ))}
    </span>
  );
}

function ActionTag({seat}: {seat: Seat}) {
  if (seat.action === 'reclaim') {
    return (
      <span className="ssa-action-tag ssa-action-reclaim">
        <Icon icon={ArchiveIcon} size="xsm" color="inherit" />
        Reclaim
      </span>
    );
  }
  const toTier = seat.toTier !== undefined ? TIERS[seat.toTier].label : '';
  return (
    <span className="ssa-action-tag ssa-action-downgrade">
      <Icon icon={ArrowRightIcon} size="xsm" color="inherit" />
      {\`→ \${toTier}\`}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TIER BAR — one 240-seat-scaled stacked bar; the after-plan variant carries
// a hatched gap segment for executed reclaims.
// ---------------------------------------------------------------------------

function TierBar({
  label,
  counts,
  reclaimedGap,
}: {
  label: string;
  counts: Record<TierId, number>;
  reclaimedGap: number;
}) {
  const assigned = counts.enterprise + counts.pro + counts.viewer;
  return (
    <div className="ssa-tierbar-row">
      <span className="ssa-tierbar-label">
        <span>{label}</span>
        <span>{assigned} seats</span>
      </span>
      <div
        className="ssa-tierbar"
        role="img"
        aria-label={\`\${label}: \${counts.enterprise} Enterprise, \${counts.pro} Pro, \${counts.viewer} Viewer\${
          reclaimedGap > 0 ? \`, \${reclaimedGap} reclaimed\` : ''
        }\`}>
        <span
          className="ssa-tierseg-ent"
          style={{width: \`\${(counts.enterprise / TOTAL_SEATS) * 100}%\`}}
        />
        <span className="ssa-tierseg-pro" style={{width: \`\${(counts.pro / TOTAL_SEATS) * 100}%\`}} />
        <span
          className="ssa-tierseg-viewer"
          style={{width: \`\${(counts.viewer / TOTAL_SEATS) * 100}%\`}}
        />
        {reclaimedGap > 0 && (
          <span className="ssa-tierseg-gap" style={{width: \`\${(reclaimedGap / TOTAL_SEATS) * 100}%\`}} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECLAIM TRAY — savings counter, tier bars, grouped batch, export log.
// Purely presentational: all state lives in the page component.
// ---------------------------------------------------------------------------

function ReclaimTray({
  isStacked,
  batchedSeats,
  batchedTotal,
  afterCounts,
  reclaimedGap,
  exportLog,
  onRemove,
  onClear,
  onExport,
}: {
  isStacked: boolean;
  batchedSeats: Seat[];
  batchedTotal: number;
  afterCounts: Record<TierId, number>;
  reclaimedGap: number;
  exportLog: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
}) {
  const reclaims = batchedSeats.filter(seat => seat.action === 'reclaim');
  const downgrades = batchedSeats.filter(seat => seat.action === 'downgrade');
  const meterPct =
    ADDRESSABLE_TOTAL > 0 ? Math.round((batchedTotal / ADDRESSABLE_TOTAL) * 100) : 0;

  return (
    <div className={\`ssa-tray\${isStacked ? ' ssa-tray-stacked' : ''}\`}>
      <div className="ssa-tray-header">
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={2}>Reclaim plan</Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {batchedSeats.length} of {SEATS.length} flagged seats batched
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Clear"
            variant="ghost"
            size="sm"
            isDisabled={batchedSeats.length === 0}
            onClick={onClear}
          />
        </HStack>
      </div>
      <div className="ssa-tray-scroll">
        <div className="ssa-savings-counter">
          <Text type="supporting" color="secondary">
            Projected renewal savings
          </Text>
          <span className="ssa-savings-big">{dollars(batchedTotal)}/yr</span>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            of {dollars(ADDRESSABLE_TOTAL)} addressable · {dollars(IDENTIFIED_TOTAL)} identified
          </Text>
          <div className="ssa-savings-meter" aria-hidden="true">
            <span style={{width: \`\${meterPct}%\`}} />
          </div>
        </div>

        <VStack gap={2}>
          <TierBar label="Today" counts={TIER_COUNTS_TODAY} reclaimedGap={0} />
          <TierBar label="After plan" counts={afterCounts} reclaimedGap={reclaimedGap} />
          <div className="ssa-legend">
            <span>
              <i style={{background: ACCENT}} /> Enterprise {dollars(TIERS.enterprise.annual)}/yr
            </span>
            <span>
              <i style={{background: DOWNGRADE}} /> Pro {dollars(TIERS.pro.annual)}/yr
            </span>
            <span>
              <i style={{background: 'var(--color-background-muted)'}} /> Viewer{' '}
              {dollars(TIERS.viewer.annual)}/yr
            </span>
            <span>
              <i
                style={{
                  background: \`repeating-linear-gradient(-45deg, transparent 0 3px, \${RECLAIM_TINT} 3px 6px)\`,
                }}
              />{' '}
              Reclaimed
            </span>
          </div>
        </VStack>

        <Divider />

        {batchedSeats.length === 0 ? (
          <Text type="supporting" color="secondary">
            No seats batched yet. Use “Batch” on a flagged row — savings and the after-plan bar
            update as you build.
          </Text>
        ) : (
          <VStack gap={3}>
            {reclaims.length > 0 && (
              <VStack gap={1}>
                <span className="ssa-tray-group-title">
                  <Icon icon={ArchiveIcon} size="xsm" color="inherit" />
                  Reclaim · {reclaims.length}
                </span>
                {reclaims.map(seat => (
                  <TrayItem key={seat.id} seat={seat} onRemove={onRemove} />
                ))}
              </VStack>
            )}
            {downgrades.length > 0 && (
              <VStack gap={1}>
                <span className="ssa-tray-group-title">
                  <Icon icon={TrendingDownIcon} size="xsm" color="inherit" />
                  Downgrade · {downgrades.length}
                </span>
                {downgrades.map(seat => (
                  <TrayItem key={seat.id} seat={seat} onRemove={onRemove} />
                ))}
              </VStack>
            )}
          </VStack>
        )}

        <Button
          label={\`Export reclaim plan (\${batchedSeats.length})\`}
          variant="primary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
          isDisabled={batchedSeats.length === 0}
          onClick={onExport}
        />

        {exportLog.length > 0 && (
          <VStack gap={1}>
            <span className="ssa-tray-group-title">Export log</span>
            {exportLog.map(entry => (
              <span key={entry} className="ssa-export-entry">
                <span className="ssa-export-check">
                  <Icon icon={CheckIcon} size="xsm" color="inherit" />
                </span>
                {entry}
              </span>
            ))}
          </VStack>
        )}
      </div>
    </div>
  );
}

function TrayItem({seat, onRemove}: {seat: Seat; onRemove: (id: string) => void}) {
  const detail =
    seat.action === 'reclaim'
      ? \`\${TIERS[seat.tier].label} · \${dollars(seat.savings)}/yr back\`
      : \`\${TIERS[seat.tier].label} → \${seat.toTier !== undefined ? TIERS[seat.toTier].label : ''} · \${dollars(seat.savings)}/yr back\`;
  return (
    <div className="ssa-tray-item">
      <div className="ssa-tray-item-main">
        <div className="ssa-tray-item-name">{seat.name}</div>
        <div className="ssa-tray-item-sub">{detail}</div>
      </div>
      <IconButton
        label={\`Remove \${seat.name} from the batch\`}
        tooltip="Remove from batch"
        variant="ghost"
        size="sm"
        icon={<Icon icon={MinusIcon} size="sm" />}
        onClick={() => onRemove(seat.id)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type ActionFilter = 'all' | 'reclaim' | 'downgrade';

export default function SaasSeatAuditTemplate() {
  // Layout owns the end slot, so the tray's move below the table is a JS
  // media query, not CSS (fires in fullscreen and the 390px embed only).
  const isStacked = useMediaQuery('(max-width: 980px)');

  // ---- the single state owner: the batch set + filters -------------------
  const [batchedIds, setBatchedIds] = useState<ReadonlySet<string>>(
    // Pre-seeded draft: s03 + s07 + s11 = 948 + 540 + 408 = $1,896/yr.
    () => new Set(['s03', 's07', 's11']),
  );
  const [bucketFilter, setBucketFilter] = useState<BucketId | null>(null);
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [query, setQuery] = useState('');
  const [refusedSeatId, setRefusedSeatId] = useState<string | null>(null);
  const [exportLog, setExportLog] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  // ---- derived: everything the batch can move ----------------------------
  const batchedSeats = useMemo(
    () => SEATS.filter(seat => batchedIds.has(seat.id)),
    [batchedIds],
  );
  const batchedTotal = batchedSeats.reduce((sum, seat) => sum + seat.savings, 0);

  const {afterCounts, reclaimedGap} = useMemo(() => {
    const counts: Record<TierId, number> = {...TIER_COUNTS_TODAY};
    let gap = 0;
    for (const seat of batchedSeats) {
      if (seat.action === 'reclaim') {
        counts[seat.tier] -= 1;
        gap += 1;
      } else if (seat.toTier !== undefined) {
        counts[seat.tier] -= 1;
        counts[seat.toTier] += 1;
      }
    }
    return {afterCounts: counts, reclaimedGap: gap};
  }, [batchedSeats]);

  const visibleSeats = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SEATS.filter(seat => {
      if (bucketFilter !== null && seat.bucket !== bucketFilter) {
        return false;
      }
      if (actionFilter !== 'all' && seat.action !== actionFilter) {
        return false;
      }
      if (
        needle.length > 0 &&
        !seat.name.toLowerCase().includes(needle) &&
        !seat.email.toLowerCase().includes(needle) &&
        !seat.dept.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [bucketFilter, actionFilter, query]);

  const activeBucket = bucketFilter !== null ? BUCKETS.find(b => b.id === bucketFilter) : undefined;
  // Empty-but-healthy: a bucket with seats and zero flagged rows.
  const healthyBucketCount =
    activeBucket !== undefined ? activeBucket.total - (FLAGGED_BY_BUCKET[activeBucket.id] ?? 0) : 0;

  // ---- handlers -----------------------------------------------------------
  const handleToggleBatch = (seatId: string) => {
    const seat = SEAT_BY_ID.get(seatId);
    if (seat === undefined) {
      return;
    }
    if (seat.lockReason !== undefined) {
      setRefusedSeatId(seatId);
      setAnnouncement(\`\${seat.name} cannot be batched. \${seat.lockReason}.\`);
      return;
    }
    setRefusedSeatId(null);
    setBatchedIds(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
        setAnnouncement(
          \`\${seat.name} removed from the batch. Projected savings \${dollars(
            batchedTotal - seat.savings,
          )} per year.\`,
        );
      } else {
        next.add(seatId);
        setAnnouncement(
          \`\${seat.name} added to the batch. Projected savings \${dollars(
            batchedTotal + seat.savings,
          )} per year.\`,
        );
      }
      return next;
    });
  };

  const handleToggleBucket = (id: BucketId) => {
    setBucketFilter(prev => (prev === id ? null : id));
  };

  const handleExport = () => {
    const reclaimCount = batchedSeats.filter(seat => seat.action === 'reclaim').length;
    const downgradeCount = batchedSeats.length - reclaimCount;
    const entry = \`Draft v\${exportLog.length + 1} — \${reclaimCount} reclaims · \${downgradeCount} downgrades · \${dollars(
      batchedTotal,
    )}/yr\`;
    setExportLog(prev => [entry, ...prev]);
    setAnnouncement(\`Reclaim plan exported. \${entry}.\`);
  };

  // ---- header --------------------------------------------------------------
  const header = (
    <LayoutHeader>
      <div className="ssa-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
        <span className="ssa-brand-mark">
          <SeatsmithMark />
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Heading level={1}>Seatsmith</Heading>
              <Badge label="Datawell Analytics" variant="neutral" />
              <Badge label="Contract #DW-2024-118" variant="neutral" />
            </HStack>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Lumenary Inc workspace · 240 assigned seats · audit refreshed Jul 10, 06:00
            </Text>
          </VStack>
        </StackItem>
          <span className="ssa-renewal-badge">
            <Icon icon={CalendarClockIcon} size="xsm" color="inherit" />
            Renews Sep 30 · 82 days
          </span>
        </HStack>
      </div>
    </LayoutHeader>
  );

  // ---- analytics band --------------------------------------------------------
  const analyticsBand = (
    <div className="ssa-band">
      <div className="ssa-kpis">
        <KpiTile
          icon={UsersIcon}
          label="Licensed seats"
          value="240"
          sub="64 Ent · 132 Pro · 44 Viewer"
        />
        <KpiTile icon={CheckIcon} label="Active last 30d" value="187" sub="78% of assigned seats" />
        <KpiTile
          icon={ArchiveIcon}
          label="Flagged seats"
          value={String(SEATS.length)}
          sub={\`\${dollars(IDENTIFIED_TOTAL)}/yr identified\`}
        />
        <KpiTile
          icon={TrendingDownIcon}
          label="Batched savings"
          value={\`\${dollars(batchedTotal)}/yr\`}
          sub={\`\${batchedSeats.length} seats in the plan\`}
        />
      </div>
      <div className="ssa-histo">
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label">Seat utilization — active days, last 90</Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            240 seats · click a band to filter
          </Text>
        </HStack>
        <div className="ssa-histo-scroll">
          {BUCKETS.map(bucket => (
            <BucketColumn
              key={bucket.id}
              bucket={bucket}
              isActive={bucketFilter === bucket.id}
              onToggle={handleToggleBucket}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ---- filter row ---------------------------------------------------------------
  const filterRow = (
    <div className="ssa-filter-row">
      <div className="ssa-search">
        <TextInput
          label="Search flagged seats"
          isLabelHidden
          size="sm"
          width="100%"
          placeholder="Search name, email, or team…"
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={setQuery}
        />
      </div>
      <div className="ssa-seg" role="group" aria-label="Filter by recommended action">
        {(
          [
            {id: 'all', label: \`All · \${SEATS.length}\`},
            {id: 'reclaim', label: \`Reclaim · \${SEATS.filter(s => s.action === 'reclaim').length}\`},
            {
              id: 'downgrade',
              label: \`Downgrade · \${SEATS.filter(s => s.action === 'downgrade').length}\`,
            },
          ] as {id: ActionFilter; label: string}[]
        ).map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={actionFilter === option.id}
            onClick={() => setActionFilter(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
      {activeBucket !== undefined && (
        <span className="ssa-bucket-pill">
          {activeBucket.range} active days · {activeBucket.total} seats
          <button
            type="button"
            className="ssa-btn"
            aria-label={\`Clear the \${activeBucket.range} activity filter\`}
            onClick={() => setBucketFilter(null)}>
            <Icon icon={XIcon} size="xsm" color="inherit" />
          </button>
        </span>
      )}
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {visibleSeats.length} of {SEATS.length} flagged shown
      </Text>
    </div>
  );

  // ---- drift table -----------------------------------------------------------------
  const table = (
    <div className="ssa-table-scroll">
      {visibleSeats.length === 0 ? (
        <div className="ssa-empty">
          <VStack gap={1}>
            <Text type="label">
              {activeBucket !== undefined && healthyBucketCount > 0 && query.trim().length === 0
                ? \`No drift in the \${activeBucket.range} band\`
                : 'No flagged seats match'}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {activeBucket !== undefined && healthyBucketCount > 0 && query.trim().length === 0
                ? \`\${healthyBucketCount} seats in this band are sized correctly — nothing to reclaim.\`
                : 'Adjust the search or clear the filters to see the full flagged set.'}
            </Text>
          </VStack>
        </div>
      ) : (
        <table className="ssa-table">
          <caption className="ssa-visually-hidden">
            Entitlement drift — flagged seats with recommended reclaim or downgrade actions
          </caption>
          <thead>
            <tr>
              <th scope="col">Seat</th>
              <th scope="col">Tier</th>
              <th scope="col" className="ssa-col-lastactive">
                Last active
              </th>
              <th scope="col" className="ssa-col-activity">
                12-week activity
              </th>
              <th scope="col">Recommendation</th>
              <th scope="col" className="ssa-col-right">
                $/yr back
              </th>
              <th scope="col" className="ssa-col-right">
                Batch
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleSeats.map(seat => {
              const isBatched = batchedIds.has(seat.id);
              const isLocked = seat.lockReason !== undefined;
              return (
                <tr key={seat.id} className={isBatched ? 'ssa-row-batched' : undefined}>
                  <td>
                    <div className="ssa-seat-name">{seat.name}</div>
                    <div className="ssa-seat-email">{seat.email}</div>
                  </td>
                  <td>
                    <TierChip tier={seat.tier} />
                  </td>
                  <td className="ssa-col-lastactive">
                    <span className="ssa-num">{seat.lastActive}</span>
                    <span className="ssa-drift-note">{seat.dept}</span>
                  </td>
                  <td className="ssa-col-activity">
                    <ActivityStrip seat={seat} />
                  </td>
                  <td>
                    <ActionTag seat={seat} />
                    <span className="ssa-drift-note" title={seat.driftNote}>
                      {seat.driftNote}
                    </span>
                  </td>
                  <td className="ssa-cell-num">
                    <span className="ssa-savings-val">{dollars(seat.savings)}</span>
                  </td>
                  <td className="ssa-cell-num">
                    {isLocked ? (
                      <>
                        <Tooltip content={seat.lockReason ?? ''}>
                          <button
                            type="button"
                            className="ssa-add-btn"
                            aria-pressed={false}
                            aria-label={\`\${seat.name} is contract-locked and cannot be batched\`}
                            onClick={() => handleToggleBatch(seat.id)}>
                            <Icon icon={LockIcon} size="xsm" color="inherit" />
                            Locked
                          </button>
                        </Tooltip>
                        {refusedSeatId === seat.id && (
                          <span className="ssa-lock-reason" role="status">
                            {seat.lockReason}
                          </span>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="ssa-add-btn"
                        aria-pressed={isBatched}
                        aria-label={
                          isBatched
                            ? \`Remove \${seat.name} from the reclaim batch\`
                            : \`Add \${seat.name} to the reclaim batch — \${dollars(seat.savings)} per year back\`
                        }
                        onClick={() => handleToggleBatch(seat.id)}>
                        <Icon icon={isBatched ? CheckIcon : PlusIcon} size="xsm" color="inherit" />
                        {isBatched ? 'Batched' : 'Batch'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  const tray = (
    <ReclaimTray
      isStacked={isStacked}
      batchedSeats={batchedSeats}
      batchedTotal={batchedTotal}
      afterCounts={afterCounts}
      reclaimedGap={reclaimedGap}
      exportLog={exportLog}
      onRemove={handleToggleBatch}
      onClear={() => {
        setBatchedIds(new Set());
        setAnnouncement('Batch cleared. Projected savings $0 per year.');
      }}
      onExport={handleExport}
    />
  );

  // ---- frame -----------------------------------------------------------------------
  return (
    <div className="tpl-saas-seat-audit">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className={\`ssa-main\${isStacked ? ' ssa-main-stacked' : ''}\`}>
              <div aria-live="polite" className="ssa-visually-hidden">
                {announcement}
              </div>
              {analyticsBand}
              {filterRow}
              {table}
              {isStacked && tray}
            </div>
          </LayoutContent>
        }
        end={
          isStacked ? undefined : (
            <LayoutPanel width={336} padding={0} hasDivider label="Reclaim plan tray">
              {tray}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};