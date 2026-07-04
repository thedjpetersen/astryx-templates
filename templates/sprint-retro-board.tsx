// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs Atlas Q3 "Sprint 24"
 *   retrospective (Jun 29 – Jul 12 sprint, retro held Wed Jul 15, 2026):
 *   thirteen sticky cards across three columns with fixed base vote tallies,
 *   one labeled card cluster, a nine-person participant roster, three action
 *   items, and a fixed facilitator timer string ("04:32" — never ticking).
 *   No clocks, no randomness, no network media.
 * @output Sprint Retrospective Board — a live team retro surface for Sprint
 *   24 of the Atlas Q3 program. A facilitator bar (retro title + sprint
 *   window, facilitator chip, brainstorm→vote→discuss phase stepper pinned
 *   on "Vote", fixed 04:32 timer chip); a vote toolbar with your dot-budget
 *   strip ("3 of 5 votes left" pips), a participation meter ("7 of 9 added
 *   cards" with contributor facepile and waiting-on names), and an
 *   Added/Top-voted order toggle; three retro columns (Went well / Didn't
 *   go well / Ideas) of author-attributed sticky cards — two posted
 *   anonymously — each carrying a 0–5 dot-vote chip you can toggle against
 *   your budget, with the "CI flakiness" bundle outlining three grouped
 *   cards under one reconciling tally; and a 320px action-items panel
 *   (owner + due chips, one item badged as carried over from Sprint 23).
 * @position Page template; emitted by `astryx template sprint-retro-board`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (facilitator bar) | content (vote toolbar pinned above a
 *   horizontal board row of three flexible columns, each column's card list
 *   scrolling independently) | end panel 320 (action items, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   design-system Cards. Sticky cards, the cluster bundle, and the action
 *   item rows are styled divs; the action-items panel is a LayoutPanel.
 * Color policy: token-pure chrome with ONE accent (current phase, your vote
 *   dots and pips, the vote-chip pressed ring). The only intentional
 *   literals are the three sticky-note column tints as explicit
 *   `light-dark()` pairs (green / red / indigo washes, dark side shifted to
 *   deep muted hues so token text keeps AA on both schemes) and the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for column glyph dots (the demo does not inject
 *   `--color-data-categorical-*`).
 *
 * Interaction contract (dot voting):
 * - Your votes live in useState (a Set of card ids seeded with two spent
 *   votes so the budget strip opens at "3 of 5 votes left"); every tally —
 *   per-card dots, the cluster bundle total, the budget pips — derives from
 *   that one Set so the numbers can never disagree.
 * - Each card's vote chip is a real <button> with aria-pressed; it removes
 *   your vote if present, spends one if budget remains, and is disabled
 *   (never hidden) at zero budget. A per-card MoreMenu mirrors the vote
 *   action and adds a "Flag for discussion" toggle as the keyboard/touch
 *   path. Every change is announced through a visually-hidden aria-live
 *   region.
 *
 * Responsive contract:
 * - > 1180px: full frame — facilitator bar, vote toolbar, three flexible
 *   columns (min 300px each), 320px action-items panel.
 * - <= 1180px: the action-items panel is dropped; the board stays the
 *   source of truth (the panel's items restate retro outcomes, not data
 *   that exists nowhere else).
 * - <= 900px: columns become 85vw tiles in a scroll-snap horizontal
 *   scroller so each swipe lands on exactly one column; the facilitator
 *   bar and vote toolbar wrap (flexWrap) instead of clipping.
 * - Each column's card list scrolls vertically and independently
 *   (`minHeight: 0` down every flex chain); the facilitator bar, vote
 *   toolbar, and column headers stay pinned.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  CalendarClockIcon,
  CheckIcon,
  ChevronRightIcon,
  FlagIcon,
  FrownIcon,
  GhostIcon,
  LayersIcon,
  LightbulbIcon,
  PlusIcon,
  SmileIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const CAT_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const CAT_ORANGE = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const CAT_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},

  // Facilitator bar ------------------------------------------------------
  facilitatorChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px 2px 4px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
  },
  phaseList: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    listStyle: 'none',
    margin: 0,
    padding: 0,
    flexWrap: 'wrap',
  },
  phasePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    border: 'var(--border-width) solid transparent',
  },
  phaseDone: {
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-muted)',
  },
  phaseCurrent: {
    // Accent outline only — no literal tint pair, keeping the
    // single-accent policy honest across both schemes.
    color: 'var(--color-accent)',
    border: 'var(--border-width) solid var(--color-accent)',
  },
  phaseUpcoming: {color: 'var(--color-text-secondary)'},
  phaseConnector: {display: 'inline-flex', color: 'var(--color-text-secondary)'},
  timerChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
  },
  timerText: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },

  // Vote toolbar ----------------------------------------------------------
  voteToolbar: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  budgetPips: {display: 'inline-flex', alignItems: 'center', gap: 4},
  pip: {width: 10, height: 10, borderRadius: '50%'},
  pipLeft: {backgroundColor: 'var(--color-accent)'},
  pipSpent: {
    // border-emphasized (not border) — matches voteDotEmpty and keeps the
    // hollow pips legible on the dark scheme.
    boxShadow: 'inset 0 0 0 1.5px var(--color-border-emphasized)',
  },
  meterBar: {minWidth: 0, width: 96},
  waitingText: {whiteSpace: 'nowrap'},

  // Board -----------------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  boardScroll: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-4)',
    overflowX: 'auto',
  },
  boardSnap: {scrollSnapType: 'x mandatory'},
  column: {
    flex: '1 1 0',
    minWidth: 300,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  columnCompact: {flex: '0 0 85vw', minWidth: 0, scrollSnapAlign: 'start'},
  columnHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  columnGlyph: {display: 'inline-flex', flexShrink: 0},
  columnBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
  },

  // Sticky cards -----------------------------------------------------------
  // Column tints are the documented literal exception: sticky-note washes
  // as explicit light-dark() pairs; text on them stays token-driven.
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
  },
  cardWell: {
    backgroundColor: 'light-dark(#EFFAF1, #17251C)',
    border: 'var(--border-width) solid light-dark(#CDEBD4, #2C4636)',
  },
  cardBad: {
    backgroundColor: 'light-dark(#FDF1EF, #2A1B18)',
    border: 'var(--border-width) solid light-dark(#F3D3CC, #4A2E28)',
  },
  cardIdea: {
    backgroundColor: 'light-dark(#F1F3FE, #1B2030)',
    border: 'var(--border-width) solid light-dark(#D5DCF5, #303A55)',
  },
  cardText: {margin: 0},

  authorRow: {minWidth: 0},
  anonBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) dashed var(--color-border-emphasized)',
  },
  discussChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
    border: 'var(--border-width) solid var(--color-border-emphasized)',
    backgroundColor: 'var(--color-background-surface)',
  },

  // Vote chip ---------------------------------------------------------------
  voteChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-secondary)',
    font: 'inherit',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  voteChipMine: {
    // Inset ring so the pressed state never bleeds onto neighbors.
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-text-primary)',
  },
  voteChipDisabled: {cursor: 'not-allowed', opacity: 0.55},
  voteDots: {display: 'inline-flex', alignItems: 'center', gap: 3},
  voteDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-secondary)',
  },
  voteDotMine: {backgroundColor: 'var(--color-accent)'},
  voteDotEmpty: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    boxShadow: 'inset 0 0 0 1px var(--color-border-emphasized)',
  },

  // Cluster bundle -----------------------------------------------------------
  clusterFrame: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: '1.5px dashed var(--color-border-emphasized)',
  },
  clusterLabelRow: {minWidth: 0},
  clusterGlyph: {display: 'inline-flex', flexShrink: 0, color: CAT_ORANGE},

  // Action-items panel ---------------------------------------------------------
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-3) var(--spacing-3)',
  },
  actionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  actionSource: {margin: 0},
  panelFooter: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  reviewNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },

  // A11y -------------------------------------------------------------------------
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    border: 0,
    clipPath: 'inset(50%)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — Kestrel Labs · Atlas Q3 · Sprint 24 retro (Wed Jul 15, 2026)
