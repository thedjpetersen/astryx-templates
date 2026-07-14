// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file devtool-terminal-landing.tsx
 * @input Deterministic fixtures only (the fictional "Quarry" incremental
 *   build tool: an install command plus five staged installer output lines
 *   with per-line delays, three "why" cards with mono proof stats, four
 *   before/after benchmark rows against invented competitors (fixed
 *   seconds), three annotated code-diff tabs (Config / Cache / CI) with
 *   diff-style CodeBlock sources, six invented company monogram tiles,
 *   three quickstart steps with copyable commands, and footer link columns
 *   with a `v3.2.0 · MIT` version badge)
 * @output Dark-first, full-scroll landing page for a CLI build tool: a
 *   sticky navbar (brand mark + 4 smooth-scrolling anchor links with
 *   scroll-spy + a `Star on GitHub · 24.1k` CTA, collapsing to a menu
 *   button + dropdown at compact widths), a scheme-locked dark hero whose
 *   terminal window types the install command character by character, then
 *   stages installer output lines to a success check and loops (with a
 *   Replay button; reduced motion renders the final frame), a 3-up "why"
 *   card grid, a benchmark band whose four before/after bars grow and
 *   whose second counts animate up on first reveal, a Config/Cache/CI
 *   TabList swapping annotated diff CodeBlocks, a monogram logo strip, a
 *   3-step quickstart with copyable commands, and a dark footer with the
 *   version badge. CTAs that would leave the page fire a corner Toast so
 *   the wiring is provable.
 * @position Page template; emitted by `astryx template devtool-terminal-landing`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container div that owns scroll-spy; the navbar inside it
 * is position:sticky top:0. Full-bleed bands alternate (dark hero → plain
 * why → muted benchmarks → plain features → muted logos → plain
 * quickstart → dark footer); each band centers a 1120px inner column.
 * The Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - The hero terminal types `curl -fsSL quarry.dev/install | sh` at a
 *   fixed cadence, stages five installer lines on fixture delays, shows a
 *   success chip, idles, then loops. Replay restarts the run immediately.
 *   Under prefers-reduced-motion the final frame renders statically and
 *   the loop/replay affordance is hidden.
 * - Nav anchors smooth-scroll the container to real section ids beneath
 *   the sticky nav; onScroll spies the last section above the fold line
 *   and highlights the matching link (aria-current). At compact widths the
 *   links collapse behind a 40px menu button whose dropdown closes on
 *   Escape, outside pointerdown, or any selection.
 * - The benchmark band reveals once via IntersectionObserver: bars grow to
 *   their fixture ratios with staggered transitions while both second
 *   readouts count up (rAF ease-out). Reduced motion renders final values
 *   and full-width bars instantly.
 * - The feature pane's Config / Cache / CI tabs swap the annotation copy
 *   and the diff CodeBlock together. Quickstart CodeBlocks carry working
 *   copy buttons; onCopy fires a confirmation Toast.
 * - Section intros and cards rise+fade 12px on first intersection (fire
 *   once); reduced motion renders them visible with no transition.
 * - `Star on GitHub`, docs, and footer links would leave the page, so
 *   they fire named Toasts instead of dead-ending.
 *
 * Color policy (matches the saas-landing-page exemplar): app chrome and
 * all token-adaptive bands use var(--color-*) tokens. ONE quarantined
 * accent literal (ACCENT, amber) is expressed as a light-dark() pair with
 * contrast math below. Literal colors are otherwise KEPT only on
 * deliberately scheme-locked surfaces, each with colorScheme:'dark' in
 * its style: the hero band, the terminal window, the footer, and the
 * monogram brand-art tiles — terminal art and brand gradients must not
 * reflow with the app theme. DARK_TEXT* / TERM_* literals exist only for
 * text sitting on those locked surfaces.
 *
 * Responsive contract (useElementWidth ResizeObserver — the inline demo
 * stage is ~1045px wide, so viewport media queries are never used):
 * - Column: max-width 1120px, centered; bands paint edge to edge.
 * - >880px: navbar shows inline anchors + the star CTA; hero is split
 *   copy/terminal; the feature pane is split annotation/CodeBlock.
 * - <=880px: nav links + CTA collapse behind a 40px menu button dropdown;
 *   hero and the feature pane stack (terminal and code below copy).
 * - Grid-driven reflow: why cards and quickstart steps flow 3 → 2 → 1
 *   (Grid minWidth), and the logo strip wraps 6 → 3 → 2 tiles per row.
 * - <=620px: headline and section titles step down, band paddings
 *   tighten, benchmark name columns narrow, and footer columns drop to
 *   2-up. Action rows wrap, so the page holds at 390px with no
 *   overflow-x.
 * - Tap targets: menu button and nav links are explicit 40px controls;
 *   nothing on the page requires hover.
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
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Toast} from '@astryxdesign/core/Toast';
import {
  BookOpenIcon,
  CheckIcon,
  DatabaseIcon,
  GitBranchIcon,
  MenuIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  StarIcon,
  TerminalIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal (the one allowed by the landing contract).
 * Contrast math: light #B45309 on white ≈ 5.7:1 (AA for text and UI);
 * dark #FBBF24 on the dark body (~#1A1A1A) ≈ 9.6:1 and on the locked
 * hero (#0B0F14) ≈ 11.2:1 (AAA). Used for eyebrows, active nav links,
 * card glyphs, Quarry benchmark bars, and step numerals.
 */
const ACCENT = 'light-dark(#B45309, #FBBF24)';

// Scheme-locked dark-surface text (hero band, terminal, footer only).
const DARK_TEXT = '#F1F5F9';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.78)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.55)';
const CHIP_BG = 'rgba(255, 255, 255, 0.10)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.20)';

// Terminal art literals (locked with colorScheme:'dark').
const TERM_BG = '#0D1117';
const TERM_BORDER = 'rgba(255, 255, 255, 0.14)';
const TERM_MUTED = '#8B949E';
const TERM_COMMAND = '#E6EDF3';
const TERM_GREEN = '#7EE787';
const TERM_AMBER = '#FBBF24';

// Depth tiers (used consistently: cards = raised; staged hero and hovered
// cards = floating; glass chips add an inset hairline on top).
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.08), 0 8px 24px -12px rgba(0, 0, 0, 0.22), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.35)';

// Aurora hues reuse literals already quarantined on this page (TERM_AMBER,
// TERM_GREEN and the Nightjar monogram indigo) — no new hues introduced.
const AURORA_INDIGO = '#6366F1';

