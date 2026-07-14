var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file press-media-kit.tsx
 * @input Deterministic fixtures only (the fictional "Relay Robotics"
 *   warehouse-automation scale-up: an approved boilerplate paragraph, a
 *   press contact, six fast facts with count-up targets, four logo-asset
 *   variants with download chips, three usage dos and three don'ts with
 *   schematic misuse previews, three schematic product screenshots with
 *   resolution captions, three leadership entries, five brand color
 *   swatches with hex values, six coverage rows from invented outlets,
 *   and a five-milestone founding-story timeline)
 * @output An art-directed press & media kit page: a condensing sticky
 *   navbar with five smooth-scrolling anchor links (collapsing to a menu
 *   at compact widths) and a sheen-swept Download-kit CTA; an aurora +
 *   grain hero staging the press-contact card in a parallax theater with
 *   bobbing satellite chips, next to display-scale gradient-ink type,
 *   the copyable boilerplate card, and the signature staged .zip
 *   progress button; fast-fact tiles that overlap the hero boundary,
 *   count up on first view, and copy on click; logo tiles on checkered
 *   backgrounds beside a sticky intro rail plus a dos/don'ts split with
 *   misuse previews; an asymmetric screenshot spread; leadership
 *   monogram tiles; brand color swatches with copy-hex feedback; a
 *   scheme-locked dark coverage vault with a pointer spotlight, an
 *   outlet marquee, and glass rows; a pinned scroll-driven founding
 *   story (sticky stage, clickable milestone rail, progress-filled
 *   line); and a footer. Every copy/download control gives visible
 *   feedback (copied flip or a corner Toast) so the wiring is provable.
 * @position Page template; emitted by \`astryx template press-media-kit\`
 *
 * Frame: Layout height="fill", content-only — a marketing page owns its
 * own chrome, so there is no LayoutHeader. LayoutContent (padding 0)
 * hosts a single scroll container div; inside it the navbar is
 * position:sticky top:0 and full-bleed bands alternate around a 1080px
 * column. The Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - Nav anchors smooth-scroll the container to real section bands with
 *   a sticky-nav allowance; onScroll spies the last band above the fold
 *   and highlights the matching link (aria-current). After 24px of
 *   scroll the navbar condenses (tinted color-mix surface + hairline).
 *   At compact widths the links collapse behind a menu button whose
 *   dropdown closes on Escape, outside pointerdown, or any selection.
 * - The signature hero moment: "Download kit (.zip 24 MB)" runs a
 *   staged deterministic progress fill (fixed 4%/70ms interval — no
 *   randomness), then flips to a saved state with a Toast receipt and a
 *   "Download again" reset. prefers-reduced-motion skips straight to
 *   the saved state.
 * - Copy affordances (boilerplate, press email, every fast-fact tile,
 *   every brand-color hex) write to the clipboard when available and
 *   always flip to an inline "Copied" state for 1.8s; only one copied
 *   flag is live at a time, mirroring a real single-clipboard.
 * - Hero theater: the press-contact card parallaxes ±6-8px toward the
 *   pointer (spring-ish decelerate transition) while satellite chips
 *   bob on 7-9.5s keyframes with negative delays; both are off under
 *   reduced motion and at stacked (touch) widths.
 * - Fast-fact numbers count up (~900ms, decelerate) the first time the
 *   band is 30% visible; reduced motion renders the final figures.
 * - The founding story pins: a sticky ~620px stage inside a fixed
 *   ~1560px wrapper (px, not vh — the inline demo scrolls the top
 *   window, so viewport units would balloon the travel);
 *   scroll progress (container rect vs wrapper rect) advances five
 *   milestone states and fills the rail line (transform: scaleY only).
 *   Milestones are also clickable buttons that scroll the container to
 *   the matching progress window. Reduced motion (or unmeasured
 *   heights) renders a static stacked sequence instead.
 * - The dark coverage vault tracks the pointer with a radial spotlight
 *   (CSS vars --pmk-mx/--pmk-my) and loops an outlet marquee (48s,
 *   pause on hover; static wrapped chips under reduced motion).
 * - Section content reveals once with staggered rise+fade (60-90ms per
 *   child); reduced motion renders everything visible immediately.
 * - Logo/screenshot/headshot download chips and coverage external-link
 *   glyphs fire named Toasts (pseudo-downloads; nothing is dead).
 *
 * Color policy: token-pure except (1) ONE quarantined brand accent
 * literal (see ACCENT below with contrast math) with every tint, glow,
 * and aurora derived via color-mix so no second accent literal exists;
 * (2) the scheme-locked brand ART surfaces — the dark logo-asset tile,
 * the leadership monogram gradients, and the dark coverage vault
 * (colorScheme:'dark', identical in both themes, built from the ink
 * plate #15181D this surface already used plus white/black alphas);
 * and (3) the brand color swatches, whose hex values ARE the fixture
 * content a journalist would copy — the swatch chips render exactly
 * the hex they document.
 *
 * Responsive contract (measured via ResizeObserver on the scroll
 * container — the inline demo stage is ~1045px, so viewport media
 * queries would never fire there):
 * - Column: max-width 1080px, centered; bands paint edge to edge.
 * - >920px: hero splits copy/theater 7:5, facts run an asymmetric
 *   4-track grid with a double-width gradient-numeral signature tile,
 *   logos split 5:7 with a sticky intro rail, dos/don'ts side by side,
 *   screenshots split 7:5 (featured + stacked), leadership 3-up.
 * - <=920px: hero stacks (parallax off), facts drop to 2-up, logo tiles
 *   2-up, dos/don'ts stack, screenshots and leadership single column,
 *   the pinned story stacks its milestone rail above the stage card.
 * - <=820px: nav links collapse behind the menu button + dropdown.
 * - <=620px: facts drop to 1-up, swatch cards go full width, coverage
 *   rows wrap their date/action line below the headline, paddings
 *   tighten. Holds at 390px in the phone artboard with no overflow-x.
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
import {Icon} from '@astryxdesign/core/Icon';
import {Toast} from '@astryxdesign/core/Toast';
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  MenuIcon,
  PhoneIcon,
  XIcon,
} from 'lucide-react';

// ============= PAINT CONSTANTS =============

/**
 * Quarantined brand accent — Relay Robotics "Signal Orange".
 * Light #C2410C on #FFFFFF: L≈0.153 → contrast ≈ 5.2:1 (AA text).
 * Dark #FDA26B on #1C1C1E: L≈0.478 → contrast ≈ 8.6:1 (AAA text).
 * Every accent tint below derives from this ONE literal via color-mix.
 */
const ACCENT = 'light-dark(#C2410C, #FDA26B)';
const ACCENT_SOFT = \`color-mix(in srgb, \${ACCENT} 12%, transparent)\`;
const ACCENT_FAINT = \`color-mix(in srgb, \${ACCENT} 6%, transparent)\`;
const ACCENT_LINE = \`color-mix(in srgb, \${ACCENT} 32%, transparent)\`;
const ACCENT_GHOST = \`color-mix(in srgb, \${ACCENT} 9%, transparent)\`;

/** Success token (same fallback literal the dos/don'ts already use). */
const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';

/** Aurora blob inks — accent/success color-mixes only, no new hues. */
const AURORA_A = \`color-mix(in srgb, \${ACCENT} 42%, transparent)\`;
const AURORA_B = \`color-mix(in srgb, \${SUCCESS} 26%, transparent)\`;
const AURORA_C = \`color-mix(in srgb, \${ACCENT} 20%, transparent)\`;

/**
 * Scheme-locked ART ink — the near-black plate the original dark logo
 * tile already used; the coverage vault reuses it (identical in both
 * themes, like a printed brand spread).
 */
const INK = '#15181D';

/** On-accent label ink (reuses white + the ART ink literal). */
const ON_ACCENT = 'light-dark(#FFFFFF, #15181D)';

/** Depth tiers — used consistently across every card surface. */
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';
const SHADOW_GLASS =
  'inset 0 0 0 1px rgba(255, 255, 255, 0.09), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.55)';

/** Grain texture: inline SVG feTurbulence data-URI (no network). */
const GRAIN =
  'url("data:image/svg+xml;utf8,' +
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
  "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85'" +
  " numOctaves='2' stitchTiles='stitch'/></filter>" +
  "<rect width='120' height='120' filter='url(%23g)'/></svg>\\")";

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

/** Sticky-nav height; smooth-scroll and the spy both allow for it. */
const NAV_ALLOWANCE = 64;
const SPY_OFFSET = 120;

/**
 * Pinned founding-story sizing — fixed px on purpose. The demo renders
 * this page inline in the top browser window, so vh/window-derived
 * heights resolve against the WINDOW, not the ~920px stage, and a
 * ~250vh pin wrapper produced thousands of px of near-empty scroll.
 * The stage is a fixed ~620px card theater and the pin wrapper is
 * ~2.5× that, so the five milestone windows advance across a short,
 * fully-authored travel.
 */
const STORY_STAGE_HEIGHT = 620;
const STORY_PIN_HEIGHT = 1560;

/** Decelerate bezier shared by reveals, hovers, and the story card. */
const DECEL = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Scoped stylesheet: aurora drift, satellite bobbing, the outlet
// marquee, button sheen sweeps, and card hover raises all need
// keyframes / pseudo-class selectors that inline styles can't express.
const SCOPE = 'pmk-root';

const TEMPLATE_CSS = \`
@keyframes pmk-drift-a {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to { transform: translate3d(70px, 44px, 0) rotate(24deg); }
}
@keyframes pmk-drift-b {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to { transform: translate3d(-60px, -36px, 0) rotate(-18deg); }
}
@keyframes pmk-bob {
  from { transform: translateY(-6px); }
  to { transform: translateY(6px); }
}
@keyframes pmk-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes pmk-story-rise {
  from { opacity: 0; transform: translateY(14px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
.\${SCOPE} .pmk-aurora-a {
  animation: pmk-drift-a 38s ease-in-out infinite alternate;
}
.\${SCOPE} .pmk-aurora-b {
  animation: pmk-drift-b 44s ease-in-out infinite alternate;
}
.\${SCOPE} .pmk-bob-1 { animation: pmk-bob 7s ease-in-out -2s infinite alternate; }
.\${SCOPE} .pmk-bob-2 { animation: pmk-bob 8.5s ease-in-out -4s infinite alternate; }
.\${SCOPE} .pmk-bob-3 { animation: pmk-bob 9.5s ease-in-out -1s infinite alternate; }
.\${SCOPE} .pmk-marquee-track {
  display: flex;
  width: max-content;
  animation: pmk-marquee 48s linear infinite;
}
.\${SCOPE} .pmk-marquee:hover .pmk-marquee-track {
  animation-play-state: paused;
}
.\${SCOPE} .pmk-btn {
  transition: transform 0.18s \${DECEL}, box-shadow 0.18s \${DECEL};
}
.\${SCOPE} .pmk-btn:hover { transform: translateY(-1px); }
.\${SCOPE} .pmk-btn:active { transform: scale(0.98); }
.\${SCOPE} .pmk-sheen {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 55%;
  background: linear-gradient(105deg, transparent 20%,
    rgba(255, 255, 255, 0.35) 50%, transparent 80%);
  transform: translateX(-170%) skewX(-12deg);
  transition: transform 0.6s \${DECEL};
  pointer-events: none;
}
.\${SCOPE} .pmk-btn:hover .pmk-sheen {
  transform: translateX(290%) skewX(-12deg);
}
.\${SCOPE} .pmk-card {
  transition: transform 0.2s \${DECEL}, box-shadow 0.2s \${DECEL};
}
.\${SCOPE} .pmk-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px \${ACCENT_LINE}, \${SHADOW_FLOATING};
}
.\${SCOPE} .pmk-glass {
  transition: transform 0.2s \${DECEL}, box-shadow 0.2s \${DECEL};
}
.\${SCOPE} .pmk-glass:hover {
  transform: translateY(-2px);
  box-shadow: inset 0 0 0 1px \${ACCENT_LINE}, \${SHADOW_GLASS};
}
.\${SCOPE} .pmk-story-card-anim {
  animation: pmk-story-rise 420ms \${DECEL};
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .pmk-aurora-a,
  .\${SCOPE} .pmk-aurora-b,
  .\${SCOPE} .pmk-bob-1,
  .\${SCOPE} .pmk-bob-2,
  .\${SCOPE} .pmk-bob-3,
  .\${SCOPE} .pmk-marquee-track,
  .\${SCOPE} .pmk-story-card-anim { animation: none; }
  .\${SCOPE} .pmk-btn,
  .\${SCOPE} .pmk-sheen,
  .\${SCOPE} .pmk-card,
  .\${SCOPE} .pmk-glass { transition: none; }
  .\${SCOPE} .pmk-btn:hover,
  .\${SCOPE} .pmk-btn:active,
  .\${SCOPE} .pmk-card:hover,
  .\${SCOPE} .pmk-glass:hover { transform: none; }
}
\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns the scroll spy and hosts the sticky navbar.
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
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    paddingInline: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  bandTinted: {
    backgroundColor: 'var(--color-background-muted)',
  },
  // Texture layers.
  grainLayer: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN,
    backgroundSize: '120px 120px',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  dotGridLayer: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 1.6px)',
    backgroundSize: '22px 22px',
    opacity: 0.5,
    maskImage: 'linear-gradient(180deg, #000 0%, transparent 78%)',
    WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 78%)',
    pointerEvents: 'none',
  },
  auroraBlob: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition: 'background-color 0.25s ease, border-color 0.25s ease',
  },
  navBarCondensed: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
    borderBottom: '1px solid var(--color-border)',
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
    minHeight: 60,
  },
  navInnerCondensed: {
    minHeight: 50,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 38,
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
  navCta: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 38,
    paddingInline: 16,
    borderRadius: 10,
    border: 'none',
    backgroundColor: ACCENT,
    color: ON_ACCENT,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: SHADOW_RAISED,
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
  iconButton40: {
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
  // ---- hero ----
  heroBand: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: ACCENT_FAINT,
  },
  eyebrowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 26,
    paddingInline: 12,
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_LINE}\`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  heroHeadline: {
    fontWeight: 720,
    lineHeight: 1.03,
    letterSpacing: '-0.025em',
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  gradientInk: {
    backgroundImage: \`linear-gradient(98deg, \${ACCENT} 10%, color-mix(in srgb, \${ACCENT} 55%, var(--color-text-primary)) 90%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '56ch',
    color: 'var(--color-text-secondary)',
  },
  heroSplit: {
    display: 'flex',
    gap: 'var(--spacing-7)',
    alignItems: 'center',
  },
  heroSplitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
  },
  panelCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxShadow: SHADOW_RAISED,
  },
  boilerplateText: {
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '56ch',
    color: 'var(--color-text-primary)',
  },
  // Signature download pseudo-button with a staged progress fill.
  downloadButton: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    paddingInline: 20,
    borderRadius: 12,
    border: 'none',
    backgroundColor: ACCENT,
    color: ON_ACCENT,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: SHADOW_RAISED,
  },
  downloadFill: {
    position: 'absolute',
    inset: 0,
    right: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  },
  downloadLabel: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  // Hero theater.
  theater: {
    position: 'relative',
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-6)',
  },
  theaterPerspective: {
    perspective: 1200,
    width: '100%',
    maxWidth: 400,
  },
  theaterCard: {
    position: 'relative',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxShadow: SHADOW_FLOATING,
    willChange: 'transform',
  },
  satellite: {
    position: 'absolute',
    zIndex: 2,
  },
  satelliteInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: '10px 14px',
    boxShadow: SHADOW_FLOATING,
  },
  satelliteIconTile: {
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
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 16,
    fontWeight: 700,
    border: \`1px solid \${ACCENT_LINE}\`,
  },
  contactRowButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontSize: 14,
    textAlign: 'left',
  },
  monoText: {
    fontFamily: MONO,
    fontSize: 13,
  },
  // ---- fast facts ----
  factsGrid: {
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  factTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: 124,
    boxShadow: SHADOW_RAISED,
  },
  factLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    color: 'var(--color-text-secondary)',
  },
  factLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  factValue: {
    fontSize: 38,
    fontWeight: 720,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  factValueSignature: {
    fontSize: 56,
    backgroundImage: \`linear-gradient(98deg, \${ACCENT} 10%, color-mix(in srgb, \${ACCENT} 55%, var(--color-text-primary)) 90%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  // ---- logo assets ----
  logoSplit: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  logoIntroRail: {
    flex: '5 1 0',
    minWidth: 0,
    position: 'sticky',
    top: NAV_ALLOWANCE + 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  logoGrid: {
    flex: '7 1 0',
    minWidth: 0,
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  logoTileCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: SHADOW_RAISED,
  },
  // Checkerboard = the universal "transparent asset" preview surface.
  checker: {
    height: 112,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-body)',
    backgroundImage:
      'linear-gradient(45deg, var(--color-background-muted) 25%, transparent 25%, transparent 75%, var(--color-background-muted) 75%), linear-gradient(45deg, var(--color-background-muted) 25%, transparent 25%, transparent 75%, var(--color-background-muted) 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 8px 8px',
  },
  // Scheme-locked ART surface: the dark logo asset previews on the same
  // near-black plate in both app themes, like a real asset browser.
  checkerDark: {
    colorScheme: 'dark',
    backgroundColor: INK,
    backgroundImage:
      'linear-gradient(45deg, rgba(255, 255, 255, 0.07) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.07) 75%), linear-gradient(45deg, rgba(255, 255, 255, 0.07) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.07) 75%)',
  },
  logoTileMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 'var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
  },
  downloadChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // ---- usage dos / don'ts ----
  usageSplit: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  usageSplitStacked: {
    flexDirection: 'column',
  },
  usageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  usageDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  usageDiscDo: {
    backgroundColor:
      'light-dark(rgba(52, 168, 83, 0.14), rgba(52, 168, 83, 0.24))',
    color: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  usageDiscDont: {
    backgroundColor:
      'light-dark(rgba(179, 38, 30, 0.10), rgba(242, 184, 181, 0.16))',
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  usagePreview: {
    width: 76,
    height: 44,
    flexShrink: 0,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  // ---- schematic screenshots ----
  shotSplit: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  shotCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: SHADOW_RAISED,
  },
  shotStage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-3)',
    boxSizing: 'border-box',
    backgroundImage: \`radial-gradient(80% 100% at 50% 0%, \${ACCENT_FAINT}, transparent 70%)\`,
    backgroundColor: 'var(--color-background-muted)',
  },
  mockWindow: {
    width: '100%',
    maxWidth: 264,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    overflow: 'hidden',
    boxShadow: SHADOW_RAISED,
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 10px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
  },
  mockBody: {
    display: 'flex',
    gap: 8,
    padding: 10,
  },
  mockBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  phoneFrame: {
    width: 88,
    height: 148,
    borderRadius: 18,
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: SHADOW_RAISED,
    padding: 10,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  shotMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 'var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
  },
  // ---- leadership ----
  leaderGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  leaderTile: {
    height: 132,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: '0.04em',
    // Scheme-locked ART: monogram gradients are brand headshot stand-ins
    // and must not reflow with the app theme.
    colorScheme: 'dark',
    color: '#FFFFFF',
  },
  // ---- brand colors ----
  swatchRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
  },
  swatchCard: {
    flex: '1 1 168px',
    minWidth: 148,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: SHADOW_RAISED,
  },
  swatchChip: {
    height: 72,
  },
  swatchMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 'var(--spacing-3)',
  },
  copyHexButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    fontFamily: MONO,
    fontSize: 13,
    minHeight: 28,
  },
  // ---- dark coverage vault (scheme-locked ART band) ----
  vaultBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: INK,
  },
  vaultGlow: {
    position: 'absolute',
    inset: 0,
    backgroundImage: \`radial-gradient(52% 60% at 10% 0%, \${AURORA_A}, transparent 65%), radial-gradient(44% 58% at 92% 100%, \${AURORA_B}, transparent 70%)\`,
    opacity: 0.55,
    pointerEvents: 'none',
  },
  vaultSpotlight: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(420px circle at var(--pmk-mx, 50%) var(--pmk-my, 30%), rgba(255, 255, 255, 0.07), transparent 70%)',
    pointerEvents: 'none',
  },
  vaultTextSecondary: {
    color: 'rgba(255, 255, 255, 0.64)',
  },
  marqueeViewport: {
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
  },
  marqueeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingInline: 16,
    marginRight: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.09)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  glassRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: SHADOW_GLASS,
  },
  glassRowWrapped: {
    flexWrap: 'wrap',
  },
  outletTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
    boxShadow: \`inset 0 0 0 1px \${ACCENT_LINE}\`,
  },
  vaultIconButton: {
    width: 34,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    color: '#FFFFFF',
  },
  // ---- pinned founding story ----
  storyStage: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
    paddingTop: NAV_ALLOWANCE,
  },
  storyRailButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 48,
    padding: '6px 10px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--color-text-secondary)',
  },
  storyRailButtonActive: {
    backgroundColor: ACCENT_SOFT,
    color: 'var(--color-text-primary)',
  },
  storyRailIndex: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
  },
  storyRailIndexActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    color: ON_ACCENT,
  },
  storyLineTrack: {
    position: 'relative',
    width: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  storyLineFill: {
    position: 'absolute',
    inset: 0,
    backgroundColor: ACCENT,
    transformOrigin: 'top',
  },
  storyCard: {
    position: 'relative',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxShadow: SHADOW_FLOATING,
    overflow: 'hidden',
    minHeight: 240,
  },
  storyGhostNumeral: {
    position: 'absolute',
    top: -34,
    right: 4,
    fontSize: 150,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT_GHOST,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  storyTitle: {
    fontSize: 27,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  storyCopy: {
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '52ch',
    color: 'var(--color-text-secondary)',
  },
  // Static fallback timeline (reduced motion / unmeasured heights).
  timelineItem: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  timelineRail: {
    position: 'relative',
    width: 20,
    flexShrink: 0,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 9,
    width: 2,
    backgroundColor: 'var(--color-border)',
  },
  timelineDot: {
    position: 'absolute',
    top: 5,
    left: 4,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    border: '2px solid var(--color-background-body)',
    boxSizing: 'content-box',
  },
  timelineBody: {
    paddingBottom: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
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
  },
  // ---- toast ----
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 340,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Relay Robotics scale-up.
// No Date.now, no randomness, no network assets, no real outlets.

const BRAND = {
  name: 'Relay Robotics',
  updated: 'Updated Jul 8, 2026',
};

const BOILERPLATE =
  'Relay Robotics builds autonomous picking robots that work alongside ' +
  'people in warehouses. Founded in Boulder, Colorado in 2019, Relay has ' +
  'deployed more than 3,400 robots across 14 countries for 120 warehouse ' +
  'and 3PL operators. The company employs 240 people across four offices ' +
  'and has raised $86M, most recently a $52M Series C led by Meridian ' +
  'Growth in June 2026 to fund its European expansion from Rotterdam.';

const PRESS_CONTACT = {
  name: 'Nadia Reyes',
  initials: 'NR',
  title: 'Head of Communications',
  email: 'press@relayrobotics.com',
  phone: '+1 (720) 555-0139',
  note:
    'We reply within one business day. For embargoed briefings, put ' +
    'EMBARGO in the subject line.',
};

type SectionId = 'facts' | 'logos' | 'photos' | 'coverage' | 'story';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'facts', label: 'Fast facts'},
  {id: 'logos', label: 'Logos'},
  {id: 'photos', label: 'Screenshots'},
  {id: 'coverage', label: 'Coverage'},
  {id: 'story', label: 'Our story'},
];

interface FastFact {
  id: string;
  label: string;
  /** Static display when there is no count-up target. */
  staticValue?: string;
  /** Count-up target + formatter for numeric facts. */
  target?: number;
  format?: (value: number) => string;
  caption: string;
  /** The signature tile gets the double track + gradient numeral. */
  isSignature?: boolean;
}

const FAST_FACTS: readonly FastFact[] = [
  {
    id: 'robots',
    label: 'Robots deployed',
    target: 3400,
    format: value => Math.round(value).toLocaleString('en-US'),
    caption: 'In 14 countries · 99.6% uptime',
    isSignature: true,
  },
  {
    id: 'founded',
    label: 'Founded',
    staticValue: '2019',
    caption: 'Boulder garage, two founders',
  },
  {
    id: 'hq',
    label: 'Headquarters',
    staticValue: 'Boulder, CO',
    caption: 'EU hub in Rotterdam since 2026',
  },
  {
    id: 'headcount',
    label: 'Headcount',
    target: 240,
    format: value => \`\${Math.round(value)}\`,
    caption: 'Across 4 offices',
  },
  {
    id: 'funding',
    label: 'Total funding',
    target: 86,
    format: value => \`$\${Math.round(value)}M\`,
    caption: 'Series C led by Meridian Growth',
  },
  {
    id: 'customers',
    label: 'Customers',
    target: 120,
    format: value => \`\${Math.round(value)}\`,
    caption: 'Warehouse & 3PL operators',
  },
];

function factClipboard(fact: FastFact): string {
  const value =
    fact.staticValue ??
    (fact.target !== undefined && fact.format !== undefined
      ? fact.format(fact.target)
      : '');
  return \`\${fact.label}: \${value} (\${fact.caption})\`;
}

type LogoVariant = 'light' | 'dark' | 'mono' | 'glyph';

const LOGO_ASSETS: readonly {
  id: LogoVariant;
  label: string;
  caption: string;
}[] = [
  {id: 'light', label: 'Primary — light', caption: 'For light surfaces'},
  {id: 'dark', label: 'Primary — dark', caption: 'For dark surfaces'},
  {id: 'mono', label: 'Monochrome', caption: 'For single-ink print'},
  {id: 'glyph', label: 'Glyph only', caption: 'For favicons & avatars'},
];

const USAGE_DOS: readonly {id: string; text: string}[] = [
  {id: 'space', text: 'Keep clear space of at least one glyph-width'},
  {id: 'mono', text: 'Use the monochrome mark over photography'},
  {id: 'palette', text: 'Pair the mark only with approved brand colors'},
];

const USAGE_DONTS: readonly {
  id: 'stretch' | 'recolor' | 'contrast';
  text: string;
}[] = [
  {id: 'stretch', text: "Don't stretch, skew, or rotate the mark"},
  {id: 'recolor', text: "Don't recolor the mark outside the palette"},
  {id: 'contrast', text: "Don't set the mark on low-contrast fills"},
];

const SCREENSHOTS: readonly {
  id: 'fleet' | 'telemetry' | 'mobile';
  title: string;
  file: string;
  resolution: string;
}[] = [
  {
    id: 'fleet',
    title: 'Fleet dashboard',
    file: 'relay-fleet-dashboard.png',
    resolution: '3840 × 2160 · 4.6 MB',
  },
  {
    id: 'telemetry',
    title: 'Pick-path telemetry',
    file: 'relay-pick-telemetry.png',
    resolution: '2880 × 1800 · 3.1 MB',
  },
  {
    id: 'mobile',
    title: 'Operator mobile app',
    file: 'relay-operator-app.png',
    resolution: '1170 × 2532 · 1.8 MB',
  },
];

const LEADERS: readonly {
  id: string;
  name: string;
  initials: string;
  title: string;
  /** Scheme-locked art gradient (see Color policy). */
  gradient: [string, string];
}[] = [
  {
    id: 'voss',
    name: 'Mara Voss',
    initials: 'MV',
    title: 'Co-founder & CEO',
    gradient: ['#C2410C', '#7C2D12'],
  },
  {
    id: 'lindqvist',
    name: 'Theo Lindqvist',
    initials: 'TL',
    title: 'Co-founder & CTO',
    gradient: ['#334155', '#0F172A'],
  },
  {
    id: 'raghavan',
    name: 'Priya Raghavan',
    initials: 'PR',
    title: 'VP of Operations',
    gradient: ['#B45309', '#713F12'],
  },
];

// Swatch hexes are fixture CONTENT (the values a journalist copies);
// the chips render exactly the hex they document (see Color policy).
const BRAND_COLORS: readonly {
  id: string;
  name: string;
  hex: string;
  /** Hairline for the near-white swatch so it doesn't vanish. */
  needsBorder?: boolean;
}[] = [
  {id: 'signal', name: 'Signal Orange', hex: '#C2410C'},
  {id: 'graphite', name: 'Graphite', hex: '#1F2933'},
  {id: 'chassis', name: 'Chassis Grey', hex: '#9AA5B1'},
  {id: 'safety', name: 'Safety Green', hex: '#2F9E44'},
  {id: 'cloud', name: 'Cloud White', hex: '#F5F7FA', needsBorder: true},
];

const COVERAGE: readonly {
  id: string;
  outlet: string;
  initials: string;
  headline: string;
  date: string;
}[] = [
  {
    id: 'ledger',
    outlet: 'The Automation Ledger',
    initials: 'AL',
    headline:
      'Relay Robotics raises $52M to bring its picker fleet to Europe',
    date: 'Jun 18, 2026',
  },
  {
    id: 'techcurrent',
    outlet: 'TechCurrent',
    initials: 'TC',
    headline: 'Inside the Boulder lab where robots learn to unload trucks',
    date: 'May 2, 2026',
  },
  {
    id: 'warehouse',
    outlet: 'Warehouse Weekly',
    initials: 'WW',
    headline:
      "Relay's Series C signals a consolidation wave in warehouse automation",
    date: 'Jun 20, 2026',
  },
  {
    id: 'supplyline',
    outlet: 'The Supply Line',
    initials: 'SL',
    headline:
      'How a 240-person startup shipped 3,400 robots without a single recall',
    date: 'Mar 9, 2026',
  },
  {
    id: 'roboticsnow',
    outlet: 'Robotics Now',
    initials: 'RN',
    headline: "Relay Robotics' RX-4 named warehouse product of the year",
    date: 'Jan 22, 2026',
  },
  {
    id: 'foundersignal',
    outlet: 'Founder Signal',
    initials: 'FS',
    headline:
      'Mara Voss on hardware margins, patience, and the case against hype',
    date: 'Feb 11, 2026',
  },
];

const MILESTONES: readonly {
  id: string;
  date: string;
  title: string;
  copy: string;
}[] = [
  {
    id: 'garage',
    date: 'Mar 2019',
    title: 'Founded in a Boulder garage',
    copy:
      'Mara Voss and Theo Lindqvist assemble the RX-1 prototype from ' +
      'salvaged forklift parts and a climbing-gym winch.',
  },
  {
    id: 'pilot',
    date: 'Nov 2020',
    title: 'First paid pilot',
    copy:
      'Six robots at a Denver 3PL pick 41,000 orders through the ' +
      'holiday peak with zero safety incidents.',
  },
  {
    id: 'seriesb',
    date: 'Jun 2022',
    title: 'Series B — $34M',
    copy:
      'Opens the Reno factory, ships the RX-3, and passes 100 ' +
      'employees and 40 live customer sites.',
  },
  {
    id: 'thousandth',
    date: 'Sep 2024',
    title: '1,000th robot ships',
    copy:
      'Fleet-wide uptime reaches 99.6% and the RX-4 adds truck ' +
      'unloading — still no recalls.',
  },
  {
    id: 'seriesc',
    date: 'Jun 2026',
    title: 'Series C — $52M',
    copy:
      'Meridian Growth leads the round; Relay opens its Rotterdam hub ' +
      'and begins European deployments.',
  },
];

// ============= HOOKS =============

/**
 * Measures the scroll container with a ResizeObserver — the inline demo
 * stage is ~1045px wide inside a 1440px window, so viewport media
 * queries never fire there.
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

/** Companion height measure; sizes the pinned story stage in px. */
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

/** Live prefers-reduced-motion flag; false where matchMedia is absent. */
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
 * True once the node has intersected the viewport (30% visible), then
 * stays true (fire once). Falls back to visible when
 * IntersectionObserver is unavailable so nothing hides in static runs.
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
      {threshold: 0.3},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases 0 → target (ease-out cubic, ~900ms decelerate) once \`isActive\`
 * flips true. Reduced motion and rAF-less environments snap to target.
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
 * Rise+fade scroll reveal (16px + scale .985, fire once). \`delay\`
 * staggers siblings 60-90ms apart. Reduced motion renders children
 * visible with no transition.
 */
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView();
  const shown = reduced || inView;
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px) scale(0.985)',
        transition: reduced
          ? 'none'
          : \`opacity 560ms \${DECEL} \${delay}ms, transform 560ms \${DECEL} \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

/** The Relay glyph: two nodes joined by a relay link. */
function RelayGlyph({size = 22, color}: {size?: number; color: string}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M8.7 15.3 15.3 8.7"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle cx="6.8" cy="17.2" r="3" fill={color} />
      <circle cx="17.2" cy="6.8" r="3" fill={color} />
    </svg>
  );
}

/** Glyph + wordmark lockup; variant picks the logo-asset treatment. */
function RelayLockup({
  variant,
  size = 22,
}: {
  variant: LogoVariant;
  size?: number;
}) {
  const glyphColor =
    variant === 'dark'
      ? '#FFFFFF' // sits on the scheme-locked dark checker plate
      : variant === 'mono'
        ? 'var(--color-text-primary)'
        : ACCENT;
  const wordColor =
    variant === 'dark' ? '#FFFFFF' : 'var(--color-text-primary)';
  return (
    <span
      style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
      aria-hidden="true">
      <RelayGlyph size={size} color={glyphColor} />
      {variant !== 'glyph' && (
        <span
          style={{
            fontSize: size * 0.62,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: wordColor,
            whiteSpace: 'nowrap',
          }}>
          RELAY{' '}
          <span style={{fontWeight: 500, opacity: 0.75}}>ROBOTICS</span>
        </span>
      )}
    </span>
  );
}

/** Uppercase section eyebrow chip + display heading + support line. */
function SectionIntro({
  eyebrow,
  title,
  caption,
  headingSize = 36,
  onDark = false,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
  headingSize?: number;
  onDark?: boolean;
}) {
  return (
    <VStack gap={2}>
      <HStack>
        <span style={styles.eyebrowChip}>{eyebrow}</span>
      </HStack>
      <h2
        style={{
          fontSize: headingSize,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0,
          color: onDark ? '#FFFFFF' : 'var(--color-text-primary)',
        }}>
        {title}
      </h2>
      {caption !== undefined && (
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '56ch',
            color: onDark
              ? 'rgba(255, 255, 255, 0.64)'
              : 'var(--color-text-secondary)',
          }}>
          {caption}
        </p>
      )}
    </VStack>
  );
}

/** One count-up figure inside a fast-fact tile. */
function FactValue({fact, isActive}: {fact: FastFact; isActive: boolean}) {
  const value = useCountUp(fact.target ?? 0, isActive);
  const valueStyle: CSSProperties = {
    ...styles.factValue,
    ...(fact.isSignature ? styles.factValueSignature : null),
  };
  if (fact.staticValue !== undefined) {
    return <span style={valueStyle}>{fact.staticValue}</span>;
  }
  return (
    <span style={valueStyle}>
      {fact.format !== undefined ? fact.format(value) : Math.round(value)}
    </span>
  );
}

/** Tiny misuse preview for the don'ts column. */
function MisusePreview({kind}: {kind: 'stretch' | 'recolor' | 'contrast'}) {
  if (kind === 'stretch') {
    return (
      <span style={{transform: 'scaleX(1.7)', display: 'inline-flex'}}>
        <RelayGlyph size={20} color={ACCENT} />
      </span>
    );
  }
  if (kind === 'recolor') {
    return (
      <RelayGlyph
        size={20}
        color="var(--color-error, light-dark(#B3261E, #F2B8B5))"
      />
    );
  }
  // Low contrast: the glyph nearly disappears into the muted fill.
  return (
    <RelayGlyph
      size={20}
      color="color-mix(in srgb, var(--color-text-secondary) 22%, transparent)"
    />
  );
}

/** CSS-drawn schematic screenshot stand-ins (no network assets). */
function ScreenshotArt({kind}: {kind: 'fleet' | 'telemetry' | 'mobile'}) {
  if (kind === 'fleet') {
    return (
      <div style={styles.mockWindow}>
        <div style={styles.mockChrome}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
        </div>
        <div style={styles.mockBody}>
          <div
            style={{
              width: 52,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
            <div style={{...styles.mockBar, width: '100%'}} />
            <div style={{...styles.mockBar, width: '78%'}} />
            <div style={{...styles.mockBar, width: '86%'}} />
            <div style={{...styles.mockBar, width: '64%'}} />
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
            <div style={{display: 'flex', gap: 4}}>
              {[52, 40, 46].map(width => (
                <div key={width} style={{...styles.mockBar, width}} />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                height: 44,
              }}>
              {[18, 30, 24, 40, 34, 44, 28].map((height, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height,
                    borderRadius: 3,
                    backgroundColor: index === 5 ? ACCENT : ACCENT_SOFT,
                  }}
                />
              ))}
            </div>
            <div style={{...styles.mockBar, width: '58%'}} />
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'telemetry') {
    return (
      <div style={styles.mockWindow}>
        <div style={styles.mockChrome}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
        </div>
        <svg
          viewBox="0 0 240 96"
          style={{display: 'block', width: '100%', height: 96}}
          aria-hidden="true">
          {[24, 48, 72].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="240"
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          ))}
          {[60, 120, 180].map(x => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="96"
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          ))}
          <polyline
            points="16,78 60,78 60,40 128,40 128,64 196,64 196,22 226,22"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {[
            [16, 78],
            [60, 40],
            [128, 64],
            [196, 22],
            [226, 22],
          ].map(([cx, cy]) => (
            <circle
              key={\`\${cx}-\${cy}\`}
              cx={cx}
              cy={cy}
              r="4"
              fill="var(--color-background-body)"
              stroke={ACCENT}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div style={styles.phoneFrame}>
      <div style={{...styles.mockBar, width: '52%'}} />
      <div
        style={{
          height: 40,
          borderRadius: 8,
          backgroundColor: ACCENT_SOFT,
          border: \`1px solid \${ACCENT_LINE}\`,
        }}
      />
      <div style={{...styles.mockBar, width: '84%'}} />
      <div style={{...styles.mockBar, width: '68%'}} />
      <div
        style={{
          marginTop: 'auto',
          height: 22,
          borderRadius: 11,
          backgroundColor: ACCENT,
        }}
      />
    </div>
  );
}

// ============= PAGE =============

export default function PressMediaKitTemplate() {
  const reducedMotion = usePrefersReducedMotion();

  // ---- responsive: measure the scroll container, not the viewport ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pageRef);
  const pageHeight = useElementHeight(pageRef);
  const isMid = pageWidth > 0 && pageWidth <= 920;
  const isNavCompact = pageWidth > 0 && pageWidth <= 820;
  const isCompact = pageWidth > 0 && pageWidth <= 620;

  // ---- nav: menu dropdown + scroll spy + condensation ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavCondensed, setIsNavCondensed] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- clipboard: one live "Copied" flag, like a real clipboard ----
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  // ---- signature moment: staged .zip download progress ----
  const [downloadPhase, setDownloadPhase] = useState<
    'idle' | 'running' | 'done'
  >('idle');
  const [downloadPct, setDownloadPct] = useState(0);

  // ---- toast receipts ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // ---- hero parallax (off under reduced motion / stacked widths) ----
  const [tilt, setTilt] = useState({x: 0, y: 0});
  const parallaxOn = !reducedMotion && !isMid;

  // ---- vault spotlight ----
  const [spot, setSpot] = useState({x: 50, y: 30});

  // ---- pinned founding story ----
  const storyWrapRef = useRef<HTMLDivElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  // Pin only when the measured container leaves real scroll travel
  // inside the fixed-px wrapper (range = wrapper − container must stay
  // positive for the progress math); otherwise fall back to the static
  // stacked timeline.
  const isStoryPinned =
    !reducedMotion &&
    pageHeight > 420 &&
    pageHeight < STORY_PIN_HEIGHT - 160;
  const activeMilestone = Math.min(
    MILESTONES.length - 1,
    Math.floor(storyProgress * MILESTONES.length),
  );
  const activeStory = MILESTONES[activeMilestone] ?? MILESTONES[0]!;

  // Menu dismisses on Escape (refocusing the trigger) and on pointerdown
  // outside the navbar; listeners only run while it is open.
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

  // Download progress: fixed 4%/70ms steps — deterministic, no clocks.
  useEffect(() => {
    if (downloadPhase !== 'running') {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setDownloadPct(previous => Math.min(100, previous + 4));
    }, 70);
    return () => window.clearInterval(interval);
  }, [downloadPhase]);

  useEffect(() => {
    if (downloadPhase === 'running' && downloadPct >= 100) {
      setDownloadPhase('done');
      setToast(previous => ({
        key: (previous?.key ?? 0) + 1,
        message: 'relay-press-kit.zip saved (24 MB).',
      }));
    }
  }, [downloadPhase, downloadPct]);

  // Clear any pending copied-state timer on unmount.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const copyToClipboard = (key: string, text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard may be unavailable in sandboxed frames; the inline
      // "Copied" feedback below is the demo contract either way.
    }
    setCopiedKey(key);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const startDownload = () => {
    if (downloadPhase === 'running') {
      return;
    }
    if (reducedMotion) {
      // Reduced motion: no staged fill — jump straight to the receipt.
      setDownloadPct(100);
      setDownloadPhase('done');
      fireToast('relay-press-kit.zip saved (24 MB).');
      return;
    }
    setDownloadPct(0);
    setDownloadPhase('running');
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /** Scroll a milestone's progress window into view (button path). */
  const jumpToMilestone = (index: number) => {
    const container = pageRef.current;
    const wrap = storyWrapRef.current;
    if (container == null || wrap == null) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const wrapTop = wrapRect.top - containerRect.top + container.scrollTop;
    const range = wrapRect.height - containerRect.height;
    if (range <= 0) {
      return;
    }
    container.scrollTo({
      top: wrapTop + ((index + 0.5) / MILESTONES.length) * range,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /**
   * Scroll spy (last band above the fold wins) + nav condensation +
   * pinned-story progress, all from the one scroll container.
   */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setIsNavCondensed(container.scrollTop > 24);
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
    const wrap = storyWrapRef.current;
    if (wrap != null && isStoryPinned) {
      const containerRect = container.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const range = wrapRect.height - containerRect.height;
      if (range > 0) {
        const raw = (containerRect.top - wrapRect.top) / range;
        setStoryProgress(Math.min(1, Math.max(0, raw)));
      }
    }
  };

  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!parallaxOn) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const onHeroPointerLeave = () => {
    setTilt({x: 0, y: 0});
  };

  const onVaultPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    setSpot({
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    });
  };

  // ---- fast-facts count-up trigger (fires once at 30% visible) ----
  const [factsRef, factsInView] = useInView();

  // ---- layout rhythm ----
  const sectionPadY = isCompact ? 64 : isMid ? 88 : 112;
  const factsOverlap = isCompact ? 40 : 72;
  const headlineSize =
    pageWidth >= 980 ? 76 : pageWidth >= 760 ? 64 : pageWidth >= 560 ? 52 : 42;
  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isCompact ? styles.columnCompact : null),
  };

  const parallaxTransition = parallaxOn
    ? \`transform 320ms \${DECEL}\`
    : undefined;
  const theaterTransform = parallaxOn
    ? \`rotateX(\${(-tilt.y * 3).toFixed(2)}deg) rotateY(\${(tilt.x * 3).toFixed(
        2,
      )}deg) translate3d(\${(tilt.x * 6).toFixed(1)}px, \${(tilt.y * 6).toFixed(
        1,
      )}px, 0)\`
    : undefined;
  const satelliteTransform = parallaxOn
    ? \`translate(\${(-tilt.x * 8).toFixed(1)}px, \${(-tilt.y * 8).toFixed(1)}px)\`
    : undefined;

  // ============= CHROME =============

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isNavCondensed || isMenuOpen ? styles.navBarCondensed : null),
      }}
      aria-label="Press kit">
      <div
        style={{
          ...styles.navInner,
          ...(isNavCondensed ? styles.navInnerCondensed : null),
        }}>
        <HStack gap={2} vAlign="center">
          <RelayGlyph size={24} color={ACCENT} />
          <Text type="label">{BRAND.name}</Text>
          <Badge variant="neutral" label="Press" />
        </HStack>
        <StackItem size="fill">
          {!isNavCompact && (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={{
                    ...styles.navLink,
                    ...(activeSection === anchor.id
                      ? styles.navLinkActive
                      : null),
                  }}
                  aria-current={
                    activeSection === anchor.id ? 'true' : undefined
                  }
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          )}
        </StackItem>
        {!isNavCompact && (
          <button
            type="button"
            className="pmk-btn"
            style={styles.navCta}
            onClick={startDownload}>
            <span className="pmk-sheen" aria-hidden="true" />
            <Icon
              icon={downloadPhase === 'done' ? CheckIcon : DownloadIcon}
              size="sm"
              color="inherit"
            />
            {downloadPhase === 'done' ? 'Kit saved' : 'Download kit'}
          </button>
        )}
        {isNavCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.iconButton40}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" />
          </button>
        )}
        {isNavCompact && isMenuOpen && (
          <div style={styles.menuPanel} role="menu" aria-label="Sections">
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
              <Button
                label="Download kit (.zip 24 MB)"
                variant="primary"
                size="md"
                icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
                onClick={() => {
                  setIsMenuOpen(false);
                  startDownload();
                }}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const downloadLabel =
    downloadPhase === 'done'
      ? 'relay-press-kit.zip saved'
      : downloadPhase === 'running'
        ? \`Downloading… \${downloadPct}%\`
        : 'Download kit (.zip 24 MB)';

  const contactCard = (
    <div
      style={{
        ...styles.theaterCard,
        ...(theaterTransform !== undefined
          ? {transform: theaterTransform, transition: parallaxTransition}
          : null),
      }}>
      <Text type="label">Press contact</Text>
      <HStack gap={3} vAlign="center">
        <div style={styles.contactAvatar} aria-hidden="true">
          {PRESS_CONTACT.initials}
        </div>
        <VStack gap={0}>
          <Text weight="semibold">{PRESS_CONTACT.name}</Text>
          <Text type="supporting" color="secondary">
            {PRESS_CONTACT.title}
          </Text>
        </VStack>
      </HStack>
      <VStack gap={1}>
        <button
          type="button"
          style={styles.contactRowButton}
          onClick={() => copyToClipboard('press-email', PRESS_CONTACT.email)}>
          <Icon icon={MailIcon} size="sm" color="secondary" />
          <span style={styles.monoText}>{PRESS_CONTACT.email}</span>
          <Icon
            icon={copiedKey === 'press-email' ? CheckIcon : CopyIcon}
            size="xsm"
            color={copiedKey === 'press-email' ? 'success' : 'secondary'}
          />
        </button>
        <HStack gap={2} vAlign="center">
          <Icon icon={PhoneIcon} size="sm" color="secondary" />
          <span style={styles.monoText}>{PRESS_CONTACT.phone}</span>
        </HStack>
      </VStack>
      <Text type="supporting" color="secondary">
        {PRESS_CONTACT.note}
      </Text>
    </div>
  );

  const heroSatellites = (
    <>
      {/* Satellite: fleet metric chip */}
      <div
        style={{
          ...styles.satellite,
          top: isMid ? 0 : 18,
          right: isMid ? 4 : -14,
          transform: satelliteTransform,
          transition: parallaxTransition,
        }}
        aria-hidden="true">
        <div className="pmk-bob-1" style={styles.satelliteInner}>
          <span style={styles.satelliteIconTile}>
            <RelayGlyph size={16} color={ACCENT} />
          </span>
          <span style={{display: 'flex', flexDirection: 'column'}}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>
              3,400 robots
            </span>
            <span
              style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
              99.6% fleet uptime
            </span>
          </span>
        </div>
      </div>
      {/* Satellite: kit receipt toast */}
      <div
        style={{
          ...styles.satellite,
          bottom: isMid ? -4 : 22,
          left: isMid ? 4 : -26,
          transform: satelliteTransform,
          transition: parallaxTransition,
        }}
        aria-hidden="true">
        <div className="pmk-bob-2" style={styles.satelliteInner}>
          <span style={styles.satelliteIconTile}>
            <Icon icon={DownloadIcon} size="sm" color="inherit" />
          </span>
          <span style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{...styles.monoText, fontSize: 12, fontWeight: 600}}>
              relay-press-kit.zip
            </span>
            <span
              style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
              24 MB · logos, shots, PDFs
            </span>
          </span>
        </div>
      </div>
      {/* Satellite: headshot avatar cluster */}
      {!isCompact && (
        <div
          style={{
            ...styles.satellite,
            top: '46%',
            left: isMid ? 4 : -38,
            transform: satelliteTransform,
            transition: parallaxTransition,
          }}
          aria-hidden="true">
          <div className="pmk-bob-3" style={styles.satelliteInner}>
            <span style={{display: 'flex'}}>
              {LEADERS.map((leader, index) => (
                <span
                  key={leader.id}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    colorScheme: 'dark',
                    color: '#FFFFFF',
                    background: \`linear-gradient(135deg, \${leader.gradient[0]} 0%, \${leader.gradient[1]} 100%)\`,
                    border: '2px solid var(--color-background-card)',
                    marginLeft: index === 0 ? 0 : -8,
                  }}>
                  {leader.initials}
                </span>
              ))}
            </span>
            <span
              style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
              Headshots · 2400px
            </span>
          </div>
        </div>
      )}
    </>
  );

  const hero = (
    <div style={{...styles.heroBand, marginTop: -NAV_ALLOWANCE}}>
      {/* Aurora field (drifts on 38-44s keyframes; static when reduced) */}
      <div
        className={reducedMotion ? undefined : 'pmk-aurora-a'}
        style={{
          ...styles.auroraBlob,
          top: -160,
          left: -100,
          background: \`radial-gradient(circle, \${AURORA_A}, transparent 70%)\`,
        }}
        aria-hidden="true"
      />
      <div
        className={reducedMotion ? undefined : 'pmk-aurora-b'}
        style={{
          ...styles.auroraBlob,
          top: -80,
          right: -140,
          background: \`radial-gradient(circle, \${AURORA_B}, transparent 70%)\`,
        }}
        aria-hidden="true"
      />
      <div
        className={reducedMotion ? undefined : 'pmk-aurora-a'}
        style={{
          ...styles.auroraBlob,
          width: 620,
          height: 620,
          bottom: -260,
          left: '30%',
          opacity: 0.4,
          background: \`radial-gradient(circle, \${AURORA_C}, transparent 70%)\`,
        }}
        aria-hidden="true"
      />
      <div style={styles.grainLayer} aria-hidden="true" />
      <div
        style={{
          ...columnStyle,
          paddingTop: NAV_ALLOWANCE + (isCompact ? 44 : 72),
          paddingBottom: sectionPadY + factsOverlap,
        }}>
        <div
          style={{
            ...styles.heroSplit,
            ...(isMid ? styles.heroSplitStacked : null),
          }}>
          {/* Copy + boilerplate + signature download */}
          <div
            style={{
              flex: '7 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <span style={styles.eyebrowChip}>Press &amp; media kit</span>
              <Badge variant="info" label={BRAND.updated} />
            </HStack>
            <h1 style={{...styles.heroHeadline, fontSize: headlineSize}}>
              Everything you need to{' '}
              <span style={styles.gradientInk}>write about Relay</span>
            </h1>
            <p style={styles.heroSub}>
              Boilerplate, logos, screenshots, headshots, and the numbers —
              all approved for editorial use, no follow-up email required.
            </p>
            <div style={styles.panelCard}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <StackItem size="fill">
                  <Text type="label">Company boilerplate</Text>
                </StackItem>
                <Button
                  label={copiedKey === 'boilerplate' ? 'Copied' : 'Copy'}
                  variant="secondary"
                  size="sm"
                  icon={
                    <Icon
                      icon={copiedKey === 'boilerplate' ? CheckIcon : CopyIcon}
                      size="sm"
                      color="inherit"
                    />
                  }
                  onClick={() => copyToClipboard('boilerplate', BOILERPLATE)}
                />
              </HStack>
              <p style={styles.boilerplateText}>{BOILERPLATE}</p>
              <HStack gap={2} vAlign="center" wrap="wrap">
                {/* Signature moment: staged deterministic download fill. */}
                <button
                  type="button"
                  className="pmk-btn"
                  style={styles.downloadButton}
                  onClick={startDownload}>
                  <span
                    aria-hidden="true"
                    style={{
                      ...styles.downloadFill,
                      width: \`\${downloadPhase === 'idle' ? 0 : downloadPct}%\`,
                    }}
                  />
                  <span className="pmk-sheen" aria-hidden="true" />
                  <span style={styles.downloadLabel}>
                    <Icon
                      icon={downloadPhase === 'done' ? CheckIcon : DownloadIcon}
                      size="sm"
                      color="inherit"
                    />
                    {downloadLabel}
                  </span>
                </button>
                {downloadPhase === 'done' && (
                  <Button
                    label="Download again"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDownloadPct(0);
                      setDownloadPhase('idle');
                    }}
                  />
                )}
                <Text type="supporting" color="secondary">
                  Logos, screenshots, headshots, and this page as a PDF.
                </Text>
              </HStack>
            </div>
          </div>

          {/* Product theater: staged press-contact card + satellites */}
          <div
            style={styles.theater}
            onPointerMove={onHeroPointerMove}
            onPointerLeave={onHeroPointerLeave}>
            <div style={styles.theaterPerspective}>{contactCard}</div>
            {heroSatellites}
          </div>
        </div>
      </div>
    </div>
  );

  // ============= SECTIONS =============

  const factsSection = (
    <section
      id="facts"
      ref={registerSection('facts')}
      style={{position: 'relative'}}
      aria-label="Fast facts">
      <div style={styles.dotGridLayer} aria-hidden="true" />
      <div
        style={{
          ...columnStyle,
          paddingBottom: sectionPadY,
          gap: 'var(--spacing-4)',
        }}>
        {/* The grid deliberately crosses the hero boundary (overlap). */}
        <div
          ref={factsRef}
          style={{
            ...styles.factsGrid,
            marginTop: -factsOverlap,
            gridTemplateColumns: isCompact
              ? '1fr'
              : isMid
                ? 'repeat(2, 1fr)'
                : 'repeat(4, 1fr)',
          }}>
          {FAST_FACTS.map((fact, index) => {
            const spansTwo =
              !isCompact && (fact.isSignature === true || fact.id === 'funding');
            return (
              <Reveal
                key={fact.id}
                delay={index * 70}
                style={{
                  display: 'flex',
                  minWidth: 0,
                  ...(spansTwo ? {gridColumn: 'span 2'} : null),
                }}>
                <button
                  type="button"
                  className="pmk-card"
                  style={{...styles.factTile, width: '100%'}}
                  onClick={() =>
                    copyToClipboard(\`fact-\${fact.id}\`, factClipboard(fact))
                  }>
                  <span style={styles.factLabelRow}>
                    <span style={styles.factLabel}>{fact.label}</span>
                    <Icon
                      icon={
                        copiedKey === \`fact-\${fact.id}\` ? CheckIcon : CopyIcon
                      }
                      size="xsm"
                      color={
                        copiedKey === \`fact-\${fact.id}\`
                          ? 'success'
                          : 'secondary'
                      }
                    />
                  </span>
                  <FactValue fact={fact} isActive={factsInView} />
                  <Text type="supporting" color="secondary">
                    {copiedKey === \`fact-\${fact.id}\`
                      ? 'Copied to clipboard'
                      : fact.caption}
                  </Text>
                </button>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={140}>
          <Text type="supporting" color="secondary">
            Click any tile to copy it exactly as written — every figure is
            current as of July 2026.
          </Text>
        </Reveal>
      </div>
    </section>
  );

  const logosSection = (
    <section
      id="logos"
      ref={registerSection('logos')}
      style={styles.bandTinted}
      aria-label="Logo assets">
      <div
        style={{
          ...columnStyle,
          paddingBlock: sectionPadY,
          gap: 'var(--spacing-7)',
        }}>
        {/* Asymmetric 5/7 split: sticky intro rail + tile grid. */}
        <div
          style={{
            ...styles.logoSplit,
            ...(isMid ? {flexDirection: 'column'} : null),
          }}>
          <div
            style={{
              ...styles.logoIntroRail,
              ...(isMid ? {position: 'static'} : null),
            }}>
            <Reveal>
              <SectionIntro
                eyebrow="Logo assets"
                title="Marks, ready to place"
                caption="Four approved lockups on transparency previews. SVG for screens, PNG at 4x for everything else — never redraw the mark."
              />
            </Reveal>
            <Reveal delay={90}>
              <div style={{...styles.panelCard, gap: 'var(--spacing-2)'}}>
                <RelayLockup variant="light" size={26} />
                <Text type="supporting" color="secondary">
                  The relay link always runs corner to corner. If a surface
                  fights the mark, use the glyph alone.
                </Text>
              </div>
            </Reveal>
          </div>
          <div
            style={{
              ...styles.logoGrid,
              gridTemplateColumns: isCompact ? '1fr' : 'repeat(2, 1fr)',
            }}>
            {LOGO_ASSETS.map((asset, index) => (
              <Reveal
                key={asset.id}
                delay={index * 70}
                style={{display: 'flex', minWidth: 0}}>
                <div
                  className="pmk-card"
                  style={{...styles.logoTileCard, width: '100%'}}>
                  <div
                    style={{
                      ...styles.checker,
                      ...(asset.id === 'dark' ? styles.checkerDark : null),
                    }}
                    role="img"
                    aria-label={\`\${asset.label} logo preview\`}>
                    <RelayLockup
                      variant={asset.id}
                      size={asset.id === 'glyph' ? 34 : 20}
                    />
                  </div>
                  <div style={styles.logoTileMeta}>
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {asset.label}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {asset.caption}
                      </Text>
                    </VStack>
                    <HStack gap={1} wrap="wrap">
                      {(['SVG', 'PNG'] as const).map(format => (
                        <button
                          key={format}
                          type="button"
                          style={styles.downloadChip}
                          onClick={() =>
                            fireToast(
                              \`relay-logo-\${asset.id}.\${format.toLowerCase()} download started.\`,
                            )
                          }>
                          <Icon
                            icon={DownloadIcon}
                            size="xsm"
                            color="inherit"
                          />
                          {format}
                        </button>
                      ))}
                    </HStack>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Usage dos / don'ts */}
        <Reveal>
          <div
            style={{
              ...styles.usageSplit,
              ...(isMid ? styles.usageSplitStacked : null),
            }}>
            <div style={{...styles.panelCard, flex: '1 1 0', minWidth: 0}}>
              <Text type="label">Do</Text>
              {USAGE_DOS.map((rule, index) => (
                <div key={rule.id} style={styles.usageRow}>
                  <span
                    style={{...styles.usageDisc, ...styles.usageDiscDo}}
                    aria-hidden="true">
                    <Icon icon={CheckIcon} size="xsm" color="inherit" />
                  </span>
                  <StackItem size="fill">
                    <Text size="sm">{rule.text}</Text>
                  </StackItem>
                  <span style={styles.usagePreview} aria-hidden="true">
                    {index === 0 && (
                      <span
                        style={{
                          border: \`1px dashed \${ACCENT_LINE}\`,
                          borderRadius: 6,
                          padding: '6px 10px',
                          display: 'inline-flex',
                        }}>
                        <RelayGlyph size={16} color={ACCENT} />
                      </span>
                    )}
                    {index === 1 && (
                      <span
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          // Scheme-locked "photograph" stand-in.
                          colorScheme: 'dark',
                          background:
                            'linear-gradient(135deg, #3D4852 0%, #1F2933 100%)',
                        }}>
                        <RelayGlyph size={18} color="#FFFFFF" />
                      </span>
                    )}
                    {index === 2 && <RelayGlyph size={18} color={ACCENT} />}
                  </span>
                </div>
              ))}
            </div>
            <div style={{...styles.panelCard, flex: '1 1 0', minWidth: 0}}>
              <Text type="label">Don&rsquo;t</Text>
              {USAGE_DONTS.map(rule => (
                <div key={rule.id} style={styles.usageRow}>
                  <span
                    style={{...styles.usageDisc, ...styles.usageDiscDont}}
                    aria-hidden="true">
                    <Icon icon={XIcon} size="xsm" color="inherit" />
                  </span>
                  <StackItem size="fill">
                    <Text size="sm">{rule.text}</Text>
                  </StackItem>
                  <span style={styles.usagePreview} aria-hidden="true">
                    <MisusePreview kind={rule.id} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  const renderShot = (
    shot: (typeof SCREENSHOTS)[number],
    stageMinHeight: number,
  ) => (
    <div
      className="pmk-card"
      style={{...styles.shotCard, width: '100%', height: '100%'}}>
      <div
        style={{...styles.shotStage, minHeight: stageMinHeight, flex: 1}}
        role="img"
        aria-label={\`\${shot.title} preview\`}>
        <ScreenshotArt kind={shot.id} />
      </div>
      <div style={styles.shotMeta}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {shot.title}
              </Text>
              <span
                style={{
                  ...styles.monoText,
                  color: 'var(--color-text-secondary)',
                  fontSize: 12,
                }}>
                {shot.file} · {shot.resolution}
              </span>
            </VStack>
          </StackItem>
          <button
            type="button"
            style={styles.downloadChip}
            onClick={() => fireToast(\`\${shot.file} download started.\`)}>
            <Icon icon={DownloadIcon} size="xsm" color="inherit" />
            PNG
          </button>
        </HStack>
      </div>
    </div>
  );

  const photosSection = (
    <section
      id="photos"
      ref={registerSection('photos')}
      aria-label="Screenshots and headshots">
      <div
        style={{
          ...columnStyle,
          paddingBlock: sectionPadY,
          gap: 'var(--spacing-8)',
        }}>
        <VStack gap={5}>
          <Reveal>
            <SectionIntro
              eyebrow="Product screenshots"
              title="Screens, ready to run"
              caption="Schematic previews below; the kit includes full-resolution captures with transparent device frames."
            />
          </Reveal>
          {/* Asymmetric 7/5 spread: featured capture + stacked pair. */}
          <div
            style={{
              ...styles.shotSplit,
              ...(isMid ? {flexDirection: 'column'} : null),
            }}>
            <Reveal
              style={{
                flex: '7 1 0',
                minWidth: 0,
                display: 'flex',
              }}>
              {renderShot(SCREENSHOTS[0]!, isMid ? 200 : 320)}
            </Reveal>
            <div
              style={{
                flex: '5 1 0',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-3)',
              }}>
              <Reveal delay={80} style={{display: 'flex', flex: 1}}>
                {renderShot(SCREENSHOTS[1]!, 140)}
              </Reveal>
              <Reveal delay={160} style={{display: 'flex', flex: 1}}>
                {renderShot(SCREENSHOTS[2]!, 168)}
              </Reveal>
            </div>
          </div>
        </VStack>

        <VStack gap={5}>
          <Reveal>
            <SectionIntro
              eyebrow="Leadership"
              title="Headshots & bios"
              caption="Monogram stand-ins below; the kit ships 2400px headshots on white and transparent backgrounds."
            />
          </Reveal>
          <div
            style={{
              ...styles.leaderGrid,
              gridTemplateColumns: isCompact ? '1fr' : 'repeat(3, 1fr)',
            }}>
            {LEADERS.map((leader, index) => (
              <Reveal
                key={leader.id}
                delay={index * 80}
                style={{display: 'flex', minWidth: 0}}>
                <div
                  className="pmk-card"
                  style={{...styles.panelCard, width: '100%'}}>
                  <div
                    style={{
                      ...styles.leaderTile,
                      background: \`linear-gradient(135deg, \${leader.gradient[0]} 0%, \${leader.gradient[1]} 100%)\`,
                    }}
                    role="img"
                    aria-label={\`\${leader.name} headshot placeholder\`}>
                    {leader.initials}
                  </div>
                  <VStack gap={0}>
                    <Text weight="semibold">{leader.name}</Text>
                    <Text type="supporting" color="secondary">
                      {leader.title}
                    </Text>
                  </VStack>
                  <HStack gap={1} wrap="wrap">
                    <button
                      type="button"
                      style={styles.downloadChip}
                      onClick={() =>
                        fireToast(
                          \`\${leader.name} headshot (2400px) download started.\`,
                        )
                      }>
                      <Icon icon={DownloadIcon} size="xsm" color="inherit" />
                      Headshot
                    </button>
                    <button
                      type="button"
                      style={styles.downloadChip}
                      onClick={() =>
                        fireToast(\`\${leader.name} bio download started.\`)
                      }>
                      <Icon icon={DownloadIcon} size="xsm" color="inherit" />
                      Bio .txt
                    </button>
                  </HStack>
                </div>
              </Reveal>
            ))}
          </div>
        </VStack>

        <VStack gap={5}>
          <Reveal>
            <SectionIntro
              eyebrow="Brand colors"
              title="The palette"
              caption="Click a hex to copy it. Signal Orange is the accent; Graphite carries text."
            />
          </Reveal>
          <div style={styles.swatchRow}>
            {BRAND_COLORS.map((color, index) => (
              <Reveal
                key={color.id}
                delay={index * 60}
                style={{
                  flex: '1 1 168px',
                  minWidth: isCompact ? '100%' : 148,
                  display: 'flex',
                }}>
                <div
                  className="pmk-card"
                  style={{
                    ...styles.swatchCard,
                    flex: '1 1 auto',
                    minWidth: 0,
                  }}>
                  {/* Swatch chips render the fixture hex they document. */}
                  <div
                    style={{
                      ...styles.swatchChip,
                      backgroundColor: color.hex,
                      ...(color.needsBorder
                        ? {borderBottom: '1px solid var(--color-border)'}
                        : null),
                    }}
                    role="img"
                    aria-label={\`\${color.name} swatch\`}
                  />
                  <div style={styles.swatchMeta}>
                    <Text size="sm" weight="semibold">
                      {color.name}
                    </Text>
                    <button
                      type="button"
                      style={styles.copyHexButton}
                      onClick={() =>
                        copyToClipboard(\`hex-\${color.id}\`, color.hex)
                      }>
                      {copiedKey === \`hex-\${color.id}\` ? 'Copied!' : color.hex}
                      <Icon
                        icon={
                          copiedKey === \`hex-\${color.id}\`
                            ? CheckIcon
                            : CopyIcon
                        }
                        size="xsm"
                        color={
                          copiedKey === \`hex-\${color.id}\`
                            ? 'success'
                            : 'secondary'
                        }
                      />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  const outletChips = COVERAGE.map(item => (
    <span key={item.id} style={styles.marqueeChip}>
      <span
        style={{
          ...styles.outletTile,
          width: 26,
          height: 26,
          borderRadius: 8,
          fontSize: 10,
        }}
        aria-hidden="true">
        {item.initials}
      </span>
      <span style={{fontSize: 13, fontWeight: 600, color: '#FFFFFF'}}>
        {item.outlet}
      </span>
    </span>
  ));

  const coverageSection = (
    <section
      id="coverage"
      ref={registerSection('coverage')}
      style={
        {
          ...styles.vaultBand,
          '--pmk-mx': \`\${spot.x}%\`,
          '--pmk-my': \`\${spot.y}%\`,
        } as CSSProperties
      }
      onPointerMove={onVaultPointerMove}
      aria-label="Recent coverage">
      <div style={styles.vaultGlow} aria-hidden="true" />
      {!reducedMotion && (
        <div style={styles.vaultSpotlight} aria-hidden="true" />
      )}
      <div style={styles.grainLayer} aria-hidden="true" />
      <div
        style={{
          ...columnStyle,
          paddingBlock: sectionPadY,
          gap: 'var(--spacing-5)',
        }}>
        <Reveal>
          <SectionIntro
            onDark
            eyebrow="In the press"
            title="Recent coverage"
            caption="A sample of 2026 coverage — all outlets fictional for this demo."
          />
        </Reveal>
        <Reveal delay={80}>
          {reducedMotion ? (
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
              {outletChips}
            </div>
          ) : (
            <div className="pmk-marquee" style={styles.marqueeViewport}>
              <div className="pmk-marquee-track">
                <div style={{display: 'flex'}}>{outletChips}</div>
                <div style={{display: 'flex'}} aria-hidden="true">
                  {outletChips}
                </div>
              </div>
            </div>
          )}
        </Reveal>
        <VStack gap={2}>
          {COVERAGE.map((item, index) => (
            <Reveal key={item.id} delay={index * 60}>
              <div
                className="pmk-glass"
                style={{
                  ...styles.glassRow,
                  ...(isCompact ? styles.glassRowWrapped : null),
                }}>
                <div style={styles.outletTile} aria-hidden="true">
                  {item.initials}
                </div>
                <div
                  style={{
                    flex: '1 1 220px',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}>
                  <span
                    style={{fontSize: 14, fontWeight: 600, color: '#FFFFFF'}}>
                    {item.headline}
                  </span>
                  <span style={{...styles.vaultTextSecondary, fontSize: 13}}>
                    {item.outlet}
                  </span>
                </div>
                <HStack gap={2} vAlign="center">
                  <span style={{...styles.vaultTextSecondary, fontSize: 13}}>
                    {item.date}
                  </span>
                  <button
                    type="button"
                    aria-label={\`Open "\${item.headline}" on \${item.outlet}\`}
                    style={styles.vaultIconButton}
                    onClick={() =>
                      fireToast(\`Opening \${item.outlet} article…\`)
                    }>
                    <Icon
                      icon={ArrowUpRightIcon}
                      size="sm"
                      color="inherit"
                    />
                  </button>
                </HStack>
              </div>
            </Reveal>
          ))}
        </VStack>
      </div>
    </section>
  );

  const storyIntro = (
    <SectionIntro
      eyebrow="Founding story"
      title="Seven years, five milestones"
      caption={
        isStoryPinned
          ? 'Scroll — or click a milestone — to move through the story. The long version ships in the kit as founding-story.pdf.'
          : 'The short version — the long version is in the kit as founding-story.pdf.'
      }
      headingSize={isCompact ? 30 : 36}
    />
  );

  const storyCard = (
    <div
      key={activeMilestone}
      className={reducedMotion ? undefined : 'pmk-story-card-anim'}
      style={styles.storyCard}>
      <span style={styles.storyGhostNumeral} aria-hidden="true">
        {String(activeMilestone + 1).padStart(2, '0')}
      </span>
      <HStack>
        <Badge variant="neutral" label={activeStory.date} />
      </HStack>
      <h3 style={styles.storyTitle}>{activeStory.title}</h3>
      <p style={styles.storyCopy}>{activeStory.copy}</p>
      <Text type="supporting" color="secondary">
        Milestone {activeMilestone + 1} of {MILESTONES.length}
      </Text>
    </div>
  );

  const storySection = (
    <section
      id="story"
      ref={registerSection('story')}
      aria-label="Founding story">
      {isStoryPinned ? (
        // Pinned scroll story: sticky stage inside a fixed-px wrapper
        // (never vh / window-derived — see STORY_PIN_HEIGHT).
        <div ref={storyWrapRef} style={{height: STORY_PIN_HEIGHT}}>
          <div
            style={{
              ...styles.storyStage,
              height: Math.min(STORY_STAGE_HEIGHT, pageHeight),
            }}>
            <div style={{...columnStyle, gap: 'var(--spacing-5)'}}>
              {storyIntro}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--spacing-6)',
                  ...(isMid
                    ? {flexDirection: 'column', gap: 'var(--spacing-4)'}
                    : null),
                }}>
                {isMid ? (
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    {MILESTONES.map((milestone, index) => (
                      <button
                        key={milestone.id}
                        type="button"
                        aria-label={\`\${milestone.date} — \${milestone.title}\`}
                        aria-current={
                          index === activeMilestone ? 'step' : undefined
                        }
                        style={{
                          ...styles.storyRailIndex,
                          width: 34,
                          height: 34,
                          cursor: 'pointer',
                          ...(index === activeMilestone
                            ? styles.storyRailIndexActive
                            : null),
                        }}
                        onClick={() => jumpToMilestone(index)}>
                        {index + 1}
                      </button>
                    ))}
                  </HStack>
                ) : (
                  <div
                    style={{
                      flex: '5 1 0',
                      minWidth: 0,
                      display: 'flex',
                      gap: 14,
                    }}>
                    <div style={styles.storyLineTrack} aria-hidden="true">
                      <span
                        style={{
                          ...styles.storyLineFill,
                          transform: \`scaleY(\${storyProgress.toFixed(4)})\`,
                        }}
                      />
                    </div>
                    <VStack gap={1}>
                      {MILESTONES.map((milestone, index) => (
                        <button
                          key={milestone.id}
                          type="button"
                          aria-current={
                            index === activeMilestone ? 'step' : undefined
                          }
                          style={{
                            ...styles.storyRailButton,
                            ...(index === activeMilestone
                              ? styles.storyRailButtonActive
                              : null),
                          }}
                          onClick={() => jumpToMilestone(index)}>
                          <span
                            style={{
                              ...styles.storyRailIndex,
                              ...(index === activeMilestone
                                ? styles.storyRailIndexActive
                                : null),
                            }}>
                            {index + 1}
                          </span>
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: 0,
                            }}>
                            <span style={{fontSize: 14, fontWeight: 600}}>
                              {milestone.title}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: 'var(--color-text-secondary)',
                              }}>
                              {milestone.date}
                            </span>
                          </span>
                        </button>
                      ))}
                    </VStack>
                  </div>
                )}
                <div style={{flex: '7 1 0', minWidth: 0}}>{storyCard}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Reduced motion / unmeasured heights: static stacked sequence.
        <div
          style={{
            ...columnStyle,
            paddingBlock: sectionPadY,
            gap: 'var(--spacing-4)',
          }}>
          {storyIntro}
          <div>
            {MILESTONES.map((milestone, index) => (
              <div key={milestone.id} style={styles.timelineItem}>
                <div style={styles.timelineRail} aria-hidden="true">
                  <span
                    style={{
                      ...styles.timelineLine,
                      ...(index === 0 ? {top: 8} : null),
                      ...(index === MILESTONES.length - 1
                        ? {bottom: 'auto', height: 8}
                        : null),
                    }}
                  />
                  <span style={styles.timelineDot} />
                </div>
                <div
                  style={{
                    ...styles.timelineBody,
                    ...(index === MILESTONES.length - 1
                      ? {paddingBottom: 0}
                      : null),
                  }}>
                  <HStack>
                    <Badge variant="neutral" label={milestone.date} />
                  </HStack>
                  <Text weight="semibold">{milestone.title}</Text>
                  <Text type="supporting" color="secondary">
                    {milestone.copy}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...columnStyle,
          paddingBlock: 'var(--spacing-7)',
          gap: 'var(--spacing-3)',
        }}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <RelayGlyph size={20} color={ACCENT} />
              <Text type="label">{BRAND.name}</Text>
            </HStack>
          </StackItem>
          <button
            type="button"
            style={styles.footerLink}
            onClick={() => fireToast('Opening relayrobotics.com…')}>
            Company site
          </button>
          <button
            type="button"
            style={styles.footerLink}
            onClick={() => fireToast('Opening the newsroom…')}>
            Newsroom
          </button>
          <button
            type="button"
            style={styles.footerLink}
            onClick={() => fireToast('Opening brand guidelines…')}>
            Brand guidelines
          </button>
        </HStack>
        <Text type="supporting" color="secondary">
          All assets in this kit are approved for editorial use without
          further permission. For advertising, co-branding, or anything
          else, email{' '}
          <span style={{...styles.monoText, fontSize: 12}}>
            {PRESS_CONTACT.email}
          </span>{' '}
          first.
        </Text>
        <Text type="supporting" color="secondary">
          © 2026 Relay Robotics, Inc. · Boulder, CO · Rotterdam, NL
        </Text>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Relay Robotics press kit">
            <div
              ref={pageRef}
              className={SCOPE}
              style={styles.page}
              onScroll={onPageScroll}>
              <style>{TEMPLATE_CSS}</style>
              {navbar}
              {hero}
              {factsSection}
              {logosSection}
              {photosSection}
              {coverageSection}
              {storySection}
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
            isAutoHide={true}
            autoHideDuration={4000}
            onDismiss={() => setToast(null)}
            body={<Text weight="semibold">{toast.message}</Text>}
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};