// ---------------------------------------------------------------------------

/** The first-person viewer — matches the Marcus Webb "you" used across the
 * Team Workspace suite (see meet-recap). */
const YOU = 'Marcus Webb';

const VOTE_BUDGET = 5;

const RETRO = {
  title: 'Sprint 24 Retrospective',
  program: 'Atlas Q3',
  sprintWindow: 'Jun 29 – Jul 12',
  heldOn: 'Wed Jul 15, 2026',
  channel: '#atlas-q3',
  facilitator: 'Priya Raman',
  /** Fixed string — the timer never ticks (deterministic fixture). */
  timerRemaining: '04:32',
};

type PhaseId = 'brainstorm' | 'vote' | 'discuss';

const PHASES: ReadonlyArray<{id: PhaseId; label: string}> = [
  {id: 'brainstorm', label: 'Brainstorm'},
  {id: 'vote', label: 'Vote'},
  {id: 'discuss', label: 'Discuss'},
];

const CURRENT_PHASE: PhaseId = 'vote';

/** Nine retro participants — the Atlas Q3 core roster plus the two July
 * joiners (Ava Jul 1, Ken Jul 6). */
const ROSTER: ReadonlyArray<{name: string; role: string}> = [
  {name: 'Priya Raman', role: 'VP Engineering · facilitator'},
  {name: 'Marcus Webb', role: 'Platform lead'},
  {name: 'Sofia Ortiz', role: 'Design lead'},
  {name: 'Jonah Fields', role: 'Launch PM'},
  {name: 'Dana Whitfield', role: 'People Ops'},
  {name: 'Elena Voss', role: 'Finance lead'},
  {name: 'Tom Okonkwo', role: 'IT admin'},
  {name: 'Ava Lindqvist', role: 'Engineering · joined Jul 1'},
  {name: 'Ken Tanaka', role: 'GTM · joined Jul 6'},
];

