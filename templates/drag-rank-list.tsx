// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one launch backlog — 10 feature cards
 *   with id, name, one-line summary, effort score in points, impact score
 *   out of 10, and an owner from a fixed 4-person team; a fixed initial
 *   order; three sprint-capacity presets 16/24/32 pts)
 * @output Drag-to-RANK board for sequencing a launch backlog: a header bar
 *   (list Icon + 'Launch priority' Heading + live 'top-3 load 16/24 pts'
 *   counter + 'Sort by ROI' / 'Reset' / 'Undo' Buttons), a vertical rank
 *   list where every card shows its live rank number, owner Avatar, and
 *   impact/effort mini meters, and a right analysis LayoutPanel whose
 *   top-3 effort-vs-capacity meter, top-3 impact-captured meter, owner
 *   load bars, and undoable move-history chips all re-derive from the
 *   current order after every drop. Reordering is a REAL pointer drag
 *   built from raw pointer events: the lifted card scales up under an
 *   elevated shadow and follows the pointer 1:1 while sibling cards
 *   FLIP-slide out of the way in real time to preview the drop slot, and
 *   release settles the card into place with a soft cubic-bezier
 *   overshoot. A grab-mode keyboard flow (Space lifts, Arrow/Home/End
 *   move, Space drops, Escape cancels) drives the identical FLIP commit
 *   path with spoken-order announcements, and long-press lifts on touch.
 *   A dashed 'Top 3 ships next sprint' cut line splits rank 3 from rank 4
 *   so every drop visibly changes the analysis, not just the list.
 * @position Page template; emitted by `astryx template drag-rank-list`
 *
 * Frame: Layout height="fill". LayoutHeader carries the board chrome
 * (title, live top-3 load counter, Sort by ROI / Reset / Undo Buttons).
 * LayoutContent is the scrolling rank list; LayoutPanel end 320 is the
 * analysis rail (capacity Selector, meters, owner load, move history).
 * Choose over kanban-board when the surface is ONE ordered list whose
 * sequence is the decision — not tasks flowing between status columns;
 * choose over slide-sorter when cards carry scores that feed a live
 * analysis rail rather than thumbnails in sections.
 *
 * Interaction contract (the sortable, with zero drag library):
 * - Pointer path: pointerdown on a card's grip handle captures the
 *   pointer; the card follows clientY 1:1 with scale(1.02) + lift
 *   shadow while siblings translate to their previewed slots (targets
 *   measured from real rects at drag start, so the cut line is
 *   accounted for). Release commits the projected order and a FLIP
 *   pass settles the card with an overshoot bezier; releasing on the
 *   origin slot springs the card back through the same pass. Escape
 *   mid-drag cancels and springs back.
 * - Touch path: long-press (260ms) on the handle arms then lifts the
 *   card; moving >8px before the timer fires cancels the lift. The
 *   handle is touch-action:none so the press never fights scrolling,
 *   and it grows to a 44px target at <=640px.
 * - Keyboard path (identical commit logic): the handle is a real
 *   button — Space/Enter lifts into grab mode, ArrowUp/ArrowDown move
 *   one slot (Home/End to the ends) through the same captureFlip →
 *   reorder path, Space drops (recording one history chip for the whole
 *   trip), Escape cancels back to the lift position. Every step is
 *   announced through a visually hidden aria-live region.
 * - Every committed move lands in the history strip as an undoable
 *   chip; clicking a chip rewinds through it (LIFO) and the reverse
 *   move animates through the same FLIP transition. Sort by ROI and
 *   Reset are batch chips that restore the full prior order.
 *
 * Responsive contract:
 * - >960px: header | rank list (fill) + 320px end analysis panel.
 * - <=960px: the panel is omitted; a condensed analysis strip (both
 *   meters + capacity Selector) docks above the list and the history
 *   chips become a horizontal scroll strip (deliberate overflowX).
 * - <=640px: single pane at 375px; the per-card mini meters hide in
 *   favor of an inline 'E8 · I9' readout, grip handles grow from 36px
 *   to 44px tap targets, and header actions wrap below the title. No
 *   hover-only affordances anywhere — handles are always visible.
 * - prefers-reduced-motion: sibling previews jump instantly (no slide
 *   transitions), release skips the FLIP settle, and the moved card
 *   flashes a brief token-tinted highlight instead.
 *
 * Container policy (ranked-row archetype): frame-first chrome; the rank
 * rows are hand-rolled bordered rows (uniform height so slot math stays
 * exact), the analysis rail is plain stacked sections inside LayoutPanel,
 * and the only Cards are none — rows and panels throughout.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair (top-3 band,
 * meter fills, lift shadow, flash tint), so the board survives the dark
 * toggle with its red/green/accent semantics intact.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowDownWideNarrowIcon,
  FlagIcon,
  GripVerticalIcon,
  ListOrderedIcon,
  RotateCcwIcon,
  Undo2Icon,
} from 'lucide-react';

// ============= TOKEN-PURE COLOR PAIRS =============
// Every literal below lives inside a light-dark() pair (documented gate);
// everything else resolves through --color-* tokens or color-mix over them.

/** Top-3 band tint: accent wash that stays legible on both schemes. */
const BAND_BG =
  'light-dark(' +
  'color-mix(in srgb, var(--color-accent) 7%, var(--color-background-card)), ' +
  'color-mix(in srgb, var(--color-accent) 16%, var(--color-background-card)))';

