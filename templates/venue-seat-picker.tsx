// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file venue-seat-picker.tsx
 * @input Deterministic fixtures only: a hand-authored theater (Orpheum Hall)
 *   described as section descriptors — arc center, start radius, row count,
 *   row gap, seats-per-row base + delta, and seat pitch for the fanned
 *   orchestra and the two curved balconies, plus origin/rotation grids for
 *   the four side boxes. Every seat coordinate is derived from those
 *   descriptors at module scope, so no coordinate is hand-typed twice and
 *   nothing is random: sold/held states come from a pure hash of section,
 *   row, and seat indices, and companion seats sit at the authored
 *   accessible-row ends. No clocks, no network assets.
 * @output Venue Seat Map Picker — a ticketing seat-selection page. An SVG
 *   floor plan (581 seats: 14 fanned orchestra rows, a 5-row mezzanine, a
 *   4-row balcony, four side boxes) renders a four-step pricing ramp with a
 *   collapsible legend, a hover/focus HUD naming row, seat, tier, and
 *   price, and a persistent mini-overview. Tapping a section (or pressing
 *   Enter on a seat from the overview) animates the map transform into that
 *   section; the mini-overview shows where you are and taps back out to the
 *   full house. Available seats toggle into a cart rail grouped by tier
 *   with per-tier subtotals, a fees line, and remove buttons that
 *   un-highlight the map. A "best available" control takes a party-size
 *   stepper, deterministically scans ranked fixture rows for the best
 *   contiguous block, selects it with a staggered pulse, and centers the
 *   viewport on the block. Arrow keys walk seats within a row (up/down
 *   across rows) with :focus-visible rings for full keyboard parity.
 * @position Page template; emitted by `astryx template venue-seat-picker`.
 *
 * Frame: header | seat-map stage (LayoutContent, fills; HUD, legend,
 * mini-overview, and phone zoom controls overlay it) | cart rail
 * (LayoutPanel end, 320 / 280 narrow) carrying the best-available finder,
 * the tier-grouped cart, and totals. All state is useState: the selection
 * Set, the zoom target (section id + view box), phone zoom level + pan,
 * the HUD seat, the roving focus seat, legend/sheet collapse flags, party
 * size, and the pulse batch. Every commit is announced through a visually
 * hidden aria-live region.
 *
 * Styling: StyleX pilot — the hand-rolled seat-map pieces use
 * @stylexjs/stylex (stylex.create / stylex.props): seat state ×
 * pricing-tier variants with colocated :hover and :focus-visible rules,
 * prefers-reduced-motion guards on the zoom transition and pulse
 * keyframes, and the <=640px bottom-sheet restructure via @media
 * conditions inside the styles. Astryx components (Layout, Button, Badge,
 * IconButton, EmptyState…) stay chrome and are styled normally. Consumers
 * of this template need @stylexjs/unplugin (or another StyleX compiler) in
 * their build.
 *
 * Container policy: the page chrome is frame-first (Layout header/content/
 * end); the cart rail is flat stacked sections with Dividers, not nested
 * Cards; the map overlays (HUD, legend, mini-overview, bottom sheet) are
 * hand-rolled bounded surfaces because they float over an SVG stage.
 *
 * Color policy: token-pure. Seat fills are color-mix() ramps over
 * var(--color-*) tokens, held seats hatch with a token-stroked SVG
 * pattern, sold seats dim through a token mix, and every stroke/ring is a
 * token. The two overlay drop shadows are explicit light-dark() pairs —
 * the only grep hits, documented here.
 *
 * Responsive contract:
 * - > 960px: map + docked 320px cart rail; the legend floats collapsible
 *   over the map's top-right corner; section tap zooms.
 * - 641–960px: the cart rail narrows to 280px; everything else holds.
 * - <= 640px: the rail is dropped; the legend and cart collapse into a
 *   snap bottom sheet (peek bar with live seat count + total, tap or
 *   Enter to expand — a StyleX @media restructure). Zoom moves to +/−
 *   buttons plus pointer-capture drag panning, and every seat carries an
 *   invisible 26px-diameter halo hit target. Nothing anywhere is
 *   hover-only: hover HUD facts also surface on focus and in aria-labels,
 *   and all controls are >=40px buttons on phones.
 * - The SVG keeps its aspect ratio at every width; at 375px the full house
 *   fits first-screen and the +/− zoom brings seats up to tap size.
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import * as stylex from '@stylexjs/stylex';

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
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  AccessibilityIcon,
  ArmchairIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  TicketIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// GEOMETRY FIXTURES
// ---------------------------------------------------------------------------
// The whole floor plan derives from these descriptors. Arc sections fan
// seats around a shared center behind the stage; box sections are small
// rotated grids. Nothing below ever hand-types a seat coordinate.

const VIEW_W = 1000;
const VIEW_H = 700;
const SEAT_R = 6.6;
/** Invisible hit halo: 13 SVG units ≈ a 26px-diameter target when zoomed. */
const HALO_R = 13;

type TierId = 'premium' | 'preferred' | 'standard' | 'value';
type SeatStatus = 'available' | 'held' | 'sold' | 'companion';

const TIERS: Record<TierId, {label: string; price: number; rank: number}> = {
  premium: {label: 'Premium', price: 129, rank: 0},
  preferred: {label: 'Preferred', price: 96, rank: 1},
  standard: {label: 'Standard', price: 72, rank: 2},
  value: {label: 'Value', price: 48, rank: 3},
};
const TIER_ORDER: TierId[] = ['premium', 'preferred', 'standard', 'value'];

/** Per-ticket service fee — the cart's fees line. */
const SERVICE_FEE = 4.75;
const MAX_SELECTION = 8;
const MAX_PARTY = 6;

const SHOW = {
  venue: 'Orpheum Hall',
  title: 'An Evening of Ballet',
  when: 'Sat, Jul 18 · 7:30 PM',
};

interface ArcSectionSpec {
  kind: 'arc';
  id: string;
  label: string;
  cx: number;
  cy: number;
  radiusStart: number;
  rowGap: number;
  rows: number;
  seatsBase: number;
  seatsDelta: number;
  /** Arc length between seat centers, in SVG units. */
  pitch: number;
  /** `[untilRowExclusive, tier]` bands, front to back. */
  tierBreaks: Array<[number, TierId]>;
  /** Row whose aisle ends carry companion (accessible-adjacent) seats. */
  accessibleRow?: number;
  /** The row "best available" treats as ideal within this section. */
  preferredRow: number;
}

interface BoxSectionSpec {
  kind: 'box';
  id: string;
  label: string;
  originX: number;
  originY: number;
  cols: number;
  rows: number;
  colGap: number;
  rowGap: number;
  /** Grid rotation in degrees; boxes tilt to face the stage. */
  angleDeg: number;
  /** +1 grows the grid rightward, -1 leftward (mirrored house sides). */
  dir: 1 | -1;
  tier: TierId;
  preferredRow: number;
}

type SectionSpec = ArcSectionSpec | BoxSectionSpec;

