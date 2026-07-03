var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Kestrel Labs document — 'Atlas Q3
 *   Launch Plan', rendered as a STATIC styled preview of 7 sections /
 *   9 paragraphs authored as text/anchor/suggestion segment runs; 6 margin
 *   comment threads from the Atlas Q3 review circle — Priya Raman, Marcus
 *   Webb, Sofia Ortiz, Jonah Fields — with fixed ISO timestamps between
 *   2026-07-01T09:12:00Z and 2026-07-02T16:05:00Z, @mentions, emoji
 *   reactions, and two threads starting resolved; 5 edit suggestions
 *   (insert/delete/replace) queued for triage). No clocks, no Math.random,
 *   no network assets.
 * @output Document comments & review surface: a toolbar header (doc icon +
 *   'Atlas Q3 Launch Plan' Heading + 'Preview' Badge + program note + a
 *   review-progress summary chip pairing 'n of 11 reviewed' with a compact
 *   ProgressBar + reviewer AvatarGroup), a centered light-locked paper
 *   canvas rendering the static doc preview (title, section headings, body
 *   paragraphs) with amber comment-anchored highlight spans and green-ins /
 *   red-del suggestion spans, and a right 380px comment rail driven by
 *   Open/Resolved/Suggestions filter pills: threaded comment Cards (Avatar
 *   + Timestamp, @mentions as Tokens, emoji-reaction chips that toggle for
 *   the current reviewer plus an add-reaction Popover, indented replies, a
 *   reply TextArea + Send on the active thread, Resolve/Reopen) and a
 *   suggestions queue (paper diff chips, per-card Accept/Reject Buttons,
 *   an 'Accept all' toolbar, decided rows settling to compact receipts).
 *   Clicking a highlighted doc span flips the rail to the right filter and
 *   scrolls its card into view, and vice versa; every count (pills, chip,
 *   queue toolbar) recomputes live and agrees across panels.
 * @position Page template; emitted by \`astryx template doc-comments-review\`.
 *   The document body is a STATIC PREVIEW by design — the live word
 *   processor lives in the separate astryx-editor repo. Do not "upgrade"
 *   the paper canvas into a contenteditable editor; all interactivity
 *   belongs to the surrounding review surface (rail, pills, chip, header).
 *
 * Frame: root div 100dvh wrapping Layout height="fill". LayoutHeader
 * carries the review toolbar (title + Preview Badge + program note +
 * progress chip + reviewer AvatarGroup). LayoutContent (padding 0) is a
 * muted backdrop centering a 760px-max paper column; LayoutPanel end 380
 * hosts the scrolling comment rail (pinned pills header + scrolling card
 * list).
 *
 * Choose over doc-suggestion-review when the surface centers the COMMENT
 * WORKFLOW — threaded margin comments with reactions and @mentions, filter
 * pills, and a review-progress chip — with suggestions as a compact triage
 * queue, rather than per-author inline tracked-change negotiation with
 * undo history and a Suggesting/Viewing mode switch; choose over
 * deck-review-comments when the artifact is a text document, not slides.
 *
 * Responsive contract:
 * - >920px: header | paper canvas (fill, backdrop scrolls) | comment rail
 *   380 fixed (pills pinned, card list scrolls). Only backdrop + rail list
 *   scroll internally.
 * - <=920px: the rail leaves the right edge and stacks below the paper as
 *   a full-width section; the column flows at natural height and
 *   LayoutContent scrolls the whole page.
 * - <=640px: the header drops the program note and reviewer stack; filter
 *   pills wrap onto their own line; inline doc spans gain block padding
 *   and looser paragraph leading so tap targets reach ~40px; rail Buttons
 *   grow to md. Header rows are wrap="wrap" so nothing clips at 375px.
 *
 * Container policy (review-rail archetype): page chrome is frame-first
 * rows and panels; Cards are reserved for rail thread/suggestion cards.
 * The progress chip and filter pills are styled rows, not Cards.
 *
 * Color policy: the paper canvas and the rail's diff chips are
 * deliberately scheme-locked light (colorScheme:'light') so the document
 * reads as printed paper in both schemes — PAPER_* literals and the
 * anchor/suggestion washes stay raw hex on that locked surface (tokens
 * would flip in dark mode and break the paper metaphor). The anchor amber
 * and the insert-green / delete-red inks are light-dark() pairs: on locked
 * paper they resolve to their light halves, and on app chrome (rail card
 * rings, pill dots, decided receipts) they brighten for dark backgrounds.
 * Everything else on the page is token-pure.
 */

import {useRef, useState, type CSSProperties, type ReactNode} from 'react';

import {
  CheckCheckIcon,
  CheckIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  PencilLineIcon,
  RotateCcwIcon,
  SendIcon,
  SmilePlusIcon,
  XIcon,
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
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PAPER PAINT CONSTANTS =============
// Scheme-locked surface (see "Color policy" above): the document canvas is
// "paper" — literal light colors locked with colorScheme:'light' so the
// review inks look identical in dark mode. Do not tokenize.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';

// Comment-anchor amber — the classic docs comment highlight, deliberately
// outside the suggestion green/red so anchored ranges never read as edits.
// Washes paint only on the locked paper, so they stay literal; the
// underline/accent also rings rail cards on app chrome, so it is a
// light-dark() pair (the locked paper resolves it to the light value).
const ANCHOR_BG = '#FDF3D0';
const ANCHOR_BG_ACTIVE = '#F9E7A0';
const ANCHOR_ACCENT = 'light-dark(#D4A72C, #E0BB55)';
const ANCHOR_RESOLVED = '#B7BDC6';

// Suggestion inks: insertions green, deletions red. Pairs brighten on app
// chrome (rail rings, receipts); washes are paper-only literals.
const INSERT_INK = 'light-dark(#0B7A2B, #4ADE80)';
const INSERT_BG = '#E4F5E8';
const DELETE_INK = 'light-dark(#C0212F, #F87171)';
const DELETE_BG = '#FBE8EA';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
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
  paperColumn: {width: '100%', maxWidth: 760, marginInline: 'auto'},
  // The document surface: white paper, light-locked so review inks hold.
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
  docByline: {fontSize: 14, color: PAPER_MUTED, marginTop: 6},
  docRule: {
    border: 'none',
    borderTop: \`1px solid \${PAPER_RULE}\`,
    margin: '20px 0 24px',
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: '26px 0 10px',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 1.85,
    margin: '0 0 16px',
    overflowWrap: 'break-word',
  },
  // <=640px: looser leading so padded inline tap targets never overlap.
  paragraphTouch: {lineHeight: 2.15},
  // Inline interactive spans render as real <button>s with type reset so
  // anchors and suggestion spans are keyboard-reachable, not hover-only.
  // Buttons are atomic inline boxes: without their own tighter line-height
  // they inherit the paragraph's 1.85 leading, and the anchor wash +
  // dotted borderBottom detach ~7px below the baseline.
  inlineButton: {
    display: 'inline',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    lineHeight: 1.4,
    color: 'inherit',
    textAlign: 'inherit',
    cursor: 'pointer',
    borderRadius: 4,
  },
  // <=640px: block padding grows the tap target toward ~40px.
  inlineButtonTouch: {paddingBlock: 6},
  anchorSpan: {
    backgroundColor: ANCHOR_BG,
    borderBottom: \`2px dotted \${ANCHOR_ACCENT}\`,
    borderRadius: 3,
    paddingInline: 1,
  },
  anchorResolved: {
    backgroundColor: 'transparent',
    borderBottom: \`2px dotted \${ANCHOR_RESOLVED}\`,
  },
  insText: {
    color: INSERT_INK,
    backgroundColor: INSERT_BG,
    textDecoration: 'underline',
    textDecorationColor: INSERT_INK,
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
    fontStyle: 'normal',
    borderRadius: 3,
    paddingInline: 1,
  },
  delText: {
    color: DELETE_INK,
    backgroundColor: DELETE_BG,
    textDecoration: 'line-through',
    textDecorationColor: DELETE_INK,
    textDecorationThickness: 2,
    borderRadius: 3,
    paddingInline: 1,
    marginRight: 2,
  },
  // Header review-progress summary chip: count + compact bar in one pill.
  progressChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // ProgressBar enforces minWidth 48; pin a fixed track for the chip.
  progressChipBar: {width: 64, minWidth: 0},
  // Rail: pinned pills header + scrolling card list.
  railFrame: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  railScroll: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  railStacked: {padding: 'var(--spacing-3)'},
  // Suggestions queue toolbar row (pending count + Accept all).
  queueToolbar: {paddingInline: 'var(--spacing-1)'},
  // Paper diff chip inside suggestion cards: same light-locked treatment
  // as the canvas so the green/red inks stay legible on dark app chrome.
  diffChip: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    border: \`1px solid \${PAPER_RULE}\`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    fontSize: 14,
    lineHeight: 1.6,
    overflowWrap: 'anywhere',
  },
  // Decided suggestions settle to compact receipt rows, not Cards.
  decidedRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-surface)',
  },
  replyIndent: {
    paddingLeft: 'var(--spacing-4)',
    borderLeft: '2px solid var(--color-border)',
  },
  threadBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
  // Emoji reaction chips: real buttons, pill-shaped, count in tabular nums.
  reactionChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 8,
    paddingBlock: 2,
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
  },
  reactionChipActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    color: 'var(--color-text)',
  },
  reactionPopover: {padding: 'var(--spacing-2)', display: 'flex', gap: 4},
  emojiOption: {
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--radius-control)',
    fontSize: 18,
    lineHeight: 1.4,
    padding: 6,
    cursor: 'pointer',
  },
};

// ============= PEOPLE =============
// The Kestrel Labs review circle for the Atlas Q3 program. Dana Whitfield
// owns the doc and is the signed-in reviewer; the other four comment and
// suggest. Names/roles are shared across the Office Suite set.

type PersonId = 'dana' | 'priya' | 'marcus' | 'sofia' | 'jonah';

interface Person {
  id: PersonId;
  name: string;
  role: string;
}

const PEOPLE: Record<PersonId, Person> = {
  dana: {id: 'dana', name: 'Dana Whitfield', role: 'Product Lead'},
  priya: {id: 'priya', name: 'Priya Raman', role: 'Design Lead'},
  marcus: {id: 'marcus', name: 'Marcus Webb', role: 'Engineering Lead'},
  sofia: {id: 'sofia', name: 'Sofia Ortiz', role: 'Product Marketing'},
  jonah: {id: 'jonah', name: 'Jonah Fields', role: 'Support Lead'},
};

const CURRENT_USER: PersonId = 'dana';
const REVIEWERS: PersonId[] = ['priya', 'marcus', 'sofia', 'jonah'];

const DOC_TITLE = 'Atlas Q3 Launch Plan';
const DOC_META = 'Kestrel Labs · Atlas Q3 program · edited Jul 2, 2026';
const DOC_BYLINE =
  'Drafted by Dana Whitfield · Product · Review closes Wed, Jul 8';
/** Fixed literal stamp for replies sent from this surface. */
const REPLY_TIMESTAMP = '2026-07-02T16:45:00Z';

// ============= THREAD DATA =============
// 6 margin threads with fixed ISO timestamps between 2026-07-01T09:12:00Z
// and 2026-07-02T16:05:00Z. thread-support and thread-rollback start
// resolved. Reaction userIds drive the toggle-for-current-user behavior.

interface Reaction {
  emoji: string;
  /** Who has reacted; membership of CURRENT_USER makes the chip active. */
  userIds: PersonId[];
}

interface Comment {
  id: string;
  author: PersonId;
  ts: string; // fixed ISO timestamp
  body: string;
}

interface Thread {
  id: string;
  anchorText: string;
  root: Comment;
  replies: Comment[];
  reactions: Reaction[];
}

/** Fixture factory — keeps each fixed-timestamp comment to two lines. */
function comment(
  id: string,
  author: PersonId,
  ts: string,
  body: string,
): Comment {
  return {id, author, ts, body};
}

const THREADS: Thread[] = [
  {
    id: 'thread-date',
    anchorText: 'Tuesday, August 18',
    root: comment('thread-date-root', 'priya', '2026-07-01T09:12:00Z',
      '@Dana is August 18 locked? Design QA needs the final date to book the polish sprint the week before.'),
    replies: [
      comment('thread-date-reply-1', 'dana', '2026-07-01T10:03:00Z',
        'Locked as of Monday’s steering — the hold is on the Atlas Q3 program calendar.'),
    ],
    reactions: [{emoji: '👍', userIds: ['marcus', 'sofia']}],
  },
  {
    id: 'thread-flag',
    anchorText: 'guided onboarding tour',
    root: comment('thread-flag-root', 'marcus', '2026-07-01T11:40:00Z',
      'The tour ships behind the atlas-onboarding flag. Worth saying so here — @Jonah your team will get the “where did the tour go” tickets if a workspace has it off.'),
    replies: [
      comment('thread-flag-reply-1', 'jonah', '2026-07-01T13:22:00Z',
        'Agreed — add the flag name and we’ll mirror it in the support macros.'),
    ],
    reactions: [{emoji: '👀', userIds: ['jonah']}],
  },
  {
    id: 'thread-support',
    anchorText: 'first-response targets',
    root: comment('thread-support-root', 'jonah', '2026-07-01T15:05:00Z',
      'Targets confirmed with the weekend rotation — 2 hours for launch-week P1s, 8 hours otherwise. Runbook updated.'),
    replies: [
      comment('thread-support-reply-1', 'sofia', '2026-07-01T15:48:00Z',
        'Perfect, that unblocks the help-center copy.'),
    ],
    reactions: [{emoji: '🎉', userIds: ['dana', 'sofia']}],
  },
  {
    id: 'thread-pricing',
    anchorText: 'pricing page refresh',
    root: comment('thread-pricing-root', 'sofia', '2026-07-02T09:31:00Z',
      'Heads up: pricing copy is still with legal after the July 15 review — this sentence may change. @Dana keep the section, just don’t treat it as final.'),
    replies: [],
    reactions: [{emoji: '🙏', userIds: ['dana']}],
  },
  {
    id: 'thread-rollback',
    anchorText: 'rollback triggers',
    root: comment('thread-rollback-root', 'marcus', '2026-07-01T17:14:00Z',
      'Dashboards for all three triggers are live in Grafana under atlas-q3/rollout — linked from the runbook.'),
    replies: [],
    reactions: [{emoji: '👍', userIds: ['dana', 'priya', 'jonah']}],
  },
  {
    id: 'thread-beta',
    anchorText: 'beta cohort feedback',
    root: comment('thread-beta-root', 'priya', '2026-07-02T16:05:00Z',
      'The verbatims from the beta cohort are stronger than this summary suggests — @Sofia can we pull two quotes into the announcement post?'),
    replies: [],
    reactions: [{emoji: '❤️', userIds: ['sofia', 'dana']}],
  },
];

const THREAD_BY_ID = Object.fromEntries(
  THREADS.map(thread => [thread.id, thread]),
) as Record<string, Thread>;

const INITIALLY_RESOLVED = ['thread-support', 'thread-rollback'];

/** Reaction choices offered by the add-reaction Popover. */
const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '👀', '🙏'];

// ============= SUGGESTION DATA =============
// 5 queued edit suggestions. \`original\` is empty for pure inserts and
// \`proposed\` is empty for pure deletes, so accept/reject always settles the
// span to a clean string with fixture-designed spacing — no joins to
// compute. The queue triages them; the paper previews them in green/red.

type SuggestionKind = 'insert' | 'delete' | 'replace';
type SuggestionState = 'pending' | 'accepted' | 'rejected';

interface Suggestion {
  id: string;
  author: PersonId;
  ts: string;
  kind: SuggestionKind;
  original: string;
  proposed: string;
  note: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-count', author: 'marcus', ts: '2026-07-01T11:52:00Z',
    kind: 'replace', original: 'roughly forty', proposed: '43',
    note: 'Steering will ask for the exact workspace count — it’s 43 as of the July 1 export.',
  },
  {
    id: 'sug-hedge', author: 'marcus', ts: '2026-07-01T12:05:00Z',
    kind: 'delete', original: 'as previously discussed, ', proposed: '',
    note: 'Filler — the timeline table above already carries this.',
  },
  {
    id: 'sug-flag', author: 'jonah', ts: '2026-07-01T13:30:00Z',
    kind: 'insert', original: '',
    proposed: '(behind the atlas-onboarding flag) ',
    note: 'Names the flag so support can toggle it per workspace — see my thread with Marcus.',
  },
  {
    id: 'sug-email', author: 'sofia', ts: '2026-07-02T09:44:00Z',
    kind: 'insert', original: '',
    proposed: ', with a segmented follow-up for trial workspaces on day three',
    note: 'The follow-up segment is approved and scheduled — the plan should claim it.',
  },
  {
    id: 'sug-window', author: 'priya', ts: '2026-07-02T16:20:00Z',
    kind: 'replace', original: 'soon after launch',
    proposed: 'in the week of August 24',
    note: 'Give the retrospective a week, not a vibe — calendar hold already exists.',
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

const KIND_BADGE: Record<SuggestionKind, 'green' | 'red' | 'blue'> = {
  insert: 'green',
  delete: 'red',
  replace: 'blue',
};

// ============= DOCUMENT DATA =============
// The static preview: 7 sections rendered as heading + paragraph blocks.
// Paragraph segments interleave plain text with comment anchors and
// suggestion spans; spacing is designed so any accept/reject outcome reads
// cleanly. The body is NOT editable — the editor lives in astryx-editor.

type Segment =
  | {kind: 'text'; text: string}
  | {kind: 'anchor'; threadId: string; text: string}
  | {kind: 'suggestion'; suggestionId: string};

type Block =
  | {kind: 'heading'; id: string; text: string}
  | {kind: 'paragraph'; id: string; segments: Segment[]};

/** Segment/block factories — keep the preview's prose runs compact. */
const txt = (text: string): Segment => ({kind: 'text', text});
const anchor = (threadId: string, text: string): Segment => ({
  kind: 'anchor',
  threadId,
  text,
});
const sug = (suggestionId: string): Segment => ({
  kind: 'suggestion',
  suggestionId,
});
const heading = (id: string, text: string): Block => ({
  kind: 'heading',
  id,
  text,
});
const para = (id: string, segments: Segment[]): Block => ({
  kind: 'paragraph',
  id,
  segments,
});

const BLOCKS: Block[] = [
  heading('h-overview', 'Overview'),
  para('p-overview-1', [
    txt('Atlas ships to all Kestrel Labs customers on '),
    anchor('thread-date', 'Tuesday, August 18'),
    txt('. This plan is the single source of truth for the Q3 launch: scope, timeline, support readiness, and communications. The beta program currently spans '),
    sug('sug-count'),
    txt(' workspaces, and every open decision below is owned and dated.'),
  ]),
  heading('h-timeline', 'Launch timeline'),
  para('p-timeline-1', [
    txt('Feature freeze lands July 31, '),
    sug('sug-hedge'),
    txt('followed by two hardening sprints. Staged rollout begins August 18 at ten percent of workspaces, expanding to half within one week; each stage carries an owner, a dashboard, and explicit '),
    anchor('thread-rollback', 'rollback triggers'),
    txt(' documented in the runbook.'),
  ]),
  heading('h-product', 'Product readiness'),
  para('p-product-1', [
    txt('The workspace importer, shared views, and the '),
    anchor('thread-flag', 'guided onboarding tour'),
    txt(' '),
    sug('sug-flag'),
    txt('are feature-complete. Remaining engineering work is performance: imports over 50k rows must finish inside the five-minute budget, with the chunked importer landing July 21.'),
  ]),
  heading('h-support', 'Support & enablement'),
  para('p-support-1', [
    txt('Support macros cover the top eighteen intents, the escalation runbook has been rehearsed with the weekend rotation, and launch-week '),
    anchor('thread-support', 'first-response targets'),
    txt(' are confirmed with Jonah Fields. Two additional agents join each shift for the first two weeks.'),
  ]),
  heading('h-comms', 'Communications plan'),
  para('p-comms-1', [
    txt('The announcement post and in-app tour copy are in final review. The customer email goes out launch morning'),
    sug('sug-email'),
    txt('. Social follows one day later to keep first-day channel load on email, and the '),
    anchor('thread-pricing', 'pricing page refresh'),
    txt(' ships behind the same flag as the product change.'),
  ]),
  heading('h-risks', 'Open risks'),
  para('p-risks-1', [
    txt('Import throughput is the largest open risk; the chunked importer has a staging build we can demo at the July 8 review. Legal sign-off on pricing copy is the second. The '),
    anchor('thread-beta', 'beta cohort feedback'),
    txt(' is net positive — 4.4/5 across 31 responses — with import speed the only recurring complaint.'),
  ]),
  heading('h-next', 'What happens next'),
  para('p-next-1', [
    txt('The launch review on July 8 is a go/no-go decision. A written retrospective follows '),
    sug('sug-window'),
    txt(', and anything unresolved leaves that meeting with an owner and a date in the launch channel.'),
  ]),
];

// ============= DERIVATION HELPERS =============
// Small helpers over fixture arrays — no parsers, no geometry.

/** Thread ids in document order; the rail sorts open/resolved lists by it. */
const THREAD_DOC_ORDER: string[] = BLOCKS.flatMap(block =>
  block.kind === 'paragraph'
    ? block.segments.flatMap(segment =>
        segment.kind === 'anchor' ? [segment.threadId] : [],
      )
    : [],
);

/** The text a suggestion span settles to once a decision lands. */
function settledText(suggestion: Suggestion, state: SuggestionState): string {
  return state === 'rejected' ? suggestion.original : suggestion.proposed;
}

/** Short quote for aria labels, tooltips, and decided receipts. */
function clip(text: string, max = 36): string {
  return text.length > max ? \`\${text.slice(0, max)}…\` : text;
}

function suggestionSummary(suggestion: Suggestion): string {
  if (suggestion.kind === 'insert') {
    return \`Insert "\${clip(suggestion.proposed)}"\`;
  }
  if (suggestion.kind === 'delete') {
    return \`Delete "\${clip(suggestion.original)}"\`;
  }
  return \`Replace "\${clip(suggestion.original)}" with "\${clip(
    suggestion.proposed,
  )}"\`;
}

// ============= @MENTION RENDERING =============

/**
 * Splits a comment body on @mentions and renders each mention as an accent
 * Token so roster names read as entities, not prose.
 */
function renderBody(body: string): ReactNode[] {
  return body.split(/(@[A-Za-z]+)/g).map((part, index) =>
    part.startsWith('@') ? (
      <Token
        key={\`mention-\${index}\`}
        label={part}
        size="sm"
        color="blue"
        description={\`Mention of \${part.slice(1)}\`}
      />
    ) : (
      <span key={\`text-\${index}\`}>{part}</span>
    ),
  );
}

// ============= INLINE DOC SPANS =============

/**
 * One comment-anchored text range in the static preview. Open threads wear
 * the amber wash and a dotted underline; resolved threads keep only a faint
 * dotted underline so the range stays discoverable.
 */
function AnchorSpan({
  threadId,
  text,
  isResolved,
  isActive,
  hasTouchTarget,
  onActivate,
  registerRef,
}: {
  threadId: string;
  text: string;
  isResolved: boolean;
  isActive: boolean;
  hasTouchTarget: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  const thread = THREAD_BY_ID[threadId];
  const rootAuthor = PEOPLE[thread.root.author].name;
  return (
    <button
      type="button"
      ref={node => registerRef(threadId, node)}
      aria-label={\`Comment by \${rootAuthor}\${
        isResolved ? ' (resolved)' : ''
      } on "\${text}"\`}
      onClick={() => onActivate(threadId)}
      style={{
        ...styles.inlineButton,
        ...(hasTouchTarget ? styles.inlineButtonTouch : null),
        ...styles.anchorSpan,
        ...(isResolved ? styles.anchorResolved : null),
        ...(isActive && !isResolved
          ? {backgroundColor: ANCHOR_BG_ACTIVE}
          : null),
        outline: isActive ? \`2px solid \${ANCHOR_ACCENT}\` : 'none',
        outlineOffset: 1,
      }}>
      {text}
    </button>
  );
}

/**
 * One suggestion span in the static preview. Pending spans paint the edit
 * as green <ins> / red <del>; decided spans settle to plain prose —
 * accepted shows the proposal, rejected reverts cleanly.
 */
function SuggestionSpan({
  suggestion,
  state,
  isActive,
  hasTouchTarget,
  onActivate,
  registerRef,
}: {
  suggestion: Suggestion;
  state: SuggestionState;
  isActive: boolean;
  hasTouchTarget: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  if (state !== 'pending') {
    const text = settledText(suggestion, state);
    return text === '' ? null : <span>{text}</span>;
  }
  const activeInk = suggestion.kind === 'delete' ? DELETE_INK : INSERT_INK;
  // The <button> is an atomic inline box, so the browser trims collapsible
  // whitespace at its edges — fixture-designed leading/trailing spaces must
  // render OUTSIDE the button or prose like "flag) are" fuses together.
  const leadingSpace = (suggestion.original || suggestion.proposed).startsWith(
    ' ',
  );
  const trailingSpace = (suggestion.proposed || suggestion.original).endsWith(
    ' ',
  );
  return (
    <>
      {leadingSpace && ' '}
      <button
        type="button"
        ref={node => registerRef(suggestion.id, node)}
        aria-label={\`Suggestion by \${PEOPLE[suggestion.author].name}: \${suggestionSummary(suggestion)}\`}
        onClick={() => onActivate(suggestion.id)}
        style={{
          ...styles.inlineButton,
          ...(hasTouchTarget ? styles.inlineButtonTouch : null),
          outline: isActive ? \`2px solid \${activeInk}\` : 'none',
          outlineOffset: 1,
        }}>
        {suggestion.original !== '' && (
          <del style={styles.delText}>{suggestion.original}</del>
        )}
        {suggestion.original !== '' && suggestion.proposed !== '' && ' '}
        {suggestion.proposed !== '' && (
          <ins style={styles.insText}>{suggestion.proposed}</ins>
        )}
      </button>
      {trailingSpace && ' '}
    </>
  );
}

/** One paragraph of the preview: a run of text/anchor/suggestion segments. */
function ParagraphView({
  segments,
  suggestionStates,
  resolvedIds,
  activeId,
  hasTouchTargets,
  onActivate,
  registerRef,
}: {
  segments: Segment[];
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
      {segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <span key={index}>{segment.text}</span>;
        }
        if (segment.kind === 'anchor') {
          return (
            <AnchorSpan
              key={segment.threadId}
              threadId={segment.threadId}
              text={segment.text}
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
            key={segment.suggestionId}
            suggestion={SUGGESTION_BY_ID[segment.suggestionId]}
            state={suggestionStates[segment.suggestionId]}
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

// ============= RAIL: REACTIONS =============

/**
 * Emoji reaction row on a thread's root comment: existing reactions render
 * as toggle chips (the current reviewer joins/leaves on click) and a
 * smile-plus IconButton opens a Popover of five fixed options.
 */
function ReactionRow({
  thread,
  reactions,
  isPickerOpen,
  onPickerOpenChange,
  onToggle,
}: {
  thread: Thread;
  reactions: Reaction[];
  isPickerOpen: boolean;
  onPickerOpenChange: (isOpen: boolean) => void;
  onToggle: (threadId: string, emoji: string) => void;
}) {
  return (
    <HStack gap={1} vAlign="center" wrap="wrap">
      {reactions.map(reaction => {
        const hasReacted = reaction.userIds.includes(CURRENT_USER);
        const names = reaction.userIds
          .map(userId => PEOPLE[userId].name)
          .join(', ');
        return (
          <Tooltip key={reaction.emoji} content={names}>
            <button
              type="button"
              aria-pressed={hasReacted}
              aria-label={\`\${reaction.emoji} \${reaction.userIds.length} — \${
                hasReacted ? 'remove your reaction' : 'react'
              }\`}
              style={{
                ...styles.reactionChip,
                ...(hasReacted ? styles.reactionChipActive : null),
              }}
              onClick={() => onToggle(thread.id, reaction.emoji)}>
              <span aria-hidden>{reaction.emoji}</span>
              <span style={{fontVariantNumeric: 'tabular-nums'}}>
                {reaction.userIds.length}
              </span>
            </button>
          </Tooltip>
        );
      })}
      <Popover
        isOpen={isPickerOpen}
        onOpenChange={onPickerOpenChange}
        placement="above"
        label="Add reaction"
        content={
          <div style={styles.reactionPopover}>
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                aria-label={\`React with \${emoji}\`}
                style={styles.emojiOption}
                onClick={() => {
                  onToggle(thread.id, emoji);
                  onPickerOpenChange(false);
                }}>
                {emoji}
              </button>
            ))}
          </div>
        }>
        <IconButton
          label="Add reaction"
          tooltip="Add reaction"
          size="sm"
          variant="ghost"
          icon={<Icon icon={SmilePlusIcon} size="sm" color="inherit" />}
        />
      </Popover>
    </HStack>
  );
}

// ============= RAIL: THREAD CARD =============

interface ThreadCardProps {
  thread: Thread;
  replies: Comment[];
  reactions: Reaction[];
  isResolved: boolean;
  isActive: boolean;
  isPickerOpen: boolean;
  draft: string;
  buttonSize: 'sm' | 'md';
  onActivate: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onToggleReaction: (threadId: string, emoji: string) => void;
  onPickerOpenChange: (threadId: string, isOpen: boolean) => void;
  onDraftChange: (id: string, value: string) => void;
  onSend: (id: string) => void;
  cardRef: (node: HTMLDivElement | null) => void;
}

function ThreadCard({
  thread,
  replies,
  reactions,
  isResolved,
  isActive,
  isPickerOpen,
  draft,
  buttonSize,
  onActivate,
  onToggleResolved,
  onToggleReaction,
  onPickerOpenChange,
  onDraftChange,
  onSend,
  cardRef,
}: ThreadCardProps) {
  const rootAuthor = PEOPLE[thread.root.author];

  // Resolved threads collapse to one summary line with a Reopen Button.
  if (isResolved) {
    return (
      <div ref={cardRef}>
        <Card
          padding={3}
          style={{
            cursor: 'pointer',
            boxShadow: isActive ? \`0 0 0 2px \${ANCHOR_ACCENT}\` : undefined,
          }}
          onClick={() => onActivate(thread.id)}>
          <HStack gap={2} vAlign="center">
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="supporting" color="secondary" maxLines={1}>
                {rootAuthor.name} on “{thread.anchorText}” — {thread.root.body}
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
          boxShadow: isActive ? \`0 0 0 2px \${ANCHOR_ACCENT}\` : undefined,
        }}
        onClick={() => onActivate(thread.id)}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={rootAuthor.name} size="xsmall" />
            {/* Two fixed lines (name + role / timestamp) so every card's
                header matches — long roles otherwise wrap only some cards. */}
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="body" weight="bold">
                    {rootAuthor.name}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {rootAuthor.role}
                  </Text>
                </HStack>
                <Timestamp value={thread.root.ts} format="date_time" />
              </VStack>
            </StackItem>
            <Icon icon={MessageSquareTextIcon} size="sm" color="secondary" />
          </HStack>

          <Text type="supporting" color="secondary" maxLines={1}>
            On “{thread.anchorText}”
          </Text>

          <Text type="body" style={styles.threadBody}>
            {renderBody(thread.root.body)}
          </Text>

          <ReactionRow
            thread={thread}
            reactions={reactions}
            isPickerOpen={isPickerOpen}
            onPickerOpenChange={isOpen =>
              onPickerOpenChange(thread.id, isOpen)
            }
            onToggle={onToggleReaction}
          />

          {replies.length > 0 && (
            <VStack gap={2} style={styles.replyIndent}>
              {replies.map(reply => (
                <VStack key={reply.id} gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Avatar name={PEOPLE[reply.author].name} size="xsmall" />
                    <Text type="supporting" weight="bold">
                      {PEOPLE[reply.author].name}
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
                  label={\`Reply to \${rootAuthor.name}\`}
                  isLabelHidden
                  placeholder="Reply — use @ to mention"
                  rows={2}
                  value={draft}
                  onChange={value => onDraftChange(thread.id, value)}
                />
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      Replying as {PEOPLE[CURRENT_USER].name}
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
  const author = PEOPLE[suggestion.author];
  const activeInk = suggestion.kind === 'delete' ? DELETE_INK : INSERT_INK;
  return (
    <div ref={cardRef}>
      <Card
        padding={3}
        style={{
          cursor: 'pointer',
          boxShadow: isActive ? \`0 0 0 2px \${activeInk}\` : undefined,
        }}
        onClick={() => onActivate(suggestion.id)}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={author.name} size="xsmall" />
            {/* Same two-line header rhythm as ThreadCard. */}
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Text type="body" weight="bold" maxLines={1}>
                  {author.name}
                </Text>
                <Timestamp value={suggestion.ts} format="date_time" />
              </VStack>
            </StackItem>
            <Badge
              label={KIND_LABEL[suggestion.kind]}
              variant={KIND_BADGE[suggestion.kind]}
            />
          </HStack>

          {/* Paper diff chip: red strike for removals, green underline for
              additions, on the same light-locked paper as the canvas. */}
          <div style={styles.diffChip}>
            {suggestion.original !== '' && (
              <del style={styles.delText}>{suggestion.original}</del>
            )}
            {suggestion.original !== '' && suggestion.proposed !== '' && ' '}
            {suggestion.proposed !== '' && (
              <ins style={styles.insText}>{suggestion.proposed}</ins>
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

/**
 * A decided suggestion settles to a compact receipt row: decision +
 * summary, with a ghost undo back to pending so triage stays reversible.
 */
function DecidedSuggestionRow({
  suggestion,
  state,
  buttonSize,
  onReconsider,
}: {
  suggestion: Suggestion;
  state: SuggestionState;
  buttonSize: 'sm' | 'md';
  onReconsider: (id: string) => void;
}) {
  const isAccepted = state === 'accepted';
  return (
    <div style={styles.decidedRow}>
      <HStack gap={2} vAlign="center">
        <Icon
          icon={isAccepted ? CheckIcon : XIcon}
          size="sm"
          color={isAccepted ? 'success' : 'secondary'}
        />
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="supporting" color="secondary" maxLines={1}>
            {isAccepted ? 'Accepted' : 'Rejected'} —{' '}
            {suggestionSummary(suggestion)} · {PEOPLE[suggestion.author].name}
          </Text>
        </StackItem>
        <Button
          label="Undo"
          variant="ghost"
          size={buttonSize}
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          onClick={() => onReconsider(suggestion.id)}
        />
      </HStack>
    </div>
  );
}

// ============= PAGE =============

type RailFilter = 'open' | 'resolved' | 'suggestions';

const FILTER_LABEL: Record<RailFilter, string> = {
  open: 'Open',
  resolved: 'Resolved',
  suggestions: 'Suggestions',
};

export default function DocCommentsReviewTemplate() {
  const [filter, setFilter] = useState<RailFilter>('open');
  const [activeId, setActiveId] = useState<string | null>('thread-date');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(INITIALLY_RESOLVED),
  );
  const [suggestionStates, setSuggestionStates] = useState<
    Record<string, SuggestionState>
  >(() =>
    Object.fromEntries(
      SUGGESTIONS.map(suggestion => [suggestion.id, 'pending']),
    ),
  );
  // Per-thread reply drafts, appended replies, and live reactions.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [repliesById, setRepliesById] = useState<Record<string, Comment[]>>(
    () =>
      Object.fromEntries(THREADS.map(thread => [thread.id, thread.replies])),
  );
  const [reactionsById, setReactionsById] = useState<
    Record<string, Reaction[]>
  >(() =>
    Object.fromEntries(THREADS.map(thread => [thread.id, thread.reactions])),
  );
  // At most one reaction Popover open at a time, keyed by thread id.
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(
    null,
  );

  const docSpanRefs = useRef<Record<string, HTMLElement | null>>({});
  const railCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Responsive contract: <=920px the rail stacks below the paper; <=640px
  // header chrome condenses and inline/tap targets grow.
  const isRailStacked = useMediaQuery('(max-width: 920px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const railButtonSize: 'sm' | 'md' = isPhone ? 'md' : 'sm';

  // ---- derived state (single source for every repeated number) ----
  const openThreadIds = THREAD_DOC_ORDER.filter(id => !resolvedIds.has(id));
  const resolvedThreadIds = THREAD_DOC_ORDER.filter(id =>
    resolvedIds.has(id),
  );
  const pendingSuggestions = SUGGESTIONS.filter(
    suggestion => suggestionStates[suggestion.id] === 'pending',
  );
  const decidedSuggestions = SUGGESTIONS.filter(
    suggestion => suggestionStates[suggestion.id] !== 'pending',
  );
  const totalItems = THREADS.length + SUGGESTIONS.length;
  const reviewedItems = resolvedThreadIds.length + decidedSuggestions.length;
  const reviewedPct = Math.round((reviewedItems / totalItems) * 100);

  // ---- interactions ----
  const registerDocSpan = (id: string, node: HTMLElement | null) => {
    docSpanRefs.current[id] = node;
  };

  /** The rail filter a given item currently lives under. */
  const filterForId = (id: string): RailFilter => {
    if (id.startsWith('sug-')) {
      return 'suggestions';
    }
    return resolvedIds.has(id) ? 'resolved' : 'open';
  };

  /** Doc span click: flip the rail to the right pill, scroll its card. */
  const activateFromDoc = (id: string) => {
    setActiveId(id);
    setFilter(filterForId(id));
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

  const toggleResolved = (id: string) => {
    const isNowResolved = !resolvedIds.has(id);
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
    // Follow the card to the pill it just moved under, so the action never
    // "deletes" the thread from the visible list.
    setFilter(isNowResolved ? 'resolved' : 'open');
  };

  const decideSuggestion = (id: string, decision: SuggestionState) => {
    setSuggestionStates(prev => ({...prev, [id]: decision}));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  const acceptAllPending = () => {
    setSuggestionStates(prev => {
      const next = {...prev};
      for (const suggestion of SUGGESTIONS) {
        if (next[suggestion.id] === 'pending') {
          next[suggestion.id] = 'accepted';
        }
      }
      return next;
    });
    setActiveId(null);
  };

  const reconsiderSuggestion = (id: string) => {
    setSuggestionStates(prev => ({...prev, [id]: 'pending'}));
    setActiveId(id);
  };

  const setDraft = (id: string, value: string) => {
    setDrafts(prev => ({...prev, [id]: value}));
  };

  /** Send appends a reply with the fixed literal timestamp, clears draft. */
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
          id: \`\${id}-reply-\${prev[id].length + 1}\`,
          author: CURRENT_USER,
          ts: REPLY_TIMESTAMP,
          body,
        },
      ],
    }));
    setDrafts(prev => ({...prev, [id]: ''}));
  };

  /** Toggle the current reviewer's membership in a reaction. */
  const toggleReaction = (threadId: string, emoji: string) => {
    setReactionsById(prev => {
      const reactions = prev[threadId];
      const existing = reactions.find(reaction => reaction.emoji === emoji);
      let next: Reaction[];
      if (existing == null) {
        next = [...reactions, {emoji, userIds: [CURRENT_USER]}];
      } else if (existing.userIds.includes(CURRENT_USER)) {
        next = reactions
          .map(reaction =>
            reaction.emoji === emoji
              ? {
                  ...reaction,
                  userIds: reaction.userIds.filter(
                    userId => userId !== CURRENT_USER,
                  ),
                }
              : reaction,
          )
          .filter(reaction => reaction.userIds.length > 0);
      } else {
        next = reactions.map(reaction =>
          reaction.emoji === emoji
            ? {...reaction, userIds: [...reaction.userIds, CURRENT_USER]}
            : reaction,
        );
      }
      return {...prev, [threadId]: next};
    });
  };

  // ---- rail: filter pills (single-select ToggleButton pills) ----
  const pillCounts: Record<RailFilter, number> = {
    open: openThreadIds.length,
    resolved: resolvedThreadIds.length,
    suggestions: pendingSuggestions.length,
  };

  const filterPills = (
    <HStack gap={1} vAlign="center" wrap="wrap">
      {(['open', 'resolved', 'suggestions'] as const).map(pill => (
        <ToggleButton
          key={pill}
          label={\`\${FILTER_LABEL[pill]} · \${pillCounts[pill]}\`}
          size="sm"
          isPressed={filter === pill}
          onPressedChange={() => setFilter(pill)}
        />
      ))}
    </HStack>
  );

  const railHeader = (
    <div style={styles.railHeader}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Review</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {reviewedItems} of {totalItems} reviewed
          </Text>
        </HStack>
        {filterPills}
      </VStack>
    </div>
  );

  const threadCardFor = (threadId: string) => {
    const thread = THREAD_BY_ID[threadId];
    return (
      <ThreadCard
        key={threadId}
        thread={thread}
        replies={repliesById[threadId]}
        reactions={reactionsById[threadId]}
        isResolved={resolvedIds.has(threadId)}
        isActive={activeId === threadId}
        isPickerOpen={reactionPickerId === threadId}
        draft={drafts[threadId] ?? ''}
        buttonSize={railButtonSize}
        onActivate={activateFromRail}
        onToggleResolved={toggleResolved}
        onToggleReaction={toggleReaction}
        onPickerOpenChange={(id, isOpen) =>
          setReactionPickerId(isOpen ? id : null)
        }
        onDraftChange={setDraft}
        onSend={sendReply}
        cardRef={node => {
          railCardRefs.current[threadId] = node;
        }}
      />
    );
  };

  // ---- rail: filtered card list ----
  let railCards: ReactNode;
  if (filter === 'open') {
    railCards =
      openThreadIds.length === 0 ? (
        <EmptyState
          icon={<Icon icon={CheckCheckIcon} size="lg" />}
          title="No open comments"
          description="Every thread is resolved. Check the Resolved pill to revisit them, or Suggestions for pending edits."
          isCompact
        />
      ) : (
        openThreadIds.map(threadCardFor)
      );
  } else if (filter === 'resolved') {
    railCards =
      resolvedThreadIds.length === 0 ? (
        <EmptyState
          icon={<Icon icon={MessageSquareTextIcon} size="lg" />}
          title="Nothing resolved yet"
          description="Threads you resolve move here so the open list stays short."
          isCompact
        />
      ) : (
        resolvedThreadIds.map(threadCardFor)
      );
  } else {
    railCards = (
      <>
        {/* Queue toolbar: pending count + Accept all, always visible so
            the batch action reads as part of the queue, not a card. */}
        <div style={styles.queueToolbar}>
          <HStack gap={2} vAlign="center">
            <Icon icon={PencilLineIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {pendingSuggestions.length} pending{' '}
                {pendingSuggestions.length === 1
                  ? 'suggestion'
                  : 'suggestions'}
              </Text>
            </StackItem>
            <Button
              label="Accept all"
              variant="secondary"
              size={railButtonSize}
              icon={<Icon icon={CheckCheckIcon} size="sm" color="inherit" />}
              isDisabled={pendingSuggestions.length === 0}
              onClick={acceptAllPending}
            />
          </HStack>
        </div>
        {pendingSuggestions.length === 0 && decidedSuggestions.length === 0 ? (
          <EmptyState
            icon={<Icon icon={PencilLineIcon} size="lg" />}
            title="No suggestions"
            description="Edit suggestions from reviewers queue here for accept/reject triage."
            isCompact
          />
        ) : (
          <>
            {pendingSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isActive={activeId === suggestion.id}
                buttonSize={railButtonSize}
                onActivate={activateFromRail}
                onAccept={id => decideSuggestion(id, 'accepted')}
                onReject={id => decideSuggestion(id, 'rejected')}
                cardRef={node => {
                  railCardRefs.current[suggestion.id] = node;
                }}
              />
            ))}
            {decidedSuggestions.map(suggestion => (
              <DecidedSuggestionRow
                key={suggestion.id}
                suggestion={suggestion}
                state={suggestionStates[suggestion.id]}
                buttonSize={railButtonSize}
                onReconsider={reconsiderSuggestion}
              />
            ))}
          </>
        )}
      </>
    );
  }

  // Fixed panel: pinned pills header + independently scrolling list.
  // Stacked (<=920px): natural height, the page scrolls as one column.
  const rail = (
    <div style={isRailStacked ? undefined : styles.railFrame}>
      {railHeader}
      <div style={isRailStacked ? styles.railStacked : styles.railScroll}>
        <VStack gap={3}>{railCards}</VStack>
      </div>
    </div>
  );

  // ---- paper canvas (static preview — see @position note) ----
  const paper = (
    <div style={styles.backdrop}>
      <div style={styles.paperColumn}>
        <div style={styles.paper}>
          <h2 style={styles.docTitle}>{DOC_TITLE}</h2>
          <div style={styles.docByline}>{DOC_BYLINE}</div>
          <hr style={styles.docRule} />
          {BLOCKS.map(block =>
            block.kind === 'heading' ? (
              <h3 key={block.id} style={styles.sectionHeading}>
                {block.text}
              </h3>
            ) : (
              <ParagraphView
                key={block.id}
                segments={block.segments}
                suggestionStates={suggestionStates}
                resolvedIds={resolvedIds}
                activeId={activeId}
                hasTouchTargets={isPhone}
                onActivate={activateFromDoc}
                registerRef={registerDocSpan}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );

  // ---- header: title + Preview badge + progress chip + reviewers ----
  const progressChip = (
    <Tooltip
      content={\`\${resolvedThreadIds.length} of \${THREADS.length} threads resolved · \${decidedSuggestions.length} of \${SUGGESTIONS.length} suggestions decided\`}>
      <div style={styles.progressChip} role="status">
        <div style={styles.progressChipBar}>
          <ProgressBar
            label="Review progress"
            isLabelHidden
            value={reviewedPct}
            variant={reviewedItems === totalItems ? 'success' : 'accent'}
            style={{minWidth: 0}}
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {reviewedItems} of {totalItems} reviewed
        </Text>
      </div>
    </Tooltip>
  );

  const reviewerStack = (
    <Tooltip
      content={REVIEWERS.map(personId => PEOPLE[personId].name).join(', ')}>
      <AvatarGroup size="xsmall" aria-label="Reviewers">
        {REVIEWERS.slice(0, 3).map(personId => (
          <Avatar key={personId} name={PEOPLE[personId].name} />
        ))}
        <AvatarGroupOverflow count={REVIEWERS.length - 3} />
      </AvatarGroup>
    </Tooltip>
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill" style={{minWidth: 0}}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={FileTextIcon} size="md" color="secondary" />
            <Heading level={1}>{DOC_TITLE}</Heading>
            <Tooltip content="Review-only preview — the live editor opens in Astryx Editor.">
              <Badge label="Preview" variant="neutral" />
            </Tooltip>
            {!isPhone && (
              <Text type="supporting" color="secondary">
                {DOC_META}
              </Text>
            )}
          </HStack>
        </StackItem>
        {progressChip}
        {!isPhone && reviewerStack}
      </HStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        end={
          !isRailStacked ? (
            <LayoutPanel width={380} padding={0} label="Comments and suggestions">
              {rail}
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            {/* When the rail stacks below the paper the column flows at
                natural height and LayoutContent scrolls the whole page;
                the height-locked fill frame would otherwise crush the
                paper to make room for the card list. */}
            <VStack gap={0} style={isRailStacked ? undefined : styles.fill}>
              <StackItem
                size="fill"
                style={isRailStacked ? undefined : styles.fill}>
                {paper}
              </StackItem>
              {isRailStacked && (
                <>
                  <Divider />
                  {rail}
                </>
              )}
            </VStack>
          </LayoutContent>
        }
      />
    </div>
  );
}

`;export{e as default};