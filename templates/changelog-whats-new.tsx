// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file changelog-whats-new.tsx
 * @input Deterministic fixtures only (the fictional "Ledgerline" accounting
 *   platform's public changelog: three header count-up stats, four filter
 *   tags with precomputed item counts, and twelve release entries spanning
 *   April–July 2026 — each with a semver version, ISO date, title, and
 *   tagged bullet items; one entry carries a schematic reconciliation
 *   screenshot, one carries a draggable before/after editor comparison,
 *   and one is a Breaking release with a warning callout and a diff-style
 *   migration snippet; the last four entries sit behind a Load-more; plus
 *   a three-step release-pipeline story with per-step schematic mocks)
 * @output Art-directed public changelog page: a nav that starts transparent
 *   over the hero and condenses to a tinted hairline bar after 24px of
 *   scroll (brand mark, three smooth-scrolling anchor links with
 *   scroll-spy, an Open-app CTA with a hover sheen, and a hamburger
 *   dropdown at compact widths); a product-theater hero under a drifting
 *   aurora field and grain texture — display headline with a gradient-ink
 *   phrase, count-up stats, a validating subscribe capture, an RSS-copy
 *   chip, and a perspective-staged "release console" mock orbited by three
 *   bobbing satellite cards that parallax toward the pointer; a floating
 *   filter toolbar (New/Improved/Fixed/Security ToggleButtons with per-tag
 *   counts, Showing-N summary, Clear) that bleeds across the hero/entries
 *   boundary and live-filters the month-grouped entries (sticky month
 *   labels, version chips, tag Badges, two media blocks, the Breaking
 *   callout with a CodeBlock migration diff, a staggered Load-more, and an
 *   EmptyState fallback); a pinned scroll-story section where progress
 *   through a tall band advances a three-state release-pipeline mock with
 *   a clickable oversized-numeral step rail; a scheme-locked dark
 *   subscribe band with glass cards, gradient glows, and a
 *   pointer-tracked spotlight; and a footer linking to docs and status.
 *   Every reveal, count-up, drift, bob, and slide is gated by
 *   prefers-reduced-motion; every CTA fires a receipt Toast.
 * @position Page template; emitted by `astryx template changelog-whats-new`
 *
 * Frame: Layout height="fill", content-only — a public changelog owns its
 * own chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts
 * a measured wrapper (useElementWidth ResizeObserver — the inline demo
 * stage is ~1045px, so viewport media queries never fire there) around a
 * single scroll container; inside it the navbar is position:sticky top:0
 * (transparent at rest, tinted after 24px), the hero band tucks under it
 * with a negative margin, month labels are sticky just below it, and a
 * centered 1120px column carries the entries. The pinned story is a
 * sticky stage inside a tall container whose scroll progress is computed
 * against the measured scroll-container height. The Toast sits fixed
 * bottom-right.
 *
 * Interaction contract:
 * - Nav anchors (Latest / Breaking change / Subscribe) smooth-scroll the
 *   container under the sticky nav (instant under reduced motion) and an
 *   onScroll spy highlights the section above the fold (aria-current). At
 *   compact widths the anchors collapse behind a hamburger whose dropdown
 *   closes on Escape, outside pointerdown, or any selection.
 * - Tag ToggleButtons multi-select; active tags filter bullet items, hide
 *   entries and months left empty, recompute the "Showing N updates
 *   across M releases" line, and surface a Clear-filters action plus an
 *   EmptyState fallback. Counts on each toggle cover all twelve releases.
 * - Both email captures validate on submit (empty + format errors inline,
 *   cleared on typing) and flip to a confirmed card with a reset action.
 *   The RSS chip copies the feed URL (clipboard best-effort), swaps its
 *   label to "Copied" for a beat, and fires a receipt Toast.
 * - The before/after slider drags via pointer capture, steps with arrow
 *   keys on the role="slider" handle (Home/End snap), and offers
 *   Before / Split / After buttons as a no-drag fallback. Reduced motion
 *   drops the settle transition, never the functionality.
 * - The pipeline story pins its stage while scroll progress advances three
 *   discrete mock states; the numbered steps are also buttons that jump
 *   the scroll position. Under reduced motion (or where the container
 *   cannot be measured) it renders as a static stacked sequence.
 * - Hero satellites bob on independent negative-delay keyframes and
 *   parallax ±8px toward the pointer; both are off under reduced motion
 *   and at ≤720px widths.
 * - Load more appends four older releases; each rises in with a
 *   staggered delay (instant when reduced motion) and the button gives
 *   way to an end-of-archive note.
 * - Entry cards rise+fade on first view via IntersectionObserver with a
 *   70ms sibling stagger (rendered visible under reduced motion or where
 *   IO is unavailable); header stats roll up in ~900ms on first view and
 *   snap under reduced motion.
 *
 * Color policy: token-pure with ONE quarantined accent literal (see
 * ACCENT below) whose washes, auroras, glows, and glass strokes are all
 * derived via color-mix (with tokens or the white/black keywords) so the
 * hue has a single source of truth. Status tints (warning callout, match
 * chips) use var(--color-*) tokens or explicit light-dark() pairs. The
 * brand tile and the scheme-locked dark band paint white-on-ink on
 * purpose — deliberate brand art that reads identically in both themes.
 *
 * Responsive contract (element-width breakpoints, not viewport):
 * - >1000px: hero is a 7/5 copy + theater split with a 76px display
 *   title; entries are a 140px meta rail + body grid; nav shows inline
 *   anchors + CTA; the story stage is a 340px step rail beside the mock.
 * - <=1000px: the theater drops below the hero copy; satellites tighten.
 * - <=900px: the entry rail folds into an inline meta row above each
 *   body; the media figures keep full width.
 * - <=720px: nav anchors collapse behind the hamburger dropdown; the
 *   filter toolbar wraps; parallax is disabled; the story rail stacks
 *   above the mock viewport.
 * - <=560px: the display title steps down, both email forms stack the
 *   button under the input, slider fallback buttons stretch full-width,
 *   and footer columns drop to a single column. Everything holds at
 *   390px in the phone artboard with no overflow-x (the scroll container
 *   clips X).
 * - Tap targets: nav links, hamburger, story steps, and month rows are
 *   40px+; nothing on the page requires hover.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
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
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  FilterXIcon,
  GitMergeIcon,
  GripVerticalIcon,
  MailCheckIcon,
  MegaphoneIcon,
  MenuIcon,
  PenLineIcon,
  RssIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

// ============= PAINT CONSTANTS =============

/**
 * Quarantined accent literal — Ledgerline's "ledger green".
 * Contrast math: light #047857 on #FFFFFF ≈ 5.7:1 (AA for normal text
 * and UI); dark #34D399 on the ~#141A21 dark body ≈ 8.6:1. Every wash,
 * aurora, glow, and glass stroke below is color-mix-derived from this
 * single literal (mixed with tokens or the white/black keywords) so the
 * hue has exactly one source of truth; everything else is token-pure.
 */
const ACCENT = 'light-dark(#047857, #34D399)';
const ACCENT_WASH = `color-mix(in srgb, ${ACCENT} 7%, transparent)`;
const ACCENT_SOFT = `color-mix(in srgb, ${ACCENT} 13%, transparent)`;
const ACCENT_BORDER = `color-mix(in srgb, ${ACCENT} 32%, transparent)`;

/** Aurora hues: the accent bent toward neighboring data/status tokens. */
const AURORA_A = `color-mix(in srgb, ${ACCENT} 62%, var(--color-data-categorical-blue))`;
const AURORA_B = `color-mix(in srgb, ${ACCENT} 55%, var(--color-success))`;
const AURORA_C = `color-mix(in srgb, ${ACCENT} 70%, var(--color-data-categorical-teal))`;

/** Scheme-locked ink for the signature dark band (identical both themes). */
const INK = `color-mix(in srgb, ${ACCENT} 9%, black)`;
const INK_GLASS = 'color-mix(in srgb, white 7%, transparent)';
const INK_HAIRLINE = 'color-mix(in srgb, white 14%, transparent)';
const INK_TEXT = 'color-mix(in srgb, white 96%, transparent)';
const INK_TEXT_DIM = 'color-mix(in srgb, white 70%, transparent)';

/** Depth tiers — used verbatim wherever a surface lifts off the page. */
const SHADOW_RAISED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18)';
const SHADOW_FLOATING =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.18), ' +
  '0 24px 48px -24px rgba(0, 0, 0, 0.28)';
const SHADOW_GLASS = `inset 0 0 0 1px ${INK_HAIRLINE}, 0 24px 48px -24px rgba(0, 0, 0, 0.55)`;

/** Grain texture: inline SVG feTurbulence data-URI, painted at ~4%. */
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' ' +
  'width=\'180\' height=\'180\'%3E%3Cfilter id=\'g\'%3E%3CfeTurbulence ' +
  'type=\'fractalNoise\' baseFrequency=\'0.82\' numOctaves=\'2\' ' +
  'stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'180\' ' +
  'height=\'180\' filter=\'url(%23g)\' opacity=\'0.55\'/%3E%3C/svg%3E")';

const MONO = 'var(--font-family-mono, ui-monospace, monospace)';

