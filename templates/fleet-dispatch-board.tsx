// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one dispatch day — "Tue Jul 14, 2026"
 *   over a fixed 08:00–18:00 board window; five drivers with fixed shifts,
 *   vehicle capacities, and seeded route stops — Rosa Delgado is seeded at
 *   92% of her 1,400 lb capacity so most drops onto her lane exercise the
 *   conflict path; nine unassigned stops with address, time window, weight,
 *   and priority)
 * @output Fleet dispatch board: header with board Heading + caption and
 *   live Badges for the unassigned count and average fleet load, plus an
 *   Undo button for the last assign/unassign; a start panel queue of
 *   unassigned stop cards (priority StatusDot, address, window, weight)
 *   with a priority SegmentedControl filter, a sort Selector, and a
 *   per-card "Assign to <driver>" MoreMenu; the center board renders one
 *   horizontal time lane per driver — sticky driver cell (Avatar, vehicle,
 *   shift, animated load + hours meters) beside a 10-hour lane with shift
 *   shading, hour gridlines, and route blocks positioned by time window;
 *   dropping (or menu-assigning) a stop inserts a block and the meters
 *   animate via a CSS width transition; capacity or window violations
 *   raise an inline sticky conflict notice under the lane with explicit
 *   Override / Cancel Buttons; an end panel lists the selected driver's
 *   route sequence with per-stop "Return to queue" IconButtons
 * @position Page template; emitted by `astryx template fleet-dispatch-board`
 *
 * Frame: Layout height="fill". LayoutHeader carries the board chrome
 * (title + caption, unassigned/average-load Badges, Undo). LayoutPanel
 * start 300 hosts the unassigned queue; LayoutPanel end 320 hosts the
 * selected driver's route rail; LayoutContent scrolls the lane board in
 * its own horizontal scroller. The unit here is a driver-day — a
 * driver-by-hour lane board beats a plain table because the decision
 * variable is "which driver and when", so windows must be visible as
 * positioned blocks, not text.
 *
 * Responsive contract:
 * - Board: the scroller owns overflow-x at every width (tabIndex 0 so
 *   keyboard users can pan it); the driver column is position:sticky left
 *   with an edge shadow once content has actually scrolled beneath it, and
 *   hour columns keep fixed pixel widths instead of compressing.
 * - No hover-only interactions: HTML5 drag is enabled only for
 *   hover-capable fine pointers; every queue card always carries an
 *   "Assign to <driver>" MoreMenu (upsized to "lg" when drag is
 *   unavailable), so touch and keyboard users assign through the menu.
 *   Driver cells and route blocks are plain buttons; blocks are >=44px
 *   tall and queue cards/rail rows keep ~40px controls.
 * - >900px: queue docks as a 300px start panel and the route rail as a
 *   320px end panel, each scrolling internally beside the board.
 * - <=900px: both panels leave the edges and stack as full-width sections
 *   (single-pane fallback) — queue above the board, rail below it — and
 *   LayoutContent scrolls the column as one page.
 * - <=640px: the driver cell narrows from 232px to 148px (vehicle line
 *   hides, names truncate, meters keep percent-only captions), hour
 *   columns narrow from 64px to 52px, the header caption collapses to the
 *   driver count, and the header row wraps so the Badges and Undo drop
 *   below the title instead of clipping. The inline conflict notice is
 *   sticky-left inside the scroller and caps its width to the viewport.
 * - Every assign/unassign/conflict outcome is announced through a
 *   visually-hidden aria-live region.
 *
 * Container policy (dispatch-workbench archetype): the page chrome is
 * frame-first rows and panels; the queue and rail use plain bordered rows,
 * and the lanes are positioned buttons — no Cards needed. All counters,
 * meters, and the route sequence recompute live from assignment state — no
 * clocks, randomness, or network assets; avatars are initials-only
 * placeholders and the map never appears (addresses are text).
 */

import {
  Fragment,
  useMemo,
  useState,
  type CSSProperties,
  type DragEvent,
  type UIEvent,
} from 'react';

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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  GripVerticalIcon,
  InboxIcon,
  MapPinIcon,
  TriangleAlertIcon,
  TruckIcon,
  Undo2Icon,
} from 'lucide-react';

// ============= STYLES =============

const colors = {
  surface: 'var(--color-background, #FFFFFF)',
  surfaceMuted: 'var(--color-background-muted, #F5F5F7)',
  border: 'var(--color-border, #E2E2E6)',
  accent: 'var(--color-accent, #0171E3)',
  accentMuted: 'var(--color-accent-muted, #E8F1FD)',
  urgentBg: 'var(--color-background-red, #FBE2E0)',
  urgentFg: 'var(--color-text-red, #B3231A)',
  highBg: 'var(--color-background-yellow, #FCF0D2)',
  highFg: 'var(--color-text-yellow, #8A6A00)',
  normalBg: 'var(--color-background-blue, #DFEDFB)',
  normalFg: 'var(--color-text-blue, #0B5CAB)',
  meterOk: 'var(--color-text-green, #0B7A24)',
  meterWarn: 'var(--color-text-yellow, #C77E00)',
  meterOver: 'var(--color-text-red, #B3231A)',
  warnSurface: 'var(--color-background-yellow, #FCF0D2)',
  warnBorder: 'var(--color-text-yellow, #C77E00)',
};

// Sticky driver column casts this shadow only after the board has
// actually scrolled horizontally beneath it.
const COLUMN_SHADOW = '8px 0 8px -8px rgba(15, 23, 42, 0.18)';

const LANE_ROW_HEIGHT = 72;
const BLOCK_TOP = 13;
const BLOCK_HEIGHT = 46;

