// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (six habits with run-length-encoded
 *   90-day completion histories spanning March 27 through a fixed "today" of
 *   Wednesday, June 24, 2026 — including intentionally broken streaks, one
 *   "streak freeze" day on Meditate that bridges a 30-day and a 20-day run
 *   into a 50-day longest streak, two habits still pending today, and one
 *   habit that starts already archived so the collapsed section reads on
 *   first paint)
 * @output HABIT STREAK TRACKER surface: a header (flame Heading, fixture
 *   date, live "N of M done today" count), a horizontally scrolling row of
 *   habit cards — colored glyph, select button, a 40px circular today
 *   check-off, flame + streak count that lights when today is done, a
 *   14-day dot strip, and move-left / move-right / archive controls — a
 *   collapsed "Archived" section whose cards restore back into the row, a
 *   center per-habit heatmap that zooms between a paged month grid of CSS
 *   cells and a year density view of week columns (every tracked cell is a
 *   button that retro-fills or clears that day), and a docked 300px stats
 *   rail (today progress bar, current streak, longest streak, completion
 *   rate, best weekday, weekday breakdown bars, freezes used). Toggling
 *   today or any past cell recomputes streaks, flame state, dot strips,
 *   heatmap cells, and every rail stat in one pass
 * @position Page template; emitted by `astryx template habit-streak-tracker`
 *
 * Frame: Layout height="fill". LayoutHeader carries the tracker chrome
 * (title, fixture date, done-today count). LayoutContent scrolls one column:
 * habit card row, archived section, then the heatmap section (density
 * toggle, month pager, grid, legend). LayoutPanel end 300 hosts the derived
 * stats rail. Choose this over a dashboard or calendar when the surface is
 * per-habit daily completion — check-offs, streak math, and heatmap cells —
 * rather than events or metric widgets.
 *
 * Responsive contract:
 * - >640px: header | habit card row (fixed 224px cards, horizontal scroll
 *   when crowded) | archived section | heatmap | stats rail docked at 300
 *   (scrolls vertically). Month cells sit in a 7-column grid capped at
 *   560px so cells stay square-ish; the year view is a 14-week column grid
 *   (~260px) that never forces page overflow.
 * - <=640px (usable at 375px): the rail leaves the right edge and stacks
 *   below the heatmap as a full-width section; the habit row keeps
 *   horizontal scrolling (deliberate overflow-x, cards stay 224px so tap
 *   targets never shrink); month cells drop to 40px rows; the year grid
 *   (~260px wide) still fits a 375px viewport outright. Check-off circles
 *   are 40px at every width and card/pager/zoom controls upsize to md
 *   (~40px tap targets).
 * - Header and section headers use wrap="wrap" so the zoom control and
 *   month pager drop below their titles instead of clipping; the month
 *   label keeps a fixed width so paging never shifts the pager buttons.
 * - No hover-only interactions: every heatmap cell is a real button with a
 *   full date + status aria-label, the today check-off is a native button
 *   with aria-pressed, reorder is accessible move-left/move-right
 *   IconButtons (no drag machinery), and every mutation is announced via a
 *   visually-hidden aria-live region.
 *
 * Container policy (tracker archetype): page chrome is frame-first rows and
 * panels; habit cards are Cards inside a bespoke scroll row; the heatmap is
 * a bespoke CSS grid of button cells because no core component models a
 * completion matrix; the rail uses Stat for the headline numbers and plain
 * CSS bars for the weekday breakdown. All derived numbers (streaks, rates,
 * best weekday, today count) recompute from a single history state map.
 * Fixtures are fixed calendar dates — Date is used only to derive weekday
 * alignment and month lengths for those fixed dates, never to read a clock.
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Stat} from '@astryxdesign/core/Stat';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ActivityIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BanIcon,
  BookOpenIcon,
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
  FootprintsIcon,
  PenLineIcon,
  SnowflakeIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Habit cards ride a deliberate horizontal scroller at every width so
  // cards (and their 40px tap targets) never shrink to fit.
  cardsRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  // Selection ring wraps the Card so the accent outline hugs the radius.
  cardShell: {
    borderRadius: 12,
    flexShrink: 0,
    width: 224,
  },
  cardShellSelected: {boxShadow: '0 0 0 2px var(--color-accent)'},
  cardShellArchived: {opacity: 0.75},
  // The name/glyph region is a real button: tap to focus this habit's
  // heatmap and rail stats.
  selectButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    margin: 0,
    border: 'none',
    padding: 0,
    font: 'inherit',
    textAlign: 'left',
    color: 'inherit',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  habitGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  habitName: {minWidth: 0},
  // 40px circular today check-off: hollow ring while pending, filled with
  // a white check once done. Native button for full control + aria-pressed.
  checkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: 2,
    padding: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    color: 'transparent',
  },
  flameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  // Flame color rides currentColor: lit orange when today is done, muted
  // secondary while the streak is pending or broken.
  flameLit: {color: 'var(--color-data-categorical-orange, #EB6E00)'},
  flameDim: {color: 'var(--color-text-secondary)', opacity: 0.55},
  dotStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Month heatmap: 7 columns capped at 560px so cells stay square-ish.
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 4,
    maxWidth: 560,
  },
  monthWeekdayCell: {
    minWidth: 0,
    textAlign: 'center',
    overflow: 'hidden',
  },
  monthCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    margin: 0,
    border: 'none',
    borderRadius: 6,
    padding: 0,
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  monthCellDone: {color: '#FFFFFF'},
  // Days before tracking started: numbered but faint and inert.
  monthCellPre: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    opacity: 0.35,
    cursor: 'default',
  },
  // Days after the fixture "today": dashed outline, inert.
  monthCellFuture: {
    backgroundColor: 'transparent',
    border: '1px dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
    opacity: 0.6,
    cursor: 'default',
  },
  monthCellToday: {boxShadow: 'inset 0 0 0 2px var(--color-accent)'},
  // Fixed-width month label so paging never shifts the pager buttons.
  monthLabel: {textAlign: 'center', flexShrink: 0, width: 120},
  // Year density view: week columns (grid-auto-flow: column), 7 weekday
  // rows. ~14 columns * 18px ≈ 260px, so it fits a 375px viewport outright.
  yearGrid: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(7, 16px)',
    gridAutoColumns: 16,
    gap: 3,
  },
  yearWeekdayColumn: {
    display: 'grid',
    gridTemplateRows: 'repeat(7, 16px)',
    gap: 3,
    marginRight: 4,
  },
  yearWeekdayLabel: {
    fontSize: 10,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
  },
  yearCell: {
    width: 16,
    height: 16,
    margin: 0,
    border: 'none',
    borderRadius: 4,
    padding: 0,
    backgroundColor: 'var(--color-background-muted)',
    cursor: 'pointer',
  },
  yearCellBlank: {backgroundColor: 'transparent', cursor: 'default'},
  yearCellToday: {boxShadow: 'inset 0 0 0 2px var(--color-accent)'},
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
  },
  // Rail: today progress + weekday breakdown bars.
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    minWidth: 0,
  },
  barFill: {height: '100%', borderRadius: 3},
  weekdayLabelCol: {width: 36, flexShrink: 0},
  weekdayRateCol: {width: 40, flexShrink: 0, textAlign: 'right'},
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
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