/** Lifted-card shadow: ink-tinted in light, deeper black in dark. */
const LIFT_SHADOW =
  '0 12px 28px -8px light-dark(' +
  'color-mix(in srgb, var(--color-text-primary) 35%, transparent), ' +
  'color-mix(in srgb, #000000 65%, transparent)), ' +
  '0 2px 6px light-dark(' +
  'color-mix(in srgb, var(--color-text-primary) 18%, transparent), ' +
  'color-mix(in srgb, #000000 45%, transparent))';

/** Impact meter fill (accent family). */
const IMPACT_FILL =
  'light-dark(' +
  'color-mix(in srgb, var(--color-accent) 92%, var(--color-background-body)), ' +
  'color-mix(in srgb, var(--color-accent) 80%, var(--color-background-body)))';

/** Effort meter fill while under capacity (success family). */
const EFFORT_FILL =
  'light-dark(' +
  'color-mix(in srgb, var(--color-success) 88%, var(--color-background-body)), ' +
  'color-mix(in srgb, var(--color-success) 76%, var(--color-background-body)))';

/** Effort meter fill once the top-3 load exceeds capacity. */
const OVER_FILL =
  'light-dark(' +
  'var(--color-error), ' +
  'color-mix(in srgb, var(--color-error) 88%, var(--color-background-body)))';

/** Owner-load bar fill (neutral, quieter than the headline meters). */
const OWNER_FILL =
  'light-dark(' +
  'color-mix(in srgb, var(--color-text-secondary) 55%, var(--color-background-body)), ' +
  'color-mix(in srgb, var(--color-text-secondary) 70%, var(--color-background-body)))';

/**
 * Reduced-motion flash + handle hover/focus rules. The keyframe is the
 * non-animated-slide equivalent: a brief token-tinted highlight on the
 * moved card instead of a FLIP slide.
 */
