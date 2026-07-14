// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file open-source-project-landing.tsx
 * @input Deterministic fixtures only (the fictional "tessera" open-source
 *   React state library: four package-manager install commands, star / fork /
 *   license / bundle-size stat values, a before/after code pair for the
 *   30-second example, four release-timeline entries with semver levels and
 *   highlight bullets, 24 contributor monograms plus totals, three sponsor
 *   tiers of monogram tiles, a 13-point star-history series, eight "used by"
 *   wordmarks, three community link cards, and footer link labels)
 * @output Complete open-source project landing page: a sticky navbar with a
 *   brand mark, four smooth-scrolling anchor links with scroll-spy (collapsing
 *   to a menu button + dropdown at compact widths), and a working
 *   Star-on-GitHub toggle that increments the live star count; a centered hero
 *   with the package wordmark, one-line pitch, an install card whose
 *   npm/pnpm/yarn/bun TabList swaps the CodeBlock command (copy button with
 *   inline "Copied" feedback), and count-up star/fork stat chips; a
 *   before/after 30-second example band; a four-release semver timeline;
 *   a 24-tile contributor monogram wall with a count-up caption; a
 *   three-tier sponsors band; a star-history SVG sparkline that draws on
 *   first reveal beside count-up growth chips; a "used by" wordmark strip;
 *   Docs / Discord / GitHub link cards; and a scheme-locked footer with the
 *   MIT license note. Scroll-reveal rise+fade sections fire once via
 *   IntersectionObserver.
 * @position Page template; emitted by `astryx template open-source-project-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy and is measured by a
 * ResizeObserver; the navbar is position:sticky top:0 inside it. Sections
 * alternate full-bleed tinted bands with plain bands; each band centers a
 * 1120px column. The compact nav dropdown drops absolutely from the sticky
 * navbar.
 *
 * Interaction contract:
 * - Nav anchor links smooth-scroll the container to real section ids with a
 *   sticky-nav allowance; onScroll spies the last anchor above the fold and
 *   highlights the matching link (aria-current). At compact widths the links
 *   collapse behind a 40px menu button whose dropdown closes on Escape,
 *   outside pointerdown, or any selection.
 * - The Star button (nav + hero) toggles a starred state: the label flips to
 *   "Starred" and every star count on the page increments by one. No dead
 *   buttons in the hero: "Get started" scrolls to the example section.
 * - The install card's package-manager TabList swaps the CodeBlock command;
 *   the CodeBlock copy button fires an aria-live "Copied ..." confirmation
 *   that clears after 2 seconds.
 * - Community link cards and sponsor/footer links would leave the page, so
 *   they are intentionally inert (no-op onClick per template conventions).
 *
 * Motion contract (all gated by prefers-reduced-motion via matchMedia):
 * - Sections reveal once via IntersectionObserver — 12px rise + fade, with
 *   small per-item stagger delays on timeline rows and contributor tiles.
 * - Star/fork chips, the contributor total, and the 90-day star delta count
 *   up on first view (requestAnimationFrame, eased, deterministic targets).
 * - The star-history polyline draws on when revealed (pathLength dashoffset
 *   transition); its area fill fades in.
 * - Reduced motion: reveals render visible, counters render final values,
 *   and the sparkline renders fully drawn. No entrance motion anywhere.
 *
 * Container policy (landing-page archetype): page chrome is frame-first;
 * marketing sections are painted bands and bordered Cards inside the
 * document column. All art is CSS/SVG — monogram gradient tiles, a mosaic
 * brand glyph, and a fixed-point sparkline. No network assets, no real
 * logos, no clocks, no randomness.
 *
 * Color policy: token-pure except two sanctioned classes:
 * 1. ONE quarantined accent literal (tessera teal) declared once as a
 *    light-dark() pair with contrast math (see ACCENT below); its rgba
 *    tints derive from the same two hex values.
 * 2. Scheme-locked brand art: contributor/sponsor monogram gradients and
 *    the footer band carry literal colors under colorScheme:'dark' so they
 *    read identically in both app themes (same policy as
 *    saas-landing-page.tsx brand tiles).
 *
 * Responsive contract (measured with a ResizeObserver on the page element —
 * the inline demo stage is ~1045px wide, so viewport media queries are not
 * used):
 * - Column: max-width 1120px, centered; tinted bands and footer bleed edge
 *   to edge.
 * - >880px: navbar shows 4 inline anchor links + Star button.
 * - <=880px: anchors collapse behind a 40px menu button + dropdown panel
 *   (Escape / outside tap / selection closes); Star button stays visible.
 * - >740px: before/after example sits 2-up; release timeline text and
 *   bullets share a row; community cards sit 3-up (Grid minWidth).
 * - <=740px: the example pair, timeline rows, and sponsor tier rows stack;
 *   community cards drop 3 -> 2 -> 1 via Grid minWidth.
 * - <=540px: wordmark and headline sizes step down, hero stat chips wrap,
 *   band paddings tighten, sponsor tiles shrink, and the used-by strip
 *   wraps to two rows. Action rows are wrap-enabled so the page holds at
 *   390px in the phone artboard with no overflow-x.
 * - Tap targets: nav links, the menu button, and footer links are >=40px
 *   controls; nothing on the page requires hover.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Token} from '@astryxdesign/core/Token';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  GitBranchIcon,
  GitForkIcon,
  HeartIcon,
  MenuIcon,
  MessagesSquareIcon,
  ScaleIcon,
  PackageIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal (the ONE sanctioned accent for this page):
 * tessera teal. Contrast math: light #0F766E on #FFFFFF = 5.5:1 (AA for
 * normal text, AAA for the >=18px uses here); dark #2DD4BF on a ~#101828
 * dark body = 9.9:1 (AAA). The two tints below are rgba forms of the SAME
 * two hex values, used only as backgrounds under accent-colored content.
 */
const ACCENT = 'light-dark(#0F766E, #2DD4BF)';
const ACCENT_TINT =
  'light-dark(rgba(15, 118, 110, 0.10), rgba(45, 212, 191, 0.14))';
const ACCENT_TINT_STRONG =
  'light-dark(rgba(15, 118, 110, 0.22), rgba(45, 212, 191, 0.30))';

// Scheme-locked footer surface (see Color policy).
const FOOTER_BG = '#0B1220';
const FOOTER_TEXT = '#FFFFFF';
const FOOTER_TEXT_SOFT = 'rgba(226, 232, 240, 0.78)';
const FOOTER_TEXT_FAINT = 'rgba(226, 232, 240, 0.58)';
const FOOTER_BORDER = 'rgba(255, 255, 255, 0.16)';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 64;
const SPY_OFFSET = 140;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy, sticky nav, and width measurement.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
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
  band: {
    paddingBlock: 'var(--spacing-10, 64px)',
  },
  bandPhone: {
    paddingBlock: 'var(--spacing-8)',
  },
  bandTinted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
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
    minHeight: 56,
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
  navMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
  },
  navMenuLink: {
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
  // ---- brand mark: CSS mosaic glyph (tessera = mosaic tile) ----
  mosaic: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 3,
    padding: 3,
    boxSizing: 'border-box',
    borderRadius: 8,
    backgroundColor: ACCENT_TINT,
  },
  mosaicTile: {
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  mosaicTileGhost: {
    borderRadius: 3,
    backgroundColor: ACCENT_TINT_STRONG,
  },
  wordmark: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  // ---- hero ----
  heroWordmark: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  heroWordmarkPhone: {
    fontSize: 42,
  },
  heroPitch: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    margin: 0,
    textAlign: 'center',
  },
  heroPitchPhone: {
    fontSize: 19,
  },
  heroSubcopy: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 560,
    margin: 0,
    textAlign: 'center',
  },
  statChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    whiteSpace: 'nowrap',
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  statChipLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  installCard: {
    width: '100%',
    maxWidth: 620,
  },
  copyLive: {
    minHeight: 20,
    fontSize: 13,
    color: ACCENT,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // ---- section intros ----
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    textAlign: 'center',
    marginBottom: 'var(--spacing-6)',
  },
  // ---- before / after example ----
  examplePair: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'stretch',
  },
  examplePairStacked: {
    flexDirection: 'column',
  },
  examplePane: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- release timeline ----
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  timelineRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    position: 'relative',
    paddingBottom: 'var(--spacing-6)',
  },
  timelineRail: {
    width: 24,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    border: '3px solid var(--color-background-body)',
    boxShadow: '0 0 0 1px var(--color-border)',
    flexShrink: 0,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'var(--color-border)',
    marginTop: 4,
  },
  timelineBody: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  timelineVersion: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 17,
    fontWeight: 700,
  },
  timelineBullet: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  // ---- contributors ----
  contributorWall: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
    maxWidth: 760,
    marginInline: 'auto',
  },
  // Scheme-locked brand art (see Color policy): gradient monograms are
  // identical in both app themes; white text reads on every gradient.
  monogram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontWeight: 700,
    flexShrink: 0,
  },
  // ---- sponsors ----
  sponsorTier: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    alignItems: 'center',
  },
  sponsorRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
  },
  sponsorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  // Scheme-locked brand art (see Color policy).
  sponsorTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontWeight: 700,
    flexShrink: 0,
  },
  // ---- star history ----
  sparkFrame: {
    width: '100%',
    display: 'block',
  },
  growthChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- used-by strip ----
  usedByStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
  },
  usedByTile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 116,
    height: 42,
    paddingInline: 16,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  // ---- community cards ----
  communityGlyph: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    flexShrink: 0,
  },
  // ---- footer (scheme-locked, see Color policy) ----
  footer: {
    colorScheme: 'dark',
    color: FOOTER_TEXT,
    backgroundColor: FOOTER_BG,
  },
  footerInner: {
    width: '100%',
    maxWidth: 1120,
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
    minHeight: 40,
    paddingInline: 4,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: FOOTER_TEXT_FAINT,
    textAlign: 'left',
  },
  footerRule: {
    height: 1,
    backgroundColor: FOOTER_BORDER,
    border: 'none',
    margin: 0,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional "tessera" state library.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'tessera',
  pitch: 'State that composes like tiles.',
  subcopy:
    'One primitive — the tile. Compose tiles into any shape of state, ' +
    'subscribe to exactly what you read, and ship 2.1 kB to production. ' +
    'No providers, no boilerplate, no relicensing surprises.',
};

const STATS = {
  stars: 12842,
  forks: 486,
  license: 'MIT',
  bundle: '2.1 kB',
  starsDelta90d: 1204,
  contributors: 293,
  countries: 41,
};

type SectionId = 'example' | 'releases' | 'sponsors' | 'community';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'example', label: 'Example'},
  {id: 'releases', label: 'Releases'},
  {id: 'sponsors', label: 'Sponsors'},
  {id: 'community', label: 'Community'},
];

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: readonly {id: PackageManager; command: string}[] = [
  {id: 'npm', command: 'npm install tessera'},
  {id: 'pnpm', command: 'pnpm add tessera'},
  {id: 'yarn', command: 'yarn add tessera'},
  {id: 'bun', command: 'bun add tessera'},
];

const BEFORE_CODE = `const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'add':
      return {...state, items: [...state.items, action.item]};
    case 'remove':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.id),
      };
    default:
      return state;
  }
}

