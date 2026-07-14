// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file conference-event-landing.tsx
 * @input Deterministic fixtures only (the fictional "Interface 2026" two-day
 *   dev conference in Lisbon: a countdown seeded at 86d 04:12:33, eight
 *   speakers with roles and talk titles, a two-day / three-track agenda of
 *   timed slots, three ticket tiers with seat counts (Early bird sold out,
 *   Regular featured, Team pack), venue address plus four travel notes, a
 *   three-tier sponsor wall of invented companies, past-edition stats and a
 *   five-tile photo collage, and footer link groups)
 * @output Full conference landing page, art-directed: a scroll-aware navbar
 *   (transparent at top, tinted blur surface + hairline after 24px), a
 *   product-theater hero — aurora field + grain, 76px gradient-ink headline,
 *   live ticking countdown, and a perspective-staged attendee-pass mock with
 *   three bobbing satellite cards that parallax toward the pointer — a
 *   stagger-revealed speaker grid with hover raise + accent glow, a Day 1 /
 *   Day 2 TabList agenda over a dot-grid band (three track columns collapse
 *   to per-track accordions when compact), ticket tiers with seats-left
 *   ProgressBar meters, a raised featured card, and an inline validating
 *   reserve-by-email flow, a pinned scroll-story venue scene (sticky
 *   schematic map whose tram line draws with scroll progress while four
 *   clickable travel steps light up), a tiered sponsor wall whose community
 *   tier loops as a marquee, a scheme-locked dark past-edition band with
 *   pointer spotlight, glass stat cards, count-ups and a photo collage, a
 *   floating newsletter card that overlaps the footer, and a sitemap footer.
 * @position Page template; emitted by `astryx template conference-event-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container; the navbar is position:sticky top:0 inside it,
 * full-bleed atmospheric bands alternate with plain bands, and each band
 * centers a 1120px content column. The compact nav dropdown drops absolutely
 * from the sticky navbar; the Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - Nav anchors (Speakers / Agenda / Tickets / Venue / Sponsors) and both
 *   hero CTAs smooth-scroll the container to real section ids with a
 *   sticky-nav allowance; the compact menu closes on Escape, outside
 *   pointerdown, or any selection.
 * - The hero countdown starts from the fixture 86d 04:12:33 and ticks down
 *   once per second via setInterval (no Date.now()); it keeps ticking under
 *   reduced motion because it is a clock, not decoration.
 * - Agenda Day 1 / Day 2 is a controlled TabList; wide widths render a
 *   time × 3-track table (shared slots span all tracks), compact widths
 *   render one Collapsible accordion per track plus an "Everyone" group.
 * - Live ticket CTAs open an inline reserve card (email regex validation
 *   with inline error text; success swaps to a confirmation echoing the
 *   address with a reset link). The Early bird tier is sold out: price
 *   struck through, meter full, button disabled.
 * - The venue scroll story pins a schematic map for ~840px of scroll; the
 *   four travel steps are ALSO buttons (keyboard path) that scroll the
 *   container to the matching progress point. At compact widths or under
 *   reduced motion it renders as a static stacked sequence whose step
 *   buttons switch the map highlight directly.
 * - The newsletter form repeats the same validate/confirm contract
 *   independently. Footer links that would leave the page fire a corner
 *   Toast so the wiring is provable.
 *
 * Motion policy (all gated by prefers-reduced-motion via matchMedia, plus a
 * scoped stylesheet `@media (prefers-reduced-motion: reduce)` block for the
 * CSS-driven pieces; transform/opacity/stroke-dashoffset only):
 * - Aurora blobs drift on 38-44s alternating keyframes; static when reduced.
 * - Hero satellites bob on 6.2-8.4s keyframes with negative delays and
 *   parallax ±8-10px toward the pointer (CSS vars set from onPointerMove;
 *   off under reduced motion and at stacked/touch widths).
 * - Section reveals: IntersectionObserver, fire once, 16px rise + 0.985
 *   scale, 600ms decelerate bezier; grids stagger children 70ms. Reduced
 *   motion renders everything visible immediately.
 * - Past-edition stats count up ~900ms decelerate on first view; reduced
 *   motion renders the final numbers. The countdown tick is exempt
 *   (informative). Marquee is 48s linear, pauses on hover, and renders as a
 *   static wrapped grid under reduced motion.
 *
 * Color policy: token-pure except ONE quarantined brand accent literal
 * (see ACCENT below, with contrast math). Every glow, aurora blob, gradient
 * ink, and glass surface derives from that literal or from design tokens
 * via color-mix(); the dark past-edition band is scheme-locked with
 * colorScheme:'dark' so the SAME tokens resolve to their dark values in
 * both themes (no second literal). Shadow tiers use the standard
 * rgba(0,0,0) depth recipe; grain is a monochrome feTurbulence data-URI at
 * 4% opacity.
 *
 * Responsive contract (measured with a local ResizeObserver, NOT viewport
 * media queries — the inline demo stage is ~1045px inside a 1440px window):
 * - Content column: max-width 1120px, centered; atmospheric bands paint
 *   full-bleed behind it.
 * - >1020px: hero headline 76px; >980px hero splits copy | pass theater.
 * - <=980px: hero stacks and parallax turns off (touch widths).
 * - >860px: agenda renders the time × 3-track grid; speaker/tier/sponsor
 *   grids sit at their widest (Grid minWidth handles 4→3→2→1 drops).
 * - <=860px: agenda collapses to per-track accordions.
 * - <=780px: nav links collapse behind a menu button + dropdown panel; the
 *   venue story un-pins to a static stacked sequence; band padding drops
 *   112px → 64px.
 * - <=480px (phone artboard is a real 390px iframe): headline and countdown
 *   cells step down, satellite offsets pull inside the column, email forms
 *   stack the button under the input, stat tiles drop to 2-up, and action
 *   rows wrap — the page holds at 390px with no overflow-x.
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
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {
  ArrowRightIcon,
  BikeIcon,
  CalendarDaysIcon,
  CheckIcon,
  HotelIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  MicIcon,
  PlaneIcon,
  SparklesIcon,
  TicketIcon,
  TrainFrontIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= BRAND ACCENT (quarantined literal) =============
// The ONE allowed accent literal for the Interface 2026 brand (electric
// fuchsia). Contrast math: light #A21CAF has relative luminance 0.116 →
// 6.3:1 against white (passes AA for text and UI); dark #F0ABFC has
// luminance 0.547 → 9.6:1 against a #1B1B1F-class dark body. Every other
// color on the page is a design token or a color-mix() of this literal.
const ACCENT = 'light-dark(#A21CAF, #F0ABFC)';

/** Accent tint at N% opacity — keeps all brand art on the single literal. */
function accentMix(percent: number): string {
  return `color-mix(in srgb, ${ACCENT} ${percent}%, transparent)`;
}

// Aurora bloom hues: the accent bent toward the blue and green TOKEN ramps
// (no new literals — both arms are token-derived color-mixes).
const BLOOM_COOL = `color-mix(in srgb, ${ACCENT} 55%, var(--color-text-blue, var(--color-accent)))`;
const BLOOM_WARM = `color-mix(in srgb, ${ACCENT} 62%, var(--color-success, var(--color-accent)))`;

// ============= DEPTH SYSTEM (shadow tiers) =============
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING = `${SHADOW_RAISED}, 0 24px 48px -24px rgba(0, 0, 0, 0.3)`;
const GLASS_INSET =
  'inset 0 0 0 1px color-mix(in srgb, var(--color-border) 85%, transparent)';

/** Sticky-nav height; smooth-scroll and the pinned story allow for it. */
const NAV_ALLOWANCE = 72;
/** Extra scroll length the pinned venue story consumes (px, not vh — the
 * demo stage is an inline scrollport, so viewport units would lie). */
const STORY_SCROLL = 840;
/** Sticky offset of the story stage below the navbar. */
const STORY_STAGE_TOP = NAV_ALLOWANCE + 12;

// Grain texture: monochrome feTurbulence tile at 4% opacity (see Color
// policy) — reads as paper in light mode and as film grain in dark mode.
const GRAIN_URI =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'180\' height=\'180\'%3E%3Cfilter id=\'g\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'180\' height=\'180\' filter=\'url(%23g)\'/%3E%3C/svg%3E")';

// Scoped stylesheet: aurora drift, satellite bob, the sponsor marquee,
// button sheen sweeps, and card hover-raise need keyframes and
// pseudo-classes that inline styles can't express. Everything is
// transform/opacity-only and fully disabled under reduced motion.
const SCOPE = 'cel-root';

const TEMPLATE_CSS = `
@keyframes cel-aurora-a {
  from { transform: translate3d(-6%, -4%, 0) scale(1); }
  to { transform: translate3d(7%, 6%, 0) scale(1.16); }
}
@keyframes cel-aurora-b {
  from { transform: translate3d(5%, 3%, 0) scale(1.08); }
  to { transform: translate3d(-6%, -5%, 0) scale(0.94); }
}
@keyframes cel-bob {
  from { transform: translateY(-5px); }
  to { transform: translateY(6px); }
}
@keyframes cel-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.${SCOPE} .cel-aurora { animation: cel-aurora-a 38s ease-in-out infinite alternate; }
.${SCOPE} .cel-aurora-alt { animation: cel-aurora-b 44s ease-in-out infinite alternate; }
.${SCOPE} .cel-bob { animation: cel-bob 7.2s ease-in-out -2.4s infinite alternate; }
.${SCOPE} .cel-bob-2 { animation-duration: 8.4s; animation-delay: -5.1s; }
.${SCOPE} .cel-bob-3 { animation-duration: 6.2s; animation-delay: -1.6s; }
.${SCOPE} .cel-marquee-track {
  display: flex;
  width: max-content;
  gap: var(--spacing-2);
  animation: cel-marquee 48s linear infinite;
}
.${SCOPE} .cel-marquee:hover .cel-marquee-track { animation-play-state: paused; }
.${SCOPE} .cel-btn {
  position: relative;
  display: inline-flex;
  border-radius: 10px;
  isolation: isolate;
  transition: transform 0.18s ease;
}
.${SCOPE} .cel-btn:hover { transform: translateY(-1px); }
.${SCOPE} .cel-btn:active { transform: translateY(0) scale(0.98); }
.${SCOPE} .cel-btn .cel-sheen {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  border-radius: 10px;
  overflow: hidden;
}
.${SCOPE} .cel-btn .cel-sheen::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 55%;
  background: linear-gradient(105deg, transparent, color-mix(in srgb, var(--color-background-body) 55%, transparent) 50%, transparent);
  transform: translateX(-60%) skewX(-18deg);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.${SCOPE} .cel-btn:hover .cel-sheen::before { transform: translateX(340%) skewX(-18deg); }
