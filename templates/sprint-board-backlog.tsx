// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one active sprint for a wallet product
 *   team: a 40-point capacity, a fixed "4 of 10 days left" countdown, five
 *   team members, eleven committed stories spread across four board columns,
 *   and a ranked eight-story backlog — every story carries fixed estimate
 *   points, an assignee, a priority, an epic token, and an optional blocked
 *   flag; no clocks, randomness, or network assets)
 * @output Sprint execution surface: left backlog rail with per-story
 *   estimate points and add-to-sprint actions; a four-column story board
 *   (To do / In progress / In review / Done) of ClickableCard tiles showing
 *   points, assignee Avatar, priority icon, and a Blocked badge; a sprint
 *   header with a committed-vs-capacity ProgressBar meter, a days-remaining
 *   Badge, and an assignee filter Selector
 * @position Page template; emitted by `astryx template sprint-board-backlog`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * sprint title + goal caption, the days-remaining Badge, the capacity
 * meter (committed vs capacity points), the assignee filter Selector, and
 * the "New story" primary action. The `start` slot docks a 300px backlog
 * LayoutPanel (rail header pinned, story list scrolls). LayoutContent
 * (padding 0) is a single horizontal scroller of fixed-width board columns.
 *
 * Container policy (sprint-board archetype): the page chrome is
 * frame-first — panels and dense rows everywhere except the board itself,
 * where each story is a ClickableCard tile (cards are the correct
 * container for draggable, self-contained work items). The backlog rail
 * uses plain divided rows, not cards, so the rail reads as a ranked queue
 * rather than a second board.
 *
 * Interaction contract:
 * - Story→location assignment (backlog or one of the four columns) lives
 *   in useState, so adding to the sprint, moving between columns, and
 *   sending back to the backlog all re-render the board, the rail, and
 *   the capacity meter together.
 * - Backlog rows carry an "Add to sprint" action that drops the story
 *   into To do and folds its points into the committed total; the meter
 *   flips accent → warning at 90% and → error (plus an "Over by N pts"
 *   Badge) past capacity, so overcommitting is visible at the moment it
 *   happens.
 * - Menu path (always available, keyboard + touch accessible): each card
 *   carries a MoreMenu with "Move to <column>" items for the other three
 *   columns, "Send to backlog", and a Mark blocked / Unblock toggle.
 *   ClickableCard's accessible trigger is a hidden sibling, so the nested
 *   menu never fights the card's click.
 * - Pointer path: native HTML5 drag-and-drop — cards are draggable,
 *   columns highlight while a drag hovers them. Fine-pointer only.
 * - The assignee Selector filters both the board columns and the backlog
 *   rail; committed points always count every committed story so the
 *   meter never lies while a filter is active.
 * - Every mutation is announced through a visually-hidden aria-live
 *   region ("Moved <story> to <column>", "Added <story> to sprint — 37 of
 *   40 pts committed", …).
 *
 * Responsive contract:
 * - Header chrome shares one HStack with wrap="wrap": on wide viewports
 *   title + goal, days-remaining Badge, capacity meter, assignee filter,
 *   and "New story" sit on one row; at narrow widths the controls wrap
 *   below the title instead of clipping. The goal caption hides and the
 *   meter stretches to the full row width at <=640px.
 * - >640px: the backlog docks as a 300px start LayoutPanel.
 * - <=640px: single-pane fallback — the panel undocks and a ~40px
 *   backlog toggle IconButton appears in the header; it swaps the content
 *   region between the backlog list and the board so whichever surface is
 *   showing always fills the width.
 * - >768px: four 300px columns in a horizontal scroller (overflow-x
 *   auto); columns never shrink, the row scrolls.
 * - <=768px: columns are 85vw with scroll-snap (x mandatory) so each
 *   swipe lands on exactly one column.
 * - Each column's card list scrolls vertically and independently; the
 *   column header row stays pinned above its list.
 * - Drag-and-drop is enabled only for fine pointers with hover
 *   ("(hover: hover) and (pointer: fine)") so draggable cards never
 *   interfere with touch scrolling; touch users move cards through the
 *   per-card MoreMenu, which upsizes from "sm" to "lg" when drag is
 *   unavailable. The backlog "Add to sprint" IconButton upsizes the same
 *   way, so both primary actions keep ~40px tap targets on touch. No
 *   interaction is hover-only.
 */

import {useCallback, useMemo, useState, type CSSProperties} from 'react';

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
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon, type IconColor} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpIcon,
  EllipsisIcon,
  EqualIcon,
  InboxIcon,
  KanbanIcon,
  ListTodoIcon,
  OctagonAlertIcon,
  PlusIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  board: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    height: '100%',
    overflowX: 'auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  boardSnap: {
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 'var(--spacing-4)',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    minHeight: 0,
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  columnSnap: {
    scrollSnapAlign: 'start',
  },
  columnHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-2) var(--spacing-1)',
  },
  columnBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-2)',
  },
  columnEmpty: {
    padding: 'var(--spacing-4) 0',
  },
  columnDropTarget: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--color-accent-muted)',
  },
  cardDragging: {
    opacity: 0.5,
  },
  // Backlog rail: pinned header, independently scrolling ranked list.
  backlogPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  backlogHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
    borderBottom: '1px solid var(--color-divider)',
  },
  backlogList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  backlogRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: '1px solid var(--color-divider)',
  },
  backlogEmpty: {
    padding: 'var(--spacing-6) var(--spacing-3)',
  },
  // Capacity meter: fixed width in the desktop header row; stretches to
  // the full wrapped row on phones so the bar stays readable.
  meterBlock: {
    width: 220,
  },
  meterBlockFill: {
    width: '100%',
  },
  // Priority glyphs sit inline with card titles; the wrapper keeps the
  // icon from collapsing when titles wrap to two lines.
  priorityGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    paddingTop: 2,
  },
  // <=640px: the backlog toggle is the only way to reach the rail, so it
  // keeps a ~40px tap target.
  iconTapTarget: {
    width: 40,
    height: 40,
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

type Priority = 'urgent' | 'high' | 'medium' | 'low';
type ColumnId = 'todo' | 'in-progress' | 'in-review' | 'done';
type StoryLocation = ColumnId | 'backlog';
type TokenColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'pink';

interface Story {
  id: string;
  title: string;
  summary: string;
  /** Estimate in story points (Fibonacci-ish; fixed fixture values). */
  points: number;
  priority: Priority;
  assignee: string;
  epic: {label: string; color: TokenColor};
  /** Seeds the blocked set; toggled live via each card's MoreMenu. */
  isBlocked?: boolean;
  location: StoryLocation;
}

const SPRINT = {
  name: 'Sprint 27',
  goal: 'Ship wallet top-ups end to end',
  dateRange: 'Jun 22 – Jul 3',
  capacityPoints: 40,
  daysRemaining: 4,
  lengthDays: 10,
};

const TEAM = [
  'Nadia Osei',
  'Felix Grant',
  'Imani Brooks',
  'Diego Vela',
  'Harper Lin',
];

const ASSIGNEE_OPTIONS = [
  {value: 'all', label: 'All assignees'},
  ...TEAM.map(name => ({value: name, label: name})),
];

const COLUMNS: ReadonlyArray<{id: ColumnId; title: string}> = [
  {id: 'todo', title: 'To do'},
  {id: 'in-progress', title: 'In progress'},
  {id: 'in-review', title: 'In review'},
  {id: 'done', title: 'Done'},
];

const PRIORITY_META: Record<
  Priority,
  {icon: typeof ChevronUpIcon; color: IconColor; label: string}
> = {
  urgent: {icon: ChevronsUpIcon, color: 'error', label: 'Urgent priority'},
  high: {icon: ChevronUpIcon, color: 'orange', label: 'High priority'},
  medium: {icon: EqualIcon, color: 'secondary', label: 'Medium priority'},
  low: {icon: ChevronDownIcon, color: 'accent', label: 'Low priority'},
};

// Committed stories total 34 pts against a 40 pt capacity, so adding one
// mid-sized backlog story keeps the meter accent/warning and adding two
// pushes it over — both meter states are reachable in a couple of taps.
const STORIES: Story[] = [
  // To do (13 pts)
  {
    id: 'AUR-231',
    title: 'Top-up amount presets',
    summary: 'Quick-pick chips for $10 / $25 / $50 plus a custom field.',
    points: 5,
    priority: 'high',
    assignee: 'Nadia Osei',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'todo',
  },
  {
    id: 'AUR-234',
    title: 'Card art picker',
    summary: 'Let users choose a gradient for their virtual card.',
    points: 3,
    priority: 'low',
    assignee: 'Harper Lin',
    epic: {label: 'cards', color: 'teal'},
    location: 'todo',
  },
  {
    id: 'AUR-236',
    title: 'Rename saved payees',
    summary: 'Inline edit for payee nicknames in the send flow.',
    points: 2,
    priority: 'medium',
    assignee: 'Diego Vela',
    epic: {label: 'payments', color: 'blue'},
    location: 'todo',
  },
  {
    id: 'AUR-238',
    title: 'Top-up receipt email',
    summary: 'Transactional email with fee breakdown after each top-up.',
    points: 3,
    priority: 'high',
    assignee: 'Felix Grant',
    epic: {label: 'top-ups', color: 'purple'},
    isBlocked: true,
    location: 'todo',
  },
  // In progress (10 pts)
  {
    id: 'AUR-224',
    title: 'Bank-link top-up flow',
    summary: 'ACH pull from a linked account with a 3-day settle banner.',
    points: 5,
    priority: 'urgent',
    assignee: 'Nadia Osei',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'in-progress',
  },
  {
    id: 'AUR-227',
    title: 'Velocity limits service',
    summary: 'Per-user daily and weekly top-up ceilings with overrides.',
    points: 3,
    priority: 'urgent',
    assignee: 'Imani Brooks',
    epic: {label: 'risk', color: 'orange'},
    isBlocked: true,
    location: 'in-progress',
  },
  {
    id: 'AUR-229',
    title: 'Failed top-up retry sheet',
    summary: 'Recovery sheet with the decline reason and a retry CTA.',
    points: 2,
    priority: 'medium',
    assignee: 'Diego Vela',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'in-progress',
  },
  // In review (6 pts)
  {
    id: 'AUR-219',
    title: 'Debit card top-up form',
    summary: 'PAN entry with network detection and instant funding.',
    points: 3,
    priority: 'high',
    assignee: 'Felix Grant',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'in-review',
  },
  {
    id: 'AUR-221',
    title: 'Balance header animation',
    summary: 'Counter tween when the balance changes after funding.',
    points: 3,
    priority: 'low',
    assignee: 'Harper Lin',
    epic: {label: 'growth', color: 'green'},
    location: 'in-review',
  },
  // Done (5 pts) — none assigned to Imani Brooks, so filtering by her
  // empties this column and exercises the EmptyState.
  {
    id: 'AUR-212',
    title: 'Top-up fee calculator',
    summary: 'Shared fee/quote module used by every funding source.',
    points: 2,
    priority: 'high',
    assignee: 'Diego Vela',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'done',
  },
  {
    id: 'AUR-215',
    title: 'Funding source switcher',
    summary: 'Bottom sheet listing cards and linked banks.',
    points: 3,
    priority: 'medium',
    assignee: 'Nadia Osei',
    epic: {label: 'payments', color: 'blue'},
    location: 'done',
  },
  // Backlog (ranked; 33 pts total)
  {
    id: 'AUR-240',
    title: 'Apple Pay top-ups',
    summary: 'In-sheet PassKit flow as a third funding source.',
    points: 8,
    priority: 'high',
    assignee: 'Felix Grant',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'backlog',
  },
  {
    id: 'AUR-241',
    title: 'Recurring top-up schedule',
    summary: 'Weekly or monthly auto-funding with a pause control.',
    points: 5,
    priority: 'high',
    assignee: 'Nadia Osei',
    epic: {label: 'top-ups', color: 'purple'},
    location: 'backlog',
  },
  {
    id: 'AUR-242',
    title: 'Low-balance nudge',
    summary: 'Push notification when the balance dips under a threshold.',
    points: 3,
    priority: 'medium',
    assignee: 'Harper Lin',
    epic: {label: 'growth', color: 'green'},
    location: 'backlog',
  },
  {
    id: 'AUR-243',
    title: 'Dispute intake form',
    summary: 'Structured reason codes feeding the risk queue.',
    points: 5,
    priority: 'urgent',
    assignee: 'Imani Brooks',
    epic: {label: 'risk', color: 'orange'},
    location: 'backlog',
  },
  {
    id: 'AUR-244',
    title: 'Card freeze from list row',
    summary: 'Swipe action to freeze a card without opening detail.',
    points: 2,
    priority: 'medium',
    assignee: 'Diego Vela',
    epic: {label: 'cards', color: 'teal'},
    location: 'backlog',
  },
  {
    id: 'AUR-245',
    title: 'Referral reward ledger',
    summary: 'Ledger entries and history rows for referral credits.',
    points: 5,
    priority: 'low',
    assignee: 'Harper Lin',
    epic: {label: 'growth', color: 'green'},
    location: 'backlog',
  },
  {
    id: 'AUR-246',
    title: 'Statement PDF export',
    summary: 'Monthly statement generation with fee subtotals.',
    points: 3,
    priority: 'medium',
    assignee: 'Felix Grant',
    epic: {label: 'payments', color: 'blue'},
    location: 'backlog',
  },
  {
    id: 'AUR-247',
    title: 'Sanctions screening retry',
    summary: 'Back off and re-screen payees stuck in manual review.',
    points: 2,
    priority: 'urgent',
    assignee: 'Imani Brooks',
    epic: {label: 'risk', color: 'orange'},
    isBlocked: true,
    location: 'backlog',
  },
];

const STORY_BY_ID = new Map(STORIES.map(story => [story.id, story] as const));

function sumPoints(stories: ReadonlyArray<Story>): number {
  return stories.reduce((total, story) => total + story.points, 0);
}

// ============= PIECES =============

/** Priority glyph with a text alternative (never icon-only semantics). */
function PriorityGlyph({priority}: {priority: Priority}) {
  const meta = PRIORITY_META[priority];
  return (
    <span role="img" aria-label={meta.label} style={styles.priorityGlyph}>
      <Icon icon={meta.icon} size="sm" color={meta.color} />
    </span>
  );
}

/**
 * Committed-vs-capacity meter. Committed always counts every committed
 * story (filters never change it); the bar flips accent → warning at 90%
 * and → error past capacity, with an explicit "Over by N pts" Badge so
 * the state is not color-only.
 */
function CapacityMeter({
  committedPoints,
  isFill,
}: {
  committedPoints: number;
  isFill: boolean;
}) {
  const {capacityPoints} = SPRINT;
  const isOver = committedPoints > capacityPoints;
  const variant = isOver
    ? 'error'
    : committedPoints >= capacityPoints * 0.9
      ? 'warning'
      : 'accent';
  return (
    <div style={isFill ? styles.meterBlockFill : styles.meterBlock}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Committed
            </Text>
          </StackItem>
          {isOver ? (
            <Badge
              variant="error"
              label={`Over by ${committedPoints - capacityPoints} pts`}
            />
          ) : null}
          <Text type="supporting" hasTabularNumbers>
            {committedPoints} / {capacityPoints} pts
          </Text>
        </HStack>
        <ProgressBar
          label={`Sprint capacity: ${committedPoints} of ${capacityPoints} points committed`}
          isLabelHidden
          value={Math.min(committedPoints, capacityPoints)}
          max={capacityPoints}
          variant={variant}
        />
      </VStack>
    </div>
  );
}

function StoryCard({
  story,
  columnId,
  isBlocked,
  isDraggable,
  isDragging,
  onMove,
  onSendToBacklog,
  onToggleBlocked,
  onDraggingChange,
}: {
  story: Story;
  columnId: ColumnId;
  isBlocked: boolean;
  isDraggable: boolean;
  isDragging: boolean;
  onMove: (storyId: string, columnId: ColumnId) => void;
  onSendToBacklog: (storyId: string) => void;
  onToggleBlocked: (storyId: string) => void;
  onDraggingChange: (storyId: string | null) => void;
}) {
  const moveTargets = COLUMNS.filter(column => column.id !== columnId);
  return (
    // Draggable wrapper (pointer path). The MoreMenu below is the
    // touch/keyboard path — ClickableCard's accessible trigger is a
    // hidden sibling of the content, so the nested menu button stays a
    // valid, independent interactive element (no button-in-link).
    <div
      draggable={isDraggable || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', story.id);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange(story.id);
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={isDragging ? styles.cardDragging : undefined}>
      <ClickableCard label={story.title} href="#" width="100%" padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="start">
            <PriorityGlyph priority={story.priority} />
            <StackItem size="fill">
              <VStack gap={1}>
                <Text type="body" maxLines={2}>
                  {story.title}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {story.summary}
                </Text>
              </VStack>
            </StackItem>
            {/* On touch devices this menu is the only way to move a
                card (drag is fine-pointer-only), so bump it to the
                largest control size for a usable tap target; keep the
                compact "sm" trigger on hover-capable fine pointers
                where drag is the primary path. */}
            <MoreMenu
              label={`Actions for ${story.id}`}
              size={isDraggable ? 'sm' : 'lg'}
              items={[
                ...moveTargets.map(column => ({
                  label: `Move to ${column.title}`,
                  onClick: () => onMove(story.id, column.id),
                })),
                {
                  label: 'Send to backlog',
                  onClick: () => onSendToBacklog(story.id),
                },
                {
                  label: isBlocked ? 'Unblock' : 'Mark blocked',
                  onClick: () => onToggleBlocked(story.id),
                },
              ]}
            />
          </HStack>
          <HStack gap={1} wrap="wrap">
            {isBlocked ? (
              <Badge
                variant="error"
                label="Blocked"
                icon={<Icon icon={OctagonAlertIcon} size="sm" color="inherit" />}
              />
            ) : null}
            <Token label={story.epic.label} color={story.epic.color} size="sm" />
          </HStack>
          <HStack gap={2} vAlign="center">
            <Token label={`${story.points} pts`} color="gray" size="sm" />
            <Avatar name={story.assignee} size="xsmall" />
            <StackItem size="fill" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {story.id}
            </Text>
          </HStack>
        </VStack>
      </ClickableCard>
    </div>
  );
}

function BoardColumn({
  columnId,
  title,
  stories,
  blockedIds,
  width,
  isSnapping,
  isDraggable,
  draggingStoryId,
  onMove,
  onSendToBacklog,
  onToggleBlocked,
  onDraggingChange,
}: {
  columnId: ColumnId;
  title: string;
  stories: Story[];
  blockedIds: ReadonlySet<string>;
  width: string | number;
  isSnapping: boolean;
  isDraggable: boolean;
  draggingStoryId: string | null;
  onMove: (storyId: string, columnId: ColumnId) => void;
  onSendToBacklog: (storyId: string) => void;
  onToggleBlocked: (storyId: string) => void;
  onDraggingChange: (storyId: string | null) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const columnPoints = sumPoints(stories);
  return (
    <div
      onDragOver={event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setIsDropTarget(true);
      }}
      onDragLeave={event => {
        // Ignore leave events fired when the drag moves over children.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDropTarget(false);
        }
      }}
      onDrop={event => {
        event.preventDefault();
        setIsDropTarget(false);
        const storyId = event.dataTransfer.getData('text/plain');
        if (storyId) {
          onMove(storyId, columnId);
        }
      }}
      style={{
        ...styles.column,
        ...(isSnapping ? styles.columnSnap : undefined),
        ...(isDropTarget ? styles.columnDropTarget : undefined),
        width,
      }}>
      <div style={styles.columnHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Text type="label">{title}</Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {stories.length} · {columnPoints} pts
              </Text>
            </HStack>
          </StackItem>
          <IconButton
            label={`${title} column options`}
            icon={<Icon icon={EllipsisIcon} size="sm" />}
            variant="ghost"
          />
        </HStack>
      </div>
      <div style={styles.columnBody}>
        {stories.length === 0 ? (
          <div style={styles.columnEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={InboxIcon} size="lg" />}
              title="No stories"
              description="Nothing here matches the current filter."
            />
          </div>
        ) : (
          <VStack gap={2}>
            {stories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                columnId={columnId}
                isBlocked={blockedIds.has(story.id)}
                isDraggable={isDraggable}
                isDragging={draggingStoryId === story.id}
                onMove={onMove}
                onSendToBacklog={onSendToBacklog}
                onToggleBlocked={onToggleBlocked}
                onDraggingChange={onDraggingChange}
              />
            ))}
          </VStack>
        )}
      </div>
    </div>
  );
}

