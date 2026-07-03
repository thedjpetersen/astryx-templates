// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a fixed 5-day Lisbon, Portugal trip —
 *   Mon Sep 14 through Fri Sep 18, 2026 — with 18 scheduled activities across
 *   transit, food, sights, and lodging categories, each carrying a fixed
 *   start time in minutes, a EUR cost, and a booked/unbooked flag; plus a
 *   5-item "unscheduled ideas" tray and a stylized SVG Lisbon map with fixed
 *   day-hub coordinates — no Date construction, no randomness, no network
 *   assets)
 * @output Trip ITINERARY PLANNER surface: a left rail of trip-day buttons
 *   (Day 1–5 with weekday/date, theme label, activity count, and live EUR
 *   subtotal), a center column of per-day sections holding reorderable
 *   activity cards (category spine, title + detail, time chip, cost chip,
 *   Booked/Not booked Badge, inline edit affordance, MoreMenu), an
 *   "unscheduled ideas" tray docked at the bottom of the center column, and
 *   a right rail with a stylized SVG map placeholder (day hubs light up with
 *   the selection) over a live trip-budget summary (total, booked vs.
 *   unbooked, per-category bars, per-day subtotals). Cards move three ways —
 *   reorder within a day, move between days, and pull ideas from the tray
 *   into a day — via native HTML5 drag on fine pointers and always via
 *   per-card MoreMenu items. Inline edits to time (Selector), cost
 *   (NumberInput), and booked (Switch) recompute the day subtotal and total
 *   trip budget live. Selecting a day in the rail scrolls to and highlights
 *   its section; removing an activity returns it to the ideas tray with an
 *   undo toast
 * @position Page template; emitted by `astryx template trip-itinerary-planner`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the trip
 * title + date range, the live total-budget Badge, and the booked-count
 * note. LayoutPanel start 224 is the trip-day rail; LayoutPanel end 300
 * hosts the SVG map and the budget summary and scrolls vertically.
 * LayoutContent (padding 0) stacks the internally scrolling day-section
 * column over the docked ideas tray; the undo toast floats above the tray.
 *
 * Interaction contract (moving activities, kanban-board idiom):
 * - Day→activity assignment and per-day order live in useState, so every
 *   move re-renders and every derived number (day subtotal, trip total,
 *   booked split, category bars, rail counts) recomputes from moved state.
 * - Menu path (always available, keyboard + touch accessible): each card's
 *   MoreMenu offers "Move up", "Move down", "Move to Day N" for the other
 *   four days, and "Remove to ideas"; each idea chip has a MoreMenu of
 *   "Add to Day N" items. No move ever requires a pointer drag.
 * - Pointer path: native HTML5 drag-and-drop, enabled only for
 *   "(hover: hover) and (pointer: fine)". Cards and idea chips are
 *   draggable; dropping on a card inserts before it (accent insert line),
 *   dropping on a day section's body appends to that day.
 * - Removing an activity returns it to the ideas tray and raises an undo
 *   toast (Undo restores the exact day + position); the toast persists
 *   until undone, dismissed, or replaced — no timers, so it is never a
 *   race to tap.
 * - Every move, edit, removal, and undo is announced through a
 *   visually-hidden aria-live region.
 *
 * Responsive contract:
 * - >640px: day rail 224 (start, scrolls) | day sections (only scroller in
 *   the center, scroll-margin so rail jumps land below the sticky edge)
 *   over the docked ideas tray (flexShrink 0, horizontal chip scroller) |
 *   map + budget panel 300 (end, scrolls vertically).
 * - <=640px (usable at 375px): both panels unmount. The center column
 *   gains a horizontally scrolling day-chip strip pinned above the day
 *   sections (same select-and-scroll behavior, ~40px chips), and the
 *   budget summary renders as a Card after the last day section; the map
 *   is omitted on phones — the budget numbers are the payload, the map is
 *   decoration. The ideas tray stays docked at the bottom.
 * - Drag is fine-pointer-only, so touch scrolling never fights draggable
 *   cards; every move stays available through MoreMenus, which upsize from
 *   "sm" to "lg" when drag is unavailable so the only move affordance
 *   keeps a ~40px tap target. Edit / remove IconButtons upsize the same
 *   way. No hover-only interactions anywhere.
 * - Header rows wrap (wrap="wrap") so the budget badge drops below the
 *   title instead of clipping; cards clip long titles with maxLines, and
 *   the only horizontal scrollers are the deliberate day-chip strip and
 *   ideas tray, so 375px viewports never scroll the page sideways.
 *
 * Container policy (planner archetype): the page chrome is frame-first
 * rows and panels; each activity is a bespoke card row (not ClickableCard —
 * the row itself is not a navigation target, its controls are), day
 * sections are plain regions with sticky-feeling headers, the map is a
 * small inline SVG over fixed fixture coordinates, and Cards are reserved
 * for the phone-width budget summary. Fixture policy: fixed data only —
 * fixed dates, fixed minutes, fixed costs; no clocks, no randomness, no
 * real imagery (the map is stylized vector shapes).
 *
 * Color policy: token-first with one scheme-locked surface. All chrome,
 * cards, chips, bars, and the undo-toast shadow use var(--color-*) tokens
 * or light-dark() pairs. The stylized Lisbon map (styles.mapFrame + the
 * inline SVG in LisbonMap) is deliberately scheme-locked as daylight
 * paper-map art: its ocean gradient, landmass/hill fills, bridge, rail
 * line, hub dots, and hub labels are raw literals and colorScheme is
 * pinned to 'light' on the frame so the inset reads as a printed map in
 * both schemes; label/stroke literals stay literals so they remain
 * readable on that locked surface.
 */

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ClockIcon,
  LightbulbIcon,
  MapIcon,
  PlaneIcon,
  SquarePenIcon,
  Undo2Icon,
  WalletIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // The day-section column is the only scroller in the center region; the
  // undo toast is positioned against this wrapper.
  centerWrap: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  dayScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // scroll-margin keeps rail-driven jumps from tucking the day header
  // under the scroller's top edge.
  daySection: {
    scrollMarginTop: 8,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  daySectionSelected: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  daySectionDropTarget: {
    outline: '2px dashed var(--color-accent)',
    outlineOffset: '-2px',
  },
  // Activity cards: bespoke rows with a category spine on the left.
  activityCard: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  activityCardDragging: {
    opacity: 0.5,
  },
  // Insert-before indicator while a drag hovers a card.
  activityCardInsertBefore: {
    boxShadow: '0 -3px 0 0 var(--color-accent)',
  },
  categorySpine: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  // Inline chips (time · cost) on each card.
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  // The ideas tray docks at the bottom of the center column and scrolls
  // its chips horizontally — the one deliberate horizontal scroller.
  tray: {
    flexShrink: 0,
    borderTop: '1px solid var(--color-border)',
    padding: 'var(--spacing-2) var(--spacing-4) var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  trayScroll: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 2,
  },
  ideaChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
    minHeight: 44,
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    boxSizing: 'border-box',
  },
  ideaDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Undo toast floats above the tray; persists until acted on (no timer).
  undoToast: {
    position: 'absolute',
    left: '50%',
    bottom: 96,
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    maxWidth: 'calc(100% - 32px)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow:
      '0 4px 16px light-dark(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.6))',
    padding: 'var(--spacing-2) var(--spacing-3)',
    zIndex: 4,
  },
  // Left-rail day buttons (and their <=640px chip variants).
  dayRailButton: {
    display: 'block',
    width: '100%',
    minHeight: 44,
    margin: 0,
    border: 'none',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'transparent',
    textAlign: 'left',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
  },
  dayRailButtonSelected: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
  },
  dayChipStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  dayChip: {
    flexShrink: 0,
    minHeight: 40,
    margin: 0,
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '0 var(--spacing-3)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
  },
  dayChipSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    color: 'var(--color-accent)',
    fontWeight: 600,
  },
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  mapFrame: {
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
    // Ocean gradient behind the vector landmass — a styled placeholder,
    // never a real map tile. Scheme-locked daylight paper-map art (see the
    // header "Color policy"): literals only inside this surface, with
    // colorScheme pinned so it reads as a printed map inset in dark mode.
    background: 'linear-gradient(160deg, #B7D9EE 0%, #8FBFDF 100%)',
    colorScheme: 'light',
  },
  categoryBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
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
};