.${SCOPE} .cel-raise { transition: transform 0.22s ease, box-shadow 0.22s ease; }
.${SCOPE} .cel-raise:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 0 1px ${accentMix(45)}, ${SHADOW_FLOATING};
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .cel-aurora,
  .${SCOPE} .cel-aurora-alt,
  .${SCOPE} .cel-bob,
  .${SCOPE} .cel-marquee-track { animation: none; }
  .${SCOPE} .cel-btn,
  .${SCOPE} .cel-btn .cel-sheen::before,
  .${SCOPE} .cel-raise { transition: none; }
  .${SCOPE} .cel-btn:hover,
  .${SCOPE} .cel-btn:active,
  .${SCOPE} .cel-raise:hover { transform: none; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: hosts the sticky navbar and owns anchor scrolling.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered content column used inside every full-bleed band.
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
  // Layout rhythm: 112px section breath at wide, 64px compact.
  band: {
    position: 'relative',
    paddingBlock: 112,
  },
  bandCompact: {
    paddingBlock: 64,
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
  },
  // Dot-grid texture band (agenda) — hairline dots from the border token.
  bandDots: {
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-border) 75%, transparent) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  },
  // ---- atmosphere layers ----
  auroraField: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URI,
    backgroundSize: '180px 180px',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  // ---- sticky navbar (transparent → tinted blur after 24px) ----
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
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(14px) saturate(1.3)',
    WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
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
    transition: 'min-height 0.25s ease',
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
    borderRadius: 10,
    background: `linear-gradient(135deg, ${ACCENT}, ${accentMix(55)})`,
    color: 'var(--color-background-body)',
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
  // 40px icon-only button (Astryx Button caps at 36px tap height).
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
  // Dropdown panel behind the compact-nav menu button.
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
  // ---- hero (product theater) ----
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: accentMix(6),
  },
  heroSplit: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-8)',
    paddingBlock: 96,
  },
  heroSplitStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-7)',
    paddingBlock: 64,
  },
  heroCopy: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    gap: 'var(--spacing-5)',
  },
  heroCopyStacked: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heroHeadline: {
    fontWeight: 750,
    lineHeight: 1.03,
    letterSpacing: '-0.028em',
    margin: 0,
    maxWidth: 680,
  },
  // Gradient ink on the hero key phrase (accent → cool bloom → accent).
  heroInk: {
    backgroundImage: `linear-gradient(94deg, ${ACCENT} 5%, ${BLOOM_COOL} 55%, ${ACCENT} 100%)`,
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
  // ---- countdown ----
  countdownRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  countdownCell: {
    minWidth: 78,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 12,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 80%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    boxSizing: 'border-box',
  },
  countdownCellPhone: {
    minWidth: 64,
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  countdownNumber: {
    fontSize: 30,
    fontWeight: 750,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  countdownNumberPhone: {
    fontSize: 22,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // ---- hero pass theater ----
  theaterStage: {
    position: 'relative',
    flex: '0 0 400px',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    perspective: 1200,
  },
  theaterStageStacked: {
    flex: '0 0 auto',
    width: '100%',
    paddingBlock: 'var(--spacing-4)',
  },
  theaterRings: {
    position: 'absolute',
    inset: -40,
    width: 'calc(100% + 80px)',
    height: 'calc(100% + 80px)',
    pointerEvents: 'none',
  },
  passParallax: {
    position: 'relative',
    transform:
      'rotateZ(-2deg) rotateY(calc(var(--cel-px, 0) * 5deg)) rotateX(calc(var(--cel-py, 0) * -4deg))',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  passCard: {
    position: 'relative',
    width: 316,
    maxWidth: '100%',
    borderRadius: 20,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_FLOATING}`,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  passHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    backgroundImage: `linear-gradient(120deg, ${accentMix(30)}, ${accentMix(8)} 70%)`,
  },
  passBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  passMonogram: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 800,
    color: ACCENT,
    backgroundColor: accentMix(12),
    boxShadow: `inset 0 0 0 1px ${accentMix(35)}`,
  },
  passRule: {
    height: 1,
    backgroundImage:
      'repeating-linear-gradient(90deg, var(--color-border) 0 6px, transparent 6px 12px)',
  },
  passFoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Satellite mini-cards: glass chips orbiting the pass.
  satellite: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 14,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_FLOATING}`,
    padding: 'var(--spacing-2) var(--spacing-3)',
    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  meterTrack: {
    width: 128,
    height: 5,
    borderRadius: 999,
    backgroundColor: accentMix(15),
    overflow: 'hidden',
  },
  meterFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: ACCENT,
    transformOrigin: 'left center',
    transform: 'scaleX(0.77)',
  },
  clusterDisc: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
    color: ACCENT,
    backgroundColor: 'var(--color-background-body)',
    boxShadow: `inset 0 0 0 1.5px ${accentMix(40)}`,
  },
  // ---- section intros ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    paddingInline: 10,
    paddingBlock: 4,
    borderRadius: 999,
    backgroundColor: accentMix(9),
    boxShadow: `inset 0 0 0 1px ${accentMix(25)}`,
  },
  sectionTitle: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.022em',
    margin: 0,
  },
  sectionTitleCompact: {
    fontSize: 30,
  },
  // ---- speakers ----
  speakerCard: {
    borderRadius: 16,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  speakerArt: {
    height: 92,
    display: 'flex',
    alignItems: 'flex-end',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  speakerArtKeynote: {
    height: 116,
  },
  speakerMonogram: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 800,
    color: ACCENT,
    backgroundColor: 'var(--color-background-body)',
    border: `1px solid ${accentMix(35)}`,
    boxShadow: SHADOW_RAISED,
  },
  speakerBody: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  // ---- agenda ----
  agendaGrid: {
    display: 'grid',
    gridTemplateColumns: '84px repeat(3, 1fr)',
    gap: 'var(--spacing-2)',
    alignItems: 'stretch',
  },
  agendaTime: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    paddingTop: 10,
  },
  agendaCell: {
    borderRadius: 10,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: GLASS_INSET,
    padding: 'var(--spacing-2) var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    boxSizing: 'border-box',
  },
  agendaShared: {
    gridColumn: '2 / -1',
    backgroundColor: accentMix(8),
    boxShadow: `inset 0 0 0 1px ${accentMix(25)}`,
  },
  // ---- tickets ----
  tierWrap: {
    borderRadius: 'var(--radius-container, 16px)',
    boxShadow: SHADOW_RAISED,
    height: '100%',
    boxSizing: 'border-box',
  },
  tierWrapFeatured: {
    boxShadow: `0 0 0 1px ${ACCENT}, ${SHADOW_FLOATING}`,
  },
  tierPrice: {
    fontSize: 36,
    fontWeight: 750,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  tierPriceStruck: {
    textDecoration: 'line-through',
    color: 'var(--color-text-secondary)',
  },
  checkGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  // ---- venue scroll story ----
  storyStage: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
  },
  storyStageStacked: {
    flexDirection: 'column',
  },
  storyRail: {
    position: 'relative',
    flex: '0 0 340px',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    paddingLeft: 22,
  },
  storyRailStacked: {
    flex: '1 1 auto',
  },
  railTrack: {
    position: 'absolute',
    left: 6,
    top: 10,
    bottom: 10,
    width: 2,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
  },
  railFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    backgroundColor: ACCENT,
    transformOrigin: 'top center',
    transition: 'transform 0.2s linear',
  },
  stepButton: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 14,
    padding: 'var(--spacing-3)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
  },
  stepButtonActive: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 85%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
  },
  stepIndex: {
    fontSize: 24,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-disabled, var(--color-text-secondary))',
    transition: 'color 0.25s ease',
    minWidth: 30,
  },
  stepIndexActive: {
    color: ACCENT,
  },
  mapFrame: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 16,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_FLOATING}`,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
  },
  travelGlyph: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: accentMix(12),
    color: ACCENT,
  },
  // ---- sponsors ----
  sponsorTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 12,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
    paddingInline: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  sponsorMonogram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontWeight: 800,
    color: ACCENT,
    backgroundColor: accentMix(12),
    flexShrink: 0,
  },
  marquee: {
    overflow: 'hidden',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    maskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
  },
  // ---- past edition (scheme-locked dark band) ----
  darkBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `radial-gradient(560px circle at var(--cel-mx, 70%) var(--cel-my, 20%), ${accentMix(14)}, transparent 65%)`,
  },
  glassCard: {
    borderRadius: 16,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 55%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    height: '100%',
  },
  statNumber: {
    fontSize: 44,
    fontWeight: 750,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
  },
  statNumberPhone: {
    fontSize: 30,
  },
  collageTile: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: GLASS_INSET,
    minHeight: 120,
    display: 'flex',
    alignItems: 'flex-end',
    backgroundColor: 'var(--color-background-muted)',
  },
  collageCaption: {
    margin: 'var(--spacing-2)',
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 82%, transparent)',
    boxShadow: GLASS_INSET,
  },
  // ---- forms ----
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
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
    backgroundColor: accentMix(14),
    color: ACCENT,
  },
  // ---- newsletter (floating card that crosses into the footer) ----
  newsBand: {
    position: 'relative',
    zIndex: 2,
    paddingTop: 112,
    paddingBottom: 0,
  },
  newsBandCompact: {
    paddingTop: 64,
  },
  newsCardWrap: {
    borderRadius: 'var(--radius-container, 16px)',
    boxShadow: SHADOW_FLOATING,
    backgroundColor: 'var(--color-background-card)',
    marginBottom: -76,
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
  mono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
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
// Deterministic fixtures for the fictional Interface 2026 conference.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Interface',
  year: '2026',
  dates: 'Oct 8–9, 2026',
  city: 'Lisbon, Portugal',
  venueShort: 'Pátio da Luz, Belém',
};

/** Countdown fixture: 86d 04:12:33 until doors, ticked by setInterval. */
const COUNTDOWN_START_SECONDS = 86 * 86400 + 4 * 3600 + 12 * 60 + 33;

type SectionId = 'speakers' | 'agenda' | 'tickets' | 'venue' | 'sponsors';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'speakers', label: 'Speakers'},
  {id: 'agenda', label: 'Agenda'},
  {id: 'tickets', label: 'Tickets'},
  {id: 'venue', label: 'Venue'},
  {id: 'sponsors', label: 'Sponsors'},
];

/** Hero pass mock fixture (invented attendee; deterministic). */
const PASS = {
  holder: 'Rita Carvalho',
  initials: 'RC',
  role: 'Product Engineer · Porto',
  tier: 'Regular · both days + workshops',
  code: 'LIS-2026-0463',
};

/** Deterministic 9×9 QR-ish schematic pattern for the pass (no random). */
const QR_CELLS: readonly boolean[] = Array.from(
  {length: 81},
  (_, index) => ((index * 7 + 3) % 11) % 3 === 0,
);

interface Speaker {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  talk: string;
  isKeynote?: boolean;
  /** Gradient recipe for the card art — angle + two accent-mix strengths. */
  angle: number;
  mixA: number;
  mixB: number;
}

const SPEAKERS: readonly Speaker[] = [
  {
    id: 'voss',
    name: 'Mara Voss',
    initials: 'MV',
    role: 'Principal Engineer',
    company: 'Fjord Systems',
    talk: 'Opening keynote — The interface is the product',
    isKeynote: true,
    angle: 135,
    mixA: 38,
    mixB: 10,
  },
  {
    id: 'ferreira',
    name: 'Diego Ferreira',
    initials: 'DF',
    role: 'CTO',
    company: 'Saltpan',
    talk: 'Local-first sync, two years in production',
    angle: 160,
    mixA: 30,
    mixB: 8,
  },
  {
    id: 'raman',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Staff Engineer',
    company: 'Loomworks',
    talk: 'Profiling the paint pipeline',
    angle: 110,
    mixA: 26,
    mixB: 12,
  },
  {
    id: 'lindqvist',
    name: 'Tove Lindqvist',
    initials: 'TL',
    role: 'Accessibility Lead',
    company: 'Brightline',
    talk: 'Motion without motion sickness',
    angle: 145,
    mixA: 34,
    mixB: 6,
  },
  {
    id: 'diallo',
    name: 'Amara Diallo',
    initials: 'AD',
    role: 'Founding Engineer',
    company: 'Quill & Co',
    talk: 'Typography is an API',
    angle: 120,
    mixA: 22,
    mixB: 10,
  },
  {
    id: 'mori',
    name: 'Kenji Mori',
    initials: 'KM',
    role: 'Platform Lead',
    company: 'Orbital',
    talk: 'Rendering at the edge, 12 regions deep',
    angle: 155,
    mixA: 28,
    mixB: 14,
  },
  {
    id: 'almeida',
    name: 'Sofia Almeida',
    initials: 'SA',
    role: 'Head of Design',
    company: 'Ondagrid',
    talk: 'Prototypes that survive contact with users',
    angle: 100,
    mixA: 32,
    mixB: 8,
  },
  {
    id: 'beck',
    name: 'Jonas Beck',
    initials: 'JB',
    role: 'Design Engineer',
    company: 'Tessel',
    talk: 'Closing keynote — Design tokens at 60fps',
    isKeynote: true,
    angle: 140,
    mixA: 40,
    mixB: 12,
  },
];

interface Track {
  id: string;
  name: string;
  color: TokenColor;
}

const TRACKS: readonly Track[] = [
  {id: 'main', name: 'Main Stage', color: 'purple'},
  {id: 'systems', name: 'Systems', color: 'teal'},
  {id: 'workshops', name: 'Workshops', color: 'orange'},
];

interface AgendaSession {
  title: string;
  speaker?: string;
}

interface AgendaSlot {
  id: string;
  time: string;
  /** Present on all-attendee moments (keynotes, breaks, socials). */
  shared?: AgendaSession;
  /** Present on parallel slots — one session per track, TRACKS order. */
  tracks?: readonly [AgendaSession, AgendaSession, AgendaSession];
}

interface AgendaDay {
  id: 'day1' | 'day2';
  label: string;
  slots: readonly AgendaSlot[];
}

const AGENDA: readonly AgendaDay[] = [
  {
    id: 'day1',
    label: 'Day 1 · Wed Oct 8',
    slots: [
      {
        id: 'd1-doors',
        time: '08:30',
        shared: {title: 'Registration, coffee & pastéis de nata'},
      },
      {
        id: 'd1-keynote',
        time: '09:30',
        shared: {
          title: 'Opening keynote — The interface is the product',
          speaker: 'Mara Voss',
        },
      },
      {
        id: 'd1-am',
        time: '10:45',
        tracks: [
          {
            title: 'Prototypes that survive contact with users',
            speaker: 'Sofia Almeida',
          },
          {title: 'Profiling the paint pipeline', speaker: 'Priya Raman'},
          {
            title: 'Hands-on: interaction audits in 90 minutes',
            speaker: 'Tove Lindqvist',
          },
        ],
      },
      {
        id: 'd1-lunch',
        time: '12:15',
        shared: {title: 'Lunch — rooftop terrace'},
      },
      {
        id: 'd1-pm1',
        time: '13:30',
        tracks: [
          {title: 'Typography is an API', speaker: 'Amara Diallo'},
          {
            title: 'Local-first sync, two years in production',
            speaker: 'Diego Ferreira',
          },
          {title: 'Build a token pipeline, end to end', speaker: 'Jonas Beck'},
        ],
      },
      {
        id: 'd1-pm2',
        time: '15:15',
        tracks: [
          {
            title: 'Panel — Small teams, sharp tools',
            speaker: 'Almeida · Diallo · Ferreira',
          },
          {
            title: 'Rendering at the edge, 12 regions deep',
            speaker: 'Kenji Mori',
          },
          {title: 'Speaker office hours (drop in)'},
        ],
      },
      {
        id: 'd1-lightning',
        time: '17:00',
        shared: {title: 'Lightning talks — six talks, five minutes each'},
      },
      {
        id: 'd1-social',
        time: '18:30',
        shared: {title: 'Sunset social — Miradouro de Santa Catarina'},
      },
    ],
  },
  {
    id: 'day2',
    label: 'Day 2 · Thu Oct 9',
    slots: [
      {id: 'd2-doors', time: '09:00', shared: {title: 'Doors & coffee'}},
      {
        id: 'd2-am1',
        time: '09:45',
        tracks: [
          {title: 'Motion without motion sickness', speaker: 'Tove Lindqvist'},
          {
            title: 'Streaming UI over unreliable networks',
            speaker: 'Diego Ferreira',
          },
          {
            title: 'Hands-on: performance profiling clinic',
            speaker: 'Priya Raman',
          },
        ],
      },
      {
        id: 'd2-am2',
        time: '11:30',
        tracks: [
          {title: 'Interfaces for agents and humans', speaker: 'Kenji Mori'},
          {title: 'Undo as an architecture', speaker: 'Amara Diallo'},
          {
            title: 'Design–engineering pairing lab',
            speaker: 'Sofia Almeida',
          },
        ],
      },
      {
        id: 'd2-lunch',
        time: '13:00',
        shared: {title: 'Lunch — food-truck yard'},
      },
      {
        id: 'd2-pm',
        time: '14:15',
        tracks: [
          {title: 'The craft AMA — open Q&A with speakers'},
          {title: 'Perf budgets that actually stick', speaker: 'Priya Raman'},
          {
            title: 'Ship a micro-interaction before 16:00',
            speaker: 'Jonas Beck',
          },
        ],
      },
      {
        id: 'd2-keynote',
        time: '16:00',
        shared: {
          title: 'Closing keynote — Design tokens at 60fps',
          speaker: 'Jonas Beck',
        },
      },
      {
        id: 'd2-close',
        time: '17:30',
        shared: {title: 'Closing remarks & a farewell porto tónico'},
      },
    ],
  },
];

interface TicketTier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  strikeNote?: string;
  isSoldOut?: boolean;
  isFeatured?: boolean;
  seatsSold: number;
  seatsTotal: number;
  seatsNoun: string;
  features: readonly string[];
  cta: string;
}

const TIERS: readonly TicketTier[] = [
  {
    id: 'early',
    name: 'Early bird',
    price: '€420',
    priceNote: 'per person · sold Mar–May',
    isSoldOut: true,
    seatsSold: 150,
    seatsTotal: 150,
    seatsNoun: 'seats',
    features: [
      'All talks, both days',
      'Workshop track access',
      'Lunch + specialty coffee cart',
      'Talk video library after the event',
    ],
    cta: 'Sold out',
  },
  {
    id: 'regular',
    name: 'Regular',
    price: '€560',
    priceNote: 'per person · until Sep 26',
    isFeatured: true,
    seatsSold: 463,
    seatsTotal: 600,
    seatsNoun: 'seats',
    features: [
      'All talks + workshop track',
      'Lunch both days + coffee cart',
      'Video library + speaker slides',
      'Sunset social on Day 1',
      'Lightning-talk open mic entry',
    ],
    cta: 'Get a Regular ticket',
  },
  {
    id: 'team',
    name: 'Team pack',
    price: '€2,240',
    priceNote: 'five seats · €448 per seat',
    strikeNote: 'Save €560 vs five Regular',
    seatsSold: 28,
    seatsTotal: 40,
    seatsNoun: 'packs',
    features: [
      '5 × everything in Regular',
      'Swap attendee names until Sep 25',
      'Invoice billing (EU VAT handled)',
      'Reserved table at the sunset social',
    ],
    cta: 'Get a Team pack',
  },
];

const VENUE = {
  name: 'Pátio da Luz',
  address: 'Av. da Índia 122 · Belém, Lisbon',
  blurb:
    'A converted riverside warehouse ten minutes from the Jerónimos ' +
    'cloisters: one main hall, two track rooms, and a rooftop terrace ' +
    'over the Tejo where lunch is served both days.',
};

const TRAVEL_NOTES: readonly {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}[] = [
  {
    id: 'air',
    icon: PlaneIcon,
    title: 'From LIS airport',
    copy: 'Metro red line to Cais do Sodré, then Tram 15E — about 40 minutes door to door.',
  },
  {
    id: 'tram',
    icon: TrainFrontIcon,
    title: 'Tram 15E · stop “Belém”',
    copy: 'The stop is 300 m from the venue doors. Trams run every 10 minutes until midnight.',
  },
  {
    id: 'stay',
    icon: HotelIcon,
    title: 'Where to stay',
    copy: 'Partner rates at three hotels in Belém and Alcântara — the booking code is in your ticket email.',
  },
  {
    id: 'bike',
    icon: BikeIcon,
    title: 'By bike',
    copy: 'The riverside cycle path passes the front door; racks and a lock-loan desk are inside the gate.',
  },
];

interface SponsorTierGroup {
  id: string;
  label: string;
  tileHeight: number;
  monogramSize: number;
  minWidth: number;
  sponsors: readonly {id: string; name: string; monogram: string}[];
}

const SPONSOR_TIERS: readonly SponsorTierGroup[] = [
  {
    id: 'platinum',
    label: 'Platinum',
    tileHeight: 84,
    monogramSize: 40,
    minWidth: 220,
    sponsors: [
      {id: 'fjord', name: 'Fjord Systems', monogram: 'FS'},
      {id: 'ondagrid', name: 'Ondagrid', monogram: 'OG'},
      {id: 'tessel', name: 'Tessel', monogram: 'TS'},
    ],
  },
  {
    id: 'gold',
    label: 'Gold',
    tileHeight: 64,
    monogramSize: 30,
    minWidth: 170,
    sponsors: [
      {id: 'saltpan', name: 'Saltpan', monogram: 'SP'},
      {id: 'loomworks', name: 'Loomworks', monogram: 'LW'},
      {id: 'brightline', name: 'Brightline', monogram: 'BL'},
      {id: 'orbital', name: 'Orbital', monogram: 'OR'},
    ],
  },
  {
    id: 'community',
    label: 'Community',
    tileHeight: 52,
    monogramSize: 24,
    minWidth: 150,
    sponsors: [
      {id: 'quill', name: 'Quill & Co', monogram: 'Q'},
      {id: 'hexbyte', name: 'Hexbyte', monogram: 'HX'},
      {id: 'polaris', name: 'Polaris', monogram: 'PL'},
      {id: 'rua', name: 'Rua Studio', monogram: 'RS'},
      {id: 'norte', name: 'Norte Café', monogram: 'NC'},
      {id: 'ddl', name: 'Devs de Lisboa', monogram: 'DL'},
    ],
  },
];

/** Interface 2025 (Porto) recap numbers — count up on first view. */
const PAST_STATS: readonly {
  id: string;
  target: number;
  suffix: string;
  label: string;
}[] = [
  {id: 'attendees', target: 1240, suffix: '', label: 'attendees in 2025'},
  {id: 'talks', target: 42, suffix: '', label: 'talks & workshops'},
  {id: 'countries', target: 31, suffix: '', label: 'countries represented'},
  {id: 'return', target: 96, suffix: '%', label: 'said they would return'},
];

const COLLAGE_TILES: readonly {
  id: string;
  caption: string;
  angle: number;
  mixA: number;
  mixB: number;
  span2?: boolean;
}[] = [
  {
    id: 'hall',
    caption: 'Main hall, Porto 2025',
    angle: 130,
    mixA: 34,
    mixB: 10,
    span2: true,
  },
  {id: 'hallway', caption: 'The hallway track', angle: 100, mixA: 22, mixB: 8},
  {id: 'live', caption: 'Live-coding night', angle: 155, mixA: 30, mixB: 14},
  {id: 'rooftop', caption: 'Rooftop lunch', angle: 115, mixA: 26, mixB: 6},
  {id: 'lab', caption: 'Workshop lab', angle: 145, mixA: 18, mixB: 10},
];

const FOOTER_GROUPS: readonly {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}[] = [
  {
    id: 'conference',
    heading: 'Conference',
    links: [
      {label: 'Speakers', anchor: 'speakers'},
      {label: 'Agenda', anchor: 'agenda'},
      {label: 'Tickets', anchor: 'tickets'},
      {label: 'Venue & travel', anchor: 'venue'},
    ],
  },
  {
    id: 'community',
    heading: 'Community',
    links: [
      {label: 'Code of conduct'},
      {label: 'Volunteer crew'},
      {label: 'Past editions'},
      {label: 'Scholarship tickets'},
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    links: [
      {label: 'hello@interfaceconf.example'},
      {label: 'Press kit'},
      {label: 'Sponsor prospectus'},
    ],
  },
];

// ============= HELPERS =============

/**
 * Measure the page's own width with a ResizeObserver — the inline demo
 * stage is ~1045px inside a 1440px window, so viewport media queries
 * never fire there.
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

/** prefers-reduced-motion gate for reveals, count-ups, parallax, story. */
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

/** Fire-once IntersectionObserver flag for reveals and count-ups. */
function useInViewOnce(
  ref: RefObject<HTMLDivElement | null>,
  isReduced: boolean,
): boolean {
  const [isSeen, setIsSeen] = useState(false);
  useEffect(() => {
    if (isSeen) {
      return undefined;
    }
    if (isReduced || typeof IntersectionObserver === 'undefined') {
      setIsSeen(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsSeen(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isReduced, isSeen, ref]);
  return isSeen;
}

/** rAF count-up toward target once active; ~900ms decelerate. Reduced
 * motion snaps to the final number. */
function useCountUp(
  target: number,
  isActive: boolean,
  isReduced: boolean,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (isReduced) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const step = (timestamp: number) => {
      if (startedAt === null) {
        startedAt = timestamp;
      }
      const progress = Math.min(1, (timestamp - startedAt) / 900);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isActive, isReduced, target]);
  return value;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter an email address first.';
  }
  if (!EMAIL_RE.test(trimmed)) {
    return 'That doesn’t look like an email address.';
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

/** Gradient art recipe shared by speaker cards and collage tiles. */
function accentArt(angle: number, mixA: number, mixB: number): CSSProperties {
  return {
    backgroundImage: [
      `linear-gradient(${angle}deg, ${accentMix(mixA)}, ${accentMix(mixB)})`,
      `radial-gradient(80% 120% at 100% 0%, ${accentMix(Math.round(mixA / 2))}, transparent 60%)`,
    ].join(', '),
  };
}

/** Reveal choreography: 16px rise + 0.985 scale, 600ms decelerate, with a
 * per-child stagger delay. Everything visible immediately when reduced. */
function revealStyle(
  isSeen: boolean,
  isReduced: boolean,
  delayMs = 0,
): CSSProperties {
  if (isReduced) {
    return {};
  }
  return {
    opacity: isSeen ? 1 : 0,
    transform: isSeen ? 'none' : 'translateY(16px) scale(0.985)',
    transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`,
  };
}

