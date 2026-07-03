// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file wheel-picker-scheduler.tsx
 * @input Deterministic fixtures only (a fixed planning day — Thursday,
 *   July 2, 2026, with a fixed 9:00 AM queue anchor; four session types
 *   mapped to categorical color tokens with one-line blurbs; an hours wheel
 *   0–4, a minutes wheel 00–55 in 5-minute steps, and a session-type wheel;
 *   four presets — Pomodoro, Deep Work, Break, Admin sweep — as literal
 *   hour/minute/type triples; and a two-session seeded queue). No Date.now,
 *   no Math.random, no network assets — every time label is pure minute
 *   math over the fixed anchor.
 * @output Wheel Picker Scheduler — a focus-timer setup surface built around
 *   iOS-style wheel pickers. Three vertical scroll-snap wheels (hours,
 *   minutes, session type) sit side by side inside a masked sheet: items
 *   rotate and fade with distance from the center lens (a per-item
 *   `--wps-dist` custom property drives `perspective() rotateX()` and
 *   scale), fade overlays feather the top and bottom edges, and a tinted
 *   selection lens marks the committed row. Flicking a wheel rides native
 *   scroll physics and snaps via scroll-snap; tapping any off-center row
 *   smooth-scrolls it into the lens; each wheel is also a real listbox
 *   (arrow keys, PageUp/Down, Home/End) whose keyboard path drives the
 *   identical commit function as the gesture. Preset chips programmatically
 *   smooth-scroll all three wheels to their targets simultaneously and
 *   light up as pressed when the wheels match them. Chosen values compose
 *   live into a summary card: a conic-gradient duration ring that tweens to
 *   the new arc on every change (registered `@property` angle transition),
 *   the session-type blurb, and a derived "would run 11:45 AM – 1:15 PM"
 *   line chained after today's queue. "Add to queue" appends the composed
 *   session (optionally auto-inserting a 5-minute break) to a Today's queue
 *   rail whose rows re-derive start/end times on every add, remove, and
 *   reorder, with per-type totals and a focus-vs-break split underneath.
 * @position Page template; emitted by `astryx template wheel-picker-scheduler`
 *
 * Frame: Layout height="fill". LayoutHeader carries the scheduler chrome
 * (timer icon + title, fixed date label, and a queued-total Badge). The
 * `end` slot docks a 340px Today's-queue LayoutPanel above 960px.
 * LayoutContent scrolls a centered composer column: the wheel sheet (three
 * wheels + lens + preset chips + Kbd hint line) and the live summary card.
 * Choose this over booking-availability-picker when the surface composes a
 * duration from continuous wheels rather than picking a discrete slot from
 * an availability grid; choose it over day-planner-timeblock when the job
 * is enqueueing sessions, not editing a spatial timeline.
 *
 * Interaction contract:
 * - One commit path: `selectHour/selectMinute/selectType(index)` is the
 *   only way selection state changes. The scroll handler (rAF-throttled)
 *   commits the nearest row while a flick settles; listbox keys, row taps,
 *   and preset chips call the very same functions and let a per-wheel
 *   effect smooth-scroll the viewport to match — so gesture, tap, and
 *   keyboard are literally the same state machine.
 * - Each wheel is role="listbox" with aria-activedescendant mirroring the
 *   lens row; rows are role="option" with aria-selected. The wheels are
 *   focusable in reading order (hours → minutes → type).
 * - Preset chips are ToggleButtons whose pressed state is *derived*: a chip
 *   lights up whenever the three wheels sit on its exact triple, however
 *   the user got there.
 * - The duration ring is a conic-gradient over a registered @property
 *   angle, so CSS transitions tween the arc between commits; the center
 *   restates the duration as text so the value is never color-only.
 * - Queue mutations (add, remove, move up/down) re-derive every start/end
 *   label from the fixed 9:00 AM anchor in one pass; the day is capped at
 *   9:00 PM and the add button disables (with a tooltip reason) when the
 *   composed session would not fit.
 * - Every commit and mutation is announced through a visually hidden
 *   aria-live region.
 * - Reduced motion: wheel rows render flat (no rotateX/scale, uniform dim
 *   for non-selected rows), programmatic wheel jumps use behavior:'auto',
 *   and the ring transition is disabled via a media query in the injected
 *   CSS — every animated affordance has a non-animated equivalent.
 *
 * Responsive contract:
 * - >960px: header | composer column (sheet + summary, maxWidth 560,
 *   centered, scrolls) | Today's queue LayoutPanel end 340 (scrolls
 *   internally).
 * - 641–960px: the queue panel undocks and stacks under the summary card
 *   as a Card inside the same scrolling column.
 * - <=640px (usable at 375px): single pane — the wheel sheet goes
 *   full-bleed like a native bottom sheet (border and radius dropped), the
 *   three wheels stay side by side exactly like the native pattern
 *   (84 + 84 + flexible type column fits 375px), the Kbd hint line hides,
 *   preset chips wrap, and the queue stacks last. Wheel rows are 40px tall
 *   and full-width tap targets; presets, add, and queue actions keep ~40px
 *   heights. Nothing is hover-only — tap-a-row, chips, and buttons carry
 *   every interaction.
 * - The wheels scroll vertically inside fixed 200px viewports; the page
 *   itself never scrolls horizontally (the wheel grid is content-sized and
 *   the type column ellipsizes).
 *
 * Container policy (composer archetype): page chrome is frame-first; the
 * wheel sheet is a hand-rolled surface (background/border/radius/shadow
 * tokens) because the wheels need full ownership of masking, snapping, and
 * per-row transforms; Astryx Cards are reserved for the summary and the
 * undocked queue. Queue rows are plain flex rows with Tokens and
 * IconButtons — no list machinery.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or a categorical data token with a semantic
 * token fallback — no raw hex, no rgb(). The lens tint and ring track are
 * color-mix() over tokens so both resolve in dark mode; session-type
 * colors ride the categorical ramp which is scheme-aware by definition.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CoffeeIcon,
  InboxIcon,
  ListTodoIcon,
  PlusIcon,
  SparklesIcon,
  TimerIcon,
  Trash2Icon,
} from 'lucide-react';