// prettier-ignore
const SECTIONS: SectionSpec[] = [
  {kind: 'arc', id: 'orchestra', label: 'Orchestra', cx: 500, cy: -180, radiusStart: 320, rowGap: 22, rows: 14, seatsBase: 16, seatsDelta: 1, pitch: 21, tierBreaks: [[5, 'premium'], [10, 'preferred'], [14, 'standard']], accessibleRow: 13, preferredRow: 4},
  {kind: 'arc', id: 'mezzanine', label: 'Mezzanine', cx: 500, cy: -180, radiusStart: 648, rowGap: 21, rows: 5, seatsBase: 26, seatsDelta: 1, pitch: 20, tierBreaks: [[2, 'preferred'], [5, 'standard']], accessibleRow: 0, preferredRow: 0},
  {kind: 'arc', id: 'balcony', label: 'Balcony', cx: 500, cy: -180, radiusStart: 768, rowGap: 21, rows: 4, seatsBase: 22, seatsDelta: 1, pitch: 20, tierBreaks: [[4, 'value']], preferredRow: 0},
  {kind: 'box', id: 'box-a', label: 'Box A', originX: 96, originY: 168, cols: 2, rows: 4, colGap: 26, rowGap: 24, angleDeg: 12, dir: 1, tier: 'premium', preferredRow: 0},
  {kind: 'box', id: 'box-b', label: 'Box B', originX: 82, originY: 318, cols: 2, rows: 4, colGap: 26, rowGap: 24, angleDeg: 6, dir: 1, tier: 'premium', preferredRow: 0},
  {kind: 'box', id: 'box-c', label: 'Box C', originX: 904, originY: 168, cols: 2, rows: 4, colGap: 26, rowGap: 24, angleDeg: -12, dir: -1, tier: 'premium', preferredRow: 0},
  {kind: 'box', id: 'box-d', label: 'Box D', originX: 918, originY: 318, cols: 2, rows: 4, colGap: 26, rowGap: 24, angleDeg: -6, dir: -1, tier: 'premium', preferredRow: 0},
];

// ---------------------------------------------------------------------------
// DERIVED SEAT GEOMETRY (module scope — computed exactly once)
// ---------------------------------------------------------------------------

interface SeatFixture {
  id: string;
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
  rowLabel: string;
  seatNumber: number;
  x: number;
  y: number;
  tier: TierId;
  status: SeatStatus;
  rowKey: string;
  rowPos: number;
}

interface RowFixture {
  key: string;
  sectionId: string;
  rowIndex: number;
  tier: TierId;
  seats: SeatFixture[];
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

/**
 * Pure spread function standing in for a box-office inventory: a hash of
 * section/row/seat indices maps deterministically onto sold (~24%) and
 * held (~7%) states. Same inputs, same house, every render.
 */
function seatStatusHash(sectionIdx: number, row: number, col: number): SeatStatus {
  const h =
    (sectionIdx * 131 + row * 41 + col * 23 + ((row + 1) * (col + 3) * 7) % 53) % 100;
  if (h < 24) {
    return 'sold';
  }
  if (h < 31) {
    return 'held';
  }
  return 'available';
}

function tierForArcRow(spec: ArcSectionSpec, row: number): TierId {
  for (const [until, tier] of spec.tierBreaks) {
    if (row < until) {
      return tier;
    }
  }
  return spec.tierBreaks[spec.tierBreaks.length - 1][1];
}

function buildSeats(): SeatFixture[] {
  const seats: SeatFixture[] = [];
  SECTIONS.forEach((spec, sectionIdx) => {
    if (spec.kind === 'arc') {
      for (let row = 0; row < spec.rows; row++) {
        const radius = spec.radiusStart + row * spec.rowGap;
        const count = spec.seatsBase + row * spec.seatsDelta;
        const step = spec.pitch / radius;
        const start = -((count - 1) / 2) * step;
        const tier = tierForArcRow(spec, row);
        const rowLetter = String.fromCharCode(65 + row);
        for (let col = 0; col < count; col++) {
          const angle = start + col * step;
          const isCompanion =
            spec.accessibleRow === row && (col < 2 || col >= count - 2);
          seats.push({
            id: `${spec.id}-${row}-${col}`,
            sectionId: spec.id,
            sectionLabel: spec.label,
            rowIndex: row,
            rowLabel: rowLetter,
            seatNumber: col + 1,
            x: round1(spec.cx + radius * Math.sin(angle)),
            y: round1(spec.cy + radius * Math.cos(angle)),
            tier,
            status: isCompanion
              ? 'companion'
              : seatStatusHash(sectionIdx, row, col),
            rowKey: `${spec.id}:${row}`,
            rowPos: col,
          });
        }
      }
      return;
    }
    // Box grids: rotate local (col, row) offsets around the box origin.
    const theta = (spec.angleDeg * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    for (let row = 0; row < spec.rows; row++) {
      for (let col = 0; col < spec.cols; col++) {
        const lx = col * spec.colGap * spec.dir;
        const ly = row * spec.rowGap;
        seats.push({
          id: `${spec.id}-${row}-${col}`,
          sectionId: spec.id,
          sectionLabel: spec.label,
          rowIndex: row,
          rowLabel: `${row + 1}`,
          seatNumber: row * spec.cols + col + 1,
          x: round1(spec.originX + lx * cos - ly * sin),
          y: round1(spec.originY + lx * sin + ly * cos),
          tier: spec.tier,
          status: seatStatusHash(sectionIdx, row, col),
          rowKey: `${spec.id}:${row}`,
          rowPos: col,
        });
      }
    }
  });
  return seats;
}

const SEATS: SeatFixture[] = buildSeats();
const SEAT_BY_ID = new Map(SEATS.map(seat => [seat.id, seat]));
const SEAT_COUNT = SEATS.length;

const ROWS: RowFixture[] = (() => {
  const byKey = new Map<string, RowFixture>();
  for (const seat of SEATS) {
    const existing = byKey.get(seat.rowKey);
    if (existing) {
      existing.seats.push(seat);
    } else {
      byKey.set(seat.rowKey, {
        key: seat.rowKey,
        sectionId: seat.sectionId,
        rowIndex: seat.rowIndex,
        tier: seat.tier,
        seats: [seat],
      });
    }
  }
  return [...byKey.values()];
})();
const ROW_BY_KEY = new Map(ROWS.map(row => [row.key, row]));
/** Rows per section, front to back — the keyboard's up/down axis. */
const SECTION_ROWS = new Map<string, RowFixture[]>();
for (const row of ROWS) {
  const list = SECTION_ROWS.get(row.sectionId);
  if (list) {
    list.push(row);
  } else {
    SECTION_ROWS.set(row.sectionId, [row]);
  }
}

/** Section bounding boxes drive tap-to-zoom, hulls, and the mini-overview. */
function computeView(seats: SeatFixture[], padX: number, padY: number): ViewBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const seat of seats) {
    minX = Math.min(minX, seat.x);
    minY = Math.min(minY, seat.y);
    maxX = Math.max(maxX, seat.x);
    maxY = Math.max(maxY, seat.y);
  }
  return {
    x: round1(minX - padX),
    y: round1(minY - padY),
    w: round1(maxX - minX + padX * 2),
    h: round1(maxY - minY + padY * 2),
  };
}

const SECTION_VIEWS: Record<string, ViewBox> = {};
for (const spec of SECTIONS) {
  SECTION_VIEWS[spec.id] = computeView(
    SEATS.filter(seat => seat.sectionId === spec.id),
    30,
    30,
  );
}
const SECTION_HULLS = SECTIONS.map(spec => ({
  id: spec.id,
  label: spec.label,
  view: SECTION_VIEWS[spec.id],
}));

