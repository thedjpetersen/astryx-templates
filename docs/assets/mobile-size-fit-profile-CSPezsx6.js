var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Selvage fit profile:
 *   MEASUREMENTS {chest 98, waist 84, hip 100, inseam 78, shoulder null} →
 *   4 of 5 measured → completeness 80% (ring sweep 288° = 0.80×360 ✓);
 *   six brand charts (contiguous 6 cm chest bands; Field & Loom is
 *   waist-driven, 84 cm = 33.1 in → 'W33 · True', 84/2.54 = 33.07 ✓);
 *   confidences 67+75+50+100+75+100 = 467, avg 467/6 = 77.83 → 'Fit 78' ✓;
 *   Arno garment spec (M chest 102 / waist 96 / hip 106) drives silhouette
 *   ease at body 98: chest 4 true · waist 12 loose · hip 6 true · inseam
 *   n/a; two Bag items (Arno Trucker $148, Kessler Crew $96). No
 *   Date.now(), no Math.random(), no network media — thumbs are id-derived
 *   CSS gradients.
 * @output Selvage — Living Fit Profile: a 390px MOBILE fit-profile builder.
 *   NavBar (tape-loop 's' mark · 'Fit' · FitScoreChip with completeness
 *   ring) over a scrubbable MeasureTapeDial (80–120 cm strip at 16px/cm,
 *   0.5 cm detents, magnifier lens, flanking 44×44 steppers, cm|in
 *   segmented toggle, 'Add shoulder' chip → inline validated formField), a
 *   SilhouetteFitMap with four tappable ease zones, a 6-row BrandFitLedger
 *   (confidence bars, FLIP re-sort, 'Updated' badges), a sticky toastDock,
 *   a 72px BagTray whose two size chips re-derive live, and a 64px 4-tab
 *   bar. Signature move: every half-cm detent re-verdicts all 6 brands,
 *   re-tints the silhouette, and re-sizes both bag items in one render —
 *   scrubbing 98→101 flips exactly 3 ledger rows M→L, re-sorts the ledger,
 *   pulses both bag chips, and announces once. A two-detent brand sheet
 *   (PDP size chips, size-chart rows, confidence bar) opens from ledger
 *   rows and silhouette zones; committing shoulder 46 closes the ring to
 *   100% and lifts every confidence to 100 (600/6 ✓).
 * @position Page template; emitted by \`astryx template mobile-size-fit-profile\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, toast-when-locked)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. Stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Selvage violet); sanctioned non-brand literals are the
 *   three ease-band pairs (tight/true/loose, contrast math at each
 *   declaration) and CONTROL_BORDER — the ≥3:1 interactive-boundary pair
 *   the foundations amendment requires for rest-state control edges
 *   (hairline tokens stay on passive separators only).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', always-on hairline — the
 *   sanctioned always-on variant, no large-title row); tabBar exactly 64px,
 *   4 tabItems, 24px icon over 11px/500 label, 4px gap; BagTray dock 72px
 *   sticky bottom:64 z19; ledger rows 60px two-line (16px/500 + 13px/400,
 *   2px gap, 16px inline padding), rowDivider inset 16, last row none;
 *   sheet chart rows 44px; sectionHeader 13px/600 uppercase 0.06em at 32px
 *   from stage edge, 20px top / 8px bottom. TYPE: 22px/700 lens numeral ·
 *   17px/600 nav & card & sheet titles · 16px/400 body/row primary (hard
 *   floor) · 13px/400 meta · 11px/500 tick labels + tab labels + badges
 *   (nothing below 11); tabular-nums on every updating numeral. Buttons:
 *   44×44 icon/stepper hits, 36px size chips, 48px sheet primary; every
 *   target ≥44×44 with ≥8px clearance or merged into a full-row button;
 *   the tape scrub ships with stepper + slider-keyboard fallbacks.
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals. Tape window = 100% − 32 gutter
 *   − 88 steppers − 16 gaps (254px @390 · 184 @320 · 294 @430); the 640px
 *   strip pans, the center indicator stays at 50%. Silhouette SVG
 *   width:100% maxWidth:280. Ledger primary ellipsizes (minWidth:0)
 *   against a fixed 76px trailing block. BagTray names shrink first
 *   (minWidth:0 ellipsis). Sheet detents are %-based. overflowX:'clip' is
 *   the backstop, not the mechanism.
 * - Desktop stage (~1045px): useElementWidth ResizeObserver on the wrap —
 *   at ≥720px container width the shell becomes a centered phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline). No adaptive
 *   relayout; the anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  MinusIcon,
  PlusIcon,
  RulerIcon,
  ShirtIcon,
  ShoppingBagIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with
// contrast math against its ACTUAL surface (foundations amendment).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Selvage violet). #7C3AED on #FFFFFF ≈
// 5.7:1; #C4B5FD on the dark card (~#1C1917) ≈ 9.5:1 — both pass 4.5:1.
const BRAND_ACCENT = 'light-dark(#7C3AED, #C4B5FD)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #7C3AED ≈ 5.7:1. Dark:
// white on #C4B5FD fails (~2.0:1), so the dark side flips to deep violet —
// #2E1065 on #C4B5FD ≈ 8.2:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #2E1065)';
// Brand-tinted wash (target-row highlight, brand mark chip).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Ease-band pairs — fills/strokes ON THE CARD surface (spec math, all
// ≥3:1 as graphics and ≥4.5:1 as 11px label text vs the card):
// tight: #B45309 on #FFF ≈ 4.8:1 · #FBBF24 on #1C1917 ≈ 8.9:1
const EASE_TIGHT = 'light-dark(#B45309, #FBBF24)';
// true: #15803D on #FFF ≈ 4.7:1 · #4ADE80 on #1C1917 ≈ 9.4:1
const EASE_TRUE = 'light-dark(#15803D, #4ADE80)';
// loose: #1D4ED8 on #FFF ≈ 6.3:1 · #93C5FD on #1C1917 ≈ 8.4:1
const EASE_LOOSE = 'light-dark(#1D4ED8, #93C5FD)';
// Interactive rest-state boundaries (size chips, steppers, unchecked size
// chip borders, bag size chips) — the amendment: NOT hairline tokens.
// #6E6B66 on #FFFFFF ≈ 5.1:1; #9A968F on #1C1917 ≈ 6.1:1 (both ≥3:1).
const CONTROL_BORDER = 'light-dark(#6E6B66, #9A968F)';
// Field-error text: #B42318 on #FFF ≈ 6.3:1; #FCA5A5 on #1C1917 ≈ 8.7:1.
const ERROR_TEXT = 'light-dark(#B42318, #FCA5A5)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Nav/tab chrome surface.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, always-on input focus
// ring, chip pulse (transform/opacity only), sheet slide-in, visually-hidden
// helper, and the reduced-motion guard that collapses every animation.
// ---------------------------------------------------------------------------

const SELVAGE_CSS = \`
.svg-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.svg-btn:disabled { cursor: default; }
.svg-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.svg-input:focus {
  box-shadow: inset 0 0 0 2px \${BRAND_ACCENT};
  outline: none;
}
.svg-anim { transition: transform 200ms ease, opacity 200ms ease; }
.svg-fade { transition: opacity 200ms ease; }
@keyframes svg-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.svg-sheet-in { animation: svg-sheet-in 200ms ease; }
@keyframes svg-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.svg-pulse { animation: svg-pulse 300ms ease; }
.svg-vh {
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
  .svg-anim, .svg-fade { transition: none; }
  .svg-sheet-in, .svg-pulse { animation: none; }
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
  // NAV BAR — 52px sticky top z20; compact 'Fit' title always visible (the
  // sanctioned always-on-hairline variant; no large-title row).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
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
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  brandMarkBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // FitScoreChip — 44×44 hit around a 28px pill (ring + 'Fit 78').
  fitScoreHit: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 999,
  },
  fitScorePill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  fitScoreText: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; optional trailing 13px caption.
  sectionHeaderRow: {
    margin: '20px 0 8px',
    paddingInlineStart: 32,
    paddingInlineEnd: 16,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sectionCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // TAPE CARD -----------------------------------------------------------
  tapeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  tapeTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  // 36px-tall 2-segment cm|in control — track radius 8 per spec.
  segTrack: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: 2,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    height: 32,
    paddingInline: 14,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // Tape row — [44 stepper][8][fluid window][8][44 stepper]; no inline
  // padding so window = 100% − 32 gutter − 88 steppers − 16 gaps (spec).
  tapeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 8,
    // Interactive boundary — CONTROL_BORDER (≥3:1 vs card), not hairline.
    border: \`1px solid \${CONTROL_BORDER}\`,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepBtnDisabled: {opacity: 0.35},
  tapeBlock: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  lensRow: {position: 'relative', height: 44, display: 'flex', justifyContent: 'center'},
  // Magnifier lens — 88×44 card hovering the center indicator.
  lens: {
    width: 88,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    gap: 2,
  },
  lensPrimary: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  lensSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 48px strip window — the role='slider' scrub surface.
  stripWindow: {
    position: 'relative',
    height: 48,
    overflow: 'hidden',
    touchAction: 'pan-y',
    cursor: 'ew-resize',
  },
  centerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    background: BRAND_ACCENT,
    zIndex: 2,
    pointerEvents: 'none',
  },
  // Missing-field chip row.
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 16px 16px'},
  addChip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 8,
    border: \`1px solid \${CONTROL_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // Inline shoulder formField (validation on blur, per inputControls).
  formWrap: {padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8},
  formLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  formRow: {display: 'flex', gap: 8},
  formInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  formInputError: {boxShadow: \`inset 0 0 0 2px \${ERROR_TEXT}\`},
  saveBtn: {
    height: 48,
    paddingInline: 20,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: ERROR_TEXT,
  },
  // SILHOUETTE CARD -------------------------------------------------------
  silCard: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  silWrap: {position: 'relative', width: '100%', maxWidth: 280},
  // Zone buttons — fixed 44px CSS hit height (survives SVG scaling to
  // 320px stages), centered on their % anchor; 56px anchor pitch keeps
  // ≥8px clearance between adjacent 44px targets (56 − 44 = 12 ✓).
  zoneBtn: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    height: 44,
    marginTop: -22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  zoneBand: {
    width: '100%',
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  legendRow: {display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center'},
  legendChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
  },
  legendDot: {width: 10, height: 10, borderRadius: 999, flexShrink: 0},
  // BRAND FIT LEDGER ------------------------------------------------------
  ledgerRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  ledgerText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  ledgerPrimaryRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  ledgerPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  updatedBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: BRAND_ACCENT,
    border: \`1px solid \${BRAND_ACCENT}\`,
    borderRadius: 999,
    padding: '0 6px',
    lineHeight: '15px',
    flexShrink: 0,
  },
  ledgerSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // Fixed 76px trailing block: 6×48 bar + 11px tabular % (color never the
  // sole encoding — the % prints beside the fill).
  ledgerTrailing: {
    width: 76,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  // Muted track is LEGAL here: passive track under a labeled brand fill.
  barTrack: {width: 48, height: 6, borderRadius: 999, background: 'var(--color-background-muted)'},
  barFill: {height: 6, borderRadius: 999, background: BRAND_ACCENT},
  pctText: {fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)'},
  ledgerHint: {fontSize: 11, fontWeight: 500, color: BRAND_ACCENT, whiteSpace: 'nowrap'},
  terminalCaption: {
    margin: '8px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow above the BagTray (amendment: NOT
  // shell-absolute while the shell scrolls; absolute only under scroll
  // lock). Height-0 sticky anchor + absolute pill inside.
  toastDock: {
    position: 'sticky',
    bottom: 152,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // While the sheet scroll-lock is active the dock re-anchors absolute
  // (bottom:152 z30 — z30 < z41, so it sits behind the open sheet; the
  // polite live region still announces. SR-first during modal, per spec).
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 152,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // BAG TRAY — 72px sticky bottom:64 z19 above the tabBar.
  bagTray: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  bagLabel: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, fontVariantNumeric: 'tabular-nums'},
  bagItem: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  bagThumb: {width: 48, height: 48, borderRadius: 12, flexShrink: 0},
  bagName: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 24px-tall size chip (44px hit via the surrounding 72px tray row —
  // display-only derived value; the interactive path is the brand sheet).
  sizeChip: {
    height: 24,
    minWidth: 28,
    paddingInline: 8,
    borderRadius: 999,
    border: \`1px solid \${CONTROL_BORDER}\`,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // Reduced-motion static encoding: brand border replaces the pulse.
  sizeChipChanged: {border: \`1px solid \${BRAND_ACCENT}\`, color: BRAND_ACCENT},
  // TAB BAR — exactly 64px, 4 tabs.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
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
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
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
    fontSize: 11,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    lineHeight: 1,
  },
  tabLabel: {fontSize: 11, fontWeight: 500},
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
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetSectionLabel: {
    margin: '16px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // PDP size chips — 36px, radius 8; recommended/override = brand fill.
  pdpChipRow: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  pdpChip: {
    height: 36,
    minWidth: 44,
    paddingInline: 12,
    borderRadius: 8,
    border: \`1px solid \${CONTROL_BORDER}\`,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
  },
  pdpChipOn: {
    background: BRAND_ACCENT,
    // #FFFFFF on #7C3AED ≈ 5.7:1 · #2E1065 on #C4B5FD ≈ 8.2:1.
    color: BRAND_FILL_TEXT,
    border: \`1px solid \${BRAND_ACCENT}\`,
  },
  // 44px size-chart utility rows.
  chartRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 8,
  },
  chartRowTarget: {background: BRAND_TINT_12},
  chartSize: {fontSize: 16, fontWeight: 500, width: 36, flexShrink: 0},
  chartRange: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recChip: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: BRAND_ACCENT,
    border: \`1px solid \${BRAND_ACCENT}\`,
    borderRadius: 999,
    padding: '1px 7px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  confBlock: {marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8},
  confTrack: {width: '100%', height: 6, borderRadius: 999, background: 'var(--color-background-muted)'},
  confFill: {height: 6, borderRadius: 999, background: BRAND_ACCENT},
  confCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  confHint: {fontSize: 13, fontWeight: 600, color: BRAND_ACCENT, fontVariantNumeric: 'tabular-nums'},
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
  doneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    border: \`1px solid \${CONTROL_BORDER}\`,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
  },
  // PLACEHOLDER TAB ROWS (Shop / Bag / You) — standard 44/72px rows so the
  // per-tab-persistence law has real screens to persist.
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  mediaRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  mediaThumb: {width: 48, height: 48, borderRadius: 12, flexShrink: 0},
  mediaText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  mediaPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mediaSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// CROSS-CHECK LEDGER (verified by hand): completeness 4/5 = 80% → ring
// sweep 288° = 0.80×360 ✓ · confidences 67+75+50+100+75+100 = 467, avg
// 467/6 = 77.83 → 'Fit 78' ✓ · waist 84/2.54 = 33.07 → 'W33' ✓ · chest
// 80/2.54 = 31.496 → '31.5' ✓ · 98→38.6, 101→39.8, 120→47.2 ✓ · shoulder
// 46 committed → all six 100, sum 600, avg 100, ring 360° ✓.
// NO SKELETON STATE: this surface has no fetch — the ledger renders
// complete from consts, so a skeleton would be undemonstrable theater
// (emptyAndSkeleton: skeletons only as user-reachable states).
// ---------------------------------------------------------------------------

type FieldKey = 'chestCm' | 'waistCm' | 'hipCm' | 'inseamCm' | 'shoulderCm';

interface Measurements {
  chestCm: number;
  waistCm: number;
  hipCm: number;
  inseamCm: number;
  shoulderCm: number | null;
}

const MEASUREMENTS: Measurements = {
  chestCm: 98,
  waistCm: 84,
  hipCm: 100,
  inseamCm: 78,
  shoulderCm: null, // the SHIPPING missing-field state (stress fixture 2)
};

const FIELD_KEYS: FieldKey[] = ['chestCm', 'waistCm', 'hipCm', 'inseamCm', 'shoulderCm'];
const FIELD_LABELS: Record<FieldKey, string> = {
  chestCm: 'Chest',
  waistCm: 'Waist',
  hipCm: 'Hip',
  inseamCm: 'Inseam',
  shoulderCm: 'Shoulder',
};

const CHEST_MIN = 80;
const CHEST_MAX = 120;
const PX_PER_CM = 16; // strip = (120−80)×16 = 640px
const SHOULDER_SUGGESTED = 46;

interface Band {
  size: string;
  min: number;
  max: number;
}

interface BrandChart {
  id: string;
  name: string;
  driver: 'chest' | 'waist';
  bands: Band[]; // contiguous, ascending
  fields: FieldKey[]; // fields this brand's chart uses
}

// Field & Loom ships the long Atelier name — the permanent 320px one-line
// ellipsis stress (stress fixture 3). Alpha sort still files it under 'F',
// so the conf-100 tie stays F&L above Rhode until justUpdated reorders.
const BRANDS: BrandChart[] = [
  {
    id: 'arno',
    name: 'Arno',
    driver: 'chest',
    bands: [
      {size: 'S', min: 88, max: 93},
      {size: 'M', min: 94, max: 99},
      {size: 'L', min: 100, max: 105},
      {size: 'XL', min: 106, max: 111},
    ],
    fields: ['chestCm', 'waistCm', 'shoulderCm'], // 2/3 measured = 67
  },
  {
    id: 'kessler',
    name: 'Kessler',
    driver: 'chest',
    bands: [
      {size: 'M', min: 92, max: 98},
      {size: 'L', min: 99, max: 104},
    ],
    fields: ['chestCm', 'waistCm', 'hipCm', 'shoulderCm'], // 3/4 = 75
  },
  {
    id: 'rhode',
    name: 'Rhode',
    driver: 'chest',
    bands: [
      {size: 'M', min: 95, max: 98},
      {size: 'L', min: 99, max: 103},
    ],
    fields: ['chestCm', 'waistCm', 'hipCm'], // 3/3 = 100
  },
  {
    id: 'duval',
    name: 'Duval',
    driver: 'chest',
    bands: [
      {size: 'M', min: 90, max: 95},
      {size: 'L', min: 96, max: 102},
    ],
    fields: ['chestCm', 'waistCm', 'inseamCm', 'shoulderCm'], // 3/4 = 75
  },
  {
    id: 'motoyama',
    name: 'Motoyama',
    driver: 'chest',
    bands: [
      {size: 'M', min: 97, max: 102},
      {size: 'L', min: 103, max: 108},
    ],
    fields: ['chestCm', 'shoulderCm'], // 1/2 = 50
  },
  {
    id: 'fieldloom',
    name: 'Field & Loom Atelier Nagano — Heavyweight',
    driver: 'waist',
    bands: [
      {size: 'W32', min: 79, max: 82},
      {size: 'W33', min: 83, max: 86}, // waist 84 ∈ W33 ✓
      {size: 'W34', min: 87, max: 90},
    ],
    fields: ['waistCm', 'hipCm', 'inseamCm'], // 3/3 = 100
  },
];

const BRAND_BY_ID = Object.fromEntries(BRANDS.map(brand => [brand.id, brand])) as Record<string, BrandChart>;

// ARNO GARMENT SPEC (silhouette ease source). Spec sizes M/L; S and XL are
// consistent −5/+5 extrapolations so the out-of-range clamp (stress
// fixture 1) still has a garment to measure against.
type GarmentZone = 'chest' | 'waist' | 'hip';
const ARNO_GARMENT: Record<string, Record<GarmentZone, number>> = {
  S: {chest: 97, waist: 91, hip: 101},
  M: {chest: 102, waist: 96, hip: 106}, // ease at body 98: 4 true · 12 loose · 6 true ✓
  L: {chest: 107, waist: 101, hip: 111},
  XL: {chest: 112, waist: 106, hip: 116},
};

interface BagItem {
  id: string;
  name: string;
  price: string;
  brandId: string;
}

const BAG: BagItem[] = [
  {id: 'bag-1', name: 'Arno Selvedge Trucker', price: '$148', brandId: 'arno'},
  {id: 'bag-2', name: 'Kessler Merino Crew', price: '$96', brandId: 'kessler'},
];

// Shop-tab fixture rows (lightweight placeholder screen; rows open the
// same brand sheets so per-tab persistence has a real surface).
const SHOP_ITEMS = [
  {id: 'shop-1', name: 'Arno Selvedge Trucker', price: '$148', brandId: 'arno'},
  {id: 'shop-2', name: 'Kessler Merino Crew', price: '$96', brandId: 'kessler'},
  {id: 'shop-3', name: 'Rhode Field Tee', price: '$42', brandId: 'rhode'},
  {id: 'shop-4', name: 'Motoyama Chore Coat', price: '$210', brandId: 'motoyama'},
];

// Selvage's own chart — the 'vs Selvage M' reference; wide M band so the
// 98→101 scrub keeps the reference stable while brand verdicts flip.
const SELVAGE_BANDS: Band[] = [
  {size: 'XS', min: 76, max: 85},
  {size: 'S', min: 86, max: 93},
  {size: 'M', min: 94, max: 103},
  {size: 'L', min: 104, max: 112},
  {size: 'XL', min: 113, max: 120},
];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — no verdict state is ever stored; everything below is
// a pure function of the five measurement fields.
// ---------------------------------------------------------------------------

/** cm → inches string, 1 decimal (98→'38.6', 101→'39.8', 80→'31.5'). */
function toInStr(cm: number): string {
  return (cm / 2.54).toFixed(1);
}

/** cm → '98.0'-style string. */
function fmtCm(cm: number): string {
  return cm.toFixed(1);
}

type BandHit =
  | {kind: 'in'; band: Band}
  | {kind: 'below'; band: Band}
  | {kind: 'above'; band: Band};

/**
 * Band lookup with half-cm detents: the first band whose max ≥ value wins
 * (bands are contiguous on the integer grid, so 98.5 resolves to the next
 * band up — Kessler/Rhode flip crossing 98, Arno crossing 99; the spec's
 * integer boundary notes 98|99 and 99|100 are this same law ✓). Below the
 * first min → 'below' (never crash: stress fixture 1); past the last max →
 * 'above'.
 */
function bandFor(bands: Band[], value: number): BandHit {
  if (value < bands[0].min) return {kind: 'below', band: bands[0]};
  for (const band of bands) {
    if (value <= band.max) return {kind: 'in', band};
  }
  return {kind: 'above', band: bands[bands.length - 1]};
}

function selvageSizeFor(chestCm: number): string {
  return bandFor(SELVAGE_BANDS, chestCm).band.size;
}

interface Verdict {
  /** Clamped size label — always a real size (nearest band when out of range). */
  size: string;
  /** True only when the driver value sits inside a band. */
  inRange: boolean;
  /** Ledger secondary line. */
  text: string;
}

/** verdictFor — returns an out-of-range STRING, never crashes (stress 1). */
function verdictFor(brand: BrandChart, m: Measurements): Verdict {
  if (brand.driver === 'waist') {
    const hit = bandFor(brand.bands, m.waistCm);
    // 'W33 · True' — waist-driven; sizes not units, unaffected by cm|in.
    return {size: hit.band.size, inRange: hit.kind === 'in', text: \`\${hit.band.size} · True\`};
  }
  const hit = bandFor(brand.bands, m.chestCm);
  if (hit.kind === 'below') {
    return {
      size: hit.band.size,
      inRange: false,
      text: \`Below \${brand.name} \${hit.band.size} (\${hit.band.min}–\${hit.band.max})\`,
    };
  }
  if (hit.kind === 'above') {
    return {size: hit.band.size, inRange: false, text: \`Above \${brand.name} \${hit.band.size}\`};
  }
  return {
    size: hit.band.size,
    inRange: true,
    text: \`Selvage \${selvageSizeFor(m.chestCm)} ≈ \${brand.name} \${hit.band.size}\`,
  };
}

/** confidenceFor = round(100 × measuredUsed / used) — null-safe (stress 2). */
function confidenceFor(brand: BrandChart, m: Measurements): number {
  const used = brand.fields.length;
  const measured = brand.fields.filter(field => m[field] != null).length;
  return Math.round((100 * measured) / used);
}

/** Nav 'Fit N' = round(avg confidence): 467/6 = 77.83 → 78 ✓; 600/6 = 100 ✓. */
function fitScoreFor(m: Measurements): number {
  const sum = BRANDS.reduce((acc, brand) => acc + confidenceFor(brand, m), 0);
  return Math.round(sum / BRANDS.length);
}

/** Completeness 0..1 — 4/5 = 0.8 shipping → 288° ring sweep ✓. */
function completenessFor(m: Measurements): number {
  return FIELD_KEYS.filter(key => m[key] != null).length / FIELD_KEYS.length;
}

/**
 * Ease band vs the Arno garment: ease = garmentCm − bodyCm; ≤2 tight,
 * ≥7 loose, else true (half-cm values between 2 and 3 read as true —
 * the generous side of the spec's 3–6 'true' band).
 */
type EaseKind = 'tight' | 'true' | 'loose';
function easeBandOf(ease: number): EaseKind {
  if (ease <= 2) return 'tight';
  if (ease >= 7) return 'loose';
  return 'true';
}

const EASE_COLOR: Record<EaseKind, string> = {
  tight: EASE_TIGHT,
  true: EASE_TRUE,
  loose: EASE_LOOSE,
};
const EASE_LABEL: Record<EaseKind, string> = {tight: 'Tight', true: 'True', loose: 'Loose'};

/**
 * Ledger sort law: confidence desc → justUpdated first → alphabetical.
 * Tie snapshots (stress fixture 4): initial [Field & Loom 100, Rhode 100,
 * Duval 75, Kessler 75, Arno 67, Motoyama 50] (alpha breaks both ties);
 * after the 98→101 scrub flags {arno, kessler, rhode}: [Rhode, Field &
 * Loom, Kessler, Duval, Arno, Motoyama] — Rhode above F&L, Kessler above
 * Duval ✓. Deterministic across re-renders: every comparator leg is total.
 */
function orderedBrands(m: Measurements, justUpdated: string[]): BrandChart[] {
  const flagged = new Set(justUpdated);
  return [...BRANDS].sort((a, b) => {
    const confDiff = confidenceFor(b, m) - confidenceFor(a, m);
    if (confDiff !== 0) return confDiff;
    const flagDiff = Number(flagged.has(b.id)) - Number(flagged.has(a.id));
    if (flagDiff !== 0) return flagDiff;
    return a.name.localeCompare(b.name);
  });
}

/** Deterministic id-derived gradient (no network media, no randomness). */
function thumbGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  const h1 = hash;
  const h2 = (hash + 46) % 360;
  return \`linear-gradient(135deg, hsl(\${h1} 42% 62%), hsl(\${h2} 48% 44%))\`;
}

/** Quantize to the 0.5 cm detent grid, clamped to the tape bounds. */
function snapCm(value: number): number {
  return Math.min(CHEST_MAX, Math.max(CHEST_MIN, Math.round(value * 2) / 2));
}

// ---------------------------------------------------------------------------
// HOOKS & FOCUS UTILITIES
// ---------------------------------------------------------------------------

/**
 * Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a wider window, so only a ResizeObserver on the wrap
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

/** Sheet focus trap — Tab cycles within; Escape handled by the page. */
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

/** Nearest scrollable ancestor (the demo's .preview-wrap owns the page scroll). */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const {overflowY} = getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * FLIP re-sort for the ledger — captures row tops, applies the inverted
 * translate, then transitions to identity over 200ms. Instant under
 * reduced motion (rows just appear in their new order).
 */
function useLedgerFlip(orderKey: string, reducedMotion: boolean) {
  const rowElsRef = useRef(new Map<string, HTMLDivElement>());
  const prevTopsRef = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const nextTops = new Map<string, number>();
    rowElsRef.current.forEach((el, id) => {
      nextTops.set(id, el.getBoundingClientRect().top);
    });
    if (!reducedMotion) {
      nextTops.forEach((top, id) => {
        const prev = prevTopsRef.current.get(id);
        const el = rowElsRef.current.get(id);
        if (prev != null && el != null && prev !== top) {
          el.style.transition = 'none';
          el.style.transform = \`translateY(\${prev - top}px)\`;
          requestAnimationFrame(() => {
            el.style.transition = 'transform 200ms ease';
            el.style.transform = '';
          });
        }
      });
    }
    prevTopsRef.current = nextTops;
  }, [orderKey, reducedMotion]);
  const registerRow = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      if (el == null) rowElsRef.current.delete(id);
      else rowElsRef.current.set(id, el);
    };
  }, []);
  return registerRow;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px tape-loop lowercase-s glyph in a 44×44 button.
// ---------------------------------------------------------------------------

function SelvageMark() {
  return (
    <span style={styles.brandMarkBox}>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* A measuring tape looped into a lowercase s. */}
        <path
          d="M17 7.2c0-1.8-2.2-3-5-3s-5 1.2-5 3 2.2 2.6 5 3.4c2.8.8 5 1.6 5 3.4s-2.2 3-5 3-5-1.2-5-3"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path d="M15.4 5.2v1.6M12 4.4v1.6M8.6 5.4V7" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// FIT SCORE CHIP — 20px completeness ring (80% = 288° sweep via
// dasharray on C = 2π×8 ≈ 50.27) + 'Fit 78' 11px/600 tabular.
// ---------------------------------------------------------------------------

interface FitScoreChipProps {
  score: number;
  completeness: number; // 0..1
  onTap: () => void;
}

function FitScoreChip({score, completeness, onTap}: FitScoreChipProps) {
  const circumference = 2 * Math.PI * 8;
  return (
    <button
      type="button"
      className="svg-btn svg-focusable"
      style={styles.fitScoreHit}
      aria-label={\`Fit score \${score}, profile \${Math.round(completeness * 100)}% complete — go to missing measurement\`}
      onClick={onTap}>
      <span style={styles.fitScorePill}>
        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx={10} cy={10} r={8} stroke="var(--color-border)" strokeWidth={2.5} />
          <circle
            cx={10}
            cy={10}
            r={8}
            stroke={BRAND_ACCENT}
            strokeWidth={2.5}
            strokeLinecap={completeness >= 1 ? 'butt' : 'round'}
            strokeDasharray={\`\${completeness * circumference} \${circumference}\`}
            transform="rotate(-90 10 10)"
            className="svg-fade"
          />
        </svg>
        {/* 11px on the card surface uses --color-text-primary (a11y plan). */}
        <span style={styles.fitScoreText}>Fit {score}</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// MEASURE TAPE DIAL — SVG tape 80–120cm at 16px/cm (640px strip) panning
// inside a fluid window; the window is the role='slider'. Ticks: minor
// every 0.5cm (8px pitch, 10px, --color-border — passive marks), medium
// every 1cm (16px), major every 5cm (24px + 11px/500 tabular label).
// Fixed 2px BRAND_ACCENT center indicator; 88×44 magnifier lens above.
// Non-gesture path: flanking 44×44 ∓/± steppers + ArrowLeft/Right ±0.5,
// Home/End to bounds on the slider itself.
// ---------------------------------------------------------------------------

interface MeasureTapeDialProps {
  chestCm: number;
  unit: 'cm' | 'in';
  reducedMotion: boolean;
  sliderRef: RefObject<HTMLDivElement | null>;
  onScrub: (nextCm: number) => void; // continuous 0.5 detents
  onCommit: () => void; // pointerup — toast beat
  onStep: (deltaCm: number) => void; // stepper press (toast per press)
  onKeyStep: (deltaCm: number | 'home' | 'end') => void; // silent (slider announces)
}

function MeasureTapeDial({chestCm, unit, reducedMotion, sliderRef, onScrub, onCommit, onStep, onKeyStep}: MeasureTapeDialProps) {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const windowWidth = useElementWidth(windowRef);
  const dragRef = useRef<{startX: number; startCm: number; moved: boolean} | null>(null);
  const [dragging, setDragging] = useState(false);

  const stripWidth = (CHEST_MAX - CHEST_MIN) * PX_PER_CM; // 640
  const translateX = windowWidth / 2 - (chestCm - CHEST_MIN) * PX_PER_CM;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {startX: event.clientX, startCm: chestCm, moved: false};
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 4) drag.moved = true;
    // Dragging the tape right moves the value DOWN (the strip follows the
    // finger); quantized to 0.5 detents live.
    const next = snapCm(drag.startCm - dx / PX_PER_CM);
    if (next !== chestCm) onScrub(next);
  };
  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (drag?.moved) onCommit();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onKeyStep(-0.5);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onKeyStep(0.5);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onKeyStep('home');
    } else if (event.key === 'End') {
      event.preventDefault();
      onKeyStep('end');
    }
  };

  // Tick geometry — one <line> per 0.5cm; labels on multiples of 5. In
  // inch mode every major label converts (80→31.5, 100→39.4, 120→47.2 ✓)
  // while the detents stay 0.5cm-backed.
  const ticks: ReactNode[] = [];
  for (let value = CHEST_MIN; value <= CHEST_MAX; value += 0.5) {
    const x = (value - CHEST_MIN) * PX_PER_CM;
    const isMajor = value % 5 === 0;
    const isMedium = !isMajor && value % 1 === 0;
    const height = isMajor ? 24 : isMedium ? 16 : 10;
    ticks.push(
      <line
        key={\`t-\${value}\`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        // Minor ticks are passive marks (--color-border legal); medium and
        // major carry the readable scale → text-secondary (≥4.5:1).
        stroke={isMajor || isMedium ? 'var(--color-text-secondary)' : 'var(--color-border)'}
        strokeWidth={isMajor ? 2 : 1}
      />,
    );
    if (isMajor) {
      ticks.push(
        <text
          key={\`l-\${value}\`}
          x={x}
          y={42}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          style={{fontVariantNumeric: 'tabular-nums'}}
          fill="var(--color-text-secondary)">
          {unit === 'cm' ? value : toInStr(value)}
        </text>,
      );
    }
  }

  const cmStr = fmtCm(chestCm);
  const inStr = toInStr(chestCm);
  const atMin = chestCm <= CHEST_MIN;
  const atMax = chestCm >= CHEST_MAX;

  return (
    <div style={styles.tapeRow}>
      <button
        type="button"
        className="svg-btn svg-focusable"
        style={{...styles.stepBtn, ...(atMin ? styles.stepBtnDisabled : null)}}
        aria-label="Decrease chest measurement"
        disabled={atMin}
        onClick={() => onStep(-0.5)}>
        <Icon icon={MinusIcon} size="md" color="inherit" />
      </button>
      <div style={styles.tapeBlock}>
        <div style={styles.lensRow}>
          <div style={styles.lens} aria-hidden>
            <span style={styles.lensPrimary}>{unit === 'cm' ? \`\${cmStr} cm\` : \`\${inStr} in\`}</span>
            <span style={styles.lensSecondary}>{unit === 'cm' ? \`\${inStr} in\` : \`\${cmStr} cm\`}</span>
          </div>
        </div>
        <div
          ref={node => {
            windowRef.current = node;
            sliderRef.current = node;
          }}
          role="slider"
          tabIndex={0}
          className="svg-focusable"
          aria-label="Chest measurement"
          aria-valuemin={CHEST_MIN}
          aria-valuemax={CHEST_MAX}
          aria-valuenow={chestCm}
          aria-valuetext={\`\${cmStr} centimeters, \${inStr} inches\`}
          style={styles.stripWindow}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}>
          <span style={styles.centerLine} aria-hidden />
          <svg
            width={stripWidth}
            height={48}
            viewBox={\`0 0 \${stripWidth} 48\`}
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: \`translateX(\${translateX}px)\`,
              transition: dragging || reducedMotion ? 'none' : 'transform 160ms ease',
            }}>
            {ticks}
          </svg>
        </div>
      </div>
      <button
        type="button"
        className="svg-btn svg-focusable"
        style={{...styles.stepBtn, ...(atMax ? styles.stepBtnDisabled : null)}}
        aria-label="Increase chest measurement"
        disabled={atMax}
        onClick={() => onStep(0.5)}>
        <Icon icon={PlusIcon} size="md" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SILHOUETTE FIT MAP — 240px stylized front-view SVG (strokes on
// --color-text-primary; there is no --color-text token). Four real
// <button> zones (48px CSS hits, unscaled) tinted by ease band vs the
// Bag's Arno Trucker at its current recommendation. Inseam renders
// --color-background-muted + '—' — LEGAL muted use: passive/no-data,
// not an interactive boundary encoding.
// ---------------------------------------------------------------------------

type ZoneId = 'chest' | 'waist' | 'hip' | 'inseam';

interface ZoneInfo {
  id: ZoneId;
  topPct: number; // anchor within the 240px silhouette box
  ease: number | null; // null = no data (inseam on a jacket)
  kind: EaseKind | null;
}

interface SilhouetteFitMapProps {
  zones: ZoneInfo[];
  onZoneTap: (zone: ZoneId, opener: HTMLElement) => void;
}

function SilhouetteFitMap({zones, onZoneTap}: SilhouetteFitMapProps) {
  return (
    <div style={styles.silCard}>
      <div style={styles.silWrap}>
        <svg width="100%" viewBox="0 0 280 240" fill="none" aria-hidden style={{display: 'block'}}>
          {/* Stylized front-view figure — head, shoulders, torso, legs. */}
          <circle cx={140} cy={22} r={14} stroke="var(--color-text-primary)" strokeWidth={2} />
          <path
            d="M110 52c8-8 52-8 60 0l14 10c6 5 8 12 8 20l-4 34h-14l-2-22-4 56c0 6-2 10-2 16l-6 66h-14l-4-62h-4l-4 62h-14l-6-66c0-6-2-10-2-16l-4-56-2 22H92l-4-34c0-8 2-15 8-20l14-10Z"
            stroke="var(--color-text-primary)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="M88 118l-6 22M192 118l6 22" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" />
        </svg>
        {zones.map(zone => {
          const isNoData = zone.kind == null;
          const color = isNoData ? 'var(--color-text-secondary)' : EASE_COLOR[zone.kind as EaseKind];
          const label = isNoData
            ? \`\${zone.id.toUpperCase()} · —\`
            : \`\${zone.id.toUpperCase()} · \${zone.ease} CM\`;
          const ariaLabel = isNoData
            ? 'Inseam: no data — this garment has no inseam'
            : \`\${FIELD_LABELS[\`\${zone.id}Cm\` as FieldKey]}: \${EASE_LABEL[zone.kind as EaseKind].toLowerCase()} fit, \${zone.ease} cm ease\`;
          return (
            <button
              key={zone.id}
              type="button"
              className="svg-btn svg-focusable"
              style={{...styles.zoneBtn, top: \`\${zone.topPct}%\`}}
              aria-label={ariaLabel}
              onClick={event => onZoneTap(zone.id, event.currentTarget)}>
              <span
                style={{
                  ...styles.zoneBand,
                  ...(isNoData
                    ? {background: 'var(--color-background-muted)', border: '1px dashed var(--color-border)'}
                    : {
                        // Wash is garnish; the ≥3:1 encoding is the solid
                        // border + label (pairs documented at declaration).
                        background: \`color-mix(in srgb, \${color} 14%, transparent)\`,
                        border: \`1.5px solid \${color}\`,
                      }),
                }}>
                <span style={{...styles.zoneLabel, color}}>{label}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div style={styles.legendRow}>
        {(['tight', 'true', 'loose'] as EaseKind[]).map(kind => (
          <span key={kind} style={styles.legendChip}>
            <span style={{...styles.legendDot, background: EASE_COLOR[kind]}} aria-hidden />
            {EASE_LABEL[kind]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — two detents (medium 55% / large calc(100% − 56px)),
// 36×5 grabber inside a real 'Resize sheet' button, 52px header with
// 44×44 X, focus-trapped dialog; content is the one legal inner scroller.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, bodyRef, footer, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="svg-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="svg-btn svg-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="svg-btn svg-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div ref={bodyRef} style={styles.sheetBody}>
        {children}
      </div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — SINGLE OWNER: const [fit, setFit] = useState(...); update(id,
// patch) is one merge. Verdicts, confidences, ease bands, bag sizes, and
// the nav score are NEVER stored — all pure functions of the five
// measurement fields (verdictFor / confidenceFor / fitScoreFor).
// ---------------------------------------------------------------------------

type TabId = 'shop' | 'fit' | 'bag' | 'you';

const TABS: {id: TabId; label: string; icon: typeof RulerIcon}[] = [
  {id: 'shop', label: 'Shop', icon: ShirtIcon},
  {id: 'fit', label: 'Fit', icon: RulerIcon},
  {id: 'bag', label: 'Bag', icon: ShoppingBagIcon},
  {id: 'you', label: 'You', icon: UserRoundIcon},
];

interface UiState {
  unit: 'cm' | 'in';
  tab: TabId;
  sheetBrandId: string | null;
  sheetDetent: 'medium' | 'large';
  sheetTargetZone: ZoneId | null;
  shoulderFormOpen: boolean;
  shoulderDraft: string;
  shoulderError: string | null;
  // Manual PDP override wins until the next tape change clears it.
  overrides: Record<string, string>;
  justUpdated: string[]; // brands whose verdict flipped this gesture
  changedBags: string[]; // bag items whose chip changed this gesture
  pulseSeq: number;
  toast: {seq: number; text: string} | null;
}

interface FitProfile {
  measurements: Measurements;
  ui: UiState;
}

const INITIAL_FIT: FitProfile = {
  measurements: MEASUREMENTS,
  ui: {
    unit: 'cm',
    tab: 'fit',
    sheetBrandId: null,
    sheetDetent: 'medium',
    sheetTargetZone: null,
    shoulderFormOpen: false,
    shoulderDraft: '',
    shoulderError: null,
    overrides: {},
    justUpdated: [],
    changedBags: [],
    pulseSeq: 0,
    toast: null,
  },
};

/** '3' / '3.5' ease formatting. */
function fmtEase(ease: number): string {
  return Number.isInteger(ease) ? String(ease) : ease.toFixed(1);
}

export default function MobileSizeFitProfileTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [fit, setFit] = useState<FitProfile>(INITIAL_FIT);
  const update = useCallback(
    <K extends keyof FitProfile>(id: K, patch: Partial<FitProfile[K]>) => {
      setFit(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  const m = fit.measurements;
  const ui = fit.ui;

  // Focus plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetBodyRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const addChipRef = useRef<HTMLButtonElement | null>(null);
  const shoulderInputRef = useRef<HTMLInputElement | null>(null);
  const garmentRowRefs = useRef(new Map<ZoneId, HTMLDivElement>());
  const scrollByTabRef = useRef<Record<TabId, number>>({shop: 0, fit: 0, bag: 0, you: 0});
  const scrubBaselineRef = useRef<{verdicts: Record<string, string>; bagSizes: Record<string, string>} | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — all pure; nothing below is stored.
  const score = fitScoreFor(m);
  const completeness = completenessFor(m);
  const measuredCount = FIELD_KEYS.filter(key => m[key] != null).length;
  const verdicts = Object.fromEntries(BRANDS.map(brand => [brand.id, verdictFor(brand, m)]));
  const bagSizes = Object.fromEntries(
    BAG.map(item => [item.id, ui.overrides[item.id] ?? verdicts[item.brandId].size]),
  );
  const ordered = orderedBrands(m, ui.justUpdated);
  const orderKey = ordered.map(brand => brand.id).join('|');
  const registerLedgerRow = useLedgerFlip(orderKey, reducedMotion);

  // Silhouette ease vs the Bag's Arno Trucker at its EFFECTIVE size
  // (override-aware). Garment clamps to the nearest real size when the
  // verdict is out of range, so ease never crashes (stress fixture 1).
  const arnoSize = bagSizes['bag-1'];
  const garment = ARNO_GARMENT[arnoSize] ?? ARNO_GARMENT.M;
  const chestEase = Number(fmtEase(garment.chest - m.chestCm));
  const waistEase = Number(fmtEase(garment.waist - m.waistCm));
  const hipEase = Number(fmtEase(garment.hip - m.hipCm));
  const zones: ZoneInfo[] = [
    {id: 'chest', topPct: 26, ease: chestEase, kind: easeBandOf(chestEase)},
    {id: 'waist', topPct: 49, ease: waistEase, kind: easeBandOf(waistEase)},
    {id: 'hip', topPct: 72.5, ease: hipEase, kind: easeBandOf(hipEase)},
    // Jacket has no inseam — muted no-data zone (legal passive muted use).
    {id: 'inseam', topPct: 95, ease: null, kind: null},
  ];

  const toastPatch = (text: string) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text}};
  };

  // TAPE CONSEQUENCE CHAIN ---------------------------------------------------
  // One chest write re-derives lens, silhouette, ledger (flip diff vs the
  // gesture baseline), and bag chips in a single render; overrides clear.

  const diffVsBaseline = (nextM: Measurements, baseline: {verdicts: Record<string, string>; bagSizes: Record<string, string>}) => {
    const flipped = BRANDS.filter(brand => verdictFor(brand, nextM).text !== baseline.verdicts[brand.id]).map(b => b.id);
    const changed = BAG.filter(item => verdictFor(BRAND_BY_ID[item.brandId], nextM).size !== baseline.bagSizes[item.id]).map(
      i => i.id,
    );
    return {flipped, changed};
  };

  const snapshotBaseline = () => ({
    verdicts: Object.fromEntries(BRANDS.map(brand => [brand.id, verdicts[brand.id].text])),
    bagSizes: {...bagSizes},
  });

  const applyChest = (nextCm: number, announce: 'toast' | 'silent') => {
    setFit(prev => {
      if (scrubBaselineRef.current == null) {
        scrubBaselineRef.current = {
          verdicts: Object.fromEntries(BRANDS.map(brand => [brand.id, verdictFor(brand, prev.measurements).text])),
          bagSizes: Object.fromEntries(
            BAG.map(item => [
              item.id,
              prev.ui.overrides[item.id] ?? verdictFor(BRAND_BY_ID[item.brandId], prev.measurements).size,
            ]),
          ),
        };
      }
      const nextM = {...prev.measurements, chestCm: nextCm};
      const {flipped, changed} = diffVsBaseline(nextM, scrubBaselineRef.current);
      const pulseBump = changed.length !== prev.ui.changedBags.length;
      const toast =
        announce === 'toast'
          ? toastPatch(
              flipped.length + changed.length > 0
                ? \`Sizes updated · \${flipped.length} brand\${flipped.length === 1 ? '' : 's'}, \${changed.length} bag item\${changed.length === 1 ? '' : 's'}\`
                : \`Chest \${fmtCm(nextCm)} cm\`,
            )
          : null;
      return {
        measurements: nextM,
        ui: {
          ...prev.ui,
          overrides: {}, // tape change clears manual overrides (spec law)
          justUpdated: flipped,
          changedBags: changed,
          pulseSeq: pulseBump ? prev.ui.pulseSeq + 1 : prev.ui.pulseSeq,
          ...(toast ?? {}),
        },
      };
    });
    if (announce === 'toast') scrubBaselineRef.current = null;
  };

  const onScrub = (nextCm: number) => applyChest(nextCm, 'silent');
  const onScrubCommit = () => {
    setFit(prev => {
      const n = prev.ui.justUpdated.length;
      const c = prev.ui.changedBags.length;
      const text =
        n + c > 0
          ? \`Sizes updated · \${n} brand\${n === 1 ? '' : 's'}, \${c} bag item\${c === 1 ? '' : 's'}\`
          : \`Chest \${fmtCm(prev.measurements.chestCm)} cm\`;
      return {...prev, ui: {...prev.ui, ...toastPatch(text)}};
    });
    scrubBaselineRef.current = null;
  };
  const onStep = (deltaCm: number) => {
    scrubBaselineRef.current = snapshotBaseline();
    applyChest(snapCm(m.chestCm + deltaCm), 'toast');
  };
  // Keyboard on the slider: silent for the live region — the slider's own
  // aria-valuetext announces per press (a11y: no per-keystroke toasts).
  const onKeyStep = (delta: number | 'home' | 'end') => {
    scrubBaselineRef.current = snapshotBaseline();
    const next = delta === 'home' ? CHEST_MIN : delta === 'end' ? CHEST_MAX : snapCm(m.chestCm + delta);
    applyChest(next, 'silent');
    scrubBaselineRef.current = null;
  };

  // SHEET LIFECYCLE ------------------------------------------------------

  const openSheet = (brandId: string, opener: HTMLElement, targetZone: ZoneId | null = null) => {
    sheetOpenerRef.current = opener;
    update('ui', {
      sheetBrandId: brandId,
      sheetDetent: 'medium',
      sheetTargetZone: targetZone,
      justUpdated: [],
      changedBags: [],
    });
  };
  const closeSheet = () => {
    update('ui', {sheetBrandId: null, sheetTargetZone: null});
    sheetOpenerRef.current?.focus();
  };

  // Focus into the opening sheet with preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (foundations amendment).
  useEffect(() => {
    if (ui.sheetBrandId != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
      // Zone taps land on that measurement's garment row (inner scroller
      // only — never the page).
      const target = ui.sheetTargetZone;
      if (target != null) {
        const row = garmentRowRefs.current.get(target);
        const body = sheetBodyRef.current;
        if (row != null && body != null) {
          body.scrollTop = Math.max(0, row.offsetTop - 56);
        }
      }
    }
  }, [ui.sheetBrandId, ui.sheetTargetZone]);

  // Escape closes the topmost overlay (the sheet is the only overlay).
  useEffect(() => {
    if (ui.sheetBrandId == null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.sheetBrandId]);

  // PDP override — wins until the next tape change (which clears it).
  const overrideBagSize = (item: BagItem, size: string) => {
    setFit(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        overrides: {...prev.ui.overrides, [item.id]: size},
        changedBags: [item.id],
        pulseSeq: prev.ui.pulseSeq + 1,
        ...toastPatch(\`\${item.name} set to size \${size}\`),
      },
    }));
  };

  // SHOULDER FORM — inline formField; validation on blur (30–60 cm).
  const openShoulderForm = () => {
    update('ui', {shoulderFormOpen: true, justUpdated: [], changedBags: []});
    requestAnimationFrame(() => shoulderInputRef.current?.focus());
  };
  const validateShoulder = (raw: string): string | null => {
    const value = Number(raw);
    if (raw.trim() === '' || Number.isNaN(value) || value < 30 || value > 60) return 'Enter 30–60 cm';
    return null;
  };
  const commitShoulder = () => {
    const error = validateShoulder(ui.shoulderDraft);
    if (error != null) {
      update('ui', {shoulderError: error});
      shoulderInputRef.current?.focus();
      return;
    }
    const value = Math.round(Number(ui.shoulderDraft) * 2) / 2;
    setFit(prev => {
      const nextM = {...prev.measurements, shoulderCm: value};
      // With shoulder 46: every confidence 100, sum 600, avg 100, ring
      // closes to 360° — all aggregates re-derive, none hand-typed ✓.
      return {
        measurements: nextM,
        ui: {
          ...prev.ui,
          shoulderFormOpen: false,
          shoulderDraft: '',
          shoulderError: null,
          ...toastPatch(\`Shoulder added · Fit \${fitScoreFor(nextM)}\`),
        },
      };
    });
  };

  // FitScoreChip → scroll to and focus the missing-field affordance.
  const onFitScoreTap = () => {
    if (m.shoulderCm == null) {
      if (ui.tab !== 'fit') selectTab('fit');
      if (!ui.shoulderFormOpen) {
        update('ui', {shoulderFormOpen: true});
      }
      requestAnimationFrame(() => {
        shoulderInputRef.current?.scrollIntoView({block: 'center', behavior: reducedMotion ? 'auto' : 'smooth'});
        shoulderInputRef.current?.focus({preventScroll: true});
      });
    } else {
      sliderRef.current?.scrollIntoView({block: 'center', behavior: reducedMotion ? 'auto' : 'smooth'});
      sliderRef.current?.focus({preventScroll: true});
    }
  };

  // TABS — per-tab state persists (scrollTop keyed by tab id); overlays
  // close on switch; re-tapping the active tab scrolls to top (the one
  // legal reset). chestCm is global by design.
  const selectTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === ui.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      else window.scrollTo(0, 0);
      return;
    }
    if (scroller != null) scrollByTabRef.current[ui.tab] = scroller.scrollTop;
    update('ui', {tab, sheetBrandId: null, sheetTargetZone: null, justUpdated: [], changedBags: []});
    requestAnimationFrame(() => {
      const nextScroller = getScrollParent(shellRef.current);
      if (nextScroller != null) nextScroller.scrollTop = scrollByTabRef.current[tab];
    });
  };
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === ui.tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    selectTab(next.id);
  };

  const toggleUnit = (unit: 'cm' | 'in') => {
    if (unit === ui.unit) return;
    // Pure display transform — state stays cm; detents stay 0.5cm-backed.
    update('ui', {unit, justUpdated: [], changedBags: []});
  };

  const fmtByUnit = (cm: number | null): string => {
    if (cm == null) return '—';
    return ui.unit === 'cm' ? \`\${fmtCm(cm)} cm\` : \`\${toInStr(cm)} in\`;
  };

  // SHEET CONTENT (derived per open brand) -----------------------------------
  const sheetBrand = ui.sheetBrandId != null ? BRAND_BY_ID[ui.sheetBrandId] : null;
  const sheetBagItem = sheetBrand != null ? BAG.find(item => item.brandId === sheetBrand.id) ?? null : null;
  const sheetVerdict = sheetBrand != null ? verdicts[sheetBrand.id] : null;
  const sheetConf = sheetBrand != null ? confidenceFor(sheetBrand, m) : 0;
  const sheetUsed = sheetBrand != null ? sheetBrand.fields.length : 0;
  const sheetMeasured = sheetBrand != null ? sheetBrand.fields.filter(field => m[field] != null).length : 0;
  const sheetNeedsShoulder = sheetBrand != null && sheetBrand.fields.includes('shoulderCm') && m.shoulderCm == null;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetBrandId != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const tabTitle = TABS.find(tab => tab.id === ui.tab)?.label ?? 'Fit';

  // SCREENS ------------------------------------------------------------------

  const fitScreen = (
    <>
      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Your measurements</h2>
      </div>
      <section style={styles.listCard} aria-label="Chest tape measure">
        <div style={styles.tapeTitleRow}>
          <h3 style={styles.tapeTitle}>Chest</h3>
          <div style={styles.segTrack} role="radiogroup" aria-label="Units" onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              toggleUnit(ui.unit === 'cm' ? 'in' : 'cm');
            }
          }}>
            {(['cm', 'in'] as const).map(unit => (
              <button
                key={unit}
                type="button"
                role="radio"
                aria-checked={ui.unit === unit}
                className="svg-btn svg-focusable"
                style={{...styles.segBtn, ...(ui.unit === unit ? styles.segBtnOn : null)}}
                onClick={() => toggleUnit(unit)}>
                {unit}
              </button>
            ))}
          </div>
        </div>
        <MeasureTapeDial
          chestCm={m.chestCm}
          unit={ui.unit}
          reducedMotion={reducedMotion}
          sliderRef={sliderRef}
          onScrub={onScrub}
          onCommit={onScrubCommit}
          onStep={onStep}
          onKeyStep={onKeyStep}
        />
        {m.shoulderCm == null && !ui.shoulderFormOpen ? (
          <div style={styles.chipRow}>
            <button
              type="button"
              ref={addChipRef}
              className="svg-btn svg-focusable"
              style={styles.addChip}
              onClick={openShoulderForm}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
              Add shoulder · {measuredCount}/5
            </button>
          </div>
        ) : null}
        {ui.shoulderFormOpen ? (
          <div style={styles.formWrap}>
            <label style={styles.formLabel} htmlFor="svf-shoulder-input">
              Shoulder width (cm)
            </label>
            <div style={styles.formRow}>
              <input
                id="svf-shoulder-input"
                ref={shoulderInputRef}
                className="svg-input"
                style={{...styles.formInput, ...(ui.shoulderError != null ? styles.formInputError : null)}}
                inputMode="decimal"
                placeholder={\`e.g. \${SHOULDER_SUGGESTED}\`}
                value={ui.shoulderDraft}
                aria-invalid={ui.shoulderError != null}
                aria-describedby={ui.shoulderError != null ? 'svf-shoulder-error' : undefined}
                onChange={event => {
                  const draft = event.target.value;
                  // Reward the fix immediately: clear the error the moment
                  // the value becomes valid while typing.
                  update('ui', {
                    shoulderDraft: draft,
                    shoulderError: ui.shoulderError != null && validateShoulder(draft) == null ? null : ui.shoulderError,
                  });
                }}
                onBlur={() => update('ui', {shoulderError: validateShoulder(ui.shoulderDraft)})}
              />
              <button type="button" className="svg-btn svg-focusable" style={styles.saveBtn} onClick={commitShoulder}>
                Save
              </button>
            </div>
            {ui.shoulderError != null ? (
              <span id="svf-shoulder-error" style={styles.fieldError}>
                {ui.shoulderError}
              </span>
            ) : (
              <span style={styles.formLabel}>Adds shoulder to {measuredCount}/5 measured · Arno → 100% confidence</span>
            )}
          </div>
        ) : null}
      </section>

      <section style={{...styles.listCard, marginTop: 12}} aria-label="Fit map for Arno Selvedge Trucker">
        <SilhouetteFitMap zones={zones} onZoneTap={(zone, opener) => openSheet('arno', opener, zone)} />
      </section>

      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Fits like</h2>
        <span style={styles.sectionCaption}>vs Selvage {selvageSizeFor(m.chestCm)}</span>
      </div>
      <section style={styles.listCard} aria-label="Brand fit ledger">
        {ordered.map((brand, index) => {
          const verdict = verdicts[brand.id];
          const conf = confidenceFor(brand, m);
          const flagged = ui.justUpdated.includes(brand.id);
          const showHint = brand.fields.includes('shoulderCm') && m.shoulderCm == null && conf <= 50;
          return (
            <div key={brand.id} ref={registerLedgerRow(brand.id)}>
              <button
                type="button"
                className="svg-btn svg-focusable"
                style={styles.ledgerRow}
                aria-label={\`\${brand.name}, fits like \${verdict.size}, \${conf}% confidence\`}
                onClick={event => openSheet(brand.id, event.currentTarget)}>
                <span style={styles.ledgerText}>
                  <span style={styles.ledgerPrimaryRow}>
                    <span style={styles.ledgerPrimary}>{brand.name}</span>
                    {flagged ? <span style={styles.updatedBadge}>Updated</span> : null}
                  </span>
                  <span style={styles.ledgerSecondary}>{verdict.text}</span>
                </span>
                <span style={styles.ledgerTrailing}>
                  <span style={styles.barTrack}>
                    <span style={{...styles.barFill, width: \`\${(conf / 100) * 48}px\`, display: 'block'}} />
                  </span>
                  <span style={styles.pctText}>{conf}%</span>
                  {showHint ? <span style={styles.ledgerHint}>Add shoulder</span> : null}
                </span>
              </button>
              {index === ordered.length - 1 ? null : <div style={styles.rowDivider} />}
            </div>
          );
        })}
      </section>
      {/* List complete from consts — terminal caption, no loadMoreRow. */}
      <p style={styles.terminalCaption}>All 6 brands</p>
      <div style={{height: 24}} />
    </>
  );

  const shopScreen = (
    <>
      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Featured</h2>
      </div>
      <section style={styles.listCard} aria-label="Featured products">
        {SHOP_ITEMS.map((item, index) => {
          const verdict = verdicts[item.brandId];
          return (
            <div key={item.id}>
              <button
                type="button"
                className="svg-btn svg-focusable"
                style={styles.mediaRow}
                aria-label={\`\${item.name}, \${item.price}, fits like \${verdict.size}\`}
                onClick={event => openSheet(item.brandId, event.currentTarget)}>
                <span style={{...styles.mediaThumb, background: thumbGradient(item.id)}} aria-hidden />
                <span style={styles.mediaText}>
                  <span style={styles.mediaPrimary}>{item.name}</span>
                  <span style={styles.mediaSecondary}>
                    {item.price} · fits like {verdict.size}
                  </span>
                </span>
                <span style={styles.sizeChip}>{verdict.size}</span>
              </button>
              {index === SHOP_ITEMS.length - 1 ? null : <div style={styles.rowDivider} />}
            </div>
          );
        })}
      </section>
      <div style={{height: 24}} />
    </>
  );

  const bagScreen = (
    <>
      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Your bag · 2</h2>
      </div>
      <section style={styles.listCard} aria-label="Bag items">
        {BAG.map(item => (
          <div key={item.id}>
            <button
              type="button"
              className="svg-btn svg-focusable"
              style={styles.mediaRow}
              aria-label={\`\${item.name}, \${item.price}, size \${bagSizes[item.id]}\`}
              onClick={event => openSheet(item.brandId, event.currentTarget)}>
              <span style={{...styles.mediaThumb, background: thumbGradient(item.id)}} aria-hidden />
              <span style={styles.mediaText}>
                <span style={styles.mediaPrimary}>{item.name}</span>
                <span style={styles.mediaSecondary}>{item.price}</span>
              </span>
              <span style={styles.sizeChip}>{bagSizes[item.id]}</span>
            </button>
            <div style={styles.rowDivider} />
          </div>
        ))}
        {/* $148 + $96 = $244 ✓ */}
        <div style={styles.utilityRow}>
          <span style={{...styles.utilityLabel, fontWeight: 600}}>Subtotal</span>
          <span style={{...styles.utilityValue, color: 'var(--color-text-primary)', fontWeight: 600}}>$244</span>
        </div>
      </section>
      <div style={{height: 24}} />
    </>
  );

  const youScreen = (
    <>
      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Measurements</h2>
      </div>
      <section style={styles.listCard} aria-label="Your measurements">
        {FIELD_KEYS.map((key, index) => (
          <div key={key}>
            {key === 'shoulderCm' && m.shoulderCm == null ? (
              <button
                type="button"
                className="svg-btn svg-focusable"
                style={styles.utilityRow}
                aria-label="Shoulder — add measurement"
                onClick={() => {
                  selectTab('fit');
                  update('ui', {shoulderFormOpen: true});
                  requestAnimationFrame(() => shoulderInputRef.current?.focus());
                }}>
                <span style={styles.utilityLabel}>{FIELD_LABELS[key]}</span>
                <span style={{...styles.utilityValue, color: BRAND_ACCENT, fontWeight: 600}}>Add</span>
              </button>
            ) : (
              <div style={styles.utilityRow}>
                <span style={styles.utilityLabel}>{FIELD_LABELS[key]}</span>
                <span style={styles.utilityValue}>{fmtByUnit(m[key])}</span>
              </div>
            )}
            {index === FIELD_KEYS.length - 1 ? null : <div style={styles.rowDivider} />}
          </div>
        ))}
      </section>
      <p style={styles.terminalCaption}>{measuredCount} of 5 on file</p>
      <div style={{height: 24}} />
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SELVAGE_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="svg-btn svg-focusable"
              style={styles.brandBtn}
              aria-label="Selvage — scroll to top"
              onClick={() => selectTab(ui.tab)}>
              <SelvageMark />
            </button>
          </div>
          <h1 style={styles.navTitle}>{tabTitle}</h1>
          <div style={styles.navTrailing}>
            <FitScoreChip score={score} completeness={completeness} onTap={onFitScoreTap} />
          </div>
        </header>

        <main style={styles.main}>
          {ui.tab === 'fit' ? fitScreen : ui.tab === 'shop' ? shopScreen : ui.tab === 'bag' ? bagScreen : youScreen}
        </main>

        {/* The ONE polite live region — sticky dock above the BagTray;
            re-anchors absolute while the sheet scroll-lock is active. */}
        <div
          style={
            ui.sheetBrandId != null
              ? styles.toastDockLocked
              : {...styles.toastDock, bottom: ui.tab === 'fit' ? 152 : 76}
          }
          aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="svg-fade">
              {ui.toast.text}
            </div>
          ) : null}
        </div>

        {ui.tab === 'fit' ? (
          <div style={styles.bagTray}>
            <span style={styles.bagLabel}>Bag · 2</span>
            {BAG.map(item => {
              const changed = ui.changedBags.includes(item.id);
              return (
                <span key={item.id} style={styles.bagItem}>
                  <span style={{...styles.bagThumb, background: thumbGradient(item.id)}} aria-hidden />
                  <span style={styles.bagName}>{item.name}</span>
                  <span
                    key={\`\${item.id}-\${bagSizes[item.id]}-\${ui.pulseSeq}\`}
                    className={changed && !reducedMotion ? 'svg-pulse' : undefined}
                    style={{...styles.sizeChip, ...(changed ? styles.sizeChipChanged : null)}}>
                    {bagSizes[item.id]}
                  </span>
                </span>
              );
            })}
          </div>
        ) : null}

        <nav style={styles.tabBar} role="tablist" aria-label="Selvage sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const isActive = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="svg-btn svg-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'bag' ? <span style={styles.tabBadge}>2</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {ui.sheetBrandId != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {sheetBrand != null && sheetVerdict != null ? (
          <Sheet
            titleId="svf-sheet-title"
            title={sheetBrand.name}
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            bodyRef={sheetBodyRef}
            footer={
              sheetNeedsShoulder ? (
                <button
                  type="button"
                  className="svg-btn svg-focusable"
                  style={styles.primaryBtn}
                  onClick={() => {
                    // Close, land on the Fit tab, open + focus the form.
                    update('ui', {
                      sheetBrandId: null,
                      sheetTargetZone: null,
                      tab: 'fit',
                      shoulderFormOpen: true,
                    });
                    requestAnimationFrame(() => shoulderInputRef.current?.focus());
                  }}>
                  Add shoulder measurement
                </button>
              ) : (
                <button type="button" className="svg-btn svg-focusable" style={styles.doneBtn} onClick={closeSheet}>
                  Done
                </button>
              )
            }>
            {sheetBagItem != null ? (
              <>
                <p style={styles.sheetSectionLabel}>{sheetBagItem.name}</p>
                <div style={styles.pdpChipRow}>
                  {sheetBrand.bands.map(band => {
                    const isOn = bagSizes[sheetBagItem.id] === band.size;
                    return (
                      <button
                        key={band.size}
                        type="button"
                        className="svg-btn svg-focusable"
                        style={{...styles.pdpChip, ...(isOn ? styles.pdpChipOn : null)}}
                        aria-pressed={isOn}
                        aria-label={\`Size \${band.size}\${sheetVerdict.size === band.size && sheetVerdict.inRange ? ', recommended' : ''}\`}
                        onClick={() => overrideBagSize(sheetBagItem, band.size)}>
                        {band.size}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}
            <p style={styles.sheetSectionLabel}>Size chart · {sheetBrand.driver}</p>
            <div>
              {sheetBrand.bands.map(band => {
                const isRec = sheetVerdict.inRange && sheetVerdict.size === band.size;
                return (
                  <div key={band.size} style={{...styles.chartRow, ...(isRec ? styles.chartRowTarget : null)}}>
                    <span style={styles.chartSize}>{band.size}</span>
                    <span style={styles.chartRange}>
                      {band.min}–{band.max} cm
                    </span>
                    {isRec ? <span style={styles.recChip}>Recommended</span> : null}
                  </div>
                );
              })}
              {!sheetVerdict.inRange ? (
                <p style={{...styles.confCaption, margin: '8px 0 0'}}>{sheetVerdict.text}</p>
              ) : null}
            </div>
            {sheetBrand.id === 'arno' ? (
              <>
                <p style={styles.sheetSectionLabel}>Garment · size {arnoSize}</p>
                <div>
                  {(['chest', 'waist', 'hip', 'inseam'] as ZoneId[]).map(zone => {
                    const isTarget = ui.sheetTargetZone === zone;
                    const garmentCm = zone === 'inseam' ? null : garment[zone as GarmentZone];
                    const bodyCm = zone === 'inseam' ? null : m[\`\${zone}Cm\` as FieldKey];
                    const ease = garmentCm != null && bodyCm != null ? garmentCm - bodyCm : null;
                    return (
                      <div
                        key={zone}
                        ref={node => {
                          if (node == null) garmentRowRefs.current.delete(zone);
                          else garmentRowRefs.current.set(zone, node);
                        }}
                        style={{...styles.chartRow, ...(isTarget ? styles.chartRowTarget : null)}}>
                        <span style={{...styles.chartSize, width: 64}}>{FIELD_LABELS[\`\${zone}Cm\` as FieldKey]}</span>
                        <span style={styles.chartRange}>{garmentCm != null ? \`\${garmentCm} cm\` : '— (jacket)'}</span>
                        {ease != null ? (
                          <span style={{...styles.pctText, color: EASE_COLOR[easeBandOf(ease)], fontWeight: 600}}>
                            +{fmtEase(ease)} {EASE_LABEL[easeBandOf(ease)].toLowerCase()}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
            <div style={styles.confBlock}>
              <span style={styles.confTrack}>
                <span style={{...styles.confFill, width: \`\${sheetConf}%\`, display: 'block'}} />
              </span>
              <span style={styles.confCaption}>
                {sheetConf}% confidence · {sheetMeasured} of {sheetUsed} measurements on file
              </span>
              {sheetNeedsShoulder ? <span style={styles.confHint}>Add shoulder → 100% confidence</span> : null}
            </div>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};