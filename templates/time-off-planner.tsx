// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three PTO balance banks with accrual
 *   notes, a six-person team roster, eight July 2026 time-off requests in
 *   pending/approved/denied states, and a fixed company-holiday list —
 *   Jul 3, 2026 observed)
 * @output Time-Off Planner PTO surface: header count summary ("8 requests ·
 *   3 pending · 4 approved") with a July 2026 chip and a Policies button;
 *   three balance Cards (vacation / sick / personal) with remaining-day
 *   values, used-vs-annual ProgressBars, accrual notes, and live "scheduled"
 *   lines; a docked new-request form (type Selector with remaining-balance
 *   labels, start/end DateInputs, half-day Switch, note TextArea) that
 *   computes business days excluding weekends and the fixture holiday and
 *   validates against the remaining balance; a horizontally scrollable team
 *   absence strip painting who is out on which July days (approved solid,
 *   pending dashed) with tap-to-inspect bars; and a requests table with
 *   status Badges plus approve/deny actions for direct reports and cancel
 *   for the viewer's own pending rows, both guarded by AlertDialog
 * @position Page template; emitted by `astryx template time-off-planner`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * colored count summary, "July 2026" month chip, Policies button).
 * LayoutContent scrolls a max-w-4xl (896px) column: balance card Grid, team
 * absence strip, then the requests table with its review-scope
 * SegmentedControl. The end LayoutPanel (~360px, scrollable) hosts the
 * new-request form.
 *
 * Responsive contract:
 * - > 1024px: header | content (fill) | new-request panel 360.
 * - <= 1024px: the form leaves the `end` slot and renders as a Card between
 *   the balance cards and the absence strip, so the page stays single-pane.
 * - Balance cards: Grid columns={{minWidth: 220, max: 3}} — 3-up on wide
 *   viewports, reflowing to 2-up and 1-up as the viewport narrows.
 * - Absence strip: the 31-day July grid keeps a fixed 26px/day width and
 *   scrolls horizontally inside its own overflow-x container; the teammate
 *   name column is sticky-left with an opaque background so rows stay
 *   labelled mid-scroll. Bars select on tap/click and via keyboard focus +
 *   Enter (aria-pressed), never hover-only; the detail caption renders
 *   below the strip so it works at any width.
 * - <= 640px: the requests table swaps to stacked request cards (single-pane
 *   fallback); approve/deny/cancel and the submit button render size="lg"
 *   (40px) so primary tap targets stay touch-friendly; header chrome wraps
 *   (wrap="wrap") so the month chip and Policies button drop below the
 *   title instead of overflowing it. Usable at 375px wide.
 *
 * Container policy: balances are Stat-like Cards in a Grid; the absence
 * strip is a bordered custom month grid (not a Table — cells are painted
 * spans, not records); requests are a Table on wide viewports and stacked
 * Cards on phones; the form lives in the docked LayoutPanel, falling back
 * to an inline Card when the panel stacks.
 *
 * Fixture policy: fixed ISO dates and copy only — no Date.now, no
 * randomness, no network assets. "Today" is the fixture date Jul 1, 2026
 * and appears only as copy. Business-day math is pure arithmetic over the
 * fixed ISO strings.
 */

import {useRef, useState, type CSSProperties} from 'react';

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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {DateInput} from '@astryxdesign/core/DateInput';
import type {ISODateString} from '@astryxdesign/core/Calendar';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarDaysIcon,
  CoffeeIcon,
  HeartPulseIcon,
  PalmtreeIcon,
  ScrollTextIcon,
  SendIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

// Absence type colors via Astryx data-viz tokens (CSS custom properties).
const typeColors: Record<string, string> = {
  vacation: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4DA3FF))',
  sick: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF963B))',
  personal:
    'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
};

// July 2026 strip geometry: 31 fixed-width day columns behind a sticky
// name rail. The grid never reflows — it scrolls horizontally instead.
const DAY_WIDTH = 26;
const NAME_RAIL_WIDTH = 168;
const DAYS_IN_JULY = 31;

