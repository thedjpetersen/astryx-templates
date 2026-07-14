var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file product-comparison-landing.tsx
 * @input Deterministic fixtures only (the fictional challenger "Northbeam"
 *   vs the fictional incumbent "Gridware": a 12-dimension comparison
 *   matrix grouped into four categories with yes/no/partial verdicts,
 *   short evidence notes, and three shared footnotes; a derived
 *   head-to-head tally; a marquee of ten invented switcher teams; three
 *   "why teams switch" stat cards; a four-step migration timeline with
 *   scripted terminal output per step and a copyable CLI command; one
 *   switcher testimonial with before/after metric chips; a two-bullet
 *   "when Gridware is a better fit" callout; two pricing-at-a-glance
 *   cards; four FAQ entries; and footer link fixtures)
 * @output Full "switch from" comparison landing page, staged to an
 *   awwwards bar: a sticky navbar that rides transparent over the hero
 *   and condenses to a tinted hairline surface after 24px of scroll; a
 *   hero theater — aurora blobs + grain, a 76px two-line display headline
 *   with gradient ink on the challenger wordmark, and the head-to-head
 *   scoreboard staged as a tilting glass card with three bobbing
 *   satellite chips that parallax toward the pointer; a switched-teams
 *   marquee; the centerpiece sticky-header comparison table (12 dimension
 *   rows x 2 verdict columns with footnote jump buttons and a category
 *   filter row that scroll-jumps and highlights row groups, sticky first
 *   column when narrow); an asymmetric why-switch band with count-up stat
 *   cards over a dot grid; a pinned scroll-story migration scene (600px
 *   sticky stage inside a 1560px container whose scroll progress advances
 *   four clickable steps and a scripted terminal, with the copyable CLI
 *   command inline); a scheme-locked dark testimonial band with a glass
 *   quote card and pointer-tracked spotlight; an honest "when Gridware
 *   wins" card that overlaps the dark band into the pricing band; offset
 *   pricing-at-a-glance cards; a controlled FAQ accordion; a validating
 *   email capture on a dark glow band; footnotes; and a sitemap footer.
 * @position Page template; emitted by \`astryx template product-comparison-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div; a rAF-throttled scroll listener on it
 * drives scroll-spy, the condensing navbar, and the pinned migration
 * story. The page is a stack of full-bleed bands (plain / muted / dark)
 * that each center a 1120px column. The compact nav menu drops absolutely
 * from the sticky navbar; the Toast sits fixed bottom-right.
 *
 * Interaction contract (all preserved from the previous revision):
 * - Nav anchors (Comparison / Why switch / Migration / Pricing / FAQ)
 *   smooth-scroll under the sticky nav; scroll-spy highlights the last
 *   section above the fold (aria-current). At compact widths the links
 *   collapse behind a 40px menu button whose dropdown closes on Escape,
 *   outside pointerdown, or selection.
 * - Hero CTAs navigate to the migration scene and the table. The
 *   scoreboard tally (derived from the table fixtures, never hand-typed)
 *   counts up and its bars fill once on first view.
 * - The category filter row sets the active row group (tinted rows) and
 *   scroll-jumps the container so the group header lands under the
 *   sticky table header; "All 12" clears the highlight.
 * - Every superscript footnote marker is a real button that scrolls to
 *   the footnotes section.
 * - Migration steps are clickable buttons: in the pinned scene they
 *   scroll the story container to that step's progress window; the CLI
 *   Copy button writes to the clipboard and flips to "Copied" for 2s
 *   (timer cleaned up on unmount).
 * - The checklist email form validates on submit (empty and format
 *   errors inline); success swaps the form for a confirmed state with a
 *   "Use a different email" reset.
 * - FAQ Collapsibles are controlled via a Set of open ids; the first
 *   ships open. Would-leave-the-page buttons fire a corner Toast.
 *
 * Motion (every layer reduced-motion gated; loops and reveals live in
 * scoped CSS so \`prefers-reduced-motion: reduce\` statically renders
 * everything visible, marquee wrapped, counters final, bars full):
 * - Ambient: three aurora blobs drift on 38/46s alternate keyframes
 *   behind the hero; grain (feTurbulence data-URI at 4-5% opacity) and
 *   dot-grid texture layers; satellite chips bob on an 8s loop with
 *   negative delays; the switched-teams marquee loops 48s linear and
 *   pauses on hover.
 * - Pointer: the hero scoreboard tilts (rotateX/rotateY via --px/--py
 *   custom props) and its satellites parallax ±9px toward the pointer at
 *   wide widths; the dark testimonial band tracks a radial spotlight via
 *   --mx/--my. Both idle at rest values when reduced motion is on.
 * - Scroll: the navbar condenses after 24px; the migration story's
 *   sticky stage advances its step rail, watermark numeral, and scripted
 *   terminal from scroll progress. Reveals rise 16px + settle from
 *   scale(.985) over 600ms decelerate, staggered 80-90ms, fire once.
 *   Primary CTAs get a hover sheen sweep + 1px lift + .98 pressed scale.
 * - No layout-property animation: transforms, opacity, and
 *   background-position only (the scoreboard bar fill keeps its original
 *   width transition as the one sanctioned legacy exception).
 *
 * Color policy: ONE quarantined accent literal (BRAND_ACCENT, contrast
 * math at its declaration); every accent tint, aurora stop, glow ring,
 * gradient ink stop, and glass stroke is a color-mix() derivation of it
 * (mixed with icon/success tokens), never a second literal. Status
 * verdict tints follow the repo var(--color-success/error/warning,
 * light-dark()) convention. The testimonial band, final CTA band,
 * terminal panes, and footer are deliberately scheme-locked dark
 * surfaces (colorScheme:'dark' with literal paint) so they read
 * identically in both app themes; DARK_TEXT / TERMINAL literals exist
 * only for those locked surfaces. Neutral black-based shadow tiers
 * (raised / floating / glass inset) are shadows, not palette colors.
 *
 * Responsive contract (useElementSize ResizeObserver on the page wrap —
 * the inline demo stage is ~1045px wide, so viewport media queries never
 * fire there; the pinned story stage uses fixed px, never vh, because
 * inline vh resolves against the window, not the stage):
 * - Column: max-width 1120px, centered; every band paints full-bleed.
 *   Section rhythm: 104px block padding at wide, 64px at phone.
 * - >900px: navbar shows all five anchor links + CTA inline; hero
 *   display type 76px (62px between 780-1000px).
 * - <=900px: nav links collapse behind a menu button dropdown.
 * - <=780px: hero stacks (scoreboard below copy, satellites + parallax
 *   off), the migration story renders as a static stacked sequence, the
 *   why-switch header split and pricing offset flatten, and the
 *   testimonial before/after chip rows stack.
 * - <=720px: the comparison table gains a horizontal scroll wrapper
 *   (minWidth 640) with a sticky first column (shadow edge); at wide
 *   widths the table header row is the sticky element instead.
 * - <=560px: display and section type step down, the email form stacks
 *   its button, band paddings tighten. Action rows wrap, so the page
 *   holds at 390px in the phone artboard with no overflow-x.
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
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  GaugeIcon,
  MailCheckIcon,
  MenuIcon,
  MinusIcon,
  Navigation2Icon,
  QuoteIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ShuffleIcon,
  TrendingDownIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined brand accent (the ONE accent literal on this page).
 * Contrast math: #2547D0 on #FFFFFF = 7.3:1 (relative luminance 0.094),
 * #8FA8FF on a #14161A dark body = 7.6:1 (relative luminance 0.411) —
 * both clear WCAG AA for normal text and AAA for the large headings and
 * chips they paint. All accent tints below are color-mix derivations of
 * this constant, never second literals.
 */
const BRAND_ACCENT = 'light-dark(#2547D0, #8FA8FF)';
const ACCENT_TINT_STRONG = \`color-mix(in srgb, \${BRAND_ACCENT} 14%, transparent)\`;
const ACCENT_TINT_SOFT = \`color-mix(in srgb, \${BRAND_ACCENT} 7%, transparent)\`;
const ACCENT_TINT_BORDER = \`color-mix(in srgb, \${BRAND_ACCENT} 32%, transparent)\`;
const ACCENT_GLOW = \`color-mix(in srgb, \${BRAND_ACCENT} 24%, transparent)\`;

/**
 * Gradient ink for the hero wordmark — every stop is a color-mix of the
 * quarantined accent with scheme hue tokens.
 */
const GRADIENT_INK =
  \`linear-gradient(96deg, \${BRAND_ACCENT} 0%, \` +
  \`color-mix(in srgb, \${BRAND_ACCENT} 55%, var(--color-icon-cyan)) 58%, \` +
  \`color-mix(in srgb, \${BRAND_ACCENT} 40%, var(--color-success)) 100%)\`;

// Text literals for the deliberately scheme-locked dark bands only
// (testimonial, final CTA, terminal panes, footer — see Color policy).
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.6)';
const CHIP_BG = 'rgba(255, 255, 255, 0.12)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.24)';
const ERROR_ON_DARK = '#FECACA';
/** Glass surface on the locked dark bands: white mixed to 6%. */
const GLASS_ON_DARK = \`color-mix(in srgb, \${DARK_TEXT} 6%, transparent)\`;

// Scheme-locked terminal pane inks (hoisted so the pinned story's log
// pane derives its faint tint via color-mix, not a new literal).
const TERMINAL_BG = '#0B1220';
const TERMINAL_INK = '#A5F3FC';
const TERMINAL_INK_FAINT = \`color-mix(in srgb, \${TERMINAL_INK} 55%, transparent)\`;

/**
 * Depth system — shared neutral shadow tiers (black-based; these are
 * shadows, not palette colors). Hover lifts add the accent ring via the
 * scoped .pcl-lift / .pcl-ours classes below.
 */
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.3)';
/** Glass hairline: 1px inset stroke mixed from accent + border tokens. */
const GLASS_INSET = \`inset 0 0 0 1px color-mix(in srgb, \${BRAND_ACCENT} 14%, var(--color-border))\`;

/** Grain texture: inline SVG feTurbulence data-URI, tiled at low opacity. */
const GRAIN_URI =
  'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' ' +
  "width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.85' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' " +
  'filter=\\'url(%23g)\\'/%3E%3C/svg%3E")';

/** Sticky-nav height; smooth-scroll, scroll-spy, and the sticky table
 * header all allow for it. */
const NAV_ALLOWANCE = 64;
const SPY_OFFSET = 140;
/** Extra allowance when jumping to a table row group so the sticky
 * table header row does not cover the group label. */
const TABLE_HEADER_ALLOWANCE = 56;
/** Pinned migration story sizing. Fixed px on purpose: the demo renders
 * this page inline in the top browser window, so vh/dvh (and the wrap's
 * measured height, which resolves against the document there) would
 * balloon the pin travel. 600px stage + 1560px container = 960px of
 * scroll travel (~240px per step). */
const PIN_STAGE_HEIGHT = 600;
const PIN_CONTAINER_HEIGHT = 1560;

// Scoped CSS: ambient loops (auroras, satellite bobs, marquee), reveal
// choreography, card lifts, and CTA sheens — all gated by
// prefers-reduced-motion (reveals render visible, loops static, the
// marquee wraps).
const SCOPE = 'pcl-root';
const TEMPLATE_CSS = \`
@keyframes pcl-aurora-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(64px, -44px, 0) scale(1.14); }
}
@keyframes pcl-aurora-b {
  0% { transform: translate3d(0, 0, 0) scale(1.06); }
  100% { transform: translate3d(-56px, 40px, 0) scale(0.9); }
}
.\${SCOPE} .pcl-aurora-a { animation: pcl-aurora-a 38s ease-in-out infinite alternate; }
.\${SCOPE} .pcl-aurora-b { animation: pcl-aurora-b 46s ease-in-out infinite alternate; }
@keyframes pcl-bob {
  0%, 100% { transform: translateY(-6px); }
  50% { transform: translateY(6px); }
}
.\${SCOPE} .pcl-bob { animation: pcl-bob 8s ease-in-out infinite; }
.\${SCOPE} .pcl-reveal {
  opacity: 0;
  transform: translateY(16px) scale(0.985);
  transition:
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.\${SCOPE} .pcl-reveal[data-shown='true'] { opacity: 1; transform: none; }
.\${SCOPE} .pcl-lift {
  box-shadow: \${SHADOW_RAISED};
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.\${SCOPE} .pcl-lift:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 0 1px \${ACCENT_TINT_BORDER},
    \${SHADOW_FLOATING};
}
.\${SCOPE} .pcl-ours {
  box-shadow: 0 0 0 1px \${ACCENT_TINT_BORDER}, \${SHADOW_FLOATING};
}
.\${SCOPE} .pcl-ours:hover {
  box-shadow:
    0 0 0 1px \${BRAND_ACCENT},
    0 0 32px -8px \${ACCENT_GLOW},
    \${SHADOW_FLOATING};
}
.\${SCOPE} .pcl-cta { position: relative; display: inline-flex; transition: transform 0.22s ease; }
.\${SCOPE} .pcl-cta:hover { transform: translateY(-1px); }
.\${SCOPE} .pcl-cta:active { transform: translateY(0) scale(0.98); }
.\${SCOPE} .pcl-sheen { position: absolute; inset: 0; border-radius: 8px; overflow: hidden; pointer-events: none; }
.\${SCOPE} .pcl-sheen::after {
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
.\${SCOPE} .pcl-cta:hover .pcl-sheen::after { transform: translateX(130%); }
@keyframes pcl-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.\${SCOPE} .pcl-marquee { overflow: hidden; }
.\${SCOPE} .pcl-marquee-track { display: flex; width: max-content; animation: pcl-marquee 48s linear infinite; }
.\${SCOPE} .pcl-marquee:hover .pcl-marquee-track { animation-play-state: paused; }
@keyframes pcl-stage-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.\${SCOPE} .pcl-stage-in { animation: pcl-stage-in 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .pcl-aurora-a,
  .\${SCOPE} .pcl-aurora-b,
  .\${SCOPE} .pcl-bob,
  .\${SCOPE} .pcl-stage-in,
  .\${SCOPE} .pcl-marquee-track {
    animation: none;
  }
  .\${SCOPE} .pcl-marquee-track { width: auto; flex-wrap: wrap; justify-content: center; }
  .\${SCOPE} .pcl-marquee-half { flex-wrap: wrap; justify-content: center; }
  .\${SCOPE} .pcl-marquee-clone { display: none; }
  .\${SCOPE} .pcl-reveal { opacity: 1; transform: none; transition: none; }
  .\${SCOPE} .pcl-cta, .\${SCOPE} .pcl-lift { transition: none; }
  .\${SCOPE} .pcl-cta:hover, .\${SCOPE} .pcl-cta:active { transform: none; }
  .\${SCOPE} .pcl-lift:hover { transform: none; box-shadow: \${SHADOW_RAISED}; }
  .\${SCOPE} .pcl-sheen::after { display: none; }
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
  // Bands paint full-bleed; each centers this column. 104px section
  // rhythm at wide, 64px at phone (per-band overrides where noted).
  bandInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '104px var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  bandInnerCompact: {
    padding: '64px var(--spacing-4)',
    gap: 'var(--spacing-5)',
  },
  bandMuted: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- atmosphere layers ----
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
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(var(--color-border) 1px, transparent 1px)',
    backgroundSize: '26px 26px',
    opacity: 0.5,
    maskImage:
      'radial-gradient(75% 70% at 50% 40%, black 0%, transparent 100%)',
    WebkitMaskImage:
      'radial-gradient(75% 70% at 50% 40%, black 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  // ---- sticky navbar (transparent at top → tinted after 24px) ----
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
    maxWidth: 1120,
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
  // Brand-art gradient tile: scheme-locked so the wordmark tile reads
  // identically in both themes (sanctioned hue-gradient art).
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #2547D0 0%, #0EA5E9 100%)',
    color: '#FFFFFF',
    boxShadow: SHADOW_RAISED,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
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
    color: BRAND_ACCENT,
    backgroundColor: ACCENT_TINT_SOFT,
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
    // px, not vh: inline in the demo's top window 100vh resolves against
    // the window, not the ~920px stage, so a vh cap could overflow it.
    maxHeight: 480,
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
  // ---- eyebrows + section headings ----
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 12px',
    borderRadius: 999,
    border: \`1px solid \${ACCENT_TINT_BORDER}\`,
    backgroundColor: ACCENT_TINT_SOFT,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
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
  heroInner: {
    padding: '72px var(--spacing-6) 88px',
    gap: 'var(--spacing-7)',
  },
  heroInnerCompact: {
    padding: '40px var(--spacing-4) 56px',
    gap: 'var(--spacing-6)',
  },
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
    flex: '1.15 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    margin: 0,
    fontWeight: 700,
    lineHeight: 1.02,
    letterSpacing: '-0.025em',
  },
  heroLine: {
    display: 'block',
  },
  heroInk: {
    display: 'block',
    backgroundImage: GRADIENT_INK,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    paddingBottom: '0.06em',
  },
  heroVs: {
    color: BRAND_ACCENT,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // Perspective wrapper: the scoreboard tilts, satellites orbit above.
  heroBoard: {
    flex: '1 1 0',
    minWidth: 0,
    position: 'relative',
    perspective: 1400,
  },
  boardTilt: {
    transform:
      'translate3d(calc(var(--px, 0) * -6px), calc(var(--py, 0) * -4px), 0) ' +
      'rotateX(calc(var(--py, 0) * -2deg)) rotateY(calc(var(--px, 0) * 2.5deg))',
    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  // ---- head-to-head scoreboard (signature hero moment, staged) ----
  board: {
    borderRadius: 20,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 92%, transparent)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_FLOATING}\`,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  boardCount: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
  },
  boardTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  boardFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 700ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  // ---- hero satellites (wide widths only) ----
  satLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transform:
      'translate(calc(var(--px, 0) * 9px), calc(var(--py, 0) * 7px))',
    transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    zIndex: 2,
  },
  satellite: {
    borderRadius: 14,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 94%, transparent)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_FLOATING}\`,
    padding: '10px 14px',
  },
  satGlyph: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT_STRONG,
    color: BRAND_ACCENT,
  },
  satTitle: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  satCaption: {
    fontSize: 11,
    lineHeight: 1.3,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  satAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
    backgroundColor: ACCENT_TINT_STRONG,
    color: BRAND_ACCENT,
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    flexShrink: 0,
  },
  // ---- switched-teams marquee ----
  marqueeLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  marqueeClip: {
    maskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
  },
  marqueeHalf: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-6)',
    paddingInlineEnd: 'var(--spacing-6)',
  },
  marqueeItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  marqueeDisc: {
    width: 26,
    height: 26,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: ACCENT_TINT_STRONG,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // ---- comparison table ----
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  filterChipActive: {
    borderColor: ACCENT_TINT_BORDER,
    backgroundColor: ACCENT_TINT_STRONG,
    color: BRAND_ACCENT,
  },
  tableScroll: {
    overflowX: 'auto',
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    position: 'sticky',
    top: NAV_ALLOWANCE,
    zIndex: 5,
    textAlign: 'left',
    padding: 'var(--spacing-3) var(--spacing-4)',
    backgroundColor: 'var(--color-background-card)',
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'bottom',
  },
  // Inside the horizontal scroll wrapper the wrapper becomes the sticky
  // containing scrollport, so top-stickiness is retired in favor of the
  // sticky first column.
  thCompact: {
    position: 'static',
  },
  thOurs: {
    boxShadow: \`inset 0 3px 0 \${BRAND_ACCENT}\`,
    backgroundImage: \`linear-gradient(\${ACCENT_TINT_SOFT}, \${ACCENT_TINT_SOFT})\`,
  },
  stickyCol: {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    backgroundColor: 'var(--color-background-card)',
    boxShadow:
      'inset -8px 0 8px -8px light-dark(rgba(15, 23, 42, 0.16), rgba(0, 0, 0, 0.5))',
  },
  groupCell: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  td: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'top',
  },
  rowHighlight: {
    backgroundColor: ACCENT_TINT_SOFT,
  },
  dimensionLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  verdictDisc: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verdictWord: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: '22px',
  },
  verdictNote: {
    fontSize: 12,
    lineHeight: 1.45,
    color: 'var(--color-text-secondary)',
  },
  footnoteSup: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '0 1px',
    fontSize: 10,
    fontWeight: 700,
    verticalAlign: 'super',
    lineHeight: 1,
    color: BRAND_ACCENT,
  },
  // ---- why-switch stat cards (asymmetric 5/7 header split) ----
  whyHeader: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-end',
  },
  whyHeaderStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
  },
  statGlyph: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT_STRONG,
    color: BRAND_ACCENT,
  },
  // ---- migration: static rail (compact / reduced motion) ----
  stepRail: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  stepRailStacked: {
    flexDirection: 'column',
  },
  stepCard: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
    boxShadow: SHADOW_RAISED,
  },
  stepIndex: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: BRAND_ACCENT,
  },
  // ---- migration: pinned scroll story (wide + motion) ----
  pinStage: {
    position: 'sticky',
    top: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pinColumn: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '0 var(--spacing-6)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
    width: '100%',
  },
  stepButton: {
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
  stepNumeral: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: \`color-mix(in srgb, \${BRAND_ACCENT} 26%, transparent)\`,
    width: 56,
    flexShrink: 0,
  },
  stepRailLine: {
    position: 'relative',
    width: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    alignSelf: 'stretch',
    marginLeft: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepRailFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_ACCENT,
    borderRadius: 2,
  },
  stageCard: {
    position: 'relative',
    borderRadius: 18,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 90%, transparent)',
    boxShadow: \`\${GLASS_INSET}, \${SHADOW_FLOATING}\`,
    padding: 'var(--spacing-5)',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    minHeight: 320,
  },
  stageWatermark: {
    position: 'absolute',
    top: -20,
    right: 6,
    fontSize: 140,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: \`color-mix(in srgb, \${BRAND_ACCENT} 8%, transparent)\`,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  // Scheme-locked terminal panes (see Color policy).
  terminal: {
    colorScheme: 'dark',
    borderRadius: 12,
    backgroundColor: TERMINAL_BG,
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: TERMINAL_INK,
    flexWrap: 'wrap',
    boxShadow: SHADOW_RAISED,
  },
  terminalCommand: {
    flex: '1 1 260px',
    minWidth: 0,
    overflowWrap: 'anywhere',
    margin: 0,
  },
  stageTerminal: {
    colorScheme: 'dark',
    borderRadius: 12,
    backgroundColor: TERMINAL_BG,
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12.5,
    color: TERMINAL_INK,
    marginTop: 'auto',
  },
  logLine: {
    margin: 0,
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  logDone: {
    margin: 0,
    lineHeight: 1.5,
    color: TERMINAL_INK_FAINT,
  },
  logOk: {
    margin: 0,
    lineHeight: 1.5,
    color: 'var(--color-success)',
  },
  // ---- switcher testimonial (scheme-locked dark band) ----
  testimonialBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 90% at 100% 0%, rgba(37, 71, 208, 0.45), transparent 55%)',
      'linear-gradient(135deg, #0B1220 0%, #1E1B4B 100%)',
    ].join(', '),
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      \`radial-gradient(360px circle at var(--mx, 70%) var(--my, 20%), \` +
      \`color-mix(in srgb, \${DARK_TEXT} 9%, transparent), transparent 70%)\`,
    pointerEvents: 'none',
  },
  glassQuote: {
    position: 'relative',
    borderRadius: 20,
    backgroundColor: GLASS_ON_DARK,
    boxShadow: \`inset 0 0 0 1px \${CHIP_BORDER}, \${SHADOW_FLOATING}\`,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  quoteText: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    margin: 0,
    maxWidth: 800,
  },
  quoteTextCompact: {
    fontSize: 19,
  },
  // Brand-art avatar disc on the locked band.
  avatarDisc: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #0EA5E9 0%, #2547D0 100%)',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
  },
  metricChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  chipGroupLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
  },
  // ---- pricing at a glance ----
  priceFigure: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  checkGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  crossGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  // ---- final CTA (scheme-locked dark band) ----
  ctaBand: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 80% at 50% 0%, rgba(37, 71, 208, 0.5), transparent 60%)',
      'linear-gradient(180deg, #0B1220 0%, #14163A 100%)',
    ].join(', '),
  },
  ctaHeadline: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  ctaHeadlineCompact: {
    fontSize: 28,
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
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    color: DARK_TEXT,
  },
  // ---- footnotes ----
  footnoteRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  footnoteMark: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND_ACCENT,
    lineHeight: '20px',
    flexShrink: 0,
  },
  // ---- footer (scheme-locked dark) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#0B1220',
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
// Deterministic fixtures for the fictional Northbeam-vs-Gridware
// comparison. All Gridware figures are invented in-universe fixtures.

const BRAND = {
  name: 'Northbeam',
  rival: 'Gridware',
  tagline: 'The analytics platform teams switch to',
};

type SectionId = 'comparison' | 'why' | 'migration' | 'pricing' | 'faq';
/** Extra jump targets that are not nav anchors. */
type JumpId = SectionId | 'footnotes' | 'cta';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'comparison', label: 'Comparison'},
  {id: 'why', label: 'Why switch'},
  {id: 'migration', label: 'Migration'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'faq', label: 'FAQ'},
];

const HERO = {
  verdict:
    'Northbeam wins 10 of the 12 dimensions switching teams actually score — and rows 9 and 12 are honest about the other side.',
  subcopy:
    'Same dashboards, a fraction of the invoice, none of the overnight sync. ' +
    'Below: every dimension we get asked about in renewal season, scored ' +
    'against Gridware with receipts in the footnotes.',
};

type CategoryId = 'pricing' | 'speed' | 'support' | 'integrations';

const CATEGORIES: readonly {id: CategoryId; label: string}[] = [
  {id: 'pricing', label: 'Pricing'},
  {id: 'speed', label: 'Speed'},
  {id: 'support', label: 'Support'},
  {id: 'integrations', label: 'Integrations'},
];

type Verdict = 'yes' | 'no' | 'partial';

interface CompareCell {
  verdict: Verdict;
  note: string;
  /** 1-based index into FOOTNOTES; rendered as a superscript jump button. */
  footnote?: number;
}

interface CompareRow {
  id: string;
  category: CategoryId;
  dimension: string;
  northbeam: CompareCell;
  gridware: CompareCell;
}

const COMPARE_ROWS: readonly CompareRow[] = [
  // ---- Pricing ----
  {
    id: 'flat-pricing',
    category: 'pricing',
    dimension: 'Flat per-seat pricing',
    northbeam: {verdict: 'yes', note: '$29/seat, every feature', footnote: 1},
    gridware: {verdict: 'no', note: '4 tiers plus usage overages'},
  },
  {
    id: 'price-lock',
    category: 'pricing',
    dimension: 'Price locked at renewal',
    northbeam: {verdict: 'yes', note: '3-year lock, in writing'},
    gridware: {verdict: 'no', note: 'Median 11% annual uplift', footnote: 2},
  },
  {
    id: 'sandboxes',
    category: 'pricing',
    dimension: 'Free sandbox workspaces',
    northbeam: {verdict: 'yes', note: 'Unlimited on all plans'},
    gridware: {verdict: 'partial', note: 'One, on Scale and above'},
  },
  // ---- Speed ----
  {
    id: 'dashboard-load',
    category: 'speed',
    dimension: 'Dashboard load, p50',
    northbeam: {verdict: 'yes', note: '0.4 s on 2.1M records', footnote: 3},
    gridware: {verdict: 'partial', note: '2.9 s, same workspace', footnote: 3},
  },
  {
    id: 'realtime-sync',
    category: 'speed',
    dimension: 'Real-time source sync',
    northbeam: {verdict: 'yes', note: 'Sub-second push updates'},
    gridware: {verdict: 'no', note: '5-minute polling window'},
  },
  {
    id: 'bulk-import',
    category: 'speed',
    dimension: 'Bulk import, 1M rows',
    northbeam: {verdict: 'yes', note: '4 min end to end', footnote: 3},
    gridware: {verdict: 'partial', note: '52 min, batched overnight'},
  },
  // ---- Support ----
  {
    id: 'sla',
    category: 'support',
    dimension: 'First-response SLA',
    northbeam: {verdict: 'yes', note: '1 hour, on every plan'},
    gridware: {verdict: 'partial', note: '24 hours, Enterprise only'},
  },
  {
    id: 'migration-engineer',
    category: 'support',
    dimension: 'Migration engineer included',
    northbeam: {verdict: 'yes', note: 'Free above 20 seats'},
    gridware: {verdict: 'no', note: 'Partner services, quoted'},
  },
  {
    id: 'soc2',
    category: 'support',
    dimension: 'SOC 2 Type II attested',
    northbeam: {verdict: 'yes', note: 'Audited annually'},
    gridware: {verdict: 'yes', note: 'Audited annually'},
  },
  // ---- Integrations ----
  {
    id: 'connectors',
    category: 'integrations',
    dimension: 'Native warehouse connectors',
    northbeam: {verdict: 'yes', note: '14 native, 20-min setup'},
    gridware: {verdict: 'partial', note: '6 native, CSV for the rest'},
  },
  {
    id: 'api',
    category: 'integrations',
    dimension: 'Open API and webhooks',
    northbeam: {verdict: 'yes', note: 'All plans, rate-limit 10k/min'},
    gridware: {verdict: 'partial', note: 'API gated to Enterprise'},
  },
  {
    id: 'on-prem',
    category: 'integrations',
    dimension: 'On-prem / self-hosted',
    northbeam: {verdict: 'no', note: 'Cloud only today'},
    gridware: {verdict: 'yes', note: 'Self-hosted since 2014'},
  },
];

const FOOTNOTES: readonly string[] = [
  'Northbeam list pricing as of June 2026. Seats are billed monthly and can be removed any time; no platform fee, no overage meters.',
  'Median renewal uplift reported by 63 teams that switched from Gridware between Q3 2025 and Q2 2026, from their final two Gridware invoices.',
  'Benchmarked May 2026 on a 40-seat workspace with 2.1M records and 38 dashboards; identical sources and queries on both products, warm cache, five-run median.',
];

/** Superscript glyphs for footnote markers 1-3. */
const SUP_MARKS = ['¹', '²', '³'] as const;

// Head-to-head tally, derived from the table so it can never drift.
const VERDICT_RANK: Record<Verdict, number> = {yes: 2, partial: 1, no: 0};

const TALLY = COMPARE_ROWS.reduce(
  (acc, row) => {
    const nb = VERDICT_RANK[row.northbeam.verdict];
    const gw = VERDICT_RANK[row.gridware.verdict];
    if (nb > gw) {
      acc.northbeam += 1;
    } else if (gw > nb) {
      acc.gridware += 1;
    } else {
      acc.tied += 1;
    }
    return acc;
  },
  {northbeam: 0, tied: 0, gridware: 0},
);

/** Invented switcher logos for the hero marquee (monogram tiles only —
 * no network assets, no real companies). */
const SWITCHED_TEAMS: readonly {name: string; initials: string}[] = [
  {name: 'Tallgrass Health', initials: 'TH'},
  {name: 'Fernwood Logistics', initials: 'FL'},
  {name: 'Halyard Systems', initials: 'HS'},
  {name: 'Bluenote Media', initials: 'BM'},
  {name: 'Quarrylane Freight', initials: 'QF'},
  {name: 'Ostro Labs', initials: 'OL'},
  {name: 'Meridian Rail', initials: 'MR'},
  {name: 'Sundial Grocery', initials: 'SG'},
  {name: 'Copperline Energy', initials: 'CE'},
  {name: 'Pinebrook Capital', initials: 'PB'},
];

interface SwitchReason {
  id: string;
  icon: Glyph;
  statValue: number;
  statSuffix: string;
  statLabel: string;
  copy: string;
}

const SWITCH_REASONS: readonly SwitchReason[] = [
  {
    id: 'spend',
    icon: TrendingDownIcon,
    statValue: 38,
    statSuffix: '%',
    statLabel: 'lower annual spend',
    copy:
      'Median across the 63 finance-reviewed switches in our 2026 survey. ' +
      'Flat seats replace tier upgrades, overage meters, and the SSO tax.',
  },
  {
    id: 'speed',
    icon: GaugeIcon,
    statValue: 7,
    statSuffix: '×',
    statLabel: 'faster dashboard loads',
    copy:
      '0.4 s vs 2.9 s p50 on the May 2026 benchmark. Analysts stop keeping ' +
      'a second tab open while the incumbent spinner settles.',
  },
  {
    id: 'teams',
    icon: UsersIcon,
    statValue: 412,
    statSuffix: '',
    statLabel: 'teams switched in two quarters',
    copy:
      'From 12-seat startups to a 3,000-seat logistics org. Every one kept ' +
      'their dashboard URLs; 9 in 10 finished the cutover inside a weekend.',
  },
];

interface MigrationStep {
  id: string;
  icon: Glyph;
  title: string;
  duration: string;
  copy: string;
}

const MIGRATION_STEPS: readonly MigrationStep[] = [
  {
    id: 'export',
    icon: DownloadIcon,
    title: 'Export',
    duration: '~20 min',
    copy: 'One CLI call pulls dashboards, queries, and permissions out of Gridware — no ticket to their support queue.',
  },
  {
    id: 'map',
    icon: ShuffleIcon,
    title: 'Map',
    duration: '~1 hr',
    copy: 'The mapper matches 92% of fields automatically and lists the rest for review; nothing imports until you approve.',
  },
  {
    id: 'import',
    icon: UploadIcon,
    title: 'Import',
    duration: '~35 min',
    copy: 'History, owners, and schedules land intact — 2M records in about half an hour on the benchmark workspace.',
  },
  {
    id: 'verify',
    icon: ShieldCheckIcon,
    title: 'Verify',
    duration: '~30 min',
    copy: 'A guided checklist diffs every migrated dashboard against its Gridware original before you flip DNS on Monday.',
  },
];

const CLI_COMMAND =
  'npx northbeam-migrate --source gridware --token $GRIDWARE_API_KEY';

/** Scripted terminal output for the pinned migration scene — figures
 * mirror the benchmark fixtures above (deterministic, no timers). */
const STEP_LOGS: Record<string, readonly {glyph: '›' | '✓'; text: string}[]> = {
  export: [
    {glyph: '›', text: 'Connecting to Gridware workspace tallgrass-prod…'},
    {glyph: '›', text: '38 dashboards · 214 queries · 40 seats found'},
    {glyph: '✓', text: 'Export complete in 19m 42s'},
  ],
  map: [
    {glyph: '›', text: 'Matching fields against the Northbeam schema…'},
    {glyph: '›', text: '92% mapped automatically · 12 queued for review'},
    {glyph: '✓', text: 'Mappings staged — nothing imports until you approve'},
  ],
  import: [
    {glyph: '›', text: 'Importing 2.1M records with owners and schedules…'},
    {glyph: '›', text: 'History and audit trail normalized to UTC'},
    {glyph: '✓', text: 'Import complete in 34m 08s'},
  ],
  verify: [
    {glyph: '›', text: 'Diffing 38 migrated dashboards against Gridware…'},
    {glyph: '›', text: '38 of 38 render identical, query for query'},
    {glyph: '✓', text: 'Checklist green — flip DNS Monday before standup'},
  ],
};

const TESTIMONIAL = {
  quote:
    'We exported on a Friday afternoon, verified Monday before standup, and nobody outside the data team noticed the cutover. The Gridware renewal quote became the easiest email I never answered.',
  name: 'Priya Raman',
  initials: 'PR',
  role: 'Head of Data Platforms, Tallgrass Health',
  before: ['$61,400 / yr', '2.9 s p50 loads', '24-hr support SLA'],
  after: ['$37,900 / yr', '0.4 s p50 loads', '1-hr support SLA'],
};

const HONEST_BULLETS: readonly string[] = [
  'You need on-prem or air-gapped deployment. Northbeam is cloud-only today, and self-hosting is not on our 2026 roadmap — Gridware has shipped it since 2014.',
  'Your stack depends on Gridware’s certified legacy ERP connectors (Synfax, Coreline 9). We don’t replicate those yet; a CSV bridge is the best we can offer.',
];

interface PriceLine {
  label: string;
  isIncluded: boolean;
}

interface PriceCard {
  id: 'northbeam' | 'gridware';
  name: string;
  figure: string;
  cadence: string;
  caption: string;
  footnote?: number;
  lines: readonly PriceLine[];
}

const PRICE_CARDS: readonly PriceCard[] = [
  {
    id: 'northbeam',
    name: 'Northbeam',
    figure: '$29',
    cadence: 'per seat / month, flat',
    caption: 'Every feature on every plan. No platform fee, no meters.',
    footnote: 1,
    lines: [
      {label: 'SSO and SAML included', isIncluded: true},
      {label: 'API + webhooks included', isIncluded: true},
      {label: '1-hour support SLA', isIncluded: true},
      {label: 'Price locked 3 years', isIncluded: true},
    ],
  },
  {
    id: 'gridware',
    name: 'Gridware',
    figure: '$54',
    cadence: 'effective median per seat',
    caption: 'Listed $19–$89 across four tiers; overages push the median up.',
    footnote: 2,
    lines: [
      {label: 'SSO on Enterprise only', isIncluded: false},
      {label: 'API gated to Enterprise', isIncluded: false},
      {label: '24-hour SLA, top tier only', isIncluded: false},
      {label: 'Self-hosted option', isIncluded: true},
    ],
  },
];

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const FAQ: readonly FaqEntry[] = [
  {
    id: 'weekend',
    question: 'Is "migrate in a weekend" marketing math?',
    answer:
      'It is the median, not the best case: across the last 412 migrations, teams ran export Friday afternoon, reviewed field mappings over coffee Saturday, and finished verification Monday morning. The largest cutover to date (3,000 seats, 11 years of Gridware history) took nine days — we will tell you up front if yours looks like that one.',
  },
  {
    id: 'history',
    question: 'Do you import our historical data and audit trail?',
    answer:
      'Yes. The importer carries dashboard history, query versions, owners, schedules, and up to seven years of audit events. Gridware exports timestamps in local server time; we normalize to UTC and keep the originals in a sidecar column so nothing is lost.',
  },
  {
    id: 'contract',
    question: 'We are mid-contract with Gridware. Does switching still pay off?',
    answer:
      'Usually. We credit up to three months of your remaining Gridware term against your first Northbeam year, and the 38% median saving means most teams break even before the old contract lapses. Send us the renewal quote and we will do the math with you — honestly, including the cases where waiting is cheaper.',
  },
  {
    id: 'parallel',
    question: 'Can we run both tools in parallel before cutting over?',
    answer:
      'For 30 days, free. Shadow mode keeps Northbeam synced read-only from the same sources so analysts can compare dashboards side by side. Most teams cut over after the first week; the deadline exists so nobody pays for two tools forever.',
  },
];

const FOOTER_LINK_GROUPS: readonly {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}[] = [
  {
    id: 'compare',
    heading: 'Compare',
    links: [
      {label: 'Comparison table', anchor: 'comparison'},
      {label: 'Why teams switch', anchor: 'why'},
      {label: 'Migration path', anchor: 'migration'},
      {label: 'Pricing', anchor: 'pricing'},
    ],
  },
  {
    id: 'product',
    heading: 'Product',
    links: [
      {label: 'Documentation'},
      {label: 'Changelog'},
      {label: 'Status'},
      {label: 'Security'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [{label: 'About'}, {label: 'Blog'}, {label: 'Careers'}, {label: 'Press'}],
  },
];

// ============= HOOKS =============

/**
 * Measure the page's own size (ResizeObserver) — the inline demo stage
 * is ~1045px wide, so viewport media queries never fire there. Width
 * drives the breakpoint tiers.
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

/** Reactive reduced-motion preference (gates parallax, the pinned story,
 * count-ups, and smooth scrolling; CSS loops gate themselves). */
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
 * Fires once when the node scrolls into view; falls back to "visible"
 * when IntersectionObserver is unavailable so nothing stays hidden.
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
      {threshold: 0.2},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

/** Ease-out count-up (~900ms); snaps to the final value under reduced
 * motion or when requestAnimationFrame is unavailable. */
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
    if (isReduced || typeof requestAnimationFrame !== 'function') {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    const durationMs = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, isReduced, target]);
  return isReduced && isActive ? target : value;
}

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get the checklist.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

const VERDICT_PAINT: Record<
  Verdict,
  {icon: Glyph; word: string; bg: string; fg: string}
> = {
  yes: {
    icon: CheckIcon,
    word: 'Yes',
    bg: 'light-dark(rgba(52, 168, 83, 0.14), rgba(52, 168, 83, 0.24))',
    fg: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  partial: {
    icon: MinusIcon,
    word: 'Partial',
    bg: 'light-dark(rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.26))',
    fg: 'var(--color-warning, light-dark(#92400E, #FCD34D))',
  },
  no: {
    icon: XIcon,
    word: 'No',
    bg: 'light-dark(rgba(220, 38, 38, 0.12), rgba(248, 113, 113, 0.2))',
    fg: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
};

// ============= SMALL PIECES =============

/** Northbeam logomark: gradient tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={Navigation2Icon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );
}

/** 11px tracked-uppercase eyebrow chip (accent-tinted). */
function Eyebrow({label}: {label: string}) {
  return <span style={styles.eyebrow}>{label}</span>;
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
function CtaSheen({children}: {children: ReactNode}) {
  return (
    <span className="pcl-cta">
      {children}
      <span className="pcl-sheen" aria-hidden="true" />
    </span>
  );
}

/**
 * Rise+fade+settle scroll reveal (translateY 16px + scale .985 → identity
 * over 600ms decelerate); fires once, renders visible on reduced motion
 * via the scoped CSS. Stagger siblings with 80-90ms delay steps.
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
  return (
    <div
      ref={ref}
      className="pcl-reveal"
      data-shown={isInView}
      style={{...style, transitionDelay: \`\${delayMs}ms\`}}>
      {children}
    </div>
  );
}

/** One verdict cell: tinted disc + word + footnote marker + note. */
function VerdictCell({
  cell,
  onFootnote,
}: {
  cell: CompareCell;
  onFootnote: () => void;
}) {
  const paint = VERDICT_PAINT[cell.verdict];
  return (
    <HStack gap={2} vAlign="start">
      <div
        style={{
          ...styles.verdictDisc,
          backgroundColor: paint.bg,
          color: paint.fg,
        }}
        aria-hidden="true">
        <Icon icon={paint.icon} size="xsm" color="inherit" />
      </div>
      <StackItem size="fill">
        <VStack gap={0}>
          <span>
            <span style={{...styles.verdictWord, color: paint.fg}}>
              {paint.word}
            </span>
            {cell.footnote != null && (
              <button
                type="button"
                style={styles.footnoteSup}
                aria-label={\`Footnote \${cell.footnote}\`}
                onClick={onFootnote}>
                {SUP_MARKS[cell.footnote - 1]}
              </button>
            )}
          </span>
          <span style={styles.verdictNote}>{cell.note}</span>
        </VStack>
      </StackItem>
    </HStack>
  );
}

/** Why-switch stat card: count-up stat fires on first view; the card
 * hover-lifts a shadow tier with an accent ring (.pcl-lift). */
function SwitchReasonCard({
  reason,
  delayMs,
}: {
  reason: SwitchReason;
  delayMs: number;
}) {
  const isReduced = useReducedMotion();
  const [ref, isInView] = useInView();
  const value = useCountUp(reason.statValue, isInView, isReduced);
  return (
    <div
      ref={ref}
      className="pcl-reveal"
      data-shown={isInView}
      style={{height: '100%', transitionDelay: \`\${delayMs}ms\`}}>
      <Card padding={5} height="100%" className="pcl-lift">
        <VStack gap={3}>
          <div style={styles.statGlyph} aria-hidden="true">
            <Icon icon={reason.icon} size="sm" color="inherit" />
          </div>
          <VStack gap={1}>
            <span style={styles.statNumber}>
              {value.toLocaleString('en-US')}
              {reason.statSuffix}
            </span>
            <Text type="label">{reason.statLabel}</Text>
          </VStack>
          <Text type="supporting" color="secondary">
            {reason.copy}
          </Text>
        </VStack>
      </Card>
    </div>
  );
}

/**
 * Signature hero moment: head-to-head scoreboard whose tally counts up
 * and whose bars fill on first view. Derived from COMPARE_ROWS. Staged
 * as a tilting glass card (--px/--py set by the hero pointer handler).
 */
function VerdictBoard() {
  const isReduced = useReducedMotion();
  const [ref, isInView] = useInView();
  const wins = useCountUp(TALLY.northbeam, isInView, isReduced);
  const total = COMPARE_ROWS.length;
  const rows: readonly {label: string; count: number; fill: string}[] = [
    {
      label: \`\${BRAND.name} leads\`,
      count: TALLY.northbeam,
      fill: BRAND_ACCENT,
    },
    {
      label: 'Tied',
      count: TALLY.tied,
      fill: 'var(--color-border-strong, light-dark(#9CA3AF, #6B7280))',
    },
    {
      label: \`\${BRAND.rival} leads\`,
      count: TALLY.gridware,
      fill: 'var(--color-warning, light-dark(#92400E, #FCD34D))',
    },
  ];
  return (
    <div ref={ref} style={{...styles.board, ...styles.boardTilt}}>
      <HStack gap={3} vAlign="center">
        <span style={styles.boardCount} aria-hidden="true">
          {wins}
        </span>
        <VStack gap={0}>
          <Text type="label">of {total} dimensions won</Text>
          <Text type="supporting" color="secondary">
            Scored from the table below — not marketing math
          </Text>
        </VStack>
      </HStack>
      <VStack gap={3}>
        {rows.map(row => (
          <VStack key={row.label} gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text size="sm" weight="semibold">
                  {row.label}
                </Text>
              </StackItem>
              <Text size="sm" color="secondary">
                {row.count} of {total}
              </Text>
            </HStack>
            <div style={styles.boardTrack} aria-hidden="true">
              <div
                style={{
                  ...styles.boardFill,
                  backgroundColor: row.fill,
                  width: isInView ? \`\${(row.count / total) * 100}%\` : '0%',
                  transition: isReduced ? 'none' : styles.boardFill.transition,
                }}
              />
            </div>
          </VStack>
        ))}
      </VStack>
      <Text type="supporting" color="secondary">
        Yes beats Partial beats No per row; equal verdicts score as tied.
      </Text>
    </div>
  );
}

/** Floating satellite chips around the hero scoreboard (decorative —
 * every figure is echoed in the table and stat cards). */
function HeroSatellites() {
  return (
    <div style={styles.satLayer} aria-hidden="true">
      <div style={{position: 'absolute', top: -26, right: -12}}>
        <div className="pcl-bob" style={styles.satellite}>
          <HStack gap={2} vAlign="center">
            <div style={styles.satGlyph}>
              <Icon icon={GaugeIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <span style={styles.satTitle}>0.4 s p50</span>
              <span style={styles.satCaption}>dashboard loads</span>
            </VStack>
          </HStack>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: -28, left: -24}}>
        <div
          className="pcl-bob"
          style={{...styles.satellite, animationDelay: '-2.6s'}}>
          <HStack gap={2} vAlign="center">
            <div
              style={{
                ...styles.satGlyph,
                backgroundColor: VERDICT_PAINT.yes.bg,
                color: VERDICT_PAINT.yes.fg,
              }}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <span style={styles.satTitle}>Import complete</span>
              <span style={styles.satCaption}>2.1M records verified</span>
            </VStack>
          </HStack>
        </div>
      </div>
      <div style={{position: 'absolute', top: '42%', left: -40}}>
        <div
          className="pcl-bob"
          style={{...styles.satellite, animationDelay: '-5.2s'}}>
          <HStack gap={2} vAlign="center">
            <HStack gap={0} vAlign="center">
              {SWITCHED_TEAMS.slice(0, 3).map((team, index) => (
                <span
                  key={team.initials}
                  style={{
                    ...styles.satAvatar,
                    marginLeft: index === 0 ? 0 : -6,
                  }}>
                  {team.initials}
                </span>
              ))}
            </HStack>
            <VStack gap={0}>
              <span style={styles.satTitle}>412 teams</span>
              <span style={styles.satCaption}>switched in two quarters</span>
            </VStack>
          </HStack>
        </div>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function ProductComparisonLandingTemplate() {
  const isMotionReduced = useReducedMotion();

  // ---- element-size responsive contract ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const {width: wrapWidth} = useElementSize(wrapRef);
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 900;
  const isStacked = wrapWidth > 0 && wrapWidth <= 780;
  const isTableCompact = wrapWidth > 0 && wrapWidth <= 720;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;

  // Hero display tiers: 76 → 62 → 52 → 42 (never under 56 at full width).
  const heroFontSize = isPhone
    ? 42
    : isStacked
      ? 52
      : wrapWidth > 0 && wrapWidth <= 1000
        ? 62
        : 76;

  // ---- scroll plumbing ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<JumpId, HTMLElement | null>>>({});
  const categoryRowRefs = useRef<Partial<Record<CategoryId, HTMLTableRowElement | null>>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  // ---- nav menu (compact widths) ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- comparison table ----
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  // ---- pinned migration scroll story ----
  const pinRef = useRef<HTMLElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const isPinned = !isMotionReduced && !isStacked;
  const activeStep = Math.min(
    MIGRATION_STEPS.length - 1,
    Math.floor(storyProgress * MIGRATION_STEPS.length),
  );

  // ---- hero parallax (satellites toward pointer, board counter-tilt) ----
  const showSatellites = !isStacked;
  const isParallaxOn = showSatellites && !isMotionReduced;

  const onHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isParallaxOn) {
      return;
    }
    const band = event.currentTarget;
    const rect = band.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    band.style.setProperty('--px', nx.toFixed(3));
    band.style.setProperty('--py', ny.toFixed(3));
  };

  const onHeroPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    const band = event.currentTarget;
    band.style.setProperty('--px', '0');
    band.style.setProperty('--py', '0');
  };

  /** Pointer-tracked spotlight on the dark band (static glow otherwise). */
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (isMotionReduced) {
      return;
    }
    const band = event.currentTarget;
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', \`\${Math.round(event.clientX - rect.left)}px\`);
    band.style.setProperty('--my', \`\${Math.round(event.clientY - rect.top)}px\`);
  };

  // ---- migration CLI copy feedback ----
  const [isCommandCopied, setIsCommandCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  // ---- checklist email capture ----
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // ---- FAQ: controlled Set so several answers can be open at once ----
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set([FAQ[0].id]),
  );

  // ---- toast receipts for would-leave-the-page actions ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // One rAF-throttled scroll listener drives the condensing navbar, the
  // scroll-spy, and the pinned story progress (transform/opacity
  // consumers only; passive so scrolling never blocks).
  useEffect(() => {
    const page = pageRef.current;
    if (page == null) {
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsNavScrolled(page.scrollTop > 24);
      const pageRect = page.getBoundingClientRect();
      let active: SectionId | null = null;
      for (const anchor of NAV_ANCHORS) {
        const section = sectionRefs.current[anchor.id];
        if (section == null) {
          continue;
        }
        if (section.getBoundingClientRect().top - pageRect.top <= SPY_OFFSET) {
          active = anchor.id;
        }
      }
      setActiveSection(active);
      const pin = pinRef.current;
      if (pin != null && isPinned) {
        const range = pin.offsetHeight - PIN_STAGE_HEIGHT;
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
  }, [isPinned]);

  // Nav menu dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar.
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

  // Copy-feedback timer cleanup.
  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        window.clearTimeout(copyTimerRef.current);
      }
    },
    [],
  );

  const scrollBehavior: ScrollBehavior = isMotionReduced ? 'auto' : 'smooth';

  /** Smooth-scroll the page container to a section, under the sticky nav. */
  const jumpToSection = (id: JumpId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsNavMenuOpen(false);
    if (container == null || section == null) {
      return;
    }
    if (id !== 'footnotes' && id !== 'cta') {
      setActiveSection(id);
    }
    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    container.scrollTo({
      top:
        container.scrollTop + sectionRect.top - containerRect.top - NAV_ALLOWANCE,
      behavior: scrollBehavior,
    });
  };

  /** Category filter: highlight the row group and jump the table to it. */
  const jumpToCategory = (id: CategoryId | null) => {
    setActiveCategory(id);
    const container = pageRef.current;
    const target =
      id === null ? sectionRefs.current.comparison : categoryRowRefs.current[id];
    if (container == null || target == null) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const allowance =
      id === null ? NAV_ALLOWANCE : NAV_ALLOWANCE + TABLE_HEADER_ALLOWANCE;
    container.scrollTo({
      top: container.scrollTop + targetRect.top - containerRect.top - allowance,
      behavior: scrollBehavior,
    });
  };

  /** Pinned-story steps are buttons: scroll to that step's progress window. */
  const jumpToMigrationStep = (index: number) => {
    const page = pageRef.current;
    const pin = pinRef.current;
    if (page == null || pin == null || !isPinned) {
      return;
    }
    const range = pin.offsetHeight - PIN_STAGE_HEIGHT;
    if (range <= 0) {
      return;
    }
    page.scrollTo({
      top: pin.offsetTop + ((index + 0.5) / MIGRATION_STEPS.length) * range,
      behavior: scrollBehavior,
    });
  };

  const copyCommand = () => {
    try {
      void navigator.clipboard?.writeText(CLI_COMMAND);
    } catch {
      // Clipboard unavailable (permissions/iframe); the visual state
      // still confirms the intent.
    }
    setIsCommandCopied(true);
    if (copyTimerRef.current != null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(
      () => setIsCommandCopied(false),
      2000,
    );
  };

  const submitEmail = () => {
    const error = validateEmail(emailValue);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(emailValue.trim());
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

  const registerSection = (id: JumpId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const bandInnerStyle: CSSProperties = {
    ...styles.bandInner,
    ...(isPhone ? styles.bandInnerCompact : null),
  };
  const headingStyle: CSSProperties = {
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
      aria-label="Primary">
      <div
        style={{
          ...styles.navInner,
          ...(isNavScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center" hAlign="center" wrap="wrap">
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
        {!isNavCollapsed && (
          <CtaSheen>
            <Button
              label="Migrate in a weekend"
              variant="primary"
              size="sm"
              onClick={() => jumpToSection('migration')}
            />
          </CtaSheen>
        )}
        {isNavCollapsed && (
          <IconButton40
            label={isNavMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isNavMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isNavMenuOpen}
            buttonRef={menuTriggerRef}
            onClick={() => setIsNavMenuOpen(open => !open)}
          />
        )}
        {isNavCollapsed && isNavMenuOpen && (
          <div style={styles.navMenu} role="menu" aria-label="Site menu">
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
                label="Migrate in a weekend"
                variant="primary"
                onClick={() => jumpToSection('migration')}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO THEATER =============

  const hero = (
    <header
      style={styles.heroBand}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {/* Aurora field: accent color-mixed with scheme hue tokens,
          drifting on 38/46s loops (static under reduced motion). */}
      <div style={styles.auroraClip} aria-hidden="true">
        <div
          className="pcl-aurora-a"
          style={{
            ...styles.auroraBlob,
            width: 540,
            height: 540,
            left: '-10%',
            top: '-24%',
            background: \`radial-gradient(closest-side, color-mix(in srgb, \${BRAND_ACCENT} 58%, var(--color-icon-cyan)) 0%, transparent 70%)\`,
          }}
        />
        <div
          className="pcl-aurora-b"
          style={{
            ...styles.auroraBlob,
            width: 460,
            height: 460,
            right: '-8%',
            top: '-4%',
            background: \`radial-gradient(closest-side, color-mix(in srgb, \${BRAND_ACCENT} 62%, transparent) 0%, transparent 70%)\`,
            opacity: 0.42,
          }}
        />
        <div
          className="pcl-aurora-a"
          style={{
            ...styles.auroraBlob,
            width: 380,
            height: 380,
            left: '34%',
            bottom: '-34%',
            background: \`radial-gradient(closest-side, color-mix(in srgb, \${BRAND_ACCENT} 40%, var(--color-success)) 0%, transparent 70%)\`,
            opacity: 0.35,
            animationDelay: '-14s',
          }}
        />
      </div>
      <div style={styles.grainLayer} aria-hidden="true" />
      <div
        style={{
          ...bandInnerStyle,
          ...(isPhone ? styles.heroInnerCompact : styles.heroInner),
          position: 'relative',
        }}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Eyebrow label="Switching guide" />
              <Badge variant="neutral" label="Updated June 2026" />
            </HStack>
            <h1 style={{...styles.heroHeadline, fontSize: heroFontSize}}>
              <span style={styles.heroInk}>{BRAND.name}</span>
              <span style={styles.heroLine}>
                <span style={styles.heroVs}>vs</span> {BRAND.rival}
              </span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.verdict}</p>
            <p style={{...styles.heroSubcopy, fontSize: 15}}>{HERO.subcopy}</p>
            <HStack gap={2} wrap="wrap">
              <CtaSheen>
                <Button
                  label="Migrate in a weekend"
                  variant="primary"
                  icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                  onClick={() => jumpToSection('migration')}
                />
              </CtaSheen>
              <Button
                label="See the full comparison"
                variant="secondary"
                icon={<Icon icon={ArrowDownIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('comparison')}
              />
            </HStack>
            <Text type="supporting" color="secondary">
              Free 30-day parallel run · dashboards keep their URLs
            </Text>
          </div>
          <div style={styles.heroBoard}>
            <VerdictBoard />
            {showSatellites && <HeroSatellites />}
          </div>
        </div>
        {/* Switched-teams marquee: 48s loop, pauses on hover, wraps
            statically under reduced motion. */}
        <VStack gap={2}>
          <span style={styles.marqueeLabel}>
            A few of the 412 teams that switched last quarter
          </span>
          <div className="pcl-marquee" style={styles.marqueeClip}>
            <div className="pcl-marquee-track">
              <div className="pcl-marquee-half" style={styles.marqueeHalf}>
                {SWITCHED_TEAMS.map(team => (
                  <span key={team.name} style={styles.marqueeItem}>
                    <span style={styles.marqueeDisc} aria-hidden="true">
                      {team.initials}
                    </span>
                    {team.name}
                  </span>
                ))}
              </div>
              <div
                className="pcl-marquee-half pcl-marquee-clone"
                style={styles.marqueeHalf}
                aria-hidden="true">
                {SWITCHED_TEAMS.map(team => (
                  <span key={team.name} style={styles.marqueeItem}>
                    <span style={styles.marqueeDisc} aria-hidden="true">
                      {team.initials}
                    </span>
                    {team.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </VStack>
      </div>
    </header>
  );

  // ============= COMPARISON TABLE =============

  const tableHead = (
    <thead>
      <tr>
        <th
          scope="col"
          style={{
            ...styles.th,
            ...(isTableCompact ? styles.thCompact : null),
            ...(isTableCompact ? styles.stickyCol : null),
            width: '34%',
            minWidth: isTableCompact ? 190 : undefined,
            zIndex: isTableCompact ? 6 : 5,
          }}>
          <Text type="label" color="secondary">
            Dimension
          </Text>
        </th>
        <th
          scope="col"
          style={{
            ...styles.th,
            ...(isTableCompact ? styles.thCompact : null),
            ...styles.thOurs,
            width: '33%',
          }}>
          <VStack gap={0}>
            <HStack gap={1} vAlign="center">
              <Text type="label">{BRAND.name}</Text>
              <Badge variant="success" label={\`\${TALLY.northbeam} wins\`} />
            </HStack>
            <Text type="supporting" color="secondary">
              That&rsquo;s us
            </Text>
          </VStack>
        </th>
        <th
          scope="col"
          style={{
            ...styles.th,
            ...(isTableCompact ? styles.thCompact : null),
            width: '33%',
          }}>
          <VStack gap={0}>
            <Text type="label">{BRAND.rival}</Text>
            <Text type="supporting" color="secondary">
              The incumbent
            </Text>
          </VStack>
        </th>
      </tr>
    </thead>
  );

  const tableBody = (
    <tbody>
      {CATEGORIES.map(category => {
        const rows = COMPARE_ROWS.filter(row => row.category === category.id);
        const isHighlighted = activeCategory === category.id;
        return [
          <tr
            key={\`group-\${category.id}\`}
            ref={node => {
              categoryRowRefs.current[category.id] = node;
            }}>
            <td
              colSpan={3}
              style={{
                ...styles.groupCell,
                ...(isHighlighted
                  ? {backgroundColor: ACCENT_TINT_STRONG, color: BRAND_ACCENT}
                  : null),
              }}>
              {category.label}
            </td>
          </tr>,
          ...rows.map(row => (
            <tr
              key={row.id}
              style={isHighlighted ? styles.rowHighlight : undefined}>
              <th
                scope="row"
                style={{
                  ...styles.td,
                  textAlign: 'left',
                  fontWeight: 400,
                  ...(isTableCompact ? styles.stickyCol : null),
                  ...(isTableCompact && isHighlighted
                    ? {backgroundColor: 'var(--color-background-card)'}
                    : null),
                }}>
                <span style={styles.dimensionLabel}>{row.dimension}</span>
              </th>
              <td style={styles.td}>
                <VerdictCell
                  cell={row.northbeam}
                  onFootnote={() => jumpToSection('footnotes')}
                />
              </td>
              <td style={styles.td}>
                <VerdictCell
                  cell={row.gridware}
                  onFootnote={() => jumpToSection('footnotes')}
                />
              </td>
            </tr>
          )),
        ];
      })}
    </tbody>
  );

  const comparisonSection = (
    <section
      ref={registerSection('comparison')}
      aria-label="Feature comparison">
      <div style={bandInnerStyle}>
        <Reveal>
          <VStack gap={2} hAlign="center">
            <Eyebrow label="The receipts" />
            <h2 style={{...headingStyle, textAlign: 'center'}}>
              Twelve dimensions, two columns, three footnotes
            </h2>
            <Text type="supporting" color="secondary" justify="center">
              Every verdict links its evidence. Jump to a category, or read
              top to bottom — the header stays put while you scroll.
            </Text>
          </VStack>
        </Reveal>
        <HStack gap={2} wrap="wrap" hAlign="center">
          <button
            type="button"
            style={{
              ...styles.filterChip,
              ...(activeCategory === null ? styles.filterChipActive : null),
            }}
            aria-pressed={activeCategory === null}
            onClick={() => jumpToCategory(null)}>
            All 12
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              type="button"
              style={{
                ...styles.filterChip,
                ...(activeCategory === category.id
                  ? styles.filterChipActive
                  : null),
              }}
              aria-pressed={activeCategory === category.id}
              onClick={() => jumpToCategory(category.id)}>
              {category.label}
              <span aria-hidden="true">·</span>
              {COMPARE_ROWS.filter(row => row.category === category.id).length}
            </button>
          ))}
        </HStack>
        {/* Wide: sticky header row under the navbar. Compact: horizontal
            scroll wrapper with a sticky first column instead. */}
        <div
          style={
            isTableCompact
              ? styles.tableScroll
              : {...styles.tableScroll, overflowX: 'visible'}
          }>
          <table
            style={{
              ...styles.table,
              minWidth: isTableCompact ? 640 : undefined,
            }}>
            <caption
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                overflow: 'hidden',
                clipPath: 'inset(50%)',
              }}>
              Northbeam versus Gridware across 12 dimensions
            </caption>
            {tableHead}
            {tableBody}
          </table>
        </div>
        <Text type="supporting" color="secondary" justify="center">
          Gridware capabilities from public docs and list pricing, June 2026.
          Spot an error? compare@northbeam.dev — corrections ship within a day.
        </Text>
      </div>
    </section>
  );

  // ============= WHY TEAMS SWITCH =============

  const whySection = (
    <section
      ref={registerSection('why')}
      style={styles.bandMuted}
      aria-label="Why teams switch">
      <div style={styles.dotGrid} aria-hidden="true" />
      <div style={{...bandInnerStyle, position: 'relative'}}>
        <Reveal>
          <div
            style={{
              ...styles.whyHeader,
              ...(isStacked ? styles.whyHeaderStacked : null),
            }}>
            <div style={{flex: '5 1 0', minWidth: 0}}>
              <VStack gap={2} hAlign="start">
                <Eyebrow label="Why teams switch" />
                <h2 style={headingStyle}>
                  The three numbers that close the debate
                </h2>
              </VStack>
            </div>
            <div style={{flex: '7 1 0', minWidth: 0}}>
              <Text type="supporting" color="secondary">
                From our 2026 switching survey (63 teams) and the May 2026
                public benchmark — methodology in the footnotes. No cherry
                picking: the same workspace, sources, and queries ran on
                both products.
              </Text>
            </div>
          </div>
        </Reveal>
        <Grid columns={{minWidth: 240, repeat: 'fit', max: 3}} gap={4}>
          {SWITCH_REASONS.map((reason, index) => (
            <SwitchReasonCard
              key={reason.id}
              reason={reason}
              delayMs={index * 90}
            />
          ))}
        </Grid>
      </div>
    </section>
  );

  // ============= MIGRATION PATH =============

  const migrationHeader = (
    <VStack gap={2} hAlign="start">
      <Eyebrow label="The weekend plan" />
      <h2 style={headingStyle}>Export Friday, verify Monday</h2>
      <Text type="supporting" color="secondary">
        Four steps, one command, and a migration engineer on the call for
        workspaces above 20 seats.
      </Text>
    </VStack>
  );

  const activeStepData = MIGRATION_STEPS[activeStep];

  // Pinned scroll story: a 600px sticky stage inside a fixed 1560px
  // container (960px of travel). Scroll progress fills the step rail and
  // advances the scripted terminal; steps are also clickable buttons.
  const migrationPinned = (
    <section
      ref={node => {
        pinRef.current = node;
        sectionRefs.current.migration = node;
      }}
      aria-label="Migration path"
      style={{height: PIN_CONTAINER_HEIGHT}}>
      <div style={{...styles.pinStage, height: PIN_STAGE_HEIGHT}}>
        <div style={styles.dotGrid} aria-hidden="true" />
        <div style={styles.pinColumn}>
          {migrationHeader}
          <div style={styles.storyGrid}>
            <VStack gap={4} hAlign="start">
              <div style={{display: 'flex', width: '100%'}}>
                <div style={styles.stepRailLine} aria-hidden="true">
                  <div
                    style={{
                      ...styles.stepRailFill,
                      height: \`\${Math.round(storyProgress * 100)}%\`,
                    }}
                  />
                </div>
                <VStack gap={1} style={{flex: '1 1 0', minWidth: 0}}>
                  {MIGRATION_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      aria-current={index === activeStep ? 'step' : undefined}
                      style={{
                        ...styles.stepButton,
                        ...(index === activeStep
                          ? {backgroundColor: ACCENT_TINT_SOFT}
                          : {opacity: 0.55}),
                      }}
                      onClick={() => jumpToMigrationStep(index)}>
                      <span style={styles.stepNumeral}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <StackItem size="fill">
                        <VStack gap={0}>
                          <Text type="label">{step.title}</Text>
                          <Text type="supporting" color="secondary">
                            {step.duration}
                          </Text>
                        </VStack>
                      </StackItem>
                    </button>
                  ))}
                </VStack>
              </div>
              <Text type="supporting" color="secondary">
                Scroll — or click a step.
              </Text>
            </VStack>
            <div
              key={activeStep}
              className="pcl-stage-in"
              style={styles.stageCard}>
              <span style={styles.stageWatermark} aria-hidden="true">
                {String(activeStep + 1).padStart(2, '0')}
              </span>
              <HStack gap={3} vAlign="center">
                <div style={styles.statGlyph} aria-hidden="true">
                  <Icon icon={activeStepData.icon} size="sm" color="inherit" />
                </div>
                <StackItem size="fill">
                  <VStack gap={0}>
                    <span style={styles.stepIndex}>
                      Step {activeStep + 1} of {MIGRATION_STEPS.length}
                    </span>
                    <Text type="label">{activeStepData.title}</Text>
                  </VStack>
                </StackItem>
                <Badge
                  variant="neutral"
                  icon={<Icon icon={ClockIcon} size="xsm" color="inherit" />}
                  label={activeStepData.duration}
                />
              </HStack>
              <Text type="supporting" color="secondary">
                {activeStepData.copy}
              </Text>
              <div style={styles.stageTerminal}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    flexWrap: 'wrap',
                  }}>
                  <code style={styles.terminalCommand}>{CLI_COMMAND}</code>
                  <Button
                    label={isCommandCopied ? 'Copied' : 'Copy'}
                    variant="secondary"
                    size="sm"
                    icon={
                      <Icon
                        icon={isCommandCopied ? CheckIcon : CopyIcon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    onClick={copyCommand}
                  />
                </div>
                {MIGRATION_STEPS.slice(0, activeStep).map(step => (
                  <p key={step.id} style={styles.logDone}>
                    ✓ {step.title} complete
                  </p>
                ))}
                {(STEP_LOGS[activeStepData.id] ?? []).map(line => (
                  <p
                    key={line.text}
                    style={line.glyph === '✓' ? styles.logOk : styles.logLine}>
                    {line.glyph} {line.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Static sequence: compact widths and reduced motion get every step
  // visible at once (no pinning, nothing hidden).
  const migrationStatic = (
    <section ref={registerSection('migration')} aria-label="Migration path">
      <div style={bandInnerStyle}>
        <Reveal>{migrationHeader}</Reveal>
        <div
          style={{
            ...styles.stepRail,
            ...(isStacked ? styles.stepRailStacked : null),
          }}>
          {MIGRATION_STEPS.map((step, index) => (
            <Reveal
              key={step.id}
              delayMs={index * 90}
              style={{flex: '1 1 0', minWidth: 0, display: 'flex'}}>
              <div style={{...styles.stepCard, flex: '1 1 auto'}}>
                <HStack gap={2} vAlign="center">
                  <div style={styles.statGlyph} aria-hidden="true">
                    <Icon icon={step.icon} size="sm" color="inherit" />
                  </div>
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <span style={styles.stepIndex}>Step {index + 1}</span>
                      <Text type="label">{step.title}</Text>
                    </VStack>
                  </StackItem>
                  <Badge
                    variant="neutral"
                    icon={<Icon icon={ClockIcon} size="xsm" color="inherit" />}
                    label={step.duration}
                  />
                </HStack>
                <Text type="supporting" color="secondary">
                  {step.copy}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={styles.terminal}>
            <code style={styles.terminalCommand}>{CLI_COMMAND}</code>
            <Button
              label={isCommandCopied ? 'Copied' : 'Copy command'}
              variant="secondary"
              size="sm"
              icon={
                <Icon
                  icon={isCommandCopied ? CheckIcon : CopyIcon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={copyCommand}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );

  const migrationSection = isPinned ? migrationPinned : migrationStatic;

  // ============= SWITCHER TESTIMONIAL (dark glass + spotlight) =============

  const testimonialSection = (
    <section
      style={styles.testimonialBand}
      aria-label="Switcher story"
      onPointerMove={onDarkPointerMove}>
      <div style={{...styles.grainLayer, opacity: 0.05}} aria-hidden="true" />
      <div style={styles.spotlight} aria-hidden="true" />
      {/* Extra bottom padding: the honest callout card overlaps this
          band's lower edge into the pricing band. */}
      <div
        style={{
          ...bandInnerStyle,
          position: 'relative',
          paddingBottom: isPhone ? 120 : 168,
        }}>
        <Reveal>
          <div style={styles.glassQuote}>
            <Icon icon={QuoteIcon} size="md" color="inherit" />
            <p
              style={{
                ...styles.quoteText,
                ...(isPhone ? styles.quoteTextCompact : null),
              }}>
              {TESTIMONIAL.quote}
            </p>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <div style={styles.avatarDisc} aria-hidden="true">
                {TESTIMONIAL.initials}
              </div>
              <VStack gap={0}>
                <Text weight="semibold" color="inherit">
                  {TESTIMONIAL.name}
                </Text>
                <span style={{fontSize: 13, color: DARK_TEXT_SOFT}}>
                  {TESTIMONIAL.role}
                </span>
              </VStack>
            </HStack>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-4)',
                flexWrap: 'wrap',
                flexDirection: isStacked ? 'column' : 'row',
              }}>
              <VStack gap={2}>
                <span style={styles.chipGroupLabel}>Before · Gridware</span>
                <HStack gap={2} wrap="wrap">
                  {TESTIMONIAL.before.map(metric => (
                    <span
                      key={metric}
                      style={{...styles.metricChip, color: DARK_TEXT_SOFT}}>
                      {metric}
                    </span>
                  ))}
                </HStack>
              </VStack>
              <VStack gap={2}>
                <span style={styles.chipGroupLabel}>After · Northbeam</span>
                <HStack gap={2} wrap="wrap">
                  {TESTIMONIAL.after.map(metric => (
                    <span
                      key={metric}
                      style={{...styles.metricChip, color: DARK_TEXT}}>
                      <Icon icon={CheckIcon} size="xsm" color="inherit" />
                      {metric}
                    </span>
                  ))}
                </HStack>
              </VStack>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= HONEST CALLOUT (crosses the band boundary) =============

  const honestCallout = (
    <div
      style={{
        ...bandInnerStyle,
        paddingTop: 0,
        paddingBottom: isPhone ? 24 : 40,
      }}>
      <Reveal>
        <Card
          padding={5}
          style={{
            position: 'relative',
            zIndex: 2,
            marginTop: isPhone ? -72 : -104,
            boxShadow: SHADOW_FLOATING,
          }}>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <div style={styles.statGlyph} aria-hidden="true">
                <Icon icon={ScaleIcon} size="sm" color="inherit" />
              </div>
              <h3 style={{...styles.sectionHeading, fontSize: isPhone ? 22 : 26}}>
                When {BRAND.rival} is a better fit
              </h3>
            </HStack>
            <Text type="supporting" color="secondary">
              Two honest cases where we&rsquo;d tell you to renew instead:
            </Text>
            <VStack gap={2}>
              {HONEST_BULLETS.map(bullet => (
                <HStack key={bullet} gap={2} vAlign="start">
                  <span style={styles.crossGlyph} aria-hidden="true">
                    <Icon icon={MinusIcon} size="sm" color="inherit" />
                  </span>
                  <StackItem size="fill">
                    <Text type="body">{bullet}</Text>
                  </StackItem>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card>
      </Reveal>
    </div>
  );

  // ============= PRICING (offset asymmetric pair) =============

  const pricingSection = (
    <section
      ref={registerSection('pricing')}
      style={styles.bandMuted}
      aria-label="Pricing at a glance">
      <div style={{...bandInnerStyle, position: 'relative'}}>
        <Reveal>
          <VStack gap={2} hAlign="center">
            <Eyebrow label="Pricing at a glance" />
            <h2 style={{...headingStyle, textAlign: 'center'}}>
              One flat number vs four tiers of maybe
            </h2>
          </VStack>
        </Reveal>
        <Grid columns={{minWidth: 260, repeat: 'fit', max: 2}} gap={4}>
          {PRICE_CARDS.map((card, index) => (
            <Reveal key={card.id} delayMs={index * 90} style={{height: '100%'}}>
              <Card
                padding={5}
                height="100%"
                className={card.id === 'northbeam' ? 'pcl-ours' : 'pcl-lift'}
                style={
                  card.id === 'northbeam' && !isStacked
                    ? {marginTop: -16, borderColor: ACCENT_TINT_BORDER}
                    : undefined
                }>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="label">{card.name}</Text>
                    {card.id === 'northbeam' ? (
                      <Badge variant="success" label="Every feature included" />
                    ) : (
                      <Badge variant="neutral" label="For comparison" />
                    )}
                  </HStack>
                  <VStack gap={0}>
                    <span
                      style={{
                        ...styles.priceFigure,
                        color:
                          card.id === 'northbeam'
                            ? BRAND_ACCENT
                            : 'var(--color-text-primary)',
                      }}>
                      {card.figure}
                    </span>
                    <Text type="supporting" color="secondary">
                      {card.cadence}
                      {card.footnote != null && (
                        <button
                          type="button"
                          style={styles.footnoteSup}
                          aria-label={\`Footnote \${card.footnote}\`}
                          onClick={() => jumpToSection('footnotes')}>
                          {SUP_MARKS[card.footnote - 1]}
                        </button>
                      )}
                    </Text>
                  </VStack>
                  <Text type="supporting" color="secondary">
                    {card.caption}
                  </Text>
                  <Divider />
                  <VStack gap={2}>
                    {card.lines.map(line => (
                      <HStack key={line.label} gap={2} vAlign="center">
                        <span
                          style={
                            line.isIncluded
                              ? styles.checkGlyph
                              : styles.crossGlyph
                          }
                          aria-hidden="true">
                          <Icon
                            icon={line.isIncluded ? CheckIcon : XIcon}
                            size="xsm"
                            color="inherit"
                          />
                        </span>
                        <StackItem size="fill">
                          <Text size="sm">{line.label}</Text>
                        </StackItem>
                      </HStack>
                    ))}
                  </VStack>
                  {card.id === 'northbeam' && (
                    <CtaSheen>
                      <Button
                        label="Start a free 30-day pilot"
                        variant="primary"
                        onClick={() => jumpToSection('cta')}
                      />
                    </CtaSheen>
                  )}
                </VStack>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </div>
    </section>
  );

  // ============= FAQ =============

  const faqSection = (
    <section
      ref={registerSection('faq')}
      aria-label="Frequently asked questions">
      <div style={bandInnerStyle}>
        <Reveal>
          <VStack gap={2} hAlign="center">
            <Eyebrow label="Switching FAQ" />
            <h2 style={{...headingStyle, textAlign: 'center'}}>
              The questions renewal season raises
            </h2>
          </VStack>
        </Reveal>
        <Reveal delayMs={90}>
          <Card padding={5} style={{boxShadow: SHADOW_RAISED}}>
            <VStack gap={0}>
              {FAQ.map((entry, index) => (
                <VStack key={entry.id} gap={0}>
                  {index > 0 ? <Divider /> : null}
                  <div style={{padding: 'var(--spacing-2) 0'}}>
                    <Collapsible
                      isOpen={openFaqs.has(entry.id)}
                      onOpenChange={isOpen => toggleFaq(entry.id, isOpen)}
                      trigger={entry.question}>
                      <div style={{padding: 'var(--spacing-2) 0 var(--spacing-1)'}}>
                        <Text type="body" color="secondary">
                          {entry.answer}
                        </Text>
                      </div>
                    </Collapsible>
                  </div>
                </VStack>
              ))}
            </VStack>
          </Card>
        </Reveal>
      </div>
    </section>
  );

  // ============= FINAL CTA =============

  const ctaSection = (
    <section
      ref={registerSection('cta')}
      style={styles.ctaBand}
      aria-label="Get the migration checklist">
      <div style={{...styles.grainLayer, opacity: 0.05}} aria-hidden="true" />
      <div
        style={{
          ...bandInnerStyle,
          position: 'relative',
          alignItems: 'center',
          textAlign: 'center',
        }}>
        <h2
          style={{
            ...styles.ctaHeadline,
            ...(isPhone ? styles.ctaHeadlineCompact : null),
          }}>
          Ready to migrate in a weekend?
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.5,
            maxWidth: 560,
            color: DARK_TEXT_SOFT,
          }}>
          Get the 14-point migration checklist — the same one our engineers
          run on every cutover — plus a seat-by-seat savings estimate against
          your current {BRAND.rival} invoice.
        </p>
        {confirmedEmail === null ? (
          <VStack gap={2} hAlign="center">
            <div
              style={{
                ...styles.emailRow,
                ...(isPhone ? styles.emailRowStacked : null),
              }}>
              <div style={styles.emailInput}>
                <TextInput
                  label="Work email for the migration checklist"
                  isLabelHidden
                  placeholder="you@company.com"
                  value={emailValue}
                  onChange={value => {
                    setEmailValue(value);
                    setEmailError(null);
                  }}
                />
              </div>
              <CtaSheen>
                <Button
                  label="Send the checklist"
                  variant="primary"
                  icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                  onClick={submitEmail}
                />
              </CtaSheen>
            </div>
            {emailError !== null && (
              <p style={styles.emailError} role="alert">
                {emailError}
              </p>
            )}
            <span style={{fontSize: 13, color: DARK_TEXT_FAINT}}>
              One email, no drip sequence. Unsubscribe is one click.
            </span>
          </VStack>
        ) : (
          <HStack gap={3} vAlign="center" wrap="wrap" hAlign="center">
            <div style={styles.successDisc} aria-hidden="true">
              <Icon icon={MailCheckIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0} hAlign="start">
              <Text weight="semibold" color="inherit">
                Checklist on its way to {confirmedEmail}
              </Text>
              <button
                type="button"
                style={{...styles.footerLink, color: DARK_TEXT_SOFT}}
                onClick={() => setConfirmedEmail(null)}>
                Use a different email
              </button>
            </VStack>
          </HStack>
        )}
        <HStack gap={2} wrap="wrap" hAlign="center">
          <Button
            label="Talk to a migration engineer"
            variant="secondary"
            onClick={() =>
              fireToast('Final CTA — migration engineer call requested.')
            }
          />
        </HStack>
      </div>
    </section>
  );

  // ============= FOOTNOTES =============

  const footnotesSection = (
    <section ref={registerSection('footnotes')} aria-label="Footnotes">
      <div
        style={{
          ...bandInnerStyle,
          padding: isPhone
            ? '40px var(--spacing-4)'
            : '56px var(--spacing-6)',
          gap: 'var(--spacing-3)',
        }}>
        <Divider />
        <Text type="label" color="secondary">
          Footnotes
        </Text>
        <VStack gap={2}>
          {FOOTNOTES.map((note, index) => (
            <div key={note} style={styles.footnoteRow}>
              <span style={styles.footnoteMark} aria-hidden="true">
                {SUP_MARKS[index]}
              </span>
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  {note}
                </Text>
              </StackItem>
            </div>
          ))}
        </VStack>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer} aria-label="Footer">
      <div
        style={{
          ...bandInnerStyle,
          padding: isPhone
            ? '48px var(--spacing-4)'
            : '64px var(--spacing-6)',
        }}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-6)',
            flexWrap: 'wrap',
            flexDirection: isStacked ? 'column' : 'row',
          }}>
          <VStack gap={2}>
            <BrandMark />
            <span style={{fontSize: 13, color: DARK_TEXT_FAINT, maxWidth: 280}}>
              {BRAND.tagline}. Flat pricing, sub-second dashboards, and a
              migration path measured in a weekend.
            </span>
          </VStack>
          <StackItem size="fill">
            <Grid columns={{minWidth: 140, repeat: 'fit', max: 3}} gap={4}>
              {FOOTER_LINK_GROUPS.map(group => (
                <VStack key={group.id} gap={1}>
                  <span style={styles.chipGroupLabel}>{group.heading}</span>
                  {group.links.map(link => (
                    <button
                      key={link.label}
                      type="button"
                      style={styles.footerLink}
                      onClick={() =>
                        link.anchor != null
                          ? jumpToSection(link.anchor)
                          : fireToast(\`Footer — \${link.label} clicked.\`)
                      }>
                      {link.label}
                    </button>
                  ))}
                </VStack>
              ))}
            </Grid>
          </StackItem>
        </div>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <span style={{fontSize: 12, color: DARK_TEXT_FAINT}}>
              © 2026 Northbeam Analytics, Inc. Gridware comparison data from
              public list pricing and docs, June 2026 · corrections:
              compare@northbeam.dev
            </span>
          </StackItem>
          <span style={{fontSize: 12, color: DARK_TEXT_FAINT}}>
            SOC 2 Type II · GDPR
          </span>
        </HStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Northbeam vs Gridware comparison landing page">
            <div ref={pageRef} style={styles.page}>
              {navbar}
              {hero}
              {comparisonSection}
              {whySection}
              {migrationSection}
              {testimonialSection}
              {honestCallout}
              {pricingSection}
              {faqSection}
              {ctaSection}
              {footnotesSection}
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
`;export{e as default};