var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

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
 * @output Full book-launch landing page: sticky navbar (brand mark, four
 *   smooth-scrolling anchor links that collapse behind a menu button at
 *   compact widths, Get-the-book CTA), a split hero whose signature
 *   moment is a 3D CSS book cover with spine and page edges that sways
 *   idly on a setInterval tick and straightens on hover (reduced-motion
 *   renders it flat and static), retailer buttons that fire receipt
 *   Toasts, a tinted count-up stats band, a sample-chapter reader with
 *   three fixture pages, page-turn slide animation, progress bar, and
 *   prev/next controls, a six-card learn grid that expands into a
 *   12-chapter accordion (controlled Collapsible Set), a five-card
 *   praise wall, an author bio split with speaking/press chips, a
 *   three-format pricing row with the Bundle highlighted and a
 *   launch-week bonus list, a validating free-chapter email capture that
 *   flips to a success state, and a scheme-locked footer with an ISBN
 *   mono row. Scroll-reveals rise+fade 12px and fire once via
 *   IntersectionObserver; all motion is gated by prefers-reduced-motion
 *   (reveals render visible, counters render final).
 * @position Page template; emitted by \`astryx template book-author-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div; the navbar inside it is position:sticky
 * top:0 and anchors smooth-scroll the container under a sticky-nav
 * allowance. A centered 1080px column carries each section; full-bleed
 * tinted bands (stats, inside-the-book, author, newsletter, footer)
 * alternate with plain bands and paint edge to edge around their own
 * inner columns. The Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll to real section ids; the
 *   compact menu button opens a dropdown that closes on Escape (refocusing
 *   the trigger), outside pointerdown, or any selection.
 * - The 3D cover sways between two poses on a 3.2s setInterval (spring-ish
 *   ease via a long CSS transition); pointer hover straightens it to
 *   near-flat and pauses the sway; prefers-reduced-motion renders a flat,
 *   static cover.
 * - The sample reader's prev/next buttons page through 3 fixture pages
 *   with a keyed slide-in animation (direction-aware, skipped under
 *   reduced motion) and drive a determinate progress bar.
 * - The chapter-outline toggle expands a 12-chapter accordion; each
 *   chapter is a controlled Collapsible tracked in a Set so several can
 *   be open at once (chapter 1 ships open).
 * - Stats count up from 0 on first reveal via a fixed 28-step setInterval
 *   ramp (reduced motion renders final values immediately).
 * - The newsletter form validates (empty + format errors inline) and
 *   success swaps the form for a confirmation echoing the address with a
 *   "Use a different email" reset.
 * - Retailer, format, and footer resource buttons fire named receipt
 *   Toasts (they would leave the page in a real deployment).
 *
 * Color policy: token/light-dark hybrid. ONE quarantined accent literal
 * (ember terracotta, see ACCENT) carries the brand; every other in-flow
 * surface uses var(--color-*) tokens. Literal colors are KEPT only on
 * deliberately scheme-locked art surfaces, each with colorScheme:'dark'
 * in its style: the book cover (front, spine, page edges), the author
 * portrait tile, the newsletter band, and the footer — cover art and
 * dark bands must not reflow with the app theme. Text sitting on those
 * locked surfaces (DARK_TEXT*) is literal on purpose.
 *
 * Responsive contract (element-measured; the inline demo stage is
 * ~1045px, so the page observes its own width with a ResizeObserver
 * instead of viewport media queries):
 * - Column: max-width 1080px, centered; tinted bands bleed full width.
 * - >960px: nav shows inline anchors + CTA; hero is split copy/cover;
 *   learn grid 3-up; praise 3-up; formats 3-up; author split.
 * - <=960px: nav links collapse behind a 44px menu button + dropdown;
 *   the hero stacks (cover centered below copy).
 * - <=720px: author split stacks; reader controls wrap; grids drop to
 *   2-up then 1-up via Grid minWidth; formats stack.
 * - <=560px: headline and stat sizes step down, section paddings
 *   tighten, retailer buttons wrap full-width, and the newsletter form
 *   stacks its button under the input. Holds at 390px with no
 *   overflow-x in the phone artboard.
 * - Tap targets: nav links, menu button, reader controls, and retailer
 *   buttons are 40px+; nothing on the page requires hover (the cover
 *   hover is decorative only).
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
const ACCENT_TINT = 'color-mix(in srgb, light-dark(#9A3B16, #F09B76) 12%, transparent)';
/** 32% mix for the progress/meter fills' borders. */
const ACCENT_EDGE = 'color-mix(in srgb, light-dark(#9A3B16, #F09B76) 32%, transparent)';

// Scheme-locked dark surfaces (cover art, newsletter band, footer) use
// literal paint with colorScheme:'dark' so they read identically in both
// app themes — see Color policy in the header.
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(231, 225, 212, 0.82)';
const DARK_TEXT_FAINT = 'rgba(231, 225, 212, 0.6)';
const DARK_CHIP_BORDER = 'rgba(231, 225, 212, 0.26)';
const ERROR_ON_DARK = '#FECACA';

/** Sticky-nav height allowance for smooth-scroll targets. */
const NAV_ALLOWANCE = 76;

/** Page-turn keyframes; the reduce guard backstops the JS gating. */
const MOTION_CSS = \`
@keyframes bal-page-next {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes bal-page-prev {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .bal-page { animation: none !important; }
}
\`;

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
    paddingBlock: 'var(--spacing-10, 64px)',
  },
  sectionPhone: {
    paddingBlock: 'var(--spacing-8)',
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
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
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
    border: \`1px solid \${ACCENT_EDGE}\`,
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
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: 0,
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  heroHeadlinePhone: {
    fontSize: 34,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 480,
    margin: 0,
  },
  retailerButton: {
    display: 'inline-flex',
    alignItems: 'center',
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
  },
  // ---- 3D cover (scheme-locked art; see Color policy) ----
  coverStage: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-4)',
    perspective: 1200,
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
  // ---- tinted full-bleed bands ----
  tintedBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
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
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  // ---- sample reader ----
  readerFrame: {
    borderRadius: 'var(--radius-container, 14px)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-med)',
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
  // ---- learn grid / outline ----
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
  portraitTile: {
    width: 168,
    height: 168,
    flexShrink: 0,
    borderRadius: 20,
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
    fontSize: 52,
    fontWeight: 700,
  },
  // ---- formats ----
  formatCardHighlighted: {
    borderColor: ACCENT,
    boxShadow: \`0 0 0 1px \${ACCENT}\`,
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
    border: \`1px solid \${ACCENT_EDGE}\`,
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- newsletter band (scheme-locked; see Color policy) ----
  newsletterBand: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 90% at 85% 0%, rgba(240, 155, 118, 0.28), transparent 60%)',
      'linear-gradient(180deg, #16213A 0%, #0B1220 100%)',
    ].join(', '),
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
    border: \`1px solid \${DARK_CHIP_BORDER}\`,
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
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
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
 * Count from 0 to target once active: 28 fixed setInterval steps with a
 * cubic ease-out. Reduced motion renders the final value immediately.
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
    const steps = 28;
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

/** Rise+fade scroll reveal wrapper (12px, fire once). */
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
        transform: isVisible ? 'none' : 'translateY(12px)',
        transition: reduced
          ? 'none'
          : \`opacity 480ms ease \${delay}ms, transform 480ms ease \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

/** Section intro: uppercase eyebrow + serif-adjacent heading + copy. */
function SectionIntro({
  eyebrow,
  title,
  copy,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: 'center' | 'start';
}) {
  return (
    <VStack gap={2} hAlign={align === 'center' ? 'center' : 'start'}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <Heading level={2}>{title}</Heading>
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

/** One count-up stat cell in the tinted stats band. */
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
 * straightens; reduced motion renders a flat, static cover.
 */
function BookCover({
  reduced,
  width,
}: {
  reduced: boolean;
  width: number;
}) {
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
    <div style={styles.coverStage}>
      <div
        role="img"
        aria-label={\`Cover of \${BOOK.title} by \${BOOK.author}\`}
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

  // ---- nav menu (compact) ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- smooth scroll ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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

  // ---- stats band reveal (shared by all four count-ups) ----
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

  const column = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const sectionPad = {
    ...styles.section,
    ...(isPhone ? styles.sectionPhone : null),
  };

  // ============= NAVBAR =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Book site">
      <div style={styles.navInner}>
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

  // ============= HERO =============

  const hero = (
    <div style={{...column, ...sectionPad}}>
      <div
        style={{
          ...styles.heroRow,
          ...(isStacked ? styles.heroRowStacked : null),
        }}>
        <div style={styles.heroText}>
          <HStack gap={2} wrap="wrap">
            <Token
              label={\`New from \${BOOK.publisher}\`}
              size="sm"
              color="orange"
            />
            <Token label={BOOK.shipDate} size="sm" color="gray" />
          </HStack>
          <h1
            style={{
              ...styles.heroHeadline,
              ...(isPhone ? styles.heroHeadlinePhone : null),
            }}>
            {BOOK.title}
          </h1>
          <p style={styles.heroSubcopy}>{BOOK.subtitle}</p>
          <Text size="sm" color="secondary">
            By {BOOK.author} · 312 pages · Hardcover, ebook, and bundle
          </Text>
          <HStack gap={2} wrap="wrap">
            <Button
              label="Read a sample"
              variant="primary"
              icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
              onClick={() => jumpToSection('sample')}
            />
            <Button
              label="See formats & pricing"
              variant="secondary"
              onClick={() => jumpToSection('formats')}
            />
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
                  style={{
                    ...styles.retailerButton,
                    ...(isPhone ? {flex: '1 1 40%'} : null),
                  }}
                  onClick={() =>
                    fireToast(\`Opening the \${retailer} listing (demo).\`)
                  }>
                  {retailer}
                  <Icon icon={ExternalLinkIcon} size="xsm" color="inherit" />
                </button>
              ))}
            </HStack>
          </VStack>
        </div>
        <BookCover reduced={reduced} width={isPhone ? 208 : 250} />
      </div>
    </div>
  );

  // ============= STATS BAND =============

  const statsBand = (
    <div style={styles.tintedBand}>
      <div
        ref={statsReveal.ref}
        style={{...column, paddingBlock: 'var(--spacing-6)'}}>
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
                      : \`\${
                          reader.direction === 'next'
                            ? 'bal-page-next'
                            : 'bal-page-prev'
                        } 280ms ease\`,
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
                    style={{...styles.progressFill, width: \`\${readerProgress}%\`}}
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

  // ============= INSIDE THE BOOK =============

  const insideSection = (
    <div style={styles.tintedBand}>
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
            />
          </Reveal>
          <Reveal reduced={reduced} delay={80}>
            <Grid columns={{minWidth: 264, max: 3}} gap={3}>
              {LEARN_ITEMS.map(item => (
                <Card key={item.id} padding={4}>
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
              ))}
            </Grid>
          </Reveal>
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
          />
        </Reveal>
        <Reveal reduced={reduced} delay={80}>
          <Grid columns={{minWidth: 280, max: 3}} gap={3}>
            {PRAISE.map(entry => (
              <Card key={entry.id} padding={4}>
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
            ))}
          </Grid>
        </Reveal>
      </VStack>
    </section>
  );

  // ============= AUTHOR =============

  const authorSection = (
    <div style={styles.tintedBand}>
      <section
        ref={registerSection('author')}
        aria-label="About the author"
        style={{...column, ...sectionPad}}>
        <Reveal reduced={reduced}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-6)',
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

  // ============= FORMATS =============

  const formatsSection = (
    <section
      ref={registerSection('formats')}
      aria-label="Formats and pricing"
      style={{...column, ...sectionPad}}>
      <VStack gap={6}>
        <Reveal reduced={reduced}>
          <SectionIntro
            eyebrow="Get the book"
            title="Choose your format"
            copy={LAUNCH_NOTE}
          />
        </Reveal>
        <Reveal reduced={reduced} delay={80}>
          <Grid columns={{minWidth: 264, max: 3}} gap={3}>
            {FORMATS.map(format => (
              <Card
                key={format.id}
                padding={5}
                style={format.isHighlighted ? styles.formatCardHighlighted : undefined}>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="label">{format.name}</Text>
                    {format.savingsNote !== undefined && (
                      <Badge variant="orange" label={format.savingsNote} />
                    )}
                  </HStack>
                  <span style={styles.formatPrice}>\${format.price}</span>
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
                        \`Checkout — \${format.name} ($\${format.price}) added (demo).\`,
                      )
                    }
                  />
                </VStack>
              </Card>
            ))}
          </Grid>
        </Reveal>
      </VStack>
    </section>
  );

  // ============= NEWSLETTER =============

  const newsletterBand = (
    <div style={styles.newsletterBand}>
      <div style={{...column, ...sectionPad}}>
        <Reveal reduced={reduced}>
          <VStack gap={4} hAlign="center">
            <Heading level={2} style={{color: DARK_TEXT}}>
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
            <div ref={pageRef} style={styles.page}>
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
`;export{e as default};