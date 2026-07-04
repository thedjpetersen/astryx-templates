var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Marquee Row Edition 14 (Jun 11–14):
 *   5 venues with seat counts, an explicit print-courier TRANSIT_MIN
 *   matrix, 13 films with dual runtime fields (127 + '2h 07m'), per-day
 *   guest on-site windows (arriveMin/departMin + label duals), and 27
 *   screenings (24 slotted across 4 days + 3 unslotted in the tray). No
 *   clocks, no randomness, no network media — every relative string is
 *   pre-computed against the festival's fixed dates.
 * @output Festival Screening Grid — a five-venue film-festival programming
 *   board where scheduling constraints ARE geometry: screening blocks
 *   whose width is runtime (1.6px/min), hatched intro/Q&A buffer
 *   extensions, premiere-tier corner flags, an SVG print-traffic thread
 *   layer between duplicate 35mm screenings that flips red (dashed +
 *   label chip) when the print cannot travel in time, per-lane
 *   guest-availability ribbons with red break hatching where a Q&A
 *   overruns the director's departure, a live health checklist in the
 *   film-detail aside, and an unslotted-films tray. Drag / arrow-key
 *   moves re-run the constraint engine: threads re-route, ribbons gain
 *   or lose breaks, day-tab and header conflict chips re-count, the
 *   checklist rewrites, and Publish enables at zero conflicts.
 * @position Page template; emitted by \`astryx template festival-screening-grid\`
 *
 * Frame: root 100dvh div > Layout height="fill" > content-only view root.
 *   46px header bar | 40px day-tab row | main row (board column with 28px
 *   sticky time ruler + five 140px lanes and a 120px sticky lane rail +
 *   380px film-detail aside) | 56px unslotted tray docked bottom.
 * Container policy: app-shell archetype — frame rows, rails, and one
 *   working aside; no Cards. Blocks, ribbons, and threads are custom
 *   geometry on the board surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (#7A2E8F as a light-dark pair) used for the MarqueeMark middle stub
 *   and the header accent underline. Thread/ribbon/conflict colors ride
 *   the data-categorical tokens with repo-standard light-dark fallbacks;
 *   premiere flag fills (gold/teal/slate) are fills only, never text.
 *
 * Density grid (FIXED NUMBERS): 46px header bar; 40px day-tab row; 28px
 * time ruler; 140px venue lanes split 8px pad / 104px block track / 8px
 * gap / 14px GuestAvailabilityRibbon / 6px pad; 120px lane-label rail;
 * timeline scale 96px per hour = 24px per 15-min gridline (1.6px/min),
 * board spans 10:00–24:00 = 14h = 1344px scroll width; 380px film-detail
 * aside; 36px aside list rows; 44px heavy rows (aside slot-at-10 venue
 * rows); 56px unslotted-films tray with 36px chips; 12px gutter token
 * everywhere (GUTTER = 12).
 *
 * Responsive contract — CONTAINER width via useElementWidth on the view
 * root (the demo stage is ~1045–1075px inside a 1440px window, so
 * viewport queries are wrong by construction; a viewport query covers
 * only the first pre-observer frame). Subtraction, never reflow:
 * - >= 1000px: full layout (board + 380px aside + tray).
 * - < 1000px: aside removed; selecting a block opens the detail in a DS
 *   Dialog pinned to the right edge instead.
 * - < 880px: lane-label rail narrows 120px→64px using venue code duals
 *   (PAL/ORP/CAS/ANX/ROOF); GuestAvailabilityRibbon hides (its
 *   violations still counted in every conflict chip).
 * - < 720px: tray collapses to a 40px count-only bar ('3 unslotted —
 *   open list' button → DS Popover list).
 * Timeline scale never changes; the board scrolls horizontally at every
 * band.
 *
 * Corner map — Top-left: MarqueeMark + wordmark + edition caption.
 * Top-right: total-conflicts chip + Publish button (disabled while
 * conflicts > 0, tooltip explains why). Bottom-left: tray label
 * 'Unslotted — 3 films'. Bottom-right: thread legend (green print ok /
 * amber tight <30m margin / red infeasible) pinned at the tray's right
 * edge. Floating chrome never collides.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {
  CalendarCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  ListIcon,
  MegaphoneIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// THE quarantined brand literal — Marquee Row purple. Used as a runtime value
// for the mark's middle ticket stub and the header accent underline only;
// it is a FILL in both places, so it carries no text-contrast duty.
const BRAND = 'light-dark(#7A2E8F, #C77BD9)';

// Thread / conflict traffic. OK_GREEN and RISK_RED as text sit on the page
// background only in 11px checklist metrics next to an icon shape; both
// fallbacks pass 4.5:1 (#0B7F1B on #fff = 5.0:1, #F2655A on #101010 = 5.3:1).
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B7F1B, #34C759))';
const WARN_AMBER = 'var(--color-data-categorical-orange, light-dark(#B45309, #FB923C))';
const RISK_RED = 'var(--color-data-categorical-red, light-dark(#D92D20, #F2655A))';
const RED_SOFT = 'light-dark(rgba(217, 45, 32, 0.10), rgba(242, 101, 90, 0.18))';

// Ribbon washes derive from the same green/red so the ribbon and threads
// speak one traffic vocabulary. 22% / 10% per spec.
const RIBBON_FILL = \`color-mix(in srgb, \${OK_GREEN} 22%, transparent)\`;
const RIBBON_FAINT = \`color-mix(in srgb, \${OK_GREEN} 10%, transparent)\`;
const BREAK_HATCH = \`repeating-linear-gradient(45deg, \${RISK_RED} 0 4px, transparent 4px 8px)\`;

// Premiere flag fills — fills only (16px triangles), never text.
const FLAG_GOLD = 'var(--color-data-categorical-yellow, light-dark(#B78103, #EAB308))';
const FLAG_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const FLAG_SLATE = 'light-dark(#64748B, #94A3B8)';

// Intro/Q&A buffer hatching — 45deg 4px stripes at 40% strength of the
// secondary text token (spec: 40% opacity).
const BUFFER_STRIPE = 'color-mix(in srgb, var(--color-text-secondary) 40%, transparent)';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// GEOMETRY CONSTANTS — the density grid, verbatim
// ---------------------------------------------------------------------------

const GUTTER = 12; // the single gutter token; halves are GUTTER / 2 = 6
const PX_PER_MIN = 1.6; // 96px/hour, 24px per 15-min gridline
const BOARD_START_MIN = 600; // 10:00
const BOARD_END_MIN = 1440; // 24:00
const BOARD_W = (BOARD_END_MIN - BOARD_START_MIN) * PX_PER_MIN; // 1344
const LANE_H = 140; // 8 pad / 104 track / 8 gap / 14 ribbon / 6 pad
const BLOCK_TOP = 8;
const BLOCK_H = 104;
const RIBBON_TOP = 8 + 104 + 8; // 120
const RIBBON_H = 14;
const RULER_H = 28;
const RAIL_W = 120;
const RAIL_W_NARROW = 64;
const HEADER_H = 46;
const TABROW_H = 40;
const TRAY_H = 56;
const TRAY_H_COLLAPSED = 40;
const ASIDE_W = 380;
const GLYPH_ONLY_MAX_W = 72; // blocks <= 72px core width (<= 45min) collapse

const minToX = (min: number): number => (min - BOARD_START_MIN) * PX_PER_MIN;

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the reduced-motion guard. Transitions animate
// transform/opacity/color only; under prefers-reduced-motion everything is
// instant (drag ghosts already move via untransitioned transforms).
// ---------------------------------------------------------------------------

const GRID_CSS = \`
.fsg-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.fsg-block:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
.fsg-block {
  transition: box-shadow 150ms ease, opacity 150ms ease;
}
.fsg-chipbtn {
  transition: color 150ms ease, opacity 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .fsg-block { transition: none; }
  .fsg-chipbtn { transition: none; }
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
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  // 46px header bar — corners: mark+wordmark left, conflicts+Publish right.
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: HEADER_H,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  wordmarkWrap: {display: 'flex', alignItems: 'center', gap: GUTTER / 2, minWidth: 0},
  // Header accent underline — the second (and last) BRAND usage.
  wordmark: {
    borderBottom: \`2px solid \${BRAND}\`,
    paddingBottom: 1,
    whiteSpace: 'nowrap',
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
  // 40px day-tab row.
  tabRow: {
    display: 'flex',
    alignItems: 'center',
    height: TABROW_H,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  dayChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 8,
    backgroundColor: RISK_RED,
    color: '#FFFFFF', // white on the red fill: 4.6:1 light / 3.9:1 on the
    // lighter dark-fill, paired with the count glyph shape + aria text.
    fontSize: 10,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  // Main row: board column + aside.
  mainRow: {flex: 1, minHeight: 0, display: 'flex'},
  boardCol: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  boardScroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    position: 'relative',
  },
  boardInner: {position: 'relative'},
  // 28px sticky ruler row; the corner cell is sticky on both axes.
  rulerRow: {
    display: 'flex',
    position: 'sticky',
    top: 0,
    zIndex: 5,
    height: RULER_H,
    backgroundColor: 'var(--color-background)',
  },
  rulerCorner: {
    position: 'sticky',
    left: 0,
    zIndex: 6,
    flexShrink: 0,
    height: RULER_H,
    backgroundColor: 'var(--color-background)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    borderRight: 'var(--border-width) solid var(--color-border)',
  },
  ruler: {
    position: 'relative',
    width: BOARD_W,
    height: RULER_H,
    flexShrink: 0,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  rulerLabel: {
    position: 'absolute',
    top: 7,
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  rulerTick: {
    position: 'absolute',
    top: 20,
    width: 1,
    height: 8,
    backgroundColor: 'var(--color-border)',
  },
  laneRow: {display: 'flex', height: LANE_H},
  laneLabel: {
    position: 'sticky',
    left: 0,
    zIndex: 4,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: GUTTER,
    backgroundColor: 'var(--color-background)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Lane track: 15-min gridlines every 24px, heavier hour line every 96px,
  // shared by all lanes (the "extended down through all lanes" gradient).
  laneTrack: {
    position: 'relative',
    width: BOARD_W,
    height: LANE_H,
    flexShrink: 0,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundImage:
      'repeating-linear-gradient(to right, color-mix(in srgb, var(--color-border) 55%, transparent) 0 1px, transparent 1px 24px),' +
      ' repeating-linear-gradient(to right, var(--color-border) 0 1px, transparent 1px 96px)',
  },
  emptyLaneHint: {
    position: 'absolute',
    top: BLOCK_TOP + 38,
    left: 24,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    padding: \`4px \${GUTTER}px\`,
    borderRadius: 'var(--radius-container)',
    border: '1px dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  threadSvg: {
    position: 'absolute',
    top: 0,
    pointerEvents: 'none',
    zIndex: 3,
    overflow: 'visible',
  },
  // ScreeningBlock ---------------------------------------------------------
  block: {
    position: 'absolute',
    top: BLOCK_TOP,
    height: BLOCK_H,
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none',
    boxSizing: 'border-box',
  },
  blockBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: 8,
    height: '100%',
    minWidth: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '16px',
    color: 'var(--color-text)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  blockMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    lineHeight: '14px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // Meta text spans are flex items: without their own overflow+ellipsis the
  // container flat-cuts the last item mid-glyph ("220 seat|") at narrow
  // block widths.
  blockMetaText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  blockGlyphOnly: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  // Buffer extensions: hatched, dashed border, 40% stripes.
  bufferZone: {
    position: 'absolute',
    top: 0,
    height: BLOCK_H,
    border: '1px dashed var(--color-border)',
    backgroundImage: \`repeating-linear-gradient(45deg, \${BUFFER_STRIPE} 0 4px, transparent 4px 8px)\`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  // DCP format glyph — 9px mono chip, 16px tall.
  dcpChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 16,
    paddingInline: 3,
    borderRadius: 3,
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 9,
    lineHeight: 1,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  flagButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    lineHeight: 0,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  // GuestAvailabilityRibbon --------------------------------------------------
  ribbon: {
    position: 'absolute',
    top: RIBBON_TOP,
    left: 0,
    width: BOARD_W,
    height: RIBBON_H,
  },
  ribbonSegment: {
    position: 'absolute',
    top: 0,
    height: RIBBON_H,
    borderRadius: 3,
    backgroundColor: RIBBON_FILL,
    borderLeft: \`1px solid \${OK_GREEN}\`,
    borderRight: \`1px solid \${OK_GREEN}\`,
    boxSizing: 'border-box',
  },
  ribbonBreak: {
    position: 'absolute',
    top: 0,
    height: RIBBON_H,
    backgroundImage: BREAK_HATCH,
    borderRadius: 2,
  },
  // Aside ------------------------------------------------------------------
  aside: {
    width: ASIDE_W,
    flexShrink: 0,
    minHeight: 0,
    overflowY: 'auto',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  asideBody: {flex: 1, padding: GUTTER, display: 'flex', flexDirection: 'column', gap: GUTTER},
  asideRow: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    height: 36, // 36px aside list rows
    minWidth: 0,
  },
  // 44px heavy rows — the per-venue "Slot at 10:00" rows for unslotted films.
  slotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 44,
    minWidth: 0,
  },
  checkIcon: {flexShrink: 0, display: 'inline-flex'},
  checkMetric: {
    marginLeft: 'auto',
    fontFamily: MONO,
    fontSize: 11,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  asideFooter: {
    padding: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  // Tray ---------------------------------------------------------------------
  tray: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: TRAY_H,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  trayCollapsed: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: TRAY_H_COLLAPSED,
    flexShrink: 0,
    paddingInline: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  trayDropActive: {
    boxShadow: \`inset 0 0 0 2px \${OK_GREEN}\`,
  },
  trayChips: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    overflowX: 'auto',
  },
  trayChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 36, // 36px chips in the 56px tray
    paddingInline: GUTTER - 2,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    font: 'inherit',
    color: 'var(--color-text)',
  },
  trayChipSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  trayChipTitle: {
    maxWidth: 220, // long-title tray stress: F_LANTERN must ellipsize here
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 12,
    fontWeight: 600,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER / 2,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  legendChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 18,
    paddingInline: 6,
    borderRadius: 9,
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  legendSwatch: {width: 10, height: 3, borderRadius: 2, flexShrink: 0},
  popList: {
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER / 2,
    padding: GUTTER / 2,
    maxWidth: 320,
  },
};

// ---------------------------------------------------------------------------
// DATA — Marquee Row, Edition 14, Jun 11–14. Deterministic BY LAW: no
// Date.now(), no Math.random(), no network assets. Every label is a
// pre-computed dual of its minute field; fmtClock/fmtDur exist only because
// drag/arrow moves rewrite startMin at runtime (pure, clock-free math).
// ---------------------------------------------------------------------------

type VenueId = 'V_PALACE' | 'V_ORPHEUM' | 'V_CASCADE' | 'V_ANNEX' | 'V_ROOFTOP';
type DayId = 'D1' | 'D2' | 'D3' | 'D4';
type Format = 'dcp' | '35mm';
type PremiereTier = 'world' | 'international' | 'regional';
type ConflictKind = 'print' | 'guest' | 'capacity';

interface Venue {
  id: VenueId;
  name: string;
  code: string; // < 880px rail dual: PAL / ORP / CAS / ANX / ROOF
  seats: number;
}

// 5 lanes, top → bottom.
const VENUES: Venue[] = [
  {id: 'V_PALACE', name: 'The Palace', code: 'PAL', seats: 890},
  {id: 'V_ORPHEUM', name: 'Orpheum', code: 'ORP', seats: 612},
  {id: 'V_CASCADE', name: 'Cascade Twin A', code: 'CAS', seats: 348},
  {id: 'V_ANNEX', name: 'Guild Annex', code: 'ANX', seats: 220},
  {id: 'V_ROOFTOP', name: 'Rooftop Deck', code: 'ROOF', seats: 150},
];
const VENUE_BY_ID = new Map(VENUES.map(v => [v.id, v]));
const LANE_INDEX = new Map(VENUES.map((v, i) => [v.id, i]));

// Print-courier transit minutes, dock to dock — symmetric, filled explicitly.
const TRANSIT_MIN: Record<VenueId, Partial<Record<VenueId, number>>> = {
  V_PALACE: {V_ORPHEUM: 60, V_CASCADE: 90, V_ANNEX: 120, V_ROOFTOP: 180},
  V_ORPHEUM: {V_PALACE: 60, V_CASCADE: 60, V_ANNEX: 120, V_ROOFTOP: 150},
  V_CASCADE: {V_PALACE: 90, V_ORPHEUM: 60, V_ANNEX: 120, V_ROOFTOP: 150},
  V_ANNEX: {V_PALACE: 120, V_ORPHEUM: 120, V_CASCADE: 120, V_ROOFTOP: 120},
  V_ROOFTOP: {V_PALACE: 180, V_ORPHEUM: 150, V_CASCADE: 150, V_ANNEX: 120},
};

const transitBetween = (a: VenueId, b: VenueId): number =>
  a === b ? 0 : TRANSIT_MIN[a][b] ?? 150;

interface FestivalDay {
  id: DayId;
  num: number;
  label: string;
}

const DAYS: FestivalDay[] = [
  {id: 'D1', num: 1, label: 'Thu Jun 11'},
  {id: 'D2', num: 2, label: 'Fri Jun 12'},
  {id: 'D3', num: 3, label: 'Sat Jun 13'},
  {id: 'D4', num: 4, label: 'Sun Jun 14'},
];
const DAY_ORDER: Record<DayId, number> = {D1: 0, D2: 1, D3: 2, D4: 3};

interface Film {
  id: string;
  title: string;
  director: string;
  runtimeMin: number;
  runtimeLabel: string; // dual of runtimeMin
  format: Format;
  printId?: string; // 35mm only
  country: string;
}

// F_COASTLINE's 67-char title exercises the block 2-line ellipsis AND the
// 220px tray-adjacent aside header; F_EMBER at 45min (72px core) is the
// glyph-only collapse specimen; F_LANTERN's 45-char title is the tray-chip
// ellipsis specimen.
const FILMS: Record<string, Film> = {
  F_SALTWIND: {
    id: 'F_SALTWIND',
    title: 'Saltwind Cathedral',
    director: 'Ilona Vasquez-Brandt',
    runtimeMin: 127,
    runtimeLabel: '2h 07m',
    format: '35mm',
    printId: 'PT-3517',
    country: 'Chile',
  },
  F_HOLLOW: {
    id: 'F_HOLLOW',
    title: 'The Hollow Crown of Prague',
    director: 'Anton Hallberg',
    runtimeMin: 112,
    runtimeLabel: '1h 52m',
    format: '35mm',
    printId: 'PT-2091',
    country: 'Czech Republic',
  },
  F_MOTH: {
    id: 'F_MOTH',
    title: 'Moth Season',
    director: 'Suvi Aaltonen',
    runtimeMin: 94,
    runtimeLabel: '1h 34m',
    format: 'dcp',
    country: 'Finland',
  },
  F_COASTLINE: {
    id: 'F_COASTLINE',
    title: "The Unbearable Cartography of Vanishing Coastlines (Director's Assembly)",
    director: 'Tunde Okafor',
    runtimeMin: 163,
    runtimeLabel: '2h 43m',
    format: 'dcp',
    country: 'Nigeria',
  },
  F_EMBER: {
    id: 'F_EMBER',
    title: 'Ember Notation',
    director: 'Q. Reyes',
    runtimeMin: 45,
    runtimeLabel: '45m',
    format: 'dcp',
    country: 'Mexico',
  },
  F_GARNET: {
    id: 'F_GARNET',
    title: 'Garnet Static',
    director: 'Inès Duarte',
    runtimeMin: 108,
    runtimeLabel: '1h 48m',
    format: '35mm',
    printId: 'PT-4402',
    country: 'Portugal',
  },
  F_LUMEN: {
    id: 'F_LUMEN',
    title: 'Lumen Arcade',
    director: 'Priya Raman',
    runtimeMin: 121,
    runtimeLabel: '2h 01m',
    format: 'dcp',
    country: 'India',
  },
  F_PAPERSKY: {
    id: 'F_PAPERSKY',
    title: 'Paper Sky Republic',
    director: 'Dario Ceresole',
    runtimeMin: 99,
    runtimeLabel: '1h 39m',
    format: 'dcp',
    country: 'Italy',
  },
  F_NIGHTSOIL: {
    id: 'F_NIGHTSOIL',
    title: 'The Night Soil Choir',
    director: 'Wren Achebe',
    runtimeMin: 87,
    runtimeLabel: '1h 27m',
    format: 'dcp',
    country: 'Ghana',
  },
  F_HELIO: {
    id: 'F_HELIO',
    title: 'Heliograph',
    director: 'Maren Strand',
    runtimeMin: 134,
    runtimeLabel: '2h 14m',
    format: 'dcp',
    country: 'Norway',
  },
  F_TIDE: {
    id: 'F_TIDE',
    title: 'Tidewrack',
    director: 'Cass Idowu',
    runtimeMin: 76,
    runtimeLabel: '1h 16m',
    format: 'dcp',
    country: 'UK',
  },
  F_LANTERN: {
    id: 'F_LANTERN',
    title: "The Lantern Keeper's Almanac of Slow Weather",
    director: 'Yuki Onodera',
    runtimeMin: 141,
    runtimeLabel: '2h 21m',
    format: 'dcp',
    country: 'Japan',
  },
  F_VERSO: {
    id: 'F_VERSO',
    title: 'Verso',
    director: 'Elio Marchetti',
    runtimeMin: 58,
    runtimeLabel: '58m',
    format: '35mm',
    printId: 'PT-1108',
    country: 'Italy',
  },
};

interface GuestWindow {
  arriveMin: number;
  departMin: number;
  label: string; // dual of the pair
}

interface Guest {
  filmId: string;
  name: string;
  role: string;
  windows: Partial<Record<DayId, GuestWindow>>;
  onSiteLabel: string;
}

// Guests keyed by film. G_VASQUEZ departs Fri 9:00 PM (1260) — the baked-in
// ribbon break: SC_SALT_D2's Q&A runs 9:07–9:37 PM, 37m past departure.
const GUESTS: Record<string, Guest> = {
  F_SALTWIND: {
    filmId: 'F_SALTWIND',
    name: 'Ilona Vasquez-Brandt',
    role: 'Director',
    windows: {
      D1: {arriveMin: 840, departMin: 1440, label: 'Thu 2:00 PM – midnight'},
      D2: {arriveMin: 600, departMin: 1260, label: 'Fri 10:00 AM – 9:00 PM'},
    },
    onSiteLabel: 'on-site Thu 2:00 PM – Fri 9:00 PM',
  },
  F_HOLLOW: {
    filmId: 'F_HOLLOW',
    name: 'Anton Hallberg',
    role: 'Director',
    windows: {D2: {arriveMin: 600, departMin: 1320, label: 'Fri 10:00 AM – 10:00 PM'}},
    onSiteLabel: 'on-site Fri 10:00 AM – 10:00 PM',
  },
  F_COASTLINE: {
    filmId: 'F_COASTLINE',
    name: 'Tunde Okafor',
    role: 'Director',
    windows: {
      D2: {arriveMin: 780, departMin: 1440, label: 'Fri 1:00 PM – close'},
      D4: {arriveMin: 600, departMin: 1200, label: 'Sun 10:00 AM – 8:00 PM'},
    },
    onSiteLabel: 'on-site Fri 1:00 PM – Sun 8:00 PM',
  },
  F_GARNET: {
    filmId: 'F_GARNET',
    name: 'Inès Duarte',
    role: 'Director',
    windows: {D3: {arriveMin: 600, departMin: 1440, label: 'Sat 10:00 AM – close'}},
    onSiteLabel: 'on-site Sat 10:00 AM – close',
  },
  F_LUMEN: {
    filmId: 'F_LUMEN',
    name: 'Priya Raman',
    role: 'Director',
    windows: {
      D2: {arriveMin: 600, departMin: 1380, label: 'Fri 10:00 AM – 11:00 PM'},
      D3: {arriveMin: 600, departMin: 1380, label: 'Sat 10:00 AM – 11:00 PM'},
    },
    onSiteLabel: 'on-site Fri – Sat, 10:00 AM – 11:00 PM',
  },
  F_HELIO: {
    filmId: 'F_HELIO',
    name: 'Maren Strand',
    role: 'Director',
    windows: {
      D2: {arriveMin: 600, departMin: 1440, label: 'Fri 10:00 AM – close'},
      D4: {arriveMin: 600, departMin: 1440, label: 'Sun 10:00 AM – close'},
    },
    onSiteLabel: 'on-site Fri + Sun, all day',
  },
};

type ScreeningStatus = 'slotted' | 'unslotted';

interface Screening {
  id: string;
  filmId: string;
  venueId?: VenueId;
  dayId: DayId;
  startMin: number;
  startLabel: string; // dual of startMin (load-time value; moves re-derive)
  introMin: 0 | 10;
  qaMin: 0 | 20 | 30;
  status: ScreeningStatus;
  premiereTier?: PremiereTier;
  rsvpCount: number; // advance ticket requests for THIS screening
}

// 24 slotted + 3 unslotted. Aggregate cross-checks at load: D2 = 11
// screenings · 3 conflicts (1 print, 1 guest, 1 capacity); D3 = 1 print;
// D1/D4 = 0 → header total chip reads 4 = 2 print + 1 guest + 1 capacity.
// Cascade Twin A is D2's empty lane (spec named Rooftop, but Rooftop must
// host SC_HOLLOW_D2B to bake in the red print thread — see stress notes).
const SCREENINGS: Screening[] = [
  // --- D1 · Thu Jun 11 ------------------------------------------------------
  {
    id: 'SC_SALT_D1', // opening-night world premiere; selectedId at load
    filmId: 'F_SALTWIND',
    venueId: 'V_PALACE',
    dayId: 'D1',
    startMin: 1170,
    startLabel: '7:30 PM',
    introMin: 10,
    qaMin: 30,
    status: 'slotted',
    premiereTier: 'world',
    rsvpCount: 840,
  },
  {
    id: 'SC_MOTH_D1',
    filmId: 'F_MOTH',
    venueId: 'V_ORPHEUM',
    dayId: 'D1',
    startMin: 690,
    startLabel: '11:30 AM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    premiereTier: 'regional',
    rsvpCount: 300,
  },
  {
    id: 'SC_PAPERSKY_D1',
    filmId: 'F_PAPERSKY',
    venueId: 'V_CASCADE',
    dayId: 'D1',
    startMin: 900,
    startLabel: '3:00 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 210,
  },
  {
    id: 'SC_NIGHTSOIL_D1',
    filmId: 'F_NIGHTSOIL',
    venueId: 'V_ANNEX',
    dayId: 'D1',
    startMin: 1020,
    startLabel: '5:00 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 150,
  },
  {
    id: 'SC_EMBER_D1',
    filmId: 'F_EMBER',
    venueId: 'V_ROOFTOP',
    dayId: 'D1',
    startMin: 1290,
    startLabel: '9:30 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 140,
  },
  // --- D2 · Fri Jun 12 — 11 screenings, the loaded day ----------------------
  {
    id: 'SC_MOTH_D2',
    filmId: 'F_MOTH',
    venueId: 'V_PALACE',
    dayId: 'D2',
    startMin: 630,
    startLabel: '10:30 AM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 480,
  },
  {
    // Red print thread source: PT-2091 reels down (incl. Q&A) at 3:22 PM;
    // 'Print PT-2091 reels down at The Palace 3:22 PM; courier dock-to-dock
    // to Rooftop Deck is 3h 00m.' Gap to SC_HOLLOW_D2B is 2h 08m → red.
    id: 'SC_HOLLOW_D2A',
    filmId: 'F_HOLLOW',
    venueId: 'V_PALACE',
    dayId: 'D2',
    startMin: 780,
    startLabel: '1:00 PM',
    introMin: 10,
    qaMin: 30,
    status: 'slotted',
    premiereTier: 'international',
    rsvpCount: 720,
  },
  {
    id: 'SC_COASTLINE_D2', // longest-title stress on a 261px block
    filmId: 'F_COASTLINE',
    venueId: 'V_PALACE',
    dayId: 'D2',
    startMin: 990,
    startLabel: '4:30 PM',
    introMin: 10,
    qaMin: 30,
    status: 'slotted',
    premiereTier: 'world',
    rsvpCount: 860,
  },
  {
    id: 'SC_EMBER_D2', // 45min = 72px core → glyph-only collapse stress
    filmId: 'F_EMBER',
    venueId: 'V_PALACE',
    dayId: 'D2',
    startMin: 1260,
    startLabel: '9:00 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 320,
  },
  {
    id: 'SC_PAPERSKY_D2',
    filmId: 'F_PAPERSKY',
    venueId: 'V_ORPHEUM',
    dayId: 'D2',
    startMin: 660,
    startLabel: '11:00 AM',
    introMin: 0,
    qaMin: 20,
    status: 'slotted',
    rsvpCount: 340,
  },
  {
    id: 'SC_HELIO_D2',
    filmId: 'F_HELIO',
    venueId: 'V_ORPHEUM',
    dayId: 'D2',
    startMin: 840,
    startLabel: '2:00 PM',
    introMin: 10,
    qaMin: 20,
    status: 'slotted',
    rsvpCount: 410,
  },
  {
    id: 'SC_MOTH_D2B',
    filmId: 'F_MOTH',
    venueId: 'V_ORPHEUM',
    dayId: 'D2',
    startMin: 1230,
    startLabel: '8:30 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 290,
  },
  {
    id: 'SC_NIGHTSOIL_D2',
    filmId: 'F_NIGHTSOIL',
    venueId: 'V_ANNEX',
    dayId: 'D2',
    startMin: 645,
    startLabel: '10:45 AM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 160,
  },
  {
    // Capacity conflict: 460 advance requests vs Guild Annex's 220 seats.
    id: 'SC_LUMEN_D2',
    filmId: 'F_LUMEN',
    venueId: 'V_ANNEX',
    dayId: 'D2',
    startMin: 810,
    startLabel: '1:30 PM',
    introMin: 0,
    qaMin: 20,
    status: 'slotted',
    premiereTier: 'regional',
    rsvpCount: 460,
  },
  {
    // Ribbon-break stress: Q&A 9:07–9:37 PM vs Vasquez-Brandt depart 9:00 PM.
    id: 'SC_SALT_D2',
    filmId: 'F_SALTWIND',
    venueId: 'V_ANNEX',
    dayId: 'D2',
    startMin: 1140,
    startLabel: '7:00 PM',
    introMin: 10,
    qaMin: 30,
    status: 'slotted',
    rsvpCount: 205,
  },
  {
    // Red print thread target — 5:30 PM Rooftop, 2h 08m after the Palace
    // reel-down vs a 3h 00m courier leg.
    id: 'SC_HOLLOW_D2B',
    filmId: 'F_HOLLOW',
    venueId: 'V_ROOFTOP',
    dayId: 'D2',
    startMin: 1050,
    startLabel: '5:30 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 145,
  },
  // --- D3 · Sat Jun 13 ------------------------------------------------------
  {
    id: 'SC_HELIO_D3',
    filmId: 'F_HELIO',
    venueId: 'V_PALACE',
    dayId: 'D3',
    startMin: 780,
    startLabel: '1:00 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 520,
  },
  {
    // Second red thread source: PT-4402 reels down at 2:08 PM; Rooftop
    // encore at 3:30 PM leaves 1h 22m vs a 2h 30m courier leg.
    id: 'SC_GARNET_D3A',
    filmId: 'F_GARNET',
    venueId: 'V_ORPHEUM',
    dayId: 'D3',
    startMin: 720,
    startLabel: '12:00 PM',
    introMin: 10,
    qaMin: 20,
    status: 'slotted',
    premiereTier: 'international',
    rsvpCount: 540,
  },
  {
    id: 'SC_LUMEN_D3',
    filmId: 'F_LUMEN',
    venueId: 'V_ORPHEUM',
    dayId: 'D3',
    startMin: 1080,
    startLabel: '6:00 PM',
    introMin: 0,
    qaMin: 20,
    status: 'slotted',
    rsvpCount: 470,
  },
  {
    id: 'SC_MOTH_D3',
    filmId: 'F_MOTH',
    venueId: 'V_CASCADE',
    dayId: 'D3',
    startMin: 960,
    startLabel: '4:00 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 260,
  },
  {
    id: 'SC_PAPERSKY_D3',
    filmId: 'F_PAPERSKY',
    venueId: 'V_ANNEX',
    dayId: 'D3',
    startMin: 870,
    startLabel: '2:30 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 180,
  },
  {
    id: 'SC_GARNET_D3B',
    filmId: 'F_GARNET',
    venueId: 'V_ROOFTOP',
    dayId: 'D3',
    startMin: 930,
    startLabel: '3:30 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 130,
  },
  // --- D4 · Sun Jun 14 — zero conflicts: the DayTab chip-omission proof -----
  {
    id: 'SC_COASTLINE_D4',
    filmId: 'F_COASTLINE',
    venueId: 'V_PALACE',
    dayId: 'D4',
    startMin: 840,
    startLabel: '2:00 PM',
    introMin: 0,
    qaMin: 20,
    status: 'slotted',
    rsvpCount: 610,
  },
  {
    id: 'SC_NIGHTSOIL_D4',
    filmId: 'F_NIGHTSOIL',
    venueId: 'V_ORPHEUM',
    dayId: 'D4',
    startMin: 750,
    startLabel: '12:30 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 240,
  },
  {
    id: 'SC_EMBER_D4',
    filmId: 'F_EMBER',
    venueId: 'V_CASCADE',
    dayId: 'D4',
    startMin: 660,
    startLabel: '11:00 AM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 120,
  },
  {
    id: 'SC_HELIO_D4',
    filmId: 'F_HELIO',
    venueId: 'V_ANNEX',
    dayId: 'D4',
    startMin: 960,
    startLabel: '4:00 PM',
    introMin: 0,
    qaMin: 20,
    status: 'slotted',
    rsvpCount: 190,
  },
  {
    id: 'SC_MOTH_D4',
    filmId: 'F_MOTH',
    venueId: 'V_ROOFTOP',
    dayId: 'D4',
    startMin: 1200,
    startLabel: '8:00 PM',
    introMin: 0,
    qaMin: 0,
    status: 'slotted',
    rsvpCount: 135,
  },
  // --- Unslotted tray (3 films; tray label count derives from these) --------
  {
    id: 'SC_TIDE',
    filmId: 'F_TIDE',
    dayId: 'D2',
    startMin: 600,
    startLabel: '10:00 AM',
    introMin: 0,
    qaMin: 0,
    status: 'unslotted',
    rsvpCount: 95,
  },
  {
    id: 'SC_LANTERN', // 45-char title: the 220px tray-chip ellipsis stress
    filmId: 'F_LANTERN',
    dayId: 'D2',
    startMin: 600,
    startLabel: '10:00 AM',
    introMin: 0,
    qaMin: 20,
    status: 'unslotted',
    rsvpCount: 175,
  },
  {
    id: 'SC_VERSO', // 35mm + regional mini-flag on the tray chip
    filmId: 'F_VERSO',
    dayId: 'D2',
    startMin: 600,
    startLabel: '10:00 AM',
    introMin: 0,
    qaMin: 0,
    status: 'unslotted',
    premiereTier: 'regional',
    rsvpCount: 110,
  },
];

const SCREENINGS_BY_ID: Record<string, Screening> = Object.fromEntries(
  SCREENINGS.map(s => [s.id, s]),
);

// ---------------------------------------------------------------------------
// PURE TIME MATH — clock-free formatters for runtime-rewritten startMin
// ---------------------------------------------------------------------------

function fmtClock(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suffix = h24 < 12 || min >= 1440 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

function fmtHour(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const suffix = h24 < 12 || min >= 1440 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12} \${suffix}\`;
}

function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return \`\${m}m\`;
  return \`\${h}h \${String(m).padStart(2, '0')}m\`;
}

const qaEndOf = (s: Screening): number =>
  s.startMin + FILMS[s.filmId].runtimeMin + s.qaMin;

// ---------------------------------------------------------------------------
// DERIVED SELECTORS — recomputed every render, never stored. Feasibility is
// derived BY LAW; nothing below writes state.
// ---------------------------------------------------------------------------

type ThreadStatus = 'ok' | 'tight' | 'infeasible';

interface PrintThread {
  id: string;
  filmId: string;
  fromId: string;
  toId: string;
  fromVenueId: VenueId;
  toVenueId: VenueId;
  x1: number; // source block right edge (end of Q&A buffer)
  y1: number;
  x2: number; // target block left edge (start of intro buffer)
  y2: number;
  status: ThreadStatus;
  gapMin: number;
  transitMin: number;
  label: string; // red only: 'needs 3h 00m, has 2h 08m'
}

const laneMidY = (venueId: VenueId): number =>
  (LANE_INDEX.get(venueId) ?? 0) * LANE_H + BLOCK_TOP + BLOCK_H / 2;

/** Print-traffic threads: consecutive same-day screenings of each 35mm film. */
function computeThreads(screenings: Record<string, Screening>, dayId: DayId): PrintThread[] {
  const byFilm = new Map<string, Screening[]>();
  for (const s of Object.values(screenings)) {
    if (s.status !== 'slotted' || s.dayId !== dayId || s.venueId == null) continue;
    if (FILMS[s.filmId].format !== '35mm') continue;
    const list = byFilm.get(s.filmId) ?? [];
    list.push(s);
    byFilm.set(s.filmId, list);
  }
  const threads: PrintThread[] = [];
  for (const [filmId, list] of byFilm) {
    const sorted = [...list].sort((a, b) => a.startMin - b.startMin);
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i];
      const to = sorted[i + 1];
      if (from.venueId == null || to.venueId == null) continue;
      const reelDown = qaEndOf(from);
      const mustArrive = to.startMin - to.introMin;
      const gapMin = mustArrive - reelDown;
      const transitMin = transitBetween(from.venueId, to.venueId);
      const status: ThreadStatus =
        gapMin >= transitMin + 30 ? 'ok' : gapMin >= transitMin ? 'tight' : 'infeasible';
      threads.push({
        id: \`\${from.id}->\${to.id}\`,
        filmId,
        fromId: from.id,
        toId: to.id,
        fromVenueId: from.venueId,
        toVenueId: to.venueId,
        x1: minToX(reelDown),
        y1: laneMidY(from.venueId),
        x2: minToX(mustArrive),
        y2: laneMidY(to.venueId),
        status,
        gapMin,
        transitMin,
        label: \`needs \${fmtDur(transitMin)}, has \${fmtDur(gapMin)}\`,
      });
    }
  }
  return threads;
}

interface GuestBreak {
  screeningId: string;
  filmId: string;
  venueId: VenueId;
  dayId: DayId;
  fromMin: number; // the offending Q&A buffer span
  toMin: number;
  overMin: number;
  guestName: string;
}

/** Q&A buffers that overrun the film director's on-site window. */
function computeGuestBreaks(
  screenings: Record<string, Screening>,
  dayId?: DayId,
): GuestBreak[] {
  const breaks: GuestBreak[] = [];
  for (const s of Object.values(screenings)) {
    if (s.status !== 'slotted' || s.venueId == null || s.qaMin === 0) continue;
    if (dayId != null && s.dayId !== dayId) continue;
    const guest = GUESTS[s.filmId];
    const win = guest?.windows[s.dayId];
    if (guest == null || win == null) continue;
    const qaStart = s.startMin + FILMS[s.filmId].runtimeMin;
    const qaEnd = qaStart + s.qaMin;
    if (qaEnd > win.departMin || qaStart < win.arriveMin) {
      breaks.push({
        screeningId: s.id,
        filmId: s.filmId,
        venueId: s.venueId,
        dayId: s.dayId,
        fromMin: qaStart,
        toMin: qaEnd,
        overMin: qaEnd > win.departMin ? qaEnd - win.departMin : win.arriveMin - qaStart,
        guestName: guest.name,
      });
    }
  }
  return breaks;
}

interface Conflict {
  id: string;
  kind: ConflictKind;
  screeningId: string;
  dayId: DayId;
  text: string;
}

/** Red threads + guest breaks + capacity flags for one day. */
function computeConflicts(screenings: Record<string, Screening>, dayId: DayId): Conflict[] {
  const conflicts: Conflict[] = [];
  for (const t of computeThreads(screenings, dayId)) {
    if (t.status !== 'infeasible') continue;
    const film = FILMS[t.filmId];
    conflicts.push({
      id: \`print:\${t.id}\`,
      kind: 'print',
      screeningId: t.toId,
      dayId,
      text: \`Print \${film.printId ?? ''} \${VENUE_BY_ID.get(t.fromVenueId)?.name} → \${
        VENUE_BY_ID.get(t.toVenueId)?.name
      } — \${t.label}\`,
    });
  }
  for (const b of computeGuestBreaks(screenings, dayId)) {
    conflicts.push({
      id: \`guest:\${b.screeningId}\`,
      kind: 'guest',
      screeningId: b.screeningId,
      dayId,
      text: \`\${b.guestName}'s Q&A ends \${fmtDur(b.overMin)} after departure\`,
    });
  }
  for (const s of Object.values(screenings)) {
    if (s.status !== 'slotted' || s.dayId !== dayId || s.venueId == null) continue;
    const venue = VENUE_BY_ID.get(s.venueId);
    if (venue != null && s.rsvpCount > venue.seats) {
      conflicts.push({
        id: \`capacity:\${s.id}\`,
        kind: 'capacity',
        screeningId: s.id,
        dayId,
        text: \`\${FILMS[s.filmId].title}: \${s.rsvpCount} requests vs \${venue.seats} seats at \${venue.name}\`,
      });
    }
  }
  return conflicts;
}

type CheckState = 'ok' | 'warn' | 'fail';

interface HealthRow {
  id: string;
  state: CheckState;
  text: string;
  metric?: string;
}

/** The aside checklist — fully derived from the store per selected screening. */
function healthChecklist(
  screenings: Record<string, Screening>,
  selectedId: string,
): HealthRow[] {
  const s = screenings[selectedId];
  if (s == null) return [];
  const film = FILMS[s.filmId];
  const rows: HealthRow[] = [];
  if (s.status === 'unslotted' || s.venueId == null) {
    rows.push({id: 'slot', state: 'warn', text: 'Not on the schedule — slot from the tray'});
    return rows;
  }
  const venue = VENUE_BY_ID.get(s.venueId);

  // Print-transit rows: every thread touching this film on this day.
  if (film.format === '35mm') {
    const threads = computeThreads(screenings, s.dayId).filter(t => t.filmId === film.id);
    if (threads.length === 0) {
      rows.push({
        id: 'print-single',
        state: 'ok',
        text: \`Print \${film.printId} stays at \${venue?.name} — no same-day hop\`,
      });
    }
    for (const t of threads) {
      rows.push({
        id: \`print:\${t.id}\`,
        state: t.status === 'ok' ? 'ok' : t.status === 'tight' ? 'warn' : 'fail',
        text: \`Print \${film.printId} courier \${VENUE_BY_ID.get(t.fromVenueId)?.name} → \${
          VENUE_BY_ID.get(t.toVenueId)?.name
        }\`,
        metric: \`gap \${fmtDur(t.gapMin)} / needs \${fmtDur(t.transitMin)}\`,
      });
    }
  }

  // Guest-window row.
  const guest = GUESTS[s.filmId];
  const win = guest?.windows[s.dayId];
  if (s.qaMin > 0) {
    if (guest == null || win == null) {
      rows.push({
        id: 'guest',
        state: 'warn',
        text: 'Q&A scheduled, no guest on file this day — programmer moderates',
      });
    } else {
      const qaStart = s.startMin + film.runtimeMin;
      const qaEnd = qaStart + s.qaMin;
      const fits = qaEnd <= win.departMin && qaStart >= win.arriveMin;
      rows.push({
        id: 'guest',
        state: fits ? 'ok' : 'fail',
        text: fits
          ? \`Q&A inside \${guest.name}'s window\`
          : \`Q&A ends \${fmtDur(qaEnd - win.departMin)} after \${guest.name} departs\`,
        metric: fits
          ? \`ok by \${fmtDur(win.departMin - qaEnd)}\`
          : \`over by \${fmtDur(qaEnd - win.departMin)}\`,
      });
    }
  } else {
    rows.push({id: 'guest', state: 'ok', text: 'No Q&A buffer on this screening'});
  }

  // Premiere-sequencing row: the flagged premiere must precede every other
  // slotted screening of the film (festival-wide, day order then start).
  const siblings = Object.values(screenings).filter(
    x => x.filmId === film.id && x.status === 'slotted',
  );
  const premiere = siblings.find(x => x.premiereTier != null);
  if (premiere != null && siblings.length > 1) {
    const orderKey = (x: Screening) => DAY_ORDER[x.dayId] * 10000 + x.startMin;
    const precedes = siblings.every(x => x.id === premiere.id || orderKey(premiere) < orderKey(x));
    rows.push({
      id: 'premiere',
      state: precedes ? 'ok' : 'fail',
      text: precedes
        ? \`\${premiere.premiereTier === 'world' ? 'World' : premiere.premiereTier === 'international' ? 'International' : 'Regional'} premiere precedes 2nd screening\`
        : 'Premiere no longer precedes the 2nd screening',
    });
  }

  // Venue-capacity row.
  if (venue != null) {
    const over = s.rsvpCount > venue.seats;
    rows.push({
      id: 'capacity',
      state: over ? 'fail' : 'ok',
      text: over
        ? \`\${venue.name} oversubscribed\`
        : \`Fits \${venue.name}\`,
      metric: \`\${s.rsvpCount} req / \${venue.seats} seats\`,
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// useElementWidth — CONTAINER-width responsiveness (ResizeObserver on the
// view root). The demo stage is ~1045–1075px inside a 1440px window, so
// viewport queries are wrong by construction; they cover only the first
// pre-observer frame (width 0).
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
// MARKS & GLYPHS
// ---------------------------------------------------------------------------

/**
 * MarqueeMark — three vertical ticket stubs with 2px semicircular
 * perforation notches cut from each side edge (fill-rule evenodd carves the
 * notch circles out of the stub rects). Middle stub raised 4px, filled with
 * the quarantined BRAND literal.
 */
function MarqueeMark() {
  const stub = (x: number, y: number, h: number): string => {
    const cy = y + h / 2;
    const notch = (cx: number) =>
      \`M\${cx - 2},\${cy} a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 Z\`;
    return \`M\${x},\${y} h6 v\${h} h-6 Z \${notch(x)} \${notch(x + 6)}\`;
  };
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d={stub(1, 6, 16)} fill="var(--color-text-secondary)" fillRule="evenodd" />
      <path d={stub(9, 2, 16)} fill={BRAND} fillRule="evenodd" />
      <path d={stub(17, 6, 16)} fill="var(--color-text-secondary)" fillRule="evenodd" />
    </svg>
  );
}

/** 12px film-reel inline SVG — the 35mm format glyph. */
function ReelGlyph() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden focusable="false" style={{flexShrink: 0}}>
      <circle cx={6} cy={6} r={5} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <circle cx={6} cy={6} r={1} fill="currentColor" />
      <circle cx={6} cy={3} r={1} fill="currentColor" />
      <circle cx={3.4} cy={7.5} r={1} fill="currentColor" />
      <circle cx={8.6} cy={7.5} r={1} fill="currentColor" />
    </svg>
  );
}

function FormatGlyph({format}: {format: Format}) {
  return format === 'dcp' ? (
    <span style={styles.dcpChip} aria-label="DCP">
      DCP
    </span>
  ) : (
    <span style={{display: 'inline-flex', color: 'var(--color-text-secondary)'}} aria-label="35mm print">
      <ReelGlyph />
    </span>
  );
}

const TIER_FILL: Record<PremiereTier, string> = {
  world: FLAG_GOLD,
  international: FLAG_TEAL,
  regional: FLAG_SLATE,
};
const TIER_LABEL: Record<PremiereTier, string> = {
  world: 'World premiere',
  international: 'International premiere',
  regional: 'Regional premiere',
};

/** 16px right-triangle corner flag; a real <button> that cycles the tier. */
function PremiereFlag({
  tier,
  onCycle,
}: {
  tier: PremiereTier;
  onCycle: () => void;
}) {
  return (
    <button
      type="button"
      className="fsg-focusable"
      style={styles.flagButton}
      aria-label={\`\${TIER_LABEL[tier]} — click to cycle tier\`}
      onPointerDown={e => e.stopPropagation()}
      onClick={e => {
        e.stopPropagation();
        onCycle();
      }}>
      <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden focusable="false">
        <polygon points="16,0 16,16 0,0" fill={TIER_FILL[tier]} />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// TIME RULER — 28px sticky bar; hour labels every 96px; the 15-min hairlines
// live on the lane-track background gradient shared by all lanes.
// ---------------------------------------------------------------------------

function TimeRuler() {
  const hours: number[] = [];
  for (let m = BOARD_START_MIN; m <= BOARD_END_MIN; m += 60) hours.push(m);
  return (
    <div style={styles.ruler} aria-hidden>
      {hours.map(m => {
        const x = minToX(m);
        const isLast = m === BOARD_END_MIN;
        return (
          <span key={m}>
            <span
              style={{
                ...styles.rulerLabel,
                left: x,
                transform: isLast ? 'translateX(calc(-100% - 4px))' : 'translateX(4px)',
              }}>
              {fmtHour(m)}
            </span>
            <span style={{...styles.rulerTick, left: x}} />
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCREENING BLOCK — width IS runtime (1.6px/min); hatched intro/Q&A buffer
// extensions; premiere corner flag; <= 72px core (<= 45min, F_EMBER) drops
// the title and centers the format glyph (full text via title attr).
// Zero internal state — pure render of screening + selection + conflict.
// ---------------------------------------------------------------------------

interface ScreeningBlockProps {
  screening: Screening;
  selected: boolean;
  conflictLevel: 'none' | 'guest' | 'print';
  conflictCount: number;
  dragStyle?: CSSProperties;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>, s: Screening) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>, s: Screening) => void;
  onCycleTier: (s: Screening) => void;
}

function ScreeningBlock({
  screening: s,
  selected,
  conflictLevel,
  conflictCount,
  dragStyle,
  onPointerDown,
  onKeyDown,
  onCycleTier,
}: ScreeningBlockProps) {
  const film = FILMS[s.filmId];
  const coreW = film.runtimeMin * PX_PER_MIN;
  const glyphOnly = coreW <= GLYPH_ONLY_MAX_W;
  const venue = s.venueId != null ? VENUE_BY_ID.get(s.venueId) : undefined;
  const conflictStyle: CSSProperties =
    conflictLevel === 'print'
      ? {borderColor: RISK_RED, backgroundColor: RED_SOFT}
      : conflictLevel === 'guest'
        ? {borderColor: RISK_RED}
        : {};
  const label = \`\${film.title}, \${venue?.name ?? 'unslotted'}, \${fmtClock(s.startMin)}, \${
    film.runtimeLabel
  }\${s.premiereTier != null ? \`, \${TIER_LABEL[s.premiereTier].toLowerCase()}\` : ''}, \${conflictCount} conflict\${
    conflictCount === 1 ? '' : 's'
  }\`;
  return (
    <div
      role="button"
      tabIndex={0}
      className="fsg-block"
      aria-pressed={selected}
      aria-label={label}
      title={glyphOnly ? \`\${film.title} · \${film.runtimeLabel}\` : undefined}
      style={{
        ...styles.block,
        left: minToX(s.startMin),
        width: coreW,
        ...(selected ? {boxShadow: '0 0 0 2px var(--color-accent)'} : {}),
        ...conflictStyle,
        ...dragStyle,
      }}
      onPointerDown={e => onPointerDown(e, s)}
      onKeyDown={e => onKeyDown(e, s)}>
      {s.introMin > 0 ? (
        <span
          style={{
            ...styles.bufferZone,
            left: -s.introMin * PX_PER_MIN,
            width: s.introMin * PX_PER_MIN,
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
          }}
          aria-hidden
        />
      ) : null}
      {s.qaMin > 0 ? (
        <span
          style={{
            ...styles.bufferZone,
            right: -s.qaMin * PX_PER_MIN,
            width: s.qaMin * PX_PER_MIN,
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
          }}
          aria-hidden
        />
      ) : null}
      {glyphOnly ? (
        <span style={styles.blockGlyphOnly}>
          <FormatGlyph format={film.format} />
        </span>
      ) : (
        <span style={styles.blockBody}>
          <span style={styles.blockTitle}>{film.title}</span>
          <span style={styles.blockMeta}>
            <span style={{...styles.blockMetaText, fontVariantNumeric: 'tabular-nums'}}>{film.runtimeLabel}</span>
            <FormatGlyph format={film.format} />
            {venue != null ? (
              <span style={{...styles.blockMetaText, fontVariantNumeric: 'tabular-nums'}}>{venue.seats} seats</span>
            ) : null}
          </span>
          <span style={{...styles.blockMeta, fontVariantNumeric: 'tabular-nums'}}>
            {fmtClock(s.startMin)}
          </span>
        </span>
      )}
      {s.premiereTier != null ? (
        <PremiereFlag tier={s.premiereTier} onCycle={() => onCycleTier(s)} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// THREAD LAYER — one SVG over the full 1344 x lanes area, pointerEvents
// none, aria-hidden (thread facts are duplicated as HealthChecklist text).
// Elbow: 24px stub off the source Q&A edge, vertical run in the inter-lane
// gap, into the target's intro edge. Red = dashed + midpoint label chip.
// ---------------------------------------------------------------------------

const THREAD_COLOR: Record<ThreadStatus, string> = {
  ok: OK_GREEN,
  tight: WARN_AMBER,
  infeasible: RISK_RED,
};

function ThreadLayer({threads, left}: {threads: PrintThread[]; left: number}) {
  const height = VENUES.length * LANE_H;
  return (
    <svg
      width={BOARD_W}
      height={height}
      viewBox={\`0 0 \${BOARD_W} \${height}\`}
      style={{...styles.threadSvg, left}}
      aria-hidden
      focusable="false">
      {threads.map(t => {
        const color = THREAD_COLOR[t.status];
        const elbowX = t.x1 + 24;
        const d = \`M\${t.x1},\${t.y1} H\${elbowX} V\${t.y2} H\${t.x2}\`;
        const midY = (t.y1 + t.y2) / 2;
        const chipW = t.label.length * 5.6 + 12;
        return (
          <g key={t.id}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray={t.status === 'infeasible' ? '6 3' : undefined}
            />
            <circle cx={t.x1} cy={t.y1} r={2.5} fill={color} />
            <circle cx={t.x2} cy={t.y2} r={2.5} fill={color} />
            {t.status === 'infeasible' ? (
              <g transform={\`translate(\${elbowX + 6}, \${midY - 8})\`}>
                <rect
                  width={chipW}
                  height={16}
                  rx={8}
                  fill="var(--color-background)"
                  stroke={color}
                  strokeWidth={1}
                />
                <text
                  x={chipW / 2}
                  y={11}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily={MONO}
                  fill={color}>
                  {t.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// GUEST AVAILABILITY RIBBON — 14px strip under a lane's block track.
// Selected film: solid window segment + red hatched breaks under the
// offending Q&A spans in this lane. No selection: every guest's window at
// 10% opacity. Hidden < 880px (violations still counted in chips).
// ---------------------------------------------------------------------------

interface RibbonSegment {
  fromMin: number;
  toMin: number;
  faint: boolean;
  label: string;
}

function GuestAvailabilityRibbon({
  segments,
  breaks,
  ariaLabel,
}: {
  segments: RibbonSegment[];
  breaks: GuestBreak[];
  ariaLabel: string;
}) {
  return (
    <div style={styles.ribbon} role="img" aria-label={ariaLabel}>
      {segments.map((seg, i) => {
        const from = Math.max(seg.fromMin, BOARD_START_MIN);
        const to = Math.min(seg.toMin, BOARD_END_MIN);
        if (to <= from) return null;
        return (
          <span
            key={i}
            style={{
              ...styles.ribbonSegment,
              left: minToX(from),
              width: (to - from) * PX_PER_MIN,
              ...(seg.faint
                ? {backgroundColor: RIBBON_FAINT, borderLeftColor: 'transparent', borderRightColor: 'transparent'}
                : {}),
            }}
          />
        );
      })}
      {breaks.map(b => (
        <span
          key={b.screeningId}
          style={{
            ...styles.ribbonBreak,
            left: minToX(b.fromMin),
            width: (b.toMin - b.fromMin) * PX_PER_MIN,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HEALTH CHECKLIST — 36px rows in the aside; fully derived per selection.
// Icon shape + text pair with the color so color is never the only channel.
// ---------------------------------------------------------------------------

const CHECK_META: Record<CheckState, {icon: typeof CheckIcon; color: string}> = {
  ok: {icon: CheckIcon, color: OK_GREEN},
  warn: {icon: TriangleAlertIcon, color: WARN_AMBER},
  fail: {icon: XIcon, color: RISK_RED},
};

function HealthChecklist({rows}: {rows: HealthRow[]}) {
  return (
    <VStack gap={0}>
      {rows.map(row => {
        const meta = CHECK_META[row.state];
        return (
          <div key={row.id} style={styles.asideRow}>
            <span style={{...styles.checkIcon, color: meta.color}}>
              <Icon icon={meta.icon} size="sm" color="inherit" />
            </span>
            <Text type="supporting" size="xsm" maxLines={1}>
              {row.text}
            </Text>
            {row.metric != null ? (
              <span style={{...styles.checkMetric, color: meta.color}}>{row.metric}</span>
            ) : null}
          </div>
        );
      })}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// TRAY FILM CHIP — 36px composite row; segments omitted when undefined.
// ---------------------------------------------------------------------------

function TrayFilmChip({
  screening,
  selected,
  onSelect,
}: {
  screening: Screening;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const film = FILMS[screening.filmId];
  return (
    <button
      type="button"
      className="fsg-focusable fsg-chipbtn"
      style={{...styles.trayChip, ...(selected ? styles.trayChipSelected : {})}}
      aria-pressed={selected}
      onClick={() => onSelect(screening.id)}>
      <FormatGlyph format={film.format} />
      <span style={styles.trayChipTitle}>{film.title}</span>
      <span style={{fontSize: 11, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'}}>
        {film.runtimeLabel}
      </span>
      {screening.premiereTier != null ? (
        <svg width={10} height={10} viewBox="0 0 16 16" aria-label={TIER_LABEL[screening.premiereTier]} focusable="false">
          <polygon points="16,0 16,16 0,0" fill={TIER_FILL[screening.premiereTier]} />
        </svg>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// DETAIL PANEL — the 380px aside body (also rendered inside the < 1000px
// Dialog). Everything on it is an affordance: the Q&A chip toggles the
// buffer through update(); slot rows schedule unslotted films.
// ---------------------------------------------------------------------------

interface DetailPanelProps {
  screening: Screening;
  screenings: Record<string, Screening>;
  activeDay: DayId;
  onToggleQa: (s: Screening) => void;
  onSlotAtTen: (s: Screening, venueId: VenueId) => void;
}

function DetailPanel({screening: s, screenings, activeDay, onToggleQa, onSlotAtTen}: DetailPanelProps) {
  const film = FILMS[s.filmId];
  const venue = s.venueId != null ? VENUE_BY_ID.get(s.venueId) : undefined;
  const guest = GUESTS[s.filmId];
  const rows = healthChecklist(screenings, s.id);
  const day = DAYS.find(d => d.id === s.dayId);
  return (
    <div style={styles.asideBody}>
      <VStack gap={1}>
        <Heading level={2}>{film.title}</Heading>
        <Text type="supporting" size="xsm" color="secondary">
          {film.director} · {film.country} · {film.runtimeLabel}
        </Text>
      </VStack>
      <HStack gap={1} wrap="wrap" vAlign="center">
        <Token
          size="sm"
          color="default"
          label={film.format === '35mm' ? \`35mm · \${film.printId ?? ''}\` : 'DCP'}
        />
        {s.premiereTier != null ? (
          <Token size="sm" color="purple" label={TIER_LABEL[s.premiereTier]} />
        ) : null}
        <Token size="sm" color="default" label={\`Intro \${s.introMin}m\`} />
        {/* Q&A chip toggles qaMin 0 ↔ 20 (30 → 0) through update(); the
            hatched extension visibly grows/shrinks on the board. */}
        <Token
          size="sm"
          color={s.qaMin > 0 ? 'blue' : 'gray'}
          icon={<Icon icon={MegaphoneIcon} size="xsm" color="inherit" />}
          label={\`Q&A \${s.qaMin}m\`}
          onClick={() => onToggleQa(s)}
        />
      </HStack>
      <Divider />
      {s.status === 'slotted' && venue != null && day != null ? (
        <VStack gap={0}>
          <div style={styles.asideRow}>
            <Icon icon={ClockIcon} size="sm" color="secondary" />
            <Text type="supporting" size="xsm" hasTabularNumbers>
              {day.label} · {fmtClock(s.startMin)} – {fmtClock(qaEndOf(s))} (incl. buffers)
            </Text>
          </div>
          <div style={styles.asideRow}>
            <Icon icon={UsersIcon} size="sm" color="secondary" />
            <Text type="supporting" size="xsm" hasTabularNumbers>
              {venue.name} · {s.rsvpCount} requests / {venue.seats} seats
            </Text>
          </div>
          {guest != null ? (
            <div style={styles.asideRow}>
              <Icon icon={CalendarCheckIcon} size="sm" color="secondary" />
              <Text type="supporting" size="xsm" maxLines={1}>
                {guest.name} {guest.onSiteLabel}
              </Text>
            </div>
          ) : null}
        </VStack>
      ) : (
        <VStack gap={1}>
          <Text type="supporting" size="xsm" color="secondary">
            Unslotted — pick a venue to slot at 10:00 on {DAYS.find(d => d.id === activeDay)?.label}:
          </Text>
          {/* 44px heavy rows: per-venue slot actions for unslotted films. */}
          {VENUES.map(v => (
            <div key={v.id} style={styles.slotRow}>
              <StackItem size="fill">
                <Text type="label" size="sm" maxLines={1}>
                  {v.name}
                </Text>
              </StackItem>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                {v.seats} seats
              </Text>
              <Button
                label={\`Slot \${film.title} at \${v.name} 10:00 AM\`}
                variant="secondary"
                size="sm"
                onClick={() => onSlotAtTen(s, v.id)}>
                Slot at 10:00
              </Button>
            </div>
          ))}
        </VStack>
      )}
      <Divider />
      <VStack gap={1}>
        <Heading level={3}>Health checklist</Heading>
        <HealthChecklist rows={rows} />
        {s.id === 'SC_HOLLOW_D2B' || s.id === 'SC_HOLLOW_D2A' ? (
          <Text type="supporting" size="xsm" color="secondary">
            Print PT-2091 reels down at The Palace 3:22 PM; courier dock-to-dock
            to Rooftop Deck is 3h 00m.
          </Text>
        ) : null}
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the ONE state owner. update(id, patch) shallow-merges one screening
// and is the ONLY mutation path; selection and active day are companion
// fields on the same owner. Everything else is derived per render.
// ---------------------------------------------------------------------------

interface ScheduleState {
  screenings: Record<string, Screening>;
  selectedId: string | null;
  activeDay: DayId;
}

type ScreeningPatch = Partial<
  Pick<Screening, 'startMin' | 'venueId' | 'dayId' | 'status' | 'qaMin' | 'premiereTier'>
>;

interface DragState {
  id: string;
  originX: number;
  originY: number;
  baseStartMin: number;
  baseLaneIdx: number;
  dMin: number; // snapped: 24px → 15min
  dLane: number; // snapped: 140px lane boundaries
  moved: boolean; // > 4px raw travel = drag, not click
  overTray: boolean;
}

const TIER_CYCLE: (PremiereTier | undefined)[] = ['world', 'international', 'regional', undefined];

export default function FestivalScreeningGridTemplate() {
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(viewRootRef);
  // Width 0 = first pre-observer frame; viewport queries cover that frame
  // only so wide hosts don't flash pane removal.
  const vpNoAside = useMediaQuery('(max-width: 999px)');
  const vpNarrowRail = useMediaQuery('(max-width: 879px)');
  const vpCollapsedTray = useMediaQuery('(max-width: 719px)');
  const isAsideHidden = containerWidth > 0 ? containerWidth < 1000 : vpNoAside;
  const isRailNarrow = containerWidth > 0 ? containerWidth < 880 : vpNarrowRail;
  const isTrayCollapsed = containerWidth > 0 ? containerWidth < 720 : vpCollapsedTray;
  const railW = isRailNarrow ? RAIL_W_NARROW : RAIL_W;

  const [schedule, setSchedule] = useState<ScheduleState>({
    screenings: SCREENINGS_BY_ID,
    selectedId: 'SC_SALT_D1',
    activeDay: 'D2',
  });
  const [announcement, setAnnouncement] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  // THE single mutation path.
  const update = useCallback((id: string, patch: ScreeningPatch) => {
    setSchedule(prev => {
      const current = prev.screenings[id];
      if (current == null) return prev;
      return {
        ...prev,
        screenings: {...prev.screenings, [id]: {...current, ...patch}},
      };
    });
  }, []);

  const {screenings, selectedId, activeDay} = schedule;
  const selected = selectedId != null ? screenings[selectedId] : undefined;

  // Derived, never stored: threads, breaks, conflicts, checklist, counts.
  const threads = computeThreads(screenings, activeDay);
  const dayConflicts = new Map<DayId, Conflict[]>(
    DAYS.map(d => [d.id, computeConflicts(screenings, d.id)]),
  );
  const activeConflicts = dayConflicts.get(activeDay) ?? [];
  const totalConflicts = DAYS.reduce((n, d) => n + (dayConflicts.get(d.id)?.length ?? 0), 0);
  const unslotted = Object.values(screenings).filter(s => s.status === 'unslotted');
  const daySlotted = Object.values(screenings).filter(
    s => s.status === 'slotted' && s.dayId === activeDay && s.venueId != null,
  );
  const activeBreaks = computeGuestBreaks(screenings, activeDay);

  // Block conflict levels for the active day (print outranks guest).
  const conflictLevelById = new Map<string, 'guest' | 'print'>();
  for (const b of activeBreaks) conflictLevelById.set(b.screeningId, 'guest');
  for (const t of threads) {
    if (t.status === 'infeasible') {
      conflictLevelById.set(t.fromId, 'print');
      conflictLevelById.set(t.toId, 'print');
    }
  }
  const conflictCountFor = (id: string): number => {
    let n = 0;
    for (const c of activeConflicts) if (c.screeningId === id) n++;
    for (const t of threads) if (t.status === 'infeasible' && t.fromId === id) n++;
    return n;
  };

  // Announce with post-mutation conflict math (build the would-be state).
  const announceAfter = useCallback(
    (id: string, patch: ScreeningPatch, verb: string) => {
      const current = schedule.screenings[id];
      if (current == null) return;
      const next = {...schedule.screenings, [id]: {...current, ...patch}};
      const total = DAYS.reduce((n, d) => n + computeConflicts(next, d.id).length, 0);
      const film = FILMS[current.filmId];
      const nextScreening = next[id];
      const place =
        nextScreening.status === 'unslotted' || nextScreening.venueId == null
          ? 'the tray'
          : \`\${VENUE_BY_ID.get(nextScreening.venueId)?.name} \${fmtClock(nextScreening.startMin)}\`;
      setAnnouncement(\`\${verb} \${film.title} to \${place} — conflicts: \${total}\`);
    },
    [schedule.screenings],
  );

  const select = useCallback(
    (id: string) => {
      setSchedule(prev => ({...prev, selectedId: id}));
      if (isAsideHidden) setIsDetailOpen(true);
    },
    [isAsideHidden],
  );

  const commitMove = useCallback(
    (id: string, startMin: number, venueId: VenueId) => {
      const patch: ScreeningPatch = {startMin, venueId, status: 'slotted'};
      announceAfter(id, patch, 'Moved');
      update(id, patch);
    },
    [announceAfter, update],
  );

  // --- Measured drag ------------------------------------------------------
  const onBlockPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, s: Screening) => {
      if (e.button !== 0 || s.venueId == null) return;
      e.preventDefault();
      setDrag({
        id: s.id,
        originX: e.clientX,
        originY: e.clientY,
        baseStartMin: s.startMin,
        baseLaneIdx: LANE_INDEX.get(s.venueId) ?? 0,
        dMin: 0,
        dLane: 0,
        moved: false,
        overTray: false,
      });
    },
    [],
  );

  useEffect(() => {
    if (drag == null) return undefined;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d == null) return;
      const dxPx = e.clientX - d.originX;
      const dyPx = e.clientY - d.originY;
      const film = FILMS[screenings[d.id].filmId];
      const rawMin = d.baseStartMin + Math.round(dxPx / 24) * 15;
      const clamped = Math.min(Math.max(rawMin, BOARD_START_MIN), BOARD_END_MIN - film.runtimeMin);
      const rawLane = d.baseLaneIdx + Math.round(dyPx / LANE_H);
      const lane = Math.min(Math.max(rawLane, 0), VENUES.length - 1);
      const trayRect = trayRef.current?.getBoundingClientRect();
      const overTray = trayRect != null && e.clientY >= trayRect.top;
      setDrag({
        ...d,
        dMin: clamped - d.baseStartMin,
        dLane: lane - d.baseLaneIdx,
        moved: d.moved || Math.abs(dxPx) > 4 || Math.abs(dyPx) > 4,
        overTray,
      });
    };
    const onUp = () => {
      const d = dragRef.current;
      if (d == null) return;
      setDrag(null);
      if (!d.moved) {
        select(d.id);
        return;
      }
      if (d.overTray) {
        const patch: ScreeningPatch = {status: 'unslotted', venueId: undefined};
        announceAfter(d.id, patch, 'Unslotted');
        update(d.id, patch);
        return;
      }
      const venueId = VENUES[d.baseLaneIdx + d.dLane].id;
      commitMove(d.id, d.baseStartMin + d.dMin, venueId);
    };
    const onCancel = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrag(null); // Escape aborts the drag layer
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onCancel);
    };
  }, [drag != null, screenings, select, update, announceAfter, commitMove]); // eslint-disable-line react-hooks/exhaustive-deps

  // Arrow keys ride the same constraint engine as drag (same update path).
  const onBlockKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>, s: Screening) => {
      if (s.venueId == null) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(s.id);
        return;
      }
      const film = FILMS[s.filmId];
      const laneIdx = LANE_INDEX.get(s.venueId) ?? 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(
          Math.max(s.startMin + (e.key === 'ArrowLeft' ? -15 : 15), BOARD_START_MIN),
          BOARD_END_MIN - film.runtimeMin,
        );
        if (next !== s.startMin) commitMove(s.id, next, s.venueId);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextLane = Math.min(
          Math.max(laneIdx + (e.key === 'ArrowUp' ? -1 : 1), 0),
          VENUES.length - 1,
        );
        if (nextLane !== laneIdx) commitMove(s.id, s.startMin, VENUES[nextLane].id);
      }
    },
    [commitMove, select],
  );

  const onCycleTier = useCallback(
    (s: Screening) => {
      const idx = TIER_CYCLE.indexOf(s.premiereTier);
      const next = TIER_CYCLE[(idx + 1) % TIER_CYCLE.length];
      update(s.id, {premiereTier: next});
      setAnnouncement(
        \`\${FILMS[s.filmId].title}: premiere tier \${next != null ? TIER_LABEL[next].toLowerCase() : 'cleared'}\`,
      );
    },
    [update],
  );

  const onToggleQa = useCallback(
    (s: Screening) => {
      const nextQa: 0 | 20 = s.qaMin === 0 ? 20 : 0;
      const patch: ScreeningPatch = {qaMin: nextQa};
      announceAfter(s.id, patch, nextQa === 0 ? 'Removed Q&A on' : 'Added 20m Q&A to');
      update(s.id, patch);
    },
    [announceAfter, update],
  );

  const onSlotAtTen = useCallback(
    (s: Screening, venueId: VenueId) => {
      const patch: ScreeningPatch = {
        status: 'slotted',
        venueId,
        dayId: activeDay,
        startMin: BOARD_START_MIN,
      };
      announceAfter(s.id, patch, 'Slotted');
      update(s.id, patch);
    },
    [activeDay, announceAfter, update],
  );

  // Ribbon inputs: the selected film's guest window on the active day (all
  // guests faint when nothing is selected); breaks only for the selected
  // film, placed in the offending lane.
  const selectedGuest = selected != null ? GUESTS[selected.filmId] : undefined;
  const selectedWindow = selectedGuest?.windows[activeDay];
  const ribbonSegments: RibbonSegment[] =
    selected != null
      ? selectedWindow != null && selectedGuest != null
        ? [
            {
              fromMin: selectedWindow.arriveMin,
              toMin: selectedWindow.departMin,
              faint: false,
              label: \`\${selectedGuest.name} \${selectedWindow.label}\`,
            },
          ]
        : []
      : Object.values(GUESTS)
          .map(g => {
            const w = g.windows[activeDay];
            return w != null
              ? {fromMin: w.arriveMin, toMin: w.departMin, faint: true, label: \`\${g.name} \${w.label}\`}
              : null;
          })
          .filter((x): x is RibbonSegment => x != null);
  const ribbonBreaks =
    selected != null ? activeBreaks.filter(b => b.filmId === selected.filmId) : [];

  const dayLabel = DAYS.find(d => d.id === activeDay);
  const footerLine = \`Day \${dayLabel?.num} — \${daySlotted.length} screenings · \${activeConflicts.length} conflict\${
    activeConflicts.length === 1 ? '' : 's'
  }\`;

  const detail =
    selected != null ? (
      <DetailPanel
        screening={selected}
        screenings={screenings}
        activeDay={activeDay}
        onToggleQa={onToggleQa}
        onSlotAtTen={onSlotAtTen}
      />
    ) : (
      <div style={styles.asideBody}>
        <Text type="supporting" size="sm" color="secondary">
          Select a screening block or tray chip to inspect its constraints.
        </Text>
      </div>
    );

  const trayChips = unslotted.map(s => (
    <TrayFilmChip key={s.id} screening={s} selected={s.id === selectedId} onSelect={select} />
  ));

  const legend = (
    <div style={styles.legend} aria-label="Print-thread legend">
      <span style={styles.legendChip}>
        <span style={{...styles.legendSwatch, backgroundColor: OK_GREEN}} />
        print ok
      </span>
      <span style={styles.legendChip}>
        <span style={{...styles.legendSwatch, backgroundColor: WARN_AMBER}} />
        tight &lt;30m margin
      </span>
      <span style={styles.legendChip}>
        <span style={{...styles.legendSwatch, backgroundColor: RISK_RED}} />
        infeasible
      </span>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{GRID_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              {/* 46px header bar — TL mark/wordmark, TR conflicts + Publish */}
              <header style={styles.headerBar}>
                <div style={styles.wordmarkWrap}>
                  <MarqueeMark />
                  <span style={styles.wordmark}>
                    <Text type="label" size="base">
                      Marquee Row
                    </Text>
                  </span>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    Edition 14 · Jun 11–14
                  </Text>
                </div>
                <span style={styles.srOnly} aria-live="polite">
                  {announcement}
                </span>
                <StackItem size="fill">
                  <span />
                </StackItem>
                <Token
                  size="sm"
                  color={totalConflicts > 0 ? 'red' : 'green'}
                  icon={<Icon icon={CircleAlertIcon} size="xsm" color="inherit" />}
                  label={\`\${totalConflicts} conflict\${totalConflicts === 1 ? '' : 's'}\`}
                />
                <Tooltip
                  content={
                    totalConflicts > 0
                      ? \`Resolve \${totalConflicts} conflict\${totalConflicts === 1 ? '' : 's'} (print transit, guest windows, capacity) to publish\`
                      : 'Schedule is clean — publish to the box office'
                  }>
                  <span>
                    <Button
                      label="Publish schedule"
                      variant="primary"
                      size="sm"
                      isDisabled={totalConflicts > 0}
                      icon={<Icon icon={CalendarCheckIcon} size="sm" />}
                      onClick={() => setAnnouncement('Schedule published to the box office')}
                    />
                  </span>
                </Tooltip>
              </header>
              {/* 40px day-tab row */}
              <div style={styles.tabRow}>
                <TabList
                  value={activeDay}
                  onChange={value =>
                    setSchedule(prev => ({...prev, activeDay: value as DayId}))
                  }
                  size="sm"
                  aria-label="Festival days">
                  {DAYS.map(d => {
                    const count = dayConflicts.get(d.id)?.length ?? 0;
                    return (
                      <Tab
                        key={d.id}
                        value={d.id}
                        label={d.label}
                        // Chip omitted at 0 — D4 proves the omission path.
                        endContent={
                          count > 0 ? (
                            <span style={styles.dayChip}>
                              {count}
                              <span style={styles.srOnly}>{\` conflict\${count === 1 ? '' : 's'}\`}</span>
                            </span>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </TabList>
              </div>
              {/* main row: board + aside */}
              <div style={styles.mainRow}>
                <div style={styles.boardCol}>
                  <div style={styles.boardScroll}>
                    <div style={{...styles.boardInner, width: railW + BOARD_W}}>
                      <div style={styles.rulerRow}>
                        <div style={{...styles.rulerCorner, width: railW}} />
                        <TimeRuler />
                      </div>
                      <div style={{position: 'relative'}}>
                        {VENUES.map(venue => {
                          const laneScreenings = daySlotted.filter(s => s.venueId === venue.id);
                          return (
                            <div key={venue.id} style={styles.laneRow}>
                              <div style={{...styles.laneLabel, width: railW}}>
                                <Text type="label" size="sm" maxLines={1}>
                                  {isRailNarrow ? venue.code : venue.name}
                                </Text>
                                {!isRailNarrow ? (
                                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                                    {venue.seats} seats
                                  </Text>
                                ) : null}
                              </div>
                              <div style={styles.laneTrack}>
                                {laneScreenings.length === 0 ? (
                                  <span style={styles.emptyLaneHint}>
                                    <Icon icon={ListIcon} size="xsm" color="inherit" />
                                    <Text type="supporting" size="xsm" color="inherit">
                                      No screenings — drag from the tray
                                    </Text>
                                  </span>
                                ) : null}
                                {laneScreenings.map(s => {
                                  const isDragging = drag?.id === s.id;
                                  const dragStyle: CSSProperties | undefined =
                                    isDragging && drag != null
                                      ? {
                                          transform: \`translate(\${drag.dMin * PX_PER_MIN}px, \${
                                            drag.dLane * LANE_H
                                          }px)\`,
                                          zIndex: 7,
                                          cursor: 'grabbing',
                                          opacity: drag.overTray ? 0.55 : 0.95,
                                          boxShadow:
                                            '0 0 0 2px var(--color-accent), 0 8px 24px rgba(0, 0, 0, 0.28)',
                                        }
                                      : undefined;
                                  return (
                                    <ScreeningBlock
                                      key={s.id}
                                      screening={s}
                                      selected={s.id === selectedId}
                                      conflictLevel={conflictLevelById.get(s.id) ?? 'none'}
                                      conflictCount={conflictCountFor(s.id)}
                                      dragStyle={dragStyle}
                                      onPointerDown={onBlockPointerDown}
                                      onKeyDown={onBlockKeyDown}
                                      onCycleTier={onCycleTier}
                                    />
                                  );
                                })}
                                {/* Ribbon hides < 880px; violations still
                                    counted in every conflict chip. */}
                                {!isRailNarrow ? (
                                  <GuestAvailabilityRibbon
                                    segments={ribbonSegments}
                                    breaks={ribbonBreaks.filter(b => b.venueId === venue.id)}
                                    ariaLabel={
                                      selected != null
                                        ? selectedWindow != null && selectedGuest != null
                                          ? \`\${selectedGuest.name} \${selectedWindow.label}\`
                                          : \`No guest window for \${FILMS[selected.filmId].title} on \${dayLabel?.label}\`
                                        : 'All guest on-site windows'
                                    }
                                  />
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                        <ThreadLayer threads={threads} left={railW} />
                      </div>
                    </div>
                  </div>
                </div>
                {!isAsideHidden ? (
                  <aside style={styles.aside} aria-label="Film detail">
                    {detail}
                    <div style={styles.asideFooter}>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {footerLine}
                      </Text>
                    </div>
                  </aside>
                ) : null}
              </div>
              {/* tray — BL count label, BR thread legend */}
              {isTrayCollapsed ? (
                <div ref={trayRef} style={styles.trayCollapsed}>
                  <Popover
                    content={
                      <div style={styles.popList}>
                        {trayChips}
                      </div>
                    }
                    label="Unslotted films">
                    <Button
                      label={\`\${unslotted.length} unslotted — open list\`}
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={ListIcon} size="sm" />}
                    />
                  </Popover>
                  {legend}
                </div>
              ) : (
                <div
                  ref={trayRef}
                  style={{
                    ...styles.tray,
                    ...(drag?.overTray ? styles.trayDropActive : {}),
                  }}>
                  <Text type="label" size="sm" hasTabularNumbers>
                    Unslotted — {unslotted.length} films
                  </Text>
                  <div style={styles.trayChips}>{trayChips}</div>
                  {legend}
                </div>
              )}
            </div>
            {/* < 1000px: detail rides a right-pinned Dialog instead of the
                aside; DS owns Escape, focus trap, and focus restore. */}
            {isAsideHidden && selected != null ? (
              <Dialog
                isOpen={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                purpose="info"
                width={ASIDE_W}
                maxHeight="86vh"
                position={{top: HEADER_H + TABROW_H, right: GUTTER}}>
                <Layout
                  header={
                    <DialogHeader
                      title={FILMS[selected.filmId].title}
                      subtitle={footerLine}
                      onOpenChange={setIsDetailOpen}
                    />
                  }
                  content={<LayoutContent padding={0}>{detail}</LayoutContent>}
                />
              </Dialog>
            ) : null}
          </LayoutContent>
        }
      />
    </div>
  );
}



`;export{e as default};