export function CartProvider({children}) {
  const [state, dispatch] = useReducer(cartReducer, {items: []});
  const value = useMemo(() => ({state, dispatch}), [state]);
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context == null) throw new Error('Missing <CartProvider>');
  return context;
}`;

const AFTER_CODE = `import {tile} from 'tessera';

export const cart = tile({items: []});

export const addItem = item =>
  cart.set(state => ({items: [...state.items, item]}));

export const removeItem = id =>
  cart.set(state => ({
    items: state.items.filter(item => item.id !== id),
  }));

// Any component — no provider, no context
const items = cart.use(state => state.items);`;

type SemverLevel = 'major' | 'minor' | 'patch';

interface Release {
  version: string;
  date: string;
  level: SemverLevel;
  title: string;
  bullets: readonly string[];
}

const RELEASES: readonly Release[] = [
  {
    version: 'v4.0.0',
    date: 'June 18, 2026',
    level: 'major',
    title: 'Tiles v2',
    bullets: [
      'Computed tiles are lazy by default — cold-start renders drop ~34% on the benchmark suite.',
      'New devtools timeline with time-travel and per-tile subscription counts.',
      'Dropped the legacy React 17 adapter; codemod ships with the migration guide.',
    ],
  },
  {
    version: 'v3.6.0',
    date: 'March 11, 2026',
    level: 'minor',
    title: 'Keyed families',
    bullets: [
      'tile.family() for keyed collections — one tile per entity id, garbage-collected on release.',
      'SSR snapshot hydration is 2.3x faster on large stores.',
    ],
  },
  {
    version: 'v3.5.2',
    date: 'January 27, 2026',
    level: 'patch',
    title: 'Selector fixes',
    bullets: [
      'Fix: selector equality regressed for NaN-containing tuples in 3.5.1.',
      'Types: use() now infers readonly tuples from selector returns.',
    ],
  },
  {
    version: 'v3.5.0',
    date: 'November 4, 2025',
    level: 'minor',
    title: 'Async tiles',
    bullets: [
      'Async tiles with suspense-free loading states — read {status, data} synchronously.',
      'Bundle trimmed to 2.1 kB min+gzip (was 2.6 kB).',
    ],
  },
];

const SEMVER_BADGE: Record<
  SemverLevel,
  {variant: 'purple' | 'blue' | 'neutral'; label: string}
> = {
  major: {variant: 'purple', label: 'major'},
  minor: {variant: 'blue', label: 'minor'},
  patch: {variant: 'neutral', label: 'patch'},
};

// Scheme-locked brand-art gradients (see Color policy): cycled across
// contributor and sponsor monogram tiles; identical in both app themes.
const MONOGRAM_GRADIENTS: readonly string[] = [
  'linear-gradient(135deg, #0D9488 0%, #0369A1 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)',
  'linear-gradient(135deg, #059669 0%, #65A30D 100%)',
  'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)',
];

const CONTRIBUTORS: readonly {name: string; initials: string}[] = [
  {name: 'Ana Ferreira', initials: 'AF'},
  {name: 'Kofi Mensah', initials: 'KM'},
  {name: 'Yuki Tanaka', initials: 'YT'},
  {name: 'Priya Raman', initials: 'PR'},
  {name: 'Lars Nygaard', initials: 'LN'},
  {name: 'Sofia Petrova', initials: 'SP'},
  {name: 'Diego Alvarez', initials: 'DA'},
  {name: 'Mei-Ling Chu', initials: 'MC'},
  {name: 'Tomás Ribeiro', initials: 'TR'},
  {name: 'Amara Diallo', initials: 'AD'},
  {name: 'Jonas Weber', initials: 'JW'},
  {name: 'Hana Kim', initials: 'HK'},
  {name: 'Mateo Rossi', initials: 'MR'},
  {name: 'Ingrid Olsen', initials: 'IO'},
  {name: 'Ravi Shankar', initials: 'RS'},
  {name: 'Clara Dubois', initials: 'CD'},
  {name: 'Emeka Obi', initials: 'EO'},
  {name: 'Nadia Haddad', initials: 'NH'},
  {name: 'Peter Kovacs', initials: 'PK'},
  {name: 'Lucia Moreno', initials: 'LM'},
  {name: 'Owen Gallagher', initials: 'OG'},
  {name: 'Zainab Farouk', initials: 'ZF'},
  {name: 'Elias Lind', initials: 'EL'},
  {name: 'Marta Kowalska', initials: 'MK'},
];

interface SponsorTier {
  id: string;
  heading: string;
  tileSize: number;
  sponsors: readonly {name: string; initials: string; note?: string}[];
}

const SPONSOR_TIERS: readonly SponsorTier[] = [
  {
    id: 'platinum',
    heading: 'Platinum — $500/mo',
    tileSize: 56,
    sponsors: [
      {name: 'Corestack', initials: 'CS', note: 'since 2023'},
      {name: 'Arclight Cloud', initials: 'AC', note: 'since 2024'},
      {name: 'Fieldnote', initials: 'FN', note: 'since 2024'},
    ],
  },
  {
    id: 'gold',
    heading: 'Gold — $100/mo',
    tileSize: 44,
    sponsors: [
      {name: 'Driftware', initials: 'DW'},
      {name: 'Papertrail Labs', initials: 'PL'},
      {name: 'Motif', initials: 'MT'},
      {name: 'Kelpworks', initials: 'KW'},
      {name: 'Signalbox', initials: 'SB'},
    ],
  },
  {
    id: 'community',
    heading: 'Community — 118 backers',
    tileSize: 32,
    sponsors: [
      {name: '@juno', initials: 'J'},
      {name: '@roux', initials: 'R'},
      {name: '@tkoda', initials: 'T'},
      {name: '@amaris', initials: 'A'},
      {name: '@beck', initials: 'B'},
      {name: '@silt', initials: 'S'},
      {name: '@wren', initials: 'W'},
      {name: '@kaido', initials: 'K'},
    ],
  },
];

/**
 * Star history: cumulative stars at ~5.5-month intervals, Jan 2021 through
 * Jul 2026. Fixed fixture points — the sparkline is fully deterministic.
 */
const STAR_HISTORY: readonly number[] = [
  0, 180, 520, 1040, 1690, 2480, 3420, 4510, 5740, 7350, 9120, 10980, 12842,
];

const STAR_YEARS: readonly string[] = [
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
];

const USED_BY: readonly string[] = [
  'BRIGHTLOOM',
  'CASCADE HQ',
  'OAKFRAME',
  'PULSEGRID',
  'VELLUM',
  'QUARTZLINE',
  'MOSSBANK',
  'TIDEWATER',
];

const COMMUNITY_CARDS: readonly {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
  meta: string;
}[] = [
  {
    id: 'docs',
    icon: BookOpenIcon,
    title: 'Docs',
    copy: 'Guides, API reference, and 30 copy-paste recipes at tessera.dev/docs.',
    meta: '142 pages · searchable',
  },
  {
    id: 'discord',
    icon: MessagesSquareIcon,
    title: 'Discord',
    copy: 'Ask anything in #help — median first reply is 11 minutes.',
    meta: '4,806 members · 312 online',
  },
  {
    id: 'github',
    icon: GitBranchIcon,
    title: 'GitHub',
    copy: 'Issues, discussions, and the public roadmap. PRs welcome.',
    meta: '23 good first issues',
  },
];

const FOOTER_LINKS: readonly string[] = [
  'Docs',
  'Changelog',
  'npm',
  'Security policy',
  'Governance',
  'Code of conduct',
];

// ============= HOOKS =============

/**
 * ResizeObserver width of the page element — the inline demo stage is
 * ~1045px wide inside a 1440px window, so viewport media queries never
 * fire there; element width is the source of truth for breakpoints.
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

/** prefers-reduced-motion, resolved before first paint via lazy init. */
function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/**
 * Fire-once scroll reveal. Reduced motion mounts already revealed so
 * content renders visible with no entrance motion.
 */
function useRevealOnce(
  isReduced: boolean,
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(isReduced);
  useEffect(() => {
    if (isReduced) {
      setIsRevealed(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isReduced]);
  return [ref, isRevealed];
}

/** Rise+fade entrance; delayMs staggers items inside a revealed section. */
function revealStyle(isRevealed: boolean, delayMs = 0): CSSProperties {
  return {
    opacity: isRevealed ? 1 : 0,
    transform: isRevealed ? 'none' : 'translateY(12px)',
    transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms`,
  };
}

