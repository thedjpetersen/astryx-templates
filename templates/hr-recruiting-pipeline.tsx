// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs applicant
 *   pipeline for one requisition (39 active candidates, 3 historical
 *   rejections, fixed ISO stage-entry dates in June/July 2026, a frozen
 *   "as of" date of 2026-07-03). No clocks, no randomness, no network
 *   media.
 * @output Recruiting Pipeline (ATS) — the applicant-tracking board for the
 *   Kestrel Labs "Senior Platform Engineer" req (REQ-1042, Engineering,
 *   SF HQ). A req header with recruiter/hiring-manager avatar chips, an
 *   interview-panel facepile, a seats-filled badge, and a target-close
 *   countdown with elapsed-progress bar; a pipeline-health strip showing
 *   per-stage reached counts as a labeled funnel with pass-through rates
 *   (vs target) between stages; and five fixed-width stage columns
 *   (Applied 24, Screen 8, Onsite 4, Offer 2, Hired 1) of candidate cards
 *   — name, source token, scorecard star average, next-step chip,
 *   days-in-stage — with a stalled amber ring at 14+ days, per-column
 *   conversion footers, MoreMenu advance/reject, and drag-and-drop moves.
 * @position Page template; emitted by `astryx template hr-recruiting-pipeline`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (req title row + owners/countdown/filter row, both wrap)
 *   | content column: pinned pipeline-health strip (scrolls x when
 *   crowded) above a horizontal board scroller of five 264px stage
 *   columns; each column pins its header and conversion footer around an
 *   independently scrolling card list (minHeight: 0 down the chain).
 * Container policy: board-column archetype per kanban-board.tsx —
 *   frame-first chrome, ClickableCard candidate tiles only; the health
 *   strip, column shells, and footers are styled divs, not Cards.
 * Color policy: token-pure. The only literals are `light-dark()` pairs:
 *   the amber stalled ring/text, the gold scorecard stars, and the
 *   repo-standard data-viz categorical fallbacks used by the funnel bars
 *   (the demo does not inject `--color-data-categorical-*`).
 *
 * Interaction contract:
 * - Candidate→stage assignment lives in useState; MoreMenu ("Advance to
 *   …", "Move to …", "Reject") is the always-available keyboard/touch
 *   path, HTML5 drag-and-drop the fine-pointer path, both announced via
 *   a visually-hidden aria-live region. Moving a card resets its
 *   days-in-stage to 0; rejecting removes it and books the rejection at
 *   the highest stage reached, so the health strip, column footers, and
 *   header counts all recompute and keep reconciling.
 * - Pass-through math: reached(stage) = active candidates whose highest
 *   stage ≥ stage + rejections booked at ≥ stage. Seed data reconciles
 *   to 42 → 16 → 7 → 3 → 1 (38% / 44% / 43% / 33%).
 *
 * Responsive contract:
 * - > 768px: five 264px columns (fits 1440 without scroll); the health
 *   strip lays out in one row and scrolls horizontally only if crowded.
 * - <= 768px: columns are 85vw with x-mandatory scroll-snap; both header
 *   rows wrap instead of clipping; the countdown block drops its
 *   progress bar to keep the row shallow.
 * - Drag-and-drop is gated to "(hover: hover) and (pointer: fine)";
 *   touch users move candidates through each card's MoreMenu, which
 *   upsizes from "sm" to "lg" when drag is unavailable.
 */

import {useCallback, useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowRightIcon,
  CalendarClockIcon,
  ClockAlertIcon,
  InboxIcon,
  PlusIcon,
  StarIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============================================================================
// Styles
// ============================================================================

const AMBER = 'light-dark(#B45309, #FBBF24)';
const STAR_GOLD = 'light-dark(#B45309, #FBBF24)';

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // --- Req header ---------------------------------------------------------
  ownerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  countdownBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    minWidth: 200,
  },
  countdownBar: {
    minWidth: 0,
    width: 200,
  },
  // --- Pipeline-health strip ----------------------------------------------
  healthStrip: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-1)',
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflowX: 'auto',
  },
  healthCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    justifyContent: 'center',
    minWidth: 106,
    flex: '1 1 0',
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  // The Applied → Hired summary cell carries the longest labels
  // ("Applied → Hired", "39 active · 3 rejected"), so it gets a wider
  // floor than the per-stage cells to keep both lines from wrapping.
  healthCellSummary: {
    minWidth: 140,
  },
  healthArrow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 60,
    flexShrink: 0,
    padding: 'var(--spacing-1) 0',
  },
  funnelTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  funnelFill: {
    height: '100%',
    borderRadius: 999,
  },
  // --- Board + columns ------------------------------------------------------
  board: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    flex: 1,
    minHeight: 0,
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
  columnFooter: {
    flexShrink: 0,
    padding: 'var(--spacing-2)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  columnEmpty: {
    padding: 'var(--spacing-4) 0',
  },
  columnDropTarget: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // --- Candidate cards -------------------------------------------------------
  cardDragging: {
    opacity: 0.5,
  },
  // Inset ring painted by the ClickableCard itself (above its background,
  // below its padded content) so the stalled highlight never bleeds onto
  // neighboring cards.
  cardStalled: {
    boxShadow: `inset 0 0 0 2px ${AMBER}`,
  },
  stalledText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: AMBER,
    whiteSpace: 'nowrap',
  },
  daysText: {
    whiteSpace: 'nowrap',
  },
  starRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    color: STAR_GOLD,
  },
  deltaGood: {
    color: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    whiteSpace: 'nowrap',
  },
  deltaBad: {
    color: AMBER,
    whiteSpace: 'nowrap',
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

// ============================================================================
// Domain model + fixture constants
// ============================================================================

type StageId = 'applied' | 'screen' | 'onsite' | 'offer' | 'hired';
type SourceId = 'referral' | 'linkedin' | 'agency' | 'inbound' | 'university';
type OfficeId = 'SF HQ' | 'Lisbon' | 'Remote-US';

interface Candidate {
  id: string;
  name: string;
  location: OfficeId;
  source: SourceId;
  /** Kestrel employee who referred the candidate (referral source only). */
  referrer?: string;
  stage: StageId;
  /** ISO date the candidate entered their current stage. */
  entered: string;
  /** Scorecard average on the 1–4 Kestrel rubric; null until first score. */
  score: number | null;
  scorecards: number;
  nextStep: string;
  nextStepTone: TokenColor;
}

/** Frozen "today" — every days-in-stage readout derives from this. */
const AS_OF_ISO = '2026-07-03';

const STAGES: ReadonlyArray<{id: StageId; title: string}> = [
  {id: 'applied', title: 'Applied'},
  {id: 'screen', title: 'Screen'},
  {id: 'onsite', title: 'Onsite'},
  {id: 'offer', title: 'Offer'},
  {id: 'hired', title: 'Hired'},
];

const STAGE_INDEX: Record<StageId, number> = {
  applied: 0,
  screen: 1,
  onsite: 2,
  offer: 3,
  hired: 4,
};

/** Days in stage at which a candidate is flagged as stalled. */
const STALLED_DAYS = 14;

/** Funnel bar color per stage — repo-standard categorical fallbacks. */
const STAGE_BAR_COLOR: Record<StageId, string> = {
  applied: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  screen: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  onsite: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  offer: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  hired: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
};

const SOURCE_META: Record<SourceId, {label: string; color: TokenColor}> = {
  referral: {label: 'Referral', color: 'green'},
  linkedin: {label: 'LinkedIn', color: 'blue'},
  agency: {label: 'Agency', color: 'purple'},
  inbound: {label: 'Inbound', color: 'teal'},
  university: {label: 'University', color: 'orange'},
};

const SOURCE_OPTIONS = [
  {value: 'all', label: 'All sources'},
  {value: 'referral', label: 'Referral'},
  {value: 'linkedin', label: 'LinkedIn'},
  {value: 'agency', label: 'Agency'},
  {value: 'inbound', label: 'Inbound'},
  {value: 'university', label: 'University'},
];

/**
 * Pass-through targets between consecutive stages (Applied→Screen,
 * Screen→Onsite, Onsite→Offer, Offer→Hired) from the People Ops
 * benchmark for L5 engineering reqs.
 */
const CONVERSION_TARGETS = [0.35, 0.4, 0.4, 0.6];

/**
 * Historical rejections booked before the frozen "as of" date: two
 * candidates rejected at Applied, one at Screen. These keep the seeded
 * funnel at 42 → 16 → 7 → 3 → 1 without carrying 3 extra card fixtures.
 */
const BASELINE_REJECTIONS: ReadonlyArray<StageId> = [
  'applied',
  'applied',
  'screen',
];

// --- Req metadata (REQ-1042) ------------------------------------------------

const REQ = {
  id: 'REQ-1042',
  title: 'Senior Platform Engineer',
  department: 'Engineering',
  office: 'SF HQ' as OfficeId,
  level: 'L5',
  seats: 2,
  seatsFilled: 1,
  openedIso: '2026-06-01',
  openedLabel: 'Jun 1',
  targetCloseIso: '2026-07-31',
  targetCloseLabel: 'Jul 31',
  recruiter: 'Dana Whitfield',
  hiringManager: 'Marcus Webb',
  panel: ['Priya Raman', 'Tom Okonkwo', 'Sofia Ortiz'],
  /** Days from Ava Lindqvist's application (Jun 2) to hire (Jul 1). */
  medianTimeToHireDays: 29,
};

// ============================================================================
// Date helpers (pure, frozen clock)
// ============================================================================

function isoToUtc(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

const DAY_MS = 86_400_000;

/** Whole days from `iso` to the frozen as-of date (positive = past). */
function daysSince(iso: string): number {
  return Math.round((isoToUtc(AS_OF_ISO) - isoToUtc(iso)) / DAY_MS);
}

/** Whole days from the frozen as-of date to `iso` (positive = future). */
function daysUntil(iso: string): number {
  return -daysSince(iso);
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

// ============================================================================
// Candidate fixtures — 39 active candidates as of 2026-07-03
// (Applied 24, Screen 8, Onsite 4, Offer 2, Hired 1)
// ============================================================================

/**
 * Applied-stage entries share one shape: unscored, next step "Review
 * application" — except referrals, which queue a recruiter intro call.
 */
function appliedCandidate(
  id: string,
  name: string,
  location: OfficeId,
  source: SourceId,
  entered: string,
  referrer?: string,
): Candidate {
  const isReferral = referrer !== undefined;
  return {
    id,
    name,
    location,
    source,
    referrer,
    stage: 'applied',
    entered,
    score: null,
    scorecards: 0,
    nextStep: isReferral ? 'Recruiter intro call' : 'Review application',
    nextStepTone: isReferral ? 'blue' : 'gray',
  };
}

const CANDIDATES: ReadonlyArray<Candidate> = [
  // --- Applied (24) ---------------------------------------------------------
  appliedCandidate('cand-01', 'Nadia Osei', 'Remote-US', 'linkedin', '2026-07-02'),
  appliedCandidate('cand-02', 'Peter Kowalczyk', 'SF HQ', 'inbound', '2026-07-01'),
  appliedCandidate('cand-03', 'Grace Ellison', 'SF HQ', 'referral', '2026-07-01', 'Priya Raman'),
  appliedCandidate('cand-04', 'Diego Salazar', 'Remote-US', 'linkedin', '2026-06-30'),
  appliedCandidate('cand-05', 'Hana Yoshida', 'SF HQ', 'university', '2026-06-29'),
  appliedCandidate('cand-06', 'Samuel Adeyemi', 'Remote-US', 'inbound', '2026-06-28'),
  appliedCandidate('cand-07', 'Ingrid Halvorsen', 'Lisbon', 'agency', '2026-06-27'),
  appliedCandidate('cand-08', 'Omar Haddad', 'Remote-US', 'linkedin', '2026-06-26'),
  appliedCandidate('cand-09', 'Lucia Moretti', 'Lisbon', 'inbound', '2026-06-25'),
  appliedCandidate('cand-10', 'Felix Braun', 'Remote-US', 'linkedin', '2026-06-25'),
  appliedCandidate('cand-11', 'Tessa Nguyen', 'SF HQ', 'referral', '2026-06-24', 'Sofia Ortiz'),
  appliedCandidate('cand-12', 'Ravi Chandran', 'Remote-US', 'inbound', '2026-06-23'),
  appliedCandidate('cand-13', 'Maren Skou', 'Lisbon', 'linkedin', '2026-06-22'),
  appliedCandidate('cand-14', 'Jules Barbier', 'Lisbon', 'agency', '2026-06-21'),
  appliedCandidate('cand-15', 'Yara Mansour', 'Remote-US', 'inbound', '2026-06-21'),
  appliedCandidate('cand-16', 'Callum Reid', 'SF HQ', 'linkedin', '2026-06-20'),
  // cand-17 through cand-24 entered Applied 14+ days before the frozen
  // as-of date — they render with the stalled amber ring.
  appliedCandidate('cand-17', 'Bianca Farkas', 'Remote-US', 'university', '2026-06-19'),
  appliedCandidate('cand-18', 'Dmitri Volkov', 'Remote-US', 'linkedin', '2026-06-18'),
  appliedCandidate('cand-19', 'Aisha Bello', 'SF HQ', 'inbound', '2026-06-17'),
  appliedCandidate('cand-20', 'Marco Silva', 'Lisbon', 'linkedin', '2026-06-15'),
  appliedCandidate('cand-21', 'Chloe Tremblay', 'Remote-US', 'inbound', '2026-06-12'),
  appliedCandidate('cand-22', 'Henrik Dahl', 'Remote-US', 'linkedin', '2026-06-10'),
  appliedCandidate('cand-23', 'Pooja Iyer', 'SF HQ', 'inbound', '2026-06-09'),
  appliedCandidate('cand-24', 'Owen Gallagher', 'Remote-US', 'linkedin', '2026-06-08'),
  // --- Screen (8) -----------------------------------------------------------
  {
    id: 'cand-25',
    name: 'Sasha Petrov',
    location: 'Remote-US',
    source: 'linkedin',
    stage: 'screen',
    entered: '2026-07-01',
    score: null,
    scorecards: 0,
    nextStep: 'Screen Jul 6 · 09:30',
    nextStepTone: 'blue',
  },
  {
    id: 'cand-26',
    name: 'Imani Brooks',
    location: 'SF HQ',
    source: 'referral',
    referrer: 'Marcus Webb',
    stage: 'screen',
    entered: '2026-06-30',
    score: 3.5,
    scorecards: 2,
    nextStep: 'Debrief Jul 6',
    nextStepTone: 'purple',
  },
  {
    id: 'cand-27',
    name: 'Lars Eriksen',
    location: 'Lisbon',
    source: 'agency',
    stage: 'screen',
    entered: '2026-06-29',
    score: null,
    scorecards: 0,
    nextStep: 'Screen Jul 7 · 16:00',
    nextStepTone: 'blue',
  },
  {
    id: 'cand-28',
    name: 'Priyanka Menon',
    location: 'Remote-US',
    source: 'linkedin',
    stage: 'screen',
    entered: '2026-06-28',
    score: 3.0,
    scorecards: 1,
    nextStep: 'Schedule follow-up',
    nextStepTone: 'blue',
  },
  {
    id: 'cand-29',
    name: 'Tomás Herrera',
    location: 'SF HQ',
    source: 'inbound',
    stage: 'screen',
    entered: '2026-06-26',
    score: 2.8,
    scorecards: 2,
    nextStep: 'Debrief Jul 8',
    nextStepTone: 'purple',
  },
  {
    id: 'cand-30',
    name: 'Zofia Nowak',
    location: 'Lisbon',
    source: 'university',
    stage: 'screen',
    entered: '2026-06-24',
    score: 3.2,
    scorecards: 1,
    nextStep: 'Awaiting scorecard',
    nextStepTone: 'yellow',
  },
  {
    id: 'cand-31',
    name: 'Ben Whitaker',
    location: 'Remote-US',
    source: 'linkedin',
    stage: 'screen',
    entered: '2026-06-18',
    score: 2.5,
    scorecards: 1,
    nextStep: 'Advance or reject',
    nextStepTone: 'red',
  },
  {
    id: 'cand-32',
    name: 'Farah El-Amin',
    location: 'SF HQ',
    source: 'inbound',
    stage: 'screen',
    entered: '2026-06-16',
    score: 3.0,
    scorecards: 2,
    nextStep: 'Awaiting scorecard',
    nextStepTone: 'yellow',
  },
  // --- Onsite (4) -----------------------------------------------------------
  {
    id: 'cand-33',
    name: 'Rosa Delgado',
    location: 'SF HQ',
    source: 'referral',
    referrer: 'Priya Raman',
    stage: 'onsite',
    entered: '2026-06-29',
    score: 3.6,
    scorecards: 4,
    nextStep: 'Onsite loop Jul 8',
    nextStepTone: 'blue',
  },
  {
    id: 'cand-34',
    name: 'Kwame Mensah',
    location: 'Remote-US',
    source: 'linkedin',
    stage: 'onsite',
    entered: '2026-06-27',
    score: 3.4,
    scorecards: 3,
    nextStep: 'Debrief Jul 9',
    nextStepTone: 'purple',
  },
  {
    id: 'cand-35',
    name: 'Elif Kaya',
    location: 'Lisbon',
    source: 'agency',
    stage: 'onsite',
    entered: '2026-06-24',
    score: 3.1,
    scorecards: 5,
    nextStep: 'Reference check',
    nextStepTone: 'teal',
  },
  {
    id: 'cand-36',
    name: 'Noel Fitzpatrick',
    location: 'Remote-US',
    source: 'inbound',
    stage: 'onsite',
    entered: '2026-06-18',
    score: 2.9,
    scorecards: 4,
    nextStep: 'Reschedule panel',
    nextStepTone: 'red',
  },
  // --- Offer (2) ------------------------------------------------------------
  {
    id: 'cand-37',
    name: 'Maya Lindstrom',
    location: 'SF HQ',
    source: 'referral',
    referrer: 'Marcus Webb',
    stage: 'offer',
    entered: '2026-06-30',
    score: 3.8,
    scorecards: 6,
    nextStep: 'Offer expires Jul 10',
    nextStepTone: 'orange',
  },
  {
    id: 'cand-38',
    name: 'Victor Ansah',
    location: 'Remote-US',
    source: 'linkedin',
    stage: 'offer',
    entered: '2026-06-28',
    score: 3.6,
    scorecards: 6,
    nextStep: 'Comp review · E. Voss',
    nextStepTone: 'cyan',
  },
  // --- Hired (1) — Ava Lindqvist, now mid-onboarding across the suite -------
  {
    id: 'cand-39',
    name: 'Ava Lindqvist',
    location: 'SF HQ',
    source: 'referral',
    referrer: 'Marcus Webb',
    stage: 'hired',
    entered: '2026-07-01',
    score: 3.9,
    scorecards: 6,
    nextStep: 'Starts Jul 20',
    nextStepTone: 'green',
  },
];

// ============================================================================
// Derived per-candidate view model
// ============================================================================

interface LiveCandidate extends Candidate {
  daysInStage: number;
  isStalled: boolean;
}

// ============================================================================
// ScoreStars — scorecard average on the 1–4 Kestrel rubric
// ============================================================================

function ScoreStars({
  score,
  scorecards,
}: {
  score: number | null;
  scorecards: number;
}) {
  if (score === null) {
    return (
      <Text type="supporting" color="secondary">
        Not scored yet
      </Text>
    );
  }
  return (
    <HStack gap={1} vAlign="center">
      <span
        style={styles.starRow}
        role="img"
        aria-label={`Scorecard average ${score.toFixed(1)} of 4`}>
        {[1, 2, 3, 4].map(step => (
          <StarIcon
            key={step}
            size={13}
            aria-hidden="true"
            fill={score >= step - 0.25 ? 'currentColor' : 'none'}
            strokeWidth={score >= step - 0.25 ? 0 : 1.5}
          />
        ))}
      </span>
      <Text type="supporting" hasTabularNumbers>
        {score.toFixed(1)}
      </Text>
      <Text type="supporting" color="secondary">
        · {scorecards} scorecard{scorecards === 1 ? '' : 's'}
      </Text>
    </HStack>
  );
}

// ============================================================================
// CandidateCard
// ============================================================================

function CandidateCard({
  candidate,
  stageId,
  isDraggable,
  isDragging,
  onMove,
  onReject,
  onDraggingChange,
}: {
  candidate: LiveCandidate;
  stageId: StageId;
  isDraggable: boolean;
  isDragging: boolean;
  onMove: (candidateId: string, stageId: StageId) => void;
  onReject: (candidateId: string) => void;
  onDraggingChange: (candidateId: string | null) => void;
}) {
  const source = SOURCE_META[candidate.source];
  const stageIdx = STAGE_INDEX[stageId];
  const nextStage = STAGES[stageIdx + 1];
  const otherStages = STAGES.filter(
    stage => stage.id !== stageId && stage.id !== nextStage?.id,
  );
  const menuItems = [
    ...(nextStage
      ? [
          {
            label: `Advance to ${nextStage.title}`,
            onClick: () => onMove(candidate.id, nextStage.id),
          },
        ]
      : []),
    ...otherStages.map(stage => ({
      label: `Move to ${stage.title}`,
      onClick: () => onMove(candidate.id, stage.id),
    })),
    {label: 'Reject candidate', onClick: () => onReject(candidate.id)},
  ];
  return (
    // Draggable wrapper (pointer path). The MoreMenu below is the
    // touch/keyboard path — ClickableCard's accessible trigger is a hidden
    // sibling of the content, so the nested menu stays independent.
    <div
      draggable={isDraggable || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', candidate.id);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange(candidate.id);
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={isDragging ? styles.cardDragging : undefined}>
      <ClickableCard
        label={candidate.name}
        href="#"
        width="100%"
        padding={3}
        style={candidate.isStalled ? styles.cardStalled : undefined}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="start">
            <Avatar name={candidate.name} size="xsmall" />
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="body" maxLines={1}>
                  {candidate.name}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {candidate.location}
                </Text>
              </VStack>
            </StackItem>
            {/* On touch devices this menu is the only move path (drag is
                fine-pointer-only), so bump the trigger to "lg" there. */}
            <MoreMenu
              label={`Actions for ${candidate.name}`}
              size={isDraggable ? 'sm' : 'lg'}
              items={menuItems}
            />
          </HStack>
          <HStack gap={1} vAlign="center" wrap="wrap">
            <Token label={source.label} color={source.color} size="sm" />
            {candidate.referrer === undefined ? null : (
              <Text type="supporting" color="secondary" maxLines={1}>
                via {candidate.referrer}
              </Text>
            )}
          </HStack>
          <ScoreStars score={candidate.score} scorecards={candidate.scorecards} />
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Token
                label={candidate.nextStep}
                color={candidate.nextStepTone}
                size="sm"
              />
            </StackItem>
            {candidate.isStalled ? (
              <span style={styles.stalledText}>
                <ClockAlertIcon size={13} aria-hidden="true" />
                <Text type="supporting" color="inherit" hasTabularNumbers>
                  {candidate.daysInStage}d stalled
                </Text>
              </span>
            ) : (
              <span style={styles.daysText}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {candidate.daysInStage}d in stage
                </Text>
              </span>
            )}
          </HStack>
        </VStack>
      </ClickableCard>
    </div>
  );
}

// ============================================================================
// StageColumn — pinned header + scrolling card list + conversion footer
// ============================================================================

function StageColumn({
  stage,
  candidates,
  reached,
  reachedNext,
  nextTitle,
  target,
  width,
  isSnapping,
  isDraggable,
  draggingId,
  onMove,
  onReject,
  onDraggingChange,
}: {
  stage: {id: StageId; title: string};
  candidates: LiveCandidate[];
  /** Candidates who ever reached this stage (incl. rejections + hires). */
  reached: number;
  /** Candidates who ever reached the next stage; -1 for the last stage. */
  reachedNext: number;
  nextTitle: string | null;
  target: number | null;
  width: string | number;
  isSnapping: boolean;
  isDraggable: boolean;
  draggingId: string | null;
  onMove: (candidateId: string, stageId: StageId) => void;
  onReject: (candidateId: string) => void;
  onDraggingChange: (candidateId: string | null) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const stalledCount = candidates.filter(c => c.isStalled).length;
  const medianDays = median(candidates.map(c => c.daysInStage));
  const passThrough = reached > 0 && reachedNext >= 0 ? reachedNext / reached : null;
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
        const candidateId = event.dataTransfer.getData('text/plain');
        if (candidateId) {
          onMove(candidateId, stage.id);
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
              <Text type="label">{stage.title}</Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {candidates.length}
              </Text>
            </HStack>
          </StackItem>
          {stalledCount > 0 ? (
            <span style={styles.stalledText}>
              <ClockAlertIcon size={13} aria-hidden="true" />
              <Text type="supporting" color="inherit" hasTabularNumbers>
                {stalledCount} stalled
              </Text>
            </span>
          ) : null}
        </HStack>
      </div>
      <div style={styles.columnBody}>
        {candidates.length === 0 ? (
          <div style={styles.columnEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={InboxIcon} size="lg" />}
              title="No candidates"
              description="Nothing here matches the current filters."
            />
          </div>
        ) : (
          <VStack gap={2}>
            {candidates.map(candidate => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                stageId={stage.id}
                isDraggable={isDraggable}
                isDragging={draggingId === candidate.id}
                onMove={onMove}
                onReject={onReject}
                onDraggingChange={onDraggingChange}
              />
            ))}
          </VStack>
        )}
      </div>
      <div style={styles.columnFooter}>
        {passThrough !== null && nextTitle !== null ? (
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  → {nextTitle}
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers>
                {formatPercent(passThrough)}
              </Text>
            </HStack>
            <div
              style={styles.funnelTrack}
              role="img"
              aria-label={`${formatPercent(passThrough)} of candidates who reached ${stage.title} advanced to ${nextTitle}${target === null ? '' : `; target ${formatPercent(target)}`}`}>
              <div
                style={{
                  ...styles.funnelFill,
                  width: `${Math.min(100, Math.round(passThrough * 100))}%`,
                  backgroundColor: STAGE_BAR_COLOR[stage.id],
                }}
              />
            </div>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {reachedNext} of {reached} advanced
              {medianDays === null ? '' : ` · median ${medianDays}d here`}
            </Text>
          </VStack>
        ) : (
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Seats filled
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers>
                {REQ.seatsFilled} of {REQ.seats}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Median time to hire {REQ.medianTimeToHireDays}d
            </Text>
          </VStack>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PipelineHealthStrip — reached-count funnel + pass-through vs target
// ============================================================================

function PipelineHealthStrip({
  reached,
  activeCount,
  rejectedCount,
}: {
  /** Candidates who ever reached each stage, indexed like STAGES. */
  reached: number[];
  activeCount: number;
  rejectedCount: number;
}) {
  const applied = reached[0];
  const endToEnd = applied > 0 ? reached[reached.length - 1] / applied : 0;
  return (
    <div style={styles.healthStrip} aria-label="Pipeline health">
      {STAGES.map((stage, index) => {
        const passThrough =
          index < STAGES.length - 1 && reached[index] > 0
            ? reached[index + 1] / reached[index]
            : null;
        const target = CONVERSION_TARGETS[index] ?? null;
        const onTarget =
          passThrough !== null && target !== null && passThrough >= target;
        return (
          <span key={stage.id} style={{display: 'contents'}}>
            <div style={styles.healthCell}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    {stage.title}
                  </Text>
                </StackItem>
                <Text type="supporting" hasTabularNumbers>
                  {reached[index]}
                </Text>
              </HStack>
              <div
                style={styles.funnelTrack}
                role="img"
                aria-label={`${reached[index]} of ${applied} candidates reached ${stage.title}`}>
                <div
                  style={{
                    ...styles.funnelFill,
                    width: `${applied > 0 ? Math.max(4, Math.round((reached[index] / applied) * 100)) : 0}%`,
                    backgroundColor: STAGE_BAR_COLOR[stage.id],
                  }}
                />
              </div>
              <Text type="supporting" color="secondary">
                reached stage
              </Text>
            </div>
            {passThrough === null ? null : (
              <div style={styles.healthArrow}>
                <HStack gap={1} vAlign="center">
                  <ArrowRightIcon size={12} aria-hidden="true" />
                  <Text type="supporting" hasTabularNumbers>
                    {formatPercent(passThrough)}
                  </Text>
                </HStack>
                <span style={onTarget ? styles.deltaGood : styles.deltaBad}>
                  <Text type="supporting" color="inherit" hasTabularNumbers>
                    target {formatPercent(target)}
                  </Text>
                </span>
              </div>
            )}
          </span>
        );
      })}
      <div style={{...styles.healthCell, ...styles.healthCellSummary}}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Applied → Hired
            </Text>
          </StackItem>
          <Text type="supporting" hasTabularNumbers>
            {formatPercent(endToEnd)}
          </Text>
        </HStack>
        <div
          style={styles.funnelTrack}
          role="img"
          aria-label={`${formatPercent(endToEnd)} end-to-end conversion`}>
          <div
            style={{
              ...styles.funnelFill,
              width: `${Math.max(4, Math.round(endToEnd * 100))}%`,
              backgroundColor: STAGE_BAR_COLOR.hired,
            }}
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {activeCount} active · {rejectedCount} rejected
        </Text>
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

interface CandidatePosition {
  stage: StageId;
  /** Highest stage index ever reached — feeds the pass-through math. */
  maxIdx: number;
  entered: string;
}

const CANDIDATE_BY_ID = new Map(CANDIDATES.map(c => [c.id, c] as const));

export default function HrRecruitingPipelineTemplate() {
  const [filter, setFilter] = useState('all');
  const [source, setSource] = useState('all');
  // Candidate→stage assignment lifted into state so moves re-render the
  // counts, footers, and health strip; seeded from the fixtures.
  const [positions, setPositions] = useState<Record<string, CandidatePosition>>(
    () =>
      Object.fromEntries(
        CANDIDATES.map(c => [
          c.id,
          {
            stage: c.stage,
            maxIdx: STAGE_INDEX[c.stage],
            entered: c.entered,
          },
        ]),
      ),
  );
  // Rejections booked this session: candidate id → highest stage reached.
  const [rejections, setRejections] = useState<Record<string, number>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const isNarrow = useMediaQuery('(max-width: 768px)');
  // Drag-and-drop only for hover-capable fine pointers; touch users move
  // candidates through each card's MoreMenu.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');
  const columnWidth = isNarrow ? '85vw' : 264;

  const moveCandidate = useCallback(
    (candidateId: string, targetStage: StageId) => {
      const candidate = CANDIDATE_BY_ID.get(candidateId);
      if (candidate === undefined) {
        return;
      }
      const stageTitle = STAGES[STAGE_INDEX[targetStage]].title;
      setPositions(prev => {
        const current = prev[candidateId];
        if (current === undefined || current.stage === targetStage) {
          return prev;
        }
        return {
          ...prev,
          [candidateId]: {
            stage: targetStage,
            maxIdx: Math.max(current.maxIdx, STAGE_INDEX[targetStage]),
            // Moving resets the stage clock — 0 days in stage as of today.
            entered: AS_OF_ISO,
          },
        };
      });
      setAnnouncement(`Moved ${candidate.name} to ${stageTitle}`);
    },
    [],
  );

  const rejectCandidate = useCallback(
    (candidateId: string) => {
      const candidate = CANDIDATE_BY_ID.get(candidateId);
      const position = positions[candidateId];
      if (candidate === undefined || position === undefined) {
        return;
      }
      setRejections(prev => ({...prev, [candidateId]: position.maxIdx}));
      setAnnouncement(
        `Rejected ${candidate.name} at ${STAGES[STAGE_INDEX[position.stage]].title}`,
      );
    },
    [positions],
  );

  // Active candidates with live stage + days-in-stage (frozen clock).
  const liveCandidates = useMemo<LiveCandidate[]>(() => {
    return CANDIDATES.filter(c => rejections[c.id] === undefined).map(c => {
      const position = positions[c.id];
      const daysInStage = daysSince(position.entered);
      return {
        ...c,
        stage: position.stage,
        entered: position.entered,
        daysInStage,
        isStalled: daysInStage >= STALLED_DAYS,
      };
    });
  }, [positions, rejections]);

  // reached(stage) = actives whose highest stage ≥ stage
  //                + session rejections booked at ≥ stage
  //                + baseline (pre-demo) rejections booked at ≥ stage.
  // Seeds to 42 → 16 → 7 → 3 → 1 and stays reconciled through every
  // move/reject because all three inputs share the same bookkeeping.
  const reached = useMemo(() => {
    return STAGES.map((_, index) => {
      let count = 0;
      for (const candidate of liveCandidates) {
        if (positions[candidate.id].maxIdx >= index) {
          count += 1;
        }
      }
      for (const maxIdx of Object.values(rejections)) {
        if (maxIdx >= index) {
          count += 1;
        }
      }
      for (const stage of BASELINE_REJECTIONS) {
        if (STAGE_INDEX[stage] >= index) {
          count += 1;
        }
      }
      return count;
    });
  }, [liveCandidates, positions, rejections]);

  const stalledTotal = useMemo(
    () => liveCandidates.filter(c => c.isStalled).length,
    [liveCandidates],
  );

  const visibleByStage = useMemo(() => {
    const grouped = new Map<StageId, LiveCandidate[]>();
    for (const stage of STAGES) {
      grouped.set(stage.id, []);
    }
    for (const candidate of liveCandidates) {
      if (source !== 'all' && candidate.source !== source) {
        continue;
      }
      if (filter === 'stalled' && !candidate.isStalled) {
        continue;
      }
      grouped.get(candidate.stage)?.push(candidate);
    }
    return grouped;
  }, [liveCandidates, source, filter]);

  const visibleCount = useMemo(() => {
    let count = 0;
    for (const list of visibleByStage.values()) {
      count += list.length;
    }
    return count;
  }, [visibleByStage]);

  const rejectedCount = BASELINE_REJECTIONS.length + Object.keys(rejections).length;
  const daysToClose = daysUntil(REQ.targetCloseIso);
  const daysOpen = daysSince(REQ.openedIso);
  const closeWindow = daysOpen + daysToClose;

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <VStack gap={2}>
              {/* Row 1 — req identity. wrap="wrap" keeps badges from
                  clipping at narrow widths. */}
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>{REQ.title}</Heading>
                <Badge variant="neutral" label={REQ.id} />
                <Badge
                  variant="info"
                  label={`${REQ.seatsFilled} of ${REQ.seats} seats filled`}
                />
                <Text type="supporting" color="secondary">
                  {REQ.department} · {REQ.office} · {REQ.level} · Opened{' '}
                  {REQ.openedLabel}
                </Text>
                <StackItem size="fill" />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {visibleCount} candidates shown
                </Text>
              </HStack>
              {/* Row 2 — owners, countdown, filters, actions. */}
              <HStack gap={3} vAlign="center" wrap="wrap">
                <div style={styles.ownerChip}>
                  <Avatar name={REQ.recruiter} size="xsmall" />
                  <VStack gap={0}>
                    <Text type="supporting">{REQ.recruiter}</Text>
                    <Text type="supporting" color="secondary">
                      Recruiter
                    </Text>
                  </VStack>
                </div>
                <div style={styles.ownerChip}>
                  <Avatar name={REQ.hiringManager} size="xsmall" />
                  <VStack gap={0}>
                    <Text type="supporting">{REQ.hiringManager}</Text>
                    <Text type="supporting" color="secondary">
                      Hiring manager
                    </Text>
                  </VStack>
                </div>
                <AvatarGroup
                  size="xsmall"
                  aria-label={`Interview panel: ${REQ.panel.join(', ')}`}>
                  {REQ.panel.map(name => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
                <div style={styles.countdownBlock}>
                  <HStack gap={1} vAlign="center">
                    <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
                    <Text type="supporting" hasTabularNumbers>
                      {daysToClose}d to target close
                    </Text>
                    <Text type="supporting" color="secondary">
                      · {REQ.targetCloseLabel}
                    </Text>
                  </HStack>
                  {isNarrow ? null : (
                    <ProgressBar
                      label={`Req open ${daysOpen} of ${closeWindow} days in the close window`}
                      isLabelHidden
                      value={daysOpen}
                      max={closeWindow}
                      style={styles.countdownBar}
                    />
                  )}
                </div>
                <StackItem size="fill" />
                <SegmentedControl
                  label="Filter candidates"
                  value={filter}
                  onChange={setFilter}
                  size="sm">
                  <SegmentedControlItem label="All" value="all" />
                  <SegmentedControlItem
                    label={`Stalled (${stalledTotal})`}
                    value="stalled"
                  />
                </SegmentedControl>
                <Selector
                  label="Source"
                  isLabelHidden
                  size="sm"
                  options={SOURCE_OPTIONS}
                  value={source}
                  onChange={setSource}
                />
                <Button
                  label="Add candidate"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                />
              </HStack>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" style={styles.visuallyHidden}>
              {announcement}
            </div>
            <div style={styles.contentColumn}>
              <PipelineHealthStrip
                reached={reached}
                activeCount={liveCandidates.length}
                rejectedCount={rejectedCount}
              />
              <div
                style={{
                  ...styles.board,
                  ...(isNarrow ? styles.boardSnap : undefined),
                }}>
                {STAGES.map((stage, index) => (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    candidates={visibleByStage.get(stage.id) ?? []}
                    reached={reached[index]}
                    reachedNext={
                      index < STAGES.length - 1 ? reached[index + 1] : -1
                    }
                    nextTitle={
                      index < STAGES.length - 1 ? STAGES[index + 1].title : null
                    }
                    target={CONVERSION_TARGETS[index] ?? null}
                    width={columnWidth}
                    isSnapping={isNarrow}
                    isDraggable={canDrag}
                    draggingId={draggingId}
                    onMove={moveCandidate}
                    onReject={rejectCandidate}
                    onDraggingChange={setDraggingId}
                  />
                ))}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
