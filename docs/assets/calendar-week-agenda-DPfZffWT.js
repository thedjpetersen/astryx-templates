var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three fixture weeks — July 5–11,
 *   July 12–18, and July 19–25, 2026 — with a fixed "today" of Wednesday,
 *   July 8, 2026 and a fixed "now" of 10:30 AM for the current-time rule;
 *   five calendar categories mapped to categorical color tokens; and ~40
 *   events with fixed days, start/end minutes, locations, attendees, and
 *   notes, including deliberate two-way and three-way overlaps that exercise
 *   the side-by-side column layout and a handful of all-day events)
 * @output Week-view CALENDAR surface: a header (Week agenda Heading + visible
 *   event count, ChevronLeft/ChevronRight IconButtons flanking a fixed-width
 *   week label, a "Today" Button, and a category filter legend of
 *   ToggleButton chips with colored swatch dots), a day-header row (weekday +
 *   date, today ringed), an all-day row of full-width category-colored chip
 *   buttons, and an hour-ruled 7-column time grid (7 AM – 8 PM, 48px/hour)
 *   whose events are absolutely positioned block buttons — overlapping
 *   events split their day column into side-by-side sub-columns — crossed by
 *   a red current-time rule with a dot in today's column at the fixed
 *   fixture time. Clicking any event opens a docked 320px detail panel
 *   (category Token, time · duration, location, attendee Avatars, notes,
 *   close IconButton). Prev/next paging swaps between the three fixture
 *   weeks; legend toggles hide categories everywhere at once
 * @position Page template; emitted by \`astryx template calendar-week-agenda\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the calendar chrome
 * (title + count, week pager, Today, category legend). LayoutContent
 * (padding 0) stacks the day-header row and all-day row over the time grid;
 * the time grid is the only scroller between header and panel. LayoutPanel
 * end 320 appears when an event is selected and hosts the event detail.
 * Choose this over the month grid when the surface is an hour-by-hour week —
 * positioned time blocks, overlap columns, a now line — rather than
 * month-at-a-glance day cells.
 *
 * Responsive contract:
 * - >640px: header | day-header row + all-day row (pinned) | time grid
 *   (fills height, scrolls internally, 56px hour gutter + 7 columns of
 *   minmax(0, 1fr)) | detail panel 320 (docked, appears on event click,
 *   scrolls vertically). Overlapping events share their column side by side
 *   (equal widths, 2px gaps); the current-time rule spans the day area with
 *   a dot at today's column.
 * - <=640px (usable at 375px): the time grid swaps ENTIRELY for a vertical
 *   agenda list grouped by day — one section per weekday with a date
 *   heading (Today badge on July 8), all-day rows first, then timed rows
 *   ordered by start. Rows are full-width buttons with ~44px min height;
 *   tapping a row expands its detail Card inline (aria-expanded) instead of
 *   opening the docked panel, so no overlay or hover is ever required.
 *   Pager buttons, Today, and legend toggles upsize to "md" (~40px tap
 *   targets); the legend row becomes a horizontal scroller instead of
 *   wrapping into a tall header block.
 * - Header rows are wrap="wrap", so the pager + Today cluster drops below
 *   the title instead of clipping; the week label keeps a fixed width so
 *   paging never shifts the pager buttons under a moving finger.
 * - No hover-only interactions: every event block, all-day chip, and agenda
 *   row is a real button (tap, focus, and Enter all select), legend toggles
 *   are ToggleButtons with aria-pressed, and week changes are announced via
 *   a visually-hidden aria-live region.
 * - The grid never forces horizontal overflow: day columns are
 *   minmax(0, 1fr), event blocks clip their text with ellipsis, and the
 *   agenda list is a single column, so 375px viewports never scroll
 *   sideways.
 *
 * Container policy (calendar archetype): the page chrome is frame-first
 * rows and panels; the time grid is a bespoke CSS grid with absolutely
 * positioned event buttons because no core component models an hour matrix
 * with overlap columns; Cards are reserved for the inline agenda detail on
 * phones. All counts (header total, per-day agenda rows, panel content)
 * recompute live from the category filter. Fixtures are fixed calendar
 * dates and minutes — no Date construction at all, and never a clock read;
 * the current-time rule sits at the fixed fixture minute.
 *
 * Color policy: token-pure — every color is a var(--color-*) token, and the
 * category palette rides the scheme-stable categorical data tokens (same
 * saturated value in light and dark). The one literal is EVENT_TEXT, an
 * explicit light-dark(#FFFFFF, #FFFFFF) pair for text on those solid
 * categorical blocks/chips: white is the readable choice in both schemes
 * and must never follow the scheme's flipping text color. Nothing here is
 * scheme-locked.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  AlignLeftIcon,
  CalendarOffIcon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

// ============= GRID CONSTANTS =============

/** Width of the hour-label gutter on the left of the time grid. */
const GUTTER_WIDTH = 56;
/** Vertical pixels per hour; a 30-minute meeting is 24px tall. */
const HOUR_HEIGHT = 48;
/** The visible day window: 7:00 AM … 8:00 PM. */
const DAY_START_MIN = 7 * 60;
const DAY_END_MIN = 20 * 60;
const GRID_HEIGHT = ((DAY_END_MIN - DAY_START_MIN) / 60) * HOUR_HEIGHT;
/** Shared column template so header, all-day, and grid rows align. */
const GRID_COLUMNS = \`\${GUTTER_WIDTH}px repeat(7, minmax(0, 1fr))\`;

// Text on the solid categorical event blocks and all-day chips. The
// categorical data tokens are scheme-stable (identical light/dark values),
// so this stays white in BOTH schemes — an explicit light-dark() pair, not
// a text token, so dark mode never flips it unreadable on the saturated
// block color.
const EVENT_TEXT = 'light-dark(#FFFFFF, #FFFFFF)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Desktop: the time grid is the only scroller between header and panel.
  gridScroll: {minHeight: 0, overflowY: 'auto'},
  // Day-header row and all-day row mirror the grid's gutter + 7 columns so
  // labels and chips sit exactly above their column of hours.
  headerRow: {
    display: 'grid',
    gridTemplateColumns: GRID_COLUMNS,
    flexShrink: 0,
  },
  dayHeaderCell: {
    padding: 'var(--spacing-2) var(--spacing-1) var(--spacing-1)',
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    borderLeft: '1px solid var(--color-border)',
  },
  dayNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: '50%',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // Today wears a 2px accent ring around the date number so it reads even
  // when an event on today is also selected.
  dayNumberToday: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    color: 'var(--color-accent)',
  },
  allDayRow: {
    display: 'grid',
    gridTemplateColumns: GRID_COLUMNS,
    flexShrink: 0,
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  allDayGutter: {
    padding: 'var(--spacing-1) var(--spacing-1) var(--spacing-1) 0',
    textAlign: 'right',
    minWidth: 0,
  },
  allDayCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    padding: 2,
    borderLeft: '1px solid var(--color-border)',
    minHeight: 26,
  },
  // All-day chips are real buttons; clicking opens the detail panel.
  allDayChip: {
    display: 'block',
    minWidth: 0,
    margin: 0,
    border: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 11,
    lineHeight: '18px',
    fontWeight: 500,
    color: EVENT_TEXT,
    borderRadius: 4,
    padding: '0 6px',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
  },
  // The time grid: gutter column of hour labels + 7 relative day columns.
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: GRID_COLUMNS,
    position: 'relative',
  },
  hourGutter: {
    position: 'relative',
    height: GRID_HEIGHT,
  },
  hourLabel: {
    position: 'absolute',
    right: 8,
    transform: 'translateY(-50%)',
    fontSize: 11,
    lineHeight: '14px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Hour rules are painted per column with a repeating gradient so no extra
  // DOM rows are needed; the vertical rules come from column borders.
  dayColumn: {
    position: 'relative',
    height: GRID_HEIGHT,
    minWidth: 0,
    borderLeft: '1px solid var(--color-border)',
    backgroundImage:
      'repeating-linear-gradient(to bottom, var(--color-border) 0, ' +
      \`var(--color-border) 1px, transparent 1px, transparent \${HOUR_HEIGHT}px)\`,
  },
  dayColumnWeekend: {backgroundColor: 'var(--color-background-muted)'},
  // Positioned event blocks: solid category color, title over time range,
  // ellipsis truncation; overlap columns set left/width inline.
  eventBlock: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0,
    margin: 0,
    border: 'none',
    borderRadius: 4,
    padding: '2px 6px',
    overflow: 'hidden',
    textAlign: 'left',
    color: EVENT_TEXT,
    cursor: 'pointer',
    font: 'inherit',
    boxShadow: '0 0 0 1px var(--color-background-surface)',
  },
  eventBlockSelected: {
    boxShadow:
      '0 0 0 2px var(--color-background-surface), 0 0 0 4px var(--color-accent)',
    zIndex: 2,
  },
  eventBlockTitle: {
    display: 'block',
    fontSize: 11,
    lineHeight: '14px',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  eventBlockTime: {
    display: 'block',
    fontSize: 10,
    lineHeight: '13px',
    opacity: 0.9,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Fixed-fixture current-time rule: a faint line across the day area with
  // a strong dot pinned to today's column.
  nowRule: {
    position: 'absolute',
    left: GUTTER_WIDTH,
    right: 0,
    height: 2,
    backgroundColor: 'var(--color-data-categorical-red)',
    opacity: 0.85,
    pointerEvents: 'none',
    zIndex: 3,
  },
  nowDot: {
    position: 'absolute',
    top: -3,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-data-categorical-red)',
  },
  // Legend swatches inside the ToggleButton chips: filled while the
  // category is visible, hollow while hidden.
  legendSwatch: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // <=640px the legend scrolls horizontally instead of wrapping into a
  // tall header block.
  legendScroll: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 2,
  },
  // Fixed-width week label so paging never shifts the pager buttons.
  weekLabel: {textAlign: 'center', flexShrink: 0},
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Colored spine beside the panel title and agenda rows.
  eventBar: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  // <=640px agenda rows: full-width buttons with a ~44px floor.
  agendaRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    width: '100%',
    minHeight: 44,
    margin: 0,
    border: 'none',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-surface)',
    textAlign: 'left',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
  },
  agendaRowExpanded: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
  },
  agendaTime: {
    width: 88,
    flexShrink: 0,
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

type CategoryId = 'work' | 'team' | 'personal' | 'deadline' | 'travel';
type TokenColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal';

interface CalendarCategory {
  id: CategoryId;
  label: string;
  /** Solid block / chip / bar color — scheme-stable categorical token. */
  color: string;
  /** Matching Token color for the detail panel. */
  token: TokenColor;
}

const CATEGORIES: readonly CalendarCategory[] = [
  {
    id: 'work',
    label: 'Work',
    color: 'var(--color-data-categorical-blue)',
    token: 'blue',
  },
  {
    id: 'team',
    label: 'Team',
    color: 'var(--color-data-categorical-purple)',
    token: 'purple',
  },
  {
    id: 'personal',
    label: 'Personal',
    color: 'var(--color-data-categorical-green)',
    token: 'green',
  },
  {
    id: 'deadline',
    label: 'Deadlines',
    color: 'var(--color-data-categorical-orange)',
    token: 'orange',
  },
  {
    id: 'travel',
    label: 'Travel',
    color: 'var(--color-data-categorical-teal)',
    token: 'teal',
  },
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map(cat => [cat.id, cat]));

interface WeekFixture {
  key: string;
  /** Header pager label ("Jul 5 – 11, 2026"). */
  label: string;
  /** Day-of-month for the Sunday that starts the week (all in July 2026). */
  startDay: number;
}

// Three fixture weeks, Sunday-first, all inside July 2026; paging is
// clamped to this window.
const WEEKS: readonly WeekFixture[] = [
  {key: '2026-07-05', label: 'Jul 5 – 11, 2026', startDay: 5},
  {key: '2026-07-12', label: 'Jul 12 – 18, 2026', startDay: 12},
  {key: '2026-07-19', label: 'Jul 19 – 25, 2026', startDay: 19},
];

// Fixed fixture "today": Wednesday, July 8, 2026 — week 0, column 3 — and a
// fixed fixture "now" of 10:30 AM for the current-time rule. Never a clock.
const TODAY_WEEK_INDEX = 0;
const TODAY_DAY_INDEX = 3;
const NOW_MIN = 10 * 60 + 30;

const WEEKDAYS = [
  {full: 'Sunday', short: 'Sun'},
  {full: 'Monday', short: 'Mon'},
  {full: 'Tuesday', short: 'Tue'},
  {full: 'Wednesday', short: 'Wed'},
  {full: 'Thursday', short: 'Thu'},
  {full: 'Friday', short: 'Fri'},
  {full: 'Saturday', short: 'Sat'},
] as const;

interface WeekEvent {
  id: string;
  /** Index into WEEKS. */
  weekIndex: number;
  /** Column: 0 = Sunday … 6 = Saturday. */
  dayIndex: number;
  title: string;
  categoryId: CategoryId;
  /** All-day events render in the all-day row, not the time grid. */
  allDay?: boolean;
  /** Minutes past midnight; 0/0 for all-day events. */
  startMin: number;
  endMin: number;
  location?: string;
  attendees?: readonly string[];
  notes?: string;
}

// A product team's July: sprint rituals (work/team), a v2.1 launch week
// (deadline), a Lisbon trip (travel), and life around it (personal).
// Tue Jul 7 carries a deliberate three-way overlap (14:00–15:30) and
// Wed Jul 8, Thu Jul 9, Wed Jul 15, and Thu Jul 23 each carry a two-way
// overlap, so the side-by-side column layout is exercised in every state.
const EVENTS: readonly WeekEvent[] = [
  // ---- Week 0: Jul 5 – 11 ----
  {
    id: 'w0-sun-market',
    weekIndex: 0,
    dayIndex: 0,
    title: 'Farmers market',
    categoryId: 'personal',
    startMin: 540,
    endMin: 600,
    location: 'Ferry Building',
  },
  {
    id: 'w0-sun-meal-prep',
    weekIndex: 0,
    dayIndex: 0,
    title: 'Meal prep',
    categoryId: 'personal',
    startMin: 960,
    endMin: 1050,
    notes: 'Grain bowls and two soups for the launch-week crunch.',
  },
  {
    id: 'w0-mon-standup',
    weekIndex: 0,
    dayIndex: 1,
    title: 'Sprint 26 standup',
    categoryId: 'team',
    startMin: 555,
    endMin: 570,
    attendees: ['Maya Lindqvist', 'Marcus Bell', 'Priya Raman', 'Ana Duarte'],
  },
  {
    id: 'w0-mon-portfolio',
    weekIndex: 0,
    dayIndex: 1,
    title: 'Portfolio review',
    categoryId: 'work',
    startMin: 600,
    endMin: 660,
    location: 'Sky room',
    attendees: ['Priya Raman', 'Daniel Okafor'],
    notes: 'Walk the Q3 bets; flag the billing migration as at-risk.',
  },
  {
    id: 'w0-mon-growth-sync',
    weekIndex: 0,
    dayIndex: 1,
    title: 'Growth sync',
    categoryId: 'work',
    startMin: 690,
    endMin: 720,
    attendees: ['Rachel Steinberg'],
  },
  {
    id: 'w0-mon-climbing',
    weekIndex: 0,
    dayIndex: 1,
    title: 'Climbing gym',
    categoryId: 'personal',
    startMin: 1050,
    endMin: 1140,
    location: 'Mission Cliffs',
  },
  {
    id: 'w0-tue-preread',
    weekIndex: 0,
    dayIndex: 2,
    title: 'Roadmap pre-read',
    categoryId: 'work',
    startMin: 600,
    endMin: 660,
    notes: 'Read the platform-migration doc before Thursday planning.',
  },
  // Three-way overlap: 14:00–15:00, 14:30–15:30, 14:45–15:15.
  {
    id: 'w0-tue-interview',
    weekIndex: 0,
    dayIndex: 2,
    title: 'Interview — product designer',
    categoryId: 'work',
    startMin: 840,
    endMin: 900,
    location: 'Zoom',
    attendees: ['Ana Duarte'],
  },
  {
    id: 'w0-tue-tokens-sync',
    weekIndex: 0,
    dayIndex: 2,
    title: 'Design tokens sync',
    categoryId: 'work',
    startMin: 870,
    endMin: 930,
    location: 'Harbor room',
    attendees: ['Marcus Bell', 'Maya Lindqvist'],
  },
  {
    id: 'w0-tue-hiring-debrief',
    weekIndex: 0,
    dayIndex: 2,
    title: 'Hiring debrief',
    categoryId: 'team',
    startMin: 885,
    endMin: 915,
    attendees: ['Ana Duarte', 'Priya Raman'],
  },
  // Today — an all-day deadline plus a two-way morning overlap.
  {
    id: 'w0-wed-rc-cut',
    weekIndex: 0,
    dayIndex: 3,
    title: 'v2.1 release candidate cut',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
    endMin: 0,
    notes: 'Branch freezes at the cut; only cherry-picked fixes after.',
  },
  {
    id: 'w0-wed-design-crit',
    weekIndex: 0,
    dayIndex: 3,
    title: 'Design crit — mobile nav',
    categoryId: 'work',
    startMin: 540,
    endMin: 600,
    location: 'Harbor room',
    attendees: ['Marcus Bell', 'Ana Duarte', 'Rachel Steinberg'],
    notes: 'Bring the two bottom-bar variants and the tablet breakpoints.',
  },
  {
    id: 'w0-wed-one-on-one',
    weekIndex: 0,
    dayIndex: 3,
    title: '1:1 with Marcus',
    categoryId: 'work',
    startMin: 570,
    endMin: 600,
    attendees: ['Marcus Bell'],
  },
  {
    id: 'w0-wed-birthday-lunch',
    weekIndex: 0,
    dayIndex: 3,
    title: 'Team lunch — July birthdays',
    categoryId: 'team',
    startMin: 720,
    endMin: 780,
    location: 'Souvla',
    attendees: ['Whole team'],
  },
  {
    id: 'w0-wed-debrief',
    weekIndex: 0,
    dayIndex: 3,
    title: 'Interview debrief',
    categoryId: 'work',
    startMin: 840,
    endMin: 885,
    attendees: ['Ana Duarte', 'Priya Raman'],
  },
  {
    id: 'w0-wed-physio',
    weekIndex: 0,
    dayIndex: 3,
    title: 'Physio appointment',
    categoryId: 'personal',
    startMin: 990,
    endMin: 1035,
    location: 'Grove Sports Med',
  },
  {
    id: 'w0-thu-triage',
    weekIndex: 0,
    dayIndex: 4,
    title: 'Support triage rotation',
    categoryId: 'work',
    startMin: 660,
    endMin: 720,
    notes: 'Own the queue until noon; escalate anything payment-shaped.',
  },
  // Two-way overlap: 13:00–14:00 and 13:30–14:30.
  {
    id: 'w0-thu-grooming',
    weekIndex: 0,
    dayIndex: 4,
    title: 'Backlog grooming',
    categoryId: 'team',
    startMin: 780,
    endMin: 840,
    attendees: ['Maya Lindqvist', 'Marcus Bell'],
  },
  {
    id: 'w0-thu-pagination',
    weekIndex: 0,
    dayIndex: 4,
    title: 'API pagination review',
    categoryId: 'work',
    startMin: 810,
    endMin: 870,
    location: 'Zoom',
    attendees: ['Tomás Herrera'],
  },
  {
    id: 'w0-thu-bike',
    weekIndex: 0,
    dayIndex: 4,
    title: 'Pick up bike from the shop',
    categoryId: 'personal',
    startMin: 1050,
    endMin: 1080,
    location: 'Valencia Cyclery',
  },
  {
    id: 'w0-fri-metrics',
    weekIndex: 0,
    dayIndex: 5,
    title: 'Metrics review',
    categoryId: 'work',
    startMin: 570,
    endMin: 615,
    attendees: ['Rachel Steinberg', 'Daniel Okafor'],
  },
  {
    id: 'w0-fri-dry-run',
    weekIndex: 0,
    dayIndex: 5,
    title: 'Sprint 26 demo dry-run',
    categoryId: 'team',
    startMin: 900,
    endMin: 960,
    location: 'All-hands space',
    attendees: ['Whole team'],
  },
  {
    id: 'w0-fri-dinner',
    weekIndex: 0,
    dayIndex: 5,
    title: 'Dinner with Ana',
    categoryId: 'personal',
    startMin: 1110,
    endMin: 1200,
    location: 'Tartine',
  },
  {
    id: 'w0-sat-trail-run',
    weekIndex: 0,
    dayIndex: 6,
    title: 'Trail run with the club',
    categoryId: 'personal',
    startMin: 480,
    endMin: 600,
    location: 'Tilden Park',
  },
  // ---- Week 1: Jul 12 – 18 ----
  {
    id: 'w1-sun-brunch',
    weekIndex: 1,
    dayIndex: 0,
    title: 'Brunch with the Patels',
    categoryId: 'personal',
    startMin: 660,
    endMin: 750,
    location: 'Zazie',
  },
  {
    id: 'w1-mon-checkpoint',
    weekIndex: 1,
    dayIndex: 1,
    title: 'Sprint 26 checkpoint',
    categoryId: 'work',
    startMin: 570,
    endMin: 600,
    attendees: ['Maya Lindqvist', 'Priya Raman'],
  },
  {
    id: 'w1-mon-security',
    weekIndex: 1,
    dayIndex: 1,
    title: 'Security review — billing',
    categoryId: 'work',
    startMin: 660,
    endMin: 720,
    location: 'Sky room',
    attendees: ['Tomás Herrera', 'Daniel Okafor'],
    notes: 'Close out the idempotency-key findings before launch.',
  },
  {
    id: 'w1-mon-buddy',
    weekIndex: 1,
    dayIndex: 1,
    title: 'New-hire onboarding buddy',
    categoryId: 'team',
    startMin: 840,
    endMin: 900,
    attendees: ['Jordan Wu'],
  },
  {
    id: 'w1-tue-readiness',
    weekIndex: 1,
    dayIndex: 2,
    title: 'Launch readiness review',
    categoryId: 'work',
    startMin: 570,
    endMin: 630,
    location: 'Sky room',
    attendees: ['Priya Raman', 'Rachel Steinberg', 'Tomás Herrera'],
    notes: 'Go/no-go checklist: rollback plan, status page, support macro.',
  },
  {
    id: 'w1-tue-lunch-ana',
    weekIndex: 1,
    dayIndex: 2,
    title: 'Lunch with Ana',
    categoryId: 'personal',
    startMin: 750,
    endMin: 810,
    location: 'Tartine',
  },
  {
    id: 'w1-tue-a11y',
    weekIndex: 1,
    dayIndex: 2,
    title: 'A11y audit walkthrough',
    categoryId: 'work',
    startMin: 900,
    endMin: 960,
    attendees: ['Marcus Bell'],
  },
  {
    id: 'w1-tue-pack',
    weekIndex: 1,
    dayIndex: 2,
    title: 'Pack for Lisbon',
    categoryId: 'personal',
    startMin: 1140,
    endMin: 1200,
  },
  // Launch day — all-day deadline, a long war room, and an overlap inside.
  {
    id: 'w1-wed-launch',
    weekIndex: 1,
    dayIndex: 3,
    title: 'v2.1 launch',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
    endMin: 0,
    notes: 'Rollout ramps 10% → 50% → 100% through the morning.',
  },
  {
    id: 'w1-wed-war-room',
    weekIndex: 1,
    dayIndex: 3,
    title: 'Launch war room',
    categoryId: 'work',
    startMin: 540,
    endMin: 720,
    location: 'Harbor room',
    attendees: ['Whole team'],
    notes: 'Dashboards on the wall; Tomás owns rollback authority.',
  },
  {
    id: 'w1-wed-retro-prep',
    weekIndex: 1,
    dayIndex: 3,
    title: 'Launch retro prep',
    categoryId: 'team',
    startMin: 600,
    endMin: 630,
    attendees: ['Maya Lindqvist'],
  },
  {
    id: 'w1-wed-toast',
    weekIndex: 1,
    dayIndex: 3,
    title: 'Launch toast',
    categoryId: 'team',
    startMin: 960,
    endMin: 1020,
    location: 'Rooftop',
    attendees: ['Whole team'],
  },
  {
    id: 'w1-thu-flight-out',
    weekIndex: 1,
    dayIndex: 4,
    title: 'Flight SFO → LIS',
    categoryId: 'travel',
    startMin: 460,
    endMin: 1120,
    location: 'SFO International',
    notes: 'TAP 218 · seat 22A · connection-free.',
  },
  {
    id: 'w1-fri-pto',
    weekIndex: 1,
    dayIndex: 5,
    title: 'PTO — Lisbon',
    categoryId: 'travel',
    allDay: true,
    startMin: 0,
    endMin: 0,
  },
  {
    id: 'w1-sat-pto',
    weekIndex: 1,
    dayIndex: 6,
    title: 'PTO — Lisbon',
    categoryId: 'travel',
    allDay: true,
    startMin: 0,
    endMin: 0,
  },
  {
    id: 'w1-sat-alfama',
    weekIndex: 1,
    dayIndex: 6,
    title: 'Alfama walking tour',
    categoryId: 'personal',
    startMin: 600,
    endMin: 720,
    location: 'Largo das Portas do Sol',
  },
  // ---- Week 2: Jul 19 – 25 ----
  {
    id: 'w2-sun-pto',
    weekIndex: 2,
    dayIndex: 0,
    title: 'PTO — Lisbon',
    categoryId: 'travel',
    allDay: true,
    startMin: 0,
    endMin: 0,
  },
  {
    id: 'w2-sun-sintra',
    weekIndex: 2,
    dayIndex: 0,
    title: 'Day trip to Sintra',
    categoryId: 'personal',
    startMin: 540,
    endMin: 1020,
    location: 'Pena Palace',
    notes: 'Train from Rossio; buy palace tickets on the platform.',
  },
  {
    id: 'w2-mon-pto',
    weekIndex: 2,
    dayIndex: 1,
    title: 'PTO — Lisbon',
    categoryId: 'travel',
    allDay: true,
    startMin: 0,
    endMin: 0,
  },
  {
    id: 'w2-tue-flight-back',
    weekIndex: 2,
    dayIndex: 2,
    title: 'Flight LIS → SFO',
    categoryId: 'travel',
    startMin: 910,
    endMin: 1200,
    location: 'Humberto Delgado',
    notes: 'TAP 217 · lands 6:40 PM local after the date line math.',
  },
  {
    id: 'w2-wed-catchup',
    weekIndex: 2,
    dayIndex: 3,
    title: 'Catch-up: inbox + reviews',
    categoryId: 'work',
    startMin: 540,
    endMin: 660,
    notes: 'Two-hour block; decline anything that lands on top.',
  },
  {
    id: 'w2-wed-one-on-one',
    weekIndex: 2,
    dayIndex: 3,
    title: '1:1 with Priya',
    categoryId: 'work',
    startMin: 900,
    endMin: 930,
    attendees: ['Priya Raman'],
  },
  {
    id: 'w2-thu-planning',
    weekIndex: 2,
    dayIndex: 4,
    title: 'Sprint 27 planning',
    categoryId: 'work',
    startMin: 570,
    endMin: 660,
    location: 'Sky room',
    attendees: ['Whole team'],
    notes: 'Carry-over: billing migration phase 1 and the a11y fixes.',
  },
  // Two-way overlap: 11:00–12:00 and 11:30–12:00.
  {
    id: 'w2-thu-poker',
    weekIndex: 2,
    dayIndex: 4,
    title: 'Planning poker',
    categoryId: 'team',
    startMin: 660,
    endMin: 720,
    attendees: ['Whole team'],
  },
  {
    id: 'w2-thu-vendor',
    weekIndex: 2,
    dayIndex: 4,
    title: 'Vendor renewal call',
    categoryId: 'work',
    startMin: 690,
    endMin: 720,
    location: 'Zoom',
    attendees: ['Daniel Okafor'],
  },
  {
    id: 'w2-thu-climbing',
    weekIndex: 2,
    dayIndex: 4,
    title: 'Climbing gym',
    categoryId: 'personal',
    startMin: 1050,
    endMin: 1140,
    location: 'Mission Cliffs',
  },
  {
    id: 'w2-fri-expenses',
    weekIndex: 2,
    dayIndex: 5,
    title: 'Expense reports due',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
    endMin: 0,
    notes: 'Lisbon receipts are in the trip folder.',
  },
  {
    id: 'w2-fri-metrics',
    weekIndex: 2,
    dayIndex: 5,
    title: 'Metrics review',
    categoryId: 'work',
    startMin: 570,
    endMin: 615,
    attendees: ['Rachel Steinberg'],
  },
  {
    id: 'w2-fri-retro',
    weekIndex: 2,
    dayIndex: 5,
    title: 'Retro — sprint 26 + launch',
    categoryId: 'team',
    startMin: 840,
    endMin: 900,
    location: 'Harbor room',
    attendees: ['Whole team'],
  },
  {
    id: 'w2-sat-market',
    weekIndex: 2,
    dayIndex: 6,
    title: 'Farmers market',
    categoryId: 'personal',
    startMin: 540,
    endMin: 600,
    location: 'Ferry Building',
  },
];

const EVENT_BY_ID = new Map(EVENTS.map(event => [event.id, event]));

// ============= TIME HELPERS =============
// Pure minute math over the fixed fixtures — no Date anywhere.

/** "630" → "10:30 AM"; drops ":00" so hour lines read "10 AM". */
function formatMin(min: number): string {
  const hour24 = Math.floor(min / 60);
  const minute = min % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0
    ? \`\${hour12} \${period}\`
    : \`\${hour12}:\${String(minute).padStart(2, '0')} \${period}\`;
}

function formatRange(startMin: number, endMin: number): string {
  return \`\${formatMin(startMin)} – \${formatMin(endMin)}\`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return \`\${rest} min\`;
  }
  if (rest === 0) {
    return hours === 1 ? '1 hr' : \`\${hours} hr\`;
  }
  return \`\${hours} hr \${rest} min\`;
}

/** "Wednesday, July 8" for a fixture week/day pair. */
function dayLabel(weekIndex: number, dayIndex: number): string {
  const date = WEEKS[weekIndex].startDay + dayIndex;
  return \`\${WEEKDAYS[dayIndex].full}, July \${date}\`;
}

const HOUR_MARKS: readonly number[] = (() => {
  const marks: number[] = [];
  for (let min = DAY_START_MIN; min <= DAY_END_MIN; min += 60) {
    marks.push(min);
  }
  return marks;
})();

// ============= OVERLAP LAYOUT =============

interface PositionedEvent {
  event: WeekEvent;
  /** Sub-column inside the overlap cluster. */
  column: number;
  /** Total sub-columns in the cluster (all members share the value). */
  columns: number;
}

/**
 * Splits one day's timed events into overlap clusters and assigns each
 * event a sub-column: within a cluster, an event takes the first column
 * whose previous occupant has already ended, and every member renders at
 * 1/columns of the day width so overlapping blocks sit side by side.
 */
function layoutDayEvents(events: readonly WeekEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) => a.startMin - b.startMin || b.endMin - a.endMin,
  );
  const results: PositionedEvent[] = [];
  let cluster: WeekEvent[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) {
      return;
    }
    const columnEnds: number[] = [];
    const placed = cluster.map(event => {
      let column = columnEnds.findIndex(end => end <= event.startMin);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(event.endMin);
      } else {
        columnEnds[column] = event.endMin;
      }
      return {event, column, columns: 0};
    });
    for (const item of placed) {
      item.columns = columnEnds.length;
    }
    results.push(...placed);
    cluster = [];
    clusterEnd = -1;
  };

  for (const event of sorted) {
    if (cluster.length > 0 && event.startMin >= clusterEnd) {
      flush();
    }
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.endMin);
  }
  flush();
  return results;
}

// ============= TIME GRID (>640px) =============

function EventBlock({
  positioned,
  isSelected,
  onSelect,
}: {
  positioned: PositionedEvent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const {event, column, columns} = positioned;
  const category = CATEGORY_BY_ID.get(event.categoryId);
  // Clamp long events (early flights, late dinners) to the visible window.
  const start = Math.max(event.startMin, DAY_START_MIN);
  const end = Math.min(event.endMin, DAY_END_MIN);
  const top = ((start - DAY_START_MIN) / 60) * HOUR_HEIGHT + 1;
  const height = Math.max(((end - start) / 60) * HOUR_HEIGHT - 2, 20);
  const label = [
    event.title,
    formatRange(event.startMin, event.endMin),
    dayLabel(event.weekIndex, event.dayIndex),
    category?.label,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      style={{
        ...styles.eventBlock,
        ...(isSelected ? styles.eventBlockSelected : undefined),
        top,
        height,
        left: \`calc(\${(column / columns) * 100}% + 2px)\`,
        width: \`calc(\${100 / columns}% - 4px)\`,
        backgroundColor: category?.color,
      }}
      aria-label={label}
      aria-pressed={isSelected}
      onClick={() => onSelect(event.id)}>
      <span style={styles.eventBlockTitle}>{event.title}</span>
      {height >= 34 ? (
        <span style={styles.eventBlockTime}>
          {formatRange(event.startMin, event.endMin)}
        </span>
      ) : null}
    </button>
  );
}

function WeekTimeGrid({
  weekIndex,
  eventsByDay,
  selectedId,
  onSelect,
}: {
  weekIndex: number;
  /** Visible (filter-respecting) timed events, indexed by dayIndex. */
  eventsByDay: ReadonlyArray<readonly WeekEvent[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const showNowRule = weekIndex === TODAY_WEEK_INDEX;
  const nowTop = ((NOW_MIN - DAY_START_MIN) / 60) * HOUR_HEIGHT;

  return (
    <div style={styles.timeGrid}>
      <div style={styles.hourGutter} aria-hidden="true">
        {HOUR_MARKS.map(min => (
          <span
            key={min}
            style={{
              ...styles.hourLabel,
              top: ((min - DAY_START_MIN) / 60) * HOUR_HEIGHT,
            }}>
            {formatMin(min)}
          </span>
        ))}
      </div>
      {eventsByDay.map((dayEvents, dayIndex) => {
        const isWeekend = dayIndex === 0 || dayIndex === 6;
        return (
          <div
            // Fixture days never reorder, so the column index is stable.
            // eslint-disable-next-line react/no-array-index-key
            key={dayIndex}
            style={{
              ...styles.dayColumn,
              ...(isWeekend ? styles.dayColumnWeekend : undefined),
            }}>
            {layoutDayEvents(dayEvents).map(positioned => (
              <EventBlock
                key={positioned.event.id}
                positioned={positioned}
                isSelected={positioned.event.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        );
      })}
      {showNowRule ? (
        <div style={{...styles.nowRule, top: nowTop}} aria-hidden="true">
          <span
            style={{
              ...styles.nowDot,
              left: \`calc(\${(TODAY_DAY_INDEX / 7) * 100}% - 4px)\`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

// ============= EVENT DETAIL =============

function EventDetail({
  event,
  onClose,
}: {
  event: WeekEvent;
  onClose?: () => void;
}) {
  const category = CATEGORY_BY_ID.get(event.categoryId);
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="start">
        <div
          style={{...styles.eventBar, backgroundColor: category?.color}}
          aria-hidden="true"
        />
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={2}>{event.title}</Heading>
            <Text type="supporting" color="secondary">
              {dayLabel(event.weekIndex, event.dayIndex)}
            </Text>
          </VStack>
        </StackItem>
        {onClose ? (
          <IconButton
            label="Close event details"
            icon={<Icon icon={XIcon} size="sm" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        ) : null}
      </HStack>
      {category ? (
        <HStack gap={2} vAlign="center">
          <Token label={category.label} color={category.token} size="sm" />
          {event.allDay ? <Badge label="All day" variant="neutral" /> : null}
        </HStack>
      ) : null}
      <VStack gap={2}>
        <HStack gap={1} vAlign="center">
          <Icon icon={ClockIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {event.allDay
              ? 'All day'
              : \`\${formatRange(event.startMin, event.endMin)} · \${formatDuration(
                  event.endMin - event.startMin,
                )}\`}
          </Text>
        </HStack>
        {event.location ? (
          <HStack gap={1} vAlign="center">
            <Icon icon={MapPinIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary" maxLines={1}>
              {event.location}
            </Text>
          </HStack>
        ) : null}
      </VStack>
      {event.attendees && event.attendees.length > 0 ? (
        <>
          <Divider />
          <VStack gap={2}>
            <HStack gap={1} vAlign="center">
              <Icon icon={UsersIcon} size="sm" color="secondary" />
              <Text type="label" color="secondary">
                Attendees
              </Text>
            </HStack>
            {event.attendees.map(attendee => (
              <HStack key={attendee} gap={2} vAlign="center">
                <Avatar name={attendee} size="xsmall" />
                <Text type="body">{attendee}</Text>
              </HStack>
            ))}
          </VStack>
        </>
      ) : null}
      {event.notes ? (
        <>
          <Divider />
          <VStack gap={2}>
            <HStack gap={1} vAlign="center">
              <Icon icon={AlignLeftIcon} size="sm" color="secondary" />
              <Text type="label" color="secondary">
                Notes
              </Text>
            </HStack>
            <Text type="body" color="secondary">
              {event.notes}
            </Text>
          </VStack>
        </>
      ) : null}
    </VStack>
  );
}

// ============= AGENDA LIST (<=640px) =============

function AgendaRow({
  event,
  isExpanded,
  onToggle,
}: {
  event: WeekEvent;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  const category = CATEGORY_BY_ID.get(event.categoryId);
  const label = [
    event.title,
    event.allDay ? 'all day' : formatRange(event.startMin, event.endMin),
    category?.label,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <VStack gap={2}>
      <button
        type="button"
        style={{
          ...styles.agendaRow,
          ...(isExpanded ? styles.agendaRowExpanded : undefined),
        }}
        aria-label={label}
        aria-expanded={isExpanded}
        onClick={() => onToggle(event.id)}>
        <div
          style={{...styles.eventBar, backgroundColor: category?.color}}
          aria-hidden="true"
        />
        <div style={styles.agendaTime}>
          {event.allDay ? (
            <Text type="supporting" color="secondary">
              All day
            </Text>
          ) : (
            <VStack gap={0}>
              <Text type="supporting" hasTabularNumbers>
                {formatMin(event.startMin)}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatMin(event.endMin)}
              </Text>
            </VStack>
          )}
        </div>
        <StackItem size="fill">
          <VStack gap={0.5}>
            <Text type="body" maxLines={2}>
              {event.title}
            </Text>
            {event.location ? (
              <Text type="supporting" color="secondary" maxLines={1}>
                {event.location}
              </Text>
            ) : null}
          </VStack>
        </StackItem>
      </button>
      {isExpanded ? (
        <Card padding={3}>
          <EventDetail event={event} />
        </Card>
      ) : null}
    </VStack>
  );
}

function WeekAgendaList({
  weekIndex,
  eventsByDay,
  expandedId,
  onToggle,
}: {
  weekIndex: number;
  /** Visible events (all-day first, then by start), indexed by dayIndex. */
  eventsByDay: ReadonlyArray<readonly WeekEvent[]>;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const total = eventsByDay.reduce((sum, day) => sum + day.length, 0);
  if (total === 0) {
    return (
      <EmptyState
        icon={<Icon icon={CalendarOffIcon} size="lg" />}
        title="Nothing this week"
        description="Every event this week is hidden by the category filters."
      />
    );
  }
  return (
    <VStack gap={4}>
      {eventsByDay.map((dayEvents, dayIndex) => {
        const isToday =
          weekIndex === TODAY_WEEK_INDEX && dayIndex === TODAY_DAY_INDEX;
        return (
          // Fixture days never reorder, so the index is a stable key.
          // eslint-disable-next-line react/no-array-index-key
          <VStack key={dayIndex} gap={2}>
            <HStack gap={2} vAlign="center">
              <Heading level={2}>{dayLabel(weekIndex, dayIndex)}</Heading>
              {isToday ? <Badge label="Today" variant="info" /> : null}
            </HStack>
            {dayEvents.length === 0 ? (
              <Text type="supporting" color="secondary">
                Nothing scheduled
              </Text>
            ) : (
              dayEvents.map(event => (
                <AgendaRow
                  key={event.id}
                  event={event}
                  isExpanded={event.id === expandedId}
                  onToggle={onToggle}
                />
              ))
            )}
            <Divider />
          </VStack>
        );
      })}
    </VStack>
  );
}

// ============= PAGE =============

export default function CalendarWeekAgendaTemplate() {
  const [weekIndex, setWeekIndex] = useState(TODAY_WEEK_INDEX);
  // One selection drives both surfaces: the docked panel >640px, the
  // inline expanded agenda card <=640px.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Category ids currently hidden by the legend toggles.
  const [hidden, setHidden] = useState<ReadonlySet<CategoryId>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  // <=640px: vertical agenda list grouped by day, ~40px controls,
  // horizontally scrolling legend, inline detail cards.
  const isNarrow = useMediaQuery('(max-width: 640px)');

  const week = WEEKS[weekIndex];

  // Visible events for the current week, split by day. Timed lists feed the
  // grid; the agenda list gets all-day rows prepended per day.
  const {timedByDay, allDayByDay, agendaByDay, visibleCount} = useMemo(() => {
    const timed: WeekEvent[][] = Array.from({length: 7}, () => []);
    const allDay: WeekEvent[][] = Array.from({length: 7}, () => []);
    let count = 0;
    for (const event of EVENTS) {
      if (event.weekIndex !== weekIndex || hidden.has(event.categoryId)) {
        continue;
      }
      count += 1;
      if (event.allDay) {
        allDay[event.dayIndex].push(event);
      } else {
        timed[event.dayIndex].push(event);
      }
    }
    for (const list of timed) {
      list.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
    }
    const agenda = timed.map((list, dayIndex) => [
      ...allDay[dayIndex],
      ...list,
    ]);
    return {
      timedByDay: timed,
      allDayByDay: allDay,
      agendaByDay: agenda,
      visibleCount: count,
    };
  }, [weekIndex, hidden]);

  // A selection only "exists" while its event is visible: hiding its
  // category (or paging weeks, which clears it) closes the panel.
  const selectedEvent =
    selectedId !== null ? EVENT_BY_ID.get(selectedId) : undefined;
  const visibleSelected =
    selectedEvent && !hidden.has(selectedEvent.categoryId)
      ? selectedEvent
      : undefined;

  const goToWeek = (index: number) => {
    if (index < 0 || index >= WEEKS.length || index === weekIndex) {
      return;
    }
    setWeekIndex(index);
    setSelectedId(null);
    setAnnouncement(\`Showing week of \${WEEKS[index].label}\`);
  };

  const goToToday = () => {
    setWeekIndex(TODAY_WEEK_INDEX);
    setSelectedId(null);
    setAnnouncement(
      \`Showing week of \${WEEKS[TODAY_WEEK_INDEX].label}, contains today\`,
    );
  };

  const selectEvent = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
    const event = EVENT_BY_ID.get(id);
    if (event) {
      setAnnouncement(
        selectedId === id
          ? \`Closed details for \${event.title}\`
          : \`Showing details for \${event.title}\`,
      );
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
  };

  const toggleCategory = (categoryId: CategoryId, nextVisible: boolean) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (nextVisible) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    const category = CATEGORY_BY_ID.get(categoryId);
    if (category) {
      setAnnouncement(
        nextVisible
          ? \`Showing \${category.label} events\`
          : \`Hid \${category.label} events\`,
      );
    }
  };

  const showAllCategories = () => {
    setHidden(new Set());
    setAnnouncement('Showing all categories');
  };

  // ---- day header row (weekday + ringed date) ----
  const dayHeaderRow = (
    <div style={styles.headerRow}>
      <div aria-hidden="true" />
      {WEEKDAYS.map((weekday, dayIndex) => {
        const isToday =
          weekIndex === TODAY_WEEK_INDEX && dayIndex === TODAY_DAY_INDEX;
        const isWeekend = dayIndex === 0 || dayIndex === 6;
        return (
          <div key={weekday.full} style={styles.dayHeaderCell}>
            <Text
              type="supporting"
              color={isWeekend ? 'secondary' : undefined}>
              {weekday.short}
            </Text>
            <span
              style={{
                ...styles.dayNumber,
                ...(isToday ? styles.dayNumberToday : undefined),
              }}>
              {week.startDay + dayIndex}
            </span>
          </div>
        );
      })}
    </div>
  );

  // ---- all-day row ----
  const allDayRow = (
    <div style={styles.allDayRow}>
      <div style={styles.allDayGutter}>
        <Text type="supporting" color="secondary">
          All day
        </Text>
      </div>
      {allDayByDay.map((dayEvents, dayIndex) => (
        // Fixture days never reorder, so the index is a stable key.
        // eslint-disable-next-line react/no-array-index-key
        <div key={dayIndex} style={styles.allDayCell}>
          {dayEvents.map(event => {
            const category = CATEGORY_BY_ID.get(event.categoryId);
            return (
              <button
                key={event.id}
                type="button"
                style={{
                  ...styles.allDayChip,
                  backgroundColor: category?.color,
                  ...(event.id === selectedId
                    ? styles.eventBlockSelected
                    : undefined),
                }}
                aria-label={\`\${event.title}, all day, \${dayLabel(
                  weekIndex,
                  dayIndex,
                )}, \${category?.label ?? ''}\`}
                aria-pressed={event.id === selectedId}
                onClick={() => selectEvent(event.id)}>
                {event.title}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  // ---- category legend ----
  const legendToggles = CATEGORIES.map(category => {
    const isVisible = !hidden.has(category.id);
    return (
      <ToggleButton
        key={category.id}
        label={category.label}
        size={isNarrow ? 'md' : 'sm'}
        isPressed={isVisible}
        onPressedChange={next => toggleCategory(category.id, next)}
        tooltip={
          isVisible
            ? \`Hide \${category.label} events\`
            : \`Show \${category.label} events\`
        }
        icon={
          <span
            style={{
              ...styles.legendSwatch,
              // Filled swatch while visible, hollow while hidden.
              backgroundColor: isVisible ? category.color : 'transparent',
              boxShadow: isVisible
                ? undefined
                : \`inset 0 0 0 2px \${category.color}\`,
            }}
            aria-hidden="true"
          />
        }
      />
    );
  });

  const legend = isNarrow ? (
    <div style={styles.legendScroll}>
      {legendToggles}
      {hidden.size > 0 ? (
        <Button label="Show all" variant="ghost" onClick={showAllCategories} />
      ) : null}
    </div>
  ) : (
    <HStack gap={2} vAlign="center" wrap="wrap">
      {legendToggles}
      {hidden.size > 0 ? (
        <Button
          label="Show all"
          variant="ghost"
          size="sm"
          onClick={showAllCategories}
        />
      ) : null}
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={2}>
            {/* wrap="wrap" drops the pager cluster below the title on
                narrow viewports instead of clipping. */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={CalendarRangeIcon} size="md" color="secondary" />
                  <Heading level={1}>Week agenda</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {visibleCount} event{visibleCount === 1 ? '' : 's'}
                  </Text>
                </HStack>
              </StackItem>
              <HStack gap={1} vAlign="center">
                <IconButton
                  label="Previous week"
                  icon={<Icon icon={ChevronLeftIcon} size="sm" />}
                  variant="ghost"
                  size={isNarrow ? 'md' : 'sm'}
                  isDisabled={weekIndex === 0}
                  onClick={() => goToWeek(weekIndex - 1)}
                />
                <div
                  style={{
                    ...styles.weekLabel,
                    width: isNarrow ? 136 : 156,
                  }}>
                  <Heading level={2}>{week.label}</Heading>
                </div>
                <IconButton
                  label="Next week"
                  icon={<Icon icon={ChevronRightIcon} size="sm" />}
                  variant="ghost"
                  size={isNarrow ? 'md' : 'sm'}
                  isDisabled={weekIndex === WEEKS.length - 1}
                  onClick={() => goToWeek(weekIndex + 1)}
                />
                <Button
                  label="Today"
                  size={isNarrow ? 'md' : 'sm'}
                  onClick={goToToday}
                />
              </HStack>
            </HStack>
            {legend}
          </VStack>
        </LayoutHeader>
      }
      end={
        // The detail panel "opens" on event click: it only mounts while an
        // event is selected, and only on wide viewports — phones expand the
        // detail inline in the agenda list instead.
        !isNarrow && visibleSelected ? (
          <LayoutPanel width={320} padding={0} label="Event details">
            <div style={styles.panelScroll}>
              <EventDetail event={visibleSelected} onClose={closeDetail} />
            </div>
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={isNarrow ? undefined : 0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {isNarrow ? (
            // <=640px: the time grid swaps entirely for the vertical agenda
            // list grouped by day; LayoutContent scrolls it as one page.
            <WeekAgendaList
              weekIndex={weekIndex}
              eventsByDay={agendaByDay}
              expandedId={visibleSelected ? visibleSelected.id : null}
              onToggle={selectEvent}
            />
          ) : (
            // >640px: pinned day-header + all-day rows over the internally
            // scrolling hour grid.
            <VStack gap={0} style={styles.fill}>
              {dayHeaderRow}
              {allDayRow}
              <StackItem size="fill" style={styles.gridScroll}>
                <WeekTimeGrid
                  weekIndex={weekIndex}
                  eventsByDay={timedByDay}
                  selectedId={visibleSelected ? visibleSelected.id : null}
                  onSelect={selectEvent}
                />
              </StackItem>
            </VStack>
          )}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};