const styles: Record<string, CSSProperties> = {
  // The single horizontal scroller; the sticky driver column and the
  // inline conflict notice both live inside it.
  scroller: {
    overflowX: 'auto',
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surface,
  },
  boardInner: {
    display: 'flex',
    flexDirection: 'column',
    width: 'max-content',
    minWidth: '100%',
  },
  boardRow: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
  },
  rowFiller: {
    flex: 1,
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.surfaceMuted,
  },
  headerFiller: {
    flex: 1,
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
  },
  // Frozen driver column (row headers) — a real button so selection is
  // click/tap/keyboard, never hover.
  driverCell: {
    position: 'sticky',
    left: 0,
    zIndex: 3,
    border: 'none',
    borderBottom: `1px solid ${colors.border}`,
    borderRight: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--spacing-2) var(--spacing-3)',
    boxSizing: 'border-box',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    flexShrink: 0,
    minHeight: LANE_ROW_HEIGHT,
  },
  driverCellSelected: {
    backgroundColor: colors.accentMuted,
    boxShadow: `inset 3px 0 0 ${colors.accent}`,
  },
  cornerCell: {
    zIndex: 4,
    cursor: 'default',
    minHeight: 44,
    alignItems: 'flex-end',
  },
  hourTick: {
    display: 'flex',
    alignItems: 'flex-end',
    padding: 'var(--spacing-1) 0 var(--spacing-1) 6px',
    borderBottom: `1px solid ${colors.border}`,
    boxSizing: 'border-box',
    flexShrink: 0,
    minHeight: 44,
  },
  lane: {
    position: 'relative',
    height: LANE_ROW_HEIGHT,
    flexShrink: 0,
    backgroundColor: colors.surfaceMuted,
    borderBottom: `1px solid ${colors.border}`,
    boxSizing: 'border-box',
  },
  laneDropTarget: {
    outline: `2px solid ${colors.accent}`,
    outlineOffset: -2,
    backgroundColor: colors.accentMuted,
  },
  shiftRegion: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderInline: `1px dashed ${colors.border}`,
    boxSizing: 'border-box',
  },
  // Route blocks: absolutely positioned buttons, >=44px tall tap targets.
  block: {
    position: 'absolute',
    top: BLOCK_TOP,
    height: BLOCK_HEIGHT,
    borderRadius: 8,
    border: '1px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 1,
    padding: '0 6px',
    overflow: 'hidden',
    fontFamily: 'inherit',
    zIndex: 1,
  },
  blockOverride: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.warnBorder,
  },
  blockText: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  blockSub: {
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    opacity: 0.85,
  },
  // Animated utilization meters: the inner bar's width transitions, so
  // every assign/unassign visibly slides the meter.
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.10)',
    overflow: 'hidden',
    width: '100%',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 300ms ease, background-color 300ms ease',
  },
  // Inline conflict notice: a row inside the scroller under the offending
  // lane; the inner box sticks to the left edge and caps its width to the
  // viewport so it stays readable at 375px.
  conflictRow: {
    width: '100%',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.surfaceMuted,
  },
  conflictBox: {
    position: 'sticky',
    left: 0,
    maxWidth: 'min(560px, calc(100vw - 32px))',
    boxSizing: 'border-box',
    margin: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: colors.warnSurface,
    border: `1px solid ${colors.warnBorder}`,
    borderRadius: 'var(--radius-container)',
  },
  // Queue stop cards: bordered rows, drag sources on fine pointers only.
  stopCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surface,
    padding: 'var(--spacing-2) var(--spacing-2) var(--spacing-2) var(--spacing-3)',
  },
  stopCardDragging: {
    opacity: 0.5,
  },
  stopCardPending: {
    borderColor: colors.warnBorder,
    boxShadow: `0 0 0 1px ${colors.warnBorder}`,
  },
  railRow: {
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    backgroundColor: colors.surface,
  },
  sequenceIndex: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: colors.accentMuted,
    color: colors.normalFg,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // <=900px: panel content stacks in the main column as plain sections.
  panelStacked: {padding: 0},
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  minWidthZero: {minWidth: 0},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============
// Deterministic fixtures: one fixed dispatch day, five drivers with fixed
// shifts and capacities, nine unassigned stops — no clocks, no randomness,
// no network assets. Rosa is seeded at ~92% load so most drops on her lane
// exercise the capacity-conflict path.

type Priority = 'urgent' | 'high' | 'normal';

const BOARD_DAY = 'Tue Jul 14, 2026';

// Board window: 08:00–18:00, ten one-hour columns.
const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 18 * 60;
const HOUR_COUNT = (DAY_END_MIN - DAY_START_MIN) / 60;
const HOURS = Array.from({length: HOUR_COUNT}, (_, i) => DAY_START_MIN + i * 60);

interface Driver {
  id: string;
  name: string;
  vehicle: string;
  capacityLbs: number;
  shiftStartMin: number;
  shiftEndMin: number;
}

interface Stop {
  id: string;
  code: string;
  address: string;
  windowStartMin: number;
  windowEndMin: number;
  weightLbs: number;
  priority: Priority;
  /** Seed assignment; null = starts in the unassigned queue. */
  driverId: string | null;
}

const DRIVERS: Driver[] = [
  {
    id: 'rosa',
    name: 'Rosa Delgado',
    vehicle: 'Van 12',
    capacityLbs: 1400,
    shiftStartMin: 8 * 60,
    shiftEndMin: 16 * 60,
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    vehicle: 'Box truck 7',
    capacityLbs: 2200,
    shiftStartMin: 8 * 60,
    shiftEndMin: 18 * 60,
  },
  {
    id: 'aisha',
    name: 'Aisha Bell',
    vehicle: 'Van 3',
    capacityLbs: 1400,
    shiftStartMin: 9 * 60,
    shiftEndMin: 17 * 60,
  },
  {
    id: 'tomas',
    name: 'Tomás Rivera',
    vehicle: 'Sprinter 9',
    capacityLbs: 1100,
    shiftStartMin: 8 * 60,
    shiftEndMin: 14 * 60,
  },
  {
    id: 'grace',
    name: 'Grace Liu',
    vehicle: 'Van 21',
    capacityLbs: 1600,
    shiftStartMin: 10 * 60,
    shiftEndMin: 18 * 60,
  },
];

