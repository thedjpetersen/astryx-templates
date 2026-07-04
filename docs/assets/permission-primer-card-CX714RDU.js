var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file permission-primer-card.tsx
 * @input Deterministic fixtures only: three notification benefit rows
 *   (icon, title, one-line supporting copy), the Chirp brand strings, the
 *   faux iOS system-dialog copy ('"Chirp" Would Like to Send You
 *   Notifications'), and fixed microcopy for the accepted / snoozed
 *   states. No clocks, no randomness, no network assets — the
 *   illustration is a pure-CSS gradient blob with a bell glyph.
 * @output Notification Permission Primer — a SMALL centered experience for
 *   the fictional social app Chirp (sunny yellow accent). A phone-width
 *   primer card sits on a subtle stage: gradient-blob illustration with a
 *   bell glyph and an unread-badge accent, 'Never miss a reply' headline,
 *   three benefit bullets with tinted mini icons, a brand-yellow 'Turn on
 *   notifications' primary CTA over a ghost 'Maybe later', and a
 *   fine-print footer ('change anytime in Settings'). Stacked beneath,
 *   labeled 'System prompt follows', a dimmed faux iOS-style system-dialog
 *   specimen shows exactly where the real OS prompt appears (Don't Allow /
 *   Allow). Accepting the primer un-dims the specimen with an accent ring
 *   and swaps the caption to 'System prompt — now showing'; 'Maybe later'
 *   collapses the CTAs into a snoozed note with Undo.
 * @position Block template; emitted by \`astryx template permission-primer-card\`
 *
 * Frame: no app shell — this is an individual small experience. A full-height
 * stage div (subtle muted backdrop with a faint brand-yellow radial wash)
 * grid-centers one column of width min(430px, 100%). The column stacks two
 * captioned specimens: 01 the interactive primer card, 02 the
 * non-interactive system-dialog specimen, joined by a dashed connector.
 *
 * Responsive contract:
 * - Single column at its natural phone width; min(430px, 100%) keeps the
 *   card fully usable at 375px with the stage padding collapsing via
 *   clamp(). Nothing hides or reflows — the experience IS phone-shaped.
 * - Benefit rows and CTA buttons are full-width; text wraps, never clips.
 * - Both hand-rolled CTAs are >=44px tall tap targets; the specimen dialog
 *   is intentionally non-interactive (divs, nothing focusable).
 *
 * Container policy (small-experience archetype): the primer card and the
 * dialog specimen are bespoke token-styled surfaces (radius, border, and
 * shadow from tokens) so the illustration can bleed to the card edges;
 * design-system Text/Heading/Icon/Badge supply typography and glyphs, and
 * the CTAs are hand-rolled <button>s in the repo style-object idiom (the
 * established pattern for brand-fill CTAs, per vacation-rental-listing).
 *
 * Color policy: ONE brand accent — Chirp sunny yellow.
 *   BRAND_ACCENT light-dark(#B45309, #FCD34D) for icon tints, the wordmark,
 *   and the accent ring (amber-700 clears AA on light surfaces; amber-300
 *   on dark). The CTA fill is the sunny #FACC15 in both schemes with
 *   explicit near-black text (#422006, ~10:1) because no yellow clears AA
 *   under white text. The illustration blob is a fixed yellow-to-amber
 *   gradient (documented stand-in artwork). The faux iOS dialog uses
 *   explicit light-dark() OS-chrome literals for its translucent surface
 *   and hairlines, and the token var(--color-accent) for its Allow /
 *   Don't Allow labels — deliberately the platform accent, NOT the brand
 *   yellow, so the specimen reads as the OS speaking. Everything else is
 *   token-pure.
 *
 * Fixture policy: fixed strings only; no Date construction, no randomness.
 */

import {useState, type CSSProperties} from 'react';

import {
  AtSignIcon,
  BellRingIcon,
  BirdIcon,
  CheckIcon,
  HeartIcon,
  MessageCircleIcon,
  Undo2Icon,
} from 'lucide-react';

import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Heading, Text} from '@astryxdesign/core/Text';

// ============= BRAND =============
// Chirp sunny yellow — the ONE brand accent for this template (§5.1).
// Light side amber-700 (AA on light surfaces), dark side amber-300.
const BRAND_ACCENT = 'light-dark(#B45309, #FCD34D)';
// Tinted fills only (benefit icon chips, stage wash).
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(250, 204, 21, 0.22), rgba(250, 204, 21, 0.14))';
// CTA fill: the sunny yellow itself, both schemes; text is a fixed
// near-black amber-950 literal — #FACC15 vs #422006 is ~10.4:1.
const BRAND_CTA_FILL = '#FACC15';
const BRAND_ON_CTA = '#422006';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // ----- Stage: full-height muted backdrop with a faint brand wash; the
  // column grid-centers at its natural phone width.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    display: 'grid',
    placeItems: 'center',
    padding: 'clamp(var(--spacing-3), 4vw, var(--spacing-8))',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage:
      'radial-gradient(560px 380px at 50% 8%,' +
      ' light-dark(rgba(250, 204, 21, 0.14), rgba(250, 204, 21, 0.07)) 0%,' +
      ' transparent 70%)',
  },
  column: {
    width: 'min(430px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // Specimen caption row: numbered dot + mono label, per the gallery idiom.
  captionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-1)',
  },
  captionDot: {
    width: 18,
    height: 18,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'var(--font-family-code, monospace)',
  },
  captionLabel: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 11,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Dashed connector between the primer card and the system specimen.
  connector: {
    width: 0,
    height: 20,
    marginInline: 'auto',
    borderInlineStart: '2px dashed var(--color-border)',
  },
  // ----- Primer card: bespoke surface so the illustration bleeds to the
  // edges; radius/border/shadow from tokens.
  card: {
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  // Illustration area: warm wash backdrop, gradient blob, bell glyph.
  illustration: {
    position: 'relative',
    height: 148,
    backgroundColor: 'light-dark(#FEFCE8, rgba(250, 204, 21, 0.06))',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  brandRow: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    insetInlineStart: 'var(--spacing-3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    color: BRAND_ACCENT,
  },
  brandWordmark: {
    fontWeight: 800,
    fontSize: 15,
    letterSpacing: '-0.01em',
    color: BRAND_ACCENT,
  },
  // The blob is fixed stand-in artwork: same yellow→amber gradient in both
  // schemes (documented in the header Color policy).
  blob: {
    position: 'absolute',
    insetInlineStart: '50%',
    top: 22,
    width: 128,
    height: 108,
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #FDE047 0%, #FACC15 45%, #F59E0B 100%)',
    borderRadius: '58% 42% 55% 45% / 52% 48% 60% 40%',
    boxShadow: '0 10px 24px rgba(245, 158, 11, 0.35)',
  },
  blobEcho: {
    position: 'absolute',
    insetInlineStart: 'calc(50% - 92px)',
    top: 52,
    width: 44,
    height: 40,
    background: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
    borderRadius: '55% 45% 48% 52% / 50% 55% 45% 50%',
    opacity: 0.8,
  },
  blobEchoEnd: {
    position: 'absolute',
    insetInlineStart: 'calc(50% + 58px)',
    top: 34,
    width: 30,
    height: 28,
    background: 'linear-gradient(135deg, #FDE68A 0%, #FBBF24 100%)',
    borderRadius: '48% 52% 55% 45% / 55% 45% 52% 48%',
    opacity: 0.7,
  },
  // Bell glyph disc centered on the blob; unread badge pinned to its corner.
  bellDisc: {
    position: 'absolute',
    insetInlineStart: '50%',
    top: 46,
    transform: 'translateX(-50%)',
    width: 60,
    height: 60,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: 'light-dark(#FFFFFF, #FFFBEB)',
    color: '#B45309',
    boxShadow: '0 4px 12px rgba(120, 53, 15, 0.28)',
  },
  bellBadge: {
    position: 'absolute',
    insetInlineStart: 'calc(50% + 14px)',
    top: 40,
  },
  // ----- Card body: headline, benefits, CTAs, fine print.
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-5)',
  },
  headlineBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    textAlign: 'center',
  },
  benefitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  benefitRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
  },
  benefitIconChip: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
  },
  benefitText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  ctaStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Hand-rolled brand CTA (see Container policy): sunny fill, near-black
  // text, >=44px tap target. Inline styles keep the default focus outline.
  ctaPrimary: {
    appearance: 'none',
    border: 'none',
    width: '100%',
    minHeight: 46,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    backgroundColor: BRAND_CTA_FILL,
    color: BRAND_ON_CTA,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
  },
  ctaPrimaryDone: {
    cursor: 'default',
    boxShadow: 'none',
  },
  ctaGhost: {
    appearance: 'none',
    border: 'none',
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  // Snoozed note replaces the CTA stack; Undo is a small inline button.
  stateNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  stateNoteText: {minWidth: 0, flex: 1},
  undoButton: {
    appearance: 'none',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 10,
    minHeight: 36,
    paddingInline: 'var(--spacing-3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    flexShrink: 0,
  },
  finePrint: {textAlign: 'center'},
  // ----- System-dialog specimen: dimmed until the primer is accepted.
  // The wash stands in for the OS dimming the app behind the real prompt.
  specimenWrap: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor:
      'light-dark(rgba(28, 25, 23, 0.06), rgba(0, 0, 0, 0.28))',
    padding: 'var(--spacing-5) var(--spacing-4)',
    display: 'grid',
    placeItems: 'center',
    // 0.7 keeps the pre-accept dim readable: the dialog labels stay >=4.5:1
    // AA in both schemes (0.55 dropped them to ~4.2–4.4).
    opacity: 0.7,
    filter: 'grayscale(0.25)',
    transition: 'opacity 200ms ease, filter 200ms ease, box-shadow 200ms ease',
  },
  specimenWrapActive: {
    opacity: 1,
    filter: 'none',
    boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`,
  },
  // Faux iOS alert: explicit OS-chrome light-dark literals (Color policy);
  // labels use the platform token var(--color-accent), not brand yellow.
  iosAlert: {
    width: 'min(270px, 100%)',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor:
      'light-dark(rgba(249, 249, 249, 0.97), rgba(44, 44, 46, 0.97))',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.30)',
    textAlign: 'center',
  },
  iosAlertBody: {
    padding: '18px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  iosAlertTitle: {
    fontSize: 15,
    fontWeight: 650,
    lineHeight: 1.28,
    color: 'light-dark(#111111, #FFFFFF)',
  },
  iosAlertText: {
    fontSize: 12.5,
    lineHeight: 1.35,
    // Light side a touch darker than iOS's #3C3C43 so the 12.5px body copy
    // still clears 4.5:1 AA under the specimen's 0.7 pre-accept dim.
    color: 'light-dark(#2F2F37, #EBEBF5)',
  },
  iosButtonRow: {
    display: 'flex',
    borderTop:
      '0.5px solid light-dark(rgba(60, 60, 67, 0.29), rgba(84, 84, 88, 0.65))',
  },
  // Non-interactive by design: these are divs, not buttons (specimen).
  iosButton: {
    flex: 1,
    minHeight: 42,
    display: 'grid',
    placeItems: 'center',
    fontSize: 15,
    color: 'var(--color-accent)',
  },
  iosButtonDivider: {
    width: 0.5,
    backgroundColor:
      'light-dark(rgba(60, 60, 67, 0.29), rgba(84, 84, 88, 0.65))',
    flexShrink: 0,
  },
  iosButtonStrong: {fontWeight: 650},
  // Visually hidden live region for state announcements.
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ============= FIXTURES =============
// Fixed strings only — no clocks, no randomness.

