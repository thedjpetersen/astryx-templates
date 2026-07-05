// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Foothold linearized rent-vs-buy
 *   model at its knife-edge base state: price $420,000 · 20% down ·
 *   6.50% rate · $2,650/mo rent · +$80/mo-per-yr growth · 6-yr stay.
 *   Cross-checked base arithmetic (all in comments below): loan 336,000;
 *   upfront 105,000; netOwn/yr 16,380; rentCum(6) 205,200 vs buyCum(6)
 *   203,280 → breakeven yr 6, buying saves $1,920. Four saved scenario
 *   snapshots with hand-verified breakeven deltas (−2 / −1 / +2 / +4 yrs).
 *   No Date.now(), no Math.random(), no network media.
 * @output Foothold — Rent vs Buy Coach: a 390px MOBILE single-surface
 *   instrument. A 52px navBar (back·Tools / stair-roof mark + Foothold /
 *   live verdictPill) over a sticky 321px chartDock — verdict sentence +
 *   22px gap figure, a 200px DPR-scaled crossover <canvas> (rent curve vs
 *   buy line, breakeven ring marker, draggable stay-length scrubber with
 *   44px hit strip + role=slider keys), and a yr−/Stay 6 yrs/yr+ button
 *   row. Beneath scroll: snap-rail scenario chips whose breakeven-delta
 *   labels re-argue with every slider move (tap-to-diff rings + diffBar
 *   with Apply/ellipsis→actionSheet), five 112px sensitivity-tick
 *   assumption sliders (7-notch ghost tick strips run the full breakeven
 *   engine per candidate), static model-notes rows, and a sticky 'Save
 *   scenario' footer opening a two-detent saveSheet. Signature two-beat:
 *   scrub stay 5→6 flips the pill RENT→BUY; rate +1 notch flips it back
 *   while the intersection marker slides to yr 7.
 * @position Page template; emitted by `astryx template mobile-rent-vs-buy-coach`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, saveSheet, actionSheet)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   an overlay is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. The toastDock is sticky-in-flow (bottom 96,
 *   above the 80px footer) per the batch-2 amendment — shell-absolute
 *   pins to the document bottom on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, last row none); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Foothold green — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule).
 *   Sanctioned non-brand literals, each with contrast math at the
 *   declaration: verdict pill fills + fill-text pairs, the worsens-amber
 *   delta pair, the chart rent-line slate pair, and the REST_RAIL pair
 *   for interactive rest fills (batch-2 amendment: ≥3:1 vs their actual
 *   surface, not hairline tokens).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); chartDock sticky top 52
 *   z15, height 320 + 1px hairline = 321 (8 pad + 48 readout + 200 canvas
 *   + 8 gap + 44 scrubber row + 12 pad — the spec's stated 336 total does
 *   not reconcile with its own parts; corrected to the exact sum, noted
 *   as deviation); combined pinned chrome 373px. sensitivitySliderRow
 *   112px = 12 + 24 label line + 8 + 36 control line + 4 + 16 tick strip
 *   + 12; five rows + 4 dividers = 564px card interior. Snapshot chips
 *   44px tall, radius 999, ≥24px next-chip peek, scrollSnapType x
 *   mandatory. Utility rows 44px; breakeven summary row 60px. TYPE
 *   (Figtree via --font-family-body): 22/700 gap figure · 17/600
 *   nav+sheet titles · 16/400–600 body, inputs, row primary (hard floor)
 *   · 13 secondary · 11/500 overlines + tick captions; nothing under
 *   11px; tabular-nums on every updating numeral. Buttons: 48 primary ·
 *   36 secondary · 44×44 icon; every target ≥44px with ≥8px clearance or
 *   merged full-row; every gesture (scrubber drag, thumb drag, sheet
 *   drag, chip rail scroll) has a visible button/keyboard path.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is
 *   backstop only). The crossover canvas measures its container via
 *   ResizeObserver and re-renders at DPR — no fixed canvas width; the
 *   38px axis gutter is constant, the plot flexes (320 stage → ~250px
 *   plot, ~16.6px/yr; snap math derives from measured width). Slider
 *   tracks flex between fixed 44px steppers (320 stage → 154px track,
 *   still ≥5px/notch on the coarsest 51-notch price range). Chip rail
 *   scrolls horizontally at all widths; chips never wrap (name maxWidth
 *   180 ellipsis). verdictPill text is fixed-length ('RENT 15+ YRS'
 *   worst) and fits the balanced 1fr trailing zone at 320.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes
 *   the standard centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  ChevronLeftIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Foothold green). #1E7F4F on #FFFFFF ≈
