// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file agency-portfolio-landing.tsx
 * @input Deterministic fixtures only (the fictional "Fathom & Co" product
 *   design studio: eight invented client monograms for the hero marquee,
 *   four case studies each with a gradient art composition, an outcome
 *   metric chip, and a full challenge/approach/results panel with a
 *   three-metric trio, three capability groups with sub-bullets, four
 *   process steps with week ranges, three invented publication quotes,
 *   six team members, and an availability card with budget/timeline
 *   Selector options for the inquiry form)
 * @output Full studio marketing page: sticky navbar (brand mark, four
 *   smooth-scrolling anchor links with scroll-spy, Start-a-project CTA;
 *   collapses to a menu button + dropdown at compact widths), an
 *   oversized statement hero above a client-monogram marquee that loops
 *   with a slow CSS animation (pauses on hover, static strip under
 *   reduced motion), a 4-card case-study grid whose cards reveal a
 *   "View case" overlay on hover/focus and expand an inline case panel
 *   with challenge/approach/results rows and a count-up metric trio, a
 *   two-column capabilities list, a tinted process band with week
 *   ranges, a selected-press quote row, a team strip, and an
 *   availability card beside a validating project-inquiry mini-form
 *   (budget Selector, timeline Selector, email) that flips to a success
 *   state. Scroll-reveals rise+fade sections in once; outcome chips
 *   count up on first view; everything is gated by
 *   prefers-reduced-motion.
 * @position Page template; emitted by `astryx template
 *   agency-portfolio-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its
 * own chrome, so there is no LayoutHeader. LayoutContent (padding 0)
 * hosts a single scroll container div that owns scroll-spy; the navbar
 * inside it is position:sticky top:0. Sections sit in a centered 1100px
 * column; the capabilities, studio, and process bands paint full-bleed
 * tints behind their columns, alternating with plain bands. The whole
 * page is wrapped in a measured div (useElementWidth ResizeObserver)
 * because the inline demo stage is ~1045px wide and viewport media
 * queries only fire in the separate 390px phone iframe.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll the container to real
 *   section ids with a sticky-nav allowance; onScroll spies the last
 *   anchor above the fold line and highlights the matching link
 *   (aria-current). The compact menu closes on Escape (refocusing its
 *   trigger), outside pointerdown, or any selection.
 * - The hero marquee is the signature moment: a duplicated monogram
 *   strip translates -50% on a 44s linear loop, pauses on hover, and
 *   renders as a static wrapped strip under reduced motion.
 * - Case cards are real buttons: hover/focus fades in a "View case"
 *   overlay pill, click expands the inline case panel below the grid
 *   (challenge / approach / results rows + a metric trio that counts up
 *   on open); clicking the open card or the panel's X collapses it.
 * - Section blocks reveal once via IntersectionObserver (rise+fade
 *   12px); outcome chips count up the first time their card is seen.
 *   Under prefers-reduced-motion reveals render visible and every
 *   counter renders its final value.
 * - The inquiry form validates budget (required), timeline (required),
 *   and email (regex) with inline error text on submit, and success
 *   swaps the form for a confirmation card with a "Send another
 *   inquiry" reset. Footer links that would leave the page are no-ops.
 *
 * Color policy: token-pure with ONE quarantined accent literal (the
 * terracotta studio accent, declared once as light-dark() with contrast
 * math) plus scheme-locked brand-art gradients: client monogram tiles
 * and case-study art panels carry literal hue gradients inside
 * colorScheme:'dark' surfaces so the invented brand art reads
 * identically in both app themes. No network images, no real logos.
 *
 * Responsive contract (element-width breakpoints on the page wrapper):
 * - >940px: case grid 2-up, capabilities split intro/groups, process
 *   4-up, team 6-up, press 3-up, contact split card/form.
 * - <=940px: capabilities stack, process drops to 2-up, team to 3-up.
 * - <=880px: nav links collapse behind a 40px menu button + dropdown.
 * - <=700px: case grid, press row, and the contact split stack to one
 *   column; footer columns stack; headline steps down.
 * - <=480px: process and metric trio go single column, team 2-up, the
 *   budget/timeline selects stack, type steps down again; the page
 *   holds at 390px in the phone artboard with no overflow-x.
 * - Tap targets: nav links, menu button, and case cards are generous;
 *   nothing on the page requires hover (the overlay also shows on
 *   focus, and click always works without it).
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CodeXmlIcon,
  CompassIcon,
  LightbulbIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PenToolIcon,
  QuoteIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// ONE quarantined accent literal (terracotta — the studio's personality).
// Contrast math: #9C4A26 on white body (#FFF, L 1.0): L(#9C4A26)≈0.121 →
// (1.05)/(0.171) ≈ 6.1:1 (AA for normal text). #F0946B on dark body
// (~#141414, L≈0.011): L(#F0946B)≈0.405 → (0.455)/(0.061) ≈ 7.5:1 (AAA).
const ACCENT = 'light-dark(#9C4A26, #F0946B)';
// Low-alpha tints derived from the same accent pair; text on these tints
// is always ACCENT or a body token, never a new literal.
const ACCENT_TINT = 'light-dark(rgba(156, 74, 38, 0.10), rgba(240, 148, 107, 0.14))';
const ACCENT_BORDER = 'light-dark(rgba(156, 74, 38, 0.32), rgba(240, 148, 107, 0.38))';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 140;

// Scoped stylesheet: the marquee loop, its hover-pause, and the case-card
// hover overlay need pseudo-class selectors that inline styles can't do.
const SCOPE = 'fac-root';

const TEMPLATE_CSS = `
@keyframes fac-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.${SCOPE} .fac-marquee-track {
  display: flex;
  width: max-content;
  animation: fac-marquee 44s linear infinite;
}
.${SCOPE} .fac-marquee:hover .fac-marquee-track {
  animation-play-state: paused;
}
.${SCOPE} .fac-case {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.${SCOPE} .fac-case:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-med);
}
.${SCOPE} .fac-case-overlay {
  opacity: 0;
  transition: opacity 0.18s ease;
}
.${SCOPE} .fac-case:hover .fac-case-overlay,
.${SCOPE} .fac-case:focus-visible .fac-case-overlay {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} .fac-marquee-track { animation: none; }
  .${SCOPE} .fac-case { transition: none; }
  .${SCOPE} .fac-case:hover { transform: none; }
  .${SCOPE} .fac-case-overlay { transition: none; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy and hosts the sticky navbar.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered document column; tinted bands bleed outside it.
  column: {
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  section: {
    paddingBlock: 'var(--spacing-9)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  sectionCompact: {
    paddingBlock: 'var(--spacing-7)',
    gap: 'var(--spacing-5)',
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
    minHeight: 60,
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
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
  navLinkActive: {
    color: ACCENT,
    backgroundColor: ACCENT_TINT,
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
  menuPanel: {
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
  // ---- section furniture ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
    margin: 0,
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionTitleCompact: {
    fontSize: 26,
  },
  // ---- hero ----
  hero: {
    paddingTop: 'var(--spacing-9)',
    paddingBottom: 'var(--spacing-7)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
    maxWidth: 860,
  },
  heroHeadline: {
    fontSize: 58,
    fontWeight: 700,
    lineHeight: 1.06,
    letterSpacing: '-0.028em',
    margin: 0,
  },
  heroHeadlineMid: {
    fontSize: 42,
  },
  heroHeadlinePhone: {
    fontSize: 32,
  },
  heroAccentWord: {
    color: ACCENT,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: 620,
    margin: 0,
  },
  availabilityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    flexShrink: 0,
  },
  // ---- client marquee ----
  marqueeBand: {
    borderBlock: '1px solid var(--color-border)',
    paddingBlock: 'var(--spacing-4)',
    overflow: 'hidden',
  },
  marquee: {
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
  },
  marqueeStatic: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 'var(--spacing-3)',
  },
  clientTile: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginRight: 'var(--spacing-7)',
    whiteSpace: 'nowrap',
  },
  // Scheme-locked brand art (see Color policy): invented client gradients
  // read identically in both app themes; monogram text is white on them.
  clientMonogram: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)',
  },
  // ---- case-study grid ----
  caseGrid: {
    display: 'grid',
    gap: 'var(--spacing-5)',
  },
  caseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    width: '100%',
    padding: 0,
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  caseCardExpanded: {
    borderColor: ACCENT_BORDER,
    boxShadow: `0 0 0 1px ${ACCENT_BORDER}`,
  },
  caseArt: {
    position: 'relative',
    height: 210,
    colorScheme: 'dark',
    overflow: 'hidden',
  },
  caseArtPhone: {
    height: 160,
  },
  // Translucent schematic shapes painted over the locked gradient.
  caseArtWindow: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  caseArtBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  caseArtGhostMonogram: {
    position: 'absolute',
    right: 14,
    bottom: -18,
    fontSize: 110,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: 'rgba(255, 255, 255, 0.20)',
    userSelect: 'none',
  },
  caseOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 12, 16, 0.38)',
  },
  caseOverlayPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingInline: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: '#1A1D21',
    fontSize: 13,
    fontWeight: 700,
  },
  caseBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
  },
  caseTitle: {
    fontSize: 19,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  metricChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    alignSelf: 'flex-start',
    paddingInline: 10,
    borderRadius: 999,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- inline case panel ----
  casePanel: {
    borderRadius: 16,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  casePanelCompact: {
    padding: 'var(--spacing-4)',
  },
  caseFactRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  caseFactRowStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  caseFactLabel: {
    width: 110,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    paddingTop: 3,
  },
  metricTrio: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  metricCell: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.15,
  },
  // ---- capabilities ----
  capabilitiesBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  capabilitiesRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  capabilitiesRowStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  capabilitiesIntro: {
    flex: '0 1 380px',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  capabilitiesGroups: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  capabilityGroup: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  capabilityGlyph: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
  },
  capabilityBullets: {
    margin: 0,
    paddingLeft: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    color: 'var(--color-text-secondary)',
    fontSize: 14.5,
    lineHeight: 1.55,
  },
  // ---- process band ----
  processBand: {
    backgroundColor: ACCENT_TINT,
    borderBlock: `1px solid ${ACCENT_BORDER}`,
  },
  processGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  processCell: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  processIndex: {
    fontSize: 13,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
    letterSpacing: '0.06em',
  },
  // ---- press ----
  pressGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  pressCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  pressQuote: {
    fontSize: 16.5,
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '-0.005em',
    margin: 0,
  },
  // ---- studio / team ----
  studioBand: {
    backgroundColor: 'var(--color-background-muted)',
    borderBlock: '1px solid var(--color-border)',
  },
  teamGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  teamCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  teamMonogram: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    fontSize: 17,
    fontWeight: 700,
  },
  // ---- contact / inquiry ----
  contactRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
  },
  contactRowStacked: {
    flexDirection: 'column',
  },
  availabilityCard: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 16,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: ACCENT_TINT,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  inquiryCard: {
    flex: '1.25 1 0',
    minWidth: 0,
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  selectRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
  },
  selectRowStacked: {
    flexDirection: 'column',
  },
  formError: {
    fontSize: 13,
    margin: 0,
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  monoRow: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13.5,
    color: 'var(--color-text-primary)',
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  footerInner: {
    paddingBlock: 'var(--spacing-7)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerColumns: {
    display: 'flex',
    gap: 'var(--spacing-7)',
    alignItems: 'flex-start',
  },
  footerColumnsStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
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
};