type PrimerChoice = 'undecided' | 'accepted' | 'snoozed';

interface Benefit {
  id: string;
  icon: typeof MessageCircleIcon;
  title: string;
  copy: string;
}

const BENEFITS: Benefit[] = [
  {
    id: 'replies',
    icon: MessageCircleIcon,
    title: 'Replies to your chirps',
    copy: 'Know the moment someone chirps back — no refresh loops.',
  },
  {
    id: 'mentions',
    icon: AtSignIcon,
    title: 'Mentions & tags',
    copy: 'When friends loop you into a thread, you hear about it first.',
  },
  {
    id: 'likes',
    icon: HeartIcon,
    title: 'Likes as one daily digest',
    copy: 'A single 6:00 PM summary — never one buzz per like.',
  },
];

const COPY = {
  headline: 'Never miss a reply',
  subhead: 'Chirp can nudge you when the flock responds. Here is exactly what you would get:',
  ctaPrimary: 'Turn on notifications',
  ctaPrimaryDone: 'Notifications on',
  ctaGhost: 'Maybe later',
  finePrint: 'You can change this anytime in Settings › Notifications.',
  snoozedNote: 'No problem — we’ll ask again after your next reply.',
  acceptedNote:
    'iOS takes it from here: permission is only granted in the system prompt below.',
  captionPrimer: '01 · in-app primer',
  captionDialog: '02 · system prompt follows',
  captionDialogActive: '02 · system prompt — now showing',
  dialogTitle: '“Chirp” Would Like to Send You Notifications',
  dialogBody:
    'Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.',
  dialogDeny: 'Don’t Allow',
  dialogAllow: 'Allow',
  specimenAria:
    'Specimen of the iOS system permission dialog. It is not interactive.',
} as const;