const styles: Record<string, CSSProperties> = {
  // max-w-4xl content column, centered next to the docked form panel.
  contentColumn: {
    width: '100%',
    maxWidth: 896,
    marginInline: 'auto',
  },
  headerRow: {flexWrap: 'wrap'},
  countPending: {color: 'var(--color-text-yellow)'},
  countApproved: {color: 'var(--color-text-green)'},
  // Balance cards.
  balanceValue: {fontVariantNumeric: 'tabular-nums'},
  accrualNote: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  // ----- Absence strip -----
  // The scroller owns horizontal overflow; the page never widens for it.
  stripScroller: {
    overflowX: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  stripInner: {
    minWidth: NAME_RAIL_WIDTH + DAY_WIDTH * DAYS_IN_JULY,
  },
  stripRow: {
    display: 'flex',
    alignItems: 'stretch',
  },
  // Sticky name rail: opaque background so day cells slide underneath.
  nameCell: {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    width: NAME_RAIL_WIDTH,
    minWidth: NAME_RAIL_WIDTH,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 var(--spacing-3)',
    backgroundColor: 'var(--color-background-body)',
    borderRight: '1px solid var(--color-border)',
  },
  dayGrid: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: `repeat(${DAYS_IN_JULY}, ${DAY_WIDTH}px)`,
    alignItems: 'center',
    height: 40,
  },
  dayHeaderGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${DAYS_IN_JULY}, ${DAY_WIDTH}px)`,
    height: 32,
    alignItems: 'center',
  },
  dayHeaderCell: {
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  dayHeaderWeekend: {
    color: 'var(--color-text-tertiary, var(--color-text-secondary))',
    opacity: 0.6,
  },
  weekendCell: {
    gridRow: 1,
    alignSelf: 'stretch',
    backgroundColor: 'var(--color-background-muted)',
  },
  holidayCell: {
    gridRow: 1,
    alignSelf: 'stretch',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage:
      'repeating-linear-gradient(135deg, transparent, transparent 3px, var(--color-border) 3px, var(--color-border) 4px)',
  },
  rowDivider: {borderTop: '1px solid var(--color-border)'},
  // Absence bars are real buttons: tap/click or focus + Enter selects them
  // (aria-pressed carries the state); nothing on the strip is hover-only.
  bar: {
    gridRow: 1,
    zIndex: 1,
    height: 24,
    marginInline: 2,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    // Bar-label text over the solid categorical fill: white on the saturated
    // light-mode fills, near-black on the lighter dark-mode fills.
    color: 'light-dark(#fff, #0B1220)',
    fontSize: 11,
    lineHeight: '24px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    padding: '0 6px',
    textAlign: 'left',
  },
  // Pending bars are hollow: dashed outline, tinted text, muted fill.
  barPending: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    lineHeight: '20px',
  },
  barSelected: {
    outline: '2px solid var(--color-border-emphasized)',
    outlineOffset: 1,
  },
  legendSwatch: {
    display: 'inline-block',
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendSwatchPending: {
    display: 'inline-block',
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
    backgroundColor: 'transparent',
    border: '2px dashed var(--color-border-emphasized)',
  },
  legendSwatchHoliday: {
    display: 'inline-block',
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage:
      'repeating-linear-gradient(135deg, transparent, transparent 3px, var(--color-border) 3px, var(--color-border) 4px)',
    border: '1px solid var(--color-border)',
  },
  legendRow: {flexWrap: 'wrap'},
  captionBox: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // ----- Requests table -----
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  tableToolbar: {flexWrap: 'wrap'},
  // ----- New-request form -----
  formPanel: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  daysPreview: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
};

// ============= DATA =============
// Deterministic fixtures: the "current" month is July 2026 and "today" is
// Jul 1, 2026 — copy only, never read from a clock.

type PtoType = 'vacation' | 'sick' | 'personal';
type RequestStatus = 'pending' | 'approved' | 'denied';

interface PtoBalance {
  type: PtoType;
  label: string;
  /** Days in the bank before scheduled requests are subtracted. */
  bank: number;
  /** Days already taken this year (paints the ProgressBar). */
  used: number;
  /** Annual allotment (ProgressBar max). */
  annual: number;
  accrualNote: string;
  icon: typeof PalmtreeIcon;
}

const BALANCES: PtoBalance[] = [
  {
    type: 'vacation',
    label: 'Vacation',
    bank: 17.5,
    used: 2.5,
    annual: 20,
    accrualNote: 'Accrues 1.25 days monthly · caps at 30 days',
    icon: PalmtreeIcon,
  },
  {
    type: 'sick',
    label: 'Sick',
    bank: 6,
    used: 4,
    annual: 10,
    accrualNote: 'Resets Jan 1 · no carryover',
    icon: HeartPulseIcon,
  },
  {
    type: 'personal',
    label: 'Personal',
    bank: 2,
    used: 1,
    annual: 3,
    accrualNote: 'Granted Jan 1 · use by Dec 31',
    icon: CoffeeIcon,
  },
];

interface Person {
  id: string;
  name: string;
  /** True for the viewer's direct reports — unlocks approve/deny. */
  isReport: boolean;
}

const PEOPLE: Person[] = [
  {id: 'you', name: 'You', isReport: false},
  {id: 'priya', name: 'Priya Natarajan', isReport: true},
  {id: 'marcus', name: 'Marcus Bell', isReport: true},
  {id: 'tessa', name: 'Tessa Okafor', isReport: true},
  {id: 'jonah', name: 'Jonah Reyes', isReport: false},
  {id: 'elin', name: 'Elin Sørensen', isReport: false},
];

const PERSON_BY_ID: Record<string, Person> = Object.fromEntries(
  PEOPLE.map(person => [person.id, person]),
);

interface CompanyHoliday {
  date: string;
  label: string;
}

const COMPANY_HOLIDAYS: CompanyHoliday[] = [
  {date: '2026-07-03', label: 'Independence Day (observed)'},
];

interface TimeOffRequest extends Record<string, unknown> {
  id: string;
  personId: string;
  type: PtoType;
  /** ISO start date (YYYY-MM-DD). */
  start: string;
  /** ISO end date, inclusive. */
  end: string;
  /** Business days requested (already excludes weekends + holidays). */
  days: number;
  isHalfDay: boolean;
  note: string;
  status: RequestStatus;
  submittedAt: string;
}

const INITIAL_REQUESTS: TimeOffRequest[] = [
  {
    id: 'req-priya-vacation',
    personId: 'priya',
    type: 'vacation',
    start: '2026-07-06',
    end: '2026-07-10',
    days: 5,
    isHalfDay: false,
    note: 'Family trip — fully offline, Ravi covers on-call.',
    status: 'pending',
    submittedAt: '2026-06-24T15:10:00Z',
  },
  {
    id: 'req-tessa-half',
    personId: 'tessa',
    type: 'personal',
    start: '2026-07-08',
    end: '2026-07-08',
    days: 0.5,
    isHalfDay: true,
    note: 'Morning appointment; online after 1 PM.',
    status: 'pending',
    submittedAt: '2026-06-29T11:42:00Z',
  },
  {
    id: 'req-you-personal',
    personId: 'you',
    type: 'personal',
    start: '2026-07-31',
    end: '2026-07-31',
    days: 1,
    isHalfDay: false,
    note: 'Moving day.',
    status: 'pending',
    submittedAt: '2026-06-30T18:05:00Z',
  },
  {
    id: 'req-marcus-sick',
    personId: 'marcus',
    type: 'sick',
    start: '2026-07-01',
    end: '2026-07-02',
    days: 2,
    isHalfDay: false,
    note: '',
    status: 'approved',
    submittedAt: '2026-07-01T08:12:00Z',
  },
  {
    id: 'req-jonah-vacation',
    personId: 'jonah',
    type: 'vacation',
    start: '2026-07-13',
    end: '2026-07-17',
    days: 5,
    isHalfDay: false,
    note: 'Hiking the Dolomites.',
    status: 'approved',
    submittedAt: '2026-05-30T09:00:00Z',
  },
  {
    id: 'req-you-vacation',
    personId: 'you',
    type: 'vacation',
    start: '2026-07-20',
    end: '2026-07-24',
    days: 5,
    isHalfDay: false,
    note: 'Cabin week with family.',
    status: 'approved',
    submittedAt: '2026-06-02T14:30:00Z',
  },
  {
    id: 'req-elin-personal',
    personId: 'elin',
    type: 'personal',
    start: '2026-07-27',
    end: '2026-07-28',
    days: 2,
    isHalfDay: false,
    note: 'Apartment handover.',
    status: 'approved',
    submittedAt: '2026-06-18T10:20:00Z',
  },
  {
    id: 'req-marcus-vacation',
    personId: 'marcus',
    type: 'vacation',
    start: '2026-07-27',
    end: '2026-07-31',
    days: 5,
    isHalfDay: false,
    note: 'Overlaps the release freeze.',
    status: 'denied',
    submittedAt: '2026-06-10T16:45:00Z',
  },
];

const TYPE_LABEL: Record<PtoType, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
};

const TYPE_BADGE: Record<PtoType, 'blue' | 'orange' | 'purple'> = {
  vacation: 'blue',
  sick: 'orange',
  personal: 'purple',
};

const STATUS_BADGE: Record<RequestStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  denied: 'error',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

// Jul 1, 2026 is a Wednesday; weekends fall on 4/5, 11/12, 18/19, 25/26.
const WEEKEND_DAYS_JULY = [4, 5, 11, 12, 18, 19, 25, 26];
const HOLIDAY_DAYS_JULY = [3];

// ============= DATE HELPERS =============
// Pure arithmetic over fixed ISO strings — no clocks involved.

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MS_PER_DAY = 86_400_000;

function isoToUtcMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function isWeekendMs(ms: number): boolean {
  const dow = new Date(ms).getUTCDay();
  return dow === 0 || dow === 6;
}

function msToIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Inclusive business-day count: skips Saturdays, Sundays, and company
 * holidays. Returns 0 for inverted ranges (ISO strings compare
 * lexicographically, so `start > end` is safe).
 */
function countBusinessDays(start: string, end: string): number {
  if (start > end) {
    return 0;
  }
  let count = 0;
  const endMs = isoToUtcMs(end);
  for (let ms = isoToUtcMs(start); ms <= endMs; ms += MS_PER_DAY) {
    if (isWeekendMs(ms)) {
      continue;
    }
    const iso = msToIso(ms);
    if (COMPANY_HOLIDAYS.some(holiday => holiday.date === iso)) {
      continue;
    }
    count += 1;
  }
  return count;
}

/** "2026-07-06" -> "Jul 6". */
function formatIsoDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${MONTH_ABBR[month - 1]} ${day}`;
}

