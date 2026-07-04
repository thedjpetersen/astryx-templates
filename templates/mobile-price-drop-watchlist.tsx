// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel watchlist: 14 items
 *   (3 READY: save 71+16+22 = $109 ✓ · 9 WATCHING: gaps
 *   14+50+34+12+50+38+19+7+22 = $246 ✓ · 2 EXPIRED; 3+9+2 = 14 = header
 *   count ✓), 60-point sparkline series from a pure genSeries(seed, i)
 *   (point 59 forced = currentPrice), three fixed DropTicker events
 *   (−18% = 33/182, −6% = 6/104, −7% = 3/45, all cross-checked), a 6-row
 *   Drops feed, 3 alert switches, and 3 add-sheet suggestions. No
 *   Date.now(), no Math.random(), no network media.
 * @output Kestrel — Price-Drop Watchlist: a 390px MOBILE trading-desk
 *   watchlist for coveted objects. NavBar (28px Kestrel eye mark ·
 *   fade-in 'Watching · 14' · Plus + Refresh) over a 52px large title, a
 *   44px DropTicker (chevron-cycled, no timers), then inset-grouped
 *   sections: READY TO BUY (64px SparkbandRows, green current +
 *   strikethrough was), WATCHING (target band + draggable band handle on
 *   each sparkline), EXPIRED (dimmed 60px rows with Rewatch). Signature:
 *   dragging Walnut Desk Shelf's band handle up past its $139 market
 *   price FLIP-migrates the row from Watching #1 to Ready #4, recounts
 *   every header (READY · 4, WATCHING · 8, badge 3→4, $246→$232 ✓),
 *   appends a 'Target hit' ticker event, and arms an Undo toast — status
 *   is DERIVED (ready = !expired && target >= current), never stored.
 *   Row tap opens a 55%/full sheet: monogram tile, 120px sparkline,
 *   snap-to-detent TargetScrubber (Low/30-day/−10% detents), ±$1
 *   spinbutton stepper, ±5% buttons, live notification preview, and a
 *   'Stop watching' menu row behind the sheet ellipsis (undo-over-
 *   confirm). Tabs: Watchlist · Drops · Alerts · Profile, per-tab scroll
 *   persisted.
 * @position Page template; emitted by `astryx template mobile-price-drop-watchlist`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet, sheet
 *   menu) are position:'absolute' INSIDE shell; the toast dock is
 *   sticky-in-flow at bottom:76 (height 0) so it pins above the tabBar
 *   even mid-scroll — shell-absolute would anchor to the document bottom
 *   on this tall list. While the sheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, none on last row); no desktop
 *   frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand text pair
 *   BRAND_ACCENT = light-dark(#B45309, #FBBF24) (math at declaration);
 *   raw Kestrel amber #D97706 appears ONLY as decorative fill (eye-mark
 *   iris, band fill/edge, badge + thumb fills — each with contrast math).
 *   Ready-price green and the switch off-track pair are the sanctioned
 *   non-brand literals (amendment: rest-state control boundaries hold
 *   ≥3:1 against their ACTUAL surface — math at each declaration).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr'); largeTitle row 52px
 *   (28px/700 at the 16px gutter); DropTicker strip 44px; tabBar exactly
 *   64px sticky bottom z20. Rows: 64px SparkbandRow (sanctioned custom;
 *   [text flex][100px sparkline][64px price] + two 16px gaps →
 *   130+100+64+32 = 326 = 390−32 gutter−32 card padding ✓), 60px
 *   two-line Drops/Expired rows, 44px utility rows in Alerts/Profile.
 *   sectionHeader 13px/600 uppercase 0.06em at 32px, 20px top / 8px
 *   bottom. Type: 28/700 large title · 22/700 sheet price readout ·
 *   17/600 nav+sheet titles · 16/400 row primary · 13/400 meta · 11/500
 *   tab labels + detent labels; tabular-nums on ALL prices, counts,
 *   badges. Buttons: 48px sheet-footer primary · 36px secondary
 *   (Rewatch, ±5%) · 44×44 icon buttons; every gesture has a button path
 *   (band drag ↔ sheet scrubber/steppers; sheet drag ↔ grabber click +
 *   X + Escape; ticker cycle ↔ its 44×44 chevron button).
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals: SparkbandRow text stack is
 *   flex:1 minWidth:0 ellipsized, sparkline fixed 100px ≥360 container
 *   width and 80px below, price column minWidth 56. DropTicker text
 *   clips behind a measured 24px fade mask. TargetScrubber detent labels
 *   drop to ticks + aria-valuetext when the track measures <260px.
 *   overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   (container width, not viewport) — ≥720px renders the phone
 *   experience as a centered 390–430px column (maxWidth 430, marginInline
 *   auto, borderInline hairline); no adaptive relayout.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  BellIcon,
  ChevronRightIcon,
  CrosshairIcon,
  EyeIcon,
  HistoryIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  TrendingDownIcon,
  UserIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand text pair (Kestrel amber, darkened/lightened for
// text duty): #B45309 on #FFFFFF ≈ 5.0:1 ✓; #FBBF24 on the dark card
// (~#1C1917) ≈ 9.6:1 ✓. Raw #D97706 (3.1:1 on white) is decorative-only.
const BRAND_ACCENT = 'light-dark(#B45309, #FBBF24)';
// Decorative brand FILLS (badge pill, scrubber thumb, eye-mark iris, band
// top edge). Text over this fill never uses white — see BADGE_TEXT.
const BRAND_FILL = 'light-dark(#D97706, #FBBF24)';
// Text on a BRAND_FILL pill: #431407 on #D97706 ≈ 4.6:1 ✓ (white on
// #D97706 is only ≈3.2:1, so the dark-espresso ink carries the label);
// #431407 on #FBBF24 ≈ 9.1:1 ✓. Same value both schemes.
const BADGE_TEXT = '#431407';
// Target-band wash under each sparkline — decorative fill per spec; the
// 1px BRAND_FILL top edge + drag grip carry the boundary.
const BAND_FILL = 'light-dark(rgba(217, 119, 6, 0.16), rgba(251, 191, 36, 0.20))';
// Ready-price green: #15803D on the white card ≈ 5.0:1 ✓; #4ADE80 on the
// dark card ≈ 7.9:1 ✓.
const GREEN_READY = 'light-dark(#15803D, #4ADE80)';
// Switch OFF track — an interactive control's REST fill, so it holds
// ≥3:1 against its actual card surface per the batch-2 amendment (the
// foundations' 14%-alpha wash lands ≈1.2:1 and is reserved for passive
// separators): #8F8A85 on #FFFFFF ≈ 3.0:1 ✓; #8A8580 on ~#1C1917 ≈ 4.7:1 ✓.
const SWITCH_OFF_TRACK = 'light-dark(#8F8A85, #8A8580)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet entrance, scrubber snap pulse, row ring flash, reduced-motion
// collapse (transform/opacity only everywhere).
// ---------------------------------------------------------------------------

const KESTREL_CSS = `
.kst-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.kst-btn:disabled { cursor: default; }
.kst-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.kst-fade { transition: opacity 200ms ease; }
@keyframes kst-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.kst-sheet-in { animation: kst-sheet-in 240ms ease; }
@keyframes kst-snap-pulse {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.3); }
  100% { transform: scaleY(1); }
}
.kst-snap-pulse { animation: kst-snap-pulse 120ms ease; }
@keyframes kst-ring-flash {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
.kst-ring-flash { animation: kst-ring-flash 1100ms ease forwards; }
.kst-vh {
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
  .kst-fade { transition: none; }
  .kst-sheet-in { animation: kst-sheet-in 240ms ease; animation-name: none; }
  .kst-sheet-in { animation: kst-reduced-fade 160ms ease; }
  .kst-snap-pulse { animation: none; }
}
@keyframes kst-reduced-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — the mobile density grid verbatim: 16px gutter, 12px card gaps,
// 24px section gaps, 8px chip gaps; 52px navBar, 52px largeTitle, 44px
// ticker, 64px tabBar; 64px SparkbandRows / 60px two-line / 44px utility.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
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
  // NAV BAR — 52px sticky top z20, blur surface, hairline ALWAYS ON (this
  // template's collapse wiring drives only the title opacity; noted per
  // contract).
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
    fontVariantNumeric: 'tabular-nums',
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
  // LARGE TITLE — 52px in flow; 28px/700 at the 16px gutter, trailing
  // 13px caption slot.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  largeTitleText: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  largeTitleCaption: {
    marginLeft: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // DROP TICKER — 44px strip: event button (flex 1) + separate 44×44
  // chevron cycle button (the button IS the cycle path — no timers).
  ticker: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 16,
    gap: 0,
  },
  tickerBtn: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
  },
  tickerIcon: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  tickerLine: {
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontVariantNumeric: 'tabular-nums',
  },
  tickerLineMasked: {
    WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
    maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
  },
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; trailing aggregate at the same 32px.
  sectionHeadRow: {
    margin: '20px 0 8px',
    paddingInline: 32,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sectionTrailing: {
    marginLeft: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // SPARKBAND ROW — the sanctioned custom 64px row. Grid: text flex:1 ·
  // sparkline 100px (80 below 360) · price col 64px, two 16px gaps
  // (130+100+64+32 = 326 = card content width at 390 ✓).
  sparkRowOuter: {position: 'relative'},
  sparkRowBtn: {
    width: '100%',
    height: 64,
    display: 'grid',
    alignItems: 'center',
    columnGap: 16,
    paddingInline: 16,
  },
  rowTextStack: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  priceCol: {
    minWidth: 56,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  priceCur: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  priceCurReady: {color: GREEN_READY},
  priceSub: {
    fontSize: 13,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  priceWas: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Band drag handle — 44×44 hit over the band's top edge (sibling of the
  // row button, never nested); the visible affordance is a 16×4 brand grip.
  handleBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    touchAction: 'none',
    zIndex: 2,
  },
  handleGrip: {
    width: 16,
    height: 4,
    borderRadius: 999,
    background: BRAND_FILL,
    boxShadow: '0 0 0 1px var(--color-background-card)',
  },
  // Ring flash overlay for ticker/drops jumps.
  ringFlash: {
    position: 'absolute',
    inset: 2,
    borderRadius: 10,
    border: `2px solid ${BRAND_ACCENT}`,
    pointerEvents: 'none',
    zIndex: 3,
  },
  // EXPIRED — dimmed 60px two-line rows, trailing 36px Rewatch secondary.
  expiredRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  expiredText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  expiredName: {
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rewatchBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bottomSpacer: {height: 24},
  // Compact true-empty for an emptied READY card (no action button —
  // creation is not this section's verb).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 24,
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
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // TAB BAR — exactly 64px sticky bottom z20, 4 flex:1 tabItems.
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
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
    background: BRAND_FILL,
    color: BADGE_TEXT,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: '16px',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0) pinned 76px above the viewport
  // bottom (64px tabBar + 12px); always mounted for aria-live. One toast,
  // no timers: it persists until Undo, replacement, or close.
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
  toast: {
    position: 'absolute',
    bottom: 0,
    insetInline: 16,
    minHeight: 48,
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
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, detents 55% / calc(100% − 56px).
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
    position: 'relative',
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  doneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BADGE_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // Sheet ellipsis menu — anchored card, 44px rows, z42 (above the sheet).
  sheetMenu: {
    position: 'absolute',
    top: 48,
    left: 8,
    zIndex: 42,
    minWidth: 220,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
    fontSize: 16,
  },
  menuRowDanger: {color: 'var(--color-error)'},
  // Sheet body pieces.
  monogramRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    marginBottom: 12,
  },
  monoTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 700,
  },
  monoText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  bigChartWrap: {marginBottom: 16},
  scrubReadout: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 8,
  },
  scrubReadoutCaption: {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  scrubTrackWrap: {position: 'relative', marginBottom: 4},
  scrubTrack: {
    position: 'relative',
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    // Interactive control boundary at rest — ≥3:1 vs its actual surface:
    // the track sits on the white/dark CARD, so the boundary pair is
    // #767069 on #FFFFFF ≈ 4.4:1 ✓ / #9C948B on ~#1C1917 ≈ 5.8:1 ✓.
    border: '1px solid light-dark(#767069, #9C948B)',
    touchAction: 'none',
  },
  scrubTick: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 1,
    background: 'var(--color-text-secondary)',
    transformOrigin: 'center',
  },
  scrubTickSnapped: {background: BRAND_ACCENT},
  scrubThumb: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginTop: -22,
    marginLeft: -22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    touchAction: 'none',
  },
  scrubThumbDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: BRAND_FILL,
    // Thumb boundary vs the muted track (~#F0EEEC): raw #D97706 alone is
    // ≈2.8:1, so a 2px #B45309 ring carries the ≥3:1 boundary (≈4.3:1
    // light; #FBBF24 on the dark muted ~#2A2520 clears ≈7:1 by fill alone).
    border: `2px solid ${BRAND_ACCENT}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  scrubLabels: {position: 'relative', height: 28},
  scrubLabel: {
    position: 'absolute',
    top: 2,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'pre',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    minHeight: 44,
  },
  stepper: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    // 44px hit reached via the row's vertical padding per foundations.
    paddingBlock: 6,
    marginBlock: -6,
  },
  stepHalfDisabled: {opacity: 0.35},
  stepHairline: {width: 1, background: 'var(--color-border)'},
  stepValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 48,
    textAlign: 'center',
  },
  pctBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  previewRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: '8px 12px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
  },
  previewIcon: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  previewText: {
    fontSize: 13,
    lineHeight: 1.45,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
  },
  // ADD SHEET — 60px suggestion rows.
  addIntro: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 12px'},
  addRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 12,
  },
  addRowAdded: {opacity: 0.5},
  // DROPS FEED — 60px two-line rows, trailing green pct.
  dropRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  dropPct: {
    fontSize: 16,
    fontWeight: 600,
    color: GREEN_READY,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // ALERTS — 44px whole-row switches.
  switchRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  switchLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
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
    transition: 'transform 200ms ease',
  },
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  utilityValue: {
    marginLeft: 'auto',
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  utilityChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // PROFILE.
  profileHero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingBlock: 24,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BAND_FILL,
    color: BRAND_ACCENT,
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
  },
  profileName: {fontSize: 17, fontWeight: 600, margin: 0},
  profileMeta: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
};

