// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Covena covenant-monitoring surface
 *   for the Harlan Fabrication Holdings, LLC credit agreement (TLB $85.0M +
 *   RCF $20.0M = $105.0M commitments, agented by Stonebriar Bank, N.A.).
 *   Suite "today" anchor: Wed 8 Jul 2026; test date Q2-2026 (30 Jun 2026);
 *   compliance certificate due 14 Aug 2026. No clock reads, no randomness,
 *   no timers, no network assets.
 *
 *   Base TTM inputs (30 Jun 2026 test date) — every dial value on the page
 *   is COMPUTED from these eight numbers at render, never typed twice:
 *   EBITDA $38.4M; TLB outstanding $82.9M + revolver drawn $6.0M = senior
 *   secured debt $88.9M; + sub notes $62.3M = total debt $151.2M; cash
 *   $11.5M -> net debt $139.7M; cash interest $13.1M; scheduled amort
 *   $4.3M; TTM capex $9.8M; cash taxes $3.2M; revolver availability
 *   $20.0M − $6.0M drawn − $1.2M LCs = $12.8M.
 *   Cross-checks: net leverage 139.7/38.4 = 3.64x vs <=4.00x; interest
 *   coverage 38.4/13.1 = 2.93x vs >=2.50x; FCCR (38.4−9.8−3.2)/(13.1+4.3)
 *   = 25.4/17.4 = 1.46x vs >=1.20x; senior secured net (88.9−11.5)/38.4 =
 *   2.02x vs <=3.00x; capex 9.8 vs <=12.0; liquidity 11.5+12.8 = 24.3 vs
 *   >=10.0. Waiver fee: 12.5 bps x $105.0M commitments = $131,250 per
 *   covenant in the package.
 * @output Loan Covenant Monitor — a credit analyst's covenant gauge wall:
 *   six per-covenant ratio dials (arc gauge with threshold tick, actual
 *   needle, hollow forecast marker) over eight-quarter sparkbars that carry
 *   their own per-quarter step-down limits (the Q1-25 leverage breach that
 *   was waived under W-2025-04 renders as a red bar). The signature
 *   interaction is the forecast bench: dragging the EBITDA Δ% and
 *   incremental-debt sliders re-derives every forecast-sensitive covenant
 *   in the same render — dial markers slide, status chips flip to
 *   projected-breach, the header breach counter re-counts, and the waiver
 *   desk drawer re-ranks covenants by forecast headroom and re-prices the
 *   waiver package (12.5 bps x $105.0M per covenant). Two covenants (capex
 *   cap, minimum liquidity) are deliberately forecast-insensitive and say
 *   so. Sending the package to counsel locks it; reopening unlocks it.
 * @position Page template; emitted by `astryx template loan-covenant-monitor`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 48px (Covena mark + borrower/facility line | certificate-due
 *   chip + projected-breach counter chip + waiver-desk toggle (narrow band
 *   only) + analyst avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | main column (forecast bench min 88px > gauge wall scroller >
 *       legend strip 32px)
 *     | waiver desk drawer 340px (>=1180) / 300px (980–1180), own scroll,
 *       footer action bar 48px pinned.
 * Container policy: work-surface archetype — the gauge wall is a grid of
 *   framed covenant PANELS (section elements with 40px header rows), not
 *   marketing cards; the drawer is rows and a footer bar. No Card imports.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   BRAND = light-dark(#BE123C, #FB7185) — rose. Contrast math: #BE123C on
 *   white = 6.3:1 (passes 4.5:1 as text); #FB7185 on #1E1E1E = 6.2:1. Used
 *   for the Covena mark, the forecast markers (dials + legend swatch), the
 *   in-package tags/icons, and the active scenario-chip border — fills and
 *   >=4.5:1 text only. State colors are light-dark
 *   pairs with math beside each literal; every state color pairs with a
 *   shape channel (needle vs hollow marker vs tick vs hatched bar), never
 *   color alone.
 *
 * FIXED DENSITY GRID (verbatim, repeated in the CSS): header bar 48px;
 * forecast bench min 88px; covenant panel header row 40px; dial box
 * 168x100; sparkbar strip 56px (36px bars + 16px axis labels); panel
 * footer rows 32px; drawer 340px wide-band / 300px demo-band; drawer rank
 * rows 48px; drawer footer 48px; legend strip 32px; single gutter token
 * GUTTER = 12 (all padding/margins are GUTTER or GUTTER/2 = 6); mono
 * metadata 12px; body 13px; section labels 11px uppercase tracking 0.06em.
 *
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 * ResizeObserver (the demo stage is ~1045–1075px inside a 1440px window;
 * viewport media queries never fire there — a viewport query covers only
 * the first pre-observer frame):
 * - W >= 1180: drawer 340px in-flow; wall auto-fills minmax(300px,1fr)
 *   columns (3-up).
 * - 980 <= W < 1180 (canonical demo band): drawer 300px in-flow; wall
 *   auto-fills 2-up at ~1045px (1045 − 300 − gutters = ~720px -> 2 x
 *   ~354px columns). Nothing squeezes: the dial box and sparkbar strip
 *   keep their fixed sizes and the panel grid subtracts columns.
 * - W < 980: the drawer leaves the flex flow and becomes a 320px absolute
 *   overlay (right 0, shadow) opened from the header "Waiver desk" button
 *   (badge shows package count); Escape closes it and focus returns to the
 *   toggle button. The wall keeps auto-filling (1-up under ~640px).
 * - 390px embed iframe: media queries DO fire there — the bench stacks its
 *   sliders vertically and the header drops the borrower line (see the
 *   max-width: 640px block in TEMPLATE_CSS). Subtraction, not squeeze.
 * Corner map: top-left Covena mark + borrower/facility line; top-right
 * certificate-due chip + projected-breach counter + analyst avatar;
 * bottom-left legend strip (dial encoding key); bottom-right drawer footer
 * (package fee total + send-to-counsel action).
 * Fixture policy: fixed strings and literal arrays only. All six dial
 * values derive live from the eight base inputs via per-covenant compute
 * functions, so the header counter, dial needles, drawer ranking, and
 * status chips can never disagree. Sparkbar history is a literal
 * eight-quarter array per covenant whose final entry equals the computed
 * baseline (arithmetic in @input above).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileCheck2Icon,
  FileClockIcon,
  GaugeIcon,
  PlusIcon,
  RotateCcwIcon,
  ScaleIcon,
  SendIcon,
  ShieldAlertIcon,
  XIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Slider} from '@astryxdesign/core/Slider';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// with contrast math. Data-viz categorical tokens are not injected by the
// demo, so state colors carry repo-standard fallback pairs.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (rose). #BE123C on white = 6.3:1;
// #FB7185 on #1E1E1E = 6.2:1 — both clear 4.5:1, so brand may be used as
// text at 12px+ as well as fills. Usages: Covena mark, forecast-marker
// stroke, in-package tag, scenario-chip active border.
const BRAND = 'light-dark(#BE123C, #FB7185)';
const BRAND_SOFT = 'light-dark(rgba(190, 18, 60, 0.08), rgba(251, 113, 133, 0.14))';

// Compliant: #0B991F on white = 4.6:1; #34C759 on #1E1E1E = 8.1:1.
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Watch (inside 10% of the limit): #B45309 on white = 4.6:1; #FBBF24 on
// #1E1E1E = 9.9:1.
const WARN = 'var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Breach: #DC2626 on white = 4.5:1; #F87171 on #1E1E1E = 6.6:1.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.15))';

// Single gutter token — all padding/margins on this page are GUTTER or
// GUTTER/2 = 6 (density-grid law).
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// SCOPED CSS — every selector is prefixed with the tpl-loan-covenant-monitor
// scope class. Transitions animate color/opacity/transform only and collapse
// under prefers-reduced-motion. The <=640px block is the 390px-embed
// contract (viewport queries DO fire inside the embed iframe).
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.tpl-loan-covenant-monitor {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-loan-covenant-monitor .lcm-header-bar {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 48px;
  padding: 0 ${GUTTER}px;
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-borrower-line {
  display: flex;
  align-items: baseline;
  gap: ${GUTTER / 2}px;
  min-width: 0;
  overflow: hidden;
}
.tpl-loan-covenant-monitor .lcm-mono {
  font-family: ${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 12px;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.tpl-loan-covenant-monitor .lcm-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.tpl-loan-covenant-monitor .lcm-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
/* Forecast bench — min 88px, wraps rather than squeezing the sliders. */
.tpl-loan-covenant-monitor .lcm-bench {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: ${GUTTER}px ${GUTTER * 2}px;
  min-height: 88px;
  padding: ${GUTTER / 2}px ${GUTTER}px ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.tpl-loan-covenant-monitor .lcm-bench-readout {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 148px;
}
.tpl-loan-covenant-monitor .lcm-scenario-row {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  flex-wrap: wrap;
}
.tpl-loan-covenant-monitor .lcm-scenario-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.tpl-loan-covenant-monitor .lcm-scenario-btn[aria-pressed='true'] {
  border-color: ${BRAND};
  background: ${BRAND_SOFT};
  color: var(--color-text-primary);
  font-weight: 600;
}
/* Gauge wall — width-driven auto-fill grid; columns subtract, panels never
   squeeze (dial box and sparkbar strip are fixed-size). */
.tpl-loan-covenant-monitor .lcm-wall-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${GUTTER}px;
}
.tpl-loan-covenant-monitor .lcm-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${GUTTER}px;
}
.tpl-loan-covenant-monitor .lcm-panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-panel-head {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  height: 40px;
  padding: 0 ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-panel-name {
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-panel-body {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  padding: ${GUTTER}px;
  flex-wrap: wrap;
}
.tpl-loan-covenant-monitor .lcm-panel-foot {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 ${GUTTER}px ${GUTTER / 2}px;
  margin-top: auto;
}
.tpl-loan-covenant-monitor .lcm-foot-row {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  min-height: 32px;
}
.tpl-loan-covenant-monitor .lcm-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-def-toggle {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.tpl-loan-covenant-monitor .lcm-def-body {
  padding: 0 0 ${GUTTER / 2}px;
}
/* Sparkbars — 36px bars + 16px axis = 56px strip. */
.tpl-loan-covenant-monitor .lcm-sparks {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 36px;
}
.tpl-loan-covenant-monitor .lcm-spark-axis {
  display: flex;
  gap: 4px;
  height: 16px;
  align-items: center;
}
/* Waiver desk drawer. */
.tpl-loan-covenant-monitor .lcm-drawer {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.tpl-loan-covenant-monitor .lcm-drawer-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.tpl-loan-covenant-monitor .lcm-drawer-head {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  height: 40px;
  padding: 0 ${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.tpl-loan-covenant-monitor .lcm-drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${GUTTER}px;
}
.tpl-loan-covenant-monitor .lcm-rank-row {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  min-height: 48px;
  padding: 0 ${GUTTER / 2}px;
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-rank-num {
  width: 18px;
  flex-shrink: 0;
  font-family: ${MONO};
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-loan-covenant-monitor .lcm-pkg-row {
  display: flex;
  align-items: center;
  gap: ${GUTTER / 2}px;
  min-height: 40px;
}
.tpl-loan-covenant-monitor .lcm-drawer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${GUTTER / 2}px;
  height: 48px;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
/* Legend strip — bottom-left corner owner, 32px. */
.tpl-loan-covenant-monitor .lcm-legend {
  display: flex;
  align-items: center;
  gap: ${GUTTER}px;
  height: 32px;
  padding: 0 ${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}
.tpl-loan-covenant-monitor .lcm-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
/* Shared interactive plumbing. */
.tpl-loan-covenant-monitor button:focus-visible,
.tpl-loan-covenant-monitor .lcm-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.tpl-loan-covenant-monitor .lcm-fade {
  transition: color 160ms ease, background-color 160ms ease,
    border-color 160ms ease, opacity 160ms ease;
}
.tpl-loan-covenant-monitor .lcm-marker-move {
  transition: transform 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-loan-covenant-monitor .lcm-fade,
  .tpl-loan-covenant-monitor .lcm-marker-move {
    transition: none;
  }
}
.tpl-loan-covenant-monitor .lcm-vh {
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
/* 390px embed / full-screen phone: bench stacks, borrower line drops.
   These queries are real in the embed iframe; the inline demo band is
   handled by the container-width bands instead. */
@media (max-width: 640px) {
  .tpl-loan-covenant-monitor .lcm-borrower-line {
    display: none;
  }
  .tpl-loan-covenant-monitor .lcm-bench {
    align-items: stretch;
    flex-direction: column;
  }
  .tpl-loan-covenant-monitor .lcm-bench-readout {
    min-width: 0;
  }
  .tpl-loan-covenant-monitor .lcm-legend {
    gap: ${GUTTER / 2}px;
  }
}
`;

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Covena monitoring the Harlan Fabrication
// credit. All arithmetic is documented in the @input header comment; the
// compute functions below are the single source of every dial value.
// ---------------------------------------------------------------------------

const BORROWER = 'Harlan Fabrication Holdings, LLC';
const FACILITY_LINE = 'TLB $85.0M + RCF $20.0M · Agent Stonebriar Bank, N.A.';
const TEST_PERIOD = 'Q2-2026';
const CERT_DUE = 'Certificate due 14 Aug 2026';
const ANALYST = {name: 'Maya Lindqvist', initials: 'ML'};
const COMMITMENTS_MM = 105.0;
const WAIVER_FEE_BPS = 12.5;
// 12.5 bps x $105.0M = $131,250 per covenant in the package.
const FEE_PER_COVENANT = (WAIVER_FEE_BPS / 10000) * COMMITMENTS_MM * 1_000_000;

/** Base TTM financial inputs — the eight numbers everything derives from. */
interface FinInputs {
  ebitda: number; // $M TTM
  totalDebt: number; // $M
  seniorDebt: number; // $M (TLB + revolver drawn)
  cash: number; // $M
  cashInterest: number; // $M TTM
  schedAmort: number; // $M TTM
  capex: number; // $M TTM
  cashTaxes: number; // $M TTM
  revolverAvail: number; // $M ($20.0 − $6.0 drawn − $1.2 LCs)
}

const BASE_INPUTS: FinInputs = {
  ebitda: 38.4,
  totalDebt: 151.2,
  seniorDebt: 88.9,
  cash: 11.5,
  cashInterest: 13.1,
  schedAmort: 4.3,
  capex: 9.8,
  cashTaxes: 3.2,
  revolverAvail: 12.8,
};

// Incremental debt is priced at SOFR+450 ~= 9.25% all-in — the forecast
// bench applies that rate to the debt delta when re-deriving cash interest.
const INCREMENTAL_RATE = 0.0925;

/**
 * Applies the two forecast-bench sliders to the base inputs. Add-on
 * proceeds fund the Ridgeway acquisition day-one (no cash retained), and
 * paydowns are funded from escrowed asset-sale proceeds (not from balance
 * sheet cash) — so the cash and revolver-availability inputs are
 * deliberately slider-invariant, which is why the capex cap and minimum
 * liquidity covenants are tagged "not forecast-sensitive".
 */
function applyForecast(base: FinInputs, ebitdaPct: number, debtDelta: number): FinInputs {
  return {
    ...base,
    ebitda: base.ebitda * (1 + ebitdaPct / 100),
    totalDebt: base.totalDebt + debtDelta,
    seniorDebt: base.seniorDebt + debtDelta,
    cashInterest: base.cashInterest + INCREMENTAL_RATE * debtDelta,
  };
}

type CovenantKind = 'max' | 'min';
type CovenantStatus = 'compliant' | 'watch' | 'breach';

interface QuarterPoint {
  q: string; // 'Q3-24'
  value: number;
  limit: number; // that quarter's tested limit (step-downs live here)
  waivedRef?: string; // present only when the quarter breached and was waived
}

interface Covenant {
  id: string;
  clause: string; // '§7.11(a)'
  name: string;
  shortName: string; // drawer rank rows
  kind: CovenantKind;
  unit: 'x' | '$M';
  limit: number; // Q2-26 tested limit
  domainMin: number; // dial scale
  domainMax: number;
  forecastSensitive: boolean;
  compute: (inputs: FinInputs) => number;
  definition: string;
  history: QuarterPoint[]; // 8 quarters; last entry equals computed baseline
}

// Identity consts — covenants are referenced by identity everywhere.
const C_LEV = 'C-LEV';
const C_INT = 'C-INT';
const C_FCC = 'C-FCC';
const C_SSL = 'C-SSL';
const C_CAP = 'C-CAP';
const C_LIQ = 'C-LIQ';

// The eight test quarters, oldest first.
const QUARTERS = ['Q3-24', 'Q4-24', 'Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26'];

function quarterPoints(values: number[], limits: number[], waived?: Record<number, string>): QuarterPoint[] {
  return QUARTERS.map((q, i) => ({
    q,
    value: values[i],
    limit: limits[i],
    waivedRef: waived?.[i],
  }));
}

const FLAT = (limit: number) => QUARTERS.map(() => limit);

// The covenant book. C-FCC's 66-char name is the panel-title truncation
// stress fixture; the Q1-25 leverage point (4.31x vs 4.25x, waived under
// W-2025-04) is the historical-breach sparkbar fixture.
const COVENANTS: Covenant[] = [
  {
    id: C_LEV,
    clause: '§7.11(a)',
    name: 'Maximum Total Net Leverage Ratio',
    shortName: 'Total net leverage',
    kind: 'max',
    unit: 'x',
    limit: 4.0,
    domainMin: 2.5,
    domainMax: 5.5,
    forecastSensitive: true,
    compute: i => (i.totalDebt - i.cash) / i.ebitda,
    definition:
      'Consolidated Total Net Debt to Consolidated EBITDA for the four-quarter period then ended. Stepped down 4.25x -> 4.00x at the 31 Mar 2026 test. Netting is capped at $25.0M of unrestricted cash. Equity-cure rights: up to two cures in any four-quarter period, no consecutive quarters (§8.04). Q1-25 breach (4.31x vs 4.25x) was waived under W-2025-04.',
    history: quarterPoints(
      [4.42, 4.36, 4.31, 4.12, 3.98, 3.83, 3.72, 3.64],
      [4.5, 4.5, 4.25, 4.25, 4.25, 4.25, 4.0, 4.0],
      {2: 'W-2025-04'},
    ),
  },
  {
    id: C_INT,
    clause: '§7.11(b)',
    name: 'Minimum Interest Coverage Ratio',
    shortName: 'Interest coverage',
    kind: 'min',
    unit: 'x',
    limit: 2.5,
    domainMin: 1.5,
    domainMax: 4.0,
    forecastSensitive: true,
    compute: i => i.ebitda / i.cashInterest,
    definition:
      'Consolidated EBITDA to Consolidated Cash Interest Expense for the four-quarter period then ended. Cash interest excludes PIK on the Harlan sub notes but includes commitment fees on the undrawn revolver. No cure rights attach to this covenant.',
    history: quarterPoints([2.61, 2.66, 2.58, 2.71, 2.78, 2.84, 2.9, 2.93], FLAT(2.5)),
  },
  {
    id: C_FCC,
    clause: '§7.11(c)',
    name: 'Minimum Consolidated Fixed Charge Coverage Ratio (excl. Permitted Ridgeway Capex)',
    shortName: 'Fixed charge coverage',
    kind: 'min',
    unit: 'x',
    limit: 1.2,
    domainMin: 0.8,
    domainMax: 2.0,
    forecastSensitive: true,
    compute: i => (i.ebitda - i.capex - i.cashTaxes) / (i.cashInterest + i.schedAmort),
    definition:
      '(Consolidated EBITDA − Unfinanced Capex − Cash Taxes) to Fixed Charges (cash interest + scheduled amortization). Permitted Ridgeway Capex (as defined in §1.01) is excluded from the numerator deduction up to $4.0M per fiscal year while the Ridgeway facility remains under construction.',
    history: quarterPoints([1.28, 1.31, 1.25, 1.33, 1.38, 1.41, 1.44, 1.46], FLAT(1.2)),
  },
  {
    id: C_SSL,
    clause: '§7.11(d)',
    name: 'Maximum Senior Secured Net Leverage',
    shortName: 'Senior secured leverage',
    kind: 'max',
    unit: 'x',
    limit: 3.0,
    domainMin: 1.0,
    domainMax: 4.0,
    forecastSensitive: true,
    compute: i => (i.seniorDebt - i.cash) / i.ebitda,
    definition:
      'Senior Secured Net Debt (TLB outstanding plus revolver drawings, net of unrestricted cash) to Consolidated EBITDA. Springing test — tested only while revolver utilization exceeds 35% of commitments; utilization at 30 Jun 2026 was 36.0% including LCs, so the covenant is live this quarter.',
    history: quarterPoints([2.55, 2.48, 2.41, 2.33, 2.24, 2.15, 2.08, 2.02], FLAT(3.0)),
  },
  {
    id: C_CAP,
    clause: '§7.12',
    name: 'Maximum Capital Expenditures (TTM)',
    shortName: 'Capex cap',
    kind: 'max',
    unit: '$M',
    limit: 12.0,
    domainMin: 6.0,
    domainMax: 14.0,
    forecastSensitive: false,
    compute: i => i.capex,
    definition:
      'Trailing-twelve-month capital expenditures, tested quarterly against a $12.0M cap with a 50% carry-forward of unused basket (max carry $3.0M). The bench sliders do not touch capex, so this covenant is not forecast-sensitive on this surface.',
    history: quarterPoints([11.2, 10.9, 11.6, 10.4, 10.1, 9.9, 9.7, 9.8], FLAT(12.0)),
  },
  {
    id: C_LIQ,
    clause: '§7.13',
    name: 'Minimum Liquidity',
    shortName: 'Minimum liquidity',
    kind: 'min',
    unit: '$M',
    limit: 10.0,
    domainMin: 0.0,
    domainMax: 30.0,
    forecastSensitive: false,
    compute: i => i.cash + i.revolverAvail,
    definition:
      'Unrestricted cash plus undrawn revolver availability ($20.0M commitments − $6.0M drawn − $1.2M LCs = $12.8M available), tested monthly. Add-on proceeds fund Ridgeway day-one and paydowns come from escrowed asset-sale proceeds, so the bench sliders leave both cash and availability unchanged — not forecast-sensitive here.',
    history: quarterPoints([15.2, 16.8, 14.1, 18.9, 20.4, 21.7, 23.0, 24.3], FLAT(10.0)),
  },
];

const COVENANT_BY_ID = new Map(COVENANTS.map(c => [c.id, c]));

// Forecast-bench scenario presets — each is a (label, ebitdaPct, debtDelta).
interface Scenario {
  id: string;
  label: string;
  ebitdaPct: number;
  debtDelta: number;
}

const SCENARIOS: Scenario[] = [
  {id: 'base', label: 'Base', ebitdaPct: 0, debtDelta: 0},
  {id: 'ridgeway', label: 'Ridgeway add-on +$24M', ebitdaPct: 0, debtDelta: 24},
  {id: 'soft', label: 'Soft landing −12%', ebitdaPct: -12, debtDelta: 0},
  {id: 'stress', label: 'Stress −22% / +$24M', ebitdaPct: -22, debtDelta: 24},
];

// ---------------------------------------------------------------------------
// DERIVATION HELPERS — status, headroom, formatting. Headroom fraction is
// signed: positive = inside the limit, negative = breach; the waiver desk
// ranks ascending on the FORECAST fraction.
// ---------------------------------------------------------------------------

function headroomFraction(covenant: Covenant, value: number): number {
  return covenant.kind === 'max'
    ? (covenant.limit - value) / covenant.limit
    : (value - covenant.limit) / covenant.limit;
}

const WATCH_BAND = 0.1; // within 10% of the limit -> watch

function statusOf(covenant: Covenant, value: number): CovenantStatus {
  const h = headroomFraction(covenant, value);
  if (h < 0) return 'breach';
  if (h < WATCH_BAND) return 'watch';
  return 'compliant';
}

const STATUS_COLOR: Record<CovenantStatus, string> = {
  compliant: OK_GREEN,
  watch: WARN,
  breach: DANGER,
};

const STATUS_SOFT: Record<CovenantStatus, string> = {
  compliant: 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))',
  watch: WARN_SOFT,
  breach: DANGER_SOFT,
};

const STATUS_LABEL: Record<CovenantStatus, string> = {
  compliant: 'Compliant',
  watch: 'Watch',
  breach: 'Projected breach',
};

function fmtValue(covenant: Covenant, value: number): string {
  return covenant.unit === 'x' ? `${value.toFixed(2)}x` : `$${value.toFixed(1)}M`;
}

function fmtLimit(covenant: Covenant): string {
  const bound = covenant.kind === 'max' ? '≤' : '≥';
  return `${bound} ${fmtValue(covenant, covenant.limit)}`;
}

function fmtSignedPct(fraction: number): string {
  const pct = fraction * 100;
  return `${pct >= 0 ? '+' : '−'}${Math.abs(pct).toFixed(0)}%`;
}

function fmtUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

/** One row of everything the surfaces need about a covenant this render. */
interface CovenantDerived {
  covenant: Covenant;
  actual: number;
  forecast: number;
  actualStatus: CovenantStatus;
  forecastStatus: CovenantStatus;
  forecastHeadroom: number; // signed fraction
}

function deriveAll(ebitdaPct: number, debtDelta: number): CovenantDerived[] {
  const forecastInputs = applyForecast(BASE_INPUTS, ebitdaPct, debtDelta);
  return COVENANTS.map(covenant => {
    const actual = covenant.compute(BASE_INPUTS);
    const forecast = covenant.forecastSensitive ? covenant.compute(forecastInputs) : actual;
    return {
      covenant,
      actual,
      forecast,
      actualStatus: statusOf(covenant, actual),
      forecastStatus: statusOf(covenant, forecast),
      forecastHeadroom: headroomFraction(covenant, forecast),
    };
  });
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (house pattern): the demo stage is
// ~1045–1075px inside a 1440px window, so viewport media queries would lie
// for the inline bands. Width 0 = first pre-observer frame; the caller
// falls back to a viewport query for that frame only.
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
// COVENA MARK — 24px inline SVG: a gauge arc with a rose needle at the
// two-o'clock position. Brand usage: mark fill/stroke.
// ---------------------------------------------------------------------------

function CovenaMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <path
        d="M 4 16 A 8.5 8.5 0 1 1 20 16"
        fill="none"
        stroke={BRAND}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <line x1={12} y1={14} x2={17} y2={7.5} stroke={BRAND} strokeWidth={2} strokeLinecap="round" />
      <circle cx={12} cy={14} r={2} fill={BRAND} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RatioDial — fully custom SVG arc gauge; the DS has no vocabulary for
// "ratio against a covenant limit with a live forecast marker". 168x100
// box: 180° arc, r=64, stroke 10. Layers: track, out-of-compliance zone,
// value arc (actual), threshold tick (crossing line), actual needle,
// hollow forecast marker. Purely presentational — all values arrive as
// props; the slider state lives in the page owner.
// ---------------------------------------------------------------------------

const DIAL_W = 168;
const DIAL_H = 100;
const DIAL_CX = 84;
const DIAL_CY = 88;
const DIAL_R = 64;

/** Point on the dial arc for domain fraction t in [0,1] (left -> right). */
function dialPoint(t: number, radius: number): {x: number; y: number} {
  const angle = Math.PI * (1 - t);
  return {x: DIAL_CX + radius * Math.cos(angle), y: DIAL_CY - radius * Math.sin(angle)};
}

function dialArcPath(t0: number, t1: number, radius: number): string {
  const a = dialPoint(t0, radius);
  const b = dialPoint(t1, radius);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

interface RatioDialProps {
  covenant: Covenant;
  actual: number;
  forecast: number;
  forecastStatus: CovenantStatus;
  actualStatus: CovenantStatus;
  showForecast: boolean;
}

function RatioDial({covenant, actual, forecast, forecastStatus, actualStatus, showForecast}: RatioDialProps) {
  const {domainMin, domainMax, limit, kind} = covenant;
  const span = domainMax - domainMin;
  const clampT = (v: number) => Math.min(Math.max((v - domainMin) / span, 0), 1);
  const tActual = clampT(actual);
  const tForecast = clampT(forecast);
  const tLimit = clampT(limit);
  const tickInner = dialPoint(tLimit, DIAL_R - 9);
  const tickOuter = dialPoint(tLimit, DIAL_R + 9);
  const needleTip = dialPoint(tActual, DIAL_R - 13);
  const marker = dialPoint(tForecast, DIAL_R);
  // Out-of-compliance zone: beyond the limit for max covenants, below it
  // for min covenants — drawn as a soft danger arc so the direction of
  // "bad" is visible without reading the clause.
  const zonePath =
    kind === 'max' ? dialArcPath(tLimit, 1, DIAL_R) : dialArcPath(0, tLimit, DIAL_R);
  return (
    <svg
      width={DIAL_W}
      height={DIAL_H}
      viewBox={`0 0 ${DIAL_W} ${DIAL_H}`}
      role="img"
      aria-label={`${covenant.shortName}: actual ${fmtValue(covenant, actual)} against limit ${fmtLimit(covenant)}${
        showForecast ? `, forecast ${fmtValue(covenant, forecast)} (${STATUS_LABEL[forecastStatus].toLowerCase()})` : ''
      }`}
      style={{flexShrink: 0}}>
      {/* Track */}
      <path d={dialArcPath(0, 1, DIAL_R)} fill="none" stroke="var(--color-border)" strokeWidth={10} />
      {/* Out-of-compliance zone */}
      <path d={zonePath} fill="none" stroke={DANGER_SOFT} strokeWidth={10} />
      {/* Actual value arc from the compliant end toward the needle */}
      <path
        d={kind === 'max' ? dialArcPath(0, tActual, DIAL_R) : dialArcPath(tActual, 1, DIAL_R)}
        fill="none"
        stroke={STATUS_COLOR[actualStatus]}
        strokeWidth={4}
        opacity={0.85}
      />
      {/* Threshold tick — the shape channel for "the limit lives here" */}
      <line
        x1={tickInner.x}
        y1={tickInner.y}
        x2={tickOuter.x}
        y2={tickOuter.y}
        stroke={DANGER}
        strokeWidth={2}
      />
      {/* Actual needle */}
      <line
        x1={DIAL_CX}
        y1={DIAL_CY}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="var(--color-text-primary)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={DIAL_CX} cy={DIAL_CY} r={3.5} fill="var(--color-text-primary)" />
      {/* Hollow forecast marker — brand-stroked ring so forecast reads as a
          distinct channel from the solid actual needle. */}
      {showForecast ? (
        <circle
          className="lcm-marker-move"
          cx={marker.x}
          cy={marker.y}
          r={5}
          fill="var(--color-background)"
          stroke={BRAND}
          strokeWidth={2.5}
        />
      ) : null}
      {/* Domain min/max labels */}
      <text
        x={DIAL_CX - DIAL_R}
        y={DIAL_CY + 11}
        textAnchor="middle"
        fontSize={9}
        fontFamily="var(--font-family-code, ui-monospace, monospace)"
        fill="var(--color-text-secondary)">
        {covenant.unit === 'x' ? domainMin.toFixed(1) : domainMin.toFixed(0)}
      </text>
      <text
        x={DIAL_CX + DIAL_R}
        y={DIAL_CY + 11}
        textAnchor="middle"
        fontSize={9}
        fontFamily="var(--font-family-code, ui-monospace, monospace)"
        fill="var(--color-text-secondary)">
        {covenant.unit === 'x' ? domainMax.toFixed(1) : domainMax.toFixed(0)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// QuarterSparkbars — eight bars, one per test quarter, each carrying its own
// tested limit as a notch (step-downs render honestly: the leverage limit
// notch drops 4.50 -> 4.25 -> 4.00 across the strip). Breached-and-waived
// quarters render in danger with a title citing the waiver. aria-hidden
// bars + a visually hidden text summary.
// ---------------------------------------------------------------------------

const SPARK_H = 36;
const SPARK_BAR_W = 13;

function QuarterSparkbars({covenant}: {covenant: Covenant}) {
  const {domainMin, domainMax} = covenant;
  const span = domainMax - domainMin;
  const scale = (v: number) => Math.min(Math.max((v - domainMin) / span, 0.04), 1) * SPARK_H;
  const summary = covenant.history
    .map(p => `${p.q} ${fmtValue(covenant, p.value)} vs ${fmtValue(covenant, p.limit)}${p.waivedRef != null ? ` (breached, waived ${p.waivedRef})` : ''}`)
    .join('; ');
  return (
    <div style={{minWidth: 0}}>
      <div className="lcm-sparks" aria-hidden>
        {covenant.history.map((point, index) => {
          const breached = statusOf({...covenant, limit: point.limit}, point.value) === 'breach';
          const isCurrent = index === covenant.history.length - 1;
          const barH = scale(point.value);
          const notchY = scale(point.limit);
          return (
            <span
              key={point.q}
              title={`${point.q}: ${fmtValue(covenant, point.value)} vs ${covenant.kind === 'max' ? '≤' : '≥'} ${fmtValue(covenant, point.limit)}${point.waivedRef != null ? ` — waived ${point.waivedRef}` : ''}`}
              style={{position: 'relative', width: SPARK_BAR_W, height: SPARK_H, flexShrink: 0}}>
              <span
                className="lcm-fade"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: barH,
                  borderRadius: 2,
                  backgroundColor: breached
                    ? DANGER
                    : isCurrent
                      ? STATUS_COLOR[statusOf(covenant, point.value)]
                      : 'var(--color-border)',
                }}
              />
              {/* Per-quarter limit notch */}
              <span
                style={{
                  position: 'absolute',
                  bottom: notchY - 1,
                  left: -1,
                  width: SPARK_BAR_W + 2,
                  height: 2,
                  backgroundColor: 'var(--color-text-secondary)',
                }}
              />
            </span>
          );
        })}
      </div>
      <div className="lcm-spark-axis" aria-hidden>
        {covenant.history.map((point, index) => (
          <span
            key={point.q}
            style={{
              width: SPARK_BAR_W,
              flexShrink: 0,
              fontSize: 8,
              fontFamily: MONO,
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              overflow: 'hidden',
            }}>
            {/* Label alternate quarters only — 13px bars can't fit 5 chars. */}
            {index % 2 === 1 ? point.q.slice(0, 2) : ''}
          </span>
        ))}
      </div>
      <span className="lcm-vh">{`Eight-quarter history for ${covenant.shortName}: ${summary}.`}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CovenantPanel — one gauge-wall panel: 40px header row (clause + name +
// status chip), dial + sparkbars body, footer rows (headroom line, forecast
// delta, definition toggle, add-to-waiver action). Presentational; package
// membership and slider state live in the page owner.
// ---------------------------------------------------------------------------

interface CovenantPanelProps {
  derived: CovenantDerived;
  benchActive: boolean;
  inPackage: boolean;
  packageLocked: boolean;
  defOpen: boolean;
  onToggleDef: () => void;
  onAddToPackage: () => void;
}

function CovenantPanel({
  derived,
  benchActive,
  inPackage,
  packageLocked,
  defOpen,
  onToggleDef,
  onAddToPackage,
}: CovenantPanelProps) {
  const {covenant, actual, forecast, actualStatus, forecastStatus, forecastHeadroom} = derived;
  const showForecast = benchActive && covenant.forecastSensitive;
  const displayStatus = showForecast ? forecastStatus : actualStatus;
  const headroomLabel = `${fmtSignedPct(headroomFraction(covenant, actual))} headroom`;
  return (
    <section className="lcm-panel" aria-label={`${covenant.shortName} covenant`}>
      <div className="lcm-panel-head">
        <span className="lcm-mono" style={{color: 'var(--color-text-secondary)'}}>
          {covenant.clause}
        </span>
        <h3 className="lcm-panel-name" title={covenant.name}>
          {covenant.name}
        </h3>
        <span style={{flex: 1}} aria-hidden />
        <span
          className="lcm-status-chip lcm-fade"
          style={{backgroundColor: STATUS_SOFT[displayStatus], color: STATUS_COLOR[displayStatus]}}>
          {displayStatus === 'breach' ? <ShieldAlertIcon size={11} strokeWidth={2.5} aria-hidden /> : null}
          {STATUS_LABEL[displayStatus]}
        </span>
      </div>
      <div className="lcm-panel-body">
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
          <RatioDial
            covenant={covenant}
            actual={actual}
            forecast={forecast}
            forecastStatus={forecastStatus}
            actualStatus={actualStatus}
            showForecast={showForecast}
          />
          <span className="lcm-mono" style={{fontSize: 15, fontWeight: 600}}>
            {fmtValue(covenant, actual)}
            <span style={{color: 'var(--color-text-secondary)', fontWeight: 400}}>
              {` ${fmtLimit(covenant)}`}
            </span>
          </span>
        </div>
        <QuarterSparkbars covenant={covenant} />
      </div>
      <div className="lcm-panel-foot">
        <div className="lcm-foot-row">
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers maxLines={1}>
            {covenant.forecastSensitive
              ? showForecast
                ? `Forecast ${fmtValue(covenant, forecast)} (${fmtSignedPct(forecastHeadroom)} headroom) · actual ${headroomLabel}`
                : `${headroomLabel} · forecast tracks the bench`
              : `${headroomLabel} · not forecast-sensitive`}
          </Text>
        </div>
        <div className="lcm-foot-row">
          <button
            type="button"
            className="lcm-def-toggle lcm-fade"
            aria-expanded={defOpen}
            onClick={onToggleDef}>
            {defOpen ? (
              <ChevronUpIcon size={13} aria-hidden />
            ) : (
              <ChevronDownIcon size={13} aria-hidden />
            )}
            {`Definition ${covenant.clause}`}
          </button>
          <span style={{flex: 1}} aria-hidden />
          {inPackage ? (
            <span
              className="lcm-status-chip"
              style={{backgroundColor: BRAND_SOFT, color: BRAND}}>
              <FileCheck2Icon size={11} strokeWidth={2.5} aria-hidden />
              In waiver pkg
            </span>
          ) : showForecast && forecastStatus === 'breach' ? (
            <Button
              label="Add to waiver package"
              variant="secondary"
              size="sm"
              isDisabled={packageLocked}
              icon={<Icon icon={PlusIcon} size="sm" />}
              onClick={onAddToPackage}
            />
          ) : null}
        </div>
        {defOpen ? (
          <div className="lcm-def-body">
            <Text type="supporting" size="xsm" color="secondary">
              {covenant.definition}
            </Text>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ForecastBench — the signature-interaction owner surface: two DS Sliders
// (EBITDA Δ%, incremental debt $M), derived adjusted-inputs readout, and
// scenario preset chips. All state lifts to the page; the bench only
// reports changes.
// ---------------------------------------------------------------------------

interface ForecastBenchProps {
  ebitdaPct: number;
  debtDelta: number;
  benchActive: boolean;
  adjusted: FinInputs;
  onEbitdaPct: (value: number) => void;
  onDebtDelta: (value: number) => void;
  onReset: () => void;
}

function ForecastBench({
  ebitdaPct,
  debtDelta,
  benchActive,
  adjusted,
  onEbitdaPct,
  onDebtDelta,
  onReset,
}: ForecastBenchProps) {
  const activeScenario = SCENARIOS.find(
    s => s.ebitdaPct === ebitdaPct && s.debtDelta === debtDelta,
  );
  return (
    <div className="lcm-bench" role="group" aria-label="Forecast bench">
      <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200, flex: '0 1 240px'}}>
        <Slider
          label="EBITDA Δ (%)"
          value={ebitdaPct}
          min={-25}
          max={15}
          step={1}
          valueDisplay="text"
          formatValue={v =>
            `${v >= 0 ? '+' : '−'}${Math.abs(v)}% -> $${(BASE_INPUTS.ebitda * (1 + v / 100)).toFixed(1)}M TTM`
          }
          onChange={onEbitdaPct}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200, flex: '0 1 240px'}}>
        <Slider
          label="Incremental debt ($M)"
          value={debtDelta}
          min={-20}
          max={30}
          step={1}
          valueDisplay="text"
          formatValue={v =>
            `${v >= 0 ? '+' : '−'}$${Math.abs(v)}M -> $${(BASE_INPUTS.totalDebt + v).toFixed(1)}M total`
          }
          onChange={onDebtDelta}
        />
      </div>
      <div className="lcm-bench-readout">
        <span className="lcm-section-label">Adjusted inputs</span>
        <span className="lcm-mono" style={{color: 'var(--color-text-secondary)'}}>
          {`EBITDA $${adjusted.ebitda.toFixed(1)}M · Net debt $${(adjusted.totalDebt - adjusted.cash).toFixed(1)}M`}
        </span>
        <span className="lcm-mono" style={{color: 'var(--color-text-secondary)'}}>
          {`Cash interest $${adjusted.cashInterest.toFixed(1)}M @ SOFR+450 on Δ`}
        </span>
      </div>
      <div className="lcm-scenario-row" role="group" aria-label="Scenario presets">
        {SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            type="button"
            className="lcm-scenario-btn lcm-fade"
            aria-pressed={activeScenario?.id === scenario.id}
            onClick={() => {
              onEbitdaPct(scenario.ebitdaPct);
              onDebtDelta(scenario.debtDelta);
            }}>
            {scenario.label}
          </button>
        ))}
        {benchActive ? (
          <Button
            label="Reset"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" />}
            onClick={onReset}
          />
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WaiverDesk — the drawer: forecast-ranked covenant list (most negative
// headroom first), package builder rows, fee arithmetic, counsel gate.
// Purely presentational; the package array and lock state live in the page.
// ---------------------------------------------------------------------------

interface WaiverDeskProps {
  width: number;
  isOverlay: boolean;
  derivedList: CovenantDerived[]; // pre-sorted by forecast headroom
  benchActive: boolean;
  packageIds: string[];
  packageSent: boolean;
  debtDelta: number;
  onClose: () => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onSend: () => void;
  onReopen: () => void;
}

function WaiverDesk({
  width,
  isOverlay,
  derivedList,
  benchActive,
  packageIds,
  packageSent,
  debtDelta,
  onClose,
  onAdd,
  onRemove,
  onSend,
  onReopen,
}: WaiverDeskProps) {
  const feeTotal = packageIds.length * FEE_PER_COVENANT;
  return (
    <aside
      className={`lcm-drawer${isOverlay ? ' lcm-drawer-overlay' : ''}`}
      style={{width}}
      aria-label="Waiver desk">
      <div className="lcm-drawer-head">
        <Icon icon={ScaleIcon} size="sm" color="secondary" />
        {/* Semantic h2 stays in the outline; the visible label is sized for
            the 40px drawer head. */}
        <h2 className="lcm-vh">Waiver desk</h2>
        <Text type="label" size="sm">
          Waiver desk
        </Text>
        <span style={{flex: 1}} aria-hidden />
        {packageSent ? (
          <Token size="sm" color="green" label="Sent to counsel" />
        ) : (
          <Token size="sm" color="default" label="Draft" />
        )}
        {isOverlay ? (
          <Button
            label="Close waiver desk"
            isIconOnly
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className="lcm-drawer-scroll">
        <span className="lcm-section-label">Forecast ranking</span>
        {!benchActive ? (
          <div style={{padding: `${GUTTER / 2}px 0 ${GUTTER}px`}}>
            <Text type="supporting" size="xsm" color="secondary">
              Bench idle — projections match Q2-26 actuals. Drag a forecast
              slider to stress the book; covenants re-rank by projected
              headroom as you drag.
            </Text>
          </div>
        ) : null}
        <div role="list" aria-label="Covenants ranked by forecast headroom">
          {derivedList.map((derived, index) => {
            const {covenant, forecast, forecastStatus, forecastHeadroom} = derived;
            const inPackage = packageIds.includes(covenant.id);
            return (
              <div role="listitem" key={covenant.id} className="lcm-rank-row">
                <span className="lcm-rank-num">{index + 1}</span>
                <div style={{minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column'}}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {covenant.shortName}
                  </span>
                  <span className="lcm-mono" style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
                    {`${covenant.clause} · fcst ${fmtValue(covenant, forecast)} vs ${fmtLimit(covenant)}`}
                  </span>
                </div>
                <span
                  className="lcm-status-chip lcm-fade"
                  style={{
                    backgroundColor: STATUS_SOFT[forecastStatus],
                    color: STATUS_COLOR[forecastStatus],
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                  {fmtSignedPct(forecastHeadroom)}
                </span>
                {forecastStatus === 'breach' && !inPackage ? (
                  <Button
                    label={`Add ${covenant.shortName} to waiver package`}
                    isIconOnly
                    variant="secondary"
                    size="sm"
                    isDisabled={packageSent}
                    icon={<Icon icon={PlusIcon} size="sm" />}
                    onClick={() => onAdd(covenant.id)}
                  />
                ) : inPackage ? (
                  <FileCheck2Icon size={14} color={BRAND} aria-label="In package" />
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{height: GUTTER}} aria-hidden />
        <Divider />
        <div style={{height: GUTTER}} aria-hidden />
        <span className="lcm-section-label">{`Waiver package · ${packageIds.length} covenant${packageIds.length === 1 ? '' : 's'}`}</span>
        {packageIds.length === 0 ? (
          <div style={{padding: `${GUTTER / 2}px 0`}}>
            <Text type="supporting" size="xsm" color="secondary">
              Empty. Add projected-breach covenants from the ranking above or
              from a gauge panel — both write to the same package.
            </Text>
          </div>
        ) : (
          <div role="list" aria-label="Covenants in waiver package">
            {packageIds.map(id => {
              const covenant = COVENANT_BY_ID.get(id);
              if (covenant == null) return null;
              return (
                <div role="listitem" key={id} className="lcm-pkg-row">
                  <FileClockIcon size={14} color={BRAND} aria-hidden />
                  <div style={{minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <span style={{fontSize: 12, fontWeight: 600}}>{covenant.shortName}</span>
                    <span className="lcm-mono" style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
                      {`${covenant.clause} · fee ${fmtUsd(FEE_PER_COVENANT)}`}
                    </span>
                  </div>
                  <Button
                    label={`Remove ${covenant.shortName} from package`}
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    isDisabled={packageSent}
                    icon={<Icon icon={XIcon} size="sm" />}
                    onClick={() => onRemove(id)}
                  />
                </div>
              );
            })}
          </div>
        )}
        {packageIds.length > 0 ? (
          <div style={{paddingTop: GUTTER / 2, display: 'flex', flexDirection: 'column', gap: 2}}>
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {`Fee basis: ${WAIVER_FEE_BPS} bps × $${COMMITMENTS_MM.toFixed(1)}M commitments = ${fmtUsd(FEE_PER_COVENANT)} per covenant.`}
            </Text>
            {debtDelta > 0 ? (
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                {`Includes incremental-facility consent for the +$${debtDelta}M add-on (§2.14 most-favored-nation check applies).`}
              </Text>
            ) : null}
            {packageSent ? (
              <Text type="supporting" size="xsm" color="secondary">
                Sent to Ashworth & Crane LLP, 8 Jul 2026 16:40 — package locked
                pending counsel mark-up. Reopen to edit.
              </Text>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="lcm-drawer-foot">
        <span className="lcm-mono" style={{fontWeight: 600}}>
          {packageIds.length > 0 ? `Fees ${fmtUsd(feeTotal)}` : 'No fees accrued'}
        </span>
        {packageSent ? (
          <Button label="Reopen draft" variant="secondary" size="sm" onClick={onReopen} />
        ) : (
          <Button
            label="Send to counsel"
            variant="primary"
            size="sm"
            isDisabled={packageIds.length === 0}
            icon={<Icon icon={SendIcon} size="sm" />}
            onClick={onSend}
          />
        )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// LEGEND — dial-encoding key, 32px strip. Bottom-left corner owner.
// ---------------------------------------------------------------------------

function LegendStrip() {
  return (
    <div className="lcm-legend" aria-label="Dial encoding legend">
      <span className="lcm-legend-key">
        <span aria-hidden style={{width: 12, height: 2, backgroundColor: 'var(--color-text-primary)'}} />
        <Text type="supporting" size="xsm" color="secondary">
          Actual (Q2-26)
        </Text>
      </span>
      <span className="lcm-legend-key">
        <span
          aria-hidden
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            border: `2.5px solid ${BRAND}`,
            backgroundColor: 'var(--color-background)',
          }}
        />
        <Text type="supporting" size="xsm" color="secondary">
          Forecast
        </Text>
      </span>
      <span className="lcm-legend-key">
        <span aria-hidden style={{width: 2, height: 12, backgroundColor: DANGER}} />
        <Text type="supporting" size="xsm" color="secondary">
          Covenant limit
        </Text>
      </span>
      <span className="lcm-legend-key">
        <span aria-hidden style={{width: 8, height: 12, borderRadius: 2, backgroundColor: DANGER}} />
        <Text type="supporting" size="xsm" color="secondary">
          Breached quarter (waived)
        </Text>
      </span>
      <span className="lcm-legend-key">
        <span aria-hidden style={{width: 12, height: 2, backgroundColor: 'var(--color-text-secondary)'}} />
        <Text type="supporting" size="xsm" color="secondary">
          Per-quarter limit notch
        </Text>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner. The forecast sliders are THE source of truth:
// dials, status chips, the header breach counter, the drawer ranking, and
// the fee arithmetic are all derived from (ebitdaPct, debtDelta, packageIds,
// packageSent) in the same render. No surface caches a value.
// ---------------------------------------------------------------------------

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

export default function LoanCovenantMonitorTemplate() {
  // Responsive bands measured on the VIEW ROOT container (see the
  // responsive contract in the header comment). Width 0 = first
  // pre-observer frame; viewport queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1279px)');
  const isViewportNarrow = useMediaQuery('(max-width: 1023px)');
  const isMid = viewWidth > 0 ? viewWidth < 1180 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 980 : isViewportNarrow;
  const drawerWidth = isNarrow ? 320 : isMid ? 300 : 340;

  // ---- THE single state owner ---------------------------------------------
  const [ebitdaPct, setEbitdaPct] = useState(0);
  const [debtDelta, setDebtDelta] = useState(0);
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [packageSent, setPackageSent] = useState(false);
  const [openDefs, setOpenDefs] = useState<ReadonlySet<string>>(() => new Set());
  const [drawerOpen, setDrawerOpen] = useState(false); // narrow band only
  const [announcement, setAnnouncement] = useState('');
  const drawerToggleRef = useRef<HTMLButtonElement | null>(null);

  const benchActive = ebitdaPct !== 0 || debtDelta !== 0;
  const adjusted = useMemo(
    () => applyForecast(BASE_INPUTS, ebitdaPct, debtDelta),
    [ebitdaPct, debtDelta],
  );
  const derivedAll = useMemo(() => deriveAll(ebitdaPct, debtDelta), [ebitdaPct, debtDelta]);
  const rankedForDrawer = useMemo(
    () => [...derivedAll].sort((a, b) => a.forecastHeadroom - b.forecastHeadroom),
    [derivedAll],
  );
  const projectedBreaches = derivedAll.filter(
    d => (benchActive ? d.forecastStatus : d.actualStatus) === 'breach',
  );
  const projectedBreachCount = projectedBreaches.length;

  // Announce breach-count changes politely; the count is derived state, so
  // this effect fires exactly on real transitions (no timers involved).
  const prevBreachCount = useRef(0);
  useEffect(() => {
    if (projectedBreachCount !== prevBreachCount.current) {
      setAnnouncement(
        projectedBreachCount === 0
          ? 'Forecast: no covenants projected in breach.'
          : `Forecast: ${projectedBreachCount} covenant${projectedBreachCount === 1 ? '' : 's'} projected in breach — ${projectedBreaches
              .map(d => d.covenant.shortName)
              .join(', ')}.`,
      );
      prevBreachCount.current = projectedBreachCount;
    }
  }, [projectedBreachCount, projectedBreaches]);

  const addToPackage = useCallback((id: string) => {
    setPackageIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const removeFromPackage = useCallback((id: string) => {
    setPackageIds(prev => prev.filter(existing => existing !== id));
  }, []);
  const toggleDef = useCallback((id: string) => {
    setOpenDefs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const resetBench = useCallback(() => {
    setEbitdaPct(0);
    setDebtDelta(0);
  }, []);
  const sendToCounsel = useCallback(() => {
    setPackageSent(true);
    setAnnouncement('Waiver package sent to counsel and locked.');
  }, []);
  const reopenDraft = useCallback(() => {
    setPackageSent(false);
    setAnnouncement('Waiver package reopened for editing.');
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    drawerToggleRef.current?.focus();
  }, []);

  // Escape layering: the overlay drawer closes first (focus returns to the
  // toggle button); otherwise Escape collapses any open definition.
  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || isTypingTarget(event.target)) return;
    if (isNarrow && drawerOpen) {
      closeDrawer();
    } else if (openDefs.size > 0) {
      setOpenDefs(new Set());
    }
  };

  const drawerVisible = !isNarrow || drawerOpen;

  return (
    <div className="tpl-loan-covenant-monitor" onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <span aria-live="polite" role="status" className="lcm-vh">
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div className="lcm-header-bar">
              {/* Top-left corner: Covena mark + borrower/facility line. */}
              <CovenaMark />
              <Text type="label" size="sm">
                Covena
              </Text>
              {/* Semantic page title lives in the outline; the visible
                  borrower line is sized for the 48px bar. */}
              <h1 className="lcm-vh">{`Covena loan covenant monitor — ${BORROWER}`}</h1>
              <div className="lcm-borrower-line">
                <Text type="label" size="sm" maxLines={1}>
                  {BORROWER}
                </Text>
                <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                  {FACILITY_LINE}
                </Text>
              </div>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: certificate chip + derived breach counter
                  + (narrow band) waiver-desk toggle + analyst avatar. */}
              <span className="lcm-chip">
                <FileClockIcon size={12} aria-hidden />
                {isMid ? 'Cert due 14 Aug' : `${TEST_PERIOD} · ${CERT_DUE}`}
              </span>
              <span
                className="lcm-chip lcm-fade"
                role="status"
                style={
                  projectedBreachCount > 0
                    ? {borderColor: DANGER, backgroundColor: DANGER_SOFT, color: DANGER}
                    : undefined
                }>
                <GaugeIcon size={12} aria-hidden />
                <span className="lcm-mono" style={{color: 'inherit'}}>
                  {projectedBreachCount}
                </span>
                {benchActive ? 'projected breaches' : 'breaches'}
              </span>
              {isNarrow ? (
                <button
                  type="button"
                  ref={drawerToggleRef}
                  className="lcm-scenario-btn lcm-fade"
                  aria-expanded={drawerOpen}
                  onClick={() => setDrawerOpen(prev => !prev)}>
                  <ScaleIcon size={13} aria-hidden />
                  {`Waiver desk · ${packageIds.length}`}
                </button>
              ) : null}
              <Avatar name={ANALYST.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} className="lcm-view-root">
              <div className="lcm-main-col">
                <ForecastBench
                  ebitdaPct={ebitdaPct}
                  debtDelta={debtDelta}
                  benchActive={benchActive}
                  adjusted={adjusted}
                  onEbitdaPct={setEbitdaPct}
                  onDebtDelta={setDebtDelta}
                  onReset={resetBench}
                />
                <div className="lcm-wall-scroll">
                  <div className="lcm-wall">
                    {derivedAll.map(derived => (
                      <CovenantPanel
                        key={derived.covenant.id}
                        derived={derived}
                        benchActive={benchActive}
                        inPackage={packageIds.includes(derived.covenant.id)}
                        packageLocked={packageSent}
                        defOpen={openDefs.has(derived.covenant.id)}
                        onToggleDef={() => toggleDef(derived.covenant.id)}
                        onAddToPackage={() => addToPackage(derived.covenant.id)}
                      />
                    ))}
                  </div>
                </div>
                <LegendStrip />
              </div>
              {drawerVisible ? (
                <WaiverDesk
                  width={drawerWidth}
                  isOverlay={isNarrow}
                  derivedList={rankedForDrawer}
                  benchActive={benchActive}
                  packageIds={packageIds}
                  packageSent={packageSent}
                  debtDelta={debtDelta}
                  onClose={closeDrawer}
                  onAdd={addToPackage}
                  onRemove={removeFromPackage}
                  onSend={sendToCounsel}
                  onReopen={reopenDraft}
                />
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
