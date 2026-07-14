var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file mobile-app-landing.tsx
 * @input Deterministic fixtures only (the fictional "Stride" habit-tracker
 *   app: hero copy with two store pseudo-badges, three phone screens
 *   (Today checklist, Streaks heat grid, Insights bar chart), three
 *   feature steps each with three proof bullets and a phone-frame
 *   vignette (schedule editor, streak-freeze callout, smart nudge
 *   notifications), a ratings summary with a 5-row histogram plus five
 *   review cards, four count-up stats, five FAQ entries, a 21x21
 *   schematic QR pattern computed from a fixed formula, and footer
 *   columns)
 * @output Awwwards-bar marketing landing page ABOUT a mobile app, staged
 *   as a composed scene rather than flat bands: a sticky navbar that is
 *   transparent at rest and condenses into a tinted color-mix blur
 *   surface after 24px of scroll (anchors smooth-scroll with scroll-spy;
 *   links collapse behind a menu button at compact widths); a product
 *   theater hero — 76px gradient-ink display type beside the cycling
 *   CSS phone (3 app screens crossfade every 3s, dots jump directly)
 *   now staged over aurora blobs + grain with a glow disc, pointer
 *   parallax/tilt, and three bobbing glass satellite cards; a pinned
 *   scroll story for the three features (sticky stage inside a ~2.6
 *   viewport container, scroll progress fills a numbered step rail and
 *   crossfades the phone vignette; steps are clickable; reduced motion
 *   and compact widths render the static stacked sequence); a ratings
 *   wall with an asymmetric 5/7 intro + a pausing marquee loop of
 *   review cards; a scheme-locked emerald stats band with glass stat
 *   cards, a pointer-tracked spotlight, and 900ms count-up tickers; a
 *   5/7 FAQ split with a sticky intro rail; and a download band whose
 *   floating QR + email-capture card deliberately crosses the section
 *   boundary into the dark footer. Every dead-end CTA fires a corner
 *   Toast; reveals stagger 70ms, rise 16px + scale .985, fire once, and
 *   render visible under reduced motion.
 * @position Page template; emitted by \`astryx template mobile-app-landing\`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy, nav condensation,
 * and the scroll-story progress; the navbar inside it is position:sticky
 * top:0. Sections alternate full-bleed atmospheric bands (aurora hero,
 * muted story band, aurora reviews, emerald dark stats, dot-grid
 * download, dark footer); each band centers its own 1120px inner column
 * with ~104px vertical rhythm at wide widths (56-72px compact). The
 * Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - Nav anchors and the "Get the app" CTA smooth-scroll the container to
 *   real section elements with a sticky-nav allowance; onScroll spies the
 *   last anchor above the fold line (aria-current on the active link) and
 *   condenses the navbar after 24px. At compact widths the links fold
 *   behind a 40px menu button whose dropdown closes on Escape, outside
 *   pointerdown, or any selection.
 * - Hero phone: setInterval advances the screen every 3000ms with a
 *   500ms opacity crossfade; the dots below jump to a screen and restart
 *   the cycle; prefers-reduced-motion disables the interval, the fade,
 *   the satellite bobs, and the pointer parallax (static first screen,
 *   dots still swap instantly).
 * - Scroll story: progress = (scrollTop - sectionTop) / (sectionHeight -
 *   viewportHeight), quantized to 0.5%; it drives the rail fill (scaleY
 *   transform) and the discrete active step; step buttons scroll the
 *   container to that step's progress window. Reduced motion and stacked
 *   widths swap to static alternating feature rows.
 * - Store pseudo-badges fire named Toasts (leaving-the-page actions);
 *   the hero's secondary CTA scrolls to the working download capture, so
 *   no hero button is dead.
 * - Stats count up 0 → target with a ~900ms ease-out cubic rAF ticker
 *   the first time the band enters the viewport; reduced motion (and
 *   rAF-less environments) snap to the fixture values. The band's
 *   spotlight follows the pointer via --mx/--my custom properties set in
 *   onPointerMove (no re-render).
 * - FAQ Collapsibles are controlled via a Set of open ids; the first
 *   entry ships open as an affordance.
 * - Both the download capture and its confirmation state work: submit
 *   validates (empty + format errors inline, role="alert") and success
 *   swaps to a "link sent" card echoing the address with a reset action.
 *
 * Color policy: token/light-dark hybrid. ONE quarantined brand accent
 * literal pair (Stride emerald, contrast math at the constant) plus
 * tints derived from the same two hex values; every glow, aurora stop,
 * gradient-ink stop, and glass hairline is a color-mix() of that pair
 * with var(--color-*) tokens — no new hues. Neutral rgba(0,0,0,…) shadow
 * tiers are depth, not palette. The stats band and footer are
 * deliberately scheme-locked dark surfaces (colorScheme:'dark' + literal
 * emerald-dark gradients) so the brand moment reads identically in both
 * app themes; DARK_* / rgba-white literals only ever sit on those locked
 * surfaces. No network images, no real store marks — store badges are
 * bordered pseudo-badges, the QR is a schematic grid, and app screens
 * are CSS/SVG compositions.
 *
 * Responsive contract (useElementWidth/useElementHeight on the scroll
 * container — the inline demo stage is ~1045px wide, so viewport media
 * queries are not used for layout):
 * - >860px: navbar shows inline anchor links + CTA.
 * - <=860px: links collapse behind the menu button dropdown.
 * - >780px: hero is split copy/theater with satellites + parallax; the
 *   feature story pins; reviews run the marquee.
 * - <=780px: hero stacks (phone centered below copy, satellites and
 *   parallax off), features render as stacked rows, reviews fall back to
 *   a wrapped grid, and the stats grid drops 4→2→1 via Grid minWidth.
 * - <=560px: display type steps to 40px, stat numerals step down, the
 *   email capture and QR card stack, store badges go full-width, and
 *   section paddings tighten. Holds at 390px in the phone artboard with
 *   no overflow-x (marquee and auroras are clipped by their bands).
 * - Tap targets: nav links, menu button, story steps, and dots-row
 *   buttons are explicit 40px/24px controls; nothing requires hover.
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
import {Button} from '@astryxdesign/core/Button';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {
  ArrowRightIcon,
  BellIcon,
  BookOpenIcon,
  BrainIcon,
  CalendarDaysIcon,
  CheckIcon,
  FlameIcon,
  FootprintsIcon,
  GlassWaterIcon,
  MailCheckIcon,
  MenuIcon,
  MoonIcon,
  PenLineIcon,
  PlayIcon,
  SendIcon,
  SmartphoneIcon,
  SnowflakeIcon,
  SparklesIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= QUARANTINED ACCENT =============
// Stride's brand emerald — the ONE sanctioned accent literal pair.
// Contrast math: #047857 on #FFFFFF ≈ 5.5:1 (AA for text and UI);
// #4ADE80 on the app's near-black dark surfaces ≈ 10:1. Glyphs painted
// ON the accent flip with it: #FFFFFF on #047857 ≈ 5.5:1 and #052E16 on
// #4ADE80 ≈ 9.8:1. Every tint, glow, aurora stop, gradient-ink stop, and
// glass hairline below is an alpha ramp or color-mix() of the same two
// hex values with tokens — not new hues.

const ACCENT = 'light-dark(#047857, #4ADE80)';
const ON_ACCENT = 'light-dark(#FFFFFF, #052E16)';
const ACCENT_TINT = 'light-dark(rgba(4, 120, 87, 0.10), rgba(74, 222, 128, 0.14))';
const ACCENT_BORDER = 'light-dark(rgba(4, 120, 87, 0.32), rgba(74, 222, 128, 0.38))';

// Accent derivations (color-mix of the quarantined pair with tokens).
const ACCENT_GLOW = \`color-mix(in srgb, \${ACCENT} 26%, transparent)\`;
const ACCENT_RING = \`color-mix(in srgb, \${ACCENT} 45%, transparent)\`;
const AURORA_TEAL = \`color-mix(in srgb, \${ACCENT} 58%, var(--color-icon-teal))\`;
const AURORA_BLUE = \`color-mix(in srgb, \${ACCENT} 40%, var(--color-icon-blue))\`;
const AURORA_GREEN = \`color-mix(in srgb, \${ACCENT} 62%, var(--color-icon-green))\`;
const INK_MID = \`color-mix(in srgb, \${ACCENT} 60%, var(--color-icon-teal))\`;
const INK_END = \`color-mix(in srgb, \${ACCENT} 42%, var(--color-icon-blue))\`;

// ============= PAINT CONSTANTS =============
// Literals below sit only on scheme-locked (colorScheme:'dark') surfaces:
// the stats band and the footer.

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(220, 252, 231, 0.80)';
const DARK_TEXT_FAINT = 'rgba(220, 252, 231, 0.58)';
const DARK_CHIP_BG = 'rgba(255, 255, 255, 0.12)';
const DARK_CHIP_BORDER = 'rgba(255, 255, 255, 0.22)';
const DARK_GLASS_BG = 'rgba(255, 255, 255, 0.07)';
const DARK_GLASS_INSET = 'inset 0 0 0 1px rgba(255, 255, 255, 0.14)';

/** Star tint rides the warning token with an explicit fallback pair. */
const STAR_COLOR = 'var(--color-warning, light-dark(#B45309, #FCD34D))';

/**
 * Depth system — shared neutral shadow tiers (black-based per the depth
 * contract; these are shadows, not palette colors).
 */
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.3)';
/** Glass hairline: 1px inset stroke mixed from accent + border tokens. */
const GLASS_INSET = \`inset 0 0 0 1px color-mix(in srgb, \${ACCENT} 14%, var(--color-border))\`;

/** Grain texture: inline SVG feTurbulence data-URI, tiled at low opacity. */
const GRAIN_URI =
  'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' ' +
  "width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.85' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' " +
  'filter=\\'url(%23g)\\'/%3E%3C/svg%3E")';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 140;

// Scoped CSS: ambient loops (aurora drift, satellite bobs, review
// marquee), reveal choreography, card lifts, CTA sheen sweeps, and the
// parallax/tilt springs — all disarmed under prefers-reduced-motion
// (reveals render visible, loops static; JS additionally swaps the
// marquee for a wrapped grid).
const SCOPE = 'mal-root';
const TEMPLATE_CSS = \`
@keyframes mal-aurora-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(64px, -44px, 0) scale(1.12); }
}
@keyframes mal-aurora-b {
  0% { transform: translate3d(0, 0, 0) scale(1.06); }
  100% { transform: translate3d(-72px, 52px, 0) scale(0.94); }
}
@keyframes mal-bob {
  0%, 100% { transform: translateY(-6px); }
  50% { transform: translateY(7px); }
}
@keyframes mal-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-50% - 10px)); }
}
.\${SCOPE} .mal-aurora-a { animation: mal-aurora-a 38s ease-in-out infinite alternate; }
.\${SCOPE} .mal-aurora-b { animation: mal-aurora-b 44s ease-in-out infinite alternate; }
.\${SCOPE} .mal-bob { animation: mal-bob 7.5s ease-in-out infinite; }
.\${SCOPE} .mal-marquee-track {
  display: flex;
  gap: 20px;
  width: max-content;
  animation: mal-marquee 52s linear infinite;
}
.\${SCOPE} .mal-marquee:hover .mal-marquee-track { animation-play-state: paused; }
.\${SCOPE} .mal-reveal {
  opacity: 0;
  transform: translateY(16px) scale(0.985);
  transition:
    opacity 0.58s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.58s cubic-bezier(0.16, 1, 0.3, 1);
}
.\${SCOPE} .mal-reveal[data-shown='true'] {
  opacity: 1;
  transform: none;
}
.\${SCOPE} .mal-lift {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.\${SCOPE} .mal-lift:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 0 1px \${ACCENT_RING},
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 24px 48px -24px rgba(0, 0, 0, 0.3);
}
.\${SCOPE} .mal-cta {
  position: relative;
  transition: transform 0.22s ease;
}
.\${SCOPE} .mal-cta:hover { transform: translateY(-1px); }
.\${SCOPE} .mal-cta:active { transform: translateY(0) scale(0.98); }
.\${SCOPE} .mal-sheen {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}
.\${SCOPE} .mal-sheen::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-130%);
  background: linear-gradient(
    105deg,
    transparent 38%,
    color-mix(in srgb, \${ON_ACCENT} 34%, transparent) 50%,
    transparent 62%
  );
  transition: transform 0.7s ease;
}
.\${SCOPE} .mal-cta:hover .mal-sheen::after { transform: translateX(130%); }
.\${SCOPE} .mal-tilt,
.\${SCOPE} .mal-parallax {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .mal-aurora-a,
  .\${SCOPE} .mal-aurora-b,
  .\${SCOPE} .mal-bob,
  .\${SCOPE} .mal-marquee-track {
    animation: none;
  }
  .\${SCOPE} .mal-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .\${SCOPE} .mal-cta,
  .\${SCOPE} .mal-lift,
  .\${SCOPE} .mal-tilt,
  .\${SCOPE} .mal-parallax {
    transition: none;
  }
  .\${SCOPE} .mal-cta:hover,
  .\${SCOPE} .mal-cta:active,
  .\${SCOPE} .mal-lift:hover {
    transform: none;
  }
  .\${SCOPE} .mal-tilt,
  .\${SCOPE} .mal-parallax {
    transform: none !important;
  }
  .\${SCOPE} .mal-sheen::after { display: none; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy, width/height measurement, nav
  // condensation, story progress, and hosts the sticky navbar.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Each band centers this inner column; bands paint full-bleed.
  inner: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
  },
  // Atmospheric band shell: clips its aurora blobs and grain.
  band: {
    position: 'relative',
    overflow: 'hidden',
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  aurora: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URI,
    opacity: 0.04,
    pointerEvents: 'none',
  },
  // ---- sticky navbar: transparent at rest, tinted blur once scrolled ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
  },
  navBarCondensed: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 84%, transparent)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: SHADOW_RAISED,
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
  navInnerCondensed: {
    minHeight: 48,
  },
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT,
    color: ON_ACCENT,
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
    backgroundColor: ACCENT_TINT,
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
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-3)',
    zIndex: 40,
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
  // ---- custom primary CTA (sheen sweep lives in the scoped CSS) ----
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingInline: 20,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    backgroundColor: ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 10px 22px -10px \${ACCENT_GLOW}, \${SHADOW_RAISED}\`,
    whiteSpace: 'nowrap',
  },
  ctaSmall: {
    height: 38,
    paddingInline: 14,
    fontSize: 14,
    borderRadius: 10,
  },
  // ---- shared display typography ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 26,
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ACCENT,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    width: 'fit-content',
    whiteSpace: 'nowrap',
  },
  sectionHeading: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionSupport: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  gradientInk: {
    backgroundImage: \`linear-gradient(92deg, \${ACCENT} 0%, \${INK_MID} 55%, \${INK_END} 100%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
  },
  heroText: {
    flex: '1.1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontWeight: 700,
    lineHeight: 1.03,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  heroSubcopy: {
    fontSize: 18,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // Store pseudo-badges: bordered two-line buttons, no real marks.
  storeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingInline: 16,
    borderRadius: 12,
    border: '1.5px solid var(--color-text-primary)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    textAlign: 'left',
    boxShadow: SHADOW_RAISED,
  },
  storeBadgeEyebrow: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  storeBadgeName: {
    display: 'block',
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  // ---- hero product theater ----
  theaterWrap: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  theaterStage: {
    position: 'relative',
    perspective: 1200,
  },
  theaterGlow: {
    position: 'absolute',
    inset: '-12% -18%',
    borderRadius: '50%',
    backgroundImage: \`radial-gradient(closest-side, \${ACCENT_GLOW}, transparent 72%)\`,
    filter: 'blur(24px)',
    pointerEvents: 'none',
  },
  satellite: {
    position: 'absolute',
    zIndex: 2,
  },
  satelliteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 16,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_FLOATING}\`,
  },
  satelliteTitle: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  },
  satelliteMeta: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  satelliteDisc: {
    width: 30,
    height: 30,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  // ---- CSS phone frame ----
  // Neutral slate bezel pair — schematic device chrome, not brand color.
  phoneFrame: {
    width: 272,
    borderRadius: 42,
    border: '6px solid light-dark(#1E293B, #475569)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`\${SHADOW_FLOATING}, 0 32px 64px -28px \${ACCENT_GLOW}\`,
    overflow: 'hidden',
    flexShrink: 0,
    boxSizing: 'content-box',
  },
  phoneFrameSmall: {
    width: 236,
    borderRadius: 36,
  },
  phoneNotch: {
    width: 96,
    height: 22,
    margin: '8px auto 0',
    borderRadius: 12,
    backgroundColor: 'light-dark(#1E293B, #475569)',
  },
  phoneScreen: {
    position: 'relative',
    height: 500,
    margin: '10px 12px 0',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
  },
  phoneScreenSmall: {
    height: 420,
  },
  phoneHomeBar: {
    width: 88,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'light-dark(#1E293B, #475569)',
    margin: '10px auto 12px',
  },
  screenLayer: {
    position: 'absolute',
    inset: 0,
    padding: 14,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    overflow: 'hidden',
  },
  dotButton: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
    transition: 'transform 200ms ease, background-color 200ms ease',
  },
  dotActive: {
    backgroundColor: ACCENT,
    transform: 'scale(1.35)',
  },
  // ---- in-screen app UI (11-13px scale) ----
  screenEyebrow: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'var(--color-text-primary)',
  },
  screenChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    paddingInline: 8,
    height: 22,
    borderRadius: 11,
    fontSize: 10.5,
    fontWeight: 600,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  screenChipNeutral: {
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  screenProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  screenProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 8px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  habitIconDisc: {
    width: 26,
    height: 26,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  habitName: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  habitStreak: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 10.5,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  habitRing: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    border: '2px solid var(--color-border)',
  },
  habitRingDone: {
    border: 'none',
    backgroundColor: ACCENT,
    color: ON_ACCENT,
  },
  habitRingPartial: {
    borderColor: ACCENT_BORDER,
  },
  heatCell: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    position: 'relative',
    overflow: 'hidden',
  },
  heatFill: {
    position: 'absolute',
    inset: 0,
    backgroundColor: ACCENT,
  },
  notifCard: {
    display: 'flex',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  notifBody: {
    fontSize: 11,
    lineHeight: 1.45,
    color: 'var(--color-text-secondary)',
  },
  dayPill: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-card)',
  },
  dayPillActive: {
    border: 'none',
    backgroundColor: ACCENT,
    color: ON_ACCENT,
  },
  // ---- pinned feature story ----
  storyStage: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingTop: NAV_ALLOWANCE,
  },
  storyGrid: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    width: '100%',
  },
  storyRail: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  storyTheater: {
    flex: '7 1 0',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  storySteps: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  storySpine: {
    position: 'absolute',
    left: 16,
    top: 22,
    bottom: 22,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  storySpineFill: {
    position: 'absolute',
    inset: 0,
    backgroundColor: ACCENT,
    transformOrigin: 'top',
    transition: 'transform 120ms linear',
  },
  stepButton: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    minHeight: 44,
    padding: '10px 0',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
  },
  stepNum: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
    transition:
      'background-color 250ms ease, color 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
  },
  stepNumActive: {
    border: '1px solid transparent',
    backgroundColor: ACCENT,
    color: ON_ACCENT,
    boxShadow: \`0 0 0 4px \${ACCENT_TINT}\`,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'var(--color-text-primary)',
    transition: 'opacity 250ms ease',
  },
  stepKicker: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  storyCopyPanel: {
    position: 'relative',
    minHeight: 210,
    marginTop: 4,
  },
  storyCopyLayer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    transition: 'opacity 350ms ease',
  },
  // ---- static feature rows (reduced-motion / compact fallback) ----
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
  bulletDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  // ---- ratings wall ----
  reviewsSplit: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-end',
  },
  reviewsSplitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  ratingCard: {
    borderRadius: 24,
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_RAISED}\`,
  },
  ratingBig: {
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
  histTrack: {
    flex: '1 1 0',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  histFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: STAR_COLOR,
  },
  marquee: {
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
    paddingBlock: 8,
  },
  reviewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    borderRadius: 20,
    padding: 'var(--spacing-5)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_RAISED}\`,
    boxSizing: 'border-box',
  },
  reviewCardMarquee: {
    width: 320,
    flexShrink: 0,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 700,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  // ---- stats band (scheme-locked emerald dark; the signature dark
  // section: gradient glows + glass cards + pointer spotlight) ----
  statsBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 90% at 85% 0%, rgba(74, 222, 128, 0.24), transparent 55%)',
      'radial-gradient(50% 70% at 8% 100%, rgba(74, 222, 128, 0.14), transparent 60%)',
      'linear-gradient(135deg, #022C22 0%, #064E3B 100%)',
    ].join(', '),
  },
  statsSpotlight: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(420px circle at var(--mx, 75%) var(--my, 20%), rgba(74, 222, 128, 0.16), transparent 70%)',
    pointerEvents: 'none',
  },
  statsSplit: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  statsSplitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  statsHeadline: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.06,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    borderRadius: 20,
    padding: 'var(--spacing-5)',
    backgroundColor: DARK_GLASS_BG,
    boxShadow: \`\${DARK_GLASS_INSET}, 0 24px 48px -24px rgba(0, 0, 0, 0.45)\`,
  },
  statValue: {
    fontSize: 54,
    fontWeight: 700,
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
  statValueCompact: {
    fontSize: 38,
  },
  darkChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: DARK_CHIP_BG,
    border: \`1px solid \${DARK_CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // ---- FAQ (5/7 split, sticky intro rail) ----
  faqSplit: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  faqSplitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  faqRail: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  faqRailSticky: {
    position: 'sticky',
    top: NAV_ALLOWANCE + 24,
  },
  faqList: {
    flex: '7 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  faqItemCard: {
    borderRadius: 16,
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_RAISED}\`,
  },
  // ---- download band (dot-grid texture; card crosses into footer) ----
  downloadBand: {
    position: 'relative',
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    backgroundImage:
      'radial-gradient(var(--color-border) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  },
  downloadCard: {
    position: 'relative',
    zIndex: 2,
    borderRadius: 24,
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_FLOATING}\`,
  },
  qrCard: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
  },
  qrCardStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  qrTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
  },
  qrGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(21, 7px)',
    gridTemplateRows: 'repeat(21, 7px)',
    gap: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'light-dark(#FFFFFF, #F8FAFC)',
    border: '1px solid var(--color-border)',
  },
  qrModule: {
    borderRadius: 1,
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    maxWidth: 440,
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
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  // ---- footer (scheme-locked dark; hosts the overlapping card) ----
  footer: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#03241B',
    backgroundImage:
      'radial-gradient(60% 40% at 50% 0%, rgba(74, 222, 128, 0.10), transparent 70%)',
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
  footerStoreBadge: {
    border: \`1.5px solid \${DARK_CHIP_BORDER}\`,
    backgroundColor: 'transparent',
    color: DARK_TEXT,
    boxShadow: 'none',
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
// Deterministic fixtures for the fictional Stride habit tracker.
// No Date.now, no randomness, no network assets, no real store marks.

const BRAND = {
  name: 'Stride',
  tagline: 'The habit tracker that forgives',
};

type SectionId = 'features' | 'reviews' | 'faq' | 'download';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'features', label: 'Features'},
  {id: 'reviews', label: 'Reviews'},
  {id: 'faq', label: 'FAQ'},
  {id: 'download', label: 'Download'},
];

const HERO = {
  kicker: 'Habit tracking for humans',
  headlineStart: 'Small steps,',
  headlineInk: 'kept daily',
  subcopy:
    'Stride turns "I should really…" into a 47-day streak. Check off ' +
    'habits in one tap, protect streaks with earned freezes, and let ' +
    'smart nudges land when you actually have a free minute.',
  finePrint: 'Free to start · no account required · iPhone & Android',
};

const STORE_BADGES: readonly {
  id: string;
  eyebrow: string;
  name: string;
  icon: Glyph;
}[] = [
  {id: 'ios', eyebrow: 'Download for', name: 'iPhone', icon: SmartphoneIcon},
  {id: 'android', eyebrow: 'Download for', name: 'Android', icon: PlayIcon},
];

// ---- hero phone screens ----

const SCREENS: readonly {id: string; label: string}[] = [
  {id: 'today', label: 'Today checklist'},
  {id: 'streaks', label: 'Streaks heat map'},
  {id: 'insights', label: 'Monthly insights'},
];

const SCREEN_CYCLE_MS = 3000;

interface HabitFixture {
  id: string;
  name: string;
  icon: Glyph;
  streak: number;
  state: 'done' | 'partial' | 'todo';
  detail?: string;
}

const TODAY_HABITS: readonly HabitFixture[] = [
  {id: 'meditate', name: 'Meditate 10 min', icon: BrainIcon, streak: 21, state: 'done'},
  {id: 'run', name: 'Run 5k', icon: FootprintsIcon, streak: 12, state: 'done'},
  {id: 'read', name: 'Read 20 pages', icon: BookOpenIcon, streak: 47, state: 'done'},
  {id: 'water', name: 'Drink 8 glasses', icon: GlassWaterIcon, streak: 132, state: 'partial', detail: '5 / 8'},
  {id: 'journal', name: 'Journal before bed', icon: PenLineIcon, streak: 8, state: 'todo'},
];

/** 5 weeks × 7 days of completion levels (0–1) for the streak heat grid. */
const HEAT_LEVELS: readonly (readonly number[])[] = [
  [0.4, 0.8, 1, 0.6, 1, 1, 0.8],
  [1, 1, 0.6, 0.8, 1, 0.4, 1],
  [0.8, 1, 1, 1, 0.6, 1, 1],
  [1, 0.6, 0.8, 1, 1, 1, 0.4],
  [1, 1, 1, 0.8, 1, 0, 0],
];

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/** Weekly completion percentages for the insights bar chart. */
const INSIGHT_BARS: readonly number[] = [62, 80, 74, 91, 68, 84, 96];

// ---- feature story steps ----

interface FeatureRowFixture {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  bullets: readonly string[];
  icon: Glyph;
  vignette: 'schedule' | 'freeze' | 'nudges';
}

const FEATURE_ROWS: readonly FeatureRowFixture[] = [
  {
    id: 'routines',
    kicker: 'Flexible routines',
    title: 'Habits that fit real life',
    copy:
      'Not everything is daily. Schedule "Run 5k" for Monday, Wednesday, ' +
      'Friday, stack it into a morning routine, and Stride keeps score ' +
      'against your plan — not a guilt-trip calendar.',
    bullets: [
      'Any cadence — daily, weekdays, or 3× a week',
      'Morning and evening stacks group habits into one tap',
      'Reminders follow your timezone when you travel',
    ],
    icon: CalendarDaysIcon,
    vignette: 'schedule',
  },
  {
    id: 'streaks',
    kicker: 'Streak protection',
    title: 'Streaks that survive a bad day',
    copy:
      'One rough Thursday should not erase six weeks of momentum. Every ' +
      '10 completions banks a streak freeze that auto-applies the day ' +
      'you miss, and the grace window runs until 3 AM for night owls.',
    bullets: [
      'Earn one streak freeze per 10 completions — 2 banked max',
      'Night-owl grace: yesterday counts until 3:00 AM',
      'Vacation mode pauses every habit, guilt-free',
    ],
    icon: SnowflakeIcon,
    vignette: 'freeze',
  },
  {
    id: 'nudges',
    kicker: 'Nudges & widgets',
    title: 'Reminders that read the room',
    copy:
      'Stride learns that you actually read at 9:40 PM, not the 8:00 PM ' +
      'you optimistically picked, and quietly moves the nudge. The ' +
      'home-screen widget logs a habit without opening the app.',
    bullets: [
      'Smart nudges shift to when you really complete habits',
      'One-tap logging from the home-screen widget',
      'Sunday-evening digest recaps the week in 20 seconds',
    ],
    icon: BellIcon,
    vignette: 'nudges',
  },
];

// ---- ratings wall ----

const RATING_SUMMARY = {
  average: '4.9',
  count: '38,412 ratings',
  histogram: [
    {stars: 5, share: 92},
    {stars: 4, share: 6},
    {stars: 3, share: 1},
    {stars: 2, share: 0.6},
    {stars: 1, share: 0.4},
  ] as readonly {stars: number; share: number}[],
};

interface ReviewFixture {
  id: string;
  name: string;
  initials: string;
  context: string;
  stars: number;
  quote: string;
  date: string;
}

const REVIEWS: readonly ReviewFixture[] = [
  {
    id: 'amara',
    name: 'Amara O.',
    initials: 'AO',
    context: '214-day meditation streak',
    stars: 5,
    quote:
      'The streak freeze is the whole reason I still meditate. I got the flu in March, missed two days, and Stride just… handled it. No reset, no shame spiral.',
    date: 'Jun 28, 2026',
  },
  {
    id: 'diego',
    name: 'Diego R.',
    initials: 'DR',
    context: 'Runs 3× a week',
    stars: 5,
    quote:
      'Every other tracker punished me for not running daily. Stride scores me against Mon/Wed/Fri, which is the plan my knees actually agreed to.',
    date: 'Jun 14, 2026',
  },
  {
    id: 'priya',
    name: 'Priya S.',
    initials: 'PS',
    context: 'Evening routine stack',
    stars: 5,
    quote:
      'The 9:40 PM nudge thing is spooky-good. It noticed I never read at 8 and moved my reminder itself. I have finished four books since April.',
    date: 'May 30, 2026',
  },
  {
    id: 'tomas',
    name: 'Tomas K.',
    initials: 'TK',
    context: 'Widget power user',
    stars: 4,
    quote:
      'Logging water from the widget is faster than unlocking my phone. Only wish the iPad layout used the big screen better — phone app is flawless.',
    date: 'May 9, 2026',
  },
  {
    id: 'lena',
    name: 'Lena M.',
    initials: 'LM',
    context: 'Recovered from a 0-day streak',
    stars: 5,
    quote:
      'Vacation mode saved my sanity on a two-week trip. Came back to my habits paused — not a graveyard of broken streaks — and picked up day 48 like nothing happened.',
    date: 'Apr 22, 2026',
  },
];

// ---- stats band ----

interface StatFixture {
  id: string;
  target: number;
  decimals: number;
  suffix: string;
  label: string;
}

const STATS: readonly StatFixture[] = [
  {id: 'habits', target: 2.4, decimals: 1, suffix: 'M', label: 'habits tracked'},
  {id: 'countries', target: 180, decimals: 0, suffix: '', label: 'countries with an active streak'},
  {id: 'rating', target: 4.9, decimals: 1, suffix: '★', label: 'average store rating'},
  {id: 'checkins', target: 312, decimals: 0, suffix: 'M', label: 'check-ins logged'},
];

// ---- FAQ ----

const FAQ: readonly {id: string; question: string; answer: string}[] = [
  {
    id: 'free',
    question: 'Is Stride really free?',
    answer:
      'Yes — tracking up to 5 habits, streaks, freezes, and the widget are free forever. Stride Plus ($3.99/month or $29/year) adds unlimited habits, stats history beyond 12 months, and shared accountability circles. No ads on either plan.',
  },
  {
    id: 'freeze',
    question: 'How do streak freezes actually work?',
    answer:
      'Every 10 completions of a habit banks one freeze for it, up to 2 banked at a time. If you miss a scheduled day, a freeze is spent automatically at 3 AM and your streak stands. You can also spend one manually ahead of a day you know will be chaos.',
  },
  {
    id: 'privacy',
    question: 'Where does my data live?',
    answer:
      'On your phone first. Sync is end-to-end encrypted and optional — you can use Stride with no account at all. We never sell data, there is no ad SDK in the app, and export to CSV or JSON is one tap in Settings.',
  },
  {
    id: 'platforms',
    question: 'Which platforms are supported?',
    answer:
      'iPhone and Android phones today, with home-screen widgets on both. Progress syncs between devices if you enable an account. A watch complication for one-tap logging is in beta and ships with version 4.2 this fall.',
  },
  {
    id: 'friends',
    question: 'Can I track habits with friends?',
    answer:
      'Accountability circles (Stride Plus) let up to 6 people share selected habits. Friends see whether you checked in — never your notes or numbers — and a circle nudge is capped at one per day, because nagging is not a feature.',
  },
];

// ---- download band: schematic QR ----

/**
 * Deterministic schematic QR: three 7×7 finder rings plus a fixed
 * mixing formula for data modules. Decorative only (role="img").
 */
function isQrModuleDark(x: number, y: number): boolean {
  const inFinder = (cx: number, cy: number): boolean =>
    x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
  const finderDark = (cx: number, cy: number): boolean => {
    const dx = x - cx;
    const dy = y - cy;
    const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
    return ring !== 1; // outer ring + solid 3×3 core, white ring between
  };
  if (inFinder(0, 0)) {
    return finderDark(0, 0);
  }
  if (inFinder(14, 0)) {
    return finderDark(14, 0);
  }
  if (inFinder(0, 14)) {
    return finderDark(0, 14);
  }
  // Fixed pseudo-data pattern — same output every render.
  return (x * 3 + y * 7 + ((x * y) % 13)) % 5 < 2;
}

const QR_SIZE = 21;

// ---- footer ----

const FOOTER_COLUMNS: readonly {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}[] = [
  {
    id: 'app',
    heading: 'App',
    links: [
      {label: 'Features', anchor: 'features'},
      {label: 'Reviews', anchor: 'reviews'},
      {label: 'FAQ', anchor: 'faq'},
      {label: 'Download', anchor: 'download'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      {label: 'About'},
      {label: 'Blog'},
      {label: 'Press kit'},
      {label: 'Careers'},
    ],
  },
  {
    id: 'support',
    heading: 'Support',
    links: [
      {label: 'Help center'},
      {label: 'Contact us'},
      {label: 'Privacy'},
      {label: 'Terms'},
    ],
  },
];

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email and we will send the download link.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

// ============= HOOKS =============

/**
 * Page-width via ResizeObserver — the inline demo stage is ~1045px wide
 * inside a 1440px window, so viewport media queries never fire there.
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

/**
 * Page-height companion — sizes the pinned scroll-story container and
 * its sticky stage against the real scroll viewport (vh lies inside the
 * inline demo stage).
 */
function useElementHeight(ref: RefObject<HTMLDivElement | null>): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setHeight(rect.height);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return height;
}

/** True once prefers-reduced-motion matches; tracks live changes. */
function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/**
 * True once the node has intersected the viewport (15% visible); fires
 * once. Falls back to "visible" when IntersectionObserver is missing so
 * reveals and counters never strand at zero in static environments.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (node == null) {
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

/**
 * Eases 0 → target with an ease-out cubic rAF loop once \`isActive\`
 * flips true (~900ms decelerate per the micro-interaction contract).
 * Reduced motion and rAF-less environments snap to target.
 */
function useCountUp(target: number, isActive: boolean, durationMs = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return undefined;
    }
    const isReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || typeof requestAnimationFrame === 'undefined') {
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
  }, [target, isActive, durationMs]);
  return isActive && value > target ? target : value;
}

// ============= SMALL PIECES =============

/** Stride logomark: accent tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={FootprintsIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );
}

/**
 * Scroll-reveal wrapper: rise 16px + scale .985 once, 580ms decelerate
 * bezier via the scoped .mal-reveal class; stagger via transitionDelay.
 * Reduced motion renders visible immediately (CSS + JS belt-and-braces).
 */
function Reveal({
  children,
  delayMs = 0,
  style,
}: {
  children: ReactNode;
  delayMs?: number;
  style?: CSSProperties;
}) {
  const [ref, isInView] = useInView();
  const isReduced = usePrefersReducedMotion();
  return (
    <div
      ref={ref}
      className="mal-reveal"
      data-shown={isInView || isReduced}
      style={{transitionDelay: \`\${delayMs}ms\`, ...style}}>
      {children}
    </div>
  );
}

/** Tracked-uppercase accent eyebrow chip (11px, +0.08em). */
function Eyebrow({label}: {label: string}) {
  return <span style={styles.eyebrow}>{label}</span>;
}

/** Accent primary CTA with sheen sweep, 1px lift, .98 pressed scale. */
function CtaButton({
  label,
  onClick,
  isSmall,
  isFullWidth,
  icon,
}: {
  label: string;
  onClick: () => void;
  isSmall?: boolean;
  isFullWidth?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className="mal-cta"
      style={{
        ...styles.cta,
        ...(isSmall ? styles.ctaSmall : null),
        ...(isFullWidth ? {width: '100%'} : null),
      }}
      onClick={onClick}>
      <span className="mal-sheen" aria-hidden="true" />
      {label}
      {icon}
    </button>
  );
}

/** Row of five stars; \`filled\` of them lit in the warning tint. */
function StarRow({filled, size = 14}: {filled: number; size?: number}) {
  return (
    <span
      role="img"
      aria-label={\`\${filled} out of 5 stars\`}
      style={{display: 'inline-flex', gap: 2}}>
      {[1, 2, 3, 4, 5].map(position => (
        <StarIcon
          key={position}
          size={size}
          aria-hidden="true"
          style={{
            color: position <= filled ? STAR_COLOR : 'var(--color-border)',
            fill: position <= filled ? 'currentColor' : 'none',
          }}
          strokeWidth={position <= filled ? 0 : 1.5}
        />
      ))}
    </span>
  );
}

/** Bordered two-line store pseudo-badge (no real store marks). */
function StoreBadge({
  badge,
  onClick,
  isFullWidth,
  isOnDark,
}: {
  badge: (typeof STORE_BADGES)[number];
  onClick: () => void;
  isFullWidth?: boolean;
  isOnDark?: boolean;
}) {
  return (
    <button
      type="button"
      className="mal-lift"
      style={{
        ...styles.storeBadge,
        ...(isOnDark ? styles.footerStoreBadge : null),
        ...(isFullWidth ? {width: '100%', justifyContent: 'center'} : null),
      }}
      onClick={onClick}>
      <Icon icon={badge.icon} size="md" color="inherit" />
      <span>
        <span style={styles.storeBadgeEyebrow}>{badge.eyebrow}</span>
        <span style={styles.storeBadgeName}>{badge.name}</span>
      </span>
    </button>
  );
}

/** Accent check bullet used by the feature steps. */
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

// ============= PHONE FRAME + APP SCREENS =============

/** CSS phone shell: slate bezel, notch, screen well, home bar. */
function PhoneFrame({
  children,
  isSmall,
  label,
}: {
  children: ReactNode;
  isSmall?: boolean;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{...styles.phoneFrame, ...(isSmall ? styles.phoneFrameSmall : null)}}>
      <div style={styles.phoneNotch} aria-hidden="true" />
      <div
        aria-hidden="true"
        style={{
          ...styles.phoneScreen,
          ...(isSmall ? styles.phoneScreenSmall : null),
        }}>
        {children}
      </div>
      <div style={styles.phoneHomeBar} aria-hidden="true" />
    </div>
  );
}

function HabitRowMock({habit}: {habit: HabitFixture}) {
  const HabitIcon = habit.icon;
  return (
    <div style={styles.habitRow}>
      <div style={styles.habitIconDisc}>
        <HabitIcon width={14} height={14} strokeWidth={2} />
      </div>
      <div style={{flex: '1 1 0', minWidth: 0}}>
        <div style={styles.habitName}>{habit.name}</div>
        <span style={styles.habitStreak}>
          <FlameIcon size={10} strokeWidth={2} style={{color: ACCENT}} />
          {habit.streak} day streak
        </span>
      </div>
      {habit.state === 'partial' ? (
        <span style={{...styles.screenChip, ...styles.screenChipNeutral}}>
          {habit.detail}
        </span>
      ) : null}
      <div
        style={{
          ...styles.habitRing,
          ...(habit.state === 'done' ? styles.habitRingDone : null),
          ...(habit.state === 'partial' ? styles.habitRingPartial : null),
        }}>
        {habit.state === 'done' ? <CheckIcon size={13} strokeWidth={3} /> : null}
      </div>
    </div>
  );
}

/** Screen 1 — Today checklist: date, progress, five habit rows. */
function ScreenToday() {
  return (
    <>
      <div>
        <div style={styles.screenEyebrow}>Tuesday, Jul 14</div>
        <div style={styles.screenTitle}>Today</div>
      </div>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <div style={styles.screenProgressTrack}>
            <div style={{...styles.screenProgressFill, width: '60%'}} />
          </div>
        </StackItem>
        <span style={styles.screenChip}>3 of 5 done</span>
      </HStack>
      <VStack gap={2}>
        {TODAY_HABITS.map(habit => (
          <HabitRowMock key={habit.id} habit={habit} />
        ))}
      </VStack>
    </>
  );
}

/** Screen 2 — Streaks: big flame number + 5-week heat grid + freezes. */
function ScreenStreaks() {
  return (
    <>
      <div>
        <div style={styles.screenEyebrow}>Read 20 pages</div>
        <div style={styles.screenTitle}>Current streak</div>
      </div>
      <HStack gap={2} vAlign="center">
        <FlameIcon size={28} strokeWidth={2} style={{color: ACCENT}} />
        <span style={{fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em'}}>
          47 days
        </span>
      </HStack>
      <span style={{...styles.screenChip, ...styles.screenChipNeutral}}>
        Best · 63 days — Mar 2026
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
        }}>
        {DAY_LETTERS.map((letter, column) => (
          <div
            key={\`d-\${column}\`}
            style={{
              textAlign: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}>
            {letter}
          </div>
        ))}
        {HEAT_LEVELS.map((week, rowIndex) =>
          week.map((level, columnIndex) => (
            <div key={\`h-\${rowIndex}-\${columnIndex}\`} style={styles.heatCell}>
              {level > 0 ? (
                <div style={{...styles.heatFill, opacity: 0.25 + 0.75 * level}} />
              ) : null}
            </div>
          )),
        )}
      </div>
      <HStack gap={2} vAlign="center">
        <span style={styles.screenChip}>
          <SnowflakeIcon size={11} strokeWidth={2} />2 freezes banked
        </span>
        <span style={{fontSize: 10, color: 'var(--color-text-secondary)'}}>
          Less → More
        </span>
      </HStack>
    </>
  );
}

/** Screen 3 — Insights: month %, weekday bar chart, highlight chips. */
function ScreenInsights() {
  const chartWidth = 210;
  const chartHeight = 96;
  const barWidth = 20;
  const gap = (chartWidth - INSIGHT_BARS.length * barWidth) / (INSIGHT_BARS.length - 1);
  return (
    <>
      <div>
        <div style={styles.screenEyebrow}>July so far</div>
        <div style={styles.screenTitle}>86% completion</div>
      </div>
      <svg
        viewBox={\`0 0 \${chartWidth} \${chartHeight + 14}\`}
        style={{width: '100%', height: 'auto'}}>
        {INSIGHT_BARS.map((value, index) => {
          const barHeight = (value / 100) * chartHeight;
          const x = index * (barWidth + gap);
          return (
            <g key={DAY_LETTERS[index] + String(index)}>
              <rect
                x={x}
                y={chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                style={{fill: ACCENT, opacity: index === 6 ? 1 : 0.55}}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 11}
                textAnchor="middle"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fill: 'var(--color-text-secondary)',
                }}>
                {DAY_LETTERS[index]}
              </text>
            </g>
          );
        })}
      </svg>
      <VStack gap={2}>
        <span style={styles.screenChip}>
          <SparklesIcon size={11} strokeWidth={2} />
          Best day · Sunday (96%)
        </span>
        <span style={{...styles.screenChip, ...styles.screenChipNeutral}}>
          On-time rate · 91% within the nudge hour
        </span>
      </VStack>
    </>
  );
}

// ---- feature vignettes ----

/** Vignette 1 — schedule editor: cadence pills, time, stack chip. */
function VignetteSchedule() {
  const activeDays = new Set([0, 2, 4]); // M / W / F
  return (
    <>
      <div>
        <div style={styles.screenEyebrow}>Edit habit</div>
        <div style={styles.screenTitle}>Run 5k</div>
      </div>
      <div>
        <div style={{...styles.screenEyebrow, marginBottom: 6}}>Repeats on</div>
        <HStack gap={1} vAlign="center">
          {DAY_LETTERS.map((letter, index) => (
            <div
              key={\`\${letter}-\${index}\`}
              style={{
                ...styles.dayPill,
                ...(activeDays.has(index) ? styles.dayPillActive : null),
              }}>
              {letter}
            </div>
          ))}
        </HStack>
      </div>
      <VStack gap={2}>
        <span style={{...styles.screenChip, ...styles.screenChipNeutral}}>
          7:00 AM · after "Wake up" alarm
        </span>
        <span style={styles.screenChip}>
          <SparklesIcon size={11} strokeWidth={2} />
          Morning stack · 3 habits
        </span>
        <span style={{...styles.screenChip, ...styles.screenChipNeutral}}>
          Counts toward plan: 3× per week
        </span>
      </VStack>
      <div style={styles.notifCard}>
        <div style={styles.habitIconDisc}>
          <CalendarDaysIcon size={14} strokeWidth={2} />
        </div>
        <div style={styles.notifBody}>
          Missing Wednesday still leaves this week on plan if you run
          Saturday — Stride rebalances automatically.
        </div>
      </div>
    </>
  );
}

/** Vignette 2 — streak freeze: intact streak + freeze receipt. */
function VignetteFreeze() {
  return (
    <>
      <div>
        <div style={styles.screenEyebrow}>Meditate 10 min</div>
        <div style={styles.screenTitle}>Streak protected</div>
      </div>
      <HStack gap={2} vAlign="center">
        <FlameIcon size={24} strokeWidth={2} style={{color: ACCENT}} />
        <span style={{fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em'}}>
          47 days
        </span>
      </HStack>
      <div style={styles.notifCard}>
        <div style={styles.habitIconDisc}>
          <SnowflakeIcon size={14} strokeWidth={2} />
        </div>
        <div style={styles.notifBody}>
          <strong style={{color: 'var(--color-text-primary)'}}>
            Streak freeze used
          </strong>
          <br />
          Thu Jul 9 — you missed the day, the streak did not.
        </div>
      </div>
      <div style={styles.notifCard}>
        <div style={styles.habitIconDisc}>
          <MoonIcon size={14} strokeWidth={2} />
        </div>
        <div style={styles.notifBody}>
          Night-owl grace: yesterday counts until 3:00 AM.
        </div>
      </div>
      <span style={styles.screenChip}>
        <SnowflakeIcon size={11} strokeWidth={2} />1 freeze banked · next at 50
        check-ins
      </span>
    </>
  );
}

/** Vignette 3 — smart nudges: notification stack + widget tile. */
function VignetteNudges() {
  return (
    <>
      <div>
        <div style={styles.screenEyebrow}>9:38 PM</div>
        <div style={styles.screenTitle}>Notifications</div>
      </div>
      <div style={styles.notifCard}>
        <div style={{...styles.logoTile, width: 26, height: 26, borderRadius: 8}}>
          <FootprintsIcon size={13} strokeWidth={2} />
        </div>
        <div style={styles.notifBody}>
          <strong style={{color: 'var(--color-text-primary)'}}>Stride</strong>
          <br />
          "Read 20 pages" usually happens around 9:40 PM — now's good.
        </div>
      </div>
      <div style={styles.notifCard}>
        <div style={{...styles.logoTile, width: 26, height: 26, borderRadius: 8}}>
          <FootprintsIcon size={13} strokeWidth={2} />
        </div>
        <div style={styles.notifBody}>
          <strong style={{color: 'var(--color-text-primary)'}}>
            Sunday digest
          </strong>
          <br />
          34 of 35 check-ins this week. Journal is carrying the team.
        </div>
      </div>
      <div>
        <div style={{...styles.screenEyebrow, marginBottom: 6}}>
          Home-screen widget
        </div>
        <div
          style={{
            ...styles.habitRow,
            backgroundColor: ACCENT_TINT,
            border: \`1px solid \${ACCENT_BORDER}\`,
          }}>
          <div style={{...styles.habitIconDisc, color: ACCENT}}>
            <GlassWaterIcon size={14} strokeWidth={2} />
          </div>
          <div style={{flex: '1 1 0'}}>
            <div style={styles.habitName}>Log water</div>
            <span style={styles.habitStreak}>5 / 8 today</span>
          </div>
          <span style={styles.screenChip}>+1 tap</span>
        </div>
      </div>
    </>
  );
}

const VIGNETTES: Record<FeatureRowFixture['vignette'], () => ReactNode> = {
  schedule: () => <VignetteSchedule />,
  freeze: () => <VignetteFreeze />,
  nudges: () => <VignetteNudges />,
};

// ---- glass stat card with count-up ----

function StatCell({
  stat,
  isActive,
  isCompact,
}: {
  stat: StatFixture;
  isActive: boolean;
  isCompact: boolean;
}) {
  const value = useCountUp(stat.target, isActive);
  const display = \`\${value.toFixed(stat.decimals)}\${stat.suffix}\`;
  const finalDisplay = \`\${stat.target.toFixed(stat.decimals)}\${stat.suffix}\`;
  return (
    <div style={styles.statCard}>
      {/* Final value announced; the animated digits are decorative. */}
      <span
        aria-label={\`\${finalDisplay} \${stat.label}\`}
        style={{
          ...styles.statValue,
          ...(isCompact ? styles.statValueCompact : null),
        }}>
        <span aria-hidden="true">{display}</span>
      </span>
      <Text type="supporting" color="inherit" style={{color: DARK_TEXT_SOFT}}>
        {stat.label}
      </Text>
    </div>
  );
}

// ============= PAGE =============

export default function MobileAppLandingTemplate() {
  // ---- responsive: measure the scroll container, not the viewport ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pageRef);
  const pageViewHeight = useElementHeight(pageRef);
  const isNavCollapsed = pageWidth > 0 && pageWidth <= 860;
  const isStacked = pageWidth > 0 && pageWidth <= 780;
  const isPhone = pageWidth > 0 && pageWidth <= 560;

  const isReducedMotion = usePrefersReducedMotion();

  // ---- navbar: condensation + menu (compact widths) ----
  const [isNavCondensed, setIsNavCondensed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll-spy ----
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- hero phone carousel ----
  const [screenIndex, setScreenIndex] = useState(0);
  const [cycleToken, setCycleToken] = useState(0);

  // ---- hero parallax: transient pointer values live on CSS vars ----
  const heroTheaterRef = useRef<HTMLDivElement | null>(null);

  // ---- pinned feature story ----
  const [storyProgress, setStoryProgress] = useState(0);

  // ---- stats band spotlight (CSS vars, no re-render) ----
  const statsBandRef = useRef<HTMLElement | null>(null);

  // ---- download capture ----
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // ---- FAQ: controlled Set; first entry ships open ----
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(() => new Set([FAQ[0].id]));

  // ---- stats band: one observer arms all four counters ----
  const [statsRef, statsInView] = useInView();

  // ---- toast: keyed so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(null);

  // Hero carousel: advance every 3s with a crossfade; reduced motion
  // pins the current (initially first) screen. Bumping cycleToken after
  // a manual dot jump restarts the timer so the jump isn't cut short.
  useEffect(() => {
    if (isReducedMotion) {
      return undefined;
    }
    const id = setInterval(() => {
      setScreenIndex(previous => (previous + 1) % SCREENS.length);
    }, SCREEN_CYCLE_MS);
    return () => clearInterval(id);
  }, [isReducedMotion, cycleToken]);

  // Menu dismisses on Escape (refocusing the trigger) and outside taps.
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
      if (nav !== null && event.target instanceof Node && !nav.contains(event.target)) {
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

  // ---- derived layout ----
  const viewHeight = pageViewHeight > 0 ? pageViewHeight : 640;
  const isStoryPinned = !isReducedMotion && !isStacked;
  const storyHeight = Math.round(viewHeight * 2.6);
  const activeStep = Math.min(2, Math.floor(storyProgress * 3));
  const isStoryPhoneSmall = viewHeight < 780;

  // Hero display type: 64-84px tiered by measured container width.
  const displaySize =
    pageWidth === 0 ? 64 : pageWidth >= 1000 ? 76 : pageWidth > 780 ? 64 : pageWidth > 560 ? 50 : 40;
  const headingSize = isPhone ? 30 : isStacked ? 32 : 38;

  // Section rhythm: 104px wide → 72/56px compact.
  const innerStyle: CSSProperties = {
    ...styles.inner,
    padding: isPhone
      ? '56px var(--spacing-4)'
      : isStacked
        ? '72px var(--spacing-5)'
        : '104px var(--spacing-6)',
  };
  const heroInnerStyle: CSSProperties = {
    ...styles.inner,
    padding: isPhone
      ? '40px var(--spacing-4) 64px'
      : isStacked
        ? '48px var(--spacing-5) 72px'
        : '56px var(--spacing-6) 108px',
  };

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

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
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  };

  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const top = container.scrollTop;
    // Navbar condenses into the tinted blur surface after 24px.
    setIsNavCondensed(top > 24);
    // Scroll-spy: last anchor above the fold line wins.
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (section != null && section.offsetTop <= top + SPY_OFFSET) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
    // Pinned story progress, quantized to 0.5% to bound re-renders.
    if (isStoryPinned) {
      const story = sectionRefs.current.features;
      if (story != null) {
        const scrollable = Math.max(1, story.offsetHeight - container.clientHeight);
        const raw = (top - story.offsetTop) / scrollable;
        const clamped = Math.min(1, Math.max(0, raw));
        const quantized = Math.round(clamped * 200) / 200;
        setStoryProgress(previous => (previous === quantized ? previous : quantized));
      }
    }
  };

  const jumpToScreen = (index: number) => {
    setScreenIndex(index);
    setCycleToken(token => token + 1);
  };

  /** Step buttons scroll the container into that step's progress window. */
  const jumpToStoryStep = (index: number) => {
    const container = pageRef.current;
    const story = sectionRefs.current.features;
    if (container === null || story === null || story === undefined) {
      return;
    }
    if (!isStoryPinned) {
      container.scrollTo({
        top: story.offsetTop - NAV_ALLOWANCE,
        behavior: isReducedMotion ? 'auto' : 'smooth',
      });
      return;
    }
    const scrollable = Math.max(1, story.offsetHeight - container.clientHeight);
    container.scrollTo({
      top: story.offsetTop + scrollable * ((index + 0.5) / 3),
      behavior: 'smooth',
    });
  };

  // Hero parallax: ±6-10px translate + gentle tilt toward the pointer,
  // written straight to CSS custom properties (no re-render); the
  // .mal-tilt/.mal-parallax classes supply the spring transition. Off
  // under reduced motion and at stacked (touch-ish) widths.
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (isReducedMotion || isStacked) {
      return;
    }
    const stage = heroTheaterRef.current;
    if (stage === null) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const hx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const hy = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    stage.style.setProperty('--hx', hx.toFixed(3));
    stage.style.setProperty('--hy', hy.toFixed(3));
  };
  const onHeroPointerLeave = () => {
    const stage = heroTheaterRef.current;
    if (stage === null) {
      return;
    }
    stage.style.setProperty('--hx', '0');
    stage.style.setProperty('--hy', '0');
  };

  // Dark-band spotlight follows the pointer via --mx/--my.
  const onStatsPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const band = statsBandRef.current;
    if (band === null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', \`\${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%\`);
    band.style.setProperty('--my', \`\${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%\`);
  };

  const submitEmail = () => {
    const error = validateEmail(emailValue);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    const trimmed = emailValue.trim();
    setConfirmedEmail(trimmed);
    setEmailValue('');
    setEmailError(null);
  };

  const toggleFaq = (id: string, isOpen: boolean) => {
    setOpenFaqs(previous => {
      const next = new Set(previous);
      if (isOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  // ============= CHROME =============

  const menuPanel = (
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
        <CtaButton
          label="Get the app"
          isFullWidth
          onClick={() => jumpToSection('download')}
        />
      </VStack>
    </div>
  );

  const navbar = (
    <nav
      ref={navRef}
      style={{...styles.navBar, ...(isNavCondensed ? styles.navBarCondensed : null)}}
      aria-label="Primary">
      <div
        style={{
          ...styles.navInner,
          ...(isNavCondensed ? styles.navInnerCondensed : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={activeSection === anchor.id ? 'true' : undefined}
                  style={{
                    ...styles.navLink,
                    ...(activeSection === anchor.id ? styles.navLinkActive : null),
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
            <CtaButton
              label="Get the app"
              isSmall
              onClick={() => jumpToSection('download')}
            />
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              style={styles.iconButton}
              onClick={() => setIsMenuOpen(previous => !previous)}>
              <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
            </button>
          </>
        ) : (
          <CtaButton label="Get the app" onClick={() => jumpToSection('download')} />
        )}
        {isMenuOpen && isNavCollapsed && menuPanel}
      </div>
    </nav>
  );

  // ============= SECTIONS =============

  // ---- hero: gradient-ink display copy + staged product theater ----
  const screenBodies = [<ScreenToday key="today" />, <ScreenStreaks key="streaks" />, <ScreenInsights key="insights" />];

  const heroTheater = (
    <div style={styles.theaterWrap}>
      <div ref={heroTheaterRef} style={styles.theaterStage}>
        <div style={styles.theaterGlow} aria-hidden="true" />
        <div
          className="mal-tilt"
          style={{
            transformStyle: 'preserve-3d',
            transform:
              'rotateY(calc(var(--hx, 0) * 5deg)) rotateX(calc(var(--hy, 0) * -4deg))',
          }}>
          <PhoneFrame label="Stride app preview cycling through the Today checklist, streak heat map, and monthly insights screens">
            {screenBodies.map((body, index) => (
              <div
                key={SCREENS[index].id}
                style={{
                  ...styles.screenLayer,
                  opacity: index === screenIndex ? 1 : 0,
                  transition: isReducedMotion ? 'none' : 'opacity 500ms ease',
                  pointerEvents: 'none',
                }}>
                {body}
              </div>
            ))}
          </PhoneFrame>
        </div>
        {/* Floating glass satellites: independent bobs (negative delays)
            + pointer parallax; decorative echoes of real app moments. */}
        {!isStacked && (
          <>
            <div
              className="mal-parallax"
              aria-hidden="true"
              style={{
                ...styles.satellite,
                top: 26,
                right: -74,
                transform:
                  'translate3d(calc(var(--hx, 0) * 10px), calc(var(--hy, 0) * 8px), 0)',
              }}>
              <div className="mal-bob" style={{...styles.satelliteCard, animationDelay: '-2s'}}>
                <div style={styles.satelliteDisc}>
                  <FlameIcon size={15} strokeWidth={2} />
                </div>
                <div>
                  <div style={styles.satelliteTitle}>47-day streak</div>
                  <div style={styles.satelliteMeta}>Longest · 63 days</div>
                </div>
              </div>
            </div>
            <div
              className="mal-parallax"
              aria-hidden="true"
              style={{
                ...styles.satellite,
                top: 208,
                left: -96,
                transform:
                  'translate3d(calc(var(--hx, 0) * -8px), calc(var(--hy, 0) * -6px), 0)',
              }}>
              <div className="mal-bob" style={{...styles.satelliteCard, animationDelay: '-5s'}}>
                <div style={styles.satelliteDisc}>
                  <SnowflakeIcon size={15} strokeWidth={2} />
                </div>
                <div>
                  <div style={styles.satelliteTitle}>Freeze auto-applied</div>
                  <div style={styles.satelliteMeta}>Thu Jul 9 · streak intact</div>
                </div>
              </div>
            </div>
            <div
              className="mal-parallax"
              aria-hidden="true"
              style={{
                ...styles.satellite,
                bottom: 66,
                right: -58,
                transform:
                  'translate3d(calc(var(--hx, 0) * 7px), calc(var(--hy, 0) * -9px), 0)',
              }}>
              <div className="mal-bob" style={{...styles.satelliteCard, animationDelay: '-3.5s'}}>
                <div style={styles.satelliteDisc}>
                  <BellIcon size={15} strokeWidth={2} />
                </div>
                <div>
                  <div style={styles.satelliteTitle}>Now's a good minute</div>
                  <div style={styles.satelliteMeta}>Read 20 pages · 9:40 PM</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <HStack gap={0} vAlign="center" hAlign="center">
        {SCREENS.map((screen, index) => (
          <button
            key={screen.id}
            type="button"
            aria-label={\`Show screen: \${screen.label}\`}
            aria-pressed={index === screenIndex}
            style={styles.dotButton}
            onClick={() => jumpToScreen(index)}>
            <span
              style={{
                ...styles.dot,
                ...(index === screenIndex ? styles.dotActive : null),
              }}
            />
          </button>
        ))}
      </HStack>
    </div>
  );

  const hero = (
    <header
      style={styles.band}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {/* Aurora field + grain: the hero's composed atmosphere. */}
      <div
        className="mal-aurora-a"
        aria-hidden="true"
        style={{
          ...styles.aurora,
          width: 520,
          height: 520,
          top: -180,
          left: -140,
          opacity: 0.5,
          backgroundImage: \`radial-gradient(circle at 35% 35%, \${AURORA_TEAL}, transparent 70%)\`,
        }}
      />
      <div
        className="mal-aurora-b"
        aria-hidden="true"
        style={{
          ...styles.aurora,
          width: 460,
          height: 460,
          top: 60,
          right: -160,
          opacity: 0.4,
          backgroundImage: \`radial-gradient(circle at 60% 40%, \${AURORA_BLUE}, transparent 70%)\`,
        }}
      />
      <div style={styles.grainOverlay} aria-hidden="true" />
      <div style={heroInnerStyle}>
        <div style={{...styles.heroRow, ...(isStacked ? styles.heroRowStacked : null)}}>
          <div style={styles.heroText}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Eyebrow label={HERO.kicker} />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 26,
                  paddingInline: 10,
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background-card)',
                }}>
                <StarIcon
                  size={12}
                  aria-hidden="true"
                  style={{color: STAR_COLOR, fill: 'currentColor'}}
                  strokeWidth={0}
                />
                4.9 · 38k ratings
              </span>
            </HStack>
            <h1 style={{...styles.heroHeadline, fontSize: displaySize}}>
              {HERO.headlineStart}{' '}
              <span style={styles.gradientInk}>{HERO.headlineInk}</span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            <HStack gap={2} vAlign="center" wrap="wrap">
              {STORE_BADGES.map(badge => (
                <StoreBadge
                  key={badge.id}
                  badge={badge}
                  isFullWidth={isPhone}
                  onClick={() =>
                    fireToast(\`Store badge — opening the \${badge.name} listing.\`)
                  }
                />
              ))}
            </HStack>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                label="Email me the link"
                variant="ghost"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('download')}
              />
              <Text type="supporting" color="secondary">
                {HERO.finePrint}
              </Text>
            </HStack>
          </div>
          {heroTheater}
        </div>
      </div>
    </header>
  );

  // ---- features: pinned scroll story (sticky stage inside a ~2.6
  // viewport container); reduced motion / stacked widths get the static
  // stacked sequence instead ----
  const featureHeadingBlock = (
    <>
      <Eyebrow label="Why Stride" />
      <h2 style={{...styles.sectionHeading, fontSize: headingSize}}>
        Built for the days you almost skip
      </h2>
    </>
  );

  const featuresPinned = (
    <section
      ref={registerSection('features')}
      aria-label="Features"
      // No overflow:hidden here — it would turn this section into the
      // sticky element's scrollport and un-pin the stage.
      style={{...styles.bandMuted, position: 'relative', height: storyHeight}}>
      <div style={{...styles.storyStage, height: viewHeight}}>
        <div style={{...styles.inner, paddingInline: 'var(--spacing-6)'}}>
          <div style={styles.storyGrid}>
            <div style={styles.storyRail}>
              {featureHeadingBlock}
              <div style={styles.storySteps} role="list" aria-label="Feature steps">
                <div style={styles.storySpine} aria-hidden="true">
                  <div
                    style={{
                      ...styles.storySpineFill,
                      transform: \`scaleY(\${storyProgress})\`,
                    }}
                  />
                </div>
                {FEATURE_ROWS.map((row, index) => (
                  <button
                    key={row.id}
                    type="button"
                    role="listitem"
                    aria-current={index === activeStep ? 'true' : undefined}
                    style={styles.stepButton}
                    onClick={() => jumpToStoryStep(index)}>
                    <span
                      style={{
                        ...styles.stepNum,
                        ...(index <= activeStep ? styles.stepNumActive : null),
                      }}>
                      {index + 1}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        opacity: index === activeStep ? 1 : 0.55,
                        transition: 'opacity 250ms ease',
                      }}>
                      <span style={styles.stepKicker}>{row.kicker}</span>
                      <span style={styles.stepTitle}>{row.title}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div style={styles.storyCopyPanel}>
                {FEATURE_ROWS.map((row, index) => (
                  <div
                    key={row.id}
                    aria-hidden={index !== activeStep}
                    style={{
                      ...styles.storyCopyLayer,
                      opacity: index === activeStep ? 1 : 0,
                      pointerEvents: index === activeStep ? 'auto' : 'none',
                    }}>
                    <Text type="body" color="secondary">
                      {row.copy}
                    </Text>
                    <VStack gap={2}>
                      {row.bullets.map(bullet => (
                        <CheckBullet key={bullet} label={bullet} />
                      ))}
                    </VStack>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.storyTheater}>
              <div style={{position: 'relative'}}>
                <div style={styles.theaterGlow} aria-hidden="true" />
                <PhoneFrame
                  isSmall={isStoryPhoneSmall}
                  label={\`Stride feature vignette: \${FEATURE_ROWS[activeStep].title}\`}>
                  {FEATURE_ROWS.map((row, index) => (
                    <div
                      key={row.id}
                      style={{
                        ...styles.screenLayer,
                        opacity: index === activeStep ? 1 : 0,
                        transition: 'opacity 400ms ease',
                        pointerEvents: 'none',
                      }}>
                      {VIGNETTES[row.vignette]()}
                    </div>
                  ))}
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const featuresStatic = (
    <section
      ref={registerSection('features')}
      aria-label="Features"
      style={{...styles.band, ...styles.bandMuted}}>
      <div style={innerStyle}>
        <VStack gap={isStacked ? 6 : 8}>
          <Reveal>
            <VStack gap={3} hAlign="center">
              {featureHeadingBlock}
              <p style={{...styles.sectionSupport, textAlign: 'center'}}>
                Three ideas carry the whole app: flexible plans, forgiving
                streaks, and nudges with manners.
              </p>
            </VStack>
          </Reveal>
          {FEATURE_ROWS.map((row, index) => (
            <Reveal key={row.id} delayMs={isStacked ? 0 : 80}>
              <div
                style={{
                  ...styles.featureRow,
                  ...(index % 2 === 1 ? styles.featureRowReversed : null),
                  ...(isStacked ? styles.featureRowStacked : null),
                }}>
                <div style={styles.featureText}>
                  <Eyebrow label={row.kicker} />
                  <h3
                    style={{
                      fontSize: isPhone ? 22 : 26,
                      fontWeight: 700,
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}>
                    {row.title}
                  </h3>
                  <Text type="body" color="secondary">
                    {row.copy}
                  </Text>
                  <VStack gap={2}>
                    {row.bullets.map(bullet => (
                      <CheckBullet key={bullet} label={bullet} />
                    ))}
                  </VStack>
                </div>
                <div
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                  <PhoneFrame isSmall label={\`Stride app vignette: \${row.title}\`}>
                    <div style={styles.screenLayer}>{VIGNETTES[row.vignette]()}</div>
                  </PhoneFrame>
                </div>
              </div>
            </Reveal>
          ))}
        </VStack>
      </div>
    </section>
  );

  const features = isStoryPinned ? featuresPinned : featuresStatic;

  // ---- ratings wall: asymmetric intro split + marquee loop ----
  const renderReviewCard = (review: ReviewFixture, isMarquee: boolean) => (
    <div
      key={review.id}
      className="mal-lift"
      style={{
        ...styles.reviewCard,
        ...(isMarquee ? styles.reviewCardMarquee : null),
      }}>
      <HStack gap={2} vAlign="center">
        <div style={styles.reviewAvatar} aria-hidden="true">
          {review.initials}
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              {review.name}
            </Text>
            <Text type="supporting" color="secondary">
              {review.context}
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <StarRow filled={review.stars} />
      <Text type="body" color="secondary">
        “{review.quote}”
      </Text>
      <Text type="supporting" color="secondary">
        {review.date}
      </Text>
    </div>
  );

  const ratingSummaryCard = (
    <div style={styles.ratingCard}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <span style={{...styles.ratingBig, ...(isPhone ? {fontSize: 48} : null)}}>
            {RATING_SUMMARY.average}
          </span>
          <VStack gap={1}>
            <StarRow filled={5} size={16} />
            <Text type="supporting" color="secondary">
              {RATING_SUMMARY.count}
            </Text>
          </VStack>
        </HStack>
        <VStack gap={1}>
          {RATING_SUMMARY.histogram.map(row => (
            <HStack key={row.stars} gap={2} vAlign="center">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  width: 20,
                  color: 'var(--color-text-secondary)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {row.stars}★
              </span>
              <div style={styles.histTrack}>
                <div
                  style={{
                    ...styles.histFill,
                    width: \`\${Math.max(row.share, 1)}%\`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  width: 34,
                  textAlign: 'right',
                  color: 'var(--color-text-secondary)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {row.share}%
              </span>
            </HStack>
          ))}
        </VStack>
        <Text type="supporting" color="secondary">
          Rating summary across both app stores, trailing 12 months.
        </Text>
      </VStack>
    </div>
  );

  const isMarqueeMode = !isReducedMotion && !isStacked;

  const reviews = (
    <section ref={registerSection('reviews')} aria-label="Reviews" style={styles.band}>
      <div
        className="mal-aurora-b"
        aria-hidden="true"
        style={{
          ...styles.aurora,
          width: 480,
          height: 480,
          top: '28%',
          left: -200,
          opacity: 0.35,
          backgroundImage: \`radial-gradient(circle at 55% 45%, \${AURORA_GREEN}, transparent 70%)\`,
        }}
      />
      <div style={innerStyle}>
        <VStack gap={5}>
          <Reveal>
            <div
              style={{
                ...styles.reviewsSplit,
                ...(isStacked ? styles.reviewsSplitStacked : null),
              }}>
              <div
                style={{
                  flex: '6 1 0',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-3)',
                }}>
                <Eyebrow label="Reviews" />
                <h2 style={{...styles.sectionHeading, fontSize: headingSize}}>
                  4.9 stars, earned one streak at a time
                </h2>
                <p style={styles.sectionSupport}>
                  Pulled from this month's store reviews — freezes, flexible
                  plans, and the widget come up a lot.
                </p>
              </div>
              <div style={{flex: '5 1 0', minWidth: 0}}>{ratingSummaryCard}</div>
            </div>
          </Reveal>
          {isMarqueeMode ? (
            <Reveal delayMs={80}>
              {/* Marquee loop: 52s, pauses on hover; duplicate run is
                  aria-hidden. Reduced motion / compact swap to the grid. */}
              <div className="mal-marquee" style={styles.marquee}>
                <div className="mal-marquee-track">
                  {REVIEWS.map(review => renderReviewCard(review, true))}
                  <div aria-hidden="true" style={{display: 'contents'}}>
                    {REVIEWS.map(review => (
                      <div key={\`\${review.id}-dup\`} style={{display: 'contents'}}>
                        {renderReviewCard(review, true)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <Grid columns={{minWidth: 280, max: 3}} gap={3}>
              {REVIEWS.map((review, index) => (
                <Reveal key={review.id} delayMs={index * 70}>
                  {renderReviewCard(review, false)}
                </Reveal>
              ))}
            </Grid>
          )}
        </VStack>
      </div>
    </section>
  );

  // ---- stats band: the signature scheme-locked dark section — emerald
  // gradient glows, glass stat cards, grain, and a pointer spotlight ----
  const statsBand = (
    <section
      ref={statsBandRef}
      aria-label="Stride by the numbers"
      style={styles.statsBand}
      onPointerMove={onStatsPointerMove}>
      <div style={styles.statsSpotlight} aria-hidden="true" />
      <div style={{...styles.grainOverlay, opacity: 0.05}} aria-hidden="true" />
      <div ref={statsRef} style={innerStyle}>
        <div
          style={{
            ...styles.statsSplit,
            ...(isStacked ? styles.statsSplitStacked : null),
          }}>
          <div
            style={{
              flex: '5 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
            }}>
            <span style={styles.darkChip}>
              <FlameIcon size={14} strokeWidth={2} />
              Stride by the numbers
            </span>
            <h2 style={{...styles.statsHeadline, ...(isPhone ? {fontSize: 32} : null)}}>
              Momentum, measured nightly
            </h2>
            <Text type="supporting" color="inherit" style={{color: DARK_TEXT_FAINT}}>
              Counted nightly · updated Jul 12, 2026
            </Text>
          </div>
          <div style={{flex: '7 1 0', minWidth: 0}}>
            <Grid columns={{minWidth: isPhone ? 200 : 220, max: 2}} gap={3}>
              {STATS.map(stat => (
                <StatCell
                  key={stat.id}
                  stat={stat}
                  isActive={statsInView}
                  isCompact={isPhone}
                />
              ))}
            </Grid>
          </div>
        </div>
      </div>
    </section>
  );

  // ---- FAQ: 5/7 split with a sticky intro rail ----
  const faq = (
    <section ref={registerSection('faq')} aria-label="Frequently asked questions">
      <div style={innerStyle}>
        <div style={{...styles.faqSplit, ...(isStacked ? styles.faqSplitStacked : null)}}>
          <div
            style={{
              ...styles.faqRail,
              ...(isStacked ? null : styles.faqRailSticky),
            }}>
            <Reveal>
              <VStack gap={3}>
                <Eyebrow label="FAQ" />
                <h2 style={{...styles.sectionHeading, fontSize: headingSize}}>
                  Before you download
                </h2>
                <p style={styles.sectionSupport}>
                  The five questions every new Strider asks, answered without
                  fine print.
                </p>
                <div>
                  <Button
                    label="Still curious? Talk to us"
                    variant="ghost"
                    icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                    onClick={() => fireToast('Support — opening the help center.')}
                  />
                </div>
              </VStack>
            </Reveal>
          </div>
          <div style={styles.faqList}>
            {FAQ.map((entry, index) => (
              <Reveal key={entry.id} delayMs={index * 70}>
                <div className="mal-lift" style={styles.faqItemCard}>
                  <Collapsible
                    isOpen={openFaqs.has(entry.id)}
                    onOpenChange={isOpen => toggleFaq(entry.id, isOpen)}
                    trigger={entry.question}>
                    <div style={{padding: 'var(--spacing-2) 0 var(--spacing-2)'}}>
                      <Text type="body" color="secondary">
                        {entry.answer}
                      </Text>
                    </div>
                  </Collapsible>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // ---- download band: QR + email capture card that crosses the
  // section boundary into the dark footer ----
  const emailCapture =
    confirmedEmail !== null ? (
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.successDisc}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text weight="semibold">Link sent — check your phone</Text>
            <Text type="supporting" color="secondary">
              We emailed a download link to {confirmedEmail}. It expires in 24
              hours.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Use a different email"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmedEmail(null)}
        />
      </HStack>
    ) : (
      <VStack gap={1}>
        <div style={{...styles.emailRow, ...(isPhone ? styles.emailRowStacked : null)}}>
          <div style={styles.emailInput}>
            <TextInput
              label="Email for the download link"
              isLabelHidden
              placeholder="you@example.com"
              value={emailValue}
              onChange={value => {
                setEmailValue(value);
                setEmailError(null);
              }}
            />
          </div>
          <CtaButton
            label="Email me the link"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            onClick={submitEmail}
            isFullWidth={isPhone}
          />
        </div>
        {emailError !== null && (
          <p style={styles.emailError} role="alert">
            {emailError}
          </p>
        )}
        <Text type="supporting" color="secondary">
          One email with the link — no newsletter, no follow-ups.
        </Text>
      </VStack>
    );

  const download = (
    <section
      ref={registerSection('download')}
      aria-label="Download Stride"
      style={styles.downloadBand}>
      <div style={{...innerStyle, paddingBottom: 0}}>
        <VStack gap={4}>
          <Reveal>
            <VStack gap={3} hAlign="center">
              <Eyebrow label="Download" />
              <h2
                style={{
                  ...styles.sectionHeading,
                  fontSize: headingSize,
                  textAlign: 'center',
                }}>
                Get Stride on your phone
              </h2>
              <p style={{...styles.sectionSupport, textAlign: 'center'}}>
                Scan the code with your camera, or send yourself a link — day 1
                of the streak starts tonight.
              </p>
            </VStack>
          </Reveal>
          <Reveal delayMs={80}>
            {/* Floating card: negative margin drops it across the band
                boundary onto the footer's dark surface. */}
            <div
              style={{
                ...styles.downloadCard,
                marginBottom: isStacked ? -56 : -84,
              }}>
              <div style={{...styles.qrCard, ...(isPhone ? styles.qrCardStacked : null)}}>
                <div style={styles.qrTile}>
                  {/* Schematic QR: fixed pattern, decorative stand-in. */}
                  <div
                    style={styles.qrGrid}
                    role="img"
                    aria-label="Schematic QR code linking to the Stride download page">
                    {Array.from({length: QR_SIZE * QR_SIZE}, (_, cell) => {
                      const x = cell % QR_SIZE;
                      const y = Math.floor(cell / QR_SIZE);
                      return (
                        <div
                          key={cell}
                          style={{
                            ...styles.qrModule,
                            // Locked dark modules on the locked white
                            // tile — a QR must not reflow with theme.
                            backgroundColor: isQrModuleDark(x, y)
                              ? '#0F172A'
                              : 'transparent',
                          }}
                        />
                      );
                    })}
                  </div>
                  <Text type="supporting" color="secondary">
                    Point your camera here
                  </Text>
                </div>
                <StackItem size="fill">
                  <VStack gap={3}>
                    <h3
                      style={{
                        fontSize: isPhone ? 22 : 26,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                        margin: 0,
                      }}>
                      Or email yourself the link
                    </h3>
                    <Text type="body" color="secondary">
                      Reading this on a laptop? Drop your address and open the
                      link from your phone — it routes to the right store
                      automatically.
                    </Text>
                    {emailCapture}
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      {STORE_BADGES.map(badge => (
                        <StoreBadge
                          key={badge.id}
                          badge={badge}
                          isFullWidth={isPhone}
                          onClick={() =>
                            fireToast(
                              \`Store badge — opening the \${badge.name} listing.\`,
                            )
                          }
                        />
                      ))}
                    </HStack>
                  </VStack>
                </StackItem>
              </div>
            </div>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ---- footer (scheme-locked dark; clears the overlapping card) ----
  const footer = (
    <footer style={styles.footer}>
      <div style={{...innerStyle, paddingTop: isStacked ? 120 : 160}}>
        <VStack gap={5}>
          <HStack gap={6} vAlign="start" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <div style={styles.logoTile} aria-hidden="true">
                    <Icon icon={FootprintsIcon} size="sm" color="inherit" />
                  </div>
                  <Text type="label" color="inherit">
                    {BRAND.name}
                  </Text>
                </HStack>
                <Text
                  type="supporting"
                  color="inherit"
                  style={{color: DARK_TEXT_FAINT, maxWidth: 300}}>
                  {BRAND.tagline}. Built by a four-person team in Porto;
                  funded by Plus subscriptions, not your data.
                </Text>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  {STORE_BADGES.map(badge => (
                    <StoreBadge
                      key={badge.id}
                      badge={badge}
                      isOnDark
                      onClick={() =>
                        fireToast(\`Store badge — opening the \${badge.name} listing.\`)
                      }
                    />
                  ))}
                </HStack>
              </VStack>
            </StackItem>
            <StackItem size="fill">
              <Grid columns={{minWidth: 132, max: 3}} gap={4}>
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
                            : fireToast(
                                \`Footer — \${column.heading} / \${link.label} clicked.\`,
                              )
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
              <Text type="supporting" color="inherit" style={{color: DARK_TEXT_FAINT}}>
                © 2026 Stride Labs, Lda. All rights reserved.
              </Text>
            </StackItem>
            <span style={styles.darkChip}>
              <SparklesIcon size={13} strokeWidth={2} />
              v4.1 · 2.4M habits and counting
            </span>
          </HStack>
        </VStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Stride landing page">
            {/* Scroll container: owns scroll-spy, nav condensation, and
                story progress; the navbar inside it is sticky. */}
            <div
              ref={pageRef}
              className={SCOPE}
              style={styles.page}
              onScroll={onPageScroll}>
              <style>{TEMPLATE_CSS}</style>
              {navbar}
              {hero}
              {features}
              {reviews}
              {statsBand}
              {faq}
              {download}
              {footer}
            </div>
          </LayoutContent>
        }
      />

      {/* Interaction receipt toast: keyed so repeat clicks re-announce. */}
      {toast !== null && (
        <div style={styles.toastWrap}>
          <Toast
            key={toast.key}
            type="info"
            isAutoHide={false}
            autoHideDuration={6000}
            onDismiss={() => setToast(null)}
            body={<Text weight="semibold">{toast.message}</Text>}
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};