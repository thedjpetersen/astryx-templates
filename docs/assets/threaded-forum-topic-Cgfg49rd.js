var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Threaded Forum Topic — one Q&A discussion read as a nested tree.
 * @input Deterministic fixtures only: one forum topic ('How should we
 *   structure optimistic updates with server actions?') asked by Lena
 *   Ortiz on 2026-06-27, tagged react / server-actions /
 *   state-management, with 1,284 views and 22 seeded replies nested up
 *   to 4 levels deep across 8 authors (the OP, one moderator, six
 *   regulars — the signed-in user is Devon Park). Each reply carries a
 *   fixed ISO timestamp and a base vote tally (one answer sits at -3),
 *   and Priya Raman's top answer is the accepted answer. Four related
 *   threads and a follower count round out the rail. No Date.now(),
 *   Math.random(), or network assets — avatars are initials only;
 *   everything posted at runtime uses the fixed literal timestamp
 *   2026-07-02T18:05:00Z.
 * @output Forum topic page: a sticky LayoutHeader with a back Link, the
 *   topic title, a Solved Badge, tag Tokens, live view/reply/participant
 *   counters, Follow and Bookmark toggles, a top/newest/chronological
 *   sort SegmentedControl, and a 'Jump to best answer' Button that
 *   scrolls to and pulses the accepted reply. LayoutContent scrolls the
 *   nested reply tree: each reply shows an Avatar header with OP/Mod
 *   Badges, body paragraphs, and a footer with upvote/downvote toggles
 *   (scores update live), a Reply button opening an inline composer that
 *   inserts the new reply into the correct branch with a highlight
 *   flash, and a collapse control that folds any subtree into a
 *   descendant-count pill which expands back in place. Sorting genuinely
 *   reorders every sibling group while collapse state persists. A right
 *   300px LayoutPanel holds the topic summary MetadataList (followers
 *   track the header Follow toggle), top participants derived live from
 *   the tree, and related threads.
 * @position Emitted by \`astryx template threaded-forum-topic\`.
 *
 * Frame: Layout height="fill". LayoutHeader is the sticky topic chrome
 * (title row + tags/counters row + sort/jump row). LayoutContent scrolls
 * one centered ~760px column: the reply tree, then a root composer.
 * LayoutPanel end 300 hosts the scrolling summary rail. Nesting draws a
 * 2px thread rule per level instead of heavy cards.
 *
 * Container policy (discussion-tree archetype): replies are borderless
 * prose blocks behind thread rules — Cards are reserved for the inline
 * composers and the stacked rail fallback; the accepted answer gets a
 * tinted well so it reads as the destination of 'Jump to best answer'.
 *
 * Distinct from issue-detail: this surface is a community Q&A tree
 * ranked by votes, not a ticket with sub-tasks and CI panels. Distinct
 * from mail-thread-reader: replies branch and re-rank; mail is one
 * linear correspondence.
 *
 * Responsive contract:
 * - >960px  — header | reply column (fill, scrolls) | summary rail 300
 *   (fixed, scrolls vertically). Only the column and rail scroll.
 * - <=960px — the rail leaves the right edge and becomes a collapsible
 *   'About this topic' Card above the tree (closed by default so the
 *   accepted answer stays near the fold); everything in it keeps
 *   working, including the live participant counts.
 * - <=640px — the header sheds the tag Tokens and author titles, the
 *   counters collapse to icon+number pairs, and the sort control plus
 *   'Jump to best answer' wrap onto their own full-width row; nesting
 *   indentation narrows (14px → 8px per level) so depth-4 replies keep
 *   a readable measure at 375px; vote/collapse/reply controls grow to
 *   40px touch targets; nothing is hover-only — every Tooltip annotates
 *   a focusable control and scores stay visible as text.
 * - The header stays pinned at every width; long words in reply bodies
 *   wrap with overflowWrap so no branch forces horizontal scroll.
 */

import {useRef, useState, type CSSProperties, type ReactNode} from 'react';

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
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArrowBigDownIcon,
  ArrowBigUpIcon,
  ArrowLeftIcon,
  BellIcon,
  BellOffIcon,
  BookmarkIcon,
  CheckCircle2Icon,
  EyeIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  MinusIcon,
  PanelRightIcon,
  PlusIcon,
  ReplyIcon,
  SendIcon,
  ShieldCheckIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  column: {
    maxWidth: 760,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  columnCompact: {
    paddingBlock: 'var(--spacing-3)',
  },
  // Summary rail: the panel is fixed at 300px, only the list scrolls.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  headerWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  metaWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  // <=640px: sort + jump take their own full-width row.
  controlsRow: {width: '100%'},
  // Nested branches hang behind a 2px thread rule; indentation narrows
  // below 640px so depth-4 replies keep a readable measure at 375px.
  childrenWrap: {
    marginLeft: 14,
    paddingLeft: 'var(--spacing-3)',
    borderLeft: '2px solid var(--color-border)',
  },
  childrenWrapCompact: {
    marginLeft: 8,
    paddingLeft: 'var(--spacing-2)',
    borderLeft: '2px solid var(--color-border)',
  },
  // Each reply block can flash (new insert) or pulse (jump to best
  // answer) — both fade back through the background transition.
  replyBlock: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'transparent',
    transition: 'background-color 700ms ease, box-shadow 700ms ease',
  },
  replyBlockSpotlit: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--color-accent-muted)',
    boxShadow: '0 0 0 2px var(--color-accent)',
    transition: 'background-color 700ms ease, box-shadow 700ms ease',
  },
  // The accepted answer reads as a destination: a tinted well that stays
  // put regardless of sort order.
  acceptedWell: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-green)',
    transition: 'background-color 700ms ease, box-shadow 700ms ease',
  },
  acceptedWellSpotlit: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-green)',
    boxShadow: '0 0 0 2px var(--color-accent)',
    transition: 'background-color 700ms ease, box-shadow 700ms ease',
  },
  replyBody: {overflowWrap: 'anywhere'},
  // Live vote tally: never wraps, stays visible as text (no hover-only
  // meaning on the arrow buttons).
  scoreCell: {
    minWidth: 24,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  noWrapCell: {whiteSpace: 'nowrap', flexShrink: 0},
  // <=640px: sm controls grow to 40px touch targets (glyphs stay sm).
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  composerCard: {marginTop: 'var(--spacing-2)'},
  relatedRow: {paddingBlock: 'var(--spacing-2)'},
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in user is Devon Park.
// ---------------------------------------------------------------------------

const TOPIC_TITLE =
  'How should we structure optimistic updates with server actions?';
const TOPIC_ASKED_AT = '2026-06-27T10:20:00Z';
const TOPIC_LAST_ACTIVITY = '2026-07-02T08:41:00Z';
const TOPIC_VIEWS = 1284;
const BASE_FOLLOWERS = 18;
const CURRENT_USER_ID = 'devon';
// Fixed literal timestamp for everything posted at runtime.
const NOW_TIMESTAMP = '2026-07-02T18:05:00Z';

const TOPIC_TAGS: Array<{label: string; color: TokenColor}> = [
  {label: 'react', color: 'blue'},
  {label: 'server-actions', color: 'purple'},
  {label: 'state-management', color: 'teal'},
];

type Role = 'op' | 'mod' | 'member';

interface ForumUser {
  name: string;
  role: Role;
  title: string;
}

const USERS: Record<string, ForumUser> = {
  lena: {name: 'Lena Ortiz', role: 'op', title: 'Frontend engineer'},
  marcus: {name: 'Marcus Reid', role: 'mod', title: 'Community moderator'},
  priya: {name: 'Priya Raman', role: 'member', title: 'Design systems @ Northwind'},
  devon: {name: 'Devon Park', role: 'member', title: 'Full-stack dev (you)'},
  sam: {name: 'Sam Okafor', role: 'member', title: 'Platform team lead'},
  ivy: {name: 'Ivy Tran', role: 'member', title: 'Performance nerd'},
  theo: {name: 'Theo Lindqvist', role: 'member', title: 'Indie builder'},
  noor: {name: 'Noor Haddad', role: 'member', title: 'Staff engineer'},
  felix: {name: 'Felix Amara', role: 'member', title: 'Distributed-systems tinkerer'},
};

const TOPIC_BODY = [
  'We have a shared shopping cart edited by multiple tabs and sometimes ' +
    'multiple people. Every mutation goes through a server action, and the ' +
    'naive useOptimistic approach falls apart once two updates are in ' +
    'flight: the second response clobbers the first optimistic patch.',
  'Do you queue mutations client-side, tag them with ids, or give up and ' +
    'refetch after every action? Looking for a pattern that survives ' +
    'slow networks without the UI snapping backwards.',
];

interface ForumReply {
  id: string;
  parentId: string | null;
  author: string;
  /** Fixed ISO timestamp — no clocks. */
  postedAt: string;
  /** Base tally before the signed-in user's vote is applied. */
  score: number;
  body: string[];
  isAccepted?: boolean;
}

const INITIAL_REPLIES: ForumReply[] = [
  // --- Priya's accepted answer and its branch (depth 1-4) ---
  {
    id: 'r1',
    parentId: null,
    author: 'priya',
    postedAt: '2026-06-27T14:02:00Z',
    score: 48,
    isAccepted: true,
    body: [
      'Treat the optimistic layer as a reducer over a queue of pending ' +
        'mutations, not as a single patched snapshot. Every mutation gets a ' +
        'client id; useOptimistic replays the whole queue on top of the last ' +
        'confirmed server state.',
      'When a server action settles, you remove that one mutation from the ' +
        'queue and keep replaying the rest. Two in-flight edits stop fighting ' +
        'because neither owns the snapshot — they are both just entries in ' +
        'the replay log.',
    ],
  },
  {
    id: 'r1a',
    parentId: 'r1',
    author: 'lena',
    postedAt: '2026-06-27T15:10:00Z',
    score: 12,
    body: [
      'This clicked immediately. Rewrote the cart around a pending-mutation ' +
        'queue and the clobbering is gone — marking this as the answer.',
    ],
  },
  {
    id: 'r1b',
    parentId: 'r1',
    author: 'theo',
    postedAt: '2026-06-27T18:22:00Z',
    score: 6,
    body: [
      'How do you roll back when one mutation in the middle of the queue ' +
        'fails? Dropping it changes what every later entry replays on top of.',
    ],
  },
  {
    id: 'r1b1',
    parentId: 'r1b',
    author: 'priya',
    postedAt: '2026-06-27T19:05:00Z',
    score: 14,
    body: [
      'That is the nice part: you just delete the failed entry and replay. ' +
        'Later mutations were written against optimistic state anyway, so ' +
        'replaying them over the corrected base is exactly the semantics you ' +
        'want. Surface a toast for the dropped one so the user knows.',
    ],
  },
  {
    id: 'r1b1a',
    parentId: 'r1b1',
    author: 'theo',
    postedAt: '2026-06-28T09:12:00Z',
    score: 3,
    body: [
      'Confirmed — tried it with a forced 500 on the second of three queued ' +
        'edits and the other two replayed cleanly. Only edge case left is a ' +
        'delete racing an edit of the same line item.',
    ],
  },
  {
    id: 'r1c',
    parentId: 'r1',
    author: 'noor',
    postedAt: '2026-06-28T11:40:00Z',
    score: 4,
    body: [
      'Worth adding a double-submit guard: disable the control while its ' +
        'mutation id is still in the queue, or coalesce repeat edits to the ' +
        'same field into one entry. Saved us a lot of duplicate rows.',
    ],
  },
  // --- Marcus (mod) on idempotency (depth 1-3) ---
  {
    id: 'r2',
    parentId: null,
    author: 'marcus',
    postedAt: '2026-06-27T16:45:00Z',
    score: 23,
    body: [
      'Mod hat off, engineer hat on: whatever client pattern you pick, give ' +
        'every server action an idempotency key derived from the mutation ' +
        'id. Retries after a timeout are where most "optimistic" bugs ' +
        'actually live — the server applies the write twice and no client ' +
        'queue can save you.',
    ],
  },
  {
    id: 'r2a',
    parentId: 'r2',
    author: 'sam',
    postedAt: '2026-06-27T20:15:00Z',
    score: 8,
    body: [
      'Seconding this. We key ours as \`\${sessionId}:\${mutationId}\` and store ' +
        'the response for 24h — a replay returns the original result instead ' +
        'of re-applying.',
    ],
  },
  {
    id: 'r2a1',
    parentId: 'r2a',
    author: 'marcus',
    postedAt: '2026-06-28T08:02:00Z',
    score: 5,
    body: [
      'Exactly. And return the stored response with the same status code — ' +
        'if the original failed validation, the replay should fail the same ' +
        'way, not silently succeed.',
    ],
  },
  {
    id: 'r2b',
    parentId: 'r2',
    author: 'ivy',
    postedAt: '2026-06-28T10:31:00Z',
    score: 2,
    body: [
      'Does the key live in a header or in the action payload? We ended up ' +
        'threading it through the payload so it survives the framework’s ' +
        'action serialization.',
    ],
  },
  {
    id: 'r2c',
    parentId: 'r2',
    author: 'felix',
    postedAt: '2026-06-29T13:27:00Z',
    score: 1,
    body: [
      'Payload for us too. Headers get dropped by one of our proxies when ' +
        'the action falls back to a full-page POST.',
    ],
  },
  // --- Felix's event-log alternative (depth 1-4) ---
  {
    id: 'r3',
    parentId: null,
    author: 'felix',
    postedAt: '2026-06-28T09:55:00Z',
    score: 15,
    body: [
      'Alternative framing: make the cart an event log instead of a ' +
        'document. The client appends events (add, remove, set-qty) and ' +
        'renders a fold over confirmed + pending events. Multi-tab and ' +
        'multi-user then come for free, because merging logs is trivial ' +
        'compared to merging snapshots.',
    ],
  },
  {
    id: 'r3a',
    parentId: 'r3',
    author: 'ivy',
    postedAt: '2026-06-28T12:14:00Z',
    score: 7,
    body: [
      'How big does the log get before the fold cost shows up in interaction ' +
        'latency? Carts are small, but we render the fold on every ' +
        'keystroke of the quantity input.',
    ],
  },
  {
    id: 'r3a1',
    parentId: 'r3a',
    author: 'felix',
    postedAt: '2026-06-28T16:48:00Z',
    score: 6,
    body: [
      'Snapshot every N confirmed events and fold only the tail. For a cart ' +
        'N=50 is generous; the tail is rarely more than the handful of ' +
        'pending events.',
    ],
  },
  {
    id: 'r3a1a',
    parentId: 'r3a1',
    author: 'ivy',
    postedAt: '2026-06-29T10:05:00Z',
    score: 2,
    body: [
      'Measured it: 50-event tail folds in ~0.1ms on a mid-range phone. ' +
        'Fold cost is a non-issue, consider me converted.',
    ],
  },
  {
    id: 'r3b',
    parentId: 'r3',
    author: 'devon',
    postedAt: '2026-06-29T17:20:00Z',
    score: 3,
    body: [
      'We shipped this shape last quarter. One warning: give events a total ' +
        'order from the server, not client timestamps, or two tabs can fold ' +
        'to different carts until the next sync.',
    ],
  },
  // --- Noor's library pointer (depth 1-2) ---
  {
    id: 'r4',
    parentId: null,
    author: 'noor',
    postedAt: '2026-06-29T09:12:00Z',
    score: 7,
    body: [
      'If you would rather not hand-roll the queue, the mutation layer in ' +
        'the usual server-cache libraries already implements replay-on-top ' +
        'semantics with rollback hooks. You keep server actions as the ' +
        'transport and let the library own the pending state.',
    ],
  },
  {
    id: 'r4a',
    parentId: 'r4',
    author: 'lena',
    postedAt: '2026-06-29T11:47:00Z',
    score: 2,
    body: [
      'We looked at that first, but the bundle cost was hard to justify for ' +
        'one surface. The hand-rolled queue landed at about 80 lines.',
    ],
  },
  // --- Sam's polling take, corrected by the mod (depth 1-2) ---
  {
    id: 'r5',
    parentId: null,
    author: 'sam',
    postedAt: '2026-06-30T08:30:00Z',
    score: -3,
    body: [
      'Honestly? Skip optimism entirely and poll the cart every two seconds. ' +
        'Users do not notice, and you delete a whole class of bugs.',
    ],
  },
  {
    id: 'r5a',
    parentId: 'r5',
    author: 'marcus',
    postedAt: '2026-06-30T09:18:00Z',
    score: 9,
    body: [
      'They do notice on the checkout path — a two-second-stale quantity is ' +
        'how you get support tickets about being charged for three of a ' +
        'thing. Polling also fights the optimistic layer instead of ' +
        'replacing it: your own writes come back stale mid-flight.',
    ],
  },
  // --- Ivy's benchmark (depth 1-2) ---
  {
    id: 'r6',
    parentId: null,
    author: 'ivy',
    postedAt: '2026-07-01T15:36:00Z',
    score: 4,
    body: [
      'Benchmarked the three approaches from this thread on a throttled ' +
        'Fast-3G profile: queue-replay and event-log both hold 60fps during ' +
        'triple concurrent edits; snapshot-patching drops frames every time ' +
        'a response lands. Happy to share the harness.',
    ],
  },
  {
    id: 'r6a',
    parentId: 'r6',
    author: 'lena',
    postedAt: '2026-07-02T08:41:00Z',
    score: 1,
    body: ['Please do — that harness would make a great pinned resource.'],
  },
];

const RELATED_THREADS: Array<{
  id: string;
  title: string;
  replies: number;
  isSolved: boolean;
}> = [
  {
    id: 'rel-1',
    title: 'useOptimistic vs. useTransition for form-heavy pages',
    replies: 31,
    isSolved: true,
  },
  {
    id: 'rel-2',
    title: 'Idempotency keys for server actions — where to store them?',
    replies: 14,
    isSolved: true,
  },
  {
    id: 'rel-3',
    title: 'Event-sourcing a client cache: war stories?',
    replies: 42,
    isSolved: false,
  },
  {
    id: 'rel-4',
    title: 'Multi-tab state sync without a service worker',
    replies: 9,
    isSolved: false,
  },
];

// ---------------------------------------------------------------------------
// SORTING + TREE HELPERS
// ---------------------------------------------------------------------------

type SortMode = 'top' | 'newest' | 'chronological';

const SORT_LABELS: Record<SortMode, string> = {
  top: 'Top',
  newest: 'Newest',
  chronological: 'Oldest',
};

/** parentId -> ordered children (insertion order; sorted at render). */
function buildChildrenMap(replies: ForumReply[]): Map<string | null, ForumReply[]> {
  const map = new Map<string | null, ForumReply[]>();
  for (const reply of replies) {
    const bucket = map.get(reply.parentId);
    if (bucket === undefined) {
      map.set(reply.parentId, [reply]);
    } else {
      bucket.push(reply);
    }
  }
  return map;
}

/** All descendants below a reply — powers the collapsed-count pill. */
function countDescendants(
  id: string,
  childrenMap: Map<string | null, ForumReply[]>,
): number {
  const children = childrenMap.get(id) ?? [];
  return children.reduce(
    (total, child) => total + 1 + countDescendants(child.id, childrenMap),
    0,
  );
}

function toggled(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

const ROLE_BADGE: Record<Role, {label: string; variant: 'info' | 'purple'} | null> = {
  op: {label: 'OP', variant: 'info'},
  mod: {label: 'Mod', variant: 'purple'},
  member: null,
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ThreadedForumTopicTemplate() {
  const [replies, setReplies] = useState<ForumReply[]>(INITIAL_REPLIES);
  // Signed-in user's vote per reply: +1, -1, or absent.
  const [myVotes, setMyVotes] = useState<Record<string, 1 | -1>>({});
  // Collapsed subtrees — keyed by id, so re-sorting preserves the state.
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [sortMode, setSortMode] = useState<SortMode>('top');
  // Inline composer target: a reply id, 'root' for the bottom composer,
  // or null when every composer is closed. One composer at a time.
  const [composerFor, setComposerFor] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  // Spotlight = highlight flash on a fresh insert OR the jump-to-best
  // pulse; one id at a time, cleared by a short timer.
  const [spotlitId, setSpotlitId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const replyRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const spotlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive contract (see file header).
  const isRailStacked = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ----- derived state -------------------------------------------------------

  const childrenMap = buildChildrenMap(replies);
  const acceptedReply = replies.find(reply => reply.isAccepted === true);

  const liveScore = (reply: ForumReply): number =>
    reply.score + (myVotes[reply.id] ?? 0);

  const sortSiblings = (siblings: ForumReply[]): ForumReply[] => {
    const sorted = [...siblings];
    if (sortMode === 'top') {
      // Accepted answer pins first among top-level answers; the rest
      // rank by live score, ties broken oldest-first.
      sorted.sort((a, b) => {
        if (a.isAccepted === true && b.isAccepted !== true) return -1;
        if (b.isAccepted === true && a.isAccepted !== true) return 1;
        const delta = liveScore(b) - liveScore(a);
        return delta !== 0 ? delta : a.postedAt.localeCompare(b.postedAt);
      });
    } else if (sortMode === 'newest') {
      sorted.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    } else {
      sorted.sort((a, b) => a.postedAt.localeCompare(b.postedAt));
    }
    return sorted;
  };

  const participantIds = new Set<string>(['lena']);
  for (const reply of replies) {
    participantIds.add(reply.author);
  }

  // Post counts per author (topic post counts for the OP) — the rail's
  // top-participants list re-derives whenever a reply is posted.
  const postCounts = new Map<string, number>([['lena', 1]]);
  for (const reply of replies) {
    postCounts.set(reply.author, (postCounts.get(reply.author) ?? 0) + 1);
  }
  const topParticipants = [...postCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4);

  const followerCount = BASE_FOLLOWERS + (isFollowing ? 1 : 0);

  // ----- interactions --------------------------------------------------------

  const spotlight = (id: string) => {
    if (spotlightTimer.current !== null) {
      clearTimeout(spotlightTimer.current);
    }
    setSpotlitId(id);
    spotlightTimer.current = setTimeout(() => setSpotlitId(null), 1800);
  };

  /** Vote toggles: tap again to remove; switching sides swaps the vote. */
  const castVote = (id: string, direction: 1 | -1) => {
    setMyVotes(prev => {
      const next = {...prev};
      if (next[id] === direction) {
        delete next[id];
      } else {
        next[id] = direction;
      }
      return next;
    });
  };

  const toggleCollapsed = (id: string) => {
    setCollapsedIds(prev => toggled(prev, id));
  };

  const openComposer = (target: string) => {
    setComposerFor(prev => (prev === target ? null : target));
    setDraft('');
  };

  const closeComposer = () => {
    setComposerFor(null);
    setDraft('');
  };

  /** Insert the draft into the correct branch, flash it, scroll to it. */
  const postReply = () => {
    const body = draft.trim();
    if (composerFor === null || body.length === 0) {
      return;
    }
    const parentId = composerFor === 'root' ? null : composerFor;
    const newId = \`posted-\${replies.length + 1}\`;
    setReplies(prev => [
      ...prev,
      {
        id: newId,
        parentId,
        author: CURRENT_USER_ID,
        postedAt: NOW_TIMESTAMP,
        score: 0,
        body: [body],
      },
    ]);
    // A collapsed parent would hide the fresh reply — expand it.
    if (parentId !== null) {
      setCollapsedIds(prev => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
    }
    closeComposer();
    spotlight(newId);
    // Defer so the new node has mounted before scrolling.
    requestAnimationFrame(() => {
      replyRefs.current[newId]?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    });
  };

  /** Scroll to the accepted answer and pulse it. */
  const jumpToBestAnswer = () => {
    if (acceptedReply === undefined) {
      return;
    }
    spotlight(acceptedReply.id);
    requestAnimationFrame(() => {
      replyRefs.current[acceptedReply.id]?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    });
  };

  // ----- composer ------------------------------------------------------------

  const composerCard = (target: string) => {
    const replyingTo =
      target === 'root'
        ? 'the topic'
        : USERS[replies.find(reply => reply.id === target)?.author ?? 'lena']
            .name;
    return (
      <Card padding={3} style={styles.composerCard}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={USERS[CURRENT_USER_ID].name} size="xsmall" />
            <StackItem size="fill">
              <Text type="label">Replying to {replyingTo}</Text>
            </StackItem>
            <Tooltip content="Close composer">
              <IconButton
                label="Close composer"
                size="sm"
                variant="ghost"
                style={isCompact ? styles.iconTapTarget : undefined}
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                onClick={closeComposer}
              />
            </Tooltip>
          </HStack>
          <TextArea
            label={\`Reply to \${replyingTo}\`}
            isLabelHidden
            rows={3}
            placeholder="Write your reply — be kind, cite benchmarks…"
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Posting as {USERS[CURRENT_USER_ID].name}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {draft.length} characters
            </Text>
            <Button
              label="Post reply"
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={draft.trim().length === 0}
              onClick={postReply}
            />
          </HStack>
        </VStack>
      </Card>
    );
  };

  // ----- reply tree ----------------------------------------------------------

  const voteCluster = (reply: ForumReply) => {
    const vote = myVotes[reply.id];
    const score = liveScore(reply);
    return (
      <HStack gap={1} vAlign="center">
        <Tooltip content={vote === 1 ? 'Remove upvote' : 'Upvote'}>
          <IconButton
            label={vote === 1 ? 'Remove upvote' : 'Upvote'}
            size="sm"
            variant={vote === 1 ? 'secondary' : 'ghost'}
            style={isCompact ? styles.iconTapTarget : undefined}
            icon={
              <Icon
                icon={ArrowBigUpIcon}
                size="sm"
                color={vote === 1 ? 'accent' : 'secondary'}
              />
            }
            onClick={() => castVote(reply.id, 1)}
          />
        </Tooltip>
        <div style={styles.scoreCell}>
          <Text
            type="supporting"
            weight="semibold"
            hasTabularNumbers
            color={score < 0 ? 'secondary' : undefined}>
            {score}
          </Text>
        </div>
        <Tooltip content={vote === -1 ? 'Remove downvote' : 'Downvote'}>
          <IconButton
            label={vote === -1 ? 'Remove downvote' : 'Downvote'}
            size="sm"
            variant={vote === -1 ? 'secondary' : 'ghost'}
            style={isCompact ? styles.iconTapTarget : undefined}
            icon={
              <Icon
                icon={ArrowBigDownIcon}
                size="sm"
                color={vote === -1 ? 'accent' : 'secondary'}
              />
            }
            onClick={() => castVote(reply.id, -1)}
          />
        </Tooltip>
      </HStack>
    );
  };

  const replyHeader = (reply: ForumReply, isCollapsed: boolean) => {
    const author = USERS[reply.author];
    const roleBadge = ROLE_BADGE[author.role];
    const descendants = countDescendants(reply.id, childrenMap);
    return (
      <HStack gap={2} vAlign="center" style={styles.metaWrap}>
        <Avatar name={author.name} size="xsmall" />
        <Text type="body" weight="semibold">
          {author.name}
        </Text>
        {roleBadge !== null && (
          <Badge
            label={roleBadge.label}
            variant={roleBadge.variant}
            icon={
              author.role === 'mod' ? (
                <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
              ) : undefined
            }
          />
        )}
        {reply.author === CURRENT_USER_ID && (
          <Badge label="You" variant="neutral" />
        )}
        {reply.isAccepted === true && (
          <Badge
            label="Accepted answer"
            variant="green"
            icon={<Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />}
          />
        )}
        {!isCompact && (
          <Text type="supporting" color="secondary" maxLines={1}>
            {author.title}
          </Text>
        )}
        <StackItem size="fill">
          <span />
        </StackItem>
        <div style={styles.noWrapCell}>
          <Timestamp
            value={reply.postedAt}
            format="date_time"
            hasTooltip={false}
            color="secondary"
            type="supporting"
          />
        </div>
        {/* Collapse control: fold the reply + subtree into a count pill. */}
        <Tooltip
          content={
            isCollapsed
              ? \`Expand\${descendants > 0 ? \` \${descendants} hidden\` : ''}\`
              : 'Collapse this subtree'
          }>
          <IconButton
            label={
              isCollapsed
                ? \`Expand reply by \${author.name}\`
                : \`Collapse reply by \${author.name}\`
            }
            size="sm"
            variant="ghost"
            style={isCompact ? styles.iconTapTarget : undefined}
            icon={
              <Icon
                icon={isCollapsed ? PlusIcon : MinusIcon}
                size="sm"
                color="secondary"
              />
            }
            onClick={() => toggleCollapsed(reply.id)}
          />
        </Tooltip>
      </HStack>
    );
  };

  const replyFooter = (reply: ForumReply) => (
    <HStack gap={2} vAlign="center" style={styles.metaWrap}>
      {voteCluster(reply)}
      <Button
        label={composerFor === reply.id ? 'Cancel reply' : 'Reply'}
        size="sm"
        variant="ghost"
        style={isCompact ? styles.buttonTapTarget : undefined}
        icon={<Icon icon={ReplyIcon} size="sm" color="inherit" />}
        onClick={() => openComposer(reply.id)}
      />
    </HStack>
  );

  const renderReply = (reply: ForumReply, depth: number): ReactNode => {
    const isCollapsed = collapsedIds.has(reply.id);
    const children = sortSiblings(childrenMap.get(reply.id) ?? []);
    const descendants = countDescendants(reply.id, childrenMap);
    const isSpotlit = spotlitId === reply.id;
    const blockStyle =
      reply.isAccepted === true
        ? isSpotlit
          ? styles.acceptedWellSpotlit
          : styles.acceptedWell
        : isSpotlit
          ? styles.replyBlockSpotlit
          : styles.replyBlock;

    return (
      <VStack key={reply.id} gap={1}>
        <div
          ref={node => {
            replyRefs.current[reply.id] = node;
          }}
          style={blockStyle}>
          <VStack gap={2}>
            {replyHeader(reply, isCollapsed)}
            {isCollapsed ? (
              // Descendant-count pill — expands the subtree back in place.
              <Button
                label={
                  descendants === 0
                    ? 'Show reply'
                    : \`Show reply · \${descendants} \${
                        descendants === 1 ? 'reply' : 'replies'
                      } hidden\`
                }
                size="sm"
                variant="secondary"
                style={isCompact ? styles.buttonTapTarget : undefined}
                icon={
                  <Icon icon={MessageSquareIcon} size="sm" color="inherit" />
                }
                onClick={() => toggleCollapsed(reply.id)}
              />
            ) : (
              <>
                <VStack gap={2} style={styles.replyBody}>
                  {reply.body.map((paragraph, index) => (
                    <Text key={index} type="body">
                      {paragraph}
                    </Text>
                  ))}
                </VStack>
                {replyFooter(reply)}
              </>
            )}
          </VStack>
        </div>
        {!isCollapsed && composerFor === reply.id && composerCard(reply.id)}
        {!isCollapsed && children.length > 0 && (
          <div
            style={
              isCompact ? styles.childrenWrapCompact : styles.childrenWrap
            }>
            <VStack gap={2}>
              {children.map(child => renderReply(child, depth + 1))}
            </VStack>
          </div>
        )}
      </VStack>
    );
  };

  const topLevelReplies = sortSiblings(childrenMap.get(null) ?? []);

  // ----- header --------------------------------------------------------------

  const counters = (
    <HStack gap={3} vAlign="center" style={styles.metaWrap}>
      <HStack gap={1} vAlign="center">
        <Icon icon={EyeIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {TOPIC_VIEWS.toLocaleString('en-US')}
          {isCompact ? '' : ' views'}
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <Icon icon={MessageSquareIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {replies.length}
          {isCompact ? '' : ' replies'}
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <Icon icon={UsersIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {participantIds.size}
          {isCompact ? '' : ' participants'}
        </Text>
      </HStack>
    </HStack>
  );

  const sortControl = (
    <SegmentedControl
      label="Sort replies"
      size="sm"
      value={sortMode}
      onChange={value => setSortMode(value as SortMode)}>
      <SegmentedControlItem value="top" label={SORT_LABELS.top} />
      <SegmentedControlItem value="newest" label={SORT_LABELS.newest} />
      <SegmentedControlItem
        value="chronological"
        label={SORT_LABELS.chronological}
      />
    </SegmentedControl>
  );

  const jumpButton = (
    <Button
      label="Jump to best answer"
      size="sm"
      variant="secondary"
      style={isCompact ? styles.buttonTapTarget : undefined}
      icon={<Icon icon={CheckCircle2Icon} size="sm" color="green" />}
      onClick={jumpToBestAnswer}
    />
  );

  const header = (
    <LayoutHeader hasDivider>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Link href="#forum" label="Back to forum">
            <Icon icon={ArrowLeftIcon} size="sm" color="secondary" />
          </Link>
          <StackItem size="fill">
            <Heading level={1} maxLines={isCompact ? 2 : 1}>
              {TOPIC_TITLE}
            </Heading>
          </StackItem>
          <Tooltip content={isFollowing ? 'Unfollow topic' : 'Follow topic'}>
            <IconButton
              label={isFollowing ? 'Unfollow topic' : 'Follow topic'}
              size="sm"
              variant={isFollowing ? 'secondary' : 'ghost'}
              style={isCompact ? styles.iconTapTarget : undefined}
              icon={
                <Icon
                  icon={isFollowing ? BellIcon : BellOffIcon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={() => setIsFollowing(prev => !prev)}
            />
          </Tooltip>
          <Tooltip content={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}>
            <IconButton
              label={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
              size="sm"
              variant={isBookmarked ? 'secondary' : 'ghost'}
              style={isCompact ? styles.iconTapTarget : undefined}
              icon={<Icon icon={BookmarkIcon} size="sm" color="inherit" />}
              onClick={() => setIsBookmarked(prev => !prev)}
            />
          </Tooltip>
        </HStack>
        <HStack gap={2} vAlign="center" style={styles.headerWrap}>
          <Badge
            label="Solved"
            variant="green"
            icon={<Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />}
          />
          {!isCompact &&
            TOPIC_TAGS.map(tag => (
              <Token
                key={tag.label}
                label={tag.label}
                size="sm"
                color={tag.color}
              />
            ))}
          <StackItem size="fill">
            <span />
          </StackItem>
          {counters}
        </HStack>
        {/* <=640px: sort + jump wrap to their own full-width row. */}
        {isCompact ? (
          <HStack gap={2} vAlign="center" style={styles.controlsRow}>
            <StackItem size="fill">{sortControl}</StackItem>
            {jumpButton}
          </HStack>
        ) : (
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Sort replies
            </Text>
            {sortControl}
            <StackItem size="fill">
              <span />
            </StackItem>
            {jumpButton}
          </HStack>
        )}
      </VStack>
    </LayoutHeader>
  );

  // ----- topic post ----------------------------------------------------------

  const topicPost = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" style={styles.metaWrap}>
        <Avatar name={USERS.lena.name} size="xsmall" />
        <Text type="body" weight="semibold">
          {USERS.lena.name}
        </Text>
        <Badge label="OP" variant="info" />
        {!isCompact && (
          <Text type="supporting" color="secondary">
            {USERS.lena.title}
          </Text>
        )}
        <StackItem size="fill">
          <span />
        </StackItem>
        <div style={styles.noWrapCell}>
          <Timestamp
            value={TOPIC_ASKED_AT}
            format="date_time"
            hasTooltip={false}
            color="secondary"
            type="supporting"
          />
        </div>
      </HStack>
      <VStack gap={2} style={styles.replyBody}>
        {TOPIC_BODY.map((paragraph, index) => (
          <Text key={index} type="body">
            {paragraph}
          </Text>
        ))}
      </VStack>
    </VStack>
  );

  // ----- rail ----------------------------------------------------------------

  const railSummary = (
    <MetadataList label={{position: 'start', width: 96}}>
      <MetadataListItem label="Asked">
        <Timestamp value={TOPIC_ASKED_AT} format="date" hasTooltip={false} />
      </MetadataListItem>
      <MetadataListItem label="Last activity">
        <Timestamp
          value={TOPIC_LAST_ACTIVITY}
          format="date"
          hasTooltip={false}
        />
      </MetadataListItem>
      <MetadataListItem label="Views">
        <Text type="supporting" hasTabularNumbers>
          {TOPIC_VIEWS.toLocaleString('en-US')}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Replies">
        <Text type="supporting" hasTabularNumbers>
          {replies.length}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Followers">
        <Text type="supporting" hasTabularNumbers>
          {followerCount}
          {isFollowing ? ' · including you' : ''}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Status">
        <Badge
          label="Solved"
          variant="green"
          icon={<Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />}
        />
      </MetadataListItem>
    </MetadataList>
  );

  const railParticipants = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={UsersIcon} size="sm" color="secondary" />
        <Text type="label">Top participants</Text>
      </HStack>
      <VStack gap={2}>
        {topParticipants.map(([userId, count]) => {
          const user = USERS[userId];
          const roleBadge = ROLE_BADGE[user.role];
          return (
            <HStack key={userId} gap={2} vAlign="center">
              <Avatar name={user.name} size="xsmall" />
              <StackItem size="fill">
                <HStack gap={1} vAlign="center" style={styles.metaWrap}>
                  <Text type="supporting" weight="semibold" maxLines={1}>
                    {user.name}
                  </Text>
                  {roleBadge !== null && (
                    <Badge label={roleBadge.label} variant={roleBadge.variant} />
                  )}
                </HStack>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {count} {count === 1 ? 'post' : 'posts'}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );

  const railRelated = (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Icon icon={MessagesSquareIcon} size="sm" color="secondary" />
        <Text type="label">Related threads</Text>
      </HStack>
      <VStack gap={0}>
        {RELATED_THREADS.map((thread, index) => (
          <VStack key={thread.id} gap={0}>
            <div style={styles.relatedRow}>
              <VStack gap={1}>
                <Link href={\`#\${thread.id}\`} type="supporting">
                  {thread.title}
                </Link>
                <HStack gap={2} vAlign="center">
                  <StatusDot
                    variant={thread.isSolved ? 'success' : 'neutral'}
                    label={thread.isSolved ? 'Solved' : 'Open'}
                  />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {thread.isSolved ? 'Solved' : 'Open'} · {thread.replies}{' '}
                    replies
                  </Text>
                </HStack>
              </VStack>
            </div>
            {index < RELATED_THREADS.length - 1 && <Divider />}
          </VStack>
        ))}
      </VStack>
    </VStack>
  );

  const railContent = (
    <VStack gap={4}>
      <VStack gap={2}>
        <Heading level={2}>Topic summary</Heading>
        {railSummary}
      </VStack>
      <Divider />
      {railParticipants}
      <Divider />
      {railRelated}
    </VStack>
  );

  // ----- root composer -------------------------------------------------------

  const rootComposer =
    composerFor === 'root' ? (
      composerCard('root')
    ) : (
      <Button
        label="Write a reply"
        variant="secondary"
        icon={<Icon icon={ReplyIcon} size="sm" color="inherit" />}
        onClick={() => openComposer('root')}
      />
    );

  // ----- page ----------------------------------------------------------------

  return (
    <Layout
      height="fill"
      header={header}
      end={
        isRailStacked ? undefined : (
          <LayoutPanel width={300} padding={0} label="Topic summary">
            <div style={styles.railScroll}>{railContent}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div
            style={
              isCompact
                ? {...styles.column, ...styles.columnCompact}
                : styles.column
            }>
            <VStack gap={4}>
              {/* <=960px: the rail's single-pane fallback — a collapsible
                  card, closed so the accepted answer stays near the fold. */}
              {isRailStacked && (
                <Card padding={3}>
                  <Collapsible
                    defaultIsOpen={false}
                    trigger={
                      <HStack gap={2} vAlign="center">
                        <Icon
                          icon={PanelRightIcon}
                          size="sm"
                          color="secondary"
                        />
                        <Text type="label">About this topic</Text>
                        <Text type="supporting" color="secondary">
                          summary, participants, related
                        </Text>
                      </HStack>
                    }>
                    {railContent}
                  </Collapsible>
                </Card>
              )}

              {topicPost}
              <Divider />

              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Heading level={2}>
                    {replies.length} replies · sorted by{' '}
                    {SORT_LABELS[sortMode]}
                  </Heading>
                </StackItem>
              </HStack>

              <VStack gap={3}>
                {topLevelReplies.map(reply => renderReply(reply, 0))}
              </VStack>

              {rootComposer}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};