// 5.1:1 (passes 4.5:1 for the 13px 'Save' text button and delta text);
// #52D399 on the dark card (~#1C1C1E) ≈ 8.2:1.
const BRAND_ACCENT = 'light-dark(#1E7F4F, #52D399)';
// Text over a BRAND_ACCENT fill (verdict pill BUY, primary buttons).
// Light: #FFFFFF on #1E7F4F ≈ 5.1:1. Dark: #0B2A1B on #52D399 ≈ 8.1:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #0B2A1B)';
// 12% brand wash for the active-chip tint and canvas buy-fill fallback.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Verdict pill RENT fill + its fill text. #FFFFFF on #475569 ≈ 7.5:1;
// #101828 on #94A3B8 ≈ 6.6:1 — both clear 4.5:1 for the 11px/700 label.
const RENT_FILL = 'light-dark(#475569, #94A3B8)';
const RENT_FILL_TEXT = 'light-dark(#FFFFFF, #101828)';
// Worsens-amber for '+N yrs' chip deltas and LATER sensitivity ticks.
// #B45309 on the light card #FFFFFF ≈ 5.0:1; #F5B84A on the dark card ≈
// 8.9:1 — both pass 4.5:1 at 13px/600.
const WORSE_AMBER = 'light-dark(#B45309, #F5B84A)';
// Chart rent series. #64748B on the light card ≈ 4.8:1; #94A3B8 on the
// dark card ≈ 6.6:1 — both ≥3:1 for the 2px stroke.
const RENT_LINE = 'light-dark(#64748B, #94A3B8)';
// REST-STATE FILLS (batch-2 amendment): the unfilled slider rail and the
// 'no change' ghost ticks are meaningful interactive rest fills, so they
// get an explicit ≥3:1 pair against their ACTUAL surface (the card):
// #7C8798 on #FFFFFF ≈ 3.6:1; #6F7889 on the dark card (~#1C1C1E) ≈
// 3.7:1. (Spec asked for --color-border rail / 35%-alpha ticks — both
// hairline-class; overridden per the amendment, math here.)
const REST_RAIL = 'light-dark(#7C8798, #6F7889)';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// the 120ms snap pulse, and the reduced-motion guard. Transitions animate
// transform/opacity/background-color only and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const FOOTHOLD_CSS = `
.fhd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fhd-btn:disabled { cursor: default; }
.fhd-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.fhd-pill { transition: background-color 150ms ease, color 150ms ease; }
.fhd-fade { transition: opacity 200ms ease; }
@keyframes fhd-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fhd-sheet-in { animation: fhd-sheet-in 200ms ease; }
@keyframes fhd-pulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.fhd-pulse { animation: fhd-pulse 120ms ease; }
.fhd-vh {
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
  .fhd-pill, .fhd-fade { transition: none; }
  .fhd-sheet-in, .fhd-pulse { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window, so viewport queries
  // alone cannot tell the two stages apart).
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
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44px back button
  // optically aligns to the 16px gutter. Hairline + blur ALWAYS ON (this
  // template does not wire scroll-under; noted per contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  backLabel: {fontSize: 13, fontWeight: 500},
  navCenter: {display: 'flex', alignItems: 'center', gap: 8, maxWidth: 200},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // verdictPill — 28px pill inside a 44px-tall non-interactive status slot.
  verdictPillHit: {height: 44, display: 'flex', alignItems: 'center'},
  verdictPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // CHART DOCK — sticky top 52 z15, opaque body background so scroll
  // content passes beneath; 8 + 48 + 200 + 8 + 44 + 12 = 320 (+1 hairline).
  chartDock: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    background: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
    paddingTop: 8,
    paddingInline: 16,
    paddingBottom: 12,
  },
  readoutRow: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  readoutSentence: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    minWidth: 0,
  },
  gapFigure: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    display: 'inline-block',
  },
  canvasWrap: {position: 'relative', height: 200},
  canvas: {position: 'absolute', inset: 0, width: '100%', height: 200},
  // Invisible 44px-wide scrubber hit strip centered on the stay line;
  // focusable role='slider' with arrow keys — the gesture's keyboard path.
  scrubHit: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    borderRadius: 8,
    touchAction: 'none',
    cursor: 'ew-resize',
  },
  scrubRow: {
    marginTop: 8,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  yrBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  yrBtnDisabled: {opacity: 0.45},
  stayValueBtn: {
    height: 44,
    paddingInline: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  stayInput: {
    height: 28,
    width: 72,
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
    outline: 'none',
  },
  // sectionHeader — 13/600 uppercase 0.06em; 20px top / 8px bottom.
  sectionHeaderRow: {
    margin: '20px 16px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  sectionHeader: {
    margin: 0,
    paddingInlineStart: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  saveTextBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // CHIP RAIL — horizontal snap rail, 8px gaps, 16 scroll padding, ≥24px
  // next-chip peek at 390 by construction (chips ≤ 260px wide).
  chipRail: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBottom: 4,
  },
  chip: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    scrollSnapAlign: 'start',
  },
  chipActive: {
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
  },
  chipName: {
    fontSize: 13,
    fontWeight: 600,
    maxWidth: 180,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipDelta: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  railEmpty: {
    marginInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    padding: '12px 0',
  },
  // diffBar — 44px row under the rail while a chip is active.
  diffBar: {
    marginInline: 16,
    marginTop: 8,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  diffText: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  diffSpacer: {flex: 1},
  applyBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // SENSITIVITY SLIDER ROW — 112px: 12 + 24 label + 8 + 36 control + 4 +
  // 16 tick strip + 12 (grows by a 16px caption line while diffing).
  sliderRow: {
    position: 'relative',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  sliderRowDiff: {boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`},
  labelLine: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: 500,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  diffCaption: {
    height: 16,
    fontSize: 11,
    fontWeight: 500,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Value pill — 28px tap-to-type button inside the 24px label line (its
  // 44px hit comes from the row's 12px paddings + the 8px gap below).
  valuePillBtn: {
    height: 28,
    paddingInline: 10,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  valueInput: {
    height: 28,
    width: 96,
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 16,
    fontFamily: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    paddingInline: 10,
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
    outline: 'none',
  },
  valueInputError: {boxShadow: 'inset 0 0 0 2px var(--color-error)'},
  fieldError: {
    marginTop: 2,
    fontSize: 13,
    color: 'var(--color-error)',
    textAlign: 'end',
  },
  controlLine: {
    marginTop: 8,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // 44×44 stepper halves centered on the 36px line (marginBlock −4 keeps
  // the hit area 44 while the visual line stays 36).
  stepBtn: {
    width: 44,
    height: 44,
    marginBlock: -4,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  stepBtnDisabled: {opacity: 0.45},
  // Track hit strip — 36px tall, the drag surface AND the role='slider'.
  trackStrip: {
    position: 'relative',
    flex: 1,
    height: 36,
    borderRadius: 8,
    touchAction: 'none',
    cursor: 'ew-resize',
    minWidth: 0,
  },
  trackRail: {
    position: 'absolute',
    insetInline: 0,
    top: 16,
    height: 4,
    borderRadius: 999,
    background: REST_RAIL,
  },
  trackFill: {
    position: 'absolute',
    insetInlineStart: 0,
    top: 16,
    height: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  trackThumb: {
    position: 'absolute',
    top: 8,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: '2px solid var(--color-background-card)',
    boxShadow: '0 1px 3px var(--color-shadow)',
  },
  // Tick strip — 16px presentational band aligned to the track extents
  // (marginInline 50 = 44px stepper + 6px gap); caption paints on card bg.
  tickStrip: {
    position: 'relative',
    marginTop: 4,
    height: 16,
    marginInline: 50,
  },
  tick: {
    position: 'absolute',
    top: 4,
    width: 2,
    height: 8,
    borderRadius: 1,
  },
  tickCaption: {
    position: 'absolute',
    insetInlineEnd: 0,
    top: 0,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 6,
    background: 'var(--color-background-card)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // MODEL NOTES — static 44px utility rows (no chevrons, non-interactive).
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  utilLabel: {
    fontSize: 16,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  modelCaption: {
    margin: '16px 16px 24px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // STICKY FOOTER — bottom 0 z20, blur surface, 48px primary button.
  stickyFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST DOCK — sticky-in-flow (amendment), bottom 96 clears the 80px
  // footer; z30; the single polite live region. No auto-dismiss timers.
  toastDock: {
    position: 'sticky',
    bottom: 96,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    maxWidth: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell; two detents.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  formField: {display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  nameInput: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 16,
    fontFamily: 'inherit',
    paddingInline: 16,
    outline: 'none',
  },
  // In-sheet echo card uses the card-on-card muted border but same shape.
  sheetCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  summaryRow: {
    minHeight: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
    paddingBlock: 8,
  },
  summaryPrimary: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  summarySecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  vsRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  vsRowText: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  vsRowName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  vsRowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // ACTION SHEET — scrim z40 + two stacked cards at insetInline 16 /
  // bottom 16, z41; destructive last; separate Cancel card.
  actionSheetWrap: {
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
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionRowDivider: {height: 1, background: 'var(--color-border)'},
  actionRowDestructive: {color: 'var(--color-error)'},
  cancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES + LINEARIZED MODEL — pure integer-lattice arithmetic. All
// values land on exact binary fractions (price is a multiple of $5,000,
// rate a multiple of 25 bp → netOwn is a multiple of $0.125), so the
// breakeven comparisons below are exact, never float-fuzzy.
//
// MODEL (comments are the on-screen Model rows): loan = price×(1−dp);
// upfront = price×(dp+0.05)   [5.0% closing costs];
// netOwnPerYear = loan×rate − price×0.013   [carry 2.2% − appreciation
//   3.5% = −1.3%; principal cancels against equity credit];
// buyCum(y) = upfront + netOwnPerYear×y;
// rentCum(y) = 12×rentMo×y + (12×growthMo/2)×y×(y−1);
// breakeven = first y in 1..15 with buyCum(y) ≤ rentCum(y), else null.
//
// BASE CROSS-CHECK (price 420,000 · dp 20% · rate 6.50% · rent 2,650 ·
// growth 80): loan 336,000; upfront 420,000×0.25 = 105,000; netOwn =
// 21,840 − 5,460 = 16,380; rentCum(y) = 31,800y + 480y(y−1).
// y=5: rent 168,600 vs buy 186,900 → RENT saves 18,300.
// y=6: rent 205,200 vs buy 203,280 → BUY saves 1,920. Breakeven 6. ✓
// Chart endpoints: rentCum(15) = 477,000+100,800 = 577,800; buyCum(15) =
// 105,000+245,700 = 350,700 — both inside the $600k y-domain. ✓
// SENSITIVITY TRUTHS (deliberately knife-edge): rate +0.25% → netOwn
// 17,220, buyCum(6) 208,320 > 205,200 → breakeven 7 ('+0.25% → +1 yr');
// dp +1% → buyCum(6) 205,842 → 7; rent −$50 → rentCum(6) 201,600 → 7;
// growth −$20 → rentCum(6) 201,600 → 7 (−$10 → 203,400, still 6);
// price +$5k → buyCum(6) 205,700 → 7. ✓
// ---------------------------------------------------------------------------

interface LiveParams {
  price: number; // dollars, 300,000–550,000 step 5,000
  dpPct: number; // percent, 5–30 step 1
  rateBp: number; // basis points, 450–850 step 25 (6.50% = 650)
  rentMo: number; // dollars/month, 1,500–3,500 step 50
  growthMo: number; // dollars/month added per year, 0–150 step 10
  stayYears: number; // 1–15
}

type AssumptionId = 'price' | 'dpPct' | 'rateBp' | 'rentMo' | 'growthMo';

const ASSUMPTION_IDS: AssumptionId[] = ['price', 'dpPct', 'rateBp', 'rentMo', 'growthMo'];

const BASE_LIVE: LiveParams = {
  price: 420000,
  dpPct: 20,
  rateBp: 650,
  rentMo: 2650,
  growthMo: 80,
  stayYears: 6,
};

const MAX_YEARS = 15;
const Y_DOMAIN_MAX = 600000; // chart y-axis $0..$600k

/** Cumulative cost of buying at integer year y. Exact arithmetic. */
function buyCum(p: LiveParams, y: number): number {
  const loan = (p.price * (100 - p.dpPct)) / 100;
  const upfront = (p.price * (p.dpPct + 5)) / 100;
  const netOwn = (loan * p.rateBp) / 10000 - (p.price * 13) / 1000;
  return upfront + netOwn * y;
}

/** Cumulative cost of renting at integer year y (arithmetic series). */
function rentCum(p: LiveParams, y: number): number {
  const annualRent0 = p.rentMo * 12;
  const rentStep = p.growthMo * 12;
  return annualRent0 * y + (rentStep / 2) * y * (y - 1);
}

/** First y in 1..15 where buying is no more expensive; null = '15+'. */
function breakeven(p: LiveParams): number | null {
  for (let y = 1; y <= MAX_YEARS; y++) {
    if (buyCum(p, y) <= rentCum(p, y)) return y;
  }
  return null;
}

/** Verdict at the chosen stay length. */
function verdictAt(p: LiveParams): 'buy' | 'rent' {
  return buyCum(p, p.stayYears) <= rentCum(p, p.stayYears) ? 'buy' : 'rent';
}

/** Dollars → '$203,280' (integer, comma-grouped, deterministic). */
function fmtUsd(dollars: number): string {
  const abs = Math.abs(Math.round(dollars));
  const grouped = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${dollars < 0 ? '−' : ''}$${grouped}`;
}

/** Basis points → '6.50%'. */
function fmtRate(bp: number): string {
  return `${(bp / 100).toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// SLIDER DEFINITIONS — five sensitivity rows. `fmtNotch` renders the
// caption's signed single-notch unit ('+0.25%', '−$50').
// ---------------------------------------------------------------------------

interface SliderDef {
  id: AssumptionId;
  label: string;
  min: number;
  max: number;
  step: number;
  fmtValue: (v: number) => string;
  fmtNotch: (steps: number) => string;
  valueText: (v: number) => string; // aria-valuetext with units
  rangeError: string; // blur-validation message
  parse: (raw: string) => number | null; // typed input → raw units
}

function signed(steps: number, unit: string): string {
  return `${steps > 0 ? '+' : '−'}${unit}`;
}

const SLIDER_DEFS: SliderDef[] = [
  {
    id: 'price',
    label: 'Home price',
    min: 300000,
    max: 550000,
    step: 5000,
    fmtValue: v => fmtUsd(v),
    fmtNotch: s => signed(s, `$${Math.abs(s) * 5}k`),
    valueText: v => `${fmtUsd(v)} home price`,
    rangeError: 'Enter 300,000–550,000',
    parse: raw => {
      const n = Number(raw.replace(/[$,\s]/g, ''));
      return Number.isFinite(n) ? Math.round(n) : null;
    },
  },
  {
    id: 'dpPct',
    label: 'Down payment',
    min: 5,
    max: 30,
    step: 1,
    fmtValue: v => `${v}%`,
    fmtNotch: s => signed(s, `${Math.abs(s)}%`),
    valueText: v => `${v} percent down`,
    rangeError: 'Enter 5–30',
    parse: raw => {
      const n = Number(raw.replace(/[%\s]/g, ''));
      return Number.isFinite(n) ? Math.round(n) : null;
    },
  },
  {
    id: 'rateBp',
    label: 'Mortgage rate',
    min: 450,
    max: 850,
    step: 25,
    fmtValue: v => fmtRate(v),
    fmtNotch: s => signed(s, `${(Math.abs(s) * 0.25).toFixed(2).replace(/0$/, '')}%`),
    valueText: v => `${(v / 100).toFixed(2)} percent rate`,
    rangeError: 'Enter 4.5–8.5',
    parse: raw => {
      const n = Number(raw.replace(/[%\s]/g, ''));
      return Number.isFinite(n) ? Math.round(n * 100) : null;
    },
  },
  {
    id: 'rentMo',
    label: 'Monthly rent',
    min: 1500,
    max: 3500,
    step: 50,
    fmtValue: v => fmtUsd(v),
    fmtNotch: s => signed(s, `$${Math.abs(s) * 50}`),
    valueText: v => `${fmtUsd(v)} monthly rent`,
    rangeError: 'Enter 1,500–3,500',
    parse: raw => {
      const n = Number(raw.replace(/[$,\s]/g, ''));
      return Number.isFinite(n) ? Math.round(n) : null;
    },
  },
  {
    id: 'growthMo',
    label: 'Rent growth',
    min: 0,
    max: 150,
    step: 10,
    fmtValue: v => `$${v}/mo·yr`,
    fmtNotch: s => signed(s, `$${Math.abs(s) * 10}`),
    valueText: v => `${v} dollars per month each year`,
    rangeError: 'Enter 0–150',
    parse: raw => {
      const n = Number(raw.replace(/[$,\s]/g, '').replace(/\/.*$/, ''));
      return Number.isFinite(n) ? Math.round(n) : null;
    },
  },
];

function clampToDef(def: SliderDef, v: number): number {
  const snapped = Math.round((v - def.min) / def.step) * def.step + def.min;
  return Math.min(def.max, Math.max(def.min, snapped));
}

// ---------------------------------------------------------------------------
// SAVED SCENARIOS — 4 fixture snapshots; deltas re-derive live and were
// hand-verified against the base state (breakeven(live) = 6):
// scn_parents {rate 4.50%, dp 15%}: loan 357,000, netOwn 16,065−5,460 =
//   10,605, upfront 84,000; buyCum(4) 126,420 ≤ rentCum(4) 132,960
//   (buyCum(3) 115,815 > 98,280) → breakeven 4 → '−2 yrs'.
// scn_rates27 {rate 5.25%}: netOwn 17,640−5,460 = 12,180; buyCum(5)
//   165,900 ≤ 168,600 (buyCum(4) 153,720 > 132,960) → breakeven 5 → '−1 yr'.
// scn_dream {price 500,000}: loan 400,000, netOwn 26,000−6,500 = 19,500,
//   upfront 125,000; buyCum(8) 281,000 ≤ rentCum(8) 281,280 (buyCum(7)
//   261,500 > 242,760) → breakeven 8 → '+2 yrs'.
// scn_split {rentMo 1,900 — the 37-char name is the chip/vs-row
//   truncation stress}: rentCum(y) = 22,800y + 480y(y−1); buyCum(10)
//   268,800 ≤ rentCum(10) 271,200 (buyCum(9) 252,420 > 239,760) →
//   breakeven 10 → '+4 yrs'. (Spec listed 3 chips; a 4th fixture chip is
//   shipped so stress fixture 4 — the long-name ellipsis — is
//   demonstrable on first paint. Deviation noted.)
// ---------------------------------------------------------------------------

type ScenarioParams = Pick<LiveParams, AssumptionId>;

interface Scenario {
  id: string;
  name: string;
  params: ScenarioParams;
}

const SCENARIOS_FIXTURE: Scenario[] = [
  {
    id: 'scn_parents',
    name: 'Parents’ loan',
    params: {price: 420000, dpPct: 15, rateBp: 450, rentMo: 2650, growthMo: 80},
  },
  {
    id: 'scn_rates27',
    name: 'Rates drop ’27',
    params: {price: 420000, dpPct: 20, rateBp: 525, rentMo: 2650, growthMo: 80},
  },
  {
    id: 'scn_dream',
    name: 'Dream house',
    params: {price: 500000, dpPct: 20, rateBp: 650, rentMo: 2650, growthMo: 80},
  },
  {
    id: 'scn_split',
    name: 'Split with Priya + her parents 2027',
    params: {price: 420000, dpPct: 20, rateBp: 650, rentMo: 1900, growthMo: 80},
  },
];

// Deterministic ids for user-saved scenarios, in commit order.
const SAVE_IDS = ['scn_new1', 'scn_new2', 'scn_new3', 'scn_new4', 'scn_new5', 'scn_new6'];

// Model-notes rows echo the engine constants so the arithmetic is
// inspectable on-screen.
const MODEL_ROWS = [
  {id: 'mdl_appr', label: 'Appreciation', value: '3.5%/yr'},
  {id: 'mdl_carry', label: 'Tax + upkeep', value: '2.2%/yr'},
  {id: 'mdl_close', label: 'Closing costs', value: '5.0%'},
];

// ---------------------------------------------------------------------------
// DERIVED SELECTORS — pure fns computed in render. Every notch candidate
// runs the full breakeven engine (7 evaluations × 5 rows = 35 cheap
// integer loops per state change — pure arithmetic, no memo needed).
// ---------------------------------------------------------------------------

/** Earlier/later/same vs live, treating null (15+) as +infinity. */
function compareBreakeven(candidate: number | null, live: number | null): 'earlier' | 'later' | 'same' {
  const a = candidate ?? MAX_YEARS + 1;
  const b = live ?? MAX_YEARS + 1;
  if (a < b) return 'earlier';
  if (a > b) return 'later';
  return 'same';
}

interface TickInfo {
  key: string;
  frac: number; // 0..1 position along the track
  tone: 'earlier' | 'later' | 'same';
}

/** The 7-notch ghost tick strip for one slider (aria-hidden; the caption
 * voices the same information). */
function tickStripFor(def: SliderDef, live: LiveParams): TickInfo[] {
  const liveBe = breakeven(live);
  const ticks: TickInfo[] = [];
  for (let k = -3; k <= 3; k++) {
    const v = live[def.id] + k * def.step;
    if (v < def.min || v > def.max) continue;
    const be = k === 0 ? liveBe : breakeven({...live, [def.id]: v});
    ticks.push({
      key: `k${k}`,
      frac: (v - def.min) / (def.max - def.min),
      tone: compareBreakeven(be, liveBe),
    });
  }
  return ticks;
}

/** '+0.25% → +1 yr' | '−$20 → +1 yr' | 'flat ±3 notches' — nearest notch
 * (searched 1, −1, 2, −2, 3, −3) that moves the breakeven. */
function sensitivityCaption(def: SliderDef, live: LiveParams): string {
  const liveBe = breakeven(live);
  for (const k of [1, -1, 2, -2, 3, -3]) {
    const v = live[def.id] + k * def.step;
    if (v < def.min || v > def.max) continue;
    const be = breakeven({...live, [def.id]: v});
    if (compareBreakeven(be, liveBe) === 'same') continue;
    if (liveBe != null && be != null) {
      const d = be - liveBe;
      return `${def.fmtNotch(k)} → ${d > 0 ? '+' : '−'}${Math.abs(d)} yr${Math.abs(d) === 1 ? '' : 's'}`;
    }
    if (be == null) return `${def.fmtNotch(k)} → 15+`;
    return `${def.fmtNotch(k)} → yr ${be}`;
  }
  return 'flat ±3 notches';
}

/** Chip delta text vs live: '−2 yrs' / '+2 yrs' / '±0 yrs' / '—'. */
function chipDelta(scenario: Scenario, live: LiveParams): {text: string; tone: 'better' | 'worse' | 'flat' | 'na'} {
  const liveBe = breakeven(live);
  const snapBe = breakeven({...live, ...scenario.params});
  if (liveBe == null || snapBe == null) {
    if (liveBe == null && snapBe == null) return {text: '±0 yrs', tone: 'flat'};
    return {text: '—', tone: 'na'};
  }
  const d = snapBe - liveBe;
  if (d === 0) return {text: '±0 yrs', tone: 'flat'};
  return d < 0
    ? {text: `−${Math.abs(d)} yr${Math.abs(d) === 1 ? '' : 's'}`, tone: 'better'}
    : {text: `+${d} yr${d === 1 ? '' : 's'}`, tone: 'worse'};
}

/** Count of assumption sliders whose snapshot value differs from live. */
function diffCount(scenario: Scenario, live: LiveParams): number {
  return ASSUMPTION_IDS.filter(id => scenario.params[id] !== live[id]).length;
}

/** The canvas's recomputed aria-label sentence. */
function chartAriaLabel(live: LiveParams): string {
  const be = breakeven(live);
  const gap = Math.abs(buyCum(live, live.stayYears) - rentCum(live, live.stayYears));
  const winner = verdictAt(live) === 'buy' ? 'buying' : 'renting';
  const beText = be == null ? 'buying never overtakes renting within 15 years' : `buying overtakes renting at year ${be}`;
  return `Cumulative cost curves: ${beText}; at a ${live.stayYears}-year stay ${winner} saves ${fmtUsd(gap)}`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useFootholdStore(): the spec's store shape verbatim,
// plus one update(id, patch) mutator. Children own only transient state
// (pointer-drag deltas, in-flight typed drafts).
// ---------------------------------------------------------------------------

type OverlayId = null | 'saveSheet' | 'actionSheet';

interface UndoSlice {
  kind: 'live' | 'scenarios' | 'scenarioParams';
  live?: ScenarioParams;
  scenarios?: Scenario[];
  activeChipId?: string | null;
  scenarioId?: string;
  params?: ScenarioParams;
}

interface FootholdStore {
  live: LiveParams;
  scenarios: Scenario[];
  activeChipId: string | null;
  openOverlay: OverlayId;
  sheetDetent: 'medium' | 'large';
  toast: {seq: number; msg: string; undo: UndoSlice | null} | null;
  draftName: string;
}

const INITIAL_STORE: FootholdStore = {
  live: BASE_LIVE,
  scenarios: SCENARIOS_FIXTURE,
  activeChipId: null,
  openOverlay: null,
  sheetDetent: 'medium',
  toast: null,
  draftName: '',
};

function useFootholdStore() {
  const [store, setStore] = useState<FootholdStore>(INITIAL_STORE);
  const update = useCallback(
    <K extends keyof FootholdStore>(id: K, patch: FootholdStore[K]) => {
      setStore(prev => ({...prev, [id]: patch}));
    },
    [],
  );
  return {store, update, setStore};
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the shell
 * wrapper can tell the 390px mobile stage from the desktop stage.
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

/**
 * 200ms rAF count-up for the gap figure — transform-free numeral tween,
 * instant under prefers-reduced-motion (final value renders immediately).
 */
function useCountUp(target: number, reducedMotion: boolean): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);
  useEffect(() => {
    if (reducedMotion) {
      fromRef.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = fromRef.current;
    if (from === target) return undefined;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start == null) start = now;
      const t = Math.min(1, (now - start) / 200);
      const value = Math.round(from + (target - from) * t);
      setDisplay(value);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, reducedMotion]);
  return reducedMotion ? target : display;
}

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — overlays trap focus while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input');
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
// BRAND MARK — 20×20 inline SVG: three ascending 6px stair-step rects, the
// top step extending into a 45° roofline stroke; text-primary strokes with
// the BRAND_ACCENT top step (per spec).
// ---------------------------------------------------------------------------

function FootholdMark() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      {/* Ascending stair steps: 6px treads at y 16→10→4. */}
      <rect x={1} y={13} width={6} height={6} rx={1} stroke="var(--color-text-primary)" strokeWidth={1.5} />
      <rect x={7} y={7} width={6} height={6} rx={1} stroke="var(--color-text-primary)" strokeWidth={1.5} />
      <rect x={13} y={1} width={6} height={6} rx={1} stroke={BRAND_ACCENT} strokeWidth={1.5} />
      {/* 45° roofline off the top step. */}
      <path d="M13 1 L19 7" stroke={BRAND_ACCENT} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CROSSOVER CHART — live <canvas>, DPR-scaled, width = measured container.
// Domain x 0..15 yrs (plot left = 38px axis gutter, right −8), y $0..$600k.
// Plot band: 8px top pad + 172px plot + 20px year-tick strip = 200 (spec
// stated a 176px plot inside the same 200px canvas — its parts summed to
// 204; corrected to 172 so the strip reconciles; deviation noted).
// light-dark() strings cannot feed canvas directly, so a hidden probe span
// resolves each pair via getComputedStyle at draw time; a MutationObserver
// on <html> redraws on theme flips.
// ---------------------------------------------------------------------------

const PLOT_TOP = 8;
const PLOT_HEIGHT = 172;
const PLOT_BOTTOM = PLOT_TOP + PLOT_HEIGHT; // 180; year ticks live 180–200
const AXIS_GUTTER = 38;
const PLOT_RIGHT_INSET = 8;

function plotX(width: number, year: number): number {
  const plotW = width - AXIS_GUTTER - PLOT_RIGHT_INSET;
  return AXIS_GUTTER + (year / MAX_YEARS) * plotW;
}

function plotY(dollars: number): number {
  return PLOT_BOTTOM - (dollars / Y_DOMAIN_MAX) * PLOT_HEIGHT;
}

/** Fractional x of the buy/rent intersection on the sign-flip segment. */
function intersectionYear(p: LiveParams, be: number): number {
  const y0 = be - 1;
  const diffPrev = buyCum(p, y0) - rentCum(p, y0); // > 0
  const diffCur = buyCum(p, be) - rentCum(p, be); // ≤ 0
  if (diffPrev <= 0) return y0; // breakeven at year 0 boundary (instant-buy)
  const t = diffPrev / (diffPrev - diffCur);
  return y0 + t;
}

interface CrossoverChartProps {
  live: LiveParams;
  onStayChange: (year: number) => void;
}

function CrossoverChart({live, onStayChange}: CrossoverChartProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const probeRef = useRef<HTMLSpanElement | null>(null);
  const width = useElementWidth(wrapRef);
  const [themeSeq, setThemeSeq] = useState(0);
  const dragYearRef = useRef<number | null>(null);

  // Redraw when the demo flips theme (class/style attr on <html>).
  useEffect(() => {
    const observer = new MutationObserver(() => setThemeSeq(seq => seq + 1));
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class', 'style', 'data-theme']});
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (canvas == null || probe == null || width < AXIS_GUTTER + 40) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(200 * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx == null) return;
    ctx.scale(dpr, dpr);

    // Resolve light-dark() pairs through the probe span.
    const resolve = (cssColor: string): string => {
      probe.style.color = cssColor;
      return getComputedStyle(probe).color;
    };
    const cText = resolve('var(--color-text-secondary)');
    const cGrid = resolve('var(--color-border)');
    const cRent = resolve(RENT_LINE);
    const cBuy = resolve(BRAND_ACCENT);
    const cCard = resolve('var(--color-background-card)');
    const cPrimary = resolve('var(--color-text-primary)');

    ctx.clearRect(0, 0, width, 200);
    ctx.font = '500 11px var(--font-family-body, sans-serif)';

    // Gridlines + right-aligned gutter labels at 0/200k/400k/600k.
    const gridVals = [0, 200000, 400000, 600000];
    for (const v of gridVals) {
      const gy = plotY(v);
      ctx.strokeStyle = cGrid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(AXIS_GUTTER, gy);
      ctx.lineTo(width - PLOT_RIGHT_INSET, gy);
      ctx.stroke();
      ctx.fillStyle = cText;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(v === 0 ? '0' : `${v / 1000}k`, AXIS_GUTTER - 6, gy);
    }

    // Year tick strip (inside the canvas, 180–200): 0 / 5 / 10 / 15.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const yr of [0, 5, 10, 15]) {
      ctx.fillStyle = cText;
      ctx.fillText(`${yr}`, plotX(width, yr), 196);
    }

    // Clip series to the plot band ($ values can exceed the $600k domain).
    ctx.save();
    ctx.beginPath();
    ctx.rect(AXIS_GUTTER, PLOT_TOP, width - AXIS_GUTTER - PLOT_RIGHT_INSET, PLOT_HEIGHT);
    ctx.clip();

    // rentCum — piecewise-linear polyline through 16 integer-year vertices
    // (matches the arithmetic model exactly), 12%-alpha fill to baseline.
    ctx.beginPath();
    for (let y = 0; y <= MAX_YEARS; y++) {
      const px = plotX(width, y);
      const py = plotY(rentCum(live, y));
      if (y === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = cRent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo(plotX(width, MAX_YEARS), PLOT_BOTTOM);
    ctx.lineTo(plotX(width, 0), PLOT_BOTTOM);
    ctx.closePath();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = cRent;
    ctx.fill();
    ctx.globalAlpha = 1;

    // buyCum — straight line from (0, upfront) to (15, buyCum(15)).
    ctx.beginPath();
    ctx.moveTo(plotX(width, 0), plotY(buyCum(live, 0)));
    ctx.lineTo(plotX(width, MAX_YEARS), plotY(buyCum(live, MAX_YEARS)));
    ctx.strokeStyle = cBuy;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo(plotX(width, MAX_YEARS), PLOT_BOTTOM);
    ctx.lineTo(plotX(width, 0), PLOT_BOTTOM);
    ctx.closePath();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = cBuy;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Stay-length scrubber — 2px vertical line + 12px grabber diamond.
    const sx = plotX(width, live.stayYears);
    ctx.strokeStyle = cPrimary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, PLOT_TOP);
    ctx.lineTo(sx, PLOT_BOTTOM);
    ctx.stroke();
    ctx.restore(); // unclip so the diamond + flags render crisp at edges
    ctx.fillStyle = cPrimary;
    ctx.beginPath();
    ctx.moveTo(sx, PLOT_TOP - 4);
    ctx.lineTo(sx + 6, PLOT_TOP + 2);
    ctx.lineTo(sx, PLOT_TOP + 8);
    ctx.lineTo(sx - 6, PLOT_TOP + 2);
    ctx.closePath();
    ctx.fill();

    // Breakeven intersection ring + flag, or the no-breakeven edge flag.
    const be = breakeven(live);
    ctx.font = '600 11px var(--font-family-body, sans-serif)';
    if (be != null) {
      const ix = plotX(width, intersectionYear(live, be));
      const iy = plotY(buyCum(live, intersectionYear(live, be)));
      ctx.beginPath();
      ctx.arc(ix, iy, 6, 0, Math.PI * 2);
      ctx.fillStyle = cCard;
      ctx.fill();
      ctx.strokeStyle = cBuy;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = cBuy;
      ctx.textAlign = 'center';
      ctx.fillText(`yr ${be}`, Math.min(Math.max(ix, AXIS_GUTTER + 14), width - 24), Math.max(iy - 12, PLOT_TOP + 10));
    } else {
      ctx.fillStyle = cText;
      ctx.textAlign = 'right';
      ctx.fillText('no breakeven ≤ yr 15', width - PLOT_RIGHT_INSET, PLOT_TOP + 12);
    }
  }, [live, width, themeSeq]);

  // Scrubber drag — pointer capture on the invisible 44px hit strip; maps
  // clientX → year, SNAPS to integers; buttons + slider keys are the
  // non-gesture path.
  const yearFromClientX = (clientX: number): number => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect == null || width === 0) return live.stayYears;
    const plotW = width - AXIS_GUTTER - PLOT_RIGHT_INSET;
    const year = Math.round(((clientX - rect.left - AXIS_GUTTER) / plotW) * MAX_YEARS);
    return Math.min(MAX_YEARS, Math.max(1, year));
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragYearRef.current = live.stayYears;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragYearRef.current == null) return;
    const year = yearFromClientX(event.clientX);
    if (year !== dragYearRef.current) {
      dragYearRef.current = year;
      onStayChange(year);
    }
  };
  const onPointerUp = () => {
    dragYearRef.current = null;
  };
  const onScrubKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, live.stayYears - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(MAX_YEARS, live.stayYears + 1);
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = MAX_YEARS;
    if (next == null) return;
    event.preventDefault();
    if (next !== live.stayYears) onStayChange(next);
  };

  const hitLeft = width > 0 ? plotX(width, live.stayYears) - 22 : 0;
  return (
    <div ref={wrapRef} style={styles.canvasWrap}>
      <span ref={probeRef} aria-hidden style={{position: 'absolute', width: 0, height: 0, overflow: 'hidden'}} />
      <canvas ref={canvasRef} style={styles.canvas} role="img" aria-label={chartAriaLabel(live)} />
      {width > 0 ? (
        <div
          className="fhd-focusable"
          style={{...styles.scrubHit, left: hitLeft}}
          role="slider"
          tabIndex={0}
          aria-label="Stay length"
          aria-valuemin={1}
          aria-valuemax={MAX_YEARS}
          aria-valuenow={live.stayYears}
          aria-valuetext={`${live.stayYears} year stay`}
          aria-orientation="horizontal"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onScrubKeyDown}
        />
      ) : null}
      {/* Non-gesture parity lives in the scrubber button row below the
          canvas; reduced motion strips the snap pulse in the readout. */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SENSITIVITY SLIDER ROW — 112px anatomy; the trailing value pill swaps to
// a 28px inline input (validates ON BLUR, clamps + fieldError when out of
// range, error clears the moment typing turns valid). Steppers are named
// real buttons; the track strip is the role='slider' with full keys.
// ---------------------------------------------------------------------------

interface SliderRowProps {
  def: SliderDef;
  live: LiveParams;
  diffScenario: Scenario | null;
  onChange: (id: AssumptionId, value: number) => void;
}

function SliderRow({def, live, diffScenario, onChange}: SliderRowProps) {
  const value = live[def.id];
  const frac = (value - def.min) / (def.max - def.min);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const ticks = tickStripFor(def, live);
  const caption = sensitivityCaption(def, live);
  const diffs = diffScenario != null && diffScenario.params[def.id] !== value;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitDraft = () => {
    const parsed = def.parse(draft);
    if (parsed == null || parsed < def.min || parsed > def.max) {
      setFieldError(def.rangeError);
      return; // value unchanged until valid
    }
    onChange(def.id, clampToDef(def, parsed));
    setFieldError(null);
    setEditing(false);
  };
  const onDraftChange = (raw: string) => {
    setDraft(raw);
    // Reward the fix immediately: error clears while typing once valid.
    const parsed = def.parse(raw);
    if (fieldError != null && parsed != null && parsed >= def.min && parsed <= def.max) {
      setFieldError(null);
    }
  };

  const valueFromClientX = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return value;
    const raw = def.min + ((clientX - rect.left) / rect.width) * (def.max - def.min);
    return clampToDef(def, raw);
  };
  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = valueFromClientX(event.clientX);
    if (next !== value) onChange(def.id, next);
  };
  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const next = valueFromClientX(event.clientX);
    if (next !== value) onChange(def.id, next);
  };
  const onTrackPointerUp = () => {
    draggingRef.current = false;
  };
  const onTrackKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(def.min, value - def.step);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(def.max, value + def.step);
    else if (event.key === 'Home') next = def.min;
    else if (event.key === 'End') next = def.max;
    if (next == null) return;
    event.preventDefault();
    if (next !== value) onChange(def.id, next);
  };

  const tickColor = (tone: TickInfo['tone']): string =>
    tone === 'earlier' ? BRAND_ACCENT : tone === 'later' ? WORSE_AMBER : REST_RAIL;

  return (
    <div style={{...styles.sliderRow, ...(diffs ? styles.sliderRowDiff : null)}}>
      <div style={styles.labelLine}>
        <span style={styles.sliderLabel}>{def.label}</span>
        {editing ? (
          <input
            ref={inputRef}
            style={{...styles.valueInput, ...(fieldError != null ? styles.valueInputError : null)}}
            defaultValue={draft}
            inputMode="decimal"
            aria-label={`${def.label} value`}
            aria-invalid={fieldError != null}
            aria-describedby={fieldError != null ? `fhd-err-${def.id}` : undefined}
            onChange={event => onDraftChange(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={event => {
              if (event.key === 'Enter') commitDraft();
              if (event.key === 'Escape') {
                setEditing(false);
                setFieldError(null);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="fhd-btn fhd-focusable"
            style={styles.valuePillBtn}
            aria-label={`${def.label}: ${def.fmtValue(value)} — type a value`}
            onClick={() => {
              setDraft(String(def.id === 'rateBp' ? (value / 100).toFixed(2) : value));
              setFieldError(null);
              setEditing(true);
            }}>
            {def.fmtValue(value)}
          </button>
        )}
      </div>
      {fieldError != null ? (
        <div id={`fhd-err-${def.id}`} style={styles.fieldError}>
          {fieldError}
        </div>
      ) : null}
      {diffs && diffScenario != null ? (
        <div style={styles.diffCaption}>
          snapshot {def.fmtValue(diffScenario.params[def.id])} → live {def.fmtValue(value)}
        </div>
      ) : null}
      <div style={styles.controlLine}>
        <button
          type="button"
          className="fhd-btn fhd-focusable"
          style={{...styles.stepBtn, ...(value <= def.min ? styles.stepBtnDisabled : null)}}
          aria-label={`Decrease ${def.label.toLowerCase()}`}
          disabled={value <= def.min}
          onClick={() => onChange(def.id, Math.max(def.min, value - def.step))}>
          <Icon icon={MinusIcon} size="sm" color="inherit" />
        </button>
        <div
          ref={trackRef}
          className="fhd-focusable"
          style={styles.trackStrip}
          role="slider"
          tabIndex={0}
          aria-label={def.label}
          aria-valuemin={def.min}
          aria-valuemax={def.max}
          aria-valuenow={value}
          aria-valuetext={def.valueText(value)}
          aria-orientation="horizontal"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onKeyDown={onTrackKeyDown}>
          <div style={styles.trackRail} aria-hidden />
          <div style={{...styles.trackFill, width: `${frac * 100}%`}} aria-hidden />
          <div style={{...styles.trackThumb, left: `calc(${frac * 100}% - 10px)`}} aria-hidden />
        </div>
        <button
          type="button"
          className="fhd-btn fhd-focusable"
          style={{...styles.stepBtn, ...(value >= def.max ? styles.stepBtnDisabled : null)}}
          aria-label={`Increase ${def.label.toLowerCase()}`}
          disabled={value >= def.max}
          onClick={() => onChange(def.id, Math.min(def.max, value + def.step))}>
          <Icon icon={PlusIcon} size="sm" color="inherit" />
        </button>
      </div>
      {/* Ghost tick strip — presentational; the caption voices it. Flat
          ticks render solid REST_RAIL (≥3:1 vs card) instead of the
          spec's 35%-alpha secondary, per the batch-2 amendment. */}
      <div style={styles.tickStrip} aria-hidden>
        {ticks.map(tick => (
          <span
            key={tick.key}
            style={{
              ...styles.tick,
              left: `calc(${tick.frac * 100}% - 1px)`,
              background: tickColor(tick.tone),
              height: tick.tone === 'same' ? 8 : 10,
              top: tick.tone === 'same' ? 4 : 3,
            }}
          />
        ))}
        <span style={styles.tickCaption}>{caption}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SAVE SHEET — two-detent bottom sheet (grabber button toggles detents;
// drag is garnish; X/scrim/Escape close). MEDIUM: name field + live-value
// echo card + 60px breakeven summary. LARGE additionally reveals VS SAVED.
// ---------------------------------------------------------------------------

interface SaveSheetProps {
  store: FootholdStore;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  nameError: string | null;
  onNameChange: (name: string) => void;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onSave: () => void;
}

function SaveSheet({store, sheetRef, reducedMotion, nameError, onNameChange, onDetentChange, onClose, onSave}: SaveSheetProps) {
  const {live, scenarios, sheetDetent} = store;
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const be = breakeven(live);
  const gap = Math.abs(buyCum(live, live.stayYears) - rentCum(live, live.stayYears));
  const winner = verdictAt(live) === 'buy' ? 'buying' : 'renting';

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
    if (dy > 120 && sheetDetent === 'medium') onClose();
    else if (dy > 60 && sheetDetent === 'large') onDetentChange('medium');
    else if (dy < -60 && sheetDetent === 'medium') onDetentChange('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetentChange(sheetDetent === 'medium' ? 'large' : 'medium');
  };

  const echoRows = SLIDER_DEFS.map(def => ({
    id: def.id,
    label: def.label,
    value: def.fmtValue(live[def.id]),
  }));

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fhd-save-title"
      tabIndex={-1}
      className="fhd-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="fhd-btn fhd-focusable"
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
        <h2 id="fhd-save-title" style={styles.sheetTitle}>
          Save scenario
        </h2>
        <button type="button" className="fhd-btn fhd-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.formField}>
          <label style={styles.fieldLabel} htmlFor="fhd-name-input">
            Scenario name
          </label>
          <input
            id="fhd-name-input"
            style={{
              ...styles.nameInput,
              boxShadow:
                nameError != null
                  ? 'inset 0 0 0 2px var(--color-error)'
                  : undefined,
            }}
            value={store.draftName}
            placeholder="e.g. Rates drop again"
            aria-invalid={nameError != null}
            aria-describedby={nameError != null ? 'fhd-name-err' : undefined}
            onChange={event => onNameChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') onSave();
            }}
          />
          {nameError != null ? (
            <div id="fhd-name-err" style={{...styles.fieldError, textAlign: 'start', marginTop: 0}}>
              {nameError}
            </div>
          ) : null}
        </div>
        <div style={styles.sheetCard}>
          {echoRows.map((row, index) => (
            <div key={row.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.utilityRow}>
                <span style={styles.utilLabel}>{row.label}</span>
                <span style={{...styles.utilValue, color: 'var(--color-text-primary)'}}>{row.value}</span>
              </div>
            </div>
          ))}
          <div style={styles.rowDivider} />
          <div style={styles.summaryRow}>
            <span style={styles.summaryPrimary}>
              {be == null ? 'No breakeven ≤ yr 15' : `Breakeven yr ${be}`}
            </span>
            <span style={styles.summarySecondary}>
              {winner === 'buying' ? 'buying' : 'renting'} saves {fmtUsd(gap)} at your {live.stayYears}-yr stay
            </span>
          </div>
        </div>
        {sheetDetent === 'large' ? (
          <>
            <h3
              style={{
                ...styles.sectionHeader,
                paddingInlineStart: 0,
                margin: '4px 0 8px',
              }}>
              Vs saved
            </h3>
            <div style={styles.sheetCard}>
              {scenarios.length === 0 ? (
                <div style={{...styles.railEmpty, marginInline: 16}}>No saved scenarios yet.</div>
              ) : (
                scenarios.map((scenario, index) => {
                  const delta = chipDelta(scenario, live);
                  const snapBe = breakeven({...live, ...scenario.params});
                  return (
                    <div key={scenario.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.vsRow}>
                        <span style={styles.vsRowText}>
                          <span style={styles.vsRowName}>{scenario.name}</span>
                          <span style={styles.vsRowMeta}>
                            {snapBe == null ? 'no breakeven ≤ yr 15' : `breakeven yr ${snapBe}`}
                          </span>
                        </span>
                        <span
                          style={{
                            ...styles.chipDelta,
                            color:
                              delta.tone === 'better'
                                ? BRAND_ACCENT
                                : delta.tone === 'worse'
                                  ? WORSE_AMBER
                                  : 'var(--color-text-secondary)',
                          }}>
                          {delta.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : null}
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="fhd-btn fhd-focusable" style={styles.primaryBtn} onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — chip verbs: 'Update snapshot to live values' then the
// destructive 'Delete scenario' LAST, with its own separate Cancel card.
// Focus lands on Cancel on open (safe default); scrim/Escape close; both
// mutations are reversible so they execute immediately with Undo toasts —
// no confirm dialogs (undoOverConfirm).
// ---------------------------------------------------------------------------

interface ChipActionSheetProps {
  scenario: Scenario;
  sheetRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  onUpdateSnapshot: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

function ChipActionSheet({scenario, sheetRef, cancelRef, onUpdateSnapshot, onDelete, onCancel}: ChipActionSheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Actions for ${scenario.name}`}
      tabIndex={-1}
      className="fhd-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.actionCard}>
        <div style={styles.actionHeader}>{scenario.name}</div>
        <button type="button" className="fhd-btn fhd-focusable" style={styles.actionRow} onClick={onUpdateSnapshot}>
          Update snapshot to live values
        </button>
        <div style={styles.actionRowDivider} />
        <button
          type="button"
          className="fhd-btn fhd-focusable"
          style={{...styles.actionRow, ...styles.actionRowDestructive}}
          onClick={onDelete}>
          Delete scenario
        </button>
      </div>
      <div style={styles.actionCard}>
        <button ref={cancelRef} type="button" className="fhd-btn fhd-focusable" style={styles.cancelRow} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

function pickAssumptions(live: LiveParams): ScenarioParams {
  return {price: live.price, dpPct: live.dpPct, rateBp: live.rateBp, rentMo: live.rentMo, growthMo: live.growthMo};
}

export default function MobileRentVsBuyCoachTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, update, setStore} = useFootholdStore();
  const {live, scenarios, activeChipId, openOverlay, toast} = store;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const saveSheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const overlayOpenerRef = useRef<HTMLElement | null>(null);
  const saveHeaderBtnRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);
  const [nameError, setNameError] = useState<string | null>(null);
  const [pulseSeq, setPulseSeq] = useState(0);
  const [editingStay, setEditingStay] = useState(false);
  const stayInputRef = useRef<HTMLInputElement | null>(null);

  // Derived selectors — pure fns, computed in render.
  const be = breakeven(live);
  const verdict = verdictAt(live);
  const gapNow = Math.abs(buyCum(live, live.stayYears) - rentCum(live, live.stayYears));
  const gapDisplay = useCountUp(gapNow, reducedMotion);
  const activeScenario = scenarios.find(scenario => scenario.id === activeChipId) ?? null;
  const activeDiffCount = activeScenario != null ? diffCount(activeScenario, live) : 0;

  const nextToast = (msg: string, undo: UndoSlice | null = null) => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };
  const showToast = (msg: string) => update('toast', nextToast(msg));

  // THE live-write path for scrubber + sliders + typed fields: one update
  // that also announces a verdict flip ONCE per crossing (mutation toasts
  // from Apply/Delete/Undo use their own messages and are never clobbered
  // because they go through their own commit paths).
  const commitLive = (patch: Partial<LiveParams>) => {
    const nextLive = {...live, ...patch};
    const flipped = verdictAt(live) !== verdictAt(nextLive);
    const flipMsg =
      verdictAt(nextLive) === 'buy'
        ? `Verdict flipped: buying wins at a ${nextLive.stayYears}-year stay`
        : `Verdict flipped: renting wins at a ${nextLive.stayYears}-year stay`;
    setStore(prev => ({
      ...prev,
      live: {...prev.live, ...patch},
      toast: flipped ? nextToast(flipMsg) : prev.toast,
    }));
  };

  const onStayChange = (year: number) => {
    if (year === live.stayYears) return;
    commitLive({stayYears: year});
    setPulseSeq(seq => seq + 1);
  };

  useEffect(() => {
    if (editingStay) stayInputRef.current?.focus();
  }, [editingStay]);

  // Focus moves into an opening overlay with preventScroll — plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen (amendment).
  useEffect(() => {
    if (openOverlay === 'saveSheet') {
      saveSheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    } else if (openOverlay === 'actionSheet') {
      // Safe default: focus lands on Cancel, never the destructive row.
      actionCancelRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [openOverlay]);

  const openSaveSheet = (opener: HTMLElement) => {
    overlayOpenerRef.current = opener;
    setNameError(null);
    setStore(prev => ({...prev, openOverlay: 'saveSheet', sheetDetent: 'medium', draftName: ''}));
  };
  const closeOverlay = () => {
    update('openOverlay', null);
    overlayOpenerRef.current?.focus();
  };
  const openActionSheet = (opener: HTMLElement) => {
    overlayOpenerRef.current = opener;
    update('openOverlay', 'actionSheet');
  };

  // Escape closes the TOPMOST overlay only (actionSheet and saveSheet are
  // never stacked — the actionSheet opens only from the base screen).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (openOverlay != null) closeOverlay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openOverlay]);

  // CONSEQUENCE CHAINS -------------------------------------------------------

  const saveScenario = () => {
    const name = store.draftName.trim();
    if (name === '') {
      setNameError('Name this scenario');
      document.getElementById('fhd-name-input')?.focus();
      return;
    }
    const savedCount = scenarios.filter(scenario => scenario.id.startsWith('scn_new')).length;
    const scenario: Scenario = {
      id: SAVE_IDS[Math.min(savedCount, SAVE_IDS.length - 1)],
      name,
      params: pickAssumptions(live),
    };
    setStore(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, scenario],
      openOverlay: null,
      draftName: '',
      toast: nextToast('Scenario saved'),
    }));
    overlayOpenerRef.current?.focus();
  };

  // Apply — copies snapshot params into live via one update; Undo restores
  // the exact prior live params (stress fixture 6: after Undo the base
  // readings return exactly — 203,280 vs 205,200 at yr 6).
  const applyScenario = (scenario: Scenario) => {
    const prior = pickAssumptions(live);
    setStore(prev => ({
      ...prev,
      live: {...prev.live, ...scenario.params},
      toast: nextToast(`${scenario.name} applied`, {kind: 'live', live: prior}),
    }));
  };

  const updateSnapshot = (scenario: Scenario) => {
    const prior = {...scenario.params};
    setStore(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(s => (s.id === scenario.id ? {...s, params: pickAssumptions(prev.live)} : s)),
      openOverlay: null,
      toast: nextToast(`${scenario.name} updated to live values`, {
        kind: 'scenarioParams',
        scenarioId: scenario.id,
        params: prior,
      }),
    }));
    overlayOpenerRef.current?.focus();
  };

  // Delete executes immediately + Undo restores the exact prior list
  // (position included) — no confirm dialog (undoOverConfirm).
  const deleteScenario = (scenario: Scenario) => {
    const priorScenarios = scenarios;
    const priorActive = activeChipId;
    setStore(prev => ({
      ...prev,
      scenarios: prev.scenarios.filter(s => s.id !== scenario.id),
      activeChipId: prev.activeChipId === scenario.id ? null : prev.activeChipId,
      openOverlay: null,
      toast: nextToast(`${scenario.name} deleted`, {
        kind: 'scenarios',
        scenarios: priorScenarios,
        activeChipId: priorActive,
      }),
    }));
    saveHeaderBtnRef.current?.focus();
  };

  const undoToast = () => {
    const undo = toast?.undo;
    if (undo == null) return;
    setStore(prev => {
      if (undo.kind === 'live' && undo.live != null) {
        return {...prev, live: {...prev.live, ...undo.live}, toast: nextToast('Restored')};
      }
      if (undo.kind === 'scenarios' && undo.scenarios != null) {
        return {
          ...prev,
          scenarios: undo.scenarios,
          activeChipId: undo.activeChipId ?? null,
          toast: nextToast('Restored'),
        };
      }
      if (undo.kind === 'scenarioParams' && undo.scenarioId != null && undo.params != null) {
        return {
          ...prev,
          scenarios: prev.scenarios.map(s => (s.id === undo.scenarioId ? {...s, params: undo.params as ScenarioParams} : s)),
          toast: nextToast('Restored'),
        };
      }
      return prev;
    });
  };

  // Chip rail arrow keys — the horizontal-scroll gesture's keyboard path.
  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const chips = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
    const index = chips.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? index + 1 : index - 1;
    const target = chips[Math.min(chips.length - 1, Math.max(0, next))];
    target?.focus();
    target?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  };

  const commitStayDraft = (raw: string) => {
    const n = Number(raw.replace(/[^\d]/g, ''));
    if (Number.isFinite(n) && n >= 1) {
      onStayChange(Math.min(MAX_YEARS, Math.max(1, Math.round(n))));
    }
    setEditingStay(false);
  };

  // Verdict pill — fixed-length label; 150ms crossfade via .fhd-pill.
  const pillLabel = be == null ? 'RENT 15+ YRS' : `${verdict === 'buy' ? 'BUY' : 'RENT'} AT YR ${live.stayYears}`;
  const pillStyle: CSSProperties = {
    ...styles.verdictPill,
    background: verdict === 'buy' ? BRAND_ACCENT : RENT_FILL,
    color: verdict === 'buy' ? BRAND_FILL_TEXT : RENT_FILL_TEXT,
  };

  const sentence =
    be == null
      ? 'Renting wins every stay ≤ 15 yrs'
      : verdict === 'buy'
        ? `Buying wins over a ${live.stayYears}-yr stay`
        : `Renting wins over a ${live.stayYears}-yr stay`;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(openOverlay != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FOOTHOLD_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="fhd-btn fhd-focusable"
              style={styles.backBtn}
              aria-label="Back to Tools"
              onClick={() => showToast('Tools is one level up — this demo stays in Foothold')}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Tools</span>
            </button>
          </div>
          <div style={styles.navCenter}>
            <FootholdMark />
            <h1 style={styles.navTitle}>
              Foothold<span className="fhd-vh"> rent vs buy coach</span>
            </h1>
          </div>
          <div style={styles.navTrailing}>
            <div style={styles.verdictPillHit}>
              <span className="fhd-pill" style={pillStyle}>
                {pillLabel}
              </span>
            </div>
          </div>
        </header>

        {/* CHART DOCK — sticky under the navBar; the scroll body passes
            beneath. 8 + 48 + 200 + 8 + 44 + 12 = 320 + 1px hairline. */}
        <section style={styles.chartDock} aria-label="Crossover chart">
          <div style={styles.readoutRow}>
            <span style={styles.readoutSentence}>{sentence}</span>
            <span key={pulseSeq} className={reducedMotion ? undefined : 'fhd-pulse'} style={styles.gapFigure}>
              {fmtUsd(gapDisplay)}
            </span>
          </div>
          <CrossoverChart live={live} onStayChange={onStayChange} />
          <div style={styles.scrubRow}>
            <button
              type="button"
              className="fhd-btn fhd-focusable"
              style={{...styles.yrBtn, ...(live.stayYears <= 1 ? styles.yrBtnDisabled : null)}}
              aria-label="Shorten stay one year"
              disabled={live.stayYears <= 1}
              onClick={() => onStayChange(live.stayYears - 1)}>
              yr −
            </button>
            {editingStay ? (
              <input
                ref={stayInputRef}
                style={styles.stayInput}
                defaultValue={String(live.stayYears)}
                inputMode="numeric"
                aria-label="Stay length in years"
                onBlur={event => commitStayDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') commitStayDraft(event.currentTarget.value);
                  if (event.key === 'Escape') setEditingStay(false);
                }}
              />
            ) : (
              <button
                type="button"
                className="fhd-btn fhd-focusable"
                style={styles.stayValueBtn}
                aria-label={`Stay ${live.stayYears} years — type a value`}
                onClick={() => setEditingStay(true)}>
                Stay {live.stayYears} yrs
              </button>
            )}
            <button
              type="button"
              className="fhd-btn fhd-focusable"
              style={{...styles.yrBtn, ...(live.stayYears >= MAX_YEARS ? styles.yrBtnDisabled : null)}}
              aria-label="Lengthen stay one year"
              disabled={live.stayYears >= MAX_YEARS}
              onClick={() => onStayChange(live.stayYears + 1)}>
              yr +
            </button>
          </div>
        </section>

        <main style={{flex: 1}}>
          {/* SCENARIOS — snapshot chips re-argue with the live state. */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Scenarios</h2>
            <button
              type="button"
              ref={saveHeaderBtnRef}
              className="fhd-btn fhd-focusable"
              style={styles.saveTextBtn}
              onClick={event => openSaveSheet(event.currentTarget)}>
              Save
            </button>
          </div>
          {scenarios.length === 0 ? (
            <div style={styles.railEmpty}>
              Saved scenarios appear here — tap Save to snapshot these sliders
            </div>
          ) : (
            <div style={styles.chipRail} onKeyDown={onRailKeyDown}>
              {scenarios.map(scenario => {
                const delta = chipDelta(scenario, live);
                const isActive = scenario.id === activeChipId;
                const deltaColor =
                  delta.tone === 'better'
                    ? BRAND_ACCENT
                    : delta.tone === 'worse'
                      ? WORSE_AMBER
                      : 'var(--color-text-secondary)';
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    className="fhd-btn fhd-focusable"
                    style={{...styles.chip, ...(isActive ? styles.chipActive : null)}}
                    aria-pressed={isActive}
                    aria-label={`${scenario.name}, breakeven ${delta.text === '—' ? 'not comparable' : `${delta.text} vs live`}${isActive ? ' — active' : ''}`}
                    onClick={() => update('activeChipId', isActive ? null : scenario.id)}>
                    <span style={styles.chipName}>{scenario.name}</span>
                    <span style={{...styles.chipDelta, color: deltaColor}}>{delta.text}</span>
                  </button>
                );
              })}
            </div>
          )}
          {activeScenario != null ? (
            <div style={styles.diffBar}>
              <span style={styles.diffText}>
                {breakeven(live) == null && breakeven({...live, ...activeScenario.params}) != null
                  ? `Differs on ${activeDiffCount} of 5 · live has no breakeven`
                  : `Differs on ${activeDiffCount} of 5`}
              </span>
              <span style={styles.diffSpacer} />
              <button
                type="button"
                className="fhd-btn fhd-focusable"
                style={styles.applyBtn}
                onClick={() => applyScenario(activeScenario)}>
                Apply
              </button>
              <button
                type="button"
                className="fhd-btn fhd-focusable"
                style={styles.iconBtn}
                aria-label={`More actions for ${activeScenario.name}`}
                aria-expanded={openOverlay === 'actionSheet'}
                onClick={event => openActionSheet(event.currentTarget)}>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </button>
            </div>
          ) : null}

          {/* ASSUMPTIONS — five 112px sensitivity slider rows. */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Assumptions</h2>
          </div>
          <div style={styles.listCard}>
            {SLIDER_DEFS.map((def, index) => (
              <div key={def.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <SliderRow
                  def={def}
                  live={live}
                  diffScenario={activeScenario}
                  onChange={(id, value) => commitLive({[id]: value})}
                />
              </div>
            ))}
          </div>

          {/* MODEL — static, non-interactive rows echoing the engine
              constants so the arithmetic is inspectable on-screen. */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Model</h2>
          </div>
          <div style={styles.listCard}>
            {MODEL_ROWS.map((row, index) => (
              <div key={row.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.utilityRow}>
                  <span style={styles.utilLabel}>{row.label}</span>
                  <span style={styles.utilValue}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={styles.modelCaption}>Linearized model — coaching, not advice.</p>
        </main>

        {/* TOAST DOCK — sticky-in-flow above the footer; the single polite
            live region; one toast at a time, no timers; Undo restores the
            exact prior state and reads 'Restored'. */}
        <div style={styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast} className="fhd-fade">
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="fhd-btn fhd-focusable" style={styles.undoBtn} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* STICKY FOOTER — the sole primary verb, prime thumb arc. */}
        <footer style={styles.stickyFooter}>
          <button
            type="button"
            className="fhd-btn fhd-focusable"
            style={styles.primaryBtn}
            onClick={event => openSaveSheet(event.currentTarget)}>
            Save scenario
          </button>
        </footer>

        {openOverlay != null ? <div style={styles.sheetScrim} onClick={closeOverlay} aria-hidden /> : null}
        {openOverlay === 'saveSheet' ? (
          <SaveSheet
            store={store}
            sheetRef={saveSheetRef}
            reducedMotion={reducedMotion}
            nameError={nameError}
            onNameChange={name => {
              update('draftName', name);
              if (nameError != null && name.trim() !== '') setNameError(null);
            }}
            onDetentChange={detent => update('sheetDetent', detent)}
            onClose={closeOverlay}
            onSave={saveScenario}
          />
        ) : null}
        {openOverlay === 'actionSheet' && activeScenario != null ? (
          <ChipActionSheet
            scenario={activeScenario}
            sheetRef={actionSheetRef}
            cancelRef={actionCancelRef}
            onUpdateSnapshot={() => updateSnapshot(activeScenario)}
            onDelete={() => deleteScenario(activeScenario)}
            onCancel={closeOverlay}
          />
        ) : null}
      </div>
    </div>
  );
}
