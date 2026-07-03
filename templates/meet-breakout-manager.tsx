// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the Kestrel Labs 'Atlas Q3 Sprint
 *   Review' breakout session frozen at 14:44 on 2026-07-16 — rooms opened
 *   14:32, a fixed 12:04 elapsed; 19 participants seeded 3-per-room across
 *   five topic rooms plus four unassigned and one empty spillover room;
 *   Dana Whitfield hosting from the main call; one seeded all-rooms
 *   broadcast at 14:38 and a 14:41 ask-for-help ping from Room 4). No
 *   clocks, Math.random, network media, or <video>.
 * @output Host-side breakout rooms manager console: a room-cards grid
 *   (per-room colored dot + topic name, a tabular per-room timer that flips
 *   between elapsed and countdown-remaining, draggable participant chips
 *   with a Move-to MoreMenu fallback, Join + per-room Message actions, a
 *   'Needs help' badge on Room 4, and an empty spillover room drawn as a
 *   dashed drop target); a left controls panel with a rooms-count stepper
 *   (2–8, removing a room returns its people to the tray), an Auto/Manual
 *   assign SegmentedControl with a shuffle Assign-all action, a duration
 *   stepper (5–60 min) that re-derives every countdown and the ends-at
 *   readout, a countdown Switch, and the unassigned-participants tray of
 *   drag-grip chips; a broadcast composer strip pinned under the grid that
 *   messages all rooms or one targeted room; and a right status column with
 *   the rooms-open elapsed readout, a per-room participants distribution
 *   mini-bar chart, the dismissable Room 4 'asked for help' Banner with a
 *   Join action, and the sent-broadcasts log. Close all rooms swaps the
 *   grid for a reopenable end-state.
 * @position Page template; emitted by `astryx template meet-breakout-manager`
 *
 * Frame: root 100dvh div wrapping Layout height="fill". LayoutHeader (56px)
 * carries the console title, meeting context, rooms-open Token, in-call
 * count, and the destructive Close-all Button (AlertDialog-confirmed).
 * LayoutPanel start 300 holds session controls above the unassigned tray;
 * only the tray list scrolls. LayoutContent (padding 0) is a column: the
 * room grid scrolls, the broadcast composer strip stays pinned below it.
 * LayoutPanel end 300 is the status column (sticky, scrolls independently).
 *
 * Responsive contract:
 * - >1200px: controls 300 | room grid (auto-fill minmax(300px, 1fr)) +
 *   pinned broadcast strip | status 300.
 * - <=1200px: the status column leaves the end slot and stacks under the
 *   room grid inside the content scroller (broadcast strip stays pinned).
 * - <=900px: the controls panel also stacks — one scrolling column of
 *   controls, tray, grid, status; the header hides the meeting-context
 *   line and wraps instead of clipping.
 * - <=640px: the room grid drops to minmax(240px, 1fr) and the broadcast
 *   strip wraps its caption under the input.
 *
 * Container policy (host-console archetype): frame-first panels and rows;
 * Cards are reserved for the room drop targets (bordered drag zones need a
 * container) and the stacked status widgets. The tray and controls are
 * plain panel rows. This is the dedicated host console for pre-assignment
 * and timers — it must NOT duplicate video-call-layout's in-call rail tab.
 *
 * Color policy: token-pure throughout — no scheme-locked stage on this
 * page. The only literals are light-dark() pairs for the five categorical
 * room-dot/bar colors (repo-standard data-viz fallbacks, since the demo
 * does not inject --color-data-categorical-*) and the amber needs-help
 * tint pair on Room 4's card edge.
 */

import {useState, type CSSProperties, type DragEvent} from 'react';

import {
  AlarmClockIcon,
  CheckIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  GripVerticalIcon,
  HandIcon,
  LogInIcon,
  MegaphoneIcon,
  MinusIcon,
  PlusIcon,
  SendIcon,
  ShuffleIcon,
  TimerIcon,
  UsersIcon,
} from 'lucide-react';

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
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SESSION CONSTANTS =============
// One frozen moment: rooms opened 14:32, "now" is 14:44:23 on 2026-07-16.
// Every readout derives from these fixed numbers — no Date.now() anywhere.

const MEETING_TITLE = 'Atlas Q3 Sprint Review';
const SESSION_DATE = 'Wed, Jul 16, 2026';
const ROOMS_OPENED_AT = '2:32 PM';
/** Minutes past midnight for 14:32 — ends-at readouts derive from this. */
const OPENED_MINUTES = 14 * 60 + 32;
/** Fixed elapsed seconds since rooms opened (12:04). */
const ELAPSED_SECONDS = 12 * 60 + 4;
const NOW_LABEL = '2:44 PM';
const HOST_NAME = 'Dana Whitfield';

/** Repo-standard data-viz fallbacks (demo injects no categorical tokens). */
const ROOM_COLORS = [
  'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
];

