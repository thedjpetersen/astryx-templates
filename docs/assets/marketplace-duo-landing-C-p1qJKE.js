var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file marketplace-duo-landing.tsx
 * @input Deterministic fixtures only (the fictional "Kitloop" peer-to-peer
 *   gear-rental marketplace: two audience themes — renter and owner — each
 *   with headline/subcopy/CTA copy and a quarantined accent pair; eight
 *   gear categories with listing counts, floor prices, and ratings; three
 *   how-it-works steps; four KitCover trust cards; six renter reviews (one
 *   honest 4-star); six earnable item types with daily rates and honest
 *   utilization factors for the earnings calculator; four payout/protection
 *   cards; three top-earner stories plus a median-earnings disclosure; four
 *   marketplace stats; twelve launch cities with listing counts and pickup
 *   distances; five FAQs per audience; and a four-column sitemap footer)
 * @output Complete two-sided marketplace landing page. Signature move: an
 *   audience toggle in the hero ("I want to rent" / "I want to earn") that
 *   swaps the headline, CTA, and hero vignette AND retints every accent
 *   surface down the page between the renter teal and the owner amber —
 *   the sanctioned two-accent exception, both literals carrying contrast
 *   math. The toggle re-docks into the sticky navbar once the hero scrolls
 *   away. Renter path: selectable category tile grid (8), how-it-works
 *   steps, a full-bleed KitCover trust band, and a review wall. Owner path
 *   (swapped in): an earnings calculator (item-type Selector + days/week
 *   Slider driving a count-up estimate with an honest range note), payout/
 *   protection cards, and top-earner stories with a median disclosure.
 *   Shared: count-up stats band, selectable city chips (12), per-audience
 *   FAQ tabs with controlled accordions, a validating email-capture CTA
 *   band, and a sitemap footer whose owner links flip the audience.
 * @position Page template; emitted by \`astryx template marketplace-duo-landing\`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div; the navbar is position:sticky top:0 inside
 * it, and a centered 1120px column carries hero, audience path, stats,
 * cities, FAQ, and CTA sections. Tinted full-bleed bands (trust,
 * calculator, stats, CTA) alternate with plain bands; the footer paints
 * edge to edge on the muted token.
 *
 * Interaction contract:
 * - The hero audience toggle swaps headline/CTA/vignette (keyed swap-in
 *   animation) and retints accents page-wide; after the hero scrolls past,
 *   a compact copy of the toggle appears in the sticky navbar (tracked by
 *   the scroll container's onScroll against the hero's measured bottom).
 * - Nav anchors smooth-scroll to real section ids under a sticky-nav
 *   allowance; at compact widths they collapse behind a menu button whose
 *   dropdown closes on Escape, outside pointerdown, or selection.
 * - Category tiles and city chips are selectable (accent ring) and update
 *   a live caption line. The earnings calculator's Selector and Slider
 *   retarget an eased count-up estimate and an honest range readout.
 * - FAQ tabs follow the audience toggle until the reader overrides them;
 *   accordions are controlled via a Set so several stay open.
 * - The CTA band email form validates (empty/format, inline error) and
 *   flips to a confirmation echoing the address, with a reset action.
 * - Footer owner links flip the audience to "earn" before scrolling, so
 *   both paths are reachable without finding the hero toggle.
 * - Motion: sections rise+fade 12px once via IntersectionObserver; stats,
 *   earnings, and earner chips count up on first view. Everything is
 *   gated by prefers-reduced-motion (reveals render visible, counters
 *   render final, swap animations are suppressed).
 *
 * Color policy: token-pure except the sanctioned two-accent exception for
 * this archetype. Exactly two quarantined accent literals exist (renter
 * teal, owner amber — see PAINT CONSTANTS for the contrast math) plus one
 * neutral on-accent ink pair; every tint is derived from the accents via
 * color-mix(), so retheming the audience is a one-literal edit each.
 *
 * Responsive contract (measured with a local ResizeObserver — the demo
 * stage is ~1045px wide, so viewport media queries are not used):
 * - Column: max-width 1120px, centered; tinted bands and footer bleed.
 * - <=780px: nav anchor links collapse behind a menu button + dropdown;
 *   the nav CTA moves into the dropdown.
 * - <=840px: hero stacks (vignette below copy); how-it-works drops 3 → 1.
 * - Category grid 4 → 3 → 2 columns; trust and payout cards 4 → 2 → 1;
 *   reviews and stories 3 → 2 → 1; stats 4 → 2; footer sitemap 4 → 2.
 * - <=520px: headline steps down, the email form stacks its button, and
 *   chip rows wrap — the page holds at 390px with no overflow-x.
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
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  BanknoteIcon,
  BikeIcon,
  CalendarCheckIcon,
  CameraIcon,
  CheckIcon,
  LifeBuoyIcon,
  MailCheckIcon,
  MapPinIcon,
  MenuIcon,
  MountainSnowIcon,
  ProjectorIcon,
  RepeatIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SpeakerIcon,
  TentIcon,
  TruckIcon,
  UserCheckIcon,
  WavesIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// Sanctioned two-accent exception for the two-sided marketplace archetype:
// exactly TWO quarantined accent literals, one per audience. All tints are
// derived from them with color-mix(), so nothing else carries a hue.
//
// Renter accent (teal): light #0F766E on white ≈ 5.5:1 (AA normal text);
// dark #5EEAD4 on the ~#101418 dark app surface ≈ 11.6:1 (AAA).
const RENT_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Owner accent (amber): light #B45309 on white ≈ 5.0:1 (AA normal text);
// dark #FBBF24 on the ~#101418 dark app surface ≈ 10.3:1 (AAA).
const EARN_ACCENT = 'light-dark(#B45309, #FBBF24)';
// Neutral ink for text ON an accent fill (not an accent hue): white on
// #0F766E ≈ 5.5:1 and on #B45309 ≈ 5.0:1 in light mode; near-black
// #101418 on #5EEAD4 ≈ 12.9:1 and on #FBBF24 ≈ 11.4:1 in dark mode.
const ACCENT_INK = 'light-dark(#FFFFFF, #101418)';

/** Accent tint helper — every wash/band derives from the two accents. */
function tint(accent: string, percent: number): string {
  return \`color-mix(in srgb, \${accent} \${percent}%, transparent)\`;
}

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 64;

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
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnPhone: {
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
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    // Brand mark blends the two sanctioned audience accents.
    background: \`linear-gradient(135deg, \${RENT_ACCENT} 0%, \${EARN_ACCENT} 100%)\`,
    color: ACCENT_INK,
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
  // ---- accent primary button (retints with the audience) ----
  accentButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingInline: 20,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: ACCENT_INK,
  },
  accentButtonSmall: {
    minHeight: 36,
    paddingInline: 14,
    fontSize: 13,
  },
  // ---- audience toggle ----
  togglePillRow: {
    display: 'inline-flex',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  togglePill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  // ---- hero ----
  hero: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    paddingBlock: 'var(--spacing-8)',
  },
  heroStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-5)',
  },
  heroCopy: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  heroVignette: {
    flex: '1 1 0',
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
  },
  heroHeadline: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlinePhone: {
    fontSize: 32,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 480,
    margin: 0,
  },
  // ---- vignette cards ----
  vignetteCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  vignetteSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  vignetteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  vignetteThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    flexShrink: 0,
  },
  vignetteBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    height: 64,
  },
  vignetteBar: {
    flex: '1 1 0',
    borderRadius: 4,
  },
  ratingChip: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- category tiles ----
  categoryTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
  },
  categoryGlyph: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionLine: {
    minHeight: 24,
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
  },
  // ---- steps ----
  stepCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  stepDisc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
  },
  // ---- full-bleed tinted bands ----
  band: {
    width: '100%',
  },
  // ---- trust / payout cards ----
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    height: '100%',
    boxSizing: 'border-box',
  },
  infoGlyph: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ---- reviews / stories ----
  reviewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    height: '100%',
    boxSizing: 'border-box',
  },
  starRow: {
    fontSize: 14,
    letterSpacing: '0.1em',
  },
  quote: {
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
  monogram: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  earnChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    minHeight: 26,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- calculator ----
  calcCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    maxWidth: 720,
    width: '100%',
    marginInline: 'auto',
    boxSizing: 'border-box',
  },
  calcEstimate: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- stats ----
  statFigure: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- city chips ----
  cityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  // ---- email capture ----
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    maxWidth: 460,
    width: '100%',
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
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
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
// Deterministic fixtures for the fictional Kitloop gear-rental
// marketplace. No Date.now, no randomness, no network assets.

type Audience = 'rent' | 'earn';

interface AudienceTheme {
  id: Audience;
  toggleLabel: string;
  shortLabel: string;
  accent: string;
  headline: string;
  subcopy: string;
  primaryCta: string;
  primaryTarget: SectionId;
  secondaryCta: string;
  secondaryTarget: SectionId;
  finePrint: string;
  navCta: string;
  pathAnchorLabel: string;
  trustAnchorLabel: string;
  ctaHeading: string;
  ctaCopy: string;
  ctaButton: string;
}

type SectionId = 'path' | 'how' | 'trust' | 'cities' | 'faq' | 'cta';

const AUDIENCES: Record<Audience, AudienceTheme> = {
  rent: {
    id: 'rent',
    toggleLabel: 'I want to rent',
    shortLabel: 'Rent',
    accent: RENT_ACCENT,
    headline: 'Rent the good gear. Skip the garage full of it.',
    subcopy:
      'Cameras, ski setups, e-bikes, and power tools from verified ' +
      'neighbors — for a weekend, not a mortgage. Every rental is covered ' +
      'up to $25,000 by KitCover.',
    primaryCta: 'Browse gear near you',
    primaryTarget: 'path',
    secondaryCta: 'How Kitloop works',
    secondaryTarget: 'how',
    finePrint: 'No deposit on most items · cancel free up to 24h before',
    navCta: 'Find gear',
    pathAnchorLabel: 'Browse gear',
    trustAnchorLabel: 'KitCover',
    ctaHeading: 'Gear up for the weekend',
    ctaCopy:
      'Tell us where you are and we’ll send the best listings within ' +
      '5 miles — takes about 90 seconds to book your first rental.',
    ctaButton: 'Get started',
  },
  earn: {
    id: 'earn',
    toggleLabel: 'I want to earn',
    shortLabel: 'Earn',
    accent: EARN_ACCENT,
    headline: 'Your gear already exists. Make it pay rent.',
    subcopy:
      'List the camera, e-bike, or tool wall gathering dust and set your ' +
      'own rules. You approve every renter; KitCover backs every handoff ' +
      'up to $25,000 with a $0 owner deductible.',
    primaryCta: 'Estimate my earnings',
    primaryTarget: 'path',
    secondaryCta: 'See owner protection',
    secondaryTarget: 'trust',
    finePrint: 'Free to list · Kitloop takes 15% only when you get paid',
    navCta: 'Start earning',
    pathAnchorLabel: 'Earnings',
    trustAnchorLabel: 'Protection',
    ctaHeading: 'Your gear could be earning by Friday',
    ctaCopy:
      'The average first listing goes live in 11 minutes. We’ll email you ' +
      'a checklist and a pricing suggestion for your first item.',
    ctaButton: 'List my gear',
  },
};

interface GearCategory {
  id: string;
  label: string;
  icon: Glyph;
  listings: number;
  fromPrice: number;
  rating: number;
}

const CATEGORIES: readonly GearCategory[] = [
  {id: 'cameras', label: 'Cameras & lenses', icon: CameraIcon, listings: 6180, fromPrice: 18, rating: 4.9},
  {id: 'camping', label: 'Camping & hiking', icon: TentIcon, listings: 5940, fromPrice: 9, rating: 4.8},
  {id: 'ski', label: 'Ski & snowboard', icon: MountainSnowIcon, listings: 4730, fromPrice: 22, rating: 4.9},
  {id: 'ebikes', label: 'E-bikes & scooters', icon: BikeIcon, listings: 3660, fromPrice: 28, rating: 4.7},
  {id: 'audio', label: 'DJ & audio', icon: SpeakerIcon, listings: 3210, fromPrice: 31, rating: 4.8},
  {id: 'tools', label: 'Power tools', icon: WrenchIcon, listings: 7480, fromPrice: 11, rating: 4.8},
  {id: 'av', label: 'Projectors & AV', icon: ProjectorIcon, listings: 2140, fromPrice: 16, rating: 4.7},
  {id: 'water', label: 'Water sports', icon: WavesIcon, listings: 2890, fromPrice: 19, rating: 4.9},
];

interface HowStep {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}

const HOW_STEPS: readonly HowStep[] = [
  {
    id: 'find',
    icon: SearchIcon,
    title: 'Find gear nearby',
    copy:
      'Search 41,300 verified listings, filter by dates and distance, and ' +
      'compare owner ratings — most gear is under 2 miles away.',
  },
  {
    id: 'book',
    icon: ShieldCheckIcon,
    title: 'Book with KitCover built in',
    copy:
      'Pay in the app and coverage up to $25,000 attaches automatically. ' +
      'Most items are deposit-free; your card is never held.',
  },
  {
    id: 'pickup',
    icon: TruckIcon,
    title: 'Pick up or get it delivered',
    copy:
      'Meet the owner, or add doorstep delivery from $9 in core zones. ' +
      'Photo check-in on both ends keeps the condition on record.',
  },
];

interface TrustCard {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}

const TRUST_CARDS: readonly TrustCard[] = [
  {
    id: 'cover',
    icon: ShieldCheckIcon,
    title: '$25,000 KitCover protection',
    copy:
      'Every rental is covered for accidental damage and theft — ' +
      'automatically, with a renter deductible capped at $75.',
  },
  {
    id: 'verified',
    icon: UserCheckIcon,
    title: 'ID-verified members',
    copy:
      '94% of active members have completed government-ID plus selfie ' +
      'verification; the rest are capped at low-value items.',
  },
  {
    id: 'support',
    icon: LifeBuoyIcon,
    title: '24/7 human support',
    copy:
      'A real person answers in a median of 4 minutes during an active ' +
      'rental — for either side of the handoff.',
  },
  {
    id: 'deposit',
    icon: BanknoteIcon,
    title: 'Deposit-free on most gear',
    copy:
      'KitCover replaces deposits on most listings. Owners of items over ' +
      '$2,000 may require one; it always shows before you book.',
  },
];

interface Review {
  id: string;
  name: string;
  city: string;
  item: string;
  stars: number;
  quote: string;
}

const REVIEWS: readonly Review[] = [
  {
    id: 'dana',
    name: 'Dana R.',
    city: 'Denver',
    item: 'Rossignol ski set',
    stars: 5,
    quote:
      'Booked at 9pm, on the mountain by 8. The owner even threw in boot warmers.',
  },
  {
    id: 'miguel',
    name: 'Miguel S.',
    city: 'Austin',
    item: 'DJ controller + PA',
    stars: 5,
    quote:
      'Sound for my sister’s wedding cost less than one hour of the rental company’s quote.',
  },
  {
    id: 'priya',
    name: 'Priya K.',
    city: 'Seattle',
    item: 'Sony A7 IV kit',
    stars: 5,
    quote:
      'Lens spotless, batteries charged, sensor clean. Shot a full client weekend on it.',
  },
  {
    id: 'jonah',
    name: 'Jonah T.',
    city: 'Chicago',
    item: 'Tile saw',
    stars: 4,
    quote:
      'Saved me $400 on a one-weekend bathroom job. Pickup window was a bit tight.',
  },
  {
    id: 'amara',
    name: 'Amara O.',
    city: 'San Diego',
    item: 'Two paddleboards',
    stars: 5,
    quote: 'Delivered to the beach parking lot. We just… showed up and paddled.',
  },
  {
    id: 'felix',
    name: 'Felix W.',
    city: 'Portland',
    item: '6-person tent',
    stars: 5,
    quote:
      'Cheaper than buying, and I don’t have to store a tent I use twice a year.',
  },
];

interface ItemType {
  id: string;
  label: string;
  dailyRate: number;
  /** Honest share of listed days that actually get booked (12-mo median). */
  utilization: number;
  note?: string;
}

const ITEM_TYPES: readonly ItemType[] = [
  {id: 'camera', label: 'Mirrorless camera kit', dailyRate: 42, utilization: 0.52},
  {id: 'drone', label: 'Drone + controller', dailyRate: 55, utilization: 0.44},
  {id: 'ebike', label: 'E-bike', dailyRate: 34, utilization: 0.61},
  {
    id: 'ski',
    label: 'Ski or snowboard set',
    dailyRate: 26,
    utilization: 0.48,
    note: 'Winter-weighted — most ski earnings land Nov–Mar.',
  },
  {id: 'dj', label: 'DJ controller + PA', dailyRate: 48, utilization: 0.39},
  {id: 'tools', label: 'Power tool bundle', dailyRate: 19, utilization: 0.66},
];

const CALC_DISCLOSURE =
  'Based on the middle 50% of 214 comparable Kitloop listings over the ' +
  'last 12 months, after the 15% Kitloop fee. Dense cities earn more; new ' +
  'listings typically take 3–4 weeks to get their first booking.';

interface PayoutCard {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
}

const PAYOUT_CARDS: readonly PayoutCard[] = [
  {
    id: 'paid',
    icon: BanknoteIcon,
    title: 'Paid within 24 hours',
    copy:
      'Payouts start when pickup is confirmed and land in 1–2 business ' +
      'days by bank transfer. No invoices, no chasing.',
  },
  {
    id: 'cover',
    icon: ShieldCheckIcon,
    title: 'KitCover for owners',
    copy:
      'Verified damage and theft covered up to $25,000 with a $0 owner ' +
      'deductible. Median claim resolves in 3 days.',
  },
  {
    id: 'rules',
    icon: CalendarCheckIcon,
    title: 'You set the rules',
    copy:
      'Approve every request. Require deposits, add buffer days between ' +
      'rentals, and block dates whenever you like.',
  },
  {
    id: 'pricing',
    icon: SparklesIcon,
    title: 'Smart pricing, optional',
    copy:
      'We suggest a daily rate from comparable listings and bump weekends ' +
      'and peak season. Override it per listing any time.',
  },
];

interface EarnerStory {
  id: string;
  name: string;
  initials: string;
  city: string;
  gear: string;
  monthly: number;
  months: number;
  quote: string;
}

const EARNER_STORIES: readonly EarnerStory[] = [
  {
    id: 'priya-n',
    name: 'Priya N.',
    initials: 'PN',
    city: 'Denver',
    gear: 'Camera kits',
    monthly: 910,
    months: 14,
    quote:
      'My A7 IV paid for itself in eleven weekends. Now the whole shelf works for a living.',
  },
  {
    id: 'marcus',
    name: 'Marcus L.',
    initials: 'ML',
    city: 'Austin',
    gear: 'DJ + PA rig',
    monthly: 760,
    months: 9,
    quote:
      'Wedding season books my speakers three weekends a month. I block the fourth for my own gigs.',
  },
  {
    id: 'tove',
    name: 'Tove H.',
    initials: 'TH',
    city: 'Seattle',
    gear: 'Camping bundles',
    monthly: 540,
    months: 22,
    quote:
      'Four tents that used to live in my garage now fund next summer’s trips.',
  },
];

const EARNER_DISCLOSURE =
  'These are top-5% owners. The median active Kitloop owner earned ' +
  '$210/mo over the last year.';

interface Stat {
  id: string;
  value: number;
  decimals: number;
  prefix: string;
  suffix: string;
  label: string;
}

const STATS: readonly Stat[] = [
  {id: 'members', value: 92400, decimals: 0, prefix: '', suffix: '', label: 'verified members'},
  {id: 'listings', value: 41300, decimals: 0, prefix: '', suffix: '', label: 'listings live today'},
  {id: 'cities', value: 12, decimals: 0, prefix: '', suffix: '', label: 'launch cities'},
  {id: 'paid', value: 6.8, decimals: 1, prefix: '$', suffix: 'M', label: 'paid to owners'},
];

interface City {
  id: string;
  name: string;
  listings: number;
  pickupMiles: number;
  topCategory: string;
}

const CITIES: readonly City[] = [
  {id: 'portland', name: 'Portland', listings: 3840, pickupMiles: 1.4, topCategory: 'Camping & hiking'},
  {id: 'denver', name: 'Denver', listings: 4120, pickupMiles: 1.8, topCategory: 'Ski & snowboard'},
  {id: 'austin', name: 'Austin', listings: 3660, pickupMiles: 2.1, topCategory: 'DJ & audio'},
  {id: 'seattle', name: 'Seattle', listings: 4480, pickupMiles: 1.6, topCategory: 'Cameras & lenses'},
  {id: 'chicago', name: 'Chicago', listings: 3910, pickupMiles: 2.4, topCategory: 'Power tools'},
  {id: 'minneapolis', name: 'Minneapolis', listings: 2730, pickupMiles: 1.9, topCategory: 'E-bikes & scooters'},
  {id: 'slc', name: 'Salt Lake City', listings: 2510, pickupMiles: 2.2, topCategory: 'Ski & snowboard'},
  {id: 'asheville', name: 'Asheville', listings: 1480, pickupMiles: 1.2, topCategory: 'Camping & hiking'},
  {id: 'boulder', name: 'Boulder', listings: 1960, pickupMiles: 0.9, topCategory: 'E-bikes & scooters'},
  {id: 'sandiego', name: 'San Diego', listings: 3240, pickupMiles: 2.0, topCategory: 'Water sports'},
  {id: 'burlington', name: 'Burlington', listings: 1120, pickupMiles: 1.1, topCategory: 'Ski & snowboard'},
  {id: 'bend', name: 'Bend', listings: 1340, pickupMiles: 0.8, topCategory: 'Camping & hiking'},
];

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const FAQ: Record<Audience, readonly FaqEntry[]> = {
  rent: [
    {
      id: 'deposit',
      question: 'Do I need to leave a deposit?',
      answer:
        'Most listings are deposit-free — KitCover protects the owner, so they don’t need to hold your money. Owners of items over $2,000 can require one; it shows on the listing before you book and is released within 48 hours of return.',
    },
    {
      id: 'damage',
      question: 'What happens if I damage something?',
      answer:
        'Tell us in the app within 24 hours. KitCover handles accidental damage up to $25,000 and your renter deductible is capped at $75. Intentional damage and gross negligence aren’t covered.',
    },
    {
      id: 'pickup',
      question: 'How do pickups and returns work?',
      answer:
        'Meet the owner at an agreed spot, or add doorstep delivery from $9 in core zones. Both sides confirm the handoff in the app with photos, so the item’s condition is on record in both directions.',
    },
    {
      id: 'extend',
      question: 'Can I extend a rental?',
      answer:
        'Request an extension from your trip screen; the owner has 4 hours to accept before it expires. Extensions keep the same daily rate and KitCover extends automatically.',
    },
    {
      id: 'who',
      question: 'Who can rent on Kitloop?',
      answer:
        'Anyone 18+ with a verified ID and a payment method. High-value categories like drones and e-bikes also ask for a short experience checklist before your first booking.',
    },
  ],
  earn: [
    {
      id: 'payout',
      question: 'When do I get paid?',
      answer:
        'Payouts start within 24 hours of pickup confirmation and land in 1–2 business days by bank transfer. Kitloop’s 15% fee is deducted automatically — no invoices, no chasing.',
    },
    {
      id: 'damage',
      question: 'What if a renter damages my gear?',
      answer:
        'File a claim with photos within 72 hours of the return. KitCover pays verified damage and theft up to $25,000 with a $0 owner deductible, and the median claim resolves in 3 days.',
    },
    {
      id: 'requests',
      question: 'Do I have to accept every request?',
      answer:
        'No. You approve each request individually, and you can require a deposit, add buffer days between rentals, and block out dates at any time.',
    },
    {
      id: 'taxes',
      question: 'What about taxes?',
      answer:
        'You get an annual earnings statement, and a 1099-K if you cross the IRS reporting threshold. Kitloop doesn’t withhold; talk to a tax professional about deductions like depreciation.',
    },
    {
      id: 'pricing',
      question: 'How should I price my gear?',
      answer:
        'Smart pricing suggests a daily rate from comparable nearby listings and raises weekends and peak season automatically. You can override it per listing whenever you like.',
    },
  ],
};

interface FooterColumn {
  id: string;
  heading: string;
  links: readonly {
    label: string;
    target?: SectionId;
    switchTo?: Audience;
  }[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    id: 'marketplace',
    heading: 'Marketplace',
    links: [
      {label: 'Browse categories', target: 'path', switchTo: 'rent'},
      {label: 'Cities', target: 'cities'},
      {label: 'KitCover protection', target: 'trust'},
      {label: 'Gift cards'},
    ],
  },
  {
    id: 'owners',
    heading: 'Owners',
    links: [
      {label: 'List your gear', target: 'cta', switchTo: 'earn'},
      {label: 'Earnings calculator', target: 'path', switchTo: 'earn'},
      {label: 'Owner protection', target: 'trust', switchTo: 'earn'},
      {label: 'Owner guide'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [{label: 'About'}, {label: 'Careers'}, {label: 'Press'}, {label: 'Blog'}],
  },
  {
    id: 'support',
    heading: 'Support',
    links: [
      {label: 'Help center'},
      {label: 'Safety standards'},
      {label: 'Contact us'},
      {label: 'Terms & privacy'},
    ],
  },
];

// ============= HELPERS =============

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to get the link.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return 'That doesn’t look like an email address.';
  }
  return null;
}

function formatCount(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Round to the nearest \`step\` — keeps the calculator honest-looking. */
function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function starString(stars: number): string {
  return '★★★★★'.slice(0, stars) + '☆☆☆☆☆'.slice(0, 5 - stars);
}

// ============= HOOKS =============

/**
 * Measures the page's own width with a ResizeObserver — the demo stage is
 * ~1045px wide inside a 1440px window, so viewport media queries never
 * fire there. All breakpoints derive from this width.
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

/** Live prefers-reduced-motion flag; gates reveals, counters, and swaps. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
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
 * True once the node has intersected the viewport (15% visible), then
 * stays true. Falls back to visible when IntersectionObserver is missing
 * so nothing renders as a wall of zeros in static environments.
 */
function useInViewOnce(): [RefObject<HTMLDivElement | null>, boolean] {
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
      {threshold: 0.15},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// ============= SMALL PIECES =============

/** Rise+fade scroll reveal; renders visible under reduced motion. */
function Reveal({
  reduced,
  delay = 0,
  style,
  children,
}: {
  reduced: boolean;
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [ref, inView] = useInViewOnce();
  const shown = reduced || inView;
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(12px)',
        transition: reduced
          ? 'none'
          : \`opacity 0.55s ease \${delay}ms, transform 0.55s ease \${delay}ms\`,
        ...style,
      }}>
      {children}
    </div>
  );
}

/**
 * Eases toward \`value\` in 32 fixed setInterval steps once active; retargets
 * from the current display when \`value\` changes (calculator), and snaps
 * instantly under reduced motion.
 */
function AnimatedNumber({
  value,
  isActive,
  reduced,
  format,
}: {
  value: number;
  isActive: boolean;
  reduced: boolean;
  format: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  displayRef.current = display;

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reduced) {
      setDisplay(value);
      return undefined;
    }
    const from = displayRef.current;
    if (from === value) {
      return undefined;
    }
    const steps = 32;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const t = i / steps;
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (value - from) * eased);
      if (i >= steps) {
        clearInterval(id);
      }
    }, 22);
    return () => clearInterval(id);
  }, [value, isActive, reduced]);

  return <span>{format(display)}</span>;
}

/** 40px icon-only button (Astryx Button caps at 36px). */
function IconButton40({
  label,
  icon,
  onClick,
  ariaExpanded,
}: {
  label: string;
  icon: Glyph;
  onClick: () => void;
  ariaExpanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      style={styles.iconButton}>
      <Icon icon={icon} size="sm" color="inherit" />
    </button>
  );
}

/** Kitloop brand mark: dual-accent gradient tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={RepeatIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">Kitloop</Text>
    </HStack>
  );
}

/**
 * The signature audience toggle. Each pill fills with ITS audience accent
 * when active, so the control itself telegraphs the page retint.
 */
function AudienceToggle({
  audience,
  onChange,
  size,
}: {
  audience: Audience;
  onChange: (next: Audience) => void;
  size: 'lg' | 'sm';
}) {
  const metrics: CSSProperties =
    size === 'lg'
      ? {minHeight: 44, paddingInline: 20, fontSize: 15}
      : {minHeight: 32, paddingInline: 12, fontSize: 13};
  return (
    <div style={styles.togglePillRow} role="group" aria-label="Choose your side">
      {(Object.keys(AUDIENCES) as Audience[]).map(id => {
        const theme = AUDIENCES[id];
        const isActive = audience === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            style={{
              ...styles.togglePill,
              ...metrics,
              ...(isActive
                ? {backgroundColor: theme.accent, color: ACCENT_INK}
                : null),
            }}>
            {size === 'lg' ? theme.toggleLabel : theme.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

/** Audience-accent primary CTA (the retint story needs a literal fill). */
function AccentButton({
  label,
  accent,
  onClick,
  small,
  icon,
}: {
  label: string;
  accent: string;
  onClick: () => void;
  small?: boolean;
  icon?: Glyph;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.accentButton,
        ...(small ? styles.accentButtonSmall : null),
        backgroundColor: accent,
      }}>
      {label}
      {icon != null ? <Icon icon={icon} size="sm" color="inherit" /> : null}
    </button>
  );
}

/** Section intro: tracked accent eyebrow + heading + supporting copy. */
function SectionHead({
  eyebrow,
  title,
  copy,
  accent,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  accent: string;
}) {
  return (
    <VStack gap={2}>
      <p style={{...styles.eyebrow, color: accent}}>{eyebrow}</p>
      <Heading level={2}>{title}</Heading>
      {copy != null ? (
        <Text type="supporting" color="secondary">
          {copy}
        </Text>
      ) : null}
    </VStack>
  );
}

/** Renter hero vignette: schematic search-and-book card. */
function RentVignette({accent}: {accent: string}) {
  const results = [
    {name: 'Rossignol Experience 86 set', meta: '$24/day · 0.6 mi', rating: '4.9★', instant: true},
    {name: 'Sony A7 IV + 24-70 f/2.8', meta: '$38/day · 1.1 mi', rating: '5.0★', instant: false},
    {name: 'Rad Runner e-bike', meta: '$29/day · 0.8 mi', rating: '4.8★', instant: true},
  ];
  return (
    <div style={styles.vignetteCard} role="img" aria-label="Schematic Kitloop search results near you">
      <div style={styles.vignetteSearch}>
        <Icon icon={SearchIcon} size="sm" color="inherit" />
        <span>Ski &amp; snowboard · Denver · Feb 13–16</span>
      </div>
      {results.map(row => (
        <div key={row.name} style={styles.vignetteRow}>
          <div
            style={{
              ...styles.vignetteThumb,
              background: \`linear-gradient(135deg, \${tint(accent, 55)}, \${tint(accent, 18)})\`,
            }}
            aria-hidden="true"
          />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {row.name}
              </Text>
              <Text type="supporting" color="secondary">
                {row.meta}
              </Text>
            </VStack>
          </StackItem>
          {row.instant ? <Badge label="Instant book" /> : null}
          <span style={{...styles.ratingChip, color: accent}}>{row.rating}</span>
        </div>
      ))}
      <HStack gap={2} vAlign="center">
        <span style={{color: accent, display: 'inline-flex'}}>
          <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
        </span>
        <Text type="supporting" color="secondary">
          Every rental covered up to $25,000 by KitCover
        </Text>
      </HStack>
    </div>
  );
}

/** Owner hero vignette: schematic listings-dashboard card. */
function EarnVignette({accent}: {accent: string}) {
  const bars = [34, 52, 41, 68, 57, 84];
  return (
    <div style={styles.vignetteCard} role="img" aria-label="Schematic Kitloop owner dashboard">
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text size="sm" weight="semibold">
            Your listings
          </Text>
        </StackItem>
        <span
          style={{
            ...styles.earnChip,
            backgroundColor: tint(accent, 14),
            color: accent,
          }}>
          Next payout Fri · $184
        </span>
      </HStack>
      <div style={styles.vignetteRow}>
        <div
          style={{
            ...styles.vignetteThumb,
            background: \`linear-gradient(135deg, \${tint(accent, 55)}, \${tint(accent, 18)})\`,
          }}
          aria-hidden="true"
        />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              Sony A7 IV kit
            </Text>
            <Text type="supporting" color="secondary">
              $38/day · 4 requests this week
            </Text>
          </VStack>
        </StackItem>
        <Badge label="Booked this weekend" />
      </div>
      <div style={styles.vignetteBars} aria-hidden="true">
        {bars.map((height, index) => (
          <div
            key={index}
            style={{
              ...styles.vignetteBar,
              height: \`\${height}%\`,
              backgroundColor: tint(accent, index === bars.length - 1 ? 85 : 35),
            }}
          />
        ))}
      </div>
      <Text type="supporting" color="secondary">
        July earnings · $312 across 2 listings
      </Text>
    </div>
  );
}

/** One stats-band figure with its own first-view count-up. */
function StatFigure({
  stat,
  accent,
  reduced,
}: {
  stat: Stat;
  accent: string;
  reduced: boolean;
}) {
  const [ref, inView] = useInViewOnce();
  return (
    <div ref={ref}>
      <VStack gap={1}>
        <span style={{...styles.statFigure, color: accent}}>
          <AnimatedNumber
            value={stat.value}
            isActive={inView}
            reduced={reduced}
            format={n =>
              \`\${stat.prefix}\${
                stat.decimals > 0 ? n.toFixed(stat.decimals) : formatCount(n)
              }\${stat.suffix}\`
            }
          />
        </span>
        <Text type="supporting" color="secondary">
          {stat.label}
        </Text>
      </VStack>
    </div>
  );
}

/** Top-earner story card with a count-up monthly chip. */
function EarnerStoryCard({
  story,
  accent,
  reduced,
}: {
  story: EarnerStory;
  accent: string;
  reduced: boolean;
}) {
  const [ref, inView] = useInViewOnce();
  return (
    <div ref={ref} style={styles.reviewCard}>
      <HStack gap={3} vAlign="center">
        <div
          style={{
            ...styles.monogram,
            backgroundColor: tint(accent, 16),
            color: accent,
          }}
          aria-hidden="true">
          {story.initials}
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              {story.name} · {story.city}
            </Text>
            <Text type="supporting" color="secondary">
              {story.gear} · {story.months} months on Kitloop
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <span
        style={{
          ...styles.earnChip,
          backgroundColor: tint(accent, 14),
          color: accent,
          alignSelf: 'flex-start',
        }}>
        <AnimatedNumber
          value={story.monthly}
          isActive={inView}
          reduced={reduced}
          format={n => \`$\${formatCount(n)}\`}
        />
        /mo avg
      </span>
      <p style={styles.quote}>“{story.quote}”</p>
    </div>
  );
}

// ============= PAGE =============

export default function MarketplaceDuoLandingTemplate() {
  // ---- the signature audience state; retints the whole page ----
  const [audience, setAudience] = useState<Audience>('rent');
  const theme = AUDIENCES[audience];
  const accent = theme.accent;

  // ---- responsive: measured page width, not viewport ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(wrapRef);
  const isNavCompact = width > 0 && width <= 780;
  const isHeroStacked = width > 0 && width <= 840;
  const isPhone = width > 0 && width <= 520;
  const catCols = width > 1000 ? 4 : width > 680 ? 3 : 2;
  const cardCols4 = width > 1000 ? 4 : width > 640 ? 2 : 1;
  const reviewCols = width > 1000 ? 3 : width > 640 ? 2 : 1;
  const storyCols = width > 900 ? 3 : width > 620 ? 2 : 1;
  const stepCols = width > 840 ? 3 : 1;
  const statCols = width > 680 ? 4 : 2;
  const footerCols = width > 900 ? 4 : 2;

  const reduced = usePrefersReducedMotion();

  // ---- sticky-nav toggle: appears after the hero toggle scrolls away ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [showNavToggle, setShowNavToggle] = useState(false);

  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const hero = heroRef.current;
    const gate =
      hero != null ? hero.offsetTop + hero.offsetHeight - NAV_ALLOWANCE : 360;
    setShowNavToggle(event.currentTarget.scrollTop > gate);
  };

  // ---- nav menu (compact widths) ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isNavMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNavMenuOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav != null &&
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

  // ---- section registry + smooth scroll ----
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});
  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };
  const jumpToSection = (id: SectionId) => {
    setIsNavMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  const switchAudience = (next: Audience) => {
    setAudience(next);
    setFaqOverride(null);
  };

  // ---- renter path: selected category ----
  const [selectedCategory, setSelectedCategory] = useState('cameras');
  const category =
    CATEGORIES.find(c => c.id === selectedCategory) ?? CATEGORIES[0];

  // ---- owner path: earnings calculator ----
  const [itemTypeId, setItemTypeId] = useState('camera');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const itemType = ITEM_TYPES.find(t => t.id === itemTypeId) ?? ITEM_TYPES[0];
  const monthlyEstimate = roundTo(
    itemType.dailyRate * daysPerWeek * itemType.utilization * 4.33 * 0.85,
    5,
  );
  const rangeLow = roundTo(monthlyEstimate * 0.6, 10);
  const rangeHigh = roundTo(monthlyEstimate * 1.35, 10);
  const [calcRef, calcInView] = useInViewOnce();

  // ---- shared: selected city ----
  const [selectedCity, setSelectedCity] = useState('denver');
  const city = CITIES.find(c => c.id === selectedCity) ?? CITIES[0];

  // ---- FAQ tabs follow the audience until overridden ----
  const [faqOverride, setFaqOverride] = useState<Audience | null>(null);
  const faqAudience = faqOverride ?? audience;
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set(['rent-deposit', 'earn-payout']),
  );
  const toggleFaq = (key: string, isOpen: boolean) => {
    setOpenFaqs(previous => {
      const next = new Set(previous);
      if (isOpen) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  // ---- CTA email capture ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const submitEmail = () => {
    const error = validateEmail(email);
    if (error != null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  const swapAnimation = reduced ? undefined : 'kitloopSwapIn 360ms ease both';
  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const sectionStyle: CSSProperties = {
    ...styles.section,
    ...(isPhone ? styles.sectionCompact : null),
  };
  const anchors: readonly {id: SectionId; label: string}[] = [
    {id: 'path', label: theme.pathAnchorLabel},
    {id: 'trust', label: theme.trustAnchorLabel},
    {id: 'cities', label: 'Cities'},
    {id: 'faq', label: 'FAQ'},
  ];

  // ============= CHROME =============

  const navBar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Kitloop">
      <div style={styles.navInner}>
        <BrandMark />
        {!isNavCompact ? (
          <HStack gap={0} vAlign="center">
            {anchors.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                style={styles.navLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
          </HStack>
        ) : null}
        <StackItem size="fill">
          <span />
        </StackItem>
        {showNavToggle ? (
          <div style={{animation: swapAnimation}}>
            <AudienceToggle
              audience={audience}
              onChange={switchAudience}
              size="sm"
            />
          </div>
        ) : null}
        {!isNavCompact ? (
          <AccentButton
            label={theme.navCta}
            accent={accent}
            small
            onClick={() => jumpToSection('cta')}
          />
        ) : (
          <div ref={menuTriggerRef}>
            <IconButton40
              label={isNavMenuOpen ? 'Close menu' : 'Open menu'}
              icon={isNavMenuOpen ? XIcon : MenuIcon}
              ariaExpanded={isNavMenuOpen}
              onClick={() => setIsNavMenuOpen(open => !open)}
            />
          </div>
        )}
        {isNavCompact && isNavMenuOpen ? (
          <div style={styles.navMenu} role="menu" aria-label="Site menu">
            <VStack gap={1}>
              {anchors.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.navMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <div style={{paddingTop: 8}}>
                <AccentButton
                  label={theme.navCta}
                  accent={accent}
                  small
                  onClick={() => jumpToSection('cta')}
                />
              </div>
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ============= HERO =============

  const hero = (
    <div ref={heroRef} style={columnStyle}>
      <div
        style={{
          ...styles.hero,
          ...(isHeroStacked ? styles.heroStacked : null),
        }}>
        <div style={styles.heroCopy}>
          <p style={{...styles.eyebrow, color: accent}}>
            Peer-to-peer gear rental · 12 cities
          </p>
          <AudienceToggle
            audience={audience}
            onChange={switchAudience}
            size="lg"
          />
          <div key={\`copy-\${audience}\`} style={{animation: swapAnimation}}>
            <VStack gap={3}>
              <h1
                style={{
                  ...styles.heroHeadline,
                  ...(isPhone ? styles.heroHeadlinePhone : null),
                }}>
                {theme.headline}
              </h1>
              <p style={styles.heroSubcopy}>{theme.subcopy}</p>
            </VStack>
          </div>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <AccentButton
              label={theme.primaryCta}
              accent={accent}
              icon={ArrowRightIcon}
              onClick={() => jumpToSection(theme.primaryTarget)}
            />
            <Button
              label={theme.secondaryCta}
              variant="secondary"
              onClick={() => jumpToSection(theme.secondaryTarget)}
            />
          </HStack>
          <Text type="supporting" color="secondary">
            {theme.finePrint}
          </Text>
        </div>
        <div
          key={\`vignette-\${audience}\`}
          style={{...styles.heroVignette, animation: swapAnimation}}>
          {audience === 'rent' ? (
            <RentVignette accent={accent} />
          ) : (
            <EarnVignette accent={accent} />
          )}
        </div>
      </div>
    </div>
  );

  // ============= RENTER PATH =============

  const renterPath = (
    <>
      <section ref={registerSection('path')} style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            eyebrow="Browse by category"
            title="41,300 listings, eight aisles, zero storage units"
            copy="Pick a category to see what it looks like near you."
          />
        </Reveal>
        <Reveal reduced={reduced} delay={80}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: \`repeat(\${catCols}, minmax(0, 1fr))\`,
              gap: 'var(--spacing-3)',
            }}>
            {CATEGORIES.map(cat => {
              const isSelected = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    ...styles.categoryTile,
                    ...(isSelected
                      ? {
                          borderColor: accent,
                          boxShadow: \`0 0 0 1px \${accent}\`,
                        }
                      : null),
                  }}>
                  <div
                    style={{
                      ...styles.categoryGlyph,
                      backgroundColor: tint(accent, 14),
                      color: accent,
                    }}
                    aria-hidden="true">
                    <Icon icon={cat.icon} size="sm" color="inherit" />
                  </div>
                  <Text size="sm" weight="semibold">
                    {cat.label}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {formatCount(cat.listings)} listings · from \${cat.fromPrice}
                    /day
                  </Text>
                </button>
              );
            })}
          </div>
        </Reveal>
        <p style={styles.captionLine} aria-live="polite">
          {category.label} — {formatCount(category.listings)} listings · from $
          {category.fromPrice}/day · avg owner rating {category.rating}★
        </p>
      </section>

      <section ref={registerSection('how')} style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            eyebrow="How it works"
            title="Three steps between you and the good gear"
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${stepCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-3)',
          }}>
          {HOW_STEPS.map((step, index) => (
            <Reveal key={step.id} reduced={reduced} delay={index * 90}>
              <div style={styles.stepCard}>
                <HStack gap={2} vAlign="center">
                  <div
                    style={{
                      ...styles.stepDisc,
                      backgroundColor: tint(accent, 14),
                      color: accent,
                    }}
                    aria-hidden="true">
                    {index + 1}
                  </div>
                  <span style={{color: accent, display: 'inline-flex'}}>
                    <Icon icon={step.icon} size="sm" color="inherit" />
                  </span>
                </HStack>
                <Text type="label">{step.title}</Text>
                <Text type="body" color="secondary">
                  {step.copy}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div
        ref={registerSection('trust')}
        style={{...styles.band, backgroundColor: tint(accent, 7)}}>
        <section style={{...columnStyle, ...sectionStyle}}>
          <Reveal reduced={reduced}>
            <SectionHead
              accent={accent}
              eyebrow="Trust & insurance"
              title="KitCover rides along on every rental"
              copy="Borrowing a stranger’s $3,000 camera should feel boring. Here’s why it does."
            />
          </Reveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: \`repeat(\${cardCols4}, minmax(0, 1fr))\`,
              gap: 'var(--spacing-3)',
            }}>
            {TRUST_CARDS.map((card, index) => (
              <Reveal key={card.id} reduced={reduced} delay={index * 80}>
                <div style={styles.infoCard}>
                  <div
                    style={{
                      ...styles.infoGlyph,
                      backgroundColor: tint(accent, 14),
                      color: accent,
                    }}
                    aria-hidden="true">
                    <Icon icon={card.icon} size="sm" color="inherit" />
                  </div>
                  <Text type="label">{card.title}</Text>
                  <Text type="body" color="secondary">
                    {card.copy}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      <section style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            eyebrow="Renter reviews"
            title="4.9 average across 28,400 completed rentals"
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${reviewCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-3)',
          }}>
          {REVIEWS.map((review, index) => (
            <Reveal key={review.id} reduced={reduced} delay={(index % 3) * 80}>
              <div style={styles.reviewCard}>
                <span
                  style={{...styles.starRow, color: accent}}
                  aria-label={\`\${review.stars} out of 5 stars\`}>
                  {starString(review.stars)}
                </span>
                <p style={styles.quote}>“{review.quote}”</p>
                <Text type="supporting" color="secondary">
                  {review.name} · {review.city} · rented a {review.item}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );

  // ============= OWNER PATH =============

  const ownerPath = (
    <>
      <div
        ref={registerSection('path')}
        style={{...styles.band, backgroundColor: tint(accent, 7)}}>
        <section style={{...columnStyle, ...sectionStyle}}>
          <Reveal reduced={reduced}>
            <SectionHead
              accent={accent}
              eyebrow="Earnings calculator"
              title="What would your gear make?"
              copy="Pick what you’d list and how often it’s free. We’ll give you an honest number."
            />
          </Reveal>
          <div ref={calcRef}>
            <Reveal reduced={reduced} delay={80}>
              <div style={styles.calcCard}>
                <Selector
                  label="What would you list?"
                  options={ITEM_TYPES.map(type => ({
                    value: type.id,
                    label: \`\${type.label} · ~$\${type.dailyRate}/day\`,
                  }))}
                  value={itemTypeId}
                  onChange={value => setItemTypeId(value)}
                />
                <Slider
                  label="Days your gear is free each week"
                  min={1}
                  max={7}
                  step={1}
                  value={daysPerWeek}
                  onChange={setDaysPerWeek}
                  valueDisplay="text"
                  formatValue={d => \`\${d} \${d === 1 ? 'day' : 'days'}/week\`}
                />
                <VStack gap={1}>
                  <span style={{...styles.calcEstimate, color: accent}}>
                    <AnimatedNumber
                      value={monthlyEstimate}
                      isActive={calcInView}
                      reduced={reduced}
                      format={n => \`$\${formatCount(n)}/mo\`}
                    />
                  </span>
                  <Text type="body">
                    Typical range \${formatCount(rangeLow)}–$
                    {formatCount(rangeHigh)}/mo at{' '}
                    {Math.round(itemType.utilization * 100)}% of your listed
                    days booked.
                  </Text>
                  {itemType.note != null ? (
                    <Text type="supporting" color="secondary">
                      {itemType.note}
                    </Text>
                  ) : null}
                  <Text type="supporting" color="secondary">
                    {CALC_DISCLOSURE}
                  </Text>
                </VStack>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      <section ref={registerSection('trust')} style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            eyebrow="Payouts & protection"
            title="Lend on your terms, paid on ours: fast"
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${cardCols4}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-3)',
          }}>
          {PAYOUT_CARDS.map((card, index) => (
            <Reveal key={card.id} reduced={reduced} delay={index * 80}>
              <div style={styles.infoCard}>
                <div
                  style={{
                    ...styles.infoGlyph,
                    backgroundColor: tint(accent, 14),
                    color: accent,
                  }}
                  aria-hidden="true">
                  <Icon icon={card.icon} size="sm" color="inherit" />
                </div>
                <Text type="label">{card.title}</Text>
                <Text type="body" color="secondary">
                  {card.copy}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <SectionHead
            accent={accent}
            eyebrow="Top-earner stories"
            title="The gear shelf that pays for itself"
          />
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${storyCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-3)',
          }}>
          {EARNER_STORIES.map((story, index) => (
            <Reveal key={story.id} reduced={reduced} delay={index * 90}>
              <EarnerStoryCard story={story} accent={accent} reduced={reduced} />
            </Reveal>
          ))}
        </div>
        <Text type="supporting" color="secondary">
          {EARNER_DISCLOSURE}
        </Text>
      </section>
    </>
  );

  // ============= SHARED SECTIONS =============

  const statsBand = (
    <div style={{...styles.band, backgroundColor: tint(accent, 7)}}>
      <section style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: \`repeat(\${statCols}, minmax(0, 1fr))\`,
              gap: 'var(--spacing-4)',
            }}>
            {STATS.map(stat => (
              <StatFigure
                key={stat.id}
                stat={stat}
                accent={accent}
                reduced={reduced}
              />
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );

  const citiesSection = (
    <section ref={registerSection('cities')} style={{...columnStyle, ...sectionStyle}}>
      <Reveal reduced={reduced}>
        <SectionHead
          accent={accent}
          eyebrow="Where Kitloop lives"
          title="Live in 12 cities and counting"
          copy="Tap a city to see how deep the local shelf goes."
        />
      </Reveal>
      <Reveal reduced={reduced} delay={80}>
        <HStack gap={2} wrap="wrap">
          {CITIES.map(c => {
            const isSelected = c.id === selectedCity;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCity(c.id)}
                style={{
                  ...styles.cityChip,
                  ...(isSelected
                    ? {
                        borderColor: accent,
                        boxShadow: \`0 0 0 1px \${accent}\`,
                        color: accent,
                      }
                    : null),
                }}>
                <Icon icon={MapPinIcon} size="xsm" color="inherit" />
                {c.name}
              </button>
            );
          })}
        </HStack>
      </Reveal>
      <p style={styles.captionLine} aria-live="polite">
        {city.name} — {formatCount(city.listings)} listings · avg pickup{' '}
        {city.pickupMiles} mi · top category: {city.topCategory}
      </p>
    </section>
  );

  const faqSection = (
    <section ref={registerSection('faq')} style={{...columnStyle, ...sectionStyle}}>
      <Reveal reduced={reduced}>
        <SectionHead accent={accent} eyebrow="FAQ" title="Fair questions, straight answers" />
      </Reveal>
      <TabList
        value={faqAudience}
        onChange={value => setFaqOverride(value as Audience)}
        aria-label="FAQ audience"
        hasDivider>
        <Tab value="rent" label="For renters" />
        <Tab value="earn" label="For owners" />
      </TabList>
      <VStack gap={2}>
        {FAQ[faqAudience].map(entry => {
          const key = \`\${faqAudience}-\${entry.id}\`;
          return (
            <div
              key={key}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 'var(--spacing-2) var(--spacing-3)',
                backgroundColor: 'var(--color-background-card)',
              }}>
              <Collapsible
                isOpen={openFaqs.has(key)}
                onOpenChange={isOpen => toggleFaq(key, isOpen)}
                trigger={entry.question}>
                <div style={{padding: 'var(--spacing-2) 0 var(--spacing-1)'}}>
                  <Text type="body" color="secondary">
                    {entry.answer}
                  </Text>
                </div>
              </Collapsible>
            </div>
          );
        })}
      </VStack>
    </section>
  );

  const ctaBand = (
    <div
      ref={registerSection('cta')}
      style={{...styles.band, backgroundColor: tint(accent, 10)}}>
      <section style={{...columnStyle, ...sectionStyle}}>
        <Reveal reduced={reduced}>
          <div key={\`cta-\${audience}\`} style={{animation: swapAnimation}}>
            <VStack gap={3}>
              <Heading level={2}>{theme.ctaHeading}</Heading>
              <Text type="body" color="secondary">
                {theme.ctaCopy}
              </Text>
              {confirmedEmail == null ? (
                <VStack gap={2}>
                  <div
                    style={{
                      ...styles.emailRow,
                      ...(isPhone ? styles.emailRowStacked : null),
                    }}>
                    <div style={styles.emailInput}>
                      <TextInput
                        label="Email address"
                        isLabelHidden
                        placeholder="you@example.com"
                        value={email}
                        onChange={value => {
                          setEmail(value);
                          setEmailError(null);
                        }}
                      />
                    </div>
                    <AccentButton
                      label={theme.ctaButton}
                      accent={accent}
                      icon={ArrowRightIcon}
                      onClick={submitEmail}
                    />
                  </div>
                  {emailError != null ? (
                    <p style={styles.emailError} role="alert">
                      {emailError}
                    </p>
                  ) : null}
                </VStack>
              ) : (
                <HStack gap={3} vAlign="center">
                  <div
                    style={{
                      ...styles.successDisc,
                      backgroundColor: tint(accent, 16),
                      color: accent,
                    }}
                    aria-hidden="true">
                    <Icon icon={MailCheckIcon} size="sm" color="inherit" />
                  </div>
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text type="label">Check your inbox</Text>
                      <Text type="body" color="secondary">
                        We sent your link to {confirmedEmail}.
                      </Text>
                    </VStack>
                  </StackItem>
                  <Button
                    label="Use a different email"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmedEmail(null)}
                  />
                </HStack>
              )}
              <Text type="supporting" color="secondary">
                {theme.finePrint}
              </Text>
            </VStack>
          </div>
        </Reveal>
      </section>
    </div>
  );

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...columnStyle,
          paddingBlock: 'var(--spacing-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-6)',
        }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: \`repeat(\${footerCols}, minmax(0, 1fr))\`,
            gap: 'var(--spacing-5)',
          }}>
          {FOOTER_COLUMNS.map(column => (
            <VStack key={column.id} gap={2}>
              <Text type="label">{column.heading}</Text>
              <VStack gap={0}>
                {column.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    style={styles.footerLink}
                    onClick={
                      link.target != null
                        ? () => {
                            if (link.switchTo != null) {
                              switchAudience(link.switchTo);
                            }
                            jumpToSection(link.target as SectionId);
                          }
                        : () => {}
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            </VStack>
          ))}
        </div>
        <VStack gap={2}>
          <BrandMark />
          <Text type="supporting" color="secondary">
            © 2026 Kitloop, Inc. KitCover is Kitloop’s protection guarantee,
            not an insurance policy; coverage limits and exclusions apply.
            Earnings figures reflect the 12 months ending June 2026.
          </Text>
        </VStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={wrapRef} style={{height: '100%'}}>
          <style>{\`@keyframes kitloopSwapIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\`}</style>
          <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
            {navBar}
            {hero}
            <div key={\`path-\${audience}\`} style={{animation: swapAnimation}}>
              {audience === 'rent' ? renterPath : ownerPath}
            </div>
            {statsBand}
            {citiesSection}
            {faqSection}
            {ctaBand}
            {footer}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};