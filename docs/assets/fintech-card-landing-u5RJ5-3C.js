var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file fintech-card-landing.tsx
 * @input Deterministic fixtures only (the fictional "Keel" team spend card:
 *   hero copy with a rendered charge card — mono PAN \`5412 •••• •••• 3742\`,
 *   cardholder, expiry — plus back-face control rows; three card-control
 *   feature rows each with a CSS-drawn schematic vignette; a 6-row fee
 *   comparison against two invented banks; five spend-feed transactions
 *   covering matched / auto-filed / needs-receipt / limit-warning /
 *   declined states; a 1.5% cashback calculator seeded at $40k monthly
 *   spend; compliance small print naming an invented FDIC partner bank;
 *   and a four-column sitemap footer)
 * @output Full fintech marketing landing page: sticky navbar with four
 *   smooth-scrolling anchor links (scroll-spy highlighting, hamburger
 *   dropdown at compact widths), a split hero pairing copy + validating
 *   email capture with the SIGNATURE interactive card render — it tilts
 *   toward the pointer (rotateX/rotateY, springs back on leave), flips on
 *   click to a controls back face, and its working Freeze switch stamps a
 *   FROZEN overlay onto the front — three alternating control-feature rows
 *   with schematic vignettes and scroll-reveals, a full-bleed fee
 *   comparison band whose $0 Keel cells are success-tinted, a real-time
 *   spend feed whose rows slide in staggered on first reveal, a
 *   monthly-spend Slider driving cashback count-ups, an honest compliance
 *   footnote band, and a dark CTA panel + footer each carrying an
 *   independent validating email form.
 * @position Page template; emitted by \`astryx template fintech-card-landing\`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy; the navbar inside it is
 * position:sticky top:0. Content sits in centered 1120px columns; the fee
 * band and compliance band paint full-bleed tinted strips around their own
 * inner columns so tinted and plain bands alternate down the page.
 *
 * Interaction contract:
 * - Hero card: pointer movement tilts the card up to ±9° (rotateX/rotateY
 *   from pointer position, 90ms follow), and leaving springs it back with
 *   an overshoot curve. Clicking the card (or the explicit "Show card
 *   controls" button) flips it 180° to the back face. The back-face Freeze
 *   switch is live: freezing desaturates the front art and stamps a FROZEN
 *   chip. prefers-reduced-motion disables tilt and makes the flip instant.
 * - Scroll-reveals: IntersectionObserver, fire once, 12px rise + fade;
 *   spend-feed rows stagger 90ms apart. Reduced motion renders visible.
 * - Count-ups (stats band + calculator) animate on first view with rAF and
 *   re-animate toward new targets when the spend Slider moves; reduced
 *   motion renders final values instantly.
 * - Nav anchors smooth-scroll the container under the sticky nav; onScroll
 *   spies the last section above the fold (aria-current). The nav CTA and
 *   hero fine print scroll to the Get started band.
 * - All three email forms (hero, CTA band, footer) validate independently
 *   (empty + regex errors inline, role="alert") and flip to a confirmed
 *   state with a reset affordance. Footer sitemap links that would leave
 *   the page are intentional no-ops; Product-column links smooth-scroll.
 *
 * Color policy: token-first. ONE quarantined accent literal (ACCENT, a
 * light-dark() pair with contrast math below); every tint is derived from
 * it or from status tokens via color-mix. Literal colors are KEPT only on
 * scheme-locked brand art (the card faces, monogram tiles, logo tile, the
 * dark CTA panel and footer), each locked with colorScheme:'dark' so brand
 * gradients never reflow with the app theme. NEVER var(--color-text).
 *
 * Responsive contract (measured with a local ResizeObserver, not viewport
 * media queries — the inline demo stage is ~1045px wide):
 * - >860px: inline nav links + CTA pair; hero splits copy/card.
 * - <=860px: nav links collapse behind a 40px hamburger dropdown (Escape /
 *   outside tap / selection closes).
 * - <=780px: hero stacks (card below copy), control-feature rows stack in
 *   source order, and the calculator drops to a single column.
 * - <=560px: headline steps down, email forms stack the button under the
 *   input, the fee table gains horizontal scroll (min 560px grid), feed
 *   rows hide their category chip column, and section paddings tighten.
 *   Holds at 390px in the phone artboard with no overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type UIEvent,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  AnchorIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  MailCheckIcon,
  MenuIcon,
  ReceiptIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SnowflakeIcon,
  WifiIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * The ONE quarantined accent literal — Keel's marine teal.
 * Contrast math: #0F766E on the white app body is 5.5:1 and on the muted
 * fee band (~#F5F5F5) 5.0:1 — AA for text and UI glyphs. #2DD4BF on the
 * dark app body (~#1C1C1E) is 8.9:1. White never sits on the raw accent;
 * white glyphs live only on the scheme-locked brand gradients below.
 */
const ACCENT = 'light-dark(#0F766E, #2DD4BF)';
/** Soft accent tints derived from the single literal via color-mix. */
const ACCENT_SOFT = \`color-mix(in srgb, \${ACCENT} 12%, transparent)\`;
const ACCENT_BORDER = \`color-mix(in srgb, \${ACCENT} 32%, transparent)\`;

// Status tints are token-first with the house light-dark fallbacks.
const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const SUCCESS_SOFT = \`color-mix(in srgb, \${SUCCESS} 13%, transparent)\`;
const WARNING = 'var(--color-warning, light-dark(#B45309, #FCD34D))';
const WARNING_SOFT = \`color-mix(in srgb, \${WARNING} 14%, transparent)\`;
const ERROR = 'var(--color-error, light-dark(#B3261E, #F2B8B5))';
const ERROR_SOFT = \`color-mix(in srgb, \${ERROR} 12%, transparent)\`;

// Scheme-locked dark-surface text (CTA panel, footer, card faces only).
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.6)';
const CHIP_BG = 'rgba(255, 255, 255, 0.14)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.24)';
const ERROR_ON_DARK = '#FECACA';

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

/** Sticky-nav height allowance shared by smooth-scroll and scroll-spy. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 140;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  column: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-8)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-6)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
  },
  // Scheme-locked brand art (see Color policy): marine gradient + white
  // glyph read identically in both app themes.
  logoTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
    color: '#FFFFFF',
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingInline: 12,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    color: ACCENT,
    backgroundColor: ACCENT_SOFT,
  },
  iconButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  mobileMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
  },
  mobileMenuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingInline: 8,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    paddingBlock: 'var(--spacing-4)',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-1)',
  },
  heroText: {
    flex: '1.1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 31,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 520,
    margin: 0,
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    maxWidth: 460,
  },
  emailRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    maxWidth: 'none',
  },
  emailInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  emailError: {
    fontSize: 13,
    margin: 0,
    color: ERROR,
  },
  emailErrorOnDark: {
    color: ERROR_ON_DARK,
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  successDiscDark: {
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    color: DARK_TEXT,
  },
  // ---- the signature card render ----
  cardStage: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    perspective: 1100,
  },
  cardShell: {
    position: 'relative',
    width: '100%',
    maxWidth: 430,
    aspectRatio: '1.586',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    outlineOffset: 6,
  },
  cardInner: {
    position: 'absolute',
    inset: 0,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  },
  // Scheme-locked brand art (see Color policy): both card faces are dark
  // marine gradients with colorScheme:'dark' — identical in either theme.
  cardFace: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    boxShadow: '0 24px 48px -20px rgba(4, 26, 24, 0.55)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  cardFrontArt: {
    position: 'absolute',
    inset: 0,
    backgroundImage: [
      'radial-gradient(120% 150% at 8% 0%, rgba(45, 212, 191, 0.55), transparent 55%)',
      'radial-gradient(90% 110% at 100% 100%, rgba(94, 234, 212, 0.22), transparent 50%)',
      'linear-gradient(135deg, #071E1C 0%, #0E3A36 52%, #0F5148 100%)',
    ].join(', '),
    transition: 'filter 0.4s ease',
  },
  cardFrontArtFrozen: {
    filter: 'grayscale(0.8) brightness(0.82)',
  },
  cardFaceContent: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 'clamp(14px, 5%, 24px)',
  },
  cardBackFace: {
    transform: 'rotateY(180deg)',
    background: 'linear-gradient(160deg, #071E1C 0%, #0B2B28 100%)',
  },
  cardChip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    background: 'linear-gradient(135deg, #FDE68A 0%, #B45309 130%)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    flexShrink: 0,
  },
  cardNumber: {
    fontFamily: MONO,
    fontSize: 'clamp(15px, 4.6cqw, 21px)',
    letterSpacing: '0.12em',
    whiteSpace: 'nowrap',
  },
  cardMicroLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  frozenChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    backgroundColor: 'rgba(8, 24, 22, 0.72)',
    border: \`1px solid \${CHIP_BORDER}\`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  cardStripe: {
    height: 34,
    backgroundColor: 'rgba(2, 10, 9, 0.85)',
    marginTop: 18,
    flexShrink: 0,
  },
  backRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '7px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  },
  backMeter: {
    position: 'relative',
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
    width: 92,
  },
  // ---- feature vignettes (CSS-drawn schematic panels) ----
  vignette: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  vignetteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  vignettePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  meterTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    minWidth: 40,
  },
  featureRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  featureRowReversed: {
    flexDirection: 'row-reverse',
  },
  featureRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  featureText: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  featureArt: {
    flex: '1 1 0',
    minWidth: 0,
  },
  featureGlyph: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  bulletDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: SUCCESS_SOFT,
    color: SUCCESS,
  },
  // ---- full-bleed tinted bands ----
  tintedBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- fee comparison table ----
  feeScroller: {
    overflowX: 'auto',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  feeGrid: {
    minWidth: 560,
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.9fr 1fr 1fr',
  },
  feeHeadCell: {
    padding: 'var(--spacing-3)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
  },
  feeCell: {
    padding: 'var(--spacing-3)',
    fontSize: 14,
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  feeCellZero: {
    backgroundColor: SUCCESS_SOFT,
    color: SUCCESS,
    fontWeight: 700,
  },
  feeKeelHead: {
    color: ACCENT,
  },
  // ---- spend feed ----
  feedCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  feedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderTop: '1px solid var(--color-border)',
  },
  // Scheme-locked brand art (see Color policy): merchant monogram tiles
  // keep their literal hue gradients in both themes.
  monogram: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    colorScheme: 'dark',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  categoryChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  feedAmount: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statValue: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  calcStat: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
  },
  // ---- compliance band ----
  complianceBand: {
    borderTop: '1px solid var(--color-border)',
  },
  finePrint: {
    fontSize: 12,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    margin: 0,
    maxWidth: 860,
  },
  // ---- final CTA + footer (scheme-locked dark surfaces) ----
  finalCta: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(70% 90% at 50% 0%, rgba(45, 212, 191, 0.32), transparent 60%)',
      'linear-gradient(180deg, #071E1C 0%, #0E3A36 100%)',
    ].join(', '),
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
  },
  finalCtaCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  finalHeadline: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  finalHeadlineCompact: {
    fontSize: 24,
  },
  metricChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#071E1C',
    marginTop: 'var(--spacing-6)',
  },
  footerInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  footerInnerCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: DARK_TEXT_FAINT,
    textAlign: 'left',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Keel team spend card.
// No Date.now, no randomness, no network assets, no real bank names.

const BRAND = {
  name: 'Keel',
  tagline: 'The company card that closes the books itself',
};

type SectionId = 'controls' | 'fees' | 'feed' | 'rewards' | 'get-started';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'controls', label: 'Card controls'},
  {id: 'fees', label: 'Fees'},
  {id: 'feed', label: 'Live feed'},
  {id: 'rewards', label: 'Rewards'},
];

const HERO = {
  kicker: 'Corporate cards + spend management',
  headline: 'The company card that closes the books itself',
  subcopy:
    'Issue a card in 38 seconds, set limits that enforce themselves, and ' +
    'let Keel match every receipt before your accountants have to ask. ' +
    'Flat 1.5% cashback on everything.',
  finePrint: 'No personal guarantee · free for teams under 10 · cancel anytime',
};

const CARD_FIXTURE = {
  number: '5412 •••• •••• 3742',
  holder: 'AMARA SOSA · OPS',
  expiry: '09/29',
  label: 'BUSINESS',
  limitLabel: 'Monthly limit',
  limitUsed: 2850,
  limitTotal: 4000,
  merchantLock: 'SaaS + travel only',
};

interface ControlFeature {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  bullets: readonly string[];
  icon: Glyph;
  vignette: 'freeze' | 'limits' | 'receipts';
}

const CONTROL_FEATURES: readonly ControlFeature[] = [
  {
    id: 'freeze',
    kicker: 'Instant freeze',
    title: 'Freeze a card before the second charge lands',
    copy:
      'One tap in the app — or one message to the Keel bot in your team ' +
      'chat — and the card declines everywhere in under a second. Unfreeze ' +
      'is just as fast, and an allowlist keeps critical subscriptions alive ' +
      'while everything else stays locked.',
    bullets: [
      'Freeze and unfreeze propagate in under 1 second',
      'Auto-freeze after 3 failed authorizations',
      'Subscription allowlist survives a freeze',
    ],
    icon: SnowflakeIcon,
    vignette: 'freeze',
  },
  {
    id: 'limits',
    kicker: 'Per-merchant limits',
    title: 'Limits that enforce themselves at the network',
    copy:
      'Give every vendor its own ceiling: $500 a month for design tools, ' +
      '$12,000 for ad platforms, zero for everything you never approved. ' +
      'Keel declines the overage at authorization time — no chasing ' +
      'refunds after the fact.',
    bullets: [
      'Merchant, category, and per-transaction ceilings',
      'Declines happen at auth time, not on the statement',
      'Warnings in team chat at 80% of any limit',
    ],
    icon: SlidersHorizontalIcon,
    vignette: 'limits',
  },
  {
    id: 'receipts',
    kicker: 'Receipts auto-match',
    title: 'Receipts match themselves — 96% never need a human',
    copy:
      'Forward receipts@keel.money, snap a photo, or connect your inbox: ' +
      'Keel reads the total, the merchant, and the date, then pins the ' +
      'receipt to the right transaction and files the GL code. Your team ' +
      'only hears about the 4% that need eyes.',
    bullets: [
      '96% of receipts matched with no human touch',
      'GL codes and memos filled from merchant rules',
      'One nudge in chat for anything still missing at month end',
    ],
    icon: ReceiptIcon,
    vignette: 'receipts',
  },
];

interface FeeRow {
  id: string;
  label: string;
  keel: string;
  keelIsZero: boolean;
  meridian: string;
  harbor: string;
}

/** Keel vs two invented incumbent banks. Zero cells tint success. */
const FEE_ROWS: readonly FeeRow[] = [
  {id: 'monthly', label: 'Monthly account fee', keel: '$0', keelIsZero: true, meridian: '$15', harbor: '$12'},
  {id: 'issuance', label: 'Physical + virtual cards', keel: '$0', keelIsZero: true, meridian: '$5 / card', harbor: '$3 / card'},
  {id: 'ach', label: 'Domestic ACH transfer', keel: '$0', keelIsZero: true, meridian: '$0.80', harbor: '$1.50'},
  {id: 'wire', label: 'Domestic wire', keel: '$0', keelIsZero: true, meridian: '$25', harbor: '$30'},
  {id: 'fx', label: 'Foreign exchange markup', keel: '0.5%', keelIsZero: false, meridian: '2.6%', harbor: '3.1%'},
  {id: 'late', label: 'Late payment fee', keel: '$0', keelIsZero: true, meridian: '$29', harbor: '$39'},
];

const FEE_FOOTNOTE =
  'Keel fee schedule as of Jul 1, 2026. Meridian Business Bank and Harbor ' +
  'National figures from their published small-business fee schedules on ' +
  'the same date; both are invented for this demo. FX markup applies to ' +
  'non-USD card transactions.';

interface FeedTx {
  id: string;
  merchant: string;
  monogram: string;
  /** Scheme-locked hue gradient for the monogram tile (see Color policy). */
  tileArt: string;
  holder: string;
  time: string;
  category: string;
  amount: string;
  status: string;
  statusVariant: 'success' | 'info' | 'warning' | 'error';
}

const FEED_TXS: readonly FeedTx[] = [
  {
    id: 'tx-1',
    merchant: 'Lumen Cloud',
    monogram: 'LC',
    tileArt: 'linear-gradient(135deg, #0EA5E9 0%, #1D4ED8 100%)',
    holder: 'Priya N. · 9:41 AM',
    category: 'Software',
    time: '9:41 AM',
    amount: '$1,284.00',
    status: 'Receipt matched',
    statusVariant: 'success',
  },
  {
    id: 'tx-2',
    merchant: 'Skyfare Air',
    monogram: 'SA',
    tileArt: 'linear-gradient(135deg, #14B8A6 0%, #0E7490 100%)',
    holder: 'Marcus T. · 9:12 AM',
    category: 'Travel',
    time: '9:12 AM',
    amount: '$642.80',
    status: 'Auto-filed',
    statusVariant: 'info',
  },
  {
    id: 'tx-3',
    merchant: 'AdSprint',
    monogram: 'AD',
    tileArt: 'linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)',
    holder: 'Growth card · 8:56 AM',
    category: 'Advertising',
    time: '8:56 AM',
    amount: '$4,120.00',
    status: 'Limit 92% used',
    statusVariant: 'warning',
  },
  {
    id: 'tx-4',
    merchant: 'Bolt Espresso',
    monogram: 'BE',
    tileArt: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
    holder: 'Dana K. · 8:31 AM',
    category: 'Meals',
    time: '8:31 AM',
    amount: '$38.50',
    status: 'Needs receipt',
    statusVariant: 'warning',
  },
  {
    id: 'tx-5',
    merchant: 'Nimbus Print Co',
    monogram: 'NP',
    tileArt: 'linear-gradient(135deg, #64748B 0%, #334155 100%)',
    holder: 'Frozen card · 8:04 AM',
    category: 'Office',
    time: '8:04 AM',
    amount: '$96.20',
    status: 'Declined · frozen',
    statusVariant: 'error',
  },
];

/** Stats band under the feed; count-ups fire on first view. */
const STATS: readonly {
  id: string;
  target: number;
  format: (n: number) => string;
  caption: string;
}[] = [
  {
    id: 'tracked',
    target: 4.1,
    format: n => \`$\${n.toFixed(1)}B\`,
    caption: 'card spend tracked in 2026',
  },
  {
    id: 'matched',
    target: 96,
    format: n => \`\${Math.round(n)}%\`,
    caption: 'of receipts matched automatically',
  },
  {
    id: 'issue',
    target: 38,
    format: n => \`\${Math.round(n)}s\`,
    caption: 'to issue a new virtual card',
  },
];

const CASHBACK_RATE = 0.015;
const SPEND_MIN = 5_000;
const SPEND_MAX = 250_000;
const SPEND_STEP = 5_000;
const SPEND_DEFAULT = 40_000;

const COMPLIANCE_LINES: readonly string[] = [
  'Keel is a financial technology company, not a bank. Charge card and ' +
    'deposit services are provided by Coastline Bank, N.A., Member FDIC.',
  'Deposits are held at Coastline Bank, N.A. and are eligible for FDIC ' +
    'insurance up to $250,000 per company. FDIC insurance covers the ' +
    'failure of the partner bank — it does not cover the failure of Keel.',
  'The Keel card is a charge card: the balance is due in full each month ' +
    'and no interest is charged. 1.5% cashback accrues as statement credit ' +
    'and is subject to the Keel Rewards Program terms.',
];

interface FooterColumn {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    id: 'product',
    heading: 'Product',
    links: [
      {label: 'Card controls', anchor: 'controls'},
      {label: 'Fees', anchor: 'fees'},
      {label: 'Live feed', anchor: 'feed'},
      {label: 'Rewards', anchor: 'rewards'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [{label: 'About'}, {label: 'Careers'}, {label: 'Press'}],
  },
  {
    id: 'resources',
    heading: 'Resources',
    links: [
      {label: 'Documentation'},
      {label: 'Accountant directory'},
      {label: 'Status'},
    ],
  },
  {
    id: 'legal',
    heading: 'Legal',
    links: [
      {label: 'Privacy'},
      {label: 'Terms'},
      {label: 'Disclosures'},
      {label: 'Licenses'},
    ],
  },
];

// ============= HELPERS =============

function formatUSD(amount: number): string {
  return \`$\${Math.round(amount).toLocaleString('en-US')}\`;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get started.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

interface EmailFormState {
  value: string;
  error: string | null;
  confirmedEmail: string | null;
}

const EMPTY_EMAIL_FORM: EmailFormState = {
  value: '',
  error: null,
  confirmedEmail: null,
};

/**
 * Page-width measurement (demo-stage quirk: viewport media queries never
 * fire in the inline ~1045px stage, so breakpoints derive from this).
 */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** Motion gate: reveals render visible and counters render final when set. */
function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setIsReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

// ============= MOTION PIECES =============

/** Scroll-reveal: fires once, 12px rise + fade; visible under reduced motion. */
function Reveal({
  children,
  delay = 0,
  isReduced,
}: {
  children: ReactNode;
  delay?: number;
  isReduced: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isShown, setIsShown] = useState(false);
  useEffect(() => {
    if (isReduced) {
      setIsShown(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setIsShown(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isReduced]);
  return (
    <div
      ref={ref}
      style={{
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(12px)',
        transition: \`opacity 0.55s ease \${delay}ms, transform 0.55s ease \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

/**
 * Count-up number: starts at 0, animates to \`value\` when first scrolled
 * into view, and re-animates toward new targets (calculator). Reduced
 * motion renders the final value immediately.
 */
function CountUpNumber({
  value,
  format,
  isReduced,
  style,
}: {
  value: number;
  format: (n: number) => string;
  isReduced: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    if (isReduced) {
      setHasStarted(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      {threshold: 0.4},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isReduced]);

  useEffect(() => {
    if (!hasStarted) {
      return undefined;
    }
    if (isReduced) {
      displayRef.current = value;
      setDisplay(value);
      return undefined;
    }
    const from = displayRef.current;
    const startedAt = performance.now();
    const duration = 700;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = from + (value - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasStarted, value, isReduced]);

  return (
    <span ref={ref} style={style}>
      {format(hasStarted ? display : 0)}
    </span>
  );
}

// ============= SMALL PIECES =============

function BrandMark({nameColor}: {nameColor?: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={AnchorIcon} size="sm" color="inherit" />
      </div>
      <span style={{fontSize: 16, fontWeight: 700, color: nameColor}}>
        {BRAND.name}
      </span>
    </HStack>
  );
}

function CheckBullet({label}: {label: string}) {
  return (
    <HStack gap={2} vAlign="start">
      <div style={styles.bulletDisc} aria-hidden="true">
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </div>
      <StackItem size="fill">
        <Text type="body">{label}</Text>
      </StackItem>
    </HStack>
  );
}

function SectionIntro({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={2} hAlign="center">
      <Token label={kicker} size="sm" color="teal" />
      <Heading level={2}>{title}</Heading>
      <Text type="supporting" color="secondary" justify="center">
        {description}
      </Text>
    </VStack>
  );
}

/** CSS-drawn schematic vignette per control feature. */
function ControlVignette({variant}: {variant: ControlFeature['vignette']}) {
  if (variant === 'freeze') {
    return (
      <div
        style={styles.vignette}
        role="img"
        aria-label="Schematic of the freeze control declining a charge on a frozen card">
        <div style={styles.vignetteRow}>
          <span
            style={{
              ...styles.vignettePill,
              backgroundColor: ACCENT_SOFT,
              color: ACCENT,
            }}>
            <Icon icon={SnowflakeIcon} size="xsm" color="inherit" />
            Ops card · frozen 9:02 AM
          </span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <span
            style={{
              ...styles.vignettePill,
              backgroundColor: SUCCESS_SOFT,
              color: SUCCESS,
            }}>
            0.6s
          </span>
        </div>
        <div style={styles.vignetteRow}>
          <span style={{fontSize: 13, fontWeight: 600}}>Nimbus Print Co</span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <span style={{...styles.feedAmount, color: 'var(--color-text-secondary)'}}>
            $96.20
          </span>
          <span
            style={{
              ...styles.vignettePill,
              backgroundColor: ERROR_SOFT,
              color: ERROR,
            }}>
            Declined
          </span>
        </div>
        <div style={styles.vignetteRow}>
          <span style={{fontSize: 13, fontWeight: 600}}>Lumen Cloud</span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <span style={{...styles.feedAmount, color: 'var(--color-text-secondary)'}}>
            $1,284.00
          </span>
          <span
            style={{
              ...styles.vignettePill,
              backgroundColor: SUCCESS_SOFT,
              color: SUCCESS,
            }}>
            Allowlisted
          </span>
        </div>
      </div>
    );
  }
  if (variant === 'limits') {
    const rows: readonly {
      merchant: string;
      limit: string;
      pct: number;
      isHot: boolean;
    }[] = [
      {merchant: 'Canvasly', limit: '$500 / mo', pct: 64, isHot: false},
      {merchant: 'AdSprint', limit: '$12,000 / mo', pct: 92, isHot: true},
      {merchant: 'Skyfare Air', limit: '$6,000 / mo', pct: 31, isHot: false},
    ];
    return (
      <div
        style={styles.vignette}
        role="img"
        aria-label="Schematic of per-merchant limits with usage meters">
        {rows.map(row => (
          <div key={row.merchant} style={styles.vignetteRow}>
            <span style={{fontSize: 13, fontWeight: 600, flexShrink: 0}}>
              {row.merchant}
            </span>
            <div style={styles.meterTrack}>
              <div
                style={{
                  width: \`\${row.pct}%\`,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: row.isHot ? WARNING : ACCENT,
                }}
              />
            </div>
            <span
              style={{
                ...styles.vignettePill,
                backgroundColor: row.isHot ? WARNING_SOFT : 'var(--color-background-muted)',
                color: row.isHot ? WARNING : 'var(--color-text-secondary)',
              }}>
              {row.pct}% of {row.limit}
            </span>
          </div>
        ))}
        <Text type="supporting" color="secondary">
          Overage at AdSprint declines automatically at authorization.
        </Text>
      </div>
    );
  }
  return (
    <div
      style={styles.vignette}
      role="img"
      aria-label="Schematic of a receipt auto-matching to a transaction">
      <div style={styles.vignetteRow}>
        <span
          style={{
            ...styles.vignettePill,
            backgroundColor: 'var(--color-background-muted)',
            color: 'var(--color-text-secondary)',
          }}>
          <Icon icon={ReceiptIcon} size="xsm" color="inherit" />
          receipt-lumen-jul.pdf
        </span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>
          via receipts@keel.money
        </span>
      </div>
      <div style={styles.vignetteRow}>
        <span style={{fontSize: 13, fontWeight: 600}}>Lumen Cloud</span>
        <span style={{...styles.feedAmount, color: 'var(--color-text-secondary)'}}>
          $1,284.00
        </span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <span
          style={{
            ...styles.vignettePill,
            backgroundColor: SUCCESS_SOFT,
            color: SUCCESS,
          }}>
          <Icon icon={CheckIcon} size="xsm" color="inherit" />
          Matched · GL 6120
        </span>
      </div>
      <Text type="supporting" color="secondary">
        Total, merchant, and date read from the PDF; memo filled from the
        Lumen Cloud merchant rule.
      </Text>
    </div>
  );
}

// ============= PAGE =============

export default function FintechCardLandingTemplate() {
  // ---- responsive: measured page width, not viewport ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 860;
  const isStacked = wrapWidth > 0 && wrapWidth <= 780;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;

  const isReduced = usePrefersReducedMotion();

  // ---- navbar ----
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- signature card ----
  const [tilt, setTilt] = useState({x: 0, y: 0});
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  // ---- email captures (hero, CTA band, footer are independent) ----
  const [heroForm, setHeroForm] = useState<EmailFormState>(EMPTY_EMAIL_FORM);
  const [ctaForm, setCtaForm] = useState<EmailFormState>(EMPTY_EMAIL_FORM);
  const [footerForm, setFooterForm] =
    useState<EmailFormState>(EMPTY_EMAIL_FORM);

  // ---- rewards calculator ----
  const [monthlySpend, setMonthlySpend] = useState(SPEND_DEFAULT);
  const monthlyCashback = monthlySpend * CASHBACK_RATE;

  // Mobile menu dismissal: Escape refocuses the trigger; outside tap closes.
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav !== null &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMobileMenuOpen]);

  // ---- interactions ----

  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMobileMenuOpen(false);
    if (container === null || section === null || section === undefined) {
      return;
    }
    if (NAV_ANCHORS.some(anchor => anchor.id === id)) {
      setActiveSection(id);
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (
        section != null &&
        section.offsetTop <= container.scrollTop + SPY_OFFSET
      ) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
  };

  const submitEmailForm = (
    form: EmailFormState,
    setForm: (next: EmailFormState) => void,
  ) => {
    const error = validateEmail(form.value);
    if (error !== null) {
      setForm({...form, error});
      return;
    }
    setForm({value: '', error: null, confirmedEmail: form.value.trim()});
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  // Card tilt: rotate toward the pointer, spring back on leave. Reduced
  // motion keeps the card static (tilt handlers become no-ops).
  const onCardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isReduced || isFlipped) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setIsPointerOver(true);
    setTilt({x: -(py - 0.5) * 14, y: (px - 0.5) * 18});
  };

  const onCardPointerLeave = () => {
    setIsPointerOver(false);
    setTilt({x: 0, y: 0});
  };

  const cardTransform = \`rotateX(\${tilt.x.toFixed(2)}deg) rotateY(\${(
    tilt.y + (isFlipped ? 180 : 0)
  ).toFixed(2)}deg)\`;
  const cardTransition = isReduced
    ? 'none'
    : isPointerOver
      ? 'transform 90ms ease-out'
      : 'transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1)';

  // ============= CHROME =============

  const navCta = (
    <Button
      label="Get Keel"
      variant="primary"
      size={isNavCollapsed ? 'sm' : 'md'}
      onClick={() => jumpToSection('get-started')}
    />
  );

  const mobileMenu = (
    <div style={styles.mobileMenu} role="menu" aria-label="Site menu">
      <VStack gap={1}>
        {NAV_ANCHORS.map(anchor => (
          <button
            key={anchor.id}
            type="button"
            role="menuitem"
            style={styles.mobileMenuLink}
            onClick={() => jumpToSection(anchor.id)}>
            {anchor.label}
          </button>
        ))}
        <Divider />
        <button
          type="button"
          role="menuitem"
          style={styles.mobileMenuLink}
          onClick={() => jumpToSection('get-started')}>
          <Icon icon={ArrowRightIcon} size="sm" color="secondary" />
          Get started free
        </button>
      </VStack>
    </div>
  );

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Primary">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={
                    activeSection === anchor.id ? 'true' : undefined
                  }
                  style={{
                    ...styles.navLink,
                    ...(activeSection === anchor.id
                      ? styles.navLinkActive
                      : null),
                  }}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          )}
        </StackItem>
        {isNavCollapsed ? (
          <>
            {navCta}
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(previous => !previous)}
              style={styles.iconButton}>
              <Icon
                icon={isMobileMenuOpen ? XIcon : MenuIcon}
                size="sm"
                color="inherit"
              />
            </button>
          </>
        ) : (
          <HStack gap={2} vAlign="center">
            <Button
              label="Sign in"
              variant="ghost"
              onClick={() => {}}
            />
            {navCta}
          </HStack>
        )}
        {isMobileMenuOpen && isNavCollapsed && mobileMenu}
      </div>
    </nav>
  );

  // ============= HERO =============

  const heroEmailForm =
    heroForm.confirmedEmail !== null ? (
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.successDisc}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text weight="semibold">You&rsquo;re in the queue</Text>
            <Text type="supporting" color="secondary">
              We sent onboarding details to {heroForm.confirmedEmail}.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Use a different email"
          variant="ghost"
          size="sm"
          onClick={() => setHeroForm(EMPTY_EMAIL_FORM)}
        />
      </HStack>
    ) : (
      <VStack gap={1}>
        <div
          style={{
            ...styles.emailRow,
            ...(isPhone ? styles.emailRowStacked : null),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Work email"
              isLabelHidden
              placeholder="you@company.com"
              value={heroForm.value}
              onChange={value =>
                setHeroForm({...heroForm, value, error: null})
              }
            />
          </div>
          <Button
            label="Open an account"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => submitEmailForm(heroForm, setHeroForm)}
          />
        </div>
        {heroForm.error !== null && (
          <p style={styles.emailError} role="alert">
            {heroForm.error}
          </p>
        )}
      </VStack>
    );

  const limitPct = Math.round(
    (CARD_FIXTURE.limitUsed / CARD_FIXTURE.limitTotal) * 100,
  );

  const cardFront = (
    <div style={styles.cardFace} aria-hidden={isFlipped}>
      <div
        style={{
          ...styles.cardFrontArt,
          ...(isFrozen ? styles.cardFrontArtFrozen : null),
        }}
        aria-hidden="true"
      />
      <div style={styles.cardFaceContent}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <HStack gap={2} vAlign="center">
            <Icon icon={AnchorIcon} size="sm" color="inherit" />
            <span style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.02em'}}>
              {BRAND.name}
            </span>
            <span style={styles.cardMicroLabel}>{CARD_FIXTURE.label}</span>
          </HStack>
          {isFrozen ? (
            <span style={styles.frozenChip}>
              <Icon icon={SnowflakeIcon} size="xsm" color="inherit" />
              FROZEN
            </span>
          ) : (
            <Icon icon={WifiIcon} size="sm" color="inherit" />
          )}
        </div>
        <VStack gap={2}>
          <div style={styles.cardChip} aria-hidden="true" />
          <span style={styles.cardNumber}>{CARD_FIXTURE.number}</span>
        </VStack>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <VStack gap={0}>
            <span style={styles.cardMicroLabel}>Cardholder</span>
            <span style={styles.cardValue}>{CARD_FIXTURE.holder}</span>
          </VStack>
          <VStack gap={0}>
            <span style={styles.cardMicroLabel}>Expires</span>
            <span style={{...styles.cardValue, fontFamily: MONO}}>
              {CARD_FIXTURE.expiry}
            </span>
          </VStack>
        </div>
      </div>
    </div>
  );

  const cardBack = (
    <div
      style={{...styles.cardFace, ...styles.cardBackFace}}
      aria-hidden={!isFlipped}>
      <div style={styles.cardStripe} aria-hidden="true" />
      <div
        style={{
          ...styles.cardFaceContent,
          justifyContent: 'flex-start',
          gap: 4,
          paddingTop: 12,
        }}>
        <span style={styles.cardMicroLabel}>Card controls</span>
        <div style={styles.backRow}>
          <span style={{fontSize: 13, fontWeight: 600}}>Freeze card</span>
          {/* stopPropagation so toggling doesn't also flip the card */}
          <div onClick={event => event.stopPropagation()}>
            <Switch
              label="Freeze card"
              isLabelHidden
              value={isFrozen}
              onChange={checked => setIsFrozen(checked)}
            />
          </div>
        </div>
        <div style={styles.backRow}>
          <VStack gap={0}>
            <span style={{fontSize: 13, fontWeight: 600}}>
              {CARD_FIXTURE.limitLabel}
            </span>
            <span style={{fontSize: 11, color: DARK_TEXT_FAINT}}>
              {formatUSD(CARD_FIXTURE.limitUsed)} of{' '}
              {formatUSD(CARD_FIXTURE.limitTotal)} · {limitPct}%
            </span>
          </VStack>
          <div style={styles.backMeter} aria-hidden="true">
            <div
              style={{
                width: \`\${limitPct}%\`,
                height: '100%',
                borderRadius: 3,
                backgroundColor: '#2DD4BF',
              }}
            />
          </div>
        </div>
        <div style={styles.backRow}>
          <HStack gap={1} vAlign="center">
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            <span style={{fontSize: 13, fontWeight: 600}}>Merchant lock</span>
          </HStack>
          <span style={{fontSize: 12, color: DARK_TEXT_SOFT}}>
            {CARD_FIXTURE.merchantLock}
          </span>
        </div>
        <div style={{...styles.backRow, borderBottom: 'none'}}>
          <span style={{fontSize: 13, fontWeight: 600}}>CVC</span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.2em',
              filter: 'blur(3px)',
            }}
            aria-label="CVC hidden">
            842
          </span>
        </div>
      </div>
    </div>
  );

  const heroCard = (
    <div style={styles.cardStage}>
      {/* Signature moment: pointer tilt + click-to-flip. The div carries
          the pointer theater; the button below is the accessible control. */}
      <div
        style={styles.cardShell}
        role="img"
        aria-label={\`Keel business card ending 3742, \${
          isFrozen ? 'frozen' : 'active'
        }; \${isFlipped ? 'showing controls' : 'showing front'}\`}
        onPointerMove={onCardPointerMove}
        onPointerLeave={onCardPointerLeave}
        onClick={() => setIsFlipped(previous => !previous)}>
        <div
          style={{
            ...styles.cardInner,
            transform: cardTransform,
            transition: cardTransition,
          }}>
          {cardFront}
          {cardBack}
        </div>
      </div>
      <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
        <Button
          label={isFlipped ? 'Show card front' : 'Show card controls'}
          variant="secondary"
          size="sm"
          icon={<Icon icon={RefreshCcwIcon} size="sm" color="inherit" />}
          onClick={() => setIsFlipped(previous => !previous)}
        />
        {isFrozen && <Badge variant="info" label="Card frozen" />}
      </HStack>
    </div>
  );

  const hero = (
    <div
      style={{
        ...styles.heroRow,
        ...(isStacked ? styles.heroRowStacked : null),
      }}>
      <div style={styles.heroText}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token label={HERO.kicker} size="sm" color="teal" />
          <Badge variant="success" label="1.5% back on everything" />
        </HStack>
        <h1
          style={{
            ...styles.heroHeadline,
            ...(isPhone ? styles.heroHeadlineCompact : null),
          }}>
          {HERO.headline}
        </h1>
        <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
        {heroEmailForm}
        <Text type="supporting" color="secondary">
          {HERO.finePrint}
        </Text>
      </div>
      {heroCard}
    </div>
  );

  // ============= SECTIONS =============

  const controlsSection = (
    <VStack gap={isStacked ? 6 : 8}>
      <Reveal isReduced={isReduced}>
        <SectionIntro
          kicker="Card controls"
          title="Controls that act at the network, not on the statement"
          description="Freeze, limit, and match from the same pane your team already lives in — every rule enforces itself at authorization time."
        />
      </Reveal>
      {CONTROL_FEATURES.map((feature, index) => (
        <Reveal key={feature.id} isReduced={isReduced}>
          <div
            style={{
              ...styles.featureRow,
              ...(index % 2 === 1 ? styles.featureRowReversed : null),
              ...(isStacked ? styles.featureRowStacked : null),
            }}>
            <div style={styles.featureText}>
              <div style={styles.featureGlyph} aria-hidden="true">
                <Icon icon={feature.icon} size="md" color="inherit" />
              </div>
              <Token label={feature.kicker} size="sm" color="teal" />
              <Heading level={3}>{feature.title}</Heading>
              <Text type="body" color="secondary">
                {feature.copy}
              </Text>
              <VStack gap={2}>
                {feature.bullets.map(bullet => (
                  <CheckBullet key={bullet} label={bullet} />
                ))}
              </VStack>
            </div>
            <div style={styles.featureArt}>
              <ControlVignette variant={feature.vignette} />
            </div>
          </div>
        </Reveal>
      ))}
    </VStack>
  );

  const feesSection = (
    <VStack gap={4}>
      <Reveal isReduced={isReduced}>
        <SectionIntro
          kicker="Fees"
          title="The fee schedule fits in one table"
          description="Six line items, five of them zero. Compare against what a business bank actually charges."
        />
      </Reveal>
      <Reveal isReduced={isReduced} delay={80}>
        <div style={styles.feeScroller}>
          <div
            style={styles.feeGrid}
            role="table"
            aria-label="Fee comparison: Keel versus Meridian Business Bank and Harbor National">
            <div role="row" style={{display: 'contents'}}>
              <span role="columnheader" style={styles.feeHeadCell}>
                Fee
              </span>
              <span
                role="columnheader"
                style={{...styles.feeHeadCell, ...styles.feeKeelHead}}>
                Keel
              </span>
              <span role="columnheader" style={styles.feeHeadCell}>
                Meridian Business
              </span>
              <span role="columnheader" style={styles.feeHeadCell}>
                Harbor National
              </span>
            </div>
            {FEE_ROWS.map((row, index) => {
              const isLast = index === FEE_ROWS.length - 1;
              const borderFix = isLast ? {borderBottom: 'none'} : null;
              return (
                <div key={row.id} role="row" style={{display: 'contents'}}>
                  <span
                    role="rowheader"
                    style={{...styles.feeCell, fontWeight: 600, ...borderFix}}>
                    {row.label}
                  </span>
                  <span
                    role="cell"
                    style={{
                      ...styles.feeCell,
                      ...(row.keelIsZero ? styles.feeCellZero : null),
                      ...borderFix,
                    }}>
                    {row.keelIsZero && (
                      <span
                        style={{display: 'inline-flex', marginRight: 6}}
                        aria-hidden="true">
                        <Icon icon={CheckIcon} size="xsm" color="inherit" />
                      </span>
                    )}
                    {row.keel}
                  </span>
                  <span
                    role="cell"
                    style={{
                      ...styles.feeCell,
                      color: 'var(--color-text-secondary)',
                      ...borderFix,
                    }}>
                    {row.meridian}
                  </span>
                  <span
                    role="cell"
                    style={{
                      ...styles.feeCell,
                      color: 'var(--color-text-secondary)',
                      ...borderFix,
                    }}>
                    {row.harbor}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
      <Text type="supporting" color="secondary">
        {FEE_FOOTNOTE}
      </Text>
    </VStack>
  );

  const feedSection = (
    <VStack gap={4}>
      <Reveal isReduced={isReduced}>
        <SectionIntro
          kicker="Real-time feed"
          title="Spend shows up before the receipt hits the table"
          description="Every authorization streams into the feed with its cardholder, category, and match status — no waiting for the statement."
        />
      </Reveal>
      <div style={styles.feedCard}>
        <div
          style={{
            ...styles.feedRow,
            borderTop: 'none',
            backgroundColor: 'var(--color-background-muted)',
          }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
            }}>
            Today · Sun, Jul 12
          </span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Badge variant="teal" label="Live" />
        </div>
        {FEED_TXS.map((tx, index) => (
          <Reveal key={tx.id} isReduced={isReduced} delay={index * 90}>
            <div style={styles.feedRow}>
              <div
                style={{...styles.monogram, background: tx.tileArt}}
                aria-hidden="true">
                {tx.monogram}
              </div>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text size="sm" weight="semibold">
                    {tx.merchant}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {tx.holder}
                  </Text>
                </VStack>
              </StackItem>
              {!isPhone && <span style={styles.categoryChip}>{tx.category}</span>}
              <span style={styles.feedAmount}>{tx.amount}</span>
              <Badge variant={tx.statusVariant} label={tx.status} />
            </div>
          </Reveal>
        ))}
      </div>
      <Grid columns={{minWidth: 200, max: 3}} gap={3}>
        {STATS.map(stat => (
          <Card key={stat.id} padding={4}>
            <VStack gap={1}>
              <CountUpNumber
                value={stat.target}
                format={stat.format}
                isReduced={isReduced}
                style={styles.statValue}
              />
              <Text type="supporting" color="secondary">
                {stat.caption}
              </Text>
            </VStack>
          </Card>
        ))}
      </Grid>
    </VStack>
  );

  const rewardsSection = (
    <VStack gap={4}>
      <Reveal isReduced={isReduced}>
        <SectionIntro
          kicker="Rewards"
          title="1.5% back. No categories, no caps, no points math."
          description="Charge card, paid in full monthly — so there is no interest to calculate, only cashback. Drag the slider to see yours."
        />
      </Reveal>
      <Reveal isReduced={isReduced} delay={80}>
        <Card padding={5}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-6)',
              alignItems: 'stretch',
              flexDirection: isStacked ? 'column' : 'row',
            }}>
            <StackItem size="fill">
              <VStack gap={4}>
                <Slider
                  label="Monthly card spend"
                  description="Across every Keel card on the account"
                  min={SPEND_MIN}
                  max={SPEND_MAX}
                  step={SPEND_STEP}
                  value={monthlySpend}
                  onChange={(value: number) => setMonthlySpend(value)}
                  valueDisplay="text"
                  formatValue={value => formatUSD(value)}
                  marks={[
                    {value: SPEND_MIN, label: '$5k'},
                    {value: 125_000, label: '$125k'},
                    {value: SPEND_MAX, label: '$250k'},
                  ]}
                />
                <Text type="supporting" color="secondary">
                  Cashback accrues as a statement credit at a flat{' '}
                  {(CASHBACK_RATE * 100).toFixed(1)}% — the same on ads,
                  travel, and SaaS. No enrollment, no rotating categories.
                </Text>
              </VStack>
            </StackItem>
            <Divider orientation={isStacked ? 'horizontal' : 'vertical'} />
            <VStack gap={4}>
              <VStack gap={1}>
                <Text type="supporting" color="secondary">
                  Cashback per month
                </Text>
                <CountUpNumber
                  value={monthlyCashback}
                  format={formatUSD}
                  isReduced={isReduced}
                  style={styles.calcStat}
                />
              </VStack>
              <VStack gap={1}>
                <Text type="supporting" color="secondary">
                  Per year at this pace
                </Text>
                <CountUpNumber
                  value={monthlyCashback * 12}
                  format={formatUSD}
                  isReduced={isReduced}
                  style={{...styles.statValue}}
                />
              </VStack>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Badge variant="success" label="No annual fee" />
                <Badge variant="success" label="No interest — charge card" />
              </HStack>
            </VStack>
          </div>
        </Card>
      </Reveal>
    </VStack>
  );

  const complianceBand = (
    <div style={styles.complianceBand}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
          gap: 'var(--spacing-3)',
          paddingBlock: 'var(--spacing-5)',
        }}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
          <Text type="label">The honest small print</Text>
          <Badge variant="neutral" label="Member FDIC partner bank" />
          <Badge variant="neutral" label="PCI DSS Level 1" />
          <Badge variant="neutral" label="SOC 2 Type II" />
        </HStack>
        {COMPLIANCE_LINES.map(line => (
          <p key={line.slice(0, 24)} style={styles.finePrint}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );

  // ============= CTA + FOOTER =============

  const ctaEmailForm =
    ctaForm.confirmedEmail !== null ? (
      <HStack gap={3} vAlign="center" wrap="wrap" hAlign="center">
        <div style={{...styles.successDisc, ...styles.successDiscDark}}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <VStack gap={0} hAlign="start">
          <Text weight="semibold" color="inherit">
            Application started
          </Text>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_SOFT}}>
            Next steps are on their way to {ctaForm.confirmedEmail}.
          </Text>
        </VStack>
        <Button
          label="Use a different email"
          variant="ghost"
          size="sm"
          onClick={() => setCtaForm(EMPTY_EMAIL_FORM)}
        />
      </HStack>
    ) : (
      <VStack gap={1} hAlign="center">
        <div
          style={{
            ...styles.emailRow,
            width: '100%',
            justifyContent: 'center',
            ...(isPhone ? styles.emailRowStacked : null),
          }}>
          <div style={{...styles.emailInput, maxWidth: 320}}>
            <TextInput
              label="Work email for your application"
              isLabelHidden
              placeholder="you@company.com"
              value={ctaForm.value}
              onChange={value => setCtaForm({...ctaForm, value, error: null})}
            />
          </div>
          <Button
            label="Get started"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => submitEmailForm(ctaForm, setCtaForm)}
          />
        </div>
        {ctaForm.error !== null && (
          <p
            style={{...styles.emailError, ...styles.emailErrorOnDark}}
            role="alert">
            {ctaForm.error}
          </p>
        )}
      </VStack>
    );

  const finalCta = (
    <div
      style={{
        ...styles.finalCta,
        ...(isPhone ? styles.finalCtaCompact : null),
      }}>
      <span style={styles.metricChip}>
        <Icon icon={ZapIcon} size="xsm" color="inherit" />
        Apply in 10 minutes · cards the same day
      </span>
      <h2
        style={{
          ...styles.finalHeadline,
          ...(isPhone ? styles.finalHeadlineCompact : null),
        }}>
        Put the books on autopilot
      </h2>
      <Text
        type="body"
        color="inherit"
        justify="center"
        style={{color: DARK_TEXT_SOFT, maxWidth: 560}}>
        Connect your ledger, issue your first card, and watch the first
        receipt match itself. Month-end will feel suspiciously quiet.
      </Text>
      {ctaEmailForm}
      <Text
        type="supporting"
        color="inherit"
        style={{color: DARK_TEXT_FAINT}}>
        {HERO.finePrint}
      </Text>
    </div>
  );

  const footerEmailForm =
    footerForm.confirmedEmail !== null ? (
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={{...styles.successDisc, ...styles.successDiscDark}}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text weight="semibold" color="inherit">
              You&rsquo;re on the list
            </Text>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_SOFT}}>
              The monthly close letter will land at {footerForm.confirmedEmail}.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Use a different email"
          variant="ghost"
          size="sm"
          onClick={() => setFooterForm(EMPTY_EMAIL_FORM)}
        />
      </HStack>
    ) : (
      <VStack gap={1}>
        <div
          style={{
            ...styles.emailRow,
            ...(isPhone ? styles.emailRowStacked : null),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Email for the monthly close letter"
              isLabelHidden
              placeholder="you@company.com"
              value={footerForm.value}
              onChange={value =>
                setFooterForm({...footerForm, value, error: null})
              }
            />
          </div>
          <Button
            label="Subscribe"
            variant="secondary"
            onClick={() => submitEmailForm(footerForm, setFooterForm)}
          />
        </div>
        {footerForm.error !== null && (
          <p
            style={{...styles.emailError, ...styles.emailErrorOnDark}}
            role="alert">
            {footerForm.error}
          </p>
        )}
      </VStack>
    );

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerCompact : null),
        }}>
        <HStack gap={6} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={3}>
              <BrandMark nameColor={DARK_TEXT} />
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_FAINT, maxWidth: 320}}>
                One letter a month on closing the books faster. Zero fluff,
                one-click unsubscribe.
              </Text>
              {footerEmailForm}
            </VStack>
          </StackItem>
          <StackItem size="fill">
            <Grid columns={{minWidth: 132, max: 4}} gap={4}>
              {FOOTER_COLUMNS.map(column => (
                <VStack key={column.id} gap={2}>
                  <Text size="sm" weight="semibold" color="inherit">
                    {column.heading}
                  </Text>
                  {column.links.map(link => (
                    <button
                      key={link.label}
                      type="button"
                      style={styles.footerLink}
                      onClick={() =>
                        link.anchor !== undefined
                          ? jumpToSection(link.anchor)
                          : undefined
                      }>
                      {link.label}
                    </button>
                  ))}
                </VStack>
              ))}
            </Grid>
          </StackItem>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Keel Financial, Inc. Keel is not a bank; banking
              services by Coastline Bank, N.A., Member FDIC.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            PCI DSS Level 1 · SOC 2 Type II
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  const columnStyle = {
    ...styles.column,
    ...(isPhone ? styles.columnCompact : null),
  };

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Keel landing page">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {/* plain band: hero */}
              <div style={columnStyle}>{hero}</div>
              {/* plain band: card controls */}
              <section
                ref={registerSection('controls')}
                aria-label="Card controls">
                <div style={columnStyle}>{controlsSection}</div>
              </section>
              {/* full-bleed tinted band: fees */}
              <section ref={registerSection('fees')} aria-label="Fees">
                <div style={styles.tintedBand}>
                  <div style={columnStyle}>{feesSection}</div>
                </div>
              </section>
              {/* plain band: live spend feed + stats */}
              <section
                ref={registerSection('feed')}
                aria-label="Real-time spend feed">
                <div style={columnStyle}>{feedSection}</div>
              </section>
              {/* full-bleed tinted band: rewards calculator */}
              <section ref={registerSection('rewards')} aria-label="Rewards">
                <div style={styles.tintedBand}>
                  <div style={columnStyle}>{rewardsSection}</div>
                </div>
              </section>
              {/* compliance small print */}
              {complianceBand}
              {/* dark CTA panel */}
              <section
                ref={registerSection('get-started')}
                aria-label="Get started">
                <div style={columnStyle}>{finalCta}</div>
              </section>
              {footer}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};