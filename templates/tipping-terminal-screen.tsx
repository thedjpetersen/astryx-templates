// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file tipping-terminal-screen.tsx
 * @input Deterministic fixtures only: one order for fictional café
 *   "Marigold & Rye" running the fictional Counterpoint POS — three line
 *   items (6.10 + 9.75 + 5.25 = 21.10 subtotal) plus 2.30 tax = $23.40
 *   total; three tip presets whose amounts derive from cents math
 *   (18% → $4.21, 20% → $4.68, 25% → $5.85); a fixed custom-tip entry of
 *   "500" keyed digits ($5.00 → $28.40 new total); a fixed placeholder
 *   signature squiggle path. No clocks, no randomness, no network assets.
 * @output Tipping Terminal Screen — a counter-facing POS tip prompt for
 *   the fictional Counterpoint point-of-sale, presented as two portrait
 *   tablet specimens on a warm cream stage. Specimen 01 (tip select):
 *   merchant name + $23.40 order-total hero, three big tip tiles
 *   (18% / 20% / 25% with computed dollar amounts; the selected tile
 *   fills with the ink accent), No tip and Custom secondary tiles, a
 *   live new-total preview bar, a split-payment link, a signature strip
 *   with placeholder squiggle and Clear link, and a "looking away is
 *   okay" privacy hint chip. Specimen 02 (custom amount): the same
 *   terminal in its custom-tip numpad state — cents-style amount entry,
 *   3×4 keypad with backspace, live new total, and Apply/Back actions.
 * @position Block template; emitted by `astryx template tipping-terminal-screen`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE. A full-bleed
 * stage div (minHeight 100dvh, warm cream wash) centers a small caption
 * header and a wrapping specimen row; each specimen is a mono-caption label
 * above a 390px-wide portrait device card (rounded 28, brand screen surface,
 * shadow-high). All geometry inside the device derives from the same
 * spacing tokens so the two specimens stay registered side by side.
 *
 * Responsive contract:
 * - >=880px: the two device specimens sit side by side, top-aligned,
 *   centered on the stage.
 * - <880px: the specimen row flex-wraps to a single stacked column; each
 *   device keeps its natural width via width:min(390px, 100%) so nothing
 *   clips at 375px.
 * - Every control (tip tiles, numpad keys, No tip / Custom, links) is a
 *   real button with a >=44px hit target; no hover-only affordances.
 *
 * Container policy (device-specimen archetype): the device frame, tip
 * tiles, numpad keys, and signature strip are hand-rolled buttons/divs in
 * the repo style-object idiom because they are brand hardware chrome, not
 * app panels — no Cards. Astryx supplies text primitives (Heading, Text),
 * stacks, and Icon.
 *
 * Color policy: ONE brand accent — Counterpoint ink,
 * light-dark(#211E1C, #E8E3DB) — used for the selected tip tile, the
 * primary charge button, the wordmark, and the signature squiggle; text on
 * accent uses the paired ON_INK literal (AA in both schemes). The warm
 * cream device/stage surfaces are explicit light-dark() neutral literals
 * (cream in light, warm charcoal in dark) because they are the product's
 * hardware identity; secondary text on those surfaces uses matched warm-ink
 * literals verified AA. Everything outside the brand surfaces stays
 * token-pure.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {
  CheckIcon,
  DeleteIcon,
  EyeOffIcon,
  PenLineIcon,
  UsersIcon,
} from 'lucide-react';

// ============= BRAND CONSTANTS =============
// Counterpoint POS: warm cream hardware surfaces + a single ink accent.

const INK = 'light-dark(#211E1C, #E8E3DB)';
const ON_INK = 'light-dark(#FBF7EE, #211E1C)';
const INK_SOFT = 'light-dark(rgba(33,30,28,0.08), rgba(232,227,219,0.10))';

const STAGE_BG = 'light-dark(#F1EAE0, #191713)';
const SCREEN_BG = 'light-dark(#FBF7EE, #211E19)';
const SCREEN_RAISED = 'light-dark(#F5EFE3, #2A261F)';
const SCREEN_BORDER = 'light-dark(#E2D9C8, #3B362C)';
const TEXT_PRIMARY = 'light-dark(#26221C, #EDE7DB)';
const TEXT_SECONDARY = 'light-dark(#6E6455, #ABA091)';

// ============= FIXTURES =============
// Order math in integer cents so every displayed number reconciles:
// 610 + 975 + 525 = 2110 subtotal; + 230 tax = 2340 total.

const MERCHANT_NAME = 'Marigold & Rye';
const TERMINAL_LABEL = 'Counterpoint · Counter 2';
const ORDER_TOTAL_CENTS = 2340;
const ORDER_META = '3 items · incl. $2.30 tax';

const TIP_PRESETS = [18, 20, 25] as const;
const DEFAULT_TIP_PCT = 20;

// Custom-tip specimen: keyed digits "500" = $5.00 → $28.40 new total.
const CUSTOM_ENTRY_DIGITS = '500';

function tipCentsFor(pct: number): number {
  return Math.round((ORDER_TOTAL_CENTS * pct) / 100);
}

function formatCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = cents % 100;
  return `$${dollars}.${String(rem).padStart(2, '0')}`;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Warm cream stage; centers the caption header + specimen row.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    backgroundColor: STAGE_BG,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  stageHeader: {textAlign: 'center'},
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  specimen: {width: 'min(390px, 100%)'},
  captionId: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    color: TEXT_SECONDARY,
    backgroundColor: INK_SOFT,
    borderRadius: 6,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    whiteSpace: 'nowrap',
  },
  // Portrait tablet device card.
  device: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: SCREEN_BG,
    border: `var(--border-width) solid ${SCREEN_BORDER}`,
    borderRadius: 28,
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    color: TEXT_PRIMARY,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  wordmark: {
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: INK,
  },
  metaText: {fontSize: 12, color: TEXT_SECONDARY},
  hero: {textAlign: 'center', paddingBlock: 'var(--spacing-2)'},
  heroMerchant: {fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY},
  heroAmount: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.1,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: TEXT_SECONDARY,
  },
  // Tip preset tiles: 3-up grid of big tap targets.
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--spacing-2)',
  },
  tile: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-1)',
    minHeight: 72,
    borderRadius: 16,
    border: `var(--border-width) solid ${SCREEN_BORDER}`,
    backgroundColor: SCREEN_RAISED,
    color: TEXT_PRIMARY,
  },
  tileSelected: {
    backgroundColor: INK,
    borderColor: INK,
    color: ON_INK,
  },
  tilePct: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  tileAmt: {fontSize: 13, opacity: 0.85, fontVariantNumeric: 'tabular-nums'},
  secondaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-2)',
  },
  ghostTile: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    minHeight: 44,
    borderRadius: 14,
    border: `var(--border-width) solid ${SCREEN_BORDER}`,
    backgroundColor: 'transparent',
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: 600,
  },
  // New-total preview bar (ink-soft wash).
  newTotalBar: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    backgroundColor: INK_SOFT,
    borderRadius: 12,
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
  newTotalLabel: {fontSize: 13, color: TEXT_SECONDARY},
  newTotalAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
  },
  linkButton: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    minHeight: 44,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2)',
  },
  linkRow: {display: 'flex', justifyContent: 'center'},
  // Signature strip: raised well with baseline rule + placeholder squiggle.
  sigStrip: {
    position: 'relative',
    backgroundColor: SCREEN_RAISED,
    border: `var(--border-width) solid ${SCREEN_BORDER}`,
    borderRadius: 14,
    height: 116,
    overflow: 'hidden',
  },
  sigHeader: {
    position: 'absolute',
    insetBlockStart: 6,
    insetInline: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  sigLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    fontSize: 12,
    color: TEXT_SECONDARY,
    paddingInline: 'var(--spacing-1)',
  },
  sigClear: {minHeight: 32, paddingInline: 'var(--spacing-2)'},
  sigSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  // Privacy hint chip, centered under the tiles.
  privacyChip: {
    alignSelf: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    borderRadius: 999,
    border: `var(--border-width) solid ${SCREEN_BORDER}`,
    paddingBlock: 4,
    paddingInline: 'var(--spacing-2)',
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  // Primary charge button (ink accent).
  ctaButton: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    border: 'none',
    borderRadius: 14,
    minHeight: 52,
    backgroundColor: INK,
    color: ON_INK,
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    width: '100%',
  },
  // Custom-amount entry + numpad.
  entryBlock: {textAlign: 'center', paddingBlock: 'var(--spacing-2)'},
  entryAmount: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.1,
    color: TEXT_PRIMARY,
    fontVariantNumeric: 'tabular-nums',
    borderBottom: `2px solid ${INK}`,
    display: 'inline-block',
    paddingInline: 'var(--spacing-3)',
    paddingBottom: 2,
  },
  entryHint: {fontSize: 12, color: TEXT_SECONDARY, marginTop: 6},
  numpad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--spacing-2)',
  },
  numKey: {
    appearance: 'none',
    font: 'inherit',
    cursor: 'pointer',
    minHeight: 56,
    borderRadius: 14,
    border: `var(--border-width) solid ${SCREEN_BORDER}`,
    backgroundColor: SCREEN_RAISED,
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyBlank: {visibility: 'hidden'},
};

