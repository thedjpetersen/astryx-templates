// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file wallet-card-fan.tsx
 * @input Deterministic fixtures only (five payment/loyalty cards — two
 *   credit, one debit, two loyalty — each with a fixture PAN or member
 *   number, expiry, CVV, balance/points figure, a token-gradient face
 *   recipe, a brand-free SVG network glyph, and six ledger transactions;
 *   a merged all-cards activity feed is derived from the same arrays via a
 *   deterministic sortKey — no clocks, no randomness, no network assets)
 * @output Apple-Wallet-style card fan: five cards rest in an overlapping
 *   vertical fan showing only their top edges. Tapping one slides it up to
 *   the hero position while the rest compress downward into a tighter
 *   bottom pocket with staggered transition delays that read as one spring
 *   gesture — promote leads, each compressed card follows 50ms behind the
 *   last. A second tap flips the hero in 3D (rotateY over preserve-3d,
 *   perspective on the stage) to reveal the masked PAN / CVV back, with an
 *   eye toggle that unmasks the fixture number. Dragging the hero downward
 *   (pointer events with capture) tucks it back into the fan past a 90px
 *   threshold — the identical collapse commit that Esc and the "Back to
 *   stack" button drive. Beneath the fan a per-card transaction ledger
 *   cascades in with per-row entrance offsets and filters between charges
 *   and credits; with no card promoted it shows the merged all-cards feed.
 *   Cards can be frozen (frost overlay + badge) and set as the default
 *   payment card, and a wallet-summary rail mirrors balances with per-card
 *   jump buttons. ↑/↓ cycle the promoted card, F flips, Esc collapses —
 *   every gesture has a key or button twin.
 * @position Page template; emitted by `astryx template wallet-card-fan`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (wallet
 * mark, title, card count + total-available meta). LayoutContent scrolls a
 * centered maxWidth-420 column: the fan stage (fixed 472px pocket,
 * overflow hidden so compressed cards clip like a wallet pocket), the
 * hero action row, the status line, then the ledger Card. LayoutPanel end
 * 320 docks the wallet summary (balance stats, per-card rows, notes) on
 * wide viewports.
 *
 * Container policy (interaction-showcase archetype): the page chrome is
 * frame-first; the wallet cards are hand-rolled <button> shells (token
 * gradients, radius + shadow tokens) because they need full transform
 * ownership for the fan/flip choreography, while Astryx Cards are reserved
 * for the ledger and the stacked summary fallback. Network glyphs, the
 * chip, and the contactless mark are inline SVG over card-ink tokens — no
 * brand assets, no image files, no drag library.
 *
 * Responsive contract:
 * - >900px: header | fan column (maxWidth 420 centered) | summary rail 320
 *   (docked LayoutPanel). Kbd hints (↑ ↓ / F / Esc) render under the
 *   action row.
 * - <=900px: the summary rail undocks and renders as a Card at the bottom
 *   of the content column (single-pane fallback, no side panel).
 * - <=640px: the header meta line hides, action buttons grow to 44px
 *   (size="lg"), the ledger filter grows to size="lg", and the Kbd hint
 *   row hides (keys stay live — they are an enhancement, never the only
 *   path). At 375px the 472px fan pocket is the entire above-fold view and
 *   the ledger scrolls beneath it.
 * - The fan stage clips overflow on both axes deliberately (the pocket
 *   look); the page column itself never scrolls horizontally.
 * - No hover-only interactions: cards promote/flip on tap or Enter/Space,
 *   the drag-to-collapse gesture has button and Esc twins, and every
 *   figure a card face encodes is restated in the ledger and summary rail.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair. Card faces
 * are deep token gradients whose light-dark() pairs darken via
 * --color-text-primary in light scheme and via --color-background-body in dark
 * scheme, so the near-white card ink (itself a light-dark() pair) keeps
 * contrast in both schemes. The magstripe is a documented scheme-locked
 * dark surface (a stripe is black in any scheme) built from the same
 * light-dark() idiom. Motion: promote/compress staggers, the 3D flip, and
 * the ledger cascade are CSS transitions/keyframes; prefers-reduced-motion
 * swaps slides and flips for fades or instant reflow.
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Kbd} from '@astryxdesign/core/Kbd';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BanknoteIcon,
  CarIcon,
  ClapperboardIcon,
  CoffeeIcon,
  EyeIcon,
  EyeOffIcon,
  GiftIcon,
  LayersIcon,
  PlaneIcon,
  RepeatIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SnowflakeIcon,
  StarIcon,
  UtensilsIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react';

// ============= MOTION CONSTANTS =============
// The craft bar: promote, compress, and stagger must read as ONE gesture
// even though it is nothing but transition-delay math.

/** Card height inside the fan stage. */
const CARD_H = 208;
/** Visible top edge per resting card in the fan. */
const FAN_PEEK = 66;
/** Gap between the hero card and the compressed pocket below it. */
const STACK_GAP = 24;
/** Visible sliver per compressed card in the pocket. */
const POCKET_PEEK = 36;
/** Fan stage height: 5 resting cards = CARD_H + 4 * FAN_PEEK. */
const STAGE_H = CARD_H + 4 * FAN_PEEK; // 472
/** Downward hero drag (px, pre-resistance) that commits a collapse. */
const TUCK_THRESHOLD = 90;
/** Drag resistance: the hero follows the pointer at this ratio. */
const DRAG_RESIST = 0.6;

const SETTLE_MS = 460;
const FLIP_MS = 560;
const FADE_MS = 180;
/** Per-card lag that turns promote+compress into spring choreography. */
const STAGGER_MS = 50;
/** Compressed cards start after the hero has visibly launched. */
const PROMOTE_LEAD_MS = 40;
/** Per-row lag for the ledger cascade. */
const LEDGER_STAGGER_MS = 45;

/** Promote ease: visible overshoot so the hero "springs" into place. */
const SPRING_EASE = 'cubic-bezier(0.34, 1.28, 0.44, 1)';
/** Compress/settle ease for the pocket cards. */
const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ============= CARD INK & SURFACES =============
// Card faces are deep token gradients; the ink is a light-dark() pair that
// resolves near-white in BOTH schemes (background is white in light,
// text-primary is white in dark), so embossed numbers always contrast.

const CARD_INK = 'light-dark(var(--color-background-body), var(--color-text-primary))';
const CARD_INK_SOFT =
  'light-dark(color-mix(in srgb, var(--color-background-body) 76%, transparent), color-mix(in srgb, var(--color-text-primary) 76%, transparent))';
const CARD_INK_FAINT =
  'light-dark(color-mix(in srgb, var(--color-background-body) 42%, transparent), color-mix(in srgb, var(--color-text-primary) 42%, transparent))';
