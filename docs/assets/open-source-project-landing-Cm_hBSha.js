var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file open-source-project-landing.tsx
 * @input Deterministic fixtures only (the fictional "tessera" open-source
 *   React state library: four package-manager install commands, star / fork /
 *   license / bundle-size stat values, a before/after code pair for the
 *   30-second example, four release-timeline entries with semver levels and
 *   highlight bullets, 24 contributor monograms plus totals, three sponsor
 *   tiers of monogram tiles, a 13-point star-history series, eight "used by"
 *   wordmarks, three community link cards, and footer link labels)
 * @output Awwwards-bar open-source project landing page. A sticky navbar
 *   rides transparent over the aurora-lit hero, then gains a tinted
 *   color-mix surface, hairline, and shorter bar after 24px of scroll; its
 *   four anchor links smooth-scroll with scroll-spy and collapse behind a
 *   menu button at compact widths, and a working Star toggle increments
 *   every star count on the page. The hero stages a product theater: a
 *   gradient-ink display headline over an install "terminal" panel set in
 *   subtle perspective, orbited by three bobbing satellite mini-cards
 *   (star-delta chip, release toast, contributor avatar cluster) that
 *   parallax toward the pointer; the panel's npm/pnpm/yarn/bun TabList swaps
 *   the CodeBlock command (copy button with aria-live "Copied" feedback) and
 *   the whole composition bleeds across the boundary into the dot-grid
 *   example band. Sections: a recessed-before / floating-after 30-second
 *   example pair; a PINNED SCROLL STORY for the four releases (600px sticky
 *   stage in a fixed 1600px wrapper — px, never vh, because the inline demo
 *   resolves vh against the window, not the stage; scroll fills the
 *   numbered step rail and crossfades
 *   oversized-numeral release panels; steps are clickable; reduced motion or
 *   compact widths render the static stacked timeline); an asymmetric 5/7
 *   contributors split with count-up totals beside a staggered monogram
 *   wall; a three-tier sponsors band; a scheme-locked DARK star-history
 *   band with vibrant aurora glows, grain, a pointer-tracked spotlight,
 *   a glass sparkline card that draws on reveal, glass count-up growth
 *   chips, and a used-by marquee loop (pause on hover, static under reduced
 *   motion); hover-raising Docs / Discord / GitHub cards; and the
 *   scheme-locked MIT footer.
 * @position Page template; emitted by \`astryx template open-source-project-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy, the nav surface state,
 * and the pinned-story progress; the navbar is position:sticky top:0 inside
 * it. The page element is measured by a ResizeObserver (width for
 * breakpoints, height for the pinned-story stage). A <style> tag injects
 * ospl-prefixed keyframes (aurora drift, satellite bob, marquee) plus the
 * hover-only sheen/raise rules, all scoped under .ospl-root:not(.ospl-reduced).
 *
 * Interaction contract:
 * - Nav anchor links smooth-scroll the container to real section ids with a
 *   sticky-nav allowance; onScroll spies the last anchor above the fold and
 *   highlights the matching link (aria-current). At compact widths the links
 *   collapse behind a 40px menu button whose dropdown closes on Escape,
 *   outside pointerdown, or any selection.
 * - The Star button (nav + hero) toggles a starred state: the label flips to
 *   "Starred" and every star count on the page increments by one. No dead
 *   buttons in the hero: "Get started" scrolls to the example section.
 * - The install panel's package-manager TabList swaps the CodeBlock command;
 *   the CodeBlock copy button fires an aria-live "Copied ..." confirmation
 *   that clears after 2 seconds.
 * - Pinned-story steps double as buttons: clicking one scrolls the container
 *   to that step's segment of the sticky travel (or is a pure highlight in
 *   the static fallback).
 * - Community link cards and sponsor/footer links would leave the page, so
 *   they are intentionally inert (no-op onClick per template conventions).
 *
 * Motion contract (all gated by prefers-reduced-motion via matchMedia):
 * - Aurora blobs drift on 34-44s transform keyframes; satellites bob on
 *   6.5-8.5s keyframes with negative delays and parallax ±8px toward the
 *   pointer over the hero (spring transition; off under reduced motion and
 *   at stacked widths).
 * - Sections reveal once via IntersectionObserver — 16px rise + 0.985 scale
 *   settle over ~600ms decelerate bezier, with 60-90ms child staggers on
 *   timeline rows, contributor tiles, and community cards.
 * - Star/fork chips, the contributor totals, and the 90-day star delta count
 *   up over ~900ms with decelerate easing on first view.
 * - The star-history polyline draws on when revealed (pathLength
 *   dashoffset transition); its area fill fades in.
 * - The used-by strip is a 48s marquee loop that pauses on hover.
 * - Primary CTAs carry a sheen-sweep hover (translating gradient overlay),
 *   1px lift, and a 0.98 pressed scale; cards raise a shadow tier and gain
 *   an accent border-glow on hover.
 * - Reduced motion: reveals render visible, counters render final values,
 *   the sparkline renders fully drawn, the marquee renders as a static
 *   wrapped strip, the story renders as a static stacked timeline, and the
 *   auroras hold still. No entrance motion anywhere.
 *
 * Container policy (landing-page archetype): page chrome is frame-first;
 * marketing sections are painted bands and bordered surfaces inside the
 * document column. All art is CSS/SVG — monogram gradient tiles, a mosaic
 * brand glyph, aurora fields, an feTurbulence grain tile, and a fixed-point
 * sparkline. No network assets, no real logos, no clocks, no randomness.
 *
 * Color policy: token-pure except two sanctioned classes:
 * 1. ONE quarantined accent literal (tessera teal) declared once as a
 *    light-dark() pair with contrast math (see ACCENT below); every tint,
 *    glow, aurora, and gradient ink derives from it via color-mix with
 *    tokens.
 * 2. Scheme-locked brand art: contributor/sponsor monogram gradients, the
 *    dark star-history band, and the footer carry literal colors under
 *    colorScheme:'dark' so they read identically in both app themes (same
 *    policy as saas-landing-page.tsx brand tiles).
 *
 * Responsive contract (measured with a ResizeObserver on the page element —
 * the inline demo stage is ~1045px wide, so viewport media queries are not
 * used):
 * - Column: max-width 1120px, centered; tinted/dark bands bleed edge to
 *   edge. Section rhythm: 104px block padding at wide, 72px stacked, 56px
 *   phone.
 * - >880px: navbar shows 4 inline anchor links + Star button.
 * - <=880px: anchors collapse behind a 40px menu button + dropdown panel
 *   (Escape / outside tap / selection closes); Star button stays visible.
 * - >740px: the example pair sits 2-up, the release story pins, the
 *   contributors split 5/7, and community cards sit 3-up (Grid minWidth).
 * - <=740px: the example pair, contributor split, and sponsor rows stack;
 *   the release story renders as the static stacked timeline; satellite
 *   parallax turns off.
 * - <=540px: the display headline and oversized numerals step down, hero
 *   satellites hide, stat chips wrap, band paddings tighten, and the
 *   used-by strip wraps. Action rows are wrap-enabled so the page holds at
 *   390px in the phone artboard with no overflow-x.
 * - Tap targets: nav links, the menu button, story steps, and footer links
 *   are >=40px controls; nothing on the page requires hover.
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
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  GitBranchIcon,
  GitForkIcon,
  HeartIcon,
  MenuIcon,
  MessagesSquareIcon,
  PackageIcon,
  ScaleIcon,
  StarIcon,
  TerminalIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal (the ONE sanctioned accent for this page):
 * tessera teal. Contrast math: light #0F766E on #FFFFFF = 5.5:1 (AA for
 * normal text, AAA for the >=18px uses here); dark #2DD4BF on a ~#101828
 * dark body = 9.9:1 (AAA). Every tint, glow, aurora, and gradient ink on
 * the page derives from this single pair via color-mix with tokens.
 */
const ACCENT = 'light-dark(#0F766E, #2DD4BF)';
const ACCENT_SOFT = \`color-mix(in srgb, \${ACCENT} 11%, transparent)\`;
const ACCENT_BORDER = \`color-mix(in srgb, \${ACCENT} 34%, transparent)\`;
const ACCENT_GLOW = \`color-mix(in srgb, \${ACCENT} 22%, transparent)\`;

// Status tokens (with house light-dark fallbacks) — only ever mixed with
// the accent, never used as standalone new hues.
const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const INFO_BLUE = 'var(--color-icon-blue, light-dark(#0B57D0, #A8C7FA))';

/** Aurora blob inks — the accent mixed toward the success / info tokens. */
const AURORA_A = \`color-mix(in srgb, \${ACCENT} 55%, transparent)\`;
const AURORA_B = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 45%, \${SUCCESS}) 52%, transparent)\`;
const AURORA_C = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 40%, \${INFO_BLUE}) 48%, transparent)\`;

/** Gradient ink for the hero key phrase and oversized numerals. */
const INK_GRADIENT = \`linear-gradient(94deg, \${ACCENT} 6%, color-mix(in srgb, \${ACCENT} 55%, \${INFO_BLUE}) 55%, color-mix(in srgb, \${ACCENT} 50%, \${SUCCESS}) 98%)\`;

// Scheme-locked dark surfaces (star-history band + footer, see Color
// policy). White-alpha chips are glass furniture on those surfaces only.
const DARK_BG = '#0B1220';
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.8)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.58)';
const GLASS_BG = 'rgba(255, 255, 255, 0.08)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.18)';

/** Sheen sweep on primary CTAs (white-alpha, glass family). */
const SHEEN = 'rgba(255, 255, 255, 0.35)';

/**
 * Depth tiers (neutral black shadows only — hue never rides a shadow;
 * accent glow arrives as a separate 0-spread ring on hover).
 * raised = default card lift; floating = adds a wide soft underlayer;
 * glass adds an inset hairline stroke on dark surfaces.
 */
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';
const SHADOW_GLASS = \`inset 0 0 0 1px \${GLASS_BORDER}, \${SHADOW_FLOATING}\`;

/** Colorless SVG feTurbulence grain tile (data URI, no network asset). */
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' ' +
  'width=\\'160\\' height=\\'160\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence ' +
  'type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' ' +
  'stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'160\\' ' +
  'height=\\'160\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E")';

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

/** Sticky-nav height allowance shared by smooth-scroll and scroll-spy. */
const NAV_ALLOWANCE = 64;
const SPY_OFFSET = 140;
/**
 * Pinned-story sizes are fixed px, never vh/dvh and never derived from the
 * wrapper's measured height: the inline demo renders this page in the top
 * browser window, so vh resolves against the WINDOW (not the ~920px stage)
 * and the wrapper's height:100% can collapse to content height — either
 * way a multiplied pin container balloons into thousands of px of
 * near-empty scroll. 600px stage + 1600px wrapper ≈ 1000px of travel.
 */
const STORY_STAGE_HEIGHT = 600;
const STORY_WRAPPER_HEIGHT = 1600;
/** How far the hero theater bleeds into the example band. */
const THEATER_OVERLAP = 56;

/**
 * Injected once per page: ospl-prefixed keyframes (aurora drift, satellite
 * bob, marquee) plus the hover-only sheen/raise rules. Every motion rule is
 * scoped under .ospl-root:not(.ospl-reduced) or gated inline, so reduced
 * motion renders everything static.
 */
const OSPL_CSS = \`
@keyframes ospl-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(52px, -34px, 0) scale(1.12); }
}
@keyframes ospl-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-44px, 30px, 0) scale(0.93); }
}
@keyframes ospl-drift-c {
  0%, 100% { transform: translate3d(0, 0, 0) scale(0.96); }
  50% { transform: translate3d(30px, 40px, 0) scale(1.08); }
}
@keyframes ospl-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
@keyframes ospl-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.ospl-root:not(.ospl-reduced) .ospl-aurora-a {
  animation: ospl-drift-a 38s ease-in-out infinite;
}
.ospl-root:not(.ospl-reduced) .ospl-aurora-b {
  animation: ospl-drift-b 44s ease-in-out -12s infinite;
}
.ospl-root:not(.ospl-reduced) .ospl-aurora-c {
  animation: ospl-drift-c 34s ease-in-out -22s infinite;
}
.ospl-root:not(.ospl-reduced) .ospl-bob {
  animation: ospl-bob 7.5s ease-in-out infinite;
}
.ospl-root:not(.ospl-reduced) .ospl-marquee-track {
  animation: ospl-marquee 48s linear infinite;
}
.ospl-root:not(.ospl-reduced) .ospl-marquee:hover .ospl-marquee-track {
  animation-play-state: paused;
}
.ospl-shine {
  position: relative;
  display: inline-flex;
  border-radius: 10px;
  overflow: hidden;
}
.ospl-shine::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, \${SHEEN} 50%, transparent 60%);
  transform: translateX(-130%) skewX(-14deg);
}
.ospl-root:not(.ospl-reduced) .ospl-shine {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.ospl-root:not(.ospl-reduced) .ospl-shine:hover { transform: translateY(-1px); }
.ospl-root:not(.ospl-reduced) .ospl-shine:hover::after {
  transform: translateX(130%) skewX(-14deg);
  transition: transform 0.7s ease;
}
.ospl-root:not(.ospl-reduced) .ospl-shine:active { transform: scale(0.98); }
.ospl-root:not(.ospl-reduced) .ospl-raise {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}
.ospl-root:not(.ospl-reduced) .ospl-raise:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING};
}
@media (prefers-reduced-motion: reduce) {
  .ospl-root .ospl-aurora-a, .ospl-root .ospl-aurora-b,
  .ospl-root .ospl-aurora-c, .ospl-root .ospl-bob,
  .ospl-root .ospl-marquee-track { animation: none; }
  .ospl-root .ospl-shine, .ospl-root .ospl-raise { transition: none; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy, sticky nav, and story progress.
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
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnPhone: {
    paddingInline: 'var(--spacing-4)',
  },
  // 104px section rhythm at wide widths; 72/56px compact tiers.
  band: {
    paddingBlock: 104,
  },
  bandStacked: {
    paddingBlock: 72,
  },
  bandPhone: {
    paddingBlock: 56,
  },
  bandTinted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- layered atmosphere ----
  atmosBand: {
    position: 'relative',
    overflow: 'hidden',
  },
  atmosLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
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
      'radial-gradient(circle, var(--color-border) 1px, transparent 1.4px)',
    backgroundSize: '22px 22px',
    opacity: 0.5,
    maskImage:
      'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
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
      'color-mix(in srgb, var(--color-background-body) 92%, transparent)',
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
    minHeight: 58,
    transition: 'min-height 0.3s ease',
  },
  navInnerScrolled: {
    minHeight: 48,
    paddingBlock: 4,
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
  menuButton: {
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
  navMenu: {
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
  },
  navMenuLink: {
    display: 'flex',
    alignItems: 'center',
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
  // ---- brand mark: CSS mosaic glyph (tessera = mosaic tile) ----
  mosaic: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 3,
    padding: 3,
    boxSizing: 'border-box',
    borderRadius: 8,
    backgroundColor: ACCENT_SOFT,
  },
  mosaicTile: {
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  mosaicTileGhost: {
    borderRadius: 3,
    backgroundColor: \`color-mix(in srgb, \${ACCENT} 28%, transparent)\`,
  },
  wordmark: {
    fontFamily: MONO,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  // ---- eyebrow (11px tracked uppercase, accent-tinted chip) ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
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
  eyebrowOnDark: {
    backgroundColor: GLASS_BG,
    border: \`1px solid \${GLASS_BORDER}\`,
    color: DARK_TEXT,
  },
  // ---- hero ----
  heroDisplay: {
    fontWeight: 720,
    lineHeight: 1.03,
    letterSpacing: '-0.03em',
    margin: 0,
    textAlign: 'center',
    maxWidth: 880,
  },
  gradientInk: {
    backgroundImage: INK_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
    textAlign: 'center',
  },
  // ---- section headings (32-44px tier, tracked tight) ----
  sectionHeading: {
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    textAlign: 'center',
    marginBottom: 'var(--spacing-8)',
  },
  sectionCopy: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // ---- hero product theater ----
  theaterWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 660,
    marginInline: 'auto',
    perspective: 1400,
  },
  theaterPanel: {
    position: 'relative',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    overflow: 'hidden',
    transform: 'rotateX(2.5deg)',
    transformOrigin: 'center bottom',
  },
  theaterToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  toolbarDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  toolbarTitle: {
    fontFamily: MONO,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
  },
  theaterBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  theaterGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: -38,
    height: 80,
    borderRadius: '50%',
    backgroundImage: \`radial-gradient(closest-side, \${AURORA_A}, transparent 72%)\`,
    filter: 'blur(30px)',
    pointerEvents: 'none',
  },
  copyLive: {
    minHeight: 20,
    fontSize: 13,
    color: ACCENT,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // Satellites: wrapper carries the pointer-parallax transform; the inner
  // card carries the bob keyframe so the two transforms never fight.
  satWrap: {
    position: 'absolute',
    zIndex: 3,
    pointerEvents: 'none',
  },
  satellite: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    whiteSpace: 'nowrap',
  },
  satDisc: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  satTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  satMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.25,
  },
  statChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 38,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    whiteSpace: 'nowrap',
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  statChipLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // ---- before / after example ----
  examplePair: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
    position: 'relative',
  },
  examplePairStacked: {
    flexDirection: 'column',
  },
  examplePane: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  exampleBefore: {
    opacity: 0.88,
  },
  exampleAfterFrame: {
    borderRadius: 16,
    padding: 'var(--spacing-3)',
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`0 0 0 4px \${ACCENT_SOFT}, \${SHADOW_FLOATING}\`,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  exampleArrow: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT,
    color: 'var(--color-background-body)',
    boxShadow: SHADOW_RAISED,
  },
  // ---- pinned release story ----
  storyStage: {
    position: 'sticky',
    top: NAV_ALLOWANCE,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
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
  storyPanelCard: {
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  storyVersionNumeral: {
    fontFamily: MONO,
    fontSize: 52,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.03em',
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
    minHeight: 44,
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
  // ---- static timeline fallback ----
  timelineRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    position: 'relative',
    paddingBottom: 'var(--spacing-6)',
  },
  timelineRail: {
    width: 24,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    border: '3px solid var(--color-background-body)',
    boxShadow: \`0 0 0 1px var(--color-border), 0 0 12px \${ACCENT_GLOW}\`,
    flexShrink: 0,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'var(--color-border)',
    marginTop: 4,
  },
  timelineBody: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  timelineVersion: {
    fontFamily: MONO,
    fontSize: 17,
    fontWeight: 700,
  },
  timelineBullet: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  // ---- contributors (asymmetric 5/7 split) ----
  contribSplit: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  contribSplitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
  },
  contribIntro: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
  },
  contribWallCol: {
    flex: '7 1 0',
    minWidth: 0,
  },
  contributorWall: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
  },
  contribStatValue: {
    fontSize: 40,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  contribStatLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // Scheme-locked brand art (see Color policy): gradient monograms are
  // identical in both app themes; white text reads on every gradient.
  monogram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontWeight: 700,
    flexShrink: 0,
  },
  // ---- sponsors ----
  sponsorTier: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    alignItems: 'center',
  },
  sponsorRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
  },
  sponsorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  // Scheme-locked brand art (see Color policy).
  sponsorTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontWeight: 700,
    flexShrink: 0,
  },
  tierLabel: {
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
  },
  // ---- dark star-history band (scheme-locked, see Color policy) ----
  darkBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: DARK_BG,
    color: DARK_TEXT,
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: \`radial-gradient(360px circle at var(--ospl-mx, 50%) var(--ospl-my, 22%), color-mix(in srgb, \${ACCENT} 18%, transparent), transparent 70%)\`,
  },
  glassCard: {
    borderRadius: 18,
    backgroundColor: GLASS_BG,
    boxShadow: SHADOW_GLASS,
    padding: 'var(--spacing-5)',
  },
  glassChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingInline: 14,
    borderRadius: 999,
    backgroundColor: GLASS_BG,
    boxShadow: \`inset 0 0 0 1px \${GLASS_BORDER}\`,
    color: DARK_TEXT,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sparkFrame: {
    width: '100%',
    display: 'block',
  },
  // ---- used-by marquee ----
  marquee: {
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
  },
  marqueeTrack: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    width: 'max-content',
    paddingBlock: 2,
  },
  marqueeStatic: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
  },
  usedByTile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 116,
    height: 42,
    paddingInline: 16,
    borderRadius: 10,
    backgroundColor: GLASS_BG,
    boxShadow: \`inset 0 0 0 1px \${GLASS_BORDER}\`,
    color: DARK_TEXT_SOFT,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  // ---- community cards ----
  communityCard: {
    borderRadius: 16,
    boxShadow: SHADOW_RAISED,
  },
  communityGlyph: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    flexShrink: 0,
  },
  // ---- footer (scheme-locked, see Color policy) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: DARK_BG,
    borderTop: \`1px solid \${GLASS_BORDER}\`,
  },
  footerInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerInnerPhone: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 40,
    paddingInline: 4,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: DARK_TEXT_FAINT,
    textAlign: 'left',
  },
  footerRule: {
    height: 1,
    backgroundColor: GLASS_BORDER,
    border: 'none',
    margin: 0,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional "tessera" state library.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'tessera',
  pitch: 'State that composes like tiles.',
  subcopy:
    'One primitive — the tile. Compose tiles into any shape of state, ' +
    'subscribe to exactly what you read, and ship 2.1 kB to production. ' +
    'No providers, no boilerplate, no relicensing surprises.',
};

const STATS = {
  stars: 12842,
  forks: 486,
  license: 'MIT',
  bundle: '2.1 kB',
  starsDelta90d: 1204,
  contributors: 293,
  countries: 41,
};

type SectionId = 'example' | 'releases' | 'sponsors' | 'community';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'example', label: 'Example'},
  {id: 'releases', label: 'Releases'},
  {id: 'sponsors', label: 'Sponsors'},
  {id: 'community', label: 'Community'},
];

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: readonly {id: PackageManager; command: string}[] = [
  {id: 'npm', command: 'npm install tessera'},
  {id: 'pnpm', command: 'pnpm add tessera'},
  {id: 'yarn', command: 'yarn add tessera'},
  {id: 'bun', command: 'bun add tessera'},
];

const BEFORE_CODE = \`const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'add':
      return {...state, items: [...state.items, action.item]};
    case 'remove':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.id),
      };
    default:
      return state;
  }
}

export function CartProvider({children}) {
  const [state, dispatch] = useReducer(cartReducer, {items: []});
  const value = useMemo(() => ({state, dispatch}), [state]);
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context == null) throw new Error('Missing <CartProvider>');
  return context;
}\`;

const AFTER_CODE = \`import {tile} from 'tessera';

export const cart = tile({items: []});

export const addItem = item =>
  cart.set(state => ({items: [...state.items, item]}));

export const removeItem = id =>
  cart.set(state => ({
    items: state.items.filter(item => item.id !== id),
  }));

// Any component — no provider, no context
const items = cart.use(state => state.items);\`;

type SemverLevel = 'major' | 'minor' | 'patch';

interface Release {
  version: string;
  date: string;
  level: SemverLevel;
  title: string;
  bullets: readonly string[];
}

const RELEASES: readonly Release[] = [
  {
    version: 'v4.0.0',
    date: 'June 18, 2026',
    level: 'major',
    title: 'Tiles v2',
    bullets: [
      'Computed tiles are lazy by default — cold-start renders drop ~34% on the benchmark suite.',
      'New devtools timeline with time-travel and per-tile subscription counts.',
      'Dropped the legacy React 17 adapter; codemod ships with the migration guide.',
    ],
  },
  {
    version: 'v3.6.0',
    date: 'March 11, 2026',
    level: 'minor',
    title: 'Keyed families',
    bullets: [
      'tile.family() for keyed collections — one tile per entity id, garbage-collected on release.',
      'SSR snapshot hydration is 2.3x faster on large stores.',
    ],
  },
  {
    version: 'v3.5.2',
    date: 'January 27, 2026',
    level: 'patch',
    title: 'Selector fixes',
    bullets: [
      'Fix: selector equality regressed for NaN-containing tuples in 3.5.1.',
      'Types: use() now infers readonly tuples from selector returns.',
    ],
  },
  {
    version: 'v3.5.0',
    date: 'November 4, 2025',
    level: 'minor',
    title: 'Async tiles',
    bullets: [
      'Async tiles with suspense-free loading states — read {status, data} synchronously.',
      'Bundle trimmed to 2.1 kB min+gzip (was 2.6 kB).',
    ],
  },
];

const SEMVER_BADGE: Record<
  SemverLevel,
  {variant: 'purple' | 'blue' | 'neutral'; label: string}
> = {
  major: {variant: 'purple', label: 'major'},
  minor: {variant: 'blue', label: 'minor'},
  patch: {variant: 'neutral', label: 'patch'},
};

// Scheme-locked brand-art gradients (see Color policy): cycled across
// contributor and sponsor monogram tiles; identical in both app themes.
const MONOGRAM_GRADIENTS: readonly string[] = [
  'linear-gradient(135deg, #0D9488 0%, #0369A1 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)',
  'linear-gradient(135deg, #059669 0%, #65A30D 100%)',
  'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)',
];

const CONTRIBUTORS: readonly {name: string; initials: string}[] = [
  {name: 'Ana Ferreira', initials: 'AF'},
  {name: 'Kofi Mensah', initials: 'KM'},
  {name: 'Yuki Tanaka', initials: 'YT'},
  {name: 'Priya Raman', initials: 'PR'},
  {name: 'Lars Nygaard', initials: 'LN'},
  {name: 'Sofia Petrova', initials: 'SP'},
  {name: 'Diego Alvarez', initials: 'DA'},
  {name: 'Mei-Ling Chu', initials: 'MC'},
  {name: 'Tomás Ribeiro', initials: 'TR'},
  {name: 'Amara Diallo', initials: 'AD'},
  {name: 'Jonas Weber', initials: 'JW'},
  {name: 'Hana Kim', initials: 'HK'},
  {name: 'Mateo Rossi', initials: 'MR'},
  {name: 'Ingrid Olsen', initials: 'IO'},
  {name: 'Ravi Shankar', initials: 'RS'},
  {name: 'Clara Dubois', initials: 'CD'},
  {name: 'Emeka Obi', initials: 'EO'},
  {name: 'Nadia Haddad', initials: 'NH'},
  {name: 'Peter Kovacs', initials: 'PK'},
  {name: 'Lucia Moreno', initials: 'LM'},
  {name: 'Owen Gallagher', initials: 'OG'},
  {name: 'Zainab Farouk', initials: 'ZF'},
  {name: 'Elias Lind', initials: 'EL'},
  {name: 'Marta Kowalska', initials: 'MK'},
];

interface SponsorTier {
  id: string;
  heading: string;
  tileSize: number;
  sponsors: readonly {name: string; initials: string; note?: string}[];
}

const SPONSOR_TIERS: readonly SponsorTier[] = [
  {
    id: 'platinum',
    heading: 'Platinum — $500/mo',
    tileSize: 56,
    sponsors: [
      {name: 'Corestack', initials: 'CS', note: 'since 2023'},
      {name: 'Arclight Cloud', initials: 'AC', note: 'since 2024'},
      {name: 'Fieldnote', initials: 'FN', note: 'since 2024'},
    ],
  },
  {
    id: 'gold',
    heading: 'Gold — $100/mo',
    tileSize: 44,
    sponsors: [
      {name: 'Driftware', initials: 'DW'},
      {name: 'Papertrail Labs', initials: 'PL'},
      {name: 'Motif', initials: 'MT'},
      {name: 'Kelpworks', initials: 'KW'},
      {name: 'Signalbox', initials: 'SB'},
    ],
  },
  {
    id: 'community',
    heading: 'Community — 118 backers',
    tileSize: 32,
    sponsors: [
      {name: '@juno', initials: 'J'},
      {name: '@roux', initials: 'R'},
      {name: '@tkoda', initials: 'T'},
      {name: '@amaris', initials: 'A'},
      {name: '@beck', initials: 'B'},
      {name: '@silt', initials: 'S'},
      {name: '@wren', initials: 'W'},
      {name: '@kaido', initials: 'K'},
    ],
  },
];

/**
 * Star history: cumulative stars at ~5.5-month intervals, Jan 2021 through
 * Jul 2026. Fixed fixture points — the sparkline is fully deterministic.
 */
const STAR_HISTORY: readonly number[] = [
  0, 180, 520, 1040, 1690, 2480, 3420, 4510, 5740, 7350, 9120, 10980, 12842,
];

const STAR_YEARS: readonly string[] = [
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
];

const USED_BY: readonly string[] = [
  'BRIGHTLOOM',
  'CASCADE HQ',
  'OAKFRAME',
  'PULSEGRID',
  'VELLUM',
  'QUARTZLINE',
  'MOSSBANK',
  'TIDEWATER',
];

const COMMUNITY_CARDS: readonly {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
  meta: string;
}[] = [
  {
    id: 'docs',
    icon: BookOpenIcon,
    title: 'Docs',
    copy: 'Guides, API reference, and 30 copy-paste recipes at tessera.dev/docs.',
    meta: '142 pages · searchable',
  },
  {
    id: 'discord',
    icon: MessagesSquareIcon,
    title: 'Discord',
    copy: 'Ask anything in #help — median first reply is 11 minutes.',
    meta: '4,806 members · 312 online',
  },
  {
    id: 'github',
    icon: GitBranchIcon,
    title: 'GitHub',
    copy: 'Issues, discussions, and the public roadmap. PRs welcome.',
    meta: '23 good first issues',
  },
];

const FOOTER_LINKS: readonly string[] = [
  'Docs',
  'Changelog',
  'npm',
  'Security policy',
  'Governance',
  'Code of conduct',
];

// ============= HOOKS =============

/**
 * ResizeObserver size of the page element — the inline demo stage is
 * ~1045px wide inside a 1440px window, so viewport media queries never
 * fire there; element width is the source of truth for breakpoints and
 * element height sizes the pinned-story stage.
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

/** prefers-reduced-motion, resolved before first paint via lazy init. */
function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/**
 * Eased count-up toward a fixed target on first activation: ~900ms with
 * decelerate (cubic-out) easing. Reduced motion (or an inactive trigger)
 * renders the final/initial value with no animation frames.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  isReduced: boolean,
): number {
  const [value, setValue] = useState(isReduced ? target : 0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (isReduced) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const durationMs = 900;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, isReduced, target]);
  return value;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

// ============= MOTION PIECES =============

/**
 * Fire-once scroll reveal: 16px rise + 0.985 scale settle over ~600ms
 * decelerate bezier; grouped call sites stagger children via \`delay\`
 * (60-90ms steps). Reduced motion mounts already revealed.
 */
function Reveal({
  children,
  delay = 0,
  isReduced,
  style,
}: {
  children: ReactNode;
  delay?: number;
  isReduced: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isShown, setIsShown] = useState(isReduced);
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
        if (entries.some(entry => entry.isIntersecting)) {
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
        ...style,
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(16px) scale(0.985)',
        transition: \`opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

// ============= SMALL PIECES =============

/** tessera brand mark: 2x2 mosaic glyph + mono wordmark. */
function BrandMark({textColor}: {textColor?: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.mosaic} aria-hidden="true">
        <span style={styles.mosaicTile} />
        <span style={styles.mosaicTileGhost} />
        <span style={styles.mosaicTileGhost} />
        <span style={styles.mosaicTile} />
      </div>
      <span
        style={{
          ...styles.wordmark,
          fontSize: 17,
          ...(textColor == null ? null : {color: textColor}),
        }}>
        {BRAND.name}
      </span>
    </HStack>
  );
}

/** 11px tracked-uppercase eyebrow chip (accent-tinted or glass-on-dark). */
function Eyebrow({label, isOnDark = false}: {label: string; isOnDark?: boolean}) {
  return (
    <span
      style={{
        ...styles.eyebrow,
        ...(isOnDark ? styles.eyebrowOnDark : null),
      }}>
      {label}
    </span>
  );
}

/** Centered section intro: eyebrow chip + 32-44px heading + 56ch copy. */
function SectionHead({
  kicker,
  title,
  copy,
  headingSize,
  isOnDark = false,
}: {
  kicker: string;
  title: string;
  copy: string;
  headingSize: number;
  isOnDark?: boolean;
}) {
  return (
    <div style={styles.sectionHead}>
      <Eyebrow label={kicker} isOnDark={isOnDark} />
      <h2 style={{...styles.sectionHeading, fontSize: headingSize}}>{title}</h2>
      <p
        style={{
          ...styles.sectionCopy,
          ...(isOnDark ? {color: DARK_TEXT_SOFT} : null),
        }}>
        {copy}
      </p>
    </div>
  );
}

/** Gradient monogram disc/tile; gradients cycle deterministically. */
function Monogram({
  initials,
  name,
  size,
  gradientIndex,
  isRound = true,
}: {
  initials: string;
  name: string;
  size: number;
  gradientIndex: number;
  isRound?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      style={{
        ...(isRound ? styles.monogram : styles.sponsorTile),
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        background:
          MONOGRAM_GRADIENTS[gradientIndex % MONOGRAM_GRADIENTS.length],
      }}>
      {initials}
    </span>
  );
}

/** Floating hero satellite mini-card (bobbing + parallax wrapper). */
function Satellite({
  position,
  parallaxX,
  parallaxY,
  bobDelaySec,
  isReduced,
  icon,
  title,
  meta,
  children,
}: {
  position: CSSProperties;
  parallaxX: number;
  parallaxY: number;
  bobDelaySec: number;
  isReduced: boolean;
  icon?: Glyph;
  title: string;
  meta: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        ...styles.satWrap,
        ...position,
        transform: \`translate(\${parallaxX.toFixed(1)}px, \${parallaxY.toFixed(1)}px)\`,
        transition: isReduced
          ? undefined
          : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      aria-hidden="true">
      <div
        className="ospl-bob"
        style={{
          ...styles.satellite,
          animationDelay: \`\${bobDelaySec}s\`,
          animationDuration: \`\${(7.5 + bobDelaySec / 4).toFixed(2)}s\`,
        }}>
        {icon == null ? null : (
          <span style={styles.satDisc}>
            <Icon icon={icon} size="sm" color="inherit" />
          </span>
        )}
        {children}
        <span>
          <span style={{...styles.satTitle, display: 'block'}}>{title}</span>
          <span style={{...styles.satMeta, display: 'block'}}>{meta}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Star-history sparkline (drawn inside the scheme-locked dark band):
 * fixed 13-point series as an SVG polyline with pathLength=1; the
 * dashoffset transition draws it on when the section reveals (reduced
 * motion renders it fully drawn immediately).
 */
function StarSparkline({
  isRevealed,
  isReduced,
}: {
  isRevealed: boolean;
  isReduced: boolean;
}) {
  const width = 640;
  const height = 190;
  const top = 18;
  const bottom = height - 30;
  const left = 10;
  const right = width - 66;
  const max = STAR_HISTORY[STAR_HISTORY.length - 1];
  const points = STAR_HISTORY.map((stars, index) => {
    const x = left + (index / (STAR_HISTORY.length - 1)) * (right - left);
    const y = bottom - (stars / max) * (bottom - top);
    return {x, y};
  });
  const polyline = points
    .map(point => \`\${point.x.toFixed(1)},\${point.y.toFixed(1)}\`)
    .join(' ');
  const area = \`\${left},\${bottom} \${polyline} \${right},\${bottom}\`;
  const last = points[points.length - 1];
  const gridValues = [4000, 8000, 12000];
  const isDrawn = isRevealed || isReduced;
  return (
    <svg
      viewBox={\`0 0 \${width} \${height}\`}
      style={styles.sparkFrame}
      role="img"
      aria-label={\`Star history from 2021 to 2026, growing from 0 to \${formatCount(max)} stars\`}>
      {gridValues.map(value => {
        const y = bottom - (value / max) * (bottom - top);
        return (
          <g key={value}>
            <line
              x1={left}
              x2={right}
              y1={y}
              y2={y}
              style={{stroke: GLASS_BORDER}}
              strokeDasharray="3 5"
              strokeWidth={1}
            />
            <text
              x={right + 8}
              y={y + 4}
              style={{
                fill: DARK_TEXT_FAINT,
                fontSize: 11,
                fontVariantNumeric: 'tabular-nums',
              }}>
              {\`\${value / 1000}k\`}
            </text>
          </g>
        );
      })}
      <polygon
        points={area}
        style={{
          fill: \`color-mix(in srgb, \${ACCENT} 16%, transparent)\`,
          opacity: isDrawn ? 1 : 0,
          transition: isReduced ? undefined : 'opacity 0.9s ease 0.9s',
        }}
      />
      <polyline
        points={polyline}
        pathLength={1}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          stroke: ACCENT,
          strokeDasharray: 1,
          strokeDashoffset: isDrawn ? 0 : 1,
          transition: isReduced ? undefined : 'stroke-dashoffset 1.6s ease',
        }}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={4.5}
        style={{
          fill: ACCENT,
          opacity: isDrawn ? 1 : 0,
          transition: isReduced ? undefined : 'opacity 0.4s ease 1.5s',
        }}
      />
      <text
        x={last.x - 8}
        y={last.y - 10}
        textAnchor="end"
        style={{
          fill: ACCENT,
          fontSize: 12,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          opacity: isDrawn ? 1 : 0,
          transition: isReduced ? undefined : 'opacity 0.4s ease 1.5s',
        }}>
        {formatCount(max)}
      </text>
      {STAR_YEARS.map((year, index) => {
        const x = left + (index / (STAR_YEARS.length - 1)) * (right - left);
        return (
          <text
            key={year}
            x={x}
            y={height - 8}
            textAnchor={index === 0 ? 'start' : 'middle'}
            style={{fill: DARK_TEXT_FAINT, fontSize: 11}}>
            {year}
          </text>
        );
      })}
    </svg>
  );
}

/**
 * Fire-once section trigger for count-ups and child staggers. Reduced
 * motion mounts already revealed.
 */
function useRevealOnce(
  isReduced: boolean,
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(isReduced);
  useEffect(() => {
    if (isReduced) {
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
  }, [isReduced]);
  return [ref, isRevealed];
}

/** Child stagger inside an already-triggered section (70ms steps). */
function staggerStyle(isRevealed: boolean, delayMs: number): CSSProperties {
  return {
    opacity: isRevealed ? 1 : 0,
    transform: isRevealed ? 'none' : 'translateY(14px) scale(0.985)',
    transition: \`opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms\`,
  };
}

// ============= SECTIONS =============

function ExampleSection({
  isReduced,
  isStacked,
  headingSize,
}: {
  isReduced: boolean;
  isStacked: boolean;
  headingSize: number;
}) {
  return (
    <div>
      <Reveal isReduced={isReduced}>
        <SectionHead
          kicker="30-second example"
          title="Delete the ceremony"
          copy="The same cart store, before and after. tessera replaces the context + reducer + provider stack with one tile you can read from anywhere."
          headingSize={headingSize}
        />
      </Reveal>
      <Reveal isReduced={isReduced} delay={90}>
        <div
          style={{
            ...styles.examplePair,
            ...(isStacked ? styles.examplePairStacked : null),
          }}>
          <div style={{...styles.examplePane, ...styles.exampleBefore}}>
            <HStack gap={2} vAlign="center">
              <Badge variant="neutral" label="Before" />
              <Text type="supporting" color="secondary">
                Context + reducer + provider — 31 lines
              </Text>
            </HStack>
            <CodeBlock
              code={BEFORE_CODE}
              language="tsx"
              title="store.tsx"
              size="sm"
              width="100%"
              maxHeight={340}
            />
          </div>
          <div style={styles.exampleArrow} aria-hidden="true">
            <span
              style={{
                display: 'inline-flex',
                transform: isStacked ? 'rotate(90deg)' : 'none',
              }}>
              <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
            </span>
          </div>
          <div style={styles.examplePane}>
            <div style={styles.exampleAfterFrame}>
              <HStack gap={2} vAlign="center">
                <Badge variant="teal" label="After" />
                <Text type="supporting" color="secondary">
                  One tile — 14 lines, no provider
                </Text>
              </HStack>
              <CodeBlock
                code={AFTER_CODE}
                language="tsx"
                title="store.ts"
                size="sm"
                width="100%"
                maxHeight={340}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/** Shared release panel body (pinned story + static fallback). */
function ReleaseBullets({bullets}: {bullets: readonly string[]}) {
  return (
    <VStack gap={1}>
      {bullets.map(bullet => (
        <div key={bullet} style={styles.timelineBullet}>
          <span
            style={{color: ACCENT, display: 'inline-flex', marginTop: 3}}
            aria-hidden="true">
            <Icon icon={CheckIcon} size="xsm" color="inherit" />
          </span>
          <Text size="sm" color="secondary">
            {bullet}
          </Text>
        </div>
      ))}
    </VStack>
  );
}

/** Static stacked timeline — the reduced-motion / compact release story. */
function ReleasesStatic({
  isReduced,
  headingSize,
}: {
  isReduced: boolean;
  headingSize: number;
}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  return (
    <div ref={ref}>
      <Reveal isReduced={isReduced}>
        <SectionHead
          kicker="Releases"
          title="Steady, semver-honest releases"
          copy="A release roughly every six weeks. Breaking changes only in majors, always with a codemod and a migration guide."
          headingSize={headingSize}
        />
      </Reveal>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {RELEASES.map((release, index) => {
          const badge = SEMVER_BADGE[release.level];
          const isLast = index === RELEASES.length - 1;
          return (
            <div
              key={release.version}
              style={{
                ...styles.timelineRow,
                ...staggerStyle(isRevealed, index * 80),
                ...(isLast ? {paddingBottom: 0} : null),
              }}>
              <div style={styles.timelineRail} aria-hidden="true">
                <span style={styles.timelineDot} />
                {isLast ? null : <span style={styles.timelineLine} />}
              </div>
              <div style={styles.timelineBody}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <span style={styles.timelineVersion}>{release.version}</span>
                  <Badge variant={badge.variant} label={badge.label} />
                  <Text type="supporting" color="secondary">
                    {release.date}
                  </Text>
                  <Text size="sm" weight="semibold">
                    {release.title}
                  </Text>
                </HStack>
                <ReleaseBullets bullets={release.bullets} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContributorsSection({
  isReduced,
  isStacked,
  headingSize,
}: {
  isReduced: boolean;
  isStacked: boolean;
  headingSize: number;
}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  const contributorCount = useCountUp(
    STATS.contributors,
    isRevealed,
    isReduced,
  );
  const countryCount = useCountUp(STATS.countries, isRevealed, isReduced);
  return (
    <div
      ref={ref}
      style={{
        ...styles.contribSplit,
        ...(isStacked ? styles.contribSplitStacked : null),
      }}>
      <div style={{...styles.contribIntro, ...staggerStyle(isRevealed, 0)}}>
        <Eyebrow label="Contributors" />
        <h2 style={{...styles.sectionHeading, fontSize: headingSize}}>
          Built by{' '}
          <span style={styles.gradientInk}>293 people</span>
        </h2>
        <p style={styles.sectionCopy}>
          Maintained in the open since 2021. 18 first-time contributors
          landed changes in the last release alone.
        </p>
        <HStack gap={6} vAlign="start" wrap="wrap">
          <VStack gap={1}>
            <span style={styles.contribStatValue}>
              {formatCount(contributorCount)}
            </span>
            <span style={styles.contribStatLabel}>contributors</span>
          </VStack>
          <VStack gap={1}>
            <span style={styles.contribStatValue}>
              {formatCount(countryCount)}
            </span>
            <span style={styles.contribStatLabel}>countries</span>
          </VStack>
        </HStack>
        <Button
          label="Read the contributing guide"
          variant="secondary"
          icon={<Icon icon={UsersIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </div>
      <div style={styles.contribWallCol}>
        <div style={styles.contributorWall}>
          {CONTRIBUTORS.map((contributor, index) => (
            <div
              key={contributor.name}
              style={staggerStyle(isRevealed, 120 + index * 30)}>
              <Monogram
                initials={contributor.initials}
                name={contributor.name}
                size={48}
                gradientIndex={index}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 'var(--spacing-4)',
            textAlign: 'center',
            ...staggerStyle(isRevealed, 120 + CONTRIBUTORS.length * 30),
          }}>
          <Text type="supporting" color="secondary">
            {\`24 of \${formatCount(STATS.contributors)} contributors across \${STATS.countries} countries\`}
          </Text>
        </div>
      </div>
    </div>
  );
}

function SponsorsSection({
  isReduced,
  headingSize,
}: {
  isReduced: boolean;
  headingSize: number;
}) {
  return (
    <div>
      <Reveal isReduced={isReduced}>
        <SectionHead
          kicker="Sponsors"
          title="Funded by the people who use it"
          copy="$4,850/mo currently funds two dedicated maintainer days a week — triage, reviews, and docs."
          headingSize={headingSize}
        />
      </Reveal>
      <VStack gap={6}>
        {SPONSOR_TIERS.map((tier, tierIndex) => (
          <Reveal key={tier.id} isReduced={isReduced} delay={tierIndex * 90}>
            <div style={styles.sponsorTier}>
              <span style={styles.tierLabel}>{tier.heading}</span>
              <div style={styles.sponsorRow}>
                {tier.sponsors.map((sponsor, index) =>
                  tier.id === 'community' ? (
                    <Monogram
                      key={sponsor.name}
                      initials={sponsor.initials}
                      name={sponsor.name}
                      size={tier.tileSize}
                      gradientIndex={index + tierIndex}
                    />
                  ) : (
                    <div
                      key={sponsor.name}
                      className="ospl-raise"
                      style={styles.sponsorCard}>
                      <Monogram
                        initials={sponsor.initials}
                        name={sponsor.name}
                        size={tier.tileSize}
                        gradientIndex={index + tierIndex}
                        isRound={false}
                      />
                      <VStack gap={0}>
                        <Text size="sm" weight="semibold">
                          {sponsor.name}
                        </Text>
                        {sponsor.note == null ? null : (
                          <Text type="supporting" color="secondary">
                            {sponsor.note}
                          </Text>
                        )}
                      </VStack>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </VStack>
      <HStack gap={2} hAlign="center" style={{marginTop: 'var(--spacing-6)'}}>
        <span className="ospl-shine">
          <Button
            label="Become a sponsor"
            variant="secondary"
            icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
        </span>
      </HStack>
    </div>
  );
}

function GrowthSection({
  isReduced,
  isStarred,
  headingSize,
}: {
  isReduced: boolean;
  isStarred: boolean;
  headingSize: number;
}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  const delta = useCountUp(STATS.starsDelta90d, isRevealed, isReduced);
  return (
    <div ref={ref}>
      <Reveal isReduced={isReduced}>
        <SectionHead
          kicker="Star history"
          title="Five years of steady adoption"
          copy="No launch spikes, no growth hacks — just releases that keep their promises."
          headingSize={headingSize}
          isOnDark
        />
      </Reveal>
      <Reveal isReduced={isReduced} delay={90}>
        <div style={styles.glassCard}>
          <StarSparkline isRevealed={isRevealed} isReduced={isReduced} />
        </div>
      </Reveal>
      <HStack
        gap={2}
        hAlign="center"
        wrap="wrap"
        style={{marginTop: 'var(--spacing-4)', ...staggerStyle(isRevealed, 180)}}>
        <span style={styles.glassChip}>
          <span style={{color: ACCENT, display: 'inline-flex'}} aria-hidden="true">
            <Icon icon={StarIcon} size="xsm" color="inherit" />
          </span>
          {\`+\${formatCount(delta)} stars in the last 90 days\`}
        </span>
        <span style={styles.glassChip}>
          {\`\${formatCount(STATS.stars + (isStarred ? 1 : 0))} total\`}
        </span>
        <span style={styles.glassChip}>#2 on OSS Radar · state management</span>
      </HStack>
      <div style={{marginTop: 'var(--spacing-8)'}}>
        <div style={{textAlign: 'center', marginBottom: 'var(--spacing-4)'}}>
          <span style={{...styles.tierLabel, color: DARK_TEXT_FAINT}}>
            In production at
          </span>
        </div>
        {isReduced ? (
          <div style={styles.marqueeStatic}>
            {USED_BY.map(name => (
              <span key={name} style={styles.usedByTile}>
                {name}
              </span>
            ))}
          </div>
        ) : (
          <div className="ospl-marquee" style={styles.marquee}>
            <div className="ospl-marquee-track" style={styles.marqueeTrack}>
              {[0, 1].map(copy => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing-3)',
                    paddingRight: 'var(--spacing-3)',
                  }}>
                  {USED_BY.map(name => (
                    <span key={name} style={styles.usedByTile}>
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommunitySection({
  isReduced,
  headingSize,
}: {
  isReduced: boolean;
  headingSize: number;
}) {
  return (
    <div>
      <Reveal isReduced={isReduced}>
        <SectionHead
          kicker="Community"
          title="Stuck? Someone is around"
          copy="Docs first, Discord for the weird cases, GitHub for everything else."
          headingSize={headingSize}
        />
      </Reveal>
      <Grid columns={{minWidth: 250}} gap={3}>
        {COMMUNITY_CARDS.map((card, index) => (
          <Reveal key={card.id} isReduced={isReduced} delay={index * 90}>
            <div className="ospl-raise" style={styles.communityCard}>
              <ClickableCard label={card.title} onClick={() => {}}>
                <HStack gap={3} vAlign="start">
                  <div style={styles.communityGlyph} aria-hidden="true">
                    <Icon icon={card.icon} size="sm" color="inherit" />
                  </div>
                  <StackItem size="fill">
                    <VStack gap={1}>
                      <HStack gap={1} vAlign="center">
                        <Text size="base" weight="semibold">
                          {card.title}
                        </Text>
                        <span
                          style={{
                            color: 'var(--color-text-secondary)',
                            display: 'inline-flex',
                          }}
                          aria-hidden="true">
                          <Icon
                            icon={ArrowRightIcon}
                            size="xsm"
                            color="inherit"
                          />
                        </span>
                      </HStack>
                      <Text size="sm" color="secondary">
                        {card.copy}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {card.meta}
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
              </ClickableCard>
            </div>
          </Reveal>
        ))}
      </Grid>
    </div>
  );
}

// ============= PAGE =============

export default function OpenSourceProjectLandingTemplate() {
  // ---- layout measurement (demo-stage-safe breakpoints + stage height) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const {width: pageWidth, height: stageHeight} = useElementSize(wrapRef);
  const isNavCompact = pageWidth > 0 && pageWidth <= 880;
  const isStacked = pageWidth > 0 && pageWidth <= 740;
  const isPhone = pageWidth > 0 && pageWidth <= 540;

  const isReduced = usePrefersReducedMotion();

  // Typographic tiers: 80px display at wide, never under 56 above 740px.
  const displaySize =
    pageWidth > 1000 ? 80 : pageWidth > 740 ? 64 : pageWidth > 540 ? 50 : 38;
  const headingSize = isPhone ? 28 : isStacked ? 32 : 40;

  // ---- nav ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ---- hero interactions ----
  const [packageManager, setPackageManager] = useState<PackageManager>('pnpm');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [parallax, setParallax] = useState({x: 0, y: 0});

  // ---- hero count-ups (hero is in view on mount = first view) ----
  const heroStars = useCountUp(STATS.stars, true, isReduced);
  const heroForks = useCountUp(STATS.forks, true, isReduced);
  const displayedStars = heroStars + (isStarred ? 1 : 0);

  // ---- pinned release story ----
  const storyRef = useRef<HTMLElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const canStory = !isReduced && !isStacked && stageHeight >= 560;
  const storyStep =
    storyProgress >= 0.999
      ? RELEASES.length - 1
      : Math.min(RELEASES.length - 1, Math.floor(storyProgress * RELEASES.length));

  // Menu dismisses on Escape (refocusing the trigger) and on pointerdown
  // outside the sticky navbar; listeners only run while it is open.
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

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    },
    [],
  );

  /** Smooth-scroll the page container to a section under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container === null || section === null || section === undefined) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Button path into the pinned story: scroll to the step's segment. */
  const jumpToStoryStep = (step: number) => {
    const container = pageRef.current;
    const story = storyRef.current;
    if (container === null || story === null || !canStory) {
      return;
    }
    const travel = Math.max(1, story.offsetHeight - container.clientHeight);
    container.scrollTo({
      top:
        story.offsetTop -
        NAV_ALLOWANCE +
        ((step + 0.5) / RELEASES.length) * travel,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Scroll-spy + nav surface + pinned-story progress (quantized 1/200). */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setIsScrolled(container.scrollTop > 24);
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
    const story = storyRef.current;
    if (story !== null && canStory) {
      const travel = Math.max(1, story.offsetHeight - container.clientHeight);
      const raw =
        (container.scrollTop - (story.offsetTop - NAV_ALLOWANCE)) / travel;
      setStoryProgress(Math.round(Math.min(1, Math.max(0, raw)) * 200) / 200);
    }
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  // Satellite parallax: drift ±8px toward the pointer over the hero.
  // Off under reduced motion and at stacked (touch-ish) widths.
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (isReduced || isStacked) {
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
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (isReduced) {
      return;
    }
    const band = event.currentTarget;
    const rect = band.getBoundingClientRect();
    band.style.setProperty(
      '--ospl-mx',
      \`\${(event.clientX - rect.left).toFixed(0)}px\`,
    );
    band.style.setProperty(
      '--ospl-my',
      \`\${(event.clientY - rect.top).toFixed(0)}px\`,
    );
  };

  const onCopyInstall = () => {
    const command =
      INSTALL_COMMANDS.find(entry => entry.id === packageManager)?.command ??
      '';
    setCopiedCommand(command);
    if (copiedTimeoutRef.current !== null) {
      window.clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopiedCommand(null);
    }, 2000);
  };

  const activeCommand =
    INSTALL_COMMANDS.find(entry => entry.id === packageManager)?.command ?? '';

  const starLabel = isStarred
    ? \`Starred \${formatCount(displayedStars)}\`
    : \`Star \${formatCount(displayedStars)}\`;

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const bandStyle: CSSProperties = {
    ...styles.band,
    ...(isStacked ? styles.bandStacked : null),
    ...(isPhone ? styles.bandPhone : null),
  };
  const theaterOverlap = isPhone ? 32 : THEATER_OVERLAP;

  // ---- navbar (transparent at top → tinted hairline surface) ----
  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Main">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          {isNavCompact ? null : (
            <HStack gap={1} hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={
                    activeSection === anchor.id ? 'location' : undefined
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
        <span className="ospl-shine">
          <Button
            label={starLabel}
            variant={isStarred ? 'secondary' : 'primary'}
            size="sm"
            icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
            onClick={() => setIsStarred(previous => !previous)}
          />
        </span>
        {isNavCompact ? (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        ) : null}
        {isNavCompact && isMenuOpen ? (
          <div style={styles.navMenu} role="menu" aria-label="Site sections">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.navMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ---- hero: aurora field + display type + install theater ----
  const satellites =
    isPhone ? null : (
      <>
        <Satellite
          position={{top: -20, left: isStacked ? 4 : -30}}
          parallaxX={parallax.x}
          parallaxY={parallax.y}
          bobDelaySec={-1.5}
          isReduced={isReduced}
          icon={StarIcon}
          title="+1,204 stars"
          meta="last 90 days"
        />
        <Satellite
          position={{top: '36%', right: isStacked ? 4 : -42}}
          parallaxX={parallax.x * -0.75}
          parallaxY={parallax.y * -0.75}
          bobDelaySec={-4}
          isReduced={isReduced}
          icon={PackageIcon}
          title="v4.0.0 · Tiles v2"
          meta="released June 18"
        />
        <Satellite
          position={{bottom: -24, left: isStacked ? 10 : -16}}
          parallaxX={parallax.x * 0.6}
          parallaxY={parallax.y * 0.6}
          bobDelaySec={-6.5}
          isReduced={isReduced}
          title="293 contributors"
          meta="41 countries">
          <span style={{display: 'inline-flex'}}>
            {CONTRIBUTORS.slice(0, 3).map((contributor, index) => (
              <span
                key={contributor.name}
                style={{
                  display: 'inline-flex',
                  marginLeft: index === 0 ? 0 : -8,
                  borderRadius: '50%',
                  border: '2px solid var(--color-background-card)',
                }}>
                <Monogram
                  initials={contributor.initials}
                  name={contributor.name}
                  size={26}
                  gradientIndex={index}
                />
              </span>
            ))}
          </span>
        </Satellite>
      </>
    );

  const hero = (
    <header
      style={{
        ...styles.atmosBand,
        zIndex: 2,
        marginBottom: -theaterOverlap,
      }}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {/* Aurora field: drifting color-mix blobs + grain, behind content. */}
      <div style={styles.atmosLayer} aria-hidden="true">
        <div
          className="ospl-aurora-a"
          style={{
            ...styles.aurora,
            width: 540,
            height: 540,
            top: -180,
            left: '-6%',
            opacity: 0.5,
            backgroundImage: \`radial-gradient(closest-side, \${AURORA_A}, transparent 70%)\`,
          }}
        />
        <div
          className="ospl-aurora-b"
          style={{
            ...styles.aurora,
            width: 460,
            height: 460,
            top: -80,
            right: '-8%',
            opacity: 0.45,
            backgroundImage: \`radial-gradient(closest-side, \${AURORA_C}, transparent 70%)\`,
          }}
        />
        <div
          className="ospl-aurora-c"
          style={{
            ...styles.aurora,
            width: 380,
            height: 380,
            bottom: -120,
            left: '30%',
            opacity: 0.38,
            backgroundImage: \`radial-gradient(closest-side, \${AURORA_B}, transparent 70%)\`,
          }}
        />
        <div style={styles.grain} />
      </div>
      <div style={{...columnStyle, ...bandStyle, ...styles.bandContent}}>
        <VStack gap={5} hAlign="center">
          <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
            <Eyebrow label="tessera · Open source" />
            <Badge variant="neutral" label="v4.0.0" />
            <Badge
              variant="neutral"
              icon={<Icon icon={ScaleIcon} size="xsm" color="inherit" />}
              label="MIT"
            />
          </HStack>
          <h1 style={{...styles.heroDisplay, fontSize: displaySize}}>
            State that{' '}
            <span style={styles.gradientInk}>composes like tiles.</span>
          </h1>
          <p style={styles.heroSubcopy}>{BRAND.subcopy}</p>
          <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
            <span className="ospl-shine">
              <Button
                label="Get started"
                variant="primary"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('example')}
              />
            </span>
            <Button
              label={isStarred ? 'Starred on GitHub' : 'Star on GitHub'}
              variant="secondary"
              icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
              onClick={() => setIsStarred(previous => !previous)}
            />
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
            <span style={styles.statChip}>
              <span
                style={{color: ACCENT, display: 'inline-flex'}}
                aria-hidden="true">
                <Icon icon={StarIcon} size="xsm" color="inherit" />
              </span>
              <span style={styles.statChipValue}>
                {formatCount(displayedStars)}
              </span>
              <span style={styles.statChipLabel}>stars</span>
            </span>
            <span style={styles.statChip}>
              <span
                style={{color: ACCENT, display: 'inline-flex'}}
                aria-hidden="true">
                <Icon icon={GitForkIcon} size="xsm" color="inherit" />
              </span>
              <span style={styles.statChipValue}>
                {formatCount(heroForks)}
              </span>
              <span style={styles.statChipLabel}>forks</span>
            </span>
            <span style={styles.statChip}>
              <span
                style={{color: ACCENT, display: 'inline-flex'}}
                aria-hidden="true">
                <Icon icon={ScaleIcon} size="xsm" color="inherit" />
              </span>
              <span style={styles.statChipValue}>{STATS.license}</span>
              <span style={styles.statChipLabel}>license</span>
            </span>
            <span style={styles.statChip}>
              <span
                style={{color: ACCENT, display: 'inline-flex'}}
                aria-hidden="true">
                <Icon icon={PackageIcon} size="xsm" color="inherit" />
              </span>
              <span style={styles.statChipValue}>{STATS.bundle}</span>
              <span style={styles.statChipLabel}>min+gzip</span>
            </span>
          </HStack>
          {/* Product theater: install terminal in perspective, satellites
              bobbing over it; the panel bleeds into the example band. */}
          <div style={{...styles.theaterWrap, marginTop: 'var(--spacing-4)'}}>
            <div style={styles.theaterGlow} aria-hidden="true" />
            {satellites}
            <div style={styles.theaterPanel}>
              <div style={styles.theaterToolbar} aria-hidden="true">
                <span style={styles.toolbarDot} />
                <span style={styles.toolbarDot} />
                <span style={styles.toolbarDot} />
                <span
                  style={{
                    display: 'inline-flex',
                    color: 'var(--color-text-secondary)',
                    marginLeft: 4,
                  }}>
                  <Icon icon={TerminalIcon} size="xsm" color="inherit" />
                </span>
                <span style={styles.toolbarTitle}>~ add tessera</span>
              </div>
              <div style={styles.theaterBody}>
                <TabList
                  value={packageManager}
                  onChange={value =>
                    setPackageManager(value as PackageManager)
                  }
                  size="sm"
                  aria-label="Package manager">
                  {INSTALL_COMMANDS.map(entry => (
                    <Tab key={entry.id} value={entry.id} label={entry.id} />
                  ))}
                </TabList>
                <CodeBlock
                  code={activeCommand}
                  language="bash"
                  size="sm"
                  width="100%"
                  hasCopyButton
                  onCopy={onCopyInstall}
                />
                <div aria-live="polite" style={styles.copyLive}>
                  {copiedCommand === null ? null : (
                    <>
                      <Icon icon={CheckIcon} size="xsm" color="inherit" />
                      {\`Copied "\${copiedCommand}" to your clipboard\`}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </VStack>
      </div>
    </header>
  );

  // ---- pinned release story (fixed-px sticky stage inside a fixed-px
  // wrapper — see STORY_STAGE_HEIGHT / STORY_WRAPPER_HEIGHT) ----
  const releasesStory = (
    <div
      style={{
        ...styles.storyStage,
        height: STORY_STAGE_HEIGHT,
      }}>
      <div style={{...columnStyle, width: '100%'}}>
        <div style={styles.storyGrid}>
          <div style={styles.storyRailCol}>
            <div>
              <Eyebrow label="Releases" />
            </div>
            <h2 style={{...styles.sectionHeading, fontSize: 32}}>
              Steady, semver-honest releases
            </h2>
            <p style={styles.sectionCopy}>
              A release roughly every six weeks. Breaking changes only in
              majors, always with a codemod and a migration guide.
            </p>
            <div style={styles.storySteps}>
              <div style={styles.storyTrack} aria-hidden="true">
                <div
                  style={{
                    ...styles.storyFill,
                    transform: \`scaleY(\${storyProgress.toFixed(3)})\`,
                  }}
                />
              </div>
              {RELEASES.map((release, index) => {
                const isActiveStep = storyStep === index;
                return (
                  <button
                    key={release.version}
                    type="button"
                    aria-current={isActiveStep ? 'step' : undefined}
                    style={{
                      ...styles.storyStep,
                      ...(isActiveStep ? styles.storyStepActive : null),
                      opacity: isActiveStep ? 1 : 0.55,
                    }}
                    onClick={() => jumpToStoryStep(index)}>
                    <span
                      style={{
                        ...styles.storyStepNumber,
                        ...(isActiveStep ? {color: ACCENT} : null),
                      }}>
                      {\`0\${index + 1} · \${SEMVER_BADGE[release.level].label}\`}
                    </span>
                    <span style={styles.storyStepTitle}>
                      {\`\${release.version} — \${release.title}\`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={styles.storyPanelCol}>
            {RELEASES.map((release, index) => {
              const panelState =
                index === storyStep
                  ? 'active'
                  : index < storyStep
                    ? 'past'
                    : 'future';
              const badge = SEMVER_BADGE[release.level];
              return (
                <div
                  key={release.version}
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
                  <div style={styles.storyPanelCard}>
                    <HStack gap={3} vAlign="center" wrap="wrap">
                      <span
                        style={{
                          ...styles.storyVersionNumeral,
                          ...styles.gradientInk,
                        }}>
                        {release.version}
                      </span>
                      <VStack gap={1}>
                        <Badge variant={badge.variant} label={badge.label} />
                        <Text type="supporting" color="secondary">
                          {release.date}
                        </Text>
                      </VStack>
                    </HStack>
                    <span style={{fontSize: 22, fontWeight: 700}}>
                      {release.title}
                    </span>
                    <ReleaseBullets bullets={release.bullets} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ---- footer (scheme-locked, see Color policy) ----
  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerPhone : null),
        }}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <BrandMark textColor={DARK_TEXT} />
          </StackItem>
          <Badge variant="neutral" label="v4.0.0 · MIT" />
        </HStack>
        <HStack gap={3} vAlign="center" wrap="wrap">
          {FOOTER_LINKS.map(label => (
            <button
              key={label}
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              {label}
            </button>
          ))}
        </HStack>
        <hr style={styles.footerRule} />
        <VStack gap={1}>
          <span style={{fontSize: 13, color: DARK_TEXT_SOFT}}>
            tessera is MIT licensed — free forever, for any use, with no
            relicensing surprises.
          </span>
          <span style={{fontSize: 13, color: DARK_TEXT_FAINT}}>
            © 2021–2026 the tessera contributors · built in the open by 293
            people across 41 countries
          </span>
        </VStack>
      </div>
    </footer>
  );

  return (
    <div
      ref={wrapRef}
      className={isReduced ? 'ospl-root ospl-reduced' : 'ospl-root'}
      style={{height: '100%'}}>
      <style>{OSPL_CSS}</style>
      <Layout height="fill">
        <LayoutContent padding={0}>
          <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
            {navbar}

            {hero}

            {/* Tinted example band: dot-grid texture; the hero theater
                bleeds across this boundary (see theaterOverlap). */}
            <section
              id="example"
              ref={registerSection('example')}
              style={{...styles.bandTinted, ...styles.atmosBand}}>
              <div style={styles.dotGrid} aria-hidden="true" />
              <div
                style={{
                  ...columnStyle,
                  ...bandStyle,
                  ...styles.bandContent,
                  paddingTop:
                    (bandStyle.paddingBlock as number) + theaterOverlap,
                }}>
                <ExampleSection
                  isReduced={isReduced}
                  isStacked={isStacked}
                  headingSize={headingSize}
                />
              </div>
            </section>

            {/* Release story: pinned sticky scene at wide widths; static
                stacked timeline under reduced motion / compact widths. */}
            <section
              id="releases"
              ref={node => {
                registerSection('releases')(node);
                storyRef.current = node;
              }}>
              {canStory ? (
                <div style={{height: STORY_WRAPPER_HEIGHT}}>
                  {releasesStory}
                </div>
              ) : (
                <div style={{...columnStyle, ...bandStyle, maxWidth: 860}}>
                  <ReleasesStatic
                    isReduced={isReduced}
                    headingSize={headingSize}
                  />
                </div>
              )}
            </section>

            {/* Aurora-lit tinted band: contributors 5/7 split. */}
            <section style={{...styles.bandTinted, ...styles.atmosBand}}>
              <div style={styles.atmosLayer} aria-hidden="true">
                <div
                  className="ospl-aurora-b"
                  style={{
                    ...styles.aurora,
                    width: 440,
                    height: 440,
                    top: -140,
                    right: '-10%',
                    opacity: 0.4,
                    backgroundImage: \`radial-gradient(closest-side, \${AURORA_B}, transparent 70%)\`,
                  }}
                />
                <div
                  className="ospl-aurora-c"
                  style={{
                    ...styles.aurora,
                    width: 360,
                    height: 360,
                    bottom: -120,
                    left: '-6%',
                    opacity: 0.35,
                    backgroundImage: \`radial-gradient(closest-side, \${AURORA_C}, transparent 70%)\`,
                  }}
                />
              </div>
              <div style={{...columnStyle, ...bandStyle, ...styles.bandContent}}>
                <ContributorsSection
                  isReduced={isReduced}
                  isStacked={isStacked}
                  headingSize={headingSize}
                />
              </div>
            </section>

            <section id="sponsors" ref={registerSection('sponsors')}>
              <div style={{...columnStyle, ...bandStyle}}>
                <SponsorsSection
                  isReduced={isReduced}
                  headingSize={headingSize}
                />
              </div>
            </section>

            {/* Signature scheme-locked dark band: gradient glows, grain,
                pointer spotlight, glass sparkline, used-by marquee. */}
            <section style={styles.darkBand} onPointerMove={onDarkPointerMove}>
              <div style={styles.atmosLayer} aria-hidden="true">
                <div
                  className="ospl-aurora-a"
                  style={{
                    ...styles.aurora,
                    width: 520,
                    height: 520,
                    top: -160,
                    left: '-4%',
                    opacity: 0.55,
                    backgroundImage: \`radial-gradient(closest-side, \${AURORA_A}, transparent 70%)\`,
                  }}
                />
                <div
                  className="ospl-aurora-c"
                  style={{
                    ...styles.aurora,
                    width: 440,
                    height: 440,
                    bottom: -140,
                    right: '-6%',
                    opacity: 0.5,
                    backgroundImage: \`radial-gradient(closest-side, \${AURORA_C}, transparent 70%)\`,
                  }}
                />
                <div style={styles.grain} />
              </div>
              {isReduced ? null : (
                <div style={styles.spotlight} aria-hidden="true" />
              )}
              <div
                style={{
                  ...columnStyle,
                  ...bandStyle,
                  ...styles.bandContent,
                  maxWidth: 920,
                }}>
                <GrowthSection
                  isReduced={isReduced}
                  isStarred={isStarred}
                  headingSize={headingSize}
                />
              </div>
            </section>

            <section id="community" ref={registerSection('community')}>
              <div style={{...columnStyle, ...bandStyle}}>
                <CommunitySection
                  isReduced={isReduced}
                  headingSize={headingSize}
                />
              </div>
            </section>

            {footer}
          </div>
        </LayoutContent>
      </Layout>
    </div>
  );
}
`;export{e as default};