// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file marketing-social-proof.tsx
 * @input Deterministic fixtures only (eight invented customer quotes for
 *   "Lumen", a workflow automation platform, each with name, role, company,
 *   star rating, and a fixed avatar gradient; ten CSS-drawn wordmark logos
 *   with per-brand mark shapes, type treatments, and brand hues; and three
 *   stat fixtures sets with fixed numeric targets, prefixes/suffixes, and
 *   supporting captions)
 * @output Marketing showcase page stacking three social-proof section
 *   families, each with a labeled sub-variant switcher: testimonials (3-up
 *   quote-card Grid, a spotlight carousel with a gradient photo
 *   placeholder, prev/next IconButtons, dot indicators, and arrow-key
 *   support, and a CSS-columns masonry wall), logo clouds (single
 *   grayscale row, a two-row Grid, and an inline "Trusted by" strip — all
 *   with hover/focus color animation, a grayscale/full-color mode toggle,
 *   and tap-to-pin color for touch), and stats bands (4-up big-number band
 *   whose numbers count up via requestAnimationFrame when scrolled into
 *   view with a Replay control, a dark split band with supporting copy and
 *   a Toast-confirmed CTA, and an annual-report style stacked variant).
 *   A header SegmentedControl filters which families render.
 * @position Page template; emitted by `astryx template marketing-social-proof`
 *
 * Frame: Layout height="fill". LayoutHeader owns the page Heading, a
 * variant-count Badge, and the family filter SegmentedControl;
 * LayoutContent scrolls a single centered max-width column stacking the
 * three section families. No LayoutPanel — a marketing showcase is a
 * one-column reading surface, so nothing docks.
 *
 * Interaction contract:
 * - The header family filter (All / Testimonials / Logos / Stats) shows
 *   and hides whole section families without losing their variant state.
 * - Each family has its own sub-variant SegmentedControl (3 × 3 labeled
 *   variants) that actually swaps the rendered markup.
 * - The spotlight testimonial carousel advances via prev/next
 *   IconButtons, per-slide dot buttons, and ArrowLeft / ArrowRight /
 *   Home / End on the focusable carousel region; the slide counter and
 *   dots stay in sync and wrap around at both ends.
 * - Logo tiles animate grayscale → brand color on hover and keyboard
 *   focus; because hover-only affordances are banned, a "Grayscale /
 *   Full color" SegmentedControl lights every mark at once and each tile
 *   is a real button that tap-toggles (pins) its own color on touch.
 * - Stat numbers count up (eased requestAnimationFrame) the first time
 *   the band scrolls into view; a Replay button reruns the animation and
 *   prefers-reduced-motion snaps straight to the final values.
 * - The dark split band CTA and the annual-report download Button both
 *   confirm via Toast so every button demonstrably works.
 *
 * Container policy: quote tiles and stat surfaces are Cards (marketing
 * objects, not rows); logo tiles are plain buttons inside bordered band
 * divs because a wordmark is chrome, not content; the masonry wall uses
 * CSS columns with break-inside: avoid because a quote wall is a reading
 * texture, not a grid of equal cells.
 *
 * Responsive contract:
 * - Content column: max-width 1120px, centered; fills the viewport width
 *   below that with LayoutContent's own padding.
 * - Header: title block and the family filter share one wrapping row
 *   (wrap="wrap"), so the SegmentedControl drops below the heading at
 *   narrow widths instead of clipping. Every section's variant switcher
 *   wraps the same way.
 * - Quote grid: Grid columns={{minWidth: 260, max: 3}} — 3-up wide, 2-up
 *   mid, single column at 375px.
 * - Spotlight: the photo placeholder row stacks above the quote below
 *   640px; prev/next IconButtons and dot buttons all clear ~40px tap
 *   targets and the whole region is keyboard operable (tabIndex 0).
 * - Masonry wall: 3 CSS columns wide, 2 below 960px, 1 below 640px.
 * - Logo bands: tiles wrap (flex wrap) instead of overflowing; each tile
 *   is a 44px-tall button so touch users tap to light a mark — color is
 *   never hover-only. The inline strip wraps its label above the marks
 *   on phones.
 * - Stats: the 4-up band collapses 4 → 2 → 1 via Grid minWidth; the dark
 *   split band stacks copy above the 2×2 stat grid below 640px; the
 *   annual-report rows keep label and number in one wrapping row.
 * - Nothing on this page scrolls horizontally; overflow is handled by
 *   wrapping and column collapse only.
 *
 * Color policy: token-first with two deliberately scheme-locked surfaces.
 * (1) The dark split stats band is an inverted brand band in BOTH schemes:
 * its navy gradient, white headline/figures, and slate supporting copy are
 * raw literals with colorScheme locked to 'dark' on the shell so nested
 * tokens (the CTA Button included) resolve dark on it in either scheme.
 * (2) Avatar / spotlight photo placeholders are fixed brand-gradient art
 * with literal white initials, colorScheme-locked so they never invert.
 * Everything else — surfaces, borders, accents, star gold, logo grayscale,
 * and the ten brand hues — is a var(--color-*) token or an explicit
 * light-dark() pair that preserves the light appearance exactly.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  QuoteIcon,
  RotateCcwIcon,
  StarIcon,
} from 'lucide-react';