function BacklogRow({
  story,
  isBlocked,
  hasLargeAction,
  onAddToSprint,
}: {
  story: Story;
  isBlocked: boolean;
  /** Touch surfaces upsize the add action to a ~40px tap target. */
  hasLargeAction: boolean;
  onAddToSprint: (storyId: string) => void;
}) {
  return (
    <div style={styles.backlogRow}>
      <HStack gap={2} vAlign="start">
        <PriorityGlyph priority={story.priority} />
        <StackItem size="fill">
          <VStack gap={1}>
            <Text type="body" maxLines={2}>
              {story.title}
            </Text>
            <HStack gap={1} vAlign="center" wrap="wrap">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {story.id}
              </Text>
              <Token
                label={story.epic.label}
                color={story.epic.color}
                size="sm"
              />
              {isBlocked ? <Badge variant="error" label="Blocked" /> : null}
            </HStack>
            <HStack gap={2} vAlign="center">
              <Token label={`${story.points} pts`} color="gray" size="sm" />
              <Avatar name={story.assignee} size="xsmall" />
            </HStack>
          </VStack>
        </StackItem>
        <IconButton
          label={`Add ${story.id} to sprint (${story.points} points)`}
          tooltip="Add to sprint"
          icon={<Icon icon={PlusIcon} size="sm" />}
          variant="secondary"
          size={hasLargeAction ? 'lg' : 'sm'}
          onClick={() => onAddToSprint(story.id)}
        />
      </HStack>
    </div>
  );
}