type DayStatus = 'done' | 'missed' | 'freeze';
type HabitIcon = typeof FlameIcon;

// Fixture window: 90 tracked days, day 0 = Friday, March 27, 2026 and
// day 89 = the fixed "today", Wednesday, June 24, 2026. Date is used only
// to derive weekday alignment for these fixed dates — never Date.now().
const DAY_COUNT = 90;
const TODAY_INDEX = DAY_COUNT - 1;
const MS_PER_DAY = 86_400_000;
const BASE_UTC = Date.UTC(2026, 2, 27);

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAYS = [
  {full: 'Sunday', short: 'Sun', min: 'S'},
  {full: 'Monday', short: 'Mon', min: 'M'},
  {full: 'Tuesday', short: 'Tue', min: 'T'},
  {full: 'Wednesday', short: 'Wed', min: 'W'},
  {full: 'Thursday', short: 'Thu', min: 'T'},
  {full: 'Friday', short: 'Fri', min: 'F'},
  {full: 'Saturday', short: 'Sat', min: 'S'},
] as const;

/** UTC date object for a history index (fixed fixture dates only). */
function dateOf(index: number): Date {
  return new Date(BASE_UTC + index * MS_PER_DAY);
}

/** Day of week (0 = Sunday) for a history index. */
function weekdayOf(index: number): number {
  return dateOf(index).getUTCDay();
}

/** "Tuesday, June 9" for announcements and cell aria-labels. */
function dayLabelOf(index: number): string {
  const date = dateOf(index);
  return `${WEEKDAYS[date.getUTCDay()].full}, ${
    MONTH_NAMES[date.getUTCMonth()]
  } ${date.getUTCDate()}`;
}

/** History index for a fixed calendar date, or null outside the window. */
function historyIndexFor(
  year: number,
  month: number,
  day: number,
): number | null {
  const index = (Date.UTC(year, month, day) - BASE_UTC) / MS_PER_DAY;
  return index >= 0 && index < DAY_COUNT ? index : null;
}

/** Number of days in a (0-based) month. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

interface Habit {
  id: string;
  name: string;
  cadence: string;
  icon: HabitIcon;
  /** Solid glyph / done-cell / dot color — categorical token + fallback. */
  color: string;
}

const FREEZE_COLOR = 'var(--color-data-categorical-cyan, #0EA5E9)';

// Six habits. `stretch` starts archived so the collapsed section reads on
// first paint without any user action.
const HABITS: readonly Habit[] = [
  {
    id: 'meditate',
    name: 'Meditate',
    cadence: '10 min, every morning',
    icon: BrainIcon,
    color: 'var(--color-data-categorical-purple, #6B1EFD)',
  },
  {
    id: 'read',
    name: 'Read 20 min',
    cadence: 'Any book, any time',
    icon: BookOpenIcon,
    color: 'var(--color-data-categorical-blue, #0171E3)',
  },
  {
    id: 'no-sugar',
    name: 'No sugar',
    cadence: 'No added sugar all day',
    icon: BanIcon,
    color: 'var(--color-data-categorical-orange, #EB6E00)',
  },
  {
    id: 'steps',
    name: '10k steps',
    cadence: 'Walk, run, or hike',
    icon: FootprintsIcon,
    color: 'var(--color-data-categorical-green, #0B991F)',
  },
  {
    id: 'journal',
    name: 'Journal',
    cadence: 'Three lines before bed',
    icon: PenLineIcon,
    color: 'var(--color-data-categorical-teal, #0E7E8B)',
  },
  {
    id: 'stretch',
    name: 'Stretch 10 min',
    cadence: 'Paused for now',
    icon: ActivityIcon,
    color: 'var(--color-data-categorical-red, #D0164C)',
  },
];

