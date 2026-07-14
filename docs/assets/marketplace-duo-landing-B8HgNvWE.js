var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file marketplace-duo-landing.tsx
 * @input Deterministic fixtures only (the fictional "Kitloop" peer-to-peer
 *   gear-rental marketplace: two audience themes — renter and owner — each
 *   with a split headline (plain lead + gradient-ink tail), subcopy, CTA
 *   copy, a quarantined accent, and a gradient partner token; three hero
 *   satellite chips per audience; eight gear categories with listing
 *   counts, floor prices, and ratings; three how-it-works steps and four
 *   payout/protection steps (each with a schematic product-mock state for
 *   the pinned scroll story); four KitCover trust cards; six renter
 *   reviews (one honest 4-star); six earnable item types with daily rates
 *   and honest utilization factors for the earnings calculator; three
 *   top-earner stories plus a median-earnings disclosure; four marketplace
 *   stats; twelve launch cities with listing counts and pickup distances;
 *   five FAQs per audience; and a four-column sitemap footer)
 * @output Art-directed two-sided marketplace landing page. Signature move:
 *   an audience toggle in the hero ("I want to rent" / "I want to earn")
 *   that swaps the headline, CTA, staged hero vignette, and satellite chips
 *   AND retints every accent surface, aurora field, and glow down the page
 *   between the renter teal and the owner amber — the sanctioned two-accent
 *   exception, both literals carrying contrast math. The toggle re-docks
 *   into the sticky navbar once the hero scrolls away. Atmosphere: drifting
 *   aurora blobs behind the hero and the cities band, a full-page grain
 *   overlay, a dot-grid band behind the pinned story, and a scheme-locked
 *   dark CTA band with gradient glows, a pointer-tracked spotlight, and a
 *   glass email-capture card. The hero is a product theater: a perspective-
 *   tilted vignette mock with three bobbing satellite mini-cards that
 *   parallax toward the pointer. Each audience path pins one scroll story —
 *   renter how-it-works (3 states) or owner payout/protection (4 states) —
 *   inside a px-sized container (sticky stage + ~1.45x travel, measured from
 *   the scrollport, never vh) whose progress advances a staged product mock
 *   and fills a clickable numbered step rail. Renter reviews run as a
 *   pausable marquee loop; the shared stats panel floats across the section
 *   boundary into the tinted cities band.
 * @position Page template; emitted by \`astryx template marketplace-duo-landing\`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div; the navbar is position:sticky top:0 inside
 * it (transparent over the hero aurora, gaining a tinted color-mix surface,
 * hairline, and reduced height after 24px of scroll), and a centered 1120px
 * column carries hero, audience path, stats, cities, FAQ, and CTA sections.
 * Tinted full-bleed bands alternate with plain bands; the dark CTA band is
 * scheme-locked via light-dark(); the footer paints edge to edge on the
 * muted token. A grain overlay (inline feTurbulence data-URI, opacity .04)
 * sits above the scroller, pointer-events none.
 *
 * Interaction contract:
 * - The hero audience toggle swaps headline/CTA/vignette/satellites (keyed
 *   swap-in animation) and retints accents, auroras, and glows page-wide;
 *   after the hero scrolls past, a compact copy of the toggle appears in
 *   the sticky navbar (tracked by the scroll container's onScroll against
 *   the hero's measured bottom).
 * - Hero theater: the vignette mock sits in a perspective wrapper; three
 *   satellite chips bob on independent 6.5-8.5s keyframes (negative
 *   delays) and parallax ±6-9px toward the pointer over the hero stage
 *   (CSS vars set from onPointerMove; off under reduced motion and at
 *   stacked widths).
 * - Pinned scroll story: a position:sticky stage inside a tall container;
 *   scroll progress (container rect vs. the scroll container's rect)
 *   selects the active step, crossfades the staged product mock, and fills
 *   the step rail. Steps are also clickable buttons that scroll the page
 *   to the matching progress point. Under reduced motion the story renders
 *   as a static stacked sequence.
 * - Nav anchors smooth-scroll to real section ids under a sticky-nav
 *   allowance; at compact widths they collapse behind a menu button whose
 *   dropdown closes on Escape, outside pointerdown, or selection.
 * - Category tiles and city chips are selectable (accent ring) and update
 *   a live caption line; cards raise a shadow tier and gain an accent glow
 *   on hover. The earnings calculator's Selector and Slider retarget an
 *   eased count-up estimate and an honest range readout.
 * - Renter reviews loop as a 48s marquee (pause on hover); reduced motion
 *   renders a static wrapped grid.
 * - FAQ tabs follow the audience toggle until the reader overrides them;
 *   accordions are controlled via a Set so several stay open.
 * - The dark CTA band tracks the pointer with a radial spotlight and hosts
 *   the validating email form (empty/format, inline error) which flips to
 *   a confirmation echoing the address, with a reset action.
 * - Footer owner links flip the audience to "earn" before scrolling, so
 *   both paths are reachable without finding the hero toggle.
 * - Motion: group reveals stagger children 60-90ms (translateY 16px +
 *   scale .985 → identity, 600ms decelerate bezier, fire once); stats,
 *   earnings, and earner chips count up ~900ms on first view; primary
 *   buttons carry a sheen sweep + 1px lift + pressed scale. Everything is
 *   transform/opacity-only and gated by prefers-reduced-motion (reveals
 *   render visible, counters render final, auroras/marquee/bob/parallax/
 *   pinned scene disabled).
 *
 * Color policy: token-pure except the sanctioned two-accent exception for
 * this archetype. Exactly two quarantined accent literals exist (renter
 * teal, owner amber — see PAINT CONSTANTS for the contrast math) plus one
 * neutral on-accent ink pair; every tint, aurora, glow, and gradient ink
 * is derived from the accents via color-mix() with scheme tokens, and the
 * shadow tiers use neutral rgba() depth values only (no hue literals).
 *
 * Responsive contract (measured with a local ResizeObserver — the demo
 * stage is ~1045px wide, so viewport media queries are not used):
 * - Column: max-width 1120px, centered; tinted/dark bands and footer bleed.
 * - Hero display type tiers 76 → 64 → 52 → 40px with the measured width.
 * - <=780px: nav anchor links collapse behind a menu button + dropdown;
 *   the nav CTA moves into the dropdown.
 * - <=840px: hero stacks (vignette below copy) and satellites/parallax
 *   turn off; the pinned story stage stacks its step chips above the mock.
 * - Category grid 4 → 3 → 2 columns (staggered column offsets at wide
 *   widths); trust and payout splits collapse; reviews marquee cards are
 *   fixed width; stories 3 → 2 → 1; stats 4 → 2; footer sitemap 4 → 2.
 * - <=520px: headline steps down, the email form stacks its button, and
 *   chip rows wrap — the page holds at 390px with no overflow-x.
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
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  BanknoteIcon,
  BikeIcon,
  CalendarCheckIcon,
  CameraIcon,
  CheckIcon,
  LifeBuoyIcon,
  MailCheckIcon,
  MapPinIcon,
  MenuIcon,
  MountainSnowIcon,
  ProjectorIcon,
  RepeatIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SpeakerIcon,
  TentIcon,
  TruckIcon,
  UserCheckIcon,
  WavesIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// Sanctioned two-accent exception for the two-sided marketplace archetype:
// exactly TWO quarantined accent literals, one per audience. All tints,
// auroras, glows, and gradient inks are derived from them with color-mix()
// against scheme tokens, so nothing else carries a hue.
//
// Renter accent (teal): light #0F766E on white ≈ 5.5:1 (AA normal text);
// dark #5EEAD4 on the ~#101418 dark app surface ≈ 11.6:1 (AAA).
const RENT_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Owner accent (amber): light #B45309 on white ≈ 5.0:1 (AA normal text);
// dark #FBBF24 on the ~#101418 dark app surface ≈ 10.3:1 (AAA).
const EARN_ACCENT = 'light-dark(#B45309, #FBBF24)';
// Neutral ink for text ON an accent fill (not an accent hue): white on
// #0F766E ≈ 5.5:1 and on #B45309 ≈ 5.0:1 in light mode; near-black
// #101418 on #5EEAD4 ≈ 12.9:1 and on #FBBF24 ≈ 11.4:1 in dark mode.
const ACCENT_INK = 'light-dark(#FFFFFF, #101418)';

/** Accent tint helper — every wash/band derives from the two accents. */
function tint(accent: string, percent: number): string {
  return \`color-mix(in srgb, \${accent} \${percent}%, transparent)\`;
}

/**
 * Scheme-locked pastel of an accent for the dark CTA band: mixing 55%
 * accent into the stable white --color-on-dark token keeps ≥7:1 against
 * the band's inverted surface in BOTH schemes.
 */
function brighten(accent: string): string {
  return \`color-mix(in srgb, \${accent} 55%, var(--color-on-dark))\`;
}

// ---- scheme-locked dark band surfaces (token-derived, no new hues) ----
// Light scheme: --color-background-inverted (near-black). Dark scheme: the
// raised card token so the band still reads as a distinct dark panel.
const DARK_BG =
  'light-dark(var(--color-background-inverted), var(--color-background-card))';
const DARK_TEXT = 'var(--color-on-dark)';
const DARK_TEXT_SOFT =
  'color-mix(in srgb, var(--color-on-dark) 72%, transparent)';
const DARK_HAIRLINE =
  'color-mix(in srgb, var(--color-on-dark) 15%, transparent)';
const DARK_GLASS = 'color-mix(in srgb, var(--color-on-dark) 7%, transparent)';
/** Stable near-black ink for pastel accent fills on the dark band. */
const DARK_INK = 'var(--color-on-light)';

// ---- depth system: three tiers, neutral rgba depth only ----
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.3)';
const SHADOW_GLASS = \`inset 0 0 0 1px \${DARK_HAIRLINE}, \${SHADOW_FLOATING}\`;

/** Grain texture: inline feTurbulence data-URI, tiled at 4% opacity. */
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 ' +
  'width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E' +
  '%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 ' +
  'numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E' +
  '%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27/%3E' +
  '%3C/svg%3E")';

/** Dot-grid texture (band behind the pinned story). */
const DOT_GRID =
  'radial-gradient(color-mix(in srgb, var(--color-text-primary) 9%, transparent) 1px, transparent 1.4px)';

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 64;
/** Top offset of the pinned story's sticky stage inside the scroller. */
const STICKY_TOP = 72;

/**
 * Page-scoped classes + keyframes (transform/opacity only). The reduced-
 * motion media query flattens the hover choreography at the CSS level;
 * JS-driven motion (auroras, bob, marquee, pinned scene, reveals,
 * counters) is separately gated by the usePrefersReducedMotion flag.
 */
const PAGE_CSS = \`
@keyframes klSwapIn {
  from { opacity: 0; transform: translateY(14px) scale(0.99); }
  to { opacity: 1; transform: none; }
}
@keyframes klDriftA {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(48px, -34px, 0) scale(1.12); }
}
@keyframes klDriftB {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.06); }
  50% { transform: translate3d(-42px, 28px, 0) scale(0.94); }
}
@keyframes klBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}
@keyframes klMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.kl-cta { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.kl-cta:hover { transform: translateY(-1px); }
.kl-cta:active { transform: translateY(0) scale(0.98); }
.kl-sheen {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  transform: translateX(-130%) skewX(-14deg);
  background: linear-gradient(105deg, transparent 38%,
    color-mix(in srgb, var(--color-on-dark) 32%, transparent) 50%,
    transparent 62%);
  transition: transform 0.2s ease;
}
.kl-cta:hover .kl-sheen {
  transform: translateX(130%) skewX(-14deg);
  transition: transform 0.65s ease;
}
.kl-raise {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.kl-raise:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 0 1px var(--kl-glow, transparent),
    0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18),
    0 24px 48px -24px rgba(0, 0, 0, 0.3);
}
.kl-navlink:hover { color: var(--color-text-primary); }
.kl-marquee:hover .kl-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .kl-cta, .kl-sheen, .kl-raise { transition: none !important; }
  .kl-cta:hover, .kl-raise:hover { transform: none; }
  .kl-cta:hover .kl-sheen { transform: translateX(-130%) skewX(-14deg); }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN,
    backgroundSize: '160px 160px',
    opacity: 0.04,
    pointerEvents: 'none',
    zIndex: 60,
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
  section: {
    paddingBlock: 112,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  sectionCompact: {
    paddingBlock: 64,
  },
  // ---- sticky navbar (transparent at top; condenses after 24px) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    transition: 'background-color 0.25s ease, border-color 0.25s ease',
    borderBottom: '1px solid transparent',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    paddingInline: 'var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    // Brand mark blends the two sanctioned audience accents.
    background: \`linear-gradient(135deg, \${RENT_ACCENT} 0%, \${EARN_ACCENT} 100%)\`,
    color: ACCENT_INK,
    boxShadow: SHADOW_RAISED,
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
    transition: 'color 0.2s ease',
  },
  navMenu: {
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
    // px, not vh: vh resolves against the window when the demo renders this
    // page inline in a smaller stage, so a vh cap could overshoot the stage.
    maxHeight: 420,
    overflowY: 'auto',
  },
  navMenuLink: {
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
    color: 'inherit',
  },
  // ---- accent primary button (retints with the audience) ----
  accentButton: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    paddingInline: 22,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: ACCENT_INK,
    boxShadow: SHADOW_RAISED,
  },
  accentButtonSmall: {
    minHeight: 36,
    paddingInline: 14,
    fontSize: 13,
  },
  // ---- audience toggle ----
  togglePillRow: {
    display: 'inline-flex',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 74%, transparent)',
    border: '1px solid var(--color-border)',
    boxShadow: SHADOW_RAISED,
  },
  togglePill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  // ---- hero theater ----
  heroBand: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: -64,
  },
  hero: {
    position: 'relative',
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
  },
  heroCopy: {
    flex: '7 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  heroStage: {
    flex: '5 1 0',
    minWidth: 0,
    position: 'relative',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 26,
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 750,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    margin: 0,
  },
  heroHeadline: {
    fontWeight: 730,
    lineHeight: 1.03,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  sectionTitle: {
    fontWeight: 720,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionCopy: {
    fontSize: 15,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  // ---- vignette + satellites ----
  vignetteCard: {
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  vignetteSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  vignetteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  vignetteThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    flexShrink: 0,
  },
  vignetteBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    height: 64,
  },
  vignetteBar: {
    flex: '1 1 0',
    borderRadius: 4,
  },
  ratingChip: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  satellite: {
    position: 'absolute',
    zIndex: 2,
    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  satelliteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    whiteSpace: 'nowrap',
  },
  satelliteLabel: {
    fontSize: 12.5,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  satelliteSub: {
    fontSize: 11.5,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.25,
  },
  // ---- category tiles ----
  categoryTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
    boxShadow: SHADOW_RAISED,
  },
  categoryGlyph: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionLine: {
    minHeight: 24,
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
  },
  // ---- pinned scroll story ----
  pinStage: {
    position: 'sticky',
    top: STICKY_TOP,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  stepBtn: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    transition:
      'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  },
  stepBtnActive: {
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  stepDisc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  stepChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  railTrack: {
    position: 'absolute',
    left: 31,
    top: 18,
    bottom: 18,
    width: 2,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  railFill: {
    position: 'absolute',
    inset: 0,
    transformOrigin: 'top',
    transition: 'transform 0.2s linear',
  },
  stagePanel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-5)',
    boxSizing: 'border-box',
  },
  ghostNumeral: {
    position: 'absolute',
    top: -34,
    right: 4,
    fontSize: 150,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1,
    pointerEvents: 'none',
    fontVariantNumeric: 'tabular-nums',
  },
  mockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 13.5,
    fontWeight: 600,
  },
  mockSub: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  // ---- trust / payout cards ----
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    height: '100%',
    boxSizing: 'border-box',
    boxShadow: SHADOW_RAISED,
  },
  infoGlyph: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigFigure: {
    fontWeight: 780,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
  },
  // ---- reviews / stories ----
  reviewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    height: '100%',
    boxSizing: 'border-box',
    boxShadow: SHADOW_RAISED,
  },
  starRow: {
    fontSize: 14,
    letterSpacing: '0.1em',
  },
  quote: {
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
  monogram: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  earnChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    minHeight: 26,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  marqueeBand: {
    overflow: 'hidden',
    width: '100%',
  },
  marqueeTrack: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    width: 'max-content',
  },
  // ---- calculator ----
  calcCard: {
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    width: '100%',
    boxSizing: 'border-box',
  },
  calcEstimate: {
    fontSize: 56,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- stats panel (floats across the cities band boundary) ----
  statsPanel: {
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  statFigure: {
    fontSize: 46,
    fontWeight: 750,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
  statFigureCompact: {
    fontSize: 32,
  },
  // ---- city chips ----
  cityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    boxShadow: SHADOW_RAISED,
  },
  // ---- dark CTA band ----
  darkBand: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: DARK_BG,
    color: DARK_TEXT,
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  glassCard: {
    position: 'relative',
    borderRadius: 20,
    backgroundColor: DARK_GLASS,
    boxShadow: SHADOW_GLASS,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  // ---- email capture ----
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
  },
  emailRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  emailInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  emailError: {
    fontSize: 13,
    margin: 0,
    // Error token lightened toward on-dark so it reads on the dark band.
    color: 'color-mix(in srgb, var(--color-error) 55%, var(--color-on-dark))',
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  darkGhostButton: {
    alignSelf: 'flex-start',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    minHeight: 32,
    fontSize: 13,
    fontWeight: 600,
    color: DARK_TEXT_SOFT,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
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
// Deterministic fixtures for the fictional Kitloop gear-rental
// marketplace. No Date.now, no randomness, no network assets.

type Audience = 'rent' | 'earn';

interface AudienceTheme {
  id: Audience;
  toggleLabel: string;
  shortLabel: string;
  accent: string;
  /** Token partner for the gradient ink + aurora mixes (no new literals). */
  partner: string;
  headlineLead: string;
  headlineTail: string;
  subcopy: string;
  primaryCta: string;
  primaryTarget: SectionId;
  secondaryCta: string;
  secondaryTarget: SectionId;
  finePrint: string;
  navCta: string;
  pathAnchorLabel: string;
  trustAnchorLabel: string;
  ctaHeading: string;
  ctaCopy: string;
  ctaButton: string;
}

type SectionId = 'path' | 'how' | 'trust' | 'cities' | 'faq' | 'cta';

const AUDIENCES: Record<Audience, AudienceTheme> = {
  rent: {
    id: 'rent',
    toggleLabel: 'I want to rent',
    shortLabel: 'Rent',
    accent: RENT_ACCENT,
    partner: 'var(--color-icon-cyan)',
    headlineLead: 'Rent the good gear.',
    headlineTail: 'Skip the garage full of it.',
    subcopy:
      'Cameras, ski setups, e-bikes, and power tools from verified ' +
      'neighbors — for a weekend, not a mortgage. Every rental is covered ' +
      'up to $25,000 by KitCover.',
    primaryCta: 'Browse gear near you',
    primaryTarget: 'path',
    secondaryCta: 'How Kitloop works',
    secondaryTarget: 'how',
    finePrint: 'No deposit on most items · cancel free up to 24h before',
    navCta: 'Find gear',
    pathAnchorLabel: 'Browse gear',
    trustAnchorLabel: 'KitCover',
    ctaHeading: 'Gear up for the weekend',
    ctaCopy:
      'Tell us where you are and we’ll send the best listings within ' +
      '5 miles — takes about 90 seconds to book your first rental.',
    ctaButton: 'Get started',
  },
  earn: {
    id: 'earn',
    toggleLabel: 'I want to earn',
    shortLabel: 'Earn',
    accent: EARN_ACCENT,
    partner: 'var(--color-icon-pink)',
    headlineLead: 'Your gear already exists.',
    headlineTail: 'Make it pay rent.',
    subcopy:
      'List the camera, e-bike, or tool wall gathering dust and set your ' +
      'own rules. You approve every renter; KitCover backs every handoff ' +
      'up to $25,000 with a $0 owner deductible.',
    primaryCta: 'Estimate my earnings',
    primaryTarget: 'path',
    secondaryCta: 'See owner protection',
    secondaryTarget: 'trust',
    finePrint: 'Free to list · Kitloop takes 15% only when you get paid',
    navCta: 'Start earning',
    pathAnchorLabel: 'Earnings',
    trustAnchorLabel: 'Protection',
    ctaHeading: 'Your gear could be earning by Friday',
    ctaCopy:
      'The average first listing goes live in 11 minutes. We’ll email you ' +
      'a checklist and a pricing suggestion for your first item.',
    ctaButton: 'List my gear',
  },
};

/** Hero satellite mini-cards; retargeted per audience. */
interface SatelliteChip {
  id: string;
  icon: Glyph;
  label: string;
  sub: string;
}

const SATELLITES: Record<Audience, readonly SatelliteChip[]> = {
  rent: [
    {id: 'rating', icon: SparklesIcon, label: '4.9★ average', sub: '28,400 completed rentals'},
    {id: 'cover', icon: ShieldCheckIcon, label: 'KitCover attached', sub: 'up to $25,000'},
    {id: 'members', icon: UserCheckIcon, label: '92,400 members', sub: 'ID-verified'},
  ],
  earn: [
    {id: 'payout', icon: BanknoteIcon, label: 'Payout sent · $184', sub: 'lands Friday'},
    {id: 'deductible', icon: ShieldCheckIcon, label: '$0 owner deductible', sub: 'KitCover for owners'},
    {id: 'live', icon: SparklesIcon, label: 'Live in 11 minutes', sub: 'median first listing'},
  ],
};

interface GearCategory {
  id: string;
  label: string;
  icon: Glyph;
  listings: number;
  fromPrice: number;
  rating: number;
}

const CATEGORIES: readonly GearCategory[] = [
  {id: 'cameras', label: 'Cameras & lenses', icon: CameraIcon, listings: 6180, fromPrice: 18, rating: 4.9},
  {id: 'camping', label: 'Camping & hiking', icon: TentIcon, listings: 5940, fromPrice: 9, rating: 4.8},
  {id: 'ski', label: 'Ski & snowboard', icon: MountainSnowIcon, listings: 4730, fromPrice: 22, rating: 4.9},
  {id: 'ebikes', label: 'E-bikes & scooters', icon: BikeIcon, listings: 3660, fromPrice: 28, rating: 4.7},
  {id: 'audio', label: 'DJ & audio', icon: SpeakerIcon, listings: 3210, fromPrice: 31, rating: 4.8},
  {id: 'tools', label: 'Power tools', icon: WrenchIcon, listings: 7480, fromPrice: 11, rating: 4.8},
  {id: 'av', label: 'Projectors & AV', icon: ProjectorIcon, listings: 2140, fromPrice: 16, rating: 4.7},
  {id: 'water', label: 'Water sports', icon: WavesIcon, listings: 2890, fromPrice: 19, rating: 4.9},
];

/** A pinned-story step: rail copy + a staged product-mock state. */
interface PinStep {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}

const HOW_STEPS: readonly PinStep[] = [
  {
    id: 'find',
    icon: SearchIcon,
    title: 'Find gear nearby',
    copy:
      'Search 41,300 verified listings, filter by dates and distance, and ' +
      'compare owner ratings — most gear is under 2 miles away.',
  },
  {
    id: 'book',
    icon: ShieldCheckIcon,
    title: 'Book with KitCover built in',
    copy:
      'Pay in the app and coverage up to $25,000 attaches automatically. ' +
      'Most items are deposit-free; your card is never held.',
  },
  {
    id: 'pickup',
    icon: TruckIcon,
    title: 'Pick up or get it delivered',
    copy:
      'Meet the owner, or add doorstep delivery from $9 in core zones. ' +
      'Photo check-in on both ends keeps the condition on record.',
  },
];

interface TrustCard {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}

const TRUST_CARDS: readonly TrustCard[] = [
  {
    id: 'cover',
    icon: ShieldCheckIcon,
    title: '$25,000 KitCover protection',
    copy:
      'Every rental is covered for accidental damage and theft — ' +
      'automatically, with a renter deductible capped at $75.',
  },
  {
    id: 'verified',
    icon: UserCheckIcon,
    title: 'ID-verified members',
    copy:
      '94% of active members have completed government-ID plus selfie ' +
      'verification; the rest are capped at low-value items.',
  },
  {
    id: 'support',
    icon: LifeBuoyIcon,
    title: '24/7 human support',
    copy:
      'A real person answers in a median of 4 minutes during an active ' +
      'rental — for either side of the handoff.',
  },
  {
    id: 'deposit',
    icon: BanknoteIcon,
    title: 'Deposit-free on most gear',
    copy:
      'KitCover replaces deposits on most listings. Owners of items over ' +
      '$2,000 may require one; it always shows before you book.',
  },
];

interface Review {
  id: string;
  name: string;
  city: string;
  item: string;
  stars: number;
  quote: string;
}

const REVIEWS: readonly Review[] = [
  {
    id: 'dana',
    name: 'Dana R.',
    city: 'Denver',
    item: 'Rossignol ski set',
    stars: 5,
    quote:
      'Booked at 9pm, on the mountain by 8. The owner even threw in boot warmers.',
  },
  {
    id: 'miguel',
    name: 'Miguel S.',
    city: 'Austin',
    item: 'DJ controller + PA',
    stars: 5,
    quote:
      'Sound for my sister’s wedding cost less than one hour of the rental company’s quote.',
  },
  {
    id: 'priya',
    name: 'Priya K.',
    city: 'Seattle',
    item: 'Sony A7 IV kit',
    stars: 5,
    quote:
      'Lens spotless, batteries charged, sensor clean. Shot a full client weekend on it.',
  },
  {
    id: 'jonah',
    name: 'Jonah T.',
    city: 'Chicago',
    item: 'Tile saw',
    stars: 4,
    quote:
      'Saved me $400 on a one-weekend bathroom job. Pickup window was a bit tight.',
  },
  {
    id: 'amara',
    name: 'Amara O.',
    city: 'San Diego',
    item: 'Two paddleboards',
    stars: 5,
    quote: 'Delivered to the beach parking lot. We just… showed up and paddled.',
  },
  {
    id: 'felix',
    name: 'Felix W.',
    city: 'Portland',
    item: '6-person tent',
    stars: 5,
    quote:
      'Cheaper than buying, and I don’t have to store a tent I use twice a year.',
  },
];

interface ItemType {
  id: string;
  label: string;
  dailyRate: number;
  /** Honest share of listed days that actually get booked (12-mo median). */
  utilization: number;
  note?: string;
}

const ITEM_TYPES: readonly ItemType[] = [
  {id: 'camera', label: 'Mirrorless camera kit', dailyRate: 42, utilization: 0.52},
  {id: 'drone', label: 'Drone + controller', dailyRate: 55, utilization: 0.44},
  {id: 'ebike', label: 'E-bike', dailyRate: 34, utilization: 0.61},
  {
    id: 'ski',
    label: 'Ski or snowboard set',
    dailyRate: 26,
    utilization: 0.48,
    note: 'Winter-weighted — most ski earnings land Nov–Mar.',
  },
  {id: 'dj', label: 'DJ controller + PA', dailyRate: 48, utilization: 0.39},
  {id: 'tools', label: 'Power tool bundle', dailyRate: 19, utilization: 0.66},
];

const CALC_DISCLOSURE =
  'Based on the middle 50% of 214 comparable Kitloop listings over the ' +
  'last 12 months, after the 15% Kitloop fee. Dense cities earn more; new ' +
  'listings typically take 3–4 weeks to get their first booking.';

const PAYOUT_STEPS: readonly PinStep[] = [
  {
    id: 'paid',
    icon: BanknoteIcon,
    title: 'Paid within 24 hours',
    copy:
      'Payouts start when pickup is confirmed and land in 1–2 business ' +
      'days by bank transfer. No invoices, no chasing.',
  },
  {
    id: 'cover',
    icon: ShieldCheckIcon,
    title: 'KitCover for owners',
    copy:
      'Verified damage and theft covered up to $25,000 with a $0 owner ' +
      'deductible. Median claim resolves in 3 days.',
  },
  {
    id: 'rules',
    icon: CalendarCheckIcon,
    title: 'You set the rules',
    copy:
      'Approve every request. Require deposits, add buffer days between ' +
      'rentals, and block dates whenever you like.',
  },
  {
    id: 'pricing',
    icon: SparklesIcon,
    title: 'Smart pricing, optional',
    copy:
      'We suggest a daily rate from comparable listings and bump weekends ' +
      'and peak season. Override it per listing any time.',
  },
];

/** The pinned scroll story per audience path. */
const PIN_STORIES: Record<
  Audience,
  {eyebrow: string; title: string; steps: readonly PinStep[]}
> = {
  rent: {
    eyebrow: 'How it works',
    title: 'Three steps between you and the good gear',
    steps: HOW_STEPS,
  },
  earn: {
    eyebrow: 'Payouts & protection',
    title: 'Lend on your terms, paid on ours: fast',
    steps: PAYOUT_STEPS,
  },
};

interface EarnerStory {
  id: string;
  name: string;
  initials: string;
  city: string;
  gear: string;
  monthly: number;
  months: number;
  quote: string;
}

const EARNER_STORIES: readonly EarnerStory[] = [
  {
    id: 'priya-n',
    name: 'Priya N.',
    initials: 'PN',
    city: 'Denver',
    gear: 'Camera kits',
    monthly: 910,
    months: 14,
    quote:
      'My A7 IV paid for itself in eleven weekends. Now the whole shelf works for a living.',
  },
  {
    id: 'marcus',
    name: 'Marcus L.',
    initials: 'ML',
    city: 'Austin',
    gear: 'DJ + PA rig',
    monthly: 760,
    months: 9,
    quote:
      'Wedding season books my speakers three weekends a month. I block the fourth for my own gigs.',
  },
  {
    id: 'tove',
    name: 'Tove H.',
    initials: 'TH',
    city: 'Seattle',
    gear: 'Camping bundles',
    monthly: 540,
    months: 22,
    quote:
      'Four tents that used to live in my garage now fund next summer’s trips.',
  },
];

const EARNER_DISCLOSURE =
  'These are top-5% owners. The median active Kitloop owner earned ' +
  '$210/mo over the last year.';

interface Stat {
  id: string;
  value: number;
  decimals: number;
  prefix: string;
  suffix: string;
  label: string;
}

const STATS: readonly Stat[] = [
  {id: 'members', value: 92400, decimals: 0, prefix: '', suffix: '', label: 'verified members'},
  {id: 'listings', value: 41300, decimals: 0, prefix: '', suffix: '', label: 'listings live today'},
  {id: 'cities', value: 12, decimals: 0, prefix: '', suffix: '', label: 'launch cities'},
  {id: 'paid', value: 6.8, decimals: 1, prefix: '$', suffix: 'M', label: 'paid to owners'},
];

interface City {
  id: string;
  name: string;
  listings: number;
  pickupMiles: number;
  topCategory: string;
}

const CITIES: readonly City[] = [
  {id: 'portland', name: 'Portland', listings: 3840, pickupMiles: 1.4, topCategory: 'Camping & hiking'},
  {id: 'denver', name: 'Denver', listings: 4120, pickupMiles: 1.8, topCategory: 'Ski & snowboard'},
  {id: 'austin', name: 'Austin', listings: 3660, pickupMiles: 2.1, topCategory: 'DJ & audio'},
  {id: 'seattle', name: 'Seattle', listings: 4480, pickupMiles: 1.6, topCategory: 'Cameras & lenses'},
  {id: 'chicago', name: 'Chicago', listings: 3910, pickupMiles: 2.4, topCategory: 'Power tools'},
  {id: 'minneapolis', name: 'Minneapolis', listings: 2730, pickupMiles: 1.9, topCategory: 'E-bikes & scooters'},
  {id: 'slc', name: 'Salt Lake City', listings: 2510, pickupMiles: 2.2, topCategory: 'Ski & snowboard'},
  {id: 'asheville', name: 'Asheville', listings: 1480, pickupMiles: 1.2, topCategory: 'Camping & hiking'},
  {id: 'boulder', name: 'Boulder', listings: 1960, pickupMiles: 0.9, topCategory: 'E-bikes & scooters'},
  {id: 'sandiego', name: 'San Diego', listings: 3240, pickupMiles: 2.0, topCategory: 'Water sports'},
  {id: 'burlington', name: 'Burlington', listings: 1120, pickupMiles: 1.1, topCategory: 'Ski & snowboard'},
  {id: 'bend', name: 'Bend', listings: 1340, pickupMiles: 0.8, topCategory: 'Camping & hiking'},
];

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const FAQ: Record<Audience, readonly FaqEntry[]> = {
  rent: [
    {
      id: 'deposit',
      question: 'Do I need to leave a deposit?',
      answer:
        'Most listings are deposit-free — KitCover protects the owner, so they don’t need to hold your money. Owners of items over $2,000 can require one; it shows on the listing before you book and is released within 48 hours of return.',
    },
    {
      id: 'damage',
      question: 'What happens if I damage something?',
      answer:
        'Tell us in the app within 24 hours. KitCover handles accidental damage up to $25,000 and your renter deductible is capped at $75. Intentional damage and gross negligence aren’t covered.',
    },
    {
      id: 'pickup',
      question: 'How do pickups and returns work?',
      answer:
        'Meet the owner at an agreed spot, or add doorstep delivery from $9 in core zones. Both sides confirm the handoff in the app with photos, so the item’s condition is on record in both directions.',
    },
    {
      id: 'extend',
      question: 'Can I extend a rental?',
      answer:
        'Request an extension from your trip screen; the owner has 4 hours to accept before it expires. Extensions keep the same daily rate and KitCover extends automatically.',
    },
    {
      id: 'who',
      question: 'Who can rent on Kitloop?',
      answer:
        'Anyone 18+ with a verified ID and a payment method. High-value categories like drones and e-bikes also ask for a short experience checklist before your first booking.',
    },
  ],
  earn: [
    {
      id: 'payout',
      question: 'When do I get paid?',
      answer:
        'Payouts start within 24 hours of pickup confirmation and land in 1–2 business days by bank transfer. Kitloop’s 15% fee is deducted automatically — no invoices, no chasing.',
    },
    {
      id: 'damage',
      question: 'What if a renter damages my gear?',
      answer:
        'File a claim with photos within 72 hours of the return. KitCover pays verified damage and theft up to $25,000 with a $0 owner deductible, and the median claim resolves in 3 days.',
    },
    {
      id: 'requests',
      question: 'Do I have to accept every request?',
      answer:
        'No. You approve each request individually, and you can require a deposit, add buffer days between rentals, and block out dates at any time.',
    },
    {
      id: 'taxes',
      question: 'What about taxes?',
      answer:
        'You get an annual earnings statement, and a 1099-K if you cross the IRS reporting threshold. Kitloop doesn’t withhold; talk to a tax professional about deductions like depreciation.',
    },
    {
      id: 'pricing',
      question: 'How should I price my gear?',
      answer:
        'Smart pricing suggests a daily rate from comparable nearby listings and raises weekends and peak season automatically. You can override it per listing whenever you like.',
    },
  ],
};

interface FooterColumn {
  id: string;
  heading: string;
  links: readonly {
    label: string;
    target?: SectionId;
    switchTo?: Audience;
  }[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    id: 'marketplace',
    heading: 'Marketplace',
    links: [
      {label: 'Browse categories', target: 'path', switchTo: 'rent'},
      {label: 'Cities', target: 'cities'},
      {label: 'KitCover protection', target: 'trust'},
      {label: 'Gift cards'},
    ],
  },
  {
    id: 'owners',
    heading: 'Owners',
    links: [
      {label: 'List your gear', target: 'cta', switchTo: 'earn'},
      {label: 'Earnings calculator', target: 'path', switchTo: 'earn'},
      {label: 'Owner protection', target: 'trust', switchTo: 'earn'},
      {label: 'Owner guide'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [{label: 'About'}, {label: 'Careers'}, {label: 'Press'}, {label: 'Blog'}],
  },
  {
    id: 'support',
    heading: 'Support',
    links: [
      {label: 'Help center'},
      {label: 'Safety standards'},
      {label: 'Contact us'},
      {label: 'Terms & privacy'},
    ],
  },
];

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to get the link.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return 'That doesn’t look like an email address.';
  }
  return null;
}

function formatCount(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Round to the nearest \`step\` — keeps the calculator honest-looking. */
function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function starString(stars: number): string {
  return '★★★★★'.slice(0, stars) + '☆☆☆☆☆'.slice(0, 5 - stars);
}

// ============= HOOKS =============

/**
 * Measures the page's own width with a ResizeObserver — the demo stage is
 * ~1045px wide inside a 1440px window, so viewport media queries never
 * fire there. All breakpoints derive from this width.
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

/** Measured height of the scrollport; sizes the pinned story's stage. */
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

/** Live prefers-reduced-motion flag; gates reveals, counters, and swaps. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
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
 * True once the node has intersected the viewport (15% visible), then
 * stays true. Falls back to visible when IntersectionObserver is missing
 * so nothing renders as a wall of zeros in static environments.
 */
function useInViewOnce(): [RefObject<HTMLDivElement | null>, boolean] {
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
      {threshold: 0.15},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// ============= SMALL PIECES =============

/**
 * Rise+fade+settle scroll reveal (translateY 16px + scale .985 →
 * identity over 600ms on a decelerate bezier); parents stagger children
 * via \`delay\` in 60-90ms steps. Renders visible under reduced motion.
 */
function Reveal({
  reduced,
  delay = 0,
  style,
  children,
}: {
  reduced: boolean;
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [ref, inView] = useInViewOnce();
  const shown = reduced || inView;
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px) scale(0.985)',
        transition: reduced
          ? 'none'
          : \`opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) \${delay}ms, \` +
            \`transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) \${delay}ms\`,
        ...style,
      }}>
      {children}
    </div>
  );
}

/**
 * Eases toward \`value\` in 40 fixed setInterval steps (~900ms, decelerate)
 * once active; retargets from the current display when \`value\` changes
 * (calculator), and snaps instantly under reduced motion.
 */
function AnimatedNumber({
  value,
  isActive,
  reduced,
  format,
}: {
  value: number;
  isActive: boolean;
  reduced: boolean;
  format: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  displayRef.current = display;

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reduced) {
      setDisplay(value);
      return undefined;
    }
    const from = displayRef.current;
    if (from === value) {
      return undefined;
    }
    const steps = 40;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const t = i / steps;
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (value - from) * eased);
      if (i >= steps) {
        clearInterval(id);
      }
    }, 22);
    return () => clearInterval(id);
  }, [value, isActive, reduced]);

  return <span>{format(display)}</span>;
}

/** 40px icon-only button (Astryx Button caps at 36px). */
function IconButton40({
  label,
  icon,
  onClick,
  ariaExpanded,
}: {
  label: string;
  icon: Glyph;
  onClick: () => void;
  ariaExpanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      style={styles.iconButton}>
      <Icon icon={icon} size="sm" color="inherit" />
    </button>
  );
}

/** Kitloop brand mark: dual-accent gradient tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={RepeatIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">Kitloop</Text>
    </HStack>
  );
}

/**
 * The signature audience toggle. Each pill fills with ITS audience accent
 * when active, so the control itself telegraphs the page retint.
 */
function AudienceToggle({
  audience,
  onChange,
  size,
}: {
  audience: Audience;
  onChange: (next: Audience) => void;
  size: 'lg' | 'sm';
}) {
  const metrics: CSSProperties =
    size === 'lg'
      ? {minHeight: 44, paddingInline: 20, fontSize: 15}
      : {minHeight: 32, paddingInline: 12, fontSize: 13};
  return (
    <div style={styles.togglePillRow} role="group" aria-label="Choose your side">
      {(Object.keys(AUDIENCES) as Audience[]).map(id => {
        const theme = AUDIENCES[id];
        const isActive = audience === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            style={{
              ...styles.togglePill,
              ...metrics,
              ...(isActive
                ? {backgroundColor: theme.accent, color: ACCENT_INK}
                : null),
            }}>
            {size === 'lg' ? theme.toggleLabel : theme.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Audience-accent primary CTA with the sheen-sweep micro-interaction
 * (the retint story needs a literal fill). \`fill\`/\`ink\` overrides let the
 * dark band use the scheme-locked pastel + near-black ink pair.
 */
function AccentButton({
  label,
  accent,
  onClick,
  small,
  icon,
  fill,
  ink,
}: {
  label: string;
  accent: string;
  onClick: () => void;
  small?: boolean;
  icon?: Glyph;
  fill?: string;
  ink?: string;
}) {
  return (
    <button
      type="button"
      className="kl-cta"
      onClick={onClick}
      style={{
        ...styles.accentButton,
        ...(small ? styles.accentButtonSmall : null),
        backgroundColor: fill ?? accent,
        ...(ink != null ? {color: ink} : null),
      }}>
      {label}
      {icon != null ? <Icon icon={icon} size="sm" color="inherit" /> : null}
      <span className="kl-sheen" aria-hidden="true" />
    </button>
  );
}

/**
 * Section intro: tracked accent eyebrow chip + display heading +
 * supporting copy capped at ~56ch. \`onDark\` swaps to the scheme-locked
 * on-dark ink pair for the dark CTA band.
 */
function SectionHead({
  eyebrow,
  title,
  copy,
  accent,
  compact,
  onDark,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  accent: string;
  compact: boolean;
  onDark?: boolean;
}) {
  const inkAccent = onDark ? brighten(accent) : accent;
  return (
    <VStack gap={3}>
      <p
        style={{
          ...styles.eyebrow,
          color: inkAccent,
          backgroundColor: tint(inkAccent, 10),
          alignSelf: 'flex-start',
        }}>
        {eyebrow}
      </p>
      <h2
        style={{
          ...styles.sectionTitle,
          fontSize: compact ? 30 : 40,
          color: onDark ? DARK_TEXT : 'var(--color-text-primary)',
        }}>
        {title}
      </h2>
      {copy != null ? (
        <p
          style={{
            ...styles.sectionCopy,
            ...(onDark ? {color: DARK_TEXT_SOFT} : null),
          }}>
          {copy}
        </p>
      ) : null}
    </VStack>
  );
}

/**
 * Aurora field: three drifting accent blobs derived via color-mix from
 * the active accent + partner/success tokens. Absolute inside a
 * position:relative overflow:hidden band; static under reduced motion.
 */
function Aurora({
  accent,
  partner,
  reduced,
  dim,
}: {
  accent: string;
  partner: string;
  reduced: boolean;
  dim?: boolean;
}) {
  const blobs: readonly CSSProperties[] = [
    {
      width: 540,
      height: 540,
      top: '-18%',
      left: '-8%',
      opacity: dim ? 0.35 : 0.45,
      background: \`radial-gradient(circle at 30% 30%, color-mix(in srgb, \${accent} 55%, \${partner}), transparent 70%)\`,
      animation: reduced ? undefined : 'klDriftA 38s ease-in-out infinite',
    },
    {
      width: 460,
      height: 460,
      top: '2%',
      right: '-12%',
      opacity: dim ? 0.35 : 0.4,
      background: \`radial-gradient(circle at 60% 40%, color-mix(in srgb, \${accent} 45%, var(--color-success)), transparent 70%)\`,
      animation: reduced ? undefined : 'klDriftB 44s ease-in-out infinite',
    },
    {
      width: 380,
      height: 380,
      bottom: '-32%',
      left: '34%',
      opacity: dim ? 0.35 : 0.42,
      background: \`radial-gradient(circle at 50% 50%, \${tint(accent, 60)}, transparent 70%)\`,
      animation: reduced
        ? undefined
        : 'klDriftA 32s ease-in-out -12s infinite reverse',
    },
  ];
  return (
    <div aria-hidden="true" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {blobs.map((blob, index) => (
        <div key={index} style={{...styles.auroraBlob, ...blob}} />
      ))}
    </div>
  );
}

/**
 * Hero satellite: an absolutely-positioned mini-card that bobs on its own
 * keyframe (negative delay) inside a parallax wrapper driven by the
 * --kl-px/--kl-py pointer vars set on the hero stage.
 */
function Satellite({
  chip,
  accent,
  reduced,
  position,
  parallax,
  bob,
}: {
  chip: SatelliteChip;
  accent: string;
  reduced: boolean;
  position: CSSProperties;
  parallax: {x: number; y: number};
  bob: {duration: number; delay: number};
}) {
  return (
    <div
      style={{
        ...styles.satellite,
        ...position,
        transform: reduced
          ? undefined
          : \`translate3d(calc(var(--kl-px, 0) * \${parallax.x}px), calc(var(--kl-py, 0) * \${parallax.y}px), 0)\`,
      }}>
      <div
        style={{
          ...styles.satelliteCard,
          animation: reduced
            ? undefined
            : \`klBob \${bob.duration}s ease-in-out \${bob.delay}s infinite\`,
        }}>
        <span
          style={{
            ...styles.categoryGlyph,
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: tint(accent, 14),
            color: accent,
          }}
          aria-hidden="true">
          <Icon icon={chip.icon} size="xsm" color="inherit" />
        </span>
        <VStack gap={0}>
          <span style={styles.satelliteLabel}>{chip.label}</span>
          <span style={styles.satelliteSub}>{chip.sub}</span>
        </VStack>
      </div>
    </div>
  );
}

/** Renter hero vignette: schematic search-and-book product mock. */
function RentVignette({accent}: {accent: string}) {
  const results = [
    {name: 'Rossignol Experience 86 set', meta: '$24/day · 0.6 mi', rating: '4.9★', instant: true},
    {name: 'Sony A7 IV + 24-70 f/2.8', meta: '$38/day · 1.1 mi', rating: '5.0★', instant: false},
    {name: 'Rad Runner e-bike', meta: '$29/day · 0.8 mi', rating: '4.8★', instant: true},
  ];
  return (
    <div style={styles.vignetteCard} role="img" aria-label="Schematic Kitloop search results near you">
      <div style={styles.vignetteSearch}>
        <Icon icon={SearchIcon} size="sm" color="inherit" />
        <span>Ski &amp; snowboard · Denver · Feb 13–16</span>
      </div>
      {results.map(row => (
        <div key={row.name} style={styles.vignetteRow}>
          <div
            style={{
              ...styles.vignetteThumb,
              background: \`linear-gradient(135deg, \${tint(accent, 55)}, \${tint(accent, 18)})\`,
            }}
            aria-hidden="true"
          />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {row.name}
              </Text>
              <Text type="supporting" color="secondary">
                {row.meta}
              </Text>
            </VStack>
          </StackItem>
          {row.instant ? <Badge label="Instant book" /> : null}
          <span style={{...styles.ratingChip, color: accent}}>{row.rating}</span>
        </div>
      ))}
      <HStack gap={2} vAlign="center">
        <span style={{color: accent, display: 'inline-flex'}}>
          <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
        </span>
        <Text type="supporting" color="secondary">
          Every rental covered up to $25,000 by KitCover
        </Text>
      </HStack>
    </div>
  );
}

/** Owner hero vignette: schematic listings-dashboard product mock. */
function EarnVignette({accent}: {accent: string}) {
  const bars = [34, 52, 41, 68, 57, 84];
  return (
    <div style={styles.vignetteCard} role="img" aria-label="Schematic Kitloop owner dashboard">
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text size="sm" weight="semibold">
            Your listings
          </Text>
        </StackItem>
        <span
          style={{
            ...styles.earnChip,
            backgroundColor: tint(accent, 14),
            color: accent,
          }}>
          Next payout Fri · $184
        </span>
      </HStack>
      <div style={styles.vignetteRow}>
        <div
          style={{
            ...styles.vignetteThumb,
            background: \`linear-gradient(135deg, \${tint(accent, 55)}, \${tint(accent, 18)})\`,
          }}
          aria-hidden="true"
        />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              Sony A7 IV kit
            </Text>
            <Text type="supporting" color="secondary">
              $38/day · 4 requests this week
            </Text>
          </VStack>
        </StackItem>
        <Badge label="Booked this weekend" />
      </div>
      <div style={styles.vignetteBars} aria-hidden="true">
        {bars.map((height, index) => (
          <div
            key={index}
            style={{
              ...styles.vignetteBar,
              height: \`\${height}%\`,
              backgroundColor: tint(accent, index === bars.length - 1 ? 85 : 35),
            }}
          />
        ))}
      </div>
      <Text type="supporting" color="secondary">
        July earnings · $312 across 2 listings
      </Text>
    </div>
  );
}

/** One stats-panel figure with its own first-view count-up. */
function StatFigure({
  stat,
  accent,
  reduced,
  compact,
}: {
  stat: Stat;
  accent: string;
  reduced: boolean;
  compact: boolean;
}) {
  const [ref, inView] = useInViewOnce();
  return (
    <div ref={ref}>
      <VStack gap={1}>
        <span
          style={{
            ...styles.statFigure,
            ...(compact ? styles.statFigureCompact : null),
            color: accent,
          }}>
          <AnimatedNumber
            value={stat.value}
            isActive={inView}
            reduced={reduced}
            format={n =>
              \`\${stat.prefix}\${
                stat.decimals > 0 ? n.toFixed(stat.decimals) : formatCount(n)
              }\${stat.suffix}\`
            }
          />
        </span>
        <Text type="supporting" color="secondary">
          {stat.label}
        </Text>
      </VStack>
    </div>
  );
}

/** Top-earner story card with a count-up monthly chip. */
function EarnerStoryCard({
  story,
  accent,
  reduced,
}: {
  story: EarnerStory;
  accent: string;
  reduced: boolean;
}) {
  const [ref, inView] = useInViewOnce();
  return (
    <div
      ref={ref}
      className="kl-raise"
      style={{...styles.reviewCard, '--kl-glow': tint(accent, 45)} as CSSProperties}>
      <HStack gap={3} vAlign="center">
        <div
          style={{
            ...styles.monogram,
            backgroundColor: tint(accent, 16),
            color: accent,
          }}
          aria-hidden="true">
          {story.initials}
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              {story.name} · {story.city}
            </Text>
            <Text type="supporting" color="secondary">
              {story.gear} · {story.months} months on Kitloop
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <span
        style={{
          ...styles.earnChip,
          backgroundColor: tint(accent, 14),
          color: accent,
          alignSelf: 'flex-start',
        }}>
        <AnimatedNumber
          value={story.monthly}
          isActive={inView}
          reduced={reduced}
          format={n => \`$\${formatCount(n)}\`}
        />
        /mo avg
      </span>
      <p style={styles.quote}>“{story.quote}”</p>
    </div>
  );
}

/** Review card; fixed-width inside the marquee, fluid in the grid. */
function ReviewCard({
  review,
  accent,
  fixedWidth,
}: {
  review: Review;
  accent: string;
  fixedWidth?: boolean;
}) {
  return (
    <div
      className="kl-raise"
      style={
        {
          ...styles.reviewCard,
          ...(fixedWidth ? {width: 320, flexShrink: 0} : null),
          '--kl-glow': tint(accent, 45),
        } as CSSProperties
      }>
      <span
        style={{...styles.starRow, color: accent}}
        aria-label={\`\${review.stars} out of 5 stars\`}>
        {starString(review.stars)}
      </span>
      <p style={styles.quote}>“{review.quote}”</p>
      <Text type="supporting" color="secondary">
        {review.name} · {review.city} · rented a {review.item}
      </Text>
    </div>
  );
}

/** Schematic mock row for the pinned-story stage panels. */
function MockRow({
  icon,
  label,
  sub,
  trailing,
  accent,
}: {
  icon: Glyph;
  label: string;
  sub?: string;
  trailing?: string;
  accent: string;
}) {
  return (
    <div style={styles.mockRow}>
      <span style={{color: accent, display: 'inline-flex', flexShrink: 0}}>
        <Icon icon={icon} size="xsm" color="inherit" />
      </span>
      <span style={{flex: '1 1 0', minWidth: 0}}>
        {label}
        {sub != null ? (
          <>
            {' '}
            <span style={styles.mockSub}>· {sub}</span>
          </>
        ) : null}
      </span>
      {trailing != null ? (
        <span style={{...styles.ratingChip, color: accent}}>{trailing}</span>
      ) : null}
    </div>
  );
}

/**
 * The staged product-mock state for one pinned-story step. Composed from
 * real layout — search pills, list rows, checklists, chips — per step id.
 */
function StageMock({stepId, accent}: {stepId: string; accent: string}) {
  const chip = (label: string) => (
    <span
      style={{
        ...styles.earnChip,
        backgroundColor: tint(accent, 14),
        color: accent,
        alignSelf: 'flex-start',
      }}>
      {label}
    </span>
  );
  switch (stepId) {
    case 'find':
      return (
        <VStack gap={2}>
          <div style={styles.vignetteSearch}>
            <Icon icon={SearchIcon} size="sm" color="inherit" />
            <span>Ski &amp; snowboard · Denver · Feb 13–16</span>
          </div>
          <MockRow
            icon={MountainSnowIcon}
            label="Rossignol Experience 86 set"
            sub="$24/day · 0.6 mi"
            trailing="4.9★"
            accent={accent}
          />
          <MockRow
            icon={CameraIcon}
            label="Sony A7 IV + 24-70 f/2.8"
            sub="$38/day · 1.1 mi"
            trailing="5.0★"
            accent={accent}
          />
          {chip('41,300 listings live today')}
        </VStack>
      );
    case 'book':
      return (
        <VStack gap={2}>
          <MockRow
            icon={CalendarCheckIcon}
            label="Rossignol Experience 86 set"
            sub="3 days · Feb 13–16"
            trailing="$72"
            accent={accent}
          />
          <MockRow
            icon={ShieldCheckIcon}
            label="KitCover attached automatically"
            sub="up to $25,000 · $75 max deductible"
            accent={accent}
          />
          <MockRow
            icon={CheckIcon}
            label="No deposit — your card is never held"
            accent={accent}
          />
          {chip('Booked · confirmation sent')}
        </VStack>
      );
    case 'pickup':
      return (
        <VStack gap={2}>
          <MockRow
            icon={CheckIcon}
            label="Photo check-in · owner"
            sub="Sat 8:04 AM"
            accent={accent}
          />
          <MockRow
            icon={CheckIcon}
            label="Photo check-in · renter"
            sub="Sat 8:06 AM"
            accent={accent}
          />
          <MockRow
            icon={TruckIcon}
            label="Doorstep delivery"
            sub="from $9 in core zones"
            accent={accent}
          />
          {chip('Condition on record — both directions')}
        </VStack>
      );
    case 'paid':
      return (
        <VStack gap={2}>
          <MockRow
            icon={BanknoteIcon}
            label="Payout started · $184"
            sub="pickup confirmed"
            accent={accent}
          />
          <MockRow
            icon={CheckIcon}
            label="Bank transfer · 1–2 business days"
            sub="•••• 4821"
            accent={accent}
          />
          {chip('No invoices, no chasing')}
        </VStack>
      );
    case 'cover':
      return (
        <VStack gap={2}>
          <MockRow
            icon={ShieldCheckIcon}
            label="$25,000 coverage · $0 owner deductible"
            accent={accent}
          />
          <HStack gap={2} wrap="wrap">
            {chip('Filed · day 0')}
            {chip('Verified · day 1')}
            {chip('Paid · day 3')}
          </HStack>
          <MockRow
            icon={CheckIcon}
            label="Median claim resolves in 3 days"
            accent={accent}
          />
        </VStack>
      );
    case 'rules':
      return (
        <VStack gap={2}>
          <MockRow icon={CheckIcon} label="Approve every request" accent={accent} />
          <MockRow
            icon={CheckIcon}
            label="Buffer day between rentals"
            accent={accent}
          />
          <MockRow
            icon={CheckIcon}
            label="Deposit required over $2,000"
            accent={accent}
          />
          {chip('Block dates whenever you like')}
        </VStack>
      );
    default:
      return (
        <VStack gap={2}>
          <MockRow
            icon={SparklesIcon}
            label="$42/day suggested"
            sub="from 214 comparable listings"
            accent={accent}
          />
          {chip('+ weekend & peak-season bumps')}
          <MockRow
            icon={CheckIcon}
            label="Override any time, per listing"
            accent={accent}
          />
        </VStack>
      );
  }
}

/**
 * The pinned scroll story: a sticky stage inside a tall container whose
 * scroll progress selects the active step, crossfades the staged mock,
 * and fills the numbered rail. Steps are clickable (scrolls the page to
 * the matching progress point). Under reduced motion this renders as a
 * static stacked sequence instead.
 */
function PinnedStory({
  story,
  accent,
  reduced,
  stacked,
  compactHead,
  stickyH,
  rangeH,
  progress,
  onStepJump,
  pinRef,
  columnStyle,
}: {
  story: {eyebrow: string; title: string; steps: readonly PinStep[]};
  accent: string;
  reduced: boolean;
  stacked: boolean;
  compactHead: boolean;
  stickyH: number;
  rangeH: number;
  progress: number;
  onStepJump: (index: number, count: number) => void;
  pinRef: RefObject<HTMLDivElement | null>;
  columnStyle: CSSProperties;
}) {
  const steps = story.steps;
  const count = steps.length;
  const active = Math.min(count - 1, Math.floor((progress / 100) * count));

  if (reduced) {
    // Static stacked sequence — everything visible, no pinning.
    return (
      <div style={{...columnStyle, paddingBlock: 64}}>
        <VStack gap={6}>
          <SectionHead
            accent={accent}
            eyebrow={story.eyebrow}
            title={story.title}
            compact={compactHead}
          />
          {steps.map((step, index) => (
            <div key={step.id} style={{...styles.stagePanel, overflow: 'visible'}}>
              <VStack gap={3}>
                <HStack gap={3} vAlign="center">
                  <div
                    style={{
                      ...styles.stepDisc,
                      backgroundColor: tint(accent, 14),
                      color: accent,
                    }}
                    aria-hidden="true">
                    {index + 1}
                  </div>
                  <Text type="label">{step.title}</Text>
                </HStack>
                <Text type="body" color="secondary">
                  {step.copy}
                </Text>
                <StageMock stepId={step.id} accent={accent} />
              </VStack>
            </div>
          ))}
        </VStack>
      </div>
    );
  }

  const stageHeight = Math.max(300, Math.min(430, stickyH - (stacked ? 240 : 170)));

  return (
    <div ref={pinRef} style={{position: 'relative', height: stickyH + rangeH}}>
      <div style={{...styles.pinStage, height: stickyH}}>
        <div style={{...columnStyle}}>
          <VStack gap={5}>
            <SectionHead
              accent={accent}
              eyebrow={story.eyebrow}
              title={story.title}
              compact={compactHead}
            />
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-6)',
                flexDirection: stacked ? 'column' : 'row',
                alignItems: 'stretch',
              }}>
              {stacked ? (
                <HStack gap={2} wrap="wrap">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      aria-pressed={index === active}
                      onClick={() => onStepJump(index, count)}
                      style={{
                        ...styles.stepChip,
                        ...(index === active
                          ? {
                              borderColor: accent,
                              boxShadow: \`0 0 0 1px \${accent}\`,
                              color: accent,
                            }
                          : null),
                      }}>
                      <span aria-hidden="true">{index + 1}</span>
                      {step.title}
                    </button>
                  ))}
                </HStack>
              ) : (
                <div style={{flex: '5 1 0', minWidth: 0, position: 'relative'}}>
                  <div style={styles.railTrack} aria-hidden="true">
                    <div
                      style={{
                        ...styles.railFill,
                        backgroundColor: accent,
                        transform: \`scaleY(\${progress / 100})\`,
                      }}
                    />
                  </div>
                  <VStack gap={2}>
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        type="button"
                        aria-pressed={index === active}
                        onClick={() => onStepJump(index, count)}
                        style={{
                          ...styles.stepBtn,
                          ...(index === active ? styles.stepBtnActive : null),
                        }}>
                        <div
                          style={{
                            ...styles.stepDisc,
                            backgroundColor:
                              index <= active ? accent : tint(accent, 14),
                            color: index <= active ? ACCENT_INK : accent,
                            transition: 'background-color 0.3s ease, color 0.3s ease',
                          }}
                          aria-hidden="true">
                          {index + 1}
                        </div>
                        <VStack gap={1}>
                          <Text type="label">{step.title}</Text>
                          <Text type="supporting" color="secondary">
                            {step.copy}
                          </Text>
                        </VStack>
                      </button>
                    ))}
                  </VStack>
                </div>
              )}
              <div
                style={{
                  flex: stacked ? undefined : '7 1 0',
                  minWidth: 0,
                  position: 'relative',
                  height: stageHeight,
                }}>
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    aria-hidden={index !== active}
                    style={{
                      ...styles.stagePanel,
                      position: 'absolute',
                      inset: 0,
                      opacity: index === active ? 1 : 0,
                      transform:
                        index === active ? 'none' : 'translateY(14px) scale(0.99)',
                      transition:
                        'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: index === active ? 'auto' : 'none',
                    }}>
                    <span
                      style={{...styles.ghostNumeral, color: tint(accent, 12)}}
                      aria-hidden="true">
                      0{index + 1}
                    </span>
                    <VStack gap={3}>
                      <HStack gap={2} vAlign="center">
                        <span
                          style={{
                            ...styles.infoGlyph,
                            backgroundColor: tint(accent, 14),
                            color: accent,
                          }}
                          aria-hidden="true">
                          <Icon icon={step.icon} size="sm" color="inherit" />
                        </span>
                        <Text type="label">{step.title}</Text>
                      </HStack>
                      <StageMock stepId={step.id} accent={accent} />
                    </VStack>
                  </div>
                ))}
              </div>
            </div>
          </VStack>
        </div>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MarketplaceDuoLandingTemplate() {
  // ---- the signature audience state; retints the whole page ----
  const [audience, setAudience] = useState<Audience>('rent');
  const theme = AUDIENCES[audience];
  const accent = theme.accent;

  // ---- responsive: measured page width, not viewport ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(wrapRef);
  const isNavCompact = width > 0 && width <= 780;
  const isHeroStacked = width > 0 && width <= 840;
  const isPhone = width > 0 && width <= 520;
  const catCols = width > 1000 ? 4 : width > 680 ? 3 : 2;
  const reviewCols = width > 1000 ? 3 : width > 640 ? 2 : 1;
  const storyCols = width > 900 ? 3 : width > 620 ? 2 : 1;
  const statCols = width > 680 ? 4 : 2;
  const footerCols = width > 900 ? 4 : 2;
  const heroFont = width > 1000 ? 76 : width > 820 ? 64 : width > 600 ? 52 : 40;

  const reduced = usePrefersReducedMotion();

  // ---- scroll chrome: condensed nav, re-docked toggle, pinned scene ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavToggle, setShowNavToggle] = useState(false);
  const [pinProgress, setPinProgress] = useState(0);

  const viewH = useElementHeight(pageRef);
  const stickyH = Math.max(430, Math.min(660, (viewH || 720) - STICKY_TOP - 24));
  const rangeH = Math.round(stickyH * 1.45);

  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const top = container.scrollTop;
    setIsScrolled(top > 24);
    const hero = heroRef.current;
    const gate =
      hero != null ? hero.offsetTop + hero.offsetHeight - NAV_ALLOWANCE : 360;
    setShowNavToggle(top > gate);
    const pin = pinRef.current;
    if (pin != null && !reduced) {
      const pinRect = pin.getBoundingClientRect();
      const pageRect = container.getBoundingClientRect();
      const range = pinRect.height - stickyH;
      if (range > 0) {
        const raw = (pageRect.top + STICKY_TOP - pinRect.top) / range;
        setPinProgress(Math.round(Math.max(0, Math.min(1, raw)) * 100));
      }
    }
  };

  /** Button path into the pinned scene: scroll to a step's progress point. */
  const jumpToPinStep = (index: number, count: number) => {
    const container = pageRef.current;
    const pin = pinRef.current;
    if (container == null || pin == null) {
      return;
    }
    const pinTop =
      pin.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    const range = pin.offsetHeight - stickyH;
    const target = pinTop - STICKY_TOP + ((index + 0.5) / count) * range;
    container.scrollTo({top: target, behavior: reduced ? 'auto' : 'smooth'});
  };

  // ---- hero parallax: pointer vars drive the satellite transforms ----
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || isHeroStacked) {
      return;
    }
    const stage = heroStageRef.current;
    if (stage == null) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    stage.style.setProperty('--kl-px', px.toFixed(3));
    stage.style.setProperty('--kl-py', py.toFixed(3));
  };
  const onHeroPointerLeave = () => {
    const stage = heroStageRef.current;
    if (stage != null) {
      stage.style.setProperty('--kl-px', '0');
      stage.style.setProperty('--kl-py', '0');
    }
  };

  // ---- dark CTA band spotlight (CSS vars, no re-render) ----
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const onCtaPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) {
      return;
    }
    const band = ctaRef.current;
    if (band == null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--kl-mx', \`\${Math.round(event.clientX - rect.left)}px\`);
    band.style.setProperty('--kl-my', \`\${Math.round(event.clientY - rect.top)}px\`);
  };

  // ---- nav menu (compact widths) ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isNavMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNavMenuOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav != null &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      ) {
        setIsNavMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isNavMenuOpen]);

  // ---- section registry + smooth scroll ----
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});
  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };
  const jumpToSection = (id: SectionId) => {
    setIsNavMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  const switchAudience = (next: Audience) => {
    setAudience(next);
    setFaqOverride(null);
  };

  // ---- renter path: selected category ----
  const [selectedCategory, setSelectedCategory] = useState('cameras');
  const category =
    CATEGORIES.find(c => c.id === selectedCategory) ?? CATEGORIES[0];

  // ---- owner path: earnings calculator ----
  const [itemTypeId, setItemTypeId] = useState('camera');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const itemType = ITEM_TYPES.find(t => t.id === itemTypeId) ?? ITEM_TYPES[0];
  const monthlyEstimate = roundTo(
    itemType.dailyRate * daysPerWeek * itemType.utilization * 4.33 * 0.85,
    5,
  );
  const rangeLow = roundTo(monthlyEstimate * 0.6, 10);
  const rangeHigh = roundTo(monthlyEstimate * 1.35, 10);
  const [calcRef, calcInView] = useInViewOnce();

  // ---- shared: selected city ----
  const [selectedCity, setSelectedCity] = useState('denver');
  const city = CITIES.find(c => c.id === selectedCity) ?? CITIES[0];

  // ---- FAQ tabs follow the audience until overridden ----
  const [faqOverride, setFaqOverride] = useState<Audience | null>(null);
  const faqAudience = faqOverride ?? audience;
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set(['rent-deposit', 'earn-payout']),
  );
  const toggleFaq = (key: string, isOpen: boolean) => {
    setOpenFaqs(previous => {
      const next = new Set(previous);
      if (isOpen) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  // ---- CTA email capture ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const submitEmail = () => {
    const error = validateEmail(email);
    if (error != null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  const swapAnimation = reduced ? undefined : 'klSwapIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both';
  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const sectionStyle: CSSProperties = {
    ...styles.section,
    ...(isPhone ? styles.sectionCompact : null),
  };
  const glowVar = {'--kl-glow': tint(accent, 45)} as CSSProperties;
  const anchors: readonly {id: SectionId; label: string}[] = [
    {id: 'path', label: theme.pathAnchorLabel},
    {id: 'trust', label: theme.trustAnchorLabel},
    {id: 'cities', label: 'Cities'},
    {id: 'faq', label: 'FAQ'},
  ];

  // ============= CHROME =============

  const navBar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        backgroundColor: isScrolled
          ? 'color-mix(in srgb, var(--color-background-body) 88%, transparent)'
          : 'transparent',
        borderBottom: isScrolled
          ? '1px solid var(--color-border)'
          : '1px solid transparent',
      }}
      aria-label="Kitloop">
      <div style={{...styles.navInner, minHeight: isScrolled ? 48 : 60}}>
        <BrandMark />
        {!isNavCompact ? (
          <HStack gap={0} vAlign="center">
            {anchors.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                className="kl-navlink"
                style={styles.navLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
          </HStack>
        ) : null}
        <StackItem size="fill">
          <span />
        </StackItem>
        {showNavToggle ? (
          <div style={{animation: swapAnimation}}>
            <AudienceToggle
              audience={audience}
              onChange={switchAudience}
              size="sm"
            />
          </div>
        ) : null}
        {!isNavCompact ? (
          <AccentButton
            label={theme.navCta}
            accent={accent}
            small
            onClick={() => jumpToSection('cta')}
          />
        ) : (
          <IconButton40
            label={isNavMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isNavMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isNavMenuOpen}
            onClick={() => setIsNavMenuOpen(open => !open)}
          />
        )}
        {isNavCompact && isNavMenuOpen ? (
          <div style={styles.navMenu} role="menu" aria-label="Site menu">
            <VStack gap={1}>
              {anchors.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.navMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <div style={{paddingTop: 8}}>
                <AccentButton
                  label={theme.navCta}
                  accent={accent}
                  small
                  onClick={() => jumpToSection('cta')}
                />
              </div>
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ============= HERO THEATER =============

  const satellitePositions: readonly CSSProperties[] = [
    {top: -22, right: -6},
    {bottom: 28, left: -28},
    {top: '58%', right: -26},
  ];
  const satelliteParallax = [
    {x: 9, y: 7},
    {x: -7, y: 5},
    {x: 6, y: -6},
  ];
  const satelliteBob = [
    {duration: 7.2, delay: -2.1},
    {duration: 8.4, delay: -4.3},
    {duration: 6.6, delay: -1.2},
  ];

  const hero = (
    <div ref={heroRef} style={styles.heroBand}>
      <Aurora accent={accent} partner={theme.partner} reduced={reduced} />
      <div
        style={{
          ...columnStyle,
          position: 'relative',
          paddingTop: isPhone ? 104 : 136,
          paddingBottom: isPhone ? 56 : 104,
        }}>
        <div
          style={{
            ...styles.hero,
            ...(isHeroStacked ? styles.heroStacked : null),
          }}>
          <div style={styles.heroCopy}>
            <p style={{...styles.eyebrow, color: accent, backgroundColor: tint(accent, 10)}}>
              Peer-to-peer gear rental · 12 cities
            </p>
            <AudienceToggle
              audience={audience}
              onChange={switchAudience}
              size="lg"
            />
            <div key={\`copy-\${audience}\`} style={{animation: swapAnimation}}>
              <VStack gap={3}>
                <h1 style={{...styles.heroHeadline, fontSize: heroFont}}>
                  {theme.headlineLead}{' '}
                  <span
                    style={{
                      backgroundImage: \`linear-gradient(94deg, \${accent} 10%, color-mix(in srgb, \${accent} 42%, \${theme.partner}) 90%)\`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}>
                    {theme.headlineTail}
                  </span>
                </h1>
                <p style={styles.heroSubcopy}>{theme.subcopy}</p>
              </VStack>
            </div>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <AccentButton
                label={theme.primaryCta}
                accent={accent}
                icon={ArrowRightIcon}
                onClick={() => jumpToSection(theme.primaryTarget)}
              />
              <Button
                label={theme.secondaryCta}
                variant="secondary"
                onClick={() => jumpToSection(theme.secondaryTarget)}
              />
            </HStack>
            <Text type="supporting" color="secondary">
              {theme.finePrint}
            </Text>
          </div>
          <div
            ref={heroStageRef}
            style={styles.heroStage}
            onPointerMove={onHeroPointerMove}
            onPointerLeave={onHeroPointerLeave}>
            <div
              key={\`vignette-\${audience}\`}
              style={{animation: swapAnimation, position: 'relative'}}>
              <div style={{perspective: 1400}}>
                <div
                  style={{
                    transform: isHeroStacked
                      ? undefined
                      : 'rotateY(-6deg) rotateX(2.5deg)',
                  }}>
                  {audience === 'rent' ? (
                    <RentVignette accent={accent} />
                  ) : (
                    <EarnVignette accent={accent} />
                  )}
                </div>
              </div>
              {!isHeroStacked
                ? SATELLITES[audience].map((chip, index) => (
                    <Satellite
                      key={chip.id}
                      chip={chip}
                      accent={accent}
                      reduced={reduced}
                      position={satellitePositions[index]}
                      parallax={satelliteParallax[index]}
                      bob={satelliteBob[index]}
                    />
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============= RENTER PATH =============

  const renterPath = (
    <>
      <section
        ref={registerSection('path')}
        style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            compact={isPhone}
            eyebrow="Browse by category"
            title="41,300 listings, eight aisles, zero storage units"
            copy="Pick a category to see what it looks like near you."
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${catCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-3)',
          }}>
          {CATEGORIES.map((cat, index) => {
            const isSelected = cat.id === selectedCategory;
            const column = index % catCols;
            return (
              <Reveal
                key={cat.id}
                reduced={reduced}
                delay={(index % catCols) * 70}
                style={{
                  // Staggered column offsets break the flat grid at wide widths.
                  marginTop: !isPhone && catCols === 4 && column % 2 === 1 ? 20 : 0,
                }}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="kl-raise"
                  style={{
                    ...styles.categoryTile,
                    ...glowVar,
                    ...(isSelected
                      ? {
                          borderColor: accent,
                          boxShadow: \`0 0 0 1px \${accent}, \${SHADOW_RAISED}\`,
                        }
                      : null),
                  }}>
                  <div
                    style={{
                      ...styles.categoryGlyph,
                      backgroundColor: tint(accent, 14),
                      color: accent,
                    }}
                    aria-hidden="true">
                    <Icon icon={cat.icon} size="sm" color="inherit" />
                  </div>
                  <Text size="sm" weight="semibold">
                    {cat.label}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {formatCount(cat.listings)} listings · from \${cat.fromPrice}
                    /day
                  </Text>
                </button>
              </Reveal>
            );
          })}
        </div>
        <p style={styles.captionLine} aria-live="polite">
          {category.label} — {formatCount(category.listings)} listings · from $
          {category.fromPrice}/day · avg owner rating {category.rating}★
        </p>
      </section>

      <section
        ref={registerSection('how')}
        style={{
          backgroundImage: DOT_GRID,
          backgroundSize: '22px 22px',
        }}>
        <PinnedStory
          story={PIN_STORIES.rent}
          accent={accent}
          reduced={reduced}
          stacked={isHeroStacked}
          compactHead={isPhone}
          stickyH={stickyH}
          rangeH={rangeH}
          progress={pinProgress}
          onStepJump={jumpToPinStep}
          pinRef={pinRef}
          columnStyle={columnStyle}
        />
      </section>

      <div
        ref={registerSection('trust')}
        style={{backgroundColor: tint(accent, 7)}}>
        <section style={{...columnStyle, ...sectionStyle}}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-7)',
              flexDirection: isHeroStacked ? 'column' : 'row',
              alignItems: isHeroStacked ? 'stretch' : 'center',
            }}>
            <div style={{flex: '5 1 0', minWidth: 0}}>
              <Reveal reduced={reduced}>
                <VStack gap={4}>
                  <SectionHead
                    accent={accent}
                    compact={isPhone}
                    eyebrow="Trust & insurance"
                    title="KitCover rides along on every rental"
                    copy="Borrowing a stranger’s $3,000 camera should feel boring. Here’s why it does."
                  />
                  <VStack gap={1}>
                    <p
                      style={{
                        ...styles.bigFigure,
                        fontSize: isPhone ? 48 : 64,
                        backgroundImage: \`linear-gradient(94deg, \${accent} 10%, color-mix(in srgb, \${accent} 42%, \${theme.partner}) 90%)\`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}>
                      $25,000
                    </p>
                    <Text type="supporting" color="secondary">
                      of coverage on every rental, automatically
                    </Text>
                  </VStack>
                </VStack>
              </Reveal>
            </div>
            <div style={{flex: '7 1 0', minWidth: 0}}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: \`repeat(\${width > 640 ? 2 : 1}, minmax(0, 1fr))\`,
                  gap: 'var(--spacing-3)',
                }}>
                {TRUST_CARDS.map((card, index) => (
                  <Reveal key={card.id} reduced={reduced} delay={index * 80}>
                    <div className="kl-raise" style={{...styles.infoCard, ...glowVar}}>
                      <div
                        style={{
                          ...styles.infoGlyph,
                          backgroundColor: tint(accent, 14),
                          color: accent,
                        }}
                        aria-hidden="true">
                        <Icon icon={card.icon} size="sm" color="inherit" />
                      </div>
                      <Text type="label">{card.title}</Text>
                      <Text type="body" color="secondary">
                        {card.copy}
                      </Text>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        style={{
          ...sectionStyle,
          paddingBottom: isPhone ? 120 : 176,
        }}>
        <div style={columnStyle}>
          <Reveal reduced={reduced}>
            <SectionHead
              accent={accent}
              compact={isPhone}
              eyebrow="Renter reviews"
              title="4.9 average across 28,400 completed rentals"
            />
          </Reveal>
        </div>
        {reduced ? (
          <div style={columnStyle}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: \`repeat(\${reviewCols}, minmax(0, 1fr))\`,
                gap: 'var(--spacing-3)',
              }}>
              {REVIEWS.map(review => (
                <ReviewCard key={review.id} review={review} accent={accent} />
              ))}
            </div>
          </div>
        ) : (
          <div className="kl-marquee" style={styles.marqueeBand}>
            <div
              className="kl-marquee-track"
              style={{
                ...styles.marqueeTrack,
                animation: 'klMarquee 48s linear infinite',
              }}>
              {[...REVIEWS, ...REVIEWS].map((review, index) => (
                <div
                  key={\`\${review.id}-\${index}\`}
                  aria-hidden={index >= REVIEWS.length}>
                  <ReviewCard review={review} accent={accent} fixedWidth />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );

  // ============= OWNER PATH =============

  const ownerPath = (
    <>
      <div
        ref={registerSection('path')}
        style={{backgroundColor: tint(accent, 7)}}>
        <section style={{...columnStyle, ...sectionStyle}}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-7)',
              flexDirection: isHeroStacked ? 'column' : 'row',
              alignItems: isHeroStacked ? 'stretch' : 'center',
            }}>
            <div style={{flex: '5 1 0', minWidth: 0}}>
              <Reveal reduced={reduced}>
                <SectionHead
                  accent={accent}
                  compact={isPhone}
                  eyebrow="Earnings calculator"
                  title="What would your gear make?"
                  copy="Pick what you’d list and how often it’s free. We’ll give you an honest number."
                />
              </Reveal>
            </div>
            <div ref={calcRef} style={{flex: '7 1 0', minWidth: 0}}>
              <Reveal reduced={reduced} delay={80}>
                <div style={styles.calcCard}>
                  <Selector
                    label="What would you list?"
                    options={ITEM_TYPES.map(type => ({
                      value: type.id,
                      label: \`\${type.label} · ~$\${type.dailyRate}/day\`,
                    }))}
                    value={itemTypeId}
                    onChange={value => setItemTypeId(value)}
                  />
                  <Slider
                    label="Days your gear is free each week"
                    min={1}
                    max={7}
                    step={1}
                    value={daysPerWeek}
                    onChange={setDaysPerWeek}
                    valueDisplay="text"
                    formatValue={d => \`\${d} \${d === 1 ? 'day' : 'days'}/week\`}
                  />
                  <VStack gap={1}>
                    <span
                      style={{
                        ...styles.calcEstimate,
                        fontSize: isPhone ? 40 : 56,
                        color: accent,
                      }}>
                      <AnimatedNumber
                        value={monthlyEstimate}
                        isActive={calcInView}
                        reduced={reduced}
                        format={n => \`$\${formatCount(n)}/mo\`}
                      />
                    </span>
                    <Text type="body">
                      Typical range \${formatCount(rangeLow)}–$
                      {formatCount(rangeHigh)}/mo at{' '}
                      {Math.round(itemType.utilization * 100)}% of your listed
                      days booked.
                    </Text>
                    {itemType.note != null ? (
                      <Text type="supporting" color="secondary">
                        {itemType.note}
                      </Text>
                    ) : null}
                    <Text type="supporting" color="secondary">
                      {CALC_DISCLOSURE}
                    </Text>
                  </VStack>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>

      <section
        ref={registerSection('trust')}
        style={{
          backgroundImage: DOT_GRID,
          backgroundSize: '22px 22px',
        }}>
        <PinnedStory
          story={PIN_STORIES.earn}
          accent={accent}
          reduced={reduced}
          stacked={isHeroStacked}
          compactHead={isPhone}
          stickyH={stickyH}
          rangeH={rangeH}
          progress={pinProgress}
          onStepJump={jumpToPinStep}
          pinRef={pinRef}
          columnStyle={columnStyle}
        />
      </section>

      <section
        style={{
          ...columnStyle,
          ...sectionStyle,
          paddingBottom: isPhone ? 120 : 176,
        }}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            compact={isPhone}
            eyebrow="Top-earner stories"
            title="The gear shelf that pays for itself"
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${storyCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-3)',
          }}>
          {EARNER_STORIES.map((story, index) => (
            <Reveal key={story.id} reduced={reduced} delay={index * 90}>
              <EarnerStoryCard story={story} accent={accent} reduced={reduced} />
            </Reveal>
          ))}
        </div>
        <Text type="supporting" color="secondary">
          {EARNER_DISCLOSURE}
        </Text>
      </section>
    </>
  );

  // ============= SHARED SECTIONS =============

  // The cities band: tinted, aurora-lit, and entered by the floating stats
  // panel that deliberately crosses the section boundary above it.
  const citiesBand = (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: tint(accent, 6),
      }}>
      <Aurora accent={accent} partner={theme.partner} reduced={reduced} dim />
      <div style={{...columnStyle, position: 'relative'}}>
        <Reveal
          reduced={reduced}
          style={{marginTop: isPhone ? -72 : -96}}>
          <div style={styles.statsPanel}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: \`repeat(\${statCols}, minmax(0, 1fr))\`,
                gap: 'var(--spacing-4)',
              }}>
              {STATS.map(stat => (
                <StatFigure
                  key={stat.id}
                  stat={stat}
                  accent={accent}
                  reduced={reduced}
                  compact={isPhone}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <section
        ref={registerSection('cities')}
        style={{...columnStyle, ...sectionStyle, position: 'relative'}}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-7)',
            flexDirection: isHeroStacked ? 'column' : 'row',
            alignItems: isHeroStacked ? 'stretch' : 'flex-start',
          }}>
          <div style={{flex: '5 1 0', minWidth: 0}}>
            <Reveal reduced={reduced}>
              <VStack gap={4}>
                <SectionHead
                  accent={accent}
                  compact={isPhone}
                  eyebrow="Where Kitloop lives"
                  title="Live in 12 cities and counting"
                  copy="Tap a city to see how deep the local shelf goes."
                />
                <p style={styles.captionLine} aria-live="polite">
                  {city.name} — {formatCount(city.listings)} listings · avg
                  pickup {city.pickupMiles} mi · top category: {city.topCategory}
                </p>
              </VStack>
            </Reveal>
          </div>
          <div style={{flex: '7 1 0', minWidth: 0}}>
            <Reveal reduced={reduced} delay={80}>
              <HStack gap={2} wrap="wrap">
                {CITIES.map(c => {
                  const isSelected = c.id === selectedCity;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedCity(c.id)}
                      style={{
                        ...styles.cityChip,
                        ...(isSelected
                          ? {
                              borderColor: accent,
                              boxShadow: \`0 0 0 1px \${accent}, \${SHADOW_RAISED}\`,
                              color: accent,
                            }
                          : null),
                      }}>
                      <Icon icon={MapPinIcon} size="xsm" color="inherit" />
                      {c.name}
                    </button>
                  );
                })}
              </HStack>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );

  const faqSection = (
    <section
      ref={registerSection('faq')}
      style={{...columnStyle, ...sectionStyle}}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-7)',
          flexDirection: isHeroStacked ? 'column' : 'row',
          alignItems: isHeroStacked ? 'stretch' : 'flex-start',
        }}>
        <div style={{flex: '4 1 0', minWidth: 0}}>
          <Reveal reduced={reduced}>
            <SectionHead
              accent={accent}
              compact={isPhone}
              eyebrow="FAQ"
              title="Fair questions, straight answers"
              copy="Deposit math, damage claims, taxes — the parts other marketplaces bury."
            />
          </Reveal>
        </div>
        <div style={{flex: '8 1 0', minWidth: 0}}>
          <VStack gap={4}>
            <TabList
              value={faqAudience}
              onChange={value => setFaqOverride(value as Audience)}
              aria-label="FAQ audience"
              hasDivider>
              <Tab value="rent" label="For renters" />
              <Tab value="earn" label="For owners" />
            </TabList>
            <VStack gap={2}>
              {FAQ[faqAudience].map((entry, index) => {
                const key = \`\${faqAudience}-\${entry.id}\`;
                return (
                  <Reveal key={key} reduced={reduced} delay={index * 60}>
                    <div
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        padding: 'var(--spacing-2) var(--spacing-3)',
                        backgroundColor: 'var(--color-background-card)',
                        boxShadow: SHADOW_RAISED,
                      }}>
                      <Collapsible
                        isOpen={openFaqs.has(key)}
                        onOpenChange={isOpen => toggleFaq(key, isOpen)}
                        trigger={entry.question}>
                        <div style={{padding: 'var(--spacing-2) 0 var(--spacing-1)'}}>
                          <Text type="body" color="secondary">
                            {entry.answer}
                          </Text>
                        </div>
                      </Collapsible>
                    </div>
                  </Reveal>
                );
              })}
            </VStack>
          </VStack>
        </div>
      </div>
    </section>
  );

  // The signature scheme-locked dark band: gradient glows, a pointer-
  // tracked spotlight, and a glass card hosting the email capture.
  const brightAccent = brighten(accent);
  const ctaBand = (
    <div ref={registerSection('cta')} style={{display: 'block'}}>
      <div
        ref={ctaRef}
        onPointerMove={onCtaPointerMove}
        style={styles.darkBand}>
        <div
          aria-hidden="true"
          style={{
            ...styles.glowBlob,
            width: 520,
            height: 520,
            top: '-30%',
            left: '-10%',
            opacity: 0.4,
            background: \`radial-gradient(circle at 40% 40%, color-mix(in srgb, \${accent} 55%, \${theme.partner}), transparent 70%)\`,
            animation: reduced ? undefined : 'klDriftA 40s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            ...styles.glowBlob,
            width: 440,
            height: 440,
            bottom: '-36%',
            right: '-8%',
            opacity: 0.35,
            background: \`radial-gradient(circle at 60% 40%, \${tint(accent, 70)}, transparent 70%)\`,
            animation: reduced ? undefined : 'klDriftB 46s ease-in-out infinite',
          }}
        />
        {!reduced ? (
          <div
            aria-hidden="true"
            style={{
              ...styles.spotlight,
              background: \`radial-gradient(480px circle at var(--kl-mx, 60%) var(--kl-my, 40%), \${tint(brightAccent, 13)}, transparent 70%)\`,
            }}
          />
        ) : null}
        <section
          style={{...columnStyle, ...sectionStyle, position: 'relative'}}>
          <div
            key={\`cta-\${audience}\`}
            style={{
              animation: swapAnimation,
              display: 'flex',
              gap: 'var(--spacing-7)',
              flexDirection: isHeroStacked ? 'column' : 'row',
              alignItems: isHeroStacked ? 'stretch' : 'center',
            }}>
            <div style={{flex: '6 1 0', minWidth: 0}}>
              <Reveal reduced={reduced}>
                <VStack gap={3}>
                  <SectionHead
                    accent={accent}
                    compact={isPhone}
                    onDark
                    eyebrow={audience === 'rent' ? 'Ready when you are' : 'Start earning'}
                    title={theme.ctaHeading}
                    copy={theme.ctaCopy}
                  />
                  <span style={{fontSize: 13, color: DARK_TEXT_SOFT}}>
                    {theme.finePrint}
                  </span>
                </VStack>
              </Reveal>
            </div>
            <div style={{flex: '6 1 0', minWidth: 0}}>
              <Reveal reduced={reduced} delay={90}>
                <div style={styles.glassCard}>
                  {confirmedEmail == null ? (
                    <>
                      <span
                        style={{
                          ...styles.eyebrow,
                          color: brightAccent,
                          backgroundColor: tint(brightAccent, 12),
                          alignSelf: 'flex-start',
                        }}>
                        {audience === 'rent' ? 'Get the app link' : 'Get the checklist'}
                      </span>
                      <div
                        style={{
                          ...styles.emailRow,
                          ...(isPhone ? styles.emailRowStacked : null),
                        }}>
                        <div style={styles.emailInput}>
                          <TextInput
                            label="Email address"
                            isLabelHidden
                            placeholder="you@example.com"
                            value={email}
                            onChange={value => {
                              setEmail(value);
                              setEmailError(null);
                            }}
                          />
                        </div>
                        <AccentButton
                          label={theme.ctaButton}
                          accent={accent}
                          fill={brightAccent}
                          ink={DARK_INK}
                          icon={ArrowRightIcon}
                          onClick={submitEmail}
                        />
                      </div>
                      {emailError != null ? (
                        <p style={styles.emailError} role="alert">
                          {emailError}
                        </p>
                      ) : null}
                      <span style={{fontSize: 12.5, color: DARK_TEXT_SOFT}}>
                        No spam — one link, one checklist, unsubscribe anytime.
                      </span>
                    </>
                  ) : (
                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          ...styles.successDisc,
                          backgroundColor: tint(brightAccent, 18),
                          color: brightAccent,
                        }}
                        aria-hidden="true">
                        <Icon icon={MailCheckIcon} size="sm" color="inherit" />
                      </div>
                      <StackItem size="fill">
                        <VStack gap={0}>
                          <span style={{fontSize: 15, fontWeight: 700, color: DARK_TEXT}}>
                            Check your inbox
                          </span>
                          <span style={{fontSize: 14, color: DARK_TEXT_SOFT}}>
                            We sent your link to {confirmedEmail}.
                          </span>
                        </VStack>
                      </StackItem>
                      <button
                        type="button"
                        style={styles.darkGhostButton}
                        onClick={() => setConfirmedEmail(null)}>
                        Use a different email
                      </button>
                    </HStack>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...columnStyle,
          paddingBlock: 'var(--spacing-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-6)',
        }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${footerCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-5)',
          }}>
          {FOOTER_COLUMNS.map(column => (
            <VStack key={column.id} gap={2}>
              <Text type="label">{column.heading}</Text>
              <VStack gap={0}>
                {column.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    className="kl-navlink"
                    style={styles.footerLink}
                    onClick={
                      link.target != null
                        ? () => {
                            if (link.switchTo != null) {
                              switchAudience(link.switchTo);
                            }
                            jumpToSection(link.target as SectionId);
                          }
                        : () => {}
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            </VStack>
          ))}
        </div>
        <VStack gap={2}>
          <BrandMark />
          <Text type="supporting" color="secondary">
            © 2026 Kitloop, Inc. KitCover is Kitloop’s protection guarantee,
            not an insurance policy; coverage limits and exclusions apply.
            Earnings figures reflect the 12 months ending June 2026.
          </Text>
        </VStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={wrapRef} style={{height: '100%', position: 'relative'}}>
          <style>{PAGE_CSS}</style>
          <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
            {navBar}
            {hero}
            <div key={\`path-\${audience}\`} style={{animation: swapAnimation}}>
              {audience === 'rent' ? renterPath : ownerPath}
            </div>
            {citiesBand}
            {faqSection}
            {ctaBand}
            {footer}
          </div>
          <div style={styles.grainOverlay} aria-hidden="true" />
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};