// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Ampara's depot operator console for
 *   Alvarado Depot TX-04: one 750 kVA transformer shared by three feeders
 *   (FDR-A "West Canopy" 250 kW, FDR-B "East Canopy (breaker QB-2, 400 A)"
 *   250 kW, FDR-C "Overflow Pad" 180 kW) and 16 stalls A1–A6, B1–B6,
 *   C1–C4. Every kW field is dual (requestedKw: 80 + requestedKwLabel:
 *   '80 kW'); session curves are literal point arrays; the suite "now" is
 *   14:32 site time and every timestamp is a pre-computed string. No
 *   Date.now(), no Math.random(), no network assets. Charging demand sums
 *   to exactly 512 kW so nothing is curtailed at the default 600 kW cap.
 * @output EV Site Power Console — a shared-budget depot surface: a 280px
 *   feeder rail with the Ampara mark, 36px feeder rows, a 248x300
 *   PowerBudgetLadder (0–750 kW plot, solid XFMR 750 line, dashed movable
 *   site-cap line, stacked feeder blocks, hatched reserve band, amber
 *   curtailment band); a main column with a 52px header (detented
 *   PowerCapSlider 200–750 kW + TariffChip + operator avatar), a 40px
 *   filter row (All/Charging/Curtailed/Faulted Segmented with live counts
 *   + search), and a stall canvas of 72px StallTiles grouped by feeder —
 *   each tile led by a 44px StallStateGlyph (SOC arc, connector
 *   silhouette, fault notch, curtailment striping); and a 360px stall
 *   detail aside with an annotated SessionCurveStrip, a power-attribution
 *   table, and Pause/Clear-fault actions. Dragging the cap 600→400
 *   deterministically re-allocates per-stall shares and every surface —
 *   tiles, ladder, feeder rows, rail footer, aside — reacts at once.
 * @position Page template; emitted by `astryx template ev-site-power-console`
 *
 * Density grid (FIXED NUMBERS, verbatim): header bar 52px; filter row
 *   40px; rail 280px fixed; aside 360px fixed; stall tiles 72px tall
 *   (grid auto-fill minmax(150px,1fr)); feeder group header rows 32px;
 *   rail feeder list rows 36px; aside attribution rows 36px; heavy action
 *   rows 44px; aside footer 56px; ONE gutter token GUTTER = 12px for all
 *   grid gaps and panel padding (panel padding 16px = GUTTER+4 only on
 *   the aside body); 8px radius on tiles/panels, 6px on chips.
 *
 * Frame: root 100dvh div > Layout height="fill" > LayoutContent padding 0
 *   > view root (flex row, height 100%, minHeight 0, overflow hidden,
 *   ResizeObserver ref) > [rail 280] | [main column flex:1 minWidth:0] |
 *   [aside 360]. No other top-level panels.
 * Corner map — TL: rail header (Ampara mark + depot identity). TR: main
 *   header right end (TariffChip, then operator avatar RA). BL: rail
 *   footer transformer line '512 kW allocated · 600 kW cap · 750 kVA
 *   xfmr' (tabular, cross-checks the ladder). BR: aside footer action
 *   Buttons ('Pause session'; 'Clear fault' only when faultCode).
 * Container policy: dense tool surface — bordered panes, rows, rails, and
 *   a working detail pane; no Cards. Stall tiles and feeder rows are real
 *   <button>s; ladder feeder blocks and curve flags are focusable SVG
 *   role="button" nodes.
 * Color policy: token-pure chrome. ONE quarantined brand literal (Ampara
 *   teal #0FB5AE) — FILL ONLY: ~2.3:1 on white fails 4.5:1 text contrast,
 *   so it colors the mark and the slider fill, never text. Amber has
 *   separate FILL and TEXT values: #EB6E00 on white is ~3.6:1 (fails) so
 *   curtailed kW text uses #B54708 (~5.9:1, passes); dark sides shift to
 *   the lighter 300–400-weight hue. Danger red #DC2626 on white ≈ 4.5:1.
 *   Feeder hues use the repo-standard data-viz categorical fallbacks.
 *   Color is never the sole channel: curtailment = hatch + '−n kW' text;
 *   fault = arc notch + code text; offline = all-muted glyph + prose.
 *
 * Responsive contract (subtraction, not reflow). Breakpoints key off the
 * VIEW ROOT's own width via ResizeObserver — the demo stage renders this
 * page in a ~1045–1075px container inside a 1440px window, so viewport
 * queries never fire there; viewport queries remain only as the width-0
 * first-frame fallback:
 * - >= 1080px: full 280 rail + main + 360 aside (ladder 248 wide).
 * - 960–1079px: rail 280→224 (ladder rescales to 192 wide), aside
 *   360→320. THE DEMO STAGE LANDS HERE — designed first.
 * - 840–959px: rail collapses to a 64px icon strip (feeder initials as
 *   36px buttons, ladder hidden); the rail-footer total moves into the
 *   main header as a chip. Below 960 the slider drops its visible 'Site
 *   cap' label (aria-label retains it). The header never wraps.
 * - < 840px: aside removed; selecting a stall opens a DS Dialog (the DS
 *   ships no Sheet/Drawer) at 360px with identical aside content.
 * Escape layering: only the < 840px stall Dialog overlays this page — the
 * DS Dialog owns Escape and focus restoration; nothing else traps focus.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {PauseIcon, PlayIcon, SearchIcon, TriangleAlertIcon, ZapIcon} from 'lucide-react';

import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// ONE quarantined brand literal: Ampara teal. FILL ONLY — #0FB5AE on white is
// ~2.3:1, so it never colors text; it fills the header mark and the slider
// track fill, both non-text shapes.
const AMPARA_TEAL = 'light-dark(#0FB5AE, #3BD2CB)';
// Curtailment FILL amber (hatch lines, flag rects, ladder band). #EB6E00 on
// white is ~3.6:1 — fails 4.5:1 as text, so see AMBER_TEXT below.
const AMBER = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
// Curtailment TEXT amber: #B54708 on white ≈ 5.9:1 (passes 4.5:1); #FFB566
// passes comfortably on the dark surface.
const AMBER_TEXT = 'light-dark(#B54708, #FFB566)';
const AMBER_SOFT = 'light-dark(rgba(235, 110, 0, 0.10), rgba(255, 147, 48, 0.16))';
// Fault / danger red — #DC2626 on white ≈ 4.5:1; #F87171 passes on dark.
const RED = 'light-dark(#DC2626, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Feeder hues for ladder blocks and group accents (fill-weight duty only).
const FEEDER_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const FEEDER_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const FEEDER_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Density constants — see the header comment for the full verbatim grid.
const GUTTER = 12; // the ONE gutter value: all grid gaps + panel padding

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the color/opacity transitions. Transitions animate
// color/opacity only (ladder rects and arc sweeps snap — geometry never
// tweens); everything collapses under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const EVS_CSS = `
.evs-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
svg .evs-focusable:focus-visible {
  outline: none;
  stroke: var(--color-accent);
  stroke-width: 2px;
}
.evs-anim {
  transition: color 150ms ease, opacity 150ms ease, background-color 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .evs-anim { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

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
  // Rail — 280px fixed (224 in the 960–1079 band; 64 icon strip 840–959).
  rail: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  // 52px rail brand header (TL corner owner).
  railHeader: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: `0 ${GUTTER}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: `${GUTTER}px 0`},
  // 36px rail feeder rows.
  feederRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 36,
    padding: `0 ${GUTTER}px`,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  feederRowSelected: {backgroundColor: 'var(--color-background-muted)'},
  feederSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  feederRowLabel: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 12,
  },
  feederRowKw: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  ladderBlock: {padding: `${GUTTER}px ${GUTTER}px 0`},
  ladderCaption: {
    display: 'block',
    marginTop: 4,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Rail footer (BL corner owner) — transformer cross-check line.
  railFooter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    minHeight: 44, // heavy action row height
    padding: `0 ${GUTTER}px`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 840–959 band: rail as 64px icon strip of 36px feeder-initial buttons.
  railStrip: {
    width: 64,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: GUTTER,
    borderRight: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  railStripButton: {
    width: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    color: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  // Main column ----------------------------------------------------------
  main: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0},
  // 52px main header bar.
  mainHeader: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: `0 ${GUTTER}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden', // the bar subtracts segments; it never paints over the aside
  },
  // 40px filter row.
  filterRow: {
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: `0 ${GUTTER}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  searchBox: {flex: '1 1 140px', minWidth: 90, maxWidth: 220},
  canvas: {flex: 1, minHeight: 0, overflowY: 'auto', padding: GUTTER},
  // 32px feeder group header rows.
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 32,
    padding: '0 4px',
    borderRadius: 6,
  },
  groupHeaderSelected: {backgroundColor: 'var(--color-background-muted)'},
  groupHeaderKw: {
    marginInlineStart: 'auto',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: GUTTER,
    paddingBottom: GUTTER,
  },
  // 72px stall tiles.
  tile: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 10px',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    minWidth: 0,
  },
  // Selected: 2px inset accent ring.
  tileSelected: {boxShadow: 'inset 0 0 0 2px var(--color-accent)'},
  tileCol: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  tileRow1: {display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0},
  tileId: {fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'},
  tileConnector: {
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tileKw: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    whiteSpace: 'nowrap',
  },
  tileKwCurtailed: {color: AMBER_TEXT},
  // Row 3: single-line ellipsis — STALL_B2's firmware-suffixed vehicle
  // string is the truncation stress fixture for this line.
  tileVehicle: {
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emptyGroupNote: {padding: '4px 4px 12px', fontSize: 11, color: 'var(--color-text-secondary)'},
  // Aside ------------------------------------------------------------------
  aside: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  // 52px aside header.
  asideHeader: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: `0 ${GUTTER + 4}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Aside body: the ONE 16px (= GUTTER+4) padding exception.
  asideBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: GUTTER + 4,
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
  },
  asideVehicleRow: {display: 'flex', alignItems: 'center', gap: GUTTER, minWidth: 0},
  asideVehicleText: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  asideSectionLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  sessionMeta: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  // 36px attribution rows.
  attrRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 36,
    padding: '0 8px',
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    borderRadius: 0,
  },
  attrRowInteractive: {cursor: 'pointer'},
  attrRowFocused: {backgroundColor: AMBER_SOFT},
  attrLabel: {flex: 1, minWidth: 0, fontSize: 12},
  attrValue: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  // 44px heavy total row closes the attribution table.
  attrTotalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    padding: '0 8px',
    fontWeight: 600,
  },
  faultNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: RED_SOFT,
  },
  // 56px aside action footer (BR corner owner).
  asideFooter: {
    height: 56,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: `0 ${GUTTER + 4}px`,
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  chipButton: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 6,
  },
  // PowerCapSlider ---------------------------------------------------------
  slider: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  sliderLabel: {fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  sliderTrack: {
    position: 'relative',
    width: 160,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    cursor: 'pointer',
    touchAction: 'none',
  },
  sliderFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    borderRadius: 3,
    backgroundColor: AMPARA_TEAL, // brand FILL duty — never text
  },
  sliderDetent: {
    position: 'absolute',
    top: -2,
    width: 1,
    height: 10,
    backgroundColor: 'var(--color-text-secondary)',
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AMPARA_TEAL,
    boxShadow: '0 0 0 2px var(--color-background-card)',
    cursor: 'grab',
  },
  sliderReadout: {
    width: 64,
    textAlign: 'end',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// DATA — Ampara depot Alvarado TX-04. Suite "now": 14:32 site time. Every
// figure is dual-field; aggregates are NEVER stored — they derive from
// allocate() so the ladder, footer, tiles, and aside can never disagree.
// ---------------------------------------------------------------------------

type FeederId = 'FDR-A' | 'FDR-B' | 'FDR-C';
type Connector = 'CCS' | 'NACS' | 'CHAdeMO';
type StallState = 'charging' | 'idle' | 'paused' | 'faulted' | 'offline';
type Tariff = 'off-peak' | 'shoulder' | 'peak';
type StallId =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6'
  | 'C1' | 'C2' | 'C3' | 'C4';

interface Feeder {
  id: FeederId;
  label: string;
  breakerKw: number;
  breakerLabel: string;
  hue: string;
  initial: string;
}

const SITE_TX04 = {
  name: 'Alvarado Depot TX-04',
  transformerLabel: '750 kVA xfmr',
  transformerKw: 750,
  contractKw: 600, // utility contract detent on the slider
};

// FDR-B's parenthetical breaker suffix is the rail-row ellipsis stress
// fixture for the 224px band.
const FEEDERS: Feeder[] = [
  {id: 'FDR-A', label: 'West Canopy', breakerKw: 250, breakerLabel: '250 kW breaker', hue: FEEDER_BLUE, initial: 'A'},
  {id: 'FDR-B', label: 'East Canopy (breaker QB-2, 400 A)', breakerKw: 250, breakerLabel: '250 kW breaker', hue: FEEDER_TEAL, initial: 'B'},
  {id: 'FDR-C', label: 'Overflow Pad', breakerKw: 180, breakerLabel: '180 kW breaker', hue: FEEDER_PURPLE, initial: 'C'},
];

interface SessionPoint {
  tMin: number;
  kw: number;
}

interface SessionAnnotation {
  id: string;
  tMin: number;
  cause: 'thermal' | 'load-share' | 'curtail';
  deltaKwLabel: string;
  label: string;
}

interface Session {
  startedLabel: string; // fixture string, never clock math
  durationMin: number;
  durationLabel: string;
  energyKwhLabel: string;
  points: SessionPoint[]; // empty array = SessionCurveStrip empty state
}

interface Stall {
  id: StallId;
  feederId: FeederId;
  connector: Connector;
  state: StallState;
  socPct: number;
  socLabel: string;
  requestedKw: number;
  requestedKwLabel: string;
  vehicle: string;
  note?: string;
  faultCode?: string;
  session: Session;
  annotations: SessionAnnotation[];
}

const NO_SESSION: Session = {
  startedLabel: '—',
  durationMin: 0,
  durationLabel: '—',
  energyKwhLabel: '—',
  points: [],
};

// Charging demand cross-check: 64+48+80+34 (A) + 92+60+44+30 (B) +
// 26+34 (C) = 512 kW exactly — nothing curtails at the default 600 kW cap.
const INITIAL_STALLS: Record<StallId, Stall> = {
  A1: {
    id: 'A1', feederId: 'FDR-A', connector: 'CCS', state: 'charging',
    socPct: 41, socLabel: '41%', requestedKw: 64, requestedKwLabel: '64 kW',
    vehicle: 'Fleet van VN-2088 (Maros e-Sprint)',
    session: {
      startedLabel: '14:02 site time', durationMin: 34, durationLabel: '34 min',
      energyKwhLabel: '21.4 kWh',
      points: [
        {tMin: 0, kw: 10}, {tMin: 4, kw: 44}, {tMin: 9, kw: 58},
        {tMin: 16, kw: 64}, {tMin: 22, kw: 63}, {tMin: 28, kw: 64}, {tMin: 34, kw: 64},
      ],
    },
    annotations: [],
  },
  A2: {
    id: 'A2', feederId: 'FDR-A', connector: 'CCS', state: 'charging',
    socPct: 58, socLabel: '58%', requestedKw: 48, requestedKwLabel: '48 kW',
    vehicle: 'Fleet van VN-2101 (Maros e-Sprint)',
    session: {
      startedLabel: '13:41 site time', durationMin: 51, durationLabel: '51 min',
      energyKwhLabel: '30.8 kWh',
      points: [
        {tMin: 0, kw: 9}, {tMin: 6, kw: 52}, {tMin: 14, kw: 55},
        {tMin: 24, kw: 50}, {tMin: 34, kw: 49}, {tMin: 44, kw: 48}, {tMin: 51, kw: 48},
      ],
    },
    annotations: [],
  },
  A3: {
    id: 'A3', feederId: 'FDR-A', connector: 'CCS', state: 'charging',
    socPct: 64, socLabel: '64%', requestedKw: 80, requestedKwLabel: '80 kW',
    vehicle: 'Fleet van VN-2117 (Maros e-Sprint)',
    session: {
      startedLabel: '13:44 site time', durationMin: 48, durationLabel: '48 min',
      energyKwhLabel: '41.6 kWh',
      points: [
        {tMin: 0, kw: 12}, {tMin: 5, kw: 68}, {tMin: 10, kw: 78},
        {tMin: 16, kw: 80}, {tMin: 22, kw: 80}, {tMin: 23, kw: 74},
        {tMin: 28, kw: 75}, {tMin: 34, kw: 76}, {tMin: 41, kw: 76},
        {tMin: 42, kw: 67}, {tMin: 48, kw: 67},
      ],
    },
    // Cause-flagged derate events on the curve; deltas are event-time
    // steps (the curve embeds them), not a running sum to "now".
    annotations: [
      {id: 'a3-thermal', tMin: 22, cause: 'thermal', deltaKwLabel: '−6 kW', label: 'Thermal derate at minute 22'},
      {id: 'a3-loadshare', tMin: 41, cause: 'load-share', deltaKwLabel: '−9 kW', label: 'Load-share derate at minute 41'},
    ],
  },
  A4: {
    id: 'A4', feederId: 'FDR-A', connector: 'NACS', state: 'charging',
    socPct: 77, socLabel: '77%', requestedKw: 34, requestedKwLabel: '34 kW',
    vehicle: 'Courier car CR-114 (Veylan 3)',
    session: {
      startedLabel: '13:29 site time', durationMin: 63, durationLabel: '63 min',
      energyKwhLabel: '27.9 kWh',
      points: [
        {tMin: 0, kw: 8}, {tMin: 8, kw: 46}, {tMin: 20, kw: 44},
        {tMin: 34, kw: 40}, {tMin: 48, kw: 36}, {tMin: 63, kw: 34},
      ],
    },
    annotations: [],
  },
  // Faulted stall — the ticket-prose fixture for the aside paragraph
  // measure; excluded from allocation until 'Clear fault'.
  A5: {
    id: 'A5', feederId: 'FDR-A', connector: 'CCS', state: 'faulted',
    socPct: 12, socLabel: '12%', requestedKw: 50, requestedKwLabel: '50 kW',
    vehicle: 'Fleet van VN-2094 (Maros e-Sprint)',
    faultCode: 'F-312',
    note:
      'F-312: Isolation monitor tripped at 14:32 site time during pre-charge; ' +
      'stall locked out pending manual reset (WO-8841).',
    session: {
      startedLabel: '14:29 site time', durationMin: 3, durationLabel: '3 min',
      energyKwhLabel: '0.4 kWh',
      points: [{tMin: 0, kw: 4}, {tMin: 1, kw: 11}, {tMin: 2, kw: 12}, {tMin: 3, kw: 0}],
    },
    annotations: [],
  },
  A6: {
    id: 'A6', feederId: 'FDR-A', connector: 'NACS', state: 'idle',
    socPct: 0, socLabel: '—', requestedKw: 0, requestedKwLabel: '0 kW',
    vehicle: '', note: 'Available', session: NO_SESSION, annotations: [],
  },
  B1: {
    id: 'B1', feederId: 'FDR-B', connector: 'CCS', state: 'charging',
    socPct: 33, socLabel: '33%', requestedKw: 92, requestedKwLabel: '92 kW',
    vehicle: 'Box truck BT-501 (Halvor T8)',
    session: {
      startedLabel: '14:11 site time', durationMin: 21, durationLabel: '21 min',
      energyKwhLabel: '28.7 kWh',
      points: [
        {tMin: 0, kw: 15}, {tMin: 4, kw: 70}, {tMin: 9, kw: 88},
        {tMin: 14, kw: 92}, {tMin: 21, kw: 92},
      ],
    },
    annotations: [],
  },
  // 37+ char vehicle string — the tile row-3 truncation stress fixture; it
  // must also WRAP (not clip) in the aside vehicle block.
  B2: {
    id: 'B2', feederId: 'FDR-B', connector: 'CHAdeMO', state: 'charging',
    socPct: 52, socLabel: '52%', requestedKw: 60, requestedKwLabel: '60 kW',
    vehicle: 'Rivos Cargo 700 — third-party CHAdeMO retrofit adapter, firmware 2.4.1-rc3',
    session: {
      startedLabel: '13:53 site time', durationMin: 39, durationLabel: '39 min',
      energyKwhLabel: '33.5 kWh',
      points: [
        {tMin: 0, kw: 11}, {tMin: 6, kw: 58}, {tMin: 15, kw: 60},
        {tMin: 24, kw: 57}, {tMin: 32, kw: 58}, {tMin: 39, kw: 60},
      ],
    },
    annotations: [],
  },
  B3: {
    id: 'B3', feederId: 'FDR-B', connector: 'CCS', state: 'charging',
    socPct: 69, socLabel: '69%', requestedKw: 44, requestedKwLabel: '44 kW',
    vehicle: 'Fleet van VN-2123 (Maros e-Sprint)',
    session: {
      startedLabel: '13:35 site time', durationMin: 57, durationLabel: '57 min',
      energyKwhLabel: '35.1 kWh',
      points: [
        {tMin: 0, kw: 10}, {tMin: 8, kw: 52}, {tMin: 20, kw: 50},
        {tMin: 32, kw: 47}, {tMin: 45, kw: 45}, {tMin: 57, kw: 44},
      ],
    },
    annotations: [],
  },
  // socPct 100 — the full-circle arc-join stress fixture.
  B4: {
    id: 'B4', feederId: 'FDR-B', connector: 'NACS', state: 'paused',
    socPct: 100, socLabel: '100%', requestedKw: 0, requestedKwLabel: '0 kW',
    vehicle: 'Courier car CR-102 (Veylan 3)', note: 'Finished — awaiting unplug',
    session: {
      startedLabel: '13:18 site time', durationMin: 74, durationLabel: '74 min',
      energyKwhLabel: '58.0 kWh',
      points: [
        {tMin: 0, kw: 9}, {tMin: 6, kw: 48}, {tMin: 18, kw: 50},
        {tMin: 30, kw: 46}, {tMin: 44, kw: 38}, {tMin: 58, kw: 22},
        {tMin: 66, kw: 10}, {tMin: 74, kw: 0},
      ],
    },
    annotations: [],
  },
  B5: {
    id: 'B5', feederId: 'FDR-B', connector: 'NACS', state: 'charging',
    socPct: 88, socLabel: '88%', requestedKw: 30, requestedKwLabel: '30 kW',
    vehicle: 'Courier car CR-121 (Veylan 3)',
    session: {
      startedLabel: '13:24 site time', durationMin: 68, durationLabel: '68 min',
      energyKwhLabel: '39.3 kWh',
      points: [
        {tMin: 0, kw: 7}, {tMin: 10, kw: 44}, {tMin: 24, kw: 40},
        {tMin: 38, kw: 36}, {tMin: 52, kw: 33}, {tMin: 68, kw: 30},
      ],
    },
    annotations: [],
  },
  B6: {
    id: 'B6', feederId: 'FDR-B', connector: 'CCS', state: 'idle',
    socPct: 0, socLabel: '—', requestedKw: 0, requestedKwLabel: '0 kW',
    vehicle: '', note: 'Available', session: NO_SESSION, annotations: [],
  },
  C1: {
    id: 'C1', feederId: 'FDR-C', connector: 'CHAdeMO', state: 'charging',
    socPct: 46, socLabel: '46%', requestedKw: 26, requestedKwLabel: '26 kW',
    vehicle: 'Yard mule YM-3 (Torq E-Tug)',
    session: {
      startedLabel: '13:50 site time', durationMin: 42, durationLabel: '42 min',
      energyKwhLabel: '15.6 kWh',
      points: [
        {tMin: 0, kw: 6}, {tMin: 8, kw: 24}, {tMin: 18, kw: 26},
        {tMin: 28, kw: 25}, {tMin: 42, kw: 26},
      ],
    },
    annotations: [],
  },
  // Idle with a truly empty session — the SessionCurveStrip empty-state
  // fixture.
  C2: {
    id: 'C2', feederId: 'FDR-C', connector: 'CCS', state: 'idle',
    socPct: 0, socLabel: '—', requestedKw: 0, requestedKwLabel: '0 kW',
    vehicle: '', note: 'Available — last session ended 11:47 site time',
    session: NO_SESSION, annotations: [],
  },
  C3: {
    id: 'C3', feederId: 'FDR-C', connector: 'NACS', state: 'charging',
    socPct: 59, socLabel: '59%', requestedKw: 34, requestedKwLabel: '34 kW',
    vehicle: 'Courier car CR-118 (Veylan 3)',
    session: {
      startedLabel: '13:47 site time', durationMin: 45, durationLabel: '45 min',
      energyKwhLabel: '22.8 kWh',
      points: [
        {tMin: 0, kw: 8}, {tMin: 9, kw: 38}, {tMin: 21, kw: 36},
        {tMin: 33, kw: 35}, {tMin: 45, kw: 34},
      ],
    },
    annotations: [],
  },
  // Offline — the glyph's all-muted rendering fixture.
  C4: {
    id: 'C4', feederId: 'FDR-C', connector: 'CCS', state: 'offline',
    socPct: 0, socLabel: '—', requestedKw: 0, requestedKwLabel: '0 kW',
    vehicle: '', note: 'Trenching work — de-energized per WO-8790',
    session: NO_SESSION, annotations: [],
  },
};

const STALL_IDS = Object.keys(INITIAL_STALLS) as StallId[];

const TARIFFS: Record<Tariff, {label: string; rate: string; badge: 'green' | 'yellow' | 'orange'}> = {
  'off-peak': {label: 'Off-peak', rate: '$0.07/kWh', badge: 'green'},
  shoulder: {label: 'Shoulder', rate: '$0.14/kWh', badge: 'yellow'},
  peak: {label: 'Peak', rate: '$0.31/kWh', badge: 'orange'},
};
const TARIFF_CYCLE: Record<Tariff, Tariff> = {
  'off-peak': 'shoulder',
  shoulder: 'peak',
  peak: 'off-peak',
};

// ---------------------------------------------------------------------------
// ALLOCATION — the one pure function every surface reads. Only charging
// stalls draw. If demand fits the cap, everyone gets requested; otherwise
// proportional shares floor-rounded to whole kW, then the leftover kW are
// granted 1 kW each by LARGEST FRACTIONAL REMAINDER (ties by stall id).
// Largest-remainder (not blind id-order top-up) keeps the spec's flagship
// figure exact: at a 400 kW cap, A3's 80 kW × 400/512 = 62.5 floors to 62
// and its .5 remainder loses the tie-break — 62 allocated, −18 curtailed.
// ---------------------------------------------------------------------------

interface StallAllocation {
  allocatedKw: number;
  curtailedKw: number;
}

interface Allocation {
  perStall: Record<StallId, StallAllocation>;
  perFeeder: Record<FeederId, {allocatedKw: number; demandKw: number}>;
  totalAllocatedKw: number;
  totalDemandKw: number;
  totalCurtailedKw: number;
  curtailedCount: number;
}

function allocate(capKw: number, stalls: Record<StallId, Stall>): Allocation {
  const perStall = {} as Record<StallId, StallAllocation>;
  const drawing = STALL_IDS.filter(id => stalls[id].state === 'charging');
  const totalDemandKw = drawing.reduce((sum, id) => sum + stalls[id].requestedKw, 0);

  for (const id of STALL_IDS) {
    perStall[id] = {allocatedKw: 0, curtailedKw: 0};
  }

  if (totalDemandKw <= capKw) {
    for (const id of drawing) {
      perStall[id] = {allocatedKw: stalls[id].requestedKw, curtailedKw: 0};
    }
  } else {
    const shares = drawing.map(id => {
      const exact = (stalls[id].requestedKw * capKw) / totalDemandKw;
      const floor = Math.floor(exact);
      return {id, floor, remainder: exact - floor};
    });
    let leftover = capKw - shares.reduce((sum, s) => sum + s.floor, 0);
    const byRemainder = [...shares].sort(
      (a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id),
    );
    const granted = new Set<StallId>();
    for (const share of byRemainder) {
      if (leftover <= 0) break;
      granted.add(share.id);
      leftover -= 1;
    }
    for (const share of shares) {
      const allocatedKw = share.floor + (granted.has(share.id) ? 1 : 0);
      perStall[share.id] = {
        allocatedKw,
        curtailedKw: stalls[share.id].requestedKw - allocatedKw,
      };
    }
  }

  const perFeeder = {} as Allocation['perFeeder'];
  for (const feeder of FEEDERS) {
    let allocatedKw = 0;
    let demandKw = 0;
    for (const id of STALL_IDS) {
      if (stalls[id].feederId === feeder.id) {
        allocatedKw += perStall[id].allocatedKw;
        if (stalls[id].state === 'charging') {
          demandKw += stalls[id].requestedKw;
        }
      }
    }
    perFeeder[feeder.id] = {allocatedKw, demandKw};
  }

  const totalAllocatedKw = drawing.reduce((sum, id) => sum + perStall[id].allocatedKw, 0);
  const curtailed = drawing.filter(id => perStall[id].curtailedKw > 0);
  return {
    perStall,
    perFeeder,
    totalAllocatedKw,
    totalDemandKw,
    totalCurtailedKw: curtailed.reduce((sum, id) => sum + perStall[id].curtailedKw, 0),
    curtailedCount: curtailed.length,
  };
}

// ---------------------------------------------------------------------------
// HOOKS — container-width measurement (breakpoints key off the view root's
// OWN width, not the viewport; see the responsive contract above).
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

// Reduced-motion is evaluated once (no listener) — it only gates the
// scrollIntoView behavior; CSS transitions are gated in EVS_CSS.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// SVG GEOMETRY HELPERS
// ---------------------------------------------------------------------------

function polarPoint(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const [x1, y1] = polarPoint(cx, cy, r, fromDeg);
  const [x2, y2] = polarPoint(cx, cy, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Subtract the fault-notch window from an arc span; returns drawable segments. */
function arcSegments(
  fromDeg: number,
  toDeg: number,
  notch: [number, number] | null,
): Array<[number, number]> {
  if (toDeg - fromDeg <= 0) {
    return [];
  }
  if (notch == null) {
    return [[fromDeg, toDeg]];
  }
  const segments: Array<[number, number]> = [];
  if (fromDeg < notch[0]) {
    segments.push([fromDeg, Math.min(toDeg, notch[0])]);
  }
  if (toDeg > notch[1]) {
    segments.push([Math.max(fromDeg, notch[1]), toDeg]);
  }
  return segments.filter(([a, b]) => b - a > 0.5);
}

// ---------------------------------------------------------------------------
// AmparaMark — 24px inline brand mark: plug outline whose pin cutout forms a
// lightning bolt in negative space (fill-rule evenodd). The one place the
// quarantined brand teal appears besides the slider fill.
// ---------------------------------------------------------------------------

function AmparaMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill={AMPARA_TEAL}
        fillRule="evenodd"
        d="M7.5 2h2.2v3h4.6V2h2.2v3h1.2c1 0 1.8.8 1.8 1.8V13a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7V6.8C4.5 5.8 5.3 5 6.3 5h1.2V2Zm5.9 6-4.6 5.6h2.6l-1.1 4.4 4.6-5.9h-2.6L13.4 8Z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// StallStateGlyph — fully custom, purely presentational. 44x44: (a) SOC arc
// r19 sw3 from -90deg sweeping socPct*3.6deg in the state color; (b) 20x20
// connector silhouette keyed by connector, 1.5px strokes; (c) 24deg fault
// notch cut at 135deg with a 4px danger dot; (d) 45deg amber hatch (4px
// pitch, 1px lines) clipped to the silhouette when curtailed. STALL_B4
// (socPct 100) exercises the full-circle join; STALL_C4 (offline) the
// all-muted rendering.
// ---------------------------------------------------------------------------

const GLYPH_STATE_COLOR: Record<StallState, string> = {
  charging: 'var(--color-accent)', // brand-accent token
  idle: 'var(--color-text-secondary)', // muted
  paused: AMBER, // warning
  faulted: RED, // danger
  offline: 'var(--color-border)',
};

interface StallStateGlyphProps {
  connector: Connector;
  socPct: number;
  state: StallState;
  curtailed: boolean;
  faultCode?: string;
  size?: number;
}

function connectorShapes(connector: Connector, stroke: string) {
  // All silhouettes live in the 20x20 box centered in the 44 viewBox.
  if (connector === 'CCS') {
    // Combo: AC ring on top, DC pin pair below.
    return (
      <g stroke={stroke} strokeWidth={1.5} fill="none">
        <circle cx={22} cy={17} r={5} />
        <circle cx={18.5} cy={27} r={2.5} />
        <circle cx={25.5} cy={27} r={2.5} />
      </g>
    );
  }
  if (connector === 'NACS') {
    // Rounded pentagon with 2 pins.
    return (
      <g stroke={stroke} strokeWidth={1.5} fill="none" strokeLinejoin="round">
        <path d="M16 14.5 H28 L31 20.5 L22 29.5 L13 20.5 Z" />
        <circle cx={19.2} cy={20} r={1.6} />
        <circle cx={24.8} cy={20} r={1.6} />
      </g>
    );
  }
  // CHAdeMO: large circle with 4 inner pins.
  return (
    <g stroke={stroke} strokeWidth={1.5} fill="none">
      <circle cx={22} cy={22} r={8} />
      <circle cx={22} cy={17.5} r={1.5} />
      <circle cx={22} cy={26.5} r={1.5} />
      <circle cx={17.5} cy={22} r={1.5} />
      <circle cx={26.5} cy={22} r={1.5} />
    </g>
  );
}

function StallStateGlyph({
  connector,
  socPct,
  state,
  curtailed,
  faultCode,
  size = 44,
}: StallStateGlyphProps) {
  // useId emits ':'-wrapped ids that break url(#...) refs — strip them.
  const uid = useId().replace(/:/g, '');
  const stateColor = GLYPH_STATE_COLOR[state];
  const silhouetteColor = state === 'offline' ? 'var(--color-border)' : 'var(--color-text-secondary)';
  // Fault notch: a 24deg wedge gap centered at 135deg.
  const notch: [number, number] | null = faultCode != null ? [123, 147] : null;
  const sweep = Math.max(0, Math.min(360, socPct * 3.6));
  const isFullCircle = sweep >= 360 && notch == null;
  const trackSegments = arcSegments(0, 360, notch);
  const valueSegments = arcSegments(0, sweep, notch);
  const hatchId = `evs-glyph-hatch-${uid}`;
  const clipId = `evs-glyph-clip-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden focusable="false">
      <defs>
        <pattern
          id={hatchId}
          width={4}
          height={4}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)">
          <path d="M0 0V4" stroke={AMBER} strokeWidth={1} />
        </pattern>
        <clipPath id={clipId}>
          {connector === 'CCS' ? (
            <>
              <circle cx={22} cy={17} r={5.75} />
              <circle cx={18.5} cy={27} r={3.25} />
              <circle cx={25.5} cy={27} r={3.25} />
            </>
          ) : connector === 'NACS' ? (
            <path d="M16 14.5 H28 L31 20.5 L22 29.5 L13 20.5 Z" />
          ) : (
            <circle cx={22} cy={22} r={8.75} />
          )}
        </clipPath>
      </defs>
      {/* SOC track */}
      {notch == null ? (
        <circle cx={22} cy={22} r={19} fill="none" stroke="var(--color-border)" strokeWidth={3} />
      ) : (
        trackSegments.map(([a, b]) => (
          <path
            key={`t${a}`}
            d={arcPath(22, 22, 19, a, b)}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={3}
          />
        ))
      )}
      {/* SOC value arc — <circle> at 100% so the join is seamless (B4) */}
      {isFullCircle ? (
        <circle cx={22} cy={22} r={19} fill="none" stroke={stateColor} strokeWidth={3} />
      ) : (
        valueSegments.map(([a, b]) => (
          <path
            key={`v${a}`}
            d={arcPath(22, 22, 19, a, b)}
            fill="none"
            stroke={stateColor}
            strokeWidth={3}
            strokeLinecap="butt"
          />
        ))
      )}
      {/* Fault dot inside the notch gap */}
      {notch != null ? (
        <circle
          cx={polarPoint(22, 22, 19, 135)[0]}
          cy={polarPoint(22, 22, 19, 135)[1]}
          r={2}
          fill={RED}
        />
      ) : null}
      {connectorShapes(connector, silhouetteColor)}
      {/* Derate striping — hatch clipped to the connector silhouette */}
      {curtailed ? (
        <rect x={12} y={12} width={20} height={20} fill={`url(#${hatchId})`} clipPath={`url(#${clipId})`} />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PowerBudgetLadder — fully custom; selection lifted. width x 300 SVG: 44px
// left tick gutter (0/150/300/450/600/750 kW), plot column x=56 mapping
// 0..750 kW bottom-up over 260px (y 280 → 20). Solid 2px XFMR 750 line;
// dashed danger cap line that MOVES with the slider; feeder blocks stacked
// bottom-up in feeder-id order (8px label inside when >= 18px tall); 6px
// hatched reserve band from stack top to the cap; amber curtailment band
// when demand exceeds the cap. Blocks are focusable role="button" nodes, so
// the SVG is role="group" (role="img" would swallow the buttons).
// ---------------------------------------------------------------------------

// 8px in-block labels sit on 70%-opacity categorical fills: white passes on
// the saturated light-scheme hues; near-black on the lighter dark-scheme
// hues (#4C9EFF at 70% ≈ 6.8:1 against #0E1116 text).
const LADDER_LABEL = 'light-dark(#FFFFFF, #0E1116)';

interface LadderFeeder {
  id: FeederId;
  label: string;
  allocatedKw: number;
  hue: string;
}

interface PowerBudgetLadderProps {
  width: number;
  capKw: number;
  feeders: LadderFeeder[];
  demandKw: number;
  reserveTooltip: string;
  selectedFeederId: FeederId | null;
  onSelectFeeder: (id: FeederId) => void;
}

function PowerBudgetLadder({
  width,
  capKw,
  feeders,
  demandKw,
  reserveTooltip,
  selectedFeederId,
  onSelectFeeder,
}: PowerBudgetLadderProps) {
  const uid = useId().replace(/:/g, '');
  const plotX = 56;
  const plotW = width - plotX - (width >= 248 ? 52 : 44);
  const yFor = (kw: number) => 280 - (kw / 750) * 260;
  const totalAllocated = feeders.reduce((sum, f) => sum + f.allocatedKw, 0);
  const reserveKw = Math.max(0, capKw - totalAllocated);
  const hatchId = `evs-ladder-reserve-${uid}`;
  const curtailId = `evs-ladder-curtail-${uid}`;

  let cursorKw = 0;
  const blocks = feeders.map(feeder => {
    const y0 = yFor(cursorKw);
    cursorKw += feeder.allocatedKw;
    const y1 = yFor(cursorKw);
    return {feeder, y: y1, height: y0 - y1};
  });

  const handleBlockKey = (event: KeyboardEvent<SVGGElement>, id: FeederId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectFeeder(id);
    }
  };

  return (
    <svg
      width={width}
      height={300}
      viewBox={`0 0 ${width} 300`}
      role="group"
      aria-label={`Power budget ladder: ${totalAllocated} kW allocated of ${capKw} kW site cap, ${reserveKw} kW reserve, transformer 750 kVA`}>
      <defs>
        <pattern
          id={hatchId}
          width={6}
          height={6}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)">
          <path d="M0 0V6" stroke="var(--color-border)" strokeWidth={1.5} opacity={0.9} />
        </pattern>
        <pattern
          id={curtailId}
          width={6}
          height={6}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)">
          <path d="M0 0V6" stroke={AMBER} strokeWidth={1.5} />
        </pattern>
      </defs>
      {/* Tick labels + faint gridlines every 150 kW */}
      {[0, 150, 300, 450, 600, 750].map(kw => (
        <g key={kw}>
          <text
            x={48}
            y={yFor(kw) + 3}
            textAnchor="end"
            fontSize={10}
            fontFamily={MONO}
            fill="var(--color-text-secondary)">
            {kw}
          </text>
          <line
            x1={plotX}
            x2={plotX + plotW}
            y1={yFor(kw)}
            y2={yFor(kw)}
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.5}
          />
        </g>
      ))}
      {/* Feeder blocks, bottom-up in feeder-id order */}
      {blocks.map(({feeder, y, height}) => (
        <g
          key={feeder.id}
          role="button"
          tabIndex={0}
          className="evs-focusable"
          style={{cursor: 'pointer'}}
          aria-label={`Feeder ${feeder.id} ${feeder.label}: ${feeder.allocatedKw} kilowatts allocated. Scroll to this feeder group.`}
          aria-pressed={selectedFeederId === feeder.id}
          onClick={() => onSelectFeeder(feeder.id)}
          onKeyDown={event => handleBlockKey(event, feeder.id)}>
          <rect
            x={plotX + 0.5}
            y={y}
            width={plotW - 1}
            height={Math.max(0, height)}
            fill={feeder.hue}
            fillOpacity={selectedFeederId === feeder.id ? 0.9 : 0.7}
            stroke={feeder.hue}
            strokeWidth={1}
          />
          {height >= 18 ? (
            <text
              x={plotX + 5}
              y={y + 12}
              fontSize={8}
              fontFamily={MONO}
              fill={LADDER_LABEL}>
              {`${feeder.id} ${feeder.allocatedKw}`}
            </text>
          ) : null}
        </g>
      ))}
      {/* Reserve band: stack top → cap line, tooltip re-labels with tariff */}
      {capKw > totalAllocated ? (
        <g>
          <title>{reserveTooltip}</title>
          <rect
            x={plotX + 0.5}
            y={yFor(capKw)}
            width={plotW - 1}
            height={yFor(totalAllocated) - yFor(capKw)}
            fill={`url(#${hatchId})`}
            opacity={0.4}
          />
        </g>
      ) : null}
      {/* Curtailment band: cap → unmet demand, amber hatch */}
      {demandKw > capKw ? (
        <g>
          <title>{`Curtailment: ${demandKw - capKw} kW of demand above the site cap`}</title>
          <rect
            x={plotX + 0.5}
            y={yFor(demandKw)}
            width={plotW - 1}
            height={yFor(capKw) - yFor(demandKw)}
            fill={`url(#${curtailId})`}
          />
        </g>
      ) : null}
      {/* Site cap: dashed danger line that moves with the slider */}
      <line
        x1={plotX - 4}
        x2={plotX + plotW + 4}
        y1={yFor(capKw)}
        y2={yFor(capKw)}
        stroke={RED}
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={plotX + plotW + 6}
        y={yFor(capKw) + 3}
        fontSize={8}
        fontFamily={MONO}
        fill={RED}>
        {`CAP ${capKw}`}
      </text>
      {/* Transformer rating: solid 2px line at 750 */}
      <line
        x1={plotX - 4}
        x2={plotX + plotW + 4}
        y1={yFor(750)}
        y2={yFor(750)}
        stroke="var(--color-text-secondary)"
        strokeWidth={2}
      />
      <text
        x={plotX + plotW + 6}
        y={yFor(750) + 3}
        fontSize={8}
        fontFamily={MONO}
        fill="var(--color-text-secondary)">
        XFMR 750
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SessionCurveStrip — inline annotated power trace. width x 72: baseline
// axis at y=60, x maps 0..durationMin, y maps 0..250 kW; 1.5px polyline with
// 12%-opacity area fill; per-annotation 1px vertical line + 16x12 flag rect
// (8px glyph 'T' / 'LS' / 'C'; thermal in danger, load-share/curtail in
// amber). Flags are focusable role="button" nodes driving the aside's
// attribution rows. Empty points → dashed frame + 'No active session'
// (STALL_C2 exercises this).
// ---------------------------------------------------------------------------

interface SessionCurveStripProps {
  width: number;
  session: Session;
  annotations: SessionAnnotation[];
  focusedAnnotationId: string | null;
  onFlagSelect: (annotationId: string) => void;
}

const FLAG_GLYPH: Record<SessionAnnotation['cause'], string> = {
  thermal: 'T',
  'load-share': 'LS',
  curtail: 'C',
};

function SessionCurveStrip({
  width,
  session,
  annotations,
  focusedAnnotationId,
  onFlagSelect,
}: SessionCurveStripProps) {
  if (session.points.length === 0) {
    return (
      <svg width={width} height={72} viewBox={`0 0 ${width} 72`} role="img" aria-label="No active session">
        <rect
          x={0.5}
          y={0.5}
          width={width - 1}
          height={71}
          rx={8}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={width / 2}
          y={39}
          textAnchor="middle"
          fontSize={11}
          fill="var(--color-text-secondary)">
          No active session
        </text>
      </svg>
    );
  }

  const duration = Math.max(1, session.durationMin);
  const xFor = (tMin: number) => 2 + (tMin / duration) * (width - 4);
  const yFor = (kw: number) => 60 - (kw / 250) * 54;
  const linePoints = session.points
    .map(p => `${xFor(p.tMin).toFixed(1)},${yFor(p.kw).toFixed(1)}`)
    .join(' ');
  const first = session.points[0];
  const last = session.points[session.points.length - 1];
  const areaPath =
    `M ${xFor(first.tMin).toFixed(1)} 60 ` +
    session.points.map(p => `L ${xFor(p.tMin).toFixed(1)} ${yFor(p.kw).toFixed(1)}`).join(' ') +
    ` L ${xFor(last.tMin).toFixed(1)} 60 Z`;

  return (
    <svg
      width={width}
      height={72}
      viewBox={`0 0 ${width} 72`}
      role="group"
      aria-label={`Session power trace, ${session.durationLabel}, ${annotations.length} derate events`}>
      <line x1={0} x2={width} y1={60} y2={60} stroke="var(--color-border)" strokeWidth={1} />
      <path d={areaPath} fill="var(--color-accent)" opacity={0.12} />
      <polyline
        points={linePoints}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {annotations.map(annotation => {
        const x = xFor(annotation.tMin);
        const color = annotation.cause === 'thermal' ? RED : AMBER;
        const isFocused = focusedAnnotationId === annotation.id;
        return (
          <g
            key={annotation.id}
            role="button"
            tabIndex={0}
            className="evs-focusable"
            style={{cursor: 'pointer'}}
            aria-label={`${annotation.label}, ${annotation.deltaKwLabel
              .replace('−', 'minus ')
              .replace(' kW', ' kilowatts')}`}
            onClick={() => onFlagSelect(annotation.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onFlagSelect(annotation.id);
              }
            }}>
            <line x1={x} x2={x} y1={2} y2={60} stroke={color} strokeWidth={1} />
            <rect
              x={Math.min(Math.max(2, x - 8), width - 18)}
              y={2}
              width={16}
              height={12}
              rx={2}
              fill={color}
              stroke={isFocused ? 'currentColor' : 'none'}
              strokeWidth={isFocused ? 1.5 : 0}
            />
            <text
              x={Math.min(Math.max(2, x - 8), width - 18) + 8}
              y={11}
              textAnchor="middle"
              fontSize={8}
              fontWeight={isFocused ? 700 : 400}
              fill={LADDER_LABEL}>
              {FLAG_GLYPH[annotation.cause]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PowerCapSlider — custom measured interaction (the DS has no detented kW
// slider). 260px total: 11px 'Site cap' label (dropped below the 960 band;
// aria-label retains it), 160x6 track with brand-teal fill, 16px thumb with
// a 2px surface ring, a 1x10px detent tick at the 600 kW contract mark, and
// a 64px right-aligned tabular readout. Range 200–750, 10 kW snap; arrows
// ±10, Shift+arrows ±50, Home/End. Value lives in the state owner.
// ---------------------------------------------------------------------------

const CAP_MIN = 200;
const CAP_MAX = 750;

interface PowerCapSliderProps {
  valueKw: number;
  showLabel: boolean;
  onChange: (kw: number) => void;
}

function PowerCapSlider({valueKw, showLabel, onChange}: PowerCapSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const kwFromClientX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) {
      return CAP_MIN;
    }
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const raw = CAP_MIN + ratio * (CAP_MAX - CAP_MIN);
    return Math.min(CAP_MAX, Math.max(CAP_MIN, Math.round(raw / 10) * 10));
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onChange(kwFromClientX(event.clientX));
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      onChange(kwFromClientX(event.clientX));
    }
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const step = event.shiftKey ? 50 : 10;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      next = Math.min(CAP_MAX, valueKw + step);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = Math.max(CAP_MIN, valueKw - step);
    } else if (event.key === 'Home') {
      next = CAP_MIN;
    } else if (event.key === 'End') {
      next = CAP_MAX;
    }
    if (next != null) {
      event.preventDefault();
      onChange(next);
    }
  };

  const pct = ((valueKw - CAP_MIN) / (CAP_MAX - CAP_MIN)) * 100;
  const detentPct = ((SITE_TX04.contractKw - CAP_MIN) / (CAP_MAX - CAP_MIN)) * 100;

  return (
    <div style={styles.slider}>
      {showLabel ? <span style={styles.sliderLabel}>Site cap</span> : null}
      <div
        ref={trackRef}
        style={styles.sliderTrack}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}>
        <div style={{...styles.sliderFill, width: `${pct}%`}} />
        {/* Detent tick at the 600 kW utility-contract mark */}
        <div style={{...styles.sliderDetent, left: `${detentPct}%`}} aria-hidden />
        <span
          role="slider"
          tabIndex={0}
          className="evs-focusable"
          aria-label="Site cap"
          aria-valuemin={CAP_MIN}
          aria-valuemax={CAP_MAX}
          aria-valuenow={valueKw}
          aria-valuetext={`${valueKw} kilowatts`}
          style={{...styles.sliderThumb, left: `calc(${pct}% - 8px)`}}
          onKeyDown={handleKeyDown}
        />
      </div>
      <span style={styles.sliderReadout}>{valueKw} kW</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TariffChip — thin wrapper on DS Badge inside a real <button>. Click cycles
// off-peak → shoulder → peak in the store, which re-labels the chip AND the
// ladder's reserve-band tooltip ('… priced at peak') — an observable
// consequence, not decoration.
// ---------------------------------------------------------------------------

interface TariffChipProps {
  tariff: Tariff;
  onCycle: () => void;
  /** Narrow main columns subtract the rate text (aria-label keeps it). */
  showRate?: boolean;
}

function TariffChip({tariff, onCycle, showRate = true}: TariffChipProps) {
  const meta = TARIFFS[tariff];
  return (
    <button
      type="button"
      className="evs-focusable"
      style={styles.chipButton}
      aria-label={`Tariff period ${meta.label}, ${meta.rate.replace('$', '').replace('/kWh', ' dollars per kilowatt hour')}. Activate to cycle the tariff period.`}
      onClick={onCycle}>
      <Badge
        variant={meta.badge}
        icon={<Icon icon={ZapIcon} size="xsm" color="inherit" />}
        label={showRate ? `${meta.label} · ${meta.rate}` : meta.label}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// StallTile — thin wrapper composite row (product opinion over a DS Card).
// 72px: 44px StallStateGlyph, then stall id 12px semibold + connector tag,
// tabular 'allocated / requested kW' (curtailed figure in AMBER_TEXT), and a
// single-line-ellipsis vehicle/state line (STALL_B2's firmware string is the
// truncation fixture). The whole tile is a <button>; selection = 2px inset
// accent ring.
// ---------------------------------------------------------------------------

const STALL_STATE_LABEL: Record<StallState, string> = {
  charging: 'charging',
  idle: 'idle',
  paused: 'paused',
  faulted: 'faulted',
  offline: 'offline',
};

interface StallTileProps {
  stall: Stall;
  alloc: StallAllocation;
  isSelected: boolean;
  onSelect: (id: StallId) => void;
}

function StallTile({stall, alloc, isSelected, onSelect}: StallTileProps) {
  const isCurtailed = stall.state === 'charging' && alloc.curtailedKw > 0;
  const kwLine =
    stall.state === 'charging'
      ? `${alloc.allocatedKw} / ${stall.requestedKw} kW`
      : '0 kW';
  const ariaLabel =
    `Stall ${stall.id}, ${stall.connector}, ${STALL_STATE_LABEL[stall.state]}` +
    (stall.state === 'charging'
      ? `, ${alloc.allocatedKw} of ${stall.requestedKw} kilowatts${isCurtailed ? ', curtailed' : ''}`
      : '') +
    (stall.faultCode != null ? `, fault ${stall.faultCode}` : '');
  return (
    <button
      type="button"
      className="evs-focusable evs-anim"
      style={isSelected ? {...styles.tile, ...styles.tileSelected} : styles.tile}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      onClick={() => onSelect(stall.id)}>
      <StallStateGlyph
        connector={stall.connector}
        socPct={stall.socPct}
        state={stall.state}
        curtailed={isCurtailed}
        faultCode={stall.faultCode}
      />
      <span style={styles.tileCol}>
        <span style={styles.tileRow1}>
          <span style={styles.tileId}>{stall.id}</span>
          <span style={styles.tileConnector}>{stall.connector}</span>
        </span>
        <span style={styles.tileKw}>
          {stall.state === 'charging' ? (
            <>
              <span
                className="evs-anim"
                style={isCurtailed ? styles.tileKwCurtailed : undefined}>
                {alloc.allocatedKw}
              </span>
              {` / ${stall.requestedKw} kW`}
            </>
          ) : (
            kwLine
          )}
        </span>
        <span style={styles.tileVehicle}>{stall.vehicle || stall.note || '—'}</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// STALL DETAIL — shared between the 360px aside and the < 840px Dialog so
// both paths render identical content.
// ---------------------------------------------------------------------------

const STATE_BADGE: Record<StallState, 'blue' | 'neutral' | 'yellow' | 'error'> = {
  charging: 'blue',
  idle: 'neutral',
  paused: 'yellow',
  faulted: 'error',
  offline: 'neutral',
};

const CAUSE_LABEL: Record<SessionAnnotation['cause'], string> = {
  thermal: 'Thermal derate',
  'load-share': 'Load-share derate',
  curtail: 'Curtailment',
};

interface StallDetailBodyProps {
  stall: Stall;
  alloc: StallAllocation;
  curveWidth: number;
  focusedAnnotationId: string | null;
  onFocusAnnotation: (id: string | null) => void;
}

function StallDetailBody({
  stall,
  alloc,
  curveWidth,
  focusedAnnotationId,
  onFocusAnnotation,
}: StallDetailBodyProps) {
  const feeder = FEEDERS.find(f => f.id === stall.feederId);
  const isCurtailed = stall.state === 'charging' && alloc.curtailedKw > 0;
  return (
    <div style={styles.asideBody}>
      <div style={styles.asideVehicleRow}>
        <StallStateGlyph
          connector={stall.connector}
          socPct={stall.socPct}
          state={stall.state}
          curtailed={isCurtailed}
          faultCode={stall.faultCode}
        />
        <div style={styles.asideVehicleText}>
          {/* B2's firmware-suffixed vehicle string WRAPS here (vs. the
              tile's single-line ellipsis) — the aside measure fixture. */}
          <Text type="label" size="sm">
            {stall.vehicle || stall.note || 'Unoccupied'}
          </Text>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {`SOC ${stall.socLabel} · ${stall.connector} · ${stall.feederId} ${feeder?.label ?? ''}`}
          </Text>
        </div>
      </div>

      <div>
        <span style={styles.asideSectionLabel}>Session</span>
        <div style={{marginTop: 6}}>
          <SessionCurveStrip
            width={curveWidth}
            session={stall.session}
            annotations={stall.annotations}
            focusedAnnotationId={focusedAnnotationId}
            onFlagSelect={id =>
              onFocusAnnotation(focusedAnnotationId === id ? null : id)
            }
          />
        </div>
        <span style={styles.sessionMeta}>
          {stall.session.points.length > 0
            ? `Started ${stall.session.startedLabel} · ${stall.session.durationLabel} · ${stall.session.energyKwhLabel}`
            : stall.note ?? 'Stall idle'}
        </span>
      </div>

      <div>
        <span style={styles.asideSectionLabel}>Power attribution</span>
        <div style={{marginTop: 4}}>
          {/* 36px attribution rows; derate rows sync two-way with the curve
              flags (hover bolds the flag, flag click highlights the row). */}
          <div style={styles.attrRow}>
            <span style={styles.attrLabel}>Charger offer</span>
            <span style={styles.attrValue}>{stall.requestedKwLabel}</span>
          </div>
          {stall.annotations.map(annotation => (
            <button
              key={annotation.id}
              type="button"
              className="evs-focusable evs-anim"
              style={{
                ...styles.attrRow,
                ...styles.attrRowInteractive,
                ...(focusedAnnotationId === annotation.id ? styles.attrRowFocused : null),
              }}
              aria-pressed={focusedAnnotationId === annotation.id}
              onClick={() =>
                onFocusAnnotation(
                  focusedAnnotationId === annotation.id ? null : annotation.id,
                )
              }
              onMouseEnter={() => onFocusAnnotation(annotation.id)}
              onMouseLeave={() => onFocusAnnotation(null)}>
              <span style={styles.attrLabel}>
                {`${CAUSE_LABEL[annotation.cause]} · min ${annotation.tMin}`}
              </span>
              <span
                style={{
                  ...styles.attrValue,
                  color: annotation.cause === 'thermal' ? RED : AMBER_TEXT,
                }}>
                {annotation.deltaKwLabel}
              </span>
            </button>
          ))}
          {isCurtailed ? (
            // The signature consequence row: at a 400 kW cap, A3 reads
            // 'Site cap curtailment −18 kW' (80 requested → 62 allocated).
            <div style={{...styles.attrRow, ...styles.attrRowFocused}}>
              <span style={{...styles.attrLabel, color: AMBER_TEXT}}>Site cap curtailment</span>
              <span style={{...styles.attrValue, color: AMBER_TEXT}}>
                {`−${alloc.curtailedKw} kW`}
              </span>
            </div>
          ) : null}
          {/* 44px heavy total row */}
          <div style={styles.attrTotalRow}>
            <span style={styles.attrLabel}>Delivering now</span>
            <span style={styles.attrValue}>{`${alloc.allocatedKw} kW`}</span>
          </div>
        </div>
      </div>

      {stall.faultCode != null && stall.note != null ? (
        <div style={styles.faultNote}>
          <Icon icon={TriangleAlertIcon} size="sm" color="inherit" style={{color: RED, flexShrink: 0}} />
          <Text type="supporting" size="xsm">
            {stall.note}
          </Text>
        </div>
      ) : null}
    </div>
  );
}

interface StallDetailFooterProps {
  stall: Stall;
  onPauseResume: () => void;
  onClearFault: () => void;
}

function StallDetailFooter({stall, onPauseResume, onClearFault}: StallDetailFooterProps) {
  const canPause = stall.state === 'charging';
  const canResume = stall.state === 'paused' && stall.requestedKw > 0;
  return (
    <div style={styles.asideFooter}>
      <Button
        label={canResume ? 'Resume session' : 'Pause session'}
        variant="secondary"
        size="sm"
        icon={<Icon icon={canResume ? PlayIcon : PauseIcon} size="sm" />}
        isDisabled={!canPause && !canResume}
        onClick={onPauseResume}
      />
      {stall.faultCode != null ? (
        <Button label="Clear fault" variant="destructive" size="sm" onClick={onClearFault} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type FilterKey = 'all' | 'charging' | 'curtailed' | 'faulted';

export default function EvSitePowerConsoleTemplate() {
  // Container-width bands (see the responsive contract): the demo stage is
  // ~1045–1075px, landing in band 2 — 224px rail, 320px aside. Viewport
  // queries only cover the width-0 pre-observer first frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const measuredWidth = useElementWidth(viewRootRef);
  const vpBand2 = useMediaQuery('(max-width: 1079px)');
  const vpBand3 = useMediaQuery('(max-width: 959px)');
  const vpBand4 = useMediaQuery('(max-width: 839px)');
  const rootWidth =
    measuredWidth > 0 ? measuredWidth : vpBand4 ? 800 : vpBand3 ? 900 : vpBand2 ? 1000 : 1200;
  const band = rootWidth >= 1080 ? 1 : rootWidth >= 960 ? 2 : rootWidth >= 840 ? 3 : 4;
  const railWidth = band === 1 ? 280 : 224;
  const ladderWidth = band === 1 ? 248 : 192;
  const asideWidth = band === 1 ? 360 : 320;
  const curveWidth = band === 1 ? 320 : 288;
  // Header/filter-row subtraction is driven by the MAIN COLUMN's share of
  // the container: rail + aside are fixed, so main = root − rail − aside.
  const mainWidth =
    rootWidth - (band <= 2 ? railWidth : band === 3 ? 64 : 0) - (band <= 3 ? asideWidth : 0);
  // Spec rule: below a 960 container the slider drops its visible label —
  // AND the label needs a >= 620px main column (band 1 at ~1080 root has a
  // NARROWER main than band 2, so root width alone is the wrong key).
  const showSliderLabel = rootWidth >= 960 && mainWidth >= 620;
  const showHeaderTitle = mainWidth >= 620;
  const showTariffRate = mainWidth >= 500;
  const showSearch = mainWidth >= 500;

  // ONE state owner. Every mutation flows through update(id, patch) or the
  // scalar setters below; every surface reads the same derived allocation.
  const [stalls, setStalls] = useState<Record<StallId, Stall>>(INITIAL_STALLS);
  const [capKw, setCapKw] = useState(600);
  const [tariff, setTariff] = useState<Tariff>('shoulder');
  const [selectedStallId, setSelectedStallId] = useState<StallId>('A3');
  const [selectedFeederId, setSelectedFeederId] = useState<FeederId | null>(null);
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);
  const [stallFilter, setStallFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isSheetOpen, setSheetOpen] = useState(false);

  const update = useCallback((id: StallId, patch: Partial<Stall>) => {
    setStalls(prev => ({...prev, [id]: {...prev[id], ...patch}}));
  }, []);

  // Derived each render — memoized pure function; the ladder, rail footer,
  // tiles, filter counts, and aside all read THIS object (they can never
  // disagree).
  const allocation = useMemo(() => allocate(capKw, stalls), [capKw, stalls]);

  const groupRefs = useRef<Partial<Record<FeederId, HTMLElement | null>>>({});

  const selectFeeder = useCallback((id: FeederId) => {
    setSelectedFeederId(id);
    groupRefs.current[id]?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  const selectStall = useCallback(
    (id: StallId) => {
      setSelectedStallId(id);
      setFocusedAnnotationId(null);
      if (band === 4) {
        setSheetOpen(true);
      }
    },
    [band],
  );

  const handleCapChange = useCallback(
    (kw: number) => {
      setCapKw(kw);
      const next = allocate(kw, stalls);
      setAnnouncement(
        `Site cap ${kw} kW — ${
          next.curtailedCount === 0 ? 'no' : next.curtailedCount
        } stalls curtailed`,
      );
    },
    [stalls],
  );

  const cycleTariff = useCallback(() => {
    setTariff(prev => {
      const next = TARIFF_CYCLE[prev];
      setAnnouncement(`Tariff period ${TARIFFS[next].label} — ${TARIFFS[next].rate}`);
      return next;
    });
  }, []);

  const selectedStall = stalls[selectedStallId];

  const handlePauseResume = useCallback(() => {
    const stall = stalls[selectedStallId];
    if (stall.state === 'charging') {
      update(stall.id, {state: 'paused'});
      const next = allocate(capKw, {...stalls, [stall.id]: {...stall, state: 'paused'}});
      setAnnouncement(
        `Session paused on stall ${stall.id} — ${next.totalAllocatedKw} kW allocated site-wide`,
      );
    } else if (stall.state === 'paused' && stall.requestedKw > 0) {
      update(stall.id, {state: 'charging'});
      const next = allocate(capKw, {...stalls, [stall.id]: {...stall, state: 'charging'}});
      setAnnouncement(
        `Session resumed on stall ${stall.id} — ${next.totalAllocatedKw} kW allocated site-wide`,
      );
    }
  }, [capKw, selectedStallId, stalls, update]);

  const handleClearFault = useCallback(() => {
    const stall = stalls[selectedStallId];
    if (stall.faultCode == null) {
      return;
    }
    update(stall.id, {
      state: 'idle',
      faultCode: undefined,
      note: `Fault ${stall.faultCode} cleared at 14:32 site time — awaiting next vehicle (WO-8841)`,
    });
    setAnnouncement(`Fault ${stall.faultCode} cleared on stall ${stall.id} — stall idle`);
  }, [selectedStallId, stalls, update]);

  // Filter counts derive from the SAME allocation object as the tiles.
  const counts = useMemo(() => {
    let charging = 0;
    let faulted = 0;
    for (const id of STALL_IDS) {
      if (stalls[id].state === 'charging') charging += 1;
      if (stalls[id].state === 'faulted') faulted += 1;
    }
    return {all: STALL_IDS.length, charging, curtailed: allocation.curtailedCount, faulted};
  }, [allocation, stalls]);

  const matchesFilters = useCallback(
    (stall: Stall): boolean => {
      if (stallFilter === 'charging' && stall.state !== 'charging') return false;
      if (stallFilter === 'curtailed' && allocation.perStall[stall.id].curtailedKw <= 0)
        return false;
      if (stallFilter === 'faulted' && stall.state !== 'faulted') return false;
      if (query.trim() !== '') {
        const haystack = `${stall.id} ${stall.connector} ${stall.vehicle} ${stall.note ?? ''}`.toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    },
    [allocation, query, stallFilter],
  );

  const reserveKw = Math.max(0, capKw - allocation.totalAllocatedKw);
  const reserveTooltip = `Reserve ${reserveKw} kW · priced at ${TARIFFS[tariff].label.toLowerCase()} (${TARIFFS[tariff].rate})`;
  const ladderFeeders: LadderFeeder[] = FEEDERS.map(feeder => ({
    id: feeder.id,
    label: feeder.label,
    allocatedKw: allocation.perFeeder[feeder.id].allocatedKw,
    hue: feeder.hue,
  }));
  // BL corner cross-check line: total = Σ feeders = Σ stalls, by derivation.
  // The 224px band subtracts the words, never ellipsizes the numbers.
  const footerLine =
    band === 1
      ? `${allocation.totalAllocatedKw} kW allocated · ${capKw} kW cap · ` +
        (allocation.totalCurtailedKw > 0
          ? `${allocation.totalCurtailedKw} kW curtailed`
          : SITE_TX04.transformerLabel)
      : `${allocation.totalAllocatedKw}/${capKw} kW · ` +
        (allocation.totalCurtailedKw > 0
          ? `${allocation.totalCurtailedKw} kW curtailed`
          : SITE_TX04.transformerLabel);

  const rail =
    band <= 2 ? (
      <div style={{...styles.rail, width: railWidth}}>
        <div style={styles.railHeader}>
          <AmparaMark />
          <Text type="label" size="sm" maxLines={1}>
            {`Ampara · ${SITE_TX04.name}`}
          </Text>
        </div>
        <div style={styles.railScroll}>
          {/* 36px feeder rows — FDR-B's breaker parenthetical must
              ellipsize at the 224px band (stress fixture). */}
          {FEEDERS.map(feeder => (
            <button
              key={feeder.id}
              type="button"
              className="evs-focusable evs-anim"
              style={
                selectedFeederId === feeder.id
                  ? {...styles.feederRow, ...styles.feederRowSelected}
                  : styles.feederRow
              }
              aria-pressed={selectedFeederId === feeder.id}
              onClick={() => selectFeeder(feeder.id)}>
              <span style={{...styles.feederSwatch, backgroundColor: feeder.hue}} aria-hidden />
              <span style={styles.feederRowLabel}>{`${feeder.id} · ${feeder.label}`}</span>
              <span style={styles.feederRowKw}>
                {`${allocation.perFeeder[feeder.id].allocatedKw} kW`}
              </span>
            </button>
          ))}
          <div style={styles.ladderBlock}>
            <PowerBudgetLadder
              width={ladderWidth}
              capKw={capKw}
              feeders={ladderFeeders}
              demandKw={allocation.totalDemandKw}
              reserveTooltip={reserveTooltip}
              selectedFeederId={selectedFeederId}
              onSelectFeeder={selectFeeder}
            />
            {/* Tariff consequence: this caption re-labels when the chip
                cycles — reserve is priced at the active tariff period. */}
            <span style={styles.ladderCaption}>{reserveTooltip}</span>
          </div>
        </div>
        <div style={styles.railFooter}>{footerLine}</div>
      </div>
    ) : band === 3 ? (
      <div style={styles.railStrip}>
        <AmparaMark />
        {FEEDERS.map(feeder => (
          <Tooltip key={feeder.id} content={`${feeder.id} · ${feeder.label}`}>
            <button
              type="button"
              className="evs-focusable"
              style={
                selectedFeederId === feeder.id
                  ? {...styles.railStripButton, borderColor: feeder.hue}
                  : styles.railStripButton
              }
              aria-pressed={selectedFeederId === feeder.id}
              aria-label={`Feeder ${feeder.id} ${feeder.label}`}
              onClick={() => selectFeeder(feeder.id)}>
              {feeder.initial}
            </button>
          </Tooltip>
        ))}
      </div>
    ) : null;

  const detail = (
    <>
      <StallDetailBody
        stall={selectedStall}
        alloc={allocation.perStall[selectedStallId]}
        curveWidth={curveWidth}
        focusedAnnotationId={focusedAnnotationId}
        onFocusAnnotation={setFocusedAnnotationId}
      />
      <StallDetailFooter
        stall={selectedStall}
        onPauseResume={handlePauseResume}
        onClearFault={handleClearFault}
      />
    </>
  );

  return (
    <div style={styles.root}>
      <style>{EVS_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              {rail}
              <div style={styles.main}>
                {/* 52px header bar — never wraps; TR corner: tariff chip
                    then the operator avatar. */}
                <div style={styles.mainHeader}>
                  {showHeaderTitle ? (
                    <Heading level={1} style={{fontSize: 14, margin: 0, whiteSpace: 'nowrap'}}>
                      Site power
                    </Heading>
                  ) : (
                    // Narrow bands drop the visible title, not the h1.
                    <Heading level={1} style={styles.srOnly}>
                      Site power
                    </Heading>
                  )}
                  <PowerCapSlider
                    valueKw={capKw}
                    showLabel={showSliderLabel}
                    onChange={handleCapChange}
                  />
                  {band >= 3 ? (
                    // Rail-footer total relocates here when the rail
                    // collapses to the 64px strip.
                    <Badge
                      variant="neutral"
                      label={`${allocation.totalAllocatedKw} / ${capKw} kW`}
                    />
                  ) : null}
                  <span style={{flex: 1}} aria-hidden />
                  <TariffChip tariff={tariff} onCycle={cycleTariff} showRate={showTariffRate} />
                  <Tooltip content="Rosa Amaya · shift operator">
                    <span style={{flexShrink: 0}}>
                      <Avatar name="Rosa Amaya" size="small" />
                    </span>
                  </Tooltip>
                </div>
                {/* 40px filter row — counts derive from the live allocation */}
                <div style={styles.filterRow}>
                  <SegmentedControl
                    label="Stall state filter"
                    size="sm"
                    value={stallFilter}
                    onChange={value => setStallFilter(value as FilterKey)}>
                    {/* NBSP keeps label + live count on one line (the DS
                        item label is a plain string). */}
                    <SegmentedControlItem value="all" label={`All\u00A0${counts.all}`} />
                    <SegmentedControlItem value="charging" label={`Charging\u00A0${counts.charging}`} />
                    <SegmentedControlItem value="curtailed" label={`Curtailed\u00A0${counts.curtailed}`} />
                    <SegmentedControlItem value="faulted" label={`Faulted\u00A0${counts.faulted}`} />
                  </SegmentedControl>
                  {showSearch ? (
                    <div style={styles.searchBox}>
                      <TextInput
                        label="Search stalls"
                        isLabelHidden
                        size="sm"
                        placeholder="Search stalls…"
                        startIcon={SearchIcon}
                        hasClear
                        value={query}
                        onChange={setQuery}
                      />
                    </div>
                  ) : null}
                </div>
                {/* Stall canvas: feeder groups of 72px tiles */}
                <div style={styles.canvas}>
                  {FEEDERS.map(feeder => {
                    const members = STALL_IDS.filter(
                      id => stalls[id].feederId === feeder.id,
                    );
                    const visible = members.filter(id => matchesFilters(stalls[id]));
                    const feederAlloc = allocation.perFeeder[feeder.id];
                    return (
                      <section
                        key={feeder.id}
                        role="group"
                        aria-label={`Feeder ${feeder.id} ${feeder.label}`}
                        ref={element => {
                          groupRefs.current[feeder.id] = element;
                        }}>
                        {/* 32px group header row */}
                        <div
                          className="evs-anim"
                          style={
                            selectedFeederId === feeder.id
                              ? {...styles.groupHeader, ...styles.groupHeaderSelected}
                              : styles.groupHeader
                          }>
                          <span
                            style={{...styles.feederSwatch, backgroundColor: feeder.hue}}
                            aria-hidden
                          />
                          <span style={{fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'}}>
                            {`${feeder.id} · ${feeder.label.split(' (')[0]}`}
                          </span>
                          <span style={styles.groupHeaderKw}>
                            {`${feederAlloc.allocatedKw} / ${feederAlloc.demandKw} kW · ${feeder.breakerLabel}`}
                          </span>
                        </div>
                        {visible.length > 0 ? (
                          <div style={styles.tileGrid}>
                            {visible.map(id => (
                              <StallTile
                                key={id}
                                stall={stalls[id]}
                                alloc={allocation.perStall[id]}
                                isSelected={selectedStallId === id}
                                onSelect={selectStall}
                              />
                            ))}
                          </div>
                        ) : (
                          <div style={styles.emptyGroupNote}>
                            No stalls match the current filter
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </div>
              {band <= 3 ? (
                <div style={{...styles.aside, width: asideWidth}}>
                  <div style={styles.asideHeader}>
                    <Heading level={2} style={{fontSize: 14, margin: 0}}>
                      {`Stall ${selectedStall.id}`}
                    </Heading>
                    <Badge
                      variant={STATE_BADGE[selectedStall.state]}
                      label={STALL_STATE_LABEL[selectedStall.state]}
                    />
                    {selectedStall.state === 'charging' &&
                    allocation.perStall[selectedStallId].curtailedKw > 0 ? (
                      <Badge
                        variant="orange"
                        label={`−${allocation.perStall[selectedStallId].curtailedKw} kW`}
                      />
                    ) : null}
                  </div>
                  {detail}
                </div>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
      {/* < 840px: the aside's content moves into a DS Dialog (the DS ships
          no Sheet/Drawer); the Dialog owns Escape + focus restoration. */}
      <Dialog
        isOpen={band === 4 && isSheetOpen}
        onOpenChange={open => {
          if (!open) {
            setSheetOpen(false);
          }
        }}
        purpose="info"
        width="min(360px, 92vw)">
        <Layout
          header={
            <DialogHeader
              title={`Stall ${selectedStall.id}`}
              subtitle={`${selectedStall.connector} · ${STALL_STATE_LABEL[selectedStall.state]}`}
              onOpenChange={open => {
                if (!open) {
                  setSheetOpen(false);
                }
              }}
            />
          }
          content={<LayoutContent padding={0}>{detail}</LayoutContent>}
        />
      </Dialog>
      {/* The one polite live region: allocation recomputes, pause/resume,
          fault clears, tariff cycles. */}
      <div aria-live="polite" style={styles.srOnly}>
        {announcement}
      </div>
    </div>
  );
}