/** "Jul 6" or "Jul 6 – Jul 10" for a request's inclusive range. */
function formatIsoRange(start: string, end: string): string {
  return start === end
    ? formatIsoDate(start)
    : `${formatIsoDate(start)} – ${formatIsoDate(end)}`;
}

/** 4.5 -> "4.5", 5 -> "5". */
function formatDays(days: number): string {
  return Number.isInteger(days) ? String(days) : days.toFixed(1);
}

/**
 * Clamp a request's range to July 2026 day-of-month indices for the strip.
 * Returns null when the request doesn't touch the fixture month.
 */
function julySegment(request: TimeOffRequest): {from: number; to: number} | null {
  if (request.end < '2026-07-01' || request.start > '2026-07-31') {
    return null;
  }
  const from =
    request.start < '2026-07-01' ? 1 : Number(request.start.slice(8, 10));
  const to = request.end > '2026-07-31' ? 31 : Number(request.end.slice(8, 10));
  return {from, to};
}

// ============= BALANCE CARDS =============

function BalanceCard({
  balance,
  scheduled,
}: {
  balance: PtoBalance;
  /** Non-denied days the viewer has on the books for this type. */
  scheduled: number;
}) {
  const remaining = balance.bank - scheduled;
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={balance.icon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">{balance.label}</Text>
          </StackItem>
          {scheduled > 0 && (
            <Badge
              label={`${formatDays(scheduled)} scheduled`}
              variant="neutral"
            />
          )}
        </HStack>
        <HStack gap={1} vAlign="end">
          <span style={styles.balanceValue}>
            <Heading level={2}>{formatDays(remaining)}</Heading>
          </span>
          <Text type="supporting" color="secondary">
            {remaining === 1 ? 'day' : 'days'} available
          </Text>
        </HStack>
        <ProgressBar
          label={`${balance.label} used this year`}
          isLabelHidden
          value={balance.used}
          max={balance.annual}
        />
        <Text type="supporting" color="secondary">
          {formatDays(balance.used)} of {formatDays(balance.annual)} used as of
          Jul 1, 2026
        </Text>
        <div style={styles.accrualNote}>
          <Text type="supporting" color="secondary">
            {balance.accrualNote}
          </Text>
        </div>
      </VStack>
    </Card>
  );
}