// ============= WHEEL GEOMETRY =============
// The whole exhibit hangs off three numbers: row height, visible rows, and
// the derived pad that lets the first/last rows reach the center lens.

/** Height of one wheel row — also the ~40px tap target. */
const ITEM_HEIGHT = 40;
/** Rows visible in the masked viewport (odd, so one row centers). */
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
/** Top/bottom spacer so index 0 and index n-1 can sit in the lens. */
const WHEEL_PAD = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;
/** Degrees of rotateX per row of distance from the lens. */
const TILT_PER_ROW = 16;
/** Distance (in rows) past which rows stop rotating/fading further. */
const MAX_DIST = 2.5;

/** Ring cap: the largest composable duration (4 h 55 m) fills the arc. */
const RING_CAP_MIN = 4 * 60 + 55;

// Fixed fixture day: the queue anchors at 9:00 AM and closes at 9:00 PM.
const DAY_LABEL = 'Thursday, July 2, 2026';
const ANCHOR_MIN = 9 * 60;
const DAY_CAP_MIN = 12 * 60; // 9:00 AM → 9:00 PM of queueable time

/** Minutes of break auto-inserted after focus-shaped sessions. */
const AUTO_BREAK_MIN = 5;

// ============= INJECTED CSS =============
// The typed style-object idiom covers everything except three things CSS
// insists live in a stylesheet: the registered @property that lets the
// conic arc transition, the ::-webkit-scrollbar hider, and :focus-visible.
// The reduced-motion guard for the ring transition also lives here.