// ============= DATA =============
// Deterministic fixtures for the fictional Fathom & Co design studio.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Fathom & Co',
  descriptor: 'Product design studio',
  email: 'hello@fathomand.co',
  cities: 'Portland · Lisbon',
};

type SectionId = 'work' | 'capabilities' | 'process' | 'studio' | 'contact';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'work', label: 'Work'},
  {id: 'capabilities', label: 'Capabilities'},
  {id: 'process', label: 'Process'},
  {id: 'studio', label: 'Studio'},
];

// Scheme-locked brand art (see Color policy): invented client gradients.
interface Client {
  id: string;
  name: string;
  monogram: string;
  gradient: string;
}

const CLIENTS: readonly Client[] = [
  {id: 'meridian', name: 'MERIDIAN HEALTH', monogram: 'MH', gradient: 'linear-gradient(135deg, #0D9488 0%, #1D4ED8 100%)'},
  {id: 'copperline', name: 'COPPERLINE', monogram: 'CL', gradient: 'linear-gradient(135deg, #B45309 0%, #7C2D12 100%)'},
  {id: 'atlas', name: 'ATLAS FREIGHT', monogram: 'AF', gradient: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'},
  {id: 'bloom', name: 'BLOOM & ROOT', monogram: 'BR', gradient: 'linear-gradient(135deg, #15803D 0%, #365314 100%)'},
  {id: 'halcyon', name: 'HALCYON LABS', monogram: 'HL', gradient: 'linear-gradient(135deg, #0E7490 0%, #155E75 100%)'},
  {id: 'wavemark', name: 'WAVEMARK', monogram: 'WM', gradient: 'linear-gradient(135deg, #2563EB 0%, #0F766E 100%)'},
  {id: 'quill', name: 'QUILL & LEDGER', monogram: 'QL', gradient: 'linear-gradient(135deg, #7E22CE 0%, #BE185D 100%)'},
  {id: 'northstar', name: 'NORTHSTAR GRID', monogram: 'NG', gradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)'},
];

interface CaseMetric {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

interface CaseStudy {
  id: string;
  client: string;
  monogram: string;
  sector: string;
  gradient: string;
  title: string;
  outcome: string;
  chip: CaseMetric;
  challenge: string;
  approach: string;
  results: string;
  metrics: readonly [CaseMetric, CaseMetric, CaseMetric];
}

const CASE_STUDIES: readonly CaseStudy[] = [
  {
    id: 'meridian',
    client: 'Meridian Health',
    monogram: 'M',
    sector: 'Healthcare',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #1D4ED8 100%)',
    title: 'Rebuilding a patient portal 2.4M people depend on',
    outcome:
      'Portal activation climbed 38% in the first quarter after relaunch — without a single support-script rewrite.',
    chip: {prefix: '+', value: 38, decimals: 0, suffix: '%', label: 'activation'},
    challenge:
      'Meridian’s portal had grown into 14 disconnected flows across three vendor systems. Activation sat at 31%, and 4 of the top 5 call-center drivers were "how do I log in" variants.',
    approach:
      'A four-person pod ran two weeks of call-center ridealongs, cut the IA from 14 flows to 5 jobs, and rebuilt the shell as a design system the in-house team now owns. We shipped weekly to a 2,000-patient beta ring instead of presenting decks.',
    results:
      'Activation reached 43% within one quarter (from 31%), password-related tickets fell by 41%, and Meridian’s team shipped their first independent feature on the new system three weeks after handoff.',
    metrics: [
      {prefix: '+', value: 38, decimals: 0, suffix: '%', label: 'portal activation'},
      {prefix: '−', value: 41, decimals: 0, suffix: '%', label: 'login support tickets'},
      {prefix: '', value: 11, decimals: 0, suffix: ' wk', label: 'kickoff to relaunch'},
    ],
  },
  {
    id: 'copperline',
    client: 'Copperline',
    monogram: 'C',
    sector: 'Fintech',
    gradient: 'linear-gradient(135deg, #B45309 0%, #7C2D12 100%)',
    title: 'Onboarding that stopped losing customers at step three',
    outcome:
      'Application drop-off fell 52% after we collapsed nine KYC screens into three honest ones.',
    chip: {prefix: '−', value: 52, decimals: 0, suffix: '%', label: 'drop-off'},
    challenge:
      'Copperline’s business-banking signup lost 68% of applicants between identity verification and funding. Compliance had bolted nine screens onto a flow designed for four.',
    approach:
      'We mapped every KYC requirement with their compliance counsel before touching a screen, then merged collection into three steps with inline document capture and a progress contract ("about 6 minutes, 3 things to hand us"). Prototypes were tested with 22 real applicants.',
    results:
      'Drop-off between verification and funding fell from 68% to 33%, median time-to-funded-account went from 3.1 days to same-day for 71% of applicants, and the flow passed its next audit unchanged.',
    metrics: [
      {prefix: '−', value: 52, decimals: 0, suffix: '%', label: 'signup drop-off'},
      {prefix: '', value: 71, decimals: 0, suffix: '%', label: 'funded same-day'},
      {prefix: '', value: 9, decimals: 0, suffix: ' wk', label: 'engagement length'},
    ],
  },
  {
    id: 'atlas',
    client: 'Atlas Freight',
    monogram: 'A',
    sector: 'Logistics',
    gradient: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
    title: 'A dispatch console that keeps 1,400 trucks moving',
    outcome:
      'Dispatchers assign loads 2.1× faster on a console designed in the cab, not the conference room.',
    chip: {prefix: '', value: 2.1, decimals: 1, suffix: '×', label: 'faster dispatch'},
    challenge:
      'Atlas dispatchers juggled three monitors, a radio, and a spreadsheet to cover 1,400 trucks. Load assignment averaged 4 minutes 20 seconds, and every new hire took a quarter to reach speed.',
    approach:
      'Two designers and a design engineer spent week one in the Reno dispatch bay. We rebuilt the console around one queue with keyboard-first triage, exception-only alerting, and a map that answers "who’s closest and legal" in a keystroke.',
    results:
      'Median assignment time dropped to 2 minutes 2 seconds (2.1× faster), new-dispatcher ramp went from 13 weeks to 5, and dispatcher NPS — measured internally — rose 19 points in two months.',
    metrics: [
      {prefix: '', value: 2.1, decimals: 1, suffix: '×', label: 'faster load assignment'},
      {prefix: '+', value: 19, decimals: 0, suffix: ' pts', label: 'dispatcher NPS'},
      {prefix: '', value: 14, decimals: 0, suffix: ' wk', label: 'discovery to rollout'},
    ],
  },
  {
    id: 'bloom',
    client: 'Bloom & Root',
    monogram: 'B',
    sector: 'Commerce',
    gradient: 'linear-gradient(135deg, #15803D 0%, #365314 100%)',
    title: 'Replatforming a DTC brand without losing its soul',
    outcome:
      'Average order value rose 27% after the replatform — with the brand’s hand-drawn character intact.',
    chip: {prefix: '+', value: 27, decimals: 0, suffix: '%', label: 'AOV'},
    challenge:
      'Bloom & Root’s custom storefront was charming and unmaintainable: 11-second product pages, a checkout that failed on older phones, and a founder terrified a replatform would sand off the brand.',
    approach:
      'We treated the illustration system as a first-class design token — codifying the hand-drawn rules into components — while our engineers rebuilt the storefront on a modern stack. Bundling and a "grow the pot" cross-sell pattern came out of 14 customer interviews.',
    results:
      'Product pages now render in 1.8 seconds, mobile conversion rose 34%, AOV climbed 27% on the strength of honest bundles, and the founder signs off every release against a brand checklist we wrote together.',
    metrics: [
      {prefix: '+', value: 27, decimals: 0, suffix: '%', label: 'average order value'},
      {prefix: '+', value: 34, decimals: 0, suffix: '%', label: 'mobile conversion'},
      {prefix: '', value: 12, decimals: 0, suffix: ' wk', label: 'replatform, end to end'},
    ],
  },
];

interface CapabilityGroup {
  id: string;
  icon: Glyph;
  title: string;
  bullets: readonly string[];
}

const CAPABILITY_GROUPS: readonly CapabilityGroup[] = [
  {
    id: 'strategy',
    icon: LightbulbIcon,
    title: 'Strategy',
    bullets: [
      'Product positioning and narrative',
      'Discovery research, field studies, ridealongs',
      'Roadmap shaping and honest scope cuts',
      'Design and conversion audits',
    ],
  },
  {
    id: 'design',
    icon: PenToolIcon,
    title: 'Design',
    bullets: [
      'End-to-end product design, zero to shipped',
      'Design systems and component libraries',
      'High-fidelity prototypes people can actually use',
      'Brand-in-product: voice, illustration, motion',
    ],
  },
  {
    id: 'engineering',
    icon: CodeXmlIcon,
    title: 'Engineering',
    bullets: [
      'Design engineering in React and TypeScript',
      'Production front-end builds, not throwaways',
      'Interaction and motion implementation',
      'Handoffs your team can maintain on day one',
    ],
  },
];

const PROCESS_STEPS: readonly {
  id: string;
  index: string;
  title: string;
  weeks: string;
  copy: string;
}[] = [
  {
    id: 'discover',
    index: '01',
    title: 'Discover',
    weeks: 'Weeks 1–2',
    copy: 'Stakeholder interviews, field time with real users, and a teardown of what exists. We leave with evidence, not opinions.',
  },
  {
    id: 'define',
    index: '02',
    title: 'Define',
    weeks: 'Weeks 3–4',
    copy: 'One narrative, one scoped release, success metrics signed by both sides. If we can’t measure it, we don’t ship it.',
  },
  {
    id: 'design',
    index: '03',
    title: 'Design',
    weeks: 'Weeks 5–10',
    copy: 'Weekly working prototypes in your stack instead of decks. You react to the product, and the spec writes itself.',
  },
  {
    id: 'deliver',
    index: '04',
    title: 'Deliver',
    weeks: 'Weeks 11–14',
    copy: 'Production front-end, paired handoff sessions, and a system your team owns. We stay on call for the first release after.',
  },
];

const PRESS_QUOTES: readonly {
  id: string;
  quote: string;
  outlet: string;
  detail: string;
}[] = [
  {
    id: 'ledger',
    quote:
      'The rare studio whose engineers design and whose designers ship.',
    outlet: 'Design Ledger',
    detail: 'Studios to Watch, 2026',
  },
  {
    id: 'interface-review',
    quote:
      'Fathom & Co’s Meridian work is a masterclass in unglamorous, high-stakes UX.',
    outlet: 'The Interface Review',
    detail: 'Case-study feature, Mar 2026',
  },
  {
    id: 'annual',
    quote: 'Small on purpose — and measurably better for it.',
    outlet: 'Studio Annual',
    detail: '2025 edition, profile',
  },
];

const TEAM: readonly {
  id: string;
  name: string;
  initials: string;
  role: string;
}[] = [
  {id: 'ada', name: 'Ada Fenwick', initials: 'AF', role: 'Principal, Strategy'},
  {id: 'jonah', name: 'Jonah Marsh', initials: 'JM', role: 'Design Director'},
  {id: 'priya', name: 'Priya Raghavan', initials: 'PR', role: 'Staff Product Designer'},
  {id: 'tomas', name: 'Tomás Ibarra', initials: 'TI', role: 'Design Engineer'},
  {id: 'lena', name: 'Lena Okafor', initials: 'LO', role: 'Design Engineer'},
  {id: 'miles', name: 'Miles Dutton', initials: 'MD', role: 'Producer & Ops'},
];

const BUDGET_OPTIONS: readonly string[] = [
  '$25k – $50k',
  '$50k – $100k',
  '$100k – $250k',
  '$250k+',
];

const TIMELINE_OPTIONS: readonly string[] = [
  'As soon as possible',
  'Next 1–2 months',
  'This quarter',
  'Just exploring',
];

const AVAILABILITY = {
  window: 'Booking Q4 2026',
  slots: '2 slots left',
  note:
    'We take four engagements a year so senior people do the work — no bait-and-switch staffing. Inquiries get a reply from a principal within two business days.',
};

// ============= HELPERS =============

/**
 * Measures the page's own width — the inline demo stage is ~1045px wide,
 * so viewport media queries never fire there; a ResizeObserver does.
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

/** Tracks prefers-reduced-motion; reveals and counters gate on it. */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefersReduced;
}

/** Fires once when the element first intersects; reduced motion = instant. */
function useRevealOnce(reduced: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isRevealed: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => {
    if (isRevealed) {
      return undefined;
    }
    if (reduced) {
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
  }, [reduced, isRevealed]);
  return {ref, isRevealed};
}

/** Eased count-up toward target once active; reduced motion snaps to it. */
function useCountUp(
  target: number,
  isActive: boolean,
  reduced: boolean,
  durationMs = 1300,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reduced) {
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
  }, [target, isActive, reduced, durationMs]);
  return value;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter an email so we can reply.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'That doesn’t look like an email address.';
  }
  return null;
}