/** 7 of 9 added cards — matches the named authors below (anonymous cards
 * still count toward their author's participation). */
const CONTRIBUTORS: ReadonlyArray<string> = [
  'Priya Raman',
  'Marcus Webb',
  'Sofia Ortiz',
  'Jonah Fields',
  'Dana Whitfield',
  'Elena Voss',
  'Ava Lindqvist',
];

const WAITING_ON: ReadonlyArray<string> = ['Tom Okonkwo', 'Ken Tanaka'];

type ColumnId = 'well' | 'bad' | 'idea';

const CLUSTER = {
  id: 'ci-flakiness',
  label: 'CI flakiness',
  column: 'bad' as ColumnId,
};

interface RetroCardData {
  id: string;
  column: ColumnId;
  /** null = posted anonymously (two cards on the board). */
  author: string | null;
  text: string;
  /** Dot votes from the other eight participants — your own votes live in
   * state so every tally re-derives from one source. */
  baseVotes: number;
  clusterId?: string;
}

const CARDS: ReadonlyArray<RetroCardData> = [
  // Went well ---------------------------------------------------------------
  {
    id: 'w1',
    column: 'well',
    author: 'Sofia Ortiz',
    text: 'Beta onboarding ran itself — zero pager noise through the Jul 8 cohort dry run.',
    baseVotes: 3,
  },
  {
    id: 'w2',
    column: 'well',
    author: 'Marcus Webb',
    text: 'Pairing rotation got Ava shipping to prod in her first week.',
    baseVotes: 2,
  },
  {
    id: 'w3',
    column: 'well',
    author: 'Jonah Fields',
    text: 'Readiness-review prep doc was ready a full day early for the Jul 9 session.',
    baseVotes: 1,
  },
  {
    id: 'w4',
    column: 'well',
    author: null,
    text: 'Async standup threads stayed under five minutes all sprint.',
    baseVotes: 0,
  },
  // Didn't go well — three cards bundle under the CI flakiness cluster -------
  {
    id: 'd1',
    column: 'bad',
    author: 'Marcus Webb',
    text: 'checkout-e2e failed 11 of 40 runs on main — every one a retry pass, zero real breaks.',
    baseVotes: 4,
    clusterId: CLUSTER.id,
  },
  {
    id: 'd2',
    column: 'bad',
    author: 'Ava Lindqvist',
    text: "Lost half a day bisecting a 'failure' that turned out to be the flaky billing webhook mock.",
    baseVotes: 3,
    clusterId: CLUSTER.id,
  },
  {
    id: 'd3',
    column: 'bad',
    author: null,
    text: 'Merge queue sat red for 3+ hours on Thursday re-running known-flaky suites.',
    baseVotes: 2,
    clusterId: CLUSTER.id,
  },
  {
    id: 'd4',
    column: 'bad',
    author: 'Dana Whitfield',
    text: 'Pricing copy freeze slipped two days waiting on legal review.',
    baseVotes: 2,
  },
  {
    id: 'd5',
    column: 'bad',
    author: 'Elena Voss',
    text: 'Too many mid-sprint scope adds landing straight from #atlas-q3 threads.',
    baseVotes: 3,
  },
  // Ideas ---------------------------------------------------------------------
  {
    id: 'i1',
    column: 'idea',
    author: 'Marcus Webb',
    text: 'Quarantine any suite that flakes twice in a week; track burn-down on the infra board.',
    baseVotes: 4,
  },
  {
    id: 'i2',
    column: 'idea',
    author: 'Priya Raman',
    text: 'Add a carry-over check to every retro so Sprint 23 items stop vanishing.',
    baseVotes: 2,
  },
  {
    id: 'i3',
    column: 'idea',
    author: 'Ava Lindqvist',
    text: 'Rotate a weekly build sheriff to own the merge queue.',
    baseVotes: 1,
  },
  {
    id: 'i4',
    column: 'idea',
    author: 'Sofia Ortiz',
    text: 'Publish a Beta Feedback Themes digest to #atlas-q3 every Friday.',
    baseVotes: 1,
  },
];