/** Decelerate bezier shared by reveals, lifts, and the sticky nav. */
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Condensed sticky-nav height; month labels + scroll math allow for it. */
const NAV_HEIGHT = 61;
const NAV_REST_HEIGHT = 77;
const NAV_ALLOWANCE = 84;
const SPY_OFFSET = 150;
/** Offset at which the pinned story stage sticks under the nav. */
const STORY_STICKY_TOP = NAV_HEIGHT + 16;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  measure: {
    height: '100%',
  },
  // Scroll container: owns scroll-spy, nav condensation, story progress.
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  // ---- sticky navbar (transparent at rest, tinted after 24px) ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    transition: `background-color 220ms ${EASE_OUT}, border-color 220ms ${EASE_OUT}`,
  },
  navBarScrolled: {
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 92%, transparent)',
    borderBottom: '1px solid var(--color-border)',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '10px var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
    transition: `padding 220ms ${EASE_OUT}`,
  },
  navInnerScrolled: {
    padding: '2px var(--spacing-4)',
  },
  // Brand art: white monogram on the accent gradient — identical in both
  // themes on purpose (see Color policy in the header block).
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    background: `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 55%, black))`,
    boxShadow: SHADOW_RAISED,
    color: 'white',
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  brandName: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
  brandSuffix: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    borderLeft: '1px solid var(--color-border)',
    paddingLeft: 'var(--spacing-2)',
    whiteSpace: 'nowrap',
  },
  // 40px text buttons so anchors share one tap-target contract.
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
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
    fontFamily: 'inherit',
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
    color: 'inherit',
  },
  menuPanel: {
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
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  menuLink: {
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
    fontFamily: 'inherit',
  },
  // ---- hero band (aurora field + grain + product theater) ----
  heroBand: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: -NAV_REST_HEIGHT,
    borderBottom: '1px solid var(--color-border)',
    backgroundImage: `linear-gradient(180deg, ${ACCENT_WASH}, transparent 85%)`,
  },
  auroraBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: GRAIN,
    opacity: 0.04,
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: `${NAV_REST_HEIGHT + 56}px var(--spacing-5) 72px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  heroInnerCompact: {
    padding: `${NAV_REST_HEIGHT + 28}px var(--spacing-4) 56px`,
    gap: 'var(--spacing-5)',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroGridStacked: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
    alignItems: 'stretch',
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-4)',
    minWidth: 0,
  },
  eyebrowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 26,
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ACCENT,
    backgroundColor: ACCENT_WASH,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  // Display title: sized per measured tier in the component (76px at wide
  // widths, never under 56px at full width).
  pageTitle: {
    fontWeight: 730,
    letterSpacing: '-0.03em',
    lineHeight: 1.02,
    margin: 0,
  },
  // Gradient ink for the key phrase — accent-derived, clipped to text.
  titleInk: {
    backgroundImage: `linear-gradient(98deg, ${ACCENT} 10%, ${AURORA_A} 55%, ${AURORA_C} 95%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  },
  subcopy: {
    fontSize: 17,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    maxWidth: '56ch',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2) var(--spacing-7)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 730,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  subscribeRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    maxWidth: 520,
    width: '100%',
  },
  subscribeRowStacked: {
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
  emailErrorDark: {
    color:
      'color-mix(in srgb, var(--color-error, light-dark(#B3261E, #F2B8B5)) 45%, white)',
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
  // ---- product theater ----
  theater: {
    position: 'relative',
    minWidth: 0,
  },
  theaterPerspective: {
    transform: 'perspective(1600px) rotateX(5deg) rotateY(-7deg)',
    transition: `transform 420ms ${EASE_OUT}`,
    willChange: 'transform',
  },
  consoleWindow: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
  },
  consoleChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 14px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  consoleTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 14px 0',
    flexWrap: 'wrap',
  },
  consoleTab: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
  },
  consoleTabActive: {
    color: ACCENT,
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  consoleBody: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  consoleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    minWidth: 0,
  },
  consoleVersion: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    color: ACCENT,
    flexShrink: 0,
  },
  consoleRowTitle: {
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    flex: '1 1 auto',
  },
  consoleRowMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  consoleProgress: {
    flex: '0 0 64px',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  consoleProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: ACCENT,
    opacity: 0.8,
  },
  consoleChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 72,
    padding: '4px 4px 0',
  },
  consoleBar: {
    flex: '1 1 0',
    borderRadius: '4px 4px 2px 2px',
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  consoleBarHot: {
    backgroundColor: `color-mix(in srgb, ${ACCENT} 55%, transparent)`,
  },
  consoleChartCaption: {
    fontSize: 10.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
  },
  satellite: {
    position: 'absolute',
    zIndex: 2,
    transition: `transform 420ms ${EASE_OUT}`,
    willChange: 'transform',
  },
  satelliteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    boxShadow: SHADOW_FLOATING,
    whiteSpace: 'nowrap',
  },
  satelliteTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  satelliteMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.3,
  },
  satelliteSpark: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 3,
    height: 26,
  },
  satelliteSparkBar: {
    width: 5,
    borderRadius: 2,
    backgroundColor: `color-mix(in srgb, ${ACCENT} 55%, transparent)`,
  },
  // ---- floating filter toolbar (crosses the hero/entries boundary) ----
  // Rendered OUTSIDE the overflow-hidden hero band and pulled up over its
  // border with a negative top margin so the card straddles the boundary.
  filterBarWrap: {
    position: 'relative',
    zIndex: 6,
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '0 var(--spacing-5)',
    marginTop: -36,
  },
  filterBar: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    marginRight: 'var(--spacing-1)',
  },
  filterSummary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
  },
  // ---- entries column ----
  column: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '76px var(--spacing-5) 104px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  columnCompact: {
    padding: '64px var(--spacing-4) 64px',
  },
  // Sticky month label: pins just under the sticky navbar while its
  // month's entries scroll past; opaque so entries slide underneath.
  monthHeader: {
    position: 'sticky',
    top: NAV_HEIGHT - 1,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-body)',
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  monthRule: {
    flex: '1 1 0',
    height: 1,
    backgroundColor: 'var(--color-border)',
  },
  monthGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  entryGrid: {
    display: 'grid',
    gridTemplateColumns: '140px minmax(0, 1fr)',
    gap: 'var(--spacing-5)',
    alignItems: 'start',
  },
  entryStacked: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  entryRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  entryRailInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  versionChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 26,
    paddingInline: 10,
    borderRadius: 999,
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: 600,
    color: ACCENT,
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
    whiteSpace: 'nowrap',
  },
  // Depth + hover lift live on the .cwn-card class so :hover can retier.
  entryBody: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minWidth: 0,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.015em',
    lineHeight: 1.25,
    margin: 0,
  },
  itemList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  itemBadge: {
    flexShrink: 0,
    marginTop: 1,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 1.55,
    color: 'var(--color-text-primary)',
    minWidth: 0,
  },
  // ---- media blocks ----
  mediaFigure: {
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  mediaCaption: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  mockWindow: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: SHADOW_RAISED,
  },
  mockChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  mockDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
  },
  mockTitle: {
    marginLeft: 6,
    fontSize: 11,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  matchBody: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  matchHeadRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 56px minmax(0, 1fr)',
    gap: 10,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  matchRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 56px minmax(0, 1fr)',
    gap: 10,
    alignItems: 'center',
  },
  matchBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  matchBarStrong: {
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  matchChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    borderRadius: 10,
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  matchChipHigh: {
    color: ACCENT,
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  matchChipLow: {
    color: 'var(--color-warning, light-dark(#92400E, #FCD34D))',
    backgroundColor:
      'light-dark(rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.16))',
    border:
      '1px solid light-dark(rgba(180, 83, 9, 0.3), rgba(245, 158, 11, 0.35))',
  },
  matchChipNone: {
    color: 'var(--color-text-secondary)',
    border: '1px dashed var(--color-border)',
  },
  // ---- before/after slider ----
  sliderStage: {
    position: 'relative',
    height: 230,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    touchAction: 'none',
    userSelect: 'none',
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: SHADOW_RAISED,
  },
  sliderStageCompact: {
    height: 190,
  },
  sliderPane: {
    position: 'absolute',
    inset: 0,
    padding: 'var(--spacing-3)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sliderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderRight: `2px solid ${ACCENT}`,
    backgroundColor: 'var(--color-background-body)',
    backgroundImage: `linear-gradient(180deg, ${ACCENT_WASH}, transparent)`,
    boxSizing: 'border-box',
  },
  sliderOverlayInner: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  paneChip: {
    position: 'absolute',
    top: 10,
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    backgroundColor: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    zIndex: 2,
  },
  paneChipAfter: {
    left: 10,
    color: ACCENT,
    borderColor: ACCENT_BORDER,
  },
  paneChipBefore: {
    right: 10,
  },
  paneWindow: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
  },
  paneBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  paneBarAccent: {
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  paneModal: {
    alignSelf: 'center',
    width: '72%',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: SHADOW_RAISED,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: -34,
  },
  paneRowSplit: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    marginLeft: -20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'ew-resize',
    zIndex: 3,
  },
  sliderGrip: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-body)',
    border: `1px solid ${ACCENT_BORDER}`,
    boxShadow: SHADOW_RAISED,
    color: ACCENT,
  },
  sliderButtons: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // ---- breaking callout ----
  breakingCallout: {
    borderRadius: 12,
    border:
      '1px solid light-dark(rgba(180, 83, 9, 0.35), rgba(245, 158, 11, 0.4))',
    backgroundColor:
      'light-dark(rgba(245, 158, 11, 0.09), rgba(245, 158, 11, 0.12))',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  breakingHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    color: 'var(--color-warning, light-dark(#92400E, #FCD34D))',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  breakingText: {
    fontSize: 13,
    lineHeight: 1.55,
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  // ---- load more / end note ----
  loadMoreWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
  },
  // ---- pinned pipeline story ----
  storyBand: {
    position: 'relative',
    borderTop: '1px solid var(--color-border)',
    backgroundImage:
      'radial-gradient(color-mix(in srgb, var(--color-text-primary) 7%, transparent) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  },
  storyStage: {
    position: 'sticky',
    top: STORY_STICKY_TOP,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  storyInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '0 var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  storyStaticInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '104px var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  storyHeading: {
    fontSize: 38,
    fontWeight: 720,
    letterSpacing: '-0.025em',
    lineHeight: 1.08,
    margin: 0,
  },
  storyHeadingCompact: {
    fontSize: 28,
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: '340px minmax(0, 1fr)',
    gap: 'var(--spacing-8)',
    alignItems: 'stretch',
  },
  storyGridStacked: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  storyRail: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  storyStep: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: '12px 12px 12px 0',
    minHeight: 44,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    borderRadius: 12,
  },
  storyStepNum: {
    width: 58,
    flexShrink: 0,
    fontSize: 40,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
    color: 'color-mix(in srgb, var(--color-text-primary) 18%, transparent)',
    transition: `color 240ms ${EASE_OUT}`,
    textAlign: 'left',
  },
  storyStepNumActive: {
    color: ACCENT,
  },
  storyStepTitle: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  storyStepCopy: {
    fontSize: 13.5,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 0',
    maxWidth: '38ch',
  },
  storyStepRowCompact: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  storyStepCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingInline: 12,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
  storyStepCompactActive: {
    borderColor: ACCENT_BORDER,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  storyProgressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'var(--color-border)',
    overflow: 'hidden',
    marginTop: 'var(--spacing-3)',
  },
  storyProgressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
    backgroundColor: ACCENT,
    transformOrigin: 'left',
  },
  storyViewport: {
    position: 'relative',
    minHeight: 320,
  },
  storyState: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: `opacity 480ms ${EASE_OUT}, transform 480ms ${EASE_OUT}`,
  },
  pipeWindow: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: SHADOW_FLOATING,
  },
  pipeBody: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  pipeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 10px',
    borderRadius: 9,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    minWidth: 0,
  },
  pipeHash: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  pipeText: {
    fontSize: 12.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    flex: '1 1 auto',
  },
  pipeTagChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: ACCENT,
    backgroundColor: ACCENT_SOFT,
    border: `1px solid ${ACCENT_BORDER}`,
    flexShrink: 0,
  },
  // ---- scheme-locked dark subscribe band ----
  darkBand: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: INK,
    color: INK_TEXT,
  },
  darkGlow: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  darkSpotlight: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(360px circle at var(--mx, 72%) var(--my, 24%), color-mix(in srgb, white 7%, transparent), transparent 72%)',
  },
  darkInner: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: '112px var(--spacing-5)',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 6fr) minmax(0, 5fr)',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  darkInnerStacked: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '64px var(--spacing-4)',
    gap: 'var(--spacing-5)',
  },
  darkEyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: `color-mix(in srgb, ${ACCENT} 80%, white)`,
  },
  darkTitle: {
    fontSize: 40,
    fontWeight: 730,
    letterSpacing: '-0.025em',
    lineHeight: 1.06,
    margin: 0,
    color: INK_TEXT,
  },
  darkTitleCompact: {
    fontSize: 30,
  },
  darkCopy: {
    fontSize: 15.5,
    lineHeight: 1.6,
    color: INK_TEXT_DIM,
    margin: 0,
    maxWidth: '48ch',
  },
  glassCard: {
    borderRadius: 18,
    backgroundColor: INK_GLASS,
    boxShadow: SHADOW_GLASS,
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  glassMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2) var(--spacing-4)',
  },
  glassMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12.5,
    color: INK_TEXT_DIM,
  },
  darkResetButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: INK_TEXT_DIM,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 4px',
    fontFamily: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  // ---- footer ----
  footer: {
    backgroundColor: 'var(--color-background-muted)',
  },
  footerInner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-7) var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerCols: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-6)',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    minWidth: 140,
  },
  footerHeading: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-1)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  footerMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2) var(--spacing-4)',
    borderTop: '1px solid var(--color-border)',
    paddingTop: 'var(--spacing-4)',
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
// Deterministic fixtures for the fictional Ledgerline accounting platform.
// No Date.now, no randomness, no network assets.