/** Emboss shadow ink — dark in both schemes. */
const INK_SHADOW =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 45%, transparent), color-mix(in srgb, var(--color-background-body) 70%, transparent))';
/**
 * Magstripe: a documented scheme-locked dark surface (stripes are black on
 * any card); the pair keeps it a touch lifted off dark card faces.
 */
const STRIPE_SURFACE =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 90%, transparent), color-mix(in srgb, var(--color-background-body) 72%, transparent))';
/** Signature/CVV panel: near-white in both schemes, like CARD_INK. */
const PANEL_SURFACE =
  'light-dark(color-mix(in srgb, var(--color-background-body) 90%, transparent), color-mix(in srgb, var(--color-text-primary) 88%, transparent))';
/** Ink over PANEL_SURFACE — dark in both schemes. */
const PANEL_INK = 'light-dark(var(--color-text-primary), var(--color-background-body))';
/** Frost overlay for frozen cards. */
const FROST_SURFACE =
  'light-dark(color-mix(in srgb, var(--color-background-body) 46%, transparent), color-mix(in srgb, var(--color-background-body) 52%, transparent))';

interface CardGradient {
  from: string;
  to: string;
}

/**
 * Five face recipes. Each stop is a light-dark() pair: the light-scheme arm
 * deepens the hue by mixing toward --color-text-primary (dark there), the
 * dark-scheme arm deepens by mixing toward --color-background-body (dark there)
 * — so the face is a saturated, dark-enough surface in both schemes.
 */
const GRADIENTS: Record<string, CardGradient> = {
  graphite: {
    from: 'light-dark(color-mix(in srgb, var(--color-text-primary) 90%, var(--color-accent)), color-mix(in srgb, var(--color-background-body) 55%, var(--color-text-primary)))',
    to: 'light-dark(color-mix(in srgb, var(--color-text-primary) 70%, var(--color-accent)), color-mix(in srgb, var(--color-background-body) 30%, var(--color-accent)))',
  },
  ocean: {
    from: 'light-dark(color-mix(in srgb, var(--color-accent) 82%, var(--color-text-primary)), color-mix(in srgb, var(--color-accent) 58%, var(--color-background-body)))',
    to: 'light-dark(color-mix(in srgb, var(--color-accent) 92%, var(--color-success)), color-mix(in srgb, var(--color-accent) 40%, var(--color-background-body)))',
  },
  fern: {
    from: 'light-dark(color-mix(in srgb, var(--color-success) 78%, var(--color-text-primary)), color-mix(in srgb, var(--color-success) 52%, var(--color-background-body)))',
    to: 'light-dark(color-mix(in srgb, var(--color-success) 68%, var(--color-accent)), color-mix(in srgb, var(--color-success) 34%, var(--color-background-body)))',
  },
  sunset: {
    from: 'light-dark(color-mix(in srgb, var(--color-warning) 72%, var(--color-error)), color-mix(in srgb, var(--color-warning) 48%, var(--color-background-body)))',
    to: 'light-dark(color-mix(in srgb, var(--color-error) 74%, var(--color-text-primary)), color-mix(in srgb, var(--color-error) 46%, var(--color-background-body)))',
  },
  plum: {
    from: 'light-dark(color-mix(in srgb, var(--color-error) 62%, var(--color-accent)), color-mix(in srgb, var(--color-error) 44%, var(--color-background-body)))',
    to: 'light-dark(color-mix(in srgb, var(--color-accent) 66%, var(--color-text-primary)), color-mix(in srgb, var(--color-accent) 42%, var(--color-background-body)))',
  },
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered fan column.
  page: {maxWidth: 420, marginInline: 'auto', width: '100%'},
  // The fan stage: a fixed-height pocket; cards render absolute inside and
  // the compressed stack clips at the bottom edge like a wallet pocket.
  stage: {
    position: 'relative',
    height: STAGE_H,
    overflow: 'hidden',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    // Perspective lives on the stage so the hero flip has real depth.
    perspective: 1400,
  },
  // Every card is a real <button>: tap/Enter/Space all drive the same
  // promote/flip commit — never pointer-only.
  cardButton: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: CARD_H,
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 16,
    outlineOffset: 3,
    display: 'block',
    width: '100%',
  },
  flipInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
  },
  face: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    overflow: 'hidden',
    color: CARD_INK,
    boxShadow: 'var(--shadow-med)',
    display: 'flex',
    flexDirection: 'column',
  },
  faceFront: {
    padding: '16px 20px 18px',
    justifyContent: 'space-between',
  },
  faceBack: {
    paddingBottom: 16,
  },
  faceLifted: {boxShadow: 'var(--shadow-high)'},
  // Front face pieces.
  faceTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  issuerLine: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: CARD_INK_SOFT,
  },
  cardName: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: '0.01em',
    lineHeight: 1.25,
  },
  chipRow: {display: 'flex', alignItems: 'center', gap: 10},
  // Embossed PAN: tabular digits + a two-tone text-shadow that reads as
  // stamped metal on the gradient in both schemes.
  numberRow: {
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: '0.14em',
    fontVariantNumeric: 'tabular-nums',
    textShadow: `0 1px 0 ${INK_SHADOW}, 0 -1px 0 ${CARD_INK_FAINT}`,
    whiteSpace: 'nowrap',
  },
  faceBottomRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  faceFieldLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: CARD_INK_FAINT,
  },
  faceFieldValue: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  faceBalance: {
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
  },
  // Back face pieces.
  stripe: {
    height: 36,
    marginTop: 20,
    backgroundColor: STRIPE_SURFACE,
    flexShrink: 0,
  },
  backBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '12px 20px 0',
    gap: 8,
  },
  signatureRow: {display: 'flex', alignItems: 'stretch', gap: 10},
  signaturePanel: {
    flex: 1,
    minWidth: 0,
    height: 34,
    borderRadius: 6,
    backgroundColor: PANEL_SURFACE,
    color: PANEL_INK,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    fontSize: 12,
    fontStyle: 'italic',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  cvvBox: {
    width: 62,
    flexShrink: 0,
    height: 34,
    borderRadius: 6,
    backgroundColor: PANEL_SURFACE,
    color: PANEL_INK,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  cvvLabel: {fontSize: 8, fontWeight: 700, letterSpacing: '0.12em'},
  cvvValue: {fontSize: 13, fontWeight: 700},
  backNumber: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: '0.12em',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  backMetaRow: {display: 'flex', gap: 24},
  supportLine: {fontSize: 10, color: CARD_INK_FAINT, lineHeight: 1.4},
  // Frozen frost overlay (pointer-events none; the badge restates state).
  frostOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    backgroundColor: FROST_SURFACE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'none',
    color: 'light-dark(var(--color-text-primary), var(--color-text-primary))',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  // Action row under the fan: real Buttons, ~40px targets (44px <=640px).
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
  },
  hintRow: {flexWrap: 'wrap'},
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // Ledger.
  ledgerChip: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ledgerAmountIn: {
    color: 'var(--color-success)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  ledgerAmountOut: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Summary rail.
  railStatBox: {
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  railStatValue: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
  },
  railCardButton: {
    display: 'block',
    width: '100%',
    minHeight: 44,
    padding: '6px 0',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 'var(--radius-element)',
  },
  railSwatch: {
    width: 46,
    height: 30,
    borderRadius: 6,
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
  },
  brandChip: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-element)',
    background: `linear-gradient(135deg, ${GRADIENTS.ocean.from}, ${GRADIENTS.plum.to})`,
    color: CARD_INK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

// Ledger cascade keyframes; rows opt out entirely under reduced motion.
const LEDGER_KEYFRAMES = `
@keyframes wallet-card-fan-ledger-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`;

// ============= DATA =============
// Deterministic fixtures: five cards with fixture PANs/member numbers and
// six-transaction ledgers each. sortKey orders the merged all-cards feed
// (higher = newer). No clocks, no randomness, no network assets.

type CardKind = 'credit' | 'debit' | 'loyalty';
type Unit = 'usd' | 'pts';
type GlyphKind = 'rings' | 'wave' | 'leaf' | 'orbit' | 'spark';
type Category =
  | 'dining'
  | 'grocery'
  | 'travel'
  | 'transport'
  | 'coffee'
  | 'entertainment'
  | 'shopping'
  | 'payment'
  | 'reward';

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  dining: UtensilsIcon,
  grocery: ShoppingCartIcon,
  travel: PlaneIcon,
  transport: CarIcon,
  coffee: CoffeeIcon,
  entertainment: ClapperboardIcon,
  shopping: ShoppingBagIcon,
  payment: BanknoteIcon,
  reward: GiftIcon,
};

