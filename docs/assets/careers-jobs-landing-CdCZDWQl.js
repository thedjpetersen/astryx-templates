var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file careers-jobs-landing.tsx
 * @input Deterministic fixtures only (the fictional "Halyard" coastal-freight
 *   software startup: a mission headline with three count-up stats, five
 *   gradient collage tiles with candid captions, three floating satellite
 *   cards, four values cards, six benefit rows, twelve open roles across
 *   Engineering/Design/GTM with locations, two-row comp bands, summaries and
 *   ownership bullets, a four-step hiring-process story with durations and
 *   honesty footnotes, three employee quotes, and footer link groups)
 * @output Elevated careers landing page with awwwards-grade art direction:
 *   a transparent-to-glass sticky navbar (hairline + tinted surface + height
 *   step after 24px of scroll; links collapse behind a hamburger dropdown at
 *   compact widths), an aurora-lit hero with 64-76px tiered display type and
 *   a gradient-ink key phrase, count-up stats, and a staged product-theater
 *   collage — perspective-tilted rotating-spotlight tiles with three bobbing
 *   satellite mini-cards that parallax toward the pointer — a 5/7 asymmetric
 *   values split with offset overlapping cards and oversized numerals, a
 *   dot-grid benefits band, the roles list with department filter chips +
 *   location Selector live-filter and inline expansion into a validating
 *   apply mini-form with success state, a PINNED SCROLL STORY for the
 *   hiring process (sticky stage, scroll-progress step rail, clickable
 *   steps; static stacked under reduced motion/compact), a scheme-locked
 *   dark "life here" band with pointer-tracked spotlight, gradient glows
 *   and a glass quote carousel, an open-application card that crosses the
 *   footer boundary, and a dark sitemap footer. Staggered rise+fade+scale
 *   reveals fire once per group.
 * @position Page template; emitted by \`astryx template careers-jobs-landing\`
 *
 * Frame: Layout height="fill", content-only — a careers page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns smooth-scroll, scroll-spy, the nav
 * glass state, and the pinned-story progress; the navbar inside it is
 * position:sticky top:0. Sections own their own 96-120px vertical rhythm
 * (56-72px compact) with 1120px inner columns; the benefits and life bands
 * and the footer paint full-bleed.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll the container to real
 *   section ids with a sticky-nav allowance; onScroll spies the last
 *   anchor above the fold line (aria-current) and flips the nav to its
 *   glass state after 24px. The compact hamburger dropdown closes on
 *   Escape (refocusing the trigger), outside pointerdown, or selection.
 * - Collage spotlight advances every 3.2s; hovering the collage pauses
 *   the timer, hovering or clicking a tile moves the spotlight there.
 *   Satellites bob on independent 6-9s keyframes (negative delays) and
 *   the whole theater parallaxes ±8px / ±3° toward the pointer over the
 *   hero (spring transition; off under reduced motion and at stacked
 *   widths, where satellites also hide to protect 390px).
 * - Department chips (aria-pressed) and the location Selector live-filter
 *   the 12 role rows; a zero-match state offers one-click filter reset.
 * - A role row expands inline to summary + bullets + Apply; Apply reveals
 *   the mini-form. Submit validates (name required, email regex, link
 *   must look like a URL when present) with inline TextInput status
 *   errors; success swaps the form for a confirmation card that persists
 *   per role for the session.
 * - Pinned scroll story: the process section is a tall (stage × 2.6)
 *   container with a sticky stage; scroll progress (container scrollTop
 *   against the measured stage height) fills the step rail and advances
 *   4 discrete states; step buttons scroll the container to the matching
 *   progress. Reduced motion or stacked widths render the four steps as
 *   a static sequence (step buttons still highlight).
 * - The quote carousel auto-advances every 5.2s, pauses while hovered,
 *   and is fully driveable via prev/next buttons and dots. The dark band
 *   tracks the pointer with a radial spotlight (CSS vars, no re-render).
 * - Motion is gated by prefers-reduced-motion: reveals render visible,
 *   count-ups render final values, auroras/bobbing freeze, parallax and
 *   sheen sweeps disable, and the collage + carousel timers stop (manual
 *   controls keep working).
 *
 * Color policy: token-first with ONE quarantined accent literal (see
 * ACCENT below, with contrast math). Every glow, aurora, and glass
 * surface is derived via color-mix from that accent, the neutral white
 * literal, or var(--color-*) tokens — no new hue literals. Brand art —
 * the logo tile and the five collage gradients — is scheme-locked
 * literal paint under colorScheme:'dark' (candid-photo stand-ins must
 * not reflow with the theme); the life band and footer share one
 * scheme-locked dark surface whose literal soft-text shades exist only
 * to stay readable there. No network assets, no clocks, no randomness;
 * timers tick from fixture state only.
 *
 * Responsive contract (measured with a local ResizeObserver, not viewport
 * media queries — the inline demo stage is ~1045px wide):
 * - Column: max-width 1120px, centered; bands and footer bleed full width.
 * - >1000px: display type 76px; >900px inline nav links + CTA; collage is
 *   a 3-column mosaic with the lead tile spanning two rows; the process
 *   story pins.
 * - <=900px: nav links collapse behind a 40px hamburger dropdown; collage
 *   drops to 2 columns (lead tile spans both); display 64px.
 * - <=760px: hero stacks (copy above collage), satellites and parallax
 *   turn off, values return to a single flowing column, role-row comp
 *   moves under the title block, and the process story renders static.
 * - <=540px: display 40-52px, section padding steps down, the roles
 *   filter row stacks the Selector full-width, the apply form stacks its
 *   fields, and stat chips wrap. All chip rows wrap and atmosphere layers
 *   clip, so the page holds at 390px with no overflow-x.
 * - Tap targets: hamburger, carousel arrows, dots, chips, step buttons,
 *   and role-row headers are ≥40px controls; nothing requires hover.
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
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  AnchorIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DogIcon,
  GlobeIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  MapPinIcon,
  MenuIcon,
  MessageSquareIcon,
  PenToolIcon,
  ShipIcon,
  SunIcon,
  TentIcon,
  TrendingUpIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal — Halyard's harbor teal.
 * Contrast math: light #0F766E on #FFFFFF ≈ 5.9:1 (AA for normal text,
 * AAA for the 11px+bold eyebrows it labels); dark #5EEAD4 on a #1C1C1E
 * card ≈ 10.4:1. Filled CTA ink: #FFFFFF on #0F766E ≈ 5.9:1 (AA);
 * #134E4A on #5EEAD4 ≈ 7.0:1 (AAA) — both halves of CTA_INK reuse
 * literals already present in the scheme-locked brand art. The washes
 * below are the same literal at low alpha and are decorative only
 * (chip fills, discs, glows) — never text.
 */
const ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const ACCENT_WASH = 'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.14))';
const ACCENT_BORDER = 'light-dark(rgba(15, 118, 110, 0.38), rgba(94, 234, 212, 0.42))';
/** Ink for filled accent CTAs (contrast math above). */
const CTA_INK = 'light-dark(#FFFFFF, #134E4A)';

// Scheme-locked dark surface shared by the life band and the footer, and
// its text shades (readable only on that locked surface; see Color policy).
const DARK_SURFACE = '#0B1220';
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.80)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.58)';

// ---- depth system (three tiers, used consistently) ----
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';
/** Glass tier for the dark band: hairline inset + depth, all mixed from
 * the shared white literal — no new colors. */
const SHADOW_GLASS =
  \`inset 0 0 0 1px color-mix(in srgb, \${DARK_TEXT} 14%, transparent), \` +
  '0 24px 48px -24px rgba(0, 0, 0, 0.55)';

/** Grain texture: inline SVG feTurbulence, tiled at 3-5% opacity. */
const GRAIN_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
  "width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.85' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' " +
  "filter='url(%23n)'/%3E%3C/svg%3E";

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 72;
const SPY_OFFSET = 140;

// Scoped stylesheet: aurora drift, satellite bob, CTA sheen/lift/press,
// and card hover-raise need keyframes + pseudo-class selectors that
// inline styles can't express. Transform/opacity only.
const SCOPE = 'cjl-root';

const TEMPLATE_CSS = \`
@keyframes cjl-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(70px, -46px, 0) scale(1.12); }
}
@keyframes cjl-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-56px, 38px, 0) scale(1.08); }
}
@keyframes cjl-drift-c {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(44px, 30px, 0) scale(0.94); }
}
@keyframes cjl-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}
.\${SCOPE} .cjl-aurora-a { animation: cjl-drift-a 36s ease-in-out infinite; }
.\${SCOPE} .cjl-aurora-b { animation: cjl-drift-b 44s ease-in-out infinite; }
.\${SCOPE} .cjl-aurora-c { animation: cjl-drift-c 32s ease-in-out infinite; }
.\${SCOPE} .cjl-bob-a { animation: cjl-bob 7s ease-in-out -2.4s infinite; }
.\${SCOPE} .cjl-bob-b { animation: cjl-bob 8.5s ease-in-out -5.1s infinite; }
.\${SCOPE} .cjl-bob-c { animation: cjl-bob 6.2s ease-in-out -1.3s infinite; }
.\${SCOPE} .cjl-cta {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.\${SCOPE} .cjl-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08),
    0 14px 28px -12px color-mix(in srgb, \${ACCENT} 55%, transparent);
}
.\${SCOPE} .cjl-cta:active { transform: translateY(0) scale(0.98); }
.\${SCOPE} .cjl-cta-sheen {
  transform: translateX(-130%) skewX(-14deg);
}
.\${SCOPE} .cjl-cta:hover .cjl-cta-sheen {
  transform: translateX(130%) skewX(-14deg);
  transition: transform 0.72s ease;
}
.\${SCOPE} .cjl-lift {
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.\${SCOPE} .cjl-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING};
}
.\${SCOPE} .cjl-role-row:hover { background-color: var(--color-tint-hover); }
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .cjl-aurora-a, .\${SCOPE} .cjl-aurora-b,
  .\${SCOPE} .cjl-aurora-c, .\${SCOPE} .cjl-bob-a,
  .\${SCOPE} .cjl-bob-b, .\${SCOPE} .cjl-bob-c { animation: none; }
  .\${SCOPE} .cjl-cta, .\${SCOPE} .cjl-lift { transition: none; }
  .\${SCOPE} .cjl-cta:hover, .\${SCOPE} .cjl-cta:active,
  .\${SCOPE} .cjl-lift:hover { transform: none; }
  .\${SCOPE} .cjl-cta-sheen,
  .\${SCOPE} .cjl-cta:hover .cjl-cta-sheen {
    transform: translateX(-130%) skewX(-14deg); transition: none;
  }
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
  innerColumn: {
    position: 'relative',
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  innerColumnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  section: {
    position: 'relative',
    paddingBlock: 104,
  },
  sectionCompact: {
    paddingBlock: 64,
  },
  // ---- atmosphere ----
  atmosphere: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: \`url("\${GRAIN_URI}")\`,
    opacity: 0.04,
    pointerEvents: 'none',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-border) 85%, transparent) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
    pointerEvents: 'none',
  },
  // ---- full-bleed tinted bands ----
  mutedBand: {
    position: 'relative',
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    transition: 'background-color 220ms ease, box-shadow 220ms ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 1px 0 var(--color-border)',
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
  // Scheme-locked brand art: teal→deep-sea gradient, white glyph.
  logoTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #14B8A6 0%, #134E4A 100%)',
    color: '#FFFFFF',
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
  },
  navLinkActive: {
    color: ACCENT,
    backgroundColor: ACCENT_WASH,
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
  // ---- custom CTA (sheen sweep / lift / press live in TEMPLATE_CSS) ----
  ctaButton: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    paddingInline: 22,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 650,
    backgroundColor: ACCENT,
    color: CTA_INK,
    boxShadow:
      '0 1px 2px rgba(0, 0, 0, 0.08), ' +
      \`0 10px 24px -12px color-mix(in srgb, \${ACCENT} 60%, transparent)\`,
    whiteSpace: 'nowrap',
  },
  ctaButtonSm: {
    height: 40,
    paddingInline: 16,
    fontSize: 14,
    borderRadius: 10,
  },
  ctaSheen: {
    position: 'absolute',
    inset: 0,
    background:
      \`linear-gradient(105deg, transparent 38%, color-mix(in srgb, \${DARK_TEXT} 35%, transparent) 50%, transparent 62%)\`,
    pointerEvents: 'none',
  },
  // ---- type system ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  eyebrowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    height: 26,
    paddingInline: 10,
    borderRadius: 999,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_WASH,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  sectionHeading: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionHeadingCompact: {
    fontSize: 28,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // ---- hero ----
  heroSection: {
    position: 'relative',
    paddingTop: 96,
    paddingBottom: 112,
  },
  heroSectionCompact: {
    paddingTop: 48,
    paddingBottom: 64,
  },
  heroRow: {
    position: 'relative',
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
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroTheater: {
    position: 'relative',
    flex: '6 1 0',
    minWidth: 0,
  },
  heroHeadline: {
    fontWeight: 720,
    lineHeight: 1.03,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  heroInk: {
    backgroundImage:
      \`linear-gradient(94deg, \${ACCENT} 5%, \` +
      \`color-mix(in srgb, \${ACCENT} 55%, var(--color-text-blue)) 55%, \` +
      \`color-mix(in srgb, \${ACCENT} 40%, var(--color-text-cyan)) 100%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 750,
    lineHeight: 1.05,
    letterSpacing: '-0.015em',
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // ---- collage theater ----
  collagePerspective: {
    transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  },
  collageGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr 1fr',
    gridAutoRows: 128,
    gap: 'var(--spacing-2)',
    borderRadius: 18,
    boxShadow: SHADOW_FLOATING,
  },
  collageGridCompact: {
    gridTemplateColumns: '1fr 1fr',
    gridAutoRows: 116,
  },
  // Scheme-locked brand art: candid-photo stand-in gradients.
  collageTile: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    colorScheme: 'dark',
    color: '#FFFFFF',
    textAlign: 'left',
    display: 'block',
    width: '100%',
    height: '100%',
    transition: 'transform 320ms ease, box-shadow 320ms ease',
  },
  collageTileSpotlit: {
    transform: 'scale(1.02)',
    boxShadow: \`0 0 0 2px \${ACCENT}, \${SHADOW_RAISED}\`,
    zIndex: 1,
  },
  collageGlyph: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.55,
  },
  collageCaption: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    padding: '18px 12px 10px',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.3,
    background: 'linear-gradient(180deg, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.78) 100%)',
    transition: 'opacity 320ms ease',
  },
  satellite: {
    position: 'absolute',
    zIndex: 2,
    transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  },
  satelliteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 92%, transparent)',
    boxShadow: SHADOW_FLOATING,
    padding: '10px 14px',
  },
  satelliteDisc: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  satelliteTitle: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  },
  satelliteMeta: {
    fontSize: 11,
    lineHeight: 1.3,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Scheme-locked monogram gradients (match the quote avatars).
  satelliteAvatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 700,
    border: '2px solid var(--color-background-card)',
    boxSizing: 'border-box',
  },
  // ---- values (asymmetric 5/7 split, offset columns) ----
  valuesSplit: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  valuesIntroCol: {
    flex: '5 1 0',
    minWidth: 0,
    position: 'sticky',
    top: NAV_ALLOWANCE + 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  valuesCardsCol: {
    flex: '7 1 0',
    minWidth: 0,
  },
  valueCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  valueIndex: {
    fontSize: 44,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: \`color-mix(in srgb, \${ACCENT} 45%, transparent)\`,
  },
  // ---- benefits ----
  benefitCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    height: '100%',
  },
  benefitDisc: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  // ---- roles ----
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  filterChipActive: {
    color: ACCENT,
    backgroundColor: ACCENT_WASH,
    borderColor: ACCENT_BORDER,
  },
  chipCount: {
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.75,
  },
  roleList: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    overflow: 'hidden',
  },
  roleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    padding: 'var(--spacing-3) var(--spacing-4)',
    minHeight: 64,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
    color: 'var(--color-text-primary)',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.3,
    margin: 0,
  },
  locationChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  compValue: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  compExtra: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  roleBody: {
    padding: '0 var(--spacing-4) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  roleBullet: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    flexShrink: 0,
    marginTop: 7,
  },
  applyForm: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  successDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  emptyState: {
    padding: 'var(--spacing-7) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    textAlign: 'center',
  },
  // ---- pinned process story ----
  storyStage: {
    position: 'sticky',
    top: NAV_ALLOWANCE,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxSizing: 'border-box',
    paddingBlock: 'var(--spacing-6)',
  },
  storyRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'stretch',
  },
  storyRail: {
    flex: '5 1 0',
    minWidth: 0,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    paddingLeft: 26,
  },
  storyTrack: {
    position: 'absolute',
    left: 15,
    top: 20,
    bottom: 20,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'var(--color-border)',
  },
  storyTrackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 1,
    backgroundColor: ACCENT,
    transformOrigin: 'top',
    transition: 'transform 160ms linear',
  },
  storyStepButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    minHeight: 48,
    padding: '6px 10px 6px 0',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
  },
  storyDisc: {
    position: 'absolute',
    left: -26,
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 700,
    transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
  },
  storyDiscActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    color: CTA_INK,
  },
  storyDetail: {
    flex: '7 1 0',
    minWidth: 0,
    position: 'relative',
    minHeight: 260,
  },
  storyCard: {
    position: 'absolute',
    inset: 0,
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition:
      'opacity 380ms cubic-bezier(0.22, 0.61, 0.21, 1), transform 380ms cubic-bezier(0.22, 0.61, 0.21, 1)',
  },
  storyGhostIndex: {
    position: 'absolute',
    right: 18,
    top: 2,
    fontSize: 120,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
    color: \`color-mix(in srgb, \${ACCENT} 12%, transparent)\`,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  storyCopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '46ch',
    margin: 0,
  },
  processStepStatic: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 'var(--spacing-4)',
  },
  processDisc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
  },
  // ---- life band (scheme-locked dark, glass + spotlight) ----
  lifeBand: {
    position: 'relative',
    colorScheme: 'dark',
    backgroundColor: DARK_SURFACE,
    color: DARK_TEXT,
    overflow: 'hidden',
  },
  lifeGlowA: {
    position: 'absolute',
    width: 560,
    height: 560,
    top: -220,
    left: '-8%',
    borderRadius: '50%',
    filter: 'blur(100px)',
    background: \`color-mix(in srgb, \${ACCENT} 26%, transparent)\`,
  },
  lifeGlowB: {
    position: 'absolute',
    width: 480,
    height: 480,
    bottom: -240,
    right: '-6%',
    borderRadius: '50%',
    filter: 'blur(100px)',
    background:
      'color-mix(in srgb, var(--color-text-blue) 22%, transparent)',
  },
  lifeSpotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      \`radial-gradient(560px circle at var(--cjl-mx, 50%) var(--cjl-my, 30%), color-mix(in srgb, \${ACCENT} 13%, transparent), transparent 70%)\`,
  },
  quoteGlassCard: {
    borderRadius: 18,
    backgroundColor: \`color-mix(in srgb, \${DARK_TEXT} 6%, transparent)\`,
    boxShadow: SHADOW_GLASS,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    minHeight: 220,
    boxSizing: 'border-box',
  },
  quoteText: {
    fontSize: 21,
    fontWeight: 600,
    lineHeight: 1.45,
    letterSpacing: '-0.01em',
    margin: 0,
    color: DARK_TEXT,
  },
  quoteTextCompact: {
    fontSize: 16,
  },
  // Scheme-locked brand art: employee monogram gradients.
  quoteAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
  },
  carouselDot: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  carouselDotInner: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: \`color-mix(in srgb, \${DARK_TEXT} 24%, transparent)\`,
  },
  carouselDotInnerActive: {
    backgroundColor: ACCENT,
  },
  arrowButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: \`1px solid color-mix(in srgb, \${DARK_TEXT} 18%, transparent)\`,
    backgroundColor: \`color-mix(in srgb, \${DARK_TEXT} 7%, transparent)\`,
    cursor: 'pointer',
    padding: 0,
    color: DARK_TEXT,
    flexShrink: 0,
  },
  // ---- open application card (crosses into the footer band) ----
  pitchCard: {
    position: 'relative',
    borderRadius: 18,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`0 0 0 1px color-mix(in srgb, \${ACCENT} 14%, transparent), \${SHADOW_FLOATING}\`,
    padding: 'var(--spacing-6)',
    overflow: 'hidden',
  },
  pitchWash: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      \`radial-gradient(420px circle at 0% 0%, color-mix(in srgb, \${ACCENT} 10%, transparent), transparent 70%)\`,
  },
  monoText: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    fontWeight: 600,
  },
  // ---- footer (scheme-locked dark surface) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: DARK_SURFACE,
    position: 'relative',
    overflow: 'hidden',
  },
  footerInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '128px var(--spacing-6) var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerInnerCompact: {
    padding: '112px var(--spacing-4) var(--spacing-6)',
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
// Deterministic fixtures for the fictional Halyard careers page.
// No Date.now, no randomness, no network assets.

const BRAND = {
  name: 'Halyard',
  tagline: 'Routing software for short-sea freight',
};

type SectionId = 'values' | 'benefits' | 'roles' | 'process' | 'life';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'values', label: 'Values'},
  {id: 'benefits', label: 'Benefits'},
  {id: 'roles', label: 'Open roles'},
  {id: 'process', label: 'Process'},
  {id: 'life', label: 'Life here'},
];

const HERO = {
  eyebrow: 'Careers at Halyard',
  headlineLead: 'Build the software that',
  headlineInk: 'moves the coast',
  subcopy:
    'Halyard plans routes, tide windows, and berth slots for 214 short-sea ' +
    'carriers. We are 60 people across 14 countries, profitable since 2024, ' +
    'and we would rather hire slowly than hire wrong.',
};

const HERO_STATS: readonly {value: number; label: string}[] = [
  {value: 60, label: 'teammates'},
  {value: 14, label: 'countries'},
  {value: 12, label: 'open roles'},
];

interface CollageTile {
  id: string;
  caption: string;
  icon: Glyph;
  /** Scheme-locked candid-photo stand-in gradient (see Color policy). */
  gradient: string;
}

const COLLAGE: readonly CollageTile[] = [
  {
    id: 'retreat',
    caption: 'All-hands retreat, Óbidos — September 2025',
    icon: TentIcon,
    gradient: 'linear-gradient(140deg, #14B8A6 0%, #0F766E 55%, #115E59 100%)',
  },
  {
    id: 'whiteboard',
    caption: 'Whiteboarding the tide-window router, v3',
    icon: PenToolIcon,
    gradient: 'linear-gradient(140deg, #F59E0B 0%, #D97706 60%, #92400E 100%)',
  },
  {
    id: 'install',
    caption: 'First install day, Port of Rotterdam',
    icon: ShipIcon,
    gradient: 'linear-gradient(140deg, #6366F1 0%, #4338CA 60%, #312E81 100%)',
  },
  {
    id: 'crit',
    caption: 'Tuesday design crit — cameras optional',
    icon: MessageSquareIcon,
    gradient: 'linear-gradient(140deg, #F472B6 0%, #DB2777 60%, #9D174D 100%)',
  },
  {
    id: 'dog',
    caption: 'Bó, chief morale officer, Lisbon HQ',
    icon: DogIcon,
    gradient: 'linear-gradient(140deg, #38BDF8 0%, #0284C7 60%, #075985 100%)',
  },
];

const VALUES: readonly {id: string; title: string; copy: string}[] = [
  {
    id: 'ship',
    title: 'Ship small, ship weekly',
    copy:
      'Every team cuts a release on Thursday. If a feature cannot ship in ' +
      'slices, we redesign the feature — not the calendar.',
  },
  {
    id: 'doc',
    title: 'Disagree in the doc',
    copy:
      'Decisions live in written proposals with open comments. The best ' +
      'argument wins; job titles do not get a vote multiplier.',
  },
  {
    id: 'customers',
    title: 'Customers over demos',
    copy:
      'We build for the dispatcher on a night shift, not the conference ' +
      'keynote. Everyone does three support rotations a year — founders included.',
  },
  {
    id: 'pace',
    title: 'Sustainable pace',
    copy:
      'No hero culture. On-call is paid, comp time is enforced, and we staff ' +
      'projects so one vacation never blocks a launch.',
  },
];

const BENEFITS: readonly {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}[] = [
  {
    id: 'equity',
    icon: TrendingUpIcon,
    title: 'Meaningful equity',
    copy:
      'Every offer includes equity with a 10-year exercise window and annual refresh grants.',
  },
  {
    id: 'health',
    icon: HeartPulseIcon,
    title: 'Full health cover',
    copy:
      '100% of premiums for you and your dependents — medical, dental, vision — from day one.',
  },
  {
    id: 'remote',
    icon: GlobeIcon,
    title: 'Remote-first, truly',
    copy:
      'Docs over meetings across 14 countries. Two overlap hours a day is the only fixed rule.',
  },
  {
    id: 'retreat',
    icon: TentIcon,
    title: 'Two retreats a year',
    copy:
      'The whole company, somewhere with bad Wi-Fi on purpose. Partners join one of the two.',
  },
  {
    id: 'learning',
    icon: GraduationCapIcon,
    title: '$2,400 learning budget',
    copy:
      'Books, courses, conferences — auto-approved, and no receipts theater under $200.',
  },
  {
    id: 'pto',
    icon: SunIcon,
    title: '20 days minimum PTO',
    copy:
      'A floor, not a ceiling. We track usage and chase you if you are under it by Q3.',
  },
];

type Department = 'engineering' | 'design' | 'gtm';
type DeptFilter = 'all' | Department;
type LocationId = 'remote-us' | 'remote-eu' | 'lisbon' | 'nyc';

const DEPT_LABELS: Record<Department, string> = {
  engineering: 'Engineering',
  design: 'Design',
  gtm: 'GTM',
};

const LOCATION_LABELS: Record<LocationId, string> = {
  'remote-us': 'Remote (US)',
  'remote-eu': 'Remote (EU)',
  lisbon: 'Lisbon HQ',
  nyc: 'New York',
};

interface Role {
  id: string;
  title: string;
  dept: Department;
  team: string;
  location: LocationId;
  /** Comp renders on two rows: salary band + equity/OTE note. */
  salary: string;
  compExtra: string;
  isNew?: boolean;
  summary: string;
  bullets: readonly string[];
}

const ROLES: readonly Role[] = [
  {
    id: 'eng-backend-routing',
    title: 'Senior Backend Engineer, Routing',
    dept: 'engineering',
    team: 'Routing',
    location: 'remote-eu',
    salary: '$110k – $140k',
    compExtra: '+ 0.08% – 0.15% equity',
    isNew: true,
    summary:
      'Own the tide-window solver that plans 3,800 port calls a week. You will ' +
      'work in Go and Postgres on a codebase with 84% test coverage and a ' +
      'deploy that takes eleven minutes.',
    bullets: [
      'Cut median route-recompute time below 400ms (currently 900ms)',
      'Design the multi-leg berth conflict resolver with the Routing trio',
      'Pair with dispatchers at two customer ports each quarter',
    ],
  },
  {
    id: 'eng-frontend-console',
    title: 'Staff Frontend Engineer, Console',
    dept: 'engineering',
    team: 'Console',
    location: 'remote-us',
    salary: '$185k – $220k',
    compExtra: '+ 0.10% – 0.20% equity',
    summary:
      'Lead the dispatcher console — a dense, keyboard-first React app used ' +
      'for eight-hour shifts. You will set the frontend architecture bar for ' +
      'a team of five.',
    bullets: [
      'Ship the live berth-board rewrite (virtualized, offline-tolerant)',
      'Own the design-system contract with our two product designers',
      'Mentor two mid-level engineers with weekly pairing blocks',
    ],
  },
  {
    id: 'eng-sre-platform',
    title: 'Site Reliability Engineer',
    dept: 'engineering',
    team: 'Platform',
    location: 'remote-eu',
    salary: '$95k – $125k',
    compExtra: '+ 0.06% – 0.12% equity',
    isNew: true,
    summary:
      'Keep a 99.95% SLO honest across three regions. Our stack is boring on ' +
      'purpose: Kubernetes, Terraform, and a paging rota that fired 14 times ' +
      'in the last year.',
    bullets: [
      'Own capacity planning for the January carrier-contract season',
      'Bring staging parity to the port-integration sandboxes',
      'Halve our mean time to a green incident-review doc (now 9 days)',
    ],
  },
  {
    id: 'eng-data-forecasting',
    title: 'Data Engineer, Forecasting',
    dept: 'engineering',
    team: 'Forecasting',
    location: 'lisbon',
    salary: '$88k – $112k',
    compExtra: '+ 0.05% – 0.10% equity',
    summary:
      'Build the pipelines behind demand and delay forecasts: 40M AIS ' +
      'positions a day into dbt models the whole company reads. SQL first, ' +
      'Python where it earns its keep.',
    bullets: [
      'Rebuild the delay-attribution mart (today: one 2,000-line query)',
      'Ship freshness SLAs and alerts for the six most-read models',
      'Sit with the Routing team one week per month',
    ],
  },
  {
    id: 'eng-mobile-deckhand',
    title: 'Mobile Engineer, Deckhand app',
    dept: 'engineering',
    team: 'Mobile',
    location: 'remote-eu',
    salary: '$92k – $118k',
    compExtra: '+ 0.05% – 0.10% equity',
    summary:
      'Deckhand is our offline-first React Native app for crews with gloves ' +
      'on and one bar of signal. Small team, big surface: you would be ' +
      'engineer two of two.',
    bullets: [
      'Make sync conflict resolution boring (CRDT groundwork is in)',
      'Ship the cargo-checklist scanner for the Rotterdam pilot',
      'Own release trains for both app stores',
    ],
  },
  {
    id: 'eng-manager-platform',
    title: 'Engineering Manager, Platform',
    dept: 'engineering',
    team: 'Platform',
    location: 'nyc',
    salary: '$200k – $235k',
    compExtra: '+ 0.12% – 0.22% equity',
    summary:
      'Manage six platform engineers across four timezones. We expect ' +
      'managers to write code one day a week and to run the calmest on-call ' +
      'in the company.',
    bullets: [
      'Own the platform roadmap with our CTO (quarterly, written, public)',
      'Grow two seniors toward staff scope this year',
      'Keep the paging rota humane — it is a stated KPI',
    ],
  },
  {
    id: 'design-product-console',
    title: 'Product Designer, Console',
    dept: 'design',
    team: 'Design',
    location: 'remote-eu',
    salary: '$95k – $120k',
    compExtra: '+ 0.06% – 0.12% equity',
    isNew: true,
    summary:
      'Design for dispatchers who measure software in saved keystrokes. You ' +
      'will own the console end-to-end with a staff engineer counterpart and ' +
      'ship every two weeks.',
    bullets: [
      'Redesign the berth-conflict flow (our #1 support theme)',
      'Run monthly ride-alongs with dispatch teams in two ports',
      'Co-own the Figma-to-tokens pipeline with Console engineers',
    ],
  },
  {
    id: 'design-brand',
    title: 'Brand Designer',
    dept: 'design',
    team: 'Design',
    location: 'lisbon',
    salary: '$70k – $90k',
    compExtra: '+ 0.04% – 0.08% equity',
    summary:
      'First dedicated brand hire. Everything from the trade-show booth to ' +
      'the release-notes illustrations is yours; the current "brand kit" is ' +
      'a logo and three strong opinions.',
    bullets: [
      'Build the brand system (type, color, illustration) by Q1 2027',
      'Own two product-launch campaigns a year with Marketing',
      'Art-direct the annual Coastal Freight Report',
    ],
  },
  {
    id: 'gtm-ae-midmarket',
    title: 'Account Executive, Mid-market',
    dept: 'gtm',
    team: 'Sales',
    location: 'nyc',
    salary: '$90k – $110k base',
    compExtra: 'OTE $180k – $220k, 50/50 split',
    isNew: true,
    summary:
      'Sell to carrier ops directors on 60-90 day cycles with a 34% win ' +
      'rate from qualified pipe. Quota is set from last year\\'s median ' +
      'attainment, not last year\\'s best quarter.',
    bullets: [
      'Own 40 named mid-market accounts in the US Northeast',
      'Run the full cycle from discovery through security review',
      'Feed pricing signal into the quarterly packaging review',
    ],
  },
  {
    id: 'gtm-solutions-engineer',
    title: 'Solutions Engineer',
    dept: 'gtm',
    team: 'Sales',
    location: 'remote-us',
    salary: '$130k – $155k',
    compExtra: '+ 10% variable, paid quarterly',
    summary:
      'Own the technical side of every mid-market and enterprise deal: ' +
      'integration scoping, sandbox builds, and the security questionnaire ' +
      'gauntlet. You will write real API integrations weekly.',
    bullets: [
      'Build reusable TMS/ERP integration playbooks (SAP, CargoWise)',
      'Cut proof-of-concept time from 3 weeks to 1',
      'Be the field voice in the monthly API design review',
    ],
  },
  {
    id: 'gtm-pmm-lead',
    title: 'Product Marketing Lead',
    dept: 'gtm',
    team: 'Marketing',
    location: 'remote-us',
    salary: '$140k – $165k',
    compExtra: '+ 0.05% – 0.10% equity',
    summary:
      'First PMM. Turn "routing engine with tide windows" into language a ' +
      'fleet director repeats in their budget meeting. You will own ' +
      'positioning, launches, and the sales narrative.',
    bullets: [
      'Rewrite positioning off 20 win/loss interviews in your first quarter',
      'Own launch tiers and the launch calendar company-wide',
      'Ship the competitive field guide Sales actually opens',
    ],
  },
  {
    id: 'gtm-csm-emea',
    title: 'Customer Success Manager, EMEA',
    dept: 'gtm',
    team: 'Customer Success',
    location: 'lisbon',
    salary: '$75k – $95k',
    compExtra: '+ 8% variable on net retention',
    summary:
      'Own 28 EMEA carrier accounts through onboarding, QBRs, and renewals. ' +
      'Net revenue retention is 118%; your job is to keep churn boring and ' +
      'expansion honest.',
    bullets: [
      'Run onboarding for 2-3 new carriers a month (4-week program)',
      'Own the renewal book for the Iberia and Benelux regions',
      'Escalate product gaps with evidence, not vibes',
    ],
  },
];

const LOCATION_OPTIONS = [
  {value: 'all', label: 'All locations'},
  {value: 'remote-us', label: 'Remote (US)'},
  {value: 'remote-eu', label: 'Remote (EU)'},
  {value: 'lisbon', label: 'Lisbon HQ'},
  {value: 'nyc', label: 'New York'},
];

const PROCESS_STEPS: readonly {
  id: string;
  title: string;
  duration: string;
  copy: string;
}[] = [
  {
    id: 'intro',
    title: 'Intro call',
    duration: '30 min',
    copy:
      'With the hiring manager, not a recruiter screen. We share the comp band before this call ends.',
  },
  {
    id: 'craft',
    title: 'Craft session',
    duration: '60–90 min',
    copy:
      'A real problem from our backlog in your discipline. No trick questions, no whiteboard algorithms.',
  },
  {
    id: 'loop',
    title: 'Team loop',
    duration: 'Half a day',
    copy:
      'Four future teammates across two calls, plus 30 minutes with a founder. Scheduled around your timezone.',
  },
  {
    id: 'decision',
    title: 'Decision',
    duration: 'Within 48 h',
    copy:
      'A written yes or no with specific feedback either way. We call references only after you hold an offer.',
  },
];

const PROCESS_FOOTNOTES: readonly string[] = [
  'Median 11 days from application to offer',
  'Take-home work over 2 hours is paid at $100/hour',
  'Interview childcare costs covered',
];

interface EmployeeQuote {
  id: string;
  quote: string;
  name: string;
  initials: string;
  role: string;
  tenure: string;
  /** Scheme-locked monogram gradient (see Color policy). */
  gradient: string;
}

const QUOTES: readonly EmployeeQuote[] = [
  {
    id: 'sofia',
    quote:
      'I have shipped more in two years here than in six at my last company. ' +
      'The Óbidos retreat where we redesigned the tide-window router on paper ' +
      'napkins is still my favorite week of work, ever.',
    name: 'Sofia Marques',
    initials: 'SM',
    role: 'Senior Engineer, Routing',
    tenure: '2 years at Halyard',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #4338CA 100%)',
  },
  {
    id: 'devon',
    quote:
      'Remote-first actually means it. Decisions happen in docs I can read ' +
      'from Porto on my own hours — I have never lost an argument because I ' +
      'was not standing in a hallway.',
    name: 'Devon Okafor',
    initials: 'DO',
    role: 'Product Designer',
    tenure: '18 months at Halyard',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)',
  },
  {
    id: 'priya',
    quote:
      'The 20-days-minimum PTO rule has teeth. Last spring my manager noticed ' +
      'I was behind on days off and blocked two weeks in my calendar before I ' +
      'could argue about it.',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Customer Success, EMEA',
    tenure: '3 years at Halyard',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
  },
];

const FOOTER_GROUPS: readonly {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}[] = [
  {
    id: 'join',
    heading: 'Join us',
    links: [
      {label: 'Open roles', anchor: 'roles'},
      {label: 'How we hire', anchor: 'process'},
      {label: 'Benefits', anchor: 'benefits'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      {label: 'Values', anchor: 'values'},
      {label: 'Life at Halyard', anchor: 'life'},
      {label: 'Press kit'},
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    links: [{label: 'careers@halyard.co'}, {label: 'hello@halyard.co'}],
  },
];

/** Floating satellite mini-cards staged around the hero collage. */
const SATELLITE_METRIC = {
  title: 'Median 11 days to offer',
  meta: 'Application → decision',
};
const SATELLITE_TOAST = {
  title: 'New application',
  meta: 'Senior Backend Engineer, Routing',
};
const SATELLITE_TEAM = {
  title: '60 teammates',
  meta: '14 countries · 2 hubs',
};

// ============= HELPERS =============

const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

interface ApplyFormValues {
  name: string;
  email: string;
  link: string;
}

type ApplyFormErrors = Partial<Record<keyof ApplyFormValues, string>>;

const EMPTY_APPLY_FORM: ApplyFormValues = {name: '', email: '', link: ''};

function validateApplyForm(values: ApplyFormValues): ApplyFormErrors {
  const errors: ApplyFormErrors = {};
  if (values.name.trim().length === 0) {
    errors.name = 'Tell us your name.';
  }
  if (values.email.trim().length === 0) {
    errors.email = 'We need an email to reply to.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "That doesn't look like an email address.";
  }
  const link = values.link.trim();
  if (link.length > 0 && !/\\./.test(link)) {
    errors.link = 'Add a full URL, or leave this blank.';
  }
  return errors;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Measure the page's own width (the inline demo stage is ~1045px wide,
 * so viewport media queries never fire there). */
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

/** Measure the scroll container's height — the pinned story sizes its
 * travel from the real stage, not viewport units. */
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

function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/** Fire-once in-view flag for scroll reveals and count-ups. */
function useInViewOnce(
  ref: RefObject<HTMLDivElement | null>,
  threshold = 0.15,
): boolean {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
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
      {threshold},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return isInView;
}

// ============= SMALL PIECES =============

/** Scroll-reveal wrapper: rise 16px + fade + settle from scale .985,
 * 560ms decelerate bezier, fires once; groups stagger children via
 * \`delay\` (60-90ms steps). Reduced motion renders visible immediately. */
function Reveal({children, delay = 0}: {children: ReactNode; delay?: number}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInViewOnce(ref);
  const isReduced = usePrefersReducedMotion();
  const isShown = isReduced || isInView;
  return (
    <div
      ref={ref}
      style={{
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(16px) scale(0.985)',
        transition: isReduced
          ? 'none'
          : \`opacity 560ms cubic-bezier(0.22, 0.61, 0.21, 1) \${delay}ms, \` +
            \`transform 560ms cubic-bezier(0.22, 0.61, 0.21, 1) \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

/** Integer count-up on first view (~900ms, decelerate easing);
 * reduced-motion renders the final value. */
function CountUp({
  value,
  isStarted,
  isReduced,
}: {
  value: number;
  isStarted: boolean;
  isReduced: boolean;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isStarted) {
      return undefined;
    }
    if (isReduced) {
      setDisplay(value);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isStarted, isReduced, value]);
  return <>{display.toLocaleString('en-US')}</>;
}

/** Section intro: accent eyebrow chip + display heading + supporting copy. */
function SectionIntro({
  eyebrow,
  title,
  description,
  isCompact,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  isCompact: boolean;
}) {
  return (
    <VStack gap={2}>
      <span style={styles.eyebrowChip}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionHeading,
          ...(isCompact ? styles.sectionHeadingCompact : null),
        }}>
        {title}
      </h2>
      {description != null && (
        <p style={styles.sectionDescription}>{description}</p>
      )}
    </VStack>
  );
}

/** Filled accent CTA with sheen sweep, 1px hover lift, and pressed
 * scale (all in TEMPLATE_CSS, disabled under reduced motion). */
function CtaButton({
  label,
  icon,
  onClick,
  size = 'md',
  style,
}: {
  label: string;
  icon?: Glyph;
  onClick: () => void;
  size?: 'md' | 'sm';
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className="cjl-cta"
      onClick={onClick}
      style={{
        ...styles.ctaButton,
        ...(size === 'sm' ? styles.ctaButtonSm : null),
        ...style,
      }}>
      <span className="cjl-cta-sheen" style={styles.ctaSheen} aria-hidden="true" />
      {label}
      {icon != null && <Icon icon={icon} size="sm" color="inherit" />}
    </button>
  );
}

// ============= PAGE =============

export default function CareersJobsLandingTemplate() {
  // ---- responsive: measure our own width (demo-stage quirk) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 900;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isPhone = wrapWidth > 0 && wrapWidth <= 540;

  const isReduced = usePrefersReducedMotion();

  // ---- navbar ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll container + scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageHeight = useElementHeight(pageRef);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- hero stats count-up ----
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInViewOnce(statsRef, 0.4);

  // ---- collage spotlight + theater parallax (signature hero) ----
  const [spotlight, setSpotlight] = useState(0);
  const [isCollageHovered, setIsCollageHovered] = useState(false);
  // Parallax writes transforms straight to the DOM (refs, no re-render).
  const theaterRef = useRef<HTMLDivElement | null>(null);
  const satARef = useRef<HTMLDivElement | null>(null);
  const satBRef = useRef<HTMLDivElement | null>(null);
  const satCRef = useRef<HTMLDivElement | null>(null);
  const canParallax = !isReduced && !isStacked;

  // ---- roles filters + expansion + apply form ----
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyValues, setApplyValues] =
    useState<ApplyFormValues>(EMPTY_APPLY_FORM);
  const [applyErrors, setApplyErrors] = useState<ApplyFormErrors>({});
  const [submittedRoleIds, setSubmittedRoleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [submittedName, setSubmittedName] = useState('');

  // ---- pinned process story ----
  const storyOuterRef = useRef<HTMLDivElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [staticStep, setStaticStep] = useState(0);
  const isStoryPinned = !isReduced && !isStacked && pageHeight > 480;
  const stageHeight = Math.max(0, pageHeight - NAV_ALLOWANCE);
  const storyTravel = Math.round(stageHeight * 1.6);
  const activeStep = isStoryPinned
    ? Math.min(
        PROCESS_STEPS.length - 1,
        Math.floor(storyProgress * PROCESS_STEPS.length),
      )
    : staticStep;

  // ---- quote carousel + dark-band spotlight ----
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuoteHovered, setIsQuoteHovered] = useState(false);
  const lifeRef = useRef<HTMLElement | null>(null);

  // Collage spotlight rotates every 3.2s; hover pauses, reduced-motion
  // stops it entirely (tiles stay clickable).
  useEffect(() => {
    if (isReduced || isCollageHovered) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setSpotlight(previous => (previous + 1) % COLLAGE.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [isReduced, isCollageHovered]);

  // Quote carousel auto-advances every 5.2s under the same gating.
  useEffect(() => {
    if (isReduced || isQuoteHovered) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setQuoteIndex(previous => (previous + 1) % QUOTES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [isReduced, isQuoteHovered]);

  // Hamburger menu dismisses on Escape (refocusing the trigger) and on
  // any pointerdown outside the sticky navbar.
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

  /** Smooth-scroll the page container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container === null || section == null) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE + 8,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Scroll-spy + nav glass state + pinned-story progress, one pass. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setIsNavScrolled(container.scrollTop > 24);
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
    const outer = storyOuterRef.current;
    if (outer !== null && isStoryPinned && storyTravel > 0) {
      const raw =
        (container.scrollTop - (outer.offsetTop - NAV_ALLOWANCE)) /
        storyTravel;
      setStoryProgress(Math.round(clamp01(raw) * 1000) / 1000);
    }
  };

  /** Step buttons drive the pinned story (or highlight the static one). */
  const jumpToStoryStep = (index: number) => {
    setStaticStep(index);
    const container = pageRef.current;
    const outer = storyOuterRef.current;
    if (!isStoryPinned || container === null || outer === null) {
      return;
    }
    const targetProgress = (index + 0.5) / PROCESS_STEPS.length;
    container.scrollTo({
      top: outer.offsetTop - NAV_ALLOWANCE + targetProgress * storyTravel,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Hero parallax: ±8px translate / ±3° tilt toward the pointer,
   * written straight to the DOM to avoid re-rendering on pointermove. */
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canParallax) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const theater = theaterRef.current;
    if (theater !== null) {
      theater.style.transform =
        \`perspective(1200px) rotateX(\${(2 - y * 3).toFixed(2)}deg) \` +
        \`rotateY(\${(-3 + x * 3).toFixed(2)}deg)\`;
    }
    const sats: readonly [HTMLDivElement | null, number][] = [
      [satARef.current, 10],
      [satBRef.current, -8],
      [satCRef.current, 7],
    ];
    for (const [node, depth] of sats) {
      if (node !== null) {
        node.style.transform =
          \`translate(\${(x * depth).toFixed(1)}px, \${(y * depth).toFixed(1)}px)\`;
      }
    }
  };

  const onHeroPointerLeave = () => {
    const theater = theaterRef.current;
    if (theater !== null) {
      theater.style.transform =
        'perspective(1200px) rotateX(2deg) rotateY(-3deg)';
    }
    for (const node of [satARef.current, satBRef.current, satCRef.current]) {
      if (node !== null) {
        node.style.transform = 'translate(0px, 0px)';
      }
    }
  };

  /** Dark-band spotlight: CSS vars only, no re-render. */
  const onLifePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const band = lifeRef.current;
    if (band === null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--cjl-mx', \`\${event.clientX - rect.left}px\`);
    band.style.setProperty('--cjl-my', \`\${event.clientY - rect.top}px\`);
  };

  const toggleRole = (id: string) => {
    setIsApplyOpen(false);
    setApplyValues(EMPTY_APPLY_FORM);
    setApplyErrors({});
    setExpandedRoleId(previous => (previous === id ? null : id));
  };

  const setApplyField = (field: keyof ApplyFormValues) => (value: string) => {
    setApplyValues(previous => ({...previous, [field]: value}));
    setApplyErrors(previous => ({...previous, [field]: undefined}));
  };

  const submitApplication = (role: Role) => {
    const errors = validateApplyForm(applyValues);
    if (errors.name != null || errors.email != null || errors.link != null) {
      setApplyErrors(errors);
      return;
    }
    setSubmittedName(applyValues.name.trim().split(' ')[0] ?? '');
    setSubmittedRoleIds(previous => {
      const next = new Set(previous);
      next.add(role.id);
      return next;
    });
    setIsApplyOpen(false);
    setApplyValues(EMPTY_APPLY_FORM);
    setApplyErrors({});
  };

  const clearRoleFilters = () => {
    setDeptFilter('all');
    setLocationFilter('all');
  };

  // ---- derived ----
  const deptCounts: Record<DeptFilter, number> = {
    all: ROLES.length,
    engineering: ROLES.filter(role => role.dept === 'engineering').length,
    design: ROLES.filter(role => role.dept === 'design').length,
    gtm: ROLES.filter(role => role.dept === 'gtm').length,
  };
  const visibleRoles = ROLES.filter(
    role =>
      (deptFilter === 'all' || role.dept === deptFilter) &&
      (locationFilter === 'all' || role.location === locationFilter),
  );

  /** Display type tiers — 76px at full width, never under 56 above 820. */
  const displaySize =
    wrapWidth > 1000 ? 76 : wrapWidth > 820 ? 64 : wrapWidth > 600 ? 52 : 40;

  const innerColumn: CSSProperties = {
    ...styles.innerColumn,
    ...(isPhone ? styles.innerColumnCompact : null),
  };
  const sectionPad: CSSProperties = {
    ...styles.section,
    ...(isPhone ? styles.sectionCompact : null),
  };

  // ============= CHROME =============

  const brandMark = (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={AnchorIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        {!isPhone && (
          <Text type="supporting" color="secondary">
            {BRAND.tagline}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isNavScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Careers page">
      <div
        style={{
          ...styles.navInner,
          ...(isNavScrolled ? styles.navInnerScrolled : null),
        }}>
        {brandMark}
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCompact &&
          NAV_ANCHORS.map(anchor => (
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
        {!isNavCompact && (
          <CtaButton
            label="See open roles"
            size="sm"
            onClick={() => jumpToSection('roles')}
          />
        )}
        {isNavCompact && (
          <button
            type="button"
            ref={menuTriggerRef}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            style={styles.iconButton}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        )}
        {isNavCompact && isMenuOpen && (
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
                label="See open roles"
                size="sm"
                style={{width: '100%'}}
                onClick={() => jumpToSection('roles')}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const collage = (
    <div
      ref={theaterRef}
      className={canParallax ? undefined : 'cjl-theater-flat'}
      style={{
        ...styles.collagePerspective,
        transform: canParallax
          ? 'perspective(1200px) rotateX(2deg) rotateY(-3deg)'
          : 'none',
      }}
      onMouseEnter={() => setIsCollageHovered(true)}
      onMouseLeave={() => setIsCollageHovered(false)}>
      <div
        style={{
          ...styles.collageGrid,
          ...(isNavCompact ? styles.collageGridCompact : null),
        }}>
        {COLLAGE.map((tile, index) => {
          const isSpotlit = spotlight === index;
          const lead = index === 0;
          return (
            <button
              key={tile.id}
              type="button"
              aria-label={tile.caption}
              onClick={() => setSpotlight(index)}
              onMouseEnter={() => setSpotlight(index)}
              style={{
                ...styles.collageTile,
                background: tile.gradient,
                ...(lead
                  ? isNavCompact
                    ? {gridColumn: 'span 2'}
                    : {gridRow: 'span 2'}
                  : null),
                ...(isSpotlit ? styles.collageTileSpotlit : null),
              }}>
              <span style={styles.collageGlyph} aria-hidden="true">
                <Icon icon={tile.icon} size="md" color="inherit" />
              </span>
              <span
                style={{
                  ...styles.collageCaption,
                  opacity: isSpotlit ? 1 : 0.55,
                }}>
                {tile.caption}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Satellite mini-cards: bob on independent keyframes (inner div) and
  // parallax toward the pointer (outer div, written via refs). Hidden at
  // stacked widths so the 390px artboard stays clean.
  const satellites = !isStacked && (
    <>
      <div
        ref={satARef}
        style={{...styles.satellite, top: -22, left: -30}}
        aria-hidden="true">
        <div className="cjl-bob-a" style={styles.satelliteCard}>
          <div style={styles.satelliteDisc}>
            <Icon icon={TrendingUpIcon} size="sm" color="inherit" />
          </div>
          <div>
            <div style={styles.satelliteTitle}>{SATELLITE_METRIC.title}</div>
            <div style={styles.satelliteMeta}>{SATELLITE_METRIC.meta}</div>
          </div>
        </div>
      </div>
      <div
        ref={satBRef}
        style={{...styles.satellite, bottom: -26, left: 34}}
        aria-hidden="true">
        <div className="cjl-bob-b" style={styles.satelliteCard}>
          <div style={styles.satelliteDisc}>
            <Icon icon={BriefcaseIcon} size="sm" color="inherit" />
          </div>
          <div>
            <div style={styles.satelliteTitle}>{SATELLITE_TOAST.title}</div>
            <div style={styles.satelliteMeta}>{SATELLITE_TOAST.meta}</div>
          </div>
        </div>
      </div>
      <div
        ref={satCRef}
        style={{...styles.satellite, top: '38%', right: -26}}
        aria-hidden="true">
        <div className="cjl-bob-c" style={styles.satelliteCard}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {QUOTES.map((quote, index) => (
              <div
                key={quote.id}
                style={{
                  ...styles.satelliteAvatar,
                  background: quote.gradient,
                  marginLeft: index === 0 ? 0 : -8,
                }}>
                {quote.initials}
              </div>
            ))}
          </div>
          <div>
            <div style={styles.satelliteTitle}>{SATELLITE_TEAM.title}</div>
            <div style={styles.satelliteMeta}>{SATELLITE_TEAM.meta}</div>
          </div>
        </div>
      </div>
    </>
  );

  const hero = (
    <header
      style={{
        ...styles.heroSection,
        ...(isPhone ? styles.heroSectionCompact : null),
      }}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {/* Aurora field + grain: composed background, static under reduced motion. */}
      <div style={styles.atmosphere} aria-hidden="true">
        <div
          className="cjl-aurora-a"
          style={{
            ...styles.auroraBlob,
            width: 520,
            height: 520,
            top: -180,
            left: '-6%',
            opacity: 0.5,
            background: \`color-mix(in srgb, \${ACCENT} 45%, transparent)\`,
          }}
        />
        <div
          className="cjl-aurora-b"
          style={{
            ...styles.auroraBlob,
            width: 460,
            height: 460,
            top: -60,
            right: '-10%',
            opacity: 0.4,
            background:
              \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 40%, var(--color-text-blue)) 45%, transparent)\`,
          }}
        />
        <div
          className="cjl-aurora-c"
          style={{
            ...styles.auroraBlob,
            width: 380,
            height: 380,
            bottom: -160,
            left: '32%',
            opacity: 0.35,
            background:
              'color-mix(in srgb, color-mix(in srgb, var(--color-success) 60%, var(--color-text-cyan)) 40%, transparent)',
          }}
        />
        <div style={styles.grain} />
      </div>
      <div style={innerColumn}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <span style={styles.eyebrowChip}>{HERO.eyebrow}</span>
            <h1
              style={{
                ...styles.heroHeadline,
                fontSize: displaySize,
              }}>
              {HERO.headlineLead}{' '}
              <span style={styles.heroInk}>{HERO.headlineInk}</span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            <HStack gap={2} wrap="wrap">
              <CtaButton
                label={\`See \${ROLES.length} open roles\`}
                icon={ArrowRightIcon}
                onClick={() => jumpToSection('roles')}
              />
              <Button
                label="How we hire"
                variant="secondary"
                onClick={() => jumpToSection('process')}
              />
            </HStack>
            <div ref={statsRef}>
              <HStack gap={5} wrap="wrap">
                {HERO_STATS.map(stat => (
                  <VStack key={stat.label} gap={0}>
                    <span style={styles.statValue}>
                      <CountUp
                        value={stat.value}
                        isStarted={statsInView}
                        isReduced={isReduced}
                      />
                    </span>
                    <span style={styles.statLabel}>{stat.label}</span>
                  </VStack>
                ))}
              </HStack>
            </div>
          </div>
          <div style={styles.heroTheater}>
            {collage}
            {satellites}
          </div>
        </div>
      </div>
    </header>
  );

  // ============= VALUES (asymmetric 5/7, offset overlapping columns) =====

  const valueCard = (value: (typeof VALUES)[number], index: number) => (
    <div key={value.id} className="cjl-lift" style={styles.valueCard}>
      <span style={styles.valueIndex}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <Text type="label">{value.title}</Text>
      <Text type="supporting" color="secondary">
        {value.copy}
      </Text>
    </div>
  );

  const valuesSection = (
    <section
      ref={registerSection('values')}
      aria-label="Values"
      style={sectionPad}>
      <div style={innerColumn}>
        {isStacked ? (
          <Reveal>
            <VStack gap={5}>
              <SectionIntro
                eyebrow="How we work"
                title="Four values we actually enforce"
                description="Not poster words — each one shows up in a process you can point at."
                isCompact={isPhone}
              />
              <VStack gap={3}>
                {VALUES.map((value, index) => valueCard(value, index))}
              </VStack>
            </VStack>
          </Reveal>
        ) : (
          <div style={styles.valuesSplit}>
            <div style={styles.valuesIntroCol}>
              <Reveal>
                <SectionIntro
                  eyebrow="How we work"
                  title="Four values we actually enforce"
                  description="Not poster words — each one shows up in a process you can point at."
                  isCompact={isPhone}
                />
              </Reveal>
            </div>
            <div style={styles.valuesCardsCol}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-4)',
                }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-4)',
                  }}>
                  <Reveal>{valueCard(VALUES[0]!, 0)}</Reveal>
                  <Reveal delay={140}>{valueCard(VALUES[2]!, 2)}</Reveal>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-4)',
                    paddingTop: 44,
                  }}>
                  <Reveal delay={70}>{valueCard(VALUES[1]!, 1)}</Reveal>
                  <Reveal delay={210}>{valueCard(VALUES[3]!, 3)}</Reveal>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // ============= BENEFITS (full-bleed dot-grid band) =============

  const benefitsSection = (
    <section
      ref={registerSection('benefits')}
      aria-label="Benefits"
      style={styles.mutedBand}>
      <div style={styles.dotGrid} aria-hidden="true" />
      <div style={{...innerColumn, ...sectionPad}}>
        <VStack gap={6}>
          <Reveal>
            <SectionIntro
              eyebrow="Benefits"
              title="The boring-on-purpose package"
              description="No ping-pong tables in the deck. Six things that matter, in writing."
              isCompact={isPhone}
            />
          </Reveal>
          <Grid columns={{minWidth: 290, max: 3}} gap={4}>
            {BENEFITS.map((benefit, index) => (
              <Reveal key={benefit.id} delay={index * 75}>
                <div className="cjl-lift" style={styles.benefitCard}>
                  <div style={styles.benefitDisc} aria-hidden="true">
                    <Icon icon={benefit.icon} size="sm" color="inherit" />
                  </div>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {benefit.title}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {benefit.copy}
                    </Text>
                  </VStack>
                </div>
              </Reveal>
            ))}
          </Grid>
        </VStack>
      </div>
    </section>
  );

  // ============= ROLES =============

  const renderApplyPanel = (role: Role) => {
    if (submittedRoleIds.has(role.id)) {
      return (
        <div style={styles.applyForm} role="status">
          <HStack gap={3} vAlign="center">
            <div style={styles.successDisc} aria-hidden="true">
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {submittedName.length > 0
                  ? \`Thanks, \${submittedName} — your application is in.\`
                  : 'Thanks — your application is in.'}
              </Text>
              <Text type="supporting" color="secondary">
                A human reads every application for {role.title}. We reply
                within 3 working days, whatever the answer.
              </Text>
            </VStack>
          </HStack>
        </div>
      );
    }
    if (!isApplyOpen) {
      return (
        <HStack gap={2} wrap="wrap">
          <CtaButton
            label="Apply for this role"
            size="sm"
            onClick={() => setIsApplyOpen(true)}
          />
          <Text type="supporting" color="secondary">
            {role.salary} · {LOCATION_LABELS[role.location]}
          </Text>
        </HStack>
      );
    }
    return (
      <div style={styles.applyForm}>
        <Text size="sm" weight="semibold">
          Apply — {role.title}
        </Text>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
            flexDirection: isPhone ? 'column' : 'row',
          }}>
          <StackItem size="fill">
            <TextInput
              label="Full name"
              isRequired
              placeholder="Alex Ferreira"
              value={applyValues.name}
              onChange={setApplyField('name')}
              status={
                applyErrors.name != null
                  ? {type: 'error', message: applyErrors.name}
                  : undefined
              }
            />
          </StackItem>
          <StackItem size="fill">
            <TextInput
              label="Email"
              type="email"
              isRequired
              placeholder="you@example.com"
              value={applyValues.email}
              onChange={setApplyField('email')}
              status={
                applyErrors.email != null
                  ? {type: 'error', message: applyErrors.email}
                  : undefined
              }
            />
          </StackItem>
        </div>
        <TextInput
          label="Portfolio, GitHub, or LinkedIn"
          isOptional
          placeholder="https://…"
          value={applyValues.link}
          onChange={setApplyField('link')}
          status={
            applyErrors.link != null
              ? {type: 'error', message: applyErrors.link}
              : undefined
          }
        />
        <HStack gap={2} wrap="wrap">
          <CtaButton
            label="Submit application"
            size="sm"
            onClick={() => submitApplication(role)}
          />
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsApplyOpen(false);
              setApplyErrors({});
            }}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          No cover letter required. We share the interview plan and comp band
          on the first call.
        </Text>
      </div>
    );
  };

  const rolesSection = (
    <section
      ref={registerSection('roles')}
      aria-label="Open roles"
      style={sectionPad}>
      {/* Second aurora field, calmer than the hero's. */}
      <div style={styles.atmosphere} aria-hidden="true">
        <div
          className="cjl-aurora-b"
          style={{
            ...styles.auroraBlob,
            width: 480,
            height: 480,
            top: '10%',
            right: '-12%',
            opacity: 0.35,
            background: \`color-mix(in srgb, \${ACCENT} 38%, transparent)\`,
          }}
        />
        <div
          className="cjl-aurora-c"
          style={{
            ...styles.auroraBlob,
            width: 380,
            height: 380,
            bottom: '-4%',
            left: '-10%',
            opacity: 0.3,
            background:
              'color-mix(in srgb, color-mix(in srgb, var(--color-text-blue) 70%, var(--color-text-cyan)) 38%, transparent)',
          }}
        />
      </div>
      <div style={innerColumn}>
        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Open roles"
              title={\`\${ROLES.length} open roles across 3 teams\`}
              description="Every listing shows the comp band up front. Bands are set by role and level, not by negotiation stamina."
              isCompact={isPhone}
            />
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-2)',
                alignItems: isPhone ? 'stretch' : 'center',
                flexDirection: isPhone ? 'column' : 'row',
                flexWrap: 'wrap',
              }}>
              <HStack gap={2} wrap="wrap">
                {(['all', 'engineering', 'design', 'gtm'] as const).map(dept => (
                  <button
                    key={dept}
                    type="button"
                    aria-pressed={deptFilter === dept}
                    style={{
                      ...styles.filterChip,
                      ...(deptFilter === dept ? styles.filterChipActive : null),
                    }}
                    onClick={() => setDeptFilter(dept)}>
                    {dept === 'all' ? 'All teams' : DEPT_LABELS[dept]}
                    <span style={styles.chipCount}>{deptCounts[dept]}</span>
                  </button>
                ))}
              </HStack>
              <StackItem size="fill">
                <span />
              </StackItem>
              <Selector
                label="Location"
                isLabelHidden
                size="sm"
                width={isPhone ? '100%' : 180}
                options={LOCATION_OPTIONS}
                value={locationFilter}
                onChange={setLocationFilter}
              />
            </div>
            <div style={styles.roleList}>
              {visibleRoles.length === 0 && (
                <div style={styles.emptyState}>
                  <Icon icon={BriefcaseIcon} size="lg" color="secondary" />
                  <Text weight="semibold">
                    No {deptFilter === 'all' ? '' : \`\${DEPT_LABELS[deptFilter as Department]} \`}
                    roles in {locationFilter === 'all' ? 'that location' : LOCATION_LABELS[locationFilter as LocationId]} right now
                  </Text>
                  <Text type="supporting" color="secondary">
                    Roles open most months — or pitch us directly at
                    careers@halyard.co.
                  </Text>
                  <Button
                    label="Clear filters"
                    variant="secondary"
                    size="sm"
                    onClick={clearRoleFilters}
                  />
                </div>
              )}
              {visibleRoles.map((role, index) => {
                const isExpanded = expandedRoleId === role.id;
                return (
                  <div key={role.id}>
                    {index > 0 && <Divider />}
                    <button
                      type="button"
                      className="cjl-role-row"
                      aria-expanded={isExpanded}
                      style={styles.roleHeader}
                      onClick={() => toggleRole(role.id)}>
                      <StackItem size="fill">
                        <VStack gap={1}>
                          <HStack gap={2} vAlign="center" wrap="wrap">
                            <span style={styles.roleTitle}>{role.title}</span>
                            {role.isNew && <Badge variant="info" label="New" />}
                          </HStack>
                          <HStack gap={2} vAlign="center" wrap="wrap">
                            <Text type="supporting" color="secondary">
                              {DEPT_LABELS[role.dept]} · {role.team}
                            </Text>
                            <span style={styles.locationChip}>
                              <Icon icon={MapPinIcon} size="xsm" color="inherit" />
                              {LOCATION_LABELS[role.location]}
                            </span>
                          </HStack>
                          {isStacked && (
                            <VStack gap={0}>
                              <span style={styles.compValue}>{role.salary}</span>
                              <span style={styles.compExtra}>
                                {role.compExtra}
                              </span>
                            </VStack>
                          )}
                        </VStack>
                      </StackItem>
                      {!isStacked && (
                        <div style={{textAlign: 'right'}}>
                          <VStack gap={0} hAlign="end">
                            <span style={styles.compValue}>{role.salary}</span>
                            <span style={styles.compExtra}>{role.compExtra}</span>
                          </VStack>
                        </div>
                      )}
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'inline-flex',
                          color: 'var(--color-text-secondary)',
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: isReduced ? 'none' : 'transform 200ms ease',
                        }}>
                        <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                      </span>
                    </button>
                    {isExpanded && (
                      <div style={styles.roleBody}>
                        <Text type="body" color="secondary">
                          {role.summary}
                        </Text>
                        <VStack gap={1}>
                          <Text type="supporting" weight="semibold">
                            What you'll own
                          </Text>
                          {role.bullets.map(bullet => (
                            <div key={bullet} style={styles.roleBullet}>
                              <span style={styles.bulletDot} aria-hidden="true" />
                              <Text type="supporting" color="secondary">
                                {bullet}
                              </Text>
                            </div>
                          ))}
                        </VStack>
                        {renderApplyPanel(role)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ============= PROCESS (pinned scroll story) =============

  const storyStepButton = (
    step: (typeof PROCESS_STEPS)[number],
    index: number,
  ) => {
    const isActive = index === activeStep;
    return (
      <button
        key={step.id}
        type="button"
        aria-current={isActive ? 'step' : undefined}
        style={styles.storyStepButton}
        onClick={() => jumpToStoryStep(index)}>
        <span
          style={{
            ...styles.storyDisc,
            ...(isActive ? styles.storyDiscActive : null),
          }}
          aria-hidden="true">
          {index + 1}
        </span>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text size="sm" weight="semibold">
              {step.title}
            </Text>
            <Badge variant="neutral" label={step.duration} />
          </HStack>
        </VStack>
      </button>
    );
  };

  const storyFootnotes = (
    <HStack gap={2} wrap="wrap">
      {PROCESS_FOOTNOTES.map(note => (
        <span key={note} style={styles.locationChip}>
          <Icon icon={CheckIcon} size="xsm" color="inherit" />
          {note}
        </span>
      ))}
    </HStack>
  );

  const processSection = isStoryPinned ? (
    <section ref={registerSection('process')} aria-label="Hiring process">
      <div
        ref={storyOuterRef}
        style={{height: stageHeight + storyTravel, position: 'relative'}}>
        <div style={{...styles.storyStage, height: stageHeight}}>
          <div style={innerColumn}>
            <VStack gap={6}>
              <SectionIntro
                eyebrow="How we hire"
                title="Four steps, no surprises"
                description="The whole loop fits in one calendar week if you want it to. Scroll — or click a step."
                isCompact={isPhone}
              />
              <div style={styles.storyRow}>
                <div style={styles.storyRail}>
                  <div style={styles.storyTrack} aria-hidden="true">
                    <div
                      style={{
                        ...styles.storyTrackFill,
                        transform: \`scaleY(\${storyProgress})\`,
                      }}
                    />
                  </div>
                  {PROCESS_STEPS.map((step, index) =>
                    storyStepButton(step, index),
                  )}
                  {storyFootnotes}
                </div>
                <div style={styles.storyDetail}>
                  {PROCESS_STEPS.map((step, index) => {
                    const isActive = index === activeStep;
                    return (
                      <div
                        key={step.id}
                        aria-hidden={!isActive}
                        style={{
                          ...styles.storyCard,
                          opacity: isActive ? 1 : 0,
                          transform: isActive
                            ? 'none'
                            : index < activeStep
                              ? 'translateY(-14px) scale(0.985)'
                              : 'translateY(14px) scale(0.985)',
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}>
                        <span style={styles.storyGhostIndex} aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span style={styles.eyebrow}>
                          Step {index + 1} of {PROCESS_STEPS.length}
                        </span>
                        <h3
                          style={{
                            ...styles.sectionHeading,
                            fontSize: 32,
                          }}>
                          {step.title}
                        </h3>
                        <Badge variant="neutral" label={step.duration} />
                        <p style={styles.storyCopy}>{step.copy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </VStack>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <section
      ref={registerSection('process')}
      aria-label="Hiring process"
      style={sectionPad}>
      <div style={innerColumn}>
        <Reveal>
          <VStack gap={5}>
            <SectionIntro
              eyebrow="How we hire"
              title="Four steps, no surprises"
              description="The whole loop fits in one calendar week if you want it to."
              isCompact={isPhone}
            />
            <VStack gap={3}>
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.id} style={styles.processStepStatic}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <button
                      type="button"
                      aria-current={index === activeStep ? 'step' : undefined}
                      style={{
                        ...styles.processDisc,
                        border: 'none',
                        cursor: 'pointer',
                        ...(index === activeStep
                          ? {backgroundColor: ACCENT, color: CTA_INK}
                          : null),
                      }}
                      onClick={() => jumpToStoryStep(index)}>
                      {index + 1}
                    </button>
                    <Text size="sm" weight="semibold">
                      {step.title}
                    </Text>
                    <Badge variant="neutral" label={step.duration} />
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {step.copy}
                  </Text>
                </div>
              ))}
            </VStack>
            {storyFootnotes}
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ============= LIFE HERE (scheme-locked dark band) =============

  const activeQuote = QUOTES[quoteIndex] ?? QUOTES[0]!;

  const lifeSection = (
    <section
      ref={node => {
        registerSection('life')(node);
        lifeRef.current = node;
      }}
      aria-label="Life at Halyard"
      style={styles.lifeBand}
      onPointerMove={onLifePointerMove}>
      <div style={styles.lifeGlowA} aria-hidden="true" />
      <div style={styles.lifeGlowB} aria-hidden="true" />
      <div style={styles.lifeSpotlight} aria-hidden="true" />
      <div style={styles.grain} aria-hidden="true" />
      <div style={{...innerColumn, ...sectionPad}}>
        <Reveal>
          <VStack gap={5}>
            <VStack gap={2}>
              <span style={styles.eyebrowChip}>Life here</span>
              <h2
                style={{
                  ...styles.sectionHeading,
                  ...(isPhone ? styles.sectionHeadingCompact : null),
                  color: DARK_TEXT,
                }}>
                In their words
              </h2>
              <p style={{...styles.sectionDescription, color: DARK_TEXT_SOFT}}>
                Three teammates, unedited beyond trimming for length.
              </p>
            </VStack>
            <div
              onMouseEnter={() => setIsQuoteHovered(true)}
              onMouseLeave={() => setIsQuoteHovered(false)}>
              <HStack gap={3} vAlign="center">
                {!isPhone && (
                  <button
                    type="button"
                    aria-label="Previous quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(
                        previous =>
                          (previous - 1 + QUOTES.length) % QUOTES.length,
                      )
                    }>
                    <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
                  </button>
                )}
                <StackItem size="fill">
                  <div style={styles.quoteGlassCard} aria-live="polite">
                    <p
                      style={{
                        ...styles.quoteText,
                        ...(isPhone ? styles.quoteTextCompact : null),
                      }}>
                      &ldquo;{activeQuote.quote}&rdquo;
                    </p>
                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          ...styles.quoteAvatar,
                          background: activeQuote.gradient,
                        }}
                        aria-hidden="true">
                        {activeQuote.initials}
                      </div>
                      <VStack gap={0}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: DARK_TEXT,
                          }}>
                          {activeQuote.name}
                        </span>
                        <span style={{fontSize: 12, color: DARK_TEXT_FAINT}}>
                          {activeQuote.role} · {activeQuote.tenure}
                        </span>
                      </VStack>
                    </HStack>
                  </div>
                </StackItem>
                {!isPhone && (
                  <button
                    type="button"
                    aria-label="Next quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(previous => (previous + 1) % QUOTES.length)
                    }>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </button>
                )}
              </HStack>
              <HStack gap={1} hAlign="center">
                {QUOTES.map((quote, index) => (
                  <button
                    key={quote.id}
                    type="button"
                    aria-label={\`Show quote from \${quote.name}\`}
                    aria-pressed={quoteIndex === index}
                    style={styles.carouselDot}
                    onClick={() => setQuoteIndex(index)}>
                    <span
                      style={{
                        ...styles.carouselDotInner,
                        ...(quoteIndex === index
                          ? styles.carouselDotInnerActive
                          : null),
                      }}
                    />
                  </button>
                ))}
              </HStack>
              {isPhone && (
                <HStack gap={2} hAlign="center">
                  <button
                    type="button"
                    aria-label="Previous quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(
                        previous =>
                          (previous - 1 + QUOTES.length) % QUOTES.length,
                      )
                    }>
                    <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(previous => (previous + 1) % QUOTES.length)
                    }>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </button>
                </HStack>
              )}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ===== OPEN APPLICATION CARD (crosses into the footer band) =====

  const pitchCard = (
    <div
      style={{
        ...innerColumn,
        marginBottom: -64,
        position: 'relative',
        zIndex: 2,
        paddingTop: isPhone ? 40 : 64,
      }}>
      <Reveal>
        <div style={styles.pitchCard}>
          <div style={styles.pitchWash} aria-hidden="true" />
          <HStack gap={4} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Text type="label">Don't see your role?</Text>
                <Text type="supporting" color="secondary">
                  We keep a short bench of people we want to work with. Two of
                  our last eight hires started as open applications.
                </Text>
              </VStack>
            </StackItem>
            <span style={styles.monoText}>careers@halyard.co</span>
            <Button
              label="Browse roles again"
              variant="secondary"
              size="sm"
              onClick={() => jumpToSection('roles')}
            />
          </HStack>
        </div>
      </Reveal>
    </div>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer}>
      <div style={styles.grain} aria-hidden="true" />
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerCompact : null),
        }}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-6)',
            flexDirection: isStacked ? 'column' : 'row',
          }}>
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <div style={styles.logoTile} aria-hidden="true">
                  <Icon icon={AnchorIcon} size="sm" color="inherit" />
                </div>
                <Text type="label" color="inherit">
                  {BRAND.name}
                </Text>
              </HStack>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_SOFT, maxWidth: 320}}>
                {BRAND.tagline}. Remote-first with hubs in Lisbon and New
                York. Profitable, independent, and hiring carefully.
              </Text>
            </VStack>
          </StackItem>
          <Grid columns={{minWidth: 140, max: 3}} gap={4}>
            {FOOTER_GROUPS.map(group => (
              <VStack key={group.id} gap={1}>
                <Text
                  type="supporting"
                  weight="semibold"
                  color="inherit"
                  style={{color: DARK_TEXT}}>
                  {group.heading}
                </Text>
                {group.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    style={styles.footerLink}
                    onClick={
                      link.anchor != null
                        ? () => jumpToSection(link.anchor as SectionId)
                        : () => {}
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            ))}
          </Grid>
        </div>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Halyard Systems, Lda. All rights reserved.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            Halyard is an equal-opportunity employer. We interview in English,
            Portuguese, and Dutch.
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Halyard careers page">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {hero}
              {valuesSection}
              {benefitsSection}
              {rolesSection}
              {processSection}
              {lifeSection}
              {pitchCard}
              {footer}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};