/**
 * Eased count-up toward a fixed target on first activation. Reduced
 * motion (or an inactive trigger) renders the final/initial value with
 * no animation frames.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  isReduced: boolean,
): number {
  const [value, setValue] = useState(isReduced ? target : 0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (isReduced) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const durationMs = 1100;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, isReduced, target]);
  return value;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

// ============= SMALL PIECES =============

/** tessera brand mark: 2x2 mosaic glyph + mono wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.mosaic} aria-hidden="true">
        <span style={styles.mosaicTile} />
        <span style={styles.mosaicTileGhost} />
        <span style={styles.mosaicTileGhost} />
        <span style={styles.mosaicTile} />
      </div>
      <span style={{...styles.wordmark, fontSize: 17}}>{BRAND.name}</span>
    </HStack>
  );
}

/** Centered section intro: kicker Token + title + supporting copy. */
function SectionHead({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <div style={styles.sectionHead}>
      <Token label={kicker} size="sm" color="teal" />
      <Heading level={2}>{title}</Heading>
      <Text type="supporting" color="secondary" justify="center">
        {copy}
      </Text>
    </div>
  );
}

/** Gradient monogram disc/tile; gradients cycle deterministically. */
function Monogram({
  initials,
  name,
  size,
  gradientIndex,
  isRound = true,
}: {
  initials: string;
  name: string;
  size: number;
  gradientIndex: number;
  isRound?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      style={{
        ...(isRound ? styles.monogram : styles.sponsorTile),
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        background:
          MONOGRAM_GRADIENTS[gradientIndex % MONOGRAM_GRADIENTS.length],
      }}>
      {initials}
    </span>
  );
}

