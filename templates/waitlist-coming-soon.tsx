// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file waitlist-coming-soon.tsx
 * @input Deterministic fixtures only (the fictional "Foldline" spatial-notes
 *   pre-launch product: brand copy, a fixed waitlist position of 1,247 with a
 *   FLD-9QK2 referral code and a 50-spots-per-referral boost, three teaser
 *   feature blurbs of which two ship frosted behind "Revealing soon" veils,
 *   three dated launch milestones (Design done / Private beta current /
 *   Public launch upcoming), four social/follow rows, and minimal footer
 *   links). No Date.now, no randomness, no network assets.
 * @output Single-purpose pre-launch waitlist page, art-directed as a staged
 *   atmosphere piece: a sticky navbar that rides transparent over the hero
 *   and gains a tinted hairline surface (and loses a little height) after
 *   24px of scroll; a hero theater — aurora blobs + grain behind an
 *   oversized drifting gradient wordmark, flanked by three bobbing satellite
 *   mini-cards (waitlist metric chip, invite toast, and a mini spatial-notes
 *   canvas that deliberately bleeds across the section boundary into the
 *   next band) that parallax toward the pointer at wide widths — over a
 *   validating email capture. Valid submit flips the capture to a glass
 *   position card — "You're #1,247 in line" counts up — with a personal
 *   referral link + Copy button (copied feedback) and a working "Skip ahead"
 *   demo stepper: each +1 referral animates the position down 50 spots and
 *   refills a progress bar toward the next 100-place bracket, rolling the
 *   bracket over honestly. Below: an asymmetric 7/5 teaser band (one large
 *   revealed feature card with a composed canvas mock, two frosted cards
 *   stacked beside it), a pinned scroll-story roadmap (sticky stage inside a
 *   ~235vh container; scroll progress advances three clickable phases, fills
 *   the step rail, and draws an SVG fold path), a scheme-locked dark follow
 *   band with glass social cards and a pointer-tracked spotlight, and a
 *   minimal footer. The archetype is still restraint — the same five bands,
 *   just staged.
 * @position Page template; emitted by `astryx template waitlist-coming-soon`
 *
 * Frame: Layout height="fill", content-only — the page owns its own chrome,
 * so there is no LayoutHeader. LayoutContent (padding 0) hosts one scroll
 * container div; the navbar inside it is position:sticky top:0. A centered
 * 1060px column carries every band's content; the teaser, roadmap, and
 * follow bands paint full-bleed tints/darks behind it. Sections use real ids
 * (join / preview / roadmap / follow) and anchors smooth-scroll the
 * container with a sticky-nav allowance.
 *
 * Interaction contract:
 * - Nav anchors and the footer's Roadmap link smooth-scroll to their
 *   sections; the nav CTA scrolls to the hero and focuses the email input.
 *   The compact menu closes on Escape (refocusing its trigger), outside
 *   pointerdown, or any selection.
 * - The email form validates on submit (empty + format errors inline) and
 *   success swaps it for the position card; "Use a different email" resets.
 * - The Copy button attempts a guarded clipboard write and always shows a
 *   1.8s "Copied" confirmation; the +1 referral stepper is capped at 20
 *   demo referrals and disables with an honest hint.
 * - Roadmap phases are clickable buttons (they scroll the pinned container
 *   to that phase's scroll window); under reduced motion or compact widths
 *   the roadmap renders as a static meter instead.
 * - Frosted teaser cards are intentionally static (aria-hidden content with
 *   a visible "Revealing soon" chip); social and legal links are no-ops
 *   because they would leave the page.
 *
 * Motion policy (all transform/opacity/stroke-dashoffset only):
 * - Ambient: the wordmark's gradient drift (16s), two aurora blobs drifting
 *   on 38s/46s alternate keyframes, satellite bobs on independent 7-9.5s
 *   keyframes with negative delays, and the current-milestone pulse — every
 *   loop is disabled under prefers-reduced-motion.
 * - Pointer: satellites parallax ±9px toward the pointer over the hero
 *   (spring-ish transition; wide widths only, off under reduced motion);
 *   the dark band tracks a radial spotlight via --mx/--my custom props.
 * - Scroll: the navbar condenses after 24px; the roadmap's sticky stage
 *   maps container scroll progress to a phase index, rail fill, and an SVG
 *   fold path's stroke-dashoffset. Under reduced motion the roadmap is a
 *   static sequence and reveals render visible.
 * - Reveals: IntersectionObserver, fire once, 16px rise + .985 scale on a
 *   600ms decelerate bezier, children staggered ~80ms.
 * - The position number animates with requestAnimationFrame (~900ms
 *   ease-out cubic) and snaps to its target under reduced motion. Primary
 *   CTAs get a hover sheen sweep + 1px lift + .98 pressed scale (sheen and
 *   lifts removed under reduced motion).
 *
 * Color policy: token-pure except (1) the ONE quarantined brand accent
 * literal (see WCS_ACCENT with its contrast math; every tinted wash, glow,
 * aurora stop, and glass stroke below is a color-mix() derivation of that
 * single literal with scheme tokens, never a second accent literal),
 * (2) sanctioned hue-gradient ART on the wordmark and the three teaser art
 * tiles, whose stops are light-dark() pairs so the art keeps contrast in
 * both schemes, and (3) neutral black-based shadow tiers (rgba(0,0,0,…))
 * per the shared depth system. The follow band is scheme-locked by setting
 * colorScheme:'dark' so every light-dark() token inside resolves dark in
 * both app themes. NEVER var(--color-text) — it does not exist.
 *
 * Responsive contract (measured with a local ResizeObserver, not viewport
 * media queries — the inline demo stage is ~1045px wide):
 * - >920px: asymmetric 7/5 teaser split, pinned scroll roadmap, hero
 *   satellites + parallax on, social cards 4-up, nav links inline.
 * - <=920px: satellites hide, the teaser band stacks to one column, the
 *   roadmap becomes a static vertical rail, socials drop to 2-up.
 * - <=760px: nav links + CTA collapse behind a 40px menu button dropdown.
 * - <=560px: the email/referral rows stack their buttons full-width, the
 *   wordmark type ramp bottoms out, socials go 1-up, and section paddings
 *   tighten. The wordmark font-size is derived from measured width, so the
 *   page holds at 390px in the phone artboard with no overflow-x.
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
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowUpIcon,
  AtSignIcon,
  BoxesIcon,
  CheckIcon,
  CopyIcon,
  GlobeIcon,
  LayersIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  RadioIcon,
  RssIcon,
  SparklesIcon,
  UserPlusIcon,
  WaypointsIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined brand accent — the ONE allowed accent literal on this page.
 * Contrast math: #6D28D9 on the light body (near-white) is ~7.1:1 and
 * #C4B5FD on the dark body (near #131316) is ~10.2:1 — both clear WCAG AA
 * for text and UI affordances. Every accent-tinted wash, aurora stop, glow,
 * and glass stroke below is a color-mix() derivation of this same pair,
 * never a second literal.
 */
const WCS_ACCENT = 'light-dark(#6D28D9, #C4B5FD)';
const WCS_ACCENT_WASH = `color-mix(in srgb, ${WCS_ACCENT} 10%, transparent)`;
const WCS_ACCENT_WASH_SOFT = `color-mix(in srgb, ${WCS_ACCENT} 5%, transparent)`;
const WCS_ACCENT_BORDER = `color-mix(in srgb, ${WCS_ACCENT} 35%, transparent)`;
const WCS_ACCENT_GLOW = `color-mix(in srgb, ${WCS_ACCENT} 22%, transparent)`;

/**
 * Sanctioned hue-gradient ART (wordmark + teaser tiles). Each stop is a
 * light-dark() pair: deeper stops on the light scheme, brighter stops on
 * dark, so the clipped wordmark text stays readable in both.
 */
const WORDMARK_GRADIENT =
  'linear-gradient(100deg, ' +
  'light-dark(#6D28D9, #A78BFA) 0%, ' +
  'light-dark(#BE185D, #F472B6) 48%, ' +
  'light-dark(#B45309, #FBBF24) 100%)';

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
const GLASS_INSET = `inset 0 0 0 1px color-mix(in srgb, ${WCS_ACCENT} 16%, var(--color-border))`;

/** Grain texture: inline SVG feTurbulence data-URI, tiled at low opacity. */
const GRAIN_URI =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' ' +
  "width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.85' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' " +
  'filter=\'url(%23g)\'/%3E%3C/svg%3E")';

/** Sticky-nav height allowance for smooth-scroll targets. */
const NAV_ALLOWANCE = 68;

// Scoped CSS: ambient loops (wordmark drift, aurora, satellite bobs,
// milestone pulse), reveal choreography, card lifts, and CTA sheens — all
// gated by prefers-reduced-motion (reveals render visible, loops static).
const SCOPE = 'wcs-root';
const TEMPLATE_CSS = `
@keyframes wcs-drift {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.${SCOPE} .wcs-wordmark {
  background-size: 220% 220%;
  animation: wcs-drift 16s ease-in-out infinite alternate;
}
@keyframes wcs-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.72); }
}
.${SCOPE} .wcs-pulse {
  animation: wcs-pulse 1.8s ease-in-out infinite;
}
@keyframes wcs-aurora-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(70px, -50px, 0) scale(1.15); }
}
@keyframes wcs-aurora-b {
  0% { transform: translate3d(0, 0, 0) scale(1.05); }
  100% { transform: translate3d(-60px, 44px, 0) scale(0.92); }
}
.${SCOPE} .wcs-aurora-a {
  animation: wcs-aurora-a 38s ease-in-out infinite alternate;
}
.${SCOPE} .wcs-aurora-b {
  animation: wcs-aurora-b 46s ease-in-out infinite alternate;
}
@keyframes wcs-bob {
  0%, 100% { transform: translateY(-6px); }
  50% { transform: translateY(6px); }
}
.${SCOPE} .wcs-bob {
  animation: wcs-bob 8s ease-in-out infinite;
}
.${SCOPE} .wcs-reveal {
  opacity: 0;
  transform: translateY(16px) scale(0.985);
  transition:
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.${SCOPE} .wcs-reveal[data-shown='true'] {
  opacity: 1;
  transform: none;
}
.${SCOPE} .wcs-lift {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.${SCOPE} .wcs-lift:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 0 1px ${WCS_ACCENT_BORDER},
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 24px 48px -24px rgba(0, 0, 0, 0.3);
}
.${SCOPE} .wcs-cta {
  position: relative;
  display: inline-flex;
  transition: transform 0.22s ease;
}
.${SCOPE} .wcs-cta:hover { transform: translateY(-1px); }
.${SCOPE} .wcs-cta:active { transform: translateY(0) scale(0.98); }
.${SCOPE} .wcs-sheen {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  overflow: hidden;
  pointer-events: none;
}
.${SCOPE} .wcs-sheen::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-130%);
  background: linear-gradient(
    105deg,
    transparent 38%,
    color-mix(in srgb, var(--color-on-accent) 32%, transparent) 50%,
    transparent 62%
  );
  transition: transform 0.7s ease;
}
.${SCOPE} .wcs-cta:hover .wcs-sheen::after { transform: translateX(130%); }
@keyframes wcs-stage-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.${SCOPE} .wcs-stage-in {
  animation: wcs-stage-in 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .wcs-wordmark,
  .${SCOPE} .wcs-pulse,
  .${SCOPE} .wcs-aurora-a,
  .${SCOPE} .wcs-aurora-b,
  .${SCOPE} .wcs-bob,
  .${SCOPE} .wcs-stage-in {
    animation: none;
  }
  .${SCOPE} .wcs-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .${SCOPE} .wcs-cta,
  .${SCOPE} .wcs-lift {
    transition: none;
  }
  .${SCOPE} .wcs-cta:hover,
  .${SCOPE} .wcs-cta:active,
  .${SCOPE} .wcs-lift:hover {
    transform: none;
  }
  .${SCOPE} .wcs-sheen::after { display: none; }
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
    maxWidth: 1060,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  // ---- sticky navbar (transparent at top → tinted surface after 24px) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: SHADOW_RAISED,
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1060,
    marginInline: 'auto',
    boxSizing: 'border-box',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    transition: 'padding 0.3s ease',
  },
  navInnerScrolled: {
    paddingBlock: 6,
  },
  logoTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    // Brand mark rides the sanctioned wordmark art gradient.
    backgroundImage: WORDMARK_GRADIENT,
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
  // ---- eyebrow chips (11px tracked uppercase) ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 12px',
    borderRadius: 999,
    border: `1px solid ${WCS_ACCENT_BORDER}`,
    backgroundColor: WCS_ACCENT_WASH_SOFT,
    color: WCS_ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: WCS_ACCENT,
    flexShrink: 0,
  },
  sectionHeading: {
    margin: 0,
    fontSize: 38,
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-text-primary)',
  },
  sectionHeadingCompact: {
    fontSize: 30,
  },
  // ---- hero theater ----
  heroBand: {
    position: 'relative',
  },
  auroraClip: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    // Aurora stops are accent color-mixed with scheme hue tokens.
    opacity: 0.5,
  },
  grainLayer: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URI,
    backgroundRepeat: 'repeat',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  hero: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
    paddingBlock: '96px 116px',
  },
  heroCompact: {
    paddingBlock: '52px 60px',
  },
  wordmarkStage: {
    // Counter-parallax: drifts gently opposite the satellites.
    transform:
      'translate(calc(var(--px, 0) * -4px), calc(var(--py, 0) * -3px))',
    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  wordmark: {
    margin: 0,
    fontWeight: 800,
    letterSpacing: '-0.035em',
    lineHeight: 1.0,
    backgroundImage: WORDMARK_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
  },
  teaserLine: {
    fontSize: 19,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  teaserLineCompact: {
    fontSize: 16,
  },
  // ---- hero satellites (wide widths only) ----
  satelliteLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transform: 'translate(calc(var(--px, 0) * 9px), calc(var(--py, 0) * 7px))',
    transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  satellite: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 92%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_FLOATING}`,
    padding: '10px 14px',
    textAlign: 'left',
  },
  satAvatar: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    flexShrink: 0,
  },
  satTitle: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  satCaption: {
    fontSize: 11,
    lineHeight: 1.3,
    color: 'var(--color-text-secondary)',
  },
  satAccent: {
    fontSize: 12,
    fontWeight: 700,
    color: WCS_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-success)',
    flexShrink: 0,
  },
  // ---- mini spatial-notes canvas mock (satellite + revealed card) ----
  miniCanvas: {
    position: 'relative',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    backgroundImage:
      'radial-gradient(var(--color-border) 1px, transparent 1px)',
    backgroundSize: '18px 18px',
    overflow: 'hidden',
  },
  miniNote: {
    position: 'absolute',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  miniNoteBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
  },
  miniNoteBarAccent: {
    height: 5,
    borderRadius: 3,
    backgroundColor: WCS_ACCENT_WASH,
    boxShadow: `inset 0 0 0 1px ${WCS_ACCENT_BORDER}`,
  },
  foldChip: {
    position: 'absolute',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    borderRadius: 999,
    backgroundColor: WCS_ACCENT,
    color: 'var(--color-background-body)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    boxShadow: SHADOW_RAISED,
  },
  // ---- email capture / position card ----
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
  },
  emailInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  emailError: {
    fontSize: 13,
    margin: 0,
    color: 'var(--color-error)',
  },
  positionCard: {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    boxSizing: 'border-box',
    borderRadius: 16,
    backgroundColor: `color-mix(in srgb, ${WCS_ACCENT} 5%, var(--color-background-card))`,
    boxShadow: `${GLASS_INSET}, ${SHADOW_FLOATING}`,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    textAlign: 'left',
  },
  positionNumber: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: WCS_ACCENT,
  },
  positionNumberCompact: {
    fontSize: 34,
  },
  referralField: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
    flex: '1 1 0',
    height: 40,
    paddingInline: 12,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  skipAheadBox: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // ---- bands + section rhythm ----
  bandTinted: {
    position: 'relative',
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  section: {
    paddingBlock: 112,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  sectionMid: {
    paddingBlock: 88,
  },
  sectionCompact: {
    paddingBlock: 64,
    gap: 'var(--spacing-5)',
  },
  // ---- teaser band (asymmetric 7/5 split) ----
  teaserSplit: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
  },
  teaserSplitStacked: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  teaserCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minHeight: 180,
    boxSizing: 'border-box',
  },
  teaserArt: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-background-body)',
    flexShrink: 0,
    boxShadow: SHADOW_RAISED,
  },
  frostedContent: {
    filter: 'blur(6px)',
    opacity: 0.6,
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  frostedOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frostedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 999,
    border: `1px solid ${WCS_ACCENT_BORDER}`,
    backgroundColor: 'var(--color-background-body)',
    color: WCS_ACCENT,
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    boxShadow: SHADOW_RAISED,
  },
  // ---- roadmap scroll story ----
  pinStage: {
    position: 'sticky',
    top: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(var(--color-border) 1px, transparent 1px)',
    backgroundSize: '26px 26px',
    opacity: 0.55,
    maskImage:
      'radial-gradient(75% 70% at 50% 45%, black 0%, transparent 100%)',
    WebkitMaskImage:
      'radial-gradient(75% 70% at 50% 45%, black 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  storyGrid: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
    width: '100%',
  },
  phaseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
    transition: 'background-color 0.25s ease, opacity 0.25s ease',
  },
  phaseNumeral: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: `color-mix(in srgb, ${WCS_ACCENT} 24%, transparent)`,
    width: 56,
    flexShrink: 0,
  },
  phaseRail: {
    position: 'relative',
    width: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    alignSelf: 'stretch',
    marginLeft: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  phaseRailFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: WCS_ACCENT,
    borderRadius: 2,
  },
  stageCard: {
    position: 'relative',
    borderRadius: 18,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_FLOATING}`,
    padding: 'var(--spacing-6)',
    overflow: 'hidden',
    minHeight: 320,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  stageWatermark: {
    position: 'absolute',
    top: -18,
    right: 8,
    fontSize: 148,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: `color-mix(in srgb, ${WCS_ACCENT} 8%, transparent)`,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  // ---- static roadmap meters (compact / reduced motion) ----
  meterRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
  },
  meterCell: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  meterTrack: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  meterNode: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  meterNodeDone: {
    backgroundColor: WCS_ACCENT,
    color: 'var(--color-background-body)',
  },
  meterNodeCurrent: {
    border: `2px solid ${WCS_ACCENT}`,
    backgroundColor: WCS_ACCENT_WASH,
  },
  meterNodeUpcoming: {
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  meterDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: WCS_ACCENT,
  },
  meterConnector: {
    flex: '1 1 0',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  meterConnectorFill: {
    height: '100%',
    backgroundColor: WCS_ACCENT,
  },
  meterCellVertical: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  meterRailVertical: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  meterConnectorVertical: {
    width: 3,
    flex: '1 1 12px',
    minHeight: 24,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
  },
  // ---- follow band (scheme-locked dark glass) ----
  darkBand: {
    position: 'relative',
    colorScheme: 'dark',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    borderBlock: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  darkGlow: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      `radial-gradient(46% 60% at 12% 0%, ${WCS_ACCENT_GLOW}, transparent 70%), ` +
      `radial-gradient(40% 55% at 88% 100%, color-mix(in srgb, ${WCS_ACCENT} 14%, var(--color-icon-pink)) 0%, transparent 62%)`,
    opacity: 0.55,
    pointerEvents: 'none',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, ${WCS_ACCENT} 13%, transparent), transparent 70%)`,
    pointerEvents: 'none',
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  socialGridMid: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  socialGridPhone: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  socialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 64,
    paddingInline: 14,
    borderRadius: 14,
    border: 'none',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 72%, transparent)',
    boxShadow: `${GLASS_INSET}, ${SHADOW_RAISED}`,
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  socialGlyph: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: WCS_ACCENT_WASH,
    color: WCS_ACCENT,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    paddingBlock: 'var(--spacing-6)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  monoNote: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Foldline pre-launch page.

