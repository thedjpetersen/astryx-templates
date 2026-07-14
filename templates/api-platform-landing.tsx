// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file api-platform-landing.tsx
 * @input Deterministic fixtures only (the fictional "Parcelrate" shipping-
 *   rates API: hero copy plus three request snippets keyed by language and
 *   one canned JSON rates response, five endpoint rows with method/path/
 *   purpose/p50, ten log-spaced request-volume steps and four pricing tiers
 *   with base price + included volume + per-1k overage, six SDK tiles with
 *   install commands, four reliability stats plus a p99 chip, three
 *   CSS-drawn docs panes, two developer testimonials, and footer link
 *   columns with a status row)
 * @output Full marketing landing page for an API platform: sticky navbar
 *   (brand mark, four smooth-scrolling anchor links, Get-API-key CTA;
 *   collapses to a menu button + dropdown at compact widths), a split hero
 *   pairing copy + a validating email capture (success flips to a sandbox-
 *   key card) with a live-looking request/response pane — a curl/Node/
 *   Python TabList swaps the request CodeBlock and a Send-request button
 *   stages a 600ms spinner before the JSON response CodeBlock rises in
 *   with a 200 OK badge and 212 ms latency chip (the signature hero
 *   moment; deterministic, re-runnable). Sections: endpoint showcase
 *   Table (method Badges, mono paths, p50 column dropped on phones), a
 *   pricing calculator whose requests/month Slider (10k–10M log steps)
 *   drives a tabular per-tier price readout with best-value highlighting,
 *   an SDK grid revealing install commands on hover/tap, an accent-tinted
 *   reliability band with count-up stats and a p99 chip, a three-pane
 *   docs-quality teaser of schematic mocks, two developer testimonial
 *   cards, a final CTA band, and a footer with an operational StatusDot
 *   row plus docs/product link columns.
 * @position Page template; emitted by `astryx template api-platform-landing`
 *
 * Frame: Layout height="fill", content-only — the landing page owns its
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts one
 * scroll container div; the navbar is position:sticky top:0 inside it and
 * a centered 1080px column carries every section. Full-bleed muted bands
 * (endpoints, SDKs, testimonials) alternate with plain bands; the
 * reliability band and final CTA are accent-tinted.
 *
 * Interaction contract:
 * - Nav anchors smooth-scroll the container to real section ids under a
 *   76px sticky-nav allowance; the compact menu closes on Escape, outside
 *   pointerdown, or any selection.
 * - The hero email form validates on submit (empty/format errors inline)
 *   and success swaps to a sandbox-key card with a "Use a different email"
 *   reset. The nav CTA and final CTA scroll to the hero and focus the
 *   email input — no dead buttons in the hero.
 * - Send request guards re-entry while running, stages a 600ms timer
 *   (cleared on unmount), then mounts the response block with a rise+fade
 *   keyframe animation; reduced motion skips the timer and animation and
 *   renders the final frame. The button relabels to "Send again".
 * - The pricing Slider is index-based over ten fixed log steps; every
 *   move recomputes all four tier prices in one pass (integer math on
 *   fixture steps), re-highlights the cheapest eligible tier, and updates
 *   the "cheapest plan" caption. Volumes ≥ 5M add a committed-use note.
 * - SDK tiles reveal their install command on hover and pin it on
 *   click/tap (aria-pressed); tiles have fixed min-heights so nothing
 *   jumps.
 * - Scroll-reveals use a fire-once IntersectionObserver (rise+fade 12px);
 *   the reliability stats count up on first view. Both are gated by
 *   prefers-reduced-motion: reveals render visible, counters render final.
 *
 * Color policy: token-pure except ONE quarantined brand-accent literal
 * (see ACCENT below, with contrast math); every accent tint on the page is
 * a color-mix() derivation of that single literal. Product art is CSS
 * schematic mocks and monogram tiles — no network images, no real logos.
 *
 * Responsive contract (useElementWidth ResizeObserver — the inline demo
 * stage is ~1045px wide, so viewport media queries are not used):
 * - Column: max-width 1080px, centered; bands paint edge to edge.
 * - >880px: navbar shows inline anchors + CTA; hero is split copy/pane;
 *   docs panes 3-up; stats 4-up; SDK grid 3-up; testimonials 2-up.
 * - <=880px: nav links + CTA collapse behind a 40px menu button dropdown.
 * - <=760px: hero stacks (pane below copy), docs panes stack to one
 *   column, testimonials stack, stats drop to 2-up, pricing readout rows
 *   loosen.
 * - <=560px: headline and stat type step down, the email form stacks its
 *   button, the SDK grid drops to one column, the endpoint Table drops
 *   its p50 column, and section paddings tighten — holds at 390px in the
 *   phone artboard with no overflow-x.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
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
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Icon} from '@astryxdesign/core/Icon';
import {Slider} from '@astryxdesign/core/Slider';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  KeyRoundIcon,
  MenuIcon,
  PackageIcon,
  PlayIcon,
  SendIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= ACCENT (single quarantined literal) =============
// Parcelrate "cargo orange" — the ONE sanctioned accent literal on this
// page. Contrast math: #C2410C on white = 5.2:1 (WCAG AA for text and
// UI); #FB923C on the ~#1B1B1F dark app body = 7.5:1 (AA). Every other
// accent surface below is a color-mix() derivation of this literal.
const ACCENT = 'light-dark(#C2410C, #FB923C)';
const ACCENT_TINT = `color-mix(in srgb, ${ACCENT} 10%, transparent)`;
const ACCENT_TINT_SOFT = `color-mix(in srgb, ${ACCENT} 5%, transparent)`;
const ACCENT_BORDER = `color-mix(in srgb, ${ACCENT} 40%, transparent)`;