// ---------------------------------------------------------------------------
// FIXTURES — 14 items, dual-field (display strings render from numeric
// fields), ids letter-prefixed in fixture order so section order is the
// stable id sort the spec demands. Cross-check ledger (verified by hand):
// READY savings 71+16+22 = $109 ✓ (Arc 220−149, Dutch 95−79, Duvet
// 140−118); WATCHING gaps 14+50+34+12+50+38+19+7+22 = $246 ✓; counts
// 3+9+2 = 14 ✓; ticker percents 33/182 = 18.1→18 ✓, 6/104 = 5.8→6 ✓,
// 3/45 = 6.7→7 ✓; drops feed 15/264 = 5.7→6 ✓, 8/126 = 6.3→6 ✓,
// 9/88 = 10.2→10 ✓. Walnut migration: 246−14 = $232 ✓, READY·4,
// WATCHING·8, badge 3→4, header still 14. All dates fixed strings.
// ---------------------------------------------------------------------------

interface WatchItem {
  id: string;
  name: string;
  currentPrice: number; // whole dollars — every render uses usd()
  wasPrice: number | null; // list price for READY savings; null = 'at target'
  targetPrice: number;
  histLow: number;
  low30: number;
  seed: number; // genSeries seed + monogram hue (seed*37 % 360)
  expired: boolean;
  expiredOn: string | null; // 'Jun 20' — fixed string, never a Date
}

const ITEMS: WatchItem[] = [
  // READY (current <= target) ------------------------------------------------
  {id: 'a-arc-lamp', name: 'Arc Floor Lamp', currentPrice: 149, wasPrice: 220, targetPrice: 160, histLow: 142, low30: 149, seed: 7, expired: false, expiredOn: null},
  {id: 'b-dutch-oven', name: 'Cast Iron Dutch Oven', currentPrice: 79, wasPrice: 95, targetPrice: 85, histLow: 76, low30: 79, seed: 11, expired: false, expiredOn: null},
  {id: 'c-linen-duvet', name: 'Linen Duvet Cover', currentPrice: 118, wasPrice: 140, targetPrice: 120, histLow: 109, low30: 118, seed: 4, expired: false, expiredOn: null},
  // WATCHING (current > target) — %away derives: walnut 14/139→10%,
  // grinder 50/249→20%, rug 34/184→18%, pour-over 12/64→19%, frame
  // 50/429→12%, monitors 38/318→12%, merino 19/98→19%, plugs 7/42→17%,
  // vest 22/132→17% — all match the spec table ✓.
  {id: 'd-walnut-shelf', name: 'Walnut Desk Shelf', currentPrice: 139, wasPrice: null, targetPrice: 125, histLow: 121, low30: 129, seed: 5, expired: false, expiredOn: null},
  {id: 'e-espresso-grinder', name: 'Espresso Grinder', currentPrice: 249, wasPrice: null, targetPrice: 199, histLow: 189, low30: 236, seed: 13, expired: false, expiredOn: null},
  {id: 'f-wool-rug', name: 'Wool Runner Rug', currentPrice: 184, wasPrice: null, targetPrice: 150, histLow: 148, low30: 172, seed: 8, expired: false, expiredOn: null},
  {id: 'g-pourover-set', name: 'Ceramic Pour-Over Set', currentPrice: 64, wasPrice: null, targetPrice: 52, histLow: 49, low30: 58, seed: 3, expired: false, expiredOn: null},
  {id: 'h-desk-frame', name: 'Standing Desk Frame', currentPrice: 429, wasPrice: null, targetPrice: 379, histLow: 365, low30: 409, seed: 17, expired: false, expiredOn: null},
  // Longest name + 3-digit prices — the 64px-row truncation stress (1).
  {id: 'i-monitor-pair', name: 'Studio Monitor Pair', currentPrice: 318, wasPrice: null, targetPrice: 280, histLow: 275, low30: 302, seed: 9, expired: false, expiredOn: null},
  // Merino: low30 === currentPrice (98) — the '30-day' detent lands at the
  // right edge region of the scrubber (stress 3).
  {id: 'j-merino-throw', name: 'Merino Throw Blanket', currentPrice: 98, wasPrice: null, targetPrice: 79, histLow: 74, low30: 98, seed: 6, expired: false, expiredOn: null},
  {id: 'k-smart-plugs', name: 'Smart Plug 4-Pack', currentPrice: 42, wasPrice: null, targetPrice: 35, histLow: 33, low30: 42, seed: 15, expired: false, expiredOn: null},
  {id: 'l-trail-vest', name: 'Trail Running Vest', currentPrice: 132, wasPrice: null, targetPrice: 110, histLow: 105, low30: 124, seed: 12, expired: false, expiredOn: null},
  // EXPIRED — currentPrice = last seen price.
  {id: 'p-enamel-kettle', name: 'Enamel Kettle', currentPrice: 58, wasPrice: null, targetPrice: 45, histLow: 49, low30: 58, seed: 10, expired: true, expiredOn: 'Jun 20'},
  {id: 'q-felt-mat', name: 'Felt Desk Mat', currentPrice: 34, wasPrice: null, targetPrice: 28, histLow: 30, low30: 34, seed: 2, expired: true, expiredOn: 'Jun 12'},
];

