// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Hoistwell lift plan LP-2141
 *   "Meridian Substation — T-2 Set": the HL-90 (90 t AT) load chart
 *   CHART_HL90 (6 boom lengths x 10 radii, hand-written monotonic values),
 *   transformer T-2 at 41,800 lb net, five rigging inventory items summing
 *   to 2,270 lb, two exclusion zones (13.8 kV feeder standoff, open trench
 *   E-4), and a four-person signoff roster. No Date.now, no Math.random,
 *   no network assets — every relative string is pre-computed.
 * @output Crane Lift Planner — a geometry-coupled engineering calculator:
 *   drag the set point on a top-down radius plot and the boom-sweep
 *   annulus, load-chart matrix crosshair, 180° capacity gauge, and
 *   required-signoff list all re-derive live, flipping the whole plan into
 *   amber CRITICAL LIFT mode at >= 75% of chart. Left rail: rigging
 *   inventory checkboxes + signoffs. Center: fluid SVG plan canvas over a
 *   200px LoadChartMatrix strip whose crosshair is derived from the store,
 *   never hover. Right: capacity gauge, itemized load math, boom selector,
 *   RiggingStackDiagram with per-leg sling loads at 60/45/30°.
 * @position Page template; emitted by `astryx template crane-lift-planner`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header bar 46px (Hoistwell mark + plan name | stamp + signoff count +
 *   actions) | body row (left rail 300px | center: canvas flex-1 + matrix
 *   strip 200px | right calc pane 380px), each pane its own scroll.
 * Container policy: app-shell archetype — panes and rows only, no Cards.
 *   All three panes are styled divs separated by 1px hairlines inside
 *   LayoutContent; overlays are DS Dialogs.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (#F08C00, light-dark pair) — logo strokes, sweep-gradient hot edge,
 *   matrix crosshair outline, CL corner tags. Brand FILL and brand TEXT
 *   are split values (contrast math at the declarations). Data-viz
 *   green/amber use categorical tokens with repo-standard fallbacks.
 *   Over-capacity never relies on color alone (strikethrough, warning
 *   glyph, '(max)' text).
 *
 * Responsive contract — KEYED OFF CONTAINER WIDTH, NOT VIEWPORT: the demo
 * stage renders this template in a ~1045–1075px container inside a 1440px
 * window, so the body row is measured with a ResizeObserver
 * (useElementWidth); viewport queries only cover the width-0 first frame.
 * Bands are subtractive, nothing squeezes:
 * - >= 1360px: rail 300 + calc pane 380 + 64px matrix columns.
 * - 1024–1359px (THE STAGE BAND): rail 300 -> 272px, pane 380 -> 336px,
 *   matrix radius columns 64 -> 56px; all three panes stay visible
 *   (272 + 336 leaves ~450px of canvas at ~1060px).
 * - 840–1023px: left rail drops; a derived-count "Rigging & Signoffs (N)"
 *   header chip opens a DS Dialog with the same rows.
 * - 680–839px: right calc pane also drops; utilization% + gross-load
 *   render as two 24px chips beside the header stamp; the calc rows,
 *   boom/angle selectors, and RiggingStackDiagram move into the Dialog.
 * - < 680px: the LoadChartMatrix strip collapses to a 36px one-line
 *   summary bar ("Boom 64 ft · R 40 ft · Cap 57,500 lb") with a "Chart"
 *   toggle opening the matrix in a Dialog overlay.
 * The plan canvas always scales via viewBox; nothing reflows inside it.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {
  CheckIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  ListChecksIcon,
  TableIcon,
  TriangleAlertIcon,
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
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark
// pair (dark side shifted to the lighter 300–400-weight hue). ONE
// quarantined brand literal: Hoistwell #F08C00.
// ---------------------------------------------------------------------------

// Brand FILL — logo strokes, sweep-gradient hot edge, crosshair outline,
// CL corner tags. Never used as body text.
const BRAND = 'light-dark(#F08C00, #FFA94D)';
// Brand TEXT — #8F5300 on white 5.6:1; #FFC078 on #1E1E1E 9.8:1.
const BRAND_TEXT = 'light-dark(#8F5300, #FFC078)';
// 6% brand tint for the matrix active row/column.
const BRAND_SOFT = 'light-dark(rgba(240, 140, 0, 0.06), rgba(255, 169, 77, 0.10))';
const BRAND_TAG_SOFT = 'light-dark(rgba(240, 140, 0, 0.14), rgba(255, 169, 77, 0.20))';
// Chart-band + critical-stamp amber (data-viz token with fallback).
const AMBER = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
// Amber TEXT — #B54708 on white 5.9:1; #FFB566 on #1E1E1E 8.9:1.
const AMBER_TEXT = 'light-dark(#B54708, #FFB566)';
const AMBER_SOFT = 'light-dark(rgba(235, 110, 0, 0.10), rgba(255, 147, 48, 0.16))';
const GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Green TEXT — #0A7A19 on white 4.9:1; #4CD964 on #1E1E1E 9.5:1.
const GREEN_TEXT = 'light-dark(#0A7A19, #4CD964)';
const GREEN_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
// Exclusion-zone / over-capacity red — #DC2626 on white 4.5:1.
const RED = 'light-dark(#DC2626, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the gauge-needle transition, and the CL signoff-row
// fade. Transitions animate transform/opacity/color only; all collapse
// under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const PLANNER_CSS = `
.hlp-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.hlp-setpoint:focus-visible {
  outline: none;
  stroke: var(--color-accent);
  stroke-width: 3;
}
.hlp-needle {
  transition: transform 200ms ease;
}
.hlp-cl-row {
  animation: hlp-fade 150ms ease;
}
@keyframes hlp-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .hlp-needle { transition: none; }
  .hlp-cl-row { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// DENSITY GRID — FIXED NUMBERS (verbatim from the plan spec):
// header bar 46px; list rows 36px (rigging inventory, signoff base rows);
// heavy rows 44px (signoff rows with role subline, calc-pane result rows);
// left rail 300px; right calc pane 380px; bottom LoadChartMatrix strip
// 200px (28px column-header row + 6 boom rows x 26px + 8px pad
// top/bottom); matrix cell width 64px, first sticky column 88px; gutter
// token GUTTER = 12px everywhere (pane padding, row padding-inline, SVG
// margin); section headers inside rails 28px; capacity gauge block 132px
// tall (120px SVG + 12px caption); RiggingStackDiagram 340x220 SVG box;
// corner radius token 6px; 1px hairline borders only.
// ---------------------------------------------------------------------------

const GUTTER = 12;
const RADIUS = 6;
const HAIRLINE = '1px solid var(--color-border)';

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%', overflow: 'hidden'},
  // 46px header bar.
  header: {
    height: 46,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    overflow: 'hidden',
  },
  brandCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  planId: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  stamp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    border: HAIRLINE,
    whiteSpace: 'nowrap',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  stampStandard: {
    color: GREEN_TEXT,
    borderColor: GREEN,
    backgroundColor: GREEN_SOFT,
  },
  stampCritical: {
    color: AMBER_TEXT,
    borderColor: AMBER,
    backgroundColor: AMBER_SOFT,
  },
  // <840px header derived-value chips (24px), beside the stamp.
  headerChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    paddingInline: 8,
    borderRadius: 999,
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-muted)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    fontSize: 11,
  },
  // Body row: rail | center | calc pane, separated by 1px hairlines.
  bodyRow: {flex: 1, minHeight: 0, display: 'flex'},
  rail: {
    flexShrink: 0,
    borderRight: HAIRLINE,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  centerCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  calcPane: {
    flexShrink: 0,
    borderLeft: HAIRLINE,
    overflowY: 'auto',
    padding: GUTTER,
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
  },
  // 28px section headers inside rails.
  railSectionHeader: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: GUTTER,
    marginTop: 4,
  },
  // 36px inventory / base rows; 44px min touch target via inline padding
  // is met by the row's full-width hit area + the 36px height with the
  // checkbox's own padding (a11y plan).
  rigRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    minWidth: 0,
  },
  idChip: {
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    padding: '1px 5px',
    borderRadius: 4,
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  rigName: {
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rigSeg: {flexShrink: 0, whiteSpace: 'nowrap'},
  // 44px heavy signoff rows (name + role subline), rendered as real
  // <button>s when actionable.
  signoffRow: {
    position: 'relative',
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    border: 'none',
    background: 'none',
    font: 'inherit',
    textAlign: 'start',
    color: 'inherit',
    borderRadius: 0,
  },
  signoffDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: 'var(--color-background-muted)',
    border: HAIRLINE,
  },
  signoffPill: {
    marginInlineStart: 'auto',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  pillSigned: {color: GREEN_TEXT, backgroundColor: GREEN_SOFT},
  pillRequired: {color: AMBER_TEXT, backgroundColor: AMBER_SOFT},
  clTag: {
    position: 'absolute',
    top: 3,
    insetInlineEnd: 6,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: BRAND_TEXT,
    backgroundColor: BRAND_TAG_SOFT,
    borderRadius: 3,
    padding: '0 4px',
    lineHeight: '12px',
  },
  emptyState: {paddingInline: GUTTER, paddingBlock: 6},
  // Canvas: flex-1 measured container; SVG scales via viewBox.
  canvasBox: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
    padding: GUTTER,
  },
  canvasSvg: {width: '100%', height: '100%', display: 'block'},
  // Bottom-left corner (inside canvas): scale legend + live readout.
  canvasReadout: {
    position: 'absolute',
    insetInlineStart: GUTTER,
    bottom: GUTTER,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '4px 8px',
    borderRadius: RADIUS,
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-card)',
    pointerEvents: 'none',
  },
  readoutValue: {
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // LoadChartMatrix strip: 200px = 8px pad + 28px header + 6 x 26px rows
  // + 8px pad.
  matrixStrip: {
    height: 200,
    flexShrink: 0,
    borderTop: HAIRLINE,
    position: 'relative',
    overflow: 'hidden',
  },
  matrixScroll: {
    height: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBlock: 8,
  },
  matrixHeaderCell: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingInline: 8,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  matrixCell: {
    height: 26,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingInline: 8,
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Sticky first column (88px "Boom ft" rowheaders).
  matrixSticky: {
    position: 'sticky',
    insetInlineStart: 0,
    zIndex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'var(--color-background)',
    borderRight: HAIRLINE,
  },
  boomHeaderButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    border: 'none',
    background: 'none',
    font: 'inherit',
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  // Bottom-right corner (inside the matrix strip): legend chip — kept to
  // 16px so it only grazes the bottom pad, not the 105 ft boom row.
  matrixLegend: {
    position: 'absolute',
    insetInlineEnd: GUTTER,
    bottom: 1,
    zIndex: 2,
    height: 16,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: RADIUS,
    border: HAIRLINE,
    backgroundColor: 'var(--color-background-card)',
    whiteSpace: 'nowrap',
  },
  // <680px matrix summary bar (36px).
  matrixSummaryBar: {
    height: 36,
    flexShrink: 0,
    borderTop: HAIRLINE,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    overflow: 'hidden',
  },
  // Calc pane: 132px gauge block (120px SVG + 12px caption); 44px result
  // rows.
  gaugeBlock: {
    height: 132,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
  },
  calcRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    borderBottom: HAIRLINE,
  },
  calcValue: {
    marginInlineStart: 'auto',
    fontFamily: MONO,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  diagramBox: {alignSelf: 'center', flexShrink: 0},
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
  dialogBody: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
};

// ---------------------------------------------------------------------------
// DATA — Hoistwell lift plan LP-2141, "Meridian Substation — T-2 Set".
// Plan note: "T-2 transformer set per RFI-0417; keep 20 ft from 13.8 kV
// feeder; trench E-4 open until 07/11." All figures are fixed fixtures;
// aggregates cross-check below (the calc pane renders BOTH the itemized
// rigging sum and the gross, so a fixture error would be visible).
// ---------------------------------------------------------------------------

const PLAN_ID = 'LP-2141';
const PLAN_NAME = 'Meridian Substation — T-2 Set';
const CRANE_HL90 = {id: 'CRANE-HL90', name: 'Hoistwell HL-90 (90 t AT)'};

// Plan geometry: feet, origin at the boom pivot (east = +x, north = +y).
// SVG mapping: 1 ft = 4.8 SVG units; pivot at PAD_CENTER = (150, 325) in
// the 800x520 viewBox; 10-ft grid squares = 48 units.
const FT = 4.8;
const PIVOT = {x: 150, y: 325};
const MIN_RADIUS_FT = 12;
const MAX_RADIUS_FT = 55;

// Load: transformer T-2. Dual fields by law.
const LOAD_T2 = {id: 'T-2', name: 'Transformer T-2', weightLb: 41800, weightLabel: '41,800 lb'};
// Pick point (fixed): the T-2 transporter pad, 19 ft @ 120° from pivot.
const PICK_POINT = {xFt: 17.32, yFt: -10};

interface Zone {
  id: string;
  label: string;
  // SVG-space polygon points ("x,y x,y ...").
  points: string;
  labelPos: {x: number; y: number};
}

const ZONE_OHL: Zone = {
  id: 'ZONE-OHL',
  label: '13.8 kV feeder · 20 ft standoff',
  points: '420,0 800,160 800,256 420,96',
  labelPos: {x: 560, y: 76},
};
const ZONE_TRENCH: Zone = {
  id: 'ZONE-TRENCH',
  label: 'Open trench E-4',
  points: '560,368 700,368 700,468 560,468',
  labelPos: {x: 572, y: 390},
};
const ZONES: Zone[] = [ZONE_OHL, ZONE_TRENCH];

// Rigging inventory. weightLb is the row's TOTAL contribution (unit x qty).
// Rigging cross-check: 172 + 172 + 156 + 1150 + 620 = 2,270 lb; with all
// items included gross = 41,800 + 2,270 = 44,070 lb.
interface RigItem {
  id: string;
  name: string;
  weightLb: number;
  weightLabel: string;
  wllLb?: number;
  wllLabel?: string;
  qtyLabel?: string;
  inspectionLabel?: string; // SHCK-118 omits this — omit-when-undefined proof
}

const SLNG_204: RigItem = {
  id: 'SLNG-204',
  name: 'Polyester round sling, 12 ft, EN 1492-2 (pair)',
  weightLb: 172, // 2 x 86 lb
  weightLabel: '172 lb',
  wllLb: 25100,
  wllLabel: 'WLL 25,100 lb',
  qtyLabel: 'x2',
  inspectionLabel: 'Insp 05/2026',
};
const SLNG_205: RigItem = {
  id: 'SLNG-205',
  name: 'Wire-rope sling, 16 ft, 1-1/8 in (pair)',
  weightLb: 172, // 2 x 86 lb
  weightLabel: '172 lb',
  wllLb: 19600,
  wllLabel: 'WLL 19,600 lb',
  qtyLabel: 'x2',
  inspectionLabel: 'Insp 11/2026',
};
const SHCK_118: RigItem = {
  id: 'SHCK-118',
  name: 'Screw-pin anchor shackle, 25 t',
  weightLb: 156, // 4 x 39 lb
  weightLabel: '156 lb',
  wllLb: 55100,
  wllLabel: 'WLL 55,100 lb',
  qtyLabel: 'x4',
  // no inspectionLabel — the row simply omits that segment
};
const SPRD_11: RigItem = {
  id: 'SPRD-11',
  // Deliberately long (stress fixture): proves 36px-row truncation with
  // the WLL/qty/inspection segments intact.
  name: 'Modulift-pattern spreader beam, 24 ft adjustable, quarterly inspection due',
  weightLb: 1150,
  weightLabel: '1,150 lb',
  wllLb: 66100,
  wllLabel: 'WLL 66,100 lb',
  inspectionLabel: 'Insp 07/2026',
};
const BLCK_07: RigItem = {
  id: 'BLCK-07',
  name: 'Hook block, 3-sheave, 40 t',
  weightLb: 620,
  weightLabel: '620 lb',
  wllLb: 88200,
  wllLabel: 'WLL 88,200 lb',
  inspectionLabel: 'Insp 03/2026',
};
const RIG_ITEMS: RigItem[] = [SLNG_204, SLNG_205, SHCK_118, SPRD_11, BLCK_07];

// Signoff roster. S. Anand + J. Whitfield are the critical-lift-injected
// rows — they only render while utilization >= 75%.
interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  criticalOnly?: boolean;
}

