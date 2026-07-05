// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Fillin shift-claim marketplace
 *   for Marisol Vega (reliability 98%, 47 completed, Visa ··4821): 8 OPEN
 *   shifts across Fri Jul 3 / Sat Jul 4 / Sun Jul 5 (4+3+1 = 8 = tab
 *   badge; Portland 6 + Vancouver 2 + Beaverton 0 = 8), 3 CLAIMED shifts
 *   (9750+12600+7200 = 29550¢ = the $295.50 week pill, derived by reduce),
 *   3 DONE shifts (8800+10500+7650 = 26950¢ earned; projected 26950+29550
 *   = 56500¢ = $565.00, re-derived never stored). All money in integer
 *   cents beside display strings; all times as minutes-since-midnight ints
 *   beside labels; all countdown pcts fixed. No Date.now(), no
 *   Math.random(), no network media.
 * @output Fillin — Shift Claim Board: a 390px MOBILE gig-work surface.
 *   NavBar (28px bolt-in-slot mark · per-tab h1 · RefreshCw on Open) over
 *   a 44px chipBar (location chip 'All areas · 8' + $295.50 week pill),
 *   day-grouped listCards of 56px ClaimRows (32px CountdownRing, surge
 *   chip, tabular pay segment), a 64px 4-tab bar with a live Open badge,
 *   a two-detent detail sheet (SurgeLadder 96px, ConflictStrip 24px,
 *   pay-math card, 48px HoldClaimButton), a location actionSheet, and a
 *   sticky toast dock. Signature move: claiming o5 ($112.50 Sat surge
 *   shift) is ONE status write whose ripples are all derivation — badge
 *   8→7, week pill $295.50→$408.00, Earnings projected $565.00→$677.50,
 *   Sat header 3→2 SHIFTS, o6 AND o7 gray out with 'overlaps' chips, and
 *   every subsequently opened ConflictStrip paints the new 2–7 PM block;
 *   Undo reverses all of it in the same render with o5 back in its
 *   original Sat position (fixture order, never re-sorted).
 * @position Page template; emitted by `astryx template mobile-shift-claim-board`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrims, detail sheet, actionSheet, toast) are
 *   position:'absolute' or sticky INSIDE shell; position:fixed is banned.
 *   While the detail sheet or actionSheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. The stage
 *   clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68px — rows lead with the 32px
 *   ring); no desktop Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Fillin violet); sanctioned non-brand literals are the
 *   amber soon/overlaps pair, the ring-track pair, the switch-off pair,
 *   and the ConflictStrip claimed-block pair — each with contrast math at
 *   the declaration (foundations amendment: interactive boundaries and
 *   meaningful rest-state fills need explicit ≥3:1 pairs vs their ACTUAL
 *   surface, not hairline tokens).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — this
 *   template does not wire scroll-under; noted per contract); chipBar
 *   44px in flow; ClaimRow 56px custom (denser than stock 60px because
 *   trailing segments are omitted per-shift — see ClaimRow comment);
 *   utility rows 44px; completed rows 60px; sectionHeader 13px/600
 *   uppercase 0.06em at 32px inset, 20px top / 8px bottom; tabBar 64px
 *   sticky bottom z20 (4 × flex:1 items, 24px icon over 11px/500 label,
 *   badge min-width 16px 10px/600 at top −4 right −8); sheet detents 55%
 *   medium / calc(100% − 56px) large, 24px grabber zone with 36×5 pill,
 *   52px sheet header, sticky footer 48px HoldClaimButton; toastDock
 *   sticky bottom 76 z30 (amendment: sticky-in-flow, shell-absolute only
 *   while scroll-locked). TYPE (Figtree via --font-family-body): 17/600
 *   nav + sheet titles · 16/500–600 row primary + pay · 13/400–600
 *   secondary + chips · 11/500–600 tab labels, surge chips, 'soon';
 *   nothing under 11px; tabular-nums on every money/count that updates.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged into a
 *   full-row button; the hold gesture ships with its plain-click path.
 *
 * Responsive contract:
 * - Fluid 320–430px, no width literals: navBar three-zone grid keeps the
 *   title centered (maxWidth 200 ellipsis); location chip label
 *   ellipsizes at min-width 0 while the weekPill never shrinks (tabular
 *   money is sacred — chip flexes, pill doesn't); ClaimRow's two-line
 *   stack is the flex:1 min-width:0 ellipsis zone, pay segment fixed
 *   min-width 76; below 350px container width the surge chip drops to an
 *   icon-only Zap (aria-label keeps '1.25x surge'); ConflictStrip is pure
 *   percentage math so it renders identically at 320 and 430; tabBar 4 ×
 *   flex:1 items fit 11px labels at 320. overflowX:'clip' is backstop.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No layout forks; the phone anatomy is the product.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  CalendarCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  MapPinIcon,
  RefreshCwIcon,
  SearchXIcon,
  UserIcon,
  WalletIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Fillin violet). White on #7048E8 ≈ 5.9:1
// (passes 4.5:1); #8B6CF0 with near-black #1A1523 text ≈ 6.2:1.
const BRAND_ACCENT = 'light-dark(#7048E8, #8B6CF0)';
// Text over a BRAND_ACCENT fill — the math above.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1A1523)';
// Brand-tinted TEXT on cards and tint fills. #5B36CE on #FFFFFF ≈ 7.6:1,
// on the #EFEAFC tint ≈ 6.6:1; #B7A3F6 on the dark card (~#1C1C1E) ≈
// 8.2:1, on the #322853 tint ≈ 5.6:1 — all clear 4.5:1.
const BRAND_TEXT = 'light-dark(#5B36CE, #B7A3F6)';
// Brand-tinted fill for the weekPill and surge chips (explicit pair per
// the amendment — a color-mix wash over a tinted context is not enough).
const BRAND_TINT_FILL = 'light-dark(#EFEAFC, #322853)';
// Amber 'soon'/'overlaps' TEXT: #B45309 on the white card ≈ 4.8:1 and on
// the #FEF3C7 chip fill ≈ 4.5:1; #FBBF24 on the dark card ≈ 9.6:1 and on
// the #78350F chip fill ≈ 6.6:1 — all pass 4.5:1 (3:1 floor cleared).
const AMBER_TEXT = 'light-dark(#B45309, #FBBF24)';
const AMBER_FILL = 'light-dark(#FEF3C7, #78350F)';
// CountdownRing rest track — a MEANINGFUL rest fill (the unfilled claim
// window), so per the amendment it gets an explicit ≥3:1 pair vs the
// ACTUAL card surface, not --color-border: #8E86A0 on #FFFFFF ≈ 3.4:1;
// #7D7594 on the dark card (~#1C1C1E) ≈ 3.3:1.
const RING_TRACK = 'light-dark(#8E86A0, #7D7594)';
// Switch OFF track — an interactive control boundary at rest (amendment):
// #787283 on the white card ≈ 4.4:1; #8B8598 on the dark card ≈ 4.0:1.
const SWITCH_OFF = 'light-dark(#787283, #8B8598)';
// ConflictStrip claimed blocks (spec pair) — solid brand-muted fills read
// against the strip's muted track, with the 2px-outlined offered block
// and the error hatch carrying the collision (never color-only: the aria
// sentence + 'overlaps' chip + disabled caption restate it).
const STRIP_CLAIMED = 'light-dark(#DDD3FA, #3B2E68)';
// Overlap hatch tint — 45° repeating stripes of the error token.
const ERROR_HATCH = 'color-mix(in srgb, var(--color-error) 45%, transparent)';
// Sheet/actionSheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Blur chrome surface shared by navBar / tabBar / sheet footer.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, skeleton shimmer, the
// hold-fill transition, and the reduced-motion guard (hold-fill and shimmer
// are REMOVED under reduced motion; click remains the sole claim path).
// ---------------------------------------------------------------------------

