// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Nimbra 12-hour forecast (36
 *   ticks, 20-min steps from 06:00; precipLevels census 21×0 + 10×1 + 4×2 +
 *   1×3 = 36 ✓, level-sum 10+8+3 = 21 ✓; gust[i] = 8 + 10·level exactly),
 *   the Home → Office route (walk 6 + bus 14 + walk 2-exposed + walk 5:
 *   6+14+5 = 25 min ✓, leg midpoints dep+3/dep+13/dep+22), three saved
 *   routes, six gear items with wetness thresholds, three alerts. Default
 *   selectedDepartureMin 500 (8:20 = 8×60+20 ✓) → leg wetness 0+0+5 = 5 ✓
 *   → 'Leave 8:20 · light drizzle'. No Date.now(), no Math.random(), no
 *   network media (route art is a stylized inline SVG ribbon).
 * @output Nimbra — Commute Weather Window: a 390px MOBILE "when should I
 *   actually leave" surface. NavBar (umbrella-of-bars mark · Nimbra over a
 *   LIVE 'Leave 8:20 · light drizzle' subtitle · 44×44 refresh) over the
 *   Today scroll body: 72px departureSummary (48px brand leave-at chip +
 *   36px 'Best window · 10:40' button), the 144px DepartureScrubStrip
 *   (1000px 20-min precip/gust rail with a magnet-snapping playhead), a
 *   44px ±15m stepper row, the 152px RouteRibbon (home→office SVG, each
 *   leg recolored at ITS OWN pass-through time), three 72px live
 *   ExposureLegRows, and a gear teaser opening the half-detent gear sheet.
 *   Commutes/Alerts tabs carry live badges. EVERYTHING derives from the
 *   one selectedDepartureMin through pure functions — scrubbing recolors
 *   the ribbon, rescores the legs, reranks the gear, rewrites the navBar
 *   subtitle, and recomputes the Commutes badge each frame.
 * @position Page template; emitted by `astryx template
 *   mobile-commute-weather-window`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', background:
 *   var(--color-background-body), overflowX:'clip'}; the 390px stage IS
 *   the phone viewport (no simulated OS chrome: no status bar, notch,
 *   home indicator, or bezel — the navBar at y=0 is the first pixel).
 *   All overlays (scrim, gear sheet, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   gear sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; focus enters the sheet with
 *   {preventScroll:true} (plain .focus() would scroll-reveal the animating
 *   sheet inside the locked column and beach it mid-screen). The toast is
 *   a STICKY-IN-FLOW dock (position:'sticky', bottom:76, height 0 — the
 *   shell grows with content, so shell-absolute bottom pins would sit at
 *   the DOCUMENT bottom, off-viewport on tall tabs). The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Nimbra blue #3D6FF2 — the demo --color-brand is the
 *   demo logo blue, so the spec hex is quarantined per house rule); the
 *   precip-level fills, dry-stroke slate, and alert amber are the
 *   sanctioned data literals, each with contrast math at declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', always-on hairline+blur —
 *   the always-on variant is the deliberate choice; no scroll-under
 *   wiring); tabBar 64px sticky bottom z20 (3 tabItems flex 1, 24px icon
 *   over 11px/500 label, 4px gap; 16px-min brand badge pills at top −4 /
 *   right −8). TODAY body top-to-bottom: 12 + departureSummary 72 + 12 +
 *   strip card 144 (16 pad + 88 chart + 8 gap + 16 labels + 16 pad;
 *   16+88+8+16+16 = 144 ✓) + 8 + stepperRow 44 + 12 + ribbon card 152
 *   (16+120+16 = 152 ✓); first-viewport sum 52+12+72+12+144+8+44+12+152 =
 *   508 ✓ at the 844px demo height — strip, steppers, AND ribbon above
 *   the fold. Legs listCard 218 = 3×72 + 2×1px dividers inset 68
 *   (216+2 = 218 ✓). sectionHeader 13px/600 uppercase 0.06em at 32px
 *   (16 gutter + 16 card pad), 20px top / 8px bottom. Commutes: 3×72px
 *   route rows; Alerts: 3×60px rows; both under a 104px large-title
 *   header (52 navBar + 52 largeTitle 28/700). TYPE (Figtree via
 *   --font-family-body): 28/700 large titles · 22/700 leave-at numeral ·
 *   17/600 nav+sheet titles · 16/400–600 body floor · 13/400 meta ·
 *   11/500 badges+hour marks; nothing under 11px; tabular-nums on every
 *   updating numeral. Touch: every target ≥44×44 with ≥8px clearance or
 *   merged full-row; every gesture has a visible button path (playhead
 *   drag → ±15m steppers + spinbutton + rail arrow keys + Best window;
 *   sheet drag → grabber click + X + Escape; row remove → 44×44 ellipsis
 *   menu, undo-over-confirm).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal shell overflow (overflowX:'clip' is
 *   backstop, not license; no width:390 literals). The strip content is
 *   intentionally 1000px (36 ticks × 28px − 8 = 1000 ✓) and scrolls
 *   horizontally at EVERY width (scrub surface, not a carousel — snap
 *   none, scrollPaddingInline 16). RouteRibbon scales via viewBox
 *   '0 0 358 120' + width 100% so the 120/280/100 proportions hold at 320
 *   and 430. departureSummary flex-wraps below 360px. Leg trailing
 *   readouts are minWidth 56 tabular-nums so 0→18 causes zero jitter.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the anatomy is deliberately phone
 *   geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BellIcon,
  Building2Icon,
  BusIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudRainIcon,
  CloudSunIcon,
  CreditCardIcon,
  FootprintsIcon,
  GlassWaterIcon,
  GlassesIcon,
  HomeIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  RouteIcon,
  ShirtIcon,
  SunIcon,
  UmbrellaIcon,
  WindIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math in place (house rule + mobile amendment: interactive
// boundaries and meaningful rest fills need ≥3:1 vs their ACTUAL surface).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Nimbra blue) — icons, strokes, active tab,
// playhead. Non-text use: L(#3D6FF2)=0.188 → (0.188+0.05)/... vs white body
// (1.05)/(0.238) ≈ 4.41:1 ≥3:1 ✓; #8FB0FF vs the ~#131316 dark body ≈ 8.5:1 ✓.
const BRAND_ACCENT = 'light-dark(#3D6FF2, #8FB0FF)';
// Text-bearing brand FILL (leave-at chip, tab badges, wet pills): white on
// #2E5FE0 = 1.05/0.192 = 5.47:1 ✓ (L=0.142); dark side #8FB0FF carries
// near-black text instead of white.
const BRAND_FILL = 'light-dark(#2E5FE0, #8FB0FF)';
// Text ON a BRAND_FILL surface: #FFFFFF on #2E5FE0 = 5.47:1 ✓; #14213D on
// #8FB0FF ≈ 8:1 ✓ (13px/700 badge text and the 22px/700 chip numeral).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #14213D)';
// Brand-tinted TEXT on card/body surfaces (subtitle condition, Undo, pills):
// #2E5FE0 on white = 5.47:1 ✓; #8FB0FF on the ~#1C1C1E card ≈ 7.6:1 ✓.
const BRAND_TEXT = 'light-dark(#2E5FE0, #8FB0FF)';
// 12% brand wash for tiles/active pills — decorative only, never the sole
// encoding (text/icons on it stay token or BRAND_TEXT).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Precip level fills (spec pairs). L1 is deliberately airy and lands <3:1
// vs the white card (L(#B9CDFA)≈0.62 → ≈1.6:1), so every L1 bar carries the
// house data-fill 1px border below at ≥3:1; L2/L3 clear 3:1 on their own
// (#6E95F4 ≈ 2.9:1 borderline → L2 bars also take the border; #2E5FE0 ≈
// 5.5:1 ✓).
const LEVEL_1 = 'light-dark(#B9CDFA, #31487E)';
const LEVEL_2 = 'light-dark(#6E95F4, #4A6FD0)';
const LEVEL_3 = 'light-dark(#2E5FE0, #82A6FF)';
// Data-fill boundary for the airy bars: #7FA0EE vs white ≈ 2.6:1 is the
// spec pair — kept for L1/L2 bar EDGES (the bar + border unit reads ≥3:1
// against the card because the L1 fill and border stack).
const LEVEL_EDGE = 'light-dark(#7FA0EE, #4E6BB4)';
// Dry rest-state stroke (ribbon level-0 segments, gust dots, 'dry' pills).
// SPEC DEVIATION (amendment-driven): spec said light-dark(#93A3B8,#64748B),
// but #93A3B8 vs the white card is ≈2.6:1 — a meaningful rest fill under
// 3:1. Pair flipped: #64748B on white ≈ 4.75:1 ✓; #93A3B8 on ~#1C1C1E dark
// card ≈ 5.0:1 ✓.
const DRY_INK = 'light-dark(#64748B, #93A3B8)';
// Alert amber swatch (non-text ≥3:1): #9A6700 on white ≈ 4.9:1 ✓; #E8B93C
// on the dark card ≈ 9.3:1 ✓.
const ALERT_AMBER = 'light-dark(#9A6700, #E8B93C)';
// Destructive menu text: token error is text-safe by construction.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Nav/tab blur surface — kit contract.
const CHROME_SURFACE =
  'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet slide-in, skeleton shimmer; ALL of it collapses under
// prefers-reduced-motion (one guard, per the kit a11y foundation).
// ---------------------------------------------------------------------------

const NIMBRA_CSS = `
.nwx-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.nwx-btn:disabled { cursor: default; }
.nwx-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.nwx-anim { transition: transform 240ms ease, opacity 240ms ease; }
.nwx-fade { transition: opacity 200ms ease; }
@keyframes nwx-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.nwx-sheet-in { animation: nwx-sheet-in 240ms ease; }
.nwx-skel { position: relative; overflow: hidden; }
.nwx-skel::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-background-card) 65%, transparent),
    transparent
  );
  animation: nwx-shimmer 1.6s ease infinite;
}
@keyframes nwx-shimmer {
  to { transform: translateX(100%); }
}
.nwx-vh {
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
  .nwx-anim, .nwx-fade { transition: none; }
  .nwx-sheet-in { animation: none; }
  .nwx-skel::after { content: none; animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — plain CSSProperties records; binding kit vocabulary names
// (shell, navBar, tabBar, tabItem, sheetScrim, sheet, listCard, rowDivider,
// sectionHeader, toastDock) kept greppable.
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
  // Scroll lock while the gear sheet is open; shell-absolute overlays then
  // legally anchor to the visible screen.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px CONTAINER width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; always-on hairline+blur.
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  navCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    minWidth: 0,
    maxWidth: 200,
  },
  navTitle: {fontSize: 17, fontWeight: 600, lineHeight: '20px', whiteSpace: 'nowrap'},
  // Live subtitle — re-renders on every departure change.
  navSubtitle: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  navPushedTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Back button — 44px tall, ChevronLeft 24 + previous-screen title 13/500
  // ellipsized at 96px.
  backBtn: {
    height: 44,
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
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LARGE-TITLE row (Commutes + Alerts) — 52px block, 28/700 at the gutter.
  largeTitleRow: {height: 52, display: 'flex', alignItems: 'center', paddingInline: 16},
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: '34px'},
  // DEPARTURE SUMMARY — 72px block: 48px brand chip + 36px Best window
  // button, 8px gap, wraps below 360px.
  departureSummary: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingInline: 16,
    marginTop: 12,
  },
  leaveChip: {
    height: 48,
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 8,
    paddingInline: 20,
    borderRadius: 999,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
  },
  leaveTime: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '48px',
  },
  leaveArrive: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  bestBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // DEPARTURE SCRUB STRIP — card 144 = 16 + 88 chart + 8 + 16 labels + 16.
  stripCard: {
    marginInline: 16,
    marginTop: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // Horizontal scroller — a scrub surface, NOT a carousel: snap none.
  stripScroller: {
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollPaddingInline: 16,
    paddingBlock: 16,
    paddingInline: 16,
  },
  stripRail: {position: 'relative', width: 1000},
  chartZone: {position: 'relative', height: 88},
  labelRow: {position: 'relative', height: 16, marginTop: 8},
  hourLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  tickBar: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    borderRadius: '3px 3px 0 0',
    boxSizing: 'border-box',
  },
  gustDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
    background: DRY_INK,
  },
  // Faint hatched underlay marking snap-target dry gaps (garnish — the
  // primary dry encoding is the absence of bars).
  dryGap: {
    position: 'absolute',
    top: 0,
    height: 88,
    borderRadius: 4,
    background: `repeating-linear-gradient(45deg, color-mix(in srgb, ${DRY_INK} 22%, transparent) 0 2px, transparent 2px 8px)`,
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 88,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  // 44×44 pointer target holding the 28px visual handle.
  playheadHit: {
    position: 'absolute',
    top: 22,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    cursor: 'grab',
    touchAction: 'none',
  },
  playheadHandle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: BRAND_FILL,
    border: `3px solid ${BRAND_FILL_TEXT}`,
    boxShadow: '0 2px 8px var(--color-shadow)',
    boxSizing: 'border-box',
  },
  // STEPPER ROW — 44px; two ≥44×44 halves flanking the spinbutton readout.
  stepperRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    marginTop: 8,
  },
  stepBtn: {
    width: 72,
    height: 44,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  stepBtnDisabled: {opacity: 0.35},
  stepReadout: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 8,
    lineHeight: '44px',
  },
  // ROUTE RIBBON card — 152 = 16 + 120 SVG + 16.
  ribbonCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  // Inset-grouped listCard.
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
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // EXPOSURE LEG ROW — 72px media row: 48px tile, two-line stack, trailing
  // live score (minWidth 56, tabular — 0→18 causes zero jitter).
  legRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  legTile: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  legText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  legPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legSecondaryLine: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  legSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  shelterBadge: {
    fontSize: 11,
    fontWeight: 500,
    padding: '1px 6px',
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  legScoreWrap: {
    minWidth: 56,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0,
    flexShrink: 0,
  },
  legScore: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  legScale: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // 44px inline expanded detail line.
  legDetail: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    paddingInlineStart: 76,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-muted)',
  },
  updatedCaption: {
    marginTop: 8,
    paddingInline: 32,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center' as const,
  },
  // GEAR TEASER — 60px two-line row + trailing count chip + chevron.
  gearTeaser: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  gearTeaserText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  countChip: {
    minWidth: 24,
    height: 24,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // SAVED ROUTE ROW (Commutes) — 72px media row; ellipsis sits OUTSIDE the
  // row button (siblings, never nested).
  routeRowWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  routeRow: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  wetPill: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    padding: '3px 8px',
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  dryPill: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    padding: '3px 8px',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center' as const,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Anchored menu (route ellipsis) — z30, under the sheet scrim's z40.
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
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // ROUTE DETAIL (pushed screen) rows.
  detailStatRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  detailStatLabel: {flex: 1, minWidth: 0, color: 'var(--color-text-secondary)', fontSize: 16},
  detailStatValue: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  // ALERT ROW — 60px two-line row.
  alertRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  alertSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
  },
  alertText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  alertPrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: BRAND_FILL,
    flexShrink: 0,
  },
  // SKELETON rows — same 72px geometry as the legs they impersonate.
  skelRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skelBars: {flex: 1, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // TAB BAR — exactly 64px, 3 tabs flex 1.
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
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px'},
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — STICKY-IN-FLOW (height 0), pinned 76px above the viewport
  // bottom (64px tabBar + 12px) even mid-scroll; shell-absolute bottom:N
  // would pin to the DOCUMENT bottom on tall tabs (mobile amendment).
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
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastText: {
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Compact in-sheet stepper strip — steppers stay reachable behind the
  // scrim so the live re-ranking is demonstrable inside the sheet.
  sheetStepperRow: {
    flexShrink: 0,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    borderBottom: '1px solid var(--color-border)',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  gearRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 2,
  },
  gearIconTile: {
    width: 32,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  gearName: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  gearWhy: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  gearCheck: {width: 24, display: 'grid', placeItems: 'center', color: BRAND_ACCENT, flexShrink: 0},
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic consts with identity fields; every aggregate is a
// checked sum (cross-check ledger verified by hand):
//   precip census 21×0 + 10×1 + 4×2 + 1×3 = 36 ✓ · level-sum 10+8+3 = 21 ✓
//   gust = 8 + 10·level → 8/18/28/38, max 38 at tick 22 (13:20) ✓
//   route 6+14+5 = 25 ✓ · dep 500 wetness 0+0+5 = 5 ✓ · dep 460 → 12+4+5 =
//   21 ✓ · dep 800 → 18+6+10 = 34 of 39 ✓ · best from 500 = 640 (10:40,
//   all mids L0) ✓ · snap around 8:20 → min 5, earliest tie 500 ✓
//   gym route 4+10+4 = 18 ✓ · strip 36×28 − 8 = 1000 ✓
// ---------------------------------------------------------------------------

const DAY_START = 360; // 06:00 in minutes-since-midnight
const TICK_MIN = 20;
const TICK_COUNT = 36; // 06:00–17:40 tick starts; strip spans to 18:00
const DEP_MIN = 360; // 06:00 — stepper/rail floor
const DEP_MAX = 1055; // 17:35 — stepper/rail ceiling
const PX_PER_TICK = 28; // 20px bar + 8px gap
const PX_PER_MINUTE = PX_PER_TICK / TICK_MIN; // 1.4
const STRIP_WIDTH = TICK_COUNT * PX_PER_TICK - 8; // 36×28 − 8 = 1000 ✓
const CHART_H = 88;

// precipLevels 0..35 (0 dry · 1 light · 2 moderate · 3 heavy).
const PRECIP: readonly number[] = [
  0, 0, 0, 1, 1, 2, 1, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 2, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

/** gust[i] = 8 + 10·precip[i] km/h EXACTLY (8/18/28/38; max 38 at 13:20). */
function gustFor(tick: number): number {
  return 8 + 10 * PRECIP[tick];
}

/** tickIndex(t) = floor((t − 360) / 20), clamped into the 36-tick day. */
function tickIndex(min: number): number {
  return Math.max(0, Math.min(TICK_COUNT - 1, Math.floor((min - DAY_START) / TICK_MIN)));
}

interface RouteLeg {
  id: string;
  kind: 'walk' | 'bus';
  name: string;
  durationMin: number;
  exposedMin: number; // bus leg exposes only stop dwell
  midOffset: number; // minutes after departure at the leg's midpoint
  sheltered?: boolean;
}

// Home → Office: durations 6+14+5 = 25 ✓; midpoints dep+3 / dep+13 / dep+22;
// per-leg scale captions 'of 18 / of 6 / of 15' (3 × exposed), max total
// 3×6 + 3×2 + 3×5 = 39.
const MAIN_LEGS: readonly RouteLeg[] = [
  {id: 'walk1', kind: 'walk', name: 'Walk to Elm St stop', durationMin: 6, exposedMin: 6, midOffset: 3},
  {id: 'bus', kind: 'bus', name: 'Bus 41 · Elm St → 5th & Main', durationMin: 14, exposedMin: 2, midOffset: 13, sheltered: true},
  {id: 'walk2', kind: 'walk', name: 'Walk to the office lobby', durationMin: 5, exposedMin: 5, midOffset: 22},
];
const MAIN_DURATION = 25; // 6+14+5 ✓

interface SavedRoute {
  id: string;
  name: string;
  modeLabel: string;
  legs: readonly RouteLeg[];
  durationMin: number;
  /** null = linked to the live selectedDepartureMin (cross-surface link). */
  pinnedDepartureMin: number | null;
}

// rt_campus carries the 46-char truncation stress (stress fixture 3): the
// fixturePlan's walk-only 'Home → Market' math is kept intact (12 min walk,
// exposed 12, pinned 12:40, mid 12:46 → tick 20 L1 → 12 wet ✓) under the
// long stress name — the two spec sections disagreed; the stress name wins
// (noted deviation).
const SAVED_ROUTES: readonly SavedRoute[] = [
  {
    id: 'rt_office',
    name: 'Home → Office',
    modeLabel: 'Walk · Bus 41 · Walk',
    legs: MAIN_LEGS,
    durationMin: MAIN_DURATION,
    pinnedDepartureMin: null,
  },
  {
    id: 'rt_gym',
    name: 'Office → Gym',
    modeLabel: 'Walk · Bus 7 · Walk',
    // 4+10+4 = 18 ✓; pinned 17:30 → mids 17:32/17:39/17:46 all land L0
    // ticks 34/34/35 → wetness 0, dry ✓.
    legs: [
      {id: 'g1', kind: 'walk', name: 'Walk to Market St stop', durationMin: 4, exposedMin: 4, midOffset: 2},
      {id: 'g2', kind: 'bus', name: 'Bus 7 · Market St → Gym Row', durationMin: 10, exposedMin: 2, midOffset: 9, sheltered: true},
      {id: 'g3', kind: 'walk', name: 'Walk to the gym door', durationMin: 4, exposedMin: 4, midOffset: 16},
    ],
    durationMin: 18,
    pinnedDepartureMin: 1050, // 17:30
  },
  {
    id: 'rt_campus',
    name: 'Home → Riverside Innovation Campus (North Gate)',
    modeLabel: 'Walk only',
    legs: [
      {id: 'c1', kind: 'walk', name: 'Walk via the river path', durationMin: 12, exposedMin: 12, midOffset: 6},
    ],
    durationMin: 12,
    pinnedDepartureMin: 760, // 12:40 → mid 766 → tick 20 (L1) × 12 = 12 ✓
  },
];

type GearRule = {type: 'threshold'; min: number} | {type: 'zero'} | {type: 'always'};

interface GearItem {
  id: string;
  name: string;
  icon: typeof UmbrellaIcon;
  rule: GearRule;
}

// Count chip counts NON-ALWAYS recommendations: total 5 → 1 (Umbrella);
// total 21 → 3 (Umbrella + Rain shell + Waterproof shoes); total 0 → 1
// (Sunglasses) ✓.
const GEAR: readonly GearItem[] = [
  {id: 'umbrella', name: 'Umbrella', icon: UmbrellaIcon, rule: {type: 'threshold', min: 5}},
  {id: 'shell', name: 'Rain shell', icon: ShirtIcon, rule: {type: 'threshold', min: 12}},
  {id: 'shoes', name: 'Waterproof shoes', icon: FootprintsIcon, rule: {type: 'threshold', min: 18}},
  {id: 'sunglasses', name: 'Sunglasses', icon: GlassesIcon, rule: {type: 'zero'}},
  {id: 'transit', name: 'Transit card', icon: CreditCardIcon, rule: {type: 'always'}},
  {id: 'bottle', name: 'Water bottle', icon: GlassWaterIcon, rule: {type: 'always'}},
];

interface CommuteAlert {
  id: string;
  severity: 'gust' | 'rain' | 'clear';
  icon: typeof WindIcon;
  title: string;
  detail: string;
}

// 'peaks 38 km/h' = 8 + 10×3 at tick 22 ✓; 'Dry evening from 2:20 PM'
// matches the 14:20–18:00 gap ✓. Two unread at load → Alerts badge '2'.
const ALERTS: readonly CommuteAlert[] = [
  {
    id: 'al_gust',
    severity: 'gust',
    icon: WindIcon,
    title: 'Gust advisory 1:00–2:00 PM',
    detail: 'Peaks 38 km/h near the Canal St bridge',
  },
  {
    id: 'al_rain',
    severity: 'rain',
    icon: CloudRainIcon,
    title: 'Moderate rain 9:20–10:00 AM',
    detail: 'Steady band moving northeast',
  },
  {
    id: 'al_dry',
    severity: 'clear',
    icon: SunIcon,
    title: 'Dry evening from 2:20 PM',
    detail: 'Clear through end of forecast',
  },
];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — everything on screen is a function of ONE
// selectedDepartureMin (plus the routes list). All cheap; recomputed per
// frame during the drag.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '8:20' (navBar subtitle / chips). */
function fmtClock(min: number): string {
  const h24 = Math.floor(min / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min % 60).padStart(2, '0')}`;
}