/** Sticky-nav height allowance for smooth-scroll targets. */
const NAV_ALLOWANCE = 76;

/** Rise+fade keyframes for the response slide-in (reduced-motion gated). */
const KEYFRAMES = `
@keyframes prlRiseIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  column: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    boxSizing: 'border-box',
  },
  columnPhone: {
    paddingInline: 'var(--spacing-4)',
  },
  band: {
    paddingBlock: 'var(--spacing-9)',
  },
  bandPhone: {
    paddingBlock: 'var(--spacing-7)',
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  bandAccent: {
    backgroundColor: ACCENT_TINT_SOFT,
    borderTop: `1px solid ${ACCENT_BORDER}`,
    borderBottom: `1px solid ${ACCENT_BORDER}`,
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
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 60,
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
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
  menuButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
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
  // ---- shared type ----
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  mono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
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
  heroPane: {
    flex: '1.1 1 0',
    minWidth: 0,
  },
  heroHeadline: {
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlinePhone: {
    fontSize: 30,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 480,
    margin: 0,
  },
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
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  keyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    border: `1px solid ${ACCENT_BORDER}`,
    backgroundColor: ACCENT_TINT_SOFT,
    maxWidth: 440,
  },
  keyMono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    fontWeight: 600,
    color: ACCENT,
    wordBreak: 'break-all',
  },
  checkDisc: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
  },
  // ---- request/response pane ----
  requestPane: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  latencyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ---- pricing calculator ----
  volumeReadout: {
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
  },
  tierRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
  },
  tierRowBest: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_TINT_SOFT,
    boxShadow: `0 0 0 1px ${ACCENT_BORDER}`,
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  bestChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 8,
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  // ---- SDK grid ----
  sdkGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  sdkTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    minHeight: 116,
    padding: 'var(--spacing-3)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
  },
  sdkTileActive: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_TINT_SOFT,
  },
  sdkMonogram: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  sdkCommand: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    color: ACCENT,
    wordBreak: 'break-all',
  },
  // ---- stats band ----
  statsGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  statValue: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  statValuePhone: {
    fontSize: 28,
  },
  // ---- docs teaser (schematic mocks) ----
  docsGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  mockWindow: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-low)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  mockBody: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  mockBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  mockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mockMethodPill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 18,
    paddingInline: 6,
    borderRadius: 6,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  mockPath: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mockRunPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    paddingInline: 8,
    borderRadius: 10,
    backgroundColor: ACCENT_TINT,
    color: ACCENT,
    fontSize: 10,
    fontWeight: 700,
    alignSelf: 'flex-start',
  },
  // ---- testimonials ----
  testimonialGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  quote: {
    fontSize: 16,
    lineHeight: 1.55,
    margin: 0,
  },
  avatarDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_TINT,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    fontSize: 14,
    fontWeight: 700,
  },
  // ---- final CTA ----
  finalCta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-4)',
  },
  // ---- footer ----
  footer: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
  },
  footerGrid: {
    display: 'grid',
    gap: 'var(--spacing-6)',
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
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 30,
    paddingInline: 10,
    borderRadius: 15,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  // ---- scroll reveals ----
  reveal: {
    opacity: 0,
    transform: 'translateY(12px)',
    transition: 'opacity 480ms ease, transform 480ms ease',
  },
  revealShown: {
    opacity: 1,
    transform: 'none',
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Parcelrate shipping-rates API.
// No Date.now, no randomness, no network assets, no real carrier names.

const BRAND = {name: 'Parcelrate'};

const SANDBOX_KEY = 'pr_test_9f2ce81a4bd07731';

type SectionId = 'endpoints' | 'pricing' | 'sdks' | 'docs';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'endpoints', label: 'Endpoints'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'sdks', label: 'SDKs'},
  {id: 'docs', label: 'Docs'},
];

const HERO = {
  eyebrow: 'Shipping rates API',
  headline: "Every carrier's live rate. One request.",
  subcopy:
    'Parcelrate returns rates, labels, and tracking from 42 carriers ' +
    'through one typed API — 212 ms median, 99.99% uptime, and a sandbox ' +
    'that behaves exactly like production.',
  finePrint: '10,000 free requests every month · no card required',
};

type RequestLang = 'curl' | 'node' | 'python';

const REQUEST_SNIPPETS: Record<
  RequestLang,
  {tabLabel: string; language: string; code: string}
> = {
  curl: {
    tabLabel: 'curl',
    language: 'bash',
    code: [
      'curl https://api.parcelrate.dev/v1/rates \\',
      `  -H "Authorization: Bearer ${SANDBOX_KEY}" \\`,
      '  -d origin_postal=94107 \\',
      '  -d destination_postal=10013 \\',
      '  -d weight_oz=42 \\',
      '  -d dimensions=12x9x4',
    ].join('\n'),
  },
  node: {
    tabLabel: 'Node',
    language: 'javascript',
    code: [
      "import Parcelrate from '@parcelrate/sdk';",
      '',
      `const parcelrate = new Parcelrate('${SANDBOX_KEY}');`,
      '',
      'const rates = await parcelrate.rates.create({',
      "  originPostal: '94107',",
      "  destinationPostal: '10013',",
      '  weightOz: 42,',
      "  dimensions: '12x9x4',",
      '});',
    ].join('\n'),
  },
  python: {
    tabLabel: 'Python',
    language: 'python',
    code: [
      'import parcelrate',
      '',
      `client = parcelrate.Client("${SANDBOX_KEY}")`,
      '',
      'rates = client.rates.create(',
      '    origin_postal="94107",',
      '    destination_postal="10013",',
      '    weight_oz=42,',
      '    dimensions="12x9x4",',
      ')',
    ].join('\n'),
  },
};

const REQUEST_LANG_ORDER: readonly RequestLang[] = ['curl', 'node', 'python'];

const RESPONSE_JSON = [
  '{',
  '  "id": "rate_req_8c31f2",',
  '  "currency": "USD",',
  '  "rates": [',
  '    { "carrier": "Meridian Post",   "service": "Ground",    "amount": 8.42,  "days": 4 },',
  '    { "carrier": "Skylark Express", "service": "2-Day",     "amount": 14.90, "days": 2 },',
  '    { "carrier": "Bluecrate",       "service": "Overnight", "amount": 27.35, "days": 1 }',
  '  ],',
  '  "cheapest": "rate_01J9M4",',
  '  "fastest": "rate_01J9M6"',
  '}',
].join('\n');

const RESPONSE_LATENCY_LABEL = '212 ms';

interface EndpointRow extends Record<string, unknown> {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  purpose: string;
  p50: string;
}

const ENDPOINTS: readonly EndpointRow[] = [
  {
    id: 'rates',
    method: 'POST',
    path: '/v1/rates',
    purpose: 'Live rates across 42 carriers in a single call',
    p50: '87 ms',
  },
  {
    id: 'shipments',
    method: 'POST',
    path: '/v1/shipments',
    purpose: 'Buy a label and get tracking in the same response',
    p50: '214 ms',
  },
  {
    id: 'tracking',
    method: 'GET',
    path: '/v1/tracking/{id}',
    purpose: 'Normalized tracking events from every carrier',
    p50: '64 ms',
  },
  {
    id: 'verify',
    method: 'POST',
    path: '/v1/addresses/verify',
    purpose: 'Validate and canonicalize a delivery address',
    p50: '48 ms',
  },
  {
    id: 'carriers',
    method: 'GET',
    path: '/v1/carriers',
    purpose: 'Capabilities, service levels, and pickup cutoffs',
    p50: '39 ms',
  },
];

/** Log-spaced requests/month steps driven by the pricing Slider. */
const VOLUME_STEPS: readonly number[] = [
  10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000,
  5_000_000, 10_000_000,
];

const VOLUME_MARKS = [
  {value: 0, label: '10k'},
  {value: 3, label: '100k'},
  {value: 6, label: '1M'},
  {value: 9, label: '10M'},
];

interface PricingTier {
  id: string;
  name: string;
  blurb: string;
  baseUsd: number;
  includedRequests: number;
  /** USD per 1,000 requests over the included volume; null = hard cap. */
  overagePer1kUsd: number | null;
}

const TIERS: readonly PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'Sandbox + production, community support',
    baseUsd: 0,
    includedRequests: 10_000,
    overagePer1kUsd: null,
  },
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'Email support, 2 webhook endpoints',
    baseUsd: 49,
    includedRequests: 100_000,
    overagePer1kUsd: 0.4,
  },
  {
    id: 'growth',
    name: 'Growth',
    blurb: 'Priority support, unlimited webhooks, SSO',
    baseUsd: 249,
    includedRequests: 1_000_000,
    overagePer1kUsd: 0.2,
  },
  {
    id: 'scale',
    name: 'Scale',
    blurb: '99.99% SLA, dedicated Slack channel, DPA',
    baseUsd: 999,
    includedRequests: 5_000_000,
    overagePer1kUsd: 0.1,
  },
];

interface SdkTile {
  id: string;
  name: string;
  monogram: string;
  tagline: string;
  install: string;
}

const SDKS: readonly SdkTile[] = [
  {
    id: 'ts',
    name: 'TypeScript',
    monogram: 'TS',
    tagline: 'Typed client · v3.2',
    install: 'npm install @parcelrate/sdk',
  },
  {
    id: 'py',
    name: 'Python',
    monogram: 'PY',
    tagline: 'Sync + async · v2.8',
    install: 'pip install parcelrate',
  },
  {
    id: 'go',
    name: 'Go',
    monogram: 'GO',
    tagline: 'Context-first · v1.9',
    install: 'go get parcelrate.dev/go',
  },
  {
    id: 'rb',
    name: 'Ruby',
    monogram: 'RB',
    tagline: 'Rails-friendly · v2.1',
    install: 'gem install parcelrate',
  },
  {
    id: 'php',
    name: 'PHP',
    monogram: 'PHP',
    tagline: 'PSR-18 client · v1.6',
    install: 'composer require parcelrate/parcelrate',
  },
  {
    id: 'jv',
    name: 'Java',
    monogram: 'JV',
    tagline: 'Reactive-ready · v1.4',
    install: 'implementation "dev.parcelrate:sdk:1.4.0"',
  },
];

interface Stat {
  id: string;
  /** Numeric target for the count-up animation. */
  target: number;
  decimals: number;
  suffix: string;
  label: string;
}

const STATS: readonly Stat[] = [
  {
    id: 'uptime',
    target: 99.99,
    decimals: 2,
    suffix: '%',
    label: 'Uptime, trailing 90 days',
  },
  {
    id: 'median',
    target: 212,
    decimals: 0,
    suffix: ' ms',
    label: 'Median rate-request latency',
  },
  {
    id: 'volume',
    target: 41,
    decimals: 0,
    suffix: 'M',
    label: 'Rates served per day',
  },
  {
    id: 'carriers',
    target: 42,
    decimals: 0,
    suffix: '',
    label: 'Carriers behind one contract',
  },
];

const P99_CHIP = 'p99 · 387 ms';

const DOCS_PANES: readonly {
  id: string;
  title: string;
  caption: string;
  variant: 'reference' | 'guides' | 'playground';
}[] = [
  {
    id: 'reference',
    title: 'API reference',
    caption: 'Every field typed, every error documented with a fix.',
    variant: 'reference',
  },
  {
    id: 'guides',
    title: 'Guides',
    caption: 'Rate shopping, labels, and returns as copy-paste recipes.',
    variant: 'guides',
  },
  {
    id: 'playground',
    title: 'Playground',
    caption: 'Run sandbox requests in the browser before you write code.',
    variant: 'playground',
  },
];

const TESTIMONIALS: readonly {
  id: string;
  quote: string;
  name: string;
  initials: string;
  role: string;
  metric: string;
}[] = [
  {
    id: 'cartloop',
    quote:
      'We replaced three carrier integrations with one POST /v1/rates ' +
      'call. Checkout rate shopping went from 1.4 s to about 210 ms, and ' +
      'conversion moved the same week we shipped it.',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Staff Engineer, Cartloop',
    metric: '−85% checkout latency',
  },
  {
    id: 'bundleworks',
    quote:
      'The sandbox returns the same shapes as production, down to the ' +
      'error codes. Our integration tests caught a dimensional-weight ' +
      'bug before it ever cost us money.',
    name: 'Diego Fuentes',
    initials: 'DF',
    role: 'Platform Lead, Bundleworks',
    metric: 'Integrated in 2 days',
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
      {label: 'Endpoints', anchor: 'endpoints'},
      {label: 'Pricing', anchor: 'pricing'},
      {label: 'SDKs', anchor: 'sdks'},
      {label: 'Changelog'},
    ],
  },
  {
    id: 'developers',
    heading: 'Developers',
    links: [
      {label: 'Documentation', anchor: 'docs'},
      {label: 'API reference'},
      {label: 'API status'},
      {label: 'Request collection'},
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      {label: 'About'},
      {label: 'Blog'},
      {label: 'Careers'},
      {label: 'Contact'},
    ],
  },
];

// ============= HELPERS =============

function formatRequestsShort(volume: number): string {
  if (volume >= 1_000_000) {
    const millions = volume / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  return `${Math.round(volume / 1_000)}k`;
}

function formatUSD(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

/** Monthly cost of a tier at a volume; null when the tier caps below it. */
function tierCostUsd(tier: PricingTier, volume: number): number | null {
  if (volume <= tier.includedRequests) {
    return tier.baseUsd;
  }
  if (tier.overagePer1kUsd === null) {
    return null;
  }
  const overageThousands = (volume - tier.includedRequests) / 1_000;
  return tier.baseUsd + overageThousands * tier.overagePer1kUsd;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to get a sandbox key.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

// ============= HOOKS =============

/** Measures the page's own width (the demo stage is narrower than the
 * viewport, so media queries would lie — see Responsive contract). */
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
    const onChange = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isReduced;
}

/** Fire-once viewport intersection; `isDisabled` (reduced motion) reports
 * in-view immediately so reveals render visible and counters render final. */
function useInView<T extends HTMLElement>(
  isDisabled: boolean,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (isDisabled) {
      setIsInView(true);
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.2},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isDisabled]);
  return [ref, isInView];
}

/** Eased 0→target count-up once `isActive`; reduced motion jumps to the
 * final value. Animation clock only — fixtures stay deterministic. */
function useCountUp(
  target: number,
  isActive: boolean,
  isReduced: boolean,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (isReduced) {
      setValue(target);
      return undefined;
    }
    const durationMs = 1100;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(progress >= 1 ? target : target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, isReduced]);
  return value;
}

// ============= SMALL PIECES =============

function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={PackageIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
    </HStack>
  );
}

function Eyebrow({children}: {children: ReactNode}) {
  return <div style={styles.eyebrow}>{children}</div>;
}

/** Scroll reveal: rise+fade 12px, fires once; reduced motion renders
 * visible with no transition. */
function Reveal({
  isReduced,
  delayMs = 0,
  children,
}: {
  isReduced: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const [ref, isInView] = useInView<HTMLDivElement>(isReduced);
  const style: CSSProperties | undefined = isReduced
    ? undefined
    : {
        ...styles.reveal,
        ...(isInView ? styles.revealShown : null),
        transitionDelay: `${delayMs}ms`,
      };
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

/** One count-up stat for the reliability band. */
function StatCell({
  stat,
  isActive,
  isReduced,
  isPhone,
  extraChip,
}: {
  stat: Stat;
  isActive: boolean;
  isReduced: boolean;
  isPhone: boolean;
  extraChip?: string;
}) {
  const value = useCountUp(stat.target, isActive, isReduced);
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <span
          style={{
            ...styles.statValue,
            ...(isPhone ? styles.statValuePhone : null),
          }}>
          {value.toFixed(stat.decimals)}
          {stat.suffix}
        </span>
        {extraChip !== undefined ? (
          <span style={styles.latencyChip}>{extraChip}</span>
        ) : null}
      </HStack>
      <Text type="supporting" color="secondary">
        {stat.label}
      </Text>
    </VStack>
  );
}

/** CSS-drawn docs pane: schematic reference / guides / playground mock. */
function DocsPane({
  title,
  variant,
}: {
  title: string;
  variant: 'reference' | 'guides' | 'playground';
}) {
  let body = null;
  if (variant === 'reference') {
    body = (
      <>
        {ENDPOINTS.slice(0, 4).map(endpoint => (
          <div key={endpoint.id} style={styles.mockRow}>
            <span style={styles.mockMethodPill}>{endpoint.method}</span>
            <span style={styles.mockPath}>{endpoint.path}</span>
            <div style={{...styles.mockBar, flex: 1}} />
          </div>
        ))}
        <div style={{...styles.mockBar, width: '58%'}} />
      </>
    );
  } else if (variant === 'guides') {
    body = (
      <>
        <div style={{...styles.mockBar, width: '46%', height: 12}} />
        <div style={{...styles.mockBar, width: '92%'}} />
        <div style={{...styles.mockBar, width: '84%'}} />
        <div style={{...styles.mockBar, width: '88%'}} />
        <div style={styles.mockRow}>
          <span style={styles.mockMethodPill}>1</span>
          <div style={{...styles.mockBar, flex: 1}} />
        </div>
        <div style={styles.mockRow}>
          <span style={styles.mockMethodPill}>2</span>
          <div style={{...styles.mockBar, flex: 1}} />
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div style={styles.mockRow}>
          <span style={styles.mockMethodPill}>POST</span>
          <span style={styles.mockPath}>/v1/rates</span>
        </div>
        <div style={{...styles.mockBar, width: '100%', height: 22}} />
        <span style={styles.mockRunPill}>▶ Run in sandbox</span>
        <div style={{...styles.mockBar, width: '90%'}} />
        <div style={{...styles.mockBar, width: '72%'}} />
      </>
    );
  }
  return (
    <div style={styles.mockWindow} role="img" aria-label={`${title} preview`}>
      <div style={styles.mockChrome} aria-hidden="true">
        <span style={styles.mockDot} />
        <span style={styles.mockDot} />
        <span>{title}</span>
      </div>
      <div style={styles.mockBody} aria-hidden="true">
        {body}
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function ApiPlatformLandingTemplate() {
  // ---- responsive: measure our own width (demo-stage safe) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;

  const isReduced = usePrefersReducedMotion();

  // ---- nav ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ---- hero email capture ----
  const heroFormRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // ---- hero request/response run (signature moment) ----
  const [requestLang, setRequestLang] = useState<RequestLang>('curl');
  const [runState, setRunState] = useState<'idle' | 'running' | 'done'>(
    'idle',
  );
  const runTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (runTimerRef.current !== null) {
        window.clearTimeout(runTimerRef.current);
      }
    },
    [],
  );

  // ---- pricing calculator ----
  const [volumeIndex, setVolumeIndex] = useState(4); // 250k requests/month

  // ---- SDK grid ----
  const [hoveredSdk, setHoveredSdk] = useState<string | null>(null);
  const [pinnedSdk, setPinnedSdk] = useState<string | null>(null);

  // ---- reliability band count-up trigger ----
  const [statsRef, statsInView] = useInView<HTMLDivElement>(isReduced);

  // Compact menu dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar.
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

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container === null || section === null || section === undefined) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  /** Nav + final CTAs: scroll to the hero and focus the email input. */
  const jumpToSignup = () => {
    setIsMenuOpen(false);
    pageRef.current?.scrollTo({
      top: 0,
      behavior: isReduced ? 'auto' : 'smooth',
    });
    heroFormRef.current
      ?.querySelector('input')
      ?.focus({preventScroll: true});
  };

  const submitEmail = () => {
    const error = validateEmail(email);
    if (error !== null) {
      setEmailError(error);
      return;
    }
    setConfirmedEmail(email.trim());
    setEmail('');
    setEmailError(null);
  };

  /** Signature hero moment: staged 600ms "run", then the canned response
   * rises in. Reduced motion renders the final frame immediately. */
  const runRequest = () => {
    if (runState === 'running') {
      return;
    }
    if (isReduced) {
      setRunState('done');
      return;
    }
    setRunState('running');
    runTimerRef.current = window.setTimeout(() => {
      setRunState('done');
    }, 600);
  };

  // ---- pricing math (one pass per slider move) ----
  const volume = VOLUME_STEPS[volumeIndex];
  const tierPricing = useMemo(() => {
    const costs = TIERS.map(tier => ({tier, cost: tierCostUsd(tier, volume)}));
    let bestId: string | null = null;
    let bestCost = Number.POSITIVE_INFINITY;
    for (const entry of costs) {
      if (entry.cost !== null && entry.cost < bestCost) {
        bestCost = entry.cost;
        bestId = entry.tier.id;
      }
    }
    return {costs, bestId, bestCost};
  }, [volume]);
  const bestTier = TIERS.find(tier => tier.id === tierPricing.bestId);

  // ---- endpoint table columns (p50 drops on phones) ----
  const endpointColumns = useMemo<TableColumn<EndpointRow>[]>(() => {
    const columns: TableColumn<EndpointRow>[] = [
      {
        key: 'method',
        header: 'Method',
        width: pixel(92),
        renderCell: row => (
          <Badge
            variant={row.method === 'GET' ? 'blue' : 'green'}
            label={row.method}
          />
        ),
      },
      {
        key: 'path',
        header: 'Endpoint',
        width: proportional(1, {minWidth: 150}),
        renderCell: row => <span style={styles.mono}>{row.path}</span>,
      },
      {
        key: 'purpose',
        header: 'Purpose',
        width: proportional(1.6, {minWidth: 140}),
      },
    ];
    if (!isPhone) {
      columns.push({
        key: 'p50',
        header: 'p50',
        width: pixel(84),
        align: 'end',
        renderCell: row => <span style={styles.mono}>{row.p50}</span>,
      });
    }
    return columns;
  }, [isPhone]);

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };
  const bandStyle: CSSProperties = {
    ...styles.band,
    ...(isPhone ? styles.bandPhone : null),
  };

  // ============= NAVBAR =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Parcelrate">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCompact ? (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={styles.navLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          ) : (
            <div />
          )}
        </StackItem>
        {!isNavCompact ? (
          <Button
            label="Get API key"
            variant="primary"
            icon={<Icon icon={KeyRoundIcon} size="sm" color="inherit" />}
            onClick={jumpToSignup}
          />
        ) : (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        )}
        {isNavCompact && isMenuOpen ? (
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
              <button
                type="button"
                role="menuitem"
                style={{...styles.mobileMenuLink, color: ACCENT}}
                onClick={jumpToSignup}>
                <Icon icon={KeyRoundIcon} size="sm" color="inherit" />
                Get API key
              </button>
            </VStack>
          </div>
        ) : null}
      </div>
    </nav>
  );

  // ============= HERO =============

  const emailCapture =
    confirmedEmail === null ? (
      <form
        onSubmit={event => {
          event.preventDefault();
          submitEmail();
        }}>
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
                value={email}
                onChange={value => {
                  setEmail(value);
                  setEmailError(null);
                }}
              />
            </div>
            <Button
              label="Get API key"
              variant="primary"
              type="submit"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
          </div>
          {emailError !== null ? (
            <p style={styles.emailError}>{emailError}</p>
          ) : null}
          <Text type="supporting" color="secondary">
            {HERO.finePrint}
          </Text>
        </VStack>
      </form>
    ) : (
      <div style={styles.keyCard}>
        <HStack gap={2} vAlign="center">
          <div style={styles.checkDisc} aria-hidden="true">
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          </div>
          <StackItem size="fill">
            <Text size="sm" weight="semibold">
              Sandbox key sent to {confirmedEmail}
            </Text>
          </StackItem>
        </HStack>
        <span style={styles.keyMono}>{SANDBOX_KEY}</span>
        <Text type="supporting" color="secondary">
          Paste it into the pane on the right — the sandbox mirrors
          production shapes exactly.
        </Text>
        <div>
          <Button
            label="Use a different email"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmedEmail(null)}
          />
        </div>
      </div>
    );

  const requestPane = (
    <div style={styles.requestPane}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <TabList
            value={requestLang}
            onChange={value => setRequestLang(value as RequestLang)}
            size="sm"
            aria-label="Request language">
            {REQUEST_LANG_ORDER.map(lang => (
              <Tab
                key={lang}
                value={lang}
                label={REQUEST_SNIPPETS[lang].tabLabel}
              />
            ))}
          </TabList>
        </StackItem>
        <span style={styles.mono}>POST /v1/rates</span>
      </HStack>
      <CodeBlock
        code={REQUEST_SNIPPETS[requestLang].code}
        language={REQUEST_SNIPPETS[requestLang].language}
        width="100%"
        size="sm"
        hasCopyButton
      />
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Button
          label={
            runState === 'running'
              ? 'Sending…'
              : runState === 'done'
                ? 'Send again'
                : 'Send request'
          }
          variant="primary"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={runRequest}
        />
        {runState === 'running' ? (
          <Spinner size="sm" aria-label="Sending request" />
        ) : null}
        {runState === 'idle' ? (
          <Text type="supporting" color="secondary">
            Runs against the sandbox — nothing ships.
          </Text>
        ) : null}
      </HStack>
      {runState === 'done' ? (
        <div
          style={
            isReduced
              ? undefined
              : {animation: 'prlRiseIn 420ms ease both'}
          }>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Badge variant="success" label="200 OK" />
              <span style={styles.latencyChip}>
                <Icon icon={ZapIcon} size="xsm" color="inherit" />
                {RESPONSE_LATENCY_LABEL}
              </span>
              <Text type="supporting" color="secondary">
                3 rates · 3 carriers
              </Text>
            </HStack>
            <CodeBlock
              code={RESPONSE_JSON}
              language="json"
              width="100%"
              size="sm"
              maxHeight={240}
            />
          </VStack>
        </div>
      ) : null}
    </div>
  );

  const hero = (
    <div style={{...columnStyle, ...bandStyle}}>
      <div
        style={{
          ...styles.heroRow,
          ...(isStacked ? styles.heroRowStacked : null),
        }}>
        <div style={styles.heroText}>
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          <h1
            style={{
              ...styles.heroHeadline,
              ...(isPhone ? styles.heroHeadlinePhone : null),
            }}>
            {HERO.headline}
          </h1>
          <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
          <div ref={heroFormRef}>{emailCapture}</div>
        </div>
        <div style={styles.heroPane}>{requestPane}</div>
      </div>
    </div>
  );

  // ============= SECTIONS =============

  const endpointsSection = (
    <section
      id="endpoints"
      ref={registerSection('endpoints')}
      style={styles.bandMuted}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            <VStack gap={2}>
              <Eyebrow>Endpoints</Eyebrow>
              <Heading level={2}>Five endpoints cover the whole parcel</Heading>
              <Text type="supporting" color="secondary">
                Rate, buy, verify, track — the same request shapes in sandbox
                and production, versioned under /v1 since 2023.
              </Text>
            </VStack>
            <Card padding={2}>
              <Table<EndpointRow>
                data={[...ENDPOINTS]}
                columns={endpointColumns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
              />
            </Card>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const pricingSection = (
    <section id="pricing" ref={registerSection('pricing')}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            <VStack gap={2}>
              <Eyebrow>Pricing</Eyebrow>
              <Heading level={2}>Drag your volume, see the bill</Heading>
              <Text type="supporting" color="secondary">
                Metered on successful requests only — failed calls and
                sandbox traffic are always free.
              </Text>
            </VStack>
            <Card padding={5}>
              <VStack gap={5}>
                <VStack gap={1}>
                  <span style={styles.volumeReadout}>
                    {volume.toLocaleString('en-US')} requests / month
                  </span>
                  {bestTier !== undefined ? (
                    <Text type="supporting" color="secondary">
                      Cheapest plan at this volume: {bestTier.name} —{' '}
                      {formatUSD(tierPricing.bestCost)}/mo
                    </Text>
                  ) : null}
                </VStack>
                <Slider
                  label="Requests per month"
                  min={0}
                  max={VOLUME_STEPS.length - 1}
                  step={1}
                  value={volumeIndex}
                  onChange={setVolumeIndex}
                  marks={VOLUME_MARKS}
                  formatValue={index =>
                    `${formatRequestsShort(VOLUME_STEPS[index])} requests/month`
                  }
                />
                <VStack gap={2}>
                  {tierPricing.costs.map(({tier, cost}) => {
                    const isBest = tier.id === tierPricing.bestId;
                    return (
                      <div
                        key={tier.id}
                        style={{
                          ...styles.tierRow,
                          ...(isBest ? styles.tierRowBest : null),
                        }}>
                        <VStack gap={0} style={{flex: '1 1 200px', minWidth: 0}}>
                          <HStack gap={2} vAlign="center" wrap="wrap">
                            <Text type="label">{tier.name}</Text>
                            {isBest ? (
                              <span style={styles.bestChip}>Best value</span>
                            ) : null}
                          </HStack>
                          <Text type="supporting" color="secondary">
                            {tier.blurb}
                          </Text>
                        </VStack>
                        <VStack gap={0} style={{flex: '1 1 180px', minWidth: 0}}>
                          <Text size="sm" color="secondary">
                            {formatRequestsShort(tier.includedRequests)}{' '}
                            requests included
                          </Text>
                          <Text size="sm" color="secondary">
                            {tier.overagePer1kUsd === null
                              ? 'Hard cap — upgrade to go past it'
                              : `then $${tier.overagePer1kUsd.toFixed(2)} per 1k`}
                          </Text>
                        </VStack>
                        <span style={styles.tierPrice}>
                          {cost === null
                            ? 'Over limit'
                            : `${formatUSD(cost)}/mo`}
                        </span>
                      </div>
                    );
                  })}
                </VStack>
                {volume >= 5_000_000 ? (
                  <Text type="supporting" color="secondary">
                    Volumes above 5M requests/month qualify for committed-use
                    discounts — talk to us for a custom rate.
                  </Text>
                ) : null}
              </VStack>
            </Card>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const sdkGridColumns = isPhone
    ? '1fr'
    : isStacked
      ? 'repeat(2, 1fr)'
      : 'repeat(3, 1fr)';

  const sdksSection = (
    <section id="sdks" ref={registerSection('sdks')} style={styles.bandMuted}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            <VStack gap={2}>
              <Eyebrow>SDKs</Eyebrow>
              <Heading level={2}>First-party clients, six languages</Heading>
              <Text type="supporting" color="secondary">
                Generated from the same spec as the API, released in
                lockstep. Hover or tap a tile for the install command.
              </Text>
            </VStack>
            <div
              style={{...styles.sdkGrid, gridTemplateColumns: sdkGridColumns}}>
              {SDKS.map(sdk => {
                const isActive = hoveredSdk === sdk.id || pinnedSdk === sdk.id;
                return (
                  <button
                    key={sdk.id}
                    type="button"
                    aria-pressed={pinnedSdk === sdk.id}
                    style={{
                      ...styles.sdkTile,
                      ...(isActive ? styles.sdkTileActive : null),
                    }}
                    onMouseEnter={() => setHoveredSdk(sdk.id)}
                    onMouseLeave={() => setHoveredSdk(null)}
                    onClick={() =>
                      setPinnedSdk(current =>
                        current === sdk.id ? null : sdk.id,
                      )
                    }>
                    <HStack gap={2} vAlign="center">
                      <span style={styles.sdkMonogram} aria-hidden="true">
                        {sdk.monogram}
                      </span>
                      <Text type="label">{sdk.name}</Text>
                    </HStack>
                    {isActive ? (
                      <span style={styles.sdkCommand}>{sdk.install}</span>
                    ) : (
                      <Text type="supporting" color="secondary">
                        {sdk.tagline}
                      </Text>
                    )}
                  </button>
                );
              })}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const statsGridColumns = isStacked ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';

  const statsSection = (
    <section style={styles.bandAccent}>
      <div style={{...columnStyle, ...bandStyle}} ref={statsRef}>
        <VStack gap={5}>
          <VStack gap={2}>
            <Eyebrow>Reliability</Eyebrow>
            <Heading level={2}>Built to be the boring dependency</Heading>
          </VStack>
          <div
            style={{...styles.statsGrid, gridTemplateColumns: statsGridColumns}}>
            {STATS.map(stat => (
              <StatCell
                key={stat.id}
                stat={stat}
                isActive={statsInView}
                isReduced={isReduced}
                isPhone={isPhone}
                extraChip={stat.id === 'median' ? P99_CHIP : undefined}
              />
            ))}
          </div>
          <Text type="supporting" color="secondary">
            Latency measured at the edge across all regions, trailing 30
            days. Live numbers on the status page, always public.
          </Text>
        </VStack>
      </div>
    </section>
  );

  const docsGridColumns = isStacked ? '1fr' : 'repeat(3, 1fr)';

  const docsSection = (
    <section id="docs" ref={registerSection('docs')}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            <VStack gap={2}>
              <Eyebrow>Documentation</Eyebrow>
              <Heading level={2}>Docs your team will actually read</Heading>
              <Text type="supporting" color="secondary">
                Reference, recipes, and a live playground — kept in sync
                with the API by the same pipeline that ships it.
              </Text>
            </VStack>
            <div
              style={{...styles.docsGrid, gridTemplateColumns: docsGridColumns}}>
              {DOCS_PANES.map((pane, index) => (
                <Reveal
                  key={pane.id}
                  isReduced={isReduced}
                  delayMs={index * 90}>
                  <VStack gap={2} style={{height: '100%'}}>
                    <DocsPane title={pane.title} variant={pane.variant} />
                    <Text type="supporting" color="secondary">
                      {pane.caption}
                    </Text>
                  </VStack>
                </Reveal>
              ))}
            </div>
            <div>
              <Button
                label="Browse the docs"
                variant="secondary"
                icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
                onClick={() => {}}
              />
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const testimonialGridColumns = isStacked ? '1fr' : 'repeat(2, 1fr)';

  const testimonialsSection = (
    <section style={styles.bandMuted}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <VStack gap={5}>
            <VStack gap={2}>
              <Eyebrow>Developers</Eyebrow>
              <Heading level={2}>Teams who stopped writing carrier code</Heading>
            </VStack>
            <div
              style={{
                ...styles.testimonialGrid,
                gridTemplateColumns: testimonialGridColumns,
              }}>
              {TESTIMONIALS.map(testimonial => (
                <Card key={testimonial.id} padding={5} height="100%">
                  <VStack gap={4}>
                    <p style={styles.quote}>“{testimonial.quote}”</p>
                    <HStack gap={3} vAlign="center" wrap="wrap">
                      <div style={styles.avatarDisc} aria-hidden="true">
                        {testimonial.initials}
                      </div>
                      <StackItem size="fill">
                        <VStack gap={0}>
                          <Text size="sm" weight="semibold">
                            {testimonial.name}
                          </Text>
                          <Text type="supporting" color="secondary">
                            {testimonial.role}
                          </Text>
                        </VStack>
                      </StackItem>
                      <span style={styles.latencyChip}>
                        {testimonial.metric}
                      </span>
                    </HStack>
                  </VStack>
                </Card>
              ))}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const finalCtaSection = (
    <section style={styles.bandAccent}>
      <div style={{...columnStyle, ...bandStyle}}>
        <Reveal isReduced={isReduced}>
          <div style={styles.finalCta}>
            <Heading level={2}>Start with 10,000 free requests</Heading>
            <Text type="supporting" color="secondary" justify="center">
              A sandbox key in your inbox in under a minute. Rate your first
              parcel before your coffee cools.
            </Text>
            <HStack gap={2} vAlign="center" wrap="wrap" hAlign="center">
              <Button
                label="Get API key"
                variant="primary"
                icon={<Icon icon={KeyRoundIcon} size="sm" color="inherit" />}
                onClick={jumpToSignup}
              />
              <Button
                label="Try the request pane"
                variant="secondary"
                icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
                onClick={jumpToSignup}
              />
            </HStack>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footerGridColumns = isPhone
    ? '1fr'
    : isStacked
      ? 'repeat(2, 1fr)'
      : 'minmax(220px, 1.4fr) repeat(3, 1fr)';

  const footer = (
    <footer style={styles.footer}>
      <div style={{...columnStyle, ...bandStyle}}>
        <VStack gap={6}>
          <div
            style={{...styles.footerGrid, gridTemplateColumns: footerGridColumns}}>
            <VStack gap={3}>
              <BrandMark />
              <Text type="supporting" color="secondary">
                One shipping API for rates, labels, and tracking across 42
                carriers.
              </Text>
              <div>
                <span style={styles.statusChip}>
                  <StatusDot variant="success" label="Operational" />
                  All systems operational · 99.99% uptime
                </span>
              </div>
            </VStack>
            {FOOTER_COLUMNS.map(column => (
              <VStack key={column.id} gap={1}>
                <Text type="label">{column.heading}</Text>
                {column.links.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    style={styles.footerLink}
                    onClick={
                      link.anchor !== undefined
                        ? () => jumpToSection(link.anchor as SectionId)
                        : () => {}
                    }>
                    {link.label}
                  </button>
                ))}
              </VStack>
            ))}
          </div>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                © 2026 Parcelrate, Inc. · SOC 2 Type II · GDPR ready
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              api.parcelrate.dev · v1 stable since 2023
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
          <div ref={pageRef} style={styles.page}>
            <style>{KEYFRAMES}</style>
            {navbar}
            {hero}
            {endpointsSection}
            {pricingSection}
            {sdksSection}
            {statsSection}
            {docsSection}
            {testimonialsSection}
            {finalCtaSection}
            {footer}
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
}
