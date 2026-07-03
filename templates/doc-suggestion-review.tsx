// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one document under review — 'Atlas
 *   Launch Readiness Brief', 6 paragraphs authored as text/suggestion/anchor
 *   segment runs; 10 tracked-change suggestions from 3 suggesting authors
 *   (Maya Chen x4, Jordan Ellis x3, Priya Nair x3), each with kind
 *   insert/delete/replace, original/proposed spans, and a one-line rationale;
 *   4 comment threads with fixed ISO timestamps between 2026-06-28T17:30:00Z
 *   and 2026-06-30T10:41:00Z anchored to literal text ranges, thread-3
 *   starting resolved with two threads carrying one reply each)
 * @output Collaborative doc REVIEW surface: a toolbar header (doc icon +
 *   title Heading + 'Draft · edited Jun 30 by Alex Rivera' note + live
 *   pending-changes Badge + Undo Button + Suggesting/Viewing
 *   SegmentedControl), a centered white paper canvas rendering inline tracked
 *   changes (<ins> underlined and <del> struck through in per-author ink,
 *   comment anchors on amber dotted underlines), and a right 360px margin
 *   rail interleaving suggestion Cards (author Avatar + kind Badge + paper
 *   diff chip + rationale + Accept/Reject Buttons) with comment-thread Cards
 *   (Avatar + Timestamp, @mentions as Tokens, indented replies, reply
 *   TextArea + Send on the active thread, Resolve/Reopen) in document order
 *   behind an author legend with per-author 'Accept all' batching and a
 *   'Show resolved' Switch. Accepting rewrites the span in place and
 *   decrements the counter; rejecting reverts it cleanly; every accept /
 *   reject / batch is undoable from the toolbar. Clicking marked-up text
 *   highlights and scrolls to its rail card and vice versa; Viewing mode
 *   hides all markup for a clean read (pending edits previewed as accepted)
 *   while preserving every decision
 * @position Page template; emitted by `astryx template doc-suggestion-review`
 *
 * Frame: Layout height="fill". LayoutHeader carries the review toolbar (doc
 * title + edited-by note + pending Badge, Undo, Suggesting/Viewing
 * SegmentedControl). LayoutContent (padding 0) is a muted backdrop centering
 * a 760px-max paper column; LayoutPanel end 360 hosts the scrolling margin
 * rail. Choose over deck-review-comments when the artifact is a TEXT
 * DOCUMENT with inline tracked changes, not slides with positional markers;
 * choose over diff-viewer when edits are prose suggestions negotiated
 * accept/reject one at a time, not code hunks compared side by side.
 *
 * Responsive contract:
 * - >880px: header | paper canvas (fill, backdrop scrolls vertically) |
 *   margin rail 360 (fixed, scrolls vertically). Only the backdrop and rail
 *   scroll internally.
 * - <=880px: the rail leaves the right edge and stacks below the paper as a
 *   full-width section; the column flows at natural height and LayoutContent
 *   scrolls it as one page.
 * - <=640px: the header drops the edited-by note and the Undo button loses
 *   its text label margin pressure by wrapping; interactive doc spans
 *   (suggestions + comment anchors) gain block padding and the paragraph
 *   line-height opens up so inline tap targets reach ~40px without
 *   overlapping lines; rail-card Accept/Reject Buttons grow to md (~40px).
 * - Header rows are wrap="wrap", so on narrow widths the mode
 *   SegmentedControl drops below the title instead of clipping.
 * - The paper column is width:100% with maxWidth 760 and the backdrop has
 *   deliberate horizontal padding, so nothing overflows at 375px; prose
 *   wraps naturally and no surface needs overflowX.
 *
 * Container policy (review-workbench archetype): the page chrome is
 * frame-first rows and panels; Cards are reserved for the rail's suggestion
 * and thread cards. The paper canvas is literal light 'paper' locked with
 * colorScheme:'light' so per-author ink hexes read identically in dark mode;
 * rail diff chips reuse the same paper treatment. All counts (header Badge,
 * author legend, rail summary) recompute live from suggestion + resolve
 * state — no clocks, randomness, or network assets. Reply submissions append
 * with the fixed literal timestamp 2026-07-02T16:30:00Z.
 *
 * Color policy: the paper canvas and rail diff chips are deliberately
 * scheme-locked light (colorScheme:'light') to read as printed paper in both
 * schemes, so PAPER_* literals, the anchor amber washes/resolved rule, and
 * the per-author soft washes stay raw hex — tokens would flip them in dark
 * mode and break the paper metaphor. Text sitting on that locked paper
 * (PAPER_TEXT/PAPER_MUTED) is likewise literal so it stays readable. Author
 * inks and the anchor-amber accent are light-dark() pairs: on the locked
 * paper they resolve to the exact light values (color-scheme inherits), and
 * on app chrome (legend dots, active-card rings) they brighten for dark
 * backgrounds.
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
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckCheckIcon,
  CheckIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  RotateCcwIcon,
  SendIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ============= PAPER PAINT CONSTANTS =============
// Scheme-locked surface (see "Color policy" above): the document canvas is
// "paper" — literal light colors locked with colorScheme:'light' so
// tracked-change inks look identical in dark mode. Do not tokenize.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';