interface Txn {
  id: string;
  /** Merge order for the all-cards feed; higher = newer. */
  sortKey: number;
  date: string;
  merchant: string;
  category: Category;
  /** Signed: negative = charge/redemption, positive = credit/earning. */
  amount: number;
}

interface WalletCard {
  id: string;
  name: string;
  /** Small-caps issuer + kind line on the card's visible top edge. */
  issuerLine: string;
  kind: CardKind;
  holder: string;
  /** Fixture PAN groups (usd) or member-number groups (loyalty). */
  numberGroups: string[];
  expiry: string;
  cvv: string;
  unit: Unit;
  /** Headline figure: balance owed, available cash, or points. */
  balance: number;
  balanceLabel: string;
  /** Secondary figure line for the rail (limit, tier, and so on). */
  balanceNote: string;
  gradient: keyof typeof GRADIENTS;
  glyph: GlyphKind;
  supportLine: string;
  txns: Txn[];
}

const HOLDER = 'Avery R. Chen';

const CARDS: WalletCard[] = [
  {
    id: 'sable',
    name: 'Sable Reserve',
    issuerLine: 'Sable Bank · Credit',
    kind: 'credit',
    holder: HOLDER,
    numberGroups: ['5312', '7742', '0913', '4821'],
    expiry: '09/29',
    cvv: '417',
    unit: 'usd',
    balance: 2418.22,
    balanceLabel: 'Balance',
    balanceNote: 'of $12,000 limit',
    gradient: 'graphite',
    glyph: 'rings',
    supportLine:
      'Sable Bank, N.A. · Member FDIC · Questions? 1-800 on the back office portal',
    txns: [
      {id: 'sa-1', sortKey: 30, date: 'Jun 30', merchant: 'Alto Cucina', category: 'dining', amount: -84.6},
      {id: 'sa-2', sortKey: 27, date: 'Jun 27', merchant: 'Northwind Air — seat upgrade', category: 'travel', amount: -59},
      {id: 'sa-3', sortKey: 23, date: 'Jun 24', merchant: 'Payment — thank you', category: 'payment', amount: 900},
      {id: 'sa-4', sortKey: 19, date: 'Jun 20', merchant: 'Harbor Books', category: 'shopping', amount: -32.4},
      {id: 'sa-5', sortKey: 14, date: 'Jun 15', merchant: 'Cinema Royale', category: 'entertainment', amount: -31},
      {id: 'sa-6', sortKey: 9, date: 'Jun 10', merchant: 'Meridian Grill', category: 'dining', amount: -128.75},
    ],
  },
  {
    id: 'everyday',
    name: 'Everyday Checking',
    issuerLine: 'Harborline · Debit',
    kind: 'debit',
    holder: HOLDER,
    numberGroups: ['4402', '1189', '5527', '7310'],
    expiry: '02/28',
    cvv: '903',
    unit: 'usd',
    balance: 5204.61,
    balanceLabel: 'Available',
    balanceNote: 'Checking ····7310',
    gradient: 'ocean',
    glyph: 'wave',
    supportLine:
      'Harborline Financial · Debit purchases draw from Everyday Checking',
    txns: [
      {id: 'ev-1', sortKey: 29, date: 'Jun 30', merchant: 'FreshMart', category: 'grocery', amount: -96.18},
      {id: 'ev-2', sortKey: 26, date: 'Jun 26', merchant: 'Payroll — Lumen Studio', category: 'payment', amount: 2140},
      {id: 'ev-3', sortKey: 22, date: 'Jun 23', merchant: 'City Transit reload', category: 'transport', amount: -40},
      {id: 'ev-4', sortKey: 17, date: 'Jun 18', merchant: 'Corner Bodega', category: 'grocery', amount: -23.52},
      {id: 'ev-5', sortKey: 12, date: 'Jun 13', merchant: 'Refund — Harbor Books', category: 'payment', amount: 18.99},
      {id: 'ev-6', sortKey: 7, date: 'Jun 8', merchant: 'Shell — fuel', category: 'transport', amount: -47.3},
    ],
  },
  {
    id: 'verde',
    name: 'Verde Rewards',
    issuerLine: 'Verde Credit Union · Credit',
    kind: 'credit',
    holder: HOLDER,
    numberGroups: ['5588', '3021', '6644', '1078'],
    expiry: '11/27',
    cvv: '268',
    unit: 'usd',
    balance: 612.09,
    balanceLabel: 'Balance',
    balanceNote: 'of $6,500 limit · 2% back',
    gradient: 'fern',
    glyph: 'leaf',
    supportLine:
      'Verde Credit Union · 2% back on groceries and transit, 1% everywhere',
    txns: [
      {id: 've-1', sortKey: 28, date: 'Jun 29', merchant: 'Green Valley Market', category: 'grocery', amount: -88.34},
      {id: 've-2', sortKey: 24, date: 'Jun 25', merchant: 'Juniper & Vine', category: 'dining', amount: -64.2},
      {id: 've-3', sortKey: 20, date: 'Jun 21', merchant: 'Cashback credit', category: 'reward', amount: 12.86},
      {id: 've-4', sortKey: 15, date: 'Jun 16', merchant: 'Trailhead Outfitters', category: 'shopping', amount: -142.6},
      {id: 've-5', sortKey: 11, date: 'Jun 12', merchant: 'Payment — thank you', category: 'payment', amount: 450},
      {id: 've-6', sortKey: 5, date: 'Jun 6', merchant: 'City Transit reload', category: 'transport', amount: -40},
    ],
  },
  {
    id: 'skyward',
    name: 'Skyward Miles',
    issuerLine: 'Skyward Airlines · Loyalty',
    kind: 'loyalty',
    holder: HOLDER,
    numberGroups: ['SKY', '4471', '8820', '553'],
    expiry: '—',
    cvv: '—',
    unit: 'pts',
    balance: 18450,
    balanceLabel: 'Miles',
    balanceNote: 'Silver tier · 4,550 to Gold',
    gradient: 'sunset',
    glyph: 'orbit',
    supportLine:
      'Skyward Airlines frequent flyer · Miles post 3–5 days after travel',
    txns: [
      {id: 'sk-1', sortKey: 25, date: 'Jun 26', merchant: 'Flight SEA → DEN', category: 'travel', amount: 1024},
      {id: 'sk-2', sortKey: 21, date: 'Jun 22', merchant: 'Partner hotel — Alpine Lodge', category: 'travel', amount: 640},
      {id: 'sk-3', sortKey: 16, date: 'Jun 17', merchant: 'Seat upgrade redemption', category: 'reward', amount: -7500},
      {id: 'sk-4', sortKey: 10, date: 'Jun 11', merchant: 'Flight DEN → SEA', category: 'travel', amount: 1024},
      {id: 'sk-5', sortKey: 6, date: 'Jun 7', merchant: 'Dining partner — Alto Cucina', category: 'dining', amount: 254},
      {id: 'sk-6', sortKey: 2, date: 'Jun 2', merchant: 'Status bonus — Q2', category: 'reward', amount: 2000},
    ],
  },
  {
    id: 'roast',
    name: 'Roast Club Card',
    issuerLine: 'Roast Collective · Loyalty',
    kind: 'loyalty',
    holder: HOLDER,
    numberGroups: ['RC', '2210', '4478'],
    expiry: '—',
    cvv: '—',
    unit: 'pts',
    balance: 340,
    balanceLabel: 'Beans',
    balanceNote: '160 beans to a free pour-over',
    gradient: 'plum',
    glyph: 'spark',
    supportLine:
      'Roast Collective · 10 beans per drink · 500 beans = one free pour-over',
    txns: [
      {id: 'ro-1', sortKey: 31, date: 'Jul 1', merchant: 'Oat latte — Pike St', category: 'coffee', amount: 10},
      {id: 'ro-2', sortKey: 18, date: 'Jun 19', merchant: 'Cold brew — Union Station', category: 'coffee', amount: 10},
      {id: 'ro-3', sortKey: 13, date: 'Jun 14', merchant: 'Free pour-over redeemed', category: 'reward', amount: -500},
      {id: 'ro-4', sortKey: 8, date: 'Jun 9', merchant: 'Cappuccino — Pike St', category: 'coffee', amount: 10},
      {id: 'ro-5', sortKey: 4, date: 'Jun 5', merchant: 'Double-bean Tuesday', category: 'reward', amount: 20},
      {id: 'ro-6', sortKey: 1, date: 'Jun 1', merchant: 'Espresso — Harbor Kiosk', category: 'coffee', amount: 10},
    ],
  },
];