// ============= STYLES =============

const colors = {
  surface: 'var(--color-background-body)',
  surfaceMuted: 'var(--color-background-muted)',
  accent: 'var(--color-accent)',
  accentMuted: 'var(--color-accent-muted)',
  border: 'var(--color-border)',
  star: 'light-dark(#F5A623, #FDBA45)',
  logoGray: 'light-dark(#8A8A93, #9A9AA3)',
  // Scheme-locked literals for the inverted split band — see the header
  // "Color policy" note. These must stay raw so the band reads identically
  // in light and dark mode.
  darkBand: '#0F172A',
  darkBandText: '#E2E8F0',
  darkBandMuted: '#94A3B8',
  darkBandAccent: '#0171E3',
};

const styles: Record<string, CSSProperties> = {
  // Marketing surfaces read best as one centered column, not full-bleed.
  content: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Gradient avatar / photo placeholders stand in for people photography —
  // no network assets, ever. Scheme-locked (Color policy): the gradients
  // are fixed brand art, so the white initials stay literal.
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  spotlightPhoto: {
    width: 96,
    height: 96,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  quoteGlyph: {
    display: 'inline-flex',
    color: colors.accent,
  },
  starRow: {
    display: 'inline-flex',
    gap: 2,
    color: colors.star,
  },
  // Spotlight carousel region: focusable so ArrowLeft/ArrowRight work.
  carouselRegion: {
    outlineOffset: 4,
    borderRadius: 'var(--radius-container)',
  },
  // Dot indicators: 12px dots inside 40px buttons for real tap targets.
  dotButton: {
    width: 40,
    height: 40,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: colors.border,
    transition: 'background-color 160ms ease, transform 160ms ease',
  },
  dotActive: {
    backgroundColor: colors.accent,
    transform: 'scale(1.25)',
  },
  // Masonry wall: CSS columns, cards must not split across columns.
  masonry: {
    columnGap: 'var(--spacing-3)',
  },
  masonryItem: {
    breakInside: 'avoid',
    marginBottom: 'var(--spacing-3)',
  },
  // Logo tiles are buttons: grayscale at rest, brand color when lit.
  logoBand: {
    border: `1px solid ${colors.border}`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surface,
    padding: 'var(--spacing-4)',
  },
  logoBandMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  logoRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2) var(--spacing-4)',
  },
  logoButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    padding: '0 var(--spacing-2)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: colors.logoGray,
    transition: 'color 200ms ease',
  },
  wordmark: {
    fontSize: 17,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  // CSS-drawn brand marks — all shapes derive from currentColor so the
  // grayscale → color transition covers the mark and the wordmark alike.
  markDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  markRing: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '3px solid currentColor',
    boxSizing: 'border-box',
  },
  markSquare: {
    width: 10,
    height: 10,
    backgroundColor: 'currentColor',
    transform: 'rotate(45deg)',
  },
  markBars: {
    width: 4,
    height: 14,
    backgroundColor: 'currentColor',
    boxShadow: '7px 3px 0 currentColor',
    marginRight: 7,
  },
  markSlash: {
    width: 4,
    height: 16,
    backgroundColor: 'currentColor',
    transform: 'skewX(-18deg)',
  },
  markStack: {
    width: 12,
    height: 3,
    backgroundColor: 'currentColor',
    boxShadow: '0 5px 0 currentColor, 0 10px 0 currentColor',
    marginBottom: 10,
  },
  // Stats: the 4-up band tiles.
  statTile: {
    borderRadius: 'var(--radius-container)',
    backgroundColor: colors.surfaceMuted,
    padding: 'var(--spacing-4)',
  },
  // Dark split band — raw markup inside because the band inverts color.
  // Scheme-locked (Color policy): the navy gradient and its text literals
  // are identical in light and dark mode; colorScheme: 'dark' makes any
  // nested tokens (e.g. the CTA Button) resolve dark on this surface.
  darkBandShell: {
    borderRadius: 'var(--radius-container)',
    colorScheme: 'dark',
    background: `linear-gradient(135deg, ${colors.darkBand} 0%, #1E293B 100%)`,
    padding: 'var(--spacing-6)',
    color: colors.darkBandText,
  },
  darkSplitGrid: {
    display: 'grid',
    gap: 'var(--spacing-5)',
    alignItems: 'center',
  },
  darkHeading: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.25,
    fontWeight: 650,
    color: '#FFFFFF',
  },
  darkCopy: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.darkBandMuted,
  },
  darkStatValue: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.1,
    fontWeight: 650,
    color: '#FFFFFF',
    fontVariantNumeric: 'tabular-nums',
  },
  darkStatLabel: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.4,
    color: colors.darkBandMuted,
  },
  darkStatCell: {
    // Literal accent, not the token: this cell sits on the scheme-locked
    // navy band, so its rule must not re-resolve with the app scheme.
    borderLeft: `2px solid ${colors.darkBandAccent}`,
    paddingLeft: 'var(--spacing-3)',
  },
  // Annual-report rows: oversized numerals against a hairline grid.
  reportNumber: {
    fontSize: 44,
    lineHeight: 1,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============

type Family = 'all' | 'testimonials' | 'logos' | 'stats';
type TestimonialVariant = 'grid' | 'spotlight' | 'wall';
type LogoVariant = 'row' | 'grid' | 'strip';
type StatsVariant = 'band' | 'split' | 'report';

/**
 * Fixed avatar gradients — reused by initials tiles and photo blocks.
 * Scheme-locked brand art (Color policy): raw literals on purpose; the
 * tiles that paint them lock colorScheme so they render identically in
 * light and dark mode.
 */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
  'linear-gradient(135deg, #6366F1 0%, #2563EB 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #0E7490 100%)',
  'linear-gradient(135deg, #EC4899 0%, #9D174D 100%)',
  'linear-gradient(135deg, #84CC16 0%, #3F6212 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
  'linear-gradient(135deg, #0EA5E9 0%, #075985 100%)',
  'linear-gradient(135deg, #64748B 0%, #1E293B 100%)',
];

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  gradient: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'mara',
    quote:
      'We swapped four internal cron dashboards for Lumen in a week. The first Friday nobody paged the on-call about a stuck export, I knew it was staying.',
    name: 'Mara Okafor',
    role: 'VP of Operations',
    company: 'Fernwood',
    rating: 5,
    gradient: AVATAR_GRADIENTS[0],
  },
  {
    id: 'diego',
    quote:
      'The approval chains used to live in a spreadsheet only two people understood. Lumen made them visible, and suddenly finance stopped being the bottleneck.',
    name: 'Diego Ramírez',
    role: 'Head of Finance Systems',
    company: 'Quanta Metrics',
    rating: 5,
    gradient: AVATAR_GRADIENTS[1],
  },
  {
    id: 'priya',
    quote:
      'Our onboarding runbook went from a 40-step wiki page to one Lumen flow. New hires ship their first automation on day two — that used to take a month.',
    name: 'Priya Natarajan',
    role: 'Engineering Manager',
    company: 'Bluepeak',
    rating: 5,
    gradient: AVATAR_GRADIENTS[2],
  },
  {
    id: 'jonas',
    quote:
      'I was skeptical of another workflow tool. Then the audit team asked for a change log and I exported six months of history in one click. Sold.',
    name: 'Jonas Lindqvist',
    role: 'Compliance Lead',
    company: 'Helioform',
    rating: 4,
    gradient: AVATAR_GRADIENTS[3],
  },
  {
    id: 'amara',
    quote:
      'The retry policies alone paid for the license. Failed vendor syncs recover themselves overnight now instead of landing in my inbox at 6am.',
    name: 'Amara Diallo',
    role: 'Director of IT',
    company: 'Marlin Freight',
    rating: 5,
    gradient: AVATAR_GRADIENTS[4],
  },
  {
    id: 'tomasz',
    quote:
      'We run 300+ flows across three regions. Lumen’s environment promotion is the only reason that number isn’t terrifying.',
    name: 'Tomasz Wójcik',
    role: 'Platform Architect',
    company: 'Octave Systems',
    rating: 5,
    gradient: AVATAR_GRADIENTS[5],
  },
  {
    id: 'hana',
    quote:
      'Support answered a schema question in nine minutes on a Sunday. The product is great; the team behind it is why we renewed for three years.',
    name: 'Hana Sato',
    role: 'Business Systems Analyst',
    company: 'Pinegate Health',
    rating: 5,
    gradient: AVATAR_GRADIENTS[6],
  },
  {
    id: 'liam',
    quote:
      'Legal signed off in record time — SSO, region pinning, and the retention controls were already there. Procurement had nothing left to ask for.',
    name: 'Liam Gallagher',
    role: 'Chief Information Officer',
    company: 'Coppersmith & Rowe',
    rating: 4,
    gradient: AVATAR_GRADIENTS[7],
  },
];