const BRAND = {
  name: 'Ledgerline',
  suffix: 'Changelog',
  feedUrl: 'https://ledgerline.com/changelog.xml',
};

type SectionId = 'latest' | 'breaking' | 'subscribe';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'latest', label: 'Latest'},
  {id: 'breaking', label: 'Breaking change'},
  {id: 'subscribe', label: 'Subscribe'},
];

interface HeaderStat {
  id: string;
  value: number;
  label: string;
}

const HEADER_STATS: readonly HeaderStat[] = [
  {id: 'releases', value: 142, label: 'releases since 2020'},
  {id: 'updates', value: 1246, label: 'updates shipped'},
  {id: 'security', value: 38, label: 'security patches'},
];

type TagId = 'new' | 'improved' | 'fixed' | 'security';

const TAGS: readonly {id: TagId; label: string}[] = [
  {id: 'new', label: 'New'},
  {id: 'improved', label: 'Improved'},
  {id: 'fixed', label: 'Fixed'},
  {id: 'security', label: 'Security'},
];

const TAG_META: Record<TagId, {label: string; badge: BadgeVariant}> = {
  new: {label: 'New', badge: 'green'},
  improved: {label: 'Improved', badge: 'blue'},
  fixed: {label: 'Fixed', badge: 'purple'},
  security: {label: 'Security', badge: 'red'},
};

interface EntryItem {
  id: string;
  tag: TagId;
  text: string;
}

interface Entry {
  id: string;
  version: string;
  dateLabel: string;
  month: string;
  title: string;
  items: readonly EntryItem[];
  media?: 'reconciliation' | 'editor-slider';
  mediaCaption?: string;
  isBreaking?: boolean;
  breakingNote?: string;
  breakingSnippetTitle?: string;
  breakingSnippet?: string;
  /** Entries behind the Load-more control. */
  isOlder?: boolean;
}

const MIGRATION_SNIPPET = [
  '- signature = request.headers["X-Ledgerline-Signature"]',
  '- valid = signature == sha256(static_secret + body)',
  '+ signature = request.headers["X-Ledgerline-Signature-V2"]',
  '+ timestamp = request.headers["X-Ledgerline-Timestamp"]',
  '+ valid = signature == hmac_sha256(signing_key, f"{timestamp}.{body}")',
].join('\n');

const ENTRIES: readonly Entry[] = [
  {
    id: 'v2-14',
    version: 'v2.14',
    dateLabel: 'Jul 9, 2026',
    month: 'July 2026',
    title: 'Reconciliation, redesigned',
    media: 'reconciliation',
    mediaCaption:
      'The new reconciliation workspace — every suggested match carries a ' +
      'confidence score, and anything above 95% can be accepted in bulk.',
    items: [
      {
        id: 'v2-14-1',
        tag: 'new',
        text:
          'Reconciliation workspace: bank lines and ledger entries sit side ' +
          'by side, with a confidence score on every suggested match.',
      },
      {
        id: 'v2-14-2',
        tag: 'new',
        text:
          'Accept every match above 95% confidence in one click — our ' +
          'largest beta customer cleared 1,900 lines in 40 seconds.',
      },
      {
        id: 'v2-14-3',
        tag: 'improved',
        text:
          'Statement imports parse about 40% faster, and OFX files that mix ' +
          'currencies no longer stall the import queue.',
      },
      {
        id: 'v2-14-4',
        tag: 'fixed',
        text:
          'Transfers that settle across a month boundary are no longer ' +
          'counted in both periods.',
      },
    ],
  },
  {
    id: 'v2-13',
    version: 'v2.13',
    dateLabel: 'Jul 2, 2026',
    month: 'July 2026',
    title: 'Approval chains and streaming exports',
    items: [
      {
        id: 'v2-13-1',
        tag: 'new',
        text:
          'Approval chains: route any invoice over a threshold through up ' +
          'to three reviewers, each with a per-step SLA timer.',
      },
      {
        id: 'v2-13-2',
        tag: 'improved',
        text:
          'CSV exports stream instead of buffering — a 250,000-row export ' +
          'now finishes in under 20 seconds.',
      },
      {
        id: 'v2-13-3',
        tag: 'fixed',
        text:
          'The duplicate-invoice detector compares normalized supplier ' +
          "names, so 'Acme GmbH' and 'ACME GmbH' finally collide.",
      },
      {
        id: 'v2-13-4',
        tag: 'security',
        text:
          'Session cookies moved to SameSite=Strict, and idle sessions now ' +
          'expire after 12 hours.',
      },
    ],
  },
  {
    id: 'v2-12',
    version: 'v2.12',
    dateLabel: 'Jun 25, 2026',
    month: 'June 2026',
    title: 'A calmer invoice editor',
    media: 'editor-slider',
    mediaCaption:
      'Drag the divider — or use the buttons — to compare the old modal ' +
      'stack with the single-pane editor.',
    items: [
      {
        id: 'v2-12-1',
        tag: 'improved',
        text:
          'The invoice editor was rebuilt as a single pane: line items, tax ' +
          'treatment, and totals live together, and the modal-in-modal flow ' +
          'is gone.',
      },
      {
        id: 'v2-12-2',
        tag: 'improved',
        text:
          'Keyboard-first entry: focus order follows the paper form, and ' +
          'Cmd+Enter saves the draft and opens the next one.',
      },
      {
        id: 'v2-12-3',
        tag: 'fixed',
        text:
          'Reordering line items no longer resets unit prices that were ' +
          'entered in a foreign currency.',
      },
    ],
  },
  {
    id: 'v2-11',
    version: 'v2.11',
    dateLabel: 'Jun 18, 2026',
    month: 'June 2026',
    title: 'Multi-entity consolidation, in beta',
    items: [
      {
        id: 'v2-11-1',
        tag: 'new',
        text:
          'Consolidation (beta): roll up to five subsidiaries into one ' +
          'group P&L, translated at month-end rates.',
      },
      {
        id: 'v2-11-2',
        tag: 'improved',
        text:
          'Chart-of-accounts search matches account codes as well as names ' +
          '— type 6200 to jump straight to Travel.',
      },
      {
        id: 'v2-11-3',
        tag: 'fixed',
        text:
          'Fixed a rounding drift that could leave a group balance sheet ' +
          'off by one cent per 10,000 translated lines.',
      },
      {
        id: 'v2-11-4',
        tag: 'fixed',
        text: 'Year-end lock no longer blocks read-only exports for auditors.',
      },
    ],
  },
  {
    id: 'v2-10',
    version: 'v2.10',
    dateLabel: 'Jun 11, 2026',
    month: 'June 2026',
    title: 'Webhook signatures v2',
    isBreaking: true,
    breakingNote:
      'v1 static-secret signatures stop validating on August 15, 2026. ' +
      'Update your verifier to the v2 rotating-key header before then — ' +
      'for most integrations it is a three-line change.',
    breakingSnippetTitle: 'webhooks/verify.py',
    breakingSnippet: MIGRATION_SNIPPET,
    items: [
      {
        id: 'v2-10-1',
        tag: 'security',
        text:
          'Webhook payloads are now signed with rotating HMAC keys. New ' +
          'endpoints get v2 signatures today; v1 secrets are retired on ' +
          'August 15.',
      },
      {
        id: 'v2-10-2',
        tag: 'improved',
        text:
          'The delivery log shows response codes, retry timelines, and a ' +
          'per-endpoint failure rate for the last 7 days.',
      },
    ],
  },
  {
    id: 'v2-9',
    version: 'v2.9',
    dateLabel: 'Jun 4, 2026',
    month: 'June 2026',
    title: 'Recurring invoices and tidier statements',
    items: [
      {
        id: 'v2-9-1',
        tag: 'new',
        text:
          'Recurring invoices: weekly, monthly, or custom schedules with ' +
          'automatic proration for mid-cycle starts.',
      },
      {
        id: 'v2-9-2',
        tag: 'improved',
        text:
          'Customer statements group by currency instead of interleaving, ' +
          'and the PDF is about 30% lighter.',
      },
      {
        id: 'v2-9-3',
        tag: 'fixed',
        text:
          'Credit notes applied twice in the same session no longer double ' +
          "the customer's open balance.",
      },
    ],
  },
  {
    id: 'v2-8',
    version: 'v2.8',
    dateLabel: 'May 28, 2026',
    month: 'May 2026',
    title: 'Audit log filters and faster deprovisioning',
    items: [
      {
        id: 'v2-8-1',
        tag: 'new',
        text:
          'Audit log filters: slice every event by actor, entity, and date ' +
          'range, then save the view for your next close.',
      },
      {
        id: 'v2-8-2',
        tag: 'security',
        text:
          'SCIM deprovisioning now revokes API tokens within 60 seconds of ' +
          'a directory removal.',
      },
      {
        id: 'v2-8-3',
        tag: 'fixed',
        text: 'Exported audit CSVs escape embedded commas in memo fields.',
      },
    ],
  },
  {
    id: 'v2-7',
    version: 'v2.7',
    dateLabel: 'May 21, 2026',
    month: 'May 2026',
    title: 'Close checklist polish',
    items: [
      {
        id: 'v2-7-1',
        tag: 'improved',
        text:
          'The close checklist remembers per-person task order, and drag ' +
          'handles work with a keyboard.',
      },
      {
        id: 'v2-7-2',
        tag: 'improved',
        text: 'Attachment previews render inline for PDFs up to 25 MB.',
      },
      {
        id: 'v2-7-3',
        tag: 'fixed',
        text:
          'Reopening a closed period no longer clears reviewer sign-offs ' +
          'from the previous run.',
      },
    ],
  },
  // ---- older releases, revealed by Load more ----
  {
    id: 'v2-6',
    version: 'v2.6',
    dateLabel: 'May 14, 2026',
    month: 'May 2026',
    title: 'VAT drafts for UK and EU schemes',
    isOlder: true,
    items: [
      {
        id: 'v2-6-1',
        tag: 'new',
        text:
          'VAT return drafts for UK MTD and EU OSS schemes, pre-filled from ' +
          'tagged transactions.',
      },
      {
        id: 'v2-6-2',
        tag: 'fixed',
        text:
          'Reverse-charge lines now land in the correct VAT box for ' +
          'cross-border services.',
      },
    ],
  },
  {
    id: 'v2-5',
    version: 'v2.5',
    dateLabel: 'May 7, 2026',
    month: 'May 2026',
    title: 'Quieter notifications',
    isOlder: true,
    items: [
      {
        id: 'v2-5-1',
        tag: 'improved',
        text:
          'Notification digests batch mention alerts into one email per ' +
          'hour instead of one per comment.',
      },
      {
        id: 'v2-5-2',
        tag: 'fixed',
        text:
          'Approval SLA timers now follow the approver’s timezone, not the ' +
          'requester’s.',
      },
      {
        id: 'v2-5-3',
        tag: 'security',
        text:
          'Patched a low-severity XML parser advisory in statement imports ' +
          '(no customer action needed).',
      },
    ],
  },
  {
    id: 'v2-4',
    version: 'v2.4',
    dateLabel: 'Apr 23, 2026',
    month: 'April 2026',
    title: 'API v2 general availability',
    isOlder: true,
    items: [
      {
        id: 'v2-4-1',
        tag: 'new',
        text:
          'Ledgerline API v2 is GA: cursor pagination, idempotency keys on ' +
          'every write, and typed error envelopes.',
      },
      {
        id: 'v2-4-2',
        tag: 'improved',
        text:
          'Rate limits raised to 600 requests/min on Growth plans, with ' +
          'headers that tell you when to back off.',
      },
    ],
  },
  {
    id: 'v2-3',
    version: 'v2.3',
    dateLabel: 'Apr 9, 2026',
    month: 'April 2026',
    title: 'Small fixes across the ledger',
    isOlder: true,
    items: [
      {
        id: 'v2-3-1',
        tag: 'improved',
        text:
          'Journal entry templates support formula cells — =debit(6200) * ' +
          '0.21 fills the VAT line for you.',
      },
      {
        id: 'v2-3-2',
        tag: 'fixed',
        text:
          'Bulk-editing categories no longer collapses the transaction ' +
          'list scroll position.',
      },
      {
        id: 'v2-3-3',
        tag: 'fixed',
        text:
          'The trial balance footer sums correctly when a filter hides ' +
          'zero-balance accounts.',
      },
    ],
  },
];

