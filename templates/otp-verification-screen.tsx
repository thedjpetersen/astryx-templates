// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the fictional fintech brand
 *   'Northbeam', one masked recipient d•••a@brightfield.co, a partially
 *   entered code 7-2-4-9 with the caret parked on the fifth box, a fixed
 *   0:24 resend countdown chip, an expired-code fixture 8-3-1-4-0-6, and
 *   the verified code readout 724 913)
 * @output Phone-width OTP verification state sheet for Northbeam email
 *   sign-in, presented as three captioned specimens on one muted stage:
 *   the default screen ('Check your email' header over the masked
 *   address, six code boxes with four digits entered and a steel-blue
 *   focus ring + static caret on the fifth, a resend row gated by a
 *   0:24 countdown chip, an 'Open mail app' secondary button, and a
 *   change-address / support help footer); an error screen with a 'code
 *   expired' Banner above six red boxes frozen mid-shake and an ACTIVE
 *   resend link that swaps in a 'new code sent' info Banner and clears
 *   the boxes; and a compact success card where the box row has morphed
 *   into an accent checkmark disc above a verified-code chip and a
 *   'Signing you in' progress-dots line.
 * @position Page template; emitted by `astryx template otp-verification-screen`
 *
 * Frame: no app shell. One natural-height stage div (minHeight 100dvh,
 * muted wash + faint steel-blue tint) opens with a centered sheet title
 * + 'state sheet' Badge, then the specimens sit side by side in a
 * wrapping row at their natural phone width (390px frames), each under
 * a mono state-id Token caption — the specimen idiom from
 * composer-state-gallery. This is a SMALL experience: no app chrome, no
 * page-width regions; the phone frames are the entire product surface.
 * The stage grows with its content (no fixed-height wrapper), so nothing
 * scrolls internally or clips.
 *
 * Responsive contract:
 * - Stage row wraps: three frames across >=1280px, two, then a single
 *   centered column at phone widths; frames keep width 390 until the
 *   viewport is narrower, where they shrink to 100% (maxWidth 390).
 * - The six code boxes are fixed 46px squares with a 10px gap + a group
 *   separator — 6 boxes always fit a 375px screen minus frame padding;
 *   the row never wraps.
 * - Resend row and help footer wrap (flexWrap) instead of clipping.
 * - Nothing is hover-only: the active resend link, 'Open mail app', and
 *   footer links are plain click targets >=40px tall on touch.
 *
 * Container policy (state-gallery archetype): each phone frame is one
 * custom bordered div (device bezel + status bar) so the screen surface
 * reads as a product screen, not a dashboard Card; captions live outside
 * the frames. No Cards anywhere — the frames are the only containers.
 *
 * Color policy: ONE brand accent — Northbeam steel blue
 * light-dark(#31648C, #7CB3E0) — used for the brand mark, the focused
 * box ring + caret, the active resend link, the verified checkmark disc,
 * and the stage tint. Error paint rides the semantic error tokens.
 * Everything else is token-pure; no scheme-locked surfaces.
 *
 * Fixture policy: fixed strings only — no Date.now, no Math.random, no
 * timers. The countdown chip is a frozen 0:24 readout; the only state
 * transition is the error specimen's resend click, which swaps
 * pre-written banner copy and clears the boxes.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {Token} from '@astryxdesign/core/Token';
import {
  CheckIcon,
  LifeBuoyIcon,
  MailIcon,
  MailOpenIcon,
  NavigationIcon,
  TimerIcon,
} from 'lucide-react';

// ============= BRAND =============
// Northbeam steel blue — the ONE brand accent (§5.1): 600-700 weight on
// the light side, 300-400 weight on the dark side. Verified AA where it
// touches text (link + digits on surface backgrounds in both schemes).
const BRAND_ACCENT = 'light-dark(#31648C, #7CB3E0)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(49,100,140,0.12), rgba(124,179,224,0.16))';
// Focus-ring halo: a touch stronger than SOFT so the ring reads on the
// muted stage in both schemes.
const BRAND_RING = 'light-dark(rgba(49,100,140,0.28), rgba(124,179,224,0.32))';

// ============= FIXTURES =============
// Deterministic: fixed strings, no clocks, no randomness.
const MASKED_EMAIL = 'd•••a@brightfield.co';
const RESEND_COUNTDOWN = '0:24';
// Default specimen: four digits entered, caret parked on box 5.
const ENTERED_DIGITS = ['7', '2', '4', '9', '', ''];
const FOCUS_INDEX = 4;
// Error specimen: the full expired code, every box rejected.
const EXPIRED_DIGITS = ['8', '3', '1', '4', '0', '6'];
// Success specimen: the code that verified (724 913 — same 7-2-4-9 head
// the default specimen shows mid-entry, so the sheet reads as one story).
const VERIFIED_CODE = '724 913';

type BoxTone = 'idle' | 'filled' | 'focused' | 'error';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // The stage: natural-height (minHeight 100dvh, grows with content so
  // nothing clips), muted wash + a faint steel-blue tint so the phone
  // frames float; specimens wrap into a centered row below the header.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-6)',
    background:
      `radial-gradient(120% 90% at 50% 0%, ${BRAND_ACCENT_SOFT} 0%, transparent 55%),` +
      ' var(--color-background-muted)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 640},
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
    maxWidth: 1360,
    marginInline: 'auto',
  },
  specimen: {width: '100%', maxWidth: 390},
  // Phone frame: bezel + screen. The frame IS the container (no Cards).
  phoneFrame: {
    width: '100%',
    borderRadius: 28,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  statusBar: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'var(--color-text-secondary)',
  },
  statusBattery: {
    width: 18,
    height: 9,
    borderRadius: 3,
    border: '1px solid var(--color-text-secondary)',
    padding: 1,
  },
  statusBatteryFill: {
    width: '72%',
    height: '100%',
    borderRadius: 1,
    backgroundColor: 'var(--color-text-secondary)',
  },
  screenBody: {
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-5)',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
  },
  brandName: {fontWeight: 650, letterSpacing: '-0.01em'},
  // Hero glyph above the heading: soft accent disc + mail icon.
  heroDisc: {
    width: 56,
    height: 56,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
  },
  maskedEmail: {fontWeight: 600},
  // ---- OTP boxes ----
  // 46px squares, 10px gap, wider gap after box 3 (3+3 grouping).
  // 6*46 + 5*10 + 8 extra = 334px — fits a 375px screen minus padding.
  boxRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  groupGap: {marginInlineStart: 8},
  box: {
    width: 46,
    height: 54,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--color-text)',
    position: 'relative',
    flexShrink: 0,
  },
  boxFilled: {
    borderColor: 'var(--color-text-secondary)',
  },
  boxFocused: {
    borderColor: BRAND_ACCENT,
    boxShadow: `0 0 0 3px ${BRAND_RING}`,
  },
  boxError: {
    borderColor: 'var(--color-error)',
    backgroundColor:
      'light-dark(rgba(220,38,38,0.06), rgba(248,113,113,0.10))',
    color: 'var(--color-error)',
  },
  // Static caret inside the focused box (no keyframes in this idiom).
  caret: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: BRAND_ACCENT,
  },
};

