var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Enodra's distribution console for
 *   Marlow Substation (12 kV, bus A): five feeders 12F1–12F5 with dual-field
 *   load figures (loadPct numbers drive bar geometry, loadLabel strings are
 *   rendered), a static hand-authored one-line topology, precomputed
 *   SCENARIOS keyed by the breaker-state signature (allClosed / bkr4Open),
 *   SCADA-voiced alarm strings, and switching order SO-2214 with six fixture
 *   step stamps ("R.O. · 14:32"). No clocks, no randomness, no network
 *   assets — every relative time and every cascade value is a precomputed
 *   string.
 * @output Grid Feeder Console — a SCADA-style operator surface: a 960x620
 *   substation one-line diagram (12 kV main bus, transformer T1, five
 *   breaker drops, recloser REC-9, normally-open tie TIE-27) with
 *   open/closed breaker symbology and energized / de-energized / backfed
 *   segment states; a 340px feeder load-headroom rail whose 120x8 bars put
 *   the 100%-of-seasonal-rating tick at 78% of track width so the final 22%
 *   is a hatched overload zone (renders loads up to 128%); and a 380px
 *   interlocked switching-order aside whose steps unlock strictly in
 *   sequence with operator sign-off. Opening BKR-4 on the diagram cascades
 *   everywhere: Cannery 12F4 goes gray-dashed, TIE-27 turns amber backfed,
 *   Eastgate surges 64% → 104% into the overload hatch, the header counter
 *   jumps 0 → 2,140 affected customers, the CRIT F4-86 alarm chip appears,
 *   and SO-2214 auto-drafts with six gated steps.
 * @position Page template; emitted by \`astryx template grid-feeder-console\`
 *
 * Density grid (fixed verbatim): 46px header/alarm bar; 44px heavy rows
 *   (feeder rail rows, switching-step rows); 36px light rows (aside meta
 *   lists, legend rows); feeder rail 340px fixed; switching aside 380px
 *   fixed; one gutter token space12 = 12px (var(--spacing-3)) used for all
 *   pane padding and inter-pane gaps; 8px inner-row gap; 4px status
 *   stripes. No other spacing literals.
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (46px: Enodra mark + substation identity | alarm strip +
 *   affected counter in one polite live region | operator badge)
 *   | content (work row: one-line canvas flex-1 with pinned legend
 *   | feeder rail 340 | switching aside 380 — 12px gutters, 1px pane
 *   borders, each pane scrolls independently).
 * Container policy: dense tool surface — bordered panes, rows, and rails;
 *   no Cards. Feeder rows are real <button> rows; switching steps are
 *   styled rows with a single native Execute button on the one ready step.
 * Color policy: token-pure chrome. ONE quarantined brand literal (Enodra
 *   #F08C00, fill-only — 3.0:1 on white fails text contrast, so it never
 *   colors text). Data-viz states use the repo-standard categorical
 *   fallbacks; amber has separate FILL and TEXT values because #EB6E00 on
 *   white is 3.6:1 (fails 4.5:1) while #B54708 passes at 5.9:1. Open/closed
 *   is shape (hollow/filled), de-energized is a static dash pattern, and
 *   the overload zone is hatching + a label — color is never the sole
 *   channel.
 *
 * Responsive contract (subtraction, not reflow). Breakpoints are measured
 * against the work row's OWN width (ResizeObserver), not the viewport —
 * host chrome around the template (demo sidebars etc.) starves the panes
 * independently of the window, and viewport queries would keep all three
 * panes mounted inside a container too narrow to hold them, collapsing the
 * flex-1 one-line canvas to a sliver:
 * - >= 1360px: all three panes.
 * - < 1360px: the 340px feeder rail is removed entirely — feeder selection
 *   survives via diagram clicks; loads survive via the segment labels.
 * - < 1080px: the 380px switching aside is also removed; header + diagram
 *   remain, and drafted-order state persists invisibly (state lives in the
 *   root) so re-widening restores the sheet mid-procedure.
 * - The header never wraps; the alarm strip's overflow chip absorbs width
 *   loss first (4 visible chips >= 1080px, 2 below).
 *
 * Escape layering: this page owns no overlays — Escape belongs to the DS
 * Tooltips alone; there are no close paths that need focus restoration.
 * After Execute, focus programmatically moves to the next ready step's
 * button.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {CheckIcon, ClipboardListIcon, LockIcon, UsersIcon} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// ONE quarantined brand literal: Enodra orange, used only as the header-mark
// stroke/fill. FILL ONLY — #F08C00 on white is ~3.0:1, so it never colors
// text (brand *text* would need a darker value; this page has none).
const BRAND = 'light-dark(#F08C00, #FFA94D)';
// Fills/strokes: bar fills, backfed segments, tie symbol. #EB6E00 fails
// 4.5:1 on white as text — see AMBER_TEXT below.
const AMBER = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
// Text-weight amber for WARN alarm codes: #B54708 on white ≈ 5.9:1 (passes
// 4.5:1); #FFB566 on the dark surface passes comfortably.
const AMBER_TEXT = 'light-dark(#B54708, #FFB566)';
const AMBER_SOFT = 'light-dark(rgba(235, 110, 0, 0.10), rgba(255, 147, 48, 0.16))';
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const GREEN_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
// CRIT / overload red — same pair the suite uses for urgent states.
// #DC2626 on white ≈ 4.5:1; #F87171 on the dark surface passes.
const RED = 'light-dark(#DC2626, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Number color inside the filled done-disc: #FFFFFF on #0B991F ≈ 4.6:1;
// #1A1A1A on the lighter dark-scheme green #34C759 ≈ 8.1:1.
const DISC_TEXT = 'light-dark(#FFFFFF, #1A1A1A)';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the backfeed pulse, and the reduced-motion guard.
// Transitions animate transform/opacity/color only (bar fills scale via
// transform, never width); the de-energized dash pattern is STATIC — no
// marching ants, ever.
// ---------------------------------------------------------------------------

const CONSOLE_CSS = \`
.gfc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.gfc-fill {
  transform-origin: left center;
  transition: transform 300ms ease, background-color 300ms ease;
}
.gfc-ack {
  transition: opacity 200ms ease;
}
.gfc-backfeed {
  animation: gfc-pulse 1.8s ease-in-out infinite;
}
@keyframes gfc-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
@media (prefers-reduced-motion: reduce) {
  .gfc-fill { transition: none; }
  .gfc-ack { transition: none; }
  .gfc-backfeed { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // 46px header/alarm bar — never wraps; the alarm strip sheds chips into
  // its overflow chip before anything else loses width.
  header: {
    height: 46,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-3)',
    overflow: 'hidden',
  },
  brandCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // Alarm strip + affected counter share ONE polite live region (a11y
  // plan) — trips and completions are announced from here.
  liveCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  alarmStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
    overflow: 'hidden',
  },
  alarmChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element, 6px)',
    borderWidth: 1,
    borderStyle: 'solid',
    background: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    maxWidth: 220,
    overflow: 'hidden',
    font: 'inherit',
  },
  alarmCode: {
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
  },
  alarmText: {
    fontSize: 12,
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  overflowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    paddingInline: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  affectedButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingInline: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    font: 'inherit',
  },
  affectedHot: {
    borderColor: RED,
    backgroundColor: RED_SOFT,
    color: RED,
  },
  operatorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // Work row: canvas flex-1 | rail 340 | aside 380. space12 = 12px gutters
  // everywhere; 1px border tokens divide the panes.
  workRow: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
  },
  pane: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    minHeight: 0,
  },
  canvasPane: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasCaption: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    left: 'var(--spacing-3)',
    fontSize: 10,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  // Symbology legend — pinned bottom-left inside the canvas; 36px light
  // rows per the density grid.
  legend: {
    position: 'absolute',
    left: 'var(--spacing-3)',
    bottom: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  legendRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    whiteSpace: 'nowrap',
  },
  legendLabel: {fontSize: 11, color: 'var(--color-text-secondary)'},
  // Feeder rail: 340px fixed, own scroll, 44px heavy rows.
  rail: {
    width: 340,
    flexShrink: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  feederRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    border: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    width: '100%',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    flexShrink: 0,
  },
  feederRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
  },
  // 4px critical-load stripe — omitted entirely when the feeder has no
  // critical loads (Millbrook 12F2 exercises the omit path).
  stripe: {width: 4, alignSelf: 'stretch', flexShrink: 0, backgroundColor: RED},
  stripeSpacer: {width: 4, flexShrink: 0},
  feederName: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  // The 47-char Eastgate fixture name lands here — single-line ellipsis,
  // never a wrap (44px rows hold their height).
  feederTitle: {
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  feederTitleText: {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  feederSub: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  deenergizedTag: {
    fontSize: 10,
    letterSpacing: '0.04em',
    color: RED,
    border: \`1px solid \${RED}\`,
    borderRadius: 3,
    paddingInline: 4,
    flexShrink: 0,
  },
  // 120x8 load bar. The 100%-of-seasonal-rating tick sits at 78% of track
  // width, so the final 22% is the hatched overload zone; the scale renders
  // loads up to 128%. Ridgeline pins the tick boundary at exactly 100%
  // (amber, not red); post-switch Eastgate at 104% lands inside the hatch.
  barTrack: {
    position: 'relative',
    width: 120,
    height: 8,
    flexShrink: 0,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
  },
  barFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 4,
    width: '100%',
  },
  barHatch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '78%',
    right: 0,
    borderRadius: '0 4px 4px 0',
    backgroundImage:
      'repeating-linear-gradient(135deg, var(--color-border) 0 2px, transparent 2px 5px)',
  },
  barTick: {
    position: 'absolute',
    left: '78%',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: 'var(--color-text-secondary)',
  },
  feederRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
    minWidth: 72,
  },
  loadLabel: {
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  glyphStrip: {display: 'flex', alignItems: 'center', gap: 6},
  glyphItem: {display: 'inline-flex', alignItems: 'center', gap: 2},
  glyphCount: {fontSize: 10, fontVariantNumeric: 'tabular-nums'},
  // Switching aside: 380px fixed; steps scroll, footer pinned (bottom-right
  // corner owner).
  aside: {
    width: 380,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  asideScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  sheetHeader: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  orderId: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  sheetTarget: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 44px step rows (minHeight — the DNO-1187 tag step wraps to two lines
  // by design and the row grows, never clips).
  stepRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  disc: {
    width: 20,
    height: 20,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  discDone: {backgroundColor: OK_GREEN, color: DISC_TEXT},
  discReady: {border: '2px solid var(--color-accent)'},
  discBlocked: {border: 'var(--border-width) solid var(--color-border)', opacity: 0.4},
  stepAction: {
    flex: 1,
    minWidth: 0,
    fontSize: 12.5,
    lineHeight: 1.3,
  },
  deviceChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 'var(--radius-element, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  stepRight: {
    minWidth: 86,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  stepStamp: {
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  blockedNote: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  executeButton: {
    height: 28,
    paddingInline: 10,
    borderRadius: 'var(--radius-element, 6px)',
    border: '1px solid var(--color-accent)',
    color: 'var(--color-accent)',
    background: 'none',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    font: 'inherit',
  },
  asideFooter: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
  },
  completeStamp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 'var(--radius-element, 6px)',
    border: \`1px solid \${OK_GREEN}\`,
    backgroundColor: GREEN_SOFT,
    fontSize: 12,
    fontWeight: 600,
  },
  placard: {
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    margin: 'var(--spacing-3)',
    textAlign: 'center',
  },
  // 36px light rows for aside meta lists.
  metaRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  metaValue: {
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  visuallyHidden: {
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
};

// ---------------------------------------------------------------------------
// DATA — one deterministic world: Enodra grid orchestration at Marlow
// Substation, 12 kV bus A. Shift anchor: Tue Mar 3, 2026, 14:30 — every
// stamp below is a precomputed string against that anchor.
// ---------------------------------------------------------------------------

const OPERATORS = {
  ruth: {name: 'Ruth Okafor', initials: 'R.O.', badge: 'R. Okafor · R.O.'},
} as const;

const SUBSTATION = {name: 'Marlow Substation', voltageLabel: '12 kV'} as const;

type CriticalLoadKind = 'hospital' | 'pumpStation' | 'trafficSignals';

interface CriticalLoad {
  kind: CriticalLoadKind;
  count: number;
}

interface Feeder {
  id: string;
  name: string;
  breakerId: string;
  customers: number;
  customersLabel: string;
  loadAmps: number;
  loadLabel: string;
  loadPct: number;
  ratingAmps: number;
  criticalLoads: CriticalLoad[];
  x: number; // one-line drop abscissa
}

const FEEDERS = {
  harborview: {
    id: '12F1',
    name: 'Harborview 12F1',
    breakerId: 'BKR-1',
    customers: 2980,
    customersLabel: '2,980',
    loadAmps: 310,
    loadLabel: '310 A · 72%',
    loadPct: 72,
    ratingAmps: 430,
    criticalLoads: [{kind: 'pumpStation', count: 2}],
    x: 160,
  },
  // STRESS: criticalLoads: [] exercises omit-when-undefined — no stripe, no
  // glyph strip, and the row still holds 44px.
  millbrook: {
    id: '12F2',
    name: 'Millbrook 12F2',
    breakerId: 'BKR-2',
    customers: 2410,
    customersLabel: '2,410',
    loadAmps: 249,
    loadLabel: '249 A · 58%',
    loadPct: 58,
    ratingAmps: 430,
    criticalLoads: [],
    x: 320,
  },
  // STRESS: 47-char name forces single-line ellipsis in the 340px rail and
  // in the diagram's foreignObject feeder label.
  eastgate: {
    id: '12F3',
    name: 'Eastgate Industrial Park & Wastewater Lift 12F3',
    breakerId: 'BKR-3',
    customers: 2650,
    customersLabel: '2,650',
    loadAmps: 275,
    loadLabel: '275 A · 64%',
    loadPct: 64,
    ratingAmps: 430,
    criticalLoads: [{kind: 'pumpStation', count: 1}, {kind: 'trafficSignals', count: 6}],
    x: 480,
  },
  cannery: {
    id: '12F4',
    name: 'Cannery 12F4',
    breakerId: 'BKR-4',
    customers: 2140,
    customersLabel: '2,140',
    loadAmps: 412,
    loadLabel: '412 A · 96%',
    loadPct: 96,
    ratingAmps: 430,
    criticalLoads: [{kind: 'hospital', count: 1}, {kind: 'trafficSignals', count: 4}],
    x: 640,
  },
  // STRESS: exactly loadPct 100 pins the rated-limit tick boundary — the
  // fill ends on the tick and reads amber, not red.
  ridgeline: {
    id: '12F5',
    name: 'Ridgeline 12F5',
    breakerId: 'BKR-5',
    customers: 2300,
    customersLabel: '2,300',
    loadAmps: 430,
    loadLabel: '430 A · 100%',
    loadPct: 100,
    ratingAmps: 430,
    criticalLoads: [{kind: 'trafficSignals', count: 3}],
    x: 800,
  },
} satisfies Record<string, Feeder>;

const FEEDER_LIST: Feeder[] = [
  FEEDERS.harborview,
  FEEDERS.millbrook,
  FEEDERS.eastgate,
  FEEDERS.cannery,
  FEEDERS.ridgeline,
];

// Aggregate cross-check: 2,980 + 2,410 + 2,650 + 2,140 + 2,300 = 12,480.
// The numeric sum derives live from the rows; the label is the fixture.
const TOTAL_CUSTOMERS = FEEDER_LIST.reduce((sum, f) => sum + f.customers, 0);
const TOTAL_CUSTOMERS_LABEL = '12,480';

type DeviceState = 'open' | 'closed';

// Devices: BKR-1..BKR-5, recloser REC-9, normally-open tie TIE-27.
const INITIAL_DEVICES: Record<string, {state: DeviceState}> = {
  'BKR-1': {state: 'closed'},
  'BKR-2': {state: 'closed'},
  'BKR-3': {state: 'closed'},
  'BKR-4': {state: 'closed'},
  'BKR-5': {state: 'closed'},
  'REC-9': {state: 'closed'},
  'TIE-27': {state: 'open'},
};

type AlarmSeverity = 'CRIT' | 'WARN' | 'INFO';

interface Alarm {
  id: string;
  severity: AlarmSeverity;
  code: string;
  text: string;
  detail: string;
}

const SEVERITY_RANK: Record<AlarmSeverity, number> = {CRIT: 0, WARN: 1, INFO: 2};

const BASE_ALARMS: Alarm[] = [
  {
    id: 'al-f5-51',
    severity: 'WARN',
    code: 'F5-51',
    text: 'Ridgeline 12F5 at rating',
    detail: 'WARN F5-51 OVLD — Ridgeline 12F5 at 100% of seasonal rating (430 A of 430 A)',
  },
  {
    id: 'al-rec9',
    severity: 'INFO',
    code: 'REC-9',
    text: 'Reclose count 2 of 4',
    detail: 'INFO REC-9 — Harborview 12F1 recloser at 2 of 4 operations since last patrol',
  },
];
const BASE_ALARM_IDS = new Set(BASE_ALARMS.map(a => a.id));

// STRESS: the bkr4Open scenario carries 6 alarms so the header strip shows
// 4 chips + a "+2" overflow chip.
const BKR4_ALARMS: Alarm[] = [
  {
    id: 'al-f4-86',
    severity: 'CRIT',
    code: 'F4-86',
    text: 'Cannery 12F4 LOCKOUT',
    detail:
      'CRIT F4-86 LOCKOUT — Cannery 12F4 de-energized, 2,140 customers, backfeed available via TIE-27',
  },
  {
    id: 'al-f3-49',
    severity: 'WARN',
    code: 'F3-49',
    text: 'Eastgate 12F3 overload',
    detail:
      'WARN F3-49 OVLD — Eastgate 12F3 at 104% of seasonal rating (447 A of 430 A) carrying TIE-27 backfeed',
  },
  {
    id: 'al-tie27',
    severity: 'INFO',
    code: 'TIE-27',
    text: 'Backfeed via TIE-27',
    detail: 'INFO TIE-27 — normally-open tie closed, Eastgate 12F3 backfeeding the Cannery 12F4 tail',
  },
  {
    id: 'al-so2214',
    severity: 'INFO',
    code: 'SO-2214',
    text: 'Switching order drafted',
    detail: 'INFO SO-2214 — switching order drafted for Open BKR-4 · Cannery 12F4, 6 steps',
  },
];

// Completing all 6 steps downgrades the CRIT chip to this INFO.
const AL_F4_SECURED: Alarm = {
  id: 'al-f4-secured',
  severity: 'INFO',
  code: 'F4-86',
  text: 'F4 tagged & grounded',
  detail:
    'INFO F4-86 — Cannery 12F4 isolated, tagged DNO-1187, tested dead and grounded per SO-2214',
};

// Generic trip alarms for the non-scenario breakers — precomputed strings
// so every breaker on the one-line stays a live affordance.
const FEEDER_TRIP_ALARMS: Record<string, Alarm> = {
  '12F1': {
    id: 'al-f1-86',
    severity: 'CRIT',
    code: 'F1-86',
    text: 'Harborview 12F1 LOCKOUT',
    detail: 'CRIT F1-86 LOCKOUT — Harborview 12F1 de-energized, 2,980 customers, no tie available',
  },
  '12F2': {
    id: 'al-f2-86',
    severity: 'CRIT',
    code: 'F2-86',
    text: 'Millbrook 12F2 LOCKOUT',
    detail: 'CRIT F2-86 LOCKOUT — Millbrook 12F2 de-energized, 2,410 customers, no tie available',
  },
  '12F3': {
    id: 'al-f3-86',
    severity: 'CRIT',
    code: 'F3-86',
    text: 'Eastgate 12F3 LOCKOUT',
    detail:
      'CRIT F3-86 LOCKOUT — Eastgate Industrial Park & Wastewater Lift 12F3 de-energized, 2,650 customers, backfeed available via TIE-27',
  },
  '12F5': {
    id: 'al-f5-86',
    severity: 'CRIT',
    code: 'F5-86',
    text: 'Ridgeline 12F5 LOCKOUT',
    detail: 'CRIT F5-86 LOCKOUT — Ridgeline 12F5 de-energized, 2,300 customers, no tie available',
  },
};

interface SwitchingStep {
  id: string;
  action: string;
  device: string;
  stamp: string; // fixture initials + time, applied when executed
}

// Switching order SO-2214 — open, verify, tag, test-dead, ground, log.
// Step prose reads like a real order; stamps are fixture strings against
// the 14:30 shift anchor.
const SWITCHING_ORDER = {
  id: 'SO-2214',
  target: 'Open BKR-4 · Cannery 12F4',
  draftedLine: 'Drafted 14:30 · dispatcher R. Okafor',
  holdTag: 'DNO-1187',
  steps: [
    {id: 'st-open', action: 'Open BKR-4 and verify indication', device: 'BKR-4', stamp: 'R.O. · 14:32'},
    {id: 'st-verify', action: 'Confirm 0 A on all three phases at the BKR-4 panel ammeters', device: 'BKR-4', stamp: 'R.O. · 14:35'},
    {
      id: 'st-tag',
      action: 'Apply hold tag DNO-1187 to the BKR-4 handle, note dispatcher and time',
      device: 'TAG',
      stamp: 'R.O. · 14:41',
    },
    {id: 'st-test', action: 'Test the 12F4 tail dead at riser pole P-114', device: 'TEST', stamp: 'R.O. · 14:48'},
    {id: 'st-ground', action: 'Apply grounds at P-114 and the BKR-4 load side', device: 'GND', stamp: 'R.O. · 14:53'},
    {id: 'st-log', action: 'Log completion with dispatch and release crew to patrol', device: 'LOG', stamp: 'R.O. · 14:57'},
  ] satisfies SwitchingStep[],
} as const;

// ---------------------------------------------------------------------------
// SCENARIOS — precomputed model-driven cascade, keyed by the canonical
// breaker-state signature. No load-flow math at runtime: Eastgate 64 → 104
// via TIE-27 backfeed and Cannery 96 → 0 are fixture values.
// ---------------------------------------------------------------------------

type SegState = 'energized' | 'deenergized' | 'backfed';

interface FeederLoadFx {
  loadPct: number;
  loadLabel: string;
  deenergized?: boolean;
}

interface Scenario {
  segmentStates: Record<string, SegState>;
  feederLoads: Record<string, FeederLoadFx>;
  tieClosed: boolean;
  alarms: Alarm[];
  hasDraftedOrder: boolean;
}

const SCENARIOS: Record<'allClosed' | 'bkr4Open', Scenario> = {
  allClosed: {
    segmentStates: {'12F1': 'energized', '12F2': 'energized', '12F3': 'energized', '12F4': 'energized', '12F5': 'energized'},
    feederLoads: {
      '12F1': {loadPct: 72, loadLabel: '310 A · 72%'},
      '12F2': {loadPct: 58, loadLabel: '249 A · 58%'},
      '12F3': {loadPct: 64, loadLabel: '275 A · 64%'},
      '12F4': {loadPct: 96, loadLabel: '412 A · 96%'},
      '12F5': {loadPct: 100, loadLabel: '430 A · 100%'},
    },
    tieClosed: false,
    alarms: BASE_ALARMS,
    hasDraftedOrder: false,
  },
  bkr4Open: {
    segmentStates: {'12F1': 'energized', '12F2': 'energized', '12F3': 'energized', '12F4': 'deenergized', '12F5': 'energized'},
    feederLoads: {
      '12F1': {loadPct: 72, loadLabel: '310 A · 72%'},
      '12F2': {loadPct: 58, loadLabel: '249 A · 58%'},
      // STRESS: 104% exercises the hatched overload zone past the 78% tick.
      '12F3': {loadPct: 104, loadLabel: '447 A · 104%'},
      '12F4': {loadPct: 0, loadLabel: '0 A · de-energized', deenergized: true},
      '12F5': {loadPct: 100, loadLabel: '430 A · 100%'},
    },
    tieClosed: true,
    alarms: [...BKR4_ALARMS, ...BASE_ALARMS],
    hasDraftedOrder: true,
  },
};

function sortAlarms(alarms: Alarm[]): Alarm[] {
  return [...alarms].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

interface DerivedScenario extends Scenario {
  affectedCustomers: number;
  affectedLabel: string;
}

// Pure derivation from the devices record. The two authored SCENARIOS carry
// the rich cascade; any other open breaker overlays a generic precomputed
// trip (feeder gray-dashed, load zeroed, CRIT alarm) so every breaker click
// has observable consequences.
function deriveScenario(devices: Record<string, {state: DeviceState}>): DerivedScenario {
  const base = devices['BKR-4'].state === 'open' ? SCENARIOS.bkr4Open : SCENARIOS.allClosed;
  const segmentStates = {...base.segmentStates};
  const feederLoads = {...base.feederLoads};
  let alarms = [...base.alarms];
  for (const feeder of FEEDER_LIST) {
    if (feeder.id === '12F4') continue; // authored by SCENARIOS
    if (devices[feeder.breakerId].state === 'open') {
      segmentStates[feeder.id] = 'deenergized';
      feederLoads[feeder.id] = {loadPct: 0, loadLabel: '0 A · de-energized', deenergized: true};
      alarms = [FEEDER_TRIP_ALARMS[feeder.id], ...alarms];
      if (feeder.id === '12F5') {
        alarms = alarms.filter(a => a.id !== 'al-f5-51'); // at-rating WARN clears with the trip
      }
    }
  }
  const affectedCustomers = FEEDER_LIST.reduce(
    (sum, f) => sum + (feederLoads[f.id]?.deenergized ? f.customers : 0),
    0,
  );
  return {
    ...base,
    segmentStates,
    feederLoads,
    alarms: sortAlarms(alarms),
    affectedCustomers,
    affectedLabel: affectedCustomers.toLocaleString('en-US'),
  };
}

// ---------------------------------------------------------------------------
// CRITICAL LOAD GLYPHS — app-wide meta table + 14px inline SVGs, DS Tooltip
// for label + count.
// ---------------------------------------------------------------------------

const CRITICAL_LOAD_META: Record<CriticalLoadKind, {label: string; tone: string}> = {
  hospital: {label: 'Hospital', tone: RED},
  pumpStation: {label: 'Pump station', tone: AMBER_TEXT},
  trafficSignals: {label: 'Signalized intersections', tone: 'var(--color-text-secondary)'},
};

function CriticalLoadGlyph({kind, count}: {kind: CriticalLoadKind; count: number}) {
  const meta = CRITICAL_LOAD_META[kind];
  return (
    <Tooltip content={\`\${meta.label} · \${count}\`}>
      <span style={{...styles.glyphItem, color: meta.tone}}>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden focusable="false">
          {kind === 'hospital' ? (
            <>
              <rect x={1.5} y={1.5} width={11} height={11} rx={2} stroke="currentColor" strokeWidth={1.5} />
              <path d="M7 4.2v5.6M4.2 7h5.6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </>
          ) : kind === 'pumpStation' ? (
            <path
              d="M7 1.5C7 1.5 3 6 3 8.6a4 4 0 0 0 8 0C11 6 7 1.5 7 1.5Z"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          ) : (
            <>
              <rect x={4.5} y={1} width={5} height={12} rx={2} stroke="currentColor" strokeWidth={1.3} />
              <circle cx={7} cy={3.6} r={1.1} fill="currentColor" />
              <circle cx={7} cy={7} r={1.1} fill="currentColor" />
              <circle cx={7} cy={10.4} r={1.1} fill="currentColor" />
            </>
          )}
        </svg>
        <span style={styles.glyphCount} aria-label={\`\${meta.label}: \${count}\`}>
          {count}
        </span>
      </span>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// ENODRA MARK — hexagonal node, lightning stroke exiting as three branching
// feeder lines. 24px; the ONLY place the brand literal appears.
// ---------------------------------------------------------------------------

function EnodraMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <polygon
        points="14.5,12 11.5,17.2 5.5,17.2 2.5,12 5.5,6.8 11.5,6.8"
        stroke={BRAND}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M9.4 8.6 7.2 12.3h1.9L7.8 15.4l3.4-4.2H9.3l1.4-2.6Z" fill={BRAND} />
      <path d="M14.5 12h2.5M17 12l4.5-4.6M17 12h5M17 12l4.5 4.6" stroke={BRAND} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ALARM CHIP — 24px header chip; click = acknowledge (drops to 60% opacity,
// decrements the unacked count). Max 4 chips + "+N" overflow.
// ---------------------------------------------------------------------------

const ALARM_TONE: Record<AlarmSeverity, {text: string; border: string; bg: string}> = {
  CRIT: {text: RED, border: RED, bg: RED_SOFT},
  WARN: {text: AMBER_TEXT, border: AMBER, bg: AMBER_SOFT},
  INFO: {
    text: 'var(--color-text-secondary)',
    border: 'var(--color-border)',
    bg: 'var(--color-background-muted)',
  },
};

interface AlarmChipProps {
  alarm: Alarm;
  acked: boolean;
  onAck: (id: string) => void;
}

function AlarmChip({alarm, acked, onAck}: AlarmChipProps) {
  const tone = ALARM_TONE[alarm.severity];
  return (
    <Tooltip content={alarm.detail}>
      <button
        type="button"
        className="gfc-focusable gfc-ack"
        style={{
          ...styles.alarmChip,
          borderColor: tone.border,
          backgroundColor: tone.bg,
          opacity: acked ? 0.6 : 1,
        }}
        aria-pressed={acked}
        aria-label={\`\${acked ? 'Acknowledged' : 'Acknowledge'} alarm: \${alarm.detail}\`}
        onClick={() => onAck(alarm.id)}>
        <span style={{...styles.alarmCode, color: tone.text}}>{alarm.code}</span>
        <span style={styles.alarmText}>{alarm.text}</span>
      </button>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// ONE-LINE DIAGRAM — hand-authored SVG, purely presentational. viewBox
// 960x620: 12 kV main bus (4px line at y=88, x=80..880), transformer T1
// entering from the top at x=480 (two r=14 circles overlapping 8px), five
// feeder drops at x=160/320/480/640/800 (18x18 breaker squares at y=140,
// 2.5px segments down to labeled load blocks at y=520), recloser REC-9 on
// F1, and normally-open tie TIE-27 linking the F3/F4 tails at y=460.
// ---------------------------------------------------------------------------

const SEG_COLOR: Record<SegState, string> = {
  energized: 'var(--color-text-primary)',
  deenergized: 'var(--color-text-secondary)',
  backfed: AMBER,
};

interface OneLineDiagramProps {
  deviceStates: Record<string, {state: DeviceState}>;
  segmentStates: Record<string, SegState>;
  segmentLoadLabels: Record<string, string>;
  tieClosed: boolean;
  selectedFeederId: string | null;
  isMotionReduced: boolean;
  onToggleBreaker: (id: string) => void;
  onSelectFeeder: (id: string) => void;
}

function OneLineDiagram({
  deviceStates,
  segmentStates,
  segmentLoadLabels,
  tieClosed,
  selectedFeederId,
  isMotionReduced,
  onToggleBreaker,
  onSelectFeeder,
}: OneLineDiagramProps) {
  const breakerKey = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleBreaker(id);
    }
  };
  const feederKey = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectFeeder(id);
    }
  };
  return (
    // role=group (not img) so the interactive breaker/feeder children stay
    // exposed to assistive tech; the legend is real text, not alt.
    <svg
      viewBox="0 0 960 620"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="group"
      aria-label={\`One-line diagram, \${SUBSTATION.name} bus A, five feeders 12F1 through 12F5\`}>
      {/* 12 kV main bus */}
      <line x1={80} y1={88} x2={880} y2={88} stroke={SEG_COLOR.energized} strokeWidth={4} />
      <text x={80} y={74} fontSize={10} fill="var(--color-text-secondary)" style={{fontVariantNumeric: 'tabular-nums'}}>
        BUS A · 12 kV
      </text>
      {/* Transformer T1 — two-circle symbol, r=14, overlapping 8px */}
      <line x1={480} y1={6} x2={480} y2={14} stroke={SEG_COLOR.energized} strokeWidth={2.5} />
      <circle cx={480} cy={28} r={14} stroke={SEG_COLOR.energized} strokeWidth={2.5} fill="none" />
      <circle cx={480} cy={48} r={14} stroke={SEG_COLOR.energized} strokeWidth={2.5} fill="none" />
      <line x1={480} y1={62} x2={480} y2={86} stroke={SEG_COLOR.energized} strokeWidth={2.5} />
      <text x={502} y={42} fontSize={10} fill="var(--color-text-secondary)">
        T1 · 115/12 kV
      </text>

      {FEEDER_LIST.map(feeder => {
        const breaker = deviceStates[feeder.breakerId];
        const isClosed = breaker.state === 'closed';
        const segState = segmentStates[feeder.id];
        const isSelected = selectedFeederId === feeder.id;
        const segColor = SEG_COLOR[segState];
        const segWidth = isSelected ? 3 : 2.5; // selected feeder: 3px stroke
        const dash = segState === 'deenergized' ? '6 4' : undefined; // static dash — never animated
        const x = feeder.x;
        return (
          <g key={feeder.id}>
            {/* bus-side stub stays energized above the breaker */}
            <line x1={x} y1={90} x2={x} y2={131} stroke={SEG_COLOR.energized} strokeWidth={2.5} />
            {/* Breaker: filled = closed, 2px hollow = open; 28x28 hit rect */}
            <g
              role="button"
              tabIndex={0}
              className="gfc-focusable"
              aria-pressed={isClosed}
              aria-label={\`Breaker \${feeder.breakerId}, \${isClosed ? 'closed' : 'open'}, \${feeder.name}\`}
              style={{cursor: 'pointer'}}
              onClick={() => onToggleBreaker(feeder.breakerId)}
              onKeyDown={breakerKey(feeder.breakerId)}>
              <rect x={x - 14} y={126} width={28} height={28} fill="transparent" />
              <rect
                x={x - 9}
                y={131}
                width={18}
                height={18}
                fill={isClosed ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                style={{color: 'var(--color-text-primary)'}}
              />
            </g>
            <text x={x + 14} y={144} fontSize={10} fill="var(--color-text-secondary)">
              {feeder.breakerId}
            </text>
            {/* Feeder segment down to the load block */}
            <line
              x1={x}
              y1={149}
              x2={x}
              y2={518}
              stroke={segColor}
              strokeWidth={segWidth}
              strokeDasharray={dash}
            />
            {/* Segment midpoint load label */}
            <text
              x={x + 8}
              y={338}
              fontSize={10}
              fill="var(--color-text-secondary)"
              style={{fontVariantNumeric: 'tabular-nums'}}>
              {segmentLoadLabels[feeder.id]}
            </text>
            {/* Recloser REC-9 mid-segment on F1 */}
            {feeder.id === '12F1' ? (
              <>
                <circle
                  cx={x}
                  cy={290}
                  r={8}
                  fill="var(--color-background-card)"
                  stroke={segColor}
                  strokeWidth={2}
                />
                <text x={x - 14} y={294} fontSize={9} textAnchor="end" fill="var(--color-text-secondary)">
                  REC-9
                </text>
              </>
            ) : null}
            {/* Load block — clicking selects the feeder */}
            <g
              role="button"
              tabIndex={0}
              className="gfc-focusable"
              aria-label={\`Select feeder \${feeder.name}, \${feeder.customersLabel} customers\`}
              style={{cursor: 'pointer'}}
              onClick={() => onSelectFeeder(feeder.id)}
              onKeyDown={feederKey(feeder.id)}>
              <rect
                x={x - 72}
                y={520}
                width={144}
                height={36}
                rx={4}
                fill="var(--color-background-card)"
                stroke={isSelected ? 'var(--color-accent)' : segColor}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeDasharray={dash}
              />
              {/* foreignObject so the 47-char Eastgate label ellipsizes */}
              <foreignObject x={x - 64} y={524} width={128} height={30} style={{pointerEvents: 'none'}}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                  {feeder.name}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'var(--color-text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}>
                  {feeder.customersLabel} customers
                </div>
              </foreignObject>
            </g>
          </g>
        );
      })}

      {/* TIE-27 — normally-open tie between the F3 and F4 tails at y=460.
          Amber + filled when carrying backfeed; the pulse collapses under
          prefers-reduced-motion (static amber). */}
      <line
        className={tieClosed && !isMotionReduced ? 'gfc-backfeed' : undefined}
        x1={480}
        y1={460}
        x2={640}
        y2={460}
        stroke={tieClosed ? SEG_COLOR.backfed : 'var(--color-text-secondary)'}
        strokeWidth={tieClosed ? 3 : 2}
        strokeDasharray={tieClosed ? undefined : '6 4'}
      />
      <rect
        x={553}
        y={453}
        width={14}
        height={14}
        fill={tieClosed ? SEG_COLOR.backfed : 'var(--color-background-card)'}
        stroke={tieClosed ? SEG_COLOR.backfed : 'var(--color-text-secondary)'}
        strokeWidth={2}
      />
      <text x={560} y={447} fontSize={9} textAnchor="middle" fill="var(--color-text-secondary)">
        TIE-27
      </text>
      <text x={560} y={481} fontSize={9} textAnchor="middle" fill="var(--color-text-secondary)">
        {tieClosed ? 'CLOSED' : 'N.O.'}
      </text>
    </svg>
  );
}

// Symbology legend — pinned bottom-left inside the canvas (corner map).
function DiagramLegend() {
  return (
    <div style={styles.legend}>
      <div style={styles.legendRow}>
        <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden focusable="false">
          <rect x={2} y={2} width={10} height={10} fill="var(--color-text-primary)" />
        </svg>
        <span style={styles.legendLabel}>Closed breaker</span>
      </div>
      <div style={styles.legendRow}>
        <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden focusable="false">
          <rect x={2.5} y={2.5} width={9} height={9} fill="none" stroke="var(--color-text-primary)" strokeWidth={2} />
        </svg>
        <span style={styles.legendLabel}>Open breaker</span>
      </div>
      <div style={styles.legendRow}>
        <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden focusable="false">
          <line x1={0} y1={7} x2={14} y2={7} stroke="var(--color-text-secondary)" strokeWidth={2} strokeDasharray="4 3" />
        </svg>
        <span style={styles.legendLabel}>De-energized</span>
      </div>
      <div style={styles.legendRow}>
        <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden focusable="false">
          <rect x={2.5} y={2.5} width={9} height={9} fill="none" stroke="var(--color-text-secondary)" strokeWidth={2} />
        </svg>
        <span style={styles.legendLabel}>N.O. — normally-open tie</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOAD HEADROOM ROW — 44px dense composite; no internal state.
// ---------------------------------------------------------------------------

function barFillColor(loadPct: number): string {
  if (loadPct > 100) return RED;
  if (loadPct >= 80) return AMBER; // Ridgeline at exactly 100 pins amber, not red
  return OK_GREEN;
}

interface LoadHeadroomRowProps {
  feeder: Feeder;
  loadPct: number;
  loadLabel: string;
  selected: boolean;
  deenergized: boolean;
  onSelect: (id: string) => void;
}

function LoadHeadroomRow({feeder, loadPct, loadLabel, selected, deenergized, onSelect}: LoadHeadroomRowProps) {
  // 100% of seasonal rating sits at 78% of track width; scale tops out at
  // 128% (scaleX 1). Fill animates via transform, never width.
  const scale = Math.min(loadPct, 128) * 0.0078;
  const hasCritical = feeder.criticalLoads.length > 0;
  return (
    <button
      type="button"
      className="gfc-focusable"
      style={selected ? {...styles.feederRow, ...styles.feederRowSelected} : styles.feederRow}
      aria-pressed={selected}
      aria-label={\`Select feeder \${feeder.name}, \${loadLabel}\${deenergized ? ', de-energized' : ''}\`}
      onClick={() => onSelect(feeder.id)}>
      {/* 4px critical-load stripe — omitted when no critical loads */}
      {hasCritical ? <span style={styles.stripe} aria-hidden /> : <span style={styles.stripeSpacer} aria-hidden />}
      <span style={styles.feederName}>
        <span style={styles.feederTitle}>
          <span style={styles.feederTitleText}>{feeder.name}</span>
          {deenergized ? <span style={styles.deenergizedTag}>DE-ENERGIZED</span> : null}
        </span>
        <span style={styles.feederSub}>
          {feeder.customersLabel} customers · {feeder.breakerId}
        </span>
      </span>
      <span
        style={deenergized ? {...styles.barTrack, opacity: 0.5} : styles.barTrack}
        role="meter"
        aria-valuenow={loadPct}
        aria-valuemin={0}
        aria-valuemax={128}
        aria-valuetext={\`\${loadPct} percent of seasonal rating\${loadPct > 100 ? ', overload' : ''}\`}
        aria-label={\`\${feeder.name} load\`}>
        <span style={styles.barHatch} aria-hidden />
        <span
          className="gfc-fill"
          style={{
            ...styles.barFill,
            transform: \`scaleX(\${deenergized ? 0 : scale})\`,
            backgroundColor: barFillColor(loadPct),
          }}
          aria-hidden
        />
        <span style={styles.barTick} aria-hidden />
      </span>
      <span style={styles.feederRight}>
        <span style={{...styles.loadLabel, color: loadPct > 100 ? RED : 'var(--color-text-primary)'}}>
          {loadLabel}
        </span>
        {hasCritical ? (
          <span style={styles.glyphStrip}>
            {feeder.criticalLoads.map(load => (
              <CriticalLoadGlyph key={load.kind} kind={load.kind} count={load.count} />
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SWITCHING ORDER SHEET — gated procedure surface. The sequential interlock
// derives from executedStepIds order; the component stays presentational.
// ---------------------------------------------------------------------------

interface SwitchingStepRowProps {
  step: SwitchingStep;
  index: number;
  status: 'done' | 'ready' | 'blocked';
  onExecuteStep: (id: string) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function SwitchingStepRow({step, index, status, onExecuteStep, buttonRef}: SwitchingStepRowProps) {
  const discStyle =
    status === 'done'
      ? {...styles.disc, ...styles.discDone}
      : status === 'ready'
        ? {...styles.disc, ...styles.discReady}
        : {...styles.disc, ...styles.discBlocked};
  return (
    <div
      style={styles.stepRow}
      aria-disabled={status === 'blocked' ? true : undefined}
      aria-label={
        status === 'blocked'
          ? \`Step \${index + 1} blocked — complete step \${index} first: \${step.action}\`
          : undefined
      }>
      <span style={discStyle} aria-hidden>
        {index + 1}
      </span>
      <span
        style={
          status === 'blocked'
            ? {...styles.stepAction, color: 'var(--color-text-secondary)'}
            : styles.stepAction
        }>
        {step.action}
      </span>
      <span style={styles.deviceChip}>{step.device}</span>
      <span style={styles.stepRight}>
        {status === 'done' ? (
          <span style={styles.stepStamp}>
            <Icon icon={CheckIcon} size="xsm" color="inherit" style={{color: OK_GREEN}} />
            {step.stamp}
          </span>
        ) : status === 'ready' ? (
          <button
            ref={buttonRef}
            type="button"
            className="gfc-focusable"
            style={styles.executeButton}
            onClick={() => onExecuteStep(step.id)}>
            Execute
          </button>
        ) : (
          <span style={styles.blockedNote}>
            <Icon icon={LockIcon} size="xsm" color="secondary" />
            Blocked
          </span>
        )}
      </span>
    </div>
  );
}

interface SwitchingOrderSheetProps {
  executedStepIds: string[];
  onExecuteStep: (id: string) => void;
  stepButtonRef: (id: string) => (el: HTMLButtonElement | null) => void;
}

function SwitchingOrderSheet({executedStepIds, onExecuteStep, stepButtonRef}: SwitchingOrderSheetProps) {
  const done = new Set(executedStepIds);
  const readyIndex = executedStepIds.length; // steps unlock strictly in sequence
  const status = readyIndex === 0 ? 'DRAFT' : readyIndex >= SWITCHING_ORDER.steps.length ? 'COMPLETE' : 'IN PROGRESS';
  const badgeVariant = status === 'DRAFT' ? 'neutral' : status === 'COMPLETE' ? 'success' : 'warning';
  return (
    <div>
      <div style={styles.sheetHeader}>
        <Icon icon={ClipboardListIcon} size="xsm" color="secondary" />
        <Heading level={2} style={{fontSize: 13, margin: 0}}>
          <span style={styles.orderId}>{SWITCHING_ORDER.id}</span>
        </Heading>
        <Badge variant={badgeVariant} label={status} />
      </div>
      <div style={styles.sheetTarget}>{SWITCHING_ORDER.target}</div>
      {SWITCHING_ORDER.steps.map((step, i) => (
        <SwitchingStepRow
          key={step.id}
          step={step}
          index={i}
          status={done.has(step.id) ? 'done' : i === readyIndex ? 'ready' : 'blocked'}
          onExecuteStep={onExecuteStep}
          buttonRef={stepButtonRef(step.id)}
        />
      ))}
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Drafted
        </Text>
        <span style={styles.metaValue}>{SWITCHING_ORDER.draftedLine}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Hold tag
        </Text>
        <span style={{...styles.metaValue, fontFamily: MONO}}>{SWITCHING_ORDER.holdTag}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Backfeed
        </Text>
        <span style={styles.metaValue}>Available via TIE-27</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ASIDE — order sheet when drafted; feeder detail card when a feeder is
// selected and no order is active; substation summary otherwise. The footer
// owns the bottom-right corner: Execute step N | complete stamp | placard.
// ---------------------------------------------------------------------------

function FeederDetailCard({feeder, load}: {feeder: Feeder; load: FeederLoadFx}) {
  const nowAmps = Math.round((load.loadPct / 100) * feeder.ratingAmps);
  const headroom = load.deenergized ? '—' : \`\${feeder.ratingAmps - nowAmps} A\`;
  return (
    <div>
      <div style={styles.sheetHeader}>
        <Heading level={2} style={{fontSize: 13, margin: 0}}>
          Feeder detail
        </Heading>
      </div>
      <div style={{...styles.metaRow, height: 44}}>
        <span style={{...styles.metaValue, fontWeight: 600, whiteSpace: 'normal'}}>{feeder.name}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Breaker
        </Text>
        <span style={{...styles.metaValue, fontFamily: MONO}}>{feeder.breakerId}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Customers
        </Text>
        <span style={styles.metaValue}>{feeder.customersLabel}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Load now
        </Text>
        <span style={{...styles.metaValue, color: load.loadPct > 100 ? RED : undefined}}>{load.loadLabel}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Seasonal rating
        </Text>
        <span style={styles.metaValue}>{feeder.ratingAmps} A</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Headroom
        </Text>
        <span style={styles.metaValue}>{headroom}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Critical loads
        </Text>
        {feeder.criticalLoads.length > 0 ? (
          <span style={styles.glyphStrip}>
            {feeder.criticalLoads.map(load2 => (
              <CriticalLoadGlyph key={load2.kind} kind={load2.kind} count={load2.count} />
            ))}
          </span>
        ) : (
          <span style={styles.metaValue}>None</span>
        )}
      </div>
    </div>
  );
}

function SubstationSummary() {
  return (
    <div>
      <div style={styles.sheetHeader}>
        <Heading level={2} style={{fontSize: 13, margin: 0}}>
          Substation summary
        </Heading>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Transformer
        </Text>
        <span style={styles.metaValue}>T1 · 115/12 kV</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Bus
        </Text>
        <span style={styles.metaValue}>A · {SUBSTATION.voltageLabel}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Feeders
        </Text>
        <span style={styles.metaValue}>5</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Customers served
        </Text>
        <span style={styles.metaValue}>{TOTAL_CUSTOMERS_LABEL}</span>
      </div>
      <div style={styles.metaRow}>
        <Text type="supporting" size="xsm" color="secondary">
          Grid dispatcher
        </Text>
        <span style={styles.metaValue}>{OPERATORS.ruth.name}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the ONE state owner. Every surface calls update(id, patch);
// everything else derives from SCENARIOS on the devices signature.
// ---------------------------------------------------------------------------

interface ConsoleState {
  devices: Record<string, {state: DeviceState}>;
  executedStepIds: string[];
  ackedAlarmIds: string[];
  selectedFeederId: string | null;
}

interface EntityPatch {
  state?: DeviceState; // devices (BKR-*, REC-9, TIE-27)
  executed?: boolean; // switching steps
  acked?: boolean; // alarms
  selected?: boolean; // feeders
}

/**
 * Observe the work row's real width. Host chrome around the template (the
 * demo's sidebar, preview padding) starves the row independently of the
 * viewport, so viewport media queries alone cannot tell when the fixed
 * 340px rail / 380px aside have run the flex-1 one-line canvas out of room.
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

export default function GridFeederConsoleTemplate() {
  // Responsive subtraction: < 1360px of WORK-ROW width drops the 340px
  // rail; < 1080px also drops the 380px aside (drafted-order state persists
  // invisibly here). Measured on the row itself, not the viewport — see
  // useElementWidth. Width 0 = first pre-observer render; fall back to
  // viewport queries for that frame so wide hosts don't flash pane removal.
  const workRowRef = useRef<HTMLDivElement | null>(null);
  const workRowWidth = useElementWidth(workRowRef);
  const isViewportNarrow = useMediaQuery('(max-width: 1359px)');
  const isViewportVeryNarrow = useMediaQuery('(max-width: 1079px)');
  const isRailHidden = workRowWidth > 0 ? workRowWidth < 1360 : isViewportNarrow;
  const isAsideHidden = workRowWidth > 0 ? workRowWidth < 1080 : isViewportVeryNarrow;
  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<ConsoleState>({
    devices: INITIAL_DEVICES,
    executedStepIds: [],
    ackedAlarmIds: [],
    selectedFeederId: null,
  });

  // The single mutation path — setState-merges by entity id. Closing BKR-4
  // voids the draft order (executedStepIds cleared; scenario-only acks
  // dropped) so re-opening requires a re-draft.
  const update = useCallback((id: string, patch: EntityPatch) => {
    setState(prev => {
      let next = prev;
      if (patch.state !== undefined && prev.devices[id] != null) {
        const devices = {...prev.devices, [id]: {...prev.devices[id], state: patch.state}};
        let executedStepIds = prev.executedStepIds;
        let ackedAlarmIds = prev.ackedAlarmIds;
        if (id === 'BKR-4' && patch.state === 'closed') {
          executedStepIds = [];
          ackedAlarmIds = prev.ackedAlarmIds.filter(aid => BASE_ALARM_IDS.has(aid));
        }
        next = {...next, devices, executedStepIds, ackedAlarmIds};
      }
      if (patch.executed) {
        const expected = SWITCHING_ORDER.steps[prev.executedStepIds.length];
        if (expected != null && expected.id === id && prev.devices['BKR-4'].state === 'open') {
          next = {...next, executedStepIds: [...prev.executedStepIds, id]};
        }
      }
      if (patch.acked && !prev.ackedAlarmIds.includes(id)) {
        next = {...next, ackedAlarmIds: [...prev.ackedAlarmIds, id]};
      }
      if (patch.selected !== undefined) {
        next = {...next, selectedFeederId: patch.selected ? id : null};
      }
      return next;
    });
  }, []);

  // Pure derivations from the SCENARIOS lookup on the devices signature.
  const scenario = deriveScenario(state.devices);
  const orderActive = scenario.hasDraftedOrder;
  const orderComplete = orderActive && state.executedStepIds.length >= SWITCHING_ORDER.steps.length;
  let activeAlarms = scenario.alarms;
  if (orderComplete) {
    // CRIT downgrades to INFO once F4 is tagged & grounded; the drafted
    // notice is superseded by the completion stamp.
    activeAlarms = sortAlarms(
      activeAlarms.filter(a => a.id !== 'al-so2214').map(a => (a.id === 'al-f4-86' ? AL_F4_SECURED : a)),
    );
  }
  const ackedSet = new Set(state.ackedAlarmIds);
  const unackedCount = activeAlarms.filter(a => !ackedSet.has(a.id)).length;
  // Overflow chip absorbs width loss first: 4 chips wide, 2 when narrow.
  const visibleChipCount = isAsideHidden ? 2 : 4;
  const visibleAlarms = activeAlarms.slice(0, visibleChipCount);
  const overflowAlarms = activeAlarms.slice(visibleChipCount);

  const deenergizedFeeders = FEEDER_LIST.filter(f => scenario.feederLoads[f.id]?.deenergized);
  const announcement = orderComplete
    ? 'Order SO-2214 complete — Cannery 12F4 tagged and grounded'
    : deenergizedFeeders.length > 0
      ? deenergizedFeeders
          .map(f => \`\${f.name} de-energized, \${f.customersLabel} customers affected\`)
          .join('; ')
      : '';

  const segmentLoadLabels = Object.fromEntries(
    FEEDER_LIST.map(f => [f.id, \`\${scenario.feederLoads[f.id].loadPct}%\`]),
  );

  // After Execute, move focus to the next ready step's button.
  const stepButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevExecutedCount = useRef(0);
  useEffect(() => {
    const count = state.executedStepIds.length;
    if (count > prevExecutedCount.current) {
      const nextStep = SWITCHING_ORDER.steps[count];
      if (nextStep != null) {
        stepButtonRefs.current[nextStep.id]?.focus();
      }
    }
    prevExecutedCount.current = count;
  }, [state.executedStepIds]);

  const toggleBreaker = (id: string) =>
    update(id, {state: state.devices[id].state === 'open' ? 'closed' : 'open'});
  const selectFeeder = (id: string) => update(id, {selected: true});
  const executeStep = (id: string) => update(id, {executed: true});
  const ackAlarm = (id: string) => update(id, {acked: true});
  const readyStep = orderActive ? SWITCHING_ORDER.steps[state.executedStepIds.length] : undefined;
  const selectedFeeder = FEEDER_LIST.find(f => f.id === state.selectedFeederId);

  return (
    <div style={styles.root}>
      <style>{CONSOLE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.header}>
              {/* Corner: top-left — Enodra mark + substation identity */}
              <div style={styles.brandCluster}>
                <EnodraMark />
                <Heading level={1} style={{fontSize: 14, margin: 0, whiteSpace: 'nowrap'}}>
                  {SUBSTATION.name} · {SUBSTATION.voltageLabel}
                </Heading>
                {!isRailHidden ? (
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {TOTAL_CUSTOMERS_LABEL} customers served
                  </Text>
                ) : null}
              </div>
              {/* Alarm strip + affected counter: ONE polite live region */}
              <div style={styles.liveCluster} aria-live="polite">
                <div style={styles.alarmStrip}>
                  {visibleAlarms.map(alarm => (
                    <AlarmChip key={alarm.id} alarm={alarm} acked={ackedSet.has(alarm.id)} onAck={ackAlarm} />
                  ))}
                  {overflowAlarms.length > 0 ? (
                    <Tooltip
                      content={overflowAlarms.map(a => \`\${a.severity} \${a.code} — \${a.text}\`).join(' · ')}>
                      <span style={styles.overflowChip}>+{overflowAlarms.length}</span>
                    </Tooltip>
                  ) : null}
                </div>
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
                  {unackedCount} unacked
                </Text>
                {/* Corner: top-right — affected-customers counter; clicking
                    selects the de-energized feeder */}
                <button
                  type="button"
                  className="gfc-focusable"
                  style={
                    scenario.affectedCustomers > 0
                      ? {...styles.affectedButton, ...styles.affectedHot}
                      : styles.affectedButton
                  }
                  aria-label={
                    scenario.affectedCustomers > 0
                      ? \`\${scenario.affectedLabel} customers affected — select the de-energized feeder\`
                      : 'No customers affected'
                  }
                  onClick={() => {
                    if (deenergizedFeeders.length > 0) {
                      selectFeeder(deenergizedFeeders[0].id);
                    }
                  }}>
                  <Icon icon={UsersIcon} size="xsm" color="inherit" />
                  {scenario.affectedLabel} affected
                </button>
                <span style={styles.visuallyHidden}>{announcement}</span>
              </div>
              <div style={styles.operatorBadge}>
                <Avatar name={OPERATORS.ruth.name} size="tiny" />
                <Text type="supporting" size="xsm" color="secondary">
                  {OPERATORS.ruth.badge}
                </Text>
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={workRowRef} style={styles.workRow}>
              {/* One-line canvas — legend pinned bottom-left */}
              <div style={{...styles.pane, ...styles.canvasPane}}>
                <span style={styles.canvasCaption} aria-hidden>
                  ONE-LINE · BUS A
                </span>
                <OneLineDiagram
                  deviceStates={state.devices}
                  segmentStates={scenario.segmentStates}
                  segmentLoadLabels={segmentLoadLabels}
                  tieClosed={scenario.tieClosed}
                  selectedFeederId={state.selectedFeederId}
                  isMotionReduced={isMotionReduced}
                  onToggleBreaker={toggleBreaker}
                  onSelectFeeder={selectFeeder}
                />
                <DiagramLegend />
              </div>
              {/* Feeder rail 340 — removed below 1360px (selection survives
                  via diagram clicks; loads via segment labels) */}
              {!isRailHidden ? (
                <div style={{...styles.pane, ...styles.rail}}>
                  <div style={styles.railHeader}>
                    <Heading level={2} style={{fontSize: 12, margin: 0}}>
                      Feeders
                    </Heading>
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      5 · {TOTAL_CUSTOMERS.toLocaleString('en-US')} customers
                    </Text>
                  </div>
                  {FEEDER_LIST.map(feeder => {
                    const load = scenario.feederLoads[feeder.id];
                    return (
                      <LoadHeadroomRow
                        key={feeder.id}
                        feeder={feeder}
                        loadPct={load.loadPct}
                        loadLabel={load.loadLabel}
                        selected={state.selectedFeederId === feeder.id}
                        deenergized={load.deenergized === true}
                        onSelect={selectFeeder}
                      />
                    );
                  })}
                </div>
              ) : null}
              {/* Switching aside 380 — removed below 1080px; order state
                  persists in the root so re-widening restores mid-procedure */}
              {!isAsideHidden ? (
                <div style={{...styles.pane, ...styles.aside}}>
                  <div style={styles.asideScroll}>
                    {orderActive ? (
                      <SwitchingOrderSheet
                        executedStepIds={state.executedStepIds}
                        onExecuteStep={executeStep}
                        stepButtonRef={id => el => {
                          stepButtonRefs.current[id] = el;
                        }}
                      />
                    ) : selectedFeeder != null ? (
                      <FeederDetailCard feeder={selectedFeeder} load={scenario.feederLoads[selectedFeeder.id]} />
                    ) : (
                      <SubstationSummary />
                    )}
                  </div>
                  {/* Corner: bottom-right — Execute while active, complete
                      stamp when done, empty-state placard otherwise */}
                  {orderActive && !orderComplete && readyStep != null ? (
                    <div style={styles.asideFooter}>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {state.executedStepIds.length} of {SWITCHING_ORDER.steps.length} steps complete
                      </Text>
                      <Button
                        label={\`Execute step \${state.executedStepIds.length + 1}\`}
                        variant="primary"
                        size="sm"
                        onClick={() => executeStep(readyStep.id)}
                      />
                    </div>
                  ) : orderComplete ? (
                    <div style={styles.asideFooter}>
                      <Text type="supporting" size="xsm" color="secondary">
                        Close BKR-4 to restore and void the order
                      </Text>
                      <span style={styles.completeStamp}>
                        <Icon icon={CheckIcon} size="xsm" color="inherit" style={{color: OK_GREEN}} />
                        Order SO-2214 complete
                      </span>
                    </div>
                  ) : (
                    <div style={styles.placard}>
                      <Text type="supporting" size="xsm" color="secondary">
                        No active switching order — open a breaker on the one-line to draft one
                      </Text>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};