// Add-sheet suggestions — ids sort after every fixture id so an added item
// appends to the WATCHING tail; default target = round(current × 0.9).
interface Suggestion {
  id: string;
  name: string;
  currentPrice: number;
  histLow: number;
  low30: number;
  seed: number;
}

const SUGGESTIONS: Suggestion[] = [
  {id: 'x-cork-mat', name: 'Cork Yoga Mat', currentPrice: 68, histLow: 58, low30: 64, seed: 21},
  {id: 'y-aeropress', name: 'AeroPress Kit', currentPrice: 49, histLow: 42, low30: 47, seed: 19},
  {id: 'z-cable-tray', name: 'Desk Cable Tray', currentPrice: 27, histLow: 22, low30: 25, seed: 14},
];

interface TickerEvent {
  id: string;
  itemId: string;
  line: string;
}

// Fixed 3-event ticker reel; the chevron button IS the cycle path (no
// timers). A 4th 'Target hit' event appends when the signature fires.
const TICKER_BASE: TickerEvent[] = [
  {id: 'tick-arc', itemId: 'a-arc-lamp', line: 'Arc Floor Lamp −18% overnight · now $149'},
  {id: 'tick-merino', itemId: 'j-merino-throw', line: 'Merino Throw −6% today · now $98'},
  {id: 'tick-plugs', itemId: 'k-smart-plugs', line: 'Smart Plug 4-Pack −7% · hit 30-day low $42'},
];

interface DropEvent {
  id: string;
  itemId: string;
  fromPrice: number;
  toPrice: number;
  pct: number; // round(100 × (from−to)/from) — cross-checked above
  when: string;
}

const DROPS: DropEvent[] = [
  {id: 'drop-arc', itemId: 'a-arc-lamp', fromPrice: 182, toPrice: 149, pct: 18, when: 'Overnight'},
  {id: 'drop-merino', itemId: 'j-merino-throw', fromPrice: 104, toPrice: 98, pct: 6, when: 'Today'},
  {id: 'drop-plugs', itemId: 'k-smart-plugs', fromPrice: 45, toPrice: 42, pct: 7, when: 'Today · 30-day low'},
  {id: 'drop-grinder', itemId: 'e-espresso-grinder', fromPrice: 264, toPrice: 249, pct: 6, when: 'Jul 1'},
  {id: 'drop-duvet', itemId: 'c-linen-duvet', fromPrice: 126, toPrice: 118, pct: 6, when: 'Jun 30'},
  {id: 'drop-dutch', itemId: 'b-dutch-oven', fromPrice: 88, toPrice: 79, pct: 10, when: 'Jun 29'},
];

// ---------------------------------------------------------------------------
// PURE HELPERS — status is DERIVED, never stored: ready = !expired &&
// target >= current, so migration falls out of target edits automatically.
// ---------------------------------------------------------------------------

function usd(n: number): string {
  return `$${n}`;
}

function isReady(item: WatchItem): boolean {
  return !item.expired && item.targetPrice >= item.currentPrice;
}

function pctAway(item: WatchItem): number {
  return Math.round(((item.currentPrice - item.targetPrice) / item.currentPrice) * 100);
}

/** Scrubber range: round(histLow × 0.9) … round(current × 1.1) — Walnut
 * proves it: round(121×0.9)=109, round(139×1.1)=153 (spec: $109–$153 ✓). */
function scrubMin(item: Pick<WatchItem, 'histLow'>): number {
  return Math.round(item.histLow * 0.9);
}
function scrubMax(item: Pick<WatchItem, 'currentPrice'>): number {
  return Math.round(item.currentPrice * 1.1);
}

/** 60-point deterministic series (spec formula verbatim): v = base +
 * amp·sin((i+seed)·0.35) + 0.5·amp·sin((i+seed·3)·0.11), rounded, point 59
 * forced = currentPrice. base = current and amp = (current−histLow)/1.5 so
 * the series trough lands ≈ histLow (the historic-low marker sits at the
 * series min). Cached per item id — pure fn of frozen fixture fields. */
const seriesCache = new Map<string, number[]>();
function seriesFor(item: Pick<WatchItem, 'id' | 'seed' | 'currentPrice' | 'histLow'>): number[] {
  const cached = seriesCache.get(item.id);
  if (cached != null) return cached;
  const amp = Math.max(3, Math.round((item.currentPrice - item.histLow) / 1.5));
  const pts: number[] = [];
  for (let i = 0; i < 60; i++) {
    const v = item.currentPrice + amp * Math.sin((i + item.seed) * 0.35) + 0.5 * amp * Math.sin((i + item.seed * 3) * 0.11);
    pts.push(Math.round(v));
  }
  pts[59] = item.currentPrice;
  seriesCache.set(item.id, pts);
  return pts;
}

interface ChartGeom {
  lo: number;
  hi: number;
  points: string;
  minIndex: number;
  minValue: number;
  yFor: (v: number) => number;
  dollarsPerPx: number;
}

/** Shared row/sheet chart geometry. The domain spans the FULL scrubber
 * range so the band handle's dy→dollars map stays honest across the whole
 * drag (dollarsPerPx = domain / height). */