const WHEEL_CSS = `
@property --wps-ring-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.wps-ring {
  transition: --wps-ring-angle 480ms cubic-bezier(0.22, 1, 0.36, 1);
}
.wps-wheel {
  scrollbar-width: none;
}
.wps-wheel::-webkit-scrollbar {
  display: none;
}
.wps-wheel:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
  border-radius: var(--radius-container);
}
@media (prefers-reduced-motion: reduce) {
  .wps-ring {
    transition: none;
  }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Composer column: sheet + summary, centered and capped.
  column: {
    width: '100%',
    maxWidth: 560,
    marginInline: 'auto',
    paddingInline: 16,
    paddingBlock: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // <=640px: the sheet goes full-bleed, so the column drops its gutters
  // around it and re-adds them per-section instead.
  columnPhone: {
    paddingInline: 0,
    paddingBlock: 0,
    gap: 'var(--spacing-3)',
  },
  phoneSection: {
    paddingInline: 16,
  },
  // The wheel sheet: hand-rolled surface because the wheels own masking,
  // snapping, and per-row transforms. Fades reference the same token.
  sheet: {
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-low)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // Native-sheet look at phone widths: full-bleed, no border or radius.
  sheetPhone: {
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    paddingInline: 16,
  },
  // Three wheels side by side; the type column flexes, digits stay fixed.
  wheelGrid: {
    display: 'grid',
    gridTemplateColumns: '84px 84px minmax(116px, 1fr)',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
    maxWidth: 420,
    width: '100%',
    marginInline: 'auto',
  },
  wheelColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    minWidth: 0,
  },
  wheelLabel: {
    textAlign: 'center',
  },
  // The masked viewport: lens + fades overlay the scroller.
  wheelShell: {
    position: 'relative',
    height: WHEEL_HEIGHT,
  },
  wheelScroller: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollSnapType: 'y mandatory',
    overscrollBehavior: 'contain',
    position: 'relative',
  },
  wheelSpacer: {
    height: WHEEL_PAD,
    flexShrink: 0,
  },
  // One wheel row: full-width 40px tap target; the transform is driven by
  // the per-item --wps-dist custom property set inline each render.
  wheelItem: {
    height: ITEM_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    scrollSnapAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    paddingInline: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 17,
    lineHeight: `${ITEM_HEIGHT}px`,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    transform:
      `perspective(620px) rotateX(calc(var(--wps-dist) * -${TILT_PER_ROW}deg)) ` +
      'scale(calc(1 - var(--wps-dist-abs) * 0.05))',
  },
  wheelItemFlat: {
    transform: 'none',
  },
  wheelItemSelected: {
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // Selection lens: a tinted, hairline-ruled band pinned to the vertical
  // center of every wheel — pointer-transparent so flicks pass through.
  lens: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: WHEEL_PAD,
    height: ITEM_HEIGHT,
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
    borderRadius: 'var(--radius-element)',
    pointerEvents: 'none',
  },
  // Fade masks feather the wheel into the sheet surface top and bottom.
  fadeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: WHEEL_PAD - 6,
    background:
      'linear-gradient(to bottom, var(--color-background-card), transparent)',
    pointerEvents: 'none',
  },
  fadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: WHEEL_PAD - 6,
    background:
      'linear-gradient(to top, var(--color-background-card), transparent)',
    pointerEvents: 'none',
  },
  // Preset chip row: wraps at phone widths; chips keep ~40px heights.
  presetRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
  },
  // Conic-gradient duration ring; the arc angle is the registered
  // @property so the .wps-ring transition tweens it between commits.
  ring: {
    width: 128,
    height: 128,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringHole: {
    width: 104,
    height: 104,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    textAlign: 'center',
    paddingInline: 'var(--spacing-1)',
  },
  // Queue rows: plain flex rows; the spine dot carries the type color.
  queueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-divider)',
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Focus-vs-break split bar: two flex segments over tokens.
  splitBar: {
    display: 'flex',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
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

// ============= DATA =============

type TypeId = 'focus' | 'deep' | 'break' | 'admin';
type TokenColor = 'blue' | 'purple' | 'green' | 'orange';

interface SessionType {
  id: TypeId;
  label: string;
  /** Ring fill / lens dot color — categorical token, semantic fallback. */
  color: string;
  token: TokenColor;
  blurb: string;
}

const SESSION_TYPES: readonly SessionType[] = [
  {
    id: 'focus',
    label: 'Focus',
    color: 'var(--color-data-categorical-blue, var(--color-accent))',
    token: 'blue',
    blurb: 'Single-task sprint with notifications muted.',
  },
  {
    id: 'deep',
    label: 'Deep Work',
    color: 'var(--color-data-categorical-purple, var(--color-accent))',
    token: 'purple',
    blurb: 'Long-form maker block — calendar blocked, chat closed.',
  },
  {
    id: 'break',
    label: 'Break',
    color: 'var(--color-data-categorical-green, var(--color-success))',
    token: 'green',
    blurb: 'Step away from the screen. Water, walk, window.',
  },
  {
    id: 'admin',
    label: 'Admin',
    color: 'var(--color-data-categorical-orange, var(--color-warning))',
    token: 'orange',
    blurb: 'Email, planning, and the small stuff — batched on purpose.',
  },
];

const TYPE_BY_ID = new Map(SESSION_TYPES.map(type => [type.id, type]));

/** Hours wheel values: 0–4. */
const HOURS: readonly number[] = [0, 1, 2, 3, 4];
/** Minutes wheel values: 00–55 in 5-minute steps. */
const MINUTES: readonly number[] = (() => {
  const values: number[] = [];
  for (let m = 0; m < 60; m += 5) {
    values.push(m);
  }
  return values;
})();

interface WheelOption {
  id: string;
  label: string;
}

const HOUR_OPTIONS: readonly WheelOption[] = HOURS.map(h => ({
  id: `h-${h}`,
  label: String(h),
}));
const MINUTE_OPTIONS: readonly WheelOption[] = MINUTES.map(m => ({
  id: `m-${m}`,
  label: String(m).padStart(2, '0'),
}));
const TYPE_OPTIONS: readonly WheelOption[] = SESSION_TYPES.map(type => ({
  id: `t-${type.id}`,
  label: type.label,
}));

interface Preset {
  id: string;
  label: string;
  hourIndex: number;
  minuteIndex: number;
  typeIndex: number;
  icon: typeof TimerIcon;
}

/** Preset triples index straight into the three wheels. */
const PRESETS: readonly Preset[] = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    hourIndex: HOURS.indexOf(0),
    minuteIndex: MINUTES.indexOf(25),
    typeIndex: SESSION_TYPES.findIndex(type => type.id === 'focus'),
    icon: TimerIcon,
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    hourIndex: HOURS.indexOf(1),
    minuteIndex: MINUTES.indexOf(30),
    typeIndex: SESSION_TYPES.findIndex(type => type.id === 'deep'),
    icon: BrainIcon,
  },
  {
    id: 'break',
    label: 'Break',
    hourIndex: HOURS.indexOf(0),
    minuteIndex: MINUTES.indexOf(15),
    typeIndex: SESSION_TYPES.findIndex(type => type.id === 'break'),
    icon: CoffeeIcon,
  },
  {
    id: 'admin',
    label: 'Admin sweep',
    hourIndex: HOURS.indexOf(0),
    minuteIndex: MINUTES.indexOf(45),
    typeIndex: SESSION_TYPES.findIndex(type => type.id === 'admin'),
    icon: InboxIcon,
  },
];

interface PlanSession {
  id: string;
  typeId: TypeId;
  minutes: number;
}

// The queue opens with a seeded morning: one deep block and its break.
const INITIAL_PLAN: readonly PlanSession[] = [
  {id: 'seed-deep', typeId: 'deep', minutes: 90},
  {id: 'seed-break', typeId: 'break', minutes: 15},
];

// Seeded wheels: the Deep Work preset, so the sheet opens mid-story with
// the matching chip already pressed.
const INITIAL_HOUR_INDEX = HOURS.indexOf(1);
const INITIAL_MINUTE_INDEX = MINUTES.indexOf(30);
const INITIAL_TYPE_INDEX = SESSION_TYPES.findIndex(type => type.id === 'deep');

// ============= TIME HELPERS =============
// Pure minute math over the fixed anchor — no Date anywhere.

/** 615 → "10:15 AM". */
function formatMin(min: number): string {
  const hour24 = Math.floor(min / 60) % 24;
  const minute = min % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (minutes === 0) {
    return '0 min';
  }
  if (hours === 0) {
    return `${rest} min`;
  }
  if (rest === 0) {
    return hours === 1 ? '1 hr' : `${hours} hr`;
  }
  return `${hours} hr ${rest} min`;
}

function clampIndex(index: number, count: number): number {
  return Math.min(Math.max(index, 0), count - 1);
}

// ============= WHEEL =============

/**
 * One iOS-style wheel: a scroll-snap listbox inside a masked viewport.
 *
 * Commit parity is the whole point. The scroll handler commits the nearest
 * row through `onSelect` while a flick settles; keyboard keys and row taps
 * call the same `onSelect`; and a single effect scrolls the viewport to
 * `selectedIndex` only when the change did NOT originate from this wheel's
 * own scrolling (tracked via `lastScrollCommit`), so programmatic motion
 * never fights a live gesture.
 */
function Wheel({
  id,
  label,
  options,
  selectedIndex,
  isReducedMotion,
  onSelect,
}: {
  id: string;
  label: string;
  options: readonly WheelOption[];
  selectedIndex: number;
  isReducedMotion: boolean;
  onSelect: (index: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  /** Index most recently committed by this wheel's own scroll events. */
  const lastScrollCommit = useRef<number | null>(null);
  const hasMounted = useRef(false);
  const [scrollTop, setScrollTop] = useState(selectedIndex * ITEM_HEIGHT);

  // Programmatic path: when selection changes from outside (keyboard,
  // row tap, preset), glide the viewport to it. First run is instant so
  // the seeded selection doesn't animate on load.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    if (lastScrollCommit.current === selectedIndex) {
      // This change originated from our own scroll handler — the viewport
      // is already there (or gliding there); do not restart the scroll.
      return;
    }
    const behavior: ScrollBehavior =
      !hasMounted.current || isReducedMotion ? 'auto' : 'smooth';
    hasMounted.current = true;
    el.scrollTo({top: selectedIndex * ITEM_HEIGHT, behavior});
  }, [selectedIndex, isReducedMotion]);

  useEffect(
    () => () => {
      if (frameRef.current !== 0) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  // Gesture path: rAF-throttled scroll handler re-renders the row
  // transforms and commits the nearest row through the shared onSelect.
  const handleScroll = () => {
    if (frameRef.current !== 0) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const el = scrollerRef.current;
      if (!el) {
        return;
      }
      setScrollTop(el.scrollTop);
      const nearest = clampIndex(
        Math.round(el.scrollTop / ITEM_HEIGHT),
        options.length,
      );
      if (nearest !== selectedIndex) {
        lastScrollCommit.current = nearest;
        onSelect(nearest);
      }
    });
  };

  // Keyboard path: identical commit logic — onSelect, then the effect
  // above scrolls the viewport to match.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
        next = selectedIndex + 1;
        break;
      case 'ArrowUp':
        next = selectedIndex - 1;
        break;
      case 'PageDown':
        next = selectedIndex + 3;
        break;
      case 'PageUp':
        next = selectedIndex - 3;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = options.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const clamped = clampIndex(next, options.length);
    if (clamped !== selectedIndex) {
      lastScrollCommit.current = null;
      onSelect(clamped);
    }
  };

  const selectByTap = (index: number) => {
    if (index !== selectedIndex) {
      lastScrollCommit.current = null;
      onSelect(index);
    }
  };

  return (
    <div style={styles.wheelColumn}>
      <div style={styles.wheelLabel}>
        <Text type="label" size="sm" color="secondary">
          {label}
        </Text>
      </div>
      <div style={styles.wheelShell}>
        <div style={styles.lens} aria-hidden="true" />
        <div
          ref={scrollerRef}
          className="wps-wheel"
          role="listbox"
          tabIndex={0}
          aria-label={label}
          aria-activedescendant={`${id}-opt-${selectedIndex}`}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          style={styles.wheelScroller}>
          <div style={styles.wheelSpacer} aria-hidden="true" />
          {options.map((option, index) => {
            const dist = (index * ITEM_HEIGHT - scrollTop) / ITEM_HEIGHT;
            const clamped = Math.max(Math.min(dist, MAX_DIST), -MAX_DIST);
            const abs = Math.abs(clamped);
            const isSelected = index === selectedIndex;
            // Reduced motion: flat rows, uniform dim for non-selected.
            const opacity = isReducedMotion
              ? isSelected
                ? 1
                : 0.45
              : Math.max(1 - abs * 0.3, 0.25);
            const itemStyle = {
              ...styles.wheelItem,
              ...(isReducedMotion ? styles.wheelItemFlat : undefined),
              ...(isSelected ? styles.wheelItemSelected : undefined),
              opacity,
              '--wps-dist': String(clamped),
              '--wps-dist-abs': String(abs),
            } as CSSProperties;
            return (
              <div
                key={option.id}
                id={`${id}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                style={itemStyle}
                onClick={() => selectByTap(index)}>
                {option.label}
              </div>
            );
          })}
          <div style={styles.wheelSpacer} aria-hidden="true" />
        </div>
        <div style={styles.fadeTop} aria-hidden="true" />
        <div style={styles.fadeBottom} aria-hidden="true" />
      </div>
    </div>
  );
}