/**
 * Rows ranked for "best available": cheaper tier rank loses to pricier,
 * then distance from each section's preferred row, then house order — a
 * deterministic total order over the fixture.
 */
const RANKED_ROWS: RowFixture[] = [...ROWS].sort((a, b) => {
  const tierDiff = TIERS[a.tier].rank - TIERS[b.tier].rank;
  if (tierDiff !== 0) {
    return tierDiff;
  }
  const specA = SECTIONS.find(spec => spec.id === a.sectionId);
  const specB = SECTIONS.find(spec => spec.id === b.sectionId);
  const distA = Math.abs(a.rowIndex - (specA?.preferredRow ?? 0));
  const distB = Math.abs(b.rowIndex - (specB?.preferredRow ?? 0));
  if (distA !== distB) {
    return distA - distB;
  }
  return a.key.localeCompare(b.key);
});

/**
 * Scan ranked rows for the best contiguous block of `party` selectable
 * seats (available or companion, not already in the cart), preferring the
 * window closest to the row's center. Pure function of fixtures + cart.
 */
function findBestBlock(
  party: number,
  selectedIds: ReadonlySet<string>,
): SeatFixture[] | null {
  for (const row of RANKED_ROWS) {
    if (row.seats.length < party) {
      continue;
    }
    const center = (row.seats.length - 1) / 2;
    let best: {start: number; dist: number} | null = null;
    for (let start = 0; start + party <= row.seats.length; start++) {
      let fits = true;
      for (let i = start; i < start + party; i++) {
        const seat = row.seats[i];
        const selectable =
          seat.status === 'available' || seat.status === 'companion';
        if (!selectable || selectedIds.has(seat.id)) {
          fits = false;
          break;
        }
      }
      if (!fits) {
        continue;
      }
      const dist = Math.abs(start + (party - 1) / 2 - center);
      if (best == null || dist < best.dist) {
        best = {start, dist};
      }
    }
    if (best != null) {
      return row.seats.slice(best.start, best.start + party);
    }
  }
  return null;
}

/** Default roving-focus seat: the most central available orchestra A seat. */
const DEFAULT_FOCUS_SEAT: SeatFixture = (() => {
  const frontRow = ROW_BY_KEY.get('orchestra:0');
  const seats = frontRow?.seats ?? SEATS;
  const center = (seats.length - 1) / 2;
  let best = seats[0];
  for (const seat of seats) {
    if (
      seat.status === 'available' &&
      Math.abs(seat.rowPos - center) < Math.abs(best.rowPos - center)
    ) {
      best = seat;
    }
  }
  return best;
})();