// ============= SMALL PIECES =============

/** Interface wordmark: accent gradient tile + name + year badge. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={SparklesIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
      <Badge variant="purple" label={BRAND.year} />
    </HStack>
  );
}

/** Sheen-sweep wrapper for primary Buttons: hover lift + traveling
 * highlight + pressed scale, all in the scoped stylesheet. */
function Shine({children}: {children: ReactNode}) {
  return (
    <span className="cel-btn">
      {children}
      <span className="cel-sheen" aria-hidden="true" />
    </span>
  );
}

/** Scroll-reveal wrapper: fires once per section. */
function Reveal({
  isReduced,
  delayMs = 0,
  children,
}: {
  isReduced: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isSeen = useInViewOnce(ref, isReduced);
  return (
    <div ref={ref} style={revealStyle(isSeen, isReduced, delayMs)}>
      {children}
    </div>
  );
}

/** Aurora field: drifting blurred bloom blobs behind a band. */
function AuroraField({
  blobs,
}: {
  blobs: readonly {
    size: number;
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    color: string;
    opacity: number;
    isAlt?: boolean;
  }[];
}) {
  return (
    <div style={styles.auroraField} aria-hidden="true">
      {blobs.map((blob, index) => (
        <div
          key={index}
          className={blob.isAlt ? 'cel-aurora-alt' : 'cel-aurora'}
          style={{
            position: 'absolute',
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            borderRadius: '50%',
            filter: 'blur(90px)',
            opacity: blob.opacity,
            background: `radial-gradient(closest-side, ${blob.color}, transparent 72%)`,
          }}
        />
      ))}
    </div>
  );
}

/** Grain texture overlay (see Color policy). */
function Grain() {
  return <div style={styles.grain} aria-hidden="true" />;
}

/** Section intro: eyebrow chip + display heading + supporting copy. */
function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'center',
  isCompact,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'center' | 'start';
  isCompact: boolean;
}) {
  const isCentered = align === 'center';
  return (
    <VStack gap={3} hAlign={isCentered ? 'center' : 'start'}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isCompact ? styles.sectionTitleCompact : null),
          textAlign: isCentered ? 'center' : 'left',
        }}>
        {title}
      </h2>
      <div
        style={{
          maxWidth: '56ch',
          textAlign: isCentered ? 'center' : 'left',
        }}>
        <Text
          type="supporting"
          color="secondary"
          justify={isCentered ? 'center' : 'start'}>
          {description}
        </Text>
      </div>
    </VStack>
  );
}

