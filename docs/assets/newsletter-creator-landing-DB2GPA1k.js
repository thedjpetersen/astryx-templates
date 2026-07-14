var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file newsletter-creator-landing.tsx
 * @input Deterministic fixtures only (the fictional "Overshoot" weekly
 *   design-engineering newsletter: hero copy with an issue-count eyebrow,
 *   reader/open-rate proof numbers, five reader monograms, two complete
 *   sample-issue bodies — #142 and #141, each with an intro, a deep-dive
 *   section, a CSS code tip, and a five-item links list — six archive
 *   issue cards with topics and read times, six reader testimonials, a
 *   sponsor slot card with per-month availability, and an author bio)
 * @output Art-directed long-scroll landing page for a creator newsletter:
 *   a sticky navbar that starts transparent and condenses onto a tinted
 *   hairline surface after 24px of scroll (scroll-spy anchor links that
 *   collapse behind a menu button at compact widths), an aurora-lit hero
 *   theater pairing display-scale gradient-ink type and a validating
 *   subscribe capture with the signature self-drawing spring masthead
 *   card staged in perspective under floating satellite chips that bob
 *   and parallax toward the pointer, a pinned scroll-story that walks a
 *   framed sample-issue reader through its four-part anatomy on a
 *   numbered step rail (steps clickable; #142/#141 swap kept), a
 *   topic-filterable archive grid with an oversized featured card, a
 *   pause-on-hover testimonial marquee, a scheme-locked dark sponsor
 *   band with glass cards and a pointer-tracked spotlight, an author
 *   card that bleeds up across the dark band's boundary, and a minimal
 *   footer.
 * @position Page template; emitted by \`astryx template newsletter-creator-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy, the nav-condense
 * flag, and the pinned-story progress, and is measured by a
 * ResizeObserver for the responsive breakpoints; the navbar is
 * position:sticky top:0 inside it. Full-bleed bands (aurora hero, plain
 * pinned story, accent-tinted archive with a dot-grid texture, muted
 * marquee, scheme-locked dark sponsor, plain author, muted footer)
 * alternate; each centers an 1120px column with 96-128px vertical
 * rhythm at wide widths (56-72px compact).
 *
 * Interaction contract:
 * - Nav anchors (Sample issue / Archive / Readers / Sponsor) smooth-scroll
 *   the container to real section nodes with a sticky-nav allowance;
 *   onScroll spies the last anchor above the fold line (aria-current).
 *   The navbar is transparent at rest and gains a color-mix surface,
 *   hairline, shadow, and a slightly shorter row after 24px of scroll.
 *   At compact widths the links collapse behind a menu button whose
 *   dropdown closes on Escape, outside pointerdown, or selection.
 * - The hero subscribe form validates on submit (empty + format errors
 *   inline, role="alert"); success swaps to a "Check your inbox" card
 *   echoing the address, with a working "Resend" link and a "Use a
 *   different address" reset. The nav CTA scrolls back to the hero form.
 * - Signature hero moment, staged as product theater: the masthead
 *   card's spring curve draws itself on load (stroke-dash transition),
 *   the "+9% overshoot" label fades in after the draw, and a Replay
 *   button re-runs it. The card sits in a perspective wrapper ringed by
 *   three floating satellite chips (open-rate metric, issue toast,
 *   reader cluster) that bob on independent 7-9s keyframes (negative
 *   delays) and parallax ±6-12px toward the pointer (CSS vars set on
 *   pointermove; satellites and parallax are wide-width only and fully
 *   off under reduced motion).
 * - Reader/open-rate numbers count up once (~900ms decelerate) when the
 *   proof row first enters the viewport.
 * - Pinned scroll story: the sample-issue section is a ~250vh container
 *   whose sticky stage holds a numbered four-step anatomy rail (The
 *   hook / The deep dive / The code tip / Five worth your click) beside
 *   the framed, internally scrollable reader. Container scroll progress
 *   fills the rail and advances the active step, which auto-scrolls the
 *   reader to that part; steps are also clickable buttons. The masthead
 *   button still swaps the whole body between issue #142 and #141. Under
 *   reduced motion (or compact widths) the scene renders as a static
 *   stacked sequence with clickable steps.
 * - Archive topic chips (ToggleButtons with counts) live-filter the six
 *   issue cards; the first visible card renders oversized with a ghost
 *   numeral; cards raise a shadow tier with an accent glow on hover.
 * - The testimonial wall runs as a 52s marquee loop (pause on hover,
 *   duplicated track aria-hidden); reduced motion renders the static
 *   masonry columns instead.
 * - The sponsor band is scheme-locked dark (colorScheme: 'dark' flips
 *   every token via light-dark()) with aurora glows, a pointer-tracked
 *   radial spotlight (CSS vars --ncl-mx/--ncl-my), and a glass card;
 *   its "Request the sponsor kit" button flips to an inline
 *   confirmation. The author card overlaps upward across the dark
 *   band's bottom edge; its "Say hello" button reveals a mono email.
 * - Section blocks rise+fade 16px with a 0.985 scale settle exactly once
 *   when first revealed (IntersectionObserver), staggered ~70ms within
 *   grids. All motion — reveals, count-ups, the spring draw, auroras,
 *   bobbing, marquee, parallax, spotlight, smooth scrolling — is gated
 *   by prefers-reduced-motion via matchMedia AND a CSS media block:
 *   reveals render visible, counters render final, the curve renders
 *   complete, ambient layers freeze, and scrolling snaps.
 * - Deterministic fixtures only: no Date.now, no Math.random, no network
 *   assets, no real logos; only animation cadence is runtime.
 *
 * Color policy: token-pure except ONE quarantined accent literal (the
 * Overshoot signal-orange light-dark pair, contrast math at the constant).
 * Every accent tint — chips, bands, gradient ink, aurora blobs, glass
 * strokes, the avatar cluster, the author portrait — derives from that
 * single literal via color-mix against tokens, so both app themes hold
 * (the dark sponsor band simply pins colorScheme so the same tokens
 * resolve to their dark halves). Shadow tiers use neutral black alphas
 * per the shared depth spec; the grain texture is an inline SVG
 * feTurbulence data-URI.
 *
 * Responsive contract (useElementWidth ResizeObserver — the inline demo
 * stage is ~1045px wide, so viewport media queries are never used):
 * - >980px: split hero with satellites + parallax, pinned story with a
 *   left step rail, 3-column archive (featured card spans 2), marquee
 *   wall, inline nav links.
 * - 761–980px: satellites hide and parallax disarms, archive drops to 2
 *   columns, the story keeps its pinned rail, hero gap tightens.
 * - <=760px: nav links collapse behind the menu button, the hero stacks,
 *   the story unpins into a static sequence with a horizontal step row,
 *   and the sponsor and author rows stack their halves.
 * - <=560px: archive drops to 1 column, the subscribe form stacks its
 *   button under the input, display type and paddings step down, and
 *   all proof/chip rows wrap — the page holds at 390px in the phone
 *   artboard with no overflow-x (ambient layers live inside
 *   overflow-hidden bands).
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
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  MailCheckIcon,
  MailIcon,
  MenuIcon,
  QuoteIcon,
  RotateCcwIcon,
  RssIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= ACCENT (the one quarantined literal) =============
// Overshoot "signal orange" — the spring-motion brand personality.
// Contrast math: light #C2410C on #FFFFFF body = 5.35:1 (AA for text and
// UI); dark #FDBA74 on a ~#1C1C1E dark body = 9.6:1. Every other accent
// surface below derives from this ONE literal via color-mix against
// tokens, so the rest of the page stays token-pure.
const ACCENT = 'light-dark(#C2410C, #FDBA74)';

/** Accent tint helper — mixes the single accent literal into a base. */
function accentMix(percent: number, base = 'transparent'): string {
  return \`color-mix(in srgb, \${ACCENT} \${percent}%, \${base})\`;
}

const ACCENT_SOFT = accentMix(12);
const ACCENT_WASH = accentMix(6);
const ACCENT_BORDER = accentMix(32);

// Aurora blob inks: the accent mixed toward warning/accent tokens, then
// faded toward transparency — never a new literal.
const AURORA_EMBER = accentMix(55);
const AURORA_AMBER = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 55%, var(--color-warning)) 55%, transparent)\`;
const AURORA_DUSK = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 45%, var(--color-accent)) 50%, transparent)\`;

// Gradient ink for the hero key phrase — accent, warmed via color-mix.
const INK_GRADIENT = \`linear-gradient(94deg, \${ACCENT} 0%, color-mix(in srgb, \${ACCENT} 55%, var(--color-warning)) 55%, \${ACCENT} 100%)\`;

// Depth tiers (shared spec: neutral black alphas, layered).
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.3)';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 72;
const SPY_OFFSET = 140;

// Grain texture: inline SVG feTurbulence data-URI (no network assets).
const GRAIN_URL =
  'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' ' +
  "width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.9' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' " +
  "height='160' filter='url(%23n)'/%3E%3C/svg%3E\\")";

// ============= SCOPED CSS (keyframes + hover choreography) =============
// Transform/opacity only. Every ambient animation is also killed in the
// prefers-reduced-motion block below (belt and suspenders with the JS
// matchMedia gate).

const SCOPE = 'ncl-root';

const TEMPLATE_CSS = \`
@keyframes ncl-drift-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(56px, -32px, 0) scale(1.14); }
  100% { transform: translate3d(-28px, 22px, 0) scale(0.94); }
}
@keyframes ncl-drift-b {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-48px, 36px, 0) scale(1.1); }
  100% { transform: translate3d(30px, -20px, 0) scale(0.97); }
}
@keyframes ncl-bob {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -7px, 0); }
}
@keyframes ncl-marquee {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
.\${SCOPE} .ncl-aurora-a { animation: ncl-drift-a 38s ease-in-out infinite alternate; }
.\${SCOPE} .ncl-aurora-b { animation: ncl-drift-b 32s ease-in-out infinite alternate; }
.\${SCOPE} .ncl-aurora-c { animation: ncl-drift-a 44s ease-in-out infinite alternate-reverse; }
.\${SCOPE} .ncl-bob { animation: ncl-bob 7.5s ease-in-out infinite; }
.\${SCOPE} .ncl-para-a, .\${SCOPE} .ncl-para-b, .\${SCOPE} .ncl-para-c {
  transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1);
}
.\${SCOPE} .ncl-para-a { transform: translate3d(calc(var(--ncl-px, 0) * 9px), calc(var(--ncl-py, 0) * 7px), 0); }
.\${SCOPE} .ncl-para-b { transform: translate3d(calc(var(--ncl-px, 0) * -7px), calc(var(--ncl-py, 0) * 10px), 0); }
.\${SCOPE} .ncl-para-c { transform: translate3d(calc(var(--ncl-px, 0) * 12px), calc(var(--ncl-py, 0) * -6px), 0); }
.\${SCOPE} .ncl-tilt {
  transform: rotateX(calc(var(--ncl-py, 0) * -2.4deg)) rotateY(calc(var(--ncl-px, 0) * 3.2deg));
  transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1);
}
.\${SCOPE} .ncl-cta { position: relative; display: inline-flex; transition: transform 220ms ease; }
.\${SCOPE} .ncl-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  pointer-events: none;
  background-image: linear-gradient(115deg, transparent 32%, color-mix(in srgb, var(--color-on-accent) 32%, transparent) 50%, transparent 68%);
  background-size: 260% 100%;
  background-position: 130% 0;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 260ms ease, background-position 720ms ease;
}
.\${SCOPE} .ncl-cta:hover { transform: translateY(-1px); }
.\${SCOPE} .ncl-cta:hover::after { opacity: 1; background-position: -40% 0; }
.\${SCOPE} .ncl-cta:active { transform: translateY(0) scale(0.98); }
.\${SCOPE} .ncl-raise {
  height: 100%;
  border-radius: var(--radius-container, 12px);
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease;
  box-shadow: \${SHADOW_RAISED};
}
.\${SCOPE} .ncl-raise:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING};
}
.\${SCOPE} .ncl-marquee { display: flex; width: max-content; animation: ncl-marquee 52s linear infinite; }
.\${SCOPE} .ncl-marquee-wrap:hover .ncl-marquee { animation-play-state: paused; }
.\${SCOPE} .ncl-marquee-half { display: flex; gap: 16px; padding-right: 16px; }
.\${SCOPE} .ncl-spot {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(480px circle at var(--ncl-mx, 62%) var(--ncl-my, 30%), \${accentMix(
    14,
  )}, transparent 70%);
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .ncl-aurora-a, .\${SCOPE} .ncl-aurora-b, .\${SCOPE} .ncl-aurora-c,
  .\${SCOPE} .ncl-bob, .\${SCOPE} .ncl-marquee { animation: none; }
  .\${SCOPE} .ncl-para-a, .\${SCOPE} .ncl-para-b, .\${SCOPE} .ncl-para-c,
  .\${SCOPE} .ncl-tilt { transform: none; transition: none; }
  .\${SCOPE} .ncl-cta, .\${SCOPE} .ncl-cta:hover, .\${SCOPE} .ncl-cta:active { transform: none; transition: none; }
  .\${SCOPE} .ncl-cta::after { display: none; }
  .\${SCOPE} .ncl-raise, .\${SCOPE} .ncl-raise:hover { transform: none; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy and is measured for breakpoints.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered content column; bands paint full-bleed around it.
  column: {
    position: 'relative',
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnNarrow: {
    paddingInline: 'var(--spacing-4)',
  },
  // ---- ambient layers ----
  band: {
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URL,
    opacity: 0.04,
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(var(--color-border) 1.2px, transparent 1.6px)',
    backgroundSize: '22px 22px',
    opacity: 0.55,
    maskImage:
      'radial-gradient(110% 90% at 75% 0%, black 25%, transparent 72%)',
    WebkitMaskImage:
      'radial-gradient(110% 90% at 75% 0%, black 25%, transparent 72%)',
    pointerEvents: 'none',
  },
  bandTinted: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: ACCENT_WASH,
    borderTop: \`1px solid \${ACCENT_BORDER}\`,
    borderBottom: \`1px solid \${ACCENT_BORDER}\`,
  },
  bandMuted: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
  },
  // Scheme-locked dark sponsor band: colorScheme pins every light-dark()
  // token to its dark half, so the same token vocabulary paints it.
  bandDark: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    borderTop: '1px solid var(--color-border)',
  },
  // ---- eyebrows + display type ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  eyebrowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: 'fit-content',
    height: 26,
    paddingInline: 11,
    borderRadius: 999,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: accentMix(9),
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    flexShrink: 0,
  },
  headline: {
    lineHeight: 1.04,
    letterSpacing: '-0.025em',
    fontWeight: 725,
    margin: 0,
  },
  headlineInk: {
    backgroundImage: INK_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  sectionTitle: {
    fontSize: 40,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    fontWeight: 700,
    margin: 0,
  },
  sectionTitleCompact: {
    fontSize: 30,
  },
  subcopy: {
    fontSize: 18,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // ---- sticky navbar (transparent → condensed tinted surface) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 92%, transparent)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: '0 8px 24px -18px rgba(0, 0, 0, 0.28)',
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
    minHeight: 64,
  },
  navInnerScrolled: {
    minHeight: 52,
  },
  brandTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  brandWordmark: {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
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
  // 40px icon-only control (Astryx Button caps at 36px).
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
  heroRow: {
    display: 'flex',
    gap: 48,
    alignItems: 'center',
  },
  heroRowMid: {
    gap: 'var(--spacing-5)',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
  },
  heroText: {
    flex: '1.08 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroAside: {
    flex: '0.92 1 0',
    minWidth: 0,
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
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  successCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    maxWidth: 460,
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container, 12px)',
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_SOFT,
    boxShadow: SHADOW_RAISED,
    boxSizing: 'border-box',
  },
  successDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-background-body)',
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  // Reader-proof row: overlapping monogram cluster + count-up figures.
  avatarStack: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarDisc: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-background-body)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  proofFigure: {
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- hero theater: spring masthead + satellites ----
  heroStage: {
    position: 'relative',
    perspective: 1400,
  },
  springCard: {
    position: 'relative',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    overflow: 'hidden',
  },
  springHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_WASH,
  },
  springBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  springFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: '0 var(--spacing-4) var(--spacing-3)',
  },
  satShell: {
    position: 'absolute',
    zIndex: 2,
  },
  satCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 94%, transparent)',
    boxShadow: SHADOW_FLOATING,
    whiteSpace: 'nowrap',
  },
  satGlyph: {
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
  satFigure: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  satCaption: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.3,
  },
  // ---- pinned scroll story (sample-issue anatomy) ----
  storyStage: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  storySplit: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
  },
  storyRail: {
    flex: '0 0 264px',
    minWidth: 0,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    paddingLeft: 18,
  },
  storyRailCompact: {
    flex: '1 1 auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 0,
    gap: 'var(--spacing-2)',
  },
  railTrack: {
    position: 'absolute',
    left: 5,
    top: 10,
    bottom: 10,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  railFill: {
    position: 'absolute',
    inset: 0,
    backgroundColor: ACCENT,
    transformOrigin: 'top',
    transition: 'transform 180ms linear',
  },
  stepButton: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 240ms ease, border-color 240ms ease',
  },
  stepButtonActive: {
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: accentMix(8, 'var(--color-background-card)'),
    boxShadow: SHADOW_RAISED,
  },
  stepIndex: {
    fontSize: 12,
    fontWeight: 800,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    color: ACCENT,
    lineHeight: '20px',
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.35,
    color: 'var(--color-text-primary)',
  },
  stepCopy: {
    fontSize: 13,
    lineHeight: 1.45,
    margin: 0,
    color: 'var(--color-text-secondary)',
  },
  // ---- sample-issue reader ----
  readerColumn: {
    flex: '1 1 0',
    minWidth: 0,
  },
  readerFrame: {
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    overflow: 'hidden',
  },
  readerMasthead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  readerBody: {
    position: 'relative',
    maxHeight: 440,
    overflowY: 'auto',
    padding: 'var(--spacing-5) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  readerBodyCompact: {
    padding: 'var(--spacing-4)',
    maxHeight: 420,
  },
  proseHeading: {
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  proseParagraph: {
    fontSize: 15,
    lineHeight: 1.65,
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  issueChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) 0',
  },
  linkGlyph: {
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
  // ---- archive grid ----
  issueNumber: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    color: ACCENT,
  },
  ghostNumeral: {
    position: 'absolute',
    right: 4,
    bottom: -26,
    fontSize: 128,
    fontWeight: 800,
    letterSpacing: '-0.05em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    color: accentMix(10),
    pointerEvents: 'none',
    userSelect: 'none',
  },
  // ---- testimonial marquee ----
  quoteCard: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    width: 340,
    padding: 'var(--spacing-4)',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    boxSizing: 'border-box',
  },
  marqueeWrap: {
    width: '100%',
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)',
  },
  quoteMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    flexShrink: 0,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 1.55,
    margin: 0,
  },
  // ---- dark sponsor band + author overlap ----
  glassCard: {
    position: 'relative',
    borderRadius: 20,
    padding: 'var(--spacing-6)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 55%, transparent)',
    boxShadow: \`inset 0 0 0 1px color-mix(in srgb, var(--color-border) 85%, transparent), \${SHADOW_FLOATING}\`,
    boxSizing: 'border-box',
  },
  splitRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  splitRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  splitHalf: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  rateFigure: {
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.05,
  },
  monoLine: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  authorCard: {
    position: 'relative',
    zIndex: 2,
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  authorTile: {
    width: 88,
    height: 88,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    // Hue-gradient art tile: derived entirely from the one accent literal.
    background: \`linear-gradient(135deg, \${accentMix(
      55,
      'var(--color-background-muted)',
    )} 0%, \${accentMix(16, 'var(--color-background-muted)')} 100%)\`,
    border: \`1px solid \${ACCENT_BORDER}\`,
    boxSizing: 'border-box',
  },
  // ---- footer ----
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
// Deterministic fixtures for the fictional Overshoot newsletter.
// No Date.now, no randomness, no network assets, no real publications.

const BRAND = {
  name: 'Overshoot',
  tagline: 'A weekly letter on design engineering',
};

const HERO = {
  eyebrow: 'Issue #142 · every Tuesday',
  headlineLead: 'The weekly letter for engineers who',
  headlineInk: 'sweat the last 2%',
  subcopy:
    'Every Tuesday, Overshoot dissects one production interface — the ' +
    'spring curves, the CSS tricks, the performance budgets — in a ' +
    'six-minute read you will actually finish.',
  finePrint: 'Free forever · one email a week · unsubscribe in one click',
  readers: 18204,
  openRate: 54,
};

/** Monogram cluster next to the proof figures (readers, not authors). */
const READER_MONOGRAMS: readonly {initials: string; tint: number}[] = [
  {initials: 'PR', tint: 64},
  {initials: 'MB', tint: 48},
  {initials: 'SA', tint: 34},
  {initials: 'DO', tint: 22},
  {initials: 'GL', tint: 12},
];

type SectionId = 'sample' | 'archive' | 'readers' | 'sponsor';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'sample', label: 'Sample issue'},
  {id: 'archive', label: 'Archive'},
  {id: 'readers', label: 'Readers'},
  {id: 'sponsor', label: 'Sponsor'},
];

/** The four-part anatomy every issue follows — drives the pinned rail. */
const STORY_STEPS: readonly {title: string; copy: string}[] = [
  {
    title: 'The hook',
    copy: 'One production interface, and why it feels right.',
  },
  {
    title: 'The deep dive',
    copy: 'The mechanism explained with numbers, not vibes.',
  },
  {
    title: 'The code tip',
    copy: 'A paste-ready snippet you can ship the same afternoon.',
  },
  {
    title: 'Five worth your click',
    copy: 'A hand-picked link list with honest one-line reviews.',
  },
];

interface IssueLink {
  title: string;
  source: string;
  note: string;
}

interface IssueBody {
  number: number;
  subject: string;
  date: string;
  intro: string;
  sectionOneTitle: string;
  sectionOneCopy: string;
  tipTitle: string;
  tipCopy: string;
  tipCode: string;
  tipLanguage: string;
  linksTitle: string;
  links: readonly IssueLink[];
}

const ISSUE_142: IssueBody = {
  number: 142,
  subject: 'The physics of a good toggle',
  date: 'Jul 7, 2026',
  intro:
    'A toggle is the smallest promise your product makes: touch me and ' +
    'something true changes. This week — why the switches that feel great ' +
    'are solving a physics problem, not a styling problem, and how to ' +
    'borrow the trick in about nine lines of CSS.',
  sectionOneTitle: 'Springs, not durations',
  sectionOneCopy:
    'Duration-based easing answers the wrong question. When a thumb ' +
    'flicks a switch, the finger arrives with velocity, and clamping that ' +
    'velocity to a fixed 200ms cubic-bezier is why so many toggles feel ' +
    'like they ignore you. A spring carries the momentum through: ' +
    'stiffness sets urgency, damping sets composure. Platform controls ' +
    'get away with feeling instant because almost nothing is on a timer ' +
    '— it is all mass and tension. You do not need a physics engine to ' +
    'fake it convincingly.',
  tipTitle: 'The code tip',
  tipCopy:
    'You can bake a spring into plain CSS with linear(). This curve ' +
    'overshoots by about 9% and settles in roughly 300ms — enough ' +
    'personality to feel alive, calm enough for a settings page:',
  tipCode: [
    '/* A spring that settles in ~300ms — no JS, no library. */',
    '.toggle-thumb {',
    '  transition: translate 300ms linear(',
    '    0, 0.37, 0.84, 1.09, 1.15, 1.10, 1.03, 0.99, 1',
    '  );',
    '}',
  ].join('\\n'),
  tipLanguage: 'css',
  linksTitle: 'Five worth your click',
  links: [
    {
      title: 'The browser rendering loop, illustrated',
      source: 'pixelpipeline.dev',
      note: 'The diagram I send every new hire on day one.',
    },
    {
      title: 'A linear() easing generator',
      source: 'springcurve.app',
      note: 'Drag a spring, copy the CSS. That is the whole tool.',
    },
    {
      title: 'Why 60fps is a lie on 120Hz screens',
      source: 'Fielder Engineering',
      note: 'Frame pacing matters more than frame rate.',
    },
    {
      title: 'Reduced motion is not no motion',
      source: 'a11y-notes.org',
      note: 'Opacity is (almost) always safe; translation rarely is.',
    },
    {
      title: 'The first easing curve, 1962',
      source: 'Interface Archaeology',
      note: 'History corner: keyframes before keyboards.',
    },
  ],
};

const ISSUE_141: IssueBody = {
  number: 141,
  subject: 'Scroll-driven animations without the jank',
  date: 'Jun 30, 2026',
  intro:
    'Scroll-linked effects used to mean a scroll listener, a layout read, ' +
    'and a prayer. This week — the compositor will do it for free now, ' +
    'the API is smaller than you think, and the fallback story is ' +
    'genuinely fine.',
  sectionOneTitle: 'Off the main thread, on purpose',
  sectionOneCopy:
    'animation-timeline: scroll() hands the whole effect to the ' +
    'compositor, which means your parallax header keeps gliding even ' +
    'while React is busy reconciling a 4,000-row table. The mental shift ' +
    'is that scroll position becomes the clock: you write an ordinary ' +
    'keyframe animation and swap the timeline out from under it. Reading ' +
    'progress bars, reveal-on-scroll, sticky-header shrink — all of them ' +
    'stop being JavaScript problems.',
  tipTitle: 'The code tip',
  tipCopy:
    'The classic reading-progress bar in six declarations, running ' +
    'entirely off the main thread:',
  tipCode: [
    '/* Progress bar driven by scroll — zero main-thread work. */',
    '.reading-progress {',
    '  transform-origin: 0 50%;',
    '  animation: grow linear;',
    '  animation-timeline: scroll(root block);',
    '}',
    '@keyframes grow {',
    '  from { scale: 0 1; }',
    '  to   { scale: 1 1; }',
    '}',
  ].join('\\n'),
  tipLanguage: 'css',
  linksTitle: 'Five worth your click',
  links: [
    {
      title: 'scroll() and view(): the full tour',
      source: 'cascadeweekly.dev',
      note: 'The reference I keep pinned.',
    },
    {
      title: 'Progressive enhancement for scroll timelines',
      source: 'Polaris Engineering',
      note: 'One @supports block, no polyfill.',
    },
    {
      title: 'Compositor-only properties, memorized',
      source: 'renderpath.io',
      note: 'Transform, opacity, filter — and the exceptions.',
    },
    {
      title: 'When sticky headers should shrink',
      source: 'Northwind Design',
      note: 'A taste essay with numbers in it.',
    },
    {
      title: 'The scroll listener graveyard',
      source: 'jank.report',
      note: 'Six patterns you can finally delete.',
    },
  ],
};

type TopicId =
  | 'all'
  | 'animation'
  | 'css'
  | 'performance'
  | 'tooling'
  | 'career';

const TOPICS: readonly {id: TopicId; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'animation', label: 'Animation'},
  {id: 'css', label: 'CSS'},
  {id: 'performance', label: 'Performance'},
  {id: 'tooling', label: 'Tooling'},
  {id: 'career', label: 'Career'},
];

interface ArchiveIssue {
  number: number;
  title: string;
  teaser: string;
  topic: Exclude<TopicId, 'all'>;
  topicLabel: string;
  minutes: number;
}

const ARCHIVE: readonly ArchiveIssue[] = [
  {
    number: 142,
    title: 'The physics of a good toggle',
    teaser:
      'Why spring easing beats duration curves for anything a finger ' +
      'touches — and the linear() trick that gets you 90% there.',
    topic: 'animation',
    topicLabel: 'Animation',
    minutes: 6,
  },
  {
    number: 141,
    title: 'Scroll-driven animations without the jank',
    teaser:
      'animation-timeline is finally everywhere. We rebuild three JS ' +
      'scroll effects with zero main-thread work.',
    topic: 'css',
    topicLabel: 'CSS',
    minutes: 7,
  },
  {
    number: 140,
    title: 'Budgets before benchmarks',
    teaser:
      'A 150 KB interaction budget changed how our team argues about ' +
      'dependencies. Here is the worksheet.',
    topic: 'performance',
    topicLabel: 'Performance',
    minutes: 5,
  },
  {
    number: 139,
    title: 'A love letter to the Layers panel',
    teaser:
      'Six devtools workflows I watch senior candidates reach for — and ' +
      'the compositor bugs they catch in minutes.',
    topic: 'tooling',
    topicLabel: 'Tooling',
    minutes: 6,
  },
  {
    number: 138,
    title: 'The staff design-engineer path',
    teaser:
      'Interviews with four staff DEs on scope, leverage, and why a ' +
      'prototype is a promotion artifact.',
    topic: 'career',
    topicLabel: 'Career',
    minutes: 9,
  },
  {
    number: 137,
    title: 'Container queries in anger',
    teaser:
      'Shipping cq units inside a nine-year-old codebase: the fallbacks, ' +
      'the Safari gotcha, and the 40-line reset that saved us.',
    topic: 'css',
    topicLabel: 'CSS',
    minutes: 8,
  },
];

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      'I have unsubscribed from everything else. Overshoot is the only ' +
      'email I open the minute it lands.',
    name: 'Priya Raman',
    role: 'Staff design engineer, Fieldstone',
  },
  {
    quote:
      'The toggle-physics issue was better than most conference talks I ' +
      'have paid to sit through.',
    name: 'Marcus Bell',
    role: 'Frontend lead, Hexbyte',
  },
  {
    quote:
      'June writes the way good code reads: no filler, every line earns ' +
      'its place. Issue #128 alone saved us a week of performance work — ' +
      'we shipped the fix the same afternoon.',
    name: 'Sofia Andrade',
    role: 'Engineering manager, Lumen Labs',
  },
  {
    quote:
      'Our whole platform team shares exactly one subscription: this one.',
    name: 'Daniel Okafor',
    role: 'Principal engineer, Northwind',
  },
  {
    quote:
      'I have hired two people who brought up Overshoot in their ' +
      'interview loop. That is the quality bar it sets.',
    name: 'Grace Lin',
    role: 'VP of Engineering, Polaris',
  },
  {
    quote: 'Six minutes on Tuesday, smarter all week.',
    name: 'Tomás Rivera',
    role: 'Design engineer, Fielder',
  },
];

const SPONSOR = {
  heading: 'Reach 18,204 design engineers',
  copy:
    'One sponsor slot per issue — a short, clearly-labeled classified ' +
    'written in your voice, never a tracking pixel. Readers are senior ' +
    'frontend and design-systems engineers at product companies.',
  rate: '$1,450',
  rateCaption: 'per issue · 4-issue bundle $4,900',
  stats: '18,204 subscribers · 54% open rate · 19% link CTR',
  availability: [
    {month: 'Aug 2026', status: '1 slot left', variant: 'warning' as const},
    {month: 'Sep 2026', status: 'Open', variant: 'success' as const},
    {month: 'Oct 2026', status: 'Booked', variant: 'neutral' as const},
  ],
};

const AUTHOR = {
  name: 'June Kessler',
  initials: 'JK',
  bio:
    'Design engineer for eleven years — motion systems at Parallax, ' +
    'design infrastructure at Fieldstone. Overshoot started in 2023 as ' +
    'notes to a younger teammate and never stopped. Every issue is ' +
    'written by hand, tested in a real codebase, and sent to 18,204 ' +
    'inboxes on Tuesday at 6:00 AM Pacific.',
  chips: ['142 issues since 2023', 'Portland, OR', 'Replies to every email'],
  email: 'june@overshoot.dev',
};

const FOOTER_NOTE =
  '© 2026 Overshoot · Written in Portland, OR · No tracking pixels, ever.';

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to get issue #143.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// ============= HOOKS =============

/**
 * Page width via ResizeObserver — the inline demo stage is ~1045px wide
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

/** Live prefers-reduced-motion flag (matchMedia + change listener). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * True once the node has intersected the viewport; fires exactly once.
 * Falls back to visible when IntersectionObserver is unavailable so the
 * page never renders as a wall of hidden sections.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (node == null) {
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases 0 → target with requestAnimationFrame once \`isActive\` flips true.
 * ~900ms decelerate per the shared motion spec; prefers-reduced-motion
 * (and rAF-less environments) snap straight to the target.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return undefined;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof requestAnimationFrame === 'undefined') {
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
      // ease-out cubic: fast start, gentle landing on the fixture value.
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

/**
 * Rise+fade+settle scroll reveal (translateY 16px + scale .985 → identity,
 * 620ms decelerate bezier); fires once, renders visible under reduced
 * motion. \`delayMs\` staggers children inside grids (~70ms per index);
 * \`style\` lets grid parents place the reveal node itself.
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
  const [ref, inView] = useInView();
  const reducedMotion = usePrefersReducedMotion();
  const isShown = reducedMotion || inView;
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(16px) scale(0.985)',
        transition: reducedMotion
          ? 'none'
          : \`opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms, \` +
            \`transform 620ms cubic-bezier(0.22, 1, 0.36, 1) \${delayMs}ms\`,
      }}>
      {children}
    </div>
  );
}

/** Overshoot logomark: accent glyph tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={ActivityIcon} size="sm" color="inherit" />
      </div>
      <span style={styles.brandWordmark}>{BRAND.name}</span>
    </HStack>
  );
}

/** Uppercase tracked eyebrow — accent chip with a signal dot. */
function Eyebrow({label}: {label: string}) {
  return (
    <span style={styles.eyebrowChip}>
      <span style={styles.eyebrowDot} aria-hidden="true" />
      {label}
    </span>
  );
}

/** 32-44px section heading (Heading component sizes cap below spec). */
function SectionTitle({
  children,
  isCompact,
}: {
  children: ReactNode;
  isCompact: boolean;
}) {
  return (
    <h2
      style={{
        ...styles.sectionTitle,
        ...(isCompact ? styles.sectionTitleCompact : null),
      }}>
      {children}
    </h2>
  );
}

/** Aurora blob: blurred radial ink drifting on a 30-45s keyframe loop. */
function AuroraBlob({
  className,
  ink,
  size,
  top,
  left,
  right,
  bottom,
  opacity = 0.5,
}: {
  className: string;
  ink: string;
  size: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  opacity?: number;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        ...styles.blob,
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        opacity,
        background: \`radial-gradient(closest-side, \${ink}, transparent 72%)\`,
      }}
    />
  );
}

/**
 * Signature hero moment: the masthead spring curve. The path draws itself
 * via a stroke-dash transition, visibly overshooting the dashed target
 * line before settling; the peak label and settle dot fade in after the
 * draw. Reduced motion renders the completed frame with no transitions.
 */
function SpringCurve({
  isDrawn,
  reducedMotion,
}: {
  isDrawn: boolean;
  reducedMotion: boolean;
}) {
  const showFinished = reducedMotion || isDrawn;
  const drawTransition =
    reducedMotion || !isDrawn
      ? 'none'
      : 'stroke-dashoffset 1500ms cubic-bezier(0.33, 1, 0.68, 1)';
  const labelTransition = reducedMotion
    ? 'none'
    : 'opacity 420ms ease 950ms';
  return (
    <svg
      viewBox="0 0 340 190"
      width="100%"
      role="img"
      aria-label="Diagram of a spring animation curve overshooting its target line by 9% before settling">
      {/* target line */}
      <line
        x1="12"
        y1="64"
        x2="328"
        y2="64"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <text
        x="328"
        y="54"
        textAnchor="end"
        fontSize="10"
        fontFamily="var(--font-family-mono, ui-monospace, monospace)"
        fill="var(--color-text-secondary)">
        target
      </text>
      {/* baseline */}
      <line
        x1="12"
        y1="168"
        x2="328"
        y2="168"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      {/* the spring: press → overshoot → settle */}
      <path
        d="M12 168 C 44 168 62 30 108 34 C 148 37 144 96 184 90 C 216 85 234 66 268 64 L 328 64"
        fill="none"
        stroke={ACCENT}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={showFinished ? 0 : 1}
        style={{transition: drawTransition}}
      />
      {/* overshoot peak marker + label */}
      <g style={{opacity: showFinished ? 1 : 0, transition: labelTransition}}>
        <circle cx="108" cy="34" r="4" fill={ACCENT} />
        <text
          x="120"
          y="28"
          fontSize="10"
          fontWeight="700"
          fontFamily="var(--font-family-mono, ui-monospace, monospace)"
          fill={ACCENT}>
          +9% overshoot
        </text>
        <circle
          cx="328"
          cy="64"
          r="4"
          fill="var(--color-background-card)"
          stroke={ACCENT}
          strokeWidth="2.5"
        />
        <text
          x="268"
          y="84"
          fontSize="10"
          fontFamily="var(--font-family-mono, ui-monospace, monospace)"
          fill="var(--color-text-secondary)">
          settled ~300ms
        </text>
      </g>
    </svg>
  );
}

/**
 * One full sample-issue body (intro, deep dive, code tip, links). The
 * four anatomy parts register nodes with the pinned story rail so the
 * active step can scroll its part into view inside the framed scroller.
 */
function IssueReaderBody({
  issue,
  isCompact,
  scrollRef,
  registerPart,
}: {
  issue: IssueBody;
  isCompact: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  registerPart: (index: number) => (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={scrollRef}
      style={{
        ...styles.readerBody,
        ...(isCompact ? styles.readerBodyCompact : null),
      }}>
      <div ref={registerPart(0)}>
        <VStack gap={2}>
          <span style={styles.eyebrow}>
            Issue #{issue.number} · {issue.date}
          </span>
          <Heading level={3}>{issue.subject}</Heading>
          <p style={styles.proseParagraph}>{issue.intro}</p>
        </VStack>
      </div>
      <Divider />
      <div ref={registerPart(1)}>
        <VStack gap={2}>
          <h4 style={styles.proseHeading}>{issue.sectionOneTitle}</h4>
          <p style={styles.proseParagraph}>{issue.sectionOneCopy}</p>
        </VStack>
      </div>
      <div ref={registerPart(2)}>
        <VStack gap={2}>
          <h4 style={styles.proseHeading}>{issue.tipTitle}</h4>
          <p style={styles.proseParagraph}>{issue.tipCopy}</p>
          <CodeBlock
            code={issue.tipCode}
            language={issue.tipLanguage}
            hasCopyButton
            size="sm"
            width="100%"
          />
        </VStack>
      </div>
      <div ref={registerPart(3)}>
        <VStack gap={1}>
          <h4 style={styles.proseHeading}>{issue.linksTitle}</h4>
          {issue.links.map(link => (
            <div key={link.title} style={styles.linkRow}>
              <div style={styles.linkGlyph} aria-hidden="true">
                <Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />
              </div>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text size="sm" weight="semibold">
                    {link.title}{' '}
                    <Text size="sm" color="secondary">
                      — {link.source}
                    </Text>
                  </Text>
                  <Text type="supporting" color="secondary">
                    {link.note}
                  </Text>
                </VStack>
              </StackItem>
            </div>
          ))}
        </VStack>
      </div>
      <Text type="supporting" color="secondary">
        — June. Reply to this email; I read every one.
      </Text>
    </div>
  );
}

/** One testimonial card — shared by the marquee and the static wall. */
function QuoteCard({
  entry,
  width,
}: {
  entry: Testimonial;
  width?: CSSProperties['width'];
}) {
  return (
    <figure
      style={{...styles.quoteCard, width: width ?? styles.quoteCard.width, margin: 0}}>
      <div style={styles.quoteMark} aria-hidden="true">
        <Icon icon={QuoteIcon} size="xsm" color="inherit" />
      </div>
      <blockquote style={{...styles.quoteText, margin: 0}}>
        {entry.quote}
      </blockquote>
      <figcaption>
        <VStack gap={0}>
          <Text size="sm" weight="semibold">
            {entry.name}
          </Text>
          <Text type="supporting" color="secondary">
            {entry.role}
          </Text>
        </VStack>
      </figcaption>
    </figure>
  );
}

// ============= PAGE =============

export default function NewsletterCreatorLandingTemplate() {
  // ---- responsive: measure the page itself (demo-stage safe) ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pageRef);
  const isMid = pageWidth > 0 && pageWidth <= 980;
  const isCompact = pageWidth > 0 && pageWidth <= 760;
  const isNarrow = pageWidth > 0 && pageWidth <= 560;

  const reducedMotion = usePrefersReducedMotion();

  // Display-type tiers: 64-84px at wide widths, stepping with the
  // measured container (never under 56px while the hero is split).
  const headlineSize =
    pageWidth === 0 || pageWidth > 1020
      ? 78
      : pageWidth > 980
        ? 68
        : pageWidth > 760
          ? 58
          : pageWidth > 560
            ? 46
            : 37;

  // Layout rhythm: 96-128px section padding at wide, 56-72px compact.
  const sectionPadY = isNarrow ? 56 : isCompact ? 68 : 112;
  const authorOverlap = isCompact ? 48 : 88;

  // ---- nav: compact menu + scroll-spy + condense-on-scroll ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- subscribe capture ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [hasResent, setHasResent] = useState(false);

  // ---- hero proof count-ups (fire once on first view, ~900ms) ----
  const [proofRef, proofInView] = useInView();
  const readerCount = useCountUp(HERO.readers, proofInView);
  const openRateCount = useCountUp(HERO.openRate, proofInView, 750);

  // ---- signature spring draw (replayable) ----
  const [springRun, setSpringRun] = useState(0);
  const [isSpringDrawn, setIsSpringDrawn] = useState(false);
  useEffect(() => {
    if (reducedMotion) {
      setIsSpringDrawn(true);
      return undefined;
    }
    setIsSpringDrawn(false);
    // Double rAF so the reset (dashoffset 1, no transition) flushes first.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setIsSpringDrawn(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [springRun, reducedMotion]);

  // ---- sample reader swap toggle + pinned scroll story ----
  const [readerIssue, setReaderIssue] = useState<142 | 141>(142);
  const [storyStep, setStoryStep] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const readerScrollRef = useRef<HTMLDivElement | null>(null);
  const partRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyEngagedRef = useRef(false);

  // Pinned scene only where there is room; reduced motion and compact
  // widths render the static stacked sequence instead.
  const storyPinned = !reducedMotion && !isCompact;

  // Active step scrolls its part into view inside the framed reader
  // (skipped on mount so the page loads at the top of the excerpt).
  useEffect(() => {
    if (!storyEngagedRef.current) {
      storyEngagedRef.current = true;
      return;
    }
    const scroller = readerScrollRef.current;
    const part = partRefs.current[storyStep];
    if (scroller == null || part == null) {
      return;
    }
    scroller.scrollTo({
      top: Math.max(0, part.offsetTop - 20),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [storyStep, reducedMotion]);

  const registerPart =
    (index: number) =>
    (node: HTMLDivElement | null): void => {
      partRefs.current[index] = node;
    };

  // ---- archive topic filter ----
  const [topic, setTopic] = useState<TopicId>('all');

  // ---- sponsor kit + author email reveal ----
  const [isKitRequested, setIsKitRequested] = useState(false);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);

  // Compact menu dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar; listeners only run while open.
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

  /** Smooth-scroll the container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container == null || section == null) {
      return;
    }
    const top =
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      NAV_ALLOWANCE;
    setActiveSection(id);
    container.scrollTo({top, behavior: reducedMotion ? 'auto' : 'smooth'});
  };

  /** Nav CTA: back to the hero subscribe form. */
  const jumpToTop = () => {
    setIsMenuOpen(false);
    pageRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /**
   * One scroll handler, three jobs: condense the navbar after 24px, spy
   * the last nav anchor above the fold line, and drive the pinned story
   * (progress fills the rail; quarter thresholds advance the step).
   */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const containerTop = container.getBoundingClientRect().top;
    setIsScrolled(container.scrollTop > 24);
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (
        section != null &&
        section.getBoundingClientRect().top - containerTop <= SPY_OFFSET
      ) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
    if (storyPinned) {
      const story = sectionRefs.current.sample;
      if (story != null) {
        const travel = story.offsetHeight - container.clientHeight;
        if (travel > 80) {
          const relTop = story.getBoundingClientRect().top - containerTop;
          const progress = clamp01(-relTop / travel);
          setStoryProgress(Math.round(progress * 48) / 48);
          setStoryStep(Math.min(3, Math.floor(progress * 4)));
        }
      }
    }
  };

  /**
   * Step buttons: always select the part; in pinned mode also scroll the
   * page to the matching point of the story's travel so rail, scroll
   * position, and reader stay in one story.
   */
  const goToStoryStep = (index: number) => {
    setStoryStep(index);
    if (!storyPinned) {
      return;
    }
    const container = pageRef.current;
    const story = sectionRefs.current.sample;
    if (container == null || story == null) {
      return;
    }
    const travel = story.offsetHeight - container.clientHeight;
    if (travel <= 80) {
      return;
    }
    const storyTop =
      story.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    container.scrollTo({
      top: storyTop + ((index + 0.5) / 4) * travel,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /** Hero parallax: pointer position → CSS vars (transform-only, ref'd). */
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || isMid) {
      return;
    }
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    node.style.setProperty('--ncl-px', px.toFixed(3));
    node.style.setProperty('--ncl-py', py.toFixed(3));
  };

  const onHeroPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = event.currentTarget;
    node.style.setProperty('--ncl-px', '0');
    node.style.setProperty('--ncl-py', '0');
  };

  /** Dark-band spotlight follows the pointer via CSS vars (no re-render). */
  const onSpotlightMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion) {
      return;
    }
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * 100;
    const my = ((event.clientY - rect.top) / rect.height) * 100;
    node.style.setProperty('--ncl-mx', \`\${mx.toFixed(1)}%\`);
    node.style.setProperty('--ncl-my', \`\${my.toFixed(1)}%\`);
  };

  const submitSubscribe = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
    setHasResent(false);
  };

  const resetSubscribe = () => {
    setConfirmedEmail(null);
    setHasResent(false);
    setEmail('');
    setEmailError(null);
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const topicCount = (id: TopicId): number =>
    id === 'all'
      ? ARCHIVE.length
      : ARCHIVE.filter(issue => issue.topic === id).length;

  const visibleIssues =
    topic === 'all'
      ? ARCHIVE
      : ARCHIVE.filter(issue => issue.topic === topic);

  const archiveColumns = isNarrow ? 1 : isMid ? 2 : 3;
  const quoteColumns = isNarrow ? 1 : isMid ? 2 : 3;
  const showSatellites = !isMid;

  const colStyle: CSSProperties = {
    ...styles.column,
    ...(isNarrow ? styles.columnNarrow : null),
  };

  // ============= CHROME =============

  const navbar = (
    <nav
      ref={navRef}
      style={{...styles.navBar, ...(isScrolled ? styles.navBarScrolled : null)}}
      aria-label="Primary">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          {!isCompact && (
            <HStack gap={1} vAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={activeSection === anchor.id ? 'true' : undefined}
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
        <span className="ncl-cta">
          <Button
            label="Subscribe"
            variant="primary"
            size={isCompact ? 'sm' : 'md'}
            icon={<Icon icon={MailIcon} size="sm" color="inherit" />}
            onClick={jumpToTop}
          />
        </span>
        {isCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(previous => !previous)}
            style={styles.iconButton}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isMenuOpen && isCompact && (
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
              <button
                type="button"
                role="menuitem"
                style={{...styles.menuLink, color: ACCENT}}
                onClick={jumpToTop}>
                <Icon icon={MailIcon} size="sm" color="inherit" />
                Subscribe free
              </button>
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO (product theater) =============

  const subscribeForm =
    confirmedEmail !== null ? (
      <div style={styles.successCard}>
        <div style={styles.successDisc} aria-hidden="true">
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <VStack gap={1}>
          <Text weight="semibold">Check your inbox</Text>
          <Text type="supporting" color="secondary">
            We sent a confirmation to {confirmedEmail}. Click it and issue
            #143 arrives Tuesday at 6:00 AM.
          </Text>
          {hasResent && (
            <Text type="supporting" color="secondary">
              Sent again — give it a minute, and check spam too.
            </Text>
          )}
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label={hasResent ? 'Resent' : 'Resend email'}
              variant="ghost"
              size="sm"
              isDisabled={hasResent}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => setHasResent(true)}
            />
            <Button
              label="Use a different address"
              variant="ghost"
              size="sm"
              onClick={resetSubscribe}
            />
          </HStack>
        </VStack>
      </div>
    ) : (
      <VStack gap={1}>
        <div
          style={{
            ...styles.emailRow,
            ...(isNarrow ? styles.emailRowStacked : null),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Email address"
              isLabelHidden
              placeholder="you@studio.dev"
              value={email}
              onChange={value => {
                setEmail(value);
                setEmailError(null);
              }}
            />
          </div>
          <span className="ncl-cta">
            <Button
              label="Subscribe free"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={submitSubscribe}
            />
          </span>
        </div>
        {emailError !== null && (
          <p style={styles.emailError} role="alert">
            {emailError}
          </p>
        )}
      </VStack>
    );

  const heroProof = (
    <div ref={proofRef}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.avatarStack} aria-hidden="true">
          {READER_MONOGRAMS.map((reader, index) => (
            <div
              key={reader.initials}
              style={{
                ...styles.avatarDisc,
                backgroundColor: accentMix(
                  reader.tint,
                  'var(--color-background-muted)',
                ),
                marginLeft: index === 0 ? 0 : -8,
              }}>
              {reader.initials}
            </div>
          ))}
        </div>
        <span style={styles.proofFigure}>
          {Math.round(readerCount).toLocaleString('en-US')} readers
        </span>
        <Text type="supporting" color="secondary">
          ·
        </Text>
        <span style={styles.proofFigure}>
          {Math.round(openRateCount)}% open rate
        </span>
      </HStack>
    </div>
  );

  const springCard = (
    <div className="ncl-tilt" style={styles.springCard}>
      <div style={styles.springHeader}>
        <div style={styles.brandTile} aria-hidden="true">
          <Icon icon={ActivityIcon} size="sm" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              This week in Overshoot
            </Text>
            <Text type="supporting" color="secondary">
              #142 · The physics of a good toggle
            </Text>
          </VStack>
        </StackItem>
        <span style={styles.issueChip}>6 min read</span>
      </div>
      <div style={styles.springBody}>
        <SpringCurve isDrawn={isSpringDrawn} reducedMotion={reducedMotion} />
      </div>
      <div style={styles.springFooter}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Fig. 01 — a press, an overshoot, a settle. Every issue is this
            curve.
          </Text>
        </StackItem>
        <Button
          label="Replay"
          variant="ghost"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          onClick={() => setSpringRun(previous => previous + 1)}
        />
      </div>
    </div>
  );

  const heroTheater = (
    <div
      style={styles.heroStage}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {springCard}
      {showSatellites && (
        <>
          <div
            className="ncl-para-a"
            aria-hidden="true"
            style={{...styles.satShell, top: -26, right: -14}}>
            <div
              className="ncl-bob"
              style={{...styles.satCard, animationDelay: '-1.2s'}}>
              <div style={styles.satGlyph}>
                <Icon icon={ActivityIcon} size="sm" color="inherit" />
              </div>
              <div>
                <div style={styles.satFigure}>54% open rate</div>
                <div style={styles.satCaption}>19% link CTR</div>
              </div>
            </div>
          </div>
          <div
            className="ncl-para-b"
            aria-hidden="true"
            style={{...styles.satShell, bottom: -30, left: -26}}>
            <div
              className="ncl-bob"
              style={{...styles.satCard, animationDelay: '-3.6s'}}>
              <div style={styles.satGlyph}>
                <Icon icon={MailCheckIcon} size="sm" color="inherit" />
              </div>
              <div>
                <div style={styles.satFigure}>Issue #142 just landed</div>
                <div style={styles.satCaption}>
                  The physics of a good toggle · 6 min
                </div>
              </div>
            </div>
          </div>
          <div
            className="ncl-para-c"
            aria-hidden="true"
            style={{...styles.satShell, top: '46%', left: -40}}>
            <div
              className="ncl-bob"
              style={{
                ...styles.satCard,
                animationDelay: '-5.4s',
                padding: '8px 12px',
              }}>
              <div style={styles.avatarStack}>
                {READER_MONOGRAMS.slice(0, 3).map((reader, index) => (
                  <div
                    key={reader.initials}
                    style={{
                      ...styles.avatarDisc,
                      width: 26,
                      height: 26,
                      fontSize: 10,
                      backgroundColor: accentMix(
                        reader.tint,
                        'var(--color-background-muted)',
                      ),
                      marginLeft: index === 0 ? 0 : -8,
                    }}>
                    {reader.initials}
                  </div>
                ))}
              </div>
              <div style={styles.satFigure}>18,204 readers</div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const hero = (
    <div
      style={{
        ...styles.heroRow,
        ...(isMid ? styles.heroRowMid : null),
        ...(isCompact ? styles.heroRowStacked : null),
      }}>
      <div style={styles.heroText}>
        <Eyebrow label={HERO.eyebrow} />
        <h1 style={{...styles.headline, fontSize: headlineSize}}>
          {HERO.headlineLead}{' '}
          <span style={styles.headlineInk}>{HERO.headlineInk}</span>
        </h1>
        <p style={styles.subcopy}>{HERO.subcopy}</p>
        {subscribeForm}
        <Text type="supporting" color="secondary">
          {HERO.finePrint}
        </Text>
        {heroProof}
      </div>
      <div style={styles.heroAside}>{heroTheater}</div>
    </div>
  );

  const heroBand = (
    <header style={styles.band}>
      <AuroraBlob
        className="ncl-aurora-a"
        ink={AURORA_EMBER}
        size={520}
        top={-190}
        left={-150}
        opacity={0.5}
      />
      <AuroraBlob
        className="ncl-aurora-b"
        ink={AURORA_AMBER}
        size={460}
        top={-90}
        right={-130}
        opacity={0.45}
      />
      <AuroraBlob
        className="ncl-aurora-c"
        ink={AURORA_DUSK}
        size={380}
        bottom={-170}
        left="36%"
        opacity={0.38}
      />
      <div style={styles.dotGrid} aria-hidden="true" />
      <div style={styles.grain} aria-hidden="true" />
      <div
        style={{
          ...colStyle,
          paddingTop: isCompact ? 40 : 64,
          paddingBottom: sectionPadY,
        }}>
        {hero}
      </div>
    </header>
  );

  // ============= PINNED SCROLL STORY (sample issue) =============

  const currentIssue = readerIssue === 142 ? ISSUE_142 : ISSUE_141;
  const otherIssueNumber = readerIssue === 142 ? 141 : 142;

  const storyRail = (
    <div
      style={{
        ...styles.storyRail,
        ...(isCompact ? styles.storyRailCompact : null),
      }}>
      {!isCompact && (
        <div style={styles.railTrack} aria-hidden="true">
          <div
            style={{
              ...styles.railFill,
              transform: \`scaleY(\${storyPinned ? storyProgress : 1})\`,
            }}
          />
        </div>
      )}
      {STORY_STEPS.map((step, index) => (
        <button
          key={step.title}
          type="button"
          aria-current={storyStep === index ? 'step' : undefined}
          style={{
            ...styles.stepButton,
            ...(storyStep === index ? styles.stepButtonActive : null),
            ...(isCompact
              ? {flex: '1 1 150px', padding: 'var(--spacing-2)'}
              : null),
          }}
          onClick={() => goToStoryStep(index)}>
          <span style={styles.stepIndex}>{\`0\${index + 1}\`}</span>
          <span style={{minWidth: 0}}>
            <span style={{...styles.stepTitle, display: 'block'}}>
              {step.title}
            </span>
            {!isNarrow && (
              <span style={{...styles.stepCopy, display: 'block'}}>
                {step.copy}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );

  const readerFrame = (
    <div style={styles.readerColumn}>
      <div style={styles.readerFrame}>
        <div style={styles.readerMasthead}>
          <span style={styles.issueChip}>#{currentIssue.number}</span>
          <StackItem size="fill">
            <Text size="sm" weight="semibold">
              {currentIssue.subject}
            </Text>
          </StackItem>
          <Button
            label={
              readerIssue === 142
                ? \`Read issue #\${otherIssueNumber}\`
                : \`Back to issue #\${otherIssueNumber}\`
            }
            variant="secondary"
            size="sm"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => setReaderIssue(otherIssueNumber as 142 | 141)}
          />
        </div>
        <IssueReaderBody
          issue={currentIssue}
          isCompact={isNarrow}
          scrollRef={readerScrollRef}
          registerPart={registerPart}
        />
      </div>
    </div>
  );

  const sampleStory = (
    <section
      id="sample"
      ref={registerSection('sample')}
      aria-label="Sample issue"
      style={{
        position: 'relative',
        height: storyPinned ? '250vh' : 'auto',
      }}>
      <div style={storyPinned ? {position: 'sticky', top: 0} : undefined}>
        <div
          style={{
            ...colStyle,
            paddingTop: isCompact ? 48 : 72,
            paddingBottom: isCompact ? 48 : 40,
          }}>
          <Reveal>
            <div style={styles.storyStage}>
              <VStack gap={2}>
                <Eyebrow label="Sample issue" />
                <SectionTitle isCompact={isCompact}>
                  Read one before you subscribe
                </SectionTitle>
                <Text type="supporting" color="secondary">
                  The whole pitch is the product — every issue follows the
                  same four-beat anatomy. Keep scrolling, or pick a beat.
                </Text>
              </VStack>
              <div
                style={{
                  ...styles.storySplit,
                  ...(isCompact ? {flexDirection: 'column'} : null),
                }}>
                {storyRail}
                {readerFrame}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );

  // ============= ARCHIVE =============

  const archive = (
    <section
      id="archive"
      ref={registerSection('archive')}
      aria-label="Archive"
      style={styles.bandTinted}>
      <div style={{...colStyle, paddingBlock: sectionPadY}}>
        <VStack gap={5}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-4)',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}>
              <VStack gap={2}>
                <Eyebrow label="Archive" />
                <SectionTitle isCompact={isCompact}>
                  141 back issues, zero paywalls
                </SectionTitle>
                <Text type="supporting" color="secondary">
                  The six most recent below — filter by topic.
                </Text>
              </VStack>
              <HStack gap={2} vAlign="center" wrap="wrap">
                {TOPICS.map(entry => (
                  <ToggleButton
                    key={entry.id}
                    label={\`\${entry.label} · \${topicCount(entry.id)}\`}
                    size="sm"
                    isPressed={topic === entry.id}
                    onPressedChange={() => setTopic(entry.id)}
                  />
                ))}
              </HStack>
            </div>
          </Reveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: \`repeat(\${archiveColumns}, minmax(0, 1fr))\`,
              gap: 'var(--spacing-3)',
            }}>
            {visibleIssues.map((issue, index) => {
              const isFeature = index === 0 && archiveColumns > 1;
              return (
                <Reveal
                  key={issue.number}
                  delayMs={index * 70}
                  style={{
                    gridColumn: isFeature ? 'span 2' : 'auto',
                    minWidth: 0,
                    height: '100%',
                  }}>
                  <div className="ncl-raise">
                    <Card
                      padding={isFeature ? 5 : 4}
                      height="100%"
                      style={{position: 'relative', overflow: 'hidden'}}>
                      {isFeature && (
                        <span style={styles.ghostNumeral} aria-hidden="true">
                          {issue.number}
                        </span>
                      )}
                      <VStack gap={2}>
                        <HStack gap={2} vAlign="center">
                          <StackItem size="fill">
                            <span style={styles.issueNumber}>
                              ISSUE #{issue.number}
                            </span>
                          </StackItem>
                          <Badge variant="orange" label={issue.topicLabel} />
                        </HStack>
                        <span
                          style={{
                            fontSize: isFeature ? 24 : 16,
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            lineHeight: 1.25,
                          }}>
                          {issue.title}
                        </span>
                        <Text type="supporting" color="secondary">
                          {issue.teaser}
                        </Text>
                        <HStack gap={1} vAlign="center">
                          <Icon icon={ClockIcon} size="xsm" color="secondary" />
                          <Text type="supporting" color="secondary">
                            {issue.minutes} min read
                          </Text>
                        </HStack>
                      </VStack>
                    </Card>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= TESTIMONIAL MARQUEE =============

  const testimonialWall = (
    <section
      id="readers"
      ref={registerSection('readers')}
      aria-label="What readers say"
      style={{
        ...styles.bandMuted,
        borderBottom: '1px solid var(--color-border)',
      }}>
      <div
        style={{
          ...colStyle,
          paddingTop: sectionPadY,
          paddingBottom: 'var(--spacing-6)',
        }}>
        <Reveal>
          <VStack gap={2}>
            <Eyebrow label="Readers" />
            <SectionTitle isCompact={isCompact}>
              Read by the people who ship the pixels
            </SectionTitle>
          </VStack>
        </Reveal>
      </div>
      {reducedMotion ? (
        <div style={{...colStyle, paddingBottom: sectionPadY}}>
          <div
            style={{
              columnCount: quoteColumns,
              columnGap: 'var(--spacing-3)',
            }}>
            {TESTIMONIALS.map(entry => (
              <div
                key={entry.name}
                style={{
                  breakInside: 'avoid',
                  marginBottom: 'var(--spacing-3)',
                }}>
                <QuoteCard entry={entry} width="100%" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Reveal>
          <div
            className="ncl-marquee-wrap"
            style={{...styles.marqueeWrap, paddingBottom: sectionPadY}}
            aria-label="Reader testimonials, scrolling — hover to pause">
            <div className="ncl-marquee">
              <div className="ncl-marquee-half">
                {TESTIMONIALS.map(entry => (
                  <QuoteCard
                    key={entry.name}
                    entry={entry}
                    width={isNarrow ? 280 : 340}
                  />
                ))}
              </div>
              <div className="ncl-marquee-half" aria-hidden="true">
                {TESTIMONIALS.map(entry => (
                  <QuoteCard
                    key={entry.name}
                    entry={entry}
                    width={isNarrow ? 280 : 340}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );

  // ============= DARK SPONSOR BAND + OVERLAPPING AUTHOR =============

  const sponsorSection = (
    <section
      id="sponsor"
      ref={registerSection('sponsor')}
      aria-label="Sponsor Overshoot"
      style={styles.bandDark}
      onPointerMove={onSpotlightMove}>
      <AuroraBlob
        className="ncl-aurora-b"
        ink={AURORA_EMBER}
        size={480}
        top={-150}
        right={-110}
        opacity={0.42}
      />
      <AuroraBlob
        className="ncl-aurora-c"
        ink={AURORA_DUSK}
        size={420}
        bottom={-140}
        left={-130}
        opacity={0.36}
      />
      <div className="ncl-spot" aria-hidden="true" />
      <div style={styles.grain} aria-hidden="true" />
      <div
        style={{
          ...colStyle,
          paddingTop: sectionPadY,
          paddingBottom: sectionPadY + authorOverlap,
        }}>
        <Reveal>
          <VStack gap={4}>
            <VStack gap={2}>
              <Eyebrow label="Sponsor" />
              <SectionTitle isCompact={isCompact}>
                {SPONSOR.heading}
              </SectionTitle>
            </VStack>
            <div style={styles.glassCard}>
              <div
                style={{
                  ...styles.splitRow,
                  ...(isCompact ? styles.splitRowStacked : null),
                }}>
                <div style={styles.splitHalf}>
                  <Text type="body" color="secondary">
                    {SPONSOR.copy}
                  </Text>
                  <span style={styles.monoLine}>{SPONSOR.stats}</span>
                </div>
                <div style={styles.splitHalf}>
                  <VStack gap={0}>
                    <span style={styles.rateFigure}>{SPONSOR.rate}</span>
                    <Text type="supporting" color="secondary">
                      {SPONSOR.rateCaption}
                    </Text>
                  </VStack>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    {SPONSOR.availability.map(slot => (
                      <Badge
                        key={slot.month}
                        variant={slot.variant}
                        label={\`\${slot.month} · \${slot.status}\`}
                      />
                    ))}
                  </HStack>
                  {isKitRequested ? (
                    <HStack gap={2} vAlign="center">
                      <Icon icon={CheckIcon} size="sm" color="success" />
                      <Text type="supporting" color="secondary">
                        Kit requested — June replies within 2 business days.
                      </Text>
                    </HStack>
                  ) : (
                    <div style={{display: 'flex'}}>
                      <Button
                        label="Request the sponsor kit"
                        variant="secondary"
                        icon={
                          <Icon
                            icon={ArrowRightIcon}
                            size="sm"
                            color="inherit"
                          />
                        }
                        onClick={() => setIsKitRequested(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const authorSection = (
    <section aria-label="About the author">
      <div
        style={{
          ...colStyle,
          marginTop: -authorOverlap,
          paddingBottom: sectionPadY,
        }}>
        <Reveal>
          <div style={styles.authorCard}>
            <div
              style={{
                ...styles.splitRow,
                ...(isCompact ? styles.splitRowStacked : null),
                alignItems: isCompact ? 'stretch' : 'center',
              }}>
              <HStack gap={4} vAlign="center">
                <div style={styles.authorTile} aria-hidden="true">
                  {AUTHOR.initials}
                </div>
                <VStack gap={1}>
                  <Eyebrow label="About the author" />
                  <Heading level={3}>Written by {AUTHOR.name}</Heading>
                </VStack>
              </HStack>
              <StackItem size="fill">
                <VStack gap={2}>
                  <Text type="body" color="secondary">
                    {AUTHOR.bio}
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    {AUTHOR.chips.map(chip => (
                      <Badge key={chip} variant="neutral" label={chip} />
                    ))}
                  </HStack>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    {isEmailRevealed ? (
                      <span style={styles.monoLine}>{AUTHOR.email}</span>
                    ) : (
                      <Button
                        label="Say hello"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={MailIcon} size="sm" color="inherit" />}
                        onClick={() => setIsEmailRevealed(true)}
                      />
                    )}
                  </HStack>
                </VStack>
              </StackItem>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.bandMuted}>
      <div
        style={{
          ...colStyle,
          paddingBlock: 48,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-4)',
        }}>
        <HStack gap={4} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={1}>
              <BrandMark />
              <Text type="supporting" color="secondary">
                {BRAND.tagline}
              </Text>
            </VStack>
          </StackItem>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              On this page
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
          </VStack>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Elsewhere
            </Text>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              <HStack gap={1} vAlign="center">
                <Icon icon={RssIcon} size="xsm" color="inherit" />
                RSS feed
              </HStack>
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              Privacy note
            </button>
          </VStack>
        </HStack>
        <Divider />
        <Text type="supporting" color="secondary">
          {FOOTER_NOTE}
        </Text>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div
          ref={pageRef}
          className={SCOPE}
          style={styles.page}
          onScroll={onPageScroll}>
          <style>{TEMPLATE_CSS}</style>
          {navbar}
          {heroBand}
          {sampleStory}
          {archive}
          {testimonialWall}
          {sponsorSection}
          {authorSection}
          {footer}
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};