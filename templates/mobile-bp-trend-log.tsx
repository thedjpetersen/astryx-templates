// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Systa blood-pressure log for
 *   Dana Okafor: 24 readings r01–r24 spanning Jun 5 – Jul 4 2026 with
 *   Lisinopril 10mg started Jun 20. Cross-checked ledger: pre-med sys
 *   Σ1644/12 = 137, dia Σ1056/12 = 88; post-med sys Σ1536/12 = 128, dia
 *   Σ984/12 = 82 (med delta −9/−6); overall Σ3180/24 = 132.5 sys,
 *   Σ2040/24 = 85 dia; 7-day window Jun 28–Jul 4 = 5 readings, sys
 *   620/5 = 124, dia 390/5 = 78; AHA categories 4 Stage 2 + 17 Stage 1 +
 *   3 Elevated + 0 Normal = 24 (16.7 / 70.8 / 12.5 / 0 — sums 100.0).
 *   No Date.now(), no Math.random(), no network media.
 * @output Systa — Blood Pressure Trend Log: a 390px MOBILE four-tab BP
 *   app where clinical meaning lives inside the input. NavBar center is
 *   the latest reading ('128/78' + Elevated chip, a 44px hit that jumps
 *   to Trends); Trends and Log pin a sticky DualBandRiverChart (AHA zone
 *   bands, sys/dia ribbons, a bending 7-day average polyline, a Jun 20
 *   med-start flag) over a 6-chip filter rail whose subgroup deltas
 *   (post-med −9 · pre-med +9 · Left +5 · Right −5 · Standing +6 ·
 *   Seated −6) derive LIVE from the readings array. Signature input is
 *   TwinRailEntry: two vertical drag rails (sys 90–200 ×2, dia 50–120
 *   ×2) flanking a CategoryLadder whose rungs light as thumbs cross AHA
 *   thresholds, with a full [Rails | Steppers] keyboard-parity fallback.
 *   Deletes are undo-over-confirm through the one sticky toastDock; a
 *   Stage 2 save raises a RecheckBanner whose dismissal is logged as a
 *   Report-tab audit row.
 * @position Page template; emitted by `astryx template mobile-bp-trend-log`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheet, actionSheet, alert) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   any sheet/actionSheet/alert is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} (scroll position saved and restored) so absolute
 *   overlays anchor to the visible screen. The toastDock and FAB are
 *   sticky-in-flow (bottom 76 / bottom 80) per the foundations
 *   amendment — shell-absolute would pin them to the document bottom on
 *   tall scrolling tabs.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, none on the last row); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Systa clinical red #D64550); contrast-driven
 *   derivatives (BRAND_FILL, BRAND_TEXT) and the four AHA category
 *   strong/tint pairs are declared once in COLOR LITERALS with the math.
 *   Hairline/muted tokens are reserved for passive separators; every
 *   interactive boundary (rail borders, switch track, unchecked rest
 *   states) carries an explicit ≥3:1 light-dark() pair vs its ACTUAL
 *   surface, math commented at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', blur color-mix 86% +
 *   blur(12px), hairline ALWAYS ON — noted choice); tabBar 64px sticky
 *   bottom z20 (4 tabs, 24px icon over 11px/500 label, 4px gap); chart
 *   card sticky top:52 z15, height 208 = 12 pad + 20 legend + 160 svg +
 *   16 pad; chipFilterRail 44px (32px chips in 44px hits); log rows 60px
 *   two-line (16px/500 + 2px gap + 20px ContextTag chips), 16px inline
 *   padding, dividers inset 16; loadMoreRow 44px; utility rows 44px;
 *   Report stat tiles 96px in a 2-col gap-12 grid; sectionHeader 13/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; sheet detents 55% medium / calc(100% − 56px) large, 24px
 *   grabber zone with 36×5 pill, 52px sheet header; FAB 56×56; buttons
 *   48px primary / 36px secondary / 44×44 icon. TYPE (Figtree via
 *   --font-family-body): 28/700 large title (Trends only) · 22/700
 *   report deltas · 17/600 nav+sheet titles · 16/400–700 body · 13/400
 *   meta · 11/500 overlines; nothing under 11px; tabular-nums on every
 *   updating numeral. Touch: every target ≥44×44 with ≥8px clearance or
 *   merged into a full-row button; every gesture has a visible button
 *   path (44×44 ellipsis per swipe row, clickable grabber + X + Escape).
 *
 * Responsive contract:
 * - Fluid 320–430px: no width:390 literals; chart svg width 100% with
 *   fixed viewBox 358×160 + preserveAspectRatio 'none' (all chart text
 *   is HTML overlaid/adjacent, never inside the svg, so it cannot
 *   distort); chipFilterRail scrolls with scrollPaddingInline 16 and a
 *   ≥24px peek; TwinRail rails drop 64→56px below 360px container width
 *   (ladder min 96px, thumbs stay 44×44); log line 1 ellipsizes before
 *   the chip row, which truncates to a '+1' overflow chip; Report tiles
 *   collapse 2-col → 1-col via repeat(auto-fit, minmax(150px, 1fr)).
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; the anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  ListIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PillIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchXIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. House amendment: hairline/muted tokens are for PASSIVE
// separators only; interactive boundaries and meaningful rest fills get
// explicit ≥3:1 pairs vs their ACTUAL surface.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Systa clinical red). As accent text /
// strokes on the white card: #D64550 ≈ 4.35:1 (≥3:1 UI bar — used for 2px
// chart strokes, focus rings, active-chip borders, never body-size text);
// #F2848C on the dark card (~#1C1C1E) ≈ 6.9:1.
const BRAND_ACCENT = 'light-dark(#D64550, #F2848C)';
// Solid fills that carry 16px labels (FAB, Save, rail thumbs). DEVIATION:
// the spec claims #FFFFFF on #D64550 = 4.9:1 but it computes to ≈4.35:1,
// under the 4.5:1 text bar — so solid fills darken the light side ~8% to
// #C93844 (#FFFFFF on #C93844 ≈ 5.1:1); dark side keeps #F2848C with
// near-black text (#300D10 on #F2848C ≈ 7.3:1, spec's ≥7:1 ✓).
const BRAND_FILL = 'light-dark(#C93844, #F2848C)';
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #300D10)';
// Brand-tinted TEXT on card/body surfaces (chip labels, Show-more, active
// tab): #B93641 on #FFFFFF ≈ 5.7:1; #F2848C on dark card ≈ 6.9:1.
const BRAND_TEXT = 'light-dark(#B93641, #F2848C)';
// 12% brand washes for active-chip fills; the chip also carries a 1px
// BRAND_ACCENT border (≈4.3:1 light / ≈6:1 dark vs the washed surface —
// clears the ≥3:1 interactive-boundary bar; the wash alone would not).
const BRAND_TINT = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Sys ribbon wash (±3px band behind the 2px stroke — decorative depth; the
// stroke itself carries the ≥3:1 contrast).
const BRAND_RIBBON = `color-mix(in srgb, ${BRAND_ACCENT} 20%, transparent)`;
// Diastolic stroke: #7A6F66 on white card ≈ 4.9:1; #A89E94 on dark ≈ 4.4:1
// (both ≥3:1 for the 2px dashed line).
const DIA_STROKE = 'light-dark(#7A6F66, #A89E94)';
const DIA_RIBBON = `color-mix(in srgb, ${DIA_STROKE} 18%, transparent)`;
// 7-day-average polyline — text-primary-DERIVED stroke as an explicit pair
// (var(--color-text) does not exist): #4A443C on white card ≈ 9.6:1;
// #E6E0D6 on dark card ≈ 12:1.
const AVG_STROKE = 'light-dark(#4A443C, #E6E0D6)';
// Interactive-boundary hairline (rail borders, switch OFF track border,
// stepper track border). DEVIATION: spec prescribed #C9BFB4 which computes
// ≈1.6:1 vs the light muted track — under the ≥3:1 amendment; darkened to
// #8A8076 (≈3.5:1 vs --color-background-muted ~#F1EDE8); dark side #A89E94
// ≈ 5:1 vs the dark muted (~#2A2A2C).
const EDGE_STRONG = 'light-dark(#8A8076, #A89E94)';
// AHA category STRONG colors — text/dots/bars on card surfaces. Light
// sides all ≥4.5:1 on #FFFFFF and ≥4.2:1 on their own 14% tint (11–13px
// chip labels are 600 weight); dark sides ≥6:1 on the dark card.
// stage2  #C0303A ≈ 5.6:1  |  #FF9AA2 ≈ 8.1:1
// stage1  #B45309 ≈ 5.0:1  |  #F0954F ≈ 6.6:1
// elevated #8A5C00 ≈ 5.9:1 |  #E8B93C ≈ 9.3:1
// normal  #1B7A3E ≈ 5.4:1  |  #7BD9A0 ≈ 9.0:1
const CAT_STRONG: Record<Category, string> = {
  stage2: 'light-dark(#C0303A, #FF9AA2)',
  stage1: 'light-dark(#B45309, #F0954F)',
  elevated: 'light-dark(#8A5C00, #E8B93C)',
  normal: 'light-dark(#1B7A3E, #7BD9A0)',
};
// AHA zone-band washes (chart rests + ladder rungs + category chips) —
// spec-prescribed alpha fills. These washes are REDUNDANT encodings (the
// category is always also named in text: chips, ladder labels, legend
// counts); the clinically meaningful ZONE BOUNDARIES additionally get
// 1.25px lines in CAT_STRONG (≥4.5:1 vs card) so the thresholds themselves
// clear the meaningful-boundary bar the washes cannot.
const CAT_TINT: Record<Category, string> = {
  stage2: 'light-dark(rgba(214, 69, 80, 0.14), rgba(242, 132, 140, 0.18))',
  stage1: 'light-dark(rgba(180, 83, 9, 0.13), rgba(240, 149, 79, 0.18))',
  elevated: 'light-dark(rgba(202, 138, 4, 0.14), rgba(232, 185, 60, 0.16))',
  normal: 'light-dark(rgba(27, 122, 62, 0.12), rgba(123, 217, 160, 0.16))',
};
// RecheckBanner tinted surface (explicit pair, not a token wash): text on
// it is CAT_STRONG.stage2 — #C0303A on the light tint ≈ 4.9:1; #FF9AA2 on
// the dark tint ≈ 7.4:1.
const ERROR_TINT = 'light-dark(rgba(192, 48, 58, 0.10), rgba(255, 154, 162, 0.14))';
// Switch OFF track fill per the input contract; the ≥3:1 rest boundary is
// carried by its 1px EDGE_STRONG border (amendment).
const SWITCH_OFF = 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

type Category = 'normal' | 'elevated' | 'stage1' | 'stage2';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, transitions
// (transform/opacity/background only), visually-hidden h1s, skeleton pulse;
// everything collapses under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const SYSTA_CSS = `
.bpt-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.bpt-btn:disabled { cursor: default; }
.bpt-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.bpt-anim { transition: transform 200ms ease, opacity 200ms ease; }
.bpt-rung { transition: background-color 150ms ease, box-shadow 150ms ease; }
.bpt-swipe { transition: transform 180ms ease; }
@keyframes bpt-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.bpt-sheet-in { animation: bpt-sheet-in 200ms ease; }
@keyframes bpt-point-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.bpt-point-in {
  animation: bpt-point-in 200ms ease;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes bpt-pulse {
  from { opacity: 1; }
  to { opacity: 0.55; }
}
.bpt-skel { animation: bpt-pulse 1.6s ease-in-out infinite alternate; }
.bpt-vh {
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
  .bpt-anim, .bpt-rung, .bpt-swipe { transition: none; }
  .bpt-sheet-in, .bpt-point-in, .bpt-skel { animation: none; }
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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (noted).
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
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT,
    color: BRAND_TEXT,
  },
  // navBar center — latest fraction + category chip inside one 44px hit.
  navCenterBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 8,
    borderRadius: 12,
    minWidth: 0,
  },
  navFraction: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // categoryChip — 20px pill, 11/600, 8px inline padding.
  catChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // RECHECK BANNER — 64px in-flow under navBar, role=status.
  banner: {
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    background: ERROR_TINT,
    borderBottom: '1px solid var(--color-border)',
  },
  bannerIcon: {color: CAT_STRONG.stage2, display: 'inline-flex', flexShrink: 0},
  bannerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    color: CAT_STRONG.stage2,
  },
  bannerDismiss: {
    height: 44,
    paddingInline: 12,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: CAT_STRONG.stage2,
    flexShrink: 0,
  },
  // 96px bottom clearance so the last row never sits under the 56px FAB
  // (sticky at bottom:80) at max scroll.
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 96},
  // LARGE TITLE row — 52px, Trends only.
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    flexShrink: 0,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  // CHART CARD — sticky top:52 z15; 208px = 12 pad + 20 legend + 160 svg +
  // 16 pad.
  chartSticky: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    paddingInline: 16,
    background: 'var(--color-background-body)',
    paddingBottom: 4,
  },
  chartCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: '12px 12px 16px',
    overflow: 'hidden',
  },
  chartLegend: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
  },
  legendKey: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  legendSwatch: {width: 14, height: 0, borderTopWidth: 2, borderTopStyle: 'solid', flexShrink: 0},
  chartSvgWrap: {position: 'relative', width: '100%', height: 160},
  chartOverlay: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  // CHIP FILTER RAIL — 44px, horizontal scroll, 8px gaps, snap.
  chipRail: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflowX: 'auto',
    paddingInline: 16,
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
    flexShrink: 0,
  },
  filterChip: {
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    whiteSpace: 'nowrap',
    scrollSnapAlign: 'start',
    flexShrink: 0,
    // 32px visual inside the 44px rail row: the button's hit area extends
    // via 6px transparent block borders below.
    borderBlockWidth: 1,
    boxSizing: 'border-box',
  },
  filterChipOn: {
    background: BRAND_TINT,
    border: `1px solid ${BRAND_ACCENT}`,
  },
  filterChipLabel: {fontSize: 13, fontWeight: 500},
  filterChipDelta: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px; 20/8 margins.
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // 44px utility rows.
  utilityRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // LOG rows — 60px two-line with swipe-reveal delete.
  logRowOuter: {position: 'relative', overflow: 'hidden'},
  deleteBlock: {
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
  logRowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  logRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  logLine1: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  logFraction: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  catDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  logMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // ContextTagRow — non-interactive 20px label chips on line 2.
  tagRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden'},
  tagChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 7,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    marginInlineEnd: 4,
  },
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_TEXT,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  updatedCaption: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // Skeleton rows — same 60px geometry as the log rows they impersonate.
  skelRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
  },
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // EMPTY STATES.
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
    margin: '4px 0 16px',
  },
  emptySecondaryBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  emptyPrimaryBtn: {
    height: 48,
    paddingInline: 20,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
  },
  // REPORT — stat tiles (96px, 2-col → 1-col below 352px via auto-fit).
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12,
    paddingInline: 16,
  },
  statTile: {
    height: 96,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    minWidth: 0,
  },
  statTileValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statTileCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  deltaRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  deltaValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: CAT_STRONG.normal,
    whiteSpace: 'nowrap',
  },
  deltaCaption: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Stacked distribution bar.
  distBarWrap: {padding: '16px 16px 8px'},
  distBar: {
    display: 'flex',
    height: 16,
    borderRadius: 999,
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  distLegendRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
  },
  distLegendLabel: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  distLegendCount: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  distLegendPct: {
    width: 52,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  auditRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // PROFILE.
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: BRAND_TINT,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  profileRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  profileText: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  profilePrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  profileSecondary: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  // 51×31 switch; the FULL 44px row is the role=switch button. OFF track
  // carries a 1px EDGE_STRONG border (≥3:1 rest boundary, amendment).
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    position: 'relative',
    flexShrink: 0,
    boxSizing: 'border-box',
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
  dangerRowText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: 'var(--color-error)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // FAB — sticky-in-flow anchor (height 0) so it rides 80px above the
  // scrollport bottom (16px above the 64px tabBar) even mid-scroll.
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // TOAST DOCK — the ONE polite live region; sticky-in-flow at bottom 76
  // (64px tabBar + 12px), per the foundations amendment.
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
    maxWidth: 'calc(100% - 32px)',
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
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
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
  // TAB BAR — 64px sticky bottom z20, 4 tabs.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    flexShrink: 0,
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
  tabItemActive: {color: BRAND_TEXT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: 1},
  tabLabelActive: {fontWeight: 600},
  // SHEET — scrim z40 + sheet z41.
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  // Segmented control — 36px track, radiogroup.
  segTrack: {
    display: 'flex',
    height: 36,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    padding: 2,
    gap: 2,
    marginBottom: 16,
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  // TWIN RAILS.
  railsWrap: {display: 'flex', justifyContent: 'center', gap: 8},
  railCol: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8},
  rail: {
    position: 'relative',
    height: 320,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    border: `1px solid ${EDGE_STRONG}`,
    touchAction: 'none',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  railThumb: {
    position: 'absolute',
    left: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    borderRadius: '50%',
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    boxShadow: '0 2px 8px var(--color-shadow)',
    touchAction: 'none',
  },
  railCaption: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Category ladder — four 56px rungs.
  ladder: {
    flex: 1,
    minWidth: 96,
    maxWidth: 120,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  },
  rung: {
    height: 56,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 10,
    background: 'var(--color-background-muted)',
  },
  rungLabel: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  rungCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Stepper fallback (formField + 96×32 stepper).
  fieldBlock: {display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  stepperLine: {display: 'flex', alignItems: 'center', gap: 16},
  stepperTrack: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    border: `1px solid ${EDGE_STRONG}`,
    overflow: 'hidden',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperRule: {width: 1, background: EDGE_STRONG, flexShrink: 0},
  stepperValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 56,
  },
  // Tag pickers — 8px-gap chip grids; 44px-tall chips.
  pickGroup: {display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16},
  chipGrid: {display: 'flex', flexWrap: 'wrap', gap: 8},
  pickChip: {
    height: 44,
    paddingInline: 16,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 16,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  pickChipOn: {
    background: BRAND_TINT,
    border: `1px solid ${BRAND_ACCENT}`,
    fontWeight: 600,
  },
  // Date/time utility row + inline datePanel.
  dateCard: {
    marginTop: 24,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  datePill: {
    height: 36,
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  datePanel: {padding: '8px 12px 16px', borderTop: '1px solid var(--color-border)'},
  monthHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  monthTitle: {fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  weekHead: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    marginBottom: 4,
  },
  dayGrid: {display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2},
  dayCell: {
    height: 40,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: '50%',
    justifySelf: 'center',
    width: 40,
    boxSizing: 'border-box',
  },
  dayCellToday: {border: '1px solid var(--color-border)'},
  dayCellSelected: {background: BRAND_FILL, color: BRAND_FILL_TEXT, fontWeight: 600},
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  // ACTION SHEET — insetInline 16 bottom 16, two stacked cards 8px apart.
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
  },
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  asRowDestructive: {color: 'var(--color-error)'},
  asDividerFull: {height: 1, background: 'var(--color-border)'},
  asCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  // ALERT — z60/61, scrim click does NOT dismiss.
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(280px, calc(100% - 64px))',
    zIndex: 61,
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  alertBody: {padding: 20, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '8px 0 0'},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  alertBtnDestructive: {fontWeight: 600, color: 'var(--color-error)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — SINGLE SOURCE: 24 readings, Jun 5 – Jul 4 2026, med start
// Jun 20. VERIFIED ARITHMETIC (cross-checked by hand): pre sys Σ1644/12 =
// 137 · pre dia Σ1056/12 = 88 · post sys Σ1536/12 = 128 · post dia
// Σ984/12 = 82 → med delta −9/−6; overall Σ3180/24 = 132.5 · Σ2040/24 =
// 85; 7-day (Jun 28–Jul 4, exactly 5 readings) sys 620/5 = 124 · dia
// 390/5 = 78; categories 4 Stage 2 (r01 r02 r04 r08) + 17 Stage 1 + 3
// Elevated (r22 r23 r24) + 0 Normal = 24 ✓; Left n=12 Σ1620 avg 135 vs
// Right Σ1560 avg 130 (+5/−5); Standing n=6 Σ822 avg 137 vs Seated n=18
// Σ2358 avg 131 (+6/−6). Boundary stress: r24 128/78 is Elevated (dia 78
// < 80); r21 124/80 is Stage 1 purely via diastolic (OR logic).
// ---------------------------------------------------------------------------

const USER = 'Dana Okafor';
const MED = 'Lisinopril 10mg';
const MED_START_LABEL = 'Jun 20';
const MED_START_DAY = 15; // day index of Jun 20 (Jun 5 = 0)
const DOCTOR = 'Dr. Imani Sefu';

type Arm = 'Left' | 'Right';
type Posture = 'Seated' | 'Standing';
type Med = 'pre' | 'post';

interface Reading {
  id: string;
  dateISO: string;
  dateLabel: string; // 'Jul 4'
  monthKey: 'JUNE' | 'JULY';
  dayIndex: number; // days since Jun 5 2026 (dual field beside dateISO)
  sys: number;
  dia: number;
  arm: Arm;
  posture: Posture;
  med: Med;
  time: string;
}

// id · dateISO · label · dayIndex · sys · dia · arm · posture · med · time
type ReadingRow = readonly [string, string, string, number, number, number, Arm, Posture, Med, string];

const READING_ROWS: readonly ReadingRow[] = [
  ['r01', '2026-06-05', 'Jun 5', 0, 142, 92, 'Left', 'Standing', 'pre', '8:05 AM'],
  ['r02', '2026-06-06', 'Jun 6', 1, 138, 90, 'Left', 'Seated', 'pre', '7:48 AM'],
  ['r03', '2026-06-07', 'Jun 7', 2, 136, 89, 'Left', 'Seated', 'pre', '8:12 AM'],
  ['r04', '2026-06-08', 'Jun 8', 3, 140, 91, 'Left', 'Standing', 'pre', '7:55 AM'],
  ['r05', '2026-06-09', 'Jun 9', 4, 134, 87, 'Right', 'Standing', 'pre', '8:30 AM'],
  ['r06', '2026-06-10', 'Jun 10', 5, 139, 88, 'Left', 'Standing', 'pre', '7:41 AM'],
  ['r07', '2026-06-12', 'Jun 12', 7, 135, 86, 'Right', 'Seated', 'pre', '9:02 AM'],
  ['r08', '2026-06-13', 'Jun 13', 8, 141, 90, 'Left', 'Standing', 'pre', '7:58 AM'],
  ['r09', '2026-06-14', 'Jun 14', 9, 133, 85, 'Right', 'Seated', 'pre', '8:21 AM'],
  ['r10', '2026-06-16', 'Jun 16', 11, 137, 89, 'Left', 'Seated', 'pre', '7:45 AM'],
  ['r11', '2026-06-17', 'Jun 17', 12, 136, 86, 'Left', 'Seated', 'pre', '8:08 AM'],
  ['r12', '2026-06-18', 'Jun 18', 13, 133, 83, 'Right', 'Seated', 'pre', '7:52 AM'],
  ['r13', '2026-06-20', 'Jun 20', 15, 134, 88, 'Left', 'Seated', 'post', '8:00 AM'],
  ['r14', '2026-06-21', 'Jun 21', 16, 133, 87, 'Right', 'Seated', 'post', '8:17 AM'],
  ['r15', '2026-06-22', 'Jun 22', 17, 132, 85, 'Right', 'Seated', 'post', '7:49 AM'],
  ['r16', '2026-06-23', 'Jun 23', 18, 131, 85, 'Left', 'Seated', 'post', '8:24 AM'],
  ['r17', '2026-06-24', 'Jun 24', 19, 130, 84, 'Right', 'Seated', 'post', '7:56 AM'],
  ['r18', '2026-06-25', 'Jun 25', 20, 129, 83, 'Right', 'Seated', 'post', '8:03 AM'],
  ['r19', '2026-06-26', 'Jun 26', 21, 127, 82, 'Right', 'Seated', 'post', '8:39 AM'],
  ['r20', '2026-06-28', 'Jun 28', 23, 126, 81, 'Left', 'Standing', 'post', '7:44 AM'],
  ['r21', '2026-06-29', 'Jun 29', 24, 124, 80, 'Right', 'Seated', 'post', '8:11 AM'],
  ['r22', '2026-06-30', 'Jun 30', 25, 122, 77, 'Right', 'Seated', 'post', '7:57 AM'],
  ['r23', '2026-07-02', 'Jul 2', 27, 120, 74, 'Left', 'Seated', 'post', '8:26 AM'],
  ['r24', '2026-07-04', 'Jul 4', 29, 128, 78, 'Right', 'Seated', 'post', '8:05 AM'],
];

const READINGS: Reading[] = READING_ROWS.map(
  ([id, dateISO, dateLabel, dayIndex, sys, dia, arm, posture, med, time]) => ({
    id,
    dateISO,
    dateLabel,
    monthKey: dateISO.slice(5, 7) === '07' ? 'JULY' : 'JUNE',
    dayIndex,
    sys,
    dia,
    arm,
    posture,
    med,
    time,
  }),
);

// Filter tag vocabulary — rail order per spec.
type TagId = 'post' | 'pre' | 'Left' | 'Right' | 'Standing' | 'Seated';
const TAG_ORDER: TagId[] = ['post', 'pre', 'Left', 'Right', 'Standing', 'Seated'];
const TAG_LABEL: Record<TagId, string> = {
  post: 'post-med',
  pre: 'pre-med',
  Left: 'Left',
  Right: 'Right',
  Standing: 'Standing',
  Seated: 'Seated',
};

function readingHasTag(reading: Reading, tag: TagId): boolean {
  if (tag === 'post' || tag === 'pre') return reading.med === tag;
  if (tag === 'Left' || tag === 'Right') return reading.arm === tag;
  return reading.posture === tag;
}

// ---------------------------------------------------------------------------
// CLINICAL + FORMAT HELPERS — pure, deterministic.
// ---------------------------------------------------------------------------

/**
 * AHA categories with OR logic for the two worse buckets: Stage 2 ≥140 or
 * ≥90; Stage 1 130–139 or 80–89; Elevated 120–129 and <80; Normal <120 and
 * <80. r21 (124/80) lands Stage 1 purely via diastolic; r24 (128/78) is
 * Elevated because dia 78 < 80 — both are deliberate boundary fixtures.
 */
function categoryOf(sys: number, dia: number): Category {
  if (sys >= 140 || dia >= 90) return 'stage2';
  if (sys >= 130 || dia >= 80) return 'stage1';
  if (sys >= 120) return 'elevated';
  return 'normal';
}

const CAT_LABEL: Record<Category, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  stage1: 'Stage 1',
  stage2: 'Stage 2',
};

const CAT_CAPTION: Record<Category, string> = {
  stage2: '≥140 or ≥90',
  stage1: '130–139 or 80–89',
  elevated: '120–129 and <80',
  normal: '<120 and <80',
};

/** Rounds to 1 decimal; drops the trailing .0 (132.5 · 137 · 127.5). */
function fmt1(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Signed delta with a true minus sign: '+5' · '−9.5' · '±0'. */
function fmtDelta(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return '±0';
  return rounded > 0 ? `+${fmt1(rounded)}` : `−${fmt1(Math.abs(rounded))}`;
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Days since Jun 5 2026 for arbitrary picker dates (UTC math — no
// Date.now(), fully deterministic).
const EPOCH_JUN5 = Date.UTC(2026, 5, 5);
function dayIndexOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - EPOCH_JUN5) / 86400000);
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function labelOf(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTH_SHORT[m - 1]} ${d}`;
}

// ---------------------------------------------------------------------------
// HOOKS — container width (grid-feeder-console pattern) + focus trap.
// ---------------------------------------------------------------------------

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

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus({preventScroll: true});
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus({preventScroll: true});
  }
}

/** Nearest scrollable ancestor — the demo's .preview-wrap owns the page
 * scroll; per-tab scroll persistence records/restores its scrollTop. */
function getScroller(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const style = window.getComputedStyle(current);
    if (
      current.scrollHeight > current.clientHeight &&
      (style.overflowY === 'auto' || style.overflowY === 'scroll')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — readingsStore via useReducer in the root component.
// Every derived figure (chip deltas, chart paths, 7-day avg, Report stats)
// is a useMemo over `readings` — no second copy anywhere. A 'loading'
// refresh resolves on the NEXT user action ('Updated just now'), never on
// a timer.
// ---------------------------------------------------------------------------

type TabId = 'trends' | 'log' | 'report' | 'profile';

interface Draft {
  sys: number;
  dia: number;
  arm: Arm;
  posture: Posture;
  med: Med;
  dateISO: string;
  hour: number;
  minute: number;
  meridiem: 'AM' | 'PM';
}

const DRAFT_DEFAULT: Draft = {
  sys: 128,
  dia: 80,
  arm: 'Left',
  posture: 'Seated',
  med: 'post',
  dateISO: '2026-07-04',
  hour: 2,
  minute: 30,
  meridiem: 'PM',
};

interface RecheckEvent {
  id: string;
  type: 'recheck-dismissed';
  readingId: string;
  dateLabel: string;
}

interface Toast {
  seq: number;
  msg: string;
  undo?: {reading: Reading; index: number};
}

interface StoreState {
  readings: Reading[];
  events: RecheckEvent[];
  activeTab: TabId;
  activeFilters: TagId[];
  sheet: null | {mode: 'new'} | {mode: 'edit'; id: string};
  sheetDetent: 'medium' | 'large';
  entryMode: 'rails' | 'steppers';
  draft: Draft;
  datePanelOpen: boolean;
  actionSheetId: string | null;
  alertOpen: boolean;
  banner: null | {readingId: string};
  toast: Toast | null;
  logShownCount: number;
  openSwipeId: string | null;
  refreshState: 'idle' | 'loading' | 'updated';
  remindersOn: boolean;
  nextIdNum: number;
  lastAddedId: string | null;
}

const INITIAL_STATE: StoreState = {
  readings: READINGS,
  events: [],
  activeTab: 'trends',
  activeFilters: [],
  sheet: null,
  sheetDetent: 'medium',
  entryMode: 'rails',
  draft: DRAFT_DEFAULT,
  datePanelOpen: false,
  actionSheetId: null,
  alertOpen: false,
  banner: null,
  toast: null,
  logShownCount: 12,
  openSwipeId: null,
  refreshState: 'idle',
  remindersOn: true,
  nextIdNum: 25,
  lastAddedId: null,
};

type Action =
  | {type: 'setTab'; tab: TabId}
  | {type: 'toggleFilter'; tag: TagId}
  | {type: 'clearFilters'}
  | {type: 'openSheet'; mode: 'new' | 'edit'; id?: string}
  | {type: 'closeSheet'}
  | {type: 'toggleDetent'}
  | {type: 'setEntryMode'; mode: 'rails' | 'steppers'}
  | {type: 'patchDraft'; patch: Partial<Draft>}
  | {type: 'toggleDatePanel'; open?: boolean}
  | {type: 'save'}
  | {type: 'openActionSheet'; id: string}
  | {type: 'closeActionSheet'}
  | {type: 'deleteReading'; id: string}
  | {type: 'undo'}
  | {type: 'dismissBanner'}
  | {type: 'showMore'}
  | {type: 'refresh'}
  | {type: 'toggleReminders'}
  | {type: 'openAlert'}
  | {type: 'closeAlert'}
  | {type: 'deleteAll'}
  | {type: 'setSwipe'; id: string | null}
  | {type: 'announce'; msg: string};

function matchesFilters(reading: Reading, filters: TagId[]): boolean {
  return filters.every(tag => readingHasTag(reading, tag));
}

function nextToast(state: StoreState, msg: string, undo?: Toast['undo']): Toast {
  return {seq: (state.toast?.seq ?? 0) + 1, msg, undo};
}

function draftFromReading(reading: Reading): Draft {
  const match = /^(\d+):(\d+) (AM|PM)$/.exec(reading.time);
  return {
    sys: reading.sys,
    dia: reading.dia,
    arm: reading.arm,
    posture: reading.posture,
    med: reading.med,
    dateISO: reading.dateISO,
    hour: match ? Number(match[1]) : 8,
    minute: match ? Number(match[2]) : 0,
    meridiem: match ? (match[3] as 'AM' | 'PM') : 'AM',
  };
}

function readingFromDraft(draft: Draft, id: string): Reading {
  return {
    id,
    dateISO: draft.dateISO,
    dateLabel: labelOf(draft.dateISO),
    monthKey: draft.dateISO.slice(5, 7) === '07' ? 'JULY' : 'JUNE',
    dayIndex: dayIndexOf(draft.dateISO),
    sys: draft.sys,
    dia: draft.dia,
    arm: draft.arm,
    posture: draft.posture,
    med: draft.med,
    time: `${draft.hour}:${String(draft.minute).padStart(2, '0')} ${draft.meridiem}`,
  };
}

function reducer(prev: StoreState, action: Action): StoreState {
  // A pending refresh resolves on the next user-driven action (never a
  // timer): skeleton → rows + 'Updated just now' through the toastDock.
  const state: StoreState =
    prev.refreshState === 'loading' && action.type !== 'refresh'
      ? {...prev, refreshState: 'updated', toast: nextToast(prev, 'Updated just now')}
      : prev;
  switch (action.type) {
    case 'setTab': {
      if (action.tab === state.activeTab) return state;
      // Overlays belong to their moment: sheet/actionSheet/alert close on
      // tab switch; the toast dock persists (per-tab-persistence law).
      return {
        ...state,
        activeTab: action.tab,
        sheet: null,
        actionSheetId: null,
        alertOpen: false,
        openSwipeId: null,
        datePanelOpen: false,
      };
    }
    case 'toggleFilter': {
      const on = state.activeFilters.includes(action.tag);
      const activeFilters = on
        ? state.activeFilters.filter(tag => tag !== action.tag)
        : [...state.activeFilters, action.tag];
      const count = state.readings.filter(r => matchesFilters(r, activeFilters)).length;
      return {
        ...state,
        activeFilters,
        openSwipeId: null,
        toast: nextToast(state, `${count} reading${count === 1 ? '' : 's'} match`),
      };
    }
    case 'clearFilters':
      return {...state, activeFilters: [], toast: nextToast(state, 'Filters cleared')};
    case 'openSheet': {
      const source = action.mode === 'edit' ? state.readings.find(r => r.id === action.id) : undefined;
      return {
        ...state,
        sheet: action.mode === 'edit' && action.id != null ? {mode: 'edit', id: action.id} : {mode: 'new'},
        sheetDetent: 'medium',
        draft: source != null ? draftFromReading(source) : DRAFT_DEFAULT,
        datePanelOpen: false,
        actionSheetId: null,
        openSwipeId: null,
      };
    }
    case 'closeSheet':
      return {...state, sheet: null, datePanelOpen: false};
    case 'toggleDetent':
      return {...state, sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'};
    case 'setEntryMode':
      return {...state, entryMode: action.mode};
    case 'patchDraft':
      return {...state, draft: {...state.draft, ...action.patch}};
    case 'toggleDatePanel':
      return {...state, datePanelOpen: action.open ?? !state.datePanelOpen};
    case 'save': {
      if (state.sheet == null) return state;
      const category = categoryOf(state.draft.sys, state.draft.dia);
      if (state.sheet.mode === 'edit') {
        const id = state.sheet.id;
        const readings = state.readings
          .map(r => (r.id === id ? readingFromDraft(state.draft, id) : r))
          .sort((a, b) => a.dayIndex - b.dayIndex);
        return {
          ...state,
          readings,
          sheet: null,
          datePanelOpen: false,
          lastAddedId: id,
          banner: category === 'stage2' ? {readingId: id} : state.banner,
          toast: nextToast(state, `Reading updated — ${CAT_LABEL[category]}`),
        };
      }
      const id = `r${state.nextIdNum}`;
      const reading = readingFromDraft(state.draft, id);
      // Insert chronologically (stable: same-day readings append after).
      const insertAt = (() => {
        let at = state.readings.length;
        for (let i = state.readings.length - 1; i >= 0; i--) {
          if (state.readings[i].dayIndex <= reading.dayIndex) return i + 1;
          at = i;
        }
        return at === state.readings.length ? state.readings.length : at;
      })();
      const readings = [...state.readings.slice(0, insertAt), reading, ...state.readings.slice(insertAt)];
      return {
        ...state,
        readings,
        nextIdNum: state.nextIdNum + 1,
        sheet: null,
        datePanelOpen: false,
        lastAddedId: id,
        banner: category === 'stage2' ? {readingId: id} : state.banner,
        toast: nextToast(state, `Reading saved — ${CAT_LABEL[category]}`),
      };
    }
    case 'openActionSheet':
      return {...state, actionSheetId: action.id, openSwipeId: null};
    case 'closeActionSheet':
      return {...state, actionSheetId: null};
    case 'deleteReading': {
      const index = state.readings.findIndex(r => r.id === action.id);
      if (index < 0) return state;
      const reading = state.readings[index];
      const readings = state.readings.filter(r => r.id !== action.id);
      return {
        ...state,
        readings,
        actionSheetId: null,
        openSwipeId: null,
        banner: state.banner?.readingId === action.id ? null : state.banner,
        lastAddedId: null,
        // undoOverConfirm: execute immediately; Undo restores the EXACT
        // index so the average line un-bends to the same shape.
        toast: nextToast(state, 'Reading deleted', {reading, index}),
      };
    }
    case 'undo': {
      const undo = state.toast?.undo;
      if (undo == null) return state;
      const readings = [...state.readings.slice(0, undo.index), undo.reading, ...state.readings.slice(undo.index)];
      return {...state, readings, toast: nextToast(state, 'Restored')};
    }
    case 'dismissBanner': {
      if (state.banner == null) return state;
      const reading = state.readings.find(r => r.id === state.banner?.readingId);
      const event: RecheckEvent = {
        id: `ev${state.events.length + 1}`,
        type: 'recheck-dismissed',
        readingId: state.banner.readingId,
        dateLabel: reading?.dateLabel ?? 'Jul 4',
      };
      return {...state, banner: null, events: [...state.events, event]};
    }
    case 'showMore': {
      const total = state.readings.filter(r => matchesFilters(r, state.activeFilters)).length;
      const added = Math.min(12, total - state.logShownCount);
      return {
        ...state,
        logShownCount: state.logShownCount + 12,
        toast: nextToast(state, `${added} more loaded`),
      };
    }
    case 'refresh':
      return {...state, refreshState: 'loading', toast: nextToast(state, 'Loading')};
    case 'toggleReminders':
      return {
        ...state,
        remindersOn: !state.remindersOn,
        toast: nextToast(state, state.remindersOn ? 'Reminders off' : 'Reminders on'),
      };
    case 'openAlert':
      return {...state, alertOpen: true};
    case 'closeAlert':
      return {...state, alertOpen: false};
    case 'deleteAll':
      return {
        ...state,
        readings: [],
        banner: null,
        alertOpen: false,
        openSwipeId: null,
        logShownCount: 12,
        lastAddedId: null,
        toast: nextToast(state, 'All readings deleted'),
      };
    case 'setSwipe':
      return {...state, openSwipeId: action.id};
    case 'announce':
      return {...state, toast: nextToast(state, action.msg)};
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// DUAL-BAND RIVER CHART — SVG viewBox '0 0 358 160', preserveAspectRatio
// 'none' (bands and paths stretch fluidly; ALL text is HTML overlaid at
// %-left, never inside the svg, so it cannot distort). Y map: y = 150 −
// (mmHg − 60) × 1.4 (160→10 · 140→38 · 130→52 · 120→66 · 80→122 ·
// 60→150). X map: Jun 5 (day 0) → Jul 4 (day 29) across x8–350; 342/29 ≈
// 11.79px/day (spec quoted 11.4 = 342/30; 29 intervals span 30 dates —
// noted micro-deviation so the last point lands exactly at x350). Points
// are plotted at reading dates only; gaps bridge with straight segments.
// ---------------------------------------------------------------------------

const CHART_X0 = 8;
const CHART_X1 = 350;
const CHART_DAYS = 29;

function chartX(dayIndex: number): number {
  const clamped = Math.max(0, Math.min(CHART_DAYS, dayIndex));
  return CHART_X0 + (clamped * (CHART_X1 - CHART_X0)) / CHART_DAYS;
}

function chartY(mmHg: number): number {
  return 150 - (mmHg - 60) * 1.4;
}

function ribbonPath(points: Array<{x: number; y: number}>): string {
  if (points.length === 0) return '';
  const top = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${(p.y - 3).toFixed(1)}`).join(' ');
  const bottom = [...points]
    .reverse()
    .map(p => `L ${p.x.toFixed(1)} ${(p.y + 3).toFixed(1)}`)
    .join(' ');
  return `${top} ${bottom} Z`;
}

function linePath(points: Array<{x: number; y: number}>): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

// Zone bands top-to-bottom (rest fills are the spec's alpha washes — a
// REDUNDANT encoding; the threshold boundary lines below carry CAT_STRONG
// at ≥4.5:1 vs the card so the clinical cut-points meet the amendment).
const ZONE_BANDS: Array<{cat: Category; y: number; h: number}> = [
  {cat: 'stage2', y: 10, h: 28},
  {cat: 'stage1', y: 38, h: 14},
  {cat: 'elevated', y: 52, h: 14},
  {cat: 'normal', y: 66, h: 84},
];
const ZONE_LINES: Array<{cat: Category; y: number}> = [
  {cat: 'stage2', y: 38}, // 140 mmHg
  {cat: 'stage1', y: 52}, // 130 mmHg
  {cat: 'elevated', y: 66}, // 120 mmHg
];

interface ChartProps {
  readings: Reading[];
  lastAddedId: string | null;
}

interface AvgPoint {
  x: number;
  y: number;
  sys: number;
  dia: number;
}

function DualBandRiverChart({readings, lastAddedId}: ChartProps) {
  const {sysPts, diaPts, avgPts, label} = useMemo(() => {
    const sys = readings.map(r => ({x: chartX(r.dayIndex), y: chartY(r.sys), id: r.id}));
    const dia = readings.map(r => ({x: chartX(r.dayIndex), y: chartY(r.dia), id: r.id}));
    const avg: AvgPoint[] = readings.map(reading => {
      const window = readings.filter(
        r => r.dayIndex >= reading.dayIndex - 6 && r.dayIndex <= reading.dayIndex,
      );
      const sysAvg = mean(window.map(r => r.sys));
      const diaAvg = mean(window.map(r => r.dia));
      return {x: chartX(reading.dayIndex), y: chartY(sysAvg), sys: sysAvg, dia: diaAvg};
    });
    const last = avg[avg.length - 1];
    const overallSys = mean(readings.map(r => r.sys));
    const trend =
      last == null
        ? 'no readings'
        : last.sys < overallSys - 1
          ? `trending down since med start ${MED_START_LABEL}`
          : last.sys > overallSys + 1
            ? 'trending up'
            : 'holding steady';
    const latest = readings[readings.length - 1];
    return {
      sysPts: sys,
      diaPts: dia,
      avgPts: avg,
      label:
        latest == null
          ? 'Blood pressure chart — no readings match'
          : `${readings.length} readings, ${trend}, latest ${latest.sys}/${latest.dia}`,
    };
  }, [readings]);

  const lastAvg = avgPts[avgPts.length - 1];
  const medX = chartX(MED_START_DAY);

  return (
    <div style={styles.chartCard}>
      <div style={styles.chartLegend} aria-hidden>
        <span style={styles.legendKey}>
          <span style={{...styles.legendSwatch, borderTopColor: BRAND_ACCENT}} />
          Systolic
        </span>
        <span style={styles.legendKey}>
          <span style={{...styles.legendSwatch, borderTopColor: DIA_STROKE, borderTopStyle: 'dashed'}} />
          Diastolic
        </span>
        <span style={styles.legendKey}>
          <span style={{...styles.legendSwatch, borderTopColor: AVG_STROKE}} />
          7-day avg
        </span>
      </div>
      <div style={styles.chartSvgWrap} role="img" aria-label={label}>
        <svg
          width="100%"
          height={160}
          viewBox="0 0 358 160"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden>
          {ZONE_BANDS.map(band => (
            <rect key={band.cat} x={0} y={band.y} width={358} height={band.h} fill={CAT_TINT[band.cat]} />
          ))}
          {ZONE_LINES.map(line => (
            <line
              key={line.cat}
              x1={0}
              x2={358}
              y1={line.y}
              y2={line.y}
              stroke={CAT_STRONG[line.cat]}
              strokeWidth={1.25}
              strokeDasharray="3 4"
              opacity={0.7}
            />
          ))}
          {/* Med-start flag — 1.5px vertical rule at Jun 20. */}
          <line x1={medX} x2={medX} y1={10} y2={150} stroke={AVG_STROKE} strokeWidth={1.5} strokeDasharray="2 3" />
          {sysPts.length > 1 ? <path d={ribbonPath(sysPts)} fill={BRAND_RIBBON} /> : null}
          {diaPts.length > 1 ? <path d={ribbonPath(diaPts)} fill={DIA_RIBBON} /> : null}
          {diaPts.length > 0 ? (
            <path d={linePath(diaPts)} stroke={DIA_STROKE} strokeWidth={2} strokeDasharray="4 2" />
          ) : null}
          {sysPts.length > 0 ? <path d={linePath(sysPts)} stroke={BRAND_ACCENT} strokeWidth={2} /> : null}
          {avgPts.length > 1 ? (
            <path d={linePath(avgPts)} stroke={AVG_STROKE} strokeWidth={2.5} opacity={0.9} />
          ) : null}
          {diaPts.map(p => (
            <circle
              key={`d-${p.id}`}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill={DIA_STROKE}
              className={p.id === lastAddedId ? 'bpt-point-in' : undefined}
            />
          ))}
          {sysPts.map(p => (
            <circle
              key={`s-${p.id}`}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={BRAND_ACCENT}
              className={p.id === lastAddedId ? 'bpt-point-in' : undefined}
            />
          ))}
        </svg>
        {/* HTML overlays — positioned by %-left so they track the fluid
            x-stretch without distorting (text never lives in the svg). */}
        <span
          style={{
            ...styles.chartOverlay,
            left: `${((medX / 358) * 100).toFixed(1)}%`,
            top: 2,
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            color: 'var(--color-text-secondary)',
          }}
          aria-hidden>
          <Icon icon={PillIcon} size="xsm" color="inherit" />
          20
        </span>
        {lastAvg != null ? (
          <span
            style={{
              ...styles.chartOverlay,
              right: 0,
              top: Math.max(2, Math.min(140, lastAvg.y - 18)),
              color: AVG_STROKE,
            }}
            aria-hidden>
            7-day {fmt1(lastAvg.sys)}/{fmt1(lastAvg.dia)}
          </span>
        ) : (
          <span
            style={{
              ...styles.chartOverlay,
              left: '50%',
              top: 72,
              transform: 'translateX(-50%)',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}
            aria-hidden>
            No readings match
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TWIN-RAIL ENTRY — two vertical drag rails flanking the CategoryLadder.
// Sys rail 90–200 (55 detents of 2 ≈ 5.0px each over the 276px thumb
// travel); dia rail 50–120 (35 detents ≈ 7.9px). Thumbs are 44×44 real
// buttons with role=slider (Arrow ±2, PageUp/Down ±10, Home/End) and
// aria-valuetext naming the clinical consequence. The [Rails | Steppers]
// segmented control swaps in spinbutton formFields — the CONTRACT fallback,
// not garnish.
// ---------------------------------------------------------------------------

const RAIL_H = 320;
const THUMB = 44;

interface RailProps {
  label: 'Systolic' | 'Diastolic';
  value: number;
  min: number;
  max: number;
  width: number;
  category: Category;
  onChange: (value: number) => void;
}

function DragRail({label, value, min, max, width, category, onChange}: RailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const valueFromClientY = useCallback(
    (clientY: number): number => {
      const rail = railRef.current;
      if (rail == null) return value;
      const rect = rail.getBoundingClientRect();
      const usable = rect.height - THUMB;
      const rel = Math.max(0, Math.min(usable, rect.bottom - THUMB / 2 - clientY));
      const raw = min + (rel / usable) * (max - min);
      // Magnetic snap to 2 mmHg detents.
      return Math.max(min, Math.min(max, min + Math.round((raw - min) / 2) * 2));
    },
    [max, min, value],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onChange(valueFromClientY(event.clientY));
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onChange(valueFromClientY(event.clientY));
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = value + 2;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = value - 2;
    else if (event.key === 'PageUp') next = value + 10;
    else if (event.key === 'PageDown') next = value - 10;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    if (next == null) return;
    event.preventDefault();
    onChange(Math.max(min, Math.min(max, next)));
  };

  const frac = (value - min) / (max - min);
  const top = (1 - frac) * (RAIL_H - THUMB);

  return (
    <div style={styles.railCol}>
      <div
        ref={railRef}
        style={{...styles.rail, width}}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
        <button
          type="button"
          className="bpt-btn bpt-focusable"
          style={{...styles.railThumb, top}}
          role="slider"
          aria-orientation="vertical"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${label.toLowerCase()} — ${CAT_LABEL[category]}`}
          onKeyDown={handleKeyDown}>
          {value}
        </button>
      </div>
      <span style={styles.railCaption}>{label}</span>
    </div>
  );
}

interface LadderProps {
  category: Category;
}

// Active rung = zone tint fill + 2px inset brand border, recomputed live
// as the WORSE of the two values (max(sysCategory, diaCategory) — the
// categoryOf OR logic); 150ms background transition, instant under
// reduced motion.
function CategoryLadder({category}: LadderProps) {
  const rungs: Category[] = ['stage2', 'stage1', 'elevated', 'normal'];
  return (
    <div style={styles.ladder} aria-hidden>
      {rungs.map(rung => {
        const active = rung === category;
        return (
          <div
            key={rung}
            className="bpt-rung"
            style={{
              ...styles.rung,
              ...(active
                ? {background: CAT_TINT[rung], boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`}
                : null),
            }}>
            <span style={{...styles.rungLabel, color: active ? CAT_STRONG[rung] : 'var(--color-text-primary)'}}>
              {CAT_LABEL[rung]}
            </span>
            <span style={styles.rungCaption}>{CAT_CAPTION[rung]}</span>
          </div>
        );
      })}
    </div>
  );
}