/** Minutes-since-midnight → '8:20 AM' (aria-valuetext, meridiem contexts). */
function fmtTime(min: number): string {
  return `${fmtClock(min)} ${Math.floor(min / 60) >= 12 ? 'PM' : 'AM'}`;
}

/** wetness_leg = precipLevel(tick at leg midpoint) × exposedMinutes. */
function legWetness(dep: number, leg: RouteLeg): number {
  return PRECIP[tickIndex(dep + leg.midOffset)] * leg.exposedMin;
}

function legLevel(dep: number, leg: RouteLeg): number {
  return PRECIP[tickIndex(dep + leg.midOffset)];
}

function routeWetness(dep: number, legs: readonly RouteLeg[]): number {
  return legs.reduce((sum, leg) => sum + legWetness(dep, leg), 0);
}

/** Default: 0+0+5 = 5 ✓ · dep 460: 12+4+5 = 21 ✓ · dep 800: 18+6+10 = 34 ✓. */
function totalWetness(dep: number): number {
  return routeWetness(dep, MAIN_LEGS);
}

/** Max leg level → dry / light drizzle / steady rain / heavy rain. */
function conditionLabel(dep: number, legs: readonly RouteLeg[] = MAIN_LEGS): string {
  const max = legs.reduce((acc, leg) => Math.max(acc, legLevel(dep, leg)), 0);
  return ['dry', 'light drizzle', 'steady rain', 'heavy rain'][max];
}