const styles2: Record<string, CSSProperties> = {
  // "Shaken-style": the rejected row is frozen mid-shake — alternating
  // ±2px offsets, called out in the specimen caption so it reads as a
  // deliberate snapshot of the reject animation.
  shakeLeft: {transform: 'translateX(-2px)'},
  shakeRight: {transform: 'translateX(2px)'},
  // Resend row: link + countdown chip; wraps instead of clipping.
  resendRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  countdownChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
  },
  resendMuted: {color: 'var(--color-text-secondary)'},
  // Active resend link carries the brand accent (AA on surface in both
  // schemes: #31648C on white 6.7:1, #7CB3E0 on the dark card 7.9:1).
  resendActive: {color: BRAND_ACCENT, fontWeight: 600},
  helpFooter: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  // ---- Success specimen ----
  // Checkmark morph placeholder: the disc sits exactly where the box row
  // was (same 54px band height) with a soft concentric halo.
  morphBand: {
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDisc: {
    width: 54,
    height: 54,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    boxShadow: `0 0 0 8px ${BRAND_ACCENT_SOFT}`,
  },
  verifiedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  progressDots: {display: 'flex', gap: 6, alignItems: 'center'},
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
  },
  progressDotOn: {backgroundColor: BRAND_ACCENT},
  fullWidth: {width: '100%'},
};

// ============= SHARED BUILDING BLOCKS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note above the phone
 * frame (the composer-state-gallery caption idiom).
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
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          {/* flexShrink 0: the note must never squeeze the state id into
              an ellipsis ("01 · enter…"). */}
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
      </VStack>
    </div>
  );
}

/** Phone bezel: fixed 9:41 status bar over the screen body. */
function PhoneFrame({children}: {children: ReactNode}) {
  return (
    <div style={styles.phoneFrame}>
      <HStack gap={2} vAlign="center" style={styles.statusBar}>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          9:41
        </Text>
        <StackItem size="fill" />
        <div style={styles.statusDot} />
        <div style={styles.statusDot} />
        <div style={styles.statusDot} />
        <div style={styles.statusBattery} aria-hidden>
          <div style={styles.statusBatteryFill} />
        </div>
      </HStack>
      <div style={styles.screenBody}>{children}</div>
    </div>
  );
}