// ============= DATA =============

type CategoryId = 'transit' | 'food' | 'sights' | 'lodging';
type TokenColor = 'blue' | 'orange' | 'purple' | 'teal';

interface ActivityCategory {
  id: CategoryId;
  label: string;
  /** Spine / dot / bar color — categorical token (light-dark aware). */
  color: string;
  token: TokenColor;
}

const CATEGORIES: readonly ActivityCategory[] = [
  {
    id: 'transit',
    label: 'Transit',
    color: 'var(--color-data-categorical-blue)',
    token: 'blue',
  },
  {
    id: 'food',
    label: 'Food',
    color: 'var(--color-data-categorical-orange)',
    token: 'orange',
  },
  {
    id: 'sights',
    label: 'Sights',
    color: 'var(--color-data-categorical-purple)',
    token: 'purple',
  },
  {
    id: 'lodging',
    label: 'Lodging',
    color: 'var(--color-data-categorical-teal)',
    token: 'teal',
  },
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map(cat => [cat.id, cat]));

interface TripDay {
  id: string;
  /** "Day 1" … "Day 5". */
  label: string;
  /** Fixed fixture date — Mon Sep 14 … Fri Sep 18, 2026. */
  date: string;
  /** Theme line ("Arrival", "Alfama & castle", …). */
  theme: string;
  /** Which map hub lights up when this day is selected. */
  hubId: string;
}

const DAYS: readonly TripDay[] = [
  {
    id: 'day-1',
    label: 'Day 1',
    date: 'Mon, Sep 14',
    theme: 'Arrival',
    hubId: 'airport',
  },
  {
    id: 'day-2',
    label: 'Day 2',
    date: 'Tue, Sep 15',
    theme: 'Alfama & castle',
    hubId: 'alfama',
  },
  {
    id: 'day-3',
    label: 'Day 3',
    date: 'Wed, Sep 16',
    theme: 'Belém',
    hubId: 'belem',
  },
  {
    id: 'day-4',
    label: 'Day 4',
    date: 'Thu, Sep 17',
    theme: 'Sintra day trip',
    hubId: 'sintra',
  },
  {
    id: 'day-5',
    label: 'Day 5',
    date: 'Fri, Sep 18',
    theme: 'Departure',
    hubId: 'baixa',
  },
];

interface Activity {
  id: string;
  title: string;
  /** One supporting line — confirmation code, address, note. */
  detail: string;
  categoryId: CategoryId;
  /** Minutes past midnight; null for ideas that have no time yet. */
  startMin: number | null;
  /** EUR; null while the cost stepper is cleared — math treats null as 0. */
  cost: number | null;
  isBooked: boolean;
}