// ============= PIECES =============

/** Numbered mono caption above each specimen (gallery idiom). */
function CaptionLabel({index, label}: {index: string; label: string}) {
  return (
    <div style={styles.captionRow}>
      <span style={styles.captionDot} aria-hidden="true">
        {index}
      </span>
      <span style={styles.captionLabel}>{label}</span>
    </div>
  );
}

/**
 * Pure-CSS illustration: warm wash, gradient blob with two echo blobs,
 * a white bell disc, and an unread-count Badge pinned to its corner.
 * Decorative only — hidden from the accessibility tree.
 */
function IllustrationBlob() {
  return (
    <div style={styles.illustration} aria-hidden="true">
      <div style={styles.brandRow}>
        <Icon icon={BirdIcon} size="sm" color="inherit" />
        <span style={styles.brandWordmark}>Chirp</span>
      </div>
      <div style={styles.blobEcho} />
      <div style={styles.blobEchoEnd} />
      <div style={styles.blob} />
      <div style={styles.bellDisc}>
        <Icon icon={BellRingIcon} size="lg" color="inherit" />
      </div>
      <div style={styles.bellBadge}>
        <Badge label="3" variant="error" />
      </div>
    </div>
  );
}

/** One benefit bullet: tinted mini icon chip + title + supporting copy. */
function BenefitRow({benefit}: {benefit: Benefit}) {
  return (
    <li style={styles.benefitRow}>
      <div style={styles.benefitIconChip} aria-hidden="true">
        <Icon icon={benefit.icon} size="sm" color="inherit" />
      </div>
      <div style={styles.benefitText}>
        <Text type="label" size="sm">
          {benefit.title}
        </Text>
        <Text type="supporting" color="secondary">
          {benefit.copy}
        </Text>
      </div>
    </li>
  );
}

