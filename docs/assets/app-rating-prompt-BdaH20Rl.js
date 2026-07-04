var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file app-rating-prompt.tsx
 * @input Deterministic fixtures only: one fictional journaling app,
 *   "Fable Ink" (plum accent), a fixed 5-item star-label ladder
 *   ('Not great' → 'Love it'), three feedback category chips
 *   (Bugs / Missing feature / Confusing), and fixed prompt copy for the
 *   ask, low-rating, and high-rating branches. No clocks, no randomness,
 *   no network assets.
 * @output In-App Rating Flow — three side-by-side specimens of the same
 *   Fable Ink rate-us card, each frozen at a different point in the flow:
 *   specimen 01 is the initial ask ('Enjoying Fable Ink?') with five
 *   tappable stars shown in a 4-star hover-preview state and a Not-now
 *   link; specimen 02 is the low-rating branch (3 stars selected) with a
 *   revealed feedback textarea, toggleable category chips, and a plum
 *   Send-feedback button; specimen 03 is the high-rating branch (5 stars)
 *   with the 'mind leaving a review?' ask, a plum store CTA, and a Maybe
 *   later link. Each card is live: tapping stars re-branches it
 *   (1–3 → feedback form, 4–5 → review ask), chips toggle, send/dismiss
 *   resolve into confirmation states. Mono caption labels sit UNDER each
 *   specimen.
 * @position Block template; emitted by \`astryx template app-rating-prompt\`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE. A
 * full-bleed stage div (minHeight 100dvh, token muted wash with one soft
 * plum radial tint) centers a small header and a wrapping specimen row;
 * each specimen is a 360px-wide prompt card (the width the card would
 * have inside a ~390px phone viewport) with its mono caption row BELOW
 * the card. All three cards share one RatingPromptCard component seeded
 * with different initial state, so geometry stays registered across
 * specimens.
 *
 * Responsive contract:
 * - >=1200px: the three specimens sit side by side, top-aligned, centered.
 * - <1200px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); each card keeps width:min(360px, 100%) so nothing clips at
 *   375px.
 * - Stars are 44px tap targets; chips and buttons are >=36px tall with
 *   full-width primary CTAs. Hover preview is mouse-only sugar
 *   (onMouseEnter/Leave); taps drive every state change, so touch never
 *   strands functionality.
 *
 * Container policy (specimen-gallery archetype): the prompt card, star
 * buttons, category chips, and brand CTAs are hand-rolled buttons/divs in
 * the repo style-object idiom because they are the product's in-app
 * dialog chrome — no design-system Cards. Astryx supplies text primitives
 * (Heading, Text), stacks, Icon, and the feedback TextArea.
 *
 * Color policy: ONE brand accent — Fable Ink plum,
 * light-dark(#86198F, #E879F9) — used for the wordmark feather, filled
 * stars (hover preview at reduced opacity), selected category chips, and
 * the primary CTAs; text on the accent uses the paired ON_ACCENT literal
 * (white on deep plum in light, near-black plum in dark; both AA). The
 * stage adds one ACCENT_SOFT radial tint over the token muted background.
 * Everything else — card surfaces, borders, text, empty stars — stays
 * token-pure so both schemes work.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {TextArea} from '@astryxdesign/core/TextArea';
import {
  CheckIcon,
  FeatherIcon,
  HeartIcon,
  SendIcon,
  StarIcon,
  StoreIcon,
  XIcon,
} from 'lucide-react';

// ============= BRAND CONSTANTS =============
// Fable Ink: token-pure card on a muted stage; ONE plum accent.

const ACCENT = 'light-dark(#86198F, #E879F9)';
const ACCENT_SOFT = 'light-dark(rgba(134,25,143,0.10), rgba(232,121,249,0.14))';
const ON_ACCENT = 'light-dark(#FFFFFF, #2E0431)';

// ============= FIXTURES =============
// Fixed copy; the star ladder drives both the hover preview line and the
// post-select branch (1–3 → feedback, 4–5 → review ask).

const STAR_LABELS = [
  'Not great',
  'Could be better',
  "It's okay",
  'Really good',
  'Love it',
] as const;

const HIGH_RATING_THRESHOLD = 4;

const FEEDBACK_CATEGORIES = [
  {id: 'bugs', label: 'Bugs'},
  {id: 'missing', label: 'Missing feature'},
  {id: 'confusing', label: 'Confusing'},
] as const;

type CategoryId = (typeof FEEDBACK_CATEGORIES)[number]['id'];

const ASK_TITLE = 'Enjoying Fable Ink?';
const ASK_SUBTITLE = '14 entries this month — that’s a streak worth keeping.';
const LOW_TITLE = 'Thanks for being honest.';
const LOW_SUBTITLE = 'What could we do better?';
const FEEDBACK_PLACEHOLDER =
  'Tell us what got in the way — a bug, a missing tool, anything…';
const HIGH_TITLE = 'Glad the ink is flowing!';
const HIGH_SUBTITLE = 'Mind leaving a quick review? It helps other journalers find us.';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with one soft plum radial tint; centers everything.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: \`radial-gradient(1100px 460px at 50% -80px, \${ACCENT_SOFT}, transparent 70%)\`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 560},
  // Specimen row: three cards side by side, wrapping to a column.
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  specimen: {
    width: 'min(360px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // Caption row sits UNDER each card: mono id chip + one-line note.
  captionRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-1)',
  },
  captionId: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    backgroundColor: ACCENT_SOFT,
    borderRadius: 6,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    whiteSpace: 'nowrap',
  },
  // The rate-us prompt card: in-app dialog chrome, token-pure surface.
  promptCard: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 20,
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    flexShrink: 0,
  },
  wordmark: {
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.06em',
    color: 'var(--color-text-primary, inherit)',
  },
  dismissButton: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    padding: 0,
  },
  promptBody: {textAlign: 'center', paddingBlock: 'var(--spacing-1)'},
  // Star row: five 44px tap targets; fill color carries the state.
  starRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--spacing-1)',
  },
  starButton: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    padding: 0,
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  starFilled: {color: ACCENT},
  starHovered: {color: ACCENT, opacity: 0.45},
  starHint: {
    textAlign: 'center',
    minHeight: 18,
  },
  // Category chips: toggleable pills; selected = plum tint + plum text.
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
  },
  chip: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    minHeight: 36,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  chipSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  // Primary plum CTA (Send feedback / store button): full width, 44px.
  primaryCta: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
    border: 'none',
    backgroundColor: ACCENT,
    color: ON_ACCENT,
    fontSize: 14,
    fontWeight: 700,
    paddingInline: 'var(--spacing-3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
  },
  primaryCtaDisabled: {
    cursor: 'default',
    opacity: 0.45,
  },
  // Quiet text link (Not now / Maybe later): centered, secondary color.
  quietLink: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    minHeight: 36,
    paddingInline: 'var(--spacing-3)',
    borderRadius: 8,
    alignSelf: 'center',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  // Resolved states (feedback sent / snoozed): tinted confirmation strip.
  resolvedStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    borderRadius: 12,
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-3)',
    textAlign: 'center',
  },
  resolvedText: {fontSize: 13, fontWeight: 600},
  charCount: {textAlign: 'end'},
};

// ============= STAR ROW =============

/**
 * Five 44px star buttons. Fill precedence per star: selected (solid plum)
 * beats hover preview (plum at 45% opacity) beats empty (secondary
 * outline). Hover is mouse-only sugar; taps drive selection everywhere.
 */
function StarRow({
  rating,
  hovered,
  onSelect,
  onHover,
}: {
  rating: number;
  hovered: number;
  onSelect: (value: number) => void;
  onHover: (value: number) => void;
}) {
  return (
    <div
      style={styles.starRow}
      role="radiogroup"
      aria-label="Rate Fable Ink from 1 to 5 stars"
      onMouseLeave={() => onHover(0)}>
      {STAR_LABELS.map((label, index) => {
        const value = index + 1;
        const isSelected = rating > 0 && value <= rating;
        const isHoverPreview = rating === 0 && hovered > 0 && value <= hovered;
        const starStyle = isSelected
          ? {...styles.starButton, ...styles.starFilled}
          : isHoverPreview
            ? {...styles.starButton, ...styles.starHovered}
            : styles.starButton;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={\`\${value} star\${value === 1 ? '' : 's'} — \${label}\`}
            style={starStyle}
            onClick={() => onSelect(value)}
            onMouseEnter={() => onHover(value)}>
            <StarIcon
              size={28}
              aria-hidden="true"
              fill={isSelected || isHoverPreview ? 'currentColor' : 'none'}
              strokeWidth={isSelected || isHoverPreview ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

// ============= BRANCH BODIES =============

/**
 * Low-rating branch (1–3 stars): revealed feedback textarea, toggleable
 * category chips, and the plum Send button. Sending resolves the card
 * into a tinted confirmation strip.
 */
function LowRatingBranch({
  rating,
  initialCategories,
}: {
  rating: number;
  initialCategories: readonly CategoryId[];
}) {
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<ReadonlySet<CategoryId>>(
    () => new Set(initialCategories),
  );
  const [isSent, setIsSent] = useState(false);

  const toggleCategory = (id: CategoryId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canSend = note.trim().length > 0 || selected.size > 0;

  if (isSent) {
    return (
      <div style={styles.resolvedStrip}>
        <CheckIcon size={16} aria-hidden="true" />
        <span style={styles.resolvedText}>
          Thanks — your notes went straight to the studio.
        </span>
      </div>
    );
  }

  return (
    <VStack gap={3}>
      <div style={styles.promptBody}>
        <VStack gap={1}>
          <Heading level={3} accessibilityLevel={2}>
            {LOW_TITLE}
          </Heading>
          <Text type="supporting" color="secondary">
            {LOW_SUBTITLE}
          </Text>
        </VStack>
      </div>
      <div style={styles.chipRow}>
        {FEEDBACK_CATEGORIES.map(category => {
          const isOn = selected.has(category.id);
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isOn}
              style={
                isOn ? {...styles.chip, ...styles.chipSelected} : styles.chip
              }
              onClick={() => toggleCategory(category.id)}>
              {isOn ? <CheckIcon size={14} aria-hidden="true" /> : null}
              {category.label}
            </button>
          );
        })}
      </div>
      <TextArea
        label={\`What could be better after a \${rating}-star rating\`}
        isLabelHidden
        rows={3}
        placeholder={FEEDBACK_PLACEHOLDER}
        value={note}
        onChange={setNote}
      />
      <button
        type="button"
        disabled={!canSend}
        style={
          canSend
            ? styles.primaryCta
            : {...styles.primaryCta, ...styles.primaryCtaDisabled}
        }
        onClick={() => setIsSent(true)}>
        <SendIcon size={16} aria-hidden="true" />
        Send feedback
      </button>
    </VStack>
  );
}

/**
 * High-rating branch (4–5 stars): the review ask — plum store CTA plus a
 * Maybe-later link that resolves into a snoozed confirmation strip.
 */
function HighRatingBranch() {
  const [resolution, setResolution] = useState<'open' | 'store' | 'later'>(
    'open',
  );

  if (resolution !== 'open') {
    return (
      <div style={styles.resolvedStrip}>
        {resolution === 'store' ? (
          <HeartIcon size={16} aria-hidden="true" fill="currentColor" />
        ) : (
          <CheckIcon size={16} aria-hidden="true" />
        )}
        <span style={styles.resolvedText}>
          {resolution === 'store'
            ? 'Opening the store review sheet — thank you!'
            : 'No problem — we’ll check in another time.'}
        </span>
      </div>
    );
  }

  return (
    <VStack gap={3}>
      <div style={styles.promptBody}>
        <VStack gap={1}>
          <Heading level={3} accessibilityLevel={2}>
            {HIGH_TITLE}
          </Heading>
          <Text type="supporting" color="secondary">
            {HIGH_SUBTITLE}
          </Text>
        </VStack>
      </div>
      <button
        type="button"
        style={styles.primaryCta}
        onClick={() => setResolution('store')}>
        <StoreIcon size={16} aria-hidden="true" />
        Rate Fable Ink on the store
      </button>
      <button
        type="button"
        style={styles.quietLink}
        onClick={() => setResolution('later')}>
        Maybe later
      </button>
    </VStack>
  );
}

// ============= PROMPT CARD =============

/**
 * The whole rate-us card. One component powers all three specimens: the
 * seeded rating decides the branch (0 → ask, 1–3 → feedback form,
 * 4–5 → review ask), and tapping stars re-branches the card live.
 * \`initialHovered\` freezes specimen 01 in its 4-star hover preview until
 * a real pointer takes over.
 */
function RatingPromptCard({
  initialRating = 0,
  initialHovered = 0,
  initialCategories = [],
}: {
  initialRating?: number;
  initialHovered?: number;
  initialCategories?: readonly CategoryId[];
}) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(initialHovered);
  const [isDismissed, setIsDismissed] = useState(false);

  const previewValue = rating > 0 ? rating : hovered;
  const hintLabel =
    previewValue > 0 ? STAR_LABELS[previewValue - 1] : 'Tap a star to rate';

  if (isDismissed) {
    return (
      <div style={styles.promptCard}>
        <div style={styles.resolvedStrip}>
          <CheckIcon size={16} aria-hidden="true" />
          <span style={styles.resolvedText}>
            Dismissed — Fable Ink won’t ask again this month.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.promptCard}>
      <HStack gap={2} vAlign="center">
        <span style={styles.brandMark} aria-hidden="true">
          <Icon icon={FeatherIcon} size="sm" color="inherit" />
        </span>
        <span style={styles.wordmark}>Fable Ink</span>
        <StackItem size="fill" />
        <button
          type="button"
          aria-label="Dismiss rating prompt"
          style={styles.dismissButton}
          onClick={() => setIsDismissed(true)}>
          <XIcon size={16} aria-hidden="true" />
        </button>
      </HStack>
      {rating === 0 ? (
        <div style={styles.promptBody}>
          <VStack gap={1}>
            <Heading level={3} accessibilityLevel={2}>
              {ASK_TITLE}
            </Heading>
            <Text type="supporting" color="secondary">
              {ASK_SUBTITLE}
            </Text>
          </VStack>
        </div>
      ) : null}
      <StarRow
        rating={rating}
        hovered={hovered}
        onSelect={setRating}
        onHover={setHovered}
      />
      <div style={styles.starHint}>
        <Text type="supporting" color={previewValue > 0 ? undefined : 'secondary'}>
          {previewValue > 0 ? \`\${previewValue} — \${hintLabel}\` : hintLabel}
        </Text>
      </div>
      {rating === 0 ? (
        <button
          type="button"
          style={styles.quietLink}
          onClick={() => setIsDismissed(true)}>
          Not now
        </button>
      ) : rating < HIGH_RATING_THRESHOLD ? (
        <LowRatingBranch rating={rating} initialCategories={initialCategories} />
      ) : (
        <HighRatingBranch />
      )}
    </div>
  );
}

// ============= SPECIMEN WRAPPER =============

/**
 * A specimen column: the prompt card with its mono caption row BELOW it,
 * per the flow-gallery idiom (labels never crowd the card's own header).
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
      {children}
      <div style={styles.captionRow}>
        <span style={styles.captionId}>{stateId}</span>
        <Text type="supporting" color="secondary">
          {note}
        </Text>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function AppRatingPromptTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>
            Fable Ink — in-app rating flow
          </Heading>
          <Text type="supporting" color="secondary">
            Three live specimens of one rate-us card: the initial ask, the
            low-rating feedback branch, and the high-rating review ask.
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <Specimen
          stateId="01 · initial ask"
          note="Resting ask; 4-star hover preview, Not-now escape hatch.">
          <RatingPromptCard initialHovered={4} />
        </Specimen>
        <Specimen
          stateId="02 · low rating"
          note="3 stars reveals the feedback form: chips + optional note.">
          <RatingPromptCard initialRating={3} initialCategories={['missing']} />
        </Specimen>
        <Specimen
          stateId="03 · high rating"
          note="5 stars asks for a store review, with a Maybe-later out.">
          <RatingPromptCard initialRating={5} />
        </Specimen>
      </div>
    </div>
  );
}
`;export{e as default};