/** Northbeam wordmark: accent glyph tile + styled text (no real brand). */
function BrandRow() {
  return (
    <HStack gap={2} vAlign="center" hAlign="center">
      <div style={styles.brandMark}>
        <Icon icon={NavigationIcon} size="sm" color="inherit" />
      </div>
      <Text style={styles.brandName}>
        Northbeam
      </Text>
    </HStack>
  );
}

const BOX_TONE_STYLE: Record<BoxTone, CSSProperties | undefined> = {
  idle: undefined,
  filled: styles.boxFilled,
  focused: styles.boxFocused,
  error: styles.boxError,
};

/**
 * One OTP digit box. Boxes are a read-only readout in this state sheet;
 * each carries an aria-label naming its position and state.
 */
function OtpBox({
  digit,
  tone,
  index,
  shakeStyle,
}: {
  digit: string;
  tone: BoxTone;
  index: number;
  shakeStyle?: CSSProperties;
}) {
  const boxStyle: CSSProperties = {
    ...styles.box,
    ...BOX_TONE_STYLE[tone],
    ...(index === 3 ? styles.groupGap : undefined),
    ...shakeStyle,
  };
  const stateLabel =
    tone === 'focused' ? 'awaiting input' : digit === '' ? 'empty' : digit;
  return (
    <div
      style={boxStyle}
      role="img"
      aria-label={`Digit ${index + 1} of 6: ${stateLabel}`}>
      {tone === 'focused' ? <div style={styles.caret} aria-hidden /> : digit}
    </div>
  );
}

/** The six-box row; `focusIndex` -1 means no box holds the caret. */
function OtpBoxRow({
  digits,
  focusIndex,
  isError = false,
  isShaken = false,
}: {
  digits: string[];
  focusIndex: number;
  isError?: boolean;
  isShaken?: boolean;
}) {
  return (
    <div style={styles.boxRow}>
      {digits.map((digit, index) => {
        const tone: BoxTone = isError
          ? 'error'
          : index === focusIndex
            ? 'focused'
            : digit !== ''
              ? 'filled'
              : 'idle';
        const shakeStyle = isShaken
          ? index % 2 === 0
            ? styles2.shakeLeft
            : styles2.shakeRight
          : undefined;
        return (
          <OtpBox
            // Position is the identity in a fixed-length code row.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            digit={digit}
            tone={tone}
            index={index}
            shakeStyle={shakeStyle}
          />
        );
      })}
    </div>
  );
}

/** Countdown chip: frozen readout, no clock (fixture policy). */
function CountdownChip({value}: {value: string}) {
  return (
    <span style={styles2.countdownChip}>
      <Icon icon={TimerIcon} size="xsm" color="inherit" />
      {value}
    </span>
  );
}

/** Help footer: change-address + support links, wraps on tiny widths. */
function HelpFooter() {
  return (
    <VStack gap={2}>
      <Divider />
      <HStack gap={2} vAlign="center" hAlign="center" style={styles2.helpFooter}>
        <Text type="supporting" color="secondary">
          Wrong email?
        </Text>
        <Link onClick={() => {}}>Change address</Link>
        <Text type="supporting" color="secondary">
          ·
        </Text>
        <HStack gap={1} vAlign="center">
          <Icon icon={LifeBuoyIcon} size="xsm" color="secondary" />
          <Link onClick={() => {}}>Contact support</Link>
        </HStack>
      </HStack>
    </VStack>
  );
}

// ============= SPECIMEN 01 · ENTERING =============