const GLOBAL_CSS = `
@keyframes drag-rank-flash {
  0% {
    background-color: light-dark(
      color-mix(in srgb, var(--color-accent) 28%, transparent),
      color-mix(in srgb, var(--color-accent) 38%, transparent));
  }
  100% { background-color: transparent; }
}
.drag-rank-handle:hover {
  background-color: var(--color-background-muted);
}
.drag-rank-handle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    // The list is the FLIP coordinate space; rows transform inside it.
    position: 'relative',
  },
  listDragging: {
    // No accidental text selection while a card is in flight.
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    minHeight: 56,
    boxSizing: 'border-box',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    position: 'relative',
  },
  rowBand: {
    backgroundColor: BAND_BG,
    borderColor: 'color-mix(in srgb, var(--color-accent) 35%, var(--color-border))',
  },
  rowLifted: {
    boxShadow: LIFT_SHADOW,
    zIndex: 5,
  },
  rowGrabbed: {
    boxShadow: LIFT_SHADOW,
    outline: '2px solid var(--color-accent)',
    outlineOffset: 1,
    zIndex: 5,
  },
  rowArmed: {
    // Long-press in progress: a small cue that the lift is arming.
    boxShadow: 'var(--shadow-med)',
  },
  rankChip: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)' as CSSProperties['fontWeight'],
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  rankChipTop: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  handle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: 'none',
    background: 'none',
    padding: 0,
    margin: 0,
    borderRadius: 'var(--radius-control)',
    color: 'var(--color-text-secondary)',
    cursor: 'grab',
    // Pointer gestures own this surface; scrolling starts elsewhere.
    touchAction: 'none',
  },
  handleGrabbing: {
    cursor: 'grabbing',
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  miniMeters: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: 132,
    flexShrink: 0,
  },
  miniMeterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  miniMeterLabel: {
    width: 14,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  miniTrack: {
    flex: 1,
    height: 4,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  miniValue: {
    width: 18,
    fontSize: 11,
    textAlign: 'right',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  cutLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '2px 0',
  },
  cutRule: {
    flex: 1,
    borderTop: '2px dashed color-mix(in srgb, var(--color-accent) 55%, var(--color-border))',
  },
  meterTrack: {
    height: 8,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  ownerTrack: {
    flex: 1,
    height: 6,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  historyStripRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    // Deliberate overflowX: chips scroll horizontally at narrow widths.
    paddingBottom: 2,
  },
  summaryStrip: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed scores, fixed initial order.
// No clocks, no randomness, no network assets.

interface FeatureCard {
  id: string;
  name: string;
  summary: string;
  effort: number; // story points, max 13 in the fixture
  impact: number; // 0-10 product impact score
  owner: string;
}

const EFFORT_MAX = 13;
const IMPACT_MAX = 10;

const FEATURES: FeatureCard[] = [
  {
    id: 'offline-mode',
    name: 'Offline mode',
    summary: 'Queue edits locally and sync on reconnect.',
    effort: 8,
    impact: 9,
    owner: 'Priya Raman',
  },
  {
    id: 'sso-saml',
    name: 'SAML single sign-on',
    summary: 'Enterprise IdP login with SCIM provisioning.',
    effort: 5,
    impact: 8,
    owner: 'Marcus Webb',
  },
  {
    id: 'audit-log',
    name: 'Audit log export',
    summary: 'Filterable admin events with CSV download.',
    effort: 3,
    impact: 6,
    owner: 'Sofia Ortiz',
  },
  {
    id: 'mobile-widgets',
    name: 'Home-screen widgets',
    summary: 'Today view and quick-capture widgets.',
    effort: 5,
    impact: 5,
    owner: 'Jonah Fields',
  },
  {
    id: 'ai-summaries',
    name: 'AI thread summaries',
    summary: 'One-tap recap of long comment threads.',
    effort: 8,
    impact: 7,
    owner: 'Priya Raman',
  },
  {
    id: 'bulk-import',
    name: 'CSV bulk import',
    summary: 'Row-level validation with a failure report.',
    effort: 2,
    impact: 5,
    owner: 'Sofia Ortiz',
  },
  {
    id: 'custom-themes',
    name: 'Workspace themes',
    summary: 'Brand colors and logo across the workspace.',
    effort: 3,
    impact: 4,
    owner: 'Jonah Fields',
  },
  {
    id: 'api-webhooks',
    name: 'Outbound webhooks',
    summary: 'Signed event callbacks with retry backoff.',
    effort: 5,
    impact: 7,
    owner: 'Marcus Webb',
  },
  {
    id: 'perf-startup',
    name: 'Sub-second startup',
    summary: 'Cold-start budget under 1s on mid-tier phones.',
    effort: 8,
    impact: 6,
    owner: 'Priya Raman',
  },
  {
    id: 'billing-tiers',
    name: 'Usage-based billing',
    summary: 'Metered tiers with proration and invoices.',
    effort: 13,
    impact: 9,
    owner: 'Marcus Webb',
  },
];

const FEATURE_BY_ID = new Map(FEATURES.map(card => [card.id, card]));
const INITIAL_ORDER = FEATURES.map(card => card.id);
const TOTAL_IMPACT = FEATURES.reduce((sum, card) => sum + card.impact, 0);
const TOP_COUNT = 3;

const CAPACITY_OPTIONS = [
  {value: '16', label: '16 pts — tight sprint'},
  {value: '24', label: '24 pts — standard sprint'},
  {value: '32', label: '32 pts — double sprint'},
];

// ============= HELPERS =============

/** Immutable move: lift the item at `from` and re-insert it at `to`. */
function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Impact-per-effort ("ROI") ordering, ties broken deterministically. */
function roiOrder(order: readonly string[]): string[] {
  return [...order].sort((a, b) => {
    const cardA = FEATURE_BY_ID.get(a)!;
    const cardB = FEATURE_BY_ID.get(b)!;
    const roiA = cardA.impact / cardA.effort;
    const roiB = cardB.impact / cardB.effort;
    if (roiA !== roiB) {
      return roiB - roiA;
    }
    if (cardA.impact !== cardB.impact) {
      return cardB.impact - cardA.impact;
    }
    return cardA.name.localeCompare(cardB.name);
  });
}

/** Live match for prefers-reduced-motion; SSR-safe default of false. */
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(query.matches);
    const onChange = (event: MediaQueryListEvent) => setPrefers(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefers;
}

// ============= HISTORY =============

type HistoryEntry =
  | {kind: 'move'; seq: number; cardId: string; from: number; to: number}
  | {kind: 'batch'; seq: number; label: string; prevOrder: string[]};

function entryLabel(entry: HistoryEntry): string {
  if (entry.kind === 'batch') {
    return entry.label;
  }
  const name = FEATURE_BY_ID.get(entry.cardId)?.name ?? entry.cardId;
  return `${name} ${entry.from + 1}→${entry.to + 1}`;
}

// ============= METER =============

interface MeterBarProps {
  label: string;
  valueText: string;
  value: number;
  max: number;
  fill: string;
  hint?: string;
  isOver?: boolean;
}

/** Hand-rolled labeled meter; fills are light-dark() pairs over tokens. */
function MeterBar({label, valueText, value, max, fill, hint, isOver}: MeterBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">{label}</Text>
        </StackItem>
        <Text
          type="supporting"
          color="secondary"
          hasTabularNumbers
          style={isOver ? {color: 'var(--color-text-red)'} : undefined}>
          {valueText}
        </Text>
      </HStack>
      <div
        style={styles.meterTrack}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}>
        <div
          style={{
            width: `${pct.toFixed(2)}%`,
            height: '100%',
            borderRadius: 'inherit',
            backgroundColor: fill,
          }}
        />
      </div>
      {hint != null && (
        <Text
          type="supporting"
          color="secondary"
          style={isOver ? {color: 'var(--color-text-red)'} : undefined}>
          {hint}
        </Text>
      )}
    </VStack>
  );
}

// ============= ANALYSIS (derived live from the order) =============

interface AnalysisProps {
  order: string[];
  capacity: number;
  onCapacityChange: (value: string) => void;
  isCondensed?: boolean;
}

function AnalysisMeters({order, capacity, onCapacityChange, isCondensed}: AnalysisProps) {
  const topCards = order.slice(0, TOP_COUNT).map(id => FEATURE_BY_ID.get(id)!);
  const topEffort = topCards.reduce((sum, card) => sum + card.effort, 0);
  const topImpact = topCards.reduce((sum, card) => sum + card.impact, 0);
  const isOver = topEffort > capacity;
  const impactShare = Math.round((topImpact / TOTAL_IMPACT) * 100);

  const meters = (
    <>
      <StackItem size="fill">
        <MeterBar
          label="Top-3 effort load"
          valueText={`${topEffort}/${capacity} pts`}
          value={topEffort}
          max={capacity}
          fill={isOver ? OVER_FILL : EFFORT_FILL}
          isOver={isOver}
          hint={
            isOver
              ? `Over capacity by ${topEffort - capacity} pts — demote something.`
              : `${capacity - topEffort} pts of slack left in the sprint.`
          }
        />
      </StackItem>
      <StackItem size="fill">
        <MeterBar
          label="Top-3 impact captured"
          valueText={`${topImpact}/${TOTAL_IMPACT} · ${impactShare}%`}
          value={topImpact}
          max={TOTAL_IMPACT}
          fill={IMPACT_FILL}
          hint={
            isCondensed
              ? undefined
              : `Share of all backlog impact the next sprint ships.`
          }
        />
      </StackItem>
    </>
  );

  return (
    <VStack gap={3}>
      {isCondensed ? (
        <HStack gap={4} vAlign="start" wrap="wrap">
          {meters}
        </HStack>
      ) : (
        <VStack gap={3}>{meters}</VStack>
      )}
      <Selector
        label="Sprint capacity"
        size="sm"
        options={CAPACITY_OPTIONS}
        value={String(capacity)}
        onChange={onCapacityChange}
      />
    </VStack>
  );
}

/** Per-owner effort inside the top 5 ranks — another live derivation. */
function OwnerLoad({order}: {order: string[]}) {
  const topFive = order.slice(0, 5).map(id => FEATURE_BY_ID.get(id)!);
  const byOwner = new Map<string, number>();
  for (const card of topFive) {
    byOwner.set(card.owner, (byOwner.get(card.owner) ?? 0) + card.effort);
  }
  const rows = [...byOwner.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const maxLoad = rows.length > 0 ? rows[0][1] : 1;
  return (
    <VStack gap={2}>
      <Text type="label">Owner load · top 5 ranks</Text>
      {rows.map(([owner, load]) => (
        <HStack key={owner} gap={2} vAlign="center">
          <Avatar name={owner} size="xsmall" />
          <StackItem size="fill">
            <div style={styles.ownerTrack} aria-hidden>
              <div
                style={{
                  width: `${((load / maxLoad) * 100).toFixed(1)}%`,
                  height: '100%',
                  borderRadius: 'inherit',
                  backgroundColor: OWNER_FILL,
                }}
              />
            </div>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {load} pts
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

// ============= HISTORY STRIP =============

interface HistoryStripProps {
  history: HistoryEntry[];
  onUndoTo: (index: number) => void;
  isHorizontal: boolean;
}

/**
 * Undoable chips, newest last. Clicking a chip rewinds through it (LIFO),
 * so clicking an older chip undoes every move made after it too.
 */
function HistoryStrip({history, onUndoTo, isHorizontal}: HistoryStripProps) {
  if (history.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        No moves yet — drag a card, or press Space on its handle.
      </Text>
    );
  }
  const chips = history.map((entry, index) => {
    const isLatest = index === history.length - 1;
    const undoCount = history.length - index;
    return (
      <Button
        key={entry.seq}
        label={entryLabel(entry)}
        size="sm"
        variant="ghost"
        icon={
          isLatest ? <Icon icon={Undo2Icon} size="sm" color="inherit" /> : undefined
        }
        tooltip={
          undoCount === 1
            ? 'Undo this move'
            : `Undo this and the ${undoCount - 1} newer ${
                undoCount - 1 === 1 ? 'move' : 'moves'
              }`
        }
        onClick={() => onUndoTo(index)}
      />
    );
  });
  return isHorizontal ? (
    <div style={styles.historyStripRow}>{chips}</div>
  ) : (
    <VStack gap={1} hAlign="start">
      {chips}
    </VStack>
  );
}

// ============= RANK ROW =============

interface RankRowProps {
  card: FeatureCard;
  rank: number; // 1-based, renumbers live from the committed order
  isTop: boolean;
  isDraggedCard: boolean;
  isGrabbed: boolean;
  isArmed: boolean;
  isCompact: boolean;
  transform: string | undefined;
  transition: string | undefined;
  registerNode: (id: string, node: HTMLDivElement | null) => void;
  onHandlePointerDown: (event: ReactPointerEvent<HTMLButtonElement>, id: string) => void;
  onHandlePointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onHandlePointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onHandleClick: (id: string) => void;
  onHandleKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>, id: string) => void;
  onHandleBlur: (id: string) => void;
}

function RankRow({
  card,
  rank,
  isTop,
  isDraggedCard,
  isGrabbed,
  isArmed,
  isCompact,
  transform,
  transition,
  registerNode,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onHandlePointerCancel,
  onHandleClick,
  onHandleKeyDown,
  onHandleBlur,
}: RankRowProps) {
  const handleSize = isCompact ? 44 : 36;
  const isLifted = isDraggedCard || isGrabbed;
  return (
    <div
      ref={node => registerNode(card.id, node)}
      style={{
        ...styles.row,
        ...(isTop ? styles.rowBand : undefined),
        ...(isArmed ? styles.rowArmed : undefined),
        ...(isDraggedCard ? styles.rowLifted : undefined),
        ...(isGrabbed ? styles.rowGrabbed : undefined),
        ...(transform != null ? {transform} : undefined),
        ...(transition != null ? {transition} : undefined),
      }}>
      <div
        style={{...styles.rankChip, ...(isTop ? styles.rankChipTop : undefined)}}
        aria-hidden>
        {rank}
      </div>
      <Tooltip content="Drag to reorder · Space to grab, arrows to move">
        <button
          type="button"
          className="drag-rank-handle"
          style={{
            ...styles.handle,
            width: handleSize,
            height: handleSize,
            ...(isDraggedCard ? styles.handleGrabbing : undefined),
          }}
          aria-label={
            isGrabbed
              ? `${card.name}, lifted, position ${rank} of ${FEATURES.length}. ` +
                'Arrow keys move, Space drops, Escape cancels.'
              : `Reorder ${card.name}, position ${rank} of ${FEATURES.length}`
          }
          aria-pressed={isGrabbed}
          aria-describedby="drag-rank-grab-help"
          onPointerDown={event => onHandlePointerDown(event, card.id)}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerCancel}
          onClick={() => onHandleClick(card.id)}
          onKeyDown={event => onHandleKeyDown(event, card.id)}
          onBlur={() => onHandleBlur(card.id)}>
          <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
        </button>
      </Tooltip>
      <div style={styles.rowMain}>
        <VStack gap={0.5}>
          <Text type="body" maxLines={1}>
            {card.name}
          </Text>
          <HStack gap={1} vAlign="center">
            <Avatar name={card.owner} size="xsmall" />
            <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
              {card.owner}
              {isCompact
                ? ` · E${card.effort} · I${card.impact}`
                : ` · ${card.summary}`}
            </Text>
          </HStack>
        </VStack>
      </div>
      {!isCompact && (
        <div style={styles.miniMeters} aria-hidden={isLifted}>
          <div style={styles.miniMeterRow}>
            <span style={styles.miniMeterLabel}>I</span>
            <div style={styles.miniTrack}>
              <div
                style={{
                  width: `${((card.impact / IMPACT_MAX) * 100).toFixed(1)}%`,
                  height: '100%',
                  borderRadius: 'inherit',
                  backgroundColor: IMPACT_FILL,
                }}
              />
            </div>
            <span style={styles.miniValue}>{card.impact}</span>
          </div>
          <div style={styles.miniMeterRow}>
            <span style={styles.miniMeterLabel}>E</span>
            <div style={styles.miniTrack}>
              <div
                style={{
                  width: `${((card.effort / EFFORT_MAX) * 100).toFixed(1)}%`,
                  height: '100%',
                  borderRadius: 'inherit',
                  backgroundColor: EFFORT_FILL,
                }}
              />
            </div>
            <span style={styles.miniValue}>{card.effort}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** The dashed rank-3/rank-4 cut line: everything above ships next sprint. */
function CutLine() {
  return (
    <div style={styles.cutLine} aria-hidden>
      <div style={styles.cutRule} />
      <Badge
        label="Top 3 · ships next sprint"
        variant="info"
        icon={<Icon icon={FlagIcon} size="xsm" color="inherit" />}
      />
      <div style={styles.cutRule} />
    </div>
  );
}

// ============= DRAG STATE =============

interface DragState {
  id: string;
  origin: number; // index at drag start
  projected: number; // previewed drop slot
  dy: number; // pointer delta from lift point
  tops: number[]; // slot tops measured at drag start (cut line included)
  height: number; // lifted card height
}

interface DragMeta {
  pointerId: number;
  startY: number;
  moved: boolean;
}

interface PendingPress {
  id: string;
  pointerId: number;
  startY: number;
  timer: number;
}

interface GrabState {
  id: string;
  startIndex: number;
}

interface FlipSnapshot {
  primaryId: string | null;
  tops: Map<string, number>;
}

// Sibling slide-out preview while a card is in flight.
const PREVIEW_TRANSITION = 'transform 200ms cubic-bezier(0.2, 0, 0, 1)';
// Release settle: soft overshoot so the drop reads as one motion.
const SETTLE_TRANSITION = 'transform 340ms cubic-bezier(0.24, 1.42, 0.4, 1)';
// Non-primary FLIP participants (undo neighbors, batch sorts).
const SHIFT_TRANSITION = 'transform 220ms cubic-bezier(0.2, 0, 0, 1)';
const LONG_PRESS_MS = 260;
const TOUCH_SLOP_PX = 8;

// ============= PAGE =============

export default function DragRankListTemplate() {
  const [order, setOrder] = useState<string[]>(INITIAL_ORDER);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [capacity, setCapacity] = useState(24);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [grabbed, setGrabbed] = useState<GrabState | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  // Bumped alongside every captureFlip so the layout effect runs post-commit.
  const [flipSeq, setFlipSeq] = useState(0);

  const itemNodes = useRef(new Map<string, HTMLDivElement>());
  const dragMetaRef = useRef<DragMeta | null>(null);
  const pendingPressRef = useRef<PendingPress | null>(null);
  const flipRef = useRef<FlipSnapshot | null>(null);
  const suppressClickRef = useRef(false);
  const historySeqRef = useRef(1);

  const prefersReducedMotion = usePrefersReducedMotion();
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isSinglePane = useMediaQuery('(max-width: 960px)');

  const registerNode = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node == null) {
      itemNodes.current.delete(id);
    } else {
      itemNodes.current.set(id, node);
    }
  }, []);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  // ---- FLIP core: snapshot rects before a commit, invert after ----

  /** Snapshot every row's visual top (transforms included) pre-commit. */
  const captureFlip = useCallback(
    (primaryId: string | null) => {
      const tops = new Map<string, number>();
      for (const [id, node] of itemNodes.current) {
        tops.set(id, node.getBoundingClientRect().top);
      }
      flipRef.current = {primaryId, tops};
      setFlipSeq(seq => seq + 1);
    },
    [],
  );

  useLayoutEffect(() => {
    const flip = flipRef.current;
    flipRef.current = null;
    if (flip == null) {
      return;
    }
    const animations: Array<{node: HTMLDivElement; isPrimary: boolean}> = [];
    for (const [id, prevTop] of flip.tops) {
      const node = itemNodes.current.get(id);
      if (node == null) {
        continue;
      }
      const isPrimary = id === flip.primaryId;
      if (prefersReducedMotion) {
        if (isPrimary) {
          // Reduced motion: instant reflow + brief token-tinted highlight.
          node.style.animation = 'none';
          void node.offsetHeight;
          node.style.animation = 'drag-rank-flash 700ms ease-out';
        }
        continue;
      }
      const delta = prevTop - node.getBoundingClientRect().top;
      if (Math.abs(delta) < 1 && !isPrimary) {
        continue;
      }
      // Invert: start from the pre-commit position (and lifted scale for
      // the primary card) with no transition…
      node.style.transition = 'none';
      node.style.transform = `translateY(${delta}px)${isPrimary ? ' scale(1.02)' : ''}`;
      animations.push({node, isPrimary});
    }
    if (animations.length === 0) {
      return;
    }
    // …flush, then play everything to its natural slot.
    void animations[0].node.offsetHeight;
    for (const {node, isPrimary} of animations) {
      node.style.transition = isPrimary ? SETTLE_TRANSITION : SHIFT_TRANSITION;
      node.style.transform = '';
      node.addEventListener(
        'transitionend',
        () => {
          node.style.transition = '';
        },
        {once: true},
      );
    }
  }, [flipSeq, prefersReducedMotion]);

  // ---- shared commit path (pointer, keyboard, and undo all land here) ----

  const pushMoveHistory = useCallback((cardId: string, from: number, to: number) => {
    setHistory(prev => [
      ...prev,
      {kind: 'move', seq: historySeqRef.current++, cardId, from, to},
    ]);
  }, []);

  // ---- keyboard grab mode (identical FLIP displacement path) ----

  const endGrab = useCallback(
    (id: string, commit: boolean) => {
      if (grabbed == null || grabbed.id !== id) {
        return;
      }
      const name = FEATURE_BY_ID.get(id)?.name ?? id;
      const currentIndex = order.indexOf(id);
      if (!commit) {
        if (currentIndex !== grabbed.startIndex) {
          captureFlip(id);
          setOrder(current =>
            arrayMove(current, current.indexOf(id), grabbed.startIndex),
          );
        }
        announce(
          `Cancelled. ${name} returned to position ${grabbed.startIndex + 1}.`,
        );
        setGrabbed(null);
        return;
      }
      if (currentIndex !== grabbed.startIndex) {
        // One chip for the whole keyboard trip: lift index → drop index.
        pushMoveHistory(id, grabbed.startIndex, currentIndex);
      }
      announce(
        `Dropped ${name} at position ${currentIndex + 1} of ${FEATURES.length}.`,
      );
      setGrabbed(null);
    },
    [announce, captureFlip, grabbed, order, pushMoveHistory],
  );

  const toggleGrab = useCallback(
    (id: string) => {
      if (grabbed?.id === id) {
        endGrab(id, true);
        return;
      }
      if (grabbed != null) {
        endGrab(grabbed.id, true);
      }
      const index = order.indexOf(id);
      const name = FEATURE_BY_ID.get(id)?.name ?? id;
      setGrabbed({id, startIndex: index});
      announce(
        `Lifted ${name}, position ${index + 1} of ${FEATURES.length}. ` +
          'Use arrow keys to move, Space to drop, Escape to cancel.',
      );
    },
    [announce, endGrab, grabbed, order],
  );

  const moveGrabbed = useCallback(
    (id: string, targetIndex: number) => {
      const from = order.indexOf(id);
      const to = Math.max(0, Math.min(FEATURES.length - 1, targetIndex));
      if (from === to) {
        return;
      }
      const name = FEATURE_BY_ID.get(id)?.name ?? id;
      captureFlip(id);
      setOrder(prev => arrayMove(prev, from, to));
      announce(`${name}, position ${to + 1} of ${FEATURES.length}.`);
    },
    [announce, captureFlip, order],
  );

  // ---- pointer drag (raw pointer events, capture, zero drag library) ----

  const clearPendingPress = useCallback(() => {
    const pending = pendingPressRef.current;
    if (pending != null) {
      window.clearTimeout(pending.timer);
      pendingPressRef.current = null;
      setArmedId(null);
    }
  }, []);

  /** Measure slots and lift the card; shared by mouse-down and long-press. */
  const liftCard = useCallback(
    (id: string, pointerId: number, startY: number) => {
      if (grabbed != null) {
        endGrab(grabbed.id, true);
      }
      const origin = order.indexOf(id);
      const node = itemNodes.current.get(id);
      if (origin < 0 || node == null) {
        return;
      }
      // Real rects at drag start double as slot tops for the whole drag:
      // rows are uniform height, and measuring includes the cut line.
      const tops = order.map(cardId => {
        const rowNode = itemNodes.current.get(cardId);
        return rowNode == null ? 0 : rowNode.getBoundingClientRect().top;
      });
      dragMetaRef.current = {pointerId, startY, moved: false};
      setDrag({
        id,
        origin,
        projected: origin,
        dy: 0,
        tops,
        height: node.getBoundingClientRect().height,
      });
    },
    [endGrab, grabbed, order],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
      if (drag != null || pendingPressRef.current != null) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      if (event.pointerType === 'touch') {
        // Long-press arms the lift; moving past the slop cancels it.
        const timer = window.setTimeout(() => {
          const pending = pendingPressRef.current;
          if (pending != null && pending.id === id) {
            pendingPressRef.current = null;
            setArmedId(null);
            liftCard(id, pending.pointerId, pending.startY);
          }
        }, LONG_PRESS_MS);
        pendingPressRef.current = {
          id,
          pointerId: event.pointerId,
          startY: event.clientY,
          timer,
        };
        setArmedId(id);
        return;
      }
      liftCard(id, event.pointerId, event.clientY);
    },
    [drag, liftCard],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const pending = pendingPressRef.current;
      if (pending != null && event.pointerId === pending.pointerId) {
        if (Math.abs(event.clientY - pending.startY) > TOUCH_SLOP_PX) {
          clearPendingPress();
        }
        return;
      }
      const meta = dragMetaRef.current;
      if (meta == null || event.pointerId !== meta.pointerId) {
        return;
      }
      const dy = event.clientY - meta.startY;
      if (Math.abs(dy) > 4) {
        meta.moved = true;
      }
      setDrag(prev => {
        if (prev == null) {
          return prev;
        }
        // Project the lifted card's center onto the nearest slot center.
        const center = prev.tops[prev.origin] + dy + prev.height / 2;
        let projected = 0;
        let best = Number.POSITIVE_INFINITY;
        for (let slot = 0; slot < prev.tops.length; slot++) {
          const distance = Math.abs(center - (prev.tops[slot] + prev.height / 2));
          if (distance < best) {
            best = distance;
            projected = slot;
          }
        }
        return {...prev, dy, projected};
      });
    },
    [clearPendingPress],
  );

  /** Release path: commit the projected slot (or spring back) via FLIP. */
  const finishDrag = useCallback(
    (commit: boolean) => {
      const meta = dragMetaRef.current;
      dragMetaRef.current = null;
      if (drag == null) {
        return;
      }
      suppressClickRef.current = meta?.moved ?? false;
      const {id, origin, projected} = drag;
      const name = FEATURE_BY_ID.get(id)?.name ?? id;
      // Snapshot the lifted position (transform included) so the settle
      // animates from under the pointer into the final slot.
      captureFlip(id);
      setDrag(null);
      if (commit && projected !== origin) {
        setOrder(prev => arrayMove(prev, origin, projected));
        pushMoveHistory(id, origin, projected);
        announce(
          `Moved ${name} from position ${origin + 1} to position ${
            projected + 1
          } of ${FEATURES.length}.`,
        );
      } else if (commit) {
        announce(`${name} stayed at position ${origin + 1}.`);
      } else {
        announce(`Drag cancelled. ${name} stayed at position ${origin + 1}.`);
      }
    },
    [announce, captureFlip, drag, pushMoveHistory],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const pending = pendingPressRef.current;
      if (pending != null && event.pointerId === pending.pointerId) {
        // Released before the long-press armed: fall through to click,
        // which toggles grab mode (the tap path on touch).
        clearPendingPress();
        return;
      }
      const meta = dragMetaRef.current;
      if (meta != null && event.pointerId === meta.pointerId) {
        finishDrag(true);
      }
    },
    [clearPendingPress, finishDrag],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const pending = pendingPressRef.current;
      if (pending != null && event.pointerId === pending.pointerId) {
        clearPendingPress();
        return;
      }
      const meta = dragMetaRef.current;
      if (meta != null && event.pointerId === meta.pointerId) {
        finishDrag(false);
      }
    },
    [clearPendingPress, finishDrag],
  );

  const handleHandleClick = useCallback(
    (id: string) => {
      if (suppressClickRef.current) {
        // A real drag just ended; this click is its residue, not a grab.
        suppressClickRef.current = false;
        return;
      }
      toggleGrab(id);
    },
    [toggleGrab],
  );

  const handleHandleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, id: string) => {
      if (drag != null && event.key === 'Escape') {
        event.preventDefault();
        finishDrag(false);
        return;
      }
      if (grabbed?.id !== id) {
        return;
      }
      const index = order.indexOf(id);
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveGrabbed(id, index - 1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveGrabbed(id, index + 1);
          break;
        case 'Home':
          event.preventDefault();
          moveGrabbed(id, 0);
          break;
        case 'End':
          event.preventDefault();
          moveGrabbed(id, FEATURES.length - 1);
          break;
        case 'Escape':
          event.preventDefault();
          endGrab(id, false);
          break;
        default:
          break;
      }
    },
    [drag, endGrab, finishDrag, grabbed, moveGrabbed, order],
  );

  const handleHandleBlur = useCallback(
    (id: string) => {
      // Focus left mid-grab: commit where it stands rather than trap state.
      if (grabbed?.id === id) {
        endGrab(id, true);
      }
    },
    [endGrab, grabbed],
  );

  // ---- batch actions: sort, reset, undo ----

  const applyBatch = useCallback(
    (label: string, next: string[]) => {
      if (next.join('\n') === order.join('\n')) {
        announce(`${label}: order unchanged.`);
        return;
      }
      const prevOrder = [...order];
      captureFlip(null);
      setOrder(next);
      setHistory(prev => [
        ...prev,
        {kind: 'batch', seq: historySeqRef.current++, label, prevOrder},
      ]);
      announce(`${label}. Top card is now ${FEATURE_BY_ID.get(next[0])?.name}.`);
    },
    [announce, captureFlip, order],
  );

  const handleSortRoi = useCallback(() => {
    applyBatch('Sorted by ROI', roiOrder(order));
  }, [applyBatch, order]);

  const handleReset = useCallback(() => {
    applyBatch('Reset order', [...INITIAL_ORDER]);
  }, [applyBatch]);

  /** Rewind through chip `index` (and every newer chip) in reverse. */
  const undoTo = useCallback(
    (index: number) => {
      const entries = history.slice(index);
      if (entries.length === 0) {
        return;
      }
      let next = [...order];
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (entry.kind === 'move') {
          next = arrayMove(next, entry.to, entry.from);
        } else {
          next = [...entry.prevOrder];
        }
      }
      const primary =
        entries.length === 1 && entries[0].kind === 'move'
          ? entries[0].cardId
          : null;
      captureFlip(primary);
      setOrder(next);
      setHistory(prev => prev.slice(0, index));
      if (entries.length === 1) {
        announce(`Undid ${entryLabel(entries[0])}.`);
      } else {
        announce(`Undid ${entries.length} moves.`);
      }
    },
    [announce, captureFlip, history, order],
  );

  // ---- derived render state ----

  const topEffort = order
    .slice(0, TOP_COUNT)
    .reduce((sum, id) => sum + (FEATURE_BY_ID.get(id)?.effort ?? 0), 0);

  /**
   * Per-row preview transform while a card is in flight. Slot targets are
   * the rects measured at lift time, so displacement across the cut line
   * is exact — siblings land on the previewed slot, then release commits.
   */
  const rowMotion = useMemo(() => {
    const motion = new Map<string, {transform?: string; transition?: string}>();
    if (drag == null) {
      return motion;
    }
    const {id: dragId, origin, projected, dy, tops} = drag;
    const previewTransition = prefersReducedMotion ? 'none' : PREVIEW_TRANSITION;
    order.forEach((cardId, index) => {
      if (cardId === dragId) {
        motion.set(cardId, {
          transform: `translateY(${dy}px) scale(1.02)`,
          transition: 'none',
        });
        return;
      }
      let previewIndex = index;
      if (origin < projected && index > origin && index <= projected) {
        previewIndex = index - 1;
      } else if (origin > projected && index >= projected && index < origin) {
        previewIndex = index + 1;
      }
      const shift = tops[previewIndex] - tops[index];
      motion.set(cardId, {
        transform: shift === 0 ? undefined : `translateY(${shift}px)`,
        transition: previewTransition,
      });
    });
    return motion;
  }, [drag, order, prefersReducedMotion]);

  // ---- chrome ----

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ListOrderedIcon} size="md" color="secondary" />
            <Heading level={1} maxLines={1}>
              Launch priority
            </Heading>
            <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
              · top-3 load {topEffort}/{capacity} pts
            </Text>
          </HStack>
        </StackItem>
        <Button
          label="Sort by ROI"
          variant="ghost"
          size="sm"
          icon={<Icon icon={ArrowDownWideNarrowIcon} size="sm" color="inherit" />}
          tooltip="Order by impact per effort point"
          onClick={handleSortRoi}
        />
        <Button
          label="Reset"
          variant="ghost"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          tooltip="Restore the original order"
          onClick={handleReset}
        />
        <Button
          label="Undo"
          size="sm"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          isDisabled={history.length === 0}
          tooltip={
            history.length === 0
              ? 'Nothing to undo'
              : `Undo ${entryLabel(history[history.length - 1])}`
          }
          onClick={() => undoTo(history.length - 1)}
        />
      </HStack>
    </LayoutHeader>
  );

  const rankList = (
    <div
      style={{
        ...styles.list,
        ...(drag != null ? styles.listDragging : undefined),
      }}>
      {order.map((cardId, index) => {
        const card = FEATURE_BY_ID.get(cardId)!;
        const motionEntry = rowMotion.get(cardId);
        return (
          <div key={cardId} style={{display: 'contents'}}>
            {index === TOP_COUNT && <CutLine />}
            <RankRow
              card={card}
              rank={index + 1}
              isTop={index < TOP_COUNT}
              isDraggedCard={drag?.id === cardId}
              isGrabbed={grabbed?.id === cardId}
              isArmed={armedId === cardId}
              isCompact={isCompact}
              transform={motionEntry?.transform}
              transition={motionEntry?.transition}
              registerNode={registerNode}
              onHandlePointerDown={handlePointerDown}
              onHandlePointerMove={handlePointerMove}
              onHandlePointerUp={handlePointerUp}
              onHandlePointerCancel={handlePointerCancel}
              onHandleClick={handleHandleClick}
              onHandleKeyDown={handleHandleKeyDown}
              onHandleBlur={handleHandleBlur}
            />
          </div>
        );
      })}
    </div>
  );

  const analysisPanel = (
    <LayoutPanel width={320} hasDivider padding={0} label="Ranking analysis">
      <div style={styles.panelScroll}>
        <VStack gap={4}>
          <Heading level={2}>Launch analysis</Heading>
          <AnalysisMeters
            order={order}
            capacity={capacity}
            onCapacityChange={value => setCapacity(Number(value))}
          />
          <Divider />
          <OwnerLoad order={order} />
          <Divider />
          <VStack gap={2}>
            <Text type="label">Move history</Text>
            <HistoryStrip history={history} onUndoTo={undoTo} isHorizontal={false} />
          </VStack>
        </VStack>
      </div>
    </LayoutPanel>
  );

  const condensedAnalysis = (
    <VStack gap={2}>
      <div style={styles.summaryStrip}>
        <AnalysisMeters
          order={order}
          capacity={capacity}
          onCapacityChange={value => setCapacity(Number(value))}
          isCondensed
        />
      </div>
      <HistoryStrip history={history} onUndoTo={undoTo} isHorizontal />
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={header}
      end={!isSinglePane ? analysisPanel : undefined}
      content={
        <LayoutContent>
          {/* Reduced-motion flash keyframe + handle hover/focus rules. */}
          <style>{GLOBAL_CSS}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div id="drag-rank-grab-help" style={styles.visuallyHidden}>
            Press Space to lift the card, arrow keys to move it, Space again
            to drop, Escape to cancel. On touch, press and hold to drag.
          </div>
          <VStack gap={3}>
            {isSinglePane ? condensedAnalysis : null}
            {rankList}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