const CARD_INDEX_BY_ID = new Map(CARDS.map((card, index) => [card.id, index]));

function getCard(id: string): WalletCard {
  const index = CARD_INDEX_BY_ID.get(id);
  if (index == null) {
    throw new Error(`Unknown card id: ${id}`);
  }
  return CARDS[index];
}

/** Merged all-cards feed for the unselected state, newest first. */
interface FeedTxn extends Txn {
  cardId: string;
  cardName: string;
  unit: Unit;
}

const WALLET_FEED: FeedTxn[] = CARDS.flatMap(card =>
  card.txns.map(txn => ({
    ...txn,
    cardId: card.id,
    cardName: card.name,
    unit: card.unit,
  })),
).sort((a, b) => b.sortKey - a.sortKey);

// ============= FORMATTING =============

function formatUsd(value: number): string {
  const abs = Math.abs(value);
  const text = abs.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '-' : ''}$${text}`;
}

function formatPts(value: number): string {
  return `${Math.abs(value).toLocaleString('en-US')}`;
}

/** Signed ledger amount: "-$84.60", "+$900", "+1,024 mi", "-500 beans". */
function formatSignedAmount(amount: number, unit: Unit, cardId?: string): string {
  const sign = amount < 0 ? '-' : '+';
  if (unit === 'usd') {
    return `${sign}${formatUsd(Math.abs(amount)).slice(0)}`;
  }
  const suffix = cardId === 'roast' ? 'beans' : 'mi';
  return `${sign}${formatPts(amount)} ${suffix}`;
}

/** Headline figure on card faces and the rail. */
function formatBalance(card: WalletCard): string {
  if (card.unit === 'usd') {
    return formatUsd(card.balance);
  }
  return `${formatPts(card.balance)} ${card.id === 'roast' ? 'beans' : 'mi'}`;
}

function maskedNumber(card: WalletCard): string {
  const last = card.numberGroups[card.numberGroups.length - 1];
  const dots = card.numberGroups
    .slice(0, -1)
    .map(group => '•'.repeat(group.length))
    .join(' ');
  return `${dots} ${last}`;
}

function fullNumber(card: WalletCard): string {
  return card.numberGroups.join(' ');
}

// ============= FAN CHOREOGRAPHY =============
// Promote, compress, and collapse are all the same pose function: every
// card gets a translateY + scale + a transition-delay, and the delays are
// what make three transitions read as one spring gesture.

interface CardPose {
  y: number;
  scale: number;
  z: number;
  delayMs: number;
  ease: string;
}

function cardPose(index: number, selectedIndex: number | null): CardPose {
  if (selectedIndex == null) {
    // Resting fan: top edges only, re-dealt top-to-bottom on collapse.
    return {
      y: index * FAN_PEEK,
      scale: 1,
      z: index + 1,
      delayMs: index * STAGGER_MS,
      ease: SETTLE_EASE,
    };
  }
  if (index === selectedIndex) {
    // Hero: leads the choreography with a springy overshoot.
    return {y: 0, scale: 1, z: 40, delayMs: 0, ease: SPRING_EASE};
  }
  // Pocket order preserves the original fan order minus the hero.
  const j = index < selectedIndex ? index : index - 1;
  return {
    y: CARD_H + STACK_GAP + j * POCKET_PEEK,
    scale: 0.97 - j * 0.012,
    z: j + 1,
    delayMs: PROMOTE_LEAD_MS + j * STAGGER_MS,
    ease: SETTLE_EASE,
  };
}

// ============= SVG GLYPHS =============
// Brand-free network marks, the chip, and the contactless arcs — all inline
// SVG over the card-ink pairs. No image assets.

function NetworkGlyph({kind}: {kind: GlyphKind}) {
  switch (kind) {
    case 'rings':
      return (
        <svg width={44} height={28} viewBox="0 0 44 28" aria-hidden>
          <circle cx={16} cy={14} r={11} fill={CARD_INK_FAINT} />
          <circle cx={28} cy={14} r={11} fill={CARD_INK_SOFT} opacity={0.85} />
        </svg>
      );
    case 'wave':
      return (
        <svg width={44} height={28} viewBox="0 0 44 28" aria-hidden>
          <path
            d="M4 18 C10 8, 16 8, 22 18 S 34 28, 40 18"
            fill="none"
            stroke={CARD_INK_SOFT}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <path
            d="M4 11 C10 1, 16 1, 22 11 S 34 21, 40 11"
            fill="none"
            stroke={CARD_INK_FAINT}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'leaf':
      return (
        <svg width={36} height={30} viewBox="0 0 36 30" aria-hidden>
          <path
            d="M18 3 C29 6, 32 16, 30 26 C19 25, 9 20, 18 3 Z"
            fill={CARD_INK_SOFT}
          />
          <path
            d="M18 6 C15 14, 16 20, 24 25"
            fill="none"
            stroke={INK_SHADOW}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'orbit':
      return (
        <svg width={40} height={30} viewBox="0 0 40 30" aria-hidden>
          <circle cx={20} cy={15} r={8} fill={CARD_INK_SOFT} />
          <ellipse
            cx={20}
            cy={15}
            rx={17}
            ry={6.5}
            fill="none"
            stroke={CARD_INK_FAINT}
            strokeWidth={2.5}
            transform="rotate(-18 20 15)"
          />
        </svg>
      );
    case 'spark':
      return (
        <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden>
          <path
            d="M16 2 L20 12 L30 16 L20 20 L16 30 L12 20 L2 16 L12 12 Z"
            fill={CARD_INK_SOFT}
          />
          <circle cx={16} cy={16} r={3.5} fill={INK_SHADOW} />
        </svg>
      );
  }
}

function ChipGlyph() {
  return (
    <svg width={40} height={30} viewBox="0 0 40 30" aria-hidden>
      <rect x={1} y={1} width={38} height={28} rx={6} fill={CARD_INK_SOFT} />
      <path
        d="M1 11 H14 M1 19 H14 M26 11 H39 M26 19 H39 M14 1 V29 M26 1 V29"
        stroke={INK_SHADOW}
        strokeWidth={1.6}
        fill="none"
      />
    </svg>
  );
}

function ContactlessGlyph() {
  return (
    <svg width={22} height={24} viewBox="0 0 22 24" aria-hidden>
      <path
        d="M4 6 a10 10 0 0 1 0 12 M9 8.5 a6.5 6.5 0 0 1 0 7 M14 10.5 a3 3 0 0 1 0 3"
        fill="none"
        stroke={CARD_INK_FAINT}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============= CARD FACES =============

function CardFront({
  card,
  isFrozen,
  isDefault,
}: {
  card: WalletCard;
  isFrozen: boolean;
  isDefault: boolean;
}) {
  const gradient = GRADIENTS[card.gradient];
  return (
    <div
      style={{
        ...styles.face,
        ...styles.faceFront,
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      }}>
      <div style={styles.faceTopRow}>
        <div>
          <div style={styles.issuerLine}>
            {card.issuerLine}
            {isDefault ? ' · Default' : ''}
          </div>
          <div style={styles.cardName}>{card.name}</div>
        </div>
        <NetworkGlyph kind={card.glyph} />
      </div>
      <div style={styles.chipRow}>
        <ChipGlyph />
        {card.kind !== 'loyalty' && <ContactlessGlyph />}
      </div>
      <div style={styles.numberRow}>{maskedNumber(card)}</div>
      <div style={styles.faceBottomRow}>
        <div>
          <div style={styles.faceFieldLabel}>Card holder</div>
          <div style={styles.faceFieldValue}>{card.holder}</div>
        </div>
        {card.kind !== 'loyalty' && (
          <div>
            <div style={styles.faceFieldLabel}>Expires</div>
            <div style={styles.faceFieldValue}>{card.expiry}</div>
          </div>
        )}
        <div>
          <div style={{...styles.faceFieldLabel, textAlign: 'end'}}>
            {card.balanceLabel}
          </div>
          <div style={styles.faceBalance}>{formatBalance(card)}</div>
        </div>
      </div>
      {isFrozen && (
        <div style={styles.frostOverlay}>
          <SnowflakeIcon size={18} aria-hidden />
          Frozen
        </div>
      )}
    </div>
  );
}

function CardBack({
  card,
  isRevealed,
  isFrozen,
}: {
  card: WalletCard;
  isRevealed: boolean;
  isFrozen: boolean;
}) {
  const gradient = GRADIENTS[card.gradient];
  const isLoyalty = card.kind === 'loyalty';
  return (
    <div
      style={{
        ...styles.face,
        ...styles.faceBack,
        background: `linear-gradient(135deg, ${gradient.to}, ${gradient.from})`,
      }}>
      <div style={styles.stripe} />
      <div style={styles.backBody}>
        <div style={styles.signatureRow}>
          <div style={styles.signaturePanel}>{card.holder}</div>
          {!isLoyalty && (
            <div style={styles.cvvBox}>
              <span style={styles.cvvLabel}>CVV</span>
              <span style={styles.cvvValue}>
                {isRevealed ? card.cvv : '•••'}
              </span>
            </div>
          )}
        </div>
        <div>
          <div style={styles.faceFieldLabel}>
            {isLoyalty ? 'Member number' : 'Card number'}
          </div>
          <div style={styles.backNumber}>
            {isRevealed ? fullNumber(card) : maskedNumber(card)}
          </div>
        </div>
        <div style={styles.backMetaRow}>
          {!isLoyalty && (
            <div>
              <div style={styles.faceFieldLabel}>Expires</div>
              <div style={styles.faceFieldValue}>{card.expiry}</div>
            </div>
          )}
          <div>
            <div style={styles.faceFieldLabel}>{card.balanceLabel}</div>
            <div style={styles.faceFieldValue}>{formatBalance(card)}</div>
          </div>
          <div>
            <div style={styles.faceFieldLabel}>Status</div>
            <div style={styles.faceFieldValue}>
              {isFrozen ? 'Frozen' : 'Active'}
            </div>
          </div>
        </div>
        <div style={styles.supportLine}>{card.supportLine}</div>
      </div>
    </div>
  );
}

/**
 * The two-faced flip body. Animated mode rotates the preserve-3d inner
 * about Y with backface-visibility hidden; reduced motion renders both
 * faces unrotated and crossfades opacity instead.
 */
function FlipBody({
  card,
  isFlipped,
  isFrozen,
  isDefault,
  isRevealed,
  isLifted,
  isReducedMotion,
}: {
  card: WalletCard;
  isFlipped: boolean;
  isFrozen: boolean;
  isDefault: boolean;
  isRevealed: boolean;
  isLifted: boolean;
  isReducedMotion: boolean;
}) {
  const lift = isLifted ? styles.faceLifted : undefined;
  if (isReducedMotion) {
    return (
      <div style={styles.flipInner}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isFlipped ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease`,
            pointerEvents: 'none',
            zIndex: isFlipped ? 1 : 2,
          }}>
          <div style={{position: 'relative', height: '100%', ...lift}}>
            <CardFront card={card} isFrozen={isFrozen} isDefault={isDefault} />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isFlipped ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
            pointerEvents: 'none',
            zIndex: isFlipped ? 2 : 1,
          }}>
          <div style={{position: 'relative', height: '100%', ...lift}}>
            <CardBack card={card} isRevealed={isRevealed} isFrozen={isFrozen} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        ...styles.flipInner,
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: `transform ${FLIP_MS}ms ${SETTLE_EASE}`,
      }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          ...lift,
        }}>
        <CardFront card={card} isFrozen={isFrozen} isDefault={isDefault} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          ...lift,
        }}>
        <CardBack card={card} isRevealed={isRevealed} isFrozen={isFrozen} />
      </div>
    </div>
  );
}

