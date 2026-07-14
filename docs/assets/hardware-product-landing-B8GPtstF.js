var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file hardware-product-landing.tsx
 * @input Deterministic fixtures only (the fictional "Perch" smart desk
 *   sensor: hero copy with a preorder price line, four exploded-view SVG
 *   layers with labels, six spec tiles with count-up values, four
 *   in-the-box items, three colorways and three pack sizes with fixed
 *   price math, a three-step dated shipping timeline, six invented
 *   ecosystem compatibility tiles, three review quotes with star rows,
 *   four FAQ entries including an honest battery footnote, and a footer
 *   warranty note)
 * @output Full hardware-product marketing landing page: a sticky navbar
 *   (brand mark + four smooth-scrolling anchor links with scroll-spy +
 *   preorder CTA; links collapse behind a menu button at compact widths),
 *   a split hero pairing copy with a layered schematic SVG product render
 *   whose EXPLODED-VIEW toggle springs the four layers apart with labeled
 *   hairline leader lines, a spec-highlights grid whose tabular values
 *   count up on first reveal, an in-the-box row, a working configurator
 *   (color swatches retint every render on the page; pack-size control
 *   recomputes a tabular total with a savings chip; preorder email
 *   capture validates and flips to a reservation summary), a dated
 *   shipping timeline, a compatibility strip, review quotes, an honest
 *   FAQ accordion, and a footer with the warranty note. Scroll-reveals
 *   rise 12px and fire once; everything is gated by
 *   prefers-reduced-motion (reveals render visible, counters render
 *   final, the exploded view snaps instantly).
 * @position Page template; emitted by \`astryx template hardware-product-landing\`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container that owns scroll-spy; the navbar is
 * position:sticky top:0 inside it, and full-bleed tinted bands (specs,
 * configurator, compatibility, footer) alternate with plain bands, each
 * centering a 1100px column.
 *
 * Interaction contract:
 * - Nav anchors and both hero CTAs smooth-scroll the container to real
 *   section ids with a sticky-nav allowance; onScroll spies the last
 *   anchor above the fold and highlights it (aria-current). At <=720px
 *   the links collapse behind a 40px menu button whose dropdown closes
 *   on Escape, outside pointerdown, or selection.
 * - The exploded-view toggle (aria-pressed) translates the four SVG
 *   layers apart on a springy cubic-bezier with staggered delays and
 *   fades in labels + hairline leader lines; reduced motion snaps.
 * - Configurator swatches (aria-pressed) retint the hero render, the
 *   configurator render, and the order readout; the pack-size
 *   SegmentedControl recomputes unit price, tabular total, and the
 *   "Save $N" Badge honestly. The preorder form validates (empty +
 *   format errors inline) and success swaps to a reservation card
 *   echoing email, colorway, pack, and total, with a reset link.
 * - Spec-tile values count up over ~900ms the first time the grid
 *   scrolls into view; reduced motion renders final values.
 * - FAQ Collapsibles are controlled via a Set; the battery entry ships
 *   open because its honest footnote is the section's point.
 *
 * Color policy: token-pure chrome with ONE quarantined accent pair.
 * ACCENT = light-dark(#C2410C, #FDBA74) — contrast math: #C2410C on
 * white 5.2:1 and white on #C2410C 5.2:1 (AA for text and for the solid
 * CTA); #FDBA74 on the dark app background (~#141519) 11.9:1 (AAA).
 * ACCENT_SOFT/ACCENT_LINE are alpha variants of the same two hexes.
 * Device-art literals (colorway shells, PCB, battery cell) are
 * scheme-stable product-render paint inside the SVG only — a physical
 * object does not reflow with the app theme.
 *
 * Responsive contract (useElementWidth on the page wrapper — the demo
 * stage is ~1045px wide, so viewport media queries never fire inline):
 * - >880px: split hero (copy | render), specs 3-up, box row 4-up,
 *   configurator split, horizontal timeline, reviews 3-up.
 * - <=880px: hero stacks (render below copy), specs drop to 2-up,
 *   box row 2-up, reviews stack single-column.
 * - <=720px: nav links collapse behind the menu button; the
 *   configurator stacks (render above controls); the shipping timeline
 *   goes vertical with a left rail.
 * - <=520px: specs drop to 1-up, headline and section paddings step
 *   down, the preorder form stacks its button, swatch/pack rows wrap.
 *   Holds at 390px in the phone artboard with no overflow-x.
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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ActivityIcon,
  ArrowRightIcon,
  BatteryFullIcon,
  BirdIcon,
  BluetoothIcon,
  BookOpenIcon,
  CableIcon,
  CalendarCheckIcon,
  CheckIcon,
  FeatherIcon,
  LayersIcon,
  MagnetIcon,
  MailCheckIcon,
  MenuIcon,
  RadioIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// ONE quarantined accent pair (see Color policy). Contrast math:
// #C2410C on #FFFFFF = 5.2:1 and #FFFFFF on #C2410C = 5.2:1 (AA for
// normal text and for the solid preorder CTA); #FDBA74 on the dark app
// background (~#141519) = 11.9:1 (AAA). SOFT/LINE are alpha variants of
// the same two hexes — no second accent hue exists on this page.
const ACCENT = 'light-dark(#C2410C, #FDBA74)';
const ACCENT_SOFT =
  'light-dark(rgba(194, 65, 12, 0.08), rgba(253, 186, 116, 0.10))';
const ACCENT_LINE =
  'light-dark(rgba(194, 65, 12, 0.28), rgba(253, 186, 116, 0.34))';

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 132;

/** Springy overshoot for the exploded-view layers. */
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// Scheme-stable device-art literals (see Color policy): the product
// render is a physical object and paints identically in both themes.
const ART = {
  boardTop: '#1C6B47',
  boardDeep: '#124B32',
  chip: '#0C2E1F',
  pad: '#D9B36B',
  cellTop: '#C4C9D1',
  cellDeep: '#969DA8',
  portSlot: '#1A1F26',
  seam: 'rgba(10, 14, 20, 0.25)',
  sheen: 'rgba(255, 255, 255, 0.10)',
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy and hosts the sticky navbar.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
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
  bandAccent: {
    backgroundColor: ACCENT_SOFT,
    borderTop: \`1px solid \${ACCENT_LINE}\`,
    borderBottom: \`1px solid \${ACCENT_LINE}\`,
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
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_LINE}\`,
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
    backgroundColor: ACCENT_SOFT,
  },
  // 40px icon-only button (Astryx Button caps at 36px).
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
  // ---- section furniture ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
    margin: 0,
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
  heroHeadline: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.08,
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
    maxWidth: 500,
    margin: 0,
  },
  // ---- device render panel ----
  renderPanel: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 16,
    border: \`1px solid \${ACCENT_LINE}\`,
    backgroundColor: ACCENT_SOFT,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  explodeToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  explodeToggleOn: {
    borderColor: ACCENT,
    color: ACCENT,
    boxShadow: \`inset 0 0 0 1px \${ACCENT}\`,
  },
  // ---- spec tiles ----
  specTile: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    minHeight: 118,
    boxSizing: 'border-box',
  },
  specValue: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  specUnit: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginLeft: 4,
  },
  // ---- in-the-box ----
  boxTile: {
    borderRadius: 14,
    border: '1px dashed var(--color-border)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-2)',
    boxSizing: 'border-box',
  },
  boxGlyph: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid var(--color-text-secondary)',
    color: 'var(--color-text-secondary)',
  },
  // ---- configurator ----
  configRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
  },
  configRowStacked: {
    flexDirection: 'column',
  },
  configRender: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  configControls: {
    flex: '1.2 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  swatchSelected: {
    boxShadow: \`0 0 0 2px var(--color-background-body), 0 0 0 4px \${ACCENT}\`,
  },
  orderTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  orderRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
  },
  orderNumber: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
  },
  orderTotal: {
    fontSize: 24,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
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
    border: \`1px solid \${ACCENT_LINE}\`,
    color: ACCENT,
  },
  // ---- shipping timeline ----
  timelineRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'stretch',
  },
  timelineRowStacked: {
    flexDirection: 'column',
  },
  timelineStep: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    position: 'relative',
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_SOFT,
    border: \`1px solid \${ACCENT_LINE}\`,
    color: ACCENT,
    flexShrink: 0,
  },
  timelineTrack: {
    position: 'absolute',
    top: 20,
    left: 48,
    right: 8,
    height: 1,
    backgroundColor: 'var(--color-border)',
  },
  timelineTrackVertical: {
    position: 'absolute',
    top: 48,
    bottom: -8,
    left: 20,
    width: 1,
    backgroundColor: 'var(--color-border)',
  },
  // ---- compatibility ----
  ecoTile: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    boxSizing: 'border-box',
    minWidth: 0,
  },
  // Hue-gradient monogram art (sanctioned art literals; scheme-stable).
  ecoMonogram: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
  },
  // ---- reviews ----
  starRow: {
    display: 'flex',
    gap: 2,
    color: ACCENT,
  },
  starMuted: {
    color: 'var(--color-border)',
  },
  quote: {
    fontSize: 15,
    lineHeight: 1.55,
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  // ---- footer ----
  footer: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Perch desk sensor.
// No Date.now, no randomness, no network assets, no real brands.

const BRAND = {
  name: 'Perch',
  tagline: 'The smart desk sensor',
};

type SectionId = 'specs' | 'configure' | 'reviews' | 'faq';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'specs', label: 'Specs'},
  {id: 'configure', label: 'Configure'},
  {id: 'reviews', label: 'Reviews'},
  {id: 'faq', label: 'FAQ'},
];

const HERO = {
  eyebrow: 'Perch · smart desk sensor',
  headline: 'A tiny sensor. A noticeably better workday.',
  subcopy:
    'Perch sits under your monitor and quietly reads posture, air ' +
    'quality, light, and focus time — then nudges you at exactly the ' +
    'right moment. No camera. No microphone recordings. No subscription.',
  priceLine: '$89 · ships November 2026 · 30-day at-your-desk trial',
};

/** Exploded-view layer labels, top layer first. */
const LAYER_LABELS: readonly string[] = [
  'Knit fabric top · LED halo',
  'Sensor array · 6 channels',
  'Li-ion cell · 14 mo typical',
  '6061 aluminum shell · USB-C',
];

interface Colorway {
  id: string;
  label: string;
  /** Scheme-stable device-art literals (see Color policy). */
  shell: string;
  shellDeep: string;
  cap: string;
}

const COLORWAYS: readonly Colorway[] = [
  {id: 'graphite', label: 'Graphite', shell: '#454C57', shellDeep: '#31373F', cap: '#5C646F'},
  {id: 'sand', label: 'Sand', shell: '#CBB99E', shellDeep: '#A8957A', cap: '#DFD2BD'},
  {id: 'moss', label: 'Moss', shell: '#6A7A62', shellDeep: '#4F5D49', cap: '#83937B'},
];

interface SpecTile {
  id: string;
  label: string;
  /** Numeric values count up on first reveal; string values are static. */
  value: number | string;
  unit?: string;
  detail: string;
  icon: Glyph;
}

const SPEC_TILES: readonly SpecTile[] = [
  {
    id: 'battery',
    label: 'Battery life',
    value: 14,
    unit: 'mo',
    detail: 'One charge, typical use — see the honest footnote in the FAQ.',
    icon: BatteryFullIcon,
  },
  {
    id: 'range',
    label: 'Wireless range',
    value: 18,
    unit: 'm',
    detail: 'Line of sight to hub or laptop; through-wall is about half.',
    icon: RadioIcon,
  },
  {
    id: 'sensors',
    label: 'Sensor channels',
    value: 6,
    detail: 'Presence, posture tilt, CO₂, VOC, ambient light, noise level.',
    icon: ActivityIcon,
  },
  {
    id: 'weight',
    label: 'Weight',
    value: 94,
    unit: 'g',
    detail: 'With the magnetic mount plate attached.',
    icon: FeatherIcon,
  },
  {
    id: 'materials',
    label: 'Materials',
    value: '6061 aluminum',
    detail: 'CNC-machined shell, knit recycled-PET top, user-replaceable cell.',
    icon: LayersIcon,
  },
  {
    id: 'connectivity',
    label: 'Connectivity',
    value: 'BLE 5.3 + Thread',
    detail: 'Pairs to the free app; joins a Thread mesh if you have one.',
    icon: BluetoothIcon,
  },
];

const BOX_ITEMS: readonly {id: string; label: string; note: string; icon: Glyph}[] = [
  {id: 'sensor', label: 'Perch sensor', note: 'Charged to 80% for shelf life', icon: BirdIcon},
  {id: 'cable', label: 'USB-C cable', note: '1 m, braided', icon: CableIcon},
  {id: 'mount', label: 'Magnetic desk mount', note: '+ 2 adhesive plates', icon: MagnetIcon},
  {id: 'guide', label: 'Quick-start card', note: '90-second setup', icon: BookOpenIcon},
];

interface PackOption {
  id: string;
  units: number;
  label: string;
  /** Fixed bundle price in USD; savings derive from SINGLE_PRICE. */
  total: number;
}

const SINGLE_PRICE = 89;

const PACKS: readonly PackOption[] = [
  {id: 'p1', units: 1, label: 'Single', total: 89},
  {id: 'p3', units: 3, label: '3-pack', total: 249},
  {id: 'p5', units: 5, label: '5-pack', total: 395},
];

const RESERVATION_CODE = 'PR-2611';

const TIMELINE_STEPS: readonly {
  id: string;
  title: string;
  date: string;
  copy: string;
  icon: Glyph;
}[] = [
  {
    id: 'reserve',
    title: 'Reserve today',
    date: 'July 2026',
    copy:
      'Nothing is charged now. We email you a week before your card is ' +
      'billed, and you can cancel with one click any time before then.',
    icon: CalendarCheckIcon,
  },
  {
    id: 'ships',
    title: 'Ships',
    date: 'November 2026',
    copy:
      'The first 5,000 units leave the Tacoma line the week of Nov 9, ' +
      'in reservation order. Tracking lands the day yours ships.',
    icon: TruckIcon,
  },
  {
    id: 'trial',
    title: '30-day trial',
    date: 'Through December',
    copy:
      'Live with Perch at your actual desk for a month. Not for you? ' +
      'Prepaid return label, full refund, no restocking fee.',
    icon: RotateCcwIcon,
  },
];

/** Invented ecosystem partners — monogram tiles, no real brands. */
const ECOSYSTEM: readonly {id: string; name: string; note: string; monogram: string; art: string}[] = [
  {id: 'hearthline', name: 'Hearthline', note: 'Scenes & routines', monogram: 'HL', art: 'linear-gradient(135deg, #F97316 0%, #DB2777 100%)'},
  {id: 'casaflow', name: 'Casaflow', note: 'Home dashboard', monogram: 'CF', art: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)'},
  {id: 'loomkit', name: 'Loomkit', note: 'Open-source hub', monogram: 'LK', art: 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)'},
  {id: 'standwise', name: 'Standwise', note: 'Standing desks', monogram: 'SW', art: 'linear-gradient(135deg, #8B5CF6 0%, #4338CA 100%)'},
  {id: 'airloom', name: 'Airloom', note: 'Air purifiers', monogram: 'AL', art: 'linear-gradient(135deg, #14B8A6 0%, #0369A1 100%)'},
  {id: 'tessel', name: 'Tessel Home', note: 'Thread border router', monogram: 'TH', art: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'},
];

const REVIEWS: readonly {
  id: string;
  stars: number;
  quote: string;
  name: string;
  source: string;
}[] = [
  {
    id: 'priya',
    stars: 5,
    quote:
      'The posture nudge is the first one I have not turned off after a ' +
      'week. It waits until I have actually been slumped for a while, ' +
      'so when it taps my wrist I believe it.',
    name: 'Priya S.',
    source: 'Beta unit · Seattle',
  },
  {
    id: 'marcus',
    stars: 5,
    quote:
      'Setup was genuinely 90 seconds. The CO₂ graph explained my 3pm ' +
      'slump inside two days — cracked a window, slump gone. Feels like ' +
      'cheating.',
    name: 'Marcus T.',
    source: 'Beta unit · Austin',
  },
  {
    id: 'lena',
    stars: 4,
    quote:
      'Docked one star because Thread pairing took two tries on my ' +
      'router. Everything since has been flawless, and the battery ' +
      'estimate has barely moved in six weeks.',
    name: 'Lena W.',
    source: 'Beta unit · Berlin',
  },
];

const FAQ: readonly {id: string; question: string; answer: string}[] = [
  {
    id: 'battery',
    question: 'Is the 14-month battery figure real?',
    answer:
      'Honest footnote: 14 months is measured at one sample per minute, ' +
      '21°C, BLE only. If Perch routes traffic for a busy Thread mesh, or ' +
      'lives in a cold garage office, expect 9–11 months. The app shows a ' +
      'live projection so you are never guessing, and a 90-minute USB-C ' +
      'charge refills it. The cell is user-replaceable — we sell it at ' +
      'cost ($7).',
  },
  {
    id: 'privacy',
    question: 'Does Perch record audio or video?',
    answer:
      'There is no camera. The microphone measures decibel level only — ' +
      'a single loudness number, computed on-device; no waveform is ever ' +
      'stored or transmitted. Presence detection is radar-based. All ' +
      'processing happens on the sensor, and cloud sync is opt-in.',
  },
  {
    id: 'subscription',
    question: 'Is there a subscription?',
    answer:
      'No. The app, nudges, and 12 months of history are free forever. ' +
      'The only paid option is Perch+ ($2/month) for unlimited history ' +
      'and CSV export — nothing you buy today gets moved behind it later.',
  },
  {
    id: 'return',
    question: 'What if it does not work for my desk?',
    answer:
      'Every order includes a 30-day at-your-desk trial. If Perch is not ' +
      'earning its spot under your monitor, request a return in the app: ' +
      'prepaid label, full refund to your original payment method, no ' +
      'restocking fee. Warranty coverage is 2 years on top of that.',
  },
];

const FOOTER_LINKS: readonly string[] = [
  'Support',
  'Warranty terms',
  'Privacy',
  'Press kit',
];

const WARRANTY_NOTE =
  'Every Perch ships with a 2-year limited warranty and a 30-day ' +
  'at-your-desk trial. The battery is user-replaceable, and we sell the ' +
  'cell at cost — a sensor you buy once should not become e-waste on a ' +
  'schedule.';

// ============= HELPERS =============

function formatUSD(amount: number): string {
  return \`$\${amount.toLocaleString('en-US')}\`;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your email to reserve a spot in line.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/**
 * Measure the page's own width (the demo stage is ~1045px inside a
 * 1440px window, so viewport media queries never fire inline).
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

/** Reduced-motion gate: reveals render visible, counters render final. */
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setPrefers(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefers;
}

// ============= SMALL PIECES =============

/**
 * Fire-once scroll reveal: rise 12px + fade over 520ms. Children may be
 * a render function to key count-ups off the reveal moment. Reduced
 * motion renders visible immediately with no transition.
 */
function Reveal({
  reduced,
  delayMs = 0,
  children,
}: {
  reduced: boolean;
  delayMs?: number;
  children: ReactNode | ((isRevealed: boolean) => ReactNode);
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(reduced);
  useEffect(() => {
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
  }, [reduced]);
  return (
    <div
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'none' : 'translateY(12px)',
        transition: reduced
          ? 'none'
          : \`opacity 520ms ease \${delayMs}ms, transform 520ms ease \${delayMs}ms\`,
      }}>
      {typeof children === 'function' ? children(isRevealed) : children}
    </div>
  );
}

/** Count-up number: eases to the fixture target on first reveal. */
function CountUpValue({
  target,
  isActive,
  reduced,
}: {
  target: number;
  isActive: boolean;
  reduced: boolean;
}) {
  const [display, setDisplay] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reduced) {
      setDisplay(target);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const durationMs = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, reduced, target]);
  return <>{display.toLocaleString('en-US')}</>;
}

/** Filled five-star row; unfilled stars are border-toned. */
function StarRow({count}: {count: number}) {
  return (
    <div
      style={styles.starRow}
      role="img"
      aria-label={\`\${count} out of 5 stars\`}>
      {[1, 2, 3, 4, 5].map(index => (
        <svg
          key={index}
          width={16}
          height={16}
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={index > count ? styles.starMuted : undefined}>
          <path
            fill="currentColor"
            d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"
          />
        </svg>
      ))}
    </div>
  );
}

/** Section intro: uppercase eyebrow + heading + supporting copy. */
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
      <p style={styles.eyebrow}>{eyebrow}</p>
      <Heading level={2}>{title}</Heading>
      {description !== undefined ? (
        <Text type="supporting" color="secondary">
          {description}
        </Text>
      ) : null}
    </VStack>
  );
}

// ---- layered device render ----

const RENDER_CX = 140;
const RENDER_RX = 74;
const RENDER_RY = 20;

/** Cylinder wall: front lower arc of top ellipse down to bottom ellipse. */
function wallPath(y1: number, y2: number): string {
  const left = RENDER_CX - RENDER_RX;
  const right = RENDER_CX + RENDER_RX;
  return [
    \`M \${left} \${y1}\`,
    \`A \${RENDER_RX} \${RENDER_RY} 0 0 0 \${right} \${y1}\`,
    \`L \${right} \${y2}\`,
    \`A \${RENDER_RX} \${RENDER_RY} 0 0 1 \${left} \${y2}\`,
    'Z',
  ].join(' ');
}

interface LayerGeometry {
  /** Assembled y of the layer's top ellipse. */
  top: number;
  /** Wall height below the top ellipse. */
  height: number;
  /** translateY when exploded. */
  offset: number;
}

/** Top layer first: fabric cap, sensor board, battery cell, base shell. */
const LAYER_GEOMETRY: readonly LayerGeometry[] = [
  {top: 108, height: 14, offset: -54},
  {top: 122, height: 6, offset: -18},
  {top: 128, height: 12, offset: 16},
  {top: 140, height: 34, offset: 54},
];

/**
 * Schematic Perch render: four stacked SVG layers. Exploded view
 * translates them apart on a springy stagger and fades in labels with
 * hairline leader lines; reduced motion snaps instantly.
 */
function DeviceRender({
  colorway,
  isExploded,
  withLabels,
  reduced,
  ariaLabel,
}: {
  colorway: Colorway;
  isExploded: boolean;
  withLabels: boolean;
  reduced: boolean;
  ariaLabel: string;
}) {
  const layerStyle = (index: number): CSSProperties => ({
    transform: isExploded
      ? \`translateY(\${LAYER_GEOMETRY[index].offset}px)\`
      : 'translateY(0)',
    transition: reduced
      ? 'none'
      : \`transform 620ms \${SPRING} \${index * 70}ms\`,
  });
  const labelStyle: CSSProperties = {
    opacity: isExploded ? 1 : 0,
    transition: reduced ? 'none' : 'opacity 360ms ease 320ms',
  };
  /** Label anchor: vertical middle of each layer once exploded. */
  const labelY = (index: number): number => {
    const geometry = LAYER_GEOMETRY[index];
    return geometry.top + geometry.height / 2 + geometry.offset;
  };
  const [cap, board, cell, base] = LAYER_GEOMETRY;
  return (
    <svg
      viewBox={withLabels ? '0 16 340 268' : '58 78 164 124'}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      style={{display: 'block', maxHeight: withLabels ? 340 : 170}}>
      {/* base shell (drawn first so upper layers paint over it) */}
      <g style={layerStyle(3)}>
        <path d={wallPath(base.top, base.top + base.height)} fill={colorway.shellDeep} />
        <ellipse cx={RENDER_CX} cy={base.top} rx={RENDER_RX} ry={RENDER_RY} fill={colorway.shell} />
        <ellipse cx={RENDER_CX} cy={base.top} rx={RENDER_RX} ry={RENDER_RY} fill="none" stroke={ART.seam} strokeWidth={1} />
        {/* USB-C slot on the front wall */}
        <rect x={RENDER_CX - 13} y={base.top + base.height + 8} width={26} height={6} rx={3} fill={ART.portSlot} />
        {/* sheen strip down the left of the shell wall */}
        <rect x={RENDER_CX - RENDER_RX + 10} y={base.top + 12} width={14} height={base.height - 6} rx={7} fill={ART.sheen} />
      </g>
      {/* battery cell */}
      <g style={layerStyle(2)}>
        <path d={wallPath(cell.top, cell.top + cell.height)} fill={ART.cellDeep} />
        <ellipse cx={RENDER_CX} cy={cell.top} rx={RENDER_RX} ry={RENDER_RY} fill={ART.cellTop} />
        <ellipse cx={RENDER_CX} cy={cell.top} rx={30} ry={8} fill="none" stroke={ART.cellDeep} strokeWidth={1.2} />
        <text x={RENDER_CX} y={cell.top + 3} textAnchor="middle" fontSize={7} fontWeight={700} fill={ART.portSlot}>
          3.7V
        </text>
      </g>
      {/* sensor board */}
      <g style={layerStyle(1)}>
        <path d={wallPath(board.top, board.top + board.height)} fill={ART.boardDeep} />
        <ellipse cx={RENDER_CX} cy={board.top} rx={RENDER_RX} ry={RENDER_RY} fill={ART.boardTop} />
        <rect x={RENDER_CX - 34} y={board.top - 9} width={18} height={9} rx={2} fill={ART.chip} />
        <rect x={RENDER_CX + 8} y={board.top - 7} width={13} height={7} rx={2} fill={ART.chip} />
        <circle cx={RENDER_CX - 4} cy={board.top + 7} r={3.4} fill={ART.pad} />
        <circle cx={RENDER_CX + 30} cy={board.top + 5} r={2.4} fill={ART.pad} />
      </g>
      {/* fabric cap with LED halo */}
      <g style={layerStyle(0)}>
        <path d={wallPath(cap.top, cap.top + cap.height)} fill={colorway.shellDeep} />
        <ellipse cx={RENDER_CX} cy={cap.top} rx={RENDER_RX} ry={RENDER_RY} fill={colorway.cap} />
        <ellipse cx={RENDER_CX} cy={cap.top} rx={52} ry={13.5} fill="none" style={{stroke: ACCENT}} strokeWidth={2.5} opacity={0.9} />
        <ellipse cx={RENDER_CX - 20} cy={cap.top - 5} rx={26} ry={6} fill={ART.sheen} />
      </g>
      {withLabels ? (
        <g style={labelStyle} aria-hidden={!isExploded}>
          {LAYER_LABELS.map((label, index) => (
            <g key={label}>
              <line
                x1={RENDER_CX + RENDER_RX + 2}
                y1={labelY(index)}
                x2={RENDER_CX + RENDER_RX + 16}
                y2={labelY(index)}
                stroke="var(--color-text-secondary)"
                strokeWidth={1}
              />
              <text
                x={RENDER_CX + RENDER_RX + 20}
                y={labelY(index)}
                dominantBaseline="middle"
                fontSize={11}
                fill="var(--color-text-secondary)">
                {label}
              </text>
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
}

// ============= PAGE =============

export default function HardwareProductLandingTemplate() {
  // ---- responsive: measure the page itself (demo-stage quirk) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isMid = wrapWidth > 0 && wrapWidth <= 880;
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;
  const isPhone = wrapWidth > 0 && wrapWidth <= 520;

  const reduced = usePrefersReducedMotion();

  // ---- navbar ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- signature hero moment: exploded view ----
  const [isExploded, setIsExploded] = useState(false);

  // ---- configurator ----
  const [colorwayId, setColorwayId] = useState(COLORWAYS[0].id);
  const [packId, setPackId] = useState(PACKS[0].id);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [reservedEmail, setReservedEmail] = useState<string | null>(null);

  // ---- FAQ: controlled Set; the honest battery entry ships open ----
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set([FAQ[0].id]),
  );

  const colorway =
    COLORWAYS.find(entry => entry.id === colorwayId) ?? COLORWAYS[0];
  const pack = PACKS.find(entry => entry.id === packId) ?? PACKS[0];
  const perUnit = pack.total / pack.units;
  const savings = SINGLE_PRICE * pack.units - pack.total;

  // Menu dismisses on Escape (refocusing the trigger) and on outside
  // pointerdown; listeners only run while it is open.
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

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  /** Smooth-scroll the container to a section under the sticky nav. */
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

  const submitPreorder = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setReservedEmail(email.trim());
    setEmail('');
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

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isCompact ? styles.columnCompact : undefined),
  };
  const bandPad: CSSProperties = {
    ...styles.band,
    ...(isCompact ? styles.bandCompact : undefined),
  };

  // ============= CHROME =============

  const brandMark = (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={BirdIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        {!isPhone ? (
          <Text type="supporting" color="secondary">
            {BRAND.tagline}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  );

  const navBar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Site">
      <div style={styles.navInner}>
        {brandMark}
        <StackItem size="fill">
          {!isCompact ? (
            <HStack gap={1} hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={{
                    ...styles.navLink,
                    ...(activeSection === anchor.id
                      ? styles.navLinkActive
                      : undefined),
                  }}
                  aria-current={
                    activeSection === anchor.id ? 'true' : undefined
                  }
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          ) : (
            <div />
          )}
        </StackItem>
        <Button
          label={isPhone ? 'Preorder' : 'Preorder · $89'}
          variant="primary"
          size="sm"
          onClick={() => jumpToSection('configure')}
        />
        {isCompact ? (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(open => !open)}
            style={styles.iconButton}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        ) : null}
        {isCompact && isMenuOpen ? (
          <div style={styles.mobileMenu} role="menu" aria-label="Site menu">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.mobileMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                  {anchor.label}
                </button>
              ))}
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ============= HERO =============

  const hero = (
    <div style={{...columnStyle, ...bandPad}}>
      <div
        style={{
          ...styles.heroRow,
          ...(isMid ? styles.heroRowStacked : undefined),
        }}>
        <div style={styles.heroText}>
          <p style={styles.eyebrow}>{HERO.eyebrow}</p>
          <h1
            style={{
              ...styles.heroHeadline,
              ...(isPhone ? styles.heroHeadlineCompact : undefined),
            }}>
            {HERO.headline}
          </h1>
          <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Badge variant="success" label="Preorder open" />
            <Text type="supporting" color="secondary">
              {HERO.priceLine}
            </Text>
          </HStack>
          <HStack gap={2} wrap="wrap">
            <Button
              label="Preorder — $89"
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => jumpToSection('configure')}
            />
            <Button
              label="See full specs"
              variant="secondary"
              onClick={() => jumpToSection('specs')}
            />
          </HStack>
        </div>
        <div style={styles.renderPanel}>
          <DeviceRender
            colorway={colorway}
            isExploded={isExploded}
            withLabels
            reduced={reduced}
            ariaLabel={\`Schematic render of the Perch sensor in \${colorway.label}\${isExploded ? ', exploded into four labeled layers' : ''}\`}
          />
          <HStack gap={2} vAlign="center" wrap="wrap">
            <button
              type="button"
              aria-pressed={isExploded}
              style={{
                ...styles.explodeToggle,
                ...(isExploded ? styles.explodeToggleOn : undefined),
              }}
              onClick={() => setIsExploded(open => !open)}>
              <Icon icon={LayersIcon} size="sm" color="inherit" />
              {isExploded ? 'Assemble' : 'Exploded view'}
            </button>
            <Text type="supporting" color="secondary">
              4 layers · CNC 6061 shell · {colorway.label}
            </Text>
          </HStack>
        </div>
      </div>
    </div>
  );

  // ============= SPECS =============

  const specsSection = (
    <section
      id="specs"
      ref={registerSection('specs')}
      style={styles.bandMuted}>
      <div style={{...columnStyle, ...bandPad}}>
        <VStack gap={5}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="Spec highlights"
              title="Small object, serious hardware"
              description="Every number below is measured, not aspirational — the battery methodology is spelled out in the FAQ."
            />
          </Reveal>
          <Reveal reduced={reduced} delayMs={80}>
            {isRevealed => (
              <Grid
                columns={isPhone ? 1 : isMid ? 2 : 3}
                gap={3}>
                {SPEC_TILES.map(tile => (
                  <div key={tile.id} style={styles.specTile}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={tile.icon} size="sm" color="secondary" />
                      <Text type="supporting" color="secondary">
                        {tile.label}
                      </Text>
                    </HStack>
                    <div>
                      <span style={styles.specValue}>
                        {typeof tile.value === 'number' ? (
                          <CountUpValue
                            target={tile.value}
                            isActive={isRevealed}
                            reduced={reduced}
                          />
                        ) : (
                          tile.value
                        )}
                      </span>
                      {tile.unit !== undefined ? (
                        <span style={styles.specUnit}>{tile.unit}</span>
                      ) : null}
                    </div>
                    <Text type="supporting" color="secondary">
                      {tile.detail}
                    </Text>
                  </div>
                ))}
              </Grid>
            )}
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= IN THE BOX =============

  const boxSection = (
    <div style={{...columnStyle, ...bandPad}}>
      <VStack gap={5}>
        <Reveal reduced={reduced}>
          <SectionIntro
            eyebrow="In the box"
            title="Everything you need, nothing to recycle"
          />
        </Reveal>
        <Reveal reduced={reduced} delayMs={80}>
          <Grid columns={isMid ? 2 : 4} gap={3}>
            {BOX_ITEMS.map(item => (
              <div key={item.id} style={styles.boxTile}>
                <div style={styles.boxGlyph} aria-hidden="true">
                  <Icon icon={item.icon} size="md" color="inherit" />
                </div>
                <Text size="sm" weight="semibold">
                  {item.label}
                </Text>
                <Text type="supporting" color="secondary">
                  {item.note}
                </Text>
              </div>
            ))}
          </Grid>
        </Reveal>
      </VStack>
    </div>
  );

  // ============= CONFIGURATOR =============

  const orderReadout = (
    <div style={styles.orderTable}>
      <div style={styles.orderRow}>
        <Text type="supporting" color="secondary">
          {pack.units} × Perch in {colorway.label}
        </Text>
        <span style={styles.orderNumber}>
          {formatUSD(perUnit)} / unit
        </span>
      </div>
      <Divider />
      <div style={styles.orderRow}>
        <HStack gap={2} vAlign="center">
          <Text type="label">Total at ship</Text>
          {savings > 0 ? (
            <Badge
              variant="success"
              label={\`Save \${formatUSD(savings)} vs singles\`}
            />
          ) : null}
        </HStack>
        <span style={styles.orderTotal}>{formatUSD(pack.total)}</span>
      </div>
    </div>
  );

  const preorderForm =
    reservedEmail === null ? (
      <VStack gap={2}>
        <div
          style={{
            ...styles.emailRow,
            ...(isPhone ? styles.emailRowStacked : undefined),
          }}>
          <div style={styles.emailInput}>
            <TextInput
              label="Email for your reservation"
              isLabelHidden
              placeholder="you@example.com"
              value={email}
              onChange={value => {
                setEmail(value);
                setEmailError(null);
              }}
            />
          </div>
          <Button
            label="Reserve my Perch"
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={submitPreorder}
          />
        </div>
        {emailError !== null ? (
          <p style={styles.emailError} role="alert">
            {emailError}
          </p>
        ) : (
          <Text type="supporting" color="secondary">
            No charge today — we email you a week before billing.
          </Text>
        )}
      </VStack>
    ) : (
      <HStack gap={3} vAlign="start">
        <div style={styles.successDisc} aria-hidden="true">
          <Icon icon={MailCheckIcon} size="sm" color="inherit" />
        </div>
        <VStack gap={1}>
          <Text type="label">Reserved — order {RESERVATION_CODE}</Text>
          <Text type="supporting" color="secondary">
            {pack.units} × Perch in {colorway.label} ·{' '}
            {formatUSD(pack.total)} due at ship · confirmation sent to{' '}
            {reservedEmail}.
          </Text>
          <Button
            label="Use a different email"
            variant="ghost"
            size="sm"
            onClick={() => setReservedEmail(null)}
          />
        </VStack>
      </HStack>
    );

  const configuratorSection = (
    <section
      id="configure"
      ref={registerSection('configure')}
      style={styles.bandAccent}>
      <div style={{...columnStyle, ...bandPad}}>
        <VStack gap={5}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="Configure"
              title="Pick a finish. Pick a pack. Done."
              description="Three anodized finishes, one honest price curve — packs just pass the shipping savings back to you."
            />
          </Reveal>
          <Reveal reduced={reduced} delayMs={80}>
            <Card padding={5}>
              <div
                style={{
                  ...styles.configRow,
                  ...(isCompact ? styles.configRowStacked : undefined),
                }}>
                <div style={styles.configRender}>
                  <DeviceRender
                    colorway={colorway}
                    isExploded={false}
                    withLabels={false}
                    reduced={reduced}
                    ariaLabel={\`Perch sensor preview in \${colorway.label}\`}
                  />
                </div>
                <div style={styles.configControls}>
                  <VStack gap={2}>
                    <Text type="label">Finish — {colorway.label}</Text>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      {COLORWAYS.map(entry => (
                        <button
                          key={entry.id}
                          type="button"
                          aria-pressed={entry.id === colorwayId}
                          aria-label={\`\${entry.label} finish\`}
                          style={{
                            ...styles.swatch,
                            backgroundColor: entry.shell,
                            ...(entry.id === colorwayId
                              ? styles.swatchSelected
                              : undefined),
                          }}
                          onClick={() => setColorwayId(entry.id)}
                        />
                      ))}
                      <Text type="supporting" color="secondary">
                        Same price, every finish
                      </Text>
                    </HStack>
                  </VStack>
                  <VStack gap={2}>
                    <Text type="label">Pack size</Text>
                    <SegmentedControl
                      label="Pack size"
                      value={packId}
                      onChange={value => setPackId(value)}
                      size="sm">
                      {PACKS.map(option => (
                        <SegmentedControlItem
                          key={option.id}
                          label={\`\${option.label} · \${formatUSD(option.total)}\`}
                          value={option.id}
                        />
                      ))}
                    </SegmentedControl>
                  </VStack>
                  {orderReadout}
                  {preorderForm}
                </div>
              </div>
            </Card>
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= SHIPPING TIMELINE =============

  const timelineSection = (
    <div style={{...columnStyle, ...bandPad}}>
      <VStack gap={5}>
        <Reveal reduced={reduced}>
          <SectionIntro
            eyebrow="From reserve to desk"
            title="What happens after you click reserve"
          />
        </Reveal>
        <Reveal reduced={reduced} delayMs={80}>
          <div
            style={{
              ...styles.timelineRow,
              ...(isCompact ? styles.timelineRowStacked : undefined),
            }}>
            {TIMELINE_STEPS.map((step, index) => (
              <div
                key={step.id}
                style={{
                  ...styles.timelineStep,
                  ...(isCompact
                    ? {
                        flexDirection: 'row',
                        gap: 'var(--spacing-3)',
                        paddingBottom:
                          index < TIMELINE_STEPS.length - 1
                            ? 'var(--spacing-4)'
                            : 0,
                      }
                    : undefined),
                }}>
                {index < TIMELINE_STEPS.length - 1 ? (
                  <div
                    aria-hidden="true"
                    style={
                      isCompact
                        ? styles.timelineTrackVertical
                        : styles.timelineTrack
                    }
                  />
                ) : null}
                <div style={styles.timelineDot} aria-hidden="true">
                  <Icon icon={step.icon} size="sm" color="inherit" />
                </div>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="label">{step.title}</Text>
                    <Badge variant="neutral" label={step.date} />
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {step.copy}
                  </Text>
                </VStack>
              </div>
            ))}
          </div>
        </Reveal>
      </VStack>
    </div>
  );

  // ============= COMPATIBILITY =============

  const compatibilitySection = (
    <div style={styles.bandMuted}>
      <div style={{...columnStyle, ...bandPad}}>
        <VStack gap={5}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="Compatibility"
              title="Plays nicely with the desk you already have"
              description="Perch speaks Thread and BLE, so it slots into these ecosystems out of the box — no bridge required."
            />
          </Reveal>
          <Reveal reduced={reduced} delayMs={80}>
            <Grid columns={{minWidth: 200, max: 3}} gap={3}>
              {ECOSYSTEM.map(partner => (
                <div key={partner.id} style={styles.ecoTile}>
                  <div
                    style={{...styles.ecoMonogram, background: partner.art}}
                    aria-hidden="true">
                    {partner.monogram}
                  </div>
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {partner.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {partner.note}
                    </Text>
                  </VStack>
                </div>
              ))}
            </Grid>
          </Reveal>
        </VStack>
      </div>
    </div>
  );

  // ============= REVIEWS =============

  const reviewsSection = (
    <section
      id="reviews"
      ref={registerSection('reviews')}>
      <div style={{...columnStyle, ...bandPad}}>
        <VStack gap={5}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="From the beta desks"
              title="212 beta units, opinionated owners"
            />
          </Reveal>
          <Grid columns={isMid ? 1 : 3} gap={3}>
            {REVIEWS.map((review, index) => (
              <Reveal
                key={review.id}
                reduced={reduced}
                delayMs={80 + index * 90}>
                <Card padding={5} height="100%">
                  <VStack gap={3}>
                    <StarRow count={review.stars} />
                    <p style={styles.quote}>“{review.quote}”</p>
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {review.name}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {review.source}
                      </Text>
                    </VStack>
                  </VStack>
                </Card>
              </Reveal>
            ))}
          </Grid>
        </VStack>
      </div>
    </section>
  );

  // ============= FAQ =============

  const faqSection = (
    <section id="faq" ref={registerSection('faq')}>
      <div style={{...columnStyle, ...bandPad}}>
        <VStack gap={5}>
          <Reveal reduced={reduced}>
            <SectionIntro
              eyebrow="FAQ"
              title="The questions we actually get"
              description="Including the battery footnote most sensor companies bury."
            />
          </Reveal>
          <Reveal reduced={reduced} delayMs={80}>
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
                        <div
                          style={{
                            padding: 'var(--spacing-2) 0 var(--spacing-1)',
                          }}>
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
          </Reveal>
        </VStack>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer}>
      <div style={{...columnStyle, paddingBlock: 'var(--spacing-6)'}}>
        <VStack gap={4}>
          <HStack gap={3} vAlign="start" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={2}>
                {brandMark}
                <HStack gap={2} vAlign="start">
                  <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      {WARRANTY_NOTE}
                    </Text>
                  </StackItem>
                </HStack>
              </VStack>
            </StackItem>
            <HStack gap={4} vAlign="center" wrap="wrap">
              {FOOTER_LINKS.map(label => (
                <button
                  key={label}
                  type="button"
                  style={styles.footerLink}
                  onClick={() => {}}>
                  {label}
                </button>
              ))}
            </HStack>
          </HStack>
          <Divider />
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={CheckIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              © 2026 Perch Labs · Designed in Portland, assembled in Tacoma
              · 2-year limited warranty on every unit
            </Text>
          </HStack>
        </VStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={wrapRef} style={{height: '100%'}}>
          <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
            {navBar}
            {hero}
            {specsSection}
            {boxSection}
            {configuratorSection}
            {timelineSection}
            {compatibilitySection}
            {reviewsSection}
            {faqSection}
            {footer}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};