/**
 * CTA block: three mutually exclusive renders driven by the choice state.
 * - undecided: brand primary + ghost 'Maybe later'
 * - accepted:  primary flips to a checked done state (ghost hidden) plus a
 *              note pointing at the system specimen below
 * - snoozed:   CTAs collapse into a note with an Undo button
 */
function CtaBlock({
  choice,
  onAccept,
  onSnooze,
  onUndo,
}: {
  choice: PrimerChoice;
  onAccept: () => void;
  onSnooze: () => void;
  onUndo: () => void;
}) {
  if (choice === 'snoozed') {
    return (
      <div style={styles.stateNote}>
        <div style={styles.stateNoteText}>
          <Text type="supporting" color="secondary">
            {COPY.snoozedNote}
          </Text>
        </div>
        <button type="button" style={styles.undoButton} onClick={onUndo}>
          <Icon icon={Undo2Icon} size="sm" color="inherit" />
          Undo
        </button>
      </div>
    );
  }

  const isAccepted = choice === 'accepted';
  return (
    <div style={styles.ctaStack}>
      <button
        type="button"
        style={
          isAccepted
            ? {...styles.ctaPrimary, ...styles.ctaPrimaryDone}
            : styles.ctaPrimary
        }
        onClick={isAccepted ? undefined : onAccept}
        aria-disabled={isAccepted || undefined}>
        {isAccepted ? (
          <Icon icon={CheckIcon} size="sm" color="inherit" />
        ) : (
          <Icon icon={BellRingIcon} size="sm" color="inherit" />
        )}
        {isAccepted ? COPY.ctaPrimaryDone : COPY.ctaPrimary}
      </button>
      {isAccepted ? (
        <div style={styles.stateNote}>
          <div style={styles.stateNoteText}>
            <Text type="supporting" color="secondary">
              {COPY.acceptedNote}
            </Text>
          </div>
        </div>
      ) : (
        <button type="button" style={styles.ctaGhost} onClick={onSnooze}>
          {COPY.ctaGhost}
        </button>
      )}
    </div>
  );
}