/** Amber needs-help pair — matches the Banner warning family. */
const HELP_EDGE = 'light-dark(#B45309, #FBBF24)';
const OVERTIME_TEXT = 'light-dark(#B91C1C, #F87171)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Footgun #6: Layout height="fill" collapses in the demo's auto-height
  // stage — the root div pins the viewport height.
  root: {height: '100dvh', width: '100%'},
  // Left panel: controls fixed on top, only the tray list scrolls.
  controlsColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  controlsSection: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
  },
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  stepperReadout: {
    display: 'inline-block',
    minWidth: 72,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  trayHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  trayScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-3) var(--spacing-3)',
  },
  // Tray doubles as the "unassign" drop zone.
  trayZone: {
    borderRadius: 'var(--radius-container)',
    border: '1.5px dashed var(--color-border)',
    padding: 'var(--spacing-2)',
    minHeight: 96,
    transition: 'border-color 120ms ease, background-color 120ms ease',
  },
  zoneDragOver: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // One draggable participant chip (tray rows and room chips share it).
  personChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: '2px var(--spacing-1)',
    borderRadius: 'var(--radius-element)',
    cursor: 'grab',
    minWidth: 0,
  },
  personChipName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Content column: grid scrolls, the broadcast strip stays pinned below.
  contentColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  gridScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  roomGridCompact: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  },
  // Room card interior: header / chips / actions share one padding grid.
  roomBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)',
    height: '100%',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
    transition: 'border-color 120ms ease, background-color 120ms ease',
  },
  roomNeedsHelp: {
    boxShadow: `inset 3px 0 0 0 ${HELP_EDGE}`,
  },
  roomDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    flexShrink: 0,
  },
  roomTimer: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  overtime: {
    color: OVERTIME_TEXT,
    fontWeight: 600,
  },
  chipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
    flex: 1,
    alignContent: 'flex-start',
  },
  // Empty spillover room: the whole card is a dashed drop affordance.
  emptyZone: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-1)',
    borderRadius: 'var(--radius-element)',
    border: '1.5px dashed var(--color-border)',
    padding: 'var(--spacing-3)',
    textAlign: 'center',
    minHeight: 72,
    transition: 'border-color 120ms ease, background-color 120ms ease',
  },
  // Broadcast composer strip pinned under the grid.
  broadcastStrip: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // Status column: sticky panel body scrolls independently (footgun #6).
  statusSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  statusStacked: {
    padding: 0,
  },
  // Distribution mini-bars: one shared px-per-person scale, labeled rows,
  // right-aligned tabular counts (footgun #10 — no axis-less charts).
  barRow: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr 24px',
    alignItems: 'center',
    columnGap: 'var(--spacing-2)',
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barCount: {
    display: 'inline-block',
    width: '100%',
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  barsLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  broadcastLogRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: '4px 0',
  },
  broadcastLogText: {
    overflowWrap: 'anywhere',
  },
  broadcastLogTime: {
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // Banner action lives under the description — endContent would squeeze
  // the text into a ~90px column inside the 300px status panel.
  bannerAction: {
    marginTop: 'var(--spacing-2)',
  },
  closedWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-6)',
  },
};

// ============= DATA =============
// Kestrel Labs roster — Atlas Q3 sprint-review breakout session. Names,
// roles, and counts stay consistent with the rest of the Office Suite.

interface Person {
  id: string;
  name: string;
  role: string;
}

const PEOPLE: Person[] = [
  {id: 'priya', name: 'Priya Raman', role: 'Product lead'},
  {id: 'grace', name: 'Grace Liu', role: 'Design'},
  {id: 'omar', name: 'Omar Haddad', role: 'Engineering'},
  {id: 'marcus', name: 'Marcus Webb', role: 'Engineering lead'},
  {id: 'hannah', name: 'Hannah Beck', role: 'Growth'},
  {id: 'nils', name: 'Nils Bergström', role: 'Engineering'},
  {id: 'sofia', name: 'Sofia Ortiz', role: 'Research'},
  {id: 'aisha', name: 'Aisha Khan', role: 'Design'},
  {id: 'leo', name: 'Leo Martins', role: 'Engineering'},
  {id: 'jonah', name: 'Jonah Fields', role: 'Program manager'},
  {id: 'june', name: 'June Park', role: 'Marketing'},
  {id: 'elena', name: 'Elena Vasquez', role: 'Sales'},
  {id: 'tom', name: 'Tom Okafor', role: 'Support lead'},
  {id: 'ines', name: 'Ines Duarte', role: 'Docs'},
  {id: 'robert', name: 'Robert Chao', role: 'Engineering'},
  {id: 'rachel', name: 'Rachel Adler', role: 'Finance'},
  {id: 'yuki', name: 'Yuki Tanaka', role: 'Design'},
  {id: 'sam', name: 'Sam Whitaker', role: 'Engineering'},
  {id: 'colin', name: 'Colin Reyes', role: 'Data'},
];

/** Atlas Q3 discussion topics, by 1-based room number. Rooms added past
 * the seeded six open as plain overflow rooms. */
const ROOM_TOPICS: Record<number, string> = {
  1: 'Onboarding funnel',
  2: 'Pricing page',
  3: 'Beta feedback',
  4: 'Launch checklist',
  5: 'Docs & support',
  6: 'Spillover',
  7: 'Overflow A',
  8: 'Overflow B',
};

