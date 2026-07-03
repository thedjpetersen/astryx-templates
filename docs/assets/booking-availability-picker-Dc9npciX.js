var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file booking-availability-picker.tsx
 * @input Deterministic fixtures only (a host profile, a two-week
 *   availability map keyed by ISO date whose slots are minutes-from-midnight
 *   UTC, and a fixed timezone offset table) — no clocks, no randomness, no
 *   network assets. "Today" is the fixed constant 2026-07-02 and the
 *   bookable window is the literal Jul 6 – Jul 19 fixture, so the strip,
 *   dots, and labels never drift.
 * @output Booking Picker — a Calendly-style scheduling page. A host/service
 *   summary rail (gradient cover band, Avatar, duration + video-call
 *   Badges, description, agenda) docks to the left edge; the content column
 *   walks pick → confirm → booked: a horizontal two-week date strip with
 *   availability dots and week paging, a timezone Selector that re-labels
 *   every displayed slot (slots are stored in UTC and formatted through the
 *   chosen fixed offset, including cross-midnight "+1d" markers), a
 *   time-slot grid for the selected date with a confirm bar once a slot is
 *   chosen, a details form (name, email, notes) with validation, and a
 *   green success panel summarizing the booking with a "Book another time"
 *   reset.
 * @position Page template; emitted by \`astryx template booking-availability-picker\`.
 *
 * Frame: header | host rail (LayoutPanel start, 320 / 280 narrow) | content
 * (LayoutContent, scrolls). All booking state lives in useState: selected
 * date, selected UTC slot, timezone id, wizard stage, and the details
 * draft. Changing the date clears the slot; changing the timezone keeps the
 * slot selected and only shifts its label (same underlying UTC time).
 * Every stage change is announced through a visually hidden aria-live
 * region.
 *
 * Container policy: the page chrome is frame-first (Layout header/start/
 * content); the rail is flat stacked sections with Dividers rather than
 * nested Cards; the content column uses plain sections for the strip and
 * slot grid and reaches for Card only where a bounded container earns it
 * (the phone host summary and the confirm-form/success surfaces).
 *
 * Responsive contract:
 * - > 960px: the host rail is a docked 320px LayoutPanel start; the content
 *   column takes the remaining width.
 * - 641–960px: the rail narrows to 280px; the slot grid re-flows via
 *   auto-fill so columns drop before buttons shrink.
 * - <= 640px: the docked rail is dropped; a compact host summary Card
 *   (Avatar, duration + video Badges, collapsed description) renders at the
 *   top of the single content pane so the pick flow is first-screen on a
 *   375px phone. The timezone Selector goes full-width on its own row.
 * - Date strip: deliberate overflow-x — the 7-day page scrolls horizontally
 *   inside its own scroll wrapper with scroll-snap chips (64px min width,
 *   64px min height) so a 375px viewport pans the week instead of clipping
 *   it; week paging is tap-first via prev/next IconButtons, never
 *   hover-revealed.
 * - Slot grid: repeat(auto-fill, minmax(120px, 1fr)) with 44px-tall slot
 *   buttons at every width — comfortably above the ~40px tap guideline.
 * - Confirm bar / form / success: single column throughout; footer actions
 *   keep 40px heights on phones. Nothing on the page is hover-only —
 *   selection, paging, and confirmation are all plain buttons with
 *   aria-pressed state.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarPlusIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GlobeIcon,
  VideoIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Host rail: flat stacked sections; the rail itself scrolls if short
  // viewports need it.
  railFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
  },
  railSection: {
    padding: 'var(--spacing-4)',
  },
  // Gradient cover band: a styled placeholder instead of a real image, so
  // the rail reads like a branded profile without any network asset.
  coverBand: {
    height: 72,
    flexShrink: 0,
    background:
      'linear-gradient(135deg, var(--color-accent) 0%, ' +
      'var(--color-background-purple, var(--color-background-muted)) 100%)',
  },
  // Pull the avatar up over the cover band edge.
  avatarLift: {
    marginTop: -28,
  },
  // Content column: single column, capped width, constant 16px gutters.
  column: {
    width: '100%',
    maxWidth: 720,
    marginInline: 'auto',
    paddingInline: 16,
    paddingBlock: 'var(--spacing-5)',
  },
  // Date strip: deliberate horizontal overflow with snap chips so a phone
  // pans the week instead of clipping it.
  stripScroller: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
    scrollSnapType: 'x proximity',
  },
  // 64px-min chips: weekday, day number, availability dot. Native buttons
  // so tap/focus work everywhere; aria-pressed carries selection.
  dateChip: {
    minWidth: 64,
    minHeight: 64,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background)',
    cursor: 'pointer',
    font: 'inherit',
    padding: 'var(--spacing-1)',
  },
  dateChipSelected: {
    border: 'var(--border-width) solid var(--color-accent)',
    backgroundColor: 'var(--color-background-selected, var(--color-background-muted))',
  },
  dateChipDisabled: {
    cursor: 'default',
    backgroundColor: 'var(--color-background-muted)',
    opacity: 0.55,
  },
  // 6px availability dot; days without slots render a transparent twin so
  // chip heights never shift.
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
  },
  availabilityDotHidden: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'transparent',
  },
  // Slot grid: auto-fill columns so widths drop columns before shrinking
  // buttons; 44px min height keeps slots above the tap guideline.
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  slotButton: {
    minHeight: 44,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text)',
    paddingInline: 'var(--spacing-2)',
  },
  slotButtonSelected: {
    border: 'var(--border-width) solid var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  // Confirm bar under the grid once a slot is chosen.
  confirmBar: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  // Success panel: green-tinted bounded surface, mirrors the sibling
  // "connected" strip treatment.
  successPanel: {
    border: 'var(--border-width) solid var(--color-border-green, var(--color-success))',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-green, var(--color-background-muted))',
    padding: 'var(--spacing-4)',
  },
  summaryBox: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background)',
    padding: 'var(--spacing-3)',
  },
  // Brand tile in the page header.
  brandTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  // <=640px: primary flow buttons keep 40px heights for thumbs.
  buttonTapTarget: {height: 40},
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

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

// Fixed "today" so the header copy is deterministic; the bookable window
// starts the following Monday.
const TODAY = '2026-07-02';

const HOST = {
  name: 'Maya Okafor',
  role: 'Senior Product Strategist',
  org: 'Northlight Advisory',
};

const SERVICE = {
  title: 'Product strategy intro call',
  durationMinutes: 30,
  location: 'Google Meet',
  description:
    'A working session to map where your product is today and where the ' +
    'next quarter should take it. Come with a problem; leave with a ' +
    'sequenced plan and the two metrics that matter.',
  agenda: [
    'Where you are: product, team, and traction in five minutes',
    'The one bottleneck worth solving this quarter',
    'Next steps and whether a deeper engagement makes sense',
  ],
};

/** Minutes-from-midnight helper for the UTC slot fixtures below. */
function utc(hours: number, minutes = 0): number {
  return hours * 60 + minutes;
}

interface DayFixture {
  iso: string;
  weekday: string;
  month: string;
  day: number;
}

// The literal two-week window (Mon Jul 6 – Sun Jul 19, 2026). Weekday names
// are part of the fixture so no Date math ever runs.
const DAYS: DayFixture[] = [
  {iso: '2026-07-06', weekday: 'Mon', month: 'Jul', day: 6},
  {iso: '2026-07-07', weekday: 'Tue', month: 'Jul', day: 7},
  {iso: '2026-07-08', weekday: 'Wed', month: 'Jul', day: 8},
  {iso: '2026-07-09', weekday: 'Thu', month: 'Jul', day: 9},
  {iso: '2026-07-10', weekday: 'Fri', month: 'Jul', day: 10},
  {iso: '2026-07-11', weekday: 'Sat', month: 'Jul', day: 11},
  {iso: '2026-07-12', weekday: 'Sun', month: 'Jul', day: 12},
  {iso: '2026-07-13', weekday: 'Mon', month: 'Jul', day: 13},
  {iso: '2026-07-14', weekday: 'Tue', month: 'Jul', day: 14},
  {iso: '2026-07-15', weekday: 'Wed', month: 'Jul', day: 15},
  {iso: '2026-07-16', weekday: 'Thu', month: 'Jul', day: 16},
  {iso: '2026-07-17', weekday: 'Fri', month: 'Jul', day: 17},
  {iso: '2026-07-18', weekday: 'Sat', month: 'Jul', day: 18},
  {iso: '2026-07-19', weekday: 'Sun', month: 'Jul', day: 19},
];

const DAYS_PER_PAGE = 7;
const WEEK_LABELS = ['Week of Jul 6', 'Week of Jul 13'];

// Availability is stored as minutes-from-midnight UTC so the timezone
// Selector is pure presentation: switching zones re-labels the same slots.
// The host works roughly 13:00–20:30 UTC (9:00 AM–4:30 PM Eastern);
// weekends are empty on purpose so the strip shows disabled days.
const AVAILABILITY: Record<string, number[]> = {
  '2026-07-06': [utc(13), utc(13, 30), utc(15), utc(15, 30), utc(19)],
  '2026-07-07': [utc(14), utc(14, 30), utc(16), utc(18, 30), utc(19), utc(19, 30)],
  '2026-07-08': [
    utc(13),
    utc(13, 30),
    utc(14),
    utc(15, 30),
    utc(16),
    utc(17, 30),
    utc(19),
    utc(20),
  ],
  '2026-07-09': [utc(15), utc(15, 30), utc(16), utc(16, 30)],
  '2026-07-10': [utc(13, 30), utc(17), utc(17, 30)],
  '2026-07-11': [],
  '2026-07-12': [],
  '2026-07-13': [utc(13), utc(14), utc(14, 30), utc(15), utc(18)],
  '2026-07-14': [utc(16), utc(16, 30), utc(17), utc(19, 30), utc(20)],
  '2026-07-15': [utc(13), utc(13, 30), utc(15), utc(16), utc(18, 30)],
  '2026-07-16': [utc(14, 30), utc(15), utc(17), utc(17, 30), utc(19)],
  '2026-07-17': [utc(13), utc(15, 30), utc(16)],
  '2026-07-18': [],
  '2026-07-19': [],
};

interface TimezoneFixture {
  id: string;
  label: string;
  short: string;
  offsetMinutes: number;
}

// Fixed offsets (summer 2026 values baked in) — no Intl or Date lookups, so
// labels are identical on every render in every environment.
const TIMEZONES: TimezoneFixture[] = [
  {id: 'pacific', label: 'Pacific Time (UTC−7)', short: 'PT', offsetMinutes: -420},
  {id: 'mountain', label: 'Mountain Time (UTC−6)', short: 'MT', offsetMinutes: -360},
  {id: 'central', label: 'Central Time (UTC−5)', short: 'CT', offsetMinutes: -300},
  {id: 'eastern', label: 'Eastern Time (UTC−4)', short: 'ET', offsetMinutes: -240},
  {id: 'london', label: 'London (UTC+1)', short: 'UK', offsetMinutes: 60},
  {id: 'berlin', label: 'Berlin (UTC+2)', short: 'DE', offsetMinutes: 120},
  {id: 'india', label: 'India (UTC+5:30)', short: 'IST', offsetMinutes: 330},
  {id: 'sydney', label: 'Sydney (UTC+10)', short: 'AEST', offsetMinutes: 600},
];

const TIMEZONE_OPTIONS = TIMEZONES.map(zone => ({
  value: zone.id,
  label: zone.label,
}));

const DEFAULT_TIMEZONE_ID = 'eastern';
// The seeded selection: mid-week day with the fullest slot list.
const DEFAULT_DATE_ISO = '2026-07-08';

interface BookingDraft {
  name: string;
  email: string;
  notes: string;
}

const EMPTY_DRAFT: BookingDraft = {name: '', email: '', notes: ''};

type Stage = 'pick' | 'confirm' | 'booked';

// ---------------------------------------------------------------------------
// DERIVED PRESENTATION
// ---------------------------------------------------------------------------

/**
 * Format a UTC slot through a fixed offset as a 12-hour label. Slots that
 * cross midnight in the viewer's zone carry an explicit "+1d" / "−1d"
 * marker instead of silently landing on the wrong date — string math only.
 */
function formatSlot(utcMinutes: number, offsetMinutes: number): string {
  const total = utcMinutes + offsetMinutes;
  const dayShift = Math.floor(total / 1440);
  const minutes = ((total % 1440) + 1440) % 1440;
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const meridiem = hours24 < 12 ? 'AM' : 'PM';
  const minuteLabel = mins < 10 ? \`0\${mins}\` : \`\${mins}\`;
  const base = \`\${hours12}:\${minuteLabel} \${meridiem}\`;
  if (dayShift > 0) {
    return \`\${base} +1d\`;
  }
  if (dayShift < 0) {
    return \`\${base} −1d\`;
  }
  return base;
}

/** "9:00 AM – 9:30 AM" range for the confirm bar and summaries. */
function formatSlotRange(
  utcMinutes: number,
  offsetMinutes: number,
  durationMinutes: number,
): string {
  return \`\${formatSlot(utcMinutes, offsetMinutes)} – \${formatSlot(
    utcMinutes + durationMinutes,
    offsetMinutes,
  )}\`;
}

function formatDay(day: DayFixture): string {
  return \`\${day.weekday}, \${day.month} \${day.day}\`;
}

function dayByIso(iso: string): DayFixture {
  return DAYS.find(day => day.iso === iso) ?? DAYS[0];
}

function zoneById(id: string): TimezoneFixture {
  return TIMEZONES.find(zone => zone.id === id) ?? TIMEZONES[3];
}

// Deliberately simple deterministic shape check — enough to gate the
// confirm button without pretending to be a real validator.
function isPlausibleEmail(value: string): boolean {
  const trimmed = value.trim();
  const at = trimmed.indexOf('@');
  return at > 0 && trimmed.indexOf('.', at) > at + 1;
}

// ---------------------------------------------------------------------------
// HOST / SERVICE SUMMARY
// ---------------------------------------------------------------------------

/**
 * The shared host + service block: Avatar over a name/role stack, duration
 * and video-call Badges, description, and (full variant only) the agenda
 * list. Rendered inside the docked rail above 640px and inside a compact
 * Card at the top of the single pane below it.
 */
function HostSummary({variant}: {variant: 'rail' | 'compact'}) {
  const isCompact = variant === 'compact';
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center">
        <div style={isCompact ? undefined : styles.avatarLift}>
          <Avatar name={HOST.name} size={isCompact ? 40 : 64} />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>{HOST.name}</Heading>
            <Text type="supporting" color="secondary">
              {HOST.role} · {HOST.org}
            </Text>
          </VStack>
        </StackItem>
      </HStack>

      <VStack gap={2}>
        <Heading level={3}>{SERVICE.title}</Heading>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Badge
            variant="neutral"
            label={\`\${SERVICE.durationMinutes} min\`}
            icon={<Icon icon={ClockIcon} size="xsm" />}
          />
          <Badge
            variant="info"
            label={\`\${SERVICE.location} video\`}
            icon={<Icon icon={VideoIcon} size="xsm" />}
          />
        </HStack>
        <Text
          type="supporting"
          color="secondary"
          maxLines={isCompact ? 2 : undefined}>
          {SERVICE.description}
        </Text>
      </VStack>

      {!isCompact && (
        <VStack gap={2}>
          <Divider />
          <Text type="label" size="sm" color="secondary">
            What we&apos;ll cover
          </Text>
          <VStack gap={1}>
            {SERVICE.agenda.map((item, index) => (
              <HStack gap={2} vAlign="start" key={item}>
                <Text type="supporting" color="secondary">
                  {index + 1}.
                </Text>
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    {item}
                  </Text>
                </StackItem>
              </HStack>
            ))}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// DATE STRIP
// ---------------------------------------------------------------------------

/**
 * One 7-day page of the two-week window: snap chips with weekday, day
 * number, and an availability dot. Prev/next IconButtons page between the
 * weeks; the scroller still pans horizontally on narrow phones so chips
 * are never clipped or shrunk.
 */
function DateStrip({
  page,
  selectedIso,
  onSelectDay,
  onPage,
}: {
  page: number;
  selectedIso: string;
  onSelectDay: (iso: string) => void;
  onPage: (next: number) => void;
}) {
  const pageCount = Math.ceil(DAYS.length / DAYS_PER_PAGE);
  const visible = DAYS.slice(
    page * DAYS_PER_PAGE,
    page * DAYS_PER_PAGE + DAYS_PER_PAGE,
  );

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm" color="secondary">
            {WEEK_LABELS[page]}
          </Text>
        </StackItem>
        <IconButton
          label="Previous week"
          icon={<Icon icon={ChevronLeftIcon} size="sm" />}
          variant="ghost"
          size="sm"
          isDisabled={page === 0}
          onClick={() => onPage(page - 1)}
        />
        <IconButton
          label="Next week"
          icon={<Icon icon={ChevronRightIcon} size="sm" />}
          variant="ghost"
          size="sm"
          isDisabled={page >= pageCount - 1}
          onClick={() => onPage(page + 1)}
        />
      </HStack>

      <div style={styles.stripScroller} role="group" aria-label="Available dates">
        {visible.map(day => {
          const slotCount = AVAILABILITY[day.iso]?.length ?? 0;
          const hasSlots = slotCount > 0;
          const isSelected = day.iso === selectedIso;
          const chipStyle: CSSProperties = {
            ...styles.dateChip,
            ...(isSelected ? styles.dateChipSelected : undefined),
            ...(hasSlots ? undefined : styles.dateChipDisabled),
          };
          return (
            <button
              key={day.iso}
              type="button"
              style={chipStyle}
              disabled={!hasSlots}
              aria-pressed={isSelected}
              aria-label={
                hasSlots
                  ? \`\${formatDay(day)} — \${slotCount} times available\`
                  : \`\${formatDay(day)} — no times available\`
              }
              onClick={() => onSelectDay(day.iso)}>
              <Text type="supporting" size="sm" color="secondary">
                {day.weekday}
              </Text>
              <Text type="body" weight="semibold">
                {day.day}
              </Text>
              <div
                style={
                  hasSlots ? styles.availabilityDot : styles.availabilityDotHidden
                }
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// SLOT GRID
// ---------------------------------------------------------------------------

/**
 * The time-slot grid for the selected date. Slots are UTC fixtures; labels
 * come from the active timezone offset, so switching zones re-labels the
 * grid without touching selection state.
 */
function SlotGrid({
  slots,
  selectedSlot,
  offsetMinutes,
  onSelectSlot,
}: {
  slots: number[];
  selectedSlot: number | null;
  offsetMinutes: number;
  onSelectSlot: (slot: number) => void;
}) {
  return (
    <div style={styles.slotGrid} role="group" aria-label="Available times">
      {slots.map(slot => {
        const isSelected = slot === selectedSlot;
        const label = formatSlot(slot, offsetMinutes);
        return (
          <button
            key={slot}
            type="button"
            style={
              isSelected
                ? {...styles.slotButton, ...styles.slotButtonSelected}
                : styles.slotButton
            }
            aria-pressed={isSelected}
            aria-label={\`Select \${label}\`}
            onClick={() => onSelectSlot(slot)}>
            <Text type="body" size="sm" weight="medium" color="inherit">
              {label}
            </Text>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOOKING SUMMARY BOX
// ---------------------------------------------------------------------------

/**
 * Bounded recap of the chosen slot — reused above the details form and
 * inside the success panel so both stages state the same facts.
 */
function BookingSummary({
  day,
  slot,
  zone,
}: {
  day: DayFixture;
  slot: number;
  zone: TimezoneFixture;
}) {
  return (
    <VStack gap={2} style={styles.summaryBox}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ClockIcon} size="sm" color="secondary" />
        <Text type="body" size="sm" weight="medium">
          {formatDay(day)} ·{' '}
          {formatSlotRange(slot, zone.offsetMinutes, SERVICE.durationMinutes)}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center">
        <Icon icon={GlobeIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          {zone.label}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center">
        <Icon icon={VideoIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          {SERVICE.location} link sent after confirmation
        </Text>
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function BookingAvailabilityPickerTemplate() {
  // Wizard: pick (strip + grid) → confirm (details form) → booked.
  const [stage, setStage] = useState<Stage>('pick');
  const [weekPage, setWeekPage] = useState(0);
  const [selectedIso, setSelectedIso] = useState(DEFAULT_DATE_ISO);
  // The selected slot is the UTC fixture value; timezone changes re-label
  // it but never clear it.
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [timezoneId, setTimezoneId] = useState(DEFAULT_TIMEZONE_ID);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: below 960px the rail narrows to 280px; at phone
  // widths the docked rail is dropped and a compact host Card leads the
  // single content pane instead.
  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const zone = zoneById(timezoneId);
  const selectedDay = dayByIso(selectedIso);
  const slots = useMemo(() => AVAILABILITY[selectedIso] ?? [], [selectedIso]);

  const canConfirm =
    draft.name.trim().length > 0 && isPlausibleEmail(draft.email);

  const selectDay = (iso: string) => {
    setSelectedIso(iso);
    // A new date invalidates the old time — the fixtures differ per day.
    setSelectedSlot(null);
    setAnnouncement(
      \`\${formatDay(dayByIso(iso))}: \${AVAILABILITY[iso]?.length ?? 0} times available\`,
    );
  };

  const selectSlot = (slot: number) => {
    setSelectedSlot(slot);
    setAnnouncement(
      \`Selected \${formatSlot(slot, zone.offsetMinutes)} on \${formatDay(selectedDay)}\`,
    );
  };

  const changeTimezone = (id: string) => {
    setTimezoneId(id);
    const next = zoneById(id);
    setAnnouncement(\`Times now shown in \${next.label}\`);
  };

  const startConfirm = () => {
    setStage('confirm');
    setAnnouncement('Enter your details to confirm the booking');
  };

  const backToSlots = () => {
    setStage('pick');
    setAnnouncement('Back to time selection');
  };

  const confirmBooking = () => {
    setStage('booked');
    setAnnouncement(
      \`Booked \${SERVICE.title} on \${formatDay(selectedDay)} at \${formatSlot(
        selectedSlot ?? 0,
        zone.offsetMinutes,
      )}\`,
    );
  };

  const bookAnother = () => {
    setStage('pick');
    setSelectedSlot(null);
    setDraft(EMPTY_DRAFT);
    setAnnouncement('Pick another time');
  };

  // ----- Stage: pick -----
  const timezoneRow = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Icon icon={GlobeIcon} size="sm" color="secondary" />
      <StackItem size="fill">
        <Selector
          label="Timezone"
          isLabelHidden
          size="sm"
          options={TIMEZONE_OPTIONS}
          value={timezoneId}
          onChange={value => changeTimezone(value as string)}
          width={isPhone ? '100%' : 280}
        />
      </StackItem>
    </HStack>
  );

  const pickStage = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Select a date &amp; time</Heading>
        <Text type="supporting" color="secondary">
          Booking window opens Monday — today is {TODAY}. All times shown in{' '}
          {zone.short}.
        </Text>
      </VStack>

      <DateStrip
        page={weekPage}
        selectedIso={selectedIso}
        onSelectDay={selectDay}
        onPage={setWeekPage}
      />

      <Divider />

      {timezoneRow}

      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          {slots.length > 0
            ? \`\${slots.length} times available on \${formatDay(selectedDay)}\`
            : \`No times available on \${formatDay(selectedDay)}\`}
        </Text>
        {slots.length > 0 ? (
          <SlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            offsetMinutes={zone.offsetMinutes}
            onSelectSlot={selectSlot}
          />
        ) : (
          <Text type="supporting" color="secondary">
            {HOST.name.split(' ')[0]} isn&apos;t taking calls this day — pick
            another date from the strip above.
          </Text>
        )}
      </VStack>

      {/* Confirm bar: appears once a slot is chosen; Next advances to the
          details form. */}
      {selectedSlot !== null && (
        <HStack gap={2} vAlign="center" wrap="wrap" style={styles.confirmBar}>
          <Icon icon={CheckIcon} size="sm" color="success" />
          <StackItem size="fill">
            <Text type="body" size="sm" weight="medium">
              {formatDay(selectedDay)} ·{' '}
              {formatSlotRange(
                selectedSlot,
                zone.offsetMinutes,
                SERVICE.durationMinutes,
              )}{' '}
              {zone.short}
            </Text>
          </StackItem>
          <Button
            label="Next"
            size="sm"
            style={isPhone ? styles.buttonTapTarget : undefined}
            onClick={startConfirm}
          />
        </HStack>
      )}
    </VStack>
  );

  // ----- Stage: confirm -----
  const confirmStage = selectedSlot !== null && (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <IconButton
          label="Back to time selection"
          icon={<Icon icon={ChevronLeftIcon} size="sm" />}
          variant="ghost"
          onClick={backToSlots}
        />
        <VStack gap={0}>
          <Heading level={2}>Enter your details</Heading>
          <Text type="supporting" color="secondary">
            {SERVICE.title} with {HOST.name}
          </Text>
        </VStack>
      </HStack>

      <BookingSummary day={selectedDay} slot={selectedSlot} zone={zone} />

      <Card padding={4}>
        <FormLayout>
          <TextInput
            label="Name"
            placeholder="e.g. Jordan Rivera"
            value={draft.name}
            onChange={name => setDraft(prev => ({...prev, name}))}
            isRequired
            width="100%"
          />
          <TextInput
            label="Email"
            description="The calendar invite and video link go here."
            placeholder="you@company.com"
            value={draft.email}
            onChange={email => setDraft(prev => ({...prev, email}))}
            isRequired
            width="100%"
          />
          <TextArea
            label="Anything to share before the call?"
            placeholder="Context, links, or the problem you want to dig into..."
            value={draft.notes}
            onChange={notes => setDraft(prev => ({...prev, notes}))}
            rows={3}
            width="100%"
          />
        </FormLayout>
      </Card>

      <HStack gap={2} vAlign="center">
        <Button
          label="Back"
          variant="secondary"
          style={isPhone ? styles.buttonTapTarget : undefined}
          onClick={backToSlots}
        />
        <StackItem size="fill" />
        <Button
          label="Confirm booking"
          isDisabled={!canConfirm}
          style={isPhone ? styles.buttonTapTarget : undefined}
          tooltip={canConfirm ? undefined : 'Name and a valid email required'}
          onClick={confirmBooking}
        />
      </HStack>
    </VStack>
  );

  // ----- Stage: booked -----
  const bookedStage = selectedSlot !== null && (
    <VStack gap={4}>
      <VStack gap={3} style={styles.successPanel}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CheckIcon} size="md" color="success" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={2}>You&apos;re booked</Heading>
              <Text type="supporting" color="secondary">
                A confirmation is on its way to {draft.email.trim()}
              </Text>
            </VStack>
          </StackItem>
          <Badge variant="success" label="Confirmed" />
        </HStack>

        <BookingSummary day={selectedDay} slot={selectedSlot} zone={zone} />

        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Add to calendar"
            variant="secondary"
            size="sm"
            style={isPhone ? styles.buttonTapTarget : undefined}
            icon={<Icon icon={CalendarPlusIcon} size="sm" />}
          />
          <Button
            label="Book another time"
            variant="ghost"
            size="sm"
            style={isPhone ? styles.buttonTapTarget : undefined}
            onClick={bookAnother}
          />
        </HStack>
      </VStack>

      {draft.notes.trim().length > 0 && (
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Shared with {HOST.name.split(' ')[0]}
          </Text>
          <Text type="supporting" color="secondary">
            {draft.notes}
          </Text>
        </VStack>
      )}
    </VStack>
  );

  const stageBody =
    stage === 'pick' ? pickStage : stage === 'confirm' ? confirmStage : bookedStage;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <div style={styles.brandTile}>
              <Icon icon={VideoIcon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>{HOST.org}</Heading>
                <Badge
                  variant="neutral"
                  label={\`\${SERVICE.durationMinutes} min\`}
                  icon={<Icon icon={ClockIcon} size="xsm" />}
                />
              </HStack>
            </StackItem>
            {/* Marketing chrome only — dropped on phones so the title row
                never wraps into a second line of clutter. */}
            {!isPhone && (
              <Text type="supporting" color="secondary">
                Powered by Astryx Booking
              </Text>
            )}
          </HStack>
        </LayoutHeader>
      }
      start={
        // > 640px: docked host rail. On phones the rail is dropped entirely
        // and HostSummary renders compact inside the content column below.
        isPhone ? undefined : (
          <LayoutPanel
            hasDivider
            padding={0}
            width={isNarrow ? 280 : 320}
            label="Host and service details">
            <div style={styles.railFill}>
              <div style={styles.coverBand} aria-hidden />
              <div style={styles.railSection}>
                <HostSummary variant="rail" />
              </div>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0} role="main" label="Booking flow">
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.column}>
            <VStack gap={4}>
              {/* <=640px single-pane fallback: the host summary leads the
                  column as a compact Card so the pick flow stays
                  first-screen at 375px. */}
              {isPhone && (
                <Card padding={4}>
                  <HostSummary variant="compact" />
                </Card>
              )}
              {stageBody}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};