const BRAND = {
  name: 'Foldline',
  descriptor: 'Spatial notes',
  teaser:
    'Notes that live in space, not in a list. Lay your thinking out on an ' +
    'infinite canvas that folds back into clean, linear documents.',
  finePrint: '2,318 people in line · two emails total, ever · no spam',
  launchTag: 'Private beta rolling out now',
};

type SectionId = 'join' | 'preview' | 'roadmap' | 'follow';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'preview', label: 'Preview'},
  {id: 'roadmap', label: 'Roadmap'},
  {id: 'follow', label: 'Follow'},
];

const WAITLIST = {
  startPosition: 1247,
  referralBoost: 50,
  referralLink: 'foldline.app/r/FLD-9QK2',
  maxDemoReferrals: 20,
};

interface Teaser {
  id: string;
  title: string;
  blurb: string;
  icon: Glyph;
  /** Sanctioned hue-gradient art tile; light-dark stops for both schemes. */
  gradient: string;
  isRevealed: boolean;
}

const TEASERS: readonly Teaser[] = [
  {
    id: 'canvas',
    title: 'Infinite canvas, real structure',
    blurb:
      'Drop notes anywhere. Foldline tracks the spatial relationships and ' +
      'folds any region back into an ordered outline when you need one.',
    icon: LayersIcon,
    gradient:
      'linear-gradient(135deg, light-dark(#6D28D9, #A78BFA), light-dark(#4338CA, #818CF8))',
    isRevealed: true,
  },
  {
    id: 'threads',
    title: 'Threads between thoughts',
    blurb:
      'Link two notes and Foldline keeps the thread alive across every ' +
      'fold, export, and rearrangement — citations included.',
    icon: WaypointsIcon,
    gradient:
      'linear-gradient(135deg, light-dark(#BE185D, #F472B6), light-dark(#9D174D, #FB7185))',
    isRevealed: false,
  },
  {
    id: 'rooms',
    title: 'Rooms for teams',
    blurb:
      'Share a region of your canvas as a room. Guests see only the fold ' +
      'you opened, never the mess behind it.',
    icon: BoxesIcon,
    gradient:
      'linear-gradient(135deg, light-dark(#B45309, #FBBF24), light-dark(#92400E, #F59E0B))',
    isRevealed: false,
  },
];