// ============= SHARED DEVICE BITS =============

/**
 * Specimen wrapper: mono state-id caption + one-line note above the device.
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
          <span style={styles.captionId}>{stateId}</span>
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </HStack>
        {children}
      </VStack>
    </div>
  );
}

/**
 * Portrait terminal shell: Counterpoint wordmark status bar up top, then
 * whatever screen state the specimen freezes.
 */
function DeviceFrame({children}: {children: ReactNode}) {
  return (
    <div style={styles.device}>
      <div style={styles.statusBar}>
        <span style={styles.wordmark}>Counterpoint</span>
        <span style={styles.metaText}>{TERMINAL_LABEL}</span>
      </div>
      {children}
    </div>
  );
}

/** Merchant + order-total hero shared by both screen states. */
function OrderHero() {
  return (
    <div style={styles.hero}>
      <VStack gap={1} hAlign="center">
        <span style={styles.heroMerchant}>{MERCHANT_NAME}</span>
        <span style={styles.heroAmount}>
          {formatCents(ORDER_TOTAL_CENTS)}
        </span>
        <span style={styles.metaText}>{ORDER_META}</span>
      </VStack>
    </div>
  );
}

/** "Looking away is okay" privacy hint chip. */
function PrivacyChip() {
  return (
    <span style={styles.privacyChip}>
      <Icon icon={EyeOffIcon} size="sm" color="inherit" />
      Your server looks away while you choose
    </span>
  );
}

