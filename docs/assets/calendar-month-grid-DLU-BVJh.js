var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three fixture months — June, July, and
 *   August 2026 — with a fixed "today" of Wednesday, July 8, 2026; five
 *   calendar categories mapped to categorical color tokens; and ~45 events
 *   with fixed days, start times, durations, and locations spread across the
 *   three months, including two intentionally overloaded days that exercise
 *   the "+N more" overflow path)
 * @output Month-view CALENDAR surface: a header (Calendar Heading + visible
 *   event count, ChevronLeft/ChevronRight IconButtons flanking a fixed-width
 *   month label, a "Today" Button, and a category filter legend of
 *   ToggleButton chips with colored swatch dots), a 7-column day grid whose
 *   cells are full-bleed buttons — weekend columns and out-of-month days
 *   shaded, today's date wearing an accent ring, the selected day an inset
 *   accent outline — carrying up to three solid category-colored event chips
 *   plus a "+N more" overflow line, and a docked 320px selected-day panel
 *   listing that day's events as Cards (color bar, title, time · duration,
 *   location, category Token). Prev/next paging swaps between the three
 *   fixture months; leading/trailing cells that belong to a fixture month
 *   navigate there on tap; legend toggles hide categories everywhere at once
 * @position Page template; emitted by \`astryx template calendar-month-grid\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the calendar chrome
 * (title + count, month pager, Today, category legend). LayoutContent
 * (padding 0) stacks the weekday header row over the day grid; the grid rows
 * stretch to fill the viewport and scroll internally when crushed.
 * LayoutPanel end 320 hosts the selected-day event list. Choose this over a
 * dashboard or table when the surface is a month-at-a-glance schedule —
 * day cells, event chips, category filters — rather than rows or widgets.
 *
 * Responsive contract:
 * - >640px: header | weekday row | day grid (fills height, rows
 *   minmax(112px, 1fr), grid scrolls internally on short viewports) |
 *   selected-day panel 320 (fixed, scrolls vertically). Day cells show up to
 *   three title chips; overloaded days swap the third chip for "+N more".
 * - <=640px (usable at 375px): the panel leaves the right edge and stacks
 *   below the grid as a full-width section; the column flows at natural
 *   height and LayoutContent scrolls it as one page. Event chips collapse to
 *   category-colored dots (up to four, then a "+N" count) so seven columns
 *   fit a 375px viewport; weekday labels shrink to single letters; the
 *   legend row becomes a horizontal scroller instead of wrapping; legend
 *   toggles and pager buttons upsize to "md" (~40px tap targets).
 * - Header rows are wrap="wrap", so the pager + Today cluster drops below
 *   the title instead of clipping; the month label keeps a fixed width so
 *   paging never shifts the pager buttons under a moving finger.
 * - No hover-only interactions: every day cell is a real button (tap,
 *   focus, and Enter all select), legend toggles are ToggleButtons with
 *   aria-pressed, and month changes are announced via a visually-hidden
 *   aria-live region.
 * - The grid never forces horizontal overflow: columns are
 *   minmax(0, 1fr) and chips truncate with ellipsis inside their cell.
 *
 * Container policy (calendar archetype): the page chrome is frame-first
 * rows and panels; the day grid is a bespoke bordered CSS grid (gap-line
 * technique over --color-border) because no core component models a month
 * matrix; Cards are reserved for the selected-day event list. All counts
 * (header total, "+N more", panel list) recompute live from the category
 * filter. Fixtures are fixed calendar dates — Date is used only to derive
 * weekday alignment for those fixed dates, never to read a clock.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

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
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarDaysIcon,
  CalendarOffIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Desktop: the grid area is the only scroller between header and panel.
  gridScroll: {minHeight: 0, overflowY: 'auto'},
  // Weekday header row mirrors the grid's 7 columns + 1px gaps so labels
  // sit exactly above their column of day cells.
  weekdayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 1,
    flexShrink: 0,
    padding: '0 0 var(--spacing-1)',
  },
  weekdayCell: {
    padding: 'var(--spacing-1) var(--spacing-2) 0',
    minWidth: 0,
    overflow: 'hidden',
  },
  // Gap-line technique: the grid's background paints the 1px cell borders.
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 1,
    backgroundColor: 'var(--color-border)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  monthGridFill: {minHeight: '100%'},
  // Day cells are real buttons: tap anywhere in the cell to select the day.
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 2,
    minWidth: 0,
    minHeight: 0,
    margin: 0,
    border: 'none',
    padding: 'var(--spacing-1)',
    font: 'inherit',
    textAlign: 'left',
    color: 'inherit',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  cellInteractive: {cursor: 'pointer'},
  // Weekend columns and out-of-month days share the muted wash; out-of-month
  // days are additionally distinguished by a faint day number and no chips.
  cellShaded: {backgroundColor: 'var(--color-background-muted)'},
  cellSelected: {boxShadow: 'inset 0 0 0 2px var(--color-accent)'},
  dayNumberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  dayNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  dayNumberOutside: {color: 'var(--color-text-secondary)', opacity: 0.6},
  // Today wears a 2px accent ring around the day number, not the cell, so
  // it stays legible even when today is also the selected day.
  dayNumberToday: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    color: 'var(--color-accent)',
  },
  chipStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    overflow: 'hidden',
  },
  chip: {
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 500,
    color: '#FFFFFF',
    borderRadius: 4,
    padding: '1px 6px',
  },
  moreLabel: {
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    padding: '0 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // <=640px: chips collapse to dots so seven columns fit a 375px viewport.
  dotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    minWidth: 0,
    overflow: 'hidden',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotOverflow: {
    fontSize: 10,
    lineHeight: '12px',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
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
  // Fixed-width month label so paging never shifts the pager buttons.
  monthLabel: {textAlign: 'center', flexShrink: 0},
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  panelStacked: {padding: 'var(--spacing-4)'},
  // Colored spine on each panel event card.
  eventBar: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
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
  /** Solid chip / dot / bar color — categorical token with hex fallback. */
  color: string;
  /** Matching Token color for the selected-day panel. */
  token: TokenColor;
}

const CATEGORIES: readonly CalendarCategory[] = [
  {
    id: 'work',
    label: 'Work',
    color: 'var(--color-data-categorical-blue, #0171E3)',
    token: 'blue',
  },
  {
    id: 'team',
    label: 'Team',
    color: 'var(--color-data-categorical-purple, #6B1EFD)',
    token: 'purple',
  },
  {
    id: 'personal',
    label: 'Personal',
    color: 'var(--color-data-categorical-green, #0B991F)',
    token: 'green',
  },
  {
    id: 'deadline',
    label: 'Deadlines',
    color: 'var(--color-data-categorical-orange, #EB6E00)',
    token: 'orange',
  },
  {
    id: 'travel',
    label: 'Travel',
    color: 'var(--color-data-categorical-teal, #0E7E8B)',
    token: 'teal',
  },
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map(cat => [cat.id, cat]));

interface MonthFixture {
  key: string;
  /** Month name alone, for selected-day headings ("July 8"). */
  name: string;
  /** Month + year, for the header pager ("July 2026"). */
  label: string;
  year: number;
  /** 0-based month for calendar math. */
  month: number;
}

// Three fixture months; paging is clamped to this window.
const MONTHS: readonly MonthFixture[] = [
  {key: '2026-06', name: 'June', label: 'June 2026', year: 2026, month: 5},
  {key: '2026-07', name: 'July', label: 'July 2026', year: 2026, month: 6},
  {key: '2026-08', name: 'August', label: 'August 2026', year: 2026, month: 7},
];

// Fixed fixture "today": Wednesday, July 8, 2026. Never read from a clock.
const TODAY_MONTH_INDEX = 1;
const TODAY_DAY = 8;

const WEEKDAYS = [
  {full: 'Sunday', short: 'Sun', min: 'S'},
  {full: 'Monday', short: 'Mon', min: 'M'},
  {full: 'Tuesday', short: 'Tue', min: 'T'},
  {full: 'Wednesday', short: 'Wed', min: 'W'},
  {full: 'Thursday', short: 'Thu', min: 'T'},
  {full: 'Friday', short: 'Fri', min: 'F'},
  {full: 'Saturday', short: 'Sat', min: 'S'},
] as const;

interface CalendarEvent {
  id: string;
  /** Index into MONTHS. */
  monthIndex: number;
  day: number;
  title: string;
  categoryId: CategoryId;
  /** All-day events sort first and render "All day" instead of a time. */
  allDay?: boolean;
  time?: string;
  /** Minutes past midnight, for in-day ordering; 0 for all-day events. */
  startMin: number;
  duration?: string;
  location?: string;
}

// A product team's summer: sprint rituals (work/team), releases and due
// dates (deadline), appointments and PTO (personal), flights and offsites
// (travel). July 8 (today) carries 5 events and July 14 carries 4, so both
// exercise the "+N more" overflow; weekends carry personal/travel events so
// the weekend shading reads under real chips.
const EVENTS: readonly CalendarEvent[] = [
  // ---- June 2026 ----
  {
    id: 'jun-02-planning',
    monthIndex: 0,
    day: 2,
    title: 'Sprint 25 planning',
    categoryId: 'work',
    time: '9:30 AM',
    startMin: 570,
    duration: '90 min',
    location: 'Sky room',
  },
  {
    id: 'jun-04-design-review',
    monthIndex: 0,
    day: 4,
    title: 'Design review — checkout flow',
    categoryId: 'work',
    time: '11:00 AM',
    startMin: 660,
    duration: '1 hr',
    location: 'Harbor room',
  },
  {
    id: 'jun-04-dentist',
    monthIndex: 0,
    day: 4,
    title: 'Dentist',
    categoryId: 'personal',
    time: '3:00 PM',
    startMin: 900,
    duration: '45 min',
    location: 'Grove Dental',
  },
  {
    id: 'jun-08-roadmap',
    monthIndex: 0,
    day: 8,
    title: 'Quarterly roadmap readout',
    categoryId: 'work',
    time: '9:00 AM',
    startMin: 540,
    duration: '1 hr',
  },
  {
    id: 'jun-10-lunch',
    monthIndex: 0,
    day: 10,
    title: 'Team lunch — new-hire welcome',
    categoryId: 'team',
    time: '12:00 PM',
    startMin: 720,
    duration: '1 hr',
    location: 'Field Kitchen',
  },
  {
    id: 'jun-12-brief-due',
    monthIndex: 0,
    day: 12,
    title: 'Pricing brief due',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'jun-13-trail-run',
    monthIndex: 0,
    day: 13,
    title: 'Trail run with the club',
    categoryId: 'personal',
    time: '8:00 AM',
    startMin: 480,
    duration: '2 hr',
    location: 'Tilden Park',
  },
  {
    id: 'jun-15-vendor-demo',
    monthIndex: 0,
    day: 15,
    title: 'Vendor demo — analytics suite',
    categoryId: 'work',
    time: '10:00 AM',
    startMin: 600,
    duration: '1 hr',
  },
  {
    id: 'jun-17-one-on-one',
    monthIndex: 0,
    day: 17,
    title: '1:1 with Priya',
    categoryId: 'work',
    time: '4:00 PM',
    startMin: 960,
    duration: '30 min',
  },
  {
    id: 'jun-22-offsite-flight',
    monthIndex: 0,
    day: 22,
    title: 'Flight SFO → DEN, offsite',
    categoryId: 'travel',
    time: '7:05 AM',
    startMin: 425,
    duration: '2.5 hr',
    location: 'SFO Terminal 3',
  },
  {
    id: 'jun-23-offsite-day',
    monthIndex: 0,
    day: 23,
    title: 'Denver offsite — planning day',
    categoryId: 'team',
    allDay: true,
    startMin: 0,
    location: 'Basecamp Hotel',
  },
  {
    id: 'jun-25-retro',
    monthIndex: 0,
    day: 25,
    title: 'Retro — sprint 25',
    categoryId: 'team',
    time: '2:00 PM',
    startMin: 840,
    duration: '1 hr',
  },
  {
    id: 'jun-30-code-freeze',
    monthIndex: 0,
    day: 30,
    title: 'Sprint 26 code freeze',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
  // ---- July 2026 ----
  {
    id: 'jul-01-planning',
    monthIndex: 1,
    day: 1,
    title: 'Sprint 26 planning',
    categoryId: 'work',
    time: '9:30 AM',
    startMin: 570,
    duration: '90 min',
    location: 'Sky room',
  },
  {
    id: 'jul-02-growth-sync',
    monthIndex: 1,
    day: 2,
    title: 'Growth sync',
    categoryId: 'work',
    time: '11:00 AM',
    startMin: 660,
    duration: '30 min',
  },
  {
    id: 'jul-03-holiday',
    monthIndex: 1,
    day: 3,
    title: 'Office closed — holiday',
    categoryId: 'personal',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'jul-04-lake-day',
    monthIndex: 1,
    day: 4,
    title: 'Lake day with family',
    categoryId: 'personal',
    time: '11:00 AM',
    startMin: 660,
    duration: '5 hr',
    location: 'Shadow Cliffs',
  },
  {
    id: 'jul-06-portfolio',
    monthIndex: 1,
    day: 6,
    title: 'Portfolio review',
    categoryId: 'work',
    time: '10:00 AM',
    startMin: 600,
    duration: '1 hr',
  },
  {
    id: 'jul-07-interview',
    monthIndex: 1,
    day: 7,
    title: 'Interview — product designer',
    categoryId: 'work',
    time: '2:00 PM',
    startMin: 840,
    duration: '1 hr',
    location: 'Zoom',
  },
  {
    id: 'jul-07-climbing',
    monthIndex: 1,
    day: 7,
    title: 'Climbing gym',
    categoryId: 'personal',
    time: '5:30 PM',
    startMin: 1050,
    duration: '90 min',
  },
  // Today — five events, so the cell shows two chips + "+3 more".
  {
    id: 'jul-08-rc-cut',
    monthIndex: 1,
    day: 8,
    title: 'v2.1 release candidate cut',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'jul-08-design-crit',
    monthIndex: 1,
    day: 8,
    title: 'Design crit — mobile nav',
    categoryId: 'work',
    time: '9:00 AM',
    startMin: 540,
    duration: '1 hr',
    location: 'Harbor room',
  },
  {
    id: 'jul-08-one-on-one',
    monthIndex: 1,
    day: 8,
    title: '1:1 with Marcus',
    categoryId: 'work',
    time: '10:30 AM',
    startMin: 630,
    duration: '30 min',
  },
  {
    id: 'jul-08-birthday-lunch',
    monthIndex: 1,
    day: 8,
    title: 'Team lunch — July birthdays',
    categoryId: 'team',
    time: '12:00 PM',
    startMin: 720,
    duration: '1 hr',
    location: 'Souvla',
  },
  {
    id: 'jul-08-debrief',
    monthIndex: 1,
    day: 8,
    title: 'Interview debrief',
    categoryId: 'work',
    time: '2:00 PM',
    startMin: 840,
    duration: '45 min',
  },
  {
    id: 'jul-09-triage',
    monthIndex: 1,
    day: 9,
    title: 'Support triage rotation',
    categoryId: 'work',
    time: '11:00 AM',
    startMin: 660,
    duration: '1 hr',
  },
  {
    id: 'jul-10-demo-dry-run',
    monthIndex: 1,
    day: 10,
    title: 'Sprint 26 demo dry-run',
    categoryId: 'team',
    time: '3:00 PM',
    startMin: 900,
    duration: '1 hr',
  },
  {
    id: 'jul-11-farmers-market',
    monthIndex: 1,
    day: 11,
    title: 'Farmers market',
    categoryId: 'personal',
    time: '9:00 AM',
    startMin: 540,
    duration: '1 hr',
    location: 'Ferry Building',
  },
  // July 14 — four events, so the cell shows two chips + "+2 more".
  {
    id: 'jul-14-readiness',
    monthIndex: 1,
    day: 14,
    title: 'Launch readiness review',
    categoryId: 'work',
    time: '9:30 AM',
    startMin: 570,
    duration: '1 hr',
    location: 'Sky room',
  },
  {
    id: 'jul-14-lunch-ana',
    monthIndex: 1,
    day: 14,
    title: 'Lunch with Ana',
    categoryId: 'personal',
    time: '12:30 PM',
    startMin: 750,
    duration: '1 hr',
    location: 'Tartine',
  },
  {
    id: 'jul-14-a11y-audit',
    monthIndex: 1,
    day: 14,
    title: 'A11y audit walkthrough',
    categoryId: 'work',
    time: '3:00 PM',
    startMin: 900,
    duration: '1 hr',
  },
  {
    id: 'jul-14-pack',
    monthIndex: 1,
    day: 14,
    title: 'Pack for Lisbon',
    categoryId: 'personal',
    time: '7:00 PM',
    startMin: 1140,
    duration: '1 hr',
  },
  {
    id: 'jul-15-launch',
    monthIndex: 1,
    day: 15,
    title: 'v2.1 launch',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'jul-16-flight-out',
    monthIndex: 1,
    day: 16,
    title: 'Flight SFO → LIS',
    categoryId: 'travel',
    time: '7:40 AM',
    startMin: 460,
    duration: '11 hr',
    location: 'SFO International',
  },
  {
    id: 'jul-17-pto',
    monthIndex: 1,
    day: 17,
    title: 'PTO — Lisbon',
    categoryId: 'travel',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'jul-20-pto',
    monthIndex: 1,
    day: 20,
    title: 'PTO — Lisbon',
    categoryId: 'travel',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'jul-21-flight-back',
    monthIndex: 1,
    day: 21,
    title: 'Flight LIS → SFO',
    categoryId: 'travel',
    time: '3:10 PM',
    startMin: 910,
    duration: '12 hr',
    location: 'Humberto Delgado',
  },
  {
    id: 'jul-23-planning',
    monthIndex: 1,
    day: 23,
    title: 'Sprint 27 planning',
    categoryId: 'work',
    time: '9:30 AM',
    startMin: 570,
    duration: '90 min',
    location: 'Sky room',
  },
  {
    id: 'jul-24-retro',
    monthIndex: 1,
    day: 24,
    title: 'Retro — sprint 26',
    categoryId: 'team',
    time: '2:00 PM',
    startMin: 840,
    duration: '1 hr',
  },
  {
    id: 'jul-28-pricing-readout',
    monthIndex: 1,
    day: 28,
    title: 'Pricing experiment readout',
    categoryId: 'work',
    time: '10:00 AM',
    startMin: 600,
    duration: '45 min',
  },
  {
    id: 'jul-31-okr-checkin',
    monthIndex: 1,
    day: 31,
    title: 'Q3 OKR check-in due',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
  // ---- August 2026 ----
  {
    id: 'aug-01-beach-cleanup',
    monthIndex: 2,
    day: 1,
    title: 'Beach cleanup volunteer',
    categoryId: 'personal',
    time: '10:00 AM',
    startMin: 600,
    duration: '2 hr',
    location: 'Ocean Beach',
  },
  {
    id: 'aug-03-migration-kickoff',
    monthIndex: 2,
    day: 3,
    title: 'Platform migration kickoff',
    categoryId: 'work',
    time: '10:00 AM',
    startMin: 600,
    duration: '1 hr',
    location: 'Sky room',
  },
  {
    id: 'aug-05-office-hours',
    monthIndex: 2,
    day: 5,
    title: 'Design system office hours',
    categoryId: 'work',
    time: '11:00 AM',
    startMin: 660,
    duration: '1 hr',
  },
  {
    id: 'aug-05-concert',
    monthIndex: 2,
    day: 5,
    title: 'Concert — Greek Theatre',
    categoryId: 'personal',
    time: '6:00 PM',
    startMin: 1080,
    duration: '3 hr',
    location: 'Berkeley',
  },
  {
    id: 'aug-07-demo-day',
    monthIndex: 2,
    day: 7,
    title: 'Team demo day',
    categoryId: 'team',
    time: '12:00 PM',
    startMin: 720,
    duration: '2 hr',
    location: 'All-hands space',
  },
  {
    id: 'aug-10-arch-review',
    monthIndex: 2,
    day: 10,
    title: 'Architecture review — billing',
    categoryId: 'work',
    time: '9:00 AM',
    startMin: 540,
    duration: '90 min',
  },
  {
    id: 'aug-12-phase-1-due',
    monthIndex: 2,
    day: 12,
    title: 'Migration phase 1 due',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
  {
    id: 'aug-14-one-on-one',
    monthIndex: 2,
    day: 14,
    title: '1:1 with Priya',
    categoryId: 'work',
    time: '3:00 PM',
    startMin: 900,
    duration: '30 min',
  },
  {
    id: 'aug-17-flight-ord',
    monthIndex: 2,
    day: 17,
    title: 'Flight SFO → ORD, CustomerCon',
    categoryId: 'travel',
    time: '8:20 AM',
    startMin: 500,
    duration: '4.5 hr',
    location: 'SFO Terminal 1',
  },
  {
    id: 'aug-18-booth-duty',
    monthIndex: 2,
    day: 18,
    title: 'CustomerCon booth duty',
    categoryId: 'team',
    allDay: true,
    startMin: 0,
    location: 'McCormick Place',
  },
  {
    id: 'aug-19-flight-home',
    monthIndex: 2,
    day: 19,
    title: 'Flight ORD → SFO',
    categoryId: 'travel',
    time: '6:15 PM',
    startMin: 1095,
    duration: '4.5 hr',
  },
  {
    id: 'aug-21-retro',
    monthIndex: 2,
    day: 21,
    title: 'Retro — sprint 27',
    categoryId: 'team',
    time: '2:00 PM',
    startMin: 840,
    duration: '1 hr',
  },
  {
    id: 'aug-26-pre-read',
    monthIndex: 2,
    day: 26,
    title: 'Roadmap pre-read review',
    categoryId: 'work',
    time: '10:00 AM',
    startMin: 600,
    duration: '1 hr',
  },
  {
    id: 'aug-31-self-assessments',
    monthIndex: 2,
    day: 31,
    title: 'Perf self-assessments due',
    categoryId: 'deadline',
    allDay: true,
    startMin: 0,
  },
];

// ============= CALENDAR MATH =============
// Date is used only to derive weekday alignment and month lengths for the
// FIXED fixture dates above — never Date.now() or any clock read.

/** Day of week (0 = Sunday) for a fixed fixture date. */
function dayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day)).getUTCDay();
}

/** Number of days in a (0-based) month. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

interface DayCell {
  id: string;
  /** Day-of-month number shown in the cell. */
  day: number;
  /**
   * Index into MONTHS for the month this cell's date belongs to, or null
   * when the date falls outside the fixture window (May / September) —
   * those cells render shaded and inert.
   */
  monthIndex: number | null;
  /** True for leading/trailing days that belong to an adjacent month. */
  isOutside: boolean;
  isWeekend: boolean;
}

/** Builds the padded 7xN cell matrix for one fixture month. */
function buildMonthCells(viewIndex: number): DayCell[] {
  const view = MONTHS[viewIndex];
  const lead = dayOfWeek(view.year, view.month, 1);
  const days = daysInMonth(view.year, view.month);
  const total = Math.ceil((lead + days) / 7) * 7;
  const prevIndex = viewIndex > 0 ? viewIndex - 1 : null;
  const nextIndex = viewIndex < MONTHS.length - 1 ? viewIndex + 1 : null;
  const daysInPrev = daysInMonth(view.year, view.month - 1);
  const cells: DayCell[] = [];
  for (let i = 0; i < total; i += 1) {
    const column = i % 7;
    const isWeekend = column === 0 || column === 6;
    if (i < lead) {
      cells.push({
        id: \`lead-\${i}\`,
        day: daysInPrev - lead + 1 + i,
        monthIndex: prevIndex,
        isOutside: true,
        isWeekend,
      });
    } else if (i < lead + days) {
      cells.push({
        id: \`day-\${i - lead + 1}\`,
        day: i - lead + 1,
        monthIndex: viewIndex,
        isOutside: false,
        isWeekend,
      });
    } else {
      cells.push({
        id: \`trail-\${i}\`,
        day: i - lead - days + 1,
        monthIndex: nextIndex,
        isOutside: true,
        isWeekend,
      });
    }
  }
  return cells;
}

// Events grouped once by "monthIndex:day", sorted all-day first then by
// start time; every render path filters this map by the category toggles.
const EVENTS_BY_DAY: ReadonlyMap<string, CalendarEvent[]> = (() => {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of EVENTS) {
    const key = \`\${event.monthIndex}:\${event.day}\`;
    const list = map.get(key);
    if (list) {
      list.push(event);
    } else {
      map.set(key, [event]);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startMin - b.startMin);
  }
  return map;
})();

function eventsOn(monthIndex: number, day: number): readonly CalendarEvent[] {
  return EVENTS_BY_DAY.get(\`\${monthIndex}:\${day}\`) ?? [];
}

// Cells show at most three chips; overloaded days trade the third chip for
// a "+N more" line (selecting the day reveals everything in the panel).
const MAX_CHIPS = 3;
const MAX_DOTS = 4;

// ============= DAY CELL =============

interface DaySelection {
  monthIndex: number;
  day: number;
}

function DayCellButton({
  cell,
  events,
  isToday,
  isSelected,
  isNarrow,
  onSelect,
}: {
  cell: DayCell;
  events: readonly CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  isNarrow: boolean;
  onSelect: (cell: DayCell) => void;
}) {
  const isInteractive = cell.monthIndex !== null;
  const isShaded = cell.isWeekend || cell.isOutside;
  const cellStyle: CSSProperties = {
    ...styles.cell,
    ...(isInteractive ? styles.cellInteractive : undefined),
    ...(isShaded ? styles.cellShaded : undefined),
    ...(isSelected ? styles.cellSelected : undefined),
  };
  const numberStyle: CSSProperties = {
    ...styles.dayNumber,
    ...(cell.isOutside ? styles.dayNumberOutside : undefined),
    ...(isToday ? styles.dayNumberToday : undefined),
  };

  const dayNumber = <span style={numberStyle}>{cell.day}</span>;

  // Out-of-month cells stay chip-free: their events render once the user
  // taps through to that month.
  let body: ReactNode = null;
  if (!cell.isOutside && events.length > 0) {
    if (isNarrow) {
      const dots = events.slice(0, MAX_DOTS);
      const extra = events.length - dots.length;
      body = (
        <div style={styles.dotRow}>
          {dots.map(event => {
            const category = CATEGORY_BY_ID.get(event.categoryId);
            return (
              <span
                key={event.id}
                style={{
                  ...styles.eventDot,
                  backgroundColor: category?.color,
                }}
              />
            );
          })}
          {extra > 0 ? <span style={styles.dotOverflow}>+{extra}</span> : null}
        </div>
      );
    } else {
      const visible =
        events.length > MAX_CHIPS ? events.slice(0, MAX_CHIPS - 1) : events;
      const extra = events.length - visible.length;
      body = (
        <div style={styles.chipStack}>
          {visible.map(event => {
            const category = CATEGORY_BY_ID.get(event.categoryId);
            return (
              <span
                key={event.id}
                style={{...styles.chip, backgroundColor: category?.color}}>
                {event.title}
              </span>
            );
          })}
          {extra > 0 ? (
            <span style={styles.moreLabel}>+{extra} more</span>
          ) : null}
        </div>
      );
    }
  }

  if (!isInteractive) {
    // May / September filler days: shaded, numbered, inert.
    return (
      <div style={cellStyle} aria-hidden="true">
        <div style={styles.dayNumberRow}>{dayNumber}</div>
      </div>
    );
  }

  const month = MONTHS[cell.monthIndex as number];
  const weekday = WEEKDAYS[dayOfWeek(month.year, month.month, cell.day)];
  const countText =
    events.length === 0
      ? 'no events'
      : \`\${events.length} event\${events.length === 1 ? '' : 's'}\`;
  const label = [
    \`\${weekday.full}, \${month.name} \${cell.day}\`,
    isToday ? 'today' : null,
    countText,
    cell.isOutside ? \`in \${month.label}\` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      style={cellStyle}
      aria-label={label}
      aria-pressed={isSelected}
      onClick={() => onSelect(cell)}>
      <div style={styles.dayNumberRow}>{dayNumber}</div>
      {body}
    </button>
  );
}

// ============= SELECTED-DAY PANEL =============

function SelectedDayPanel({
  selection,
  events,
  hiddenEventCount,
  isToday,
}: {
  selection: DaySelection;
  events: readonly CalendarEvent[];
  /** Events on this day suppressed by the category toggles. */
  hiddenEventCount: number;
  isToday: boolean;
}) {
  const month = MONTHS[selection.monthIndex];
  const weekday = WEEKDAYS[dayOfWeek(month.year, month.month, selection.day)];
  const countText =
    events.length === 0
      ? 'No events'
      : \`\${events.length} event\${events.length === 1 ? '' : 's'}\`;

  return (
    <VStack gap={3}>
      <VStack gap={0.5}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>
            {weekday.full}, {month.name} {selection.day}
          </Heading>
          {isToday ? <Badge label="Today" variant="info" /> : null}
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {month.label} · {countText}
          {hiddenEventCount > 0
            ? \` · \${hiddenEventCount} hidden by filters\`
            : ''}
        </Text>
      </VStack>
      {events.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={CalendarOffIcon} size="lg" />}
          title="Nothing scheduled"
          description={
            hiddenEventCount > 0
              ? 'Every event on this day is hidden by the category filters.'
              : 'Pick another day, or enjoy the open calendar.'
          }
        />
      ) : (
        events.map(event => {
          const category = CATEGORY_BY_ID.get(event.categoryId);
          return (
            <Card key={event.id} padding={3}>
              <HStack gap={3} vAlign="start">
                <div
                  style={{
                    ...styles.eventBar,
                    backgroundColor: category?.color,
                  }}
                  aria-hidden="true"
                />
                <StackItem size="fill">
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="start">
                      <StackItem size="fill">
                        <Text type="body" maxLines={2}>
                          {event.title}
                        </Text>
                      </StackItem>
                      {category ? (
                        <Token
                          label={category.label}
                          color={category.token}
                          size="sm"
                        />
                      ) : null}
                    </HStack>
                    <HStack gap={1} vAlign="center">
                      <Icon icon={ClockIcon} size="sm" color="secondary" />
                      <Text
                        type="supporting"
                        color="secondary"
                        hasTabularNumbers>
                        {event.allDay
                          ? 'All day'
                          : \`\${event.time} · \${event.duration}\`}
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
                </StackItem>
              </HStack>
            </Card>
          );
        })
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function CalendarMonthGridTemplate() {
  const [viewIndex, setViewIndex] = useState(TODAY_MONTH_INDEX);
  const [selected, setSelected] = useState<DaySelection>({
    monthIndex: TODAY_MONTH_INDEX,
    day: TODAY_DAY,
  });
  // Category ids currently hidden by the legend toggles.
  const [hidden, setHidden] = useState<ReadonlySet<CategoryId>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  // <=640px: dots instead of chips, stacked panel, single-letter weekday
  // labels, horizontally scrolling legend, ~40px controls.
  const isNarrow = useMediaQuery('(max-width: 640px)');

  const view = MONTHS[viewIndex];
  const cells = useMemo(() => buildMonthCells(viewIndex), [viewIndex]);

  const visibleEventsOn = (monthIndex: number, day: number) =>
    eventsOn(monthIndex, day).filter(event => !hidden.has(event.categoryId));

  const monthEventCount = useMemo(
    () =>
      EVENTS.filter(
        event =>
          event.monthIndex === viewIndex && !hidden.has(event.categoryId),
      ).length,
    [viewIndex, hidden],
  );

  const selectedDayAll = eventsOn(selected.monthIndex, selected.day);
  const selectedDayVisible = selectedDayAll.filter(
    event => !hidden.has(event.categoryId),
  );
  const isSelectedToday =
    selected.monthIndex === TODAY_MONTH_INDEX && selected.day === TODAY_DAY;

  const goToMonth = (index: number) => {
    if (index < 0 || index >= MONTHS.length || index === viewIndex) {
      return;
    }
    setViewIndex(index);
    setAnnouncement(\`Showing \${MONTHS[index].label}\`);
  };

  const goToToday = () => {
    setViewIndex(TODAY_MONTH_INDEX);
    setSelected({monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY});
    setAnnouncement(
      \`Showing \${MONTHS[TODAY_MONTH_INDEX].label}, selected today\`,
    );
  };

  const selectCell = (cell: DayCell) => {
    if (cell.monthIndex === null) {
      return;
    }
    setSelected({monthIndex: cell.monthIndex, day: cell.day});
    if (cell.monthIndex !== viewIndex) {
      // Leading/trailing day of an adjacent fixture month: follow it.
      setViewIndex(cell.monthIndex);
      setAnnouncement(\`Showing \${MONTHS[cell.monthIndex].label}\`);
    }
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

  // ---- weekday header row ----
  const weekdayRow = (
    <div style={styles.weekdayRow} aria-hidden="true">
      {WEEKDAYS.map((weekday, index) => (
        <div key={weekday.full} style={styles.weekdayCell}>
          <Text
            type="supporting"
            color={index === 0 || index === 6 ? 'secondary' : undefined}>
            {isNarrow ? weekday.min : weekday.short}
          </Text>
        </div>
      ))}
    </div>
  );

  // ---- day grid ----
  const grid = (
    <div
      role="grid"
      aria-label={\`\${view.label} calendar\`}
      style={{
        ...styles.monthGrid,
        ...(isNarrow ? undefined : styles.monthGridFill),
        gridAutoRows: isNarrow ? 'minmax(72px, auto)' : 'minmax(112px, 1fr)',
      }}>
      {cells.map(cell => {
        const events =
          cell.monthIndex === null
            ? []
            : visibleEventsOn(cell.monthIndex, cell.day);
        const isToday =
          cell.monthIndex === TODAY_MONTH_INDEX && cell.day === TODAY_DAY;
        const isSelected =
          cell.monthIndex === selected.monthIndex &&
          cell.day === selected.day &&
          cell.monthIndex !== null;
        return (
          <DayCellButton
            key={cell.id}
            cell={cell}
            events={events}
            isToday={isToday}
            isSelected={isSelected}
            isNarrow={isNarrow}
            onSelect={selectCell}
          />
        );
      })}
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

  // ---- selected-day panel (docked >640px, stacked below the grid at
  // narrower widths) ----
  const dayPanel = (
    <SelectedDayPanel
      selection={selected}
      events={selectedDayVisible}
      hiddenEventCount={selectedDayAll.length - selectedDayVisible.length}
      isToday={isSelectedToday}
    />
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
                  <Icon icon={CalendarDaysIcon} size="md" color="secondary" />
                  <Heading level={1}>Calendar</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {monthEventCount} event{monthEventCount === 1 ? '' : 's'}
                  </Text>
                </HStack>
              </StackItem>
              <HStack gap={1} vAlign="center">
                <IconButton
                  label="Previous month"
                  icon={<Icon icon={ChevronLeftIcon} size="sm" />}
                  variant="ghost"
                  size={isNarrow ? 'md' : 'sm'}
                  isDisabled={viewIndex === 0}
                  onClick={() => goToMonth(viewIndex - 1)}
                />
                <div
                  style={{
                    ...styles.monthLabel,
                    width: isNarrow ? 108 : 132,
                  }}>
                  <Heading level={2}>{view.label}</Heading>
                </div>
                <IconButton
                  label="Next month"
                  icon={<Icon icon={ChevronRightIcon} size="sm" />}
                  variant="ghost"
                  size={isNarrow ? 'md' : 'sm'}
                  isDisabled={viewIndex === MONTHS.length - 1}
                  onClick={() => goToMonth(viewIndex + 1)}
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
        isNarrow ? undefined : (
          <LayoutPanel width={320} padding={0} label="Selected day events">
            <div style={styles.panelScroll}>{dayPanel}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {/* Stacked mode flows at natural height so LayoutContent scrolls
              weekday row + grid + panel as one page; docked mode locks the
              column to the frame and scrolls only the grid. */}
          <VStack gap={0} style={isNarrow ? undefined : styles.fill}>
            {weekdayRow}
            {isNarrow ? (
              grid
            ) : (
              <StackItem size="fill" style={styles.gridScroll}>
                {grid}
              </StackItem>
            )}
            {isNarrow ? (
              <>
                <Divider />
                <div style={styles.panelStacked}>{dayPanel}</div>
              </>
            ) : null}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};