var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (Relay brand bento cells — a
 *   sub-50ms webhook performance hero with a p50/p75/p90/p99 latency bar
 *   list, a SOC 2 security callout with capability Tokens, three
 *   five-logo integration sets built from CSS monogram tiles, a CSS-drawn
 *   phone preview, a customer testimonial, a 12-bar throughput schematic,
 *   a six-line deploy terminal transcript, and paired quarter/all-time
 *   big-number stats — no network assets, no clocks, no randomness)
 * @output Marketing bento-grid showcase in three labeled variants stacked
 *   down one page column: (1) a light 3-column asymmetric grid with a 2x2
 *   performance hero, a tall phone-preview cell, security and integrations
 *   cells, and a full-width testimonial; (2) a dark 5-cell variant whose
 *   cells inset schematic UI mocks — a mini throughput bar chart, a deploy
 *   terminal with a working Replay that re-types the transcript, and a
 *   dark mobile frame — plus zero-trust copy and a scale stat; (3) a
 *   compact 4-cell variant with big-number stats in two cells behind a
 *   This quarter / All time period toggle, an edge-network copy cell, and
 *   a CTA cell. Hovering or keyboard-focusing a cell lifts it and reveals
 *   its Learn more affordance (always visible on phones); clicking the
 *   integrations cell cycles through three logo sets; a density toggle
 *   flips the first variant between roomy and compact gaps; and a sticky
 *   jump rail scroll-spies the three variants via IntersectionObserver.
 *   Every Learn more and CTA fires a corner Toast naming its cell so the
 *   wiring is provable.
 * @position Page template; emitted by \`astryx template marketing-bento-grid\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the showcase title
 * plus a live "Viewing: <variant>" readout that mirrors the scroll-spy.
 * LayoutContent (padding 0) scrolls the document: a sticky jump rail pins
 * to the top of the scroll region, and below it a centered 1040px column
 * stacks the three labeled variant sections. The Toast sits fixed
 * bottom-right above everything.
 *
 * Interaction contract:
 * - The jump rail's three 40px pills scroll smoothly to their variant
 *   sections (scrollMarginTop keeps headings clear of the rail) and an
 *   IntersectionObserver band around the viewport center highlights the
 *   pill for whichever variant is in view.
 * - Hover OR focus-within lifts a cell (translateY + shadow) and fades in
 *   its Learn more button; the button is always in the tab order, so
 *   keyboard users reveal it by tabbing to it — never hover-only. At
 *   <=640px the affordance is simply always visible. Learn more fires a
 *   Toast naming the cell.
 * - The integrations cell is a real <button>: click / Enter / Space cycle
 *   Set 1 → 2 → 3 → 1, the monogram tiles swap, and a "Set n of 3"
 *   caption plus a Toast confirm each cycle.
 * - The density ToggleButton switches variant 1 between roomy (20px gaps,
 *   spacious cell padding) and compact (10px gaps, tighter padding).
 * - The dark terminal's Replay button re-types the fixed transcript one
 *   line per tick from a deterministic fixture — only cadence is runtime.
 * - Variant 3's This quarter / All time buttons swap both big-number
 *   stats between fixed fixture pairs; the CTA cell's button toasts.
 *
 * Responsive contract:
 * - >1024px: variant 1 is a 3-column asymmetric grid (hero 2x2, phone
 *   preview 1x2, security 1, integrations 2, testimonial full-width);
 *   variant 2 is a 6-track grid (two 3-track cells over three 2-track
 *   cells); variant 3 is 2x2.
 * - 761–1024px: same shapes — cells are fluid (minmax(0,1fr) tracks) and
 *   simply narrow; the phone mock and terminal shrink with their cells.
 * - <=760px: variants 1 and 2 collapse to a single column in source
 *   order (hero, phone, security, integrations, testimonial / chart,
 *   terminal, frame, zero-trust, scale).
 * - <=640px: variant 3 drops to one column, the jump rail scrolls
 *   horizontally inside the sticky bar instead of wrapping, headline
 *   sizes step down, and every Learn more affordance renders visible so
 *   no interaction depends on hover. All chrome rows are wrap="wrap" and
 *   the page holds at 375px with no overflow-x.
 * - Tap targets: jump pills are explicit 40px-tall buttons, the
 *   integrations cell is one large button, and Learn more buttons are
 *   full Buttons with labels; Toast dismissal is a labeled control.
 *
 * Container policy (marketing-showcase archetype): frame-first page
 * chrome; each bento cell is a painted panel (border + radius + gradient
 * washes) rather than a Card so hover lift and grid placement stay in one
 * styles object. Dark-variant surfaces lock literal fixture gradients via
 * colorScheme:'dark' so they read identically in light and dark app
 * themes. All art is layered CSS — monogram tiles, bar charts, phone
 * frames, and the terminal are divs and spans, never images.
 *
 * Color policy: three families of surfaces are deliberately scheme-locked
 * and keep literal colors — (1) the dark variant-2 panel, its cells, the
 * terminal, chips, and the dark phone mock (colorScheme:'dark' on
 * cellDark/darkPanel, inherited by their insets) so the painted dark
 * fixture reads identically in both app themes; (2) the brand-gradient
 * phone-mock header (colorScheme:'dark', white label on a saturated
 * purple→sky wash); (3) the integration monogram tiles, whose fixture
 * brand colors and white monograms are brand-locked. Everything else —
 * brand accent discs, hero washes, latency/status fills, the lift
 * shadow — uses Astryx tokens or explicit light-dark() pairs that keep
 * the light appearance exact and supply brighter dark equivalents.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Toast} from '@astryxdesign/core/Toast';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  BlocksIcon,
  GaugeIcon,
  GlobeIcon,
  LockIcon,
  PlayIcon,
  QuoteIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  TerminalIcon,
  TrendingUpIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= PAINT CONSTANTS =============
// Painted dark surfaces use literal fixture colors locked with
// colorScheme:'dark' so the cells read identically in both app themes.

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.6)';
const DARK_CELL_BG = 'rgba(255, 255, 255, 0.05)';
const DARK_CELL_BORDER = 'rgba(255, 255, 255, 0.14)';
const CHIP_BG = 'rgba(255, 255, 255, 0.12)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.22)';
const TERMINAL_GREEN = '#6EE7B7';
const TERMINAL_DIM = 'rgba(148, 163, 184, 0.9)';

// Brand accents that sit on token (scheme-flipping) surfaces use explicit
// light-dark() pairs: light values unchanged, dark values brightened so
// hue and contrast intent survive the flip.
const BRAND_PURPLE = 'light-dark(#7C3AED, #A78BFA)';
const BRAND_PURPLE_TINT =
  'light-dark(rgba(124, 58, 237, 0.12), rgba(167, 139, 250, 0.16))';
const BRAND_SKY = 'light-dark(#0EA5E9, #38BDF8)';
const BRAND_SKY_TINT =
  'light-dark(rgba(14, 165, 233, 0.12), rgba(56, 189, 248, 0.16))';
const BRAND_GREEN = 'light-dark(#16A34A, #4ADE80)';
const BRAND_GREEN_TINT =
  'light-dark(rgba(22, 163, 74, 0.12), rgba(74, 222, 128, 0.16))';
const BRAND_ORANGE = 'light-dark(#EA580C, #FB923C)';
const BRAND_ORANGE_TINT =
  'light-dark(rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.16))';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Document column: 1040px cap with page gutters.
  column: {
    width: '100%',
    maxWidth: 1040,
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
  // ---- sticky jump rail ----
  railWrap: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
  },
  rail: {
    maxWidth: 1040,
    marginInline: 'auto',
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
    padding: 'var(--spacing-2) var(--spacing-6)',
    boxSizing: 'border-box',
    overflowX: 'auto',
  },
  railCompact: {
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  // 40px tap-target pill; the active pill picks up the accent ring.
  railPill: {
    height: 40,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    borderRadius: 999,
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    flexShrink: 0,
  },
  railPillActive: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
  },
  // ---- variant sections ----
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    // Keep jumped-to headings clear of the sticky rail.
    scrollMarginTop: 72,
  },
  // ---- generic bento cell ----
  cell: {
    position: 'relative',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minWidth: 0,
    transition: 'transform 160ms ease, box-shadow 160ms ease',
  },
  cellLifted: {
    transform: 'translateY(-3px)',
    boxShadow:
      'var(--shadow-high, 0 12px 28px ' +
      'light-dark(rgba(15, 23, 42, 0.16), rgba(0, 0, 0, 0.55)))',
  },
  cellDark: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    border: \`1px solid \${DARK_CELL_BORDER}\`,
    backgroundColor: DARK_CELL_BG,
  },
  learnMore: {
    marginTop: 'auto',
    transition: 'opacity 160ms ease',
    alignSelf: 'flex-start',
  },
  iconDisc: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // ---- variant 1: light asymmetric grid ----
  gridA: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gridAutoRows: 'minmax(120px, auto)',
  },
  gridStacked: {
    display: 'flex',
    flexDirection: 'column',
  },
  heroWash: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(70% 60% at 100% 0%, ' +
        'light-dark(rgba(124, 58, 237, 0.10), rgba(167, 139, 250, 0.12)), ' +
        'transparent 60%)',
      'radial-gradient(60% 55% at 0% 100%, ' +
        'light-dark(rgba(14, 165, 233, 0.08), rgba(56, 189, 248, 0.10)), ' +
        'transparent 55%)',
    ].join(', '),
    pointerEvents: 'none',
  },
  heroHeadline: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 23,
  },
  latencyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  latencyLabel: {
    width: 34,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  latencyTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    minWidth: 0,
  },
  latencyFill: {
    height: '100%',
    borderRadius: 5,
    backgroundImage: \`linear-gradient(90deg, \${BRAND_PURPLE}, \${BRAND_SKY})\`,
  },
  latencyValue: {
    width: 48,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // Integrations cell renders as one large button so cycling works by
  // tap, Enter, and Space with a single native control.
  integrationsButton: {
    font: 'inherit',
    textAlign: 'left',
    color: 'inherit',
    cursor: 'pointer',
  },
  logoRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  // Scheme-locked (see Color policy): fixture brand tile colors and white
  // monograms stay literal in both app themes.
  logoTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.01em',
    flexShrink: 0,
  },
  // ---- CSS phone frames (light preview + dark schematic) ----
  phoneFrame: {
    width: '100%',
    maxWidth: 168,
    marginInline: 'auto',
    borderRadius: 24,
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 8,
    boxSizing: 'border-box',
  },
  phoneNotch: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-border)',
    marginInline: 'auto',
    marginBottom: 8,
  },
  phoneScreen: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    overflow: 'hidden',
  },
  // Scheme-locked (see Color policy): brand gradient art with a literal
  // white label; identical in both app themes.
  phoneHeader: {
    height: 44,
    colorScheme: 'dark',
    backgroundImage: 'linear-gradient(120deg, #7C3AED, #0EA5E9)',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 700,
  },
  phoneBody: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  phoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  phoneDot: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    flexShrink: 0,
  },
  phoneBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    flex: 1,
    minWidth: 0,
  },
  // Scheme-locked (see Color policy): the dark phone mock renders only
  // inside a colorScheme:'dark' cell, so its literals never flip.
  phoneFrameDark: {
    colorScheme: 'dark',
    border: \`1.5px solid \${DARK_CELL_BORDER}\`,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  phoneScreenDark: {
    border: \`1px solid \${DARK_CELL_BORDER}\`,
    backgroundColor: '#0B1220',
  },
  phoneBarDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    border: \`1px solid \${DARK_CELL_BORDER}\`,
  },
  // ---- variant 2: dark panel + schematic grids ----
  darkPanel: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 20,
    backgroundImage: [
      'radial-gradient(70% 70% at 92% 0%, rgba(124, 58, 237, 0.30), transparent 55%)',
      'radial-gradient(60% 70% at 0% 100%, rgba(14, 165, 233, 0.18), transparent 52%)',
      'linear-gradient(180deg, #0B1220 0%, #111827 100%)',
    ].join(', '),
    padding: 'var(--spacing-6)',
  },
  darkPanelCompact: {
    padding: 'var(--spacing-4)',
  },
  gridB: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    height: 96,
  },
  // Scheme-locked (see Color policy): brand gradient bars on the
  // colorScheme:'dark' panel.
  chartBar: {
    flex: 1,
    minWidth: 0,
    borderRadius: 4,
    backgroundImage: 'linear-gradient(180deg, #38BDF8, #6366F1)',
  },
  // Scheme-locked (see Color policy): terminal-dark inset on the
  // colorScheme:'dark' panel.
  terminal: {
    borderRadius: 10,
    border: \`1px solid \${DARK_CELL_BORDER}\`,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    padding: '12px 14px',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.7,
    minHeight: 128,
    overflowX: 'auto',
  },
  terminalLine: {
    margin: 0,
    whiteSpace: 'pre',
    color: DARK_TEXT_SOFT,
  },
  bigStatValue: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
  },
  bigStatValueCompact: {
    fontSize: 32,
  },
  darkChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    border: \`1px solid \${CHIP_BORDER}\`,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-start',
  },
  // ---- variant 3: compact stats grid ----
  gridC: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
  },
  gridCStacked: {
    gridTemplateColumns: 'minmax(0, 1fr)',
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
// Deterministic fixtures for the Relay brand: fixed copy, fixed series,
// fixed logo sets. No Date.now, no randomness, no network assets.

type VariantId = 'asymmetric' | 'dark' | 'stats';

interface VariantMeta {
  id: VariantId;
  /** Jump-rail pill label. */
  label: string;
  /** Section kicker Token. */
  kicker: string;
  title: string;
  description: string;
}

const VARIANTS: readonly VariantMeta[] = [
  {
    id: 'asymmetric',
    label: 'Asymmetric hero',
    kicker: 'Variant 1',
    title: '3-column asymmetric grid',
    description:
      'A 2x2 performance hero anchors the grid; a tall phone preview, ' +
      'security and integrations cells, and a full-width testimonial fill ' +
      'the rest. Use the density toggle to compare gap treatments.',
  },
  {
    id: 'dark',
    label: 'Dark schematic',
    kicker: 'Variant 2',
    title: 'Dark 5-cell with UI mocks',
    description:
      'Five cells on one painted dark panel, each inset with a schematic ' +
      'product mock — a throughput chart, a deploy terminal you can ' +
      'replay, and a dark mobile frame.',
  },
  {
    id: 'stats',
    label: 'Compact stats',
    kicker: 'Variant 3',
    title: 'Compact 4-cell with big numbers',
    description:
      'Two big-number stat cells behind a period toggle, one network ' +
      'copy cell, and one CTA cell — the tightest bento shape that still ' +
      'reads as a section.',
  },
];

// Hero latency fixture: percentile bars scale against the p99 value.
const LATENCY_ROWS: readonly {percentile: string; ms: number}[] = [
  {percentile: 'p50', ms: 12},
  {percentile: 'p75', ms: 21},
  {percentile: 'p90', ms: 34},
  {percentile: 'p99', ms: 48},
];
const LATENCY_MAX_MS = 48;

const SECURITY_TOKENS: readonly string[] = ['SSO', 'Encrypted', 'Audit logs'];

// Three integration logo sets — CSS monogram tiles, cycled by clicking
// the integrations cell. Fixed brand-agnostic fixtures; tile backgrounds
// are brand-locked literals (see Color policy) rendered on the
// colorScheme:'dark' logoTile style.
interface LogoFixture {
  name: string;
  monogram: string;
  background: string;
}

const LOGO_SETS: readonly {label: string; logos: readonly LogoFixture[]}[] = [
  {
    label: 'Data & warehouses',
    logos: [
      {name: 'Snowfort', monogram: 'Sf', background: '#0EA5E9'},
      {name: 'BigQuarry', monogram: 'Bq', background: '#4285F4'},
      {name: 'Redshirt', monogram: 'Rs', background: '#DC2626'},
      {name: 'Lakehaus', monogram: 'Lh', background: '#0D9488'},
      {name: 'DuckPond', monogram: 'Dp', background: '#F59E0B'},
    ],
  },
  {
    label: 'Messaging & queues',
    logos: [
      {name: 'Kafkaesque', monogram: 'Kf', background: '#111827'},
      {name: 'RabbitRun', monogram: 'Rr', background: '#F97316'},
      {name: 'PubSubHub', monogram: 'Ps', background: '#7C3AED'},
      {name: 'QueueCraft', monogram: 'Qc', background: '#16A34A'},
      {name: 'StreamLine', monogram: 'Sl', background: '#DB2777'},
    ],
  },
  {
    label: 'Ops & alerting',
    logos: [
      {name: 'PagerParty', monogram: 'Pp', background: '#059669'},
      {name: 'Slacker', monogram: 'Sk', background: '#4A154B'},
      {name: 'OpsGeneral', monogram: 'Og', background: '#2563EB'},
      {name: 'Grafite', monogram: 'Gr', background: '#EA580C'},
      {name: 'Sentrix', monogram: 'Sx', background: '#8B5CF6'},
    ],
  },
];

// Light phone preview: delivery-feed rows (dot color + bar width). The
// preview screen flips with the app theme, so dots carry light-dark()
// pairs (light values unchanged, brightened dark equivalents).
const PHONE_DOT_OK = 'light-dark(#34D399, #6EE7B7)';
const PHONE_DOT_WARN = 'light-dark(#FBBF24, #FCD34D)';
const PHONE_ROWS: readonly {dot: string; width: string}[] = [
  {dot: PHONE_DOT_OK, width: '84%'},
  {dot: PHONE_DOT_OK, width: '68%'},
  {dot: PHONE_DOT_WARN, width: '76%'},
  {dot: PHONE_DOT_OK, width: '58%'},
  {dot: PHONE_DOT_OK, width: '72%'},
];

const TESTIMONIAL = {
  quote:
    'We replaced a week of glue code with Relay in one afternoon. ' +
    'Webhooks stopped being the scary part of our stack.',
  name: 'Dana Okafor',
  role: 'Platform lead, Fieldnote',
};

// Dark variant: 12-bar throughput schematic, heights in percent.
const THROUGHPUT_BARS: readonly number[] = [
  34, 48, 42, 56, 50, 64, 58, 72, 66, 78, 74, 86,
];

// Deploy terminal transcript — Replay re-types these lines in order.
const TERMINAL_LINES: readonly {text: string; tone: 'cmd' | 'ok' | 'dim'}[] = [
  {text: '$ relay deploy --prod', tone: 'cmd'},
  {text: 'Bundling 3 handlers…', tone: 'dim'},
  {text: '✓ Edge bundle 148 kB', tone: 'ok'},
  {text: '✓ Routes verified (12)', tone: 'ok'},
  {text: '✓ Live at relay.dev/hooks', tone: 'ok'},
  {text: 'Done in 1.9s', tone: 'dim'},
];

// Compact variant: big-number pairs keyed by the period toggle.
type StatPeriod = 'quarter' | 'alltime';

const BIG_STATS: readonly {
  id: string;
  label: string;
  values: Record<StatPeriod, string>;
  caption: Record<StatPeriod, string>;
}[] = [
  {
    id: 'uptime',
    label: 'Delivery uptime',
    values: {quarter: '99.99%', alltime: '99.97%'},
    caption: {
      quarter: 'Q2 2026, all regions',
      alltime: 'Since launch, all regions',
    },
  },
  {
    id: 'events',
    label: 'Events delivered',
    values: {quarter: '1.2B', alltime: '9.8B'},
    caption: {
      quarter: 'Q2 2026 volume',
      alltime: 'Lifetime volume',
    },
  },
];

// ============= SMALL PIECES =============

/** Section header: kicker Token + title + supporting copy, with an
 * optional trailing control slot (variant 1 mounts the density toggle). */
function SectionHeader({
  kicker,
  title,
  description,
  trailing,
}: {
  kicker: string;
  title: string;
  description: string;
  trailing?: ReactNode;
}) {
  return (
    <HStack gap={3} vAlign="start" wrap="wrap">
      <StackItem size="fill">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={2}>{title}</Heading>
            <Token label={kicker} size="sm" color="purple" />
          </HStack>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        </VStack>
      </StackItem>
      {trailing}
    </HStack>
  );
}

/**
 * Generic bento cell: hover or focus-within lifts the panel and fades in
 * the Learn more affordance. The Learn more button is always rendered and
 * always tabbable — keyboard focus reveals it, and on phones it is simply
 * always visible, so nothing here is hover-only.
 */
function BentoCell({
  tone,
  padding,
  placement,
  learnMoreTopic,
  onLearnMore,
  alwaysShowLearnMore,
  children,
}: {
  tone: 'light' | 'dark';
  padding: number;
  placement?: CSSProperties;
  learnMoreTopic?: string;
  onLearnMore?: (topic: string) => void;
  alwaysShowLearnMore?: boolean;
  children: ReactNode;
}) {
  const [isLifted, setIsLifted] = useState(false);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsLifted(false);
    }
  };

  const showLearnMore =
    learnMoreTopic !== undefined && (isLifted || alwaysShowLearnMore === true);

  return (
    <div
      style={{
        ...styles.cell,
        ...(tone === 'dark' ? styles.cellDark : null),
        ...(isLifted ? styles.cellLifted : null),
        padding,
        ...placement,
      }}
      onMouseEnter={() => setIsLifted(true)}
      onMouseLeave={() => setIsLifted(false)}
      onFocus={() => setIsLifted(true)}
      onBlur={handleBlur}>
      {children}
      {learnMoreTopic !== undefined && onLearnMore !== undefined && (
        <div
          style={{
            ...styles.learnMore,
            opacity: showLearnMore ? 1 : 0,
          }}>
          <Button
            label="Learn more"
            variant={tone === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => onLearnMore(learnMoreTopic)}
          />
        </div>
      )}
    </div>
  );
}

/** Icon disc used by callout cells; tint via light-dark() brand pairs. */
function IconDisc({
  icon,
  background,
  color,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  background: string;
  color: string;
}) {
  return (
    <div style={{...styles.iconDisc, backgroundColor: background, color}}>
      <Icon icon={icon} size="sm" color="inherit" />
    </div>
  );
}

/** Chip pill for painted dark surfaces. */
function DarkChip({
  icon,
  label,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <span style={styles.darkChip}>
      <Icon icon={icon} size="xsm" color="inherit" />
      {label}
    </span>
  );
}

/** CSS-drawn phone frame; tone switches the light preview vs the dark
 * schematic treatment. Decorative — the cell copy carries the info. */
function PhoneMock({tone, title}: {tone: 'light' | 'dark'; title: string}) {
  const isDark = tone === 'dark';
  return (
    <div
      role="img"
      aria-label={\`Stylized phone mock: \${title}\`}
      style={{
        ...styles.phoneFrame,
        ...(isDark ? styles.phoneFrameDark : null),
      }}>
      <div aria-hidden style={styles.phoneNotch} />
      <div
        aria-hidden
        style={{
          ...styles.phoneScreen,
          ...(isDark ? styles.phoneScreenDark : null),
        }}>
        <div style={styles.phoneHeader}>{title}</div>
        <div style={styles.phoneBody}>
          {PHONE_ROWS.map((row, index) => (
            <div key={index} style={styles.phoneRow}>
              <span
                style={{...styles.phoneDot, backgroundColor: row.dot}}
              />
              <span
                style={{
                  ...styles.phoneBar,
                  ...(isDark ? styles.phoneBarDark : null),
                  maxWidth: row.width,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MarketingBentoGridTemplate() {
  // ---- jump rail scroll-spy ----
  const [activeVariant, setActiveVariant] = useState<VariantId>('asymmetric');
  const sectionRefs = useRef<Record<VariantId, HTMLElement | null>>({
    asymmetric: null,
    dark: null,
    stats: null,
  });

  // ---- variant 1 controls ----
  const [isCompactDensity, setIsCompactDensity] = useState(false);
  const [logoSetIndex, setLogoSetIndex] = useState(0);

  // ---- variant 2: terminal replay (fixed transcript, tick cadence) ----
  const [terminalCount, setTerminalCount] = useState(TERMINAL_LINES.length);

  // ---- variant 3: big-number period ----
  const [statPeriod, setStatPeriod] = useState<StatPeriod>('quarter');

  // ---- toast: replaced (keyed) so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Responsive contract: <=760px stacks variants 1 and 2 to one column;
  // <=640px stacks variant 3, steps headlines down, and keeps every
  // Learn more affordance visible so nothing depends on hover.
  const isStacked = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // Scroll-spy: a band around the viewport center marks the variant in
  // view. root:null still respects the scrolling LayoutContent clip.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-variant-id');
            if (id !== null) {
              setActiveVariant(id as VariantId);
            }
          }
        }
      },
      {rootMargin: '-40% 0px -50% 0px', threshold: 0},
    );
    for (const element of Object.values(sectionRefs.current)) {
      if (element !== null) {
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, []);

  // Terminal replay: reveal one fixed line per tick until the transcript
  // is complete. Deterministic content — only cadence is runtime.
  useEffect(() => {
    if (terminalCount >= TERMINAL_LINES.length) {
      return;
    }
    const timer = window.setInterval(() => {
      setTerminalCount(previous =>
        Math.min(previous + 1, TERMINAL_LINES.length),
      );
    }, 420);
    return () => window.clearInterval(timer);
  }, [terminalCount >= TERMINAL_LINES.length]);

  // ---- derived ----
  const activeMeta =
    VARIANTS.find(variant => variant.id === activeVariant) ?? VARIANTS[0];
  const logoSet = LOGO_SETS[logoSetIndex];
  const cellPadA = isCompactDensity ? 14 : 22;
  const gapA = isCompactDensity ? 10 : 20;
  const cellPadDark = isPhone ? 14 : 18;

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const jumpToVariant = (id: VariantId) => {
    setActiveVariant(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const cycleLogoSet = () => {
    const nextIndex = (logoSetIndex + 1) % LOGO_SETS.length;
    setLogoSetIndex(nextIndex);
    fireToast(
      \`Integrations cell — showing \${LOGO_SETS[nextIndex].label} \` +
        \`(set \${nextIndex + 1} of \${LOGO_SETS.length}).\`,
    );
  };

  const handleLearnMore = (topic: string) => {
    fireToast(\`Bento cell — Learn more: \${topic}.\`);
  };

  const replayTerminal = () => {
    setTerminalCount(1);
  };

  // ============= VARIANT 1: LIGHT ASYMMETRIC =============

  const heroCell = (
    <BentoCell
      tone="light"
      padding={cellPadA}
      placement={
        isStacked ? undefined : {gridColumn: '1 / 3', gridRow: '1 / 3'}
      }
      learnMoreTopic="Sub-50ms webhook delivery"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <div aria-hidden style={styles.heroWash} />
      <HStack gap={2} vAlign="center" wrap="wrap">
        <IconDisc
          icon={ZapIcon}
          background={BRAND_PURPLE_TINT}
          color={BRAND_PURPLE}
        />
        <Token label="Performance" size="sm" color="purple" />
      </HStack>
      <h3
        style={{
          ...styles.heroHeadline,
          ...(isPhone ? styles.heroHeadlineCompact : null),
        }}>
        Webhooks land in under 50 ms
      </h3>
      <Text type="supporting" color="secondary">
        Relay fans out every event from the edge region closest to the
        receiver — retries, signatures, and ordering included.
      </Text>
      <VStack gap={2}>
        {LATENCY_ROWS.map(row => (
          <div key={row.percentile} style={styles.latencyRow}>
            <span style={styles.latencyLabel}>{row.percentile}</span>
            <div style={styles.latencyTrack}>
              <div
                style={{
                  ...styles.latencyFill,
                  width: \`\${(row.ms / LATENCY_MAX_MS) * 100}%\`,
                }}
              />
            </div>
            <span style={styles.latencyValue}>{row.ms} ms</span>
          </div>
        ))}
      </VStack>
    </BentoCell>
  );

  const phonePreviewCell = (
    <BentoCell
      tone="light"
      padding={cellPadA}
      placement={isStacked ? undefined : {gridColumn: '3', gridRow: '1 / 3'}}
      learnMoreTopic="Mobile delivery feed"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <HStack gap={2} vAlign="center">
        <IconDisc
          icon={SmartphoneIcon}
          background={BRAND_SKY_TINT}
          color={BRAND_SKY}
        />
        <Text weight="semibold">On-call, on your phone</Text>
      </HStack>
      <Text type="supporting" color="secondary">
        Watch deliveries stream in and replay failures from anywhere.
      </Text>
      <PhoneMock tone="light" title="Relay · Live feed" />
    </BentoCell>
  );

  const securityCell = (
    <BentoCell
      tone="light"
      padding={cellPadA}
      placement={isStacked ? undefined : {gridColumn: '1', gridRow: '3'}}
      learnMoreTopic="SOC 2 security posture"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <HStack gap={2} vAlign="center">
        <IconDisc
          icon={ShieldCheckIcon}
          background={BRAND_GREEN_TINT}
          color={BRAND_GREEN}
        />
        <Text weight="semibold">SOC 2 Type II</Text>
      </HStack>
      <Text type="supporting" color="secondary">
        Every payload signed and encrypted at rest; every replay audited.
      </Text>
      <HStack gap={1} vAlign="center" wrap="wrap">
        {SECURITY_TOKENS.map(token => (
          <Token key={token} label={token} size="sm" color="green" />
        ))}
      </HStack>
    </BentoCell>
  );

  // Integrations cell: the whole cell is one native button so the
  // logo-set cycling works by tap, Enter, and Space.
  const integrationsCell = (
    <button
      type="button"
      onClick={cycleLogoSet}
      aria-label={\`Integrations — showing \${logoSet.label}, set \${
        logoSetIndex + 1
      } of \${LOGO_SETS.length}. Activate to cycle.\`}
      style={{
        ...styles.cell,
        ...styles.integrationsButton,
        padding: cellPadA,
        ...(isStacked ? null : {gridColumn: '2 / 4', gridRow: '3'}),
      }}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <IconDisc
          icon={BlocksIcon}
          background={BRAND_ORANGE_TINT}
          color={BRAND_ORANGE}
        />
        <StackItem size="fill">
          <Text weight="semibold">Drops into your stack</Text>
        </StackItem>
        <Token
          label={\`Set \${logoSetIndex + 1} of \${LOGO_SETS.length}\`}
          size="sm"
          color="orange"
        />
      </HStack>
      <div style={styles.logoRow}>
        {logoSet.logos.map(logo => (
          <span
            key={logo.name}
            title={logo.name}
            style={{...styles.logoTile, backgroundColor: logo.background}}>
            {logo.monogram}
          </span>
        ))}
      </div>
      <Text type="supporting" color="secondary">
        {logoSet.label} — tap the cell to cycle the sets.
      </Text>
    </button>
  );

  const testimonialCell = (
    <BentoCell
      tone="light"
      padding={cellPadA}
      placement={isStacked ? undefined : {gridColumn: '1 / 4', gridRow: '4'}}
      learnMoreTopic="Customer stories"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <HStack gap={3} vAlign="start" wrap="wrap">
        <IconDisc
          icon={QuoteIcon}
          background={BRAND_PURPLE_TINT}
          color={BRAND_PURPLE}
        />
        <StackItem size="fill">
          <VStack gap={2}>
            <Text type="body">“{TESTIMONIAL.quote}”</Text>
            <HStack gap={2} vAlign="center">
              <Avatar name={TESTIMONIAL.name} size="xsmall" />
              <Text type="supporting" color="secondary">
                {TESTIMONIAL.name} · {TESTIMONIAL.role}
              </Text>
            </HStack>
          </VStack>
        </StackItem>
      </HStack>
    </BentoCell>
  );

  // ============= VARIANT 2: DARK SCHEMATIC =============

  const chartCell = (
    <BentoCell
      tone="dark"
      padding={cellPadDark}
      placement={isStacked ? undefined : {gridColumn: '1 / 4'}}
      learnMoreTopic="Throughput autoscaling"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <DarkChip icon={TrendingUpIcon} label="Throughput" />
      <div
        style={styles.chartBars}
        role="img"
        aria-label="Stylized bar chart: events per minute trending up">
        {THROUGHPUT_BARS.map((height, index) => (
          <div
            key={index}
            aria-hidden
            style={{...styles.chartBar, height: \`\${height}%\`}}
          />
        ))}
      </div>
      <Text
        type="supporting"
        color="inherit"
        style={{color: DARK_TEXT_FAINT}}>
        Events per minute — Relay scales fan-out before you notice.
      </Text>
    </BentoCell>
  );

  const terminalCell = (
    <BentoCell tone="dark" padding={cellPadDark}
      placement={isStacked ? undefined : {gridColumn: '4 / 7'}}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <DarkChip icon={TerminalIcon} label="Deploy in one command" />
        <StackItem size="fill">
          <span />
        </StackItem>
        <Button
          label="Replay"
          variant="secondary"
          size="sm"
          icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
          isDisabled={terminalCount < TERMINAL_LINES.length}
          onClick={replayTerminal}
        />
      </HStack>
      <div style={styles.terminal} aria-live="off">
        {TERMINAL_LINES.slice(0, terminalCount).map((line, index) => (
          <p
            key={index}
            style={{
              ...styles.terminalLine,
              color:
                line.tone === 'ok'
                  ? TERMINAL_GREEN
                  : line.tone === 'dim'
                    ? TERMINAL_DIM
                    : DARK_TEXT,
            }}>
            {line.text}
          </p>
        ))}
      </div>
    </BentoCell>
  );

  const darkPhoneCell = (
    <BentoCell tone="dark" padding={cellPadDark}
      placement={isStacked ? undefined : {gridColumn: '1 / 3'}}>
      <DarkChip icon={SmartphoneIcon} label="Mobile console" />
      <PhoneMock tone="dark" title="Relay · Deliveries" />
    </BentoCell>
  );

  const zeroTrustCell = (
    <BentoCell
      tone="dark"
      padding={cellPadDark}
      placement={isStacked ? undefined : {gridColumn: '3 / 5'}}
      learnMoreTopic="Zero-trust delivery"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <DarkChip icon={LockIcon} label="Zero-trust delivery" />
      <Text color="inherit" weight="semibold">
        Signed, scoped, and revocable
      </Text>
      <Text
        type="supporting"
        color="inherit"
        style={{color: DARK_TEXT_FAINT}}>
        Per-endpoint HMAC keys rotate on your schedule; one click revokes
        a compromised consumer without touching the rest.
      </Text>
    </BentoCell>
  );

  const scaleCell = (
    <BentoCell
      tone="dark"
      padding={cellPadDark}
      placement={isStacked ? undefined : {gridColumn: '5 / 7'}}
      learnMoreTopic="Scale benchmarks"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <DarkChip icon={GaugeIcon} label="Built for scale" />
      <p
        style={{
          ...styles.bigStatValue,
          ...(isPhone ? styles.bigStatValueCompact : null),
        }}>
        4.2M
      </p>
      <Text
        type="supporting"
        color="inherit"
        style={{color: DARK_TEXT_FAINT}}>
        deliveries a day across 34 edge regions
      </Text>
    </BentoCell>
  );

  // ============= VARIANT 3: COMPACT STATS =============

  const periodToggle = (
    <HStack gap={1} vAlign="center">
      <Button
        label="This quarter"
        size="sm"
        variant={statPeriod === 'quarter' ? 'primary' : 'secondary'}
        onClick={() => setStatPeriod('quarter')}
      />
      <Button
        label="All time"
        size="sm"
        variant={statPeriod === 'alltime' ? 'primary' : 'secondary'}
        onClick={() => setStatPeriod('alltime')}
      />
    </HStack>
  );

  const bigStatCells = BIG_STATS.map(stat => (
    <BentoCell key={stat.id} tone="light" padding={isPhone ? 16 : 22}>
      <Text type="supporting" color="secondary">
        {stat.label}
      </Text>
      <p
        style={{
          ...styles.bigStatValue,
          ...(isPhone ? styles.bigStatValueCompact : null),
        }}>
        {stat.values[statPeriod]}
      </p>
      <Text type="supporting" color="secondary">
        {stat.caption[statPeriod]}
      </Text>
    </BentoCell>
  ));

  const edgeCopyCell = (
    <BentoCell
      tone="light"
      padding={isPhone ? 16 : 22}
      learnMoreTopic="Global edge network"
      onLearnMore={handleLearnMore}
      alwaysShowLearnMore={isPhone}>
      <HStack gap={2} vAlign="center">
        <IconDisc
          icon={GlobeIcon}
          background={BRAND_SKY_TINT}
          color={BRAND_SKY}
        />
        <Text weight="semibold">34 edge regions</Text>
      </HStack>
      <Text type="supporting" color="secondary">
        Deliveries originate close to the receiver, so cross-ocean hops
        never sit between an event and your endpoint.
      </Text>
    </BentoCell>
  );

  const ctaCell = (
    <BentoCell tone="light" padding={isPhone ? 16 : 22}>
      <HStack gap={2} vAlign="center">
        <IconDisc
          icon={SparklesIcon}
          background={BRAND_PURPLE_TINT}
          color={BRAND_PURPLE}
        />
        <Text weight="semibold">Start building free</Text>
      </HStack>
      <Text type="supporting" color="secondary">
        100k deliveries a month on the free tier — no card required.
      </Text>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Button
          label="Create account"
          variant="primary"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() =>
            fireToast('Compact stats CTA — Create account clicked.')
          }
        />
        <Button
          label="Read the docs"
          variant="ghost"
          onClick={() =>
            fireToast('Compact stats CTA — Read the docs clicked.')
          }
        />
      </HStack>
    </BentoCell>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider role="banner">
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={2}>Bento Grid Showcase</Heading>
                  <Text type="supporting" color="secondary">
                    Relay — three bento section variants
                  </Text>
                </VStack>
              </StackItem>
              {!isPhone && (
                <Token
                  label={\`Viewing: \${activeMeta.label}\`}
                  size="sm"
                  color="blue"
                />
              )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="Bento grid showcase">
            <VStack gap={0}>
              {/* Sticky jump rail: 40px pills, scroll-spied. */}
              <div style={styles.railWrap}>
                <nav
                  aria-label="Jump to variant"
                  style={{
                    ...styles.rail,
                    ...(isPhone ? styles.railCompact : null),
                  }}>
                  {VARIANTS.map(variant => (
                    <button
                      key={variant.id}
                      type="button"
                      aria-current={
                        activeVariant === variant.id ? 'true' : undefined
                      }
                      style={{
                        ...styles.railPill,
                        ...(activeVariant === variant.id
                          ? styles.railPillActive
                          : null),
                      }}
                      onClick={() => jumpToVariant(variant.id)}>
                      {variant.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {/* ---- variant 1: light asymmetric grid ---- */}
                <section
                  data-variant-id="asymmetric"
                  ref={element => {
                    sectionRefs.current.asymmetric = element;
                  }}
                  style={styles.section}
                  aria-label={VARIANTS[0].title}>
                  <SectionHeader
                    kicker={VARIANTS[0].kicker}
                    title={VARIANTS[0].title}
                    description={VARIANTS[0].description}
                    trailing={
                      <ToggleButton
                        label="Compact gaps"
                        icon={<Icon icon={GaugeIcon} size="sm" />}
                        isPressed={isCompactDensity}
                        onPressedChange={setIsCompactDensity}
                        tooltip="Switch between roomy and compact gaps"
                      />
                    }
                  />
                  <div
                    style={{
                      ...(isStacked ? styles.gridStacked : styles.gridA),
                      gap: gapA,
                    }}>
                    {heroCell}
                    {phonePreviewCell}
                    {securityCell}
                    {integrationsCell}
                    {testimonialCell}
                  </div>
                </section>

                {/* ---- variant 2: dark 5-cell schematic panel ---- */}
                <section
                  data-variant-id="dark"
                  ref={element => {
                    sectionRefs.current.dark = element;
                  }}
                  style={styles.section}
                  aria-label={VARIANTS[1].title}>
                  <SectionHeader
                    kicker={VARIANTS[1].kicker}
                    title={VARIANTS[1].title}
                    description={VARIANTS[1].description}
                  />
                  <div
                    style={{
                      ...styles.darkPanel,
                      ...(isPhone ? styles.darkPanelCompact : null),
                    }}>
                    <div
                      style={
                        isStacked
                          ? {...styles.gridStacked, gap: 14}
                          : styles.gridB
                      }>
                      {chartCell}
                      {terminalCell}
                      {darkPhoneCell}
                      {zeroTrustCell}
                      {scaleCell}
                    </div>
                  </div>
                </section>

                {/* ---- variant 3: compact 4-cell stats grid ---- */}
                <section
                  data-variant-id="stats"
                  ref={element => {
                    sectionRefs.current.stats = element;
                  }}
                  style={styles.section}
                  aria-label={VARIANTS[2].title}>
                  <SectionHeader
                    kicker={VARIANTS[2].kicker}
                    title={VARIANTS[2].title}
                    description={VARIANTS[2].description}
                    trailing={periodToggle}
                  />
                  <div
                    style={{
                      ...styles.gridC,
                      ...(isPhone ? styles.gridCStacked : null),
                    }}>
                    {bigStatCells}
                    {edgeCopyCell}
                    {ctaCell}
                  </div>
                </section>
              </div>
            </VStack>
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