function EnteringSpecimen() {
  return (
    <Specimen
      stateId="01 · entering"
      note="Four digits in; the caret holds box 5.">
      <PhoneFrame>
        <VStack gap={5}>
          <BrandRow />
          <VStack gap={3} hAlign="center">
            <div style={styles.heroDisc}>
              <Icon icon={MailIcon} size="md" color="inherit" />
            </div>
            <VStack gap={1} hAlign="center">
              <Heading level={2}>Check your email</Heading>
              <Text color="secondary" justify="center">
                We sent a 6-digit code to{' '}
                <span style={styles.maskedEmail}>{MASKED_EMAIL}</span>
              </Text>
            </VStack>
          </VStack>
          <OtpBoxRow digits={ENTERED_DIGITS} focusIndex={FOCUS_INDEX} />
          <HStack
            gap={2}
            vAlign="center"
            hAlign="center"
            style={styles2.resendRow}>
            <Text type="supporting" color="secondary">
              Didn&rsquo;t get it?
            </Text>
            <Text type="supporting" style={styles2.resendMuted}>
              Resend code in
            </Text>
            <CountdownChip value={RESEND_COUNTDOWN} />
          </HStack>
          <Button
            label="Open mail app"
            variant="secondary"
            icon={<Icon icon={MailOpenIcon} size="sm" color="inherit" />}
            style={styles2.fullWidth}
            onClick={() => {}}
          />
          <HelpFooter />
        </VStack>
      </PhoneFrame>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · EXPIRED =============

/**
 * Error state: the full expired code sits in red boxes frozen mid-shake
 * behind a 'code expired' Banner, and the resend link is ACTIVE (no
 * countdown gate). Clicking it swaps pre-written 'new code sent' copy,
 * clears the boxes, and re-gates resend behind a frozen countdown —
 * the one interactive transition on the sheet, fully deterministic.
 */
function ExpiredSpecimen() {
  const [phase, setPhase] = useState<'expired' | 'resent'>('expired');
  const isExpired = phase === 'expired';

  return (
    <Specimen
      stateId="02 · expired"
      note="Frozen mid-shake; resend is clickable.">
      <PhoneFrame>
        <VStack gap={5}>
          <BrandRow />
          {isExpired ? (
            <Banner
              status="error"
              title="This code expired"
              description="Codes are valid for 10 minutes. Request a new one below."
            />
          ) : (
            <Banner
              status="info"
              title="New code sent"
              description={`Check ${MASKED_EMAIL} for the fresh code.`}
            />
          )}
          <VStack gap={1} hAlign="center">
            <Heading level={2}>Check your email</Heading>
            <Text color="secondary" justify="center">
              We sent a 6-digit code to{' '}
              <span style={styles.maskedEmail}>{MASKED_EMAIL}</span>
            </Text>
          </VStack>
          {isExpired ? (
            <OtpBoxRow
              digits={EXPIRED_DIGITS}
              focusIndex={-1}
              isError
              isShaken
            />
          ) : (
            <OtpBoxRow
              digits={['', '', '', '', '', '']}
              focusIndex={0}
            />
          )}
          <HStack
            gap={2}
            vAlign="center"
            hAlign="center"
            style={styles2.resendRow}>
            {isExpired ? (
              <>
                <Text type="supporting" color="secondary">
                  Didn&rsquo;t get it?
                </Text>
                <Link onClick={() => setPhase('resent')}>
                  <span style={styles2.resendActive}>Resend code</span>
                </Link>
              </>
            ) : (
              <>
                <Text type="supporting" style={styles2.resendMuted}>
                  Resend again in
                </Text>
                <CountdownChip value="0:30" />
              </>
            )}
          </HStack>
          <Button
            label="Open mail app"
            variant="secondary"
            icon={<Icon icon={MailOpenIcon} size="sm" color="inherit" />}
            style={styles2.fullWidth}
            onClick={() => {}}
          />
          <HelpFooter />
        </VStack>
      </PhoneFrame>
    </Specimen>
  );
}

// ============= SPECIMEN 03 · VERIFIED =============

/**
 * Success state, compact: the box row has morphed into a single accent
 * checkmark disc (same 54px band the boxes occupied), with the verified
 * code readout and a 'Signing you in' progress-dots line beneath.
 */
function VerifiedSpecimen() {
  return (
    <Specimen
      stateId="03 · verified"
      note="Boxes morph into the checkmark disc.">
      <PhoneFrame>
        <VStack gap={5}>
          <BrandRow />
          <VStack gap={1} hAlign="center">
            <Heading level={2}>You&rsquo;re verified</Heading>
            <Text color="secondary" justify="center">
              Welcome back to your Northbeam account
            </Text>
          </VStack>
          <div style={styles2.morphBand}>
            <div style={styles2.checkDisc} role="img" aria-label="Code verified">
              <Icon icon={CheckIcon} size="lg" color="inherit" />
            </div>
          </div>
          <VStack gap={3} hAlign="center">
            <span style={styles2.verifiedChip}>
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
              {VERIFIED_CODE} · verified
            </span>
            <HStack gap={2} vAlign="center">
              <div style={styles2.progressDots} aria-hidden>
                <div style={{...styles2.progressDot, ...styles2.progressDotOn}} />
                <div style={{...styles2.progressDot, ...styles2.progressDotOn}} />
                <div style={styles2.progressDot} />
              </div>
              <Text type="supporting" color="secondary">
                Signing you in&hellip;
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </PhoneFrame>
    </Specimen>
  );
}

// ============= PAGE =============

export default function OtpVerificationScreenTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <HStack gap={2} vAlign="center" hAlign="center">
            <Heading level={1}>OTP verification — 3 states</Heading>
            <Badge label="state sheet" variant="neutral" />
          </HStack>
          <Text type="supporting" color="secondary">
            Northbeam email sign-in · deterministic fixtures
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <EnteringSpecimen />
        <ExpiredSpecimen />
        <VerifiedSpecimen />
      </div>
    </div>
  );
}
