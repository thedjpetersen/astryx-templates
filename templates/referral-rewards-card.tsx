// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (referral code PERCH-JULE30; four
 *   invited friends — Maya Torres and Priya Shah joined in late June /
 *   early July 2026, Ben Okafor pending with a Jul 15 expiry, Lena
 *   Fischer's invite expired Jun 19; $30-per-friend reward math with a
 *   3-friend tier target and a $25 tier bonus; a literal 22-entry
 *   confetti-dot table for the celebration card — no clocks, no
 *   randomness, no network assets)
 * @output Referral & Rewards card for Perch, a fictional consumer bank:
 *   a phone-width card with the Perch wordmark, a "$30 for you, $30 for
 *   them" headline, a dashed referral-code pill with a copy button that
 *   pops a transient "Copied to clipboard" toast chip, a tier progress
 *   meter (2 of 3 friends joined, $60 earned, +$25 bonus at 3), an
 *   invited-friends list with Joined/Pending/Expired status chips and a
 *   Nudge action on the pending row, a share row (Message / Email / More
 *   icon buttons), and a referral-terms link. A second specimen freezes
 *   the reward-unlocked celebration state: confetti-dot pattern over the
 *   card, 3-of-3 recap, a reconciling earnings breakdown (3 × $30 = $90 +
 *   $25 bonus = $115), and a brand-teal "Claim $25 bonus" button with a
 *   claimed confirmation state.
 * @position Page template; emitted by `astryx template referral-rewards-card`
 *
 * Frame: no app shell — this is an individual SMALL experience. A full-
 * height stage div (muted token background, centered flex row) presents
 * two phone-width specimen columns (maxWidth 400) at natural size, each
 * under a mono state-id Token caption per the composer-state-gallery
 * specimen idiom.
 *
 * Responsive contract:
 * - >=880px: the two specimens sit side by side, top-aligned, centered on
 *   the stage with a token gap.
 * - <880px the flexWrap row stacks them vertically; each column keeps
 *   width 100% / maxWidth 400 down to 320px with no horizontal scroll.
 * - The copied-toast slot reserves fixed height so the chip never shifts
 *   layout; share buttons are 44px targets; no hover-only interactions
 *   (copy, nudge, and claim are all tap/Enter buttons).
 *
 * Container policy (small-card archetype): each specimen is a design-
 * system Card — this IS a card widget, not an app shell. Inside, plain
 * token-styled rows and bands; the earnings breakdown is a muted inset
 * block, not a nested Card.
 *
 * Color policy: ONE brand accent — Perch teal, light-dark(#0F766E,
 * #2DD4BF) with an ON_ACCENT ink pair for text on solid accent. It is
 * spent on the brand mark, the referral-code pill tint/border, the meter
 * fill (via a scoped --color-accent re-pin), the celebration gift disc,
 * and the claim CTA. Confetti dots use the brand teal plus data-viz
 * categorical tokens WITH their repo-standard light-dark fallbacks
 * (decorative, aria-hidden). Everything else is token-pure so both
 * schemes pass AA; no scheme-locked surfaces.
 *
 * Fixture reconciliation: the meter's "2 of 3 joined · $60 earned"
 * matches exactly two Joined rows at $30 each in the list below (the
 * pending and expired rows earn $0), and the celebration total is
 * 3 × $30 + $25 = $115. The friends list carries four rows (two joined,
 * one pending, one expired) so every repeated number agrees.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Token} from '@astryxdesign/core/Token';
import {
  BellRingIcon,
  BirdIcon,
  CheckIcon,
  CopyIcon,
  GiftIcon,
  MailIcon,
  MessageCircleIcon,
  PartyPopperIcon,
  Share2Icon,
} from 'lucide-react';

// ============= BRAND =============
// Perch teal — the ONE brand accent (see Color policy above).

