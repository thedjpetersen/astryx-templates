var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file comment-thread-popover.tsx
 * @input Deterministic fixtures only: three excerpt passages from the
 *   canonical Kestrel Labs doc "Atlas Q3 Launch Plan", one anchored
 *   comment thread (Marcus Webb, Priya Raman, Sofia Ortiz — 3 comments
 *   with fixed ISO timestamps, an @mention pill, and emoji-reaction
 *   tallies), three @mention autocomplete candidates, resolved-pill copy
 *   ("Resolved by Sofia Ortiz · Jul 15"), and new-comment composer copy.
 *   No clocks, no randomness, no network assets.
 * @output Comment Thread Popover — three side-by-side specimens of the
 *   anchored comment-thread popover used across Team Workspace doc
 *   surfaces, each frozen over a dimmed "Atlas Q3 Launch Plan" excerpt
 *   with one vivid highlighted sentence: specimen 01 is the OPEN thread —
 *   3 comments with Avatars/Timestamps, an @mention Token, toggleable
 *   emoji-reaction chips, and a reply composer whose mention autocomplete
 *   is pinned open above it with three roster candidates and a keyboard
 *   highlight; specimen 02 is the RESOLVED state — the thread collapsed
 *   to a checkmark pill ("Resolved by Sofia Ortiz · Jul 15 · 3 comments")
 *   with a Reopen affordance; specimen 03 is the NEW-COMMENT state — a
 *   fresh selection highlight with an empty composer (placeholder,
 *   formatting mini-toolbar, Cancel/Comment actions that arm as you
 *   type). A mono caption row labels each specimen.
 * @position Block template; emitted by \`astryx template comment-thread-popover\`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE per the
 * specimen-gallery idiom (composer-state-gallery / app-rating-prompt). A
 * full-bleed stage div (minHeight 100dvh, token muted wash + one soft
 * amber radial tint) centers a small header and a wrapping specimen row;
 * each specimen is a 400px column: caption row (mono state-id Token +
 * one-line note) above a dimmed doc-excerpt panel with the popover card
 * anchored beneath it via a bordered caret aligned to the highlight.
 *
 * Responsive contract:
 * - >=1360px: the three specimens sit side by side, top-aligned, centered.
 * - <1360px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); each column keeps width:min(400px, 100%) so nothing clips
 *   at 375px.
 * - Comment metadata rows wrap (flexWrap) instead of truncating names;
 *   reaction chips and toolbar icons wrap onto a second row. All state
 *   changes are click/tap-driven (reaction toggles, Reopen, composer
 *   typing) — no hover-only functionality.
 *
 * Container policy (anatomy-gallery archetype): the popover card, resolved
 * pill, caret, reaction chips, and mention-autocomplete flyout are
 * hand-rolled divs/buttons in the repo style-object idiom because they ARE
 * the specimen's anatomy — no design-system Cards. Astryx supplies text
 * primitives, stacks, Avatar, Token, Timestamp, TextArea, Buttons, Icons.
 *
 * Color policy: app chrome (stage, popover cards, chips, composer) is
 * token-pure so both schemes work; ONE anchor accent — the classic docs
 * comment amber, light-dark(#D4A72C, #E0BB55) — rings the caption chips
 * and stage tint. EXCEPTION: the three doc-excerpt panels are
 * scheme-locked LIGHT paper (colorScheme:'light' + explicit literals —
 * dimmed #8A919C prose, #1F2A37 anchor ink, #F9E7A0 amber wash, #E8EAED
 * resolved wash, #D7E7FB fresh-selection wash) because they depict paper
 * dimmed behind an active overlay; tokens would flip in dark mode and
 * break the paper metaphor.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  AtSignIcon,
  BoldIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  RotateCcwIcon,
  SendIcon,
  SmilePlusIcon,
} from 'lucide-react';

// ============= COLOR CONSTANTS =============
// ONE anchor accent on app chrome; everything else token-pure. The paper
// literals below paint ONLY inside the scheme-locked excerpt panels.

const ANCHOR_ACCENT = 'light-dark(#D4A72C, #E0BB55)';
const ANCHOR_SOFT = 'light-dark(rgba(212,167,44,0.12), rgba(224,187,85,0.14))';

// Locked-light paper literals (see Color policy above).
const PAPER_BG = '#F7F6F3';
const PAPER_INK = '#1F2A37';
const PAPER_DIM = '#8A919C';
const PAPER_RULE = '#E3E4E8';
const WASH_OPEN = '#F9E7A0';
const WASH_RESOLVED = '#E8EAED';
const WASH_FRESH = '#D7E7FB';
const UNDERLINE_OPEN = '#D4A72C';
const UNDERLINE_RESOLVED = '#B7BDC6';
const UNDERLINE_FRESH = '#3B82D9';

// Resolved-check green: data-viz token with the repo-standard fallback.
const RESOLVED_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with one soft amber radial tint; centers everything.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: \`radial-gradient(1100px 460px at 50% -80px, \${ANCHOR_SOFT}, transparent 70%)\`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 620},
  // Specimen row: three columns side by side, wrapping to a stack.
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  specimen: {
    width: 'min(400px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Scheme-locked light paper excerpt, rendered dimmed behind the popover.
  // Literals only — see the Color policy exception in the header block.
  excerpt: {
    colorScheme: 'light',
    backgroundColor: PAPER_BG,
    border: \`var(--border-width) solid \${PAPER_RULE}\`,
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  excerptKicker: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: PAPER_DIM,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  excerptProse: {
    margin: 0,
    fontSize: 13.5,
    lineHeight: 1.65,
    color: PAPER_DIM,
  },
  anchorSpan: {
    color: PAPER_INK,
    backgroundColor: WASH_OPEN,
    borderRadius: 3,
    paddingInline: 2,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    borderBottom: \`2px solid \${UNDERLINE_OPEN}\`,
  },
  anchorResolved: {
    color: PAPER_DIM,
    backgroundColor: WASH_RESOLVED,
    borderBottomColor: UNDERLINE_RESOLVED,
    borderBottomStyle: 'dashed',
  },
  anchorFresh: {
    backgroundColor: WASH_FRESH,
    borderBottomColor: UNDERLINE_FRESH,
  },
  // The popover card: anchored beneath the excerpt via a bordered caret.
  popoverWrap: {position: 'relative', marginTop: 10},
  popoverCard: {
    position: 'relative',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    display: 'flex',
    flexDirection: 'column',
  },
  caret: {
    position: 'absolute',
    top: -7,
    width: 12,
    height: 12,
    backgroundColor: 'var(--color-background-card)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    transform: 'rotate(45deg)',
    borderTopLeftRadius: 3,
  },
  popoverHeader: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  commentList: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  commentBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
  metaRow: {minWidth: 0},
  // Emoji reaction chips: real buttons, pill-shaped, tabular counts.
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
  // Reply composer + the mention autocomplete flyout pinned above it.
  composer: {
    position: 'relative',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  mentionFlyout: {
    position: 'absolute',
    insetBlockEnd: 'calc(100% - var(--spacing-1))',
    insetInlineStart: 'var(--spacing-3)',
    width: 280,
    maxWidth: 'calc(100% - 2 * var(--spacing-3))',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-1)',
    zIndex: 2,
  },
  mentionRow: {
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    borderRadius: 'var(--radius-container)',
  },
  mentionRowActive: {backgroundColor: 'var(--color-background-muted)'},
  mentionText: {minWidth: 0},
  // Collapsed resolved pill: rounded-full strip with check + Reopen.
  resolvedPill: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    borderRadius: 'var(--radius-full)',
  },
  resolvedCheck: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 'var(--radius-full)',
    backgroundColor: RESOLVED_GREEN,
    color: 'light-dark(#FFFFFF, #05240B)',
    flexShrink: 0,
  },
  // Formatting mini-toolbar under the new-comment TextArea.
  toolbarRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  footerRow: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-2)',
  },
};

// ============= FIXTURES =============
// Kestrel Labs / Atlas Q3 world (suite "now": Wed Jul 15, 2026). Fixed
// strings and ISO timestamps only — no clocks, no randomness.

const DOC_TITLE = 'Atlas Q3 Launch Plan';
const CURRENT_USER = 'jonah';

interface Person {
  id: string;
  name: string;
  role: string;
}

const PEOPLE: Record<string, Person> = {
  priya: {id: 'priya', name: 'Priya Raman', role: 'VP Engineering'},
  marcus: {id: 'marcus', name: 'Marcus Webb', role: 'Platform lead'},
  sofia: {id: 'sofia', name: 'Sofia Ortiz', role: 'Design lead'},
  jonah: {id: 'jonah', name: 'Jonah Fields', role: 'GTM · launch PM'},
  ava: {id: 'ava', name: 'Ava Lindqvist', role: 'Engineering · joined Jul 1'},
};

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface CommentFixture {
  id: string;
  author: string;
  ts: string; // fixed ISO timestamp
  body: string;
  mention?: string; // person id rendered as an inline @mention Token
  reactions: Reaction[];
}

// Specimen 01 thread — anchored to the beta-cohort sentence in §4 Rollout.
const OPEN_THREAD: CommentFixture[] = [
  {
    id: 'c-1',
    author: 'marcus',
    ts: '2026-07-14T16:42:00Z',
    body: 'Capacity sign-off is blocked on the shard rebalance. Can we hold the 500-seat date if the rebalance slips past Friday?',
    mention: 'priya',
    reactions: [
      {emoji: '👀', userIds: ['sofia', 'jonah']},
      {emoji: '✅', userIds: ['priya']},
    ],
  },
  {
    id: 'c-2',
    author: 'priya',
    ts: '2026-07-14T18:05:00Z',
    body: "Holding Jul 21. If the rebalance isn't green by EOD Friday we take it to Thursday's Launch Readiness Review.",
    reactions: [{emoji: '👍', userIds: ['marcus', 'sofia', 'jonah']}],
  },
  {
    id: 'c-3',
    author: 'sofia',
    ts: '2026-07-15T15:37:00Z',
    body: 'Beta comms draft assumes the 21st — flagging so Beta Feedback Themes gets an update if the date moves.',
    reactions: [{emoji: '🙏', userIds: ['jonah']}],
  },
];

// Mention autocomplete candidates for the reply draft "… @"; Marcus holds
// the keyboard highlight (he owns the blocking rebalance).
const MENTION_CANDIDATES = ['marcus', 'priya', 'ava'];
const MENTION_HIGHLIGHT_INDEX = 0;
const REPLY_DRAFT = 'Adding the rebalance ETA here — @';

// Emoji offered by the composer's add-reaction affordance (display only).
const NEW_COMMENT_PLACEHOLDER = 'Comment, or add others with @…';

type AnchorTone = 'open' | 'resolved' | 'fresh';

interface ExcerptFixture {
  kicker: string; // doc title + section, mono kicker line
  before: string;
  anchor: string; // the highlighted sentence
  after: string;
}

// Three excerpts from the canonical doc, one per specimen. The anchor
// sentences restate canonical Atlas Q3 facts (§4 rollout, §6 comms, §5
// checklist) — never contradicting the shared fixtures.
const EXCERPTS: Record<string, ExcerptFixture> = {
  rollout: {
    kicker: \`\${DOC_TITLE} · §4 Rollout\`,
    before:
      'Staged rollout continues through July with weekly cohort reviews. ',
    anchor:
      'The beta cohort expands to 500 seats on Jul 21, pending capacity sign-off from Platform & Infra.',
    after:
      ' Expansion gates on error budget and support load, reviewed each Thursday.',
  },
  comms: {
    kicker: \`\${DOC_TITLE} · §6 Comms\`,
    before: 'Enablement materials ship alongside each cohort expansion. ',
    anchor:
      'Beta feedback themes publish to #atlas-q3 every Friday, owned by the Product & Beta workstream.',
    after:
      ' Pricing Page Copy stays frozen once Dana signs off the final draft.',
  },
  checklist: {
    kicker: \`\${DOC_TITLE} · §5 Checklist\`,
    before: 'Workstream leads confirm exit criteria in the weekly review. ',
    anchor:
      'The launch checklist closes Wednesday, Jul 22, with owners assigned per workstream.',
    after:
      ' The accessibility audit follows in the week of Jul 27, ahead of the Aug 4 launch.',
  },
};

// ============= SHARED BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note above the frozen
 * anchored-popover scene (composer-state-gallery caption idiom).
 */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.specimen}>
      <HStack gap={2} vAlign="center">
        <Token
          label={stateId}
          size="sm"
          color="gray"
          style={{flexShrink: 0}}
        />
        <Text type="supporting" color="secondary">
          {note}
        </Text>
      </HStack>
      {children}
    </div>
  );
}

/**
 * Dimmed doc-excerpt paper. Scheme-locked light with literal inks; the
 * anchored sentence keeps full ink over its wash so it pops against the
 * dimmed prose around it.
 */
function ExcerptPanel({
  excerpt,
  tone,
}: {
  excerpt: ExcerptFixture;
  tone: AnchorTone;
}) {
  const anchorStyle =
    tone === 'resolved'
      ? {...styles.anchorSpan, ...styles.anchorResolved}
      : tone === 'fresh'
        ? {...styles.anchorSpan, ...styles.anchorFresh}
        : styles.anchorSpan;
  return (
    <div style={styles.excerpt}>
      <div style={styles.excerptKicker}>{excerpt.kicker}</div>
      <p style={styles.excerptProse}>
        {excerpt.before}
        <span style={anchorStyle}>{excerpt.anchor}</span>
        {excerpt.after}
      </p>
    </div>
  );
}

/**
 * The anchored popover shell: card + bordered caret pointing up at the
 * highlighted sentence. \`caretLeft\` registers the caret under the anchor.
 */
function PopoverShell({
  caretLeft,
  isPill = false,
  children,
}: {
  caretLeft: number;
  isPill?: boolean;
  children: ReactNode;
}) {
  const cardStyle = isPill
    ? {...styles.popoverCard, borderRadius: 'var(--radius-full)'}
    : styles.popoverCard;
  return (
    <div style={styles.popoverWrap}>
      <div style={cardStyle}>
        <div style={{...styles.caret, left: caretLeft}} aria-hidden />
        {children}
      </div>
    </div>
  );
}

/**
 * Emoji reaction chips. Chips toggle the CURRENT USER (Jonah) on and off;
 * counts and tooltips recompute from the reaction state.
 */
function ReactionChips({
  reactions,
  onToggle,
}: {
  reactions: Reaction[];
  onToggle: (emoji: string) => void;
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
              onClick={() => onToggle(reaction.emoji)}>
              <span aria-hidden>{reaction.emoji}</span>
              <span style={{fontVariantNumeric: 'tabular-nums'}}>
                {reaction.userIds.length}
              </span>
            </button>
          </Tooltip>
        );
      })}
    </HStack>
  );
}

/** One comment: Avatar, name/role/timestamp meta, body (+@mention pill). */
function CommentRow({
  comment,
  onToggleReaction,
}: {
  comment: CommentFixture;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  const author = PEOPLE[comment.author];
  return (
    <HStack gap={2} vAlign="start">
      <Avatar name={author.name} size="xsmall" />
      <StackItem size="fill" style={styles.metaRow}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="label" size="sm">
              {author.name}
            </Text>
            <Text type="supporting" color="secondary">
              {author.role}
            </Text>
            <Text type="supporting" color="secondary">
              <Timestamp value={comment.ts} format="date_time" />
            </Text>
          </HStack>
          <Text size="sm" style={styles.commentBody}>
            {comment.body}
          </Text>
          {comment.mention != null && (
            <HStack gap={1} vAlign="center">
              <Token
                label={\`@\${PEOPLE[comment.mention].name}\`}
                size="sm"
                color="blue"
                icon={<Icon icon={AtSignIcon} size="sm" color="inherit" />}
              />
              <Text type="supporting" color="secondary">
                notified
              </Text>
            </HStack>
          )}
          <ReactionChips
            reactions={comment.reactions}
            onToggle={emoji => onToggleReaction(comment.id, emoji)}
          />
        </VStack>
      </StackItem>
    </HStack>
  );
}

/** One mention-autocomplete candidate row; the active row shows Kbd. */
function MentionRow({person, isActive}: {person: Person; isActive: boolean}) {
  return (
    <HStack
      gap={2}
      vAlign="center"
      style={
        isActive
          ? {...styles.mentionRow, ...styles.mentionRowActive}
          : styles.mentionRow
      }>
      <Avatar name={person.name} size="xsmall" />
      <StackItem size="fill" style={styles.mentionText}>
        <VStack gap={0}>
          <Text size="sm" maxLines={1}>
            {person.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {person.role}
          </Text>
        </VStack>
      </StackItem>
      {isActive && <Kbd keys="enter" />}
    </HStack>
  );
}

// ============= SPECIMEN 01 · OPEN THREAD =============

function OpenThreadSpecimen() {
  const [comments, setComments] = useState(OPEN_THREAD);
  const [draft, setDraft] = useState(REPLY_DRAFT);

  const toggleReaction = (commentId: string, emoji: string) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id !== commentId) {
          return comment;
        }
        return {
          ...comment,
          reactions: comment.reactions.map(reaction => {
            if (reaction.emoji !== emoji) {
              return reaction;
            }
            const hasReacted = reaction.userIds.includes(CURRENT_USER);
            return {
              ...reaction,
              userIds: hasReacted
                ? reaction.userIds.filter(userId => userId !== CURRENT_USER)
                : [...reaction.userIds, CURRENT_USER],
            };
          }),
        };
      }),
    );
  };

  return (
    <Specimen
      stateId="01 · open-thread"
      note="3 comments, @mention pill, reactions; mention autocomplete open.">
      <ExcerptPanel excerpt={EXCERPTS.rollout} tone="open" />
      <PopoverShell caretLeft={64}>
        <HStack gap={2} vAlign="center" style={styles.popoverHeader}>
          <Text type="label" size="sm">
            Thread
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {comments.length} comments
          </Text>
          <StackItem size="fill" />
          <IconButton
            label="Resolve thread"
            tooltip="Resolve"
            size="sm"
            variant="ghost"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
          <IconButton
            label="Thread options"
            tooltip="Options"
            size="sm"
            variant="ghost"
            icon={
              <Icon icon={EllipsisVerticalIcon} size="sm" color="inherit" />
            }
            onClick={() => {}}
          />
        </HStack>
        <Divider />
        <div style={styles.commentList}>
          {comments.map(comment => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onToggleReaction={toggleReaction}
            />
          ))}
        </div>
        <Divider />
        <div style={styles.composer}>
          <div style={styles.mentionFlyout}>
            <VStack gap={0}>
              <div style={styles.mentionRow}>
                <Text type="label" size="sm" color="secondary">
                  People matching “@”
                </Text>
              </div>
              {MENTION_CANDIDATES.map((personId, index) => (
                <MentionRow
                  key={personId}
                  person={PEOPLE[personId]}
                  isActive={index === MENTION_HIGHLIGHT_INDEX}
                />
              ))}
            </VStack>
          </div>
          <HStack gap={2} vAlign="start">
            <Avatar name={PEOPLE[CURRENT_USER].name} size="xsmall" />
            <StackItem size="fill" style={styles.metaRow}>
              <TextArea
                label="Reply to thread"
                isLabelHidden
                rows={2}
                placeholder="Reply…"
                value={draft}
                onChange={setDraft}
              />
            </StackItem>
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Kbd keys="enter" />
            <Text type="supporting" color="secondary">
              insert @Marcus Webb
            </Text>
            <StackItem size="fill" />
            <Button
              label="Reply"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={draft.trim().length === 0}
              onClick={() => setDraft('')}
            />
          </HStack>
        </div>
      </PopoverShell>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · RESOLVED =============

function ResolvedSpecimen() {
  return (
    <Specimen
      stateId="02 · resolved"
      note="Thread collapsed to a checkmark pill with a Reopen affordance.">
      <ExcerptPanel excerpt={EXCERPTS.comms} tone="resolved" />
      <PopoverShell caretLeft={48} isPill>
        <div style={styles.resolvedPill}>
          <span style={styles.resolvedCheck} aria-hidden>
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill" style={styles.metaRow}>
            <VStack gap={0}>
              <Text type="label" size="sm" maxLines={1}>
                Resolved by Sofia Ortiz
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                Jul 15 · 3 comments hidden
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Reopen"
            variant="secondary"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
        </div>
      </PopoverShell>
    </Specimen>
  );
}

// ============= SPECIMEN 03 · NEW COMMENT =============

const FORMATTING_ACTIONS = [
  {id: 'bold', label: 'Bold', icon: BoldIcon},
  {id: 'italic', label: 'Italic', icon: ItalicIcon},
  {id: 'link', label: 'Insert link', icon: LinkIcon},
  {id: 'list', label: 'Bulleted list', icon: ListIcon},
  {id: 'mention', label: 'Mention someone', icon: AtSignIcon},
  {id: 'emoji', label: 'Add emoji', icon: SmilePlusIcon},
] as const;

function NewCommentSpecimen() {
  const [draft, setDraft] = useState('');

  return (
    <Specimen
      stateId="03 · new-comment"
      note="Fresh selection: empty composer with formatting mini-toolbar.">
      <ExcerptPanel excerpt={EXCERPTS.checklist} tone="fresh" />
      <PopoverShell caretLeft={96}>
        <div style={styles.composer}>
          <HStack gap={2} vAlign="start">
            <Avatar name={PEOPLE[CURRENT_USER].name} size="xsmall" />
            <StackItem size="fill" style={styles.metaRow}>
              <TextArea
                label="New comment"
                isLabelHidden
                rows={3}
                placeholder={NEW_COMMENT_PLACEHOLDER}
                value={draft}
                onChange={setDraft}
              />
            </StackItem>
          </HStack>
          <HStack gap={1} vAlign="center" style={styles.toolbarRow}>
            {FORMATTING_ACTIONS.map(action => (
              <IconButton
                key={action.id}
                label={action.label}
                tooltip={action.label}
                size="sm"
                variant="ghost"
                icon={<Icon icon={action.icon} size="sm" color="inherit" />}
                onClick={() => {}}
              />
            ))}
          </HStack>
        </div>
        <Divider />
        <HStack gap={2} vAlign="center" style={styles.footerRow}>
          <Text type="supporting" color="secondary">
            Anchored to “The launch checklist closes Wednesday, Jul 22…”
          </Text>
          <StackItem size="fill" />
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => setDraft('')}
          />
          <Button
            label="Comment"
            size="sm"
            isDisabled={draft.trim().length === 0}
            onClick={() => setDraft('')}
          />
        </HStack>
      </PopoverShell>
    </Specimen>
  );
}

// ============= PAGE =============

export default function CommentThreadPopoverTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={2} hAlign="center">
          <Heading level={1}>Comment thread popover</Heading>
          <Text type="supporting" color="secondary">
            Anchored comment threads over “{DOC_TITLE}” — open, resolved, and
            new-comment states · Kestrel Labs · Atlas Q3
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <OpenThreadSpecimen />
        <ResolvedSpecimen />
        <NewCommentSpecimen />
      </div>
    </div>
  );
}







`;export{e as default};