interface Milestone {
  id: string;
  label: string;
  date: string;
  note: string;
  state: 'done' | 'current' | 'upcoming';
}

const MILESTONES: readonly Milestone[] = [
  {
    id: 'design',
    label: 'Design',
    date: 'Shipped Feb 2026',
    note: 'Canvas engine, fold model, and the whole visual language.',
    state: 'done',
  },
  {
    id: 'beta',
    label: 'Private beta',
    date: 'Rolling out · Jun 2026',
    note: 'First 400 seats are in. Waitlist invites go out weekly.',
    state: 'current',
  },
  {
    id: 'launch',
    label: 'Public launch',
    date: 'Targeting Oct 9, 2026',
    note: 'Free tier plus paid rooms. Waitlist members get 3 months free.',
    state: 'upcoming',
  },
];

const SOCIALS: readonly {
  id: string;
  label: string;
  handle: string;
  icon: Glyph;
}[] = [
  {id: 'social', label: 'Social', handle: '@foldline', icon: AtSignIcon},
  {id: 'buildlog', label: 'Build log', handle: 'Every Friday', icon: RssIcon},
  {id: 'radio', label: 'Beta radio', handle: 'Monthly demo call', icon: RadioIcon},
  {id: 'site', label: 'Manifesto', handle: 'foldline.app/why', icon: GlobeIcon},
];