/**
 * Star-history sparkline: fixed 13-point series drawn as an SVG polyline
 * with pathLength=1; the dashoffset transition draws it on when the
 * section reveals (reduced motion renders it fully drawn immediately).
 */
function StarSparkline({
  isRevealed,
  isReduced,
}: {
  isRevealed: boolean;
  isReduced: boolean;
}) {
  const width = 640;
  const height = 190;
  const top = 18;
  const bottom = height - 30;
  const left = 10;
  const right = width - 66;
  const max = STAR_HISTORY[STAR_HISTORY.length - 1];
  const points = STAR_HISTORY.map((stars, index) => {
    const x = left + (index / (STAR_HISTORY.length - 1)) * (right - left);
    const y = bottom - (stars / max) * (bottom - top);
    return {x, y};
  });
  const polyline = points
    .map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
  const area = `${left},${bottom} ${polyline} ${right},${bottom}`;
  const last = points[points.length - 1];
  const gridValues = [4000, 8000, 12000];
  const isDrawn = isRevealed || isReduced;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={styles.sparkFrame}
      role="img"
      aria-label={`Star history from 2021 to 2026, growing from 0 to ${formatCount(max)} stars`}>
      {gridValues.map(value => {
        const y = bottom - (value / max) * (bottom - top);
        return (
          <g key={value}>
            <line
              x1={left}
              x2={right}
              y1={y}
              y2={y}
              style={{stroke: 'var(--color-border)'}}
              strokeDasharray="3 5"
              strokeWidth={1}
            />
            <text
              x={right + 8}
              y={y + 4}
              style={{
                fill: 'var(--color-text-secondary)',
                fontSize: 11,
                fontVariantNumeric: 'tabular-nums',
              }}>
              {`${value / 1000}k`}
            </text>
          </g>
        );
      })}
      <polygon
        points={area}
        style={{
          fill: ACCENT_TINT,
          opacity: isDrawn ? 1 : 0,
          transition: isReduced ? undefined : 'opacity 0.9s ease 0.9s',
        }}
      />
      <polyline
        points={polyline}
        pathLength={1}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          stroke: ACCENT,
          strokeDasharray: 1,
          strokeDashoffset: isDrawn ? 0 : 1,
          transition: isReduced ? undefined : 'stroke-dashoffset 1.6s ease',
        }}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={4.5}
        style={{
          fill: ACCENT,
          opacity: isDrawn ? 1 : 0,
          transition: isReduced ? undefined : 'opacity 0.4s ease 1.5s',
        }}
      />
      <text
        x={last.x - 8}
        y={last.y - 10}
        textAnchor="end"
        style={{
          fill: ACCENT,
          fontSize: 12,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          opacity: isDrawn ? 1 : 0,
          transition: isReduced ? undefined : 'opacity 0.4s ease 1.5s',
        }}>
        {formatCount(max)}
      </text>
      {STAR_YEARS.map((year, index) => {
        const x = left + (index / (STAR_YEARS.length - 1)) * (right - left);
        return (
          <text
            key={year}
            x={x}
            y={height - 8}
            textAnchor={index === 0 ? 'start' : 'middle'}
            style={{fill: 'var(--color-text-secondary)', fontSize: 11}}>
            {year}
          </text>
        );
      })}
    </svg>
  );
}

