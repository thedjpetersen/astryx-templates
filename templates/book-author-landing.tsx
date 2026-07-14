// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file book-author-landing.tsx
 * @input Deterministic fixtures only (the fictional technical book "The
 *   Interface Layer" by invented author Imogen Hale, Foldcase Press: four
 *   nav anchors, hero copy with four invented pseudo-retailer buttons,
 *   four count-up stats, three fixture sample pages of chapter prose, six
 *   what-you-will-learn cards, a 12-chapter outline with page counts and
 *   summaries, five praise quotes with roles, an author bio with
 *   speaking/press chips, three purchase formats with a highlighted
 *   bundle and launch-week bonus list, and an ISBN/publisher footer row)
 * @output Art-directed book-launch landing page. The sticky navbar starts
 *   transparent and gains a tinted color-mix surface, hairline, and
 *   slightly reduced height after 24px of scroll. The hero is staged
 *   product theater over an aurora field (three drifting color-mix blobs
 *   + a grain texture overlay): 40-76px display serif headline with a
 *   gradient-ink key phrase, sheen-sweep CTA buttons, and the signature
 *   3D CSS book cover (idle sway on a setInterval, straightens on hover)
 *   restaged with an accent under-glow, pointer parallax driven by CSS
 *   vars (mouse only, off when stacked/reduced), and three bobbing
 *   satellite mini-cards (reader metric, mini praise quote, page/diagram
 *   chip). A floating glass stats card with count-up tickers straddles
 *   the hero/sample band boundary. Below: the sample-chapter reader
 *   (three fixture pages, direction-aware page-turn slide, progress bar,
 *   prev/next controls) in a floating frame; a dot-grid texture band
 *   with the six-card learn grid and 12-chapter Collapsible-Set
 *   accordion; a five-card praise wall with hover-raise depth; the
 *   author bio split; a three-format pricing row over a second aurora
 *   with the highlighted Bundle floated a tier above its siblings; the
 *   scheme-locked dark newsletter band elevated with gradient glows,
 *   grain, a pointer-tracked radial spotlight, and a glass capture card
 *   (validating email form); and the ISBN footer. Reveals rise 16px with
 *   a slight scale settle and fire once via IntersectionObserver; ALL
 *   motion is gated by prefers-reduced-motion (reveals render visible,
 *   counters render final, aurora/bob/parallax/sheen render static).
 * @position Page template; emitted by `astryx template book-author-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div; the navbar inside it is position:sticky
 * top:0 and anchors smooth-scroll the container under a sticky-nav
 * allowance. A centered 1080px column carries each section; full-bleed
 * bands (aurora hero, dot-grid inside band, author band, aurora formats,
 * dark newsletter, footer) paint edge to edge around their own inner
 * columns and clip their own blur bleed. The Toast sits fixed
 * bottom-right.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll to real section ids; the
 *   compact menu button opens a dropdown that closes on Escape (refocusing
 *   the trigger), outside pointerdown, or any selection.
 * - The 3D cover sways between two poses on a 3.2s setInterval (long CSS
 *   transition); pointer hover straightens it to near-flat and pauses the
 *   sway; prefers-reduced-motion renders a flat, static cover. The whole
 *   composition parallaxes ±7-9px toward the pointer over the hero band
 *   via --px/--py CSS vars set from onPointerMove (mouse pointers only;
 *   off when stacked or reduced; satellites counter-move).
 * - The sample reader's prev/next buttons page through 3 fixture pages
 *   with a keyed slide-in animation (direction-aware, skipped under
 *   reduced motion) and drive a determinate progress bar.
 * - The chapter-outline toggle expands a 12-chapter accordion; each
 *   chapter is a controlled Collapsible tracked in a Set so several can
 *   be open at once (chapter 1 ships open).
 * - Stats count up from 0 on first reveal via a fixed 30-step setInterval
 *   ramp (~900ms, cubic ease-out; reduced motion renders final values).
 * - The newsletter form validates (empty + format errors inline) and
 *   success swaps the form for a confirmation echoing the address with a
 *   "Use a different email" reset. The band tracks the pointer with a
 *   radial spotlight via --mx/--my vars (static under reduced motion).
 * - Retailer, format, and footer resource buttons fire named receipt
 *   Toasts (they would leave the page in a real deployment).
 *
 * Color policy: token/light-dark hybrid. ONE quarantined accent literal
 * (ember terracotta, see ACCENT) carries the brand; every aurora blob,
 * glow, ink gradient, and hover ring is DERIVED from it via color-mix
 * with tokens — no new color literals. Literal colors are KEPT only on
 * deliberately scheme-locked art surfaces, each with colorScheme:'dark'
 * in its style: the book cover (front, spine, page edges), the author
 * portrait tile, the newsletter band, and the footer — cover art and
 * dark bands must not reflow with the app theme. Text sitting on those
 * locked surfaces (DARK_TEXT*) is literal on purpose. Shadow depth tiers
 * use the neutral rgba stack from the polish contract (SHADOW_RAISED /
 * SHADOW_FLOATING + hairline inset for glass).
 *
 * Responsive contract (element-measured; the inline demo stage is
 * ~1045px, so the page observes its own width with a ResizeObserver
 * instead of viewport media queries):
 * - Column: max-width 1080px, centered; bands bleed full width.
 * - >960px: nav shows inline anchors + CTA; hero is an asymmetric split
 *   (copy 1.15fr / staged cover 0.85fr) with 76px display type; learn
 *   grid 3-up; praise 3-up; formats 3-up with the Bundle floated -10px.
 * - <=960px: nav links collapse behind a 44px menu button + dropdown;
 *   the hero stacks (staged cover centered below copy); parallax off;
 *   headline 62px.
 * - <=720px: headline 50px; author split stacks; reader controls wrap;
 *   grids drop to 2-up then 1-up via Grid minWidth; formats stack and
 *   the Bundle un-floats; section paddings tighten to 64px.
 * - <=560px: headline 40px, satellite cards hide to protect the 390px
 *   phone artboard, stat sizes step down, retailer buttons wrap
 *   full-width, and the newsletter form stacks its button under the
 *   input. Holds at 390px with no overflow-x (aurora bands clip their
 *   own blur bleed with overflow:hidden).
 * - Tap targets: nav links, menu button, reader controls, and retailer
 *   buttons are 40px+; nothing on the page requires hover (cover hover,
 *   parallax, spotlight, and hover-raise are decorative only).
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {
  ActivityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GaugeIcon,
  GitBranchIcon,
  LayersIcon,
  MailCheckIcon,
  MenuIcon,
  MicIcon,
  NewspaperIcon,
  PenLineIcon,
  QuoteIcon,
  SendIcon,
  ShieldAlertIcon,
  SparklesIcon,
  SplitIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined brand accent — ember terracotta, the only accent literal on
 * the page. Contrast math: light #9A3B16 on white = 7.0:1 (AAA normal
 * text); dark #F09B76 on a ~#1C1C1F app-dark surface = 7.8:1. Both clear
 * WCAG AA for text and UI at every size used here.
 */
const ACCENT = 'light-dark(#9A3B16, #F09B76)';
/** 12% wash of the same accent for tinted chips/fills (no new literal). */
const ACCENT_TINT = `color-mix(in srgb, ${ACCENT} 12%, transparent)`;
/** 32% mix for meter borders and hover rings. */
const ACCENT_EDGE = `color-mix(in srgb, ${ACCENT} 32%, transparent)`;
/** 45% mix for the cover under-glow and CTA glow shadows. */
const ACCENT_GLOW = `color-mix(in srgb, ${ACCENT} 45%, transparent)`;

// Aurora blob paints — the accent color-mixed with system tokens, then
// faded toward transparent (no new literals; see Color policy).
const AURORA_A = `color-mix(in srgb, ${ACCENT} 50%, transparent)`;
const AURORA_B = `color-mix(in srgb, color-mix(in srgb, ${ACCENT} 42%, var(--color-icon-blue)) 42%, transparent)`;
const AURORA_C = `color-mix(in srgb, color-mix(in srgb, ${ACCENT} 38%, var(--color-success)) 36%, transparent)`;

// Depth tiers (values from the polish contract; neutral shadow stack).
const SHADOW_RAISED =
  '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px -12px rgba(0,0,0,0.18)';
const SHADOW_FLOATING = `${SHADOW_RAISED}, 0 24px 48px -24px rgba(0,0,0,0.28)`;
const HAIRLINE_INSET =
  'inset 0 0 0 1px color-mix(in srgb, var(--color-border) 60%, transparent)';

// Scheme-locked dark surfaces (cover art, newsletter band, footer) use
// literal paint with colorScheme:'dark' so they read identically in both
// app themes — see Color policy in the header.
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(231, 225, 212, 0.82)';
const DARK_TEXT_FAINT = 'rgba(231, 225, 212, 0.6)';
const DARK_CHIP_BORDER = 'rgba(231, 225, 212, 0.26)';
const DARK_GLASS = 'rgba(231, 225, 212, 0.07)';
const ERROR_ON_DARK = '#FECACA';

/** Grain texture: inline SVG feTurbulence data URI, tiled at 4% opacity. */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Sticky-nav height allowance for smooth-scroll targets. */
const NAV_ALLOWANCE = 76;

/** Sheen sweep for CTAs — the existing #FFFFFF literal, mixed down. */
const SHEEN_GRADIENT = `linear-gradient(115deg, transparent 32%, color-mix(in srgb, ${DARK_TEXT} 32%, transparent) 50%, transparent 68%)`;

/**
 * Keyframes + hover classes. The reduce media block backstops the JS
 * gating for every animated class on the page.
 */
const MOTION_CSS = `
@keyframes bal-page-next {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes bal-page-prev {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes bal-aurora-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(48px, -32px, 0) scale(1.12); }
  100% { transform: translate3d(-28px, 26px, 0) scale(0.94); }
}
@keyframes bal-aurora-b {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-52px, 30px, 0) scale(1.1); }
  100% { transform: translate3d(32px, -22px, 0) scale(0.96); }
}
@keyframes bal-bob {
  from { transform: translateY(-6px); }
  to { transform: translateY(7px); }
}
.bal-cta {
  position: relative;
  overflow: hidden;
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.bal-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  background: ${SHEEN_GRADIENT};
  transform: translateX(-160%);
  transition: transform 640ms ease;
  pointer-events: none;
}
.bal-cta:hover::after { transform: translateX(160%); }
.bal-cta:hover { transform: translateY(-1px); }
.bal-cta:active { transform: translateY(0) scale(0.98); }
.bal-raise {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.bal-raise:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 0 1px ${ACCENT_EDGE}, ${SHADOW_FLOATING} !important;
}
@media (prefers-reduced-motion: reduce) {
  .bal-page, .bal-aurora, .bal-bob { animation: none !important; }
  .bal-cta, .bal-raise { transition: none !important; }
  .bal-cta::after { display: none; }
  .bal-cta:hover, .bal-raise:hover { transform: none !important; }
}
`;

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
    maxWidth: 1080,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnPhone: {
    paddingInline: 'var(--spacing-4)',
  },
  section: {
    paddingBlock: 104,
  },
  sectionCompact: {
    paddingBlock: 64,
  },
  // ---- sticky navbar (transparent → tinted surface after 24px) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 240ms ease, border-color 240ms ease, box-shadow 240ms ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    paddingInline: 'var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_EDGE}`,
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
  menuButton: {
    width: 44,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
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
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-3)',
    zIndex: 40,
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
  // ---- layered atmosphere ----
  auroraLayer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(84px)',
    pointerEvents: 'none',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URI,
    backgroundSize: '160px 160px',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  // ---- hero band + product theater ----
  heroBand: {
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1px solid var(--color-border)',
    background: `linear-gradient(180deg, transparent 44%, color-mix(in srgb, ${ACCENT} 5%, transparent) 100%)`,
  },
  heroRow: {
    position: 'relative',
    zIndex: 2,
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
    flex: '1.15 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontWeight: 700,
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
    margin: 0,
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  heroInk: {
    backgroundImage: `linear-gradient(96deg, ${ACCENT} 8%, color-mix(in srgb, ${ACCENT} 55%, var(--color-text-primary)) 92%)`,
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
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingInline: 22,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    backgroundColor: ACCENT,
    color: 'light-dark(#FFFFFF, #0B1220)',
    boxShadow: `0 12px 28px -12px ${ACCENT_GLOW}, ${SHADOW_RAISED}`,
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingInline: 20,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    boxShadow: SHADOW_RAISED,
  },
  retailerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingInline: 16,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    boxShadow: SHADOW_RAISED,
  },
  // ---- staged cover (parallax + under-glow + satellites) ----
  coverStage: {
    flex: '0.85 1 0',
    minWidth: 0,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-6)',
    perspective: 1200,
  },
  coverParallax: {
    position: 'relative',
    transform:
      'translate3d(calc(var(--px, 0) * 9px), calc(var(--py, 0) * 7px), 0)',
    transition: 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  coverGlow: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 260,
    height: 48,
    borderRadius: '50%',
    background: `radial-gradient(closest-side, ${ACCENT_GLOW}, transparent)`,
    filter: 'blur(18px)',
    opacity: 0.75,
    pointerEvents: 'none',
  },
  satellite: {
    position: 'absolute',
    zIndex: 3,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 92%, transparent)',
    boxShadow: `${SHADOW_FLOATING}, ${HAIRLINE_INSET}`,
    padding: '10px 14px',
    transform:
      'translate3d(calc(var(--px, 0) * -7px), calc(var(--py, 0) * -5px), 0)',
    transition: 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  coverBook: {
    position: 'relative',
    transformStyle: 'preserve-3d',
  },
  coverFront: {
    position: 'relative',
    boxSizing: 'border-box',
    borderRadius: '4px 10px 10px 4px',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(90% 60% at 85% 8%, rgba(240, 155, 118, 0.42), transparent 60%)',
      'linear-gradient(160deg, #22304E 0%, #0B1220 62%)',
    ].join(', '),
    boxShadow: '0 24px 48px rgba(11, 18, 32, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '22px 24px',
  },
  coverSpine: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 36,
    colorScheme: 'dark',
    background: 'linear-gradient(180deg, #16213A 0%, #0B1220 100%)',
    borderRadius: '4px 0 0 4px',
    transform: 'translateX(-18px) rotateY(90deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverSpineText: {
    writingMode: 'vertical-rl',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: DARK_TEXT_SOFT,
    whiteSpace: 'nowrap',
  },
  coverPages: {
    position: 'absolute',
    top: '1.5%',
    right: 0,
    height: '97%',
    width: 34,
    background:
      'repeating-linear-gradient(180deg, #E7E1D4 0px, #E7E1D4 2px, #CFC7B4 3px, #E7E1D4 4px)',
    transform: 'translateX(17px) rotateY(90deg)',
    borderRadius: 2,
  },
  coverEyebrow: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
  },
  coverTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  coverSubtitle: {
    fontSize: 12,
    lineHeight: 1.5,
    color: DARK_TEXT_SOFT,
    margin: 0,
  },
  coverAuthor: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: DARK_TEXT_SOFT,
  },
  // ---- floating stats card (crosses the hero/sample band boundary) ----
  statsWrap: {
    position: 'relative',
    zIndex: 2,
  },
  statsCard: {
    borderRadius: 24,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: `${SHADOW_FLOATING}, ${HAIRLINE_INSET}`,
    padding: 'var(--spacing-6)',
  },
  statValue: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
  },
  statValuePhone: {
    fontSize: 30,
  },
  // ---- section intro ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_EDGE}`,
  },
  sectionHeading: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    letterSpacing: '-0.02em',
    lineHeight: 1.12,
  },
  // ---- sample reader ----
  readerFrame: {
    borderRadius: 'var(--radius-container, 14px)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    boxShadow: `${SHADOW_FLOATING}, ${HAIRLINE_INSET}`,
    maxWidth: 760,
    marginInline: 'auto',
  },
  readerChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  readerBody: {
    padding: 'var(--spacing-6)',
    minHeight: 300,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  readerBodyPhone: {
    padding: 'var(--spacing-4)',
    minHeight: 380,
  },
  proseTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 var(--spacing-3) 0',
  },
  prose: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 16,
    lineHeight: 1.7,
    margin: 0,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
    flex: '1 1 0',
    minWidth: 80,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: ACCENT,
    transition: 'width 320ms ease',
  },
  readerControls: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderTop: '1px solid var(--color-border)',
  },
  // ---- inside the book (dot-grid texture band) ----
  insideBand: {
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage:
      'radial-gradient(circle, color-mix(in srgb, var(--color-border) 55%, transparent) 1px, transparent 1.5px)',
    backgroundSize: '26px 26px',
    borderBlock: '1px solid var(--color-border)',
  },
  learnCard: {
    boxShadow: SHADOW_RAISED,
    height: '100%',
    boxSizing: 'border-box',
  },
  learnGlyph: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  chapterNumber: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    fontWeight: 700,
    color: ACCENT,
    width: 26,
    flexShrink: 0,
  },
  // ---- praise ----
  quoteGlyph: {
    color: ACCENT,
    display: 'inline-flex',
  },
  // ---- author (portrait tile scheme-locked; see Color policy) ----
  authorBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  portraitTile: {
    width: 190,
    height: 190,
    flexShrink: 0,
    borderRadius: 24,
    colorScheme: 'dark',
    backgroundImage: [
      'radial-gradient(80% 70% at 80% 12%, rgba(240, 155, 118, 0.5), transparent 62%)',
      'linear-gradient(150deg, #22304E 0%, #0B1220 70%)',
    ].join(', '),
    color: DARK_TEXT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 56,
    fontWeight: 700,
    boxShadow: SHADOW_FLOATING,
    transform: 'rotate(-2deg)',
  },
  // ---- formats (second aurora field) ----
  formatsBand: {
    position: 'relative',
    overflow: 'hidden',
  },
  formatCard: {
    boxShadow: SHADOW_RAISED,
    height: '100%',
    boxSizing: 'border-box',
  },
  formatCardHighlighted: {
    borderColor: ACCENT,
    boxShadow: `0 0 0 1px ${ACCENT_EDGE}, ${SHADOW_FLOATING}`,
  },
  formatPrice: {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  checkGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  bonusList: {
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_EDGE}`,
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- newsletter band (scheme-locked signature dark section) ----
  newsletterBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 90% at 85% 0%, rgba(240, 155, 118, 0.28), transparent 60%)',
      'radial-gradient(50% 70% at 8% 100%, rgba(34, 48, 78, 0.9), transparent 70%)',
      'linear-gradient(180deg, #16213A 0%, #0B1220 100%)',
    ].join(', '),
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(420px circle at var(--mx, 72%) var(--my, 18%), rgba(240, 155, 118, 0.16), transparent 70%)',
  },
  glassCard: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 720,
    marginInline: 'auto',
    borderRadius: 24,
    backgroundColor: DARK_GLASS,
    boxShadow: `inset 0 0 0 1px ${DARK_CHIP_BORDER}, ${SHADOW_FLOATING}`,
    padding: 'var(--spacing-8)',
  },
  glassCardPhone: {
    padding: 'var(--spacing-5)',
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
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
    border: `1px solid ${DARK_CHIP_BORDER}`,
    backgroundColor: 'rgba(231, 225, 212, 0.12)',
    color: DARK_TEXT,
  },
  // ---- footer (scheme-locked; see Color policy) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#0B1220',
  },
  footerInner: {
    width: '100%',
    maxWidth: 1080,
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
    minHeight: 36,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: DARK_TEXT_FAINT,
    textAlign: 'left',
  },
  isbnRow: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    letterSpacing: '0.02em',
    color: DARK_TEXT_FAINT,
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
// Deterministic fixtures for the fictional book "The Interface Layer".
// No Date.now, no randomness, no network assets, no real retailers.

const BOOK = {
  title: 'The Interface Layer',
  subtitle:
    'A field guide to designing the seams where software meets people — ' +
    'API contracts, error states, naming, and the budget every interface spends.',
  author: 'Imogen Hale',
  publisher: 'Foldcase Press',
  shipDate: 'Ships July 22, 2026',
  isbn: 'ISBN 978-1-7355421-3-8',
  edition: 'First edition · July 2026',
};

type SectionId = 'sample' | 'inside' | 'praise' | 'author' | 'formats';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'sample', label: 'Sample'},
  {id: 'inside', label: 'Inside the book'},
  {id: 'praise', label: 'Praise'},
  {id: 'author', label: 'Author'},
];

/** Invented pseudo-retailers — bordered wordmark buttons, no real marks. */
const RETAILERS: readonly string[] = [
  'PAGEFEED',
  'INKWELL BOOKS',
  'BOOKROW',
  'PAPER & TWINE',
];

interface Stat {
  id: string;
  value: number;
  label: string;
}

const STATS: readonly Stat[] = [
  {id: 'pages', value: 312, label: 'pages in hardcover'},
  {id: 'chapters', value: 12, label: 'chapters plus a field kit'},
  {id: 'diagrams', value: 88, label: 'diagrams and figures'},
  {id: 'readers', value: 9214, label: 'early-access readers'},
];

interface SamplePage {
  id: string;
  heading: string | null;
  pageLabel: string;
  paragraphs: readonly string[];
}

const SAMPLE_PAGES: readonly SamplePage[] = [
  {
    id: 'p1',
    heading: '1 · The Seam',
    pageLabel: 'p. 3',
    paragraphs: [
      'Every system you have ever cursed at failed you at a seam. The ' +
        'database did its job; the API did its job; the button did its ' +
        'job. What failed was the place where they met — the layer where ' +
        "one thing's assumptions quietly became another thing's problem.",
      'We give this layer almost no budget, no owner, and no name. This ' +
        'book is about naming it. The interface layer is not the pixels, ' +
        'and it is not the endpoints. It is the set of promises that ' +
        'travel between them: what a field means, when it may be empty, ' +
        'who gets told when it changes.',
    ],
  },
  {
    id: 'p2',
    heading: null,
    pageLabel: 'p. 4',
    paragraphs: [
      'Start small: an address form, and the shipping API behind it. The ' +
        'API accepts a region code; the form shows a Province dropdown. ' +
        'Somewhere between them a translation happens — and nobody wrote ' +
        'it down. When the API adds territories, the dropdown silently ' +
        'does not. No test fails, because no contract exists to fail.',
      'The bug report, when it arrives, will be filed against the form, ' +
        "triaged to the frontend team, and closed as 'works as intended.' " +
        'The seam swallowed it. Chapter 3 builds the tool for this: the ' +
        'interface contract, a one-page artifact that outlives both the ' +
        'form and the API that made it necessary.',
    ],
  },
  {
    id: 'p3',
    heading: null,
    pageLabel: 'p. 5',
    paragraphs: [
      'You already employ interface designers; you just have not told ' +
        'them. The engineer who decided timestamps would be UTC ' +
        'everywhere made an interface decision. So did whoever made ' +
        'deletion soft by default, and whoever wrote the error message ' +
        "that says 'something went wrong.'",
      'The question is not whether these decisions get made — it is ' +
        'whether they get made once, on purpose, where everyone can see ' +
        'them, or a hundred times, by accident, where nobody can. The ' +
        'chapters ahead are a field kit for making them on purpose. We ' +
        'start where all good field work starts: by walking the boundary ' +
        'and drawing a map.',
    ],
  },
];

interface LearnItem {
  id: string;
  title: string;
  copy: string;
  icon: Glyph;
}

const LEARN_ITEMS: readonly LearnItem[] = [
  {
    id: 'boundary',
    title: 'Draw the boundary',
    copy: 'Find the real interface surfaces hiding in your architecture — and decide what belongs to the layer.',
    icon: SplitIcon,
  },
  {
    id: 'contracts',
    title: 'Contracts before components',
    copy: 'Write one-page interface contracts so the UI and the API can evolve without breaking each other.',
    icon: PenLineIcon,
  },
  {
    id: 'errors',
    title: 'Errors are interfaces too',
    copy: 'Design failure states people can actually recover from, instead of apologizing in a modal.',
    icon: ShieldAlertIcon,
  },
  {
    id: 'versioning',
    title: 'Versioning without whiplash',
    copy: 'Ship breaking changes with grace periods, deprecation windows, and honest migration notes.',
    icon: GitBranchIcon,
  },
  {
    id: 'legibility',
    title: 'The legibility budget',
    copy: 'Measure how much complexity an interface can expose before users stop reading it at all.',
    icon: GaugeIcon,
  },
  {
    id: 'instrument',
    title: 'Instrument the seam',
    copy: 'Put telemetry where users and systems misunderstand each other — not just where code crashes.',
    icon: ActivityIcon,
  },
];

interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: number;
  summary: string;
}

const CHAPTERS: readonly Chapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'The Seam',
    pages: 18,
    summary:
      'Why every memorable system failure is an interface failure, and why the layer where things meet gets no budget, no owner, and no name.',
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Boundaries and Budgets',
    pages: 24,
    summary:
      'Walking the boundary of a real system: which surfaces are interfaces, which are plumbing, and how to split attention between them.',
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Contracts Before Components',
    pages: 26,
    summary:
      'The one-page interface contract: fields, meanings, empty states, and change notices — written before anyone opens a design tool.',
  },
  {
    id: 'ch4',
    number: 4,
    title: 'Naming the Nouns',
    pages: 22,
    summary:
      'Why a product with three names for the same object is lying to someone, and a working process for settling vocabulary disputes.',
  },
  {
    id: 'ch5',
    number: 5,
    title: 'State You Can See',
    pages: 28,
    summary:
      'Making system state legible: optimistic updates, sync indicators, and the difference between loading, empty, and broken.',
  },
  {
    id: 'ch6',
    number: 6,
    title: 'Errors Are Interfaces Too',
    pages: 24,
    summary:
      'A taxonomy of failure states, recovery paths that respect the user’s work, and why "something went wrong" is a design smell.',
  },
  {
    id: 'ch7',
    number: 7,
    title: 'Versioning Without Whiplash',
    pages: 26,
    summary:
      'Deprecation windows, grace periods, and migration notes — shipping breaking changes so consumers feel escorted, not evicted.',
  },
  {
    id: 'ch8',
    number: 8,
    title: 'The Legibility Budget',
    pages: 20,
    summary:
      'Every interface spends attention. How to measure the budget, when to spend it on power, and when to spend it on calm.',
  },
  {
    id: 'ch9',
    number: 9,
    title: 'Latency Is a Material',
    pages: 22,
    summary:
      'Designing with time instead of around it: perceived speed, honest progress, and the 400ms where trust is won or lost.',
  },
  {
    id: 'ch10',
    number: 10,
    title: 'Instrumenting the Seam',
    pages: 24,
    summary:
      'Telemetry for misunderstanding: measuring where people retry, abandon, and route around the interface you shipped.',
  },
  {
    id: 'ch11',
    number: 11,
    title: 'Interfaces at Organizational Scale',
    pages: 26,
    summary:
      'Conway’s law as a design constraint: team boundaries, platform teams, and who owns a seam that crosses three orgs.',
  },
  {
    id: 'ch12',
    number: 12,
    title: 'A Field Kit',
    pages: 16,
    summary:
      'The checklists, worksheets, and review questions from the book, collected in a form you can bring to Monday’s meeting.',
  },
];

interface Praise {
  id: string;
  quote: string;
  name: string;
  role: string;
}

const PRAISE: readonly Praise[] = [
  {
    id: 'pr1',
    quote:
      'The rare technical book that changes how you argue in design reviews. We quote the legibility budget weekly.',
    name: 'Priya Raman',
    role: 'Staff Engineer, Hexbyte',
  },
  {
    id: 'pr2',
    quote:
      'I bought ten copies for my team and watched our API and design reviews merge into one conversation.',
    name: 'Marcus Webb',
    role: 'VP of Design, Northlight',
  },
  {
    id: 'pr3',
    quote:
      'Chapter 6 alone is worth the cover price. Our error states went from apologies to actual interfaces.',
    name: 'Sofia Lindqvist',
    role: 'API Platform Lead, Fielder',
  },
  {
    id: 'pr4',
    quote: 'Reads like a field manual for distributed systems that finally remembered humans are on the other end.',
    name: 'Tom Arceneaux',
    role: 'Author, Queueing for Humans',
  },
  {
    id: 'pr5',
    quote:
      'Our onboarding assigns it before week one. New engineers arrive at their first review already speaking contract.',
    name: 'Dana Okafor',
    role: 'Engineering Director, Polaris',
  },
];

const AUTHOR = {
  name: 'Imogen Hale',
  initials: 'IH',
  bio1:
    'Imogen Hale has spent fourteen years working the seam — building ' +
    'design systems at Lumen Labs and public APIs at Fielder, usually at ' +
    'the same time, usually because nobody else would claim the space ' +
    'between them.',
  bio2:
    'She writes Seams, a weekly letter on interface design read by ' +
    '22,000 engineers and designers, and has taught the material in this ' +
    'book to more than forty teams on four continents.',
  chips: [
    {id: 'keynote', label: 'Keynote · Interface 2025', icon: MicIcon},
    {id: 'podcast', label: 'Frontier Radio, ep. 118', icon: MicIcon},
    {id: 'press', label: 'Systems Weekly profile', icon: NewspaperIcon},
    {id: 'talks', label: '40+ talks · 12 countries', icon: MicIcon},
  ] as readonly {id: string; label: string; icon: Glyph}[],
};

interface BookFormat {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: readonly string[];
  cta: string;
  isHighlighted?: boolean;
  savingsNote?: string;
}

const FORMATS: readonly BookFormat[] = [
  {
    id: 'hardcover',
    name: 'Hardcover',
    price: 39,
    tagline: 'Cloth-bound, stitched, built to be lent out',
    features: [
      '312 pages, cloth cover, ribbon bookmark',
      '88 diagrams printed in two colors',
      'Ships worldwide from July 22',
    ],
    cta: 'Buy hardcover',
  },
  {
    id: 'ebook',
    name: 'Ebook',
    price: 24,
    tagline: 'PDF + ePub, DRM-free, yours forever',
    features: [
      'Instant download, read anywhere',
      'Lifetime updates to every edition',
      'Searchable, with linked figure index',
    ],
    cta: 'Buy ebook',
  },
  {
    id: 'bundle',
    name: 'Bundle',
    price: 49,
    tagline: 'Hardcover + ebook, plus the launch-week extras',
    features: [
      'Everything in both formats',
      'Read the ebook today, lend the hardcover later',
    ],
    cta: 'Get the bundle',
    isHighlighted: true,
    savingsNote: 'Best value · save $14',
  },
];

/** Launch-week bonuses shown on the highlighted Bundle card. */
const LAUNCH_BONUSES: readonly string[] = [
  'Field Kit worksheet pack (fillable PDF)',
  '90-minute live walkthrough with Imogen · Aug 6',
  'Annotated figure library for team workshops',
];

const LAUNCH_NOTE = 'Launch-week bonuses included on orders through July 29.';

const NEWSLETTER = {
  heading: 'Read Chapter 1 free',
  copy:
    'Join 22,000 readers of Seams and get the full first chapter — plus ' +
    'one letter a week on interface design. Unsubscribe anytime.',
};

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to get the chapter.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/** Element-measured width (the inline demo stage never fires viewport MQs). */
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

/** True when the OS asks for reduced motion; reveals then render static. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
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

/** Fire-once viewport reveal; reduced motion (or no IO) renders visible. */
function useRevealOnce(reduced: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (reduced) {
      setIsVisible(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);
  return {ref, isVisible};
}

/**
 * Count from 0 to target once active: 30 fixed setInterval steps (~900ms)
 * with a cubic ease-out. Reduced motion renders the final value at once.
 */
function useCountUp(target: number, isActive: boolean, reduced: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reduced) {
      setValue(target);
      return undefined;
    }
    const steps = 30;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (step >= steps) {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [isActive, reduced, target]);
  return value;
}

// ============= SMALL PIECES =============

/** Rise + settle scroll reveal wrapper (16px + scale .985, fires once). */
function Reveal({
  reduced,
  delay = 0,
  children,
}: {
  reduced: boolean;
  delay?: number;
  children: ReactNode;
}) {
  const {ref, isVisible} = useRevealOnce(reduced);
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : 'translateY(16px) scale(0.985)',
        transition: reduced
          ? 'none'
          : `opacity 560ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 560ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

/** Section intro: accent eyebrow chip + display serif heading + copy. */
function SectionIntro({
  eyebrow,
  title,
  copy,
  align = 'center',
  compact = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: 'center' | 'start';
  compact?: boolean;
}) {
  return (
    <VStack gap={3} hAlign={align === 'center' ? 'center' : 'start'}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <Heading
        level={2}
        style={{...styles.sectionHeading, fontSize: compact ? 30 : 38}}>
        {title}
      </Heading>
      {copy !== undefined && (
        <Text
          type="supporting"
          color="secondary"
          justify={align === 'center' ? 'center' : 'start'}
          style={{maxWidth: 560}}>
          {copy}
        </Text>
      )}
    </VStack>
  );
}

/** One count-up stat cell in the floating stats card. */
function StatCell({
  stat,
  isActive,
  reduced,
  isPhone,
}: {
  stat: Stat;
  isActive: boolean;
  reduced: boolean;
  isPhone: boolean;
}) {
  const value = useCountUp(stat.value, isActive, reduced);
  return (
    <VStack gap={1} hAlign="center">
      <span
        style={{
          ...styles.statValue,
          ...(isPhone ? styles.statValuePhone : null),
        }}>
        {value.toLocaleString('en-US')}
      </span>
      <Text type="supporting" color="secondary" justify="center">
        {stat.label}
      </Text>
    </VStack>
  );
}

/** Green check row used by the format cards. */
function CheckRow({label}: {label: string}) {
  return (
    <HStack gap={2} vAlign="start">
      <span style={styles.checkGlyph} aria-hidden="true">
        <Icon icon={CheckIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill">
        <Text size="sm">{label}</Text>
      </StackItem>
    </HStack>
  );
}

/**
 * 3D-ish book cover: front face, spine, and page edges in a preserve-3d
 * box. Idle sway alternates between two poses on a setInterval; hover
 * straightens; reduced motion renders a flat, static cover. The hero
 * stages this inside a parallax wrapper with under-glow and satellites.
 */
function BookCover({reduced, width}: {reduced: boolean; width: number}) {
  const [isHovered, setIsHovered] = useState(false);
  const [swayTick, setSwayTick] = useState(false);
  useEffect(() => {
    if (reduced || isHovered) {
      return undefined;
    }
    const timer = setInterval(() => setSwayTick(current => !current), 3200);
    return () => clearInterval(timer);
  }, [reduced, isHovered]);

  const height = Math.round(width * 1.5);
  let transform = 'none';
  let transition = 'none';
  if (!reduced) {
    if (isHovered) {
      transform = 'rotateY(4deg)';
      transition = 'transform 600ms ease';
    } else {
      transform = swayTick ? 'rotateY(28deg)' : 'rotateY(18deg)';
      transition = 'transform 3200ms ease-in-out';
    }
  }

  return (
    <div
      role="img"
      aria-label={`Cover of ${BOOK.title} by ${BOOK.author}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.coverBook,
        width,
        height,
        transform,
        transition,
      }}>
      {!reduced && (
        <>
          <div style={{...styles.coverSpine, height}} aria-hidden="true">
            <span style={styles.coverSpineText}>
              {BOOK.title.toUpperCase()} · {BOOK.author.toUpperCase()}
            </span>
          </div>
          <div style={styles.coverPages} aria-hidden="true" />
        </>
      )}
      <div
        style={{
          ...styles.coverFront,
          width,
          height,
          transform: reduced ? 'none' : 'translateZ(18px)',
        }}>
        <VStack gap={3}>
          <span style={styles.coverEyebrow}>{BOOK.publisher}</span>
          {/* Schematic stacked-planes motif: three offset layers. */}
          <svg
            width={width - 48}
            height={72}
            viewBox="0 0 200 72"
            aria-hidden="true">
            <rect
              x={40}
              y={6}
              width={120}
              height={16}
              rx={4}
              fill="none"
              stroke="rgba(231, 225, 212, 0.4)"
              strokeWidth={1.5}
            />
            <rect
              x={26}
              y={28}
              width={148}
              height={16}
              rx={4}
              fill="rgba(240, 155, 118, 0.28)"
              stroke="#F09B76"
              strokeWidth={1.5}
            />
            <rect
              x={12}
              y={50}
              width={176}
              height={16}
              rx={4}
              fill="none"
              stroke="rgba(231, 225, 212, 0.4)"
              strokeWidth={1.5}
            />
          </svg>
        </VStack>
        <VStack gap={2}>
          <p style={{...styles.coverTitle, fontSize: width < 230 ? 26 : 30}}>
            The Interface Layer
          </p>
          <p style={styles.coverSubtitle}>
            A field guide to the seams where software meets people
          </p>
        </VStack>
        <span style={styles.coverAuthor}>{BOOK.author}</span>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function BookAuthorLandingTemplate() {
  const reduced = usePrefersReducedMotion();

  // ---- element-measured responsive breakpoints ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 960;
  const isStacked = isNavCollapsed;
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;

  // ---- nav (compact menu + scrolled surface) ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- smooth scroll ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ---- hero parallax + newsletter spotlight (CSS vars, no re-render) ----
  const heroBandRef = useRef<HTMLDivElement | null>(null);
  const newsletterRef = useRef<HTMLDivElement | null>(null);

  // ---- sample reader ----
  const [reader, setReader] = useState<{
    page: number;
    direction: 'next' | 'prev' | null;
  }>({page: 0, direction: null});

  // ---- chapter outline ----
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    () => new Set([CHAPTERS[0].id]),
  );

  // ---- stats card reveal (shared by all four count-ups) ----
  const statsReveal = useRevealOnce(reduced);

  // ---- newsletter capture ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // ---- toast (keyed so repeat clicks re-announce) ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

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
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const turnPage = (delta: 1 | -1) => {
    setReader(previous => {
      const next = Math.min(
        SAMPLE_PAGES.length - 1,
        Math.max(0, previous.page + delta),
      );
      if (next === previous.page) {
        return previous;
      }
      return {page: next, direction: delta === 1 ? 'next' : 'prev'};
    });
  };

  const toggleChapter = (id: string, isOpen: boolean) => {
    setOpenChapters(previous => {
      const next = new Set(previous);
      if (isOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const submitNewsletter = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  /** Nav surface state: transparent at top, tinted hairline after 24px. */
  const onPageScroll = () => {
    const container = pageRef.current;
    if (container !== null) {
      setIsScrolled(container.scrollTop > 24);
    }
  };

  /** Hero parallax: ±1 pointer vars on the band (mouse only). */
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || isStacked || event.pointerType !== 'mouse') {
      return;
    }
    const band = heroBandRef.current;
    if (band === null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    band.style.setProperty('--px', px.toFixed(3));
    band.style.setProperty('--py', py.toFixed(3));
  };

  const onHeroPointerLeave = () => {
    const band = heroBandRef.current;
    if (band !== null) {
      band.style.setProperty('--px', '0');
      band.style.setProperty('--py', '0');
    }
  };

  /** Dark-band spotlight: pointer position vars (static under reduced). */
  const onNewsletterPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (reduced) {
      return;
    }
    const band = newsletterRef.current;
    if (band === null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', `${Math.round(event.clientX - rect.left)}px`);
    band.style.setProperty('--my', `${Math.round(event.clientY - rect.top)}px`);
  };

  const column = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const sectionPad = {
    ...styles.section,
    ...(isCompact ? styles.sectionCompact : null),
  };

  // ============= NAVBAR =============

  const navbar = (
    <nav
      ref={navRef}
      style={{...styles.navBar, ...(isScrolled ? styles.navBarScrolled : null)}}
      aria-label="Book site">
      <div
        style={{
          ...styles.navInner,
          minHeight: isScrolled ? 52 : 64,
          paddingBlock: isScrolled ? 4 : 8,
        }}>
        <HStack gap={2} vAlign="center">
          <div style={styles.brandTile} aria-hidden="true">
            <Icon icon={LayersIcon} size="sm" color="inherit" />
          </div>
          <Text type="label" style={{whiteSpace: 'nowrap'}}>
            {BOOK.title}
          </Text>
        </HStack>
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCollapsed &&
          NAV_ANCHORS.map(anchor => (
            <button
              key={anchor.id}
              type="button"
              style={styles.navLink}
              onClick={() => jumpToSection(anchor.id)}>
              {anchor.label}
            </button>
          ))}
        <Button
          label="Get the book"
          variant="primary"
          size="sm"
          onClick={() => jumpToSection('formats')}
        />
        {isNavCollapsed && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        )}
        {isNavCollapsed && isMenuOpen && (
          <div style={styles.navMenu} role="menu" aria-label="Sections">
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
              <Divider />
              <button
                type="button"
                role="menuitem"
                style={{...styles.navMenuLink, color: ACCENT}}
                onClick={() => jumpToSection('formats')}>
                <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                Get the book
              </button>
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO (aurora field + staged product theater) =============

  const heroFontSize =
    wrapWidth > 960 ? 76 : wrapWidth > 720 ? 62 : wrapWidth > 560 ? 50 : 40;

  const heroAurora = (
    <div style={styles.auroraLayer} aria-hidden="true">
      <div
        className="bal-aurora"
        style={{
          ...styles.auroraBlob,
          width: 540,
          height: 540,
          top: -180,
          left: -140,
          background: AURORA_A,
          opacity: 0.5,
          animation: reduced
            ? undefined
            : 'bal-aurora-a 38s ease-in-out infinite alternate',
        }}
      />
      <div
        className="bal-aurora"
        style={{
          ...styles.auroraBlob,
          width: 440,
          height: 440,
          top: 30,
          right: -160,
          background: AURORA_B,
          opacity: 0.45,
          animation: reduced
            ? undefined
            : 'bal-aurora-b 44s ease-in-out infinite alternate',
          animationDelay: reduced ? undefined : '-12s',
        }}
      />
      <div
        className="bal-aurora"
        style={{
          ...styles.auroraBlob,
          width: 380,
          height: 380,
          bottom: -200,
          left: '32%',
          background: AURORA_C,
          opacity: 0.4,
          animation: reduced
            ? undefined
            : 'bal-aurora-a 32s ease-in-out infinite alternate',
          animationDelay: reduced ? undefined : '-20s',
        }}
      />
    </div>
  );

  const satellites = !isPhone && (
    <>
      <div style={{...styles.satellite, top: 18, left: '3%'}}>
        <div
          className="bal-bob"
          style={{
            animation: reduced
              ? undefined
              : 'bal-bob 7s ease-in-out infinite alternate',
            animationDelay: reduced ? undefined : '-2.4s',
          }}>
          <HStack gap={2} vAlign="center">
            <span style={{color: ACCENT, display: 'inline-flex'}}>
              <Icon icon={ActivityIcon} size="sm" color="inherit" />
            </span>
            <VStack gap={0}>
              <Text size="sm" weight="bold">
                9,214 readers
              </Text>
              <Text type="supporting" color="secondary">
                in early access
              </Text>
            </VStack>
          </HStack>
        </div>
      </div>
      <div style={{...styles.satellite, bottom: 56, left: '1%', maxWidth: 236}}>
        <div
          className="bal-bob"
          style={{
            animation: reduced
              ? undefined
              : 'bal-bob 8.5s ease-in-out infinite alternate',
            animationDelay: reduced ? undefined : '-5.1s',
          }}>
          <VStack gap={1}>
            <span style={styles.quoteGlyph} aria-hidden="true">
              <Icon icon={QuoteIcon} size="xsm" color="inherit" />
            </span>
            <Text size="sm" style={{lineHeight: 1.45}}>
              Worth the cover price.
            </Text>
            <Text type="supporting" color="secondary">
              Sofia Lindqvist · Fielder
            </Text>
          </VStack>
        </div>
      </div>
      <div style={{...styles.satellite, top: 108, right: '2%'}}>
        <div
          className="bal-bob"
          style={{
            animation: reduced
              ? undefined
              : 'bal-bob 6.2s ease-in-out infinite alternate',
            animationDelay: reduced ? undefined : '-3.7s',
          }}>
          <HStack gap={2} vAlign="center">
            <span style={{color: ACCENT, display: 'inline-flex'}}>
              <Icon icon={BookOpenIcon} size="sm" color="inherit" />
            </span>
            <Text size="sm" weight="semibold" style={{whiteSpace: 'nowrap'}}>
              312 pages · 88 diagrams
            </Text>
          </HStack>
        </div>
      </div>
    </>
  );

  const hero = (
    <div
      ref={heroBandRef}
      style={styles.heroBand}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {heroAurora}
      <div style={styles.grain} aria-hidden="true" />
      <div
        style={{
          ...column,
          paddingTop: isPhone ? 48 : 80,
          paddingBottom: isPhone ? 104 : 140,
        }}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <HStack gap={2} wrap="wrap">
              <Token
                label={`New from ${BOOK.publisher}`}
                size="sm"
                color="orange"
              />
              <Token label={BOOK.shipDate} size="sm" color="gray" />
            </HStack>
            <h1 style={{...styles.heroHeadline, fontSize: heroFontSize}}>
              The <span style={styles.heroInk}>Interface Layer</span>
            </h1>
            <p style={styles.heroSubcopy}>{BOOK.subtitle}</p>
            <Text size="sm" color="secondary">
              By {BOOK.author} · 312 pages · Hardcover, ebook, and bundle
            </Text>
            <HStack gap={2} wrap="wrap">
              <button
                type="button"
                className="bal-cta"
                style={styles.ctaPrimary}
                onClick={() => jumpToSection('sample')}>
                <Icon icon={BookOpenIcon} size="sm" color="inherit" />
                Read a sample
              </button>
              <button
                type="button"
                className="bal-cta"
                style={styles.ctaSecondary}
                onClick={() => jumpToSection('formats')}>
                See formats & pricing
                <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
              </button>
            </HStack>
            <VStack gap={2}>
              <Text type="supporting" color="secondary">
                Available at launch from
              </Text>
              <HStack gap={2} wrap="wrap">
                {RETAILERS.map(retailer => (
                  <button
                    key={retailer}
                    type="button"
                    className="bal-raise"
                    style={{
                      ...styles.retailerButton,
                      ...(isPhone ? {flex: '1 1 40%'} : null),
                    }}
                    onClick={() =>
                      fireToast(`Opening the ${retailer} listing (demo).`)
                    }>
                    {retailer}
                    <Icon icon={ExternalLinkIcon} size="xsm" color="inherit" />
                  </button>
                ))}
              </HStack>
            </VStack>
          </div>
          <div style={styles.coverStage}>
            <div style={styles.coverGlow} aria-hidden="true" />
            <div style={styles.coverParallax}>
              <BookCover reduced={reduced} width={isPhone ? 208 : 250} />
            </div>
            {satellites}
          </div>
        </div>
      </div>
    </div>
  );

  // ==== FLOATING STATS CARD (crosses the hero/sample boundary) ====

  const statsBand = (
    <div
      style={{
        ...column,
        ...styles.statsWrap,
        marginTop: isPhone ? -64 : -76,
      }}>
      <div ref={statsReveal.ref} style={styles.statsCard}>
        <Grid columns={{minWidth: isPhone ? 130 : 200, max: 4}} gap={4}>
          {STATS.map(stat => (
            <StatCell
              key={stat.id}
              stat={stat}
              isActive={statsReveal.isVisible}
              reduced={reduced}
              isPhone={isPhone}
            />
          ))}
        </Grid>
      </div>
    </div>
  );

  // ============= SAMPLE READER =============

  const currentPage = SAMPLE_PAGES[reader.page];
  const readerProgress = ((reader.page + 1) / SAMPLE_PAGES.length) * 100;

  const sampleSection = (
    <section
      ref={registerSection('sample')}
      aria-label="Read a sample"
      style={{...column, ...sectionPad}}>
      <Reveal reduced={reduced}>
        <VStack gap={6}>
          <SectionIntro
            eyebrow="Read a sample"
            title="Chapter 1 — The Seam"
            copy="Three pages from the opening chapter, exactly as they appear in the hardcover."
            compact={isCompact}
          />
          <div style={styles.readerFrame}>
            <div style={styles.readerChrome}>
              <Icon icon={BookOpenIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <Text size="sm" color="secondary">
                  {BOOK.title} · {currentPage.pageLabel}
                </Text>
              </StackItem>
              <Text size="sm" color="secondary">
                Sample edition
              </Text>
            </div>
            <div
              style={{
                ...styles.readerBody,
                ...(isPhone ? styles.readerBodyPhone : null),
              }}>
              <div
                key={currentPage.id}
                className="bal-page"
                style={{
                  animation:
                    reduced || reader.direction === null
                      ? 'none'
                      : `${
                          reader.direction === 'next'
                            ? 'bal-page-next'
                            : 'bal-page-prev'
                        } 280ms ease`,
                }}>
                {currentPage.heading !== null && (
                  <p style={styles.proseTitle}>{currentPage.heading}</p>
                )}
                <VStack gap={3}>
                  {currentPage.paragraphs.map(paragraph => (
                    <p key={paragraph.slice(0, 24)} style={styles.prose}>
                      {paragraph}
                    </p>
                  ))}
                </VStack>
              </div>
            </div>
            <div style={styles.readerControls}>
              <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
                <Button
                  label="Previous"
                  variant="secondary"
                  size="sm"
                  isDisabled={reader.page === 0}
                  icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
                  onClick={() => turnPage(-1)}
                />
                <Button
                  label="Next page"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
                  isDisabled={reader.page === SAMPLE_PAGES.length - 1}
                  onClick={() => turnPage(1)}
                />
                <div
                  style={styles.progressTrack}
                  role="progressbar"
                  aria-label="Sample progress"
                  aria-valuemin={1}
                  aria-valuemax={SAMPLE_PAGES.length}
                  aria-valuenow={reader.page + 1}>
                  <div
                    style={{...styles.progressFill, width: `${readerProgress}%`}}
                  />
                </div>
                <Text size="sm" color="secondary" style={{whiteSpace: 'nowrap'}}>
                  Page {reader.page + 1} of {SAMPLE_PAGES.length}
                </Text>
              </HStack>
            </div>
          </div>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= INSIDE THE BOOK (dot-grid band) =============

  const insideSection = (
    <div style={styles.insideBand}>
      <section
        ref={registerSection('inside')}
        aria-label="Inside the book"
        style={{...column, ...sectionPad}}>
        <VStack gap={6}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="Inside the book"
              title="What you'll learn"
              copy="Six working ideas, developed across twelve chapters and a field kit you can bring to Monday's review."
              compact={isCompact}
            />
          </Reveal>
          <Grid columns={{minWidth: 264, max: 3}} gap={3}>
            {LEARN_ITEMS.map((item, index) => (
              <Reveal key={item.id} reduced={reduced} delay={index * 70}>
                <Card
                  padding={4}
                  className="bal-raise"
                  style={styles.learnCard}>
                  <VStack gap={3}>
                    <div style={styles.learnGlyph} aria-hidden="true">
                      <Icon icon={item.icon} size="sm" color="inherit" />
                    </div>
                    <Text type="label">{item.title}</Text>
                    <Text size="sm" color="secondary">
                      {item.copy}
                    </Text>
                  </VStack>
                </Card>
              </Reveal>
            ))}
          </Grid>
          <Reveal reduced={reduced} delay={120}>
            <VStack gap={3} hAlign="center">
              <Button
                label={
                  isOutlineOpen
                    ? 'Hide the chapter outline'
                    : 'See the full chapter outline (12 chapters)'
                }
                variant="secondary"
                icon={
                  <Icon
                    icon={isOutlineOpen ? ChevronUpIcon : ChevronDownIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={() => setIsOutlineOpen(open => !open)}
              />
              {isOutlineOpen && (
                <VStack gap={2} style={{width: '100%', maxWidth: 760}}>
                  {CHAPTERS.map(chapter => (
                    <Card key={chapter.id} padding={2}>
                      <Collapsible
                        isOpen={openChapters.has(chapter.id)}
                        onOpenChange={isOpen =>
                          toggleChapter(chapter.id, isOpen)
                        }
                        trigger={
                          <HStack gap={2} vAlign="center">
                            <span style={styles.chapterNumber}>
                              {String(chapter.number).padStart(2, '0')}
                            </span>
                            <StackItem size="fill">
                              <Text size="sm" weight="semibold">
                                {chapter.title}
                              </Text>
                            </StackItem>
                            <Text
                              size="sm"
                              color="secondary"
                              style={{whiteSpace: 'nowrap'}}>
                              {chapter.pages} pp.
                            </Text>
                          </HStack>
                        }>
                        <Text size="sm" color="secondary">
                          {chapter.summary}
                        </Text>
                      </Collapsible>
                    </Card>
                  ))}
                  <Text type="supporting" color="secondary" justify="center">
                    276 chapter pages plus front matter, figure index, and the
                    printed field kit — 312 pages in all.
                  </Text>
                </VStack>
              )}
            </VStack>
          </Reveal>
        </VStack>
      </section>
    </div>
  );

  // ============= PRAISE =============

  const praiseSection = (
    <section
      ref={registerSection('praise')}
      aria-label="Praise for the book"
      style={{...column, ...sectionPad}}>
      <VStack gap={6}>
        <Reveal reduced={reduced}>
          <SectionIntro
            eyebrow="Praise"
            title="What early readers say"
            copy="From the 9,214 engineers and designers who read the early-access edition."
            compact={isCompact}
          />
        </Reveal>
        <Grid columns={{minWidth: 280, max: 3}} gap={3}>
          {PRAISE.map((entry, index) => (
            <Reveal key={entry.id} reduced={reduced} delay={index * 70}>
              <Card padding={4} className="bal-raise" style={styles.learnCard}>
                <VStack gap={3}>
                  <span style={styles.quoteGlyph} aria-hidden="true">
                    <Icon icon={QuoteIcon} size="sm" color="inherit" />
                  </span>
                  <Text size="sm" style={{lineHeight: 1.6}}>
                    {entry.quote}
                  </Text>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {entry.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {entry.role}
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </VStack>
    </section>
  );

  // ============= AUTHOR =============

  const authorSection = (
    <div style={styles.authorBand}>
      <section
        ref={registerSection('author')}
        aria-label="About the author"
        style={{...column, ...sectionPad}}>
        <Reveal reduced={reduced}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-7, 40px)',
              alignItems: isCompact ? 'center' : 'flex-start',
              flexDirection: isCompact ? 'column' : 'row',
            }}>
            <div style={styles.portraitTile} aria-hidden="true">
              {AUTHOR.initials}
            </div>
            <VStack gap={3} hAlign={isCompact ? 'center' : 'start'}>
              <SectionIntro
                eyebrow="About the author"
                title={AUTHOR.name}
                align={isCompact ? 'center' : 'start'}
                compact={isCompact}
              />
              <Text
                size="sm"
                color="secondary"
                style={{lineHeight: 1.65, maxWidth: 640}}
                justify={isCompact ? 'center' : 'start'}>
                {AUTHOR.bio1}
              </Text>
              <Text
                size="sm"
                color="secondary"
                style={{lineHeight: 1.65, maxWidth: 640}}
                justify={isCompact ? 'center' : 'start'}>
                {AUTHOR.bio2}
              </Text>
              <HStack gap={2} wrap="wrap">
                {AUTHOR.chips.map(chip => (
                  <Token
                    key={chip.id}
                    label={chip.label}
                    size="sm"
                    color="gray"
                    icon={<Icon icon={chip.icon} size="xsm" color="inherit" />}
                  />
                ))}
              </HStack>
            </VStack>
          </div>
        </Reveal>
      </section>
    </div>
  );

  // ============= FORMATS (second aurora field) =============

  const formatsSection = (
    <div style={styles.formatsBand}>
      <div style={styles.auroraLayer} aria-hidden="true">
        <div
          className="bal-aurora"
          style={{
            ...styles.auroraBlob,
            width: 460,
            height: 460,
            top: -180,
            right: -140,
            background: AURORA_B,
            opacity: 0.4,
            animation: reduced
              ? undefined
              : 'bal-aurora-b 42s ease-in-out infinite alternate',
          }}
        />
        <div
          className="bal-aurora"
          style={{
            ...styles.auroraBlob,
            width: 400,
            height: 400,
            bottom: -160,
            left: -120,
            background: AURORA_A,
            opacity: 0.35,
            animation: reduced
              ? undefined
              : 'bal-aurora-a 36s ease-in-out infinite alternate',
            animationDelay: reduced ? undefined : '-16s',
          }}
        />
      </div>
      <section
        ref={registerSection('formats')}
        aria-label="Formats and pricing"
        style={{...column, ...sectionPad, position: 'relative', zIndex: 1}}>
        <VStack gap={6}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="Get the book"
              title="Choose your format"
              copy={LAUNCH_NOTE}
              compact={isCompact}
            />
          </Reveal>
          <Grid columns={{minWidth: 264, max: 3}} gap={3}>
            {FORMATS.map((format, index) => (
              <Reveal key={format.id} reduced={reduced} delay={index * 90}>
                <Card
                  padding={5}
                  className={format.isHighlighted ? undefined : 'bal-raise'}
                  style={
                    format.isHighlighted
                      ? {
                          ...styles.formatCard,
                          ...styles.formatCardHighlighted,
                          transform: isCompact ? undefined : 'translateY(-10px)',
                        }
                      : styles.formatCard
                  }>
                  <VStack gap={3}>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Text type="label">{format.name}</Text>
                      {format.savingsNote !== undefined && (
                        <Badge variant="orange" label={format.savingsNote} />
                      )}
                    </HStack>
                    <span style={styles.formatPrice}>${format.price}</span>
                    <Text size="sm" color="secondary">
                      {format.tagline}
                    </Text>
                    <VStack gap={2}>
                      {format.features.map(feature => (
                        <CheckRow key={feature} label={feature} />
                      ))}
                    </VStack>
                    {format.isHighlighted && (
                      <div style={styles.bonusList}>
                        <HStack gap={2} vAlign="center">
                          <Icon icon={SparklesIcon} size="sm" color="inherit" />
                          <Text size="sm" weight="semibold">
                            Launch-week bonuses
                          </Text>
                        </HStack>
                        {LAUNCH_BONUSES.map(bonus => (
                          <Text key={bonus} size="sm" color="secondary">
                            {bonus}
                          </Text>
                        ))}
                      </div>
                    )}
                    <Button
                      label={format.cta}
                      variant={format.isHighlighted ? 'primary' : 'secondary'}
                      onClick={() =>
                        fireToast(
                          `Checkout — ${format.name} ($${format.price}) added (demo).`,
                        )
                      }
                    />
                  </VStack>
                </Card>
              </Reveal>
            ))}
          </Grid>
        </VStack>
      </section>
    </div>
  );

  // ============= NEWSLETTER (signature dark band) =============

  const newsletterBand = (
    <div
      ref={newsletterRef}
      style={styles.newsletterBand}
      onPointerMove={onNewsletterPointerMove}>
      <div style={styles.spotlight} aria-hidden="true" />
      <div style={styles.grain} aria-hidden="true" />
      <div style={{...column, ...sectionPad, position: 'relative', zIndex: 2}}>
        <div
          style={{
            ...styles.glassCard,
            ...(isPhone ? styles.glassCardPhone : null),
          }}>
          <Reveal reduced={reduced}>
            <VStack gap={4} hAlign="center">
              <Heading
                level={2}
                style={{
                  ...styles.sectionHeading,
                  fontSize: isCompact ? 30 : 38,
                  color: DARK_TEXT,
                }}>
                {NEWSLETTER.heading}
              </Heading>
              <Text
                size="sm"
                color="inherit"
                justify="center"
                style={{color: DARK_TEXT_SOFT, maxWidth: 520, lineHeight: 1.6}}>
                {NEWSLETTER.copy}
              </Text>
              {confirmedEmail === null ? (
                <VStack gap={2} hAlign="center" style={{width: '100%'}}>
                  <div
                    style={{
                      ...styles.emailRow,
                      ...(isPhone ? styles.emailRowStacked : null),
                      marginInline: 'auto',
                    }}>
                    <div style={styles.emailInput}>
                      <TextInput
                        label="Email address"
                        isLabelHidden
                        type="email"
                        value={email}
                        placeholder="you@example.com"
                        width="100%"
                        onChange={value => {
                          setEmail(value);
                          if (emailError !== null) {
                            setEmailError(null);
                          }
                        }}
                        onEnter={submitNewsletter}
                      />
                    </div>
                    <Button
                      label="Send me Chapter 1"
                      variant="primary"
                      icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                      onClick={submitNewsletter}
                    />
                  </div>
                  {emailError !== null && (
                    <p style={styles.emailError} role="alert">
                      {emailError}
                    </p>
                  )}
                </VStack>
              ) : (
                <HStack gap={3} vAlign="center" wrap="wrap" hAlign="center">
                  <div style={styles.successDisc} aria-hidden="true">
                    <Icon icon={MailCheckIcon} size="sm" color="inherit" />
                  </div>
                  <VStack gap={0} hAlign="start">
                    <Text weight="semibold" color="inherit">
                      Chapter 1 is on its way to {confirmedEmail}
                    </Text>
                    <Text
                      type="supporting"
                      color="inherit"
                      style={{color: DARK_TEXT_FAINT}}>
                      Check your inbox in the next few minutes.
                    </Text>
                  </VStack>
                  <Button
                    label="Use a different email"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmedEmail(null)}
                  />
                </HStack>
              )}
            </VStack>
          </Reveal>
        </div>
      </div>
    </div>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer} aria-label="Site footer">
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerPhone : null),
        }}>
        <HStack gap={4} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <div style={styles.brandTile} aria-hidden="true">
                  <Icon icon={LayersIcon} size="sm" color="inherit" />
                </div>
                <Text type="label" color="inherit">
                  {BOOK.title}
                </Text>
              </HStack>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_FAINT, maxWidth: 380}}>
                A {BOOK.publisher} book by {BOOK.author}. {BOOK.shipDate}.
              </Text>
            </VStack>
          </StackItem>
          <VStack gap={1}>
            <Text
              size="sm"
              weight="semibold"
              color="inherit"
              style={{color: DARK_TEXT_SOFT}}>
              The book
            </Text>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => jumpToSection('sample')}>
              Read a sample
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => jumpToSection('inside')}>
              Chapter outline
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => jumpToSection('formats')}>
              Formats & pricing
            </button>
          </VStack>
          <VStack gap={1}>
            <Text
              size="sm"
              weight="semibold"
              color="inherit"
              style={{color: DARK_TEXT_SOFT}}>
              Elsewhere
            </Text>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast('Opening the Seams newsletter (demo).')}>
              Seams newsletter
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast('Opening the press kit (demo).')}>
              Press kit
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast('Opening speaking inquiries (demo).')}>
              Speaking inquiries
            </button>
          </VStack>
        </HStack>
        <Divider />
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <span style={styles.isbnRow}>
              {BOOK.isbn} · {BOOK.publisher} · {BOOK.edition}
            </span>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            © 2026 {AUTHOR.name}. All rights reserved.
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <style>{MOTION_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Book launch page">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {hero}
              {statsBand}
              {sampleSection}
              {insideSection}
              {praiseSection}
              {authorSection}
              {formatsSection}
              {newsletterBand}
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
    </div>
  );
}