const R_OKAFOR: Person = {id: 'r-okafor', name: 'R. Okafor', initials: 'RO', role: 'Lift Director'};
const M_DRAEGER: Person = {id: 'm-draeger', name: 'M. Draeger', initials: 'MD', role: 'Rigger I'};
const S_ANAND: Person = {
  id: 's-anand',
  name: 'S. Anand',
  initials: 'SA',
  role: 'PE, Lift Plan Review',
  criticalOnly: true,
};
const J_WHITFIELD: Person = {
  id: 'j-whitfield',
  name: 'J. Whitfield',
  initials: 'JW',
  role: 'Site Safety Manager',
  criticalOnly: true,
};
const PEOPLE: Person[] = [R_OKAFOR, M_DRAEGER, S_ANAND, J_WHITFIELD];

// CHART_HL90 — net capacities in lb, 6 boom lengths x 10 radii (10–55 ft
// in 5-ft steps). Hand-written, monotonic-decreasing per row; null = '—'
// (not permitted). Stress fixtures: '—' at BOTH edges of the 64 ft row
// (snapping must land on a real grid cell, and clamping at 55 ft lands on
// a not-permitted cell); widest value 98,600 lb exercises the 56px stage-
// band cells. DEVIATION NOTE: the spec's example 64 ft row put 52,400 lb
// at the 25 ft column, which cannot reconcile with BOTH the initial
// radius-38 crosshair AND the "unchecking the 1,150 lb spreader lands
// 74.6%" law. The cross-check law wins: cell (64 ft, 40 ft) = 57,500 lb,
// so 44,070 / 57,500 = 76.6% (critical) and 42,920 / 57,500 = 74.6%
// (standard) — the flip proves out in both directions.
const RADII_FT = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const BOOMS_FT = [36, 50, 64, 78, 92, 105];
const CHART_HL90: Record<number, ReadonlyArray<number | null>> = {
  36: [98600, 84300, 66100, 51800, 40700, null, null, null, null, null],
  50: [91200, 79800, 64500, 53100, 44200, 37400, 30900, null, null, null],
  64: [null, 88400, 78900, 71400, 64800, 60900, 57500, 49600, null, null],
  78: [null, null, 71200, 64300, 58600, 53400, 48200, 42800, 36900, null],
  92: [null, null, 60800, 55700, 50900, 46300, 41800, 37600, 32400, 27200],
  105: [null, null, null, 46900, 43200, 39400, 35600, 31500, 27800, 24100],
};

