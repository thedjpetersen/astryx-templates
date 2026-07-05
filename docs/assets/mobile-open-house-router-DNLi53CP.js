var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Keyline's Saturday open-house day
 *   for Sat, Jul 11 (a const string; no Date.now(), no Math.random(), no
 *   network media). All times are integer minutes since midnight:
 *   DEPART_HOME_MIN 600 (10:00 AM), DWELL_MIN 20. Six route stops s1–s6
 *   with hard viewing windows (s4 carries the long-address ellipsis
 *   stress: '1420 Dunmore Avenue Northeast, Unit 12'), a symmetric drive
 *   matrix (H–s1 12 … s5–s6 14), and three Saved listings: s7 '62 Garnet
 *   Way' (planable, lands green), s8 '17 Harrow Ct' ('Open Sunday' —
 *   disabled with 'No Sat window' caption), s9 '530 Inlet Loop' (planable
 *   but arrives 115 min after close — the extreme-red append). BASELINE
 *   cross-check (commented at the fixture): 106 min driving + 108 min
 *   viewing + 0 waiting = 214 min = 10:00 AM → 1:34 PM, statuses
 *   G/G/G/G/A(8-min visit)/G → '5/6 fit'.
 * @output Keyline — Saturday Open-House Router: a 390px MOBILE day router.
 *   52px navBar (28px Keyline key-into-pin mark · 'Sat, Jul 11' that swaps
 *   to the collapsed EtaStrip 'Done 1:34 PM · 5/6 fit' once the large
 *   title scrolls under · 44×44 Refresh) over a Day tab: 52px largeTitle
 *   'Saturday plan', daySummaryCard (Leave/Done line, driving·viewing·
 *   waiting cross-check line, Reorder stops + Add delay +15m buttons),
 *   then a ROUTE rail — per stop a '64px 1fr' grid with a 48px id-derived
 *   gradient house glyph beside a ≥108px stopCard (address · arrive/visit
 *   line · 120×20 FeasibilityChip + status pill + 44×44 ellipsis), the
 *   12px card gap replaced by a 4px connector bar (height = driveMin×2
 *   clamped 24–72) colored by the DOWNSTREAM stop's status with an
 *   'N min drive' label. Homes tab: six 72px media rows sorted
 *   green-by-slack → amber → red/skipped, pushing a detail screen
 *   ('‹ Homes' back per the push contract). Saved tab: three 72px rows
 *   with 36px 'Plan visit' buttons. Signature move: EVERY mutation
 *   (long-press drag on a stopCard, ReorderSheet chevrons/drag,
 *   StopActionSheet move/skip, banner Skip it, Plan visit, Add delay)
 *   re-runs the pure computePlan — arrival ticks slide across the chips,
 *   connectors recolor, the summary card, EtaStrip, and Day badge
 *   re-derive, and the rippleBanner names exactly the stop that just went
 *   red with a one-tap Skip it (execute + Undo, never confirm).
 * @position Page template; emitted by \`astryx template mobile-open-house-router\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, reorder sheet, action sheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While an
 *   overlay is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close; the toastDock is sticky-in-flow (bottom 76,
 *   above the 64px tabBar + 12px) EXCEPT during scroll-lock, when it
 *   renders absolute so it anchors to the visible screen. The rippleBanner
 *   is an in-flow sticky strip (top 52, z15) directly under the navBar —
 *   never shell-absolute. The stage clips to --radius-container; shell
 *   paints full-bleed square. navBar hairline + blur are ALWAYS ON (this
 *   template does not wire scroll-under hairline state; noted per
 *   contract — the large-title collapse IS wired, via an
 *   IntersectionObserver sentinel on the largeTitle row).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Keyline green — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule). The
 *   sanctioned non-brand literals: the amber and red status pairs
 *   (connectors, ticks, pills — ≥3:1 vs their card/body surfaces), the
 *   rippleBanner surface/text pairs (≥4.5:1 on their own wash), the
 *   FeasibilityChip rest-track pair (a MEANINGFUL rest fill, so it gets
 *   an explicit ≥3:1 pair instead of a muted token, per the batch-2
 *   amendment), and the scrim. Contrast math at each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); largeTitle row 52px
 *   (28px/700 at the 16px gutter, scrolls away); tabBar 64px sticky
 *   bottom z20 (3 tabs, 24px icons over 11px/500 labels, 4px gap, brand
 *   badge pill 16px min / 10px/600 at top:-4 right:-8); rows 44px utility
 *   / 60px reorder / 72px media (48px thumb, 12px radius); stopCard
 *   minHeight 108 (12px padding) on a '64px 1fr' rail grid; connectors
 *   4px wide, height driveMin×2 clamp 24–72 (12→24, 18→36, 15→30, 22→44,
 *   25→50, 14→28); sectionHeader 13px/600 uppercase 0.06em at 32px (16
 *   gutter + 16 card pad), 20px top / 8px bottom; buttons 48 primary /
 *   36 secondary / 44×44 icon per the house law; sheet detents 55% /
 *   calc(100% − 56px), 24px grabber zone with 36×5 pill, 52px sheet
 *   header. TYPE (Figtree via --font-family-body): 28/700 large title ·
 *   22/700 detail price · 17/600 nav+sheet titles · 16/400–500 row
 *   primary · 13/400–500 secondary+meta · 11/500 overlines+labels;
 *   nothing under 11px; fontVariantNumeric tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row target; every gesture has a visible button path
 *   (long-press drag → ReorderSheet chevrons + action-sheet Move
 *   earlier/later; sheet drag → grabber click + X; row swipe: none used).
 *
 * Responsive contract:
 * - Fluid 320–430px: stopCard grid stays '64px 1fr'; FeasibilityChip is
 *   fixed 120px (at 320: 16 gutter + 64 rail + 12 pad + 120 chip + ≤56
 *   pill + 16 ≤ 320 — the status pill gets maxWidth 56 + ellipsis);
 *   addresses ellipsize single-line; daySummaryCard row2 wraps (flexWrap)
 *   below ~360px; navBar center maxWidth 200 ellipsized; Homes 72px rows
 *   keep the 48px thumb, trailing chip shrinks (minWidth 0). Connectors
 *   and the 64px rail column never scale. No width:390 literals.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (CONTAINER width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the route rail is deliberately
 *   phone geometry.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  CircleSlashIcon,
  GripVerticalIcon,
  HomeIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  RouteIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. Surfaces referenced: light card/body ≈ #FFFFFF (L 1.0),
// dark card ≈ #1C1C1E (L ≈ 0.011).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Keyline green). #0E7C66 on white ≈ 5.1:1
// (passes 4.5:1 as text and 3:1 as a fill boundary); #4FBFA5 on the dark
// card ≈ 7.6:1. GREEN status (connectors, ticks, pills) shares this pair
// per spec.
const BRAND_ACCENT = 'light-dark(#0E7C66, #4FBFA5)';
// Text over a BRAND_ACCENT fill (tab badge). Light: #FFFFFF on #0E7C66 ≈
// 5.1:1. Dark: white on #4FBFA5 fails (~2.3:1), so the dark side flips to
// near-black green — #062E26 on #4FBFA5 ≈ 6.5:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #062E26)';
// 12% brand wash for the active-tier pill / glyph accents; text never
// sits on it alone (it tints the card, delta < 4% luminance).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// AMBER status (tight visit). #B45309 on white ≈ 5.0:1; #FBBF24 on the
// dark card ≈ 10.3:1 — both clear 3:1 as connector/tick fills and 4.5:1
// as 11px pill text.
const STATUS_AMBER = 'light-dark(#B45309, #FBBF24)';
// RED status (arrives after close). #B3261E on white ≈ 6.5:1; #F2B8B5 on
// the dark card ≈ 10.1:1.
const STATUS_RED = 'light-dark(#B3261E, #F2B8B5)';
// rippleBanner surface + text (spec-fixed pairs). Text-on-wash math:
// #B3261E (L ≈ 0.111) on #FDECEA (L ≈ 0.870) ≈ 5.7:1; #F2B8B5 (L ≈
// 0.566) on #3A1F1C (L ≈ 0.020) ≈ 8.8:1 — both ≥ 4.5:1.
const BANNER_BG = 'light-dark(#FDECEA, #3A1F1C)';
const BANNER_TEXT = 'light-dark(#B3261E, #F2B8B5)';
// FeasibilityChip REST TRACK — the full open-house window is MEANINGFUL
// rest state (batch-2 amendment: no muted token; explicit pair ≥3:1 vs
// the ACTUAL card surface). #6F817B (L ≈ 0.205) on white ≈ 4.1:1;
// #7F8F89 (L ≈ 0.259) on the dark card ≈ 5.1:1.
const CHIP_TRACK_REST = 'light-dark(#6F817B, #7F8F89)';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// navBar/tabBar blur surface.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// Id-derived house-glyph gradients — hue = 152 + index·18, two stops
// hsl(H 45% 38%) → hsl(H 45% 55%), hard-coded per id so deterministic.
// The glyph is decorative (aria-hidden); no text sits on it.
const GLYPH_GRADIENTS: Record<string, string> = {
  s1: 'linear-gradient(135deg, hsl(152 45% 38%), hsl(152 45% 55%))',
  s2: 'linear-gradient(135deg, hsl(170 45% 38%), hsl(170 45% 55%))',
  s3: 'linear-gradient(135deg, hsl(188 45% 38%), hsl(188 45% 55%))',
  s4: 'linear-gradient(135deg, hsl(206 45% 38%), hsl(206 45% 55%))',
  s5: 'linear-gradient(135deg, hsl(224 45% 38%), hsl(224 45% 55%))',
  s6: 'linear-gradient(135deg, hsl(242 45% 38%), hsl(242 45% 55%))',
  s7: 'linear-gradient(135deg, hsl(260 45% 38%), hsl(260 45% 55%))',
  s8: 'linear-gradient(135deg, hsl(278 45% 38%), hsl(278 45% 55%))',
  s9: 'linear-gradient(135deg, hsl(296 45% 38%), hsl(296 45% 55%))',
};

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, transform/opacity
// transitions, visually-hidden, and the prefers-reduced-motion collapse.
// ---------------------------------------------------------------------------

const KEYLINE_CSS = \`
.khr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.khr-btn:disabled { cursor: default; }
.khr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.khr-anim { transition: transform 200ms ease, opacity 200ms ease; }
.khr-fade { transition: opacity 200ms ease; }
.khr-tick { transition: left 200ms ease, background 200ms ease; }
@keyframes khr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.khr-sheet-in { animation: khr-sheet-in 200ms ease; }
.khr-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .khr-anim, .khr-fade, .khr-tick { transition: none; }
  .khr-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, sheet, sheetGrabber, listCard, rowDivider,
// sectionHeader, toastDock, emptyState.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // cannot tell the stages apart).
  wrap: {width: '100%'},
  // THE SHELL CONTRACT (mobile foundations, verbatim).
  shell: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100dvh',
    background: 'var(--color-background-body)',
    overflowX: 'clip',
    fontFamily: 'var(--font-family-body)',
    color: 'var(--color-text-primary)',
  },
  // Scroll lock while an overlay is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align to the 16px gutter; hairline + blur always on.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navCenter: {
    maxWidth: 200,
    minWidth: 0,
    textAlign: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EtaStrip — the collapsed navBar center; same computePlan output as
  // every other surface.
  etaStrip: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Back button — 44×44 chevron + previous screen title, 13/500 secondary
  // ellipsized at 96px, per the push contract.
  backBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 4,
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // LARGE TITLE row — 52px, 28/700 at the 16px gutter; scrolls away while
  // navBar stays sticky (IntersectionObserver sentinel drives the swap).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // RIPPLE BANNER — in-flow sticky strip under the navBar (top 52, z15);
  // NEVER shell-absolute. Renders only while ≥1 stop is red.
  rippleBanner: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 4,
    paddingInline: 16,
    background: BANNER_BG,
    color: BANNER_TEXT,
    borderBottom: '1px solid var(--color-border)',
  },
  rippleText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  rippleSkipBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: \`1px solid \${BANNER_TEXT}\`,
    color: BANNER_TEXT,
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // daySummaryCard — 16px padding, three rows.
  daySummaryCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  summaryLine1: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Row 2 wraps to two lines below ~360px via flexWrap.
  summaryLine2: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  summaryBtnRow: {display: 'flex', gap: 8, marginTop: 4},
  // 36px secondary button (44px hit comes from the 8px row breathing room
  // around it inside the 16px-padded card).
  secondaryBtn: {
    height: 36,
    paddingInline: 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  secondaryBtnDisabled: {opacity: 0.4},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // ROUTE RAIL — full-gutter column of '64px 1fr' rows.
  routeRail: {display: 'flex', flexDirection: 'column', paddingInline: 16},
  railRow: {display: 'grid', gridTemplateColumns: '64px 1fr', alignItems: 'stretch'},
  railNodeCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Origin marker — Home dot + 'Leave 10:00 AM'.
  originDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  originLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 48px house glyph node — 12px squircle, id-derived gradient, decorative.
  glyphNode: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  // Connector block — replaces the 12px card gap; 4px rounded bar centered
  // in the rail column, height driveMin×2 clamp 24–72, colored by the
  // DOWNSTREAM stop's status; 11/500 drive label beside it.
  connectorBar: {width: 4, borderRadius: 999, marginInline: 'auto'},
  connectorLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // stopCard — listCard surface, minHeight 108, 12px padding. The card is
  // relative; the primary push button fills it and the 44×44 ellipsis
  // overlays top-right (siblings, never nested).
  stopCard: {
    position: 'relative',
    minHeight: 108,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  stopCardLifted: {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 24px var(--color-shadow)',
    opacity: 0.92,
    zIndex: 5,
  },
  stopPrimary: {
    width: '100%',
    minHeight: 108,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
    padding: 12,
    paddingRight: 52,
    borderRadius: 'var(--radius-element, 12px)',
    // touch-action pan-y: vertical page scroll stays native until the
    // 450ms long-press lifts the card and captures the pointer.
    touchAction: 'pan-y',
  },
  stopAddress: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stopMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stopLine3: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 'auto',
  },
  ellipsisBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // FeasibilityChip — 120×20 bar; label under it.
  chipWrap: {display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0},
  chipBar: {position: 'relative', width: 120, height: 20},
  chipBarMini: {position: 'relative', width: 90, height: 14},
  chipTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 6,
    marginTop: -3,
    borderRadius: 6,
    background: CHIP_TRACK_REST,
  },
  chipFill: {
    position: 'absolute',
    top: '50%',
    height: 6,
    marginTop: -3,
    borderRadius: 6,
    background: BRAND_ACCENT,
  },
  chipTick: {
    position: 'absolute',
    top: '50%',
    width: 2,
    height: 14,
    marginTop: -7,
    borderRadius: 2,
    boxShadow: '0 0 0 2px var(--color-background-card)',
  },
  chipTickMini: {height: 10, marginTop: -5},
  chipLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Status pill — 999 radius, 11/600 status text on a 14% status tint
  // (tint shifts the white/dark card < 4% luminance; text pairs pass at
  // ≥5.0:1 light / ≥10:1 dark, math at the color declarations).
  statusPill: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    maxWidth: 56,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // 72px media row (Homes / Saved) — 48px thumb, two-line stack, trailing.
  mediaRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 12,
  },
  rowText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  savedTrailing: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  savedCaption: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // Homes detail.
  detailHero: {
    height: 140,
    marginInline: 16,
    borderRadius: 'var(--radius-element, 12px)',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
  },
  detailPrice: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  factRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  factLabel: {fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0},
  factValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  factDividerFull: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  detailActionWrap: {marginInline: 16, marginTop: 12, display: 'flex', gap: 8},
  // EMPTY STATE — per the emptyAndSkeleton contract.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
    lineHeight: '18px',
  },
  // SKELETONS — same geometry as the rows they impersonate; deterministic
  // staggered widths (60/45/70 primary, 40/55/30 secondary); NO shimmer
  // (static muted blocks encode 'loading' and survive reduced motion).
  skelBlock: {background: 'var(--color-background-muted)', borderRadius: 6},
  skelThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  // TAB BAR — exactly 64px; 3 tabs flex:1; brand badge pill on Day.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 64,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow anchor (height 0) pinning the toast 76px
  // above the viewport bottom mid-scroll (shell-absolute would pin to the
  // DOCUMENT bottom on tall views — the batch-2 amendment). During
  // scroll-lock the dock flips to absolute so it anchors to the locked
  // screen. Always mounted: it is the ONE polite live region.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    height: 48,
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'center',
    flexShrink: 0,
  },
  // SHEET + ACTION SHEET.
  sheetScrim: {position: 'absolute', inset: 0, background: SCRIM, zIndex: 40},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  sheetMedium: {height: '55%'},
  sheetLarge: {height: 'calc(100% - 56px)'},
  grabberZone: {
    height: 24,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    flexShrink: 0,
  },
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
    flexShrink: 0,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, overflowY: 'auto', paddingBottom: 8},
  sheetFooter: {padding: 16, flexShrink: 0, borderTop: '1px solid var(--color-border)'},
  primaryBtn: {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
  },
  // Reorder rows — 60px: grip 44×44, text + mini chip, chevron pair.
  reorderRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
  },
  gripBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    touchAction: 'none',
    flexShrink: 0,
  },
  reorderText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4},
  chevGroup: {display: 'flex', gap: 8, flexShrink: 0},
  chevBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  chevBtnDisabled: {opacity: 0.35},
  reorderDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 64},
  // ACTION SHEET — leading-icons variant; two stacked cards 8px apart.
  actionSheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  asCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  asHeader: {
    padding: '14px 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  asRow: {
    width: '100%',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 17,
    fontWeight: 500,
  },
  asRowDisabled: {opacity: 0.4},
  asDivider: {height: 1, background: 'var(--color-border)'},
  asCancelRow: {
    width: '100%',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — all times are integer minutes since midnight. Deterministic by
// law: no Date.now(), no Math.random(); the date is a const string.
// ---------------------------------------------------------------------------

type TabId = 'day' | 'homes' | 'saved';
type StopStatus = 'green' | 'amber' | 'red';

const DATE_LABEL = 'Sat, Jul 11';
const DEPART_HOME_MIN = 600; // 10:00 AM
const DWELL_MIN = 20;

interface Listing {
  id: string;
  address: string;
  openMin: number;
  closeMin: number;
  price: string;
  specs: string;
  priority: number;
  /** false = no Saturday window (s8 'Open Sunday' — Plan visit disabled). */
  saturday: boolean;
}

// s4's 40-char address is the ellipsis stress (stopCard, Homes row,
// action-sheet header, detail title). s7/s9 are the Saved appends; s9 is
// the extreme-red append (+115 min after close from the baseline route).
const LISTINGS: Record<string, Listing> = {
  s1: {id: 's1', address: '18 Alder Ct', openMin: 600, closeMin: 660, price: '$685,000', specs: '3bd/2ba · 1,540 sqft', priority: 2, saturday: true},
  s2: {id: 's2', address: '204 Birchwood Ln', openMin: 630, closeMin: 720, price: '$712,000', specs: '4bd/2.5ba · 1,980 sqft', priority: 1, saturday: true},
  s3: {id: 's3', address: '77 Cormorant Dr', openMin: 660, closeMin: 750, price: '$649,000', specs: '3bd/1.5ba · 1,410 sqft', priority: 4, saturday: true},
  s4: {id: 's4', address: '1420 Dunmore Avenue Northeast, Unit 12', openMin: 720, closeMin: 810, price: '$598,000', specs: '2bd/2ba · 1,160 sqft', priority: 3, saturday: true},
  s5: {id: 's5', address: '9 Ellery Pl', openMin: 720, closeMin: 780, price: '$735,000', specs: '4bd/3ba · 2,140 sqft', priority: 6, saturday: true},
  s6: {id: 's6', address: '351 Foxtail Rd', openMin: 750, closeMin: 825, price: '$669,000', specs: '3bd/2ba · 1,620 sqft', priority: 5, saturday: true},
  s7: {id: 's7', address: '62 Garnet Way', openMin: 840, closeMin: 930, price: '$590,000', specs: '2bd/1ba · 980 sqft', priority: 7, saturday: true},
  s8: {id: 's8', address: '17 Harrow Ct', openMin: 0, closeMin: 0, price: '$724,000', specs: '4bd/2.5ba · 2,050 sqft', priority: 8, saturday: false},
  s9: {id: 's9', address: '530 Inlet Loop', openMin: 660, closeMin: 720, price: '$655,000', specs: '3bd/2ba · 1,500 sqft', priority: 9, saturday: true},
};

const BASE_ORDER = ['s1', 's2', 's3', 's4', 's5', 's6'];
const SAVED_IDS = ['s7', 's8', 's9'];

// DRIVE MATRIX (minutes, symmetric, 'H' = home). Spec-given pairs verbatim;
// the s7/s9 rows beyond s6–s7 16 / s6–s9 21 are AUTHORED ADDITIONS (noted
// deviation) so appended stops stay computable after any skip/reorder.
const DRIVE_PAIRS: Array<[string, string, number]> = [
  ['H', 's1', 12], ['H', 's2', 16], ['H', 's3', 20], ['H', 's4', 26], ['H', 's5', 24], ['H', 's6', 30],
  ['s1', 's2', 18], ['s1', 's3', 11], ['s1', 's4', 24], ['s1', 's5', 21], ['s1', 's6', 27],
  ['s2', 's3', 15], ['s2', 's4', 19], ['s2', 's5', 17], ['s2', 's6', 23],
  ['s3', 's4', 22], ['s3', 's5', 12], ['s3', 's6', 18],
  ['s4', 's5', 25], ['s4', 's6', 9],
  ['s5', 's6', 14],
  ['s6', 's7', 16], ['s6', 's9', 21],
  // Authored extension (unspecified in the brief; deterministic consts):
  ['H', 's7', 22], ['s1', 's7', 25], ['s2', 's7', 21], ['s3', 's7', 19], ['s4', 's7', 12], ['s5', 's7', 23],
  ['H', 's9', 18], ['s1', 's9', 14], ['s2', 's9', 12], ['s3', 's9', 9], ['s4', 's9', 20], ['s5', 's9', 11],
  ['s7', 's9', 13],
];

const DRIVES: Record<string, Record<string, number>> = (() => {
  const map: Record<string, Record<string, number>> = {};
  for (const [a, b, min] of DRIVE_PAIRS) {
    (map[a] ??= {})[b] = min;
    (map[b] ??= {})[a] = min;
  }
  return map;
})();

// ---------------------------------------------------------------------------
// computePlan — the ONE pure function every surface derives from (rail
// cards, connectors, chips, summary card, EtaStrip, Day badge, Homes sort,
// rippleBanner). RULES (spec, exact): start = max(arrive, open); depart =
// min(start + 20, close); GREEN if start + 20 ≤ close; AMBER if arrive <
// close but start + 20 > close (visit = close − start); RED if arrive ≥
// close (visit 0, depart = arrive); wait = start − arrive. 'Fit' counts
// greens over ALL planned stops (skipped included in the denominator).
//
// BASELINE cross-check (order s1…s6, delay 0): arrive 10:12 / 10:50 /
// 11:25 / 12:07 / 12:52 / 13:14; depart 10:32 / 11:10 / 11:45 / 12:27 /
// 13:00 / 13:34; statuses G/G/G/G/A(8-min visit)/G → '5/6 fit', done
// 1:34 PM. Drive 12+18+15+22+25+14 = 106; visit 20·4+8+20 = 108; wait 0;
// 106+108 = 214 min = 10:00 → 1:34 ✓.
// SIGNATURE DRAG (s3 → slot 5): s4 waits 31 (G), s5 A(15), s3 RED +42,
// s6 A(15), done 1:45 PM → '3/6 fit'; 104+90+31 = 225 ✓.
// BANNER SKIP s3: s6 back to G, done 1:34 PM → '4/6 fit'; 88+95+31 = 214 ✓.
// DELAY +30 CORRECTION (spec deviation, law kept exact): at delayMin 30
// the spec's aside claims 'greens s1–s4', but s1 arrives 10:42 and
// 10:42+20 > 11:00 close → s1 is AMBER (18-min visit, departs at close),
// which also lands s5 RED at 1:20 PM (+20, not +22) and s6 AMBER (11-min
// visit) → '3/6 fit'. The pure recompute is the source of truth.
// ---------------------------------------------------------------------------

interface PlanLeg {
  id: string;
  driveMin: number;
  arriveMin: number;
  waitMin: number;
  startMin: number;
  visitMin: number;
  departMin: number;
  status: StopStatus;
  /** minutes past close when red. */
  lateMin: number;
  /** close − (start + DWELL) when green — the Homes sort key. */
  slackMin: number;
  isAdded: boolean;
}

interface Plan {
  legs: PlanLeg[];
  byId: Record<string, PlanLeg>;
  leaveMin: number;
  doneMin: number;
  driveTotal: number;
  visitTotal: number;
  waitTotal: number;
  fitCount: number;
  totalCount: number;
  fitLabel: string;
  reds: PlanLeg[];
}

function computePlan(
  order: readonly string[],
  skipped: readonly string[],
  added: readonly string[],
  delayMin: number,
): Plan {
  const skippedSet = new Set(skipped);
  const addedSet = new Set(added);
  const route = order.filter(id => !skippedSet.has(id));
  const leaveMin = DEPART_HOME_MIN + delayMin;
  let clock = leaveMin;
  let prev = 'H';
  let driveTotal = 0;
  let visitTotal = 0;
  let waitTotal = 0;
  const legs: PlanLeg[] = [];
  for (const id of route) {
    const stop = LISTINGS[id];
    const driveMin = DRIVES[prev]?.[id] ?? 0;
    const arriveMin = clock + driveMin;
    const startMin = Math.max(arriveMin, stop.openMin);
    let status: StopStatus;
    let visitMin: number;
    let departMin: number;
    if (startMin + DWELL_MIN <= stop.closeMin) {
      status = 'green';
      visitMin = DWELL_MIN;
      departMin = startMin + DWELL_MIN;
    } else if (arriveMin < stop.closeMin) {
      status = 'amber';
      visitMin = stop.closeMin - startMin;
      departMin = stop.closeMin;
    } else {
      status = 'red';
      visitMin = 0;
      departMin = arriveMin;
    }
    const waitMin = startMin - arriveMin;
    driveTotal += driveMin;
    visitTotal += visitMin;
    waitTotal += waitMin;
    legs.push({
      id,
      driveMin,
      arriveMin,
      waitMin,
      startMin,
      visitMin,
      departMin,
      status,
      lateMin: status === 'red' ? arriveMin - stop.closeMin : 0,
      slackMin: status === 'green' ? stop.closeMin - (startMin + DWELL_MIN) : 0,
      isAdded: addedSet.has(id),
    });
    clock = departMin;
    prev = id;
  }
  const byId: Record<string, PlanLeg> = {};
  for (const leg of legs) {
    byId[leg.id] = leg;
  }
  const fitCount = legs.reduce((n, leg) => n + (leg.status === 'green' ? 1 : 0), 0);
  const totalCount = order.length;
  return {
    legs,
    byId,
    leaveMin,
    doneMin: legs.length > 0 ? legs[legs.length - 1].departMin : leaveMin,
    driveTotal,
    visitTotal,
    waitTotal,
    fitCount,
    totalCount,
    fitLabel: \`\${fitCount}/\${totalCount} fit\`,
    reds: legs.filter(leg => leg.status === 'red'),
  };
}

// ---------------------------------------------------------------------------
// TIME + STATUS HELPERS.
// ---------------------------------------------------------------------------

function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = ((h + 11) % 12) + 1;
  return \`\${h12}:\${m < 10 ? \`0\${m}\` : m} \${h >= 12 ? 'PM' : 'AM'}\`;
}

/** Meridiem-free clock for the chip label ('window 12:00–1:00'). */
function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return \`\${((h + 11) % 12) + 1}:\${m < 10 ? \`0\${m}\` : m}\`;
}

const STATUS_COLOR: Record<StopStatus, string> = {
  green: BRAND_ACCENT,
  amber: STATUS_AMBER,
  red: STATUS_RED,
};
const STATUS_TINT: Record<StopStatus, string> = {
  green: \`color-mix(in srgb, \${BRAND_ACCENT} 14%, transparent)\`,
  amber: \`color-mix(in srgb, \${STATUS_AMBER} 14%, transparent)\`,
  red: \`color-mix(in srgb, \${STATUS_RED} 14%, transparent)\`,
};
const STATUS_LABEL: Record<StopStatus, string> = {
  green: 'On time',
  amber: 'Tight',
  red: 'Too late',
};

// ---------------------------------------------------------------------------
// HOOKS + UTILITIES.
// ---------------------------------------------------------------------------

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the wrapper
 * can tell the 390px mobile stage from the desktop stage.
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

/** Nearest scrollable ancestor (the demo's .preview-wrap owns page scroll). */
function getScrollEl(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el != null) {
    const overflowY = window.getComputedStyle(el).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

/** Focus trap — Tab cycles within the open overlay's buttons. */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) {
    return;
  }
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (focusables.length === 0) {
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px key-bow looping into a route-pin teardrop; one
// continuous 2px stroke in var(--color-text-primary), BRAND_ACCENT bow
// fill; 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function KeylineMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="7.5" r="4.5" fill={BRAND_ACCENT} />
        {/* Continuous stroke: around the bow, down the stem, looping into
            the pin teardrop and back up — a single path. */}
        <path
          d="M14 3a4.5 4.5 0 1 1 0 9v3.2c-3.4 1.4-5.4 3.6-5.4 6.1a5.4 5.4 0 0 0 10.8 0c0-2.5-2-4.7-5.4-6.1"
          stroke="var(--color-text-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// HOUSE GLYPH — 48px (or custom) 12px squircle with the id-derived
// gradient and a white roofline; decorative, aria-hidden. White stroke on
// the darkest gradient stop (hsl 45% 38%, L ≈ 0.11) ≈ 6.9:1 — decorative
// anyway.
// ---------------------------------------------------------------------------

function HouseGlyph({id, size = 48}: {id: string; size?: number}) {
  const glyph = Math.round(size * 0.46);
  return (
    <span
      style={{...styles.glyphNode, width: size, height: size, background: GLYPH_GRADIENTS[id]}}
      aria-hidden>
      <svg width={glyph} height={glyph} viewBox="0 0 22 22" fill="none" aria-hidden>
        <path
          d="M3.5 10.5 11 4l7.5 6.5M5.5 9.5V18h11V9.5M9.5 18v-5h3v5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// FEASIBILITY CHIP — 120×20 bar (mini 90×14 in the reorder sheet). The
// REST TRACK is the full open-house window (explicit ≥3:1 pair, see
// CHIP_TRACK_REST); the brand fill is the visit span within it; the 2×14
// arrival tick sits at (arrive − open) / (close − open) × 120, clamped
// 0–118 (s5 baseline: (772 − 720)/60 × 120 = 104px; the max-red drag case
// clamps to 118). Ticks recolor by status and slide live (left/background
// transition, instant under reduced motion).
// ---------------------------------------------------------------------------

interface FeasibilityChipProps {
  listing: Listing;
  leg: PlanLeg | undefined;
  mini?: boolean;
  showLabel?: boolean;
}

function FeasibilityChip({listing, leg, mini = false, showLabel = true}: FeasibilityChipProps) {
  const width = mini ? 90 : 120;
  const span = Math.max(1, listing.closeMin - listing.openMin);
  const px = (min: number) => ((min - listing.openMin) / span) * width;
  const clampTick = (x: number) => Math.max(0, Math.min(width - 2, x));
  const tickX = leg != null ? clampTick(px(leg.arriveMin)) : null;
  const fillLeft = leg != null ? Math.max(0, px(leg.startMin)) : 0;
  const fillRight = leg != null ? Math.min(width, px(leg.departMin)) : 0;
  const fillWidth = Math.max(0, fillRight - fillLeft);
  return (
    <span style={styles.chipWrap}>
      <span style={mini ? styles.chipBarMini : styles.chipBar} aria-hidden>
        <span style={styles.chipTrack} />
        {leg != null && fillWidth > 0 ? (
          <span className="khr-tick" style={{...styles.chipFill, left: fillLeft, width: fillWidth}} />
        ) : null}
        {leg != null && tickX != null ? (
          <span
            className="khr-tick"
            style={{
              ...styles.chipTick,
              ...(mini ? styles.chipTickMini : null),
              left: tickX,
              background: STATUS_COLOR[leg.status],
            }}
          />
        ) : null}
      </span>
      {showLabel ? (
        <span style={styles.chipLabel}>
          window {fmtClock(listing.openMin)}–{fmtClock(listing.closeMin)}
        </span>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// STATUS PILL — 11/600 status text on a 14% status tint; 'Skipped' rides
// the muted token (passive). maxWidth 56 + ellipsis is the 320px squeeze.
// ---------------------------------------------------------------------------

function StatusPill({status}: {status: StopStatus | 'skipped'}) {
  if (status === 'skipped') {
    return (
      <span
        style={{
          ...styles.statusPill,
          background: 'var(--color-background-muted)',
          color: 'var(--color-text-secondary)',
        }}>
        Skipped
      </span>
    );
  }
  return (
    <span style={{...styles.statusPill, background: STATUS_TINT[status], color: STATUS_COLOR[status]}}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATE + SKELETONS (deterministic widths; no shimmer — static muted
// blocks encode 'loading' and survive reduced motion unchanged).
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({icon, title, body, actionLabel, onAction}: EmptyStateProps) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>{icon}</span>
      <h2 style={styles.emptyTitle}>{title}</h2>
      <p style={styles.emptyBody}>{body}</p>
      {actionLabel != null && onAction != null ? (
        <button type="button" className="khr-btn khr-focusable" style={styles.secondaryBtn} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

const SKEL_PRIMARY = ['60%', '45%', '70%'];
const SKEL_SECONDARY = ['40%', '55%', '30%'];

function SkeletonStopRows() {
  return (
    <div style={styles.routeRail} aria-busy>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{...styles.railRow, marginBottom: i < 3 ? 28 : 0}} aria-hidden>
          <div style={styles.railNodeCell}>
            <span style={{...styles.skelBlock, width: 48, height: 48, borderRadius: 12}} />
          </div>
          <div
            style={{
              ...styles.stopCard,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 12,
            }}>
            <span style={{...styles.skelBlock, height: 12, width: SKEL_PRIMARY[i % 3]}} />
            <span style={{...styles.skelBlock, height: 12, width: SKEL_SECONDARY[i % 3]}} />
            <span style={{...styles.skelBlock, height: 12, width: 120, marginTop: 'auto'}} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonMediaRows({count}: {count: number}) {
  return (
    <div style={styles.listCard} aria-busy>
      {Array.from({length: count}, (_, i) => (
        <div key={i} aria-hidden>
          {i > 0 ? <div style={styles.rowDivider} /> : null}
          <div style={styles.mediaRow}>
            <span style={styles.skelThumb} />
            <span style={{...styles.rowText, gap: 8}}>
              <span style={{...styles.skelBlock, height: 12, width: SKEL_PRIMARY[i % 3]}} />
              <span style={{...styles.skelBlock, height: 12, width: SKEL_SECONDARY[i % 3]}} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STOP ACTION SHEET — actionSheet primitive, leading-icons variant (all
// rows iconed). 'Skip today' is NOT error-colored: it is reversible and
// executes immediately + Undo (undoOverConfirm — no confirm step). Focus
// lands on Cancel (the safe default), Tab is trapped, Escape/scrim/Cancel
// close with no action, focus restores to the opener.
// ---------------------------------------------------------------------------

interface StopActionSheetProps {
  listing: Listing;
  isAdded: boolean;
  canEarlier: boolean;
  canLater: boolean;
  onEarlier: () => void;
  onLater: () => void;
  onSkip: () => void;
  onClose: () => void;
}

function StopActionSheet({listing, isAdded, canEarlier, canLater, onEarlier, onLater, onSkip, onClose}: StopActionSheetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // preventScroll: plain .focus() would scroll-reveal the animating
    // sheet inside the locked overflow-hidden column (amendment).
    const frame = requestAnimationFrame(() => cancelRef.current?.focus({preventScroll: true}));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      ref={containerRef}
      className="khr-sheet-in"
      style={styles.actionSheet}
      role="dialog"
      aria-modal
      aria-label={\`Actions for \${listing.address}\`}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
        trapTabKey(event, containerRef.current);
      }}>
      <div style={styles.asCard}>
        <div style={styles.asHeader}>{listing.address}</div>
        {!isAdded ? (
          <>
            <button
              type="button"
              className="khr-btn khr-focusable"
              style={{...styles.asRow, ...(canEarlier ? null : styles.asRowDisabled)}}
              disabled={!canEarlier}
              onClick={onEarlier}>
              <Icon icon={ArrowUpIcon} size="sm" color="inherit" />
              Move earlier
            </button>
            <div style={styles.asDivider} />
            <button
              type="button"
              className="khr-btn khr-focusable"
              style={{...styles.asRow, ...(canLater ? null : styles.asRowDisabled)}}
              disabled={!canLater}
              onClick={onLater}>
              <Icon icon={ArrowDownIcon} size="sm" color="inherit" />
              Move later
            </button>
            <div style={styles.asDivider} />
          </>
        ) : null}
        <button type="button" className="khr-btn khr-focusable" style={styles.asRow} onClick={onSkip}>
          <Icon icon={CircleSlashIcon} size="sm" color="inherit" />
          {isAdded ? 'Remove from route' : 'Skip today'}
        </button>
      </div>
      <div style={styles.asCard}>
        <button ref={cancelRef} type="button" className="khr-btn khr-focusable" style={styles.asCancelRow} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REORDER SHEET — two detents (55% / calc(100% − 56px)); the 36×5 grabber
// is a real button toggling detents; each 60px row has a 44×44
// GripVertical pointer-drag handle AND always-visible 44px up/down
// chevrons (the button path — no edit-mode toggle); a live mini
// FeasibilityChip per row recomputes mid-drag from the DRAFT order; Done
// commits (execute + Undo toast in the parent); X / scrim / Escape
// discard the draft.
// ---------------------------------------------------------------------------

interface ReorderSheetProps {
  routeIds: string[];
  planForRoute: (route: string[]) => Plan;
  detent: 'medium' | 'large';
  onToggleDetent: () => void;
  onCommit: (route: string[]) => void;
  onClose: () => void;
}

function ReorderSheet({routeIds, planForRoute, detent, onToggleDetent, onCommit, onClose}: ReorderSheetProps) {
  const [draft, setDraft] = useState<string[]>(routeIds);
  const [dragRow, setDragRow] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const draftPlan = planForRoute(draft);
  useEffect(() => {
    const frame = requestAnimationFrame(() => closeRef.current?.focus({preventScroll: true}));
    return () => cancelAnimationFrame(frame);
  }, []);
  const move = (id: string, dir: -1 | 1) => {
    setDraft(prev => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) {
        return prev;
      }
      const next = [...prev];
      next[i] = next[j];
      next[j] = id;
      return next;
    });
  };
  const onGripMove = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (dragRow !== id) {
      return;
    }
    const others = draft.filter(x => x !== id);
    let idx = others.length;
    for (let i = 0; i < others.length; i++) {
      const el = rowRefs.current.get(others[i]);
      if (el != null) {
        const rect = el.getBoundingClientRect();
        if (event.clientY < rect.top + rect.height / 2) {
          idx = i;
          break;
        }
      }
    }
    const next = [...others];
    next.splice(idx, 0, id);
    if (next.some((x, i) => x !== draft[i])) {
      setDraft(next);
    }
  };
  return (
    <div
      ref={containerRef}
      className="khr-sheet-in"
      style={{...styles.sheet, ...(detent === 'large' ? styles.sheetLarge : styles.sheetMedium)}}
      role="dialog"
      aria-modal
      aria-labelledby="khr-reorder-title"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
        trapTabKey(event, containerRef.current);
      }}>
      <div style={styles.grabberZone}>
        <button
          type="button"
          className="khr-btn khr-focusable"
          style={{width: 44, height: 16, display: 'grid', placeItems: 'center', borderRadius: 8}}
          aria-label="Resize sheet"
          onClick={onToggleDetent}>
          <span style={styles.sheetGrabber} />
        </button>
      </div>
      <div style={styles.sheetHeader}>
        <span />
        <h2 id="khr-reorder-title" style={styles.sheetTitle}>
          Reorder Saturday
        </h2>
        <button
          ref={closeRef}
          type="button"
          className="khr-btn khr-focusable"
          style={styles.iconBtn}
          aria-label="Close without saving"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        {draft.map((id, i) => {
          const listing = LISTINGS[id];
          const leg = draftPlan.byId[id];
          return (
            <div
              key={id}
              ref={el => {
                if (el != null) {
                  rowRefs.current.set(id, el);
                } else {
                  rowRefs.current.delete(id);
                }
              }}>
              {i > 0 ? <div style={styles.reorderDivider} /> : null}
              <div style={{...styles.reorderRow, ...(dragRow === id ? {background: 'var(--color-background-muted)'} : null)}}>
                <button
                  type="button"
                  className="khr-btn khr-focusable"
                  style={styles.gripBtn}
                  aria-label={\`Drag to reorder \${listing.address}\`}
                  onPointerDown={event => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragRow(id);
                  }}
                  onPointerMove={event => onGripMove(event, id)}
                  onPointerUp={() => setDragRow(null)}
                  onPointerCancel={() => setDragRow(null)}>
                  <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
                </button>
                <span style={styles.reorderText}>
                  <span style={styles.rowPrimary}>{listing.address}</span>
                  <FeasibilityChip listing={listing} leg={leg} mini showLabel={false} />
                </span>
                <span style={styles.chevGroup}>
                  <button
                    type="button"
                    className="khr-btn khr-focusable"
                    style={{...styles.chevBtn, ...(i === 0 ? styles.chevBtnDisabled : null)}}
                    disabled={i === 0}
                    aria-label={\`Move \${listing.address} earlier\`}
                    onClick={() => move(id, -1)}>
                    <Icon icon={ChevronUpIcon} size="sm" color="inherit" />
                  </button>
                  <button
                    type="button"
                    className="khr-btn khr-focusable"
                    style={{...styles.chevBtn, ...(i === draft.length - 1 ? styles.chevBtnDisabled : null)}}
                    disabled={i === draft.length - 1}
                    aria-label={\`Move \${listing.address} later\`}
                    onClick={() => move(id, 1)}>
                    <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="khr-btn khr-focusable" style={styles.primaryBtn} onClick={() => onCommit(draft)}>
          Done
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN — ONE state owner; every surface derives from computePlan's output.
// ---------------------------------------------------------------------------

interface Snapshot {
  order: string[];
  skipped: string[];
  added: string[];
  delayMin: number;
}

type Overlay = {kind: 'reorder'; detent: 'medium' | 'large'} | {kind: 'actions'; stopId: string} | null;

interface RouterState {
  activeTab: TabId;
  screenByTab: Record<TabId, 'root' | 'detail'>;
  detailId: string | null;
  order: string[];
  skipped: string[];
  added: string[];
  delayMin: number;
  overlay: Overlay;
  toast: {msg: string; canUndo: boolean} | null;
  prevForUndo: Snapshot | null;
  scrollByTab: Partial<Record<TabId, number>>;
  refreshing: boolean;
}

const INITIAL_STATE: RouterState = {
  activeTab: 'day',
  screenByTab: {day: 'root', homes: 'root', saved: 'root'},
  detailId: null,
  order: BASE_ORDER,
  skipped: [],
  added: [],
  delayMin: 0,
  overlay: null,
  toast: null,
  prevForUndo: null,
  scrollByTab: {},
  refreshing: false,
};

const TABS: Array<{id: TabId; label: string; icon: typeof RouteIcon}> = [
  {id: 'day', label: 'Day', icon: RouteIcon},
  {id: 'homes', label: 'Homes', icon: HomeIcon},
  {id: 'saved', label: 'Saved', icon: BookmarkIcon},
];

export default function MobileOpenHouseRouterTemplate() {
  const [state, setState] = useState<RouterState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<RouterState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const vpDesktop = useMediaQuery('(min-width: 720px)');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  // Container width decides the stage; viewport query is first-frame
  // fallback only.
  const isDesktop = (wrapWidth > 0 ? wrapWidth : vpDesktop ? 1045 : 390) >= 720;

  const {activeTab, screenByTab, detailId, order, skipped, added, delayMin, overlay, toast, refreshing} = state;

  // --- rail long-press drag (450ms lift, cancel on 8px move) ------------
  const [drag, setDrag] = useState<{id: string; draft: string[]} | null>(null);
  const pressRef = useRef<{id: string; y: number; timer: number; pointerId: number} | null>(null);
  const suppressClickRef = useRef(false);
  const railRefs = useRef(new Map<string, HTMLDivElement>());
  const orderRef = useRef(order);
  orderRef.current = order;

  const activeOrder = drag?.draft ?? order;
  const plan = useMemo(
    () => computePlan(activeOrder, skipped, added, delayMin),
    [activeOrder, skipped, added, delayMin],
  );

  // --- mutations: execute immediately + Undo (never confirm) ------------
  const mutate = useCallback((changes: Partial<Snapshot>, msgFor: (next: Plan) => string) => {
    setState(prev => {
      const snapshot: Snapshot = {order: prev.order, skipped: prev.skipped, added: prev.added, delayMin: prev.delayMin};
      const merged = {...snapshot, ...changes};
      const nextPlan = computePlan(merged.order, merged.skipped, merged.added, merged.delayMin);
      return {...prev, ...merged, prevForUndo: snapshot, toast: {msg: msgFor(nextPlan), canUndo: true}};
    });
  }, []);
  const undo = useCallback(() => {
    setState(prev =>
      prev.prevForUndo == null
        ? prev
        : {...prev, ...prev.prevForUndo, prevForUndo: null, toast: {msg: 'Restored', canUndo: false}},
    );
  }, []);

  const routeIds = plan.legs.map(leg => leg.id);
  const moveStop = (id: string, dir: -1 | 1) => {
    const i = routeIds.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= routeIds.length) {
      return;
    }
    const other = routeIds[j];
    const newOrder = [...order];
    const a = newOrder.indexOf(id);
    const b = newOrder.indexOf(other);
    newOrder[a] = other;
    newOrder[b] = id;
    mutate({order: newOrder}, p => \`Route updated — \${p.fitLabel}\`);
  };
  const skipStop = (id: string) => {
    const listing = LISTINGS[id];
    if (added.includes(id)) {
      mutate({order: order.filter(x => x !== id), added: added.filter(x => x !== id)}, () => \`Removed \${listing.address} from route\`);
    } else {
      mutate({skipped: [...skipped, id]}, () => \`Skipped \${listing.address}\`);
    }
  };
  const restoreStop = (id: string) => {
    mutate({skipped: skipped.filter(x => x !== id)}, p => \`Back on the route — \${p.fitLabel}\`);
  };
  const restoreAll = () => {
    mutate({skipped: []}, p => \`Route restored — \${p.fitLabel}\`);
  };
  const addDelay = () => {
    mutate({delayMin: delayMin + 15}, p => \`Leave \${fmtTime(p.leaveMin)} — \${p.fitLabel}\`);
  };
  const planVisit = (id: string) => {
    mutate({order: [...order, id], added: [...added, id]}, p => {
      const leg = p.byId[id];
      return leg != null && leg.status !== 'red'
        ? \`Added \${LISTINGS[id].address} — arrives \${fmtTime(leg.arriveMin)}\`
        : \`Added \${LISTINGS[id].address} to route\`;
    });
  };

  // --- overlays: focus restores to the opener on every close path -------
  const openerRef = useRef<HTMLElement | null>(null);
  const openOverlay = (next: Overlay) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    update({overlay: next});
  };
  const closeOverlay = () => {
    update({overlay: null});
    const opener = openerRef.current;
    if (opener != null) {
      requestAnimationFrame(() => opener.focus({preventScroll: true}));
    }
  };
  const commitReorder = (route: string[]) => {
    const newOrder = [...route, ...order.filter(id => skipped.includes(id))];
    mutate({order: newOrder}, p => \`Route updated — \${p.fitLabel}\`);
    closeOverlay();
  };
  const planForRoute = useCallback(
    (route: string[]) => computePlan([...route, ...orderRef.current.filter(id => skipped.includes(id))], skipped, added, delayMin),
    [skipped, added, delayMin],
  );

  // --- refresh: user-driven skeleton, no timers --------------------------
  const onRefresh = () => {
    if (refreshing) {
      update({refreshing: false, toast: {msg: 'Updated just now', canUndo: false}});
    } else {
      update({refreshing: true, toast: {msg: 'Loading', canUndo: false}});
    }
  };

  // --- per-tab persistence (screen, scroll); overlays close on switch ---
  const pendingScrollRef = useRef<number | null>(null);
  const selectTab = (tab: TabId) => {
    const scrollEl = getScrollEl(shellRef.current);
    if (tab === activeTab) {
      // The one legal reset: re-tapping the active tab pops to root + top.
      update({screenByTab: {...screenByTab, [tab]: 'root'}, detailId: tab === 'homes' ? null : detailId});
      if (scrollEl != null) {
        scrollEl.scrollTop = 0;
      }
      return;
    }
    pendingScrollRef.current = state.scrollByTab[tab] ?? 0;
    update({
      activeTab: tab,
      overlay: null,
      scrollByTab: {...state.scrollByTab, [activeTab]: scrollEl?.scrollTop ?? 0},
    });
  };
  useEffect(() => {
    const pending = pendingScrollRef.current;
    if (pending == null) {
      return;
    }
    pendingScrollRef.current = null;
    const scrollEl = getScrollEl(shellRef.current);
    if (scrollEl != null) {
      requestAnimationFrame(() => {
        scrollEl.scrollTop = pending;
      });
    }
  }, [activeTab, screenByTab]);
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    const idx = TABS.findIndex(tab => tab.id === activeTab);
    const next = TABS[(idx + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    selectTab(next.id);
    tabRefs.current.get(next.id)?.focus();
  };

  const pushDetail = (id: string) => {
    const scrollEl = getScrollEl(shellRef.current);
    pendingScrollRef.current = 0;
    update({
      activeTab: 'homes',
      screenByTab: {...screenByTab, homes: 'detail'},
      detailId: id,
      overlay: null,
      scrollByTab: {...state.scrollByTab, [activeTab]: scrollEl?.scrollTop ?? 0},
    });
  };
  const backFromDetail = () => {
    pendingScrollRef.current = state.scrollByTab.homes ?? 0;
    update({screenByTab: {...screenByTab, homes: 'root'}, detailId: null});
  };

  // --- large-title collapse via IntersectionObserver sentinel -----------
  const [titleUnder, setTitleUnder] = useState(false);
  const largeTitleRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (activeTab !== 'day' || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const el = largeTitleRef.current;
    if (el == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => setTitleUnder(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-52px 0px 0px 0px', threshold: 0},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab]);

  // --- rail long-press drag handlers -------------------------------------
  const startLift = (id: string, pointerId: number) => {
    setDrag({id, draft: [...orderRef.current]});
    suppressClickRef.current = true;
    const el = railRefs.current.get(id);
    try {
      el?.setPointerCapture(pointerId);
    } catch {
      // pointer already released — the press simply never lifts.
    }
  };
  const onStopPointerDown = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    suppressClickRef.current = false;
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (event.target instanceof HTMLElement && event.target.closest('[data-no-drag]') != null) {
      return;
    }
    const timer = window.setTimeout(() => startLift(id, event.pointerId), 450);
    pressRef.current = {id, y: event.clientY, timer, pointerId: event.pointerId};
  };
  const onStopPointerMove = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    const press = pressRef.current;
    if (press == null || press.id !== id) {
      return;
    }
    if (drag == null) {
      if (Math.abs(event.clientY - press.y) > 8) {
        window.clearTimeout(press.timer);
        pressRef.current = null;
      }
      return;
    }
    // Lifted: recompute the crossed slot from the rendered rail midpoints;
    // computePlan re-runs on every crossing so downstream ticks slide live.
    const visible = drag.draft.filter(x => !skipped.includes(x));
    const others = visible.filter(x => x !== id);
    let idx = others.length;
    for (let i = 0; i < others.length; i++) {
      const el = railRefs.current.get(others[i]);
      if (el != null) {
        const rect = el.getBoundingClientRect();
        if (event.clientY < rect.top + rect.height / 2) {
          idx = i;
          break;
        }
      }
    }
    const nextRoute = [...others];
    nextRoute.splice(idx, 0, id);
    if (nextRoute.some((x, i) => x !== visible[i])) {
      setDrag({id, draft: [...nextRoute, ...drag.draft.filter(x => skipped.includes(x))]});
    }
  };
  const endLift = (commit: boolean) => {
    const press = pressRef.current;
    if (press != null) {
      window.clearTimeout(press.timer);
    }
    pressRef.current = null;
    if (drag == null) {
      return;
    }
    const draft = drag.draft;
    setDrag(null);
    if (commit && draft.some((x, i) => x !== order[i])) {
      mutate({order: draft}, p => \`Route updated — \${p.fitLabel}\`);
    }
  };
  const onStopPointerUp = () => {
    if (drag != null) {
      endLift(true);
    } else {
      const press = pressRef.current;
      if (press != null) {
        window.clearTimeout(press.timer);
      }
      pressRef.current = null;
    }
  };

  // --- derived surfaces ---------------------------------------------------
  const activeRouteEmpty = plan.legs.length === 0;
  const firstRed = plan.reds[0];
  const showBanner = firstRed != null && !refreshing;
  const bannerText =
    firstRed != null
      ? plan.reds.length === 1
        ? \`\${LISTINGS[firstRed.id].address} arrives \${firstRed.lateMin} min after close\`
        : \`\${plan.reds.length} stops no longer reachable · \${LISTINGS[firstRed.id].address} +\${firstRed.lateMin} min\`
      : '';
  const etaLabel = \`Done \${fmtTime(plan.doneMin)} · \${plan.fitLabel}\`;
  // Homes sort: greens by slack (most slack first — the safest showings
  // lead), then ambers, then reds/skipped; base-route order breaks ties.
  const homesRows = useMemo(() => {
    const rank = (id: string): number => {
      if (skipped.includes(id)) {
        return 4;
      }
      const leg = plan.byId[id];
      if (leg == null) {
        return 4;
      }
      return leg.status === 'green' ? 1 : leg.status === 'amber' ? 2 : 3;
    };
    return [...BASE_ORDER].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) {
        return ra - rb;
      }
      if (ra === 1) {
        const slackDelta = (plan.byId[b]?.slackMin ?? 0) - (plan.byId[a]?.slackMin ?? 0);
        if (slackDelta !== 0) {
          return slackDelta;
        }
      }
      return BASE_ORDER.indexOf(a) - BASE_ORDER.indexOf(b);
    });
  }, [plan, skipped]);
  const savedRows = SAVED_IDS.filter(id => !added.includes(id));
  const locked = overlay != null;

  // --- nav bar content per screen ----------------------------------------
  const detailOpenId = activeTab === 'homes' && screenByTab.homes === 'detail' ? detailId : null;
  const homesDetail = detailOpenId != null;
  const navCenter = (() => {
    if (activeTab === 'day') {
      return titleUnder ? (
        <span className="khr-fade" style={styles.etaStrip}>
          {etaLabel}
        </span>
      ) : (
        <span style={styles.navTitle}>{DATE_LABEL}</span>
      );
    }
    if (detailOpenId != null) {
      return <span style={styles.navTitle}>{LISTINGS[detailOpenId].address}</span>;
    }
    return <span style={styles.navTitle}>{activeTab === 'homes' ? 'Homes' : 'Saved'}</span>;
  })();

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{KEYLINE_CSS}</style>
      <div
        ref={shellRef}
        style={{...styles.shell, ...(isDesktop ? styles.shellDesktop : null), ...(locked ? styles.shellLocked : null)}}>
        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {homesDetail ? (
              <button type="button" className="khr-btn khr-focusable" style={styles.backBtn} onClick={backFromDetail}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Homes</span>
              </button>
            ) : (
              <KeylineMark />
            )}
          </div>
          <div style={styles.navCenter}>{navCenter}</div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="khr-btn khr-focusable"
              style={styles.iconBtn}
              aria-label={refreshing ? 'Finish refreshing the plan' : 'Refresh the plan'}
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
            </button>
          </div>
        </header>

        {/* RIPPLE BANNER — sticky under the navBar; only while ≥1 red. */}
        {showBanner ? (
          <div style={styles.rippleBanner}>
            <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
            <span style={styles.rippleText}>{bannerText}</span>
            <button type="button" className="khr-btn khr-focusable" style={styles.rippleSkipBtn} onClick={() => skipStop(firstRed.id)}>
              Skip it
            </button>
          </div>
        ) : null}

        <main style={styles.main}>
          {activeTab === 'day' ? (
            <>
              <div ref={largeTitleRef} style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>Saturday plan</h1>
              </div>
              {refreshing ? (
                <>
                  <h2 style={styles.sectionHeader}>Route</h2>
                  <SkeletonStopRows />
                </>
              ) : activeRouteEmpty ? (
                <EmptyState
                  icon={<Icon icon={CircleSlashIcon} size="md" color="inherit" />}
                  title="No stops planned"
                  body="Homes you add appear on the route."
                  actionLabel="Restore all"
                  onAction={restoreAll}
                />
              ) : (
                <>
                  <section aria-label="Day summary" style={styles.daySummaryCard}>
                    <div style={styles.summaryLine1}>
                      Leave {fmtTime(plan.leaveMin)} — Done {fmtTime(plan.doneMin)}
                    </div>
                    <div style={styles.summaryLine2}>
                      <span>{plan.driveTotal} min driving</span>
                      <span>· {plan.visitTotal} min viewing</span>
                      <span>· {plan.waitTotal} min waiting</span>
                    </div>
                    <div style={styles.summaryBtnRow}>
                      <button
                        type="button"
                        className="khr-btn khr-focusable"
                        style={styles.secondaryBtn}
                        onClick={() => openOverlay({kind: 'reorder', detent: 'medium'})}>
                        Reorder stops
                      </button>
                      <button type="button" className="khr-btn khr-focusable" style={styles.secondaryBtn} onClick={addDelay}>
                        Add delay +15m
                      </button>
                    </div>
                  </section>
                  <h2 style={styles.sectionHeader}>Route</h2>
                  <div style={styles.routeRail}>
                    <div style={{...styles.railRow, height: 36}}>
                      <div style={styles.railNodeCell}>
                        <span style={styles.originDot} aria-hidden>
                          <Icon icon={HomeIcon} size="sm" color="inherit" />
                        </span>
                      </div>
                      <div style={styles.originLabel}>Leave home {fmtTime(plan.leaveMin)}</div>
                    </div>
                    {plan.legs.map(leg => {
                      const listing = LISTINGS[leg.id];
                      const connectorH = Math.max(24, Math.min(72, leg.driveMin * 2));
                      const lifted = drag?.id === leg.id;
                      const line2 =
                        leg.status === 'red'
                          ? \`\${fmtTime(leg.arriveMin)} arrive · \${leg.lateMin} min after close\`
                          : \`\${fmtTime(leg.arriveMin)} arrive\${leg.waitMin > 0 ? \` · \${leg.waitMin} min wait\` : ''} · \${leg.visitMin} min visit\`;
                      return (
                        <div key={leg.id}>
                          <div style={{...styles.railRow, height: connectorH}}>
                            <div style={styles.railNodeCell}>
                              <span
                                className="khr-fade"
                                style={{...styles.connectorBar, height: Math.max(12, connectorH - 8), background: STATUS_COLOR[leg.status]}}
                                aria-hidden
                              />
                            </div>
                            <div style={styles.connectorLabel}>{leg.driveMin} min drive</div>
                          </div>
                          <div
                            ref={el => {
                              if (el != null) {
                                railRefs.current.set(leg.id, el);
                              } else {
                                railRefs.current.delete(leg.id);
                              }
                            }}
                            style={styles.railRow}
                            onPointerDown={event => onStopPointerDown(event, leg.id)}
                            onPointerMove={event => onStopPointerMove(event, leg.id)}
                            onPointerUp={onStopPointerUp}
                            onPointerCancel={() => endLift(false)}
                            onClickCapture={event => {
                              if (suppressClickRef.current) {
                                event.preventDefault();
                                event.stopPropagation();
                                suppressClickRef.current = false;
                              }
                            }}>
                            <div style={styles.railNodeCell}>
                              <HouseGlyph id={leg.id} />
                            </div>
                            <div
                              className={reducedMotion ? undefined : 'khr-anim'}
                              style={{
                                ...styles.stopCard,
                                ...(lifted ? (reducedMotion ? {opacity: 0.92} : styles.stopCardLifted) : null),
                              }}>
                              <button
                                type="button"
                                className="khr-btn khr-focusable"
                                style={styles.stopPrimary}
                                aria-label={listing.address}
                                onClick={() => pushDetail(leg.id)}>
                                <span style={styles.stopAddress}>{listing.address}</span>
                                <span style={styles.stopMeta}>{line2}</span>
                                <span style={styles.stopLine3}>
                                  <FeasibilityChip listing={listing} leg={leg} />
                                  <StatusPill status={leg.status} />
                                </span>
                              </button>
                              <button
                                type="button"
                                data-no-drag
                                className="khr-btn khr-focusable"
                                style={styles.ellipsisBtn}
                                aria-label={\`Route actions for \${listing.address}\`}
                                onClick={() => openOverlay({kind: 'actions', stopId: leg.id})}>
                                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : null}

          {activeTab === 'homes' && !homesDetail ? (
            <>
              <h1 className="khr-vh">Homes</h1>
              <h2 style={styles.sectionHeader}>By feasibility</h2>
              {refreshing ? (
                <SkeletonMediaRows count={6} />
              ) : (
                <div style={styles.listCard}>
                  {homesRows.map((id, i) => {
                    const listing = LISTINGS[id];
                    const leg = plan.byId[id];
                    const isSkipped = skipped.includes(id);
                    return (
                      <div key={id}>
                        {i > 0 ? <div style={styles.rowDivider} /> : null}
                        <button
                          type="button"
                          className="khr-btn khr-focusable"
                          style={styles.mediaRow}
                          aria-label={listing.address}
                          onClick={() => pushDetail(id)}>
                          <HouseGlyph id={id} />
                          <span style={styles.rowText}>
                            <span style={styles.rowPrimary}>{listing.address}</span>
                            <span style={styles.rowSecondary}>
                              {listing.price} · {listing.specs}
                            </span>
                          </span>
                          <StatusPill status={isSkipped ? 'skipped' : leg?.status ?? 'skipped'} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}

          {detailOpenId != null ? (
            <HomeDetail
              listing={LISTINGS[detailOpenId]}
              leg={plan.byId[detailOpenId]}
              isSkipped={skipped.includes(detailOpenId)}
              onSkip={() => skipStop(detailOpenId)}
              onRestore={() => restoreStop(detailOpenId)}
            />
          ) : null}

          {activeTab === 'saved' ? (
            <>
              <h1 className="khr-vh">Saved</h1>
              <h2 style={styles.sectionHeader}>Saved listings</h2>
              {refreshing ? (
                <SkeletonMediaRows count={savedRows.length || 1} />
              ) : (
                <div style={styles.listCard}>
                  {savedRows.map((id, i) => {
                    const listing = LISTINGS[id];
                    return (
                      <div key={id}>
                        {i > 0 ? <div style={styles.rowDivider} /> : null}
                        <div style={styles.mediaRow}>
                          <HouseGlyph id={id} />
                          <span style={styles.rowText}>
                            <span style={styles.rowPrimary}>{listing.address}</span>
                            <span style={styles.rowSecondary}>
                              {listing.price} · {listing.specs}
                            </span>
                            <span style={styles.rowSecondary}>
                              {listing.saturday
                                ? \`window \${fmtClock(listing.openMin)}–\${fmtClock(listing.closeMin)}\`
                                : 'Open Sunday'}
                            </span>
                          </span>
                          <span style={styles.savedTrailing}>
                            <button
                              type="button"
                              className="khr-btn khr-focusable"
                              style={{...styles.secondaryBtn, ...(listing.saturday ? null : styles.secondaryBtnDisabled)}}
                              disabled={!listing.saturday}
                              onClick={() => planVisit(id)}>
                              Plan visit
                            </button>
                            {!listing.saturday ? <span style={styles.savedCaption}>No Sat window</span> : null}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow, flips
            to absolute while the shell is scroll-locked. */}
        <div style={locked ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.canUndo ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button type="button" className="khr-btn khr-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR */}
        <nav style={styles.tabBar} role="tablist" aria-label="Keyline sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={el => {
                  if (el != null) {
                    tabRefs.current.set(tab.id, el);
                  } else {
                    tabRefs.current.delete(tab.id);
                  }
                }}
                type="button"
                role="tab"
                aria-selected={active}
                className="khr-btn khr-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'day' ? (
                    <span style={styles.tabBadge}>
                      {plan.fitCount}/{plan.totalCount}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* OVERLAYS — absolute in shell; scrim click + Escape close;
            never more than one sheet-layer overlay. */}
        {overlay != null ? <div style={styles.sheetScrim} onClick={closeOverlay} aria-hidden /> : null}
        {overlay?.kind === 'reorder' ? (
          <ReorderSheet
            routeIds={routeIds}
            planForRoute={planForRoute}
            detent={overlay.detent}
            onToggleDetent={() =>
              update({overlay: {kind: 'reorder', detent: overlay.detent === 'medium' ? 'large' : 'medium'}})
            }
            onCommit={commitReorder}
            onClose={closeOverlay}
          />
        ) : null}
        {overlay?.kind === 'actions' ? (
          <StopActionSheet
            listing={LISTINGS[overlay.stopId]}
            isAdded={added.includes(overlay.stopId)}
            canEarlier={routeIds.indexOf(overlay.stopId) > 0}
            canLater={routeIds.indexOf(overlay.stopId) >= 0 && routeIds.indexOf(overlay.stopId) < routeIds.length - 1}
            onEarlier={() => {
              moveStop(overlay.stopId, -1);
              closeOverlay();
            }}
            onLater={() => {
              moveStop(overlay.stopId, 1);
              closeOverlay();
            }}
            onSkip={() => {
              skipStop(overlay.stopId);
              closeOverlay();
            }}
            onClose={closeOverlay}
          />
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HOME DETAIL — pushed screen under the Homes tab ('‹ Homes' back in the
// navBar). Facts derive from the same plan output; the one action toggles
// skip/restore (execute + Undo).
// ---------------------------------------------------------------------------

interface HomeDetailProps {
  listing: Listing;
  leg: PlanLeg | undefined;
  isSkipped: boolean;
  onSkip: () => void;
  onRestore: () => void;
}

function HomeDetail({listing, leg, isSkipped, onSkip, onRestore}: HomeDetailProps) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16}}>
      <h1 className="khr-vh">{listing.address}</h1>
      <div style={{...styles.detailHero, background: GLYPH_GRADIENTS[listing.id]}} aria-hidden>
        <svg width={56} height={56} viewBox="0 0 22 22" fill="none" aria-hidden>
          <path
            d="M3.5 10.5 11 4l7.5 6.5M5.5 9.5V18h11V9.5M9.5 18v-5h3v5"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 2}}>
        <span style={styles.detailPrice}>{listing.price}</span>
        <span style={styles.rowSecondary}>{listing.specs}</span>
      </div>
      <div style={styles.listCard}>
        <div style={styles.factRow}>
          <span style={styles.factLabel}>Open house</span>
          <span style={styles.factValue}>
            {listing.saturday ? \`\${fmtTime(listing.openMin)} – \${fmtTime(listing.closeMin)}\` : 'Sunday only'}
          </span>
        </div>
        <div style={styles.factDividerFull} />
        <div style={styles.factRow}>
          <span style={styles.factLabel}>Arrival</span>
          <span style={styles.factValue}>
            {isSkipped ? 'Skipped today' : leg != null ? fmtTime(leg.arriveMin) : 'Not on route'}
          </span>
        </div>
        <div style={styles.factDividerFull} />
        <div style={styles.factRow}>
          <span style={styles.factLabel}>Feasibility</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
            <FeasibilityChip listing={listing} leg={leg} showLabel={false} />
            <StatusPill status={isSkipped ? 'skipped' : leg?.status ?? 'skipped'} />
          </span>
        </div>
        {leg != null && leg.status !== 'red' ? (
          <>
            <div style={styles.factDividerFull} />
            <div style={styles.factRow}>
              <span style={styles.factLabel}>Visit</span>
              <span style={styles.factValue}>
                {leg.visitMin} min{leg.waitMin > 0 ? \` · after a \${leg.waitMin} min wait\` : ''}
              </span>
            </div>
          </>
        ) : null}
      </div>
      <div style={styles.detailActionWrap}>
        {isSkipped ? (
          <button type="button" className="khr-btn khr-focusable" style={styles.secondaryBtn} onClick={onRestore}>
            Restore to route
          </button>
        ) : (
          <button type="button" className="khr-btn khr-focusable" style={styles.secondaryBtn} onClick={onSkip}>
            Skip today
          </button>
        )}
      </div>
    </div>
  );
}
`;export{e as default};