const STOPS: Stop[] = [
  // ---- seeded routes ----
  // Rosa: 1,290 of 1,400 lb (92%) — only the lightest queue stop fits.
  {
    id: 'stop-a1',
    code: 'S-021',
    address: '1420 Harbor Blvd',
    windowStartMin: 8 * 60 + 30,
    windowEndMin: 9 * 60 + 15,
    weightLbs: 460,
    priority: 'high',
    driverId: 'rosa',
  },
  {
    id: 'stop-a2',
    code: 'S-022',
    address: '88 Cannery Row',
    windowStartMin: 10 * 60,
    windowEndMin: 11 * 60,
    weightLbs: 510,
    priority: 'normal',
    driverId: 'rosa',
  },
  {
    id: 'stop-a3',
    code: 'S-023',
    address: '301 Fulton Market',
    windowStartMin: 13 * 60,
    windowEndMin: 13 * 60 + 45,
    weightLbs: 320,
    priority: 'urgent',
    driverId: 'rosa',
  },
  {
    id: 'stop-b1',
    code: 'S-031',
    address: '77 Distribution Way',
    windowStartMin: 8 * 60,
    windowEndMin: 9 * 60,
    weightLbs: 640,
    priority: 'normal',
    driverId: 'marcus',
  },
  {
    id: 'stop-b2',
    code: 'S-032',
    address: '5 Pier Terminal',
    windowStartMin: 11 * 60 + 30,
    windowEndMin: 12 * 60 + 30,
    weightLbs: 480,
    priority: 'high',
    driverId: 'marcus',
  },
  {
    id: 'stop-c1',
    code: 'S-041',
    address: '212 Elm Street',
    windowStartMin: 9 * 60 + 30,
    windowEndMin: 10 * 60 + 15,
    weightLbs: 260,
    priority: 'normal',
    driverId: 'aisha',
  },
  {
    id: 'stop-c2',
    code: 'S-042',
    address: '940 Grandview Ave',
    windowStartMin: 14 * 60,
    windowEndMin: 15 * 60,
    weightLbs: 310,
    priority: 'normal',
    driverId: 'aisha',
  },
  {
    id: 'stop-d1',
    code: 'S-051',
    address: '18 Foundry Lane',
    windowStartMin: 8 * 60 + 30,
    windowEndMin: 9 * 60 + 30,
    weightLbs: 350,
    priority: 'high',
    driverId: 'tomas',
  },
  {
    id: 'stop-e1',
    code: 'S-061',
    address: '600 Beacon Hill Rd',
    windowStartMin: 10 * 60 + 30,
    windowEndMin: 11 * 60 + 15,
    weightLbs: 280,
    priority: 'normal',
    driverId: 'grace',
  },
  {
    id: 'stop-e2',
    code: 'S-062',
    address: '45 Orchard Plaza',
    windowStartMin: 15 * 60 + 30,
    windowEndMin: 16 * 60 + 30,
    weightLbs: 420,
    priority: 'high',
    driverId: 'grace',
  },
  // ---- unassigned queue (9) ----
  {
    id: 'stop-u1',
    code: 'S-101',
    address: '740 Willow Court',
    windowStartMin: 9 * 60,
    windowEndMin: 10 * 60,
    weightLbs: 180,
    priority: 'urgent',
    driverId: null,
  },
  {
    id: 'stop-u2',
    code: 'S-102',
    address: '23 Ferry Landing',
    windowStartMin: 8 * 60 + 30,
    windowEndMin: 9 * 60 + 30,
    weightLbs: 240,
    priority: 'high',
    driverId: null,
  },
  {
    id: 'stop-u3',
    code: 'S-103',
    address: '1580 Sunset Blvd',
    windowStartMin: 16 * 60 + 30,
    windowEndMin: 17 * 60 + 30,
    weightLbs: 150,
    priority: 'normal',
    driverId: null,
  },
  {
    id: 'stop-u4',
    code: 'S-104',
    address: '62 Quarry Road',
    windowStartMin: 11 * 60,
    windowEndMin: 12 * 60,
    weightLbs: 320,
    priority: 'normal',
    driverId: null,
  },
  {
    id: 'stop-u5',
    code: 'S-105',
    address: '477 Meridian Ave',
    windowStartMin: 14 * 60,
    windowEndMin: 14 * 60 + 45,
    weightLbs: 90,
    priority: 'high',
    driverId: null,
  },
  {
    id: 'stop-u6',
    code: 'S-106',
    address: '9 Lighthouse Point',
    windowStartMin: 15 * 60,
    windowEndMin: 16 * 60,
    weightLbs: 210,
    priority: 'normal',
    driverId: null,
  },
  {
    id: 'stop-u7',
    code: 'S-107',
    address: '1204 Cedar Loop',
    windowStartMin: 8 * 60,
    windowEndMin: 8 * 60 + 45,
    weightLbs: 130,
    priority: 'urgent',
    driverId: null,
  },
  {
    id: 'stop-u8',
    code: 'S-108',
    address: '356 Ironworks Dr',
    windowStartMin: 12 * 60 + 30,
    windowEndMin: 13 * 60 + 30,
    weightLbs: 400,
    priority: 'normal',
    driverId: null,
  },
  {
    id: 'stop-u9',
    code: 'S-109',
    address: '81 Marina Slip',
    windowStartMin: 17 * 60,
    windowEndMin: 18 * 60,
    weightLbs: 260,
    priority: 'high',
    driverId: null,
  },
];