// ============= SECTIONS =============

function ExampleSection({
  isReduced,
  isStacked,
}: {
  isReduced: boolean;
  isStacked: boolean;
}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  return (
    <div ref={ref} style={revealStyle(isRevealed)}>
      <SectionHead
        kicker="30-second example"
        title="Delete the ceremony"
        copy="The same cart store, before and after. tessera replaces the context + reducer + provider stack with one tile you can read from anywhere."
      />
      <div
        style={{
          ...styles.examplePair,
          ...(isStacked ? styles.examplePairStacked : null),
        }}>
        <div style={styles.examplePane}>
          <HStack gap={2} vAlign="center">
            <Token label="Before" size="sm" color="gray" />
            <Text type="supporting" color="secondary">
              Context + reducer + provider — 31 lines
            </Text>
          </HStack>
          <CodeBlock
            code={BEFORE_CODE}
            language="tsx"
            title="store.tsx"
            size="sm"
            width="100%"
            maxHeight={340}
          />
        </div>
        <div style={styles.examplePane}>
          <HStack gap={2} vAlign="center">
            <Token label="After" size="sm" color="teal" />
            <Text type="supporting" color="secondary">
              One tile — 14 lines, no provider
            </Text>
          </HStack>
          <CodeBlock
            code={AFTER_CODE}
            language="tsx"
            title="store.ts"
            size="sm"
            width="100%"
            maxHeight={340}
          />
        </div>
      </div>
    </div>
  );
}