function BacklogPane({
  stories,
  blockedIds,
  isFiltered,
  hasLargeAction,
  onAddToSprint,
}: {
  stories: Story[];
  blockedIds: ReadonlySet<string>;
  isFiltered: boolean;
  hasLargeAction: boolean;
  onAddToSprint: (storyId: string) => void;
}) {
  return (
    <div style={styles.backlogPane}>
      <div style={styles.backlogHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Backlog</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {stories.length} stories · {sumPoints(stories)} pts
          </Text>
        </HStack>
      </div>
      <div style={styles.backlogList}>
        {stories.length === 0 ? (
          <div style={styles.backlogEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={ListTodoIcon} size="lg" />}
              title="Backlog is clear"
              description={
                isFiltered
                  ? 'No backlog stories match the current filter.'
                  : 'Every ranked story has been pulled into the sprint.'
              }
            />
          </div>
        ) : (
          stories.map(story => (
            <BacklogRow
              key={story.id}
              story={story}
              isBlocked={blockedIds.has(story.id)}
              hasLargeAction={hasLargeAction}
              onAddToSprint={onAddToSprint}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function SprintBoardBacklogTemplate() {
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  // Story→location assignment lifted into state so add-to-sprint, board
  // moves, and send-to-backlog all re-render together; seeded
  // deterministically from the fixture data.
  const [locations, setLocations] = useState<Record<string, StoryLocation>>(
    () =>
      Object.fromEntries(
        STORIES.map(story => [story.id, story.location] as const),
      ),
  );
  const [blockedIds, setBlockedIds] = useState<ReadonlySet<string>>(
    () => new Set(STORIES.filter(story => story.isBlocked).map(s => s.id)),
  );
  const [draggingStoryId, setDraggingStoryId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isBacklogOpenOnMobile, setIsBacklogOpenOnMobile] = useState(false);

  // <=640px: the backlog undocks and swaps with the board (single pane).
  const isSinglePane = useMediaQuery('(max-width: 640px)');
  // <=768px: board columns become 85vw with scroll snap.
  const isNarrowBoard = useMediaQuery('(max-width: 768px)');
  // Drag-and-drop only for hover-capable fine pointers; touch users move
  // cards through each card's MoreMenu.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');
  const columnWidth = isNarrowBoard ? '85vw' : 300;

  // Committed points ignore the assignee filter on purpose — the meter
  // reports the real sprint commitment at all times.
  const committedPoints = useMemo(
    () =>
      sumPoints(STORIES.filter(story => locations[story.id] !== 'backlog')),
    [locations],
  );

  const matchesFilter = useCallback(
    (story: Story) =>
      assigneeFilter === 'all' || story.assignee === assigneeFilter,
    [assigneeFilter],
  );

  const backlogStories = useMemo(
    () =>
      STORIES.filter(
        story => locations[story.id] === 'backlog' && matchesFilter(story),
      ),
    [locations, matchesFilter],
  );

  const storiesByColumn = useMemo(() => {
    const grouped = new Map<ColumnId, Story[]>();
    for (const column of COLUMNS) {
      grouped.set(column.id, []);
    }
    for (const story of STORIES) {
      const location = locations[story.id] ?? story.location;
      if (location !== 'backlog' && matchesFilter(story)) {
        grouped.get(location)?.push(story);
      }
    }
    return grouped;
  }, [locations, matchesFilter]);

  const visibleBoardCount = useMemo(() => {
    let count = 0;
    for (const stories of storiesByColumn.values()) {
      count += stories.length;
    }
    return count;
  }, [storiesByColumn]);

  const moveStory = useCallback(
    (storyId: string, targetColumnId: ColumnId) => {
      const story = STORY_BY_ID.get(storyId);
      const column = COLUMNS.find(item => item.id === targetColumnId);
      if (!story || !column || locations[storyId] === targetColumnId) {
        return;
      }
      setLocations(prev => ({...prev, [storyId]: targetColumnId}));
      setAnnouncement(`Moved ${story.title} to ${column.title}`);
    },
    [locations],
  );

  const addToSprint = useCallback(
    (storyId: string) => {
      const story = STORY_BY_ID.get(storyId);
      if (!story || locations[storyId] !== 'backlog') {
        return;
      }
      setLocations(prev => ({...prev, [storyId]: 'todo'}));
      setAnnouncement(
        `Added ${story.title} to sprint — ${
          committedPoints + story.points
        } of ${SPRINT.capacityPoints} pts committed`,
      );
    },
    [committedPoints, locations],
  );

  const sendToBacklog = useCallback(
    (storyId: string) => {
      const story = STORY_BY_ID.get(storyId);
      if (!story || locations[storyId] === 'backlog') {
        return;
      }
      setLocations(prev => ({...prev, [storyId]: 'backlog'}));
      setAnnouncement(
        `Sent ${story.title} to the backlog — ${
          committedPoints - story.points
        } of ${SPRINT.capacityPoints} pts committed`,
      );
    },
    [committedPoints, locations],
  );

  const toggleBlocked = useCallback((storyId: string) => {
    const story = STORY_BY_ID.get(storyId);
    if (!story) {
      return;
    }
    setBlockedIds(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
        setAnnouncement(`Unblocked ${story.title}`);
      } else {
        next.add(storyId);
        setAnnouncement(`Marked ${story.title} as blocked`);
      }
      return next;
    });
  }, []);

  const backlogPane = (
    <BacklogPane
      stories={backlogStories}
      blockedIds={blockedIds}
      isFiltered={assigneeFilter !== 'all'}
      hasLargeAction={!canDrag}
      onAddToSprint={addToSprint}
    />
  );

  const boardPane = (
    <div
      style={{
        ...styles.board,
        ...(isNarrowBoard ? styles.boardSnap : undefined),
      }}>
      {COLUMNS.map(column => (
        <BoardColumn
          key={column.id}
          columnId={column.id}
          title={column.title}
          stories={storiesByColumn.get(column.id) ?? []}
          blockedIds={blockedIds}
          width={columnWidth}
          isSnapping={isNarrowBoard}
          isDraggable={canDrag}
          draggingStoryId={draggingStoryId}
          onMove={moveStory}
          onSendToBacklog={sendToBacklog}
          onToggleBlocked={toggleBlocked}
          onDraggingChange={setDraggingStoryId}
        />
      ))}
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* wrap="wrap" lets the meter/filter/action controls drop below
              the title row on narrow viewports instead of clipping or
              forcing horizontal page overflow. */}
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size={isSinglePane ? 'static' : 'fill'}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>{SPRINT.name}</Heading>
                <Badge
                  variant={SPRINT.daysRemaining <= 2 ? 'warning' : 'info'}
                  label={`${SPRINT.daysRemaining} of ${SPRINT.lengthDays} days left`}
                  icon={<Icon icon={CalendarDaysIcon} size="sm" color="inherit" />}
                />
                {isSinglePane ? null : (
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {SPRINT.goal} · {SPRINT.dateRange}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <StackItem size={isSinglePane ? 'fill' : 'static'}>
              <CapacityMeter
                committedPoints={committedPoints}
                isFill={isSinglePane}
              />
            </StackItem>
            <Selector
              label="Filter by assignee"
              isLabelHidden
              size="sm"
              options={ASSIGNEE_OPTIONS}
              value={assigneeFilter}
              onChange={setAssigneeFilter}
            />
            {isSinglePane ? (
              // <=640px the backlog undocks; this ~40px toggle swaps the
              // content region between the backlog list and the board.
              <IconButton
                label={
                  isBacklogOpenOnMobile
                    ? `Show board (${visibleBoardCount} stories)`
                    : `Show backlog (${backlogStories.length} stories)`
                }
                tooltip={isBacklogOpenOnMobile ? 'Show board' : 'Show backlog'}
                icon={
                  <Icon
                    icon={isBacklogOpenOnMobile ? KanbanIcon : ListTodoIcon}
                    size="sm"
                  />
                }
                variant={isBacklogOpenOnMobile ? 'secondary' : 'ghost'}
                style={styles.iconTapTarget}
                onClick={() => setIsBacklogOpenOnMobile(prev => !prev)}
              />
            ) : null}
            <Button
              label="New story"
              icon={<Icon icon={PlusIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isSinglePane ? undefined : (
          <LayoutPanel width={300} padding={0} hasDivider label="Backlog">
            {backlogPane}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {/* <=640px the backlog swaps into the content region (a docked
              300px panel would leave the board a sliver at phone width). */}
          {isSinglePane && isBacklogOpenOnMobile ? backlogPane : boardPane}
        </LayoutContent>
      }
    />
  );
}