/** Per-tag item counts across all twelve releases (shown on the toggles). */
const TAG_COUNTS: Record<TagId, number> = (() => {
  const counts: Record<TagId, number> = {
    new: 0,
    improved: 0,
    fixed: 0,
    security: 0,
  };
  for (const entry of ENTRIES) {
    for (const item of entry.items) {
      counts[item.tag] += 1;
    }
  }
  return counts;
})();

/** Rows for the schematic reconciliation screenshot. */
const MATCH_ROWS: readonly {
  id: string;
  left: number;
  right: number;
  chip: string;
  grade: 'high' | 'low' | 'none';
}[] = [
  {id: 'm1', left: 82, right: 74, chip: '99%', grade: 'high'},
  {id: 'm2', left: 64, right: 88, chip: '97%', grade: 'high'},
  {id: 'm3', left: 90, right: 66, chip: '95%', grade: 'high'},
  {id: 'm4', left: 58, right: 80, chip: '82%', grade: 'low'},
  {id: 'm5', left: 72, right: 0, chip: '—', grade: 'none'},
];

/** Hero release-console fixtures. */
const CONSOLE_ROWS: readonly {
  id: string;
  version: string;
  title: string;
  meta: string;
  state: 'shipped' | 'review';
  progress?: number;
}[] = [
  {
    id: 'c1',
    version: 'v2.15',
    title: 'Draft — approval analytics',
    meta: 'In review',
    state: 'review',
    progress: 64,
  },
  {
    id: 'c2',
    version: 'v2.14',
    title: 'Reconciliation, redesigned',
    meta: 'Shipped Jul 9',
    state: 'shipped',
  },
  {
    id: 'c3',
    version: 'v2.13',
    title: 'Approval chains and streaming exports',
    meta: 'Shipped Jul 2',
    state: 'shipped',
  },
];

/** Updates-per-month bars for the hero console chart (Feb–Jul 2026). */
const CONSOLE_BARS: readonly {id: string; height: number; hot?: boolean}[] = [
  {id: 'feb', height: 34},
  {id: 'mar', height: 48},
  {id: 'apr', height: 42},
  {id: 'may', height: 58},
  {id: 'jun', height: 66},
  {id: 'jul', height: 78, hot: true},
];

const SPARK_BARS: readonly number[] = [8, 12, 10, 16, 14, 20, 26];

/** Pinned pipeline story: three states of the release train. */
const STORY_STEPS: readonly {
  id: string;
  num: string;
  title: string;
  copy: string;
}[] = [
  {
    id: 'merge',
    num: '01',
    title: 'Merge and tag',
    copy:
      'Every merged pull request boards the weekly release train, and the ' +
      'train cuts a semver tag on Thursday morning.',
  },
  {
    id: 'draft',
    num: '02',
    title: 'Draft the notes',
    copy:
      'The team turns the diff into human release notes — every line ' +
      'tagged New, Improved, Fixed, or Security before review.',
  },
  {
    id: 'publish',
    num: '03',
    title: 'Publish everywhere',
    copy:
      'The entry lands on this page, the RSS feed, and every subscriber ' +
      'inbox at 9:00 London time. No release skips the log.',
  },
];

const FOOTER_COLUMNS: readonly {
  heading: string;
  links: readonly string[];
}[] = [
  {heading: 'Product', links: ['Docs', 'Status', 'API reference', 'Pricing']},
  {heading: 'Resources', links: ['Migration guides', 'Security', 'Roadmap']},
  {heading: 'Company', links: ['About', 'Blog', 'Contact']},
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(raw: string): string | null {
  const value = raw.trim();
  if (value.length === 0) {
    return 'Enter your email to subscribe.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'That does not look like an email address.';
  }
  return null;
}

function formatInt(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

// ============= HOOKS =============

/**
 * Element-width breakpoints (ResizeObserver) — the demo's inline stage is
 * ~1045px wide inside a 1440px window, so viewport media queries never
 * fire there; the page must measure itself.
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

/** Measured height of the scroll container — sizes the pinned story. */
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

/** Live prefers-reduced-motion flag; false where matchMedia is missing. */
function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduce(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

/**
 * True once the node has intersected the viewport. Falls back to visible
 * when IntersectionObserver is unavailable so nothing renders hidden in
 * static environments.
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
      {threshold: 0.12},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Eases 0 → target with requestAnimationFrame once `isActive` flips true.
 * ~900ms decelerate landing. Reduced motion (and rAF-less environments)
 * snap straight to the target.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  reduceMotion: boolean,
  durationMs = 900,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return undefined;
    }
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
      // ease-out cubic: fast start, gentle landing on the fixture value.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isActive, reduceMotion, durationMs]);
  return isActive && value > target ? target : value;
}

// ============= PIECES =============

/**
 * Rise+fade+settle scroll reveal (translateY 16px + scale .985 → identity
 * over 560ms decelerate); parents stagger children via delayMs. Renders
 * visible under reduced motion.
 */
function Reveal({
  children,
  delayMs = 0,
  reduceMotion,
}: {
  children: ReactNode;
  delayMs?: number;
  reduceMotion: boolean;
}) {
  const [ref, inView] = useInView();
  const shown = reduceMotion || inView;
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px) scale(0.985)',
        transition: reduceMotion
          ? 'none'
          : `opacity 560ms ${EASE_OUT} ${delayMs}ms, transform 560ms ${EASE_OUT} ${delayMs}ms`,
      }}>
      {children}
    </div>
  );
}

/** One count-up figure in the hero stats row. */
function CountUpStat({
  stat,
  isActive,
  reduceMotion,
}: {
  stat: HeaderStat;
  isActive: boolean;
  reduceMotion: boolean;
}) {
  const value = useCountUp(stat.value, isActive, reduceMotion);
  return (
    <div>
      <div style={styles.statValue}>{formatInt(value)}</div>
      <div style={styles.statLabel}>{stat.label}</div>
    </div>
  );
}

/**
 * Validating email capture; success flips to a confirmed card with a
 * reset. The hero and the dark band each own an independent copy; the
 * dark band passes tone="dark" so its copy stays legible on ink.
 */
function EmailCapture({
  inputLabel,
  buttonLabel,
  confirmedNote,
  isStacked,
  onSubscribed,
  trailing,
  tone = 'light',
}: {
  inputLabel: string;
  buttonLabel: string;
  confirmedNote: string;
  isStacked: boolean;
  onSubscribed: (email: string) => void;
  trailing?: ReactNode;
  tone?: 'light' | 'dark';
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const isDark = tone === 'dark';

  const submit = () => {
    const nextError = validateEmail(value);
    if (nextError !== null) {
      setError(nextError);
      return;
    }
    const trimmed = value.trim();
    setValue('');
    setError(null);
    setConfirmed(trimmed);
    onSubscribed(trimmed);
  };

  if (confirmed !== null) {
    return (
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.successDisc}>
          <Icon icon={MailCheckIcon} size="md" color="inherit" />
        </div>
        <StackItem size="fill">
          <VStack gap={0}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: isDark ? INK_TEXT : 'var(--color-text-primary)',
              }}>
              You&rsquo;re on the list
            </span>
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: isDark ? INK_TEXT_DIM : 'var(--color-text-secondary)',
              }}>
              {confirmedNote.replace('{email}', confirmed)}
            </span>
          </VStack>
        </StackItem>
        {isDark ? (
          <button
            type="button"
            style={styles.darkResetButton}
            onClick={() => setConfirmed(null)}>
            Use a different email
          </button>
        ) : (
          <Button
            label="Use a different email"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmed(null)}
          />
        )}
      </HStack>
    );
  }

  return (
    <VStack gap={1}>
      <div
        style={{
          ...styles.subscribeRow,
          ...(isStacked ? styles.subscribeRowStacked : null),
        }}>
        <div style={styles.emailInput}>
          <TextInput
            label={inputLabel}
            isLabelHidden
            placeholder="you@company.com"
            value={value}
            onChange={next => {
              setValue(next);
              setError(null);
            }}
          />
        </div>
        <span className="cwn-sheen">
          <Button
            label={buttonLabel}
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={submit}
          />
        </span>
        {trailing}
      </div>
      {error !== null && (
        <p
          style={{
            ...styles.emailError,
            ...(isDark ? styles.emailErrorDark : null),
          }}
          role="alert">
          {error}
        </p>
      )}
    </VStack>
  );
}

