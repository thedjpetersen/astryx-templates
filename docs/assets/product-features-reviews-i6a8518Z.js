var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one product — the 'Tessera 75'
 *   gasket-mounted mechanical keyboard by Keyfield at $189, compare-at
 *   $219 — with three narrative feature rows rendered as layered CSS
 *   gradient art, a three-group tech-spec definition table plus four
 *   fixed highlight stats, a four-item feature accordion whose inline
 *   diagrams are pure CSS, and 12 reviews with fixed authors,
 *   relative-age labels, ratings, verified flags, photo-chip labels, and
 *   helpful counts — no clocks, no randomness, no network image assets)
 * @output Below-the-fold PDP surface with two major regions. Features:
 *   a SegmentedControl swaps three presentation variants — alternating
 *   image/spec rows with gradient product art, a two-column tech-spec
 *   MetadataList table under a highlights callout Card, and an
 *   expandable feature accordion whose Collapsibles reveal inline CSS
 *   diagrams (gasket stack, latency chips, battery gauge, RGB spectrum).
 *   Reviews: a summary panel with the computed average, a star-
 *   distribution histogram whose bar rows are real buttons that filter
 *   the list (with a clear-filter chip and an EmptyState for the empty
 *   2-star band), a recent/highest/lowest/most-helpful sort Selector
 *   that combines with the filter, 12 review rows with verified-purchase
 *   Badges, photo-placeholder chips, and helpful-vote buttons that
 *   increment exactly once per review, plus a write-a-review form with a
 *   star picker and validation that prepends the new review. A sticky
 *   mini product header keeps price and add-to-cart in view throughout.
 * @position Page template; emitted by \`astryx template
 *   product-features-reviews\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the Breadcrumbs
 * trail (Home / Keyboards / Tessera 75). LayoutContent (padding 0)
 * scrolls the whole page; a mini product bar (thumb, name, price,
 * rating, add-to-cart wired to a live cart count) is position: sticky
 * at the top of the scroller so the buy action never leaves view. Below
 * it, a centered maxWidth 1120 wrapper stacks the features region
 * (variant switcher + active variant) and the reviews region (summary
 * panel | review list). This is the below-the-fold half of a PDP —
 * choose product-detail-gallery for the gallery/buy-box top half and
 * storefront-browse for the catalog grid.
 *
 * Responsive contract:
 * - >960px: the reviews region is a two-column pair — summary panel 320
 *   (fixed width, histogram + write-a-review entry point) | review list
 *   (fills). <=960px it stacks summary-then-list in one column.
 * - >768px: alternating feature rows are true two-column rows (art |
 *   copy, order flipping per row) and the tech-spec groups sit in a
 *   two-column grid. <=768px rows stack art-first and spec groups go
 *   single column (MetadataList switches to single-column labels).
 * - <=640px: the mini product bar drops the rating Badge and compare-at
 *   price so name + price + a 40px add-to-cart button fit a 375px
 *   frame; Breadcrumbs shorten to the last segment; the sort Selector
 *   and variant SegmentedControl go full width; star-picker buttons,
 *   histogram bar rows, and helpful buttons take 40px tap targets.
 * - Nothing is hover-only: histogram bars are labeled buttons with
 *   aria-pressed, accordion triggers are Collapsible buttons, photo
 *   chips carry visible labels, and every control works by tap and
 *   keyboard. The page never scrolls sideways at any width.
 *
 * Container policy (PDP features + reviews archetype): frame-first page
 * chrome; Cards for the highlights callout, spec groups, accordion
 * items, the summary panel, and the review form. Feature rows, histogram
 * bars, and review entries are plain rows/buttons — no card-in-card
 * nesting. All product art and diagrams are layered CSS gradients, so
 * the template ships zero image assets.
 *
 * Color policy: the CSS product/photo art is deliberately scheme-locked —
 * the feature-row art tiles (featureArtStyle, including its rgba() corner
 * scrim), the mini-bar thumb, the gasket-stack diagram bars, and the
 * review photo chips stand in for product photography and diagram inks
 * that never re-render for dark mode. Those surfaces keep literal
 * hsl/rgba stops and pin colorScheme: 'dark' (they are dark-toned in both
 * schemes), and the icons/labels sitting on them stay literal #FFFFFF so
 * they remain readable on the locked art. Every other color in this file
 * is an Astryx token that inherits light-dark() from the theme.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  BluetoothIcon,
  CameraIcon,
  CheckIcon,
  KeyboardIcon,
  PenLineIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  ThumbsUpIcon,
  UsbIcon,
  WifiIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered page wrapper below the sticky mini bar.
  wrapper: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    padding: 'var(--spacing-5)',
  },
  // Sticky mini product header: pins to the top of the LayoutContent
  // scroller so price + add-to-cart stay in view at every scroll depth.
  miniBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-2)',
  },
  miniBarInner: {width: '100%', maxWidth: 1120, marginInline: 'auto'},
  // Product-art thumb: scheme-locked gradient standing in for a product
  // photo (see "Color policy" in the header doc) — literal stops, literal
  // white icon, colorScheme pinned dark in both themes.
  miniThumb: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    colorScheme: 'dark',
    background:
      'linear-gradient(135deg, hsl(258, 46%, 46%) 0%, hsl(212, 52%, 26%) 100%)',
  },
  miniName: {minWidth: 0},
  // Alternating feature rows: art | copy pairs that flip per row.
  featureRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
  },
  featureRowReverse: {flexDirection: 'row-reverse'},
  featureRowStacked: {flexDirection: 'column', alignItems: 'stretch'},
  featureHalf: {flex: 1, minWidth: 0},
  // Feature-art tile: scheme-locked CSS "product photo" (see Color
  // policy) — featureArtStyle paints literal hsl/rgba layers on it.
  featureArt: {
    width: '100%',
    height: '100%',
    borderRadius: 'var(--radius-element)',
    colorScheme: 'dark',
  },
  featureArtFrame: {
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-low)',
  },
  // Tech specs: highlight chips wrap; spec groups sit in a 2-up grid.
  highlightGrid: {display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap'},
  highlightChip: {flex: 1, minWidth: 150},
  specGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  specGridStacked: {gridTemplateColumns: 'minmax(0, 1fr)'},
  // Accordion diagrams: pure CSS — layer bars, chips, gauges, spectrum.
  // The stack-layer bars are scheme-locked diagram inks (see Color
  // policy): literal hsl gradient fills with literal white labels.
  diagramLayer: {
    height: 22,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    color: '#FFFFFF',
    colorScheme: 'dark',
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  diagramChipRow: {display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  diagramChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    paddingInline: 10,
    paddingBlock: 6,
  },
  gaugeTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-gray)',
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, hsl(152, 55%, 42%), hsl(152, 60%, 34%))',
  },
  spectrumBar: {
    height: 18,
    borderRadius: 999,
    background:
      'linear-gradient(90deg, hsl(0, 78%, 58%), hsl(45, 82%, 55%), hsl(120, 55%, 48%), hsl(200, 72%, 52%), hsl(268, 62%, 58%), hsl(330, 70%, 56%))',
  },
  // Reviews region: summary panel 320 | list fills; stacks <=960px.
  reviewColumns: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  summaryCol: {width: 320, flexShrink: 0},
  listCol: {flex: 1, minWidth: 0},
  // Histogram rows are real buttons: label + track + count, aria-pressed
  // when that band is the active filter.
  histRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 32,
    padding: '2px 6px',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-element)',
    background: 'none',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  histRowActive: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-background-gray)',
  },
  histRowTouch: {minHeight: 40},
  histStars: {width: 28, flexShrink: 0, textAlign: 'left'},
  histTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-gray)',
    overflow: 'hidden',
  },
  histFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
  },
  histCount: {width: 32, flexShrink: 0, textAlign: 'right'},
  // Star picker: 40px buttons whose ★ glyphs fill up to the hovered-free
  // selected rating; selection is click/keyboard, never hover-only.
  starBtn: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 24,
    lineHeight: 1,
    color: 'var(--color-border)',
  },
  starBtnActive: {color: 'var(--color-accent)'},
  // Photo-placeholder chips: labeled gradient squares, no image assets.
  photoChip: {
    width: 64,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  // Photo-chip art: scheme-locked gradient stand-in for a review photo
  // (see Color policy) — literal white icon on the locked art.
  photoArt: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    colorScheme: 'dark',
  },
  photoLabel: {
    paddingInline: 4,
    paddingBlock: 2,
    fontSize: 10,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text-secondary)',
  },
  photoRow: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  reviewBody: {minWidth: 0},
  errorText: {color: 'var(--color-error)'},
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  fullWidth: {width: '100%'},
};

// ============= DATA =============
// Keyfield — Tessera 75. Fixed catalog data; no clocks, randomness, or
// network media — feature art, diagrams, and photo chips are CSS only.

const PRODUCT_NAME = 'Tessera 75';
const BRAND_NAME = 'Keyfield';
const PRICE = 189;
const COMPARE_AT = 219;
const STYLE_CODE = 'KF-T75-GSK';

const BREADCRUMB_TRAIL = ['Home', 'Keyboards'];

// ----- Features: alternating narrative rows -----

interface FeatureRow {
  id: string;
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
  /** Fixed gradient hues + pattern seed for the mock product art. */
  hues: [number, number];
  pattern: 'keys' | 'stack' | 'signal';
}

const FEATURE_ROWS: ReadonlyArray<FeatureRow> = [
  {
    id: 'fr-typing',
    kicker: 'Typing feel',
    title: 'Gasket-mounted flex, tuned at the factory',
    body: 'The plate floats on 14 silicone gaskets instead of screwing into the case, so every keystroke lands with a soft, even bounce — no metallic ping, no dead spots at the edges of the board.',
    bullets: [
      'FR4 half-plate with relief cuts under the spacebar',
      'Two layers of case foam and a PET switch pad, pre-installed',
      'Stabilizers hand-lubed and clipped before boxing',
    ],
    hues: [258, 212],
    pattern: 'keys',
  },
  {
    id: 'fr-hotswap',
    kicker: 'Endlessly rebuildable',
    title: 'Hot-swap every switch, no soldering iron',
    body: 'Five-pin sockets on every position mean the switches you buy today are never a commitment. Pull, swap, and retune the whole board in an afternoon — the socket rating outlasts three full rebuilds.',
    bullets: [
      '5-pin Kailh sockets rated for 100 swap cycles per position',
      'South-facing LEDs clear every Cherry-profile keycap set',
      'Included puller handles switches and caps',
    ],
    hues: [152, 186],
    pattern: 'stack',
  },
  {
    id: 'fr-wireless',
    kicker: 'Three ways to connect',
    title: 'Tri-mode: 2.4 GHz, Bluetooth, or wired',
    body: 'A dedicated low-latency dongle for the desk, Bluetooth for the laptop bag, USB-C when the battery indicator finally asks. The 8,000 mAh cell runs weeks with the backlight off, not days.',
    bullets: [
      '1,000 Hz polling on the 2.4 GHz dongle',
      'Pairs with three Bluetooth hosts; Fn-key switching',
      '8,000 mAh battery — about 5 weeks per charge, RGB off',
    ],
    hues: [212, 268],
    pattern: 'signal',
  },
];

// ----- Features: tech-spec definition table -----

const HIGHLIGHTS: ReadonlyArray<{stat: string; label: string}> = [
  {stat: '8,000 mAh', label: 'Battery — weeks, not days'},
  {stat: '1,000 Hz', label: 'Polling over 2.4 GHz'},
  {stat: '5-pin', label: 'Hot-swap sockets everywhere'},
  {stat: 'QMK / VIA', label: 'Remap without flashing'},
];

interface SpecGroup {
  id: string;
  title: string;
  rows: ReadonlyArray<{label: string; value: string}>;
}

const SPEC_GROUPS: ReadonlyArray<SpecGroup> = [
  {
    id: 'sg-chassis',
    title: 'Chassis',
    rows: [
      {label: 'Layout', value: '75% — 82 keys, knob included'},
      {label: 'Mount', value: 'Gasket, 14 silicone socks'},
      {label: 'Case', value: 'CNC aluminum, bead-blasted'},
      {label: 'Weight', value: '1.9 kg assembled'},
      {label: 'Typing angle', value: '6°, fixed'},
    ],
  },
  {
    id: 'sg-switches',
    title: 'Switches & keycaps',
    rows: [
      {label: 'Sockets', value: '5-pin hot-swap, all positions'},
      {label: 'Stock switches', value: 'Linear, 45 g, factory-lubed'},
      {label: 'Keycaps', value: 'Double-shot PBT, Cherry profile'},
      {label: 'Stabilizers', value: 'Plate-mount, pre-tuned'},
      {label: 'LEDs', value: 'South-facing, per-key RGB'},
    ],
  },
  {
    id: 'sg-connectivity',
    title: 'Connectivity & power',
    rows: [
      {label: 'Modes', value: '2.4 GHz · Bluetooth 5.1 · USB-C'},
      {label: 'Polling', value: '1,000 Hz dongle / 125 Hz BT'},
      {label: 'Battery', value: '8,000 mAh'},
      {label: 'Runtime', value: '~5 weeks (RGB off)'},
      {label: 'Firmware', value: 'QMK with VIA support'},
    ],
  },
];

// ----- Features: accordion with inline CSS diagrams -----

type DiagramKind = 'stack' | 'latency' | 'battery' | 'spectrum';

interface AccordionFeature {
  id: string;
  title: string;
  summary: string;
  body: string;
  diagram: DiagramKind;
  diagramCaption: string;
}

const ACCORDION_FEATURES: ReadonlyArray<AccordionFeature> = [
  {
    id: 'af-stack',
    title: 'Inside the gasket stack',
    summary: 'Five layers between your fingers and the desk',
    body: 'Sound and feel come from the sandwich, not the switch alone. From the top: keycap, switch, the FR4 plate riding on its gaskets, a PET pad that sharpens the bottom-out, and case foam that swallows the hollowness aluminum cases are known for.',
    diagram: 'stack',
    diagramCaption: 'Layer stack, top of keypress to case floor',
  },
  {
    id: 'af-latency',
    title: 'Latency by connection mode',
    summary: 'The dongle is desk-grade; Bluetooth is bag-grade',
    body: 'Over the 2.4 GHz dongle the board polls at 1,000 Hz — indistinguishable from wired in blind testing. Bluetooth trades speed for convenience and three saved hosts. Wired is the fallback that also charges.',
    diagram: 'latency',
    diagramCaption: 'Round-trip input latency per mode',
  },
  {
    id: 'af-battery',
    title: 'Battery life, honestly measured',
    summary: 'Five weeks with the lights off, five days with them on',
    body: 'The 8,000 mAh cell is the largest we have shipped. Our figure comes from eight-hour workdays at 1,000 Hz over the dongle. Per-key RGB at full brightness cuts runtime roughly seven-fold — the gauge shows the RGB-off case.',
    diagram: 'battery',
    diagramCaption: 'Charge remaining after 4 weeks of workdays: 22%',
  },
  {
    id: 'af-rgb',
    title: 'Per-key RGB that clears the caps',
    summary: 'South-facing LEDs, 16.8M colors, VIA-mapped',
    body: 'LEDs sit south of the switch stem so Cherry-profile keycaps never sit on the diffuser. Every key is individually addressable from VIA — layer indicators, caps-lock warnings, or the full spectrum wave shown here.',
    diagram: 'spectrum',
    diagramCaption: 'Full-gamut spectrum sweep across the alpha row',
  },
];

/** Fixed layer bars for the gasket-stack diagram (width % + hue). */
const STACK_LAYERS: ReadonlyArray<{label: string; width: number; hue: number}> =
  [
    {label: 'Keycap — double-shot PBT', width: 100, hue: 258},
    {label: 'Switch — linear 45 g', width: 88, hue: 232},
    {label: 'FR4 plate on 14 gaskets', width: 96, hue: 206},
    {label: 'PET switch pad', width: 80, hue: 180},
    {label: 'Case foam + aluminum floor', width: 100, hue: 154},
  ];

const LATENCY_MODES: ReadonlyArray<{
  id: string;
  label: string;
  value: string;
  icon: typeof WifiIcon;
}> = [
  {id: 'lm-24', label: '2.4 GHz dongle', value: '1 ms', icon: WifiIcon},
  {id: 'lm-bt', label: 'Bluetooth 5.1', value: '8 ms', icon: BluetoothIcon},
  {id: 'lm-usb', label: 'USB-C wired', value: '1 ms', icon: UsbIcon},
];

const BATTERY_REMAINING_PCT = 22;

// ----- Reviews -----

interface Review {
  id: string;
  author: string;
  /** Fixed relative-age label (no clocks). */
  age: string;
  /** Fixed rank for the recent sort — lower is newer. */
  ageRank: number;
  rating: number;
  title: string;
  text: string;
  isVerified: boolean;
  /** Photo-placeholder chip labels; chips are CSS gradients. */
  photos: string[];
  helpful: number;
}

// 12 fixed reviews. Distribution: 7×5★, 3×4★, 1×3★, 0×2★ (the empty
// band that exercises the EmptyState), 1×1★. Average = 51/12 → 4.3.
const REVIEWS: ReadonlyArray<Review> = [
  {
    id: 'rv-01',
    author: 'Imogen Hart',
    age: '3 days ago',
    ageRank: 1,
    rating: 5,
    title: 'The gasket flex is real, not marketing',
    text: 'Coming from a tray-mount board the difference is immediate — long typing sessions stopped leaving my fingertips buzzy. The stock stabilizers are genuinely pre-tuned; my spacebar has zero rattle out of the box.',
    isVerified: true,
    photos: ['desk-setup', 'knob-detail'],
    helpful: 41,
  },
  {
    id: 'rv-02',
    author: 'Theo Marchetti',
    age: '1 week ago',
    ageRank: 2,
    rating: 4,
    title: 'Superb board, chunky footprint',
    text: 'Typing feel and the tri-mode switching are flawless. Just know that 1.9 kg of aluminum is a permanent desk resident, not a bag board — the weight is a feature until you try to move it.',
    isVerified: true,
    photos: [],
    helpful: 28,
  },
  {
    id: 'rv-03',
    author: 'Priya Sundaram',
    age: '1 week ago',
    ageRank: 3,
    rating: 5,
    title: 'Hot-swap saved my wallet twice',
    text: 'Swapped the stock linears for tactiles in twenty minutes, hated them, swapped back the same evening. No solder, no drama. VIA remapping meant my whole layout moved over in one export.',
    isVerified: true,
    photos: ['switch-swap'],
    helpful: 35,
  },
  {
    id: 'rv-04',
    author: 'Callum Reyes',
    age: '2 weeks ago',
    ageRank: 4,
    rating: 5,
    title: 'Battery claims actually undersell it',
    text: 'Six weeks on the dongle with RGB off before the first charge warning. I stopped thinking about the battery entirely, which is the highest praise a wireless board can earn.',
    isVerified: true,
    photos: [],
    helpful: 22,
  },
  {
    id: 'rv-05',
    author: 'Nadia Osei',
    age: '3 weeks ago',
    ageRank: 5,
    rating: 3,
    title: 'Great hardware, the software lags behind',
    text: 'The board itself is excellent, but VIA took me an evening of forum-diving to detect it on Linux. Once configured it has been rock solid — knock a star off for the setup friction, not the keyboard.',
    isVerified: true,
    photos: [],
    helpful: 19,
  },
  {
    id: 'rv-06',
    author: 'Jonas Lindqvist',
    age: '1 month ago',
    ageRank: 6,
    rating: 5,
    title: 'Quietest aluminum board I have owned',
    text: 'The foam sandwich kills the case ping completely. My open-plan desk neighbors went from complaining about my last board to asking what this one is.',
    isVerified: true,
    photos: ['side-profile'],
    helpful: 31,
  },
  {
    id: 'rv-07',
    author: 'Beatriz Fonseca',
    age: '1 month ago',
    ageRank: 7,
    rating: 4,
    title: 'Knob is more useful than expected',
    text: 'I mapped the knob to per-app volume and now I miss it on every other keyboard. Bluetooth host switching has a half-second pause that keeps this from a fifth star.',
    isVerified: false,
    photos: [],
    helpful: 14,
  },
  {
    id: 'rv-08',
    author: 'Owen Gallagher',
    age: '2 months ago',
    ageRank: 8,
    rating: 5,
    title: 'Bought for work, kept for everything',
    text: 'Three Bluetooth hosts cover my work laptop, personal desktop, and tablet. Fn+1/2/3 switching became muscle memory in a day. The double-shot caps show zero shine after two months.',
    isVerified: true,
    photos: ['three-hosts'],
    helpful: 17,
  },
  {
    id: 'rv-09',
    author: 'Mei-Ling Chao',
    age: '2 months ago',
    ageRank: 9,
    rating: 5,
    title: 'First custom-adjacent board, no regrets',
    text: 'I was intimidated by the enthusiast rabbit hole, but this ships tuned — nothing to lube, nothing to film. It sounds like the videos, which is apparently rare.',
    isVerified: true,
    photos: [],
    helpful: 26,
  },
  {
    id: 'rv-10',
    author: 'Stefan Brandt',
    age: '3 months ago',
    ageRank: 10,
    rating: 1,
    title: 'Mine arrived with a dead RGB column',
    text: 'Column of six LEDs dead on arrival. Support shipped a replacement PCB quickly and the new one is fine, but QC letting that through on a board at this price stings.',
    isVerified: true,
    photos: ['dead-leds'],
    helpful: 44,
  },
  {
    id: 'rv-11',
    author: 'Rosa Delgado',
    age: '3 months ago',
    ageRank: 11,
    rating: 4,
    title: 'Excellent typing, average feet',
    text: 'The fixed 6° angle is right for me but the rubber feet slide on a glass desk. A deskmat solved it. Everything above the feet is five-star hardware.',
    isVerified: false,
    photos: [],
    helpful: 9,
  },
  {
    id: 'rv-12',
    author: 'Anders Vik',
    age: '4 months ago',
    ageRank: 12,
    rating: 5,
    title: 'Replaced a board twice its price',
    text: 'I sold a boutique group-buy build after two weeks on the Tessera. The factory tuning is that close, and hot-swap means the gap will only shrink as I tinker.',
    isVerified: true,
    photos: ['family-photo', 'artisan-cap'],
    helpful: 38,
  },
];

const STAR_BANDS = [5, 4, 3, 2, 1] as const;

type SortId = 'recent' | 'highest' | 'lowest' | 'helpful';

const SORT_OPTIONS = [
  {value: 'recent', label: 'Most recent'},
  {value: 'highest', label: 'Highest rated'},
  {value: 'lowest', label: 'Lowest rated'},
  {value: 'helpful', label: 'Most helpful'},
];

type FeatureVariant = 'rows' | 'specs' | 'accordion';

// ============= HELPERS =============

/** Whole-dollar prices render without cents: $189 vs. $189.50. */
function formatPrice(value: number): string {
  return Number.isInteger(value) ? \`$\${value}\` : \`$\${value.toFixed(2)}\`;
}

/**
 * Deterministic feature art: each row composes a distinct layered
 * gradient/pattern stack from its fixed hue pair — keycap grids, an
 * exploded layer stack, or radiating signal arcs. No image assets.
 */
function featureArtStyle(row: FeatureRow): CSSProperties {
  const [h1, h2] = row.hues;
  const base = \`linear-gradient(150deg, hsl(\${h1}, 44%, 38%) 0%, hsl(\${h2}, 48%, 20%) 100%)\`;
  let layers: string[];
  switch (row.pattern) {
    case 'keys':
      // Keycap grid: two crossing repeating gradients read as rows of caps.
      layers = [
        \`repeating-linear-gradient(0deg, hsla(\${h1}, 55%, 80%, 0.22) 0 26px, transparent 26px 34px)\`,
        \`repeating-linear-gradient(90deg, hsla(\${h2}, 45%, 85%, 0.16) 0 34px, transparent 34px 42px)\`,
        \`radial-gradient(110% 80% at 25% 15%, hsla(\${h1}, 65%, 72%, 0.45), transparent 60%)\`,
        base,
      ];
      break;
    case 'stack':
      // Exploded stack: broad horizontal bands like separated layers.
      layers = [
        \`repeating-linear-gradient(180deg, hsla(\${h1}, 50%, 78%, 0.3) 0 18px, transparent 18px 44px)\`,
        \`radial-gradient(90% 70% at 70% 25%, hsla(\${h2}, 60%, 70%, 0.4), transparent 62%)\`,
        base,
      ];
      break;
    case 'signal':
      // Signal arcs: concentric radial rings off one corner. The rgba()
      // corner shade is part of the scheme-locked art (see Color policy),
      // not a UI scrim — it stays literal in both themes.
      layers = [
        \`repeating-radial-gradient(circle at 18% 22%, hsla(\${h1}, 60%, 82%, 0.28) 0 10px, transparent 10px 34px)\`,
        \`radial-gradient(120% 90% at 80% 85%, rgba(8, 8, 12, 0.5), transparent 70%)\`,
        base,
      ];
      break;
  }
  return {background: layers.join(', ')};
}

/** Photo chips reuse a small fixed hue wheel keyed by label length. */
function photoArtStyle(label: string): CSSProperties {
  const hue = (label.length * 47) % 360;
  return {
    background: \`linear-gradient(135deg, hsl(\${hue}, 45%, 46%) 0%, hsl(\${(hue + 40) % 360}, 50%, 26%) 100%)\`,
  };
}

function averageRating(reviews: ReadonlyArray<Review>): string {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1);
}

function bandCount(reviews: ReadonlyArray<Review>, stars: number): number {
  return reviews.filter(review => review.rating === stars).length;
}

function sortReviews(
  reviews: ReadonlyArray<Review>,
  sort: SortId,
): Review[] {
  const copy = [...reviews];
  switch (sort) {
    case 'recent':
      return copy.sort((a, b) => a.ageRank - b.ageRank);
    case 'highest':
      return copy.sort((a, b) => b.rating - a.rating || a.ageRank - b.ageRank);
    case 'lowest':
      return copy.sort((a, b) => a.rating - b.rating || a.ageRank - b.ageRank);
    case 'helpful':
      return copy.sort(
        (a, b) => b.helpful - a.helpful || a.ageRank - b.ageRank,
      );
  }
}

// ============= STICKY MINI HEADER =============

interface MiniHeaderProps {
  cartCount: number;
  averageLabel: string;
  reviewCount: number;
  isPhone: boolean;
  onAddToCart: () => void;
}

/**
 * The sticky product bar: thumb, name, price (+ compare-at), rating, and
 * an add-to-cart wired to the live cart count. Pins to the top of the
 * LayoutContent scroller so the buy action survives the whole page.
 */
function MiniHeader({
  cartCount,
  averageLabel,
  reviewCount,
  isPhone,
  onAddToCart,
}: MiniHeaderProps) {
  return (
    <div style={styles.miniBar}>
      <div style={styles.miniBarInner}>
        <HStack gap={3} vAlign="center">
          <div style={styles.miniThumb} aria-hidden>
            <Icon icon={KeyboardIcon} size="sm" color="inherit" />
          </div>
          <StackItem size="fill" style={styles.miniName}>
            <VStack gap={0}>
              <Text type="body" weight="semibold" maxLines={1}>
                {PRODUCT_NAME}
              </Text>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" weight="semibold">
                  {formatPrice(PRICE)}
                </Text>
                {!isPhone && (
                  <Text type="supporting" color="secondary" hasStrikethrough>
                    {formatPrice(COMPARE_AT)}
                  </Text>
                )}
                {!isPhone && (
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    ★ {averageLabel} · {reviewCount} reviews
                  </Text>
                )}
              </HStack>
            </VStack>
          </StackItem>
          {cartCount > 0 && (
            <Badge label={\`\${cartCount} in cart\`} variant="info" />
          )}
          <Button
            label={\`Add \${PRODUCT_NAME} to cart\`}
            variant="primary"
            size="sm"
            icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
            onClick={onAddToCart}
            style={styles.controlTouchWide}>
            {isPhone ? 'Add' : 'Add to cart'}
          </Button>
        </HStack>
      </div>
    </div>
  );
}

// ============= FEATURES: ALTERNATING ROWS =============

function FeatureRowsVariant({isStackedRows}: {isStackedRows: boolean}) {
  return (
    <VStack gap={6}>
      {FEATURE_ROWS.map((row, index) => (
        <div
          key={row.id}
          style={{
            ...styles.featureRow,
            ...(index % 2 === 1 ? styles.featureRowReverse : undefined),
            ...(isStackedRows ? styles.featureRowStacked : undefined),
          }}>
          <div style={styles.featureHalf}>
            <div style={styles.featureArtFrame}>
              <AspectRatio ratio={4 / 3}>
                <div style={{...styles.featureArt, ...featureArtStyle(row)}} />
              </AspectRatio>
            </div>
          </div>
          <div style={styles.featureHalf}>
            <VStack gap={2}>
              <Text type="label" color="secondary">
                {row.kicker}
              </Text>
              <Heading level={3}>{row.title}</Heading>
              <Text type="body">{row.body}</Text>
              <VStack gap={1}>
                {row.bullets.map(bullet => (
                  <HStack key={bullet} gap={2} vAlign="start">
                    <Icon icon={CheckIcon} size="sm" color="secondary" />
                    <StackItem size="fill">
                      <Text type="supporting" color="secondary">
                        {bullet}
                      </Text>
                    </StackItem>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </div>
        </div>
      ))}
    </VStack>
  );
}

// ============= FEATURES: TECH SPECS =============

function TechSpecsVariant({isStackedRows}: {isStackedRows: boolean}) {
  return (
    <VStack gap={4}>
      {/* Highlights callout: the four numbers that sell the board. */}
      <Card padding={4}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <Icon icon={SparklesIcon} size="sm" color="secondary" />
            <Text type="body" weight="semibold">
              Highlights
            </Text>
          </HStack>
          <div style={styles.highlightGrid}>
            {HIGHLIGHTS.map(highlight => (
              <div key={highlight.stat} style={styles.highlightChip}>
                <VStack gap={0}>
                  <Heading level={3}>{highlight.stat}</Heading>
                  <Text type="supporting" color="secondary">
                    {highlight.label}
                  </Text>
                </VStack>
              </div>
            ))}
          </div>
        </VStack>
      </Card>
      {/* Two-column definition table; single column when stacked. */}
      <div
        style={{
          ...styles.specGrid,
          ...(isStackedRows ? styles.specGridStacked : undefined),
        }}>
        {SPEC_GROUPS.map(group => (
          <Card key={group.id} padding={3}>
            <VStack gap={2}>
              <Text type="body" weight="semibold">
                {group.title}
              </Text>
              <MetadataList
                columns="single"
                label={{position: 'start', width: 118}}>
                {group.rows.map(row => (
                  <MetadataListItem key={row.label} label={row.label}>
                    <Text type="body">{row.value}</Text>
                  </MetadataListItem>
                ))}
              </MetadataList>
            </VStack>
          </Card>
        ))}
      </div>
    </VStack>
  );
}

// ============= FEATURES: ACCORDION + DIAGRAMS =============

/** Inline CSS diagrams — one per accordion feature, zero image assets. */
function FeatureDiagram({kind}: {kind: DiagramKind}) {
  switch (kind) {
    case 'stack':
      return (
        <VStack gap={1}>
          {STACK_LAYERS.map(layer => (
            <div
              key={layer.label}
              style={{
                ...styles.diagramLayer,
                width: \`\${layer.width}%\`,
                background: \`linear-gradient(90deg, hsl(\${layer.hue}, 45%, 42%), hsl(\${layer.hue}, 50%, 30%))\`,
              }}>
              {layer.label}
            </div>
          ))}
        </VStack>
      );
    case 'latency':
      return (
        <div style={styles.diagramChipRow}>
          {LATENCY_MODES.map(mode => (
            <div key={mode.id} style={styles.diagramChip}>
              <Icon icon={mode.icon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                {mode.label}
              </Text>
              <Text type="supporting" weight="semibold" hasTabularNumbers>
                {mode.value}
              </Text>
            </div>
          ))}
        </div>
      );
    case 'battery':
      return (
        <VStack gap={1}>
          <div
            style={styles.gaugeTrack}
            role="img"
            aria-label={\`Battery gauge: \${BATTERY_REMAINING_PCT}% remaining\`}>
            <div
              style={{
                ...styles.gaugeFill,
                width: \`\${BATTERY_REMAINING_PCT}%\`,
              }}
            />
          </div>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {BATTERY_REMAINING_PCT}% after 4 weeks of 8-hour days
          </Text>
        </VStack>
      );
    case 'spectrum':
      return (
        <div
          style={styles.spectrumBar}
          role="img"
          aria-label="RGB spectrum sweep from red through violet"
        />
      );
  }
}

function AccordionVariant({
  openIds,
  onToggle,
}: {
  openIds: string[];
  onToggle: (id: string, isOpen: boolean) => void;
}) {
  return (
    <VStack gap={3}>
      {ACCORDION_FEATURES.map(feature => {
        const isOpen = openIds.includes(feature.id);
        return (
          <Card key={feature.id} padding={3}>
            <Collapsible
              isOpen={isOpen}
              onOpenChange={next => onToggle(feature.id, next)}
              trigger={
                <HStack gap={2} vAlign="center">
                  <Text type="body" weight="semibold">
                    {feature.title}
                  </Text>
                  {!isOpen && (
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {feature.summary}
                    </Text>
                  )}
                </HStack>
              }>
              <VStack gap={3}>
                <Text type="body">{feature.body}</Text>
                <FeatureDiagram kind={feature.diagram} />
                <Text type="supporting" color="secondary">
                  {feature.diagramCaption}
                </Text>
              </VStack>
            </Collapsible>
          </Card>
        );
      })}
    </VStack>
  );
}

// ============= REVIEWS: SUMMARY PANEL =============

interface SummaryPanelProps {
  reviews: ReadonlyArray<Review>;
  starFilter: number | null;
  isPhone: boolean;
  isFormOpen: boolean;
  onStarFilter: (stars: number) => void;
  onWriteToggle: () => void;
}

/**
 * Average, verified share, and the star-distribution histogram. Every
 * bar row is a real button: clicking filters the list to that band and
 * clicking the active band again clears it (aria-pressed reflects it).
 */
function SummaryPanel({
  reviews,
  starFilter,
  isPhone,
  isFormOpen,
  onStarFilter,
  onWriteToggle,
}: SummaryPanelProps) {
  const verifiedCount = reviews.filter(review => review.isVerified).length;
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="end">
          <Heading level={2}>{averageRating(reviews)}</Heading>
          <Text type="supporting" color="secondary">
            out of 5
          </Text>
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {reviews.length} reviews · {verifiedCount} verified purchases
        </Text>
        <VStack gap={1}>
          {STAR_BANDS.map(stars => {
            const count = bandCount(reviews, stars);
            const pct = Math.round((count / reviews.length) * 100);
            const isActive = starFilter === stars;
            return (
              <button
                key={stars}
                type="button"
                aria-pressed={isActive}
                aria-label={
                  isActive
                    ? \`Clear the \${stars}-star filter\`
                    : \`Show only \${stars}-star reviews (\${count})\`
                }
                style={{
                  ...styles.histRow,
                  ...(isPhone ? styles.histRowTouch : undefined),
                  ...(isActive ? styles.histRowActive : undefined),
                }}
                onClick={() => onStarFilter(stars)}>
                <Text
                  type="supporting"
                  color="secondary"
                  hasTabularNumbers
                  style={styles.histStars}>
                  {stars}★
                </Text>
                <div style={styles.histTrack}>
                  <div style={{...styles.histFill, width: \`\${pct}%\`}} />
                </div>
                <Text
                  type="supporting"
                  color="secondary"
                  hasTabularNumbers
                  style={styles.histCount}>
                  {count}
                </Text>
              </button>
            );
          })}
        </VStack>
        <Divider />
        <Button
          label={isFormOpen ? 'Close the review form' : 'Write a review'}
          variant={isFormOpen ? 'secondary' : 'primary'}
          icon={
            <Icon
              icon={isFormOpen ? XIcon : PenLineIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={onWriteToggle}
          style={styles.controlTouchWide}>
          {isFormOpen ? 'Close form' : 'Write a review'}
        </Button>
      </VStack>
    </Card>
  );
}

// ============= REVIEWS: WRITE-A-REVIEW FORM =============

interface ReviewDraft {
  rating: number;
  title: string;
  body: string;
  name: string;
}

interface DraftErrors {
  rating?: string;
  title?: string;
  body?: string;
  name?: string;
}

const EMPTY_DRAFT: ReviewDraft = {rating: 0, title: '', body: '', name: ''};

function validateDraft(draft: ReviewDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (draft.rating === 0) {
    errors.rating = 'Pick a star rating first.';
  }
  if (draft.title.trim().length < 4) {
    errors.title = 'Give your review a short headline (4+ characters).';
  }
  if (draft.body.trim().length < 20) {
    errors.body = 'Tell other buyers a bit more (20+ characters).';
  }
  if (draft.name.trim().length === 0) {
    errors.name = 'Add a display name.';
  }
  return errors;
}

function WriteReviewForm({
  draft,
  errors,
  onDraftChange,
  onSubmit,
  onCancel,
}: {
  draft: ReviewDraft;
  errors: DraftErrors;
  onDraftChange: (draft: ReviewDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Text type="body" weight="semibold">
          Write a review — {PRODUCT_NAME}
        </Text>
        {/* Star picker: five 40px buttons; click or keyboard, no hover. */}
        <VStack gap={1}>
          <Text type="label">Your rating</Text>
          <HStack gap={0} vAlign="center">
            {[1, 2, 3, 4, 5].map(stars => (
              <button
                key={stars}
                type="button"
                aria-label={\`Rate \${stars} \${stars === 1 ? 'star' : 'stars'}\`}
                aria-pressed={draft.rating >= stars}
                style={{
                  ...styles.starBtn,
                  ...(draft.rating >= stars
                    ? styles.starBtnActive
                    : undefined),
                }}
                onClick={() => onDraftChange({...draft, rating: stars})}>
                ★
              </button>
            ))}
            {draft.rating > 0 && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {draft.rating} of 5
              </Text>
            )}
          </HStack>
          {errors.rating != null && (
            <Text type="supporting" style={styles.errorText}>
              {errors.rating}
            </Text>
          )}
        </VStack>
        <FormLayout>
          <TextInput
            label="Headline"
            placeholder="Sum it up in one line"
            value={draft.title}
            onChange={title => onDraftChange({...draft, title})}
            isRequired
            status={
              errors.title != null
                ? {type: 'error', message: errors.title}
                : undefined
            }
            width="100%"
          />
          <TextArea
            label="Your review"
            placeholder="What should other buyers know about the typing feel, battery, or build?"
            value={draft.body}
            onChange={body => onDraftChange({...draft, body})}
            rows={4}
            width="100%"
          />
          {errors.body != null && (
            <Text type="supporting" style={styles.errorText}>
              {errors.body}
            </Text>
          )}
          <TextInput
            label="Display name"
            placeholder="e.g. Jordan R."
            value={draft.name}
            onChange={name => onDraftChange({...draft, name})}
            isRequired
            status={
              errors.name != null
                ? {type: 'error', message: errors.name}
                : undefined
            }
            width="100%"
          />
        </FormLayout>
        <HStack gap={2}>
          <Button
            label="Submit review"
            variant="primary"
            onClick={onSubmit}
            style={styles.controlTouchWide}>
            Submit review
          </Button>
          <Button
            label="Cancel writing a review"
            variant="secondary"
            onClick={onCancel}
            style={styles.controlTouchWide}>
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= REVIEWS: LIST =============

function ReviewRow({
  review,
  hasVoted,
  isPhone,
  onHelpfulVote,
}: {
  review: Review;
  hasVoted: boolean;
  isPhone: boolean;
  onHelpfulVote: (id: string) => void;
}) {
  const helpfulCount = review.helpful + (hasVoted ? 1 : 0);
  return (
    <VStack gap={1} style={styles.reviewBody}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Badge
          variant={review.rating >= 4 ? 'green' : 'neutral'}
          label={\`★ \${review.rating.toFixed(1)}\`}
        />
        <Text type="body" weight="semibold">
          {review.author}
        </Text>
        <Text type="supporting" color="secondary">
          {review.age}
        </Text>
        {review.isVerified && (
          <Badge
            variant="info"
            label="Verified purchase"
            icon={<Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />}
          />
        )}
      </HStack>
      <Text type="body" weight="semibold">
        {review.title}
      </Text>
      <Text type="body">{review.text}</Text>
      {review.photos.length > 0 && (
        <div style={styles.photoRow}>
          {review.photos.map(photo => (
            <div key={photo} style={styles.photoChip}>
              <div style={{...styles.photoArt, ...photoArtStyle(photo)}}>
                <Icon icon={CameraIcon} size="sm" color="inherit" />
              </div>
              <div style={styles.photoLabel}>{photo}</div>
            </div>
          ))}
        </div>
      )}
      <HStack gap={2} vAlign="center">
        {/* One vote per review: after voting the button reads "Helpful ·
            voted" and further clicks are no-ops (never decrements). */}
        <Button
          label={
            hasVoted
              ? \`You marked the review by \${review.author} helpful\`
              : \`Mark the review by \${review.author} helpful\`
          }
          variant="secondary"
          size="sm"
          icon={
            <Icon
              icon={hasVoted ? CheckIcon : ThumbsUpIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => onHelpfulVote(review.id)}
          style={isPhone ? styles.controlTouchWide : undefined}>
          {hasVoted ? 'Voted' : 'Helpful'}
        </Button>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {helpfulCount} found this helpful
        </Text>
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function ProductFeaturesReviewsTemplate() {
  // Features region.
  const [featureVariant, setFeatureVariant] = useState<FeatureVariant>('rows');
  const [openAccordionIds, setOpenAccordionIds] = useState<string[]>([
    ACCORDION_FEATURES[0].id,
  ]);

  // Reviews region.
  const [reviews, setReviews] = useState<Review[]>([...REVIEWS]);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortId>('recent');
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>(EMPTY_DRAFT);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [submittedCount, setSubmittedCount] = useState(0);

  // Commerce chrome.
  const [cartCount, setCartCount] = useState(0);

  // Responsive contract: <=960px the reviews summary stacks above the
  // list; <=768px feature rows and spec groups go single column; <=640px
  // the mini bar compacts and controls take 40px tap targets.
  const isReviewsStacked = useMediaQuery('(max-width: 960px)');
  const isStackedRows = useMediaQuery('(max-width: 768px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ----- Handlers -----

  const handleAccordionToggle = (id: string, isOpen: boolean) => {
    setOpenAccordionIds(previous =>
      isOpen ? [...previous, id] : previous.filter(value => value !== id),
    );
  };

  /** Clicking the active band again clears the filter. */
  const handleStarFilter = (stars: number) => {
    setStarFilter(previous => (previous === stars ? null : stars));
  };

  /** One-way vote: increments once and never decrements. */
  const handleHelpfulVote = (id: string) => {
    setVotedIds(previous =>
      previous.includes(id) ? previous : [...previous, id],
    );
  };

  const handleDraftChange = (next: ReviewDraft) => {
    setDraft(next);
    // Live-clear errors the user has fixed; never add new ones mid-typing.
    setDraftErrors(previous => {
      const stillFailing = validateDraft(next);
      return {
        rating: previous.rating != null ? stillFailing.rating : undefined,
        title: previous.title != null ? stillFailing.title : undefined,
        body: previous.body != null ? stillFailing.body : undefined,
        name: previous.name != null ? stillFailing.name : undefined,
      };
    });
  };

  const handleSubmitReview = () => {
    const errors = validateDraft(draft);
    if (
      errors.rating != null ||
      errors.title != null ||
      errors.body != null ||
      errors.name != null
    ) {
      setDraftErrors(errors);
      return;
    }
    const nextIndex = submittedCount + 1;
    const newReview: Review = {
      id: \`rv-user-\${nextIndex}\`,
      author: draft.name.trim(),
      age: 'Just now',
      // Newer than every fixture so the recent sort tops it.
      ageRank: -nextIndex,
      rating: draft.rating,
      title: draft.title.trim(),
      text: draft.body.trim(),
      isVerified: false,
      photos: [],
      helpful: 0,
    };
    setReviews(previous => [newReview, ...previous]);
    setSubmittedCount(nextIndex);
    setDraft(EMPTY_DRAFT);
    setDraftErrors({});
    setIsFormOpen(false);
    // Surface the new review immediately: recent sort, no star filter.
    setSort('recent');
    setStarFilter(null);
  };

  const handleWriteToggle = () => {
    setIsFormOpen(previous => !previous);
    setDraftErrors({});
  };

  // ----- Derived review list: filter, then sort -----

  const filtered =
    starFilter == null
      ? reviews
      : reviews.filter(review => review.rating === starFilter);
  const visibleReviews = sortReviews(filtered, sort);

  // ----- Header: breadcrumbs (shortened on phones) -----

  const trail = isPhone
    ? [BREADCRUMB_TRAIL[BREADCRUMB_TRAIL.length - 1], PRODUCT_NAME]
    : [...BREADCRUMB_TRAIL, PRODUCT_NAME];

  // ----- Features region -----

  const activeVariant: ReactNode =
    featureVariant === 'rows' ? (
      <FeatureRowsVariant isStackedRows={isStackedRows} />
    ) : featureVariant === 'specs' ? (
      <TechSpecsVariant isStackedRows={isStackedRows} />
    ) : (
      <AccordionVariant
        openIds={openAccordionIds}
        onToggle={handleAccordionToggle}
      />
    );

  const featuresRegion = (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>Why the {PRODUCT_NAME}</Heading>
            <Text type="supporting" color="secondary">
              {BRAND_NAME} · Style {STYLE_CODE}
            </Text>
          </VStack>
        </StackItem>
        <SegmentedControl
          value={featureVariant}
          onChange={value => setFeatureVariant(value as FeatureVariant)}
          label="Feature presentation"
          size="sm"
          style={isPhone ? styles.fullWidth : undefined}>
          <SegmentedControlItem value="rows" label="Story" />
          <SegmentedControlItem value="specs" label="Tech specs" />
          <SegmentedControlItem value="accordion" label="Deep dive" />
        </SegmentedControl>
      </HStack>
      {activeVariant}
    </VStack>
  );

  // ----- Reviews region -----

  const summaryPanel = (
    <SummaryPanel
      reviews={reviews}
      starFilter={starFilter}
      isPhone={isPhone}
      isFormOpen={isFormOpen}
      onStarFilter={handleStarFilter}
      onWriteToggle={handleWriteToggle}
    />
  );

  const listToolbar = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <StackItem size="fill">
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {starFilter == null
            ? \`Showing all \${visibleReviews.length} reviews\`
            : \`Showing \${visibleReviews.length} of \${reviews.length} reviews\`}
        </Text>
      </StackItem>
      {/* The clear-filter chip: combines with (and survives) any sort. */}
      {starFilter != null && (
        <Button
          label={\`Clear the \${starFilter}-star filter\`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          onClick={() => setStarFilter(null)}
          style={isPhone ? styles.controlTouchWide : undefined}>
          {starFilter}★ only
        </Button>
      )}
      <Selector
        label="Sort reviews"
        isLabelHidden
        size="sm"
        options={SORT_OPTIONS}
        value={sort}
        onChange={value => setSort(value as SortId)}
        width={isPhone ? '100%' : 200}
      />
    </HStack>
  );

  const reviewList =
    visibleReviews.length === 0 ? (
      <EmptyState
        isCompact
        icon={<Icon icon={StarIcon} size="lg" color="secondary" />}
        title={\`No \${starFilter ?? 0}-star reviews yet\`}
        description="Nobody has rated the board in this band. Clear the filter to read the rest, or be the first to write one."
        actions={
          <Button
            label="Clear the star filter"
            variant="primary"
            onClick={() => setStarFilter(null)}>
            Clear filter
          </Button>
        }
      />
    ) : (
      <VStack gap={4}>
        {visibleReviews.map((review, index) => (
          <VStack key={review.id} gap={4}>
            {index > 0 && <Divider />}
            <ReviewRow
              review={review}
              hasVoted={votedIds.includes(review.id)}
              isPhone={isPhone}
              onHelpfulVote={handleHelpfulVote}
            />
          </VStack>
        ))}
      </VStack>
    );

  const listColumn = (
    <VStack gap={4}>
      {isFormOpen && (
        <WriteReviewForm
          draft={draft}
          errors={draftErrors}
          onDraftChange={handleDraftChange}
          onSubmit={handleSubmitReview}
          onCancel={handleWriteToggle}
        />
      )}
      {listToolbar}
      {reviewList}
    </VStack>
  );

  const reviewsRegion = (
    <VStack gap={4}>
      <Heading level={2}>Reviews</Heading>
      {isReviewsStacked ? (
        <VStack gap={4}>
          {summaryPanel}
          {listColumn}
        </VStack>
      ) : (
        <div style={styles.reviewColumns}>
          <div style={styles.summaryCol}>{summaryPanel}</div>
          <div style={styles.listCol}>{listColumn}</div>
        </div>
      )}
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <Breadcrumbs variant="supporting" label="Catalog path">
            {trail.map((segment, index) => (
              <BreadcrumbItem
                key={\`\${index}-\${segment}\`}
                isCurrent={index === trail.length - 1}
                onClick={index === trail.length - 1 ? undefined : () => {}}>
                {segment}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} label="Product features and reviews">
          <MiniHeader
            cartCount={cartCount}
            averageLabel={averageRating(reviews)}
            reviewCount={reviews.length}
            isPhone={isPhone}
            onAddToCart={() => setCartCount(previous => previous + 1)}
          />
          <div style={styles.wrapper}>
            <VStack gap={6}>
              {featuresRegion}
              <Divider />
              {reviewsRegion}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};