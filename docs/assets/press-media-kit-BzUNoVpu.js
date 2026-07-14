var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file press-media-kit.tsx
 * @input Deterministic fixtures only (the fictional "Relay Robotics"
 *   warehouse-automation scale-up: an approved boilerplate paragraph, a
 *   press contact, six fast facts with count-up targets, four logo-asset
 *   variants with download chips, three usage dos and three don'ts with
 *   schematic misuse previews, three schematic product screenshots with
 *   resolution captions, three leadership entries, five brand color
 *   swatches with hex values, six coverage rows from invented outlets,
 *   and a five-milestone founding-story timeline)
 * @output A complete press & media kit page: sticky navbar with five
 *   smooth-scrolling anchor links (collapsing to a menu button at
 *   compact widths) and a working Download-kit CTA; a tinted hero band
 *   with the boilerplate copy card (working Copy button), the signature
 *   staged .zip download progress button, and a press-contact card;
 *   fast-facts tiles that count up on first view and copy on click;
 *   logo tiles on checkered backgrounds with per-tile download chips
 *   plus a dos/don'ts split with tinted misuse previews (stretched,
 *   recolored, low-contrast); schematic product screenshots with
 *   resolution captions; leadership monogram tiles; brand color
 *   swatches with copy-hex feedback; a coverage list; a founding-story
 *   timeline; and a footer. Every copy/download control gives visible
 *   feedback (copied flip or a corner Toast) so the wiring is provable.
 * @position Page template; emitted by \`astryx template press-media-kit\`
 *
 * Frame: Layout height="fill", content-only — a marketing page owns its
 * own chrome, so there is no LayoutHeader. LayoutContent (padding 0)
 * hosts a single scroll container div; inside it the navbar is
 * position:sticky top:0 and full-bleed tinted bands alternate with
 * plain bands, each centering a 1080px column. The Toast sits fixed
 * bottom-right.
 *
 * Interaction contract:
 * - Nav anchors smooth-scroll the container to real section bands with
 *   a sticky-nav allowance; onScroll spies the last band above the fold
 *   and highlights the matching link (aria-current). At compact widths
 *   the links collapse behind a menu button whose dropdown closes on
 *   Escape, outside pointerdown, or any selection.
 * - The signature hero moment: "Download kit (.zip 24 MB)" runs a
 *   staged deterministic progress fill (fixed 4%/70ms interval — no
 *   randomness), then flips to a saved state with a Toast receipt and a
 *   "Download again" reset. prefers-reduced-motion skips straight to
 *   the saved state.
 * - Copy affordances (boilerplate, press email, every fast-fact tile,
 *   every brand-color hex) write to the clipboard when available and
 *   always flip to an inline "Copied" state for 1.8s; only one copied
 *   flag is live at a time, mirroring a real single-clipboard.
 * - Fast-fact numbers count up (ease-out cubic) the first time the band
 *   is 30% visible; reduced motion renders the final figures.
 * - Section bands rise+fade 12px once on first intersection; reduced
 *   motion renders them visible with no transition.
 * - Logo/screenshot/headshot download chips and coverage external-link
 *   glyphs fire named Toasts (pseudo-downloads; nothing is dead).
 *
 * Color policy: token-pure except (1) ONE quarantined brand accent
 * literal (see ACCENT below with contrast math) with tints derived via
 * color-mix so no second accent literal exists; (2) the dark logo-asset
 * tile and the leadership monogram gradients, which are scheme-locked
 * brand ART surfaces (colorScheme:'dark', identical in both themes);
 * and (3) the brand color swatches, whose hex values ARE the fixture
 * content a journalist would copy — the swatch chips render exactly the
 * hex they document.
 *
 * Responsive contract (measured via ResizeObserver on the scroll
 * container — the inline demo stage is ~1045px, so viewport media
 * queries would never fire there):
 * - Column: max-width 1080px, centered; bands paint edge to edge.
 * - >920px: hero splits boilerplate/contact 3:2, facts 3-up, logo tiles
 *   4-up, dos/don'ts side by side, screenshots and leadership 3-up.
 * - <=920px: hero stacks, facts drop to 2-up, logo tiles 2-up,
 *   dos/don'ts stack, screenshots and leadership go single column, the
 *   timeline hides its left date gutter (dates move inline as Badges).
 * - <=820px: nav links collapse behind the menu button + dropdown.
 * - <=620px: facts drop to 1-up, swatch cards go full width, coverage
 *   rows wrap their date/action line below the headline, paddings
 *   tighten. Holds at 390px in the phone artboard with no overflow-x.
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
import {Icon} from '@astryxdesign/core/Icon';
import {Toast} from '@astryxdesign/core/Toast';
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  MenuIcon,
  PhoneIcon,
  XIcon,
} from 'lucide-react';

// ============= PAINT CONSTANTS =============

/**
 * Quarantined brand accent — Relay Robotics "Signal Orange".
 * Light #C2410C on #FFFFFF: L≈0.153 → contrast ≈ 5.2:1 (AA text).
 * Dark #FDA26B on #1C1C1E: L≈0.478 → contrast ≈ 8.6:1 (AAA text).
 * Every accent tint below derives from this ONE literal via color-mix.
 */
const ACCENT = 'light-dark(#C2410C, #FDA26B)';
const ACCENT_SOFT = \`color-mix(in srgb, \${ACCENT} 12%, transparent)\`;
const ACCENT_FAINT = \`color-mix(in srgb, \${ACCENT} 6%, transparent)\`;
const ACCENT_LINE = \`color-mix(in srgb, \${ACCENT} 32%, transparent)\`;

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

/** Sticky-nav height; smooth-scroll and the spy both allow for it. */
const NAV_ALLOWANCE = 64;
const SPY_OFFSET = 120;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns the scroll spy and hosts the sticky navbar.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered content column; bands paint full-bleed around it.
  column: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    paddingInline: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-6)',
  },
  bandTinted: {
    backgroundColor: 'var(--color-background-muted)',
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
    minHeight: 56,
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
  menuPanel: {
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
  menuLink: {
    display: 'flex',
    alignItems: 'center',
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
  iconButton40: {
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
  // ---- hero ----
  heroBand: {
    backgroundImage: \`radial-gradient(60% 90% at 88% 0%, \${ACCENT_SOFT}, transparent 62%)\`,
    backgroundColor: ACCENT_FAINT,
    borderBottom: '1px solid var(--color-border)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  heroHeadline: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 28,
  },
  heroSplit: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
  },
  heroSplitStacked: {
    flexDirection: 'column',
  },
  panelCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  boilerplateText: {
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  // Signature download pseudo-button with a staged progress fill.
  downloadButton: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingInline: 18,
    borderRadius: 10,
    border: \`1px solid \${ACCENT_LINE}\`,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  downloadFill: {
    position: 'absolute',
    inset: 0,
    right: 'auto',
    backgroundColor: ACCENT_SOFT,
    pointerEvents: 'none',
  },
  downloadLabel: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 15,
    fontWeight: 700,
  },
  contactRowButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontSize: 14,
    textAlign: 'left',
  },
  monoText: {
    fontFamily: MONO,
    fontSize: 13,
  },
  // ---- fast facts ----
  factsGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  factTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: 108,
  },
  factLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    color: 'var(--color-text-secondary)',
  },
  factLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  factValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  // ---- logo assets ----
  logoGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  logoTileCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  // Checkerboard = the universal "transparent asset" preview surface.
  checker: {
    height: 112,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-body)',
    backgroundImage:
      'linear-gradient(45deg, var(--color-background-muted) 25%, transparent 25%, transparent 75%, var(--color-background-muted) 75%), linear-gradient(45deg, var(--color-background-muted) 25%, transparent 25%, transparent 75%, var(--color-background-muted) 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 8px 8px',
  },
  // Scheme-locked ART surface: the dark logo asset previews on the same
  // near-black plate in both app themes, like a real asset browser.
  checkerDark: {
    colorScheme: 'dark',
    backgroundColor: '#15181D',
    backgroundImage:
      'linear-gradient(45deg, rgba(255, 255, 255, 0.07) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.07) 75%), linear-gradient(45deg, rgba(255, 255, 255, 0.07) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.07) 75%)',
  },
  logoTileMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 'var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
  },
  downloadChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // ---- usage dos / don'ts ----
  usageSplit: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  usageSplitStacked: {
    flexDirection: 'column',
  },
  usageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  usageDisc: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  usageDiscDo: {
    backgroundColor:
      'light-dark(rgba(52, 168, 83, 0.14), rgba(52, 168, 83, 0.24))',
    color: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  usageDiscDont: {
    backgroundColor:
      'light-dark(rgba(179, 38, 30, 0.10), rgba(242, 184, 181, 0.16))',
    color: 'var(--color-error, light-dark(#B3261E, #F2B8B5))',
  },
  usagePreview: {
    width: 76,
    height: 44,
    flexShrink: 0,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  // ---- schematic screenshots ----
  shotGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  shotCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  shotStage: {
    height: 168,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-3)',
    boxSizing: 'border-box',
    backgroundImage: \`radial-gradient(80% 100% at 50% 0%, \${ACCENT_FAINT}, transparent 70%)\`,
    backgroundColor: 'var(--color-background-muted)',
  },
  mockWindow: {
    width: '100%',
    maxWidth: 264,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-med)',
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 10px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
  },
  mockBody: {
    display: 'flex',
    gap: 8,
    padding: 10,
  },
  mockBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  phoneFrame: {
    width: 88,
    height: 148,
    borderRadius: 18,
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: 'var(--shadow-med)',
    padding: 10,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  shotMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 'var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
  },
  // ---- leadership ----
  leaderGrid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
  },
  leaderTile: {
    height: 120,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '0.04em',
    // Scheme-locked ART: monogram gradients are brand headshot stand-ins
    // and must not reflow with the app theme.
    colorScheme: 'dark',
    color: '#FFFFFF',
  },
  // ---- brand colors ----
  swatchRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
  },
  swatchCard: {
    flex: '1 1 168px',
    minWidth: 148,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  swatchChip: {
    height: 64,
  },
  swatchMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 'var(--spacing-3)',
  },
  copyHexButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    fontFamily: MONO,
    fontSize: 13,
    minHeight: 28,
  },
  // ---- coverage ----
  coverageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) 0',
  },
  coverageRowWrapped: {
    flexWrap: 'wrap',
  },
  outletTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 700,
  },
  // ---- founding story timeline ----
  timelineItem: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  timelineDateCol: {
    width: 92,
    flexShrink: 0,
    textAlign: 'right',
    paddingTop: 2,
  },
  timelineRail: {
    position: 'relative',
    width: 20,
    flexShrink: 0,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 9,
    width: 2,
    backgroundColor: 'var(--color-border)',
  },
  timelineDot: {
    position: 'absolute',
    top: 5,
    left: 4,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: ACCENT,
    border: '2px solid var(--color-background-body)',
    boxSizing: 'content-box',
  },
  timelineBody: {
    paddingBottom: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
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
  },
  // ---- toast ----
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 340,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Relay Robotics scale-up.
// No Date.now, no randomness, no network assets, no real outlets.

const BRAND = {
  name: 'Relay Robotics',
  updated: 'Updated Jul 8, 2026',
};

const BOILERPLATE =
  'Relay Robotics builds autonomous picking robots that work alongside ' +
  'people in warehouses. Founded in Boulder, Colorado in 2019, Relay has ' +
  'deployed more than 3,400 robots across 14 countries for 120 warehouse ' +
  'and 3PL operators. The company employs 240 people across four offices ' +
  'and has raised $86M, most recently a $52M Series C led by Meridian ' +
  'Growth in June 2026 to fund its European expansion from Rotterdam.';

const PRESS_CONTACT = {
  name: 'Nadia Reyes',
  initials: 'NR',
  title: 'Head of Communications',
  email: 'press@relayrobotics.com',
  phone: '+1 (720) 555-0139',
  note:
    'We reply within one business day. For embargoed briefings, put ' +
    'EMBARGO in the subject line.',
};

type SectionId = 'facts' | 'logos' | 'photos' | 'coverage' | 'story';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'facts', label: 'Fast facts'},
  {id: 'logos', label: 'Logos'},
  {id: 'photos', label: 'Screenshots'},
  {id: 'coverage', label: 'Coverage'},
  {id: 'story', label: 'Our story'},
];

interface FastFact {
  id: string;
  label: string;
  /** Static display when there is no count-up target. */
  staticValue?: string;
  /** Count-up target + formatter for numeric facts. */
  target?: number;
  format?: (value: number) => string;
  caption: string;
}

const FAST_FACTS: readonly FastFact[] = [
  {
    id: 'founded',
    label: 'Founded',
    staticValue: '2019',
    caption: 'Boulder garage, two founders',
  },
  {
    id: 'hq',
    label: 'Headquarters',
    staticValue: 'Boulder, CO',
    caption: 'EU hub in Rotterdam since 2026',
  },
  {
    id: 'headcount',
    label: 'Headcount',
    target: 240,
    format: value => \`\${Math.round(value)}\`,
    caption: 'Across 4 offices',
  },
  {
    id: 'funding',
    label: 'Total funding',
    target: 86,
    format: value => \`$\${Math.round(value)}M\`,
    caption: 'Series C led by Meridian Growth',
  },
  {
    id: 'customers',
    label: 'Customers',
    target: 120,
    format: value => \`\${Math.round(value)}\`,
    caption: 'Warehouse & 3PL operators',
  },
  {
    id: 'robots',
    label: 'Robots deployed',
    target: 3400,
    format: value => Math.round(value).toLocaleString('en-US'),
    caption: 'In 14 countries · 99.6% uptime',
  },
];

function factClipboard(fact: FastFact): string {
  const value =
    fact.staticValue ??
    (fact.target !== undefined && fact.format !== undefined
      ? fact.format(fact.target)
      : '');
  return \`\${fact.label}: \${value} (\${fact.caption})\`;
}

type LogoVariant = 'light' | 'dark' | 'mono' | 'glyph';

const LOGO_ASSETS: readonly {
  id: LogoVariant;
  label: string;
  caption: string;
}[] = [
  {id: 'light', label: 'Primary — light', caption: 'For light surfaces'},
  {id: 'dark', label: 'Primary — dark', caption: 'For dark surfaces'},
  {id: 'mono', label: 'Monochrome', caption: 'For single-ink print'},
  {id: 'glyph', label: 'Glyph only', caption: 'For favicons & avatars'},
];

const USAGE_DOS: readonly {id: string; text: string}[] = [
  {id: 'space', text: 'Keep clear space of at least one glyph-width'},
  {id: 'mono', text: 'Use the monochrome mark over photography'},
  {id: 'palette', text: 'Pair the mark only with approved brand colors'},
];

const USAGE_DONTS: readonly {
  id: 'stretch' | 'recolor' | 'contrast';
  text: string;
}[] = [
  {id: 'stretch', text: "Don't stretch, skew, or rotate the mark"},
  {id: 'recolor', text: "Don't recolor the mark outside the palette"},
  {id: 'contrast', text: "Don't set the mark on low-contrast fills"},
];

const SCREENSHOTS: readonly {
  id: 'fleet' | 'telemetry' | 'mobile';
  title: string;
  file: string;
  resolution: string;
}[] = [
  {
    id: 'fleet',
    title: 'Fleet dashboard',
    file: 'relay-fleet-dashboard.png',
    resolution: '3840 × 2160 · 4.6 MB',
  },
  {
    id: 'telemetry',
    title: 'Pick-path telemetry',
    file: 'relay-pick-telemetry.png',
    resolution: '2880 × 1800 · 3.1 MB',
  },
  {
    id: 'mobile',
    title: 'Operator mobile app',
    file: 'relay-operator-app.png',
    resolution: '1170 × 2532 · 1.8 MB',
  },
];

const LEADERS: readonly {
  id: string;
  name: string;
  initials: string;
  title: string;
  /** Scheme-locked art gradient (see Color policy). */
  gradient: [string, string];
}[] = [
  {
    id: 'voss',
    name: 'Mara Voss',
    initials: 'MV',
    title: 'Co-founder & CEO',
    gradient: ['#C2410C', '#7C2D12'],
  },
  {
    id: 'lindqvist',
    name: 'Theo Lindqvist',
    initials: 'TL',
    title: 'Co-founder & CTO',
    gradient: ['#334155', '#0F172A'],
  },
  {
    id: 'raghavan',
    name: 'Priya Raghavan',
    initials: 'PR',
    title: 'VP of Operations',
    gradient: ['#B45309', '#713F12'],
  },
];

// Swatch hexes are fixture CONTENT (the values a journalist copies);
// the chips render exactly the hex they document (see Color policy).
const BRAND_COLORS: readonly {
  id: string;
  name: string;
  hex: string;
  /** Hairline for the near-white swatch so it doesn't vanish. */
  needsBorder?: boolean;
}[] = [
  {id: 'signal', name: 'Signal Orange', hex: '#C2410C'},
  {id: 'graphite', name: 'Graphite', hex: '#1F2933'},
  {id: 'chassis', name: 'Chassis Grey', hex: '#9AA5B1'},
  {id: 'safety', name: 'Safety Green', hex: '#2F9E44'},
  {id: 'cloud', name: 'Cloud White', hex: '#F5F7FA', needsBorder: true},
];

const COVERAGE: readonly {
  id: string;
  outlet: string;
  initials: string;
  headline: string;
  date: string;
}[] = [
  {
    id: 'ledger',
    outlet: 'The Automation Ledger',
    initials: 'AL',
    headline:
      'Relay Robotics raises $52M to bring its picker fleet to Europe',
    date: 'Jun 18, 2026',
  },
  {
    id: 'techcurrent',
    outlet: 'TechCurrent',
    initials: 'TC',
    headline: 'Inside the Boulder lab where robots learn to unload trucks',
    date: 'May 2, 2026',
  },
  {
    id: 'warehouse',
    outlet: 'Warehouse Weekly',
    initials: 'WW',
    headline:
      "Relay's Series C signals a consolidation wave in warehouse automation",
    date: 'Jun 20, 2026',
  },
  {
    id: 'supplyline',
    outlet: 'The Supply Line',
    initials: 'SL',
    headline:
      'How a 240-person startup shipped 3,400 robots without a single recall',
    date: 'Mar 9, 2026',
  },
  {
    id: 'roboticsnow',
    outlet: 'Robotics Now',
    initials: 'RN',
    headline: "Relay Robotics' RX-4 named warehouse product of the year",
    date: 'Jan 22, 2026',
  },
  {
    id: 'foundersignal',
    outlet: 'Founder Signal',
    initials: 'FS',
    headline:
      'Mara Voss on hardware margins, patience, and the case against hype',
    date: 'Feb 11, 2026',
  },
];

const MILESTONES: readonly {
  id: string;
  date: string;
  title: string;
  copy: string;
}[] = [
  {
    id: 'garage',
    date: 'Mar 2019',
    title: 'Founded in a Boulder garage',
    copy:
      'Mara Voss and Theo Lindqvist assemble the RX-1 prototype from ' +
      'salvaged forklift parts and a climbing-gym winch.',
  },
  {
    id: 'pilot',
    date: 'Nov 2020',
    title: 'First paid pilot',
    copy:
      'Six robots at a Denver 3PL pick 41,000 orders through the ' +
      'holiday peak with zero safety incidents.',
  },
  {
    id: 'seriesb',
    date: 'Jun 2022',
    title: 'Series B — $34M',
    copy:
      'Opens the Reno factory, ships the RX-3, and passes 100 ' +
      'employees and 40 live customer sites.',
  },
  {
    id: 'thousandth',
    date: 'Sep 2024',
    title: '1,000th robot ships',
    copy:
      'Fleet-wide uptime reaches 99.6% and the RX-4 adds truck ' +
      'unloading — still no recalls.',
  },
  {
    id: 'seriesc',
    date: 'Jun 2026',
    title: 'Series C — $52M',
    copy:
      'Meridian Growth leads the round; Relay opens its Rotterdam hub ' +
      'and begins European deployments.',
  },
];

// ============= HOOKS =============

/**
 * Measures the scroll container with a ResizeObserver — the inline demo
 * stage is ~1045px wide inside a 1440px window, so viewport media
 * queries never fire there.
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

/** Live prefers-reduced-motion flag; false where matchMedia is absent. */
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
 * True once the node has intersected the viewport (30% visible), then
 * stays true (fire once). Falls back to visible when
 * IntersectionObserver is unavailable so nothing hides in static runs.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
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
      {threshold: 0.3},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases 0 → target (ease-out cubic) once \`isActive\` flips true.
 * Reduced motion and rAF-less environments snap to the target.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  durationMs = 1300,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return undefined;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof requestAnimationFrame === 'undefined') {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, durationMs]);
  return isActive && value > target ? target : value;
}

// ============= SMALL PIECES =============

/**
 * Rise+fade scroll reveal (12px, fire once). Reduced motion renders
 * children visible with no transition.
 */
function Reveal({children}: {children: ReactNode}) {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView();
  const shown = reduced || inView;
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(12px)',
        transition: reduced
          ? 'none'
          : 'opacity 480ms ease, transform 480ms ease',
      }}>
      {children}
    </div>
  );
}

/** The Relay glyph: two nodes joined by a relay link. */
function RelayGlyph({size = 22, color}: {size?: number; color: string}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M8.7 15.3 15.3 8.7"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle cx="6.8" cy="17.2" r="3" fill={color} />
      <circle cx="17.2" cy="6.8" r="3" fill={color} />
    </svg>
  );
}

/** Glyph + wordmark lockup; variant picks the logo-asset treatment. */
function RelayLockup({
  variant,
  size = 22,
}: {
  variant: LogoVariant;
  size?: number;
}) {
  const glyphColor =
    variant === 'dark'
      ? '#FFFFFF' // sits on the scheme-locked dark checker plate
      : variant === 'mono'
        ? 'var(--color-text-primary)'
        : ACCENT;
  const wordColor =
    variant === 'dark' ? '#FFFFFF' : 'var(--color-text-primary)';
  return (
    <span
      style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
      aria-hidden="true">
      <RelayGlyph size={size} color={glyphColor} />
      {variant !== 'glyph' && (
        <span
          style={{
            fontSize: size * 0.62,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: wordColor,
            whiteSpace: 'nowrap',
          }}>
          RELAY{' '}
          <span style={{fontWeight: 500, opacity: 0.75}}>ROBOTICS</span>
        </span>
      )}
    </span>
  );
}

/** Uppercase section eyebrow + heading + optional supporting line. */
function SectionIntro({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <VStack gap={1}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <Heading level={2}>{title}</Heading>
      {caption !== undefined && (
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
      )}
    </VStack>
  );
}

/** One count-up figure inside a fast-fact tile. */
function FactValue({fact, isActive}: {fact: FastFact; isActive: boolean}) {
  const value = useCountUp(fact.target ?? 0, isActive);
  if (fact.staticValue !== undefined) {
    return <span style={styles.factValue}>{fact.staticValue}</span>;
  }
  return (
    <span style={styles.factValue}>
      {fact.format !== undefined ? fact.format(value) : Math.round(value)}
    </span>
  );
}

/** Tiny misuse preview for the don'ts column. */
function MisusePreview({kind}: {kind: 'stretch' | 'recolor' | 'contrast'}) {
  if (kind === 'stretch') {
    return (
      <span style={{transform: 'scaleX(1.7)', display: 'inline-flex'}}>
        <RelayGlyph size={20} color={ACCENT} />
      </span>
    );
  }
  if (kind === 'recolor') {
    return (
      <RelayGlyph
        size={20}
        color="var(--color-error, light-dark(#B3261E, #F2B8B5))"
      />
    );
  }
  // Low contrast: the glyph nearly disappears into the muted fill.
  return (
    <RelayGlyph
      size={20}
      color="color-mix(in srgb, var(--color-text-secondary) 22%, transparent)"
    />
  );
}

/** CSS-drawn schematic screenshot stand-ins (no network assets). */
function ScreenshotArt({kind}: {kind: 'fleet' | 'telemetry' | 'mobile'}) {
  if (kind === 'fleet') {
    return (
      <div style={styles.mockWindow}>
        <div style={styles.mockChrome}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
        </div>
        <div style={styles.mockBody}>
          <div
            style={{
              width: 52,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
            <div style={{...styles.mockBar, width: '100%'}} />
            <div style={{...styles.mockBar, width: '78%'}} />
            <div style={{...styles.mockBar, width: '86%'}} />
            <div style={{...styles.mockBar, width: '64%'}} />
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
            <div style={{display: 'flex', gap: 4}}>
              {[52, 40, 46].map(width => (
                <div key={width} style={{...styles.mockBar, width}} />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                height: 44,
              }}>
              {[18, 30, 24, 40, 34, 44, 28].map((height, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height,
                    borderRadius: 3,
                    backgroundColor:
                      index === 5 ? ACCENT : ACCENT_SOFT,
                  }}
                />
              ))}
            </div>
            <div style={{...styles.mockBar, width: '58%'}} />
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'telemetry') {
    return (
      <div style={styles.mockWindow}>
        <div style={styles.mockChrome}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
        </div>
        <svg
          viewBox="0 0 240 96"
          style={{display: 'block', width: '100%', height: 96}}
          aria-hidden="true">
          {[24, 48, 72].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="240"
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          ))}
          {[60, 120, 180].map(x => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="96"
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          ))}
          <polyline
            points="16,78 60,78 60,40 128,40 128,64 196,64 196,22 226,22"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {[
            [16, 78],
            [60, 40],
            [128, 64],
            [196, 22],
            [226, 22],
          ].map(([cx, cy]) => (
            <circle
              key={\`\${cx}-\${cy}\`}
              cx={cx}
              cy={cy}
              r="4"
              fill="var(--color-background-body)"
              stroke={ACCENT}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div style={styles.phoneFrame}>
      <div style={{...styles.mockBar, width: '52%'}} />
      <div
        style={{
          height: 40,
          borderRadius: 8,
          backgroundColor: ACCENT_SOFT,
          border: \`1px solid \${ACCENT_LINE}\`,
        }}
      />
      <div style={{...styles.mockBar, width: '84%'}} />
      <div style={{...styles.mockBar, width: '68%'}} />
      <div
        style={{
          marginTop: 'auto',
          height: 22,
          borderRadius: 11,
          backgroundColor: ACCENT,
        }}
      />
    </div>
  );
}

// ============= PAGE =============

export default function PressMediaKitTemplate() {
  const reducedMotion = usePrefersReducedMotion();

  // ---- responsive: measure the scroll container, not the viewport ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pageRef);
  const isMid = pageWidth > 0 && pageWidth <= 920;
  const isNavCompact = pageWidth > 0 && pageWidth <= 820;
  const isCompact = pageWidth > 0 && pageWidth <= 620;

  // ---- nav: menu dropdown + scroll spy ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- clipboard: one live "Copied" flag, like a real clipboard ----
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  // ---- signature moment: staged .zip download progress ----
  const [downloadPhase, setDownloadPhase] = useState<
    'idle' | 'running' | 'done'
  >('idle');
  const [downloadPct, setDownloadPct] = useState(0);

  // ---- toast receipts ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Menu dismisses on Escape (refocusing the trigger) and on pointerdown
  // outside the navbar; listeners only run while it is open.
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

  // Download progress: fixed 4%/70ms steps — deterministic, no clocks.
  useEffect(() => {
    if (downloadPhase !== 'running') {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setDownloadPct(previous => Math.min(100, previous + 4));
    }, 70);
    return () => window.clearInterval(interval);
  }, [downloadPhase]);

  useEffect(() => {
    if (downloadPhase === 'running' && downloadPct >= 100) {
      setDownloadPhase('done');
      setToast(previous => ({
        key: (previous?.key ?? 0) + 1,
        message: 'relay-press-kit.zip saved (24 MB).',
      }));
    }
  }, [downloadPhase, downloadPct]);

  // Clear any pending copied-state timer on unmount.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const copyToClipboard = (key: string, text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard may be unavailable in sandboxed frames; the inline
      // "Copied" feedback below is the demo contract either way.
    }
    setCopiedKey(key);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const startDownload = () => {
    if (downloadPhase === 'running') {
      return;
    }
    if (reducedMotion) {
      // Reduced motion: no staged fill — jump straight to the receipt.
      setDownloadPct(100);
      setDownloadPhase('done');
      fireToast('relay-press-kit.zip saved (24 MB).');
      return;
    }
    setDownloadPct(0);
    setDownloadPhase('running');
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /** Scroll spy: the last anchor band above the fold line wins. */
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

  // ---- fast-facts count-up trigger (fires once at 30% visible) ----
  const [factsRef, factsInView] = useInView();

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isCompact ? styles.columnCompact : null),
  };

  // ============= CHROME =============

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Press kit">
      <div style={styles.navInner}>
        <HStack gap={2} vAlign="center">
          <RelayGlyph size={24} color={ACCENT} />
          <Text type="label">{BRAND.name}</Text>
          <Badge variant="neutral" label="Press" />
        </HStack>
        <StackItem size="fill">
          {!isNavCompact && (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={{
                    ...styles.navLink,
                    ...(activeSection === anchor.id
                      ? styles.navLinkActive
                      : null),
                  }}
                  aria-current={
                    activeSection === anchor.id ? 'true' : undefined
                  }
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          )}
        </StackItem>
        {!isNavCompact && (
          <Button
            label={downloadPhase === 'done' ? 'Kit saved' : 'Download kit'}
            variant="primary"
            size="md"
            icon={
              <Icon
                icon={downloadPhase === 'done' ? CheckIcon : DownloadIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={startDownload}
          />
        )}
        {isNavCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.iconButton40}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" />
          </button>
        )}
        {isNavCompact && isMenuOpen && (
          <div style={styles.menuPanel} role="menu" aria-label="Sections">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.menuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <Button
                label="Download kit (.zip 24 MB)"
                variant="primary"
                size="md"
                icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
                onClick={() => {
                  setIsMenuOpen(false);
                  startDownload();
                }}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const downloadLabel =
    downloadPhase === 'done'
      ? 'relay-press-kit.zip saved'
      : downloadPhase === 'running'
        ? \`Downloading… \${downloadPct}%\`
        : 'Download kit (.zip 24 MB)';

  const hero = (
    <div style={styles.heroBand}>
      <div style={columnStyle}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <span style={styles.eyebrow}>Press &amp; media kit</span>
            <Badge variant="info" label={BRAND.updated} />
          </HStack>
          <h1
            style={{
              ...styles.heroHeadline,
              ...(isCompact ? styles.heroHeadlineCompact : null),
            }}>
            Relay Robotics press kit
          </h1>
          <Text type="supporting" color="secondary">
            Everything you need to write about us — boilerplate, logos,
            screenshots, headshots, and the numbers, all approved for
            editorial use.
          </Text>
        </VStack>

        <div
          style={{
            ...styles.heroSplit,
            ...(isMid ? styles.heroSplitStacked : null),
          }}>
          {/* Boilerplate + download */}
          <div style={{...styles.panelCard, flex: '3 1 0', minWidth: 0}}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <Text type="label">Company boilerplate</Text>
              </StackItem>
              <Button
                label={copiedKey === 'boilerplate' ? 'Copied' : 'Copy'}
                variant="secondary"
                size="sm"
                icon={
                  <Icon
                    icon={copiedKey === 'boilerplate' ? CheckIcon : CopyIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={() => copyToClipboard('boilerplate', BOILERPLATE)}
              />
            </HStack>
            <p style={styles.boilerplateText}>{BOILERPLATE}</p>
            <HStack gap={2} vAlign="center" wrap="wrap">
              {/* Signature moment: staged deterministic download fill. */}
              <button
                type="button"
                style={styles.downloadButton}
                onClick={startDownload}>
                <span
                  aria-hidden="true"
                  style={{
                    ...styles.downloadFill,
                    width: \`\${downloadPhase === 'idle' ? 0 : downloadPct}%\`,
                  }}
                />
                <span style={styles.downloadLabel}>
                  <Icon
                    icon={downloadPhase === 'done' ? CheckIcon : DownloadIcon}
                    size="sm"
                    color="inherit"
                  />
                  {downloadLabel}
                </span>
              </button>
              {downloadPhase === 'done' && (
                <Button
                  label="Download again"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDownloadPct(0);
                    setDownloadPhase('idle');
                  }}
                />
              )}
              <Text type="supporting" color="secondary">
                Logos, screenshots, headshots, and this page as a PDF.
              </Text>
            </HStack>
          </div>

          {/* Press contact card */}
          <div style={{...styles.panelCard, flex: '2 1 0', minWidth: 0}}>
            <Text type="label">Press contact</Text>
            <HStack gap={3} vAlign="center">
              <div style={styles.contactAvatar} aria-hidden="true">
                {PRESS_CONTACT.initials}
              </div>
              <VStack gap={0}>
                <Text weight="semibold">{PRESS_CONTACT.name}</Text>
                <Text type="supporting" color="secondary">
                  {PRESS_CONTACT.title}
                </Text>
              </VStack>
            </HStack>
            <VStack gap={1}>
              <button
                type="button"
                style={styles.contactRowButton}
                onClick={() =>
                  copyToClipboard('press-email', PRESS_CONTACT.email)
                }>
                <Icon icon={MailIcon} size="sm" color="secondary" />
                <span style={styles.monoText}>{PRESS_CONTACT.email}</span>
                <Icon
                  icon={copiedKey === 'press-email' ? CheckIcon : CopyIcon}
                  size="xsm"
                  color={copiedKey === 'press-email' ? 'success' : 'secondary'}
                />
              </button>
              <HStack gap={2} vAlign="center">
                <Icon icon={PhoneIcon} size="sm" color="secondary" />
                <span style={styles.monoText}>{PRESS_CONTACT.phone}</span>
              </HStack>
            </VStack>
            <Text type="supporting" color="secondary">
              {PRESS_CONTACT.note}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  // ============= SECTIONS =============

  const factsSection = (
    <section
      id="facts"
      ref={registerSection('facts')}
      aria-label="Fast facts">
      <div style={columnStyle}>
        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Fast facts"
              title="The numbers, checked"
              caption="Click any tile to copy it exactly as written — every figure is current as of July 2026."
            />
            <div
              ref={factsRef}
              style={{
                ...styles.factsGrid,
                gridTemplateColumns: isCompact
                  ? '1fr'
                  : isMid
                    ? 'repeat(2, 1fr)'
                    : 'repeat(3, 1fr)',
              }}>
              {FAST_FACTS.map(fact => (
                <button
                  key={fact.id}
                  type="button"
                  style={styles.factTile}
                  onClick={() =>
                    copyToClipboard(\`fact-\${fact.id}\`, factClipboard(fact))
                  }>
                  <span style={styles.factLabelRow}>
                    <span style={styles.factLabel}>{fact.label}</span>
                    <Icon
                      icon={
                        copiedKey === \`fact-\${fact.id}\` ? CheckIcon : CopyIcon
                      }
                      size="xsm"
                      color={
                        copiedKey === \`fact-\${fact.id}\`
                          ? 'success'
                          : 'secondary'
                      }
                    />
                  </span>
                  <FactValue fact={fact} isActive={factsInView} />
                  <Text type="supporting" color="secondary">
                    {copiedKey === \`fact-\${fact.id}\`
                      ? 'Copied to clipboard'
                      : fact.caption}
                  </Text>
                </button>
              ))}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const logosSection = (
    <section
      id="logos"
      ref={registerSection('logos')}
      style={styles.bandTinted}
      aria-label="Logo assets">
      <div style={columnStyle}>
        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Logo assets"
              title="Marks & usage"
              caption="Four approved lockups on transparency previews. SVG for screens, PNG at 4x for everything else."
            />
            <div
              style={{
                ...styles.logoGrid,
                gridTemplateColumns: isMid
                  ? 'repeat(2, 1fr)'
                  : 'repeat(4, 1fr)',
              }}>
              {LOGO_ASSETS.map(asset => (
                <div key={asset.id} style={styles.logoTileCard}>
                  <div
                    style={{
                      ...styles.checker,
                      ...(asset.id === 'dark' ? styles.checkerDark : null),
                    }}
                    role="img"
                    aria-label={\`\${asset.label} logo preview\`}>
                    <RelayLockup
                      variant={asset.id}
                      size={asset.id === 'glyph' ? 34 : 20}
                    />
                  </div>
                  <div style={styles.logoTileMeta}>
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {asset.label}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {asset.caption}
                      </Text>
                    </VStack>
                    <HStack gap={1} wrap="wrap">
                      {(['SVG', 'PNG'] as const).map(format => (
                        <button
                          key={format}
                          type="button"
                          style={styles.downloadChip}
                          onClick={() =>
                            fireToast(
                              \`relay-logo-\${asset.id}.\${format.toLowerCase()} download started.\`,
                            )
                          }>
                          <Icon
                            icon={DownloadIcon}
                            size="xsm"
                            color="inherit"
                          />
                          {format}
                        </button>
                      ))}
                    </HStack>
                  </div>
                </div>
              ))}
            </div>

            {/* Usage dos / don'ts */}
            <div
              style={{
                ...styles.usageSplit,
                ...(isMid ? styles.usageSplitStacked : null),
              }}>
              <div style={{...styles.panelCard, flex: '1 1 0', minWidth: 0}}>
                <Text type="label">Do</Text>
                {USAGE_DOS.map((rule, index) => (
                  <div key={rule.id} style={styles.usageRow}>
                    <span
                      style={{...styles.usageDisc, ...styles.usageDiscDo}}
                      aria-hidden="true">
                      <Icon icon={CheckIcon} size="xsm" color="inherit" />
                    </span>
                    <StackItem size="fill">
                      <Text size="sm">{rule.text}</Text>
                    </StackItem>
                    <span style={styles.usagePreview} aria-hidden="true">
                      {index === 0 && (
                        <span
                          style={{
                            border: \`1px dashed \${ACCENT_LINE}\`,
                            borderRadius: 6,
                            padding: '6px 10px',
                            display: 'inline-flex',
                          }}>
                          <RelayGlyph size={16} color={ACCENT} />
                        </span>
                      )}
                      {index === 1 && (
                        <span
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // Scheme-locked "photograph" stand-in.
                            colorScheme: 'dark',
                            background:
                              'linear-gradient(135deg, #3D4852 0%, #1F2933 100%)',
                          }}>
                          <RelayGlyph size={18} color="#FFFFFF" />
                        </span>
                      )}
                      {index === 2 && (
                        <RelayGlyph size={18} color={ACCENT} />
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{...styles.panelCard, flex: '1 1 0', minWidth: 0}}>
                <Text type="label">Don&rsquo;t</Text>
                {USAGE_DONTS.map(rule => (
                  <div key={rule.id} style={styles.usageRow}>
                    <span
                      style={{...styles.usageDisc, ...styles.usageDiscDont}}
                      aria-hidden="true">
                      <Icon icon={XIcon} size="xsm" color="inherit" />
                    </span>
                    <StackItem size="fill">
                      <Text size="sm">{rule.text}</Text>
                    </StackItem>
                    <span style={styles.usagePreview} aria-hidden="true">
                      <MisusePreview kind={rule.id} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const photosSection = (
    <section
      id="photos"
      ref={registerSection('photos')}
      aria-label="Screenshots and headshots">
      <div style={columnStyle}>
        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Product screenshots"
              title="Screens, ready to run"
              caption="Schematic previews below; the kit includes full-resolution captures with transparent device frames."
            />
            <div
              style={{
                ...styles.shotGrid,
                gridTemplateColumns: isMid ? '1fr' : 'repeat(3, 1fr)',
              }}>
              {SCREENSHOTS.map(shot => (
                <div key={shot.id} style={styles.shotCard}>
                  <div
                    style={styles.shotStage}
                    role="img"
                    aria-label={\`\${shot.title} preview\`}>
                    <ScreenshotArt kind={shot.id} />
                  </div>
                  <div style={styles.shotMeta}>
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {shot.title}
                      </Text>
                      <span
                        style={{
                          ...styles.monoText,
                          color: 'var(--color-text-secondary)',
                          fontSize: 12,
                        }}>
                        {shot.file} · {shot.resolution}
                      </span>
                    </VStack>
                    <HStack>
                      <button
                        type="button"
                        style={styles.downloadChip}
                        onClick={() =>
                          fireToast(\`\${shot.file} download started.\`)
                        }>
                        <Icon icon={DownloadIcon} size="xsm" color="inherit" />
                        PNG
                      </button>
                    </HStack>
                  </div>
                </div>
              ))}
            </div>
          </VStack>
        </Reveal>

        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Leadership"
              title="Headshots & bios"
              caption="Monogram stand-ins below; the kit ships 2400px headshots on white and transparent backgrounds."
            />
            <div
              style={{
                ...styles.leaderGrid,
                gridTemplateColumns: isCompact ? '1fr' : 'repeat(3, 1fr)',
              }}>
              {LEADERS.map(leader => (
                <div key={leader.id} style={styles.panelCard}>
                  <div
                    style={{
                      ...styles.leaderTile,
                      background: \`linear-gradient(135deg, \${leader.gradient[0]} 0%, \${leader.gradient[1]} 100%)\`,
                    }}
                    role="img"
                    aria-label={\`\${leader.name} headshot placeholder\`}>
                    {leader.initials}
                  </div>
                  <VStack gap={0}>
                    <Text weight="semibold">{leader.name}</Text>
                    <Text type="supporting" color="secondary">
                      {leader.title}
                    </Text>
                  </VStack>
                  <HStack gap={1} wrap="wrap">
                    <button
                      type="button"
                      style={styles.downloadChip}
                      onClick={() =>
                        fireToast(
                          \`\${leader.name} headshot (2400px) download started.\`,
                        )
                      }>
                      <Icon icon={DownloadIcon} size="xsm" color="inherit" />
                      Headshot
                    </button>
                    <button
                      type="button"
                      style={styles.downloadChip}
                      onClick={() =>
                        fireToast(\`\${leader.name} bio download started.\`)
                      }>
                      <Icon icon={DownloadIcon} size="xsm" color="inherit" />
                      Bio .txt
                    </button>
                  </HStack>
                </div>
              ))}
            </div>
          </VStack>
        </Reveal>

        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Brand colors"
              title="The palette"
              caption="Click a hex to copy it. Signal Orange is the accent; Graphite carries text."
            />
            <div style={styles.swatchRow}>
              {BRAND_COLORS.map(color => (
                <div key={color.id} style={styles.swatchCard}>
                  {/* Swatch chips render the fixture hex they document. */}
                  <div
                    style={{
                      ...styles.swatchChip,
                      backgroundColor: color.hex,
                      ...(color.needsBorder
                        ? {borderBottom: '1px solid var(--color-border)'}
                        : null),
                    }}
                    role="img"
                    aria-label={\`\${color.name} swatch\`}
                  />
                  <div style={styles.swatchMeta}>
                    <Text size="sm" weight="semibold">
                      {color.name}
                    </Text>
                    <button
                      type="button"
                      style={styles.copyHexButton}
                      onClick={() =>
                        copyToClipboard(\`hex-\${color.id}\`, color.hex)
                      }>
                      {copiedKey === \`hex-\${color.id}\` ? 'Copied!' : color.hex}
                      <Icon
                        icon={
                          copiedKey === \`hex-\${color.id}\`
                            ? CheckIcon
                            : CopyIcon
                        }
                        size="xsm"
                        color={
                          copiedKey === \`hex-\${color.id}\`
                            ? 'success'
                            : 'secondary'
                        }
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const coverageSection = (
    <section
      id="coverage"
      ref={registerSection('coverage')}
      style={styles.bandTinted}
      aria-label="Recent coverage">
      <div style={columnStyle}>
        <Reveal>
          <VStack gap={3}>
            <SectionIntro
              eyebrow="In the press"
              title="Recent coverage"
              caption="A sample of 2026 coverage — all outlets fictional for this demo."
            />
            <div style={{...styles.panelCard, gap: 0, paddingBlock: 4}}>
              {COVERAGE.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.coverageRow,
                    ...(isCompact ? styles.coverageRowWrapped : null),
                    borderTop:
                      index === 0
                        ? 'none'
                        : '1px solid var(--color-border)',
                  }}>
                  <div style={styles.outletTile} aria-hidden="true">
                    {item.initials}
                  </div>
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text size="sm" weight="semibold">
                        {item.headline}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {item.outlet}
                      </Text>
                    </VStack>
                  </StackItem>
                  <HStack gap={2} vAlign="center">
                    <Text type="supporting" color="secondary">
                      {item.date}
                    </Text>
                    <button
                      type="button"
                      aria-label={\`Open "\${item.headline}" on \${item.outlet}\`}
                      style={{...styles.iconButton40, width: 32, height: 32}}
                      onClick={() =>
                        fireToast(\`Opening \${item.outlet} article…\`)
                      }>
                      <Icon
                        icon={ArrowUpRightIcon}
                        size="sm"
                        color="secondary"
                      />
                    </button>
                  </HStack>
                </div>
              ))}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const storySection = (
    <section
      id="story"
      ref={registerSection('story')}
      aria-label="Founding story">
      <div style={columnStyle}>
        <Reveal>
          <VStack gap={4}>
            <SectionIntro
              eyebrow="Founding story"
              title="Seven years, five milestones"
              caption="The short version — the long version is in the kit as founding-story.pdf."
            />
            <div>
              {MILESTONES.map((milestone, index) => (
                <div key={milestone.id} style={styles.timelineItem}>
                  {!isMid && (
                    <div style={styles.timelineDateCol}>
                      <Text type="supporting" color="secondary">
                        {milestone.date}
                      </Text>
                    </div>
                  )}
                  <div style={styles.timelineRail} aria-hidden="true">
                    <span
                      style={{
                        ...styles.timelineLine,
                        ...(index === 0 ? {top: 8} : null),
                        ...(index === MILESTONES.length - 1
                          ? {bottom: 'auto', height: 8}
                          : null),
                      }}
                    />
                    <span style={styles.timelineDot} />
                  </div>
                  <div
                    style={{
                      ...styles.timelineBody,
                      ...(index === MILESTONES.length - 1
                        ? {paddingBottom: 0}
                        : null),
                    }}>
                    {isMid && (
                      <HStack>
                        <Badge variant="neutral" label={milestone.date} />
                      </HStack>
                    )}
                    <Text weight="semibold">{milestone.title}</Text>
                    <Text type="supporting" color="secondary">
                      {milestone.copy}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </VStack>
        </Reveal>
      </div>
    </section>
  );

  const footer = (
    <footer style={styles.footer}>
      <div style={columnStyle}>
        <VStack gap={3}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <RelayGlyph size={20} color={ACCENT} />
                <Text type="label">{BRAND.name}</Text>
              </HStack>
            </StackItem>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast('Opening relayrobotics.com…')}>
              Company site
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast('Opening the newsroom…')}>
              Newsroom
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast('Opening brand guidelines…')}>
              Brand guidelines
            </button>
          </HStack>
          <Text type="supporting" color="secondary">
            All assets in this kit are approved for editorial use without
            further permission. For advertising, co-branding, or anything
            else, email{' '}
            <span style={{...styles.monoText, fontSize: 12}}>
              {PRESS_CONTACT.email}
            </span>{' '}
            first.
          </Text>
          <Text type="supporting" color="secondary">
            © 2026 Relay Robotics, Inc. · Boulder, CO · Rotterdam, NL
          </Text>
        </VStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Relay Robotics press kit">
            <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
              {navbar}
              {hero}
              {factsSection}
              {logosSection}
              {photosSection}
              {coverageSection}
              {storySection}
              {footer}
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
            isAutoHide={true}
            autoHideDuration={4000}
            onDismiss={() => setToast(null)}
            body={<Text weight="semibold">{toast.message}</Text>}
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};