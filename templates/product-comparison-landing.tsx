// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file product-comparison-landing.tsx
 * @input Deterministic fixtures only (the fictional challenger "Northbeam"
 *   vs the fictional incumbent "Gridware": a 12-dimension comparison
 *   matrix grouped into four categories with yes/no/partial verdicts,
 *   short evidence notes, and three shared footnotes; a derived
 *   head-to-head tally; three "why teams switch" stat cards; a four-step
 *   migration timeline with a copyable CLI command; one switcher
 *   testimonial with before/after metric chips; a two-bullet "when
 *   Gridware is a better fit" callout; two pricing-at-a-glance cards;
 *   four FAQ entries; and footer link fixtures)
 * @output Full "switch from" comparison landing page: sticky navbar with
 *   smooth-scrolling scroll-spy anchors that collapse behind a menu
 *   button at compact widths, a hero with the versus headline, one-line
 *   verdict, working scroll CTAs, and an animated head-to-head scoreboard
 *   whose tally bars fill and count up on first view; the centerpiece
 *   sticky-header comparison table (12 dimension rows x 2 product
 *   columns of check/cross/partial verdict chips with superscript
 *   footnote markers that jump to the footnotes section) fronted by a
 *   category filter row that scroll-jumps to and highlights row groups,
 *   with a sticky first column once the page narrows; three switch-
 *   reason cards with count-up stats; a migration timeline with per-step
 *   durations and a copy-with-feedback CLI command; a dark switcher
 *   testimonial band with before/after chips; an honest "when Gridware
 *   is a better fit" callout; a pricing-at-a-glance band; a controlled
 *   FAQ accordion; a validating email capture for the migration
 *   checklist; the footnotes list; and a dark sitemap footer.
 * @position Page template; emitted by `astryx template product-comparison-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy; the navbar inside it
 * is position:sticky top:0. The page is a stack of full-bleed bands
 * (plain / muted / dark) that each center a 1120px column, alternating
 * tinted and plain surfaces per the landing-page contract. The compact
 * nav menu drops absolutely from the sticky navbar; the Toast sits fixed
 * bottom-right.
 *
 * Interaction contract:
 * - Nav anchors (Comparison / Why switch / Migration / Pricing / FAQ)
 *   smooth-scroll the container under the sticky nav; onScroll spies the
 *   last section above the fold and highlights the matching link
 *   (aria-current). At compact widths the links collapse behind a 40px
 *   menu button whose dropdown closes on Escape, outside pointerdown, or
 *   selection.
 * - Hero CTAs actually navigate: "Migrate in a weekend" scrolls to the
 *   migration timeline, "See the full comparison" to the table. The
 *   scoreboard tally (derived from the table fixtures, never hand-typed)
 *   counts up and its bars fill once on first view.
 * - The category filter row sets the active row group (tinted rows) and
 *   scroll-jumps the container so the group header lands under the
 *   sticky table header; "All 12" clears the highlight and returns to
 *   the top of the table.
 * - Every superscript footnote marker in the table is a real button that
 *   scrolls to the footnotes section.
 * - The migration CLI command's Copy button writes to the clipboard and
 *   flips to a "Copied" state for 2s (timer cleaned up on unmount).
 * - The checklist email form validates on submit (empty and format
 *   errors inline) and success swaps the form for a confirmed state
 *   echoing the address, with a "Use a different email" reset.
 * - FAQ Collapsibles are controlled via a Set of open ids so several can
 *   be open at once; the first ships open as an affordance.
 * - Buttons that would leave the page (pilot signup, docs, status,
 *   social) fire a corner Toast so the wiring is provable.
 *
 * Motion: scroll-reveals (IntersectionObserver, fire once, rise+fade
 * 12px), count-ups on first view, and the hero scoreboard bar fill are
 * all gated by prefers-reduced-motion (matchMedia read once): reduced
 * renders reveals visible, counters final, bars full, and swaps smooth
 * scrolling for instant jumps. No Date.now, no randomness, no network
 * assets, no real logos.
 *
 * Color policy: ONE quarantined accent literal (BRAND_ACCENT, see the
 * contrast math at its declaration); accent tints are derived from it
 * via color-mix so no second literal exists. Status verdict tints follow
 * the repo convention of var(--color-success/error/warning, light-dark())
 * pairs. The testimonial band, final CTA band, terminal pane, and footer
 * are deliberately scheme-locked dark surfaces (colorScheme:'dark' with
 * literal paint) so they read identically in both app themes, matching
 * the saas-landing-page exemplar; DARK_TEXT* literals exist only for
 * text sitting on those locked surfaces.
 *
 * Responsive contract (useElementWidth ResizeObserver on the page wrap —
 * the inline demo stage is ~1045px wide, so viewport media queries never
 * fire there):
 * - Column: max-width 1120px, centered; every band paints full-bleed.
 * - >900px: navbar shows all five anchor links + CTA inline.
 * - <=900px: nav links collapse behind a menu button dropdown.
 * - <=780px: hero stacks (scoreboard below copy), the migration
 *   timeline drops from a 4-across row to a vertical rail, why-switch
 *   and pricing grids reflow via Grid minWidth, and the testimonial
 *   before/after chip rows stack.
 * - <=720px: the comparison table gains a horizontal scroll wrapper
 *   (minWidth 640) with a sticky first column (shadow edge); at wide
 *   widths the table header row is the sticky element instead.
 * - <=560px: headline and section type step down, the email form stacks
 *   its button, and band paddings tighten. Action rows wrap, so the
 *   page holds at 390px in the phone artboard with no overflow-x.
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
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
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
const ACCENT_TINT_STRONG = `color-mix(in srgb, ${BRAND_ACCENT} 14%, transparent)`;
const ACCENT_TINT_SOFT = `color-mix(in srgb, ${BRAND_ACCENT} 7%, transparent)`;
const ACCENT_TINT_BORDER = `color-mix(in srgb, ${BRAND_ACCENT} 32%, transparent)`;

// Text literals for the deliberately scheme-locked dark bands only
// (testimonial, final CTA, terminal pane, footer — see Color policy).
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.6)';
const CHIP_BG = 'rgba(255, 255, 255, 0.12)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.24)';
const ERROR_ON_DARK = '#FECACA';

/** Sticky-nav height; smooth-scroll, scroll-spy, and the sticky table
 * header all allow for it. */
const NAV_ALLOWANCE = 64;
const SPY_OFFSET = 140;
/** Extra allowance when jumping to a table row group so the sticky
 * table header row does not cover the group label. */
const TABLE_HEADER_ALLOWANCE = 56;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Bands paint full-bleed; each centers this column.
  bandInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  bandInnerCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  bandMuted: {
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
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
    maxHeight: 'calc(100vh - 120px)',
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
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
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
  heroBoard: {
    flex: '1 1 0',
    minWidth: 0,
  },
  heroHeadline: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 30,
  },
  heroVs: {
    color: BRAND_ACCENT,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 540,
    margin: 0,
  },
  // ---- head-to-head scoreboard (signature hero moment) ----
  board: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  boardCount: {
    fontSize: 40,
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
  },
  filterChipActive: {
    borderColor: ACCENT_TINT_BORDER,
    backgroundColor: ACCENT_TINT_STRONG,
    color: BRAND_ACCENT,
  },
  tableScroll: {
    overflowX: 'auto',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
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
  // ---- why-switch stat cards ----
  statNumber: {
    fontSize: 40,
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
  // ---- migration timeline ----
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
  },
  stepIndex: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: BRAND_ACCENT,
  },
  // Scheme-locked terminal pane (see Color policy).
  terminal: {
    colorScheme: 'dark',
    borderRadius: 12,
    backgroundColor: '#0B1220',
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: '#A5F3FC',
    flexWrap: 'wrap',
  },
  terminalCommand: {
    flex: '1 1 260px',
    minWidth: 0,
    overflowWrap: 'anywhere',
    margin: 0,
  },
  // ---- switcher testimonial (scheme-locked dark band) ----
  testimonialBand: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 90% at 100% 0%, rgba(37, 71, 208, 0.45), transparent 55%)',
      'linear-gradient(135deg, #0B1220 0%, #1E1B4B 100%)',
    ].join(', '),
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
    border: `1px solid ${CHIP_BORDER}`,
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
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  priceCardOurs: {
    borderColor: ACCENT_TINT_BORDER,
    boxShadow: `0 0 0 1px ${ACCENT_TINT_BORDER}`,
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
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(70% 80% at 50% 0%, rgba(37, 71, 208, 0.5), transparent 60%)',
      'linear-gradient(180deg, #0B1220 0%, #14163A 100%)',
    ].join(', '),
  },
  ctaHeadline: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  ctaHeadlineCompact: {
    fontSize: 24,
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
    border: `1px solid ${CHIP_BORDER}`,
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
 * Measure the page's own width (ResizeObserver) — the inline demo stage
 * is ~1045px wide, so viewport media queries never fire there.
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

/** Read prefers-reduced-motion once; gates reveals, count-ups, bars. */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return prefersReduced;
}

/** Fire-once in-view flag; starts true when motion is disabled. */
function useInViewOnce(
  ref: RefObject<HTMLElement | null>,
  isDisabled: boolean,
): boolean {
  const [isInView, setIsInView] = useState(isDisabled);
  useEffect(() => {
    if (isInView) {
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
  }, [isInView, ref]);
  return isInView;
}

/** Ease-out count-up; renders the final value under reduced motion. */
function useCountUp(
  target: number,
  isActive: boolean,
  isReduced: boolean,
): number {
  const [value, setValue] = useState(() => (isReduced ? target : 0));
  useEffect(() => {
    if (isReduced || !isActive) {
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
  return value;
}

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get the checklist.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
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
  buttonRef?: React.Ref<HTMLButtonElement>;
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

/** Fire-once scroll reveal: rise 12px + fade, disabled by reduced motion. */
function Reveal({
  children,
  delayMs = 0,
  style,
}: {
  children: ReactNode;
  delayMs?: number;
  style?: CSSProperties;
}) {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInViewOnce(ref, prefersReduced);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : 'translateY(12px)',
        transition: prefersReduced
          ? undefined
          : `opacity 480ms ease-out ${delayMs}ms, transform 480ms ease-out ${delayMs}ms`,
      }}>
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
                aria-label={`Footnote ${cell.footnote}`}
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

/** Why-switch stat card: count-up stat fires on first view. */
function SwitchReasonCard({
  reason,
  delayMs,
}: {
  reason: SwitchReason;
  delayMs: number;
}) {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInViewOnce(ref, prefersReduced);
  const value = useCountUp(reason.statValue, isInView, prefersReduced);
  return (
    <div
      ref={ref}
      style={{
        height: '100%',
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : 'translateY(12px)',
        transition: prefersReduced
          ? undefined
          : `opacity 480ms ease-out ${delayMs}ms, transform 480ms ease-out ${delayMs}ms`,
      }}>
      <Card padding={5} height="100%">
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
 * and whose bars fill on first view. Derived from COMPARE_ROWS.
 */
function VerdictBoard() {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInViewOnce(ref, prefersReduced);
  const wins = useCountUp(TALLY.northbeam, isInView, prefersReduced);
  const total = COMPARE_ROWS.length;
  const rows: readonly {label: string; count: number; fill: string}[] = [
    {
      label: `${BRAND.name} leads`,
      count: TALLY.northbeam,
      fill: BRAND_ACCENT,
    },
    {
      label: 'Tied',
      count: TALLY.tied,
      fill: 'var(--color-border-strong, light-dark(#9CA3AF, #6B7280))',
    },
    {
      label: `${BRAND.rival} leads`,
      count: TALLY.gridware,
      fill: 'var(--color-warning, light-dark(#92400E, #FCD34D))',
    },
  ];
  return (
    <div ref={ref} style={styles.board}>
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
                  width: isInView ? `${(row.count / total) * 100}%` : '0%',
                  transition: prefersReduced ? 'none' : styles.boardFill.transition,
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

// ============= PAGE =============

export default function ProductComparisonLandingTemplate() {
  const prefersReduced = usePrefersReducedMotion();

  // ---- element-width responsive contract ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 900;
  const isStacked = wrapWidth > 0 && wrapWidth <= 780;
  const isTableCompact = wrapWidth > 0 && wrapWidth <= 720;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;

  // ---- scroll plumbing ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<JumpId, HTMLElement | null>>>({});
  const categoryRowRefs = useRef<Partial<Record<CategoryId, HTMLTableRowElement | null>>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- nav menu (compact widths) ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- comparison table ----
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

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

  const scrollBehavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

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

  /** Scroll-spy: the last nav anchor above the fold line wins. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const containerRect = container.getBoundingClientRect();
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (section == null) {
        continue;
      }
      const top =
        section.getBoundingClientRect().top - containerRect.top;
      if (top <= SPY_OFFSET) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
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

  // ============= NAVBAR =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Primary">
      <div style={styles.navInner}>
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
          <Button
            label="Migrate in a weekend"
            variant="primary"
            size="sm"
            onClick={() => jumpToSection('migration')}
          />
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

  // ============= HERO =============

  const hero = (
    <header>
      <div style={bandInnerStyle}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Token label="Switching guide" size="sm" color="purple" />
              <Badge variant="neutral" label="Updated June 2026" />
            </HStack>
            <h1
              style={{
                ...styles.heroHeadline,
                ...(isPhone ? styles.heroHeadlineCompact : null),
              }}>
              {BRAND.name} <span style={styles.heroVs}>vs</span> {BRAND.rival}
            </h1>
            <p style={styles.heroSubcopy}>{HERO.verdict}</p>
            <p style={{...styles.heroSubcopy, fontSize: 15}}>{HERO.subcopy}</p>
            <HStack gap={2} wrap="wrap">
              <Button
                label="Migrate in a weekend"
                variant="primary"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('migration')}
              />
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
          </div>
        </div>
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
            width: '33%',
          }}>
          <VStack gap={0}>
            <HStack gap={1} vAlign="center">
              <Text type="label">{BRAND.name}</Text>
              <Badge variant="success" label={`${TALLY.northbeam} wins`} />
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
            key={`group-${category.id}`}
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
            <Token label="The receipts" size="sm" color="purple" />
            <Heading level={2}>
              Twelve dimensions, two columns, three footnotes
            </Heading>
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
      <div style={bandInnerStyle}>
        <Reveal>
          <VStack gap={2} hAlign="center">
            <Token label="Why teams switch" size="sm" color="purple" />
            <Heading level={2}>The three numbers that close the debate</Heading>
            <Text type="supporting" color="secondary" justify="center">
              From our 2026 switching survey (63 teams) and the May 2026
              public benchmark — methodology in the footnotes.
            </Text>
          </VStack>
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

  const migrationSection = (
    <section ref={registerSection('migration')} aria-label="Migration path">
      <div style={bandInnerStyle}>
        <Reveal>
          <VStack gap={2} hAlign="center">
            <Token label="The weekend plan" size="sm" color="purple" />
            <Heading level={2}>Export Friday, verify Monday</Heading>
            <Text type="supporting" color="secondary" justify="center">
              Four steps, one command, and a migration engineer on the call
              for workspaces above 20 seats.
            </Text>
          </VStack>
        </Reveal>
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

  // ============= SWITCHER TESTIMONIAL =============

  const testimonialSection = (
    <section style={styles.testimonialBand} aria-label="Switcher story">
      <div style={bandInnerStyle}>
        <Reveal>
          <VStack gap={4}>
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
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ============= HONEST CALLOUT + PRICING =============

  const honestCallout = (
    <Reveal>
      <Card padding={5}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <div style={styles.statGlyph} aria-hidden="true">
              <Icon icon={ScaleIcon} size="sm" color="inherit" />
            </div>
            <Heading level={3}>When {BRAND.rival} is a better fit</Heading>
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
  );

  const pricingSection = (
    <section
      ref={registerSection('pricing')}
      style={styles.bandMuted}
      aria-label="Pricing at a glance">
      <div style={bandInnerStyle}>
        <Reveal>
          <VStack gap={2} hAlign="center">
            <Token label="Pricing at a glance" size="sm" color="purple" />
            <Heading level={2}>One flat number vs four tiers of maybe</Heading>
          </VStack>
        </Reveal>
        <Grid columns={{minWidth: 260, repeat: 'fit', max: 2}} gap={4}>
          {PRICE_CARDS.map((card, index) => (
            <Reveal key={card.id} delayMs={index * 90} style={{height: '100%'}}>
              <Card
                padding={5}
                height="100%"
                style={card.id === 'northbeam' ? styles.priceCardOurs : undefined}>
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
                          aria-label={`Footnote ${card.footnote}`}
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
                    <Button
                      label="Start a free 30-day pilot"
                      variant="primary"
                      onClick={() => jumpToSection('cta')}
                    />
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
            <Token label="Switching FAQ" size="sm" color="purple" />
            <Heading level={2}>The questions renewal season raises</Heading>
          </VStack>
        </Reveal>
        <Card padding={5}>
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
      </div>
    </section>
  );

  // ============= FINAL CTA =============

  const ctaSection = (
    <section
      ref={registerSection('cta')}
      style={styles.ctaBand}
      aria-label="Get the migration checklist">
      <div style={{...bandInnerStyle, alignItems: 'center', textAlign: 'center'}}>
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
              <Button
                label="Send the checklist"
                variant="primary"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={submitEmail}
              />
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
      <div style={{...bandInnerStyle, gap: 'var(--spacing-3)'}}>
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
      <div style={bandInnerStyle}>
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
                          : fireToast(`Footer — ${link.label} clicked.`)
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
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Northbeam vs Gridware comparison landing page">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {hero}
              {comparisonSection}
              {whySection}
              {migrationSection}
              {testimonialSection}
              <div style={bandInnerStyle}>{honestCallout}</div>
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