// ============= LEDGER =============

type LedgerFilter = 'all' | 'out' | 'in';

function filterLabels(card: WalletCard | null): Record<LedgerFilter, string> {
  if (card?.unit === 'pts') {
    return {all: 'All', out: 'Redeemed', in: 'Earned'};
  }
  return {all: 'All', out: 'Charges', in: 'Credits'};
}

function LedgerRow({
  txn,
  unit,
  cardId,
  cardName,
  index,
  isReducedMotion,
}: {
  txn: Txn;
  unit: Unit;
  cardId: string;
  cardName?: string;
  index: number;
  isReducedMotion: boolean;
}) {
  const isCredit = txn.amount > 0;
  // Cascading entrance: each row starts offset + transparent and settles
  // with a per-index delay. Reduced motion renders rows in place.
  const cascade: CSSProperties = isReducedMotion
    ? {}
    : {
        animationName: 'wallet-card-fan-ledger-in',
        animationDuration: '320ms',
        animationTimingFunction: SETTLE_EASE,
        animationDelay: `${index * LEDGER_STAGGER_MS}ms`,
        animationFillMode: 'backwards',
      };
  return (
    <div style={cascade}>
      <HStack gap={3} vAlign="center" style={{paddingBlock: 8}}>
        <div style={styles.ledgerChip}>
          <Icon icon={CATEGORY_ICONS[txn.category]} size="sm" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {txn.merchant}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {txn.date}
              {cardName ? ` · ${cardName}` : ''}
            </Text>
          </VStack>
        </StackItem>
        <Text
          type="label"
          style={isCredit ? styles.ledgerAmountIn : styles.ledgerAmountOut}>
          {formatSignedAmount(txn.amount, unit, cardId)}
        </Text>
      </HStack>
    </div>
  );
}