/** Your two votes already spent when the page loads — the budget strip
 * opens at "3 of 5 votes left" and both cards render one accent dot. */
const INITIAL_MY_VOTES: ReadonlyArray<string> = ['d4', 'i2'];

/** Cards the facilitator has already flagged for the discuss phase. */
const INITIAL_FLAGGED: ReadonlyArray<string> = ['d5'];

interface ColumnDef {
  id: ColumnId;
  title: string;
  icon: typeof SmileIcon;
  dotColor: string;
  tint: CSSProperties;
}

const COLUMNS: ReadonlyArray<ColumnDef> = [
  {id: 'well', title: 'Went well', icon: SmileIcon, dotColor: CAT_GREEN, tint: styles.cardWell},
  {id: 'bad', title: "Didn't go well", icon: FrownIcon, dotColor: CAT_ORANGE, tint: styles.cardBad},
  {id: 'idea', title: 'Ideas', icon: LightbulbIcon, dotColor: CAT_PURPLE, tint: styles.cardIdea},
];

interface ActionItemData {
  id: string;
  title: string;
  owner: string;
  due: string;
  source?: string;
  carriedFrom?: string;
}

const ACTION_ITEMS: ReadonlyArray<ActionItemData> = [
  {
    id: 'a1',
    title: 'Quarantine the checkout-e2e and billing-mock suites; report flake burn-down at the Thu review.',
    owner: 'Marcus Webb',
    due: 'Fri Jul 17',
    source: 'From the CI flakiness cluster',
  },
  {
    id: 'a2',
    title: 'Document the beta-flag rollback runbook before the Jul 21 cohort expansion.',
    owner: 'Sofia Ortiz',
    due: 'Thu Jul 16',
    carriedFrom: 'Sprint 23',
  },
  {
    id: 'a3',
    title: "Agree a legal-review SLA for pricing copy with Dana's freeze plan.",
    owner: 'Dana Whitfield',
    due: 'Mon Jul 20',
  },
];

// ---------------------------------------------------------------------------
// SMALL PIECES
// ---------------------------------------------------------------------------

/** Brainstorm → Vote → Discuss stepper, pinned on the vote phase. The
 * phases are facilitator-controlled, so this renders as a status list —
 * not buttons. */