/** Green check bullet for ticket feature lists. */
function CheckBullet({label}: {label: string}) {
  return (
    <HStack gap={2} vAlign="start">
      <span style={styles.checkGlyph} aria-hidden="true">
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </span>
      <StackItem size="fill">
        <Text type="body">{label}</Text>
      </StackItem>
    </HStack>
  );
}

/** One past-edition stat with its own count-up, on a glass card. */
function StatCell({
  target,
  suffix,
  label,
  isActive,
  isReduced,
  isPhone,
}: {
  target: number;
  suffix: string;
  label: string;
  isActive: boolean;
  isReduced: boolean;
  isPhone: boolean;
}) {
  const value = useCountUp(target, isActive, isReduced);
  return (
    <div style={styles.glassCard}>
      <VStack gap={1} hAlign="center">
        <span
          style={{
            ...styles.statNumber,
            ...(isPhone ? styles.statNumberPhone : null),
          }}>
          {value.toLocaleString('en-US')}
          {suffix}
        </span>
        <Text type="supporting" color="secondary" justify="center">
          {label}
        </Text>
      </VStack>
    </div>
  );
}

/**
 * Schematic map of Belém: streets, river, tram line, venue pin — now a
 * scroll-story stage. `activeStep` (0 air · 1 tram · 2 stay · 3 bike)
 * spotlights one journey layer; `drawProgress` 0..1 draws the tram line
 * via pathLength-normalized stroke-dashoffset.
 */