// ============= SMALL PIECES =============

/** Fathom & Co brand mark: accent monogram tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={CompassIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        <Text type="supporting" color="secondary">
          {BRAND.descriptor}
        </Text>
      </VStack>
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

/** Uppercase tracked eyebrow + section title pair. */
function SectionHeading({
  eyebrow,
  title,
  isCompact,
}: {
  eyebrow: string;
  title: string;
  isCompact: boolean;
}) {
  return (
    <VStack gap={2}>
      <p style={styles.eyebrow}>{eyebrow}</p>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isCompact ? styles.sectionTitleCompact : null),
        }}>
        {title}
      </h2>
    </VStack>
  );
}

/** Rise+fade scroll reveal; renders visible under reduced motion. */
function Reveal({
  reduced,
  delayMs = 0,
  children,
}: {
  reduced: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const {ref, isRevealed} = useRevealOnce(reduced);
  return (
    <div
      ref={ref}
      style={
        reduced
          ? undefined
          : {
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms`,
            }
      }>
      {children}
    </div>
  );
}

/** Formatted count-up number (chips and the case-panel metric trio). */
function CountUpValue({
  metric,
  isActive,
  reduced,
}: {
  metric: CaseMetric;
  isActive: boolean;
  reduced: boolean;
}) {
  const value = useCountUp(metric.value, isActive, reduced);
  return (
    <>
      {metric.prefix}
      {value.toFixed(metric.decimals)}
      {metric.suffix}
    </>
  );
}

/** One client tile inside the marquee (or the static reduced strip). */
function ClientTile({client, isHidden}: {client: Client; isHidden: boolean}) {
  return (
    <div style={styles.clientTile} aria-hidden={isHidden || undefined}>
      <div
        style={{...styles.clientMonogram, background: client.gradient}}
        aria-hidden="true">
        {client.monogram}
      </div>
      <span style={styles.clientName}>{client.name}</span>
    </div>
  );
}

/** Schematic art over the locked case gradient — no network imagery. */
function CaseArt({
  study,
  isPhone,
}: {
  study: CaseStudy;
  isPhone: boolean;
}) {
  return (
    <div
      style={{
        ...styles.caseArt,
        ...(isPhone ? styles.caseArtPhone : null),
        background: study.gradient,
      }}
      aria-hidden="true">
      <div
        style={{
          ...styles.caseArtWindow,
          top: 22,
          left: 22,
          width: '46%',
        }}>
        <div style={{...styles.caseArtBar, width: '78%'}} />
        <div style={{...styles.caseArtBar, width: '58%', opacity: 0.75}} />
        <div style={{...styles.caseArtBar, width: '86%', opacity: 0.5}} />
      </div>
      <div
        style={{
          ...styles.caseArtWindow,
          top: isPhone ? 64 : 96,
          left: '38%',
          width: '34%',
        }}>
        <div style={{...styles.caseArtBar, width: '64%'}} />
        <div style={{...styles.caseArtBar, width: '84%', opacity: 0.6}} />
      </div>
      <span style={styles.caseArtGhostMonogram}>{study.monogram}</span>
      <div className="fac-case-overlay" style={styles.caseOverlay}>
        <span style={styles.caseOverlayPill}>
          View case
          <Icon icon={ArrowUpRightIcon} size="sm" color="inherit" />
        </span>
      </div>
    </div>
  );
}

/** Case card: reveal-on-scroll wrapper, count-up chip, expand toggle. */
function CaseCard({
  study,
  isExpanded,
  onToggle,
  reduced,
  isPhone,
  delayMs,
}: {
  study: CaseStudy;
  isExpanded: boolean;
  onToggle: () => void;
  reduced: boolean;
  isPhone: boolean;
  delayMs: number;
}) {
  const {ref, isRevealed} = useRevealOnce(reduced);
  return (
    <div
      ref={ref}
      style={
        reduced
          ? undefined
          : {
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms`,
            }
      }>
      <button
        type="button"
        className="fac-case"
        aria-expanded={isExpanded}
        onClick={onToggle}
        style={{
          ...styles.caseCard,
          ...(isExpanded ? styles.caseCardExpanded : null),
        }}>
        <CaseArt study={study} isPhone={isPhone} />
        <div style={styles.caseBody}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="supporting" color="secondary" weight="semibold">
              {study.client}
            </Text>
            <Badge variant="neutral" label={study.sector} />
          </HStack>
          <h3 style={styles.caseTitle}>{study.title}</h3>
          <Text type="supporting" color="secondary">
            {study.outcome}
          </Text>
          <span style={styles.metricChip}>
            <CountUpValue
              metric={study.chip}
              isActive={isRevealed}
              reduced={reduced}
            />
            <span style={{fontWeight: 600}}>{study.chip.label}</span>
          </span>
        </div>
      </button>
    </div>
  );
}

/** Inline expanded case panel: fact rows + count-up metric trio. */
function CasePanel({
  study,
  onClose,
  reduced,
  isStacked,
  isPhone,
}: {
  study: CaseStudy;
  onClose: () => void;
  reduced: boolean;
  isStacked: boolean;
  isPhone: boolean;
}) {
  const facts: readonly {label: string; copy: string}[] = [
    {label: 'Challenge', copy: study.challenge},
    {label: 'Approach', copy: study.approach},
    {label: 'Results', copy: study.results},
  ];
  return (
    <div
      style={{
        ...styles.casePanel,
        ...(isStacked ? styles.casePanelCompact : null),
      }}
      role="region"
      aria-label={`${study.client} case study details`}>
      <HStack gap={3} vAlign="start">
        <StackItem size="fill">
          <VStack gap={1}>
            <p style={styles.eyebrow}>
              {study.client} · {study.sector}
            </p>
            <h3 style={{...styles.caseTitle, fontSize: isStacked ? 19 : 22}}>
              {study.title}
            </h3>
          </VStack>
        </StackItem>
        <IconButton40
          label={`Close ${study.client} case study`}
          icon={XIcon}
          onClick={onClose}
        />
      </HStack>
      <VStack gap={4}>
        {facts.map(fact => (
          <div
            key={fact.label}
            style={{
              ...styles.caseFactRow,
              ...(isStacked ? styles.caseFactRowStacked : null),
            }}>
            <span style={styles.caseFactLabel}>{fact.label}</span>
            <StackItem size="fill">
              <Text type="body" color="secondary">
                {fact.copy}
              </Text>
            </StackItem>
          </div>
        ))}
      </VStack>
      <div
        style={{
          ...styles.metricTrio,
          gridTemplateColumns: isPhone ? '1fr' : 'repeat(3, 1fr)',
        }}>
        {study.metrics.map(metric => (
          <div key={metric.label} style={styles.metricCell}>
            <span style={{...styles.metricValue, color: ACCENT}}>
              <CountUpValue metric={metric} isActive reduced={reduced} />
            </span>
            <Text type="supporting" color="secondary">
              {metric.label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function AgencyPortfolioLandingTemplate() {
  // ---- element-width breakpoints (demo-stage safe) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isMid = wrapWidth > 0 && wrapWidth <= 940;
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 700;
  const isPhone = wrapWidth > 0 && wrapWidth <= 480;

  const reduced = usePrefersReducedMotion();

  // ---- nav: compact menu + scroll-spy ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- case grid ----
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // ---- inquiry form ----
  const [budget, setBudget] = useState<string | undefined>(undefined);
  const [timeline, setTimeline] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

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

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  /** Smooth-scroll the container to a section, under the sticky nav. */
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
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  /** Scroll-spy: the last section above the fold line wins. */
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

  const toggleCase = (id: string) => {
    setExpandedCaseId(previous => (previous === id ? null : id));
  };

  const submitInquiry = () => {
    const nextBudgetError = budget == null ? 'Pick a budget range.' : null;
    const nextTimelineError = timeline == null ? 'Pick a timeline.' : null;
    const nextEmailError = validateEmail(email);
    setBudgetError(nextBudgetError);
    setTimelineError(nextTimelineError);
    setEmailError(nextEmailError);
    if (
      nextBudgetError !== null ||
      nextTimelineError !== null ||
      nextEmailError !== null
    ) {
      return;
    }
    setSubmittedEmail(email.trim());
  };

  const resetInquiry = () => {
    setBudget(undefined);
    setTimeline(undefined);
    setEmail('');
    setBudgetError(null);
    setTimelineError(null);
    setEmailError(null);
    setSubmittedEmail(null);
  };

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isStacked ? styles.columnCompact : null),
  };
  const sectionStyle: CSSProperties = {
    ...styles.section,
    ...(isStacked ? styles.sectionCompact : null),
  };

  const expandedCase =
    expandedCaseId === null
      ? null
      : CASE_STUDIES.find(study => study.id === expandedCaseId) ?? null;

  // ============= CHROME =============

  const navLinks = NAV_ANCHORS.map(anchor => (
    <button
      key={anchor.id}
      type="button"
      style={{
        ...styles.navLink,
        ...(activeSection === anchor.id ? styles.navLinkActive : null),
      }}
      aria-current={activeSection === anchor.id ? 'true' : undefined}
      onClick={() => jumpToSection(anchor.id)}>
      {anchor.label}
    </button>
  ));

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Site">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCompact && (
            <HStack gap={1} hAlign="center">
              {navLinks}
            </HStack>
          )}
        </StackItem>
        {!isNavCompact && (
          <Button
            label="Start a project"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => jumpToSection('contact')}
          />
        )}
        {isNavCompact && (
          <IconButton40
            label={isMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isMenuOpen}
            buttonRef={menuTriggerRef}
            onClick={() => setIsMenuOpen(previous => !previous)}
          />
        )}
        {isNavCompact && isMenuOpen && (
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
              {/* Grid slot stretches the CTA to the panel width. */}
              <div style={{display: 'grid'}}>
                <Button
                  label="Start a project"
                  variant="primary"
                  icon={
                    <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                  }
                  onClick={() => jumpToSection('contact')}
                />
              </div>
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= SECTIONS =============

  const hero = (
    <header style={columnStyle}>
      <div
        style={{
          ...styles.hero,
          ...(isStacked
            ? {paddingTop: 'var(--spacing-7)', paddingBottom: 'var(--spacing-5)'}
            : null),
        }}>
        <p style={styles.eyebrow}>
          Product design studio · Est. 2019 · {BRAND.cities}
        </p>
        <h1
          style={{
            ...styles.heroHeadline,
            ...(isMid ? styles.heroHeadlineMid : null),
            ...(isPhone ? styles.heroHeadlinePhone : null),
          }}>
          We make complex products{' '}
          <span style={styles.heroAccentWord}>feel obvious.</span>
        </h1>
        <p style={styles.heroSubcopy}>
          Fathom & Co is a nine-person studio that partners with funded teams
          to ship the product — strategy through production front-end. Four
          engagements a year. Senior people only. No handoff decks.
        </p>
        <HStack gap={2} wrap="wrap" vAlign="center">
          <Button
            label="Start a project"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => jumpToSection('contact')}
          />
          <Button
            label="See the work"
            variant="secondary"
            onClick={() => jumpToSection('work')}
          />
          <button
            type="button"
            style={styles.availabilityChip}
            onClick={() => jumpToSection('contact')}>
            <span style={styles.availabilityDot} aria-hidden="true" />
            {AVAILABILITY.window} · {AVAILABILITY.slots}
          </button>
        </HStack>
      </div>
    </header>
  );

  // Signature hero moment: the client marquee. Duplicated strip loops via
  // CSS (pauses on hover); reduced motion renders one static wrapped set.
  const marquee = (
    <div style={styles.marqueeBand}>
      <div style={columnStyle}>
        <VStack gap={3}>
          <Text type="supporting" color="secondary" justify="center">
            Trusted by teams who ship
          </Text>
          {reduced ? (
            <div
              style={styles.marqueeStatic}
              aria-label="Clients: Meridian Health, Copperline, Atlas Freight, Bloom & Root, Halcyon Labs, Wavemark, Quill & Ledger, Northstar Grid">
              {CLIENTS.map(client => (
                <ClientTile key={client.id} client={client} isHidden={false} />
              ))}
            </div>
          ) : (
            <div
              className="fac-marquee"
              style={styles.marquee}
              aria-label="Clients: Meridian Health, Copperline, Atlas Freight, Bloom & Root, Halcyon Labs, Wavemark, Quill & Ledger, Northstar Grid">
              <div className="fac-marquee-track">
                {[...CLIENTS, ...CLIENTS].map((client, index) => (
                  <ClientTile
                    key={`${client.id}-${index}`}
                    client={client}
                    isHidden={index >= CLIENTS.length}
                  />
                ))}
              </div>
            </div>
          )}
        </VStack>
      </div>
    </div>
  );

  const workSection = (
    <section
      id="work"
      ref={registerSection('work')}
      style={columnStyle}
      aria-label="Selected work">
      <div style={sectionStyle}>
        <Reveal reduced={reduced}>
          <HStack gap={4} vAlign="end" wrap="wrap">
            <StackItem size="fill">
              <SectionHeading
                eyebrow="Selected work"
                title="Four engagements a year. Here are the last four."
                isCompact={isStacked}
              />
            </StackItem>
            <Text type="supporting" color="secondary">
              Click a case to read how it went.
            </Text>
          </HStack>
        </Reveal>
        <div
          style={{
            ...styles.caseGrid,
            gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr',
          }}>
          {CASE_STUDIES.map((study, index) => (
            <CaseCard
              key={study.id}
              study={study}
              isExpanded={expandedCaseId === study.id}
              onToggle={() => toggleCase(study.id)}
              reduced={reduced}
              isPhone={isPhone}
              delayMs={(index % 2) * 90}
            />
          ))}
        </div>
        {expandedCase !== null && (
          <CasePanel
            study={expandedCase}
            onClose={() => setExpandedCaseId(null)}
            reduced={reduced}
            isStacked={isStacked}
            isPhone={isPhone}
          />
        )}
      </div>
    </section>
  );

  const capabilitiesSection = (
    <div style={styles.capabilitiesBand}>
      <section
        id="capabilities"
        ref={registerSection('capabilities')}
        style={columnStyle}
        aria-label="Capabilities">
        <div style={sectionStyle}>
          <Reveal reduced={reduced}>
            <div
              style={{
                ...styles.capabilitiesRow,
                ...(isMid ? styles.capabilitiesRowStacked : null),
              }}>
              <div style={styles.capabilitiesIntro}>
                <SectionHeading
                  eyebrow="Capabilities"
                  title="Three disciplines, one pod."
                  isCompact={isStacked}
                />
                <Text type="body" color="secondary">
                  Every engagement is staffed as a two-to-four person pod that
                  covers strategy, design, and engineering together — so
                  nothing gets lost in a handoff, because there isn’t
                  one.
                </Text>
              </div>
              <div style={styles.capabilitiesGroups}>
                {CAPABILITY_GROUPS.map((group, index) => (
                  <div key={group.id}>
                    {index > 0 && <Divider />}
                    <div style={styles.capabilityGroup}>
                      <div style={styles.capabilityGlyph} aria-hidden="true">
                        <Icon icon={group.icon} size="sm" color="inherit" />
                      </div>
                      <VStack gap={2}>
                        <Text type="label">{group.title}</Text>
                        <ul style={styles.capabilityBullets}>
                          {group.bullets.map(bullet => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </VStack>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );

  const processSection = (
    <div style={styles.processBand}>
      <section
        id="process"
        ref={registerSection('process')}
        style={columnStyle}
        aria-label="Process">
        <div style={sectionStyle}>
          <Reveal reduced={reduced}>
            <SectionHeading
              eyebrow="Process"
              title="Fourteen weeks, four moves."
              isCompact={isStacked}
            />
          </Reveal>
          <div
            style={{
              ...styles.processGrid,
              gridTemplateColumns: isPhone
                ? '1fr'
                : isMid
                  ? '1fr 1fr'
                  : 'repeat(4, 1fr)',
            }}>
            {PROCESS_STEPS.map((step, index) => (
              <Reveal key={step.id} reduced={reduced} delayMs={index * 80}>
                <div style={styles.processCell}>
                  <HStack gap={2} vAlign="center">
                    <span style={styles.processIndex}>{step.index}</span>
                    <StackItem size="fill">
                      <Text type="label">{step.title}</Text>
                    </StackItem>
                    <Badge variant="neutral" label={step.weeks} />
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {step.copy}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const pressSection = (
    <section style={columnStyle} aria-label="Selected press">
      <div style={sectionStyle}>
        <Reveal reduced={reduced}>
          <SectionHeading
            eyebrow="Selected press"
            title="Kind words from people we don’t pay."
            isCompact={isStacked}
          />
        </Reveal>
        <div
          style={{
            ...styles.pressGrid,
            gridTemplateColumns: isStacked ? '1fr' : 'repeat(3, 1fr)',
          }}>
          {PRESS_QUOTES.map((press, index) => (
            <Reveal key={press.id} reduced={reduced} delayMs={index * 80}>
              <div style={styles.pressCard}>
                <span style={{color: ACCENT}} aria-hidden="true">
                  <Icon icon={QuoteIcon} size="sm" color="inherit" />
                </span>
                <StackItem size="fill">
                  <p style={styles.pressQuote}>&ldquo;{press.quote}&rdquo;</p>
                </StackItem>
                <VStack gap={0}>
                  <Text size="sm" weight="semibold">
                    {press.outlet}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {press.detail}
                  </Text>
                </VStack>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );

  const studioSection = (
    <div style={styles.studioBand}>
      <section
        id="studio"
        ref={registerSection('studio')}
        style={columnStyle}
        aria-label="Studio team">
        <div style={sectionStyle}>
          <Reveal reduced={reduced}>
            <SectionHeading
              eyebrow="The studio"
              title="Nine people. Six you’ll work with directly."
              isCompact={isStacked}
            />
          </Reveal>
          <div
            style={{
              ...styles.teamGrid,
              gridTemplateColumns: isPhone
                ? 'repeat(2, 1fr)'
                : isMid
                  ? 'repeat(3, 1fr)'
                  : 'repeat(6, 1fr)',
            }}>
            {TEAM.map((member, index) => (
              <Reveal key={member.id} reduced={reduced} delayMs={index * 60}>
                <div style={styles.teamCell}>
                  <div style={styles.teamMonogram} aria-hidden="true">
                    {member.initials}
                  </div>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {member.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {member.role}
                    </Text>
                  </VStack>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const inquiryForm =
    submittedEmail === null ? (
      <VStack gap={4}>
        <VStack gap={1}>
          <Text type="label">Tell us about your project</Text>
          <Text type="supporting" color="secondary">
            Three fields. A principal reads every inquiry.
          </Text>
        </VStack>
        <div
          style={{
            ...styles.selectRow,
            ...(isPhone ? styles.selectRowStacked : null),
          }}>
          <StackItem size="fill">
            <Selector
              label="Budget range"
              placeholder="Select a range…"
              options={[...BUDGET_OPTIONS]}
              value={budget}
              onChange={value => {
                setBudget(value);
                setBudgetError(null);
              }}
              width="100%"
              status={
                budgetError !== null
                  ? {type: 'error', message: budgetError}
                  : undefined
              }
            />
          </StackItem>
          <StackItem size="fill">
            <Selector
              label="Timeline"
              placeholder="When would we start?"
              options={[...TIMELINE_OPTIONS]}
              value={timeline}
              onChange={value => {
                setTimeline(value);
                setTimelineError(null);
              }}
              width="100%"
              status={
                timelineError !== null
                  ? {type: 'error', message: timelineError}
                  : undefined
              }
            />
          </StackItem>
        </div>
        <VStack gap={1}>
          <TextInput
            label="Work email"
            placeholder="you@company.com"
            value={email}
            onChange={value => {
              setEmail(value);
              setEmailError(null);
            }}
          />
          {emailError !== null && (
            <p style={styles.formError} role="alert">
              {emailError}
            </p>
          )}
        </VStack>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Send inquiry"
            variant="primary"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            onClick={submitInquiry}
          />
          <Text type="supporting" color="secondary">
            No retainer pitch. No newsletter. Just a reply.
          </Text>
        </HStack>
      </VStack>
    ) : (
      <VStack gap={3} role="status">
        <HStack gap={3} vAlign="center">
          <div style={styles.successDisc} aria-hidden="true">
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          </div>
          <VStack gap={0}>
            <Text type="label">Inquiry received</Text>
            <Text type="supporting" color="secondary">
              We’ll reply to {submittedEmail} within two business days.
            </Text>
          </VStack>
        </HStack>
        <Text type="supporting" color="secondary">
          {budget != null && timeline != null
            ? `Noted: ${budget} budget, ${timeline.toLowerCase()}. Ada or Jonah will take it from here.`
            : 'Ada or Jonah will take it from here.'}
        </Text>
        <HStack gap={2}>
          <Button
            label="Send another inquiry"
            variant="ghost"
            size="sm"
            onClick={resetInquiry}
          />
        </HStack>
      </VStack>
    );

  const contactSection = (
    <section
      id="contact"
      ref={registerSection('contact')}
      style={columnStyle}
      aria-label="Availability and inquiries">
      <div style={sectionStyle}>
        <Reveal reduced={reduced}>
          <SectionHeading
            eyebrow="Availability"
            title="Two slots left for Q4 2026."
            isCompact={isStacked}
          />
        </Reveal>
        <Reveal reduced={reduced} delayMs={80}>
          <div
            style={{
              ...styles.contactRow,
              ...(isStacked ? styles.contactRowStacked : null),
            }}>
            <div style={styles.availabilityCard}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <span style={{...styles.eyebrow, fontSize: 12}}>
                  {AVAILABILITY.window}
                </span>
                <Badge variant="warning" label={AVAILABILITY.slots} />
              </HStack>
              <Text type="body">{AVAILABILITY.note}</Text>
              <Divider />
              <HStack gap={2} vAlign="center">
                <span style={{color: ACCENT}} aria-hidden="true">
                  <Icon icon={MailIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.monoRow}>{BRAND.email}</span>
              </HStack>
              <HStack gap={2} vAlign="center">
                <span style={{color: ACCENT}} aria-hidden="true">
                  <Icon icon={MapPinIcon} size="sm" color="inherit" />
                </span>
                <Text type="supporting" color="secondary">
                  {BRAND.cities} · remote-friendly across time zones
                </Text>
              </HStack>
            </div>
            <div style={styles.inquiryCard}>{inquiryForm}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  const footer = (
    <footer style={styles.footer}>
      <div style={columnStyle}>
        <div style={styles.footerInner}>
          <div
            style={{
              ...styles.footerColumns,
              ...(isStacked ? styles.footerColumnsStacked : null),
            }}>
            <StackItem size="fill">
              <VStack gap={2}>
                <BrandMark />
                <Text type="supporting" color="secondary">
                  A nine-person product design studio. Four engagements a
                  year, taken seriously.
                </Text>
              </VStack>
            </StackItem>
            <VStack gap={0}>
              <Text type="supporting" color="secondary" weight="semibold">
                Site
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
              <button
                type="button"
                style={styles.footerLink}
                onClick={() => jumpToSection('contact')}>
                Contact
              </button>
            </VStack>
            <VStack gap={0}>
              <Text type="supporting" color="secondary" weight="semibold">
                Elsewhere
              </Text>
              {/* Off-site destinations: deliberate no-ops in a template. */}
              <button type="button" style={styles.footerLink} onClick={() => {}}>
                Field Notes (our writing)
              </button>
              <button type="button" style={styles.footerLink} onClick={() => {}}>
                Open design files
              </button>
              <button type="button" style={styles.footerLink} onClick={() => {}}>
                Speaking & workshops
              </button>
            </VStack>
          </div>
          <Divider />
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                © 2026 Fathom & Co LLC · {BRAND.cities}
              </Text>
            </StackItem>
            <span style={styles.monoRow}>{BRAND.email}</span>
          </HStack>
        </div>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div ref={wrapRef} className={SCOPE} style={{height: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Fathom & Co studio site">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {hero}
              {marquee}
              {workSection}
              {capabilitiesSection}
              {processSection}
              {pressSection}
              {studioSection}
              {contactSection}
              {footer}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
