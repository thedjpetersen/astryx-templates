var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Voltmile hybrid-household ledger
 *   for the 2024 Meridian PHV: 28 entries e00–e27 (baseline Oct 31 2025 gas
 *   9.0 gal @ $3.60 = $32.40 at odo 24,000, then per month a Home L2 week
 *   rollup, an Electrify Hwy 9 DC session @ $0.40/kWh, and a month-end full
 *   gas fill — July open with a PARTIAL 5.0 gal fill at odo 29,150).
 *   Cross-checks verified by hand: monthly spends 49.60+52.20+55.00+54.00+
 *   63.00+60.80+59.50+60.00+27.90 = $482.00; miles 620+580+500+450+600+640+
 *   700+750+310 = 5,150 = 29,150−24,000 ✓; gas $340.50 + home 395 kWh ×
 *   $0.14 = $55.30 + public 215.5 kWh × $0.40 = $86.20 = $482.00 ✓; 90-day
 *   average (May 1–Jul 3) = 147.40/1,760 = $0.08375 exactly. No Date.now(),
 *   no Math.random(), no network media, no real maps or photos.
 * @output Voltmile — Fuel & Charge Log: a 390px MOBILE ledger surface. A
 *   52px navBar (fuel-door bolt mark · Fuel/Charge/Blended segmented scope ·
 *   RefreshCw) over a PINNED 96px CostPerMileBand (sticky top 52 — 9 monthly
 *   $/mi markers on a fixed $0.06–$0.13 y-domain, dashed AVG $0.084 line,
 *   open-ring provisional Jul marker and a widening ±$0.012 uncertainty
 *   ribbon for the open partial fill), then month-grouped 60px entry rows
 *   under sticky 36px month headers ('JULY 2026 · $27.90 · 310 MI'), a
 *   'Show 12 more' loadMoreRow chain, a 56px brand FAB, a 4-tab bar
 *   (Log/Trends/Stations/Vehicle). Signature move: the add-sheet's
 *   TriLinkedFillComposer keeps exactly ONE of {gallons, total, $/gal}
 *   derived (AUTO glow), and dragging the total slider live-redraws the
 *   pinned band's hollow preview marker and flips the delta chip at $30.73;
 *   Save closes the July partial ribbon, rewrites the month header to
 *   '$55.10 · 700 MI', recomputes the Trends tile to $0.079, and offers
 *   snapshot-exact Undo — no confirms, no timers.
 * @position Page template; emitted by \`astryx template mobile-fuel-charge-log\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at y=0
 *   is the first pixel; stage clips corners, none drawn). All overlays
 *   (scrim, sheet, menus) are position:'absolute' INSIDE shell; the toast
 *   dock and FAB are STICKY-IN-FLOW height-0 anchors (bottom 76 / 80 above
 *   the 64px tabBar) per the batch-2 amendment — shell-absolute bottom pins
 *   to the DOCUMENT bottom on tall scrolling views, off-viewport. While the
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   (absolute overlays then legally anchor to the visible screen) and
 *   restores on close. Focus enters the sheet with {preventScroll:true} and
 *   restores to the FAB on every close path.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 on glyph-led rows); no desktop
 *   Layout frames, no asides, no tables. navBar hairline is ALWAYS ON
 *   (scroll-under is not wired — the committed simpler variant). The Log
 *   screen deliberately skips the large-title row per the unwired-collapse
 *   rule: the segmented scope control IS the compact title.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Voltmile green — spec hex #0CA678 is only ≈3.1:1 on white
 *   so it is NEVER used; the text-safe pair is light-dark(#087F5B, #34D3A6)
 *   with math at the declaration). Non-brand literals: the public-charge
 *   amber pair, the above-avg tint pair, the ≥3:1 switch OFF-track pair
 *   (amendment: interactive rest boundaries need ≥3:1 vs their ACTUAL
 *   surface), scrim, thumb shadow — each with contrast math.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52 sticky top z20 ·
 *   trendBand 96 sticky top 52 z19 · monthHeader 36 sticky top 148 z10 ·
 *   entry rows 60 · station rows 72 · utility rows 44 · tabBar 64 sticky
 *   bottom z20 · FAB 56 · primary button 48 · sliderRows 72 · icon buttons
 *   44×44 (20–24px glyphs). TYPE (Figtree via --font-family-body): 28/700
 *   Vehicle odometer · 22/700 trend tile value · 17/600 nav & sheet titles ·
 *   16/400–500 row primary + inputs (hard floor) · 13/400 secondary +
 *   13/600 month headers · 11/500 tab labels, overlines, PARTIAL chip;
 *   nothing under 11px; fontVariantNumeric:'tabular-nums' on EVERY money,
 *   mile, gallon, kWh figure. Dividers inset 68 on glyph-led rows, 16
 *   otherwise, last row none. Touch: every target ≥44×44 with ≥8px
 *   clearance or merged full-row; every gesture (swipe-delete, sheet drag,
 *   split-handle drag) has a visible button path (44×44 ellipsis per row,
 *   clickable grabber + X, ± stepper beside the split bar).
 *
 * Responsive contract:
 * - Fluid 320–430px: segmented control width min(200px, 58vw), 11px
 *   segment labels never smaller; band marker hit columns compress to
 *   ~31px (merged-adjacent-targets clause); composer numeric fields stay
 *   88px while sliders flex; entry-row text column minWidth:0 ellipsizes
 *   against a minWidth:72 trailing meta; station names ellipsize one line.
 *   overflowX:'clip' on shell is the backstop, not the license.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver on
 *   the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — this is deliberately
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
  CarIcon,
  FuelIcon,
  ListOrderedIcon,
  MapPinIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlugZapIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  TrendingUpIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Voltmile green). Spec brand #0CA678 vs
// white is only ≈3.1:1, so it never renders; the committed pair: #087F5B on
// #FFFFFF ≈ 5.0:1 (passes 4.5:1 down to 13px text); #34D3A6 on the dark
// card (~#1C1C1E) ≈ 7.9:1.
const BRAND_ACCENT = 'light-dark(#087F5B, #34D3A6)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #087F5B ≈ 5.0:1 (light);
// #06251B on #34D3A6 ≈ 8:1 (dark) — white on #34D3A6 would fail at ~1.6:1.
const BRAND_ON = 'light-dark(#FFFFFF, #06251B)';
// PARTIAL chip / tile tint: BRAND_ACCENT 11px/500-600 text sits on this
// wash — #087F5B on rgba(8,127,91,.12)-over-white (≈ #E4F1EC) ≈ 4.6:1;
// #34D3A6 on rgba(52,211,166,.16)-over-#1C1C1E ≈ 6.8:1.
const BRAND_TINT = 'light-dark(rgba(8, 127, 91, 0.12), rgba(52, 211, 166, 0.16))';
// Uncertainty-ribbon fill (graphic, not text — needs only to read as a
// wash) per spec: ±$0.012 wedge from the Jun marker to the right edge.
const RIBBON_TINT = 'light-dark(rgba(8, 127, 91, 0.14), rgba(52, 211, 166, 0.18))';
// Public-charge hue (HomeAwayChargeSplit right span + Trends gas slice).
// Fill vs card surface: #B45309 vs #FFFFFF ≈ 4.6:1; #F5B458 vs #1C1C1E ≈
// 9.6:1 — both clear the ≥3:1 graphic floor with margin.
const PUBLIC_HUE = 'light-dark(#B45309, #F5B458)';
// Above-avg delta-chip tint; its text is var(--color-error) (token, passes
// 4.5:1 on card in both schemes; the tint only nudges the surface).
const ABOVE_TINT = 'light-dark(rgba(178, 34, 34, 0.10), rgba(255, 120, 120, 0.16))';
// Switch OFF track — AMENDMENT: interactive rest-state boundaries need
// ≥3:1 vs their ACTUAL surface (the sheet card). #6E6961 vs #FFFFFF ≈
// 5.4:1; #9A958C vs #1C1C1E ≈ 5.8:1. The foundations' 14%/22% alpha track
// fails this class (~1.2:1) and is deliberately not used.
const TRACK_OFF = 'light-dark(#6E6961, #9A958C)';
// Sheet/menu scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Slider-thumb / switch-thumb shadow (the one sanctioned shadow literal).
const THUMB_SHADOW = '0 1px 3px rgba(0, 0, 0, 0.25)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, restyled native range
// inputs (the mandatory keyboard-stepping slider path), visually-hidden h1,
// shimmer, and the prefers-reduced-motion guard (transform/opacity only).
// ---------------------------------------------------------------------------

const VOLT_CSS = \`
.vfm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.vfm-btn:disabled { cursor: default; }
.vfm-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.vfm-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes vfm-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.vfm-sheet-in { animation: vfm-sheet-in 240ms ease; }
.vfm-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Native range restyle — 4px track (--color-border rest; the 28px thumb
   carries state per spec, so the 4px line is a legal graphic), brand fill
   painted to var(--vfm-pct), 28px white thumb in a 44px-tall hit band. */
.vfm-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 44px;
  margin: 0;
  background: transparent;
}
.vfm-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(to right, \${BRAND_ACCENT} var(--vfm-pct, 0%), var(--color-border) var(--vfm-pct, 0%));
}
.vfm-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -12px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  box-shadow: \${THUMB_SHADOW};
}
.vfm-range::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(to right, \${BRAND_ACCENT} var(--vfm-pct, 0%), var(--color-border) var(--vfm-pct, 0%));
}
.vfm-range::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  box-shadow: \${THUMB_SHADOW};
}
@keyframes vfm-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.vfm-shimmer {
  animation: vfm-shimmer 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .vfm-anim { transition: none; }
  .vfm-sheet-in { animation: none; }
  .vfm-shimmer { animation: none; display: none; }
}
\`;

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
  // NAV BAR — 52px sticky top z20, hairline ALWAYS ON (committed choice; no
  // large-title row — the segmented scope IS the compact title).
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
  // Segmented scope — 36px track, radius 12, active pill = card + hairline.
  segTrack: {
    display: 'flex',
    height: 36,
    width: 'min(200px, 58vw)',
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  // TREND BAND — pinned CostPerMileBand: sticky top 52 z19, 96px, full
  // bleed, borderBottom hairline. Band bottom = 148px < 45% of any ≥640px
  // stage, so it stays visible above the 55% medium sheet detent.
  trendBand: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 96,
    background: 'var(--color-background-card)',
    borderBottom: '1px solid var(--color-border)',
  },
  bandInner: {
    position: 'relative',
    height: '100%',
    paddingInline: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  bandHeader: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bandOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Delta chip — 24px pill inside a 44px-tall merged hit (part of the band
  // group's single focus surface; not independently interactive).
  deltaChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Below-avg: BRAND_ACCENT text on BRAND_TINT (≈4.6:1 light / ≈6.8:1 dark,
  // math at the literals). Above-avg: --color-error text on ABOVE_TINT.
  deltaChipDown: {color: BRAND_ACCENT, background: BRAND_TINT},
  deltaChipUp: {color: 'var(--color-error)', background: ABOVE_TINT},
  plotWrap: {position: 'relative', flex: 1, minHeight: 0},
  // Invisible full-height marker hit columns (~39px at 390; ~31px at 320 —
  // legal under the merged-adjacent-targets clause).
  hitCol: {
    position: 'absolute',
    top: -32,
    bottom: 0,
    borderRadius: 8,
  },
  // MONTH HEADER — sticky-in-section at top 148 (= 52 navBar + 96 band),
  // 36px, blur surface, z10.
  monthHeader: {
    position: 'sticky',
    top: 148,
    zIndex: 10,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
    margin: 0,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  monthName: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  monthTotal: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
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
  // Dividers inset 68 = 16 pad + 40 glyph disc + 12 gap on glyph-led rows.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // ENTRY ROW — 60px two-line; swipe-to-reveal Delete at −72 with the
  // mandatory trailing 44×44 ellipsis.
  entryOuter: {position: 'relative'},
  entryClip: {position: 'relative', overflow: 'hidden'},
  deleteAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: 'var(--color-error)',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  entryContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  entryRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  glyphDisc: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // minWidth:0 on the flex text column — the classic overflow trap.
  entryText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  entryPrimaryLine: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  entryPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  entrySecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Trailing meta keeps minWidth 72 while the text column ellipsizes.
  entryMeta: {
    minWidth: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  entryAmount: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  entryOdo: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // PARTIAL chip — 11px/500 overline pill, brand tint (math at literals).
  partialChip: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    background: BRAND_TINT,
    borderRadius: 999,
    padding: '1px 7px',
    flexShrink: 0,
  },
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 200,
    maxWidth: 'calc(100% - 24px)',
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
  menuRowText: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // FAB — sticky-in-flow height-0 anchor (amendment), pill absolute inside.
  fabAnchor: {
    position: 'sticky',
    bottom: 80,
    zIndex: 25,
    height: 0,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_ON,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // TOAST DOCK — the ONE polite live region; sticky height-0 anchor at
  // bottom 76 (64 tabBar + 12) per amendment.
  toastAnchor: {
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
    paddingInlineStart: 16,
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
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', marginInline: 12},
  undoBtn: {
    height: 48,
    minWidth: 44,
    paddingInline: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // TAB BAR — 64px sticky bottom z20.
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
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
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
  // TRENDS — 3×3 tile grid (12px gaps inside the 16px gutter).
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    paddingInline: 16,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '10px 12px',
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    minWidth: 0,
  },
  tileDashed: {border: \`1px dashed \${BRAND_ACCENT}\`},
  tileOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
  },
  tileValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  tileSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  splitCard: {padding: 16, display: 'flex', flexDirection: 'column', gap: 8},
  splitBarOuter: {height: 24, borderRadius: 999, overflow: 'hidden', display: 'flex'},
  splitCaption: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  splitTotalLine: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  // STATIONS — 72px media rows with 48px glyph tiles.
  stationRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  stationTile: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  stationText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  stationName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stationSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stationPrice: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // VEHICLE — hero card + 44px utility rows.
  heroCard: {padding: 16, display: 'flex', flexDirection: 'column', gap: 4},
  heroName: {fontSize: 17, fontWeight: 600, margin: 0},
  heroOdo: {fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.15},
  heroSub: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilLabel: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  utilValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SHEET — scrim z40 + sheet z41, two detents.
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  saveBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  // COMPOSER — 72px sliderRows, 12px gaps.
  sliderRow: {height: 72, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2},
  sliderLabelRow: {display: 'flex', alignItems: 'center', gap: 8, height: 20},
  sliderLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  autoChip: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    background: BRAND_TINT,
    borderRadius: 999,
    padding: '1px 7px',
  },
  sliderFlex: {display: 'flex', alignItems: 'center', gap: 12},
  sliderTrackBox: {flex: 1, minWidth: 0},
  numField: {
    width: 88,
    height: 36,
    flexShrink: 0,
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 10,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  },
  // Derived-field calculated-glow.
  numFieldDerived: {boxShadow: \`0 0 0 2px \${BRAND_ACCENT}\`},
  numFieldError: {boxShadow: 'inset 0 0 0 2px var(--color-error)'},
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  unitLine: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Switch row — whole 44px row toggles (role=switch).
  switchRow: {width: '100%', height: 44, display: 'flex', alignItems: 'center', gap: 8},
  switchLabel: {flex: 1, minWidth: 0, fontSize: 16, textAlign: 'left'},
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    background: TRACK_OFF,
    position: 'relative',
    flexShrink: 0,
    transition: 'background 200ms ease',
  },
  switchTrackOn: {background: BRAND_ACCENT},
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: THUMB_SHADOW,
  },
  // HomeAwayChargeSplit — 24px split bar + draggable handle + stepper.
  splitWrap: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  splitBarZone: {position: 'relative', height: 44, display: 'flex', alignItems: 'center'},
  splitBar: {width: '100%', height: 24, borderRadius: 999, overflow: 'hidden', display: 'flex'},
  splitHandle: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    display: 'grid',
    placeItems: 'center',
    transform: 'translateY(-50%)',
    touchAction: 'none',
  },
  splitHandleKnob: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#FFFFFF',
    border: '1px solid var(--color-border)',
    boxShadow: THUMB_SHADOW,
  },
  splitSeam: {width: 2, background: '#FFFFFF', flexShrink: 0},
  stepperLine: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44},
  stepper: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperRule: {width: 1, background: 'var(--color-border)'},
  // SKELETONS — 60px rows, deterministic widths.
  skeletonRow: {height: 60, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    position: 'relative',
    overflow: 'hidden',
  },
  bottomSpacer: {height: 24},
};
`;export{e as default};