const PRIORITY_META: Record<
  Priority,
  {
    label: string;
    dot: 'error' | 'warning' | 'neutral';
    token: 'red' | 'yellow' | 'blue';
    blockBg: string;
    blockFg: string;
  }
> = {
  urgent: {
    label: 'Urgent',
    dot: 'error',
    token: 'red',
    blockBg: colors.urgentBg,
    blockFg: colors.urgentFg,
  },
  high: {
    label: 'High',
    dot: 'warning',
    token: 'yellow',
    blockBg: colors.highBg,
    blockFg: colors.highFg,
  },
  normal: {
    label: 'Normal',
    dot: 'neutral',
    token: 'blue',
    blockBg: colors.normalBg,
    blockFg: colors.normalFg,
  },
};

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
};

const SORT_OPTIONS = [
  {value: 'window', label: 'Earliest window'},
  {value: 'weight', label: 'Heaviest first'},
  {value: 'priority', label: 'Priority first'},
];

type Assignments = Record<string, string | null>;

interface Conflict {
  stopId: string;
  driverId: string;
  reasons: string[];
}

interface LastAction {
  kind: 'assign' | 'unassign';
  stopId: string;
  driverId: string;
}

const INITIAL_ASSIGNMENTS: Assignments = Object.fromEntries(
  STOPS.map(stop => [stop.id, stop.driverId] as const),
);

const STOP_BY_ID = new Map(STOPS.map(stop => [stop.id, stop] as const));
const DRIVER_BY_ID = new Map(DRIVERS.map(driver => [driver.id, driver] as const));

// ============= HELPERS =============
// Small pure functions over the fixture arrays — no chart engines, no
// parsers, no clocks.