// ============= DURATION RING =============

/**
 * Conic-gradient duration ring. The arc angle rides the registered
 * `--wps-ring-angle` @property, so the .wps-ring class transition tweens
 * the sweep between commits; reduced motion disables the transition in the
 * injected CSS. The center restates the value as text.
 */
function DurationRing({
  minutes,
  type,
}: {
  minutes: number;
  type: SessionType;
}) {
  const angle = Math.min(minutes / RING_CAP_MIN, 1) * 360;
  const ringStyle = {
    ...styles.ring,
    '--wps-ring-angle': `${angle}deg`,
    background:
      `conic-gradient(${type.color} var(--wps-ring-angle), ` +
      'color-mix(in srgb, var(--color-border) 55%, transparent) 0deg)',
  } as CSSProperties;
  return (
    <div
      className="wps-ring"
      style={ringStyle}
      role="img"
      aria-label={`${formatDuration(minutes)} ${type.label} session`}>
      <div style={styles.ringHole}>
        <Text type="body" size="lg" weight="semibold" hasTabularNumbers>
          {formatDuration(minutes)}
        </Text>
        <Text type="supporting" size="sm" color="secondary">
          {type.label}
        </Text>
      </div>
    </div>
  );
}

// ============= QUEUE =============

interface QueueRowDerived {
  session: PlanSession;
  type: SessionType;
  startMin: number;
  endMin: number;
}

