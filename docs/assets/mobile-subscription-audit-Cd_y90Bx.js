var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Prune subscription ledger frozen
 *   at TODAY_LABEL 'Mon, Jul 6' (2026): 12 subscriptions summing to exactly
 *   $137.93/mo = $1,655.16/yr; initial verdicts keep×4 (Streamly, Tunecloud,
 *   CloudVault, PetCam), review×6 (FitPulse, NewsWire, GameBox, PodPlus,
 *   MealKit Lite, DesignHub — the Audit badge '6'), cancel×2 (LensPro
 *   $119.88/yr + FocusTimer $47.88/yr = $167.76/yr reclaimed, $13.98/mo);
 *   23 renewal occurrences across the 60-day Jul 6–Sep 3 horizon; next-30
 *   spend $117.45 across 9 active charges. No Date.now(), no Math.random(),
 *   no network media — logos are monogram tiles on per-service light-dark
 *   pairs.
 * @output Prune — Subscription Audit: a 390px MOBILE triage bench. NavBar
 *   (snipped-loop 'p' mark · fade-in 'Audit' title · 44×44 RefreshCw) over
 *   a large 'Audit' title, a PINNED SavingsMeterOdometer (56px sticky at
 *   top:52 — per-character translateY-rolling digits), a 96px
 *   RenewalHorizonStrip (60 day-slots, price bubbles sized by tier
 *   28/32/36/40/44px, Jul 10 three-bubble collision stack with '$27.98'
 *   caption), and REVIEW/KEEP/RECLAIMED verdict sections of 72px
 *   VerdictRailRows. Signature move: dragging a row across the 3-zone
 *   verdict rail (right +72 Keep · left −72 Pause · left −144 Cancel) — or
 *   the mandatory 44×44 Decide actionSheet, or the detail sheet's segmented
 *   control — calls ONE setVerdict that simultaneously re-buckets the row,
 *   rolls the odometer, dims-and-lifts the horizon bubbles, re-tallies the
 *   Audit tab badge, the Calendar's next-30 summary, and the Savings list,
 *   and lands an undo-over-confirm toast (no confirms, no timers).
 * @position Page template; emitted by \`astryx template mobile-subscription-audit\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, detail sheet, Decide
 *   actionSheet, toast) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While a sheet/actionSheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close;
 *   the toast dock rides IN FLOW as a sticky bottom:76 block when no
 *   overlay is open (sticky-dock amendment) and flips to shell-absolute
 *   only while the shell is scroll-locked.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 72 for media rows: 16 pad + 44
 *   tile + 12 gap); no desktop Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Prune violet #7C3AED — the demo --color-brand is the
 *   demo logo blue, so the spec hex is quarantined per house rule); every
 *   other literal is a light-dark() pair with contrast math at the
 *   declaration, including the ≥3:1-vs-actual-surface pairs demanded by
 *   the interactive-boundary amendment (bubble borders, switch off-track).
 * Density grid (MOBILE, repeated verbatim): stage 390px, fluid 320–430,
 *   no width:390 literals · 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps. navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', center 17px/600 ellipsized
 *   200px max, hairline ALWAYS ON — chosen and noted). largeTitle row 52px
 *   in flow ('Audit' 28px/700 at the 16px gutter; total large header
 *   104px; navBar title fades in via IntersectionObserver sentinel).
 *   savingsMeter 56px sticky top:52 z19. horizonStrip 96px in flow.
 *   tabBar 64px sticky bottom z20 (4 tabItems flex:1, 24px icon over
 *   11px/500 label, 4px gap; badge 16px min-width brand pill 10px/600 at
 *   top:-4 right:-8). Rows: 72px media row (44px logo tile r12 ·
 *   two-line 16px/500 + 13px/400 stack · trailing DeltaChip + 44×44
 *   Decide); rowDivider inset 72, none on last. sectionHeader 13px/600
 *   uppercase 0.06em at 32px, 20px top / 8px bottom. Type: 28/700 ·
 *   22/700 odometer · 17/600 · 16/400 body floor · 13/400 meta · 11/500
 *   overlines; nothing under 11px; tabular-nums on every price. Buttons:
 *   48px primary, 36px secondary/segmented, 44×44 icon. Sheet: detents
 *   55% / calc(100% − 56px), 24px grabber zone (36×5 pill), 52px header,
 *   body the one legal inner scroller. Touch: every target ≥44×44 or
 *   merged full-row; every gesture has a visible button path (row drag ↔
 *   Decide actionSheet; sheet drag ↔ grabber/X/Escape; horizon scroll ↔
 *   arrow keys + Tab-able bubbles).
 *
 * Responsive contract:
 * - Fluid 320–430px: all cards fluid at the 16px gutter; name column
 *   flex:1 minWidth:0 ellipsizes before the trailing cluster (minWidth 92
 *   reserved); meter's /yr figure wraps under /mo at ≤340 via flexWrap;
 *   horizonStrip scrolls (intrinsic 60×44px columns inside overflowX
 *   auto); tabBar labels stay 11px. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the verdict-rail anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronRightIcon,
  ListChecksIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PiggyBankIcon,
  RefreshCwIcon,
  SearchXIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math in a comment. Amendment honored: interactive boundaries and
// meaningful rest fills carry ≥3:1 pairs vs their ACTUAL surface.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Prune violet). #7C3AED on #FFFFFF ≈ 6.2:1;
// #C4B5FD on the dark card (~#1C1C1E) ≈ 9.0:1 — both pass 4.5:1 as text.
const BRAND_ACCENT = 'light-dark(#7C3AED, #C4B5FD)';
// Text over a BRAND_ACCENT fill (Keep zone label, NOW pill, badge). Light:
// #FFFFFF on #7C3AED ≈ 6.2:1. Dark: white on #C4B5FD fails (~1.6:1), so the
// dark side flips to deep violet — #2E1065 on #C4B5FD ≈ 9.6:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #2E1065)';
// Brand-tinted wash for the active segmented pill / active tab tint.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Horizon bubble REST FILL — spec's 18% light / 30% dark wash. The wash
// alone is ~1.35:1 vs the body background, so per the boundary amendment
// every bubble also carries a 1px solid BRAND_ACCENT border: #7C3AED vs
// #FFFFFF ≈ 6.2:1 and #C4B5FD vs ~#1a1a1a ≈ 9.0:1 — both ≥3:1 against the
// actual strip surface in their scheme.
const BUBBLE_FILL = 'light-dark(rgba(124, 58, 237, 0.18), rgba(196, 181, 253, 0.30))';
// Price text INSIDE a bubble, measured against the blended wash (light wash
// over white ≈ #E7DBFC; dark wash over #1a1a1a ≈ #4D485E): #4C1D95 on
// #E7DBFC ≈ 9.6:1; #EDE9FE on #4D485E ≈ 7.3:1.
const BUBBLE_TEXT = 'light-dark(#4C1D95, #EDE9FE)';
// Pause drag-zone fill (spec pair) + its label text: #FFFFFF on #B45309 ≈
// 4.7:1; #451A03 on #F59E0B ≈ 8.6:1.
const PAUSE_FILL = 'light-dark(#B45309, #F59E0B)';
const PAUSE_FILL_TEXT = 'light-dark(#FFFFFF, #451A03)';
// Cancel zone / destructive fill: #C92A2A on white ≈ 5.5:1; #FF8787 on the
// dark card ≈ 7.4:1. Label text over it: #FFFFFF on #C92A2A ≈ 5.5:1;
// #300808 on #FF8787 ≈ 7.8:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// Reclaimed DeltaChip green text on the CARD surface: #15803D on #FFFFFF ≈
// 5.0:1; #4ADE80 on ~#1C1C1E ≈ 8.9:1.
const GREEN_TEXT = 'light-dark(#15803D, #4ADE80)';
// Switch OFF track — a meaningful rest fill, so it needs ≥3:1 vs the card
// it sits on (amendment; the foundations' 14% wash fails at ~1.35:1):
// #8A8578 vs #FFFFFF ≈ 3.4:1; #7C7C85 vs ~#1C1C1E ≈ 3.6:1.
const SWITCH_OFF = 'light-dark(#8A8578, #7C7C85)';
// Sheet/actionSheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden text,
// odometer/sheet/bubble motion, skeleton shimmer, reduced-motion guard.
// Transitions animate transform/opacity only and collapse to instant under
// prefers-reduced-motion (shimmer is REMOVED entirely).
// ---------------------------------------------------------------------------

const PRUNE_CSS = \`
.prn-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.prn-btn:disabled { cursor: default; }
.prn-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.prn-fade { transition: opacity 200ms ease; }
.prn-odom { transition: transform 200ms ease; }
@keyframes prn-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.prn-sheet-in { animation: prn-sheet-in 200ms ease; }
@keyframes prn-row-in {
  from { transform: translateY(-4px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.prn-row-in { animation: prn-row-in 200ms ease; }
@keyframes prn-bubble-dim {
  0% { transform: none; }
  50% { transform: translateY(-8px); }
  100% { transform: none; }
}
.prn-bubble-dim { animation: prn-bubble-dim 200ms ease; }
@keyframes prn-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.prn-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-text-primary) 7%, transparent),
    transparent
  );
  animation: prn-shimmer 1.6s linear infinite;
}
.prn-vh {
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
  .prn-fade, .prn-odom { transition: none; }
  .prn-sheet-in, .prn-row-in, .prn-bubble-dim { animation: none; }
  .prn-shimmer { animation: none; display: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries alone
  // cannot tell the two stages apart).
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
  // Scroll lock while a sheet/actionSheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, paddingInline 8, grid '1fr auto 1fr'.
  // Hairline + blur ALWAYS ON (chosen; scroll-under not wired — noted).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    margin: 0,
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LARGE TITLE — 52px row in flow below the navBar (total header 104px).
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  refreshCaption: {
    paddingInline: 16,
    paddingBottom: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // SAVINGS METER — 56px pinned block, sticky top:52, z19 (under navBar),
  // same blur surface + bottom hairline.
  meterBlock: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  meterInner: {display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1},
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // /yr wraps below /mo at ≤340px via flexWrap (responsive contract).
  odomRow: {
    display: 'flex',
    alignItems: 'baseline',
    columnGap: 8,
    flexWrap: 'wrap',
  },
  // Odometer digit-count change (stress 4: $13.98 → $455.76) cannot shift
  // layout: tabular-nums + reserved minWidth in ch.
  odomMain: {
    display: 'inline-flex',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    minWidth: '7.5ch',
  },
  odomCell: {
    display: 'inline-block',
    height: 26,
    overflow: 'hidden',
    lineHeight: '26px',
  },
  odomStrip: {display: 'flex', flexDirection: 'column'},
  odomDigit: {height: 26, lineHeight: '26px'},
  odomYr: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // HORIZON STRIP — 96px, overflowX auto, snap x proximity, 44px columns.
  horizonStrip: {
    height: 96,
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
    paddingInline: 16,
    marginBottom: 8,
  },
  dayCol: {
    position: 'relative',
    width: 44,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    scrollSnapAlign: 'start',
  },
  // Label block trimmed to 12+18px so bubbleArea gets 52px: the Jul 10
  // coin-stack (40@0 → top 40, 32@14 → top 46, 28@24 → top 52) fits with
  // 6px visible crescents per underlying bubble.
  dayWk: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    lineHeight: '12px',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '18px',
    fontVariantNumeric: 'tabular-nums',
    width: 24,
    height: 18,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
  },
  dayNumToday: {border: \`1px solid \${BRAND_ACCENT}\`, color: BRAND_ACCENT},
  bubbleArea: {
    position: 'relative',
    width: 44,
    flex: 1,
    minHeight: 0,
  },
  bubbleBtn: {
    position: 'absolute',
    left: 0,
    width: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
  },
  bubble: {
    borderRadius: '50%',
    background: BUBBLE_FILL,
    border: \`1px solid \${BRAND_ACCENT}\`,
    display: 'grid',
    placeItems: 'center',
    color: BUBBLE_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  bubbleDimmed: {opacity: 0.35, textDecoration: 'line-through'},
  dayTotal: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    lineHeight: '14px',
    whiteSpace: 'nowrap',
  },
  // LIST LANGUAGE — inset-grouped cards, 12px radius, hairline dividers.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // rowDivider inset 72 = 16 pad + 44 tile + 12 gap; none on last row.
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 72},
  // VERDICT RAIL ROW — 72px media row over a revealed drag rail.
  rowOuter: {position: 'relative', overflow: 'hidden'},
  zoneLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
  },
  zoneRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 72,
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  logoTile: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 700,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
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
  rowDimmed: {opacity: 0.6},
  // Trailing cluster reserves minWidth 92 (responsive contract).
  rowTrailing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minWidth: 92,
    flexShrink: 0,
    paddingInlineEnd: 4,
  },
  deltaChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: GREEN_TEXT,
    whiteSpace: 'nowrap',
  },
  deltaChipZero: {color: 'var(--color-text-secondary)'},
  decideBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // SKELETON — 72px rows impersonating VerdictRailRows; zero-shift.
  skeletonRow: {
    position: 'relative',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    overflow: 'hidden',
  },
  skeletonTile: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  skeletonLines: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // EMPTY STATE — true-empty variant, zero actions (spec stress 5).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 32,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 0',
  },
  terminalCaption: {
    margin: '16px 0 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TAB BAR — 64px sticky bottom z20, 4 flex:1 tabItems.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow above the tabBar (amendment); flips to
  // shell-absolute only while the shell is scroll-locked under an overlay.
  toastDockSticky: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    insetInline: 0,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockAbs: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41; two detents.
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
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
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    maxWidth: 200,
    justifySelf: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 16px',
  },
  // Segmented verdict control — 36px radiogroup track.
  segTrack: {
    display: 'flex',
    height: 36,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    padding: 2,
    gap: 2,
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  sheetMetaRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
  },
  sheetMetaLabel: {flex: 1, minWidth: 0, color: 'var(--color-text-secondary)', fontSize: 16},
  sheetMetaValue: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  historyRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  historyBarWrap: {
    flex: 1,
    minWidth: 0,
    height: 6,
    borderRadius: 3,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  historyBar: {height: '100%', borderRadius: 3, background: BRAND_ACCENT},
  // ACTION SHEET — two stacked cards, insetInline 16 bottom 16, z41.
  actionSheetWrap: {
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
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  asDivider: {height: 1, background: 'var(--color-border)'},
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  asRowDestructive: {color: ERROR_STRONG},
  asCancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  // CALENDAR TAB
  sumRow: {
    minHeight: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
    paddingBlock: 8,
  },
  sumPrimary: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  sumSecondary: {fontSize: 13, color: 'var(--color-text-secondary)'},
  chargeRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  chargeText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  chargeChip: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '1px 6px',
    flexShrink: 0,
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SAVINGS TAB
  heroCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  heroAnnual: {fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
  heroMonthly: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // SETTINGS TAB
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    padding: 2,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — ARITHMETIC LEDGER, all sums pre-verified by hand. One frozen
// "today" (TODAY_LABEL, no Date()). Monthly cents: 1599+1099+1250+299+800+
// 1699+999+599+2400+399+2000+650 = 13,793¢ = $137.93/mo → ×12 = $1,655.16/yr.
// Initial verdicts: keep×4, review×6 (Audit badge '6'), cancel×2 (LensPro
// 999 + FocusTimer 399 = 1,398¢ = $13.98/mo → $167.76/yr ✓ = LensPro
// $119.88/yr + FocusTimer $47.88/yr). Next-30-days (Jul 6–Aug 4, active
// only): 1599+800+1099+1250+2400+1699+599+299+2000 = 11,745¢ = $117.45
// across 9 charges ✓ (FocusTimer Jul 10 + LensPro Aug 3 excluded as
// canceled; PetCam's Aug 6 falls outside). Demo verdict math: cancel
// MealKit → chip +$288.00/yr (2400×12), meter 1398+2400 = 3,798¢/mo =
// $455.76/yr ✓, badge 6→5, next-30 11745−2400 = $93.45; pause GameBox →
// +$203.88/yr, meter 3798+1699 = 5,497¢/mo = $659.64/yr ✓. All-cancel
// sweep: meter $137.93/mo / $1,655.16/yr ✓.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Mon, Jul 6';

type Verdict = 'keep' | 'review' | 'pause' | 'cancel';
type TabId = 'audit' | 'calendar' | 'savings' | 'settings';

// Per-service monogram tile pairs — text on tile ≥7:1 in both schemes
// (e.g. #991B1B on #FEE2E2 ≈ 7.6:1; #FECACA on #7F1D1D ≈ 8.2:1).
const TILE_PAIRS: ReadonlyArray<{bg: string; fg: string}> = [
  {bg: 'light-dark(#FEE2E2, #7F1D1D)', fg: 'light-dark(#991B1B, #FECACA)'},
  {bg: 'light-dark(#FFEDD5, #7C2D12)', fg: 'light-dark(#9A3412, #FED7AA)'},
  {bg: 'light-dark(#DCFCE7, #14532D)', fg: 'light-dark(#166534, #BBF7D0)'},
  {bg: 'light-dark(#CCFBF1, #134E4A)', fg: 'light-dark(#115E59, #99F6E4)'},
  {bg: 'light-dark(#DBEAFE, #1E3A8A)', fg: 'light-dark(#1E40AF, #BFDBFE)'},
  {bg: 'light-dark(#EDE9FE, #4C1D95)', fg: 'light-dark(#5B21B6, #DDD6FE)'},
];

interface Subscription {
  id: string;
  display: string;
  monogram: string;
  tile: number; // TILE_PAIRS index (id-derived: fixture position % 6)
  priceCents: number;
  priceLabel: string;
  plan: string;
  renewLabel: string; // next renewal, e.g. 'Jul 10'
  renewDayIndex: number; // first occurrence's 60-day horizon index
  histCents: [number, number, number]; // Apr / May / Jun charges
}

// sub_streamly's display name is stress fixture 1 — it must single-line
// ellipsize in the 72px row, the sheet title (200px max), the actionSheet
// context header, and the toast.
const SUBS: Subscription[] = [
  {id: 'sub_streamly', display: 'Streamly Premium Family Entertainment Bundle', monogram: 'S', tile: 0, priceCents: 1599, priceLabel: '$15.99', plan: 'Family 4K', renewLabel: 'Jul 10', renewDayIndex: 4, histCents: [1499, 1499, 1599]},
  {id: 'sub_tunecloud', display: 'Tunecloud', monogram: 'T', tile: 1, priceCents: 1099, priceLabel: '$10.99', plan: 'Premium', renewLabel: 'Jul 14', renewDayIndex: 8, histCents: [1099, 1099, 1099]},
  {id: 'sub_fitpulse', display: 'FitPulse', monogram: 'F', tile: 2, priceCents: 1250, priceLabel: '$12.50', plan: 'Coach', renewLabel: 'Jul 18', renewDayIndex: 12, histCents: [1250, 1250, 1250]},
  {id: 'sub_cloudvault', display: 'CloudVault', monogram: 'C', tile: 3, priceCents: 299, priceLabel: '$2.99', plan: '200 GB', renewLabel: 'Aug 1', renewDayIndex: 26, histCents: [299, 299, 299]},
  {id: 'sub_newswire', display: 'NewsWire', monogram: 'N', tile: 4, priceCents: 800, priceLabel: '$8.00', plan: 'Digital', renewLabel: 'Jul 10', renewDayIndex: 4, histCents: [800, 800, 800]},
  {id: 'sub_gamebox', display: 'GameBox', monogram: 'G', tile: 5, priceCents: 1699, priceLabel: '$16.99', plan: 'Ultimate', renewLabel: 'Jul 25', renewDayIndex: 19, histCents: [1699, 1699, 1699]},
  {id: 'sub_lenspro', display: 'LensPro', monogram: 'L', tile: 0, priceCents: 999, priceLabel: '$9.99', plan: 'Creator', renewLabel: 'Aug 3', renewDayIndex: 28, histCents: [999, 999, 999]},
  {id: 'sub_podplus', display: 'PodPlus', monogram: 'P', tile: 1, priceCents: 599, priceLabel: '$5.99', plan: 'Ad-free', renewLabel: 'Jul 25', renewDayIndex: 19, histCents: [599, 599, 599]},
  {id: 'sub_mealkit', display: 'MealKit Lite', monogram: 'M', tile: 2, priceCents: 2400, priceLabel: '$24.00', plan: '2 boxes / mo', renewLabel: 'Jul 21', renewDayIndex: 15, histCents: [2400, 2400, 2400]},
  {id: 'sub_focustimer', display: 'FocusTimer', monogram: 'F', tile: 3, priceCents: 399, priceLabel: '$3.99', plan: 'Pro', renewLabel: 'Jul 10', renewDayIndex: 4, histCents: [399, 399, 399]},
  {id: 'sub_designhub', display: 'DesignHub', monogram: 'D', tile: 4, priceCents: 2000, priceLabel: '$20.00', plan: 'Solo', renewLabel: 'Aug 1', renewDayIndex: 26, histCents: [2000, 2000, 2000]},
  {id: 'sub_petcam', display: 'PetCam', monogram: 'P', tile: 5, priceCents: 650, priceLabel: '$6.50', plan: 'Cloud clips', renewLabel: 'Aug 6', renewDayIndex: 31, histCents: [650, 650, 650]},
];

const SUB_BY_ID: Record<string, Subscription> = Object.fromEntries(
  SUBS.map(sub => [sub.id, sub]),
);

const INITIAL_VERDICTS: Record<string, Verdict> = {
  sub_streamly: 'keep',
  sub_tunecloud: 'keep',
  sub_fitpulse: 'review',
  sub_cloudvault: 'keep',
  sub_newswire: 'review',
  sub_gamebox: 'review',
  sub_lenspro: 'cancel',
  sub_podplus: 'review',
  sub_mealkit: 'review',
  sub_focustimer: 'cancel',
  sub_designhub: 'review',
  sub_petcam: 'keep',
};

// 60-day renewal horizon, Jul 6 (index 0) → Sep 3 (index 59). Each sub
// bills monthly on a fixed day: day-10 trio Jul 10 + Aug 10; day-1 pair
// Aug 1 + Sep 1; LensPro Aug 3 + Sep 3. DEVIATION (noted): PetCam appears
// ONCE in-window (Aug 6) — its prior charge landed today (Jul 6) before
// the window's first renewal slot and Sep 6 falls outside; including a
// Jul 6 charge would break the spec's exact next-30 law ($117.45 across
// 9 charges), so the cross-check law wins.
interface Occurrence {
  dayIndex: number;
  subId: string;
}

const OCCURRENCES: Occurrence[] = [
  {dayIndex: 4, subId: 'sub_streamly'},
  {dayIndex: 4, subId: 'sub_newswire'},
  {dayIndex: 4, subId: 'sub_focustimer'},
  {dayIndex: 8, subId: 'sub_tunecloud'},
  {dayIndex: 12, subId: 'sub_fitpulse'},
  {dayIndex: 15, subId: 'sub_mealkit'},
  {dayIndex: 19, subId: 'sub_gamebox'},
  {dayIndex: 19, subId: 'sub_podplus'},
  {dayIndex: 26, subId: 'sub_cloudvault'},
  {dayIndex: 26, subId: 'sub_designhub'},
  {dayIndex: 28, subId: 'sub_lenspro'},
  {dayIndex: 31, subId: 'sub_petcam'},
  {dayIndex: 35, subId: 'sub_streamly'},
  {dayIndex: 35, subId: 'sub_newswire'},
  {dayIndex: 35, subId: 'sub_focustimer'},
  {dayIndex: 39, subId: 'sub_tunecloud'},
  {dayIndex: 43, subId: 'sub_fitpulse'},
  {dayIndex: 46, subId: 'sub_mealkit'},
  {dayIndex: 50, subId: 'sub_gamebox'},
  {dayIndex: 50, subId: 'sub_podplus'},
  {dayIndex: 57, subId: 'sub_cloudvault'},
  {dayIndex: 57, subId: 'sub_designhub'},
  {dayIndex: 59, subId: 'sub_lenspro'},
];

// Day slots — Jul 6 2026 is a Monday (TODAY_LABEL), so weekday initials
// cycle M T W T F S S from index 0. Jul 6–31 = indices 0–25; Aug 1–31 =
// 26–56; Sep 1–3 = 57–59 (60 slots ✓, Sep 3 is slot 60).
const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySlot {
  index: number;
  weekdayInitial: string;
  weekdayName: string;
  dayNum: number;
  monthShort: string;
  label: string; // 'Jul 10'
}

const DAY_SLOTS: DaySlot[] = Array.from({length: 60}, (_, i) => {
  const monthShort = i < 26 ? 'Jul' : i < 57 ? 'Aug' : 'Sep';
  const dayNum = i < 26 ? 6 + i : i < 57 ? i - 25 : i - 56;
  return {
    index: i,
    weekdayInitial: WEEKDAY_INITIALS[i % 7],
    weekdayName: WEEKDAY_NAMES[i % 7],
    dayNum,
    monthShort,
    label: \`\${monthShort} \${dayNum}\`,
  };
});

const OCCURRENCES_BY_DAY: Map<number, Occurrence[]> = (() => {
  const map = new Map<number, Occurrence[]>();
  for (const occ of OCCURRENCES) {
    const list = map.get(occ.dayIndex) ?? [];
    list.push(occ);
    map.set(occ.dayIndex, list);
  }
  // Bubbles stack largest-at-bottom; sort each day descending by price.
  for (const list of map.values()) {
    list.sort((a, b) => SUB_BY_ID[b.subId].priceCents - SUB_BY_ID[a.subId].priceCents);
  }
  return map;
})();

const TOTAL_MONTHLY_CENTS = SUBS.reduce((sum, sub) => sum + sub.priceCents, 0); // 13793

// Bubble diameter by monthly-price tier: <$5→28, $5–9.99→32, $10–14.99→36,
// $15–19.99→40, ≥$20→44 (stress 3: MealKit $24.00 → 44px with price text).
function bubbleSize(cents: number): number {
  if (cents < 500) return 28;
  if (cents < 1000) return 32;
  if (cents < 1500) return 36;
  if (cents < 2000) return 40;
  return 44;
}

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Cents → '$1,655.16' (manual grouping; no locale drift). */
function fmtUsd(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const grouped = String(dollars).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`$\${grouped}.\${String(cents % 100).padStart(2, '0')}\`;
}

// ---------------------------------------------------------------------------
// DERIVED SELECTORS — pure functions over the one verdicts map; NEVER
// stored. One map feeds row buckets, DeltaChips, the meter odometer, the
// horizon bubble dimming, the Audit badge, Calendar dimming + next-30
// summary, the Savings list, and the open sheet's segmented control.
// ---------------------------------------------------------------------------

function isReclaimed(verdict: Verdict): boolean {
  return verdict === 'pause' || verdict === 'cancel';
}

function reclaimedMonthlyCents(verdicts: Record<string, Verdict>): number {
  return SUBS.reduce(
    (sum, sub) => (isReclaimed(verdicts[sub.id]) ? sum + sub.priceCents : sum),
    0,
  );
}

function reviewCount(verdicts: Record<string, Verdict>): number {
  return SUBS.reduce((n, sub) => (verdicts[sub.id] === 'review' ? n + 1 : n), 0);
}

/** Next-30-days spend (horizon indices 0–29 = Jul 6–Aug 4), active only. */
function next30(verdicts: Record<string, Verdict>): {cents: number; count: number} {
  let cents = 0;
  let count = 0;
  for (const occ of OCCURRENCES) {
    if (occ.dayIndex > 29) continue;
    if (isReclaimed(verdicts[occ.subId])) continue;
    cents += SUB_BY_ID[occ.subId].priceCents;
    count += 1;
  }
  return {cents, count};
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePruneStore(): flat state + one update(patch); every
// surface commits through setVerdict/undo helpers built on it. Verdicts
// execute IMMEDIATELY (undo-over-confirm; no confirm dialogs, no timers).
// ---------------------------------------------------------------------------

interface ToastState {
  seq: number;
  msg: string;
  undoTo: {subId: string; prevVerdict: Verdict} | null;
}

interface AuditState {
  verdicts: Record<string, Verdict>;
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  sheetSubId: string | null;
  sheetDetent: 'medium' | 'large';
  actionSheetSubId: string | null;
  drag: {subId: string; dx: number} | null;
  toast: ToastState | null;
  refreshState: 'idle' | 'skeleton' | 'updated';
  remindersOn: boolean;
}

const INITIAL_STATE: AuditState = {
  verdicts: INITIAL_VERDICTS,
  tab: 'audit',
  scrollByTab: {audit: 0, calendar: 0, savings: 0, settings: 0},
  sheetSubId: null,
  sheetDetent: 'medium',
  actionSheetSubId: null,
  drag: null,
  toast: null,
  refreshState: 'idle',
  remindersOn: true,
};

function usePruneStore() {
  const [state, setState] = useState<AuditState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<AuditState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  return {state, setState, update};
}

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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — overlays trap focus; Escape closes the topmost only;
// focus restores to the opener on every close path; focus INTO an opening
// overlay always uses {preventScroll: true} (amendment — plain .focus()
// scroll-reveals the animating sheet inside the locked column).
// ---------------------------------------------------------------------------

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (focusables.length === 0) return;
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

/** Nearest scrollable ancestor (the demo's .preview-wrap owns page scroll). */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el != null) {
    const style = window.getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// BRAND MARK — snipped-loop 'p' in a 44×44 non-button nav slot; aria-hidden
// (the brand name rides visually hidden inside the h1).
// ---------------------------------------------------------------------------

function PruneMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Stem of the 'p'. */}
        <path d="M7.5 6.5v13.5" stroke="var(--color-text-primary)" strokeWidth={2.2} strokeLinecap="round" />
        {/* Snipped loop — the bowl of the 'p' with a pruned gap at 4 o'clock. */}
        <path
          d="M7.5 8.6a5.1 5.1 0 0 1 9.4 2.8 5.1 5.1 0 0 1-3.2 4.7"
          stroke="var(--color-text-primary)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        {/* The snipped-off twig falling away. */}
        <path d="M16.4 18.9l1.9 1.6" stroke="var(--color-text-primary)" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SAVINGS METER ODOMETER — 56px pinned block. Digits roll as per-character
// translateY columns (200ms; instant swap under reduced motion). The meter
// digits are aria-hidden with ONE visually-hidden combined label; verdict
// changes are ANNOUNCED by the single toastDock live region, never here.
// Stress 4: '$13.98' → '$455.76' gains a digit column without layout shift
// (tabular-nums + minWidth '7.5ch' reserved on the 22px line).
// ---------------------------------------------------------------------------

const ODOM_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function OdometerChar({char, reducedMotion}: {char: string; reducedMotion: boolean}) {
  if (!/\\d/.test(char)) {
    return <span style={styles.odomCell}>{char}</span>;
  }
  const digit = Number(char);
  return (
    <span style={styles.odomCell}>
      <span
        className={reducedMotion ? undefined : 'prn-odom'}
        style={{...styles.odomStrip, transform: \`translateY(\${-digit * 26}px)\`}}>
        {ODOM_DIGITS.map(d => (
          <span key={d} style={styles.odomDigit}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

interface SavingsMeterProps {
  monthlyCents: number; // committed or drag-preview value
  isPreview: boolean;
  reducedMotion: boolean;
}

function SavingsMeterOdometer({monthlyCents, isPreview, reducedMotion}: SavingsMeterProps) {
  const monthly = fmtUsd(monthlyCents);
  const annual = fmtUsd(monthlyCents * 12);
  return (
    <div style={styles.meterBlock}>
      <div style={styles.meterInner}>
        <span style={styles.overline}>{isPreview ? 'Reclaimed · preview' : 'Reclaimed'}</span>
        <span className="prn-vh">{\`Reclaimed \${monthly} per month, \${annual} per year\`}</span>
        <div style={styles.odomRow} aria-hidden>
          <span style={styles.odomMain}>
            {monthly.split('').map((char, i) => (
              <OdometerChar key={\`\${i}-\${monthly.length}\`} char={char} reducedMotion={reducedMotion} />
            ))}
            <span style={styles.odomCell}>/mo</span>
          </span>
          <span style={styles.odomYr}>{annual}/yr</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DELTA CHIP — 20px pill in the row's 44px trailing cluster. Non-interactive
// and aria-hidden; its value is repeated in the row's accessible name.
// Green pair math at GREEN_TEXT declaration (5.0:1 light / 8.9:1 dark).
// ---------------------------------------------------------------------------

function DeltaChip({sub, verdict}: {sub: Subscription; verdict: Verdict}) {
  const reclaimed = isReclaimed(verdict);
  return (
    <span
      style={reclaimed ? styles.deltaChip : {...styles.deltaChip, ...styles.deltaChipZero}}
      aria-hidden>
      {reclaimed ? \`+\${fmtUsd(sub.priceCents * 12)}/yr back\` : '$0'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// RENEWAL HORIZON STRIP — 96px rail, 60 44px day columns, overflowX auto,
// snap x proximity. Bubbles are REAL buttons (Tab-reachable) sized by price
// tier; collision days stack largest-at-bottom with 7px peek offsets and a
// day-total caption (Jul 10: 40+32+28px bubbles, caption 1599+800+399 =
// $27.98 ✓ — stress 2, column never exceeds 44px). Keyboard: the rail is
// focusable; ArrowLeft/Right scroll by one 44px day.
// ---------------------------------------------------------------------------

interface HorizonStripProps {
  verdicts: Record<string, Verdict>;
  lastChangedSubId: string | null;
  reducedMotion: boolean;
  onBubbleTap: (subId: string, opener: HTMLElement) => void;
}

function RenewalHorizonStrip({verdicts, lastChangedSubId, reducedMotion, onBubbleTap}: HorizonStripProps) {
  return (
    <div
      style={styles.horizonStrip}
      role="group"
      aria-label="Renewal horizon, next 60 days. Arrow keys scroll."
      tabIndex={0}
      className="prn-focusable"
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          event.currentTarget.scrollBy({
            left: event.key === 'ArrowRight' ? 44 : -44,
            behavior: reducedMotion ? 'auto' : 'smooth',
          });
        }
      }}>
      {DAY_SLOTS.map(day => {
        const occs = OCCURRENCES_BY_DAY.get(day.index) ?? [];
        const dayTotal = occs.reduce((sum, occ) => sum + SUB_BY_ID[occ.subId].priceCents, 0);
        // Coin-stack offsets: largest at bottom 0; each smaller bubble is
        // raised so a 6px crescent of the one below stays visible
        // (Jul 10: 40@0, 32@14, 28@24 — top edge 52 = the bubbleArea).
        const bottoms: number[] = [];
        let prevTop = 0;
        for (let k = 0; k < occs.length; k++) {
          const size = bubbleSize(SUB_BY_ID[occs[k].subId].priceCents);
          const bottom = k === 0 ? 0 : Math.max(0, prevTop - size + 6);
          bottoms.push(bottom);
          prevTop = bottom + size;
        }
        return (
          <div key={day.index} style={styles.dayCol}>
            <span style={styles.dayWk} aria-hidden>
              {day.weekdayInitial}
            </span>
            <span
              style={day.index === 0 ? {...styles.dayNum, ...styles.dayNumToday} : styles.dayNum}
              aria-hidden>
              {day.dayNum}
            </span>
            <div style={styles.bubbleArea}>
              {occs.map((occ, k) => {
                const sub = SUB_BY_ID[occ.subId];
                const size = bubbleSize(sub.priceCents);
                const dimmed = isReclaimed(verdicts[sub.id]);
                const single = occs.length === 1;
                return (
                  <button
                    key={\`\${occ.subId}-\${occ.dayIndex}\`}
                    type="button"
                    className={\`prn-btn prn-focusable prn-fade\${
                      dimmed && sub.id === lastChangedSubId ? ' prn-bubble-dim' : ''
                    }\`}
                    style={{
                      ...styles.bubbleBtn,
                      bottom: single ? 0 : bottoms[k],
                      height: single ? 44 : size,
                      zIndex: k + 1,
                      ...(dimmed ? {opacity: 0.35} : null),
                    }}
                    aria-label={\`\${sub.display}, \${sub.priceLabel} on \${day.label}\${
                      dimmed ? ', reclaimed' : ''
                    } — open details\`}
                    onClick={event => onBubbleTap(sub.id, event.currentTarget)}>
                    <span
                      style={{
                        ...styles.bubble,
                        width: size,
                        height: size,
                        ...(dimmed ? {textDecoration: 'line-through'} : null),
                      }}>
                      {size >= 36 ? sub.priceLabel : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <span style={styles.dayTotal} aria-hidden>
              {occs.length > 1 ? fmtUsd(dayTotal) : '\xA0'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VERDICT RAIL ROW — 72px media row. Horizontal pointer drag translates the
// row over a revealed verdict rail: right +72 = Keep (BRAND block), left
// −72 = Pause (amber), left −144 = Cancel (error) — the revealed block
// deepens Pause→Cancel as the drag crosses −128 (crossing live-updates the
// DeltaChip and previews the meter); release past threshold commits
// IMMEDIATELY (undo-over-confirm, no dialog). MANDATORY fallback: trailing
// 44×44 Decide button opens the identical actionSheet. Drag is disabled
// under reduced motion (buttons remain the full path).
// ---------------------------------------------------------------------------

function zoneFor(dx: number): Verdict | null {
  if (dx >= 56) return 'keep';
  if (dx <= -128) return 'cancel';
  if (dx <= -56) return 'pause';
  return null;
}

interface VerdictRailRowProps {
  sub: Subscription;
  verdict: Verdict;
  dragDx: number | null; // non-null only while THIS row drags
  dragEnabled: boolean;
  animateIn: boolean;
  reducedMotion: boolean;
  onDragMove: (subId: string, dx: number) => void;
  onDragEnd: (subId: string, commit: Verdict | null) => void;
  onOpenSheet: (subId: string, opener: HTMLElement) => void;
  onOpenActionSheet: (subId: string, opener: HTMLElement) => void;
}

function VerdictRailRow(props: VerdictRailRowProps) {
  const {sub, verdict, dragDx, dragEnabled, animateIn, reducedMotion, onDragMove, onDragEnd, onOpenSheet, onOpenActionSheet} = props;
  const startXRef = useRef<number | null>(null);
  const movedRef = useRef(false);
  const lastDxRef = useRef(0);

  const dx = dragDx ?? 0;
  const zone = zoneFor(dx);
  const chipVerdict = zone ?? verdict;
  const leftWidth = Math.max(0, dx);
  const rightWidth = Math.max(0, -dx);
  const rightIsCancel = zone === 'cancel';

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragEnabled || event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    lastDxRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startXRef.current == null) return;
    const raw = event.clientX - startXRef.current;
    const clamped = Math.max(-160, Math.min(88, raw));
    if (Math.abs(raw) > 8) movedRef.current = true;
    if (movedRef.current) {
      lastDxRef.current = clamped;
      onDragMove(sub.id, clamped);
    }
  };
  const handlePointerEnd = () => {
    if (startXRef.current == null) return;
    startXRef.current = null;
    if (movedRef.current) {
      onDragEnd(sub.id, zoneFor(lastDxRef.current));
    }
  };

  const secondary =
    verdict === 'cancel'
      ? \`Canceled · \${sub.priceLabel}/mo freed\`
      : verdict === 'pause'
        ? \`Paused · \${sub.priceLabel}/mo held\`
        : \`\${sub.priceLabel}/mo · renews \${sub.renewLabel}\`;
  const accessibleName =
    verdict === 'review'
      ? \`\${sub.display}, \${sub.priceLabel} per month, renews \${sub.renewLabel}, under review\`
      : verdict === 'keep'
        ? \`\${sub.display}, \${sub.priceLabel} per month, renews \${sub.renewLabel}, kept\`
        : \`\${sub.display}, \${verdict === 'pause' ? 'paused' : 'canceled'}, \${fmtUsd(sub.priceCents * 12)} per year back\`;
  const tile = TILE_PAIRS[sub.tile];

  return (
    <div style={styles.rowOuter} className={animateIn ? 'prn-row-in' : undefined}>
      {/* Keep zone — BRAND fill; label pair math at BRAND_FILL_TEXT. */}
      <div style={{...styles.zoneLeft, width: Math.max(leftWidth, 72), transform: \`translateX(\${Math.min(0, leftWidth - 72)}px)\`}} aria-hidden>
        <Icon icon={CheckIcon} size="sm" />
        <span>Keep</span>
      </div>
      {/* Pause→Cancel zone — deepens at −128 (crossing updates chip+meter). */}
      <div
        style={{
          ...styles.zoneRight,
          width: Math.max(rightWidth, 72),
          transform: \`translateX(\${Math.max(0, 72 - rightWidth)}px)\`,
          background: rightIsCancel ? ERROR_STRONG : PAUSE_FILL,
          color: rightIsCancel ? ERROR_FILL_TEXT : PAUSE_FILL_TEXT,
        }}
        aria-hidden>
        <Icon icon={rightIsCancel ? XIcon : PauseIcon} size="sm" />
        <span>{rightIsCancel ? 'Cancel' : 'Pause'}</span>
      </div>
      <div
        style={{
          ...styles.rowContent,
          transform: dx === 0 ? undefined : \`translateX(\${dx}px)\`,
          transition: dragDx != null || reducedMotion ? 'none' : 'transform 200ms ease',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={event => {
          if (movedRef.current) {
            event.preventDefault();
            event.stopPropagation();
            movedRef.current = false;
          }
        }}>
        <button
          type="button"
          className="prn-btn prn-focusable"
          style={verdict === 'cancel' ? {...styles.rowBtn, ...styles.rowDimmed} : styles.rowBtn}
          aria-label={\`\${accessibleName} — open details\`}
          onClick={event => onOpenSheet(sub.id, event.currentTarget)}>
          <span style={{...styles.logoTile, background: tile.bg, color: tile.fg}} aria-hidden>
            {sub.monogram}
          </span>
          <span style={styles.rowText}>
            <span style={styles.rowPrimary}>{sub.display}</span>
            <span style={styles.rowSecondary}>{secondary}</span>
          </span>
        </button>
        <span style={verdict === 'cancel' ? {...styles.rowTrailing, ...styles.rowDimmed} : styles.rowTrailing}>
          <DeltaChip sub={sub} verdict={chipVerdict} />
          <button
            type="button"
            className="prn-btn prn-focusable"
            style={styles.decideBtn}
            aria-label={\`Decide for \${sub.display}\`}
            onClick={event => onOpenActionSheet(sub.id, event.currentTarget)}>
            <Icon icon={MoreHorizontalIcon} size="sm" />
          </button>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETON — 4 rows at the SAME 72px geometry as VerdictRailRow (44px
// square r12 tile, 12px bars); deterministic widths 60/45/70/60 + 40/55/
// 30/40; ONE shared shimmer sweep, REMOVED under reduced motion. Reached
// only by the RefreshCw press; resolves on the next press (no timers).
// ---------------------------------------------------------------------------

const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

function SkeletonCard() {
  return (
    <div style={{...styles.listCard, position: 'relative'}} aria-busy>
      {SKELETON_PRIMARY.map((primary, i) => (
        <div key={primary + i} aria-hidden>
          {i > 0 ? <div style={styles.rowDivider} /> : null}
          <div style={styles.skeletonRow}>
            <span style={styles.skeletonTile} />
            <span style={styles.skeletonLines}>
              <span style={{...styles.skeletonBar, width: primary}} />
              <span style={{...styles.skeletonBar, width: SKELETON_SECONDARY[i]}} />
            </span>
          </div>
        </div>
      ))}
      <span className="prn-shimmer" aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATE — true-empty variant, ZERO actions (stress 5): 64px muted
// circle, 28px icon naming the missing thing, one-line title, two-line body.
// ---------------------------------------------------------------------------

interface EmptyBlockProps {
  icon: typeof SearchXIcon;
  title: string;
  body: string;
}

function EmptyBlock({icon, title, body}: EmptyBlockProps) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>
        <Icon icon={icon} size="lg" />
      </span>
      <p style={styles.emptyTitle}>{title}</p>
      <p style={styles.emptyBody}>{body}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL SHEET — two detents (55% / calc(100% − 56px)); grabber button
// toggles; body is the ONE legal inner scroller. The segmented verdict
// radiogroup calls the SAME setVerdict as drag + actionSheet, so the open
// sheet re-renders live when the meter/badge move. Focus: grabber receives
// focus({preventScroll:true}) on open; Tab trapped; Escape/X/scrim close
// and restore the opener.
// ---------------------------------------------------------------------------

const VERDICT_OPTIONS: Array<{value: Verdict; label: string}> = [
  {value: 'keep', label: 'Keep'},
  {value: 'pause', label: 'Pause'},
  {value: 'cancel', label: 'Cancel'},
];

const HIST_LABELS = ['Apr', 'May', 'Jun'];

interface DetailSheetProps {
  sub: Subscription;
  verdict: Verdict;
  detent: 'medium' | 'large';
  grabberRef: RefObject<HTMLButtonElement | null>;
  onToggleDetent: () => void;
  onClose: () => void;
  onSetVerdict: (subId: string, verdict: Verdict) => void;
}

function DetailSheet({sub, verdict, detent, grabberRef, onToggleDetent, onClose, onSetVerdict}: DetailSheetProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const maxHist = Math.max(...sub.histCents);
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal
      aria-labelledby="prn-sheet-title"
      className="prn-sheet-in"
      style={{...styles.sheet, ...(detent === 'large' ? styles.sheetLarge : styles.sheetMedium)}}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
          return;
        }
        trapTabKey(event, rootRef.current);
      }}>
      <div style={styles.grabberZone}>
        <button
          ref={grabberRef}
          type="button"
          className="prn-btn prn-focusable"
          style={{width: 44, height: 24, display: 'grid', placeItems: 'center'}}
          aria-label={detent === 'medium' ? 'Resize sheet, expand' : 'Resize sheet, collapse'}
          onClick={onToggleDetent}>
          <span style={styles.grabberPill} />
        </button>
      </div>
      <div style={styles.sheetHeader}>
        <span />
        <h2 id="prn-sheet-title" style={styles.sheetTitle}>
          {sub.display}
        </h2>
        <button
          type="button"
          className="prn-btn prn-focusable"
          style={styles.iconBtn}
          aria-label="Close details"
          onClick={onClose}>
          <Icon icon={XIcon} size="sm" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div role="radiogroup" aria-label={\`Verdict for \${sub.display}\`} style={styles.segTrack}>
          {VERDICT_OPTIONS.map(option => {
            const checked = verdict === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={checked}
                className="prn-btn prn-focusable"
                style={checked ? {...styles.segBtn, ...styles.segBtnActive} : styles.segBtn}
                onClick={() => onSetVerdict(sub.id, option.value)}
                onKeyDown={event => {
                  const idx = VERDICT_OPTIONS.findIndex(o => o.value === option.value);
                  let next = -1;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (idx + 1) % 3;
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (idx + 2) % 3;
                  if (next >= 0) {
                    event.preventDefault();
                    onSetVerdict(sub.id, VERDICT_OPTIONS[next].value);
                  }
                }}>
                {option.label}
              </button>
            );
          })}
        </div>
        <div style={styles.sheetMetaRow}>
          <span style={styles.sheetMetaLabel}>Plan</span>
          <span style={styles.sheetMetaValue}>{sub.plan}</span>
        </div>
        <div style={styles.sheetMetaRow}>
          <span style={styles.sheetMetaLabel}>Monthly price</span>
          <span style={styles.sheetMetaValue}>{sub.priceLabel}/mo</span>
        </div>
        <div style={styles.sheetMetaRow}>
          <span style={styles.sheetMetaLabel}>Next charge</span>
          <span style={styles.sheetMetaValue}>
            {isReclaimed(verdict) ? (verdict === 'pause' ? 'Paused' : 'None — canceled') : sub.renewLabel}
          </span>
        </div>
        <div style={styles.sheetMetaRow}>
          <span style={styles.sheetMetaLabel}>Annual cost</span>
          <span style={styles.sheetMetaValue}>{fmtUsd(sub.priceCents * 12)}/yr</span>
        </div>
        <p style={{...styles.overline, margin: '12px 0 4px'}}>Price history</p>
        {HIST_LABELS.map((label, i) => (
          <div key={label} style={styles.historyRow}>
            <span style={{width: 28, flexShrink: 0}}>{label}</span>
            <span style={styles.historyBarWrap}>
              <span
                style={{
                  ...styles.historyBar,
                  width: \`\${Math.round((sub.histCents[i] / maxHist) * 100)}%\`,
                  display: 'block',
                }}
              />
            </span>
            <span style={{flexShrink: 0}}>
              {fmtUsd(sub.histCents[i])}
              {i > 0 && sub.histCents[i] > sub.histCents[i - 1] ? ' · increase' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DECIDE ACTION SHEET — the drag rail's identical button path. Two stacked
// cards (options + separate Cancel card); context header names the object;
// destructive 'Cancel subscription' is the LAST option row; first focus on
// the safe Cancel card ({preventScroll:true}); choosing any row closes.
// ---------------------------------------------------------------------------

interface DecideActionSheetProps {
  sub: Subscription;
  cancelRef: RefObject<HTMLButtonElement | null>;
  onPick: (verdict: Verdict) => void;
  onClose: () => void;
}

function DecideActionSheet({sub, cancelRef, onPick, onClose}: DecideActionSheetProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal
      aria-labelledby="prn-as-title"
      className="prn-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
          return;
        }
        trapTabKey(event, rootRef.current);
      }}>
      <div style={styles.asCard}>
        <div id="prn-as-title" style={styles.asHeader}>
          {sub.display} · {sub.priceLabel}/mo
        </div>
        <div style={styles.asDivider} />
        <button type="button" className="prn-btn prn-focusable" style={styles.asRow} onClick={() => onPick('keep')}>
          Keep
        </button>
        <div style={styles.asDivider} />
        <button type="button" className="prn-btn prn-focusable" style={styles.asRow} onClick={() => onPick('pause')}>
          Pause
        </button>
        <div style={styles.asDivider} />
        <button
          type="button"
          className="prn-btn prn-focusable"
          style={{...styles.asRow, ...styles.asRowDestructive}}
          onClick={() => onPick('cancel')}>
          Cancel subscription
        </button>
      </div>
      <div style={styles.asCard}>
        <button ref={cancelRef} type="button" className="prn-btn prn-focusable" style={styles.asCancelRow} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TAB BAR VOCABULARY — 4 real buttons; Audit carries the live review badge.
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof ListChecksIcon}> = [
  {id: 'audit', label: 'Audit', icon: ListChecksIcon},
  {id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon},
  {id: 'savings', label: 'Savings', icon: PiggyBankIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

const NAV_TITLES: Record<TabId, string> = {
  audit: 'Audit',
  calendar: 'Calendar',
  savings: 'Savings',
  settings: 'Settings',
};

// ---------------------------------------------------------------------------
// PAGE — Prune · Subscription Audit.
// ---------------------------------------------------------------------------

export default function MobileSubscriptionAuditPage() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const grabberRef = useRef<HTMLButtonElement | null>(null);
  const asCancelRef = useRef<HTMLButtonElement | null>(null);

  const {state, setState} = usePruneStore();
  const {verdicts, tab, sheetSubId, sheetDetent, actionSheetSubId, drag, toast, refreshState, remindersOn} = state;

  const containerWidth = useElementWidth(wrapRef);
  // Viewport query is FIRST-FRAME fallback only; container width decides.
  const vpDesktop = useMediaQuery('(min-width: 900px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : vpDesktop;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const locked = sheetSubId != null || actionSheetSubId != null;

  // DERIVED — pure selectors over the one verdicts map, never stored.
  const committedMonthly = reclaimedMonthlyCents(verdicts);
  const dragZone = drag != null ? zoneFor(drag.dx) : null;
  const meterCents =
    drag != null && dragZone != null
      ? reclaimedMonthlyCents({...verdicts, [drag.subId]: dragZone})
      : committedMonthly;
  const badge = reviewCount(verdicts);
  const n30 = next30(verdicts);
  const reviewList = SUBS.filter(sub => verdicts[sub.id] === 'review');
  const keepList = SUBS.filter(sub => verdicts[sub.id] === 'keep');
  const reclaimedList = SUBS.filter(sub => isReclaimed(verdicts[sub.id]));
  const lastChangedSubId = toast?.undoTo?.subId ?? null;
  const sheetSub = sheetSubId != null ? SUB_BY_ID[sheetSubId] : null;
  const actionSub = actionSheetSubId != null ? SUB_BY_ID[actionSheetSubId] : null;

  // Large-title collapse: navBar title fades in once the sentinel above the
  // large title scrolls under the 52px sticky navBar (audit tab only).
  const [titleUnder, setTitleUnder] = useState(false);
  useEffect(() => {
    if (tab !== 'audit') return undefined;
    const node = sentinelRef.current;
    if (node == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setTitleUnder(!entry.isIntersecting);
      },
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [tab]);

  // Per-tab scroll persistence (ergonomics law 2): restore on tab entry.
  const scrollByTabRef = useRef(state.scrollByTab);
  scrollByTabRef.current = state.scrollByTab;
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[tab];
    }
  }, [tab]);

  // Focus INTO opening overlays — always {preventScroll: true} (amendment).
  useEffect(() => {
    if (sheetSubId != null) grabberRef.current?.focus({preventScroll: true});
  }, [sheetSubId]);
  useEffect(() => {
    if (actionSheetSubId != null) asCancelRef.current?.focus({preventScroll: true});
  }, [actionSheetSubId]);

  // THE one commit path — drag release, actionSheet row, and the sheet's
  // segmented control all land here. Executes immediately; Undo, never
  // confirm. The toast text carries the NEW reclaimed total so the single
  // live region announces the odometer move too.
  const setVerdict = useCallback(
    (subId: string, verdict: Verdict) => {
      setState(prev => {
        const prevVerdict = prev.verdicts[subId];
        if (prevVerdict === verdict) {
          return {...prev, actionSheetSubId: null, drag: null};
        }
        const nextVerdicts = {...prev.verdicts, [subId]: verdict};
        const annual = fmtUsd(reclaimedMonthlyCents(nextVerdicts) * 12);
        const sub = SUB_BY_ID[subId];
        const msg =
          verdict === 'cancel'
            ? \`\${sub.display} canceled — \${annual}/yr reclaimed\`
            : verdict === 'pause'
              ? \`\${sub.display} paused — \${annual}/yr reclaimed\`
              : verdict === 'keep'
                ? \`\${sub.display} kept — \${annual}/yr reclaimed\`
                : \`\${sub.display} moved back to review\`;
        return {
          ...prev,
          verdicts: nextVerdicts,
          actionSheetSubId: null,
          drag: null,
          toast: {seq: (prev.toast?.seq ?? 0) + 1, msg, undoTo: {subId, prevVerdict}},
        };
      });
    },
    [setState],
  );

  // Undo restores the EXACT prior verdict — the row returns to its original
  // bucket position because buckets derive from stable fixture order
  // (stress 6); the toast then reads 'Restored'.
  const undo = useCallback(() => {
    setState(prev => {
      const undoTo = prev.toast?.undoTo;
      if (undoTo == null) return prev;
      return {
        ...prev,
        verdicts: {...prev.verdicts, [undoTo.subId]: undoTo.prevVerdict},
        toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: 'Restored', undoTo: null},
      };
    });
  }, [setState]);

  const announce = useCallback(
    (msg: string) => {
      setState(prev => ({...prev, toast: {seq: (prev.toast?.seq ?? 0) + 1, msg, undoTo: null}}));
    },
    [setState],
  );

  // Refresh is an explicit button (pull-to-refresh is banned): first press
  // shows the skeleton demo state, second press resolves to 'Updated just
  // now' — no timers, user-driven both ways.
  const refresh = useCallback(() => {
    setState(prev =>
      prev.refreshState === 'skeleton'
        ? {
            ...prev,
            refreshState: 'updated',
            toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: 'Updated just now', undoTo: null},
          }
        : {
            ...prev,
            refreshState: 'skeleton',
            toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: 'Loading', undoTo: null},
          },
    );
  }, [setState]);

  const openSheet = useCallback(
    (subId: string, opener: HTMLElement) => {
      openerRef.current = opener;
      setState(prev => ({...prev, sheetSubId: subId, sheetDetent: 'medium', actionSheetSubId: null, drag: null}));
    },
    [setState],
  );
  const closeSheet = useCallback(() => {
    setState(prev => ({...prev, sheetSubId: null}));
    openerRef.current?.focus();
  }, [setState]);
  const toggleDetent = useCallback(() => {
    setState(prev => ({...prev, sheetDetent: prev.sheetDetent === 'medium' ? 'large' : 'medium'}));
  }, [setState]);

  const openActionSheet = useCallback(
    (subId: string, opener: HTMLElement) => {
      openerRef.current = opener;
      setState(prev => ({...prev, actionSheetSubId: subId, sheetSubId: null, drag: null}));
    },
    [setState],
  );
  const closeActionSheet = useCallback(() => {
    setState(prev => ({...prev, actionSheetSubId: null}));
    openerRef.current?.focus();
  }, [setState]);
  const handleActionPick = useCallback(
    (verdict: Verdict) => {
      if (actionSub == null) return;
      setVerdict(actionSub.id, verdict);
      openerRef.current?.focus();
    },
    [actionSub, setVerdict],
  );

  const onDragMove = useCallback(
    (subId: string, dx: number) => {
      setState(prev => ({...prev, drag: {subId, dx}}));
    },
    [setState],
  );
  const onDragEnd = useCallback(
    (subId: string, commit: Verdict | null) => {
      if (commit != null) {
        setVerdict(subId, commit);
      } else {
        setState(prev => ({...prev, drag: null}));
      }
    },
    [setState, setVerdict],
  );

  const toggleReminders = useCallback(() => {
    setState(prev => ({
      ...prev,
      remindersOn: !prev.remindersOn,
      toast: {
        seq: (prev.toast?.seq ?? 0) + 1,
        msg: prev.remindersOn ? 'Renewal reminders off' : 'Renewal reminders on',
        undoTo: null,
      },
    }));
  }, [setState]);

  // Tab switch keeps everything except open overlays; re-tapping the active
  // tab scrolls to top (the one legal reset).
  const selectTab = useCallback(
    (next: TabId) => {
      const scroller = getScrollParent(shellRef.current);
      if (next === tab) {
        scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
        return;
      }
      const scrollTop = scroller?.scrollTop ?? 0;
      setState(prev => ({
        ...prev,
        tab: next,
        scrollByTab: {...prev.scrollByTab, [prev.tab]: scrollTop},
        sheetSubId: null,
        actionSheetSubId: null,
        drag: null,
      }));
    },
    [tab, reducedMotion, setState],
  );

  const renderVerdictCard = (
    list: Subscription[],
    empty: {icon: typeof SearchXIcon; title: string; body: string},
    skeleton: boolean,
  ) => {
    if (skeleton) return <SkeletonCard />;
    if (list.length === 0) {
      return (
        <div style={styles.listCard}>
          <EmptyBlock icon={empty.icon} title={empty.title} body={empty.body} />
        </div>
      );
    }
    return (
      <div style={styles.listCard}>
        {list.map((sub, i) => (
          <div key={sub.id}>
            {i > 0 ? <div style={styles.rowDivider} /> : null}
            <VerdictRailRow
              sub={sub}
              verdict={verdicts[sub.id]}
              dragDx={drag != null && drag.subId === sub.id ? drag.dx : null}
              dragEnabled={!reducedMotion}
              animateIn={sub.id === lastChangedSubId}
              reducedMotion={reducedMotion}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              onOpenSheet={openSheet}
              onOpenActionSheet={openActionSheet}
            />
          </div>
        ))}
      </div>
    );
  };

  const calendarDays = DAY_SLOTS.filter(day => OCCURRENCES_BY_DAY.has(day.index));

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PRUNE_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(locked ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <PruneMark />
          </div>
          {tab === 'audit' ? (
            <span
              aria-hidden
              className="prn-fade"
              style={{...styles.navTitle, opacity: titleUnder ? 1 : 0}}>
              Audit
            </span>
          ) : (
            <h1 style={styles.navTitle}>
              <span className="prn-vh">Prune — </span>
              {NAV_TITLES[tab]}
            </h1>
          )}
          <div style={styles.navTrailing}>
            {tab === 'audit' ? (
              <button
                type="button"
                className="prn-btn prn-focusable"
                style={styles.iconBtn}
                aria-label={refreshState === 'skeleton' ? 'Finish refreshing audit' : 'Refresh audit'}
                onClick={refresh}>
                <Icon icon={RefreshCwIcon} size="sm" />
              </button>
            ) : null}
          </div>
        </header>

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {tab === 'audit' ? (
            <>
              <div ref={sentinelRef} style={{height: 1}} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>
                  <span className="prn-vh">Prune — </span>Audit
                </h1>
              </div>
              {refreshState === 'updated' ? <p style={styles.refreshCaption}>Updated just now</p> : null}
              <SavingsMeterOdometer
                monthlyCents={meterCents}
                isPreview={meterCents !== committedMonthly}
                reducedMotion={reducedMotion}
              />
              <RenewalHorizonStrip
                verdicts={verdicts}
                lastChangedSubId={lastChangedSubId}
                reducedMotion={reducedMotion}
                onBubbleTap={openSheet}
              />
              <h2 style={styles.sectionHeader}>Review · {reviewList.length}</h2>
              {renderVerdictCard(
                reviewList,
                {
                  icon: SearchXIcon,
                  title: 'No subscriptions under review',
                  body: 'Every verdict is in. Undo any row to revisit it.',
                },
                refreshState === 'skeleton',
              )}
              <h2 style={styles.sectionHeader}>Keep · {keepList.length}</h2>
              {renderVerdictCard(
                keepList,
                {
                  icon: CheckIcon,
                  title: 'Nothing marked keep',
                  body: 'Subscriptions you decide to keep land here.',
                },
                false,
              )}
              <h2 style={styles.sectionHeader}>Reclaimed · {reclaimedList.length}</h2>
              {renderVerdictCard(
                reclaimedList,
                {
                  icon: PiggyBankIcon,
                  title: 'Nothing reclaimed yet',
                  body: 'Paused and canceled subscriptions land here.',
                },
                false,
              )}
              <p style={styles.terminalCaption}>
                All {SUBS.length} subscriptions · {fmtUsd(TOTAL_MONTHLY_CENTS)}/mo
              </p>
            </>
          ) : null}

          {tab === 'calendar' ? (
            <>
              <h2 style={styles.sectionHeader}>Next 30 days</h2>
              <div style={styles.listCard}>
                <div style={styles.sumRow}>
                  <span style={styles.sumPrimary}>
                    {fmtUsd(n30.cents)} · {n30.count} charges
                  </span>
                  <span style={styles.sumSecondary}>{TODAY_LABEL} – Aug 4 · canceled and paused excluded</span>
                </div>
              </div>
              {calendarDays.map(day => {
                const occs = OCCURRENCES_BY_DAY.get(day.index) ?? [];
                return (
                  <div key={day.index}>
                    <h2 style={styles.sectionHeader}>
                      {day.weekdayName}, {day.label}
                    </h2>
                    <div style={styles.listCard}>
                      {occs.map((occ, i) => {
                        const sub = SUB_BY_ID[occ.subId];
                        const verdict = verdicts[sub.id];
                        const reclaimed = isReclaimed(verdict);
                        const tile = TILE_PAIRS[sub.tile];
                        return (
                          <div key={occ.subId}>
                            {i > 0 ? <div style={styles.rowDivider} /> : null}
                            <button
                              type="button"
                              className="prn-btn prn-focusable"
                              style={{
                                ...styles.chargeRow,
                                width: '100%',
                                ...(reclaimed ? styles.rowDimmed : null),
                              }}
                              aria-label={\`\${sub.display}, \${sub.priceLabel} on \${day.label}\${
                                reclaimed ? \`, \${verdict === 'pause' ? 'paused' : 'canceled'}\` : ''
                              } — open details\`}
                              onClick={event => openSheet(sub.id, event.currentTarget)}>
                              <span
                                style={{
                                  ...styles.logoTile,
                                  width: 36,
                                  height: 36,
                                  borderRadius: 10,
                                  fontSize: 15,
                                  background: tile.bg,
                                  color: tile.fg,
                                }}
                                aria-hidden>
                                {sub.monogram}
                              </span>
                              <span style={styles.chargeText}>
                                <span style={styles.rowPrimary}>{sub.display}</span>
                                <span style={styles.rowSecondary}>{sub.plan}</span>
                              </span>
                              {reclaimed ? (
                                <span style={styles.chargeChip}>{verdict === 'pause' ? 'paused' : 'canceled'}</span>
                              ) : null}
                              <span style={styles.chargeAmount}>{sub.priceLabel}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <p style={styles.terminalCaption}>All {OCCURRENCES.length} renewals · Jul 6 – Sep 3</p>
            </>
          ) : null}

          {tab === 'savings' ? (
            <>
              <div style={{height: 12}} aria-hidden />
              <div style={styles.heroCard}>
                <span style={styles.overline}>Reclaimed / year</span>
                <span style={styles.heroAnnual}>{fmtUsd(committedMonthly * 12)}</span>
                <span style={styles.heroMonthly}>
                  {fmtUsd(committedMonthly)}/mo across {reclaimedList.length} subscription
                  {reclaimedList.length === 1 ? '' : 's'}
                </span>
              </div>
              <h2 style={styles.sectionHeader}>Reclaimed · {reclaimedList.length}</h2>
              {reclaimedList.length === 0 ? (
                <div style={styles.listCard}>
                  <EmptyBlock
                    icon={PiggyBankIcon}
                    title="Nothing reclaimed yet"
                    body="Pause or cancel a subscription on the Audit tab."
                  />
                </div>
              ) : (
                <div style={styles.listCard}>
                  {reclaimedList.map((sub, i) => {
                    const verdict = verdicts[sub.id];
                    const tile = TILE_PAIRS[sub.tile];
                    return (
                      <div key={sub.id}>
                        {i > 0 ? <div style={styles.rowDivider} /> : null}
                        <button
                          type="button"
                          className="prn-btn prn-focusable"
                          style={{...styles.chargeRow, width: '100%'}}
                          aria-label={\`\${sub.display}, \${verdict === 'pause' ? 'paused' : 'canceled'}, \${fmtUsd(sub.priceCents * 12)} per year back — open details\`}
                          onClick={event => openSheet(sub.id, event.currentTarget)}>
                          <span
                            style={{
                              ...styles.logoTile,
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              fontSize: 15,
                              background: tile.bg,
                              color: tile.fg,
                            }}
                            aria-hidden>
                            {sub.monogram}
                          </span>
                          <span style={styles.chargeText}>
                            <span style={styles.rowPrimary}>{sub.display}</span>
                            <span style={styles.rowSecondary}>
                              {verdict === 'pause' ? 'Paused' : 'Canceled'} · was {sub.priceLabel}/mo
                            </span>
                          </span>
                          <span style={{...styles.chargeAmount, color: GREEN_TEXT}}>
                            +{fmtUsd(sub.priceCents * 12)}/yr
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}

          {tab === 'settings' ? (
            <>
              <h2 style={styles.sectionHeader}>Preferences</h2>
              <div style={styles.listCard}>
                {/* Whole 44px row IS the switch target (inputControls). */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={remindersOn}
                  className="prn-btn prn-focusable"
                  style={styles.utilityRow}
                  onClick={toggleReminders}>
                  <span style={styles.utilityLabel}>Renewal reminders</span>
                  <span
                    style={{
                      ...styles.switchTrack,
                      background: remindersOn ? BRAND_ACCENT : SWITCH_OFF,
                    }}
                    aria-hidden>
                    <span
                      className="prn-odom"
                      style={{
                        ...styles.switchThumb,
                        transform: remindersOn ? 'translateX(20px)' : undefined,
                      }}
                    />
                  </span>
                </button>
                <div style={{height: 1, background: 'var(--color-border)', marginInlineStart: 16}} />
                <button
                  type="button"
                  className="prn-btn prn-focusable"
                  style={styles.utilityRow}
                  onClick={() => announce('Default card: Visa ··4417')}>
                  <span style={styles.utilityLabel}>Payment method</span>
                  <span style={styles.utilityValue}>Visa ··4417</span>
                  <Icon icon={ChevronRightIcon} size="sm" />
                </button>
                <div style={{height: 1, background: 'var(--color-border)', marginInlineStart: 16}} />
                <button
                  type="button"
                  className="prn-btn prn-focusable"
                  style={styles.utilityRow}
                  onClick={() => announce('Currency: USD')}>
                  <span style={styles.utilityLabel}>Currency</span>
                  <span style={styles.utilityValue}>USD</span>
                  <Icon icon={ChevronRightIcon} size="sm" />
                </button>
              </div>
              <h2 style={styles.sectionHeader}>Data</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="prn-btn prn-focusable"
                  style={styles.utilityRow}
                  onClick={() => announce('Audit exported — prune-audit-jul-2026.csv')}>
                  <span style={styles.utilityLabel}>Export audit CSV</span>
                  <Icon icon={ChevronRightIcon} size="sm" />
                </button>
                <div style={{height: 1, background: 'var(--color-border)', marginInlineStart: 16}} />
                <button
                  type="button"
                  className="prn-btn prn-focusable"
                  style={styles.utilityRow}
                  onClick={() => announce('Prune v2.4.1 — audits are local-only')}>
                  <span style={styles.utilityLabel}>About Prune</span>
                  <span style={styles.utilityValue}>v2.4.1</span>
                </button>
              </div>
              <div style={{height: 24}} aria-hidden />
            </>
          ) : null}
        </main>

        {/* THE single polite live region — sticky-in-flow above the tabBar;
            flips to shell-absolute only while the shell is scroll-locked
            (sticky-toast-dock amendment). No auto-dismiss timers. */}
        <div style={locked ? styles.toastDockAbs : styles.toastDockSticky} role="status" aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast} className="prn-row-in">
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.undoTo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="prn-btn prn-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Prune">
          {TABS.map(item => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                className="prn-btn prn-focusable"
                style={active ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                aria-current={active ? 'page' : undefined}
                aria-label={
                  item.id === 'audit' && badge > 0 ? \`Audit, \${badge} under review\` : item.label
                }
                onClick={() => selectTab(item.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={item.icon} size="md" />
                  {item.id === 'audit' && badge > 0 ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span style={active ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {sheetSub != null ? (
          <>
            <div className="prn-fade" style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <DetailSheet
              sub={sheetSub}
              verdict={verdicts[sheetSub.id]}
              detent={sheetDetent}
              grabberRef={grabberRef}
              onToggleDetent={toggleDetent}
              onClose={closeSheet}
              onSetVerdict={setVerdict}
            />
          </>
        ) : null}

        {actionSub != null ? (
          <>
            <div className="prn-fade" style={styles.sheetScrim} onClick={closeActionSheet} aria-hidden />
            <DecideActionSheet
              sub={actionSub}
              cancelRef={asCancelRef}
              onPick={handleActionPick}
              onClose={closeActionSheet}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};