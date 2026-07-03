var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one invented dev-tools SaaS brand —
 *   'Astryx Relay', an edge event-relay for platform teams — with per-variant
 *   headline/subhead/CTA copy: 'Ship events to every edge in milliseconds'
 *   over a gradient mesh, 'Your event pipeline, observable end to end' beside
 *   a CSS-panel console mock with 3 metric tiles and 5 delivery-log rows,
 *   'Be first on the new global mesh' on a dark full-bleed with an email
 *   capture, and 'From webhook chaos to one reliable relay' with 5 named
 *   social-proof Avatars and a fixed 4.9/5 star row; plus the literal install
 *   command 'npm install @astryx/relay' — no clocks, no randomness, no
 *   network assets or real imagery anywhere)
 * @output Marketing hero-section showcase: a page header with the Astryx
 *   Relay brand mark, a variant-count Badge, and a light/dark scheme
 *   SegmentedControl that restyles all four heroes live; a sticky
 *   variant-jump rail on the left (List on wide viewports, a sticky chip row
 *   on narrow ones) that smooth-scrolls to each labeled hero and scroll-spies
 *   the active one; and four framed hero variants stacked on the right —
 *   (1) centered headline with dual CTAs over a scheme-keyed gradient mesh,
 *   (2) split hero with copy beside an app-screenshot mock built entirely
 *   from CSS panels (window chrome, sidebar nav, metric tiles, delivery-log
 *   rows) plus a copy-install-command chip, (3) dark full-bleed hero whose
 *   email capture validates format and swaps to a success chip on submit,
 *   and (4) angled-image hero (clip-path gradient panel with an inline-SVG
 *   relay-node graphic and an uptime chip) with AvatarGroup social proof and
 *   a filled star row. Every CTA fires a corner Toast naming its variant.
 * @position Page template; emitted by \`astryx template marketing-hero-showcase\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the brand mark, page
 * title, variant Badge, and the scheme SegmentedControl; LayoutPanel start
 * 240 docks the variant-jump rail (List with scroll-spied selection over a
 * scheme note); LayoutContent (padding 0) hosts one scroll container that
 * owns the document scroll, the scroll-spy, and the colorScheme override —
 * hero sections sit in a centered 1040px column inside it.
 *
 * Interaction contract:
 * - The scheme SegmentedControl (Light/Dark) sets colorScheme on the scroll
 *   container, so every token-driven surface — section frames, the console
 *   mock, copy, chips — restyles live; the gradient-mesh hero swaps to a
 *   scheme-keyed mesh, and the dark full-bleed hero stays deliberately
 *   locked dark to read as a contrast specimen in both schemes.
 * - The jump rail smooth-scrolls the container to the chosen variant and the
 *   container's onScroll spies the active section (last section above the
 *   fold wins; bottom pins the last), highlighting the rail/chips.
 * - Mesh hero: 'Start free' and 'Book a demo' both fire variant-named
 *   Toasts. Split hero: 'Get started' and 'View docs' fire Toasts, and the
 *   install-command chip flips CopyIcon→CheckIcon with a 'Copied' label and
 *   its own Toast. Angled hero: 'Start shipping' and 'Read the launch story'
 *   fire Toasts. No dead buttons anywhere.
 * - The dark hero's email capture validates on submit (empty and format
 *   errors render inline with role="alert"), swaps the whole form for a
 *   success chip naming the submitted address, and offers 'Use a different
 *   email' to reset; success also fires a Toast.
 * - The corner Toast is keyed so back-to-back clicks re-announce; its
 *   dismiss X clears it.
 *
 * Responsive contract:
 * - >900px: header | jump-rail panel 240 (List, sticky by construction —
 *   the panel never scrolls with the document) | scroll container with the
 *   1040px hero column. Only the scroll container scrolls.
 * - <=900px: the panel leaves the frame and a sticky chip row (wrapped
 *   40px-tall Buttons, one per variant) pins to the top of the scroll
 *   container to keep jump + spy available on one pane.
 * - <=640px: headlines step down (44→30 centered, 36→26 split); the split
 *   hero stacks copy above the console mock and the mock drops its sidebar;
 *   the angled hero stacks copy above the gradient panel; the email row
 *   stacks input above button; header chrome tightens (title hides, the
 *   scheme control keeps its two labeled 40px-tall segments).
 * - Tap targets: jump chips, the install-copy chip, and the email submit
 *   all hold >=40px height; CTAs are standard Buttons with generous
 *   padding. Nothing is hover-only — the rail highlight tracks scroll, not
 *   pointer, and every disclosure is click/tap driven.
 * - No horizontal scroll surfaces: CTA rows, badge rows, avatar + star rows
 *   all wrap; the console mock, mesh, and angled panel are fluid width, so
 *   the page holds at 375px with zero overflow-x.
 *
 * Container policy (marketing-showcase archetype): frame-first chrome; each
 * hero variant is a framed specimen (rounded border on tokens) rather than a
 * Card so the painted surfaces read edge-to-edge. All artwork is CSS —
 * gradient meshes, a clip-path panel, an inline-SVG relay graphic, and a
 * console mock built from token-colored divs. Deterministic fixtures only.
 */

import {
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type UIEvent,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
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
  BookOpenIcon,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  MoonIcon,
  RadioTowerIcon,
  RocketIcon,
  SendIcon,
  SunIcon,
  ZapIcon,
} from 'lucide-react';

// ============= SCHEME =============

type Scheme = 'light' | 'dark';

// ============= DARK-HERO PAINT CONSTANTS =============
// The full-bleed email-capture hero is a locked-dark specimen: literal
// colors with colorScheme:'dark' so it reads identically in both schemes.

const DARK_HERO_TEXT = '#F2F4FB';
const DARK_HERO_TEXT_SOFT = 'rgba(226, 231, 250, 0.78)';
const DARK_HERO_CHIP_BG = 'rgba(255, 255, 255, 0.10)';
const DARK_HERO_CHIP_BORDER = 'rgba(255, 255, 255, 0.20)';
const DARK_HERO_ERROR = '#FCA5A5';

// Scheme-keyed gradient mesh for the centered hero — a pastel wash over
// near-white in light, deep glows over near-black in dark. Literal fixture
// paint; the copy on top uses tokens so it flips with the container.
const MESH_BACKGROUND: Record<Scheme, string> = {
  light: [
    'radial-gradient(52% 46% at 16% 18%, rgba(99, 102, 241, 0.20), transparent 62%)',
    'radial-gradient(46% 42% at 84% 10%, rgba(236, 72, 153, 0.16), transparent 60%)',
    'radial-gradient(60% 52% at 62% 96%, rgba(45, 212, 191, 0.18), transparent 62%)',
    'linear-gradient(180deg, #F7F8FE 0%, #F2F4FD 100%)',
  ].join(', '),
  dark: [
    'radial-gradient(52% 46% at 16% 18%, rgba(99, 102, 241, 0.38), transparent 62%)',
    'radial-gradient(46% 42% at 84% 10%, rgba(236, 72, 153, 0.26), transparent 60%)',
    'radial-gradient(60% 52% at 62% 96%, rgba(45, 212, 191, 0.24), transparent 62%)',
    'linear-gradient(180deg, #0C1022 0%, #131938 100%)',
  ].join(', '),
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns the document scroll, the scroll-spy, and the
  // colorScheme override that flips every light-dark() token inside.
  // position:relative so section offsetTop resolves against this element.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  },
  column: {
    width: '100%',
    maxWidth: 1040,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-8)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-6)',
  },
  // <=900px: sticky chip row replaces the left rail inside the scroller.
  chipRow: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
  },
  chipButton: {
    minHeight: 40,
  },
  // Jump-rail panel body (>900px).
  railBody: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  railNote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 10,
    backgroundColor: 'var(--color-background-muted)',
  },
  // Each hero variant is a framed specimen: rounded token border, painted
  // surface edge-to-edge inside.
  specimen: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  // ---- variant 1: centered gradient mesh ----
  mesh: {
    padding: 'var(--spacing-10) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
  },
  meshCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  meshHeadline: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.025em',
    margin: 0,
    maxWidth: 680,
  },
  meshHeadlineCompact: {
    fontSize: 30,
  },
  meshSubhead: {
    maxWidth: 560,
    margin: 0,
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ---- variant 2: split with console mock ----
  split: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
    padding: 'var(--spacing-8) var(--spacing-6)',
  },
  splitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 'var(--spacing-5) var(--spacing-4)',
    gap: 'var(--spacing-5)',
  },
  splitCopy: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
  },
  splitHeadline: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  splitHeadlineCompact: {
    fontSize: 26,
  },
  splitSubhead: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
  },
  splitMockWrap: {
    flex: '1 1 0',
    minWidth: 0,
    width: '100%',
  },
  // Install-command chip: monospace command + copy flip, 40px tap target.
  installChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 40,
    padding: '6px 14px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    fontSize: 13,
  },
  // Console mock: an app screenshot built entirely from token-colored CSS
  // panels so the scheme toggle restyles it live. No imagery.
  mock: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    boxShadow: 'var(--shadow-med)',
    overflow: 'hidden',
  },
  mockTitleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  mockDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  mockAddress: {
    flex: '1 1 0',
    minWidth: 0,
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '2px 10px',
    backgroundColor: 'var(--color-background)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mockBody: {
    display: 'flex',
  },
  mockSidebar: {
    width: 128,
    flexShrink: 0,
    borderRight: '1px solid var(--color-border)',
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  mockNavItem: {
    fontSize: 12,
    padding: '5px 8px',
    borderRadius: 6,
    color: 'var(--color-text-secondary)',
  },
  mockNavItemActive: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-accent)',
    fontWeight: 600,
  },
  mockMain: {
    flex: '1 1 0',
    minWidth: 0,
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  mockMetricRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  mockMetric: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  mockMetricLabel: {
    fontSize: 10,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mockMetricValue: {
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  mockLog: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  mockLogRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '6px 10px',
    fontSize: 12,
    borderTop: '1px solid var(--color-border)',
  },
  mockLogDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  mockLogTopic: {
    flex: '1 1 0',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  },
  mockLogMs: {
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // ---- variant 3: dark full-bleed email capture ----
  darkHero: {
    colorScheme: 'dark',
    color: DARK_HERO_TEXT,
    padding: 'var(--spacing-10) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
    backgroundImage: [
      'radial-gradient(80% 70% at 84% 6%, rgba(251, 146, 60, 0.22), transparent 58%)',
      'radial-gradient(70% 80% at 8% 94%, rgba(56, 189, 248, 0.18), transparent 56%)',
      'linear-gradient(140deg, #0B1120 0%, #16213E 55%, #101B33 100%)',
    ].join(', '),
  },
  darkHeroCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  darkHeroChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: DARK_HERO_CHIP_BG,
    border: \`1px solid \${DARK_HERO_CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    color: DARK_HERO_TEXT,
  },
  darkHeroHeadline: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.14,
    letterSpacing: '-0.02em',
    margin: 0,
    maxWidth: 620,
  },
  darkHeroHeadlineCompact: {
    fontSize: 28,
  },
  darkHeroSubhead: {
    maxWidth: 520,
    margin: 0,
    fontSize: 16,
    lineHeight: 1.55,
    color: DARK_HERO_TEXT_SOFT,
  },
  emailRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 440,
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
    color: DARK_HERO_ERROR,
    fontSize: 13,
    margin: 0,
  },
  successChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '10px 16px',
    borderRadius: 999,
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
    border: '1px solid rgba(52, 211, 153, 0.45)',
    color: '#6EE7B7',
    fontSize: 14,
    fontWeight: 600,
    maxWidth: '100%',
  },
  successChipText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // ---- variant 4: angled panel with social proof ----
  angled: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
    padding: 'var(--spacing-8) 0 var(--spacing-8) var(--spacing-6)',
  },
  angledStacked: {
    flexDirection: 'column',
    padding: 'var(--spacing-5) var(--spacing-4)',
    gap: 'var(--spacing-5)',
  },
  angledCopy: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  // The "image": a clip-path gradient panel — no assets, deterministic.
  angledPanel: {
    position: 'relative',
    flex: '1 1 0',
    minWidth: 0,
    minHeight: 300,
    clipPath: 'polygon(14% 0%, 100% 0%, 100% 100%, 0% 100%)',
    backgroundImage: [
      'radial-gradient(70% 60% at 80% 20%, rgba(129, 140, 248, 0.45), transparent 60%)',
      'linear-gradient(150deg, #312E81 0%, #4C1D95 55%, #6D28D9 100%)',
    ].join(', '),
    overflow: 'hidden',
  },
  angledPanelStacked: {
    clipPath: 'polygon(0% 8%, 100% 0%, 100% 100%, 0% 100%)',
    minHeight: 220,
    borderRadius: 12,
  },
  angledArt: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  uptimeChip: {
    position: 'absolute',
    left: '26%',
    bottom: 'var(--spacing-4)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 10,
    backgroundColor: 'rgba(10, 12, 24, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    color: '#E7EAF0',
    fontSize: 12,
    fontWeight: 600,
    backdropFilter: 'blur(4px)',
  },
  proofRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  starRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
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

// ============= BRAND & VARIANT DATA =============
// Deterministic fixtures: fixed copy for the invented dev-tools SaaS brand
// 'Astryx Relay'. No clocks, no randomness, no network assets.

const BRAND = {
  name: 'Astryx Relay',
  tagline: 'Edge event relay for dev teams',
  installCommand: 'npm install @astryx/relay',
};

type VariantId = 'mesh' | 'split' | 'capture' | 'angled';

interface VariantMeta {
  id: VariantId;
  /** Jump-rail label. */
  label: string;
  /** Specimen heading + Toast prefix. */
  title: string;
  description: string;
}

const VARIANTS: readonly VariantMeta[] = [
  {
    id: 'mesh',
    label: 'Centered mesh',
    title: 'Centered mesh hero',
    description:
      'Centered headline with dual CTAs over a scheme-keyed gradient mesh.',
  },
  {
    id: 'split',
    label: 'Split + screenshot',
    title: 'Split hero with console mock',
    description:
      'Copy beside an app-screenshot mock built from CSS panels, plus a copy-to-clipboard install command.',
  },
  {
    id: 'capture',
    label: 'Dark email capture',
    title: 'Dark full-bleed email capture',
    description:
      'Locked-dark full-bleed hero whose email field validates and swaps to a success chip on submit.',
  },
  {
    id: 'angled',
    label: 'Angled + social proof',
    title: 'Angled-image hero with social proof',
    description:
      'Angled clip-path gradient panel beside copy with avatar social proof and a star row.',
  },
];

const MESH_COPY = {
  kicker: 'Astryx Relay 2.0',
  headline: 'Ship events to every edge in milliseconds',
  subhead:
    'One relay for webhooks, queues, and streams — fan out to 34 regions ' +
    'with at-least-once delivery, replay, and zero infra to babysit.',
  primaryCta: 'Start free',
  secondaryCta: 'Book a demo',
};

const SPLIT_COPY = {
  kicker: 'Built for platform teams',
  headline: 'Your event pipeline, observable end to end',
  subhead:
    'Every delivery, retry, and dead-letter in one console. Trace a single ' +
    'event from producer to edge in two clicks — no log spelunking.',
  primaryCta: 'Get started',
  secondaryCta: 'View docs',
};

const CAPTURE_COPY = {
  kicker: 'Private beta',
  headline: 'Be first on the new global mesh',
  subhead:
    'The next Relay backbone triples throughput and halves p95 latency. ' +
    'Beta seats open in small batches — leave your work email.',
  cta: 'Request access',
};

const ANGLED_COPY = {
  kicker: 'Loved by developers',
  headline: 'From webhook chaos to one reliable relay',
  subhead:
    'Retries, signatures, ordering, and replay handled for you. Point your ' +
    'producers at Relay and delete the duct tape.',
  primaryCta: 'Start shipping',
  secondaryCta: 'Read the launch story',
  proofLine: 'Trusted by 2,400+ platform teams',
  ratingLine: '4.9/5 · 318 reviews on StackRate',
};

const PROOF_NAMES: readonly string[] = [
  'Priya Nair',
  'Jordan Ellis',
  'Sam Okafor',
  'Elena Vasquez',
  'Marcus Webb',
];

// ---- console-mock fixtures (variant 2) ----

const MOCK_NAV = ['Overview', 'Streams', 'Endpoints', 'Keys'] as const;
const MOCK_ACTIVE_NAV = 'Streams';

const MOCK_METRICS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Delivered 24h', value: '1.2M'},
  {label: 'p95 latency', value: '38ms'},
  {label: 'Error rate', value: '0.02%'},
];

interface MockLogRow {
  topic: string;
  ms: string;
  status: 'ok' | 'retry';
}

const MOCK_LOG: readonly MockLogRow[] = [
  {topic: 'orders.created → edge/iad', ms: '31ms', status: 'ok'},
  {topic: 'billing.invoice.paid → edge/fra', ms: '44ms', status: 'ok'},
  {topic: 'deploy.finished → hooks/slack', ms: '52ms', status: 'ok'},
  {topic: 'user.signup → crm/sync', ms: '2.1s', status: 'retry'},
  {topic: 'orders.refunded → edge/sin', ms: '39ms', status: 'ok'},
];

const MOCK_STATUS_COLOR: Record<MockLogRow['status'], string> = {
  ok: '#34D399',
  retry: '#FBBF24',
};

// Scroll-spy: a section counts as active once its top clears this line.
const SPY_OFFSET = 120;

// ============= SMALL PIECES =============

/** Kicker Token + numbered heading + description above each specimen. */
function SectionIntro({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Badge label={\`Variant \${index}\`} />
        <Heading level={2}>{title}</Heading>
      </HStack>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
    </VStack>
  );
}

/** Five filled inline-SVG stars — deterministic, no icon-fill gymnastics. */
function StarRow() {
  return (
    <span style={styles.starRow} role="img" aria-label="Rated 4.9 out of 5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          width={16}
          height={16}
          viewBox="0 0 24 24"
          aria-hidden>
          <path
            d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.58l-5.9 3.1 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z"
            fill="#F59E0B"
          />
        </svg>
      ))}
    </span>
  );
}

/** Decorative relay-node network inside the angled panel — inline SVG. */
function RelayNodeArt() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      style={styles.angledArt}
      aria-hidden>
      <g stroke="rgba(199, 210, 254, 0.45)" strokeWidth="1.25" fill="none">
        <line x1="210" y1="150" x2="96" y2="66" />
        <line x1="210" y1="150" x2="330" y2="52" />
        <line x1="210" y1="150" x2="356" y2="176" />
        <line x1="210" y1="150" x2="128" y2="242" />
        <line x1="210" y1="150" x2="300" y2="256" />
        <circle cx="210" cy="150" r="26" strokeWidth="2" />
        <circle
          cx="210"
          cy="150"
          r="44"
          strokeDasharray="4 8"
          strokeWidth="1"
        />
      </g>
      <g fill="rgba(199, 210, 254, 0.85)">
        <circle cx="210" cy="150" r="9" />
        <circle cx="96" cy="66" r="6" />
        <circle cx="330" cy="52" r="6" />
        <circle cx="356" cy="176" r="6" />
        <circle cx="128" cy="242" r="6" />
        <circle cx="300" cy="256" r="6" />
      </g>
    </svg>
  );
}

/**
 * App-screenshot mock built entirely from token-colored CSS panels: window
 * chrome with traffic-light dots, a sidebar nav, metric tiles, and a
 * delivery log. Everything rides tokens, so the scheme toggle restyles it.
 */
function ConsoleMock({showSidebar}: {showSidebar: boolean}) {
  return (
    <div
      style={styles.mock}
      role="img"
      aria-label="Astryx Relay console mock: delivery metrics and a live delivery log">
      <div style={styles.mockTitleBar}>
        <span
          aria-hidden
          style={{...styles.mockDot, backgroundColor: '#F87171'}}
        />
        <span
          aria-hidden
          style={{...styles.mockDot, backgroundColor: '#FBBF24'}}
        />
        <span
          aria-hidden
          style={{...styles.mockDot, backgroundColor: '#34D399'}}
        />
        <span style={styles.mockAddress}>relay.astryx.dev/console</span>
      </div>
      <div style={styles.mockBody}>
        {showSidebar && (
          <div style={styles.mockSidebar}>
            {MOCK_NAV.map(item => (
              <span
                key={item}
                style={{
                  ...styles.mockNavItem,
                  ...(item === MOCK_ACTIVE_NAV
                    ? styles.mockNavItemActive
                    : null),
                }}>
                {item}
              </span>
            ))}
          </div>
        )}
        <div style={styles.mockMain}>
          <div style={styles.mockMetricRow}>
            {MOCK_METRICS.map(metric => (
              <div key={metric.label} style={styles.mockMetric}>
                <span style={styles.mockMetricLabel}>{metric.label}</span>
                <span style={styles.mockMetricValue}>{metric.value}</span>
              </div>
            ))}
          </div>
          <div style={styles.mockLog}>
            {MOCK_LOG.map((row, index) => (
              <div
                key={row.topic}
                style={{
                  ...styles.mockLogRow,
                  ...(index === 0 ? {borderTop: 'none'} : null),
                }}>
                <span
                  aria-hidden
                  style={{
                    ...styles.mockLogDot,
                    backgroundColor: MOCK_STATUS_COLOR[row.status],
                  }}
                />
                <span style={styles.mockLogTopic}>{row.topic}</span>
                <span style={styles.mockLogMs}>{row.ms}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MarketingHeroShowcaseTemplate() {
  // ---- scheme: restyles every token surface inside the scroller ----
  const [scheme, setScheme] = useState<Scheme>('light');

  // ---- scroll-spy state ----
  const [activeVariantId, setActiveVariantId] = useState<VariantId>('mesh');
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ---- email capture (variant 3) ----
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');

  // ---- install-command copy flip (variant 2) ----
  const [isCommandCopied, setIsCommandCopied] = useState(false);

  // ---- toast: replaced (keyed) so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Responsive contract: <=900px swaps the rail panel for sticky chips;
  // <=640px stacks the split/angled heroes and the email row.
  const isRailStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  /** Smooth-scroll the page container to a variant section. */
  const jumpToVariant = (id: VariantId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container === null || section === null || section === undefined) {
      return;
    }
    setActiveVariantId(id);
    // Clear the sticky chip row on narrow viewports so the section
    // heading lands below it, not underneath it.
    const stickyAllowance = isRailStacked ? 64 : 12;
    container.scrollTo({
      top: section.offsetTop - stickyAllowance,
      behavior: 'smooth',
    });
  };

  /** Scroll-spy: last section above the fold line wins; bottom pins last. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const atBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 4;
    if (atBottom) {
      setActiveVariantId(VARIANTS[VARIANTS.length - 1].id);
      return;
    }
    let active: VariantId = VARIANTS[0].id;
    for (const variant of VARIANTS) {
      const section = sectionRefs.current[variant.id];
      if (
        section != null &&
        section.offsetTop <= container.scrollTop + SPY_OFFSET
      ) {
        active = variant.id;
      }
    }
    setActiveVariantId(active);
  };

  const copyInstallCommand = () => {
    // Plain state flip — no clipboard API in a template fixture.
    setIsCommandCopied(true);
    fireToast(\`Split hero — copied “\${BRAND.installCommand}”.\`);
  };

  const submitEmail = () => {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
      setEmailError('Enter your work email to request access.');
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
      setEmailError("That doesn't look like an email address.");
      return;
    }
    setEmailError(null);
    setIsSubscribed(true);
    setSubscribedEmail(trimmed);
    fireToast(\`Dark email capture — beta access requested for \${trimmed}.\`);
  };

  const resetEmail = () => {
    setIsSubscribed(false);
    setSubscribedEmail('');
    setEmail('');
    setEmailError(null);
  };

  // ============= VARIANT 1: CENTERED GRADIENT MESH =============

  const meshHero = (
    <div style={styles.specimen}>
      <div
        style={{
          ...styles.mesh,
          ...(isPhone ? styles.meshCompact : null),
          backgroundImage: MESH_BACKGROUND[scheme],
        }}>
        <Token label={MESH_COPY.kicker} size="sm" color="purple" />
        <h3
          style={{
            ...styles.meshHeadline,
            ...(isPhone ? styles.meshHeadlineCompact : null),
          }}>
          {MESH_COPY.headline}
        </h3>
        <p style={styles.meshSubhead}>{MESH_COPY.subhead}</p>
        <div style={styles.ctaRow}>
          <Button
            label={MESH_COPY.primaryCta}
            variant="primary"
            icon={<Icon icon={RocketIcon} size="sm" color="inherit" />}
            onClick={() =>
              fireToast('Centered mesh hero — Start free clicked.')
            }
          />
          <Button
            label={MESH_COPY.secondaryCta}
            variant="secondary"
            icon={<Icon icon={CalendarIcon} size="sm" color="inherit" />}
            onClick={() =>
              fireToast('Centered mesh hero — Book a demo clicked.')
            }
          />
        </div>
        <Text type="supporting" color="secondary">
          Free tier forever · No card required
        </Text>
      </div>
    </div>
  );

  // ============= VARIANT 2: SPLIT WITH CONSOLE MOCK =============

  const splitHero = (
    <div style={styles.specimen}>
      <div
        style={{
          ...styles.split,
          ...(isPhone ? styles.splitStacked : null),
        }}>
        <div style={styles.splitCopy}>
          <Token label={SPLIT_COPY.kicker} size="sm" color="blue" />
          <h3
            style={{
              ...styles.splitHeadline,
              ...(isPhone ? styles.splitHeadlineCompact : null),
            }}>
            {SPLIT_COPY.headline}
          </h3>
          <p style={styles.splitSubhead}>{SPLIT_COPY.subhead}</p>
          <div style={{...styles.ctaRow, justifyContent: 'flex-start'}}>
            <Button
              label={SPLIT_COPY.primaryCta}
              variant="primary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => fireToast('Split hero — Get started clicked.')}
            />
            <Button
              label={SPLIT_COPY.secondaryCta}
              variant="secondary"
              icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
              onClick={() => fireToast('Split hero — View docs clicked.')}
            />
          </div>
          <button
            type="button"
            style={styles.installChip}
            aria-label={
              isCommandCopied
                ? 'Install command copied'
                : \`Copy install command \${BRAND.installCommand}\`
            }
            onClick={copyInstallCommand}>
            <span>{BRAND.installCommand}</span>
            <Icon
              icon={isCommandCopied ? CheckIcon : CopyIcon}
              size="xsm"
              color="inherit"
            />
            {isCommandCopied && <span>Copied</span>}
          </button>
        </div>
        <div style={styles.splitMockWrap}>
          <ConsoleMock showSidebar={!isPhone} />
        </div>
      </div>
    </div>
  );

  // ============= VARIANT 3: DARK FULL-BLEED EMAIL CAPTURE =============

  const captureHero = (
    <div style={styles.specimen}>
      <div
        style={{
          ...styles.darkHero,
          ...(isPhone ? styles.darkHeroCompact : null),
        }}>
        <span style={styles.darkHeroChip}>
          <Icon icon={ZapIcon} size="xsm" color="inherit" />
          {CAPTURE_COPY.kicker}
        </span>
        <h3
          style={{
            ...styles.darkHeroHeadline,
            ...(isPhone ? styles.darkHeroHeadlineCompact : null),
          }}>
          {CAPTURE_COPY.headline}
        </h3>
        <p style={styles.darkHeroSubhead}>{CAPTURE_COPY.subhead}</p>

        {isSubscribed ? (
          <VStack gap={2} hAlign="center">
            <span style={styles.successChip}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
              <span style={styles.successChipText}>
                You&rsquo;re on the list — {subscribedEmail}
              </span>
            </span>
            <Button
              label="Use a different email"
              variant="ghost"
              size="sm"
              onClick={resetEmail}
            />
          </VStack>
        ) : (
          <VStack gap={1} hAlign="center" style={{width: '100%'}}>
            <div
              style={{
                ...styles.emailRow,
                ...(isPhone ? styles.emailRowStacked : null),
              }}>
              <div style={styles.emailInput}>
                <TextInput
                  label="Work email"
                  isLabelHidden
                  placeholder="you@company.dev"
                  value={email}
                  onChange={value => {
                    setEmail(value);
                    if (emailError !== null) {
                      setEmailError(null);
                    }
                  }}
                />
              </div>
              <Button
                label={CAPTURE_COPY.cta}
                variant="primary"
                icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                onClick={submitEmail}
              />
            </div>
            {emailError !== null && (
              <p style={styles.emailError} role="alert">
                {emailError}
              </p>
            )}
            <Text type="supporting" color="inherit">
              <span style={{color: DARK_HERO_TEXT_SOFT}}>
                Batches of 200 seats · We never share your email
              </span>
            </Text>
          </VStack>
        )}
      </div>
    </div>
  );

  // ============= VARIANT 4: ANGLED PANEL + SOCIAL PROOF =============

  const angledHero = (
    <div style={styles.specimen}>
      <div
        style={{
          ...styles.angled,
          ...(isPhone ? styles.angledStacked : null),
        }}>
        <div style={styles.angledCopy}>
          <Token label={ANGLED_COPY.kicker} size="sm" color="green" />
          <h3
            style={{
              ...styles.splitHeadline,
              ...(isPhone ? styles.splitHeadlineCompact : null),
            }}>
            {ANGLED_COPY.headline}
          </h3>
          <p style={styles.splitSubhead}>{ANGLED_COPY.subhead}</p>
          <div style={{...styles.ctaRow, justifyContent: 'flex-start'}}>
            <Button
              label={ANGLED_COPY.primaryCta}
              variant="primary"
              icon={<Icon icon={RocketIcon} size="sm" color="inherit" />}
              onClick={() =>
                fireToast('Angled hero — Start shipping clicked.')
              }
            />
            <Button
              label={ANGLED_COPY.secondaryCta}
              variant="ghost"
              onClick={() =>
                fireToast('Angled hero — Read the launch story clicked.')
              }
            />
          </div>
          <div style={styles.proofRow}>
            <AvatarGroup size="small" aria-label="Teams shipping on Relay">
              {PROOF_NAMES.map(name => (
                <Avatar key={name} name={name} />
              ))}
            </AvatarGroup>
            <VStack gap={0}>
              <Text type="supporting" weight="bold">
                {ANGLED_COPY.proofLine}
              </Text>
              <HStack gap={1} vAlign="center">
                <StarRow />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {ANGLED_COPY.ratingLine}
                </Text>
              </HStack>
            </VStack>
          </div>
        </div>
        <div
          style={{
            ...styles.angledPanel,
            ...(isPhone ? styles.angledPanelStacked : null),
          }}
          role="img"
          aria-label="Stylized relay network graphic: a hub node fanning out to five edge regions">
          <RelayNodeArt />
          <span style={styles.uptimeChip}>
            <Icon icon={ZapIcon} size="xsm" color="inherit" />
            99.99% delivery uptime
          </span>
        </div>
      </div>
    </div>
  );

  // ============= JUMP RAIL =============

  const variantIndex = (id: VariantId) =>
    VARIANTS.findIndex(variant => variant.id === id) + 1;

  const railPanel = (
    <LayoutPanel width={240} padding={0} label="Hero variants">
      <div style={styles.railBody}>
        <VStack gap={1}>
          <Heading level={2}>Variants</Heading>
          <Text type="supporting" color="secondary">
            Jump to a hero — the rail follows your scroll.
          </Text>
        </VStack>
        <List density="compact" hasDividers={false}>
          {VARIANTS.map(variant => (
            <ListItem
              key={variant.id}
              label={\`\${variantIndex(variant.id)}. \${variant.label}\`}
              isSelected={activeVariantId === variant.id}
              onClick={() => jumpToVariant(variant.id)}
            />
          ))}
        </List>
        <div style={styles.railNote}>
          <Text type="supporting" color="secondary">
            Toggle the scheme in the header — every hero restyles from the
            same tokens.
          </Text>
        </div>
      </div>
    </LayoutPanel>
  );

  const chipRail = (
    <div style={styles.chipRow} role="group" aria-label="Jump to hero variant">
      {VARIANTS.map(variant => (
        <Button
          key={variant.id}
          label={variant.label}
          size="sm"
          style={styles.chipButton}
          variant={activeVariantId === variant.id ? 'secondary' : 'ghost'}
          onClick={() => jumpToVariant(variant.id)}
        />
      ))}
    </div>
  );

  // ============= SECTIONS =============

  const sectionFor = (id: VariantId, hero: ReactElement) => {
    const meta = VARIANTS[variantIndex(id) - 1];
    return (
      <div
        key={id}
        ref={element => {
          sectionRefs.current[id] = element;
        }}>
        <VStack gap={3}>
          <SectionIntro
            index={variantIndex(id)}
            title={meta.title}
            description={meta.description}
          />
          {hero}
        </VStack>
      </div>
    );
  };

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <HStack gap={2} vAlign="center">
                <Icon icon={RadioTowerIcon} size="md" color="secondary" />
                <Heading level={1}>Hero section showcase</Heading>
              </HStack>
              {!isPhone && (
                <Badge label={\`\${VARIANTS.length} variants\`} variant="info" />
              )}
              <StackItem size="fill">
                {!isRailStacked && (
                  <Text type="supporting" color="secondary">
                    {BRAND.name} · {BRAND.tagline}
                  </Text>
                )}
              </StackItem>
              {/* Scheme toggle: restyles all four heroes live. */}
              <SegmentedControl
                label="Color scheme"
                value={scheme}
                onChange={value => setScheme(value as Scheme)}
                size="sm">
                <SegmentedControlItem
                  value="light"
                  label="Light"
                  icon={<Icon icon={SunIcon} size="sm" color="inherit" />}
                />
                <SegmentedControlItem
                  value="dark"
                  label="Dark"
                  icon={<Icon icon={MoonIcon} size="sm" color="inherit" />}
                />
              </SegmentedControl>
            </HStack>
          </LayoutHeader>
        }
        start={isRailStacked ? undefined : railPanel}
        content={
          <LayoutContent padding={0}>
            {/* Scroll container: owns scroll-spy + the scheme override.
                colorScheme flips every light-dark() token inside, so the
                specimens restyle without touching component code. */}
            <div
              ref={pageRef}
              style={{...styles.page, colorScheme: scheme}}
              onScroll={onPageScroll}>
              {isRailStacked && chipRail}
              <div
                style={{
                  ...styles.column,
                  ...(isPhone ? styles.columnCompact : null),
                }}>
                {sectionFor('mesh', meshHero)}
                {sectionFor('split', splitHero)}
                {sectionFor('capture', captureHero)}
                {sectionFor('angled', angledHero)}
                <Text type="supporting" color="secondary" justify="center">
                  End of showcase · {BRAND.name} — {BRAND.tagline}
                </Text>
              </div>
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