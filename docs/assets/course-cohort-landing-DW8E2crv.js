var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file course-cohort-landing.tsx
 * @input Deterministic fixtures only (the fictional "Load-Bearing" 6-week
 *   systems-design cohort course: hero promise copy, a Cohort 9 card with
 *   fixed seat counts (18 of 40 left) and dates (Sep 14 – Oct 23, 2026),
 *   a $1,400 list / $1,200 early-bird price pair with an Aug 1 deadline,
 *   four "you will ship" outcomes, a six-week curriculum with topics,
 *   live-session times and per-week deliverables, a three-beat weekly-loop
 *   scroll story, an instructor bio with credibility chips and count-up
 *   stats, an eight-name alumni-employer marquee, four student capstone
 *   cards, three testimonials with role chips, a Self-paced vs Cohort
 *   comparison matrix, a 1×/3× payment-plan price table, five FAQ entries,
 *   and footer link columns)
 * @output Art-directed long-scroll landing page for a live cohort course.
 *   Layered atmosphere: aurora blobs drift behind the hero and the
 *   testimonial band, a grain texture sits over the hero and the dark
 *   band, and the curriculum band carries a dot-grid. The hero is staged
 *   product theater — 76px gradient-ink headline, and the next-cohort
 *   card (seats meter fills + seats-left counts up on load) sits in a
 *   perspective wrapper with three bobbing satellite mini-cards (finish
 *   metric, seat-reserved toast, alumni avatar cluster) that parallax
 *   toward the pointer at wide widths. A count-up stats strip crosses the
 *   hero/marquee band boundary, above a pausable alumni-employer marquee.
 *   Signature scroll story: "A week inside the cohort" is a scheme-locked
 *   dark band (gradient glows, glass mock, pointer-tracked spotlight)
 *   whose sticky stage advances a cohort-workspace mock through three
 *   states — live session, ship the deliverable, defend it in review —
 *   driven by scroll progress with a filling, clickable step rail.
 *   Everything else keeps its working interactions: scroll-spy navbar
 *   that condenses and tints after 24px of scroll (hamburger dropdown at
 *   compact widths), outcome cards with oversized numerals and staggered
 *   check draw-ons, a 5/7 curriculum split with a sticky intro rail and
 *   the controlled week accordion (week 1 open), instructor split with
 *   count-up alumni stats, an offset hover-lift project gallery,
 *   testimonial trio, honest Self-paced vs Cohort comparison, a pricing
 *   card whose payment toggle recomputes totals honestly (3 × $420 =
 *   $1,260, +$60 vs pay-in-full), a FAQ accordion, a validating apply
 *   email capture with a confirmation state, and a sitemap footer.
 *   Reveals stagger 80ms (rise 16px + scale .985, decelerate bezier) and
 *   fire once; ALL motion — auroras, bobbing, parallax, marquee, sticky
 *   story, sheen sweeps, count-ups — collapses to final frames under
 *   prefers-reduced-motion (the story renders as a static stacked
 *   sequence).
 * @position Page template; emitted by \`astryx template course-cohort-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * measured wrapper (useElementWidth + useElementHeight drive every
 * breakpoint and the sticky-story math, because the inline demo stage
 * never fires viewport media queries) around a single scroll container;
 * inside it the navbar is position:sticky top:0 and the page is a stack
 * of full-bleed bands, each carrying its own centered 1120px column.
 *
 * Interaction contract:
 * - Nav anchors and every CTA smooth-scroll the container to real section
 *   ids with a sticky-nav allowance; onScroll spies the last anchor above
 *   the fold (aria-current), tracks nav condensation past 24px, and feeds
 *   the scroll-story progress.
 * - At compact widths the anchors collapse behind a 40px hamburger whose
 *   dropdown closes on Escape (refocusing the trigger), outside
 *   pointerdown, or any selection.
 * - The curriculum and FAQ accordions are controlled via Sets so several
 *   items can be open at once; week 1 and FAQ 1 ship open.
 * - The scroll story's three steps are also buttons: clicking scrolls the
 *   container to that step's progress window (aria-current on the active
 *   step). Under reduced motion the story renders as three static rows.
 * - The payment-plan SegmentedControl swaps $1,200 one payment for
 *   3 × $420 and recomputes the total honestly (+$60 vs pay-in-full);
 *   the early-bird strikethrough applies to pay-in-full only.
 * - The apply form validates on submit (empty and format errors inline)
 *   and success swaps the form for a confirmation echoing the address,
 *   with a "Use a different email" reset. Only footer resource links
 *   (which would leave the page) are no-ops.
 * - Motion discipline: transform/opacity only (plus stroke-dashoffset on
 *   the outcome checks and the story rail's scaleY fill). Parallax is off
 *   under reduced motion and at stacked (touch) widths.
 *
 * Color policy: token-pure chrome with ONE quarantined accent literal —
 * Load-Bearing's signal orange, declared once as light-dark() with
 * contrast math. Every aurora, glow, gradient ink, and glass surface is
 * derived from that accent or from tokens via color-mix; the scheme-locked
 * gradient art tiles (brand mark, project gallery, instructor monogram)
 * and the dark story band reuse the already-sanctioned art hues. No
 * network images, no real logos.
 *
 * Responsive contract (useElementWidth on the page wrapper):
 * - Columns: max-width 1120px, centered; bands paint edge to edge.
 * - Hero display type tiers: 76px (>1000) / 64px (>820) / 50px (>560) /
 *   40px at phone width; section headings 38px → 30px.
 * - >820px: navbar shows five inline anchors + Apply CTA.
 * - <=820px: anchors collapse behind the hamburger dropdown.
 * - >960px: outcomes sit 4-up with an offset stagger; <=960px 2-up flat;
 *   <=560px 1-up. Curriculum is a 5/7 split with a sticky rail >960px.
 * - >760px: hero and instructor are split rows, the comparison and
 *   project gallery sit 2-up (gallery offset), testimonials 3-up.
 * - <=760px: hero/instructor stack, satellites tuck inside the card
 *   bounds, comparison and testimonials stack, gallery drops to 1-up at
 *   <=560px, the story stage stacks its rail above the mock, and the
 *   apply form stacks its button. Holds at 390px with no overflow-x.
 * - Tap targets: hamburger, nav links, story steps and CTAs are >=40px;
 *   accordion triggers carry generous padding; nothing requires hover
 *   (lifts, sheens and the spotlight are decorative only).
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
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
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  HammerIcon,
  LandmarkIcon,
  MailCheckIcon,
  MenuIcon,
  MessageCircleIcon,
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
// Every other UI color on the page is a design token or a color-mix of
// this accent with tokens.
const ACCENT = 'light-dark(#C2410C, #FDBA74)';
// Derived tints of the same quarantined hue (backgrounds only; text on
// top of these always uses tokens or ACCENT itself).
const ACCENT_SOFT = 'light-dark(rgba(194, 65, 12, 0.10), rgba(253, 186, 116, 0.14))';
const ACCENT_BORDER = 'light-dark(rgba(194, 65, 12, 0.35), rgba(253, 186, 116, 0.40))';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 76;
const SPY_OFFSET = 150;

// ---- depth tiers (used consistently; see Polish contract §3) ----
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';
const HAIRLINE_INSET =
  'inset 0 0 0 1px color-mix(in srgb, var(--color-border) 85%, transparent)';
const GLOW_HOVER =
  \`0 0 0 1px \${ACCENT_BORDER}, \` +
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';

// Grain texture: inline SVG feTurbulence data-URI (no network assets).
const GRAIN = \`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='140' height='140' filter='url(%23g)'/></svg>")\`;

// Transform/opacity-only keyframes; every animation using these is
// suppressed under prefers-reduced-motion.
const KEYFRAMES = \`
@keyframes ccl-drift-a {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(-56px, 38px, 0) scale(1.16); }
}
@keyframes ccl-drift-b {
  from { transform: translate3d(0, 0, 0) scale(1.06); }
  to { transform: translate3d(48px, -30px, 0) scale(0.92); }
}
@keyframes ccl-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}
@keyframes ccl-marquee {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
\`;

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
    paddingBlock: 112,
  },
  bandCompact: {
    paddingBlock: 64,
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // Dot-grid texture band (curriculum): hairline dots from the border
  // token over the muted band color.
  bandDotGrid: {
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-border) 70%, transparent) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  },
  bandHero: {
    position: 'relative',
    paddingTop: 96,
    paddingBottom: 0,
  },
  bandApply: {
    position: 'relative',
    backgroundColor: ACCENT_SOFT,
    borderTop: \`1px solid \${ACCENT_BORDER}\`,
  },
  // ---- atmosphere ----
  auroraLayer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN,
    backgroundSize: '140px 140px',
    opacity: 0.04,
    pointerEvents: 'none',
  },
  // ---- sticky navbar (transparent → tinted surface after 24px) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition:
      'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 88%, transparent)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
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
    minHeight: 64,
  },
  navInnerScrolled: {
    minHeight: 52,
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
    boxShadow: SHADOW_FLOATING,
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
  // ---- primary CTA (sheen sweep + lift + pressed scale) ----
  cta: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingInline: 20,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 650,
    backgroundColor: ACCENT,
    // Token trick: body background is white in light / near-black in
    // dark — exactly the right ink on the accent in each scheme.
    color: 'var(--color-background-body)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxShadow: SHADOW_RAISED,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  ctaSm: {
    minHeight: 40,
    paddingInline: 14,
    fontSize: 14,
    borderRadius: 10,
  },
  ctaSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '60%',
    left: 0,
    background:
      'linear-gradient(105deg, transparent 20%, color-mix(in srgb, var(--color-background-body) 35%, transparent) 50%, transparent 80%)',
    pointerEvents: 'none',
  },
  // ---- hero ----
  heroRow: {
    position: 'relative',
    zIndex: 1,
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
  heroCardSlot: {
    flex: '0 1 430px',
    minWidth: 0,
    position: 'relative',
    perspective: 1100,
  },
  heroCardSlotStacked: {
    flex: '1 1 auto',
  },
  heroHeadline: {
    fontWeight: 700,
    lineHeight: 1.03,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  gradientInk: {
    backgroundImage: \`linear-gradient(94deg, \${ACCENT} 0%, color-mix(in srgb, \${ACCENT} 55%, var(--color-warning)) 55%, color-mix(in srgb, \${ACCENT} 45%, var(--color-data-categorical-purple)) 100%)\`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
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
  eyebrowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_BORDER}\`,
  },
  // ---- hero theater: staged cohort card + satellites ----
  cohortPanel: {
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    boxSizing: 'border-box',
    boxShadow: \`\${HAIRLINE_INSET}, \${SHADOW_FLOATING}, 0 0 48px -18px \${ACCENT_BORDER}\`,
  },
  tiltWrap: {
    willChange: 'transform',
    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  satWrap: {
    position: 'absolute',
    zIndex: 2,
    willChange: 'transform',
    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  satCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_RAISED,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    whiteSpace: 'nowrap',
  },
  satMiniTrack: {
    width: 64,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  satMiniFill: {
    width: '87%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  satDisc: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  avatarDisc: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 700,
    border: '2px solid var(--color-background-card)',
    boxSizing: 'border-box',
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
    transformOrigin: 'left center',
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
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  // ---- stats strip (crosses the hero → marquee band boundary) ----
  statStrip: {
    position: 'relative',
    zIndex: 2,
    marginTop: 72,
    marginBottom: -56,
    borderRadius: 18,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: \`\${HAIRLINE_INSET}, \${SHADOW_FLOATING}\`,
    padding: 'var(--spacing-5) var(--spacing-6)',
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  statNum: {
    fontSize: 34,
    fontWeight: 750,
    letterSpacing: '-0.02em',
    lineHeight: 1.05,
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- alumni-employer marquee ----
  marqueeBand: {
    paddingTop: 112,
    paddingBottom: 48,
  },
  marqueeViewport: {
    overflow: 'hidden',
    maskImage:
      'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
  },
  marqueeTrack: {
    display: 'flex',
    gap: 'var(--spacing-7)',
    width: 'max-content',
    alignItems: 'center',
  },
  marqueeStatic: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marqueeItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    opacity: 0.75,
  },
  monogramTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.02em',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // ---- section headings ----
  sectionTitle: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.08,
    margin: 0,
  },
  sectionTitleCompact: {
    fontSize: 30,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  // ---- outcomes ----
  outcomesGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
    alignItems: 'start',
  },
  outcomeCard: {
    position: 'relative',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
    boxShadow: SHADOW_RAISED,
  },
  outcomeNumeral: {
    position: 'absolute',
    top: 8,
    right: 14,
    fontSize: 52,
    fontWeight: 750,
    letterSpacing: '-0.04em',
    lineHeight: 1,
    color: \`color-mix(in srgb, \${ACCENT} 16%, transparent)\`,
    pointerEvents: 'none',
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
  // ---- curriculum (5/7 split, sticky rail) ----
  currGrid: {
    display: 'grid',
    gap: 'var(--spacing-7)',
    alignItems: 'start',
  },
  currRail: {
    position: 'sticky',
    top: 96,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
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
  // ---- scroll story (scheme-locked dark band) ----
  storyBand: {
    position: 'relative',
    colorScheme: 'dark',
    color: 'var(--color-text-primary)',
    backgroundColor: 'color-mix(in srgb, #7C2D12 12%, black)',
    backgroundImage: [
      \`radial-gradient(56% 46% at 16% 6%, color-mix(in srgb, \${ACCENT} 22%, transparent), transparent 62%)\`,
      'radial-gradient(48% 40% at 88% 94%, color-mix(in srgb, var(--color-data-categorical-purple) 28%, transparent), transparent 60%)',
    ].join(', '),
  },
  storyStage: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storySpot: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: \`radial-gradient(420px circle at var(--mx, 60%) var(--my, 30%), color-mix(in srgb, \${ACCENT} 10%, transparent), transparent 70%)\`,
  },
  storyInner: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: 'var(--spacing-7)',
    alignItems: 'center',
    width: '100%',
  },
  storyStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    width: '100%',
    minHeight: 44,
    padding: 'var(--spacing-2)',
    borderRadius: 12,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--color-text-secondary)',
    transition: 'opacity 0.3s ease',
    opacity: 0.55,
  },
  storyStepActive: {
    opacity: 1,
    color: 'var(--color-text-primary)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 45%, transparent)',
    boxShadow: HAIRLINE_INSET,
  },
  storyStepNum: {
    fontSize: 26,
    fontWeight: 750,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
    color: ACCENT,
    flexShrink: 0,
    width: 40,
  },
  railTrack: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: 'color-mix(in srgb, var(--color-border) 60%, transparent)',
    overflow: 'hidden',
  },
  railFill: {
    position: 'absolute',
    inset: 0,
    backgroundColor: ACCENT,
    transformOrigin: 'top center',
  },
  storyMockStage: {
    position: 'relative',
  },
  storyPane: {
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.45s ease, transform 0.45s ease',
  },
  glassPanel: {
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 18,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 72%, transparent)',
    boxShadow: \`\${HAIRLINE_INSET}, \${SHADOW_FLOATING}, 0 0 64px -20px \${ACCENT_BORDER}\`,
    overflow: 'hidden',
  },
  mockToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderBottom:
      '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
    flexShrink: 0,
  },
  mockDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    backgroundColor: 'color-mix(in srgb, var(--color-border) 90%, transparent)',
    flexShrink: 0,
  },
  mockAddress: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mockBody: {
    flex: '1 1 0',
    minHeight: 0,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  mockTile: {
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 700,
  },
  mockLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'color-mix(in srgb, var(--color-border) 80%, transparent)',
  },
  mockChipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  mockCommentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor:
      'color-mix(in srgb, var(--color-background-muted) 70%, transparent)',
    boxShadow: HAIRLINE_INSET,
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
    boxShadow: SHADOW_RAISED,
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
  // ---- project gallery (offset 2-up, hover raise + accent glow) ----
  galleryGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  projectCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: SHADOW_RAISED,
    transition:
      'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
  },
  projectCardLifted: {
    transform: 'translateY(-5px)',
    boxShadow: GLOW_HOVER,
  },
  // Scheme-locked art: per-card gradient composition tiles.
  projectArt: {
    height: 130,
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
  testimonialBand: {
    position: 'relative',
  },
  testimonialGrid: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
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
    gap: 'var(--spacing-4)',
  },
  compareCard: {
    borderRadius: 16,
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
    boxShadow: \`0 0 0 1px \${ACCENT_BORDER}, \${SHADOW_FLOATING}\`,
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
    borderRadius: 18,
    boxShadow: SHADOW_FLOATING,
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
    maxWidth: 480,
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
  headlinePlain: 'Design systems that',
  headlineInk: 'survive their own success',
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

/** Count-up stats strip crossing the hero → marquee band boundary. */
const HERO_STATS: readonly {
  id: string;
  value: number | null;
  suffix?: string;
  text?: string;
  label: string;
}[] = [
  {id: 'alumni', value: 1214, label: 'alumni shipped real artifacts'},
  {id: 'cohorts', value: 8, label: 'cohorts taught since 2023'},
  {id: 'finish', value: 87, suffix: '%', label: 'of Cohort 8 finished all six weeks'},
  {id: 'rating', value: null, text: '4.9/5', label: 'average alumni rating'},
];

/** Invented alumni-employer names for the marquee (monograms, no logos). */
const EMPLOYERS: readonly string[] = [
  'Ferrous',
  'Cobalt Grid',
  'Braid Systems',
  'Northspan',
  'Quillwork',
  'Halide Labs',
  'Tandem Rail',
  'Ossify Cloud',
];

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

/** The weekly loop, staged as the pinned scroll story's three states. */
const STORY_STEPS: readonly {
  id: string;
  num: string;
  title: string;
  copy: string;
  icon: Glyph;
}[] = [
  {
    id: 'live',
    num: '01',
    title: 'Show up Tuesday and Thursday',
    copy: '90 minutes of live design review — your cohort, your docs, cameras on. Recordings land within 2 hours if life intervenes.',
    icon: VideoIcon,
  },
  {
    id: 'ship',
    num: '02',
    title: 'Ship the week’s deliverable',
    copy: 'One artifact per week, built on a system you actually run. Week 1 is a load model with the envelope math shown.',
    icon: FileTextIcon,
  },
  {
    id: 'defend',
    num: '03',
    title: 'Defend it in review',
    copy: 'Instructor critique on the doc itself, in front of the cohort — plus two private 1:1 critiques with Nadia across the six weeks.',
    icon: MessageCircleIcon,
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
  initials: string;
  art: string;
  tag: string;
}[] = [
  {
    id: 'rate-limiter',
    title: 'Hot-key shedding for a rate limiter that survived a 40× spike',
    student: 'Priya M. · Cohort 7',
    initials: 'PM',
    art: 'linear-gradient(135deg, #7C2D12 0%, #DC2626 60%, #F59E0B 100%)',
    tag: 'p99 41ms',
  },
  {
    id: 'checkout-saga',
    title: 'Multi-region checkout saga with idempotent retries',
    student: 'Jonas K. · Cohort 6',
    initials: 'JK',
    art: 'linear-gradient(135deg, #1E3A5F 0%, #0E7490 60%, #34D399 100%)',
    tag: '3 regions',
  },
  {
    id: 'inventory-ledger',
    title: 'Event-sourced inventory ledger with replayable audits',
    student: 'Amara D. · Cohort 8',
    initials: 'AD',
    art: 'linear-gradient(135deg, #3B0764 0%, #7C3AED 60%, #F472B6 100%)',
    tag: '12M events/day',
  },
  {
    id: 'shard-split',
    title: 'Zero-downtime shard split, rehearsed in week 4 and shipped in week 6',
    student: 'Tom R. · Cohort 7',
    initials: 'TR',
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
  return \`$\${amount.toLocaleString('en-US')}\`;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to start an application.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return 'That doesn’t look like an email address.';
  }
  return null;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
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

/** Measured height of the scroll stage; drives the sticky-story math. */
function useElementHeight(ref: RefObject<HTMLDivElement | null>): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setHeight(rect.height);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return height;
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

/** ~900ms decelerate count-up; renders the final value under reduced motion. */
function useCountUp(
  target: number,
  isActive: boolean,
  isStatic: boolean,
  durationMs = 900,
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

/**
 * Scroll reveal: rise 16px + scale .985 → identity over 560ms on a
 * decelerate bezier, fires once; visible immediately when reduced.
 */
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
        transform: isSeen ? 'none' : 'translateY(16px) scale(0.985)',
        transition: isStatic
          ? undefined
          : \`opacity 0.56s cubic-bezier(0.16, 1, 0.3, 1) \${delayMs}ms, transform 0.56s cubic-bezier(0.16, 1, 0.3, 1) \${delayMs}ms\`,
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
            : \`stroke-dashoffset 0.5s ease-out \${delayMs}ms\`,
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

/**
 * Primary CTA: accent surface, sheen sweep on hover, 1px lift, pressed
 * scale .98. Sheen and lift are decorative (hover-only); the button is a
 * plain 44px keyboard-reachable control.
 */
function CtaButton({
  label,
  onClick,
  size = 'md',
  hasArrow = false,
  isStatic,
}: {
  label: string;
  onClick: () => void;
  size?: 'md' | 'sm';
  hasArrow?: boolean;
  isStatic: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const transform = isPressed
    ? 'scale(0.98)'
    : isHovered && !isStatic
      ? 'translateY(-1px)'
      : 'none';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      style={{
        ...styles.cta,
        ...(size === 'sm' ? styles.ctaSm : null),
        transform,
        boxShadow: isHovered ? SHADOW_FLOATING : SHADOW_RAISED,
      }}>
      <span
        aria-hidden="true"
        style={{
          ...styles.ctaSheen,
          transform:
            isHovered && !isStatic ? 'translateX(240%)' : 'translateX(-120%)',
          transition:
            isHovered && !isStatic
              ? 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
        }}
      />
      {label}
      {hasArrow && <Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
    </button>
  );
}

/** Section intro: uppercase accent eyebrow + display title + copy. */
function SectionIntro({
  eyebrow,
  title,
  description,
  isCompact,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  isCompact: boolean;
}) {
  return (
    <VStack gap={2}>
      <span style={{...styles.eyebrow, ...styles.eyebrowAccent}}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isCompact ? styles.sectionTitleCompact : null),
        }}>
        {title}
      </h2>
      {description != null && (
        <p style={styles.sectionDescription}>{description}</p>
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
  const viewHeight = useElementHeight(wrapRef);
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 820;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;
  const isWide = wrapWidth > 960;
  const outcomeCols = isPhone ? 1 : isWide ? 4 : 2;
  const galleryCols = isPhone ? 1 : 2;
  const testimonialCols = isStacked ? 1 : 3;
  const compareCols = isStacked ? 1 : 2;
  const footerCols = isPhone ? 1 : isStacked ? 2 : 3;
  const statCols = isPhone ? 2 : 4;
  // Display-type tiers (Polish contract §1; nothing under 56px at wide).
  const heroFontSize =
    wrapWidth > 1000 ? 76 : wrapWidth > 820 ? 64 : wrapWidth > 560 ? 50 : 40;

  // ---- navbar (condenses + tints after 24px of scroll) ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
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

  // ---- hero theater: pointer parallax (off when reduced or stacked) ----
  const isParallaxOn = !isStatic && !isStacked;
  const [parallax, setParallax] = useState({x: 0, y: 0});
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isParallaxOn) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: clamp01((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: clamp01((event.clientY - rect.top) / rect.height) * 2 - 1,
    });
  };
  const resetParallax = () => setParallax({x: 0, y: 0});

  // ---- outcomes check draw-ons (group-triggered, staggered) ----
  const outcomesRef = useRef<HTMLDivElement | null>(null);
  const outcomesSeen = useInViewOnce(outcomesRef, isStatic);

  // ---- pinned scroll story ----
  const storyWrapRef = useRef<HTMLElement | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyStep =
    storyProgress < 1 / 3 ? 0 : storyProgress < 2 / 3 ? 1 : 2;
  const spotRef = useRef<HTMLDivElement | null>(null);
  const onStoryPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Transient value: written straight to CSS vars via a ref, no re-render.
    if (isStatic) {
      return;
    }
    const spot = spotRef.current;
    if (spot === null) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    spot.style.setProperty(
      '--mx',
      \`\${((event.clientX - rect.left) / rect.width) * 100}%\`,
    );
    spot.style.setProperty(
      '--my',
      \`\${((event.clientY - rect.top) / rect.height) * 100}%\`,
    );
  };

  // ---- marquee pause on hover ----
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

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

  /** Story steps are buttons too: scroll to that step's progress window. */
  const jumpToStoryStep = (step: number) => {
    const container = pageRef.current;
    const story = storyWrapRef.current;
    if (container === null || story === null) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();
    const travel = storyRect.height - containerRect.height;
    if (travel <= 0) {
      return;
    }
    container.scrollTo({
      top:
        container.scrollTop +
        (storyRect.top - containerRect.top) +
        travel * ((step + 0.5) / STORY_STEPS.length),
      behavior: isStatic ? 'auto' : 'smooth',
    });
  };

  /**
   * One scroll handler: nav condensation, scroll-spy (last anchor above
   * the fold wins), and scroll-story progress from the story container's
   * rect against the measured stage.
   */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setIsNavScrolled(container.scrollTop > 24);
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
    const story = storyWrapRef.current;
    if (story !== null && !isStatic) {
      const storyRect = story.getBoundingClientRect();
      const travel = storyRect.height - containerRect.height;
      if (travel > 0) {
        const passed = containerRect.top - storyRect.top;
        setStoryProgress(Math.round(clamp01(passed / travel) * 1000) / 1000);
      }
    }
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
    <header
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isNavScrolled || isMenuOpen ? styles.navBarScrolled : null),
      }}>
      <div
        style={{
          ...styles.navInner,
          ...(isNavScrolled ? styles.navInnerScrolled : null),
        }}>
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
        <CtaButton
          label={isPhone ? 'Apply' : 'Apply for Cohort 9'}
          size="sm"
          isStatic={isStatic}
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

  // ============= HERO (product theater) =============

  const cohortCard = (
    <div
      style={{
        ...styles.cohortPanel,
        ...styles.tiltWrap,
        transform: isParallaxOn
          ? \`rotateY(\${parallax.x * 4}deg) rotateX(\${parallax.y * -3}deg)\`
          : 'none',
      }}>
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
                width: \`\${seatsClaimedPct}%\`,
                transform: isMeterOn ? 'scaleX(1)' : 'scaleX(0)',
                transition: isStatic
                  ? undefined
                  : 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
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
        <CtaButton
          label="Reserve a seat"
          hasArrow
          isStatic={isStatic}
          onClick={() => jumpToSection(APPLY_ID)}
        />
      </VStack>
    </div>
  );

  /** Floating satellites: bob on independent keyframes, parallax with the pointer. */
  const satellite = (
    body: ReactNode,
    position: CSSProperties,
    bob: string,
    depth: number,
  ) => (
    <div
      aria-hidden="true"
      style={{
        ...styles.satWrap,
        ...position,
        transform: isParallaxOn
          ? \`translate3d(\${parallax.x * depth}px, \${parallax.y * depth}px, 0)\`
          : 'none',
      }}>
      <div style={{animation: isStatic ? undefined : bob}}>{body}</div>
    </div>
  );

  const heroSatellites = (
    <>
      {satellite(
        <div style={styles.satCard}>
          <span style={{...styles.statNum, fontSize: 22}}>87%</span>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              finished Cohort 8
            </Text>
            <div style={styles.satMiniTrack}>
              <div style={styles.satMiniFill} />
            </div>
          </VStack>
        </div>,
        isPhone ? {top: -18, left: 10} : {top: -24, left: -34},
        'ccl-bob 7s ease-in-out -2s infinite',
        8,
      )}
      {satellite(
        <div style={styles.satCard}>
          <div style={styles.satDisc}>
            <Icon icon={BellIcon} size="sm" color="inherit" />
          </div>
          <VStack gap={0}>
            <Text size="sm" weight="semibold">
              Seat reserved
            </Text>
            <Text type="supporting" color="secondary">
              Priya M. · 2 minutes ago
            </Text>
          </VStack>
        </div>,
        isPhone ? {bottom: 118, right: 10} : {top: 96, right: -30},
        'ccl-bob 8.5s ease-in-out -5s infinite',
        -10,
      )}
      {satellite(
        <div style={styles.satCard}>
          <HStack gap={0} vAlign="center">
            {PROJECTS.map((project, index) => (
              <div
                key={project.id}
                style={{
                  ...styles.avatarDisc,
                  background: project.art,
                  marginLeft: index === 0 ? 0 : -8,
                }}>
                {project.initials}
              </div>
            ))}
          </HStack>
          <Text type="supporting" color="secondary">
            1,214 alumni
          </Text>
        </div>,
        isPhone ? {bottom: -16, left: 10} : {bottom: -26, left: -18},
        'ccl-bob 6.5s ease-in-out -3.5s infinite',
        6,
      )}
    </>
  );

  const hero = (
    <div
      style={{...styles.bandHero, ...(isPhone ? {paddingTop: 56} : null)}}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={resetParallax}>
      {/* Aurora field + grain (art layer; static under reduced motion). */}
      <div style={styles.auroraLayer} aria-hidden="true">
        <div
          style={{
            ...styles.blob,
            width: 560,
            height: 560,
            top: -180,
            right: -60,
            opacity: 0.5,
            background: \`radial-gradient(circle, color-mix(in srgb, \${ACCENT} 55%, transparent), transparent 65%)\`,
            animation: isStatic
              ? undefined
              : 'ccl-drift-a 38s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            ...styles.blob,
            width: 420,
            height: 420,
            top: 140,
            left: -140,
            opacity: 0.4,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-warning) 45%, transparent), transparent 65%)',
            animation: isStatic
              ? undefined
              : 'ccl-drift-b 44s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            ...styles.blob,
            width: 360,
            height: 360,
            bottom: -80,
            left: '38%',
            opacity: 0.35,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-success) 40%, transparent), transparent 65%)',
            animation: isStatic
              ? undefined
              : 'ccl-drift-a 50s ease-in-out infinite alternate-reverse',
          }}
        />
        <div style={styles.grainOverlay} />
      </div>
      <div style={columnStyle}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <span style={styles.eyebrowChip}>
              <span style={{...styles.eyebrow, ...styles.eyebrowAccent}}>
                {HERO.kicker}
              </span>
            </span>
            <h1 style={{...styles.heroHeadline, fontSize: heroFontSize}}>
              {HERO.headlinePlain}{' '}
              <span style={styles.gradientInk}>{HERO.headlineInk}</span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            <HStack gap={2} wrap="wrap">
              <CtaButton
                label="Reserve a seat"
                hasArrow
                isStatic={isStatic}
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
            {heroSatellites}
          </div>
        </div>
        {/* Stats strip: deliberately crosses the hero → marquee boundary. */}
        <div
          style={{
            ...styles.statStrip,
            gridTemplateColumns: \`repeat(\${statCols}, minmax(0, 1fr))\`,
          }}>
          {HERO_STATS.map(stat => (
            <VStack key={stat.id} gap={0}>
              {stat.value !== null ? (
                <CountUpNumber
                  target={stat.value}
                  suffix={stat.suffix ?? ''}
                  isStatic={isStatic}
                  style={styles.statNum}
                />
              ) : (
                <span style={styles.statNum}>{stat.text}</span>
              )}
              <Text type="supporting" color="secondary">
                {stat.label}
              </Text>
            </VStack>
          ))}
        </div>
      </div>
    </div>
  );

  // ============= ALUMNI-EMPLOYER MARQUEE =============

  const marqueeItems = EMPLOYERS.map(name => (
    <span key={name} style={styles.marqueeItem}>
      <span style={styles.monogramTile} aria-hidden="true">
        {name
          .split(' ')
          .map(word => word[0])
          .join('')}
      </span>
      <Text size="sm" weight="semibold" color="secondary">
        {name}
      </Text>
    </span>
  ));

  const marquee = (
    <section aria-label="Where alumni work" style={styles.marqueeBand}>
      <div style={columnStyle}>
        <VStack gap={4}>
          <div style={{textAlign: 'center'}}>
            <span style={styles.eyebrow}>Alumni carry the pager at</span>
          </div>
          {isStatic ? (
            <div style={styles.marqueeStatic}>{marqueeItems}</div>
          ) : (
            <div
              style={styles.marqueeViewport}
              onMouseEnter={() => setIsMarqueePaused(true)}
              onMouseLeave={() => setIsMarqueePaused(false)}>
              <div
                style={{
                  ...styles.marqueeTrack,
                  animation: 'ccl-marquee 48s linear infinite',
                  animationPlayState: isMarqueePaused ? 'paused' : 'running',
                }}>
                <div style={styles.marqueeTrack}>{marqueeItems}</div>
                <div style={styles.marqueeTrack} aria-hidden="true">
                  {EMPLOYERS.map(name => (
                    <span key={\`dup-\${name}\`} style={styles.marqueeItem}>
                      <span style={styles.monogramTile}>
                        {name
                          .split(' ')
                          .map(word => word[0])
                          .join('')}
                      </span>
                      <Text size="sm" weight="semibold" color="secondary">
                        {name}
                      </Text>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </VStack>
      </div>
    </section>
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
              isCompact={isPhone}
              eyebrow="What you will ship"
              title="Artifacts, not certificates"
              description="Every week ends with something real. By Oct 23 you will have shipped:"
            />
          </Reveal>
          <div
            ref={outcomesRef}
            style={{
              ...styles.outcomesGrid,
              gridTemplateColumns: \`repeat(\${outcomeCols}, minmax(0, 1fr))\`,
            }}>
            {OUTCOMES.map((outcome, index) => (
              <Reveal key={outcome.id} isStatic={isStatic} delayMs={index * 80}>
                <div
                  style={{
                    ...styles.outcomeCard,
                    // Offset stagger at 4-up widths only (decorative).
                    transform:
                      outcomeCols === 4 && index % 2 === 1
                        ? 'translateY(24px)'
                        : undefined,
                  }}>
                  <span style={styles.outcomeNumeral} aria-hidden="true">
                    {\`0\${index + 1}\`}
                  </span>
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
              </Reveal>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= CURRICULUM (5/7 split, sticky rail) =============

  const curriculumAccordion = (
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
  );

  const curriculum = (
    <section
      ref={registerSection('curriculum')}
      aria-label="Curriculum"
      style={{...styles.bandMuted, ...styles.bandDotGrid, ...bandPad}}>
      <div style={columnStyle}>
        <div
          style={{
            ...styles.currGrid,
            gridTemplateColumns: isWide
              ? 'minmax(0, 5fr) minmax(0, 7fr)'
              : '1fr',
          }}>
          <div style={isWide ? styles.currRail : undefined}>
            <Reveal isStatic={isStatic}>
              <VStack gap={3}>
                <SectionIntro
                  isCompact={isPhone}
                  eyebrow="Six weeks, twelve sessions"
                  title="Curriculum, week by week"
                  description="Two live sessions a week plus one deliverable that builds on your own systems. Week 1 is open below."
                />
                <HStack gap={2} wrap="wrap">
                  <span style={styles.credChip}>
                    <Icon icon={VideoIcon} size="xsm" color="secondary" />
                    Tue & Thu · 6:00 PM ET
                  </span>
                  <span style={styles.credChip}>
                    <Icon icon={ClockIcon} size="xsm" color="secondary" />
                    5–7 hrs / week
                  </span>
                </HStack>
              </VStack>
            </Reveal>
          </div>
          <Reveal isStatic={isStatic} delayMs={80}>
            {curriculumAccordion}
          </Reveal>
        </div>
      </div>
    </section>
  );

  // ============= PINNED SCROLL STORY (scheme-locked dark) =============

  const mockPane = (step: number) => {
    const chipLabel =
      step === 0 ? 'Live session' : step === 1 ? 'Deliverable' : 'Design review';
    return (
      <div style={styles.glassPanel}>
        <div style={styles.mockToolbar}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <StackItem size="fill">
            <span style={styles.mockAddress}>loadbearing.dev/cohort-9</span>
          </StackItem>
          <span style={{...styles.saveChip, fontSize: 11}}>{chipLabel}</span>
        </div>
        <div style={styles.mockBody}>
          {step === 0 && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                  flex: '1 1 0',
                }}>
                <div
                  style={{
                    ...styles.mockTile,
                    background:
                      'linear-gradient(135deg, #7C2D12 0%, #EA580C 55%, #FBBF24 100%)',
                  }}>
                  NO
                </div>
                {PROJECTS.slice(0, 3).map(project => (
                  <div
                    key={project.id}
                    style={{...styles.mockTile, background: project.art}}>
                    {project.initials}
                  </div>
                ))}
              </div>
              <div style={styles.mockChipRow}>
                <span style={styles.weekToken}>Week 1</span>
                <Text size="sm" weight="semibold">
                  Load models & envelope math
                </Text>
                <StackItem size="fill">{null}</StackItem>
                <Text type="supporting" color="secondary">
                  6:00–7:30 PM ET
                </Text>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <HStack gap={2} vAlign="center">
                <Icon icon={FileTextIcon} size="sm" color="secondary" />
                <span style={styles.mockAddress}>load-model.md</span>
                <StackItem size="fill">{null}</StackItem>
                <Text type="supporting" color="secondary">
                  Due Fri
                </Text>
              </HStack>
              <VStack gap={2}>
                {[92, 76, 84, 58, 38].map((width, index) => (
                  <div
                    key={index}
                    style={{...styles.mockLine, width: \`\${width}%\`}}
                  />
                ))}
              </VStack>
              <StackItem size="fill">{null}</StackItem>
              <div style={styles.mockCommentRow}>
                <Icon icon={HammerIcon} size="sm" color="secondary" />
                <StackItem size="fill">
                  <Text size="sm">
                    <strong>Ship:</strong> a load model for one of your own
                    services, peak-hour math included
                  </Text>
                </StackItem>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div style={styles.mockCommentRow}>
                <div
                  style={{...styles.avatarDisc, background: PROJECTS[0].art}}>
                  PM
                </div>
                <VStack gap={1}>
                  <Text size="sm" weight="semibold">
                    Priya M.
                  </Text>
                  <div style={{...styles.mockLine, width: 180}} />
                  <div style={{...styles.mockLine, width: 130}} />
                </VStack>
              </div>
              <div style={styles.mockCommentRow}>
                <div
                  style={{
                    ...styles.avatarDisc,
                    background:
                      'linear-gradient(135deg, #7C2D12 0%, #EA580C 55%, #FBBF24 100%)',
                  }}>
                  NO
                </div>
                <VStack gap={1}>
                  <Text size="sm" weight="semibold">
                    Nadia (instructor)
                  </Text>
                  <div style={{...styles.mockLine, width: 210}} />
                  <div style={{...styles.mockLine, width: 96}} />
                </VStack>
              </div>
              <StackItem size="fill">{null}</StackItem>
              <HStack gap={2} vAlign="center">
                <div style={styles.satDisc}>
                  <Icon icon={CheckIcon} size="sm" color="inherit" />
                </div>
                <VStack gap={0}>
                  <Text size="sm" weight="semibold">
                    Approved with notes
                  </Text>
                  <Text type="supporting" color="secondary">
                    Defended live · capstone-ready
                  </Text>
                </VStack>
              </HStack>
            </>
          )}
        </div>
      </div>
    );
  };

  const storySteps = (activeStep: number, isInteractive: boolean) => (
    <div style={{position: 'relative', paddingLeft: isStacked ? 0 : 18}}>
      {!isStacked && (
        <div style={styles.railTrack} aria-hidden="true">
          <div
            style={{
              ...styles.railFill,
              transform: \`scaleY(\${isStatic ? 1 : storyProgress})\`,
              transition: 'transform 0.2s linear',
            }}
          />
        </div>
      )}
      <VStack gap={2}>
        {STORY_STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            aria-current={activeStep === index ? 'true' : undefined}
            onClick={isInteractive ? () => jumpToStoryStep(index) : undefined}
            style={{
              ...styles.storyStep,
              ...(activeStep === index ? styles.storyStepActive : null),
              cursor: isInteractive ? 'pointer' : 'default',
            }}>
            <span style={styles.storyStepNum}>{step.num}</span>
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <Icon icon={step.icon} size="sm" color="inherit" />
                <Text size="sm" weight="semibold">
                  {step.title}
                </Text>
              </HStack>
              {/* Compact stages drop the copy so the stage fits one view. */}
              {!isStacked && (
                <Text type="supporting" color="secondary">
                  {step.copy}
                </Text>
              )}
            </VStack>
          </button>
        ))}
      </VStack>
    </div>
  );

  const storyIntro = (
    <SectionIntro
      isCompact={isPhone}
      eyebrow="The weekly loop"
      title="A week inside the cohort"
      description="The same three-beat loop, six weeks in a row. It is repetitive on purpose — that is what makes the artifacts real."
    />
  );

  const mockHeight = isPhone ? 300 : isStacked ? 320 : 380;

  // Reduced motion: the story renders as a static stacked sequence.
  const storyStatic = (
    <section
      aria-label="A week inside the cohort"
      style={{...styles.storyBand, ...bandPad}}>
      <div style={{...columnStyle, position: 'relative', zIndex: 1}}>
        <VStack gap={5}>
          {storyIntro}
          {STORY_STEPS.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: 'grid',
                gridTemplateColumns: isStacked
                  ? '1fr'
                  : 'minmax(0, 5fr) minmax(0, 7fr)',
                gap: 'var(--spacing-5)',
                alignItems: 'center',
              }}>
              <div>
                <HStack gap={3} vAlign="start">
                  <span style={styles.storyStepNum}>{step.num}</span>
                  <VStack gap={1}>
                    <Text weight="semibold">{step.title}</Text>
                    <Text type="supporting" color="secondary">
                      {step.copy}
                    </Text>
                  </VStack>
                </HStack>
              </div>
              <div style={{height: mockHeight}}>{mockPane(index)}</div>
            </div>
          ))}
        </VStack>
      </div>
    </section>
  );

  const storyPinned = (
    <section
      ref={node => {
        storyWrapRef.current = node;
      }}
      aria-label="A week inside the cohort"
      style={{
        ...styles.storyBand,
        height: viewHeight > 0 ? viewHeight * 2.6 : '260vh',
      }}>
      <div
        style={{
          ...styles.storyStage,
          height: viewHeight > 0 ? viewHeight : '100vh',
        }}
        onPointerMove={onStoryPointerMove}>
        <div ref={spotRef} style={styles.storySpot} aria-hidden="true" />
        <div style={{...styles.grainOverlay, opacity: 0.05}} aria-hidden="true" />
        <div style={columnStyle}>
          <div
            style={{
              ...styles.storyInner,
              gridTemplateColumns: isStacked
                ? '1fr'
                : 'minmax(0, 5fr) minmax(0, 7fr)',
            }}>
            <VStack gap={4}>
              {storyIntro}
              {storySteps(storyStep, true)}
            </VStack>
            <div style={{...styles.storyMockStage, height: mockHeight}}>
              {STORY_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  aria-hidden={storyStep === index ? undefined : true}
                  style={{
                    ...styles.storyPane,
                    opacity: storyStep === index ? 1 : 0,
                    transform:
                      storyStep === index
                        ? 'none'
                        : storyStep > index
                          ? 'translateY(-14px) scale(0.98)'
                          : 'translateY(14px) scale(0.98)',
                    pointerEvents: storyStep === index ? 'auto' : 'none',
                  }}>
                  {mockPane(index)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const story = isStatic ? storyStatic : storyPinned;

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
                  isCompact={isPhone}
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

  // ============= PROJECT GALLERY (offset 2-up) =============

  const projects = (
    <section
      aria-label="Student projects"
      style={{...styles.bandMuted, ...bandPad}}>
      <div style={columnStyle}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              isCompact={isPhone}
              eyebrow="From recent cohorts"
              title="What students actually built"
              description="Capstones are real systems from students’ day jobs — names shortened, numbers kept."
            />
          </Reveal>
          <div
            style={{
              ...styles.galleryGrid,
              gridTemplateColumns: \`repeat(\${galleryCols}, minmax(0, 1fr))\`,
            }}>
            {PROJECTS.map((project, index) => (
              <Reveal key={project.id} isStatic={isStatic} delayMs={index * 80}>
                <div
                  style={{
                    // Offset the right column so no two adjacent sections
                    // share the same flat card-grid shape (decorative).
                    transform:
                      galleryCols === 2 && index % 2 === 1
                        ? 'translateY(28px)'
                        : undefined,
                  }}>
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
                </div>
              </Reveal>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ============= TESTIMONIALS (second aurora field) =============

  const testimonials = (
    <section
      aria-label="Testimonials"
      style={{...styles.testimonialBand, ...bandPad}}>
      <div style={styles.auroraLayer} aria-hidden="true">
        <div
          style={{
            ...styles.blob,
            width: 460,
            height: 460,
            top: -120,
            left: -100,
            opacity: 0.35,
            background: \`radial-gradient(circle, color-mix(in srgb, \${ACCENT} 45%, transparent), transparent 65%)\`,
            animation: isStatic
              ? undefined
              : 'ccl-drift-b 42s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            ...styles.blob,
            width: 380,
            height: 380,
            bottom: -140,
            right: -60,
            opacity: 0.35,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-data-categorical-purple) 40%, transparent), transparent 65%)',
            animation: isStatic
              ? undefined
              : 'ccl-drift-a 46s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>
      <div style={{...columnStyle, position: 'relative', zIndex: 1}}>
        <VStack gap={5}>
          <Reveal isStatic={isStatic}>
            <SectionIntro
              isCompact={isPhone}
              eyebrow="Alumni, in their words"
              title="Why engineers keep recommending it"
            />
          </Reveal>
          <div
            style={{
              ...styles.testimonialGrid,
              gridTemplateColumns: \`repeat(\${testimonialCols}, minmax(0, 1fr))\`,
            }}>
            {TESTIMONIALS.map((entry, index) => (
              <Reveal key={entry.id} isStatic={isStatic} delayMs={index * 80}>
                <div
                  style={{
                    // Center card rides lower at 3-up (varied rhythm).
                    transform:
                      testimonialCols === 3 && index === 1
                        ? 'translateY(24px)'
                        : undefined,
                  }}>
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
                </div>
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
              isCompact={isPhone}
              eyebrow="Honest comparison"
              title="Self-paced vs. this cohort"
              description="Self-paced courses are cheaper and flexible — if those are your constraints, buy one. This is for when finishing is the point."
            />
          </Reveal>
          <Reveal isStatic={isStatic} delayMs={80}>
            <div
              style={{
                ...styles.compareGrid,
                gridTemplateColumns: \`repeat(\${compareCols}, minmax(0, 1fr))\`,
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
              isCompact={isPhone}
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
                        label={\`\${COHORT.label} · Sep 14 – Oct 23\`}
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
                  <CtaButton
                    label="Apply for Cohort 9"
                    hasArrow
                    isStatic={isStatic}
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
            <SectionIntro
              isCompact={isPhone}
              eyebrow="Before you ask"
              title="Questions, answered"
            />
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
      <div style={styles.grainOverlay} aria-hidden="true" />
      <div style={{...columnStyle, position: 'relative', zIndex: 1}}>
        <VStack gap={3}>
          <SectionIntro
            isCompact={isPhone}
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
                <CtaButton
                  label="Request the application"
                  isStatic={isStatic}
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
            gridTemplateColumns: \`repeat(\${footerCols}, minmax(0, 1fr))\`,
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
        <LayoutContent
          padding={0}
          role="main"
          label="Load-Bearing course landing page">
          <div ref={wrapRef} style={styles.wrap}>
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              <style>{KEYFRAMES}</style>
              {navbar}
              {hero}
              {marquee}
              {outcomes}
              {curriculum}
              {story}
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
`;export{e as default};