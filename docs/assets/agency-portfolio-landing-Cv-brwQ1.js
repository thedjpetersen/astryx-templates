var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file agency-portfolio-landing.tsx
 * @input Deterministic fixtures only (the fictional "Fathom & Co" product
 *   design studio: eight invented client monograms for the hero marquee,
 *   four case studies each with a gradient art composition, an outcome
 *   metric chip, and a full challenge/approach/results panel with a
 *   three-metric trio, three capability groups with sub-bullets, four
 *   process steps with week ranges and shipped-outcome bullets, three
 *   invented publication quotes, six team members, a three-number studio
 *   proof strip, and an availability card with budget/timeline Selector
 *   options for the inquiry form)
 * @output Awwwards-bar studio marketing page. A sticky navbar rides
 *   transparent over the hero, then condenses onto a tinted hairline
 *   surface after 24px of scroll (compact widths collapse links behind a
 *   menu button + dropdown). The hero is an 80px statement headline with
 *   gradient-ink emphasis over an aurora field (drifting color-mix blobs
 *   + SVG-grain texture), orbited by three floating satellite cards
 *   (award, outcome metric, pod avatars) that bob on independent
 *   keyframes and parallax toward the pointer; the signature client
 *   marquee loops beneath it (pauses on hover, static wrapped strip
 *   under reduced motion). Sections then alternate anatomy: an
 *   asymmetric two-column case grid whose offset cards raise and glow on
 *   hover, reveal a "View case" overlay, and expand an inline
 *   challenge/approach/results panel with a count-up metric trio; a
 *   studio proof strip whose stat cards straddle the boundary into the
 *   capabilities band; a dot-grid capabilities band with a sticky
 *   oversized-numeral intro rail; a pinned scroll story for the
 *   four-step process (600px sticky stage in a ~1560px container — scroll
 *   progress fills a clickable step rail and crossfades week-strip
 *   panels; static stacked sequence under reduced motion or compact
 *   widths); a scheme-locked dark press band with terracotta glows,
 *   glass quote cards, and a pointer-tracked spotlight; a team strip;
 *   and an availability card beside a validating project-inquiry form
 *   (budget Selector, timeline Selector, email) that flips to a success
 *   state. Reveals stagger 60-90ms with a 600ms decelerate rise; stat
 *   numbers roll on ~900ms tickers; everything is gated by
 *   prefers-reduced-motion.
 * @position Page template; emitted by \`astryx template
 *   agency-portfolio-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its
 * own chrome, so there is no LayoutHeader. LayoutContent (padding 0)
 * hosts a single scroll container div that owns scroll-spy, the navbar
 * condense flag, and the pinned-story progress; the navbar inside it is
 * position:sticky top:0. Sections sit in a centered 1120px column;
 * atmosphere bands (aurora hero, dot-grid capabilities, dark press)
 * paint full-bleed behind their columns, alternating with plain bands.
 * The whole page is wrapped in a measured div (ResizeObserver width +
 * height) because the inline demo stage is ~1045px wide and viewport
 * media queries only fire in the separate 390px phone iframe; the
 * measured height only gates the pinned story on/off (its container
 * and stage are fixed px — see STORY_STAGE_HEIGHT).
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll the container to real
 *   section ids with a sticky-nav allowance (rect-based, so positioned
 *   band wrappers can't skew the math); onScroll spies the last anchor
 *   above the fold line and highlights the matching link (aria-current).
 *   The compact menu closes on Escape (refocusing its trigger), outside
 *   pointerdown, or any selection.
 * - The hero marquee is the signature mechanic, kept and staged: a
 *   duplicated monogram strip translates -50% on a 44s linear loop over
 *   the aurora field, pauses on hover, and renders as a static wrapped
 *   strip under reduced motion. Satellites parallax ±8px toward the
 *   pointer over the hero (spring transition; off under reduced motion
 *   and at stacked widths).
 * - Case cards are real buttons: hover/focus fades in a "View case"
 *   overlay pill and raises the card a shadow tier with an accent
 *   border-glow; click expands the inline case panel below the grid
 *   (challenge / approach / results rows + a metric trio that counts up
 *   on open); clicking the open card or the panel's X collapses it.
 * - Pinned process story: scroll progress across the ~1560px container
 *   fills the step rail (scaleY — transform only) and advances four
 *   discrete week-strip panels; the numbered steps double as buttons
 *   that scroll to their segment. Reduced motion or stacked widths get
 *   a static 2-up sequence of the same step cards.
 * - The dark press band tracks the pointer with a radial spotlight fed
 *   by CSS vars (no re-render per move; skipped under reduced motion).
 * - Section blocks reveal once via IntersectionObserver (rise 16px +
 *   scale 0.985 → identity, 600ms decelerate bezier, children staggered
 *   60-90ms); stat chips and the proof strip count up on first view
 *   (~900ms decelerate). Under prefers-reduced-motion reveals render
 *   visible and every counter renders its final value.
 * - The inquiry form validates budget (required), timeline (required),
 *   and email (regex) with inline error text on submit, and success
 *   swaps the form for a confirmation card with a "Send another
 *   inquiry" reset. Footer links that would leave the page are no-ops.
 *
 * Color policy: token-pure with ONE quarantined accent literal (the
 * terracotta studio accent, declared once as light-dark() with contrast
 * math); every tint, glow, and aurora ink is a color-mix of that accent
 * with status tokens. Scheme-locked brand-art surfaces (client monogram
 * gradients, case-study art panels, and the dark press band's charcoal
 * ink family) carry literal gradients inside colorScheme:'dark' wrappers
 * so the invented brand art reads identically in both app themes. No
 * network images, no real logos.
 *
 * Responsive contract (element-width breakpoints on the page wrapper):
 * - >980px: 80px display type, satellites on, case columns offset,
 *   capabilities rail sticky, process pinned, press 3-up, team 6-up.
 * - <=940px: 62px display, satellites off, capabilities stack, team 3-up.
 * - <=880px: nav links collapse behind a 40px menu button + dropdown.
 * - <=700px: case columns, press row, proof strip, and the contact
 *   split stack; the process story renders its static sequence; footer
 *   columns stack; headline steps to 48px.
 * - <=480px: metric trio and process cards go single column, team 2-up,
 *   the budget/timeline selects stack, display type steps to 38px; the
 *   page holds at 390px in the phone artboard with no overflow-x.
 * - Tap targets: nav links, menu button, story steps, and case cards
 *   are generous; nothing requires hover (the overlay also shows on
 *   focus, and click always works without it).
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  AwardIcon,
  CheckIcon,
  CodeXmlIcon,
  CompassIcon,
  LightbulbIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PenToolIcon,
  QuoteIcon,
  SendIcon,
  TrendingUpIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * The ONE quarantined accent literal (terracotta — the studio's
 * personality). Contrast math: #9C4A26 on white body (#FFF, L 1.0):
 * L(#9C4A26)≈0.121 → (1.05)/(0.171) ≈ 6.1:1 (AA for normal text).
 * #F0946B on dark body (~#141414, L≈0.011): L(#F0946B)≈0.405 →
 * (0.455)/(0.061) ≈ 7.5:1 (AAA). Every tint below derives from this
 * pair via color-mix — no further color literals outside the
 * scheme-locked brand-art surfaces.
 */
const ACCENT = 'light-dark(#9C4A26, #F0946B)';
const ACCENT_SOFT = \`color-mix(in srgb, \${ACCENT} 11%, transparent)\`;
const ACCENT_BORDER = \`color-mix(in srgb, \${ACCENT} 34%, transparent)\`;

// Status inks are token-first with the house light-dark fallbacks.
const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const WARNING = 'var(--color-warning, light-dark(#B45309, #FCD34D))';
const ERROR = 'var(--color-error, light-dark(#B3261E, #F2B8B5))';

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

/**
 * Depth tiers (neutral black shadows only — hue never rides a shadow).
 * raised = default card lift; floating = adds a wide soft underlayer;
 * glass surfaces additionally carry an inset hairline stroke.
 */
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';

/** Colorless SVG feTurbulence grain tile (data URI, no network asset). */
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' ' +
  'width=\\'160\\' height=\\'160\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence ' +
  'type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' ' +
  'stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'160\\' ' +
  'height=\\'160\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E")';

/** Aurora blob inks — the accent mixed toward the status tokens. */
const AURORA_A = \`color-mix(in srgb, \${ACCENT} 52%, transparent)\`;
const AURORA_B = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 40%, \${WARNING}) 46%, transparent)\`;
const AURORA_C = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 55%, \${SUCCESS}) 40%, transparent)\`;

/** Sheen sweep on primary CTAs. */
const SHEEN = 'rgba(255, 255, 255, 0.35)';

// Scheme-locked dark-surface ink family (press band only) — the same
// sanctioned pattern as the client brand gradients below.
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(240, 234, 230, 0.82)';
const DARK_TEXT_FAINT = 'rgba(240, 234, 230, 0.58)';
const GLASS_BG = 'rgba(255, 255, 255, 0.07)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.16)';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 140;
/**
 * Pinned-story sizing in px — never vh, and never the measured wrapper
 * height: the inline demo renders this page in the top window, so
 * vh/100%-height chains resolve against the WINDOW, not the ~920px
 * stage, ballooning the pin container into thousands of px of empty
 * scroll. A fixed 600px sticky stage × 2.6 gives ~1560px of travel.
 */
const STORY_STAGE_HEIGHT = 600;
const STORY_CONTAINER_HEIGHT = Math.round(STORY_STAGE_HEIGHT * 2.6);
const TOTAL_WEEKS = 14;

const SCOPE = 'fac-root';

/**
 * Injected once per page: fac-prefixed keyframes (marquee loop, aurora
 * drift, satellite bob) plus the hover-only sheen/raise rules. Every
 * motion rule is scoped under .fac-root:not(.fac-reduced) or gated
 * inline, so reduced motion renders everything static; the marquee also
 * carries a belt-and-suspenders media query.
 */
const TEMPLATE_CSS = \`
@keyframes fac-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes fac-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(46px, -34px, 0) scale(1.1); }
}
@keyframes fac-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-38px, 28px, 0) scale(0.95); }
}
@keyframes fac-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
.\${SCOPE} .fac-marquee-track {
  display: flex;
  width: max-content;
  animation: fac-marquee 44s linear infinite;
}
.\${SCOPE} .fac-marquee:hover .fac-marquee-track {
  animation-play-state: paused;
}
.\${SCOPE}:not(.fac-reduced) .fac-drift-a {
  animation: fac-drift-a 38s ease-in-out infinite;
}
.\${SCOPE}:not(.fac-reduced) .fac-drift-b {
  animation: fac-drift-b 44s ease-in-out infinite;
}
.\${SCOPE}:not(.fac-reduced) .fac-bob {
  animation: fac-bob 7s ease-in-out infinite;
}
.fac-shine {
  position: relative;
  display: inline-flex;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.fac-shine::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, \${SHEEN} 50%, transparent 60%);
  transform: translateX(-130%) skewX(-14deg);
}
.\${SCOPE}:not(.fac-reduced) .fac-shine:hover { transform: translateY(-1px); }
.\${SCOPE}:not(.fac-reduced) .fac-shine:hover::after {
  transform: translateX(130%) skewX(-14deg);
  transition: transform 0.7s ease;
}
.\${SCOPE}:not(.fac-reduced) .fac-shine:active { transform: scale(0.98); }
.\${SCOPE}:not(.fac-reduced) .fac-case {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}
.\${SCOPE}:not(.fac-reduced) .fac-case:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING};
}
.\${SCOPE} .fac-case-overlay {
  opacity: 0;
  transition: opacity 0.22s ease;
}
.\${SCOPE} .fac-case:hover .fac-case-overlay,
.\${SCOPE} .fac-case:focus-visible .fac-case-overlay {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .fac-marquee-track { animation: none; }
  .\${SCOPE} .fac-case-overlay { transition: none; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy, nav condense, story progress.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered document column; atmosphere bands bleed outside it.
  column: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  // 96-128px section rhythm at wide widths, 56-72px compact.
  section: {
    paddingBlock: 104,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-7)',
  },
  sectionCompact: {
    paddingBlock: 60,
    gap: 'var(--spacing-5)',
  },
  // ---- layered atmosphere (aurora blobs + grain, behind content) ----
  atmosBand: {
    position: 'relative',
    overflow: 'hidden',
  },
  aurora: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN,
    opacity: 0.04,
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-text-primary) 8%, transparent) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
    pointerEvents: 'none',
  },
  bandContent: {
    position: 'relative',
    zIndex: 1,
  },
  // ---- sticky navbar (transparent at top → tinted hairline surface) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
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
    minHeight: 60,
  },
  navInnerScrolled: {
    minHeight: 48,
    paddingBlock: 4,
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
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
    border: 'none',
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
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
    maxHeight: 480,
    overflowY: 'auto',
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
  // ---- section furniture ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    padding: '4px 10px',
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  sectionTitle: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
    maxWidth: '24ch',
  },
  sectionTitleCompact: {
    fontSize: 28,
  },
  sectionLede: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // ---- hero ----
  hero: {
    position: 'relative',
    paddingTop: 96,
    paddingBottom: 72,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  heroCompact: {
    paddingTop: 56,
    paddingBottom: 44,
  },
  // Display size is tiered inline from the measured width (80 → 38px).
  heroHeadline: {
    fontWeight: 750,
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
    margin: 0,
    maxWidth: 820,
  },
  gradientInk: {
    backgroundImage: \`linear-gradient(94deg, \${ACCENT} 10%, color-mix(in srgb, \${ACCENT} 55%, \${WARNING}) 90%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  },
  heroSubcopy: {
    fontSize: 18,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  availabilityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingInline: 12,
    borderRadius: 999,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    flexShrink: 0,
  },
  // ---- hero satellites (floating mini-cards over the aurora field) ----
  // Wrapper carries the pointer-parallax transform; the inner card
  // carries the bob keyframe so the two transforms never fight.
  satWrap: {
    position: 'absolute',
    zIndex: 3,
    pointerEvents: 'none',
  },
  satellite: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    whiteSpace: 'nowrap',
  },
  satelliteDisc: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  satTitle: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  satMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.2,
  },
  satAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    marginLeft: -6,
  },
  // ---- client marquee ----
  marqueeBand: {
    borderBlock: '1px solid var(--color-border)',
    paddingBlock: 'var(--spacing-4)',
    overflow: 'hidden',
  },
  marquee: {
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
  },
  marqueeStatic: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 'var(--spacing-3)',
  },
  clientTile: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginRight: 'var(--spacing-7)',
    whiteSpace: 'nowrap',
  },
  // Scheme-locked brand art (see Color policy): invented client gradients
  // read identically in both app themes; monogram text is white on them.
  clientMonogram: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)',
  },
  // ---- case-study grid (asymmetric offset columns at wide widths) ----
  caseColumns: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'flex-start',
  },
  caseColumn: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  caseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    width: '100%',
    padding: 0,
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  caseCardExpanded: {
    borderColor: ACCENT_BORDER,
    boxShadow: \`0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING}\`,
  },
  caseArt: {
    position: 'relative',
    height: 220,
    colorScheme: 'dark',
    overflow: 'hidden',
  },
  caseArtPhone: {
    height: 160,
  },
  // Translucent schematic shapes painted over the locked gradient.
  caseArtWindow: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  caseArtBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  caseArtGhostMonogram: {
    position: 'absolute',
    right: 14,
    bottom: -18,
    fontSize: 110,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: 'rgba(255, 255, 255, 0.20)',
    userSelect: 'none',
  },
  caseOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 12, 16, 0.38)',
  },
  caseOverlayPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingInline: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: '#1A1D21',
    fontSize: 13,
    fontWeight: 700,
  },
  caseBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
  },
  caseTitle: {
    fontSize: 19,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  metricChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    alignSelf: 'flex-start',
    paddingInline: 10,
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- inline case panel (glass, floating tier) ----
  casePanel: {
    borderRadius: 18,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    boxShadow: \`inset 0 0 0 1px color-mix(in srgb, \${ACCENT} 10%, transparent), \${SHADOW_FLOATING}\`,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  casePanelCompact: {
    padding: 'var(--spacing-4)',
  },
  caseFactRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  caseFactRowStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  caseFactLabel: {
    width: 110,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    paddingTop: 3,
  },
  metricTrio: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  metricCell: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.15,
  },
  // ---- proof strip (straddles the work → capabilities boundary) ----
  proofStrip: {
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  proofCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-4) var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxSizing: 'border-box',
  },
  proofValue: {
    fontSize: 44,
    fontWeight: 750,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
  },
  // ---- capabilities (dot-grid band, sticky 5/7 split) ----
  capabilitiesBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  capabilitiesRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  capabilitiesRowStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  capabilitiesIntro: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  capabilitiesGroups: {
    flex: '7 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  bigNumeral: {
    fontSize: 112,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
  },
  capabilityGroup: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-5)',
    alignItems: 'flex-start',
  },
  capabilityIndex: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: ACCENT,
    paddingTop: 12,
    flexShrink: 0,
    width: 28,
  },
  capabilityGlyph: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    boxShadow: SHADOW_RAISED,
  },
  capabilityBullets: {
    margin: 0,
    paddingLeft: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    color: 'var(--color-text-secondary)',
    fontSize: 14.5,
    lineHeight: 1.55,
  },
  // ---- pinned process story ----
  storyStage: {
    position: 'sticky',
    top: NAV_ALLOWANCE,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  storyGrid: {
    width: '100%',
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  storyRailCol: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  storyPanelCol: {
    flex: '7 1 0',
    minWidth: 0,
    position: 'relative',
    minHeight: 420,
  },
  storyPanel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  storySteps: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    paddingLeft: 22,
  },
  storyTrack: {
    position: 'absolute',
    left: 6,
    top: 10,
    bottom: 10,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  storyFill: {
    position: 'absolute',
    inset: 0,
    backgroundColor: ACCENT,
    transformOrigin: 'top',
  },
  storyStep: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
    transition: 'opacity 0.3s ease, background-color 0.3s ease',
  },
  storyStepActive: {
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  storyStepNumber: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
  },
  storyStepTitle: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  // ---- process step card (story panel + static fallback) ----
  processCard: {
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  processIndexNumeral: {
    fontSize: 64,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
  },
  weekStrip: {
    display: 'flex',
    gap: 4,
  },
  weekCell: {
    flex: '1 1 0',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  weekCellActive: {
    backgroundColor: ACCENT,
    border: \`1px solid \${ACCENT}\`,
  },
  outcomeRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  // ---- dark press band (scheme-locked, glass + spotlight) ----
  darkBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    // Scheme-locked brand ink: warm charcoal + terracotta glows.
    backgroundImage: [
      'radial-gradient(60% 80% at 82% 0%, rgba(240, 148, 107, 0.24), transparent 58%)',
      'radial-gradient(46% 60% at 8% 100%, rgba(240, 148, 107, 0.14), transparent 55%)',
      'linear-gradient(180deg, #17100C 0%, #241511 100%)',
    ].join(', '),
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage:
      'radial-gradient(340px circle at var(--fac-mx, 70%) var(--fac-my, 30%), rgba(240, 148, 107, 0.16), transparent 70%)',
  },
  pressGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  pressCard: {
    borderRadius: 16,
    backgroundColor: GLASS_BG,
    boxShadow: \`inset 0 0 0 1px \${GLASS_BORDER}, \${SHADOW_RAISED}\`,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  pressQuote: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '-0.005em',
    margin: 0,
    color: DARK_TEXT,
  },
  pressOutlet: {
    fontSize: 13,
    fontWeight: 700,
    color: DARK_TEXT_SOFT,
  },
  pressDetail: {
    fontSize: 12,
    color: DARK_TEXT_FAINT,
  },
  darkTitle: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
    maxWidth: '24ch',
    color: DARK_TEXT,
  },
  darkEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    padding: '4px 10px',
    borderRadius: 999,
    backgroundColor: GLASS_BG,
    boxShadow: \`inset 0 0 0 1px \${GLASS_BORDER}\`,
    color: '#F0946B',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  // ---- studio / team ----
  studioBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  teamGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  teamCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  teamMonogram: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 17,
    fontWeight: 700,
    boxShadow: SHADOW_RAISED,
  },
  // ---- contact / inquiry ----
  contactRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
  },
  contactRowStacked: {
    flexDirection: 'column',
  },
  availabilityCard: {
    position: 'relative',
    overflow: 'hidden',
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 18,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_SOFT,
    backgroundImage: \`radial-gradient(70% 60% at 100% 0%, color-mix(in srgb, \${ACCENT} 16%, transparent), transparent 65%)\`,
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  inquiryCard: {
    flex: '1.25 1 0',
    minWidth: 0,
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
  selectRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
  },
  selectRowStacked: {
    flexDirection: 'column',
  },
  formError: {
    fontSize: 13,
    margin: 0,
    color: ERROR,
  },
  monoRow: {
    fontFamily: MONO,
    fontSize: 13.5,
    color: 'var(--color-text-primary)',
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
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  footerInner: {
    paddingBlock: 'var(--spacing-7)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerColumns: {
    display: 'flex',
    gap: 'var(--spacing-7)',
    alignItems: 'flex-start',
  },
  footerColumnsStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
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
    color: 'var(--color-text-secondary)',
    textAlign: 'left',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Fathom & Co design studio.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Fathom & Co',
  descriptor: 'Product design studio',
  email: 'hello@fathomand.co',
  cities: 'Portland · Lisbon',
};

type SectionId = 'work' | 'capabilities' | 'process' | 'studio' | 'contact';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'work', label: 'Work'},
  {id: 'capabilities', label: 'Capabilities'},
  {id: 'process', label: 'Process'},
  {id: 'studio', label: 'Studio'},
];

// Scheme-locked brand art (see Color policy): invented client gradients.
interface Client {
  id: string;
  name: string;
  monogram: string;
  gradient: string;
}

const CLIENTS: readonly Client[] = [
  {id: 'meridian', name: 'MERIDIAN HEALTH', monogram: 'MH', gradient: 'linear-gradient(135deg, #0D9488 0%, #1D4ED8 100%)'},
  {id: 'copperline', name: 'COPPERLINE', monogram: 'CL', gradient: 'linear-gradient(135deg, #B45309 0%, #7C2D12 100%)'},
  {id: 'atlas', name: 'ATLAS FREIGHT', monogram: 'AF', gradient: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'},
  {id: 'bloom', name: 'BLOOM & ROOT', monogram: 'BR', gradient: 'linear-gradient(135deg, #15803D 0%, #365314 100%)'},
  {id: 'halcyon', name: 'HALCYON LABS', monogram: 'HL', gradient: 'linear-gradient(135deg, #0E7490 0%, #155E75 100%)'},
  {id: 'wavemark', name: 'WAVEMARK', monogram: 'WM', gradient: 'linear-gradient(135deg, #2563EB 0%, #0F766E 100%)'},
  {id: 'quill', name: 'QUILL & LEDGER', monogram: 'QL', gradient: 'linear-gradient(135deg, #7E22CE 0%, #BE185D 100%)'},
  {id: 'northstar', name: 'NORTHSTAR GRID', monogram: 'NG', gradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)'},
];

interface CaseMetric {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

interface CaseStudy {
  id: string;
  client: string;
  monogram: string;
  sector: string;
  gradient: string;
  title: string;
  outcome: string;
  chip: CaseMetric;
  challenge: string;
  approach: string;
  results: string;
  metrics: readonly [CaseMetric, CaseMetric, CaseMetric];
}

const CASE_STUDIES: readonly CaseStudy[] = [
  {
    id: 'meridian',
    client: 'Meridian Health',
    monogram: 'M',
    sector: 'Healthcare',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #1D4ED8 100%)',
    title: 'Rebuilding a patient portal 2.4M people depend on',
    outcome:
      'Portal activation climbed 38% in the first quarter after relaunch — without a single support-script rewrite.',
    chip: {prefix: '+', value: 38, decimals: 0, suffix: '%', label: 'activation'},
    challenge:
      'Meridian’s portal had grown into 14 disconnected flows across three vendor systems. Activation sat at 31%, and 4 of the top 5 call-center drivers were "how do I log in" variants.',
    approach:
      'A four-person pod ran two weeks of call-center ridealongs, cut the IA from 14 flows to 5 jobs, and rebuilt the shell as a design system the in-house team now owns. We shipped weekly to a 2,000-patient beta ring instead of presenting decks.',
    results:
      'Activation reached 43% within one quarter (from 31%), password-related tickets fell by 41%, and Meridian’s team shipped their first independent feature on the new system three weeks after handoff.',
    metrics: [
      {prefix: '+', value: 38, decimals: 0, suffix: '%', label: 'portal activation'},
      {prefix: '−', value: 41, decimals: 0, suffix: '%', label: 'login support tickets'},
      {prefix: '', value: 11, decimals: 0, suffix: ' wk', label: 'kickoff to relaunch'},
    ],
  },
  {
    id: 'copperline',
    client: 'Copperline',
    monogram: 'C',
    sector: 'Fintech',
    gradient: 'linear-gradient(135deg, #B45309 0%, #7C2D12 100%)',
    title: 'Onboarding that stopped losing customers at step three',
    outcome:
      'Application drop-off fell 52% after we collapsed nine KYC screens into three honest ones.',
    chip: {prefix: '−', value: 52, decimals: 0, suffix: '%', label: 'drop-off'},
    challenge:
      'Copperline’s business-banking signup lost 68% of applicants between identity verification and funding. Compliance had bolted nine screens onto a flow designed for four.',
    approach:
      'We mapped every KYC requirement with their compliance counsel before touching a screen, then merged collection into three steps with inline document capture and a progress contract ("about 6 minutes, 3 things to hand us"). Prototypes were tested with 22 real applicants.',
    results:
      'Drop-off between verification and funding fell from 68% to 33%, median time-to-funded-account went from 3.1 days to same-day for 71% of applicants, and the flow passed its next audit unchanged.',
    metrics: [
      {prefix: '−', value: 52, decimals: 0, suffix: '%', label: 'signup drop-off'},
      {prefix: '', value: 71, decimals: 0, suffix: '%', label: 'funded same-day'},
      {prefix: '', value: 9, decimals: 0, suffix: ' wk', label: 'engagement length'},
    ],
  },
  {
    id: 'atlas',
    client: 'Atlas Freight',
    monogram: 'A',
    sector: 'Logistics',
    gradient: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
    title: 'A dispatch console that keeps 1,400 trucks moving',
    outcome:
      'Dispatchers assign loads 2.1× faster on a console designed in the cab, not the conference room.',
    chip: {prefix: '', value: 2.1, decimals: 1, suffix: '×', label: 'faster dispatch'},
    challenge:
      'Atlas dispatchers juggled three monitors, a radio, and a spreadsheet to cover 1,400 trucks. Load assignment averaged 4 minutes 20 seconds, and every new hire took a quarter to reach speed.',
    approach:
      'Two designers and a design engineer spent week one in the Reno dispatch bay. We rebuilt the console around one queue with keyboard-first triage, exception-only alerting, and a map that answers "who’s closest and legal" in a keystroke.',
    results:
      'Median assignment time dropped to 2 minutes 2 seconds (2.1× faster), new-dispatcher ramp went from 13 weeks to 5, and dispatcher NPS — measured internally — rose 19 points in two months.',
    metrics: [
      {prefix: '', value: 2.1, decimals: 1, suffix: '×', label: 'faster load assignment'},
      {prefix: '+', value: 19, decimals: 0, suffix: ' pts', label: 'dispatcher NPS'},
      {prefix: '', value: 14, decimals: 0, suffix: ' wk', label: 'discovery to rollout'},
    ],
  },
  {
    id: 'bloom',
    client: 'Bloom & Root',
    monogram: 'B',
    sector: 'Commerce',
    gradient: 'linear-gradient(135deg, #15803D 0%, #365314 100%)',
    title: 'Replatforming a DTC brand without losing its soul',
    outcome:
      'Average order value rose 27% after the replatform — with the brand’s hand-drawn character intact.',
    chip: {prefix: '+', value: 27, decimals: 0, suffix: '%', label: 'AOV'},
    challenge:
      'Bloom & Root’s custom storefront was charming and unmaintainable: 11-second product pages, a checkout that failed on older phones, and a founder terrified a replatform would sand off the brand.',
    approach:
      'We treated the illustration system as a first-class design token — codifying the hand-drawn rules into components — while our engineers rebuilt the storefront on a modern stack. Bundling and a "grow the pot" cross-sell pattern came out of 14 customer interviews.',
    results:
      'Product pages now render in 1.8 seconds, mobile conversion rose 34%, AOV climbed 27% on the strength of honest bundles, and the founder signs off every release against a brand checklist we wrote together.',
    metrics: [
      {prefix: '+', value: 27, decimals: 0, suffix: '%', label: 'average order value'},
      {prefix: '+', value: 34, decimals: 0, suffix: '%', label: 'mobile conversion'},
      {prefix: '', value: 12, decimals: 0, suffix: ' wk', label: 'replatform, end to end'},
    ],
  },
];

/** Studio proof numbers — the strip straddling into the capabilities band. */
const PROOF_STATS: readonly CaseMetric[] = [
  {prefix: '', value: 24, decimals: 0, suffix: '', label: 'products shipped since 2019'},
  {prefix: '', value: 4, decimals: 0, suffix: '/yr', label: 'engagements — never more'},
  {prefix: '', value: 92, decimals: 0, suffix: '', label: 'client NPS across 2025'},
];

interface CapabilityGroup {
  id: string;
  icon: Glyph;
  index: string;
  title: string;
  bullets: readonly string[];
}

const CAPABILITY_GROUPS: readonly CapabilityGroup[] = [
  {
    id: 'strategy',
    icon: LightbulbIcon,
    index: '01',
    title: 'Strategy',
    bullets: [
      'Product positioning and narrative',
      'Discovery research, field studies, ridealongs',
      'Roadmap shaping and honest scope cuts',
      'Design and conversion audits',
    ],
  },
  {
    id: 'design',
    icon: PenToolIcon,
    index: '02',
    title: 'Design',
    bullets: [
      'End-to-end product design, zero to shipped',
      'Design systems and component libraries',
      'High-fidelity prototypes people can actually use',
      'Brand-in-product: voice, illustration, motion',
    ],
  },
  {
    id: 'engineering',
    icon: CodeXmlIcon,
    index: '03',
    title: 'Engineering',
    bullets: [
      'Design engineering in React and TypeScript',
      'Production front-end builds, not throwaways',
      'Interaction and motion implementation',
      'Handoffs your team can maintain on day one',
    ],
  },
];

interface ProcessStep {
  id: string;
  index: string;
  title: string;
  weeks: string;
  weekStart: number;
  weekEnd: number;
  copy: string;
  outcomes: readonly string[];
}

const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: 'discover',
    index: '01',
    title: 'Discover',
    weeks: 'Weeks 1–2',
    weekStart: 1,
    weekEnd: 2,
    copy: 'Stakeholder interviews, field time with real users, and a teardown of what exists. We leave with evidence, not opinions.',
    outcomes: [
      'Field notes from 8–12 real users, in their context',
      'A teardown of the current product, flow by flow',
      'The three riskiest assumptions, named in writing',
    ],
  },
  {
    id: 'define',
    index: '02',
    title: 'Define',
    weeks: 'Weeks 3–4',
    weekStart: 3,
    weekEnd: 4,
    copy: 'One narrative, one scoped release, success metrics signed by both sides. If we can’t measure it, we don’t ship it.',
    outcomes: [
      'A one-page product narrative both sides sign',
      'A scoped release plan with honest cuts listed',
      'Success metrics wired to your analytics, not ours',
    ],
  },
  {
    id: 'design',
    index: '03',
    title: 'Design',
    weeks: 'Weeks 5–10',
    weekStart: 5,
    weekEnd: 10,
    copy: 'Weekly working prototypes in your stack instead of decks. You react to the product, and the spec writes itself.',
    outcomes: [
      'A working prototype in your stack every Friday',
      'Usability sessions with 4–6 users per round',
      'A component library growing under the screens',
    ],
  },
  {
    id: 'deliver',
    index: '04',
    title: 'Deliver',
    weeks: 'Weeks 11–14',
    weekStart: 11,
    weekEnd: 14,
    copy: 'Production front-end, paired handoff sessions, and a system your team owns. We stay on call for the first release after.',
    outcomes: [
      'Production front-end merged to your main branch',
      'Paired handoff sessions with your engineers',
      'On-call support through your first solo release',
    ],
  },
];

const PRESS_QUOTES: readonly {
  id: string;
  quote: string;
  outlet: string;
  detail: string;
}[] = [
  {
    id: 'ledger',
    quote:
      'The rare studio whose engineers design and whose designers ship.',
    outlet: 'Design Ledger',
    detail: 'Studios to Watch, 2026',
  },
  {
    id: 'interface-review',
    quote:
      'Fathom & Co’s Meridian work is a masterclass in unglamorous, high-stakes UX.',
    outlet: 'The Interface Review',
    detail: 'Case-study feature, Mar 2026',
  },
  {
    id: 'annual',
    quote: 'Small on purpose — and measurably better for it.',
    outlet: 'Studio Annual',
    detail: '2025 edition, profile',
  },
];

const TEAM: readonly {
  id: string;
  name: string;
  initials: string;
  role: string;
}[] = [
  {id: 'ada', name: 'Ada Fenwick', initials: 'AF', role: 'Principal, Strategy'},
  {id: 'jonah', name: 'Jonah Marsh', initials: 'JM', role: 'Design Director'},
  {id: 'priya', name: 'Priya Raghavan', initials: 'PR', role: 'Staff Product Designer'},
  {id: 'tomas', name: 'Tomás Ibarra', initials: 'TI', role: 'Design Engineer'},
  {id: 'lena', name: 'Lena Okafor', initials: 'LO', role: 'Design Engineer'},
  {id: 'miles', name: 'Miles Dutton', initials: 'MD', role: 'Producer & Ops'},
];

const BUDGET_OPTIONS: readonly string[] = [
  '$25k – $50k',
  '$50k – $100k',
  '$100k – $250k',
  '$250k+',
];

const TIMELINE_OPTIONS: readonly string[] = [
  'As soon as possible',
  'Next 1–2 months',
  'This quarter',
  'Just exploring',
];

const AVAILABILITY = {
  window: 'Booking Q4 2026',
  slots: '2 slots left',
  note:
    'We take four engagements a year so senior people do the work — no bait-and-switch staffing. Inquiries get a reply from a principal within two business days.',
};

// ============= HELPERS =============

/**
 * Measures the page's own size — the inline demo stage is ~1045px wide,
 * so viewport media queries never fire there; a ResizeObserver does.
 * Height only gates the pinned story on/off (sizing is fixed px).
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

/** Tracks prefers-reduced-motion; every motion system gates on it. */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefersReduced;
}

/** Fires once when the element first intersects; reduced motion = instant. */
function useRevealOnce(reduced: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isRevealed: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => {
    if (isRevealed) {
      return undefined;
    }
    if (reduced) {
      setIsRevealed(true);
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
      {threshold: 0.15},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced, isRevealed]);
  return {ref, isRevealed};
}

/**
 * Eased count-up toward target once active (~900ms decelerate); reduced
 * motion snaps straight to the final value.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  reduced: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reduced) {
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
  }, [target, isActive, reduced, durationMs]);
  return value;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter an email so we can reply.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return 'That doesn’t look like an email address.';
  }
  return null;
}

// ============= SMALL PIECES =============

/** Fathom & Co brand mark: accent monogram tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={CompassIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        <Text type="supporting" color="secondary">
          {BRAND.descriptor}
        </Text>
      </VStack>
    </HStack>
  );
}

/** 40px icon-only button (Astryx Button caps at 36px). */
function IconButton40({
  label,
  icon,
  onClick,
  ariaExpanded,
  buttonRef,
}: {
  label: string;
  icon: Glyph;
  onClick: () => void;
  ariaExpanded?: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      style={styles.iconButton}>
      <Icon icon={icon} size="sm" color="inherit" />
    </button>
  );
}

/** Tracked uppercase eyebrow chip + section title pair. */
function SectionHeading({
  eyebrow,
  title,
  lede,
  isCompact,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  isCompact: boolean;
}) {
  return (
    <VStack gap={3}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isCompact ? styles.sectionTitleCompact : null),
        }}>
        {title}
      </h2>
      {lede != null && <p style={styles.sectionLede}>{lede}</p>}
    </VStack>
  );
}

/**
 * Rise 16px + scale 0.985 scroll reveal, 600ms decelerate bezier, fired
 * once; renders visible under reduced motion. delayMs staggers children.
 */
function Reveal({
  reduced,
  delayMs = 0,
  children,
}: {
  reduced: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const {ref, isRevealed} = useRevealOnce(reduced);
  return (
    <div
      ref={ref}
      style={
        reduced
          ? undefined
          : {
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed
                ? 'translateY(0) scale(1)'
                : 'translateY(16px) scale(0.985)',
              transition: \`opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms\`,
            }
      }>
      {children}
    </div>
  );
}

/** Formatted count-up number (chips, proof strip, metric trio). */
function CountUpValue({
  metric,
  isActive,
  reduced,
}: {
  metric: CaseMetric;
  isActive: boolean;
  reduced: boolean;
}) {
  const value = useCountUp(metric.value, isActive, reduced);
  return (
    <>
      {metric.prefix}
      {value.toFixed(metric.decimals)}
      {metric.suffix}
    </>
  );
}

/** One client tile inside the marquee (or the static reduced strip). */
function ClientTile({client, isHidden}: {client: Client; isHidden: boolean}) {
  return (
    <div style={styles.clientTile} aria-hidden={isHidden || undefined}>
      <div
        style={{...styles.clientMonogram, background: client.gradient}}
        aria-hidden="true">
        {client.monogram}
      </div>
      <span style={styles.clientName}>{client.name}</span>
    </div>
  );
}

/** Schematic art over the locked case gradient — no network imagery. */
function CaseArt({study, isPhone}: {study: CaseStudy; isPhone: boolean}) {
  return (
    <div
      style={{
        ...styles.caseArt,
        ...(isPhone ? styles.caseArtPhone : null),
        background: study.gradient,
      }}
      aria-hidden="true">
      <div
        style={{
          ...styles.caseArtWindow,
          top: 22,
          left: 22,
          width: '46%',
        }}>
        <div style={{...styles.caseArtBar, width: '78%'}} />
        <div style={{...styles.caseArtBar, width: '58%', opacity: 0.75}} />
        <div style={{...styles.caseArtBar, width: '86%', opacity: 0.5}} />
      </div>
      <div
        style={{
          ...styles.caseArtWindow,
          top: isPhone ? 64 : 100,
          left: '38%',
          width: '34%',
        }}>
        <div style={{...styles.caseArtBar, width: '64%'}} />
        <div style={{...styles.caseArtBar, width: '84%', opacity: 0.6}} />
      </div>
      <span style={styles.caseArtGhostMonogram}>{study.monogram}</span>
      <div className="fac-case-overlay" style={styles.caseOverlay}>
        <span style={styles.caseOverlayPill}>
          View case
          <Icon icon={ArrowUpRightIcon} size="sm" color="inherit" />
        </span>
      </div>
    </div>
  );
}

/** Case card: reveal wrapper, hover raise + glow, count-up chip, toggle. */
function CaseCard({
  study,
  isExpanded,
  onToggle,
  reduced,
  isPhone,
  delayMs,
}: {
  study: CaseStudy;
  isExpanded: boolean;
  onToggle: () => void;
  reduced: boolean;
  isPhone: boolean;
  delayMs: number;
}) {
  const {ref, isRevealed} = useRevealOnce(reduced);
  return (
    <div
      ref={ref}
      style={
        reduced
          ? undefined
          : {
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed
                ? 'translateY(0) scale(1)'
                : 'translateY(16px) scale(0.985)',
              transition: \`opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms\`,
            }
      }>
      <button
        type="button"
        className="fac-case"
        aria-expanded={isExpanded}
        onClick={onToggle}
        style={{
          ...styles.caseCard,
          ...(isExpanded ? styles.caseCardExpanded : null),
        }}>
        <CaseArt study={study} isPhone={isPhone} />
        <div style={styles.caseBody}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="supporting" color="secondary" weight="semibold">
              {study.client}
            </Text>
            <Badge variant="neutral" label={study.sector} />
          </HStack>
          <h3 style={styles.caseTitle}>{study.title}</h3>
          <Text type="supporting" color="secondary">
            {study.outcome}
          </Text>
          <span style={styles.metricChip}>
            <CountUpValue
              metric={study.chip}
              isActive={isRevealed}
              reduced={reduced}
            />
            <span style={{fontWeight: 600}}>{study.chip.label}</span>
          </span>
        </div>
      </button>
    </div>
  );
}

/** Inline expanded case panel: fact rows + count-up metric trio. */
function CasePanel({
  study,
  onClose,
  reduced,
  isStacked,
  isPhone,
}: {
  study: CaseStudy;
  onClose: () => void;
  reduced: boolean;
  isStacked: boolean;
  isPhone: boolean;
}) {
  const facts: readonly {label: string; copy: string}[] = [
    {label: 'Challenge', copy: study.challenge},
    {label: 'Approach', copy: study.approach},
    {label: 'Results', copy: study.results},
  ];
  return (
    <div
      style={{
        ...styles.casePanel,
        ...(isStacked ? styles.casePanelCompact : null),
      }}
      role="region"
      aria-label={\`\${study.client} case study details\`}>
      <HStack gap={3} vAlign="start">
        <StackItem size="fill">
          <VStack gap={1}>
            <span style={{...styles.eyebrow, alignSelf: 'flex-start'}}>
              {study.client} · {study.sector}
            </span>
            <h3 style={{...styles.caseTitle, fontSize: isStacked ? 19 : 24}}>
              {study.title}
            </h3>
          </VStack>
        </StackItem>
        <IconButton40
          label={\`Close \${study.client} case study\`}
          icon={XIcon}
          onClick={onClose}
        />
      </HStack>
      <VStack gap={4}>
        {facts.map(fact => (
          <div
            key={fact.label}
            style={{
              ...styles.caseFactRow,
              ...(isStacked ? styles.caseFactRowStacked : null),
            }}>
            <span style={styles.caseFactLabel}>{fact.label}</span>
            <StackItem size="fill">
              <Text type="body" color="secondary">
                {fact.copy}
              </Text>
            </StackItem>
          </div>
        ))}
      </VStack>
      <div
        style={{
          ...styles.metricTrio,
          gridTemplateColumns: isPhone ? '1fr' : 'repeat(3, 1fr)',
        }}>
        {study.metrics.map(metric => (
          <div key={metric.label} style={styles.metricCell}>
            <span style={{...styles.metricValue, color: ACCENT}}>
              <CountUpValue metric={metric} isActive reduced={reduced} />
            </span>
            <Text type="supporting" color="secondary">
              {metric.label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 14-cell week strip; the step's week range is accent-filled. */
function WeekStrip({step}: {step: ProcessStep}) {
  const cells = [];
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const isActive = week >= step.weekStart && week <= step.weekEnd;
    cells.push(
      <div
        key={week}
        style={{
          ...styles.weekCell,
          ...(isActive ? styles.weekCellActive : null),
        }}
      />,
    );
  }
  return (
    <VStack gap={1}>
      <div style={styles.weekStrip} aria-hidden="true">
        {cells}
      </div>
      <Text type="supporting" color="secondary">
        {step.weeks} of a 14-week engagement
      </Text>
    </VStack>
  );
}

/** One process step card (pinned-story panel and static fallback). */
function ProcessStepCard({
  step,
  isCompact,
}: {
  step: ProcessStep;
  isCompact: boolean;
}) {
  return (
    <div style={styles.processCard}>
      <HStack gap={3} vAlign="center">
        <span
          style={{
            ...styles.processIndexNumeral,
            ...styles.gradientInk,
            ...(isCompact ? {fontSize: 44} : null),
          }}
          aria-hidden="true">
          {step.index}
        </span>
        <StackItem size="fill">
          <VStack gap={1}>
            <Text type="label">{step.title}</Text>
            <Badge variant="neutral" label={step.weeks} />
          </VStack>
        </StackItem>
      </HStack>
      <Text type="supporting" color="secondary">
        {step.copy}
      </Text>
      <WeekStrip step={step} />
      <Divider />
      <VStack gap={2}>
        {step.outcomes.map(outcome => (
          <div key={outcome} style={styles.outcomeRow}>
            <span style={{color: ACCENT, flexShrink: 0, paddingTop: 2}}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </span>
            <span>{outcome}</span>
          </div>
        ))}
      </VStack>
    </div>
  );
}

/** One count-up proof stat card (rolls its number on first reveal). */
function ProofStatCard({
  stat,
  reduced,
}: {
  stat: CaseMetric;
  reduced: boolean;
}) {
  const {ref, isRevealed} = useRevealOnce(reduced);
  return (
    <div ref={ref} style={styles.proofCard}>
      <span style={styles.proofValue}>
        <CountUpValue metric={stat} isActive={isRevealed} reduced={reduced} />
      </span>
      <Text type="supporting" color="secondary">
        {stat.label}
      </Text>
    </div>
  );
}

// ============= PAGE =============

export default function AgencyPortfolioLandingTemplate() {
  // ---- element-size breakpoints (demo-stage safe) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const {width: wrapWidth, height: stageHeight} = useElementSize(wrapRef);
  const isMid = wrapWidth > 0 && wrapWidth <= 940;
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 700;
  const isPhone = wrapWidth > 0 && wrapWidth <= 480;
  /** Display tiers: 80px at the full stage, never under 56 at wide. */
  const heroDisplaySize =
    wrapWidth > 980 ? 80 : wrapWidth > 780 ? 62 : wrapWidth > 560 ? 48 : 38;

  const reduced = usePrefersReducedMotion();

  // ---- nav: condense flag, compact menu, scroll-spy ----
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- hero satellite parallax ----
  const [parallax, setParallax] = useState({x: 0, y: 0});

  // ---- pinned process story ----
  const storyRef = useRef<HTMLElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const canTheater = !reduced && !isStacked && stageHeight >= 620;
  const storyStep =
    storyProgress >= 0.999 ? 3 : Math.min(3, Math.floor(storyProgress * 4));

  // ---- case grid ----
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // ---- inquiry form ----
  const [budget, setBudget] = useState<string | undefined>(undefined);
  const [timeline, setTimeline] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

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

  // ---- interactions ----

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  /**
   * Scroll offset of an element inside the page container, rect-based so
   * positioned band wrappers between them can't skew the math.
   */
  const topWithin = (container: HTMLDivElement, element: HTMLElement) =>
    container.scrollTop +
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top;

  /** Smooth-scroll the container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container === null || section === null || section === undefined) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: topWithin(container, section) - NAV_ALLOWANCE,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  /** Scroll handler: nav condense, spy, and pinned-story progress. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setIsScrolled(container.scrollTop > 24);
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (
        section != null &&
        topWithin(container, section) <= container.scrollTop + SPY_OFFSET
      ) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
    // Pinned-story progress, quantized to 1/200 to keep renders cheap.
    const story = storyRef.current;
    if (story !== null && canTheater) {
      const travel = Math.max(1, story.offsetHeight - container.clientHeight);
      const raw =
        (container.scrollTop - (topWithin(container, story) - NAV_ALLOWANCE)) /
        travel;
      setStoryProgress(Math.round(Math.min(1, Math.max(0, raw)) * 200) / 200);
    }
  };

  /** Button path into the pinned story: scroll to the step's segment. */
  const jumpToStoryStep = (step: number) => {
    const container = pageRef.current;
    const story = storyRef.current;
    if (container === null || story === null) {
      return;
    }
    const travel = Math.max(1, story.offsetHeight - container.clientHeight);
    container.scrollTo({
      top:
        topWithin(container, story) -
        NAV_ALLOWANCE +
        ((step + 0.5) / 4) * travel,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  // Satellite parallax: drift ±8px toward the pointer over the hero.
  // Off under reduced motion and at mid/stacked (touch-ish) widths.
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || isMid) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 16,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 16,
    });
  };

  const onHeroPointerLeave = () => setParallax({x: 0, y: 0});

  // Dark-band spotlight: CSS vars only — no re-render per pointer move.
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) {
      return;
    }
    const band = event.currentTarget;
    const rect = band.getBoundingClientRect();
    band.style.setProperty(
      '--fac-mx',
      \`\${(event.clientX - rect.left).toFixed(0)}px\`,
    );
    band.style.setProperty(
      '--fac-my',
      \`\${(event.clientY - rect.top).toFixed(0)}px\`,
    );
  };

  const toggleCase = (id: string) => {
    setExpandedCaseId(previous => (previous === id ? null : id));
  };

  const submitInquiry = () => {
    const nextBudgetError = budget == null ? 'Pick a budget range.' : null;
    const nextTimelineError = timeline == null ? 'Pick a timeline.' : null;
    const nextEmailError = validateEmail(email);
    setBudgetError(nextBudgetError);
    setTimelineError(nextTimelineError);
    setEmailError(nextEmailError);
    if (
      nextBudgetError !== null ||
      nextTimelineError !== null ||
      nextEmailError !== null
    ) {
      return;
    }
    setSubmittedEmail(email.trim());
  };

  const resetInquiry = () => {
    setBudget(undefined);
    setTimeline(undefined);
    setEmail('');
    setBudgetError(null);
    setTimelineError(null);
    setEmailError(null);
    setSubmittedEmail(null);
  };

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isStacked ? styles.columnCompact : null),
  };
  const sectionStyle: CSSProperties = {
    ...styles.section,
    ...(isStacked ? styles.sectionCompact : null),
  };

  const expandedCase =
    expandedCaseId === null
      ? null
      : CASE_STUDIES.find(study => study.id === expandedCaseId) ?? null;

  // ============= CHROME =============

  const navLinks = NAV_ANCHORS.map(anchor => (
    <button
      key={anchor.id}
      type="button"
      style={{
        ...styles.navLink,
        ...(activeSection === anchor.id ? styles.navLinkActive : null),
      }}
      aria-current={activeSection === anchor.id ? 'true' : undefined}
      onClick={() => jumpToSection(anchor.id)}>
      {anchor.label}
    </button>
  ));

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Site">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCompact && (
            <HStack gap={1} hAlign="center">
              {navLinks}
            </HStack>
          )}
        </StackItem>
        {!isNavCompact && (
          <span className="fac-shine">
            <Button
              label="Start a project"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => jumpToSection('contact')}
            />
          </span>
        )}
        {isNavCompact && (
          <IconButton40
            label={isMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isMenuOpen}
            buttonRef={menuTriggerRef}
            onClick={() => setIsMenuOpen(previous => !previous)}
          />
        )}
        {isNavCompact && isMenuOpen && (
          <div style={styles.menuPanel} role="menu" aria-label="Site menu">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.menuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <Divider />
              {/* Grid slot stretches the CTA to the panel width. */}
              <div style={{display: 'grid'}}>
                <Button
                  label="Start a project"
                  variant="primary"
                  icon={
                    <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                  }
                  onClick={() => jumpToSection('contact')}
                />
              </div>
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= SECTIONS =============

  // Floating satellite mini-cards: bob on independent keyframes (negative
  // delays) inside a parallax wrapper. Hidden below 940px.
  const satellites = !isMid && (
    <>
      <div
        style={{
          ...styles.satWrap,
          top: 4,
          right: 8,
          transform: \`translate(\${(parallax.x * 1).toFixed(1)}px, \${(
            parallax.y * 1
          ).toFixed(1)}px)\`,
          transition: reduced
            ? undefined
            : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        aria-hidden="true">
        <div className="fac-bob" style={styles.satellite}>
          <span
            style={{
              ...styles.satelliteDisc,
              backgroundColor: \`color-mix(in srgb, \${WARNING} 16%, transparent)\`,
              color: WARNING,
            }}>
            <Icon icon={AwardIcon} size="sm" color="inherit" />
          </span>
          <span>
            <span style={{...styles.satTitle, display: 'block'}}>
              Studios to Watch ’26
            </span>
            <span style={styles.satMeta}>Design Ledger</span>
          </span>
        </div>
      </div>
      <div
        style={{
          ...styles.satWrap,
          top: '48%',
          right: 120,
          transform: \`translate(\${(parallax.x * 1.5).toFixed(1)}px, \${(
            parallax.y * 1.5
          ).toFixed(1)}px)\`,
          transition: reduced
            ? undefined
            : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        aria-hidden="true">
        <div
          className="fac-bob"
          style={{...styles.satellite, animationDelay: '-3s'}}>
          <span
            style={{
              ...styles.satelliteDisc,
              backgroundColor: \`color-mix(in srgb, \${SUCCESS} 15%, transparent)\`,
              color: SUCCESS,
            }}>
            <Icon icon={TrendingUpIcon} size="sm" color="inherit" />
          </span>
          <span>
            <span style={{...styles.satTitle, display: 'block'}}>
              +38% activation
            </span>
            <span style={styles.satMeta}>Meridian Health relaunch</span>
          </span>
        </div>
      </div>
      <div
        style={{
          ...styles.satWrap,
          bottom: 28,
          right: 40,
          transform: \`translate(\${(parallax.x * 0.7).toFixed(1)}px, \${(
            parallax.y * 0.7
          ).toFixed(1)}px)\`,
          transition: reduced
            ? undefined
            : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        aria-hidden="true">
        <div
          className="fac-bob"
          style={{...styles.satellite, animationDelay: '-5.5s'}}>
          <span style={{display: 'flex', paddingLeft: 6}}>
            {TEAM.slice(0, 3).map(member => (
              <span key={member.id} style={styles.satAvatar}>
                {member.initials}
              </span>
            ))}
          </span>
          <span>
            <span style={{...styles.satTitle, display: 'block'}}>
              Your pod of 4
            </span>
            <span style={styles.satMeta}>Senior people only</span>
          </span>
        </div>
      </div>
    </>
  );

  const hero = (
    <header style={columnStyle}>
      <div
        style={{
          ...styles.hero,
          ...(isStacked ? styles.heroCompact : null),
        }}
        onPointerMove={onHeroPointerMove}
        onPointerLeave={onHeroPointerLeave}>
        {satellites}
        <span style={styles.eyebrow}>
          Product design studio · Est. 2019 · {BRAND.cities}
        </span>
        <h1 style={{...styles.heroHeadline, fontSize: heroDisplaySize}}>
          We make complex products{' '}
          <span style={styles.gradientInk}>feel obvious.</span>
        </h1>
        <p style={styles.heroSubcopy}>
          Fathom & Co is a nine-person studio that partners with funded teams
          to ship the product — strategy through production front-end. Four
          engagements a year. Senior people only. No handoff decks.
        </p>
        <HStack gap={2} wrap="wrap" vAlign="center">
          <span className="fac-shine">
            <Button
              label="Start a project"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => jumpToSection('contact')}
            />
          </span>
          <Button
            label="See the work"
            variant="secondary"
            onClick={() => jumpToSection('work')}
          />
          <button
            type="button"
            style={styles.availabilityChip}
            onClick={() => jumpToSection('contact')}>
            <span style={styles.availabilityDot} aria-hidden="true" />
            {AVAILABILITY.window} · {AVAILABILITY.slots}
          </button>
        </HStack>
      </div>
    </header>
  );

  // Signature mechanic, kept and staged: the client marquee loops over
  // the aurora field (pauses on hover); reduced motion renders one
  // static wrapped set.
  const marquee = (
    <div style={styles.marqueeBand}>
      <div style={columnStyle}>
        <VStack gap={3}>
          <Text type="supporting" color="secondary" justify="center">
            Trusted by teams who ship
          </Text>
          {reduced ? (
            <div
              style={styles.marqueeStatic}
              aria-label="Clients: Meridian Health, Copperline, Atlas Freight, Bloom & Root, Halcyon Labs, Wavemark, Quill & Ledger, Northstar Grid">
              {CLIENTS.map(client => (
                <ClientTile key={client.id} client={client} isHidden={false} />
              ))}
            </div>
          ) : (
            <div
              className="fac-marquee"
              style={styles.marquee}
              aria-label="Clients: Meridian Health, Copperline, Atlas Freight, Bloom & Root, Halcyon Labs, Wavemark, Quill & Ledger, Northstar Grid">
              <div className="fac-marquee-track">
                {[...CLIENTS, ...CLIENTS].map((client, index) => (
                  <ClientTile
                    key={\`\${client.id}-\${index}\`}
                    client={client}
                    isHidden={index >= CLIENTS.length}
                  />
                ))}
              </div>
            </div>
          )}
        </VStack>
      </div>
    </div>
  );

  // Aurora hero band: drifting color-mix blobs + grain behind the hero
  // and marquee (static under reduced motion via the scoped classes).
  const heroBand = (
    <div style={styles.atmosBand}>
      <div
        className="fac-drift-a"
        style={{
          ...styles.aurora,
          width: 540,
          height: 540,
          top: -160,
          left: -140,
          opacity: 0.5,
          backgroundImage: \`radial-gradient(closest-side, \${AURORA_A}, transparent 70%)\`,
        }}
        aria-hidden="true"
      />
      <div
        className="fac-drift-b"
        style={{
          ...styles.aurora,
          width: 460,
          height: 460,
          top: 30,
          right: -150,
          opacity: 0.45,
          backgroundImage: \`radial-gradient(closest-side, \${AURORA_B}, transparent 70%)\`,
        }}
        aria-hidden="true"
      />
      <div
        className="fac-drift-a"
        style={{
          ...styles.aurora,
          width: 380,
          height: 380,
          bottom: -170,
          left: '36%',
          opacity: 0.38,
          animationDelay: '-16s',
          backgroundImage: \`radial-gradient(closest-side, \${AURORA_C}, transparent 70%)\`,
        }}
        aria-hidden="true"
      />
      <div style={styles.grain} aria-hidden="true" />
      <div style={styles.bandContent}>
        {hero}
        {marquee}
      </div>
    </div>
  );

  // Asymmetric case grid: two columns, the second offset downward at
  // wide widths; single column in reading order when stacked.
  const caseGrid = isStacked ? (
    <VStack gap={5}>
      {CASE_STUDIES.map(study => (
        <CaseCard
          key={study.id}
          study={study}
          isExpanded={expandedCaseId === study.id}
          onToggle={() => toggleCase(study.id)}
          reduced={reduced}
          isPhone={isPhone}
          delayMs={0}
        />
      ))}
    </VStack>
  ) : (
    <div style={styles.caseColumns}>
      <div style={styles.caseColumn}>
        {[CASE_STUDIES[0], CASE_STUDIES[2]].map((study, index) => (
          <CaseCard
            key={study.id}
            study={study}
            isExpanded={expandedCaseId === study.id}
            onToggle={() => toggleCase(study.id)}
            reduced={reduced}
            isPhone={isPhone}
            delayMs={index * 90}
          />
        ))}
      </div>
      <div style={{...styles.caseColumn, paddingTop: 72}}>
        {[CASE_STUDIES[1], CASE_STUDIES[3]].map((study, index) => (
          <CaseCard
            key={study.id}
            study={study}
            isExpanded={expandedCaseId === study.id}
            onToggle={() => toggleCase(study.id)}
            reduced={reduced}
            isPhone={isPhone}
            delayMs={60 + index * 90}
          />
        ))}
      </div>
    </div>
  );

  // Proof strip: count-up stat cards that straddle the section boundary
  // into the capabilities band (negative bottom margin at wide widths).
  const proofStrip = (
    <Reveal reduced={reduced} delayMs={60}>
      <div
        style={{
          ...styles.proofStrip,
          gridTemplateColumns: isStacked ? '1fr' : 'repeat(3, 1fr)',
          marginBottom: isStacked ? 0 : -160,
        }}>
        {PROOF_STATS.map(stat => (
          <ProofStatCard key={stat.label} stat={stat} reduced={reduced} />
        ))}
      </div>
    </Reveal>
  );

  const workSection = (
    <section
      id="work"
      ref={registerSection('work')}
      style={columnStyle}
      aria-label="Selected work">
      <div style={sectionStyle}>
        <Reveal reduced={reduced}>
          <HStack gap={4} vAlign="end" wrap="wrap">
            <StackItem size="fill">
              <SectionHeading
                eyebrow="Selected work"
                title="Four engagements a year. Here are the last four."
                isCompact={isStacked}
              />
            </StackItem>
            <Text type="supporting" color="secondary">
              Click a case to read how it went.
            </Text>
          </HStack>
        </Reveal>
        {caseGrid}
        {expandedCase !== null && (
          <CasePanel
            study={expandedCase}
            onClose={() => setExpandedCaseId(null)}
            reduced={reduced}
            isStacked={isStacked}
            isPhone={isPhone}
          />
        )}
        {proofStrip}
      </div>
    </section>
  );

  // Dot-grid capabilities band: sticky oversized-numeral intro rail
  // beside the discipline list (5/7 split; stacks below 940px).
  const capabilitiesSection = (
    <div style={{...styles.capabilitiesBand, ...styles.atmosBand}}>
      <div style={styles.dotGrid} aria-hidden="true" />
      <div style={styles.bandContent}>
        <section
          id="capabilities"
          ref={registerSection('capabilities')}
          style={columnStyle}
          aria-label="Capabilities">
          <div
            style={{
              ...sectionStyle,
              ...(isStacked ? null : {paddingTop: 168}),
            }}>
            <div
              style={{
                ...styles.capabilitiesRow,
                ...(isMid ? styles.capabilitiesRowStacked : null),
              }}>
              <div
                style={{
                  ...styles.capabilitiesIntro,
                  ...(isMid
                    ? null
                    : {
                        position: 'sticky' as const,
                        top: NAV_ALLOWANCE + 24,
                      }),
                }}>
                <Reveal reduced={reduced}>
                  <VStack gap={3}>
                    <span
                      style={{...styles.bigNumeral, ...styles.gradientInk}}
                      aria-hidden="true">
                      3×
                    </span>
                    <SectionHeading
                      eyebrow="Capabilities"
                      title="Three disciplines, one pod."
                      lede="Every engagement is staffed as a two-to-four person pod that covers strategy, design, and engineering together — so nothing gets lost in a handoff, because there isn’t one."
                      isCompact={isStacked}
                    />
                  </VStack>
                </Reveal>
              </div>
              <div style={styles.capabilitiesGroups}>
                {CAPABILITY_GROUPS.map((group, index) => (
                  <Reveal
                    key={group.id}
                    reduced={reduced}
                    delayMs={index * 90}>
                    {index > 0 && <Divider />}
                    <div style={styles.capabilityGroup}>
                      <span style={styles.capabilityIndex} aria-hidden="true">
                        {group.index}
                      </span>
                      <div style={styles.capabilityGlyph} aria-hidden="true">
                        <Icon icon={group.icon} size="sm" color="inherit" />
                      </div>
                      <VStack gap={2}>
                        <Text type="label">{group.title}</Text>
                        <ul style={styles.capabilityBullets}>
                          {group.bullets.map(bullet => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </VStack>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  /** Static process fallback: heading + 2-up step cards. */
  const processStatic = (
    <section
      id="process"
      ref={node => {
        registerSection('process')(node);
        if (!canTheater) {
          storyRef.current = null;
        }
      }}
      style={columnStyle}
      aria-label="Process">
      <div style={sectionStyle}>
        <Reveal reduced={reduced}>
          <SectionHeading
            eyebrow="Process"
            title="Fourteen weeks, four moves."
            isCompact={isStacked}
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gap: 'var(--spacing-4)',
            gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr',
          }}>
          {PROCESS_STEPS.map((step, index) => (
            <Reveal key={step.id} reduced={reduced} delayMs={index * 80}>
              <ProcessStepCard step={step} isCompact={isPhone} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );

  /**
   * Pinned scroll story: a fixed 600px sticky stage inside a fixed
   * ~1560px container (px, not vh — see STORY_STAGE_HEIGHT). Scroll
   * progress fills the step rail (scaleY — transform only) and
   * advances four discrete panels; the steps double as buttons.
   */
  const processStory = (
    <section
      id="process"
      ref={node => {
        registerSection('process')(node);
        storyRef.current = node;
      }}
      aria-label="Process"
      style={{height: STORY_CONTAINER_HEIGHT}}>
      <div
        style={{
          ...styles.storyStage,
          height: STORY_STAGE_HEIGHT,
        }}>
        <div style={{...columnStyle, paddingBlock: 0}}>
          <div style={styles.storyGrid}>
            <div style={styles.storyRailCol}>
              <SectionHeading
                eyebrow="Process"
                title="Fourteen weeks, four moves."
                isCompact={false}
              />
              <div style={styles.storySteps}>
                <div style={styles.storyTrack} aria-hidden="true">
                  <div
                    style={{
                      ...styles.storyFill,
                      transform: \`scaleY(\${storyProgress.toFixed(3)})\`,
                    }}
                  />
                </div>
                {PROCESS_STEPS.map((step, index) => {
                  const isActiveStep = storyStep === index;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      aria-current={isActiveStep ? 'step' : undefined}
                      style={{
                        ...styles.storyStep,
                        ...(isActiveStep ? styles.storyStepActive : null),
                        opacity: isActiveStep ? 1 : 0.55,
                      }}
                      onClick={() => jumpToStoryStep(index)}>
                      <span style={styles.storyStepNumber}>
                        {\`\${step.index} · \${step.weeks}\`}
                      </span>
                      <span style={styles.storyStepTitle}>{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={styles.storyPanelCol}>
              {PROCESS_STEPS.map((step, index) => {
                const panelState =
                  index === storyStep
                    ? 'active'
                    : index < storyStep
                      ? 'past'
                      : 'future';
                return (
                  <div
                    key={step.id}
                    aria-hidden={panelState !== 'active'}
                    style={{
                      ...styles.storyPanel,
                      opacity: panelState === 'active' ? 1 : 0,
                      transform:
                        panelState === 'active'
                          ? 'none'
                          : panelState === 'past'
                            ? 'translateY(-18px) scale(0.985)'
                            : 'translateY(18px) scale(0.985)',
                      transition:
                        'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                      pointerEvents: panelState === 'active' ? 'auto' : 'none',
                    }}>
                    <ProcessStepCard step={step} isCompact={false} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Signature scheme-locked dark section: terracotta glows, glass quote
  // cards, grain, and a pointer-tracked spotlight.
  const pressSection = (
    <div
      style={styles.darkBand}
      onPointerMove={onDarkPointerMove}
      aria-label="Selected press">
      {!reduced && <div style={styles.spotlight} aria-hidden="true" />}
      <div style={styles.grain} aria-hidden="true" />
      <div style={styles.bandContent}>
        <section style={columnStyle}>
          <div style={sectionStyle}>
            <Reveal reduced={reduced}>
              <VStack gap={3}>
                <span style={styles.darkEyebrow}>Selected press</span>
                <h2
                  style={{
                    ...styles.darkTitle,
                    ...(isStacked ? {fontSize: 28} : null),
                  }}>
                  Kind words from people we don’t pay.
                </h2>
              </VStack>
            </Reveal>
            <div
              style={{
                ...styles.pressGrid,
                gridTemplateColumns: isStacked ? '1fr' : 'repeat(3, 1fr)',
              }}>
              {PRESS_QUOTES.map((press, index) => (
                <Reveal key={press.id} reduced={reduced} delayMs={index * 90}>
                  <div style={styles.pressCard}>
                    <span style={{color: '#F0946B'}} aria-hidden="true">
                      <Icon icon={QuoteIcon} size="sm" color="inherit" />
                    </span>
                    <StackItem size="fill">
                      <p style={styles.pressQuote}>
                        &ldquo;{press.quote}&rdquo;
                      </p>
                    </StackItem>
                    <VStack gap={0}>
                      <span style={styles.pressOutlet}>{press.outlet}</span>
                      <span style={styles.pressDetail}>{press.detail}</span>
                    </VStack>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const studioSection = (
    <div style={styles.studioBand}>
      <section
        id="studio"
        ref={registerSection('studio')}
        style={columnStyle}
        aria-label="Studio team">
        <div style={sectionStyle}>
          <Reveal reduced={reduced}>
            <SectionHeading
              eyebrow="The studio"
              title="Nine people. Six you’ll work with directly."
              isCompact={isStacked}
            />
          </Reveal>
          <div
            style={{
              ...styles.teamGrid,
              gridTemplateColumns: isPhone
                ? 'repeat(2, 1fr)'
                : isMid
                  ? 'repeat(3, 1fr)'
                  : 'repeat(6, 1fr)',
            }}>
            {TEAM.map((member, index) => (
              <Reveal key={member.id} reduced={reduced} delayMs={index * 60}>
                <div style={styles.teamCell}>
                  <div style={styles.teamMonogram} aria-hidden="true">
                    {member.initials}
                  </div>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {member.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {member.role}
                    </Text>
                  </VStack>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const inquiryForm =
    submittedEmail === null ? (
      <VStack gap={4}>
        <VStack gap={1}>
          <Text type="label">Tell us about your project</Text>
          <Text type="supporting" color="secondary">
            Three fields. A principal reads every inquiry.
          </Text>
        </VStack>
        <div
          style={{
            ...styles.selectRow,
            ...(isPhone ? styles.selectRowStacked : null),
          }}>
          <StackItem size="fill">
            <Selector
              label="Budget range"
              placeholder="Select a range…"
              options={[...BUDGET_OPTIONS]}
              value={budget}
              onChange={value => {
                setBudget(value);
                setBudgetError(null);
              }}
              width="100%"
              status={
                budgetError !== null
                  ? {type: 'error', message: budgetError}
                  : undefined
              }
            />
          </StackItem>
          <StackItem size="fill">
            <Selector
              label="Timeline"
              placeholder="When would we start?"
              options={[...TIMELINE_OPTIONS]}
              value={timeline}
              onChange={value => {
                setTimeline(value);
                setTimelineError(null);
              }}
              width="100%"
              status={
                timelineError !== null
                  ? {type: 'error', message: timelineError}
                  : undefined
              }
            />
          </StackItem>
        </div>
        <VStack gap={1}>
          <TextInput
            label="Work email"
            placeholder="you@company.com"
            value={email}
            onChange={value => {
              setEmail(value);
              setEmailError(null);
            }}
          />
          {emailError !== null && (
            <p style={styles.formError} role="alert">
              {emailError}
            </p>
          )}
        </VStack>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span className="fac-shine">
            <Button
              label="Send inquiry"
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              onClick={submitInquiry}
            />
          </span>
          <Text type="supporting" color="secondary">
            No retainer pitch. No newsletter. Just a reply.
          </Text>
        </HStack>
      </VStack>
    ) : (
      <VStack gap={3} role="status">
        <HStack gap={3} vAlign="center">
          <div style={styles.successDisc} aria-hidden="true">
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          </div>
          <VStack gap={0}>
            <Text type="label">Inquiry received</Text>
            <Text type="supporting" color="secondary">
              We’ll reply to {submittedEmail} within two business days.
            </Text>
          </VStack>
        </HStack>
        <Text type="supporting" color="secondary">
          {budget != null && timeline != null
            ? \`Noted: \${budget} budget, \${timeline.toLowerCase()}. Ada or Jonah will take it from here.\`
            : 'Ada or Jonah will take it from here.'}
        </Text>
        <HStack gap={2}>
          <Button
            label="Send another inquiry"
            variant="ghost"
            size="sm"
            onClick={resetInquiry}
          />
        </HStack>
      </VStack>
    );

  const contactSection = (
    <section
      id="contact"
      ref={registerSection('contact')}
      style={columnStyle}
      aria-label="Availability and inquiries">
      <div style={sectionStyle}>
        <Reveal reduced={reduced}>
          <SectionHeading
            eyebrow="Availability"
            title="Two slots left for Q4 2026."
            isCompact={isStacked}
          />
        </Reveal>
        <Reveal reduced={reduced} delayMs={80}>
          <div
            style={{
              ...styles.contactRow,
              ...(isStacked ? styles.contactRowStacked : null),
            }}>
            <div style={styles.availabilityCard}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <span style={styles.eyebrow}>{AVAILABILITY.window}</span>
                <Badge variant="warning" label={AVAILABILITY.slots} />
              </HStack>
              <Text type="body">{AVAILABILITY.note}</Text>
              <Divider />
              <HStack gap={2} vAlign="center">
                <span style={{color: ACCENT}} aria-hidden="true">
                  <Icon icon={MailIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.monoRow}>{BRAND.email}</span>
              </HStack>
              <HStack gap={2} vAlign="center">
                <span style={{color: ACCENT}} aria-hidden="true">
                  <Icon icon={MapPinIcon} size="sm" color="inherit" />
                </span>
                <Text type="supporting" color="secondary">
                  {BRAND.cities} · remote-friendly across time zones
                </Text>
              </HStack>
            </div>
            <div style={styles.inquiryCard}>{inquiryForm}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  const footer = (
    <footer style={styles.footer}>
      <div style={columnStyle}>
        <div style={styles.footerInner}>
          <div
            style={{
              ...styles.footerColumns,
              ...(isStacked ? styles.footerColumnsStacked : null),
            }}>
            <StackItem size="fill">
              <VStack gap={2}>
                <BrandMark />
                <Text type="supporting" color="secondary">
                  A nine-person product design studio. Four engagements a
                  year, taken seriously.
                </Text>
              </VStack>
            </StackItem>
            <VStack gap={0}>
              <Text type="supporting" color="secondary" weight="semibold">
                Site
              </Text>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={styles.footerLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <button
                type="button"
                style={styles.footerLink}
                onClick={() => jumpToSection('contact')}>
                Contact
              </button>
            </VStack>
            <VStack gap={0}>
              <Text type="supporting" color="secondary" weight="semibold">
                Elsewhere
              </Text>
              {/* Off-site destinations: deliberate no-ops in a template. */}
              <button type="button" style={styles.footerLink} onClick={() => {}}>
                Field Notes (our writing)
              </button>
              <button type="button" style={styles.footerLink} onClick={() => {}}>
                Open design files
              </button>
              <button type="button" style={styles.footerLink} onClick={() => {}}>
                Speaking & workshops
              </button>
            </VStack>
          </div>
          <Divider />
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                © 2026 Fathom & Co LLC · {BRAND.cities}
              </Text>
            </StackItem>
            <span style={styles.monoRow}>{BRAND.email}</span>
          </HStack>
        </div>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div
      ref={wrapRef}
      className={reduced ? \`\${SCOPE} fac-reduced\` : SCOPE}
      style={{height: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Fathom & Co studio site">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {heroBand}
              {workSection}
              {capabilitiesSection}
              {canTheater ? processStory : processStatic}
              {pressSection}
              {studioSection}
              {contactSection}
              {footer}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};