function PhaseStepper() {
  const currentIndex = PHASES.findIndex(phase => phase.id === CURRENT_PHASE);
  return (
    <ol style={styles.phaseList} aria-label="Retro phases">
      {PHASES.map((phase, index) => {
        const state =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        const pillStyle =
          state === 'done'
            ? {...styles.phasePill, ...styles.phaseDone}
            : state === 'current'
              ? {...styles.phasePill, ...styles.phaseCurrent}
              : {...styles.phasePill, ...styles.phaseUpcoming};
        return (
          <li key={phase.id} style={{display: 'inline-flex', alignItems: 'center', gap: 2}}>
            {index > 0 ? (
              <span style={styles.phaseConnector} aria-hidden="true">
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              </span>
            ) : null}
            <span
              style={pillStyle}
              aria-current={state === 'current' ? 'step' : undefined}>
              {state === 'done' ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : null}
              {phase.label}
              {state === 'done' ? (
                <span style={styles.visuallyHidden}> — completed</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Fixed facilitator timer — a deterministic string, never a running clock. */
function TimerChip() {
  return (
    <span style={styles.timerChip}>
      <Icon icon={TimerIcon} size="sm" color="secondary" />
      <span style={styles.timerText}>{RETRO.timerRemaining}</span>
      <Text type="supporting" color="secondary">
        left in Vote
      </Text>
    </span>
  );
}

/** Your dot budget: five pips, spent ones hollow. Derived entirely from the
 * myVotes Set so the strip and the card dots can never disagree. */
function BudgetStrip({votesLeft}: {votesLeft: number}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={styles.budgetPips} aria-hidden="true">
        {Array.from({length: VOTE_BUDGET}, (_, index) => (
          <span
            key={index}
            style={
              index < votesLeft
                ? {...styles.pip, ...styles.pipLeft}
                : {...styles.pip, ...styles.pipSpent}
            }
          />
        ))}
      </span>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {votesLeft} of {VOTE_BUDGET} votes left
      </Text>
    </HStack>
  );
}

/** "7 of 9 added cards" — the meter, the facepile, and the waiting-on names
 * all read from the same CONTRIBUTORS / WAITING_ON fixtures. */
function ParticipationStrip() {
  const visible = CONTRIBUTORS.slice(0, 5);
  const overflow = CONTRIBUTORS.length - visible.length;
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Icon icon={UsersIcon} size="sm" color="secondary" />
      {/* Footgun: design-system ProgressBar enforces minWidth 48 — the
          compact meter re-pins it via styles.meterBar (minWidth: 0). */}
      <div style={styles.meterBar}>
        <ProgressBar
          label="Participants who added cards"
          isLabelHidden
          value={CONTRIBUTORS.length}
          max={ROSTER.length}
          variant="neutral"
        />
      </div>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {CONTRIBUTORS.length} of {ROSTER.length} added cards
      </Text>
      <AvatarGroup
        size="xsmall"
        aria-label={`Contributors: ${CONTRIBUTORS.join(', ')}`}>
        {visible.map(name => (
          <Avatar key={name} name={name} />
        ))}
        {overflow > 0 ? <AvatarGroupOverflow count={overflow} /> : null}
      </AvatarGroup>
      <Tooltip content="Drafts started, not yet posted">
        <Text type="supporting" color="secondary" style={styles.waitingText}>
          Waiting on {WAITING_ON.join(' · ')}
        </Text>
      </Tooltip>
    </HStack>
  );
}

/** 0–5 vote dots; your dot renders last in accent. Empty state shows a
 * single hollow dot so zero-vote cards keep the chip's geometry. */
function VoteDots({votes, hasMine}: {votes: number; hasMine: boolean}) {
  const others = hasMine ? votes - 1 : votes;
  return (
    <span style={styles.voteDots} aria-hidden="true">
      {votes === 0 ? <span style={styles.voteDotEmpty} /> : null}
      {Array.from({length: others}, (_, index) => (
        <span key={index} style={styles.voteDot} />
      ))}
      {hasMine ? <span style={{...styles.voteDot, ...styles.voteDotMine}} /> : null}
    </span>
  );
}

interface RetroCardProps {
  card: RetroCardData;
  tint: CSSProperties;
  votes: number;
  hasMyVote: boolean;
  isFlagged: boolean;
  votesLeft: number;
  onToggleVote: (cardId: string) => void;
  onToggleFlag: (cardId: string) => void;
}

/** One sticky card: author row (Avatar or anonymous ghost), prose, and the
 * vote chip + MoreMenu footer. Styled div, not a Card — app-shell policy. */
function RetroCard({
  card,
  tint,
  votes,
  hasMyVote,
  isFlagged,
  votesLeft,
  onToggleVote,
  onToggleFlag,
}: RetroCardProps) {
  const voteDisabled = !hasMyVote && votesLeft === 0;
  const authorLabel = card.author ?? 'Anonymous';
  const excerpt = card.text.length > 44 ? `${card.text.slice(0, 44)}…` : card.text;
  const chipStyle = {
    ...styles.voteChip,
    ...(hasMyVote ? styles.voteChipMine : undefined),
    ...(voteDisabled ? styles.voteChipDisabled : undefined),
  };
  return (
    <div style={{...styles.card, ...tint}}>
      <HStack gap={2} vAlign="center" style={styles.authorRow}>
        {card.author === null ? (
          <Tooltip content="Posted anonymously">
            <span style={styles.anonBadge}>
              <Icon icon={GhostIcon} size="sm" color="inherit" />
            </span>
          </Tooltip>
        ) : (
          <Avatar name={card.author} size="xsmall" />
        )}
        <Text type="supporting" color="secondary">
          {authorLabel}
          {card.author === YOU ? ' (you)' : ''}
        </Text>
        <StackItem size="fill" />
        {isFlagged ? (
          <span style={styles.discussChip}>
            <Icon icon={FlagIcon} size="sm" color="inherit" />
            Discuss
          </span>
        ) : null}
      </HStack>
      <Text style={styles.cardText}>{card.text}</Text>
      <HStack gap={2} vAlign="center">
        <button
          type="button"
          style={chipStyle}
          aria-pressed={hasMyVote}
          disabled={voteDisabled}
          aria-label={`Vote for “${excerpt}” — ${votes} vote${votes === 1 ? '' : 's'}`}
          onClick={() => onToggleVote(card.id)}>
          <VoteDots votes={votes} hasMine={hasMyVote} />
          <span>
            {votes} vote{votes === 1 ? '' : 's'}
          </span>
        </button>
        <StackItem size="fill" />
        <MoreMenu
          label={`Card actions — ${authorLabel}: ${excerpt}`}
          size="sm"
          items={[
            hasMyVote
              ? {label: 'Remove your vote', onClick: () => onToggleVote(card.id)}
              : {
                  label: votesLeft > 0 ? 'Vote for this card' : 'Vote (no votes left)',
                  onClick: () => onToggleVote(card.id),
                },
            isFlagged
              ? {label: 'Remove discuss flag', onClick: () => onToggleFlag(card.id)}
              : {label: 'Flag for discussion', onClick: () => onToggleFlag(card.id)},
          ]}
        />
      </HStack>
    </div>
  );
}

/** The labeled bundle outline around grouped cards. The tally chip derives
 * from the same per-card vote math as the cards inside it. */
function ClusterFrame({
  count,
  tally,
  children,
}: {
  count: number;
  tally: number;
  children: ReactNode;
}) {
  return (
    <div
      style={styles.clusterFrame}
      role="group"
      aria-label={`Cluster: ${CLUSTER.label}, ${count} cards, ${tally} votes`}>
      <HStack gap={2} vAlign="center" style={styles.clusterLabelRow}>
        <span style={styles.clusterGlyph}>
          <Icon icon={LayersIcon} size="sm" color="inherit" />
        </span>
        <Text type="label">{CLUSTER.label}</Text>
        <Token label={`×${count}`} size="sm" color="orange" />
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {tally} votes
        </Text>
      </HStack>
      {children}
    </div>
  );
}

/** One retro column: pinned glyph header with a card count, independently
 * scrolling card list below. */
function RetroColumn({
  column,
  count,
  isCompact,
  children,
}: {
  column: ColumnDef;
  count: number;
  isCompact: boolean;
  children: ReactNode;
}) {
  return (
    <section
      style={
        isCompact ? {...styles.column, ...styles.columnCompact} : styles.column
      }
      aria-label={`${column.title} — ${count} cards`}>
      <div style={styles.columnHeader}>
        <HStack gap={2} vAlign="center">
          <span style={{...styles.columnGlyph, color: column.dotColor}}>
            <Icon icon={column.icon} size="sm" color="inherit" />
          </span>
          <Heading level={2}>
            {column.title}
          </Heading>
          <Token label={String(count)} size="sm" color="gray" />
        </HStack>
      </div>
      <div style={styles.columnBody}>{children}</div>
    </section>
  );
}

/** One action item row: title, owner + due chips, provenance line, and the
 * carried-over badge on items inherited from the previous retro. */
function ActionItemRow({item}: {item: ActionItemData}) {
  return (
    <div style={styles.actionItem}>
      {item.carriedFrom !== undefined ? (
        <HStack gap={2} vAlign="center">
          <Badge
            variant="warning"
            label={`Carried from ${item.carriedFrom}`}
            icon={<Icon icon={CalendarClockIcon} size="sm" color="inherit" />}
          />
        </HStack>
      ) : null}
      <Text style={styles.cardText}>{item.title}</Text>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Avatar name={item.owner} size="xsmall" />
        <Text type="supporting" color="secondary">
          {item.owner}
        </Text>
        <StackItem size="fill" />
        <Token label={`Due ${item.due}`} size="sm" color="blue" />
      </HStack>
      {item.source !== undefined ? (
        <Text type="supporting" color="secondary" style={styles.actionSource}>
          {item.source}
        </Text>
      ) : null}
    </div>
  );
}

/** 320px end panel: the three action items this retro produced, plus where
 * they get reviewed next. Restates board outcomes — safe to drop <=1180px. */
function ActionItemsPanel() {
  const carriedCount = ACTION_ITEMS.filter(
    item => item.carriedFrom !== undefined,
  ).length;
  return (
    <div style={styles.panelFill}>
      <div style={styles.panelHeader}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>
            Action items
          </Heading>
          <Token label={String(ACTION_ITEMS.length)} size="sm" color="gray" />
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {carriedCount} carried over
          </Text>
        </HStack>
      </div>
      <div style={styles.panelScroll}>
        <VStack gap={2}>
          {ACTION_ITEMS.map(item => (
            <ActionItemRow key={item.id} item={item} />
          ))}
          <div style={styles.reviewNote}>
            <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              Open items get reviewed at Atlas Q3 · Launch Readiness Review ·
              Thu Jul 16.
            </Text>
          </div>
        </VStack>
      </div>
      <div style={styles.panelFooter}>
        <Button
          label="Add action item"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type BoardOrder = 'added' | 'votes';

type BoardItem =
  | {kind: 'card'; card: RetroCardData; tally: number}
  | {kind: 'cluster'; cards: RetroCardData[]; tally: number};

export default function SprintRetroBoardTemplate() {
  // One Set is the single source of truth for every number the vote phase
  // shows: per-card dots, the cluster tally, and the budget strip.
  const [myVotes, setMyVotes] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_MY_VOTES),
  );
  const [flagged, setFlagged] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_FLAGGED),
  );
  const [order, setOrder] = useState<BoardOrder>('added');
  const [announcement, setAnnouncement] = useState('');

  const hidePanel = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const votesLeft = VOTE_BUDGET - myVotes.size;
  const votesFor = (card: RetroCardData) =>
    card.baseVotes + (myVotes.has(card.id) ? 1 : 0);

  const toggleVote = (cardId: string) => {
    const card = CARDS.find(item => item.id === cardId);
    if (card === undefined) {
      return;
    }
    const excerpt =
      card.text.length > 44 ? `${card.text.slice(0, 44)}…` : card.text;
    if (myVotes.has(cardId)) {
      setMyVotes(previous => {
        const next = new Set(previous);
        next.delete(cardId);
        return next;
      });
      setAnnouncement(
        `Removed your vote from “${excerpt}” — ${Math.min(
          votesLeft + 1,
          VOTE_BUDGET,
        )} of ${VOTE_BUDGET} votes left.`,
      );
      return;
    }
    if (votesLeft === 0) {
      setAnnouncement('No votes left — remove a vote to re-allocate it.');
      return;
    }
    setMyVotes(previous => new Set(previous).add(cardId));
    setAnnouncement(
      `Voted for “${excerpt}” — ${votesLeft - 1} of ${VOTE_BUDGET} votes left.`,
    );
  };

  const toggleFlag = (cardId: string) => {
    const card = CARDS.find(item => item.id === cardId);
    if (card === undefined) {
      return;
    }
    const excerpt =
      card.text.length > 44 ? `${card.text.slice(0, 44)}…` : card.text;
    const isFlagged = flagged.has(cardId);
    setFlagged(previous => {
      const next = new Set(previous);
      if (isFlagged) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
    setAnnouncement(
      isFlagged
        ? `Removed the discuss flag from “${excerpt}”.`
        : `Flagged “${excerpt}” for the discuss phase.`,
    );
  };

  // Derived during render (no effects, no memo — the board is 13 cards):
  // cluster cards collapse into one bundle item; "Top voted" sorts bundles
  // and loose cards on the same tally scale.
  const itemsForColumn = (columnId: ColumnId): BoardItem[] => {
    const items: BoardItem[] = [];
    for (const card of CARDS) {
      if (card.column !== columnId) {
        continue;
      }
      if (card.clusterId !== undefined) {
        const existing = items.find(item => item.kind === 'cluster');
        if (existing !== undefined && existing.kind === 'cluster') {
          existing.cards.push(card);
          existing.tally += votesFor(card);
        } else {
          items.push({kind: 'cluster', cards: [card], tally: votesFor(card)});
        }
        continue;
      }
      items.push({kind: 'card', card, tally: votesFor(card)});
    }
    if (order === 'votes') {
      return [...items].sort((a, b) => b.tally - a.tally);
    }
    return items;
  };

  const renderItem = (item: BoardItem, tint: CSSProperties) => {
    if (item.kind === 'cluster') {
      return (
        <ClusterFrame
          key={CLUSTER.id}
          count={item.cards.length}
          tally={item.tally}>
          {item.cards.map(card => (
            <RetroCard
              key={card.id}
              card={card}
              tint={tint}
              votes={votesFor(card)}
              hasMyVote={myVotes.has(card.id)}
              isFlagged={flagged.has(card.id)}
              votesLeft={votesLeft}
              onToggleVote={toggleVote}
              onToggleFlag={toggleFlag}
            />
          ))}
        </ClusterFrame>
      );
    }
    return (
      <RetroCard
        key={item.card.id}
        card={item.card}
        tint={tint}
        votes={votesFor(item.card)}
        hasMyVote={myVotes.has(item.card.id)}
        isFlagged={flagged.has(item.card.id)}
        votesLeft={votesLeft}
        onToggleVote={toggleVote}
        onToggleFlag={toggleFlag}
      />
    );
  };

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={1}>
              {RETRO.title}
            </Heading>
            <Token label={RETRO.program} size="sm" color="blue" />
          </HStack>
          <Text type="supporting" color="secondary">
            Sprint ran {RETRO.sprintWindow} · Retro {RETRO.heldOn} ·{' '}
            {RETRO.channel}
          </Text>
        </VStack>
        <span style={styles.facilitatorChip}>
          <Avatar name={RETRO.facilitator} size="xsmall" />
          <Text type="supporting" color="secondary">
            {RETRO.facilitator} · Facilitator
          </Text>
        </span>
        <StackItem size="fill" />
        <PhaseStepper />
        <TimerChip />
      </HStack>
    </LayoutHeader>
  );

  const voteToolbar = (
    <div style={styles.voteToolbar}>
      <HStack gap={4} vAlign="center" wrap="wrap">
        <BudgetStrip votesLeft={votesLeft} />
        <Divider orientation="vertical" />
        <ParticipationStrip />
        <StackItem size="fill" />
        <SegmentedControl
          label="Card order"
          value={order}
          onChange={value => setOrder(value as BoardOrder)}
          size="sm">
          <SegmentedControlItem label="Added" value="added" />
          <SegmentedControlItem label="Top voted" value="votes" />
        </SegmentedControl>
      </HStack>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              {voteToolbar}
              <div
                style={
                  isCompact
                    ? {...styles.boardScroll, ...styles.boardSnap}
                    : styles.boardScroll
                }>
                {COLUMNS.map(column => {
                  const items = itemsForColumn(column.id);
                  const count = CARDS.filter(
                    card => card.column === column.id,
                  ).length;
                  return (
                    <RetroColumn
                      key={column.id}
                      column={column}
                      count={count}
                      isCompact={isCompact}>
                      {items.map(item => renderItem(item, column.tint))}
                    </RetroColumn>
                  );
                })}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          hidePanel ? undefined : (
            <LayoutPanel width={320} padding={0} hasDivider label="Action items">
              <ActionItemsPanel />
            </LayoutPanel>
          )
        }
      />
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
    </div>
  );
}