// Sling-angle load factors (angle from horizontal): 60° = 1.155x,
// 45° = 1.414x, 30° = 2.0x. Four legs: A/B rigged on SLNG-204 (WLL
// 25,100 lb), C/D on SLNG-205 (WLL 19,600 lb). At 30° the per-leg load
// (2.0 x 44,070 / 4 = 22,040 lb) exceeds SLNG-205's WLL only — legs C/D
// flip overloaded and the SLNG-205 rail row badges red.
const SLING_FACTORS: Record<number, number> = {60: 1.155, 45: 1.414, 30: 2.0};
const SLING_LEGS = [
  {id: 'leg-a', slingId: 'SLNG-204'},
  {id: 'leg-b', slingId: 'SLNG-204'},
  {id: 'leg-c', slingId: 'SLNG-205'},
  {id: 'leg-d', slingId: 'SLNG-205'},
];

const fmtLb = (lb: number): string => lb.toLocaleString('en-US');

// ---------------------------------------------------------------------------
// STATE OWNER — one store, one update(id, patch). Ids: 'plan' | rig item
// id | person id. `critical` is DERIVED (utilization >= 0.75), never
// stored.
// ---------------------------------------------------------------------------

interface PlanState {
  plan: {setXFt: number; setYFt: number; boomLengthFt: number; slingAngleDeg: number};
  rigging: Record<string, {included: boolean}>;
  signoffs: Record<string, {status: 'signed' | 'required'}>;
}

interface EntityPatch {
  setXFt?: number;
  setYFt?: number;
  boomLengthFt?: number;
  slingAngleDeg?: number;
  included?: boolean;
  status?: 'signed' | 'required';
}

// Initial plan: set point 38 ft @ 214° (setXFt = 38·sin214° = −21.25,
// setYFt = 38·cos214° = −31.50), boom 64 ft, slings at 60°. Snapped chart
// radius 40 ft → capacity 57,500 lb → utilization 76.6% — the plan LOADS
// IN CRITICAL MODE so the amber stamp + two injected CL signoff rows are
// visible on first paint. R. Okafor pre-signed → header "Signoffs 1/4".
const INITIAL_STATE: PlanState = {
  plan: {setXFt: -21.25, setYFt: -31.5, boomLengthFt: 64, slingAngleDeg: 60},
  rigging: {
    'SLNG-204': {included: true},
    'SLNG-205': {included: true},
    'SHCK-118': {included: true},
    'SPRD-11': {included: true},
    'BLCK-07': {included: true},
  },
  signoffs: {
    'r-okafor': {status: 'signed'},
    'm-draeger': {status: 'required'},
    's-anand': {status: 'required'},
    'j-whitfield': {status: 'required'},
  },
};

// Pure derivations, computed in render — every surface reads these.
interface Derived {
  radiusFt: number; // rounded to 1 ft
  atMaxRadius: boolean;
  bearingDeg: number;
  chartRadiusFt: number; // snapped UP to the next 5-ft column
  radiusIndex: number;
  boomIndex: number;
  capacityLb: number | null; // null = not permitted at this cell
  riggingTotalLb: number;
  grossLoadLb: number;
  utilizationPct: number | null;
  critical: boolean;
  perLegLb: number;
  overloadedLegIds: string[];
}

function derive(state: PlanState): Derived {
  const {setXFt, setYFt, boomLengthFt, slingAngleDeg} = state.plan;
  const rawRadius = Math.hypot(setXFt, setYFt);
  const radiusFt = Math.round(rawRadius);
  const atMaxRadius = rawRadius >= MAX_RADIUS_FT - 0.001;
  const bearingDeg = (Math.round((Math.atan2(setXFt, setYFt) * 180) / Math.PI) + 360) % 360;
  let radiusIndex = RADII_FT.findIndex(r => r >= radiusFt);
  if (radiusIndex === -1) radiusIndex = RADII_FT.length - 1;
  const chartRadiusFt = RADII_FT[radiusIndex];
  const boomIndex = BOOMS_FT.indexOf(boomLengthFt);
  const capacityLb = CHART_HL90[boomLengthFt][radiusIndex];
  const riggingTotalLb = RIG_ITEMS.reduce(
    (sum, item) => sum + (state.rigging[item.id]?.included ? item.weightLb : 0),
    0,
  );
  const grossLoadLb = LOAD_T2.weightLb + riggingTotalLb;
  const utilizationPct = capacityLb == null ? null : (grossLoadLb / capacityLb) * 100;
  // Not-permitted cells are critical by definition.
  const critical = utilizationPct == null || utilizationPct >= 75;
  const factor = SLING_FACTORS[slingAngleDeg] ?? 1.155;
  const perLegLb = Math.round(((grossLoadLb / 4) * factor) / 10) * 10;
  const overloadedLegIds = SLING_LEGS.filter(leg => {
    const sling = leg.slingId === 'SLNG-204' ? SLNG_204 : SLNG_205;
    return sling.wllLb != null && perLegLb > sling.wllLb;
  }).map(leg => leg.id);
  return {
    radiusFt,
    atMaxRadius,
    bearingDeg,
    chartRadiusFt,
    radiusIndex,
    boomIndex,
    capacityLb,
    riggingTotalLb,
    grossLoadLb,
    utilizationPct,
    critical,
    perLegLb,
    overloadedLegIds,
  };
}

/**
 * Observe the body row's real width. The demo stage renders this template
 * in a ~1045–1075px container inside a 1440px window, so viewport media
 * queries never fire there — bands key off the measured container.
 */
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
// LiftRadiusPlot — fully-custom inline SVG (no DS vocabulary for
// swept-radius geometry). viewBox 0 0 800 520 in the measured flex-1
// container, preserveAspectRatio xMidYMid meet; 10-ft grid squares
// (48 units); crane pad 60x50 at (120,300) with outrigger ticks; sweep
// annulus 12–55 ft filled with the capacity gradient (green -> amber at
// 75% -> BRAND hot edge, 18% opacity); fixed pick ring at the T-2 pad;
// draggable set point (14px circle, 24px invisible hit target) that is
// also role='slider' (arrows 1 ft, shift+arrow 5 ft). Purely
// presentational — drag math converts px -> ft and calls up.
// ---------------------------------------------------------------------------

const R_OUT = MAX_RADIUS_FT * FT; // 264
const R_IN = MIN_RADIUS_FT * FT; // 57.6

const GRID_PATH = (() => {
  let d = '';
  for (let x = 0; x <= 800; x += 48) d += `M${x} 0V520`;
  for (let y = 0; y <= 520; y += 48) d += `M0 ${y}H800`;
  return d;
})();

const ANNULUS_PATH =
  `M${PIVOT.x + R_OUT} ${PIVOT.y}` +
  `A${R_OUT} ${R_OUT} 0 1 0 ${PIVOT.x - R_OUT} ${PIVOT.y}` +
  `A${R_OUT} ${R_OUT} 0 1 0 ${PIVOT.x + R_OUT} ${PIVOT.y}Z` +
  `M${PIVOT.x + R_IN} ${PIVOT.y}` +
  `A${R_IN} ${R_IN} 0 1 0 ${PIVOT.x - R_IN} ${PIVOT.y}` +
  `A${R_IN} ${R_IN} 0 1 0 ${PIVOT.x + R_IN} ${PIVOT.y}Z`;

