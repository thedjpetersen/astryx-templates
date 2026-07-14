var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file careers-jobs-landing.tsx
 * @input Deterministic fixtures only (the fictional "Halyard" coastal-freight
 *   software startup: a mission headline with three count-up stats, five
 *   gradient collage tiles with candid captions, four values cards, six
 *   benefit rows, twelve open roles across Engineering/Design/GTM with
 *   locations, two-row comp bands, summaries and ownership bullets, a
 *   four-step hiring-process timeline with durations and honesty footnotes,
 *   three employee quotes, and footer link groups)
 * @output Complete careers landing page: sticky navbar (brand mark, five
 *   smooth-scrolling anchor links with scroll-spy, "See open roles" CTA;
 *   links collapse behind a hamburger dropdown at compact widths), a hero
 *   with mission copy, count-up stats and a photo-tile collage whose
 *   spotlight tile rotates on a timer (hover pins, click jumps,
 *   reduced-motion static), a values grid, a full-bleed benefits band, the
 *   roles list with department filter chips + location Selector live-filter,
 *   inline row expansion to a summary + Apply button that reveals a
 *   validating name/email/link mini-form with a success state, a
 *   hiring-process timeline, an auto-advancing "life here" quote carousel
 *   (pause on hover, dots + arrows), an open-application card, and a dark
 *   sitemap footer. Scroll-reveals rise+fade once per section.
 * @position Page template; emitted by \`astryx template careers-jobs-landing\`
 *
 * Frame: Layout height="fill", content-only — a careers page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns smooth-scroll + scroll-spy; the
 * navbar inside it is position:sticky top:0. A centered 1120px column
 * carries hero, values, roles, and process; the benefits band and the
 * quote carousel band paint full-bleed muted with inner 1120px columns,
 * and the footer paints full-bleed dark.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll the container to real
 *   section ids with a sticky-nav allowance; onScroll spies the last
 *   anchor above the fold line (aria-current). The compact hamburger
 *   dropdown closes on Escape (refocusing the trigger), outside
 *   pointerdown, or any selection.
 * - Collage spotlight advances every 3.2s; hovering the collage pauses
 *   the timer, hovering or clicking a tile moves the spotlight there.
 * - Department chips (aria-pressed) and the location Selector live-filter
 *   the 12 role rows; a zero-match state offers one-click filter reset.
 * - A role row expands inline to summary + bullets + Apply; Apply reveals
 *   the mini-form. Submit validates (name required, email regex, link
 *   must look like a URL when present) with inline TextInput status
 *   errors; success swaps the form for a confirmation card that persists
 *   per role for the session.
 * - The quote carousel auto-advances every 5.2s, pauses while hovered,
 *   and is fully driveable via prev/next buttons and dots.
 * - Motion is gated by prefers-reduced-motion: reveals render visible,
 *   count-ups render final values, and the collage + carousel timers stop
 *   (manual controls keep working).
 *
 * Color policy: token-first with ONE quarantined accent literal (see
 * ACCENT below, with contrast math). Brand art — the logo tile and the
 * five collage gradients — is scheme-locked literal paint under
 * colorScheme:'dark' (candid-photo stand-ins must not reflow with the
 * theme), and the footer is a scheme-locked dark surface whose literal
 * soft-text shades exist only to stay readable there. Everything else
 * uses var(--color-*) tokens. No network assets, no clocks, no
 * randomness; timers tick from fixture state only.
 *
 * Responsive contract (measured with a local ResizeObserver, not viewport
 * media queries — the inline demo stage is ~1045px wide):
 * - Column: max-width 1120px, centered; bands and footer bleed full width.
 * - >900px: inline nav links + CTA; collage is a 3-column mosaic with the
 *   lead tile spanning two rows; process timeline runs horizontal 4-up.
 * - <=900px: nav links collapse behind a 40px hamburger dropdown; collage
 *   drops to 2 columns (lead tile spans both).
 * - <=760px: hero stacks (copy above collage), role-row comp moves under
 *   the title block, the process timeline goes vertical, and values /
 *   benefits grids step down via Grid minWidth.
 * - <=540px: headline and section type step down, the roles filter row
 *   stacks the Selector full-width, the apply form stacks its fields, and
 *   stat chips wrap. All chip rows wrap, so the page holds at 390px with
 *   no overflow-x.
 * - Tap targets: hamburger, carousel arrows, dots, chips, and role-row
 *   headers are ≥40px controls; nothing on the page requires hover.
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
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  AnchorIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DogIcon,
  GlobeIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  MapPinIcon,
  MenuIcon,
  MessageSquareIcon,
  PenToolIcon,
  ShipIcon,
  SunIcon,
  TentIcon,
  TrendingUpIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal — Halyard's harbor teal.
 * Contrast math: light #0F766E on #FFFFFF ≈ 5.9:1 (AA for normal text,
 * AAA for the 11px+bold eyebrows it labels); dark #5EEAD4 on a #1C1C1E
 * card ≈ 10.4:1. The muted wash below is the same literal at low alpha
 * and is used decoratively only (chip fills, discs) — never as text.
 */
const ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const ACCENT_WASH = 'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.14))';
const ACCENT_BORDER = 'light-dark(rgba(15, 118, 110, 0.38), rgba(94, 234, 212, 0.42))';

// Scheme-locked dark footer text shades (readable only on the locked
// footer surface; see Color policy in the header).
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.80)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.58)';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 140;

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
    maxWidth: 1120,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-9)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-7)',
  },
  bandColumn: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    padding: 'var(--spacing-8) var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  bandColumnCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  // ---- full-bleed tinted bands ----
  mutedBand: {
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
  // Scheme-locked brand art: teal→deep-sea gradient, white glyph.
  logoTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #14B8A6 0%, #134E4A 100%)',
    color: '#FFFFFF',
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
    backgroundColor: ACCENT_WASH,
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
  mobileMenu: {
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
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  // ---- section intro ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    paddingBlock: 'var(--spacing-4)',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
    paddingBlock: 0,
  },
  heroText: {
    flex: '5 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroCollage: {
    flex: '6 1 0',
    minWidth: 0,
  },
  heroHeadline: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.1,
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
    maxWidth: 480,
    margin: 0,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // ---- collage ----
  collageGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr 1fr',
    gridAutoRows: 128,
    gap: 'var(--spacing-2)',
  },
  collageGridCompact: {
    gridTemplateColumns: '1fr 1fr',
    gridAutoRows: 116,
  },
  // Scheme-locked brand art: candid-photo stand-in gradients.
  collageTile: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    colorScheme: 'dark',
    color: '#FFFFFF',
    textAlign: 'left',
    display: 'block',
    width: '100%',
    height: '100%',
    transition: 'transform 320ms ease, box-shadow 320ms ease',
  },
  collageTileSpotlit: {
    transform: 'scale(1.02)',
    boxShadow: \`0 0 0 2px \${ACCENT}, var(--shadow-med, 0 6px 18px rgba(0, 0, 0, 0.18))\`,
    zIndex: 1,
  },
  collageGlyph: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.55,
  },
  collageCaption: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    padding: '18px 12px 10px',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.3,
    background: 'linear-gradient(180deg, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.78) 100%)',
    transition: 'opacity 320ms ease',
  },
  // ---- values ----
  valueCard: {
    height: '100%',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  valueIndex: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
  },
  // ---- benefits ----
  benefitDisc: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  // ---- roles ----
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  filterChipActive: {
    color: ACCENT,
    backgroundColor: ACCENT_WASH,
    borderColor: ACCENT_BORDER,
  },
  chipCount: {
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.75,
  },
  roleList: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  roleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    padding: 'var(--spacing-3) var(--spacing-4)',
    minHeight: 64,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
    color: 'var(--color-text-primary)',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.3,
    margin: 0,
  },
  locationChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  compValue: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  compExtra: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  roleBody: {
    padding: '0 var(--spacing-4) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  roleBullet: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    flexShrink: 0,
    marginTop: 7,
  },
  applyForm: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  successDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  emptyState: {
    padding: 'var(--spacing-7) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    textAlign: 'center',
  },
  // ---- process timeline ----
  processRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'stretch',
  },
  processRowStacked: {
    flexDirection: 'column',
  },
  processStep: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  processDisc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
  },
  processTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'var(--color-border)',
    alignSelf: 'center',
  },
  // ---- quote carousel ----
  quoteCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    minHeight: 220,
    boxSizing: 'border-box',
  },
  quoteText: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.45,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  quoteTextCompact: {
    fontSize: 16,
  },
  // Scheme-locked brand art: employee monogram gradients.
  quoteAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
  },
  carouselDot: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  carouselDotInner: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
  },
  carouselDotInnerActive: {
    backgroundColor: ACCENT,
  },
  arrowButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    padding: 0,
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  // ---- open application card ----
  pitchCard: {
    borderRadius: 16,
    border: \`1px dashed \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_WASH,
    padding: 'var(--spacing-5)',
  },
  monoText: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    fontWeight: 600,
  },
  // ---- footer (scheme-locked dark surface) ----
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
    gap: 'var(--spacing-5)',
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
};

// ============= DATA =============
// Deterministic fixtures for the fictional Halyard careers page.
// No Date.now, no randomness, no network assets.

const BRAND = {
  name: 'Halyard',
  tagline: 'Routing software for short-sea freight',
};

type SectionId = 'values' | 'benefits' | 'roles' | 'process' | 'life';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'values', label: 'Values'},
  {id: 'benefits', label: 'Benefits'},
  {id: 'roles', label: 'Open roles'},
  {id: 'process', label: 'Process'},
  {id: 'life', label: 'Life here'},
];

const HERO = {
  eyebrow: 'Careers at Halyard',
  headline: 'Build the software that moves the coast',
  subcopy:
    'Halyard plans routes, tide windows, and berth slots for 214 short-sea ' +
    'carriers. We are 60 people across 14 countries, profitable since 2024, ' +
    'and we would rather hire slowly than hire wrong.',
};

const HERO_STATS: readonly {value: number; label: string}[] = [
  {value: 60, label: 'teammates'},
  {value: 14, label: 'countries'},
  {value: 12, label: 'open roles'},
];

interface CollageTile {
  id: string;
  caption: string;
  icon: Glyph;
  /** Scheme-locked candid-photo stand-in gradient (see Color policy). */
  gradient: string;
}

const COLLAGE: readonly CollageTile[] = [
  {
    id: 'retreat',
    caption: 'All-hands retreat, Óbidos — September 2025',
    icon: TentIcon,
    gradient: 'linear-gradient(140deg, #14B8A6 0%, #0F766E 55%, #115E59 100%)',
  },
  {
    id: 'whiteboard',
    caption: 'Whiteboarding the tide-window router, v3',
    icon: PenToolIcon,
    gradient: 'linear-gradient(140deg, #F59E0B 0%, #D97706 60%, #92400E 100%)',
  },
  {
    id: 'install',
    caption: 'First install day, Port of Rotterdam',
    icon: ShipIcon,
    gradient: 'linear-gradient(140deg, #6366F1 0%, #4338CA 60%, #312E81 100%)',
  },
  {
    id: 'crit',
    caption: 'Tuesday design crit — cameras optional',
    icon: MessageSquareIcon,
    gradient: 'linear-gradient(140deg, #F472B6 0%, #DB2777 60%, #9D174D 100%)',
  },
  {
    id: 'dog',
    caption: 'Bó, chief morale officer, Lisbon HQ',
    icon: DogIcon,
    gradient: 'linear-gradient(140deg, #38BDF8 0%, #0284C7 60%, #075985 100%)',
  },
];

const VALUES: readonly {id: string; title: string; copy: string}[] = [
  {
    id: 'ship',
    title: 'Ship small, ship weekly',
    copy:
      'Every team cuts a release on Thursday. If a feature cannot ship in ' +
      'slices, we redesign the feature — not the calendar.',
  },
  {
    id: 'doc',
    title: 'Disagree in the doc',
    copy:
      'Decisions live in written proposals with open comments. The best ' +
      'argument wins; job titles do not get a vote multiplier.',
  },
  {
    id: 'customers',
    title: 'Customers over demos',
    copy:
      'We build for the dispatcher on a night shift, not the conference ' +
      'keynote. Everyone does three support rotations a year — founders included.',
  },
  {
    id: 'pace',
    title: 'Sustainable pace',
    copy:
      'No hero culture. On-call is paid, comp time is enforced, and we staff ' +
      'projects so one vacation never blocks a launch.',
  },
];

const BENEFITS: readonly {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}[] = [
  {
    id: 'equity',
    icon: TrendingUpIcon,
    title: 'Meaningful equity',
    copy:
      'Every offer includes equity with a 10-year exercise window and annual refresh grants.',
  },
  {
    id: 'health',
    icon: HeartPulseIcon,
    title: 'Full health cover',
    copy:
      '100% of premiums for you and your dependents — medical, dental, vision — from day one.',
  },
  {
    id: 'remote',
    icon: GlobeIcon,
    title: 'Remote-first, truly',
    copy:
      'Docs over meetings across 14 countries. Two overlap hours a day is the only fixed rule.',
  },
  {
    id: 'retreat',
    icon: TentIcon,
    title: 'Two retreats a year',
    copy:
      'The whole company, somewhere with bad Wi-Fi on purpose. Partners join one of the two.',
  },
  {
    id: 'learning',
    icon: GraduationCapIcon,
    title: '$2,400 learning budget',
    copy:
      'Books, courses, conferences — auto-approved, and no receipts theater under $200.',
  },
  {
    id: 'pto',
    icon: SunIcon,
    title: '20 days minimum PTO',
    copy:
      'A floor, not a ceiling. We track usage and chase you if you are under it by Q3.',
  },];

type Department = 'engineering' | 'design' | 'gtm';
type DeptFilter = 'all' | Department;
type LocationId = 'remote-us' | 'remote-eu' | 'lisbon' | 'nyc';

const DEPT_LABELS: Record<Department, string> = {
  engineering: 'Engineering',
  design: 'Design',
  gtm: 'GTM',
};

const LOCATION_LABELS: Record<LocationId, string> = {
  'remote-us': 'Remote (US)',
  'remote-eu': 'Remote (EU)',
  lisbon: 'Lisbon HQ',
  nyc: 'New York',
};

interface Role {
  id: string;
  title: string;
  dept: Department;
  team: string;
  location: LocationId;
  /** Comp renders on two rows: salary band + equity/OTE note. */
  salary: string;
  compExtra: string;
  isNew?: boolean;
  summary: string;
  bullets: readonly string[];
}

const ROLES: readonly Role[] = [
  {
    id: 'eng-backend-routing',
    title: 'Senior Backend Engineer, Routing',
    dept: 'engineering',
    team: 'Routing',
    location: 'remote-eu',
    salary: '$110k – $140k',
    compExtra: '+ 0.08% – 0.15% equity',
    isNew: true,
    summary:
      'Own the tide-window solver that plans 3,800 port calls a week. You will ' +
      'work in Go and Postgres on a codebase with 84% test coverage and a ' +
      'deploy that takes eleven minutes.',
    bullets: [
      'Cut median route-recompute time below 400ms (currently 900ms)',
      'Design the multi-leg berth conflict resolver with the Routing trio',
      'Pair with dispatchers at two customer ports each quarter',
    ],
  },
  {
    id: 'eng-frontend-console',
    title: 'Staff Frontend Engineer, Console',
    dept: 'engineering',
    team: 'Console',
    location: 'remote-us',
    salary: '$185k – $220k',
    compExtra: '+ 0.10% – 0.20% equity',
    summary:
      'Lead the dispatcher console — a dense, keyboard-first React app used ' +
      'for eight-hour shifts. You will set the frontend architecture bar for ' +
      'a team of five.',
    bullets: [
      'Ship the live berth-board rewrite (virtualized, offline-tolerant)',
      'Own the design-system contract with our two product designers',
      'Mentor two mid-level engineers with weekly pairing blocks',
    ],
  },
  {
    id: 'eng-sre-platform',
    title: 'Site Reliability Engineer',
    dept: 'engineering',
    team: 'Platform',
    location: 'remote-eu',
    salary: '$95k – $125k',
    compExtra: '+ 0.06% – 0.12% equity',
    isNew: true,
    summary:
      'Keep a 99.95% SLO honest across three regions. Our stack is boring on ' +
      'purpose: Kubernetes, Terraform, and a paging rota that fired 14 times ' +
      'in the last year.',
    bullets: [
      'Own capacity planning for the January carrier-contract season',
      'Bring staging parity to the port-integration sandboxes',
      'Halve our mean time to a green incident-review doc (now 9 days)',
    ],
  },
  {
    id: 'eng-data-forecasting',
    title: 'Data Engineer, Forecasting',
    dept: 'engineering',
    team: 'Forecasting',
    location: 'lisbon',
    salary: '$88k – $112k',
    compExtra: '+ 0.05% – 0.10% equity',
    summary:
      'Build the pipelines behind demand and delay forecasts: 40M AIS ' +
      'positions a day into dbt models the whole company reads. SQL first, ' +
      'Python where it earns its keep.',
    bullets: [
      'Rebuild the delay-attribution mart (today: one 2,000-line query)',
      'Ship freshness SLAs and alerts for the six most-read models',
      'Sit with the Routing team one week per month',
    ],
  },
  {
    id: 'eng-mobile-deckhand',
    title: 'Mobile Engineer, Deckhand app',
    dept: 'engineering',
    team: 'Mobile',
    location: 'remote-eu',
    salary: '$92k – $118k',
    compExtra: '+ 0.05% – 0.10% equity',
    summary:
      'Deckhand is our offline-first React Native app for crews with gloves ' +
      'on and one bar of signal. Small team, big surface: you would be ' +
      'engineer two of two.',
    bullets: [
      'Make sync conflict resolution boring (CRDT groundwork is in)',
      'Ship the cargo-checklist scanner for the Rotterdam pilot',
      'Own release trains for both app stores',
    ],
  },
  {
    id: 'eng-manager-platform',
    title: 'Engineering Manager, Platform',
    dept: 'engineering',
    team: 'Platform',
    location: 'nyc',
    salary: '$200k – $235k',
    compExtra: '+ 0.12% – 0.22% equity',
    summary:
      'Manage six platform engineers across four timezones. We expect ' +
      'managers to write code one day a week and to run the calmest on-call ' +
      'in the company.',
    bullets: [
      'Own the platform roadmap with our CTO (quarterly, written, public)',
      'Grow two seniors toward staff scope this year',
      'Keep the paging rota humane — it is a stated KPI',
    ],
  },
  {
    id: 'design-product-console',
    title: 'Product Designer, Console',
    dept: 'design',
    team: 'Design',
    location: 'remote-eu',
    salary: '$95k – $120k',
    compExtra: '+ 0.06% – 0.12% equity',
    isNew: true,
    summary:
      'Design for dispatchers who measure software in saved keystrokes. You ' +
      'will own the console end-to-end with a staff engineer counterpart and ' +
      'ship every two weeks.',
    bullets: [
      'Redesign the berth-conflict flow (our #1 support theme)',
      'Run monthly ride-alongs with dispatch teams in two ports',
      'Co-own the Figma-to-tokens pipeline with Console engineers',
    ],
  },
  {
    id: 'design-brand',
    title: 'Brand Designer',
    dept: 'design',
    team: 'Design',
    location: 'lisbon',
    salary: '$70k – $90k',
    compExtra: '+ 0.04% – 0.08% equity',
    summary:
      'First dedicated brand hire. Everything from the trade-show booth to ' +
      'the release-notes illustrations is yours; the current "brand kit" is ' +
      'a logo and three strong opinions.',
    bullets: [
      'Build the brand system (type, color, illustration) by Q1 2027',
      'Own two product-launch campaigns a year with Marketing',
      'Art-direct the annual Coastal Freight Report',
    ],
  },
  {
    id: 'gtm-ae-midmarket',
    title: 'Account Executive, Mid-market',
    dept: 'gtm',
    team: 'Sales',
    location: 'nyc',
    salary: '$90k – $110k base',
    compExtra: 'OTE $180k – $220k, 50/50 split',
    isNew: true,
    summary:
      'Sell to carrier ops directors on 60-90 day cycles with a 34% win ' +
      'rate from qualified pipe. Quota is set from last year\\'s median ' +
      'attainment, not last year\\'s best quarter.',
    bullets: [
      'Own 40 named mid-market accounts in the US Northeast',
      'Run the full cycle from discovery through security review',
      'Feed pricing signal into the quarterly packaging review',
    ],
  },
  {
    id: 'gtm-solutions-engineer',
    title: 'Solutions Engineer',
    dept: 'gtm',
    team: 'Sales',
    location: 'remote-us',
    salary: '$130k – $155k',
    compExtra: '+ 10% variable, paid quarterly',
    summary:
      'Own the technical side of every mid-market and enterprise deal: ' +
      'integration scoping, sandbox builds, and the security questionnaire ' +
      'gauntlet. You will write real API integrations weekly.',
    bullets: [
      'Build reusable TMS/ERP integration playbooks (SAP, CargoWise)',
      'Cut proof-of-concept time from 3 weeks to 1',
      'Be the field voice in the monthly API design review',
    ],
  },
  {
    id: 'gtm-pmm-lead',
    title: 'Product Marketing Lead',
    dept: 'gtm',
    team: 'Marketing',
    location: 'remote-us',
    salary: '$140k – $165k',
    compExtra: '+ 0.05% – 0.10% equity',
    summary:
      'First PMM. Turn "routing engine with tide windows" into language a ' +
      'fleet director repeats in their budget meeting. You will own ' +
      'positioning, launches, and the sales narrative.',
    bullets: [
      'Rewrite positioning off 20 win/loss interviews in your first quarter',
      'Own launch tiers and the launch calendar company-wide',
      'Ship the competitive field guide Sales actually opens',
    ],
  },
  {
    id: 'gtm-csm-emea',
    title: 'Customer Success Manager, EMEA',
    dept: 'gtm',
    team: 'Customer Success',
    location: 'lisbon',
    salary: '$75k – $95k',
    compExtra: '+ 8% variable on net retention',
    summary:
      'Own 28 EMEA carrier accounts through onboarding, QBRs, and renewals. ' +
      'Net revenue retention is 118%; your job is to keep churn boring and ' +
      'expansion honest.',
    bullets: [
      'Run onboarding for 2-3 new carriers a month (4-week program)',
      'Own the renewal book for the Iberia and Benelux regions',
      'Escalate product gaps with evidence, not vibes',
    ],
  },
];

const LOCATION_OPTIONS = [
  {value: 'all', label: 'All locations'},
  {value: 'remote-us', label: 'Remote (US)'},
  {value: 'remote-eu', label: 'Remote (EU)'},
  {value: 'lisbon', label: 'Lisbon HQ'},
  {value: 'nyc', label: 'New York'},
];

const PROCESS_STEPS: readonly {
  id: string;
  title: string;
  duration: string;
  copy: string;
}[] = [
  {
    id: 'intro',
    title: 'Intro call',
    duration: '30 min',
    copy:
      'With the hiring manager, not a recruiter screen. We share the comp band before this call ends.',
  },
  {
    id: 'craft',
    title: 'Craft session',
    duration: '60–90 min',
    copy:
      'A real problem from our backlog in your discipline. No trick questions, no whiteboard algorithms.',
  },
  {
    id: 'loop',
    title: 'Team loop',
    duration: 'Half a day',
    copy:
      'Four future teammates across two calls, plus 30 minutes with a founder. Scheduled around your timezone.',
  },
  {
    id: 'decision',
    title: 'Decision',
    duration: 'Within 48 h',
    copy:
      'A written yes or no with specific feedback either way. We call references only after you hold an offer.',
  },
];

const PROCESS_FOOTNOTES: readonly string[] = [
  'Median 11 days from application to offer',
  'Take-home work over 2 hours is paid at $100/hour',
  'Interview childcare costs covered',
];

interface EmployeeQuote {
  id: string;
  quote: string;
  name: string;
  initials: string;
  role: string;
  tenure: string;
  /** Scheme-locked monogram gradient (see Color policy). */
  gradient: string;
}

const QUOTES: readonly EmployeeQuote[] = [
  {
    id: 'sofia',
    quote:
      'I have shipped more in two years here than in six at my last company. ' +
      'The Óbidos retreat where we redesigned the tide-window router on paper ' +
      'napkins is still my favorite week of work, ever.',
    name: 'Sofia Marques',
    initials: 'SM',
    role: 'Senior Engineer, Routing',
    tenure: '2 years at Halyard',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #4338CA 100%)',
  },
  {
    id: 'devon',
    quote:
      'Remote-first actually means it. Decisions happen in docs I can read ' +
      'from Porto on my own hours — I have never lost an argument because I ' +
      'was not standing in a hallway.',
    name: 'Devon Okafor',
    initials: 'DO',
    role: 'Product Designer',
    tenure: '18 months at Halyard',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)',
  },
  {
    id: 'priya',
    quote:
      'The 20-days-minimum PTO rule has teeth. Last spring my manager noticed ' +
      'I was behind on days off and blocked two weeks in my calendar before I ' +
      'could argue about it.',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Customer Success, EMEA',
    tenure: '3 years at Halyard',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
  },
];

const FOOTER_GROUPS: readonly {
  id: string;
  heading: string;
  links: readonly {label: string; anchor?: SectionId}[];
}[] = [
  {
    id: 'join',
    heading: 'Join us',
    links: [
      {label: 'Open roles', anchor: 'roles'},
      {label: 'How we hire', anchor: 'process'},
      {label: 'Benefits', anchor: 'benefits'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      {label: 'Values', anchor: 'values'},
      {label: 'Life at Halyard', anchor: 'life'},
      {label: 'Press kit'},
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    links: [{label: 'careers@halyard.co'}, {label: 'hello@halyard.co'}],
  },
];

// ============= HELPERS =============

const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

interface ApplyFormValues {
  name: string;
  email: string;
  link: string;
}

type ApplyFormErrors = Partial<Record<keyof ApplyFormValues, string>>;

const EMPTY_APPLY_FORM: ApplyFormValues = {name: '', email: '', link: ''};

function validateApplyForm(values: ApplyFormValues): ApplyFormErrors {
  const errors: ApplyFormErrors = {};
  if (values.name.trim().length === 0) {
    errors.name = 'Tell us your name.';
  }
  if (values.email.trim().length === 0) {
    errors.email = 'We need an email to reply to.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "That doesn't look like an email address.";
  }
  const link = values.link.trim();
  if (link.length > 0 && !/\\./.test(link)) {
    errors.link = 'Add a full URL, or leave this blank.';
  }
  return errors;
}

/** Measure the page's own width (the inline demo stage is ~1045px wide,
 * so viewport media queries never fire there). */
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

function usePrefersReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/** Fire-once in-view flag for scroll reveals and count-ups. */
function useInViewOnce(
  ref: RefObject<HTMLDivElement | null>,
  threshold = 0.15,
): boolean {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
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
      {threshold},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return isInView;
}

// ============= SMALL PIECES =============

/** Scroll-reveal wrapper: rise+fade 12px, fires once; reduced-motion
 * renders visible immediately. */
function Reveal({children, delay = 0}: {children: ReactNode; delay?: number}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInViewOnce(ref);
  const isReduced = usePrefersReducedMotion();
  const isShown = isReduced || isInView;
  return (
    <div
      ref={ref}
      style={{
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'translateY(12px)',
        transition: isReduced
          ? 'none'
          : \`opacity 520ms ease \${delay}ms, transform 520ms ease \${delay}ms\`,
      }}>
      {children}
    </div>
  );
}

/** Integer count-up on first view; reduced-motion renders the final value. */
function CountUp({
  value,
  isStarted,
  isReduced,
}: {
  value: number;
  isStarted: boolean;
  isReduced: boolean;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isStarted) {
      return undefined;
    }
    if (isReduced) {
      setDisplay(value);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isStarted, isReduced, value]);
  return <>{display.toLocaleString('en-US')}</>;
}

/** Section intro: accent eyebrow + heading + supporting copy. */
function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <VStack gap={1}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <Heading level={2}>{title}</Heading>
      {description != null && (
        <Text type="supporting" color="secondary">
          {description}
        </Text>
      )}
    </VStack>
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

// ============= PAGE =============

export default function CareersJobsLandingTemplate() {
  // ---- responsive: measure our own width (demo-stage quirk) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 900;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isPhone = wrapWidth > 0 && wrapWidth <= 540;

  const isReduced = usePrefersReducedMotion();

  // ---- navbar ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- hero stats count-up ----
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInViewOnce(statsRef, 0.4);

  // ---- collage spotlight (signature hero moment) ----
  const [spotlight, setSpotlight] = useState(0);
  const [isCollageHovered, setIsCollageHovered] = useState(false);

  // ---- roles filters + expansion + apply form ----
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyValues, setApplyValues] =
    useState<ApplyFormValues>(EMPTY_APPLY_FORM);
  const [applyErrors, setApplyErrors] = useState<ApplyFormErrors>({});
  const [submittedRoleIds, setSubmittedRoleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [submittedName, setSubmittedName] = useState('');

  // ---- quote carousel ----
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuoteHovered, setIsQuoteHovered] = useState(false);

  // Collage spotlight rotates every 3.2s; hover pauses, reduced-motion
  // stops it entirely (tiles stay clickable).
  useEffect(() => {
    if (isReduced || isCollageHovered) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setSpotlight(previous => (previous + 1) % COLLAGE.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [isReduced, isCollageHovered]);

  // Quote carousel auto-advances every 5.2s under the same gating.
  useEffect(() => {
    if (isReduced || isQuoteHovered) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setQuoteIndex(previous => (previous + 1) % QUOTES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [isReduced, isQuoteHovered]);

  // Hamburger menu dismisses on Escape (refocusing the trigger) and on
  // any pointerdown outside the sticky navbar.
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

  /** Smooth-scroll the page container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container === null || section == null) {
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

  const toggleRole = (id: string) => {
    setIsApplyOpen(false);
    setApplyValues(EMPTY_APPLY_FORM);
    setApplyErrors({});
    setExpandedRoleId(previous => (previous === id ? null : id));
  };

  const setApplyField = (field: keyof ApplyFormValues) => (value: string) => {
    setApplyValues(previous => ({...previous, [field]: value}));
    setApplyErrors(previous => ({...previous, [field]: undefined}));
  };

  const submitApplication = (role: Role) => {
    const errors = validateApplyForm(applyValues);
    if (errors.name != null || errors.email != null || errors.link != null) {
      setApplyErrors(errors);
      return;
    }
    setSubmittedName(applyValues.name.trim().split(' ')[0] ?? '');
    setSubmittedRoleIds(previous => {
      const next = new Set(previous);
      next.add(role.id);
      return next;
    });
    setIsApplyOpen(false);
    setApplyValues(EMPTY_APPLY_FORM);
    setApplyErrors({});
  };

  const clearRoleFilters = () => {
    setDeptFilter('all');
    setLocationFilter('all');
  };

  // ---- derived ----
  const deptCounts: Record<DeptFilter, number> = {
    all: ROLES.length,
    engineering: ROLES.filter(role => role.dept === 'engineering').length,
    design: ROLES.filter(role => role.dept === 'design').length,
    gtm: ROLES.filter(role => role.dept === 'gtm').length,
  };
  const visibleRoles = ROLES.filter(
    role =>
      (deptFilter === 'all' || role.dept === deptFilter) &&
      (locationFilter === 'all' || role.location === locationFilter),
  );

  // ============= CHROME =============

  const brandMark = (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={AnchorIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        {!isPhone && (
          <Text type="supporting" color="secondary">
            {BRAND.tagline}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Careers page">
      <div style={styles.navInner}>
        {brandMark}
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCompact &&
          NAV_ANCHORS.map(anchor => (
            <button
              key={anchor.id}
              type="button"
              aria-current={activeSection === anchor.id ? 'true' : undefined}
              style={{
                ...styles.navLink,
                ...(activeSection === anchor.id ? styles.navLinkActive : null),
              }}
              onClick={() => jumpToSection(anchor.id)}>
              {anchor.label}
            </button>
          ))}
        {!isNavCompact && (
          <Button
            label="See open roles"
            variant="primary"
            size="sm"
            onClick={() => jumpToSection('roles')}
          />
        )}
        {isNavCompact && (
          <button
            type="button"
            ref={menuTriggerRef}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            style={styles.iconButton}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        )}
        {isNavCompact && isMenuOpen && (
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
              <Button
                label="See open roles"
                variant="primary"
                size="sm"
                onClick={() => jumpToSection('roles')}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const collage = (
    <div
      style={{
        ...styles.collageGrid,
        ...(isNavCompact ? styles.collageGridCompact : null),
      }}
      onMouseEnter={() => setIsCollageHovered(true)}
      onMouseLeave={() => setIsCollageHovered(false)}>
      {COLLAGE.map((tile, index) => {
        const isSpotlit = spotlight === index;
        const lead = index === 0;
        return (
          <button
            key={tile.id}
            type="button"
            aria-label={tile.caption}
            onClick={() => setSpotlight(index)}
            onMouseEnter={() => setSpotlight(index)}
            style={{
              ...styles.collageTile,
              background: tile.gradient,
              ...(lead
                ? isNavCompact
                  ? {gridColumn: 'span 2'}
                  : {gridRow: 'span 2'}
                : null),
              ...(isSpotlit ? styles.collageTileSpotlit : null),
            }}>
            <span style={styles.collageGlyph} aria-hidden="true">
              <Icon icon={tile.icon} size="md" color="inherit" />
            </span>
            <span
              style={{
                ...styles.collageCaption,
                opacity: isSpotlit ? 1 : 0.55,
              }}>
              {tile.caption}
            </span>
          </button>
        );
      })}
    </div>
  );

  const hero = (
    <div
      style={{
        ...styles.heroRow,
        ...(isStacked ? styles.heroRowStacked : null),
      }}>
      <div style={styles.heroText}>
        <span style={styles.eyebrow}>{HERO.eyebrow}</span>
        <h1
          style={{
            ...styles.heroHeadline,
            ...(isPhone ? styles.heroHeadlineCompact : null),
          }}>
          {HERO.headline}
        </h1>
        <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
        <HStack gap={2} wrap="wrap">
          <Button
            label={\`See \${ROLES.length} open roles\`}
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => jumpToSection('roles')}
          />
          <Button
            label="How we hire"
            variant="secondary"
            onClick={() => jumpToSection('process')}
          />
        </HStack>
        <div ref={statsRef}>
          <HStack gap={5} wrap="wrap">
            {HERO_STATS.map(stat => (
              <VStack key={stat.label} gap={0}>
                <span style={styles.statValue}>
                  <CountUp
                    value={stat.value}
                    isStarted={statsInView}
                    isReduced={isReduced}
                  />
                </span>
                <span style={styles.statLabel}>{stat.label}</span>
              </VStack>
            ))}
          </HStack>
        </div>
      </div>
      <div style={styles.heroCollage}>{collage}</div>
    </div>
  );

  // ============= VALUES =============

  const valuesSection = (
    <section ref={registerSection('values')} aria-label="Values">
      <Reveal>
        <VStack gap={5}>
          <SectionIntro
            eyebrow="How we work"
            title="Four values we actually enforce"
            description="Not poster words — each one shows up in a process you can point at."
          />
          <Grid columns={{minWidth: 230, max: 4}} gap={3}>
            {VALUES.map((value, index) => (
              <div key={value.id} style={styles.valueCard}>
                <span style={styles.valueIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Text type="label">{value.title}</Text>
                <Text type="supporting" color="secondary">
                  {value.copy}
                </Text>
              </div>
            ))}
          </Grid>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= BENEFITS (full-bleed band) =============

  const benefitsSection = (
    <section
      ref={registerSection('benefits')}
      aria-label="Benefits"
      style={styles.mutedBand}>
      <div
        style={{
          ...styles.bandColumn,
          ...(isPhone ? styles.bandColumnCompact : null),
        }}>
        <Reveal>
          <VStack gap={5}>
            <SectionIntro
              eyebrow="Benefits"
              title="The boring-on-purpose package"
              description="No ping-pong tables in the deck. Six things that matter, in writing."
            />
            <Grid columns={{minWidth: 290, max: 3}} gap={4}>
              {BENEFITS.map(benefit => (
                <HStack key={benefit.id} gap={3} vAlign="start">
                  <div style={styles.benefitDisc} aria-hidden="true">
                    <Icon icon={benefit.icon} size="sm" color="inherit" />
                  </div>
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {benefit.title}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {benefit.copy}
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
              ))}
            </Grid>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ============= ROLES =============

  const renderApplyPanel = (role: Role) => {
    if (submittedRoleIds.has(role.id)) {
      return (
        <div style={styles.applyForm} role="status">
          <HStack gap={3} vAlign="center">
            <div style={styles.successDisc} aria-hidden="true">
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {submittedName.length > 0
                  ? \`Thanks, \${submittedName} — your application is in.\`
                  : 'Thanks — your application is in.'}
              </Text>
              <Text type="supporting" color="secondary">
                A human reads every application for {role.title}. We reply
                within 3 working days, whatever the answer.
              </Text>
            </VStack>
          </HStack>
        </div>
      );
    }
    if (!isApplyOpen) {
      return (
        <HStack gap={2} wrap="wrap">
          <Button
            label="Apply for this role"
            variant="primary"
            size="sm"
            onClick={() => setIsApplyOpen(true)}
          />
          <Text type="supporting" color="secondary">
            {role.salary} · {LOCATION_LABELS[role.location]}
          </Text>
        </HStack>
      );
    }
    return (
      <div style={styles.applyForm}>
        <Text size="sm" weight="semibold">
          Apply — {role.title}
        </Text>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
            flexDirection: isPhone ? 'column' : 'row',
          }}>
          <StackItem size="fill">
            <TextInput
              label="Full name"
              isRequired
              placeholder="Alex Ferreira"
              value={applyValues.name}
              onChange={setApplyField('name')}
              status={
                applyErrors.name != null
                  ? {type: 'error', message: applyErrors.name}
                  : undefined
              }
            />
          </StackItem>
          <StackItem size="fill">
            <TextInput
              label="Email"
              type="email"
              isRequired
              placeholder="you@example.com"
              value={applyValues.email}
              onChange={setApplyField('email')}
              status={
                applyErrors.email != null
                  ? {type: 'error', message: applyErrors.email}
                  : undefined
              }
            />
          </StackItem>
        </div>
        <TextInput
          label="Portfolio, GitHub, or LinkedIn"
          isOptional
          placeholder="https://…"
          value={applyValues.link}
          onChange={setApplyField('link')}
          status={
            applyErrors.link != null
              ? {type: 'error', message: applyErrors.link}
              : undefined
          }
        />
        <HStack gap={2} wrap="wrap">
          <Button
            label="Submit application"
            variant="primary"
            size="sm"
            onClick={() => submitApplication(role)}
          />
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsApplyOpen(false);
              setApplyErrors({});
            }}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          No cover letter required. We share the interview plan and comp band
          on the first call.
        </Text>
      </div>
    );
  };

  const rolesSection = (
    <section ref={registerSection('roles')} aria-label="Open roles">
      <Reveal>
        <VStack gap={4}>
          <SectionIntro
            eyebrow="Open roles"
            title={\`\${ROLES.length} open roles across 3 teams\`}
            description="Every listing shows the comp band up front. Bands are set by role and level, not by negotiation stamina."
          />
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-2)',
              alignItems: isPhone ? 'stretch' : 'center',
              flexDirection: isPhone ? 'column' : 'row',
              flexWrap: 'wrap',
            }}>
            <HStack gap={2} wrap="wrap">
              {(['all', 'engineering', 'design', 'gtm'] as const).map(dept => (
                <button
                  key={dept}
                  type="button"
                  aria-pressed={deptFilter === dept}
                  style={{
                    ...styles.filterChip,
                    ...(deptFilter === dept ? styles.filterChipActive : null),
                  }}
                  onClick={() => setDeptFilter(dept)}>
                  {dept === 'all' ? 'All teams' : DEPT_LABELS[dept]}
                  <span style={styles.chipCount}>{deptCounts[dept]}</span>
                </button>
              ))}
            </HStack>
            <StackItem size="fill">
              <span />
            </StackItem>
            <Selector
              label="Location"
              isLabelHidden
              size="sm"
              width={isPhone ? '100%' : 180}
              options={LOCATION_OPTIONS}
              value={locationFilter}
              onChange={setLocationFilter}
            />
          </div>
          <div style={styles.roleList}>
            {visibleRoles.length === 0 && (
              <div style={styles.emptyState}>
                <Icon icon={BriefcaseIcon} size="lg" color="secondary" />
                <Text weight="semibold">
                  No {deptFilter === 'all' ? '' : \`\${DEPT_LABELS[deptFilter as Department]} \`}
                  roles in {locationFilter === 'all' ? 'that location' : LOCATION_LABELS[locationFilter as LocationId]} right now
                </Text>
                <Text type="supporting" color="secondary">
                  Roles open most months — or pitch us directly at
                  careers@halyard.co.
                </Text>
                <Button
                  label="Clear filters"
                  variant="secondary"
                  size="sm"
                  onClick={clearRoleFilters}
                />
              </div>
            )}
            {visibleRoles.map((role, index) => {
              const isExpanded = expandedRoleId === role.id;
              return (
                <div key={role.id}>
                  {index > 0 && <Divider />}
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    style={styles.roleHeader}
                    onClick={() => toggleRole(role.id)}>
                    <StackItem size="fill">
                      <VStack gap={1}>
                        <HStack gap={2} vAlign="center" wrap="wrap">
                          <span style={styles.roleTitle}>{role.title}</span>
                          {role.isNew && <Badge variant="info" label="New" />}
                        </HStack>
                        <HStack gap={2} vAlign="center" wrap="wrap">
                          <Text type="supporting" color="secondary">
                            {DEPT_LABELS[role.dept]} · {role.team}
                          </Text>
                          <span style={styles.locationChip}>
                            <Icon icon={MapPinIcon} size="xsm" color="inherit" />
                            {LOCATION_LABELS[role.location]}
                          </span>
                        </HStack>
                        {isStacked && (
                          <VStack gap={0}>
                            <span style={styles.compValue}>{role.salary}</span>
                            <span style={styles.compExtra}>
                              {role.compExtra}
                            </span>
                          </VStack>
                        )}
                      </VStack>
                    </StackItem>
                    {!isStacked && (
                      <div style={{textAlign: 'right'}}>
                        <VStack gap={0} hAlign="end">
                          <span style={styles.compValue}>{role.salary}</span>
                          <span style={styles.compExtra}>{role.compExtra}</span>
                        </VStack>
                      </div>
                    )}
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-flex',
                        color: 'var(--color-text-secondary)',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: isReduced ? 'none' : 'transform 200ms ease',
                      }}>
                      <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                    </span>
                  </button>
                  {isExpanded && (
                    <div style={styles.roleBody}>
                      <Text type="body" color="secondary">
                        {role.summary}
                      </Text>
                      <VStack gap={1}>
                        <Text type="supporting" weight="semibold">
                          What you'll own
                        </Text>
                        {role.bullets.map(bullet => (
                          <div key={bullet} style={styles.roleBullet}>
                            <span style={styles.bulletDot} aria-hidden="true" />
                            <Text type="supporting" color="secondary">
                              {bullet}
                            </Text>
                          </div>
                        ))}
                      </VStack>
                      {renderApplyPanel(role)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= PROCESS =============

  const processSection = (
    <section ref={registerSection('process')} aria-label="Hiring process">
      <Reveal>
        <VStack gap={5}>
          <SectionIntro
            eyebrow="How we hire"
            title="Four steps, no surprises"
            description="The whole loop fits in one calendar week if you want it to."
          />
          <div
            style={{
              ...styles.processRow,
              ...(isStacked ? styles.processRowStacked : null),
            }}>
            {PROCESS_STEPS.map((step, index) => (
              <div key={step.id} style={styles.processStep}>
                <HStack gap={2} vAlign="center">
                  <div style={styles.processDisc} aria-hidden="true">
                    {index + 1}
                  </div>
                  {!isStacked && index < PROCESS_STEPS.length - 1 && (
                    <div style={styles.processTrack} aria-hidden="true" />
                  )}
                </HStack>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text size="sm" weight="semibold">
                    {step.title}
                  </Text>
                  <Badge variant="neutral" label={step.duration} />
                </HStack>
                <Text type="supporting" color="secondary">
                  {step.copy}
                </Text>
              </div>
            ))}
          </div>
          <HStack gap={2} wrap="wrap">
            {PROCESS_FOOTNOTES.map(note => (
              <span key={note} style={styles.locationChip}>
                <Icon icon={CheckIcon} size="xsm" color="inherit" />
                {note}
              </span>
            ))}
          </HStack>
        </VStack>
      </Reveal>
    </section>
  );

  // ============= LIFE HERE (full-bleed band + carousel) =============

  const activeQuote = QUOTES[quoteIndex] ?? QUOTES[0];

  const lifeSection = (
    <section
      ref={registerSection('life')}
      aria-label="Life at Halyard"
      style={styles.mutedBand}>
      <div
        style={{
          ...styles.bandColumn,
          ...(isPhone ? styles.bandColumnCompact : null),
        }}>
        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Life here"
              title="In their words"
              description="Three teammates, unedited beyond trimming for length."
            />
            <div
              onMouseEnter={() => setIsQuoteHovered(true)}
              onMouseLeave={() => setIsQuoteHovered(false)}>
              <HStack gap={3} vAlign="center">
                {!isPhone && (
                  <button
                    type="button"
                    aria-label="Previous quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(
                        previous =>
                          (previous - 1 + QUOTES.length) % QUOTES.length,
                      )
                    }>
                    <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
                  </button>
                )}
                <StackItem size="fill">
                  <div style={styles.quoteCard} aria-live="polite">
                    <p
                      style={{
                        ...styles.quoteText,
                        ...(isPhone ? styles.quoteTextCompact : null),
                      }}>
                      &ldquo;{activeQuote.quote}&rdquo;
                    </p>
                    <HStack gap={3} vAlign="center">
                      <div
                        style={{
                          ...styles.quoteAvatar,
                          background: activeQuote.gradient,
                        }}
                        aria-hidden="true">
                        {activeQuote.initials}
                      </div>
                      <VStack gap={0}>
                        <Text size="sm" weight="semibold">
                          {activeQuote.name}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {activeQuote.role} · {activeQuote.tenure}
                        </Text>
                      </VStack>
                    </HStack>
                  </div>
                </StackItem>
                {!isPhone && (
                  <button
                    type="button"
                    aria-label="Next quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(previous => (previous + 1) % QUOTES.length)
                    }>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </button>
                )}
              </HStack>
              <HStack gap={1} hAlign="center">
                {QUOTES.map((quote, index) => (
                  <button
                    key={quote.id}
                    type="button"
                    aria-label={\`Show quote from \${quote.name}\`}
                    aria-pressed={quoteIndex === index}
                    style={styles.carouselDot}
                    onClick={() => setQuoteIndex(index)}>
                    <span
                      style={{
                        ...styles.carouselDotInner,
                        ...(quoteIndex === index
                          ? styles.carouselDotInnerActive
                          : null),
                      }}
                    />
                  </button>
                ))}
              </HStack>
              {isPhone && (
                <HStack gap={2} hAlign="center">
                  <button
                    type="button"
                    aria-label="Previous quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(
                        previous =>
                          (previous - 1 + QUOTES.length) % QUOTES.length,
                      )
                    }>
                    <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next quote"
                    style={styles.arrowButton}
                    onClick={() =>
                      setQuoteIndex(previous => (previous + 1) % QUOTES.length)
                    }>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </button>
                </HStack>
              )}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  // ============= OPEN APPLICATION CARD =============

  const pitchCard = (
    <Reveal>
      <div style={styles.pitchCard}>
        <HStack gap={4} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={1}>
              <Text type="label">Don't see your role?</Text>
              <Text type="supporting" color="secondary">
                We keep a short bench of people we want to work with. Two of
                our last eight hires started as open applications.
              </Text>
            </VStack>
          </StackItem>
          <span style={styles.monoText}>careers@halyard.co</span>
          <Button
            label="Browse roles again"
            variant="secondary"
            size="sm"
            onClick={() => jumpToSection('roles')}
          />
        </HStack>
      </div>
    </Reveal>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerCompact : null),
        }}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-6)',
            flexDirection: isStacked ? 'column' : 'row',
          }}>
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <div style={styles.logoTile} aria-hidden="true">
                  <Icon icon={AnchorIcon} size="sm" color="inherit" />
                </div>
                <Text type="label" color="inherit">
                  {BRAND.name}
                </Text>
              </HStack>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_SOFT, maxWidth: 320}}>
                {BRAND.tagline}. Remote-first with hubs in Lisbon and New
                York. Profitable, independent, and hiring carefully.
              </Text>
            </VStack>
          </StackItem>
          <Grid columns={{minWidth: 140, max: 3}} gap={4}>
            {FOOTER_GROUPS.map(group => (
              <VStack key={group.id} gap={1}>
                <Text
                  type="supporting"
                  weight="semibold"
                  color="inherit"
                  style={{color: DARK_TEXT}}>
                  {group.heading}
                </Text>
                {group.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    style={styles.footerLink}
                    onClick={
                      link.anchor != null
                        ? () => jumpToSection(link.anchor as SectionId)
                        : () => {}
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            ))}
          </Grid>
        </div>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Halyard Systems, Lda. All rights reserved.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            Halyard is an equal-opportunity employer. We interview in English,
            Portuguese, and Dutch.
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Halyard careers page">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {hero}
                {valuesSection}
              </div>
              {benefitsSection}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {rolesSection}
                {processSection}
              </div>
              {lifeSection}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {pitchCard}
              </div>
              {footer}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};