/**
 * Product-theater hero art: a perspective-staged "release console" mock
 * (window chrome, tab rail, release rows, updates-per-month bars) orbited
 * by three satellite cards that bob on independent negative-delay
 * keyframes and parallax toward the pointer. All CSS-drawn; no assets.
 */
function HeroTheater({
  reduceMotion,
  isPhone,
  allowParallax,
  parallaxX,
  parallaxY,
}: {
  reduceMotion: boolean;
  isPhone: boolean;
  allowParallax: boolean;
  parallaxX: number;
  parallaxY: number;
}) {
  const shift = (factor: number) =>
    allowParallax
      ? `translate(${(parallaxX * 8 * factor).toFixed(1)}px, ${(
          parallaxY * 7 * factor
        ).toFixed(1)}px)`
      : 'none';
  const bob = (duration: number, delay: number) =>
    reduceMotion ? undefined : `cwn-bob ${duration}s ease-in-out ${delay}s infinite`;

  return (
    <div style={styles.theater} aria-hidden="true">
      <div
        style={{
          ...styles.theaterPerspective,
          ...(reduceMotion || isPhone
            ? {transform: 'none'}
            : null),
        }}>
        <div
          style={{
            ...styles.consoleWindow,
            transform: shift(-0.5),
            transition: styles.satellite.transition,
          }}>
          <div style={styles.consoleChrome}>
            <span style={styles.mockDot} />
            <span style={styles.mockDot} />
            <span style={styles.mockDot} />
            <span style={styles.mockTitle}>
              ledgerline.com/changelog — release console
            </span>
          </div>
          <div style={styles.consoleTabs}>
            <span style={{...styles.consoleTab, ...styles.consoleTabActive}}>
              Releases
            </span>
            <span style={styles.consoleTab}>Drafts</span>
            <span style={styles.consoleTab}>Feed</span>
          </div>
          <div style={styles.consoleBody}>
            {CONSOLE_ROWS.map(row => (
              <div key={row.id} style={styles.consoleRow}>
                <StatusDot
                  variant={row.state === 'shipped' ? 'success' : 'warning'}
                  label={row.state === 'shipped' ? 'Shipped' : 'In review'}
                />
                <span style={styles.consoleVersion}>{row.version}</span>
                <span style={styles.consoleRowTitle}>{row.title}</span>
                {row.progress !== undefined ? (
                  <span style={styles.consoleProgress}>
                    <span
                      style={{
                        ...styles.consoleProgressFill,
                        width: `${row.progress}%`,
                        display: 'block',
                      }}
                    />
                  </span>
                ) : (
                  <span style={styles.consoleRowMeta}>{row.meta}</span>
                )}
              </div>
            ))}
            <div style={styles.consoleChart}>
              {CONSOLE_BARS.map(bar => (
                <span
                  key={bar.id}
                  style={{
                    ...styles.consoleBar,
                    ...(bar.hot === true ? styles.consoleBarHot : null),
                    height: `${bar.height}%`,
                  }}
                />
              ))}
            </div>
            <span style={styles.consoleChartCaption}>
              Updates shipped · Feb–Jul 2026
            </span>
          </div>
        </div>
      </div>

      {/* Satellite: latest release receipt. */}
      <div
        style={{
          ...styles.satellite,
          top: isPhone ? -14 : -22,
          right: isPhone ? 4 : -12,
          transform: shift(1),
        }}>
        <div style={{animation: bob(7, -2)}}>
          <div style={styles.satelliteCard}>
            <StatusDot variant="success" label="Shipped" />
            <div>
              <div style={styles.satelliteTitle}>v2.14 shipped</div>
              <div style={styles.satelliteMeta}>Thursday · Jul 9</div>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite: cumulative updates metric with sparkline. */}
      {!isPhone && (
        <div
          style={{
            ...styles.satellite,
            bottom: 34,
            left: -14,
            transform: shift(0.7),
          }}>
          <div style={{animation: bob(8.5, -4)}}>
            <div style={styles.satelliteCard}>
              <span style={styles.satelliteSpark}>
                {SPARK_BARS.map((height, index) => (
                  <span
                    key={index}
                    style={{...styles.satelliteSparkBar, height}}
                  />
                ))}
              </span>
              <div>
                <div style={styles.satelliteTitle}>1,246 updates</div>
                <div style={styles.satelliteMeta}>shipped since 2020</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Satellite: subscriber receipt toast. */}
      <div
        style={{
          ...styles.satellite,
          bottom: isPhone ? -16 : -24,
          right: isPhone ? 12 : 36,
          transform: shift(1.2),
        }}>
        <div style={{animation: bob(6.5, -1)}}>
          <div style={styles.satelliteCard}>
            <span style={{color: ACCENT, display: 'inline-flex'}}>
              <Icon icon={MailCheckIcon} size="sm" color="inherit" />
            </span>
            <div>
              <div style={styles.satelliteTitle}>Release notes sent</div>
              <div style={styles.satelliteMeta}>Every Thursday · 9:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Schematic reconciliation screenshot (CSS-drawn; no network assets). */
function ReconciliationMock() {
  return (
    <div
      style={styles.mockWindow}
      role="img"
      aria-label="Stylized screenshot of the reconciliation workspace matching bank lines to ledger entries with confidence scores">
      <div style={styles.mockChrome} aria-hidden="true">
        <span style={styles.mockDot} />
        <span style={styles.mockDot} />
        <span style={styles.mockDot} />
        <span style={styles.mockTitle}>
          ledgerline.com/books/reconcile/operating-gbp
        </span>
      </div>
      <div style={styles.matchBody} aria-hidden="true">
        <div style={styles.matchHeadRow}>
          <span>Bank lines</span>
          <span style={{textAlign: 'center'}}>Match</span>
          <span>Ledger entries</span>
        </div>
        {MATCH_ROWS.map(row => (
          <div key={row.id} style={styles.matchRow}>
            <div
              style={{
                ...styles.matchBar,
                ...(row.grade === 'high' ? styles.matchBarStrong : null),
                width: `${row.left}%`,
              }}
            />
            <span
              style={{
                ...styles.matchChip,
                ...(row.grade === 'high'
                  ? styles.matchChipHigh
                  : row.grade === 'low'
                    ? styles.matchChipLow
                    : styles.matchChipNone),
              }}>
              {row.chip}
            </span>
            {row.right > 0 ? (
              <div
                style={{
                  ...styles.matchBar,
                  ...(row.grade === 'high' ? styles.matchBarStrong : null),
                  width: `${row.right}%`,
                  justifySelf: 'end',
                }}
              />
            ) : (
              <div
                style={{
                  ...styles.matchBar,
                  width: '46%',
                  justifySelf: 'end',
                  border: '1px dashed var(--color-border)',
                  backgroundColor: 'transparent',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Before/after comparison: a draggable divider over two tinted panes,
 * with Before / Split / After buttons and arrow-key support as no-drag
 * fallbacks. Reduced motion drops the settle transition only.
 */
function BeforeAfterSlider({
  reduceMotion,
  isPhone,
}: {
  reduceMotion: boolean;
  isPhone: boolean;
}) {
  const [percent, setPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const clamp = (next: number) => Math.min(92, Math.max(8, next));

  const updateFromClientX = (clientX: number) => {
    const stage = stageRef.current;
    if (stage == null) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    setPercent(clamp(((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromClientX(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromClientX(event.clientX);
    }
  };
  const endDrag = () => setIsDragging(false);

  const onHandleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPercent(previous => clamp(previous - 8));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPercent(previous => clamp(previous + 8));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setPercent(8);
    } else if (event.key === 'End') {
      event.preventDefault();
      setPercent(92);
    }
  };

  const settle =
    isDragging || reduceMotion ? 'none' : 'width 240ms ease, left 240ms ease';

  const paneRows = (accent: boolean) => (
    <div style={styles.paneWindow}>
      <div
        style={{
          ...styles.paneBar,
          ...(accent ? styles.paneBarAccent : null),
          width: '38%',
        }}
      />
      {accent ? (
        <>
          <div style={styles.paneRowSplit}>
            <div style={{...styles.paneBar, flex: '1 1 0'}} />
            <div style={{...styles.paneBar, width: 56}} />
            <div
              style={{...styles.paneBar, ...styles.paneBarAccent, width: 44}}
            />
          </div>
          <div style={styles.paneRowSplit}>
            <div style={{...styles.paneBar, flex: '1 1 0'}} />
            <div style={{...styles.paneBar, width: 56}} />
            <div
              style={{...styles.paneBar, ...styles.paneBarAccent, width: 44}}
            />
          </div>
          <div style={styles.paneRowSplit}>
            <div style={{...styles.paneBar, flex: '1 1 0'}} />
            <div style={{...styles.paneBar, width: 56}} />
            <div
              style={{...styles.paneBar, ...styles.paneBarAccent, width: 44}}
            />
          </div>
          <div
            style={{
              ...styles.paneBar,
              ...styles.paneBarAccent,
              width: '52%',
              alignSelf: 'flex-end',
              height: 14,
            }}
          />
        </>
      ) : (
        <>
          <div style={{...styles.paneBar, width: '86%'}} />
          <div style={{...styles.paneBar, width: '74%'}} />
          <div style={{...styles.paneBar, width: '80%'}} />
        </>
      )}
    </div>
  );

  return (
    <VStack gap={2}>
      <div
        ref={stageRef}
        style={{
          ...styles.sliderStage,
          ...(isPhone ? styles.sliderStageCompact : null),
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}>
        {/* Base pane: the old modal-stack editor ("Before"). */}
        <div style={styles.sliderPane} aria-hidden="true">
          {paneRows(false)}
          <div style={styles.paneModal}>
            <div style={{...styles.paneBar, width: '48%'}} />
            <div style={{...styles.paneBar, width: '84%'}} />
            <div style={{...styles.paneBar, width: '66%'}} />
          </div>
        </div>
        <span style={{...styles.paneChip, ...styles.paneChipBefore}}>
          Before
        </span>
        {/* Overlay pane: the single-pane editor ("After"), clipped. */}
        <div
          style={{
            ...styles.sliderOverlay,
            width: `${percent}%`,
            transition: settle,
          }}
          aria-hidden="true">
          <div
            style={{
              ...styles.sliderOverlayInner,
              width: `${10000 / percent}%`,
            }}>
            <div style={styles.sliderPane}>{paneRows(true)}</div>
            <span style={{...styles.paneChip, ...styles.paneChipAfter}}>
              After
            </span>
          </div>
        </div>
        <button
          type="button"
          role="slider"
          aria-label="Compare the old and new invoice editor"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-valuetext={`${Math.round(percent)}% of the redesigned editor shown`}
          onKeyDown={onHandleKeyDown}
          style={{
            ...styles.sliderHandle,
            left: `${percent}%`,
            transition: settle,
          }}>
          <span style={styles.sliderGrip}>
            <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
          </span>
        </button>
      </div>
      <div style={styles.sliderButtons}>
        {(
          [
            {label: 'Before', target: 8},
            {label: 'Split', target: 50},
            {label: 'After', target: 92},
          ] as const
        ).map(preset => (
          <div
            key={preset.label}
            style={isPhone ? {flex: '1 1 0', display: 'grid'} : undefined}>
            <Button
              label={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => setPercent(preset.target)}
            />
          </div>
        ))}
      </div>
    </VStack>
  );
}

/** One schematic mock per pipeline step (CSS-drawn; no assets). */
function PipelineMock({step}: {step: number}) {
  if (step === 0) {
    return (
      <div style={styles.pipeWindow} aria-hidden="true">
        <div style={styles.mockChrome}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockTitle}>release-train · thursday cut</span>
        </div>
        <div style={styles.pipeBody}>
          {(
            [
              {hash: 'a41f20e', text: 'reconcile: bulk-accept above 95%'},
              {hash: '9c07b31', text: 'imports: stream OFX parse queue'},
              {hash: 'f5d2c88', text: 'transfers: month-boundary fix'},
            ] as const
          ).map(commit => (
            <div key={commit.hash} style={styles.pipeRow}>
              <span style={{color: ACCENT, display: 'inline-flex'}}>
                <Icon icon={GitMergeIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.pipeHash}>{commit.hash}</span>
              <span style={styles.pipeText}>{commit.text}</span>
              <span style={{color: ACCENT, display: 'inline-flex'}}>
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              </span>
            </div>
          ))}
          <div style={{...styles.pipeRow, borderStyle: 'dashed'}}>
            <span style={styles.pipeTagChip}>tag</span>
            <span style={{...styles.pipeText, fontFamily: MONO, fontWeight: 700}}>
              v2.14
            </span>
            <span style={styles.pipeHash}>cut Jul 9 · 07:40</span>
          </div>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div style={styles.pipeWindow} aria-hidden="true">
        <div style={styles.mockChrome}>
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockDot} />
          <span style={styles.mockTitle}>notes/v2.14.md — draft</span>
        </div>
        <div style={styles.pipeBody}>
          <div style={styles.pipeRow}>
            <span style={{color: ACCENT, display: 'inline-flex'}}>
              <Icon icon={PenLineIcon} size="sm" color="inherit" />
            </span>
            <span style={{...styles.pipeText, fontWeight: 700}}>
              Reconciliation, redesigned
            </span>
            <span style={styles.pipeHash}>draft · 2 reviewers</span>
          </div>
          {(
            [
              {tag: 'New', text: 'Reconciliation workspace with confidence scores'},
              {tag: 'New', text: 'Bulk-accept every match above 95%'},
              {tag: 'Improved', text: 'Statement imports parse ~40% faster'},
              {tag: 'Fixed', text: 'Month-boundary transfers counted once'},
            ] as const
          ).map(item => (
            <div key={item.text} style={styles.pipeRow}>
              <span style={styles.pipeTagChip}>{item.tag}</span>
              <span style={styles.pipeText}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={styles.pipeWindow} aria-hidden="true">
      <div style={styles.mockChrome}>
        <span style={styles.mockDot} />
        <span style={styles.mockDot} />
        <span style={styles.mockDot} />
        <span style={styles.mockTitle}>publish · v2.14 → everywhere</span>
      </div>
      <div style={styles.pipeBody}>
        <div style={styles.pipeRow}>
          <span style={{color: ACCENT, display: 'inline-flex'}}>
            <Icon icon={MegaphoneIcon} size="sm" color="inherit" />
          </span>
          <span style={{...styles.pipeText, fontWeight: 700}}>
            v2.14 — Reconciliation, redesigned
          </span>
          <span style={styles.pipeTagChip}>live</span>
        </div>
        {(
          [
            {icon: RssIcon, text: 'changelog.xml refreshed', meta: '09:00:02'},
            {
              icon: MailCheckIcon,
              text: '18,402 subscriber emails queued',
              meta: '09:00:05',
            },
            {
              icon: CheckIcon,
              text: 'ledgerline.com/changelog updated',
              meta: '09:00:01',
            },
          ] as const
        ).map(row => (
          <div key={row.text} style={styles.pipeRow}>
            <span style={{color: ACCENT, display: 'inline-flex'}}>
              <Icon icon={row.icon} size="sm" color="inherit" />
            </span>
            <span style={styles.pipeText}>{row.text}</span>
            <span style={styles.pipeHash}>{row.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= PAGE =============

interface VisibleEntry {
  entry: Entry;
  items: readonly EntryItem[];
}

interface MonthGroup {
  month: string;
  entries: VisibleEntry[];
}

export default function ChangelogWhatsNewTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isTheaterStacked = wrapWidth > 0 && wrapWidth <= 1000;
  const isMid = wrapWidth > 0 && wrapWidth <= 900;
  const isCompactNav = wrapWidth > 0 && wrapWidth <= 720;
  const isPhone = wrapWidth > 0 && wrapWidth <= 560;
  const reduceMotion = usePrefersReducedMotion();

  const pageRef = useRef<HTMLDivElement | null>(null);
  const pageHeight = useElementHeight(pageRef);
  const navRef = useRef<HTMLElement | null>(null);
  const storyTallRef = useRef<HTMLDivElement | null>(null);
  const darkBandRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );

  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<ReadonlySet<TagId>>(
    () => new Set(),
  );
  const [showOlder, setShowOlder] = useState(false);
  const [isFeedCopied, setIsFeedCopied] = useState(false);
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const [parallax, setParallax] = useState({x: 0, y: 0});
  const [storyProgress, setStoryProgress] = useState(0);

  const [statsRef, statsInView] = useInView();

  // Display-type tier from the measured container (never <56px at wide).
  const titleSize =
    wrapWidth > 1000 ? 76 : wrapWidth > 720 ? 58 : wrapWidth > 560 ? 46 : 36;

  // Pinned story geometry, sized against the measured scroll container.
  const storyStageHeight =
    pageHeight > 0
      ? Math.max(380, Math.min(620, pageHeight - STORY_STICKY_TOP - 24))
      : 480;
  const storyTallHeight = Math.round(storyStageHeight * 2.8);
  const storyStep = storyProgress < 1 / 3 ? 0 : storyProgress < 2 / 3 ? 1 : 2;
  /** Static stacked sequence when motion is reduced or nothing measured. */
  const isStoryStatic = reduceMotion || pageHeight === 0;

  const allowParallax = !reduceMotion && !isCompactNav;

  // Reset the transient "Copied" label on the RSS chip.
  useEffect(() => {
    if (!isFeedCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsFeedCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [isFeedCopied]);

  // Close the compact-nav dropdown on Escape or outside pointerdown.
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
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

  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
    if (id === 'subscribe') {
      darkBandRef.current = node;
    }
  };

  /** Smooth-scroll the container to a section, under the sticky nav. */
  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    setActiveSection(id);
    const top =
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      NAV_ALLOWANCE;
    container.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  /** Step buttons on the story rail also drive the scroll position. */
  const jumpToStoryStep = (index: number) => {
    const container = pageRef.current;
    const tall = storyTallRef.current;
    if (container == null || tall == null) {
      return;
    }
    const offsetTop =
      tall.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    const span = tall.offsetHeight - storyStageHeight;
    const targets = [0.06, 0.5, 0.94] as const;
    container.scrollTo({
      top: offsetTop - STORY_STICKY_TOP + span * (targets[index] ?? 0.5),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  /**
   * One scroll handler drives nav condensation, the scroll-spy, and the
   * pinned-story progress (quantized so unchanged frames bail out).
   */
  const onPageScroll = () => {
    const container = pageRef.current;
    if (container == null) {
      return;
    }
    const scrolledNow = container.scrollTop > 24;
    setIsScrolled(previous =>
      previous === scrolledNow ? previous : scrolledNow,
    );
    const containerTop = container.getBoundingClientRect().top;
    let active: SectionId | null = null;
    for (const anchor of NAV_ANCHORS) {
      const section = sectionRefs.current[anchor.id];
      if (
        section != null &&
        section.getBoundingClientRect().top - containerTop <= SPY_OFFSET
      ) {
        active = anchor.id;
      }
    }
    setActiveSection(active);
    const tall = storyTallRef.current;
    if (tall != null && !isStoryStatic) {
      const rect = tall.getBoundingClientRect();
      const span = rect.height - storyStageHeight;
      if (span > 0) {
        const raw = (containerTop + STORY_STICKY_TOP - rect.top) / span;
        const quantized =
          Math.round(Math.min(1, Math.max(0, raw)) * 100) / 100;
        setStoryProgress(previous =>
          Math.abs(previous - quantized) < 0.01 ? previous : quantized,
        );
      }
    }
  };

  /** Hero parallax: quantized pointer position so most moves bail out. */
  const onHeroPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!allowParallax) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const x =
      Math.round(
        Math.max(
          -1,
          Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
        ) * 10,
      ) / 10;
    const y =
      Math.round(
        Math.max(
          -1,
          Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
        ) * 10,
      ) / 10;
    setParallax(previous =>
      previous.x === x && previous.y === y ? previous : {x, y},
    );
  };

  const onHeroPointerLeave = () => {
    setParallax(previous =>
      previous.x === 0 && previous.y === 0 ? previous : {x: 0, y: 0},
    );
  };

  /** Dark-band spotlight: CSS vars set directly, no re-render needed. */
  const onDarkPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion) {
      return;
    }
    const band = darkBandRef.current;
    if (band == null) {
      return;
    }
    const rect = band.getBoundingClientRect();
    band.style.setProperty('--mx', `${Math.round(event.clientX - rect.left)}px`);
    band.style.setProperty('--my', `${Math.round(event.clientY - rect.top)}px`);
  };

  const toggleTag = (tag: TagId, pressed: boolean) => {
    setActiveTags(previous => {
      const next = new Set(previous);
      if (pressed) {
        next.add(tag);
      } else {
        next.delete(tag);
      }
      return next;
    });
  };

  const copyFeedUrl = () => {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard !== undefined
      ) {
        void navigator.clipboard.writeText(BRAND.feedUrl);
      }
    } catch {
      // Clipboard access is best-effort; the toast still echoes the URL.
    }
    setIsFeedCopied(true);
    fireToast(`Feed URL copied — ${BRAND.feedUrl}`);
  };

  // ---- filtering + grouping ----

  const isFiltering = activeTags.size > 0;
  const pool = showOlder ? ENTRIES : ENTRIES.filter(entry => !entry.isOlder);
  const visibleEntries: VisibleEntry[] = pool
    .map(entry => ({
      entry,
      items: isFiltering
        ? entry.items.filter(item => activeTags.has(item.tag))
        : entry.items,
    }))
    .filter(candidate => candidate.items.length > 0);

  const groups: MonthGroup[] = [];
  for (const candidate of visibleEntries) {
    const last = groups[groups.length - 1];
    if (last !== undefined && last.month === candidate.entry.month) {
      last.entries.push(candidate);
    } else {
      groups.push({month: candidate.entry.month, entries: [candidate]});
    }
  }

  const matchedItemCount = visibleEntries.reduce(
    (sum, candidate) => sum + candidate.items.length,
    0,
  );

  // Stagger indices for the four older entries revealed by Load more.
  const olderIds = ENTRIES.filter(entry => entry.isOlder).map(
    entry => entry.id,
  );

  // ============= CHROME =============

  const anchorButtons = (compact: boolean) =>
    NAV_ANCHORS.map(anchor => (
      <button
        key={anchor.id}
        type="button"
        style={{
          ...(compact ? styles.menuLink : styles.navLink),
          ...(!compact && activeSection === anchor.id
            ? styles.navLinkActive
            : null),
        }}
        aria-current={activeSection === anchor.id ? 'true' : undefined}
        onClick={() => jumpToSection(anchor.id)}>
        {anchor.label}
      </button>
    ));

  const navbar = (
    <nav
      ref={navRef}
      style={{
        ...styles.navBar,
        ...(isScrolled ? styles.navBarScrolled : null),
      }}
      aria-label="Changelog navigation">
      <div
        style={{
          ...styles.navInner,
          ...(isScrolled ? styles.navInnerScrolled : null),
        }}>
        <span style={styles.brandTile} aria-hidden="true">
          L
        </span>
        <span style={styles.brandName}>{BRAND.name}</span>
        {!isPhone && <span style={styles.brandSuffix}>{BRAND.suffix}</span>}
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isCompactNav && (
          <HStack gap={1} vAlign="center">
            {anchorButtons(false)}
            <span className="cwn-sheen">
              <Button
                label="Open Ledgerline"
                variant="primary"
                onClick={() => fireToast('Navbar — Open Ledgerline clicked.')}
              />
            </span>
          </HStack>
        )}
        {isCompactNav && (
          <button
            type="button"
            style={styles.iconButton}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="md"
              color="inherit"
            />
          </button>
        )}
        {isCompactNav && isMenuOpen && (
          <div
            style={styles.menuPanel}
            role="menu"
            aria-label="Changelog sections">
            {anchorButtons(true)}
            <div style={{display: 'grid'}}>
              <Button
                label="Open Ledgerline"
                variant="primary"
                onClick={() => {
                  setIsMenuOpen(false);
                  fireToast('Menu — Open Ledgerline clicked.');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const rssChip = (
    <Button
      label={isFeedCopied ? 'Copied' : 'RSS'}
      variant="secondary"
      icon={
        <Icon
          icon={isFeedCopied ? CheckIcon : RssIcon}
          size="sm"
          color="inherit"
        />
      }
      onClick={copyFeedUrl}
    />
  );

  const filterBar = (
    <div
      style={styles.filterBar}
      role="group"
      aria-label="Filter updates by tag">
      <span style={styles.filterLabel}>Filter</span>
      {TAGS.map(tag => (
        <ToggleButton
          key={tag.id}
          label={`${tag.label} · ${TAG_COUNTS[tag.id]}`}
          size="sm"
          isPressed={activeTags.has(tag.id)}
          onPressedChange={pressed => toggleTag(tag.id, pressed)}
        />
      ))}
      {isFiltering && (
        <Button
          label="Clear"
          variant="ghost"
          size="sm"
          icon={<Icon icon={FilterXIcon} size="sm" color="inherit" />}
          onClick={() => setActiveTags(new Set())}
        />
      )}
      {isFiltering && visibleEntries.length > 0 && !isPhone && (
        <span style={styles.filterSummary}>
          Showing {matchedItemCount}{' '}
          {matchedItemCount === 1 ? 'update' : 'updates'} across{' '}
          {visibleEntries.length}{' '}
          {visibleEntries.length === 1 ? 'release' : 'releases'}
        </span>
      )}
    </div>
  );

  const heroBand = (
    <header
      style={styles.heroBand}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}>
      {/* Aurora field: accent-derived blobs drifting on long keyframes. */}
      <div
        style={{
          ...styles.auroraBlob,
          width: 520,
          height: 520,
          top: -180,
          left: '-8%',
          backgroundColor: `color-mix(in srgb, ${AURORA_A} 45%, transparent)`,
          opacity: 0.5,
          animation: reduceMotion
            ? undefined
            : 'cwn-drift-a 38s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          ...styles.auroraBlob,
          width: 460,
          height: 460,
          top: -60,
          right: '-12%',
          backgroundColor: `color-mix(in srgb, ${AURORA_C} 42%, transparent)`,
          opacity: 0.45,
          animation: reduceMotion
            ? undefined
            : 'cwn-drift-b 44s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          ...styles.auroraBlob,
          width: 560,
          height: 560,
          bottom: -240,
          left: '28%',
          backgroundColor: `color-mix(in srgb, ${AURORA_B} 38%, transparent)`,
          opacity: 0.4,
          animation: reduceMotion
            ? undefined
            : 'cwn-drift-a 52s ease-in-out infinite alternate-reverse',
        }}
      />
      <div style={styles.grainOverlay} />
      <div
        style={{
          ...styles.heroInner,
          ...(isPhone ? styles.heroInnerCompact : null),
        }}>
        <div
          style={
            isTheaterStacked ? styles.heroGridStacked : styles.heroGrid
          }>
          <div style={styles.heroCopy}>
            <span style={styles.eyebrowChip}>
              Ledgerline · Product updates
            </span>
            <h1
              style={{
                ...styles.pageTitle,
                fontSize: titleSize,
                ...(isPhone ? {lineHeight: 1.08} : null),
              }}>
              What&rsquo;s new in{' '}
              <span style={styles.titleInk}>Ledgerline</span>
            </h1>
            <p style={styles.subcopy}>
              Every release, straight from the team that shipped it — new
              features, quality-of-life fixes, and the occasional breaking
              change with a migration path. Published every Thursday.
            </p>
            <div ref={statsRef} style={styles.statsRow}>
              {HEADER_STATS.map(stat => (
                <CountUpStat
                  key={stat.id}
                  stat={stat}
                  isActive={statsInView}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
            <EmailCapture
              inputLabel="Email for release notes"
              buttonLabel="Subscribe"
              confirmedNote="Release notes will land at {email} every Thursday."
              isStacked={isPhone}
              onSubscribed={email =>
                fireToast(`Header subscribe — signed up ${email}.`)
              }
              trailing={rssChip}
            />
          </div>
          <div
            style={
              isTheaterStacked
                ? {padding: isPhone ? '20px 4px 28px' : '24px 28px 32px'}
                : undefined
            }>
            <HeroTheater
              reduceMotion={reduceMotion}
              isPhone={isPhone}
              allowParallax={allowParallax}
              parallaxX={parallax.x}
              parallaxY={parallax.y}
            />
          </div>
        </div>
      </div>
    </header>
  );

  // ============= ENTRIES =============

  const renderEntry = (candidate: VisibleEntry, indexInGroup: number) => {
    const {entry, items} = candidate;
    const olderIndex = olderIds.indexOf(entry.id);
    const delayMs =
      showOlder && olderIndex >= 0 ? olderIndex * 90 : indexInGroup * 70;

    const rail = (
      <div
        style={{
          ...styles.entryRail,
          ...(isMid ? styles.entryRailInline : null),
        }}>
        <span style={styles.versionChip}>{entry.version}</span>
        <Text type="supporting" color="secondary">
          {entry.dateLabel}
        </Text>
        {entry.isBreaking === true && (
          <Badge
            variant="warning"
            label="Breaking"
            icon={<Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />}
          />
        )}
      </div>
    );

    const body = (
      <div className="cwn-card" style={styles.entryBody}>
        <h3 style={styles.entryTitle}>{entry.title}</h3>
        <ul style={styles.itemList}>
          {items.map(item => (
            <li key={item.id} style={styles.itemRow}>
              <span style={styles.itemBadge}>
                <Badge
                  variant={TAG_META[item.tag].badge}
                  label={TAG_META[item.tag].label}
                />
              </span>
              <span style={styles.itemText}>{item.text}</span>
            </li>
          ))}
        </ul>
        {entry.media === 'reconciliation' && (
          <figure style={styles.mediaFigure}>
            <ReconciliationMock />
            <figcaption style={styles.mediaCaption}>
              {entry.mediaCaption}
            </figcaption>
          </figure>
        )}
        {entry.media === 'editor-slider' && (
          <figure style={styles.mediaFigure}>
            <BeforeAfterSlider reduceMotion={reduceMotion} isPhone={isPhone} />
            <figcaption style={styles.mediaCaption}>
              {entry.mediaCaption}
            </figcaption>
          </figure>
        )}
        {entry.isBreaking === true && entry.breakingNote !== undefined && (
          <div style={styles.breakingCallout} role="note">
            <span style={styles.breakingHead}>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
              Breaking change — action required
            </span>
            <p style={styles.breakingText}>{entry.breakingNote}</p>
            {entry.breakingSnippet !== undefined && (
              <CodeBlock
                code={entry.breakingSnippet}
                language="diff"
                title={entry.breakingSnippetTitle}
                hasCopyButton
                onCopy={() => fireToast('Migration snippet copied.')}
                width="100%"
                size="sm"
              />
            )}
          </div>
        )}
      </div>
    );

    return (
      <Reveal key={entry.id} delayMs={delayMs} reduceMotion={reduceMotion}>
        <article
          ref={
            entry.isBreaking === true ? registerSection('breaking') : undefined
          }
          aria-label={`${entry.version} — ${entry.title}`}
          style={isMid ? styles.entryStacked : styles.entryGrid}>
          {rail}
          {body}
        </article>
      </Reveal>
    );
  };

  const entriesColumn = (
    <div
      ref={registerSection('latest')}
      style={{
        ...styles.column,
        ...(isCompactNav ? styles.columnCompact : null),
      }}
      aria-label="Release entries">
      {isFiltering && visibleEntries.length > 0 && isPhone && (
        <Text type="supporting" color="secondary">
          Showing {matchedItemCount}{' '}
          {matchedItemCount === 1 ? 'update' : 'updates'} across{' '}
          {visibleEntries.length}{' '}
          {visibleEntries.length === 1 ? 'release' : 'releases'}
        </Text>
      )}
      {groups.map(group => (
        <section
          key={group.month}
          style={styles.monthGroup}
          aria-label={group.month}>
          <div style={styles.monthHeader}>
            <span style={styles.monthLabel}>{group.month}</span>
            <span style={styles.monthRule} aria-hidden="true" />
            <Badge
              variant="neutral"
              label={`${group.entries.length} ${
                group.entries.length === 1 ? 'release' : 'releases'
              }`}
            />
          </div>
          {group.entries.map(renderEntry)}
        </section>
      ))}
      {visibleEntries.length === 0 && (
        <EmptyState
          title="No updates match those filters"
          description="Try widening the tag selection — every release carries at least one Improved or Fixed item."
          icon={<Icon icon={FilterXIcon} size="lg" color="secondary" />}
          actions={
            <Button
              label="Clear filters"
              variant="secondary"
              onClick={() => setActiveTags(new Set())}
            />
          }
        />
      )}
      <div style={styles.loadMoreWrap}>
        {!showOlder ? (
          <Button
            label="Load 4 older releases"
            variant="secondary"
            icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
            onClick={() => setShowOlder(true)}
          />
        ) : (
          <Text type="supporting" color="secondary">
            That&rsquo;s everything since April 2026 — older notes live in the
            docs archive.
          </Text>
        )}
      </div>
    </div>
  );

  // ============= PINNED STORY =============

  const storyStepContent = (index: number, isActive: boolean) => {
    const step = STORY_STEPS[index];
    return (
      <>
        <span
          style={{
            ...styles.storyStepNum,
            ...(isActive ? styles.storyStepNumActive : null),
          }}
          aria-hidden="true">
          {step.num}
        </span>
        <span style={{minWidth: 0}}>
          <span style={{...styles.storyStepTitle, display: 'block'}}>
            {step.title}
          </span>
          <span style={{...styles.storyStepCopy, display: 'block'}}>
            {step.copy}
          </span>
        </span>
      </>
    );
  };

  const storyRailStep = (index: number, isActive: boolean) => (
    <button
      key={STORY_STEPS[index].id}
      type="button"
      style={styles.storyStep}
      aria-current={isActive ? 'true' : undefined}
      onClick={() => jumpToStoryStep(index)}>
      {storyStepContent(index, isActive)}
    </button>
  );

  const storyHeading = (
    <div>
      <span style={styles.eyebrowChip}>Behind the log</span>
      <h2
        style={{
          ...styles.storyHeading,
          ...(isPhone ? styles.storyHeadingCompact : null),
          marginTop: 14,
        }}>
        How a release reaches this page
      </h2>
    </div>
  );

  const storySection = isStoryStatic ? (
    // Reduced motion (or unmeasurable container): static stacked scene.
    <section style={styles.storyBand} aria-label="How a release ships">
      <div style={styles.storyStaticInner}>
        {storyHeading}
        {STORY_STEPS.map((step, index) => (
          <div
            key={step.id}
            style={isCompactNav ? styles.storyGridStacked : styles.storyGrid}>
            <div style={{...styles.storyStep, cursor: 'default'}}>
              {storyStepContent(index, true)}
            </div>
            <PipelineMock step={index} />
          </div>
        ))}
      </div>
    </section>
  ) : (
    <section
      ref={storyTallRef}
      style={{...styles.storyBand, height: storyTallHeight}}
      aria-label="How a release ships">
      <div style={{...styles.storyStage, height: storyStageHeight}}>
        <div style={styles.storyInner}>
          {storyHeading}
          <div
            style={isCompactNav ? styles.storyGridStacked : styles.storyGrid}>
            <div style={styles.storyRail}>
              {isCompactNav ? (
                // Condensed pill rail: all three steps stay clickable.
                <div style={styles.storyStepRowCompact}>
                  {STORY_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      style={{
                        ...styles.storyStepCompact,
                        ...(index === storyStep
                          ? styles.storyStepCompactActive
                          : null),
                      }}
                      aria-current={index === storyStep ? 'true' : undefined}
                      onClick={() => jumpToStoryStep(index)}>
                      <span aria-hidden="true">{step.num}</span>
                      {step.title}
                    </button>
                  ))}
                </div>
              ) : (
                STORY_STEPS.map((step, index) =>
                  storyRailStep(index, index === storyStep),
                )
              )}
              <div
                style={styles.storyProgressTrack}
                role="progressbar"
                aria-label="Release pipeline progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(storyProgress * 100)}>
                <div
                  style={{
                    ...styles.storyProgressFill,
                    transform: `scaleX(${storyProgress.toFixed(2)})`,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                ...styles.storyViewport,
                minHeight: isCompactNav ? 260 : 320,
              }}>
              {STORY_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    ...styles.storyState,
                    opacity: index === storyStep ? 1 : 0,
                    transform:
                      index === storyStep
                        ? 'none'
                        : index < storyStep
                          ? 'translateY(-18px) scale(0.985)'
                          : 'translateY(18px) scale(0.985)',
                    pointerEvents: index === storyStep ? 'auto' : 'none',
                  }}>
                  <PipelineMock step={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ============= DARK SUBSCRIBE BAND + FOOTER =============

  const darkBand = (
    <section
      ref={registerSection('subscribe')}
      style={styles.darkBand}
      onPointerMove={onDarkPointerMove}
      aria-label="Subscribe to release notes">
      {/* Vibrant glows: the aurora system, restated on ink. */}
      <div
        style={{
          ...styles.darkGlow,
          width: 560,
          height: 560,
          top: -220,
          right: '-6%',
          backgroundColor: `color-mix(in srgb, ${ACCENT} 34%, transparent)`,
          opacity: 0.55,
          animation: reduceMotion
            ? undefined
            : 'cwn-drift-b 40s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          ...styles.darkGlow,
          width: 480,
          height: 480,
          bottom: -220,
          left: '-8%',
          backgroundColor: `color-mix(in srgb, ${AURORA_A} 30%, transparent)`,
          opacity: 0.5,
          animation: reduceMotion
            ? undefined
            : 'cwn-drift-a 48s ease-in-out infinite alternate-reverse',
        }}
      />
      {!reduceMotion && <div style={styles.darkSpotlight} />}
      <div style={styles.grainOverlay} />
      <div
        style={{
          ...(isMid ? styles.darkInnerStacked : styles.darkInner),
          position: 'relative',
          zIndex: 1,
        }}>
        <div>
          <span style={styles.darkEyebrow}>Subscribe</span>
          <h2
            style={{
              ...styles.darkTitle,
              ...(isPhone ? styles.darkTitleCompact : null),
              marginTop: 12,
            }}>
            Never miss a release
          </h2>
          <p style={{...styles.darkCopy, marginTop: 16}}>
            One email per release, every Thursday. No product marketing, no
            digest padding — just the notes on this page.
          </p>
        </div>
        <div style={styles.glassCard}>
          <EmailCapture
            inputLabel="Email for release notes"
            buttonLabel="Subscribe"
            confirmedNote="Confirmation sent to {email} — see you Thursday."
            isStacked={isPhone || !isMid}
            tone="dark"
            onSubscribed={email =>
              fireToast(`Footer subscribe — signed up ${email}.`)
            }
          />
          <div style={styles.glassMetaRow}>
            {(
              [
                'One email per release',
                '18,402 subscribers',
                'Unsubscribe anytime',
              ] as const
            ).map(item => (
              <span key={item} style={styles.glassMeta}>
                <span
                  style={{
                    color: `color-mix(in srgb, ${ACCENT} 85%, white)`,
                    display: 'inline-flex',
                  }}>
                  <Icon icon={CheckIcon} size="sm" color="inherit" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const footer = (
    <footer style={styles.footer} aria-label="Footer">
      <div style={styles.footerInner}>
        <div
          style={{
            ...styles.footerCols,
            ...(isPhone ? {flexDirection: 'column' as const} : null),
          }}>
          {FOOTER_COLUMNS.map(column => (
            <div key={column.heading} style={styles.footerCol}>
              <span style={styles.footerHeading}>{column.heading}</span>
              {column.links.map(link => (
                <button
                  key={link}
                  type="button"
                  style={styles.footerLink}
                  onClick={() => fireToast(`Footer — ${link} clicked.`)}>
                  {link}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={styles.footerMeta}>
          <Text type="supporting" color="secondary">
            © 2026 Ledgerline, Inc.
          </Text>
          <HStack gap={1} vAlign="center">
            <StatusDot variant="success" label="All systems operational" />
            <Text type="supporting" color="secondary">
              All systems operational
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            Current release: v2.14
          </Text>
        </div>
      </div>
    </footer>
  );

  // ============= FRAME =============

  return (
    <>
      {/* Keyframes + hover tiers (transform/opacity only; hover motion is
          wrapped in a no-preference media query so reduced motion stays
          static, and box-shadow retiers apply everywhere). */}
      <style>{`
@keyframes cwn-drift-a { from { transform: translate3d(-4%, -6%, 0) scale(1); } to { transform: translate3d(7%, 9%, 0) scale(1.16); } }
@keyframes cwn-drift-b { from { transform: translate3d(5%, 4%, 0) scale(1.08); } to { transform: translate3d(-8%, -6%, 0) scale(0.94); } }
@keyframes cwn-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.cwn-card { box-shadow: ${SHADOW_RAISED}; transition: transform 240ms ${EASE_OUT}, box-shadow 240ms ${EASE_OUT}; }
.cwn-card:hover { box-shadow: 0 0 0 1px ${ACCENT_BORDER}, ${SHADOW_FLOATING}; }
.cwn-sheen { position: relative; display: inline-flex; border-radius: 10px; overflow: hidden; isolation: isolate; transition: transform 180ms ${EASE_OUT}; }
.cwn-sheen::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(115deg, transparent 32%, color-mix(in srgb, white 34%, transparent) 50%, transparent 68%); transform: translateX(-160%); }
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .cwn-card:hover { transform: translateY(-3px); }
  .cwn-sheen:hover { transform: translateY(-1px); }
  .cwn-sheen:active { transform: scale(0.98); }
  .cwn-sheen:hover::after { transform: translateX(160%); transition: transform 700ms ${EASE_OUT}; }
}
`}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0} role="main" label="Ledgerline changelog">
            {/* Measured wrapper: element-width breakpoints (see Responsive
                contract) — the inline demo stage never fires viewport
                media queries. */}
            <div ref={wrapRef} style={styles.measure}>
              <div ref={pageRef} style={styles.page} onScroll={onPageScroll}>
                {navbar}
                {heroBand}
                {/* Floating toolbar deliberately crosses the band edge. */}
                <div style={styles.filterBarWrap}>{filterBar}</div>
                {entriesColumn}
                {storySection}
                {darkBand}
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
