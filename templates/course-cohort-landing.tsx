// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file course-cohort-landing.tsx
 * @input Deterministic fixtures only (the fictional "Load-Bearing" 6-week
 *   systems-design cohort course: hero promise copy, a Cohort 9 card with
 *   fixed seat counts (18 of 40 left) and dates (Sep 14 – Oct 23, 2026),
 *   a $1,400 list / $1,200 early-bird price pair with an Aug 1 deadline,
 *   four "you will ship" outcomes, a six-week curriculum with topics,
 *   live-session times and per-week deliverables, an instructor bio with
 *   credibility chips and count-up stats, four student capstone cards,
 *   three testimonials with role chips, a Self-paced vs Cohort comparison
 *   matrix, a 1×/3× payment-plan price table, five FAQ entries, and
 *   footer link columns)
 * @output Complete vertical-specific marketing landing page for a live
 *   cohort course: sticky navbar (brand mark + five smooth-scrolling
 *   anchor links with scroll-spy + Apply CTA, collapsing to a hamburger
 *   dropdown at compact widths), a split hero whose next-cohort card is
 *   the signature moment — its seats meter fills and the seats-left
 *   number counts up on load — outcomes bullets whose checkmarks draw on
 *   when first revealed, a controlled week-by-week curriculum accordion
 *   (week 1 open by default), an instructor split with count-up alumni
 *   stats, a hover-lift student project gallery, a testimonial trio, an
 *   honest Self-paced vs Cohort comparison, a pricing card whose payment
 *   plan toggle recomputes totals honestly (3 × $420 = $1,260, +$60 vs
 *   pay-in-full), a FAQ accordion, a validating apply email capture that
 *   flips to a confirmation state, and a sitemap footer. Scroll reveals
 *   rise+fade 12px and fire once; everything is gated by
 *   prefers-reduced-motion (reveals render visible, counters render
 *   final, the meter renders full).
 * @position Page template; emitted by `astryx template course-cohort-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * measured wrapper (useElementWidth drives every breakpoint because the
 * inline demo stage never fires viewport media queries) around a single
 * scroll container; inside it the navbar is position:sticky top:0 and the
 * page is a stack of full-bleed bands (tinted bands alternate with plain
 * ones), each carrying its own centered 1120px column.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll the container to real
 *   section ids with a sticky-nav allowance; onScroll spies the last
 *   anchor above the fold and highlights it (aria-current).
 * - At compact widths the anchors collapse behind a 40px hamburger whose
 *   dropdown closes on Escape (refocusing the trigger), outside
 *   pointerdown, or any selection.
 * - The curriculum and FAQ accordions are controlled via Sets so several
 *   items can be open at once; week 1 and FAQ 1 ship open.
 * - The payment-plan SegmentedControl swaps $1,200 one payment for
 *   3 × $420 and recomputes the total honestly (+$60 vs pay-in-full);
 *   the early-bird strikethrough applies to pay-in-full only.
 * - The apply form validates on submit (empty and format errors inline)
 *   and success swaps the form for a confirmation echoing the address,
 *   with a "Use a different email" reset. Pricing/apply CTAs scroll to
 *   the apply band; only footer resource links (which would leave the
 *   page) are no-ops.
 * - Motion: IntersectionObserver reveals fire once (rise+fade 12px),
 *   outcome checks draw on with a stagger, seat/alumni/cohort numbers
 *   count up on first view, and the hero seats meter fills on load. All
 *   of it collapses to final frames under prefers-reduced-motion.
 *
 * Color policy: token-pure chrome with ONE quarantined accent literal —
 * Load-Bearing's signal orange, declared once as light-dark() with
 * contrast math — plus scheme-locked gradient art tiles (brand mark,
 * project gallery, instructor monogram) that are art, not UI, and must
 * not reflow with the theme. No network images, no real logos.
 *
 * Responsive contract (useElementWidth on the page wrapper):
 * - Columns: max-width 1120px, centered; bands paint edge to edge.
 * - >820px: navbar shows five inline anchors + Apply CTA.
 * - <=820px: anchors collapse behind the hamburger dropdown.
 * - >960px: outcomes sit 4-up; <=960px they drop to 2-up; <=560px 1-up.
 * - >760px: hero and instructor are split rows, the comparison and
 *   project gallery sit 2-up, testimonials 3-up.
 * - <=760px: hero/instructor stack (card below copy), comparison and
 *   testimonials stack to a single column, gallery drops to 1-up at
 *   <=560px, headline sizes step down, and the apply form stacks its
 *   button under the input. Holds at 390px with no overflow-x.
 * - Tap targets: hamburger and nav links are 40px controls; accordion
 *   triggers carry generous padding; nothing requires hover (the project
 *   card lift is decorative only).
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
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  HammerIcon,
  LandmarkIcon,
  MailCheckIcon,
  MenuIcon,
  ShieldCheckIcon,
  VideoIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= ACCENT (quarantined literal) =============
// The ONE sanctioned accent literal for this page: Load-Bearing's signal
// orange. Contrast math: light #C2410C on the white page body ≈ 5.0:1
// (AA for text and UI); dark #FDBA74 on the near-black dark body ≈ 9.6:1.
// Every other UI color on the page is a design token.
const ACCENT = 'light-dark(#C2410C, #FDBA74)';
// Derived tints of the same quarantined hue (backgrounds only; text on
// top of these always uses tokens or ACCENT itself).
const ACCENT_SOFT = 'light-dark(rgba(194, 65, 12, 0.10), rgba(253, 186, 116, 0.14))';
const ACCENT_BORDER = 'light-dark(rgba(194, 65, 12, 0.35), rgba(253, 186, 116, 0.40))';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 76;
const SPY_OFFSET = 150;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  wrap: {
    height: '100%',
  },
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
    boxSizing: 'border-box',
    paddingInline: 'var(--spacing-6)',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
  },
  band: {
    paddingBlock: 'var(--spacing-9)',
  },
  bandCompact: {
    paddingBlock: 'var(--spacing-6)',
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // Hero band: a faint wash of the quarantined accent (background only).
  bandHero: {
    backgroundImage: `radial-gradient(90% 120% at 85% -20%, ${ACCENT_SOFT}, transparent 60%)`,
  },
  bandApply: {
    backgroundColor: ACCENT_SOFT,
    borderTop: `1px solid ${ACCENT_BORDER}`,
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
  // Scheme-locked brand art: the rust→amber tile and its white glyph are
  // identical in both app themes (art, not UI color).
  brandTile: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #9A3412 0%, #F59E0B 100%)',
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
    backgroundColor: ACCENT_SOFT,
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
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroCardSlot: {
    flex: '0 1 420px',
    minWidth: 0,
  },
  heroCardSlotStacked: {
    flex: '1 1 auto',
  },
  heroHeadline: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 31,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 540,
    margin: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  eyebrowAccent: {
    color: ACCENT,
  },
  // ---- seats meter ----
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  priceNow: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  priceWas: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    fontVariantNumeric: 'tabular-nums',
  },
  saveChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  // ---- outcomes ----
  outcomesGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  outcomeCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  checkDisc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  // ---- curriculum ----
  weekToken: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    height: 26,
    paddingInline: 10,
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  deliverableRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 10,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  // ---- instructor ----
  splitRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  splitRowStacked: {
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // Scheme-locked art: instructor monogram gradient (identical in both
  // themes; the white initials read on the full gradient range).
  instructorDisc: {
    width: 96,
    height: 96,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 55%, #FBBF24 100%)',
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  credChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- project gallery ----
  galleryGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  projectCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  projectCardLifted: {
    transform: 'translateY(-3px)',
    boxShadow: 'var(--shadow-med)',
  },
  // Scheme-locked art: per-card gradient composition tiles.
  projectArt: {
    height: 120,
    position: 'relative',
    colorScheme: 'dark',
    overflow: 'hidden',
  },
  projectArtGlyph: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: '0.04em',
  },
  projectBody: {
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  // ---- testimonials ----
  testimonialGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  quoteMark: {
    fontSize: 34,
    lineHeight: 1,
    fontWeight: 700,
    color: ACCENT,
  },
  // ---- comparison ----
  compareGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  compareCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  compareCardAccent: {
    borderColor: ACCENT_BORDER,
    boxShadow: `0 0 0 1px ${ACCENT_BORDER}`,
  },
  compareRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  compareGlyphMuted: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: 'var(--color-text-secondary)',
  },
  compareGlyphAccent: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: ACCENT,
  },
  // ---- pricing ----
  pricingCard: {
    maxWidth: 560,
    marginInline: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  guaranteeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 10,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  // ---- apply band ----
  applyForm: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 460,
  },
  applyFormStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  applyInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  formError: {
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
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
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
  footerColumns: {
    display: 'grid',
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
  monoRow: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Load-Bearing cohort course.
// No Date.now, no randomness, no network assets. "Today" for copy
// purposes is mid-July 2026: early-bird ends Aug 1, Cohort 9 starts
// Mon Sep 14 and ends Fri Oct 23, 2026.

const BRAND = {
  name: 'Load-Bearing',
  tagline: 'Systems design, taught the way it is actually practiced',
};

const HERO = {
  kicker: '6-week live cohort · systems design',
  headline: 'Design systems that survive their own success',
  subcopy:
    'Load-Bearing is six weeks of writing, defending, and stress-testing ' +
    'real design docs with 39 other working engineers — not another video ' +
    'library. You leave with artifacts your team can use on Monday.',
  finePrint: 'Applications close Sep 7 · seats confirmed in order received',
};

const COHORT = {
  label: 'Cohort 9',
  dates: 'Mon Sep 14 – Fri Oct 23, 2026',
  seatsTotal: 40,
  seatsLeft: 18,
  liveSessions: 'Live sessions Tue & Thu · 6:00–7:30 PM ET',
  weeklyLoad: '5–7 hours per week, including live time',
  listPrice: 1400,
  earlyPrice: 1200,
  earlyDeadline: 'Save $200 until Aug 1',
};

type SectionId = 'outcomes' | 'curriculum' | 'instructor' | 'pricing' | 'faq';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'outcomes', label: 'Outcomes'},
  {id: 'curriculum', label: 'Curriculum'},
  {id: 'instructor', label: 'Instructor'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'faq', label: 'FAQ'},
];

/** Anchor for the apply band (CTAs only; not in the navbar). */
const APPLY_ID = 'apply';

const OUTCOMES: readonly {id: string; title: string; copy: string}[] = [
  {
    id: 'docs',
    title: 'Two defended design docs',
    copy: 'Written by you, critiqued live by the cohort and instructor — not just read about in a PDF.',
  },
  {
    id: 'load-model',
    title: 'A load model your team can audit',
    copy: 'Peak-hour capacity math for a real system you run, with the envelope calculations shown.',
  },
  {
    id: 'failure-map',
    title: 'A failure-mode map + runbook',
    copy: 'For one of your own production services: what breaks first, what you do about it, rehearsed.',
  },
  {
    id: 'capstone',
    title: 'A capstone reviewed 1:1',
    copy: 'A full systems design defended in a private review — ready for your next promo packet.',
  },
];

interface Week {
  week: number;
  title: string;
  sessions: string;
  topics: readonly string[];
  deliverable: string;
}

const CURRICULUM: readonly Week[] = [
  {
    week: 1,
    title: 'Load models & envelope math',
    sessions: 'Tue Sep 15 + Thu Sep 17 · 6:00–7:30 PM ET',
    topics: [
      'Traffic estimation: reads, writes, and the ratios that matter',
      'Back-of-envelope math that survives a skeptical staff engineer',
      'Growth curves, peak factors, and when to stop guessing',
    ],
    deliverable: 'A load model for one of your own services, peak-hour math included',
  },
  {
    week: 2,
    title: 'Data models & storage engines',
    sessions: 'Tue Sep 22 + Thu Sep 24 · 6:00–7:30 PM ET',
    topics: [
      'Choosing a storage engine from access patterns, not fashion',
      'Indexes, hot partitions, and write amplification in practice',
      'Schema evolution without a migration horror story',
    ],
    deliverable: 'A schema + storage-choice memo, defended in live review',
  },
  {
    week: 3,
    title: 'Caching, queues & backpressure',
    sessions: 'Tue Sep 29 + Thu Oct 1 · 6:00–7:30 PM ET',
    topics: [
      'Cache invalidation strategies that fail loudly, not quietly',
      'Queue depth as a health signal; bounding the unbounded',
      'Backpressure end to end: shed, degrade, or fall over',
    ],
    deliverable: 'A failure-mode map for your critical path',
  },
  {
    week: 4,
    title: 'Replication, sharding & consistency',
    sessions: 'Tue Oct 6 + Thu Oct 8 · 6:00–7:30 PM ET',
    topics: [
      'Choosing a consistency level you can explain to product',
      'Shard keys: the decision you only get to make once (twice, painfully)',
      'Rebalancing and resharding with the traffic still on',
    ],
    deliverable: 'A shard-split runbook with a cutover checklist',
  },
  {
    week: 5,
    title: 'Resilience: retries, timeouts & load shedding',
    sessions: 'Tue Oct 13 + Thu Oct 15 · 6:00–7:30 PM ET',
    topics: [
      'Retry budgets and why naive retries take down healthy systems',
      'Timeout hierarchies that add up instead of multiplying',
      'Graceful degradation: deciding in advance what you drop first',
    ],
    deliverable: 'An incident-drill design doc, run as a tabletop with your pod',
  },
  {
    week: 6,
    title: 'Capstone design reviews',
    sessions: 'Tue Oct 20 + Thu Oct 22 · 6:00–7:30 PM ET',
    topics: [
      'Capstone presentations: 15 minutes, cohort critique, instructor notes',
      'What reviewers at the next level actually look for',
      'Where to take the artifacts: promo packets, RFCs, interviews',
    ],
    deliverable: 'Your capstone design doc, defended 1:1 with Nadia',
  },
];

const INSTRUCTOR = {
  name: 'Nadia Osei',
  initials: 'NO',
  role: 'Instructor & founder, Load-Bearing',
  bio1:
    'Nadia spent 11 years keeping other people’s success from crushing ' +
    'their systems: infra lead at Ferrous, where the payments path grew from ' +
    '900 to 40,000 requests per second on her watch, then principal engineer ' +
    'at Cobalt Grid, running the storage platform through three shard ' +
    'generations without a customer-visible cutover.',
  bio2:
    'She started Load-Bearing in 2023 on a simple observation: engineers ' +
    'level up in design review, not in video libraries. Every exercise in ' +
    'the course is one she has run inside real orgs — the cohort just makes ' +
    'the review honest.',
  stats: [
    {id: 'alumni', target: 1214, suffix: ' alumni'},
    {id: 'cohorts', target: 8, suffix: ' cohorts taught'},
  ],
  chips: ['Ex-Ferrous · Ex-Cobalt Grid', '4.9/5 average rating'],
};

// Scheme-locked art gradients for the student project tiles (art, not UI).
const PROJECTS: readonly {
  id: string;
  title: string;
  student: string;
  art: string;
  tag: string;
}[] = [
  {
    id: 'rate-limiter',
    title: 'Hot-key shedding for a rate limiter that survived a 40× spike',
    student: 'Priya M. · Cohort 7',
    art: 'linear-gradient(135deg, #7C2D12 0%, #DC2626 60%, #F59E0B 100%)',
    tag: 'p99 41ms',
  },
  {
    id: 'checkout-saga',
    title: 'Multi-region checkout saga with idempotent retries',
    student: 'Jonas K. · Cohort 6',
    art: 'linear-gradient(135deg, #1E3A5F 0%, #0E7490 60%, #34D399 100%)',
    tag: '3 regions',
  },
  {
    id: 'inventory-ledger',
    title: 'Event-sourced inventory ledger with replayable audits',
    student: 'Amara D. · Cohort 8',
    art: 'linear-gradient(135deg, #3B0764 0%, #7C3AED 60%, #F472B6 100%)',
    tag: '12M events/day',
  },
  {
    id: 'shard-split',
    title: 'Zero-downtime shard split, rehearsed in week 4 and shipped in week 6',
    student: 'Tom R. · Cohort 7',
    art: 'linear-gradient(135deg, #14532D 0%, #15803D 60%, #A3E635 100%)',
    tag: '0s downtime',
  },
];

const TESTIMONIALS: readonly {
  id: string;
  quote: string;
  name: string;
  roleChip: string;
}[] = [
  {
    id: 'elena',
    quote:
      'I had watched every systems-design video on the internet. Six weeks of defending my own doc in front of 40 people did more than all of it combined.',
    name: 'Elena Duarte',
    roleChip: 'Senior → Staff Engineer',
  },
  {
    id: 'marcus',
    quote:
      'The load-model week paid for the course by itself — we caught a queue provisioned at a third of real peak two months before our biggest sale.',
    name: 'Marcus Webb',
    roleChip: 'Backend Engineer',
  },
  {
    id: 'sofia',
    quote:
      'I now send every new senior hire through Load-Bearing. The failure-map exercise became part of our onboarding, verbatim.',
    name: 'Sofia Lindqvist',
    roleChip: 'Engineering Manager',
  },
];

interface CompareRow {
  id: string;
  selfPaced: string;
  cohort: string;
  /** Whether the self-paced side gets a check (honesty beat) or an X. */
  selfPacedHasCheck: boolean;
}

const COMPARISON: readonly CompareRow[] = [
  {
    id: 'format',
    selfPaced: 'Video library, watched alone',
    cohort: 'Live design reviews, twice a week',
    selfPacedHasCheck: false,
  },
  {
    id: 'pace',
    selfPaced: 'Start and stop whenever',
    cohort: 'Weekly deliverables, with your cohort watching',
    selfPacedHasCheck: true,
  },
  {
    id: 'feedback',
    selfPaced: 'Forum threads, eventually',
    cohort: 'Instructor critique on your actual docs',
    selfPacedHasCheck: false,
  },
  {
    id: 'peers',
    selfPaced: 'Comment sections',
    cohort: '40-person cohort + alumni channel after',
    selfPacedHasCheck: false,
  },
  {
    id: 'completion',
    selfPaced: 'Industry-typical ~11% finish rate',
    cohort: '87% of Cohort 8 finished all six weeks',
    selfPacedHasCheck: false,
  },
  {
    id: 'price',
    selfPaced: 'Cheaper — $150 to $400',
    cohort: '$1,200, refundable through week 2',
    selfPacedHasCheck: true,
  },
];

type PayPlan = 'full' | 'split';

const PAYMENT = {
  fullLabel: 'Pay in full',
  splitLabel: '3 payments',
  splitInstallment: 420,
  splitCount: 3,
  included: [
    'All 12 live sessions + recordings within 2 hours',
    'Weekly deliverable reviews in cohort',
    'Two 1:1 design-doc critiques with Nadia',
    'Alumni channel access after graduation',
    'Lifetime access to course materials and updates',
  ],
  guarantee:
    'Full refund through the end of week 2 (Sep 25) — no questions, no forms. After that, you can transfer your seat to Cohort 10 instead.',
};

const FAQ: readonly {id: string; question: string; answer: string}[] = [
  {
    id: 'time',
    question: 'How much time does the course take each week?',
    answer:
      'Plan on 5–7 hours: two 90-minute live sessions (Tue & Thu at 6:00 PM ET), one deliverable that builds on work you already do, and about an hour of reading. Weeks 1 and 6 run slightly heavier.',
  },
  {
    id: 'miss',
    question: 'What if I miss a live session?',
    answer:
      'Recordings land within 2 hours, and you can submit your deliverable for async written review. Each cohort also gets one make-up critique slot per person — miss more than three sessions, though, and we’ll suggest deferring to Cohort 10.',
  },
  {
    id: 'level',
    question: 'Is this the right level for me?',
    answer:
      'It’s built for engineers with 2+ years shipping production code who are starting to own designs, not just implement them. It is not interview prep — although alumni report that side effect — and it assumes you can read code in any mainstream language.',
  },
  {
    id: 'reimburse',
    question: 'Can my employer pay for it?',
    answer:
      'Usually, yes — about 60% of alumni expensed it. On enrollment you get an invoice, the full syllabus PDF, and a one-page manager brief that maps each week to a team artifact (the load model and failure map do most of the convincing).',
  },
  {
    id: 'refund',
    question: 'What is the refund policy, exactly?',
    answer:
      'Full refund through the end of week 2 (Sep 25, 2026), no questions asked. After week 2 there are no refunds, but you can transfer your seat to Cohort 10 once, free. Payment-plan enrollments cancel remaining installments on refund.',
  },
];

const FOOTER_RESOURCES: readonly string[] = [
  'Syllabus (PDF)',
  'Reading list',
  'Alumni projects',
  'Manager brief',
];

// ============= HELPERS =============

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to start an application.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'That doesn’t look like an email address.';
  }
  return null;
}

/**
 * Measure the page's own width (the inline demo stage is ~1045px wide in
 * a 1440px window, so viewport media queries never fire there).
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

/** prefers-reduced-motion gate: reveals render visible, counters final. */
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

/** Fire-once in-view flag for group-triggered animations. */
function useInViewOnce(
  ref: RefObject<HTMLElement | null>,
  isStatic: boolean,
): boolean {
  const [isSeen, setIsSeen] = useState(false);
  useEffect(() => {
    if (isStatic) {
      setIsSeen(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsSeen(true);
          observer.disconnect();
        }
      },
      {threshold: 0.2},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, isStatic]);
  return isSeen;
}

/** Ease-out count-up; renders the final value under reduced motion. */
function useCountUp(
  target: number,
  isActive: boolean,
  isStatic: boolean,
  durationMs = 1100,
): number {
  const [value, setValue] = useState(isStatic ? target : 0);
  useEffect(() => {
    if (isStatic) {
      setValue(target);
      return undefined;
    }
    if (!isActive) {
      return undefined;
    }
    let frame = 0;
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
  }, [target, isActive, isStatic, durationMs]);
  return value;
}

// ============= SMALL PIECES =============

/** Scroll reveal: rise+fade 12px, fires once; static when reduced. */
function Reveal({
  isStatic,
  delayMs = 0,
  children,
}: {
  isStatic: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isSeen = useInViewOnce(ref, isStatic);
  return (
    <div
      ref={ref}
      style={{
        opacity: isSeen ? 1 : 0,
        transform: isSeen ? 'none' : 'translateY(12px)',
        transition: isStatic
          ? undefined
          : `opacity 0.5s ease ${delayMs}ms, transform 0.5s ease ${delayMs}ms`,
      }}>
      {children}
    </div>
  );
}

/** Self-observing count-up number (tabular, en-US grouping). */
function CountUpNumber({
  target,
  suffix = '',
  isStatic,
  style,
}: {
  target: number;
  suffix?: string;
  isStatic: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isSeen = useInViewOnce(ref, isStatic);
  const value = useCountUp(target, isSeen, isStatic);
  return (
    <span ref={ref} style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

/** Checkmark that draws on (stroke-dashoffset) when its group reveals. */
function DrawnCheck({
  isOn,
  isStatic,
  delayMs,
}: {
  isOn: boolean;
  isStatic: boolean;
  delayMs: number;
}) {
  return (
    <svg width={18} height={18} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 10.5l4.2 4.3L16 5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: isOn ? 0 : 1,
          transition: isStatic
            ? undefined
            : `stroke-dashoffset 0.5s ease-out ${delayMs}ms`,
        }}
      />
    </svg>
  );
}

/** 40px icon-only control (Astryx Button caps at 36px). */
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

/** Section intro: uppercase accent eyebrow + title + supporting copy. */
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
    <VStack gap={2}>
      <span style={{...styles.eyebrow, ...styles.eyebrowAccent}}>{eyebrow}</span>
      <Heading level={2}>{title}</Heading>
      {description != null && (
        <Text type="supporting" color="secondary">
          {description}
        </Text>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function CourseCohortLandingTemplate() {
  const isStatic = usePrefersReducedMotion();

  // ---- responsive (ResizeObserver; see Responsive contract) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 820;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;
  const outcomeCols = isPhone ? 1 : wrapWidth > 0 && wrapWidth <= 960 ? 2 : 4;
  const galleryCols = isPhone ? 1 : 2;
  const testimonialCols = isStacked ? 1 : 3;
  const compareCols = isStacked ? 1 : 2;
  const footerCols = isPhone ? 1 : isStacked ? 2 : 3;

  // ---- navbar ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- hero signature moment: seats meter fills + count-up on load ----
  const [isMeterOn, setIsMeterOn] = useState(false);
  useEffect(() => {
    if (isStatic) {
      setIsMeterOn(true);
      return undefined;
    }
    const timer = setTimeout(() => setIsMeterOn(true), 300);
    return () => clearTimeout(timer);
  }, [isStatic]);
  const seatsLeftShown = useCountUp(COHORT.seatsLeft, isMeterOn, isStatic);
  const seatsClaimedPct = Math.round(
    ((COHORT.seatsTotal - COHORT.seatsLeft) / COHORT.seatsTotal) * 100,
  );

  // ---- outcomes check draw-ons (group-triggered, staggered) ----
  const outcomesRef = useRef<HTMLDivElement | null>(null);
  const outcomesSeen = useInViewOnce(outcomesRef, isStatic);

  // ---- curriculum + FAQ accordions (Sets: several can be open) ----
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => new Set([1]));
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set([FAQ[0].id]),
  );

  // ---- project gallery hover lift (decorative) ----
  const [liftedProject, setLiftedProject] = useState<string | null>(null);

  // ---- pricing plan toggle ----
  const [payPlan, setPayPlan] = useState<PayPlan>('full');
  const splitTotal = PAYMENT.splitInstallment * PAYMENT.splitCount;
  const splitPremium = splitTotal - COHORT.earlyPrice;

  // ---- apply form ----
  const [applyEmail, setApplyEmail] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // Menu dismisses on Escape (refocusing the trigger) and on pointerdown
  // outside the sticky navbar; the listener only runs while open.
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
  const jumpToSection = (id: SectionId | typeof APPLY_ID) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsMenuOpen(false);
    if (container === null || section == null) {
      return;
    }
    if (id !== APPLY_ID) {
      setActiveSection(id);
    }
    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    container.scrollTo({
      top:
        sectionRect.top - containerRect.top + container.scrollTop - NAV_ALLOWANCE,
      behavior: isStatic ? 'auto' : 'smooth',
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
      if (section.getBoundingClientRect().top - containerRect.top <= SPY_OFFSET) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
  };

  const toggleWeek = (week: number, isOpen: boolean) => {
    setOpenWeeks(previous => {
      const next = new Set(previous);
      if (isOpen) {
        next.add(week);
      } else {
        next.delete(week);
      }
      return next;
    });
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

  const submitApply = () => {
    const error = validateEmail(applyEmail);
    if (error !== null) {
      setApplyError(error);
      return;
    }
    setConfirmedEmail(applyEmail.trim());
    setApplyEmail('');
    setApplyError(null);
  };

  const registerSection =
    (id: SectionId | typeof APPLY_ID) => (node: HTMLElement | null) => {
      sectionRefs.current[id] = node;
    };

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnCompact : null),
  };
  const bandPad: CSSProperties = {
    ...styles.band,
    ...(isPhone ? styles.bandCompact : null),
  };

  // ============= CHROME =============

  const brandMark = (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={LandmarkIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );

  const navbar = (
    <header ref={navRef} style={styles.navBar}>
      <div style={styles.navInner}>
        {brandMark}
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center" hAlign="center">
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
          label={isPhone ? 'Apply' : 'Apply for Cohort 9'}
          variant="primary"
          size="sm"
          onClick={() => jumpToSection(APPLY_ID)}
        />
        {isNavCollapsed && (
          <IconButton40
            label={isMenuOpen ? 'Close menu' : 'Open menu'}
            icon={isMenuOpen ? XIcon : MenuIcon}
            ariaExpanded={isMenuOpen}
            buttonRef={menuTriggerRef}
            onClick={() => setIsMenuOpen(previous => !previous)}
          />
        )}
        {isNavCollapsed && isMenuOpen && (
          <nav style={styles.mobileMenu} aria-label="Site menu">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={styles.mobileMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <Divider />
              <button
                type="button"
                style={styles.mobileMenuLink}
                onClick={() => jumpToSection(APPLY_ID)}>
                <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                Apply for Cohort 9
              </button>
            </VStack>
          </nav>
        )}
      </div>
    </header>
  );

  // ============= HERO =============

  const cohortCard = (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <span style={styles.eyebrow}>Next cohort</span>
          <StackItem size="fill">{null}</StackItem>
          <Token label={COHORT.label} size="sm" color="orange" />
        </HStack>
        <VStack gap={1}>
          <Heading level={3}>{COHORT.dates}</Heading>
          <HStack gap={2} vAlign="center">
            <Icon icon={VideoIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              {COHORT.liveSessions}
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center">
            <Icon icon={ClockIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              {COHORT.weeklyLoad}
            </Text>
          </HStack>
        </VStack>
        {/* Signature moment: meter fills + seat count counts up on load. */}
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text size="sm" weight="semibold">
                <span style={{fontVariantNumeric: 'tabular-nums'}}>
                  {seatsLeftShown}
                </span>{' '}
                of {COHORT.seatsTotal} seats left
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              {seatsClaimedPct}% claimed
            </Text>
          </HStack>
          <div
            style={styles.meterTrack}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={COHORT.seatsTotal}
            aria-valuenow={COHORT.seatsTotal - COHORT.seatsLeft}
            aria-label="Seats claimed">
            <div
              style={{
                ...styles.meterFill,
                width: isMeterOn ? `${seatsClaimedPct}%` : '0%',
                transition: isStatic ? undefined : 'width 0.9s ease-out',
              }}
            />
          </div>
        </VStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.priceNow}>{formatUSD(COHORT.earlyPrice)}</span>
          <span style={styles.priceWas} aria-label="Regular price $1,400">
            {formatUSD(COHORT.listPrice)}
          </span>
          <span style={styles.saveChip}>{COHORT.earlyDeadline}</span>
        </HStack>
        <Button
          label="Reserve a seat"
          variant="primary"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() => jumpToSection(APPLY_ID)}
        />
      </VStack>
    </Card>
  );

  const hero = (
    <div style={{...styles.bandHero, ...bandPad}}>
      <div style={columnStyle}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <span style={{...styles.eyebrow, ...styles.eyebrowAccent}}>
              {HERO.kicker}
            </span>
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
                label="Reserve a seat"
                variant="primary"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection(APPLY_ID)}
              />
              <Button
                label="See the curriculum"
                variant="secondary"
                onClick={() => jumpToSection('curriculum')}
              />
            </HStack>
            <Text type="supporting" color="secondary">
              {HERO.finePrint}
            </Text>
          </div>
          <div
            style={{
              ...styles.heroCardSlot,
              ...(isStacked ? styles.heroCardSlotStacked : null),
            }}>
            {cohortCard}
          </div>
        </div>
      </div>
    </div>
  );

  // ============= OUTCOMES =============

  const outcomes = (
    <section
      ref={registerSection('outcomes')}
      aria-label="Outcomes"
      style={bandPad}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              eyebrow="What you will ship"
              title="Artifacts, not certificates"
              description="Every week ends with something real. By Oct 23 you will have shipped:"
            />
          </Reveal>
          <div
            ref={outcomesRef}
            style={{
              ...styles.outcomesGrid,
              gridTemplateColumns: `repeat(${outcomeCols}, minmax(0, 1fr))`,
            }}>
            {OUTCOMES.map((outcome, index) => (
              <div key={outcome.id} style={styles.outcomeCard}>
                <div style={styles.checkDisc}>
                  <DrawnCheck
                    isOn={outcomesSeen}
                    isStatic={isStatic}
                    delayMs={index * 140}
                  />
                </div>
                <Text size="sm" weight="semibold">
                  {outcome.title}
                </Text>
                <Text type="supporting" color="secondary">
                  {outcome.copy}
                </Text>
              </div>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= CURRICULUM =============

  const curriculum = (
    <section
      ref={registerSection('curriculum')}
      aria-label="Curriculum"
      style={{...styles.bandMuted, ...bandPad}}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              eyebrow="Six weeks, twelve sessions"
              title="Curriculum, week by week"
              description="Two live sessions a week plus one deliverable that builds on your own systems. Week 1 is open below."
            />
          </Reveal>
          <Reveal isStatic={isStatic} delayMs={80}>
            <VStack gap={2}>
              {CURRICULUM.map(week => (
                <Card key={week.week} padding={3}>
                  <Collapsible
                    isOpen={openWeeks.has(week.week)}
                    onOpenChange={isOpen => toggleWeek(week.week, isOpen)}
                    trigger={
                      <HStack gap={3} vAlign="center">
                        <span style={styles.weekToken}>Week {week.week}</span>
                        <VStack gap={0}>
                          <Text size="sm" weight="semibold">
                            {week.title}
                          </Text>
                          <Text type="supporting" color="secondary">
                            {week.sessions}
                          </Text>
                        </VStack>
                      </HStack>
                    }>
                    <div style={{padding: 'var(--spacing-2) 0 var(--spacing-1)'}}>
                      <VStack gap={2}>
                        <VStack gap={1}>
                          {week.topics.map(topic => (
                            <HStack key={topic} gap={2} vAlign="start">
                              <span style={styles.compareGlyphAccent}>
                                <Icon icon={CheckIcon} size="xsm" color="inherit" />
                              </span>
                              <StackItem size="fill">
                                <Text type="body" color="secondary">
                                  {topic}
                                </Text>
                              </StackItem>
                            </HStack>
                          ))}
                        </VStack>
                        <div style={styles.deliverableRow}>
                          <Icon icon={HammerIcon} size="sm" color="secondary" />
                          <StackItem size="fill">
                            <Text size="sm">
                              <strong>Ship:</strong> {week.deliverable}
                            </Text>
                          </StackItem>
                        </div>
                      </VStack>
                    </div>
                  </Collapsible>
                </Card>
              ))}
            </VStack>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= INSTRUCTOR =============

  const instructor = (
    <section
      ref={registerSection('instructor')}
      aria-label="Instructor"
      style={bandPad}>
      <div style={columnStyle}>
        <Reveal isStatic={isStatic}>
          <div
            style={{
              ...styles.splitRow,
              ...(isStacked ? styles.splitRowStacked : null),
            }}>
            <VStack gap={3}>
              <div style={styles.instructorDisc} aria-hidden="true">
                {INSTRUCTOR.initials}
              </div>
              <VStack gap={0}>
                <Heading level={3}>{INSTRUCTOR.name}</Heading>
                <Text type="supporting" color="secondary">
                  {INSTRUCTOR.role}
                </Text>
              </VStack>
              <HStack gap={2} wrap="wrap">
                {INSTRUCTOR.stats.map(stat => (
                  <span key={stat.id} style={styles.credChip}>
                    <CountUpNumber
                      target={stat.target}
                      suffix={stat.suffix}
                      isStatic={isStatic}
                    />
                  </span>
                ))}
                {INSTRUCTOR.chips.map(chip => (
                  <span key={chip} style={styles.credChip}>
                    {chip}
                  </span>
                ))}
              </HStack>
            </VStack>
            <StackItem size="fill">
              <VStack gap={3}>
                <SectionIntro
                  eyebrow="Your instructor"
                  title="Taught by someone who carried the pager"
                />
                <Text type="body" color="secondary">
                  {INSTRUCTOR.bio1}
                </Text>
                <Text type="body" color="secondary">
                  {INSTRUCTOR.bio2}
                </Text>
              </VStack>
            </StackItem>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= PROJECT GALLERY =============

  const projects = (
    <section
      aria-label="Student projects"
      style={{...styles.bandMuted, ...bandPad}}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              eyebrow="From recent cohorts"
              title="What students actually built"
              description="Capstones are real systems from students’ day jobs — names shortened, numbers kept."
            />
          </Reveal>
          <div
            style={{
              ...styles.galleryGrid,
              gridTemplateColumns: `repeat(${galleryCols}, minmax(0, 1fr))`,
            }}>
            {PROJECTS.map((project, index) => (
              <Reveal key={project.id} isStatic={isStatic} delayMs={index * 90}>
                <div
                  style={{
                    ...styles.projectCard,
                    ...(liftedProject === project.id
                      ? styles.projectCardLifted
                      : null),
                  }}
                  onMouseEnter={() => setLiftedProject(project.id)}
                  onMouseLeave={() =>
                    setLiftedProject(previous =>
                      previous === project.id ? null : previous,
                    )
                  }>
                  {/* Scheme-locked gradient art tile (art, not UI color). */}
                  <div
                    style={{...styles.projectArt, background: project.art}}
                    aria-hidden="true">
                    <span style={styles.projectArtGlyph}>{project.tag}</span>
                  </div>
                  <div style={styles.projectBody}>
                    <Text size="sm" weight="semibold">
                      {project.title}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {project.student}
                    </Text>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= TESTIMONIALS =============

  const testimonials = (
    <section aria-label="Testimonials" style={bandPad}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              eyebrow="Alumni, in their words"
              title="Why engineers keep recommending it"
            />
          </Reveal>
          <div
            style={{
              ...styles.testimonialGrid,
              gridTemplateColumns: `repeat(${testimonialCols}, minmax(0, 1fr))`,
            }}>
            {TESTIMONIALS.map((entry, index) => (
              <Reveal key={entry.id} isStatic={isStatic} delayMs={index * 90}>
                <Card>
                  <VStack gap={2}>
                    <span style={styles.quoteMark} aria-hidden="true">
                      {'“'}
                    </span>
                    <Text type="body">{entry.quote}</Text>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Text size="sm" weight="semibold">
                        {entry.name}
                      </Text>
                      <Token label={entry.roleChip} size="sm" color="orange" />
                    </HStack>
                  </VStack>
                </Card>
              </Reveal>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= COMPARISON =============

  const comparison = (
    <section
      aria-label="Self-paced versus cohort"
      style={{...styles.bandMuted, ...bandPad}}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              eyebrow="Honest comparison"
              title="Self-paced vs. this cohort"
              description="Self-paced courses are cheaper and flexible — if those are your constraints, buy one. This is for when finishing is the point."
            />
          </Reveal>
          <Reveal isStatic={isStatic} delayMs={80}>
            <div
              style={{
                ...styles.compareGrid,
                gridTemplateColumns: `repeat(${compareCols}, minmax(0, 1fr))`,
              }}>
              <div style={styles.compareCard}>
                <Text type="label">Typical self-paced course</Text>
                <VStack gap={2}>
                  {COMPARISON.map(row => (
                    <div key={row.id} style={styles.compareRow}>
                      <span
                        style={
                          row.selfPacedHasCheck
                            ? styles.compareGlyphAccent
                            : styles.compareGlyphMuted
                        }>
                        <Icon
                          icon={row.selfPacedHasCheck ? CheckIcon : XIcon}
                          size="xsm"
                          color="inherit"
                        />
                      </span>
                      <StackItem size="fill">
                        <Text size="sm" color="secondary">
                          {row.selfPaced}
                        </Text>
                      </StackItem>
                    </div>
                  ))}
                </VStack>
              </div>
              <div style={{...styles.compareCard, ...styles.compareCardAccent}}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="label">Load-Bearing cohort</Text>
                  </StackItem>
                  <Badge variant="success" label="87% finish" />
                </HStack>
                <VStack gap={2}>
                  {COMPARISON.map(row => (
                    <div key={row.id} style={styles.compareRow}>
                      <span style={styles.compareGlyphAccent}>
                        <Icon icon={CheckIcon} size="xsm" color="inherit" />
                      </span>
                      <StackItem size="fill">
                        <Text size="sm">{row.cohort}</Text>
                      </StackItem>
                    </div>
                  ))}
                </VStack>
              </div>
            </div>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= PRICING =============

  const pricing = (
    <section
      ref={registerSection('pricing')}
      aria-label="Pricing"
      style={bandPad}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              eyebrow="One tier, two ways to pay"
              title="Pricing"
              description="Everyone gets the same cohort. Pick the payment shape that suits you."
            />
          </Reveal>
          <Reveal isStatic={isStatic} delayMs={80}>
            <div style={styles.pricingCard}>
              <Card>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <Token
                        label={`${COHORT.label} · Sep 14 – Oct 23`}
                        size="sm"
                        color="orange"
                      />
                    </StackItem>
                    <SegmentedControl
                      label="Payment plan"
                      value={payPlan}
                      onChange={value => setPayPlan(value as PayPlan)}
                      size="sm">
                      <SegmentedControlItem
                        label={PAYMENT.fullLabel}
                        value="full"
                      />
                      <SegmentedControlItem
                        label={PAYMENT.splitLabel}
                        value="split"
                      />
                    </SegmentedControl>
                  </HStack>
                  {payPlan === 'full' ? (
                    <VStack gap={1}>
                      <div style={styles.totalRow}>
                        <span style={styles.priceNow}>
                          {formatUSD(COHORT.earlyPrice)}
                        </span>
                        <span
                          style={styles.priceWas}
                          aria-label="Regular price $1,400">
                          {formatUSD(COHORT.listPrice)}
                        </span>
                        <span style={styles.saveChip}>
                          {COHORT.earlyDeadline}
                        </span>
                      </div>
                      <Text type="supporting" color="secondary">
                        One payment · {formatUSD(COHORT.earlyPrice)} total
                      </Text>
                    </VStack>
                  ) : (
                    <VStack gap={1}>
                      <div style={styles.totalRow}>
                        <span style={styles.priceNow}>
                          {PAYMENT.splitCount} ×{' '}
                          {formatUSD(PAYMENT.splitInstallment)}
                        </span>
                      </div>
                      <Text type="supporting" color="secondary">
                        Billed monthly · {formatUSD(splitTotal)} total (+
                        {formatUSD(splitPremium)} vs. pay in full). The $200
                        early-bird discount applies to pay-in-full only.
                      </Text>
                    </VStack>
                  )}
                  <Divider />
                  <VStack gap={1}>
                    {PAYMENT.included.map(item => (
                      <HStack key={item} gap={2} vAlign="start">
                        <span style={styles.compareGlyphAccent}>
                          <Icon icon={CheckIcon} size="xsm" color="inherit" />
                        </span>
                        <StackItem size="fill">
                          <Text size="sm">{item}</Text>
                        </StackItem>
                      </HStack>
                    ))}
                  </VStack>
                  <div style={styles.guaranteeRow}>
                    <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
                    <StackItem size="fill">
                      <Text type="supporting" color="secondary">
                        {PAYMENT.guarantee}
                      </Text>
                    </StackItem>
                  </div>
                  <Button
                    label="Apply for Cohort 9"
                    variant="primary"
                    icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                    onClick={() => jumpToSection(APPLY_ID)}
                  />
                </VStack>
              </Card>
            </div>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= FAQ =============

  const faq = (
    <section
      ref={registerSection('faq')}
      aria-label="Frequently asked questions"
      style={{...styles.bandMuted, ...bandPad}}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro eyebrow="Before you ask" title="Questions, answered" />
          </Reveal>
          <Reveal isStatic={isStatic} delayMs={80}>
            <Card padding={3}>
              {FAQ.map((entry, index) => (
                <div key={entry.id}>
                  {index > 0 ? <Divider /> : null}
                  <div style={{padding: 'var(--spacing-2) 0'}}>
                    <Collapsible
                      isOpen={openFaqs.has(entry.id)}
                      onOpenChange={isOpen => toggleFaq(entry.id, isOpen)}
                      trigger={entry.question}>
                      <div
                        style={{padding: 'var(--spacing-2) 0 var(--spacing-1)'}}>
                        <Text type="body" color="secondary">
                          {entry.answer}
                        </Text>
                      </div>
                    </Collapsible>
                  </div>
                </div>
              ))}
            </Card>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= APPLY BAND =============

  const apply = (
    <section
      ref={registerSection(APPLY_ID)}
      aria-label="Apply"
      style={{...styles.bandApply, ...bandPad}}>
      <div style={columnStyle}>
        <VStack gap={3}>
          <SectionIntro
            eyebrow="Cohort 9 · starts Sep 14"
            title="Apply in about ten minutes"
            description="Enter your email and we’ll send the Cohort 9 application. Seats are confirmed in order received — 18 of 40 remain."
          />
          {confirmedEmail === null ? (
            <VStack gap={1}>
              <div
                style={{
                  ...styles.applyForm,
                  ...(isPhone ? styles.applyFormStacked : null),
                }}>
                <div style={styles.applyInput}>
                  <TextInput
                    label="Email for your application"
                    isLabelHidden
                    placeholder="you@example.com"
                    value={applyEmail}
                    onChange={value => {
                      setApplyEmail(value);
                      setApplyError(null);
                    }}
                  />
                </div>
                <Button
                  label="Request the application"
                  variant="primary"
                  onClick={submitApply}
                />
              </div>
              {applyError !== null && (
                <p style={styles.formError} role="alert">
                  {applyError}
                </p>
              )}
              <Text type="supporting" color="secondary">
                No mailing list — one application email, nothing else.
              </Text>
            </VStack>
          ) : (
            <Card>
              <HStack gap={3} vAlign="center">
                <div style={styles.successDisc}>
                  <Icon icon={MailCheckIcon} size="sm" color="inherit" />
                </div>
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      Application sent to {confirmedEmail}
                    </Text>
                    <Text type="supporting" color="secondary">
                      It takes about 10 minutes. Your seat is held for 72 hours
                      once submitted.
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
            </Card>
          )}
        </VStack>
      </div>
    </section>
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
            ...styles.footerColumns,
            gridTemplateColumns: `repeat(${footerCols}, minmax(0, 1fr))`,
          }}>
          <VStack gap={2}>
            {brandMark}
            <Text type="supporting" color="secondary">
              {BRAND.tagline}.
            </Text>
            <HStack gap={2} vAlign="center">
              <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                Cohort 10 opens for applications in November 2026.
              </Text>
            </HStack>
          </VStack>
          <VStack gap={1}>
            <Text type="label">Course</Text>
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
            <Text type="label">Resources</Text>
            {FOOTER_RESOURCES.map(label => (
              // Would leave the page; sanctioned no-op.
              <button
                key={label}
                type="button"
                style={styles.footerLink}
                onClick={() => {}}>
                {label}
              </button>
            ))}
            <span style={styles.monoRow}>hello@loadbearing.dev</span>
          </VStack>
        </div>
        <Divider />
        <Text type="supporting" color="secondary">
          © 2026 Load-Bearing Systems Ltd. · Prices in USD · Refunds through
          the end of week 2 · Company names in student stories are used with
          permission and lightly anonymized.
        </Text>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0} role="main" label="Load-Bearing course landing page">
          <div ref={wrapRef} style={styles.wrap}>
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {hero}
              {outcomes}
              {curriculum}
              {instructor}
              {projects}
              {testimonials}
              {comparison}
              {pricing}
              {faq}
              {apply}
              {footer}
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