// Comment-anchor amber — deliberately outside the author palette so comment
// ranges never read as tracked changes. Washes and the resolved rule paint
// only on the locked paper, so they stay literal; the underline/accent also
// rings rail cards on app chrome, so it is a light-dark() pair (the locked
// paper resolves it to the light value).
const ANCHOR_BG = '#FDF3D0';
const ANCHOR_BG_ACTIVE = '#F9E7A0';
const ANCHOR_UNDERLINE = 'light-dark(#D4A72C, #E0BB55)';
const ANCHOR_RESOLVED = '#B7BDC6';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Muted backdrop; the paper column centers and the backdrop scrolls.
  backdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
  },
  paperColumn: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
  },
  // The document surface: white paper, light-locked so author inks hold.
  paper: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: 'clamp(24px, 6vw, 56px)',
  },
  docTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
    margin: 0,
  },
  docByline: {
    fontSize: 14,
    color: PAPER_MUTED,
    marginTop: 6,
  },
  docRule: {
    border: 'none',
    borderTop: `1px solid ${PAPER_RULE}`,
    margin: '20px 0 24px',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 1.85,
    margin: '0 0 18px',
    overflowWrap: 'break-word',
  },
  // <=640px: looser leading so padded inline tap targets never overlap.
  paragraphTouch: {
    lineHeight: 2.15,
  },
  // Inline interactive spans render as real <button>s with type reset so
  // suggestions and anchors are keyboard-reachable, not hover-only.
  inlineButton: {
    display: 'inline',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'inherit',
    cursor: 'pointer',
    borderRadius: 4,
  },
  // <=640px: block padding grows the tap target toward ~40px.
  inlineButtonTouch: {
    paddingBlock: 6,
  },
  ins: {
    textDecoration: 'underline',
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
    fontStyle: 'normal',
  },
  del: {
    textDecoration: 'line-through',
    textDecorationThickness: 2,
    marginRight: 2,
  },
  anchorSpan: {
    backgroundColor: ANCHOR_BG,
    borderBottom: `2px dotted ${ANCHOR_UNDERLINE}`,
    borderRadius: 3,
    paddingInline: 1,
  },
  anchorResolved: {
    backgroundColor: 'transparent',
    borderBottom: `2px dotted ${ANCHOR_RESOLVED}`,
  },
  // Viewing-mode note bar above the paper.
  viewingNote: {
    marginBottom: 'var(--spacing-3)',
  },
  // Margin rail: fixed 360px, only the card list scrolls.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  railStacked: {
    padding: 'var(--spacing-3)',
  },
  authorDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Paper diff chip inside rail cards: same light-locked treatment as the
  // canvas so author inks stay legible on dark app chrome.
  diffChip: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    border: `1px solid ${PAPER_RULE}`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    fontSize: 14,
    lineHeight: 1.6,
    overflowWrap: 'anywhere',
  },
  replyIndent: {
    paddingLeft: 'var(--spacing-4)',
    borderLeft: '2px solid var(--color-border)',
  },
  threadBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
};

// ============= AUTHOR DATA =============
// Three suggesting authors, each with a fixed ink (underline/strike color)
// and a soft wash for pending spans. Alex Rivera owns the doc and reviews.
// Inks are light-dark() pairs: on the locked paper they resolve to the exact
// light hex; on app chrome (legend dots, card rings) they brighten for dark
// mode. Soft washes paint only on the locked paper, so they stay literal.

type AuthorId = 'maya' | 'jordan' | 'priya';

interface Author {
  id: AuthorId;
  name: string;
  ink: string;
  soft: string;
}

const AUTHORS: Author[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    ink: 'light-dark(#0B5FAE, #5FA4E8)',
    soft: '#E3EEF9',
  },
  {
    id: 'jordan',
    name: 'Jordan Ellis',
    ink: 'light-dark(#7C3AED, #A88BF5)',
    soft: '#F0E9FA',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    ink: 'light-dark(#B45309, #E09353)',
    soft: '#FBEFDD',
  },
];

const AUTHOR_BY_ID = Object.fromEntries(
  AUTHORS.map(author => [author.id, author]),
) as Record<AuthorId, Author>;

const DOC_TITLE = 'Atlas Launch Readiness Brief';
const EDITED_NOTE = 'Draft · edited Jun 30 by Alex Rivera';
const DOC_BYLINE = 'Drafted by Alex Rivera · Growth & Monetization';
const CURRENT_REVIEWER = 'Alex Rivera';
const REPLY_TIMESTAMP = '2026-07-02T16:30:00Z'; // fixed literal for new replies

// ============= SUGGESTION DATA =============
// 10 tracked changes. `original` is empty for pure inserts and `proposed`
// is empty for pure deletes, so accept/reject always rewrites the span to a
// clean string with fixture-designed spacing — no joins to compute.

type SuggestionKind = 'insert' | 'delete' | 'replace';
type SuggestionState = 'pending' | 'accepted' | 'rejected';

