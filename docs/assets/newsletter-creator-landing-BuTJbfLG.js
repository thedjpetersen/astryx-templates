var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file newsletter-creator-landing.tsx
 * @input Deterministic fixtures only (the fictional "Overshoot" weekly
 *   design-engineering newsletter: hero copy with an issue-count eyebrow,
 *   reader/open-rate proof numbers, five reader monograms, two complete
 *   sample-issue bodies — #142 and #141, each with an intro, two prose
 *   sections, a CSS code tip, and a five-item links list — six archive
 *   issue cards with topics and read times, six reader testimonials, a
 *   sponsor slot card with per-month availability, and an author bio)
 * @output Complete long-scroll landing page for a creator newsletter: a
 *   sticky navbar with smooth-scrolling scroll-spy anchor links that
 *   collapse behind a menu button at compact widths, a split hero pairing
 *   a validating subscribe capture (success flips to a "Check your inbox"
 *   card with a working resend link) with a signature spring-curve
 *   masthead card that draws itself with a visible overshoot and replays
 *   on demand, count-up reader/open-rate proof under an avatar cluster, a
 *   framed scrollable sample-issue reader with an issue #142/#141 swap
 *   toggle, a topic-filterable archive grid, a masonry-style testimonial
 *   wall, a sponsor slot card with availability chips and an inline
 *   request-confirmation state, an about-the-author row with a
 *   reveal-on-click email, and a minimal footer.
 * @position Page template; emitted by \`astryx template newsletter-creator-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy and is measured by a
 * ResizeObserver for the responsive breakpoints; the navbar is
 * position:sticky top:0 inside it. Full-bleed bands (accent-tinted sample
 * reader, muted testimonial wall, muted footer) alternate with plain
 * bands; each band centers a 1100px column.
 *
 * Interaction contract:
 * - Nav anchors (Sample issue / Archive / Readers / Sponsor) smooth-scroll
 *   the container to real section nodes with a sticky-nav allowance;
 *   onScroll spies the last anchor above the fold line (aria-current).
 *   At compact widths the links collapse behind a menu button whose
 *   dropdown closes on Escape, outside pointerdown, or selection.
 * - The hero subscribe form validates on submit (empty + format errors
 *   inline, role="alert"); success swaps to a "Check your inbox" card
 *   echoing the address, with a working "Resend" link (flips a sent-again
 *   caption) and a "Use a different address" reset. The nav CTA scrolls
 *   back to the hero form.
 * - Signature hero moment: the masthead card's spring curve draws itself
 *   on load (stroke-dash transition), the "+9% overshoot" peak label and
 *   settle dot fade in after the draw, and a Replay button re-runs it.
 * - Reader/open-rate numbers count up once when the proof row first
 *   enters the viewport (IntersectionObserver, ease-out rAF).
 * - The sample-issue reader is a framed, internally scrollable excerpt;
 *   its header button swaps the whole body between issue #142 and #141
 *   and back. The code tips are CodeBlocks with copy buttons.
 * - Archive topic chips (ToggleButtons with counts) live-filter the six
 *   issue cards; "All" restores the full grid.
 * - The sponsor card's "Request the sponsor kit" button flips to an
 *   inline confirmation state (no dead CTAs); availability chips are
 *   Badges. The author row's "Say hello" button reveals a mono email.
 * - Section blocks rise+fade 12px exactly once when first revealed
 *   (IntersectionObserver). All motion — reveals, count-ups, the spring
 *   draw, smooth scrolling — is gated by prefers-reduced-motion via
 *   matchMedia: reveals render visible, counters render final, the curve
 *   renders complete, and scrolling snaps.
 * - Deterministic fixtures only: no Date.now, no Math.random, no network
 *   assets, no real logos; only animation cadence is runtime.
 *
 * Color policy: token-pure except ONE quarantined accent literal (the
 * Overshoot signal-orange light-dark pair, contrast math at the constant).
 * Every accent tint — chips, bands, gradient art tiles, the avatar
 * cluster, the author portrait — derives from that single literal via
 * color-mix against tokens, so both app themes hold.
 *
 * Responsive contract (useElementWidth ResizeObserver — the inline demo
 * stage is ~1045px wide, so viewport media queries are never used):
 * - >980px: split hero (copy left, spring masthead right), 3-column
 *   archive grid, 3-column testimonial wall, inline nav links.
 * - 761–980px: archive and testimonials drop to 2 columns; hero gap
 *   tightens but stays split.
 * - <=760px: nav links collapse behind the menu button, the hero stacks
 *   (copy above the masthead card), and the sponsor and author rows
 *   stack their halves.
 * - <=560px: archive and testimonials drop to 1 column, the subscribe
 *   form stacks its button under the input, the headline and reader
 *   frame paddings step down, and all proof/chip rows wrap — the page
 *   holds at 390px in the phone artboard with no overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  MailCheckIcon,
  MailIcon,
  MenuIcon,
  QuoteIcon,
  RotateCcwIcon,
  RssIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= ACCENT (the one quarantined literal) =============
// Overshoot "signal orange" — the spring-motion brand personality.
// Contrast math: light #C2410C on #FFFFFF body = 5.35:1 (AA for text and
// UI); dark #FDBA74 on a ~#1C1C1E dark body = 9.6:1. Every other accent
// surface below derives from this ONE literal via color-mix against
// tokens, so the rest of the page stays token-pure.
const ACCENT = 'light-dark(#C2410C, #FDBA74)';

/** Accent tint helper — mixes the single accent literal into a base. */
function accentMix(percent: number, base = 'transparent'): string {
  return \`color-mix(in srgb, \${ACCENT} \${percent}%, \${base})\`;
}

const ACCENT_SOFT = accentMix(12);
const ACCENT_WASH = accentMix(6);
const ACCENT_BORDER = accentMix(32);

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 72;
const SPY_OFFSET = 140;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy and is measured for breakpoints.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered content column; bands paint full-bleed around it.
  column: {
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    padding: 'var(--spacing-8) var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  columnCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  bandTinted: {
    backgroundColor: ACCENT_WASH,
    borderTop: \`1px solid \${ACCENT_BORDER}\`,
    borderBottom: \`1px solid \${ACCENT_BORDER}\`,
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
  },
  // 10-11px uppercase tracked section eyebrow, accent-tinted.
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: ACCENT,
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
    maxWidth: 1100,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
  },
  brandTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  brandWordmark: {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
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
    backgroundColor: ACCENT_SOFT,
  },
  // 40px icon-only control (Astryx Button caps at 36px).
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
  menuPanel: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: 'var(--shadow-high, 0 12px 32px rgba(0, 0, 0, 0.24))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
  },
  menuLink: {
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
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroRowMid: {
    gap: 'var(--spacing-5)',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  heroText: {
    flex: '1.15 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroAside: {
    flex: '1 1 0',
    minWidth: 0,
  },
  headline: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  headlineCompact: {
    fontSize: 31,
  },
  subcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 520,
    margin: 0,
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
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
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  successCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    maxWidth: 460,
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container, 12px)',
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_SOFT,
    boxSizing: 'border-box',
  },
  successDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-background-body)',
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  // Reader-proof row: overlapping monogram cluster + count-up figures.
  avatarStack: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarDisc: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-background-body)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  proofFigure: {
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- spring masthead card (signature hero moment) ----
  springCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    overflow: 'hidden',
  },
  springHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_WASH,
  },
  springBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  springFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: '0 var(--spacing-4) var(--spacing-3)',
  },
  // ---- sample-issue reader ----
  readerFrame: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    overflow: 'hidden',
  },
  readerMasthead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  readerBody: {
    maxHeight: 460,
    overflowY: 'auto',
    padding: 'var(--spacing-5) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  readerBodyCompact: {
    padding: 'var(--spacing-4)',
    maxHeight: 420,
  },
  proseHeading: {
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  proseParagraph: {
    fontSize: 15,
    lineHeight: 1.65,
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  issueChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    whiteSpace: 'nowrap',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) 0',
  },
  linkGlyph: {
    width: 26,
    height: 26,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  // ---- archive grid ----
  issueNumber: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    color: ACCENT,
  },
  // ---- testimonial wall ----
  quoteMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    flexShrink: 0,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 1.55,
    margin: 0,
  },
  // ---- sponsor + author ----
  splitRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  splitRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  splitHalf: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  rateFigure: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
  },
  monoLine: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  authorTile: {
    width: 88,
    height: 88,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    // Hue-gradient art tile: derived entirely from the one accent literal.
    background: \`linear-gradient(135deg, \${accentMix(
      55,
      'var(--color-background-muted)',
    )} 0%, \${accentMix(16, 'var(--color-background-muted)')} 100%)\`,
    border: \`1px solid \${ACCENT_BORDER}\`,
    boxSizing: 'border-box',
  },
  // ---- footer ----
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
// Deterministic fixtures for the fictional Overshoot newsletter.
// No Date.now, no randomness, no network assets, no real publications.

const BRAND = {
  name: 'Overshoot',
  tagline: 'A weekly letter on design engineering',
};

const HERO = {
  eyebrow: 'Issue #142 · every Tuesday',
  headline: 'The weekly letter for engineers who sweat the last 2%',
  subcopy:
    'Every Tuesday, Overshoot dissects one production interface — the ' +
    'spring curves, the CSS tricks, the performance budgets — in a ' +
    'six-minute read you will actually finish.',
  finePrint: 'Free forever · one email a week · unsubscribe in one click',
  readers: 18204,
  openRate: 54,
};

/** Monogram cluster next to the proof figures (readers, not authors). */
const READER_MONOGRAMS: readonly {initials: string; tint: number}[] = [
  {initials: 'PR', tint: 64},
  {initials: 'MB', tint: 48},
  {initials: 'SA', tint: 34},
  {initials: 'DO', tint: 22},
  {initials: 'GL', tint: 12},
];

type SectionId = 'sample' | 'archive' | 'readers' | 'sponsor';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'sample', label: 'Sample issue'},
  {id: 'archive', label: 'Archive'},
  {id: 'readers', label: 'Readers'},
  {id: 'sponsor', label: 'Sponsor'},
];

interface IssueLink {
  title: string;
  source: string;
  note: string;
}

interface IssueBody {
  number: number;
  subject: string;
  date: string;
  intro: string;
  sectionOneTitle: string;
  sectionOneCopy: string;
  tipTitle: string;
  tipCopy: string;
  tipCode: string;
  tipLanguage: string;
  linksTitle: string;
  links: readonly IssueLink[];
}

const ISSUE_142: IssueBody = {
  number: 142,
  subject: 'The physics of a good toggle',
  date: 'Jul 7, 2026',
  intro:
    'A toggle is the smallest promise your product makes: touch me and ' +
    'something true changes. This week — why the switches that feel great ' +
    'are solving a physics problem, not a styling problem, and how to ' +
    'borrow the trick in about nine lines of CSS.',
  sectionOneTitle: 'Springs, not durations',
  sectionOneCopy:
    'Duration-based easing answers the wrong question. When a thumb ' +
    'flicks a switch, the finger arrives with velocity, and clamping that ' +
    'velocity to a fixed 200ms cubic-bezier is why so many toggles feel ' +
    'like they ignore you. A spring carries the momentum through: ' +
    'stiffness sets urgency, damping sets composure. Platform controls ' +
    'get away with feeling instant because almost nothing is on a timer ' +
    '— it is all mass and tension. You do not need a physics engine to ' +
    'fake it convincingly.',
  tipTitle: 'The code tip',
  tipCopy:
    'You can bake a spring into plain CSS with linear(). This curve ' +
    'overshoots by about 9% and settles in roughly 300ms — enough ' +
    'personality to feel alive, calm enough for a settings page:',
  tipCode: [
    '/* A spring that settles in ~300ms — no JS, no library. */',
    '.toggle-thumb {',
    '  transition: translate 300ms linear(',
    '    0, 0.37, 0.84, 1.09, 1.15, 1.10, 1.03, 0.99, 1',
    '  );',
    '}',
  ].join('\\n'),
  tipLanguage: 'css',
  linksTitle: 'Five worth your click',
  links: [
    {
      title: 'The browser rendering loop, illustrated',
      source: 'pixelpipeline.dev',
      note: 'The diagram I send every new hire on day one.',
    },
    {
      title: 'A linear() easing generator',
      source: 'springcurve.app',
      note: 'Drag a spring, copy the CSS. That is the whole tool.',
    },
    {
      title: 'Why 60fps is a lie on 120Hz screens',
      source: 'Fielder Engineering',
      note: 'Frame pacing matters more than frame rate.',
    },
    {
      title: 'Reduced motion is not no motion',
      source: 'a11y-notes.org',
      note: 'Opacity is (almost) always safe; translation rarely is.',
    },
    {
      title: 'The first easing curve, 1962',
      source: 'Interface Archaeology',
      note: 'History corner: keyframes before keyboards.',
    },
  ],
};

const ISSUE_141: IssueBody = {
  number: 141,
  subject: 'Scroll-driven animations without the jank',
  date: 'Jun 30, 2026',
  intro:
    'Scroll-linked effects used to mean a scroll listener, a layout read, ' +
    'and a prayer. This week — the compositor will do it for free now, ' +
    'the API is smaller than you think, and the fallback story is ' +
    'genuinely fine.',
  sectionOneTitle: 'Off the main thread, on purpose',
  sectionOneCopy:
    'animation-timeline: scroll() hands the whole effect to the ' +
    'compositor, which means your parallax header keeps gliding even ' +
    'while React is busy reconciling a 4,000-row table. The mental shift ' +
    'is that scroll position becomes the clock: you write an ordinary ' +
    'keyframe animation and swap the timeline out from under it. Reading ' +
    'progress bars, reveal-on-scroll, sticky-header shrink — all of them ' +
    'stop being JavaScript problems.',
  tipTitle: 'The code tip',
  tipCopy:
    'The classic reading-progress bar in six declarations, running ' +
    'entirely off the main thread:',
  tipCode: [
    '/* Progress bar driven by scroll — zero main-thread work. */',
    '.reading-progress {',
    '  transform-origin: 0 50%;',
    '  animation: grow linear;',
    '  animation-timeline: scroll(root block);',
    '}',
    '@keyframes grow {',
    '  from { scale: 0 1; }',
    '  to   { scale: 1 1; }',
    '}',
  ].join('\\n'),
  tipLanguage: 'css',
  linksTitle: 'Five worth your click',
  links: [
    {
      title: 'scroll() and view(): the full tour',
      source: 'cascadeweekly.dev',
      note: 'The reference I keep pinned.',
    },
    {
      title: 'Progressive enhancement for scroll timelines',
      source: 'Polaris Engineering',
      note: 'One @supports block, no polyfill.',
    },
    {
      title: 'Compositor-only properties, memorized',
      source: 'renderpath.io',
      note: 'Transform, opacity, filter — and the exceptions.',
    },
    {
      title: 'When sticky headers should shrink',
      source: 'Northwind Design',
      note: 'A taste essay with numbers in it.',
    },
    {
      title: 'The scroll listener graveyard',
      source: 'jank.report',
      note: 'Six patterns you can finally delete.',
    },
  ],
};

type TopicId =
  | 'all'
  | 'animation'
  | 'css'
  | 'performance'
  | 'tooling'
  | 'career';

const TOPICS: readonly {id: TopicId; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'animation', label: 'Animation'},
  {id: 'css', label: 'CSS'},
  {id: 'performance', label: 'Performance'},
  {id: 'tooling', label: 'Tooling'},
  {id: 'career', label: 'Career'},
];

interface ArchiveIssue {
  number: number;
  title: string;
  teaser: string;
  topic: Exclude<TopicId, 'all'>;
  topicLabel: string;
  minutes: number;
}

const ARCHIVE: readonly ArchiveIssue[] = [
  {
    number: 142,
    title: 'The physics of a good toggle',
    teaser:
      'Why spring easing beats duration curves for anything a finger ' +
      'touches — and the linear() trick that gets you 90% there.',
    topic: 'animation',
    topicLabel: 'Animation',
    minutes: 6,
  },
  {
    number: 141,
    title: 'Scroll-driven animations without the jank',
    teaser:
      'animation-timeline is finally everywhere. We rebuild three JS ' +
      'scroll effects with zero main-thread work.',
    topic: 'css',
    topicLabel: 'CSS',
    minutes: 7,
  },
  {
    number: 140,
    title: 'Budgets before benchmarks',
    teaser:
      'A 150 KB interaction budget changed how our team argues about ' +
      'dependencies. Here is the worksheet.',
    topic: 'performance',
    topicLabel: 'Performance',
    minutes: 5,
  },
  {
    number: 139,
    title: 'A love letter to the Layers panel',
    teaser:
      'Six devtools workflows I watch senior candidates reach for — and ' +
      'the compositor bugs they catch in minutes.',
    topic: 'tooling',
    topicLabel: 'Tooling',
    minutes: 6,
  },
  {
    number: 138,
    title: 'The staff design-engineer path',
    teaser:
      'Interviews with four staff DEs on scope, leverage, and why a ' +
      'prototype is a promotion artifact.',
    topic: 'career',
    topicLabel: 'Career',
    minutes: 9,
  },
  {
    number: 137,
    title: 'Container queries in anger',
    teaser:
      'Shipping cq units inside a nine-year-old codebase: the fallbacks, ' +
      'the Safari gotcha, and the 40-line reset that saved us.',
    topic: 'css',
    topicLabel: 'CSS',
    minutes: 8,
  },
];

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      'I have unsubscribed from everything else. Overshoot is the only ' +
      'email I open the minute it lands.',
    name: 'Priya Raman',
    role: 'Staff design engineer, Fieldstone',
  },
  {
    quote:
      'The toggle-physics issue was better than most conference talks I ' +
      'have paid to sit through.',
    name: 'Marcus Bell',
    role: 'Frontend lead, Hexbyte',
  },
  {
    quote:
      'June writes the way good code reads: no filler, every line earns ' +
      'its place. Issue #128 alone saved us a week of performance work — ' +
      'we shipped the fix the same afternoon.',
    name: 'Sofia Andrade',
    role: 'Engineering manager, Lumen Labs',
  },
  {
    quote:
      'Our whole platform team shares exactly one subscription: this one.',
    name: 'Daniel Okafor',
    role: 'Principal engineer, Northwind',
  },
  {
    quote:
      'I have hired two people who brought up Overshoot in their ' +
      'interview loop. That is the quality bar it sets.',
    name: 'Grace Lin',
    role: 'VP of Engineering, Polaris',
  },
  {
    quote: 'Six minutes on Tuesday, smarter all week.',
    name: 'Tomás Rivera',
    role: 'Design engineer, Fielder',
  },
];

const SPONSOR = {
  heading: 'Reach 18,204 design engineers',
  copy:
    'One sponsor slot per issue — a short, clearly-labeled classified ' +
    'written in your voice, never a tracking pixel. Readers are senior ' +
    'frontend and design-systems engineers at product companies.',
  rate: '$1,450',
  rateCaption: 'per issue · 4-issue bundle $4,900',
  stats: '18,204 subscribers · 54% open rate · 19% link CTR',
  availability: [
    {month: 'Aug 2026', status: '1 slot left', variant: 'warning' as const},
    {month: 'Sep 2026', status: 'Open', variant: 'success' as const},
    {month: 'Oct 2026', status: 'Booked', variant: 'neutral' as const},
  ],
};

const AUTHOR = {
  name: 'June Kessler',
  initials: 'JK',
  bio:
    'Design engineer for eleven years — motion systems at Parallax, ' +
    'design infrastructure at Fieldstone. Overshoot started in 2023 as ' +
    'notes to a younger teammate and never stopped. Every issue is ' +
    'written by hand, tested in a real codebase, and sent to 18,204 ' +
    'inboxes on Tuesday at 6:00 AM Pacific.',
  chips: ['142 issues since 2023', 'Portland, OR', 'Replies to every email'],
  email: 'june@overshoot.dev',
};

const FOOTER_NOTE =
  '© 2026 Overshoot · Written in Portland, OR · No tracking pixels, ever.';

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to get issue #143.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

// ============= HOOKS =============

/**
 * Page width via ResizeObserver — the inline demo stage is ~1045px wide
 * inside a 1440px window, so viewport media queries never fire there.
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

/** Live prefers-reduced-motion flag (matchMedia + change listener). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
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
 * True once the node has intersected the viewport; fires exactly once.
 * Falls back to visible when IntersectionObserver is unavailable so the
 * page never renders as a wall of hidden sections.
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
      {threshold: 0.12},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases 0 → target with requestAnimationFrame once \`isActive\` flips true.
 * prefers-reduced-motion (and rAF-less environments) snap to the target.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  durationMs = 1300,
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
      // ease-out cubic: fast start, gentle landing on the fixture value.
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

/** Rise+fade scroll reveal; fires once, renders visible under reduced motion. */
function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const [ref, inView] = useInView();
  const reducedMotion = usePrefersReducedMotion();
  const isShown = reducedMotion || inView;
  return (
    <div
      ref={ref}
      style={{
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(12px)',
        transition: reducedMotion
          ? 'none'
          : \`opacity 560ms ease \${delayMs}ms, transform 560ms ease \${delayMs}ms\`,
      }}>
      {children}
    </div>
  );
}

/** Overshoot logomark: accent glyph tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={ActivityIcon} size="sm" color="inherit" />
      </div>
      <span style={styles.brandWordmark}>{BRAND.name}</span>
    </HStack>
  );
}

/** Uppercase tracked section eyebrow in the accent tint. */
function Eyebrow({label}: {label: string}) {
  return <span style={styles.eyebrow}>{label}</span>;
}

/**
 * Signature hero moment: the masthead spring curve. The path draws itself
 * via a stroke-dash transition, visibly overshooting the dashed target
 * line before settling; the peak label and settle dot fade in after the
 * draw. Reduced motion renders the completed frame with no transitions.
 */
function SpringCurve({
  isDrawn,
  reducedMotion,
}: {
  isDrawn: boolean;
  reducedMotion: boolean;
}) {
  const showFinished = reducedMotion || isDrawn;
  const drawTransition =
    reducedMotion || !isDrawn
      ? 'none'
      : 'stroke-dashoffset 1500ms cubic-bezier(0.33, 1, 0.68, 1)';
  const labelTransition = reducedMotion
    ? 'none'
    : 'opacity 420ms ease 950ms';
  return (
    <svg
      viewBox="0 0 340 190"
      width="100%"
      role="img"
      aria-label="Diagram of a spring animation curve overshooting its target line by 9% before settling">
      {/* target line */}
      <line
        x1="12"
        y1="64"
        x2="328"
        y2="64"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <text
        x="328"
        y="54"
        textAnchor="end"
        fontSize="10"
        fontFamily="var(--font-family-mono, ui-monospace, monospace)"
        fill="var(--color-text-secondary)">
        target
      </text>
      {/* baseline */}
      <line
        x1="12"
        y1="168"
        x2="328"
        y2="168"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      {/* the spring: press → overshoot → settle */}
      <path
        d="M12 168 C 44 168 62 30 108 34 C 148 37 144 96 184 90 C 216 85 234 66 268 64 L 328 64"
        fill="none"
        stroke={ACCENT}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={showFinished ? 0 : 1}
        style={{transition: drawTransition}}
      />
      {/* overshoot peak marker + label */}
      <g style={{opacity: showFinished ? 1 : 0, transition: labelTransition}}>
        <circle cx="108" cy="34" r="4" fill={ACCENT} />
        <text
          x="120"
          y="28"
          fontSize="10"
          fontWeight="700"
          fontFamily="var(--font-family-mono, ui-monospace, monospace)"
          fill={ACCENT}>
          +9% overshoot
        </text>
        <circle
          cx="328"
          cy="64"
          r="4"
          fill="var(--color-background-card)"
          stroke={ACCENT}
          strokeWidth="2.5"
        />
        <text
          x="268"
          y="84"
          fontSize="10"
          fontFamily="var(--font-family-mono, ui-monospace, monospace)"
          fill="var(--color-text-secondary)">
          settled ~300ms
        </text>
      </g>
    </svg>
  );
}

/** One full sample-issue body (intro, two sections, code tip, links). */
function IssueReaderBody({
  issue,
  isCompact,
}: {
  issue: IssueBody;
  isCompact: boolean;
}) {
  return (
    <div
      style={{
        ...styles.readerBody,
        ...(isCompact ? styles.readerBodyCompact : null),
      }}>
      <VStack gap={2}>
        <Eyebrow label={\`Issue #\${issue.number} · \${issue.date}\`} />
        <Heading level={3}>{issue.subject}</Heading>
        <p style={styles.proseParagraph}>{issue.intro}</p>
      </VStack>
      <Divider />
      <VStack gap={2}>
        <h4 style={styles.proseHeading}>{issue.sectionOneTitle}</h4>
        <p style={styles.proseParagraph}>{issue.sectionOneCopy}</p>
      </VStack>
      <VStack gap={2}>
        <h4 style={styles.proseHeading}>{issue.tipTitle}</h4>
        <p style={styles.proseParagraph}>{issue.tipCopy}</p>
        <CodeBlock
          code={issue.tipCode}
          language={issue.tipLanguage}
          hasCopyButton
          size="sm"
          width="100%"
        />
      </VStack>
      <VStack gap={1}>
        <h4 style={styles.proseHeading}>{issue.linksTitle}</h4>
        {issue.links.map(link => (
          <div key={link.title} style={styles.linkRow}>
            <div style={styles.linkGlyph} aria-hidden="true">
              <Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />
            </div>
            <StackItem size="fill">
              <VStack gap={0}>
                <Text size="sm" weight="semibold">
                  {link.title}{' '}
                  <Text size="sm" color="secondary">
                    — {link.source}
                  </Text>
                </Text>
                <Text type="supporting" color="secondary">
                  {link.note}
                </Text>
              </VStack>
            </StackItem>
          </div>
        ))}
      </VStack>
      <Text type="supporting" color="secondary">
        — June. Reply to this email; I read every one.
      </Text>
    </div>
  );
}

// ============= PAGE =============

export default function NewsletterCreatorLandingTemplate() {
  // ---- responsive: measure the page itself (demo-stage safe) ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pageRef);
  const isMid = pageWidth > 0 && pageWidth <= 980;
  const isCompact = pageWidth > 0 && pageWidth <= 760;
  const isNarrow = pageWidth > 0 && pageWidth <= 560;

  const reducedMotion = usePrefersReducedMotion();

  // ---- nav: compact menu + scroll-spy ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- subscribe capture ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [hasResent, setHasResent] = useState(false);

  // ---- hero proof count-ups (fire once on first view) ----
  const [proofRef, proofInView] = useInView();
  const readerCount = useCountUp(HERO.readers, proofInView);
  const openRateCount = useCountUp(HERO.openRate, proofInView, 1100);

  // ---- signature spring draw (replayable) ----
  const [springRun, setSpringRun] = useState(0);
  const [isSpringDrawn, setIsSpringDrawn] = useState(false);
  useEffect(() => {
    if (reducedMotion) {
      setIsSpringDrawn(true);
      return undefined;
    }
    setIsSpringDrawn(false);
    // Double rAF so the reset (dashoffset 1, no transition) flushes first.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setIsSpringDrawn(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [springRun, reducedMotion]);

  // ---- sample reader swap toggle ----
  const [readerIssue, setReaderIssue] = useState<142 | 141>(142);

  // ---- archive topic filter ----
  const [topic, setTopic] = useState<TopicId>('all');

  // ---- sponsor kit + author email reveal ----
  const [isKitRequested, setIsKitRequested] = useState(false);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);

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

  /** Smooth-scroll the container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container == null || section == null) {
      return;
    }
    const top =
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      NAV_ALLOWANCE;
    setActiveSection(id);
    container.scrollTo({top, behavior: reducedMotion ? 'auto' : 'smooth'});
  };

  /** Nav CTA: back to the hero subscribe form. */
  const jumpToTop = () => {
    setIsMenuOpen(false);
    pageRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /** Scroll-spy: the last nav anchor above the fold line wins. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const containerTop = container.getBoundingClientRect().top;
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (
        section != null &&
        section.getBoundingClientRect().top - containerTop <= SPY_OFFSET
      ) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
  };

  const submitSubscribe = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
    setHasResent(false);
  };

  const resetSubscribe = () => {
    setConfirmedEmail(null);
    setHasResent(false);
    setEmail('');
    setEmailError(null);
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const topicCount = (id: TopicId): number =>
    id === 'all'
      ? ARCHIVE.length
      : ARCHIVE.filter(issue => issue.topic === id).length;

  const visibleIssues =
    topic === 'all'
      ? ARCHIVE
      : ARCHIVE.filter(issue => issue.topic === topic);

  const archiveColumns = isNarrow ? 1 : isMid ? 2 : 3;
  const quoteColumns = isNarrow ? 1 : isMid ? 2 : 3;

  // ============= CHROME =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Primary">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {!isCompact && (
            <HStack gap={1} vAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={activeSection === anchor.id ? 'true' : undefined}
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
          label="Subscribe"
          variant="primary"
          size={isCompact ? 'sm' : 'md'}
          icon={<Icon icon={MailIcon} size="sm" color="inherit" />}
          onClick={jumpToTop}
        />
        {isCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(previous => !previous)}
            style={styles.iconButton}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isMenuOpen && isCompact && (
          <div style={styles.menuPanel} role="menu" aria-label="Site menu">
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
              <Divider />
              <button
                type="button"
                role="menuitem"
                style={{...styles.menuLink, color: ACCENT}}
                onClick={jumpToTop}>
                <Icon icon={MailIcon} size="sm" color="inherit" />
                Subscribe free
              </button>
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const subscribeForm =
    confirmedEmail !== null ? (
      <div style={styles.successCard}>
        <div style={styles.successDisc} aria-hidden="true">
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <VStack gap={1}>
          <Text weight="semibold">Check your inbox</Text>
          <Text type="supporting" color="secondary">
            We sent a confirmation to {confirmedEmail}. Click it and issue
            #143 arrives Tuesday at 6:00 AM.
          </Text>
          {hasResent && (
            <Text type="supporting" color="secondary">
              Sent again — give it a minute, and check spam too.
            </Text>
          )}
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label={hasResent ? 'Resent' : 'Resend email'}
              variant="ghost"
              size="sm"
              isDisabled={hasResent}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => setHasResent(true)}
            />
            <Button
              label="Use a different address"
              variant="ghost"
              size="sm"
              onClick={resetSubscribe}
            />
          </HStack>
        </VStack>
      </div>
    ) : (
      <VStack gap={1}>
        <div
          style={{
            ...styles.emailRow,
            ...(isNarrow ? styles.emailRowStacked : null),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Email address"
              isLabelHidden
              placeholder="you@studio.dev"
              value={email}
              onChange={value => {
                setEmail(value);
                setEmailError(null);
              }}
            />
          </div>
          <Button
            label="Subscribe free"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={submitSubscribe}
          />
        </div>
        {emailError !== null && (
          <p style={styles.emailError} role="alert">
            {emailError}
          </p>
        )}
      </VStack>
    );

  const heroProof = (
    <div ref={proofRef}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.avatarStack} aria-hidden="true">
          {READER_MONOGRAMS.map((reader, index) => (
            <div
              key={reader.initials}
              style={{
                ...styles.avatarDisc,
                backgroundColor: accentMix(
                  reader.tint,
                  'var(--color-background-muted)',
                ),
                marginLeft: index === 0 ? 0 : -8,
              }}>
              {reader.initials}
            </div>
          ))}
        </div>
        <span style={styles.proofFigure}>
          {Math.round(readerCount).toLocaleString('en-US')} readers
        </span>
        <Text type="supporting" color="secondary">
          ·
        </Text>
        <span style={styles.proofFigure}>
          {Math.round(openRateCount)}% open rate
        </span>
      </HStack>
    </div>
  );

  const springCard = (
    <div style={styles.springCard}>
      <div style={styles.springHeader}>
        <div style={styles.brandTile} aria-hidden="true">
          <Icon icon={ActivityIcon} size="sm" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              This week in Overshoot
            </Text>
            <Text type="supporting" color="secondary">
              #142 · The physics of a good toggle
            </Text>
          </VStack>
        </StackItem>
        <span style={styles.issueChip}>6 min read</span>
      </div>
      <div style={styles.springBody}>
        <SpringCurve isDrawn={isSpringDrawn} reducedMotion={reducedMotion} />
      </div>
      <div style={styles.springFooter}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Fig. 01 — a press, an overshoot, a settle. Every issue is this
            curve.
          </Text>
        </StackItem>
        <Button
          label="Replay"
          variant="ghost"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          onClick={() => setSpringRun(previous => previous + 1)}
        />
      </div>
    </div>
  );

  const hero = (
    <div
      style={{
        ...styles.heroRow,
        ...(isMid ? styles.heroRowMid : null),
        ...(isCompact ? styles.heroRowStacked : null),
      }}>
      <div style={styles.heroText}>
        <Eyebrow label={HERO.eyebrow} />
        <h1
          style={{
            ...styles.headline,
            ...(isNarrow ? styles.headlineCompact : null),
          }}>
          {HERO.headline}
        </h1>
        <p style={styles.subcopy}>{HERO.subcopy}</p>
        {subscribeForm}
        <Text type="supporting" color="secondary">
          {HERO.finePrint}
        </Text>
        {heroProof}
      </div>
      <div style={styles.heroAside}>{springCard}</div>
    </div>
  );

  // ============= SAMPLE-ISSUE READER =============

  const currentIssue = readerIssue === 142 ? ISSUE_142 : ISSUE_141;
  const otherIssueNumber = readerIssue === 142 ? 141 : 142;

  const sampleReader = (
    <section
      id="sample"
      ref={registerSection('sample')}
      aria-label="Sample issue">
      <Reveal>
        <VStack gap={4}>
          <VStack gap={2}>
            <Eyebrow label="Sample issue" />
            <Heading level={2}>Read one before you subscribe</Heading>
            <Text type="supporting" color="secondary">
              The whole pitch is the product. Here is last week's issue,
              unabridged — scroll inside the frame.
            </Text>
          </VStack>
          <div style={styles.readerFrame}>
            <div style={styles.readerMasthead}>
              <span style={styles.issueChip}>#{currentIssue.number}</span>
              <StackItem size="fill">
                <Text size="sm" weight="semibold">
                  {currentIssue.subject}
                </Text>
              </StackItem>
              <Button
                label={
                  readerIssue === 142
                    ? \`Read issue #\${otherIssueNumber}\`
                    : \`Back to issue #\${otherIssueNumber}\`
                }
                variant="secondary"
                size="sm"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => setReaderIssue(otherIssueNumber as 142 | 141)}
              />
            </div>
            <IssueReaderBody issue={currentIssue} isCompact={isNarrow} />
          </div>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= ARCHIVE =============

  const archive = (
    <section id="archive" ref={registerSection('archive')} aria-label="Archive">
      <Reveal>
        <VStack gap={4}>
          <VStack gap={2}>
            <Eyebrow label="Archive" />
            <Heading level={2}>141 back issues, zero paywalls</Heading>
            <Text type="supporting" color="secondary">
              The six most recent below — filter by topic.
            </Text>
          </VStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            {TOPICS.map(entry => (
              <ToggleButton
                key={entry.id}
                label={\`\${entry.label} · \${topicCount(entry.id)}\`}
                size="sm"
                isPressed={topic === entry.id}
                onPressedChange={() => setTopic(entry.id)}
              />
            ))}
          </HStack>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: \`repeat(\${archiveColumns}, minmax(0, 1fr))\`,
              gap: 'var(--spacing-3)',
            }}>
            {visibleIssues.map(issue => (
              <Card key={issue.number} padding={4} height="100%">
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <span style={styles.issueNumber}>
                        ISSUE #{issue.number}
                      </span>
                    </StackItem>
                    <Badge variant="orange" label={issue.topicLabel} />
                  </HStack>
                  <Text weight="semibold">{issue.title}</Text>
                  <Text type="supporting" color="secondary">
                    {issue.teaser}
                  </Text>
                  <HStack gap={1} vAlign="center">
                    <Icon icon={ClockIcon} size="xsm" color="secondary" />
                    <Text type="supporting" color="secondary">
                      {issue.minutes} min read
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </div>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= TESTIMONIAL WALL =============

  const testimonialWall = (
    <section
      id="readers"
      ref={registerSection('readers')}
      aria-label="What readers say">
      <Reveal>
        <VStack gap={4}>
          <VStack gap={2}>
            <Eyebrow label="Readers" />
            <Heading level={2}>Read by the people who ship the pixels</Heading>
          </VStack>
          <div
            style={{
              columnCount: quoteColumns,
              columnGap: 'var(--spacing-3)',
            }}>
            {TESTIMONIALS.map(entry => (
              <Card
                key={entry.name}
                padding={4}
                style={{
                  breakInside: 'avoid',
                  marginBottom: 'var(--spacing-3)',
                }}>
                <VStack gap={2}>
                  <div style={styles.quoteMark} aria-hidden="true">
                    <Icon icon={QuoteIcon} size="xsm" color="inherit" />
                  </div>
                  <p style={styles.quoteText}>{entry.quote}</p>
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
            ))}
          </div>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= SPONSOR + AUTHOR =============

  const sponsorSection = (
    <section
      id="sponsor"
      ref={registerSection('sponsor')}
      aria-label="Sponsor Overshoot">
      <Reveal>
        <VStack gap={4}>
          <VStack gap={2}>
            <Eyebrow label="Sponsor" />
            <Heading level={2}>{SPONSOR.heading}</Heading>
          </VStack>
          <Card padding={5}>
            <div
              style={{
                ...styles.splitRow,
                ...(isCompact ? styles.splitRowStacked : null),
              }}>
              <div style={styles.splitHalf}>
                <Text type="body" color="secondary">
                  {SPONSOR.copy}
                </Text>
                <span style={styles.monoLine}>{SPONSOR.stats}</span>
              </div>
              <div style={styles.splitHalf}>
                <VStack gap={0}>
                  <span style={styles.rateFigure}>{SPONSOR.rate}</span>
                  <Text type="supporting" color="secondary">
                    {SPONSOR.rateCaption}
                  </Text>
                </VStack>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  {SPONSOR.availability.map(slot => (
                    <Badge
                      key={slot.month}
                      variant={slot.variant}
                      label={\`\${slot.month} · \${slot.status}\`}
                    />
                  ))}
                </HStack>
                {isKitRequested ? (
                  <HStack gap={2} vAlign="center">
                    <Icon icon={CheckIcon} size="sm" color="success" />
                    <Text type="supporting" color="secondary">
                      Kit requested — June replies within 2 business days.
                    </Text>
                  </HStack>
                ) : (
                  <div style={{display: 'flex'}}>
                    <Button
                      label="Request the sponsor kit"
                      variant="secondary"
                      icon={
                        <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                      }
                      onClick={() => setIsKitRequested(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </VStack>
      </Reveal>
    </section>
  );

  const authorSection = (
    <section aria-label="About the author">
      <Reveal>
        <div
          style={{
            ...styles.splitRow,
            ...(isCompact ? styles.splitRowStacked : null),
            alignItems: isCompact ? 'stretch' : 'center',
          }}>
          <HStack gap={4} vAlign="center">
            <div style={styles.authorTile} aria-hidden="true">
              {AUTHOR.initials}
            </div>
            <VStack gap={1}>
              <Eyebrow label="About the author" />
              <Heading level={3}>Written by {AUTHOR.name}</Heading>
            </VStack>
          </HStack>
          <StackItem size="fill">
            <VStack gap={2}>
              <Text type="body" color="secondary">
                {AUTHOR.bio}
              </Text>
              <HStack gap={2} vAlign="center" wrap="wrap">
                {AUTHOR.chips.map(chip => (
                  <Badge key={chip} variant="neutral" label={chip} />
                ))}
              </HStack>
              <HStack gap={2} vAlign="center" wrap="wrap">
                {isEmailRevealed ? (
                  <span style={styles.monoLine}>{AUTHOR.email}</span>
                ) : (
                  <Button
                    label="Say hello"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={MailIcon} size="sm" color="inherit" />}
                    onClick={() => setIsEmailRevealed(true)}
                  />
                )}
              </HStack>
            </VStack>
          </StackItem>
        </div>
      </Reveal>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.bandMuted}>
      <div
        style={{
          ...styles.column,
          ...(isNarrow ? styles.columnCompact : null),
          gap: 'var(--spacing-4)',
        }}>
        <HStack gap={4} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={1}>
              <BrandMark />
              <Text type="supporting" color="secondary">
                {BRAND.tagline}
              </Text>
            </VStack>
          </StackItem>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              On this page
            </Text>
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                style={styles.footerLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
          </VStack>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Elsewhere
            </Text>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              <HStack gap={1} vAlign="center">
                <Icon icon={RssIcon} size="xsm" color="inherit" />
                RSS feed
              </HStack>
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => {}}>
              Privacy note
            </button>
          </VStack>
        </HStack>
        <Divider />
        <Text type="supporting" color="secondary">
          {FOOTER_NOTE}
        </Text>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
          {navbar}
          {/* hero band (plain) */}
          <div
            style={{
              ...styles.column,
              ...(isNarrow ? styles.columnCompact : null),
            }}>
            {hero}
          </div>
          {/* sample reader band (accent-tinted, full-bleed) */}
          <div style={styles.bandTinted}>
            <div
              style={{
                ...styles.column,
                ...(isNarrow ? styles.columnCompact : null),
              }}>
              {sampleReader}
            </div>
          </div>
          {/* archive band (plain) */}
          <div
            style={{
              ...styles.column,
              ...(isNarrow ? styles.columnCompact : null),
            }}>
            {archive}
          </div>
          {/* testimonial band (muted, full-bleed) */}
          <div
            style={{
              ...styles.bandMuted,
              borderBottom: '1px solid var(--color-border)',
            }}>
            <div
              style={{
                ...styles.column,
                ...(isNarrow ? styles.columnCompact : null),
              }}>
              {testimonialWall}
            </div>
          </div>
          {/* sponsor + author band (plain) */}
          <div
            style={{
              ...styles.column,
              ...(isNarrow ? styles.columnCompact : null),
              gap: 'var(--spacing-8)',
            }}>
            {sponsorSection}
            {authorSection}
          </div>
          {footer}
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};