// Grain texture: inline feTurbulence SVG data URI; opacity set per layer.
const GRAIN_URI = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;

/** Sticky-nav height; smooth-scroll and scroll-spy both allow for it. */
const NAV_ALLOWANCE = 68;
const SPY_OFFSET = 140;

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scroll container: owns scroll-spy and hosts the sticky navbar.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // Centered inner column reused inside every full-bleed band.
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
  band: {
    paddingBlock: 104,
  },
  bandPhone: {
    paddingBlock: 60,
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- sticky navbar (scheme-locked dark chrome for a dark-first tool;
  // transparent over the hero, condensing to a tinted hairline surface
  // after 24px of scroll) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition: 'background-color 260ms ease, border-color 260ms ease',
  },
  navBarScrolled: {
    backgroundColor: 'color-mix(in srgb, #0B0F14 92%, transparent)',
    borderBottom: `1px solid ${TERM_BORDER}`,
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
    transition: 'min-height 260ms ease',
  },
  navInnerScrolled: {
    minHeight: 52,
  },
  // Scheme-locked brand art (see Color policy): amber→ember gradient with
  // a white glyph, identical in both app themes.
  logoTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    colorScheme: 'dark',
    background: 'linear-gradient(135deg, #F59E0B 0%, #B91C1C 100%)',
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
  },
  // ---- 40px icon button (Button caps at 36px) ----
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
  // ---- compact-nav dropdown ----
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
  },
  navMenuLink: {
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
  // ---- hero (scheme-locked dark band; dark-first product). The band is
  // a composed atmosphere: aurora blobs + grain + pointer spotlight sit in
  // absolutely-positioned layers behind a zIndex:1 content column. ----
  hero: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundImage: [
      'radial-gradient(64% 90% at 82% 0%, rgba(245, 158, 11, 0.16), transparent 58%)',
      'linear-gradient(180deg, #0B0F14 0%, #111826 100%)',
    ].join(', '),
  },
  heroLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.45,
    pointerEvents: 'none',
  },
  heroRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
    paddingBlock: 96,
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-6)',
  },
  heroText: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontSize: 74,
    fontWeight: 750,
    lineHeight: 1.03,
    letterSpacing: '-0.03em',
    margin: 0,
  },
  heroHeadlineMid: {
    fontSize: 56,
  },
  heroHeadlinePhone: {
    fontSize: 38,
    lineHeight: 1.05,
  },
  // Gradient ink on the key phrase (WebkitBackgroundClip: text).
  headlineInk: {
    backgroundImage: `linear-gradient(94deg, ${TERM_AMBER} 10%, color-mix(in srgb, ${TERM_AMBER} 45%, ${TERM_GREEN}) 90%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  // ---- staged product theater (perspective wrapper + satellites) ----
  heroStage: {
    position: 'relative',
    flex: '1 1 0',
    minWidth: 0,
    perspective: 1400,
  },
  terminalTilt: {
    borderRadius: 12,
    transform: 'rotateY(-5deg) rotateX(2deg)',
    boxShadow: `0 48px 96px -32px color-mix(in srgb, ${TERM_AMBER} 30%, transparent)`,
  },
  terminalTiltStacked: {
    transform: 'none',
    boxShadow: 'none',
  },
  // Parallax shell: translated by --dtl-px / --dtl-py set from onPointerMove
  // on the hero (spring-ish transition; vars stay 0 under reduced motion).
  satellite: {
    position: 'absolute',
    zIndex: 2,
    transform:
      'translate3d(calc(var(--dtl-px, 0) * 9px), calc(var(--dtl-py, 0) * 7px), 0)',
    transition: 'transform 640ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  // Glass mini-card (bob animation lives on this inner element).
  satelliteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 13px',
    borderRadius: 12,
    colorScheme: 'dark',
    border: `1px solid ${CHIP_BORDER}`,
    backgroundColor: 'color-mix(in srgb, #0D1117 84%, transparent)',
    boxShadow: `inset 0 0 0 1px ${CHIP_BG}, ${SHADOW_FLOATING}`,
    fontFamily: MONO,
    fontSize: 12,
    color: DARK_TEXT_SOFT,
    whiteSpace: 'nowrap',
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: DARK_TEXT_SOFT,
    maxWidth: 480,
    margin: 0,
  },
  heroStatChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    border: `1px solid ${CHIP_BORDER}`,
    fontSize: 12.5,
    fontWeight: 600,
    color: DARK_TEXT_SOFT,
    whiteSpace: 'nowrap',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  // ---- terminal (scheme-locked art; see Color policy) ----
  terminal: {
    flex: '1 1 0',
    minWidth: 0,
    colorScheme: 'dark',
    borderRadius: 12,
    border: `1px solid ${TERM_BORDER}`,
    backgroundColor: TERM_BG,
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45)',
    overflow: 'hidden',
  },
  terminalChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 14px',
    borderBottom: `1px solid ${TERM_BORDER}`,
  },
  terminalDot: {
    width: 11,
    height: 11,
    borderRadius: '50%',
  },
  terminalTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: MONO,
    fontSize: 11,
    color: TERM_MUTED,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  terminalBody: {
    padding: 'var(--spacing-4)',
    minHeight: 196,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    fontFamily: MONO,
    fontSize: 12.5,
    lineHeight: 1.5,
    boxSizing: 'border-box',
  },
  terminalCaret: {
    display: 'inline-block',
    width: 8,
    height: 15,
    marginLeft: 2,
    verticalAlign: 'text-bottom',
    backgroundColor: TERM_COMMAND,
    animation: 'dtl-caret 1s steps(1) infinite',
  },
  terminalFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '10px 14px',
    borderTop: `1px solid ${TERM_BORDER}`,
    minHeight: 52,
    boxSizing: 'border-box',
  },
  terminalSuccessChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: '1px solid rgba(126, 231, 135, 0.4)',
    backgroundColor: 'rgba(126, 231, 135, 0.12)',
    color: TERM_GREEN,
    fontFamily: MONO,
    fontSize: 11.5,
    whiteSpace: 'nowrap',
  },
  replayButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingInline: 12,
    borderRadius: 8,
    border: `1px solid ${CHIP_BORDER}`,
    backgroundColor: CHIP_BG,
    cursor: 'pointer',
    fontSize: 12.5,
    fontWeight: 600,
    color: DARK_TEXT,
    whiteSpace: 'nowrap',
  },
  // ---- section intros ----
  sectionIntro: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    maxWidth: 640,
    marginBottom: 'var(--spacing-6)',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  sectionTitlePhone: {
    fontSize: 26,
  },
  // ---- why cards ----
  whyCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    height: '100%',
    boxSizing: 'border-box',
    boxShadow: SHADOW_RAISED,
  },
  whyGlyph: {
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: ACCENT,
  },
  whyStat: {
    fontFamily: MONO,
    fontSize: 12.5,
    color: ACCENT,
  },
  // ---- benchmarks ----
  benchRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  benchMultChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: 999,
    border: `1px solid ${ACCENT}`,
    color: ACCENT,
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  benchBarLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  benchName: {
    width: 92,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  benchNamePhone: {
    width: 70,
    fontSize: 12,
  },
  benchTrack: {
    flex: 1,
    minWidth: 0,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  benchFill: {
    height: '100%',
    borderRadius: 7,
  },
  benchValue: {
    width: 58,
    flexShrink: 0,
    textAlign: 'right',
    fontFamily: MONO,
    fontSize: 12.5,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  benchFootnote: {
    marginTop: 'var(--spacing-4)',
    fontFamily: MONO,
    fontSize: 11.5,
    color: 'var(--color-text-secondary)',
  },
  // ---- feature diff pane ----
  featureSplit: {
    display: 'flex',
    gap: 'var(--spacing-7)',
    alignItems: 'flex-start',
    marginTop: 'var(--spacing-5)',
  },
  featureSplitStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  featureCopy: {
    flex: '4 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  featureCode: {
    flex: '6 1 0',
    minWidth: 0,
  },
  bulletDisc: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor:
      'light-dark(rgba(52, 168, 83, 0.14), rgba(52, 168, 83, 0.24))',
    color: 'var(--color-success, light-dark(#1E8E3E, #6DD58C))',
  },
  // ---- logo strip (marquee loop; static wrap under reduced motion) ----
  logoStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
  },
  marquee: {
    overflow: 'hidden',
    width: '100%',
    maskImage:
      'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
  },
  marqueeTrack: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-7)',
    width: 'max-content',
    animation: 'dtl-marquee 48s linear infinite',
  },
  logoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 148,
  },
  // Scheme-locked brand art (see Color policy): invented-company gradients
  // must not reflow with the theme; white monograms read on all of them.
  monogramTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    colorScheme: 'dark',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  // ---- quickstart ----
  stepCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    height: '100%',
    boxSizing: 'border-box',
    boxShadow: SHADOW_RAISED,
  },
  stepNumber: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: 700,
    color: ACCENT,
  },
  // ---- footer (scheme-locked dark) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#0B0F14',
    borderTop: `1px solid ${TERM_BORDER}`,
  },
  footerInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  footerInnerPhone: {
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
  versionChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: `1px solid ${CHIP_BORDER}`,
    backgroundColor: CHIP_BG,
    fontFamily: MONO,
    fontSize: 12,
    color: DARK_TEXT_SOFT,
    whiteSpace: 'nowrap',
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
// Deterministic fixtures for the fictional Quarry build tool.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Quarry',
  version: 'v3.2.0',
  stars: '24.1k',
};

type SectionId = 'why' | 'benchmarks' | 'features' | 'quickstart';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'why', label: 'Why Quarry'},
  {id: 'benchmarks', label: 'Benchmarks'},
  {id: 'features', label: 'Features'},
  {id: 'quickstart', label: 'Quickstart'},
];

const HERO = {
  eyebrow: 'Open-source incremental build tool',
  // The trailing phrase renders in gradient ink (see styles.headlineInk).
  headline: 'Builds that finish',
  headlineInk: 'before you tab away',
  subcopy:
    'Quarry tracks your task graph down to the function, caches every ' +
    'artifact by content hash, and shares the cache across laptops and ' +
    'CI — so the second build anywhere is nearly free.',
  stats: ['★ 24.1k stars', '1,940 contributors', 'Single 12 MB binary'],
};

const INSTALL_COMMAND = 'curl -fsSL quarry.dev/install | sh';

/** Staged installer output; per-line delays make the run deterministic. */
const TERMINAL_LINES: readonly {
  text: string;
  tone: 'muted' | 'success';
  delayMs: number;
}[] = [
  {text: 'quarry installer v3.2.0', tone: 'muted', delayMs: 460},
  {text: '→ detected darwin-arm64', tone: 'muted', delayMs: 380},
  {
    text: '→ downloading quarry-3.2.0-darwin-arm64.tar.gz (12.4 MB)',
    tone: 'muted',
    delayMs: 560,
  },
  {text: '→ verifying sha256:9f31c2…8de4 ✓', tone: 'muted', delayMs: 480},
  {
    text: '✓ installed to ~/.quarry/bin in 4.8s — run `quarry init`',
    tone: 'success',
    delayMs: 620,
  },
];

const TYPE_INTERVAL_MS = 42;
const TYPE_START_DELAY_MS = 600;
const ENTER_PAUSE_MS = 420;
const LOOP_IDLE_MS = 4200;

const WHY_CARDS: readonly {
  id: string;
  icon: Glyph;
  title: string;
  copy: string;
  stat: string;
}[] = [
  {
    id: 'incremental',
    icon: ZapIcon,
    title: 'Incremental to the function',
    copy:
      'The task graph tracks inputs at function granularity, so a ' +
      'one-line edit rebuilds one module — not your whole app.',
    stat: '0.9s median rebuild',
  },
  {
    id: 'cache',
    icon: DatabaseIcon,
    title: 'One cache, every machine',
    copy:
      'Artifacts are content-addressed and shared between laptops and ' +
      'CI. If anyone on the team built it, nobody builds it again.',
    stat: '99.7% CI cache hit rate',
  },
  {
    id: 'config',
    icon: SlidersHorizontalIcon,
    title: 'Zero config, honestly',
    copy:
      'A nine-line quarry.toml replaces the plugin soup. Defaults for ' +
      'TypeScript, JSX, CSS, and WASM ship inside the binary.',
    stat: '9 lines of config',
  },
];

/** Before/after benchmark rows; competitors are invented. Seconds fixed. */
const BENCHMARKS: readonly {
  id: string;
  label: string;
  competitor: string;
  theirSeconds: number;
  ourSeconds: number;
}[] = [
  {
    id: 'cold',
    label: 'Cold production build',
    competitor: 'Bricker',
    theirSeconds: 184.2,
    ourSeconds: 41.6,
  },
  {
    id: 'incremental',
    label: 'Incremental rebuild (1 file)',
    competitor: 'Gantry',
    theirSeconds: 23.8,
    ourSeconds: 0.9,
  },
  {
    id: 'ci',
    label: 'CI pipeline, warm remote cache',
    competitor: 'Loadstone',
    theirSeconds: 412,
    ourSeconds: 96,
  },
  {
    id: 'tests',
    label: 'Affected-only test re-run',
    competitor: 'Cinderpath',
    theirSeconds: 58.4,
    ourSeconds: 6.2,
  },
];

const BENCH_FOOTNOTE =
  'Median of 5 runs · M3 Pro (12-core) · atlas-web monorepo, 1,847 tasks ' +
  '· full methodology at quarry.dev/bench';

type FeatureTabId = 'config' | 'cache' | 'ci';

const FEATURE_TABS: readonly {
  id: FeatureTabId;
  label: string;
  title: string;
  copy: string;
  bullets: readonly string[];
  codeTitle: string;
  code: string;
}[] = [
  {
    id: 'config',
    label: 'Config',
    title: 'Your whole config in nine lines',
    copy:
      'Quarry infers targets, loaders, and output layout from the repo ' +
      'itself. What is left fits in one file you can actually read.',
    bullets: [
      'Sane defaults for TS, JSX, CSS, and WASM out of the box',
      'One TOML file, checked into the repo — no plugin soup',
      '`quarry doctor` explains every inferred setting',
    ],
    codeTitle: 'bricker.config.js → quarry.toml',
    code: [
      '- // bricker.config.js — 214 lines of plugins',
      '- module.exports = {',
      "-   mode: 'production',",
      '-   plugins: [new CacheShim(), new GraphPatch()],',
      '-   optimization: {splitChunks: {chunks: "all"}},',
      '- };',
      '+ # quarry.toml — the entire config',
      '+ [project]',
      '+ name  = "atlas-web"',
      '+ entry = "src/main.ts"',
      '+',
      '+ [build]',
      '+ targets = ["darwin-arm64", "linux-x64"]',
      '+ minify  = true',
    ].join('\n'),
  },
  {
    id: 'cache',
    label: 'Cache',
    title: 'The build your teammate already ran',
    copy:
      'Point the repo at a remote cache once. Every artifact is keyed by ' +
      'the content hash of its inputs and verified before reuse.',
    bullets: [
      'Content-addressed artifacts shared across laptops and CI',
      'First machine builds it; no machine builds it twice',
      'Every cache hit checksum-verified before it is restored',
    ],
    codeTitle: 'quarry.toml + quarry build',
    code: [
      '+ [cache]',
      '+ remote = "https://cache.quarry.dev/atlas"',
      '+ scope  = "team"',
      '',
      '$ quarry build',
      '  restored 1,842 / 1,847 tasks from remote cache (99.7%)',
      '✓ finished in 0.9s (saved 22.9s)',
    ].join('\n'),
  },
  {
    id: 'ci',
    label: 'CI',
    title: "CI that reuses yesterday's work",
    copy:
      'Swap one workflow step and cold CI becomes warm CI. Per-PR task ' +
      'graphs mean only affected targets build and test at all.',
    bullets: [
      'Drop-in steps for GitHub, GitLab, and Buildkite',
      'The remote cache turns every cold runner into a warm one',
      'Only targets affected by the diff are built and tested',
    ],
    codeTitle: '.github/workflows/ci.yml',
    code: [
      '  # .github/workflows/ci.yml',
      '- - run: npm ci && npm run build        # 6m 52s',
      '+ - uses: quarry-dev/setup@v3',
      '+ - run: quarry build --ci              # 1m 36s',
      '+   env:',
      '+     QUARRY_CACHE_TOKEN: ' + '$' + '{{ secrets.QUARRY_CACHE }}',
    ].join('\n'),
  },
];

// Scheme-locked brand-art gradients (see Color policy): invented company
// monograms rendered inside the colorScheme:'dark' monogramTile.
const COMPANIES: readonly {name: string; monogram: string; bg: string}[] = [
  {name: 'Ferrostack', monogram: 'FS', bg: 'linear-gradient(135deg, #F97316 0%, #7C2D12 100%)'},
  {name: 'Nightjar', monogram: 'NJ', bg: 'linear-gradient(135deg, #6366F1 0%, #1E1B4B 100%)'},
  {name: 'Plyline', monogram: 'PL', bg: 'linear-gradient(135deg, #14B8A6 0%, #134E4A 100%)'},
  {name: 'Antler Labs', monogram: 'AL', bg: 'linear-gradient(135deg, #EC4899 0%, #831843 100%)'},
  {name: 'Driftworks', monogram: 'DW', bg: 'linear-gradient(135deg, #0EA5E9 0%, #0C4A6E 100%)'},
  {name: 'Cobalt Peak', monogram: 'CP', bg: 'linear-gradient(135deg, #8B5CF6 0%, #312E81 100%)'},
];

const QUICKSTART_STEPS: readonly {
  id: string;
  number: string;
  title: string;
  copy: string;
  command: string;
}[] = [
  {
    id: 'install',
    number: '01',
    title: 'Install',
    copy: 'One command, one 12 MB binary. No runtime, no postinstall.',
    command: 'curl -fsSL quarry.dev/install | sh',
  },
  {
    id: 'init',
    number: '02',
    title: 'Adopt your repo',
    copy: 'Detects the workspace layout and writes a nine-line quarry.toml.',
    command: 'quarry init',
  },
  {
    id: 'build',
    number: '03',
    title: 'Build (and stay warm)',
    copy: 'First build populates the cache; --watch rebuilds in under a second.',
    command: 'quarry build --watch',
  },
];

const FOOTER_COLUMNS: readonly {
  id: string;
  heading: string;
  links: readonly string[];
}[] = [
  {
    id: 'project',
    heading: 'Project',
    links: ['Documentation', 'Benchmarks methodology', 'Changelog', 'Roadmap'],
  },
  {
    id: 'community',
    heading: 'Community',
    links: ['GitHub', 'Discord', 'Contributor guide', 'Good first issues'],
  },
  {
    id: 'more',
    heading: 'More',
    links: ['Blog', 'Brand assets', 'Governance', 'Security policy'],
  },
];

// ============= HELPERS =============

function formatSeconds(value: number): string {
  return value >= 100 ? `${Math.round(value)}s` : `${value.toFixed(1)}s`;
}

function speedup(theirSeconds: number, ourSeconds: number): string {
  return `${(theirSeconds / ourSeconds).toFixed(1)}× faster`;
}

// ============= HOOKS =============

/**
 * Measures the page's own width with a ResizeObserver — the inline demo
 * stage is ~1045px wide inside a 1440px window, so viewport media queries
 * never fire there.
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

/** Motion gate: reveals render visible, counters render final, no loops. */
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(query.matches);
    const onChange = (event: MediaQueryListEvent) => setPrefers(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefers;
}

/** rAF ease-out count-up toward a fixed target once `isActive` flips. */
function useCountUp(
  target: number,
  isActive: boolean,
  reducedMotion: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    if (reducedMotion) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) {
        start = now;
      }
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(t >= 1 ? target : target * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, reducedMotion, durationMs]);
  if (!isActive) {
    return 0;
  }
  return reducedMotion ? target : value;
}

/** Fire-once viewport reveal; reduced motion reports revealed immediately. */
function useRevealOnce(
  reducedMotion: boolean,
): {ref: RefObject<HTMLDivElement | null>; isRevealed: boolean} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => {
    if (reducedMotion) {
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
      {threshold: 0.18},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);
  return {ref, isRevealed};
}

// ============= SMALL PIECES =============

/** Rise+fade scroll reveal (12px, fire once); inert under reduced motion. */
function Reveal({
  reducedMotion,
  delayMs = 0,
  children,
}: {
  reducedMotion: boolean;
  delayMs?: number;
  children: ReactNode;
}) {
  const {ref, isRevealed} = useRevealOnce(reducedMotion);
  return (
    <div
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'none' : 'translateY(16px) scale(0.985)',
        transition: reducedMotion
          ? 'none'
          : `opacity 560ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, ` +
            `transform 560ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
      }}>
      {children}
    </div>
  );
}