interface Suggestion {
  id: string;
  author: AuthorId;
  kind: SuggestionKind;
  original: string;
  proposed: string;
  note: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    author: 'maya',
    kind: 'replace',
    original: 'the last week of July',
    proposed: 'July 28',
    note: "Pin the date — 'the last week of July' has drifted twice already.",
  },
  {
    id: 'sug-2',
    author: 'jordan',
    kind: 'insert',
    original: '',
    proposed: 'plus a dry-run mode that reports row-level errors, ',
    note: 'Dry-run shipped last sprint — worth naming, admins keep asking for it.',
  },
  {
    id: 'sug-3',
    author: 'maya',
    kind: 'delete',
    original: 'still ',
    proposed: '',
    note: '"Still" editorializes — the timeout is a plain fact until July 14.',
  },
  {
    id: 'sug-4',
    author: 'priya',
    kind: 'replace',
    original: 'most of',
    proposed: 'eleven of the fourteen',
    note: 'The review board will ask for the exact count; write it down.',
  },
  {
    id: 'sug-5',
    author: 'priya',
    kind: 'insert',
    original: '',
    proposed:
      'with localization for the four launch languages queued behind final copy, ',
    note: 'Localization is on the critical path — the brief should say so.',
  },
  {
    id: 'sug-6',
    author: 'jordan',
    kind: 'replace',
    original: 'We will announce on social the same day.',
    proposed:
      'Social announcements follow one day after launch to keep the first-day channel load on email.',
    note: 'Matches the channel review — same-day social buried the Nova email.',
  },
  {
    id: 'sug-7',
    author: 'jordan',
    kind: 'delete',
    original: 'assuming nothing breaks, ',
    proposed: '',
    note: 'The rollback-trigger sentence already covers this; hedging twice reads nervous.',
  },
  {
    id: 'sug-8',
    author: 'maya',
    kind: 'replace',
    original: 'mid-August',
    proposed: 'August 11',
    note: 'Same drift problem — give the final stage a date, not a vibe.',
  },
  {
    id: 'sug-9',
    author: 'maya',
    kind: 'insert',
    original: '',
    proposed: 'approve the revised rollout dates, ',
    note: 'The review has to bless the new stage dates explicitly, not inherit them.',
  },
  {
    id: 'sug-10',
    author: 'priya',
    kind: 'replace',
    original: 'Anything unresolved after the review moves to the launch channel.',
    proposed:
      'Anything unresolved after the review is assigned an owner and a date in the launch channel before the meeting ends.',
    note: 'Unowned items rot in the channel — force an owner and a date in the room.',
  },
];

const SUGGESTION_BY_ID = Object.fromEntries(
  SUGGESTIONS.map(suggestion => [suggestion.id, suggestion]),
) as Record<string, Suggestion>;

const KIND_LABEL: Record<SuggestionKind, string> = {
  insert: 'Insert',
  delete: 'Delete',
  replace: 'Replace',
};

// ============= DOCUMENT DATA =============
// Six paragraphs as segment runs. Suggestion and anchor segments sit between
// plain text runs whose spacing is designed so any accept/reject outcome
// reads cleanly.

type Segment =
  | {kind: 'text'; text: string}
  | {kind: 'anchor'; threadId: string; text: string}
  | {kind: 'suggestion'; suggestionId: string};

interface Paragraph {
  id: string;
  segments: Segment[];
}

const PARAGRAPHS: Paragraph[] = [
  {
    id: 'para-1',
    segments: [
      {kind: 'text', text: 'The Atlas workspace launch is scheduled for '},
      {kind: 'suggestion', suggestionId: 'sug-1'},
      {
        kind: 'text',
        text: '. This brief collects the open readiness work across product, support, and marketing so the launch review on ',
      },
      {kind: 'anchor', threadId: 'thread-1', text: 'July 10'},
      {
        kind: 'text',
        text: ' can be a go/no-go decision rather than a status update.',
      },
    ],
  },
  {
    id: 'para-2',
    segments: [
      {
        kind: 'text',
        text: 'Product is feature-complete except for workspace import. The import pipeline handles CSV and JSON today, ',
      },
      {kind: 'suggestion', suggestionId: 'sug-2'},
      {
        kind: 'text',
        text: 'and the remaining work is throughput: imports over 50k rows ',
      },
      {kind: 'suggestion', suggestionId: 'sug-3'},
      {
        kind: 'text',
        text: 'run past the five-minute timeout. Engineering expects the chunked importer to land by July 14.',
      },
    ],
  },
  {
    id: 'para-3',
    segments: [
      {
        kind: 'text',
        text: 'Support readiness is the largest open risk. The help center refresh covers ',
      },
      {kind: 'suggestion', suggestionId: 'sug-4'},
      {
        kind: 'text',
        text: ' launch surfaces, and the escalation runbook has not been rehearsed with the weekend rotation. ',
      },
      {kind: 'anchor', threadId: 'thread-2', text: 'Staffing for launch week'},
      {
        kind: 'text',
        text: ' assumes two additional agents per shift, which has not been confirmed with the support lead.',
      },
    ],
  },
  {
    id: 'para-4',
    segments: [
      {
        kind: 'text',
        text: 'Marketing assets are on track. The announcement post, the customer email, and the in-app tour are drafted and in review, ',
      },
      {kind: 'suggestion', suggestionId: 'sug-5'},
      {
        kind: 'text',
        text: 'and the pricing page update ships behind the same flag as the product change. ',
      },
      {kind: 'suggestion', suggestionId: 'sug-6'},
      {kind: 'text', text: ' '},
      {kind: 'anchor', threadId: 'thread-3', text: 'The press briefing'},
      {kind: 'text', text: ' is booked for July 24.'},
    ],
  },
  {
    id: 'para-5',
    segments: [
      {
        kind: 'text',
        text: 'Rollout is staged. Five percent of workspaces get Atlas on launch day, ',
      },
      {kind: 'suggestion', suggestionId: 'sug-7'},
      {
        kind: 'text',
        text: 'expanding to fifty percent within one week and full availability by ',
      },
      {kind: 'suggestion', suggestionId: 'sug-8'},
      {
        kind: 'text',
        text: '. Each stage has an owner, a dashboard, and an explicit rollback trigger documented in the runbook.',
      },
    ],
  },
  {
    id: 'para-6',
    segments: [
      {
        kind: 'text',
        text: 'Open decisions for the July 10 review: confirm support staffing, ',
      },
      {kind: 'suggestion', suggestionId: 'sug-9'},
      {kind: 'text', text: 'and sign off on the pricing page copy. '},
      {kind: 'suggestion', suggestionId: 'sug-10'},
      {kind: 'text', text: ' '},
      {kind: 'anchor', threadId: 'thread-4', text: 'Decision log'},
      {kind: 'text', text: ' lives at the top of the launch channel.'},
    ],
  },
];