function viewScale(view: ViewBox, maxScale: number): number {
  return Math.min(maxScale, Math.min(VIEW_W / view.w, VIEW_H / view.h));
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function seatFullLabel(seat: SeatFixture): string {
  const place =
    seat.sectionId.startsWith('box')
      ? `${seat.sectionLabel} seat ${seat.seatNumber}`
      : `${seat.sectionLabel} row ${seat.rowLabel} seat ${seat.seatNumber}`;
  return place;
}

const STATUS_LABELS: Record<SeatStatus, string> = {
  available: 'available',
  held: 'held by another buyer',
  sold: 'sold',
  companion: 'companion seat, available',
};

const PHONE_ZOOMS = [1, 1.6, 2.4, 3.6];

// ---------------------------------------------------------------------------
// STYLEX — seat variants, overlays, and the phone bottom-sheet restructure
// ---------------------------------------------------------------------------
// The combinatorial surface (seat status × tier, each with colocated
// :hover / :focus-visible, plus @media restructures) is exactly what the
// StyleX pilot is for. Every color is a var(--color-*) token or a
// color-mix() over tokens; shadows are explicit light-dark() pairs.

const pulse = stylex.keyframes({
  '0%': {transform: 'scale(1)'},
  '45%': {transform: 'scale(1.65)'},
  '100%': {transform: 'scale(1)'},
});

// Token-pure color constants (StyleX constant-folds these at build time).
// The four-step ramp mixes one chart token toward the page background so
// every step re-derives per color scheme; hovers lift toward text-primary.
// The categorical chart token is not defined by every theme, and one
// unresolved var() invalidates the whole color-mix(), so it falls back to
// the always-defined icon-green token.
const RAMP_1 = 'color-mix(in oklab, var(--color-data-categorical-green, var(--color-icon-green)) 88%, var(--color-background-body))';
const RAMP_2 = 'color-mix(in oklab, var(--color-data-categorical-green, var(--color-icon-green)) 62%, var(--color-background-body))';
const RAMP_3 = 'color-mix(in oklab, var(--color-data-categorical-green, var(--color-icon-green)) 42%, var(--color-background-body))';
const RAMP_4 = 'color-mix(in oklab, var(--color-data-categorical-green, var(--color-icon-green)) 24%, var(--color-background-body))';
const HOVER_LIFT = 'color-mix(in oklab, var(--color-text-primary) 20%, ';
const SOLD_FILL = 'color-mix(in oklab, var(--color-text-secondary) 24%, var(--color-background-body))';
const COMPANION_FILL = 'color-mix(in oklab, var(--color-accent) 16%, var(--color-background-body))';
const FAINT_RIM = 'color-mix(in srgb, var(--color-text-primary) 16%, transparent)';

const styles = stylex.create({
  mapShell: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    // <=640px: leave room for the bottom sheet's peek bar.
    paddingBottom: {default: 0, '@media (max-width: 640px)': '96px'},
  },
  mapSvg: {display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default'},
  mapSvgPannable: {cursor: 'grab'},
  mapSvgPanning: {cursor: 'grabbing', userSelect: 'none'},
  // The "transition-wrapped transform": section zoom animates this group.
  zoomGroup: {
    transitionProperty: 'transform',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDuration: {default: '560ms', '@media (prefers-reduced-motion: reduce)': '0ms'},
  },
  zoomGroupInstant: {transitionDuration: '0ms'},
  // Section hulls: tappable slabs beneath the seats at overview zoom.
  hull: {
    cursor: 'pointer',
    fill: {
      default: 'color-mix(in oklab, var(--color-background-muted) 62%, transparent)',
      ':hover': 'color-mix(in oklab, var(--color-background-muted) 92%, transparent)',
    },
    transitionProperty: 'fill',
    transitionDuration: '160ms',
  },
  hullInactive: {
    cursor: 'default',
    pointerEvents: 'none',
    fill: {
      default: 'color-mix(in oklab, var(--color-background-muted) 40%, transparent)',
      ':hover': 'color-mix(in oklab, var(--color-background-muted) 40%, transparent)',
    },
  },
  // --- seat base + status × tier variants (the StyleX pilot's case) ---------
  seat: {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transitionProperty: 'transform, fill',
    transitionDuration: {default: '150ms', '@media (prefers-reduced-motion: reduce)': '0ms'},
    strokeWidth: 0.8,
    stroke: FAINT_RIM,
    outlineWidth: '2px',
    outlineOffset: '2px',
    outlineColor: 'var(--color-text-primary)',
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
  },
  seatInteractive: {cursor: 'pointer', transform: {default: 'scale(1)', ':hover': 'scale(1.35)'}},
  tierPremium: {fill: {default: RAMP_1, ':hover': HOVER_LIFT + RAMP_1 + ')'}},
  tierPreferred: {fill: {default: RAMP_2, ':hover': HOVER_LIFT + RAMP_2 + ')'}},
  tierStandard: {fill: {default: RAMP_3, ':hover': HOVER_LIFT + RAMP_3 + ')'}},
  tierValue: {fill: {default: RAMP_4, ':hover': HOVER_LIFT + RAMP_4 + ')'}},
  seatHeld: {
    fill: {default: 'url(#vsp-hold-hatch)', ':hover': 'url(#vsp-hold-hatch)'},
    cursor: 'not-allowed',
    transform: {default: 'scale(1)', ':hover': 'scale(1)'},
  },
  seatSold: {
    fill: {default: SOLD_FILL, ':hover': SOLD_FILL},
    cursor: 'default',
    opacity: 0.55,
    transform: {default: 'scale(1)', ':hover': 'scale(1)'},
  },
  seatCompanion: {
    fill: {
      default: COMPANION_FILL,
      ':hover': 'color-mix(in oklab, var(--color-accent) 34%, var(--color-background-body))',
    },
    stroke: 'var(--color-accent)',
    strokeWidth: 1.4,
    strokeDasharray: '2.4 1.8',
  },
  seatSelected: {
    fill: {default: 'var(--color-accent)', ':hover': 'var(--color-accent)'},
    stroke: 'var(--color-text-primary)',
    strokeWidth: 1.6,
    strokeDasharray: 'none',
    transform: {default: 'scale(1.18)', ':hover': 'scale(1.3)'},
  },
  seatPulse: {
    animationName: {default: pulse, '@media (prefers-reduced-motion: reduce)': 'none'},
    animationDuration: '700ms',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 1,
    animationFillMode: 'backwards',
  },
  // --- overlays ---------------------------------------------------------------
  hud: {
    position: 'absolute',
    top: '12px',
    insetInlineStart: '12px',
    maxWidth: 'min(340px, calc(100% - 24px))',
    paddingInline: '12px',
    paddingBlock: '8px',
    borderRadius: '10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
    backdropFilter: 'blur(4px)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  legendPanel: {
    position: 'absolute',
    top: '12px',
    insetInlineEnd: '12px',
    width: '212px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: '0 8px 24px light-dark(rgba(20, 24, 32, 0.14), rgba(0, 0, 0, 0.5))',
    zIndex: 2,
    // <=640px the legend lives inside the bottom sheet instead.
    display: {default: 'block', '@media (max-width: 640px)': 'none'},
  },
  legendToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    minHeight: '40px',
    paddingInline: '12px',
    paddingBlock: '8px',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    font: 'inherit',
    cursor: 'pointer',
    outlineColor: 'var(--color-accent)',
  },
  legendBody: {paddingInline: '12px', paddingBottom: '12px'},
  legendRow: {display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px'},
  swatch: {
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    flexShrink: 0,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: FAINT_RIM,
  },
  swatchPremium: {backgroundColor: RAMP_1},
  swatchPreferred: {backgroundColor: RAMP_2},
  swatchStandard: {backgroundColor: RAMP_3},
  swatchValue: {backgroundColor: RAMP_4},
  swatchHeld: {
    backgroundImage:
      'repeating-linear-gradient(45deg, var(--color-warning) 0 2px, var(--color-background-muted) 2px 5px)',
  },
  swatchSold: {backgroundColor: SOLD_FILL, opacity: 0.55},
  swatchCompanion: {backgroundColor: COMPANION_FILL, borderStyle: 'dashed', borderColor: 'var(--color-accent)'},
  swatchSelected: {backgroundColor: 'var(--color-accent)'},
  miniMap: {
    position: 'absolute',
    bottom: {default: '12px', '@media (max-width: 640px)': '108px'},
    insetInlineStart: '12px',
    padding: '6px',
    borderRadius: '10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'color-mix(in srgb, var(--color-background-body) 90%, transparent)',
    cursor: 'pointer',
    zIndex: 2,
    outlineColor: 'var(--color-accent)',
  },
  zoomControls: {
    position: 'absolute',
    bottom: '108px',
    insetInlineEnd: '12px',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 2,
    // The +/− cluster is the <=640px zoom affordance only.
    display: {default: 'none', '@media (max-width: 640px)': 'flex'},
  },
  zoomButton: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: {default: 'var(--color-background-body)', ':hover': 'var(--color-accent-muted)'},
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    outlineColor: 'var(--color-accent)',
  },
  zoomButtonDisabled: {opacity: 0.4, cursor: 'default'},
  // --- phone bottom sheet (the @media restructure) -----------------------------
  sheet: {
    position: 'fixed',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    bottom: 0,
    zIndex: 30,
    borderStartStartRadius: '16px',
    borderStartEndRadius: '16px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: '0 -8px 28px light-dark(rgba(20, 24, 32, 0.16), rgba(0, 0, 0, 0.55))',
    overflow: 'hidden',
    transitionProperty: 'height',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDuration: {default: '320ms', '@media (prefers-reduced-motion: reduce)': '0ms'},
    height: '96px',
    // Desktop: the sheet does not exist — the cart docks as a LayoutPanel.
    display: {default: 'none', '@media (max-width: 640px)': 'block'},
  },
  sheetExpanded: {height: 'min(72dvh, 540px)'},
  sheetHandle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    minHeight: '56px',
    paddingInline: '16px',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    font: 'inherit',
    cursor: 'pointer',
    outlineColor: 'var(--color-accent)',
  },
  sheetGrip: {
    position: 'absolute',
    top: '6px',
    insetInlineStart: '50%',
    transform: 'translateX(-50%)',
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: 'var(--color-border)',
  },
  sheetBody: {height: 'calc(100% - 56px)', overflowY: 'auto', paddingInline: '16px', paddingBottom: '24px'},
  // --- misc ---------------------------------------------------------------------
  railScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  cartSeatRow: {display: 'flex', alignItems: 'center', gap: '8px', minHeight: '36px'},
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
});

const TIER_SEAT_STYLE: Record<TierId, stylex.StyleXStyles> = {
  premium: styles.tierPremium,
  preferred: styles.tierPreferred,
  standard: styles.tierStandard,
  value: styles.tierValue,
};

const TIER_SWATCH_STYLE: Record<TierId, stylex.StyleXStyles> = {
  premium: styles.swatchPremium,
  preferred: styles.swatchPreferred,
  standard: styles.swatchStandard,
  value: styles.swatchValue,
};

// ---------------------------------------------------------------------------
// SEAT DOT
// ---------------------------------------------------------------------------

/**
 * One seat: an invisible halo circle (the 26px hit target) under the
 * visible, focusable circle. Memoized so hover-HUD churn doesn't re-render
 * all 581 seats.
 */