/** Spotlight rotation order: the strongest four quotes. */
const SPOTLIGHT_IDS = ['mara', 'priya', 'tomasz', 'hana'];
const SPOTLIGHT: Testimonial[] = SPOTLIGHT_IDS.map(
  id => TESTIMONIALS.find(t => t.id === id) as Testimonial,
);

type MarkShape = 'dot' | 'ring' | 'square' | 'bars' | 'slash' | 'stack';

interface Brand {
  id: string;
  name: string;
  /**
   * Brand hue applied when the tile is lit (hover, focus, pin, or mode).
   * light-dark() pair: the light value is the original brand hue; the
   * dark value is the same hue lifted for contrast on dark surfaces.
   */
  hue: string;
  mark: MarkShape;
  /** Per-brand type treatment so every wordmark reads distinct. */
  textStyle: CSSProperties;
}

const BRANDS: Brand[] = [
  {
    id: 'fernwood',
    name: 'Fernwood',
    hue: 'light-dark(#15803D, #4ADE80)',
    mark: 'dot',
    textStyle: {fontWeight: 700, letterSpacing: '-0.02em'},
  },
  {
    id: 'quanta',
    name: 'QUANTA',
    hue: 'light-dark(#7C3AED, #A78BFA)',
    mark: 'square',
    textStyle: {fontWeight: 800, letterSpacing: '0.18em', fontSize: 14},
  },
  {
    id: 'bluepeak',
    name: 'bluepeak',
    hue: 'light-dark(#0369A1, #38BDF8)',
    mark: 'bars',
    textStyle: {fontWeight: 600, letterSpacing: '-0.03em'},
  },
  {
    id: 'helioform',
    name: 'Helioform',
    hue: 'light-dark(#EA580C, #FB923C)',
    mark: 'ring',
    textStyle: {fontFamily: 'Georgia, serif', fontWeight: 500},
  },
  {
    id: 'marlin',
    name: 'MARLIN',
    hue: 'light-dark(#0F766E, #2DD4BF)',
    mark: 'slash',
    textStyle: {fontWeight: 700, letterSpacing: '0.12em', fontSize: 15},
  },
  {
    id: 'octave',
    name: 'octave',
    hue: 'light-dark(#BE185D, #F472B6)',
    mark: 'stack',
    textStyle: {fontWeight: 500, letterSpacing: '0.04em', fontStyle: 'italic'},
  },
  {
    id: 'pinegate',
    name: 'Pinegate',
    hue: 'light-dark(#4D7C0F, #A3E635)',
    mark: 'ring',
    textStyle: {fontFamily: 'Georgia, serif', fontWeight: 600},
  },
  {
    id: 'coppersmith',
    name: 'Coppersmith & Rowe',
    hue: 'light-dark(#B45309, #FBBF24)',
    mark: 'square',
    textStyle: {fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 500},
  },
  {
    id: 'vantablue',
    name: 'vantablue',
    hue: 'light-dark(#1D4ED8, #60A5FA)',
    mark: 'dot',
    textStyle: {fontWeight: 800, letterSpacing: '-0.04em'},
  },
  {
    id: 'zephyr',
    name: 'Zephyr Labs',
    hue: 'light-dark(#0891B2, #22D3EE)',
    mark: 'bars',
    textStyle: {fontWeight: 600, letterSpacing: '0.02em'},
  },
];

