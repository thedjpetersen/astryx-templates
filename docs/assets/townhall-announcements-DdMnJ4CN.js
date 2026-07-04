var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs company-announcement
 *   feed and the Friday townhall Q&A queue (fixed July-2026 display strings,
 *   fixed counts, no clocks, no randomness, no network media; recording
 *   thumbnails are CSS-gradient tiles).
 * @output Townhall & Announcements — the Kestrel Labs company-comms surface
 *   for the Atlas Q3 window. A featured announcement hero ("Atlas Q3 ship
 *   date confirmed — Tuesday, August 4" by Priya Raman) with a 4-emoji
 *   reaction bar and a read-progress meter ("118 of 140 · 84% of company");
 *   an announcement list of four more posts with category chips
 *   (All-hands / Policy / Shoutout) and read/unread dots plus a category
 *   filter row; a moderated Q&A queue for the Fri Jul 17 townhall (six
 *   questions with upvote toggles, one answered inline with an answer card,
 *   one flagged "Answering live", a Top/Newest sort toggle) with an
 *   ask-a-question composer and anonymous Switch; and a past-townhalls rail
 *   whose recording rows carry recap-artifact chips (duration, chapters,
 *   transcript) in the language of \`meet-recap\`.
 * @position Page template; emitted by \`astryx template townhall-announcements\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | townhalls rail 300 (next-townhall block + past recordings)
 *   | content (filter toolbar, featured hero, announcement rows — one
 *   scroll column, inner measure 860) | end panel 380 (moderated Q&A:
 *   pinned header + sort, scrolling queue, pinned composer).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The featured hero and the inline answer card are styled divs
 *   (featured-summary widgets), announcement rows and question rows are
 *   frame rows, the rail recordings are row buttons.
 * Color policy: token-pure throughout; the ONE accent is the theme accent
 *   (unread dots, upvoted state, answer-card spine). Exceptions: (a) the
 *   repo-standard \`light-dark()\` fallback pair on the one data-viz
 *   categorical token (the demo injects none) tinting the townhall live
 *   glyph in the rail, and (b) the past-townhall
 *   recording thumbnails, which are deliberately scheme-locked dark
 *   CSS-gradient stages standing in for footage — their overlay timecodes
 *   use literal rgba() text that must not flip with the theme.
 *
 * Responsive contract:
 * - > 1200px: full three-region frame at 1440x900.
 * - <= 1200px: the townhalls rail is dropped; the header's next-townhall
 *   chip stays as the townhall anchor.
 * - <= 920px: the Q&A end panel is dropped and the full Q&A section
 *   (sort, queue, composer) renders inside the content scroll below the
 *   announcement list; the header row wraps instead of clipping.
 * - Rail, content, and Q&A queue each scroll independently (\`minHeight: 0\`
 *   down every flex chain); the Q&A header and composer are pinned flex
 *   siblings, so no scroll-clearance padding is needed.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CalendarPlusIcon,
  CheckCheckIcon,
  CheckIcon,
  ChevronUpIcon,
  FileTextIcon,
  MegaphoneIcon,
  MessageCircleQuestionIcon,
  PinIcon,
  PlayIcon,
  PlusIcon,
  RadioIcon,
  SendIcon,
  VenetianMaskIcon,
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
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  // --- townhalls rail --------------------------------------------------
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)'},
  nextBlock: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  railStat: {fontVariantNumeric: 'tabular-nums'},
  pastRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
    padding: 'var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    background: 'transparent',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  // Scheme-locked dark recording thumbnail — stands in for footage; the
  // overlay timecode uses literal rgba text that must not flip with the
  // theme (documented exception in the header Color policy).
  pastThumb: {
    position: 'relative',
    width: 64,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-control, 8px)',
    colorScheme: 'dark',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbTime: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    padding: '0 4px',
    borderRadius: 4,
    backgroundColor: 'rgba(10,12,16,0.72)',
    color: 'rgba(226,232,240,0.92)',
    fontSize: 10,
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '14px',
  },
  // Lifted above center so the glyph clears the corner timecode chip in the
  // 40px-tall thumb (centered, they overlap).
  thumbPlay: {color: 'rgba(226,232,240,0.85)', display: 'inline-flex', marginBottom: 12},
  recChipRow: {display: 'flex', flexWrap: 'wrap', gap: 4},
  recChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 6px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    lineHeight: '16px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // --- announcements column --------------------------------------------
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  contentInner: {maxWidth: 860, margin: '0 auto', width: '100%'},
  hero: {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-low, none)',
  },
  heroBody: {maxWidth: 640},
  readBar: {width: 180, minWidth: 0},
  linkChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    lineHeight: '18px',
    // Long labels ellipsize inside the pill instead of punching through the
    // hero card's right border at narrow content widths.
    maxWidth: '100%',
    minWidth: 0,
    cursor: 'pointer',
    font: 'inherit',
  },
  linkChipIcon: {display: 'inline-flex', flexShrink: 0},
  linkChipLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    width: '100%',
    padding: 'var(--spacing-3) var(--spacing-2)',
    border: 'none',
    background: 'transparent',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    borderRadius: 'var(--radius-container)',
  },
  // Read/unread dot column: fixed 8px lane so titles share a gridline.
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
    backgroundColor: 'var(--color-accent)',
  },
  readDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
  },
  rowExcerpt: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  // --- Q&A panel ---------------------------------------------------------
  qaHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  qaScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  qaRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) 0',
  },
  answerCard: {
    marginTop: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStart: '3px solid var(--color-accent)',
  },
  composer: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  // Inline Q&A section used when the end panel is dropped (<= 920px).
  qaInline: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  qaInlineBody: {padding: 'var(--spacing-3)'},
  // Footgun 15: the Switch knob paints --color-background-surface, which
  // vanishes into the translucent OFF-state track in dark mode. Re-pin the
  // OFF track (not the knob) on a scoped wrapper; light side stays stock.
  switchKnobScope: {
    '--color-background-gray': 'light-dark(#0A131733, #6F747C)',
  } as CSSProperties,
  anonAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — fallback pairs
// are the repo-standard values (see calendar-month-grid.tsx).
const CAT_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

// Scheme-locked dark gradients for the recording thumbnails (literal hexes
// by design — they stand in for footage and never flip with the theme).
const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #1E2A3A 0%, #10151D 55%, #23180F 100%)',
  'linear-gradient(135deg, #21182E 0%, #131019 55%, #0E1B22 100%)',
  'linear-gradient(135deg, #16261E 0%, #0F1713 55%, #1F1A10 100%)',
  'linear-gradient(135deg, #292012 0%, #17120C 55%, #101B26 100%)',
];

// ---------------------------------------------------------------------------
// DATA — one shared world: Kestrel Labs (140-person platform company), the
// Atlas Q3 program window. Suite "now": Wednesday, July 15, 2026. Signed-in
// user: Marcus Webb (matches meet-recap). Every repeated count reconciles:
// 118 of 140 readers = 84%; 2 unread rows = the "2 unread" chip; the queue
// stats in the rail derive from the same state as the Q&A panel.
// ---------------------------------------------------------------------------

const YOU = 'Marcus Webb';
const COMPANY = {name: 'Kestrel Labs', headcount: 140};

const NEXT_TOWNHALL = {
  title: 'Friday townhall',
  whenLabel: 'Fri Jul 17 · 10:00 – 10:45 AM PT',
  hosts: ['Priya Raman', 'Dana Whitfield'],
  hostLabel: 'Hosted by Priya & Dana',
};

/** Roster roles — stable across the Team Workspace suite (§5.1). */
const ROLES: Record<string, string> = {
  'Priya Raman': 'VP Engineering · Atlas program lead',
  'Marcus Webb': 'Platform lead',
  'Sofia Ortiz': 'Design lead',
  'Jonah Fields': 'GTM · Launch PM',
  'Dana Whitfield': 'People Ops',
  'Elena Voss': 'Finance lead',
  'Tom Okonkwo': 'IT admin',
  'Ava Lindqvist': 'Engineering',
  'Ken Tanaka': 'GTM',
};

type Category = 'all-hands' | 'policy' | 'shoutout';

const CATEGORY_META: Record<Category, {label: string; color: 'blue' | 'purple' | 'green'}> = {
  'all-hands': {label: 'All-hands', color: 'blue'},
  policy: {label: 'Policy', color: 'purple'},
  shoutout: {label: 'Shoutout', color: 'green'},
};

const CATEGORY_FILTERS: Array<{id: Category | 'all'; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'all-hands', label: 'All-hands'},
  {id: 'policy', label: 'Policy'},
  {id: 'shoutout', label: 'Shoutout'},
];
interface Reaction {
  emoji: string;
  name: string;
  count: number;
  /** Whether the signed-in user (Marcus) has this reaction on. */
  isYours: boolean;
}

/** Featured hero — the ship-date decision from the Jul 9 Launch Readiness
 * Review (the same decision the decision log records as Decided · Jul 9).
 * Read stat: 118 of 140 = 84% (rendered exactly, never recomputed). */
const HERO = {
  id: 'a-hero',
  category: 'all-hands' as Category,
  title: 'Atlas Q3 ship date confirmed — Tuesday, August 4',
  author: 'Priya Raman',
  postedLabel: 'Thu Jul 9 · 4:20 PM PT',
  paragraphs: [
    'At today’s Launch Readiness Review we locked the Atlas Q3 ship date: Tuesday, August 4. Between here and there: the beta cohort expands to 500 seats on July 21, the launch checklist closes Wednesday July 22, and pricing-page copy freezes July 28 ahead of localization.',
    'Full context lives in the Atlas Q3 Launch Plan. Workstream leads will walk through what this means for their teams at Friday’s townhall — bring questions to the queue.',
  ],
  readCount: 118,
  readPct: 84,
  links: [
    {id: 'l1', icon: FileTextIcon, label: 'Atlas Q3 Launch Plan'},
    {id: 'l2', icon: CheckIcon, label: 'Decision · Launch Readiness Review · Jul 9'},
  ],
};

/** Marcus already reacted 🚀 — his toggle is on and his +1 is in the 36. */
const INITIAL_REACTIONS: Reaction[] = [
  {emoji: '\\u{1F389}', name: 'Celebrate', count: 48, isYours: false},
  {emoji: '\\u{1F680}', name: 'Ship it', count: 36, isYours: true},
  {emoji: '❤️', name: 'Love', count: 21, isYours: false},
  {emoji: '\\u{1F44F}', name: 'Applause', count: 17, isYours: false},
];

interface Announcement {
  id: string;
  category: Category;
  title: string;
  author: string;
  postedLabel: string;
  excerpt: string;
  reactionCount: number;
  isRead: boolean;
}

/** Four more posts, newest first. Exactly 2 start unread — the toolbar's
 * unread chip derives from this state, so the numbers can never drift. */
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    category: 'shoutout',
    title: 'Shoutout: Beta Feedback Themes is live',
    author: 'Jonah Fields',
    postedLabel: 'Tue Jul 14 · 3:40 PM PT',
    excerpt:
      'Huge credit to Sofia Ortiz — 214 beta interviews distilled into the themes doc every workstream is quoting this week.',
    reactionCount: 26,
    isRead: false,
  },
  {
    id: 'a2',
    category: 'policy',
    title: 'Travel & expense policy updates for launch week',
    author: 'Elena Voss',
    postedLabel: 'Mon Jul 13 · 11:10 AM PT',
    excerpt:
      'Launch-week travel is pre-approved for workstream leads; everything else routes through the updated expense tiers.',
    reactionCount: 9,
    isRead: false,
  },
  {
    id: 'a3',
    category: 'all-hands',
    title: 'Friday townhall: agenda and how to ask questions',
    author: 'Dana Whitfield',
    postedLabel: 'Mon Jul 13 · 9:00 AM PT',
    excerpt:
      'We’re trying a moderated Q&A queue this month — upvote what you want covered and Priya & Dana take the top-voted questions live.',
    reactionCount: 18,
    isRead: true,
  },
  {
    id: 'a4',
    category: 'all-hands',
    title: 'Welcome our July new hires: Ava and Ken',
    author: 'Dana Whitfield',
    postedLabel: 'Wed Jul 8 · 10:15 AM PT',
    excerpt:
      'Ava Lindqvist joined Engineering on Jul 1 and Ken Tanaka joins GTM on Jul 6 — say hi in #atlas-q3.',
    reactionCount: 32,
    isRead: true,
  },
];

interface Question {
  id: string;
  text: string;
  /** null = asked anonymously (moderators see no name either). */
  author: string | null;
  /** "Joined Jul 1/6" chip for the two July new hires. */
  newHireChip?: string;
  submittedLabel: string;
  /** Monotonic submission order — Newest sort is this, descending. */
  order: number;
  votes: number;
  isYourVote: boolean;
  status?: 'answered' | 'live';
  answer?: {by: string; whenLabel: string; text: string};
}

/** Six queued questions; votes sum to 59 at rest — the rail's queue stat
 * derives from live state, so upvotes keep every surface in agreement. */
const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'If the accessibility audit (week of Jul 27) turns up blockers, does Aug 4 move?',
    author: null,
    submittedLabel: 'Mon Jul 13',
    order: 1,
    votes: 21,
    isYourVote: true,
    status: 'live',
  },
  {
    id: 'q2',
    text: 'Which teams get seats when the beta expands to 500 on Jul 21?',
    author: 'Ken Tanaka',
    newHireChip: 'Joined Jul 6',
    submittedLabel: 'Mon Jul 13',
    order: 2,
    votes: 14,
    isYourVote: false,
    status: 'answered',
    answer: {
      by: 'Sofia Ortiz',
      whenLabel: 'Tue Jul 14',
      text: 'Allocation is demand-weighted from the waitlist: 120 seats to Support and Success pilots, 260 to design-partner orgs, and 120 to self-serve signups. The full list lands in Beta Feedback Themes on Friday.',
    },
  },
  {
    id: 'q3',
    text: 'Are we hiring a backfill for the platform on-call rotation before launch?',
    author: null,
    submittedLabel: 'Tue Jul 14',
    order: 3,
    votes: 9,
    isYourVote: false,
  },
  {
    id: 'q4',
    text: 'Can we see the pricing FAQ before copy freezes on Jul 28?',
    author: 'Ava Lindqvist',
    newHireChip: 'Joined Jul 1',
    submittedLabel: 'Tue Jul 14',
    order: 4,
    votes: 7,
    isYourVote: false,
  },
  {
    id: 'q5',
    text: 'Will townhall recordings get chapters like the readiness-review recaps?',
    author: 'Tom Okonkwo',
    submittedLabel: 'Wed Jul 15',
    order: 5,
    votes: 5,
    isYourVote: false,
  },
  {
    id: 'q6',
    text: 'Any plans for a launch-day war room in the office?',
    author: 'Jonah Fields',
    submittedLabel: 'Wed Jul 15',
    order: 6,
    votes: 3,
    isYourVote: false,
  },
];
interface PastTownhall {
  id: string;
  title: string;
  dateLabel: string;
  /** Recap-artifact chips in meet-recap's language: "43:12 recorded". */
  recordedLabel: string;
  chapters: number;
  views: number;
  gradient: string;
}

/** Monthly Friday townhalls plus one mid-cycle special — each row links a
 * recap artifact (recording + chapters + transcript), the same shape the
 * meet-recap surface renders for the Launch Readiness Review. */
const PAST_TOWNHALLS: PastTownhall[] = [
  {
    id: 't-jun',
    title: 'Kestrel townhall · June',
    dateLabel: 'Fri Jun 19, 2026',
    recordedLabel: '43:12 recorded',
    chapters: 8,
    views: 131,
    gradient: THUMB_GRADIENTS[0],
  },
  {
    id: 't-beta',
    title: 'Atlas Q3 beta kickoff (special)',
    dateLabel: 'Wed Jun 3, 2026',
    recordedLabel: '38:40 recorded',
    chapters: 6,
    views: 98,
    gradient: THUMB_GRADIENTS[1],
  },
  {
    id: 't-may',
    title: 'Kestrel townhall · May',
    dateLabel: 'Fri May 15, 2026',
    recordedLabel: '47:26 recorded',
    chapters: 9,
    views: 126,
    gradient: THUMB_GRADIENTS[2],
  },
  {
    id: 't-apr',
    title: 'Kestrel townhall · April',
    dateLabel: 'Fri Apr 17, 2026',
    recordedLabel: '41:03 recorded',
    chapters: 7,
    views: 118,
    gradient: THUMB_GRADIENTS[3],
  },
];

// ---------------------------------------------------------------------------
// SMALL PIECES
// ---------------------------------------------------------------------------

function CategoryChip({category}: {category: Category}) {
  const meta = CATEGORY_META[category];
  return <Token size="sm" color={meta.color} label={meta.label} />;
}

function AnonBadge() {
  return (
    <HStack gap={1} vAlign="center">
      <span style={styles.anonAvatar} aria-hidden>
        <Icon icon={VenetianMaskIcon} size="xsm" color="inherit" />
      </span>
      <Text type="supporting" color="secondary">
        Anonymous
      </Text>
    </HStack>
  );
}

/** Author byline shared by hero, rows, and answer cards. */
function Byline({
  name,
  detail,
  avatarSize,
}: {
  name: string;
  detail: string;
  avatarSize: 'tiny' | 'small';
}) {
  return (
    <HStack gap={2} vAlign="center" style={{minWidth: 0}}>
      <Avatar name={name} size={avatarSize} />
      <Text type="supporting" weight="semibold" style={{whiteSpace: 'nowrap'}}>
        {name}
      </Text>
      <Text type="supporting" color="secondary" style={styles.rowExcerpt}>
        · {detail}
      </Text>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// TOWNHALLS RAIL (start panel)
// ---------------------------------------------------------------------------

function TownhallRail({
  questionCount,
  voteTotal,
}: {
  questionCount: number;
  voteTotal: number;
}) {
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={4}>
          <div style={styles.nextBlock}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <span style={{color: CAT_TEAL, display: 'inline-flex'}}>
                  <Icon icon={RadioIcon} size="sm" color="inherit" />
                </span>
                <Heading level={3}>{NEXT_TOWNHALL.title}</Heading>
              </HStack>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {NEXT_TOWNHALL.whenLabel}
              </Text>
              <HStack gap={2} vAlign="center">
                <AvatarGroup size="xsmall" aria-label="Townhall hosts">
                  {NEXT_TOWNHALL.hosts.map(host => (
                    <Avatar key={host} name={host} />
                  ))}
                </AvatarGroup>
                <Text type="supporting" color="secondary">
                  {NEXT_TOWNHALL.hostLabel}
                </Text>
              </HStack>
              <Text
                type="supporting"
                color="secondary"
                hasTabularNumbers
                style={styles.railStat}>
                {questionCount} questions queued · {voteTotal} upvotes
              </Text>
              <Button
                label="Add to calendar"
                variant="secondary"
                size="sm"
                icon={<Icon icon={CalendarPlusIcon} size="sm" />}
                onClick={() => {}}
              />
            </VStack>
          </div>

          <VStack gap={2}>
            <Text type="label" color="secondary">
              Past townhalls
            </Text>
            <VStack gap={1}>
              {PAST_TOWNHALLS.map(rec => (
                <button
                  key={rec.id}
                  type="button"
                  style={styles.pastRow}
                  aria-label={\`Open recap: \${rec.title}, \${rec.recordedLabel}\`}>
                  <span style={{...styles.pastThumb, background: rec.gradient}}>
                    <span style={styles.thumbPlay}>
                      <Icon icon={PlayIcon} size="sm" color="inherit" />
                    </span>
                    <span style={styles.thumbTime}>
                      {rec.recordedLabel.replace(' recorded', '')}
                    </span>
                  </span>
                  <VStack gap={1} style={{minWidth: 0}}>
                    <Text type="label" style={styles.rowExcerpt}>
                      {rec.title}
                    </Text>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {rec.dateLabel}
                    </Text>
                    <span style={styles.recChipRow}>
                      <span style={styles.recChip}>{rec.recordedLabel}</span>
                      <span style={styles.recChip}>{rec.chapters} chapters</span>
                      <span style={styles.recChip}>Transcript</span>
                      <span style={styles.recChip}>{rec.views} views</span>
                    </span>
                  </VStack>
                </button>
              ))}
            </VStack>
            <Text type="supporting" color="secondary">
              Recaps include the recording, chapter markers, and a searchable
              transcript.
            </Text>
          </VStack>
        </VStack>
      </div>
    </div>
  );
}
// ---------------------------------------------------------------------------
// ANNOUNCEMENTS COLUMN
// ---------------------------------------------------------------------------

function HeroPanel({
  reactions,
  onToggleReaction,
}: {
  reactions: Reaction[];
  onToggleReaction: (name: string) => void;
}) {
  return (
    <section style={styles.hero} aria-label="Featured announcement">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token
            size="sm"
            color="gray"
            icon={<Icon icon={PinIcon} size="xsm" color="inherit" />}
            label="Featured"
          />
          <CategoryChip category={HERO.category} />
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {HERO.postedLabel}
          </Text>
        </HStack>

        <Heading level={2}>{HERO.title}</Heading>
        <Byline
          name={HERO.author}
          detail={ROLES[HERO.author]}
          avatarSize="small"
        />

        <VStack gap={2} style={styles.heroBody}>
          {HERO.paragraphs.map(para => (
            <Text key={para.slice(0, 24)} color="secondary">
              {para}
            </Text>
          ))}
        </VStack>

        <HStack gap={2} wrap="wrap">
          {HERO.links.map(link => (
            <button key={link.id} type="button" style={styles.linkChip}>
              <span style={styles.linkChipIcon}>
                <Icon icon={link.icon} size="xsm" color="inherit" />
              </span>
              <span style={styles.linkChipLabel}>{link.label}</span>
            </button>
          ))}
        </HStack>

        <Divider />

        <HStack gap={3} vAlign="center" wrap="wrap">
          <HStack gap={1} vAlign="center" aria-label="Reactions">
            {reactions.map(reaction => (
              <ToggleButton
                key={reaction.name}
                size="sm"
                label={\`\${reaction.emoji} \${reaction.count}\`}
                tooltip={reaction.name}
                isPressed={reaction.isYours}
                onPressedChange={() => onToggleReaction(reaction.name)}
              />
            ))}
          </HStack>
          <StackItem size="fill" />
          <HStack gap={2} vAlign="center">
            <ProgressBar
              label="Read progress across the company"
              isLabelHidden
              value={HERO.readPct}
              max={100}
              variant="neutral"
              style={styles.readBar}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Read by {HERO.readCount} of {COMPANY.headcount} ·{' '}
              {HERO.readPct}% of company
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </section>
  );
}

function AnnouncementRow({
  post,
  onOpen,
}: {
  post: Announcement;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      style={styles.listRow}
      onClick={() => onOpen(post.id)}
      aria-label={\`\${post.isRead ? 'Read' : 'Unread'}: \${post.title}, by \${post.author}\`}>
      <span
        style={post.isRead ? styles.readDot : styles.unreadDot}
        aria-hidden
      />
      <VStack gap={1} style={{minWidth: 0, flex: 1}}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="label" style={styles.rowExcerpt}>
            {post.title}
          </Text>
          <CategoryChip category={post.category} />
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {post.postedLabel}
          </Text>
        </HStack>
        <Text type="supporting" color="secondary" style={styles.rowExcerpt}>
          {post.excerpt}
        </Text>
        <HStack gap={2} vAlign="center">
          <Byline
            name={post.author}
            detail={ROLES[post.author]}
            avatarSize="tiny"
          />
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {post.reactionCount} reactions
          </Text>
        </HStack>
      </VStack>
    </button>
  );
}
// ---------------------------------------------------------------------------
// MODERATED Q&A
// ---------------------------------------------------------------------------

function QuestionRow({
  question,
  onToggleVote,
}: {
  question: Question;
  onToggleVote: (id: string) => void;
}) {
  return (
    <div style={styles.qaRow}>
      <ToggleButton
        size="sm"
        label={String(question.votes)}
        tooltip={question.isYourVote ? 'Remove upvote' : 'Upvote'}
        icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
        isPressed={question.isYourVote}
        onPressedChange={() => onToggleVote(question.id)}
      />
      <VStack gap={1} style={{minWidth: 0, flex: 1}}>
        <Text type="label">{question.text}</Text>
        <HStack gap={2} vAlign="center" wrap="wrap">
          {question.author === null ? (
            <AnonBadge />
          ) : (
            <HStack gap={1} vAlign="center">
              <Avatar name={question.author} size="tiny" />
              <Text type="supporting" color="secondary">
                {question.author}
              </Text>
            </HStack>
          )}
          {question.newHireChip !== undefined ? (
            <Token size="sm" color="teal" label={question.newHireChip} />
          ) : null}
          <Text type="supporting" color="secondary" hasTabularNumbers>
            · {question.submittedLabel}
          </Text>
          {question.status === 'live' ? (
            <Token
              size="sm"
              color="red"
              icon={<Icon icon={RadioIcon} size="xsm" color="inherit" />}
              label="Answering live"
            />
          ) : null}
          {question.status === 'answered' ? (
            <Token
              size="sm"
              color="green"
              icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
              label="Answered"
            />
          ) : null}
        </HStack>
        {question.answer !== undefined ? (
          <div style={styles.answerCard}>
            <VStack gap={1}>
              <Byline
                name={question.answer.by}
                detail={\`\${ROLES[question.answer.by]} · \${question.answer.whenLabel}\`}
                avatarSize="tiny"
              />
              <Text type="supporting" color="secondary">
                {question.answer.text}
              </Text>
            </VStack>
          </div>
        ) : null}
      </VStack>
    </div>
  );
}

type QaSort = 'top' | 'newest';

interface QaProps {
  questions: Question[];
  sort: QaSort;
  onSortChange: (sort: QaSort) => void;
  voteTotal: number;
  onToggleVote: (id: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  isAnonymous: boolean;
  onAnonymousChange: (value: boolean) => void;
  onSubmit: () => void;
}

function QaHeader({
  count,
  voteTotal,
  sort,
  onSortChange,
}: {
  count: number;
  voteTotal: number;
  sort: QaSort;
  onSortChange: (sort: QaSort) => void;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={MessageCircleQuestionIcon} size="sm" color="secondary" />
        <Heading level={3}>Townhall Q&A</Heading>
        <Token size="sm" color="gray" label="Moderated" />
        <StackItem size="fill" />
        <SegmentedControl
          label="Sort questions"
          value={sort}
          onChange={value => onSortChange(value as QaSort)}
          size="sm">
          <SegmentedControlItem label="Top" value="top" />
          <SegmentedControlItem label="Newest" value="newest" />
        </SegmentedControl>
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {NEXT_TOWNHALL.whenLabel} · {NEXT_TOWNHALL.hostLabel}
      </Text>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {count} in queue · {voteTotal} upvotes · top-voted go live first
      </Text>
    </VStack>
  );
}
function QaComposer({
  draft,
  onDraftChange,
  isAnonymous,
  onAnonymousChange,
  onSubmit,
}: Pick<
  QaProps,
  'draft' | 'onDraftChange' | 'isAnonymous' | 'onAnonymousChange' | 'onSubmit'
>) {
  return (
    <VStack gap={2}>
      <Text type="label">Ask a question for Friday</Text>
      <TextArea
        label="Your townhall question"
        isLabelHidden
        placeholder="What should Priya & Dana cover?"
        rows={2}
        width="100%"
        value={draft}
        onChange={onDraftChange}
      />
      <HStack gap={2} vAlign="center" wrap="wrap">
        <div style={styles.switchKnobScope}>
          <Switch
            label="Ask anonymously"
            value={isAnonymous}
            onChange={onAnonymousChange}
          />
        </div>
        <StackItem size="fill" />
        <Button
          label="Add to queue"
          variant="primary"
          size="sm"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          isDisabled={draft.trim().length === 0}
          onClick={onSubmit}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        {isAnonymous
          ? 'Your name is hidden from everyone, including the hosts.'
          : \`Posting as \${YOU} — moderators may merge duplicates.\`}
      </Text>
    </VStack>
  );
}

/** The full Q&A stack. \`variant="panel"\` pins header and composer around a
 * scrolling queue; \`variant="inline"\` renders one static section for the
 * <=920px single-column swap. */
function QaSection({variant, ...props}: QaProps & {variant: 'panel' | 'inline'}) {
  const {questions, sort, onSortChange, voteTotal, onToggleVote} = props;
  const header = (
    <QaHeader
      count={questions.length}
      voteTotal={voteTotal}
      sort={sort}
      onSortChange={onSortChange}
    />
  );
  const queue = (
    <VStack gap={1}>
      {questions.map((question, index) => (
        <VStack gap={0} key={question.id}>
          {index > 0 ? <Divider /> : null}
          <QuestionRow question={question} onToggleVote={onToggleVote} />
        </VStack>
      ))}
    </VStack>
  );
  const composer = (
    <QaComposer
      draft={props.draft}
      onDraftChange={props.onDraftChange}
      isAnonymous={props.isAnonymous}
      onAnonymousChange={props.onAnonymousChange}
      onSubmit={props.onSubmit}
    />
  );

  if (variant === 'inline') {
    return (
      <section style={styles.qaInline} aria-label="Townhall Q&A">
        <div style={styles.qaHeader}>{header}</div>
        <div style={styles.qaInlineBody}>{queue}</div>
        <div style={styles.composer}>{composer}</div>
      </section>
    );
  }

  return (
    <div style={styles.panelFill}>
      <div style={styles.qaHeader}>{header}</div>
      <div style={styles.qaScroll}>{queue}</div>
      <div style={styles.composer}>{composer}</div>
    </div>
  );
}
// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function TownhallAnnouncementsTemplate() {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL_REACTIONS);
  const [posts, setPosts] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [sort, setSort] = useState<QaSort>('top');
  const [draft, setDraft] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [liveNote, setLiveNote] = useState('');

  // Responsive contract: <=1200px drops the townhalls rail; <=920px drops
  // the Q&A end panel and renders the Q&A section inline below the feed.
  const isRailHidden = useMediaQuery('(max-width: 1200px)');
  const isSingleColumn = useMediaQuery('(max-width: 920px)');

  // Derived during render — never stored: unread chip, per-category counts,
  // queue stats. Numbers reconcile because they share one source of truth.
  const unreadCount = posts.filter(post => !post.isRead).length;
  const voteTotal = questions.reduce((sum, q) => sum + q.votes, 0);
  const categoryCount = (id: Category | 'all') =>
    id === 'all'
      ? posts.length + 1
      : posts.filter(post => post.category === id).length +
        (HERO.category === id ? 1 : 0);

  const visiblePosts =
    filter === 'all' ? posts : posts.filter(post => post.category === filter);
  const isHeroVisible = filter === 'all' || HERO.category === filter;

  const sortedQuestions = useMemo(() => {
    const list = [...questions];
    return sort === 'top'
      ? list.sort((a, b) => b.votes - a.votes || b.order - a.order)
      : list.sort((a, b) => b.order - a.order);
  }, [questions, sort]);

  const toggleReaction = (name: string) => {
    setReactions(prev =>
      prev.map(reaction =>
        reaction.name === name
          ? {
              ...reaction,
              isYours: !reaction.isYours,
              count: reaction.count + (reaction.isYours ? -1 : 1),
            }
          : reaction,
      ),
    );
    setLiveNote(\`Reaction \${name} toggled\`);
  };

  const openPost = (id: string) => {
    const post = posts.find(item => item.id === id);
    setPosts(prev =>
      prev.map(item => (item.id === id ? {...item, isRead: true} : item)),
    );
    if (post !== undefined) {
      setLiveNote(\`Opened \${post.title}\`);
    }
  };

  const markAllRead = () => {
    setPosts(prev => prev.map(item => ({...item, isRead: true})));
    setLiveNote('All announcements marked as read');
  };

  const toggleVote = (id: string) => {
    setQuestions(prev =>
      prev.map(question =>
        question.id === id
          ? {
              ...question,
              isYourVote: !question.isYourVote,
              votes: question.votes + (question.isYourVote ? -1 : 1),
            }
          : question,
      ),
    );
  };

  const submitQuestion = () => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    const nextCount = submitCount + 1;
    setSubmitCount(nextCount);
    setQuestions(prev => [
      ...prev,
      {
        id: \`q-you-\${nextCount}\`,
        text,
        author: isAnonymous ? null : YOU,
        submittedLabel: 'Wed Jul 15 · just now',
        order: Math.max(...prev.map(q => q.order)) + 1,
        votes: 1,
        isYourVote: true,
      },
    ]);
    setDraft('');
    setLiveNote(
      isAnonymous
        ? 'Question added to the queue anonymously'
        : 'Question added to the queue',
    );
  };
  const qaProps: QaProps = {
    questions: sortedQuestions,
    sort,
    onSortChange: setSort,
    voteTotal,
    onToggleVote: toggleVote,
    draft,
    onDraftChange: setDraft,
    isAnonymous,
    onAnonymousChange: setIsAnonymous,
    onSubmit: submitQuestion,
  };

  // ----- header: brand, next-townhall chip, new-announcement action -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isSingleColumn ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={MegaphoneIcon} size="md" color="secondary" />
          <Heading level={1}>Townhall & Announcements</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {COMPANY.name} · {COMPANY.headcount} people
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Token
          size="md"
          color="teal"
          icon={<Icon icon={RadioIcon} size="xsm" color="inherit" />}
          label="Next: Fri Jul 17 · 10:00 AM PT"
        />
        <Button
          label="New announcement"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- announcements feed (single scroll column, measure 860) -----
  const feed = (
    <div style={styles.contentScroll}>
      <div style={styles.contentInner}>
        <VStack gap={4}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <HStack gap={1} vAlign="center" aria-label="Filter by category">
              {CATEGORY_FILTERS.map(item => (
                <ToggleButton
                  key={item.id}
                  size="sm"
                  label={\`\${item.label} \${categoryCount(item.id)}\`}
                  isPressed={filter === item.id}
                  onPressedChange={() => setFilter(item.id)}
                />
              ))}
            </HStack>
            <StackItem size="fill" />
            {unreadCount > 0 ? (
              <Token
                size="sm"
                color="blue"
                label={\`\${unreadCount} unread\`}
              />
            ) : (
              <Token size="sm" color="gray" label="All caught up" />
            )}
            <Button
              label="Mark all read"
              variant="ghost"
              size="sm"
              icon={<Icon icon={CheckCheckIcon} size="sm" />}
              isDisabled={unreadCount === 0}
              onClick={markAllRead}
            />
          </HStack>

          {isHeroVisible ? (
            <HeroPanel reactions={reactions} onToggleReaction={toggleReaction} />
          ) : null}

          <VStack gap={0}>
            {visiblePosts.map((post, index) => (
              <VStack gap={0} key={post.id}>
                {index > 0 ? <Divider /> : null}
                <AnnouncementRow post={post} onOpen={openPost} />
              </VStack>
            ))}
          </VStack>

          {isSingleColumn ? <QaSection variant="inline" {...qaProps} /> : null}
        </VStack>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isRailHidden ? undefined : (
            <LayoutPanel width={300} padding={0} hasDivider label="Townhalls">
              <TownhallRail
                questionCount={questions.length}
                voteTotal={voteTotal}
              />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.panelFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {liveNote}
              </div>
              {feed}
            </div>
          </LayoutContent>
        }
        end={
          isSingleColumn ? undefined : (
            <LayoutPanel
              width={380}
              padding={0}
              hasDivider
              label="Townhall Q&A">
              <QaSection variant="panel" {...qaProps} />
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}

`;export{e as default};