// ============= TEAM ABSENCE STRIP =============

interface StripSegment {
  requestId: string;
  personId: string;
  type: PtoType;
  status: RequestStatus;
  isHalfDay: boolean;
  from: number;
  to: number;
  label: string;
}

/** Weekend + holiday shading painted behind a single strip row. */
function DayShading() {
  return (
    <>
      {WEEKEND_DAYS_JULY.map(day => (
        <div
          key={`weekend-${day}`}
          style={{...styles.weekendCell, gridColumn: day}}
          aria-hidden
        />
      ))}
      {HOLIDAY_DAYS_JULY.map(day => (
        <div
          key={`holiday-${day}`}
          style={{...styles.holidayCell, gridColumn: day}}
          aria-hidden
        />
      ))}
    </>
  );
}

function AbsenceBar({
  segment,
  isSelected,
  onSelect,
}: {
  segment: StripSegment;
  isSelected: boolean;
  onSelect: (requestId: string) => void;
}) {
  const color = typeColors[segment.type];
  const pending = segment.status === 'pending';
  // Single-day bars (~26px) can't fit a readable label — a clipped "P…"
  // reads as broken, so rely on the aria-label alone for those.
  const showLabel = segment.to - segment.from >= 1;
  return (
    <button
      type="button"
      style={{
        ...styles.bar,
        gridColumn: `${segment.from} / ${segment.to + 1}`,
        ...(pending
          ? {...styles.barPending, borderColor: color, color}
          : {backgroundColor: color}),
        ...(isSelected ? styles.barSelected : undefined),
      }}
      aria-label={segment.label}
      aria-pressed={isSelected}
      onClick={() => onSelect(segment.requestId)}>
      {showLabel ? TYPE_LABEL[segment.type] : null}
    </button>
  );
}