/** Minutes-of-day -> "08:30". */
function fmtClock(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtLbs(lbs: number): string {
  return lbs.toLocaleString('en-US');
}

function windowLabel(stop: Stop): string {
  return `${fmtClock(stop.windowStartMin)}–${fmtClock(stop.windowEndMin)}`;
}

function shiftLabel(driver: Driver): string {
  return `${fmtClock(driver.shiftStartMin)}–${fmtClock(driver.shiftEndMin)}`;
}

/** Assigned stops for one driver, in route (window-start) order. */
function routeFor(driverId: string, assignments: Assignments): Stop[] {
  return STOPS.filter(stop => assignments[stop.id] === driverId).sort(
    (a, b) => a.windowStartMin - b.windowStartMin || a.code.localeCompare(b.code),
  );
}

function loadLbsFor(driverId: string, assignments: Assignments): number {
  return routeFor(driverId, assignments).reduce(
    (sum, stop) => sum + stop.weightLbs,
    0,
  );
}

/** Scheduled minutes (sum of window durations) for one driver. */
function usedMinFor(driverId: string, assignments: Assignments): number {
  return routeFor(driverId, assignments).reduce(
    (sum, stop) => sum + (stop.windowEndMin - stop.windowStartMin),
    0,
  );
}

function loadPct(driver: Driver, assignments: Assignments): number {
  return Math.round((loadLbsFor(driver.id, assignments) / driver.capacityLbs) * 100);
}

function hoursPct(driver: Driver, assignments: Assignments): number {
  const shiftMin = driver.shiftEndMin - driver.shiftStartMin;
  return Math.round((usedMinFor(driver.id, assignments) / shiftMin) * 100);
}

/** Capacity + window checks for a prospective drop. */
function conflictsFor(
  stop: Stop,
  driver: Driver,
  assignments: Assignments,
): string[] {
  const reasons: string[] = [];
  const nextLoad = loadLbsFor(driver.id, assignments) + stop.weightLbs;
  if (nextLoad > driver.capacityLbs) {
    reasons.push(
      `Adding ${fmtLbs(stop.weightLbs)} lb puts ${driver.vehicle} at ` +
        `${fmtLbs(nextLoad)} lb — ${fmtLbs(nextLoad - driver.capacityLbs)} lb ` +
        `over its ${fmtLbs(driver.capacityLbs)} lb capacity.`,
    );
  }
  if (
    stop.windowStartMin < driver.shiftStartMin ||
    stop.windowEndMin > driver.shiftEndMin
  ) {
    reasons.push(
      `Window ${windowLabel(stop)} falls outside ${driver.name.split(' ')[0]}'s ` +
        `${shiftLabel(driver)} shift.`,
    );
  }
  return reasons;
}

function meterColor(pct: number): string {
  if (pct > 100) {
    return colors.meterOver;
  }
  if (pct >= 85) {
    return colors.meterWarn;
  }
  return colors.meterOk;
}

// ============= SMALL PIECES =============

function MeterBar({
  label,
  pct,
  detail,
  isAccent,
}: {
  label: string;
  pct: number;
  detail: string;
  isAccent?: boolean;
}) {
  return (
    <VStack gap={0} style={{width: '100%'}}>
      <HStack gap={1} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary" style={styles.truncate}>
            {label}
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {detail}
        </Text>
      </HStack>
      <div
        style={styles.meterTrack}
        role="img"
        aria-label={`${label} ${Math.min(pct, 999)}%`}>
        <div
          style={{
            ...styles.meterFill,
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: isAccent ? colors.accent : meterColor(pct),
          }}
        />
      </div>
    </VStack>
  );
}

function QueueStopCard({
  stop,
  isDraggable,
  isDragging,
  isPendingConflict,
  menuSize,
  onAssign,
  onDraggingChange,
}: {
  stop: Stop;
  isDraggable: boolean;
  isDragging: boolean;
  isPendingConflict: boolean;
  menuSize: 'sm' | 'lg';
  onAssign: (stopId: string, driverId: string) => void;
  onDraggingChange: (stopId: string | null) => void;
}) {
  const meta = PRIORITY_META[stop.priority];
  return (
    // Drag source (fine pointers). The MoreMenu below is the always-on
    // touch/keyboard assignment path, so nothing is hover-only.
    <div
      draggable={isDraggable || undefined}
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('text/plain', stop.id);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange(stop.id);
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={{
        ...styles.stopCard,
        ...(isDragging ? styles.stopCardDragging : undefined),
        ...(isPendingConflict ? styles.stopCardPending : undefined),
        cursor: isDraggable ? 'grab' : undefined,
      }}>
      <HStack gap={2} vAlign="center">
        {isDraggable && (
          <Icon icon={GripVerticalIcon} size="sm" color="secondary" />
        )}
        <StackItem size="fill" style={styles.minWidthZero}>
          <VStack gap={0}>
            <HStack gap={1} vAlign="center">
              <StatusDot
                variant={meta.dot}
                label={`${meta.label} priority`}
              />
              <Text type="body" size="sm" style={styles.truncate}>
                {stop.code} · {stop.address}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {windowLabel(stop)} · {fmtLbs(stop.weightLbs)} lb
            </Text>
          </VStack>
        </StackItem>
        <MoreMenu
          label={`Assign ${stop.code}`}
          size={menuSize}
          items={DRIVERS.map(driver => ({
            label: `Assign to ${driver.name}`,
            onClick: () => onAssign(stop.id, driver.id),
          }))}
        />
      </HStack>
    </div>
  );
}

function RouteBlock({
  stop,
  driver,
  hourWidth,
  isOverridden,
  onSelect,
}: {
  stop: Stop;
  driver: Driver;
  hourWidth: number;
  isOverridden: boolean;
  onSelect: (driverId: string) => void;
}) {
  const meta = PRIORITY_META[stop.priority];
  const left = ((stop.windowStartMin - DAY_START_MIN) / 60) * hourWidth + 2;
  const width = ((stop.windowEndMin - stop.windowStartMin) / 60) * hourWidth - 4;
  return (
    <button
      type="button"
      aria-label={
        `${stop.code} ${stop.address}, ${windowLabel(stop)}, ` +
        `${fmtLbs(stop.weightLbs)} lb, ${meta.label} priority` +
        `${isOverridden ? ', assigned via override' : ''} — view ${driver.name}'s route`
      }
      title={`${stop.code} · ${stop.address} · ${windowLabel(stop)}`}
      onClick={() => onSelect(driver.id)}
      style={{
        ...styles.block,
        ...(isOverridden ? styles.blockOverride : undefined),
        left,
        width: Math.max(width, 34),
        backgroundColor: meta.blockBg,
        color: meta.blockFg,
      }}>
      <span style={styles.blockText}>{stop.code}</span>
      <span style={styles.blockSub}>{fmtLbs(stop.weightLbs)} lb</span>
    </button>
  );
}

function DriverCell({
  driver,
  assignments,
  isSelected,
  isCompact,
  width,
  columnShadow,
  onSelect,
}: {
  driver: Driver;
  assignments: Assignments;
  isSelected: boolean;
  isCompact: boolean;
  width: number;
  columnShadow: string | undefined;
  onSelect: (driverId: string) => void;
}) {
  const load = loadLbsFor(driver.id, assignments);
  const lPct = loadPct(driver, assignments);
  const hPct = hoursPct(driver, assignments);
  const usedMin = usedMinFor(driver.id, assignments);
  const shiftMin = driver.shiftEndMin - driver.shiftStartMin;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={
        `Select ${driver.name} — ${driver.vehicle}, shift ${shiftLabel(driver)}, ` +
        `load ${fmtLbs(load)} of ${fmtLbs(driver.capacityLbs)} lb (${lPct}%), ` +
        `hours ${hPct}% scheduled`
      }
      onClick={() => onSelect(driver.id)}
      style={{
        ...styles.driverCell,
        ...(isSelected ? styles.driverCellSelected : undefined),
        width,
        minWidth: width,
        boxShadow: isSelected
          ? `${columnShadow ? `${columnShadow}, ` : ''}inset 3px 0 0 ${colors.accent}`
          : columnShadow,
      }}>
      <HStack gap={2} vAlign="center" style={{minWidth: 0, width: '100%'}}>
        {!isCompact && <Avatar name={driver.name} size={32} />}
        <StackItem size="fill" style={styles.minWidthZero}>
          <VStack gap={0}>
            <Text type="body" size="sm" style={styles.truncate}>
              {driver.name}
            </Text>
            {!isCompact && (
              <Text type="supporting" color="secondary" style={styles.truncate}>
                {driver.vehicle} · {shiftLabel(driver)}
              </Text>
            )}
            <MeterBar
              label={isCompact ? 'Load' : 'Load lb'}
              pct={lPct}
              detail={
                isCompact
                  ? `${lPct}%`
                  : `${fmtLbs(load)}/${fmtLbs(driver.capacityLbs)}`
              }
            />
            <MeterBar
              label="Hours"
              pct={hPct}
              detail={
                isCompact
                  ? `${hPct}%`
                  : `${(usedMin / 60).toFixed(1)}/${(shiftMin / 60).toFixed(1)} h`
              }
              isAccent
            />
          </VStack>
        </StackItem>
      </HStack>
    </button>
  );
}