function chartGeomFor(item: WatchItem, width: number, height: number): ChartGeom {
  const series = seriesFor(item);
  const lo = Math.min(Math.min(...series), scrubMin(item)) - 2;
  const hi = Math.max(Math.max(...series), scrubMax(item)) + 2;
  const yFor = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  let minIndex = 0;
  for (let i = 1; i < series.length; i++) {
    if (series[i] < series[minIndex]) minIndex = i;
  }
  const step = width / 59;
  const points = series.map((v, i) => `${(i * step).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ');
  return {lo, hi, points, minIndex, minValue: series[minIndex], yFor, dollarsPerPx: (hi - lo) / height};
}

interface Detent {
  value: number;
  labels: string[];
}

/** Three data-derived detents (historic low · 30-day low · −10% of
 * current). Deterministic merge rule (stress 3): after an ascending sort,
 * any tick within $1 of the previous surviving tick merges into it and
 * stacks its label — one tick, multi-line label. */
function detentsFor(item: WatchItem): Detent[] {
  const tenOff = Math.round(item.currentPrice * 0.9);
  const raw = [
    {value: item.histLow, label: `Low ${usd(item.histLow)}`},
    {value: item.low30, label: `30-day ${usd(item.low30)}`},
    {value: tenOff, label: `−10% ${usd(tenOff)}`},
  ].sort((a, b) => a.value - b.value);
  const merged: Detent[] = [];
  for (const d of raw) {
    const last = merged[merged.length - 1];
    if (last != null && Math.abs(d.value - last.value) <= 1) last.labels.push(d.label);
    else merged.push({value: d.value, labels: [d.label]});
  }
  return merged;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Deterministic monogram hue per spec: seed × 37 mod 360. Tile pairs keep
 * initials ≥4.5:1: light = hsl(H 60% 26%) text on hsl(H 75% 88%) fill
 * (≈6–8:1 across hues); dark = hsl(H 70% 78%) on hsl(H 45% 22%) (≈6–9:1). */
function monoColors(seed: number): {bg: string; fg: string} {
  const hue = (seed * 37) % 360;
  return {
    bg: `light-dark(hsl(${hue} 75% 88%), hsl(${hue} 45% 22%))`,
    fg: `light-dark(hsl(${hue} 60% 26%), hsl(${hue} 70% 78%))`,
  };
}

function initialsFor(name: string): string {
  const words = name.split(' ');
  return (words[0]?.[0] ?? '') + (words[1]?.[0] ?? '');
}

// ---------------------------------------------------------------------------
// HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * 390px mobile stage from the desktop stage. */
function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) return undefined;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) setWidth(rect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
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
// BRAND MARK — 28px Kestrel eye in the 44×44 nav slot: text-primary outer
// eye + pupil (a sharp downward tick-arrow) with the raw-amber iris ring
// (decorative; adjacent h1 carries the name).
// ---------------------------------------------------------------------------

function KestrelMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M2.5 14 C6 7.5, 22 7.5, 25.5 14 C22 20.5, 6 20.5, 2.5 14 Z"
          stroke="var(--color-text-primary)"
          strokeWidth="1.8"
        />
        <circle cx="14" cy="14" r="6" stroke={BRAND_FILL} strokeWidth="2.2" />
        <path
          d="M14 10.5v5m0 0l-2.2-2.2M14 15.5l2.2-2.2"
          stroke="var(--color-text-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SPARKLINE — shared row (100/80×36) and sheet (fluid×120) chart. Layers:
// target-band rect (BAND_FILL wash + 1px BRAND_FILL top edge), 1.5px
// text-secondary polyline, historic-low 3px brand dot + 8px flag tick.
// Decorative: aria-hidden; the row button + sheet readouts carry the data.
// ---------------------------------------------------------------------------

interface SparklineProps {
  item: WatchItem;
  width: number;
  height: number;
  strokeWidth: number;
}

function Sparkline({item, width, height, strokeWidth}: SparklineProps) {
  const geom = chartGeomFor(item, width, height);
  const bandY = clamp(geom.yFor(item.targetPrice), 0, height);
  const step = width / 59;
  const minX = geom.minIndex * step;
  const minY = geom.yFor(geom.minValue);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden style={{display: 'block', overflow: 'visible'}}>
      <rect x={0} y={bandY} width={width} height={Math.max(0, height - bandY)} fill={BAND_FILL} />
      <rect x={0} y={bandY - 0.5} width={width} height={1} fill={BRAND_FILL} />
      <polyline points={geom.points} stroke="var(--color-text-secondary)" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={minX} y1={minY} x2={minX} y2={minY + 8} stroke={BRAND_FILL} strokeWidth={1.5} />
      <circle cx={minX} cy={minY} r={3} fill={BRAND_FILL} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SPARKBAND ROW — the sanctioned custom 64px row: full-row <button> named
// by the item (opens the target sheet) + a SIBLING 44×44 band-handle
// button overlaid on the sparkline (pointer drag maps dy→dollars via the
// row's y-scale; a clean click is the button path into the same sheet).
// ---------------------------------------------------------------------------

interface SparkbandRowProps {
  item: WatchItem;
  sparkW: number;
  isLast: boolean;
  flashSeq: number | null;
  onOpen: (opener: HTMLElement) => void;
  onTargetChange: (id: string, next: number, undoBase: number) => void;
  onFlashEnd: () => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}

function SparkbandRow({item, sparkW, isLast, flashSeq, onOpen, onTargetChange, onFlashEnd, registerRef}: SparkbandRowProps) {
  const ready = isReady(item);
  const geom = chartGeomFor(item, sparkW, 36);
  // Row anatomy: 16 pad + [text 1fr] 16 gap [spark] 16 gap [price 64] + 16
  // pad — at 390 the fixed columns sum 130+100+64+32 = 326 ✓. The handle
  // wrapper aligns to the sparkline column: right = 16+64+16 = 96.
  const bandY = clamp(geom.yFor(item.targetPrice), 0, 36);
  const handleTop = clamp(14 + bandY - 22, -2, 22);
  const dragRef = useRef<{startY: number; startTarget: number; moved: boolean} | null>(null);

  const meta = ready
    ? item.wasPrice != null
      ? `was ${usd(item.wasPrice)} · save ${usd(item.wasPrice - item.currentPrice)}`
      : `at target · ${usd(item.targetPrice)}`
    : `target ${usd(item.targetPrice)} · ${pctAway(item)}% away`;

  const onHandlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragRef.current = {startY: event.clientY, startTarget: item.targetPrice, moved: false};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onHandlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    const dy = drag.startY - event.clientY;
    if (Math.abs(dy) > 3) drag.moved = true;
    if (!drag.moved) return;
    const next = clamp(Math.round(drag.startTarget + dy * geom.dollarsPerPx), scrubMin(item), scrubMax(item));
    if (next !== item.targetPrice) onTargetChange(item.id, next, drag.startTarget);
  };
  const onHandlePointerUp = () => {
    // Value already committed live; keep `moved` so the trailing click is
    // swallowed by onHandleClick below.
  };
  const onHandleClick = (event: {currentTarget: HTMLElement}) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.moved) return; // drag settled — not a click
    onOpen(event.currentTarget);
  };

  return (
    <div style={styles.sparkRowOuter} ref={el => registerRef(item.id, el)}>
      <button
        type="button"
        className="kst-btn kst-focusable"
        style={{...styles.sparkRowBtn, gridTemplateColumns: `minmax(0, 1fr) ${sparkW}px 64px`}}
        aria-label={`${item.name}, ${usd(item.currentPrice)}${ready ? ', ready to buy' : `, target ${usd(item.targetPrice)}`} — set target`}
        onClick={event => onOpen(event.currentTarget)}>
        <span style={styles.rowTextStack}>
          <span style={styles.rowName}>{item.name}</span>
          <span style={styles.rowMeta}>{meta}</span>
        </span>
        <Sparkline item={item} width={sparkW} height={36} strokeWidth={1.5} />
        <span style={styles.priceCol}>
          <span style={{...styles.priceCur, ...(ready ? styles.priceCurReady : null)}}>{usd(item.currentPrice)}</span>
          {ready ? (
            item.wasPrice != null ? (
              <span style={styles.priceWas}>{usd(item.wasPrice)}</span>
            ) : (
              <span style={styles.priceSub}>target</span>
            )
          ) : (
            <span style={styles.priceSub}>{usd(item.targetPrice)}</span>
          )}
        </span>
      </button>
      {/* Band-handle — sibling of the row button (nested buttons are
          invalid); 44×44 hit padded around the 16×4 grip on the band edge. */}
      <button
        type="button"
        className="kst-btn kst-focusable"
        style={{...styles.handleBtn, insetInlineEnd: 96 + sparkW / 2 - 22, top: handleTop}}
        aria-label={`Drag to adjust target for ${item.name} — ${usd(item.targetPrice)}; opens the editor on tap`}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onClick={onHandleClick}>
        <span style={styles.handleGrip} aria-hidden />
      </button>
      {flashSeq != null ? (
        <span
          key={flashSeq}
          className="kst-ring-flash"
          style={styles.ringFlash}
          aria-hidden
          onAnimationEnd={onFlashEnd}
        />
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DROP TICKER — 44px strip: event <button> (jump + ring flash) and a
// SEPARATE 44×44 chevron button advancing tickerIndex (the deterministic
// cycle path — no timers). Overflowing text clips behind a 24px fade mask,
// applied only when a ResizeObserver measures scrollWidth > clientWidth.
// ---------------------------------------------------------------------------

interface DropTickerProps {
  events: TickerEvent[];
  index: number;
  onJump: (itemId: string) => void;
  onCycle: () => void;
}

function DropTicker({events, index, onJump, onCycle}: DropTickerProps) {
  const event = events[index % events.length];
  const lineRef = useRef<HTMLSpanElement | null>(null);
  const [masked, setMasked] = useState(false);
  useEffect(() => {
    const el = lineRef.current;
    if (el == null) return undefined;
    const measure = () => setMasked(el.scrollWidth > el.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [event.id]);
  return (
    <div style={styles.ticker}>
      <button
        type="button"
        className="kst-btn kst-focusable"
        style={styles.tickerBtn}
        aria-label={`${event.line} — jump to item`}
        onClick={() => onJump(event.itemId)}>
        <span style={styles.tickerIcon}>
          <Icon icon={ZapIcon} size="sm" color="inherit" />
        </span>
        <span ref={lineRef} style={{...styles.tickerLine, ...(masked ? styles.tickerLineMasked : null)}}>
          {event.line}
        </span>
      </button>
      <button
        type="button"
        className="kst-btn kst-focusable"
        style={styles.iconBtn}
        aria-label={`Next drop event, ${(index % events.length) + 1} of ${events.length}`}
        onClick={onCycle}>
        <Icon icon={ChevronRightIcon} size="md" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TARGET SCRUBBER — sheet-only slider: 48px bordered track, 28px brand
// thumb in a 44px hit, data-derived detent ticks with magnetic $2 snap
// (120ms scale pulse, removed under reduced motion — the snapped tick's
// brand color still encodes the state). Full keyboard map: role='slider',
// ←/→ ±$1, PageUp/Down detent-to-detent, Home/End range edges. Labels
// drop to ticks + aria-valuetext when the track measures <260px.
// ---------------------------------------------------------------------------

interface TargetScrubberProps {
  item: WatchItem;
  onChange: (next: number, undoBase: number) => void;
}

function TargetScrubber({item, onChange}: TargetScrubberProps) {
  const min = scrubMin(item);
  const max = scrubMax(item);
  const value = item.targetPrice;
  const detents = detentsFor(item);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const trackW = useElementWidth(trackRef);
  const showLabels = trackW === 0 || trackW >= 260;
  const dragRef = useRef<{startTarget: number} | null>(null);
  const [snap, setSnap] = useState<{value: number; seq: number} | null>(null);

  const pctFor = (v: number) => ((v - min) / (max - min)) * 100;

  const applyPointerValue = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return;
    let next = clamp(Math.round(min + ((clientX - rect.left) / rect.width) * (max - min)), min, max);
    // Magnetic snap: within $2 of a detent the value snaps; the tick
    // pulses once per new snap (transform-only).
    for (const d of detents) {
      if (Math.abs(next - d.value) <= 2) {
        if (next !== d.value) next = d.value;
        setSnap(prev => (prev?.value === d.value ? prev : {value: d.value, seq: (prev?.seq ?? 0) + 1}));
        break;
      }
    }
    const undoBase = dragRef.current?.startTarget ?? value;
    if (next !== value) onChange(next, undoBase);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {startTarget: value};
    event.currentTarget.setPointerCapture(event.pointerId);
    applyPointerValue(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current == null) return;
    applyPointerValue(event.clientX);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = clamp(value - 1, min, max);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = clamp(value + 1, min, max);
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    else if (event.key === 'PageUp') {
      const up = detents.find(d => d.value > value);
      next = up?.value ?? max;
    } else if (event.key === 'PageDown') {
      const downs = detents.filter(d => d.value < value);
      next = downs.length > 0 ? downs[downs.length - 1].value : min;
    }
    if (next == null) return;
    event.preventDefault();
    if (next !== value) onChange(next, value);
  };

  return (
    <div>
      <div style={styles.scrubReadout}>
        {usd(value)}
        <span style={styles.scrubReadoutCaption}>Target price</span>
      </div>
      <div style={styles.scrubTrackWrap}>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          className="kst-focusable"
          aria-label={`Target price for ${item.name}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${usd(value)} target`}
          style={styles.scrubTrack}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}>
          {detents.map(d => (
            <span
              key={`${d.value}-${snap?.value === d.value ? snap.seq : 0}`}
              className={snap?.value === d.value ? 'kst-snap-pulse' : undefined}
              style={{
                ...styles.scrubTick,
                left: `${pctFor(d.value)}%`,
                ...(value === d.value ? styles.scrubTickSnapped : null),
              }}
              aria-hidden
            />
          ))}
          <span style={{...styles.scrubThumb, left: `${pctFor(value)}%`}} aria-hidden>
            <span style={styles.scrubThumbDot} />
          </span>
        </div>
      </div>
      {showLabels ? (
        <div style={styles.scrubLabels} aria-hidden>
          {detents.map(d => (
            <span
              key={d.value}
              style={{
                ...styles.scrubLabel,
                left: `${clamp(pctFor(d.value), 8, 92)}%`,
                ...(value === d.value ? {color: BRAND_ACCENT, fontWeight: 600} : null),
              }}>
              {d.labels.join('\n')}
            </span>
          ))}
        </div>
      ) : (
        <div style={{height: 4}} aria-hidden />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// 55% ↔ calc(100% − 56px); drag is garnish, >120px past medium closes),
// 52px header (leading slot for the ellipsis menu trigger, 44×44 X
// trailing), focus-trapped dialog; body is the one legal inner scroller.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  leading?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, leading, footer, children}: SheetProps) {
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
    if (!movedRef.current) return;
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
      className="kst-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="kst-btn kst-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        {leading ?? <span aria-hidden />}
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="kst-btn kst-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWITCH ROW — whole-row role='switch' (44px); 51×31 track, 27px white
// thumb traveling 20px (transform-only; instant under reduced motion). ON
// track = BRAND_FILL (#D97706 vs white card ≈3.1:1 — non-text fill ✓);
// OFF track = SWITCH_OFF_TRACK (≥3:1 rest boundary, math at declaration).
// ---------------------------------------------------------------------------

interface SwitchRowProps {
  label: string;
  on: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
}

function SwitchRow({label, on, reducedMotion, onToggle}: SwitchRowProps) {
  return (
    <button type="button" role="switch" aria-checked={on} className="kst-btn kst-focusable" style={styles.switchRow} onClick={onToggle}>
      <span style={styles.switchLabel}>{label}</span>
      <span style={{...styles.switchTrack, background: on ? BRAND_FILL : SWITCH_OFF_TRACK}} aria-hidden>
        <span
          style={{
            ...styles.switchThumb,
            transform: on ? 'translateX(20px)' : undefined,
            ...(reducedMotion ? {transition: 'none'} : null),
          }}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useWatchlist(): {items, ui} behind one update(id,
// patch); status is derived (isReady), so target edits ARE migrations.
// Per-tab scroll offsets live in a ref (they never drive a render).
// ---------------------------------------------------------------------------

type TabId = 'watch' | 'drops' | 'alerts' | 'profile';

type UndoPayload =
  | {type: 'target'; itemId: string; targetPrice: number}
  | {type: 'reinsert'; item: WatchItem; index: number}
  | {type: 'remove'; itemId: string};

interface Toast {
  seq: number;
  msg: string;
  undo: UndoPayload | null;
}

interface UiState {
  tab: TabId;
  sheet: {itemId: string | null; mode: 'edit' | 'add'; detent: 'medium' | 'large'} | null;
  sheetMenuOpen: boolean;
  tickerIndex: number;
  hitEventIds: string[];
  toast: Toast | null;
  updatedCaption: string;
  flash: {itemId: string; seq: number} | null;
  pendingJumpId: string | null;
  alertPrefs: {pushDrops: boolean; pushTarget: boolean; weeklyDigest: boolean};
}

interface KestrelEntities {
  items: {byId: Record<string, WatchItem>; order: string[]};
  ui: UiState;
}

const INITIAL_ENTITIES: KestrelEntities = {
  items: {
    byId: Object.fromEntries(ITEMS.map(item => [item.id, item])),
    order: ITEMS.map(item => item.id),
  },
  ui: {
    tab: 'watch',
    sheet: null,
    sheetMenuOpen: false,
    tickerIndex: 0,
    hitEventIds: [],
    toast: null,
    updatedCaption: 'Updated 8:05 AM',
    flash: null,
    pendingJumpId: null,
    alertPrefs: {pushDrops: true, pushTarget: true, weeklyDigest: false},
  },
};

function useWatchlist() {
  const [entities, setEntities] = useState<KestrelEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof KestrelEntities>(id: K, patch: Partial<KestrelEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

const TAB_DEFS = [
  {id: 'watch' as const, label: 'Watchlist', icon: EyeIcon},
  {id: 'drops' as const, label: 'Drops', icon: TrendingDownIcon},
  {id: 'alerts' as const, label: 'Alerts', icon: BellIcon},
  {id: 'profile' as const, label: 'Profile', icon: UserIcon},
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePriceDropWatchlistTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Shell width decides the sparkline column: 100px ≥360 container, 80 below.
  const shellWidth = isDesktopColumn ? 430 : wrapWidth;
  const sparkW = shellWidth > 0 && shellWidth < 360 ? 80 : 100;

  const {entities, update, setEntities} = useWatchlist();
  const {items, ui} = entities;

  // DERIVED — every aggregate re-derives from the rows it summarizes.
  const all = items.order.map(id => items.byId[id]);
  const readyItems = all.filter(isReady);
  const watchingItems = all.filter(item => !item.expired && !isReady(item));
  const expiredItems = all.filter(item => item.expired);
  const totalCount = all.length; // 3+9+2 = 14 at rest ✓
  const readySavings = readyItems.reduce((sum, item) => sum + (item.wasPrice != null ? item.wasPrice - item.currentPrice : 0), 0); // $109 ✓
  const watchGap = watchingItems.reduce((sum, item) => sum + (item.currentPrice - item.targetPrice), 0); // $246 ✓ → $232 post-migration ✓
  const tickerEvents: TickerEvent[] = [
    ...TICKER_BASE,
    ...ui.hitEventIds.map(id => ({
      id: `tick-hit-${id}`,
      itemId: id,
      line: `Target hit: ${items.byId[id]?.name ?? 'Item'} · Ready to buy`,
    })),
  ];
  const sheetItem = ui.sheet?.itemId != null ? (items.byId[ui.sheet.itemId] ?? null) : null;

  // Focus plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [navTitleShown, setNavTitleShown] = useState(false);

  // FLIP plumbing — rects recorded every render; deltas animate only when
  // a mutation flagged a resort (transform-only spring, instant under
  // reduced motion).
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const prevTops = useRef(new Map<string, number>());
  const flipPendingRef = useRef(false);
  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el != null) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, []);
  useLayoutEffect(() => {
    const animate = flipPendingRef.current && !reducedMotion;
    flipPendingRef.current = false;
    rowRefs.current.forEach((el, id) => {
      const top = el.getBoundingClientRect().top;
      const prev = prevTops.current.get(id);
      if (animate && prev != null && Math.abs(prev - top) > 1) {
        el.animate([{transform: `translateY(${prev - top}px)`}, {transform: 'none'}], {
          duration: 240,
          easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
        });
      }
      prevTops.current.set(id, top);
    });
  });

  // Per-tab scroll persistence (the demo's outer scroller owns scroll).
  const scrollByTabRef = useRef<Record<TabId, number>>({watch: 0, drops: 0, alerts: 0, profile: 0});
  const getScroller = useCallback((): HTMLElement | null => {
    let el: HTMLElement | null = wrapRef.current?.parentElement ?? null;
    while (el != null) {
      const overflowY = window.getComputedStyle(el).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4) return el;
      el = el.parentElement;
    }
    return (document.scrollingElement as HTMLElement | null) ?? null;
  }, []);
  useLayoutEffect(() => {
    const scroller = getScroller();
    if (scroller != null) scroller.scrollTop = scrollByTabRef.current[ui.tab] ?? 0;
  }, [ui.tab, getScroller]);

  // Large-title collapse — IntersectionObserver on the 1px sentinel below
  // the largeTitle row toggles the navBar title (200ms opacity; swap under
  // reduced motion). Re-observes per tab (the sentinel remounts).
  useEffect(() => {
    const el = sentinelRef.current;
    if (el == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry != null) setNavTitleShown(!entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ui.tab]);

  // Sheet focus — preventScroll (amendment): a plain .focus() scroll-
  // reveals the animating sheet inside the locked overflow-hidden shell.
  useEffect(() => {
    if (ui.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [ui.sheet != null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape closes the TOPMOST overlay only: sheet menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.sheetMenuOpen) update('ui', {sheetMenuOpen: false});
      else if (ui.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.sheetMenuOpen, ui.sheet != null]);

  // MUTATORS ------------------------------------------------------------------

  const nextSeq = (prev: KestrelEntities) => (prev.ui.toast?.seq ?? 0) + 1;

  /** THE mutator behind every target edit (band drag, scrubber, stepper,
   * ±5%): clamps to the scrub range and, when the edit crosses market
   * price upward, fires the whole consequence chain — FLIP resort, count
   * re-derives, ticker event, Undo toast armed with the DRAG-START value. */
  const setTarget = (id: string, next: number, undoBase: number) => {
    setEntities(prev => {
      const item = prev.items.byId[id];
      if (item == null) return prev;
      const clamped = clamp(next, scrubMin(item), scrubMax(item));
      if (clamped === item.targetPrice) return prev;
      const wasReady = isReady(item);
      const updated = {...item, targetPrice: clamped};
      const nowReady = isReady(updated);
      let uiNext = prev.ui;
      if (wasReady !== nowReady) {
        flipPendingRef.current = true;
        if (nowReady) {
          uiNext = {
            ...uiNext,
            toast: {seq: nextSeq(prev), msg: `${item.name} moved to Ready to buy`, undo: {type: 'target', itemId: id, targetPrice: undoBase}},
            hitEventIds: uiNext.hitEventIds.includes(id) ? uiNext.hitEventIds : [...uiNext.hitEventIds, id],
          };
        }
      }
      return {...prev, items: {...prev.items, byId: {...prev.items.byId, [id]: updated}}, ui: uiNext};
    });
  };

  const applyUndo = () => {
    setEntities(prev => {
      const undo = prev.ui.toast?.undo;
      if (undo == null) return prev;
      flipPendingRef.current = true;
      const restoredToast: Toast = {seq: nextSeq(prev), msg: 'Restored', undo: null};
      if (undo.type === 'target') {
        const item = prev.items.byId[undo.itemId];
        if (item == null) return {...prev, ui: {...prev.ui, toast: restoredToast}};
        return {
          ...prev,
          items: {...prev.items, byId: {...prev.items.byId, [undo.itemId]: {...item, targetPrice: undo.targetPrice}}},
          ui: {...prev.ui, toast: restoredToast},
        };
      }
      if (undo.type === 'reinsert') {
        const order = [...prev.items.order];
        order.splice(clamp(undo.index, 0, order.length), 0, undo.item.id);
        return {
          ...prev,
          items: {byId: {...prev.items.byId, [undo.item.id]: undo.item}, order},
          ui: {...prev.ui, toast: restoredToast},
        };
      }
      // 'remove' — undo of an add.
      const {[undo.itemId]: _removed, ...byId} = prev.items.byId;
      return {
        ...prev,
        items: {byId, order: prev.items.order.filter(id => id !== undo.itemId)},
        ui: {...prev.ui, toast: restoredToast},
      };
    });
  };

  // Sheet lifecycle — focus restores to the opener on every close path.
  const openSheetFor = (itemId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {sheet: {itemId, mode: 'edit', detent: 'medium'}, sheetMenuOpen: false});
  };
  const openAddSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {sheet: {itemId: null, mode: 'add', detent: 'medium'}, sheetMenuOpen: false});
  };
  const closeSheet = () => {
    update('ui', {sheet: null, sheetMenuOpen: false});
    sheetOpenerRef.current?.focus();
  };

  /** undoOverConfirm: 'Stop watching' executes immediately from the sheet
   * menu; Undo reinserts at the EXACT prior index (order array splice). */
  const stopWatching = (id: string) => {
    setEntities(prev => {
      const item = prev.items.byId[id];
      if (item == null) return prev;
      const index = prev.items.order.indexOf(id);
      const {[id]: _gone, ...byId} = prev.items.byId;
      flipPendingRef.current = true;
      return {
        ...prev,
        items: {byId, order: prev.items.order.filter(i => i !== id)},
        ui: {
          ...prev.ui,
          sheet: null,
          sheetMenuOpen: false,
          toast: {seq: nextSeq(prev), msg: `Stopped watching ${item.name}`, undo: {type: 'reinsert', item, index}},
        },
      };
    });
    sheetOpenerRef.current = null;
    shellRef.current?.focus({preventScroll: true});
  };

  const rewatch = (id: string) => {
    setEntities(prev => {
      const item = prev.items.byId[id];
      if (item == null) return prev;
      flipPendingRef.current = true;
      return {
        ...prev,
        items: {...prev.items, byId: {...prev.items.byId, [id]: {...item, expired: false, expiredOn: null}}},
        ui: {...prev.ui, toast: {seq: nextSeq(prev), msg: `Watching ${item.name} again — target ${usd(item.targetPrice)}`, undo: null}},
      };
    });
  };

  const addSuggestion = (s: Suggestion) => {
    setEntities(prev => {
      if (prev.items.byId[s.id] != null) return prev;
      const target = Math.round(s.currentPrice * 0.9);
      const item: WatchItem = {
        id: s.id,
        name: s.name,
        currentPrice: s.currentPrice,
        wasPrice: null,
        targetPrice: target,
        histLow: s.histLow,
        low30: s.low30,
        seed: s.seed,
        expired: false,
        expiredOn: null,
      };
      flipPendingRef.current = true;
      return {
        ...prev,
        items: {byId: {...prev.items.byId, [s.id]: item}, order: [...prev.items.order, s.id]},
        ui: {...prev.ui, toast: {seq: nextSeq(prev), msg: `Watching ${s.name} — target ${usd(target)}`, undo: {type: 'remove', itemId: s.id}}},
      };
    });
  };

  const refresh = () => {
    setEntities(prev => ({
      ...prev,
      ui: {...prev.ui, updatedCaption: 'Updated just now', toast: {seq: nextSeq(prev), msg: 'Updated just now', undo: null}},
    }));
  };

  const showToast = (msg: string) => {
    setEntities(prev => ({...prev, ui: {...prev.ui, toast: {seq: nextSeq(prev), msg, undo: null}}}));
  };

  // Tabs — per-tab law: switching persists scroll and closes overlays
  // ONLY; re-tapping the active tab scrolls to top (the one legal reset).
  const selectTab = (next: TabId) => {
    const scroller = getScroller();
    if (next === ui.tab) {
      scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    if (scroller != null) scrollByTabRef.current[ui.tab] = scroller.scrollTop;
    update('ui', {tab: next, sheet: null, sheetMenuOpen: false});
  };

  // Ticker / drops-feed jump: scrollIntoView + brand ring flash on the row
  // — routed through pendingJumpId when it crosses tabs (stress 8: the
  // rowRefs map is keyed by id, so a post-resort row still resolves).
  const performJump = useCallback(
    (itemId: string) => {
      const el = rowRefs.current.get(itemId);
      el?.scrollIntoView({block: 'center', behavior: reducedMotion ? 'auto' : 'smooth'});
      setEntities(prev => ({
        ...prev,
        ui: {...prev.ui, flash: {itemId, seq: (prev.ui.flash?.seq ?? 0) + 1}},
      }));
    },
    [reducedMotion, setEntities],
  );
  const jumpToItem = (itemId: string) => {
    if (ui.tab !== 'watch') {
      const scroller = getScroller();
      if (scroller != null) scrollByTabRef.current[ui.tab] = scroller.scrollTop;
      update('ui', {tab: 'watch', pendingJumpId: itemId, sheet: null, sheetMenuOpen: false});
      return;
    }
    performJump(itemId);
  };
  useEffect(() => {
    if (ui.tab === 'watch' && ui.pendingJumpId != null) {
      const itemId = ui.pendingJumpId;
      update('ui', {pendingJumpId: null});
      performJump(itemId);
    }
  }, [ui.tab, ui.pendingJumpId, performJump, update]);

  // RENDER HELPERS -------------------------------------------------------------

  const renderSparkRows = (rows: WatchItem[]) =>
    rows.map((item, index) => (
      <SparkbandRow
        key={item.id}
        item={item}
        sparkW={sparkW}
        isLast={index === rows.length - 1}
        flashSeq={ui.flash?.itemId === item.id ? ui.flash.seq : null}
        onOpen={opener => openSheetFor(item.id, opener)}
        onTargetChange={setTarget}
        onFlashEnd={() => update('ui', {flash: null})}
        registerRef={registerRef}
      />
    ));

  const largeTitleFor: Record<TabId, string> = {
    watch: `Watching · ${totalCount}`,
    drops: 'Drops',
    alerts: 'Alerts',
    profile: 'Profile',
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // Sheet-body edit controls (declared here so they read the live item).
  const renderEditBody = (item: WatchItem) => {
    const min = scrubMin(item);
    const max = scrubMax(item);
    const value = item.targetPrice;
    const ready = isReady(item);
    const mono = monoColors(item.seed);
    const atMin = value <= min;
    const atMax = value >= max;
    const stepTo = (next: number) => setTarget(item.id, clamp(next, min, max), value);
    return (
      <div>
        <div style={styles.monogramRow}>
          <span style={{...styles.monoTile, background: mono.bg, color: mono.fg}} aria-hidden>
            {initialsFor(item.name)}
          </span>
          <span style={styles.monoText}>
            <span style={styles.rowName}>{item.name}</span>
            <span style={styles.rowMeta}>
              Now {usd(item.currentPrice)} · Low {usd(item.histLow)}
              {item.wasPrice != null ? ` · was ${usd(item.wasPrice)}` : ''}
            </span>
          </span>
        </div>
        <div style={styles.bigChartWrap}>
          <Sparkline item={item} width={Math.max(240, Math.min(430, shellWidth || 390) - 64)} height={120} strokeWidth={2} />
        </div>
        <TargetScrubber item={item} onChange={(next, undoBase) => setTarget(item.id, next, undoBase)} />
        <div style={styles.stepRow}>
          <span style={styles.stepper}>
            <button
              type="button"
              className="kst-btn kst-focusable"
              style={{...styles.stepHalf, ...(atMin ? styles.stepHalfDisabled : null)}}
              aria-label="Decrease target"
              disabled={atMin}
              onClick={() => stepTo(value - 1)}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.stepHairline} aria-hidden />
            <button
              type="button"
              className="kst-btn kst-focusable"
              style={{...styles.stepHalf, ...(atMax ? styles.stepHalfDisabled : null)}}
              aria-label="Increase target"
              disabled={atMax}
              onClick={() => stepTo(value + 1)}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </span>
          <span
            role="spinbutton"
            tabIndex={0}
            className="kst-focusable"
            aria-label={`Target price, dollars`}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={`${usd(value)} target`}
            style={styles.stepValue}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                stepTo(value + 1);
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                stepTo(value - 1);
              }
            }}>
            {usd(value)}
          </span>
          <span style={{flex: 1}} aria-hidden />
          <button type="button" className="kst-btn kst-focusable" style={styles.pctBtn} onClick={() => stepTo(Math.round(value * 0.95))}>
            −5%
          </button>
          <button type="button" className="kst-btn kst-focusable" style={styles.pctBtn} onClick={() => stepTo(Math.round(value * 1.05))}>
            +5%
          </button>
        </div>
        <div style={styles.previewRow}>
          <span style={styles.previewIcon}>
            <Icon icon={BellIcon} size="sm" color="inherit" />
          </span>
          <span style={styles.previewText} aria-live="off">
            {ready
              ? `Ready now — target ${usd(value)} is above the ${usd(item.currentPrice)} price.`
              : `We'll alert you when ${item.name} drops below ${usd(value)} — currently ${usd(item.currentPrice)}, ${pctAway(item)}% away.`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{KESTREL_CSS}</style>
      <div ref={shellRef} style={shellStyle} tabIndex={-1}>
        {/* NAV BAR — brand mark · fade-in compact title · Plus + Refresh. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <KestrelMark />
          </div>
          <div
            style={{
              ...styles.navTitle,
              opacity: navTitleShown ? 1 : 0,
              transition: reducedMotion ? 'none' : 'opacity 200ms ease',
            }}
            aria-hidden={!navTitleShown}>
            {largeTitleFor[ui.tab]}
          </div>
          <div style={styles.navTrailing}>
            {ui.tab === 'watch' ? (
              <>
                <button
                  type="button"
                  className="kst-btn kst-focusable"
                  style={styles.iconBtn}
                  aria-label="Add a watch"
                  onClick={event => openAddSheet(event.currentTarget)}>
                  <Icon icon={PlusIcon} size="md" color="inherit" />
                </button>
                <button type="button" className="kst-btn kst-focusable" style={styles.iconBtn} aria-label="Refresh prices" onClick={refresh}>
                  <Icon icon={RefreshCwIcon} size="md" color="inherit" />
                </button>
              </>
            ) : null}
          </div>
        </header>

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {/* LARGE TITLE — 52px, 28/700; caption slot on the watch tab. */}
          <div style={styles.largeTitle}>
            <h1 style={styles.largeTitleText}>{largeTitleFor[ui.tab]}</h1>
            {ui.tab === 'watch' ? <span style={styles.largeTitleCaption}>{ui.updatedCaption}</span> : null}
          </div>
          {/* 1px collapse sentinel (keyed so the observer re-arms per tab). */}
          <div ref={sentinelRef} key={ui.tab} style={{height: 1}} aria-hidden />

          {ui.tab === 'watch' ? (
            <>
              <DropTicker
                events={tickerEvents}
                index={ui.tickerIndex}
                onJump={jumpToItem}
                onCycle={() => update('ui', {tickerIndex: (ui.tickerIndex + 1) % tickerEvents.length})}
              />
              <div style={styles.sectionHeadRow}>
                <h2 style={styles.sectionHeader}>Ready to buy · {readyItems.length}</h2>
                <span style={styles.sectionTrailing}>{readySavings > 0 ? `${usd(readySavings)} under list` : ''}</span>
              </div>
              <div style={styles.listCard}>
                {readyItems.length > 0 ? (
                  renderSparkRows(readyItems)
                ) : (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyCircle}>
                      <Icon icon={CrosshairIcon} size="lg" color="inherit" />
                    </span>
                    <p style={styles.emptyTitle}>Nothing ready yet</p>
                    <p style={styles.emptyBody}>Items that hit your target appear here.</p>
                  </div>
                )}
              </div>
              {watchingItems.length > 0 ? (
                <>
                  <div style={styles.sectionHeadRow}>
                    <h2 style={styles.sectionHeader}>Watching · {watchingItems.length}</h2>
                    <span style={styles.sectionTrailing}>{usd(watchGap)} to targets</span>
                  </div>
                  <div style={styles.listCard}>{renderSparkRows(watchingItems)}</div>
                </>
              ) : null}
              {expiredItems.length > 0 ? (
                <>
                  <div style={styles.sectionHeadRow}>
                    <h2 style={styles.sectionHeader}>Expired · {expiredItems.length}</h2>
                  </div>
                  <div style={styles.listCard}>
                    {expiredItems.map((item, index) => (
                      <div key={item.id} ref={el => registerRef(item.id, el)}>
                        <div style={styles.expiredRow}>
                          <span style={styles.expiredText}>
                            <span style={styles.expiredName}>{item.name}</span>
                            <span style={styles.rowMeta}>
                              Expired {item.expiredOn} · last {usd(item.currentPrice)}
                            </span>
                          </span>
                          <button type="button" className="kst-btn kst-focusable" style={styles.rewatchBtn} onClick={() => rewatch(item.id)}>
                            Rewatch
                          </button>
                        </div>
                        {index === expiredItems.length - 1 ? null : <div style={styles.rowDivider} />}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              <p style={styles.terminalCaption}>All {totalCount} items</p>
            </>
          ) : null}

          {ui.tab === 'drops' ? (
            <>
              <div style={styles.sectionHeadRow}>
                <h2 style={styles.sectionHeader}>This week · {DROPS.length}</h2>
              </div>
              <div style={styles.listCard}>
                {DROPS.map((drop, index) => {
                  const item = items.byId[drop.itemId];
                  return (
                    <div key={drop.id}>
                      <button
                        type="button"
                        className="kst-btn kst-focusable"
                        style={styles.dropRow}
                        aria-label={`${item?.name ?? 'Item'}, down ${drop.pct} percent, ${usd(drop.fromPrice)} to ${usd(drop.toPrice)} — view in watchlist`}
                        onClick={() => jumpToItem(drop.itemId)}>
                        <span style={styles.rowTextStack}>
                          <span style={styles.rowName}>{item?.name ?? 'Item'}</span>
                          <span style={styles.rowMeta}>
                            {usd(drop.fromPrice)} → {usd(drop.toPrice)} · {drop.when}
                          </span>
                        </span>
                        <span style={{flex: 1}} aria-hidden />
                        <span style={styles.dropPct}>−{drop.pct}%</span>
                      </button>
                      {index === DROPS.length - 1 ? null : <div style={styles.rowDivider} />}
                    </div>
                  );
                })}
              </div>
              <p style={styles.terminalCaption}>All {DROPS.length} drops this week</p>
            </>
          ) : null}

          {ui.tab === 'alerts' ? (
            <>
              <div style={styles.sectionHeadRow}>
                <h2 style={styles.sectionHeader}>Notifications</h2>
              </div>
              <div style={styles.listCard}>
                <SwitchRow
                  label="Price-drop pushes"
                  on={ui.alertPrefs.pushDrops}
                  reducedMotion={reducedMotion}
                  onToggle={() => {
                    const next = !ui.alertPrefs.pushDrops;
                    update('ui', {alertPrefs: {...ui.alertPrefs, pushDrops: next}});
                    showToast(`Price-drop pushes ${next ? 'on' : 'off'}`);
                  }}
                />
                <div style={styles.rowDivider} />
                <SwitchRow
                  label="Target-hit pushes"
                  on={ui.alertPrefs.pushTarget}
                  reducedMotion={reducedMotion}
                  onToggle={() => {
                    const next = !ui.alertPrefs.pushTarget;
                    update('ui', {alertPrefs: {...ui.alertPrefs, pushTarget: next}});
                    showToast(`Target-hit pushes ${next ? 'on' : 'off'}`);
                  }}
                />
                <div style={styles.rowDivider} />
                <SwitchRow
                  label="Weekly digest"
                  on={ui.alertPrefs.weeklyDigest}
                  reducedMotion={reducedMotion}
                  onToggle={() => {
                    const next = !ui.alertPrefs.weeklyDigest;
                    update('ui', {alertPrefs: {...ui.alertPrefs, weeklyDigest: next}});
                    showToast(`Weekly digest ${next ? 'on' : 'off'}`);
                  }}
                />
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="kst-btn kst-focusable"
                  style={styles.utilityRow}
                  onClick={() => showToast('Quiet hours 10 PM – 8 AM — alerts pause overnight')}>
                  <span style={styles.utilityChevron}>
                    <Icon icon={MoonIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.switchLabel}>Quiet hours</span>
                  <span style={styles.utilityValue}>10 PM – 8 AM</span>
                </button>
              </div>
            </>
          ) : null}

          {ui.tab === 'profile' ? (
            <>
              <div style={styles.profileHero}>
                <span style={styles.profileAvatar} aria-hidden>
                  RH
                </span>
                <p style={styles.profileName}>Robin Hale</p>
                <p style={styles.profileMeta}>robin.hale@fastmail.com · watching since March</p>
              </div>
              <div style={styles.sectionHeadRow}>
                <h2 style={styles.sectionHeader}>Account</h2>
              </div>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="kst-btn kst-focusable"
                  style={styles.utilityRow}
                  onClick={() => showToast('Connected: Alder Home, Field Supply, Nordic Audio')}>
                  <span style={styles.switchLabel}>Connected stores</span>
                  <span style={styles.utilityValue}>3</span>
                  <span style={styles.utilityChevron}>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
                <div style={styles.rowDivider} />
                <button type="button" className="kst-btn kst-focusable" style={styles.utilityRow} onClick={() => selectTab('alerts')}>
                  <span style={styles.switchLabel}>Notifications</span>
                  <span style={styles.utilityValue}>Manage</span>
                  <span style={styles.utilityChevron}>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="kst-btn kst-focusable"
                  style={styles.utilityRow}
                  onClick={() => showToast('Prices shown in USD — fixed in this demo')}>
                  <span style={styles.switchLabel}>Currency</span>
                  <span style={styles.utilityValue}>USD</span>
                  <span style={styles.utilityChevron}>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
              </div>
            </>
          ) : null}

          <div style={styles.bottomSpacer} />
        </main>

        {/* TOAST DOCK — sticky-in-flow above the tabBar; the ONE polite
            live region. No timers: persists until Undo or replacement. */}
        <div style={styles.toastDock} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="kst-fade">
              <span style={styles.toastMsg}>{ui.toast.msg}</span>
              {ui.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="kst-btn kst-focusable" style={styles.toastUndo} onClick={applyUndo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px sticky bottom; tablist with arrow-key movement. */}
        <nav
          style={styles.tabBar}
          role="tablist"
          aria-label="Kestrel sections"
          onKeyDown={event => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            const index = TAB_DEFS.findIndex(tab => tab.id === ui.tab);
            const next = TAB_DEFS[(index + (event.key === 'ArrowRight' ? 1 : TAB_DEFS.length - 1)) % TAB_DEFS.length];
            selectTab(next.id);
            const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
            buttons[TAB_DEFS.findIndex(tab => tab.id === next.id)]?.focus();
          }}>
          {TAB_DEFS.map(tab => {
            const active = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="kst-btn kst-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'watch' && readyItems.length > 0 ? <span style={styles.tabBadge}>{readyItems.length}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SHEET — target editor / add-a-watch; scrim z40, sheet z41. */}
        {ui.sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {ui.sheet != null && ui.sheet.mode === 'edit' && sheetItem != null ? (
          <Sheet
            titleId="kst-sheet-title"
            title="Set target"
            detent={ui.sheet.detent}
            onDetentChange={detent => update('ui', {sheet: {...ui.sheet!, detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            leading={
              <button
                type="button"
                className="kst-btn kst-focusable"
                style={styles.iconBtn}
                aria-label={`More actions for ${sheetItem.name}`}
                aria-expanded={ui.sheetMenuOpen}
                onClick={() => update('ui', {sheetMenuOpen: !ui.sheetMenuOpen})}>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </button>
            }
            footer={
              <button type="button" className="kst-btn kst-focusable" style={styles.doneBtn} onClick={closeSheet}>
                Done
              </button>
            }>
            {ui.sheetMenuOpen ? (
              <div role="menu" aria-label={`Actions for ${sheetItem.name}`} style={styles.sheetMenu}>
                <button
                  type="button"
                  role="menuitem"
                  className="kst-btn kst-focusable"
                  style={styles.menuRow}
                  onClick={() => {
                    update('ui', {sheetMenuOpen: false});
                    showToast(`Price history for ${sheetItem.name} — 60 points shown`);
                  }}>
                  <Icon icon={HistoryIcon} size="sm" color="secondary" />
                  View price history
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  role="menuitem"
                  className="kst-btn kst-focusable"
                  style={{...styles.menuRow, ...styles.menuRowDanger}}
                  onClick={() => stopWatching(sheetItem.id)}>
                  <Icon icon={Trash2Icon} size="sm" color="inherit" />
                  Stop watching
                </button>
              </div>
            ) : null}
            {renderEditBody(sheetItem)}
          </Sheet>
        ) : null}
        {ui.sheet != null && ui.sheet.mode === 'add' ? (
          <Sheet
            titleId="kst-add-title"
            title="Add a watch"
            detent={ui.sheet.detent}
            onDetentChange={detent => update('ui', {sheet: {...ui.sheet!, detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="kst-btn kst-focusable" style={styles.doneBtn} onClick={closeSheet}>
                Done
              </button>
            }>
            <p style={styles.addIntro}>Pick a suggestion — Kestrel starts a watch at 10% under today's price.</p>
            {SUGGESTIONS.map((s, index) => {
              const added = items.byId[s.id] != null;
              const mono = monoColors(s.seed);
              return (
                <div key={s.id}>
                  <button
                    type="button"
                    className="kst-btn kst-focusable"
                    style={{...styles.addRow, ...(added ? styles.addRowAdded : null)}}
                    disabled={added}
                    onClick={() => addSuggestion(s)}>
                    <span style={{...styles.monoTile, background: mono.bg, color: mono.fg}} aria-hidden>
                      {initialsFor(s.name)}
                    </span>
                    <span style={styles.rowTextStack}>
                      <span style={styles.rowName}>{s.name}</span>
                      <span style={styles.rowMeta}>
                        {usd(s.currentPrice)} now · target {usd(Math.round(s.currentPrice * 0.9))}
                      </span>
                    </span>
                    <span style={{flex: 1}} aria-hidden />
                    {added ? (
                      <span style={styles.priceSub}>Added</span>
                    ) : (
                      <span style={{color: BRAND_ACCENT, display: 'inline-flex'}}>
                        <Icon icon={PlusIcon} size="sm" color="inherit" />
                      </span>
                    )}
                  </button>
                  {index === SUGGESTIONS.length - 1 ? null : <div style={styles.rowDivider} />}
                </div>
              );
            })}
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}