function ReleasesSection({isReduced}: {isReduced: boolean}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  return (
    <div ref={ref}>
      <div style={revealStyle(isRevealed)}>
        <SectionHead
          kicker="Releases"
          title="Steady, semver-honest releases"
          copy="A release roughly every six weeks. Breaking changes only in majors, always with a codemod and a migration guide."
        />
      </div>
      <div style={styles.timeline}>
        {RELEASES.map((release, index) => {
          const badge = SEMVER_BADGE[release.level];
          const isLast = index === RELEASES.length - 1;
          return (
            <div
              key={release.version}
              style={{
                ...styles.timelineRow,
                ...revealStyle(isRevealed, index * 120),
                ...(isLast ? {paddingBottom: 0} : null),
              }}>
              <div style={styles.timelineRail} aria-hidden="true">
                <span style={styles.timelineDot} />
                {isLast ? null : <span style={styles.timelineLine} />}
              </div>
              <div style={styles.timelineBody}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <span style={styles.timelineVersion}>{release.version}</span>
                  <Badge variant={badge.variant} label={badge.label} />
                  <Text type="supporting" color="secondary">
                    {release.date}
                  </Text>
                  <Text size="sm" weight="semibold">
                    {release.title}
                  </Text>
                </HStack>
                <VStack gap={1}>
                  {release.bullets.map(bullet => (
                    <div key={bullet} style={styles.timelineBullet}>
                      <span
                        style={{color: ACCENT, display: 'inline-flex', marginTop: 3}}
                        aria-hidden="true">
                        <Icon icon={CheckIcon} size="xsm" color="inherit" />
                      </span>
                      <Text size="sm" color="secondary">
                        {bullet}
                      </Text>
                    </div>
                  ))}
                </VStack>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContributorsSection({isReduced}: {isReduced: boolean}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  const contributorCount = useCountUp(
    STATS.contributors,
    isRevealed,
    isReduced,
  );
  return (
    <div ref={ref} style={revealStyle(isRevealed)}>
      <SectionHead
        kicker="Contributors"
        title="Built by 293 people"
        copy="Maintained in the open since 2021. 18 first-time contributors landed changes in the last release alone."
      />
      <div style={styles.contributorWall}>
        {CONTRIBUTORS.map((contributor, index) => (
          <div
            key={contributor.name}
            style={revealStyle(isRevealed, 200 + index * 35)}>
            <Monogram
              initials={contributor.initials}
              name={contributor.name}
              size={48}
              gradientIndex={index}
            />
          </div>
        ))}
      </div>
      <div style={{marginTop: 'var(--spacing-4)', textAlign: 'center'}}>
        <Text type="supporting" color="secondary">
          {`24 of ${formatCount(contributorCount)} contributors across ${STATS.countries} countries`}
        </Text>
      </div>
    </div>
  );
}

function SponsorsSection({isReduced}: {isReduced: boolean}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  return (
    <div ref={ref} style={revealStyle(isRevealed)}>
      <SectionHead
        kicker="Sponsors"
        title="Funded by the people who use it"
        copy="$4,850/mo currently funds two dedicated maintainer days a week — triage, reviews, and docs."
      />
      <VStack gap={6}>
        {SPONSOR_TIERS.map((tier, tierIndex) => (
          <div key={tier.id} style={styles.sponsorTier}>
            <Text
              size="sm"
              weight="semibold"
              color="secondary"
              style={{textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11}}>
              {tier.heading}
            </Text>
            <div style={styles.sponsorRow}>
              {tier.sponsors.map((sponsor, index) =>
                tier.id === 'community' ? (
                  <Monogram
                    key={sponsor.name}
                    initials={sponsor.initials}
                    name={sponsor.name}
                    size={tier.tileSize}
                    gradientIndex={index + tierIndex}
                  />
                ) : (
                  <div key={sponsor.name} style={styles.sponsorCard}>
                    <Monogram
                      initials={sponsor.initials}
                      name={sponsor.name}
                      size={tier.tileSize}
                      gradientIndex={index + tierIndex}
                      isRound={false}
                    />
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {sponsor.name}
                      </Text>
                      {sponsor.note == null ? null : (
                        <Text type="supporting" color="secondary">
                          {sponsor.note}
                        </Text>
                      )}
                    </VStack>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </VStack>
      <HStack gap={2} hAlign="center" style={{marginTop: 'var(--spacing-6)'}}>
        <Button
          label="Become a sponsor"
          variant="secondary"
          icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </HStack>
    </div>
  );
}

function GrowthSection({
  isReduced,
  isStarred,
}: {
  isReduced: boolean;
  isStarred: boolean;
}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  const delta = useCountUp(STATS.starsDelta90d, isRevealed, isReduced);
  return (
    <div ref={ref} style={revealStyle(isRevealed)}>
      <SectionHead
        kicker="Star history"
        title="Five years of steady adoption"
        copy="No launch spikes, no growth hacks — just releases that keep their promises."
      />
      <Card padding={4} width="100%">
        <StarSparkline isRevealed={isRevealed} isReduced={isReduced} />
      </Card>
      <HStack
        gap={2}
        hAlign="center"
        wrap="wrap"
        style={{marginTop: 'var(--spacing-4)'}}>
        <span style={styles.growthChip}>
          <Icon icon={StarIcon} size="xsm" color="inherit" />
          {`+${formatCount(delta)} stars in the last 90 days`}
        </span>
        <span style={styles.growthChip}>
          {`${formatCount(STATS.stars + (isStarred ? 1 : 0))} total`}
        </span>
        <span style={styles.growthChip}>#2 on OSS Radar · state management</span>
      </HStack>
      <div style={{marginTop: 'var(--spacing-8)'}}>
        <div style={{textAlign: 'center', marginBottom: 'var(--spacing-4)'}}>
          <Text
            size="sm"
            weight="semibold"
            color="secondary"
            style={{textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11}}>
            In production at
          </Text>
        </div>
        <div style={styles.usedByStrip}>
          {USED_BY.map(name => (
            <span key={name} style={styles.usedByTile}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunitySection({isReduced}: {isReduced: boolean}) {
  const [ref, isRevealed] = useRevealOnce(isReduced);
  return (
    <div ref={ref} style={revealStyle(isRevealed)}>
      <SectionHead
        kicker="Community"
        title="Stuck? Someone is around"
        copy="Docs first, Discord for the weird cases, GitHub for everything else."
      />
      <Grid columns={{minWidth: 250}} gap={3}>
        {COMMUNITY_CARDS.map((card, index) => (
          <div key={card.id} style={revealStyle(isRevealed, index * 120)}>
            <ClickableCard label={card.title} onClick={() => {}}>
              <HStack gap={3} vAlign="start">
                <div style={styles.communityGlyph} aria-hidden="true">
                  <Icon icon={card.icon} size="sm" color="inherit" />
                </div>
                <StackItem size="fill">
                  <VStack gap={1}>
                    <HStack gap={1} vAlign="center">
                      <Text size="base" weight="semibold">
                        {card.title}
                      </Text>
                      <span
                        style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}}
                        aria-hidden="true">
                        <Icon icon={ArrowRightIcon} size="xsm" color="inherit" />
                      </span>
                    </HStack>
                    <Text size="sm" color="secondary">
                      {card.copy}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {card.meta}
                    </Text>
                  </VStack>
                </StackItem>
              </HStack>
            </ClickableCard>
          </div>
        ))}
      </Grid>
    </div>
  );
}

// ============= PAGE =============

export default function OpenSourceProjectLandingTemplate() {
  // ---- layout measurement (demo-stage-safe breakpoints) ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pageRef);
  const isNavCompact = pageWidth > 0 && pageWidth <= 880;
  const isStacked = pageWidth > 0 && pageWidth <= 740;
  const isPhone = pageWidth > 0 && pageWidth <= 540;

  const isReduced = usePrefersReducedMotion();

  // ---- nav ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ---- hero interactions ----
  const [packageManager, setPackageManager] = useState<PackageManager>('pnpm');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);
  const [isStarred, setIsStarred] = useState(false);

  // ---- hero count-ups (hero is in view on mount = first view) ----
  const heroStars = useCountUp(STATS.stars, true, isReduced);
  const heroForks = useCountUp(STATS.forks, true, isReduced);
  const displayedStars = heroStars + (isStarred ? 1 : 0);

  // Menu dismisses on Escape (refocusing the trigger) and on pointerdown
  // outside the sticky navbar; listeners only run while it is open.
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

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    },
    [],
  );

  /** Smooth-scroll the page container to a section under the sticky nav. */
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
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Scroll-spy: the last nav anchor above the fold line wins. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
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
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const onCopyInstall = () => {
    const command =
      INSTALL_COMMANDS.find(entry => entry.id === packageManager)?.command ??
      '';
    setCopiedCommand(command);
    if (copiedTimeoutRef.current !== null) {
      window.clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopiedCommand(null);
    }, 2000);
  };

  const activeCommand =
    INSTALL_COMMANDS.find(entry => entry.id === packageManager)?.command ?? '';

  const starLabel = isStarred
    ? `Starred ${formatCount(displayedStars)}`
    : `Star ${formatCount(displayedStars)}`;

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const bandStyle: CSSProperties = {
    ...styles.band,
    ...(isPhone ? styles.bandPhone : null),
  };

  // ---- navbar ----
  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Main">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {isNavCompact ? null : (
            <HStack gap={1} hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={
                    activeSection === anchor.id ? 'location' : undefined
                  }
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
        <Button
          label={starLabel}
          variant={isStarred ? 'secondary' : 'primary'}
          size="sm"
          icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
          onClick={() => setIsStarred(previous => !previous)}
        />
        {isNavCompact ? (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        ) : null}
        {isNavCompact && isMenuOpen ? (
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
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ---- hero ----
  const hero = (
    <header style={{...columnStyle, ...bandStyle}}>
      <VStack gap={5} hAlign="center">
        <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
          <Badge variant="teal" label="Open source" />
          <Badge variant="neutral" label="v4.0.0" />
          <Badge
            variant="neutral"
            icon={<Icon icon={ScaleIcon} size="xsm" color="inherit" />}
            label="MIT"
          />
        </HStack>
        <h1
          style={{
            ...styles.heroWordmark,
            ...(isPhone ? styles.heroWordmarkPhone : null),
          }}>
          {BRAND.name}
        </h1>
        <p
          style={{
            ...styles.heroPitch,
            ...(isPhone ? styles.heroPitchPhone : null),
          }}>
          {BRAND.pitch}
        </p>
        <p style={styles.heroSubcopy}>{BRAND.subcopy}</p>
        <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
          <Button
            label="Get started"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => jumpToSection('example')}
          />
          <Button
            label={isStarred ? 'Starred on GitHub' : 'Star on GitHub'}
            variant="secondary"
            icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
            onClick={() => setIsStarred(previous => !previous)}
          />
        </HStack>
        <Card padding={3} style={styles.installCard}>
          <VStack gap={2}>
            <TabList
              value={packageManager}
              onChange={value => setPackageManager(value as PackageManager)}
              size="sm"
              aria-label="Package manager">
              {INSTALL_COMMANDS.map(entry => (
                <Tab key={entry.id} value={entry.id} label={entry.id} />
              ))}
            </TabList>
            <CodeBlock
              code={activeCommand}
              language="bash"
              size="sm"
              width="100%"
              hasCopyButton
              onCopy={onCopyInstall}
            />
            <div aria-live="polite" style={styles.copyLive}>
              {copiedCommand === null ? null : (
                <>
                  <Icon icon={CheckIcon} size="xsm" color="inherit" />
                  {`Copied "${copiedCommand}" to your clipboard`}
                </>
              )}
            </div>
          </VStack>
        </Card>
        <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
          <span style={styles.statChip}>
            <span style={{color: ACCENT, display: 'inline-flex'}} aria-hidden="true">
              <Icon icon={StarIcon} size="xsm" color="inherit" />
            </span>
            <span style={styles.statChipValue}>
              {formatCount(displayedStars)}
            </span>
            <span style={styles.statChipLabel}>stars</span>
          </span>
          <span style={styles.statChip}>
            <span style={{color: ACCENT, display: 'inline-flex'}} aria-hidden="true">
              <Icon icon={GitForkIcon} size="xsm" color="inherit" />
            </span>
            <span style={styles.statChipValue}>{formatCount(heroForks)}</span>
            <span style={styles.statChipLabel}>forks</span>
          </span>
          <span style={styles.statChip}>
            <span style={{color: ACCENT, display: 'inline-flex'}} aria-hidden="true">
              <Icon icon={ScaleIcon} size="xsm" color="inherit" />
            </span>
            <span style={styles.statChipValue}>{STATS.license}</span>
            <span style={styles.statChipLabel}>license</span>
          </span>
          <span style={styles.statChip}>
            <span style={{color: ACCENT, display: 'inline-flex'}} aria-hidden="true">
              <Icon icon={PackageIcon} size="xsm" color="inherit" />
            </span>
            <span style={styles.statChipValue}>{STATS.bundle}</span>
            <span style={styles.statChipLabel}>min+gzip</span>
          </span>
        </HStack>
      </VStack>
    </header>
  );

  // ---- footer ----
  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerPhone : null),
        }}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <div style={styles.mosaic} aria-hidden="true">
                <span style={styles.mosaicTile} />
                <span style={styles.mosaicTileGhost} />
                <span style={styles.mosaicTileGhost} />
                <span style={styles.mosaicTile} />
              </div>
              <span style={{...styles.wordmark, fontSize: 17, color: FOOTER_TEXT}}>
                {BRAND.name}
              </span>
            </HStack>
          </StackItem>
          <Badge variant="neutral" label="v4.0.0 · MIT" />
        </HStack>
        <HStack gap={3} vAlign="center" wrap="wrap">
          {FOOTER_LINKS.map(label => (
            <button
              key={label}
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              {label}
            </button>
          ))}
        </HStack>
        <hr style={styles.footerRule} />
        <VStack gap={1}>
          <span style={{fontSize: 13, color: FOOTER_TEXT_SOFT}}>
            tessera is MIT licensed — free forever, for any use, with no
            relicensing surprises.
          </span>
          <span style={{fontSize: 13, color: FOOTER_TEXT_FAINT}}>
            © 2021–2026 the tessera contributors · built in the open by 293
            people across 41 countries
          </span>
        </VStack>
      </div>
    </footer>
  );

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
          {navbar}

          {hero}

          <section
            id="example"
            ref={registerSection('example')}
            style={styles.bandTinted}>
            <div style={{...columnStyle, ...bandStyle}}>
              <ExampleSection isReduced={isReduced} isStacked={isStacked} />
            </div>
          </section>

          <section id="releases" ref={registerSection('releases')}>
            <div
              style={{
                ...columnStyle,
                ...bandStyle,
                maxWidth: 860,
              }}>
              <ReleasesSection isReduced={isReduced} />
            </div>
          </section>

          <section style={styles.bandTinted}>
            <div style={{...columnStyle, ...bandStyle}}>
              <ContributorsSection isReduced={isReduced} />
            </div>
          </section>

          <section id="sponsors" ref={registerSection('sponsors')}>
            <div style={{...columnStyle, ...bandStyle}}>
              <SponsorsSection isReduced={isReduced} />
            </div>
          </section>

          <section style={styles.bandTinted}>
            <div style={{...columnStyle, ...bandStyle, maxWidth: 920}}>
              <GrowthSection isReduced={isReduced} isStarred={isStarred} />
            </div>
          </section>

          <section id="community" ref={registerSection('community')}>
            <div style={{...columnStyle, ...bandStyle}}>
              <CommunitySection isReduced={isReduced} />
            </div>
          </section>

          {footer}
        </div>
      </LayoutContent>
    </Layout>
  );
}