function ConflictNotice({
  conflict,
  onOverride,
  onCancel,
}: {
  conflict: Conflict;
  onOverride: () => void;
  onCancel: () => void;
}) {
  const stop = STOP_BY_ID.get(conflict.stopId);
  const driver = DRIVER_BY_ID.get(conflict.driverId);
  if (!stop || !driver) {
    return null;
  }
  return (
    <div style={styles.conflictRow}>
      <div style={styles.conflictBox} role="alert">
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={TriangleAlertIcon} size="sm" />
            <Text type="label" size="sm">
              {stop.code} conflicts with {driver.name}
            </Text>
          </HStack>
          {conflict.reasons.map(reason => (
            <Text key={reason} type="supporting" color="secondary">
              {reason}
            </Text>
          ))}
          <HStack gap={2}>
            <Button
              label="Override and assign"
              variant="destructive"
              size="sm"
              onClick={onOverride}
            />
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onClick={onCancel}
            />
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

function RailStopRow({
  stop,
  index,
  isOverridden,
  onUnassign,
}: {
  stop: Stop;
  index: number;
  isOverridden: boolean;
  onUnassign: (stopId: string) => void;
}) {
  const meta = PRIORITY_META[stop.priority];
  return (
    <div style={styles.railRow}>
      <HStack gap={2} vAlign="center">
        <span style={styles.sequenceIndex} aria-hidden>
          {index + 1}
        </span>
        <StackItem size="fill" style={styles.minWidthZero}>
          <VStack gap={0}>
            <Text type="body" size="sm" style={styles.truncate}>
              {stop.code} · {stop.address}
            </Text>
            <HStack gap={1} vAlign="center" wrap="wrap">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {windowLabel(stop)} · {fmtLbs(stop.weightLbs)} lb
              </Text>
              <Token size="sm" color={meta.token} label={meta.label} />
              {isOverridden && (
                <Token size="sm" color="yellow" label="override" />
              )}
            </HStack>
          </VStack>
        </StackItem>
        <IconButton
          label={`Return ${stop.code} to the queue`}
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" />}
          onClick={() => onUnassign(stop.id)}
        />
      </HStack>
    </div>
  );
}

// ============= PAGE =============

export default function FleetDispatchBoardTemplate() {
  // Stop→driver assignment lifted into state so drops, menu assigns,
  // unassigns, and undo all re-render the board, meters, and counters.
  const [assignments, setAssignments] = useState<Assignments>(INITIAL_ASSIGNMENTS);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>('rosa');
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [overriddenIds, setOverriddenIds] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [queueFilter, setQueueFilter] = useState('all');
  const [queueSort, setQueueSort] = useState('window');
  const [draggingStopId, setDraggingStopId] = useState<string | null>(null);
  const [dropDriverId, setDropDriverId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  // The sticky driver column only casts a shadow once lanes have slid
  // underneath it.
  const [scrolledX, setScrolledX] = useState(false);

  const isStacked = useMediaQuery('(max-width: 900px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  // Drag-and-drop only for hover-capable fine pointers; touch users
  // assign through each queue card's MoreMenu.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');

  const driverColWidth = isCompact ? 148 : 232;
  const hourWidth = isCompact ? 52 : 64;
  const laneWidth = HOUR_COUNT * hourWidth;

  // ---- derived, all recomputed live from assignment state ----

  const unassigned = useMemo(
    () => STOPS.filter(stop => assignments[stop.id] == null),
    [assignments],
  );

  const queueStops = useMemo(() => {
    const filtered = unassigned.filter(stop => {
      if (queueFilter === 'urgent') {
        return stop.priority === 'urgent';
      }
      if (queueFilter === 'high') {
        return stop.priority !== 'normal';
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (queueSort === 'weight') {
        return b.weightLbs - a.weightLbs || a.code.localeCompare(b.code);
      }
      if (queueSort === 'priority') {
        return (
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          a.windowStartMin - b.windowStartMin
        );
      }
      return a.windowStartMin - b.windowStartMin || a.code.localeCompare(b.code);
    });
  }, [unassigned, queueFilter, queueSort]);

  const avgLoadPct = useMemo(
    () =>
      Math.round(
        DRIVERS.reduce((sum, driver) => sum + loadPct(driver, assignments), 0) /
          DRIVERS.length,
      ),
    [assignments],
  );

  const selectedDriver =
    selectedDriverId != null ? (DRIVER_BY_ID.get(selectedDriverId) ?? null) : null;
  const selectedRoute = useMemo(
    () => (selectedDriver ? routeFor(selectedDriver.id, assignments) : []),
    [selectedDriver, assignments],
  );

  // ---- actions ----

  const commitAssign = (stopId: string, driverId: string, isOverride: boolean) => {
    const stop = STOP_BY_ID.get(stopId);
    const driver = DRIVER_BY_ID.get(driverId);
    if (!stop || !driver) {
      return;
    }
    setAssignments(prev => ({...prev, [stopId]: driverId}));
    setOverriddenIds(prev =>
      isOverride
        ? [...prev.filter(id => id !== stopId), stopId]
        : prev.filter(id => id !== stopId),
    );
    setConflict(null);
    setSelectedDriverId(driverId);
    setLastAction({kind: 'assign', stopId, driverId});
    setAnnouncement(
      `Assigned ${stop.code} to ${driver.name}${isOverride ? ' via override' : ''}.`,
    );
  };

  const attemptAssign = (stopId: string, driverId: string) => {
    const stop = STOP_BY_ID.get(stopId);
    const driver = DRIVER_BY_ID.get(driverId);
    if (!stop || !driver || assignments[stopId] === driverId) {
      return;
    }
    const reasons = conflictsFor(stop, driver, assignments);
    if (reasons.length > 0) {
      setConflict({stopId, driverId, reasons});
      setSelectedDriverId(driverId);
      setAnnouncement(
        `${stop.code} conflicts with ${driver.name} — choose override or cancel.`,
      );
      return;
    }
    commitAssign(stopId, driverId, false);
  };

  const cancelConflict = () => {
    if (conflict == null) {
      return;
    }
    const stop = STOP_BY_ID.get(conflict.stopId);
    setConflict(null);
    setAnnouncement(stop ? `Kept ${stop.code} in the queue.` : '');
  };

  const unassignStop = (stopId: string) => {
    const stop = STOP_BY_ID.get(stopId);
    const fromId = assignments[stopId];
    if (!stop || fromId == null) {
      return;
    }
    setAssignments(prev => ({...prev, [stopId]: null}));
    setOverriddenIds(prev => prev.filter(id => id !== stopId));
    setLastAction({kind: 'unassign', stopId, driverId: fromId});
    setAnnouncement(`Returned ${stop.code} to the queue.`);
  };

  const undoLastAction = () => {
    if (lastAction == null) {
      return;
    }
    const stop = STOP_BY_ID.get(lastAction.stopId);
    if (lastAction.kind === 'assign') {
      // Undo an assignment: the stop goes back to the queue.
      setAssignments(prev => ({...prev, [lastAction.stopId]: null}));
      setOverriddenIds(prev => prev.filter(id => id !== lastAction.stopId));
      setAnnouncement(stop ? `Undid assignment — ${stop.code} is back in the queue.` : '');
    } else {
      // Undo an unassign: restore the stop to its previous driver as-is.
      setAssignments(prev => ({...prev, [lastAction.stopId]: lastAction.driverId}));
      const driver = DRIVER_BY_ID.get(lastAction.driverId);
      setAnnouncement(
        stop && driver ? `Undid removal — ${stop.code} is back on ${driver.name}'s route.` : '',
      );
    }
    setLastAction(null);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrolledX(event.currentTarget.scrollLeft > 0);
  };

  const columnShadow = scrolledX ? COLUMN_SHADOW : undefined;
  const menuSize: 'sm' | 'lg' = canDrag ? 'sm' : 'lg';

  const lastActionStop =
    lastAction != null ? STOP_BY_ID.get(lastAction.stopId) : undefined;

  // ---- board ----

  const hourGridBackground =
    `repeating-linear-gradient(to right, ${colors.border} 0, ` +
    `${colors.border} 1px, transparent 1px, transparent ${hourWidth}px)`;

  const headerRow = (
    <div style={styles.boardRow}>
      <div
        style={{
          ...styles.driverCell,
          ...styles.cornerCell,
          width: driverColWidth,
          minWidth: driverColWidth,
          boxShadow: columnShadow,
        }}>
        <VStack gap={0}>
          <Text type="label" size="sm">
            {isCompact ? 'Driver' : `${DRIVERS.length} drivers`}
          </Text>
          <Text type="supporting" color="secondary">
            today {fmtClock(DAY_START_MIN)}–{fmtClock(DAY_END_MIN)}
          </Text>
        </VStack>
      </div>
      {HOURS.map(hour => (
        <div
          key={hour}
          style={{...styles.hourTick, width: hourWidth, minWidth: hourWidth}}>
          <Text type="code" size="sm" color="secondary" hasTabularNumbers>
            {fmtClock(hour)}
          </Text>
        </div>
      ))}
      <div style={styles.headerFiller} />
    </div>
  );

  const board = (
    <div
      style={styles.scroller}
      onScroll={handleScroll}
      tabIndex={0}
      role="region"
      aria-label="Driver time lanes">
      <div style={styles.boardInner}>
        {headerRow}
        {DRIVERS.map(driver => {
          const route = routeFor(driver.id, assignments);
          const shiftLeft =
            ((driver.shiftStartMin - DAY_START_MIN) / 60) * hourWidth;
          const shiftWidth =
            ((driver.shiftEndMin - driver.shiftStartMin) / 60) * hourWidth;
          const isDropTarget =
            dropDriverId === driver.id && draggingStopId != null;
          return (
            <Fragment key={driver.id}>
              <div style={styles.boardRow}>
                <DriverCell
                  driver={driver}
                  assignments={assignments}
                  isSelected={selectedDriverId === driver.id}
                  isCompact={isCompact}
                  width={driverColWidth}
                  columnShadow={columnShadow}
                  onSelect={setSelectedDriverId}
                />
                <div
                  onDragOver={(event: DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDropDriverId(driver.id);
                  }}
                  onDragLeave={(event: DragEvent<HTMLDivElement>) => {
                    // Ignore leave events fired over child blocks.
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    ) {
                      setDropDriverId(current =>
                        current === driver.id ? null : current,
                      );
                    }
                  }}
                  onDrop={(event: DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    setDropDriverId(null);
                    const stopId = event.dataTransfer.getData('text/plain');
                    if (stopId) {
                      attemptAssign(stopId, driver.id);
                    }
                  }}
                  aria-label={`${driver.name}'s lane`}
                  style={{
                    ...styles.lane,
                    ...(isDropTarget ? styles.laneDropTarget : undefined),
                    width: laneWidth,
                    minWidth: laneWidth,
                    backgroundImage: hourGridBackground,
                  }}>
                  <div
                    aria-hidden
                    style={{
                      ...styles.shiftRegion,
                      left: shiftLeft,
                      width: shiftWidth,
                    }}
                  />
                  {route.map(stop => (
                    <RouteBlock
                      key={stop.id}
                      stop={stop}
                      driver={driver}
                      hourWidth={hourWidth}
                      isOverridden={overriddenIds.includes(stop.id)}
                      onSelect={setSelectedDriverId}
                    />
                  ))}
                </div>
                <div style={styles.rowFiller} />
              </div>
              {conflict?.driverId === driver.id && (
                <ConflictNotice
                  conflict={conflict}
                  onOverride={() =>
                    commitAssign(conflict.stopId, conflict.driverId, true)
                  }
                  onCancel={cancelConflict}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );

  // ---- queue (start panel / stacked section) ----

  const queueBody = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Unassigned stops</Heading>
        </StackItem>
        <Badge
          variant={unassigned.length > 0 ? 'warning' : 'success'}
          label={String(unassigned.length)}
        />
      </HStack>
      <SegmentedControl
        label="Filter queue by priority"
        value={queueFilter}
        onChange={setQueueFilter}
        size="sm">
        <SegmentedControlItem label="All" value="all" />
        <SegmentedControlItem label="Urgent" value="urgent" />
        <SegmentedControlItem label="High+" value="high" />
      </SegmentedControl>
      <Selector
        label="Sort queue"
        isLabelHidden
        size="sm"
        options={SORT_OPTIONS}
        value={queueSort}
        onChange={setQueueSort}
      />
      {queueStops.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={InboxIcon} size="lg" />}
          title={unassigned.length === 0 ? 'Queue clear' : 'No matches'}
          description={
            unassigned.length === 0
              ? 'Every stop is on a route.'
              : 'Nothing in the queue matches this priority filter.'
          }
        />
      ) : (
        <VStack gap={2}>
          {queueStops.map(stop => (
            <QueueStopCard
              key={stop.id}
              stop={stop}
              isDraggable={canDrag}
              isDragging={draggingStopId === stop.id}
              isPendingConflict={conflict?.stopId === stop.id}
              menuSize={menuSize}
              onAssign={attemptAssign}
              onDraggingChange={setDraggingStopId}
            />
          ))}
        </VStack>
      )}
      <Text type="supporting" color="secondary">
        {canDrag
          ? 'Drag a stop onto a driver lane, or use its menu to assign.'
          : 'Use a stop’s menu to assign it to a driver.'}
      </Text>
    </VStack>
  );

  // ---- rail (end panel / stacked section) ----

  const railBody = (
    <VStack gap={3}>
      <Heading level={2}>Route sequence</Heading>
      {selectedDriver == null ? (
        <EmptyState
          isCompact
          icon={<Icon icon={TruckIcon} size="lg" />}
          title="No driver selected"
          description="Select a driver row to review their route."
        />
      ) : (
        <>
          <HStack gap={2} vAlign="center">
            <Avatar name={selectedDriver.name} size={32} />
            <StackItem size="fill" style={styles.minWidthZero}>
              <VStack gap={0}>
                <Text type="body" size="sm" style={styles.truncate}>
                  {selectedDriver.name}
                </Text>
                <Text type="supporting" color="secondary" style={styles.truncate}>
                  {selectedDriver.vehicle} · shift {shiftLabel(selectedDriver)}
                </Text>
              </VStack>
            </StackItem>
            <Badge
              variant={
                loadPct(selectedDriver, assignments) >= 85 ? 'warning' : 'neutral'
              }
              label={`${loadPct(selectedDriver, assignments)}% load`}
            />
          </HStack>
          <MeterBar
            label="Load"
            pct={loadPct(selectedDriver, assignments)}
            detail={`${fmtLbs(loadLbsFor(selectedDriver.id, assignments))}/${fmtLbs(
              selectedDriver.capacityLbs,
            )} lb`}
          />
          <MeterBar
            label="Hours scheduled"
            pct={hoursPct(selectedDriver, assignments)}
            detail={`${(usedMinFor(selectedDriver.id, assignments) / 60).toFixed(1)}/${(
              (selectedDriver.shiftEndMin - selectedDriver.shiftStartMin) /
              60
            ).toFixed(1)} h`}
            isAccent
          />
          <Divider />
          {selectedRoute.length === 0 ? (
            <EmptyState
              isCompact
              icon={<Icon icon={MapPinIcon} size="lg" />}
              title="Empty route"
              description="Assign stops from the queue to build this route."
            />
          ) : (
            <VStack gap={2}>
              {selectedRoute.map((stop, index) => (
                <RailStopRow
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isOverridden={overriddenIds.includes(stop.id)}
                  onUnassign={unassignStop}
                />
              ))}
            </VStack>
          )}
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {selectedRoute.length} stop{selectedRoute.length === 1 ? '' : 's'} in
            window order · returning a stop sends it back to the queue.
          </Text>
        </>
      )}
    </VStack>
  );

  // ---- header ----

  const headerStats = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Badge
        variant={unassigned.length > 0 ? 'warning' : 'success'}
        label={`${unassigned.length} unassigned`}
      />
      <Badge
        variant={avgLoadPct >= 85 ? 'warning' : 'info'}
        label={`${avgLoadPct}% avg load`}
      />
      {lastAction != null && lastActionStop != null && (
        <Button
          label={`Undo ${lastAction.kind === 'assign' ? 'assign' : 'remove'} ${lastActionStop.code}`}
          variant="ghost"
          size="sm"
          icon={<Icon icon={Undo2Icon} size="sm" />}
          onClick={undoLastAction}
        />
      )}
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* wrap="wrap" lets the live counters and Undo drop below the
              title on narrow viewports instead of clipping. */}
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={TruckIcon} size="lg" color="secondary" />
                <VStack gap={0}>
                  <Heading level={1}>Fleet Dispatch Board</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {isCompact
                      ? `${DRIVERS.length} drivers`
                      : `${BOARD_DAY} · ${DRIVERS.length} drivers · board window ${fmtClock(
                          DAY_START_MIN,
                        )}–${fmtClock(DAY_END_MIN)}`}
                  </Text>
                </VStack>
              </HStack>
            </StackItem>
            {headerStats}
          </HStack>
        </LayoutHeader>
      }
      start={
        isStacked ? undefined : (
          <LayoutPanel width={300} padding={0} label="Unassigned stop queue">
            <div style={styles.panelScroll}>{queueBody}</div>
          </LayoutPanel>
        )
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} padding={0} label="Selected driver route">
            <div style={styles.panelScroll}>{railBody}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <VStack gap={3}>
            {isStacked && (
              <>
                <div style={styles.panelStacked}>{queueBody}</div>
                <Divider />
              </>
            )}
            {board}
            <Text type="supporting" color="secondary">
              Select a driver to review their route — capacity and hours meters
              animate as stops move on and off lanes.
            </Text>
            {isStacked && (
              <>
                <Divider />
                <div style={styles.panelStacked}>{railBody}</div>
              </>
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