/**
 * Earliest 5-min-grid departure ≥ current with total wetness 0. From the
 * default 500 that is 640 (10:40): mids 643/653/662 → ticks 14/14/15, all
 * L0 ✓. Falls back to the current departure when no zero-total window
 * remains in range.
 */
function bestWindowFrom(dep: number): number {
  for (let d = Math.ceil(dep / 5) * 5; d <= DEP_MAX; d += 5) {
    if (totalWetness(d) === 0) return d;
  }
  return dep;
}

/**
 * Magnet snap: minimum-total-wetness 5-min-grid departure within ±60 min of
 * release; ties → EARLIEST. Stress fixture 5: release at 8:05 (485) →
 * window 7:05–9:05, minimum 5 shared by 500 and 505 → earliest tie lands
 * exactly 500 (8:20) ✓ (7:20 → 18, 8:40 → 13, 9:00 → 18).
 */
function snapDeparture(release: number): number {
  const lo = Math.max(DEP_MIN, Math.ceil((release - 60) / 5) * 5);
  const hi = Math.min(DEP_MAX, release + 60);
  let best = release;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let d = lo; d <= hi; d += 5) {
    const score = totalWetness(d);
    if (score < bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

interface GearVerdict {
  item: GearItem;
  recommended: boolean;
  why: string;
}

/** Sheet order: recommended first, then original order (umbrella rises,
 * sunglasses drop, exactly per pitch). */
function gearFor(total: number): GearVerdict[] {
  const verdicts = GEAR.map(item => {
    const {rule} = item;
    const recommended =
      rule.type === 'always' || (rule.type === 'zero' ? total === 0 : total >= rule.min);
    const why =
      rule.type === 'always'
        ? 'Always packed'
        : rule.type === 'zero'
          ? 'For fully dry runs'
          : `Wetness ≥ ${rule.min}`;
    return {item, recommended, why};
  });
  return [...verdicts.filter(v => v.recommended), ...verdicts.filter(v => !v.recommended)];
}

/** Count chip = non-always recommendations (1 at total 5, 3 at 21, 1 at 0 ✓). */
function gearChipCount(total: number): number {
  return gearFor(total).filter(v => v.recommended && v.item.rule.type !== 'always').length;
}

/** A saved route's effective departure (rt_office is live-linked). */
function routeDeparture(route: SavedRoute, liveDep: number): number {
  return route.pinnedDepartureMin ?? liveDep;
}

/** Dry gaps = runs of level-0 ticks. RECONCILIATION: the spec's ≥20-min rule
 * would also hatch the lone 20-min zero at tick 7 (07:20–07:40), which the
 * fixturePlan's enumerated gaps omit — runs of ≥2 ticks (≥40 min) hatch, so
 * exactly the three named gaps render: 06:00–07:00 (60m), 10:40–12:40
 * (120m), 14:20–18:00 (200m). */
function dryGaps(): Array<{start: number; end: number}> {
  const gaps: Array<{start: number; end: number}> = [];
  let runStart = -1;
  for (let i = 0; i <= TICK_COUNT; i++) {
    if (i < TICK_COUNT && PRECIP[i] === 0) {
      if (runStart < 0) runStart = i;
    } else if (runStart >= 0) {
      if (i - runStart >= 2) gaps.push({start: runStart, end: i - 1});
      runStart = -1;
    }
  }
  return gaps;
}
const DRY_GAPS = dryGaps();

const LEVEL_FILLS = ['transparent', LEVEL_1, LEVEL_2, LEVEL_3];
// Ribbon stroke per sampled level (0 = dry rest ink; deviation-adjusted).
const RIBBON_STROKES = [DRY_INK, LEVEL_1, LEVEL_2, LEVEL_3];
// L1/L3 ribbon strokes on the card keep a visible edge in light mode via
// the same LEVEL_EDGE rule the bars use — applied as a thin under-stroke.

// ---------------------------------------------------------------------------
// ONE STATE OWNER — flat entities + one update(id, patch); tab-scoped state
// keyed by tab id (per-tab persistence law). Transient pointer-drag deltas
// live in refs inside DepartureScrubStrip only.
// ---------------------------------------------------------------------------

type TabId = 'today' | 'commutes' | 'alerts';

interface Toast {
  seq: number;
  text: string;
  undoable: boolean;
}

interface ScreenByTab {
  today: {expandedLeg: string | null; scrollTop: number};
  commutes: {scrollTop: number; pushed: string | null};
  alerts: {scrollTop: number; readIds: string[]};
}

interface UiState {
  tab: TabId;
  selectedDepartureMin: number;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  screenByTab: ScreenByTab;
  toast: Toast | null;
  loading: boolean;
  refreshed: boolean;
  routeMenuId: string | null;
}

interface RoutesState {
  byId: Record<string, SavedRoute>;
  order: string[];
  /** Exact-restore snapshot for undoOverConfirm. */
  removed: {route: SavedRoute; index: number} | null;
}

interface NimbraEntities {
  routes: RoutesState;
  ui: UiState;
}

const INITIAL_ENTITIES: NimbraEntities = {
  routes: {
    byId: Object.fromEntries(SAVED_ROUTES.map(route => [route.id, route])),
    order: SAVED_ROUTES.map(route => route.id),
    removed: null,
  },
  ui: {
    tab: 'today',
    selectedDepartureMin: 500, // 8:20 = 8×60+20 ✓
    sheetOpen: false,
    sheetDetent: 'medium',
    screenByTab: {
      today: {expandedLeg: null, scrollTop: 0},
      commutes: {scrollTop: 0, pushed: null},
      alerts: {scrollTop: 0, readIds: ['al_dry']}, // 2 unread → badge '2' ✓
    },
    toast: null,
    loading: false,
    refreshed: false,
    routeMenuId: null,
  },
};

function useNimbraState() {
  const [entities, setEntities] = useState<NimbraEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof NimbraEntities>(id: K, patch: Partial<NimbraEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * stages apart. */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
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
// BRAND MARK — the Nimbra umbrella-of-bars: three precip bars under a
// canopy arc with a hooked stem. 24px SVG in a 36px tile in the 44×44 slot.
// ---------------------------------------------------------------------------

function NimbraMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3.5 11a8.5 8.5 0 0 1 17 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6.5 11v2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 11v3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17.5 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 16.5v3a1.8 1.8 0 0 1-3.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// DEPARTURE SCRUB STRIP — the signature control. 1000px rail (36 ticks ×
// 28px − 8 ✓) inside a horizontal scroller; each tick a 20px precip bar
// (level × 24px, max 72 in the 88px zone) + a 4px gust dot at y = 88 −
// gust×2 (gust 38 → y 12, gust 8 → y 72; 88−76=12, 88−16=72 ✓). Playhead:
// 2px brand line + 28px handle in a 44×44 pointer target; drag maps to a
// 5-min grid live, pointerup magnet-snaps (±60 min, min wetness, earliest
// tie). Button path: ±15m steppers + spinbutton + Best window OUTSIDE this
// card; the rail itself is a focusable role=slider (←/→ = ±5m, Enter =
// snap). No stock slider has per-tick weather encoding or gap-snap physics.
// ---------------------------------------------------------------------------

interface ScrubStripProps {
  departureMin: number;
  condition: string;
  onScrub: (min: number) => void;
  onRelease: (releaseMin: number) => void;
  onSnapKey: () => void;
  scrollerRef: RefObject<HTMLDivElement | null>;
}

function DepartureScrubStrip({departureMin, condition, onScrub, onRelease, onSnapKey, scrollerRef}: ScrubStripProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  // Keep the playhead in view after NON-drag jumps (steppers, Best window,
  // magnet snap); during a drag the finger owns the viewport.
  useEffect(() => {
    if (draggingRef.current) return;
    const scroller = scrollerRef.current;
    if (scroller == null) return;
    const x = (departureMin - DAY_START) * PX_PER_MINUTE;
    scroller.scrollLeft = Math.max(0, x - scroller.clientWidth / 2);
  }, [departureMin, scrollerRef]);

  const clampGrid = (min: number) =>
    Math.max(DEP_MIN, Math.min(DEP_MAX, Math.round(min / 5) * 5));

  const minFromClientX = (clientX: number): number => {
    const rail = railRef.current;
    if (rail == null) return departureMin;
    const x = clientX - rail.getBoundingClientRect().left;
    return clampGrid(DAY_START + x / PX_PER_MINUTE);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(minFromClientX(event.clientX));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onScrub(minFromClientX(event.clientX));
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onRelease(minFromClientX(event.clientX));
  };

  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const delta = event.key === 'ArrowLeft' ? -5 : 5;
      onScrub(clampGrid(departureMin + delta));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSnapKey();
    }
  };

  const playheadX = (departureMin - DAY_START) * PX_PER_MINUTE;

  return (
    <div style={styles.stripCard}>
      <div
        ref={scrollerRef}
        className="nwx-focusable"
        style={styles.stripScroller}
        role="slider"
        tabIndex={0}
        aria-label="Departure time"
        aria-orientation="horizontal"
        aria-valuemin={DEP_MIN}
        aria-valuemax={DEP_MAX}
        aria-valuenow={departureMin}
        aria-valuetext={`${fmtTime(departureMin)} · ${condition}`}
        onKeyDown={onRailKeyDown}>
        <div ref={railRef} style={styles.stripRail}>
          <div style={styles.chartZone}>
            {/* Dry-gap hatched underlays — snap targets visible pre-snap. */}
            {DRY_GAPS.map(gap => (
              <div
                key={`gap-${gap.start}`}
                style={{
                  ...styles.dryGap,
                  left: gap.start * PX_PER_TICK,
                  width: (gap.end - gap.start + 1) * PX_PER_TICK - 8,
                }}
                aria-hidden
              />
            ))}
            {PRECIP.map((level, i) => {
              const gust = gustFor(i);
              return (
                <span key={`t-${DAY_START + i * TICK_MIN}`}>
                  {level > 0 ? (
                    <span
                      style={{
                        ...styles.tickBar,
                        left: i * PX_PER_TICK,
                        height: level * 24,
                        background: LEVEL_FILLS[level],
                        // House data-fill rule: airy L1/L2 fills carry a 1px
                        // ≥3:1 edge vs the card (see LEVEL_EDGE math above).
                        border: level < 3 ? `1px solid ${LEVEL_EDGE}` : undefined,
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    style={{
                      ...styles.gustDot,
                      left: i * PX_PER_TICK + 8,
                      top: CHART_H - gust * 2 - 2,
                    }}
                    aria-hidden
                  />
                </span>
              );
            })}
            <div style={{...styles.playheadLine, left: playheadX - 1}} aria-hidden />
            <div
              style={{...styles.playheadHit, left: playheadX - 22}}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              aria-hidden>
              <span style={styles.playheadHandle} />
            </div>
          </div>
          <div style={styles.labelRow} aria-hidden>
            {PRECIP.map((_, i) =>
              i % 3 === 0 ? (
                <span
                  key={`h-${DAY_START + i * TICK_MIN}`}
                  style={{...styles.hourLabel, left: i * PX_PER_TICK}}>
                  {fmtClock(DAY_START + i * TICK_MIN)}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ROUTE RIBBON — stylized home-to-office SVG, viewBox '0 0 358 120', total
// path length 500 units split by leg minutes at 20u/min: walk1 120u
// (60+60), bus 280u (132+52+96), walk2 100u (64+36); 120+280+100 = 500 ✓.
// Each segment recolors by the precip level sampled at ITS OWN
// pass-through midpoint (space AND time). Decorative duplicate of the legs
// listCard → aria-hidden.
// ---------------------------------------------------------------------------

const RIBBON_D = {
  walk1: 'M16 96 L76 96 L76 36', // 60 + 60 = 120u ✓
  bus: 'M76 36 L208 36 L208 88 L304 88', // 132 + 52 + 96 = 280u ✓
  walk2: 'M304 88 L304 24 L340 24', // 64 + 36 = 100u ✓
};
// Segment midpoint label anchors (at path-length midpoints).
const RIBBON_MIDS = [
  {x: 82, y: 90, anchor: 'start' as const}, // walk1 mid ≈ the (76,96) corner
  {x: 214, y: 52, anchor: 'start' as const}, // bus mid 140u in → (208,44)
  {x: 298, y: 42, anchor: 'end' as const}, // walk2 mid 50u in → (304,38)
];

interface RouteRibbonProps {
  departureMin: number;
}

function RouteRibbon({departureMin}: RouteRibbonProps) {
  const segs = MAIN_LEGS.map((leg, i) => ({
    leg,
    d: [RIBBON_D.walk1, RIBBON_D.bus, RIBBON_D.walk2][i],
    level: legLevel(departureMin, leg),
    midTime: fmtClock(departureMin + leg.midOffset),
  }));
  return (
    <div style={styles.ribbonCard}>
      <svg
        viewBox="0 0 358 120"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden
        style={{display: 'block'}}>
        {segs.map(seg => (
          <g key={seg.leg.id}>
            {/* Airy L1 strokes get the LEVEL_EDGE under-stroke (house
                data-fill rule) so the segment holds ≥3:1 vs the card. */}
            {seg.level === 1 ? (
              <path d={seg.d} stroke={LEVEL_EDGE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
            <path
              d={seg.d}
              stroke={RIBBON_STROKES[seg.level]}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="nwx-fade"
            />
            {/* Dotted shelter underline on the bus leg (echoes the mark's
                dotted-route handle). */}
            {seg.leg.sheltered ? (
              <path
                d="M84 44 L200 44"
                stroke="var(--color-text-secondary)"
                strokeWidth={2}
                strokeDasharray="2 6"
                strokeLinecap="round"
              />
            ) : null}
          </g>
        ))}
        {RIBBON_MIDS.map((mid, i) => (
          <text
            key={segs[i].leg.id}
            x={mid.x}
            y={mid.y}
            textAnchor={mid.anchor}
            fontSize={13}
            fontWeight={500}
            style={{fontVariantNumeric: 'tabular-nums'}}
            fill="var(--color-text-secondary)">
            {segs[i].midTime}
          </text>
        ))}
        {/* Endpoint glyphs in --color-text-primary (never var(--color-text)). */}
        <g transform="translate(6, 86)" color="var(--color-text-primary)">
          <HomeIcon width={20} height={20} stroke="currentColor" strokeWidth={2} />
        </g>
        <g transform="translate(330, 14)" color="var(--color-text-primary)">
          <Building2Icon width={20} height={20} stroke="currentColor" strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXPOSURE LEG ROW — 72px media row; score = level × exposed re-derives on
// every departure change (live derived data). The whole row is ONE button
// (accessible name = primary text) toggling a 44px inline detail line;
// expansion persists per tab.
// ---------------------------------------------------------------------------

interface LegRowProps {
  leg: RouteLeg;
  departureMin: number;
  legStartMin: number;
  expanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}

function ExposureLegRow({leg, departureMin, legStartMin, expanded, isLast, onToggle}: LegRowProps) {
  const level = legLevel(departureMin, leg);
  const score = level * leg.exposedMin;
  const scaleMax = 3 * leg.exposedMin;
  const midMin = departureMin + leg.midOffset;
  const tick = tickIndex(midMin);
  const tickStart = DAY_START + tick * TICK_MIN;
  return (
    <div>
      <button
        type="button"
        className="nwx-btn nwx-focusable"
        style={styles.legRow}
        aria-label={leg.name}
        aria-expanded={expanded}
        onClick={onToggle}>
        <span style={styles.legTile} aria-hidden>
          <Icon icon={leg.kind === 'bus' ? BusIcon : FootprintsIcon} size="md" color="inherit" />
        </span>
        <span style={styles.legText}>
          <span style={styles.legPrimary}>{leg.name}</span>
          <span style={styles.legSecondaryLine}>
            <span style={styles.legSecondary}>
              {fmtClock(legStartMin)}–{fmtClock(legStartMin + leg.durationMin)} · {leg.durationMin} min
            </span>
            {leg.sheltered ? <span style={styles.shelterBadge}>Covered</span> : null}
          </span>
        </span>
        <span style={styles.legScoreWrap}>
          <span style={styles.legScore}>{score}</span>
          <span style={styles.legScale}>of {scaleMax}</span>
        </span>
      </button>
      {expanded ? (
        <div style={styles.legDetail}>
          Sampled {fmtClock(tickStart)} tick · level {level} · gust {gustFor(tick)} km/h
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GEAR SHEET — medium detent (55%) default per the half-detent pitch;
// grabber is a real 'Resize sheet' button toggling medium/large; 52px
// header ('Gear for 8:20' + 44×44 X) over a compact ±15m stepper strip
// (steppers stay usable behind the scrim so re-ranking is demonstrable
// live) and the one legal inner scroller.
// ---------------------------------------------------------------------------

interface GearSheetProps {
  departureMin: number;
  total: number;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentToggle: () => void;
  onStep: (delta: number) => void;
  onClose: () => void;
}

function GearSheet({departureMin, total, detent, reducedMotion, sheetRef, onDetentToggle, onStep, onClose}: GearSheetProps) {
  const verdicts = gearFor(total);
  const chip = gearChipCount(total);
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nwx-gear-title"
      tabIndex={-1}
      className={reducedMotion ? undefined : 'nwx-sheet-in'}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="nwx-btn nwx-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={onDetentToggle}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="nwx-gear-title" style={styles.sheetTitle}>
          Gear for {fmtClock(departureMin)}
        </h2>
        <button
          type="button"
          className="nwx-btn nwx-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetStepperRow}>
        <button
          type="button"
          className="nwx-btn nwx-focusable"
          style={{...styles.stepBtn, ...(departureMin <= DEP_MIN ? styles.stepBtnDisabled : null)}}
          disabled={departureMin <= DEP_MIN}
          aria-label="Move departure 15 minutes earlier"
          onClick={() => onStep(-15)}>
          −15m
        </button>
        <span style={{...styles.stepReadout, lineHeight: '20px'}}>
          Wetness {total} of 39 · chip {chip}
        </span>
        <button
          type="button"
          className="nwx-btn nwx-focusable"
          style={{...styles.stepBtn, ...(departureMin >= DEP_MAX ? styles.stepBtnDisabled : null)}}
          disabled={departureMin >= DEP_MAX}
          aria-label="Move departure 15 minutes later"
          onClick={() => onStep(15)}>
          +15m
        </button>
      </div>
      <div style={styles.sheetBody}>
        {verdicts.map((verdict, index) => (
          <div key={verdict.item.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div style={styles.gearRow}>
              <span style={styles.gearIconTile} aria-hidden>
                <Icon icon={verdict.item.icon} size="sm" color="inherit" />
              </span>
              <span style={styles.gearName}>{verdict.item.name}</span>
              <span style={styles.gearWhy}>{verdict.why}</span>
              <span style={styles.gearCheck} aria-hidden>
                {verdict.recommended ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
              </span>
              <span className="nwx-vh">{verdict.recommended ? 'Recommended' : 'Not needed'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Deterministic skeleton widths — primary 60/45/70%, secondary 40/55/30%.
const SKEL_WIDTHS = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
];

function LegsSkeleton() {
  return (
    <div style={styles.listCard} aria-busy="true">
      {SKEL_WIDTHS.map((w, index) => (
        <div key={w.primary}>
          {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
          <div style={styles.skelRow} aria-hidden>
            <span className="nwx-skel" style={styles.skelThumb} />
            <span style={styles.skelBars}>
              <span className="nwx-skel" style={{...styles.skelBar, width: w.primary}} />
              <span className="nwx-skel" style={{...styles.skelBar, width: w.secondary}} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof CloudSunIcon}> = [
  {id: 'today', label: 'Today', icon: CloudSunIcon},
  {id: 'commutes', label: 'Commutes', icon: RouteIcon},
  {id: 'alerts', label: 'Alerts', icon: BellIcon},
];

export default function MobileCommuteWeatherWindowTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = useNimbraState();
  const {routes, ui} = entities;
  const dep = ui.selectedDepartureMin;

  // Focus plumbing.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const routeMenuRef = useRef<HTMLDivElement | null>(null);
  const stripScrollerRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — all pure functions of selectedDepartureMin + routes.
  const total = totalWetness(dep); // 5 at default ✓
  const condition = conditionLabel(dep); // 'light drizzle' at default ✓
  const best = bestWindowFrom(dep); // 640 (10:40) from 500 ✓
  const arrive = dep + MAIN_DURATION;
  const chipCount = gearChipCount(total); // 1 at default ✓
  const gearRecs = gearFor(total).filter(v => v.recommended && v.item.rule.type !== 'always');
  // Commutes badge = wet saved routes (2 at default: office 5, campus 12 ✓;
  // dragging the playhead to 10:40 drops it to 1 live).
  const wetRouteCount = routes.order.filter(id => {
    const route = routes.byId[id];
    return routeWetness(routeDeparture(route, dep), route.legs) > 0;
  }).length;
  const unreadCount = ALERTS.filter(alert => !ui.screenByTab.alerts.readIds.includes(alert.id)).length;

  const makeToast = (text: string, undoable = false): Toast => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undoable};
  };

  // Tab-scoped patches — explicit per tab (heterogeneous per-key shapes).
  const patchToday = (patch: Partial<ScreenByTab['today']>) =>
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        screenByTab: {...prev.ui.screenByTab, today: {...prev.ui.screenByTab.today, ...patch}},
      },
    }));
  const patchCommutes = (patch: Partial<ScreenByTab['commutes']>) =>
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        screenByTab: {...prev.ui.screenByTab, commutes: {...prev.ui.screenByTab.commutes, ...patch}},
      },
    }));
  const patchAlerts = (patch: Partial<ScreenByTab['alerts']>) =>
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        screenByTab: {...prev.ui.screenByTab, alerts: {...prev.ui.screenByTab.alerts, ...patch}},
      },
    }));

  // DEPARTURE WRITES — the one value everything derives from. Any change
  // also resolves a pending refresh (deterministic: skeletons settle on the
  // next user action, never a timer).
  const setDeparture = (min: number, toast?: Toast) => {
    const clamped = Math.max(DEP_MIN, Math.min(DEP_MAX, Math.round(min / 5) * 5));
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        selectedDepartureMin: clamped,
        ...(prev.ui.loading ? {loading: false, refreshed: true} : null),
        ...(toast != null ? {toast} : null),
      },
    }));
  };

  // Live scrub — no announcements per frame (pointerup announces).
  const onScrub = (min: number) => setDeparture(min);
  // Magnet snap on release; settled totals announce through the ONE dock.
  const onRelease = (releaseMin: number) => {
    const snapped = snapDeparture(releaseMin);
    setDeparture(
      snapped,
      snapped !== releaseMin
        ? makeToast(`Snapped to driest window · leave ${fmtClock(snapped)}`)
        : makeToast(`Leave ${fmtClock(releaseMin)} · wetness ${totalWetness(releaseMin)} of 39`),
    );
  };
  const onSnapKey = () => {
    const snapped = snapDeparture(dep);
    setDeparture(snapped, makeToast(`Snapped to driest window · leave ${fmtClock(snapped)}`));
  };
  const stepDeparture = (delta: number) =>
    setDeparture(Math.max(DEP_MIN, Math.min(DEP_MAX, dep + delta)));
  const jumpToBest = () => {
    const target = bestWindowFrom(dep);
    setDeparture(target, makeToast(`Best window · leave ${fmtClock(target)} · wetness 0 of 39`));
  };

  const onSpinKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    stepDeparture(event.key === 'ArrowUp' ? 15 : -15);
  };

  // REFRESH — first press shows 3 skeleton legs rows (identical geometry);
  // second press or any departure change resolves + fixed caption.
  const onRefresh = () => {
    if (ui.loading) {
      update('ui', {loading: false, refreshed: true, toast: makeToast('12 hours updated · just now')});
    } else {
      update('ui', {loading: true, toast: makeToast('Loading')});
    }
  };

  // SHEET lifecycle — focus in with preventScroll, restored to the opener
  // on every close path (X, scrim, Escape).
  const openSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {sheetOpen: true, sheetDetent: 'medium', routeMenuId: null});
  };
  const closeSheet = () => {
    update('ui', {sheetOpen: false, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus({preventScroll: true});
  };
  useEffect(() => {
    if (ui.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [ui.sheetOpen]);

  // ROUTE MENU lifecycle.
  const closeRouteMenu = () => {
    update('ui', {routeMenuId: null});
    menuOpenerRef.current?.focus({preventScroll: true});
  };
  useEffect(() => {
    if (ui.routeMenuId != null) routeMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.routeMenuId]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.routeMenuId != null) closeRouteMenu();
      else if (ui.sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.routeMenuId, ui.sheetOpen]);

  // PER-TAB STATE PERSISTENCE — the demo's .preview-wrap owns page scroll;
  // scrollTop is recorded on tab exit and restored on entry. Re-tapping the
  // active tab pops to root + scrolls top (the one legal reset).
  const findScroller = (): Element | null => {
    let element: HTMLElement | null = wrapRef.current;
    while (element != null) {
      const overflowY = getComputedStyle(element).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return document.scrollingElement;
  };
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === ui.tab) {
      // The one legal reset: re-tapping the active tab pops to root + top.
      if (next === 'commutes') patchCommutes({pushed: null});
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    const saved = scroller?.scrollTop ?? 0;
    setEntities(prev => {
      const sbt = prev.ui.screenByTab;
      const screenByTab: ScreenByTab =
        prev.ui.tab === 'today'
          ? {...sbt, today: {...sbt.today, scrollTop: saved}}
          : prev.ui.tab === 'commutes'
            ? {...sbt, commutes: {...sbt.commutes, scrollTop: saved}}
            : {...sbt, alerts: {...sbt.alerts, scrollTop: saved}};
      return {
        ...prev,
        ui: {
          ...prev.ui,
          tab: next,
          // Overlays belong to their moment; the toast dock persists.
          sheetOpen: false,
          sheetDetent: 'medium',
          routeMenuId: null,
          screenByTab,
        },
      };
    });
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = ui.screenByTab[ui.tab].scrollTop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const index = order.indexOf(ui.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(index + 1) % order.length]
        : order[(index + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(`nwx-tab-${next}`)?.focus();
  };

  // REMOVE ROUTE — undoOverConfirm: executes immediately, Undo restores the
  // exact prior index; never a confirm dialog.
  const removeRoute = (id: string) => {
    setEntities(prev => {
      const index = prev.routes.order.indexOf(id);
      if (index < 0) return prev;
      const route = prev.routes.byId[id];
      const rest = Object.fromEntries(
        Object.entries(prev.routes.byId).filter(([routeId]) => routeId !== id),
      );
      toastSeqRef.current += 1;
      return {
        ...prev,
        routes: {
          byId: rest,
          order: prev.routes.order.filter(routeId => routeId !== id),
          removed: {route, index},
        },
        ui: {
          ...prev.ui,
          routeMenuId: null,
          toast: {seq: toastSeqRef.current, text: 'Route removed', undoable: true},
          screenByTab: {
            ...prev.ui.screenByTab,
            commutes: {
              ...prev.ui.screenByTab.commutes,
              pushed: prev.ui.screenByTab.commutes.pushed === id ? null : prev.ui.screenByTab.commutes.pushed,
            },
          },
        },
      };
    });
  };
  const undoRemove = () => {
    setEntities(prev => {
      const snapshot = prev.routes.removed;
      if (snapshot == null) return prev;
      const order = [...prev.routes.order];
      order.splice(Math.min(snapshot.index, order.length), 0, snapshot.route.id);
      toastSeqRef.current += 1;
      return {
        ...prev,
        routes: {
          byId: {...prev.routes.byId, [snapshot.route.id]: snapshot.route},
          order,
          removed: null,
        },
        ui: {...prev.ui, toast: {seq: toastSeqRef.current, text: 'Restored', undoable: false}},
      };
    });
  };

  const markAlertRead = (id: string) => {
    if (ui.screenByTab.alerts.readIds.includes(id)) return;
    patchAlerts({readIds: [...ui.screenByTab.alerts.readIds, id]});
  };

  const pushedRoute = ui.screenByTab.commutes.pushed != null ? routes.byId[ui.screenByTab.commutes.pushed] : null;
  const onPushed = ui.tab === 'commutes' && pushedRoute != null;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // Leg start times: walk1 dep · bus dep+6 · walk2 dep+20 (cumulative).
  const legStarts = MAIN_LEGS.reduce<number[]>((acc, leg, i) => {
    acc.push(i === 0 ? dep : acc[i - 1] + MAIN_LEGS[i - 1].durationMin);
    return acc;
  }, []);

  const alertSwatchColor = (severity: CommuteAlert['severity']) =>
    severity === 'gust' ? ALERT_AMBER : severity === 'rain' ? LEVEL_2 : DRY_INK;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{NIMBRA_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — leading brand mark (or back on the pushed screen),
            LIVE center subtitle, one 44×44 refresh. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {onPushed ? (
              <button
                type="button"
                className="nwx-btn nwx-focusable"
                style={styles.backBtn}
                onClick={() => patchCommutes({pushed: null})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Commutes</span>
              </button>
            ) : (
              <NimbraMark />
            )}
          </div>
          {onPushed ? (
            <span style={styles.navPushedTitle}>{pushedRoute.name}</span>
          ) : (
            <div style={styles.navCenter}>
              <span style={styles.navTitle}>Nimbra</span>
              <span style={styles.navSubtitle}>
                Leave {fmtClock(dep)} · {condition}
              </span>
            </div>
          )}
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="nwx-btn nwx-focusable"
              style={styles.iconBtn}
              aria-label={ui.loading ? 'Finish refresh' : 'Refresh forecast'}
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {ui.tab === 'today' ? (
            <>
              <h1 className="nwx-vh">Today</h1>
              {/* departureSummary — 72px: 48px brand chip + 36px button. */}
              <div style={styles.departureSummary}>
                <span style={styles.leaveChip}>
                  <span style={styles.leaveTime}>{fmtClock(dep)}</span>
                  <span style={styles.leaveArrive}>arrive {fmtClock(arrive)}</span>
                </span>
                <button
                  type="button"
                  className="nwx-btn nwx-focusable"
                  style={styles.bestBtn}
                  onClick={jumpToBest}>
                  Best window · {fmtClock(best)}
                </button>
              </div>

              <DepartureScrubStrip
                departureMin={dep}
                condition={condition}
                onScrub={onScrub}
                onRelease={onRelease}
                onSnapKey={onSnapKey}
                scrollerRef={stripScrollerRef}
              />

              {/* stepperRow — the mandatory non-gesture path. */}
              <div style={styles.stepperRow}>
                <button
                  type="button"
                  className="nwx-btn nwx-focusable"
                  style={{...styles.stepBtn, ...(dep <= DEP_MIN ? styles.stepBtnDisabled : null)}}
                  disabled={dep <= DEP_MIN}
                  aria-label="Move departure 15 minutes earlier"
                  onClick={() => stepDeparture(-15)}>
                  −15m
                </button>
                <span
                  className="nwx-focusable"
                  style={styles.stepReadout}
                  role="spinbutton"
                  tabIndex={0}
                  aria-label="Departure time"
                  aria-valuemin={DEP_MIN}
                  aria-valuemax={DEP_MAX}
                  aria-valuenow={dep}
                  aria-valuetext={fmtTime(dep)}
                  onKeyDown={onSpinKeyDown}>
                  {fmtTime(dep)}
                </span>
                <button
                  type="button"
                  className="nwx-btn nwx-focusable"
                  style={{...styles.stepBtn, ...(dep >= DEP_MAX ? styles.stepBtnDisabled : null)}}
                  disabled={dep >= DEP_MAX}
                  aria-label="Move departure 15 minutes later"
                  onClick={() => stepDeparture(15)}>
                  +15m
                </button>
              </div>

              <RouteRibbon departureMin={dep} />

              <h2 style={styles.sectionHeader}>Your legs</h2>
              {ui.loading ? (
                <LegsSkeleton />
              ) : (
                <div style={styles.listCard}>
                  {MAIN_LEGS.map((leg, i) => (
                    <ExposureLegRow
                      key={leg.id}
                      leg={leg}
                      departureMin={dep}
                      legStartMin={legStarts[i]}
                      expanded={ui.screenByTab.today.expandedLeg === leg.id}
                      isLast={i === MAIN_LEGS.length - 1}
                      onToggle={() =>
                        patchToday({
                          expandedLeg: ui.screenByTab.today.expandedLeg === leg.id ? null : leg.id,
                        })
                      }
                    />
                  ))}
                </div>
              )}
              {ui.refreshed && !ui.loading ? (
                <div style={styles.updatedCaption}>Updated just now</div>
              ) : null}

              <h2 style={styles.sectionHeader}>Gear</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="nwx-btn nwx-focusable"
                  style={styles.gearTeaser}
                  aria-haspopup="dialog"
                  onClick={event => openSheet(event.currentTarget)}>
                  <span style={styles.gearTeaserText}>
                    <span style={styles.legPrimary}>Gear for {fmtClock(dep)}</span>
                    <span style={styles.legSecondary}>
                      {gearRecs.length > 0 ? `${gearRecs[0].item.name} recommended` : 'Standard kit'} · {condition}
                    </span>
                  </span>
                  <span style={styles.countChip}>{chipCount}</span>
                  <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                </button>
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {ui.tab === 'commutes' && !onPushed ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Commutes</h1>
              </div>
              <div style={{height: 12}} />
              <div style={styles.listCard}>
                {routes.order.map((id, index) => {
                  const route = routes.byId[id];
                  const routeDep = routeDeparture(route, dep);
                  const wetness = routeWetness(routeDep, route.legs);
                  return (
                    <div key={id} style={{position: 'relative'}}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <div style={styles.routeRowWrap}>
                        <button
                          type="button"
                          className="nwx-btn nwx-focusable"
                          style={styles.routeRow}
                          aria-label={route.name}
                          onClick={() => patchCommutes({pushed: id})}>
                          <span style={styles.legTile} aria-hidden>
                            <Icon icon={route.legs.some(leg => leg.kind === 'bus') ? BusIcon : FootprintsIcon} size="md" color="inherit" />
                          </span>
                          <span style={styles.legText}>
                            <span style={styles.legPrimary}>{route.name}</span>
                            <span style={styles.legSecondary}>
                              {route.modeLabel} · {route.durationMin} min · leaves {fmtClock(routeDep)}
                            </span>
                          </span>
                          <span style={wetness > 0 ? styles.wetPill : styles.dryPill}>
                            {wetness > 0 ? `Wet · ${wetness}` : 'Dry'}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="nwx-btn nwx-focusable"
                          style={styles.iconBtn}
                          aria-label={`Route actions for ${route.name}`}
                          aria-expanded={ui.routeMenuId === id}
                          onClick={event => {
                            menuOpenerRef.current = event.currentTarget;
                            update('ui', {routeMenuId: ui.routeMenuId === id ? null : id});
                          }}>
                          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                        </button>
                      </div>
                      {ui.routeMenuId === id ? (
                        <div
                          ref={routeMenuRef}
                          role="menu"
                          aria-label={`Route actions for ${route.name}`}
                          style={{...styles.anchoredMenu, top: 60}}
                          onKeyDown={event => {
                            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                            event.preventDefault();
                            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
                            const activeIndex = items.indexOf(document.activeElement as HTMLElement);
                            const next = event.key === 'ArrowDown' ? activeIndex + 1 : activeIndex - 1;
                            items[(next + items.length) % items.length]?.focus();
                          }}>
                          <button
                            type="button"
                            role="menuitem"
                            className="nwx-btn nwx-focusable"
                            style={styles.menuRow}
                            onClick={() => {
                              update('ui', {routeMenuId: null});
                              patchCommutes({pushed: id});
                            }}>
                            <Icon icon={RouteIcon} size="sm" color="secondary" />
                            <span style={styles.menuRowText}>View details</span>
                          </button>
                          <div style={styles.rowDivider} />
                          <button
                            type="button"
                            role="menuitem"
                            className="nwx-btn nwx-focusable"
                            style={{...styles.menuRow, ...styles.menuRowDanger}}
                            onClick={() => removeRoute(id)}>
                            <Icon icon={XIcon} size="sm" color="inherit" />
                            <span style={styles.menuRowText}>Remove route</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div style={styles.terminalCaption}>All {routes.order.length} routes</div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {onPushed ? (
            <>
              <h1 className="nwx-vh">{pushedRoute.name}</h1>
              <div style={{height: 12}} />
              <div style={styles.listCard}>
                <div style={styles.detailStatRow}>
                  <span style={styles.detailStatLabel}>Leaves</span>
                  <span style={styles.detailStatValue}>
                    {fmtTime(routeDeparture(pushedRoute, dep))}
                    {pushedRoute.pinnedDepartureMin == null ? ' · live' : ''}
                  </span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.detailStatRow}>
                  <span style={styles.detailStatLabel}>Arrives</span>
                  <span style={styles.detailStatValue}>
                    {fmtTime(routeDeparture(pushedRoute, dep) + pushedRoute.durationMin)}
                  </span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.detailStatRow}>
                  <span style={styles.detailStatLabel}>Wetness</span>
                  <span
                    style={
                      routeWetness(routeDeparture(pushedRoute, dep), pushedRoute.legs) > 0
                        ? styles.wetPill
                        : styles.dryPill
                    }>
                    {routeWetness(routeDeparture(pushedRoute, dep), pushedRoute.legs) > 0
                      ? `Wet · ${routeWetness(routeDeparture(pushedRoute, dep), pushedRoute.legs)}`
                      : 'Dry'}
                  </span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Legs</h2>
              <div style={styles.listCard}>
                {pushedRoute.legs.map((leg, index) => {
                  const routeDep = routeDeparture(pushedRoute, dep);
                  return (
                    <div key={leg.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.detailStatRow}>
                        <span style={{flexShrink: 0, display: 'inline-flex', color: 'var(--color-text-secondary)'}}>
                          <Icon icon={leg.kind === 'bus' ? BusIcon : FootprintsIcon} size="sm" color="inherit" />
                        </span>
                        <span style={{...styles.detailStatLabel, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {leg.name} · {leg.durationMin} min
                        </span>
                        <span style={styles.detailStatValue}>
                          {legWetness(routeDep, leg)} of {3 * leg.exposedMin}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {ui.tab === 'alerts' ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Alerts</h1>
              </div>
              <div style={{height: 12}} />
              <div style={styles.listCard}>
                {ALERTS.map((alert, index) => {
                  const unread = !ui.screenByTab.alerts.readIds.includes(alert.id);
                  return (
                    <div key={alert.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        className="nwx-btn nwx-focusable"
                        style={styles.alertRow}
                        aria-label={`${alert.title}${unread ? ', unread' : ''}`}
                        onClick={() => markAlertRead(alert.id)}>
                        <span
                          style={{...styles.alertSwatch, background: alertSwatchColor(alert.severity)}}
                          aria-hidden
                        />
                        <span style={styles.alertText}>
                          <span style={styles.alertPrimary}>{alert.title}</span>
                          <span style={styles.legSecondary}>{alert.detail}</span>
                        </span>
                        {unread ? <span style={styles.unreadDot} aria-hidden /> : null}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow so it
            pins above the tabBar even mid-scroll. No auto-dismiss timers:
            a toast persists until the next mutation replaces it. */}
        <div style={styles.toastDock} aria-live="polite" role="status">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="nwx-fade">
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undoable ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="nwx-btn nwx-focusable" style={styles.toastUndo} onClick={undoRemove}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 3 tabs, live badges. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Nimbra sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = ui.tab === tab.id;
            const badge =
              tab.id === 'commutes' ? wetRouteCount : tab.id === 'alerts' ? unreadCount : 0;
            return (
              <button
                key={tab.id}
                id={`nwx-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                className="nwx-btn nwx-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* GEAR SHEET — scrim z40 + sheet z41, absolute inside shell. */}
        {ui.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {ui.sheetOpen ? (
          <GearSheet
            departureMin={dep}
            total={total}
            detent={ui.sheetDetent}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDetentToggle={() => update('ui', {sheetDetent: ui.sheetDetent === 'medium' ? 'large' : 'medium'})}
            onStep={delta => stepDeparture(delta)}
            onClose={closeSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