function VenueMap({
  activeStep,
  drawProgress,
}: {
  activeStep: number;
  drawProgress: number;
}) {
  const layer = (step: number): CSSProperties => ({
    opacity: activeStep === step ? 1 : 0.16,
    transition: 'opacity 0.45s ease',
  });
  return (
    <svg
      viewBox="0 0 640 340"
      width="100%"
      role="img"
      aria-label="Schematic map: Pátio da Luz on Av. da Índia in Belém, near the Tram 15E stop, with the Tejo river to the south"
      style={{display: 'block'}}>
      <rect width="640" height="340" fill="var(--color-background-muted)" />
      {/* street grid */}
      <g stroke="var(--color-border)" strokeWidth="2">
        <line x1="0" y1="64" x2="640" y2="64" />
        <line x1="0" y1="128" x2="640" y2="128" />
        <line x1="0" y1="192" x2="640" y2="192" />
        <line x1="112" y1="0" x2="112" y2="212" />
        <line x1="248" y1="0" x2="248" y2="212" />
        <line x1="392" y1="0" x2="392" y2="212" />
        <line x1="524" y1="0" x2="524" y2="212" />
      </g>
      {/* park block */}
      <rect
        x="404"
        y="20"
        width="104"
        height="92"
        rx="10"
        fill="color-mix(in srgb, var(--color-success, light-dark(#1E8E3E, #6DD58C)) 18%, transparent)"
      />
      <text
        x="456"
        y="70"
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-text-secondary)">
        Jardim
      </text>
      {/* step 0 — from LIS airport: metro leg dropping in from the north */}
      <g style={layer(0)}>
        <circle cx="60" cy="26" r="14" fill={accentMix(18)} />
        <circle cx="60" cy="26" r="14" fill="none" stroke={ACCENT} strokeWidth="1.5" />
        <text
          x="82"
          y="30"
          fontSize="11"
          fontWeight="700"
          fill="var(--color-text-primary)">
          LIS ✈
        </text>
        <polyline
          points="60,40 60,120 96,168 130,208"
          fill="none"
          stroke={ACCENT}
          strokeWidth="2.5"
          strokeDasharray="3 6"
          opacity="0.8"
        />
        <text x="18" y="120" fontSize="10" fill="var(--color-text-secondary)">
          Metro
        </text>
      </g>
      {/* step 1 — tram 15E line, drawn by scroll progress */}
      <g style={layer(1)}>
        <polyline
          points="0,224 200,219 420,213 640,207"
          fill="none"
          stroke={ACCENT}
          strokeWidth="2.5"
          strokeDasharray="1"
          strokeDashoffset={Math.max(0, 1 - drawProgress)}
          pathLength={1}
          opacity="0.85"
        />
        {[
          {x: 150, y: 221},
          {x: 330, y: 216},
          {x: 540, y: 210},
        ].map(stop => (
          <circle
            key={stop.x}
            cx={stop.x}
            cy={stop.y}
            r="5"
            fill="var(--color-background-body)"
            stroke={ACCENT}
            strokeWidth="2"
          />
        ))}
        <text x="18" y="214" fontSize="11" fill="var(--color-text-secondary)">
          Tram 15E → Belém
        </text>
      </g>
      {/* step 2 — partner hotels */}
      <g style={layer(2)}>
        {[
          {x: 128, y: 76},
          {x: 420, y: 140},
        ].map(hotel => (
          <g key={hotel.x}>
            <rect
              x={hotel.x}
              y={hotel.y}
              width="34"
              height="30"
              rx="8"
              fill={accentMix(16)}
              stroke={ACCENT}
              strokeWidth="1.5"
            />
            <text
              x={hotel.x + 17}
              y={hotel.y + 20}
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill={ACCENT}>
              H
            </text>
          </g>
        ))}
        <text x="128" y="66" fontSize="10" fill="var(--color-text-secondary)">
          Partner hotels
        </text>
      </g>
      {/* step 3 — riverside cycle path */}
      <g style={layer(3)}>
        <path
          d="M0,240 C120,232 260,238 380,232 C480,228 560,226 640,222"
          fill="none"
          stroke={ACCENT}
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.8"
        />
        <circle cx="86" cy="237" r="9" fill={accentMix(20)} stroke={ACCENT} strokeWidth="1.5" />
        <text x="102" y="241" fontSize="10" fill="var(--color-text-secondary)">
          Cycle path
        </text>
      </g>
      {/* venue block + pin (always lit) */}
      <rect
        x="196"
        y="130"
        width="128"
        height="58"
        rx="12"
        fill={accentMix(24)}
        stroke={ACCENT}
        strokeWidth="1.5"
      />
      <circle cx="260" cy="122" r="10" fill={ACCENT} />
      <circle cx="260" cy="122" r="3.5" fill="var(--color-background-body)" />
      <text
        x="260"
        y="164"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="var(--color-text-primary)">
        Pátio da Luz
      </text>
      <text
        x="260"
        y="179"
        textAnchor="middle"
        fontSize="10"
        fill="var(--color-text-secondary)">
        Av. da Índia 122
      </text>
      {/* river */}
      <path
        d="M0,252 C90,242 160,262 250,254 C350,246 430,240 520,248 C570,252 610,250 640,246 L640,340 L0,340 Z"
        fill={accentMix(14)}
      />
      <text
        x="500"
        y="304"
        fontSize="11"
        fontStyle="italic"
        fill="var(--color-text-secondary)">
        Rio Tejo
      </text>
    </svg>
  );
}

/** QR-ish schematic for the hero pass (deterministic bit pattern). */
function PassQr() {
  return (
    <svg width="54" height="54" viewBox="0 0 90 90" aria-hidden="true">
      <rect width="90" height="90" rx="8" fill={accentMix(8)} />
      {QR_CELLS.map((isOn, index) =>
        isOn ? (
          <rect
            key={index}
            x={5 + (index % 9) * 9}
            y={5 + Math.floor(index / 9) * 9}
            width="7"
            height="7"
            rx="1.5"
            fill={ACCENT}
            opacity="0.85"
          />
        ) : null,
      )}
    </svg>
  );
}

// ============= PAGE =============