function TeamAbsenceStrip({
  requests,
  selectedRequestId,
  onSelectRequest,
}: {
  requests: TimeOffRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string | null) => void;
}) {
  // Approved requests paint solid; pending paint dashed; denied are hidden.
  // The strip re-derives from live request state, so approving a pending
  // row in the table below immediately solidifies its bar up here.
  const segments: StripSegment[] = [];
  for (const request of requests) {
    if (request.status === 'denied') {
      continue;
    }
    const clamped = julySegment(request);
    if (clamped == null) {
      continue;
    }
    const person = PERSON_BY_ID[request.personId];
    segments.push({
      requestId: request.id,
      personId: request.personId,
      type: request.type,
      status: request.status,
      isHalfDay: request.isHalfDay,
      from: clamped.from,
      to: clamped.to,
      label:
        `${person.name} — ${TYPE_LABEL[request.type]}, ` +
        `${formatIsoRange(request.start, request.end)}, ` +
        STATUS_LABEL[request.status].toLowerCase(),
    });
  }

  // Row order follows the fixture roster, skipping people with no July
  // absences so the strip stays dense.
  const rows = PEOPLE.filter(person =>
    segments.some(segment => segment.personId === person.id),
  );

  const selectedSegment =
    segments.find(segment => segment.requestId === selectedRequestId) ?? null;
  const selectedRequest =
    requests.find(request => request.id === selectedRequestId) ?? null;

  const dayNumbers = Array.from({length: DAYS_IN_JULY}, (_, i) => i + 1);

  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={UsersIcon} size="sm" color="secondary" />
        <Heading level={3}>Team absences — July 2026</Heading>
      </HStack>

      {/* Horizontal scroller: the 31-day grid keeps fixed width; the name
          rail stays pinned left while day columns slide underneath. */}
      <div style={styles.stripScroller}>
        <div style={styles.stripInner}>
          {/* Day-number header row. */}
          <div style={styles.stripRow}>
            <div style={styles.nameCell}>
              <Text type="supporting" color="secondary">
                Teammate
              </Text>
            </div>
            <div style={styles.dayHeaderGrid}>
              {dayNumbers.map(day => (
                <div
                  key={day}
                  style={{
                    ...styles.dayHeaderCell,
                    ...(WEEKEND_DAYS_JULY.includes(day)
                      ? styles.dayHeaderWeekend
                      : undefined),
                  }}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          {rows.map(person => (
            <div
              key={person.id}
              style={{...styles.stripRow, ...styles.rowDivider}}>
              <div style={styles.nameCell}>
                <Avatar name={person.name} size={24} />
                <Text type="supporting" maxLines={1}>
                  {person.name}
                </Text>
              </div>
              <div style={styles.dayGrid}>
                <DayShading />
                {segments
                  .filter(segment => segment.personId === person.id)
                  .map(segment => (
                    <AbsenceBar
                      key={segment.requestId}
                      segment={segment}
                      isSelected={segment.requestId === selectedRequestId}
                      onSelect={requestId =>
                        onSelectRequest(
                          requestId === selectedRequestId ? null : requestId,
                        )
                      }
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection caption: works on tap and keyboard focus — the strip
          never depends on hover to reveal details. */}
      {selectedSegment != null && selectedRequest != null ? (
        <div style={styles.captionBox}>
          <HStack gap={2} vAlign="center" style={styles.legendRow}>
            <Badge
              label={TYPE_LABEL[selectedSegment.type]}
              variant={TYPE_BADGE[selectedSegment.type]}
            />
            <Text type="supporting">
              {PERSON_BY_ID[selectedSegment.personId].name} ·{' '}
              {formatIsoRange(selectedRequest.start, selectedRequest.end)} ·{' '}
              {formatDays(selectedRequest.days)}{' '}
              {selectedRequest.days === 1 ? 'day' : 'days'}
              {selectedSegment.isHalfDay ? ' (half day)' : ''} ·{' '}
              {STATUS_LABEL[selectedSegment.status].toLowerCase()}
            </Text>
          </HStack>
        </div>
      ) : (
        <Text type="supporting" color="secondary">
          Select a bar to see who is out and when.
        </Text>
      )}

      {/* Legend — includes the holiday hatch so the Jul 3 column reads. */}
      <HStack gap={4} vAlign="center" style={styles.legendRow}>
        {(Object.keys(TYPE_LABEL) as PtoType[]).map(type => (
          <HStack key={type} gap={1} vAlign="center">
            <span
              style={{
                ...styles.legendSwatch,
                backgroundColor: typeColors[type],
              }}
              aria-hidden
            />
            <Text type="supporting" color="secondary">
              {TYPE_LABEL[type]}
            </Text>
          </HStack>
        ))}
        <HStack gap={1} vAlign="center">
          <span style={styles.legendSwatchPending} aria-hidden />
          <Text type="supporting" color="secondary">
            Pending
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <span style={styles.legendSwatchHoliday} aria-hidden />
          <Text type="supporting" color="secondary">
            Jul 3 — Independence Day (observed)
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );
}

// ============= NEW-REQUEST FORM =============

interface RequestDraft {
  type: PtoType;
  start: ISODateString | undefined;
  end: ISODateString | undefined;
  isHalfDay: boolean;
  note: string;
}

const EMPTY_DRAFT: RequestDraft = {
  type: 'vacation',
  start: undefined,
  end: undefined,
  isHalfDay: false,
  note: '',
};

/**
 * Business days the draft would consume: weekends and the Jul 3 holiday
 * are excluded, and the half-day toggle shaves 0.5 off the first day.
 */
function draftDays(draft: RequestDraft): number {
  if (draft.start == null || draft.end == null) {
    return 0;
  }
  const businessDays = countBusinessDays(draft.start, draft.end);
  if (businessDays === 0) {
    return 0;
  }
  return draft.isHalfDay ? businessDays - 0.5 : businessDays;
}

function NewRequestForm({
  remainingByType,
  wasSubmitted,
  isTouch,
  onSubmit,
  onDirty,
}: {
  remainingByType: Record<PtoType, number>;
  /** True right after a successful submit; cleared on the next edit. */
  wasSubmitted: boolean;
  /** <=640px: the submit button grows to size="lg" (40px). */
  isTouch: boolean;
  onSubmit: (draft: RequestDraft, days: number) => void;
  onDirty: () => void;
}) {
  const [draft, setDraft] = useState<RequestDraft>(EMPTY_DRAFT);

  const patch = (partial: Partial<RequestDraft>) => {
    setDraft(prev => ({...prev, ...partial}));
    onDirty();
  };

  const days = draftDays(draft);
  const remaining = remainingByType[draft.type];
  const hasRange = draft.start != null && draft.end != null;
  const isInverted = hasRange && draft.start! > draft.end!;
  const hasNoBusinessDays = hasRange && !isInverted && days === 0;
  const exceedsBalance = hasRange && !isInverted && days > remaining;
  const canSubmit = hasRange && !isInverted && days > 0 && !exceedsBalance;

  // Type options teach the remaining balance inline so pickers don't need
  // to glance back at the cards.
  const typeOptions = (Object.keys(TYPE_LABEL) as PtoType[]).map(type => ({
    value: type,
    label: `${TYPE_LABEL[type]} — ${formatDays(remainingByType[type])} days left`,
  }));

  const submit = () => {
    if (!canSubmit) {
      return;
    }
    onSubmit(draft, days);
    setDraft(EMPTY_DRAFT);
  };

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={3}>New request</Heading>
        <Text type="supporting" color="secondary">
          Business days are computed for you — weekends and company holidays
          don't count against your balance.
        </Text>
      </VStack>

      <Selector
        label="Type"
        options={typeOptions}
        value={draft.type}
        onChange={value => patch({type: value as PtoType})}
      />

      <DateInput
        label="First day"
        value={draft.start}
        onChange={value => patch({start: value})}
        min="2026-07-01"
        max="2026-12-31"
        placeholder="Select a date"
      />
      <DateInput
        label="Last day"
        value={draft.end}
        onChange={value => patch({end: value})}
        min="2026-07-01"
        max="2026-12-31"
        placeholder="Select a date"
        status={
          isInverted
            ? {type: 'error', message: 'Last day is before the first day.'}
            : undefined
        }
      />

      <Switch
        label="Half day"
        description="Take only half of the first day (−0.5 day)."
        value={draft.isHalfDay}
        onChange={checked => patch({isHalfDay: checked})}
      />

      <TextArea
        label="Note for your approver"
        rows={3}
        value={draft.note}
        onChange={value => patch({note: value})}
        placeholder="Coverage plan, context, travel dates…"
      />

      {/* Computed business days, live as the range changes. */}
      <div style={styles.daysPreview}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">
              {hasRange && !isInverted
                ? `${formatDays(days)} business ${days === 1 ? 'day' : 'days'}`
                : 'Pick a date range'}
            </Text>
          </StackItem>
          {hasRange && !isInverted && (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              of {formatDays(remaining)} left
            </Text>
          )}
        </HStack>
      </div>

      {hasNoBusinessDays && (
        <FieldStatus
          type="warning"
          variant="detached"
          message="That range only covers weekends or holidays."
        />
      )}
      {exceedsBalance && (
        <FieldStatus
          type="error"
          variant="detached"
          message={`Exceeds your remaining ${TYPE_LABEL[draft.type].toLowerCase()} balance (${formatDays(remaining)} days).`}
        />
      )}
      {wasSubmitted && (
        <FieldStatus
          type="success"
          variant="detached"
          message="Request submitted — it's pending in the table below."
        />
      )}

      <Button
        label="Submit request"
        variant="primary"
        size={isTouch ? 'lg' : 'md'}
        icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
        isDisabled={!canSubmit}
        onClick={submit}
      />
    </VStack>
  );
}

// ============= REQUEST CARD (MOBILE FALLBACK) =============

function RequestActions({
  request,
  isTouch,
  onApprove,
  onDenyRequest,
  onCancelRequest,
}: {
  request: TimeOffRequest;
  isTouch: boolean;
  onApprove: (id: string) => void;
  onDenyRequest: (id: string) => void;
  onCancelRequest: (id: string) => void;
}) {
  const person = PERSON_BY_ID[request.personId];
  const size = isTouch ? 'lg' : 'sm';

  if (request.status !== 'pending') {
    return (
      <Text type="supporting" color="secondary">
        —
      </Text>
    );
  }
  // Approve/deny only for the viewer's direct reports.
  if (person.isReport) {
    return (
      <HStack gap={2}>
        <Button
          label="Approve"
          variant="secondary"
          size={size}
          onClick={() => onApprove(request.id)}
        />
        <Button
          label="Deny"
          variant="ghost"
          size={size}
          onClick={() => onDenyRequest(request.id)}
        />
      </HStack>
    );
  }
  // The viewer can withdraw their own pending requests.
  if (request.personId === 'you') {
    return (
      <Button
        label="Cancel"
        variant="ghost"
        size={size}
        onClick={() => onCancelRequest(request.id)}
      />
    );
  }
  // Pending requests from peers are visible but read-only.
  return (
    <Text type="supporting" color="secondary">
      Awaiting their manager
    </Text>
  );
}

function RequestCard({
  request,
  isTouch,
  onApprove,
  onDenyRequest,
  onCancelRequest,
}: {
  request: TimeOffRequest;
  isTouch: boolean;
  onApprove: (id: string) => void;
  onDenyRequest: (id: string) => void;
  onCancelRequest: (id: string) => void;
}) {
  const person = PERSON_BY_ID[request.personId];
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar name={person.name} size={24} />
          <StackItem size="fill">
            <Text type="label" maxLines={1}>
              {person.name}
            </Text>
          </StackItem>
          <Badge
            label={STATUS_LABEL[request.status]}
            variant={STATUS_BADGE[request.status]}
          />
        </HStack>
        <HStack gap={2} vAlign="center" style={styles.legendRow}>
          <Badge label={TYPE_LABEL[request.type]} variant={TYPE_BADGE[request.type]} />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatIsoRange(request.start, request.end)} ·{' '}
            {formatDays(request.days)} {request.days === 1 ? 'day' : 'days'}
            {request.isHalfDay ? ' (half)' : ''}
          </Text>
        </HStack>
        {request.note !== '' && (
          <Text type="supporting" color="secondary" maxLines={2}>
            {request.note}
          </Text>
        )}
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <HStack gap={1} vAlign="center">
              <Text type="supporting" color="secondary">
                Requested
              </Text>
              <Timestamp
                value={request.submittedAt}
                format="date"
                color="secondary"
              />
            </HStack>
          </StackItem>
          <RequestActions
            request={request}
            isTouch={isTouch}
            onApprove={onApprove}
            onDenyRequest={onDenyRequest}
            onCancelRequest={onCancelRequest}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

type TableScope = 'all' | 'review' | 'mine';

const STATUS_RANK: Record<RequestStatus, number> = {
  pending: 0,
  approved: 1,
  denied: 2,
};

export default function TimeOffPlannerPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [scope, setScope] = useState<string>('all');
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<string | null>(
    'req-priya-vacation',
  );
  // Deny/cancel are two-step destructive actions guarded by AlertDialog.
  const [pendingAction, setPendingAction] = useState<{
    kind: 'deny' | 'cancel';
    requestId: string;
  } | null>(null);
  const [wasSubmitted, setWasSubmitted] = useState(false);
  // Deterministic ids for newly submitted requests.
  const nextIdRef = useRef(1);

  // Responsive contract: below 1024px the form leaves the `end` slot and
  // renders inline as a Card between the balances and the absence strip.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  // <=640px: the table swaps to stacked cards and primary tap targets grow.
  const isTouch = useMediaQuery('(max-width: 640px)');

  // ----- Derived balances -----
  // "Scheduled" = the viewer's own non-denied days per type, so submitting
  // or cancelling a request immediately moves the balance cards.
  const scheduledByType = (type: PtoType) =>
    requests
      .filter(
        request =>
          request.personId === 'you' &&
          request.status !== 'denied' &&
          request.type === type,
      )
      .reduce((sum, request) => sum + request.days, 0);

  const remainingByType = Object.fromEntries(
    BALANCES.map(balance => [
      balance.type,
      balance.bank - scheduledByType(balance.type),
    ]),
  ) as Record<PtoType, number>;

  const pendingCount = requests.filter(
    request => request.status === 'pending',
  ).length;
  const approvedCount = requests.filter(
    request => request.status === 'approved',
  ).length;
  const reviewCount = requests.filter(
    request =>
      request.status === 'pending' && PERSON_BY_ID[request.personId].isReport,
  ).length;

  // ----- Table rows: scope filter, then pending-first ordering -----
  const scoped = requests.filter(request => {
    if (scope === 'review') {
      return (
        request.status === 'pending' && PERSON_BY_ID[request.personId].isReport
      );
    }
    if (scope === 'mine') {
      return request.personId === 'you';
    }
    return true;
  });
  const visible = [...scoped].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.start.localeCompare(b.start),
  );

  // ----- Actions -----
  const approve = (id: string) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === id ? {...request, status: 'approved' as const} : request,
      ),
    );
  };

  const confirmPendingAction = () => {
    if (pendingAction == null) {
      return;
    }
    if (pendingAction.kind === 'deny') {
      setRequests(prev =>
        prev.map(request =>
          request.id === pendingAction.requestId
            ? {...request, status: 'denied' as const}
            : request,
        ),
      );
    } else {
      // Cancel removes the viewer's own pending request entirely.
      setRequests(prev =>
        prev.filter(request => request.id !== pendingAction.requestId),
      );
      if (selectedAbsenceId === pendingAction.requestId) {
        setSelectedAbsenceId(null);
      }
    }
    setPendingAction(null);
  };

  const submitDraft = (draft: RequestDraft, days: number) => {
    const id = `req-new-${nextIdRef.current}`;
    nextIdRef.current += 1;
    setRequests(prev => [
      ...prev,
      {
        id,
        personId: 'you',
        type: draft.type,
        start: draft.start!,
        end: draft.end!,
        days,
        isHalfDay: draft.isHalfDay,
        note: draft.note,
        status: 'pending' as const,
        // Fixture clock: submissions land "now" on the fixture date.
        submittedAt: '2026-07-01T09:00:00Z',
      },
    ]);
    setWasSubmitted(true);
  };

  const actionTarget =
    requests.find(request => request.id === pendingAction?.requestId) ?? null;

  // ----- Table columns (closures over the action handlers) -----
  const columns: TableColumn<TimeOffRequest>[] = [
    {
      key: 'person',
      header: 'Person',
      width: proportional(2),
      renderCell: (item: TimeOffRequest) => {
        const person = PERSON_BY_ID[item.personId];
        return (
          <HStack gap={2} vAlign="center">
            <Avatar name={person.name} size={24} />
            <StackItem size="fill">
              {/* Name on its own line, badge below — an inline badge would
                  squeeze the name out at this column width. */}
              <VStack gap={1}>
                <Text type="body" maxLines={1}>
                  {person.name}
                </Text>
                {person.isReport && (
                  <HStack gap={1}>
                    <Badge label="report" variant="neutral" />
                  </HStack>
                )}
              </VStack>
            </StackItem>
          </HStack>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      width: pixel(92),
      renderCell: (item: TimeOffRequest) => (
        <Badge label={TYPE_LABEL[item.type]} variant={TYPE_BADGE[item.type]} />
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      width: pixel(120),
      renderCell: (item: TimeOffRequest) => (
        <span style={styles.numericCell}>
          <Text type="body">{formatIsoRange(item.start, item.end)}</Text>
        </span>
      ),
    },
    {
      key: 'days',
      header: 'Days',
      width: pixel(52),
      renderCell: (item: TimeOffRequest) => (
        <span style={styles.numericCell}>
          <Text type="body">{formatDays(item.days)}</Text>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(100),
      renderCell: (item: TimeOffRequest) => (
        <Badge
          label={STATUS_LABEL[item.status]}
          variant={STATUS_BADGE[item.status]}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(156),
      renderCell: (item: TimeOffRequest) => (
        <RequestActions
          request={item}
          isTouch={false}
          onApprove={approve}
          onDenyRequest={id => setPendingAction({kind: 'deny', requestId: id})}
          onCancelRequest={id =>
            setPendingAction({kind: 'cancel', requestId: id})
          }
        />
      ),
    },
  ];

  const form = (
    <NewRequestForm
      remainingByType={remainingByType}
      wasSubmitted={wasSubmitted}
      isTouch={isTouch}
      onSubmit={submitDraft}
      onDirty={() => setWasSubmitted(false)}
    />
  );

  const requestsSection = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" style={styles.tableToolbar}>
        <StackItem size="fill">
          <Heading level={3}>Requests</Heading>
        </StackItem>
        <SegmentedControl
          label="Request scope"
          value={scope}
          onChange={setScope}
          size={isTouch ? 'lg' : 'sm'}>
          <SegmentedControlItem label="All" value="all" />
          <SegmentedControlItem
            label={`Needs review${reviewCount > 0 ? ` (${reviewCount})` : ''}`}
            value="review"
          />
          <SegmentedControlItem label="Mine" value="mine" />
        </SegmentedControl>
      </HStack>

      {visible.length === 0 ? (
        <EmptyState
          title={
            scope === 'review' ? 'Nothing to review' : 'No requests in view'
          }
          description={
            scope === 'review'
              ? "You've cleared the queue — every report's request has an answer."
              : 'Switch scopes or submit a new request from the form.'
          }
          icon={<Icon icon={CalendarDaysIcon} size="lg" />}
          isCompact
        />
      ) : isTouch ? (
        // <=640px single-pane fallback: stacked cards instead of a table.
        <VStack gap={2}>
          {visible.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              isTouch={isTouch}
              onApprove={approve}
              onDenyRequest={id =>
                setPendingAction({kind: 'deny', requestId: id})
              }
              onCancelRequest={id =>
                setPendingAction({kind: 'cancel', requestId: id})
              }
            />
          ))}
        </VStack>
      ) : (
        <Table<TimeOffRequest>
          data={visible}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      )}
    </VStack>
  );

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>Time off</Heading>
                  <Text type="supporting" color="secondary">
                    {requests.length}{' '}
                    {requests.length === 1 ? 'request' : 'requests'} ·{' '}
                    <span style={styles.countPending}>
                      {pendingCount} pending
                    </span>{' '}
                    ·{' '}
                    <span style={styles.countApproved}>
                      {approvedCount} approved
                    </span>
                  </Text>
                </VStack>
              </StackItem>
              <Badge
                label="July 2026"
                variant="neutral"
                icon={<Icon icon={CalendarDaysIcon} size="sm" color="inherit" />}
              />
              <Button
                label="Policies"
                variant="secondary"
                size={isTouch ? 'lg' : 'sm'}
                icon={<Icon icon={ScrollTextIcon} size="sm" color="inherit" />}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={6}>
            <VStack gap={6} style={styles.contentColumn}>
              {/* Balance cards — remaining days react to submits/cancels. */}
              <Grid columns={{minWidth: 220, max: 3}} gap={4}>
                {BALANCES.map(balance => (
                  <BalanceCard
                    key={balance.type}
                    balance={balance}
                    scheduled={scheduledByType(balance.type)}
                  />
                ))}
              </Grid>

              {/* <=1024px: the new-request form stacks inline here. */}
              {isStacked && (
                <Card>
                  {form}
                </Card>
              )}

              <Divider />

              <TeamAbsenceStrip
                requests={requests}
                selectedRequestId={selectedAbsenceId}
                onSelectRequest={setSelectedAbsenceId}
              />

              <Divider />

              {requestsSection}
            </VStack>
          </LayoutContent>
        }
        end={
          isStacked ? undefined : (
            <LayoutPanel width={360} padding={0} label="New time-off request">
              <div style={styles.formPanel}>{form}</div>
            </LayoutPanel>
          )
        }
      />

      {/* Two-step destructive: deny/cancel only land after this confirm. */}
      <AlertDialog
        isOpen={pendingAction != null && actionTarget != null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setPendingAction(null);
          }
        }}
        title={
          pendingAction?.kind === 'deny'
            ? 'Deny time-off request?'
            : 'Cancel your request?'
        }
        description={
          actionTarget != null
            ? pendingAction?.kind === 'deny'
              ? `${PERSON_BY_ID[actionTarget.personId].name}'s ${TYPE_LABEL[
                  actionTarget.type
                ].toLowerCase()} request for ${formatIsoRange(
                  actionTarget.start,
                  actionTarget.end,
                )} (${formatDays(actionTarget.days)} ${
                  actionTarget.days === 1 ? 'day' : 'days'
                }) will be denied. They'll be notified with your decision.`
              : `Your ${TYPE_LABEL[actionTarget.type].toLowerCase()} request for ${formatIsoRange(
                  actionTarget.start,
                  actionTarget.end,
                )} will be withdrawn and the ${formatDays(
                  actionTarget.days,
                )} ${actionTarget.days === 1 ? 'day' : 'days'} returned to your balance.`
            : ''
        }
        actionLabel={
          pendingAction?.kind === 'deny' ? 'Deny request' : 'Withdraw request'
        }
        onAction={confirmPendingAction}
      />
    </>
  );
}