// 18 scheduled activities + 5 unscheduled ideas. All fixed fixture data.
const ACTIVITIES: readonly Activity[] = [
  // ---- Day 1 · Arrival ----
  {
    id: 'act-flight-out',
    title: 'Flight SFO → LIS',
    detail: 'TAP 218 · seat 22A · lands 11:35',
    categoryId: 'transit',
    startMin: 7 * 60 + 40,
    cost: 640,
    isBooked: true,
  },
  {
    id: 'act-airport-transfer',
    title: 'Airport transfer to Alfama',
    detail: 'Bolt from arrivals · ~25 min',
    categoryId: 'transit',
    startMin: 12 * 60 + 15,
    cost: 18,
    isBooked: false,
  },
  {
    id: 'act-hotel-checkin',
    title: 'Check in — Memmo Alfama',
    detail: 'Conf. MEM-58213 · 4 nights',
    categoryId: 'lodging',
    startMin: 15 * 60,
    cost: 624,
    isBooked: true,
  },
  {
    id: 'act-dinner-flores',
    title: 'Dinner — Taberna da Rua das Flores',
    detail: 'No reservations · queue by 19:00',
    categoryId: 'food',
    startMin: 19 * 60,
    cost: 45,
    isBooked: false,
  },
  // ---- Day 2 · Alfama & castle ----
  {
    id: 'act-pasteis-breakfast',
    title: 'Breakfast — Pastelaria Santo António',
    detail: 'Two pastéis + bica each',
    categoryId: 'food',
    startMin: 9 * 60,
    cost: 12,
    isBooked: false,
  },
  {
    id: 'act-castle',
    title: 'São Jorge Castle',
    detail: 'Timed entry · e-ticket in wallet',
    categoryId: 'sights',
    startMin: 10 * 60 + 30,
    cost: 15,
    isBooked: true,
  },
  {
    id: 'act-alfama-tour',
    title: 'Alfama walking tour',
    detail: 'Meets Largo das Portas do Sol',
    categoryId: 'sights',
    startMin: 14 * 60,
    cost: 25,
    isBooked: true,
  },
  {
    id: 'act-tram-28',
    title: 'Tram 28 loop',
    detail: 'Board at Martim Moniz to sit',
    categoryId: 'transit',
    startMin: 16 * 60 + 30,
    cost: 3,
    isBooked: false,
  },
  {
    id: 'act-fado',
    title: 'Fado show — Tasca do Chico',
    detail: 'Arrive early; cash only',
    categoryId: 'food',
    startMin: 20 * 60 + 30,
    cost: 40,
    isBooked: false,
  },
  // ---- Day 3 · Belém ----
  {
    id: 'act-tram-belem',
    title: 'Tram 15E to Belém',
    detail: 'From Praça da Figueira',
    categoryId: 'transit',
    startMin: 9 * 60 + 15,
    cost: 3,
    isBooked: false,
  },
  {
    id: 'act-jeronimos',
    title: 'Jerónimos Monastery',
    detail: 'Timed entry 10:30 · skip-the-line',
    categoryId: 'sights',
    startMin: 10 * 60 + 30,
    cost: 18,
    isBooked: true,
  },
  {
    id: 'act-pasteis-belem',
    title: 'Pastéis de Belém',
    detail: 'Sit-down room moves faster',
    categoryId: 'food',
    startMin: 12 * 60 + 30,
    cost: 8,
    isBooked: false,
  },
  {
    id: 'act-maat',
    title: 'MAAT museum',
    detail: 'Riverside galleries + roof walk',
    categoryId: 'sights',
    startMin: 14 * 60 + 30,
    cost: 11,
    isBooked: false,
  },
  {
    id: 'act-timeout-market',
    title: 'Dinner — Time Out Market',
    detail: 'Split stalls; grab a shared table',
    categoryId: 'food',
    startMin: 19 * 60 + 30,
    cost: 35,
    isBooked: false,
  },
  // ---- Day 4 · Sintra day trip ----
  {
    id: 'act-train-sintra',
    title: 'Train Rossio → Sintra',
    detail: 'Every 30 min · use Viva card',
    categoryId: 'transit',
    startMin: 8 * 60 + 45,
    cost: 5,
    isBooked: false,
  },
  {
    id: 'act-pena',
    title: 'Pena Palace',
    detail: 'Timed entry 11:00 · bus 434 up',
    categoryId: 'sights',
    startMin: 11 * 60,
    cost: 20,
    isBooked: true,
  },
  {
    id: 'act-regaleira',
    title: 'Quinta da Regaleira',
    detail: 'Initiation well before the crowds',
    categoryId: 'sights',
    startMin: 14 * 60 + 30,
    cost: 15,
    isBooked: false,
  },
  {
    id: 'act-ramiro',
    title: 'Dinner — Cervejaria Ramiro',
    detail: 'Reservation 20:00 under “Duarte”',
    categoryId: 'food',
    startMin: 20 * 60,
    cost: 60,
    isBooked: true,
  },
  // ---- Ideas tray (unscheduled) ----
  {
    id: 'idea-oceanario',
    title: 'Oceanário de Lisboa',
    detail: 'Parque das Nações · ~2 hrs',
    categoryId: 'sights',
    startMin: null,
    cost: 25,
    isBooked: false,
  },
  {
    id: 'idea-miradouro',
    title: 'Sunset — Miradouro da Graça',
    detail: 'Kiosk beers over the rooftops',
    categoryId: 'sights',
    startMin: null,
    cost: 6,
    isBooked: false,
  },
  {
    id: 'idea-lx-factory',
    title: 'LX Factory brunch',
    detail: 'Under the bridge · Sunday market',
    categoryId: 'food',
    startMin: null,
    cost: 22,
    isBooked: false,
  },
  {
    id: 'idea-cascais',
    title: 'Coast ride to Cascais',
    detail: 'Train from Cais do Sodré',
    categoryId: 'transit',
    startMin: null,
    cost: 9,
    isBooked: false,
  },
  {
    id: 'idea-ginjinha',
    title: 'Ginjinha tasting',
    detail: 'A Ginjinha, Largo São Domingos',
    categoryId: 'food',
    startMin: null,
    cost: 6,
    isBooked: false,
  },
];

// Day 5 intentionally holds the departure pair only, so pulling ideas into
// the light final day is the natural first interaction.
const INITIAL_DAY_ACTIVITY_IDS: readonly (readonly string[])[] = [
  ['act-flight-out', 'act-airport-transfer', 'act-hotel-checkin', 'act-dinner-flores'],
  ['act-pasteis-breakfast', 'act-castle', 'act-alfama-tour', 'act-tram-28', 'act-fado'],
  ['act-tram-belem', 'act-jeronimos', 'act-pasteis-belem', 'act-maat', 'act-timeout-market'],
  ['act-train-sintra', 'act-pena', 'act-regaleira', 'act-ramiro'],
  ['act-flight-home', 'act-checkout'],
];