const HABIT_BY_ID: ReadonlyMap<string, Habit> = new Map(
  HABITS.map(habit => [habit.id, habit]),
);

/** Expands run-length [count, status] pairs into a 90-entry history. */
function expandPattern(
  pattern: ReadonlyArray<readonly [number, DayStatus]>,
): DayStatus[] {
  const days: DayStatus[] = [];
  for (const [count, status] of pattern) {
    for (let i = 0; i < count; i += 1) {
      days.push(status);
    }
  }
  if (days.length !== DAY_COUNT) {
    throw new Error(`Habit history must cover ${DAY_COUNT} days`);
  }
  return days;
}

// Seeded 90-day histories as run-length patterns (day 0 → day 89). Each
// habit tells a different streak story:
// - meditate: 13-day live streak; the single streak-FREEZE day at index 55
//   bridges a 30-day and a 20-day run into a 50-day longest streak.
// - read: steady reader, 8-day live streak, 26-day best.
// - no-sugar: fell off five days ago — flame out, streak 0, 20-day best.
// - steps: rebuilt to a 3-day streak after a miss; 27-day best.
// - journal: today still pending, so the 21-day run ending yesterday keeps
//   the streak alive (flame dimmed until today is checked off).
// - stretch: abandoned and archived; long gaps, streak 0.
const INITIAL_HISTORY: Record<string, DayStatus[]> = {
  meditate: expandPattern([
    [5, 'done'],
    [1, 'missed'],
    [18, 'done'],
    [1, 'missed'],
    [30, 'done'],
    [1, 'freeze'],
    [20, 'done'],
    [1, 'missed'],
    [13, 'done'],
  ]),
  read: expandPattern([
    [3, 'missed'],
    [7, 'done'],
    [2, 'missed'],
    [12, 'done'],
    [1, 'missed'],
    [9, 'done'],
    [3, 'missed'],
    [26, 'done'],
    [2, 'missed'],
    [16, 'done'],
    [1, 'missed'],
    [8, 'done'],
  ]),
  'no-sugar': expandPattern([
    [6, 'done'],
    [2, 'missed'],
    [10, 'done'],
    [4, 'missed'],
    [8, 'done'],
    [1, 'missed'],
    [15, 'done'],
    [3, 'missed'],
    [20, 'done'],
    [2, 'missed'],
    [14, 'done'],
    [5, 'missed'],
  ]),
  steps: expandPattern([
    [10, 'done'],
    [1, 'missed'],
    [20, 'done'],
    [2, 'missed'],
    [25, 'done'],
    [1, 'missed'],
    [27, 'done'],
    [1, 'missed'],
    [3, 'done'],
  ]),
  journal: expandPattern([
    [4, 'done'],
    [3, 'missed'],
    [16, 'done'],
    [2, 'missed'],
    [22, 'done'],
    [1, 'missed'],
    [18, 'done'],
    [2, 'missed'],
    [21, 'done'],
    [1, 'missed'],
  ]),
  stretch: expandPattern([
    [12, 'done'],
    [6, 'missed'],
    [9, 'done'],
    [10, 'missed'],
    [7, 'done'],
    [15, 'missed'],
    [5, 'done'],
    [26, 'missed'],
  ]),
};

const INITIAL_ACTIVE_ORDER = [
  'meditate',
  'read',
  'no-sugar',
  'steps',
  'journal',
];

const INITIAL_ARCHIVED = ['stretch'];

// Heatmap month pages: the four calendar months the 90-day window touches.
const HEATMAP_MONTHS = [
  {label: 'March 2026', year: 2026, month: 2},
  {label: 'April 2026', year: 2026, month: 3},
  {label: 'May 2026', year: 2026, month: 4},
  {label: 'June 2026', year: 2026, month: 5},
] as const;

const DEFAULT_MONTH_INDEX = HEATMAP_MONTHS.length - 1; // June (today)

// Dot strip shows the trailing 14 days, oldest → today.
const DOT_STRIP_START = DAY_COUNT - 14;

// ============= STREAK MATH =============

interface WeekdayRate {
  label: string;
  done: number;
  total: number;
  /** 0–100, rounded. */
  rate: number;
}

interface HabitStats {
  isTodayDone: boolean;
  /**
   * Live streak in completed days. A pending (not yet done) today does not
   * break the run — the streak counts back from yesterday until a miss.
   * Freeze days bridge runs without adding to the count.
   */
  currentStreak: number;
  longestStreak: number;
  doneCount: number;
  freezeCount: number;
  /** doneCount / 90, as a rounded percent. */
  completionRate: number;
  bestWeekday: WeekdayRate | null;
  weekdayRates: WeekdayRate[];
}

