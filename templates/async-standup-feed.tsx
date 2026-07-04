// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs Platform & Infra
 *   team's async standup for Wednesday, July 15, 2026 (the suite "now"
 *   anchor): eight members across Lisbon / New York / Pacific timezones,
 *   six posted check-ins with fixed posted-at strings, one flagged blocker
 *   with a two-reply thread, weekly participation counts, and streak
 *   numbers. No clocks, no randomness, no network media.
 * @output Async Standup Feed — a WIDE daily async check-in surface for the
 *   Atlas Q3 Platform & Infra workstream. A date header with a completion
 *   meter (6 of 8 posted · 2 reminded) and a timezone-aware ordering note
 *   ("Lisbon first"); a blocker-rollup banner (1 active blocker with owner
 *   and helper avatars); your own composer card (three prompts, Yesterday
 *   pre-filled from Tuesday's plan, Post gated on Today); six check-in
 *   cards with Yesterday / Today / Blockers sections — Inês's card carries
 *   a red left rail, a "Needs help" chip, and a linked 2-reply thread —
 *   plus streak chips on consistent posters and a still-waiting row; and a
 *   320px week rail (participation strip Mon–Fri, streak leaderboard,
 *   roster grouped by timezone). Posting your check-in appends your card,
 *   flips the meter to 7 of 8, and re-derives every reconciling count.
 * @position Page template; emitted by `astryx template async-standup-feed`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (date, meter, timezone note) | content (banner, composer, feed —
 *   one centered 880px column, scrolls) | end panel 320 (week strip,
 *   streaks, roster — sticky, scrolls independently).
 * Container policy: feed archetype — check-in entries are styled <article>
 *   divs on --color-background-card (a feed of authored posts, not app
 *   chrome); the rail is a LayoutPanel of plain sections; no design-system
 *   Card imports. The blocker banner is a styled div, not a Banner, so the
 *   owner/helper avatar rows and per-blocker layout stay compositional.
 * Color policy: token-pure. The single accent is the theme accent (post
 *   action, viewer affordances); blocker surfaces use --color-error /
 *   --color-error-muted, reminders --color-warning, posted state
 *   --color-success. The only literals are light-dark() fallback pairs on
 *   the data-viz categorical tokens used by the participation strip (the
 *   demo does not inject --color-data-categorical-*).
 *
 * Responsive contract:
 * - > 1180px: full frame — feed column plus 320px week rail.
 * - <= 1180px: the week rail drops (the header meter remains the
 *   participation source of truth).
 * - <= 760px: card Yesterday/Today sections stack from two columns to
 *   one; the header row and banner rows wrap (flexWrap) instead of
 *   clipping; the composer action row wraps.
 * - The feed and the rail scroll independently (minHeight: 0 down both
 *   flex chains); the header is pinned by the Layout frame.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ActivityIcon,
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  GlobeIcon,
  LifeBuoyIcon,
  MessageSquareTextIcon,
  OctagonAlertIcon,
  PencilLineIcon,
  SendIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// =============================================================================
// Fixtures — Kestrel Labs · Atlas Q3 · Platform & Infra workstream
// Suite anchor: Wednesday, July 15, 2026. All times are fixed strings.
// =============================================================================

type TimezoneId = 'WEST' | 'ET' | 'PT';

interface TimezoneGroup {
  id: TimezoneId;
  label: string;
  localNow: string; // fixed string, anchored to 9:32 AM PT
}

/** Rendered in this order — the feed's "local morning" ordering. */
const TIMEZONES: TimezoneGroup[] = [
  {id: 'WEST', label: 'Lisbon · WEST', localNow: '5:32 PM'},
  {id: 'ET', label: 'New York · ET', localNow: '12:32 PM'},
  {id: 'PT', label: 'Pacific · PT', localNow: '9:32 AM'},
];

interface Member {
  id: string;
  name: string;
  role: string;
  city: string;
  tz: TimezoneId;
  /** Consecutive weekday check-ins through their latest post. */
  streak: number;
  joinedChip?: string;
  isViewer?: boolean;
}

/** The 8-person Platform & Infra standup group, in timezone order. */
const MEMBERS: Member[] = [
  {
    id: 'rui',
    name: 'Rui Costa',
    role: 'Senior infra engineer',
    city: 'Lisbon',
    tz: 'WEST',
    streak: 21,
  },
  {
    id: 'ines',
    name: 'Inês Amaral',
    role: 'Infra engineer',
    city: 'Lisbon',
    tz: 'WEST',
    streak: 6,
  },
  {
    id: 'omar',
    name: 'Omar Haddad',
    role: 'Platform engineer',
    city: 'Lisbon',
    tz: 'WEST',
    streak: 4,
  },
  {
    id: 'nadia',
    name: 'Nadia Rahman',
    role: 'Platform engineer',
    city: 'New York',
    tz: 'ET',
    streak: 9,
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    role: 'Platform lead',
    city: 'San Francisco',
    tz: 'PT',
    streak: 14,
  },
  {
    id: 'grace',
    name: 'Grace Liu',
    role: 'Platform engineer',
    city: 'Seattle',
    tz: 'PT',
    streak: 4,
  },
  {
    id: 'ava',
    name: 'Ava Lindqvist',
    role: 'Engineer',
    city: 'San Francisco',
    tz: 'PT',
    streak: 2,
    joinedChip: 'Joined Jul 1',
  },
  {
    id: 'you',
    name: 'Devon Kim',
    role: 'Platform engineer',
    city: 'Seattle',
    tz: 'PT',
    streak: 0,
    isViewer: true,
  },
];

const MEMBERS_BY_ID = new Map(MEMBERS.map(m => [m.id, m]));

function member(id: string): Member {
  const found = MEMBERS_BY_ID.get(id);
  if (!found) {
    throw new Error(`Unknown member: ${id}`);
  }
  return found;
}

/** Streaks at or above this length earn a flame chip on the card. */
const STREAK_CHIP_MIN = 6;

interface ThreadReply {
  memberId: string;
  timeLabel: string;
  text: string;
}

interface BlockerEntry {
  text: string;
  /** Helper avatars shown on the rollup banner. */
  helperIds: string[];
  thread: ThreadReply[];
}

interface CheckIn {
  memberId: string;
  postedLabel: string; // fixed local-time string, e.g. "8:12 AM WEST"
  yesterday: string[];
  today: string[];
  blocker?: BlockerEntry;
}

/** Six posted check-ins for Wed Jul 15, in local-morning (Lisbon-first) order. */
const CHECKINS: CheckIn[] = [
  {
    memberId: 'rui',
    postedLabel: '8:12 AM WEST',
    yesterday: [
      'Landed the shard-rebalance runbook for the beta expansion; drained and rebalanced eu-west-1 with zero downtime.',
      'Reviewed Nadia’s rate-limiter PR — one round of comments, close to mergeable.',
    ],
    today: [
      'Kick off the staging soak test toward the 500-seat load target.',
      'Write up soak results in #atlas-q3 before Thursday’s Launch Readiness Review.',
    ],
  },
  {
    memberId: 'ines',
    postedLabel: '8:47 AM WEST',
    yesterday: [
      'Provisioned the load-test fleet for the beta expansion.',
      'First soak run hit the staging capacity ceiling at 320 seats — well short of the 500-seat target.',
    ],
    today: [
      'Re-run the soak at full 500-seat load as soon as quota clears.',
      'Capture p95 latency numbers for the readiness review packet.',
    ],
    blocker: {
      text: 'Staging capacity quota for the 500-seat beta expansion (due Jul 21) is stuck in IT approval — I can’t finish the soak run until it clears. Need sign-off before Thursday’s review.',
      helperIds: ['marcus', 'tom'],
      thread: [
        {
          memberId: 'marcus',
          timeLabel: '8:26 AM PT',
          text: 'Escalated — your quota request is at the top of Tom’s queue, and I’m tracking this as the workstream’s active risk for Thursday.',
        },
        {
          memberId: 'tom',
          timeLabel: '9:04 AM PT',
          text: 'First tranche approved just now (250 seats, live within the hour). The remaining 250 land after tonight’s change window.',
        },
      ],
    },
  },
  {
    memberId: 'omar',
    postedLabel: '9:05 AM WEST',
    yesterday: [
      'Shipped idempotency keys for billing webhook retries — unblocks Elena’s pricing & billing checklist item.',
    ],
    today: [
      'Pair with Ava on the API gateway dashboards.',
      'Triage the flaky canary alerts from the Tuesday deploy.',
    ],
  },
  {
    memberId: 'nadia',
    postedLabel: '8:58 AM ET',
    yesterday: [
      'Rate-limiter PR into review (thanks Rui!).',
      'Traced the p99 regression to a cold connection pool; fix is a one-liner plus a config bump.',
    ],
    today: [
      'Land the rate limiter behind a flag.',
      'Draft the capacity notes for the “Atlas Q3 Launch Plan” infra section.',
    ],
  },
  {
    memberId: 'marcus',
    postedLabel: '8:21 AM PT',
    yesterday: [
      'Readiness-review prep with Priya — cut the infra section of the launch checklist to 9 open items.',
    ],
    today: [
      'Chase Inês’s staging quota with Tom until it clears.',
      'Publish the weekly infra status to the program roll-up before Thursday.',
    ],
  },
  {
    memberId: 'grace',
    postedLabel: '8:34 AM PT',
    yesterday: [
      'Closed out the accessibility-audit prep tickets for the gateway console (audit lands week of Jul 27).',
    ],
    today: [
      'Start the on-call handbook refresh.',
      'Shadow canary triage with Omar in the afternoon.',
    ],
  },
];

/** Tom is Kestrel's IT admin — a helper on the blocker, not a standup member. */
const HELPERS_OUTSIDE_GROUP: Member[] = [
  {
    id: 'tom',
    name: 'Tom Okonkwo',
    role: 'IT admin',
    city: 'San Francisco',
    tz: 'PT',
    streak: 0,
  },
];

for (const helper of HELPERS_OUTSIDE_GROUP) {
  MEMBERS_BY_ID.set(helper.id, helper);
}

interface WeekDay {
  day: string;
  date: string;
  /** Posted count out of GROUP_SIZE; null = upcoming day. */
  posted: number | null;
  isToday?: boolean;
}

const GROUP_SIZE = MEMBERS.length; // 8

/**
 * Mon–Fri participation, week of Jul 13. Wednesday's count is live — it is
 * always rendered from derived state so it matches the header meter.
 */
const WEEK: WeekDay[] = [
  {day: 'Mon', date: 'Jul 13', posted: 8},
  {day: 'Tue', date: 'Jul 14', posted: 7},
  {day: 'Wed', date: 'Jul 15', posted: 6, isToday: true},
  {day: 'Thu', date: 'Jul 16', posted: null},
  {day: 'Fri', date: 'Jul 17', posted: null},
];

interface WaitingEntry {
  memberId: string;
  note: string;
}

/** The two members reminded at 9:00 AM PT; counts reconcile with the meter. */
const WAITING: WaitingEntry[] = [
  {memberId: 'ava', note: 'Drafting · reminded 9:00 AM PT'},
  {memberId: 'you', note: 'Reminded 9:00 AM PT'},
];

/** Your Tuesday "Today" items, pre-filled into the Yesterday prompt. */
const VIEWER_YESTERDAY_PREFILL =
  'Reviewed the gateway dashboard queries with Omar; wrapped the retry-budget doc and linked it from the Atlas Q3 Launch Plan.';

const VIEWER_POSTED_LABEL = '9:26 AM PT';

const COMPOSER_PROMPTS = {
  yesterday: 'Yesterday',
  today: 'Today',
  blockers: 'Blockers',
} as const;

const HEADER = {
  eyebrow: 'Kestrel Labs · #atlas-q3 · Platform & Infra',
  title: 'Async standup',
  date: 'Wednesday, July 15, 2026',
  orderingNote: 'Ordered by local morning — Lisbon posts first, Pacific last.',
} as const;

const STREAK_LEADERS = ['rui', 'marcus', 'nadia', 'ines'];

// =============================================================================
// Styles
// =============================================================================

const CATEGORICAL_BLUE =
  'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const CATEGORICAL_TEAL =
  'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  header: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  headerTitleBlock: {minWidth: 220},
  headerMeter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    minWidth: 240,
    maxWidth: 320,
    flex: '1 1 240px',
  },
  headerMeterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  orderingNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
  },
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-body)',
  },
  feedColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    maxWidth: 880,
    marginInline: 'auto',
    width: '100%',
  },
  rollupBanner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-error)',
    backgroundColor: 'var(--color-error-muted)',
  },
  rollupHeadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  rollupBlockerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  rollupPeople: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    marginInlineStart: 'auto',
  },
  rollupPersonCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  cardBlocked: {
    borderLeft: '3px solid var(--color-error)',
    paddingLeft: 'calc(var(--spacing-4) - 2px)',
  },
  cardHeadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  cardHeadMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    marginInlineStart: 'auto',
    flexWrap: 'wrap',
  },
  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-3)',
  },
  sectionsGridStacked: {gridTemplateColumns: '1fr'},
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    minWidth: 0,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  proseLine: {display: 'flex', gap: 'var(--spacing-1)', alignItems: 'baseline'},
  proseBullet: {color: 'var(--color-text-secondary)', flexShrink: 0},
  blockerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-error-muted)',
    border: 'var(--border-width) solid var(--color-error)',
  },
  thread: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    marginInlineStart: 'var(--spacing-3)',
    paddingInlineStart: 'var(--spacing-3)',
    borderInlineStart: '2px solid var(--color-border)',
  },
  threadReply: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  composer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-accent)',
    backgroundColor: 'var(--color-background-card)',
  },
  composerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  waitingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  waitingPerson: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  railScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  railSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  weekStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 'var(--spacing-2)',
    alignItems: 'end',
  },
  weekBarTrack: {
    height: 72,
    display: 'flex',
    alignItems: 'flex-end',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  weekBarFill: {
    width: '100%',
    borderRadius: 'var(--radius-container)',
    backgroundColor: CATEGORICAL_BLUE,
  },
  weekBarFillToday: {backgroundColor: CATEGORICAL_TEAL},
  weekBarUpcoming: {
    height: 72,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border)',
  },
  weekCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    textAlign: 'center',
    minWidth: 0,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  streakRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  streakCount: {
    marginInlineStart: 'auto',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rosterGroupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    justifyContent: 'space-between',
  },
  rosterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) 0',
  },
  rosterStatus: {
    marginInlineStart: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    whiteSpace: 'nowrap',
  },
  statusDotPosted: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-success)',
    flexShrink: 0,
  },
  statusDotWaiting: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-warning)',
    flexShrink: 0,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// =============================================================================