// Day 5's fixed pair lives outside the tray fixtures above.
const DAY5_ACTIVITIES: readonly Activity[] = [
  {
    id: 'act-checkout',
    title: 'Check out + luggage hold',
    detail: 'Front desk holds bags until 15:00',
    categoryId: 'lodging',
    startMin: 11 * 60,
    cost: 0,
    isBooked: true,
  },
  {
    id: 'act-flight-home',
    title: 'Flight LIS → SFO',
    detail: 'TAP 217 · seat 21C · departs 16:55',
    categoryId: 'transit',
    startMin: 16 * 60 + 55,
    cost: 640,
    isBooked: true,
  },
];

const ALL_ACTIVITIES: readonly Activity[] = [...ACTIVITIES, ...DAY5_ACTIVITIES];

const INITIAL_IDEA_IDS: readonly string[] = [
  'idea-oceanario',
  'idea-miradouro',
  'idea-lx-factory',
  'idea-cascais',
  'idea-ginjinha',
];

// ============= MAP FIXTURE =============
// Stylized Lisbon-and-around vector: fixed hub coordinates in a 260×180
// viewBox. Pure decoration with a selection highlight — never a real map.

interface MapHub {
  id: string;
  label: string;
  x: number;
  y: number;
}

const MAP_HUBS: readonly MapHub[] = [
  {id: 'sintra', label: 'Sintra', x: 44, y: 52},
  {id: 'belem', label: 'Belém', x: 108, y: 122},
  {id: 'baixa', label: 'Baixa', x: 158, y: 104},
  {id: 'alfama', label: 'Alfama', x: 184, y: 96},
  {id: 'airport', label: 'Airport', x: 206, y: 44},
];

// ============= HELPERS =============
// Pure minute/EUR math over fixed fixtures — no Date, no locale surprises.

/** 630 → "10:30". 24-hour keeps the chips compact. */
function formatMin(min: number): string {
  const hour = Math.floor(min / 60);
  const minute = min % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatEUR(amount: number): string {
  const rounded = Math.round(amount);
  return `€${rounded.toLocaleString('en-US')}`;
}

/** Time Selector options: 06:00 … 23:30 in 30-minute steps, plus "No time". */
const TIME_OPTIONS: readonly {value: string; label: string}[] = (() => {
  const options: {value: string; label: string}[] = [
    {value: '', label: 'No time yet'},
  ];
  for (let min = 6 * 60; min <= 23 * 60 + 30; min += 30) {
    options.push({value: String(min), label: formatMin(min)});
  }
  return options;
})();

interface UndoRecord {
  activityId: string;
  activityTitle: string;
  dayIndex: number;
  position: number;
}

// ============= ACTIVITY CARD =============

function ActivityCard({
  activity,
  dayIndex,
  index,
  dayCount,
  isDraggable,
  isDragging,
  isInsertTarget,
  isEditing,
  onDraggingChange,
  onInsertTargetChange,
  onDropBefore,
  onMoveWithinDay,
  onMoveToDay,
  onRemove,
  onToggleEdit,
  onPatch,
}: {
  activity: Activity;
  dayIndex: number;
  index: number;
  /** Activities in this day — bounds for Move up / Move down. */
  dayCount: number;
  isDraggable: boolean;
  isDragging: boolean;
  isInsertTarget: boolean;
  isEditing: boolean;
  onDraggingChange: (id: string | null) => void;
  onInsertTargetChange: (id: string | null) => void;
  onDropBefore: (draggedId: string, dayIndex: number, index: number) => void;
  onMoveWithinDay: (dayIndex: number, from: number, to: number) => void;
  onMoveToDay: (id: string, toDay: number) => void;
  onRemove: (id: string, dayIndex: number) => void;
  onToggleEdit: (id: string) => void;
  onPatch: (id: string, patch: Partial<Activity>) => void;
}) {
  const category = CATEGORY_BY_ID.get(activity.categoryId);
  const menuItems = [
    ...(index > 0
      ? [
          {
            label: 'Move up',
            onClick: () => onMoveWithinDay(dayIndex, index, index - 1),
          },
        ]
      : []),
    ...(index < dayCount - 1
      ? [
          {
            label: 'Move down',
            onClick: () => onMoveWithinDay(dayIndex, index, index + 1),
          },
        ]
      : []),
    ...DAYS.map((day, target) => ({day, target}))
      .filter(({target}) => target !== dayIndex)
      .map(({day, target}) => ({
        label: `Move to ${day.label}`,
        onClick: () => onMoveToDay(activity.id, target),
      })),
    {
      label: 'Remove to ideas',
      onClick: () => onRemove(activity.id, dayIndex),
    },
  ];

  return (
    // Draggable wrapper (pointer path); the MoreMenu is the touch/keyboard
    // path, so every move works without a drag. Dropping on a card inserts
    // before it (accent line above while hovered).
    <div
      draggable={isDraggable || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', activity.id);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange(activity.id);
      }}
      onDragEnd={() => {
        onDraggingChange(null);
        onInsertTargetChange(null);
      }}
      onDragOver={event => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        onInsertTargetChange(activity.id);
      }}
      onDragLeave={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onInsertTargetChange(null);
        }
      }}
      onDrop={event => {
        event.preventDefault();
        // Stop the parent day section from also appending the drop.
        event.stopPropagation();
        onInsertTargetChange(null);
        const draggedId = event.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== activity.id) {
          onDropBefore(draggedId, dayIndex, index);
        }
      }}
      style={{
        ...styles.activityCard,
        ...(isDragging ? styles.activityCardDragging : undefined),
        ...(isInsertTarget ? styles.activityCardInsertBefore : undefined),
      }}>
      <div
        style={{...styles.categorySpine, backgroundColor: category?.color}}
        aria-hidden="true"
      />
      <StackItem size="fill">
        <VStack gap={2}>
          <HStack gap={2} vAlign="start">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Text type="body" maxLines={2}>
                  {activity.title}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {activity.detail}
                </Text>
              </VStack>
            </StackItem>
            <IconButton
              label={
                isEditing
                  ? `Close editor for ${activity.title}`
                  : `Edit time, cost, or booking for ${activity.title}`
              }
              icon={<Icon icon={isEditing ? XIcon : SquarePenIcon} size="sm" />}
              variant="ghost"
              size={isDraggable ? 'sm' : 'lg'}
              onClick={() => onToggleEdit(activity.id)}
            />
            {/* Touch devices move cards only through this menu (drag is
                fine-pointer-only), so it upsizes to "lg" there. */}
            <MoreMenu
              label={`Move ${activity.title}`}
              size={isDraggable ? 'sm' : 'lg'}
              items={menuItems}
            />
          </HStack>
          <div style={styles.chipRow}>
            {category ? (
              <Token label={category.label} color={category.token} size="sm" />
            ) : null}
            <HStack gap={1} vAlign="center">
              <Icon icon={ClockIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {activity.startMin === null
                  ? 'No time yet'
                  : formatMin(activity.startMin)}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatEUR(activity.cost ?? 0)}
            </Text>
            <Badge
              label={activity.isBooked ? 'Booked' : 'Not booked'}
              variant={activity.isBooked ? 'success' : 'neutral'}
            />
          </div>
          {isEditing ? (
            <>
              <Divider />
              {/* Inline editor: every change lands in state immediately,
                  so day subtotals and the trip total recompute live. */}
              <HStack gap={3} vAlign="end" wrap="wrap">
                <Selector
                  label="Start time"
                  size="sm"
                  options={[...TIME_OPTIONS]}
                  value={
                    activity.startMin === null ? '' : String(activity.startMin)
                  }
                  onChange={next =>
                    onPatch(activity.id, {
                      startMin: next === '' ? null : Number(next),
                    })
                  }
                />
                <NumberInput
                  label="Cost (EUR)"
                  value={activity.cost}
                  onChange={cost => onPatch(activity.id, {cost})}
                  min={0}
                  step={1}
                  hasClear
                  width={140}
                />
                <Switch
                  label="Booked"
                  value={activity.isBooked}
                  onChange={isBooked => onPatch(activity.id, {isBooked})}
                />
                <Button
                  label="Done"
                  size="sm"
                  onClick={() => onToggleEdit(activity.id)}
                />
              </HStack>
            </>
          ) : null}
        </VStack>
      </StackItem>
    </div>
  );
}

