var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file saas-landing-page.tsx
 * @input Deterministic fixtures only (the fictional "Relay" release-sync
 *   product: an announcement line for Relay 2.0, five Product flyout links
 *   with icons and descriptions, three nav anchors, hero headline/subcopy
 *   plus fine print, six fictional customer wordmarks, three alternating
 *   feature rows each with three proof bullets and a CSS-drawn schematic
 *   mock, four bento cells (uptime stat, compliance callout, CLI snippet,
 *   integrations tiles), one spotlight testimonial with two metric chips,
 *   three pricing tiers with fixed monthly/annual per-user price pairs,
 *   six FAQ entries, and a four-column sitemap footer)
 * @output Full marketing landing page composing the marketing system
 *   end-to-end: a dismissible announcement banner, a sticky navbar whose
 *   Product item opens a working flyout (click to open, Escape and
 *   outside-click to dismiss, focus returned to the trigger) and whose
 *   anchor links smooth-scroll with scroll-spy highlighting, a split hero
 *   with a validating email-capture form that flips to a confirmed state,
 *   a muted logo cloud, three alternating feature rows with schematic
 *   mocks, a compact 4-cell bento band, a dark spotlight testimonial, a
 *   3-tier pricing teaser whose monthly/annual SegmentedControl
 *   recalculates every price and swaps savings Badges, a controlled
 *   FAQ accordion, a final dark CTA panel, and a sitemap footer with a
 *   second validating newsletter form. Every CTA fires a corner Toast so
 *   the wiring is provable; this page intentionally reuses the visual
 *   vocabulary of the individual marketing showcase templates.
 * @position Page template; emitted by \`astryx template saas-landing-page\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy; inside it the
 * announcement banner scrolls away naturally, the navbar is
 * position:sticky top:0, and a centered 1120px column carries hero,
 * logo cloud, features, bento, testimonial, pricing, FAQ, and the final
 * CTA before the full-bleed footer. The Product flyout and the mobile
 * menu drop absolutely from the sticky navbar; the Toast sits fixed
 * bottom-right.
 *
 * Interaction contract:
 * - The announcement banner's 40px dismiss removes it for good (page
 *   fixture; no persistence theater), and its link fires a Toast.
 * - The navbar Product button opens the flyout on click (aria-expanded /
 *   aria-haspopup); Escape closes and refocuses the trigger, outside
 *   pointerdown closes, and each flyout link fires a named Toast then
 *   closes the menu. Nothing is hover-only.
 * - Features / Pricing / FAQ nav links smooth-scroll the container with a
 *   sticky-nav allowance; onScroll spies the last anchor above the fold
 *   line and highlights the matching link (aria-current).
 * - The hero email form validates on submit (empty and format errors
 *   inline) and success swaps the form for a confirmed state echoing the
 *   address, with a "Use a different email" reset. The footer newsletter
 *   form is an independent copy of the same contract.
 * - The pricing SegmentedControl recalculates all three tier prices in
 *   one pass; annual mode adds per-tier "Save $N/yr" Badges and flips the
 *   section Badge to "20% off applied". Tier CTAs fire named Toasts.
 * - FAQ Collapsibles are controlled via a Set of open ids so several can
 *   be open at once; the first ships open as an affordance.
 * - Footer Product-column links smooth-scroll to their sections; the
 *   remaining sitemap links and social buttons fire named Toasts.
 *
 * Container policy (landing-page archetype): page chrome is frame-first;
 * marketing sections are painted panels and bordered Cards inside the
 * document column. Dark surfaces (testimonial, final CTA, footer) lock
 * literal fixture gradients with colorScheme:'dark' so they read
 * identically in both app themes. Product art is CSS-drawn schematic
 * mocks — no network assets, no real screenshots, no clocks, no
 * randomness.
 *
 * Responsive contract:
 * - Column: max-width 1120px, centered, page gutters; full-bleed banner,
 *   navbar, and footer paint edge to edge.
 * - >820px: navbar shows inline anchor links + Product flyout + CTA pair;
 *   the flyout is a 360px panel under the trigger.
 * - <=820px: nav links collapse behind a 40px hamburger button whose
 *   dropdown panel lists the anchors, the Product links, and the CTA
 *   pair; the panel closes on Escape, outside tap, or any selection.
 * - >760px: hero is split text/mock, feature rows alternate image left
 *   and right, and the pricing grid sits 3-up.
 * - <=760px: hero and every feature row stack (mock below copy, in
 *   source order), the bento band drops from 4 cells across to 2 then 1
 *   (Grid minWidth), and pricing collapses 3 → 2 → 1 the same way.
 * - <=640px: headline sizes step down, both email forms stack the button
 *   under the input, the logo cloud wraps to two rows, footer sitemap
 *   columns drop from 4-up to 2-up (Grid), and section paddings tighten.
 *   All action rows are wrap="wrap", so the page holds at 375px with no
 *   overflow-x.
 * - Tap targets: banner dismiss, hamburger, and nav links are explicit
 *   40px controls; flyout rows and FAQ triggers carry generous vertical
 *   padding; nothing on the page requires hover.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  AtSignIcon,
  BlocksIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeXmlIcon,
  GitBranchIcon,
  GlobeIcon,
  MailCheckIcon,
  MegaphoneIcon,
  MenuIcon,
  PlayIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  RssIcon,
  SendIcon,
  ShieldCheckIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// Painted marketing surfaces use literal fixture colors locked with
// colorScheme:'dark' so the panels read identically in both app themes.

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.62)';
const CHIP_BG = 'rgba(255, 255, 255, 0.14)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.24)';
const ERROR_ON_DARK = '#FECACA';
const ACCENT = 'var(--color-accent, #0171E3)';
const ACCENT_MUTED = 'var(--color-accent-muted, #EAF2FF)';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 72;
const SPY_OFFSET = 140;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy and hosts the sticky navbar.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  },
  // Centered document column; banner, navbar, and footer bleed outside it.
  column: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-8)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-6)',
  },
  // ---- announcement banner (scrolls away; navbar below is sticky) ----
  banner: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#111827',
    backgroundImage:
      'linear-gradient(90deg, rgba(13, 148, 136, 0.4), rgba(17, 24, 39, 0) 55%)',
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background)',
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
  logoTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #14B8A6 0%, #4338CA 100%)',
    color: '#FFFFFF',
  },
  // Nav links are 40px text buttons so anchors and the flyout trigger
  // share one tap-target contract.
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
    color: ACCENT,
    backgroundColor: ACCENT_MUTED,
  },
  // ---- product flyout ----
  flyout: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 'var(--spacing-4)',
    width: 360,
    maxWidth: 'calc(100vw - 2 * var(--spacing-4))',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    boxShadow: 'var(--shadow-high, 0 12px 32px rgba(15, 23, 42, 0.18))',
    padding: 'var(--spacing-2)',
    zIndex: 40,
  },
  flyoutRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  flyoutGlyph: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_MUTED,
    color: ACCENT,
  },
  flyoutFooter: {
    marginTop: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
  },
  // ---- mobile menu (drops from the hamburger) ----
  mobileMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    boxShadow: 'var(--shadow-high, 0 12px 32px rgba(15, 23, 42, 0.18))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
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
    color: 'var(--color-text)',
    textAlign: 'left',
  },
  // ---- 40px icon buttons (Button caps at 36px) ----
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
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    paddingBlock: 'var(--spacing-6)',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-2)',
  },
  heroText: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroMock: {
    flex: '1 1 0',
    minWidth: 0,
  },
  heroHeadline: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 30,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 520,
    margin: 0,
  },
  // Shared email-capture row (hero and footer reuse the contract).
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
    color: 'var(--color-error, #B3261E)',
  },
  emailErrorOnDark: {
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
    backgroundColor: ACCENT_MUTED,
    color: ACCENT,
  },
  successDiscDark: {
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    color: DARK_TEXT,
  },
  // ---- logo cloud ----
  logoCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
  },
  logoTileCloud: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 128,
    height: 44,
    paddingInline: 18,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  // ---- alternating feature rows ----
  featureRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  featureRowReversed: {
    flexDirection: 'row-reverse',
  },
  featureRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  featureText: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  featureMock: {
    flex: '1 1 0',
    minWidth: 0,
  },
  featureGlyph: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    color: '#FFFFFF',
  },
  bulletDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(52, 168, 83, 0.14)',
    color: 'var(--color-success, #1E8E3E)',
  },
  // ---- CSS-drawn schematic mocks ----
  mockWindow: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-med)',
    backgroundColor: 'var(--color-background)',
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  mockDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  mockUrl: {
    flex: 1,
    marginLeft: 8,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  mockBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  mockHero: {
    height: 56,
    borderRadius: 8,
    backgroundImage:
      'linear-gradient(120deg, rgba(20, 184, 166, 0.30), rgba(67, 56, 202, 0.26))',
    border: '1px solid var(--color-border)',
  },
  mockBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  mockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  mockPill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 8,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  mockLogLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  mockLogDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // ---- bento band ----
  bentoCell: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    minHeight: 148,
    boxSizing: 'border-box',
  },
  bentoStat: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  bentoTerminal: {
    borderRadius: 8,
    backgroundColor: '#0B1220',
    colorScheme: 'dark',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 11,
    color: '#A5F3FC',
    overflowX: 'hidden',
  },
  integrationTile: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  // ---- spotlight testimonial ----
  testimonial: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(70% 90% at 100% 0%, rgba(45, 212, 191, 0.24), transparent 55%)',
      'linear-gradient(135deg, #111827 0%, #1E1B4B 100%)',
    ].join(', '),
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  testimonialCompact: {
    padding: 'var(--spacing-5) var(--spacing-4)',
  },
  quoteText: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    margin: 0,
    maxWidth: 780,
  },
  quoteTextCompact: {
    fontSize: 19,
  },
  avatarDisc: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)',
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
  // ---- pricing teaser ----
  tierCardPopular: {
    borderColor: ACCENT,
    boxShadow: \`0 0 0 1px \${ACCENT}\`,
  },
  ctaSlot: {
    display: 'grid',
  },
  checkGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-success, #1E8E3E)',
  },
  // ---- final CTA panel ----
  finalCta: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(70% 80% at 50% 0%, rgba(20, 184, 166, 0.35), transparent 60%)',
      'linear-gradient(180deg, #0B1220 0%, #1E1B4B 100%)',
    ].join(', '),
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
  },
  finalCtaCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  finalHeadline: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  finalHeadlineCompact: {
    fontSize: 24,
  },
  finalSubcopy: {
    fontSize: 16,
    lineHeight: 1.5,
    color: DARK_TEXT_SOFT,
    maxWidth: 560,
    margin: 0,
  },
  // ---- footer ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#0B1220',
    marginTop: 'var(--spacing-6)',
  },
  footerInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  footerInnerCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
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
  socialButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: \`1px solid \${CHIP_BORDER}\`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: DARK_TEXT_SOFT,
    padding: 0,
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
// Deterministic fixtures for the fictional Relay release-sync product.
// No Date.now, no randomness, no network assets.

const BRAND = {
  name: 'Relay',
  tagline: 'Ship every change, everywhere, at once',
};

const BANNER = {
  message:
    'Relay 2.0 is here — org-wide audit log, SCIM provisioning, and a 2x faster sync engine.',
  linkLabel: 'Read the announcement',
};

type SectionId = 'features' | 'pricing' | 'faq';

interface NavAnchor {
  id: SectionId;
  label: string;
}

const NAV_ANCHORS: readonly NavAnchor[] = [
  {id: 'features', label: 'Features'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'faq', label: 'FAQ'},
];

interface FlyoutLink {
  id: string;
  label: string;
  description: string;
  icon: Glyph;
}

const PRODUCT_LINKS: readonly FlyoutLink[] = [
  {
    id: 'sync',
    label: 'Sync Engine',
    description: 'Propagate config and flags to every environment in seconds.',
    icon: RefreshCwIcon,
  },
  {
    id: 'audit',
    label: 'Audit Log',
    description: 'Every change recorded with who, what, where, and why.',
    icon: ScrollTextIcon,
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    description: 'Environment-scoped approvals without gatekeeping.',
    icon: UsersIcon,
  },
  {
    id: 'api',
    label: 'Developer API',
    description: 'Typed SDKs, webhooks, and a CLI that mirrors the UI.',
    icon: CodeXmlIcon,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'GitHub, Slack, Datadog, Terraform, and 40 more.',
    icon: BlocksIcon,
  },
];

const HERO = {
  kicker: 'Release coordination for product teams',
  headline: 'Ship changes everywhere at once',
  subcopy:
    'Relay keeps configuration, feature flags, and rollout state in lockstep ' +
    'across every environment — so launch day is a checklist, not a scramble.',
  finePrint: 'Free for teams up to 5 · no credit card required',
};

/** Fictional customer wordmarks — text tiles, no imagery. */
const LOGO_CLOUD: readonly string[] = [
  'NORTHWIND',
  'ACME CLOUD',
  'LUMEN LABS',
  'FIELDER',
  'POLARIS',
  'HEXBYTE',
];

interface FeatureRow {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  bullets: readonly string[];
  icon: Glyph;
  glyphBackground: string;
  mock: 'sync' | 'audit' | 'roles';
}

const FEATURE_ROWS: readonly FeatureRow[] = [
  {
    id: 'sync',
    kicker: 'Sync Engine',
    title: 'One source of truth for every environment',
    copy:
      'Point staging, canary, and production at the same Relay space and ' +
      'every flag flip or config edit lands everywhere within seconds — ' +
      'with automatic drift detection when an environment strays.',
    bullets: [
      'Sub-second propagation across regions',
      'Drift alerts with one-click reconcile',
      'Scheduled rollouts with automatic holdbacks',
    ],
    icon: RefreshCwIcon,
    glyphBackground: 'linear-gradient(135deg, #14B8A6 0%, #0E7490 100%)',
    mock: 'sync',
  },
  {
    id: 'audit',
    kicker: 'Audit Log',
    title: 'Every change, on the record',
    copy:
      'Relay writes an immutable entry for each change: the diff, the ' +
      'author, the approval chain, and the environments it touched. ' +
      'Compliance reviews become a filter, not a fire drill.',
    bullets: [
      'Immutable log with 7-year retention',
      'Approval chains attached to every entry',
      'Export to SIEM or CSV in one click',
    ],
    icon: ScrollTextIcon,
    glyphBackground: 'linear-gradient(135deg, #6366F1 0%, #2563EB 100%)',
    mock: 'audit',
  },
  {
    id: 'roles',
    kicker: 'Roles & API',
    title: 'Guardrails without gatekeeping',
    copy:
      'Scope who can edit what per environment, require approvals only ' +
      'where they matter, and automate the rest through typed SDKs and a ' +
      'CLI that mirrors everything the UI can do.',
    bullets: [
      'Environment-scoped roles and approvals',
      'Typed SDKs for TypeScript, Python, and Go',
      'Webhooks for every lifecycle event',
    ],
    icon: UsersIcon,
    glyphBackground: 'linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)',
    mock: 'roles',
  },
];

/** Schematic sync rows for the hero + sync mocks: env, status, tone. */
const SYNC_ROWS: readonly {env: string; status: string; tone: string}[] = [
  {env: 'production', status: 'in sync', tone: '#34D399'},
  {env: 'canary', status: 'in sync', tone: '#34D399'},
  {env: 'staging', status: 'syncing…', tone: '#FBBF24'},
  {env: 'dev', status: 'in sync', tone: '#34D399'},
];

const AUDIT_LINES: readonly {actor: string; action: string; tone: string}[] = [
  {actor: 'mokonkwo', action: 'enabled checkout-v2 in production', tone: '#34D399'},
  {actor: 'jchen', action: 'edited rate-limit config in canary', tone: '#60A5FA'},
  {actor: 'approval', action: '2 of 2 approvals — release 84 cleared', tone: '#A78BFA'},
  {actor: 'svasquez', action: 'rolled back search-ranking in prod', tone: '#F87171'},
  {actor: 'relay-bot', action: 'drift reconciled in staging', tone: '#FBBF24'},
];

const ROLE_CHIPS: readonly {label: string; bg: string; fg: string}[] = [
  {label: 'Admin', bg: 'rgba(219, 39, 119, 0.14)', fg: '#BE185D'},
  {label: 'Release manager', bg: 'rgba(37, 99, 235, 0.12)', fg: '#1D4ED8'},
  {label: 'Editor', bg: 'rgba(13, 148, 136, 0.14)', fg: '#0F766E'},
  {label: 'Viewer', bg: 'rgba(107, 114, 128, 0.14)', fg: '#374151'},
];

const INTEGRATION_TILES: readonly {label: string; bg: string}[] = [
  {label: 'GH', bg: '#24292F'},
  {label: 'SL', bg: '#611F69'},
  {label: 'DD', bg: '#632CA6'},
  {label: 'TF', bg: '#5C4EE5'},
  {label: 'PD', bg: '#048A24'},
  {label: 'JR', bg: '#0052CC'},
];

const TESTIMONIAL = {
  quote:
    'We coordinated a 14-service launch across three regions without a ' +
    'single war room. Relay turned release day from our scariest ritual ' +
    'into a checkbox.',
  name: 'Maya Okonkwo',
  initials: 'MO',
  role: 'VP of Engineering, Northwind',
  metrics: ['4,800 releases coordinated', 'Zero rollback incidents in 2 quarters'],
};

type Billing = 'monthly' | 'annual';

interface Tier {
  id: 'free' | 'team' | 'business';
  name: string;
  tagline: string;
  /** USD per user per month at each cadence; Free is 0/0. */
  monthlyPerUser: number;
  annualPerUser: number;
  cta: string;
  ctaVariant: 'primary' | 'secondary';
  isPopular?: boolean;
  includedHeading: string;
  included: readonly string[];
}

const TIERS: readonly Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For trying Relay end to end',
    monthlyPerUser: 0,
    annualPerUser: 0,
    cta: 'Start for free',
    ctaVariant: 'secondary',
    includedHeading: 'Includes:',
    included: [
      '2 environments, 5 teammates',
      '100 config keys and flags',
      '30-day audit history',
      'Community support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'For teams shipping weekly',
    monthlyPerUser: 12,
    annualPerUser: 9,
    cta: 'Start 14-day trial',
    ctaVariant: 'primary',
    isPopular: true,
    includedHeading: 'Everything in Free, plus:',
    included: [
      'Unlimited environments and keys',
      'Approval chains and scheduled rollouts',
      '1-year audit history',
      'Slack + GitHub integrations',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For orgs with compliance needs',
    monthlyPerUser: 24,
    annualPerUser: 19,
    cta: 'Talk to sales',
    ctaVariant: 'secondary',
    includedHeading: 'Everything in Team, plus:',
    included: [
      'SAML SSO and SCIM provisioning',
      '7-year immutable audit retention',
      'Environment-scoped roles',
      'Priority support with a 4-hour SLA',
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
    id: 'what',
    question: 'What exactly does Relay sync?',
    answer:
      'Configuration values, feature flags, and rollout state. You define them once in a Relay space; every connected environment receives changes in under a second through our edge network, and drift detection flags anything edited out-of-band.',
  },
  {
    id: 'migrate',
    question: 'How hard is it to migrate from env files or another flag tool?',
    answer:
      'The CLI imports .env files, LaunchDarkly exports, and Terraform variables in one command, preserving names and values. Most teams run Relay in shadow mode alongside their old setup for a week, then cut over environment by environment.',
  },
  {
    id: 'trial',
    question: 'How does the 14-day Team trial work?',
    answer:
      'Every workspace starts with the full Team feature set for 14 days — no credit card. When the trial ends you pick a plan or drop to Free; nothing is deleted, and your audit history stays exportable.',
  },
  {
    id: 'billing',
    question: 'Can I switch between monthly and annual billing?',
    answer:
      'Yes, any time from Settings → Billing. Moving to annual applies the 20% discount immediately and credits the unused portion of your monthly cycle; moving back takes effect at the next renewal.',
  },
  {
    id: 'security',
    question: 'Is Relay SOC 2 compliant?',
    answer:
      'Relay is SOC 2 Type II audited annually, encrypts values with per-space keys, and offers EU or US data residency on the Business plan. The full security packet is available on request.',
  },
  {
    id: 'selfhost',
    question: 'Do you offer a self-hosted option?',
    answer:
      'Business customers can run the Relay sync relay (the edge component) inside their own VPC while the control plane stays managed. A fully self-hosted control plane is on the roadmap for enterprise agreements.',
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
      {label: 'Features', anchor: 'features'},
      {label: 'Pricing', anchor: 'pricing'},
      {label: 'FAQ', anchor: 'faq'},
      {label: 'Changelog'},
      {label: 'Status'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      {label: 'About'},
      {label: 'Blog'},
      {label: 'Careers'},
      {label: 'Press kit'},
    ],
  },
  {
    id: 'resources',
    heading: 'Resources',
    links: [
      {label: 'Documentation'},
      {label: 'API reference'},
      {label: 'Community'},
      {label: 'Migration guides'},
    ],
  },
  {
    id: 'legal',
    heading: 'Legal',
    links: [
      {label: 'Privacy'},
      {label: 'Terms'},
      {label: 'Security'},
      {label: 'DPA'},
    ],
  },
];

const SOCIALS: readonly {id: string; label: string; icon: Glyph}[] = [
  {id: 'social', label: 'Relay on social', icon: AtSignIcon},
  {id: 'community', label: 'Relay community', icon: GlobeIcon},
  {id: 'blog-feed', label: 'Relay blog RSS feed', icon: RssIcon},
];

// ============= HELPERS =============

function formatUSD(amount: number): string {
  return \`$\${amount.toLocaleString('en-US')}\`;
}

function perUserPrice(tier: Tier, billing: Billing): number {
  return billing === 'annual' ? tier.annualPerUser : tier.monthlyPerUser;
}

function annualSavingsPerUser(tier: Tier): number {
  return (tier.monthlyPerUser - tier.annualPerUser) * 12;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get started.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/** Small controlled state bundle shared by the hero and footer forms. */
interface EmailFormState {
  value: string;
  error: string | null;
  confirmedEmail: string | null;
}

const EMPTY_EMAIL_FORM: EmailFormState = {
  value: '',
  error: null,
  confirmedEmail: null,
};

// ============= SMALL PIECES =============

/** Relay logomark: gradient tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={ZapIcon} size="sm" color="inherit" />
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
  style,
  ariaExpanded,
}: {
  label: string;
  icon: Glyph;
  onClick: () => void;
  style?: CSSProperties;
  ariaExpanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      style={{...styles.iconButton, ...style}}>
      <Icon icon={icon} size="sm" color="inherit" />
    </button>
  );
}

/** Green check bullet used by feature rows and pricing tiers. */
function CheckBullet({label}: {label: string}) {
  return (
    <HStack gap={2} vAlign="start">
      <div style={styles.bulletDisc} aria-hidden="true">
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </div>
      <StackItem size="fill">
        <Text type="body">{label}</Text>
      </StackItem>
    </HStack>
  );
}

/** Centered section intro: kicker Token + title + supporting copy. */
function SectionIntro({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={2} hAlign="center">
      <Token label={kicker} size="sm" color="purple" />
      <Heading level={2}>{title}</Heading>
      <Text type="supporting" color="secondary" justify="center">
        {description}
      </Text>
    </VStack>
  );
}

/** CSS-drawn schematic product mock; variant picks the body content. */
function SchematicMock({
  variant,
  url,
  ariaLabel,
}: {
  variant: 'hero' | 'sync' | 'audit' | 'roles';
  url: string;
  ariaLabel: string;
}) {
  let body = null;
  if (variant === 'hero' || variant === 'sync') {
    body = (
      <>
        {variant === 'hero' ? <div style={styles.mockHero} /> : null}
        {SYNC_ROWS.map(row => (
          <div key={row.env} style={styles.mockRow}>
            <span
              style={{...styles.mockLogDot, backgroundColor: row.tone}}
              aria-hidden="true"
            />
            <span
              style={{
                ...styles.mockPill,
                backgroundColor: 'var(--color-background-muted)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}>
              {row.env}
            </span>
            <div style={{...styles.mockBar, flex: 1}} />
            <span
              style={{
                ...styles.mockPill,
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
              }}>
              {row.status}
            </span>
          </div>
        ))}
        <div style={{...styles.mockBar, width: '52%'}} />
      </>
    );
  } else if (variant === 'audit') {
    body = (
      <>
        {AUDIT_LINES.map(line => (
          <div key={line.action} style={styles.mockLogLine}>
            <span
              style={{...styles.mockLogDot, backgroundColor: line.tone}}
              aria-hidden="true"
            />
            <strong>{line.actor}</strong>
            <span>{line.action}</span>
          </div>
        ))}
        <div style={{...styles.mockBar, width: '40%'}} />
      </>
    );
  } else {
    body = (
      <>
        <div style={{...styles.mockRow, flexWrap: 'wrap'}}>
          {ROLE_CHIPS.map(chip => (
            <span
              key={chip.label}
              style={{
                ...styles.mockPill,
                backgroundColor: chip.bg,
                color: chip.fg,
              }}>
              {chip.label}
            </span>
          ))}
        </div>
        <div style={{...styles.mockBar, width: '84%'}} />
        <div style={{...styles.mockBar, width: '66%'}} />
        <div style={styles.bentoTerminal}>
          <span>$ relay flag enable checkout-v2 --env canary</span>
          <span>✓ approval required · requested from 2 reviewers</span>
        </div>
      </>
    );
  }
  return (
    <div style={styles.mockWindow} role="img" aria-label={ariaLabel}>
      <div aria-hidden="true" style={styles.mockChrome}>
        <span style={{...styles.mockDot, backgroundColor: '#F87171'}} />
        <span style={{...styles.mockDot, backgroundColor: '#FBBF24'}} />
        <span style={{...styles.mockDot, backgroundColor: '#34D399'}} />
        <span style={styles.mockUrl}>{url}</span>
      </div>
      <div aria-hidden="true" style={styles.mockBody}>
        {body}
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function SaasLandingPageTemplate() {
  // ---- announcement banner ----
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // ---- navbar menus ----
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const flyoutTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- email captures (hero + footer are independent forms) ----
  const [heroForm, setHeroForm] = useState<EmailFormState>(EMPTY_EMAIL_FORM);
  const [footerForm, setFooterForm] =
    useState<EmailFormState>(EMPTY_EMAIL_FORM);

  // ---- pricing ----
  const [billing, setBilling] = useState<Billing>('annual');

  // ---- FAQ: controlled Set so several answers can be open at once ----
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set([FAQ[0].id]),
  );

  // ---- toast: replaced (keyed) so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Responsive contract: <=820px collapses nav links behind the
  // hamburger; <=760px stacks hero/feature rows; <=640px steps type down
  // and stacks the email forms.
  const isNavCollapsed = useMediaQuery('(max-width: 820px)');
  const isStacked = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // Menus dismiss on Escape (refocusing their trigger) and on any
  // pointerdown outside the sticky navbar. Anchored listeners only run
  // while a menu is open.
  useEffect(() => {
    if (!isFlyoutOpen && !isMobileMenuOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (isFlyoutOpen) {
        setIsFlyoutOpen(false);
        flyoutTriggerRef.current?.focus();
      }
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (nav !== null && event.target instanceof Node && !nav.contains(event.target)) {
        setIsFlyoutOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isFlyoutOpen, isMobileMenuOpen]);

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  /** Smooth-scroll the page container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsFlyoutOpen(false);
    setIsMobileMenuOpen(false);
    if (container === null || section === null || section === undefined) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: 'smooth',
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

  const submitEmailForm = (
    form: EmailFormState,
    setForm: (next: EmailFormState) => void,
    origin: string,
  ) => {
    const error = validateEmail(form.value);
    if (error !== null) {
      setForm({...form, error});
      return;
    }
    const trimmed = form.value.trim();
    setForm({value: '', error: null, confirmedEmail: trimmed});
    fireToast(\`\${origin} — signed up \${trimmed}.\`);
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

  const pickFlyoutLink = (link: FlyoutLink) => {
    setIsFlyoutOpen(false);
    setIsMobileMenuOpen(false);
    fireToast(\`Product flyout — \${link.label} clicked.\`);
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  // ============= CHROME =============

  // ---- announcement banner ----
  const banner = (
    <div style={styles.banner} role="region" aria-label="Announcement">
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={MegaphoneIcon} size="sm" color="inherit" />
        <StackItem size="fill">
          <Text size="sm" color="inherit">
            {BANNER.message}
          </Text>
        </StackItem>
        <Button
          label={BANNER.linkLabel}
          variant="ghost"
          size="sm"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() =>
            fireToast('Announcement banner — Read the announcement clicked.')
          }
        />
        <IconButton40
          label="Dismiss announcement"
          icon={XIcon}
          style={{color: DARK_TEXT_SOFT}}
          onClick={() => setIsBannerVisible(false)}
        />
      </HStack>
    </div>
  );

  // ---- product flyout panel ----
  const productFlyout = (
    <div style={styles.flyout} role="menu" aria-label="Product">
      <VStack gap={0}>
        {PRODUCT_LINKS.map(link => (
          <button
            key={link.id}
            type="button"
            role="menuitem"
            style={styles.flyoutRow}
            onClick={() => pickFlyoutLink(link)}>
            <div style={styles.flyoutGlyph} aria-hidden="true">
              <Icon icon={link.icon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {link.label}
              </Text>
              <Text type="supporting" color="secondary">
                {link.description}
              </Text>
            </VStack>
          </button>
        ))}
      </VStack>
      <div style={styles.flyoutFooter}>
        <Button
          label="See the full platform tour"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
          onClick={() => {
            setIsFlyoutOpen(false);
            fireToast('Product flyout — platform tour clicked.');
          }}
        />
      </div>
    </div>
  );

  // ---- mobile menu panel ----
  const mobileMenu = (
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
        <Divider />
        <Text type="supporting" color="secondary">
          Product
        </Text>
        {PRODUCT_LINKS.map(link => (
          <button
            key={link.id}
            type="button"
            role="menuitem"
            style={styles.mobileMenuLink}
            onClick={() => pickFlyoutLink(link)}>
            <Icon icon={link.icon} size="sm" color="secondary" />
            {link.label}
          </button>
        ))}
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Sign in"
            variant="secondary"
            onClick={() => {
              setIsMobileMenuOpen(false);
              fireToast('Navbar — Sign in clicked.');
            }}
          />
          <Button
            label="Start free"
            variant="primary"
            onClick={() => {
              setIsMobileMenuOpen(false);
              fireToast('Navbar — Start free clicked.');
            }}
          />
        </HStack>
      </VStack>
    </div>
  );

  // ---- sticky navbar ----
  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Primary">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center">
              <button
                ref={flyoutTriggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isFlyoutOpen}
                style={{
                  ...styles.navLink,
                  ...(isFlyoutOpen ? styles.navLinkActive : null),
                }}
                onClick={() => setIsFlyoutOpen(previous => !previous)}>
                Product
                <Icon icon={ChevronDownIcon} size="xsm" color="inherit" />
              </button>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={
                    activeSection === anchor.id ? 'true' : undefined
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
        {isNavCollapsed ? (
          <>
            <Button
              label="Start free"
              variant="primary"
              size="sm"
              onClick={() => fireToast('Navbar — Start free clicked.')}
            />
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(previous => !previous)}
              style={{
                ...styles.iconButton,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}>
              <Icon
                icon={isMobileMenuOpen ? XIcon : MenuIcon}
                size="sm"
                color="inherit"
              />
            </button>
          </>
        ) : (
          <HStack gap={2} vAlign="center">
            <Button
              label="Sign in"
              variant="ghost"
              onClick={() => fireToast('Navbar — Sign in clicked.')}
            />
            <Button
              label="Start free"
              variant="primary"
              onClick={() => fireToast('Navbar — Start free clicked.')}
            />
          </HStack>
        )}
        {isFlyoutOpen && !isNavCollapsed && productFlyout}
        {isMobileMenuOpen && isNavCollapsed && mobileMenu}
      </div>
    </nav>
  );

  // ============= SECTIONS =============

  // ---- split hero with email capture ----
  const heroEmailForm =
    heroForm.confirmedEmail !== null ? (
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.successDisc}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text weight="semibold">Check your inbox</Text>
            <Text type="supporting" color="secondary">
              We sent a sign-in link to {heroForm.confirmedEmail}.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Use a different email"
          variant="ghost"
          size="sm"
          onClick={() => setHeroForm(EMPTY_EMAIL_FORM)}
        />
      </HStack>
    ) : (
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
              value={heroForm.value}
              onChange={value =>
                setHeroForm({...heroForm, value, error: null})
              }
            />
          </div>
          <Button
            label="Get started free"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() =>
              submitEmailForm(heroForm, setHeroForm, 'Hero email capture')
            }
          />
        </div>
        {heroForm.error !== null && (
          <p style={styles.emailError} role="alert">
            {heroForm.error}
          </p>
        )}
      </VStack>
    );

  const hero = (
    <div
      style={{
        ...styles.heroRow,
        ...(isStacked ? styles.heroRowStacked : null),
      }}>
      <div style={styles.heroText}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token label={HERO.kicker} size="sm" color="blue" />
          <Badge variant="info" label="Relay 2.0" />
        </HStack>
        <h1
          style={{
            ...styles.heroHeadline,
            ...(isPhone ? styles.heroHeadlineCompact : null),
          }}>
          {HERO.headline}
        </h1>
        <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
        {heroEmailForm}
        <Text type="supporting" color="secondary">
          {HERO.finePrint}
        </Text>
      </div>
      <div style={styles.heroMock}>
        <SchematicMock
          variant="hero"
          url="relay.app/spaces/checkout/rollouts"
          ariaLabel="Stylized screenshot of the Relay rollout dashboard showing four environments in sync"
        />
      </div>
    </div>
  );

  // ---- logo cloud ----
  const logoCloud = (
    <VStack gap={3} hAlign="center">
      <Text type="supporting" color="secondary">
        Release teams at 3,200 companies coordinate launches with Relay
      </Text>
      <div style={styles.logoCloud} role="list" aria-label="Customers">
        {LOGO_CLOUD.map(name => (
          <span key={name} role="listitem" style={styles.logoTileCloud}>
            {name}
          </span>
        ))}
      </div>
    </VStack>
  );

  // ---- alternating feature rows ----
  const featureRows = (
    <VStack gap={isStacked ? 6 : 8}>
      <SectionIntro
        kicker="Features"
        title="Everything between merge and launched"
        description="Sync, audit, and guardrails in one system — each section below maps to a Relay capability from the Product menu."
      />
      {FEATURE_ROWS.map((row, index) => (
        <div
          key={row.id}
          style={{
            ...styles.featureRow,
            ...(index % 2 === 1 ? styles.featureRowReversed : null),
            ...(isStacked ? styles.featureRowStacked : null),
          }}>
          <div style={styles.featureText}>
            <div
              style={{
                ...styles.featureGlyph,
                background: row.glyphBackground,
              }}
              aria-hidden="true">
              <Icon icon={row.icon} size="md" color="inherit" />
            </div>
            <Token label={row.kicker} size="sm" color="green" />
            <Heading level={3}>{row.title}</Heading>
            <Text type="body" color="secondary">
              {row.copy}
            </Text>
            <VStack gap={2}>
              {row.bullets.map(bullet => (
                <CheckBullet key={bullet} label={bullet} />
              ))}
            </VStack>
            <HStack gap={2} vAlign="center">
              <Button
                label={\`Learn more about \${row.kicker}\`}
                variant="ghost"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() =>
                  fireToast(\`Feature row — Learn more about \${row.kicker}.\`)
                }
              />
            </HStack>
          </div>
          <div style={styles.featureMock}>
            <SchematicMock
              variant={row.mock}
              url={\`relay.app/spaces/checkout/\${row.id}\`}
              ariaLabel={\`Stylized schematic of the Relay \${row.kicker} view\`}
            />
          </div>
        </div>
      ))}
    </VStack>
  );

  // ---- compact bento band ----
  const bentoBand = (
    <VStack gap={4}>
      <SectionIntro
        kicker="At a glance"
        title="Built for launch day"
        description="The numbers and guarantees behind every rollout."
      />
      <Grid columns={{minWidth: 240, max: 4}} gap={3}>
        <div style={styles.bentoCell}>
          <Text type="supporting" color="secondary">
            Sync uptime, trailing 12 months
          </Text>
          <span style={styles.bentoStat}>99.99%</span>
          <Text type="supporting" color="secondary">
            Multi-region edge network with automatic failover.
          </Text>
        </div>
        <div style={styles.bentoCell}>
          <HStack gap={2} vAlign="center">
            <Icon icon={ShieldCheckIcon} size="md" color="secondary" />
            <Text type="label">SOC 2 Type II</Text>
          </HStack>
          <Text type="supporting" color="secondary">
            Audited annually. SAML SSO, SCIM, and EU or US data residency on
            Business.
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Badge variant="success" label="SSO" />
            <Badge variant="success" label="SCIM" />
            <Badge variant="success" label="Residency" />
          </HStack>
        </div>
        <div style={styles.bentoCell}>
          <HStack gap={2} vAlign="center">
            <Icon icon={GitBranchIcon} size="md" color="secondary" />
            <Text type="label">CLI-first</Text>
          </HStack>
          <div style={styles.bentoTerminal} aria-label="Relay CLI example">
            <span>$ relay sync --space checkout</span>
            <span>✓ 4 environments in sync (312ms)</span>
            <span>$ relay flag enable checkout-v2</span>
          </div>
        </div>
        <div style={styles.bentoCell}>
          <HStack gap={2} vAlign="center">
            <Icon icon={BlocksIcon} size="md" color="secondary" />
            <Text type="label">46 integrations</Text>
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            {INTEGRATION_TILES.map(tile => (
              <span
                key={tile.label}
                style={{...styles.integrationTile, backgroundColor: tile.bg}}
                aria-hidden="true">
                {tile.label}
              </span>
            ))}
          </HStack>
          <Text type="supporting" color="secondary">
            GitHub, Slack, Datadog, Terraform, PagerDuty, Jira, and more.
          </Text>
        </div>
      </Grid>
    </VStack>
  );

  // ---- spotlight testimonial ----
  const testimonial = (
    <figure
      style={{
        ...styles.testimonial,
        ...(isPhone ? styles.testimonialCompact : null),
        margin: 0,
      }}>
      <blockquote
        style={{
          ...styles.quoteText,
          ...(isPhone ? styles.quoteTextCompact : null),
        }}>
        “{TESTIMONIAL.quote}”
      </blockquote>
      <figcaption>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <div style={styles.avatarDisc} aria-hidden="true">
            {TESTIMONIAL.initials}
          </div>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text weight="semibold" color="inherit">
                {TESTIMONIAL.name}
              </Text>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_FAINT}}>
                {TESTIMONIAL.role}
              </Text>
            </VStack>
          </StackItem>
          {TESTIMONIAL.metrics.map(metric => (
            <span key={metric} style={styles.metricChip}>
              <Icon icon={ZapIcon} size="xsm" color="inherit" />
              {metric}
            </span>
          ))}
        </HStack>
      </figcaption>
    </figure>
  );

  // ---- pricing teaser ----
  const pricing = (
    <VStack gap={4}>
      <SectionIntro
        kicker="Pricing"
        title="Start free, upgrade when launch day gets busy"
        description="Per-user pricing with a 20% discount on annual billing. Full plan comparison lives on the pricing page."
      />
      <HStack gap={2} vAlign="center" hAlign="center" wrap="wrap">
        {billing === 'annual' ? (
          <Badge variant="success" label="20% off applied" />
        ) : (
          <Badge label="Save 20% with annual" />
        )}
        <SegmentedControl
          label="Billing period"
          value={billing}
          onChange={value => setBilling(value as Billing)}
          size="sm">
          <SegmentedControlItem label="Monthly" value="monthly" />
          <SegmentedControlItem label="Annual · save 20%" value="annual" />
        </SegmentedControl>
      </HStack>
      <Grid columns={{minWidth: 264, max: 3}} gap={3}>
        {TIERS.map(tier => {
          const price = perUserPrice(tier, billing);
          const savings = annualSavingsPerUser(tier);
          return (
            <Card
              key={tier.id}
              padding={5}
              height="100%"
              style={tier.isPopular ? styles.tierCardPopular : undefined}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="label">{tier.name}</Text>
                    {tier.isPopular ? (
                      <Badge variant="info" label="Most popular" />
                    ) : null}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {tier.tagline}
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <HStack gap={1} vAlign="end">
                    <Heading level={2}>{formatUSD(price)}</Heading>
                    <Text type="supporting" color="secondary">
                      {tier.monthlyPerUser === 0
                        ? 'forever'
                        : billing === 'annual'
                          ? 'per user / mo, billed yearly'
                          : 'per user / mo'}
                    </Text>
                  </HStack>
                  {billing === 'annual' && savings > 0 ? (
                    <Badge
                      variant="success"
                      label={\`Save \${formatUSD(savings)} / user / yr\`}
                    />
                  ) : tier.monthlyPerUser > 0 ? (
                    <Text type="supporting" color="secondary">
                      or {formatUSD(tier.annualPerUser)} / user / mo billed
                      yearly
                    </Text>
                  ) : (
                    <Text type="supporting" color="secondary">
                      No credit card required
                    </Text>
                  )}
                </VStack>
                <div style={styles.ctaSlot}>
                  <Button
                    label={tier.cta}
                    variant={tier.ctaVariant}
                    onClick={() =>
                      fireToast(\`Pricing — \${tier.name}: \${tier.cta}.\`)
                    }
                  />
                </div>
                <Divider />
                <VStack gap={2}>
                  <Text type="supporting" color="secondary">
                    {tier.includedHeading}
                  </Text>
                  {tier.included.map(feature => (
                    <HStack key={feature} gap={2} vAlign="start">
                      <span style={styles.checkGlyph} aria-hidden="true">
                        <CheckIcon size={18} strokeWidth={2} />
                      </span>
                      <StackItem size="fill">
                        <Text type="body">{feature}</Text>
                      </StackItem>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Card>
          );
        })}
      </Grid>
    </VStack>
  );

  // ---- FAQ accordion ----
  const faq = (
    <VStack gap={4}>
      <SectionIntro
        kicker="FAQ"
        title="Frequently asked questions"
        description="Everything teams ask before their first rollout. Still curious? The final CTA below reaches a human."
      />
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
    </VStack>
  );

  // ---- final CTA panel ----
  const finalCta = (
    <div
      style={{
        ...styles.finalCta,
        ...(isPhone ? styles.finalCtaCompact : null),
      }}>
      <span style={styles.metricChip}>
        <Icon icon={ZapIcon} size="xsm" color="inherit" />
        Set up in under 10 minutes
      </span>
      <h2
        style={{
          ...styles.finalHeadline,
          ...(isPhone ? styles.finalHeadlineCompact : null),
        }}>
        Make your next launch the boring kind
      </h2>
      <p style={styles.finalSubcopy}>
        Import your env files, connect your environments, and run the first
        synced rollout today. Your team will wonder how releases ever worked
        without it.
      </p>
      <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
        <Button
          label="Start free"
          variant="primary"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() => fireToast('Final CTA — Start free clicked.')}
        />
        <Button
          label="Book a demo"
          variant="secondary"
          onClick={() => fireToast('Final CTA — Book a demo clicked.')}
        />
      </HStack>
      <Text type="supporting" color="inherit" style={{color: DARK_TEXT_FAINT}}>
        {HERO.finePrint}
      </Text>
    </div>
  );

  // ---- sitemap footer with newsletter form ----
  const footerEmailForm =
    footerForm.confirmedEmail !== null ? (
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={{...styles.successDisc, ...styles.successDiscDark}}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text weight="semibold" color="inherit">
              You&rsquo;re on the list
            </Text>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_SOFT}}>
              Release notes will land at {footerForm.confirmedEmail}.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Use a different email"
          variant="ghost"
          size="sm"
          onClick={() => setFooterForm(EMPTY_EMAIL_FORM)}
        />
      </HStack>
    ) : (
      <VStack gap={1}>
        <div
          style={{
            ...styles.emailRow,
            ...(isPhone ? styles.emailRowStacked : null),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Email for release notes"
              isLabelHidden
              placeholder="you@company.com"
              value={footerForm.value}
              onChange={value =>
                setFooterForm({...footerForm, value, error: null})
              }
            />
          </div>
          <Button
            label="Subscribe"
            variant="primary"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            onClick={() =>
              submitEmailForm(
                footerForm,
                setFooterForm,
                'Footer newsletter',
              )
            }
          />
        </div>
        {footerForm.error !== null && (
          <p
            style={{...styles.emailError, ...styles.emailErrorOnDark}}
            role="alert">
            {footerForm.error}
          </p>
        )}
      </VStack>
    );

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerCompact : null),
        }}>
        <HStack gap={6} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={3}>
              <BrandMark />
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_FAINT, maxWidth: 320}}>
                {BRAND.tagline}. Monthly release notes, zero fluff —
                unsubscribe with one click.
              </Text>
              {footerEmailForm}
              <HStack gap={2} vAlign="center">
                {SOCIALS.map(social => (
                  <button
                    key={social.id}
                    type="button"
                    aria-label={social.label}
                    style={styles.socialButton}
                    onClick={() => fireToast(\`Footer — \${social.label}.\`)}>
                    <Icon icon={social.icon} size="sm" color="inherit" />
                  </button>
                ))}
              </HStack>
            </VStack>
          </StackItem>
          <StackItem size="fill">
            <Grid columns={{minWidth: 132, max: 4}} gap={4}>
              {FOOTER_COLUMNS.map(column => (
                <VStack key={column.id} gap={2}>
                  <Text size="sm" weight="semibold" color="inherit">
                    {column.heading}
                  </Text>
                  {column.links.map(link => (
                    <button
                      key={link.label}
                      type="button"
                      style={styles.footerLink}
                      onClick={() =>
                        link.anchor !== undefined
                          ? jumpToSection(link.anchor)
                          : fireToast(
                              \`Footer — \${column.heading} / \${link.label} clicked.\`,
                            )
                      }>
                      {link.label}
                    </button>
                  ))}
                </VStack>
              ))}
            </Grid>
          </StackItem>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Relay Systems, Inc. All rights reserved.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            SOC 2 Type II · GDPR ready · 99.99% uptime
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Relay landing page">
            {/* Scroll container: owns scroll-spy; the navbar inside it is
                sticky and the banner above it scrolls away. */}
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {isBannerVisible && banner}
              {navbar}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {hero}
                {logoCloud}
                <section
                  ref={registerSection('features')}
                  aria-label="Features">
                  <VStack gap={isStacked ? 6 : 8}>
                    {featureRows}
                    {bentoBand}
                    {testimonial}
                  </VStack>
                </section>
                <section
                  ref={registerSection('pricing')}
                  aria-label="Pricing">
                  {pricing}
                </section>
                <section
                  ref={registerSection('faq')}
                  aria-label="Frequently asked questions">
                  {faq}
                </section>
                {finalCta}
              </div>
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
    </>
  );
}
`;export{e as default};