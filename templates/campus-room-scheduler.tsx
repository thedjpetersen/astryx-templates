// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file campus-room-scheduler.tsx
 * @input Deterministic fixtures only — the Roomloom Fall 2026 draft: 8 rooms
 *   × 9 standard meeting-pattern blocks (MWF 8:00/9:10/10:20/11:30/12:40,
 *   TTh 8:00/9:35/11:10/12:45) and 14 course sections, 6 pre-placed and 8
 *   in the queue. Cross-checks done by hand for the initial state:
 *   - Placed enrollment: 46 + 22 + 26 + 138 + 31 + 58 = 321 seats.
 *   - Capacity of the six occupied cells: 48 + 24 + 28 + 150 + 32 + 64
 *     = 346 seats → seat fill 321/346 = 92.77% (displays 93%).
 *   - Blocks used: 6 of 8 rooms × 9 blocks = 6/72 (8%).
 *   - Sections placed: 6/14.
 *   All three KPIs and every room's utilization bar derive live from the
 *   placements map — never from parallel constants. No clock reads, no
 *   randomness, no timers, no network assets.
 * @output Roomloom — Campus Room Scheduler: a registrar's week × room
 *   availability grid. Rows are rooms (with capacity, kind, feature badges
 *   — step-free access, AV, lab benches, lecture capture — and a live
 *   utilization bar); columns are the nine standard meeting-pattern blocks
 *   grouped MWF | TTh. Occupied cells carry the section chip shaded by
 *   enrollment pressure (seat fill <70% cool, 70–89% warm, >=90% hot). A
 *   264px queue rail lists unplaced sections with enrollment, pattern, and
 *   required-feature icons. Signature move: selecting a queue section arms
 *   placement — every grid cell live-classifies itself (eligible cells
 *   preview their projected fill, wrong-pattern columns dim, over-capacity
 *   and missing-feature cells flag their conflict) — and clicking an
 *   eligible cell places the section, updating the room's utilization bar,
 *   the three header KPIs, and the queue in the same render. Clicking a
 *   room without step-free access for a section carrying a mobility
 *   accommodation REFUSES with a shake, an inline reason banner, and an
 *   aria-live announcement. Clicking a placed cell opens the inspector
 *   strip with a "Return to queue" undo.
 * @position Page template; emitted by `astryx template campus-room-scheduler`
 *
 * Frame: Layout height="fill". Header is a 56px topbar (brand mark · term
 *   title · three derived KPI chips). Content is a two-column CSS grid:
 *   264px queue rail (scrollable card list under a 44px rail header) + the
 *   grid panel (minmax(0,1fr)). The grid panel stacks: refusal/hint banner
 *   (when present) → scrollable schedule grid (172px sticky room column +
 *   9 pattern columns) → 56px inspector strip (when a placed cell is
 *   selected) → 36px legend strip. No third column; the inspector is a
 *   strip, not a rail, so the grid keeps its width.
 * Responsive contract:
 * - >= 901px (and the ~1045px inline demo stage, where viewport media
 *   queries never fire — the DEFAULT layout is this one): rail 264px +
 *   grid; the schedule grid is grid-template-columns: 172px
 *   repeat(9, minmax(56px, 1fr)) — at 1045px the 9 block columns resolve
 *   to ~60px each with zero horizontal scroll.
 * - <= 900px: the rail leaves the left edge and becomes a horizontal
 *   scroll-snap chip lane above the grid (subtraction: cards keep their
 *   anatomy, the lane scrolls); the schedule grid scrolls horizontally
 *   with the room column sticky at left and cells fixed at 64px.
 * - <= 640px (the 390px embed iframe): same as <= 900px plus the topbar
 *   wraps, KPI chips scroll, and every target stays >= 40px tall.
 * Container policy: panels, rows, and one dense grid — the queue is a
 *   panel of 68px card rows, the schedule is a bordered grid surface, the
 *   inspector and legend are flat strips. No decorative cards.
 * Color policy: token-pure chrome. ONE quarantined brand literal —
 *   Roomloom sky — as BRAND_ACCENT = light-dark(#0369A1, #7DD3FC):
 *   #0369A1 on #FFFFFF ≈ 5.9:1, #7DD3FC on a ~#1C1C1E dark card ≈ 10.3:1.
 *   Ink over an accent fill is BRAND_ON = light-dark(#FFFFFF, #082F49):
 *   #FFFFFF on #0369A1 ≈ 5.9:1, #082F49 on #7DD3FC ≈ 8.3:1. Enrollment-
 *   pressure shading is color-mix of the accent into the card background
 *   (10% / 24% / 40%) with --color-text-primary text at every step;
 *   conflict states use the DS --color-error/--color-warning tokens and
 *   their -muted washes, so both schemes re-derive automatically.
 * Density grid (repeated verbatim): 56px topbar · 264px queue rail · 68px
 *   queue cards · 44px rail header · 172px room column · 56px grid rows ·
 *   28px group header row · 32px time header row · 56px inspector strip ·
 *   36px legend strip · 12px gutters · every button >= 40px tall (grid
 *   cells are 56px-tall buttons).
 * Fixture policy: one state owner — the placements map (sectionId →
 *   {roomId, blockId}). placeSection() and returnToQueue() are the only
 *   mutations; eligibility, cell states, projected fills, room utilization,
 *   seat-fill / blocks-used / placed KPIs, and the queue all derive from
 *   that map in the same render. Queue selection, the inspector target,
 *   and the refusal banner are local UI state.
 */

import {
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  AccessibilityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  FlaskConicalIcon,
  PlusIcon,
  ProjectorIcon,
  UsersIcon,
  VideoIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// BRAND
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-campus-room-scheduler';

/**
 * THE quarantined brand literal — Roomloom sky.
 * Light arm #0369A1 on #FFFFFF ≈ 5.9:1; dark arm #7DD3FC on ~#1C1C1E ≈ 10.3:1.
 */
const BRAND_ACCENT = 'light-dark(#0369A1, #7DD3FC)';
/**
 * Ink painted over a BRAND_ACCENT fill.
 * #FFFFFF on #0369A1 ≈ 5.9:1; #082F49 on #7DD3FC ≈ 8.3:1.
 */
const BRAND_ON = 'light-dark(#FFFFFF, #082F49)';

const TERM = {
  org: 'Roomloom',
  title: 'Fall 2026 · Schedule Draft 3',
  subtitle: 'Registrar scheduling',
};

/** Seat-fill shading breakpoints: <70% cool, 70–89% warm, >=90% hot. */
const PRESSURE_WARM = 0.7;
const PRESSURE_HOT = 0.9;

// ---------------------------------------------------------------------------
// DOMAIN VOCABULARY
// ---------------------------------------------------------------------------

type PatternId = 'MWF' | 'TTh';
type FeatureId = 'accessible' | 'av' | 'lab' | 'capture';

interface BlockMeta {
  id: string;
  group: PatternId;
  time: string;
}

/** The nine standard meeting-pattern blocks — the grid's column axis. */
const BLOCKS: BlockMeta[] = [
  {id: 'm1', group: 'MWF', time: '8:00'},
  {id: 'm2', group: 'MWF', time: '9:10'},
  {id: 'm3', group: 'MWF', time: '10:20'},
  {id: 'm4', group: 'MWF', time: '11:30'},
  {id: 'm5', group: 'MWF', time: '12:40'},
  {id: 't1', group: 'TTh', time: '8:00'},
  {id: 't2', group: 'TTh', time: '9:35'},
  {id: 't3', group: 'TTh', time: '11:10'},
  {id: 't4', group: 'TTh', time: '12:45'},
];
const MWF_COUNT = BLOCKS.filter(block => block.group === 'MWF').length;

const FEATURE_META: Record<
  FeatureId,
  {label: string; icon: typeof ProjectorIcon}
> = {
  accessible: {label: 'Step-free access', icon: AccessibilityIcon},
  av: {label: 'AV / projector', icon: ProjectorIcon},
  lab: {label: 'Lab benches', icon: FlaskConicalIcon},
  capture: {label: 'Lecture capture', icon: VideoIcon},
};
const FEATURE_ORDER: FeatureId[] = ['accessible', 'av', 'lab', 'capture'];

interface Room {
  id: string;
  code: string;
  /** Room kind + anything a scheduler mutters about it. */
  kindLine: string;
  capacity: number;
  features: FeatureId[];
}

/**
 * 8 rooms. HUM 112 and LIB 022 deliberately lack step-free access (the
 * accommodation-refusal fixtures); WEX B04 carries the long-name stress.
 */
const ROOMS: Room[] = [
  {
    id: 'oak101',
    code: 'OAK 101',
    kindLine: 'Tiered lecture hall',
    capacity: 150,
    features: ['accessible', 'av', 'capture'],
  },
  {
    id: 'oak210',
    code: 'OAK 210',
    kindLine: 'Flat lecture room',
    capacity: 64,
    features: ['accessible', 'av'],
  },
  {
    id: 'hum112',
    code: 'HUM 112',
    kindLine: 'Seminar · 1898 wing, stairs only',
    capacity: 24,
    features: ['av'],
  },
  {
    id: 'hum305',
    code: 'HUM 305',
    kindLine: 'Seminar · chalkboard only',
    capacity: 18,
    features: [],
  },
  {
    id: 'sci240',
    code: 'SCI 240',
    kindLine: 'Wet lab',
    capacity: 28,
    features: ['accessible', 'av', 'lab'],
  },
  {
    id: 'sci118',
    code: 'SCI 118',
    kindLine: 'Flex lecture / lab',
    capacity: 48,
    features: ['accessible', 'av', 'lab'],
  },
  {
    // Stress fixture: long display name exercises room-column truncation.
    id: 'wexb04',
    code: 'WEX B04',
    kindLine: 'Wexler Commons Flexible Studio (dividable)',
    capacity: 40,
    features: ['accessible'],
  },
  {
    id: 'lib022',
    code: 'LIB 022',
    kindLine: 'Basement classroom · stairs only',
    capacity: 32,
    features: ['av', 'capture'],
  },
];
const ROOM_BY_ID = new Map(ROOMS.map(room => [room.id, room]));

interface Section {
  id: string;
  code: string;
  title: string;
  enrollment: number;
  pattern: PatternId;
  required: FeatureId[];
  /** A registered mobility accommodation — step-free access is mandatory. */
  accommodation: boolean;
}

const SECTIONS: Section[] = [
  // ---- pre-placed (see INITIAL_PLACEMENTS) ---------------------------------
  {
    id: 'bio204',
    code: 'BIO 204',
    title: 'Genetics',
    enrollment: 46,
    pattern: 'TTh',
    required: ['av'],
    accommodation: false,
  },
  {
    id: 'eng101',
    code: 'ENG 101-03',
    title: 'College Composition',
    enrollment: 22,
    pattern: 'MWF',
    required: ['av'],
    accommodation: false,
  },
  {
    id: 'chem110',
    code: 'CHEM 110L',
    title: 'General Chemistry Lab A',
    enrollment: 26,
    pattern: 'TTh',
    required: ['lab'],
    accommodation: false,
  },
  {
    id: 'psy100',
    code: 'PSY 100',
    title: 'Intro to Psychology',
    enrollment: 138,
    pattern: 'MWF',
    required: ['av', 'capture'],
    accommodation: false,
  },
  {
    id: 'his212',
    code: 'HIS 212',
    title: 'The Atlantic World',
    enrollment: 31,
    pattern: 'TTh',
    required: ['av'],
    accommodation: false,
  },
  {
    id: 'math152',
    code: 'MATH 152',
    title: 'Calculus II',
    enrollment: 58,
    pattern: 'MWF',
    required: ['av'],
    accommodation: false,
  },
  // ---- queue ----------------------------------------------------------------
  {
    // The accommodation-refusal fixture: fits HUM 112 on paper (17 < 24,
    // AV present) but HUM 112 has no step-free access.
    id: 'soc301',
    code: 'SOC 301',
    title: 'Qualitative Methods',
    enrollment: 17,
    pattern: 'TTh',
    required: ['av'],
    accommodation: true,
  },
  {
    id: 'phil240',
    code: 'PHIL 240',
    title: 'Ethics of Care',
    enrollment: 23,
    pattern: 'MWF',
    required: [],
    accommodation: false,
  },
  {
    id: 'bio310',
    code: 'BIO 310L',
    title: 'Microbiology Lab',
    enrollment: 27,
    pattern: 'MWF',
    required: ['av', 'lab'],
    accommodation: false,
  },
  {
    // The one-room-fits fixture: 142 seats + capture → only OAK 101 works.
    id: 'econ101',
    code: 'ECON 101',
    title: 'Principles of Microeconomics',
    enrollment: 142,
    pattern: 'TTh',
    required: ['av', 'capture'],
    accommodation: false,
  },
  {
    id: 'cs215',
    code: 'CS 215',
    title: 'Data Structures',
    enrollment: 44,
    pattern: 'MWF',
    required: ['av'],
    accommodation: true,
  },
  {
    id: 'art130',
    code: 'ART 130',
    title: 'Studio Foundations',
    enrollment: 36,
    pattern: 'TTh',
    required: [],
    accommodation: false,
  },
  {
    // Long-title stress: exercises queue-card and cell-chip truncation.
    id: 'ling480',
    code: 'LING 480',
    title: 'Field Methods in Language Documentation and Description',
    enrollment: 12,
    pattern: 'TTh',
    required: ['av'],
    accommodation: false,
  },
  {
    id: 'wri205',
    code: 'WRI 205',
    title: 'Creative Nonfiction Workshop',
    enrollment: 20,
    pattern: 'MWF',
    required: ['av'],
    accommodation: true,
  },
];
const SECTION_BY_ID = new Map(SECTIONS.map(section => [section.id, section]));

interface Placement {
  roomId: string;
  blockId: string;
}

/** sectionId → cell. See @input for the aggregate arithmetic. */
const INITIAL_PLACEMENTS: Record<string, Placement> = {
  bio204: {roomId: 'sci118', blockId: 't2'},
  eng101: {roomId: 'hum112', blockId: 'm2'},
  chem110: {roomId: 'sci240', blockId: 't3'},
  psy100: {roomId: 'oak101', blockId: 'm3'},
  his212: {roomId: 'lib022', blockId: 't1'},
  math152: {roomId: 'oak210', blockId: 'm1'},
};

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — eligibility, pressure, aggregates
// ---------------------------------------------------------------------------

type CellVerdict =
  | {kind: 'ok'; projected: number}
  | {kind: 'tight'; projected: number}
  | {kind: 'occupied'}
  | {kind: 'pattern'}
  | {kind: 'access'}
  | {kind: 'overcap'}
  | {kind: 'feature'; missing: FeatureId[]};

/**
 * Classify a cell for the armed section. Order matters: pattern and
 * occupancy are structural, the accommodation gate outranks capacity (a
 * refused room must refuse for the right reason), then capacity, then
 * non-access feature requirements.
 */
function classifyCell(
  section: Section,
  room: Room,
  block: BlockMeta,
  occupiedBy: string | undefined,
): CellVerdict {
  if (block.group !== section.pattern) {
    return {kind: 'pattern'};
  }
  if (occupiedBy != null) {
    return {kind: 'occupied'};
  }
  if (section.accommodation && !room.features.includes('accessible')) {
    return {kind: 'access'};
  }
  if (room.capacity < section.enrollment) {
    return {kind: 'overcap'};
  }
  const missing = section.required.filter(
    feature => !room.features.includes(feature),
  );
  if (missing.length > 0) {
    return {kind: 'feature', missing};
  }
  const fill = section.enrollment / room.capacity;
  return fill >= PRESSURE_HOT
    ? {kind: 'tight', projected: fill}
    : {kind: 'ok', projected: fill};
}

type PressureLevel = 'cool' | 'warm' | 'hot';

function pressureLevel(fill: number): PressureLevel {
  if (fill >= PRESSURE_HOT) {
    return 'hot';
  }
  if (fill >= PRESSURE_WARM) {
    return 'warm';
  }
  return 'cool';
}

/** Human reason line for a refused placement — feeds banner + live region. */
function refusalReason(
  section: Section,
  room: Room,
  verdict: CellVerdict,
): string {
  switch (verdict.kind) {
    case 'access':
      return `${section.code} carries a mobility accommodation and ${room.code} has no step-free access. Pick a room with the step-free badge.`;
    case 'overcap':
      return `${section.code} enrolls ${section.enrollment} but ${room.code} seats ${room.capacity} — over capacity by ${
        section.enrollment - room.capacity
      }.`;
    case 'feature':
      return `${room.code} is missing ${verdict.missing
        .map(feature => FEATURE_META[feature].label.toLowerCase())
        .join(' and ')} required by ${section.code}.`;
    case 'occupied':
      return `That block in ${room.code} is already scheduled. Pick an open cell.`;
    case 'pattern':
      return `${section.code} meets ${section.pattern} — this column is a different pattern.`;
    default:
      return '';
  }
}

function formatPct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-campus-room-scheduler
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  --rl-accent: ${BRAND_ACCENT};
  --rl-on-accent: ${BRAND_ON};
  --rl-accent-border: color-mix(in srgb, ${BRAND_ACCENT} 45%, var(--color-border));
  --rl-wash-cool: color-mix(in srgb, ${BRAND_ACCENT} 10%, var(--color-background-card));
  --rl-wash-warm: color-mix(in srgb, ${BRAND_ACCENT} 24%, var(--color-background-card));
  --rl-wash-hot: color-mix(in srgb, ${BRAND_ACCENT} 40%, var(--color-background-card));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, var(--font-family-body, system-ui, sans-serif));
}
.${SCOPE} *,
.${SCOPE} *::before,
.${SCOPE} *::after {
  box-sizing: border-box;
}
.${SCOPE} h1,
.${SCOPE} h2,
.${SCOPE} h3,
.${SCOPE} p,
.${SCOPE} ul,
.${SCOPE} ol,
.${SCOPE} li {
  margin: 0;
  padding: 0;
}
.${SCOPE} ul,
.${SCOPE} ol {
  list-style: none;
}
.${SCOPE} button {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: inherit;
}
.${SCOPE} button:focus-visible {
  outline: 2px solid var(--rl-accent);
  outline-offset: -2px;
}
.${SCOPE} .num {
  font-variant-numeric: tabular-nums;
}

/* ---- topbar: 56px ---------------------------------------------------------- */
.${SCOPE}.topbar {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.${SCOPE} .brandCluster {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-3);
  min-width: 0;
}
.${SCOPE} .brandMark {
  align-items: center;
  background: var(--rl-accent);
  border-radius: 10px;
  color: var(--rl-on-accent);
  display: inline-flex;
  flex: none;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.${SCOPE} .eyebrow {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
  white-space: nowrap;
}
.${SCOPE} h1 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .topbarSpring {
  flex: 1 1 auto;
  min-width: 0;
}
.${SCOPE} .kpiRow {
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  overflow-x: auto;
}
.${SCOPE} .kpiChip {
  align-items: baseline;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  font-size: 12px;
  gap: 6px;
  min-height: 28px;
  padding: 4px 10px;
  white-space: nowrap;
}
.${SCOPE} .kpiChip strong {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

/* ---- workspace: 264px rail + grid panel ----------------------------------- */
.${SCOPE}.workspace {
  background: var(--color-background-body);
  display: grid;
  gap: 12px;
  grid-template-columns: 264px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
}
.${SCOPE} .panel {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.${SCOPE} .railHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 var(--spacing-3);
}
.${SCOPE} .railTitle {
  font-size: 13px;
  font-weight: 700;
}
.${SCOPE} .railCount {
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  margin-left: auto;
  padding: 2px 8px;
}
.${SCOPE} .railHint {
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  flex: none;
  font-size: 11px;
  line-height: 1.45;
  padding: var(--spacing-2) var(--spacing-3);
}
.${SCOPE} .queueList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-2);
}
.${SCOPE} .queueEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-3);
  text-align: center;
}