const BRAND_ACCENT = 'light-dark(#0F766E, #2DD4BF)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(15,118,110,0.10), rgba(45,212,191,0.14))';
/** Ink on solid accent: white on deep teal, near-black on bright teal. */
const ON_ACCENT = 'light-dark(#FFFFFF, #042F2E)';
/** Confetti palette: brand teal + repo-standard categorical fallbacks. */
const CONFETTI_COLORS = [
  BRAND_ACCENT,
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Stage: subtle muted backdrop; specimens sit centered at natural size.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 'var(--spacing-8)',
    padding: 'var(--spacing-8) var(--spacing-5)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Phone-width specimen column.
  specimenCol: {
    width: '100%',
    maxWidth: 400,
    minWidth: 0,
  },
  // --- brand header band ---
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  wordmark: {
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '-0.01em',
    color: 'var(--color-text-primary)',
  },
  headline: {
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  // --- referral code pill ---
  codePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    border: `var(--border-width) dashed ${BRAND_ACCENT}`,
    backgroundColor: BRAND_ACCENT_SOFT,
    borderRadius: 999,
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2) var(--spacing-1)',
  },
  codeText: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: '0.06em',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInlineStart: 'var(--spacing-1)',
  },
  // Fixed-height slot so the copied toast chip never shifts layout.
  toastSlot: {
    minHeight: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // --- tier meter ---
  meterBlock: {
    ...({'--color-accent': BRAND_ACCENT} as CSSProperties),
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)',
  },
  earnedFigure: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // --- friends list ---
  friendMeta: {minWidth: 0},
  // --- share row ---
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
  },
  termsRow: {
    display: 'flex',
    justifyContent: 'center',
  },
  // --- celebration specimen ---
  celebrationCardBody: {
    position: 'relative',
    overflow: 'hidden',
  },
  // Decorative confetti layer; content stacks above it.
  confettiLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  confettiDot: {
    position: 'absolute',
    borderRadius: 999,
  },
  celebrationContent: {
    position: 'relative',
  },
  giftDisc: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    border: `var(--border-width) solid ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Earnings breakdown: muted inset block, not a nested Card.
  breakdown: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3)',
  },
  breakdownFigure: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
  },
  totalFigure: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
    fontWeight: 700,
  },
  // Brand claim CTA: hand-rolled button so the accent pair owns the fill.
  claimButton: {
    width: '100%',
    height: 44,
    borderRadius: 'var(--radius-container)',
    border: 'none',
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    font: 'inherit',
    fontWeight: 600,
    fontSize: 15,
    fontVariantNumeric: 'tabular-nums',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    cursor: 'pointer',
  },
  claimedRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    paddingInline: 'var(--spacing-3)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed strings and integers, July 2026 world.

const REFERRAL_CODE = 'PERCH-JULE30';
const REWARD_PER_FRIEND = 30; // "$30 for you, $30 for them"
const TIER_TARGET = 3;
const TIER_BONUS = 25;

type FriendStatus = 'joined' | 'pending' | 'expired';

interface Friend {
  id: string;
  name: string;
  detail: string;
  status: FriendStatus;
}

/**
 * Two joined × $30 = the $60 the meter reports; pending and expired earn
 * $0. Ben's pending row carries the Nudge action.
 */
const FRIENDS: Friend[] = [
  {
    id: 'fr-maya',
    name: 'Maya Torres',
    detail: 'Invited Jun 24 · joined Jun 28',
    status: 'joined',
  },
  {
    id: 'fr-priya',
    name: 'Priya Shah',
    detail: 'Invited Jul 1 · joined Jul 2',
    status: 'joined',
  },
  {
    id: 'fr-ben',
    name: 'Ben Okafor',
    detail: 'Invite expires Jul 15',
    status: 'pending',
  },
  {
    id: 'fr-lena',
    name: 'Lena Fischer',
    detail: 'Invited Jun 5 · expired Jun 19',
    status: 'expired',
  },
];

const JOINED_COUNT = FRIENDS.filter(f => f.status === 'joined').length; // 2
const EARNED_TOTAL = JOINED_COUNT * REWARD_PER_FRIEND; // $60

const STATUS_BADGE: Record<
  FriendStatus,
  {label: string; variant: BadgeVariant}
> = {
  joined: {label: `Joined · $${REWARD_PER_FRIEND}`, variant: 'success'},
  pending: {label: 'Pending', variant: 'warning'},
  expired: {label: 'Expired', variant: 'neutral'},
};

const SHARE_ACTIONS = [
  {id: 'share-msg', label: 'Message', icon: MessageCircleIcon},
  {id: 'share-mail', label: 'Email', icon: MailIcon},
  {id: 'share-more', label: 'More', icon: Share2Icon},
] as const;

/**
 * Confetti-dot pattern for the celebration card: literal table (percent
 * coords, px size, palette index, opacity) — deterministic, no randomness.
 * Denser near the top edge, sparse toward the middle.
 */
const CONFETTI_DOTS: ReadonlyArray<
  readonly [left: number, top: number, size: number, color: number, op: number]
> = [
  [4, 6, 7, 0, 0.9],
  [11, 16, 5, 1, 0.7],
  [18, 4, 6, 2, 0.85],
  [26, 12, 4, 3, 0.6],
  [33, 5, 8, 4, 0.8],
  [41, 15, 5, 0, 0.65],
  [48, 3, 6, 1, 0.9],
  [56, 11, 4, 2, 0.7],
  [63, 5, 7, 3, 0.85],
  [71, 14, 5, 4, 0.6],
  [78, 4, 6, 0, 0.8],
  [86, 10, 4, 1, 0.7],
  [95, 15, 7, 2, 0.9],
  [8, 27, 4, 3, 0.5],
  [24, 24, 5, 4, 0.45],
  [39, 26, 4, 1, 0.5],
  [58, 23, 5, 0, 0.45],
  [74, 27, 4, 2, 0.5],
  [90, 22, 5, 3, 0.45],
  [16, 36, 3, 0, 0.3],
  [50, 34, 3, 4, 0.3],
  [83, 35, 3, 1, 0.3],
];

// ============= SHARED BITS =============

/**
 * Specimen wrapper: mono state-id Token caption + one-line note above the
 * card, per the composer-state-gallery idiom.
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
    <div style={styles.specimenCol}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Token label={stateId} size="sm" color="gray" />
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </HStack>
        {children}
      </VStack>
    </div>
  );
}

/** Perch brand row: accent mark + styled-text wordmark (no real brands). */
function BrandRow({tagline}: {tagline: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={styles.brandMark} aria-hidden>
        <Icon icon={BirdIcon} size="sm" color="inherit" />
      </span>
      <span style={styles.wordmark}>Perch</span>
      <StackItem size="fill" />
      <Text type="supporting" color="secondary">
        {tagline}
      </Text>
    </HStack>
  );
}

/**
 * Referral-code pill + copy button. Copy pops a transient "Copied to
 * clipboard" toast chip in a fixed-height slot (no layout shift) and
 * swaps the copy glyph to a check for the same window.
 */
function ReferralCodePill() {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleCopy = () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard?.writeText != null
    ) {
      void navigator.clipboard.writeText(REFERRAL_CODE).catch(() => {});
    }
    setIsCopied(true);
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setIsCopied(false), 2200);
  };

  return (
    <VStack gap={1}>
      <div style={styles.codePill}>
        <span style={styles.codeText}>{REFERRAL_CODE}</span>
        <IconButton
          label={
            isCopied ? 'Referral code copied' : 'Copy referral code'
          }
          tooltip={isCopied ? 'Copied' : 'Copy code'}
          icon={
            <Icon
              icon={isCopied ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          onClick={handleCopy}
        />
      </div>
      <div style={styles.toastSlot} aria-live="polite">
        {isCopied ? (
          <Badge
            label="Copied to clipboard"
            variant="success"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
          />
        ) : null}
      </div>
    </VStack>
  );
}

/** Tier meter: 2 of 3 joined, $60 earned, +$25 bonus at 3 friends. */
function TierMeter() {
  return (
    <div style={styles.meterBlock}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text type="label" size="sm">
            Next bonus tier
          </Text>
          <StackItem size="fill" />
          <span style={styles.earnedFigure}>${EARNED_TOTAL} earned</span>
        </HStack>
        <ProgressBar
          value={JOINED_COUNT}
          max={TIER_TARGET}
          label="Friends joined toward the next bonus tier"
          isLabelHidden
        />
        <Text type="supporting" color="secondary">
          {JOINED_COUNT} of {TIER_TARGET} friends joined · 1 more unlocks
          the +${TIER_BONUS} tier bonus
        </Text>
      </VStack>
    </div>
  );
}

// ============= SPECIMEN 01 · ACTIVE REFERRAL CARD =============

/** One invited-friend row: avatar, name + dates, status chip, Nudge. */
function FriendRow({
  friend,
  isNudged,
  onNudge,
}: {
  friend: Friend;
  isNudged: boolean;
  onNudge: (id: string) => void;
}) {
  const badge = STATUS_BADGE[friend.status];
  return (
    <HStack gap={3} vAlign="center">
      <Avatar name={friend.name} size="small" />
      <StackItem size="fill" style={styles.friendMeta}>
        <VStack gap={0}>
          <Text size="sm" maxLines={1}>
            {friend.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {isNudged ? 'Reminder sent just now' : friend.detail}
          </Text>
        </VStack>
      </StackItem>
      <Badge label={badge.label} variant={badge.variant} />
      {friend.status === 'pending' ? (
        <Button
          label={isNudged ? 'Nudged' : 'Nudge'}
          variant="secondary"
          size="sm"
          isDisabled={isNudged}
          icon={<Icon icon={BellRingIcon} size="sm" color="inherit" />}
          onClick={() => onNudge(friend.id)}
        />
      ) : null}
    </HStack>
  );
}

/** Share row: Message / Email / More as labeled 44px icon buttons. */
function ShareRow() {
  return (
    <HStack gap={6} hAlign="center">
      {SHARE_ACTIONS.map(action => (
        <VStack key={action.id} gap={1} hAlign="center">
          <IconButton
            label={`Share referral link via ${action.label}`}
            icon={<Icon icon={action.icon} size="md" color="inherit" />}
            variant="secondary"
            size="lg"
            style={styles.shareButton}
            onClick={() => {}}
          />
          <Text type="supporting" color="secondary">
            {action.label}
          </Text>
        </VStack>
      ))}
    </HStack>
  );
}

function ReferralCardSpecimen() {
  // Nudge is one-shot per pending friend; state keys by friend id.
  const [nudgedIds, setNudgedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const nudge = (id: string) => {
    setNudgedIds(prev => new Set(prev).add(id));
  };

  return (
    <Specimen
      stateId="01 · active"
      note="2 of 3 joined — code, meter, friends, share.">
      <Card padding={5}>
        <VStack gap={4}>
          <BrandRow tagline="Invite & earn" />
          <VStack gap={1}>
            <Heading level={2} style={styles.headline}>
              $30 for you, $30 for them
            </Heading>
            <Text type="supporting" color="secondary">
              Friends get ${REWARD_PER_FRIEND} when they open a Perch
              account and make a first deposit — you get $
              {REWARD_PER_FRIEND} the moment they do.
            </Text>
          </VStack>
          <ReferralCodePill />
          <TierMeter />
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Text type="label" size="sm">
                Invited friends
              </Text>
              <StackItem size="fill" />
              <Text type="supporting" color="secondary">
                {JOINED_COUNT} joined · {FRIENDS.length} invited
              </Text>
            </HStack>
            <VStack gap={3}>
              {FRIENDS.map(friend => (
                <FriendRow
                  key={friend.id}
                  friend={friend}
                  isNudged={nudgedIds.has(friend.id)}
                  onNudge={nudge}
                />
              ))}
            </VStack>
          </VStack>
          <Divider />
          <ShareRow />
          <div style={styles.termsRow}>
            <Link type="supporting" onClick={() => {}}>
              Referral terms apply
            </Link>
          </div>
        </VStack>
      </Card>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · REWARD UNLOCKED =============

// Decorative confetti layer is static: hoist it out of the component.
const CONFETTI_LAYER = (
  <div style={styles.confettiLayer} aria-hidden>
    {CONFETTI_DOTS.map(([left, top, size, color, opacity], index) => (
      <span
        key={index}
        style={{
          ...styles.confettiDot,
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          backgroundColor: CONFETTI_COLORS[color],
          opacity,
        }}
      />
    ))}
  </div>
);

/** One label/figure row of the earnings breakdown. */
function BreakdownRow({
  label,
  figure,
  isTotal = false,
}: {
  label: string;
  figure: string;
  isTotal?: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        {isTotal ? (
          <Text type="label" size="sm">
            {label}
          </Text>
        ) : (
          <Text size="sm" color="secondary">
            {label}
          </Text>
        )}
      </StackItem>
      <span style={isTotal ? styles.totalFigure : styles.breakdownFigure}>
        {figure}
      </span>
    </HStack>
  );
}

function RewardUnlockedSpecimen() {
  const [isClaimed, setIsClaimed] = useState(false);
  const friendTotal = TIER_TARGET * REWARD_PER_FRIEND; // $90
  const cycleTotal = friendTotal + TIER_BONUS; // $115

  return (
    <Specimen
      stateId="02 · unlocked"
      note="Third friend joined — tier bonus ready to claim.">
      <Card padding={5} style={styles.celebrationCardBody}>
        {CONFETTI_LAYER}
        <div style={styles.celebrationContent}>
          <VStack gap={4}>
            <BrandRow tagline="Rewards" />
            <VStack gap={2} hAlign="center">
              <span style={styles.giftDisc}>
                <Icon icon={GiftIcon} size="lg" color="inherit" />
              </span>
              <Heading level={2} style={styles.headline}>
                Reward unlocked!
              </Heading>
              <Text type="supporting" color="secondary">
                Ben joined on Jul 3 — that&rsquo;s {TIER_TARGET} of{' '}
                {TIER_TARGET} friends this cycle.
              </Text>
            </VStack>
            <div style={styles.breakdown}>
              <VStack gap={2}>
                <BreakdownRow
                  label={`Friend rewards · ${TIER_TARGET} × $${REWARD_PER_FRIEND}`}
                  figure={`$${friendTotal}`}
                />
                <BreakdownRow label="Tier bonus" figure={`+$${TIER_BONUS}`} />
                <Divider />
                <BreakdownRow
                  label="Total this cycle"
                  figure={`$${cycleTotal}`}
                  isTotal
                />
              </VStack>
            </div>
            {isClaimed ? (
              <div style={styles.claimedRow} aria-live="polite">
                <Badge
                  label="Bonus claimed"
                  variant="success"
                  icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                />
                <Text type="supporting" color="secondary">
                  Lands in Perch Checking ••2481
                </Text>
              </div>
            ) : (
              <button
                type="button"
                style={styles.claimButton}
                onClick={() => setIsClaimed(true)}>
                <Icon icon={PartyPopperIcon} size="sm" color="inherit" />
                Claim ${TIER_BONUS} bonus
              </button>
            )}
            <Text type="supporting" color="secondary" justify="center">
              Deposits to Perch Checking ••2481 within 1 business day.
            </Text>
          </VStack>
        </div>
      </Card>
    </Specimen>
  );
}

// ============= PAGE =============

export default function ReferralRewardsCardTemplate() {
  return (
    <div style={styles.stage}>
      <ReferralCardSpecimen />
      <RewardUnlockedSpecimen />
    </div>
  );
}