const DEFAULT_ROOM_COUNT = 6;
const MIN_ROOMS = 2;
const MAX_ROOMS = 8;
const DEFAULT_DURATION_MIN = 15;
const MIN_DURATION_MIN = 5;
const MAX_DURATION_MIN = 60;
const DURATION_STEP_MIN = 5;
const HELP_ROOM = 4;
const HELP_TIME = '2:41 PM';
const HELP_ASKER = 'Jonah Fields';
const HELP_TEXT =
  'Can someone unblock the checklist-owner question? We are split on it.';

/** Seeded assignment: person id -> 1-based room number, or null = tray.
 * Rooms 1–5 hold three people each; Room 6 (Spillover) starts empty. */
const ASSIGNMENT_FIXTURE: Record<string, number | null> = {
  priya: 1,
  grace: 1,
  omar: 1,
  marcus: 2,
  hannah: 2,
  nils: 2,
  sofia: 3,
  aisha: 3,
  leo: 3,
  jonah: 4,
  june: 4,
  elena: 4,
  tom: 5,
  ines: 5,
  robert: 5,
  rachel: null,
  yuki: null,
  sam: null,
  colin: null,
};

interface BroadcastEntry {
  id: string;
  time: string;
  target: string;
  text: string;
}

const BROADCASTS_FIXTURE: BroadcastEntry[] = [
  {
    id: 'b1',
    time: '2:38 PM',
    target: 'All rooms',
    text: '5 minutes in — capture decisions in the shared Atlas Q3 doc.',
  },
];

type AssignMode = 'auto' | 'manual';

// ============= HELPERS =============
// Small derivations over the fixed session numbers — no clocks.

/** mm:ss over positive seconds. */
function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Per-room timer string at the frozen instant. Countdown mode derives
 * remaining time from the duration stepper; past-due rooms go overtime.
 */
function roomTimer(
  showCountdown: boolean,
  durationMin: number,
): {label: string; isOvertime: boolean} {
  if (!showCountdown) {
    return {label: `${formatClock(ELAPSED_SECONDS)} elapsed`, isOvertime: false};
  }
  const remaining = durationMin * 60 - ELAPSED_SECONDS;
  return remaining >= 0
    ? {label: `${formatClock(remaining)} left`, isOvertime: false}
    : {label: `+${formatClock(-remaining)} over`, isOvertime: true};
}

/** '2:47 PM' ends-at readout derived from 14:32 + duration. */
function endsAtLabel(durationMin: number): string {
  const total = OPENED_MINUTES + durationMin;
  const hours24 = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function findPerson(id: string): Person {
  return PEOPLE.find(person => person.id === id) ?? PEOPLE[0];
}

function membersOf(
  assignment: Record<string, number | null>,
  room: number | null,
): Person[] {
  return PEOPLE.filter(person => (assignment[person.id] ?? null) === room);
}

/** Round-robin the tray into the least-populated open rooms. */
function autoAssign(
  assignment: Record<string, number | null>,
  roomCount: number,
): Record<string, number | null> {
  const next = {...assignment};
  const counts: number[] = [];
  for (let room = 1; room <= roomCount; room += 1) {
    counts[room] = membersOf(assignment, room).length;
  }
  for (const person of PEOPLE) {
    if ((next[person.id] ?? null) === null) {
      let target = 1;
      for (let room = 2; room <= roomCount; room += 1) {
        if (counts[room] < counts[target]) {
          target = room;
        }
      }
      next[person.id] = target;
      counts[target] += 1;
    }
  }
  return next;
}

/** Room display name: "Room 3 · Beta feedback". */
function roomName(room: number): string {
  const topic = ROOM_TOPICS[room];
  return topic === undefined ? `Room ${room}` : `Room ${room} · ${topic}`;
}

function roomColor(room: number): string {
  return ROOM_COLORS[(room - 1) % ROOM_COLORS.length];
}

// ============= PERSON CHIP =============

interface MoveHandlers {
  onMove: (personId: string, room: number | null) => void;
  roomCount: number;
}

/**
 * One draggable participant chip: grip, Avatar, name, and a Move-to
 * MoreMenu so assignment never requires drag (touch/keyboard fallback).
 * Used by both the unassigned tray and the room cards.
 */
function PersonChip({
  person,
  currentRoom,
  handlers,
}: {
  person: Person;
  currentRoom: number | null;
  handlers: MoveHandlers;
}) {
  const menuItems = [
    ...Array.from({length: handlers.roomCount}, (_, index) => {
      const room = index + 1;
      return {
        label: `Move to ${roomName(room)}`,
        icon:
          currentRoom === room ? (
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          ) : (
            <Icon icon={DoorOpenIcon} size="sm" color="inherit" />
          ),
        isDisabled: currentRoom === room,
        onClick: () => handlers.onMove(person.id, room),
      };
    }),
    {
      label: 'Return to unassigned',
      icon: <Icon icon={UsersIcon} size="sm" color="inherit" />,
      isDisabled: currentRoom === null,
      onClick: () => handlers.onMove(person.id, null),
    },
  ];

  return (
    <div
      style={styles.personChip}
      draggable
      aria-label={`${person.name}, ${
        currentRoom === null ? 'unassigned' : roomName(currentRoom)
      }`}
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('text/plain', person.id);
        event.dataTransfer.effectAllowed = 'move';
      }}>
      <Icon icon={GripVerticalIcon} size="sm" color="disabled" />
      <Avatar name={person.name} size="xsmall" />
      <Tooltip content={`${person.name} · ${person.role}`}>
        <Text type="supporting" size="sm" style={styles.personChipName}>
          {person.name}
        </Text>
      </Tooltip>
      <MoreMenu
        label={`Move ${person.name}`}
        variant="ghost"
        size="sm"
        items={menuItems}
      />
    </div>
  );
}