/** The inline strip shows a shorter, hand-picked run of marks. */
const STRIP_BRAND_IDS = ['fernwood', 'bluepeak', 'marlin', 'vantablue', 'zephyr'];

interface StatFixture {
  id: string;
  label: string;
  /** Final numeric value the count-up eases toward. */
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  detail?: string;
}

const BAND_STATS: StatFixture[] = [
  {
    id: 'automations',
    label: 'Automations run monthly',
    value: 48,
    decimals: 0,
    suffix: 'M',
    detail: 'Across 3 regions',
  },
  {
    id: 'teams',
    label: 'Teams on Lumen',
    value: 12400,
    decimals: 0,
    suffix: '+',
    detail: 'From 5-person startups to Fortune 500s',
  },
  {
    id: 'uptime',
    label: 'Trailing 12-month uptime',
    value: 99.98,
    decimals: 2,
    suffix: '%',
    detail: 'Publicly posted status history',
  },
  {
    id: 'hours',
    label: 'Manual hours saved / year',
    value: 2.1,
    decimals: 1,
    suffix: 'M',
    detail: 'Self-reported by customers',
  },
];

const SPLIT_STATS: StatFixture[] = [
  {id: 'nps', label: 'Net promoter score', value: 72, decimals: 0},
  {
    id: 'retention',
    label: 'Net revenue retention',
    value: 134,
    decimals: 0,
    suffix: '%',
  },
  {
    id: 'deploy',
    label: 'Median rollout time',
    value: 11,
    decimals: 0,
    suffix: ' days',
  },
  {
    id: 'sev',
    label: 'Sev-1 incidents in FY25',
    value: 0,
    decimals: 0,
  },
];

const REPORT_STATS: StatFixture[] = [
  {
    id: 'arr',
    label: 'Annual recurring revenue',
    value: 214,
    decimals: 0,
    prefix: '$',
    suffix: 'M',
    detail: 'Up 61% year over year, our fourth consecutive year above 50%.',
  },
  {
    id: 'countries',
    label: 'Countries with active teams',
    value: 87,
    decimals: 0,
    detail: 'New data residency options opened LATAM and APAC this year.',
  },
  {
    id: 'partners',
    label: 'Certified integration partners',
    value: 340,
    decimals: 0,
    suffix: '+',
    detail: 'The partner directory doubled after the FY25 SDK release.',
  },
  {
    id: 'csat',
    label: 'Support satisfaction',
    value: 97.4,
    decimals: 1,
    suffix: '%',
    detail: 'Median first response of 14 minutes on paid plans.',
  },
];

// ============= HELPERS =============