const FOOTER_LINKS: readonly string[] = ['Privacy', 'Terms', 'Press'];

/** Fold path drawn by scroll progress on the roadmap stage (pathLength=1). */
const FOLD_PATH = 'M8 150 L82 52 L152 138 L226 36 L306 112';

// ============= HELPERS =============

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to hold a spot.';
  }
  if (!EMAIL_RE.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/** Guarded clipboard write: fine to no-op in sandboxed frames. */
function copyToClipboard(text: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
    void navigator.clipboard.writeText(text).catch(() => undefined);
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Reactive reduced-motion preference (gates parallax + the pinned story). */
function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setIsReduced(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/**
 * Measured page size (ResizeObserver) — see Responsive contract. Width
 * drives the breakpoint tiers; height sizes the pinned roadmap stage.
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

/**
 * Fires once when the node scrolls into view; falls back to "visible" when
 * IntersectionObserver is unavailable so nothing stays hidden statically.
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
      {threshold: 0.25},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases the displayed number from its previous value to `target` with
 * requestAnimationFrame while `isActive`; the first activation counts up
 * from 0. Reduced motion (and rAF-less environments) snap to the target.
 */
function useAnimatedNumber(
  target: number,
  isActive: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (!isActive) {
      fromRef.current = 0;
      setValue(0);
      return undefined;
    }
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      fromRef.current = target;
      setValue(target);
      return undefined;
    }
    const from = fromRef.current;
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      // ease-out cubic: fast start, gentle landing on the fixture value.
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, durationMs]);
  return Math.round(value);
}

// ============= SMALL PIECES =============

