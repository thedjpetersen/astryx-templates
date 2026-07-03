var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one shared "Nimbus" marketing nav
 *   fixture reused by all three navbar treatments: five primary links
 *   [Product, Features, Pricing, Customers, Company], ten Product entries
 *   grouped Platform/Solutions/Resources with icons and one-line
 *   descriptions and five of them flagged core, a featured playbook post
 *   for the mega menu, and a two-tier eyebrow row's utility links, status
 *   dot, phone number, and locale label)
 * @output Interactive marketing showcase of three navbar variants stacked
 *   in framed viewports: a light navbar with centered links and a trailing
 *   Sign in / Get started CTA pair, a dark transparent navbar floated over
 *   a gradient hero that gains a solid background as a "Simulated scroll"
 *   Slider advances, and a two-tier navbar with an eyebrow utility row
 *   above the main bar. Each bar's Product item opens a working flyout on
 *   click — variant one a 5-link dropdown with icon discs and
 *   descriptions, variant two a full-width mega menu with three group
 *   columns plus a featured-post cell, variant three a compact two-column
 *   flyout with a footer action bar — all dismissing on Escape (focus
 *   returns to the trigger) and on outside click. A per-frame 375px
 *   preview Switch (plus a preview-all toolbar button) collapses each bar
 *   into a hamburger that opens a real slide-in drawer with a Product
 *   accordion. Every link and CTA fires a corner Toast naming its bar.
 * @position Page template; emitted by \`astryx template marketing-navbar-flyouts\`
 *
 * Frame: Layout height="fill". LayoutHeader is the demo toolbar —
 * showcase title on the left, a menu-state Badge plus a "Preview all at
 * 375px" toggle Button on the right. LayoutContent (padding 0) scrolls a
 * centered 1040px column of three sections; each section is a header
 * (kicker Token + title + supporting copy), a controls row (the 375px
 * preview Switch, and for the dark variant the Simulated scroll Slider
 * with a live percent Token), and a framed viewport — a bordered,
 * overflow-hidden panel whose inner viewport shrinks to 375px between
 * dashed gutters when phone preview is on. Flyouts and drawers are
 * absolutely positioned inside their viewport so the frames never leak.
 *
 * Interaction contract:
 * - Product triggers are real buttons (aria-expanded, rotating chevron)
 *   that open on click/tap — never hover. One overlay is open at a time;
 *   Escape closes it and restores focus to its trigger, pointerdown
 *   outside its data-overlay-scope closes it, and opening moves focus to
 *   the panel's first link. Choosing any flyout link closes the menu,
 *   restores trigger focus, and fires a Toast naming menu and link.
 * - The Simulated scroll Slider (0-100%) drives the dark navbar from
 *   fully transparent to a solid #090D1A bar with a hairline border and
 *   shadow, and parallax-nudges the hero copy up so the scroll reads.
 * - Each frame's 375px preview Switch (and the toolbar preview-all
 *   Button) swaps the bar for brand + 40px hamburger; the hamburger opens
 *   a right-anchored drawer over a scrim with 44px nav rows, a Product
 *   accordion revealing the core links, and the CTA pair. The drawer
 *   dismisses via its X, Escape, or scrim tap — same overlay contract.
 * - Non-Product nav links (desktop and drawer) set that bar's active link
 *   (aria-current="page") so switching state is visible per frame; all
 *   CTA buttons and hero buttons fire receipt Toasts. No dead controls.
 * - Toggling preview or crossing the 900px breakpoint force-closes any
 *   open overlay so a menu never floats over chrome that unmounted.
 *
 * Responsive contract:
 * - >900px: frames render full desktop bars (centered links, mega menu
 *   width = frame width, two-tier eyebrow with all utility links) unless
 *   their preview Switch narrows them to 375px.
 * - <=900px: real viewport can no longer fit five labeled links plus CTA
 *   clusters inside the frames, so every frame auto-collapses to the
 *   mobile hamburger chrome; the preview Switches are replaced by an
 *   "auto at this width" note and the toolbar preview-all button hides.
 * - <=640px: column padding tightens, section control rows wrap, the
 *   eyebrow row trims to status + phone, and the toolbar stacks. Drawer
 *   rows are 44px and the hamburger/close/trigger buttons are 40px, so
 *   the page holds at 375px with no horizontal overflow — viewports are
 *   overflow-hidden and every chrome row wraps.
 * - Nothing is hover-only: flyouts, drawers, and accordions are
 *   click/tap-driven with Escape and outside-click dismissal.
 *
 * Container policy (marketing-showcase archetype): page chrome is
 * frame-first; each navbar variant lives in its own framed viewport panel
 * with painted hero mocks (layered CSS gradients locked via colorScheme
 * for the dark surfaces) standing in for page content. Fixtures are
 * fixed — no Date.now, no randomness, no network assets or real imagery;
 * the featured-post thumb and hero art are gradient panels.
 *
 * Color policy: token/light-dark hybrid. The dark-variant surfaces (the
 * overlay bar, gradient hero, mega menu, eyebrow row, and dark drawer —
 * all the DARK_* / EYEBROW_BG constants) are deliberately scheme-locked
 * with colorScheme:'dark' so the "dark navbar over hero" exhibit reads
 * identically in both app themes; text and hairlines on those surfaces
 * use literals too so they stay readable. The Nimbus brand-mark gradient
 * (indigo→sky with a white glyph) is brand art, likewise locked. All
 * other chrome — light bars, flyout panels, icon discs, scrims, and
 * shadows — uses Astryx tokens or explicit light-dark() pairs.
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  BlocksIcon,
  BookOpenIcon,
  Building2Icon,
  ChartColumnIcon,
  ChevronDownIcon,
  GlobeIcon,
  GraduationCapIcon,
  LifeBuoyIcon,
  MenuIcon,
  PhoneIcon,
  PlayIcon,
  RocketIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  WorkflowIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= PAINT CONSTANTS =============
// Dark navbar/hero/mega surfaces use literal fixture colors locked with
// colorScheme:'dark' so they read identically in both app themes (see
// the Color policy note in the header doc).

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.84)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.62)';
const DARK_SURFACE = '#0B1220';
const DARK_HAIRLINE = 'rgba(148, 163, 184, 0.22)';
const EYEBROW_BG = '#0F172A';
// The "light-tone" disc sits on scheme-adaptive token surfaces, so it
// carries an explicit light-dark() pair; the DARK variants live only on
// the colorScheme:'dark' locked surfaces above and stay literal.
const ACCENT_DISC_LIGHT_BG =
  'light-dark(rgba(99, 102, 241, 0.12), rgba(129, 140, 248, 0.18))';
const ACCENT_DISC_LIGHT_FG = 'light-dark(#4F46E5, #A5B4FC)';
const ACCENT_DISC_DARK_BG = 'rgba(255, 255, 255, 0.08)';
const ACCENT_DISC_DARK_FG = '#A5B4FC';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Document column: 1040px cap so the mega-menu frame reads full-width.
  column: {
    width: '100%',
    maxWidth: 1040,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-7)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-6)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // ---- framed viewport ----
  frameOuter: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  viewport: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    marginInline: 'auto',
    minHeight: 460,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-body)',
    boxSizing: 'border-box',
  },
  // Phone preview: shrink the viewport to 375px between dashed gutters.
  viewportPhone: {
    maxWidth: 375,
    borderInline: '1.5px dashed var(--color-border)',
  },
  // ---- shared bar pieces ----
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    height: 64,
    paddingInline: 'var(--spacing-5)',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 20,
    flexShrink: 0,
  },
  barLight: {
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  // The dark bar floats over the hero; background/border/shadow are
  // computed from the simulated-scroll percentage at render time.
  barOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderBottom: '1px solid transparent',
    transition:
      'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
  },
  barSide: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  barSideEnd: {
    justifyContent: 'flex-end',
  },
  barCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 700,
    fontSize: 16,
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  // Brand art: the Nimbus gradient mark is scheme-locked so the logo is
  // identical in both themes (see Color policy); glyph literal to match.
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
    backgroundImage: 'linear-gradient(135deg, #6366F1, #0EA5E9)',
    flexShrink: 0,
  },
  // ---- nav links + product trigger (custom buttons: 40px targets,
  // refs for focus restore, aria-expanded) ----
  navLink: {
    height: 40,
    paddingInline: 12,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  navLinkActive: {
    color: 'var(--color-text)',
    fontWeight: 600,
  },
  navLinkOnDark: {
    color: DARK_TEXT_SOFT,
  },
  navLinkOnDarkActive: {
    color: DARK_TEXT,
    fontWeight: 600,
  },
  chevron: {
    display: 'inline-flex',
    transition: 'transform 140ms ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  // 40px square icon buttons (hamburger, drawer close, eyebrow search).
  squareButton: {
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
  // ---- variant 1: simple dropdown flyout ----
  dropdownWrap: {
    position: 'relative',
    display: 'inline-flex',
  },
  dropdownPanel: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 340,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 18px 40px light-dark(rgba(15, 23, 42, 0.16), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-2)',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  flyoutRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
    boxSizing: 'border-box',
  },
  iconDisc: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_DISC_LIGHT_BG,
    color: ACCENT_DISC_LIGHT_FG,
  },
  iconDiscDark: {
    backgroundColor: ACCENT_DISC_DARK_BG,
    color: ACCENT_DISC_DARK_FG,
  },
  iconDiscSm: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: '20px',
    margin: 0,
  },
  rowDescription: {
    fontSize: 12.5,
    lineHeight: '17px',
    margin: 0,
    color: 'var(--color-text-secondary)',
  },
  rowDescriptionOnDark: {
    color: DARK_TEXT_FAINT,
  },
  // ---- variant 2: dark hero + full-width mega menu ----
  hero: {
    position: 'relative',
    flex: 1,
    colorScheme: 'dark',
    color: DARK_TEXT,
    overflow: 'hidden',
    backgroundImage: [
      'radial-gradient(70% 90% at 85% 0%, rgba(14, 165, 233, 0.28), transparent 55%)',
      'radial-gradient(60% 80% at 8% 90%, rgba(129, 140, 248, 0.24), transparent 55%)',
      'linear-gradient(160deg, #0B1220 0%, #101A33 55%, #1E1B4B 100%)',
    ].join(', '),
    padding: '104px var(--spacing-6) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
  },
  heroInner: {
    maxWidth: 560,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    transition: 'transform 120ms linear',
  },
  heroHeadline: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 26,
  },
  heroSub: {
    fontSize: 15,
    lineHeight: 1.55,
    margin: 0,
    color: DARK_TEXT_SOFT,
  },
  heroChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    border: \`1px solid \${DARK_HAIRLINE}\`,
    fontSize: 12.5,
    fontWeight: 600,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-start',
  },
  megaPanel: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    zIndex: 30,
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: DARK_SURFACE,
    borderBottom: \`1px solid \${DARK_HAIRLINE}\`,
    boxShadow: '0 24px 48px rgba(2, 6, 23, 0.5)',
    padding: 'var(--spacing-5)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1.15fr',
    gap: 'var(--spacing-5)',
    boxSizing: 'border-box',
  },
  megaColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  megaGroupTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: DARK_TEXT_FAINT,
    margin: 0,
    padding: '0 8px 8px',
  },
  featuredCell: {
    borderRadius: 12,
    border: \`1px solid \${DARK_HAIRLINE}\`,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  featuredThumb: {
    height: 84,
    borderRadius: 8,
    backgroundImage:
      'linear-gradient(120deg, rgba(99, 102, 241, 0.8), rgba(14, 165, 233, 0.55))',
    border: '1px solid rgba(255, 255, 255, 0.14)',
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.35,
    margin: 0,
  },
  // ---- variant 3: two-tier eyebrow + compact flyout ----
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    minHeight: 36,
    paddingInline: 'var(--spacing-5)',
    colorScheme: 'dark',
    color: DARK_TEXT_SOFT,
    backgroundColor: EYEBROW_BG,
    fontSize: 12,
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  eyebrowLink: {
    height: 32,
    paddingInline: 8,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#34D399',
    flexShrink: 0,
  },
  compactPanel: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    left: 0,
    width: 460,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 18px 40px light-dark(rgba(15, 23, 42, 0.16), rgba(0, 0, 0, 0.5)))',
    overflow: 'hidden',
    zIndex: 30,
  },
  compactBody: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 2,
    padding: 'var(--spacing-2)',
  },
  compactFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // ---- mock content strips (tiered + light frames) ----
  contentStrip: {
    flex: 1,
    padding: 'var(--spacing-6) var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    alignItems: 'center',
    textAlign: 'center',
  },
  mockCards: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    width: '100%',
    maxWidth: 720,
  },
  mockCard: {
    flex: 1,
    height: 96,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // ---- mobile drawer ----
  drawerRoot: {
    position: 'absolute',
    inset: 0,
    zIndex: 40,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawerScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'light-dark(rgba(15, 23, 42, 0.48), rgba(2, 6, 23, 0.64))',
  },
  drawerPanel: {
    position: 'relative',
    width: 'min(320px, 88%)',
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: '-16px 0 40px light-dark(rgba(2, 6, 23, 0.3), rgba(0, 0, 0, 0.55))',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  drawerPanelDark: {
    colorScheme: 'dark',
    backgroundColor: EYEBROW_BG,
    color: DARK_TEXT,
  },
  drawerLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    minHeight: 44,
    paddingInline: 12,
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 15,
    fontWeight: 500,
    textAlign: 'left',
    color: 'inherit',
    boxSizing: 'border-box',
  },
  drawerLinkActive: {
    backgroundColor: 'var(--color-background-muted)',
    fontWeight: 600,
  },
  drawerLinkActiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    fontWeight: 600,
  },
  drawerSubLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    minHeight: 44,
    paddingInline: 12,
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'left',
    color: 'inherit',
    boxSizing: 'border-box',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'var(--color-border)',
    border: 'none',
    margin: 'var(--spacing-2) 0',
    flexShrink: 0,
  },
  drawerDividerDark: {
    backgroundColor: DARK_HAIRLINE,
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
// One shared nav fixture powers all three treatments so they compare
// directly. Deterministic: fixed copy, no clocks, no randomness.

type LucideGlyph = ComponentType<SVGProps<SVGSVGElement>>;

type FrameId = 'light' | 'dark' | 'tiered';

interface FrameMeta {
  id: FrameId;
  kicker: string;
  title: string;
  description: string;
  /** Prefix used in toast receipts, e.g. "Light navbar". */
  toastName: string;
}

const FRAMES: readonly FrameMeta[] = [
  {
    id: 'light',
    kicker: 'Variant 01',
    title: 'Light navbar — centered links, CTA pair',
    description:
      'Brand left, five centered links, Sign in / Get started on the right. Product opens a five-link dropdown with icon discs and one-line descriptions.',
    toastName: 'Light navbar',
  },
  {
    id: 'dark',
    kicker: 'Variant 02',
    title: 'Dark over hero — solid on scroll, mega menu',
    description:
      'Transparent bar floated over the hero. Drag the simulated-scroll slider to watch it gain a solid background; Product opens a full-width mega menu with three columns and a featured post.',
    toastName: 'Dark navbar',
  },
  {
    id: 'tiered',
    kicker: 'Variant 03',
    title: 'Two-tier — eyebrow utility row',
    description:
      'A slim utility eyebrow (docs, support, status, phone, locale) above the main bar. Product opens a compact two-column flyout with a footer action bar.',
    toastName: 'Two-tier navbar',
  },
];

interface NavLink {
  id: string;
  label: string;
}

// Shared primary links; "product" is the flyout trigger in every bar.
const NAV_LINKS: readonly NavLink[] = [
  {id: 'product', label: 'Product'},
  {id: 'features', label: 'Features'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'customers', label: 'Customers'},
  {id: 'company', label: 'Company'},
];

type ProductGroupId = 'platform' | 'solutions' | 'resources';

interface ProductLink {
  id: string;
  label: string;
  description: string;
  icon: LucideGlyph;
  group: ProductGroupId;
  /** Core links appear in the 5-link dropdown and the drawer accordion. */
  isCore: boolean;
}

const PRODUCT_LINKS: readonly ProductLink[] = [
  {
    id: 'automations',
    label: 'Automations',
    description: 'Design multi-step journeys with branching and delays.',
    icon: WorkflowIcon,
    group: 'platform',
    isCore: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Funnel, retention, and revenue reporting in one place.',
    icon: ChartColumnIcon,
    group: 'platform',
    isCore: true,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Connect 90+ tools with two-way sync and webhooks.',
    icon: BlocksIcon,
    group: 'platform',
    isCore: true,
  },
  {
    id: 'security',
    label: 'Security & compliance',
    description: 'SSO, SCIM, audit logs, and regional data residency.',
    icon: ShieldCheckIcon,
    group: 'platform',
    isCore: true,
  },
  {
    id: 'startups',
    label: 'For startups',
    description: 'Launch on the free tier and scale when revenue does.',
    icon: RocketIcon,
    group: 'solutions',
    isCore: false,
  },
  {
    id: 'enterprise',
    label: 'For enterprise',
    description: 'Controls, SLAs, and a named success architect.',
    icon: Building2Icon,
    group: 'solutions',
    isCore: false,
  },
  {
    id: 'agencies',
    label: 'For agencies',
    description: 'Run every client workspace from one dashboard.',
    icon: UsersIcon,
    group: 'solutions',
    isCore: false,
  },
  {
    id: 'docs',
    label: 'Documentation',
    description: 'API reference, SDKs, and copy-paste recipes.',
    icon: BookOpenIcon,
    group: 'resources',
    isCore: true,
  },
  {
    id: 'academy',
    label: 'Nimbus Academy',
    description: 'Courses and certifications for operators.',
    icon: GraduationCapIcon,
    group: 'resources',
    isCore: false,
  },
  {
    id: 'help',
    label: 'Help center',
    description: 'Support articles, live chat, and office hours.',
    icon: LifeBuoyIcon,
    group: 'resources',
    isCore: false,
  },
];

const PRODUCT_GROUPS: readonly {id: ProductGroupId; label: string}[] = [
  {id: 'platform', label: 'Platform'},
  {id: 'solutions', label: 'Solutions'},
  {id: 'resources', label: 'Resources'},
];

const CORE_LINKS = PRODUCT_LINKS.filter(link => link.isCore);

const FEATURED_POST = {
  tag: 'Playbook',
  title: 'How Fieldstone cut onboarding time 38% with Nimbus flows',
  meta: '9 min read · Customer stories',
};

const EYEBROW_LINKS: readonly string[] = ['Docs', 'Support', 'Changelog'];

const EYEBROW_PHONE = '+1 (415) 555-0114';
const EYEBROW_LOCALE = 'EN · US';

const HERO = {
  chip: 'New: Nimbus Flows 2.0',
  headline: 'Marketing automation that ships itself',
  sub:
    'Design the journey once and Nimbus handles the sends, the splits, ' +
    'and the reporting — while the navbar above stays out of the way.',
};

// Overlay ids: one open at a time; \`-product\` = flyout, \`-drawer\` = drawer.
type OverlayId =
  | 'light-product'
  | 'dark-product'
  | 'tiered-product'
  | 'light-drawer'
  | 'dark-drawer'
  | 'tiered-drawer';

// ============= SMALL PIECES =============

/** Section header: title + archetype Token kicker + supporting copy. */
function SectionHeader({frame}: {frame: FrameMeta}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={2}>{frame.title}</Heading>
        <Token label={frame.kicker} size="sm" color="purple" />
      </HStack>
      <Text type="supporting" color="secondary">
        {frame.description}
      </Text>
    </VStack>
  );
}

/** Shared Nimbus brand lockup; inherits color from its bar. */
function BrandMark({subLabel}: {subLabel?: string}) {
  return (
    <span style={styles.brand}>
      <span style={styles.brandMark} aria-hidden>
        <Icon icon={SparklesIcon} size="sm" color="inherit" />
      </span>
      Nimbus
      {subLabel !== undefined && (
        <Text type="supporting" color="secondary" size="xsm">
          {subLabel}
        </Text>
      )}
    </span>
  );
}

/** Icon disc + label + description row used by all three flyouts. */
function FlyoutLinkRow({
  link,
  tone,
  isCompact,
  onSelect,
}: {
  link: ProductLink;
  tone: 'light' | 'dark';
  isCompact?: boolean;
  onSelect: (link: ProductLink) => void;
}) {
  return (
    <button
      type="button"
      style={styles.flyoutRow}
      onClick={() => onSelect(link)}>
      <span
        style={{
          ...styles.iconDisc,
          ...(tone === 'dark' ? styles.iconDiscDark : null),
          ...(isCompact ? styles.iconDiscSm : null),
        }}
        aria-hidden>
        <Icon icon={link.icon} size={isCompact ? 'xsm' : 'sm'} color="inherit" />
      </span>
      <span style={{minWidth: 0}}>
        <p style={styles.rowLabel}>{link.label}</p>
        <p
          style={{
            ...styles.rowDescription,
            ...(tone === 'dark' ? styles.rowDescriptionOnDark : null),
          }}>
          {link.description}
        </p>
      </span>
    </button>
  );
}

/** 40px square icon button (hamburger, close, eyebrow search). */
function SquareIconButton({
  label,
  icon,
  buttonRef,
  scope,
  isExpanded,
  onClick,
}: {
  label: string;
  icon: LucideGlyph;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  scope?: string;
  isExpanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      ref={buttonRef}
      aria-label={label}
      aria-expanded={isExpanded}
      data-overlay-scope={scope}
      style={styles.squareButton}
      onClick={onClick}>
      <Icon icon={icon} size="sm" color="inherit" />
    </button>
  );
}

// ============= PAGE =============

export default function MarketingNavbarFlyoutsTemplate() {
  // ---- overlay bookkeeping: one flyout or drawer open at a time ----
  const [openOverlay, setOpenOverlay] = useState<OverlayId | null>(null);
  const triggerRefs = useRef<Partial<Record<OverlayId, HTMLButtonElement | null>>>(
    {},
  );

  // ---- per-frame state ----
  const [activeLink, setActiveLink] = useState<Record<FrameId, string | null>>({
    light: null,
    dark: null,
    tiered: null,
  });
  const [mobilePreview, setMobilePreview] = useState<Record<FrameId, boolean>>({
    light: false,
    dark: false,
    tiered: false,
  });
  const [drawerProductOpen, setDrawerProductOpen] = useState<
    Record<FrameId, boolean>
  >({light: false, dark: false, tiered: false});

  // ---- simulated scroll for the dark transparent bar ----
  const [scrollPct, setScrollPct] = useState(0);

  // ---- toast: keyed so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Responsive contract: <=900px frames auto-collapse to mobile chrome;
  // <=640px trims paddings, wraps control rows, and stacks the toolbar.
  const isCompact = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // Force-close any open overlay when the breakpoint crosses so a menu
  // never floats over chrome that just unmounted.
  useEffect(() => {
    setOpenOverlay(null);
  }, [isCompact]);

  // Escape closes the open overlay and restores trigger focus;
  // pointerdown outside its data-overlay-scope closes without stealing
  // focus. Both trigger and panel carry the same scope attribute, so any
  // panel placement (anchored dropdown, full-width mega, drawer) works.
  useEffect(() => {
    if (openOverlay === null) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        triggerRefs.current[openOverlay]?.focus();
        setOpenOverlay(null);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(\`[data-overlay-scope="\${openOverlay}"]\`) === null
      ) {
        setOpenOverlay(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openOverlay]);

  // Focus handling: opening an overlay moves focus to its first link.
  useEffect(() => {
    if (openOverlay === null) {
      return;
    }
    const panel = document.querySelector<HTMLElement>(
      \`[data-overlay-panel="\${openOverlay}"]\`,
    );
    panel?.querySelector<HTMLElement>('button, a')?.focus();
  }, [openOverlay]);

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const registerTrigger =
    (id: OverlayId) => (node: HTMLButtonElement | null) => {
      triggerRefs.current[id] = node;
    };

  const toggleOverlay = (id: OverlayId) => {
    setOpenOverlay(previous => (previous === id ? null : id));
  };

  /** Close the open overlay, returning focus to its trigger. */
  const closeOverlayWithFocus = () => {
    if (openOverlay !== null) {
      triggerRefs.current[openOverlay]?.focus();
    }
    setOpenOverlay(null);
  };

  const isMobileFrame = (id: FrameId) => mobilePreview[id] || isCompact;

  const chooseNavLink = (frame: FrameMeta, link: NavLink) => {
    setActiveLink(previous => ({...previous, [frame.id]: link.id}));
    setOpenOverlay(null);
    fireToast(\`\${frame.toastName} — \${link.label} link clicked.\`);
  };

  const chooseFlyoutLink = (menuName: string, link: ProductLink) => {
    closeOverlayWithFocus();
    fireToast(\`\${menuName} — \${link.label} selected.\`);
  };

  const chooseDrawerNavLink = (frame: FrameMeta, link: NavLink) => {
    setActiveLink(previous => ({...previous, [frame.id]: link.id}));
    closeOverlayWithFocus();
    fireToast(\`\${frame.toastName} drawer — \${link.label} link clicked.\`);
  };

  const togglePreview = (id: FrameId, value: boolean) => {
    setMobilePreview(previous => ({...previous, [id]: value}));
    setOpenOverlay(null);
  };

  const allPreviewOn = FRAMES.every(frame => mobilePreview[frame.id]);
  const togglePreviewAll = () => {
    const next = !allPreviewOn;
    setMobilePreview({light: next, dark: next, tiered: next});
    setOpenOverlay(null);
  };

  // ---- shared bar pieces ----

  /** Custom nav link button; Product renders via ProductTrigger instead. */
  const renderNavLink = (frame: FrameMeta, link: NavLink, tone: 'light' | 'dark') => {
    const isActive = activeLink[frame.id] === link.id;
    return (
      <button
        key={link.id}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        style={{
          ...styles.navLink,
          ...(tone === 'dark' ? styles.navLinkOnDark : null),
          ...(isActive
            ? tone === 'dark'
              ? styles.navLinkOnDarkActive
              : styles.navLinkActive
            : null),
        }}
        onClick={() => chooseNavLink(frame, link)}>
        {link.label}
      </button>
    );
  };

  /** Product trigger: aria-expanded button with a rotating chevron. */
  const renderProductTrigger = (
    overlayId: OverlayId,
    tone: 'light' | 'dark',
  ) => {
    const isOpen = openOverlay === overlayId;
    return (
      <button
        type="button"
        ref={registerTrigger(overlayId)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          ...styles.navLink,
          ...(tone === 'dark' ? styles.navLinkOnDark : null),
          ...(isOpen
            ? tone === 'dark'
              ? styles.navLinkOnDarkActive
              : styles.navLinkActive
            : null),
        }}
        onClick={() => toggleOverlay(overlayId)}>
        Product
        <span
          aria-hidden
          style={{...styles.chevron, ...(isOpen ? styles.chevronOpen : null)}}>
          <Icon icon={ChevronDownIcon} size="xsm" color="inherit" />
        </span>
      </button>
    );
  };

  /** Mobile drawer shared by all three frames; tone matches the bar. */
  const renderDrawer = (
    frame: FrameMeta,
    tone: 'light' | 'dark',
    includeUtility: boolean,
  ) => {
    const overlayId = \`\${frame.id}-drawer\` as OverlayId;
    if (openOverlay !== overlayId) {
      return null;
    }
    const isDark = tone === 'dark';
    const isAccordionOpen = drawerProductOpen[frame.id];
    const dividerStyle = {
      ...styles.drawerDivider,
      ...(isDark ? styles.drawerDividerDark : null),
    };
    return (
      <div style={styles.drawerRoot}>
        {/* Scrim is outside the overlay scope, so tapping it closes. */}
        <div style={styles.drawerScrim} aria-hidden />
        <div
          role="dialog"
          aria-label={\`\${frame.toastName} menu\`}
          data-overlay-scope={overlayId}
          data-overlay-panel={overlayId}
          style={{
            ...styles.drawerPanel,
            ...(isDark ? styles.drawerPanelDark : null),
          }}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <BrandMark />
            </StackItem>
            <SquareIconButton
              label="Close menu"
              icon={XIcon}
              onClick={closeOverlayWithFocus}
            />
          </HStack>
          <hr style={dividerStyle} />

          {/* Product accordion: reveals the shared core links. */}
          <button
            type="button"
            aria-expanded={isAccordionOpen}
            style={styles.drawerLink}
            onClick={() =>
              setDrawerProductOpen(previous => ({
                ...previous,
                [frame.id]: !previous[frame.id],
              }))
            }>
            Product
            <span
              aria-hidden
              style={{
                ...styles.chevron,
                ...(isAccordionOpen ? styles.chevronOpen : null),
              }}>
              <Icon icon={ChevronDownIcon} size="xsm" color="inherit" />
            </span>
          </button>
          {isAccordionOpen &&
            CORE_LINKS.map(link => (
              <button
                key={link.id}
                type="button"
                style={styles.drawerSubLink}
                onClick={() =>
                  chooseFlyoutLink(\`\${frame.toastName} drawer\`, link)
                }>
                <span
                  style={{
                    ...styles.iconDisc,
                    ...styles.iconDiscSm,
                    ...(isDark ? styles.iconDiscDark : null),
                  }}
                  aria-hidden>
                  <Icon icon={link.icon} size="xsm" color="inherit" />
                </span>
                {link.label}
              </button>
            ))}

          {NAV_LINKS.filter(link => link.id !== 'product').map(link => {
            const isActive = activeLink[frame.id] === link.id;
            return (
              <button
                key={link.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                style={{
                  ...styles.drawerLink,
                  ...(isActive
                    ? isDark
                      ? styles.drawerLinkActiveDark
                      : styles.drawerLinkActive
                    : null),
                }}
                onClick={() => chooseDrawerNavLink(frame, link)}>
                {link.label}
              </button>
            );
          })}

          <hr style={dividerStyle} />
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label="Sign in"
              variant="secondary"
              onClick={() => {
                closeOverlayWithFocus();
                fireToast(\`\${frame.toastName} drawer — Sign in clicked.\`);
              }}
            />
            <Button
              label="Get started"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => {
                closeOverlayWithFocus();
                fireToast(\`\${frame.toastName} drawer — Get started clicked.\`);
              }}
            />
          </HStack>

          {includeUtility && (
            <>
              <hr style={dividerStyle} />
              <VStack gap={0}>
                {EYEBROW_LINKS.map(label => (
                  <button
                    key={label}
                    type="button"
                    style={styles.drawerSubLink}
                    onClick={() => {
                      closeOverlayWithFocus();
                      fireToast(\`\${frame.toastName} drawer — \${label} clicked.\`);
                    }}>
                    {label}
                  </button>
                ))}
                <span style={{...styles.drawerSubLink, cursor: 'default'}}>
                  <Icon icon={PhoneIcon} size="xsm" color="inherit" />
                  {EYEBROW_PHONE}
                </span>
              </VStack>
            </>
          )}
        </div>
      </div>
    );
  };

  /** Brand + hamburger bar used by every frame in mobile chrome. */
  const renderMobileBar = (
    frame: FrameMeta,
    tone: 'light' | 'dark',
    barStyle: CSSProperties,
  ) => {
    const overlayId = \`\${frame.id}-drawer\` as OverlayId;
    return (
      <div style={barStyle}>
        <StackItem size="fill">
          <BrandMark />
        </StackItem>
        <SquareIconButton
          label={\`Open \${frame.toastName.toLowerCase()} menu\`}
          icon={MenuIcon}
          scope={overlayId}
          isExpanded={openOverlay === overlayId}
          buttonRef={registerTrigger(overlayId)}
          onClick={() => toggleOverlay(overlayId)}
        />
      </div>
    );
  };

  /** Per-frame controls row: 375px preview Switch (auto note when the
   * real viewport is already compact) plus any variant-specific control. */
  const renderControls = (frame: FrameMeta, extra?: React.ReactNode) => (
    <HStack gap={3} vAlign="center" wrap="wrap">
      {isCompact ? (
        <Text type="supporting" color="secondary">
          Mobile chrome is automatic at this width.
        </Text>
      ) : (
        <Switch
          label="375px preview"
          value={mobilePreview[frame.id]}
          onChange={value => togglePreview(frame.id, value)}
        />
      )}
      {extra}
    </HStack>
  );

  // ============= VARIANT 1: LIGHT CENTERED =============

  const lightFrameMeta = FRAMES[0];
  const isLightMobile = isMobileFrame('light');
  const lightBarStyle = {...styles.bar, ...styles.barLight};

  const lightDesktopBar = (
    <div style={lightBarStyle}>
      <div style={styles.barSide}>
        <BrandMark />
      </div>
      <nav aria-label="Light navbar primary" style={styles.barCenter}>
        {/* Product trigger + anchored dropdown share one overlay scope. */}
        <span style={styles.dropdownWrap} data-overlay-scope="light-product">
          {renderProductTrigger('light-product', 'light')}
          {openOverlay === 'light-product' && (
            <div
              style={styles.dropdownPanel}
              data-overlay-panel="light-product"
              aria-label="Product menu">
              {CORE_LINKS.map(link => (
                <FlyoutLinkRow
                  key={link.id}
                  link={link}
                  tone="light"
                  onSelect={selected =>
                    chooseFlyoutLink('Light dropdown', selected)
                  }
                />
              ))}
            </div>
          )}
        </span>
        {NAV_LINKS.filter(link => link.id !== 'product').map(link =>
          renderNavLink(lightFrameMeta, link, 'light'),
        )}
      </nav>
      <div style={{...styles.barSide, ...styles.barSideEnd}}>
        <Button
          label="Sign in"
          variant="ghost"
          size="sm"
          onClick={() => fireToast('Light navbar — Sign in clicked.')}
        />
        <Button
          label="Get started"
          variant="primary"
          size="sm"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() => fireToast('Light navbar — Get started clicked.')}
        />
      </div>
    </div>
  );

  const lightFrame = (
    <section style={styles.section} aria-label={lightFrameMeta.title}>
      <SectionHeader frame={lightFrameMeta} />
      {renderControls(lightFrameMeta)}
      <div style={styles.frameOuter}>
        <div
          style={{
            ...styles.viewport,
            ...(isLightMobile && !isCompact ? styles.viewportPhone : null),
          }}>
          {isLightMobile
            ? renderMobileBar(lightFrameMeta, 'light', lightBarStyle)
            : lightDesktopBar}

          {/* Mock page content beneath the bar. */}
          <div style={styles.contentStrip}>
            <Token label="Nimbus for growth teams" size="sm" color="blue" />
            <Heading level={3}>One workspace for every campaign</Heading>
            <Text type="supporting" color="secondary">
              Placeholder page content — the navbar above is the exhibit.
              Open Product to see the dropdown overlay this region.
            </Text>
            <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
              <Button
                label="Start free"
                variant="primary"
                onClick={() => fireToast('Light hero — Start free clicked.')}
              />
              <Button
                label="Watch demo"
                variant="ghost"
                icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
                onClick={() => fireToast('Light hero — Watch demo clicked.')}
              />
            </HStack>
            <div style={styles.mockCards} aria-hidden>
              <div style={styles.mockCard} />
              <div style={styles.mockCard} />
              {!isLightMobile && <div style={styles.mockCard} />}
            </div>
          </div>

          {renderDrawer(lightFrameMeta, 'light', false)}
        </div>
      </div>
    </section>
  );

  // ============= VARIANT 2: DARK OVER HERO + MEGA MENU =============

  const darkFrameMeta = FRAMES[1];
  const isDarkMobile = isMobileFrame('dark');

  // Simulated scroll drives the bar from transparent to solid.
  const barAlpha = (scrollPct / 100) * 0.96;
  const darkBarStyle: CSSProperties = {
    ...styles.bar,
    ...styles.barOverlay,
    backgroundColor: \`rgba(9, 13, 26, \${barAlpha.toFixed(2)})\`,
    borderBottomColor: scrollPct > 8 ? DARK_HAIRLINE : 'transparent',
    boxShadow:
      scrollPct > 40 ? '0 10px 24px rgba(2, 6, 23, 0.45)' : 'none',
    zIndex: 20,
  };

  const megaMenu = openOverlay === 'dark-product' && (
    <div
      style={styles.megaPanel}
      data-overlay-scope="dark-product"
      data-overlay-panel="dark-product"
      aria-label="Product mega menu">
      {PRODUCT_GROUPS.map(group => (
        <div key={group.id} style={styles.megaColumn}>
          <p style={styles.megaGroupTitle}>{group.label}</p>
          {PRODUCT_LINKS.filter(link => link.group === group.id).map(link => (
            <FlyoutLinkRow
              key={link.id}
              link={link}
              tone="dark"
              onSelect={selected => chooseFlyoutLink('Mega menu', selected)}
            />
          ))}
        </div>
      ))}
      {/* Featured-post cell: gradient thumb, tag, title, read action. */}
      <div style={styles.featuredCell}>
        <div style={styles.featuredThumb} aria-hidden />
        <Token label={FEATURED_POST.tag} size="sm" color="teal" />
        <p style={styles.featuredTitle}>{FEATURED_POST.title}</p>
        <Text type="supporting" size="xsm" style={{color: DARK_TEXT_FAINT}}>
          {FEATURED_POST.meta}
        </Text>
        <Button
          label="Read the post"
          variant="secondary"
          size="sm"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() => {
            closeOverlayWithFocus();
            fireToast('Mega menu — featured post opened.');
          }}
        />
      </div>
    </div>
  );

  const darkDesktopBar = (
    <div style={darkBarStyle}>
      <div style={styles.barSide}>
        <BrandMark />
      </div>
      <nav aria-label="Dark navbar primary" style={styles.barCenter}>
        {/* Trigger carries the scope; the full-width panel re-declares it
            since it is positioned at viewport level, not under the
            trigger. */}
        <span data-overlay-scope="dark-product" style={{display: 'inline-flex'}}>
          {renderProductTrigger('dark-product', 'dark')}
        </span>
        {NAV_LINKS.filter(link => link.id !== 'product').map(link =>
          renderNavLink(darkFrameMeta, link, 'dark'),
        )}
      </nav>
      <div style={{...styles.barSide, ...styles.barSideEnd}}>
        <Button
          label="Sign in"
          variant="ghost"
          size="sm"
          onClick={() => fireToast('Dark navbar — Sign in clicked.')}
        />
        <Button
          label="Get started"
          variant="primary"
          size="sm"
          onClick={() => fireToast('Dark navbar — Get started clicked.')}
        />
      </div>
    </div>
  );

  const darkMobileBarStyle: CSSProperties = {
    ...styles.bar,
    ...styles.barOverlay,
    backgroundColor: \`rgba(9, 13, 26, \${Math.max(barAlpha, 0.2).toFixed(2)})\`,
    borderBottomColor: scrollPct > 8 ? DARK_HAIRLINE : 'transparent',
  };

  const darkFrame = (
    <section style={styles.section} aria-label={darkFrameMeta.title}>
      <SectionHeader frame={darkFrameMeta} />
      {renderControls(
        darkFrameMeta,
        <HStack gap={2} vAlign="center">
          <div style={{width: isPhone ? 160 : 220}}>
            <Slider
              label="Simulated scroll"
              min={0}
              max={100}
              step={1}
              value={scrollPct}
              onChange={(next: number) => setScrollPct(next)}
              formatValue={value => \`\${value}%\`}
            />
          </div>
          <Token
            label={scrollPct === 0 ? 'At top' : \`Scrolled \${scrollPct}%\`}
            size="sm"
            color={scrollPct > 40 ? 'green' : 'gray'}
          />
        </HStack>,
      )}
      <div style={styles.frameOuter}>
        <div
          style={{
            ...styles.viewport,
            ...(isDarkMobile && !isCompact ? styles.viewportPhone : null),
          }}>
          {/* Hero paints first; the bar floats above it. */}
          <div style={styles.hero}>
            <div
              style={{
                ...styles.heroInner,
                // Parallax nudge sells the simulated scroll.
                transform: \`translateY(\${-Math.round(scrollPct * 0.45)}px)\`,
              }}>
              <span style={styles.heroChip}>
                <Icon icon={SparklesIcon} size="xsm" color="inherit" />
                {HERO.chip}
              </span>
              <h3
                style={{
                  ...styles.heroHeadline,
                  ...(isDarkMobile ? styles.heroHeadlineCompact : null),
                }}>
                {HERO.headline}
              </h3>
              <p style={styles.heroSub}>{HERO.sub}</p>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Button
                  label="Start free"
                  variant="primary"
                  onClick={() => fireToast('Dark hero — Start free clicked.')}
                />
                <Button
                  label="Book a demo"
                  variant="secondary"
                  onClick={() => fireToast('Dark hero — Book a demo clicked.')}
                />
              </HStack>
            </div>
          </div>

          {isDarkMobile
            ? renderMobileBar(darkFrameMeta, 'dark', darkMobileBarStyle)
            : darkDesktopBar}
          {!isDarkMobile && megaMenu}

          {renderDrawer(darkFrameMeta, 'dark', false)}
        </div>
      </div>
    </section>
  );

  // ============= VARIANT 3: TWO-TIER WITH EYEBROW =============

  const tieredFrameMeta = FRAMES[2];
  const isTieredMobile = isMobileFrame('tiered');

  const eyebrowRow = (
    <div style={styles.eyebrow}>
      {!isTieredMobile &&
        EYEBROW_LINKS.map(label => (
          <button
            key={label}
            type="button"
            style={styles.eyebrowLink}
            onClick={() =>
              fireToast(\`Two-tier eyebrow — \${label} clicked.\`)
            }>
            {label}
          </button>
        ))}
      <span style={{...styles.eyebrowLink, cursor: 'default'}}>
        <span style={styles.statusDot} aria-hidden />
        All systems operational
      </span>
      <StackItem size="fill">
        <span />
      </StackItem>
      <span style={{...styles.eyebrowLink, cursor: 'default'}}>
        <Icon icon={PhoneIcon} size="xsm" color="inherit" />
        {EYEBROW_PHONE}
      </span>
      {!isTieredMobile && (
        <button
          type="button"
          style={styles.eyebrowLink}
          onClick={() => fireToast('Two-tier eyebrow — locale switch clicked.')}>
          <Icon icon={GlobeIcon} size="xsm" color="inherit" />
          {EYEBROW_LOCALE}
        </button>
      )}
    </div>
  );

  const compactFlyout = openOverlay === 'tiered-product' && (
    <div
      style={styles.compactPanel}
      data-overlay-panel="tiered-product"
      aria-label="Product menu">
      <div style={styles.compactBody}>
        <div style={styles.megaColumn}>
          {PRODUCT_LINKS.filter(link => link.group === 'platform').map(link => (
            <FlyoutLinkRow
              key={link.id}
              link={link}
              tone="light"
              isCompact
              onSelect={selected =>
                chooseFlyoutLink('Compact flyout', selected)
              }
            />
          ))}
        </div>
        <div style={styles.megaColumn}>
          {PRODUCT_LINKS.filter(
            link => link.group === 'solutions' || link.id === 'help',
          ).map(link => (
            <FlyoutLinkRow
              key={link.id}
              link={link}
              tone="light"
              isCompact
              onSelect={selected =>
                chooseFlyoutLink('Compact flyout', selected)
              }
            />
          ))}
        </div>
      </div>
      {/* Footer action bar. */}
      <div style={styles.compactFooter}>
        <Button
          label="Watch demo"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
          onClick={() => {
            closeOverlayWithFocus();
            fireToast('Compact flyout — Watch demo clicked.');
          }}
        />
        <Button
          label="Contact sales"
          variant="ghost"
          size="sm"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() => {
            closeOverlayWithFocus();
            fireToast('Compact flyout — Contact sales clicked.');
          }}
        />
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" size="xsm">
          Free 30-day trial
        </Text>
      </div>
    </div>
  );

  const tieredDesktopBar = (
    <div style={{...styles.bar, ...styles.barLight}}>
      <BrandMark subLabel="for teams" />
      <nav
        aria-label="Two-tier navbar primary"
        style={{...styles.barCenter, marginLeft: 'var(--spacing-3)'}}>
        <span style={styles.dropdownWrap} data-overlay-scope="tiered-product">
          {renderProductTrigger('tiered-product', 'light')}
          {compactFlyout}
        </span>
        {NAV_LINKS.filter(link => link.id !== 'product').map(link =>
          renderNavLink(tieredFrameMeta, link, 'light'),
        )}
      </nav>
      <div style={{...styles.barSide, ...styles.barSideEnd}}>
        <SquareIconButton
          label="Search"
          icon={SearchIcon}
          onClick={() => fireToast('Two-tier navbar — Search clicked.')}
        />
        <Button
          label="Contact sales"
          variant="secondary"
          size="sm"
          onClick={() => fireToast('Two-tier navbar — Contact sales clicked.')}
        />
        <Button
          label="Start free"
          variant="primary"
          size="sm"
          onClick={() => fireToast('Two-tier navbar — Start free clicked.')}
        />
      </div>
    </div>
  );

  const tieredFrame = (
    <section style={styles.section} aria-label={tieredFrameMeta.title}>
      <SectionHeader frame={tieredFrameMeta} />
      {renderControls(tieredFrameMeta)}
      <div style={styles.frameOuter}>
        <div
          style={{
            ...styles.viewport,
            ...(isTieredMobile && !isCompact ? styles.viewportPhone : null),
          }}>
          {eyebrowRow}
          {isTieredMobile
            ? renderMobileBar(tieredFrameMeta, 'light', {
                ...styles.bar,
                ...styles.barLight,
              })
            : tieredDesktopBar}

          <div style={styles.contentStrip}>
            <Token label="Trusted by 4,200 teams" size="sm" color="green" />
            <Heading level={3}>Everything ships with support included</Heading>
            <Text type="supporting" color="secondary">
              Placeholder page content — the two-tier chrome above stays
              fixed while Product opens the compact flyout over this strip.
            </Text>
            <div style={styles.mockCards} aria-hidden>
              <div style={styles.mockCard} />
              <div style={styles.mockCard} />
              {!isTieredMobile && <div style={styles.mockCard} />}
            </div>
          </div>

          {renderDrawer(tieredFrameMeta, 'light', true)}
        </div>
      </div>
    </section>
  );

  // ============= FRAME =============

  const openMeta =
    openOverlay === null
      ? null
      : FRAMES.find(frame => openOverlay.startsWith(frame.id)) ?? null;

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider role="banner">
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={2}>Navbars & Flyout Menus</Heading>
                  <Text type="supporting" color="secondary">
                    Three treatments over one shared nav fixture
                  </Text>
                </VStack>
              </StackItem>
              <Badge
                label={
                  openMeta === null
                    ? 'All menus closed'
                    : \`\${openMeta.toastName} menu open\`
                }
                variant={openMeta === null ? undefined : 'info'}
              />
              {!isCompact && (
                <Button
                  label={
                    allPreviewOn ? 'Exit phone preview' : 'Preview all at 375px'
                  }
                  variant="secondary"
                  size="sm"
                  onClick={togglePreviewAll}
                />
              )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Navbar and flyout showcase">
            <div
              style={{
                ...styles.column,
                ...(isPhone ? styles.columnCompact : null),
              }}>
              {lightFrame}
              {darkFrame}
              {tieredFrame}
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