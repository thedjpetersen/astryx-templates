var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one meeting to schedule — "Design
 *   system sync" on Thu Jul 9, 2026 — seven team members across six
 *   timezones from UTC-7 to UTC+9 with fixed per-hour free/busy/tentative
 *   availability over a 13:00–22:00 UTC window; three members are marked
 *   required)
 * @output Meeting-coordination scheduler: header with meeting Heading +
 *   caption and a 30/60/90-minute duration SegmentedControl; a legend band
 *   with free/busy/tentative swatches, an off-hours hatch key, and a
 *   "Dim off-hours" Switch; the main region is an availability matrix —
 *   sticky member column (Avatar, name, role, timezone with UTC offset) by
 *   nine UTC hour columns of tinted ✓/~/× cells, with a rounded accent
 *   slot-highlight overlay that slides (CSS transition) to whichever column
 *   is clicked and widens to two columns for 90-minute meetings; an end
 *   panel ranks the top three suggested slots as SelectableCards
 *   (attendance ProgressBar, conflict Tokens, required-conflict note) above
 *   a selected-slot summary with chevron nudge IconButtons, per-member
 *   local time ranges (half-hour offsets and +1d day-shift Tokens
 *   included), per-member status Tokens, and a Send invite Button that
 *   flips to a success Banner
 * @position Page template; emitted by \`astryx template team-scheduler\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the meeting chrome
 * (title + caption, duration SegmentedControl). LayoutContent scrolls a
 * column: legend band, then the matrix in its own horizontal scroller.
 * LayoutPanel end 340 hosts suggested slots + the selected-slot summary.
 * The unit here is a cross-timezone attendee set — a member-by-hour matrix
 * with a movable column highlight beats a week-grid calendar because the
 * decision variable is "which hour", not "which day".
 *
 * Responsive contract:
 * - Matrix: the scroller owns overflow-x at every width (tabIndex 0 so
 *   keyboard users can pan it); the member column is position:sticky left
 *   with an edge shadow once content has actually scrolled beneath it, and
 *   hour columns keep fixed pixel widths instead of compressing.
 * - Hour cells are 44px-tall buttons at every width — tap targets never
 *   depend on hover; every cell and hour header carries a full aria-label
 *   (slot, member, status, off-hours note) and the slot moves on plain
 *   click/tap, so there is no drag or hover-only interaction.
 * - >768px: suggested slots + summary dock in a 340px end LayoutPanel that
 *   scrolls internally; the content column scrolls independently.
 * - <=768px: the end panel leaves the right edge and stacks below the
 *   matrix as a full-width section (single-pane fallback); the column
 *   flows at natural height and LayoutContent scrolls it as one page.
 * - <=640px: the member column narrows from 208px to 124px — the role line
 *   hides, names truncate with ellipsis, and the timezone chip keeps the
 *   UTC offset; hour columns narrow from 56px to 48px; the header caption
 *   collapses to the member count and the header row wraps so the duration
 *   control drops below the title instead of clipping.
 *
 * Container policy (coordination-workbench archetype): the page chrome is
 * frame-first rows and panels; Cards are reserved for the ranked suggested
 * slots (SelectableCard) and the summary keeps plain rows. All rankings,
 * counts, and local times recompute live from the selected slot and
 * duration — no clocks, randomness, or network assets; avatars are
 * initials-only Avatar placeholders.
 */

import {
  Fragment,
  useMemo,
  useState,
  type CSSProperties,
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
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Switch} from '@astryxdesign/core/Switch';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarClockIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SendIcon,
} from 'lucide-react';

// ============= STYLES =============

// Token-pure palette: every color resolves through Astryx light-dark()
// tokens, so the matrix re-tints itself under the demo's scheme toggle.
const colors = {
  surface: 'var(--color-background-body)',
  surfaceMuted: 'var(--color-background-muted)',
  border: 'var(--color-border)',
  accent: 'var(--color-accent)',
  freeBg: 'var(--color-background-green)',
  freeFg: 'var(--color-text-green)',
  busyBg: 'var(--color-background-red)',
  busyFg: 'var(--color-text-red)',
  tentativeBg: 'var(--color-background-yellow)',
  tentativeFg: 'var(--color-text-yellow)',
};

// Sticky member column casts this shadow only after the matrix has
// actually scrolled horizontally beneath it. Mixed from the text token so
// it stays a subtle ink-tinted edge in both schemes.
const COLUMN_SHADOW =
  '8px 0 8px -8px color-mix(in oklab, var(--color-text-primary) 18%, transparent)';

// Diagonal hatch marks hours that fall outside a member's local 08:00–18:00.
const HATCH_STROKE =
  'color-mix(in oklab, var(--color-text-primary) 12%, transparent)';
const OFF_HOURS_HATCH =
  \`repeating-linear-gradient(135deg, \${HATCH_STROKE} 0px, \` +
  \`\${HATCH_STROKE} 3px, transparent 3px, transparent 7px)\`;

const styles: Record<string, CSSProperties> = {
  column: {
    maxWidth: 1280,
    marginInline: 'auto',
    width: '100%',
  },
  legendRow: {rowGap: 'var(--spacing-2)'},
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1,
  },
  // The single horizontal scroller; the sticky member column and the slot
  // highlight overlay both live inside it.
  scroller: {
    overflowX: 'auto',
    border: \`1px solid \${colors.border}\`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surface,
  },
  grid: {
    display: 'grid',
    position: 'relative',
    width: 'max-content',
    minWidth: '100%',
  },
  // Frozen member column (row headers).
  memberCell: {
    position: 'sticky',
    left: 0,
    zIndex: 3,
    backgroundColor: colors.surface,
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: \`1px solid \${colors.border}\`,
    boxSizing: 'border-box',
  },
  memberText: {minWidth: 0},
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cornerCell: {
    zIndex: 4,
    alignItems: 'flex-end',
  },
  hourHeaderButton: {
    border: 'none',
    background: 'transparent',
    padding: 'var(--spacing-1) 0',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    minHeight: 44,
    borderBottom: \`1px solid \${colors.border}\`,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  // Availability cells: 44px-tall buttons at every width (tap targets).
  cellButton: {
    border: 'none',
    background: 'transparent',
    padding: '0 4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderBottom: \`1px solid \${colors.border}\`,
    boxSizing: 'border-box',
  },
  cellSwatch: {
    width: '100%',
    height: 28,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  },
  // The "draggable-feel" slot highlight: a rounded accent frame absolutely
  // positioned over the selected column(s); left/width transition so it
  // slides when a new column is clicked and widens for 90-minute slots.
  slotOverlay: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    border: \`2px solid \${colors.accent}\`,
    borderRadius: 10,
    pointerEvents: 'none',
    transition: 'left 160ms ease, width 160ms ease',
    zIndex: 2,
    boxShadow:
      '0 0 0 3px color-mix(in oklab, var(--color-accent) 14%, transparent)',
  },
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // <=768px: the panel content stacks below the matrix as a plain section.
  panelStacked: {padding: 'var(--spacing-4) 0 0'},
  conflictRow: {rowGap: 'var(--spacing-1)'},
  summaryLocal: {textAlign: 'right'},
};

// ============= DATA =============
// Deterministic fixtures: one fixed meeting day, seven members with fixed
// per-hour availability — no clocks, no randomness, no network assets.

type SlotStatus = 'free' | 'busy' | 'tentative';
type DurationMin = 30 | 60 | 90;

const MEETING_TITLE = 'Design system sync';
const MEETING_DAY = 'Thu Jul 9, 2026';

// UTC hour window: nine one-hour columns, 13:00 through 22:00.
const START_HOUR_UTC = 13;
const HOUR_COUNT = 9;
const HOURS = Array.from({length: HOUR_COUNT}, (_, i) => START_HOUR_UTC + i);

// Local working hours used for the off-hours hatch: 08:00–18:00.
const WORK_START_MIN = 8 * 60;
const WORK_END_MIN = 18 * 60;

interface Member {
  id: string;
  name: string;
  role: string;
  city: string;
  tz: string; // abbreviation, e.g. "PDT"
  offsetLabel: string; // e.g. "UTC-7"
  offsetMin: number; // minutes east of UTC
  isRequired: boolean;
  /** One status per UTC hour column, in HOURS order. */
  availability: SlotStatus[];
}

const MEMBERS: Member[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    role: 'Product design lead',
    city: 'San Francisco',
    tz: 'PDT',
    offsetLabel: 'UTC-7',
    offsetMin: -420,
    isRequired: true,
    // Local 06:00–15:00 for the UTC window.
    availability: [
      'busy',
      'tentative',
      'free',
      'free',
      'busy',
      'free',
      'free',
      'tentative',
      'free',
    ],
  },
  {
    id: 'jonas',
    name: 'Jonas Weber',
    role: 'Platform engineer',
    city: 'Berlin',
    tz: 'CEST',
    offsetLabel: 'UTC+2',
    offsetMin: 120,
    isRequired: true,
    // Local 15:00–24:00.
    availability: [
      'free',
      'free',
      'busy',
      'free',
      'tentative',
      'free',
      'tentative',
      'busy',
      'busy',
    ],
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Engineering manager',
    city: 'Bengaluru',
    tz: 'IST',
    offsetLabel: 'UTC+5:30',
    offsetMin: 330,
    isRequired: true,
    // Local 18:30–03:30 — the half-hour offset shows in the summary.
    availability: [
      'free',
      'tentative',
      'free',
      'busy',
      'busy',
      'busy',
      'busy',
      'busy',
      'busy',
    ],
  },
  {
    id: 'liam',
    name: "Liam O'Connor",
    role: 'Frontend engineer',
    city: 'London',
    tz: 'BST',
    offsetLabel: 'UTC+1',
    offsetMin: 60,
    isRequired: false,
    // Local 14:00–23:00.
    availability: [
      'free',
      'free',
      'free',
      'busy',
      'free',
      'tentative',
      'free',
      'busy',
      'busy',
    ],
  },
  {
    id: 'sofia',
    name: 'Sofia Ramos',
    role: 'QA engineer',
    city: 'São Paulo',
    tz: 'BRT',
    offsetLabel: 'UTC-3',
    offsetMin: -180,
    isRequired: false,
    // Local 10:00–19:00.
    availability: [
      'busy',
      'free',
      'free',
      'free',
      'tentative',
      'free',
      'free',
      'free',
      'tentative',
    ],
  },
  {
    id: 'ken',
    name: 'Ken Tanaka',
    role: 'Mobile engineer',
    city: 'Tokyo',
    tz: 'JST',
    offsetLabel: 'UTC+9',
    offsetMin: 540,
    isRequired: false,
    // Local 22:00–07:00 (+1d) — deep off-hours for the whole window.
    availability: [
      'tentative',
      'tentative',
      'busy',
      'busy',
      'busy',
      'busy',
      'busy',
      'busy',
      'busy',
    ],
  },
  {
    id: 'ada',
    name: 'Ada Osei',
    role: 'Data scientist',
    city: 'Accra',
    tz: 'GMT',
    offsetLabel: 'UTC+0',
    offsetMin: 0,
    isRequired: false,
    // Local time equals UTC.
    availability: [
      'free',
      'free',
      'tentative',
      'free',
      'free',
      'free',
      'busy',
      'tentative',
      'busy',
    ],
  },
];

const MEMBER_COUNT = MEMBERS.length;
const REQUIRED_COUNT = MEMBERS.filter(member => member.isRequired).length;

const STATUS_LABEL: Record<SlotStatus, string> = {
  free: 'Free',
  busy: 'Busy',
  tentative: 'Tentative',
};

const STATUS_GLYPH: Record<SlotStatus, string> = {
  free: '✓',
  busy: '×',
  tentative: '~',
};

const STATUS_BG: Record<SlotStatus, string> = {
  free: colors.freeBg,
  busy: colors.busyBg,
  tentative: colors.tentativeBg,
};

const STATUS_FG: Record<SlotStatus, string> = {
  free: colors.freeFg,
  busy: colors.busyFg,
  tentative: colors.tentativeFg,
};

const STATUS_TOKEN: Record<SlotStatus, 'green' | 'red' | 'yellow'> = {
  free: 'green',
  busy: 'red',
  tentative: 'yellow',
};

// worst-of ordering used when a 90-minute slot spans two hour columns.
const STATUS_SEVERITY: Record<SlotStatus, number> = {
  free: 0,
  tentative: 1,
  busy: 2,
};

// ============= TIME HELPERS =============

/** Minutes-of-day (may exceed a day or go negative) -> "HH:MM". */
function fmtClock(mins: number): string {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
}

/** "+1d" / "-1d" when a local time lands on a neighboring calendar day. */
function dayShiftLabel(mins: number): string | null {
  const shift = Math.floor(mins / 1440);
  if (shift === 0) {
    return null;
  }
  return shift > 0 ? \`+\${shift}d\` : \`\${shift}d\`;
}

function hourStartMin(hourIndex: number): number {
  return (START_HOUR_UTC + hourIndex) * 60;
}

function utcRangeLabel(hourIndex: number, durationMin: DurationMin): string {
  const start = hourStartMin(hourIndex);
  return \`\${fmtClock(start)}–\${fmtClock(start + durationMin)} UTC\`;
}

function localStartMin(member: Member, hourIndex: number): number {
  return hourStartMin(hourIndex) + member.offsetMin;
}

/** True when the hour starts outside the member's local 08:00–18:00. */
function isOffHours(member: Member, hourIndex: number): boolean {
  const local = ((localStartMin(member, hourIndex) % 1440) + 1440) % 1440;
  return local < WORK_START_MIN || local >= WORK_END_MIN;
}

function localRangeLabel(
  member: Member,
  hourIndex: number,
  durationMin: DurationMin,
): string {
  const start = localStartMin(member, hourIndex);
  return \`\${fmtClock(start)}–\${fmtClock(start + durationMin)}\`;
}

// ============= SLOT RANKING =============

function spanFor(durationMin: DurationMin): number {
  return durationMin > 60 ? 2 : 1;
}

/** Worst status across every hour column the slot covers. */
function slotStatusFor(
  member: Member,
  startIndex: number,
  span: number,
): SlotStatus {
  let worst: SlotStatus = 'free';
  for (let i = startIndex; i < startIndex + span; i++) {
    const status = member.availability[i];
    if (STATUS_SEVERITY[status] > STATUS_SEVERITY[worst]) {
      worst = status;
    }
  }
  return worst;
}

interface SlotOption {
  start: number;
  free: Member[];
  tentative: Member[];
  busy: Member[];
  requiredBusy: number;
}

/** One option per valid start column, indexed by start. */
function buildOptions(span: number): SlotOption[] {
  const options: SlotOption[] = [];
  for (let start = 0; start <= HOUR_COUNT - span; start++) {
    const free: Member[] = [];
    const tentative: Member[] = [];
    const busy: Member[] = [];
    for (const member of MEMBERS) {
      const status = slotStatusFor(member, start, span);
      if (status === 'free') {
        free.push(member);
      } else if (status === 'tentative') {
        tentative.push(member);
      } else {
        busy.push(member);
      }
    }
    options.push({
      start,
      free,
      tentative,
      busy,
      requiredBusy: busy.filter(member => member.isRequired).length,
    });
  }
  return options;
}

/** Most free first; tentative beats busy; required conflicts sink; earlier wins ties. */
function rankOptions(options: SlotOption[]): SlotOption[] {
  return [...options].sort(
    (a, b) =>
      b.free.length - a.free.length ||
      b.tentative.length - a.tentative.length ||
      a.requiredBusy - b.requiredBusy ||
      a.start - b.start,
  );
}

// The page opens on the best-ranked 60-minute slot.
const INITIAL_START = rankOptions(buildOptions(1))[0].start;

// Per-hour free counts shown under each hour header (span-1 view).
const HOUR_FREE_COUNTS = HOURS.map(
  (_, index) =>
    MEMBERS.filter(member => member.availability[index] === 'free').length,
);

const LEGEND: Array<{status: SlotStatus; text: string}> = [
  {status: 'free', text: 'Free'},
  {status: 'tentative', text: 'Tentative'},
  {status: 'busy', text: 'Busy'},
];

// ============= MATRIX PIECES =============

function MemberInfoCell({
  member,
  isCompact,
  width,
  columnShadow,
}: {
  member: Member;
  isCompact: boolean;
  width: number;
  columnShadow: string | undefined;
}) {
  return (
    <div
      style={{
        ...styles.memberCell,
        width,
        minWidth: width,
        boxShadow: columnShadow,
      }}>
      <HStack gap={2} vAlign="center" style={{minWidth: 0, width: '100%'}}>
        <Avatar name={member.name} size={isCompact ? 24 : 32} />
        <div style={{...styles.memberText, flex: 1}}>
          <VStack gap={0}>
            <HStack gap={1} vAlign="center">
              <Text type="body" size="sm" style={styles.truncate}>
                {member.name}
              </Text>
              {member.isRequired && !isCompact && (
                <Badge variant="info" label="Req" />
              )}
            </HStack>
            {!isCompact && (
              <Text
                type="supporting"
                color="secondary"
                style={styles.truncate}>
                {member.role}
              </Text>
            )}
            <Text type="code" size="sm" color="secondary" style={styles.truncate}>
              {member.tz} · {member.offsetLabel}
            </Text>
          </VStack>
        </div>
      </HStack>
    </div>
  );
}

function AvailabilityCell({
  member,
  hourIndex,
  cellWidth,
  dimOffHours,
  onSelect,
}: {
  member: Member;
  hourIndex: number;
  cellWidth: number;
  dimOffHours: boolean;
  onSelect: (hourIndex: number) => void;
}) {
  const status = member.availability[hourIndex];
  const offHours = isOffHours(member, hourIndex);
  const label =
    \`Select \${fmtClock(hourStartMin(hourIndex))} UTC — \${member.name}: \` +
    \`\${STATUS_LABEL[status]}\${offHours ? ' (off-hours locally)' : ''}\`;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onSelect(hourIndex)}
      style={{...styles.cellButton, width: cellWidth, minWidth: cellWidth}}>
      <span
        aria-hidden
        style={{
          ...styles.cellSwatch,
          backgroundColor: STATUS_BG[status],
          color: STATUS_FG[status],
          ...(offHours && dimOffHours
            ? {backgroundImage: OFF_HOURS_HATCH, opacity: 0.62}
            : null),
        }}>
        {STATUS_GLYPH[status]}
      </span>
    </button>
  );
}

// ============= PANEL PIECES =============

function SuggestedSlotCard({
  option,
  rank,
  durationMin,
  isSelected,
  onSelect,
}: {
  option: SlotOption;
  rank: number;
  durationMin: DurationMin;
  isSelected: boolean;
  onSelect: (start: number) => void;
}) {
  const range = utcRangeLabel(option.start, durationMin);
  const conflicts = [...option.busy, ...option.tentative];
  return (
    <SelectableCard
      label={\`Select \${range} — \${option.free.length} of \${MEMBER_COUNT} free\`}
      isSelected={isSelected}
      onChange={() => onSelect(option.start)}
      padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Badge
            variant={rank === 1 ? 'success' : 'neutral'}
            label={rank === 1 ? '#1 Best' : \`#\${rank}\`}
          />
          <StackItem size="fill">
            <Text type="code" size="sm" hasTabularNumbers>
              {range}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {option.free.length} of {MEMBER_COUNT}
          </Text>
        </HStack>
        <ProgressBar
          label={\`Attendance for \${range}\`}
          isLabelHidden
          value={option.free.length}
          max={MEMBER_COUNT}
          variant={
            option.free.length >= MEMBER_COUNT - 1
              ? 'success'
              : option.free.length >= MEMBER_COUNT - 3
                ? 'accent'
                : 'warning'
          }
        />
        {conflicts.length > 0 ? (
          <HStack gap={1} wrap="wrap" style={styles.conflictRow}>
            {option.busy.map(member => (
              <Token
                key={member.id}
                size="sm"
                color="red"
                label={member.name.split(' ')[0]}
                description={\`\${member.name} is busy\`}
              />
            ))}
            {option.tentative.map(member => (
              <Token
                key={member.id}
                size="sm"
                color="yellow"
                label={member.name.split(' ')[0]}
                description={\`\${member.name} is tentative\`}
              />
            ))}
          </HStack>
        ) : (
          <Text type="supporting" color="secondary">
            Everyone is free
          </Text>
        )}
        {option.requiredBusy > 0 && (
          <Text type="supporting" color="secondary">
            {option.requiredBusy} required{' '}
            {option.requiredBusy === 1 ? 'attendee has' : 'attendees have'} a
            conflict
          </Text>
        )}
      </VStack>
    </SelectableCard>
  );
}

function SummaryMemberRow({
  member,
  startIndex,
  span,
  durationMin,
}: {
  member: Member;
  startIndex: number;
  span: number;
  durationMin: DurationMin;
}) {
  const status = slotStatusFor(member, startIndex, span);
  const shift = dayShiftLabel(localStartMin(member, startIndex));
  const offHours = isOffHours(member, startIndex);
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={member.name} size={24} />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="body" size="sm" style={styles.truncate}>
            {member.name}
          </Text>
          <Text type="supporting" color="secondary" style={styles.truncate}>
            {member.city} · {member.tz}
          </Text>
        </VStack>
      </StackItem>
      <div style={styles.summaryLocal}>
        <VStack gap={0} hAlign="end">
          <HStack gap={1} vAlign="center">
            <Text type="code" size="sm" hasTabularNumbers>
              {localRangeLabel(member, startIndex, durationMin)}
            </Text>
            {shift != null && <Token size="sm" color="purple" label={shift} />}
          </HStack>
          <HStack gap={1} vAlign="center">
            {offHours && (
              <Text type="supporting" color="secondary">
                off-hours
              </Text>
            )}
            <Token
              size="sm"
              color={STATUS_TOKEN[status]}
              label={STATUS_LABEL[status]}
            />
          </HStack>
        </VStack>
      </div>
    </HStack>
  );
}

// ============= PAGE =============

export default function TeamSchedulerTemplate() {
  const [duration, setDuration] = useState<string>('60');
  const [selectedStart, setSelectedStart] = useState(INITIAL_START);
  const [dimOffHours, setDimOffHours] = useState(true);
  const [isInviteSent, setIsInviteSent] = useState(false);
  // The sticky member column only casts a shadow once content has slid
  // underneath it.
  const [scrolledX, setScrolledX] = useState(false);

  const isPanelStacked = useMediaQuery('(max-width: 768px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const durationMin = Number(duration) as DurationMin;
  const span = spanFor(durationMin);
  const maxStart = HOUR_COUNT - span;

  const memberColWidth = isCompact ? 124 : 208;
  const cellWidth = isCompact ? 48 : 56;

  const options = useMemo(() => buildOptions(span), [span]);
  const ranked = useMemo(() => rankOptions(options), [options]);
  const topThree = ranked.slice(0, 3);

  const selected = options[Math.min(selectedStart, maxStart)];
  const selectedRank = ranked.indexOf(selected) + 1;
  const selectedRange = utcRangeLabel(selected.start, durationMin);

  const selectSlot = (start: number) => {
    setSelectedStart(Math.min(Math.max(start, 0), maxStart));
    setIsInviteSent(false);
  };

  const nudgeSlot = (delta: number) => {
    selectSlot(selected.start + delta);
  };

  const changeDuration = (value: string) => {
    setDuration(value);
    const nextSpan = spanFor(Number(value) as DurationMin);
    setSelectedStart(prev => Math.min(prev, HOUR_COUNT - nextSpan));
    setIsInviteSent(false);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrolledX(event.currentTarget.scrollLeft > 0);
  };

  const columnShadow = scrolledX ? COLUMN_SHADOW : undefined;

  // ---- matrix ----

  const cornerCell = (
    <div
      style={{
        ...styles.memberCell,
        ...styles.cornerCell,
        width: memberColWidth,
        minWidth: memberColWidth,
        boxShadow: columnShadow,
      }}>
      <VStack gap={0}>
        <Text type="label" size="sm">
          {isCompact ? 'Member' : \`\${MEMBER_COUNT} members\`}
        </Text>
        <Text type="supporting" color="secondary">
          hours in UTC
        </Text>
      </VStack>
    </div>
  );

  const hourHeaderCells = HOURS.map((hour, index) => {
    const isInSlot = index >= selected.start && index < selected.start + span;
    return (
      <button
        key={hour}
        type="button"
        aria-pressed={isInSlot}
        aria-label={\`Select \${fmtClock(hour * 60)} UTC — \${
          HOUR_FREE_COUNTS[index]
        } of \${MEMBER_COUNT} free\`}
        onClick={() => selectSlot(index)}
        style={{
          ...styles.hourHeaderButton,
          width: cellWidth,
          minWidth: cellWidth,
        }}>
        <Text
          type="code"
          size="sm"
          hasTabularNumbers
          weight={isInSlot ? 'semibold' : undefined}>
          {fmtClock(hour * 60)}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {HOUR_FREE_COUNTS[index]} free
        </Text>
      </button>
    );
  });

  const matrix = (
    <div
      style={styles.scroller}
      onScroll={handleScroll}
      tabIndex={0}
      role="region"
      aria-label="Availability matrix">
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: \`\${memberColWidth}px repeat(\${HOUR_COUNT}, \${cellWidth}px)\`,
        }}>
        {/* Slot highlight overlay: slides to the clicked column and widens
            with the duration; sits under the sticky member column so it
            tucks away as the matrix scrolls. */}
        <div
          aria-hidden
          style={{
            ...styles.slotOverlay,
            left: memberColWidth + selected.start * cellWidth,
            width: span * cellWidth,
          }}
        />
        {cornerCell}
        {hourHeaderCells}
        {MEMBERS.map(member => (
          <Fragment key={member.id}>
            <MemberInfoCell
              member={member}
              isCompact={isCompact}
              width={memberColWidth}
              columnShadow={columnShadow}
            />
            {HOURS.map((_, index) => (
              <AvailabilityCell
                key={\`\${member.id}-\${index}\`}
                member={member}
                hourIndex={index}
                cellWidth={cellWidth}
                dimOffHours={dimOffHours}
                onSelect={selectSlot}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );

  // ---- legend band ----

  const legendBand = (
    <HStack gap={4} vAlign="center" wrap="wrap" style={styles.legendRow}>
      {LEGEND.map(entry => (
        <HStack gap={1} vAlign="center" key={entry.status}>
          <span
            aria-hidden
            style={{
              ...styles.legendSwatch,
              backgroundColor: STATUS_BG[entry.status],
              color: STATUS_FG[entry.status],
            }}>
            {STATUS_GLYPH[entry.status]}
          </span>
          <Text type="supporting" color="secondary">
            {entry.text}
          </Text>
        </HStack>
      ))}
      <HStack gap={1} vAlign="center">
        <span
          aria-hidden
          style={{
            ...styles.legendSwatch,
            backgroundColor: colors.surfaceMuted,
            backgroundImage: OFF_HOURS_HATCH,
          }}
        />
        <Text type="supporting" color="secondary">
          Outside 08:00–18:00 local
        </Text>
      </HStack>
      <StackItem size="fill" />
      <Switch
        label="Dim off-hours"
        labelPosition="start"
        value={dimOffHours}
        onChange={setDimOffHours}
      />
    </HStack>
  );

  // ---- panel: suggestions + selected-slot summary ----

  const panelBody = (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Suggested slots</Heading>
          </StackItem>
          <Text type="supporting" color="secondary">
            ranked by attendance
          </Text>
        </HStack>
        {topThree.map((option, index) => (
          <SuggestedSlotCard
            key={option.start}
            option={option}
            rank={index + 1}
            durationMin={durationMin}
            isSelected={option.start === selected.start}
            onSelect={selectSlot}
          />
        ))}
      </VStack>

      <Divider />

      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Selected slot</Heading>
          </StackItem>
          <IconButton
            label="Previous hour"
            variant="secondary"
            icon={<Icon icon={ChevronLeftIcon} size="sm" />}
            isDisabled={selected.start === 0}
            onClick={() => nudgeSlot(-1)}
          />
          <IconButton
            label="Next hour"
            variant="secondary"
            icon={<Icon icon={ChevronRightIcon} size="sm" />}
            isDisabled={selected.start === maxStart}
            onClick={() => nudgeSlot(1)}
          />
        </HStack>

        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
          <Text type="code" size="sm" hasTabularNumbers>
            {MEETING_DAY} · {selectedRange}
          </Text>
          <Token
            size="sm"
            color={selectedRank === 1 ? 'green' : 'default'}
            label={selectedRank === 1 ? 'best slot' : \`rank #\${selectedRank}\`}
          />
        </HStack>

        <Text type="supporting" color="secondary" hasTabularNumbers>
          {selected.free.length} free · {selected.tentative.length} tentative ·{' '}
          {selected.busy.length} busy
          {selected.requiredBusy > 0
            ? \` · \${selected.requiredBusy} required conflict\${
                selected.requiredBusy === 1 ? '' : 's'
              }\`
            : ''}
        </Text>

        <VStack gap={2}>
          {MEMBERS.map(member => (
            <SummaryMemberRow
              key={member.id}
              member={member}
              startIndex={selected.start}
              span={span}
              durationMin={durationMin}
            />
          ))}
        </VStack>

        {isInviteSent ? (
          <Banner
            status="success"
            title="Invite sent"
            description={\`\${MEMBER_COUNT} invitations queued for \${MEETING_DAY}, \${selectedRange}.\`}
          />
        ) : (
          <Button
            label={\`Send invite · \${MEMBER_COUNT} members\`}
            variant="primary"
            icon={<Icon icon={SendIcon} size="sm" />}
            onClick={() => setIsInviteSent(true)}
          />
        )}
        {isInviteSent && (
          <HStack gap={1} vAlign="center">
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              Move the slot or change the duration to draft a new invite.
            </Text>
          </HStack>
        )}
      </VStack>
    </VStack>
  );

  // ---- header ----

  const durationControl = (
    <SegmentedControl
      label="Meeting duration"
      value={duration}
      onChange={changeDuration}
      size="sm">
      <SegmentedControlItem label="30 min" value="30" />
      <SegmentedControlItem label="60 min" value="60" />
      <SegmentedControlItem label="90 min" value="90" />
    </SegmentedControl>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Team Scheduler</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {isCompact
                    ? \`\${MEMBER_COUNT} members\`
                    : \`\${MEETING_TITLE} · \${MEETING_DAY} · \${MEMBER_COUNT} members (\${REQUIRED_COUNT} required) · window 13:00–22:00 UTC\`}
                </Text>
              </VStack>
            </StackItem>
            {durationControl}
          </HStack>
        </LayoutHeader>
      }
      end={
        isPanelStacked ? undefined : (
          <LayoutPanel width={340} padding={0} label="Slot suggestions">
            <div style={styles.panelScroll}>{panelBody}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={3}>
              {legendBand}
              {matrix}
              <Text type="supporting" color="secondary">
                Click any hour column to move the slot — the highlight slides
                to the new time and the summary recomputes local times.
              </Text>
              {isPanelStacked && (
                <>
                  <Divider />
                  <div style={styles.panelStacked}>{panelBody}</div>
                </>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};