const FILLIN_CSS = `
.fln-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fln-btn:disabled { cursor: default; }
.fln-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.fln-anim { transition: transform 240ms ease, opacity 240ms ease; }
.fln-fade { transition: opacity 240ms ease; }
@keyframes fln-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fln-sheet-in { animation: fln-sheet-in 240ms ease; }
@keyframes fln-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.fln-shimmer {
  animation: fln-shimmer 1.6s linear infinite;
}
.fln-hold-fill {
  transition: transform 600ms linear;
}
.fln-vh {
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
  .fln-anim, .fln-fade, .fln-hold-fill { transition: none; }
  .fln-sheet-in { animation: none; }
  .fln-shimmer { animation: none; display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; hairline + blur always on.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    flexShrink: 0,
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
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
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
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: BRAND_TEXT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // CHIP BAR — 44px in flow below the navBar (Open tab only): the location
  // chip flexes/ellipsizes; the weekPill never shrinks.
  chipBar: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  locationChipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexShrink: 1,
    borderRadius: 999,
  },
  locationChip: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    minWidth: 0,
  },
  locationChipLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  chipSpacer: {flex: 1},
  // weekPill — brand-tint fill with explicit pair (contrast math at the
  // BRAND_TEXT / BRAND_TINT_FILL declarations).
  weekPill: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_TINT_FILL,
    color: BRAND_TEXT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // 'Updated just now' — fixed caption, role=status (the sanctioned
  // refresh-result announcement; the toastDock stays the mutation region).
  updatedCaption: {
    paddingInline: 32,
    paddingBlock: 2,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
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
    fontVariantNumeric: 'tabular-nums',
  },
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // rowDivider inset 68px — rows lead with the 32px ring (16 + 32 + 20).
  rowDivider68: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowDivider16: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // CLAIM ROW — 56px full-row button (custom: trailing segments omitted
  // per-shift, ring encodes 'closes soon' — a stock ListItem can't).
  claimRow: {
    width: '100%',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  ringCol: {
    width: 32,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  soonLabel: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1,
    color: AMBER_TEXT,
  },
  rowStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  surgeChip: {
    height: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    paddingInline: 5,
    borderRadius: 6,
    background: BRAND_TINT_FILL,
    color: BRAND_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  overlapsChip: {
    height: 18,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 5,
    borderRadius: 6,
    background: AMBER_FILL,
    color: AMBER_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  paySeg: {
    minWidth: 76,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  payMain: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  paySub: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Conflicted rows: 55% opacity on text/ring only — the chip stays at
  // full strength so the reason reads; the row stays tappable.
  dimmed: {opacity: 0.55},
  checkCol: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_TEXT,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETON — 4 rows at exact 56px ClaimRow geometry; zero layout shift.
  skeletonRow: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skeletonRing: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
  },
  skeletonLines: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skeletonClip: {position: 'relative', overflow: 'hidden'},
  skeletonSweep: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-background-card) 55%, transparent) 50%, transparent 100%)',
    pointerEvents: 'none',
  },
  // EMPTY STATE — filtered-empty (Beaverton), per emptyAndSkeleton.
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
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  // TAB BAR — exactly 64px, 4 × flex:1 items, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    flexShrink: 0,
    background: CHROME_SURFACE,
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
  tabItemActive: {color: BRAND_TEXT},
  tabIconWrap: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: 1},
  tabLabelActive: {fontWeight: 600},
  badge: {
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
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
    lineHeight: 1,
  },
  // TOAST DOCK — sticky-in-flow height-0 anchor rendered just before the
  // tabBar (amendment): pins 76px above the viewport bottom even
  // mid-scroll; shell-absolute would pin to the DOCUMENT bottom on tall
  // views. While the shell is scroll-locked it flips to absolute.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 'auto',
    marginInline: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  grabberZone: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    touchAction: 'none',
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetTimeRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingBlock: 8,
  },
  sheetTimePrimary: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  sheetTimeSecondary: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // SURGE LADDER — 96px sheet-size stacked tiers.
  ladder: {
    marginTop: 12,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
  },
  ladderStack: {height: 96, display: 'flex', flexDirection: 'column'},
  ladderTier: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 22,
  },
  ladderBar: {width: 4, alignSelf: 'stretch', marginBlock: 3, borderRadius: 3, flexShrink: 0},
  ladderLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ladderAmount: {fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  ladderRule: {height: 1, background: 'var(--color-border)', flexShrink: 0},
  ladderTotal: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    marginTop: 4,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // CONFLICT STRIP — 24px day timeline, 6 AM–12 AM, pure % math.
  stripWrap: {marginTop: 16},
  stripTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
  },
  stripTrack: {
    position: 'relative',
    height: 24,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stripClaimed: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    background: STRIP_CLAIMED,
  },
  stripOffered: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    border: `2px solid ${BRAND_ACCENT}`,
    boxSizing: 'border-box',
  },
  stripOverlap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    background: `repeating-linear-gradient(45deg, ${ERROR_HATCH} 0 3px, transparent 3px 6px)`,
  },
  stripTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  // PAY-MATH CARD — all tabular.
  payMath: {
    marginTop: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: '4px 12px',
  },
  payMathLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    minHeight: 32,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  payMathLabel: {flex: 1, minWidth: 0, color: 'var(--color-text-secondary)'},
  payMathRule: {height: 1, background: 'var(--color-border)'},
  payMathTotal: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // HOLD-CLAIM BUTTON — 48px full-width brand primary; the fill overlay
  // animates transform only and is removed under reduced motion.
  holdBtn: {
    position: 'relative',
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    touchAction: 'none',
  },
  holdBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  holdFill: {
    position: 'absolute',
    inset: 0,
    background: 'color-mix(in srgb, #FFFFFF 26%, transparent)',
    transformOrigin: 'left',
    pointerEvents: 'none',
  },
  holdLabel: {position: 'relative'},
  holdCaption: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: AMBER_TEXT,
  },
  // ACTION SHEET — insetInline 16 bottom 16 z41; options card + Cancel card.
  actionSheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  actionRule: {height: 1, background: 'var(--color-border)'},
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  actionRowOn: {color: BRAND_TEXT, fontWeight: 600},
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // UTILITY ROWS (Earnings summary · Profile) — 44px.
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  utilityValueStrong: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Completed-shift rows (Earnings) — 60px two-line.
  doneRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  // PROFILE — avatar header + 51×31 switch on a full-row role=switch.
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 16px 4px',
  },
  avatar: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_FILL,
    color: BRAND_TEXT,
    fontSize: 17,
    fontWeight: 700,
  },
  profileName: {fontSize: 17, fontWeight: 600, margin: 0},
  profileSub: {fontSize: 13, color: 'var(--color-text-secondary)'},
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  // MY-SHIFTS DETAIL SCREEN (push) — lightweight utility card.
  detailHero: {
    padding: '20px 16px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  detailVenue: {fontSize: 22, fontWeight: 700, margin: 0},
  detailSub: {fontSize: 13, color: 'var(--color-text-secondary)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic BY LAW. Every money value is integer cents beside
// its display math; every time is minutes-since-midnight beside its label.
// ARITHMETIC CROSS-CHECK LEDGER (re-derived in code via reduce, asserted
// here): 4×2000=8000; 6×1750=10500; 5×1980=9900 (1800×1.1); 4×1850=7400;
// 5×2250=11250 (1800×1.25); 5×2100=10500; 5×2185+1500=12425 (1900×1.15);
// 5×2000=10000; claimed 9750+12600+7200=29550; +11250=40800; done
// 8800+10500+7650=26950; 26950+29550=56500; 26950+40800=67750; areas
// 6+2+0=8; days 4+3+1=8.
// ---------------------------------------------------------------------------

const WORKER = {
  name: 'Marisol Vega',
  initials: 'MV',
  area: 'All areas',
  reliability: '98%',
  completed: 47,
  payout: 'Visa ··4821',
} as const;

type DayId = 'fri' | 'sat' | 'sun';
type AreaId = 'all' | 'portland' | 'vancouver' | 'beaverton';
type ShiftStatus = 'open' | 'claimed' | 'done';

interface Shift {
  id: string;
  venue: string;
  role: string;
  day: DayId;
  dayLabel: string; // 'FRI JUL 3'
  dayName: string; // 'Friday'
  dayShort: string; // 'Fri'
  timeLabel: string; // '2:00–7:00 PM'
  timeAria: string; // '2 to 7 PM'
  startMin: number; // minutes since midnight
  endMin: number;
  hours: number;
  baseRateCents: number;
  surgeMult: number | null;
  rateCents: number; // effective hourly (base × surge)
  bonusCents: number;
  totalCents: number; // hours × rateCents + bonusCents
  pct: number; // fixed claim-window % remaining (open shifts)
  status: ShiftStatus;
  area: Exclude<AreaId, 'all'>;
}

const AREA_LABELS: Record<AreaId, string> = {
  all: 'All areas',
  portland: 'Portland, OR',
  vancouver: 'Vancouver, WA',
  beaverton: 'Beaverton, OR',
};

// OPEN (8 = badge; Portland 6 + Vancouver 2 + Beaverton 0 = 8 ✓). o4 is
// PRE-CONFLICTED at load (8 PM–12 AM overlaps ms1's 5–10 PM in the 8–10 PM
// zone — stress fixture 3). o5 is the pct-12 'soon' target (stress 2). o7
// stacks surge + bonus and is the densest row shipped (stress 1).
const SHIFT_LIST: Shift[] = [
  {id: 'o1', venue: 'Brightline Warehouse', role: 'Loader', day: 'fri', dayLabel: 'FRI JUL 3', dayName: 'Friday', dayShort: 'Fri', timeLabel: '6:00–10:00 AM', timeAria: '6 to 10 AM', startMin: 360, endMin: 600, hours: 4, baseRateCents: 2000, surgeMult: null, rateCents: 2000, bonusCents: 0, totalCents: 8000, pct: 82, status: 'open', area: 'portland'},
  {id: 'o2', venue: 'Riverside Hotel', role: 'Housekeeping', day: 'fri', dayLabel: 'FRI JUL 3', dayName: 'Friday', dayShort: 'Fri', timeLabel: '9:00 AM–3:00 PM', timeAria: '9 AM to 3 PM', startMin: 540, endMin: 900, hours: 6, baseRateCents: 1750, surgeMult: null, rateCents: 1750, bonusCents: 0, totalCents: 10500, pct: 64, status: 'open', area: 'portland'},
  {id: 'o3', venue: 'Dockside Grill', role: 'Prep cook', day: 'fri', dayLabel: 'FRI JUL 3', dayName: 'Friday', dayShort: 'Fri', timeLabel: '11:00 AM–4:00 PM', timeAria: '11 AM to 4 PM', startMin: 660, endMin: 960, hours: 5, baseRateCents: 1800, surgeMult: 1.1, rateCents: 1980, bonusCents: 0, totalCents: 9900, pct: 45, status: 'open', area: 'vancouver'},
  {id: 'o4', venue: 'Harbor Nine Bar', role: 'Barback', day: 'fri', dayLabel: 'FRI JUL 3', dayName: 'Friday', dayShort: 'Fri', timeLabel: '8:00 PM–12:00 AM', timeAria: '8 PM to midnight', startMin: 1200, endMin: 1440, hours: 4, baseRateCents: 1850, surgeMult: null, rateCents: 1850, bonusCents: 0, totalCents: 7400, pct: 30, status: 'open', area: 'portland'},
  {id: 'o5', venue: 'Harborline Events', role: 'Setup crew', day: 'sat', dayLabel: 'SAT JUL 4', dayName: 'Saturday', dayShort: 'Sat', timeLabel: '2:00–7:00 PM', timeAria: '2 to 7 PM', startMin: 840, endMin: 1140, hours: 5, baseRateCents: 1800, surgeMult: 1.25, rateCents: 2250, bonusCents: 0, totalCents: 11250, pct: 12, status: 'open', area: 'portland'},
  {id: 'o6', venue: 'Northgate Warehouse', role: 'Sorter', day: 'sat', dayLabel: 'SAT JUL 4', dayName: 'Saturday', dayShort: 'Sat', timeLabel: '4:00–9:00 PM', timeAria: '4 to 9 PM', startMin: 960, endMin: 1260, hours: 5, baseRateCents: 2100, surgeMult: null, rateCents: 2100, bonusCents: 0, totalCents: 10500, pct: 58, status: 'open', area: 'portland'},
  {id: 'o7', venue: 'Cedar & Vine', role: 'Server', day: 'sat', dayLabel: 'SAT JUL 4', dayName: 'Saturday', dayShort: 'Sat', timeLabel: '6:00–11:00 PM', timeAria: '6 to 11 PM', startMin: 1080, endMin: 1380, hours: 5, baseRateCents: 1900, surgeMult: 1.15, rateCents: 2185, bonusCents: 1500, totalCents: 12425, pct: 71, status: 'open', area: 'portland'},
  {id: 'o8', venue: 'Brightline Warehouse', role: 'Loader', day: 'sun', dayLabel: 'SUN JUL 5', dayName: 'Sunday', dayShort: 'Sun', timeLabel: '7:00 AM–12:00 PM', timeAria: '7 AM to noon', startMin: 420, endMin: 720, hours: 5, baseRateCents: 2000, surgeMult: null, rateCents: 2000, bonusCents: 0, totalCents: 10000, pct: 88, status: 'open', area: 'vancouver'},
  // CLAIMED (3) — weekPill derives 9750+12600+7200 = 29550¢ = $295.50 ✓.
  {id: 'ms1', venue: 'Riverside Hotel', role: 'Banquet server', day: 'fri', dayLabel: 'FRI JUL 3', dayName: 'Friday', dayShort: 'Fri', timeLabel: '5:00–10:00 PM', timeAria: '5 to 10 PM', startMin: 1020, endMin: 1320, hours: 5, baseRateCents: 1950, surgeMult: null, rateCents: 1950, bonusCents: 0, totalCents: 9750, pct: 0, status: 'claimed', area: 'portland'},
  {id: 'ms2', venue: 'Northgate Warehouse', role: 'Picker', day: 'sat', dayLabel: 'SAT JUL 4', dayName: 'Saturday', dayShort: 'Sat', timeLabel: '7:00 AM–1:00 PM', timeAria: '7 AM to 1 PM', startMin: 420, endMin: 780, hours: 6, baseRateCents: 2100, surgeMult: null, rateCents: 2100, bonusCents: 0, totalCents: 12600, pct: 0, status: 'claimed', area: 'portland'},
  {id: 'ms3', venue: 'Dockside Grill', role: 'Barback', day: 'sun', dayLabel: 'SUN JUL 5', dayName: 'Sunday', dayShort: 'Sun', timeLabel: '4:00–8:00 PM', timeAria: '4 to 8 PM', startMin: 960, endMin: 1200, hours: 4, baseRateCents: 1800, surgeMult: null, rateCents: 1800, bonusCents: 0, totalCents: 7200, pct: 0, status: 'claimed', area: 'portland'},
  // DONE (Earnings) — earned derives 8800+10500+7650 = 26950¢ = $269.50 ✓.
  {id: 'w1', venue: 'Brightline Warehouse', role: 'Loader', day: 'fri', dayLabel: 'MON JUN 29', dayName: 'Monday', dayShort: 'Mon', timeLabel: '6:00–10:00 AM', timeAria: '6 to 10 AM', startMin: 360, endMin: 600, hours: 4, baseRateCents: 2200, surgeMult: null, rateCents: 2200, bonusCents: 0, totalCents: 8800, pct: 0, status: 'done', area: 'portland'},
  {id: 'w2', venue: 'Northgate Warehouse', role: 'Sorter', day: 'sat', dayLabel: 'TUE JUN 30', dayName: 'Tuesday', dayShort: 'Tue', timeLabel: '1:00–6:00 PM', timeAria: '1 to 6 PM', startMin: 780, endMin: 1080, hours: 5, baseRateCents: 2100, surgeMult: null, rateCents: 2100, bonusCents: 0, totalCents: 10500, pct: 0, status: 'done', area: 'portland'},
  {id: 'w3', venue: 'Riverside Hotel', role: 'Housekeeping', day: 'sun', dayLabel: 'WED JUL 1', dayName: 'Wednesday', dayShort: 'Wed', timeLabel: '9:00 AM–1:30 PM', timeAria: '9 AM to 1:30 PM', startMin: 540, endMin: 810, hours: 4.5, baseRateCents: 1700, surgeMult: null, rateCents: 1700, bonusCents: 0, totalCents: 7650, pct: 0, status: 'done', area: 'portland'},
];

// STRESS VARIANT (fixture 1, comment-noted): to prove the min-width-0
// ellipsis chain, temporarily rename o2's venue to 'Riverside Hotel &
// Riverfront Conference Center — East Tower' — the pay segment (min-width
// 76, flexShrink 0) must not move. The SHIPPED densest row is o7: surge
// chip + bonus + $124.25 in one 56px row.

// Order consts — list order = fixture order, NEVER re-sorted (stress 9:
// Undo restores o5 to the middle of the Sat group, not appended).
const OPEN_ORDER = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8'];
const MY_SHIFTS_ORDER = ['ms1', 'ms2', 'ms3'];
const DONE_ORDER = ['w1', 'w2', 'w3'];
const DAY_ORDER: DayId[] = ['fri', 'sat', 'sun'];
const DAY_HEADINGS: Record<DayId, string> = {fri: 'FRI JUL 3', sat: 'SAT JUL 4', sun: 'SUN JUL 5'};

// Skeleton bar widths — deterministic stagger per the foundations
// (primary 60/45/70%, secondary 40/55/30%), never Math.random().
const SKELETON_WIDTHS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
  ['60%', '40%'],
];

/** Cents → '$112.50'. */
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Overlap predicate — pure fn on minutes-since-midnight ints (labels are
 * display strings). o4 ∩ ms1: 1200 < 1320 && 1020 < 1440 ✓ at rest; after
 * o5 (840–1140) is claimed, o6 (960 < 1140) and o7 (1080 < 1140) flip.
 */
function overlaps(a: Shift, b: Shift): boolean {
  return a.day === b.day && a.startMin < b.endMin && b.startMin < a.endMin;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — App owns a single FillinState object; shift mutations go
// through update(id, patch); EVERYTHING else is derived by pure selectors
// (openIds, badge, weekTotal, conflictsFor, earned, projected) so claiming
// one shift ripples across four surfaces as derivation, not writes.
// ---------------------------------------------------------------------------

type TabId = 'open' | 'myShifts' | 'earnings' | 'profile';

interface ToastState {
  seq: number;
  msg: string;
  undoId: string | null;
}

interface FillinState {
  shifts: Record<string, Shift>;
  tab: TabId;
  screenByTab: Record<TabId, string>; // 'root' | 'detail:<id>'
  scrollByTab: Partial<Record<TabId, number>>;
  areaFilter: AreaId;
  sheetShiftId: string | null;
  sheetDetent: 'medium' | 'large';
  locationSheetOpen: boolean;
  toast: ToastState | null;
  refreshing: boolean;
  refreshed: boolean;
  lastClaimedId: string | null;
  notifications: boolean;
}

const INITIAL_STATE: FillinState = {
  shifts: Object.fromEntries(SHIFT_LIST.map(shift => [shift.id, shift])),
  tab: 'open',
  screenByTab: {open: 'root', myShifts: 'root', earnings: 'root', profile: 'root'},
  scrollByTab: {},
  areaFilter: 'all',
  sheetShiftId: null,
  sheetDetent: 'medium',
  locationSheetOpen: false,
  toast: null,
  refreshing: false,
  refreshed: false,
  lastClaimedId: null,
  notifications: true,
};

const NAV_TITLES: Record<TabId, string> = {
  open: 'Open Shifts',
  myShifts: 'My Shifts',
  earnings: 'Earnings',
  profile: 'Profile',
};

const TABS: {id: TabId; label: string; icon: typeof ZapIcon}[] = [
  {id: 'open', label: 'Open', icon: ZapIcon},
  {id: 'myShifts', label: 'My Shifts', icon: CalendarCheckIcon},
  {id: 'earnings', label: 'Earnings', icon: WalletIcon},
  {id: 'profile', label: 'Profile', icon: UserIcon},
];

// Pure selectors ------------------------------------------------------------

function openIds(shifts: Record<string, Shift>): string[] {
  return OPEN_ORDER.filter(id => shifts[id].status === 'open');
}

function filteredOpenIds(shifts: Record<string, Shift>, area: AreaId): string[] {
  return openIds(shifts).filter(id => area === 'all' || shifts[id].area === area);
}

/** My Shifts = fixture claimed order, then newly claimed opens in OPEN_ORDER. */
function claimedIds(shifts: Record<string, Shift>): string[] {
  return [
    ...MY_SHIFTS_ORDER.filter(id => shifts[id].status === 'claimed'),
    ...OPEN_ORDER.filter(id => shifts[id].status === 'claimed'),
  ];
}

/** weekPill — DERIVED via reduce, never a literal (29550¢ at load). */
function weekTotalCents(shifts: Record<string, Shift>): number {
  return claimedIds(shifts).reduce((sum, id) => sum + shifts[id].totalCents, 0);
}

/** Earned this week — 26950¢, derived from the done rows. */
function earnedCents(shifts: Record<string, Shift>): number {
  return DONE_ORDER.reduce((sum, id) => sum + shifts[id].totalCents, 0);
}

/** Conflicts derive EVERY RENDER from the claimed set. */
function conflictsFor(shifts: Record<string, Shift>, shift: Shift): Shift[] {
  return claimedIds(shifts)
    .map(id => shifts[id])
    .filter(claimed => claimed.id !== shift.id && overlaps(claimed, shift));
}

function areaCount(shifts: Record<string, Shift>, area: AreaId): number {
  return filteredOpenIds(shifts, area).length;
}

/** Container-width hook (grid-feeder-console ResizeObserver pattern). */
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns scroll. */
function getScroller(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node != null) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

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

// ---------------------------------------------------------------------------
// FILLIN MARK — 28px bolt-in-slot: a rounded slot notch (text-primary
// stroke) with the BRAND_ACCENT bolt dropping in; the bolt tail doubles as
// the 'i' dot gesture of the wordmark. Inline SVG, no network art.
// ---------------------------------------------------------------------------

function FillinMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Rounded slot notch. */}
        <path
          d="M6 17.5h4.5M17.5 17.5H22M6 17.5v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
          stroke="var(--color-text-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* The bolt, dropping into the slot. */}
        <path d="M15.5 3.5 9.5 13h3.4l-1.6 7 6.9-9.8h-3.6l2.6-6.7Z" fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// COUNTDOWN RING — 32px SVG donut, 3px stroke; RING_TRACK rest track
// (explicit ≥3:1 pair, see declaration), brand arc at the FIXED fixture
// claimWindowPct — never Date.now(). ≤20% flips the arc amber and adds the
// 11px/600 'soon' label. Static arc: nothing animates, nothing to reduce.
// ---------------------------------------------------------------------------

const RING_R = 13.5; // 32px box, 3px stroke → r = (32 − 3 − 2) / 2
const RING_C = 2 * Math.PI * RING_R; // ≈ 84.8

function CountdownRing({pct}: {pct: number}) {
  const soon = pct <= 20;
  const arc = (pct / 100) * RING_C;
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={`Claim window ${pct}% remaining${soon ? ', closes soon' : ''}`}>
      <circle cx={16} cy={16} r={RING_R} stroke={RING_TRACK} strokeWidth={3} />
      <circle
        cx={16}
        cy={16}
        r={RING_R}
        stroke={soon ? AMBER_TEXT : BRAND_ACCENT}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${arc.toFixed(2)} ${RING_C.toFixed(2)}`}
        transform="rotate(-90 16 16)"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CLAIM ROW — 56px full-row button (denser than the stock 60px two-line row:
// trailing segments are omitted PER-SHIFT — surge chip only on surged
// shifts, 'overlaps' chip replacing it on conflicted ones, 'soon' under the
// ring — which is why a stock ListItem can't render it). The whole row is
// ONE button opening the sheet; conflicted rows stay tappable (the sheet
// explains the conflict) but their claim button disables.
// ---------------------------------------------------------------------------

interface ClaimRowProps {
  shift: Shift;
  conflicted: boolean;
  narrow: boolean; // <350px container: surge chip drops to icon-only
  onOpen: (opener: HTMLElement) => void;
}

function ClaimRow({shift, conflicted, narrow, onOpen}: ClaimRowProps) {
  const soon = shift.pct <= 20;
  return (
    <button
      type="button"
      className="fln-btn fln-focusable"
      style={styles.claimRow}
      aria-label={`${shift.venue}, ${shift.role}, ${shift.dayName} ${shift.timeAria}, ${fmtUsd(shift.totalCents)}${
        conflicted ? ' — overlaps a claimed shift' : ''
      }`}
      onClick={event => onOpen(event.currentTarget)}>
      <span style={{...styles.ringCol, ...(conflicted ? styles.dimmed : null)}}>
        <CountdownRing pct={shift.pct} />
        {soon ? <span style={styles.soonLabel}>soon</span> : null}
      </span>
      <span style={{...styles.rowStack, ...(conflicted ? styles.dimmed : null)}}>
        <span style={styles.rowPrimary}>{shift.venue}</span>
        <span style={styles.rowSecondary}>
          {shift.timeLabel} · {shift.role}
        </span>
      </span>
      {conflicted ? (
        <span style={styles.overlapsChip}>overlaps</span>
      ) : shift.surgeMult != null ? (
        <span style={styles.surgeChip} aria-label={narrow ? `${shift.surgeMult}x surge` : undefined}>
          <Icon icon={ZapIcon} size="xsm" color="inherit" />
          {narrow ? null : `${shift.surgeMult}x`}
        </span>
      ) : null}
      <span style={{...styles.paySeg, ...(conflicted ? styles.dimmed : null)}}>
        <span style={styles.payMain}>{fmtUsd(shift.totalCents)}</span>
        <span style={styles.paySub}>{fmtUsd(shift.rateCents)}/hr</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CONFLICT STRIP — 24px horizontal day timeline in the sheet: muted 6px
// track spanning 6:00 AM–12:00 AM (18 h = 1080 min; left% = (start − 360) /
// 1080 × 100, width% = span / 1080 × 100 — pure % math, identical at 320
// and 430). Claimed blocks solid STRIP_CLAIMED, the offered shift a 2px
// brand-outlined block, overlap zones hatched. role=img with the full
// overlap sentence — the collision is never color-only.
// ---------------------------------------------------------------------------

const STRIP_START = 360; // 6:00 AM
const STRIP_SPAN = 1080; // 18 h → 12:00 AM

function stripPct(min: number): number {
  return ((min - STRIP_START) / STRIP_SPAN) * 100;
}

function ConflictStrip({shift, claimed}: {shift: Shift; claimed: Shift[]}) {
  const conflicts = claimed.filter(c => overlaps(c, shift));
  const sentence =
    conflicts.length === 0
      ? `Offered ${shift.timeAria} on ${shift.dayName}: no overlap with your claimed shifts`
      : `Offered ${shift.timeAria} overlaps your ${conflicts
          .map(c => `${c.timeAria} ${c.venue} shift`)
          .join(' and your ')}`;
  return (
    <div style={styles.stripWrap}>
      <div style={styles.stripTitle}>{shift.dayName} schedule</div>
      <div role="img" aria-label={sentence}>
        <div style={styles.stripTrack}>
          {claimed.map(block => (
            <span
              key={block.id}
              style={{
                ...styles.stripClaimed,
                left: `${stripPct(block.startMin)}%`,
                width: `${((block.endMin - block.startMin) / STRIP_SPAN) * 100}%`,
              }}
            />
          ))}
          <span
            style={{
              ...styles.stripOffered,
              left: `${stripPct(shift.startMin)}%`,
              width: `${((shift.endMin - shift.startMin) / STRIP_SPAN) * 100}%`,
            }}
          />
          {conflicts.map(block => {
            const start = Math.max(block.startMin, shift.startMin);
            const end = Math.min(block.endMin, shift.endMin);
            return (
              <span
                key={`ol-${block.id}`}
                style={{
                  ...styles.stripOverlap,
                  left: `${stripPct(start)}%`,
                  width: `${((end - start) / STRIP_SPAN) * 100}%`,
                }}
              />
            );
          })}
        </div>
        <div style={styles.stripTicks} aria-hidden>
          <span>6a</span>
          <span>12p</span>
          <span>6p</span>
          <span>12a</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SURGE LADDER — sheet-size 96px vertical rate-tier glyph: stacked tiers
// base→surge→bonus, each a left bar + 13px/500 label + trailing tabular
// amount; tier flex proportional to dollar contribution (minHeight 22 so
// 13px labels always fit), hairlines between, 16px/600 total beneath. Sums
// RE-DERIVE: 1800 + 450 = 2250¢/hr; 5 h × 2250 = 11250¢ = $112.50.
// ---------------------------------------------------------------------------

function SurgeLadder({shift}: {shift: Shift}) {
  const baseContribution = Math.round(shift.hours * shift.baseRateCents);
  const surgePerHour = shift.rateCents - shift.baseRateCents;
  const surgeContribution = Math.round(shift.hours * surgePerHour);
  const tiers = [
    {id: 'base', label: `Base ${fmtUsd(shift.baseRateCents)}/hr`, amount: baseContribution, bar: RING_TRACK},
    ...(shift.surgeMult != null
      ? [{id: 'surge', label: `Surge ${shift.surgeMult}x +${fmtUsd(surgePerHour)}/hr`, amount: surgeContribution, bar: BRAND_ACCENT}]
      : []),
    ...(shift.bonusCents > 0 ? [{id: 'bonus', label: 'Bonus', amount: shift.bonusCents, bar: AMBER_TEXT}] : []),
  ];
  // Re-derived total must equal the fixture (cross-check law is exact).
  const totalCents = tiers.reduce((sum, tier) => sum + tier.amount, 0);
  return (
    <div style={styles.ladder}>
      <div style={styles.ladderStack}>
        {tiers.map((tier, index) => (
          <div key={tier.id} style={{display: 'contents'}}>
            {index > 0 ? <div style={styles.ladderRule} /> : null}
            <div style={{...styles.ladderTier, flex: tier.amount}}>
              <span style={{...styles.ladderBar, background: tier.bar}} aria-hidden />
              <span style={styles.ladderLabel}>{tier.label}</span>
              <span style={styles.ladderAmount}>+{fmtUsd(tier.amount)}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.ladderTotal}>
        <span style={{flex: 1}}>
          {shift.hours}h × {fmtUsd(shift.rateCents)}/hr{shift.bonusCents > 0 ? ' + bonus' : ''}
        </span>
        <span>{fmtUsd(totalCents)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HOLD-CLAIM BUTTON — plain CLICK claims immediately (the visible
// non-gesture path); pointerdown ADDITIONALLY starts a 600ms scaleX fill
// (transform only) that fires the claim at 100%; releasing before 600ms
// cancels the fill and lets the plain click land — a fired-guard flag
// prevents claiming twice. Under prefers-reduced-motion the fill is removed
// entirely and click is the sole path. Contrast: white on #7048E8 ≈ 5.9:1;
// #1A1523 on #8B6CF0 ≈ 6.2:1 (see BRAND_ACCENT declaration).
// ---------------------------------------------------------------------------

interface HoldClaimButtonProps {
  label: string;
  disabled: boolean;
  disabledCaption: string | null;
  reducedMotion: boolean;
  onClaim: () => void;
}

function HoldClaimButton({label, disabled, disabledCaption, reducedMotion, onClaim}: HoldClaimButtonProps) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const cancelHold = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
  };
  useEffect(() => cancelHold, []);

  const onPointerDown = () => {
    if (disabled || reducedMotion) return;
    firedRef.current = false;
    setHolding(true);
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      setHolding(false);
      onClaim();
    }, 600);
  };
  const onClick = () => {
    if (disabled) return;
    if (firedRef.current) {
      firedRef.current = false; // hold already claimed — swallow the click
      return;
    }
    onClaim();
  };

  return (
    <div>
      <button
        type="button"
        className="fln-btn fln-focusable"
        style={{...styles.holdBtn, ...(disabled ? styles.holdBtnDisabled : null)}}
        disabled={disabled}
        aria-disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onClick={onClick}>
        {!disabled && !reducedMotion ? (
          <span
            className="fln-hold-fill"
            style={{...styles.holdFill, transform: holding ? 'scaleX(1)' : 'scaleX(0)'}}
            aria-hidden
          />
        ) : null}
        <span style={styles.holdLabel}>{label}</span>
      </button>
      {disabled && disabledCaption != null ? <div style={styles.holdCaption}>{disabledCaption}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X, focus-trapped dialog. Only one sheet
// mounts at a time; the actionSheet occupies the same z41 layer.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetProps) {
  // Transient drag delta only — the detent lives in the single state owner.
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startYRef.current = event.clientY;
    movedRef.current = false;
    setDragY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragY == null) return;
    const dy = event.clientY - startYRef.current;
    if (Math.abs(dy) > 8) movedRef.current = true;
    setDragY(dy);
  };
  const onGrabberPointerUp = () => {
    if (dragY == null) return;
    const dy = dragY;
    setDragY(null);
    if (!movedRef.current) return; // plain click → toggle handled by onClick
    if (dy > 120 && detent === 'medium') onClose();
    else if (dy > 60 && detent === 'large') onDetentChange('medium');
    else if (dy < -60 && detent === 'medium') onDetentChange('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetentChange(detent === 'medium' ? 'large' : 'medium');
  };

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fln-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="fln-btn fln-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="fln-btn fln-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileShiftClaimBoardTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  // <350px container: surge chips drop to icon-only (responsive contract).
  const narrow = wrapWidth > 0 && wrapWidth < 350;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<FillinState>(INITIAL_STATE);
  // update(id, patch) — THE shift mutator; everything else derives.
  const update = useCallback((id: string, patch: Partial<Shift>) => {
    setState(prev => ({...prev, shifts: {...prev.shifts, [id]: {...prev.shifts[id], ...patch}}}));
  }, []);
  const merge = useCallback((patch: Partial<FillinState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const chipOpenerRef = useRef<HTMLElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const refreshBtnRef = useRef<HTMLButtonElement | null>(null);
  const undoBtnRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);

  // Derived — every claim ripple below is derivation, not imperative writes.
  const {shifts} = state;
  const allOpen = openIds(shifts);
  const badgeCount = allOpen.length; // 8 → 7 on claim
  const filtered = filteredOpenIds(shifts, state.areaFilter);
  const myShifts = claimedIds(shifts);
  const weekCents = weekTotalCents(shifts); // 29550 → 40800 on claim
  const earned = earnedCents(shifts); // 26950, fixed
  const projected = earned + weekCents; // 56500 → 67750, re-derived
  const sheetShift = state.sheetShiftId != null ? shifts[state.sheetShiftId] : null;
  const detailId = state.screenByTab.myShifts.startsWith('detail:')
    ? state.screenByTab.myShifts.slice('detail:'.length)
    : null;
  const detailShift = state.tab === 'myShifts' && detailId != null ? shifts[detailId] : null;
  const locked = state.sheetShiftId != null || state.locationSheetOpen;

  const toastPatch = (msg: string, undoId: string | null = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undoId}};
  };

  // Focus into an opening sheet uses preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (foundations amendment).
  useEffect(() => {
    if (state.sheetShiftId != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheetShiftId]);
  // actionSheet: first focus lands on Cancel — the safe default.
  useEffect(() => {
    if (state.locationSheetOpen) {
      actionCancelRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.locationSheetOpen]);

  // SHEET / OVERLAY LIFECYCLE ------------------------------------------------

  const openSheet = (shiftId: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    merge({sheetShiftId: shiftId, sheetDetent: 'medium'});
  };
  const closeSheet = () => {
    merge({sheetShiftId: null, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };
  const openLocationSheet = (opener: HTMLElement) => {
    chipOpenerRef.current = opener;
    merge({locationSheetOpen: true});
  };
  const closeLocationSheet = () => {
    merge({locationSheetOpen: false});
    chipOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: actionSheet > detail sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.locationSheetOpen) closeLocationSheet();
      else if (state.sheetShiftId != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.locationSheetOpen, state.sheetShiftId]);

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // CLAIM — single status write; the four ripples (badge 8→7, weekPill
  // $295.50→$408.00 + projected $565.00→$677.50, Sat header 3→2 SHIFTS,
  // o6/o7 graying with 'overlaps' chips) are all pure derivation. The
  // opener row unmounts with the claim, so focus moves to the toast's
  // Undo — the actionable continuation of the mutation.
  const claimShift = (id: string) => {
    const total = shifts[id].totalCents;
    setState(prev => ({
      ...prev,
      shifts: {...prev.shifts, [id]: {...prev.shifts[id], status: 'claimed' as ShiftStatus}},
      sheetShiftId: null,
      sheetDetent: 'medium',
      lastClaimedId: id,
      ...toastPatch(`Shift claimed · ${fmtUsd(total)}`, id),
    }));
    requestAnimationFrame(() => undoBtnRef.current?.focus());
  };

  // UNDO — reverses all four surfaces in the same render; o5 returns to
  // its ORIGINAL Sat position (OPEN_ORDER filter, never re-sorted).
  const undoClaim = () => {
    const id = state.toast?.undoId;
    if (id == null) return;
    setState(prev => ({
      ...prev,
      shifts: {...prev.shifts, [id]: {...prev.shifts[id], status: 'open' as ShiftStatus}},
      lastClaimedId: null,
      ...toastPatch('Claim removed'),
    }));
    requestAnimationFrame(() => document.getElementById(`fln-row-${id}`)?.focus());
  };

  // AREA FILTER — picking re-derives list + chip label; the one polite
  // region announces the result count ('6 shifts near Portland, OR').
  const pickArea = (area: AreaId) => {
    const count = areaCount(shifts, area);
    const msg =
      area === 'all' ? `${count} shifts · All areas` : `${count} shifts near ${AREA_LABELS[area]}`;
    merge({areaFilter: area, locationSheetOpen: false, ...toastPatch(msg)});
    chipOpenerRef.current?.focus();
  };

  // REFRESH — press → skeletons; the NEXT user action resolves (second
  // press or any tap), landing on the fixed 'Updated just now' caption.
  const onRefreshPress = () => {
    if (state.refreshing) merge({refreshing: false, refreshed: true});
    else merge({refreshing: true, refreshed: false});
  };
  const onShellClickCapture = (event: {target: EventTarget}) => {
    if (!state.refreshing) return;
    if (refreshBtnRef.current?.contains(event.target as Node)) return; // its own onClick resolves
    merge({refreshing: false, refreshed: true});
  };

  // TABS — per-tab state persistence: scroll stored on exit, restored on
  // entry; pushed My Shifts detail survives round-trips; overlays close on
  // switch (toast persists); active-tab re-tap pops to root + scrolls top.
  const switchTab = (tab: TabId) => {
    const scroller = getScroller(shellRef.current);
    if (tab === state.tab) {
      merge({screenByTab: {...state.screenByTab, [tab]: 'root'}});
      scroller?.scrollTo({top: 0});
      return;
    }
    const restoreTo = state.scrollByTab[tab] ?? 0;
    merge({
      tab,
      sheetShiftId: null,
      locationSheetOpen: false,
      scrollByTab: {...state.scrollByTab, [state.tab]: scroller?.scrollTop ?? 0},
    });
    requestAnimationFrame(() => {
      const nextScroller = getScroller(shellRef.current);
      if (nextScroller != null) nextScroller.scrollTop = restoreTo;
    });
  };

  const pushMyShiftDetail = (id: string) => {
    merge({screenByTab: {...state.screenByTab, myShifts: `detail:${id}`}, toast: null});
  };
  const popMyShiftDetail = () => {
    merge({screenByTab: {...state.screenByTab, myShifts: 'root'}});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(locked ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const navTitle = detailShift != null ? detailShift.venue : NAV_TITLES[state.tab];
  const sheetConflicts = sheetShift != null ? conflictsFor(shifts, sheetShift) : [];
  const sheetClaimedSameDay =
    sheetShift != null ? myShifts.map(id => shifts[id]).filter(claimed => claimed.day === sheetShift.day) : [];

  // OPEN TAB -----------------------------------------------------------------

  const renderOpenTab = () => {
    if (state.refreshing) {
      return (
        <div style={{...styles.listCard, ...styles.skeletonClip, marginTop: 20}} aria-busy="true">
          {SKELETON_WIDTHS.map(([primary, secondary], index) => (
            <div key={`sk-${primary}-${secondary}-${index === 3 ? 'b' : 'a'}`} aria-hidden="true">
              {index > 0 ? <div style={styles.rowDivider68} /> : null}
              <div style={styles.skeletonRow}>
                <span style={styles.skeletonRing} />
                <span style={styles.skeletonLines}>
                  <span style={{...styles.skeletonBar, width: primary}} />
                  <span style={{...styles.skeletonBar, width: secondary}} />
                </span>
              </div>
            </div>
          ))}
          <span className="fln-shimmer" style={styles.skeletonSweep} aria-hidden />
        </div>
      );
    }
    if (filtered.length === 0) {
      // FILTERED-EMPTY — echoes the area verbatim; one action clears it.
      return (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={SearchXIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No shifts in {AREA_LABELS[state.areaFilter]}</h2>
          <p style={styles.emptyBody}>New shifts appear as venues post them.</p>
          <button type="button" className="fln-btn fln-focusable" style={styles.emptyAction} onClick={() => pickArea('all')}>
            Show all areas
          </button>
        </div>
      );
    }
    return (
      <>
        {DAY_ORDER.map(day => {
          const dayIds = filtered.filter(id => shifts[id].day === day);
          if (dayIds.length === 0) return null;
          return (
            <div key={day}>
              {/* Day header count re-derives from the filtered length. */}
              <h2 style={styles.sectionHeader}>
                {DAY_HEADINGS[day]} · {dayIds.length} {dayIds.length === 1 ? 'SHIFT' : 'SHIFTS'}
              </h2>
              <div style={styles.listCard}>
                {dayIds.map((id, index) => (
                  <div key={id} id={`fln-row-wrap-${id}`}>
                    {index > 0 ? <div style={styles.rowDivider68} /> : null}
                    <div id={`fln-row-${id}`} tabIndex={-1} style={{outline: 'none'}}>
                      <ClaimRow
                        shift={shifts[id]}
                        conflicted={conflictsFor(shifts, shifts[id]).length > 0}
                        narrow={narrow}
                        onOpen={opener => openSheet(id, opener)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // MY SHIFTS TAB ------------------------------------------------------------

  const renderMyShiftsTab = () => {
    if (detailShift != null) {
      return (
        <div>
          <div style={styles.detailHero}>
            <h2 style={styles.detailVenue}>{detailShift.venue}</h2>
            <span style={styles.detailSub}>
              {detailShift.dayName} · {detailShift.timeLabel}
            </span>
          </div>
          <h2 style={styles.sectionHeader}>Shift details</h2>
          <div style={styles.listCard}>
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Role</span>
              <span style={styles.utilityValue}>{detailShift.role}</span>
            </div>
            <div style={styles.rowDivider16} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Hours</span>
              <span style={styles.utilityValue}>{detailShift.hours}h</span>
            </div>
            <div style={styles.rowDivider16} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Rate</span>
              <span style={styles.utilityValue}>{fmtUsd(detailShift.rateCents)}/hr</span>
            </div>
            <div style={styles.rowDivider16} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Total pay</span>
              <span style={styles.utilityValueStrong}>{fmtUsd(detailShift.totalCents)}</span>
            </div>
          </div>
          <h2 style={styles.sectionHeader}>{detailShift.dayName} schedule</h2>
          <div style={{...styles.listCard, padding: '4px 16px 12px'}}>
            <ConflictStrip
              shift={detailShift}
              claimed={myShifts.map(id => shifts[id]).filter(s => s.day === detailShift.day && s.id !== detailShift.id)}
            />
          </div>
        </div>
      );
    }
    return (
      <div>
        <h2 style={styles.sectionHeader}>Claimed this week · {fmtUsd(weekCents)}</h2>
        <div style={styles.listCard}>
          {myShifts.map((id, index) => {
            const shift = shifts[id];
            return (
              <div key={id}>
                {index > 0 ? <div style={styles.rowDivider68} /> : null}
                <button
                  type="button"
                  className="fln-btn fln-focusable"
                  style={styles.claimRow}
                  aria-label={`${shift.venue}, ${shift.role}, ${shift.dayName} ${shift.timeAria}, ${fmtUsd(shift.totalCents)} — details`}
                  onClick={() => pushMyShiftDetail(id)}>
                  <span style={styles.checkCol} aria-hidden>
                    <Icon icon={CircleCheckIcon} size="md" color="inherit" />
                  </span>
                  <span style={styles.rowStack}>
                    <span style={styles.rowPrimary}>{shift.venue}</span>
                    <span style={styles.rowSecondary}>
                      {shift.dayShort} · {shift.timeLabel} · {shift.role}
                    </span>
                  </span>
                  <span style={styles.paySeg}>
                    <span style={styles.payMain}>{fmtUsd(shift.totalCents)}</span>
                    <span style={styles.paySub}>{fmtUsd(shift.rateCents)}/hr</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        {/* Terminal caption — 'All 3 shifts' → 'All 4 shifts' post-claim. */}
        <div style={styles.terminalCaption}>All {myShifts.length} shifts</div>
      </div>
    );
  };

  // EARNINGS TAB ---------------------------------------------------------------

  const renderEarningsTab = () => (
    <div>
      <h2 style={styles.sectionHeader}>This week</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Earned this week</span>
          <span style={styles.utilityValueStrong}>{fmtUsd(earned)}</span>
        </div>
        <div style={styles.rowDivider16} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Scheduled</span>
          <span style={styles.utilityValue}>{fmtUsd(weekCents)}</span>
        </div>
        <div style={styles.rowDivider16} />
        {/* 26950 + 29550 = 56500¢; post-claim 26950 + 40800 = 67750¢ —
            re-derived from the same reduces, never stored. */}
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Projected</span>
          <span style={styles.utilityValueStrong}>{fmtUsd(projected)}</span>
        </div>
      </div>
      <h2 style={styles.sectionHeader}>Completed · {DONE_ORDER.length}</h2>
      <div style={styles.listCard}>
        {DONE_ORDER.map((id, index) => {
          const shift = shifts[id];
          return (
            <div key={id}>
              {index > 0 ? <div style={styles.rowDivider16} /> : null}
              <div style={styles.doneRow}>
                <span style={styles.rowStack}>
                  <span style={styles.rowPrimary}>{shift.venue}</span>
                  <span style={styles.rowSecondary}>
                    {shift.dayShort} · {shift.hours}h × {fmtUsd(shift.rateCents)}/hr
                  </span>
                </span>
                <span style={styles.payMain}>{fmtUsd(shift.totalCents)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // PROFILE TAB ----------------------------------------------------------------

  const renderProfileTab = () => (
    <div>
      <div style={styles.profileHeader}>
        <span style={styles.avatar} aria-hidden>
          {WORKER.initials}
        </span>
        <div>
          <h2 style={styles.profileName}>{WORKER.name}</h2>
          <span style={styles.profileSub}>Warehouse & hospitality · Portland, OR</span>
        </div>
      </div>
      <h2 style={styles.sectionHeader}>Account</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Reliability</span>
          <span style={styles.utilityValueStrong}>{WORKER.reliability}</span>
        </div>
        <div style={styles.rowDivider16} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Shifts completed</span>
          <span style={styles.utilityValueStrong}>{WORKER.completed}</span>
        </div>
        <div style={styles.rowDivider16} />
        {/* Full-row role=switch — tapping anywhere on the 44px row toggles;
            the 51×31 visual never stands alone. */}
        <button
          type="button"
          role="switch"
          aria-checked={state.notifications}
          className="fln-btn fln-focusable"
          style={styles.utilityRow}
          onClick={() => merge({notifications: !state.notifications})}>
          <span style={styles.utilityLabel}>Notifications</span>
          <span
            style={{
              ...styles.switchTrack,
              background: state.notifications ? BRAND_ACCENT : SWITCH_OFF,
            }}
            aria-hidden>
            <span
              className="fln-anim"
              style={{
                ...styles.switchThumb,
                transform: state.notifications ? 'translateX(20px)' : undefined,
              }}
            />
          </span>
        </button>
        <div style={styles.rowDivider16} />
        <button
          type="button"
          className="fln-btn fln-focusable"
          style={styles.utilityRow}
          onClick={() => merge(toastPatch(`Payout method — ${WORKER.payout}`))}>
          <span style={styles.utilityLabel}>Payout method</span>
          <span style={styles.utilityValue}>{WORKER.payout}</span>
          <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
        </button>
      </div>
    </div>
  );

  const openCount = areaCount(shifts, state.areaFilter);

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FILLIN_CSS}</style>
      {/* onClickCapture: while refreshing, ANY tap resolves to the fixed
          'Updated just now' caption (the refresh button's own onClick
          handles the second-press path). */}
      <div ref={shellRef} style={shellStyle} onClickCapture={onShellClickCapture}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {detailShift != null ? (
              <button
                type="button"
                className="fln-btn fln-focusable"
                style={styles.backBtn}
                aria-label="Back to My Shifts"
                onClick={popMyShiftDetail}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>My Shifts</span>
              </button>
            ) : (
              <FillinMark />
            )}
          </div>
          <h1 style={styles.navTitle}>{navTitle}</h1>
          <div style={styles.navTrailing}>
            {state.tab === 'open' ? (
              <button
                type="button"
                ref={refreshBtnRef}
                className="fln-btn fln-focusable"
                style={styles.iconBtn}
                aria-label={state.refreshing ? 'Finish refreshing shifts' : 'Refresh shifts'}
                onClick={onRefreshPress}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : null}
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'open' ? (
            <>
              <div style={styles.chipBar}>
                <button
                  type="button"
                  className="fln-btn fln-focusable"
                  style={styles.locationChipHit}
                  aria-haspopup="dialog"
                  aria-expanded={state.locationSheetOpen}
                  aria-label={`Shifts near ${AREA_LABELS[state.areaFilter]}, ${openCount} open — change area`}
                  onClick={event => openLocationSheet(event.currentTarget)}>
                  <span style={styles.locationChip}>
                    <Icon icon={MapPinIcon} size="xsm" color="secondary" />
                    <span style={styles.locationChipLabel}>
                      {AREA_LABELS[state.areaFilter]} · {openCount}
                    </span>
                  </span>
                </button>
                <span style={styles.chipSpacer} />
                {/* weekPill derives via reduce — $295.50 → $408.00 on claim. */}
                <span style={styles.weekPill}>{fmtUsd(weekCents)} this week</span>
              </div>
              {state.refreshed && !state.refreshing ? (
                <div style={styles.updatedCaption} role="status">
                  Updated just now
                </div>
              ) : null}
              {renderOpenTab()}
            </>
          ) : null}
          {state.tab === 'myShifts' ? renderMyShiftsTab() : null}
          {state.tab === 'earnings' ? renderEarningsTab() : null}
          {state.tab === 'profile' ? renderProfileTab() : null}
        </main>

        {/* THE one polite live region — sticky-in-flow dock above the
            tabBar (amendment); absolute only while the shell is locked.
            Also carries the single visually-hidden 'Loading' announcement. */}
        <div style={locked ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
          {state.refreshing ? <span className="fln-vh">Loading</span> : null}
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="fln-fade">
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undoId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    ref={undoBtnRef}
                    className="fln-btn fln-focusable"
                    style={styles.toastUndo}
                    onClick={undoClaim}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Fillin tabs">
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="fln-btn fln-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-current={active ? 'page' : undefined}
                aria-label={tab.id === 'open' ? `Open shifts, ${badgeCount} available` : undefined}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'open' ? (
                    <span style={styles.badge} aria-hidden>
                      {badgeCount}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {locked ? (
          <div
            style={styles.sheetScrim}
            onClick={() => (state.locationSheetOpen ? closeLocationSheet() : closeSheet())}
            aria-hidden
          />
        ) : null}

        {sheetShift != null ? (
          <Sheet
            titleId="fln-sheet-title"
            title={sheetShift.venue}
            detent={state.sheetDetent}
            onDetentChange={detent => merge({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <HoldClaimButton
                label={`Claim shift · ${fmtUsd(sheetShift.totalCents)}`}
                disabled={sheetConflicts.length > 0}
                disabledCaption={
                  sheetConflicts.length > 0 ? `Overlaps your ${sheetConflicts[0].dayShort} shift` : null
                }
                reducedMotion={reducedMotion}
                onClaim={() => claimShift(sheetShift.id)}
              />
            }>
            <div style={styles.sheetTimeRow}>
              <span style={styles.sheetTimePrimary}>
                {sheetShift.dayName} · {sheetShift.timeLabel}
              </span>
              <span style={styles.sheetTimeSecondary}>
                {sheetShift.role} · {AREA_LABELS[sheetShift.area]}
              </span>
            </div>
            <SurgeLadder shift={sheetShift} />
            <ConflictStrip shift={sheetShift} claimed={sheetClaimedSameDay} />
            <div style={styles.payMath}>
              <div style={styles.payMathLine}>
                <span style={styles.payMathLabel}>
                  {sheetShift.hours}h × {fmtUsd(sheetShift.rateCents)}
                </span>
                <span>{fmtUsd(Math.round(sheetShift.hours * sheetShift.rateCents))}</span>
              </div>
              {sheetShift.bonusCents > 0 ? (
                <div style={styles.payMathLine}>
                  <span style={styles.payMathLabel}>Completion bonus</span>
                  <span>{fmtUsd(sheetShift.bonusCents)}</span>
                </div>
              ) : null}
              <div style={styles.payMathRule} />
              <div style={styles.payMathTotal}>
                <span style={{flex: 1}}>Total</span>
                <span>{fmtUsd(sheetShift.totalCents)}</span>
              </div>
            </div>
          </Sheet>
        ) : null}

        {state.locationSheetOpen ? (
          <div
            ref={actionSheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fln-area-title"
            tabIndex={-1}
            className="fln-sheet-in"
            style={styles.actionSheet}
            onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
            <div style={styles.actionCard}>
              <div id="fln-area-title" style={styles.actionHeader}>
                Show shifts near
              </div>
              {(['all', 'portland', 'vancouver', 'beaverton'] as AreaId[]).map(area => (
                <div key={area}>
                  <div style={styles.actionRule} />
                  <button
                    type="button"
                    className="fln-btn fln-focusable"
                    style={{...styles.actionRow, ...(state.areaFilter === area ? styles.actionRowOn : null)}}
                    aria-pressed={state.areaFilter === area}
                    onClick={() => pickArea(area)}>
                    {AREA_LABELS[area]} · {areaCount(shifts, area)}
                  </button>
                </div>
              ))}
            </div>
            <div style={styles.actionCard}>
              <button
                type="button"
                ref={actionCancelRef}
                className="fln-btn fln-focusable"
                style={styles.actionCancel}
                onClick={closeLocationSheet}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