/* ---- queue card: 68px min, whole card is the arming button ---------------- */
.${SCOPE} .queueCard {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: block;
  min-height: 68px;
  padding: 10px 12px;
  transition: border-color 140ms ease, background-color 140ms ease;
  width: 100%;
}
@media (hover: hover) {
  .${SCOPE} .queueCard:hover {
    background: var(--color-overlay-hover);
    border-color: var(--rl-accent-border);
  }
}
.${SCOPE} .queueCard[aria-pressed='true'] {
  background: var(--rl-wash-cool);
  border-color: var(--rl-accent);
}
.${SCOPE} .queueTop {
  align-items: baseline;
  display: flex;
  gap: var(--spacing-2);
}
.${SCOPE} .queueCode {
  flex: none;
  font-size: 13px;
  font-weight: 700;
}
.${SCOPE} .queueTitle {
  color: var(--color-text-secondary);
  flex: 1 1 auto;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .queueMeta {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  margin-top: 6px;
}
.${SCOPE} .metaChip {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 600;
  gap: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}
.${SCOPE} .metaChip.pattern {
  background: var(--rl-wash-cool);
  color: var(--color-text-primary);
}
.${SCOPE} .featureIcons {
  align-items: center;
  color: var(--color-icon-secondary);
  display: inline-flex;
  gap: 4px;
  margin-left: auto;
}
.${SCOPE} .featureIcons .accommodation {
  color: var(--rl-accent);
  display: inline-flex;
}

/* ---- banner (refusal / arming hint) ---------------------------------------- */
.${SCOPE} .banner {
  align-items: flex-start;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  font-size: 12px;
  gap: var(--spacing-2);
  line-height: 1.45;
  padding: var(--spacing-2) var(--spacing-3);
}
.${SCOPE} .banner.refusal {
  background: var(--color-error-muted);
}
.${SCOPE} .banner.arming {
  background: var(--rl-wash-cool);
}
.${SCOPE} .banner .bannerIcon {
  color: var(--color-error);
  display: inline-flex;
  flex: none;
  margin-top: 1px;
}
.${SCOPE} .banner.arming .bannerIcon {
  color: var(--rl-accent);
}
.${SCOPE} .banner .bannerText {
  flex: 1 1 auto;
  min-width: 0;
}
.${SCOPE} .banner .bannerText strong {
  font-weight: 700;
}
.${SCOPE} .bannerDismiss {
  align-items: center;
  align-self: center;
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  margin: -8px 0;
  width: 40px;
}
@media (hover: hover) {
  .${SCOPE} .bannerDismiss:hover {
    background: var(--color-overlay-hover);
  }
}

/* ---- schedule grid ---------------------------------------------------------- */
.${SCOPE} .gridScroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.${SCOPE} .schedule {
  display: grid;
  grid-template-columns: 172px repeat(9, minmax(56px, 1fr));
  min-width: 100%;
}
.${SCOPE} .headCell {
  align-items: center;
  background: var(--color-background-card);
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 2;
}
.${SCOPE} .groupHead {
  height: 28px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.${SCOPE} .timeHead {
  font-variant-numeric: tabular-nums;
  height: 32px;
  top: 28px;
}
.${SCOPE} .cornerCell {
  justify-content: flex-start;
  padding-left: var(--spacing-3);
  position: sticky;
  left: 0;
  z-index: 3;
}
/* Visual seam between the MWF and TTh groups. */
.${SCOPE} .groupStart {
  border-left: 2px solid var(--color-border-emphasized, var(--color-border));
}
.${SCOPE} .roomCell {
  background: var(--color-background-card);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  left: 0;
  min-height: 56px;
  padding: 6px var(--spacing-3) 6px;
  position: sticky;
  z-index: 1;
}
.${SCOPE} .roomTop {
  align-items: baseline;
  display: flex;
  gap: 6px;
  min-width: 0;
}
.${SCOPE} .roomCode {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.${SCOPE} .roomCap {
  color: var(--color-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}
.${SCOPE} .roomKind {
  color: var(--color-text-secondary);
  font-size: 10px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .roomFoot {
  align-items: center;
  display: flex;
  gap: 6px;
}
.${SCOPE} .roomFeatures {
  align-items: center;
  color: var(--color-icon-secondary);
  display: inline-flex;
  flex: none;
  gap: 3px;
}
.${SCOPE} .utilTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  flex: 1 1 auto;
  height: 4px;
  min-width: 24px;
  overflow: hidden;
}
.${SCOPE} .utilFill {
  background: var(--rl-accent);
  display: block;
  height: 100%;
  transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.${SCOPE} .utilPct {
  color: var(--color-text-secondary);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ---- cells ------------------------------------------------------------------ */
.${SCOPE} .cell {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1px;
  justify-content: center;
  min-height: 56px;
  overflow: hidden;
  padding: 4px;
  position: relative;
  transition: background-color 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
  width: 100%;
}
.${SCOPE} .cellCode {
  font-size: 11px;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .cellFill {
  color: var(--color-text-secondary);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* Occupied: enrollment-pressure shading; text stays text-primary. */
.${SCOPE} .cell.occupied.cool { background: var(--rl-wash-cool); }
.${SCOPE} .cell.occupied.warm { background: var(--rl-wash-warm); }
.${SCOPE} .cell.occupied.hot { background: var(--rl-wash-hot); }
@media (hover: hover) {
  .${SCOPE} .cell.occupied:hover {
    box-shadow: inset 0 0 0 2px var(--rl-accent-border);
  }
}
.${SCOPE} .cell.inspected {
  box-shadow: inset 0 0 0 2px var(--rl-accent);
}
/* Armed-placement verdict styling. */
.${SCOPE} .cell.eligible {
  box-shadow: inset 0 0 0 1.5px var(--rl-accent-border);
}
.${SCOPE} .cell.eligible .cellGhost {
  align-items: center;
  color: var(--rl-accent);
  display: inline-flex;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  gap: 2px;
}
@media (hover: hover) {
  .${SCOPE} .cell.eligible:hover {
    background: var(--rl-wash-cool);
    box-shadow: inset 0 0 0 2px var(--rl-accent);
  }
}
.${SCOPE} .cell.tight .cellGhost {
  color: var(--color-text-primary);
}
.${SCOPE} .cell.tight {
  background: var(--color-warning-muted);
}
.${SCOPE} .cell.conflict {
  background: var(--color-error-muted);
  cursor: not-allowed;
}
.${SCOPE} .cell.conflict .conflictIcon {
  color: var(--color-error);
  display: inline-flex;
}
.${SCOPE} .cell.mismatch {
  background: var(--color-warning-muted);
  cursor: not-allowed;
}
.${SCOPE} .cell.mismatch .conflictIcon {
  color: var(--color-text-secondary);
  display: inline-flex;
}
.${SCOPE} .cell.dimmed {
  cursor: default;
  opacity: 0.45;
}
.${SCOPE} .cell.occupiedLocked {
  cursor: not-allowed;
  opacity: 0.6;
}
.${SCOPE} .conflictNote {
  color: var(--color-text-secondary);
  font-size: 9px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
/* Accommodation refusal: a quick horizontal shake on the refused cell. */
@keyframes ${SCOPE}-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}
.${SCOPE} .cell.shaking {
  animation: ${SCOPE}-shake 320ms ease;
}

/* ---- inspector strip: 56px --------------------------------------------------- */
.${SCOPE} .inspector {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-1) var(--spacing-3);
}
.${SCOPE} .inspectorText {
  flex: 1 1 auto;
  min-width: 0;
}
.${SCOPE} .inspectorTitle {
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .inspectorMeta {
  color: var(--color-text-secondary);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${SCOPE} .returnButton {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: inline-flex;
  flex: none;
  font-size: 12px;
  font-weight: 600;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
}
@media (hover: hover) {
  .${SCOPE} .returnButton:hover {
    background: var(--color-overlay-hover);
  }
}
.${SCOPE} .inspectorClose {
  align-items: center;
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  width: 40px;
}
@media (hover: hover) {
  .${SCOPE} .inspectorClose:hover {
    background: var(--color-overlay-hover);
  }
}

/* ---- legend strip: 36px -------------------------------------------------------- */
.${SCOPE} .legend {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  flex-wrap: wrap;
  font-size: 11px;
  gap: var(--spacing-1) var(--spacing-3);
  min-height: 36px;
  padding: var(--spacing-1) var(--spacing-3);
}
.${SCOPE} .legendItem {
  align-items: center;
  display: inline-flex;
  gap: 5px;
  white-space: nowrap;
}
.${SCOPE} .legendSwatch {
  border: var(--border-width) solid var(--color-border);
  border-radius: 3px;
  display: inline-block;
  height: 10px;
  width: 10px;
}
.${SCOPE} .legendSwatch.cool { background: var(--rl-wash-cool); }
.${SCOPE} .legendSwatch.warm { background: var(--rl-wash-warm); }
.${SCOPE} .legendSwatch.hot { background: var(--rl-wash-hot); }
.${SCOPE} .legendSwatch.conflict { background: var(--color-error-muted); }

/* ---- a11y helpers ---------------------------------------------------------------- */
.${SCOPE} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: subtraction, not squeeze ------------------------------------ */
@media (max-width: 900px) {
  .${SCOPE}.workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
  .${SCOPE} .railPanel {
    max-height: 176px;
  }
  .${SCOPE} .queueList {
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .${SCOPE} .queueCard {
    flex: none;
    scroll-snap-align: start;
    width: 248px;
  }
  .${SCOPE} .schedule {
    grid-template-columns: 132px repeat(9, 64px);
    min-width: max-content;
  }
}
@media (max-width: 640px) {
  .${SCOPE}.topbar {
    flex-wrap: wrap;
    padding-bottom: var(--spacing-2);
  }
  .${SCOPE} .topbarSpring {
    display: none;
  }
  .${SCOPE} .kpiRow {
    flex: 1 1 100%;
    order: 3;
  }
  .${SCOPE} .kpiChip {
    min-height: 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} *,
  .${SCOPE} *::before,
  .${SCOPE} *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
`;

// ---------------------------------------------------------------------------
// BRAND MARK — a loom: warp threads with one weft weaving through.
// ---------------------------------------------------------------------------

function RoomloomMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {/* Warp threads. */}
      <path d="M5 3v14M10 3v14M15 3v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Weft thread weaving over-under. */}
      <path
        d="M2 10c2 0 2-2.6 4-2.6S8 12.6 10 12.6 12 7.4 14 7.4s2 2.6 4 2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// QUEUE CARD — the arming affordance.
// ---------------------------------------------------------------------------

function QueueCard({
  section,
  isArmed,
  onArm,
}: {
  section: Section;
  isArmed: boolean;
  onArm: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        id={`crs-queue-${section.id}`}
        className="queueCard"
        aria-pressed={isArmed}
        aria-label={`${section.code} ${section.title}, ${section.enrollment} students, ${
          section.pattern
        }${section.accommodation ? ', mobility accommodation on file' : ''}. ${
          isArmed ? 'Armed — pick a grid cell, or press again to cancel.' : 'Select to place.'
        }`}
        onClick={() => onArm(section.id)}>
        <span className="queueTop">
          <span className="queueCode">{section.code}</span>
          <span className="queueTitle">{section.title}</span>
        </span>
        <span className="queueMeta">
          <span className="metaChip num">
            <Icon icon={UsersIcon} size="xsm" color="inherit" />
            {section.enrollment}
          </span>
          <span className="metaChip pattern">{section.pattern}</span>
          <span className="featureIcons">
            {section.required.map(feature => {
              const meta = FEATURE_META[feature];
              return (
                <span key={feature} title={`Requires ${meta.label.toLowerCase()}`}>
                  <Icon icon={meta.icon} size="xsm" color="inherit" />
                </span>
              );
            })}
            {section.accommodation && (
              <span
                className="accommodation"
                title="Mobility accommodation — step-free access required">
                <Icon icon={AccessibilityIcon} size="xsm" color="inherit" />
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// GRID CELL — one room × block button; all classification arrives as props.
// ---------------------------------------------------------------------------

interface GridCellProps {
  room: Room;
  block: BlockMeta;
  occupant: Section | null;
  /** Verdict for the armed section, or null when nothing is armed. */
  verdict: CellVerdict | null;
  armedSection: Section | null;
  isInspected: boolean;
  isShaking: boolean;
  isGroupStart: boolean;
  onActivate: (roomId: string, blockId: string) => void;
  onShakeEnd: () => void;
}

function GridCell({
  room,
  block,
  occupant,
  verdict,
  armedSection,
  isInspected,
  isShaking,
  isGroupStart,
  onActivate,
  onShakeEnd,
}: GridCellProps) {
  const classes: string[] = ['cell'];
  if (isGroupStart) {
    classes.push('groupStart');
  }
  let body: ReactNode = null;
  let label = `${room.code}, ${block.group} ${block.time}`;

  if (occupant != null) {
    const fill = occupant.enrollment / room.capacity;
    classes.push('occupied', pressureLevel(fill));
    if (isInspected) {
      classes.push('inspected');
    }
    if (armedSection != null) {
      // While placing, occupied cells stay visible but read as locked.
      classes.push('occupiedLocked');
    }
    label += ` — ${occupant.code}, ${occupant.enrollment} of ${room.capacity} seats (${formatPct(
      fill,
    )} full). ${armedSection != null ? 'Already scheduled.' : 'Open inspector.'}`;
    body = (
      <>
        <span className="cellCode">{occupant.code}</span>
        <span className="cellFill num">
          {occupant.enrollment}/{room.capacity}
        </span>
      </>
    );
  } else if (verdict == null) {
    classes.push('dimmed');
    label += ' — open. Select a section from the queue first.';
  } else {
    switch (verdict.kind) {
      case 'ok':
      case 'tight': {
        classes.push('eligible');
        if (verdict.kind === 'tight') {
          classes.push('tight');
        }
        label += ` — open. Place ${armedSection?.code ?? ''} here, projected ${
          armedSection?.enrollment ?? 0
        } of ${room.capacity} seats${verdict.kind === 'tight' ? ' (tight fit)' : ''}.`;
        body = (
          <span className="cellGhost">
            <Icon icon={PlusIcon} size="xsm" color="inherit" />
            {armedSection?.enrollment}/{room.capacity}
          </span>
        );
        break;
      }
      case 'pattern':
        classes.push('dimmed');
        label += ` — different meeting pattern than ${armedSection?.code ?? ''}.`;
        break;
      case 'access':
        classes.push('conflict');
        if (isShaking) {
          classes.push('shaking');
        }
        label += ` — refused: no step-free access and ${
          armedSection?.code ?? ''
        } carries a mobility accommodation.`;
        body = (
          <>
            <span className="conflictIcon">
              <Icon icon={AccessibilityIcon} size="xsm" color="inherit" />
            </span>
            <span className="conflictNote">no access</span>
          </>
        );
        break;
      case 'overcap':
        classes.push('conflict');
        label += ` — over capacity: ${armedSection?.enrollment ?? 0} students, ${
          room.capacity
        } seats.`;
        body = (
          <>
            <span className="conflictIcon">
              <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
            </span>
            <span className="conflictNote num">
              {room.capacity}&thinsp;&lt;&thinsp;{armedSection?.enrollment}
            </span>
          </>
        );
        break;
      case 'feature': {
        classes.push('mismatch');
        const missingLabels = verdict.missing
          .map(feature => FEATURE_META[feature].label.toLowerCase())
          .join(', ');
        label += ` — missing ${missingLabels}.`;
        body = (
          <>
            <span className="conflictIcon">
              <Icon
                icon={FEATURE_META[verdict.missing[0]].icon}
                size="xsm"
                color="inherit"
              />
            </span>
            <span className="conflictNote">missing</span>
          </>
        );
        break;
      }
      default:
        break;
    }
  }

  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-label={label}
      onClick={() => onActivate(room.id, block.id)}
      onAnimationEnd={isShaking ? onShakeEnd : undefined}>
      {body}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const cellKey = (roomId: string, blockId: string): string => `${roomId}:${blockId}`;

export default function CampusRoomSchedulerTemplate() {
  const [placements, setPlacements] =
    useState<Record<string, Placement>>(INITIAL_PLACEMENTS);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [inspectedCell, setInspectedCell] = useState<Placement | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [shakeCellKey, setShakeCellKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // ---- derived state --------------------------------------------------------
  const occupancy = useMemo(() => {
    const map = new Map<string, string>();
    for (const [sectionId, placement] of Object.entries(placements)) {
      map.set(cellKey(placement.roomId, placement.blockId), sectionId);
    }
    return map;
  }, [placements]);

  const roomBlocksUsed = useMemo(() => {
    const map = new Map<string, number>();
    for (const placement of Object.values(placements)) {
      map.set(placement.roomId, (map.get(placement.roomId) ?? 0) + 1);
    }
    return map;
  }, [placements]);

  const queue = useMemo(
    () => SECTIONS.filter(section => placements[section.id] == null),
    [placements],
  );

  const kpis = useMemo(() => {
    let enrolled = 0;
    let capacity = 0;
    for (const [sectionId, placement] of Object.entries(placements)) {
      const section = SECTION_BY_ID.get(sectionId);
      const room = ROOM_BY_ID.get(placement.roomId);
      if (section != null && room != null) {
        enrolled += section.enrollment;
        capacity += room.capacity;
      }
    }
    const placed = Object.keys(placements).length;
    return {
      placed,
      total: SECTIONS.length,
      seatFill: capacity > 0 ? enrolled / capacity : 0,
      blocksUsed: placed,
      totalBlocks: ROOMS.length * BLOCKS.length,
    };
  }, [placements]);

  const armedSection = armedId != null ? SECTION_BY_ID.get(armedId) ?? null : null;

  const inspectedSectionId =
    inspectedCell != null
      ? occupancy.get(cellKey(inspectedCell.roomId, inspectedCell.blockId)) ?? null
      : null;
  const inspectedSection =
    inspectedSectionId != null ? SECTION_BY_ID.get(inspectedSectionId) ?? null : null;

  // ---- interactions -----------------------------------------------------------
  const armSection = useCallback((sectionId: string) => {
    setInspectedCell(null);
    setRefusal(null);
    setShakeCellKey(null);
    setArmedId(current => {
      if (current === sectionId) {
        setAnnouncement('Placement cancelled.');
        return null;
      }
      const section = SECTION_BY_ID.get(sectionId);
      if (section != null) {
        setAnnouncement(
          `Placing ${section.code} — ${section.pattern}, ${section.enrollment} students. Eligible cells show projected seat fill; Escape cancels.`,
        );
      }
      return sectionId;
    });
  }, []);

  const activateCell = useCallback(
    (roomId: string, blockId: string) => {
      const room = ROOM_BY_ID.get(roomId);
      const block = BLOCKS.find(candidate => candidate.id === blockId);
      if (room == null || block == null) {
        return;
      }
      const key = cellKey(roomId, blockId);
      const occupantId = occupancy.get(key) ?? null;

      if (armedSection == null) {
        // Not placing: occupied cells open the inspector, empty cells hint.
        if (occupantId != null) {
          setInspectedCell({roomId, blockId});
          setRefusal(null);
        } else {
          setAnnouncement('Select a section from the queue first, then pick a cell.');
        }
        return;
      }

      const verdict = classifyCell(armedSection, room, block, occupantId ?? undefined);
      if (verdict.kind === 'ok' || verdict.kind === 'tight') {
        const remaining = queue.length - 1;
        setPlacements(current => ({
          ...current,
          [armedSection.id]: {roomId, blockId},
        }));
        setArmedId(null);
        setRefusal(null);
        setShakeCellKey(null);
        setAnnouncement(
          `Placed ${armedSection.code} in ${room.code}, ${block.group} ${block.time} — ${
            armedSection.enrollment
          } of ${room.capacity} seats (${formatPct(
            armedSection.enrollment / room.capacity,
          )}).${
            verdict.kind === 'tight' ? ' Tight fit — over 90% of the room.' : ''
          } ${remaining} section${remaining === 1 ? '' : 's'} left to place.`,
        );
        return;
      }

      // Refused: banner + announcement; the accommodation gate also shakes.
      const reason = refusalReason(armedSection, room, verdict);
      setRefusal(reason);
      setAnnouncement(`Refused: ${reason}`);
      if (verdict.kind === 'access') {
        setShakeCellKey(key);
      }
    },
    [armedSection, occupancy, queue.length],
  );

  const returnToQueue = useCallback(() => {
    if (inspectedCell == null || inspectedSection == null) {
      return;
    }
    const room = ROOM_BY_ID.get(inspectedCell.roomId);
    const block = BLOCKS.find(candidate => candidate.id === inspectedCell.blockId);
    setPlacements(current => {
      const next = {...current};
      delete next[inspectedSection.id];
      return next;
    });
    setInspectedCell(null);
    setAnnouncement(
      `Returned ${inspectedSection.code} to the queue from ${room?.code ?? ''} ${
        block?.group ?? ''
      } ${block?.time ?? ''}.`,
    );
  }, [inspectedCell, inspectedSection]);

  const clearShake = useCallback(() => setShakeCellKey(null), []);

  const handleWorkspaceKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (armedId != null) {
        setArmedId(null);
        setRefusal(null);
        setAnnouncement('Placement cancelled.');
      } else if (inspectedCell != null) {
        setInspectedCell(null);
      }
    },
    [armedId, inspectedCell],
  );

  // ---- render ------------------------------------------------------------------
  const inspectedRoom =
    inspectedCell != null ? ROOM_BY_ID.get(inspectedCell.roomId) ?? null : null;
  const inspectedBlock =
    inspectedCell != null
      ? BLOCKS.find(candidate => candidate.id === inspectedCell.blockId) ?? null
      : null;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider padding={0}>
          <style>{TEMPLATE_CSS}</style>
          <div className={`${SCOPE} topbar`}>
            <div className="brandCluster">
              <span className="brandMark" aria-hidden="true">
                <RoomloomMark />
              </span>
              <div style={{minWidth: 0}}>
                <p className="eyebrow">
                  {TERM.org} · {TERM.subtitle}
                </p>
                <h1>{TERM.title}</h1>
              </div>
            </div>
            <div className="topbarSpring" />
            <div className="kpiRow" role="group" aria-label="Draft status">
              <span className="kpiChip">
                Placed{' '}
                <strong className="num">
                  {kpis.placed}/{kpis.total}
                </strong>
              </span>
              <span
                className="kpiChip"
                title="Enrollment across placed sections vs the capacity of their rooms">
                Seat fill{' '}
                <strong className="num">
                  {kpis.placed > 0 ? formatPct(kpis.seatFill) : '—'}
                </strong>
              </span>
              <span className="kpiChip">
                Blocks used{' '}
                <strong className="num">
                  {kpis.blocksUsed}/{kpis.totalBlocks}
                </strong>
              </span>
            </div>
          </div>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} role="main" label="Room scheduling workspace">
          {/* Escape is handled at the workspace level so it works from any
              focused cell or card inside. */}
          <div className={`${SCOPE} workspace`} onKeyDown={handleWorkspaceKeyDown}>
            <div aria-live="polite" className="visuallyHidden">
              {announcement}
            </div>

            {/* ---- queue rail -------------------------------------------------- */}
            <section className="panel railPanel" aria-label="Unplaced sections">
              <div className="railHeader">
                <h2 className="railTitle">To schedule</h2>
                <span className="railCount num">{queue.length}</span>
              </div>
              <p className="railHint">
                Select a section, then pick a cell in the grid. Cells refuse
                rooms that break capacity, features, or a mobility
                accommodation.
              </p>
              {queue.length === 0 ? (
                <p className="queueEmpty">
                  Every section is placed. Click any scheduled cell to review
                  or return it to the queue.
                </p>
              ) : (
                <ul className="queueList">
                  {queue.map(section => (
                    <QueueCard
                      key={section.id}
                      section={section}
                      isArmed={armedId === section.id}
                      onArm={armSection}
                    />
                  ))}
                </ul>
              )}
            </section>

            {/* ---- schedule grid panel ---------------------------------------- */}
            <section className="panel" aria-label="Week by room availability grid">
              {refusal != null ? (
                <div className="banner refusal" role="status">
                  <span className="bannerIcon">
                    <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
                  </span>
                  <p className="bannerText">{refusal}</p>
                  <button
                    type="button"
                    className="bannerDismiss"
                    aria-label="Dismiss refusal message"
                    onClick={() => setRefusal(null)}>
                    <Icon icon={XIcon} size="xsm" color="inherit" />
                  </button>
                </div>
              ) : armedSection != null ? (
                <div className="banner arming" role="status">
                  <span className="bannerIcon">
                    <Icon icon={PlusIcon} size="sm" color="inherit" />
                  </span>
                  <p className="bannerText">
                    Placing <strong>{armedSection.code}</strong> ·{' '}
                    {armedSection.pattern} · {armedSection.enrollment} students —
                    eligible cells preview their seat fill. Press Escape to
                    cancel.
                  </p>
                </div>
              ) : null}

              <div className="gridScroll">
                <div className="schedule">
                  {/* Header row 1: pattern groups. */}
                  <div className="headCell groupHead cornerCell" aria-hidden="true" />
                  <div className="headCell groupHead" style={{gridColumn: 'span 5'}}>
                    Mon · Wed · Fri
                  </div>
                  <div
                    className="headCell groupHead groupStart"
                    style={{gridColumn: 'span 4'}}>
                    Tue · Thu
                  </div>
                  {/* Header row 2: block start times. */}
                  <div className="headCell timeHead cornerCell" aria-hidden="true" />
                  {BLOCKS.map((block, index) => (
                    <div
                      key={block.id}
                      className={`headCell timeHead${
                        index === MWF_COUNT ? ' groupStart' : ''
                      }`}>
                      {block.time}
                    </div>
                  ))}
                  {/* Room rows. */}
                  {ROOMS.map(room => {
                    const used = roomBlocksUsed.get(room.id) ?? 0;
                    return (
                      <div key={room.id} style={{display: 'contents'}}>
                        <div className="roomCell">
                          <span className="roomTop">
                            <span className="roomCode">{room.code}</span>
                            <span className="roomCap num">
                              <Icon icon={UsersIcon} size="xsm" color="inherit" />{' '}
                              {room.capacity}
                            </span>
                          </span>
                          <span className="roomKind" title={room.kindLine}>
                            {room.kindLine}
                          </span>
                          <span className="roomFoot">
                            <span className="roomFeatures">
                              {FEATURE_ORDER.filter(feature =>
                                room.features.includes(feature),
                              ).map(feature => (
                                <span
                                  key={feature}
                                  title={FEATURE_META[feature].label}>
                                  <Icon
                                    icon={FEATURE_META[feature].icon}
                                    size="xsm"
                                    color="inherit"
                                  />
                                </span>
                              ))}
                            </span>
                            <span
                              className="utilTrack"
                              role="img"
                              aria-label={`${room.code} utilization: ${used} of ${BLOCKS.length} blocks`}>
                              <span
                                className="utilFill"
                                style={{width: `${(used / BLOCKS.length) * 100}%`}}
                              />
                            </span>
                            <span className="utilPct num">
                              {used}/{BLOCKS.length}
                            </span>
                          </span>
                        </div>
                        {BLOCKS.map((block, index) => {
                          const key = cellKey(room.id, block.id);
                          const occupantId = occupancy.get(key) ?? null;
                          const occupant =
                            occupantId != null
                              ? SECTION_BY_ID.get(occupantId) ?? null
                              : null;
                          const verdict =
                            armedSection != null
                              ? classifyCell(
                                  armedSection,
                                  room,
                                  block,
                                  occupantId ?? undefined,
                                )
                              : null;
                          const isInspected =
                            inspectedCell != null &&
                            inspectedCell.roomId === room.id &&
                            inspectedCell.blockId === block.id;
                          return (
                            <GridCell
                              key={key}
                              room={room}
                              block={block}
                              occupant={occupant}
                              verdict={verdict}
                              armedSection={armedSection}
                              isInspected={isInspected}
                              isShaking={shakeCellKey === key}
                              isGroupStart={index === MWF_COUNT}
                              onActivate={activateCell}
                              onShakeEnd={clearShake}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---- inspector strip ------------------------------------------ */}
              {inspectedSection != null &&
                inspectedRoom != null &&
                inspectedBlock != null && (
                  <div className="inspector" role="region" aria-label="Placement inspector">
                    <div className="inspectorText">
                      <p className="inspectorTitle">
                        {inspectedSection.code} · {inspectedSection.title}
                      </p>
                      <p className="inspectorMeta num">
                        {inspectedRoom.code} · {inspectedBlock.group}{' '}
                        {inspectedBlock.time} · {inspectedSection.enrollment}/
                        {inspectedRoom.capacity} seats (
                        {formatPct(
                          inspectedSection.enrollment / inspectedRoom.capacity,
                        )}{' '}
                        full)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="returnButton"
                      onClick={returnToQueue}>
                      <Icon icon={ArrowLeftIcon} size="sm" color="inherit" />
                      Return to queue
                    </button>
                    <button
                      type="button"
                      className="inspectorClose"
                      aria-label="Close inspector"
                      onClick={() => setInspectedCell(null)}>
                      <Icon icon={XIcon} size="sm" color="inherit" />
                    </button>
                  </div>
                )}

              {/* ---- legend strip --------------------------------------------- */}
              <div className="legend" aria-label="Grid legend">
                <span className="legendItem">Seat-fill shading:</span>
                <span className="legendItem">
                  <span className="legendSwatch cool" aria-hidden="true" />
                  under 70%
                </span>
                <span className="legendItem">
                  <span className="legendSwatch warm" aria-hidden="true" />
                  70–89%
                </span>
                <span className="legendItem">
                  <span className="legendSwatch hot" aria-hidden="true" />
                  90%+
                </span>
                <span className="legendItem">
                  <span className="legendSwatch conflict" aria-hidden="true" />
                  refused while placing
                </span>
                <span className="legendItem">
                  <Icon icon={AccessibilityIcon} size="xsm" color="inherit" />
                  step-free required
                </span>
              </div>
            </section>
          </div>
        </LayoutContent>
      }
    />
  );
}