/** The interactive primer card: illustration, headline, bullets, CTAs. */
function PrimerCard({
  choice,
  onAccept,
  onSnooze,
  onUndo,
}: {
  choice: PrimerChoice;
  onAccept: () => void;
  onSnooze: () => void;
  onUndo: () => void;
}) {
  return (
    <section style={styles.card} aria-label="Chirp notification primer">
      <IllustrationBlob />
      <div style={styles.body}>
        <div style={styles.headlineBlock}>
          <Heading level={2}>{COPY.headline}</Heading>
          <Text type="supporting" color="secondary">
            {COPY.subhead}
          </Text>
        </div>
        <ul style={styles.benefitList}>
          {BENEFITS.map(benefit => (
            <BenefitRow key={benefit.id} benefit={benefit} />
          ))}
        </ul>
        <CtaBlock
          choice={choice}
          onAccept={onAccept}
          onSnooze={onSnooze}
          onUndo={onUndo}
        />
        <div style={styles.finePrint}>
          <Text type="supporting" color="secondary">
            {COPY.finePrint}
          </Text>
        </div>
      </div>
    </section>
  );
}

/**
 * Faux iOS system-dialog specimen. Deliberately NON-interactive: the
 * "buttons" are divs so nothing here is focusable — the point of the
 * primer pattern is that only the OS can grant permission. Dimmed until
 * the primer is accepted, then un-dimmed with a brand accent ring.
 */
function SystemDialogSpecimen({isActive}: {isActive: boolean}) {
  return (
    <div
      role="img"
      aria-label={COPY.specimenAria}
      style={
        isActive
          ? {...styles.specimenWrap, ...styles.specimenWrapActive}
          : styles.specimenWrap
      }>
      <div style={styles.iosAlert} aria-hidden="true">
        <div style={styles.iosAlertBody}>
          <div style={styles.iosAlertTitle}>{COPY.dialogTitle}</div>
          <div style={styles.iosAlertText}>{COPY.dialogBody}</div>
        </div>
        <div style={styles.iosButtonRow}>
          <div style={styles.iosButton}>{COPY.dialogDeny}</div>
          <div style={styles.iosButtonDivider} />
          <div style={{...styles.iosButton, ...styles.iosButtonStrong}}>
            {COPY.dialogAllow}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function PermissionPrimerCardTemplate() {
  const [choice, setChoice] = useState<PrimerChoice>('undecided');

  const isAccepted = choice === 'accepted';
  const liveMessage =
    choice === 'accepted'
      ? 'Notifications turned on. The system prompt appears next.'
      : choice === 'snoozed'
        ? 'Snoozed. Chirp will ask again later.'
        : '';

  return (
    <div style={styles.stage}>
      <div style={styles.column}>
        <CaptionLabel index="1" label={COPY.captionPrimer} />
        <PrimerCard
          choice={choice}
          onAccept={() => setChoice('accepted')}
          onSnooze={() => setChoice('snoozed')}
          onUndo={() => setChoice('undecided')}
        />
        <div style={styles.connector} aria-hidden="true" />
        <CaptionLabel
          index="2"
          label={isAccepted ? COPY.captionDialogActive : COPY.captionDialog}
        />
        <SystemDialogSpecimen isActive={isAccepted} />
        <div style={styles.visuallyHidden} aria-live="polite">
          {liveMessage}
        </div>
      </div>
    </div>
  );
}
`;export{e as default};