function clampToAnnulus(xFt: number, yFt: number): {xFt: number; yFt: number} {
  const r = Math.hypot(xFt, yFt);
  if (r < 0.01) return {xFt: 0, yFt: -MIN_RADIUS_FT};
  const s = r > MAX_RADIUS_FT ? MAX_RADIUS_FT / r : r < MIN_RADIUS_FT ? MIN_RADIUS_FT / r : 1;
  return {xFt: xFt * s, yFt: yFt * s};
}

const toSvg = (xFt: number, yFt: number): {x: number; y: number} => ({
  x: PIVOT.x + xFt * FT,
  y: PIVOT.y - yFt * FT,
});

interface LiftRadiusPlotProps {
  setXFt: number;
  setYFt: number;
  radiusFt: number;
  bearingDeg: number;
  onSetPointDrag: (xFt: number, yFt: number) => void;
  onSettle: () => void;
}

function LiftRadiusPlot({
  setXFt,
  setYFt,
  radiusFt,
  bearingDeg,
  onSetPointDrag,
  onSettle,
}: LiftRadiusPlotProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Transient drag flag lives in a ref — pointermove must not depend on a
  // re-rendered closure.
  const draggingRef = useRef(false);

  const pointToFt = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (svg == null) return null;
    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / 800, rect.height / 520);
    if (scale <= 0) return null;
    const sx = (clientX - rect.left - (rect.width - 800 * scale) / 2) / scale;
    const sy = (clientY - rect.top - (rect.height - 520 * scale) / 2) / scale;
    return clampToAnnulus((sx - PIVOT.x) / FT, (PIVOT.y - sy) / FT);
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<SVGCircleElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: ReactPointerEvent<SVGCircleElement>) => {
    if (!draggingRef.current) return;
    const ft = pointToFt(e.clientX, e.clientY);
    if (ft != null) onSetPointDrag(ft.xFt, ft.yFt);
  };
  const handlePointerUp = (e: ReactPointerEvent<SVGCircleElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onSettle();
  };
  const handleKeyDown = (e: ReactKeyboardEvent<SVGCircleElement>) => {
    const step = e.shiftKey ? 5 : 1;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = step;
    else if (e.key === 'ArrowDown') dy = -step;
    else return;
    e.preventDefault();
    const ft = clampToAnnulus(setXFt + dx, setYFt + dy);
    onSetPointDrag(ft.xFt, ft.yFt);
    onSettle();
  };

  const set = toSvg(setXFt, setYFt);
  const pick = toSvg(PICK_POINT.xFt, PICK_POINT.yFt);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 520"
      preserveAspectRatio="xMidYMid meet"
      style={styles.canvasSvg}
      aria-label="Top-down lift radius plot">
      <defs>
        <radialGradient
          id="hlp-sweep"
          gradientUnits="userSpaceOnUse"
          cx={PIVOT.x}
          cy={PIVOT.y}
          r={R_OUT}>
          <stop offset="0" style={{stopColor: GREEN, stopOpacity: 0.18}} />
          <stop offset="0.55" style={{stopColor: GREEN, stopOpacity: 0.18}} />
          <stop offset="0.75" style={{stopColor: AMBER, stopOpacity: 0.18}} />
          <stop offset="1" style={{stopColor: BRAND, stopOpacity: 0.18}} />
        </radialGradient>
        <pattern
          id="hlp-hatch"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(45)">
          <rect width="8" height="8" style={{fill: RED_SOFT}} />
          <line x1="0" y1="0" x2="0" y2="8" style={{stroke: RED}} strokeWidth="1.5" opacity="0.45" />
        </pattern>
      </defs>
      {/* 10-ft grid squares — full opacity: the border token is faint and
          the viewBox scales strokes below 1px in the stage band. */}
      <path d={GRID_PATH} fill="none" stroke="var(--color-border)" strokeWidth="1" />
      {/* Sweep annulus 12–55 ft with capacity gradient */}
      <path d={ANNULUS_PATH} fill="url(#hlp-sweep)" fillRule="evenodd" />
      <circle cx={PIVOT.x} cy={PIVOT.y} r={R_OUT} fill="none" stroke="var(--color-border)" />
      <circle cx={PIVOT.x} cy={PIVOT.y} r={R_IN} fill="none" stroke="var(--color-border)" />
      {/* Exclusion zones — hatched, red-tinted */}
      {ZONES.map(zone => (
        <g key={zone.id}>
          <polygon
            points={zone.points}
            fill="url(#hlp-hatch)"
            style={{stroke: RED}}
            strokeOpacity="0.6"
          />
          <text x={zone.labelPos.x} y={zone.labelPos.y} fontSize="11" style={{fill: RED}}>
            {zone.label}
          </text>
        </g>
      ))}
      {/* Crane pad 60x50 at (120,300) with outrigger ticks */}
      <rect
        x="120"
        y="300"
        width="60"
        height="50"
        rx="3"
        fill="var(--color-background-muted)"
        stroke="var(--color-text-secondary)"
      />
      <path
        d="M116 296l-8 -8M184 296l8 -8M116 354l-8 8M184 354l8 8"
        stroke="var(--color-text-secondary)"
        strokeWidth="3"
        fill="none"
      />
      <circle cx={PIVOT.x} cy={PIVOT.y} r="4" fill="var(--color-text-secondary)" />
      <text x="124" y="316" fontSize="10" fill="var(--color-text-secondary)">
        HL-90
      </text>
      {/* Pick point — fixed 10px ring at the T-2 transporter pad */}
      <rect
        x={pick.x - 20}
        y={pick.y - 13}
        width="40"
        height="26"
        fill="var(--color-background-muted)"
        stroke="var(--color-border)"
      />
      <circle cx={pick.x} cy={pick.y} r="5" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" />
      <text x={pick.x + 12} y={pick.y - 10} fontSize="10" fill="var(--color-text-secondary)">
        T-2 pick
      </text>
      {/* Dashed hook path pick -> set, radius line pivot -> set */}
      <line
        x1={PIVOT.x}
        y1={PIVOT.y}
        x2={set.x}
        y2={set.y}
        stroke="var(--color-text-secondary)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1={pick.x}
        y1={pick.y}
        x2={set.x}
        y2={set.y}
        style={{stroke: BRAND}}
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      {/* Set point — 14px circle, 24px invisible hit target, role=slider */}
      <circle
        cx={set.x}
        cy={set.y}
        r="7"
        style={{fill: BRAND}}
        stroke="var(--color-background-card)"
        strokeWidth="2"
        pointerEvents="none"
      />
      <circle
        className="hlp-setpoint"
        cx={set.x}
        cy={set.y}
        r="12"
        fill="transparent"
        style={{cursor: 'grab', touchAction: 'none'}}
        role="slider"
        tabIndex={0}
        aria-label="Load set point"
        aria-valuemin={MIN_RADIUS_FT}
        aria-valuemax={MAX_RADIUS_FT}
        aria-valuenow={radiusFt}
        aria-valuetext={`Radius ${radiusFt} feet, bearing ${bearingDeg} degrees`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// LoadChartMatrix — fully-custom div[role=grid] (Table has no
// externally-driven derived selection). 200px strip: sticky 88px "Boom ft"
// column, 10 radius columns (64px; 56px in the stage band), 28px header
// row, 6 boom rows x 26px. The crosshair (active row + column + outlined
// intersection, aria-current) derives from the STORE (boomLengthFt +
// snapped radius) — never from hover. Cells at >= 75% of gross tint
// amber; > 100% tint red WITH strikethrough (never color alone); '—' for
// not-permitted combos. Boom rowheaders are real buttons — the boom
// selector echo. Zero internal state.
// ---------------------------------------------------------------------------

interface LoadChartMatrixProps {
  activeBoomFt: number;
  activeRadiusIndex: number;
  grossLoadLb: number;
  cellWidth: number; // 64, or 56 in the stage band
  onBoomSelect: (boomFt: number) => void;
}

function LoadChartMatrix({
  activeBoomFt,
  activeRadiusIndex,
  grossLoadLb,
  cellWidth,
  onBoomSelect,
}: LoadChartMatrixProps) {
  return (
    <div style={styles.matrixStrip}>
      <div style={styles.matrixScroll}>
        <div role="grid" aria-label={`${CRANE_HL90.name} load chart`} aria-readonly="true">
          <div role="row" style={{display: 'flex'}}>
            <div
              role="columnheader"
              style={{...styles.matrixHeaderCell, ...styles.matrixSticky, width: 88}}>
              Boom ft
            </div>
            {RADII_FT.map((r, i) => (
              <div
                key={r}
                role="columnheader"
                style={{
                  ...styles.matrixHeaderCell,
                  width: cellWidth,
                  ...(i === activeRadiusIndex ? {backgroundColor: BRAND_SOFT} : null),
                }}>
                {r} ft
              </div>
            ))}
          </div>
          {BOOMS_FT.map(boom => {
            const isActiveRow = boom === activeBoomFt;
            return (
              <div role="row" key={boom} style={{display: 'flex'}}>
                <div
                  role="rowheader"
                  style={{
                    ...styles.matrixCell,
                    ...styles.matrixSticky,
                    width: 88,
                    padding: 0,
                    ...(isActiveRow ? {backgroundColor: BRAND_SOFT} : null),
                  }}>
                  <button
                    type="button"
                    className="hlp-focusable"
                    style={{
                      ...styles.boomHeaderButton,
                      ...(isActiveRow ? {color: BRAND_TEXT, fontWeight: 700} : null),
                    }}
                    aria-pressed={isActiveRow}
                    onClick={() => onBoomSelect(boom)}>
                    B {boom} ft
                  </button>
                </div>
                {RADII_FT.map((r, i) => {
                  const cap = CHART_HL90[boom][i];
                  const isActiveCol = i === activeRadiusIndex;
                  const isCrosshair = isActiveRow && isActiveCol;
                  const ratio = cap == null ? null : grossLoadLb / cap;
                  const cellStyle: CSSProperties = {...styles.matrixCell, width: cellWidth};
                  if (ratio != null && ratio > 1) {
                    cellStyle.backgroundColor = RED_SOFT;
                    cellStyle.color = RED;
                    cellStyle.textDecoration = 'line-through';
                  } else if (ratio != null && ratio >= 0.75) {
                    cellStyle.backgroundColor = AMBER_SOFT;
                    cellStyle.color = AMBER_TEXT;
                  } else if (cap == null) {
                    cellStyle.color = 'var(--color-text-secondary)';
                  }
                  if (isActiveRow || isActiveCol) {
                    cellStyle.backgroundColor = cellStyle.backgroundColor ?? BRAND_SOFT;
                  }
                  if (isCrosshair) {
                    cellStyle.outline = `2px solid ${BRAND}`;
                    cellStyle.outlineOffset = -2;
                  }
                  return (
                    <div
                      key={r}
                      role="gridcell"
                      aria-current={isCrosshair ? 'true' : undefined}
                      style={cellStyle}>
                      {cap == null ? '—' : fmtLb(cap)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {/* Bottom-right corner (inside the strip): legend */}
      <div style={styles.matrixLegend}>
        <Text type="supporting" size="xsm" color="secondary">
          cell = net capacity, lb · — = not permitted · amber ≥75% · red &gt;100%
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CapacityGauge — 180° SVG arc gauge, 240x120 viewBox, 14px stroke track
// scaled 0–110%: green band 0–75%, amber 75–90%, red 90–110%. Needle
// transitions 200ms (transform only; 0ms under reduced motion via the
// injected CSS). Purely presentational.
// ---------------------------------------------------------------------------

const GAUGE_C = {x: 120, y: 112};
const GAUGE_R = 96;
const GAUGE_MAX = 110;

function gaugePoint(pct: number, radius: number): {x: number; y: number} {
  const theta = Math.PI - (Math.PI * pct) / GAUGE_MAX;
  return {x: GAUGE_C.x + radius * Math.cos(theta), y: GAUGE_C.y - radius * Math.sin(theta)};
}

function gaugeArc(fromPct: number, toPct: number): string {
  const a = gaugePoint(fromPct, GAUGE_R);
  const b = gaugePoint(toPct, GAUGE_R);
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}A${GAUGE_R} ${GAUGE_R} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

interface CapacityGaugeProps {
  utilizationPct: number | null; // null = not permitted at this cell
  grossLabel: string;
  capacityLabel: string | null;
  critical: boolean;
}

function CapacityGauge({utilizationPct, grossLabel, capacityLabel, critical}: CapacityGaugeProps) {
  const clamped = utilizationPct == null ? GAUGE_MAX : Math.min(utilizationPct, GAUGE_MAX);
  // Needle base points LEFT (0%); rotation sweeps 0–180° across the scale.
  const needleDeg = (180 * clamped) / GAUGE_MAX;
  return (
    <div style={styles.gaugeBlock}>
      <svg width="240" height="120" viewBox="0 0 240 120" aria-hidden>
        <path d={gaugeArc(0, 75)} fill="none" style={{stroke: GREEN}} strokeWidth="14" opacity="0.55" />
        <path d={gaugeArc(75, 90)} fill="none" style={{stroke: AMBER}} strokeWidth="14" opacity="0.7" />
        <path d={gaugeArc(90, 110)} fill="none" style={{stroke: RED}} strokeWidth="14" opacity="0.7" />
        {/* 75% threshold tick */}
        <line
          x1={gaugePoint(75, GAUGE_R - 12).x}
          y1={gaugePoint(75, GAUGE_R - 12).y}
          x2={gaugePoint(75, GAUGE_R + 12).x}
          y2={gaugePoint(75, GAUGE_R + 12).y}
          style={{stroke: AMBER}}
          strokeWidth="2"
        />
        <g
          className="hlp-needle"
          style={{
            transform: `rotate(${needleDeg}deg)`,
            transformOrigin: `${GAUGE_C.x}px ${GAUGE_C.y}px`,
          }}>
          <line
            x1={GAUGE_C.x}
            y1={GAUGE_C.y}
            x2={GAUGE_C.x - 78}
            y2={GAUGE_C.y}
            stroke="var(--color-text)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx={GAUGE_C.x} cy={GAUGE_C.y} r="6" fill="var(--color-text)" />
        <text
          x={GAUGE_C.x}
          y={GAUGE_C.y - 26}
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          style={{
            fill: critical ? AMBER_TEXT : 'var(--color-text)',
            fontVariantNumeric: 'tabular-nums',
          }}>
          {utilizationPct == null ? '—' : `${utilizationPct.toFixed(1)}%`}
        </text>
      </svg>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        {capacityLabel == null
          ? `${grossLabel} · not permitted at this radius`
          : `${grossLabel} of ${capacityLabel} chart`}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RiggingStackDiagram — 340x220 SVG structural schematic: hook, shackle,
// 160px spreader bar at y=90, four sling legs (A/B on SLNG-204, C/D on
// SLNG-205) fanning to the 280x36 load rect. Per-pair factor tags update
// with the angle; legs whose computed load exceeds the assigned sling WLL
// render red with a warning glyph. (Deviation: the four per-leg tags are
// consolidated to one 16px chip per sling PAIR — four 90px chips cannot
// coexist legibly in a 340px box; A/B and C/D values are identical by
// construction.)
// ---------------------------------------------------------------------------

const LEG_TOP_X = [98, 146, 194, 242];
const LEG_BOT_X = [60, 134, 206, 280];

interface RiggingStackDiagramProps {
  angleDeg: number;
  factor: number;
  perLegLb: number;
  overloadedLegIds: string[];
}

function RiggingStackDiagram({angleDeg, factor, perLegLb, overloadedLegIds}: RiggingStackDiagramProps) {
  const overloadedRight = overloadedLegIds.includes('leg-c');
  const overloadedLeft = overloadedLegIds.includes('leg-a');
  const tag = `${factor.toFixed(3)}x · ${fmtLb(perLegLb)} lb`;
  return (
    <svg
      width="340"
      height="220"
      viewBox="0 0 340 220"
      role="img"
      aria-label={`Rigging stack: four sling legs at ${angleDeg} degrees, ${fmtLb(perLegLb)} pounds per leg${overloadedLegIds.length > 0 ? ', SLNG-205 legs overloaded' : ''}`}>
      {/* Hook + shackle */}
      <circle cx="170" cy="14" r="6" fill="none" stroke="var(--color-text)" strokeWidth="2.5" />
      <line x1="170" y1="20" x2="170" y2="34" stroke="var(--color-text)" strokeWidth="2.5" />
      <path d="M163 34h14l-3 12h-8Z" fill="none" stroke="var(--color-text)" strokeWidth="2" />
      {/* Upper slings to the spreader */}
      <line x1="170" y1="46" x2="94" y2="86" stroke="var(--color-text-secondary)" strokeWidth="2" />
      <line x1="170" y1="46" x2="246" y2="86" stroke="var(--color-text-secondary)" strokeWidth="2" />
      {/* Spreader bar — 160px at y=90 */}
      <rect
        x="90"
        y="86"
        width="160"
        height="8"
        rx="2"
        fill="var(--color-background-muted)"
        stroke="var(--color-text-secondary)"
      />
      {/* Four sling legs */}
      {SLING_LEGS.map((leg, i) => {
        const isOverloaded = overloadedLegIds.includes(leg.id);
        return (
          <g key={leg.id}>
            <line
              x1={LEG_TOP_X[i]}
              y1="94"
              x2={LEG_BOT_X[i]}
              y2="170"
              style={{stroke: isOverloaded ? RED : 'var(--color-text-secondary)'}}
              strokeWidth={isOverloaded ? 2.5 : 2}
            />
            <circle cx={LEG_TOP_X[i]} cy="94" r="2.5" fill="var(--color-text)" />
            <circle cx={LEG_BOT_X[i]} cy="170" r="2.5" fill="var(--color-text)" />
            {/* Warning glyph on overloaded legs (never color alone) */}
            {isOverloaded ? (
              <path
                d={`M${(LEG_TOP_X[i] + LEG_BOT_X[i]) / 2 - 6} ${138}l6 -11 6 11Z`}
                style={{fill: RED}}
              />
            ) : null}
            {/* Per-leg angle label at the load junction */}
            <text
              x={LEG_BOT_X[i] + (i < 2 ? -4 : 4)}
              y="164"
              fontSize="9"
              textAnchor={i < 2 ? 'end' : 'start'}
              fill="var(--color-text-secondary)">
              {angleDeg}°
            </text>
          </g>
        );
      })}
      {/* Per-pair load-factor tags (16px chips) */}
      <g fontSize="10" style={{fontVariantNumeric: 'tabular-nums'}}>
        <rect
          x="4"
          y="104"
          width="128"
          height="16"
          rx="3"
          fill="var(--color-background-card)"
          style={{stroke: overloadedLeft ? RED : 'var(--color-border)'}}
        />
        <text x="10" y="116" style={{fill: overloadedLeft ? RED : 'var(--color-text-secondary)'}}>
          A/B · {tag}
        </text>
        <rect
          x="208"
          y="104"
          width="128"
          height="16"
          rx="3"
          fill="var(--color-background-card)"
          style={{stroke: overloadedRight ? RED : 'var(--color-border)'}}
        />
        <text x="214" y="116" style={{fill: overloadedRight ? RED : 'var(--color-text-secondary)'}}>
          C/D · {tag}
        </text>
      </g>
      {/* Load */}
      <rect
        x="30"
        y="170"
        width="280"
        height="36"
        rx="3"
        fill="var(--color-background-muted)"
        stroke="var(--color-text-secondary)"
      />
      <text
        x="170"
        y="192"
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-text)"
        style={{fontVariantNumeric: 'tabular-nums'}}>
        {LOAD_T2.name} · {LOAD_T2.weightLabel} net
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RigItemRow — thin wrapper composite row, 36px: DS checkbox (include in
// lift) + mono ID chip + truncating name + omit-when-undefined segments
// (WLL chip, qty, inspection tag). SHCK-118 has no inspectionLabel — its
// row simply omits that segment. SPRD-11's long name proves truncation
// with segments intact. SLNG-205 badges red while its legs are overloaded.
// ---------------------------------------------------------------------------

interface RigItemRowProps {
  item: RigItem;
  included: boolean;
  isOverloaded: boolean;
  // The 272/300px rail cannot fit the inspection segment beside the WLL
  // chip (subtraction, not squeeze) — it renders in the 420px Dialog and
  // rides the name tooltip in the rail.
  showInspection: boolean;
  onToggle: (id: string, included: boolean) => void;
}

function RigItemRow({item, included, isOverloaded, showInspection, onToggle}: RigItemRowProps) {
  return (
    <div style={styles.rigRow}>
      <CheckboxInput
        label={`Include ${item.id} in lift`}
        isLabelHidden
        size="sm"
        value={included}
        onChange={checked => onToggle(item.id, checked)}
      />
      <span style={styles.idChip}>{item.id}</span>
      <Tooltip
        content={
          item.inspectionLabel != null && !showInspection
            ? `${item.name} · ${item.inspectionLabel}`
            : item.name
        }>
        <span style={styles.rigName}>
          <Text type="body" size="sm" color={included ? 'primary' : 'secondary'}>
            {item.name}
          </Text>
        </span>
      </Tooltip>
      {item.wllLabel != null ? (
        <span style={{...styles.idChip, ...styles.rigSeg}}>{item.wllLabel}</span>
      ) : null}
      {item.qtyLabel != null ? (
        <span style={styles.rigSeg}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {item.qtyLabel}
          </Text>
        </span>
      ) : null}
      {showInspection && item.inspectionLabel != null ? (
        <span style={styles.rigSeg}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {item.inspectionLabel}
          </Text>
        </span>
      ) : null}
      {isOverloaded ? (
        <span style={{...styles.rigSeg, color: RED, display: 'inline-flex', alignItems: 'center', gap: 3}}>
          <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
          <Text type="supporting" size="xsm" color="inherit">
            OVER
          </Text>
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignoffRow — 44px heavy row: 24px initials disc + name + 11px role
// subline + status pill. Critical-lift-injected rows carry the BRAND 'CL'
// corner tag and enter with a 150ms fade (none under reduced motion).
// Required rows are real <button>s opening the confirm dialog.
// ---------------------------------------------------------------------------

interface SignoffRowProps {
  person: Person;
  status: 'signed' | 'required';
  onOpen: (id: string) => void;
}

function SignoffRow({person, status, onOpen}: SignoffRowProps) {
  const body = (
    <>
      <span style={styles.signoffDisc} aria-hidden>
        {person.initials}
      </span>
      <span style={{minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        <Text type="label" size="sm" maxLines={1}>
          {person.name}
        </Text>
        <span style={{fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'}}>
          {person.role}
        </span>
      </span>
      {person.criticalOnly ? (
        <span style={styles.clTag} aria-label="Required by critical lift">
          CL
        </span>
      ) : null}
      <span
        style={{
          ...styles.signoffPill,
          ...(status === 'signed' ? styles.pillSigned : styles.pillRequired),
        }}>
        {status === 'signed' ? 'Signed' : 'Required'}
      </span>
    </>
  );
  if (status === 'signed') {
    return <div style={styles.signoffRow}>{body}</div>;
  }
  return (
    <button
      type="button"
      className={person.criticalOnly ? 'hlp-focusable hlp-cl-row' : 'hlp-focusable'}
      style={{...styles.signoffRow, cursor: 'pointer'}}
      onClick={() => onOpen(person.id)}
      aria-label={`Sign off as ${person.name}, ${person.role}`}>
      {body}
    </button>
  );
}

// ---------------------------------------------------------------------------
// LEFT RAIL — Rig & Rigging inventory, the (empty) Alternate cranes
// section, and Signoffs. Same rows render inside the Dialog when the rail
// band drops.
// ---------------------------------------------------------------------------

interface RailContentProps {
  state: PlanState;
  derived: Derived;
  visiblePeople: Person[];
  isWide?: boolean; // Dialog rendering (420px) — inspection segments fit
  onToggleRig: (id: string, included: boolean) => void;
  onOpenSignoff: (id: string) => void;
}

function RailContent({
  state,
  derived,
  visiblePeople,
  isWide = false,
  onToggleRig,
  onOpenSignoff,
}: RailContentProps) {
  const includedCount = RIG_ITEMS.filter(item => state.rigging[item.id]?.included).length;
  return (
    <>
      <div style={styles.railSectionHeader}>
        <Heading level={2} style={{fontSize: 12, margin: 0}}>
          Rig &amp; Rigging
        </Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {includedCount} of {RIG_ITEMS.length} · {fmtLb(derived.riggingTotalLb)} lb
        </Text>
      </div>
      <div style={styles.rigRow}>
        <span style={styles.idChip}>{CRANE_HL90.id}</span>
        <span style={styles.rigName}>
          <Text type="body" size="sm">
            {CRANE_HL90.name}
          </Text>
        </span>
        <span style={styles.rigSeg}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            Boom {state.plan.boomLengthFt} ft
          </Text>
        </span>
      </div>
      <Divider />
      {RIG_ITEMS.map(item => (
        <RigItemRow
          key={item.id}
          item={item}
          included={state.rigging[item.id]?.included ?? false}
          isOverloaded={item.id === 'SLNG-205' && derived.overloadedLegIds.length > 0}
          showInspection={isWide}
          onToggle={onToggleRig}
        />
      ))}
      <div style={styles.railSectionHeader}>
        <Heading level={2} style={{fontSize: 12, margin: 0}}>
          Alternate cranes
        </Heading>
      </div>
      {/* Empty-state stress fixture — this section ships empty. */}
      <div style={styles.emptyState}>
        <Text type="supporting" size="xsm" color="secondary">
          No alternates staged for {PLAN_ID}.
        </Text>
      </div>
      <div style={styles.railSectionHeader}>
        <Heading level={2} style={{fontSize: 12, margin: 0}}>
          Signoffs
        </Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {visiblePeople.filter(p => state.signoffs[p.id]?.status === 'signed').length}/
          {visiblePeople.length}
        </Text>
      </div>
      {visiblePeople.map(person => (
        <SignoffRow
          key={person.id}
          person={person}
          status={state.signoffs[person.id]?.status ?? 'required'}
          onOpen={onOpenSignoff}
        />
      ))}
      <div style={styles.emptyState}>
        <Text type="supporting" size="xsm" color="secondary">
          T-2 transformer set per RFI-0417; keep 20 ft from 13.8 kV feeder; trench E-4 open
          until 07/11.
        </Text>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// RIGHT CALC PANE — capacity gauge, itemized load math (the itemized
// rigging sum AND the gross both render, so a fixture error is visible),
// boom selector, and the rigging stack with its angle selector.
// ---------------------------------------------------------------------------

interface CalcContentProps {
  state: PlanState;
  derived: Derived;
  onBoomSelect: (boomFt: number) => void;
  onAngleSelect: (deg: number) => void;
}

function CalcContent({state, derived, onBoomSelect, onAngleSelect}: CalcContentProps) {
  const includedCount = RIG_ITEMS.filter(item => state.rigging[item.id]?.included).length;
  const factor = SLING_FACTORS[state.plan.slingAngleDeg] ?? 1.155;
  return (
    <>
      <CapacityGauge
        utilizationPct={derived.utilizationPct}
        grossLabel={`${fmtLb(derived.grossLoadLb)} lb`}
        capacityLabel={derived.capacityLb == null ? null : `${fmtLb(derived.capacityLb)} lb`}
        critical={derived.critical}
      />
      <div>
        <div style={styles.calcRow}>
          <Text type="supporting" size="sm" color="secondary">
            Load · {LOAD_T2.name} net
          </Text>
          <span style={styles.calcValue}>{LOAD_T2.weightLabel}</span>
        </div>
        <div style={styles.calcRow}>
          <Text type="supporting" size="sm" color="secondary">
            Rigging · {includedCount} of {RIG_ITEMS.length} included
          </Text>
          <span style={styles.calcValue}>+ {fmtLb(derived.riggingTotalLb)} lb</span>
        </div>
        <div style={styles.calcRow}>
          <Text type="label" size="sm">
            Gross load
          </Text>
          <span style={{...styles.calcValue, fontWeight: 700}}>
            {fmtLb(derived.grossLoadLb)} lb
          </span>
        </div>
        <div style={styles.calcRow}>
          <Text type="supporting" size="sm" color="secondary">
            Radius → chart column
          </Text>
          <span style={styles.calcValue}>
            {derived.radiusFt} ft → {derived.chartRadiusFt} ft
          </span>
        </div>
        <div style={styles.calcRow}>
          <Text type="supporting" size="sm" color="secondary">
            Chart capacity · boom {state.plan.boomLengthFt} ft
          </Text>
          <span style={styles.calcValue}>
            {derived.capacityLb == null ? '— not permitted' : `${fmtLb(derived.capacityLb)} lb`}
          </span>
        </div>
        <div style={styles.calcRow}>
          <Text type="label" size="sm">
            Utilization
          </Text>
          <span
            style={{
              ...styles.calcValue,
              fontWeight: 700,
              color: derived.critical ? AMBER_TEXT : GREEN_TEXT,
            }}>
            {derived.utilizationPct == null ? '—' : `${derived.utilizationPct.toFixed(1)}%`}
          </span>
        </div>
      </div>
      <SegmentedControl
        label="Boom length (ft)"
        value={String(state.plan.boomLengthFt)}
        onChange={value => onBoomSelect(Number(value))}>
        {BOOMS_FT.map(boom => (
          <SegmentedControlItem key={boom} value={String(boom)} label={String(boom)} />
        ))}
      </SegmentedControl>
      <Divider />
      <div style={styles.diagramBox}>
        <RiggingStackDiagram
          angleDeg={state.plan.slingAngleDeg}
          factor={factor}
          perLegLb={derived.perLegLb}
          overloadedLegIds={derived.overloadedLegIds}
        />
      </div>
      <SegmentedControl
        label="Sling angle"
        value={String(state.plan.slingAngleDeg)}
        onChange={value => onAngleSelect(Number(value))}>
        <SegmentedControlItem value="60" label="60°" />
        <SegmentedControlItem value="45" label="45°" />
        <SegmentedControlItem value="30" label="30°" />
      </SegmentedControl>
    </>
  );
}

// ---------------------------------------------------------------------------
// HEADER — Hoistwell mark (lattice-boom triangle whose hook line drops to
// form the crossbar of a lowercase 'h': two BRAND strokes, strokeWidth
// 2.5, 4px circular hook terminal) + plan name; stamp, signoff count, and
// actions own the top-right corner.
// ---------------------------------------------------------------------------

function HoistwellMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M5 3v18"
        fill="none"
        style={{stroke: BRAND}}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5 13 15 5v13"
        fill="none"
        style={{stroke: BRAND}}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="20" r="2" fill="none" style={{stroke: BRAND}} strokeWidth="2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function CraneLiftPlannerTemplate() {
  // CONTAINER-width bands (subtractive): >=1360 full; 1024–1359 stage
  // (rail 272 / pane 336 / 56px cells); 840–1023 rail -> Dialog chip;
  // 680–839 calc pane -> header chips + Dialog; <680 matrix -> summary
  // bar. Width 0 = first pre-observer frame; viewport queries cover it.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const bodyWidth = useElementWidth(bodyRef);
  const vpStage = useMediaQuery('(max-width: 1359px)');
  const vpRailHidden = useMediaQuery('(max-width: 1023px)');
  const vpPaneHidden = useMediaQuery('(max-width: 839px)');
  const vpMatrixCollapsed = useMediaQuery('(max-width: 679px)');
  const isStage = bodyWidth > 0 ? bodyWidth < 1360 : vpStage;
  const isRailHidden = bodyWidth > 0 ? bodyWidth < 1024 : vpRailHidden;
  const isPaneHidden = bodyWidth > 0 ? bodyWidth < 840 : vpPaneHidden;
  const isMatrixCollapsed = bodyWidth > 0 ? bodyWidth < 680 : vpMatrixCollapsed;
  const railWidth = isStage ? 272 : 300;
  const paneWidth = isStage ? 336 : 380;
  const cellWidth = isStage ? 56 : 64;

  const [state, setState] = useState<PlanState>(INITIAL_STATE);
  const [confirmPersonId, setConfirmPersonId] = useState<string | null>(null);
  const [isRailDialogOpen, setIsRailDialogOpen] = useState(false);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);
  // Polite live region (debounced to interaction settle) + assertive
  // region reserved for the critical-lift flip.
  const [announcement, setAnnouncement] = useState('');
  const [criticalAnnouncement, setCriticalAnnouncement] = useState('');

  // THE single mutation path — merges by id ('plan' | rig id | person id).
  const update = useCallback((id: string, patch: EntityPatch) => {
    setState(prev => {
      if (id === 'plan') {
        return {
          ...prev,
          plan: {
            setXFt: patch.setXFt ?? prev.plan.setXFt,
            setYFt: patch.setYFt ?? prev.plan.setYFt,
            boomLengthFt: patch.boomLengthFt ?? prev.plan.boomLengthFt,
            slingAngleDeg: patch.slingAngleDeg ?? prev.plan.slingAngleDeg,
          },
        };
      }
      if (prev.rigging[id] != null && patch.included != null) {
        return {...prev, rigging: {...prev.rigging, [id]: {included: patch.included}}};
      }
      if (prev.signoffs[id] != null && patch.status != null) {
        return {...prev, signoffs: {...prev.signoffs, [id]: {status: patch.status}}};
      }
      return prev;
    });
  }, []);

  const derived = useMemo(() => derive(state), [state]);
  const derivedRef = useRef(derived);
  derivedRef.current = derived;

  // Settle-driven polite announcement (drag end, boom/rig/angle changes).
  const [settleTick, setSettleTick] = useState(0);
  const requestAnnounce = useCallback(() => setSettleTick(t => t + 1), []);
  useEffect(() => {
    if (settleTick === 0) return;
    const d = derivedRef.current;
    setAnnouncement(
      d.capacityLb == null
        ? `Radius ${d.radiusFt} feet: not permitted on the ${state.plan.boomLengthFt} foot boom`
        : `Utilization ${d.utilizationPct?.toFixed(1)} percent, capacity ${fmtLb(d.capacityLb)} pounds`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settleTick]);

  // Assertive announcement ONLY for the critical-lift flip.
  const prevCriticalRef = useRef<boolean | null>(null);
  useEffect(() => {
    const prev = prevCriticalRef.current;
    prevCriticalRef.current = derived.critical;
    if (prev == null || prev === derived.critical) return;
    setCriticalAnnouncement(
      derived.critical
        ? 'Critical lift: 2 additional signoffs required'
        : 'Standard lift: additional signoffs no longer required',
    );
  }, [derived.critical]);

  const visiblePeople = useMemo(
    () => PEOPLE.filter(person => !person.criticalOnly || derived.critical),
    [derived.critical],
  );
  const signedCount = visiblePeople.filter(
    person => state.signoffs[person.id]?.status === 'signed',
  ).length;

  const handleSetPointDrag = useCallback(
    (xFt: number, yFt: number) => update('plan', {setXFt: xFt, setYFt: yFt}),
    [update],
  );
  const handleBoomSelect = useCallback(
    (boomFt: number) => {
      update('plan', {boomLengthFt: boomFt});
      requestAnnounce();
    },
    [update, requestAnnounce],
  );
  const handleAngleSelect = useCallback(
    (deg: number) => update('plan', {slingAngleDeg: deg}),
    [update],
  );
  const handleToggleRig = useCallback(
    (id: string, included: boolean) => {
      update(id, {included});
      requestAnnounce();
    },
    [update, requestAnnounce],
  );
  const handleOpenSignoff = useCallback((id: string) => setConfirmPersonId(id), []);
  const handleConfirmSignoff = useCallback(() => {
    if (confirmPersonId != null) {
      update(confirmPersonId, {status: 'signed'});
    }
    setConfirmPersonId(null);
  }, [confirmPersonId, update]);

  const confirmPerson = PEOPLE.find(person => person.id === confirmPersonId) ?? null;
  const readout = derived.atMaxRadius
    ? `R = ${derived.radiusFt} ft (max)`
    : `R = ${derived.radiusFt} ft @ ${derived.bearingDeg}°`;
  const utilizationLabel =
    derived.utilizationPct == null ? '—' : `${derived.utilizationPct.toFixed(1)}%`;

  const matrix = (
    <LoadChartMatrix
      activeBoomFt={state.plan.boomLengthFt}
      activeRadiusIndex={derived.radiusIndex}
      grossLoadLb={derived.grossLoadLb}
      cellWidth={cellWidth}
      onBoomSelect={handleBoomSelect}
    />
  );

  return (
    <div style={styles.root}>
      <style>{PLANNER_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.header}>
              <div style={styles.brandCluster}>
                <HoistwellMark />
                <Text type="supporting" size="xsm" color="secondary" style={styles.planId}>
                  {PLAN_ID}
                </Text>
                <Heading level={1} style={{fontSize: 14, margin: 0, whiteSpace: 'nowrap'}}>
                  {PLAN_NAME}
                </Heading>
              </div>
              <StackItem size="fill">
                <span aria-hidden />
              </StackItem>
              {isPaneHidden ? (
                <>
                  <span style={{...styles.headerChip, color: derived.critical ? AMBER_TEXT : GREEN_TEXT}}>
                    {utilizationLabel}
                  </span>
                  <span style={styles.headerChip}>{fmtLb(derived.grossLoadLb)} lb</span>
                </>
              ) : null}
              <span
                style={{
                  ...styles.stamp,
                  ...(derived.critical ? styles.stampCritical : styles.stampStandard),
                }}>
                {derived.critical ? (
                  <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                ) : (
                  <Icon icon={CheckIcon} size="xsm" color="inherit" />
                )}
                {derived.critical ? 'CRITICAL LIFT' : 'STANDARD LIFT'}
              </span>
              <span style={styles.headerChip}>
                Signoffs {signedCount}/{visiblePeople.length}
              </span>
              {isRailHidden ? (
                <Button
                  label={`Rigging & Signoffs (${RIG_ITEMS.length + visiblePeople.length})`}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ListChecksIcon} size="sm" />}
                  onClick={() => setIsRailDialogOpen(true)}
                />
              ) : null}
              <Button
                label="Export Plan"
                variant="ghost"
                size="sm"
                icon={<Icon icon={DownloadIcon} size="sm" />}
                onClick={() => {}}
              />
              <IconButton
                label="More plan actions"
                tooltip="More plan actions"
                icon={<Icon icon={EllipsisVerticalIcon} size="sm" color="inherit" />}
                variant="ghost"
                onClick={() => {}}
              />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={bodyRef} style={{...styles.bodyRow, height: '100%'}}>
              {!isRailHidden ? (
                <div style={{...styles.rail, width: railWidth}} aria-label="Rig and signoffs">
                  <RailContent
                    state={state}
                    derived={derived}
                    visiblePeople={visiblePeople}
                    onToggleRig={handleToggleRig}
                    onOpenSignoff={handleOpenSignoff}
                  />
                </div>
              ) : null}
              <div style={styles.centerCol}>
                <div style={styles.canvasBox}>
                  <LiftRadiusPlot
                    setXFt={state.plan.setXFt}
                    setYFt={state.plan.setYFt}
                    radiusFt={derived.radiusFt}
                    bearingDeg={derived.bearingDeg}
                    onSetPointDrag={handleSetPointDrag}
                    onSettle={requestAnnounce}
                  />
                  {/* Bottom-left corner: scale legend + live readout */}
                  <div style={styles.canvasReadout}>
                    <Text type="supporting" size="xsm" color="secondary">
                      1 square = 10 ft
                    </Text>
                    <span style={styles.readoutValue}>{readout}</span>
                  </div>
                </div>
                {isMatrixCollapsed ? (
                  <div style={styles.matrixSummaryBar}>
                    <span style={styles.readoutValue}>
                      Boom {state.plan.boomLengthFt} ft · R {derived.chartRadiusFt} ft · Cap{' '}
                      {derived.capacityLb == null ? '—' : `${fmtLb(derived.capacityLb)} lb`}
                    </span>
                    <StackItem size="fill">
                      <span aria-hidden />
                    </StackItem>
                    <Button
                      label="Chart"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={TableIcon} size="sm" />}
                      onClick={() => setIsChartDialogOpen(true)}
                    />
                  </div>
                ) : (
                  matrix
                )}
              </div>
              {!isPaneHidden ? (
                <div style={{...styles.calcPane, width: paneWidth}} aria-label="Load calculation">
                  <CalcContent
                    state={state}
                    derived={derived}
                    onBoomSelect={handleBoomSelect}
                    onAngleSelect={handleAngleSelect}
                  />
                </div>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
      {/* Live regions — polite settle summary; assertive ONLY for the
          critical-lift flip. */}
      <div aria-live="polite" style={styles.srOnly}>
        {announcement}
      </div>
      <div aria-live="assertive" style={styles.srOnly}>
        {criticalAnnouncement}
      </div>
      {/* Rail/calc overlay for the collapsed bands — DS Dialog owns the
          focus trap, Escape, and focus restore. */}
      <Dialog
        isOpen={isRailDialogOpen && isRailHidden}
        onOpenChange={setIsRailDialogOpen}
        purpose="info"
        width={420}>
        <DialogHeader title="Rigging & Signoffs" onOpenChange={setIsRailDialogOpen} />
        <div style={styles.dialogBody}>
          <RailContent
            state={state}
            derived={derived}
            visiblePeople={visiblePeople}
            isWide
            onToggleRig={handleToggleRig}
            onOpenSignoff={handleOpenSignoff}
          />
          {isPaneHidden ? (
            <>
              <Divider />
              <div style={{display: 'flex', flexDirection: 'column', gap: GUTTER, padding: GUTTER}}>
                <CalcContent
                  state={state}
                  derived={derived}
                  onBoomSelect={handleBoomSelect}
                  onAngleSelect={handleAngleSelect}
                />
              </div>
            </>
          ) : null}
        </div>
      </Dialog>
      {/* <680px chart overlay */}
      <Dialog
        isOpen={isChartDialogOpen && isMatrixCollapsed}
        onOpenChange={setIsChartDialogOpen}
        purpose="info"
        width={560}>
        <DialogHeader title={`${CRANE_HL90.name} load chart`} onOpenChange={setIsChartDialogOpen} />
        <div style={styles.dialogBody}>{matrix}</div>
      </Dialog>
      {/* Signoff confirm — pill flips green through update(personId). */}
      <Dialog
        isOpen={confirmPerson != null}
        onOpenChange={isOpen => {
          if (!isOpen) setConfirmPersonId(null);
        }}
        purpose="info"
        width={380}>
        <DialogHeader
          title="Confirm signoff"
          onOpenChange={isOpen => {
            if (!isOpen) setConfirmPersonId(null);
          }}
        />
        {confirmPerson != null ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: GUTTER, padding: GUTTER}}>
            <Text type="body" size="sm">
              Sign off on {PLAN_ID} as {confirmPerson.name} · {confirmPerson.role}?
            </Text>
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              Gross {fmtLb(derived.grossLoadLb)} lb · utilization {utilizationLabel} of chart ·{' '}
              {derived.critical ? 'CRITICAL LIFT' : 'STANDARD LIFT'}
            </Text>
            <HStack gap={2}>
              <StackItem size="fill">
                <span aria-hidden />
              </StackItem>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmPersonId(null)}
              />
              <Button label="Sign off" variant="primary" size="sm" onClick={handleConfirmSignoff} />
            </HStack>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