// ============= ROOM CARD =============

interface DropZoneProps {
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

/** Shared HTML5 drop-target wiring for rooms and the tray. */
function dropZoneProps(
  zone: number | null,
  setDragOverZone: (zone: number | 'tray' | null) => void,
  onMove: (personId: string, room: number | null) => void,
): DropZoneProps {
  const zoneKey = zone ?? 'tray';
  return {
    onDragOver: event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDragOverZone(zoneKey);
    },
    onDragLeave: () => setDragOverZone(null),
    onDrop: event => {
      event.preventDefault();
      const personId = event.dataTransfer.getData('text/plain');
      if (personId.length > 0) {
        onMove(personId, zone);
      }
      setDragOverZone(null);
    },
  };
}

/**
 * One breakout room card: colored topic dot, per-room timer, draggable
 * member chips (dashed drop affordance when empty), and a Join +
 * per-room Message action row. Room 4 carries the needs-help edge and
 * Badge until the alert is handled.
 */
function RoomCard({
  room,
  members,
  timer,
  needsHelp,
  isJoined,
  isDragOver,
  zoneProps,
  moveHandlers,
  onJoin,
  onTargetMessage,
}: {
  room: number;
  members: Person[];
  timer: {label: string; isOvertime: boolean};
  needsHelp: boolean;
  isJoined: boolean;
  isDragOver: boolean;
  zoneProps: DropZoneProps;
  moveHandlers: MoveHandlers;
  onJoin: (room: number) => void;
  onTargetMessage: (room: number) => void;
}) {
  const bodyStyle: CSSProperties = {
    ...styles.roomBody,
    ...(needsHelp ? styles.roomNeedsHelp : undefined),
    ...(isDragOver ? styles.zoneDragOver : undefined),
  };
  const timerStyle: CSSProperties = {
    ...styles.roomTimer,
    ...(timer.isOvertime ? styles.overtime : undefined),
  };

  return (
    <Card padding={0}>
      <div
        style={bodyStyle}
        aria-label={`${roomName(room)}, ${members.length} participants`}
        {...zoneProps}>
        <HStack gap={2} vAlign="center">
          <span style={{...styles.roomDot, backgroundColor: roomColor(room)}} />
          <StackItem size="fill">
            <Text type="label" size="sm" style={styles.personChipName}>
              {roomName(room)}
            </Text>
          </StackItem>
          {needsHelp && (
            <Badge
              label="Needs help"
              variant="warning"
              icon={<Icon icon={HandIcon} size="xsm" color="inherit" />}
            />
          )}
          <Tooltip
            content={
              timer.isOvertime
                ? 'Past the session duration'
                : 'Time derives from the duration stepper'
            }>
            <Text type="supporting" size="xsm" color="secondary">
              <span style={timerStyle}>{timer.label}</span>
            </Text>
          </Tooltip>
        </HStack>

        {members.length === 0 ? (
          <div style={styles.emptyZone}>
            <Icon icon={DoorOpenIcon} size="md" color="secondary" />
            <Text type="supporting" size="xsm" color="secondary">
              Empty room — drag people here, or use Assign all
            </Text>
          </div>
        ) : (
          <div style={styles.chipWrap}>
            {members.map(member => (
              <PersonChip
                key={member.id}
                person={member}
                currentRoom={room}
                handlers={moveHandlers}
              />
            ))}
          </div>
        )}

        <HStack gap={2} vAlign="center">
          <HStack gap={1} vAlign="center">
            <Icon icon={UsersIcon} size="xsm" color="secondary" />
            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
              {members.length}
            </Text>
          </HStack>
          <StackItem size="fill" />
          <Tooltip content={`Prefill the broadcast strip for ${roomName(room)}`}>
            <IconButton
              label={`Message ${roomName(room)}`}
              icon={<Icon icon={MegaphoneIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => onTargetMessage(room)}
            />
          </Tooltip>
          <Button
            label={isJoined ? 'Leave room' : 'Join'}
            variant={isJoined ? 'primary' : 'secondary'}
            size="sm"
            icon={<Icon icon={LogInIcon} size="sm" color="inherit" />}
            onClick={() => onJoin(room)}
          />
        </HStack>
      </div>
    </Card>
  );
}

// ============= CONTROLS =============

/** Minus / readout / plus stepper row with a leading label. */
function StepperControl({
  label,
  readout,
  decrementLabel,
  incrementLabel,
  canDecrement,
  canIncrement,
  onDecrement,
  onIncrement,
}: {
  label: string;
  readout: string;
  decrementLabel: string;
  incrementLabel: string;
  canDecrement: boolean;
  canIncrement: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <Text type="label" size="sm">
          {label}
        </Text>
      </StackItem>
      <div style={styles.stepperRow}>
        <IconButton
          label={decrementLabel}
          icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
          variant="secondary"
          size="sm"
          isDisabled={!canDecrement}
          onClick={onDecrement}
        />
        <Text type="body" size="sm" hasTabularNumbers>
          <span style={styles.stepperReadout}>{readout}</span>
        </Text>
        <IconButton
          label={incrementLabel}
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          variant="secondary"
          size="sm"
          isDisabled={!canIncrement}
          onClick={onIncrement}
        />
      </div>
    </HStack>
  );
}

/**
 * Session controls: rooms-count stepper, Auto/Manual assign mode,
 * duration stepper (drives every countdown + the ends-at readout), and
 * the countdown display Switch. Auto mode surfaces the Assign-all action.
 */
function ControlsSection({
  roomCount,
  onRoomCountChange,
  assignMode,
  onAssignModeChange,
  durationMin,
  onDurationChange,
  showCountdown,
  onCountdownChange,
  unassignedCount,
  onAssignAll,
}: {
  roomCount: number;
  onRoomCountChange: (delta: number) => void;
  assignMode: AssignMode;
  onAssignModeChange: (mode: AssignMode) => void;
  durationMin: number;
  onDurationChange: (delta: number) => void;
  showCountdown: boolean;
  onCountdownChange: (value: boolean) => void;
  unassignedCount: number;
  onAssignAll: () => void;
}) {
  return (
    <VStack gap={3} style={styles.controlsSection}>
      <Text type="label" size="sm" color="secondary">
        Session controls
      </Text>
      <StepperControl
        label="Rooms"
        readout={`${roomCount} rooms`}
        decrementLabel="Remove a room"
        incrementLabel="Add a room"
        canDecrement={roomCount > MIN_ROOMS}
        canIncrement={roomCount < MAX_ROOMS}
        onDecrement={() => onRoomCountChange(-1)}
        onIncrement={() => onRoomCountChange(1)}
      />
      <StepperControl
        label="Duration"
        readout={`${durationMin} min`}
        decrementLabel="Shorten duration by 5 minutes"
        incrementLabel="Extend duration by 5 minutes"
        canDecrement={durationMin > MIN_DURATION_MIN}
        canIncrement={durationMin < MAX_DURATION_MIN}
        onDecrement={() => onDurationChange(-DURATION_STEP_MIN)}
        onIncrement={() => onDurationChange(DURATION_STEP_MIN)}
      />
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm">
            Assignment
          </Text>
        </StackItem>
        <SegmentedControl
          label="Assignment mode"
          size="sm"
          value={assignMode}
          onChange={value => onAssignModeChange(value as AssignMode)}>
          <SegmentedControlItem value="auto" label="Auto" />
          <SegmentedControlItem value="manual" label="Manual" />
        </SegmentedControl>
      </HStack>
      {assignMode === 'auto' && (
        <Button
          label={
            unassignedCount === 0
              ? 'Everyone is assigned'
              : `Assign all (${unassignedCount})`
          }
          variant="secondary"
          size="sm"
          icon={<Icon icon={ShuffleIcon} size="sm" color="inherit" />}
          isDisabled={unassignedCount === 0}
          onClick={onAssignAll}
        />
      )}
      <Switch
        label="Show countdown"
        labelPosition="start"
        value={showCountdown}
        onChange={onCountdownChange}
      />
    </VStack>
  );
}

/**
 * Unassigned-participants tray: a dashed drop zone of drag-grip chips.
 * Dropping a chip here returns that person to the pool.
 */
function TraySection({
  unassigned,
  isDragOver,
  zoneProps,
  moveHandlers,
}: {
  unassigned: Person[];
  isDragOver: boolean;
  zoneProps: DropZoneProps;
  moveHandlers: MoveHandlers;
}) {
  return (
    <>
      <div style={styles.trayHeader}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" size="sm">
              Unassigned
            </Text>
          </StackItem>
          <Badge label={String(unassigned.length)} variant="neutral" />
        </HStack>
      </div>
      <div style={styles.trayScroll}>
        <div
          style={{
            ...styles.trayZone,
            ...(isDragOver ? styles.zoneDragOver : undefined),
          }}
          aria-label={`Unassigned participants, ${unassigned.length}`}
          {...zoneProps}>
          {unassigned.length === 0 ? (
            <Text type="supporting" size="xsm" color="secondary">
              Everyone is in a room. Drop a chip here to pull someone back to
              the main call.
            </Text>
          ) : (
            <VStack gap={0}>
              {unassigned.map(person => (
                <PersonChip
                  key={person.id}
                  person={person}
                  currentRoom={null}
                  handlers={moveHandlers}
                />
              ))}
            </VStack>
          )}
        </div>
      </div>
    </>
  );
}

// ============= STATUS COLUMN =============

/**
 * Right status column: rooms-open elapsed readout, the per-room
 * participants distribution mini-bars (shared per-person scale, labeled
 * rows, right-aligned tabular counts), the Room 4 ask-for-help Banner,
 * and the sent-broadcasts log.
 */
function StatusColumn({
  roomCount,
  assignment,
  durationMin,
  helpOpen,
  onHelpDismiss,
  onJoinHelpRoom,
  broadcasts,
  isStacked,
}: {
  roomCount: number;
  assignment: Record<string, number | null>;
  durationMin: number;
  helpOpen: boolean;
  onHelpDismiss: () => void;
  onJoinHelpRoom: () => void;
  broadcasts: BroadcastEntry[];
  isStacked: boolean;
}) {
  const counts = Array.from({length: roomCount}, (_, index) =>
    membersOf(assignment, index + 1).length,
  );
  const maxCount = Math.max(1, ...counts);
  const assignedTotal = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div style={isStacked ? styles.statusStacked : styles.statusSticky}>
      <VStack gap={3}>
        {helpOpen && (
          <Banner
            status="warning"
            title={`Room ${HELP_ROOM} asked for help`}
            description={
              <>
                {`${HELP_ASKER} · ${HELP_TIME} — “${HELP_TEXT}”`}
                <div style={styles.bannerAction}>
                  <Button
                    label={`Join Room ${HELP_ROOM}`}
                    variant="secondary"
                    size="sm"
                    onClick={onJoinHelpRoom}
                  />
                </div>
              </>
            }
            icon={<Icon icon={HandIcon} size="sm" color="inherit" />}
            isDismissable
            onDismiss={onHelpDismiss}
          />
        )}

        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={TimerIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <Text type="label" size="sm">
                  Rooms open
                </Text>
              </StackItem>
              <Text type="body" size="sm" hasTabularNumbers>
                <span style={styles.roomTimer}>
                  {formatClock(ELAPSED_SECONDS)}
                </span>
              </Text>
            </HStack>
            <Divider />
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" size="xsm" color="secondary">
                  Opened {ROOMS_OPENED_AT} · {SESSION_DATE}
                </Text>
              </StackItem>
            </HStack>
            <HStack gap={2} vAlign="center">
              <Icon icon={AlarmClockIcon} size="xsm" color="secondary" />
              <StackItem size="fill">
                <Text type="supporting" size="xsm" color="secondary">
                  {durationMin}-min session ends
                </Text>
              </StackItem>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                {endsAtLabel(durationMin)}
              </Text>
            </HStack>
          </VStack>
        </Card>

        <Card padding={3}>
          <VStack gap={2}>
            <div style={styles.barsLegend}>
              <Text type="label" size="sm">
                Distribution
              </Text>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                {assignedTotal} in rooms
              </Text>
            </div>
            {counts.map((count, index) => {
              const room = index + 1;
              return (
                <div key={room} style={styles.barRow}>
                  <Text type="supporting" size="xsm" color="secondary">
                    Room {room}
                  </Text>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: roomColor(room),
                      }}
                    />
                  </div>
                  <Text type="supporting" size="xsm" hasTabularNumbers>
                    <span style={styles.barCount}>{count}</span>
                  </Text>
                </div>
              );
            })}
            <Text type="supporting" size="xsm" color="secondary">
              Bar length = people per room (max {maxCount})
            </Text>
          </VStack>
        </Card>

        <Card padding={3}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <Icon icon={MegaphoneIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <Text type="label" size="sm">
                  Broadcasts sent
                </Text>
              </StackItem>
              <Badge label={String(broadcasts.length)} variant="neutral" />
            </HStack>
            {broadcasts.map(entry => (
              <div key={entry.id} style={styles.broadcastLogRow}>
                <Text
                  type="supporting"
                  size="xsm"
                  color="secondary"
                  style={styles.broadcastLogTime}>
                  {entry.time}
                </Text>
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="label" size="xsm" color="secondary">
                      {entry.target}
                    </Text>
                    <Text
                      type="supporting"
                      size="xsm"
                      style={styles.broadcastLogText}>
                      {entry.text}
                    </Text>
                  </VStack>
                </StackItem>
              </div>
            ))}
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

// ============= BROADCAST STRIP =============

/**
 * Broadcast composer pinned under the room grid. Defaults to all open
 * rooms; a per-room Message action retargets it and the Token clears
 * back to everyone.
 */
function BroadcastStrip({
  draft,
  onDraftChange,
  onSend,
  targetRoom,
  onClearTarget,
  roomCount,
  isCompact,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  targetRoom: number | null;
  onClearTarget: () => void;
  roomCount: number;
  isCompact: boolean;
}) {
  const targetLabel =
    targetRoom === null ? `All ${roomCount} rooms` : roomName(targetRoom);

  return (
    <div style={styles.broadcastStrip}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
          <Token
            label={targetLabel}
            size="sm"
            color={targetRoom === null ? undefined : 'blue'}
            icon={<Icon icon={MegaphoneIcon} size="xsm" color="inherit" />}
            onRemove={targetRoom === null ? undefined : onClearTarget}
          />
          <StackItem size="fill">
            <TextInput
              label={`Broadcast to ${targetLabel}`}
              isLabelHidden
              size="md"
              width="100%"
              placeholder={`Broadcast a message to ${targetLabel.toLowerCase()}…`}
              value={draft}
              onChange={onDraftChange}
              onEnter={onSend}
            />
          </StackItem>
          <Button
            label="Broadcast"
            variant="primary"
            size="md"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            isDisabled={draft.trim().length === 0}
            onClick={onSend}
          />
        </HStack>
        <Text type="supporting" size="xsm" color="secondary">
          Appears as a banner inside {targetLabel.toLowerCase()} — participants
          cannot reply here.
        </Text>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function MeetBreakoutManagerTemplate() {
  const [assignment, setAssignment] =
    useState<Record<string, number | null>>(ASSIGNMENT_FIXTURE);
  const [roomCount, setRoomCount] = useState(DEFAULT_ROOM_COUNT);
  const [assignMode, setAssignMode] = useState<AssignMode>('manual');
  const [durationMin, setDurationMin] = useState(DEFAULT_DURATION_MIN);
  const [showCountdown, setShowCountdown] = useState(true);
  const [dragOverZone, setDragOverZone] = useState<number | 'tray' | null>(null);
  const [joinedRoom, setJoinedRoom] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(true);
  const [broadcasts, setBroadcasts] = useState(BROADCASTS_FIXTURE);
  const [broadcastDraft, setBroadcastDraft] = useState('');
  const [targetRoom, setTargetRoom] = useState<number | null>(null);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [roomsClosed, setRoomsClosed] = useState(false);

  // Responsive contract: <=1200px the status column stacks under the grid;
  // <=900px the controls panel stacks too; <=640px the grid tightens.
  const isStatusStacked = useMediaQuery('(max-width: 1200px)');
  const isSinglePane = useMediaQuery('(max-width: 900px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Derived during render — no effects (state is the assignment map).
  const unassigned = membersOf(assignment, null);
  const assignedTotal = PEOPLE.length - unassigned.length;
  const timer = roomTimer(showCountdown, durationMin);
  const rooms = Array.from({length: roomCount}, (_, index) => index + 1);

  const movePerson = (personId: string, room: number | null) => {
    setAssignment(prev => ({...prev, [personId]: room}));
  };

  const changeRoomCount = (delta: number) => {
    if (delta > 0) {
      setRoomCount(prev => Math.min(MAX_ROOMS, prev + 1));
      return;
    }
    // Removing a room returns its members to the unassigned tray.
    const removed = roomCount;
    setAssignment(prev => {
      const next = {...prev};
      for (const person of PEOPLE) {
        if (next[person.id] === removed) {
          next[person.id] = null;
        }
      }
      return next;
    });
    setJoinedRoom(prev => (prev === removed ? null : prev));
    setTargetRoom(prev => (prev === removed ? null : prev));
    setRoomCount(prev => Math.max(MIN_ROOMS, prev - 1));
  };

  const changeDuration = (deltaMin: number) => {
    setDurationMin(prev =>
      Math.min(MAX_DURATION_MIN, Math.max(MIN_DURATION_MIN, prev + deltaMin)),
    );
  };

  const assignAll = () => {
    setAssignment(prev => autoAssign(prev, roomCount));
  };

  const toggleJoin = (room: number) => {
    setJoinedRoom(prev => (prev === room ? null : room));
    if (room === HELP_ROOM) {
      setHelpOpen(false);
    }
  };

  const joinHelpRoom = () => {
    setJoinedRoom(HELP_ROOM);
    setHelpOpen(false);
  };

  const sendBroadcast = () => {
    const text = broadcastDraft.trim();
    if (text.length === 0) {
      return;
    }
    const target = targetRoom === null ? 'All rooms' : roomName(targetRoom);
    setBroadcasts(prev => [
      ...prev,
      {id: `b${prev.length + 1}`, time: NOW_LABEL, target, text},
    ]);
    setBroadcastDraft('');
    setTargetRoom(null);
  };

  const moveHandlers: MoveHandlers = {onMove: movePerson, roomCount};

  const controlsAndTray = (
    <div style={styles.controlsColumn}>
      <ControlsSection
        roomCount={roomCount}
        onRoomCountChange={changeRoomCount}
        assignMode={assignMode}
        onAssignModeChange={setAssignMode}
        durationMin={durationMin}
        onDurationChange={changeDuration}
        showCountdown={showCountdown}
        onCountdownChange={setShowCountdown}
        unassignedCount={unassigned.length}
        onAssignAll={assignAll}
      />
      <Divider />
      <TraySection
        unassigned={unassigned}
        isDragOver={dragOverZone === 'tray'}
        zoneProps={dropZoneProps(null, setDragOverZone, movePerson)}
        moveHandlers={moveHandlers}
      />
    </div>
  );

  const roomGrid = (
    <div
      style={{
        ...styles.roomGrid,
        ...(isCompact ? styles.roomGridCompact : undefined),
      }}>
      {rooms.map(room => (
        <RoomCard
          key={room}
          room={room}
          members={membersOf(assignment, room)}
          timer={timer}
          needsHelp={helpOpen && room === HELP_ROOM}
          isJoined={joinedRoom === room}
          isDragOver={dragOverZone === room}
          zoneProps={dropZoneProps(room, setDragOverZone, movePerson)}
          moveHandlers={moveHandlers}
          onJoin={toggleJoin}
          onTargetMessage={setTargetRoom}
        />
      ))}
    </div>
  );

  const statusColumn = (
    <StatusColumn
      roomCount={roomCount}
      assignment={assignment}
      durationMin={durationMin}
      helpOpen={helpOpen}
      onHelpDismiss={() => setHelpOpen(false)}
      onJoinHelpRoom={joinHelpRoom}
      broadcasts={broadcasts}
      isStacked={isStatusStacked}
    />
  );

  const closedState = (
    <div style={styles.closedWrap}>
      <EmptyState
        icon={<Icon icon={DoorClosedIcon} size="lg" />}
        title="Breakout rooms closed"
        description={`Everyone returned to ${MEETING_TITLE} at ${NOW_LABEL}. Assignments are kept, so reopening restores all ${roomCount} rooms.`}
        actions={
          <Button
            label="Reopen rooms"
            variant="primary"
            icon={<Icon icon={DoorOpenIcon} size="sm" color="inherit" />}
            onClick={() => setRoomsClosed(false)}
          />
        }
      />
    </div>
  );

  const contentColumn = (
    <div style={styles.contentColumn}>
      {roomsClosed ? (
        closedState
      ) : (
        <div style={styles.gridScroll}>
          <VStack gap={3}>
            {isSinglePane && (
              <>
                {controlsAndTray}
                <Divider />
              </>
            )}
            {roomGrid}
            {isStatusStacked && statusColumn}
          </VStack>
        </div>
      )}
      {!roomsClosed && (
        <BroadcastStrip
          draft={broadcastDraft}
          onDraftChange={setBroadcastDraft}
          onSend={sendBroadcast}
          targetRoom={targetRoom}
          onClearTarget={() => setTargetRoom(null)}
          roomCount={roomCount}
          isCompact={isCompact}
        />
      )}
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>Breakout rooms</Heading>
                  {!isSinglePane && (
                    <Text type="supporting" color="secondary">
                      {MEETING_TITLE} · Hosted by {HOST_NAME}
                    </Text>
                  )}
                  <Token
                    label={
                      roomsClosed
                        ? 'Rooms closed'
                        : `Open · ${formatClock(ELAPSED_SECONDS)}`
                    }
                    size="sm"
                    color={roomsClosed ? undefined : 'green'}
                    icon={<Icon icon={TimerIcon} size="xsm" color="inherit" />}
                  />
                  <HStack gap={1} vAlign="center">
                    <Icon icon={UsersIcon} size="sm" color="secondary" />
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {assignedTotal} in rooms · {unassigned.length} unassigned
                    </Text>
                  </HStack>
                  {joinedRoom !== null && (
                    <Token
                      label={`You are in Room ${joinedRoom}`}
                      size="sm"
                      color="blue"
                      icon={
                        <Icon icon={DoorOpenIcon} size="xsm" color="inherit" />
                      }
                      onRemove={() => setJoinedRoom(null)}
                    />
                  )}
                </HStack>
              </StackItem>
              <Button
                label="Close all rooms"
                variant="destructive"
                size="sm"
                icon={<Icon icon={DoorClosedIcon} size="sm" color="inherit" />}
                isDisabled={roomsClosed}
                onClick={() => setIsCloseConfirmOpen(true)}
              />
            </HStack>
          </LayoutHeader>
        }
        start={
          isSinglePane ? undefined : (
            <LayoutPanel
              width={300}
              padding={0}
              hasDivider
              label="Session controls and unassigned tray">
              {controlsAndTray}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            {contentColumn}
            <AlertDialog
              isOpen={isCloseConfirmOpen}
              onOpenChange={setIsCloseConfirmOpen}
              title="Close all breakout rooms?"
              description={`Participants get a 30-second warning, then everyone returns to ${MEETING_TITLE}. Room assignments are kept for reopening.`}
              cancelLabel="Keep rooms open"
              actionLabel="Close all rooms"
              actionVariant="destructive"
              onAction={() => {
                setIsCloseConfirmOpen(false);
                setRoomsClosed(true);
                setJoinedRoom(null);
              }}
            />
          </LayoutContent>
        }
        end={
          isStatusStacked || roomsClosed ? undefined : (
            <LayoutPanel
              width={300}
              padding={0}
              hasDivider
              label="Session status">
              {statusColumn}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