interface StepperFieldProps {
  label: 'Systolic' | 'Diastolic';
  value: number;
  min: number;
  max: number;
  category: Category;
  onChange: (value: number) => void;
}

function StepperField({label, value, min, max, category, onChange}: StepperFieldProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowUp') next = value + 2;
    else if (event.key === 'ArrowDown') next = value - 2;
    else if (event.key === 'PageUp') next = value + 10;
    else if (event.key === 'PageDown') next = value - 10;
    if (next == null) return;
    event.preventDefault();
    onChange(clamp(next));
  };
  return (
    <div style={styles.fieldBlock}>
      <span style={styles.fieldLabel}>{label} (mmHg)</span>
      <div style={styles.stepperLine}>
        <div style={styles.stepperTrack}>
          <button
            type="button"
            className="bpt-btn bpt-focusable"
            style={{...styles.stepperHalf, ...(value <= min ? {opacity: 0.35} : null)}}
            aria-label={`Decrease ${label.toLowerCase()}`}
            disabled={value <= min}
            onClick={() => onChange(clamp(value - 2))}>
            <Icon icon={MinusIcon} size="xsm" color="inherit" />
          </button>
          <div style={styles.stepperRule} />
          <button
            type="button"
            className="bpt-btn bpt-focusable"
            style={{...styles.stepperHalf, ...(value >= max ? {opacity: 0.35} : null)}}
            aria-label={`Increase ${label.toLowerCase()}`}
            disabled={value >= max}
            onClick={() => onChange(clamp(value + 2))}>
            <Icon icon={PlusIcon} size="xsm" color="inherit" />
          </button>
        </div>
        <span
          className="bpt-focusable"
          style={styles.stepperValue}
          tabIndex={0}
          role="spinbutton"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${label.toLowerCase()} — ${CAT_LABEL[category]}`}
          aria-label={label}
          onKeyDown={handleKeyDown}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DATE PANEL — inline expansion below the 44px date/time utility row (no
// native pickers, no drum rolls). June/July 2026 grids (Jun 1 2026 is a
// Monday, Jul 1 a Wednesday — fixed facts, no Date.now()); time via two
// spinbutton steppers + AM/PM chips.
// ---------------------------------------------------------------------------

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_2026: Array<{monthIndex: number; name: string; days: number; firstWeekday: number}> = [
  {monthIndex: 5, name: 'June 2026', days: 30, firstWeekday: 1},
  {monthIndex: 6, name: 'July 2026', days: 31, firstWeekday: 3},
];

interface DatePanelProps {
  draft: Draft;
  onPatch: (patch: Partial<Draft>) => void;
}

function DatePanel({draft, onPatch}: DatePanelProps) {
  const [monthPos, setMonthPos] = useState(draft.dateISO.slice(5, 7) === '06' ? 0 : 1);
  const month = MONTHS_2026[monthPos];
  const selectedDay =
    Number(draft.dateISO.slice(5, 7)) - 1 === month.monthIndex ? Number(draft.dateISO.slice(8, 10)) : null;

  const isoFor = (day: number) =>
    `2026-${String(month.monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const active = document.activeElement as HTMLElement | null;
    const dayAttr = active?.getAttribute('data-day');
    if (dayAttr == null) return;
    const day = Number(dayAttr);
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = day + 1;
    else if (event.key === 'ArrowLeft') next = day - 1;
    else if (event.key === 'ArrowDown') next = day + 7;
    else if (event.key === 'ArrowUp') next = day - 7;
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = month.days;
    if (next == null || next < 1 || next > month.days) return;
    event.preventDefault();
    const target = event.currentTarget.querySelector<HTMLButtonElement>(`[data-day="${next}"]`);
    target?.focus({preventScroll: true});
  };

  const stepTime = (field: 'hour' | 'minute', dir: 1 | -1) => {
    if (field === 'hour') {
      const next = draft.hour + dir;
      onPatch({hour: next < 1 ? 12 : next > 12 ? 1 : next});
    } else {
      const next = draft.minute + dir * 5;
      onPatch({minute: next < 0 ? 55 : next > 55 ? 0 : next});
    }
  };

  return (
    <div style={styles.datePanel}>
      <div style={styles.monthHeader}>
        <button
          type="button"
          className="bpt-btn bpt-focusable"
          style={{...styles.iconBtn, ...(monthPos === 0 ? {opacity: 0.35} : null)}}
          aria-label="Previous month"
          disabled={monthPos === 0}
          onClick={() => setMonthPos(0)}>
          <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
        </button>
        <span style={styles.monthTitle}>{month.name}</span>
        <button
          type="button"
          className="bpt-btn bpt-focusable"
          style={{...styles.iconBtn, ...(monthPos === 1 ? {opacity: 0.35} : null)}}
          aria-label="Next month"
          disabled={monthPos === 1}
          onClick={() => setMonthPos(1)}>
          <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
        </button>
      </div>
      <div style={styles.weekHead} aria-hidden>
        {WEEKDAYS.map((day, i) => (
          <span key={`${day}-${i}`}>{day}</span>
        ))}
      </div>
      <div style={styles.dayGrid} role="grid" aria-label={month.name} onKeyDown={handleGridKeyDown}>
        {Array.from({length: month.firstWeekday}, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({length: month.days}, (_, i) => {
          const day = i + 1;
          const iso = isoFor(day);
          const isSelected = selectedDay === day;
          const isToday = iso === '2026-07-04';
          return (
            <button
              key={day}
              type="button"
              className="bpt-btn bpt-focusable"
              data-day={day}
              style={{
                ...styles.dayCell,
                ...(isToday && !isSelected ? styles.dayCellToday : null),
                ...(isSelected ? styles.dayCellSelected : null),
              }}
              aria-label={`${month.name.split(' ')[0]} ${day}`}
              aria-pressed={isSelected}
              onClick={() => onPatch({dateISO: iso})}>
              {day}
            </button>
          );
        })}
      </div>
      <div style={styles.timeRow}>
        <span style={styles.fieldLabel}>Time</span>
        <div style={styles.stepperTrack}>
          <button
            type="button"
            className="bpt-btn bpt-focusable"
            style={styles.stepperHalf}
            aria-label="Decrease hour"
            onClick={() => stepTime('hour', -1)}>
            <Icon icon={MinusIcon} size="xsm" color="inherit" />
          </button>
          <div style={styles.stepperRule} />
          <button
            type="button"
            className="bpt-btn bpt-focusable"
            style={styles.stepperHalf}
            aria-label="Increase hour"
            onClick={() => stepTime('hour', 1)}>
            <Icon icon={PlusIcon} size="xsm" color="inherit" />
          </button>
        </div>
        <div style={styles.stepperTrack}>
          <button
            type="button"
            className="bpt-btn bpt-focusable"
            style={styles.stepperHalf}
            aria-label="Decrease minutes"
            onClick={() => stepTime('minute', -1)}>
            <Icon icon={MinusIcon} size="xsm" color="inherit" />
          </button>
          <div style={styles.stepperRule} />
          <button
            type="button"
            className="bpt-btn bpt-focusable"
            style={styles.stepperHalf}
            aria-label="Increase minutes"
            onClick={() => stepTime('minute', 1)}>
            <Icon icon={PlusIcon} size="xsm" color="inherit" />
          </button>
        </div>
        <span style={{...styles.stepperValue, fontSize: 17}} aria-live="off">
          {draft.hour}:{String(draft.minute).padStart(2, '0')}
        </span>
        <div style={{display: 'flex', gap: 8}} role="radiogroup" aria-label="AM or PM">
          {(['AM', 'PM'] as const).map(m => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={draft.meridiem === m}
              className="bpt-btn bpt-focusable"
              style={{
                ...styles.pickChip,
                height: 36,
                ...(draft.meridiem === m ? styles.pickChipOn : null),
              }}
              onClick={() => onPatch({meridiem: m})}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DERIVED STATS — every figure recomputes from `readings` (stress fixture
// 3: deleting r13 flips the post-med chip to '−9.5 avg' because nothing is
// baked; Undo restores '−9 avg' exactly).
// ---------------------------------------------------------------------------

interface Derived {
  latest: Reading | null;
  latestCategory: Category | null;
  filtered: Reading[];
  filteredNewest: Reading[];
  tagDelta: Record<TagId, string>;
  avgAll: string;
  preN: number;
  postN: number;
  preAvg: string;
  postAvg: string;
  medDeltaSys: number;
  medDeltaDia: number;
  catCounts: Record<Category, number>;
}

function deriveStats(readings: Reading[], filters: TagId[]): Derived {
  const latest = readings.length > 0 ? readings[readings.length - 1] : null;
  const filtered = readings.filter(r => matchesFilters(r, filters));
  const tagDelta = {} as Record<TagId, string>;
  for (const tag of TAG_ORDER) {
    const sub = readings.filter(r => readingHasTag(r, tag));
    const comp = readings.filter(r => !readingHasTag(r, tag));
    tagDelta[tag] =
      sub.length === 0 || comp.length === 0
        ? '—'
        : `${fmtDelta(mean(sub.map(r => r.sys)) - mean(comp.map(r => r.sys)))} avg`;
  }
  const pre = readings.filter(r => r.med === 'pre');
  const post = readings.filter(r => r.med === 'post');
  const catCounts: Record<Category, number> = {normal: 0, elevated: 0, stage1: 0, stage2: 0};
  for (const r of readings) catCounts[categoryOf(r.sys, r.dia)]++;
  return {
    latest,
    latestCategory: latest == null ? null : categoryOf(latest.sys, latest.dia),
    filtered,
    filteredNewest: [...filtered].reverse(),
    tagDelta,
    avgAll:
      readings.length === 0
        ? '—'
        : `${fmt1(mean(readings.map(r => r.sys)))} / ${fmt1(mean(readings.map(r => r.dia)))}`,
    preN: pre.length,
    postN: post.length,
    preAvg: pre.length === 0 ? '—' : `${fmt1(mean(pre.map(r => r.sys)))} / ${fmt1(mean(pre.map(r => r.dia)))}`,
    postAvg: post.length === 0 ? '—' : `${fmt1(mean(post.map(r => r.sys)))} / ${fmt1(mean(post.map(r => r.dia)))}`,
    medDeltaSys: pre.length > 0 && post.length > 0 ? mean(post.map(r => r.sys)) - mean(pre.map(r => r.sys)) : 0,
    medDeltaDia: pre.length > 0 && post.length > 0 ? mean(post.map(r => r.dia)) - mean(pre.map(r => r.dia)) : 0,
    catCounts,
  };
}

// ---------------------------------------------------------------------------
// LOG ROW — 60px two-line, swipe-to-reveal Delete (−72px snap) with the
// MANDATORY visible 44×44 ellipsis fallback. The row button's accessible
// name is the fraction + date ('128 over 78, Jul 4'), not chip soup; the
// ContextTagRow chips are non-interactive labels.
// ---------------------------------------------------------------------------

interface LogRowProps {
  reading: Reading;
  logPos: number;
  isOpen: boolean;
  chipNarrow: boolean;
  onSwipe: (id: string | null) => void;
  onActions: (id: string) => void;
  onDelete: (id: string) => void;
}

function LogRow({reading, logPos, isOpen, chipNarrow, onSwipe, onActions, onDelete}: LogRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startRef = useRef<{x: number; y: number; horizontal: boolean | null}>({x: 0, y: 0, horizontal: null});
  const category = categoryOf(reading.sys, reading.dia);

  const restX = isOpen ? -72 : 0;
  const offset = dragX ?? restX;

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startRef.current = {x: event.clientX, y: event.clientY, horizontal: null};
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (start.horizontal == null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      start.horizontal = Math.abs(dx) > Math.abs(dy);
      if (start.horizontal) event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!start.horizontal) return;
    setDragX(Math.max(-72, Math.min(0, restX + dx)));
  };
  const handlePointerUp = () => {
    if (startRef.current.horizontal && dragX != null) {
      onSwipe(dragX < -36 ? reading.id : null);
    }
    startRef.current.horizontal = null;
    setDragX(null);
  };

  // ContextTagRow — up to 3 chips; at <352px container the third chip
  // truncates to a '+1' overflow chip (responsive contract).
  const tags = [reading.arm, reading.posture, `${reading.med}-med`];
  const shownTags = chipNarrow ? [...tags.slice(0, 2), '+1'] : tags;

  return (
    <div style={styles.logRowOuter}>
      <div style={styles.deleteBlock}>
        <button
          type="button"
          className="bpt-btn bpt-focusable"
          style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'inherit'}}
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={() => onDelete(reading.id)}>
          <Icon icon={Trash2Icon} size="sm" color="inherit" />
          Delete
        </button>
      </div>
      <div
        className={dragX == null ? 'bpt-swipe' : undefined}
        style={{...styles.logRowContent, transform: `translateX(${offset}px)`}}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
        <button
          type="button"
          className="bpt-btn bpt-focusable"
          style={styles.logRowBtn}
          data-log-pos={logPos}
          aria-label={`${reading.sys} over ${reading.dia}, ${reading.dateLabel}`}
          onClick={() => (isOpen ? onSwipe(null) : onActions(reading.id))}>
          <span style={styles.logLine1}>
            <span style={styles.logFraction}>
              {reading.sys} / {reading.dia}
            </span>
            <span style={{...styles.catDot, background: CAT_STRONG[category]}} aria-hidden />
            <span style={styles.logMeta}>
              {reading.dateLabel} · {reading.time}
            </span>
          </span>
          <span style={styles.tagRow} aria-hidden>
            {shownTags.map(tag => (
              <span key={tag} style={styles.tagChip}>
                {tag}
              </span>
            ))}
          </span>
        </button>
        <button
          type="button"
          className="bpt-btn bpt-focusable"
          style={styles.ellipsisBtn}
          aria-label={`Actions for ${reading.sys} over ${reading.dia}, ${reading.dateLabel}`}
          onClick={() => onActions(reading.id)}>
          <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// Skeleton rows — SAME 60px geometry as the rows they impersonate; widths
// are a FIXED cycle (primary 60/45/70/60, secondary 40/55/30/40), never
// random; pulse removed under reduced motion (static muted blocks remain).
const SKEL_WIDTHS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
  ['60%', '40%'],
];

function SkeletonRows() {
  return (
    <>
      {SKEL_WIDTHS.map(([primary, secondary], index) => (
        <div key={primary + secondary + index}>
          {index > 0 ? <div style={styles.rowDivider} /> : null}
          <div style={styles.skelRow} aria-hidden>
            <div className="bpt-skel" style={{...styles.skelBar, width: primary}} />
            <div className="bpt-skel" style={{...styles.skelBar, width: secondary}} />
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// ROOT — Systa. One readingsStore (useReducer); per-tab scroll persistence
// against the demo scroller; overlays lock the shell and restore scroll +
// focus on every close path.
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof ActivityIcon}> = [
  {id: 'trends', label: 'Trends', icon: ActivityIcon},
  {id: 'log', label: 'Log', icon: ListIcon},
  {id: 'report', label: 'Report', icon: FileTextIcon},
  {id: 'profile', label: 'Profile', icon: UserIcon},
];

export default function MobileBpTrendLogTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});
  const lockScrollRef = useRef(0);
  const prevShownRef = useRef(12);

  const width = useElementWidth(wrapRef);
  // First-frame fallback only — the desktop stage is ~1045px inside a
  // 1440px window, so container width is the real signal.
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = width > 0 ? width >= 720 : viewportWide;
  const chipNarrow = width > 0 && width < 352;
  const railNarrow = width > 0 && width < 360;

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const derived = useMemo(() => deriveStats(state.readings, state.activeFilters), [state.readings, state.activeFilters]);

  const overlayOpen = state.sheet != null || state.actionSheetId != null || state.alertOpen;

  // Scroll-lock bookkeeping: save the demo scroller's position when the
  // shell locks to 100dvh, restore it on unlock.
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller == null) return;
    if (overlayOpen) {
      lockScrollRef.current = scroller.scrollTop;
    } else {
      scroller.scrollTop = lockScrollRef.current;
    }
  }, [overlayOpen]);

  // Per-tab scroll restore (positions are recorded in handleTabPress).
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[state.activeTab] ?? 0;
    }
  }, [state.activeTab]);

  // Focus into overlays with preventScroll (amendment: plain .focus()
  // scroll-reveals the animating sheet inside the locked column); restore
  // to the opener on every close path.
  useEffect(() => {
    if (state.sheet != null) {
      sheetRef.current?.querySelector<HTMLElement>('button')?.focus({preventScroll: true});
    }
  }, [state.sheet]);
  useEffect(() => {
    if (state.actionSheetId != null) {
      // Safe default: first focus lands on Cancel, never the destructive row.
      actionSheetRef.current
        ?.querySelector<HTMLElement>('[data-cancel-row]')
        ?.focus({preventScroll: true});
    }
  }, [state.actionSheetId]);
  useEffect(() => {
    if (state.alertOpen) {
      alertRef.current?.querySelector<HTMLElement>('[data-cancel-row]')?.focus({preventScroll: true});
    }
  }, [state.alertOpen]);
  useEffect(() => {
    if (!overlayOpen && openerRef.current != null) {
      openerRef.current.focus({preventScroll: true});
      openerRef.current = null;
    }
  }, [overlayOpen]);

  // Load-more focus: land on the first appended row (stress fixture 5).
  useEffect(() => {
    if (state.logShownCount > prevShownRef.current) {
      shellRef.current
        ?.querySelector<HTMLElement>(`[data-log-pos="${prevShownRef.current}"]`)
        ?.focus({preventScroll: true});
    }
    prevShownRef.current = state.logShownCount;
  }, [state.logShownCount]);

  const rememberOpener = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
  };

  const handleTabPress = (tab: TabId) => {
    const scroller = getScroller(shellRef.current);
    if (tab === state.activeTab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      scroller?.scrollTo({top: 0});
      return;
    }
    if (scroller != null) scrollByTabRef.current[state.activeTab] = scroller.scrollTop;
    dispatch({type: 'setTab', tab});
  };

  const handleTabBarKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const index = TABS.findIndex(tab => tab.id === state.activeTab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    event.preventDefault();
    handleTabPress(next.id);
  };

  const openNewSheet = () => {
    rememberOpener();
    dispatch({type: 'openSheet', mode: 'new'});
  };

  const draftCategory = categoryOf(state.draft.sys, state.draft.dia);
  const actionReading =
    state.actionSheetId == null ? null : state.readings.find(r => r.id === state.actionSheetId) ?? null;

  // Log list grouped by month, newest first, paginated.
  const shownRows = derived.filteredNewest.slice(0, state.logShownCount);
  const remaining = derived.filteredNewest.length - shownRows.length;
  const monthSections: Array<{key: 'JULY' | 'JUNE'; rows: Array<{reading: Reading; pos: number}>}> = [];
  shownRows.forEach((reading, pos) => {
    const last = monthSections[monthSections.length - 1];
    if (last == null || last.key !== reading.monthKey) {
      monthSections.push({key: reading.monthKey, rows: [{reading, pos}]});
    } else {
      last.rows.push({reading, pos});
    }
  });

  const filterEcho = state.activeFilters.map(tag => TAG_LABEL[tag]).join(' + ');

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktop ? styles.shellDesktop : null),
    ...(overlayOpen ? styles.shellLocked : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SYSTA_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — brand mark · latest fraction + category chip (one 44px
            hit that jumps to Trends) · RefreshCw. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSlot} aria-hidden>
              <span style={styles.brandMark}>
                <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
                  {/* Systa mark — a pulse line crossing a drop. */}
                  <path
                    d="M1.5 9.5h3.2l1.6-4 2.4 8 1.9-5.5 1 1.5h4.9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>
          {derived.latest != null && derived.latestCategory != null ? (
            <button
              type="button"
              className="bpt-btn bpt-focusable"
              style={styles.navCenterBtn}
              aria-label={`Latest reading ${derived.latest.sys} over ${derived.latest.dia}, ${CAT_LABEL[derived.latestCategory]} — view trends`}
              onClick={() => handleTabPress('trends')}>
              <span style={styles.navFraction}>
                {derived.latest.sys}/{derived.latest.dia}
              </span>
              <span
                style={{
                  ...styles.catChip,
                  background: CAT_TINT[derived.latestCategory],
                  color: CAT_STRONG[derived.latestCategory],
                }}>
                {CAT_LABEL[derived.latestCategory]}
              </span>
            </button>
          ) : (
            <span style={styles.navFraction}>Systa</span>
          )}
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="bpt-btn bpt-focusable"
              style={styles.iconBtn}
              aria-label="Refresh readings"
              onClick={() => dispatch({type: 'refresh'})}>
              <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
            </button>
          </div>
        </header>

        {/* RECHECK BANNER — in-flow under the navBar after a Stage 2 save;
            static string, no live countdown. Dismissal is LOGGED. */}
        {state.banner != null ? (
          <div style={styles.banner} role="status">
            <span style={styles.bannerIcon}>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
            </span>
            <span style={styles.bannerText}>Stage 2 reading — recheck in 5 min</span>
            <button
              type="button"
              className="bpt-btn bpt-focusable"
              style={styles.bannerDismiss}
              onClick={() => dispatch({type: 'dismissBanner'})}>
              Dismiss
            </button>
          </div>
        ) : null}

        <main style={styles.main}>
          {/* ------------------------------ TRENDS ----------------------- */}
          {state.activeTab === 'trends' ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Trends</h1>
              </div>
              <div style={styles.chartSticky}>
                <DualBandRiverChart readings={derived.filtered} lastAddedId={state.lastAddedId} />
              </div>
              <FilterRail state={state} derived={derived} dispatch={dispatch} />
              {state.readings.length === 0 ? (
                <EmptyReadings onAdd={openNewSheet} />
              ) : (
                <>
                  <h2 style={styles.sectionHeader}>30-Day Summary</h2>
                  <div style={styles.listCard}>
                    <div style={styles.utilityRow}>
                      <span style={styles.rowLabel}>30-day average</span>
                      <span style={styles.rowValue}>{derived.avgAll}</span>
                    </div>
                    <div style={styles.rowDivider} />
                    <div style={styles.utilityRow}>
                      <span style={styles.rowLabel}>Readings</span>
                      <span style={styles.rowValue}>{state.readings.length}</span>
                    </div>
                    <div style={styles.rowDivider} />
                    <div style={styles.utilityRow}>
                      <span style={styles.rowLabel}>Med started</span>
                      <span style={styles.rowValue}>{MED_START_LABEL}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}

          {/* ------------------------------- LOG -------------------------- */}
          {state.activeTab === 'log' ? (
            <>
              <h1 className="bpt-vh">Log</h1>
              <div style={{...styles.chartSticky, paddingTop: 12}}>
                <DualBandRiverChart readings={derived.filtered} lastAddedId={state.lastAddedId} />
              </div>
              <FilterRail state={state} derived={derived} dispatch={dispatch} />
              {state.refreshState === 'updated' ? (
                <div style={styles.updatedCaption}>Updated just now</div>
              ) : null}
              {state.refreshState === 'loading' ? (
                <>
                  <h2 style={styles.sectionHeader}>Readings</h2>
                  <div style={styles.listCard} aria-busy>
                    <SkeletonRows />
                  </div>
                </>
              ) : state.readings.length === 0 ? (
                <EmptyReadings onAdd={openNewSheet} />
              ) : derived.filtered.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={SearchXIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>No readings match {filterEcho}</h2>
                  <p style={styles.emptyBody}>Remove a filter to see more readings.</p>
                  <button
                    type="button"
                    className="bpt-btn bpt-focusable"
                    style={styles.emptySecondaryBtn}
                    onClick={() => dispatch({type: 'clearFilters'})}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  {monthSections.map((section, sectionIndex) => (
                    <div key={section.key}>
                      <h2 style={styles.sectionHeader}>{section.key}</h2>
                      <div style={styles.listCard}>
                        {section.rows.map(({reading, pos}, rowIndex) => (
                          <div key={reading.id}>
                            {rowIndex > 0 ? <div style={styles.rowDivider} /> : null}
                            <LogRow
                              reading={reading}
                              logPos={pos}
                              isOpen={state.openSwipeId === reading.id}
                              chipNarrow={chipNarrow}
                              onSwipe={id => dispatch({type: 'setSwipe', id})}
                              onActions={id => {
                                rememberOpener();
                                dispatch({type: 'openActionSheet', id});
                              }}
                              onDelete={id => dispatch({type: 'deleteReading', id})}
                            />
                          </div>
                        ))}
                        {sectionIndex === monthSections.length - 1 && remaining > 0 ? (
                          <>
                            <div style={styles.rowDivider} />
                            <button
                              type="button"
                              className="bpt-btn bpt-focusable"
                              style={styles.loadMoreRow}
                              onClick={() => dispatch({type: 'showMore'})}>
                              Show {Math.min(12, remaining)} more
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {remaining <= 0 ? (
                    <div style={styles.terminalCaption}>
                      All {derived.filteredNewest.length} readings
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : null}

          {/* ------------------------------ REPORT ------------------------ */}
          {state.activeTab === 'report' ? (
            <>
              <h1 className="bpt-vh">Report</h1>
              {state.readings.length === 0 ? (
                <EmptyReadings onAdd={openNewSheet} />
              ) : (
                <>
                  <h2 style={styles.sectionHeader}>Medication Effect</h2>
                  <div style={styles.statGrid}>
                    <div style={styles.statTile}>
                      <span style={styles.statTileValue}>{derived.preAvg}</span>
                      <span style={styles.statTileCaption}>Pre-med avg · n={derived.preN}</span>
                    </div>
                    <div style={styles.statTile}>
                      <span style={styles.statTileValue}>{derived.postAvg}</span>
                      <span style={styles.statTileCaption}>Post-med avg · n={derived.postN}</span>
                    </div>
                  </div>
                  <div style={{...styles.listCard, marginTop: 12}}>
                    <div style={styles.deltaRow}>
                      <span
                        style={{
                          ...styles.deltaValue,
                          color: derived.medDeltaSys <= 0 ? CAT_STRONG.normal : CAT_STRONG.stage2,
                        }}>
                        {fmtDelta(derived.medDeltaSys)} / {fmtDelta(derived.medDeltaDia)}
                      </span>
                      <span style={styles.deltaCaption}>
                        mmHg since {MED} · {MED_START_LABEL}
                      </span>
                    </div>
                  </div>

                  <h2 style={styles.sectionHeader}>Category Breakdown</h2>
                  <div style={styles.listCard}>
                    <div style={styles.distBarWrap}>
                      <div style={styles.distBar} aria-hidden>
                        {(['stage2', 'stage1', 'elevated', 'normal'] as Category[]).map(cat =>
                          derived.catCounts[cat] > 0 ? (
                            <span
                              key={cat}
                              style={{
                                width: `${(derived.catCounts[cat] / state.readings.length) * 100}%`,
                                background: CAT_STRONG[cat],
                              }}
                            />
                          ) : null,
                        )}
                      </div>
                    </div>
                    {(['stage2', 'stage1', 'elevated', 'normal'] as Category[]).map((cat, index) => (
                      <div key={cat}>
                        {index > 0 ? <div style={styles.rowDivider} /> : null}
                        <div style={styles.distLegendRow}>
                          <span style={{...styles.catDot, background: CAT_STRONG[cat]}} aria-hidden />
                          <span style={styles.distLegendLabel}>{CAT_LABEL[cat]}</span>
                          <span style={styles.distLegendCount}>
                            {derived.catCounts[cat]} of {state.readings.length}
                          </span>
                          <span style={styles.distLegendPct}>
                            {fmt1((derived.catCounts[cat] / state.readings.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h2 style={styles.sectionHeader}>Share</h2>
                  <div style={styles.listCard}>
                    <button
                      type="button"
                      className="bpt-btn bpt-focusable"
                      style={styles.utilityRow}
                      onClick={() => dispatch({type: 'announce', msg: 'Report PDF exported'})}>
                      <span style={styles.rowLabel}>Export PDF</span>
                      <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                    </button>
                    <div style={styles.rowDivider} />
                    <button
                      type="button"
                      className="bpt-btn bpt-focusable"
                      style={styles.utilityRow}
                      onClick={() => dispatch({type: 'announce', msg: `Report shared with ${DOCTOR}`})}>
                      <span style={styles.rowLabel}>Share with doctor</span>
                      <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                    </button>
                  </div>

                  {state.events.length > 0 ? (
                    <>
                      <h2 style={styles.sectionHeader}>Activity</h2>
                      <div style={styles.listCard}>
                        {state.events.map((event, index) => (
                          <div key={event.id}>
                            {index > 0 ? <div style={styles.rowDivider} /> : null}
                            <div style={styles.auditRow}>
                              <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                              Recheck dismissed · {event.dateLabel}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </>
              )}
            </>
          ) : null}

          {/* ----------------------------- PROFILE ------------------------ */}
          {state.activeTab === 'profile' ? (
            <>
              <h1 className="bpt-vh">Profile</h1>
              <div style={{...styles.listCard, marginTop: 20}}>
                <div style={styles.profileRow}>
                  <span style={styles.avatarCircle} aria-hidden>
                    DO
                  </span>
                  <span style={styles.profileText}>
                    <span style={styles.profilePrimary}>{USER}</span>
                    <span style={styles.profileSecondary}>Tracking since June 2026</span>
                  </span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Settings</h2>
              <div style={styles.listCard}>
                {/* The ENTIRE 44px row is the switch (role=switch). */}
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={styles.utilityRow}
                  role="switch"
                  aria-checked={state.remindersOn}
                  onClick={() => dispatch({type: 'toggleReminders'})}>
                  <span style={styles.rowLabel}>Reminders</span>
                  <span
                    style={{
                      ...styles.switchTrack,
                      background: state.remindersOn ? BRAND_FILL : SWITCH_OFF,
                      border: state.remindersOn ? 'none' : `1px solid ${EDGE_STRONG}`,
                    }}
                    aria-hidden>
                    <span
                      className="bpt-anim"
                      style={{
                        ...styles.switchThumb,
                        transform: state.remindersOn ? 'translateX(20px)' : 'none',
                      }}
                    />
                  </span>
                </button>
                <div style={styles.rowDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.rowLabel}>Units</span>
                  <span style={styles.rowValue}>mmHg</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.rowLabel}>Medication</span>
                  {/* Long-identity stress: 'Lisinopril 10mg' ellipsizes,
                      never wraps the 44px row. */}
                  <span style={{...styles.rowValue, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {MED}
                  </span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.rowLabel}>Med schedule</span>
                  <span style={styles.rowValue}>Daily · 8:00 AM</span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Data</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={styles.utilityRow}
                  onClick={() => {
                    rememberOpener();
                    dispatch({type: 'openAlert'});
                  }}>
                  <span style={styles.dangerRowText}>Delete all readings</span>
                </button>
              </div>
            </>
          ) : null}
        </main>

        {/* FAB — sticky-in-flow, 16px above the tabBar. */}
        <div style={styles.fabAnchor}>
          <button
            ref={fabRef}
            type="button"
            className="bpt-btn bpt-focusable"
            style={styles.fab}
            aria-label="New reading"
            onClick={openNewSheet}>
            <Icon icon={PlusIcon} size="md" color="inherit" />
          </button>
        </div>

        {/* TOAST DOCK — the ONE polite live region; no auto-dismiss timers;
            a new mutation replaces the toast; Undo restores exact state. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="bpt-btn bpt-focusable"
                    style={styles.toastUndo}
                    onClick={() => dispatch({type: 'undo'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 4 tabs, arrow keys move the active tab. */}
        <nav style={styles.tabBar} aria-label="Sections" onKeyDown={handleTabBarKeyDown}>
          {TABS.map(tab => {
            const active = tab.id === state.activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                className="bpt-btn bpt-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-current={active ? 'page' : undefined}
                onClick={() => handleTabPress(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ------------------------- NEW READING SHEET -------------------- */}
        {state.sheet != null ? (
          <>
            <div style={styles.sheetScrim} onClick={() => dispatch({type: 'closeSheet'})} />
            <div
              ref={sheetRef}
              className="bpt-sheet-in"
              role="dialog"
              aria-modal
              aria-label={state.sheet.mode === 'edit' ? 'Edit Reading' : 'New Reading'}
              style={{
                ...styles.sheet,
                height: state.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  // Topmost-overlay law: the inline datePanel collapses
                  // first; a second Escape closes the sheet.
                  event.stopPropagation();
                  if (state.datePanelOpen) dispatch({type: 'toggleDatePanel', open: false});
                  else dispatch({type: 'closeSheet'});
                }
                trapTabKey(event, sheetRef.current);
              }}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={{width: 68, height: 24, display: 'grid', placeItems: 'center'}}
                  aria-label="Resize sheet"
                  onClick={() => dispatch({type: 'toggleDetent'})}>
                  <span style={styles.grabberPill} />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>{state.sheet.mode === 'edit' ? 'Edit Reading' : 'New Reading'}</h2>
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={styles.iconBtn}
                  aria-label="Close"
                  onClick={() => dispatch({type: 'closeSheet'})}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <div style={styles.segTrack} role="radiogroup" aria-label="Entry mode">
                  {(['rails', 'steppers'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={state.entryMode === mode}
                      className="bpt-btn bpt-focusable"
                      style={{...styles.segBtn, ...(state.entryMode === mode ? styles.segBtnOn : null)}}
                      onClick={() => dispatch({type: 'setEntryMode', mode})}
                      onKeyDown={event => {
                        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                          event.preventDefault();
                          dispatch({type: 'setEntryMode', mode: mode === 'rails' ? 'steppers' : 'rails'});
                        }
                      }}>
                      {mode === 'rails' ? 'Rails' : 'Steppers'}
                    </button>
                  ))}
                </div>
                {state.entryMode === 'rails' ? (
                  <div style={styles.railsWrap}>
                    <DragRail
                      label="Systolic"
                      value={state.draft.sys}
                      min={90}
                      max={200}
                      width={railNarrow ? 56 : 64}
                      category={draftCategory}
                      onChange={sys => dispatch({type: 'patchDraft', patch: {sys}})}
                    />
                    <CategoryLadder category={draftCategory} />
                    <DragRail
                      label="Diastolic"
                      value={state.draft.dia}
                      min={50}
                      max={120}
                      width={railNarrow ? 56 : 64}
                      category={draftCategory}
                      onChange={dia => dispatch({type: 'patchDraft', patch: {dia}})}
                    />
                  </div>
                ) : (
                  <div>
                    <StepperField
                      label="Systolic"
                      value={state.draft.sys}
                      min={90}
                      max={200}
                      category={draftCategory}
                      onChange={sys => dispatch({type: 'patchDraft', patch: {sys}})}
                    />
                    <StepperField
                      label="Diastolic"
                      value={state.draft.dia}
                      min={50}
                      max={120}
                      category={draftCategory}
                      onChange={dia => dispatch({type: 'patchDraft', patch: {dia}})}
                    />
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                      <CategoryLadder category={draftCategory} />
                    </div>
                  </div>
                )}
                <div style={styles.pickGroup} role="radiogroup" aria-label="Arm">
                  <span style={styles.fieldLabel}>Arm</span>
                  <div style={styles.chipGrid}>
                    {(['Left', 'Right'] as const).map(arm => (
                      <button
                        key={arm}
                        type="button"
                        role="radio"
                        aria-checked={state.draft.arm === arm}
                        className="bpt-btn bpt-focusable"
                        style={{...styles.pickChip, ...(state.draft.arm === arm ? styles.pickChipOn : null)}}
                        onClick={() => dispatch({type: 'patchDraft', patch: {arm}})}>
                        {arm}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.pickGroup} role="radiogroup" aria-label="Posture">
                  <span style={styles.fieldLabel}>Posture</span>
                  <div style={styles.chipGrid}>
                    {(['Seated', 'Standing'] as const).map(posture => (
                      <button
                        key={posture}
                        type="button"
                        role="radio"
                        aria-checked={state.draft.posture === posture}
                        className="bpt-btn bpt-focusable"
                        style={{...styles.pickChip, ...(state.draft.posture === posture ? styles.pickChipOn : null)}}
                        onClick={() => dispatch({type: 'patchDraft', patch: {posture}})}>
                        {posture}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.pickGroup} role="radiogroup" aria-label="Timing">
                  <span style={styles.fieldLabel}>Timing</span>
                  <div style={styles.chipGrid}>
                    {(['pre', 'post'] as const).map(med => (
                      <button
                        key={med}
                        type="button"
                        role="radio"
                        aria-checked={state.draft.med === med}
                        className="bpt-btn bpt-focusable"
                        style={{...styles.pickChip, ...(state.draft.med === med ? styles.pickChipOn : null)}}
                        onClick={() => dispatch({type: 'patchDraft', patch: {med}})}>
                        {med}-med
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.dateCard}>
                  <div style={styles.utilityRow}>
                    <span style={styles.rowLabel}>Date &amp; time</span>
                    <button
                      type="button"
                      className="bpt-btn bpt-focusable"
                      style={styles.datePill}
                      aria-expanded={state.datePanelOpen}
                      onClick={() => dispatch({type: 'toggleDatePanel'})}>
                      {labelOf(state.draft.dateISO)} · {state.draft.hour}:
                      {String(state.draft.minute).padStart(2, '0')} {state.draft.meridiem}
                    </button>
                  </div>
                  {state.datePanelOpen ? (
                    <DatePanel draft={state.draft} onPatch={patch => dispatch({type: 'patchDraft', patch})} />
                  ) : null}
                </div>
              </div>
              <div style={styles.sheetFooter}>
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={styles.saveBtn}
                  onClick={() => dispatch({type: 'save'})}>
                  {state.sheet.mode === 'edit' ? 'Save Changes' : 'Save Reading'}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* ---------------------------- ACTION SHEET ---------------------- */}
        {actionReading != null ? (
          <>
            <div style={styles.sheetScrim} onClick={() => dispatch({type: 'closeActionSheet'})} />
            <div
              ref={actionSheetRef}
              className="bpt-sheet-in"
              style={styles.actionSheetWrap}
              role="dialog"
              aria-modal
              aria-label={`Actions for ${actionReading.sys} over ${actionReading.dia}, ${actionReading.dateLabel}`}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  dispatch({type: 'closeActionSheet'});
                }
                trapTabKey(event, actionSheetRef.current);
              }}>
              <div style={styles.asCard}>
                <div style={styles.asHeader}>
                  {actionReading.sys}/{actionReading.dia} · {actionReading.dateLabel} · {actionReading.time}
                </div>
                <div style={styles.asDividerFull} />
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={styles.asRow}
                  onClick={() => dispatch({type: 'openSheet', mode: 'edit', id: actionReading.id})}>
                  Edit tags
                </button>
                <div style={styles.asDividerFull} />
                {/* Destructive LAST; executes immediately (undo over
                    confirm), the toast offers Undo. */}
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={{...styles.asRow, ...styles.asRowDestructive}}
                  onClick={() => dispatch({type: 'deleteReading', id: actionReading.id})}>
                  Delete
                </button>
              </div>
              <div style={styles.asCard}>
                <button
                  type="button"
                  data-cancel-row
                  className="bpt-btn bpt-focusable"
                  style={styles.asCancel}
                  onClick={() => dispatch({type: 'closeActionSheet'})}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* ------------------------------- ALERT --------------------------
            The RARE centered alert — blocking irreversible choice only
            (delete ALL readings, bypassing undo). Scrim click does NOT
            dismiss; Escape cancels; verbs, never 'OK'. */}
        {state.alertOpen ? (
          <>
            <div style={styles.alertScrim} />
            <div
              ref={alertRef}
              style={styles.alert}
              role="alertdialog"
              aria-modal
              aria-labelledby="bpt-alert-title"
              aria-describedby="bpt-alert-body"
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  dispatch({type: 'closeAlert'});
                }
                trapTabKey(event, alertRef.current);
              }}>
              <div style={styles.alertBody}>
                <h2 id="bpt-alert-title" style={styles.alertTitle}>
                  Delete all readings?
                </h2>
                <p id="bpt-alert-body" style={styles.alertText}>
                  This removes all {state.readings.length} readings. This can&apos;t be undone.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  data-cancel-row
                  className="bpt-btn bpt-focusable"
                  style={styles.alertBtn}
                  onClick={() => dispatch({type: 'closeAlert'})}>
                  Cancel
                </button>
                <div style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="bpt-btn bpt-focusable"
                  style={{...styles.alertBtn, ...styles.alertBtnDestructive}}
                  onClick={() => dispatch({type: 'deleteAll'})}>
                  Delete
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHARED SUBTREES — filter rail + true-empty state (used by three tabs).
// ---------------------------------------------------------------------------

interface FilterRailProps {
  state: StoreState;
  derived: Derived;
  dispatch: (action: Action) => void;
}

// Interactive stat chips: 32px visual inside the 44px rail row, label
// 13/500 + LIVE subgroup-vs-complement delta 11/600 tabular; aria-pressed;
// active fill = brand wash + 1px BRAND_ACCENT border (≥3:1 boundary).
function FilterRail({state, derived, dispatch}: FilterRailProps) {
  return (
    <div style={styles.chipRail}>
      {TAG_ORDER.map(tag => {
        const active = state.activeFilters.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className="bpt-btn bpt-focusable"
            style={{...styles.filterChip, ...(active ? styles.filterChipOn : null)}}
            aria-pressed={active}
            aria-label={`Filter ${TAG_LABEL[tag]}, ${derived.tagDelta[tag]}`}
            onClick={() => dispatch({type: 'toggleFilter', tag})}>
            <span style={styles.filterChipLabel}>{TAG_LABEL[tag]}</span>
            <span style={styles.filterChipDelta}>{derived.tagDelta[tag]}</span>
          </button>
        );
      })}
    </div>
  );
}

interface EmptyReadingsProps {
  onAdd: () => void;
}

// TRUE-EMPTY (after Delete-all): creating the first reading IS the
// screen's primary verb, so the one action is the 48px primary.
function EmptyReadings({onAdd}: EmptyReadingsProps) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>
        <Icon icon={ActivityIcon} size="lg" color="inherit" />
      </span>
      <h2 style={styles.emptyTitle}>No readings</h2>
      <p style={styles.emptyBody}>Readings you log appear here.</p>
      <button type="button" className="bpt-btn bpt-focusable" style={styles.emptyPrimaryBtn} onClick={onAdd}>
        Add your first reading
      </button>
    </div>
  );
}
