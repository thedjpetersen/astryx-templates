var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file api-platform-landing.tsx
 * @input Deterministic fixtures only (the fictional "Parcelrate" shipping-
 *   rates API: hero copy plus three request snippets keyed by language and
 *   one canned JSON rates response, five endpoint rows with method/path/
 *   purpose/p50, ten log-spaced request-volume steps and four pricing tiers
 *   with base price + included volume + per-1k overage, six SDK tiles with
 *   install commands, four reliability stats plus a p99 chip, three
 *   CSS-drawn docs panes, two developer testimonials, an eight-name
 *   customer marquee, and footer link columns with a status row)
 * @output Art-directed marketing landing page for an API platform. A
 *   transparent-at-top sticky navbar gains a tinted hairline surface and
 *   shrinks after 24px of scroll (compact widths collapse to a menu button
 *   + dropdown). The hero sits on an aurora field (drifting color-mix
 *   blobs + grain) with a 76px display headline whose "One request."
 *   phrase gets gradient ink, a validating email capture (success flips to
 *   a sandbox-key card), and a staged product theater: the signature
 *   runnable request/response pane — curl/Node/Python TabList swaps the
 *   request CodeBlock, Send request stages a 600ms spinner before the JSON
 *   response rises in with a 200 OK badge and latency chip — now a
 *   scheme-locked dark glass pane under a perspective tilt with three
 *   bobbing satellite mini-cards and pointer parallax. Sections: a
 *   pause-on-hover customer wordmark marquee, an asymmetric 5/7 endpoint
 *   showcase on a dot-grid band whose Table card straddles the boundary
 *   into the pricing band, the pricing calculator (10k–10M log Slider →
 *   per-tier best-value readout, gradient-ink volume numeral), a
 *   hover-raise SDK grid with pinned install commands, a scheme-locked
 *   dark reliability band (vibrant glows, grain, pointer-tracked
 *   spotlight, glass stat cards with 900ms count-up tickers + p99 chip),
 *   a pinned scroll-story docs section (sticky stage, scroll progress
 *   advances three schematic panes with a filling numbered step rail —
 *   steps also clickable; static stacked under reduced motion), offset
 *   developer testimonial cards, an aurora final CTA band, and a footer
 *   with an operational StatusDot row.
 * @position Page template; emitted by \`astryx template api-platform-landing\`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts one
 * scroll container div; the navbar is position:sticky top:0 inside it and
 * a centered 1080px column carries every section. A page-top aurora layer
 * paints behind the transparent navbar and hero; full-bleed textured bands
 * alternate with plain bands; the reliability band is scheme-locked dark.
 *
 * Interaction contract:
 * - Nav anchors smooth-scroll the container to real section ids under a
 *   76px sticky-nav allowance; the compact menu closes on Escape, outside
 *   pointerdown, or any selection. After 24px of scroll the navbar's
 *   tinted surface fades in (opacity-only) and its height steps down.
 * - The hero email form validates on submit (empty/format errors inline)
 *   and success swaps to a sandbox-key card with a "Use a different email"
 *   reset. The nav CTA and final CTA scroll to the hero and focus the
 *   email input — no dead buttons in the hero.
 * - Send request guards re-entry while running, stages a 600ms timer
 *   (cleared on unmount), then mounts the response block with a rise+fade
 *   keyframe animation; reduced motion skips the timer and animation and
 *   renders the final frame. The button relabels to "Send again".
 * - Hero pointer parallax (±8px via CSS vars, spring-ish transition) and
 *   satellite bobbing are disabled under reduced motion and at stacked
 *   widths; the aurora drift and marquee loop are CSS-gated as well.
 * - The pricing Slider is index-based over ten fixed log steps; every
 *   move recomputes all four tier prices in one pass (integer math on
 *   fixture steps), re-highlights the cheapest eligible tier, and updates
 *   the "cheapest plan" caption. Volumes ≥ 5M add a committed-use note.
 * - SDK tiles reveal their install command on hover and pin it on
 *   click/tap (aria-pressed); tiles have fixed min-heights so nothing
 *   jumps. Hover raises a shadow tier with an accent border-glow.
 * - The docs scroll story pins a sticky stage inside a ~240vh container;
 *   scroll progress (container rect vs the measured stage viewport)
 *   selects one of three panes and fills the step rail (scaleY transform,
 *   set imperatively — no per-frame re-render). Steps are real buttons
 *   that scroll to their band. Reduced motion / stacked widths render a
 *   static stacked sequence instead.
 * - Scroll-reveals use a fire-once IntersectionObserver (rise+fade 16px,
 *   scale .985, 560ms decelerate, 70–90ms stagger); the reliability stats
 *   count up over ~900ms on first view. Both are gated by
 *   prefers-reduced-motion: reveals render visible, counters render final.
 *
 * Color policy: token-pure except ONE quarantined brand-accent literal
 * (see ACCENT below, with contrast math); every accent tint, aurora blob,
 * glow, and gradient ink on the page is a color-mix() derivation of that
 * single literal with scheme tokens. The dark surfaces are scheme-locked
 * via colorScheme:'dark' plus stable mixes of --color-on-light/--color-
 * on-dark (both constants across schemes). Shadow tiers use the sanctioned
 * neutral rgba ramp. Product art is CSS schematic mocks and monogram
 * tiles — no network images, no real logos.
 *
 * Responsive contract (useElementWidth ResizeObserver — the inline demo
 * stage is ~1045px wide, so viewport media queries are not used):
 * - Column: max-width 1080px, centered; bands paint edge to edge.
 * - >880px: navbar shows inline anchors + CTA; hero is split copy/theater
 *   with satellites; endpoints run 5/7; docs run the pinned story; stats
 *   4-up; SDK grid 3-up; testimonials 2-up offset.
 * - <=880px: nav links + CTA collapse behind a 40px menu button dropdown.
 * - <=760px: hero stacks (pane below copy, tilt/parallax/satellites off),
 *   endpoints stack, docs fall back to the static stacked sequence,
 *   testimonials stack, stats drop to 2-up, pricing readout rows loosen.
 * - <=560px: headline and stat type step down, the email form stacks its
 *   button, the SDK grid drops to one column, the endpoint Table drops
 *   its p50 column, and section paddings tighten — holds at 390px in the
 *   phone artboard with no overflow-x.
 */

import {
  useEffect,
  useMemo,
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
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Icon} from '@astryxdesign/core/Icon';
import {Slider} from '@astryxdesign/core/Slider';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  KeyRoundIcon,
  MenuIcon,
  PackageIcon,
  PlayIcon,
  SendIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

// ============= ACCENT (single quarantined literal) =============
// Parcelrate "cargo orange" — the ONE sanctioned accent literal on this
// page. Contrast math: #C2410C on white = 5.2:1 (WCAG AA for text and
// UI); #FB923C on the ~#141414 scheme-locked dark surfaces = 7.6:1 (AA).
// Every other accent surface below is a color-mix() derivation of this
// literal with scheme tokens.
const ACCENT = 'light-dark(#C2410C, #FB923C)';
const ACCENT_TINT = \`color-mix(in srgb, \${ACCENT} 10%, transparent)\`;
const ACCENT_TINT_SOFT = \`color-mix(in srgb, \${ACCENT} 5%, transparent)\`;
const ACCENT_BORDER = \`color-mix(in srgb, \${ACCENT} 40%, transparent)\`;
const ACCENT_GLOW = \`color-mix(in srgb, \${ACCENT} 24%, transparent)\`;

/** Gradient ink for the hero key phrase and pricing numeral — built from
 * the quarantined accent via color-mix only. */
const INK_GRADIENT = \`linear-gradient(96deg, \${ACCENT} 6%, color-mix(in srgb, \${ACCENT} 52%, var(--color-text-pink)) 94%)\`;

// Aurora blob fills: the accent mixed toward info/success-leaning tokens,
// then faded — never a new literal.
const AURORA_WARM = \`color-mix(in srgb, \${ACCENT} 58%, transparent)\`;
const AURORA_COOL = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 42%, var(--color-text-blue)) 52%, transparent)\`;
const AURORA_FRESH = \`color-mix(in srgb, color-mix(in srgb, \${ACCENT} 40%, var(--color-success)) 46%, transparent)\`;

// Scheme-locked dark surfaces: --color-on-light (#000 in both schemes)
// mixed with --color-on-dark (#FFF in both schemes) — stable everywhere.
const DARK_BG =
  'color-mix(in srgb, var(--color-on-light) 93%, var(--color-on-dark))';
const DARK_BG_DEEP =
  'color-mix(in srgb, var(--color-on-light) 96%, var(--color-on-dark))';
const GLASS_SURFACE = 'color-mix(in srgb, var(--color-on-dark) 6%, transparent)';
const GLASS_EDGE = 'color-mix(in srgb, var(--color-on-dark) 14%, transparent)';
const DARK_TEXT_SOFT = 'color-mix(in srgb, var(--color-on-dark) 72%, transparent)';

// ---- depth system (sanctioned neutral shadow ramp) ----
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING = \`\${SHADOW_RAISED}, 0 24px 48px -24px rgba(0, 0, 0, 0.3)\`;
const GLASS_INSET = \`inset 0 0 0 1px \${GLASS_EDGE}\`;

/** Inline SVG feTurbulence grain — a data URI, not a network asset. */
const GRAIN_URL = \`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")\`;

/** Sticky-nav height allowance for smooth-scroll targets. */
const NAV_ALLOWANCE = 76;

/** Sticky offset for the docs scroll-story stage. */
const STORY_STICKY_TOP = 72;

/** Decelerate bezier shared by reveals, parallax, and hover lifts. */
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Keyframes + hover/marquee classes (inline styles cannot express :hover
 * or animation-play-state). Everything is transform/opacity-only and the
 * reduced-motion media block statics the lot. */
const GLOBAL_CSS = \`
@keyframes prlRiseIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
@keyframes prlHeroIn {
  from { opacity: 0; transform: translateY(18px) scale(0.99); }
  to { opacity: 1; transform: none; }
}
@keyframes prlDriftA {
  from { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(70px, -44px, 0) scale(1.14); }
  to { transform: translate3d(-36px, 30px, 0) scale(0.96); }
}
@keyframes prlDriftB {
  from { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-64px, 38px, 0) scale(0.92); }
  to { transform: translate3d(40px, -26px, 0) scale(1.1); }
}
@keyframes prlBob {
  from, to { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -9px, 0); }
}
@keyframes prlMarquee {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
.prl-drift-a { animation: prlDriftA 38s ease-in-out infinite alternate; }
.prl-drift-b { animation: prlDriftB 44s ease-in-out infinite alternate; }
.prl-bob-a { animation: prlBob 7s ease-in-out -2.4s infinite; }
.prl-bob-b { animation: prlBob 8.6s ease-in-out -4.1s infinite; }
.prl-bob-c { animation: prlBob 6.4s ease-in-out -1.2s infinite; }
.prl-cta {
  position: relative;
  display: inline-flex;
  border-radius: 8px;
  overflow: hidden;
  isolation: isolate;
  transition: transform 160ms ease;
}
.prl-cta > * { flex: 1 1 auto; }
.prl-cta:hover { transform: translateY(-1px); }
.prl-cta:active { transform: translateY(0) scale(0.98); }
.prl-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transform: translateX(-140%) skewX(-16deg);
  background: linear-gradient(104deg, transparent 34%, color-mix(in srgb, var(--color-on-dark) 30%, transparent) 50%, transparent 66%);
}
.prl-cta:hover::after {
  transform: translateX(140%);
  transition: transform 640ms ease;
}
.prl-raise {
  box-shadow: \${SHADOW_RAISED};
  transition: transform 200ms \${EASE_OUT}, box-shadow 200ms \${EASE_OUT};
}
.prl-raise:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING};
}
.prl-marquee { overflow: hidden; }
.prl-marquee-track {
  display: flex;
  align-items: center;
  gap: 48px;
  width: max-content;
  animation: prlMarquee 48s linear infinite;
}
.prl-marquee:hover .prl-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .prl-drift-a, .prl-drift-b, .prl-bob-a, .prl-bob-b, .prl-bob-c {
    animation: none;
  }
  .prl-cta, .prl-cta:hover, .prl-cta:active { transform: none; transition: none; }
  .prl-cta::after { display: none; }
  .prl-raise, .prl-raise:hover { transform: none; transition: none; }
  .prl-marquee-track {
    animation: none;
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
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
  band: {
    paddingBlock: 112,
  },
  bandPhone: {
    paddingBlock: 64,
  },
  section: {
    position: 'relative',
    zIndex: 1,
  },
  sectionAbove: {
    position: 'relative',
    zIndex: 2,
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  dotGrid: {
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-border) 85%, transparent) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  },
  // ---- atmosphere ----
  pageAurora: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 680,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(88px)',
    pointerEvents: 'none',
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN_URL,
    backgroundSize: '140px 140px',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },
  navSurface: {
    position: 'absolute',
    inset: 0,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 92%, transparent)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: '0 8px 24px -20px rgba(0, 0, 0, 0.24)',
    transition: 'opacity 240ms ease',
    pointerEvents: 'none',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
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
  // ---- shared type scale ----
  eyebrowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 10,
    borderRadius: 12,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ACCENT,
    alignSelf: 'flex-start',
    whiteSpace: 'nowrap',
  },
  sectionHeading: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionHeadingPhone: {
    fontSize: 27,
  },
  lede: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  mono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
  },
  inkText: {
    backgroundImage: INK_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
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
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontWeight: 720,
    lineHeight: 1.04,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  heroSubcopy: {
    fontSize: 18,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '54ch',
    margin: 0,
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
  keyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_TINT_SOFT,
    maxWidth: 440,
  },
  keyMono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    fontWeight: 600,
    color: ACCENT,
    wordBreak: 'break-all',
  },
  checkDisc: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  // ---- product theater (hero pane + satellites) ----
  theater: {
    position: 'relative',
    flex: '1.12 1 0',
    minWidth: 0,
  },
  paneShell: {
    transition: \`transform 700ms \${EASE_OUT}\`,
  },
  requestPane: {
    colorScheme: 'dark',
    borderRadius: 16,
    border: \`1px solid \${GLASS_EDGE}\`,
    backgroundColor: DARK_BG_DEEP,
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_FLOATING}, 0 40px 80px -36px \${ACCENT_GLOW}\`,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  satellite: {
    position: 'absolute',
    zIndex: 2,
    transition: \`transform 700ms \${EASE_OUT}\`,
  },
  satelliteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  satMonogram: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 800,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    marginLeft: -6,
  },
  latencyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    backgroundColor: ACCENT_TINT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- customer marquee ----
  marqueeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: 'var(--color-text-secondary)',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
  marqueeMonogram: {
    width: 26,
    height: 26,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // ---- endpoints (asymmetric 5/7) ----
  endpointsRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  endpointsRail: {
    flex: '0 0 36%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  endpointsCardWrap: {
    flex: '1 1 0',
    minWidth: 0,
  },
  tableCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  // ---- pricing calculator ----
  pricingCard: {
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  volumeReadout: {
    fontSize: 40,
    fontWeight: 720,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.05,
  },
  volumeReadoutPhone: {
    fontSize: 28,
  },
  tierRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
  },
  tierRowBest: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_TINT_SOFT,
    boxShadow: \`0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_RAISED}\`,
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  bestChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 8,
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  // ---- SDK grid ----
  sdkGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  sdkTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    minHeight: 118,
    padding: 'var(--spacing-3)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
  },
  sdkTileActive: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_TINT_SOFT,
  },
  sdkMonogram: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: \`linear-gradient(140deg, \${ACCENT_TINT}, color-mix(in srgb, \${ACCENT} 18%, transparent))\`,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  sdkCommand: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    color: ACCENT,
    wordBreak: 'break-all',
  },
  // ---- reliability band (scheme-locked dark) ----
  darkBand: {
    position: 'relative',
    zIndex: 1,
    colorScheme: 'dark',
    backgroundColor: DARK_BG,
    overflow: 'hidden',
  },
  darkGlow: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  darkSpot: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: \`radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, \${ACCENT} 13%, transparent), transparent 72%)\`,
    transition: 'opacity 400ms ease',
  },
  glassCard: {
    position: 'relative',
    borderRadius: 16,
    backgroundColor: GLASS_SURFACE,
    boxShadow: \`\${GLASS_INSET}, 0 24px 48px -24px rgba(0, 0, 0, 0.5)\`,
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
  },
  statsGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  statValue: {
    fontSize: 44,
    fontWeight: 720,
    letterSpacing: '-0.02em',
    lineHeight: 1.05,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-on-dark)',
  },
  statValuePhone: {
    fontSize: 30,
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 1.45,
    color: DARK_TEXT_SOFT,
  },
  // ---- docs scroll story ----
  storyStage: {
    position: 'sticky',
    top: STORY_STICKY_TOP,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  storyRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  storyRail: {
    flex: '0 0 40%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  storySteps: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    paddingLeft: 18,
  },
  railTrack: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
  },
  railFill: {
    position: 'absolute',
    inset: 0,
    backgroundImage: INK_GRADIENT,
    transformOrigin: 'top',
    transform: 'scaleY(0)',
  },
  stepButton: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box',
  },
  stepButtonActive: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_TINT_SOFT,
  },
  stepNumeral: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 26,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: 'var(--color-text-disabled)',
    flexShrink: 0,
    paddingTop: 2,
  },
  paneArea: {
    flex: '1.15 1 0',
    minWidth: 0,
    position: 'relative',
  },
  paneLayer: {
    position: 'absolute',
    inset: 0,
    transition: \`opacity 420ms ease, transform 420ms \${EASE_OUT}\`,
  },
  // ---- docs teaser (schematic mocks) ----
  docsGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  mockWindow: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  mockBody: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  mockBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  mockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mockMethodPill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 18,
    paddingInline: 6,
    borderRadius: 6,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  mockPath: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mockRunPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    paddingInline: 8,
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 10,
    fontWeight: 700,
    alignSelf: 'flex-start',
  },
  // ---- testimonials ----
  testimonialGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  quoteCard: {
    position: 'relative',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  quoteMark: {
    position: 'absolute',
    top: 6,
    right: 18,
    fontSize: 84,
    lineHeight: 1,
    fontWeight: 800,
    color: ACCENT_TINT,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  quote: {
    fontSize: 16,
    lineHeight: 1.6,
    margin: 0,
    position: 'relative',
  },
  avatarDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundImage: \`linear-gradient(140deg, \${ACCENT_TINT}, color-mix(in srgb, \${ACCENT} 20%, transparent))\`,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 14,
    fontWeight: 700,
  },
  // ---- final CTA ----
  finalCtaBand: {
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
    backgroundColor: ACCENT_TINT_SOFT,
    borderTop: \`1px solid \${ACCENT_BORDER}\`,
    borderBottom: \`1px solid \${ACCENT_BORDER}\`,
  },
  finalCta: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
  },
  finalCtaHeading: {
    fontSize: 42,
    fontWeight: 720,
    lineHeight: 1.06,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  finalCtaHeadingPhone: {
    fontSize: 29,
  },
  // ---- footer ----
  footer: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
  },
  footerGrid: {
    display: 'grid',
    gap: 'var(--spacing-6)',
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
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 30,
    paddingInline: 10,
    borderRadius: 15,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Parcelrate shipping-rates API.
// No Date.now, no randomness, no network assets, no real carrier names.

const BRAND = {name: 'Parcelrate'};

const SANDBOX_KEY = 'pr_test_9f2ce81a4bd07731';

type SectionId = 'endpoints' | 'pricing' | 'sdks' | 'docs';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'endpoints', label: 'Endpoints'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'sdks', label: 'SDKs'},
  {id: 'docs', label: 'Docs'},
];

const HERO = {
  eyebrow: 'Shipping rates API',
  headlineLead: "Every carrier's live rate.",
  headlineInk: 'One request.',
  subcopy:
    'Parcelrate returns rates, labels, and tracking from 42 carriers ' +
    'through one typed API — 212 ms median, 99.99% uptime, and a sandbox ' +
    'that behaves exactly like production.',
  finePrint: '10,000 free requests every month · no card required',
};

/** Floating satellite mini-cards staged around the hero request pane.
 * Figures mirror the canned response + endpoint fixtures. */
const HERO_SATELLITES = {
  metric: {label: 'p50 · /v1/rates', value: '87 ms'},
  toast: {title: 'Label purchased', detail: 'Skylark Express · 2-Day · $14.90'},
  carriers: {
    label: '42 carriers · one contract',
    monograms: ['MP', 'SE', 'BC'],
  },
};

/** Invented customer wordmarks for the marquee strip — no real logos. */
const CUSTOMERS: readonly string[] = [
  'Cartloop',
  'Bundleworks',
  'Palletier',
  'Boxbird',
  'Dispatchly',
  'Cratewise',
  'Northloom',
  'Ferrobox',
];

type RequestLang = 'curl' | 'node' | 'python';

const REQUEST_SNIPPETS: Record<
  RequestLang,
  {tabLabel: string; language: string; code: string}
> = {
  curl: {
    tabLabel: 'curl',
    language: 'bash',
    code: [
      'curl https://api.parcelrate.dev/v1/rates \\\\',
      \`  -H "Authorization: Bearer \${SANDBOX_KEY}" \\\\\`,
      '  -d origin_postal=94107 \\\\',
      '  -d destination_postal=10013 \\\\',
      '  -d weight_oz=42 \\\\',
      '  -d dimensions=12x9x4',
    ].join('\\n'),
  },
  node: {
    tabLabel: 'Node',
    language: 'javascript',
    code: [
      "import Parcelrate from '@parcelrate/sdk';",
      '',
      \`const parcelrate = new Parcelrate('\${SANDBOX_KEY}');\`,
      '',
      'const rates = await parcelrate.rates.create({',
      "  originPostal: '94107',",
      "  destinationPostal: '10013',",
      '  weightOz: 42,',
      "  dimensions: '12x9x4',",
      '});',
    ].join('\\n'),
  },
  python: {
    tabLabel: 'Python',
    language: 'python',
    code: [
      'import parcelrate',
      '',
      \`client = parcelrate.Client("\${SANDBOX_KEY}")\`,
      '',
      'rates = client.rates.create(',
      '    origin_postal="94107",',
      '    destination_postal="10013",',
      '    weight_oz=42,',
      '    dimensions="12x9x4",',
      ')',
    ].join('\\n'),
  },
};

const REQUEST_LANG_ORDER: readonly RequestLang[] = ['curl', 'node', 'python'];

const RESPONSE_JSON = [
  '{',
  '  "id": "rate_req_8c31f2",',
  '  "currency": "USD",',
  '  "rates": [',
  '    { "carrier": "Meridian Post",   "service": "Ground",    "amount": 8.42,  "days": 4 },',
  '    { "carrier": "Skylark Express", "service": "2-Day",     "amount": 14.90, "days": 2 },',
  '    { "carrier": "Bluecrate",       "service": "Overnight", "amount": 27.35, "days": 1 }',
  '  ],',
  '  "cheapest": "rate_01J9M4",',
  '  "fastest": "rate_01J9M6"',
  '}',
].join('\\n');

const RESPONSE_LATENCY_LABEL = '212 ms';

interface EndpointRow extends Record<string, unknown> {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  purpose: string;
  p50: string;
}

const ENDPOINTS: readonly EndpointRow[] = [
  {
    id: 'rates',
    method: 'POST',
    path: '/v1/rates',
    purpose: 'Live rates across 42 carriers in a single call',
    p50: '87 ms',
  },
  {
    id: 'shipments',
    method: 'POST',
    path: '/v1/shipments',
    purpose: 'Buy a label and get tracking in the same response',
    p50: '214 ms',
  },
  {
    id: 'tracking',
    method: 'GET',
    path: '/v1/tracking/{id}',
    purpose: 'Normalized tracking events from every carrier',
    p50: '64 ms',
  },
  {
    id: 'verify',
    method: 'POST',
    path: '/v1/addresses/verify',
    purpose: 'Validate and canonicalize a delivery address',
    p50: '48 ms',
  },
  {
    id: 'carriers',
    method: 'GET',
    path: '/v1/carriers',
    purpose: 'Capabilities, service levels, and pickup cutoffs',
    p50: '39 ms',
  },
];

/** Log-spaced requests/month steps driven by the pricing Slider. */
const VOLUME_STEPS: readonly number[] = [
  10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000,
  5_000_000, 10_000_000,
];

const VOLUME_MARKS = [
  {value: 0, label: '10k'},
  {value: 3, label: '100k'},
  {value: 6, label: '1M'},
  {value: 9, label: '10M'},
];

interface PricingTier {
  id: string;
  name: string;
  blurb: string;
  baseUsd: number;
  includedRequests: number;
  /** USD per 1,000 requests over the included volume; null = hard cap. */
  overagePer1kUsd: number | null;
}

const TIERS: readonly PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'Sandbox + production, community support',
    baseUsd: 0,
    includedRequests: 10_000,
    overagePer1kUsd: null,
  },
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'Email support, 2 webhook endpoints',
    baseUsd: 49,
    includedRequests: 100_000,
    overagePer1kUsd: 0.4,
  },
  {
    id: 'growth',
    name: 'Growth',
    blurb: 'Priority support, unlimited webhooks, SSO',
    baseUsd: 249,
    includedRequests: 1_000_000,
    overagePer1kUsd: 0.2,
  },
  {
    id: 'scale',
    name: 'Scale',
    blurb: '99.99% SLA, dedicated Slack channel, DPA',
    baseUsd: 999,
    includedRequests: 5_000_000,
    overagePer1kUsd: 0.1,
  },
];

interface SdkTile {
  id: string;
  name: string;
  monogram: string;
  tagline: string;
  install: string;
}

const SDKS: readonly SdkTile[] = [
  {
    id: 'ts',
    name: 'TypeScript',
    monogram: 'TS',
    tagline: 'Typed client · v3.2',
    install: 'npm install @parcelrate/sdk',
  },
  {
    id: 'py',
    name: 'Python',
    monogram: 'PY',
    tagline: 'Sync + async · v2.8',
    install: 'pip install parcelrate',
  },
  {
    id: 'go',
    name: 'Go',
    monogram: 'GO',
    tagline: 'Context-first · v1.9',
    install: 'go get parcelrate.dev/go',
  },
  {
    id: 'rb',
    name: 'Ruby',
    monogram: 'RB',
    tagline: 'Rails-friendly · v2.1',
    install: 'gem install parcelrate',
  },
  {
    id: 'php',
    name: 'PHP',
    monogram: 'PHP',
    tagline: 'PSR-18 client · v1.6',
    install: 'composer require parcelrate/parcelrate',
  },
  {
    id: 'jv',
    name: 'Java',
    monogram: 'JV',
    tagline: 'Reactive-ready · v1.4',
    install: 'implementation "dev.parcelrate:sdk:1.4.0"',
  },
];

interface Stat {
  id: string;
  /** Numeric target for the count-up animation. */
  target: number;
  decimals: number;
  suffix: string;
  label: string;
}

const STATS: readonly Stat[] = [
  {
    id: 'uptime',
    target: 99.99,
    decimals: 2,
    suffix: '%',
    label: 'Uptime, trailing 90 days',
  },
  {
    id: 'median',
    target: 212,
    decimals: 0,
    suffix: ' ms',
    label: 'Median rate-request latency',
  },
  {
    id: 'volume',
    target: 41,
    decimals: 0,
    suffix: 'M',
    label: 'Rates served per day',
  },
  {
    id: 'carriers',
    target: 42,
    decimals: 0,
    suffix: '',
    label: 'Carriers behind one contract',
  },
];

const P99_CHIP = 'p99 · 387 ms';

const DOCS_PANES: readonly {
  id: string;
  title: string;
  caption: string;
  variant: 'reference' | 'guides' | 'playground';
}[] = [
  {
    id: 'reference',
    title: 'API reference',
    caption: 'Every field typed, every error documented with a fix.',
    variant: 'reference',
  },
  {
    id: 'guides',
    title: 'Guides',
    caption: 'Rate shopping, labels, and returns as copy-paste recipes.',
    variant: 'guides',
  },
  {
    id: 'playground',
    title: 'Playground',
    caption: 'Run sandbox requests in the browser before you write code.',
    variant: 'playground',
  },
];

const TESTIMONIALS: readonly {
  id: string;
  quote: string;
  name: string;
  initials: string;
  role: string;
  metric: string;
}[] = [
  {
    id: 'cartloop',
    quote:
      'We replaced three carrier integrations with one POST /v1/rates ' +
      'call. Checkout rate shopping went from 1.4 s to about 210 ms, and ' +
      'conversion moved the same week we shipped it.',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Staff Engineer, Cartloop',
    metric: '−85% checkout latency',
  },
  {
    id: 'bundleworks',
    quote:
      'The sandbox returns the same shapes as production, down to the ' +
      'error codes. Our integration tests caught a dimensional-weight ' +
      'bug before it ever cost us money.',
    name: 'Diego Fuentes',
    initials: 'DF',
    role: 'Platform Lead, Bundleworks',
    metric: 'Integrated in 2 days',
  },
];

interface FooterColumn {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    id: 'product',
    heading: 'Product',
    links: [
      {label: 'Endpoints', anchor: 'endpoints'},
      {label: 'Pricing', anchor: 'pricing'},
      {label: 'SDKs', anchor: 'sdks'},
      {label: 'Changelog'},
    ],
  },
  {
    id: 'developers',
    heading: 'Developers',
    links: [
      {label: 'Documentation', anchor: 'docs'},
      {label: 'API reference'},
      {label: 'API status'},
      {label: 'Request collection'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      {label: 'About'},
      {label: 'Blog'},
      {label: 'Careers'},
      {label: 'Contact'},
    ],
  },
];

// ============= HELPERS =============

function formatRequestsShort(volume: number): string {
  if (volume >= 1_000_000) {
    const millions = volume / 1_000_000;
    return \`\${Number.isInteger(millions) ? millions : millions.toFixed(1)}M\`;
  }
  return \`\${Math.round(volume / 1_000)}k\`;
}

function formatUSD(amount: number): string {
  return \`$\${Math.round(amount).toLocaleString('en-US')}\`;
}

/** Monthly cost of a tier at a volume; null when the tier caps below it. */
function tierCostUsd(tier: PricingTier, volume: number): number | null {
  if (volume <= tier.includedRequests) {
    return tier.baseUsd;
  }
  if (tier.overagePer1kUsd === null) {
    return null;
  }
  const overageThousands = (volume - tier.includedRequests) / 1_000;
  return tier.baseUsd + overageThousands * tier.overagePer1kUsd;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get a sandbox key.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/** Display-type tier for the hero headline: 76px at full stage width,
 * never under 56px above the stacked breakpoint. */
function headlineSize(width: number): number {
  if (width > 1000) {
    return 76;
  }
  if (width > 760) {
    return 60;
  }
  if (width > 560) {
    return 48;
  }
  return 38;
}

// ============= HOOKS =============

/** Measures the page's own width (the demo stage is narrower than the
 * viewport, so media queries would lie — see Responsive contract). */
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

/** Measures the scroll stage's height — sizes the pinned docs story. */
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
    const onChange = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/** Fire-once viewport intersection; \`isDisabled\` (reduced motion) reports
 * in-view immediately so reveals render visible and counters render final. */
function useInView<T extends HTMLElement>(
  isDisabled: boolean,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (isDisabled) {
      setIsInView(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.2},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isDisabled]);
  return [ref, isInView];
}

/** Eased 0→target count-up once \`isActive\` (~900ms decelerate); reduced
 * motion jumps to the final value. Animation clock only — fixtures stay
 * deterministic. */
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
    const durationMs = 900;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(progress >= 1 ? target : target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, isReduced]);
  return value;
}

// ============= SMALL PIECES =============

function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={PackageIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );
}

function Eyebrow({children}: {children: ReactNode}) {
  return <span style={styles.eyebrowChip}>{children}</span>;
}

function SectionHeading({
  isPhone,
  children,
}: {
  isPhone: boolean;
  children: ReactNode;
}) {
  return (
    <h2
      style={{
        ...styles.sectionHeading,
        ...(isPhone ? styles.sectionHeadingPhone : null),
      }}>
      {children}
    </h2>
  );
}

/** Scroll reveal: rise 16px + scale .985, 560ms decelerate, fires once;
 * reduced motion renders visible with no transition. */
function Reveal({
  isReduced,
  delayMs = 0,
  children,
}: {
  isReduced: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const [ref, isInView] = useInView<HTMLDivElement>(isReduced);
  const style: CSSProperties | undefined = isReduced
    ? undefined
    : {
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : 'translateY(16px) scale(0.985)',
        transition: \`opacity 560ms \${EASE_OUT}, transform 560ms \${EASE_OUT}\`,
        transitionDelay: \`\${delayMs}ms\`,
      };
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

/** One count-up stat as a glass card in the dark reliability band. */
function StatCell({
  stat,
  isActive,
  isReduced,
  isPhone,
  extraChip,
}: {
  stat: Stat;
  isActive: boolean;
  isReduced: boolean;
  isPhone: boolean;
  extraChip?: string;
}) {
  const value = useCountUp(stat.target, isActive, isReduced);
  return (
    <div style={styles.glassCard}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <span
          style={{
            ...styles.statValue,
            ...(isPhone ? styles.statValuePhone : null),
          }}>
          {value.toFixed(stat.decimals)}
          {stat.suffix}
        </span>
        {extraChip !== undefined ? (
          <span style={styles.latencyChip}>{extraChip}</span>
        ) : null}
      </HStack>
      <span style={styles.statLabel}>{stat.label}</span>
    </div>
  );
}

/** CSS-drawn docs pane: schematic reference / guides / playground mock. */
function DocsPane({
  title,
  variant,
}: {
  title: string;
  variant: 'reference' | 'guides' | 'playground';
}) {
  let body = null;
  if (variant === 'reference') {
    body = (
      <>
        {ENDPOINTS.slice(0, 4).map(endpoint => (
          <div key={endpoint.id} style={styles.mockRow}>
            <span style={styles.mockMethodPill}>{endpoint.method}</span>
            <span style={styles.mockPath}>{endpoint.path}</span>
            <div style={{...styles.mockBar, flex: 1}} />
          </div>
        ))}
        <div style={{...styles.mockBar, width: '58%'}} />
      </>
    );
  } else if (variant === 'guides') {
    body = (
      <>
        <div style={{...styles.mockBar, width: '46%', height: 12}} />
        <div style={{...styles.mockBar, width: '92%'}} />
        <div style={{...styles.mockBar, width: '84%'}} />
        <div style={{...styles.mockBar, width: '88%'}} />
        <div style={styles.mockRow}>
          <span style={styles.mockMethodPill}>1</span>
          <div style={{...styles.mockBar, flex: 1}} />
        </div>
        <div style={styles.mockRow}>
          <span style={styles.mockMethodPill}>2</span>
          <div style={{...styles.mockBar, flex: 1}} />
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div style={styles.mockRow}>
          <span style={styles.mockMethodPill}>POST</span>
          <span style={styles.mockPath}>/v1/rates</span>
        </div>
        <div style={{...styles.mockBar, width: '100%', height: 22}} />
        <span style={styles.mockRunPill}>▶ Run in sandbox</span>
        <div style={{...styles.mockBar, width: '90%'}} />
        <div style={{...styles.mockBar, width: '72%'}} />
      </>
    );
  }
  return (
    <div style={styles.mockWindow} role="img" aria-label={\`\${title} preview\`}>
      <div style={styles.mockChrome} aria-hidden="true">
        <span style={styles.mockDot} />
        <span style={styles.mockDot} />
        <span>{title}</span>
      </div>
      <div style={styles.mockBody} aria-hidden="true">
        {body}
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function ApiPlatformLandingTemplate() {
  // ---- responsive: measure our own width (demo-stage safe) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;

  const isReduced = usePrefersReducedMotion();

  // ---- nav + scroll chrome ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const stageHeight = useElementHeight(pageRef);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ---- hero email capture ----
  const heroFormRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // ---- hero request/response run (signature moment) ----
  const [requestLang, setRequestLang] = useState<RequestLang>('curl');
  const [runState, setRunState] = useState<'idle' | 'running' | 'done'>(
    'idle',
  );
  const runTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (runTimerRef.current !== null) {
        window.clearTimeout(runTimerRef.current);
      }
    },
    [],
  );

  // ---- hero parallax (transient pointer values live on the DOM node) ----
  const theaterRef = useRef<HTMLDivElement | null>(null);

  // ---- pricing calculator ----
  const [volumeIndex, setVolumeIndex] = useState(4); // 250k requests/month

  // ---- SDK grid ----
  const [hoveredSdk, setHoveredSdk] = useState<string | null>(null);
  const [pinnedSdk, setPinnedSdk] = useState<string | null>(null);

  // ---- reliability band: count-up trigger + pointer spotlight ----
  const [statsRef, statsInView] = useInView<HTMLDivElement>(isReduced);
  const [isSpotOn, setIsSpotOn] = useState(false);

  // ---- docs scroll story ----
  const isStoryStatic = isReduced || isStacked;
  const [docsStep, setDocsStep] = useState(0);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const storyStageRef = useRef<HTMLDivElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);

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

  // One passive scroll listener drives the nav surface and the docs story
  // (rail fill is written imperatively — no per-frame re-render).
  useEffect(() => {
    const page = pageRef.current;
    if (page == null) {
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsScrolled(page.scrollTop > 24);
      if (isStoryStatic) {
        return;
      }
      const story = storyRef.current;
      const stage = storyStageRef.current;
      if (story == null || stage == null) {
        return;
      }
      const scrollable = story.offsetHeight - stage.offsetHeight;
      if (scrollable <= 0) {
        return;
      }
      const pageRect = page.getBoundingClientRect();
      const storyRect = story.getBoundingClientRect();
      const advanced = pageRect.top + STORY_STICKY_TOP - storyRect.top;
      const progress = Math.min(1, Math.max(0, advanced / scrollable));
      const fill = railFillRef.current;
      if (fill != null) {
        fill.style.transform = \`scaleY(\${progress.toFixed(4)})\`;
      }
      setDocsStep(progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2);
    };
    const onScroll = () => {
      if (frame === 0) {
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
  }, [isStoryStatic]);

  // ---- interactions ----

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
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

  /** Nav + final CTAs: scroll to the hero and focus the email input. */
  const jumpToSignup = () => {
    setIsMenuOpen(false);
    pageRef.current?.scrollTo({
      top: 0,
      behavior: isReduced ? 'auto' : 'smooth',
    });
    heroFormRef.current
      ?.querySelector('input')
      ?.focus({preventScroll: true});
  };

  const submitEmail = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  /** Signature hero moment: staged 600ms "run", then the canned response
   * rises in. Reduced motion renders the final frame immediately. */
  const runRequest = () => {
    if (runState === 'running') {
      return;
    }
    if (isReduced) {
      setRunState('done');
      return;
    }
    setRunState('running');
    runTimerRef.current = window.setTimeout(() => {
      setRunState('done');
    }, 600);
  };

  /** Clickable path through the pinned docs story. */
  const jumpToDocsStep = (index: number) => {
    setDocsStep(index);
    const page = pageRef.current;
    const story = storyRef.current;
    const stage = storyStageRef.current;
    if (page == null || story == null || stage == null) {
      return;
    }
    const scrollable = story.offsetHeight - stage.offsetHeight;
    const pageRect = page.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();
    const storyTop = page.scrollTop + (storyRect.top - pageRect.top);
    const fractions = [0.06, 0.5, 0.94];
    page.scrollTo({
      top: storyTop - STORY_STICKY_TOP + fractions[index] * scrollable,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Hero parallax: ±8px toward the pointer via CSS vars on the theater
   * node (spring-ish transition on children). Off under reduced motion
   * and at stacked/touch widths. */
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isReduced || isStacked) {
      return;
    }
    const theater = theaterRef.current;
    if (theater == null) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    theater.style.setProperty('--px', px.toFixed(3));
    theater.style.setProperty('--py', py.toFixed(3));
  };

  const onHeroPointerLeave = () => {
    const theater = theaterRef.current;
    if (theater == null) {
      return;
    }
    theater.style.setProperty('--px', '0');
    theater.style.setProperty('--py', '0');
  };

  /** Dark band spotlight: pointer position feeds --mx/--my on the section
   * node; the overlay fades via opacity only. Static under reduced motion. */
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (isReduced) {
      return;
    }
    const band = event.currentTarget;
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', \`\${Math.round(event.clientX - rect.left)}px\`);
    band.style.setProperty('--my', \`\${Math.round(event.clientY - rect.top)}px\`);
    setIsSpotOn(true);
  };

  const onDarkPointerLeave = () => {
    setIsSpotOn(false);
  };

  // ---- pricing math (one pass per slider move) ----
  const volume = VOLUME_STEPS[volumeIndex];
  const tierPricing = useMemo(() => {
    const costs = TIERS.map(tier => ({tier, cost: tierCostUsd(tier, volume)}));
    let bestId: string | null = null;
    let bestCost = Number.POSITIVE_INFINITY;
    for (const entry of costs) {
      if (entry.cost !== null && entry.cost < bestCost) {
        bestCost = entry.cost;
        bestId = entry.tier.id;
      }
    }
    return {costs, bestId, bestCost};
  }, [volume]);
  const bestTier = TIERS.find(tier => tier.id === tierPricing.bestId);

  // ---- endpoint table columns (p50 drops on phones) ----
  const endpointColumns = useMemo<TableColumn<EndpointRow>[]>(() => {
    const columns: TableColumn<EndpointRow>[] = [
      {
        key: 'method',
        header: 'Method',
        width: pixel(92),
        renderCell: row => (
          <Badge
            variant={row.method === 'GET' ? 'blue' : 'green'}
            label={row.method}
          />
        ),
      },
      {
        key: 'path',
        header: 'Endpoint',
        width: proportional(1, {minWidth: 150}),
        renderCell: row => <span style={styles.mono}>{row.path}</span>,
      },
      {
        key: 'purpose',
        header: 'Purpose',
        width: proportional(1.6, {minWidth: 140}),
      },
    ];
    if (!isPhone) {
      columns.push({
        key: 'p50',
        header: 'p50',
        width: pixel(84),
        align: 'end',
        renderCell: row => <span style={styles.mono}>{row.p50}</span>,
      });
    }
    return columns;
  }, [isPhone]);

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const bandStyle: CSSProperties = {
    ...styles.band,
    ...(isPhone ? styles.bandPhone : null),
  };
  const heroEntrance = (delayMs: number): CSSProperties | undefined =>
    isReduced
      ? undefined
      : {animation: \`prlHeroIn 640ms \${EASE_OUT} \${delayMs}ms both\`};

  // ============= NAVBAR =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Parcelrate">
      <div style={{...styles.navSurface, opacity: isScrolled ? 1 : 0}} />
      <div style={{...styles.navInner, minHeight: isScrolled ? 54 : 66}}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCompact ? (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={styles.navLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          ) : (
            <div />
          )}
        </StackItem>
        {!isNavCompact ? (
          <span className="prl-cta">
            <Button
              label="Get API key"
              variant="primary"
              icon={<Icon icon={KeyRoundIcon} size="sm" color="inherit" />}
              onClick={jumpToSignup}
            />
          </span>
        ) : (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isNavCompact && isMenuOpen ? (
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
              <button
                type="button"
                role="menuitem"
                style={{...styles.mobileMenuLink, color: ACCENT}}
                onClick={jumpToSignup}>
                <Icon icon={KeyRoundIcon} size="sm" color="inherit" />
                Get API key
              </button>
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ============= HERO =============

  const emailCapture =
    confirmedEmail === null ? (
      <form
        onSubmit={event => {
          event.preventDefault();
          submitEmail();
        }}>
        <VStack gap={1}>
          <div
            style={{
              ...styles.emailRow,
              ...(isPhone ? styles.emailRowStacked : null),
            }}>
            <div style={styles.emailInput}>
              <TextInput
                label="Work email"
                isLabelHidden
                placeholder="you@company.com"
                value={email}
                onChange={value => {
                  setEmail(value);
                  setEmailError(null);
                }}
              />
            </div>
            <span className="prl-cta" style={isPhone ? {display: 'flex'} : undefined}>
              <Button
                label="Get API key"
                variant="primary"
                type="submit"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => {}}
              />
            </span>
          </div>
          {emailError !== null ? (
            <p style={styles.emailError}>{emailError}</p>
          ) : null}
          <Text type="supporting" color="secondary">
            {HERO.finePrint}
          </Text>
        </VStack>
      </form>
    ) : (
      <div style={styles.keyCard}>
        <HStack gap={2} vAlign="center">
          <div style={styles.checkDisc} aria-hidden="true">
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          </div>
          <StackItem size="fill">
            <Text size="sm" weight="semibold">
              Sandbox key sent to {confirmedEmail}
            </Text>
          </StackItem>
        </HStack>
        <span style={styles.keyMono}>{SANDBOX_KEY}</span>
        <Text type="supporting" color="secondary">
          Paste it into the pane on the right — the sandbox mirrors
          production shapes exactly.
        </Text>
        <div>
          <Button
            label="Use a different email"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmedEmail(null)}
          />
        </div>
      </div>
    );

  const requestPane = (
    <div style={styles.requestPane}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <TabList
            value={requestLang}
            onChange={value => setRequestLang(value as RequestLang)}
            size="sm"
            aria-label="Request language">
            {REQUEST_LANG_ORDER.map(lang => (
              <Tab
                key={lang}
                value={lang}
                label={REQUEST_SNIPPETS[lang].tabLabel}
              />
            ))}
          </TabList>
        </StackItem>
        <span style={styles.mono}>POST /v1/rates</span>
      </HStack>
      <CodeBlock
        code={REQUEST_SNIPPETS[requestLang].code}
        language={REQUEST_SNIPPETS[requestLang].language}
        width="100%"
        size="sm"
        hasCopyButton
      />
      <HStack gap={2} vAlign="center" wrap="wrap">
        <span className="prl-cta">
          <Button
            label={
              runState === 'running'
                ? 'Sending…'
                : runState === 'done'
                  ? 'Send again'
                  : 'Send request'
            }
            variant="primary"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            onClick={runRequest}
          />
        </span>
        {runState === 'running' ? (
          <Spinner size="sm" aria-label="Sending request" />
        ) : null}
        {runState === 'idle' ? (
          <Text type="supporting" color="secondary">
            Runs against the sandbox — nothing ships.
          </Text>
        ) : null}
      </HStack>
      {runState === 'done' ? (
        <div
          style={
            isReduced ? undefined : {animation: 'prlRiseIn 420ms ease both'}
          }>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Badge variant="success" label="200 OK" />
              <span style={styles.latencyChip}>
                <Icon icon={ZapIcon} size="xsm" color="inherit" />
                {RESPONSE_LATENCY_LABEL}
              </span>
              <Text type="supporting" color="secondary">
                3 rates · 3 carriers
              </Text>
            </HStack>
            <CodeBlock
              code={RESPONSE_JSON}
              language="json"
              width="100%"
              size="sm"
              maxHeight={240}
            />
          </VStack>
        </div>
      ) : null}
    </div>
  );

  // Product theater: the pane under a subtle perspective tilt, with three
  // bobbing satellites that parallax against it. Satellites are decorative
  // (aria-hidden) and only render at split widths.
  const theater = (
    <div ref={theaterRef} style={styles.theater}>
      <div
        style={{
          ...styles.paneShell,
          transform:
            isStacked || isReduced
              ? undefined
              : 'translate3d(calc(var(--px, 0) * -8px), calc(var(--py, 0) * -6px), 0) perspective(1600px) rotateY(-6deg) rotateX(2deg)',
        }}>
        {requestPane}
      </div>
      {!isStacked ? (
        <>
          <div
            aria-hidden="true"
            style={{
              ...styles.satellite,
              top: -20,
              right: -14,
              transform: isReduced
                ? undefined
                : 'translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 8px), 0)',
            }}>
            <div className="prl-bob-a" style={styles.satelliteCard}>
              <Icon icon={ZapIcon} size="sm" color="inherit" />
              <span>{HERO_SATELLITES.metric.label}</span>
              <span style={{color: ACCENT}}>
                {HERO_SATELLITES.metric.value}
              </span>
            </div>
          </div>
          <div
            aria-hidden="true"
            style={{
              ...styles.satellite,
              bottom: -26,
              left: -22,
              transform: isReduced
                ? undefined
                : 'translate3d(calc(var(--px, 0) * 14px), calc(var(--py, 0) * 10px), 0)',
            }}>
            <div className="prl-bob-b" style={styles.satelliteCard}>
              <div style={styles.checkDisc}>
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span>{HERO_SATELLITES.toast.title}</span>
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                  }}>
                  {HERO_SATELLITES.toast.detail}
                </span>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            style={{
              ...styles.satellite,
              top: '38%',
              right: -30,
              transform: isReduced
                ? undefined
                : 'translate3d(calc(var(--px, 0) * 6px), calc(var(--py, 0) * 12px), 0)',
            }}>
            <div className="prl-bob-c" style={styles.satelliteCard}>
              <div style={{display: 'flex', paddingLeft: 6}}>
                {HERO_SATELLITES.carriers.monograms.map(monogram => (
                  <span key={monogram} style={styles.satMonogram}>
                    {monogram}
                  </span>
                ))}
              </div>
              <span>{HERO_SATELLITES.carriers.label}</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const hero = (
    <div
      style={{...styles.sectionAbove}}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      <div
        style={{
          ...columnStyle,
          paddingTop: isPhone ? 48 : 72,
          paddingBottom: isPhone ? 56 : 96,
        }}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <div style={heroEntrance(0)}>
              <Eyebrow>{HERO.eyebrow}</Eyebrow>
            </div>
            <h1
              style={{
                ...styles.heroHeadline,
                fontSize: headlineSize(wrapWidth),
                ...heroEntrance(70),
              }}>
              {HERO.headlineLead}{' '}
              <span style={styles.inkText}>{HERO.headlineInk}</span>
            </h1>
            <p style={{...styles.heroSubcopy, ...heroEntrance(140)}}>
              {HERO.subcopy}
            </p>
            <div ref={heroFormRef} style={heroEntrance(210)}>
              {emailCapture}
            </div>
          </div>
          <div style={heroEntrance(260)}>{theater}</div>
        </div>
      </div>
    </div>
  );

  // ============= CUSTOMER MARQUEE =============

  const marqueeItems = (keyPrefix: string, isHidden: boolean) => (
    <div
      aria-hidden={isHidden || undefined}
      style={{display: 'contents'}}>
      {CUSTOMERS.map(name => (
        <span key={\`\${keyPrefix}-\${name}\`} style={styles.marqueeItem}>
          <span style={styles.marqueeMonogram} aria-hidden="true">
            {name.slice(0, 2).toUpperCase()}
          </span>
          {name}
        </span>
      ))}
    </div>
  );

  const marqueeBand = (
    <section style={styles.section} aria-label="Customers">
      <div
        style={{
          ...columnStyle,
          paddingTop: isStacked ? 12 : 40,
          paddingBottom: isPhone ? 40 : 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-4)',
          alignItems: 'center',
        }}>
        <Text type="supporting" color="secondary">
          Rate shopping in production at
        </Text>
        <div className="prl-marquee" style={{width: '100%'}}>
          <div
            className="prl-marquee-track"
            style={isReduced ? {rowGap: 16} : undefined}>
            {marqueeItems('a', false)}
            {!isReduced ? marqueeItems('b', true) : null}
          </div>
        </div>
      </div>
    </section>
  );

  // ============= ENDPOINTS (asymmetric 5/7, card straddles boundary) =====

  const endpointsSection = (
    <section
      id="endpoints"
      ref={registerSection('endpoints')}
      style={{...styles.sectionAbove, ...styles.bandMuted, ...styles.dotGrid}}>
      <div
        style={{
          ...columnStyle,
          ...bandStyle,
          ...(isStacked ? null : {paddingBottom: 0}),
        }}>
        <Reveal isReduced={isReduced}>
          <div
            style={{
              ...styles.endpointsRow,
              ...(isStacked
                ? {flexDirection: 'column' as const, alignItems: 'stretch'}
                : null),
            }}>
            <div style={styles.endpointsRail}>
              <Eyebrow>Endpoints</Eyebrow>
              <SectionHeading isPhone={isPhone}>
                Five endpoints cover the whole parcel
              </SectionHeading>
              <p style={styles.lede}>
                Rate, buy, verify, track — the same request shapes in sandbox
                and production, versioned under /v1 since 2023.
              </p>
              <div>
                <span style={styles.latencyChip}>
                  <Icon icon={ZapIcon} size="xsm" color="inherit" />
                  every route p50 &lt; 250 ms
                </span>
              </div>
            </div>
            <div
              style={{
                ...styles.endpointsCardWrap,
                marginBottom: isStacked ? 0 : -64,
              }}>
              <div className="prl-raise" style={styles.tableCard}>
                <Table<EndpointRow>
                  data={[...ENDPOINTS]}
                  columns={endpointColumns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= PRICING =============

  const pricingSection = (
    <section
      id="pricing"
      ref={registerSection('pricing')}
      style={styles.section}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            <VStack gap={2}>
              <Eyebrow>Pricing</Eyebrow>
              <SectionHeading isPhone={isPhone}>
                Drag your volume, see the bill
              </SectionHeading>
              <p style={styles.lede}>
                Metered on successful requests only — failed calls and
                sandbox traffic are always free.
              </p>
            </VStack>
            <div
              style={{
                ...styles.pricingCard,
                boxShadow: SHADOW_FLOATING,
                padding: isPhone ? 'var(--spacing-4)' : 'var(--spacing-6)',
              }}>
              <VStack gap={5}>
                <VStack gap={1}>
                  <span
                    style={{
                      ...styles.volumeReadout,
                      ...(isPhone ? styles.volumeReadoutPhone : null),
                    }}>
                    <span style={styles.inkText}>
                      {volume.toLocaleString('en-US')}
                    </span>{' '}
                    requests / month
                  </span>
                  {bestTier !== undefined ? (
                    <Text type="supporting" color="secondary">
                      Cheapest plan at this volume: {bestTier.name} —{' '}
                      {formatUSD(tierPricing.bestCost)}/mo
                    </Text>
                  ) : null}
                </VStack>
                <Slider
                  label="Requests per month"
                  min={0}
                  max={VOLUME_STEPS.length - 1}
                  step={1}
                  value={volumeIndex}
                  onChange={setVolumeIndex}
                  marks={VOLUME_MARKS}
                  formatValue={index =>
                    \`\${formatRequestsShort(VOLUME_STEPS[index])} requests/month\`
                  }
                />
                <VStack gap={2}>
                  {tierPricing.costs.map(({tier, cost}) => {
                    const isBest = tier.id === tierPricing.bestId;
                    return (
                      <div
                        key={tier.id}
                        style={{
                          ...styles.tierRow,
                          ...(isBest ? styles.tierRowBest : null),
                        }}>
                        <VStack gap={0} style={{flex: '1 1 200px', minWidth: 0}}>
                          <HStack gap={2} vAlign="center" wrap="wrap">
                            <Text type="label">{tier.name}</Text>
                            {isBest ? (
                              <span style={styles.bestChip}>Best value</span>
                            ) : null}
                          </HStack>
                          <Text type="supporting" color="secondary">
                            {tier.blurb}
                          </Text>
                        </VStack>
                        <VStack gap={0} style={{flex: '1 1 180px', minWidth: 0}}>
                          <Text size="sm" color="secondary">
                            {formatRequestsShort(tier.includedRequests)}{' '}
                            requests included
                          </Text>
                          <Text size="sm" color="secondary">
                            {tier.overagePer1kUsd === null
                              ? 'Hard cap — upgrade to go past it'
                              : \`then $\${tier.overagePer1kUsd.toFixed(2)} per 1k\`}
                          </Text>
                        </VStack>
                        <span style={styles.tierPrice}>
                          {cost === null
                            ? 'Over limit'
                            : \`\${formatUSD(cost)}/mo\`}
                        </span>
                      </div>
                    );
                  })}
                </VStack>
                {volume >= 5_000_000 ? (
                  <Text type="supporting" color="secondary">
                    Volumes above 5M requests/month qualify for committed-use
                    discounts — talk to us for a custom rate.
                  </Text>
                ) : null}
              </VStack>
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ============= SDKS =============

  const sdkGridColumns = isPhone
    ? '1fr'
    : isStacked
      ? 'repeat(2, 1fr)'
      : 'repeat(3, 1fr)';

  const sdksSection = (
    <section
      id="sdks"
      ref={registerSection('sdks')}
      style={{...styles.section, ...styles.bandMuted}}>
      <div style={{...columnStyle, ...bandStyle}}>
        <VStack gap={5}>
          <Reveal isReduced={isReduced}>
            <VStack gap={2}>
              <Eyebrow>SDKs</Eyebrow>
              <SectionHeading isPhone={isPhone}>
                First-party clients, six languages
              </SectionHeading>
              <p style={styles.lede}>
                Generated from the same spec as the API, released in
                lockstep. Hover or tap a tile for the install command.
              </p>
            </VStack>
          </Reveal>
          <div
            style={{...styles.sdkGrid, gridTemplateColumns: sdkGridColumns}}>
            {SDKS.map((sdk, index) => {
              const isActive = hoveredSdk === sdk.id || pinnedSdk === sdk.id;
              return (
                <Reveal key={sdk.id} isReduced={isReduced} delayMs={index * 70}>
                  <button
                    type="button"
                    className="prl-raise"
                    aria-pressed={pinnedSdk === sdk.id}
                    style={{
                      ...styles.sdkTile,
                      ...(isActive ? styles.sdkTileActive : null),
                    }}
                    onMouseEnter={() => setHoveredSdk(sdk.id)}
                    onMouseLeave={() => setHoveredSdk(null)}
                    onClick={() =>
                      setPinnedSdk(current =>
                        current === sdk.id ? null : sdk.id,
                      )
                    }>
                    <HStack gap={2} vAlign="center">
                      <span style={styles.sdkMonogram} aria-hidden="true">
                        {sdk.monogram}
                      </span>
                      <Text type="label">{sdk.name}</Text>
                    </HStack>
                    {isActive ? (
                      <span style={styles.sdkCommand}>{sdk.install}</span>
                    ) : (
                      <Text type="supporting" color="secondary">
                        {sdk.tagline}
                      </Text>
                    )}
                  </button>
                </Reveal>
              );
            })}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= RELIABILITY (scheme-locked dark, glass + spotlight) =====

  const statsGridColumns = isStacked ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';

  const statsSection = (
    <section
      style={styles.darkBand}
      onPointerMove={onDarkPointerMove}
      onPointerLeave={onDarkPointerLeave}>
      <div
        aria-hidden="true"
        style={{
          ...styles.darkGlow,
          top: -180,
          left: '-6%',
          width: 560,
          height: 560,
          background: \`radial-gradient(closest-side, \${ACCENT_GLOW}, transparent 72%)\`,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          ...styles.darkGlow,
          bottom: -220,
          right: '-8%',
          width: 600,
          height: 600,
          background: \`radial-gradient(closest-side, color-mix(in srgb, var(--color-success) 20%, transparent), transparent 72%)\`,
        }}
      />
      <div aria-hidden="true" style={{...styles.grainOverlay, opacity: 0.05}} />
      <div
        aria-hidden="true"
        style={{...styles.darkSpot, opacity: isSpotOn && !isReduced ? 1 : 0}}
      />
      <div
        style={{...columnStyle, ...bandStyle, position: 'relative'}}
        ref={statsRef}>
        <VStack gap={5}>
          <VStack gap={2}>
            <Eyebrow>Reliability</Eyebrow>
            <SectionHeading isPhone={isPhone}>
              Built to be the boring dependency
            </SectionHeading>
          </VStack>
          <div
            style={{...styles.statsGrid, gridTemplateColumns: statsGridColumns}}>
            {STATS.map((stat, index) => (
              <Reveal key={stat.id} isReduced={isReduced} delayMs={index * 70}>
                <StatCell
                  stat={stat}
                  isActive={statsInView}
                  isReduced={isReduced}
                  isPhone={isPhone}
                  extraChip={stat.id === 'median' ? P99_CHIP : undefined}
                />
              </Reveal>
            ))}
          </div>
          <span style={styles.statLabel}>
            Latency measured at the edge across all regions, trailing 30
            days. Live numbers on the status page, always public.
          </span>
        </VStack>
      </div>
    </section>
  );

  // ============= DOCS (pinned scroll story) =============

  const storyHeight = stageHeight > 0 ? Math.round(stageHeight * 2.4) : 2200;
  const stageInnerHeight =
    stageHeight > 0 ? Math.max(420, stageHeight - STORY_STICKY_TOP - 16) : 620;
  const paneHeight =
    stageHeight > 0
      ? Math.max(320, Math.min(500, stageHeight - 260))
      : 440;

  const docsHeader = (
    <VStack gap={2}>
      <Eyebrow>Documentation</Eyebrow>
      <SectionHeading isPhone={isPhone}>
        Docs your team will actually read
      </SectionHeading>
      <p style={styles.lede}>
        Reference, recipes, and a live playground — kept in sync with the
        API by the same pipeline that ships it.
      </p>
    </VStack>
  );

  const docsBrowseButton = (
    <div>
      <span className="prl-cta">
        <Button
          label="Browse the docs"
          variant="secondary"
          icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </span>
    </div>
  );

  const docsSection = isStoryStatic ? (
    <section id="docs" ref={registerSection('docs')} style={styles.section}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            {docsHeader}
            <div style={{...styles.docsGrid, gridTemplateColumns: '1fr'}}>
              {DOCS_PANES.map((pane, index) => (
                <Reveal
                  key={pane.id}
                  isReduced={isReduced}
                  delayMs={index * 90}>
                  <VStack gap={2} style={{height: '100%'}}>
                    <HStack gap={2} vAlign="center">
                      <span style={styles.stepNumeral}>
                        0{index + 1}
                      </span>
                      <Text type="label">{pane.title}</Text>
                    </HStack>
                    <DocsPane title={pane.title} variant={pane.variant} />
                    <Text type="supporting" color="secondary">
                      {pane.caption}
                    </Text>
                  </VStack>
                </Reveal>
              ))}
            </div>
            {docsBrowseButton}
          </VStack>
        </Reveal>
      </div>
    </section>
  ) : (
    <section id="docs" ref={registerSection('docs')} style={styles.section}>
      <div ref={storyRef} style={{height: storyHeight}}>
        <div
          ref={storyStageRef}
          style={{...styles.storyStage, height: stageInnerHeight}}>
          <div style={columnStyle}>
            <div style={styles.storyRow}>
              <div style={styles.storyRail}>
                {docsHeader}
                <div style={styles.storySteps}>
                  <div style={styles.railTrack} aria-hidden="true">
                    <div ref={railFillRef} style={styles.railFill} />
                  </div>
                  {DOCS_PANES.map((pane, index) => {
                    const isActive = docsStep === index;
                    return (
                      <button
                        key={pane.id}
                        type="button"
                        aria-pressed={isActive}
                        style={{
                          ...styles.stepButton,
                          ...(isActive ? styles.stepButtonActive : null),
                        }}
                        onClick={() => jumpToDocsStep(index)}>
                        <span
                          style={{
                            ...styles.stepNumeral,
                            ...(isActive ? styles.inkText : null),
                          }}>
                          0{index + 1}
                        </span>
                        <VStack gap={0}>
                          <Text type="label">{pane.title}</Text>
                          <Text type="supporting" color="secondary">
                            {pane.caption}
                          </Text>
                        </VStack>
                      </button>
                    );
                  })}
                </div>
                {docsBrowseButton}
              </div>
              <div style={{...styles.paneArea, height: paneHeight}}>
                {DOCS_PANES.map((pane, index) => {
                  const isActive = docsStep === index;
                  return (
                    <div
                      key={pane.id}
                      style={{
                        ...styles.paneLayer,
                        opacity: isActive ? 1 : 0,
                        transform: isActive
                          ? 'none'
                          : 'translateY(14px) scale(0.99)',
                        pointerEvents: isActive ? 'auto' : 'none',
                      }}>
                      <DocsPane title={pane.title} variant={pane.variant} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ============= TESTIMONIALS =============

  const testimonialGridColumns = isStacked ? '1fr' : 'repeat(2, 1fr)';

  const testimonialsSection = (
    <section style={{...styles.section, ...styles.bandMuted}}>
      <div style={{...columnStyle, ...bandStyle}}>
        <VStack gap={5}>
          <Reveal isReduced={isReduced}>
            <VStack gap={2}>
              <Eyebrow>Developers</Eyebrow>
              <SectionHeading isPhone={isPhone}>
                Teams who stopped writing carrier code
              </SectionHeading>
            </VStack>
          </Reveal>
          <div
            style={{
              ...styles.testimonialGrid,
              gridTemplateColumns: testimonialGridColumns,
            }}>
            {TESTIMONIALS.map((testimonial, index) => (
              <Reveal
                key={testimonial.id}
                isReduced={isReduced}
                delayMs={index * 90}>
                <div
                  className="prl-raise"
                  style={{
                    ...styles.quoteCard,
                    marginTop: !isStacked && index === 1 ? 32 : 0,
                  }}>
                  <span style={styles.quoteMark} aria-hidden="true">
                    &ldquo;
                  </span>
                  <p style={styles.quote}>&ldquo;{testimonial.quote}&rdquo;</p>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <div style={styles.avatarDisc} aria-hidden="true">
                      {testimonial.initials}
                    </div>
                    <StackItem size="fill">
                      <VStack gap={0}>
                        <Text size="sm" weight="semibold">
                          {testimonial.name}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {testimonial.role}
                        </Text>
                      </VStack>
                    </StackItem>
                    <span style={styles.latencyChip}>
                      {testimonial.metric}
                    </span>
                  </HStack>
                </div>
              </Reveal>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= FINAL CTA =============

  const finalCtaSection = (
    <section style={styles.finalCtaBand}>
      <div
        aria-hidden="true"
        className="prl-drift-a"
        style={{
          ...styles.auroraBlob,
          top: -160,
          left: '8%',
          width: 460,
          height: 460,
          opacity: 0.4,
          background: \`radial-gradient(closest-side, \${AURORA_WARM}, transparent 72%)\`,
        }}
      />
      <div
        aria-hidden="true"
        className="prl-drift-b"
        style={{
          ...styles.auroraBlob,
          bottom: -200,
          right: '4%',
          width: 520,
          height: 520,
          opacity: 0.35,
          background: \`radial-gradient(closest-side, \${AURORA_COOL}, transparent 72%)\`,
        }}
      />
      <div aria-hidden="true" style={styles.grainOverlay} />
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <div style={styles.finalCta}>
            <h2
              style={{
                ...styles.finalCtaHeading,
                ...(isPhone ? styles.finalCtaHeadingPhone : null),
              }}>
              Start with{' '}
              <span style={styles.inkText}>10,000 free requests</span>
            </h2>
            <Text type="supporting" color="secondary" justify="center">
              A sandbox key in your inbox in under a minute. Rate your first
              parcel before your coffee cools.
            </Text>
            <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
              <span className="prl-cta">
                <Button
                  label="Get API key"
                  variant="primary"
                  icon={<Icon icon={KeyRoundIcon} size="sm" color="inherit" />}
                  onClick={jumpToSignup}
                />
              </span>
              <span className="prl-cta">
                <Button
                  label="Try the request pane"
                  variant="secondary"
                  icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
                  onClick={jumpToSignup}
                />
              </span>
            </HStack>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footerGridColumns = isPhone
    ? '1fr'
    : isStacked
      ? 'repeat(2, 1fr)'
      : 'minmax(220px, 1.4fr) repeat(3, 1fr)';

  const footer = (
    <footer style={styles.footer}>
      <div style={{...columnStyle, paddingBlock: isPhone ? 48 : 72}}>
        <VStack gap={6}>
          <div
            style={{...styles.footerGrid, gridTemplateColumns: footerGridColumns}}>
            <VStack gap={3}>
              <BrandMark />
              <Text type="supporting" color="secondary">
                One shipping API for rates, labels, and tracking across 42
                carriers.
              </Text>
              <div>
                <span style={styles.statusChip}>
                  <StatusDot variant="success" label="Operational" />
                  All systems operational · 99.99% uptime
                </span>
              </div>
            </VStack>
            {FOOTER_COLUMNS.map(column => (
              <VStack key={column.id} gap={1}>
                <Text type="label">{column.heading}</Text>
                {column.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    style={styles.footerLink}
                    onClick={
                      link.anchor !== undefined
                        ? () => jumpToSection(link.anchor as SectionId)
                        : () => {}
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            ))}
          </div>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                © 2026 Parcelrate, Inc. · SOC 2 Type II · GDPR ready
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              api.parcelrate.dev · v1 stable since 2023
            </Text>
          </HStack>
        </VStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={wrapRef} style={{height: '100%'}}>
          <div ref={pageRef} style={styles.page}>
            <style>{GLOBAL_CSS}</style>
            <div style={styles.pageAurora} aria-hidden="true">
              <div
                className="prl-drift-a"
                style={{
                  ...styles.auroraBlob,
                  top: -140,
                  left: '-4%',
                  width: 540,
                  height: 540,
                  opacity: 0.5,
                  background: \`radial-gradient(closest-side, \${AURORA_WARM}, transparent 72%)\`,
                }}
              />
              <div
                className="prl-drift-b"
                style={{
                  ...styles.auroraBlob,
                  top: -60,
                  right: '-6%',
                  width: 520,
                  height: 520,
                  opacity: 0.45,
                  background: \`radial-gradient(closest-side, \${AURORA_COOL}, transparent 72%)\`,
                }}
              />
              <div
                className="prl-drift-a"
                style={{
                  ...styles.auroraBlob,
                  top: 260,
                  left: '34%',
                  width: 420,
                  height: 420,
                  opacity: 0.35,
                  background: \`radial-gradient(closest-side, \${AURORA_FRESH}, transparent 72%)\`,
                }}
              />
              <div style={styles.grainOverlay} />
            </div>
            {navbar}
            {hero}
            {marqueeBand}
            {endpointsSection}
            {pricingSection}
            {sdksSection}
            {statsSection}
            {docsSection}
            {testimonialsSection}
            {finalCtaSection}
            {footer}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};