// ============= SUMMARY RAIL PIECES =============

function RailStat({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.railStatBox}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <span style={styles.railStatValue}>{value}</span>
    </div>
  );
}

// ============= PAGE =============

export default function WalletCardFanTemplate() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [frozenIds, setFrozenIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [defaultId, setDefaultId] = useState('sable');
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>('all');
  const [dragY, setDragY] = useState<number | null>(null);
  const [statusNote, setStatusNote] = useState(
    'Tap a card to bring it forward — tap again to flip it over.',
  );
  const dragOrigin = useRef<{pointerId: number; y: number} | null>(null);
  const didDrag = useRef(false);

  // Responsive contract: <=900px undocks the summary rail; <=640px grows
  // tap targets and hides the Kbd hints.
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  // Reduced motion: promote/compress reflow instantly, the flip and the
  // ledger cascade become fades.
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const selectedIndex =
    selectedId == null ? null : (CARD_INDEX_BY_ID.get(selectedId) ?? null);
  const selectedCard = selectedId == null ? null : getCard(selectedId);
  const isDragging = dragY != null && dragY > 0;
  const isTuckArmed = dragY != null && dragY >= TUCK_THRESHOLD;

  // ----- Shared commit paths (tap, drag release, keys, and rail buttons all
  // land here — one promote, one flip, one collapse) -----

  const promoteCard = (id: string, via: string) => {
    const card = getCard(id);
    setSelectedId(id);
    setIsFlipped(false);
    setIsRevealed(false);
    setDragY(null);
    setStatusNote(
      `${card.name} is up front (${via}). Tap it again or press F to flip; drag it down, press Esc, or use Back to re-stack.`,
    );
  };

  const flipCard = () => {
    if (selectedCard == null) {
      return;
    }
    setIsFlipped(prev => {
      const next = !prev;
      setStatusNote(
        next
          ? `Flipped ${selectedCard.name} — details stay masked until you reveal them.`
          : `Back to the front of ${selectedCard.name}.`,
      );
      return next;
    });
  };

  const collapseFan = (via: string) => {
    if (selectedCard == null) {
      return;
    }
    setStatusNote(`Tucked ${selectedCard.name} back into the fan (${via}).`);
    setSelectedId(null);
    setIsFlipped(false);
    setIsRevealed(false);
    setDragY(null);
  };

  const handleCardActivate = (id: string) => {
    // Suppress the click that follows a drag gesture on the hero.
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    if (selectedId === id) {
      flipCard();
    } else {
      promoteCard(id, 'tap');
    }
  };

  const toggleReveal = () => {
    if (selectedCard == null) {
      return;
    }
    setIsRevealed(prev => {
      const next = !prev;
      setStatusNote(
        next
          ? `Revealed the full ${selectedCard.kind === 'loyalty' ? 'member' : 'card'} number for ${selectedCard.name}.`
          : `Masked ${selectedCard.name}'s details again.`,
      );
      if (next && !isFlipped) {
        setIsFlipped(true);
      }
      return next;
    });
  };

  const toggleFreeze = (id: string) => {
    const card = getCard(id);
    setFrozenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setStatusNote(`${card.name} unfrozen — purchases will go through again.`);
      } else {
        next.add(id);
        setStatusNote(
          `${card.name} frozen — new purchases decline until you unfreeze it.`,
        );
      }
      return next;
    });
  };

  const makeDefault = (id: string) => {
    const card = getCard(id);
    setDefaultId(id);
    setStatusNote(`${card.name} is now the default payment card.`);
  };

  // ----- Hero drag-to-tuck (pointer events with capture); Esc and the Back
  // button drive the identical collapse commit -----

  const handleHeroPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (selectedId == null) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {pointerId: event.pointerId, y: event.clientY};
    didDrag.current = false;
  };

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const origin = dragOrigin.current;
    if (origin == null || origin.pointerId !== event.pointerId) {
      return;
    }
    const dy = Math.max(0, event.clientY - origin.y);
    if (dy > 8) {
      didDrag.current = true;
    }
    setDragY(dy);
  };

  const handleHeroPointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const origin = dragOrigin.current;
    if (origin == null || origin.pointerId !== event.pointerId) {
      return;
    }
    dragOrigin.current = null;
    const dy = Math.max(0, event.clientY - origin.y);
    if (dy >= TUCK_THRESHOLD) {
      collapseFan('drag');
      return;
    }
    // Inside the threshold: spring back to the hero slot.
    setDragY(null);
  };

  const handleHeroPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    const origin = dragOrigin.current;
    if (origin == null || origin.pointerId !== event.pointerId) {
      return;
    }
    dragOrigin.current = null;
    setDragY(null);
  };

  // ----- Keyboard parity: ↑/↓ cycle the promoted card, F flips, Esc peels
  // reveal → flip → collapse. Re-subscribes each render so handlers never
  // close over stale state; text inputs keep their keys. -----
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target != null && target.closest('input, textarea, select') != null) {
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const from = selectedIndex ?? (step === 1 ? -1 : CARDS.length);
        const next = (from + step + CARDS.length) % CARDS.length;
        promoteCard(CARDS[next].id, 'keyboard');
      } else if (event.key === 'f' || event.key === 'F') {
        if (selectedId != null) {
          event.preventDefault();
          flipCard();
        }
      } else if (event.key === 'Escape') {
        if (isRevealed) {
          setIsRevealed(false);
          setStatusNote('Details masked.');
        } else if (isFlipped) {
          setIsFlipped(false);
          setStatusNote('Back to the front.');
        } else if (selectedId != null) {
          collapseFan('Esc');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ----- Fan stage -----

  const fanStage = (
    <div
      style={styles.stage}
      role="group"
      aria-label={`Card fan — ${CARDS.length} cards${
        selectedCard == null ? '' : `, ${selectedCard.name} promoted`
      }`}>
      {CARDS.map((card, index) => {
        const pose = cardPose(index, selectedIndex);
        const isSelected = selectedId === card.id;
        const isHeroDragging = isSelected && isDragging;
        const y = isHeroDragging ? (dragY ?? 0) * DRAG_RESIST : pose.y;
        const scale = isHeroDragging
          ? Math.max(0.96, 1 - (dragY ?? 0) * 0.0003)
          : pose.scale;
        const transition = isHeroDragging
          ? 'none'
          : isReducedMotion
            ? 'none'
            : `transform ${SETTLE_MS}ms ${pose.ease} ${pose.delayMs}ms`;
        const label = isSelected
          ? `${card.name} — ${isFlipped ? 'show front' : 'flip to see details'}${
              isTuckArmed ? ' (release to tuck back)' : ''
            }`
          : `Bring ${card.name} forward`;
        return (
          <button
            key={card.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={label}
            style={{
              ...styles.cardButton,
              transform: `translateY(${y}px) scale(${scale})`,
              transformOrigin: '50% 0%',
              zIndex: pose.z,
              transition,
              touchAction: isSelected ? 'none' : 'manipulation',
              cursor: isHeroDragging ? 'grabbing' : 'pointer',
            }}
            onClick={() => handleCardActivate(card.id)}
            onPointerDown={isSelected ? handleHeroPointerDown : undefined}
            onPointerMove={isSelected ? handleHeroPointerMove : undefined}
            onPointerUp={isSelected ? handleHeroPointerEnd : undefined}
            onPointerCancel={isSelected ? handleHeroPointerCancel : undefined}>
            <FlipBody
              card={card}
              isFlipped={isSelected && isFlipped}
              isFrozen={frozenIds.has(card.id)}
              isDefault={defaultId === card.id}
              isRevealed={isSelected && isRevealed}
              isLifted={isSelected}
              isReducedMotion={isReducedMotion}
            />
          </button>
        );
      })}
    </div>
  );

  // ----- Hero action row (button twins for every gesture) -----

  const actionSize = isPhone ? 'lg' : 'md';
  const heroActions = selectedCard != null && (
    <div style={styles.actionRow}>
      <Button
        label={isFlipped ? 'Show front' : 'Flip card'}
        variant="secondary"
        size={actionSize}
        icon={<Icon icon={RepeatIcon} size="sm" color="inherit" />}
        onClick={flipCard}
      />
      <Button
        label={isRevealed ? 'Mask details' : 'Reveal details'}
        variant="secondary"
        size={actionSize}
        icon={
          <Icon icon={isRevealed ? EyeOffIcon : EyeIcon} size="sm" color="inherit" />
        }
        onClick={toggleReveal}
      />
      <Button
        label={frozenIds.has(selectedCard.id) ? 'Unfreeze' : 'Freeze'}
        variant="secondary"
        size={actionSize}
        icon={<Icon icon={SnowflakeIcon} size="sm" color="inherit" />}
        onClick={() => toggleFreeze(selectedCard.id)}
      />
      {selectedCard.kind !== 'loyalty' && (
        <Button
          label={defaultId === selectedCard.id ? 'Default card' : 'Make default'}
          variant="secondary"
          size={actionSize}
          isDisabled={defaultId === selectedCard.id}
          icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
          onClick={() => makeDefault(selectedCard.id)}
        />
      )}
      <Button
        label="Back to stack"
        variant="ghost"
        size={actionSize}
        icon={<Icon icon={LayersIcon} size="sm" color="inherit" />}
        onClick={() => collapseFan('button')}
      />
    </div>
  );

  // ----- Ledger -----

  const labels = filterLabels(selectedCard);
  const ledgerTxns: Array<{txn: Txn; unit: Unit; cardId: string; cardName?: string}> =
    selectedCard != null
      ? selectedCard.txns
          .filter(txn =>
            ledgerFilter === 'all'
              ? true
              : ledgerFilter === 'out'
                ? txn.amount < 0
                : txn.amount > 0,
          )
          .map(txn => ({txn, unit: selectedCard.unit, cardId: selectedCard.id}))
      : WALLET_FEED.filter(txn =>
          ledgerFilter === 'all'
            ? true
            : ledgerFilter === 'out'
              ? txn.amount < 0
              : txn.amount > 0,
        ).map(txn => ({
          txn,
          unit: txn.unit,
          cardId: txn.cardId,
          cardName: txn.cardName,
        }));

  const ledger = (
    <Card>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={3}>
                {selectedCard == null ? 'All cards' : selectedCard.name}
              </Heading>
              <Text type="supporting" color="secondary">
                {selectedCard == null
                  ? 'Recent activity across the wallet — promote a card to focus its ledger'
                  : `Recent activity · ${selectedCard.issuerLine}`}
              </Text>
            </VStack>
          </StackItem>
          <SegmentedControl
            value={ledgerFilter}
            onChange={value => setLedgerFilter(value as LedgerFilter)}
            label="Ledger filter"
            size={isPhone ? 'lg' : 'md'}>
            <SegmentedControlItem value="all" label={labels.all} />
            <SegmentedControlItem value="out" label={labels.out} />
            <SegmentedControlItem value="in" label={labels.in} />
          </SegmentedControl>
        </HStack>
        {/* Remount on card/filter change so the cascade replays. */}
        <VStack gap={0} key={`${selectedId ?? 'all'}:${ledgerFilter}`}>
          {ledgerTxns.map((entry, index) => (
            <VStack key={entry.txn.id} gap={0}>
              <LedgerRow
                txn={entry.txn}
                unit={entry.unit}
                cardId={entry.cardId}
                cardName={entry.cardName}
                index={index}
                isReducedMotion={isReducedMotion}
              />
              {index < ledgerTxns.length - 1 && <Divider />}
            </VStack>
          ))}
          {ledgerTxns.length === 0 && (
            <Text type="supporting" color="secondary">
              No {labels[ledgerFilter].toLowerCase()} on this card this month.
            </Text>
          )}
        </VStack>
      </VStack>
    </Card>
  );

  // ----- Wallet summary (docked rail >900px, Card below the ledger
  // otherwise) -----

  const cashAvailable = CARDS.filter(
    card => card.kind === 'debit',
  ).reduce((sum, card) => sum + card.balance, 0);
  const creditOwed = CARDS.filter(card => card.kind === 'credit').reduce(
    (sum, card) => sum + card.balance,
    0,
  );

  const walletSummary = (
    <VStack gap={4}>
      <HStack gap={2}>
        <RailStat label="Cash available" value={formatUsd(cashAvailable)} />
        <RailStat label="Card balances" value={formatUsd(creditOwed)} />
      </HStack>
      <Divider />
      <VStack gap={0}>
        <div style={styles.eyebrow}>Cards</div>
        {CARDS.map(card => {
          const gradient = GRADIENTS[card.gradient];
          return (
            <button
              key={card.id}
              type="button"
              style={styles.railCardButton}
              aria-pressed={selectedId === card.id}
              onClick={() =>
                selectedId === card.id
                  ? collapseFan('summary')
                  : promoteCard(card.id, 'summary')
              }>
              <HStack gap={2} vAlign="center">
                <div
                  aria-hidden
                  style={{
                    ...styles.railSwatch,
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                  }}
                />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="label" maxLines={1}>
                      {card.name}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {formatBalance(card)} · {card.balanceNote}
                    </Text>
                  </VStack>
                </StackItem>
                {defaultId === card.id && (
                  <Badge label="Default" variant="success" />
                )}
                {frozenIds.has(card.id) && (
                  <Badge label="Frozen" variant="neutral" />
                )}
              </HStack>
            </button>
          );
        })}
      </VStack>
      <Divider />
      <Text type="supporting" color="secondary">
        Freezing a card declines new purchases instantly; recurring payments
        on the default card keep going through. Loyalty cards never carry a
        payment default.
      </Text>
    </VStack>
  );

  const heroHint =
    selectedCard == null
      ? isPhone
        ? 'Tap a card to bring it forward'
        : 'Tap a card to bring it forward, or press ↑ / ↓'
      : isTuckArmed
        ? 'Release to tuck the card away'
        : isDragging
          ? 'Keep dragging down to re-stack'
          : isFlipped
            ? 'Tap the card to see the front again'
            : 'Tap the card to flip it, or drag it down to re-stack';

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <div style={styles.brandChip}>
                  <Icon icon={WalletIcon} size="sm" color="inherit" />
                </div>
                <Heading level={1}>Wallet</Heading>
                {!isPhone && (
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {CARDS.length} cards · {formatUsd(cashAvailable)} available
                  </Text>
                )}
              </HStack>
            </StackItem>
            {frozenIds.size > 0 && (
              <Badge
                label={`${frozenIds.size} frozen`}
                variant="neutral"
              />
            )}
            <Badge
              label={`Default · ${getCard(defaultId).name}`}
              variant="success"
            />
          </HStack>
        </LayoutHeader>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} label="Wallet summary">
            <VStack gap={4}>
              <Heading level={3}>Wallet summary</Heading>
              {walletSummary}
            </VStack>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={isPhone ? 4 : 6}>
          <style>{LEDGER_KEYFRAMES}</style>
          <div style={styles.page}>
            <VStack gap={4}>
              {fanStage}
              <HStack hAlign="center">
                <Text type="supporting" color="secondary">
                  {heroHint}
                </Text>
              </HStack>
              {heroActions}
              {!isPhone && (
                <HStack
                  gap={3}
                  vAlign="center"
                  hAlign="center"
                  style={styles.hintRow}>
                  <HStack gap={1} vAlign="center">
                    <Kbd keys="↑" />
                    <Kbd keys="↓" />
                    <Text type="supporting" color="secondary">
                      cycle cards
                    </Text>
                  </HStack>
                  <HStack gap={1} vAlign="center">
                    <Kbd keys="f" />
                    <Text type="supporting" color="secondary">
                      flip
                    </Text>
                  </HStack>
                  <HStack gap={1} vAlign="center">
                    <Kbd keys="esc" />
                    <Text type="supporting" color="secondary">
                      re-stack
                    </Text>
                  </HStack>
                </HStack>
              )}
              <HStack hAlign="center">
                <Text type="supporting" color="secondary" role="status">
                  {statusNote}
                </Text>
              </HStack>
              {ledger}
              {/* <=900px single-pane fallback: the docked rail's content
                  joins the column as a Card instead. */}
              {isStacked && (
                <Card>
                  <VStack gap={4}>
                    <Heading level={3}>Wallet summary</Heading>
                    {walletSummary}
                  </VStack>
                </Card>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