// ============= MAP PANEL =============
// Scheme-locked surface: every fill/stroke below is a deliberate raw
// literal on the daylight paper-map inset (colorScheme: 'light' pinned in
// styles.mapFrame) — see the header "Color policy". Text/strokes stay
// literals so they remain readable on the locked art in both schemes.

function LisbonMap({selectedHubId}: {selectedHubId: string}) {
  return (
    <div style={styles.mapFrame}>
      <svg
        viewBox="0 0 260 180"
        width="100%"
        role="img"
        aria-label={`Stylized Lisbon area map, ${
          MAP_HUBS.find(hub => hub.id === selectedHubId)?.label ?? 'trip'
        } highlighted`}>
        {/* Landmass north of the Tagus. */}
        <path
          d="M0 0 H260 V34 C232 40 214 52 198 66 C180 82 160 88 138 92
             C112 96 92 104 74 100 C52 96 30 104 0 96 Z"
          fill="#DCE8D5"
        />
        {/* South bank sliver. */}
        <path
          d="M96 180 C120 158 156 148 196 146 C220 144 244 150 260 158
             V180 Z"
          fill="#DCE8D5"
        />
        {/* Tagus river mouth between the banks (the gradient shows through). */}
        {/* Hills west of town. */}
        <path
          d="M18 44 C34 30 58 28 72 40 C60 46 42 52 30 60 Z"
          fill="#C7DBBB"
        />
        {/* 25 de Abril bridge. */}
        <line
          x1={126}
          y1={112}
          x2={140}
          y2={152}
          stroke="#B34734"
          strokeWidth={3}
        />
        <circle cx={126} cy={112} r={2.5} fill="#B34734" />
        <circle cx={140} cy={152} r={2.5} fill="#B34734" />
        {/* Rail line out to Sintra. */}
        <path
          d="M158 100 C128 84 92 72 52 56"
          fill="none"
          stroke="#8FA382"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        {MAP_HUBS.map(hub => {
          const isSelected = hub.id === selectedHubId;
          return (
            <g key={hub.id}>
              <circle
                cx={hub.x}
                cy={hub.y}
                r={isSelected ? 8 : 5}
                fill={isSelected ? '#0171E3' : '#5B6B52'}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <text
                x={hub.x}
                y={hub.y - (isSelected ? 12 : 9)}
                textAnchor="middle"
                fontSize={10}
                fontWeight={isSelected ? 700 : 500}
                fill="#37413A">
                {hub.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============= BUDGET SUMMARY =============

interface BudgetSummaryData {
  total: number;
  booked: number;
  unbooked: number;
  byCategory: ReadonlyArray<{category: ActivityCategory; amount: number}>;
  byDay: readonly number[];
}

function BudgetSummary({
  data,
  selectedDay,
  onSelectDay,
}: {
  data: BudgetSummaryData;
  selectedDay: number;
  onSelectDay: (dayIndex: number) => void;
}) {
  const maxCategory = Math.max(
    1,
    ...data.byCategory.map(entry => entry.amount),
  );
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={WalletIcon} size="sm" color="secondary" />
        <Heading level={2}>Trip budget</Heading>
      </HStack>
      <HStack gap={3} vAlign="end">
        <StackItem size="fill">
          <VStack gap={0.5}>
            <Text type="supporting" color="secondary">
              Total planned
            </Text>
            <Heading level={2}>{formatEUR(data.total)}</Heading>
          </VStack>
        </StackItem>
        <VStack gap={0.5}>
          <Text type="supporting" color="secondary">
            Booked
          </Text>
          <Text type="body" hasTabularNumbers>
            {formatEUR(data.booked)}
          </Text>
        </VStack>
        <VStack gap={0.5}>
          <Text type="supporting" color="secondary">
            Still open
          </Text>
          <Text type="body" hasTabularNumbers>
            {formatEUR(data.unbooked)}
          </Text>
        </VStack>
      </HStack>
      <Divider />
      <VStack gap={2}>
        <Text type="label" color="secondary">
          By category
        </Text>
        {data.byCategory.map(({category, amount}) => (
          <VStack key={category.id} gap={0.5}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting">{category.label}</Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatEUR(amount)}
              </Text>
            </HStack>
            <div style={styles.categoryBarTrack}>
              <div
                style={{
                  ...styles.categoryBarFill,
                  width: `${(amount / maxCategory) * 100}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </VStack>
        ))}
      </VStack>
      <Divider />
      <VStack gap={1}>
        <Text type="label" color="secondary">
          By day
        </Text>
        {DAYS.map((day, dayIndex) => (
          <button
            key={day.id}
            type="button"
            style={{
              ...styles.dayRailButton,
              minHeight: 36,
              ...(dayIndex === selectedDay
                ? styles.dayRailButtonSelected
                : undefined),
            }}
            aria-label={`${day.label}, ${day.theme}, subtotal ${formatEUR(
              data.byDay[dayIndex],
            )}`}
            onClick={() => onSelectDay(dayIndex)}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting">
                  {day.label} · {day.theme}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatEUR(data.byDay[dayIndex])}
              </Text>
            </HStack>
          </button>
        ))}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function TripItineraryPlannerTemplate() {
  // Per-day ordered activity ids — the drag/move surface of record.
  const [dayActivityIds, setDayActivityIds] = useState<string[][]>(() =>
    INITIAL_DAY_ACTIVITY_IDS.map(ids => [...ids]),
  );
  // Ideas-tray order; removals append here, scheduling splices out.
  const [ideaIds, setIdeaIds] = useState<string[]>([...INITIAL_IDEA_IDS]);
  // Editable fields (time / cost / booked) per activity, seeded from
  // fixtures; inline edits patch this map and every total recomputes.
  const [activityById, setActivityById] = useState<Record<string, Activity>>(
    () => Object.fromEntries(ALL_ACTIVITIES.map(act => [act.id, act])),
  );
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [insertTargetId, setInsertTargetId] = useState<string | null>(null);
  const [dropDayIndex, setDropDayIndex] = useState<number | null>(null);
  const [undoRecord, setUndoRecord] = useState<UndoRecord | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // <=640px: panels unmount; day-chip strip + budget Card take over.
  const isNarrow = useMediaQuery('(max-width: 640px)');
  // Drag only for hover-capable fine pointers; touch moves via MoreMenus.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');

  const daySectionRefs = useRef<(HTMLElement | null)[]>([]);

  // ---- derived totals: recompute from moved/edited state every render ----
  const budget = useMemo<BudgetSummaryData>(() => {
    const byDay = dayActivityIds.map(ids =>
      ids.reduce((sum, id) => sum + (activityById[id]?.cost ?? 0), 0),
    );
    let booked = 0;
    let total = 0;
    const categoryTotals = new Map<CategoryId, number>(
      CATEGORIES.map(cat => [cat.id, 0]),
    );
    for (const ids of dayActivityIds) {
      for (const id of ids) {
        const activity = activityById[id];
        if (!activity) {
          continue;
        }
        const cost = activity.cost ?? 0;
        total += cost;
        if (activity.isBooked) {
          booked += cost;
        }
        categoryTotals.set(
          activity.categoryId,
          (categoryTotals.get(activity.categoryId) ?? 0) + cost,
        );
      }
    }
    return {
      total,
      booked,
      unbooked: total - booked,
      byCategory: CATEGORIES.map(category => ({
        category,
        amount: categoryTotals.get(category.id) ?? 0,
      })),
      byDay,
    };
  }, [dayActivityIds, activityById]);

  const scheduledCount = dayActivityIds.reduce(
    (sum, ids) => sum + ids.length,
    0,
  );
  const bookedCount = dayActivityIds.reduce(
    (sum, ids) =>
      sum + ids.filter(id => activityById[id]?.isBooked ?? false).length,
    0,
  );

  // ---- day selection: highlight + scroll the section into view ----
  const selectDay = useCallback((dayIndex: number) => {
    setSelectedDay(dayIndex);
    daySectionRefs.current[dayIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setAnnouncement(
      `${DAYS[dayIndex].label}, ${DAYS[dayIndex].theme}, selected`,
    );
  }, []);

  // ---- unified move: pull the id from wherever it lives, insert at the
  // target day/index (null index appends). Handles all three drag ways.
  const moveActivity = useCallback(
    (activityId: string, toDay: number, toIndex: number | null) => {
      const activity = activityById[activityId];
      if (!activity) {
        return;
      }
      // Decide the announcement from current state, never inside a state
      // updater (updaters may re-run and must stay side-effect free).
      const cameFromTray = ideaIds.includes(activityId);
      if (cameFromTray) {
        setIdeaIds(prev => prev.filter(id => id !== activityId));
      }
      setDayActivityIds(prev => {
        const next = prev.map(ids => ids.filter(id => id !== activityId));
        const fromDay = prev.findIndex(ids => ids.includes(activityId));
        let insertAt = toIndex ?? next[toDay].length;
        if (fromDay === toDay && toIndex !== null) {
          // Removing the card first shifts later indexes left by one.
          const fromIndex = prev[toDay].indexOf(activityId);
          if (fromIndex !== -1 && fromIndex < toIndex) {
            insertAt = Math.max(0, toIndex - 1);
          }
        }
        next[toDay] = [
          ...next[toDay].slice(0, insertAt),
          activityId,
          ...next[toDay].slice(insertAt),
        ];
        return next;
      });
      setUndoRecord(null);
      setAnnouncement(
        cameFromTray
          ? `Added ${activity.title} to ${DAYS[toDay].label}`
          : `Moved ${activity.title} to ${DAYS[toDay].label}`,
      );
    },
    [activityById, ideaIds],
  );

  const moveWithinDay = useCallback(
    (dayIndex: number, from: number, to: number) => {
      setDayActivityIds(prev => {
        const ids = [...prev[dayIndex]];
        const [moved] = ids.splice(from, 1);
        ids.splice(to, 0, moved);
        const next = [...prev];
        next[dayIndex] = ids;
        return next;
      });
      const id = dayActivityIds[dayIndex][from];
      const activity = activityById[id];
      if (activity) {
        setAnnouncement(
          `Moved ${activity.title} ${to < from ? 'up' : 'down'} in ${
            DAYS[dayIndex].label
          }`,
        );
      }
    },
    [dayActivityIds, activityById],
  );

  // ---- remove → tray, with a persistent undo toast ----
  const removeToTray = useCallback(
    (activityId: string, dayIndex: number) => {
      const activity = activityById[activityId];
      const position = dayActivityIds[dayIndex].indexOf(activityId);
      if (!activity || position === -1) {
        return;
      }
      setDayActivityIds(prev => {
        const next = [...prev];
        next[dayIndex] = next[dayIndex].filter(id => id !== activityId);
        return next;
      });
      setIdeaIds(prev => [...prev, activityId]);
      setEditingId(prev => (prev === activityId ? null : prev));
      setUndoRecord({
        activityId,
        activityTitle: activity.title,
        dayIndex,
        position,
      });
      setAnnouncement(
        `Removed ${activity.title} from ${DAYS[dayIndex].label}. Undo available.`,
      );
    },
    [activityById, dayActivityIds],
  );

  const undoRemove = useCallback(() => {
    if (!undoRecord) {
      return;
    }
    const {activityId, activityTitle, dayIndex, position} = undoRecord;
    setIdeaIds(prev => prev.filter(id => id !== activityId));
    setDayActivityIds(prev => {
      const next = [...prev];
      const ids = [...next[dayIndex]];
      ids.splice(Math.min(position, ids.length), 0, activityId);
      next[dayIndex] = ids;
      return next;
    });
    setUndoRecord(null);
    setAnnouncement(`Restored ${activityTitle} to ${DAYS[dayIndex].label}`);
  }, [undoRecord]);

  // ---- inline edits patch state; totals recompute via the memo above ----
  const patchActivity = useCallback(
    (activityId: string, patch: Partial<Activity>) => {
      setActivityById(prev => ({
        ...prev,
        [activityId]: {...prev[activityId], ...patch},
      }));
      const activity = activityById[activityId];
      if (activity && patch.isBooked !== undefined) {
        setAnnouncement(
          patch.isBooked
            ? `Marked ${activity.title} booked`
            : `Marked ${activity.title} not booked`,
        );
      }
    },
    [activityById],
  );

  const toggleEdit = useCallback((activityId: string) => {
    setEditingId(prev => (prev === activityId ? null : activityId));
  }, []);

  // ---- day rail (>640px) ----
  const dayRail = (
    <VStack gap={1}>
      {DAYS.map((day, dayIndex) => (
        <button
          key={day.id}
          type="button"
          style={{
            ...styles.dayRailButton,
            ...(dayIndex === selectedDay
              ? styles.dayRailButtonSelected
              : undefined),
          }}
          aria-label={`${day.label}, ${day.date}, ${day.theme}, ${
            dayActivityIds[dayIndex].length
          } activities, subtotal ${formatEUR(budget.byDay[dayIndex])}`}
          aria-pressed={dayIndex === selectedDay}
          onClick={() => selectDay(dayIndex)}>
          <VStack gap={0.5}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">
                  {day.label} · {day.date}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatEUR(budget.byDay[dayIndex])}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {day.theme} · {dayActivityIds[dayIndex].length}{' '}
              {dayActivityIds[dayIndex].length === 1
                ? 'activity'
                : 'activities'}
            </Text>
          </VStack>
        </button>
      ))}
    </VStack>
  );

  // ---- day chip strip (<=640px) ----
  const dayChipStrip = (
    <div style={styles.dayChipStrip}>
      {DAYS.map((day, dayIndex) => (
        <button
          key={day.id}
          type="button"
          style={{
            ...styles.dayChip,
            ...(dayIndex === selectedDay ? styles.dayChipSelected : undefined),
          }}
          aria-label={`${day.label}, ${day.theme}`}
          aria-pressed={dayIndex === selectedDay}
          onClick={() => selectDay(dayIndex)}>
          {day.label}
        </button>
      ))}
    </div>
  );

  // ---- day sections ----
  const daySections = (
    <VStack gap={4}>
      {DAYS.map((day, dayIndex) => {
        const ids = dayActivityIds[dayIndex];
        return (
          <section
            key={day.id}
            ref={element => {
              daySectionRefs.current[dayIndex] = element;
            }}
            aria-label={`${day.label}, ${day.date}, ${day.theme}`}
            onDragOver={event => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDropDayIndex(dayIndex);
            }}
            onDragLeave={event => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              ) {
                setDropDayIndex(prev => (prev === dayIndex ? null : prev));
              }
            }}
            onDrop={event => {
              event.preventDefault();
              setDropDayIndex(null);
              setInsertTargetId(null);
              const draggedId = event.dataTransfer.getData('text/plain');
              if (draggedId) {
                // Section-level drop appends to the end of the day.
                moveActivity(draggedId, dayIndex, null);
              }
            }}
            style={{
              ...styles.daySection,
              ...(dayIndex === selectedDay
                ? styles.daySectionSelected
                : undefined),
              ...(dropDayIndex === dayIndex
                ? styles.daySectionDropTarget
                : undefined),
            }}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <StackItem size="fill">
                  <HStack gap={2} vAlign="center">
                    <Heading level={2}>
                      {day.label} · {day.date}
                    </Heading>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {day.theme}
                    </Text>
                  </HStack>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {ids.length} {ids.length === 1 ? 'activity' : 'activities'} ·{' '}
                  {formatEUR(budget.byDay[dayIndex])}
                </Text>
              </HStack>
              {ids.length === 0 ? (
                <EmptyState
                  isCompact
                  icon={<Icon icon={PlaneIcon} size="lg" />}
                  title="Nothing planned"
                  description="Pull an idea from the tray or move an activity here."
                />
              ) : (
                <VStack gap={2}>
                  {ids.map((id, index) => {
                    const activity = activityById[id];
                    if (!activity) {
                      return null;
                    }
                    return (
                      <ActivityCard
                        key={id}
                        activity={activity}
                        dayIndex={dayIndex}
                        index={index}
                        dayCount={ids.length}
                        isDraggable={canDrag}
                        isDragging={draggingId === id}
                        isInsertTarget={
                          insertTargetId === id && draggingId !== id
                        }
                        isEditing={editingId === id}
                        onDraggingChange={setDraggingId}
                        onInsertTargetChange={setInsertTargetId}
                        onDropBefore={(draggedId, toDay, toIndex) =>
                          moveActivity(draggedId, toDay, toIndex)
                        }
                        onMoveWithinDay={moveWithinDay}
                        onMoveToDay={(activityId, toDay) =>
                          moveActivity(activityId, toDay, null)
                        }
                        onRemove={removeToTray}
                        onToggleEdit={toggleEdit}
                        onPatch={patchActivity}
                      />
                    );
                  })}
                </VStack>
              )}
            </VStack>
          </section>
        );
      })}
    </VStack>
  );

  // ---- ideas tray (docked at the bottom on all widths) ----
  const ideasTray = (
    <div style={styles.tray}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Icon icon={LightbulbIcon} size="sm" color="secondary" />
          <Text type="label">Unscheduled ideas</Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {ideaIds.length}
          </Text>
        </HStack>
        {ideaIds.length === 0 ? (
          <Text type="supporting" color="secondary">
            Every idea is scheduled. Remove an activity to park it here.
          </Text>
        ) : (
          <div style={styles.trayScroll}>
            {ideaIds.map(id => {
              const activity = activityById[id];
              if (!activity) {
                return null;
              }
              const category = CATEGORY_BY_ID.get(activity.categoryId);
              return (
                <div
                  key={id}
                  draggable={canDrag || undefined}
                  onDragStart={event => {
                    event.dataTransfer.setData('text/plain', id);
                    event.dataTransfer.effectAllowed = 'move';
                    setDraggingId(id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setInsertTargetId(null);
                  }}
                  style={{
                    ...styles.ideaChip,
                    ...(draggingId === id
                      ? styles.activityCardDragging
                      : undefined),
                  }}>
                  <span
                    style={{...styles.ideaDot, backgroundColor: category?.color}}
                    aria-hidden="true"
                  />
                  <VStack gap={0}>
                    <Text type="supporting" maxLines={1}>
                      {activity.title}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {category?.label} · {formatEUR(activity.cost ?? 0)}
                    </Text>
                  </VStack>
                  {/* The menu is the touch/keyboard way to schedule an
                      idea; drag is the fine-pointer shortcut. */}
                  <MoreMenu
                    label={`Add ${activity.title} to a day`}
                    size={canDrag ? 'sm' : 'lg'}
                    items={DAYS.map((day, dayIndex) => ({
                      label: `Add to ${day.label}`,
                      onClick: () => moveActivity(id, dayIndex, null),
                    }))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </VStack>
    </div>
  );

  // ---- map + budget panel content (>640px rail; budget-only Card <=640) ----
  const mapAndBudget = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={MapIcon} size="sm" color="secondary" />
        <Heading level={2}>Lisbon & around</Heading>
      </HStack>
      <LisbonMap selectedHubId={DAYS[selectedDay].hubId} />
      <Text type="supporting" color="secondary">
        {DAYS[selectedDay].label} centers on{' '}
        {MAP_HUBS.find(hub => hub.id === DAYS[selectedDay].hubId)?.label}.
      </Text>
      <Divider />
      <BudgetSummary
        data={budget}
        selectedDay={selectedDay}
        onSelectDay={selectDay}
      />
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* wrap="wrap" drops the live budget cluster below the title on
              narrow viewports instead of clipping. */}
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={PlaneIcon} size="md" color="secondary" />
                <Heading level={1}>Lisbon itinerary</Heading>
                <Text type="supporting" color="secondary">
                  Sep 14 – 18, 2026 · 5 days
                </Text>
              </HStack>
            </StackItem>
            <HStack gap={2} vAlign="center">
              <Badge
                label={`${formatEUR(budget.total)} planned`}
                variant="info"
              />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {bookedCount}/{scheduledCount} booked
              </Text>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      start={
        !isNarrow ? (
          <LayoutPanel width={224} padding={0} hasDivider label="Trip days">
            <div style={styles.panelScroll}>{dayRail}</div>
          </LayoutPanel>
        ) : undefined
      }
      end={
        !isNarrow ? (
          <LayoutPanel width={300} padding={0} hasDivider label="Map and budget">
            <div style={styles.panelScroll}>{mapAndBudget}</div>
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.centerWrap}>
            {isNarrow ? dayChipStrip : null}
            <div style={styles.dayScroll}>
              {daySections}
              {isNarrow ? (
                // <=640px: the budget summary rides below the day sections
                // as a Card; the map is omitted on phones (decoration only).
                <VStack gap={3}>
                  <Divider />
                  <Card padding={3}>
                    <BudgetSummary
                      data={budget}
                      selectedDay={selectedDay}
                      onSelectDay={selectDay}
                    />
                  </Card>
                </VStack>
              ) : null}
            </div>
            {undoRecord ? (
              <div style={styles.undoToast} role="status">
                <Text type="supporting" maxLines={1}>
                  Removed {undoRecord.activityTitle} from{' '}
                  {DAYS[undoRecord.dayIndex].label}
                </Text>
                <Button
                  label="Undo"
                  variant="ghost"
                  size={isNarrow ? 'md' : 'sm'}
                  icon={<Icon icon={Undo2Icon} size="sm" />}
                  onClick={undoRemove}
                />
                <IconButton
                  label="Dismiss undo"
                  icon={<Icon icon={XIcon} size="sm" />}
                  variant="ghost"
                  size={isNarrow ? 'md' : 'sm'}
                  onClick={() => setUndoRecord(null)}
                />
              </div>
            ) : null}
            {ideasTray}
          </div>
        </LayoutContent>
      }
    />
  );
}