export default function ConferenceEventLandingTemplate() {
  // ---- responsive measurement (demo-stage safe) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isHeroStacked = wrapWidth > 0 && wrapWidth <= 980;
  const isAgendaStacked = wrapWidth > 0 && wrapWidth <= 860;
  const isCompact = wrapWidth > 0 && wrapWidth <= 780;
  const isPhone = wrapWidth > 0 && wrapWidth <= 480;

  const isReduced = usePrefersReducedMotion();
  const isHeroParallax = !isReduced && !isHeroStacked;
  const isStoryPinned = !isReduced && !isCompact;

  // ---- countdown: fixture-seeded, ticks once per second ----
  const [remaining, setRemaining] = useState(COUNTDOWN_START_SECONDS);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(previous => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const countdownParts = [
    {label: 'days', value: Math.floor(remaining / 86400).toString()},
    {label: 'hours', value: pad2(Math.floor((remaining % 86400) / 3600))},
    {label: 'min', value: pad2(Math.floor((remaining % 3600) / 60))},
    {label: 'sec', value: pad2(remaining % 60)},
  ];

  // ---- nav (scroll-aware chrome + compact menu) ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!isNavMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNavMenuOpen(false);
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

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const jumpToSection = (id: SectionId) => {
    setIsNavMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container === null || section === null || section === undefined) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  // ---- venue scroll story ----
  const storyScrollRef = useRef<HTMLDivElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [staticStep, setStaticStep] = useState(0);
  const activeStep = isStoryPinned
    ? Math.min(
        TRAVEL_NOTES.length - 1,
        Math.floor(storyProgress * TRAVEL_NOTES.length),
      )
    : staticStep;
  const railFillAmount = isStoryPinned
    ? storyProgress
    : (staticStep + 1) / TRAVEL_NOTES.length;

  const onPageScroll = () => {
    const container = pageRef.current;
    if (container === null) {
      return;
    }
    const nextScrolled = container.scrollTop > 24;
    setIsScrolled(previous =>
      previous === nextScrolled ? previous : nextScrolled,
    );
    if (!isStoryPinned) {
      return;
    }
    const story = storyScrollRef.current;
    if (story === null) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();
    const raw =
      (containerRect.top + STORY_STAGE_TOP - storyRect.top) / STORY_SCROLL;
    const clamped = Math.max(0, Math.min(1, raw));
    setStoryProgress(previous =>
      Math.abs(previous - clamped) < 0.004 ? previous : clamped,
    );
  };

  const jumpToStoryStep = (index: number) => {
    if (!isStoryPinned) {
      setStaticStep(index);
      return;
    }
    const container = pageRef.current;
    const story = storyScrollRef.current;
    if (container === null || story === null) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();
    const base =
      container.scrollTop + (storyRect.top - containerRect.top) -
      STORY_STAGE_TOP;
    const target =
      base + ((index + 0.5) / TRAVEL_NOTES.length) * STORY_SCROLL;
    container.scrollTo({top: target, behavior: 'smooth'});
  };

  // ---- hero parallax (CSS vars set on the hero element; no re-render) ----
  const heroRef = useRef<HTMLElement | null>(null);
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isHeroParallax) {
      return;
    }
    const hero = heroRef.current;
    if (hero === null) {
      return;
    }
    const rect = hero.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    hero.style.setProperty('--cel-px', px.toFixed(3));
    hero.style.setProperty('--cel-py', py.toFixed(3));
  };
  const onHeroPointerLeave = () => {
    const hero = heroRef.current;
    if (hero === null) {
      return;
    }
    hero.style.setProperty('--cel-px', '0');
    hero.style.setProperty('--cel-py', '0');
  };

  // ---- dark-band pointer spotlight ----
  const darkRef = useRef<HTMLElement | null>(null);
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const band = darkRef.current;
    if (band === null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty(
      '--cel-mx',
      `${Math.round(event.clientX - rect.left)}px`,
    );
    band.style.setProperty(
      '--cel-my',
      `${Math.round(event.clientY - rect.top)}px`,
    );
  };

  // ---- agenda ----
  const [agendaDayId, setAgendaDayId] = useState<AgendaDay['id']>('day1');
  const agendaDay = AGENDA.find(day => day.id === agendaDayId) ?? AGENDA[0];

  // ---- tickets: inline reserve flow ----
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [reserveForm, setReserveForm] =
    useState<EmailFormState>(EMPTY_EMAIL_FORM);
  const selectedTier = TIERS.find(tier => tier.id === selectedTierId) ?? null;

  // ---- newsletter ----
  const [newsForm, setNewsForm] = useState<EmailFormState>(EMPTY_EMAIL_FORM);

  // ---- stagger-reveal triggers ----
  const speakersGridRef = useRef<HTMLDivElement | null>(null);
  const speakersSeen = useInViewOnce(speakersGridRef, isReduced);
  const tiersGridRef = useRef<HTMLDivElement | null>(null);
  const tiersSeen = useInViewOnce(tiersGridRef, isReduced);
  const sponsorsGridRef = useRef<HTMLDivElement | null>(null);
  const sponsorsSeen = useInViewOnce(sponsorsGridRef, isReduced);
  const collageRef = useRef<HTMLDivElement | null>(null);
  const collageSeen = useInViewOnce(collageRef, isReduced);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsSeen = useInViewOnce(statsRef, isReduced);

  // ---- toast ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const pickTier = (tier: TicketTier) => {
    if (tier.isSoldOut) {
      return;
    }
    setSelectedTierId(tier.id);
    setReserveForm(EMPTY_EMAIL_FORM);
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

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isCompact ? styles.columnCompact : null),
  };
  const bandPad: CSSProperties = {
    ...styles.band,
    ...(isCompact ? styles.bandCompact : null),
  };
  const heroFontSize =
    wrapWidth > 1020 ? 76 : wrapWidth > 860 ? 64 : wrapWidth > 480 ? 46 : 34;

  /** Independent parallax drift per satellite (multiplier px). */
  const satParallax = (x: number, y: number): CSSProperties =>
    isHeroParallax
      ? {
          transform: `translate3d(calc(var(--cel-px, 0) * ${x}px), calc(var(--cel-py, 0) * ${y}px), 0)`,
          transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }
      : {};

  // ============= NAVBAR =============

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Conference">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isCompact ? (
          <HStack gap={1} vAlign="center">
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                style={styles.navLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
            <Shine>
              <Button
                label="Get tickets"
                variant="primary"
                size="md"
                icon={<Icon icon={TicketIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('tickets')}
              />
            </Shine>
          </HStack>
        ) : (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isNavMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isNavMenuOpen}
            style={styles.iconButton}
            onClick={() => setIsNavMenuOpen(open => !open)}>
            <Icon
              icon={isNavMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isCompact && isNavMenuOpen ? (
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
              <Divider />
              <Button
                label="Get tickets"
                variant="primary"
                size="md"
                icon={<Icon icon={TicketIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('tickets')}
              />
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ============= HERO (product theater) =============

  const passTheater = (
    <div
      style={{
        ...styles.theaterStage,
        ...(isHeroStacked ? styles.theaterStageStacked : null),
      }}>
      {/* concentric backdrop rings */}
      <svg
        style={styles.theaterRings}
        viewBox="0 0 480 520"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true">
        <g fill="none" stroke={accentMix(20)} strokeWidth="1.5">
          <circle cx="240" cy="260" r="130" />
          <circle cx="240" cy="260" r="185" />
          <circle cx="240" cy="260" r="240" />
        </g>
      </svg>
      <div style={styles.passParallax}>
        <div className="cel-bob" style={styles.passCard}>
          <div style={styles.passHeader}>
            <div style={styles.brandTile} aria-hidden="true">
              <Icon icon={SparklesIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <Text type="label">
                {BRAND.name} {BRAND.year}
              </Text>
              <Text type="supporting" color="secondary">
                Attendee pass
              </Text>
            </VStack>
          </div>
          <div style={styles.passBody}>
            <HStack gap={3} vAlign="center">
              <span style={styles.passMonogram}>{PASS.initials}</span>
              <VStack gap={0}>
                <Text type="label">{PASS.holder}</Text>
                <Text type="supporting" color="secondary">
                  {PASS.role}
                </Text>
              </VStack>
            </HStack>
            <div style={styles.passRule} aria-hidden="true" />
            <HStack gap={2} vAlign="start">
              <Icon icon={CalendarDaysIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {BRAND.dates} · {BRAND.venueShort}
              </Text>
            </HStack>
            <HStack gap={2} vAlign="start">
              <Icon icon={TicketIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {PASS.tier}
              </Text>
            </HStack>
          </div>
          <div style={styles.passFoot}>
            <span style={{...styles.mono, color: 'var(--color-text-secondary)'}}>
              {PASS.code}
            </span>
            <PassQr />
          </div>
        </div>
      </div>
      {/* satellite: alumni cluster */}
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: -14,
          left: isHeroStacked ? 4 : -8,
          ...satParallax(10, 8),
        }}>
        <div className="cel-bob" style={{...styles.satellite, position: 'relative'}}>
          <HStack gap={2} vAlign="center">
            <HStack gap={0} vAlign="center">
              {['MV', 'KM', 'AD'].map((initials, index) => (
                <span
                  key={initials}
                  style={{
                    ...styles.clusterDisc,
                    marginLeft: index === 0 ? 0 : -8,
                  }}>
                  {initials}
                </span>
              ))}
            </HStack>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                1,240 alumni
              </Text>
              <Text type="supporting" color="secondary">
                31 countries
              </Text>
            </VStack>
          </HStack>
        </div>
      </div>
      {/* satellite: seats-left metric chip */}
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: 118,
          right: isHeroStacked ? 4 : -12,
          ...satParallax(-8, -6),
        }}>
        <div
          className="cel-bob cel-bob-2"
          style={{...styles.satellite, position: 'relative'}}>
          <VStack gap={1}>
            <Text size="sm" weight="semibold">
              137 seats left
            </Text>
            <div style={styles.meterTrack} aria-hidden="true">
              <div style={styles.meterFill} />
            </div>
            <Text type="supporting" color="secondary">
              Regular · 463 of 600 sold
            </Text>
          </VStack>
        </div>
      </div>
      {/* satellite: speaker toast */}
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          bottom: -18,
          left: isHeroStacked ? 12 : -24,
          ...satParallax(7, -9),
        }}>
        <div
          className="cel-bob cel-bob-3"
          style={{...styles.satellite, position: 'relative'}}>
          <HStack gap={2} vAlign="center">
            <span style={styles.passMonogram}>SA</span>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                Sofia Almeida joined the lineup
              </Text>
              <Text type="supporting" color="secondary">
                Head of Design · Ondagrid
              </Text>
            </VStack>
          </HStack>
        </div>
      </div>
    </div>
  );

  const hero = (
    <header
      ref={heroRef}
      style={styles.hero}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      <AuroraField
        blobs={[
          {size: 520, top: -180, left: -120, color: BLOOM_COOL, opacity: 0.45},
          {
            size: 460,
            top: 20,
            right: -140,
            color: accentMix(80),
            opacity: 0.4,
            isAlt: true,
          },
          {
            size: 380,
            bottom: -160,
            left: '32%',
            color: BLOOM_WARM,
            opacity: 0.35,
          },
        ]}
      />
      <Grain />
      <div style={columnStyle}>
        <div
          style={{
            ...styles.heroSplit,
            ...(isHeroStacked ? styles.heroSplitStacked : null),
          }}>
          <div
            style={{
              ...styles.heroCopy,
              ...(isHeroStacked ? styles.heroCopyStacked : null),
            }}>
            <HStack
              gap={2}
              vAlign="center"
              wrap="wrap"
              hAlign={isHeroStacked ? 'center' : 'start'}>
              <Token
                label={`${BRAND.dates} · ${BRAND.city}`}
                size="md"
                color="purple"
                icon={<Icon icon={CalendarDaysIcon} size="xsm" color="inherit" />}
              />
              <Token label="2 days · 3 tracks · 600 seats" size="md" color="gray" />
            </HStack>
            <h1 style={{...styles.heroHeadline, fontSize: heroFontSize}}>
              Two days on the{' '}
              <span style={styles.heroInk}>craft of building interfaces</span>
            </h1>
            <p style={styles.heroSubcopy}>
              Eight speakers, a systems track that goes deep, and workshops
              you leave with something shipped. October 8–9 in a converted
              riverside warehouse in Belém, Lisbon.
            </p>
            <div
              style={{
                ...styles.countdownRow,
                justifyContent: isHeroStacked ? 'center' : 'flex-start',
              }}
              role="timer"
              aria-label={`Doors open in ${countdownParts[0].value} days, ${countdownParts[1].value} hours, ${countdownParts[2].value} minutes`}>
              {countdownParts.map(part => (
                <div
                  key={part.label}
                  style={{
                    ...styles.countdownCell,
                    ...(isPhone ? styles.countdownCellPhone : null),
                  }}>
                  <span
                    style={{
                      ...styles.countdownNumber,
                      ...(isPhone ? styles.countdownNumberPhone : null),
                    }}>
                    {part.value}
                  </span>
                  <span style={styles.countdownLabel}>{part.label}</span>
                </div>
              ))}
            </div>
            <HStack
              gap={2}
              vAlign="center"
              wrap="wrap"
              hAlign={isHeroStacked ? 'center' : 'start'}>
              <Shine>
                <Button
                  label="Get tickets"
                  variant="primary"
                  size="lg"
                  icon={<Icon icon={TicketIcon} size="sm" color="inherit" />}
                  onClick={() => jumpToSection('tickets')}
                />
              </Shine>
              <Button
                label="See the agenda"
                variant="secondary"
                size="lg"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('agenda')}
              />
            </HStack>
            <Text type="supporting" color="secondary">
              Early bird sold out in 11 days · 137 Regular seats left
            </Text>
          </div>
          {passTheater}
        </div>
      </div>
    </header>
  );

  // ============= SPEAKERS =============

  const speakersSection = (
    <section
      ref={registerSection('speakers')}
      style={bandPad}
      aria-label="Speakers">
      <div style={columnStyle}>
        <VStack gap={6}>
          <Reveal isReduced={isReduced}>
            <SectionIntro
              eyebrow="Speakers"
              title="Eight people who build for a living"
              description="No product pitches — every talk is a practitioner walking through real work, with the scars to prove it."
              align="start"
              isCompact={isCompact}
            />
          </Reveal>
          <div ref={speakersGridRef}>
            <Grid columns={{minWidth: 230}} gap={3}>
              {SPEAKERS.map((speaker, index) => (
                <div
                  key={speaker.id}
                  style={{
                    ...revealStyle(speakersSeen, isReduced, index * 70),
                    height: '100%',
                  }}>
                  <div className="cel-raise" style={styles.speakerCard}>
                    <div
                      style={{
                        ...styles.speakerArt,
                        ...(speaker.isKeynote ? styles.speakerArtKeynote : null),
                        ...accentArt(speaker.angle, speaker.mixA, speaker.mixB),
                      }}
                      aria-hidden="true">
                      <span style={styles.speakerMonogram}>
                        {speaker.initials}
                      </span>
                    </div>
                    <div style={styles.speakerBody}>
                      <HStack gap={2} vAlign="center" wrap="wrap">
                        <Text type="label">{speaker.name}</Text>
                        {speaker.isKeynote ? (
                          <Badge variant="purple" label="Keynote" />
                        ) : null}
                      </HStack>
                      <Text type="supporting" color="secondary">
                        {speaker.role} · {speaker.company}
                      </Text>
                      <Text size="sm">{speaker.talk}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </Grid>
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= AGENDA =============

  const agendaWide = (
    <div style={styles.agendaGrid} role="table" aria-label={agendaDay.label}>
      <span aria-hidden="true" />
      {TRACKS.map(track => (
        <div key={track.id} style={{paddingBottom: 4}}>
          <Token label={track.name} size="sm" color={track.color} />
        </div>
      ))}
      {agendaDay.slots.map(slot => {
        if (slot.shared != null) {
          return (
            <div key={slot.id} style={{display: 'contents'}}>
              <span style={styles.agendaTime}>{slot.time}</span>
              <div style={{...styles.agendaCell, ...styles.agendaShared}}>
                <Text size="sm" weight="semibold">
                  {slot.shared.title}
                </Text>
                {slot.shared.speaker != null ? (
                  <Text type="supporting" color="secondary">
                    {slot.shared.speaker}
                  </Text>
                ) : null}
              </div>
            </div>
          );
        }
        return (
          <div key={slot.id} style={{display: 'contents'}}>
            <span style={styles.agendaTime}>{slot.time}</span>
            {(slot.tracks ?? []).map((session, index) => (
              <div key={TRACKS[index].id} style={styles.agendaCell}>
                <Text size="sm" weight="semibold">
                  {session.title}
                </Text>
                {session.speaker != null ? (
                  <Text type="supporting" color="secondary">
                    {session.speaker}
                  </Text>
                ) : null}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const sharedSlots = agendaDay.slots.filter(slot => slot.shared != null);
  const agendaStacked = (
    <VStack gap={2}>
      <Card padding={3}>
        <Collapsible
          trigger={
            <HStack gap={2} vAlign="center">
              <Token label="Everyone" size="sm" color="purple" />
              <Text type="supporting" color="secondary">
                keynotes, meals & socials
              </Text>
            </HStack>
          }
          defaultIsOpen={true}>
          <VStack gap={2}>
            {sharedSlots.map(slot => (
              <HStack key={slot.id} gap={2} vAlign="start">
                <span style={{...styles.agendaTime, paddingTop: 2, width: 44}}>
                  {slot.time}
                </span>
                <VStack gap={0}>
                  <Text size="sm" weight="semibold">
                    {slot.shared?.title}
                  </Text>
                  {slot.shared?.speaker != null ? (
                    <Text type="supporting" color="secondary">
                      {slot.shared.speaker}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Collapsible>
      </Card>
      {TRACKS.map((track, trackIndex) => (
        <Card key={track.id} padding={3}>
          <Collapsible
            trigger={
              <HStack gap={2} vAlign="center">
                <Token label={track.name} size="sm" color={track.color} />
                <Text type="supporting" color="secondary">
                  {
                    agendaDay.slots.filter(slot => slot.tracks != null).length
                  }{' '}
                  sessions
                </Text>
              </HStack>
            }
            defaultIsOpen={trackIndex === 0}>
            <VStack gap={2}>
              {agendaDay.slots
                .filter(slot => slot.tracks != null)
                .map(slot => {
                  const session = slot.tracks?.[trackIndex];
                  if (session == null) {
                    return null;
                  }
                  return (
                    <HStack key={slot.id} gap={2} vAlign="start">
                      <span
                        style={{
                          ...styles.agendaTime,
                          paddingTop: 2,
                          width: 44,
                        }}>
                        {slot.time}
                      </span>
                      <VStack gap={0}>
                        <Text size="sm" weight="semibold">
                          {session.title}
                        </Text>
                        {session.speaker != null ? (
                          <Text type="supporting" color="secondary">
                            {session.speaker}
                          </Text>
                        ) : null}
                      </VStack>
                    </HStack>
                  );
                })}
            </VStack>
          </Collapsible>
        </Card>
      ))}
    </VStack>
  );

  const agendaSection = (
    <section
      ref={registerSection('agenda')}
      style={{...bandPad, ...styles.bandDots}}
      aria-label="Agenda">
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isReduced={isReduced}>
            <SectionIntro
              eyebrow="Agenda"
              title="Two days, three tracks, zero filler"
              description="Main Stage for the big ideas, Systems for the deep dives, Workshops for hands-on work. Every session is 45 minutes or less."
              isCompact={isCompact}
            />
          </Reveal>
          <Reveal isReduced={isReduced} delayMs={90}>
            <VStack gap={4}>
              <TabList
                value={agendaDayId}
                onChange={value => setAgendaDayId(value as AgendaDay['id'])}
                aria-label="Agenda day"
                hasDivider>
                {AGENDA.map(day => (
                  <Tab key={day.id} value={day.id} label={day.label} />
                ))}
              </TabList>
              {isAgendaStacked ? agendaStacked : agendaWide}
              <Text type="supporting" color="secondary">
                All times WEST (UTC+1). Talks are recorded; workshops are not.
              </Text>
            </VStack>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= TICKETS =============

  const ticketsSection = (
    <section
      ref={registerSection('tickets')}
      style={bandPad}
      aria-label="Tickets">
      <div style={columnStyle}>
        <VStack gap={6}>
          <Reveal isReduced={isReduced}>
            <SectionIntro
              eyebrow="Tickets"
              title="600 seats. That’s the whole point."
              description="Small enough that the hallway track works, priced so your whole team can come. Every ticket includes both days, workshops, and lunch."
              isCompact={isCompact}
            />
          </Reveal>
          <div ref={tiersGridRef}>
            <Grid columns={{minWidth: 270}} gap={3}>
              {TIERS.map((tier, index) => (
                <div
                  key={tier.id}
                  style={{
                    ...revealStyle(tiersSeen, isReduced, index * 80),
                    height: '100%',
                  }}>
                  <div
                    className={tier.isFeatured ? undefined : 'cel-raise'}
                    style={{
                      ...styles.tierWrap,
                      ...(tier.isFeatured ? styles.tierWrapFeatured : null),
                      ...(tier.isFeatured && !isCompact
                        ? {transform: 'translateY(-10px)'}
                        : null),
                    }}>
                    <Card padding={5} height="100%">
                      <VStack gap={4}>
                        <VStack gap={1}>
                          <HStack gap={2} vAlign="center" wrap="wrap">
                            <Text type="label">{tier.name}</Text>
                            {tier.isSoldOut ? (
                              <Badge variant="error" label="Sold out" />
                            ) : null}
                            {tier.isFeatured ? (
                              <Badge variant="purple" label="Most popular" />
                            ) : null}
                          </HStack>
                          <span
                            style={{
                              ...styles.tierPrice,
                              ...(tier.isSoldOut
                                ? styles.tierPriceStruck
                                : null),
                            }}>
                            {tier.price}
                          </span>
                          <Text type="supporting" color="secondary">
                            {tier.priceNote}
                          </Text>
                          {tier.strikeNote != null ? (
                            <Badge variant="success" label={tier.strikeNote} />
                          ) : null}
                        </VStack>
                        <VStack gap={1}>
                          <ProgressBar
                            value={tier.seatsSold}
                            max={tier.seatsTotal}
                            label={`${tier.name} ${tier.seatsNoun} sold`}
                            isLabelHidden
                            variant={tier.isSoldOut ? 'neutral' : 'accent'}
                            isDisabled={tier.isSoldOut}
                          />
                          <Text type="supporting" color="secondary">
                            {tier.isSoldOut
                              ? `All ${tier.seatsTotal} ${tier.seatsNoun} gone — thank you!`
                              : `${tier.seatsTotal - tier.seatsSold} of ${tier.seatsTotal} ${tier.seatsNoun} left`}
                          </Text>
                        </VStack>
                        <VStack gap={2}>
                          {tier.features.map(feature => (
                            <CheckBullet key={feature} label={feature} />
                          ))}
                        </VStack>
                        <div style={{display: 'grid'}}>
                          <Button
                            label={tier.cta}
                            variant={tier.isFeatured ? 'primary' : 'secondary'}
                            size="md"
                            isDisabled={tier.isSoldOut}
                            onClick={() => pickTier(tier)}
                          />
                        </div>
                      </VStack>
                    </Card>
                  </div>
                </div>
              ))}
            </Grid>
          </div>
          {selectedTier !== null ? (
            <div style={{...styles.tierWrap, height: 'auto', boxShadow: SHADOW_FLOATING}}>
              <Card padding={5} style={{borderColor: ACCENT}}>
                {reserveForm.confirmedEmail === null ? (
                  <VStack gap={3}>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Icon icon={TicketIcon} size="sm" color="secondary" />
                      <Text type="label">
                        Reserve your {selectedTier.name} — {selectedTier.price}
                      </Text>
                      <StackItem size="fill">
                        <span />
                      </StackItem>
                      <Button
                        label="Cancel"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTierId(null)}
                      />
                    </HStack>
                    <Text type="supporting" color="secondary">
                      We’ll hold the{' '}
                      {selectedTier.id === 'team' ? 'pack' : 'seat'} for 48
                      hours and email you a payment link — no account needed.
                    </Text>
                    <div
                      style={{
                        ...styles.emailRow,
                        ...(isPhone ? styles.emailRowStacked : null),
                      }}>
                      <div style={styles.emailInput}>
                        <TextInput
                          label="Email for your ticket hold"
                          isLabelHidden
                          placeholder="you@team.example"
                          value={reserveForm.value}
                          onChange={value =>
                            setReserveForm({...reserveForm, value, error: null})
                          }
                        />
                      </div>
                      <Shine>
                        <Button
                          label="Hold my seat"
                          variant="primary"
                          size="md"
                          icon={
                            <Icon
                              icon={ArrowRightIcon}
                              size="sm"
                              color="inherit"
                            />
                          }
                          onClick={() =>
                            submitEmailForm(reserveForm, setReserveForm)
                          }
                        />
                      </Shine>
                    </div>
                    {reserveForm.error !== null ? (
                      <p style={styles.emailError}>{reserveForm.error}</p>
                    ) : null}
                  </VStack>
                ) : (
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <div style={styles.successDisc} aria-hidden="true">
                      <Icon icon={CheckIcon} size="sm" color="inherit" />
                    </div>
                    <StackItem size="fill">
                      <VStack gap={0}>
                        <Text type="label">
                          {selectedTier.name} held for 48 hours
                        </Text>
                        <Text type="supporting" color="secondary">
                          Payment link sent to {reserveForm.confirmedEmail}.
                          Not you?{' '}
                        </Text>
                      </VStack>
                    </StackItem>
                    <Button
                      label="Use a different email"
                      variant="ghost"
                      size="sm"
                      onClick={() => setReserveForm(EMPTY_EMAIL_FORM)}
                    />
                  </HStack>
                )}
              </Card>
            </div>
          ) : null}
        </VStack>
      </div>
    </section>
  );

  // ============= VENUE (pinned scroll story) =============

  const storyRail = (
    <div
      style={{
        ...styles.storyRail,
        ...(isCompact ? styles.storyRailStacked : null),
      }}>
      <div style={styles.railTrack} aria-hidden="true">
        <div
          style={{
            ...styles.railFill,
            transform: `scaleY(${railFillAmount.toFixed(3)})`,
          }}
        />
      </div>
      {TRAVEL_NOTES.map((note, index) => {
        const isActive = index === activeStep;
        return (
          <button
            key={note.id}
            type="button"
            aria-pressed={isActive}
            style={{
              ...styles.stepButton,
              ...(isActive ? styles.stepButtonActive : null),
            }}
            onClick={() => jumpToStoryStep(index)}>
            <span
              style={{
                ...styles.stepIndex,
                ...(isActive ? styles.stepIndexActive : null),
              }}
              aria-hidden="true">
              {pad2(index + 1)}
            </span>
            <span style={styles.travelGlyph} aria-hidden="true">
              <Icon icon={note.icon} size="sm" color="inherit" />
            </span>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {note.title}
              </Text>
              <Text type="supporting" color="secondary">
                {note.copy}
              </Text>
            </VStack>
          </button>
        );
      })}
    </div>
  );

  const storyMap = (
    <div style={styles.mapFrame}>
      <VenueMap
        activeStep={activeStep}
        drawProgress={isStoryPinned ? Math.min(1, storyProgress * 2) : 1}
      />
    </div>
  );

  const venueSection = (
    <section
      ref={registerSection('venue')}
      style={{...bandPad, ...styles.bandMuted, paddingBottom: isCompact ? 64 : 96}}
      aria-label="Venue and travel">
      <div style={columnStyle}>
        <Reveal isReduced={isReduced}>
          <VStack gap={3}>
            <SectionIntro
              eyebrow="Venue"
              title="A warehouse on the river"
              description={VENUE.blurb}
              align="start"
              isCompact={isCompact}
            />
            <HStack gap={2} vAlign="center">
              <Icon icon={MapPinIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                {VENUE.name} · {VENUE.address}
              </Text>
            </HStack>
          </VStack>
        </Reveal>
      </div>
      <div
        ref={storyScrollRef}
        style={{
          paddingBottom: isStoryPinned ? STORY_SCROLL : 0,
          marginTop: 'var(--spacing-6)',
        }}>
        <div
          style={{
            position: isStoryPinned ? 'sticky' : 'static',
            top: STORY_STAGE_TOP,
          }}>
          <div style={columnStyle}>
            <div
              style={{
                ...styles.storyStage,
                ...(isCompact ? styles.storyStageStacked : null),
              }}>
              {isCompact ? (
                <>
                  {storyMap}
                  {storyRail}
                </>
              ) : (
                <>
                  {storyRail}
                  {storyMap}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ============= SPONSORS =============

  const sponsorsSection = (
    <section
      ref={registerSection('sponsors')}
      style={bandPad}
      aria-label="Sponsors">
      <div style={columnStyle}>
        <VStack gap={6}>
          <Reveal isReduced={isReduced}>
            <SectionIntro
              eyebrow="Sponsors"
              title="The companies picking up the tab"
              description="Sponsorship keeps tickets under €600 and funds 40 scholarship seats. Thank you."
              isCompact={isCompact}
            />
          </Reveal>
          <div ref={sponsorsGridRef}>
            <VStack gap={5}>
              {SPONSOR_TIERS.map(group => (
                <VStack key={group.id} gap={2}>
                  <Text type="supporting" color="secondary">
                    {group.label}
                  </Text>
                  {group.id === 'community' && !isReduced ? (
                    <div className="cel-marquee" style={styles.marquee}>
                      <div className="cel-marquee-track">
                        {[0, 1].map(copy => (
                          <div
                            key={copy}
                            aria-hidden={copy === 1}
                            style={{display: 'flex', gap: 'var(--spacing-2)'}}>
                            {group.sponsors.map(sponsor => (
                              <div
                                key={sponsor.id}
                                style={{
                                  ...styles.sponsorTile,
                                  height: group.tileHeight,
                                  width: 190,
                                  flexShrink: 0,
                                }}>
                                <span
                                  style={{
                                    ...styles.sponsorMonogram,
                                    width: group.monogramSize,
                                    height: group.monogramSize,
                                    fontSize: Math.round(
                                      group.monogramSize * 0.42,
                                    ),
                                  }}
                                  aria-hidden="true">
                                  {sponsor.monogram}
                                </span>
                                <Text size="sm" weight="semibold">
                                  {sponsor.name}
                                </Text>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Grid columns={{minWidth: group.minWidth}} gap={2}>
                      {group.sponsors.map((sponsor, index) => (
                        <div
                          key={sponsor.id}
                          style={revealStyle(
                            sponsorsSeen,
                            isReduced,
                            index * 60,
                          )}>
                          <div
                            className="cel-raise"
                            style={{
                              ...styles.sponsorTile,
                              height: group.tileHeight,
                            }}>
                            <span
                              style={{
                                ...styles.sponsorMonogram,
                                width: group.monogramSize,
                                height: group.monogramSize,
                                fontSize: Math.round(group.monogramSize * 0.42),
                              }}
                              aria-hidden="true">
                              {sponsor.monogram}
                            </span>
                            <Text size="sm" weight="semibold">
                              {sponsor.name}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </Grid>
                  )}
                </VStack>
              ))}
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Button
                  label="Become a sponsor"
                  variant="secondary"
                  size="md"
                  icon={<Icon icon={MailIcon} size="sm" color="inherit" />}
                  onClick={() =>
                    fireToast(
                      'Sponsor prospectus — sent to sponsors@interfaceconf.example.',
                    )
                  }
                />
                <Text type="supporting" color="secondary">
                  Two Platinum slots left for 2026.
                </Text>
              </HStack>
            </VStack>
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= PAST EDITION (scheme-locked dark band) =============

  const pastSection = (
    <section
      ref={darkRef}
      style={{...bandPad, ...styles.darkBand}}
      aria-label="Past edition"
      onPointerMove={onDarkPointerMove}>
      <AuroraField
        blobs={[
          {
            size: 540,
            top: -200,
            right: -140,
            color: accentMix(70),
            opacity: 0.5,
            isAlt: true,
          },
          {size: 440, bottom: -180, left: -120, color: BLOOM_COOL, opacity: 0.4},
        ]}
      />
      <div style={styles.spotlight} aria-hidden="true" />
      <Grain />
      <div style={{...columnStyle, position: 'relative', zIndex: 1}}>
        <VStack gap={6}>
          <Reveal isReduced={isReduced}>
            <SectionIntro
              eyebrow="Interface 2025 · Porto"
              title="Last year, by the numbers"
              description="Our fourth edition sold out nine weeks early. Lisbon gives us 360 more seats — and a bigger rooftop."
              isCompact={isCompact}
            />
          </Reveal>
          <div ref={statsRef}>
            <Grid columns={{minWidth: isPhone ? 130 : 200}} gap={3}>
              {PAST_STATS.map((stat, index) => (
                <div
                  key={stat.id}
                  style={{
                    ...revealStyle(statsSeen, isReduced, index * 70),
                    height: '100%',
                  }}>
                  <StatCell
                    target={stat.target}
                    suffix={stat.suffix}
                    label={stat.label}
                    isActive={statsSeen}
                    isReduced={isReduced}
                    isPhone={isPhone}
                  />
                </div>
              ))}
            </Grid>
          </div>
          <div ref={collageRef}>
            <Grid columns={{minWidth: isPhone ? 150 : 200}} gap={2}>
              {COLLAGE_TILES.map((tile, index) => (
                <div
                  key={tile.id}
                  style={revealStyle(collageSeen, isReduced, index * 70)}>
                  <div
                    style={{
                      ...styles.collageTile,
                      ...accentArt(tile.angle, tile.mixA, tile.mixB),
                      minHeight: tile.span2 ? 168 : 120,
                    }}
                    role="img"
                    aria-label={`Photo placeholder: ${tile.caption}`}>
                    <span style={styles.collageCaption}>{tile.caption}</span>
                  </div>
                </div>
              ))}
            </Grid>
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= NEWSLETTER (floating card crossing into the footer) ====

  const newsletterSection = (
    <section
      style={{
        ...styles.newsBand,
        ...(isCompact ? styles.newsBandCompact : null),
      }}
      aria-label="Newsletter">
      <div style={columnStyle}>
        <Reveal isReduced={isReduced}>
          <div style={styles.newsCardWrap}>
            <Card padding={6}>
              <VStack gap={3} hAlign="center">
                <span style={styles.eyebrow}>Stay in the loop</span>
                <h2
                  style={{
                    ...styles.sectionTitle,
                    ...(isCompact ? styles.sectionTitleCompact : null),
                    textAlign: 'center',
                  }}>
                  Speaker news, first
                </h2>
                <Text type="supporting" color="secondary" justify="center">
                  One email a month: new speakers, agenda drops, and the
                  ticket lottery for sold-out tiers. No sponsor mail, ever.
                </Text>
                {newsForm.confirmedEmail === null ? (
                  <VStack gap={2} hAlign="center" width="100%">
                    <div
                      style={{
                        ...styles.emailRow,
                        ...(isPhone ? styles.emailRowStacked : null),
                        marginInline: 'auto',
                      }}>
                      <div style={styles.emailInput}>
                        <TextInput
                          label="Email for conference updates"
                          isLabelHidden
                          placeholder="you@studio.example"
                          value={newsForm.value}
                          onChange={value =>
                            setNewsForm({...newsForm, value, error: null})
                          }
                        />
                      </div>
                      <Shine>
                        <Button
                          label="Subscribe"
                          variant="primary"
                          size="md"
                          icon={<Icon icon={MailIcon} size="sm" color="inherit" />}
                          onClick={() => submitEmailForm(newsForm, setNewsForm)}
                        />
                      </Shine>
                    </div>
                    {newsForm.error !== null ? (
                      <p style={styles.emailError}>{newsForm.error}</p>
                    ) : null}
                  </VStack>
                ) : (
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <div style={styles.successDisc} aria-hidden="true">
                      <Icon icon={CheckIcon} size="sm" color="inherit" />
                    </div>
                    <VStack gap={0}>
                      <Text type="label">You’re on the list</Text>
                      <Text type="supporting" color="secondary">
                        Confirmation sent to {newsForm.confirmedEmail}
                      </Text>
                    </VStack>
                    <Button
                      label="Use a different email"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewsForm(EMPTY_EMAIL_FORM)}
                    />
                  </HStack>
                )}
              </VStack>
            </Card>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...columnStyle,
          paddingTop: 'calc(76px + var(--spacing-8))',
          paddingBottom: 'var(--spacing-7)',
        }}>
        <VStack gap={5}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-6)',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            <VStack gap={2}>
              <BrandMark />
              <Text type="supporting" color="secondary">
                {BRAND.dates} · {BRAND.venueShort}
              </Text>
              <HStack gap={2} vAlign="center">
                <Icon icon={MicIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  CFP for 2027 opens in November
                </Text>
              </HStack>
            </VStack>
            {FOOTER_GROUPS.map(group => (
              <VStack key={group.id} gap={1}>
                <Text type="label">{group.heading}</Text>
                {group.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    style={styles.footerLink}
                    onClick={() =>
                      link.anchor != null
                        ? jumpToSection(link.anchor)
                        : fireToast(`Footer — ${link.label} clicked.`)
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            ))}
          </div>
          <Divider />
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={UsersIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              Organized by the Interface Collective, a volunteer non-profit ·
              © 2026
            </Text>
            <StackItem size="fill">
              <span />
            </StackItem>
            <span style={{...styles.mono, color: 'var(--color-text-secondary)'}}>
              38.6970° N, 9.1955° W
            </span>
          </HStack>
        </VStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout height="fill">
        <LayoutContent padding={0}>
          <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
            {navbar}
            {hero}
            {speakersSection}
            {agendaSection}
            {ticketsSection}
            {venueSection}
            {sponsorsSection}
            {pastSection}
            {newsletterSection}
            {footer}
          </div>
        </LayoutContent>
      </Layout>
      {toast !== null ? (
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
      ) : null}
    </div>
  );
}