const SeatDot = memo(function SeatDot({
  seat,
  isSelected,
  isFocusTarget,
  pulseIndex,
  pulseStamp,
  onActivate,
  onHover,
  onHoverEnd,
  onSeatFocus,
}: {
  seat: SeatFixture;
  isSelected: boolean;
  isFocusTarget: boolean;
  pulseIndex: number;
  pulseStamp: number;
  onActivate: (seat: SeatFixture) => void;
  onHover: (seat: SeatFixture) => void;
  onHoverEnd: (seat: SeatFixture) => void;
  onSeatFocus: (seat: SeatFixture) => void;
}) {
  const selectable = seat.status === 'available' || seat.status === 'companion';
  const statusStyle =
    seat.status === 'held'
      ? styles.seatHeld
      : seat.status === 'sold'
        ? styles.seatSold
        : seat.status === 'companion'
          ? styles.seatCompanion
          : null;
  return (
    <g
      data-vsp-seat
      onClick={() => onActivate(seat)}
      onPointerEnter={() => onHover(seat)}
      onPointerLeave={() => onHoverEnd(seat)}>
      <circle cx={seat.x} cy={seat.y} r={HALO_R} fill="transparent" aria-hidden />
      <circle
        // Re-keying only pulsed seats restarts the stagger animation.
        key={pulseIndex >= 0 ? `pulse-${pulseStamp}` : 'seat'}
        id={`vsp-seat-${seat.id}`}
        cx={seat.x}
        cy={seat.y}
        r={SEAT_R}
        role="button"
        tabIndex={isFocusTarget ? 0 : -1}
        aria-label={`${seatFullLabel(seat)} — ${TIERS[seat.tier].label} $${TIERS[seat.tier].price}, ${
          isSelected ? 'in cart' : STATUS_LABELS[seat.status]
        }`}
        aria-pressed={isSelected}
        aria-disabled={!selectable || undefined}
        onFocus={() => onSeatFocus(seat)}
        {...stylex.props(
          styles.seat,
          TIER_SEAT_STYLE[seat.tier],
          selectable && styles.seatInteractive,
          statusStyle,
          isSelected && styles.seatSelected,
          pulseIndex >= 0 && styles.seatPulse,
        )}
        style={pulseIndex >= 0 ? {animationDelay: `${pulseIndex * 70}ms`} : undefined}
      />
    </g>
  );
});

// ---------------------------------------------------------------------------
// LEGEND
// ---------------------------------------------------------------------------

const STATUS_LEGEND: Array<{style: stylex.StyleXStyles; label: string; hasIcon?: boolean}> = [
  {style: styles.swatchSelected, label: 'In your cart'},
  {style: styles.swatchHeld, label: 'Held by another buyer'},
  {style: styles.swatchSold, label: 'Sold'},
  {style: styles.swatchCompanion, label: 'Companion seat', hasIcon: true},
];

