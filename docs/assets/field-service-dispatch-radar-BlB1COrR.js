var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Fieldbeam dispatch board for
 *   sector NE-4 of the Harborline metro grid, frozen at board time 13:05.
 *   Three techs (FB-07 Priya Raman, FB-03 Marcus Bell, FB-11 Elena Sosa),
 *   8 open jobs (7 assigned + 1 incoming), 3 + 2 + 2 = 7 jobs closed today.
 *   ETAs are DERIVED in code, never stored: travel = manhattan grid
 *   distance × 2 min/unit, +14 min flat depot pickup when the required
 *   part is not on the assigned tech's van; each route visits its stops in
 *   SLA-due order. Hand-checked default chains:
 *   - Elena from (8,11): J-1842 at (9,9) d=3 → arrive 13:05+6 = 13:11
 *     (due 13:45, +34 OK), depart 13:56; J-1845 at (4,12) d=8 → arrive
 *     14:12 (due 14:30, +18 TIGHT), depart 14:42; J-1849 at (13,12) d=9 →
 *     18 min + 14 depot (CT-40 not on her van) → arrive 15:14 (due 15:00,
 *     −14 MISS) — the board's one projected breach.
 *   - Priya from (3,3): J-1841 d=3 → arrive 13:11 (due 13:50, +39 OK),
 *     depart 13:46; J-1846 d=5 → arrive 13:56 (due 15:30, +94 OK).
 *   - Marcus from (14,4): J-1843 d=4 → arrive 13:13 (due 13:40, +27 OK),
 *     depart 13:38; J-1847 d=5 → arrive 13:48 (due 16:00, +132 OK).
 *   - Reroute J-1849 → Marcus (electrical-certified, CT-40 on van): it
 *     slots between his stops by due order; from (16,6) at 13:38, d=9 →
 *     arrive 13:56 (due 15:00, +64 OK), depart 14:31; J-1847 refigures to
 *     d=8 → arrive 14:47 (due 16:00, +73 OK). Board risk 1 MISS → 0.
 *   Risk bands: slack < 0 MISS · 0–19 TIGHT · ≥ 20 OK. No Date.now(), no
 *   Math.random(), no timers, no network tiles — the map is schematic SVG.
 * @output Fieldbeam — Field Service Dispatch Radar: a dispatcher console
 *   pairing a schematic territory map (street grid, Halloran Park, the
 *   Quayle Canal band, parts depot, tech diamonds, job pins risk-ringed,
 *   per-tech route polylines that dogleg through the depot when a part
 *   pickup is required) with a 400px dispatch column: SLA posture strip,
 *   an incoming-jobs lane, and three tech route lanes (56px stop rows:
 *   sequence dot, site, derived ETA, SLA slack chip, parts chip).
 *   Signature move: selecting a job opens a reroute row listing the other
 *   techs — rerouting re-sorts both routes by due time, redraws both
 *   polylines (Elena's depot dogleg disappears, Marcus's route grows a
 *   leg), and re-derives every downstream ETA, slack chip, parts chip,
 *   and the board's MISS/TIGHT counters; a skill-mismatched target
 *   REFUSES with an inline certification reason instead of moving.
 * @position Page template; emitted by \`astryx template field-service-dispatch-radar\`
 *
 * Frame: root .tpl-field-service-dispatch-radar 100dvh div (\`Layout
 *   height="fill"\` collapses in the demo's auto-height stage) > Layout:
 *   header (56px row) | content (map toolbar → SVG map scroller) | end
 *   dispatch panel 400 (scrolls). Below 920px (fullscreen / 390px embed
 *   only — the inline stage never fires viewport media queries) the end
 *   panel is dropped via useMediaQuery and the dispatch column stacks
 *   under the map in one scroller.
 * Responsive contract (subtraction, not squeeze):
 * - Default stage ≥ ~1045px: full frame — map keeps 1045 − 400 = ~645px
 *   and scales via viewBox; nothing depends on a breakpoint.
 * - <= 920px: dispatch column leaves the end slot and stacks under the
 *   map (useMediaQuery, because Layout owns the slot).
 * - <= 480px: stop rows drop their parts chip and the map legend wraps
 *   (CSS media query — real in the 390px embed iframe and fullscreen).
 * Container policy: dense-tool archetype — panels, lanes, and rows; no
 *   Cards. Job pins, stop rows, and reroute targets are real \`<button>\`s;
 *   the map is one SVG with the pin buttons absolutely positioned over it
 *   so hit targets stay ≥ 40px while the drawing stays vector.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Fieldbeam radar green) as a light-dark() pair with contrast math at
 *   the declaration. Tech route hues ride the repo-standard data-viz
 *   categorical tokens with light-dark() fallbacks (the demo does not
 *   inject them); SLA state hues are light-dark() pairs with math. Text
 *   tokens are --color-text-primary / --color-text-secondary only.
 * Density grid (repeated verbatim): header 56 · posture strip 32 · lane
 *   header 44 · stop rows 56 · reroute targets 40 · dispatch panel 400 ·
 *   map viewBox 800×560 · pin hit targets 40 · 16px page gutter · 12px
 *   lane gutter. fontVariantNumeric: tabular-nums on every clock, slack,
 *   and count.
 * Fixture policy: fixed strings and literal arrays only (see @input).
 *   Everything a reroute can move — ETAs, slack chips, parts chips,
 *   polylines, lane totals, the posture strip — is DERIVED from the one
 *   assignment map each render; nothing derived is ever stored.
 */

import {useMemo, useState} from 'react';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  PackageIcon,
  TimerIcon,
  WarehouseIcon,
  WrenchIcon,
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
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Fieldbeam brand accent (radar green). #177245 on #FFFFFF
// ≈ 5.7:1 (passes 4.5:1 at every size used); #4FE0A1 on the dark body
// (~#1C1C1E) ≈ 9.3:1.
const ACCENT = 'light-dark(#177245, #4FE0A1)';
// Text/glyphs over an ACCENT fill: #FFFFFF on #177245 ≈ 5.7:1;
// #06251A on #4FE0A1 ≈ 8.7:1 (white on #4FE0A1 would fail at ~1.7:1).
const ACCENT_ON = 'light-dark(#FFFFFF, #06251A)';
// Accent wash for selected rows/pins — foreground text on it stays tokens.
const ACCENT_TINT = 'light-dark(rgba(23, 114, 69, 0.10), rgba(79, 224, 161, 0.14))';

// Tech route hues — repo-standard categorical tokens with light-dark()
// fallbacks (the demo does not inject --color-data-categorical-*). Route
// strokes are graphics (≥3:1 floor): all three clear it in both schemes.
const TECH_COLOR = {
  't-priya': 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  't-marcus': 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  't-elena': 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
} as const;
const TECH_TINT = {
  't-priya': 'light-dark(rgba(14, 126, 139, 0.12), rgba(51, 184, 199, 0.18))',
  't-marcus': 'light-dark(rgba(1, 113, 227, 0.12), rgba(76, 158, 255, 0.18))',
  't-elena': 'light-dark(rgba(107, 30, 253, 0.10), rgba(157, 107, 255, 0.18))',
} as const;

// SLA state hues. OK #0B7A38 on #FFFFFF ≈ 5.2:1 / #34C759 on #1C1C1E ≈
// 8.5:1; TIGHT #9A6A00 on #FFFFFF ≈ 4.6:1 / #F0B429 on #1C1C1E ≈ 9.7:1;
// MISS #DC2626 on #FFFFFF ≈ 4.5:1 / #F87171 on #1C1C1E ≈ 6.6:1.
const RISK_OK = 'light-dark(#0B7A38, #34C759)';
const RISK_TIGHT = 'light-dark(#9A6A00, #F0B429)';
const RISK_MISS = 'light-dark(#DC2626, #F87171)';
const RISK_TIGHT_TINT = 'light-dark(rgba(154, 106, 0, 0.10), rgba(240, 180, 41, 0.16))';
const RISK_MISS_TINT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const RISK_OK_TINT = 'light-dark(rgba(11, 122, 56, 0.08), rgba(52, 199, 89, 0.14))';

// Schematic map washes (graphics only — never carry text): park green and
// canal blue at low alpha over the body surface in both schemes.
const PARK_TINT = 'light-dark(rgba(11, 122, 56, 0.10), rgba(52, 199, 89, 0.12))';
const CANAL_TINT = 'light-dark(rgba(1, 113, 227, 0.10), rgba(76, 158, 255, 0.14))';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — every selector scoped under .tpl-field-service-dispatch-radar.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.tpl-field-service-dispatch-radar {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.tpl-field-service-dispatch-radar .fsd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-field-service-dispatch-radar button:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: 2px;
}
.tpl-field-service-dispatch-radar .fsd-num { font-variant-numeric: tabular-nums; }
.tpl-field-service-dispatch-radar .fsd-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header ----------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-header-row {
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
  box-sizing: border-box;
}
.tpl-field-service-dispatch-radar .fsd-brand-mark {
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
.tpl-field-service-dispatch-radar .fsd-clock-chip {
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

/* ---- map region ----------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-map-col {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-field-service-dispatch-radar .fsd-map-col.fsd-map-col-stacked { overflow-y: auto; }
.tpl-field-service-dispatch-radar .fsd-map-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-field-service-dispatch-radar .fsd-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-legend .fsd-swatch {
  display: inline-block;
  width: 14px;
  height: 3px;
  border-radius: 2px;
  margin-right: 5px;
  vertical-align: 3px;
}
.tpl-field-service-dispatch-radar .fsd-legend .fsd-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}
.tpl-field-service-dispatch-radar .fsd-map-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  background: var(--color-background-body);
}
/* The SVG scales to the pane; pin buttons overlay it in the SAME percent
   space so hit targets stay ≥40px at any width. min-width keeps the 390px
   embed legible by allowing a horizontal scroll instead of a squeeze. */
.tpl-field-service-dispatch-radar .fsd-map-stage {
  position: relative;
  min-width: 560px;
}
.tpl-field-service-dispatch-radar .fsd-map-stage svg { display: block; width: 100%; height: auto; }
.tpl-field-service-dispatch-radar .fsd-pin {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.tpl-field-service-dispatch-radar .fsd-pin-core {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2.5px solid var(--color-text-secondary);
  background: var(--color-background-surface);
  box-sizing: border-box;
}
.tpl-field-service-dispatch-radar .fsd-pin[aria-pressed='true'] .fsd-pin-core {
  box-shadow: 0 0 0 3px \${ACCENT_TINT}, 0 0 0 5px \${ACCENT};
}
@media (hover: hover) {
  .tpl-field-service-dispatch-radar .fsd-pin:hover .fsd-pin-core {
    box-shadow: 0 0 0 4px \${ACCENT_TINT};
  }
}
.tpl-field-service-dispatch-radar .fsd-pin-label {
  position: absolute;
  top: 34px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
  padding: 0 4px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}

/* ---- dispatch column -------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-dispatch {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-field-service-dispatch-radar .fsd-dispatch-stacked {
  height: auto;
  border-top: var(--border-width) solid var(--color-border);
}
.tpl-field-service-dispatch-radar .fsd-posture {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  flex-wrap: wrap;
}
.tpl-field-service-dispatch-radar .fsd-posture-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-dispatch-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tpl-field-service-dispatch-radar .fsd-dispatch-stacked .fsd-dispatch-scroll { overflow-y: visible; }

/* ---- lanes ------------------------------------------------------------------ */
.tpl-field-service-dispatch-radar .fsd-lane {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
  overflow: hidden;
}
.tpl-field-service-dispatch-radar .fsd-lane-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  padding: 4px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: 4px solid transparent;
}
.tpl-field-service-dispatch-radar .fsd-lane-title {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-field-service-dispatch-radar .fsd-lane-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Stop rows — 56px, the whole row is the select button. */
.tpl-field-service-dispatch-radar .fsd-stop {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  padding: 6px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-field-service-dispatch-radar .fsd-lane .fsd-stop:last-child { border-bottom: none; }
.tpl-field-service-dispatch-radar .fsd-stop[aria-pressed='true'] { background: \${ACCENT_TINT}; }
@media (hover: hover) {
  .tpl-field-service-dispatch-radar .fsd-stop:hover { background: var(--color-background-muted); }
  .tpl-field-service-dispatch-radar .fsd-stop[aria-pressed='true']:hover { background: \${ACCENT_TINT}; }
}
.tpl-field-service-dispatch-radar .fsd-seq {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-stop-main { min-width: 0; flex: 1; }
.tpl-field-service-dispatch-radar .fsd-stop-site {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-field-service-dispatch-radar .fsd-stop-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-stop-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}
.tpl-field-service-dispatch-radar .fsd-sla-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-sla-ok { color: \${RISK_OK}; background: \${RISK_OK_TINT}; }
.tpl-field-service-dispatch-radar .fsd-sla-tight { color: \${RISK_TIGHT}; background: \${RISK_TIGHT_TINT}; }
.tpl-field-service-dispatch-radar .fsd-sla-miss { color: \${RISK_MISS}; background: \${RISK_MISS_TINT}; }
.tpl-field-service-dispatch-radar .fsd-parts-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-parts-depot { color: \${RISK_TIGHT}; border-color: \${RISK_TIGHT}; }

/* ---- reroute row -------------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-reroute {
  padding: 8px 12px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
}
.tpl-field-service-dispatch-radar .fsd-reroute-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.tpl-field-service-dispatch-radar .fsd-reroute-targets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tpl-field-service-dispatch-radar .fsd-target {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}
.tpl-field-service-dispatch-radar .fsd-target-blocked {
  color: var(--color-text-secondary);
  border-style: dashed;
}
.tpl-field-service-dispatch-radar .fsd-target-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tpl-field-service-dispatch-radar .fsd-refusal {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: \${RISK_MISS};
}
.tpl-field-service-dispatch-radar .fsd-refusal svg { flex-shrink: 0; margin-top: 1px; }

/* ---- responsive subtraction (fires in fullscreen + the 390px embed) ------- */
@media (max-width: 480px) {
  .tpl-field-service-dispatch-radar .fsd-parts-chip { display: none; }
  .tpl-field-service-dispatch-radar .fsd-stop-site { max-width: 150px; }
}
@media (prefers-reduced-motion: no-preference) {
  .tpl-field-service-dispatch-radar .fsd-stop,
  .tpl-field-service-dispatch-radar .fsd-target,
  .tpl-field-service-dispatch-radar .fsd-pin-core {
    transition: background-color 140ms ease, box-shadow 140ms ease;
  }
}
\`;

// ---------------------------------------------------------------------------
// TIME + GRID CONSTANTS — the whole board derives from these four numbers.
// ---------------------------------------------------------------------------

const BOARD_TIME = '13:05';
const BOARD_MIN = 13 * 60 + 5;
/** Travel minutes per grid unit (manhattan distance). */
const MIN_PER_UNIT = 2;
/** Flat depot-pickup penalty when the required part is not on the van.
 * Drawn as a dogleg through the depot pin for legibility; the model is a
 * constant, not depot geometry. */
const DEPOT_MIN = 14;
/** Slack under this many minutes reads TIGHT; negative slack is MISS. */
const TIGHT_BAND = 20;

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

function toClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return \`\${h}:\${String(m).padStart(2, '0')}\`;
}

function slackLabel(slack: number): string {
  return slack < 0 ? \`−\${Math.abs(slack)}m\` : \`+\${slack}m\`;
}

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES — sector NE-4 at board time 13:05 (see @input for
// the hand-checked ETA chains).
// ---------------------------------------------------------------------------

type TechId = keyof typeof TECH_COLOR;
type Skill = 'hvac' | 'refrigeration' | 'electrical';
type PartId = 'CR-220' | 'FM-4' | 'CT-40' | 'TX-9';

const SKILL_LABEL: Record<Skill, string> = {
  hvac: 'HVAC',
  refrigeration: 'Refrigeration',
  electrical: 'Electrical',
};

type Tech = {
  id: TechId;
  name: string;
  unit: string;
  skills: Skill[];
  /** Position at board time (last completed job). */
  pos: {x: number; y: number};
  vanParts: PartId[];
  closedToday: number;
};

const TECHS: Tech[] = [
  {
    id: 't-priya',
    name: 'Priya Raman',
    unit: 'FB-07',
    skills: ['hvac', 'refrigeration'],
    pos: {x: 3, y: 3},
    vanParts: ['CR-220', 'FM-4'],
    closedToday: 3,
  },
  {
    id: 't-marcus',
    name: 'Marcus Bell',
    unit: 'FB-03',
    skills: ['hvac', 'electrical'],
    pos: {x: 14, y: 4},
    vanParts: ['CT-40', 'FM-4'],
    closedToday: 2,
  },
  {
    id: 't-elena',
    name: 'Elena Sosa',
    unit: 'FB-11',
    skills: ['refrigeration', 'electrical'],
    pos: {x: 8, y: 11},
    vanParts: ['CR-220', 'TX-9'],
    closedToday: 2,
  },
];

const TECH_BY_ID = new Map(TECHS.map(tech => [tech.id, tech]));

type Job = {
  id: string;
  site: string;
  symptom: string;
  pos: {x: number; y: number};
  /** SLA due wall-clock — dual field with dueMin below. */
  due: string;
  dueMin: number;
  serviceMin: number;
  skill: Skill;
  part: PartId;
};

function job(
  id: string,
  site: string,
  symptom: string,
  x: number,
  y: number,
  due: string,
  serviceMin: number,
  skill: Skill,
  part: PartId,
): Job {
  return {id, site, symptom, pos: {x, y}, due, dueMin: toMin(due), serviceMin, skill, part};
}

const JOBS: Job[] = [
  job('J-1841', 'Marlowe & Finch Bakery', 'display case at 52°F', 5, 4, '13:50', 35, 'refrigeration', 'CR-220'),
  job('J-1846', 'Northgate Dental Suites', 'RTU short-cycling', 7, 7, '15:30', 40, 'hvac', 'FM-4'),
  job('J-1843', 'Beacon Storage — Unit 4', 'gate controller dead', 16, 6, '13:40', 25, 'electrical', 'CT-40'),
  job('J-1847', 'Aldergate Offices RTU-2', 'no cooling, floors 3–5', 18, 9, '16:00', 45, 'hvac', 'FM-4'),
  job('J-1842', 'Verano Grocery walk-in', 'walk-in at 46°F, rising', 9, 9, '13:45', 45, 'refrigeration', 'CR-220'),
  job('J-1845', 'Pier 9 Icehouse', 'brine loop pressure fault', 4, 12, '14:30', 30, 'refrigeration', 'TX-9'),
  job('J-1849', 'Cobalt Labs server room', 'CRAC unit breaker trips', 13, 12, '15:00', 35, 'electrical', 'CT-40'),
  job(
    'J-1850',
    'The Wintergarden Conservatory at Halloran Municipal Park — Annex B',
    'misting chiller offline',
    11,
    3,
    '16:30',
    30,
    'refrigeration',
    'CR-220',
  ),
];

const JOB_BY_ID = new Map(JOBS.map(item => [item.id, item]));

type Assignment = TechId | 'incoming';

/** The ONE state seed: everything else (ETAs, slack, chips, polylines,
 * posture counts) derives from this map each render. */
const INITIAL_ASSIGNMENTS: Record<string, Assignment> = {
  'J-1841': 't-priya',
  'J-1846': 't-priya',
  'J-1843': 't-marcus',
  'J-1847': 't-marcus',
  'J-1842': 't-elena',
  'J-1845': 't-elena',
  'J-1849': 't-elena',
  'J-1850': 'incoming',
};

// ---------------------------------------------------------------------------
// ROUTE DERIVATION — pure functions of (tech, job list).
// ---------------------------------------------------------------------------

type Risk = 'ok' | 'tight' | 'miss';

type Stop = {
  job: Job;
  seq: number;
  travelMin: number;
  needsDepot: boolean;
  arriveMin: number;
  departMin: number;
  slackMin: number;
  risk: Risk;
};

function riskOf(slack: number): Risk {
  if (slack < 0) {
    return 'miss';
  }
  return slack < TIGHT_BAND ? 'tight' : 'ok';
}

/** Visits jobs in SLA-due order from the tech's board-time position. */
function deriveRoute(tech: Tech, jobs: Job[]): Stop[] {
  const ordered = [...jobs].sort((a, b) => a.dueMin - b.dueMin);
  let pos = tech.pos;
  let clock = BOARD_MIN;
  return ordered.map((item, index) => {
    const travelMin =
      (Math.abs(pos.x - item.pos.x) + Math.abs(pos.y - item.pos.y)) * MIN_PER_UNIT;
    const needsDepot = !tech.vanParts.includes(item.part);
    const arriveMin = clock + travelMin + (needsDepot ? DEPOT_MIN : 0);
    const departMin = arriveMin + item.serviceMin;
    const slackMin = item.dueMin - arriveMin;
    pos = item.pos;
    clock = departMin;
    return {
      job: item,
      seq: index + 1,
      travelMin,
      needsDepot,
      arriveMin,
      departMin,
      slackMin,
      risk: riskOf(slackMin),
    };
  });
}

type Board = {
  routes: Record<TechId, Stop[]>;
  incoming: Job[];
  stopByJobId: Map<string, {techId: TechId; stop: Stop}>;
  counts: Record<Risk, number>;
};

function deriveBoard(assignments: Record<string, Assignment>): Board {
  const routes = {} as Record<TechId, Stop[]>;
  const stopByJobId = new Map<string, {techId: TechId; stop: Stop}>();
  const counts: Record<Risk, number> = {ok: 0, tight: 0, miss: 0};
  for (const tech of TECHS) {
    const jobs = JOBS.filter(item => assignments[item.id] === tech.id);
    const stops = deriveRoute(tech, jobs);
    routes[tech.id] = stops;
    for (const stop of stops) {
      stopByJobId.set(stop.job.id, {techId: tech.id, stop});
      counts[stop.risk] += 1;
    }
  }
  const incoming = JOBS.filter(item => assignments[item.id] === 'incoming');
  return {routes, incoming, stopByJobId, counts};
}

/** Hypothetical: where would \`movedJob\` land on \`tech\`'s route? Used for the
 * reroute-target previews and the announcement copy. */
function previewStop(
  tech: Tech,
  movedJob: Job,
  assignments: Record<string, Assignment>,
): Stop | undefined {
  const jobs = JOBS.filter(
    item => item.id === movedJob.id || assignments[item.id] === tech.id,
  );
  const stops = deriveRoute(tech, jobs);
  return stops.find(stop => stop.job.id === movedJob.id);
}

// ---------------------------------------------------------------------------
// MAP GEOMETRY — viewBox 800×560; unit (x,y) → px (20 + 38x, 20 + 38y).
// The pin overlay uses the same mapping expressed in percent so the HTML
// hit targets track the scaled SVG exactly.
// ---------------------------------------------------------------------------

const MAP_W = 800;
const MAP_H = 560;
const CELL = 38;
const PAD = 20;

function px(unit: number): number {
  return PAD + unit * CELL;
}

function pctX(unit: number): string {
  return \`\${((px(unit) / MAP_W) * 100).toFixed(3)}%\`;
}

function pctY(unit: number): string {
  return \`\${((px(unit) / MAP_H) * 100).toFixed(3)}%\`;
}

const DEPOT_POS = {x: 10, y: 7};

type RouteLeg = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed: boolean;
};

/** Expands a tech's route into drawable legs, inserting the depot dogleg
 * ahead of any stop that needs a part pickup. */
function routeLegs(tech: Tech, stops: Stop[]): RouteLeg[] {
  const legs: RouteLeg[] = [];
  let from = tech.pos;
  for (const stop of stops) {
    if (stop.needsDepot) {
      legs.push({x1: from.x, y1: from.y, x2: DEPOT_POS.x, y2: DEPOT_POS.y, dashed: true});
      legs.push({
        x1: DEPOT_POS.x,
        y1: DEPOT_POS.y,
        x2: stop.job.pos.x,
        y2: stop.job.pos.y,
        dashed: true,
      });
    } else {
      legs.push({x1: from.x, y1: from.y, x2: stop.job.pos.x, y2: stop.job.pos.y, dashed: false});
    }
    from = stop.job.pos;
  }
  return legs;
}

const RISK_COLOR: Record<Risk, string> = {ok: RISK_OK, tight: RISK_TIGHT, miss: RISK_MISS};

// ---------------------------------------------------------------------------
// BRAND MARK — radar ring with a sweep wedge and a blip. currentColor only.
// ---------------------------------------------------------------------------

function FieldbeamMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9 L9 2 A7 7 0 0 1 15.06 5.5 Z" fill="currentColor" opacity="0.85" />
      <circle cx="12.1" cy="11.8" r="1.7" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TERRITORY MAP — schematic SVG + overlaid pin buttons.
// ---------------------------------------------------------------------------

function TerritoryMap({
  board,
  selectedJobId,
  onSelectJob,
}: {
  board: Board;
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
}) {
  return (
    <div className="fsd-map-stage">
      <svg
        viewBox={\`0 0 \${MAP_W} \${MAP_H}\`}
        role="img"
        aria-label="Schematic map of sector NE-4 with technician routes and job pins">
        {/* street grid */}
        {Array.from({length: 21}, (_, i) => (
          <line
            key={\`v\${i}\`}
            x1={px(i)}
            y1={PAD}
            x2={px(i)}
            y2={MAP_H - PAD}
            stroke="var(--color-border)"
            strokeWidth={i % 5 === 0 ? 1.4 : 0.6}
          />
        ))}
        {Array.from({length: 15}, (_, i) => (
          <line
            key={\`h\${i}\`}
            x1={PAD}
            y1={px(i)}
            x2={MAP_W - PAD}
            y2={px(i)}
            stroke="var(--color-border)"
            strokeWidth={i % 5 === 0 ? 1.4 : 0.6}
          />
        ))}
        {/* Halloran Municipal Park (J-1850's conservatory sits inside it) */}
        <rect
          x={px(9.5)}
          y={px(1.5)}
          width={3 * CELL}
          height={3 * CELL}
          rx={12}
          fill={PARK_TINT}
        />
        <text
          x={px(11)}
          y={px(1.5) + 16}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="var(--color-text-secondary)">
          Halloran Park
        </text>
        {/* Quayle Canal band along the south edge */}
        <rect x={PAD} y={px(12.8)} width={MAP_W - PAD * 2} height={1.2 * CELL} fill={CANAL_TINT} />
        <text
          x={PAD + 10}
          y={px(12.8) + 26}
          fontSize="10"
          fontWeight="600"
          fill="var(--color-text-secondary)">
          Quayle Canal
        </text>
        {/* route polylines (depot doglegs dashed) */}
        {TECHS.map(tech =>
          routeLegs(tech, board.routes[tech.id]).map((leg, index) => (
            <line
              key={\`\${tech.id}-leg\${index}\`}
              x1={px(leg.x1)}
              y1={px(leg.y1)}
              x2={px(leg.x2)}
              y2={px(leg.y2)}
              stroke={TECH_COLOR[tech.id]}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={leg.dashed ? '7 5' : undefined}
            />
          )),
        )}
        {/* parts depot */}
        <g>
          <rect
            x={px(DEPOT_POS.x) - 9}
            y={px(DEPOT_POS.y) - 9}
            width={18}
            height={18}
            rx={4}
            fill="var(--color-background-surface)"
            stroke="var(--color-text-secondary)"
            strokeWidth={1.6}
          />
          <path
            d={\`M \${px(DEPOT_POS.x) - 5} \${px(DEPOT_POS.y) + 4} V \${px(DEPOT_POS.y) - 1} H \${
              px(DEPOT_POS.x) + 5
            } V \${px(DEPOT_POS.y) + 4} M \${px(DEPOT_POS.x) - 8} \${px(DEPOT_POS.y) - 1} L \${px(
              DEPOT_POS.x,
            )} \${px(DEPOT_POS.y) - 6} L \${px(DEPOT_POS.x) + 8} \${px(DEPOT_POS.y) - 1}\`}
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <text
            x={px(DEPOT_POS.x)}
            y={px(DEPOT_POS.y) + 24}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--color-text-secondary)">
            Parts depot
          </text>
        </g>
        {/* tech diamonds */}
        {TECHS.map(tech => (
          <g key={\`marker-\${tech.id}\`}>
            <rect
              x={px(tech.pos.x) - 7}
              y={px(tech.pos.y) - 7}
              width={14}
              height={14}
              rx={3}
              transform={\`rotate(45 \${px(tech.pos.x)} \${px(tech.pos.y)})\`}
              fill={TECH_COLOR[tech.id]}
              stroke="var(--color-background-body)"
              strokeWidth={2}
            />
            <text
              x={px(tech.pos.x)}
              y={px(tech.pos.y) - 14}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="var(--color-text-secondary)">
              {tech.unit}
            </text>
          </g>
        ))}
      </svg>
      {/* pin overlay — real buttons, ≥40px targets, risk-ringed cores */}
      {JOBS.map(item => {
        const placed = board.stopByJobId.get(item.id);
        const ringColor =
          placed !== undefined ? RISK_COLOR[placed.stop.risk] : 'var(--color-text-secondary)';
        const statusText =
          placed !== undefined
            ? \`assigned to \${TECH_BY_ID.get(placed.techId)?.name ?? ''}, arrives \${toClock(
                placed.stop.arriveMin,
              )}, \${
                placed.stop.slackMin < 0
                  ? \`\${Math.abs(placed.stop.slackMin)} minutes past SLA\`
                  : \`\${placed.stop.slackMin} minutes inside SLA\`
              }\`
            : 'incoming, unassigned';
        return (
          <button
            key={\`pin-\${item.id}\`}
            type="button"
            className="fsd-btn fsd-pin"
            style={{left: pctX(item.pos.x), top: pctY(item.pos.y)}}
            aria-pressed={selectedJobId === item.id}
            aria-label={\`\${item.id} — \${item.site}: \${statusText}. Select to reroute.\`}
            onClick={() => onSelectJob(item.id)}>
            <span className="fsd-pin-core" style={{borderColor: ringColor}} />
            <span className="fsd-pin-label" aria-hidden="true">
              {item.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DISPATCH-COLUMN PIECES — purely presentational; state lives in the page.
// ---------------------------------------------------------------------------

function SlaChip({dueMin, slackMin, risk}: {dueMin: number; slackMin: number; risk: Risk}) {
  const className =
    risk === 'miss' ? 'fsd-sla-chip fsd-sla-miss' : risk === 'tight' ? 'fsd-sla-chip fsd-sla-tight' : 'fsd-sla-chip fsd-sla-ok';
  return (
    <span className={className}>
      {risk === 'miss' && <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />}
      due {toClock(dueMin)} · {slackLabel(slackMin)}
    </span>
  );
}

function PartsChip({partId, onVan, needsDepot}: {partId: PartId; onVan: boolean; needsDepot: boolean}) {
  if (needsDepot) {
    return (
      <Tooltip content={\`\${partId} is not on this van — the route doglegs through the parts depot (+\${DEPOT_MIN}m).\`}>
        <span className="fsd-parts-chip fsd-parts-depot">
          <Icon icon={PackageIcon} size="xsm" color="inherit" />
          {partId} · depot +{DEPOT_MIN}m
        </span>
      </Tooltip>
    );
  }
  return (
    <span className="fsd-parts-chip">
      <Icon icon={PackageIcon} size="xsm" color="inherit" />
      {partId} · {onVan ? 'on van' : 'needed'}
    </span>
  );
}

type Refusal = {jobId: string; techId: TechId; reason: string};

function RerouteRow({
  jobItem,
  currentTechId,
  assignments,
  refusal,
  onReroute,
}: {
  jobItem: Job;
  currentTechId: TechId | null;
  assignments: Record<string, Assignment>;
  refusal: Refusal | null;
  onReroute: (jobId: string, techId: TechId) => void;
}) {
  const targets = TECHS.filter(tech => tech.id !== currentTechId);
  return (
    <div className="fsd-reroute">
      <div className="fsd-reroute-title">
        {currentTechId === null ? 'Assign to' : 'Reroute to'} — {jobItem.id} ·{' '}
        {SKILL_LABEL[jobItem.skill]} · needs {jobItem.part}
      </div>
      <div className="fsd-reroute-targets">
        {targets.map(tech => {
          const certified = tech.skills.includes(jobItem.skill);
          if (!certified) {
            return (
              <button
                key={tech.id}
                type="button"
                className="fsd-target fsd-target-blocked"
                aria-label={\`\${tech.name} is not \${SKILL_LABEL[jobItem.skill]}-certified — selecting explains the refusal\`}
                onClick={() => onReroute(jobItem.id, tech.id)}>
                <span className="fsd-target-dot" style={{background: TECH_COLOR[tech.id]}} />
                {tech.name} · not {SKILL_LABEL[jobItem.skill]}-certified
              </button>
            );
          }
          const preview = previewStop(tech, jobItem, assignments);
          const previewText =
            preview !== undefined
              ? \`arr \${toClock(preview.arriveMin)} · \${slackLabel(preview.slackMin)}\${
                  preview.needsDepot ? \` · depot +\${DEPOT_MIN}m\` : ''
                }\`
              : '';
          return (
            <button
              key={tech.id}
              type="button"
              className="fsd-target"
              aria-label={\`Move \${jobItem.id} to \${tech.name} — projected arrival \${
                preview !== undefined ? toClock(preview.arriveMin) : 'unknown'
              }\`}
              onClick={() => onReroute(jobItem.id, tech.id)}>
              <span className="fsd-target-dot" style={{background: TECH_COLOR[tech.id]}} />
              {tech.name}
              <Icon icon={ArrowRightIcon} size="xsm" color="inherit" />
              <span className="fsd-num">{previewText}</span>
            </button>
          );
        })}
      </div>
      {refusal !== null && refusal.jobId === jobItem.id && (
        <div className="fsd-refusal" role="status">
          <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
          {refusal.reason}
        </div>
      )}
    </div>
  );
}

function StopRow({
  stop,
  isSelected,
  onVan,
  onSelect,
}: {
  stop: Stop;
  isSelected: boolean;
  onVan: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className="fsd-btn fsd-stop"
      aria-pressed={isSelected}
      aria-expanded={isSelected}
      aria-label={\`\${stop.job.id} — \${stop.job.site}: arrives \${toClock(stop.arriveMin)}, due \${
        stop.job.due
      }, \${
        stop.slackMin < 0
          ? \`\${Math.abs(stop.slackMin)} minutes past SLA\`
          : \`\${stop.slackMin} minutes of slack\`
      }. Select to reroute.\`}
      onClick={() => onSelect(stop.job.id)}>
      <span className="fsd-seq">{stop.seq}</span>
      <span className="fsd-stop-main">
        <span className="fsd-stop-site">{stop.job.site}</span>
        <span className="fsd-stop-meta">
          {stop.job.id} · {stop.job.symptom} · svc {stop.job.serviceMin}m · travel{' '}
          {stop.travelMin}m
        </span>
      </span>
      <span className="fsd-stop-end">
        <span className="fsd-num" style={{fontSize: 12, fontWeight: 700}}>
          arr {toClock(stop.arriveMin)}
        </span>
        <SlaChip dueMin={stop.job.dueMin} slackMin={stop.slackMin} risk={stop.risk} />
        <PartsChip partId={stop.job.part} onVan={onVan} needsDepot={stop.needsDepot} />
      </span>
    </button>
  );
}

function IncomingRow({
  jobItem,
  isSelected,
  onSelect,
}: {
  jobItem: Job;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const untilDue = jobItem.dueMin - BOARD_MIN;
  return (
    <button
      type="button"
      className="fsd-btn fsd-stop"
      aria-pressed={isSelected}
      aria-expanded={isSelected}
      aria-label={\`\${jobItem.id} — \${jobItem.site}: unassigned, due \${jobItem.due}. Select to assign a tech.\`}
      onClick={() => onSelect(jobItem.id)}>
      <span className="fsd-seq">·</span>
      <span className="fsd-stop-main">
        <span className="fsd-stop-site">{jobItem.site}</span>
        <span className="fsd-stop-meta">
          {jobItem.id} · {jobItem.symptom} · {SKILL_LABEL[jobItem.skill]} · svc{' '}
          {jobItem.serviceMin}m
        </span>
      </span>
      <span className="fsd-stop-end">
        <span className="fsd-num" style={{fontSize: 12, fontWeight: 700}}>
          due in {untilDue}m
        </span>
        <SlaChip dueMin={jobItem.dueMin} slackMin={untilDue} risk={riskOf(untilDue)} />
        <PartsChip partId={jobItem.part} onVan={false} needsDepot={false} />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function FieldServiceDispatchRadarTemplate() {
  // Layout owns the end slot, so stacking the dispatch column below the map
  // is a JS media query (fires in fullscreen and the 390px embed only).
  const isStacked = useMediaQuery('(max-width: 920px)');

  // ---- the single state owner ---------------------------------------------
  const [assignments, setAssignments] =
    useState<Record<string, Assignment>>(INITIAL_ASSIGNMENTS);
  const [selectedJobId, setSelectedJobId] = useState<string | null>('J-1849');
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // ---- derived board: routes, ETAs, risk counts, polylines ------------------
  const board = useMemo(() => deriveBoard(assignments), [assignments]);
  const closedToday = TECHS.reduce((sum, tech) => sum + tech.closedToday, 0);

  // ---- handlers ---------------------------------------------------------------
  const handleSelectJob = (id: string) => {
    setRefusal(null);
    setSelectedJobId(prev => (prev === id ? null : id));
  };

  const handleReroute = (jobId: string, techId: TechId) => {
    const jobItem = JOB_BY_ID.get(jobId);
    const tech = TECH_BY_ID.get(techId);
    if (jobItem === undefined || tech === undefined) {
      return;
    }
    if (!tech.skills.includes(jobItem.skill)) {
      const reason = \`\${tech.name} (\${tech.unit}) is not \${
        SKILL_LABEL[jobItem.skill]
      }-certified — reroute blocked. \${jobItem.id} stays put.\`;
      setRefusal({jobId, techId, reason});
      setAnnouncement(reason);
      return;
    }
    const wasIncoming = assignments[jobId] === 'incoming';
    const preview = previewStop(tech, jobItem, assignments);
    setAssignments(prev => ({...prev, [jobId]: techId}));
    setRefusal(null);
    if (preview !== undefined) {
      setAnnouncement(
        \`\${jobId} \${wasIncoming ? 'assigned' : 'rerouted'} to \${tech.name} — arrives \${toClock(
          preview.arriveMin,
        )}, \${
          preview.slackMin < 0
            ? \`\${Math.abs(preview.slackMin)} minutes past SLA\`
            : \`\${preview.slackMin} minutes inside SLA\`
        }\${preview.needsDepot ? \`, includes a \${DEPOT_MIN}-minute depot pickup\` : ''}. Routes redrawn.\`,
      );
    }
  };

  const selectedAssignment = selectedJobId !== null ? assignments[selectedJobId] : undefined;

  // ---- header --------------------------------------------------------------------
  const header = (
    <LayoutHeader>
      <div className="fsd-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <span className="fsd-brand-mark">
            <FieldbeamMark />
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>Fieldbeam</Heading>
                <Badge label="Sector NE-4" variant="neutral" />
                <Badge label="Harborline grid" variant="neutral" />
              </HStack>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                3 techs on shift · {JOBS.length} open jobs · {closedToday} closed today
              </Text>
            </VStack>
          </StackItem>
          <span className="fsd-clock-chip">
            <Icon icon={TimerIcon} size="xsm" color="inherit" />
            Board {BOARD_TIME}
          </span>
        </HStack>
      </div>
    </LayoutHeader>
  );

  // ---- map region ------------------------------------------------------------------
  const mapToolbar = (
    <div className="fsd-map-toolbar">
      <Text type="label">Territory — schematic</Text>
      <StackItem size="fill" />
      <div className="fsd-legend" aria-label="Map legend">
        {TECHS.map(tech => (
          <span key={\`legend-\${tech.id}\`}>
            <span className="fsd-swatch" style={{background: TECH_COLOR[tech.id]}} />
            {tech.unit}
          </span>
        ))}
        <span>
          <span className="fsd-dot" style={{background: RISK_MISS}} />
          SLA risk
        </span>
        <span>
          <Icon icon={WarehouseIcon} size="xsm" color="inherit" />
          &nbsp;dashed = depot pickup +{DEPOT_MIN}m
        </span>
      </div>
    </div>
  );

  const mapRegion = (
    <div className="fsd-map-scroll">
      <TerritoryMap board={board} selectedJobId={selectedJobId} onSelectJob={handleSelectJob} />
    </div>
  );

  // ---- dispatch column ----------------------------------------------------------------
  const postureStrip = (
    <div className="fsd-posture">
      <span className="fsd-posture-chip fsd-sla-ok">
        <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
        {board.counts.ok} on track
      </span>
      <span className="fsd-posture-chip fsd-sla-tight">
        <Icon icon={TimerIcon} size="xsm" color="inherit" />
        {board.counts.tight} tight
      </span>
      <span className="fsd-posture-chip fsd-sla-miss">
        <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
        {board.counts.miss} at risk
      </span>
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {board.incoming.length} incoming
      </Text>
    </div>
  );

  const dispatchColumn = (
    <div className={\`fsd-dispatch\${isStacked ? ' fsd-dispatch-stacked' : ''}\`}>
      {postureStrip}
      <div className="fsd-dispatch-scroll">
        {board.incoming.length > 0 && (
          <div className="fsd-lane">
            <div className="fsd-lane-header">
              <StackItem size="fill" style={{minWidth: 0}}>
                <div className="fsd-lane-title">Incoming — unassigned</div>
                <div className="fsd-lane-sub">
                  {board.incoming.length} job{board.incoming.length === 1 ? '' : 's'} awaiting
                  dispatch
                </div>
              </StackItem>
              <Badge label={String(board.incoming.length)} variant="neutral" />
            </div>
            {board.incoming.map(jobItem => (
              <div key={jobItem.id}>
                <IncomingRow
                  jobItem={jobItem}
                  isSelected={selectedJobId === jobItem.id}
                  onSelect={handleSelectJob}
                />
                {selectedJobId === jobItem.id && (
                  <RerouteRow
                    jobItem={jobItem}
                    currentTechId={null}
                    assignments={assignments}
                    refusal={refusal}
                    onReroute={handleReroute}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {TECHS.map(tech => {
          const stops = board.routes[tech.id];
          const lastDepart = stops.length > 0 ? stops[stops.length - 1].departMin : BOARD_MIN;
          return (
            <div className="fsd-lane" key={\`lane-\${tech.id}\`}>
              <div className="fsd-lane-header" style={{borderLeftColor: TECH_COLOR[tech.id]}}>
                <StackItem size="fill" style={{minWidth: 0}}>
                  <HStack gap={2} vAlign="center">
                    <span className="fsd-lane-title">{tech.name}</span>
                    <Badge label={tech.unit} variant="neutral" />
                  </HStack>
                  <div className="fsd-lane-sub">
                    {stops.length} stop{stops.length === 1 ? '' : 's'} · clear{' '}
                    {toClock(lastDepart)} · {tech.closedToday} closed today
                  </div>
                </StackItem>
                <HStack gap={1} vAlign="center">
                  {tech.skills.map(skill => (
                    <span key={skill} className="fsd-skill-chip">
                      <Icon icon={WrenchIcon} size="xsm" color="inherit" />
                      {SKILL_LABEL[skill]}
                    </span>
                  ))}
                </HStack>
              </div>
              {stops.length === 0 ? (
                <div style={{padding: '12px'}}>
                  <Text type="supporting" color="secondary">
                    No stops — available for dispatch.
                  </Text>
                </div>
              ) : (
                stops.map(stop => (
                  <div key={stop.job.id}>
                    <StopRow
                      stop={stop}
                      isSelected={selectedJobId === stop.job.id}
                      onVan={tech.vanParts.includes(stop.job.part)}
                      onSelect={handleSelectJob}
                    />
                    {selectedJobId === stop.job.id && selectedAssignment === tech.id && (
                      <RerouteRow
                        jobItem={stop.job}
                        currentTechId={tech.id}
                        assignments={assignments}
                        refusal={refusal}
                        onReroute={handleReroute}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---- frame -------------------------------------------------------------------------
  return (
    <div className="tpl-field-service-dispatch-radar">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className={\`fsd-map-col\${isStacked ? ' fsd-map-col-stacked' : ''}\`}>
              <div aria-live="polite" className="fsd-visually-hidden">
                {announcement}
              </div>
              {mapToolbar}
              {mapRegion}
              {isStacked && dispatchColumn}
            </div>
          </LayoutContent>
        }
        end={
          isStacked ? undefined : (
            <LayoutPanel width={400} padding={0} hasDivider label="Dispatch queues">
              {dispatchColumn}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};