/** Quarry logomark: gradient tile + wordmark + version badge. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.logoTile} aria-hidden="true">
        <Icon icon={TerminalIcon} size="sm" color="inherit" />
      </div>
      <Text type="label">{BRAND.name}</Text>
      <Badge variant="neutral" label="v3.2" />
    </HStack>
  );
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

/** Left-aligned section intro: accent eyebrow + title + supporting copy. */
function SectionIntro({
  eyebrow,
  title,
  copy,
  isPhone,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  isPhone: boolean;
}) {
  return (
    <div style={styles.sectionIntro}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isPhone ? styles.sectionTitlePhone : null),
        }}>
        {title}
      </h2>
      <Text type="supporting" color="secondary">
        {copy}
      </Text>
    </div>
  );
}

/** Green check bullet for the feature-pane annotations. */
function CheckBullet({label}: {label: string}) {
  return (
    <HStack gap={2} vAlign="start">
      <div style={styles.bulletDisc} aria-hidden="true">
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </div>
      <StackItem size="fill">
        <Text type="body">{label}</Text>
      </StackItem>
    </HStack>
  );
}

// ============= HERO TERMINAL =============

/**
 * Self-typing install terminal. The run is a fixed timeout schedule:
 * type the command, pause, stage each output line on its fixture delay,
 * idle, then loop. Replay bumps runKey to restart; reduced motion renders
 * the completed final frame with no loop.
 */
