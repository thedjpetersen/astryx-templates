var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Chockline ramp picture frozen at
 *   T0 = 13:40Z (now = T0+22 = 14:02Z): six stands (A2 inbound, A4 hero,
 *   B1, B3, C2 empty, D5 pre-delayed), five flights with minute-offset
 *   milestone schedules and dual fields (startMin + startLabel), a GSE
 *   fleet with named operators, per-flight milestone logs (VA 218 carries
 *   12 rows), and a four-step pushback clearance ladder per flight. No
 *   Date.now, no Math.random, no network assets — every time string is
 *   derived from the frozen T0 by pure arithmetic.
 * @output Ramp Turnaround Console — a ramp coordinator's stand board where
 *   every aircraft is one dense 56px turnaround gantt row: overlapping
 *   milestone bars (deboard, clean, fuel, catering, board, pushback) in
 *   two alternating 14px lanes with dependency locks and a computed
 *   critical-path glow; a 400px flight aside with milestone log, GSE
 *   roster, and a sequential-arming pushback clearance stack. Dragging
 *   VA 218's fuel handle +10 min re-runs the dependency solver: board and
 *   pushback slide right, the critical glow re-routes from the clean chain
 *   to the fuel chain, the row and header EOBT chips flip ON-TIME → +6,
 *   a DELAY ATTR row lands in the log, the tug step grows an amber
 *   caption, and the footer's critical-watch count increments.
 * @position Page template; emitted by \`astryx template ramp-turnaround-console\`
 *
 * Frame: root 100dvh div > Layout height="fill" > LayoutContent padding 0 >
 *   view root (measured flex row) > main column (48px header bar > 40px
 *   stand strip > 24px time ruler > scrollable stand list > 28px footer
 *   strip) + 400px aside (48px aside header > scrollable middle: milestone
 *   log then GSE roster > pinned PushbackClearanceStack). Below 1080px of
 *   CONTAINER width the aside re-mounts as a right-edge overlay panel
 *   inside the main column (position: relative on the content wrap).
 * Container policy: app-shell archetype — frame rows, rails, and panels
 *   only; no Cards. Gantt rows, log rows, and clearance steps are styled
 *   divs on the shell surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (#2456E6, light-dark paired) used as a runtime value for the chock
 *   fill, the critical-path glow (via color-mix), selection ring/wash, and
 *   the ARM tint; brand FILL and brand TEXT are separate values (contrast
 *   math at the declaration). Data-viz milestone hues ride
 *   var(--color-data-categorical-*) with the repo-standard light-dark
 *   fallbacks. Green/amber states always pair with text ('OT' / '+6'),
 *   never color-only.
 *
 * Density grid (verbatim everywhere): 48px header bar; 40px stand-strip
 * row; 24px time-ruler row; 56px turnaround gantt rows (4px vertical
 * padding, two 14px bar lanes at y=8 and y=26 with 4px inter-lane gap);
 * 36px aside list rows (milestone log, GSE roster); 44px pushback
 * clearance steps; 28px footer status strip; 400px fixed aside; single
 * gutter token GUTTER = 12 (all paddings/gaps are GUTTER or GUTTER/2 = 6);
 * 148px gantt-row left rail; 64px gantt-row right cap.
 *
 * Responsive contract — all bands key off MEASURED CONTAINER WIDTH of the
 * view root via a ResizeObserver hook (the demo stage is ~1045–1075px
 * inside a 1440px window, so viewport media queries are wrong by
 * construction; viewport queries remain only as the width-0 first-frame
 * fallback). Subtraction, never reflow:
 * - >= 1080px: full layout, main + 400px aside.
 * - 900–1079px (the default demo state): the aside column drops; selecting
 *   a row opens the same aside content as a right-edge overlay panel with
 *   Escape-to-close and focus restore; EOBT chips stay in-row so drag
 *   consequences remain visible.
 * - 720–899px: gantt left rail narrows 148 → 96 (aircraft-type line
 *   omitted); TimeRuler labels every 30 min instead of 15.
 * - < 720px: header title collapses to the mark only, stand strip becomes
 *   overflow-x scroll, milestone bar inner labels omitted entirely (lock
 *   glyphs and bars only).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import {LockIcon, XIcon} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (spec hex #2456E6). Fill vs text split:
// - BRAND_FILL is a graphic fill (chocks, rings, glow) — no contrast duty.
// - BRAND_TEXT must pass 4.5:1 as text: #1D46BE on #FFFFFF ≈ 7.6:1;
//   #9DB4F8 on #1E1E1E ≈ 7.2:1. Both clear 4.5:1.
const BRAND_FILL = 'light-dark(#2456E6, #7396F5)';
const BRAND_TEXT = 'light-dark(#1D46BE, #9DB4F8)';
const BRAND_WASH = 'light-dark(rgba(36, 86, 230, 0.08), rgba(115, 150, 245, 0.14))';
// Critical-path glow: brand at 35% over transparent (spec arithmetic).
const CRITICAL_RING = \`color-mix(in srgb, \${BRAND_FILL} 35%, transparent)\`;

// State greens/ambers — always paired with text ('OT' / '+6' / 'DONE').
// Text-duty variants: #0A7A1A on white ≈ 5.1:1; #4CD964→#34C759 on dark
// panels ≈ 8:1; #92400E on white ≈ 7.7:1; #FBBF24 on #1E1E1E ≈ 9.6:1.
const OK_FILL = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const OK_TEXT = 'light-dark(#0A7A1A, #4CD964)';
const OK_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
const WARN_FILL = 'var(--color-data-categorical-orange, light-dark(#C2410C, #FB923C))';
const WARN_TEXT = 'light-dark(#92400E, #FBBF24)';
const WARN_SOFT = 'light-dark(rgba(194, 65, 12, 0.10), rgba(251, 146, 60, 0.16))';

// Milestone bar hues (bars render as 22% wash + 1px solid border + default
// text label, so the hue never has text-contrast duty).
const MS_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const MS_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const MS_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const MS_CYAN = 'var(--color-data-categorical-cyan, light-dark(#0870A8, #38BDF8))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

const GUTTER = 12; // the single gutter token; halves are GUTTER / 2 = 6

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the reduced-motion guard. Transitions animate
// transform/opacity/color only (bars slide via translateX, never \`left\`);
// under prefers-reduced-motion every transition collapses to instant.
// ---------------------------------------------------------------------------

const CONSOLE_CSS = \`
.rtc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.rtc-rowbtn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.rtc-bar {
  transition: transform 300ms ease, box-shadow 200ms ease;
}
.rtc-chip {
  transition: color 150ms ease, opacity 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .rtc-bar { transition: none; }
  .rtc-chip { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // View root: THE measured element for every responsive band.
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    position: 'relative', // hosts the < 1080px aside overlay
  },
  // 48px header bar --------------------------------------------------------
  header: {
    height: 48,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  brandCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  wordmark: {fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em'},
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    flexShrink: 0,
  },
  clock: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // EOBT delta chips: 22px in the header, 20px in the gantt right cap.
  eobtChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  eobtChipSmall: {height: 20, paddingInline: 6, borderRadius: 10, fontSize: 10},
  eobtOk: {backgroundColor: OK_SOFT, color: OK_TEXT},
  eobtLate: {backgroundColor: WARN_SOFT, color: WARN_TEXT},
  // 40px stand strip -------------------------------------------------------
  standStrip: {
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  standStripScroll: {overflowX: 'auto', overflowY: 'hidden'},
  standChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    height: 28,
    paddingInline: 10,
    borderRadius: 14,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  standChipSelected: {boxShadow: \`0 0 0 1.5px \${BRAND_FILL}\`},
  standChipIdle: {cursor: 'default', color: 'var(--color-text-secondary)'},
  standDot: {width: 6, height: 6, borderRadius: 3, flexShrink: 0},
  // 24px time ruler --------------------------------------------------------
  ruler: {
    height: 24,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  rulerTimeline: {flex: 1, minWidth: 0, position: 'relative'},
  rulerTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    fontFamily: MONO,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    paddingLeft: 3,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Stand list -------------------------------------------------------------
  standList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  ganttRow: {
    position: 'relative',
    height: 56, // 4px vertical padding + lanes at y=8 / y=26 (14px, 4px gap)
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  rowButton: {
    position: 'absolute',
    inset: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
  },
  rowButtonSelected: {backgroundColor: BRAND_WASH},
  // 148px left rail (96px in the 720–899 band); three stacked lines, each
  // omitted when undefined — see the STAND_C2 empty-stand fixture.
  rail: {
    width: 148,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1,
    paddingInline: GUTTER,
    minWidth: 0,
    position: 'relative',
    pointerEvents: 'none',
  },
  railCode: {fontSize: 13, fontWeight: 700, lineHeight: '15px'},
  railIdent: {
    fontFamily: MONO,
    fontSize: 12,
    lineHeight: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis', // TMX 9042 → Ulaanbaatar (ULN) exercises this
  },
  railType: {
    fontSize: 11,
    lineHeight: '13px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timeline: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    pointerEvents: 'none',
  },
  bar: {
    position: 'absolute',
    left: 0,
    height: 14,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    paddingInline: 4,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  barLabel: {
    fontSize: 10,
    lineHeight: '12px',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  connector: {
    position: 'absolute',
    left: 0,
    width: 2,
    backgroundColor: CRITICAL_RING,
  },
  fuelHandleHit: {
    position: 'absolute',
    left: 0,
    width: 24, // 24px pointer hit area around the 8px visible grip tab
    height: 24,
    display: 'flex',
    // alignItems is set per-row: the visible grip hangs OUTSIDE the 14px
    // lane (above for the y=8 lane, below for y=26) so it never occludes
    // the glyphs of same-lane pills that overlap the fuel end-cap (Board
    // label / lock icon).
    justifyContent: 'flex-end',
    cursor: 'ew-resize',
    pointerEvents: 'auto',
    touchAction: 'none',
    background: 'transparent',
  },
  fuelHandleGrip: {
    width: 8,
    height: 9, // 1px overlaps the bar border; 8px protrudes past the lane edge
    borderRadius: 3,
    backgroundColor: WARN_FILL,
    marginRight: 8,
  },
  // 64px right cap: the per-row EOBT chip.
  rowCap: {
    width: 64,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  emptyStandNote: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: GUTTER,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  // 28px footer strip ------------------------------------------------------
  footer: {
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // 400px aside ------------------------------------------------------------
  aside: {
    width: 400,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  asideOverlay: {
    position: 'absolute',
    top: 48, // below the header bar so the EOBT consequence chip stays visible
    right: 0,
    bottom: 0,
    width: 400,
    maxWidth: '100%',
    zIndex: 3,
    boxShadow: 'var(--shadow-high)',
  },
  asideHeader: {
    height: 48,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  asideScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: \`\${GUTTER / 2}px 0\`,
  },
  asideSectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: GUTTER / 2,
    padding: \`\${GUTTER / 2}px \${GUTTER}px\`,
  },
  // 36px aside list rows (milestone log + GSE roster rows).
  logRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  logTime: {
    fontFamily: MONO,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    width: 42,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  logTag: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  logText: {
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  gseWrap: {
    display: 'flex',
    flexWrap: 'wrap', // AT 130's 7 chips force this to wrap
    gap: GUTTER / 2,
    padding: \`\${GUTTER / 2}px \${GUTTER}px \${GUTTER}px\`,
  },
  gseChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingInline: 5,
    borderRadius: 14,
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
  },
  gseInitials: {
    width: 18,
    height: 18,
    borderRadius: 9,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  gseCode: {fontFamily: MONO, fontSize: 11, whiteSpace: 'nowrap'},
  // Pushback clearance stack: 4 × 44px steps + 44px confirm row, pinned.
  clearance: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: \`\${GUTTER / 2}px \${GUTTER}px \${GUTTER}px\`,
  },
  clearanceStep: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    position: 'relative',
  },
  stepDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
  },
  stepConnector: {
    position: 'absolute',
    left: 11,
    top: 34,
    width: 2,
    height: 20, // bridges the 44px step rows between 24px discs
  },
  stepLabel: {fontSize: 13, lineHeight: '15px'},
  stepCaption: {fontSize: 10, lineHeight: '12px', color: WARN_TEXT},
  stepCap: {
    marginLeft: 'auto',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  stepDone: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    color: OK_TEXT,
  },
  confirmRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
  },
  // Visually hidden — the single polite live region.
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
};

// ---------------------------------------------------------------------------
// TIME — frozen T0 = 13:40Z; the internal "now" is T0+22 (14:02Z). All
// labels derive from T0 by pure arithmetic; no clocks anywhere.
// ---------------------------------------------------------------------------

const T0_TOTAL_MIN = 13 * 60 + 40; // 13:40Z
const NOW_MIN = 22; // frozen now line: T0+22 = 14:02Z
const WINDOW_MIN = 90; // board window T0 .. T0+90

function zulu(min: number): string {
  const total = T0_TOTAL_MIN + min;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return \`\${String(hh).padStart(2, '0')}:\${String(mm).padStart(2, '0')}Z\`;
}

const signed = (n: number): string => (n > 0 ? \`+\${n}\` : \`\${n}\`);

// ---------------------------------------------------------------------------
// DATA MODEL
// ---------------------------------------------------------------------------

type MilestoneId = 'deboard' | 'clean' | 'fuel' | 'catering' | 'board' | 'pushback';

interface Milestone {
  id: MilestoneId;
  label: string; // bar inner label, rendered only when barWidth >= 56px
  baseStartMin: number; // planned floor; the solver never pulls earlier
  startMin: number; // solver output
  durMin: number;
  startLabel: string; // dual field of startMin
  endLabel: string; // dual field of startMin + durMin
  lockedBy?: MilestoneId[];
  minDurMin?: number;
  maxDurMin?: number;
}

type GseKind = 'beltLoader' | 'fuelTruck' | 'tug' | 'cateringLoader' | 'lavCart';
type GseState = 'occupied' | 'enroute' | 'staged';

interface GseAssignment {
  id: string;
  kind: GseKind;
  code: string; // 'TUG-07'
  initials: string; // 'MV'
  operator: string; // 'M. Vega'
  state: GseState;
}

interface ClearanceStep {
  id: string;
  label: string;
  done: boolean;
}

type FlightId =
  | 'FLIGHT_VA218'
  | 'FLIGHT_BX452'
  | 'FLIGHT_KJ77'
  | 'FLIGHT_TMX9042'
  | 'FLIGHT_AT130';

interface Flight {
  id: FlightId;
  ident: string; // 'VA 218'
  identLine: string; // rail line 2 — TMX 9042's route string overflows 148px
  airline: string;
  aircraft: string; // rail line 3, omitted in the 720–899 band
  standCode: string;
  phase: 'active' | 'inbound';
  scheduledEobtMin: number;
  scheduledEobtLabel: string;
  milestones: Milestone[];
  criticalIds: MilestoneId[]; // solver output — the binding longest chain
  eobtDeltaMin: number; // solver output — pushbackEnd − scheduledEobtMin
  gse: GseAssignment[];
  clearance: ClearanceStep[];
  pushbackConfirmed: boolean;
}

interface LogRow {
  id: string;
  flightId: FlightId;
  timeLabel: string;
  tag: string; // 'FUEL' | 'DELAY ATTR' | 'GSE' | ...
  text: string;
}

interface Stand {
  id: string;
  code: string;
  status: 'turnaround' | 'idle' | 'inbound';
  flightId: FlightId | null;
  note?: string; // empty-stand line, e.g. STAND_C2
}

// ---------------------------------------------------------------------------
// DEPENDENCY SOLVER — pure. Walks deboard → clean → fuel/catering → board →
// pushback, pushing each dependent's start to max(dep ends). Ramp SOP: with
// cabin crew attending, boarding may overlap the FINAL 8 MINUTES of fueling,
// so fuel binds board at fuel.end − 8. That constant is what makes the spec
// arithmetic land: VA 218's fuel ends T0+34 → bind point T0+26 vs clean's
// T0+30 gate = exactly 4 min of slack, so the scripted +10 fuel drag yields
// EOBT +6 (10 grown − 4 slack absorbed).
// ---------------------------------------------------------------------------

const FUEL_BOARD_OVERLAP_MIN = 8;

function bindOffset(depId: MilestoneId, id: MilestoneId): number {
  return depId === 'fuel' && id === 'board' ? FUEL_BOARD_OVERLAP_MIN : 0;
}

function solveFlight(flight: Flight): Flight {
  const byId = new Map<MilestoneId, Milestone>();
  const milestones = flight.milestones.map(m => {
    let startMin = m.baseStartMin;
    for (const depId of m.lockedBy ?? []) {
      const dep = byId.get(depId);
      if (dep != null) {
        startMin = Math.max(
          startMin,
          dep.startMin + dep.durMin - bindOffset(depId, m.id),
        );
      }
    }
    const solved: Milestone = {
      ...m,
      startMin,
      startLabel: zulu(startMin),
      endLabel: zulu(startMin + m.durMin),
    };
    byId.set(m.id, solved);
    return solved;
  });

  // Critical chain: walk back from pushback along the BINDING dependency
  // (the dep whose bind point reaches the dependent's solved start). Ties
  // bind — VA 218's board starts exactly at clean.end, so the clean chain
  // glows until the fuel drag re-routes it.
  const criticalIds: MilestoneId[] = [];
  let cursor = byId.get('pushback');
  while (cursor != null) {
    criticalIds.unshift(cursor.id);
    let binding: Milestone | undefined;
    for (const depId of cursor.lockedBy ?? []) {
      const dep = byId.get(depId);
      if (
        dep != null &&
        dep.startMin + dep.durMin - bindOffset(depId, cursor.id) >= cursor.startMin
      ) {
        binding = dep;
      }
    }
    cursor = binding;
  }

  const pushback = byId.get('pushback');
  const eobtDeltaMin =
    pushback == null
      ? 0
      : pushback.startMin + pushback.durMin - flight.scheduledEobtMin;
  return {...flight, milestones, criticalIds, eobtDeltaMin};
}

// ---------------------------------------------------------------------------
// FIXTURES — identity consts; every aggregate on screen derives from these.
// Signed-in coordinator: R. Okafor ('RO'), a roster entry like everyone else.
// ---------------------------------------------------------------------------

const OP_MVEGA = {initials: 'MV', name: 'M. Vega'};
const OP_JOKORO = {initials: 'JO', name: 'J. Okoro'};
const OP_PLIND = {initials: 'PL', name: 'P. Lindqvist'};
const COORDINATOR = {initials: 'RO', name: 'R. Okafor'};

const gse = (
  id: string,
  kind: GseKind,
  code: string,
  op: {initials: string; name: string},
  state: GseState,
): GseAssignment => ({id, kind, code, initials: op.initials, operator: op.name, state});

const GSE_TUG07 = gse('GSE_TUG07', 'tug', 'TUG-07', OP_MVEGA, 'enroute');
const GSE_FUEL3 = gse('GSE_FUEL3', 'fuelTruck', 'FL-3', OP_JOKORO, 'occupied');
const GSE_BELT12 = gse('GSE_BELT12', 'beltLoader', 'BELT-12', OP_PLIND, 'occupied');
const GSE_CAT2 = gse('GSE_CAT2', 'cateringLoader', 'CAT-2', OP_JOKORO, 'occupied');
const GSE_LAV5 = gse('GSE_LAV5', 'lavCart', 'LAV-5', OP_PLIND, 'staged');

const ms = (
  id: MilestoneId,
  label: string,
  baseStartMin: number,
  durMin: number,
  lockedBy?: MilestoneId[],
  extra?: Partial<Milestone>,
): Milestone => ({
  id,
  label,
  baseStartMin,
  startMin: baseStartMin,
  durMin,
  startLabel: zulu(baseStartMin),
  endLabel: zulu(baseStartMin + durMin),
  lockedBy,
  ...extra,
});

const step = (id: string, label: string, done: boolean): ClearanceStep => ({
  id,
  label,
  done,
});

const CLEARANCE_TEMPLATE: ClearanceStep[] = [
  step('doors', 'Doors closed', false),
  step('bridge', 'Bridge clear', false),
  step('beacon', 'Beacon on', false),
  step('tug', 'Tug connected', false),
];

// Hero flight. Gate-scheduled EOBT T0+52 = 14:32Z. Fuel ends T0+34 vs
// clean's T0+30 → 4 min slack; the scripted +10 drag lands EOBT +6.
const FLIGHT_VA218: Flight = solveFlight({
  id: 'FLIGHT_VA218',
  ident: 'VA 218',
  identLine: 'VA 218 → Lisbon (LIS)',
  airline: 'Vantage Air',
  aircraft: 'A320',
  standCode: 'A4',
  phase: 'active',
  scheduledEobtMin: 52,
  scheduledEobtLabel: '14:32Z',
  milestones: [
    ms('deboard', 'Deboard', 0, 12),
    ms('clean', 'Clean', 12, 18, ['deboard']),
    ms('fuel', 'Fuel', 10, 24, undefined, {minDurMin: 15, maxDurMin: 60}),
    // Catering follows clean in the shared y=26 lane (index parity), so it
    // starts at clean.end — same-lane bars abut; CROSS-lane bars overlap.
    ms('catering', 'Cater', 30, 14),
    ms('board', 'Board', 30, 16, ['clean', 'fuel']),
    ms('pushback', 'Push', 46, 6, ['board']),
  ],
  criticalIds: [],
  eobtDeltaMin: 0,
  gse: [GSE_TUG07, GSE_FUEL3, GSE_BELT12, GSE_CAT2, GSE_LAV5],
  clearance: [
    step('doors', 'Doors closed', true),
    step('bridge', 'Bridge clear', false),
    step('beacon', 'Beacon on', false),
    step('tug', 'Tug connected', false),
  ],
  pushbackConfirmed: false,
});

// Inbound — turnaround not yet started (bars sit late in the window at 55%
// opacity); the ONE flight excluded from the "4 active turnarounds" count.
const FLIGHT_BX452: Flight = solveFlight({
  id: 'FLIGHT_BX452',
  ident: 'BX 452',
  identLine: 'BX 452 → Gdańsk (GDN)',
  airline: 'Boreal Express',
  aircraft: 'A220-300',
  standCode: 'A2',
  phase: 'inbound',
  scheduledEobtMin: 90,
  scheduledEobtLabel: '15:10Z',
  milestones: [
    ms('deboard', 'Deboard', 46, 10),
    ms('clean', 'Clean', 56, 14, ['deboard']),
    ms('fuel', 'Fuel', 54, 20, undefined, {minDurMin: 15, maxDurMin: 60}),
    ms('catering', 'Cater', 70, 12),
    ms('board', 'Board', 72, 12, ['clean', 'fuel']),
    ms('pushback', 'Push', 84, 6, ['board']),
  ],
  criticalIds: [],
  eobtDeltaMin: 0,
  gse: [
    gse('GSE_TUG11', 'tug', 'TUG-11', OP_MVEGA, 'staged'),
    gse('GSE_BELT03', 'beltLoader', 'BELT-03', OP_PLIND, 'staged'),
  ],
  clearance: CLEARANCE_TEMPLATE,
  pushbackConfirmed: false,
});

// Max-density stress: all milestones packed inside 40 minutes to exercise
// the y=8 / y=26 lane alternation with heavy horizontal overlap.
const FLIGHT_KJ77: Flight = solveFlight({
  id: 'FLIGHT_KJ77',
  ident: 'KJ 77',
  identLine: 'KJ 77 → Nice (NCE)',
  airline: 'Kestrel Jet',
  aircraft: 'E195-E2',
  standCode: 'B1',
  phase: 'active',
  scheduledEobtMin: 42,
  scheduledEobtLabel: '14:22Z',
  milestones: [
    ms('deboard', 'Deboard', 2, 8),
    ms('clean', 'Clean', 10, 12, ['deboard']),
    ms('fuel', 'Fuel', 10, 16, undefined, {minDurMin: 15, maxDurMin: 60}),
    ms('catering', 'Cater', 22, 12),
    ms('board', 'Board', 24, 10, ['clean', 'fuel']),
    ms('pushback', 'Push', 36, 6, ['board']),
  ],
  criticalIds: [],
  eobtDeltaMin: 0,
  gse: [
    gse('GSE_TUG04', 'tug', 'TUG-04', OP_JOKORO, 'occupied'),
    gse('GSE_FUEL1', 'fuelTruck', 'FL-1', OP_MVEGA, 'occupied'),
    gse('GSE_BELT07', 'beltLoader', 'BELT-07', OP_PLIND, 'enroute'),
  ],
  clearance: CLEARANCE_TEMPLATE,
  pushbackConfirmed: false,
});

// Rail-overflow stress: the 37+ char route line exists to exercise the
// 148px rail's ellipsis + title attr (see styles.railIdent).
const FLIGHT_TMX9042: Flight = solveFlight({
  id: 'FLIGHT_TMX9042',
  ident: 'TMX 9042',
  identLine: 'TMX 9042 → Ulaanbaatar (ULN)',
  airline: 'Transmeridian Charter',
  aircraft: 'B767-300ER',
  standCode: 'B3',
  phase: 'active',
  scheduledEobtMin: 70,
  scheduledEobtLabel: '14:50Z',
  milestones: [
    ms('deboard', 'Deboard', 0, 14),
    ms('clean', 'Clean', 14, 22, ['deboard']),
    ms('fuel', 'Fuel', 12, 30, undefined, {minDurMin: 15, maxDurMin: 60}),
    ms('catering', 'Cater', 36, 24),
    ms('board', 'Board', 40, 22, ['clean', 'fuel']),
    ms('pushback', 'Push', 62, 8, ['board']),
  ],
  criticalIds: [],
  eobtDeltaMin: 0,
  gse: [
    gse('GSE_TUG09', 'tug', 'TUG-09', OP_MVEGA, 'occupied'),
    gse('GSE_FUEL6', 'fuelTruck', 'FL-6', OP_JOKORO, 'occupied'),
    gse('GSE_BELT02', 'beltLoader', 'BELT-02', OP_PLIND, 'occupied'),
    gse('GSE_CAT4', 'cateringLoader', 'CAT-4', OP_JOKORO, 'enroute'),
  ],
  clearance: [
    step('doors', 'Doors closed', false),
    step('bridge', 'Bridge clear', false),
    step('beacon', 'Beacon on', false),
    step('tug', 'Tug connected', false),
  ],
  pushbackConfirmed: false,
});

// Pre-delayed: solver pushes board 20 → 26 (clean binds) so pushback ends
// T0+42 vs scheduled T0+30 = +12, visible before any interaction. Its log
// ships the existing delay-attribution row.
const FLIGHT_AT130: Flight = solveFlight({
  id: 'FLIGHT_AT130',
  ident: 'AT 130',
  identLine: 'AT 130 → Vienna (VIE)',
  airline: 'Altavia',
  aircraft: 'E190',
  standCode: 'D5',
  phase: 'active',
  scheduledEobtMin: 30,
  scheduledEobtLabel: '14:10Z',
  milestones: [
    ms('deboard', 'Deboard', 0, 10),
    ms('clean', 'Clean', 10, 16, ['deboard']),
    ms('fuel', 'Fuel', 8, 22, undefined, {minDurMin: 15, maxDurMin: 60}),
    ms('catering', 'Cater', 26, 10),
    ms('board', 'Board', 20, 10, ['clean', 'fuel']),
    ms('pushback', 'Push', 30, 6, ['board']),
  ],
  criticalIds: [],
  eobtDeltaMin: 0,
  // 7 chips — forces the aside GSE roster row to wrap (styles.gseWrap).
  gse: [
    gse('GSE_TUG02', 'tug', 'TUG-02', OP_JOKORO, 'occupied'),
    gse('GSE_FUEL2', 'fuelTruck', 'FL-2', OP_MVEGA, 'occupied'),
    gse('GSE_BELT04', 'beltLoader', 'BELT-04', OP_PLIND, 'occupied'),
    gse('GSE_BELT09', 'beltLoader', 'BELT-09', OP_JOKORO, 'staged'),
    gse('GSE_CAT1', 'cateringLoader', 'CAT-1', OP_MVEGA, 'occupied'),
    gse('GSE_LAV2', 'lavCart', 'LAV-2', OP_PLIND, 'staged'),
    gse('GSE_TUG05', 'tug', 'TUG-05', OP_MVEGA, 'staged'),
  ],
  clearance: [
    step('doors', 'Doors closed', true),
    step('bridge', 'Bridge clear', true),
    step('beacon', 'Beacon on', false),
    step('tug', 'Tug connected', false),
  ],
  pushbackConfirmed: false,
});

// Six stands; STAND_C2 is the empty omit-when-undefined row variant.
const STANDS: Stand[] = [
  {id: 'STAND_A2', code: 'A2', status: 'inbound', flightId: 'FLIGHT_BX452'},
  {id: 'STAND_A4', code: 'A4', status: 'turnaround', flightId: 'FLIGHT_VA218'},
  {id: 'STAND_B1', code: 'B1', status: 'turnaround', flightId: 'FLIGHT_KJ77'},
  {id: 'STAND_B3', code: 'B3', status: 'turnaround', flightId: 'FLIGHT_TMX9042'},
  {
    id: 'STAND_C2',
    code: 'C2',
    status: 'idle',
    flightId: null,
    note: 'no aircraft assigned · next inbound T0+120',
  },
  {id: 'STAND_D5', code: 'D5', status: 'turnaround', flightId: 'FLIGHT_AT130'},
];

const logRow = (
  id: string,
  flightId: FlightId,
  timeLabel: string,
  tag: string,
  text: string,
): LogRow => ({id, flightId, timeLabel, tag, text});

// Milestone log — ticket-shaped prose. VA 218 carries 12 rows to force the
// aside middle scroll; AT 130 ships the pre-existing DELAY ATTR row.
const INITIAL_LOG: LogRow[] = [
  logRow('l-va-12', 'FLIGHT_VA218', '14:02Z', 'OPS', 'Boarding target T0+30 confirmed with gate 14; agents in position.'),
  logRow('l-va-11', 'FLIGHT_VA218', '14:01Z', 'CATER', 'Galley swap complete; trolley seals verified by CAT-2 crew.'),
  logRow('l-va-10', 'FLIGHT_VA218', '13:59Z', 'LOAD', 'Fwd hold loaded 42 bags; aft hold in progress, 31 remaining.'),
  logRow('l-va-09', 'FLIGHT_VA218', '13:57Z', 'WX', 'Ramp wind 14 kt gusting 22; no fueling restriction issued.'),
  logRow('l-va-08', 'FLIGHT_VA218', '13:54Z', 'CATER', 'Catering truck CAT-2 docked at R2 door; 2 trolleys out.'),
  logRow('l-va-07', 'FLIGHT_VA218', '13:54Z', 'CLEAN', 'Cabin crew of 4 onboard; turn clean rows 1–26, lavs last.'),
  logRow('l-va-06', 'FLIGHT_VA218', '13:52Z', 'FUEL', 'Hydrant cart FL-3 connected; planned uplift 8,400 kg.'),
  logRow('l-va-05', 'FLIGHT_VA218', '13:52Z', 'DEBOARD', 'Deboarding complete; cabin handed to cleaning lead.'),
  logRow('l-va-04', 'FLIGHT_VA218', '13:46Z', 'BAG', 'Belt loader BELT-12 positioned; fwd hold door open.'),
  logRow('l-va-03', 'FLIGHT_VA218', '13:42Z', 'DEBOARD', 'Deboarding started; 148 pax via bridge, 2 wheelchair last.'),
  logRow('l-va-02', 'FLIGHT_VA218', '13:41Z', 'DOOR', 'L1 door open; bridge secure, GPU on aircraft power.'),
  logRow('l-va-01', 'FLIGHT_VA218', '13:40Z', 'ARR', 'VA 218 on blocks stand A4; chocks in, anti-collision off.'),
  logRow('l-at-04', 'FLIGHT_AT130', '14:00Z', 'BOARD', 'Boarding resumed after cabin release; 62 pax remaining.'),
  logRow('l-at-03', 'FLIGHT_AT130', '13:58Z', 'DELAY ATTR', 'Cabin service short-staffed; cleaning +9 min; EOBT +12.'),
  logRow('l-at-02', 'FLIGHT_AT130', '13:49Z', 'FUEL', 'FL-2 uplift complete 5,100 kg; panel secured.'),
  logRow('l-at-01', 'FLIGHT_AT130', '13:40Z', 'ARR', 'AT 130 on blocks stand D5; jetbridge unavailable, stairs in use.'),
  logRow('l-kj-02', 'FLIGHT_KJ77', '13:48Z', 'FUEL', 'FL-1 connected; compressed turn, uplift 3,900 kg.'),
  logRow('l-kj-01', 'FLIGHT_KJ77', '13:42Z', 'ARR', 'KJ 77 on blocks stand B1; 40-minute turn authorized.'),
  logRow('l-tmx-02', 'FLIGHT_TMX9042', '13:55Z', 'FUEL', 'FL-6 tanker uplift 38,200 kg for ULN sector; slow-flow first 5 min.'),
  logRow('l-tmx-01', 'FLIGHT_TMX9042', '13:41Z', 'ARR', 'TMX 9042 on blocks stand B3; charter handling per TMX SOP.'),
  logRow('l-bx-01', 'FLIGHT_BX452', '14:00Z', 'INBD', 'BX 452 estimated on blocks T0+44; stand A2 verified clear.'),
];

interface OpsState {
  flights: Record<FlightId, Flight>;
  selectedId: FlightId;
  log: LogRow[];
  announcement: string;
}

const INITIAL_OPS: OpsState = {
  flights: {
    FLIGHT_VA218,
    FLIGHT_BX452,
    FLIGHT_KJ77,
    FLIGHT_TMX9042,
    FLIGHT_AT130,
  },
  selectedId: 'FLIGHT_VA218',
  log: INITIAL_LOG,
  announcement: '',
};

// Baseline fuel durations (for delay-attribution arithmetic in log rows).
const BASE_FUEL_DUR: Record<FlightId, number> = {
  FLIGHT_VA218: 24,
  FLIGHT_BX452: 20,
  FLIGHT_KJ77: 16,
  FLIGHT_TMX9042: 30,
  FLIGHT_AT130: 22,
};

// ---------------------------------------------------------------------------
// HOOK — container-width measurement. The demo stage renders this page in a
// ~1045–1075px container inside a 1440px window, so VIEWPORT media queries
// are wrong by construction; every band keys off this measured width, with
// a viewport query kept only as the width-0 first-frame fallback.
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
// ChocklineMark — fully-custom inline SVG, 24×24 viewBox: nose-on fuselage
// circle, wing hairline, two BRAND wedge chocks whose baselines extend as a
// double underline (second rule at 40%). Strokes ride currentColor; only
// the chock fill uses the quarantined brand literal.
// ---------------------------------------------------------------------------

function ChocklineMark({size = 24}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <circle cx="12" cy="7.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="4,17 9,17 9,13.5" fill={BRAND_FILL} />
      <polygon points="15,13.5 20,17 15,17" fill={BRAND_FILL} />
      <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// GSEAssignmentChip — 28px pill: 20×20 hand-drawn vehicle glyph (1.5px
// stroke on a 20×20 grid), 18px operator-initials disc, 11px mono code,
// and a 2px state ring. The spec's SVG dash patterns map to CSS border
// styles: solid green = occupied, dashed amber = en-route ('4 2'), dotted
// gray = staged ('1 3'). Clicking toggles staged ↔ occupied through the
// single update() path (en-route chips arrive → occupied); the aside's
// "on stand" count re-derives.
// ---------------------------------------------------------------------------

const GSE_GLYPHS: Record<GseKind, ReactNode> = {
  beltLoader: (
    <>
      <path d="M2.5 15.5 L15.5 7.5 l2 3.5" />
      <circle cx="5.5" cy="16.5" r="1.7" />
      <circle cx="12.5" cy="16.5" r="1.7" />
    </>
  ),
  fuelTruck: (
    <>
      <path d="M2.5 14 v-4.5 h4 V14" />
      <rect x="7" y="8.5" width="9.5" height="5.5" rx="2.5" />
      <path d="M15.5 8 c1.5 -2.5 -1 -4 -2.5 -2.5" />
      <circle cx="5.5" cy="15.5" r="1.5" />
      <circle cx="13" cy="15.5" r="1.5" />
    </>
  ),
  tug: (
    <>
      <path d="M3 14 v-3.5 h4.5 v-2.5 h3 l2 6" />
      <path d="M12.5 11.5 L18 9" />
      <circle cx="6" cy="15.5" r="1.7" />
      <circle cx="12" cy="15.5" r="1.7" />
    </>
  ),
  cateringLoader: (
    <>
      <rect x="5" y="3.5" width="11" height="5" rx="1" />
      <path d="M6.5 16 L14.5 8.5 M14.5 16 L6.5 8.5" />
      <path d="M4.5 16.5 h12" />
    </>
  ),
  lavCart: (
    <>
      <rect x="3" y="8" width="10" height="6.5" rx="2" />
      <path d="M13 10 h4.5 v3" />
      <circle cx="6" cy="16.5" r="1.5" />
      <circle cx="10.5" cy="16.5" r="1.5" />
    </>
  ),
};

const GSE_STATE_META: Record<GseState, {label: string; ring: CSSProperties}> = {
  occupied: {label: 'occupied', ring: {border: \`2px solid \${OK_FILL}\`}},
  enroute: {label: 'en-route', ring: {border: \`2px dashed \${WARN_FILL}\`}},
  staged: {label: 'staged', ring: {border: '2px dotted var(--color-text-secondary)'}},
};

interface GSEAssignmentChipProps {
  assignment: GseAssignment;
  onToggle: (gseId: string) => void;
}

function GSEAssignmentChip({assignment, onToggle}: GSEAssignmentChipProps) {
  const meta = GSE_STATE_META[assignment.state];
  return (
    <button
      type="button"
      className="rtc-focusable rtc-chip"
      style={{...styles.gseChip, ...meta.ring}}
      title={\`\${assignment.code} — \${assignment.operator} — \${meta.label}\`}
      aria-label={\`\${assignment.code}, \${assignment.operator}, \${meta.label}. Toggle on-stand state\`}
      onClick={() => onToggle(assignment.id)}>
      <svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        aria-hidden
        focusable="false"
        style={{flexShrink: 0, color: 'var(--color-text-secondary)'}}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round">
        {GSE_GLYPHS[assignment.kind]}
      </svg>
      <span style={styles.gseInitials} aria-hidden>
        {assignment.initials}
      </span>
      <span style={styles.gseCode}>{assignment.code}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// StandStripChip — 28px chip: stand code + 6px status dot (green turnaround
// / gray idle / blue inbound); the selected chip gets a 1.5px BRAND ring.
// Clicking selects the stand's flight and scrolls its row into view. Empty
// stands are inert (aria-disabled) with an explanatory title.
// ---------------------------------------------------------------------------

const STAND_DOT_COLOR: Record<Stand['status'], string> = {
  turnaround: OK_FILL,
  idle: 'var(--color-text-secondary)',
  inbound: MS_BLUE,
};

interface StandStripChipProps {
  stand: Stand;
  selected: boolean;
  onSelect: (flightId: FlightId) => void;
}

function StandStripChip({stand, selected, onSelect}: StandStripChipProps) {
  const isIdle = stand.flightId == null;
  return (
    <button
      type="button"
      className="rtc-focusable rtc-chip"
      style={{
        ...styles.standChip,
        ...(selected ? styles.standChipSelected : undefined),
        ...(isIdle ? styles.standChipIdle : undefined),
      }}
      aria-pressed={selected}
      aria-disabled={isIdle || undefined}
      title={isIdle ? \`Stand \${stand.code} — \${stand.note ?? 'idle'}\` : \`Stand \${stand.code} — \${stand.status}\`}
      onClick={() => {
        if (stand.flightId != null) {
          onSelect(stand.flightId);
        }
      }}>
      <span
        style={{...styles.standDot, backgroundColor: STAND_DOT_COLOR[stand.status]}}
        aria-hidden
      />
      {stand.code}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TimeRuler — 24px strip: mono tick labels every 15 min from T0 to T0+90
// (every 30 in the 720–899 band), a 1px hairline grid the stand list
// continues via repeating-linear-gradient sized from the SAME pxPerMin,
// and the frozen now line at T0+22 (2px BRAND-at-60% rule + 6px triangle
// cap). The timeline div here is also the pxPerMin measurement source for
// every gantt row (identical rail/cap geometry).
// ---------------------------------------------------------------------------

const NOW_LINE_COLOR = \`color-mix(in srgb, \${BRAND_FILL} 60%, transparent)\`;

interface TimeRulerProps {
  pxPerMin: number;
  labelEveryMin: 15 | 30;
  railWidth: number;
  timelineRef: RefObject<HTMLDivElement | null>;
}

function TimeRuler({pxPerMin, labelEveryMin, railWidth, timelineRef}: TimeRulerProps) {
  const ticks: number[] = [];
  for (let t = 0; t <= WINDOW_MIN; t += 15) {
    ticks.push(t);
  }
  return (
    <div style={styles.ruler} aria-hidden>
      <div style={{width: railWidth, flexShrink: 0}} />
      <div ref={timelineRef} style={styles.rulerTimeline}>
        {pxPerMin > 0
          ? ticks.map(t => (
              <span key={t} style={{...styles.rulerTick, left: t * pxPerMin}}>
                {t % labelEveryMin === 0 && t < WINDOW_MIN ? zulu(t).slice(0, 5) : ''}
              </span>
            ))
          : null}
        {pxPerMin > 0 ? (
          <>
            <span
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: NOW_MIN * pxPerMin - 1,
                width: 2,
                backgroundColor: NOW_LINE_COLOR,
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: NOW_MIN * pxPerMin - 4,
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: \`6px solid \${BRAND_FILL}\`,
              }}
            />
          </>
        ) : null}
      </div>
      <div style={{width: 64, flexShrink: 0}} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EOBT delta chip — green 'OT' / amber '+6' (state is ALWAYS paired with
// text, never color-only). \`wide\` renders the header form ('EOBT ON-TIME').
// ---------------------------------------------------------------------------

function EobtChip({deltaMin, wide}: {deltaMin: number; wide?: boolean}) {
  const late = deltaMin > 0;
  const label = wide
    ? late
      ? \`EOBT \${signed(deltaMin)}\`
      : 'EOBT ON-TIME'
    : late
      ? signed(deltaMin)
      : 'OT';
  return (
    <span
      style={{
        ...styles.eobtChip,
        ...(wide ? undefined : styles.eobtChipSmall),
        ...(late ? styles.eobtLate : styles.eobtOk),
      }}
      title={late ? \`Estimated off-block \${signed(deltaMin)} min vs schedule\` : 'Estimated off-block on time'}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TurnaroundGanttRow — purely presentational 56px composite row: 148px rail
// (three stacked lines, each omitted when undefined — the STAND_C2 empty
// row renders code + note only), flex-1 timeline where bars alternate the
// y=8 / y=26 lanes by array-index parity, and a 64px right cap holding the
// 20px EOBT chip. Critical-path bars get the 2px brand-mix glow plus 2px
// connector segments between consecutive critical bars at lane midpoints.
// The fuel bar alone carries an 8px-wide drag grip tab (24px hit area,
// role='slider') that rides the lane edge — hanging outside the 14px bar
// (above for the y=8 lane, below for y=26) so it never covers the glyphs
// of same-lane pills overlapping the fuel end-cap; drag math lives here
// (round(dxPx / pxPerMin)) but only deltaMin is emitted — no state.
// ---------------------------------------------------------------------------

const MS_COLOR: Record<MilestoneId, string> = {
  deboard: MS_BLUE,
  clean: MS_TEAL,
  fuel: WARN_FILL,
  catering: MS_PURPLE,
  board: OK_FILL,
  pushback: MS_CYAN,
};

const laneTop = (index: number): number => (index % 2 === 0 ? 8 : 26);

function LockGlyph() {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      aria-hidden
      focusable="false"
      style={{flexShrink: 0, color: 'var(--color-text-secondary)'}}>
      <rect x="1.5" y="4.5" width="7" height="4.5" rx="1" fill="currentColor" />
      <path d="M3 4.5 V3 a2 2 0 0 1 4 0 v1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

interface TurnaroundGanttRowProps {
  flight: Flight;
  pxPerMin: number;
  selected: boolean;
  criticalIds: MilestoneId[];
  railWidth: number;
  showAircraftLine: boolean;
  showBarLabels: boolean;
  onSelect: (id: FlightId) => void;
  onFuelDelta: (flightId: FlightId, deltaMin: number) => void;
  rowButtonRef?: (el: HTMLButtonElement | null) => void;
}

function TurnaroundGanttRow({
  flight,
  pxPerMin,
  selected,
  criticalIds,
  railWidth,
  showAircraftLine,
  showBarLabels,
  onSelect,
  onFuelDelta,
  rowButtonRef,
}: TurnaroundGanttRowProps) {
  // Transient drag values live in a ref (never state) — only deltaMin
  // changes leave the component, via onFuelDelta.
  const dragRef = useRef<{startX: number; lastDelta: number} | null>(null);
  const fuelIndex = flight.milestones.findIndex(m => m.id === 'fuel');
  const fuel = fuelIndex >= 0 ? flight.milestones[fuelIndex] : undefined;
  const fuelLaneY = laneTop(Math.max(fuelIndex, 0));
  // y=8 (even-index) lane → grip hangs above; y=26 lane → hangs below.
  const fuelHangsBelow = fuelIndex % 2 === 1;
  const isInbound = flight.phase === 'inbound';

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {startX: e.clientX, lastDelta: 0};
  };
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || pxPerMin <= 0) {
      return;
    }
    const delta = Math.round((e.clientX - drag.startX) / pxPerMin);
    if (delta !== drag.lastDelta) {
      onFuelDelta(flight.id, delta - drag.lastDelta);
      drag.lastDelta = delta;
    }
  };
  const handlePointerEnd = () => {
    dragRef.current = null;
  };
  const handleSliderKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const stepBy =
      e.key === 'ArrowRight' ? 1
      : e.key === 'ArrowLeft' ? -1
      : e.key === 'PageUp' ? 5
      : e.key === 'PageDown' ? -5
      : 0;
    if (stepBy !== 0) {
      e.preventDefault();
      e.stopPropagation();
      onFuelDelta(flight.id, stepBy);
    }
  };

  // Critical connector segments: one 2px vertical rule at each junction
  // between consecutive critical bars, spanning the two lane midpoints.
  const connectors: Array<{key: string; x: number; top: number; height: number}> = [];
  if (pxPerMin > 0) {
    for (let i = 0; i < criticalIds.length - 1; i++) {
      const fromIdx = flight.milestones.findIndex(m => m.id === criticalIds[i]);
      const toIdx = flight.milestones.findIndex(m => m.id === criticalIds[i + 1]);
      if (fromIdx < 0 || toIdx < 0) {
        continue;
      }
      const to = flight.milestones[toIdx];
      const midFrom = laneTop(fromIdx) + 7;
      const midTo = laneTop(toIdx) + 7;
      connectors.push({
        key: \`\${criticalIds[i]}-\${criticalIds[i + 1]}\`,
        x: to.startMin * pxPerMin - 1,
        top: Math.min(midFrom, midTo),
        height: Math.max(2, Math.abs(midFrom - midTo)),
      });
    }
  }

  return (
    <li style={styles.ganttRow}>
      <button
        type="button"
        ref={rowButtonRef}
        className="rtc-rowbtn"
        style={{
          ...styles.rowButton,
          ...(selected ? styles.rowButtonSelected : undefined),
        }}
        aria-current={selected || undefined}
        aria-label={\`Select \${flight.ident}, stand \${flight.standCode}, EOBT \${
          flight.eobtDeltaMin > 0 ? \`plus \${flight.eobtDeltaMin} minutes\` : 'on time'
        }\`}
        onClick={() => onSelect(flight.id)}
      />
      <div style={{...styles.rail, width: railWidth}}>
        <span style={styles.railCode}>{flight.standCode}</span>
        <span style={styles.railIdent} title={flight.identLine}>
          {flight.identLine}
        </span>
        {showAircraftLine ? (
          <span style={styles.railType} title={\`\${flight.aircraft} · \${flight.airline}\`}>
            {flight.aircraft} · {isInbound ? 'inbound' : flight.airline}
          </span>
        ) : null}
      </div>
      <div
        style={{
          ...styles.timeline,
          // The ruler's hairline grid continues through the list — same
          // 15-minute pitch, same pxPerMin.
          backgroundImage:
            pxPerMin > 0
              ? \`repeating-linear-gradient(to right, var(--color-border) 0 1px, transparent 1px \${15 * pxPerMin}px)\`
              : undefined,
          opacity: isInbound ? 0.55 : 1,
        }}>
        {pxPerMin > 0
          ? flight.milestones.map((m, index) => {
              const width = m.durMin * pxPerMin;
              const color = MS_COLOR[m.id];
              const isCritical = criticalIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className="rtc-bar"
                  style={{
                    ...styles.bar,
                    top: laneTop(index),
                    width,
                    transform: \`translateX(\${m.startMin * pxPerMin}px)\`,
                    backgroundColor: \`color-mix(in srgb, \${color} 22%, transparent)\`,
                    border: \`1px solid \${color}\`,
                    boxShadow: isCritical ? \`0 0 0 2px \${CRITICAL_RING}\` : undefined,
                  }}
                  title={\`\${m.label} \${m.startLabel}–\${m.endLabel} (\${m.durMin} min)\`}>
                  {m.lockedBy != null && m.lockedBy.length > 0 ? <LockGlyph /> : null}
                  {showBarLabels && width >= 56 ? (
                    <span style={styles.barLabel}>{m.label}</span>
                  ) : null}
                </div>
              );
            })
          : null}
        {connectors.map(c => (
          <span
            key={c.key}
            className="rtc-bar"
            style={{
              ...styles.connector,
              top: c.top,
              height: c.height,
              transform: \`translateX(\${c.x}px)\`,
            }}
            aria-hidden
          />
        ))}
        {fuel != null && pxPerMin > 0 && !isInbound ? (
          <div
            role="slider"
            tabIndex={0}
            className="rtc-focusable"
            aria-label={\`Fueling duration, \${flight.ident}\`}
            aria-valuemin={fuel.minDurMin ?? 15}
            aria-valuemax={fuel.maxDurMin ?? 60}
            aria-valuenow={fuel.durMin}
            aria-valuetext={\`\${fuel.durMin} minutes\`}
            aria-orientation="horizontal"
            style={{
              ...styles.fuelHandleHit,
              // Grip tab hangs outside the lane so it never occludes the
              // Board pill's glyphs / lock icon sharing the fuel lane:
              // y=8 lane hangs above, y=26 lane hangs below.
              top: fuelHangsBelow ? fuelLaneY - 2 : fuelLaneY - 8,
              alignItems: fuelHangsBelow ? 'flex-end' : 'flex-start',
              transform: \`translateX(\${(fuel.startMin + fuel.durMin) * pxPerMin - 16}px)\`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={handleSliderKey}
            onClick={e => e.stopPropagation()}>
            <span style={styles.fuelHandleGrip} aria-hidden />
          </div>
        ) : null}
      </div>
      <div style={styles.rowCap}>
        <EobtChip deltaMin={flight.eobtDeltaMin} />
      </div>
    </li>
  );
}

// Empty-stand row — the omit-when-undefined rail variant (STAND_C2).
function EmptyStandRow({stand, railWidth, pxPerMin}: {stand: Stand; railWidth: number; pxPerMin: number}) {
  return (
    <li style={styles.ganttRow}>
      <div style={{...styles.rail, width: railWidth, pointerEvents: 'auto'}}>
        <span style={styles.railCode}>{stand.code}</span>
      </div>
      <div
        style={{
          ...styles.timeline,
          backgroundImage:
            pxPerMin > 0
              ? \`repeating-linear-gradient(to right, var(--color-border) 0 1px, transparent 1px \${15 * pxPerMin}px)\`
              : undefined,
        }}>
        <span style={styles.emptyStandNote}>{stand.note}</span>
      </div>
      <div style={styles.rowCap} />
    </li>
  );
}

// ---------------------------------------------------------------------------
// PushbackClearanceStack — thin wrapper over DS Buttons with sequential-
// arming presentation: 4 × 44px steps (24px disc, progressive 2px
// connectors, right caps 'DONE' / the single BRAND-tinted ARM button /
// 40%-opacity lock with aria-disabled + aria-describedby hint) and a 44px
// confirm row disabled until all four steps are done. Arming logic is
// computed by the state owner, not here.
// ---------------------------------------------------------------------------

interface PushbackClearanceStackProps {
  ident: string;
  steps: Array<{id: string; label: string; state: 'done' | 'armed' | 'locked'}>;
  eobtDeltaMin: number;
  confirmed: boolean;
  onConfirm: (stepId: string) => void;
  onConfirmPushback: () => void;
}

function PushbackClearanceStack({
  ident,
  steps,
  eobtDeltaMin,
  confirmed,
  onConfirm,
  onConfirmPushback,
}: PushbackClearanceStackProps) {
  const allDone = steps.every(s => s.state === 'done');
  const hintId = 'rtc-clearance-hint';
  return (
    <div style={styles.clearance}>
      <div style={styles.asideSectionHead}>
        <Heading level={3} style={{fontSize: 12, lineHeight: '14px'}}>
          Pushback clearance
        </Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {steps.filter(s => s.state === 'done').length} of {steps.length}
        </Text>
      </div>
      <span id={hintId} style={styles.srOnly}>
        Complete previous step to arm
      </span>
      {steps.map((s, index) => {
        const disc: CSSProperties =
          s.state === 'done'
            ? {backgroundColor: OK_SOFT, color: OK_TEXT}
            : s.state === 'armed'
              ? {border: \`2px solid \${BRAND_FILL}\`, color: BRAND_TEXT}
              : {
                  border: 'var(--border-width) solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                };
        return (
          <div key={s.id} style={styles.clearanceStep}>
            <span style={{...styles.stepDisc, ...disc}} aria-hidden>
              {s.state === 'done' ? (
                <svg width={12} height={12} viewBox="0 0 12 12" focusable="false">
                  <path
                    d="M2.5 6.5 L5 9 L9.5 3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            {index < steps.length - 1 ? (
              <span
                style={{
                  ...styles.stepConnector,
                  backgroundColor: s.state === 'done' ? BRAND_FILL : 'var(--color-border)',
                }}
                aria-hidden
              />
            ) : null}
            <span style={{minWidth: 0}}>
              <span style={{...styles.stepLabel, display: 'block'}}>{s.label}</span>
              {s.id === 'tug' && eobtDeltaMin > 0 ? (
                <span style={{...styles.stepCaption, display: 'block'}}>
                  Pushing back {signed(eobtDeltaMin)} vs schedule
                </span>
              ) : null}
            </span>
            <span style={styles.stepCap}>
              {s.state === 'done' ? (
                <span style={styles.stepDone}>DONE</span>
              ) : s.state === 'armed' ? (
                // BRAND-tinted ARM — the only tabbable action in the tail.
                <Button
                  label="ARM"
                  variant="secondary"
                  size="sm"
                  style={{color: BRAND_TEXT}}
                  onClick={() => onConfirm(s.id)}
                />
              ) : (
                <span
                  aria-disabled="true"
                  aria-describedby={hintId}
                  aria-label={\`\${s.label} locked\`}
                  style={{opacity: 0.4, display: 'inline-flex'}}>
                  <Icon icon={LockIcon} size="sm" color="secondary" />
                </span>
              )}
            </span>
          </div>
        );
      })}
      <div style={styles.confirmRow}>
        {confirmed ? (
          <Token size="md" color="green" label={\`Pushback confirmed · \${ident}\`} />
        ) : (
          <Button
            label={\`Confirm pushback — \${ident}\`}
            variant="primary"
            size="sm"
            isDisabled={!allDone}
            style={{flex: 1}}
            onClick={onConfirmPushback}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FLIGHT ASIDE — 48px header (flight ident + EOBT chip), scrollable middle
// (milestone log then GSE roster, 36px rows), pinned clearance stack. The
// same content renders as the fixed 400px column (>= 1080px container) or
// as the right-edge overlay panel below that.
// ---------------------------------------------------------------------------

const LOG_TAG_COLOR = (tag: string): string =>
  tag === 'DELAY ATTR' ? WARN_TEXT : 'var(--color-text-secondary)';

interface FlightAsideProps {
  flight: Flight;
  log: LogRow[];
  isOverlay: boolean;
  onClose: () => void;
  onToggleGse: (flightId: FlightId, gseId: string) => void;
  onArmStep: (flightId: FlightId, stepId: string) => void;
  onConfirmPushback: (flightId: FlightId) => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}

function FlightAside({
  flight,
  log,
  isOverlay,
  onClose,
  onToggleGse,
  onArmStep,
  onConfirmPushback,
  closeButtonRef,
}: FlightAsideProps) {
  const rows = log.filter(r => r.flightId === flight.id);
  const onStand = flight.gse.filter(g => g.state === 'occupied').length;
  const firstOpen = flight.clearance.findIndex(s => !s.done);
  const steps = flight.clearance.map((s, i) => ({
    id: s.id,
    label: s.label,
    state: s.done ? ('done' as const) : i === firstOpen ? ('armed' as const) : ('locked' as const),
  }));
  return (
    <aside
      style={{...styles.aside, ...(isOverlay ? styles.asideOverlay : undefined)}}
      aria-label={\`Flight \${flight.ident} turnaround detail\`}
      onKeyDown={
        isOverlay
          ? e => {
              // Escape layering: the overlay is the only layer above the
              // board; Escape closes it and focus restores to the row.
              if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
              }
            }
          : undefined
      }>
      <div style={styles.asideHeader}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Heading level={2} style={{fontSize: 13, lineHeight: '15px'}}>
              {flight.ident} · {flight.standCode}
            </Heading>
            <EobtChip deltaMin={flight.eobtDeltaMin} wide />
          </HStack>
          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
            {flight.airline} · {flight.aircraft} · EOBT {flight.scheduledEobtLabel}
          </Text>
        </VStack>
        <StackItem size="fill">
          <span />
        </StackItem>
        {isOverlay ? (
          <IconButton
            ref={closeButtonRef}
            label={\`Close \${flight.ident} detail\`}
            icon={<Icon icon={XIcon} size="sm" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        ) : null}
      </div>
      <div style={styles.asideScroll}>
        <div style={styles.asideSectionHead}>
          <Heading level={3} style={{fontSize: 12, lineHeight: '14px'}}>
            Milestone log
          </Heading>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {rows.length} entries
          </Text>
        </div>
        <div role="list" aria-label={\`Milestone log, \${flight.ident}\`}>
          {rows.map(r => (
            <div
              key={r.id}
              role="listitem"
              style={styles.logRow}
              title={\`\${r.timeLabel} — \${r.tag} — \${r.text}\`}>
              <span style={styles.logTime}>{r.timeLabel}</span>
              <span style={{...styles.logTag, color: LOG_TAG_COLOR(r.tag)}}>{r.tag}</span>
              <span style={styles.logText}>{r.text}</span>
            </div>
          ))}
        </div>
        <div style={styles.asideSectionHead}>
          <Heading level={3} style={{fontSize: 12, lineHeight: '14px'}}>
            GSE roster
          </Heading>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {onStand} of {flight.gse.length} on stand
          </Text>
        </div>
        <div style={styles.gseWrap}>
          {flight.gse.map(g => (
            <GSEAssignmentChip
              key={g.id}
              assignment={g}
              onToggle={gseId => onToggleGse(flight.id, gseId)}
            />
          ))}
        </div>
      </div>
      <PushbackClearanceStack
        ident={flight.ident}
        steps={steps}
        eobtDeltaMin={flight.eobtDeltaMin}
        confirmed={flight.pushbackConfirmed}
        onConfirm={stepId => onArmStep(flight.id, stepId)}
        onConfirmPushback={() => onConfirmPushback(flight.id)}
      />
    </aside>
  );
}

// ---------------------------------------------------------------------------
// STATE OWNER — App holds ops = {flights, selectedId, log, announcement}
// with ONE mutation path update(id, patch). Every surface calls it; every
// mutation has an observable consequence elsewhere (bars slide, chips flip,
// log rows land, footer counts re-derive, the live region announces).
// ---------------------------------------------------------------------------

interface FlightPatch {
  select?: true;
  fuelDeltaMin?: number;
  gseId?: string;
  armStepId?: string;
  confirmPushback?: true;
}

export default function RampTurnaroundConsoleTemplate() {
  // Responsive bands key off the MEASURED view-root width; viewport queries
  // exist only as the width-0 first-frame fallback (see hook comment).
  const viewRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(viewRef);
  const isViewportNoAside = useMediaQuery('(max-width: 1079px)');
  const isViewportNarrowRail = useMediaQuery('(max-width: 899px)');
  const isViewportTiny = useMediaQuery('(max-width: 719px)');
  const hasAside = containerWidth > 0 ? containerWidth >= 1080 : !isViewportNoAside;
  const isRailNarrow = containerWidth > 0 ? containerWidth < 900 : isViewportNarrowRail;
  const isTiny = containerWidth > 0 ? containerWidth < 720 : isViewportTiny;
  const railWidth = isRailNarrow ? 96 : 148;
  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  // pxPerMin = measured ruler-timeline width / 90 (rows share the exact
  // rail/cap geometry, so the ruler measurement is THE horizontal scale).
  const rulerTimelineRef = useRef<HTMLDivElement | null>(null);
  const timelineWidth = useElementWidth(rulerTimelineRef);
  const pxPerMin = timelineWidth > 0 ? timelineWidth / WINDOW_MIN : 0;

  const [ops, setOps] = useState<OpsState>(INITIAL_OPS);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const rowButtonRefs = useRef<Partial<Record<FlightId, HTMLButtonElement | null>>>({});
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const logIdRef = useRef(0);

  const update = useCallback((flightId: FlightId, patch: FlightPatch) => {
    setOps(prev => {
      const flight = prev.flights[flightId];
      if (flight == null) {
        return prev;
      }
      let nextFlight = flight;
      let log = prev.log;
      let announcement = prev.announcement;
      const selectedId = patch.select ? flightId : prev.selectedId;
      const appendLog = (tag: string, text: string, timeLabel: string = zulu(NOW_MIN)) => {
        logIdRef.current += 1;
        log = [logRow(\`l-dyn-\${logIdRef.current}\`, flightId, timeLabel, tag, text), ...log];
      };

      if (patch.fuelDeltaMin != null && patch.fuelDeltaMin !== 0) {
        const fuel = flight.milestones.find(m => m.id === 'fuel');
        if (fuel != null) {
          const min = fuel.minDurMin ?? 15;
          const max = fuel.maxDurMin ?? 60;
          const requested = fuel.durMin + patch.fuelDeltaMin;
          const clamped = Math.min(max, Math.max(min, requested));
          if (requested < min) {
            announcement = \`Fueling duration at minimum, \${min} minutes\`;
          } else if (requested > max) {
            announcement = \`Fueling duration at maximum, \${max} minutes\`;
          }
          if (clamped !== fuel.durMin) {
            nextFlight = solveFlight({
              ...flight,
              milestones: flight.milestones.map(m =>
                m.id === 'fuel' ? {...m, durMin: clamped} : m,
              ),
            });
            if (nextFlight.eobtDeltaMin !== flight.eobtDeltaMin) {
              // Delay attribution — the spec-scripted +10 drag on VA 218
              // produces exactly: '14:32Z — DELAY ATTR — Fueling +10 min;
              // 4 min slack absorbed; EOBT +6.'
              const growth = clamped - BASE_FUEL_DUR[flightId];
              const delta = nextFlight.eobtDeltaMin;
              const slackAbsorbed = growth - Math.max(0, delta);
              appendLog(
                'DELAY ATTR',
                delta > 0
                  ? \`Fueling \${signed(growth)} min; \${slackAbsorbed} min slack absorbed; EOBT \${signed(delta)}.\`
                  : \`Fueling \${signed(growth)} min; absorbed in slack; EOBT on time.\`,
                flight.scheduledEobtLabel,
              );
              announcement = \`\${flight.ident} EOBT \${
                delta > 0 ? \`plus \${delta} minutes\` : 'on time'
              }\${delta > 0 && nextFlight.criticalIds.includes('fuel') ? ', fueling on critical path' : ''}\`;
            }
          }
        }
      }

      if (patch.gseId != null) {
        const chip = nextFlight.gse.find(g => g.id === patch.gseId);
        if (chip != null) {
          const nextState: GseState = chip.state === 'occupied' ? 'staged' : 'occupied';
          nextFlight = {
            ...nextFlight,
            gse: nextFlight.gse.map(g =>
              g.id === patch.gseId ? {...g, state: nextState} : g,
            ),
          };
          appendLog(
            'GSE',
            \`\${chip.code} \${nextState === 'occupied' ? 'on stand' : 'released to staging'}; operator \${chip.operator}.\`,
          );
        }
      }

      if (patch.armStepId != null) {
        const stepToArm = nextFlight.clearance.find(s => s.id === patch.armStepId);
        if (stepToArm != null && !stepToArm.done) {
          nextFlight = {
            ...nextFlight,
            clearance: nextFlight.clearance.map(s =>
              s.id === patch.armStepId ? {...s, done: true} : s,
            ),
          };
          appendLog('CLEARANCE', \`\${stepToArm.label} confirmed by \${COORDINATOR.name}.\`);
        }
      }

      if (patch.confirmPushback && !nextFlight.pushbackConfirmed) {
        nextFlight = {...nextFlight, pushbackConfirmed: true};
        appendLog(
          'PUSHBACK',
          \`Clearance issued by \${COORDINATOR.name}; tug cleared to push\${
            nextFlight.eobtDeltaMin > 0
              ? \` \${signed(nextFlight.eobtDeltaMin)} vs schedule\`
              : ' on schedule'
          }.\`,
        );
        announcement = \`\${nextFlight.ident} pushback clearance confirmed\`;
      }

      return {
        flights: {...prev.flights, [flightId]: nextFlight},
        selectedId,
        log,
        announcement,
      };
    });
  }, []);

  const selectFlight = useCallback(
    (flightId: FlightId) => {
      update(flightId, {select: true});
      if (!hasAside) {
        setSheetOpen(true);
      }
      rowButtonRefs.current[flightId]?.scrollIntoView({
        block: 'nearest',
        behavior: isMotionReduced ? 'auto' : 'smooth',
      });
    },
    [update, hasAside, isMotionReduced],
  );

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    // Focus restores to the selected flight's row button on the close path.
    setOps(prev => {
      rowButtonRefs.current[prev.selectedId]?.focus();
      return prev;
    });
  }, []);

  // Overlay open → move focus into the panel (its close button).
  const isOverlayVisible = !hasAside && isSheetOpen;
  useEffect(() => {
    if (isOverlayVisible) {
      closeButtonRef.current?.focus();
    }
  }, [isOverlayVisible]);

  const selected = ops.flights[ops.selectedId];
  const flightList = Object.values(ops.flights);
  // Footer aggregates cross-check the fixtures: 6 stands · 4 active
  // turnarounds (BX 452 is inbound) · critical watch = flights past EOBT.
  const activeCount = flightList.filter(f => f.phase === 'active').length;
  const criticalWatch = flightList.filter(f => f.eobtDeltaMin > 0).length;

  const asidePane = (
    <FlightAside
      flight={selected}
      log={ops.log}
      isOverlay={!hasAside}
      onClose={closeSheet}
      onToggleGse={(flightId, gseId) => update(flightId, {gseId})}
      onArmStep={(flightId, armStepId) => update(flightId, {armStepId})}
      onConfirmPushback={flightId => update(flightId, {confirmPushback: true})}
      closeButtonRef={closeButtonRef}
    />
  );

  return (
    <div style={styles.root}>
      <style>{CONSOLE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div ref={viewRef} style={styles.viewRoot}>
              <div style={styles.main}>
                <span style={styles.srOnly}>
                  <Heading level={1}>Chockline Ramp Turnaround Console</Heading>
                </span>
                {/* 48px header bar — top-left brand corner, top-right the
                    EOBT consequence chip + frozen clock + coordinator. */}
                <header style={styles.header}>
                  <div style={styles.brandCluster}>
                    <ChocklineMark />
                    {!isTiny ? (
                      <>
                        <span style={styles.wordmark}>Chockline</span>
                        <Text type="supporting" size="xsm" color="secondary">
                          Ramp Turnaround
                        </Text>
                      </>
                    ) : null}
                  </div>
                  <div style={styles.headerRight}>
                    <EobtChip deltaMin={selected.eobtDeltaMin} wide />
                    <span style={styles.clock}>T0 13:40Z</span>
                    <Tooltip content={\`\${COORDINATOR.name} · Ramp coordinator\`}>
                      <span style={{display: 'inline-flex'}}>
                        <Avatar name={COORDINATOR.name} size={24} />
                      </span>
                    </Tooltip>
                  </div>
                </header>
                {/* 40px stand strip — chips select + scroll the row into view. */}
                <div
                  style={{
                    ...styles.standStrip,
                    ...(isTiny ? styles.standStripScroll : undefined),
                  }}
                  role="toolbar"
                  aria-label="Stands">
                  {STANDS.map(stand => (
                    <StandStripChip
                      key={stand.id}
                      stand={stand}
                      selected={stand.flightId != null && stand.flightId === ops.selectedId}
                      onSelect={selectFlight}
                    />
                  ))}
                  <span style={{flex: 1}} aria-hidden />
                  {!isTiny ? (
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      Window T0 → T0+90
                    </Text>
                  ) : null}
                </div>
                {/* 24px time ruler — also the pxPerMin measurement source. */}
                <TimeRuler
                  pxPerMin={pxPerMin}
                  labelEveryMin={isRailNarrow ? 30 : 15}
                  railWidth={railWidth}
                  timelineRef={rulerTimelineRef}
                />
                {/* Scrollable stand list — one 56px gantt row per stand. */}
                <ul style={styles.standList} aria-label="Stand board">
                  {STANDS.map(stand => {
                    if (stand.flightId == null) {
                      return (
                        <EmptyStandRow
                          key={stand.id}
                          stand={stand}
                          railWidth={railWidth}
                          pxPerMin={pxPerMin}
                        />
                      );
                    }
                    const flight = ops.flights[stand.flightId];
                    return (
                      <TurnaroundGanttRow
                        key={stand.id}
                        flight={flight}
                        pxPerMin={pxPerMin}
                        selected={stand.flightId === ops.selectedId}
                        criticalIds={flight.criticalIds}
                        railWidth={railWidth}
                        showAircraftLine={!isRailNarrow}
                        showBarLabels={!isTiny}
                        onSelect={selectFlight}
                        onFuelDelta={(flightId, fuelDeltaMin) =>
                          update(flightId, {fuelDeltaMin})
                        }
                        rowButtonRef={el => {
                          rowButtonRefs.current[flight.id] = el;
                        }}
                      />
                    );
                  })}
                </ul>
                {/* 28px footer strip — bottom-left aggregate corner. */}
                <footer style={styles.footer}>
                  <span style={{fontVariantNumeric: 'tabular-nums'}}>
                    {STANDS.length} stands · {activeCount} active turnarounds ·{' '}
                    {criticalWatch} on critical watch
                  </span>
                  <span style={{flex: 1}} aria-hidden />
                  {!isTiny ? (
                    <span style={{fontVariantNumeric: 'tabular-nums'}}>
                      Ops picture frozen at T0+22 · {zulu(NOW_MIN)}
                    </span>
                  ) : null}
                </footer>
                {isOverlayVisible ? asidePane : null}
              </div>
              {hasAside ? asidePane : null}
            </div>
            {/* Single polite live region: EOBT changes and drag clamps. */}
            <div aria-live="polite" style={styles.srOnly}>
              {ops.announcement}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};