/** Tier ramp + seat-state key; rendered in the overlay and the sheet. */
function LegendBody() {
  return (
    <VStack gap={1}>
      {TIER_ORDER.map(tier => (
        <div key={tier} {...stylex.props(styles.legendRow)}>
          <span {...stylex.props(styles.swatch, TIER_SWATCH_STYLE[tier])} />
          <StackItem size="fill">
            <Text type="supporting" size="sm" color="secondary">
              {TIERS[tier].label}
            </Text>
          </StackItem>
          <Text type="supporting" size="sm" hasTabularNumbers>
            ${TIERS[tier].price}
          </Text>
        </div>
      ))}
      <Divider />
      {STATUS_LEGEND.map(entry => (
        <div key={entry.label} {...stylex.props(styles.legendRow)}>
          <span {...stylex.props(styles.swatch, entry.style)} />
          {entry.hasIcon === true && (
            <Icon icon={AccessibilityIcon} size="xsm" color="secondary" />
          )}
          <Text type="supporting" size="sm" color="secondary">
            {entry.label}
          </Text>
        </div>
      ))}
      <Text type="supporting" size="sm" color="secondary">
        Arrow keys walk a row · Enter selects
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// MINI OVERVIEW
// ---------------------------------------------------------------------------

/**
 * Persistent thumbnail of the whole house. The accent rectangle traces the
 * current viewport, the active section fills in, and tapping it exits zoom.
 */
function MiniOverview({
  activeSectionId,
  visible,
  isZoomed,
  onExit,
}: {
  activeSectionId: string | null;
  visible: ViewBox | null;
  isZoomed: boolean;
  onExit: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={
        isZoomed ? 'Overview map — tap to exit zoom' : 'Overview map — showing full theater'
      }
      onClick={onExit}
      {...stylex.props(styles.miniMap)}>
      <svg width={128} height={90} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden>
        <rect
          x={330}
          y={16}
          width={340}
          height={38}
          rx={10}
          fill="var(--color-background-muted)"
          stroke="var(--color-border)"
        />
        {SECTION_HULLS.map(hull => (
          <rect
            key={hull.id}
            x={hull.view.x}
            y={hull.view.y}
            width={hull.view.w}
            height={hull.view.h}
            rx={16}
            fill={
              hull.id === activeSectionId
                ? 'color-mix(in oklab, var(--color-accent) 45%, var(--color-background-muted))'
                : 'var(--color-background-muted)'
            }
            stroke="var(--color-border)"
            strokeWidth={3}
          />
        ))}
        {visible != null && (
          <rect
            x={visible.x}
            y={visible.y}
            width={visible.w}
            height={visible.h}
            rx={12}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={10}
          />
        )}
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// BEST AVAILABLE + CART (shared by the desktop rail and the phone sheet)
// ---------------------------------------------------------------------------

function BestAvailablePanel({
  partySize,
  onPartyChange,
  onFind,
}: {
  partySize: number;
  onPartyChange: (next: number) => void;
  onFind: () => void;
}) {
  return (
    <VStack gap={2}>
      <Text type="label" size="sm" color="secondary">
        Best available
      </Text>
      <HStack gap={2} vAlign="center">
        <IconButton
          label="Fewer seats"
          icon={<Icon icon={MinusIcon} size="sm" />}
          variant="secondary"
          size="sm"
          isDisabled={partySize <= 1}
          onClick={() => onPartyChange(partySize - 1)}
        />
        <Text type="body" weight="semibold" hasTabularNumbers>
          {partySize}
        </Text>
        <IconButton
          label="More seats"
          icon={<Icon icon={PlusIcon} size="sm" />}
          variant="secondary"
          size="sm"
          isDisabled={partySize >= MAX_PARTY}
          onClick={() => onPartyChange(partySize + 1)}
        />
        <StackItem size="fill">
          <Button
            label={`Find ${partySize} together`}
            size="sm"
            icon={<Icon icon={SparklesIcon} size="sm" />}
            onClick={onFind}
          />
        </StackItem>
      </HStack>
      <Text type="supporting" size="sm" color="secondary">
        Scans ranked rows for the best contiguous block and pulses the picks.
      </Text>
    </VStack>
  );
}

interface CartGroup {
  tier: TierId;
  seats: SeatFixture[];
  subtotal: number;
}

function CartBody({
  groups,
  seatTotal,
  onRemove,
  onClear,
}: {
  groups: CartGroup[];
  seatTotal: number;
  onRemove: (seat: SeatFixture) => void;
  onClear: () => void;
}) {
  if (seatTotal === 0) {
    return (
      <EmptyState
        icon={<Icon icon={ArmchairIcon} size="lg" />}
        title="No seats yet"
        description="Tap a section to zoom in, then tap green seats to add them — or let Best available pick a block for you."
        isCompact
      />
    );
  }
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const fees = seatTotal * SERVICE_FEE;
  const totalRows: Array<[string, number, boolean]> = [
    ['Subtotal', subtotal, false],
    [`Service fees · ${seatTotal} × ${formatMoney(SERVICE_FEE)}`, fees, false],
    ['Total', subtotal + fees, true],
  ];
  return (
    <VStack gap={3}>
      {groups.map(group => (
        <VStack gap={1} key={group.tier}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                {TIERS[group.tier].label} · {group.seats.length} ×{' '}
                {formatMoney(TIERS[group.tier].price)}
              </Text>
            </StackItem>
            <Text type="supporting" size="sm" hasTabularNumbers>
              {formatMoney(group.subtotal)}
            </Text>
          </HStack>
          {group.seats.map(seat => (
            <div key={seat.id} {...stylex.props(styles.cartSeatRow)}>
              <StackItem size="fill">
                <Text type="body" size="sm">
                  {seatFullLabel(seat)}
                </Text>
              </StackItem>
              {seat.status === 'companion' && (
                <Icon icon={AccessibilityIcon} size="sm" color="secondary" />
              )}
              <IconButton
                label={`Remove ${seatFullLabel(seat)}`}
                icon={<Icon icon={Trash2Icon} size="sm" />}
                variant="ghost"
                size="sm"
                onClick={() => onRemove(seat)}
              />
            </div>
          ))}
        </VStack>
      ))}
      <Divider />
      <VStack gap={1}>
        {totalRows.map(([label, amount, isTotal]) => (
          <HStack gap={2} vAlign="center" key={label}>
            <StackItem size="fill">
              <Text
                type={isTotal ? 'body' : 'supporting'}
                weight={isTotal ? 'semibold' : undefined}
                color={isTotal ? undefined : 'secondary'}>
                {label}
              </Text>
            </StackItem>
            <Text
              type={isTotal ? 'body' : 'supporting'}
              weight={isTotal ? 'semibold' : undefined}
              hasTabularNumbers>
              {formatMoney(amount)}
            </Text>
          </HStack>
        ))}
      </VStack>
      <HStack gap={2} vAlign="center">
        <Button
          label="Clear all"
          variant="ghost"
          size="sm"
          onClick={onClear}
        />
        <StackItem size="fill" />
        <Button
          label={`Checkout ${seatTotal} seat${seatTotal === 1 ? '' : 's'}`}
          size="sm"
          icon={<Icon icon={TicketIcon} size="sm" />}
        />
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface ZoomState {
  sectionId: string;
  view: ViewBox;
  maxScale: number;
}

export default function VenueSeatPickerTemplate() {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  const [phoneZoomIdx, setPhoneZoomIdx] = useState(0);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [isPanning, setIsPanning] = useState(false);
  const [hudSeat, setHudSeat] = useState<SeatFixture | null>(null);
  const [focusSeatId, setFocusSeatId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [pulseBatch, setPulseBatch] = useState<{stamp: number; ids: string[]}>({
    stamp: 0,
    ids: [],
  });
  const [announcement, setAnnouncement] = useState('');

  const svgRef = useRef<SVGSVGElement | null>(null);
  // Latest-selection mirror so seat callbacks stay identity-stable for the
  // memoized SeatDots without doing side effects inside state updaters.
  const selectedRef = useRef(selectedIds);
  selectedRef.current = selectedIds;
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    unitsPerPx: number;
  } | null>(null);

  // Responsive contract: <=960px narrows the rail; <=640px drops it for the
  // StyleX bottom sheet and switches zoom to +/− buttons + drag panning.
  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ---- current transform (one pipeline for both zoom modes) ----
  const phoneScale = PHONE_ZOOMS[phoneZoomIdx];
  const scale = isPhone ? phoneScale : zoom != null ? viewScale(zoom.view, zoom.maxScale) : 1;
  const center =
    !isPhone && zoom != null
      ? {x: zoom.view.x + zoom.view.w / 2, y: zoom.view.y + zoom.view.h / 2}
      : {x: VIEW_W / 2, y: VIEW_H / 2};
  const isZoomed = scale > 1.001;
  const zoomCss = isZoomed
    ? `translate(${round1(pan.x)}px, ${round1(pan.y)}px) translate(${VIEW_W / 2}px, ${
        VIEW_H / 2
      }px) scale(${Math.round(scale * 1000) / 1000}) translate(${-round1(center.x)}px, ${-round1(
        center.y,
      )}px)`
    : 'none';

  /** Viewport rectangle in map coordinates — feeds the mini-overview. */
  const visibleBox: ViewBox | null = isZoomed
    ? {
        x: round1(center.x - pan.x / scale - VIEW_W / scale / 2),
        y: round1(center.y - pan.y / scale - VIEW_H / scale / 2),
        w: round1(VIEW_W / scale),
        h: round1(VIEW_H / scale),
      }
    : null;

  // ---- derived cart ----
  const cartGroups = useMemo<CartGroup[]>(() => {
    const groups: CartGroup[] = [];
    for (const tier of TIER_ORDER) {
      const seats = [...selectedIds]
        .flatMap(id => {
          const seat = SEAT_BY_ID.get(id);
          return seat != null && seat.tier === tier ? [seat] : [];
        })
        .sort((a, b) => a.id.localeCompare(b.id));
      if (seats.length > 0) {
        groups.push({
          tier,
          seats,
          subtotal: seats.length * TIERS[tier].price,
        });
      }
    }
    return groups;
  }, [selectedIds]);
  const seatTotal = selectedIds.size;
  const cartTotal =
    cartGroups.reduce((sum, group) => sum + group.subtotal, 0) +
    seatTotal * SERVICE_FEE;

  const pulseIndexById = useMemo(() => {
    const map = new Map<string, number>();
    pulseBatch.ids.forEach((id, index) => map.set(id, index));
    return map;
  }, [pulseBatch]);

  // ---- zoom + pan ----
  const resetView = useCallback(() => {
    setZoom(null);
    setPhoneZoomIdx(0);
    setPan({x: 0, y: 0});
    setAnnouncement('Showing the full theater');
  }, []);

  const zoomToSection = useCallback((sectionId: string) => {
    const spec = SECTIONS.find(section => section.id === sectionId);
    setZoom({sectionId, view: SECTION_VIEWS[sectionId], maxScale: 3});
    setPan({x: 0, y: 0});
    setAnnouncement(`Zoomed to ${spec?.label ?? sectionId}`);
  }, []);

  const stepPhoneZoom = useCallback(
    (delta: number) => {
      const next = Math.min(
        PHONE_ZOOMS.length - 1,
        Math.max(0, phoneZoomIdx + delta),
      );
      setPhoneZoomIdx(next);
      if (next === 0) {
        setPan({x: 0, y: 0});
      }
    },
    [phoneZoomIdx],
  );

  const handlePanStart = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isZoomed) {
      return;
    }
    if ((event.target as Element).closest('[data-vsp-seat]') != null) {
      return;
    }
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) {
      return;
    }
    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
      unitsPerPx: VIEW_W / rect.width,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePanMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = panRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    const limit = 520 * scale;
    const clamp = (value: number) => Math.min(limit, Math.max(-limit, value));
    setPan({
      x: clamp(drag.panX + (event.clientX - drag.startX) * drag.unitsPerPx),
      y: clamp(drag.panY + (event.clientY - drag.startY) * drag.unitsPerPx),
    });
  };

  const handlePanEnd = () => {
    panRef.current = null;
    setIsPanning(false);
  };

  // ---- selection ----
  const toggleSeat = useCallback((seat: SeatFixture) => {
    if (seat.status === 'sold') {
      setAnnouncement(`${seatFullLabel(seat)} is sold`);
      return;
    }
    if (seat.status === 'held') {
      setAnnouncement(`${seatFullLabel(seat)} is held by another buyer`);
      return;
    }
    const next = new Set(selectedRef.current);
    if (next.has(seat.id)) {
      next.delete(seat.id);
      setAnnouncement(
        `Removed ${seatFullLabel(seat)}. ${next.size} seat${
          next.size === 1 ? '' : 's'
        } in cart.`,
      );
    } else if (next.size >= MAX_SELECTION) {
      setAnnouncement(`Selection limit is ${MAX_SELECTION} seats`);
      return;
    } else {
      next.add(seat.id);
      setAnnouncement(
        `Added ${seatFullLabel(seat)} — ${TIERS[seat.tier].label} $${
          TIERS[seat.tier].price
        }. ${next.size} seat${next.size === 1 ? '' : 's'} in cart.`,
      );
    }
    setSelectedIds(next);
  }, []);

  /**
   * Seat activation: from the desktop overview a tap zooms the seat's
   * section (seats are still map-scale); once zoomed — or on phones, where
   * +/− owns zoom — taps toggle the seat itself.
   */
  const activateSeat = useCallback(
    (seat: SeatFixture) => {
      if (!isPhone && zoom == null) {
        zoomToSection(seat.sectionId);
        return;
      }
      toggleSeat(seat);
    },
    [isPhone, zoom, zoomToSection, toggleSeat],
  );

  const clearCart = useCallback(() => {
    setSelectedIds(new Set());
    setAnnouncement('Cart cleared');
  }, []);

  // ---- hover / focus HUD ----
  const handleHover = useCallback((seat: SeatFixture) => {
    setHudSeat(seat);
  }, []);
  const handleHoverEnd = useCallback((seat: SeatFixture) => {
    setHudSeat(prev => (prev != null && prev.id === seat.id ? null : prev));
  }, []);
  const handleSeatFocus = useCallback((seat: SeatFixture) => {
    setFocusSeatId(seat.id);
    setHudSeat(seat);
  }, []);

  // ---- best available ----
  const findBest = useCallback(() => {
    const block = findBestBlock(partySize, selectedIds);
    if (block == null) {
      setAnnouncement(
        `No block of ${partySize} adjacent seats is available — try a smaller party`,
      );
      return;
    }
    if (selectedIds.size + block.length > MAX_SELECTION) {
      setAnnouncement(
        `Adding ${block.length} seats would pass the ${MAX_SELECTION}-seat limit`,
      );
      return;
    }
    const first = block[0];
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const seat of block) {
        next.add(seat.id);
      }
      return next;
    });
    setPulseBatch(prev => ({stamp: prev.stamp + 1, ids: block.map(seat => seat.id)}));
    // Center the viewport on the block: a tight view box on desktop, a
    // pan offset at a fixed phone zoom level on phones.
    const blockView = computeView(block, 90, 70);
    if (isPhone) {
      const zoomLevel = 2;
      const z = PHONE_ZOOMS[zoomLevel];
      const bx = blockView.x + blockView.w / 2;
      const by = blockView.y + blockView.h / 2;
      setPhoneZoomIdx(zoomLevel);
      setPan({x: (VIEW_W / 2 - bx) * z, y: (VIEW_H / 2 - by) * z});
    } else {
      setZoom({sectionId: first.sectionId, view: blockView, maxScale: 3.4});
      setPan({x: 0, y: 0});
    }
    setFocusSeatId(first.id);
    setAnnouncement(
      `Best available: ${block.length} seats in ${first.sectionLabel} row ${first.rowLabel}, starting at seat ${first.seatNumber}`,
    );
  }, [partySize, selectedIds, isPhone]);

  // Move DOM focus onto the first pulsed seat once the batch renders.
  useEffect(() => {
    if (pulseBatch.ids.length > 0) {
      document.getElementById(`vsp-seat-${pulseBatch.ids[0]}`)?.focus();
    }
  }, [pulseBatch]);

  // ---- keyboard seat walking ----
  const focusSeatDom = useCallback((seat: SeatFixture) => {
    setFocusSeatId(seat.id);
    document.getElementById(`vsp-seat-${seat.id}`)?.focus();
  }, []);

  const handleMapKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    const currentId = focusSeatId ?? DEFAULT_FOCUS_SEAT.id;
    const seat = SEAT_BY_ID.get(currentId);
    if (seat == null) {
      return;
    }
    const row = ROW_BY_KEY.get(seat.rowKey);
    if (row == null) {
      return;
    }
    const moveWithinRow = (delta: number) => {
      const next = row.seats[seat.rowPos + delta];
      if (next != null) {
        focusSeatDom(next);
      }
    };
    const moveAcrossRows = (delta: number) => {
      const rows = SECTION_ROWS.get(seat.sectionId) ?? [];
      const rowIdx = rows.findIndex(candidate => candidate.key === row.key);
      const target = rows[rowIdx + delta];
      if (target == null) {
        return;
      }
      // Keep the relative row position so walking up an arc stays put.
      const ratio =
        row.seats.length > 1 ? seat.rowPos / (row.seats.length - 1) : 0.5;
      const pos = Math.min(
        target.seats.length - 1,
        Math.max(0, Math.round(ratio * (target.seats.length - 1))),
      );
      focusSeatDom(target.seats[pos]);
    };
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveWithinRow(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveWithinRow(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveAcrossRows(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveAcrossRows(-1);
        break;
      case 'Home':
        event.preventDefault();
        focusSeatDom(row.seats[0]);
        break;
      case 'End':
        event.preventDefault();
        focusSeatDom(row.seats[row.seats.length - 1]);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activateSeat(seat);
        break;
      case 'Escape':
        event.preventDefault();
        resetView();
        break;
      default:
        break;
    }
  };

  // ---- map stage ----
  const focusTargetId = focusSeatId ?? DEFAULT_FOCUS_SEAT.id;
  const hullsInteractive = !isPhone && zoom == null;

  const mapStage = (
    <div {...stylex.props(styles.mapShell)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={`Seat map of ${SHOW.venue} — ${SEAT_COUNT} seats`}
        aria-describedby="vsp-map-keys"
        onKeyDown={handleMapKeyDown}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
        {...stylex.props(
          styles.mapSvg,
          isZoomed && styles.mapSvgPannable,
          isPanning && styles.mapSvgPanning,
        )}>
        <defs>
          {/* Held seats hatch with token strokes so the stripes re-derive
              per color scheme. */}
          <pattern
            id="vsp-hold-hatch"
            width={4}
            height={4}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)">
            <rect width={4} height={4} fill="var(--color-background-muted)" />
            <line x1={0} y1={0} x2={0} y2={4} stroke="var(--color-warning)" strokeWidth={1.6} />
          </pattern>
        </defs>
        <g
          style={{transform: zoomCss}}
          {...stylex.props(styles.zoomGroup, isPanning && styles.zoomGroupInstant)}>
          {/* Stage */}
          <rect
            x={330}
            y={16}
            width={340}
            height={40}
            rx={10}
            fill="var(--color-background-muted)"
            stroke="var(--color-border)"
          />
          <text
            x={500}
            y={42}
            textAnchor="middle"
            fontSize={15}
            fontWeight={600}
            letterSpacing={4}
            fill="var(--color-text-secondary)">
            STAGE
          </text>
          {/* Section hulls: tap-to-zoom targets, silhouettes, and labels. */}
          {SECTION_HULLS.map(hull => (
            <rect
              key={hull.id}
              x={hull.view.x}
              y={hull.view.y}
              width={hull.view.w}
              height={hull.view.h}
              rx={14}
              aria-label={`Zoom to ${hull.label}`}
              role={hullsInteractive ? 'button' : undefined}
              onClick={hullsInteractive ? () => zoomToSection(hull.id) : undefined}
              {...stylex.props(styles.hull, !hullsInteractive && styles.hullInactive)}
            />
          ))}
          {/* Seats */}
          {SEATS.map(seat => (
            <SeatDot
              key={seat.id}
              seat={seat}
              isSelected={selectedIds.has(seat.id)}
              isFocusTarget={seat.id === focusTargetId}
              pulseIndex={pulseIndexById.get(seat.id) ?? -1}
              pulseStamp={pulseBatch.stamp}
              onActivate={activateSeat}
              onHover={handleHover}
              onHoverEnd={handleHoverEnd}
              onSeatFocus={handleSeatFocus}
            />
          ))}
          {/* Section labels paint after the seats: the curved sections
              interleave, so a token-halo keeps the letters readable where
              a neighboring row runs under them. */}
          {SECTION_HULLS.map(hull => (
            <text
              key={hull.id}
              x={hull.view.x + hull.view.w / 2}
              y={hull.view.y + 16}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              letterSpacing={1.2}
              fill="var(--color-text-secondary)"
              stroke="var(--color-background-body)"
              strokeWidth={3}
              paintOrder="stroke"
              pointerEvents="none">
              {hull.label.toUpperCase()}
            </text>
          ))}
        </g>
      </svg>

      {/* Row/seat/price HUD — driven by hover AND keyboard focus. */}
      {hudSeat != null && (
        <div {...stylex.props(styles.hud)} aria-hidden>
          <VStack gap={0}>
            <Text type="body" size="sm" weight="semibold">
              {seatFullLabel(hudSeat)}
            </Text>
            <Text type="supporting" size="sm" color="secondary">
              {TIERS[hudSeat.tier].label} · ${TIERS[hudSeat.tier].price} ·{' '}
              {selectedIds.has(hudSeat.id) ? 'in cart' : STATUS_LABELS[hudSeat.status]}
            </Text>
          </VStack>
        </div>
      )}

      {/* Collapsible legend overlay (desktop; the sheet carries it on phones). */}
      <div {...stylex.props(styles.legendPanel)}>
        <button
          type="button"
          aria-expanded={legendOpen}
          onClick={() => setLegendOpen(open => !open)}
          {...stylex.props(styles.legendToggle)}>
          <Text type="label" size="sm">
            Pricing &amp; legend
          </Text>
          <Icon icon={legendOpen ? ChevronUpIcon : ChevronDownIcon} size="sm" />
        </button>
        {legendOpen && (
          <div {...stylex.props(styles.legendBody)}>
            <LegendBody />
          </div>
        )}
      </div>

      <MiniOverview
        activeSectionId={!isPhone && zoom != null ? zoom.sectionId : null}
        visible={visibleBox}
        isZoomed={isZoomed}
        onExit={resetView}
      />

      {/* <=640px zoom cluster: +/− steps and a reset, per the phone contract. */}
      <div {...stylex.props(styles.zoomControls)}>
        {(
          [
            ['Zoom in', ZoomInIcon, phoneZoomIdx >= PHONE_ZOOMS.length - 1, () => stepPhoneZoom(1)],
            ['Zoom out', ZoomOutIcon, phoneZoomIdx === 0, () => stepPhoneZoom(-1)],
            ['Reset view', RotateCcwIcon, false, resetView],
          ] as const
        ).map(([label, icon, isDisabled, onClick]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            disabled={isDisabled}
            onClick={onClick}
            {...stylex.props(styles.zoomButton, isDisabled && styles.zoomButtonDisabled)}>
            <Icon icon={icon} size="sm" color="inherit" />
          </button>
        ))}
      </div>
    </div>
  );

  // ---- shared rail / sheet content ----
  const railContent = (
    <VStack gap={4}>
      <BestAvailablePanel
        partySize={partySize}
        onPartyChange={setPartySize}
        onFind={findBest}
      />
      <Divider />
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TicketIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" size="sm" color="secondary">
              Your seats
            </Text>
          </StackItem>
          {seatTotal > 0 && (
            <Badge variant="info" label={`${seatTotal} of ${MAX_SELECTION}`} />
          )}
        </HStack>
        <CartBody
          groups={cartGroups}
          seatTotal={seatTotal}
          onRemove={toggleSeat}
          onClear={clearCart}
        />
      </VStack>
    </VStack>
  );

  const sheetSummary =
    seatTotal > 0
      ? `${seatTotal} seat${seatTotal === 1 ? '' : 's'} · ${formatMoney(cartTotal)}`
      : 'No seats selected';

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Icon icon={ArmchairIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>{SHOW.venue}</Heading>
                <Text type="supporting" color="secondary">
                  {SHOW.title} · {SHOW.when}
                </Text>
              </VStack>
            </StackItem>
            {!isPhone && (
              <Badge
                variant="neutral"
                label={`${SEAT_COUNT} seats`}
                icon={<Icon icon={ArmchairIcon} size="xsm" />}
              />
            )}
            {seatTotal > 0 && (
              <Badge
                variant="success"
                label={isPhone ? `${seatTotal}` : sheetSummary}
                icon={<Icon icon={TicketIcon} size="xsm" />}
              />
            )}
          </HStack>
        </LayoutHeader>
      }
      end={
        // > 640px: the cart docks as a rail; on phones the StyleX bottom
        // sheet below replaces it entirely.
        isPhone ? undefined : (
          <LayoutPanel
            hasDivider
            padding={0}
            width={isNarrow ? 280 : 320}
            label="Best available and cart">
            <div {...stylex.props(styles.railScroll)}>{railContent}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0} role="main" label="Seat map">
          <div aria-live="polite" {...stylex.props(styles.visuallyHidden)}>
            {announcement}
          </div>
          <div id="vsp-map-keys" {...stylex.props(styles.visuallyHidden)}>
            Arrow keys walk seats within a row, up and down move between
            rows, Enter or Space selects, Escape returns to the full
            theater.
          </div>
          {mapStage}
          {/* Snap bottom sheet: peek bar ↔ expanded, phone-only via the
              StyleX @media condition on the sheet styles. */}
          <div {...stylex.props(styles.sheet, sheetOpen && styles.sheetExpanded)}>
            <span {...stylex.props(styles.sheetGrip)} aria-hidden />
            <button
              type="button"
              aria-expanded={sheetOpen}
              aria-label={`${sheetSummary} — ${sheetOpen ? 'collapse' : 'expand'} legend and cart`}
              onClick={() => setSheetOpen(open => !open)}
              {...stylex.props(styles.sheetHandle)}>
              <Icon icon={TicketIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <Text type="body" size="sm" weight="semibold">
                  {sheetSummary}
                </Text>
              </StackItem>
              <Icon
                icon={sheetOpen ? ChevronDownIcon : ChevronUpIcon}
                size="sm"
                color="secondary"
              />
            </button>
            <div {...stylex.props(styles.sheetBody)}>
              <VStack gap={4}>
                <LegendBody />
                <Divider />
                {railContent}
              </VStack>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
