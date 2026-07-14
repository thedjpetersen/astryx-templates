var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file security-trust-center.tsx
 * @input Deterministic fixtures only (the fictional "Vantage" data
 *   platform's trust center: a live-status row with a fixed 99.98% 90-day
 *   uptime figure and a 90-day per-day uptime history ending 2026-07-12
 *   with one maintenance window and one degraded day, four compliance
 *   frameworks (SOC 2 Type II / ISO 27001 / GDPR / HIPAA) each with seal
 *   monogram, auditor blurb, and artifact chip, twelve security-practice
 *   rows grouped into Encryption / Access / Infrastructure / People, a
 *   three-node client → edge → vault data-flow schematic with per-node
 *   detail copy, six subprocessors with region and DPA state, a
 *   security.txt body plus PGP fingerprint, and the last three security
 *   changelog entries)
 * @output Art-directed trust-center marketing page. A condensing sticky
 *   navbar (transparent at top, tinted hairline surface after 24px of
 *   scroll) carries five smooth-scrolling anchors and a sheen-sweep CTA.
 *   The hero pairs 78px display type with gradient-ink on the key phrase
 *   over a drifting aurora field and grain texture, and stages the
 *   90-day uptime snapshot card as a product theater: perspective tilt,
 *   floating satellite mini-cards (zero-exceptions chip, report-sent
 *   toast, auditor cluster) bobbing on independent keyframes with ±8px
 *   pointer parallax, and the card deliberately bleeding across the
 *   section boundary into the tinted compliance band below. Compliance
 *   is a staggered 4-up wall of hover-raising seal cards whose
 *   "Report available" chips open inline validating request-access
 *   email captures. Practices become an asymmetric split — sticky left
 *   rail with an oversized "12" numeral and category jump chips beside
 *   the twelve-row accordion. Architecture is the signature
 *   scheme-locked dark band and a pinned scroll story: a tall pinned
 *   container hosts a glass stage where scroll progress advances
 *   client → edge → vault, draws the connector strokes, and fills a
 *   clickable three-step rail, all under a pointer-tracked spotlight
 *   (reduced motion or compact widths render the static stacked
 *   sequence with hover/click node selection intact). Subprocessor
 *   Table (stacking to vendor cards), responsible-disclosure card with
 *   copyable security.txt CodeBlock and PGP fingerprint feedback, and
 *   the three-entry changelog sit under a second aurora before the
 *   footer. Reveals stagger 80ms, rise 16px with a 0.985 scale settle;
 *   count-ups run ~900ms decelerate; every motion path is gated by
 *   prefers-reduced-motion (reveals visible, counters final, auroras
 *   static, parallax off, story unpinned).
 * @position Page template; emitted by \`astryx template security-trust-center\`
 *
 * Frame: Layout height="fill" with LayoutContent padding 0 — the page
 * owns its own chrome. A measured wrapper div (ResizeObserver, width AND
 * height) hosts the scroll container; the navbar is position:sticky
 * top:0 inside it, and a centered 1100px column carries every section
 * while tinted bands, the dark architecture band, and the footer paint
 * full-bleed. The Toast sits fixed bottom-right.
 *
 * Color policy: token-pure except ONE quarantined brand accent declared
 * as a light-dark() pair (plus its low-alpha soft tint of the same two
 * hexes) with contrast math documented at the declaration. The dark
 * architecture band is a scheme-locked art surface per repo convention
 * (colorScheme:'dark' + neutral DARK/GLASS literals and glows drawn
 * from the accent's own dark hex at low alpha — no new hues). All other
 * glows and auroras are color-mix() derivations of the accent and
 * status tokens. Status tints (success / warning / error) use
 * var(--color-*) tokens with explicit light-dark() fallbacks.
 *
 * Responsive contract (element width, not viewport — the inline demo
 * stage is ~1045px wide, so the page measures itself):
 * - Column: max-width 1100px, centered; bands and footer bleed.
 * - <=980px: hero type steps 78 → 64; compliance wall drops 4-up → 2-up
 *   (offsets flatten); the practices rail unsticks and stacks above the
 *   accordion.
 * - <=880px: nav anchors + CTA collapse behind a 40px menu button whose
 *   dropdown closes on Escape, outside pointerdown, or selection.
 * - <=760px: hero splits stack (satellites and parallax retire, the
 *   snapshot card stops bleeding across the boundary), the architecture
 *   story unpins into the static vertical schematic, and the
 *   disclosure / changelog pair stacks.
 * - <=640px: the subprocessor Table becomes stacked vendor cards.
 * - <=540px: compliance wall goes single column, headline steps to
 *   40px, band paddings tighten, and the request forms stack their
 *   buttons. Action rows wrap, so the page holds at 390px with no
 *   overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {
  ActivityIcon,
  ArrowRightIcon,
  BugIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MailCheckIcon,
  MenuIcon,
  SendIcon,
  ServerIcon,
  ShieldCheckIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= QUARANTINED ACCENT =============
// The single sanctioned accent literal for the Vantage brand — a deep
// "audited calm" teal. Contrast math: #0F766E on a white light-mode body
// is 5.5:1 (AA for normal text and UI glyphs); #5EEAD4 on a ~#1E1E1E
// dark surface is 11.2:1 (AAA). ACCENT_SOFT is the same two hexes at low
// alpha, used only as a fill behind accent-colored glyphs/chips — never
// as a text color. Everything else on the page is token-pure or a
// color-mix() derivation of this accent and status tokens.
const ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const ACCENT_SOFT =
  'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.13))';

// Status tints follow the repo convention: token first, explicit
// light-dark() fallback second.
const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const WARNING = 'var(--color-warning, light-dark(#B26A00, #FCD34D))';
const ERROR = 'var(--color-error, light-dark(#B3261E, #F2B8B5))';

// Scheme-locked dark-band literals (repo convention for art surfaces —
// see saas-landing-page / devtool-terminal-landing). Neutral slate text
// ramps plus glass whites; the two glow colors are the accent's own
// dark hex (#5EEAD4) at low alpha, so no new hue enters the page.
// Contrast: DARK_TEXT #F1F5F9 on #071D1B is 16.5:1; DARK_TEXT_SOFT is
// 11.8:1; DARK_TEXT_FAINT is 8.1:1 — all AA+ for their sizes.
const DARK_BG = '#071D1B';
const DARK_TEXT = '#F1F5F9';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.78)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.55)';
const GLASS_BG = 'rgba(255, 255, 255, 0.06)';
const GLASS_STROKE = 'rgba(255, 255, 255, 0.14)';
const DARK_GLOW = 'rgba(94, 234, 212, 0.14)';
const DARK_GLOW_STRONG = 'rgba(94, 234, 212, 0.32)';

// Depth tiers (contract-standard neutral shadows, used consistently).
const SHADOW_RAISED =
  '0 1px 2px rgba(0,0,0,.06), 0 8px 24px -12px rgba(0,0,0,.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0,0,0,.06), 0 8px 24px -12px rgba(0,0,0,.18), 0 24px 48px -24px rgba(0,0,0,.28)';
const SHADOW_GLASS = \`inset 0 0 0 1px \${GLASS_STROKE}, 0 24px 48px -24px rgba(0,0,0,.55)\`;

// Grain texture: inline SVG feTurbulence, tiled at very low opacity.
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'160\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'2\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'160\\' height=\\'160\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E")';

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 64;

// Keyframes + hover choreography. Class names are stc- prefixed to stay
// page-local; a prefers-reduced-motion block hard-disables everything
// the JS gates might miss.
const PAGE_CSS = \`
@keyframes stc-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(52px, -36px, 0) scale(1.1); }
}
@keyframes stc-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-44px, 30px, 0) scale(0.92); }
}
@keyframes stc-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}
.stc-card {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.stc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px color-mix(in srgb, \${ACCENT} 45%, transparent),
    \${SHADOW_FLOATING};
}
.stc-cta {
  position: relative;
  display: inline-flex;
  border-radius: 10px;
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.stc-cta:hover { transform: translateY(-1px); box-shadow: \${SHADOW_RAISED}; }
.stc-cta:active { transform: scale(0.98); }
.stc-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 34%,
    color-mix(in srgb, var(--color-background-card) 55%, transparent) 48%,
    transparent 62%);
  transform: translateX(-140%);
}
.stc-cta:hover::after {
  transform: translateX(140%);
  transition: transform 0.7s ease;
}
@media (prefers-reduced-motion: reduce) {
  .stc-anim { animation: none !important; }
  .stc-cta, .stc-cta:hover, .stc-cta:active { transform: none; }
  .stc-cta::after { display: none; }
  .stc-card, .stc-card:hover { transform: none; }
}
\`;

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
    position: 'relative',
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    paddingBlock: 112,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 64,
    gap: 'var(--spacing-5)',
  },
  bandTinted: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- atmosphere ----
  atmoWrap: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN,
    backgroundSize: '160px 160px',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: \`radial-gradient(color-mix(in srgb, \${ACCENT} 22%, transparent) 1px, transparent 1.5px)\`,
    backgroundSize: '26px 26px',
    maskImage:
      'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
    WebkitMaskImage:
      'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  // ---- sticky navbar (transparent → condensed tinted surface) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 92%, transparent)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: SHADOW_RAISED,
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 64,
  },
  navInnerScrolled: {
    minHeight: 52,
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 40,
    paddingInline: 11,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
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
  menuPanel: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-3)',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  menuLink: {
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
  heroSection: {
    position: 'relative',
    zIndex: 2,
  },
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  heroText: {
    flex: '1.1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontWeight: 730,
    lineHeight: 1.03,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  gradientInk: {
    backgroundImage: \`linear-gradient(94deg, \${ACCENT} 10%, color-mix(in srgb, \${ACCENT} 45%, \${SUCCESS}) 90%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  },
  heroSubcopy: {
    fontSize: 18,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '52ch',
    margin: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  eyebrowChip: {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid color-mix(in srgb, \${ACCENT} 30%, transparent)\`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // ---- hero theater (snapshot card + satellites) ----
  theater: {
    position: 'relative',
    flex: '1 1 0',
    minWidth: 0,
    perspective: 1400,
  },
  theaterParallax: {
    transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  snapshotCard: {
    position: 'relative',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  satellite: {
    position: 'absolute',
    zIndex: 3,
  },
  satCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: '8px 12px',
    whiteSpace: 'nowrap',
  },
  satDisc: {
    width: 26,
    height: 26,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  satTitle: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  satCaption: {
    fontSize: 11,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
  },
  auditorDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.02em',
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    border: '2px solid var(--color-background-card)',
    boxSizing: 'border-box',
  },
  tickStrip: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 34,
  },
  tick: {
    flex: '1 1 0',
    minWidth: 0,
    height: '100%',
    borderRadius: 1.5,
    transformOrigin: 'bottom',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- section headers ----
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    maxWidth: 620,
  },
  sectionTitle: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.12,
    margin: 0,
  },
  sectionTitleCompact: {
    fontSize: 28,
  },
  // ---- compliance wall ----
  complianceGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  complianceCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  requestForm: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  requestFormStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  requestInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  errorText: {
    fontSize: 13,
    margin: 0,
    color: ERROR,
  },
  successDisc: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  // ---- practices (sticky rail + accordion column) ----
  practicesRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  practicesRowStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  practicesRail: {
    flex: '0 0 320px',
    position: 'sticky',
    top: NAV_ALLOWANCE + 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minWidth: 0,
  },
  practicesRailStacked: {
    position: 'static',
    flex: '1 1 auto',
  },
  bigNumeral: {
    fontSize: 128,
    fontWeight: 750,
    lineHeight: 0.9,
    letterSpacing: '-0.05em',
    fontVariantNumeric: 'tabular-nums',
    color: \`color-mix(in srgb, \${ACCENT} 30%, transparent)\`,
  },
  bigNumeralCompact: {
    fontSize: 72,
  },
  railJump: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 40,
    paddingInline: 10,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  practicesCol: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  categoryGlyph: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  practiceCard: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  // ---- dark architecture band (scheme-locked art surface) ----
  archBand: {
    position: 'relative',
    colorScheme: 'dark',
    backgroundColor: DARK_BG,
    color: DARK_TEXT,
    borderTop: \`1px solid \${GLASS_STROKE}\`,
    borderBottom: \`1px solid \${GLASS_STROKE}\`,
  },
  archStage: {
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  stageGlowA: {
    position: 'absolute',
    width: 620,
    height: 520,
    top: -180,
    left: '-8%',
    borderRadius: '50%',
    filter: 'blur(100px)',
    background: \`radial-gradient(circle at 40% 40%, \${DARK_GLOW_STRONG}, transparent 70%)\`,
    opacity: 0.55,
  },
  stageGlowB: {
    position: 'absolute',
    width: 520,
    height: 460,
    bottom: -200,
    right: '-6%',
    borderRadius: '50%',
    filter: 'blur(96px)',
    background: \`radial-gradient(circle at 60% 50%, color-mix(in srgb, \${SUCCESS} 40%, transparent), transparent 70%)\`,
    opacity: 0.4,
  },
  hairlineGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 90px)',
    pointerEvents: 'none',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    background: \`radial-gradient(480px circle at var(--mx, 62%) var(--my, 30%), \${DARK_GLOW}, transparent 68%)\`,
    pointerEvents: 'none',
  },
  darkEyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  darkTitle: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.12,
    margin: 0,
    color: DARK_TEXT,
  },
  darkTitleCompact: {
    fontSize: 28,
  },
  darkCopy: {
    fontSize: 15,
    lineHeight: 1.55,
    color: DARK_TEXT_SOFT,
    margin: 0,
    maxWidth: '58ch',
  },
  stepRail: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  stepBtn: {
    flex: '1 1 160px',
    minWidth: 150,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 6,
    padding: '10px 12px 12px',
    borderRadius: 12,
    border: \`1px solid \${GLASS_STROKE}\`,
    backgroundColor: GLASS_BG,
    cursor: 'pointer',
    textAlign: 'left',
  },
  stepIndex: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 11,
    letterSpacing: '0.08em',
    color: DARK_TEXT_FAINT,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK_TEXT,
  },
  stepBarTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  stepBarFill: {
    display: 'block',
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: ACCENT,
    transformOrigin: 'left',
  },
  flowCard: {
    position: 'relative',
    borderRadius: 18,
    backgroundColor: GLASS_BG,
    boxShadow: SHADOW_GLASS,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  flowDetail: {
    borderRadius: 12,
    backgroundColor: GLASS_BG,
    boxShadow: \`inset 0 0 0 1px \${GLASS_STROKE}\`,
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    minHeight: 96,
    boxSizing: 'border-box',
  },
  flowDetailTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: DARK_TEXT,
  },
  flowDetailSub: {
    fontSize: 12,
    color: DARK_TEXT_FAINT,
  },
  flowDetailCopy: {
    fontSize: 13,
    lineHeight: 1.55,
    color: DARK_TEXT_SOFT,
    margin: 0,
  },
  // ---- subprocessors ----
  vendorTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  vendorCard: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  tableFrame: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    overflow: 'hidden',
  },
  // ---- disclosure + changelog ----
  duoRow: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
  },
  duoRowStacked: {
    flexDirection: 'column',
  },
  disclosureCard: {
    flex: '1.25 1 0',
    minWidth: 0,
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  fingerprintRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  mono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    letterSpacing: '0.02em',
    wordBreak: 'break-word',
  },
  changelogCol: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  changelogEntry: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 36,
    paddingInline: 4,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    textAlign: 'left',
  },
  // ---- toast ----
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Vantage data platform.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Vantage',
  suffix: 'Trust Center',
  statusHost: 'status.vantagedata.io',
};

const HERO = {
  eyebrow: 'Vantage Trust Center',
  headline: 'Your data, provably safe',
  subcopy:
    'Vantage moves and stores your most sensitive records. This page is ' +
    'the living inventory of how we protect them — the audits we pass, ' +
    'the controls we run, and the people who answer when something looks ' +
    'wrong.',
  uptimePercent: 99.98,
};

type SectionId =
  | 'compliance'
  | 'practices'
  | 'architecture'
  | 'subprocessors'
  | 'disclosure';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'compliance', label: 'Compliance'},
  {id: 'practices', label: 'Practices'},
  {id: 'architecture', label: 'Architecture'},
  {id: 'subprocessors', label: 'Subprocessors'},
  {id: 'disclosure', label: 'Disclosure'},
];

/** 90-day uptime history ending 2026-07-12: 88 green, 1 amber, 1 red. */
type DayStatus = 'operational' | 'maintenance' | 'degraded';

interface UptimeDay {
  iso: string;
  status: DayStatus;
  note: string;
}

const UPTIME_EPOCH_UTC = Date.UTC(2026, 3, 14); // 2026-04-14, fixed fixture
const DAY_MS = 86_400_000;

const UPTIME_DAYS: readonly UptimeDay[] = Array.from({length: 90}, (_, i) => {
  const iso = new Date(UPTIME_EPOCH_UTC + i * DAY_MS)
    .toISOString()
    .slice(0, 10);
  if (iso === '2026-05-14') {
    return {
      iso,
      status: 'maintenance' as const,
      note: 'Scheduled maintenance · 02:00–02:35 UTC',
    };
  }
  if (iso === '2026-06-03') {
    return {
      iso,
      status: 'degraded' as const,
      note: 'Elevated ingest errors · 41 min · postmortem published',
    };
  }
  return {iso, status: 'operational' as const, note: 'Operational'};
});

const TICK_COLOR: Record<DayStatus, string> = {
  operational: SUCCESS,
  maintenance: WARNING,
  degraded: ERROR,
};

/** Hero snapshot stats — all counted up on first view. */
const SNAPSHOT_STATS: readonly {
  id: string;
  target: number;
  suffix: string;
  label: string;
}[] = [
  {id: 'controls', target: 247, suffix: '', label: 'automated controls monitored'},
  {id: 'patch', target: 48, suffix: ' h', label: 'critical-patch SLA (median 11 h)'},
  {id: 'frameworks', target: 4, suffix: '', label: 'frameworks audited annually'},
];

// ---- compliance wall ----

interface Framework {
  id: string;
  seal: string;
  name: string;
  blurb: string;
  chipLabel: string;
  artifact: string;
}

const FRAMEWORKS: readonly Framework[] = [
  {
    id: 'soc2',
    seal: 'SOC 2',
    name: 'SOC 2 Type II',
    blurb:
      'Audited annually by Meridian Assurance LLP against the Security, ' +
      'Availability, and Confidentiality criteria. Latest period Nov 2024 ' +
      '– Oct 2025: zero exceptions noted.',
    chipLabel: 'Report available',
    artifact: 'SOC 2 Type II report',
  },
  {
    id: 'iso27001',
    seal: '27001',
    name: 'ISO/IEC 27001:2022',
    blurb:
      'Certified since 2023 by Nordcert. Scope covers the Vantage ' +
      'platform, corporate IT, and the Frankfurt and Toronto regions; ' +
      'surveillance audit passed May 2026.',
    chipLabel: 'Certificate available',
    artifact: 'ISO 27001 certificate',
  },
  {
    id: 'gdpr',
    seal: 'GDPR',
    name: 'GDPR',
    blurb:
      'EU customer data stays in eu-central by default. Standard ' +
      'Contractual Clauses ship in every DPA, and DSAR tooling closes ' +
      'requests inside a 30-day SLA.',
    chipLabel: 'DPA available',
    artifact: 'Data Processing Addendum',
  },
  {
    id: 'hipaa',
    seal: 'HIPAA',
    name: 'HIPAA',
    blurb:
      'Business Associate Agreements are available on the Scale plan. ' +
      'PHI workloads run in dedicated cells with customer-managed keys ' +
      'and separate audit trails.',
    chipLabel: 'BAA on request',
    artifact: 'Business Associate Agreement',
  },
];

// ---- security practices (12 rows across 4 categories) ----

interface Practice {
  id: string;
  title: string;
  copy: string;
}

interface PracticeCategory {
  id: string;
  name: string;
  icon: Glyph;
  rows: readonly Practice[];
}

const PRACTICE_CATEGORIES: readonly PracticeCategory[] = [
  {
    id: 'encryption',
    name: 'Encryption',
    icon: LockKeyholeIcon,
    rows: [
      {
        id: 'transit',
        title: 'Encryption in transit',
        copy:
          'TLS 1.3 everywhere, HSTS preloaded, and internal service-to-' +
          'service traffic authenticated over mTLS with SPIFFE identities. ' +
          'TLS 1.0–1.2 are disabled at the edge.',
      },
      {
        id: 'rest',
        title: 'Encryption at rest',
        copy:
          'AES-256-GCM on every datastore, queue, and backup. Envelope ' +
          'encryption issues a distinct data key per tenant, rotated every ' +
          '90 days without downtime.',
      },
      {
        id: 'keys',
        title: 'Key management',
        copy:
          'Root keys live in cloud HSMs validated to FIPS 140-2 Level 3. ' +
          'Scale customers can bring their own keys (BYOK); root-key ' +
          'operations require dual control.',
      },
    ],
  },
  {
    id: 'access',
    name: 'Access',
    icon: KeyRoundIcon,
    rows: [
      {
        id: 'sso',
        title: 'Single sign-on & MFA',
        copy:
          'SSO is enforced org-wide and every employee authenticates with ' +
          'a hardware security key. No shared accounts, no SMS codes, no ' +
          'password-only fallback.',
      },
      {
        id: 'least-privilege',
        title: 'Least-privilege production access',
        copy:
          'Production access is granted through short-lived, peer-approved ' +
          'sessions — median grant length 42 minutes. Standing admin ' +
          'credentials: zero.',
      },
      {
        id: 'reviews',
        title: 'Access reviews & offboarding',
        copy:
          'Every role and grant is re-certified quarterly and the review ' +
          'is written to the audit trail. Offboarding revokes all access ' +
          'within 15 minutes of HR trigger.',
      },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: ServerIcon,
    rows: [
      {
        id: 'isolation',
        title: 'Network isolation',
        copy:
          'Tenants are logically isolated end to end. The vault tier ' +
          'accepts traffic only from the edge tier over mTLS; nothing in ' +
          'production is reachable from the public internet directly.',
      },
      {
        id: 'vulns',
        title: 'Vulnerability management',
        copy:
          'Authenticated scans run weekly; criticals carry a 48-hour patch ' +
          'SLA (90-day median: 11 hours). An independent penetration test ' +
          'runs annually with a published summary.',
      },
      {
        id: 'backups',
        title: 'Backups & resilience',
        copy:
          'Continuous replication across three availability zones, 35-day ' +
          'point-in-time recovery, and quarterly restore drills averaging ' +
          'a 22-minute recovery.',
      },
    ],
  },
  {
    id: 'people',
    name: 'People',
    icon: UsersIcon,
    rows: [
      {
        id: 'screening',
        title: 'Background screening',
        copy:
          'Every employee is screened before start where legally ' +
          'permitted; privileged roles are re-screened every two years.',
      },
      {
        id: 'training',
        title: 'Security training',
        copy:
          'Security onboarding plus annual refreshers, with phishing ' +
          'simulations every six weeks. 2025 completion rate: 100% of 312 ' +
          'employees.',
      },
      {
        id: 'vendors',
        title: 'Vendor review',
        copy:
          'Every subprocessor passes a security review and signs a DPA ' +
          'before touching customer data; reviews are refreshed annually ' +
          'and tracked below.',
      },
    ],
  },
];

// ---- data-flow schematic ----

type FlowNodeId = 'client' | 'edge' | 'vault';

interface FlowNode {
  id: FlowNodeId;
  title: string;
  subtitle: string;
  detail: string;
  chips: readonly string[];
}

const FLOW_NODES: readonly FlowNode[] = [
  {
    id: 'client',
    title: 'Client',
    subtitle: 'SDKs · browser · CLI',
    detail:
      'Your applications sign every request with a scoped API key. Keys ' +
      'never grant more than one workspace, and browser sessions ride on ' +
      'short-lived tokens refreshed every 15 minutes.',
    chips: ['Scoped API keys', 'TLS 1.3', '15-min session tokens'],
  },
  {
    id: 'edge',
    title: 'Edge',
    subtitle: 'AuthN · rate limits · WAF',
    detail:
      'The edge tier terminates TLS, verifies identity, applies per-tenant ' +
      'rate limits, and strips anything malformed before it can reach ' +
      'storage. It holds no customer data at rest.',
    chips: ['WAF + anomaly rules', 'Per-tenant rate limits', 'Zero data at rest'],
  },
  {
    id: 'vault',
    title: 'Vault',
    subtitle: 'Isolated storage cells',
    detail:
      'Records land in per-tenant storage cells encrypted with AES-256-GCM ' +
      'under per-tenant data keys. The vault accepts connections only from ' +
      'the edge tier over mTLS — never from the internet.',
    chips: ['AES-256-GCM at rest', 'Per-tenant keys', 'mTLS-only ingress'],
  },
];

// ---- subprocessors ----

interface Subprocessor extends Record<string, unknown> {
  id: string;
  vendor: string;
  monogram: string;
  purpose: string;
  region: string;
  dpa: 'signed' | 'renewal';
}

const SUBPROCESSORS: readonly Subprocessor[] = [
  {
    id: 'helios',
    vendor: 'Helios Cloud',
    monogram: 'HC',
    purpose: 'Infrastructure hosting',
    region: 'EU (Frankfurt) · US (Virginia)',
    dpa: 'signed',
  },
  {
    id: 'stackwatch',
    vendor: 'Stackwatch',
    monogram: 'SW',
    purpose: 'Logging & monitoring',
    region: 'US (Oregon)',
    dpa: 'signed',
  },
  {
    id: 'relaypost',
    vendor: 'Relay Post',
    monogram: 'RP',
    purpose: 'Transactional email',
    region: 'EU (Dublin)',
    dpa: 'signed',
  },
  {
    id: 'brightpay',
    vendor: 'Brightpay',
    monogram: 'BP',
    purpose: 'Payment processing',
    region: 'US (San Francisco)',
    dpa: 'signed',
  },
  {
    id: 'answerdesk',
    vendor: 'Answerdesk',
    monogram: 'AD',
    purpose: 'Customer support tooling',
    region: 'EU (Amsterdam)',
    dpa: 'renewal',
  },
  {
    id: 'lexicon',
    vendor: 'Lexicon Search',
    monogram: 'LS',
    purpose: 'In-product search index',
    region: 'EU (Frankfurt)',
    dpa: 'signed',
  },
];

// ---- responsible disclosure ----

const SECURITY_TXT = [
  'Contact: mailto:security@vantagedata.io',
  'Encryption: https://vantagedata.io/pgp.txt',
  'Policy: https://vantagedata.io/security/disclosure',
  'Preferred-Languages: en, pt',
  'Expires: 2027-01-31T00:00:00Z',
].join('\\n');

const PGP_FINGERPRINT = '7A31 9C4E 02BD 55F1 8E60  4D2A C9F3 1B77 D480 62E5';

const DISCLOSURE = {
  title: 'Responsible disclosure',
  copy:
    'Found something? Tell us first — we triage every report within 24 ' +
    'hours and pay $250–$12,000 for qualifying findings. Anything under ' +
    '*.vantagedata.io is in scope except the marketing site; no social ' +
    'engineering, no customer data exfiltration.',
};

// ---- security changelog (last 3 updates) ----

interface ChangelogEntry {
  id: string;
  date: string;
  tag: string;
  tagColor: 'blue' | 'orange' | 'green';
  copy: string;
  link?: string;
}

const CHANGELOG: readonly ChangelogEntry[] = [
  {
    id: 'byok',
    date: 'Jun 27, 2026',
    tag: 'Improved',
    tagColor: 'blue',
    copy: 'Customer-managed keys (BYOK) are now available in eu-central-1 for Scale plans.',
  },
  {
    id: 'incident',
    date: 'Jun 3, 2026',
    tag: 'Incident',
    tagColor: 'orange',
    copy: '41 minutes of elevated error rates on the ingest API. No data loss; root cause was a connection-pool regression.',
    link: 'Read the postmortem',
  },
  {
    id: 'soc2',
    date: 'May 12, 2026',
    tag: 'Compliance',
    tagColor: 'green',
    copy: 'SOC 2 Type II report covering Nov 2024 – Oct 2025 is available under NDA — zero exceptions.',
  },
];

const FOOTER_LINKS: readonly string[] = [
  'Status',
  'Privacy',
  'Terms',
  'DPA',
  'security.txt',
];

// ============= HELPERS =============

/**
 * Element-size hook — the inline demo stage is ~1045px wide inside a
 * 1440px window, so viewport media queries never fire there. The page
 * measures itself (width for breakpoints, height for the pinned story).
 */
function useElementSize(ref: RefObject<HTMLDivElement | null>): {
  width: number;
  height: number;
} {
  const [size, setSize] = useState({width: 0, height: 0});
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setSize({width: rect.width, height: rect.height});
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/** prefers-reduced-motion gate: reveals render visible, counters final. */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefersReduced;
}

/** Fire-once IntersectionObserver reveal. Disabled → always revealed. */
function useRevealOnce(isDisabled: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isRevealed: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => {
    if (isDisabled || isRevealed) {
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isDisabled, isRevealed]);
  return {ref, isRevealed: isDisabled ? true : isRevealed};
}

/**
 * Reveal wrapper: rise 16px + 0.985 scale settle on a decelerate bezier,
 * staggered by \`delay\`; renders visible when motion is off.
 */
function Reveal({
  isMotionOff,
  delay = 0,
  children,
}: {
  isMotionOff: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  const {ref, isRevealed} = useRevealOnce(isMotionOff);
  return (
    <div
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'none' : 'translateY(16px) scale(0.985)',
        transition: isMotionOff
          ? 'none'
          : \`opacity 0.56s cubic-bezier(0.16, 1, 0.3, 1) \${delay}ms, transform 0.56s cubic-bezier(0.16, 1, 0.3, 1) \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

/** rAF count-up toward a fixed target; motion-off renders the final value. */
function useCountUp(
  target: number,
  isStarted: boolean,
  isMotionOff: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isStarted) {
      return undefined;
    }
    if (isMotionOff) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isStarted, isMotionOff, durationMs]);
  return value;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to receive the document.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

// ============= SMALL PIECES =============

/** Vantage brand mark: soft accent shield tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        <Text type="supporting" color="secondary">
          {BRAND.suffix}
        </Text>
      </VStack>
    </HStack>
  );
}

/**
 * Aurora field: 2-3 radial-gradient blobs (accent + success mixes),
 * heavily blurred, drifting on 34-44s transform keyframes. Static when
 * motion is off; always pointer-transparent and clipped by its wrapper.
 */
function AuroraField({
  isMotionOff,
  variant,
}: {
  isMotionOff: boolean;
  variant: 'hero' | 'band';
}) {
  const blobA: CSSProperties = {
    ...styles.blob,
    width: variant === 'hero' ? 560 : 460,
    height: variant === 'hero' ? 460 : 380,
    top: variant === 'hero' ? -140 : -160,
    right: variant === 'hero' ? '-6%' : '4%',
    opacity: 0.5,
    background: \`radial-gradient(circle at 42% 42%, color-mix(in srgb, \${ACCENT} 52%, transparent), transparent 70%)\`,
    animation: isMotionOff ? undefined : 'stc-drift-a 38s ease-in-out infinite',
  };
  const blobB: CSSProperties = {
    ...styles.blob,
    width: 420,
    height: 360,
    bottom: variant === 'hero' ? -120 : -140,
    left: '-4%',
    opacity: 0.4,
    background: \`radial-gradient(circle at 55% 50%, color-mix(in srgb, \${SUCCESS} 42%, transparent), transparent 70%)\`,
    animation: isMotionOff ? undefined : 'stc-drift-b 44s ease-in-out infinite',
  };
  const blobC: CSSProperties = {
    ...styles.blob,
    width: 340,
    height: 300,
    top: '30%',
    left: '38%',
    opacity: 0.35,
    background: \`radial-gradient(circle at 50% 50%, color-mix(in srgb, \${ACCENT} 34%, var(--color-background-body)), transparent 72%)\`,
    animation:
      isMotionOff ? undefined : 'stc-drift-a 34s ease-in-out -12s infinite',
  };
  return (
    <div style={styles.atmoWrap} aria-hidden="true">
      <div className="stc-anim" style={blobA} />
      <div className="stc-anim" style={blobB} />
      {variant === 'hero' && <div className="stc-anim" style={blobC} />}
      {variant === 'hero' && <div style={styles.dotGrid} />}
      <div style={styles.grain} />
    </div>
  );
}

/** Schematic compliance seal: dashed audit ring + monogram disc. */
function Seal({short}: {short: string}) {
  return (
    <svg
      width={60}
      height={60}
      viewBox="0 0 60 60"
      role="img"
      aria-label={\`\${short} schematic seal\`}>
      <circle
        cx={30}
        cy={30}
        r={27}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />
      <circle
        cx={30}
        cy={30}
        r={20}
        fill={ACCENT_SOFT}
        stroke={ACCENT}
        strokeWidth={1}
      />
      <text
        x={30}
        y={33.5}
        textAnchor="middle"
        fontSize={short.length > 4 ? 8.5 : 10}
        fontWeight={700}
        letterSpacing="0.06em"
        fill={ACCENT}>
        {short}
      </text>
    </svg>
  );
}

/** Section header: uppercase accent eyebrow + display title + copy. */
function SectionHead({
  eyebrow,
  title,
  copy,
  isCompact,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  isCompact: boolean;
}) {
  return (
    <div style={styles.sectionHead}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isCompact ? styles.sectionTitleCompact : null),
        }}>
        {title}
      </h2>
      <Text type="supporting" color="secondary">
        {copy}
      </Text>
    </div>
  );
}

/** Counting stat used in the hero snapshot card (~900ms decelerate). */
function SnapshotStat({
  target,
  suffix,
  label,
  isStarted,
  isMotionOff,
}: {
  target: number;
  suffix: string;
  label: string;
  isStarted: boolean;
  isMotionOff: boolean;
}) {
  const value = useCountUp(target, isStarted, isMotionOff);
  return (
    <VStack gap={0}>
      <span style={styles.statValue}>
        {Math.round(value).toLocaleString('en-US')}
        {suffix}
      </span>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
    </VStack>
  );
}

// ============= DATA-FLOW SCHEMATIC =============

const NODE_W = 190;
const NODE_H = 118;

/** Small glyphs drawn per node (monitor / hex shield / lock). */
function nodeGlyphPath(id: FlowNodeId, x: number, y: number) {
  const cx = x + 26;
  const cy = y + 30;
  if (id === 'client') {
    return (
      <g stroke={ACCENT} strokeWidth={1.6} fill="none" strokeLinecap="round">
        <rect x={cx - 11} y={cy - 9} width={22} height={14} rx={2} />
        <line x1={cx - 5} y1={cy + 9} x2={cx + 5} y2={cy + 9} />
        <line x1={cx} y1={cy + 5} x2={cx} y2={cy + 9} />
      </g>
    );
  }
  if (id === 'edge') {
    return (
      <g stroke={ACCENT} strokeWidth={1.6} fill="none" strokeLinejoin="round">
        <path
          d={\`M \${cx} \${cy - 11} L \${cx + 10} \${cy - 5} L \${cx + 10} \${cy + 6} L \${cx} \${cy + 12} L \${cx - 10} \${cy + 6} L \${cx - 10} \${cy - 5} Z\`}
        />
        <path d={\`M \${cx - 4} \${cy} l 3 3 l 6 -7\`} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g stroke={ACCENT} strokeWidth={1.6} fill="none" strokeLinecap="round">
      <rect x={cx - 9} y={cy - 3} width={18} height={14} rx={2.5} />
      <path d={\`M \${cx - 5} \${cy - 3} v -4 a 5 5 0 0 1 10 0 v 4\`} />
    </g>
  );
}

/**
 * Client → edge → vault schematic on the scheme-locked dark glass card.
 * Horizontal at wide widths, vertical when stacked. Nodes are focusable
 * buttons: \`onActivate\` fires on click/Enter/Space (in the pinned story
 * it scroll-jumps to the node's scene), while \`onHover\` (static mode
 * only) live-swaps the detail panel on hover/focus. \`drawProgress\`
 * binds the two connector strokes to scroll progress via
 * pathLength/stroke-dashoffset — [1, 1] renders them fully drawn.
 */
function FlowDiagram({
  isVertical,
  activeId,
  drawProgress,
  onActivate,
  onHover,
}: {
  isVertical: boolean;
  activeId: FlowNodeId;
  drawProgress: readonly [number, number];
  onActivate: (id: FlowNodeId) => void;
  onHover?: (id: FlowNodeId) => void;
}) {
  const positions: Record<FlowNodeId, {x: number; y: number}> = isVertical
    ? {
        client: {x: 60, y: 12},
        edge: {x: 60, y: 206},
        vault: {x: 60, y: 400},
      }
    : {
        client: {x: 12, y: 36},
        edge: {x: 295, y: 36},
        vault: {x: 578, y: 36},
      };
  const viewBox = isVertical ? '0 0 320 530' : '0 0 780 190';

  const lineProps = (segment: 0 | 1) => ({
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - clamp01(drawProgress[segment]),
  });

  const arrows = isVertical ? (
    <g
      stroke={DARK_TEXT_FAINT}
      strokeWidth={1.4}
      fill="none"
      aria-hidden="true">
      <line
        x1={160}
        y1={132}
        x2={160}
        y2={198}
        markerEnd="url(#flow-arrow)"
        {...lineProps(0)}
      />
      <line
        x1={160}
        y1={326}
        x2={160}
        y2={392}
        markerEnd="url(#flow-arrow)"
        {...lineProps(1)}
      />
      <text x={172} y={168} fontSize={10} fill={DARK_TEXT_FAINT} stroke="none">
        TLS 1.3
      </text>
      <text x={172} y={356} fontSize={10} fill={DARK_TEXT_FAINT} stroke="none">
        mTLS · tenant-scoped
      </text>
    </g>
  ) : (
    <g
      stroke={DARK_TEXT_FAINT}
      strokeWidth={1.4}
      fill="none"
      aria-hidden="true">
      <line
        x1={204}
        y1={95}
        x2={289}
        y2={95}
        markerEnd="url(#flow-arrow)"
        {...lineProps(0)}
      />
      <line
        x1={487}
        y1={95}
        x2={572}
        y2={95}
        markerEnd="url(#flow-arrow)"
        {...lineProps(1)}
      />
      <text
        x={246}
        y={84}
        fontSize={10}
        textAnchor="middle"
        fill={DARK_TEXT_FAINT}
        stroke="none">
        TLS 1.3
      </text>
      <text
        x={529}
        y={78}
        fontSize={10}
        textAnchor="middle"
        fill={DARK_TEXT_FAINT}
        stroke="none">
        mTLS
      </text>
      <text
        x={529}
        y={90}
        fontSize={10}
        textAnchor="middle"
        fill={DARK_TEXT_FAINT}
        stroke="none">
        tenant-scoped
      </text>
    </g>
  );

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      role="group"
      aria-label="Data flow: client to edge to vault"
      style={{display: 'block', maxWidth: isVertical ? 340 : 780}}>
      <defs>
        <marker
          id="flow-arrow"
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={7}
          markerHeight={7}
          orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={DARK_TEXT_FAINT} />
        </marker>
      </defs>
      {arrows}
      {FLOW_NODES.map(node => {
        const {x, y} = positions[node.id];
        const isActive = node.id === activeId;
        return (
          <g
            key={node.id}
            tabIndex={0}
            role="button"
            aria-pressed={isActive}
            aria-label={\`\${node.title}: \${node.subtitle}\`}
            style={{
              cursor: 'pointer',
              outline: 'none',
              opacity: isActive ? 1 : 0.72,
              transition: 'opacity 0.3s ease',
            }}
            onMouseEnter={onHover == null ? undefined : () => onHover(node.id)}
            onFocus={onHover == null ? undefined : () => onHover(node.id)}
            onClick={() => onActivate(node.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivate(node.id);
              }
            }}>
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={14}
              fill={isActive ? 'rgba(94, 234, 212, 0.12)' : GLASS_BG}
              stroke={isActive ? ACCENT : GLASS_STROKE}
              strokeWidth={isActive ? 2 : 1}
            />
            {nodeGlyphPath(node.id, x, y)}
            <text
              x={x + 52}
              y={y + 30}
              fontSize={14}
              fontWeight={700}
              fill={DARK_TEXT}>
              {node.title}
            </text>
            <text x={x + 52} y={y + 46} fontSize={10.5} fill={DARK_TEXT_FAINT}>
              {node.subtitle}
            </text>
            <text
              x={x + 16}
              y={y + 78}
              fontSize={9.5}
              fontFamily="var(--font-family-mono, ui-monospace, monospace)"
              fill={DARK_TEXT_SOFT}>
              {node.chips[0]}
            </text>
            <text
              x={x + 16}
              y={y + 94}
              fontSize={9.5}
              fontFamily="var(--font-family-mono, ui-monospace, monospace)"
              fill={DARK_TEXT_SOFT}>
              {node.chips[2]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============= PAGE =============

export default function SecurityTrustCenterTemplate() {
  // ---- responsive: measure the page itself (demo-stage quirk) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const {width: wrapWidth, height: wrapHeight} = useElementSize(wrapRef);
  const isMid = wrapWidth > 0 && wrapWidth <= 980;
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isTableCards = wrapWidth > 0 && wrapWidth <= 640;
  const isPhone = wrapWidth > 0 && wrapWidth <= 540;

  const isMotionOff = usePrefersReducedMotion();

  // Display type tiers by measured width (78 → 64 → 54 → 40).
  const heroFontSize = isPhone ? 40 : isStacked ? 54 : isMid ? 64 : 78;

  // ---- scroll plumbing ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- pinned architecture story ----
  const storyRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [activeFlowNode, setActiveFlowNode] = useState<FlowNodeId>('client');
  const isStoryPinned = !isMotionOff && !isStacked && wrapHeight > 420;
  const storyHeight = Math.round(Math.max(1400, wrapHeight * 2.4));

  // One passive, rAF-throttled scroll listener drives the condensing
  // navbar and the story progress (which in turn advances the active
  // node and the connector draw).
  useEffect(() => {
    const pageEl = pageRef.current;
    if (pageEl == null) {
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsScrolled(pageEl.scrollTop > 24);
      const story = storyRef.current;
      if (story != null) {
        const pageRect = pageEl.getBoundingClientRect();
        const rect = story.getBoundingClientRect();
        const range = rect.height - pageEl.clientHeight;
        if (range > 60) {
          const progress = clamp01((pageRect.top - rect.top) / range);
          setStoryProgress(progress);
          setActiveFlowNode(
            progress < 1 / 3 ? 'client' : progress < 2 / 3 ? 'edge' : 'vault',
          );
        }
      }
    };
    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };
    pageEl.addEventListener('scroll', onScroll, {passive: true});
    update();
    return () => {
      pageEl.removeEventListener('scroll', onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [isStoryPinned]);

  // ---- hero: snapshot reveal starts the tick stagger + count-ups ----
  const {ref: snapshotRef, isRevealed: isSnapshotRevealed} =
    useRevealOnce(isMotionOff);
  const uptimeValue = useCountUp(
    HERO.uptimePercent,
    isSnapshotRevealed,
    isMotionOff,
    1100,
  );

  // Hero pointer parallax: transient values live on CSS vars (no
  // re-render); satellites and the snapshot card read them with
  // opposing multipliers. Off under reduced motion and at touch widths.
  const theaterRef = useRef<HTMLDivElement | null>(null);
  const onHeroPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isMotionOff || isStacked) {
      return;
    }
    const theater = theaterRef.current;
    if (theater == null) {
      return;
    }
    const rect = theater.getBoundingClientRect();
    const px = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
    const py = clamp01((event.clientY - rect.top) / rect.height) * 2 - 1;
    theater.style.setProperty('--px', px.toFixed(3));
    theater.style.setProperty('--py', py.toFixed(3));
  };
  const onHeroPointerLeave = () => {
    const theater = theaterRef.current;
    if (theater != null) {
      theater.style.setProperty('--px', '0');
      theater.style.setProperty('--py', '0');
    }
  };

  // Dark-stage pointer spotlight (--mx/--my consumed by the overlay).
  const onStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isMotionOff) {
      return;
    }
    const stage = stageRef.current;
    if (stage == null) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty(
      '--mx',
      \`\${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%\`,
    );
    stage.style.setProperty(
      '--my',
      \`\${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%\`,
    );
  };

  // ---- compliance request-access forms (one open at a time) ----
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, string>>({});

  // ---- disclosure: PGP copy feedback ----
  const [isFingerprintCopied, setIsFingerprintCopied] = useState(false);
  useEffect(() => {
    if (!isFingerprintCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsFingerprintCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isFingerprintCopied]);

  // ---- toast (replaced/keyed so repeat clicks re-announce) ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // Compact menu dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar.
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
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
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMenuOpen]);

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const scrollWithin = (top: number) => {
    pageRef.current?.scrollTo({
      top,
      behavior: isMotionOff ? 'auto' : 'smooth',
    });
  };

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    scrollWithin(section.offsetTop - NAV_ALLOWANCE);
  };

  /** Practices rail: jump a category block under the sticky nav. */
  const jumpToCategory = (id: string) => {
    const container = pageRef.current;
    const target = categoryRefs.current[id];
    if (container == null || target == null) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    scrollWithin(
      container.scrollTop + (targetRect.top - containerRect.top) -
        NAV_ALLOWANCE -
        12,
    );
  };

  /**
   * Story steps: in pinned mode a step (or node) click scroll-jumps to
   * that scene's slice of the tall container; in static mode it simply
   * selects the node.
   */
  const jumpToStoryStep = (index: number) => {
    const container = pageRef.current;
    const story = storyRef.current;
    if (!isStoryPinned || container == null || story == null) {
      setActiveFlowNode(FLOW_NODES[index].id);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const rect = story.getBoundingClientRect();
    const range = Math.max(0, rect.height - container.clientHeight);
    const storyTop = container.scrollTop + (rect.top - containerRect.top);
    const fractions = [0.06, 0.5, 0.94];
    scrollWithin(storyTop + fractions[index] * range);
  };

  const openRequestForm = (frameworkId: string) => {
    setOpenRequestId(previous =>
      previous === frameworkId ? null : frameworkId,
    );
    setRequestEmail('');
    setRequestError(null);
  };

  const submitRequest = (framework: Framework) => {
    const error = validateEmail(requestEmail);
    if (error !== null) {
      setRequestError(error);
      return;
    }
    const trimmed = requestEmail.trim();
    setSentRequests(previous => ({...previous, [framework.id]: trimmed}));
    setOpenRequestId(null);
    setRequestEmail('');
    setRequestError(null);
    fireToast(\`\${framework.artifact} — request sent for \${trimmed}.\`);
  };

  const copyFingerprint = () => {
    void navigator.clipboard?.writeText(PGP_FINGERPRINT).catch(() => {});
    setIsFingerprintCopied(true);
  };

  const heroCtaToCompliance = () => {
    setOpenRequestId('soc2');
    setRequestEmail('');
    setRequestError(null);
    jumpToSection('compliance');
  };

  const uptimeSummary =
    '90-day uptime history: 88 days operational, 1 scheduled maintenance window (May 14), 1 degraded day (Jun 3).';

  // ============= NAVBAR =============

  const navLinks = NAV_ANCHORS.map(anchor => (
    <button
      key={anchor.id}
      type="button"
      style={styles.navLink}
      onClick={() => jumpToSection(anchor.id)}>
      {anchor.label}
    </button>
  ));

  const requestReportsCta = (
    <span className="stc-cta">
      <Button
        label="Request reports"
        variant="primary"
        size="sm"
        icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
        onClick={heroCtaToCompliance}
      />
    </span>
  );

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Trust center">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCompact && (
          <>
            {navLinks}
            {requestReportsCta}
          </>
        )}
        {isNavCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.iconButton}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isNavCompact && isMenuOpen && (
          <div style={styles.menuPanel} role="menu" aria-label="Sections">
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                role="menuitem"
                style={styles.menuLink}
                onClick={() => jumpToSection(anchor.id)}>
                <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                {anchor.label}
              </button>
            ))}
            <Divider />
            <Button
              label="Request reports"
              variant="primary"
              size="sm"
              icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
              onClick={heroCtaToCompliance}
            />
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const [headlineLede, headlineKey] = HERO.headline.split(', ');

  const statusRow = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <span style={styles.statusChip}>
        <StatusDot
          variant="success"
          label="All systems operational"
          isPulsing={!isMotionOff}
        />
        All systems operational
      </span>
      <span style={{...styles.statusChip, fontVariantNumeric: 'tabular-nums'}}>
        <Icon icon={ActivityIcon} size="xsm" color="inherit" />
        {uptimeValue.toFixed(2)}% uptime (90d)
      </span>
      <Token
        label={BRAND.statusHost}
        size="md"
        icon={<Icon icon={ExternalLinkIcon} size="xsm" color="inherit" />}
        onClick={() => fireToast(\`Status page — \${BRAND.statusHost} opened.\`)}
      />
    </HStack>
  );

  const tickStrip = (
    <VStack gap={2}>
      <div style={styles.tickStrip} role="img" aria-label={uptimeSummary}>
        {UPTIME_DAYS.map((day, index) => (
          <span
            key={day.iso}
            title={\`\${day.iso} — \${day.note}\`}
            style={{
              ...styles.tick,
              backgroundColor: TICK_COLOR[day.status],
              opacity: day.status === 'operational' ? 0.75 : 1,
              transform: isSnapshotRevealed ? 'scaleY(1)' : 'scaleY(0.06)',
              transition: isMotionOff
                ? 'none'
                : \`transform 0.4s ease \${index * 8}ms\`,
            }}
          />
        ))}
      </div>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: SUCCESS}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Operational
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: WARNING}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Maintenance · May 14
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: ERROR}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Degraded 41 min · Jun 3
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );

  // Parallax multipliers: satellites drift toward the pointer, the
  // snapshot card counters slightly. Values are CSS-var driven so
  // pointer moves never re-render React.
  const parallax = (mx: number, my: number): CSSProperties =>
    isMotionOff || isStacked
      ? {}
      : {
          ...styles.theaterParallax,
          transform: \`translate3d(calc(var(--px, 0) * \${mx}px), calc(var(--py, 0) * \${my}px), 0)\`,
        };

  const satellites = !isStacked && (
    <>
      <div
        style={{...styles.satellite, top: -20, right: -14, ...parallax(9, 7)}}>
        <div
          className="stc-anim"
          style={{
            ...styles.satCard,
            animation: isMotionOff
              ? undefined
              : 'stc-bob 7s ease-in-out -2.4s infinite',
          }}>
          <StatusDot variant="success" label="Zero audit exceptions" />
          <div>
            <div style={styles.satTitle}>0 exceptions</div>
            <div style={styles.satCaption}>SOC 2 Type II · FY25</div>
          </div>
        </div>
      </div>
      <div
        style={{
          ...styles.satellite,
          bottom: 96,
          left: -30,
          ...parallax(7, 9),
        }}>
        <div
          className="stc-anim"
          style={{
            ...styles.satCard,
            animation: isMotionOff
              ? undefined
              : 'stc-bob 8.5s ease-in-out -5s infinite',
          }}>
          <span style={styles.satDisc} aria-hidden="true">
            <Icon icon={MailCheckIcon} size="xsm" color="inherit" />
          </span>
          <div>
            <div style={styles.satTitle}>Report sent</div>
            <div style={styles.satCaption}>Secure link · 1 business day</div>
          </div>
        </div>
      </div>
      <div
        style={{
          ...styles.satellite,
          bottom: -26,
          right: 26,
          ...parallax(6, 8),
        }}>
        <div
          className="stc-anim"
          style={{
            ...styles.satCard,
            animation: isMotionOff
              ? undefined
              : 'stc-bob 6.5s ease-in-out -1.2s infinite',
          }}>
          <span style={{display: 'flex'}} aria-hidden="true">
            <span style={styles.auditorDisc}>MA</span>
            <span style={{...styles.auditorDisc, marginLeft: -7}}>NC</span>
            <span style={{...styles.auditorDisc, marginLeft: -7}}>VD</span>
          </span>
          <div>
            <div style={styles.satTitle}>3 audit firms</div>
            <div style={styles.satCaption}>Re-certified annually</div>
          </div>
        </div>
      </div>
    </>
  );

  const hero = (
    <section
      style={styles.heroSection}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      <AuroraField isMotionOff={isMotionOff} variant="hero" />
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
          paddingBlock: isPhone ? '48px 72px' : '72px 128px',
        }}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <span style={styles.eyebrowChip}>
              <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
              {HERO.eyebrow}
            </span>
            <h1 style={{...styles.heroHeadline, fontSize: heroFontSize}}>
              {headlineLede},{' '}
              <span style={styles.gradientInk}>{headlineKey}</span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            {statusRow}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <span className="stc-cta">
                <Button
                  label="Request reports"
                  variant="primary"
                  icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
                  onClick={heroCtaToCompliance}
                />
              </span>
              <Button
                label="Contact security"
                variant="secondary"
                icon={<Icon icon={BugIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('disclosure')}
              />
            </HStack>
          </div>
          <div
            ref={theaterRef}
            style={{
              ...styles.theater,
              // The staged card deliberately crosses the section
              // boundary into the tinted compliance band below.
              marginBottom: isStacked ? 0 : -72,
            }}>
            <div ref={snapshotRef} style={parallax(-5, -4)}>
              <div
                style={{
                  ...styles.snapshotCard,
                  transform:
                    isMotionOff || isStacked
                      ? undefined
                      : 'rotateX(1.5deg) rotateY(-2.5deg)',
                }}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="label">Last 90 days</Text>
                  </StackItem>
                  <Text type="supporting" color="secondary">
                    Apr 14 – Jul 12, 2026
                  </Text>
                </HStack>
                {tickStrip}
                <Divider />
                <HStack gap={4} vAlign="start" wrap="wrap">
                  {SNAPSHOT_STATS.map(stat => (
                    <SnapshotStat
                      key={stat.id}
                      target={stat.target}
                      suffix={stat.suffix}
                      label={stat.label}
                      isStarted={isSnapshotRevealed}
                      isMotionOff={isMotionOff}
                    />
                  ))}
                </HStack>
              </div>
            </div>
            {satellites}
          </div>
        </div>
      </div>
    </section>
  );

  // ============= COMPLIANCE =============

  const complianceColumns = isPhone ? 1 : isMid ? 2 : 4;

  const compliance = (
    <section ref={registerSection('compliance')} style={styles.bandTinted}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
          ...(isStacked ? null : {paddingTop: 128}),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Compliance"
            title="Audited by people we can't influence"
            copy="Reports and certificates are shared under NDA. Request one and a secure link arrives from our compliance desk within one business day."
            isCompact={isPhone}
          />
        </Reveal>
        <div
          style={{
            ...styles.complianceGrid,
            gridTemplateColumns: \`repeat(\${complianceColumns}, minmax(0, 1fr))\`,
          }}>
          {FRAMEWORKS.map((framework, index) => {
            const sentEmail = sentRequests[framework.id];
            const isFormOpen = openRequestId === framework.id;
            return (
              <div
                key={framework.id}
                style={{
                  // Alternate columns sit 36px lower at 4-up so the
                  // wall reads as a staggered rhythm, not a flat grid.
                  marginTop: !isMid && index % 2 === 1 ? 36 : 0,
                }}>
                <Reveal isMotionOff={isMotionOff} delay={index * 80}>
                  <div className="stc-card" style={styles.complianceCard}>
                    <HStack gap={3} vAlign="center">
                      <Seal short={framework.seal} />
                      <VStack gap={1}>
                        <Text type="label">{framework.name}</Text>
                        <Token
                          label={framework.chipLabel}
                          size="sm"
                          color="green"
                          icon={
                            <Icon
                              icon={FileTextIcon}
                              size="xsm"
                              color="inherit"
                            />
                          }
                          onClick={() => openRequestForm(framework.id)}
                        />
                      </VStack>
                    </HStack>
                    <Text type="supporting" color="secondary">
                      {framework.blurb}
                    </Text>
                    {sentEmail != null ? (
                      <HStack gap={2} vAlign="center">
                        <div style={styles.successDisc} aria-hidden="true">
                          <Icon
                            icon={MailCheckIcon}
                            size="sm"
                            color="inherit"
                          />
                        </div>
                        <StackItem size="fill">
                          <Text type="supporting" color="secondary">
                            Request sent — secure link to {sentEmail} within 1
                            business day.
                          </Text>
                        </StackItem>
                      </HStack>
                    ) : isFormOpen ? (
                      <VStack gap={1}>
                        <div
                          style={{
                            ...styles.requestForm,
                            ...(isPhone ? styles.requestFormStacked : null),
                          }}>
                          <div style={styles.requestInput}>
                            <TextInput
                              label={\`Email for the \${framework.artifact}\`}
                              isLabelHidden
                              placeholder="you@company.com"
                              value={requestEmail}
                              onChange={value => {
                                setRequestEmail(value);
                                setRequestError(null);
                              }}
                            />
                          </div>
                          <Button
                            label="Send request"
                            variant="primary"
                            icon={
                              <Icon icon={SendIcon} size="sm" color="inherit" />
                            }
                            onClick={() => submitRequest(framework)}
                          />
                        </div>
                        {requestError !== null && (
                          <p style={styles.errorText}>{requestError}</p>
                        )}
                      </VStack>
                    ) : (
                      <div>
                        <Button
                          label="Request access"
                          variant="ghost"
                          size="sm"
                          icon={
                            <Icon
                              icon={ArrowRightIcon}
                              size="sm"
                              color="inherit"
                            />
                          }
                          onClick={() => openRequestForm(framework.id)}
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // ============= PRACTICES =============

  const practices = (
    <section ref={registerSection('practices')}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <div
          style={{
            ...styles.practicesRow,
            ...(isMid ? styles.practicesRowStacked : null),
          }}>
          <div
            style={{
              ...styles.practicesRail,
              ...(isMid ? styles.practicesRailStacked : null),
            }}>
            <Reveal isMotionOff={isMotionOff}>
              <VStack gap={3}>
                <span
                  style={{
                    ...styles.bigNumeral,
                    ...(isMid ? styles.bigNumeralCompact : null),
                  }}
                  aria-hidden="true">
                  12
                </span>
                <SectionHead
                  eyebrow="Security practices"
                  title="Twelve controls, in plain language"
                  copy="No 'bank-grade security' hand-waving. These are the controls we actually run, with the numbers our auditors verify."
                  isCompact={isPhone}
                />
                <VStack gap={1}>
                  {PRACTICE_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      style={styles.railJump}
                      onClick={() => jumpToCategory(category.id)}>
                      <span
                        style={{...styles.categoryGlyph, width: 26, height: 26}}
                        aria-hidden="true">
                        <Icon icon={category.icon} size="xsm" color="inherit" />
                      </span>
                      <span style={{flex: '1 1 auto'}}>{category.name}</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                        {category.rows.length} controls
                      </span>
                    </button>
                  ))}
                </VStack>
              </VStack>
            </Reveal>
          </div>
          <div style={styles.practicesCol}>
            {PRACTICE_CATEGORIES.map((category, categoryIndex) => (
              <Reveal
                key={category.id}
                isMotionOff={isMotionOff}
                delay={categoryIndex * 80}>
                <div
                  ref={node => {
                    categoryRefs.current[category.id] = node;
                  }}
                  style={styles.categoryBlock}>
                  <HStack gap={2} vAlign="center">
                    <div style={styles.categoryGlyph} aria-hidden="true">
                      <Icon icon={category.icon} size="sm" color="inherit" />
                    </div>
                    <StackItem size="fill">
                      <Text type="label">{category.name}</Text>
                    </StackItem>
                    <Text type="supporting" color="secondary">
                      {category.rows.length} controls
                    </Text>
                  </HStack>
                  <VStack gap={2}>
                    {category.rows.map((practice, rowIndex) => (
                      <div
                        key={practice.id}
                        className="stc-card"
                        style={styles.practiceCard}>
                        <Collapsible
                          trigger={
                            <Text size="sm" weight="semibold">
                              {practice.title}
                            </Text>
                          }
                          defaultIsOpen={categoryIndex === 0 && rowIndex === 0}>
                          <Text type="supporting" color="secondary">
                            {practice.copy}
                          </Text>
                        </Collapsible>
                      </div>
                    ))}
                  </VStack>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // ============= ARCHITECTURE (dark pinned scroll story) =============

  const activeNode =
    FLOW_NODES.find(node => node.id === activeFlowNode) ?? FLOW_NODES[0];
  const activeNodeIndex = FLOW_NODES.findIndex(
    node => node.id === activeFlowNode,
  );

  // Connector strokes draw with scroll progress in pinned mode; the
  // static sequence renders them complete.
  const connectorDraw: readonly [number, number] = isStoryPinned
    ? [
        clamp01((storyProgress - 0.1) / 0.24),
        clamp01((storyProgress - 0.44) / 0.24),
      ]
    : [1, 1];

  const stepFill = (index: number): number =>
    isStoryPinned
      ? clamp01((storyProgress - index / 3) * 3)
      : index <= activeNodeIndex
        ? 1
        : 0;

  const stageContent = (
    <div
      style={{
        ...styles.column,
        ...(isPhone ? styles.columnCompact : null),
        paddingBlock: isPhone ? 48 : 64,
        gap: 'var(--spacing-5)',
        zIndex: 1,
      }}>
      <div style={styles.sectionHead}>
        <span style={styles.darkEyebrow}>Architecture</span>
        <h2
          style={{
            ...styles.darkTitle,
            ...(isPhone ? styles.darkTitleCompact : null),
          }}>
          Where your data actually goes
        </h2>
        <p style={styles.darkCopy}>
          Three tiers, two encrypted hops, zero public paths to storage.
          {isStoryPinned
            ? ' Keep scrolling — or jump a step — to follow one record in.'
            : ' Select a node for the details.'}
        </p>
      </div>
      <div style={styles.stepRail} role="group" aria-label="Data flow steps">
        {FLOW_NODES.map((node, index) => {
          const isActiveStep = node.id === activeFlowNode;
          return (
            <button
              key={node.id}
              type="button"
              aria-pressed={isActiveStep}
              style={{
                ...styles.stepBtn,
                ...(isActiveStep
                  ? {boxShadow: \`inset 0 0 0 1px \${ACCENT}\`}
                  : null),
              }}
              onClick={() => jumpToStoryStep(index)}>
              <span style={styles.stepIndex}>0{index + 1}</span>
              <span
                style={{
                  ...styles.stepTitle,
                  color: isActiveStep ? DARK_TEXT : DARK_TEXT_SOFT,
                }}>
                {node.title}
              </span>
              <span style={{fontSize: 11, color: DARK_TEXT_FAINT}}>
                {node.subtitle}
              </span>
              <span style={styles.stepBarTrack} aria-hidden="true">
                <span
                  style={{
                    ...styles.stepBarFill,
                    transform: \`scaleX(\${stepFill(index)})\`,
                    transition: isStoryPinned ? 'none' : 'transform 0.3s ease',
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
      <div style={styles.flowCard}>
        <FlowDiagram
          isVertical={isStacked}
          activeId={activeFlowNode}
          drawProgress={connectorDraw}
          onActivate={id =>
            jumpToStoryStep(FLOW_NODES.findIndex(node => node.id === id))
          }
          onHover={isStoryPinned ? undefined : setActiveFlowNode}
        />
        <div style={styles.flowDetail} aria-live="polite">
          <HStack gap={2} vAlign="center" wrap="wrap">
            <span style={styles.flowDetailTitle}>{activeNode.title}</span>
            <span style={styles.flowDetailSub}>{activeNode.subtitle}</span>
          </HStack>
          <p style={styles.flowDetailCopy}>{activeNode.detail}</p>
          <HStack gap={1} vAlign="center" wrap="wrap">
            {activeNode.chips.map(chip => (
              <Token key={chip} label={chip} size="sm" color="teal" />
            ))}
          </HStack>
        </div>
      </div>
    </div>
  );

  const stageAtmosphere = (
    <>
      <div
        className="stc-anim"
        style={{
          ...styles.stageGlowA,
          animation: isMotionOff
            ? undefined
            : 'stc-drift-a 40s ease-in-out infinite',
        }}
        aria-hidden="true"
      />
      <div
        className="stc-anim"
        style={{
          ...styles.stageGlowB,
          animation: isMotionOff
            ? undefined
            : 'stc-drift-b 46s ease-in-out infinite',
        }}
        aria-hidden="true"
      />
      <div style={styles.hairlineGrid} aria-hidden="true" />
      <div style={styles.grain} aria-hidden="true" />
      <div style={styles.spotlight} aria-hidden="true" />
    </>
  );

  const architecture = (
    <section ref={registerSection('architecture')} style={styles.archBand}>
      {isStoryPinned ? (
        <div ref={storyRef} style={{height: storyHeight}}>
          <div
            ref={stageRef}
            style={{
              ...styles.archStage,
              minHeight: Math.max(540, wrapHeight),
            }}
            onPointerMove={onStagePointerMove}>
            {stageAtmosphere}
            {stageContent}
          </div>
        </div>
      ) : (
        <div
          ref={stageRef}
          style={{position: 'relative', overflow: 'hidden'}}
          onPointerMove={onStagePointerMove}>
          {stageAtmosphere}
          {stageContent}
        </div>
      )}
    </section>
  );

  // ============= SUBPROCESSORS =============

  const dpaChip = (row: Subprocessor) =>
    row.dpa === 'signed' ? (
      <Token label="DPA signed" size="sm" color="green" />
    ) : (
      <Token label="Renewal Aug 2026" size="sm" color="yellow" />
    );

  const subprocessorColumns: TableColumn<Subprocessor>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      width: proportional(1.3, {minWidth: 170}),
      renderCell: row => (
        <HStack gap={2} vAlign="center">
          <span style={styles.vendorTile} aria-hidden="true">
            {row.monogram}
          </span>
          <Text size="sm" weight="semibold">
            {row.vendor}
          </Text>
        </HStack>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      width: proportional(1.6, {minWidth: 180}),
      renderCell: row => (
        <Text type="supporting" color="secondary">
          {row.purpose}
        </Text>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      width: proportional(1.4, {minWidth: 170}),
      renderCell: row => (
        <Text type="supporting" color="secondary">
          {row.region}
        </Text>
      ),
    },
    {
      key: 'dpa',
      header: 'DPA',
      width: pixel(150),
      renderCell: row => dpaChip(row),
    },
  ];

  const subprocessors = (
    <section ref={registerSection('subprocessors')}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Subprocessors"
            title="Everyone who touches your data"
            copy="Six vendors, each behind a signed DPA and an annual security review. We announce additions 30 days before they process anything."
            isCompact={isPhone}
          />
        </Reveal>
        <Reveal isMotionOff={isMotionOff} delay={120}>
          {isTableCards ? (
            <VStack gap={2}>
              {SUBPROCESSORS.map(row => (
                <div key={row.id} style={styles.vendorCard}>
                  <HStack gap={2} vAlign="center">
                    <span style={styles.vendorTile} aria-hidden="true">
                      {row.monogram}
                    </span>
                    <StackItem size="fill">
                      <Text size="sm" weight="semibold">
                        {row.vendor}
                      </Text>
                    </StackItem>
                    {dpaChip(row)}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {row.purpose} · {row.region}
                  </Text>
                </div>
              ))}
            </VStack>
          ) : (
            <div style={styles.tableFrame}>
              <Table<Subprocessor>
                data={[...SUBPROCESSORS]}
                columns={subprocessorColumns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
              />
            </div>
          )}
        </Reveal>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="supporting" color="secondary">
            Last updated Jul 1, 2026
          </Text>
          <Token
            label="Subscribe to subprocessor changes"
            size="sm"
            icon={<Icon icon={MailCheckIcon} size="xsm" color="inherit" />}
            onClick={() =>
              fireToast('Subprocessor list — change notifications subscribed.')
            }
          />
        </HStack>
      </div>
    </section>
  );

  // ============= DISCLOSURE + CHANGELOG =============

  const disclosure = (
    <section ref={registerSection('disclosure')} style={styles.bandTinted}>
      <AuroraField isMotionOff={isMotionOff} variant="band" />
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Disclosure & updates"
            title="Tell us before you tell anyone"
            copy="Our disclosure program pays researchers, and this strip logs every security-relevant change we ship."
            isCompact={isPhone}
          />
        </Reveal>
        <div
          style={{
            ...styles.duoRow,
            ...(isStacked ? styles.duoRowStacked : null),
          }}>
          <Reveal isMotionOff={isMotionOff} delay={80}>
            <div style={styles.disclosureCard}>
              <HStack gap={2} vAlign="center">
                <div style={styles.categoryGlyph} aria-hidden="true">
                  <Icon icon={BugIcon} size="sm" color="inherit" />
                </div>
                <Text type="label">{DISCLOSURE.title}</Text>
              </HStack>
              <Text type="supporting" color="secondary">
                {DISCLOSURE.copy}
              </Text>
              <HStack gap={1} vAlign="center" wrap="wrap">
                <Token label="24 h triage" size="sm" color="teal" />
                <Token label="$250–$12,000 bounty" size="sm" color="teal" />
                <Token label="Safe harbor" size="sm" color="teal" />
              </HStack>
              <CodeBlock
                code={SECURITY_TXT}
                language="text"
                title="/.well-known/security.txt"
                width="100%"
                size="sm"
                hasCopyButton
                onCopy={() => fireToast('security.txt copied to clipboard.')}
              />
              <div style={styles.fingerprintRow}>
                <Icon icon={KeyRoundIcon} size="xsm" color="secondary" />
                <StackItem size="fill">
                  <span style={styles.mono}>PGP {PGP_FINGERPRINT}</span>
                </StackItem>
                <button
                  type="button"
                  aria-label={
                    isFingerprintCopied
                      ? 'PGP fingerprint copied'
                      : 'Copy PGP fingerprint'
                  }
                  style={{...styles.iconButton, width: 32, height: 32}}
                  onClick={copyFingerprint}>
                  <Icon
                    icon={isFingerprintCopied ? CheckIcon : CopyIcon}
                    size="xsm"
                    color="inherit"
                  />
                </button>
              </div>
              {isFingerprintCopied && (
                <Text type="supporting" color="secondary">
                  Fingerprint copied.
                </Text>
              )}
            </div>
          </Reveal>
          <Reveal isMotionOff={isMotionOff} delay={160}>
            <div style={styles.changelogCol}>
              <Text type="label">Latest security updates</Text>
              {CHANGELOG.map(entry => (
                <div
                  key={entry.id}
                  className="stc-card"
                  style={styles.changelogEntry}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Token label={entry.tag} size="sm" color={entry.tagColor} />
                    <Text type="supporting" color="secondary">
                      {entry.date}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {entry.copy}
                  </Text>
                  {entry.link != null && (
                    <div>
                      <Button
                        label={entry.link}
                        variant="ghost"
                        size="sm"
                        icon={
                          <Icon
                            icon={ExternalLinkIcon}
                            size="sm"
                            color="inherit"
                          />
                        }
                        onClick={() =>
                          fireToast('Postmortem — Jun 3 ingest incident opened.')
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-4)',
        }}>
        <HStack gap={4} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <BrandMark />
          </StackItem>
          {FOOTER_LINKS.map(label => (
            <button
              key={label}
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast(\`Footer — \${label} opened.\`)}>
              {label}
            </button>
          ))}
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              © 2026 Vantage Data, Inc. · security@vantagedata.io
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary">
            Trust Center last reviewed Jul 1, 2026
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <style>{PAGE_CSS}</style>
        <div ref={wrapRef} style={{height: '100%'}}>
          <div ref={pageRef} style={styles.page}>
            {navbar}
            {hero}
            {compliance}
            {practices}
            {architecture}
            {subprocessors}
            {disclosure}
            {footer}
          </div>
          {toast !== null && (
            <div style={styles.toastWrap}>
              <Toast
                key={toast.key}
                type="info"
                isAutoHide
                autoHideDuration={5000}
                onDismiss={() => setToast(null)}
                body={<Text weight="semibold">{toast.message}</Text>}
              />
            </div>
          )}
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};