/** Chain start/end times from the fixed anchor in one pass. */
function deriveQueue(plan: readonly PlanSession[]): QueueRowDerived[] {
  let cursor = ANCHOR_MIN;
  return plan.map(session => {
    const type = TYPE_BY_ID.get(session.typeId) ?? SESSION_TYPES[0];
    const startMin = cursor;
    cursor += session.minutes;
    return {session, type, startMin, endMin: cursor};
  });
}

function QueuePanel({
  rows,
  totalMin,
  focusMin,
  breakMin,
  onRemove,
  onMove,
}: {
  rows: readonly QueueRowDerived[];
  totalMin: number;
  focusMin: number;
  breakMin: number;
  onRemove: (id: string) => void;
  onMove: (id: string, delta: -1 | 1) => void;
}) {
  const focusPct = totalMin === 0 ? 0 : (focusMin / totalMin) * 100;

  // Per-type totals for the footer Tokens.
  const typeTotals = SESSION_TYPES.map(type => ({
    type,
    minutes: rows
      .filter(row => row.type.id === type.id)
      .reduce((sum, row) => sum + row.session.minutes, 0),
  })).filter(entry => entry.minutes > 0);

  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ListTodoIcon} size="md" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Today&apos;s queue</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {rows.length} session{rows.length === 1 ? '' : 's'}
        </Text>
      </HStack>

      {rows.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={TimerIcon} size="lg" />}
          title="Nothing queued yet"
          description="Compose a session on the wheels and add it — the queue starts at 9:00 AM."
        />
      ) : (
        <VStack gap={0}>
          {rows.map((row, index) => (
            <div key={row.session.id} style={styles.queueRow}>
              <span
                style={{...styles.typeDot, backgroundColor: row.type.color}}
                aria-hidden="true"
              />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body" size="sm" weight="medium" maxLines={1}>
                    {row.type.label} · {formatDuration(row.session.minutes)}
                  </Text>
                  <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                    {formatMin(row.startMin)} – {formatMin(row.endMin)}
                  </Text>
                </VStack>
              </StackItem>
              <IconButton
                label={`Move ${row.type.label} session earlier`}
                icon={<Icon icon={ChevronUpIcon} size="sm" />}
                variant="ghost"
                size="sm"
                isDisabled={index === 0}
                onClick={() => onMove(row.session.id, -1)}
              />
              <IconButton
                label={`Move ${row.type.label} session later`}
                icon={<Icon icon={ChevronDownIcon} size="sm" />}
                variant="ghost"
                size="sm"
                isDisabled={index === rows.length - 1}
                onClick={() => onMove(row.session.id, 1)}
              />
              <IconButton
                label={`Remove ${row.type.label} session at ${formatMin(row.startMin)}`}
                icon={<Icon icon={Trash2Icon} size="sm" />}
                variant="ghost"
                size="sm"
                onClick={() => onRemove(row.session.id)}
              />
            </div>
          ))}
        </VStack>
      )}

      {rows.length > 0 && (
        <VStack gap={2}>
          <div
            style={styles.splitBar}
            role="img"
            aria-label={`${formatDuration(focusMin)} focused, ${formatDuration(
              breakMin,
            )} on break`}>
            <div
              style={{
                width: `${focusPct}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
            <div
              style={{
                flex: 1,
                backgroundColor:
                  'color-mix(in srgb, var(--color-success) 55%, var(--color-background-muted))',
              }}
            />
          </div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Text type="supporting" size="sm" hasTabularNumbers>
              {formatDuration(focusMin)} focused
            </Text>
            <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
              {formatDuration(breakMin)} break
            </Text>
            <StackItem size="fill" />
            <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
              wraps {formatMin(ANCHOR_MIN + totalMin)}
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center" wrap="wrap">
            {typeTotals.map(entry => (
              <Token
                key={entry.type.id}
                label={`${entry.type.label} ${formatDuration(entry.minutes)}`}
                color={entry.type.token}
                size="sm"
              />
            ))}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function WheelPickerSchedulerTemplate() {
  // Wheel selection: three indices, committed only through the select*
  // functions below — the single commit path shared by flick, tap,
  // keyboard, and presets.
  const [hourIndex, setHourIndex] = useState(INITIAL_HOUR_INDEX);
  const [minuteIndex, setMinuteIndex] = useState(INITIAL_MINUTE_INDEX);
  const [typeIndex, setTypeIndex] = useState(INITIAL_TYPE_INDEX);
  const [plan, setPlan] = useState<readonly PlanSession[]>(INITIAL_PLAN);
  const [autoBreak, setAutoBreak] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const nextIdRef = useRef(1);

  const isPhone = useMediaQuery('(max-width: 640px)');
  const isQueueUndocked = useMediaQuery('(max-width: 960px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const hours = HOURS[hourIndex];
  const minutes = MINUTES[minuteIndex];
  const type = SESSION_TYPES[typeIndex];
  const durationMin = hours * 60 + minutes;

  const queueRows = useMemo(() => deriveQueue(plan), [plan]);
  const totalMin = useMemo(
    () => plan.reduce((sum, session) => sum + session.minutes, 0),
    [plan],
  );
  const breakMin = useMemo(
    () =>
      plan
        .filter(session => session.typeId === 'break')
        .reduce((sum, session) => sum + session.minutes, 0),
    [plan],
  );
  const focusMin = totalMin - breakMin;

  // The composed session slots in after everything queued so far.
  const wouldStartMin = ANCHOR_MIN + totalMin;
  const wouldEndMin = wouldStartMin + durationMin;
  const addedBreak = autoBreak && type.id !== 'break' ? AUTO_BREAK_MIN : 0;
  const fitsToday = totalMin + durationMin + addedBreak <= DAY_CAP_MIN;
  const canAdd = durationMin > 0 && fitsToday;

  // Derived preset match: a chip is pressed when the wheels sit on its
  // exact triple, however the user got there.
  const activePresetId = useMemo(() => {
    const match = PRESETS.find(
      preset =>
        preset.hourIndex === hourIndex &&
        preset.minuteIndex === minuteIndex &&
        preset.typeIndex === typeIndex,
    );
    return match?.id ?? null;
  }, [hourIndex, minuteIndex, typeIndex]);

  // ---- the single commit path ----

  const selectHour = useCallback(
    (index: number) => {
      setHourIndex(index);
      setAnnouncement(
        `Hours set to ${HOURS[index]} — session length ${formatDuration(
          HOURS[index] * 60 + MINUTES[minuteIndex],
        )}`,
      );
    },
    [minuteIndex],
  );

  const selectMinute = useCallback(
    (index: number) => {
      setMinuteIndex(index);
      setAnnouncement(
        `Minutes set to ${MINUTES[index]} — session length ${formatDuration(
          HOURS[hourIndex] * 60 + MINUTES[index],
        )}`,
      );
    },
    [hourIndex],
  );

  const selectType = useCallback((index: number) => {
    setTypeIndex(index);
    setAnnouncement(`Session type set to ${SESSION_TYPES[index].label}`);
  }, []);

  // Presets set all three indices; each wheel's effect glides its
  // viewport there simultaneously (instantly under reduced motion).
  const applyPreset = useCallback((preset: Preset) => {
    setHourIndex(preset.hourIndex);
    setMinuteIndex(preset.minuteIndex);
    setTypeIndex(preset.typeIndex);
    const presetMin =
      HOURS[preset.hourIndex] * 60 + MINUTES[preset.minuteIndex];
    setAnnouncement(
      `${preset.label} preset: ${formatDuration(presetMin)} ${
        SESSION_TYPES[preset.typeIndex].label
      }`,
    );
  }, []);

  // ---- queue mutations ----

  const addToPlan = useCallback(() => {
    if (!canAdd) {
      return;
    }
    const additions: PlanSession[] = [
      {id: `s-${nextIdRef.current++}`, typeId: type.id, minutes: durationMin},
    ];
    if (addedBreak > 0) {
      additions.push({
        id: `s-${nextIdRef.current++}`,
        typeId: 'break',
        minutes: AUTO_BREAK_MIN,
      });
    }
    setPlan(prev => [...prev, ...additions]);
    setAnnouncement(
      `Queued ${formatDuration(durationMin)} ${type.label} at ${formatMin(
        wouldStartMin,
      )}${addedBreak > 0 ? ` plus a ${AUTO_BREAK_MIN} minute break` : ''}`,
    );
  }, [canAdd, type, durationMin, addedBreak, wouldStartMin]);

  const removeFromPlan = useCallback(
    (id: string) => {
      const target = plan.find(session => session.id === id);
      setPlan(prev => prev.filter(session => session.id !== id));
      if (target) {
        const targetType = TYPE_BY_ID.get(target.typeId);
        setAnnouncement(
          `Removed ${formatDuration(target.minutes)} ${
            targetType?.label ?? 'session'
          } — later sessions moved up`,
        );
      }
    },
    [plan],
  );

  const moveInPlan = useCallback(
    (id: string, delta: -1 | 1) => {
      const index = plan.findIndex(session => session.id === id);
      const nextIndex = index + delta;
      if (index < 0 || nextIndex < 0 || nextIndex >= plan.length) {
        return;
      }
      setPlan(prev => {
        const next = [...prev];
        const [moved] = next.splice(index, 1);
        next.splice(nextIndex, 0, moved);
        return next;
      });
      const targetType = TYPE_BY_ID.get(plan[index].typeId);
      setAnnouncement(
        `Moved ${targetType?.label ?? 'session'} ${
          delta < 0 ? 'earlier' : 'later'
        } in the queue`,
      );
    },
    [plan],
  );

  // ---- sections ----

  const wheelSheet = (
    <section
      aria-label="Session composer wheels"
      style={{
        ...styles.sheet,
        ...(isPhone ? styles.sheetPhone : undefined),
      }}>
      <div style={styles.wheelGrid}>
        <Wheel
          id="wps-hours"
          label="Hours"
          options={HOUR_OPTIONS}
          selectedIndex={hourIndex}
          isReducedMotion={isReducedMotion}
          onSelect={selectHour}
        />
        <Wheel
          id="wps-minutes"
          label="Minutes"
          options={MINUTE_OPTIONS}
          selectedIndex={minuteIndex}
          isReducedMotion={isReducedMotion}
          onSelect={selectMinute}
        />
        <Wheel
          id="wps-type"
          label="Session"
          options={TYPE_OPTIONS}
          selectedIndex={typeIndex}
          isReducedMotion={isReducedMotion}
          onSelect={selectType}
        />
      </div>

      <div style={styles.presetRow} role="group" aria-label="Presets">
        {PRESETS.map(preset => (
          <ToggleButton
            key={preset.id}
            label={preset.label}
            size="md"
            isPressed={activePresetId === preset.id}
            onPressedChange={() => applyPreset(preset)}
            icon={<Icon icon={preset.icon} size="sm" />}
          />
        ))}
      </div>

      {/* Kbd hints: desktop-only chrome — touch users have tap-a-row. */}
      {!isPhone && (
        <HStack gap={2} vAlign="center" hAlign="center" wrap="wrap">
          <Kbd keys="↑" />
          <Kbd keys="↓" />
          <Text type="supporting" size="sm" color="secondary">
            step a wheel
          </Text>
          <Kbd keys="Home" />
          <Kbd keys="End" />
          <Text type="supporting" size="sm" color="secondary">
            jump — Tab moves between wheels
          </Text>
        </HStack>
      )}
    </section>
  );

  const summaryCard = (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={4} vAlign="center" wrap="wrap">
          <DurationRing minutes={durationMin} type={type} />
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Token label={type.label} color={type.token} size="sm" />
                {activePresetId !== null && (
                  <Badge
                    variant="info"
                    label={
                      PRESETS.find(preset => preset.id === activePresetId)
                        ?.label ?? 'Preset'
                    }
                    icon={<Icon icon={SparklesIcon} size="xsm" />}
                  />
                )}
              </HStack>
              <Text type="supporting" color="secondary">
                {type.blurb}
              </Text>
              <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                {durationMin === 0
                  ? 'Spin the wheels — a zero-length session can’t be queued.'
                  : `Would run ${formatMin(wouldStartMin)} – ${formatMin(
                      wouldEndMin,
                    )} after today’s queue.`}
              </Text>
            </VStack>
          </StackItem>
        </HStack>

        <Divider />

        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <CheckboxInput
              label={`Add a ${AUTO_BREAK_MIN}-minute break after focus sessions`}
              size="sm"
              value={autoBreak}
              onChange={setAutoBreak}
            />
          </StackItem>
          <Button
            label="Add to queue"
            icon={<Icon icon={PlusIcon} size="sm" />}
            isDisabled={!canAdd}
            style={styles.buttonTapTarget}
            tooltip={
              canAdd
                ? undefined
                : durationMin === 0
                  ? 'Pick a non-zero duration first'
                  : 'Today’s queue closes at 9:00 PM — this session won’t fit'
            }
            onClick={addToPlan}
          />
        </HStack>
      </VStack>
    </Card>
  );

  const queueContent = (
    <QueuePanel
      rows={queueRows}
      totalMin={totalMin}
      focusMin={focusMin}
      breakMin={breakMin}
      onRemove={removeFromPlan}
      onMove={moveInPlan}
    />
  );

  let column: ReactNode;
  if (isPhone) {
    // <=640px: full-bleed sheet first, then gutter-padded sections.
    column = (
      <div style={{...styles.column, ...styles.columnPhone}}>
        {wheelSheet}
        <div style={styles.phoneSection}>{summaryCard}</div>
        <div style={{...styles.phoneSection, paddingBottom: 24}}>
          <Card padding={4}>{queueContent}</Card>
        </div>
      </div>
    );
  } else if (isQueueUndocked) {
    // 641–960px: the queue stacks under the summary as a Card.
    column = (
      <div style={styles.column}>
        {wheelSheet}
        {summaryCard}
        <Card padding={4}>{queueContent}</Card>
      </div>
    );
  } else {
    column = (
      <div style={styles.column}>
        {wheelSheet}
        {summaryCard}
      </div>
    );
  }

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={TimerIcon} size="md" color="secondary" />
                <Heading level={1}>Focus scheduler</Heading>
                {!isPhone && (
                  <Text type="supporting" color="secondary">
                    {DAY_LABEL}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Badge
              variant="neutral"
              label={`${formatDuration(totalMin)} queued`}
              icon={<Icon icon={ListTodoIcon} size="xsm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      end={
        isQueueUndocked ? undefined : (
          <LayoutPanel width={340} padding={0} hasDivider label="Today's queue">
            <div style={styles.panelScroll}>{queueContent}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0} role="main" label="Session composer">
          <style>{WHEEL_CSS}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {column}
        </LayoutContent>
      }
    />
  );
}
