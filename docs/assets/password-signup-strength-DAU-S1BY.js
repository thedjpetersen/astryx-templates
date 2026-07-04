var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the fictional dev-tool brand
 *   'Basecoat', one signup persona typing maya@gmial.com with the
 *   corrected suggestion maya@gmail.com, a Good-strength password
 *   fixture 'Anvil!raku-26' scoring 3 of 4, and a Weak first attempt
 *   'maya2026' scoring 1 of 4 with three unmet requirements)
 * @output Phone-to-narrow signup state sheet for Basecoat, presented as
 *   two captioned specimens on one muted copper-tinted stage: the Good
 *   state (email field with a clickable 'Did you mean maya@gmail.com?'
 *   typo-suggestion chip, password field with a live reveal toggle, a
 *   4-segment strength meter filled 3/4 in lime with the 'Good' label,
 *   a four-rule requirement checklist where two just-satisfied rows are
 *   frozen mid-pop into their checkmarks, a confirm field with a green
 *   'Passwords match' indicator, a checked terms checkbox, an ENABLED
 *   full-width Create account CTA, and an 'or sign up with' divider over
 *   Google/GitHub provider buttons) and the Weak state (the same card
 *   frozen on the first attempt: meter at 1/4 red 'Weak', revealed
 *   password 'maya2026', three unmet checklist rows, empty confirm
 *   field, unchecked terms, and the CTA disabled behind a helper line).
 * @position Page template; emitted by \`astryx template password-signup-strength\`
 *
 * Frame: Layout height="auto" (the two-card sheet is taller than one
 * viewport, so the page grows and scrolls as a single surface — no
 * nested scrollbar). LayoutHeader carries the sheet title and
 * a 'state sheet' Badge. LayoutContent hosts one centered stage region
 * (muted wash + faint copper tint) whose two specimens sit side by side
 * in a wrapping row at their natural card width (430px), each under a
 * mono state-id Token caption — the specimen idiom from
 * composer-state-gallery / otp-verification-screen. This is a SMALL
 * experience: no app chrome, no page-width regions; the signup cards
 * are the entire product surface.
 *
 * Responsive contract:
 * - Stage row wraps: two cards across >=960px, then a single centered
 *   column; cards keep width 430 until the viewport is narrower, where
 *   they shrink to 100% (maxWidth 430).
 * - The strength meter is four flexible segments (flex: 1) so it never
 *   overflows; the requirement checklist stacks vertically and each row
 *   wraps its copy instead of clipping.
 * - The two SSO provider buttons share one row >=360px card width and
 *   are full-flex so they split evenly; labels are one word each.
 * - Nothing is hover-only: the typo chip, reveal toggles, checkbox, and
 *   CTA are plain click targets; the reveal toggle is >=40px on touch.
 *
 * Container policy (state-gallery archetype): each signup card is one
 * custom bordered div (the product's auth card) so the surface reads as
 * a signup screen, not a dashboard Card; captions live outside the
 * frames. No design-system Cards anywhere — the two card frames are the
 * only containers.
 *
 * Color policy: ONE brand accent — Basecoat copper
 * light-dark(#9A4E1C, #E8A87A) — used for the brand mark, the typo
 * suggestion chip, the focused-field ring, the enabled primary CTA tint
 * and the stage wash. Strength-meter segment colors are a deliberate
 * semantic progression (red / orange / lime / green) written as
 * light-dark literals, and the match indicator rides FieldStatus
 * success semantics. Everything else is token-pure; no scheme-locked
 * surfaces.
 *
 * Fixture policy: fixed strings only — no Date.now, no Math.random, no
 * timers. The only interactive transitions are the typo chip click
 * (applies the corrected email and dismisses the chip) and the two
 * password reveal toggles; both are fully deterministic. The two
 * 'just satisfied' checklist rows are frozen mid-pop (static transform
 * + halo), called out in the specimen caption.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyRoundIcon,
  PaintRollerIcon,
  WandSparklesIcon,
} from 'lucide-react';

// ============= BRAND =============
// Basecoat copper — the ONE brand accent (§5.1): ~700 weight on the
// light side, ~300 weight on the dark side. Verified AA where it
// touches text (#9A4E1C on white 6.0:1; #E8A87A on the dark card
// 6.4:1; white on #9A4E1C 6.0:1 for the CTA).
const BRAND_ACCENT = 'light-dark(#9A4E1C, #E8A87A)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(154,78,28,0.12), rgba(232,168,122,0.16))';
// Focus-ring halo: a touch stronger than SOFT so the ring reads on the
// muted stage in both schemes.
const BRAND_RING = 'light-dark(rgba(154,78,28,0.28), rgba(232,168,122,0.32))';
// CTA label color over the solid copper fill (light scheme) / over the
// pale copper fill (dark scheme keeps near-black text for AA).
const CTA_TEXT = 'light-dark(#FFFFFF, #211307)';

// ============= STRENGTH SCALE =============
// Semantic progression for the 4-segment meter — deliberate literals,
// not brand paint: red -> orange -> lime -> green. Labels pair 1:1.
const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const;
const STRENGTH_COLORS = [
  'light-dark(#DC2626, #F87171)', // 1 · Weak
  'light-dark(#EA580C, #FB923C)', // 2 · Fair
  'light-dark(#4D7C0F, #A3E635)', // 3 · Good
  'light-dark(#15803D, #4ADE80)', // 4 · Strong
] as const;

// ============= FIXTURES =============
// Deterministic: fixed strings, no clocks, no randomness.
const TYPO_EMAIL = 'maya@gmial.com';
const FIXED_EMAIL = 'maya@gmail.com';
const GOOD_PASSWORD = 'Anvil!raku-26'; // 13 chars · number · symbol · no 'maya'
const WEAK_PASSWORD = 'maya2026'; // 8 chars · number only · contains 'maya'

type Requirement = {
  id: string;
  label: string;
  // 'met' = settled check · 'popping' = just satisfied, frozen mid-pop
  // 'unmet' = hollow dot
  state: 'met' | 'popping' | 'unmet';
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Layout height="auto": the sheet is taller than one viewport, so the
  // page must grow with content and scroll as one surface — a fixed
  // 100dvh root would trap the card bottoms behind a nested scrollbar.
  root: {width: '100%'},
  // The stage: muted wash + a faint copper tint so the cards float;
  // specimens wrap into a centered row.
  stage: {
    minHeight: '100%',
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-4)',
    background:
      \`radial-gradient(120% 90% at 50% 0%, \${BRAND_ACCENT_SOFT} 0%, transparent 55%),\` +
      ' var(--color-background-muted)',
  },
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
    maxWidth: 960,
    marginInline: 'auto',
  },
  specimen: {width: '100%', maxWidth: 430},
  // Signup card: the product's auth surface. The frame IS the container
  // (no design-system Cards).
  cardFrame: {
    width: '100%',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-5)',
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  brandName: {fontWeight: 650, letterSpacing: '-0.01em'},
  brandTagline: {whiteSpace: 'nowrap'},
  // ---- Email typo-suggestion chip ----
  // Clickable pill under the email field; copper text on copper tint
  // (AA: #9A4E1C on the 12% tint over white 5.6:1; #E8A87A on the 16%
  // tint over the dark card 5.9:1).
  typoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    borderRadius: 999,
    border: \`var(--border-width) solid \${BRAND_RING}\`,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    // Native <button> reset: inherit the page font, drop UA chrome.
    fontFamily: 'inherit',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    maxWidth: '100%',
    alignSelf: 'flex-start',
    textAlign: 'start',
  },
  typoChipStrong: {fontWeight: 700, whiteSpace: 'nowrap'},
  // ---- Strength meter ----
  // Four flexible segments under the password field; filled segments
  // paint the score color, empty ones stay on the muted token.
  meterRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    width: '100%',
  },
  meterSegment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  meterLabelRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  meterLabel: {fontSize: 13, fontWeight: 650, whiteSpace: 'nowrap'},
  meterHint: {textWrap: 'balance'} as CSSProperties,
  // ---- Requirement checklist ----
  checklist: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  reqRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 4,
  },
  reqDisc: {
    width: 18,
    height: 18,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  reqDiscMet: {
    border: 'none',
    backgroundColor: 'light-dark(#15803D, #4ADE80)',
    color: 'light-dark(#FFFFFF, #052E16)',
  },
  // "Just satisfied" rows are frozen mid-pop: static 1.15 scale + a soft
  // green halo — a snapshot of the tick-in animation (no keyframes in
  // this idiom), called out in the specimen caption.
  reqDiscPopping: {
    border: 'none',
    backgroundColor: 'light-dark(#15803D, #4ADE80)',
    color: 'light-dark(#FFFFFF, #052E16)',
    transform: 'scale(1.15)',
    boxShadow:
      '0 0 0 4px light-dark(rgba(21,128,61,0.18), rgba(74,222,128,0.22))',
  },
  // Unmet marker: a solid 6px dot on the secondary-text token so the
  // hollow disc reads as a deliberate "pending" radio, not an empty box.
  reqDotUnmet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'var(--color-text-secondary)',
  },
  reqLabelMet: {color: 'var(--color-text-secondary)'},
  reqLabelUnmet: {color: 'var(--color-text)'},
};

const styles2: Record<string, CSSProperties> = {
  // ---- Confirm-match indicator / helper rows ----
  matchRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  // ---- CTA ----
  fullWidth: {width: '100%'},
  // Enabled CTA: solid copper with AA label (white on #9A4E1C 6.0:1;
  // near-black #211307 on #E8A87A 8.1:1).
  ctaEnabled: {
    width: '100%',
    backgroundColor: BRAND_ACCENT,
    borderColor: BRAND_ACCENT,
    color: CTA_TEXT,
  },
  ctaHelper: {textAlign: 'center'},
  // ---- SSO divider ----
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  orDividerLine: {flex: 1, minWidth: 0},
  orDividerLabel: {whiteSpace: 'nowrap'},
  ssoRow: {display: 'flex', gap: 'var(--spacing-2)'},
  ssoButton: {flex: 1, minWidth: 0},
  // ---- Footer ----
  signinFooter: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
};

// ============= SHARED BUILDING BLOCKS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note above the card
 * (the composer-state-gallery caption idiom).
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

/** Basecoat wordmark: copper glyph tile + styled text (no real brand). */
function BrandHeader() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandMark}>
        <Icon icon={PaintRollerIcon} size="sm" color="inherit" />
      </div>
      <Text style={styles.brandName}>Basecoat</Text>
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" style={styles.brandTagline}>
        env bootstrap for teams
      </Text>
    </HStack>
  );
}

/** Password input with a live reveal toggle (eye / eye-off). */
function PasswordField({
  label,
  value,
  isRevealed,
  onToggleReveal,
}: {
  label: string;
  value: string;
  isRevealed: boolean;
  onToggleReveal: () => void;
}) {
  return (
    <HStack gap={2} vAlign="end">
      <StackItem size="fill">
        <TextInput
          type={isRevealed ? 'text' : 'password'}
          label={label}
          value={value}
          onChange={() => {}}
        />
      </StackItem>
      <IconButton
        label={isRevealed ? 'Hide password' : 'Show password'}
        icon={<Icon icon={isRevealed ? EyeOffIcon : EyeIcon} size="sm" />}
        variant="secondary"
        onClick={onToggleReveal}
      />
    </HStack>
  );
}

/**
 * 4-segment strength meter. Segments up to \`score\` fill with the score
 * color (red -> orange -> lime -> green); the label rides the same
 * color and the hint stays on tokens.
 */
function StrengthMeter({score, hint}: {score: 1 | 2 | 3 | 4; hint: string}) {
  const color = STRENGTH_COLORS[score - 1];
  const label = STRENGTH_LABELS[score - 1];
  return (
    <VStack gap={1}>
      <div
        style={styles.meterRow}
        role="meter"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-label={\`Password strength: \${label}\`}>
        {[0, 1, 2, 3].map(index => (
          <div
            key={index}
            style={
              index < score
                ? {
                    ...styles.meterSegment,
                    backgroundColor: color,
                    borderColor: color,
                  }
                : styles.meterSegment
            }
          />
        ))}
      </div>
      <HStack gap={2} vAlign="center" style={styles.meterLabelRow}>
        <span style={{...styles.meterLabel, color}}>{label}</span>
        <Text type="supporting" color="secondary" style={styles.meterHint}>
          {hint}
        </Text>
      </HStack>
    </VStack>
  );
}

const REQ_DISC_STYLE: Record<Requirement['state'], CSSProperties> = {
  met: {...styles.reqDisc, ...styles.reqDiscMet},
  popping: {...styles.reqDisc, ...styles.reqDiscPopping},
  unmet: styles.reqDisc,
};

/** Live requirement checklist: settled checks, mid-pop checks, dots. */
function RequirementChecklist({items}: {items: Requirement[]}) {
  const metCount = items.filter(item => item.state !== 'unmet').length;
  return (
    <div
      style={styles.checklist}
      role="list"
      aria-label={\`Password requirements: \${metCount} of \${items.length} met\`}>
      {items.map(item => (
        <div key={item.id} style={styles.reqRow} role="listitem">
          <div
            style={REQ_DISC_STYLE[item.state]}
            role="img"
            aria-label={item.state === 'unmet' ? 'Not met' : 'Met'}>
            {item.state === 'unmet' ? (
              <div style={styles.reqDotUnmet} aria-hidden />
            ) : (
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
            )}
          </div>
          <Text
            type="supporting"
            style={
              item.state === 'unmet'
                ? styles.reqLabelUnmet
                : styles.reqLabelMet
            }>
            {item.label}
          </Text>
        </div>
      ))}
    </div>
  );
}

/** 'or sign up with' divider over the two provider buttons. */
function SsoBlock() {
  return (
    <VStack gap={3}>
      <div style={styles2.orDivider}>
        <div style={styles2.orDividerLine}>
          <Divider />
        </div>
        <Text
          type="supporting"
          color="secondary"
          style={styles2.orDividerLabel}>
          or sign up with
        </Text>
        <div style={styles2.orDividerLine}>
          <Divider />
        </div>
      </div>
      <div style={styles2.ssoRow}>
        <div style={styles2.ssoButton}>
          <Button
            label="Google"
            variant="secondary"
            icon={<Icon icon={GlobeIcon} size="sm" />}
            style={styles2.fullWidth}
            onClick={() => {}}
          />
        </div>
        <div style={styles2.ssoButton}>
          <Button
            label="GitHub"
            variant="secondary"
            icon={<Icon icon={KeyRoundIcon} size="sm" />}
            style={styles2.fullWidth}
            onClick={() => {}}
          />
        </div>
      </div>
    </VStack>
  );
}

/**
 * Email field with the typo-suggestion helper: while the typed address
 * ends in the misspelled domain, a clickable copper chip offers the
 * corrected address; clicking it applies the fix and dismisses the chip
 * (the one stateful transition on this specimen, fully deterministic).
 */
function EmailFieldWithSuggestion() {
  const [email, setEmail] = useState(TYPO_EMAIL);
  const showSuggestion = email === TYPO_EMAIL;
  return (
    <VStack gap={2}>
      <TextInput
        type="email"
        label="Work email"
        value={email}
        onChange={setEmail}
      />
      {showSuggestion ? (
        <button
          type="button"
          style={styles.typoChip}
          onClick={() => setEmail(FIXED_EMAIL)}>
          <Icon icon={WandSparklesIcon} size="xsm" color="inherit" />
          <span>
            Did you mean{' '}
            <span style={styles.typoChipStrong}>{FIXED_EMAIL}</span>?
          </span>
        </button>
      ) : (
        <FieldStatus
          type="success"
          variant="detached"
          message="Address updated - we'll send your verification here."
        />
      )}
    </VStack>
  );
}

// ============= SPECIMEN 01 · GOOD =============

// 'Anvil!raku-26' satisfies all four rules; the last two to flip
// (symbol, no-email) are frozen mid-pop into their checks.
const GOOD_REQUIREMENTS: Requirement[] = [
  {id: 'length', label: 'At least 12 characters', state: 'met'},
  {id: 'number', label: 'Contains a number', state: 'met'},
  {id: 'symbol', label: 'Contains a symbol', state: 'popping'},
  {id: 'no-email', label: "Doesn't contain your email", state: 'popping'},
];

function GoodSpecimen() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(true);
  return (
    <Specimen
      stateId="01 · good"
      note="3/4 strength, all rules met - two ticks frozen mid-pop; CTA live.">
      <div style={styles.cardFrame}>
        <VStack gap={5}>
          <BrandHeader />
          <VStack gap={1}>
            <Heading level={2}>Create your account</Heading>
            <Text color="secondary">
              Ship your first environment in under a minute.
            </Text>
          </VStack>
          <EmailFieldWithSuggestion />
          <VStack gap={2}>
            <PasswordField
              label="Password"
              value={GOOD_PASSWORD}
              isRevealed={isRevealed}
              onToggleReveal={() => setIsRevealed(revealed => !revealed)}
            />
            <StrengthMeter
              score={3}
              hint="Add 2+ characters or another word for Strong."
            />
            <RequirementChecklist items={GOOD_REQUIREMENTS} />
          </VStack>
          <VStack gap={1}>
            <TextInput
              type="password"
              label="Confirm password"
              value={GOOD_PASSWORD}
              onChange={() => {}}
            />
            <FieldStatus
              type="success"
              variant="detached"
              message="Passwords match"
            />
          </VStack>
          <CheckboxInput
            label="I agree to the Basecoat Terms of Service and Privacy Policy"
            size="md"
            value={hasAgreed}
            onChange={setHasAgreed}
          />
          <Button
            label="Create account"
            variant="primary"
            style={styles2.ctaEnabled}
            onClick={() => {}}
          />
          <SsoBlock />
          <HStack
            gap={2}
            vAlign="center"
            hAlign="center"
            style={styles2.signinFooter}>
            <Text type="supporting" color="secondary">
              Already have an account?
            </Text>
            <Link onClick={() => {}}>Sign in</Link>
          </HStack>
        </VStack>
      </div>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · WEAK =============

// 'maya2026' — the first attempt: 8 chars, no symbol, and it contains
// the email's name, so only the number rule passes.
const WEAK_REQUIREMENTS: Requirement[] = [
  {id: 'length', label: 'At least 12 characters', state: 'unmet'},
  {id: 'number', label: 'Contains a number', state: 'met'},
  {id: 'symbol', label: 'Contains a symbol', state: 'unmet'},
  {id: 'no-email', label: "Doesn't contain your email", state: 'unmet'},
];

function WeakSpecimen() {
  const [isRevealed, setIsRevealed] = useState(true);
  const [hasAgreed, setHasAgreed] = useState(false);
  return (
    <Specimen
      stateId="02 · weak"
      note="First attempt: 1/4 strength, three rules unmet; CTA gated.">
      <div style={styles.cardFrame}>
        <VStack gap={5}>
          <BrandHeader />
          <VStack gap={1}>
            <Heading level={2}>Create your account</Heading>
            <Text color="secondary">
              Ship your first environment in under a minute.
            </Text>
          </VStack>
          <TextInput
            type="email"
            label="Work email"
            value={FIXED_EMAIL}
            onChange={() => {}}
          />
          <VStack gap={2}>
            <PasswordField
              label="Password"
              value={WEAK_PASSWORD}
              isRevealed={isRevealed}
              onToggleReveal={() => setIsRevealed(revealed => !revealed)}
            />
            <StrengthMeter
              score={1}
              hint="Avoid your email name; add length and a symbol."
            />
            <RequirementChecklist items={WEAK_REQUIREMENTS} />
          </VStack>
          <TextInput
            type="password"
            label="Confirm password"
            placeholder="Re-enter your password"
            value=""
            onChange={() => {}}
          />
          <CheckboxInput
            label="I agree to the Basecoat Terms of Service and Privacy Policy"
            size="md"
            value={hasAgreed}
            onChange={setHasAgreed}
          />
          <VStack gap={1}>
            <Button
              label="Create account"
              variant="primary"
              isDisabled
              style={styles2.fullWidth}
              onClick={() => {}}
            />
            <Text
              type="supporting"
              color="secondary"
              style={styles2.ctaHelper}>
              Meet all four password rules to continue
            </Text>
          </VStack>
          <SsoBlock />
          <HStack
            gap={2}
            vAlign="center"
            hAlign="center"
            style={styles2.signinFooter}>
            <Text type="supporting" color="secondary">
              Already have an account?
            </Text>
            <Link onClick={() => {}}>Sign in</Link>
          </HStack>
        </VStack>
      </div>
    </Specimen>
  );
}

// ============= PAGE =============

export default function PasswordSignupStrengthTemplate() {
  return (
    <div style={styles.root}>
      <Layout
        height="auto"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Signup strength — 2 states</Heading>
                  <Badge label="state sheet" variant="neutral" />
                </HStack>
              </StackItem>
              <Text type="supporting" color="secondary">
                Basecoat account creation · deterministic fixtures
              </Text>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.stage}>
              <div style={styles.specimenRow}>
                <GoodSpecimen />
                <WeakSpecimen />
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};