function HeroTerminal({reducedMotion}: {reducedMotion: boolean}) {
  const [runKey, setRunKey] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const isDone = lineCount >= TERMINAL_LINES.length;

  useEffect(() => {
    if (reducedMotion) {
      setTypedCount(INSTALL_COMMAND.length);
      setLineCount(TERMINAL_LINES.length);
      return undefined;
    }
    setTypedCount(0);
    setLineCount(0);
    const timers: number[] = [];
    let at = TYPE_START_DELAY_MS;
    for (let index = 1; index <= INSTALL_COMMAND.length; index++) {
      at += TYPE_INTERVAL_MS;
      const count = index;
      timers.push(window.setTimeout(() => setTypedCount(count), at));
    }
    at += ENTER_PAUSE_MS;
    TERMINAL_LINES.forEach((line, index) => {
      at += line.delayMs;
      const count = index + 1;
      timers.push(window.setTimeout(() => setLineCount(count), at));
    });
    at += LOOP_IDLE_MS;
    timers.push(window.setTimeout(() => setRunKey(key => key + 1), at));
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [runKey, reducedMotion]);

  const isTyping = typedCount < INSTALL_COMMAND.length;

  return (
    <div
      style={styles.terminal}
      role="img"
      aria-label={`Terminal demo: ${INSTALL_COMMAND} installs Quarry ${BRAND.version} in 4.8 seconds`}>
      <div style={styles.terminalChrome} aria-hidden="true">
        <span style={{...styles.terminalDot, backgroundColor: '#F87171'}} />
        <span style={{...styles.terminalDot, backgroundColor: '#FBBF24'}} />
        <span style={{...styles.terminalDot, backgroundColor: '#34D399'}} />
        <span style={styles.terminalTitle}>quarry install — zsh</span>
      </div>
      <div style={styles.terminalBody} aria-hidden="true">
        <div style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
          <span style={{color: TERM_GREEN}}>${' '}</span>
          <span style={{color: TERM_COMMAND}}>
            {INSTALL_COMMAND.slice(0, typedCount)}
          </span>
          {!reducedMotion && !isDone && (
            <span
              style={{
                ...styles.terminalCaret,
                ...(isTyping ? null : {animation: 'none'}),
              }}
            />
          )}
        </div>
        {TERMINAL_LINES.slice(0, lineCount).map(line => (
          <div
            key={line.text}
            style={{
              color: line.tone === 'success' ? TERM_GREEN : TERM_MUTED,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
            {line.text}
          </div>
        ))}
      </div>
      <div style={styles.terminalFooter}>
        <StackItem size="fill">
          {isDone ? (
            <span style={styles.terminalSuccessChip}>
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
              Installed in 4.8s
            </span>
          ) : (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11.5,
                color: TERM_MUTED,
              }}>
              quarry.dev/install
            </span>
          )}
        </StackItem>
        {isDone && !reducedMotion && (
          <button
            type="button"
            style={styles.replayButton}
            onClick={() => setRunKey(key => key + 1)}>
            <Icon icon={RotateCcwIcon} size="xsm" color="inherit" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}

// ============= BENCHMARK ROW =============

function BenchmarkRow({
  row,
  index,
  isRevealed,
  reducedMotion,
  isPhone,
}: {
  row: (typeof BENCHMARKS)[number];
  index: number;
  isRevealed: boolean;
  reducedMotion: boolean;
  isPhone: boolean;
}) {
  const theirValue = useCountUp(row.theirSeconds, isRevealed, reducedMotion);
  const ourValue = useCountUp(row.ourSeconds, isRevealed, reducedMotion);
  const ourPercent = Math.max(4, (row.ourSeconds / row.theirSeconds) * 100);
  const barTransition = reducedMotion
    ? 'none'
    : `width 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 140}ms`;
  const nameStyle = {
    ...styles.benchName,
    ...(isPhone ? styles.benchNamePhone : null),
  };
  return (
    <div style={styles.benchRow}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <Text weight="semibold">{row.label}</Text>
        </StackItem>
        <span style={styles.benchMultChip}>
          {speedup(row.theirSeconds, row.ourSeconds)}
        </span>
      </HStack>
      <div style={styles.benchBarLine}>
        <span style={nameStyle}>{row.competitor}</span>
        <div style={styles.benchTrack} aria-hidden="true">
          <div
            style={{
              ...styles.benchFill,
              backgroundColor: 'var(--color-border)',
              width: isRevealed ? '100%' : '0%',
              transition: barTransition,
            }}
          />
        </div>
        <span style={styles.benchValue}>{formatSeconds(theirValue)}</span>
      </div>
      <div style={styles.benchBarLine}>
        <span style={{...nameStyle, color: ACCENT}}>Quarry</span>
        <div style={styles.benchTrack} aria-hidden="true">
          <div
            style={{
              ...styles.benchFill,
              backgroundColor: ACCENT,
              width: isRevealed ? `${ourPercent}%` : '0%',
              transition: barTransition,
            }}
          />
        </div>
        <span style={styles.benchValue}>{formatSeconds(ourValue)}</span>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function DevtoolTerminalLandingTemplate() {
  // ---- responsive: measure the page itself, not the viewport ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 880;
  const isPhone = wrapWidth > 0 && wrapWidth <= 620;

  const reducedMotion = usePrefersReducedMotion();

  // ---- compact-nav dropdown ----
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLDivElement | null>(null);

  // ---- scroll-spy ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // ---- condensing nav: transparent over the hero, tinted after 24px ----
  const [isScrolled, setIsScrolled] = useState(false);

  // ---- feature tabs ----
  const [featureTab, setFeatureTab] = useState<FeatureTabId>('config');
  const activeFeature =
    FEATURE_TABS.find(tab => tab.id === featureTab) ?? FEATURE_TABS[0];

  // ---- benchmark reveal (drives bars + count-ups, fire once) ----
  const {ref: benchRef, isRevealed: isBenchRevealed} =
    useRevealOnce(reducedMotion);

  // ---- toast: keyed so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // Dropdown dismisses on Escape and on pointerdown outside the navbar.
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
        nav !== null &&
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

  /** Smooth-scroll the container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    setIsNavMenuOpen(false);
    if (container === null || section === null || section === undefined) {
      return;
    }
    setActiveSection(id);
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  /** Scroll-spy: the last anchor above the fold line wins. */
  const onPageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setIsScrolled(container.scrollTop > 24);
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

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const starLabel = `Star on GitHub · ${BRAND.stars}`;
  const onStarClick = () => {
    setIsNavMenuOpen(false);
    fireToast('Would open github.com/quarry-dev/quarry — 24,100 stars.');
  };

  const bandStyle = (extra?: CSSProperties): CSSProperties => ({
    ...styles.band,
    ...(isPhone ? styles.bandPhone : null),
    ...extra,
  });
  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isPhone ? styles.columnPhone : null),
  };

  // ============= CHROME =============

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled || isNavMenuOpen ? styles.navBarScrolled : null),
      }}
      aria-label="Primary">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <BrandMark />
        <StackItem size="fill">
          {!isNavCompact && (
            <HStack gap={1} vAlign="center" hAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-current={
                    activeSection === anchor.id ? 'true' : undefined
                  }
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
        {!isNavCompact && (
          <Button
            label={starLabel}
            variant="secondary"
            icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
            onClick={onStarClick}
          />
        )}
        {isNavCompact && (
          <div ref={menuTriggerRef}>
            <IconButton40
              label={isNavMenuOpen ? 'Close menu' : 'Open menu'}
              icon={isNavMenuOpen ? XIcon : MenuIcon}
              ariaExpanded={isNavMenuOpen}
              onClick={() => setIsNavMenuOpen(open => !open)}
            />
          </div>
        )}
        {isNavCompact && isNavMenuOpen && (
          <div style={styles.navMenu} role="menu" aria-label="Site menu">
            <VStack gap={1}>
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  role="menuitem"
                  style={styles.navMenuLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
              <Button
                label={starLabel}
                variant="secondary"
                icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
                onClick={onStarClick}
              />
            </VStack>
          </div>
        )}
      </div>
    </nav>
  );

  // ---- hero (scheme-locked dark band, staged product theater) ----
  /**
   * Pointer parallax + spotlight: writes --dtl-px/--dtl-py (unitless -1..1)
   * and --dtl-mx/--dtl-my (%) onto the hero element; satellites and the
   * spotlight overlay read them via calc(). Disabled under reduced motion
   * and at stacked (touch-ish) widths.
   */
  const onHeroPointerMove =
    reducedMotion || isStacked
      ? undefined
      : (event: ReactPointerEvent<HTMLElement>) => {
          const element = event.currentTarget;
          const rect = element.getBoundingClientRect();
          const x = (event.clientX - rect.left) / Math.max(1, rect.width);
          const y = (event.clientY - rect.top) / Math.max(1, rect.height);
          element.style.setProperty('--dtl-mx', `${(x * 100).toFixed(1)}%`);
          element.style.setProperty('--dtl-my', `${(y * 100).toFixed(1)}%`);
          element.style.setProperty('--dtl-px', ((x - 0.5) * 2).toFixed(3));
          element.style.setProperty('--dtl-py', ((y - 0.5) * 2).toFixed(3));
        };

  const satelliteBob = (durationS: number, delayS: number): CSSProperties => ({
    ...styles.satelliteCard,
    animation: reducedMotion
      ? 'none'
      : `dtl-bob ${durationS}s ease-in-out ${delayS}s infinite alternate`,
  });

  const hero = (
    <header style={styles.hero} onPointerMove={onHeroPointerMove}>
      {/* Atmosphere: drifting aurora blobs (static under reduced motion),
          a grain overlay, and a pointer-tracked spotlight. */}
      <div style={styles.heroLayer} aria-hidden="true">
        <div
          style={{
            ...styles.auroraBlob,
            width: 520,
            height: 520,
            top: -200,
            right: -100,
            background: `radial-gradient(circle, color-mix(in srgb, ${TERM_AMBER} 52%, transparent) 0%, transparent 70%)`,
            animation: reducedMotion
              ? 'none'
              : 'dtl-drift-a 38s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            ...styles.auroraBlob,
            width: 460,
            height: 460,
            bottom: -220,
            left: -120,
            background: `radial-gradient(circle, color-mix(in srgb, ${AURORA_INDIGO} 46%, transparent) 0%, transparent 70%)`,
            animation: reducedMotion
              ? 'none'
              : 'dtl-drift-b 44s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            ...styles.auroraBlob,
            width: 360,
            height: 360,
            top: 40,
            left: '36%',
            opacity: 0.3,
            background: `radial-gradient(circle, color-mix(in srgb, ${TERM_GREEN} 40%, transparent) 0%, transparent 70%)`,
            animation: reducedMotion
              ? 'none'
              : 'dtl-drift-a 31s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>
      <div
        style={{...styles.heroLayer, backgroundImage: GRAIN_URI, opacity: 0.04}}
        aria-hidden="true"
      />
      <div
        style={{
          ...styles.heroLayer,
          background: `radial-gradient(480px circle at var(--dtl-mx, 76%) var(--dtl-my, 24%), color-mix(in srgb, ${TERM_AMBER} 9%, transparent), transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div style={columnStyle}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <span style={{...styles.eyebrow, color: TERM_AMBER}}>
              {HERO.eyebrow}
            </span>
            <h1
              style={{
                ...styles.heroHeadline,
                ...(isStacked && !isPhone ? styles.heroHeadlineMid : null),
                ...(isPhone ? styles.heroHeadlinePhone : null),
              }}>
              {HERO.headline}{' '}
              <span style={styles.headlineInk}>{HERO.headlineInk}</span>
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                label="Get Quarry"
                variant="primary"
                onClick={() => jumpToSection('quickstart')}
              />
              <Button
                label="See the benchmarks"
                variant="ghost"
                onClick={() => jumpToSection('benchmarks')}
              />
              <Button
                label="Docs"
                variant="ghost"
                icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
                onClick={() => fireToast('Would open docs.quarry.dev.')}
              />
            </HStack>
            <HStack gap={2} vAlign="center" wrap="wrap">
              {HERO.stats.map(stat => (
                <span key={stat} style={styles.heroStatChip}>
                  {stat}
                </span>
              ))}
            </HStack>
          </div>
          <div style={styles.heroStage}>
            <div
              style={{
                ...styles.terminalTilt,
                ...(isStacked ? styles.terminalTiltStacked : null),
              }}>
              <HeroTerminal reducedMotion={reducedMotion} />
            </div>
            {!isPhone && (
              <>
                <div
                  style={{...styles.satellite, top: -22, right: -6}}
                  aria-hidden="true">
                  <div style={satelliteBob(7, -2)}>
                    <Icon icon={ZapIcon} size="xsm" color="inherit" />
                    <span>
                      <span style={{color: TERM_AMBER}}>0.9s</span>{' '}
                      incremental rebuild
                    </span>
                  </div>
                </div>
                <div
                  style={{...styles.satellite, bottom: -24, left: -14}}
                  aria-hidden="true">
                  <div style={satelliteBob(8.5, -4)}>
                    <Icon icon={DatabaseIcon} size="xsm" color="inherit" />
                    <span>
                      cache hit ·{' '}
                      <span style={{color: TERM_GREEN}}>1,842 / 1,847</span>{' '}
                      tasks
                    </span>
                  </div>
                </div>
                <div
                  style={{...styles.satellite, top: '44%', left: -30}}
                  aria-hidden="true">
                  <div style={satelliteBob(6.5, -1.5)}>
                    <span style={{display: 'flex'}}>
                      {COMPANIES.slice(0, 3).map((company, index) => (
                        <span
                          key={company.name}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: company.bg,
                            border: `2px solid ${TERM_BG}`,
                            marginLeft: index === 0 ? 0 : -7,
                          }}
                        />
                      ))}
                    </span>
                    <span>1,940 contributors</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // ---- why cards ----
  const whySection = (
    <section
      ref={registerSection('why')}
      aria-label="Why Quarry"
      style={bandStyle()}>
      <div style={columnStyle}>
        <Reveal reducedMotion={reducedMotion}>
          <SectionIntro
            eyebrow="Why Quarry"
            title="Fast because it does less"
            copy={
              'Every second of a Quarry build is spent on work that has ' +
              'never been done before — everything else is a cache hit.'
            }
            isPhone={isPhone}
          />
        </Reveal>
        <Grid columns={{minWidth: 250, max: 3}} gap={3}>
          {WHY_CARDS.map((card, index) => (
            <Reveal
              key={card.id}
              reducedMotion={reducedMotion}
              delayMs={index * 80}>
              <div
                className="dtl-card"
                style={{
                  ...styles.whyCard,
                  ...(index === 1 && !isStacked ? {marginTop: 20} : null),
                }}>
                <div style={styles.whyGlyph} aria-hidden="true">
                  <Icon icon={card.icon} size="sm" color="inherit" />
                </div>
                <Text type="label">{card.title}</Text>
                <Text type="supporting" color="secondary">
                  {card.copy}
                </Text>
                <span style={styles.whyStat}>{card.stat}</span>
              </div>
            </Reveal>
          ))}
        </Grid>
      </div>
    </section>
  );

  // ---- benchmarks (muted band; bars + count-ups on first reveal) ----
  const benchmarkSection = (
    <section
      ref={registerSection('benchmarks')}
      aria-label="Benchmarks"
      style={bandStyle(styles.bandMuted)}>
      <div style={columnStyle}>
        <Reveal reducedMotion={reducedMotion}>
          <SectionIntro
            eyebrow="Benchmarks"
            title="Before Quarry, after Quarry"
            copy={
              'The same monorepo, the same machine, the tool it replaced. ' +
              'Four everyday builds, timed end to end.'
            }
            isPhone={isPhone}
          />
        </Reveal>
        <div ref={benchRef}>
          {BENCHMARKS.map((row, index) => (
            <BenchmarkRow
              key={row.id}
              row={row}
              index={index}
              isRevealed={isBenchRevealed}
              reducedMotion={reducedMotion}
              isPhone={isPhone}
            />
          ))}
        </div>
        <p style={styles.benchFootnote}>{BENCH_FOOTNOTE}</p>
      </div>
    </section>
  );

  // ---- feature diff pane (Config / Cache / CI tabs) ----
  const featureSection = (
    <section
      ref={registerSection('features')}
      aria-label="Features"
      style={bandStyle()}>
      <div style={columnStyle}>
        <Reveal reducedMotion={reducedMotion}>
          <SectionIntro
            eyebrow="Features"
            title="The diff tells the story"
            copy={
              'Three places Quarry deletes complexity: your config, your ' +
              'cache setup, and your CI workflow.'
            }
            isPhone={isPhone}
          />
        </Reveal>
        <TabList
          value={featureTab}
          onChange={value => setFeatureTab(value as FeatureTabId)}
          hasDivider
          aria-label="Feature areas">
          {FEATURE_TABS.map(tab => (
            <Tab key={tab.id} value={tab.id} label={tab.label} />
          ))}
        </TabList>
        <div
          style={{
            ...styles.featureSplit,
            ...(isStacked ? styles.featureSplitStacked : null),
          }}>
          <div style={styles.featureCopy}>
            <Heading level={3}>{activeFeature.title}</Heading>
            <Text type="supporting" color="secondary">
              {activeFeature.copy}
            </Text>
            <VStack gap={2}>
              {activeFeature.bullets.map(bullet => (
                <CheckBullet key={bullet} label={bullet} />
              ))}
            </VStack>
          </div>
          <div style={styles.featureCode}>
            <CodeBlock
              code={activeFeature.code}
              language="diff"
              title={activeFeature.codeTitle}
              width="100%"
              size="sm"
            />
          </div>
        </div>
      </div>
    </section>
  );

  // ---- logo strip (muted band) ----
  const logoStrip = (
    <section aria-label="Companies building with Quarry" style={bandStyle(styles.bandMuted)}>
      <div style={columnStyle}>
        <VStack gap={4} hAlign="center">
          <Text type="supporting" color="secondary">
            Quarry runs the builds at
          </Text>
          <div style={styles.logoStrip}>
            {COMPANIES.map(company => (
              <div key={company.name} style={styles.logoItem}>
                <div
                  style={{...styles.monogramTile, background: company.bg}}
                  aria-hidden="true">
                  {company.monogram}
                </div>
                <Text size="sm" weight="semibold" color="secondary">
                  {company.name}
                </Text>
              </div>
            ))}
          </div>
        </VStack>
      </div>
    </section>
  );

  // ---- quickstart (copyable commands) ----
  const quickstartSection = (
    <section
      ref={registerSection('quickstart')}
      aria-label="Quickstart"
      style={bandStyle()}>
      <div style={columnStyle}>
        <Reveal reducedMotion={reducedMotion}>
          <SectionIntro
            eyebrow="Quickstart"
            title="Warm cache in three commands"
            copy={
              'From nothing to a sub-second watch loop. Each command is ' +
              'copyable; the whole thing takes about two minutes.'
            }
            isPhone={isPhone}
          />
        </Reveal>
        <Grid columns={{minWidth: 260, max: 3}} gap={3}>
          {QUICKSTART_STEPS.map((step, index) => (
            <Reveal
              key={step.id}
              reducedMotion={reducedMotion}
              delayMs={index * 80}>
              <div className="dtl-card" style={styles.stepCard}>
                <HStack gap={2} vAlign="center">
                  <span style={styles.stepNumber}>{step.number}</span>
                  <Text type="label">{step.title}</Text>
                </HStack>
                <Text type="supporting" color="secondary">
                  {step.copy}
                </Text>
                <CodeBlock
                  code={step.command}
                  language="bash"
                  width="100%"
                  size="sm"
                  hasCopyButton
                  onCopy={() =>
                    fireToast(`Copied \`${step.command}\` to your clipboard.`)
                  }
                />
              </div>
            </Reveal>
          ))}
        </Grid>
      </div>
    </section>
  );

  // ---- footer (scheme-locked dark; version badge v3.2 · MIT) ----
  const footer = (
    <footer style={styles.footer} aria-label="Footer">
      <div
        style={{
          ...styles.footerInner,
          ...(isPhone ? styles.footerInnerPhone : null),
        }}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <div style={styles.logoTile} aria-hidden="true">
            <Icon icon={TerminalIcon} size="sm" color="inherit" />
          </div>
          <Text type="label" color="inherit">
            {BRAND.name}
          </Text>
          <span style={styles.versionChip}>
            <Icon icon={GitBranchIcon} size="xsm" color="inherit" />
            v3.2 · MIT
          </span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Button
            label={starLabel}
            variant="secondary"
            icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
            onClick={onStarClick}
          />
        </HStack>
        <Grid columns={{minWidth: isPhone ? 132 : 180, max: 3}} gap={4}>
          {FOOTER_COLUMNS.map(column => (
            <VStack key={column.id} gap={1}>
              <Text
                type="supporting"
                color="inherit"
                style={{
                  color: DARK_TEXT_SOFT,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: 11,
                }}>
                {column.heading}
              </Text>
              {column.links.map(link => (
                <button
                  key={link}
                  type="button"
                  style={styles.footerLink}
                  onClick={() => fireToast(`Would open ${link}.`)}>
                  {link}
                </button>
              ))}
            </VStack>
          ))}
        </Grid>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Quarry contributors · Built in the open under the MIT
              license.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT, fontFamily: MONO}}>
            quarry {BRAND.version} · darwin-arm64 · linux-x64 · windows-x64
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Quarry landing page">
            <div ref={wrapRef} style={{height: '100%'}}>
              {/* Caret blink keyframes for the hero terminal (unused under
                  reduced motion — the caret is never rendered there). */}
              {/* Keyframes (caret, aurora drift, satellite bob, marquee) and
                  the hover-raise card class; JS gates animations under
                  reduced motion, the media query is the backstop. */}
              <style>
                {`@keyframes dtl-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes dtl-drift-a { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(56px, 36px, 0); } }
@keyframes dtl-drift-b { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-48px, -28px, 0); } }
@keyframes dtl-bob { from { transform: translate3d(0, -5px, 0); } to { transform: translate3d(0, 5px, 0); } }
@keyframes dtl-marquee { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-50%, 0, 0); } }
.dtl-card { transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1); }
.dtl-card:hover { transform: translateY(-4px); box-shadow: 0 0 0 1px color-mix(in srgb, ${ACCENT} 45%, transparent), ${SHADOW_FLOATING}; }
@media (prefers-reduced-motion: reduce) { .dtl-card, .dtl-card:hover { transition: none; transform: none; } }`}
              </style>
              <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
                {navbar}
                {hero}
                {whySection}
                {benchmarkSection}
                {featureSection}
                {logoStrip}
                {quickstartSection}
                {footer}
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