/** All derived numbers for one habit, recomputed on every history edit. */
function computeStats(days: readonly DayStatus[]): HabitStats {
  const isTodayDone = days[TODAY_INDEX] === 'done';

  // Current streak: skip a pending today, then walk back through done days,
  // letting freeze days bridge without incrementing.
  let cursor = TODAY_INDEX;
  if (days[cursor] === 'missed') {
    cursor -= 1;
  }
  let currentStreak = 0;
  for (; cursor >= 0; cursor -= 1) {
    const status = days[cursor];
    if (status === 'done') {
      currentStreak += 1;
    } else if (status === 'freeze') {
      continue;
    } else {
      break;
    }
  }

  // Longest streak: freeze preserves the running count across a gap day.
  let longestStreak = 0;
  let run = 0;
  let doneCount = 0;
  let freezeCount = 0;
  for (const status of days) {
    if (status === 'done') {
      run += 1;
      doneCount += 1;
      longestStreak = Math.max(longestStreak, run);
    } else if (status === 'freeze') {
      freezeCount += 1;
    } else {
      run = 0;
    }
  }

  // Weekday breakdown: completion rate per day-of-week across all 90 days.
  const doneByWeekday = [0, 0, 0, 0, 0, 0, 0];
  const totalByWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < DAY_COUNT; i += 1) {
    const weekday = weekdayOf(i);
    totalByWeekday[weekday] += 1;
    if (days[i] === 'done') {
      doneByWeekday[weekday] += 1;
    }
  }
  const weekdayRates: WeekdayRate[] = WEEKDAYS.map((weekday, index) => ({
    label: weekday.short,
    done: doneByWeekday[index],
    total: totalByWeekday[index],
    rate: Math.round((doneByWeekday[index] / totalByWeekday[index]) * 100),
  }));
  let bestWeekday: WeekdayRate | null = null;
  for (const entry of weekdayRates) {
    if (entry.done > 0 && (bestWeekday === null || entry.rate > bestWeekday.rate)) {
      bestWeekday = entry;
    }
  }

  return {
    isTodayDone,
    currentStreak,
    longestStreak,
    doneCount,
    freezeCount,
    completionRate: Math.round((doneCount / DAY_COUNT) * 100),
    bestWeekday,
    weekdayRates,
  };
}

function statusLabel(status: DayStatus): string {
  if (status === 'done') {
    return 'completed';
  }
  return status === 'freeze' ? 'streak freeze' : 'not completed';
}

// ============= HABIT CARD =============

function DotStrip({
  habit,
  days,
}: {
  habit: Habit;
  days: readonly DayStatus[];
}) {
  const strip = days.slice(DOT_STRIP_START);
  const doneCount = strip.filter(status => status === 'done').length;
  return (
    <div
      style={styles.dotStrip}
      role="img"
      aria-label={`Last 14 days: ${doneCount} of 14 completed`}>
      {strip.map((status, offset) => {
        const index = DOT_STRIP_START + offset;
        const isToday = index === TODAY_INDEX;
        let dotStyle: CSSProperties;
        if (status === 'done') {
          dotStyle = {...styles.dot, backgroundColor: habit.color};
        } else if (status === 'freeze') {
          dotStyle = {...styles.dot, backgroundColor: FREEZE_COLOR};
        } else if (isToday) {
          // Pending today: hollow accent ring, waiting for the check-off.
          dotStyle = {
            ...styles.dot,
            boxShadow: 'inset 0 0 0 2px var(--color-accent)',
          };
        } else {
          dotStyle = {
            ...styles.dot,
            boxShadow: 'inset 0 0 0 1.5px var(--color-border)',
          };
        }
        return <span key={index} style={dotStyle} />;
      })}
    </div>
  );
}