// Fixed placeholder squiggle: one deterministic path over a 340x116 box.
const SIGNATURE_PATH =
  'M28 78 C 46 44, 62 44, 74 66 C 84 84, 96 86, 108 64 ' +
  'C 122 40, 138 40, 150 62 C 160 80, 174 82, 188 60 ' +
  'C 200 42, 216 46, 224 64 C 232 80, 248 78, 262 58 L 300 46';

/**
 * Signature strip: baseline rule + X mark + placeholder squiggle, with the
 * Sign-here label and a Clear link pinned to the top edge.
 */
function SignatureStrip({
  hasSignature,
  onClear,
}: {
  hasSignature: boolean;
  onClear: () => void;
}) {
  return (
    <div style={styles.sigStrip}>
      <svg
        style={styles.sigSvg}
        viewBox="0 0 340 116"
        preserveAspectRatio="none"
        role="img"
        aria-label={
          hasSignature ? 'Signature captured' : 'Empty signature area'
        }>
        <line
          x1={24}
          y1={92}
          x2={316}
          y2={92}
          stroke={SCREEN_BORDER}
          strokeWidth={1.5}
        />
        <text
          x={24}
          y={86}
          fill={TEXT_SECONDARY}
          fontSize={14}
          fontFamily="inherit">
          ×
        </text>
        {hasSignature ? (
          <path
            d={SIGNATURE_PATH}
            fill="none"
            stroke={INK}
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
      <div style={styles.sigHeader}>
        <span style={styles.sigLabel}>
          <Icon icon={PenLineIcon} size="sm" color="inherit" />
          Sign here
        </span>
        {hasSignature ? (
          <button
            type="button"
            style={{...styles.linkButton, ...styles.sigClear}}
            onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ============= SPECIMEN 01 · TIP SELECT =============

type TipChoice = number | 'none' | null;

function TipTile({
  pct,
  isSelected,
  onSelect,
}: {
  pct: number;
  isSelected: boolean;
  onSelect: (pct: number) => void;
}) {
  const tileStyle = isSelected
    ? {...styles.tile, ...styles.tileSelected}
    : styles.tile;
  return (
    <button
      type="button"
      style={tileStyle}
      aria-pressed={isSelected}
      onClick={() => onSelect(pct)}>
      <HStack gap={1} vAlign="center">
        {isSelected ? (
          <Icon icon={CheckIcon} size="sm" color="inherit" />
        ) : null}
        <span style={styles.tilePct}>{pct}%</span>
      </HStack>
      <span style={styles.tileAmt}>{formatCents(tipCentsFor(pct))}</span>
    </button>
  );
}

function TipSelectScreen() {
  // Frozen default: 20% selected → $4.68 tip → $28.08 new total.
  const [choice, setChoice] = useState<TipChoice>(DEFAULT_TIP_PCT);
  const [hasSignature, setHasSignature] = useState(true);

  const tipCents =
    typeof choice === 'number' ? tipCentsFor(choice) : 0;
  const newTotalCents = ORDER_TOTAL_CENTS + tipCents;

  return (
    <DeviceFrame>
      <OrderHero />
      <span style={styles.sectionLabel}>Add a tip?</span>
      <div style={styles.tileGrid}>
        {TIP_PRESETS.map(pct => (
          <TipTile
            key={pct}
            pct={pct}
            isSelected={choice === pct}
            onSelect={setChoice}
          />
        ))}
      </div>
      <div style={styles.secondaryGrid}>
        <button
          type="button"
          style={
            choice === 'none'
              ? {...styles.ghostTile, ...styles.tileSelected}
              : styles.ghostTile
          }
          aria-pressed={choice === 'none'}
          onClick={() => setChoice('none')}>
          No tip
        </button>
        <button type="button" style={styles.ghostTile}>
          Custom
        </button>
      </div>
      <div style={styles.newTotalBar}>
        <span style={styles.newTotalLabel}>
          {typeof choice === 'number'
            ? `New total with ${choice}% tip`
            : 'New total'}
        </span>
        <span style={styles.newTotalAmount}>
          {formatCents(newTotalCents)}
        </span>
      </div>
      <PrivacyChip />
      <SignatureStrip
        hasSignature={hasSignature}
        onClear={() => setHasSignature(false)}
      />
      <button type="button" style={styles.ctaButton}>
        Charge {formatCents(newTotalCents)}
      </button>
      <div style={styles.linkRow}>
        <button type="button" style={styles.linkButton}>
          <Icon icon={UsersIcon} size="sm" color="inherit" />
          Split this payment
        </button>
      </div>
    </DeviceFrame>
  );
}

// ============= SPECIMEN 02 · CUSTOM AMOUNT (NUMPAD) =============

const NUMPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const MAX_ENTRY_DIGITS = 5; // caps custom tips at $999.99

/** Cents-style entry: keyed digits fill from the right ("500" → $5.00). */
function entryToCents(digits: string): number {
  return digits.length === 0 ? 0 : parseInt(digits, 10);
}

function CustomTipScreen() {
  // Frozen default: "500" keyed → $5.00 tip → $28.40 new total.
  const [digits, setDigits] = useState(CUSTOM_ENTRY_DIGITS);

  const tipCents = entryToCents(digits);
  const newTotalCents = ORDER_TOTAL_CENTS + tipCents;

  const pressDigit = (digit: string) => {
    setDigits(prev => {
      if (prev.length >= MAX_ENTRY_DIGITS) {
        return prev;
      }
      const next = prev + digit;
      // Strip a leading zero so "0" then "5" reads $0.05, not $00.5.
      return next.replace(/^0+(?=\d)/, '');
    });
  };
  const pressBackspace = () => {
    setDigits(prev => prev.slice(0, -1));
  };

  return (
    <DeviceFrame>
      <OrderHero />
      <span style={styles.sectionLabel}>Custom tip</span>
      <div style={styles.entryBlock}>
        <span style={styles.entryAmount} aria-live="polite">
          {formatCents(tipCents)}
        </span>
        <div style={styles.entryHint}>
          Keyed in cents — press 5 · 0 · 0 for $5.00
        </div>
      </div>
      <div style={styles.numpad}>
        {NUMPAD_DIGITS.map(digit => (
          <button
            key={digit}
            type="button"
            style={styles.numKey}
            onClick={() => pressDigit(digit)}>
            {digit}
          </button>
        ))}
        <span style={{...styles.numKey, ...styles.numKeyBlank}} />
        <button
          type="button"
          style={styles.numKey}
          onClick={() => pressDigit('0')}>
          0
        </button>
        <button
          type="button"
          style={styles.numKey}
          aria-label="Delete last digit"
          onClick={pressBackspace}>
          <Icon icon={DeleteIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.newTotalBar}>
        <span style={styles.newTotalLabel}>New total with custom tip</span>
        <span style={styles.newTotalAmount}>
          {formatCents(newTotalCents)}
        </span>
      </div>
      <PrivacyChip />
      <button type="button" style={styles.ctaButton}>
        {tipCents > 0
          ? `Apply ${formatCents(tipCents)} tip`
          : 'Continue without tip'}
      </button>
      <div style={styles.linkRow}>
        <button type="button" style={styles.linkButton}>
          Back to preset tips
        </button>
      </div>
    </DeviceFrame>
  );
}

// ============= PAGE =============

export default function TippingTerminalScreenTemplate() {
  return (
    <div style={styles.stage}>
      <VStack gap={2} hAlign="center" style={styles.stageHeader}>
        <Heading level={1}>Counterpoint — tipping terminal</Heading>
        <Text type="supporting" color="secondary">
          Counter-facing tip prompt · two frozen states · deterministic
          fixtures
        </Text>
      </VStack>
      <div style={styles.specimenRow}>
        <Specimen
          stateId="01 · tip-select"
          note="Preset tiles; 20% selected with live new-total preview.">
          <TipSelectScreen />
        </Specimen>
        <Specimen
          stateId="02 · custom-amount"
          note="Custom tip numpad; $5.00 keyed in cents-style entry.">
          <CustomTipScreen />
        </Specimen>
      </div>
    </div>
  );
}