/** en-US formatting is pinned so fixture rendering stays deterministic. */
function formatStat(stat: StatFixture, current: number): string {
  const body = current.toLocaleString('en-US', {
    minimumFractionDigits: stat.decimals,
    maximumFractionDigits: stat.decimals,
  });
  return `${stat.prefix ?? ''}${body}${stat.suffix ?? ''}`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(part => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function markStyle(mark: MarkShape): CSSProperties {
  switch (mark) {
    case 'dot':
      return styles.markDot;
    case 'ring':
      return styles.markRing;
    case 'square':
      return styles.markSquare;
    case 'bars':
      return styles.markBars;
    case 'slash':
      return styles.markSlash;
    case 'stack':
      return styles.markStack;
  }
}

/**
 * True once the node has intersected the viewport (30% visible). Falls
 * back to "visible" when IntersectionObserver is unavailable so the stats
 * never render as a wall of zeros in static environments.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
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
 * Eases 0 → target over `durationMs` with requestAnimationFrame once
 * `isActive` flips true; bumping `runToken` replays the animation.
 * prefers-reduced-motion (and rAF-less environments) snap to the target.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  runToken: number,
  durationMs = 1400,
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof requestAnimationFrame === 'undefined') {
      setValue(target);
      return;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      // ease-out cubic: fast start, gentle landing on the final figure.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, runToken, durationMs]);

  // Land exactly on the fixture value — never a float artifact.
  return isActive && value > target ? target : value;
}

// ============= PIECES =============

/** Fixed star rating, announced as "N out of 5 stars". */
function Stars({rating}: {rating: number}) {
  return (
    <span
      role="img"
      aria-label={`${rating} out of 5 stars`}
      style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(step => (
        <StarIcon
          key={step}
          size={14}
          aria-hidden="true"
          fill={step <= rating ? 'currentColor' : 'none'}
          strokeWidth={step <= rating ? 0 : 1.5}
        />
      ))}
    </span>
  );
}

function AvatarDisc({person}: {person: Testimonial}) {
  return (
    <div
      aria-hidden="true"
      style={{...styles.avatar, background: person.gradient}}>
      {initials(person.name)}
    </div>
  );
}

function AttributionRow({person}: {person: Testimonial}) {
  return (
    <HStack gap={3} vAlign="center">
      <AvatarDisc person={person} />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="label">{person.name}</Text>
          <Text type="supporting" color="secondary">
            {person.role} · {person.company}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function QuoteCard({person}: {person: Testimonial}) {
  return (
    <Card padding={4} height="100%">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" hAlign="between">
          <span style={styles.quoteGlyph} aria-hidden="true">
            <QuoteIcon size={18} fill="currentColor" strokeWidth={0} />
          </span>
          <Stars rating={person.rating} />
        </HStack>
        <StackItem size="fill">
          <Text type="body">{person.quote}</Text>
        </StackItem>
        <Divider />
        <AttributionRow person={person} />
      </VStack>
    </Card>
  );
}

/** Section chrome: heading + supporting line + the variant switcher. */
function SectionHeader({
  title,
  supporting,
  switcher,
}: {
  title: string;
  supporting: string;
  switcher: React.ReactNode;
}) {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <StackItem size="fill">
        <VStack gap={1}>
          <Heading level={2}>{title}</Heading>
          <Text type="supporting" color="secondary">
            {supporting}
          </Text>
        </VStack>
      </StackItem>
      {switcher}
    </HStack>
  );
}

/** One CSS-drawn wordmark tile. Tap pins color; hover/focus previews it. */
function LogoTile({
  brand,
  forceColor,
  isPinned,
  onTogglePin,
  compact,
}: {
  brand: Brand;
  forceColor: boolean;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  compact?: boolean;
}) {
  const [isHot, setIsHot] = useState(false);
  const lit = forceColor || isPinned || isHot;
  return (
    <button
      type="button"
      aria-pressed={isPinned}
      aria-label={`${brand.name} — ${lit ? 'showing' : 'tap to show'} brand color`}
      onClick={() => onTogglePin(brand.id)}
      onMouseEnter={() => setIsHot(true)}
      onMouseLeave={() => setIsHot(false)}
      onFocus={() => setIsHot(true)}
      onBlur={() => setIsHot(false)}
      style={{
        ...styles.logoButton,
        color: lit ? brand.hue : colors.logoGray,
      }}>
      <span aria-hidden="true" style={markStyle(brand.mark)} />
      <span
        style={{
          ...styles.wordmark,
          ...brand.textStyle,
          ...(compact ? {fontSize: 14} : undefined),
        }}>
        {brand.name}
      </span>
    </button>
  );
}

/** One tile in the 4-up count-up band. */
function CountUpStatTile({
  stat,
  isActive,
  runToken,
}: {
  stat: StatFixture;
  isActive: boolean;
  runToken: number;
}) {
  const current = useCountUp(stat.value, isActive, runToken);
  return (
    <div style={styles.statTile}>
      <VStack gap={1}>
        <Text type="display-2" hasTabularNumbers>
          {formatStat(stat, current)}
        </Text>
        <Text type="label">{stat.label}</Text>
        {stat.detail ? (
          <Text type="supporting" color="secondary">
            {stat.detail}
          </Text>
        ) : null}
      </VStack>
    </div>
  );
}

/** One inverted stat cell inside the dark split band. */
function DarkStatCell({
  stat,
  isActive,
  runToken,
}: {
  stat: StatFixture;
  isActive: boolean;
  runToken: number;
}) {
  const current = useCountUp(stat.value, isActive, runToken);
  return (
    <div style={styles.darkStatCell}>
      <p style={styles.darkStatValue}>{formatStat(stat, current)}</p>
      <p style={styles.darkStatLabel}>{stat.label}</p>
    </div>
  );
}

/** One oversized annual-report row. */
function ReportStatRow({
  stat,
  isActive,
  runToken,
  stacked,
}: {
  stat: StatFixture;
  isActive: boolean;
  runToken: number;
  stacked: boolean;
}) {
  const current = useCountUp(stat.value, isActive, runToken);
  return (
    <HStack gap={4} vAlign="center" wrap="wrap">
      <div
        style={{
          ...styles.reportNumber,
          ...(stacked ? {fontSize: 34} : undefined),
          minWidth: stacked ? 132 : 220,
        }}>
        {formatStat(stat, current)}
      </div>
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="label">{stat.label}</Text>
          {stat.detail ? (
            <Text type="supporting" color="secondary">
              {stat.detail}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
    </HStack>
  );
}

// ============= PAGE =============

export default function MarketingSocialProofTemplate() {
  const toast = useToast();

  // Family filter (header) + one sub-variant per family. Hiding a family
  // never resets its variant — state lives here, not in the sections.
  const [family, setFamily] = useState<Family>('all');
  const [testimonialVariant, setTestimonialVariant] =
    useState<TestimonialVariant>('grid');
  const [logoVariant, setLogoVariant] = useState<LogoVariant>('row');
  const [statsVariant, setStatsVariant] = useState<StatsVariant>('band');

  // Spotlight carousel index into SPOTLIGHT (wraps at both ends).
  const [slide, setSlide] = useState(0);

  // Logo lighting: global mode + per-tile pins for touch users.
  const [logoMode, setLogoMode] = useState<'grayscale' | 'color'>('grayscale');
  const [pinnedLogos, setPinnedLogos] = useState<Set<string>>(() => new Set());

  // Count-up replay token — bumping it reruns every visible animation.
  const [statRun, setStatRun] = useState(0);
  const [bandRef, bandInView] = useInView();
  const [splitRef, splitInView] = useInView();
  const [reportRef, reportInView] = useInView();

  // <=640px: single-pane everything; <=960px: masonry drops to 2 columns.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isMid = useMediaQuery('(max-width: 960px)');
  const masonryColumns = isCompact ? 1 : isMid ? 2 : 3;

  const showTestimonials = family === 'all' || family === 'testimonials';
  const showLogos = family === 'all' || family === 'logos';
  const showStats = family === 'all' || family === 'stats';

  const goToSlide = (next: number) => {
    const count = SPOTLIGHT.length;
    setSlide(((next % count) + count) % count);
  };

  const handleCarouselKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(slide - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(slide + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToSlide(SPOTLIGHT.length - 1);
    }
  };

  const togglePinnedLogo = (id: string) => {
    setPinnedLogos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const spotlightPerson = SPOTLIGHT[slide];
  const forceLogoColor = logoMode === 'color';
  const stripBrands = BRANDS.filter(brand =>
    STRIP_BRAND_IDS.includes(brand.id),
  );

  // ---- Testimonials variants ----

  const testimonialGrid = (
    <Grid columns={{minWidth: 260, max: 3}} gap={3}>
      {TESTIMONIALS.slice(0, 6).map(person => (
        <QuoteCard key={person.id} person={person} />
      ))}
    </Grid>
  );

  const testimonialSpotlight = (
    <Card padding={isCompact ? 4 : 6}>
      {/* Focusable region: ArrowLeft/ArrowRight/Home/End drive the deck. */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`Customer spotlight, quote ${slide + 1} of ${SPOTLIGHT.length}`}
        tabIndex={0}
        onKeyDown={handleCarouselKeys}
        style={styles.carouselRegion}>
        <VStack gap={4}>
          <HStack gap={4} vAlign="center" wrap="wrap">
            {/* Gradient photo placeholder — no real imagery. */}
            <div
              aria-hidden="true"
              style={{
                ...styles.spotlightPhoto,
                background: spotlightPerson.gradient,
              }}>
              {initials(spotlightPerson.name)}
            </div>
            <StackItem size="fill">
              <VStack gap={2}>
                <Stars rating={spotlightPerson.rating} />
                <Text type={isCompact ? 'large' : 'display-2'}>
                  &ldquo;{spotlightPerson.quote}&rdquo;
                </Text>
                <Text type="supporting" color="secondary">
                  {spotlightPerson.name} — {spotlightPerson.role},{' '}
                  {spotlightPerson.company}
                </Text>
              </VStack>
            </StackItem>
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <IconButton
              label="Previous quote"
              icon={<Icon icon={ChevronLeftIcon} size="sm" />}
              variant="secondary"
              onClick={() => goToSlide(slide - 1)}
            />
            <IconButton
              label="Next quote"
              icon={<Icon icon={ChevronRightIcon} size="sm" />}
              variant="secondary"
              onClick={() => goToSlide(slide + 1)}
            />
            <HStack gap={0} vAlign="center">
              {SPOTLIGHT.map((person, index) => (
                <button
                  key={person.id}
                  type="button"
                  aria-label={`Go to quote ${index + 1}: ${person.name}`}
                  aria-current={index === slide}
                  onClick={() => goToSlide(index)}
                  style={styles.dotButton}>
                  <span
                    aria-hidden="true"
                    style={{
                      ...styles.dot,
                      ...(index === slide ? styles.dotActive : undefined),
                    }}
                  />
                </button>
              ))}
            </HStack>
            <StackItem size="fill">
              <HStack hAlign="end">
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {slide + 1} / {SPOTLIGHT.length}
                </Text>
              </HStack>
            </StackItem>
          </HStack>
        </VStack>
      </div>
    </Card>
  );

  const testimonialWall = (
    <div style={{...styles.masonry, columnCount: masonryColumns}}>
      {TESTIMONIALS.map(person => (
        <div key={person.id} style={styles.masonryItem}>
          <Card padding={4}>
            <VStack gap={3}>
              <Text type="body">&ldquo;{person.quote}&rdquo;</Text>
              <AttributionRow person={person} />
            </VStack>
          </Card>
        </div>
      ))}
    </div>
  );

  // ---- Logo cloud variants ----

  const logoTiles = (subset: Brand[], compactTiles?: boolean) =>
    subset.map(brand => (
      <LogoTile
        key={brand.id}
        brand={brand}
        forceColor={forceLogoColor}
        isPinned={pinnedLogos.has(brand.id)}
        onTogglePin={togglePinnedLogo}
        compact={compactTiles}
      />
    ));

  const logoRow = (
    <div style={styles.logoBand}>
      <div style={styles.logoRow}>{logoTiles(BRANDS)}</div>
    </div>
  );

  const logoGrid = (
    <div style={styles.logoBand}>
      <VStack gap={2}>
        <div style={styles.logoRow}>{logoTiles(BRANDS.slice(0, 5))}</div>
        <Divider />
        <div style={styles.logoRow}>{logoTiles(BRANDS.slice(5))}</div>
      </VStack>
    </div>
  );

  const logoStrip = (
    <div style={{...styles.logoBand, ...styles.logoBandMuted}}>
      <HStack gap={3} vAlign="center" wrap="wrap" hAlign="center">
        <Text type="supporting" color="secondary">
          Trusted by teams at
        </Text>
        <div style={styles.logoRow}>{logoTiles(stripBrands, true)}</div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          + 12,000 more
        </Text>
      </HStack>
    </div>
  );

  // ---- Stats variants ----

  const statsBand = (
    <div ref={bandRef}>
      <VStack gap={3}>
        <Grid columns={{minWidth: 220, max: 4}} gap={3}>
          {BAND_STATS.map(stat => (
            <CountUpStatTile
              key={stat.id}
              stat={stat}
              isActive={bandInView}
              runToken={statRun}
            />
          ))}
        </Grid>
        <Text type="supporting" color="secondary">
          Figures audited quarterly; usage counts are trailing 30-day
          averages across all production regions.
        </Text>
      </VStack>
    </div>
  );

  const statsSplit = (
    <div ref={splitRef} style={styles.darkBandShell}>
      <div
        style={{
          ...styles.darkSplitGrid,
          gridTemplateColumns: isCompact ? '1fr' : '1.1fr 1fr',
        }}>
        <div>
          <p style={styles.darkHeading}>
            The operations backbone for 12,400+ teams
          </p>
          <p style={styles.darkCopy}>
            Lumen customers retire an average of five internal tools in
            their first year and keep expanding — net revenue retention has
            held above 130% for eight straight quarters. These are the
            numbers our board sees, published unedited.
          </p>
          <div style={{marginTop: 'var(--spacing-4)', display: 'inline-grid'}}>
            <Button
              label="Read customer stories"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" />}
              onClick={() =>
                toast({
                  body: 'Opening the customer stories library',
                  uniqueID: 'social-proof-stories',
                })
              }
            />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr',
            gap: 'var(--spacing-4)',
          }}>
          {SPLIT_STATS.map(stat => (
            <DarkStatCell
              key={stat.id}
              stat={stat}
              isActive={splitInView}
              runToken={statRun}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const statsReport = (
    <div ref={reportRef}>
      <Card padding={isCompact ? 4 : 6}>
        <VStack gap={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <Text type="label">FY25 by the numbers</Text>
                <Text type="supporting" color="secondary">
                  Extracted from the annual customer impact report.
                </Text>
              </VStack>
            </StackItem>
            <Button
              label="Download report"
              variant="secondary"
              size="sm"
              icon={<Icon icon={DownloadIcon} size="sm" />}
              onClick={() =>
                toast({
                  body: 'FY25 impact report queued for download (PDF, 4.2 MB)',
                  uniqueID: 'social-proof-report',
                })
              }
            />
          </HStack>
          <VStack gap={0}>
            {REPORT_STATS.map((stat, index) => (
              <VStack key={stat.id} gap={0}>
                {index > 0 ? <Divider /> : null}
                <div style={{padding: 'var(--spacing-4) 0'}}>
                  <ReportStatRow
                    stat={stat}
                    isActive={reportInView}
                    runToken={statRun}
                    stacked={isCompact}
                  />
                </div>
              </VStack>
            ))}
          </VStack>
        </VStack>
      </Card>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>Social proof sections</Heading>
                  <Badge variant="info" label="9 variants" />
                </HStack>
                <Text type="supporting" color="secondary">
                  Testimonials, logo clouds, and stat bands for Lumen —
                  every sub-variant is live, switchable, and keyboardable.
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Section family"
              value={family}
              onChange={value => setFamily(value as Family)}
              size="sm">
              <SegmentedControlItem label="All" value="all" />
              <SegmentedControlItem label="Testimonials" value="testimonials" />
              <SegmentedControlItem label="Logos" value="logos" />
              <SegmentedControlItem label="Stats" value="stats" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.content}>
            <VStack gap={6}>
              {/* ---- Family 1: testimonials ---- */}
              {showTestimonials ? (
                <VStack gap={4}>
                  <SectionHeader
                    title="Testimonials"
                    supporting={
                      testimonialVariant === 'grid'
                        ? 'Variant A — 3-up quote-card grid with ratings and attribution.'
                        : testimonialVariant === 'spotlight'
                          ? 'Variant B — single spotlight quote with photo placeholder, arrows, dots, and arrow-key support.'
                          : 'Variant C — masonry wall; quotes keep natural height across CSS columns.'
                    }
                    switcher={
                      <SegmentedControl
                        label="Testimonial variant"
                        value={testimonialVariant}
                        onChange={value =>
                          setTestimonialVariant(value as TestimonialVariant)
                        }
                        size="sm">
                        <SegmentedControlItem label="Quote grid" value="grid" />
                        <SegmentedControlItem
                          label="Spotlight"
                          value="spotlight"
                        />
                        <SegmentedControlItem label="Wall" value="wall" />
                      </SegmentedControl>
                    }
                  />
                  {testimonialVariant === 'grid'
                    ? testimonialGrid
                    : testimonialVariant === 'spotlight'
                      ? testimonialSpotlight
                      : testimonialWall}
                </VStack>
              ) : null}

              {/* ---- Family 2: logo clouds ---- */}
              {showLogos ? (
                <VStack gap={4}>
                  <SectionHeader
                    title="Logo clouds"
                    supporting={
                      logoVariant === 'row'
                        ? 'Variant A — single grayscale row; hover, focus, or tap a mark to light its brand color.'
                        : logoVariant === 'grid'
                          ? 'Variant B — two-row grid split by a hairline divider.'
                          : 'Variant C — inline “Trusted by” strip on a muted band.'
                    }
                    switcher={
                      <HStack gap={2} vAlign="center" wrap="wrap">
                        <SegmentedControl
                          label="Logo variant"
                          value={logoVariant}
                          onChange={value =>
                            setLogoVariant(value as LogoVariant)
                          }
                          size="sm">
                          <SegmentedControlItem label="Row" value="row" />
                          <SegmentedControlItem label="Two rows" value="grid" />
                          <SegmentedControlItem label="Strip" value="strip" />
                        </SegmentedControl>
                        <SegmentedControl
                          label="Logo color mode"
                          value={logoMode}
                          onChange={value =>
                            setLogoMode(value as 'grayscale' | 'color')
                          }
                          size="sm">
                          <SegmentedControlItem
                            label="Grayscale"
                            value="grayscale"
                          />
                          <SegmentedControlItem
                            label="Full color"
                            value="color"
                          />
                        </SegmentedControl>
                      </HStack>
                    }
                  />
                  {logoVariant === 'row'
                    ? logoRow
                    : logoVariant === 'grid'
                      ? logoGrid
                      : logoStrip}
                  {pinnedLogos.size > 0 && !forceLogoColor ? (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {pinnedLogos.size}{' '}
                      {pinnedLogos.size === 1 ? 'mark' : 'marks'} pinned in
                      color — tap again to dim.
                    </Text>
                  ) : null}
                </VStack>
              ) : null}

              {/* ---- Family 3: stats bands ---- */}
              {showStats ? (
                <VStack gap={4}>
                  <SectionHeader
                    title="Stats bands"
                    supporting={
                      statsVariant === 'band'
                        ? 'Variant A — 4-up big-number band; figures count up when scrolled into view.'
                        : statsVariant === 'split'
                          ? 'Variant B — dark split band pairing supporting copy with a 2×2 stat grid.'
                          : 'Variant C — annual-report stack with oversized numerals and captions.'
                    }
                    switcher={
                      <HStack gap={2} vAlign="center" wrap="wrap">
                        <SegmentedControl
                          label="Stats variant"
                          value={statsVariant}
                          onChange={value =>
                            setStatsVariant(value as StatsVariant)
                          }
                          size="sm">
                          <SegmentedControlItem label="Band" value="band" />
                          <SegmentedControlItem label="Split" value="split" />
                          <SegmentedControlItem label="Report" value="report" />
                        </SegmentedControl>
                        <Button
                          label="Replay count-up"
                          variant="secondary"
                          size="sm"
                          icon={<Icon icon={RotateCcwIcon} size="sm" />}
                          onClick={() => setStatRun(run => run + 1)}
                        />
                      </HStack>
                    }
                  />
                  {statsVariant === 'band'
                    ? statsBand
                    : statsVariant === 'split'
                      ? statsSplit
                      : statsReport}
                </VStack>
              ) : null}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