/** Foldline logomark: gradient fold tile + wordmark text. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={LayersIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );
}

/** 11px tracked-uppercase eyebrow chip; optional pulsing status dot. */
function Eyebrow({label, hasDot = false}: {label: string; hasDot?: boolean}) {
  return (
    <span style={styles.eyebrow}>
      {hasDot && (
        <span className="wcs-pulse" style={styles.eyebrowDot} aria-hidden="true" />
      )}
      {label}
    </span>
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

/** Sheen-sweep wrapper for primary CTAs (lift + pressed scale via CSS). */
function CtaSheen({children}: {children: React.ReactNode}) {
  return (
    <span className="wcs-cta">
      {children}
      <span className="wcs-sheen" aria-hidden="true" />
    </span>
  );
}

/**
 * Rise+fade+settle scroll reveal; fires once, renders visible on reduced
 * motion. Stagger siblings with 80ms delay steps.
 */
function Reveal({
  children,
  delayMs = 0,
}: {
  children: React.ReactNode;
  delayMs?: number;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="wcs-reveal"
      data-shown={inView}
      style={{transitionDelay: `${delayMs}ms`}}>
      {children}
    </div>
  );
}

/**
 * Mini spatial-notes canvas mock — composed from real layout (dot-grid
 * board, two note cards with text bars, a connecting thread, a fold chip),
 * not a gray rectangle. Used in the hero satellite and the revealed teaser.
 */
function MiniCanvas({height = 130}: {height?: number}) {
  return (
    <div style={{...styles.miniCanvas, height}} aria-hidden="true">
      <svg
        viewBox="0 0 240 130"
        preserveAspectRatio="none"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <path
          d="M74 44 C 110 20, 138 92, 172 70"
          fill="none"
          stroke={WCS_ACCENT}
          strokeWidth={1.6}
          strokeDasharray="4 4"
          opacity={0.8}
        />
        <circle cx={74} cy={44} r={3} fill={WCS_ACCENT} />
        <circle cx={172} cy={70} r={3} fill={WCS_ACCENT} />
      </svg>
      <div style={{...styles.miniNote, left: '8%', top: 16, width: '30%'}}>
        <div style={{...styles.miniNoteBarAccent, width: '72%'}} />
        <div style={{...styles.miniNoteBar, width: '100%'}} />
        <div style={{...styles.miniNoteBar, width: '58%'}} />
      </div>
      <div style={{...styles.miniNote, right: '10%', top: 48, width: '34%'}}>
        <div style={{...styles.miniNoteBar, width: '84%'}} />
        <div style={{...styles.miniNoteBar, width: '64%'}} />
      </div>
      <span style={{...styles.foldChip, left: '8%', bottom: 10}}>
        <Icon icon={LayersIcon} size="xsm" color="inherit" />
        Fold to outline
      </span>
    </div>
  );
}

/** One teaser card; frosted variant hides its copy behind a veil chip. */
function TeaserCard({
  teaser,
  isFeature = false,
}: {
  teaser: Teaser;
  isFeature?: boolean;
}) {
  const body = (
    <>
      <div
        style={{...styles.teaserArt, backgroundImage: teaser.gradient}}
        aria-hidden="true">
        <Icon icon={teaser.icon} size="sm" color="inherit" />
      </div>
      <VStack gap={1}>
        <Text type="label">{teaser.title}</Text>
        <Text type="supporting" color="secondary">
          {teaser.blurb}
        </Text>
      </VStack>
    </>
  );
  if (teaser.isRevealed) {
    return (
      <div
        className="wcs-lift"
        style={{...styles.teaserCard, ...(isFeature ? {height: '100%'} : null)}}>
        {body}
        {isFeature && (
          <div style={{marginTop: 'auto'}}>
            <MiniCanvas height={150} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={styles.teaserCard} aria-label="Feature revealing soon">
      <div style={styles.frostedContent} aria-hidden="true">
        {body}
      </div>
      <div style={styles.frostedOverlay}>
        <span style={styles.frostedChip}>
          <Icon icon={LockIcon} size="xsm" color="inherit" />
          Revealing soon
        </span>
      </div>
    </div>
  );
}

/** One milestone node glyph: done check / current pulse / upcoming ring. */
function MilestoneNode({state}: {state: Milestone['state']}) {
  if (state === 'done') {
    return (
      <div style={{...styles.meterNode, ...styles.meterNodeDone}}>
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div style={{...styles.meterNode, ...styles.meterNodeCurrent}}>
        <span className="wcs-pulse" style={styles.meterDot} />
      </div>
    );
  }
  return <div style={{...styles.meterNode, ...styles.meterNodeUpcoming}} />;
}

function MilestoneCopy({milestone}: {milestone: Milestone}) {
  return (
    <VStack gap={0}>
      <Text type="label">{milestone.label}</Text>
      <Text type="supporting" color="secondary">
        {milestone.date}
      </Text>
      <Text type="supporting" color="secondary">
        {milestone.note}
      </Text>
    </VStack>
  );
}

// ============= PAGE =============

export default function WaitlistComingSoonTemplate() {
  // ---- measured responsive breakpoints (see Responsive contract) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const {width: pageWidth, height: stageHeight} = useElementSize(wrapRef);
  const isMid = pageWidth > 0 && pageWidth <= 920;
  const isNavCompact = pageWidth > 0 && pageWidth <= 760;
  const isPhone = pageWidth > 0 && pageWidth <= 560;
  const isMotionReduced = useReducedMotion();

  // Wordmark type ramp derives from measured width so 390px holds.
  const wordmarkSize =
    pageWidth > 0
      ? Math.round(Math.min(126, Math.max(54, pageWidth * 0.108)))
      : 104;

  // ---- nav / smooth scroll ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // ---- hero parallax (satellites toward pointer, wordmark counter) ----
  const heroParallaxRef = useRef<HTMLDivElement | null>(null);
  const showSatellites = !isMid;
  const isParallaxOn = showSatellites && !isMotionReduced;

  const onHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const stage = heroParallaxRef.current;
    if (!isParallaxOn || stage == null) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    stage.style.setProperty('--px', nx.toFixed(3));
    stage.style.setProperty('--py', ny.toFixed(3));
  };

  const onHeroPointerLeave = () => {
    const stage = heroParallaxRef.current;
    if (stage == null) {
      return;
    }
    stage.style.setProperty('--px', '0');
    stage.style.setProperty('--py', '0');
  };

  // ---- pinned roadmap scroll story ----
  const pinRef = useRef<HTMLElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const isPinned = !isMid && !isMotionReduced && stageHeight > 320;
  const activePhase = Math.min(2, Math.floor(storyProgress * 3));

  // One rAF-throttled scroll listener drives the condensing navbar and the
  // roadmap story progress (both transform/opacity consumers).
  useEffect(() => {
    const page = pageRef.current;
    if (page == null) {
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsNavScrolled(page.scrollTop > 24);
      const pin = pinRef.current;
      if (pin != null && isPinned) {
        const range = pin.offsetHeight - stageHeight;
        if (range > 0) {
          const raw = (page.scrollTop - pin.offsetTop) / range;
          setStoryProgress(Math.min(1, Math.max(0, raw)));
        }
      }
    };
    const onScroll = () => {
      if (frame === 0 && typeof requestAnimationFrame === 'function') {
        frame = requestAnimationFrame(update);
      }
    };
    page.addEventListener('scroll', onScroll, {passive: true});
    update();
    return () => {
      page.removeEventListener('scroll', onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [isPinned, stageHeight]);

  // ---- email capture → position card ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [joinedEmail, setJoinedEmail] = useState<string | null>(null);

  // ---- referral demo stepper ----
  const [referrals, setReferrals] = useState(0);
  const position = Math.max(
    1,
    WAITLIST.startPosition - referrals * WAITLIST.referralBoost,
  );
  const displayedPosition = useAnimatedNumber(position, joinedEmail !== null);
  const isDemoCapped = referrals >= WAITLIST.maxDemoReferrals;

  // Bracket math for the "next 100" progress bar: from #1,247 the next
  // 100-place bracket is #1,200 (47 spots away → 53% filled). Crossing a
  // bracket rolls the target over honestly (e.g. #1,197 → chasing #1,100).
  const bracketTarget = Math.max(0, Math.floor((position - 1) / 100) * 100);
  const spotsToBracket = position - bracketTarget;
  const bracketProgress = 100 - spotsToBracket;

  // ---- copy feedback ----
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [isCopied]);

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
  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: id === 'join' ? 0 : section.offsetTop - NAV_ALLOWANCE,
      behavior: 'smooth',
    });
  };

  const jumpToJoin = () => {
    jumpToSection('join');
    emailInputRef.current?.focus();
  };

  /** Roadmap phases are buttons: scroll the pinned container to a phase. */
  const jumpToPhase = (index: number) => {
    const page = pageRef.current;
    const pin = pinRef.current;
    if (page == null || pin == null || !isPinned) {
      return;
    }
    const range = pin.offsetHeight - stageHeight;
    const target = pin.offsetTop + ((index + 0.5) / 3) * range;
    page.scrollTo({top: target, behavior: 'smooth'});
  };

  const submitEmail = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setJoinedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  const resetJoin = () => {
    setJoinedEmail(null);
    setReferrals(0);
  };

  /** Pointer-tracked spotlight on the dark band (static center otherwise). */
  const onDarkPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isMotionReduced) {
      return;
    }
    const band = event.currentTarget;
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', `${Math.round(event.clientX - rect.left)}px`);
    band.style.setProperty('--my', `${Math.round(event.clientY - rect.top)}px`);
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const columnStyle = {
    ...styles.column,
    ...(isPhone ? styles.columnCompact : null),
  };
  const sectionStyle = {
    ...styles.section,
    ...(isMid ? styles.sectionMid : null),
    ...(isPhone ? styles.sectionCompact : null),
  };
  const headingStyle = {
    ...styles.sectionHeading,
    ...(isPhone ? styles.sectionHeadingCompact : null),
  };

  // ============= NAVBAR =============

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isNavScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Foldline">
      <div
        style={{
          ...styles.navInner,
          ...(isNavScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCompact && (
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
            <CtaSheen>
              <Button
                label="Join the waitlist"
                variant="primary"
                size="md"
                onClick={jumpToJoin}
              />
            </CtaSheen>
          </HStack>
        )}
        {isNavCompact && (
          <IconButton40
            label={isMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isMenuOpen}
            buttonRef={menuTriggerRef}
            onClick={() => setIsMenuOpen(open => !open)}
          />
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
              <Button
                label="Join the waitlist"
                variant="primary"
                size="md"
                onClick={jumpToJoin}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const emailCapture = (
    <VStack gap={2} hAlign="center" style={{width: '100%'}}>
      <div
        style={{
          ...styles.emailRow,
          ...(isPhone ? styles.emailRowStacked : null),
        }}>
        <div style={styles.emailInput}>
          <TextInput
            ref={emailInputRef}
            type="email"
            label="Email address"
            isLabelHidden
            placeholder="you@example.com"
            value={email}
            status={emailError !== null ? {type: 'error'} : undefined}
            onChange={value => {
              setEmail(value);
              setEmailError(null);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                submitEmail();
              }
            }}
          />
        </div>
        <CtaSheen>
          <Button
            label="Join the waitlist"
            variant="primary"
            icon={<Icon icon={SparklesIcon} size="sm" color="inherit" />}
            onClick={submitEmail}
          />
        </CtaSheen>
      </div>
      {emailError !== null && (
        <p style={styles.emailError} role="alert">
          {emailError}
        </p>
      )}
      <Text type="supporting" color="secondary">
        {BRAND.finePrint}
      </Text>
    </VStack>
  );

  const positionCard = (
    // No aria-live here: the rAF count-up would announce every frame.
    <div style={styles.positionCard}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {`You're in, ${joinedEmail ?? ''} — current spot`}
        </Text>
        <span
          style={{
            ...styles.positionNumber,
            ...(isPhone ? styles.positionNumberCompact : null),
          }}>
          #{displayedPosition.toLocaleString('en-US')} in line
        </span>
      </VStack>

      {/* Personal referral link + guarded copy with confirmation. */}
      <div
        style={{
          ...styles.emailRow,
          maxWidth: 'none',
          ...(isPhone ? styles.emailRowStacked : null),
        }}>
        <div style={styles.referralField}>
          <Icon icon={LinkIcon} size="xsm" color="inherit" />
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {WAITLIST.referralLink}
          </span>
        </div>
        <Button
          label={isCopied ? 'Copied' : 'Copy link'}
          variant="secondary"
          icon={
            <Icon
              icon={isCopied ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => {
            copyToClipboard(`https://${WAITLIST.referralLink}`);
            setIsCopied(true);
          }}
        />
      </div>

      {/* Skip-ahead explainer + interactive demo stepper. */}
      <div style={styles.skipAheadBox}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ArrowUpIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text size="sm" weight="semibold">
              Skip ahead — every referral moves you up{' '}
              {WAITLIST.referralBoost} spots
            </Text>
          </StackItem>
        </HStack>
        <ProgressBar
          value={bracketProgress}
          max={100}
          label={`Progress toward #${bracketTarget.toLocaleString('en-US')}`}
          hasValueLabel
          formatValueLabel={() =>
            `${spotsToBracket} spot${spotsToBracket === 1 ? '' : 's'} to go`
          }
          variant="accent"
        />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="+1 referral (demo)"
            variant="secondary"
            size="md"
            isDisabled={isDemoCapped}
            icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />}
            onClick={() =>
              setReferrals(count =>
                Math.min(WAITLIST.maxDemoReferrals, count + 1),
              )
            }
          />
          <Text type="supporting" color="secondary">
            {isDemoCapped
              ? 'Demo capped — invite real friends to go further.'
              : `${referrals} simulated referral${referrals === 1 ? '' : 's'}`}
          </Text>
        </HStack>
      </div>

      <button type="button" style={styles.footerLink} onClick={resetJoin}>
        Use a different email
      </button>
    </div>
  );

  // Floating satellite mini-cards: independent bob loops (negative delays),
  // shared pointer parallax. The canvas satellite deliberately hangs past
  // the hero's bottom edge into the tinted preview band (boundary cross).
  const satellites = (
    <div
      ref={heroParallaxRef}
      style={styles.satelliteLayer}
      aria-hidden="true">
      <div style={{...styles.satellite, left: '2%', top: '20%'}}>
        <div className="wcs-bob" style={{animationDelay: '-2s'}}>
          <HStack gap={2} vAlign="center">
            <HStack gap={0} vAlign="center">
              {[
                {initials: 'AK', tone: 'var(--color-background-purple)'},
                {initials: 'RM', tone: 'var(--color-background-pink)'},
                {initials: 'JT', tone: 'var(--color-background-cyan)'},
              ].map((member, index) => (
                <span
                  key={member.initials}
                  style={{
                    ...styles.satAvatar,
                    backgroundColor: member.tone,
                    marginLeft: index === 0 ? 0 : -7,
                  }}>
                  {member.initials}
                </span>
              ))}
            </HStack>
            <VStack gap={0}>
              <span style={styles.satTitle}>2,318 in line</span>
              <span style={styles.satCaption}>invites go out weekly</span>
            </VStack>
          </HStack>
        </div>
      </div>
      <div style={{...styles.satellite, right: '1%', top: '38%'}}>
        <div
          className="wcs-bob"
          style={{animationDelay: '-5s', animationDuration: '9.5s'}}>
          <HStack gap={2} vAlign="center">
            <span style={styles.successDot} />
            <VStack gap={0}>
              <span style={styles.satTitle}>Rae accepted your invite</span>
              <span style={styles.satAccent}>+50 spots</span>
            </VStack>
          </HStack>
        </div>
      </div>
      <div
        style={{
          ...styles.satellite,
          right: '6%',
          bottom: -56,
          width: 236,
          padding: 10,
          zIndex: 5,
        }}>
        <div
          className="wcs-bob"
          style={{animationDelay: '-3.5s', animationDuration: '7s'}}>
          <MiniCanvas height={104} />
        </div>
      </div>
    </div>
  );

  const hero = (
    <div
      style={styles.heroBand}
      onPointerMove={isParallaxOn ? onHeroPointerMove : undefined}
      onPointerLeave={isParallaxOn ? onHeroPointerLeave : undefined}>
      {/* Aurora field + grain live in their own clipped layer so the
          boundary-crossing satellite can still overhang the band edge. */}
      <div style={styles.auroraClip} aria-hidden="true">
        <div
          className="wcs-aurora-a"
          style={{
            ...styles.auroraBlob,
            width: 520,
            height: 520,
            left: '-8%',
            top: '-22%',
            background: `radial-gradient(closest-side, color-mix(in srgb, ${WCS_ACCENT} 58%, var(--color-icon-cyan)) 0%, transparent 70%)`,
          }}
        />
        <div
          className="wcs-aurora-b"
          style={{
            ...styles.auroraBlob,
            width: 460,
            height: 460,
            right: '-10%',
            top: '-6%',
            background: `radial-gradient(closest-side, color-mix(in srgb, ${WCS_ACCENT} 55%, var(--color-icon-pink)) 0%, transparent 70%)`,
            opacity: 0.42,
          }}
        />
        <div
          className="wcs-aurora-a"
          style={{
            ...styles.auroraBlob,
            width: 380,
            height: 380,
            left: '32%',
            bottom: '-32%',
            background: `radial-gradient(closest-side, color-mix(in srgb, ${WCS_ACCENT} 40%, var(--color-success)) 0%, transparent 70%)`,
            opacity: 0.35,
            animationDelay: '-14s',
          }}
        />
        <div style={styles.grainLayer} />
      </div>
      <div style={{...columnStyle, position: 'relative', zIndex: 1}}>
        <section
          id="join"
          ref={registerSection('join')}
          aria-label="Join the Foldline waitlist"
          style={{...styles.hero, ...(isPhone ? styles.heroCompact : null)}}>
          {showSatellites && satellites}
          <Eyebrow label={BRAND.launchTag} hasDot />
          <div style={isParallaxOn ? styles.wordmarkStage : undefined}>
            <h1
              className="wcs-wordmark"
              style={{...styles.wordmark, fontSize: wordmarkSize}}>
              {BRAND.name}
            </h1>
          </div>
          <Text type="label" color="secondary">
            {BRAND.descriptor}
          </Text>
          <p
            style={{
              ...styles.teaserLine,
              ...(isPhone ? styles.teaserLineCompact : null),
            }}>
            {BRAND.teaser}
          </p>
          {joinedEmail === null ? emailCapture : positionCard}
        </section>
      </div>
    </div>
  );

  // ============= PREVIEW BAND (asymmetric 7/5 split) =============

  const preview = (
    <div style={styles.bandTinted}>
      <div style={columnStyle}>
        <section
          id="preview"
          ref={registerSection('preview')}
          aria-label="What's inside"
          style={sectionStyle}>
          <Reveal>
            <VStack gap={3} hAlign="start">
              <Eyebrow label="What's inside" />
              <h2 style={headingStyle}>Three reasons to be early</h2>
              <Text type="supporting" color="secondary">
                One is public. The other two unlock as invites roll out.
              </Text>
            </VStack>
          </Reveal>
          <Reveal delayMs={80}>
            <div
              style={{
                ...styles.teaserSplit,
                ...(isMid ? styles.teaserSplitStacked : null),
              }}>
              <TeaserCard teaser={TEASERS[0]} isFeature={!isMid} />
              <VStack gap={4}>
                <TeaserCard teaser={TEASERS[1]} />
                <TeaserCard teaser={TEASERS[2]} />
              </VStack>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );

  // ============= ROADMAP (pinned scroll story / static fallbacks) ==========

  const meterHorizontal = (
    <div style={styles.meterRow}>
      {MILESTONES.map((milestone, index) => (
        <div key={milestone.id} style={styles.meterCell}>
          <div style={styles.meterTrack}>
            <MilestoneNode state={milestone.state} />
            {index < MILESTONES.length - 1 && (
              <div style={styles.meterConnector} aria-hidden="true">
                <div
                  style={{
                    ...styles.meterConnectorFill,
                    // Segment fill mirrors milestone state: done→current is
                    // fully painted, current→upcoming is the beta's ~40%.
                    width: milestone.state === 'done' ? '100%' : '40%',
                  }}
                />
              </div>
            )}
          </div>
          <div style={{paddingRight: 'var(--spacing-3)'}}>
            <MilestoneCopy milestone={milestone} />
          </div>
        </div>
      ))}
    </div>
  );

  const meterVertical = (
    <VStack gap={0}>
      {MILESTONES.map((milestone, index) => (
        <div key={milestone.id} style={styles.meterCellVertical}>
          <div style={styles.meterRailVertical}>
            <MilestoneNode state={milestone.state} />
            {index < MILESTONES.length - 1 && (
              <div
                style={{
                  ...styles.meterConnectorVertical,
                  ...(milestone.state === 'done'
                    ? {backgroundColor: WCS_ACCENT}
                    : null),
                }}
                aria-hidden="true"
              />
            )}
          </div>
          <div style={{paddingBottom: 'var(--spacing-4)', minWidth: 0}}>
            <MilestoneCopy milestone={milestone} />
          </div>
        </div>
      ))}
    </VStack>
  );

  const roadmapHeader = (
    <VStack gap={3} hAlign="start">
      <Eyebrow label="Roadmap" />
      <h2 style={headingStyle}>Where the build stands</h2>
    </VStack>
  );

  // Static roadmap: compact widths and reduced motion get the plain meter.
  const roadmapStatic = (
    <div style={columnStyle}>
      <section
        id="roadmap"
        ref={registerSection('roadmap')}
        aria-label="Launch roadmap"
        style={sectionStyle}>
        <Reveal>{roadmapHeader}</Reveal>
        <Reveal delayMs={80}>{isMid ? meterVertical : meterHorizontal}</Reveal>
      </section>
    </div>
  );

  // Pinned scroll story: a sticky stage inside a ~2.35-viewport container.
  // Scroll progress advances the active phase, fills the step rail, and
  // draws the fold path; phases are also clickable buttons.
  const activeMilestone = MILESTONES[activePhase];
  const roadmapPinned = (
    <section
      id="roadmap"
      ref={node => {
        pinRef.current = node;
        sectionRefs.current.roadmap = node;
      }}
      aria-label="Launch roadmap"
      style={{height: Math.round(stageHeight * 2.35)}}>
      <div style={{...styles.pinStage, height: stageHeight}}>
        <div style={styles.dotGrid} aria-hidden="true" />
        <div style={{...columnStyle, position: 'relative'}}>
          <div style={styles.storyGrid}>
            <VStack gap={5} hAlign="start">
              {roadmapHeader}
              <div style={{display: 'flex', width: '100%'}}>
                <div style={styles.phaseRail} aria-hidden="true">
                  <div
                    style={{
                      ...styles.phaseRailFill,
                      height: `${Math.round(storyProgress * 100)}%`,
                    }}
                  />
                </div>
                <VStack gap={1} style={{flex: '1 1 0', minWidth: 0}}>
                  {MILESTONES.map((milestone, index) => (
                    <button
                      key={milestone.id}
                      type="button"
                      aria-current={index === activePhase ? 'step' : undefined}
                      style={{
                        ...styles.phaseButton,
                        ...(index === activePhase
                          ? {backgroundColor: WCS_ACCENT_WASH_SOFT}
                          : {opacity: 0.55}),
                      }}
                      onClick={() => jumpToPhase(index)}>
                      <span style={styles.phaseNumeral}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <VStack gap={0}>
                        <Text type="label">{milestone.label}</Text>
                        <Text type="supporting" color="secondary">
                          {milestone.date}
                        </Text>
                      </VStack>
                    </button>
                  ))}
                </VStack>
              </div>
              <Text type="supporting" color="secondary">
                Scroll — or click a phase.
              </Text>
            </VStack>
            <div
              key={activePhase}
              className="wcs-stage-in"
              style={styles.stageCard}>
              <span style={styles.stageWatermark} aria-hidden="true">
                {String(activePhase + 1).padStart(2, '0')}
              </span>
              <HStack gap={3} vAlign="center">
                <MilestoneNode state={activeMilestone.state} />
                <VStack gap={0}>
                  <Text type="label">{activeMilestone.label}</Text>
                  <Text type="supporting" color="secondary">
                    {activeMilestone.date}
                  </Text>
                </VStack>
              </HStack>
              <Text color="secondary">{activeMilestone.note}</Text>
              <div style={{marginTop: 'auto'}} aria-hidden="true">
                <svg
                  viewBox="0 0 320 170"
                  style={{width: '100%', height: 'auto', display: 'block'}}>
                  <path
                    d={FOLD_PATH}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={FOLD_PATH}
                    fill="none"
                    stroke={WCS_ACCENT}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - storyProgress}
                    style={{transition: 'stroke-dashoffset 0.15s linear'}}
                  />
                  {[
                    {x: 8, y: 150},
                    {x: 152, y: 138},
                    {x: 306, y: 112},
                  ].map((node, index) => (
                    <circle
                      key={`${node.x}-${node.y}`}
                      cx={node.x}
                      cy={node.y}
                      r={5}
                      fill={
                        index <= activePhase
                          ? WCS_ACCENT
                          : 'var(--color-background-body)'
                      }
                      stroke={
                        index <= activePhase
                          ? WCS_ACCENT
                          : 'var(--color-border)'
                      }
                      strokeWidth={2}
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const roadmap = isPinned ? roadmapPinned : roadmapStatic;

  // ============= FOLLOW BAND (scheme-locked dark glass) =============

  const follow = (
    <div style={styles.darkBand} onPointerMove={onDarkPointerMove}>
      <div style={styles.darkGlow} aria-hidden="true" />
      <div style={{...styles.grainLayer, opacity: 0.05}} aria-hidden="true" />
      <div style={styles.spotlight} aria-hidden="true" />
      <div style={{...columnStyle, position: 'relative'}}>
        <section
          id="follow"
          ref={registerSection('follow')}
          aria-label="Follow the build"
          style={sectionStyle}>
          <Reveal>
            <VStack gap={3} hAlign="start">
              <Eyebrow label="Follow along" />
              <h2 style={headingStyle}>Watch it come together</h2>
              <Text type="supporting" color="secondary">
                A build note every Friday and a live demo call each month.
              </Text>
            </VStack>
          </Reveal>
          <Reveal delayMs={80}>
            <div
              style={{
                ...styles.socialGrid,
                ...(isMid ? styles.socialGridMid : null),
                ...(isPhone ? styles.socialGridPhone : null),
              }}>
              {SOCIALS.map(social => (
                // Would leave the page — no-op by convention.
                <button
                  key={social.id}
                  type="button"
                  className="wcs-lift"
                  style={styles.socialCard}
                  onClick={() => {}}>
                  <span style={styles.socialGlyph} aria-hidden="true">
                    <Icon icon={social.icon} size="sm" color="inherit" />
                  </span>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {social.label}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {social.handle}
                    </Text>
                  </VStack>
                </button>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );

  // ============= FOOTER =============

  const footer = (
    <div style={columnStyle}>
      <footer style={styles.footer} aria-label="Footer">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <BrandMark />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              © 2026 Foldline Systems
            </Text>
          </StackItem>
          <span style={styles.monoNote}>
            <Icon icon={MailIcon} size="xsm" color="inherit" />{' '}
            hello@foldline.app
          </span>
          {FOOTER_LINKS.map(label => (
            // Would leave the page — no-op by convention.
            <button
              key={label}
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              {label}
            </button>
          ))}
        </HStack>
      </footer>
    </div>
  );

  // ============= FRAME =============

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0} role="main" label="Foldline coming soon">
          <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
            <style>{TEMPLATE_CSS}</style>
            <div ref={pageRef} style={styles.page}>
              {navbar}
              {hero}
              {preview}
              {roadmap}
              {follow}
              {footer}
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