// ============= THREAD DATA =============
// 4 threads with fixed ISO timestamps between 2026-06-28T17:30:00Z and
// 2026-06-30T10:41:00Z; thread-3 starts resolved.

interface Comment {
  id: string;
  author: string;
  ts: string; // fixed ISO timestamp
  body: string;
}

interface Thread {
  id: string;
  anchorText: string;
  root: Comment;
  replies: Comment[];
}

const THREADS: Thread[] = [
  {
    id: 'thread-1',
    anchorText: 'July 10',
    root: {
      id: 'thread-1-root',
      author: 'Priya Nair',
      ts: '2026-06-29T09:14:00Z',
      body: '@Alex is July 10 still realistic for a go/no-go? Import throughput lands July 14 — we would be deciding four days before the biggest risk clears.',
    },
    replies: [
      {
        id: 'thread-1-reply-1',
        author: 'Alex Rivera',
        ts: '2026-06-29T11:02:00Z',
        body: 'Keeping July 10 — the chunked importer has a staging build we can demo live at the review.',
      },
    ],
  },
  {
    id: 'thread-2',
    anchorText: 'Staffing for launch week',
    root: {
      id: 'thread-2-root',
      author: 'Maya Chen',
      ts: '2026-06-29T15:47:00Z',
      body: 'Two extra agents per shift is the peak-season number, not a launch number. @Jordan can you confirm with the support lead before the review?',
    },
    replies: [],
  },
  {
    id: 'thread-3',
    anchorText: 'The press briefing',
    root: {
      id: 'thread-3-root',
      author: 'Jordan Ellis',
      ts: '2026-06-28T17:30:00Z',
      body: 'Briefing was double-booked against the sales offsite — moved to July 24 and the calendar hold is updated.',
    },
    replies: [],
  },
  {
    id: 'thread-4',
    anchorText: 'Decision log',
    root: {
      id: 'thread-4-root',
      author: 'Maya Chen',
      ts: '2026-06-30T10:05:00Z',
      body: 'Can we pin the decision log template here so nobody recreates it per meeting? @Priya you had the latest version.',
    },
    replies: [
      {
        id: 'thread-4-reply-1',
        author: 'Priya Nair',
        ts: '2026-06-30T10:41:00Z',
        body: 'Pinned to the channel — same template we used for the Nova launch.',
      },
    ],
  },
];

const THREAD_BY_ID = Object.fromEntries(
  THREADS.map(thread => [thread.id, thread]),
) as Record<string, Thread>;

const INITIALLY_RESOLVED = ['thread-3'];
const INITIAL_ACTIVE_ID = 'sug-1';

type ReviewMode = 'suggesting' | 'viewing';

// ============= DERIVATION HELPERS =============
// Small helpers over fixture arrays — no parsers, no geometry.

/** Suggestion + thread ids in document order; the rail sorts by this. */
const DOC_ORDER: string[] = PARAGRAPHS.flatMap(paragraph =>
  paragraph.segments.flatMap(segment =>
    segment.kind === 'suggestion'
      ? [segment.suggestionId]
      : segment.kind === 'anchor'
        ? [segment.threadId]
        : [],
  ),
);

/** The text a suggestion span settles to once a decision (or preview) lands. */
function settledText(suggestion: Suggestion, state: SuggestionState): string {
  return state === 'rejected' ? suggestion.original : suggestion.proposed;
}

function pendingIdsForAuthor(
  states: Record<string, SuggestionState>,
  author: AuthorId,
): string[] {
  return SUGGESTIONS.filter(
    suggestion =>
      suggestion.author === author && states[suggestion.id] === 'pending',
  ).map(suggestion => suggestion.id);
}

/** Short quote for aria labels and tooltips. */
function clip(text: string, max = 36): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function suggestionAriaLabel(
  suggestion: Suggestion,
  author: Author,
): string {
  if (suggestion.kind === 'insert') {
    return `Suggestion by ${author.name}: insert "${clip(suggestion.proposed)}"`;
  }
  if (suggestion.kind === 'delete') {
    return `Suggestion by ${author.name}: delete "${clip(suggestion.original)}"`;
  }
  return `Suggestion by ${author.name}: replace "${clip(
    suggestion.original,
  )}" with "${clip(suggestion.proposed)}"`;
}

// ============= @MENTION RENDERING =============

/**
 * Splits a comment body on @mentions and renders each mention as an accent
 * Token so names read as entities, not prose.
 */
function renderBody(body: string): ReactNode[] {
  return body.split(/(@[A-Za-z]+)/g).map((part, index) =>
    part.startsWith('@') ? (
      <Token
        key={`mention-${index}`}
        label={part}
        size="sm"
        color="blue"
        description={`Mention of ${part.slice(1)}`}
      />
    ) : (
      <span key={`text-${index}`}>{part}</span>
    ),
  );
}

// ============= INLINE DOC SPANS =============

/**
 * One suggestion span in the paper. Pending spans in suggesting mode render
 * tracked-change markup (<del> strike + <ins> underline in the author's
 * ink) inside a real button; decided or viewing-mode spans settle to plain
 * text — accepted/previewed shows the proposal, rejected reverts cleanly.
 */