function HabitCard({
  habit,
  days,
  stats,
  isSelected,
  isNarrow,
  canMoveLeft,
  canMoveRight,
  onSelect,
  onToggleToday,
  onMove,
  onArchive,
}: {
  habit: Habit;
  days: readonly DayStatus[];
  stats: HabitStats;
  isSelected: boolean;
  isNarrow: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onSelect: (id: string) => void;
  onToggleToday: (id: string) => void;
  onMove: (id: string, delta: -1 | 1) => void;
  onArchive: (id: string) => void;
}) {
  const checkStyle: CSSProperties = stats.isTodayDone
    ? {
        ...styles.checkButton,
        borderColor: habit.color,
        backgroundColor: habit.color,
        color: '#FFFFFF',
      }
    : {...styles.checkButton, borderColor: habit.color};
  const flameStyle = stats.isTodayDone ? styles.flameLit : styles.flameDim;
  const controlSize = isNarrow ? 'md' : 'sm';

  return (
    <div
      style={{
        ...styles.cardShell,
        ...(isSelected ? styles.cardShellSelected : undefined),
      }}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <button
                type="button"
                style={styles.selectButton}
                aria-pressed={isSelected}
                aria-label={`View stats for ${habit.name}`}
                onClick={() => onSelect(habit.id)}>
                <span
                  style={{...styles.habitGlyph, backgroundColor: habit.color}}
                  aria-hidden="true">
                  <Icon icon={habit.icon} size="sm" />
                </span>
                <span style={styles.habitName}>
                  <VStack gap={0}>
                    <Text type="body" maxLines={1}>
                      {habit.name}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {habit.cadence}
                    </Text>
                  </VStack>
                </span>
              </button>
            </StackItem>
            <button
              type="button"
              style={checkStyle}
              aria-pressed={stats.isTodayDone}
              aria-label={
                stats.isTodayDone
                  ? `${habit.name} completed today — tap to clear`
                  : `Mark ${habit.name} complete for today`
              }
              onClick={() => onToggleToday(habit.id)}>
              <Icon icon={CheckIcon} size="sm" />
            </button>
          </HStack>
          <div style={styles.flameRow}>
            <span style={flameStyle} aria-hidden="true">
              <Icon icon={FlameIcon} size="sm" />
            </span>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {stats.currentStreak} day streak
              {stats.isTodayDone
                ? ''
                : stats.currentStreak > 0
                  ? ' · today pending'
                  : ''}
            </Text>
          </div>
          <DotStrip habit={habit} days={days} />
          <HStack gap={1} vAlign="center">
            <IconButton
              label={`Move ${habit.name} left`}
              icon={<Icon icon={ArrowLeftIcon} size="sm" />}
              variant="ghost"
              size={controlSize}
              isDisabled={!canMoveLeft}
              onClick={() => onMove(habit.id, -1)}
            />
            <IconButton
              label={`Move ${habit.name} right`}
              icon={<Icon icon={ArrowRightIcon} size="sm" />}
              variant="ghost"
              size={controlSize}
              isDisabled={!canMoveRight}
              onClick={() => onMove(habit.id, 1)}
            />
            <StackItem size="fill">
              <span />
            </StackItem>
            <IconButton
              label={`Archive ${habit.name}`}
              icon={<Icon icon={ArchiveIcon} size="sm" />}
              variant="ghost"
              size={controlSize}
              onClick={() => onArchive(habit.id)}
            />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

function ArchivedHabitCard({
  habit,
  stats,
  isSelected,
  isNarrow,
  onSelect,
  onRestore,
}: {
  habit: Habit;
  stats: HabitStats;
  isSelected: boolean;
  isNarrow: boolean;
  onSelect: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <div
      style={{
        ...styles.cardShell,
        ...styles.cardShellArchived,
        ...(isSelected ? styles.cardShellSelected : undefined),
      }}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <button
                type="button"
                style={styles.selectButton}
                aria-pressed={isSelected}
                aria-label={`View stats for archived habit ${habit.name}`}
                onClick={() => onSelect(habit.id)}>
                <span
                  style={{...styles.habitGlyph, backgroundColor: habit.color}}
                  aria-hidden="true">
                  <Icon icon={habit.icon} size="sm" />
                </span>
                <span style={styles.habitName}>
                  <VStack gap={0}>
                    <Text type="body" maxLines={1}>
                      {habit.name}
                    </Text>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      Best streak {stats.longestStreak} days
                    </Text>
                  </VStack>
                </span>
              </button>
            </StackItem>
          </HStack>
          <Button
            label="Restore"
            variant="ghost"
            size={isNarrow ? 'md' : 'sm'}
            icon={<Icon icon={ArchiveRestoreIcon} size="sm" />}
            onClick={() => onRestore(habit.id)}
          />
        </VStack>
      </Card>
    </div>
  );
}

// ============= HEATMAP =============

interface MonthCell {
  key: string;
  day: number | null;
  /** History index, or null for lead blanks / pre-tracking / future days. */
  index: number | null;
  kind: 'blank' | 'pre' | 'future' | 'tracked';
}

/** Padded week-row cell list for one heatmap month. */
function buildMonthCells(monthIndex: number): MonthCell[] {
  const view = HEATMAP_MONTHS[monthIndex];
  const lead = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const days = daysInMonth(view.year, view.month);
  const cells: MonthCell[] = [];
  for (let i = 0; i < lead; i += 1) {
    cells.push({key: `blank-${i}`, day: null, index: null, kind: 'blank'});
  }
  for (let day = 1; day <= days; day += 1) {
    const index = historyIndexFor(view.year, view.month, day);
    if (index === null) {
      const isFuture = Date.UTC(view.year, view.month, day) > BASE_UTC;
      cells.push({
        key: `day-${day}`,
        day,
        index: null,
        kind: isFuture ? 'future' : 'pre',
      });
    } else {
      cells.push({key: `day-${day}`, day, index, kind: 'tracked'});
    }
  }
  return cells;
}

function MonthHeatmap({
  habit,
  days,
  monthIndex,
  isNarrow,
  onToggleDay,
}: {
  habit: Habit;
  days: readonly DayStatus[];
  monthIndex: number;
  isNarrow: boolean;
  onToggleDay: (habitId: string, index: number) => void;
}) {
  const cells = useMemo(() => buildMonthCells(monthIndex), [monthIndex]);
  return (
    <VStack gap={1}>
      <div
        style={{...styles.monthGrid, gridAutoRows: 'auto'}}
        aria-hidden="true">
        {WEEKDAYS.map(weekday => (
          <div key={weekday.full} style={styles.monthWeekdayCell}>
            <Text type="supporting" color="secondary">
              {isNarrow ? weekday.min : weekday.short}
            </Text>
          </div>
        ))}
      </div>
      <div
        role="grid"
        aria-label={`${HEATMAP_MONTHS[monthIndex].label} completion heatmap for ${habit.name}`}
        style={{
          ...styles.monthGrid,
          gridAutoRows: isNarrow ? 40 : 44,
        }}>
        {cells.map(cell => {
          if (cell.kind === 'blank') {
            return <div key={cell.key} aria-hidden="true" />;
          }
          if (cell.kind === 'pre' || cell.kind === 'future') {
            const inertStyle =
              cell.kind === 'pre' ? styles.monthCellPre : styles.monthCellFuture;
            return (
              <div
                key={cell.key}
                style={{...styles.monthCell, ...inertStyle}}
                aria-hidden="true">
                {cell.day}
              </div>
            );
          }
          const index = cell.index as number;
          const status = days[index];
          const isToday = index === TODAY_INDEX;
          const cellStyle: CSSProperties = {
            ...styles.monthCell,
            ...(status === 'done'
              ? {...styles.monthCellDone, backgroundColor: habit.color}
              : undefined),
            ...(status === 'freeze'
              ? {...styles.monthCellDone, backgroundColor: FREEZE_COLOR}
              : undefined),
            ...(isToday ? styles.monthCellToday : undefined),
          };
          return (
            <button
              key={cell.key}
              type="button"
              style={cellStyle}
              aria-label={`${dayLabelOf(index)} — ${statusLabel(status)}${
                isToday ? ', today' : ''
              }. Toggle completion.`}
              onClick={() => onToggleDay(habit.id, index)}>
              {status === 'freeze' ? (
                <Icon icon={SnowflakeIcon} size="sm" />
              ) : (
                cell.day
              )}
            </button>
          );
        })}
      </div>
    </VStack>
  );
}

function YearHeatmap({
  habit,
  days,
  onToggleDay,
}: {
  habit: Habit;
  days: readonly DayStatus[];
  onToggleDay: (habitId: string, index: number) => void;
}) {
  // Week columns: pad the first week so rows align Sunday → Saturday.
  const offset = weekdayOf(0);
  const slots = Math.ceil((offset + DAY_COUNT) / 7) * 7;
  return (
    <HStack gap={0} vAlign="start">
      <div style={styles.yearWeekdayColumn} aria-hidden="true">
        {WEEKDAYS.map(weekday => (
          <span key={weekday.full} style={styles.yearWeekdayLabel}>
            {weekday.min}
          </span>
        ))}
      </div>
      <div
        role="grid"
        aria-label={`Full 90-day completion heatmap for ${habit.name}, March 27 to June 24, 2026`}
        style={styles.yearGrid}>
        {Array.from({length: slots}, (_, slot) => {
          const index = slot - offset;
          if (index < 0 || index >= DAY_COUNT) {
            return (
              <div
                key={`blank-${slot}`}
                style={{...styles.yearCell, ...styles.yearCellBlank}}
                aria-hidden="true"
              />
            );
          }
          const status = days[index];
          const isToday = index === TODAY_INDEX;
          const cellStyle: CSSProperties = {
            ...styles.yearCell,
            ...(status === 'done'
              ? {backgroundColor: habit.color}
              : undefined),
            ...(status === 'freeze'
              ? {backgroundColor: FREEZE_COLOR}
              : undefined),
            ...(isToday ? styles.yearCellToday : undefined),
          };
          return (
            <button
              key={`day-${index}`}
              type="button"
              style={cellStyle}
              aria-label={`${dayLabelOf(index)} — ${statusLabel(status)}${
                isToday ? ', today' : ''
              }. Toggle completion.`}
              onClick={() => onToggleDay(habit.id, index)}
            />
          );
        })}
      </div>
    </HStack>
  );
}

function HeatmapLegend({habit}: {habit: Habit}) {
  const items = [
    {label: 'Done', swatch: {backgroundColor: habit.color}},
    {label: 'Freeze', swatch: {backgroundColor: FREEZE_COLOR}},
    {
      label: 'Missed',
      swatch: {backgroundColor: 'var(--color-background-muted)'},
    },
    {
      label: 'Upcoming',
      swatch: {border: '1px dashed var(--color-border)'},
    },
  ];
  return (
    <div style={styles.legendRow}>
      {items.map(item => (
        <span key={item.label} style={styles.legendItem}>
          <span
            style={{...styles.legendSwatch, ...item.swatch}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            {item.label}
          </Text>
        </span>
      ))}
    </div>
  );
}

// ============= STATS RAIL =============

function StatsRail({
  habit,
  stats,
  doneToday,
  activeCount,
}: {
  habit: Habit;
  stats: HabitStats;
  doneToday: number;
  activeCount: number;
}) {
  const todayPct =
    activeCount === 0 ? 0 : Math.round((doneToday / activeCount) * 100);
  return (
    <VStack gap={4}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" hAlign="between">
            <Heading level={3}>Today</Heading>
            <Badge
              label={`${doneToday} of ${activeCount}`}
              variant={
                activeCount > 0 && doneToday === activeCount ? 'green' : 'info'
              }
            />
          </HStack>
          <div style={styles.barTrack}>
            <div
              style={{
                ...styles.barFill,
                width: `${todayPct}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {activeCount === 0
              ? 'No active habits — restore one from Archived.'
              : doneToday === activeCount
                ? 'Every habit checked off. Streaks fed.'
                : `${activeCount - doneToday} still pending for June 24.`}
          </Text>
        </VStack>
      </Card>

      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <span
            style={{...styles.habitGlyph, backgroundColor: habit.color}}
            aria-hidden="true">
            <Icon icon={habit.icon} size="sm" />
          </span>
          <Heading level={2}>{habit.name}</Heading>
        </HStack>
        <Text type="supporting" color="secondary">
          Derived from all 90 tracked days
        </Text>
      </VStack>

      <Card padding={3}>
        <Stat
          label="Current streak"
          value={`${stats.currentStreak} days`}
          description={
            stats.isTodayDone
              ? 'Includes today'
              : stats.currentStreak > 0
                ? 'Alive — today still pending'
                : 'Broken — check off today to restart'
          }
        />
      </Card>
      <Card padding={3}>
        <Stat
          label="Longest streak"
          value={`${stats.longestStreak} days`}
          description={
            stats.freezeCount > 0
              ? `Bridged by ${stats.freezeCount} streak freeze${
                  stats.freezeCount === 1 ? '' : 's'
                }`
              : 'No freezes used'
          }
        />
      </Card>
      <Card padding={3}>
        <Stat
          label="Completion rate"
          value={`${stats.completionRate}%`}
          description={`${stats.doneCount} of ${DAY_COUNT} days`}
        />
      </Card>
      <Card padding={3}>
        <Stat
          label="Best weekday"
          value={stats.bestWeekday ? stats.bestWeekday.label : '—'}
          description={
            stats.bestWeekday
              ? `${stats.bestWeekday.rate}% completion (${stats.bestWeekday.done} of ${stats.bestWeekday.total})`
              : 'No completions yet'
          }
        />
      </Card>

      <VStack gap={2}>
        <Heading level={3}>By weekday</Heading>
        {stats.weekdayRates.map(entry => (
          <HStack key={entry.label} gap={2} vAlign="center">
            <span style={styles.weekdayLabelCol}>
              <Text type="supporting" color="secondary">
                {entry.label}
              </Text>
            </span>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${entry.rate}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>
            <span style={styles.weekdayRateCol}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {entry.rate}%
              </Text>
            </span>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function HabitStreakTrackerTemplate() {
  // Single source of truth for every derived number on the page.
  const [history, setHistory] =
    useState<Record<string, DayStatus[]>>(INITIAL_HISTORY);
  const [activeOrder, setActiveOrder] = useState(INITIAL_ACTIVE_ORDER);
  const [archivedIds, setArchivedIds] = useState(INITIAL_ARCHIVED);
  const [selectedId, setSelectedId] = useState('meditate');
  const [zoom, setZoom] = useState('month');
  const [monthIndex, setMonthIndex] = useState(DEFAULT_MONTH_INDEX);
  const [isArchiveOpen, setArchiveOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // <=640px: rail stacks below the heatmap, controls upsize to ~40px.
  const isNarrow = useMediaQuery('(max-width: 640px)');

  // Every habit's stats recompute from history in one pass, so a single
  // toggle updates card streaks, flames, dots, heatmap, and rail together.
  const statsById = useMemo(() => {
    const map = new Map<string, HabitStats>();
    for (const habit of HABITS) {
      map.set(habit.id, computeStats(history[habit.id]));
    }
    return map;
  }, [history]);

  const selectedHabit = HABIT_BY_ID.get(selectedId) as Habit;
  const selectedStats = statsById.get(selectedId) as HabitStats;
  const selectedDays = history[selectedId];

  const doneToday = activeOrder.filter(
    id => history[id][TODAY_INDEX] === 'done',
  ).length;

  const toggleDay = (habitId: string, index: number) => {
    const habit = HABIT_BY_ID.get(habitId);
    if (!habit) {
      return;
    }
    const previous = history[habitId][index];
    // done → cleared; missed or freeze → done. Clearing a freeze takes two
    // taps (freeze → done → cleared), and clearing it breaks any streak the
    // freeze was bridging — the recompute makes that visible immediately.
    const next: DayStatus = previous === 'done' ? 'missed' : 'done';
    setHistory(prev => {
      const nextDays = [...prev[habitId]];
      nextDays[index] = next;
      return {...prev, [habitId]: nextDays};
    });
    setAnnouncement(
      `${habit.name}: ${dayLabelOf(index)} ${
        next === 'done' ? 'marked complete' : 'cleared'
      }`,
    );
  };

  const selectHabit = (habitId: string) => {
    setSelectedId(habitId);
    const habit = HABIT_BY_ID.get(habitId);
    if (habit) {
      setAnnouncement(`Showing stats for ${habit.name}`);
    }
  };

  const moveHabit = (habitId: string, delta: -1 | 1) => {
    setActiveOrder(prev => {
      const from = prev.indexOf(habitId);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= prev.length) {
        return prev;
      }
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, habitId);
      return next;
    });
    const habit = HABIT_BY_ID.get(habitId);
    if (habit) {
      setAnnouncement(
        `Moved ${habit.name} ${delta === -1 ? 'left' : 'right'}`,
      );
    }
  };

  const archiveHabit = (habitId: string) => {
    setActiveOrder(prev => prev.filter(id => id !== habitId));
    setArchivedIds(prev => [habitId, ...prev]);
    // Keep the heatmap pointed at an active habit when possible; the
    // archived habit's history is preserved and restorable.
    if (habitId === selectedId) {
      const remaining = activeOrder.filter(id => id !== habitId);
      if (remaining.length > 0) {
        setSelectedId(remaining[0]);
      }
    }
    const habit = HABIT_BY_ID.get(habitId);
    if (habit) {
      setAnnouncement(
        `Archived ${habit.name}. Restore it from the Archived section to undo.`,
      );
    }
  };

  const restoreHabit = (habitId: string) => {
    setArchivedIds(prev => prev.filter(id => id !== habitId));
    setActiveOrder(prev => [...prev, habitId]);
    const habit = HABIT_BY_ID.get(habitId);
    if (habit) {
      setAnnouncement(`Restored ${habit.name}`);
    }
  };

  const controlSize = isNarrow ? 'md' : 'sm';

  // ---- habit card row ----
  const cardRow =
    activeOrder.length === 0 ? (
      <EmptyState
        isCompact
        icon={<Icon icon={ArchiveIcon} size="lg" />}
        title="All habits archived"
        description="Restore a habit from the Archived section to keep its streak going."
      />
    ) : (
      <div style={styles.cardsRow}>
        {activeOrder.map((habitId, index) => {
          const habit = HABIT_BY_ID.get(habitId) as Habit;
          return (
            <HabitCard
              key={habitId}
              habit={habit}
              days={history[habitId]}
              stats={statsById.get(habitId) as HabitStats}
              isSelected={habitId === selectedId}
              isNarrow={isNarrow}
              canMoveLeft={index > 0}
              canMoveRight={index < activeOrder.length - 1}
              onSelect={selectHabit}
              onToggleToday={id => toggleDay(id, TODAY_INDEX)}
              onMove={moveHabit}
              onArchive={archiveHabit}
            />
          );
        })}
      </div>
    );

  // ---- archived section (collapsed by default) ----
  const archivedSection = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Button
          label={
            isArchiveOpen
              ? `Hide archived (${archivedIds.length})`
              : `Show archived (${archivedIds.length})`
          }
          variant="ghost"
          size={controlSize}
          icon={<Icon icon={ArchiveIcon} size="sm" />}
          onClick={() => setArchiveOpen(open => !open)}
        />
      </HStack>
      {isArchiveOpen ? (
        archivedIds.length === 0 ? (
          <Text type="supporting" color="secondary">
            Nothing archived. Habits you pause land here with their history
            intact.
          </Text>
        ) : (
          <div style={styles.cardsRow}>
            {archivedIds.map(habitId => (
              <ArchivedHabitCard
                key={habitId}
                habit={HABIT_BY_ID.get(habitId) as Habit}
                stats={statsById.get(habitId) as HabitStats}
                isSelected={habitId === selectedId}
                isNarrow={isNarrow}
                onSelect={selectHabit}
                onRestore={restoreHabit}
              />
            ))}
          </div>
        )
      ) : null}
    </VStack>
  );

  // ---- heatmap section ----
  const heatmapSection = (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>History — {selectedHabit.name}</Heading>
            <Text type="supporting" color="secondary">
              {zoom === 'year'
                ? 'Mar 27 – Jun 24, 2026 · full tracked history'
                : 'Tap any tracked day to retro-fill or clear it'}
            </Text>
          </VStack>
        </StackItem>
        <SegmentedControl
          value={zoom}
          onChange={setZoom}
          label="Heatmap density"
          size={isNarrow ? 'lg' : 'md'}>
          <SegmentedControlItem value="month" label="Month" />
          <SegmentedControlItem value="year" label="Year" />
        </SegmentedControl>
      </HStack>
      {zoom === 'month' ? (
        <HStack gap={1} vAlign="center">
          <IconButton
            label="Previous month"
            icon={<Icon icon={ChevronLeftIcon} size="sm" />}
            variant="ghost"
            size={controlSize}
            isDisabled={monthIndex === 0}
            onClick={() => setMonthIndex(index => Math.max(0, index - 1))}
          />
          <div style={styles.monthLabel}>
            <Heading level={3}>{HEATMAP_MONTHS[monthIndex].label}</Heading>
          </div>
          <IconButton
            label="Next month"
            icon={<Icon icon={ChevronRightIcon} size="sm" />}
            variant="ghost"
            size={controlSize}
            isDisabled={monthIndex === HEATMAP_MONTHS.length - 1}
            onClick={() =>
              setMonthIndex(index =>
                Math.min(HEATMAP_MONTHS.length - 1, index + 1),
              )
            }
          />
        </HStack>
      ) : null}
      {zoom === 'month' ? (
        <MonthHeatmap
          habit={selectedHabit}
          days={selectedDays}
          monthIndex={monthIndex}
          isNarrow={isNarrow}
          onToggleDay={toggleDay}
        />
      ) : (
        <YearHeatmap
          habit={selectedHabit}
          days={selectedDays}
          onToggleDay={toggleDay}
        />
      )}
      <HeatmapLegend habit={selectedHabit} />
    </VStack>
  );

  const rail = (
    <StatsRail
      habit={selectedHabit}
      stats={selectedStats}
      doneToday={doneToday}
      activeCount={activeOrder.length}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <span style={styles.flameLit} aria-hidden="true">
                  <Icon icon={FlameIcon} size="md" />
                </span>
                <Heading level={1}>Habit Streaks</Heading>
              </HStack>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Wednesday, June 24 · {doneToday} of {activeOrder.length} done
              today
            </Text>
          </HStack>
        </LayoutHeader>
      }
      end={
        isNarrow ? undefined : (
          <LayoutPanel width={300} padding={0} label="Habit stats">
            <div style={styles.panelScroll}>{rail}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={isNarrow ? 4 : 6}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <VStack gap={5}>
            {cardRow}
            {archivedSection}
            <Divider />
            {heatmapSection}
            {isNarrow ? (
              <>
                <Divider />
                {rail}
              </>
            ) : null}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