// Building blocks
// =============================================================================

function StreakChip({streak}: {streak: number}) {
  return (
    <Token
      label={`${streak}-day streak`}
      size="sm"
      color="orange"
      icon={<Icon icon={FlameIcon} size="xsm" color="inherit" />}
    />
  );
}

function ProseSection({
  label,
  lines,
  emptyNote,
}: {
  label: string;
  lines: string[];
  emptyNote?: string;
}) {
  return (
    <div style={styles.section}>
      <Text type="label" size="sm" color="secondary">
        <span style={styles.sectionLabel}>{label}</span>
      </Text>
      {lines.length === 0 ? (
        <Text type="supporting" color="secondary">
          {emptyNote ?? '—'}
        </Text>
      ) : (
        lines.map((line, i) => (
          <div key={i} style={styles.proseLine}>
            <span style={styles.proseBullet} aria-hidden>
              ·
            </span>
            <Text type="body">{line}</Text>
          </div>
        ))
      )}
    </div>
  );
}

function BlockerThread({thread}: {thread: ThreadReply[]}) {
  return (
    <div style={styles.thread}>
      <HStack gap={1} vAlign="center">
        <Icon icon={MessageSquareTextIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary">
          {thread.length} replies
        </Text>
      </HStack>
      {thread.map((reply, i) => {
        const author = member(reply.memberId);
        return (
          <div key={i} style={styles.threadReply}>
            <Avatar name={author.name} size="tiny" />
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" weight="semibold">
                  {author.name}
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {reply.timeLabel}
                </Text>
              </HStack>
              <Text type="body">{reply.text}</Text>
            </VStack>
          </div>
        );
      })}
    </div>
  );
}

function CheckInCard({
  checkIn,
  isStacked,
  anchorId,
}: {
  checkIn: CheckIn;
  isStacked: boolean;
  anchorId?: string;
}) {
  const author = member(checkIn.memberId);
  const hasBlocker = checkIn.blocker != null;
  const cardStyle = hasBlocker
    ? {...styles.card, ...styles.cardBlocked}
    : styles.card;
  const gridStyle = isStacked
    ? {...styles.sectionsGrid, ...styles.sectionsGridStacked}
    : styles.sectionsGrid;
  return (
    <article id={anchorId} style={cardStyle} aria-label={`Check-in from ${author.name}`}>
      <div style={styles.cardHeadRow}>
        <Avatar name={author.name} size="small" />
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text type="body" weight="semibold">
              {author.name}
            </Text>
            {author.joinedChip ? (
              <Token label={author.joinedChip} size="sm" color="blue" />
            ) : null}
            {author.isViewer ? (
              <Token label="You" size="sm" color="default" />
            ) : null}
          </HStack>
          <Text type="supporting" color="secondary">
            {author.role} · {author.city}
          </Text>
        </VStack>
        <div style={styles.cardHeadMeta}>
          {author.streak >= STREAK_CHIP_MIN ? (
            <StreakChip streak={author.streak} />
          ) : null}
          {hasBlocker ? (
            <Token
              label="Needs help"
              size="sm"
              color="red"
              icon={<Icon icon={LifeBuoyIcon} size="xsm" color="inherit" />}
            />
          ) : null}
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Posted {checkIn.postedLabel}
          </Text>
        </div>
      </div>
      <div style={gridStyle}>
        <ProseSection label={COMPOSER_PROMPTS.yesterday} lines={checkIn.yesterday} />
        <ProseSection label={COMPOSER_PROMPTS.today} lines={checkIn.today} />
      </div>
      {checkIn.blocker ? (
        <div style={styles.blockerBlock}>
          <HStack gap={1} vAlign="center">
            <Icon icon={OctagonAlertIcon} size="xsm" color="red" />
            <Text type="label" size="sm">
              <span style={styles.sectionLabel}>{COMPOSER_PROMPTS.blockers}</span>
            </Text>
          </HStack>
          <Text type="body">{checkIn.blocker.text}</Text>
          <BlockerThread thread={checkIn.blocker.thread} />
        </div>
      ) : (
        <ProseSection
          label={COMPOSER_PROMPTS.blockers}
          lines={[]}
          emptyNote="None"
        />
      )}
    </article>
  );
}

interface ActiveBlocker {
  ownerId: string;
  helperIds: string[];
  text: string;
  anchorId: string;
}

function BlockerRollupBanner({blockers}: {blockers: ActiveBlocker[]}) {
  if (blockers.length === 0) {
    return null;
  }
  return (
    <section
      style={styles.rollupBanner}
      aria-label={`${blockers.length} active blocker${blockers.length === 1 ? '' : 's'}`}>
      <div style={styles.rollupHeadRow}>
        <Icon icon={OctagonAlertIcon} size="sm" color="red" />
        <Text type="body" weight="semibold">
          {blockers.length} active blocker{blockers.length === 1 ? '' : 's'}
        </Text>
        <Text type="supporting" color="secondary">
          Escalates to the workstream roll-up if still open Thursday.
        </Text>
      </div>
      {blockers.map(blocker => {
        const owner = member(blocker.ownerId);
        return (
          <div key={blocker.anchorId} style={styles.rollupBlockerRow}>
            <div style={{flex: '1 1 320px', minWidth: 240}}>
              <Text type="body">{blocker.text}</Text>
            </div>
            <div style={styles.rollupPeople}>
              <div style={styles.rollupPersonCell}>
                <Avatar name={owner.name} size="tiny" />
                <Text type="supporting" color="secondary">
                  {owner.name} · owner
                </Text>
              </div>
              {blocker.helperIds.length > 0 ? (
                <div style={styles.rollupPersonCell}>
                  <AvatarGroup size="tiny" aria-label="Helpers">
                    {blocker.helperIds.map(id => (
                      <Avatar key={id} name={member(id).name} />
                    ))}
                  </AvatarGroup>
                  <Text type="supporting" color="secondary">
                    helping
                  </Text>
                </div>
              ) : (
                <Text type="supporting" color="secondary">
                  No helper yet
                </Text>
              )}
              <Button
                label="Jump to check-in"
                size="sm"
                variant="ghost"
                onClick={() => {
                  document
                    .getElementById(blocker.anchorId)
                    ?.scrollIntoView({behavior: 'smooth', block: 'start'});
                }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ComposerCard({
  viewer,
  yesterdayDraft,
  todayDraft,
  blockerDraft,
  isPosted,
  onChangeYesterday,
  onChangeToday,
  onChangeBlocker,
  onPost,
}: {
  viewer: Member;
  yesterdayDraft: string;
  todayDraft: string;
  blockerDraft: string;
  isPosted: boolean;
  onChangeYesterday: (value: string) => void;
  onChangeToday: (value: string) => void;
  onChangeBlocker: (value: string) => void;
  onPost: () => void;
}) {
  if (isPosted) {
    return (
      <section style={styles.composer} aria-label="Your check-in">
        <div style={styles.cardHeadRow}>
          <Avatar name={viewer.name} size="small" />
          <VStack gap={0}>
            <Text type="body" weight="semibold">
              Your check-in is posted
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Posted {VIEWER_POSTED_LABEL} — it’s at the end of the feed, in
              timezone order.
            </Text>
          </VStack>
          <div style={styles.cardHeadMeta}>
            <Token
              label="Posted"
              size="sm"
              color="green"
              icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
            />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section style={styles.composer} aria-label="Your check-in composer">
      <div style={styles.cardHeadRow}>
        <Avatar name={viewer.name} size="small" />
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text type="body" weight="semibold">
              Your check-in
            </Text>
            <Token label="You" size="sm" color="default" />
          </HStack>
          <Text type="supporting" color="secondary">
            {viewer.role} · {viewer.city} · {HEADER.date}
          </Text>
        </VStack>
        <div style={styles.cardHeadMeta}>
          <Token
            label="Reminded 9:00 AM PT"
            size="sm"
            color="yellow"
            icon={<Icon icon={BellIcon} size="xsm" color="inherit" />}
          />
        </div>
      </div>
      <TextArea
        label={COMPOSER_PROMPTS.yesterday}
        rows={2}
        value={yesterdayDraft}
        onChange={onChangeYesterday}
        description="Pre-filled from Tuesday’s “Today” items."
      />
      <TextArea
        label={COMPOSER_PROMPTS.today}
        rows={2}
        value={todayDraft}
        onChange={onChangeToday}
        placeholder="What are you focused on today?"
      />
      <TextArea
        label={COMPOSER_PROMPTS.blockers}
        rows={2}
        value={blockerDraft}
        onChange={onChangeBlocker}
        placeholder="Anything in your way? Flag it and the team gets pinged."
      />
      <div style={styles.composerActions}>
        <Button
          label="Post check-in"
          size="sm"
          variant="primary"
          icon={<Icon icon={SendIcon} size="xsm" color="inherit" />}
          isDisabled={todayDraft.trim().length === 0}
          onClick={onPost}
        />
        <Text type="supporting" color="secondary">
          Posts to #atlas-q3 and this feed.
        </Text>
      </div>
    </section>
  );
}

function WaitingRow({waiting}: {waiting: WaitingEntry[]}) {
  if (waiting.length === 0) {
    return null;
  }
  return (
    <div style={styles.waitingRow}>
      <HStack gap={1} vAlign="center">
        <Icon icon={ClockIcon} size="xsm" color="secondary" />
        <Text type="supporting" weight="semibold">
          Still waiting on {waiting.length}
        </Text>
      </HStack>
      {waiting.map(entry => {
        const person = member(entry.memberId);
        return (
          <div key={entry.memberId} style={styles.waitingPerson}>
            <Avatar name={person.name} size="tiny" />
            <Text type="supporting" color="secondary">
              {person.name}
              {person.isViewer ? ' (you)' : ''} · {entry.note}
            </Text>
          </div>
        );
      })}
    </div>
  );
}

function WeekParticipationStrip({todayPosted}: {todayPosted: number}) {
  return (
    <section style={styles.railSection} aria-label="This week's participation">
      <HStack gap={1} vAlign="center">
        <Icon icon={ActivityIcon} size="xsm" color="secondary" />
        <Heading level={3}>This week</Heading>
      </HStack>
      <Text type="supporting" color="secondary">
        Check-ins posted per day, out of {GROUP_SIZE} · week of Jul 13
      </Text>
      <div style={styles.weekStrip}>
        {WEEK.map(day => {
          const posted = day.isToday ? todayPosted : day.posted;
          return (
            <div key={day.day} style={styles.weekCell}>
              {posted == null ? (
                <>
                  <Text type="supporting" color="secondary">
                    —
                  </Text>
                  <div style={styles.weekBarUpcoming} aria-hidden />
                </>
              ) : (
                <>
                  <Text type="supporting" weight="semibold" hasTabularNumbers>
                    {posted}
                  </Text>
                  <div
                    style={styles.weekBarTrack}
                    role="img"
                    aria-label={`${day.day} ${day.date}: ${posted} of ${GROUP_SIZE} posted${day.isToday ? ' so far' : ''}`}>
                    <div
                      style={{
                        ...styles.weekBarFill,
                        ...(day.isToday ? styles.weekBarFillToday : null),
                        height: `${(posted / GROUP_SIZE) * 100}%`,
                      }}
                    />
                  </div>
                </>
              )}
              <Text type="supporting" color="secondary">
                {day.day}
              </Text>
            </div>
          );
        })}
      </div>
      <div style={styles.legendRow}>
        <span
          style={{...styles.legendSwatch, backgroundColor: CATEGORICAL_BLUE}}
          aria-hidden
        />
        <Text type="supporting" color="secondary">
          Closed day
        </Text>
        <span
          style={{...styles.legendSwatch, backgroundColor: CATEGORICAL_TEAL}}
          aria-hidden
        />
        <Text type="supporting" color="secondary">
          Today (so far)
        </Text>
      </div>
    </section>
  );
}

function StreakLeaderboard() {
  return (
    <section style={styles.railSection} aria-label="Streak leaderboard">
      <HStack gap={1} vAlign="center">
        <Icon icon={FlameIcon} size="xsm" color="orange" />
        <Heading level={3}>Streaks</Heading>
      </HStack>
      <Text type="supporting" color="secondary">
        Consecutive weekdays posted
      </Text>
      {STREAK_LEADERS.map(id => {
        const person = member(id);
        return (
          <div key={id} style={styles.streakRow}>
            <Avatar name={person.name} size="tiny" />
            <Text type="body">{person.name}</Text>
            <span style={styles.streakCount}>
              <Text type="supporting" weight="semibold" hasTabularNumbers>
                {person.streak} days
              </Text>
            </span>
          </div>
        );
      })}
    </section>
  );
}

function TimezoneRoster({postedIds}: {postedIds: ReadonlySet<string>}) {
  const postedLabels = new Map(
    CHECKINS.map(checkIn => [checkIn.memberId, checkIn.postedLabel]),
  );
  return (
    <section style={styles.railSection} aria-label="Roster by timezone">
      <HStack gap={1} vAlign="center">
        <Icon icon={GlobeIcon} size="xsm" color="secondary" />
        <Heading level={3}>Roster by timezone</Heading>
      </HStack>
      {TIMEZONES.map(tz => {
        const people = MEMBERS.filter(m => m.tz === tz.id);
        return (
          <div key={tz.id}>
            <div style={styles.rosterGroupHead}>
              <Text type="label" size="sm" color="secondary">
                <span style={styles.sectionLabel}>{tz.label}</span>
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                now {tz.localNow}
              </Text>
            </div>
            {people.map(person => {
              const hasPosted = postedIds.has(person.id);
              const statusLabel = hasPosted
                ? person.isViewer
                  ? VIEWER_POSTED_LABEL
                  : (postedLabels.get(person.id) ?? '')
                : 'waiting';
              return (
                <div key={person.id} style={styles.rosterRow}>
                  <Avatar name={person.name} size="tiny" />
                  <Text type="body">
                    {person.name}
                    {person.isViewer ? ' (you)' : ''}
                  </Text>
                  <span style={styles.rosterStatus}>
                    <span
                      style={
                        hasPosted
                          ? styles.statusDotPosted
                          : styles.statusDotWaiting
                      }
                      aria-hidden
                    />
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {statusLabel}
                    </Text>
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function AsyncStandupFeedTemplate() {
  const isRailHidden = useMediaQuery('(max-width: 1180px)');
  const isStacked = useMediaQuery('(max-width: 760px)');

  const viewer = member('you');
  const [yesterdayDraft, setYesterdayDraft] = useState(
    VIEWER_YESTERDAY_PREFILL,
  );
  const [todayDraft, setTodayDraft] = useState('');
  const [blockerDraft, setBlockerDraft] = useState('');
  const [postedCheckIn, setPostedCheckIn] = useState<CheckIn | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const postCheckIn = () => {
    const todayLines = todayDraft
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    const blockerText = blockerDraft.trim();
    const yesterdayLines = yesterdayDraft
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    setPostedCheckIn({
      memberId: 'you',
      postedLabel: VIEWER_POSTED_LABEL,
      yesterday: yesterdayLines,
      today: todayLines,
      blocker:
        blockerText.length > 0
          ? {text: blockerText, helperIds: [], thread: []}
          : undefined,
    });
    setAnnouncement(
      `Your check-in was posted at ${VIEWER_POSTED_LABEL}. ${CHECKINS.length + 1} of ${GROUP_SIZE} posted.`,
    );
  };

  // Everything below derives from one feed array so every count reconciles:
  // the header meter, the rollup banner, the waiting row, the Wednesday bar
  // in the week strip, and the roster status dots.
  const feed = useMemo(
    () => (postedCheckIn ? [...CHECKINS, postedCheckIn] : CHECKINS),
    [postedCheckIn],
  );
  const postedIds = useMemo(
    () => new Set(feed.map(checkIn => checkIn.memberId)),
    [feed],
  );
  const postedCount = feed.length;
  const waiting = WAITING.filter(entry => !postedIds.has(entry.memberId));
  const activeBlockers: ActiveBlocker[] = feed
    .filter(checkIn => checkIn.blocker != null)
    .map(checkIn => ({
      ownerId: checkIn.memberId,
      helperIds: checkIn.blocker?.helperIds ?? [],
      text: checkIn.blocker?.text ?? '',
      anchorId: `checkin-${checkIn.memberId}`,
    }));

  const header = (
    <LayoutHeader hasDivider>
      <div style={styles.header}>
        <div style={styles.headerTitleBlock}>
          <Text type="supporting" color="secondary">
            {HEADER.eyebrow}
          </Text>
          <Heading level={1}>{HEADER.title}</Heading>
          <HStack gap={1} vAlign="center">
            <Icon icon={CalendarDaysIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              {HEADER.date}
            </Text>
          </HStack>
        </div>
        <div style={styles.headerMeter}>
          <div style={styles.headerMeterRow}>
            <Text type="supporting" weight="semibold" hasTabularNumbers>
              {postedCount} of {GROUP_SIZE} posted
            </Text>
            <Token
              label={`${waiting.length} reminded`}
              size="sm"
              color={waiting.length > 0 ? 'yellow' : 'green'}
              icon={<Icon icon={BellIcon} size="xsm" color="inherit" />}
            />
          </div>
          <ProgressBar
            label="Check-ins posted today"
            isLabelHidden
            value={postedCount}
            max={GROUP_SIZE}
          />
        </div>
        <div style={styles.orderingNote}>
          <Icon icon={GlobeIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            {HEADER.orderingNote}
          </Text>
        </div>
      </div>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div aria-live="polite" style={styles.srOnly}>
                {announcement}
              </div>
              <div style={styles.feedColumn}>
                <BlockerRollupBanner blockers={activeBlockers} />
                <ComposerCard
                  viewer={viewer}
                  yesterdayDraft={yesterdayDraft}
                  todayDraft={todayDraft}
                  blockerDraft={blockerDraft}
                  isPosted={postedCheckIn != null}
                  onChangeYesterday={setYesterdayDraft}
                  onChangeToday={setTodayDraft}
                  onChangeBlocker={setBlockerDraft}
                  onPost={postCheckIn}
                />
                <HStack gap={1} vAlign="center">
                  <Icon icon={PencilLineIcon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    {postedCount} check-ins · Wednesday, Jul 15
                  </Text>
                </HStack>
                {feed.map(checkIn => (
                  <CheckInCard
                    key={checkIn.memberId}
                    checkIn={checkIn}
                    isStacked={isStacked}
                    anchorId={`checkin-${checkIn.memberId}`}
                  />
                ))}
                <WaitingRow waiting={waiting} />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isRailHidden ? undefined : (
            <LayoutPanel width={320} padding={0} label="This week">
              <div style={styles.railScroll}>
                <WeekParticipationStrip todayPosted={postedCount} />
                <Divider />
                <StreakLeaderboard />
                <Divider />
                <TimezoneRoster postedIds={postedIds} />
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