function SuggestionSpan({
  suggestion,
  state,
  mode,
  isActive,
  hasTouchTarget,
  onActivate,
  registerRef,
}: {
  suggestion: Suggestion;
  state: SuggestionState;
  mode: ReviewMode;
  isActive: boolean;
  hasTouchTarget: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  const author = AUTHOR_BY_ID[suggestion.author];

  // Viewing mode and decided suggestions paint as ordinary prose.
  if (mode === 'viewing' || state !== 'pending') {
    const text =
      mode === 'viewing' && state === 'pending'
        ? suggestion.proposed // clean-read preview of the pending edit
        : settledText(suggestion, state);
    if (text === '') {
      return null;
    }
    return <span>{text}</span>;
  }

  return (
    <button
      type="button"
      ref={node => registerRef(suggestion.id, node)}
      aria-label={suggestionAriaLabel(suggestion, author)}
      onClick={() => onActivate(suggestion.id)}
      style={{
        ...styles.inlineButton,
        ...(hasTouchTarget ? styles.inlineButtonTouch : null),
        backgroundColor: author.soft,
        outline: isActive ? `2px solid ${author.ink}` : 'none',
        outlineOffset: 1,
      }}>
      {suggestion.original !== '' && (
        <del
          style={{
            ...styles.del,
            color: author.ink,
            textDecorationColor: author.ink,
          }}>
          {suggestion.original}
        </del>
      )}
      {suggestion.proposed !== '' && (
        <ins
          style={{
            ...styles.ins,
            color: author.ink,
            textDecorationColor: author.ink,
          }}>
          {suggestion.proposed}
        </ins>
      )}
    </button>
  );
}

/**
 * One comment-anchored text range. Open threads wear the amber wash and a
 * dotted underline; resolved threads keep only a faint dotted underline so
 * the range stays discoverable. Viewing mode paints plain prose.
 */
function AnchorSpan({
  threadId,
  text,
  mode,
  isResolved,
  isActive,
  hasTouchTarget,
  onActivate,
  registerRef,
}: {
  threadId: string;
  text: string;
  mode: ReviewMode;
  isResolved: boolean;
  isActive: boolean;
  hasTouchTarget: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  if (mode === 'viewing') {
    return <span>{text}</span>;
  }
  const thread = THREAD_BY_ID[threadId];
  return (
    <button
      type="button"
      ref={node => registerRef(threadId, node)}
      aria-label={`Comment by ${thread.root.author}${
        isResolved ? ' (resolved)' : ''
      } on "${text}"`}
      onClick={() => onActivate(threadId)}
      style={{
        ...styles.inlineButton,
        ...(hasTouchTarget ? styles.inlineButtonTouch : null),
        ...styles.anchorSpan,
        ...(isResolved ? styles.anchorResolved : null),
        ...(isActive && !isResolved
          ? {backgroundColor: ANCHOR_BG_ACTIVE}
          : null),
        outline: isActive ? `2px solid ${ANCHOR_UNDERLINE}` : 'none',
        outlineOffset: 1,
      }}>
      {text}
    </button>
  );
}

/** One paragraph: a run of text, suggestion, and anchor segments. */
function ParagraphView({
  paragraph,
  mode,
  suggestionStates,
  resolvedIds,
  activeId,
  hasTouchTargets,
  onActivate,
  registerRef,
}: {
  paragraph: Paragraph;
  mode: ReviewMode;
  suggestionStates: Record<string, SuggestionState>;
  resolvedIds: Set<string>;
  activeId: string | null;
  hasTouchTargets: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  return (
    <p
      style={{
        ...styles.paragraph,
        ...(hasTouchTargets ? styles.paragraphTouch : null),
      }}>
      {paragraph.segments.map((segment, index) => {
        const key = `${paragraph.id}-seg-${index}`;
        if (segment.kind === 'text') {
          return <span key={key}>{segment.text}</span>;
        }
        if (segment.kind === 'anchor') {
          return (
            <AnchorSpan
              key={key}
              threadId={segment.threadId}
              text={segment.text}
              mode={mode}
              isResolved={resolvedIds.has(segment.threadId)}
              isActive={activeId === segment.threadId}
              hasTouchTarget={hasTouchTargets}
              onActivate={onActivate}
              registerRef={registerRef}
            />
          );
        }
        return (
          <SuggestionSpan
            key={key}
            suggestion={SUGGESTION_BY_ID[segment.suggestionId]}
            state={suggestionStates[segment.suggestionId]}
            mode={mode}
            isActive={activeId === segment.suggestionId}
            hasTouchTarget={hasTouchTargets}
            onActivate={onActivate}
            registerRef={registerRef}
          />
        );
      })}
    </p>
  );
}

// ============= RAIL: SUGGESTION CARD =============

function SuggestionCard({
  suggestion,
  isActive,
  buttonSize,
  onActivate,
  onAccept,
  onReject,
  cardRef,
}: {
  suggestion: Suggestion;
  isActive: boolean;
  buttonSize: 'sm' | 'md';
  onActivate: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  cardRef: (node: HTMLDivElement | null) => void;
}) {
  const author = AUTHOR_BY_ID[suggestion.author];
  return (
    <div ref={cardRef}>
      <Card
        padding={3}
        style={{
          cursor: 'pointer',
          boxShadow: isActive ? `0 0 0 2px ${author.ink}` : undefined,
        }}
        onClick={() => onActivate(suggestion.id)}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <span
              aria-hidden
              style={{...styles.authorDot, backgroundColor: author.ink}}
            />
            <Avatar name={author.name} size="xsmall" />
            <StackItem size="fill">
              <Text type="body" weight="bold" maxLines={1}>
                {author.name}
              </Text>
            </StackItem>
            <Badge label={KIND_LABEL[suggestion.kind]} variant="neutral" />
          </HStack>

          {/* Paper diff chip: strike the original, underline the proposal,
              both in the author's ink on light-locked paper. */}
          <div style={styles.diffChip}>
            {suggestion.original !== '' && (
              <del
                style={{
                  ...styles.del,
                  color: author.ink,
                  textDecorationColor: author.ink,
                }}>
                {suggestion.original}
              </del>
            )}
            {suggestion.original !== '' && suggestion.proposed !== '' && ' '}
            {suggestion.proposed !== '' && (
              <ins
                style={{
                  ...styles.ins,
                  color: author.ink,
                  textDecorationColor: author.ink,
                }}>
                {suggestion.proposed}
              </ins>
            )}
          </div>

          <Text type="supporting" color="secondary" style={styles.threadBody}>
            {suggestion.note}
          </Text>

          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Button
                label="Accept"
                variant="primary"
                size={buttonSize}
                icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                onClick={() => onAccept(suggestion.id)}
              />
            </StackItem>
            <Button
              label="Reject"
              variant="secondary"
              size={buttonSize}
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              onClick={() => onReject(suggestion.id)}
            />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

// ============= RAIL: THREAD CARD =============

function ThreadCard({
  thread,
  replies,
  isResolved,
  isActive,
  draft,
  buttonSize,
  onActivate,
  onToggleResolved,
  onDraftChange,
  onSend,
  cardRef,
}: {
  thread: Thread;
  replies: Comment[];
  isResolved: boolean;
  isActive: boolean;
  draft: string;
  buttonSize: 'sm' | 'md';
  onActivate: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onDraftChange: (id: string, value: string) => void;
  onSend: (id: string) => void;
  cardRef: (node: HTMLDivElement | null) => void;
}) {
  // Resolved threads collapse to one summary line with a Reopen Button.
  if (isResolved) {
    return (
      <div ref={cardRef}>
        <Card
          padding={3}
          style={{
            cursor: 'pointer',
            boxShadow: isActive
              ? `0 0 0 2px ${ANCHOR_UNDERLINE}`
              : undefined,
          }}
          onClick={() => onActivate(thread.id)}>
          <HStack gap={2} vAlign="center">
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" color="secondary" maxLines={1}>
                {thread.root.author} on “{thread.anchorText}” —{' '}
                {thread.root.body}
              </Text>
            </StackItem>
            <Button
              label="Reopen"
              variant="ghost"
              size={buttonSize}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => onToggleResolved(thread.id)}
            />
          </HStack>
        </Card>
      </div>
    );
  }

  const canSend = draft.trim().length > 0;

  return (
    <div ref={cardRef}>
      <Card
        padding={3}
        style={{
          cursor: 'pointer',
          boxShadow: isActive ? `0 0 0 2px ${ANCHOR_UNDERLINE}` : undefined,
        }}
        onClick={() => onActivate(thread.id)}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={thread.root.author} size="xsmall" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="body" weight="bold">
                  {thread.root.author}
                </Text>
                <Timestamp value={thread.root.ts} format="date_time" />
              </HStack>
            </StackItem>
            <Icon icon={MessageSquareTextIcon} size="sm" color="secondary" />
          </HStack>

          <Text type="supporting" color="secondary" maxLines={1}>
            On “{thread.anchorText}”
          </Text>

          <Text type="body" style={styles.threadBody}>
            {renderBody(thread.root.body)}
          </Text>

          {replies.length > 0 && (
            <VStack gap={2} style={styles.replyIndent}>
              {replies.map(reply => (
                <VStack key={reply.id} gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Avatar name={reply.author} size="xsmall" />
                    <Text type="supporting" weight="bold">
                      {reply.author}
                    </Text>
                    <Timestamp value={reply.ts} format="date_time" />
                  </HStack>
                  <Text type="supporting" style={styles.threadBody}>
                    {renderBody(reply.body)}
                  </Text>
                </VStack>
              ))}
            </VStack>
          )}

          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </Text>
            </StackItem>
            <Button
              label="Resolve"
              variant="ghost"
              size={buttonSize}
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={() => onToggleResolved(thread.id)}
            />
          </HStack>

          {/* Reply composer only on the active thread. */}
          {isActive && (
            <>
              <Divider />
              <VStack gap={2}>
                <TextArea
                  label={`Reply to ${thread.root.author}`}
                  isLabelHidden
                  placeholder="Reply — use @ to mention"
                  rows={2}
                  value={draft}
                  onChange={value => onDraftChange(thread.id, value)}
                />
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      Replying as {CURRENT_REVIEWER}
                    </Text>
                  </StackItem>
                  <Button
                    label="Send"
                    variant="primary"
                    size={buttonSize}
                    icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                    isDisabled={!canSend}
                    onClick={() => onSend(thread.id)}
                  />
                </HStack>
              </VStack>
            </>
          )}
        </VStack>
      </Card>
    </div>
  );
}

// ============= PAGE =============

export default function DocSuggestionReviewTemplate() {
  const [mode, setMode] = useState<ReviewMode>('suggesting');
  const [suggestionStates, setSuggestionStates] = useState<
    Record<string, SuggestionState>
  >(() =>
    Object.fromEntries(SUGGESTIONS.map(suggestion => [suggestion.id, 'pending'])),
  );
  const [activeId, setActiveId] = useState<string | null>(INITIAL_ACTIVE_ID);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(INITIALLY_RESOLVED),
  );
  const [showResolved, setShowResolved] = useState(false);
  // Per-thread reply drafts and appended replies, keyed by thread id.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [repliesById, setRepliesById] = useState<Record<string, Comment[]>>(
    () => Object.fromEntries(THREADS.map(thread => [thread.id, thread.replies])),
  );
  // One-level undo for accept/reject/batch: the label plus the exact prior
  // state of every suggestion the action touched.
  const [lastAction, setLastAction] = useState<{
    label: string;
    previous: Record<string, SuggestionState>;
  } | null>(null);

  const docSpanRefs = useRef<Record<string, HTMLElement | null>>({});
  const railCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Responsive contract: <=880px the rail stacks below the paper; <=640px
  // header chrome condenses and inline/tap targets grow.
  const isRailStacked = useMediaQuery('(max-width: 880px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const railButtonSize: 'sm' | 'md' = isPhone ? 'md' : 'sm';

  // ---- derived state ----
  const pendingCount = SUGGESTIONS.filter(
    suggestion => suggestionStates[suggestion.id] === 'pending',
  ).length;
  const acceptedCount = SUGGESTIONS.filter(
    suggestion => suggestionStates[suggestion.id] === 'accepted',
  ).length;
  const openThreadCount = THREADS.filter(
    thread => !resolvedIds.has(thread.id),
  ).length;
  const resolvedThreadCount = THREADS.length - openThreadCount;

  /** Rail items in document order, filtered by decision + resolve state. */
  const railIds = DOC_ORDER.filter(id => {
    if (id.startsWith('sug-')) {
      return suggestionStates[id] === 'pending';
    }
    return showResolved || !resolvedIds.has(id);
  });

  // ---- interactions ----
  const registerDocSpan = (id: string, node: HTMLElement | null) => {
    docSpanRefs.current[id] = node;
  };

  /** Doc span click: highlight the rail card and scroll it into view. */
  const activateFromDoc = (id: string) => {
    setActiveId(id);
    // A resolved thread hidden behind the filter should surface when its
    // anchor is clicked, so the rail card exists to scroll to.
    if (!id.startsWith('sug-') && resolvedIds.has(id)) {
      setShowResolved(true);
    }
    // Defer so a just-revealed card has mounted before scrolling.
    requestAnimationFrame(() => {
      railCardRefs.current[id]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    });
  };

  /** Rail card click: highlight the doc range and scroll the paper to it. */
  const activateFromRail = (id: string) => {
    setActiveId(id);
    docSpanRefs.current[id]?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  };

  const decideSuggestion = (id: string, decision: SuggestionState) => {
    const author = AUTHOR_BY_ID[SUGGESTION_BY_ID[id].author];
    setLastAction({
      label: `${decision === 'accepted' ? 'Accepted' : 'Rejected'} ${
        author.name
      }'s ${KIND_LABEL[SUGGESTION_BY_ID[id].kind].toLowerCase()}`,
      previous: {[id]: suggestionStates[id]},
    });
    setSuggestionStates(prev => ({...prev, [id]: decision}));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  /** Batch: every pending suggestion in one author's color, undoable. */
  const acceptAllFromAuthor = (authorId: AuthorId) => {
    const ids = pendingIdsForAuthor(suggestionStates, authorId);
    if (ids.length === 0) {
      return;
    }
    setLastAction({
      label: `Accepted ${ids.length} from ${AUTHOR_BY_ID[authorId].name}`,
      previous: Object.fromEntries(ids.map(id => [id, suggestionStates[id]])),
    });
    setSuggestionStates(prev => {
      const next = {...prev};
      for (const id of ids) {
        next[id] = 'accepted';
      }
      return next;
    });
    if (activeId !== null && ids.includes(activeId)) {
      setActiveId(null);
    }
  };

  /** Restore the exact prior states of the last accept/reject/batch. */
  const undoLastAction = () => {
    if (lastAction === null) {
      return;
    }
    setSuggestionStates(prev => ({...prev, ...lastAction.previous}));
    setLastAction(null);
  };

  const toggleResolved = (id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setActiveId(id);
  };

  const setDraft = (id: string, value: string) => {
    setDrafts(prev => ({...prev, [id]: value}));
  };

  /** Send appends a reply with the fixed literal timestamp, clears the draft. */
  const sendReply = (id: string) => {
    const body = (drafts[id] ?? '').trim();
    if (body.length === 0) {
      return;
    }
    setRepliesById(prev => ({
      ...prev,
      [id]: [
        ...prev[id],
        {
          id: `${id}-reply-${prev[id].length + 1}`,
          author: CURRENT_REVIEWER,
          ts: REPLY_TIMESTAMP,
          body,
        },
      ],
    }));
    setDrafts(prev => ({...prev, [id]: ''}));
  };

  // ---- paper canvas ----
  const paper = (
    <div style={styles.backdrop}>
      <div style={styles.paperColumn}>
        {mode === 'viewing' && (
          <div style={styles.viewingNote}>
            <Text type="supporting" color="secondary">
              Clean read — pending suggestions previewed as accepted. Switch
              back to Suggesting to keep reviewing; nothing is lost.
            </Text>
          </div>
        )}
        <div style={styles.paper}>
          <h2 style={styles.docTitle}>{DOC_TITLE}</h2>
          <div style={styles.docByline}>{DOC_BYLINE}</div>
          <hr style={styles.docRule} />
          {PARAGRAPHS.map(paragraph => (
            <ParagraphView
              key={paragraph.id}
              paragraph={paragraph}
              mode={mode}
              suggestionStates={suggestionStates}
              resolvedIds={resolvedIds}
              activeId={activeId}
              hasTouchTargets={isPhone}
              onActivate={activateFromDoc}
              registerRef={registerDocSpan}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ---- margin rail ----
  const railHeader = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Review</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {pendingCount} pending · {acceptedCount} accepted ·{' '}
          {openThreadCount} open
        </Text>
      </HStack>

      {/* Author legend: ink dot, live pending count, per-author batch. */}
      <VStack gap={2}>
        {AUTHORS.map(author => {
          const authorPending = pendingIdsForAuthor(
            suggestionStates,
            author.id,
          ).length;
          return (
            <HStack key={author.id} gap={2} vAlign="center">
              <span
                aria-hidden
                style={{...styles.authorDot, backgroundColor: author.ink}}
              />
              <StackItem size="fill">
                <Text type="supporting" maxLines={1}>
                  {author.name}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {authorPending}
              </Text>
              <Button
                label="Accept all"
                variant="ghost"
                size={railButtonSize}
                icon={<Icon icon={CheckCheckIcon} size="sm" color="inherit" />}
                isDisabled={authorPending === 0}
                onClick={() => acceptAllFromAuthor(author.id)}
              />
            </HStack>
          );
        })}
      </VStack>

      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {resolvedThreadCount} resolved{' '}
            {resolvedThreadCount === 1 ? 'thread' : 'threads'}
          </Text>
        </StackItem>
        <Switch
          label="Show resolved"
          value={showResolved}
          onChange={setShowResolved}
        />
      </HStack>
      <Divider />
    </VStack>
  );

  const railList = (
    <VStack gap={3}>
      {railHeader}
      {railIds.length === 0 ? (
        <EmptyState
          icon={<Icon icon={CheckCheckIcon} size="lg" />}
          title="Nothing left to review"
          description="Every suggestion is decided and every open thread is resolved. Flip on Show resolved to revisit closed threads."
          isCompact
        />
      ) : (
        railIds.map(id =>
          id.startsWith('sug-') ? (
            <SuggestionCard
              key={id}
              suggestion={SUGGESTION_BY_ID[id]}
              isActive={activeId === id}
              buttonSize={railButtonSize}
              onActivate={activateFromRail}
              onAccept={sugId => decideSuggestion(sugId, 'accepted')}
              onReject={sugId => decideSuggestion(sugId, 'rejected')}
              cardRef={node => {
                railCardRefs.current[id] = node;
              }}
            />
          ) : (
            <ThreadCard
              key={id}
              thread={THREAD_BY_ID[id]}
              replies={repliesById[id]}
              isResolved={resolvedIds.has(id)}
              isActive={activeId === id}
              draft={drafts[id] ?? ''}
              buttonSize={railButtonSize}
              onActivate={activateFromRail}
              onToggleResolved={toggleResolved}
              onDraftChange={setDraft}
              onSend={sendReply}
              cardRef={node => {
                railCardRefs.current[id] = node;
              }}
            />
          ),
        )
      )}
    </VStack>
  );

  // The rail only exists in suggesting mode; Viewing is the clean read.
  const isRailVisible = mode === 'suggesting';

  // ---- header ----
  const modeControl = (
    <SegmentedControl
      label="Review mode"
      value={mode}
      onChange={value => setMode(value as ReviewMode)}
      size="sm">
      <SegmentedControlItem value="suggesting" label="Suggesting" />
      <SegmentedControlItem value="viewing" label="Viewing" />
    </SegmentedControl>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={FileTextIcon} size="md" color="secondary" />
                <Heading level={1}>{DOC_TITLE}</Heading>
                {!isPhone && (
                  <Text type="supporting" color="secondary">
                    {EDITED_NOTE}
                  </Text>
                )}
                <Badge
                  label={
                    pendingCount > 0
                      ? `${pendingCount} pending`
                      : 'All suggestions decided'
                  }
                  variant={pendingCount > 0 ? 'warning' : 'success'}
                />
              </HStack>
            </StackItem>
            <Tooltip
              content={
                lastAction === null
                  ? 'Nothing to undo'
                  : `Undo: ${lastAction.label}`
              }>
              <Button
                label="Undo"
                variant="secondary"
                size="sm"
                icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                isDisabled={lastAction === null}
                onClick={undoLastAction}
              />
            </Tooltip>
            {modeControl}
          </HStack>
        </LayoutHeader>
      }
      end={
        isRailVisible && !isRailStacked ? (
          <LayoutPanel width={360} padding={0} label="Suggestions and comments">
            <div style={styles.railScroll}>{railList}</div>
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          {/* When the rail stacks below the paper the column flows at
              natural height and LayoutContent scrolls the whole page; the
              height-locked fill frame would otherwise crush the paper to
              make room for the card list. */}
          <VStack
            gap={0}
            style={isRailVisible && isRailStacked ? undefined : styles.fill}>
            <StackItem
              size="fill"
              style={
                isRailVisible && isRailStacked ? undefined : styles.fill
              }>
              {paper}
            </StackItem>
            {isRailVisible && isRailStacked && (
              <>
                <Divider />
                <div style={styles.railStacked}>{railList}</div>
              </>
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
