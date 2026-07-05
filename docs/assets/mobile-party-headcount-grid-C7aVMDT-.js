var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Feastly guest roster for
 *   "Dinner at Priya's" (Sat, Jul 18): 12 guests g1–g12 (7 confirmed + 3
 *   maybe + 2 out = 12 ✓), dietary flags cross-checked by hand (confirmed
 *   veg 2 · vegan 1 · gf 2 · df 2; maybe overlays vegan +1 / gf +1 / df +1;
 *   servings std = 7−2−1 = 4, 4+2+1 = 7 = confirmed ✓), five dishes whose
 *   needs DERIVE from the roster (baseline under-provisioned = 0), and nine
 *   shopping lines with their formulas in comments (bread 5+2 = 7 ✓, posset
 *   5+2 = 7 ✓). No Date.now(), no Math.random(), no network media.
 * @output Feastly — Party Headcount Grid: a 390px MOBILE party-planning
 *   surface. Guests tab: navBar (28px PlateMark · 'Headcount' fades in via
 *   IntersectionObserver sentinel · 44×44 RefreshCw) over a 52px largeTitle,
 *   a 56px countStrip (7 CONFIRMED · 3 MAYBE · 2 OUT + 'Nudge 2' decay-chip
 *   button), then the DietaryMatrix — a dual-sticky guest-by-dietary pivot
 *   grid (44px header row sticky top:52, 32px tally row sticky top:96, 12
 *   guest rows 56px, every cell a real aria-pressed button) — above a 48px
 *   ServingsRecalcBar (five NumberRoller counters, sticky bottom:64) and a
 *   3-tab tabBar. Signature ripple: tapping the GF cell for Marcus (g2)
 *   rolls the gf tally 2→3, rolls the recalc bar's GF counter, flips
 *   Rosemary Focaccia to 'Short 1' (Menu tab badge '1'), regenerates
 *   exactly two Shopping lines (GF flour 240 g→360 g, soy sauce→GF tamari)
 *   with 'updated' dots, and posts a persistent Undo toast — one reducer,
 *   Menu and Shopping are pure projections. Undo restores the pre-action
 *   snapshot in one assignment; never a confirm dialog.
 * @position Page template; emitted by \`astryx template mobile-party-headcount-grid\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheets, toast-during-lock) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close. The stage clips to --radius-container; shell paints
 *   full-bleed square. navBar hairline: ALWAYS-ON variant (noted per
 *   contract — scroll-under wiring drives only the title fade).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); the DietaryMatrix card carries
 *   NO overflow clip so its dual sticky rows can pin (top corners rounded
 *   on the header row instead). No desktop Layout frames, no side asides.
 * Color policy: token-pure chrome. Quarantined brand literals per spec:
 *   BRAND_ACCENT light-dark(#E85D3D, #F0795D) for fills/icons (white check
 *   on #E85D3D = 3.5:1, passes the 3:1 icon floor) and BRAND_ACCENT_TEXT
 *   light-dark(#C2401F, #F5906F) for text on card/body (#C2401F on #FFFFFF
 *   ≈ 5.6:1; #F5906F on the dark card ~#1C1C1E ≈ 6.0:1). Interactive
 *   rest-state boundaries (matrix off-cells, decay-ring remainders, OFF
 *   switch-track ring) get explicit ≥3:1 pairs with the math at each
 *   declaration — hairline/muted tokens are reserved for passive
 *   separators.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps. navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur color-mix 86% + hairline);
 *   largeTitle row 52px in-flow (28px/700 at the 16px gutter); countStrip
 *   56px; matrix header row 44px sticky top:52 z15; tally row 32px sticky
 *   top:96 z15; guest rows 56px on grid columns 'minmax(72px,1fr)
 *   repeat(4, minmax(52px,56px))' — each cell IS the button (52–56×56 hit,
 *   ≥44 both axes via the merge clause) around a 28×28 radius-8 toggle
 *   visual; ServingsRecalcBar 48px sticky bottom:64 z19; tabBar 64px
 *   sticky bottom:0 z20 (3 tabItems, 24px icons over 11px/500 labels, 4px
 *   gap; badge = brand pill minWidth 16, 10px/600, top:-4 right:-8). Rows
 *   elsewhere: 44px utility (shopping, sheet toggles) · 60px two-line
 *   (Menu dishes, dish-detail variants). sectionHeader 13px/600 uppercase
 *   0.06em at 32px, 20px top / 8px bottom. TYPE (Figtree via
 *   --font-family-body): 28/700 · 22/700 · 17/600 · 16/400–500 · 13/400 ·
 *   11/500 floor; tabular-nums on every mutating numeral. Buttons: 48px
 *   primary · 36px secondary · 44×44 icon. toastDock is STICKY-IN-FLOW
 *   (per the binding amendment, NOT shell-absolute): sticky bottom:124 z30
 *   on Guests (clears 64 tabBar + 48 recalc bar + 12), bottom:76 on
 *   Menu/Shopping; it goes absolute (z45, above the sheet) only during
 *   sheet scroll-lock. Sheet detents 55% medium / calc(100% − 56px) large,
 *   24px grabber zone with 36×5 pill button, 52px sheet header.
 *
 * Responsive contract:
 * - Author at 390; clean 320–430, zero width literals. Matrix columns
 *   'minmax(72px,1fr) repeat(4, minmax(52px,56px))': at 320 the four diet
 *   columns floor at 52 (4×52 = 208) leaving ~80px for names inside the
 *   288px card (320 − 32 gutter) — g9 'Nina Kowalski-Albuquerque' is the
 *   single-line-ellipsis proof; at 430 diet columns cap at 56 and the name
 *   column absorbs the rest. Recalc cells flex:1 with fixed STD/VEG/VGN/
 *   GF/DF labels (no wrapping); countStrip blocks flex minWidth 0, the
 *   Nudge chip never wraps. overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — the dual-sticky matrix
 *   is deliberately phone geometry.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject} from 'react';

import {
  BellRingIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  UsersIcon,
  UtensilsCrossedIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Feastly terracotta) — fills and icons only.
// White glyphs on #E85D3D = 3.5:1 (passes the 3:1 icon/graphics floor, NOT
// body text); #E85D3D vs the white card = 3.5:1 and #F0795D vs the dark card
// (~#1C1C1E) ≈ 5.9:1, so brand-filled 28px toggles clear the 3:1 boundary
// rule against their actual surface.
const BRAND_ACCENT = 'light-dark(#E85D3D, #F0795D)';
// Brand-tinted TEXT on card/body surfaces. #C2401F on #FFFFFF ≈ 5.6:1;
// #F5906F on the dark card ~#1C1C1E ≈ 6.0:1 — both pass 4.5:1.
const BRAND_ACCENT_TEXT = 'light-dark(#C2401F, #F5906F)';
// ICONS over a BRAND_ACCENT fill. Light: #FFFFFF on #E85D3D = 3.5:1 —
// passes the 3:1 icon/graphics floor ONLY, so this pair is reserved for
// glyph-scale marks (the 16px matrix Check). Dark: #33130B on #F0795D
// ≈ 5.7:1.
const BRAND_ICON_ON_FILL = 'light-dark(#FFFFFF, #33130B)';
// TEXT over a BRAND_ACCENT fill (48px primary buttons, tab badge numeral).
// White on #E85D3D is only 3.5:1 (< 4.5:1 text floor at 16px/600), so text
// flips dark in BOTH schemes: #33130B on #E85D3D ≈ 4.5:1; #33130B on
// #F0795D ≈ 5.7:1. (Deviation from the spec's white-label instinct —
// contrast math wins; noted in the final summary.)
const BRAND_TEXT_ON_FILL = '#33130B';
// 12% brand wash for selected segment tint / nudge chip over-threshold fill.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// INTERACTIVE REST BOUNDARY (binding amendment): matrix off-cell 2px
// outline, decay-ring remainder track, OFF switch-track inset ring. The
// spec's suggested pair light-dark(#B9AFA4, #5E564C) measures only ≈2.2:1
// on the white card and ≈2.4:1 on the dark card (~#1C1C1E) — BELOW the 3:1
// floor — so it is corrected here (deviation, noted in the final summary):
// #8A8177 vs #FFFFFF ≈ 3.8:1 ✓; #948B7F vs #1C1C1E ≈ 4.9:1 ✓.
const REST_BOUNDARY = 'light-dark(#8A8177, #948B7F)';
// Decay-ring REST stroke (pre-threshold arc) — text-secondary equivalent as
// an explicit pair per the never-var()-in-SVG-strokes rule: #6E655A on
// #FFFFFF ≈ 5.8:1; #B3AA9E on #1C1C1E ≈ 7.2:1.
const RING_REST = 'light-dark(#6E655A, #B3AA9E)';
// OFF switch track fill — foundations verbatim; the ≥3:1 rest boundary is
// carried by the REST_BOUNDARY inset ring layered on top (amendment).
const SWITCH_OFF_TRACK = 'light-dark(rgba(21,17,12,0.14), rgba(255,255,255,0.22))';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21,17,12,0.32), rgba(0,0,0,0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the NumberRoller
// keyframe (from translateY(0) to the inline resting transform, so one
// keyframe serves every window height), visually-hidden text, and the
// reduced-motion guard (rollers/sheet collapse to instant; decay arcs are
// static already — state is encoded by color + label).
// ---------------------------------------------------------------------------

const FEASTLY_CSS = \`
.fst-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fst-btn:disabled { cursor: default; }
.fst-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
@keyframes fst-roll { from { transform: translateY(0); } }
.fst-roll { animation: fst-roll 200ms ease; }
@keyframes fst-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fst-sheet-in { animation: fst-sheet-in 240ms ease; }
.fst-fade { transition: opacity 200ms ease; }
.fst-vh {
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
  .fst-roll { animation: none; }
  .fst-sheet-in { animation: none; }
  .fst-fade { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, sheet, listCard, rowDivider, sectionHeader.
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
  // NAV BAR — 52px sticky top z20; hairline ALWAYS ON (noted per contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // Pushed-screen back button — ChevronLeft 24 + previous title 13px/500.
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: BRAND_ACCENT_TEXT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // LARGE TITLE — 52px in-flow row; scrolls under the sticky navBar.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  // COUNT STRIP — 56px band; the one legal horizontal-safe row.
  countStrip: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    paddingInline: 16,
  },
  countBlocks: {display: 'flex', alignItems: 'center', gap: 24, minWidth: 0},
  countBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  countNum: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: '24px',
    fontVariantNumeric: 'tabular-nums',
  },
  countLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // 'Nudge 2' chip — 28px visual inside a 44px hit.
  nudgeChipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
  },
  nudgeChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: BRAND_TINT_12,
    fontSize: 11,
    fontWeight: 600,
    color: BRAND_ACCENT_TEXT,
    whiteSpace: 'nowrap',
  },
  refreshCaption: {
    paddingInline: 16,
    paddingBottom: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard (clipped variant for simple lists).
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  terminalCaption: {
    margin: '16px 0 4px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // DIETARY MATRIX — the card carries NO overflow clip so the dual sticky
  // rows can pin against the page scroller; the header row rounds the top
  // corners itself.
  matrixCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  matrixGridRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(72px, 1fr) repeat(4, minmax(52px, 56px))',
    alignItems: 'stretch',
  },
  // Header row — 44px sticky top:52 (navBar height) z15, own card
  // background + bottom hairline so guest rows slide under.
  matrixHeaderRow: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    height: 44,
    background: 'var(--color-background-card)',
    borderBottom: '1px solid var(--color-border)',
    borderRadius: '12px 12px 0 0',
  },
  matrixHeadBlank: {display: 'flex', alignItems: 'center', paddingInlineStart: 16},
  colSortBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  colSortBtnActive: {color: BRAND_ACCENT_TEXT, fontWeight: 700},
  // Tally row — 32px sticky top:96 (52 navBar + 44 header) z15.
  matrixTallyRow: {
    position: 'sticky',
    top: 96,
    zIndex: 15,
    height: 32,
    background: 'var(--color-background-card)',
    borderBottom: '1px solid var(--color-border)',
  },
  tallyName: {
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 16,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  tallyCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  tallyMaybe: {fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)'},
  // Guest rows — 56px; out rows at 45% opacity with disabled toggles.
  matrixGuestRow: {height: 56},
  matrixGuestRowOut: {opacity: 0.45},
  nameCellBtn: {
    height: 56,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
    borderRadius: '0 0 0 12px',
  },
  guestName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  guestStatusLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Toggle cell — the WHOLE 52–56×56 cell is the button (merge clause);
  // the 28×28 radius-8 visual centers inside it.
  cellBtn: {
    height: 56,
    display: 'grid',
    placeItems: 'center',
  },
  cellBoxOff: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: \`2px solid \${REST_BOUNDARY}\`,
  },
  cellBoxOn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    // 16px white Check on #E85D3D = 3.5:1 — icon-scale, passes the 3:1
    // graphics floor (dark side #33130B on #F0795D ≈ 5.7:1).
    color: BRAND_ICON_ON_FILL,
  },
  // MaybeDecayChip — 22px visual chip; inline (non-interactive) in matrix
  // rows, wrapped in ≥44px hits where interactive.
  decayChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 6,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  decayChipLabel: {
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // SERVINGS RECALC BAR — 48px sticky bottom:64 z19; blur surface + top
  // hairline; five flex:1 cells.
  recalcBar: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 48,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  recalcCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  recalcValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  recalcLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // TAB BAR — exactly 64px, 3 tabs flex:1.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    flexShrink: 0,
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
  tabItemActive: {color: BRAND_ACCENT_TEXT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
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
    color: BRAND_TEXT_ON_FILL,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — STICKY-IN-FLOW anchor (height 0) per the binding
  // amendment: bottom 124 on Guests root (64 tabBar + 48 recalc + 12),
  // bottom 76 on Menu/Shopping. Absolute (z45, above the z41 sheet) only
  // during sheet scroll-lock. Always mounted for aria-live.
  toastAnchorGuests: {
    position: 'sticky',
    bottom: 124,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastAnchorOther: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 124,
    zIndex: 45,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: '100%',
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
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT_TEXT,
    flexShrink: 0,
  },
  // SHEETS — scrim z40 + sheet z41, absolute inside shell; two detents.
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
    borderRadius: '16px 16px 0 0',
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_TEXT_ON_FILL,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // SEGMENTED STATUS CONTROL — 36px track radius 12, active pill radius 10.
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    gap: 2,
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // Whole-row switch — 44px utility row, role=switch; 51×31 track.
  switchRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  switchRowLabel: {fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    background: SWITCH_OFF_TRACK,
    // Amendment: explicit ≥3:1 rest boundary on the OFF track (the fill
    // alone is a wash) — REST_BOUNDARY math at its declaration.
    boxShadow: \`inset 0 0 0 1px \${REST_BOUNDARY}\`,
  },
  switchTrackOn: {background: BRAND_ACCENT, boxShadow: 'none'},
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    transition: 'transform 200ms ease',
  },
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  utilityRowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityRowValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // MENU — 60px two-line dish rows.
  dishRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  dishText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  dishName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dishMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  shortPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_TINT_12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  screenSectionTitle: {
    margin: '20px 16px 8px',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  // DISH DETAIL — 60px variant rows with 96×32 steppers.
  variantRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  variantText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  stepperGroup: {display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0},
  stepper: {
    display: 'flex',
    width: 96,
    height: 32,
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
  stepperHalfDisabled: {opacity: 0.35},
  stepperRule: {width: 1, background: 'var(--color-border)', flexShrink: 0},
  stepperValue: {
    minWidth: 20,
    textAlign: 'right',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 6,
  },
  // SHOPPING — 44px utility rows with a 16px leading dot slot.
  shopDotSlot: {width: 16, flexShrink: 0, display: 'grid', placeItems: 'center'},
  shopDot: {width: 6, height: 6, borderRadius: '50%', background: BRAND_ACCENT},
  shopUpdated: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: BRAND_ACCENT_TEXT,
    flexShrink: 0,
  },
  // Nudge queue sheet rows.
  nudgeRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  initialsDisc: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT_TEXT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT_TEXT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  nudgedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates. All
// tallies/servings/dish-needs/shopping quantities DERIVE live from GUESTS —
// nothing below is hard-coded into the render path.
// ---------------------------------------------------------------------------

const EVENT = {title: "Dinner at Priya's", date: 'Sat, Jul 18'};
const DECAY_THRESHOLD_DAYS = 4;
const PLANNED_MAX = 16;

type GuestStatus = 'confirmed' | 'maybe' | 'out';
type FlagKey = 'veg' | 'vegan' | 'gf' | 'df';

interface Guest {
  id: string;
  name: string;
  initials: string;
  status: GuestStatus;
  invitedDaysAgo: number;
  flags: Record<FlagKey, boolean>;
}

const FLAG_COLS: Array<{key: FlagKey; short: string; label: string}> = [
  {key: 'veg', short: 'VEG', label: 'Vegetarian'},
  {key: 'vegan', short: 'VGN', label: 'Vegan'},
  {key: 'gf', short: 'GF', label: 'Gluten-free'},
  {key: 'df', short: 'DF', label: 'Dairy-free'},
];

function flags(on: FlagKey[] = []): Record<FlagKey, boolean> {
  return {veg: on.includes('veg'), vegan: on.includes('vegan'), gf: on.includes('gf'), df: on.includes('df')};
}

// CROSS-CHECK LEDGER (verified by hand): 7 confirmed (g1–g7) + 3 maybe
// (g8–g10) + 2 out (g11–g12) = 12 ✓. Confirmed tallies: veg 2 (g1,g7) ·
// vegan 1 (g3) · gf 2 (g1,g7) · df 2 (g4,g5). Maybe overlays: vegan +1
// (g8) · gf +1 (g8) · df +1 (g10) · veg +0. Servings std = 7−2−1 = 4
// (g2,g4,g5,g6); 4+2+1 = 7 = confirmed ✓. Nudge queue = maybes with
// invitedDaysAgo > 4 → g9 (5d), g10 (6d) = 2 ✓ (g8 at 2d excluded). Decay
// arcs: 2/7 ≈ 29%, 5/7 ≈ 71%, 6/7 ≈ 86% — three visibly distinct rings.
// g9's name is the 320px ~80px-name-cell ellipsis stressor.
const GUESTS: Guest[] = [
  {id: 'g1', name: 'Priya Raman', initials: 'PR', status: 'confirmed', invitedDaysAgo: 9, flags: flags(['veg', 'gf'])},
  {id: 'g2', name: 'Marcus Webb', initials: 'MW', status: 'confirmed', invitedDaysAgo: 9, flags: flags()},
  {id: 'g3', name: 'Elena Torres', initials: 'ET', status: 'confirmed', invitedDaysAgo: 8, flags: flags(['vegan'])},
  {id: 'g4', name: 'Jonah Fields', initials: 'JF', status: 'confirmed', invitedDaysAgo: 8, flags: flags(['df'])},
  {id: 'g5', name: 'Aisha Bello', initials: 'AB', status: 'confirmed', invitedDaysAgo: 7, flags: flags(['df'])},
  {id: 'g6', name: 'Tom Okafor', initials: 'TO', status: 'confirmed', invitedDaysAgo: 7, flags: flags()},
  {id: 'g7', name: 'Grace Lin', initials: 'GL', status: 'confirmed', invitedDaysAgo: 6, flags: flags(['veg', 'gf'])},
  {id: 'g8', name: 'Sam Alvarez', initials: 'SA', status: 'maybe', invitedDaysAgo: 2, flags: flags(['vegan', 'gf'])},
  {id: 'g9', name: 'Nina Kowalski-Albuquerque', initials: 'NK', status: 'maybe', invitedDaysAgo: 5, flags: flags()},
  {id: 'g10', name: 'Dev Chandra', initials: 'DC', status: 'maybe', invitedDaysAgo: 6, flags: flags(['df'])},
  {id: 'g11', name: 'Ruth Amare', initials: 'RA', status: 'out', invitedDaysAgo: 9, flags: flags(['veg'])},
  {id: 'g12', name: 'Ben Foster', initials: 'BF', status: 'out', invitedDaysAgo: 8, flags: flags()},
];

// ---------------------------------------------------------------------------
// SELECTORS — pure projections over the roster. Menu and Shopping render
// exclusively from these, so a matrix toggle shows consequences on other
// tabs with zero extra wiring. EVERYONE-OUT DRILL (comment-documented
// manual test): flip all 7 confirmed to Out → std/veg/vgn/gf/df = 0-0-0-0-0,
// all five dishes read 'Short n' (Menu badge '5'), and shopping renders
// zero quantities without NaN — ceil(0/2) = 0 heads, 0×150 g = '0 g'.
// ---------------------------------------------------------------------------

interface Tallies {
  confirmed: number;
  maybe: number;
  out: number;
  std: number; // confirmed, not veg and not vegan
  veg: number; // confirmed vegetarians (non-vegan)
  vgn: number; // confirmed vegans
  gf: number; // confirmed gluten-free (overlay)
  df: number; // confirmed dairy-free (overlay)
  maybeByFlag: Record<FlagKey, number>;
  confirmedByFlag: Record<FlagKey, number>;
}

function selectTallies(guests: Guest[]): Tallies {
  const confirmedGuests = guests.filter(g => g.status === 'confirmed');
  const maybeGuests = guests.filter(g => g.status === 'maybe');
  const countBy = (list: Guest[], key: FlagKey) => list.filter(g => g.flags[key]).length;
  const confirmedByFlag: Record<FlagKey, number> = {
    veg: countBy(confirmedGuests, 'veg'),
    vegan: countBy(confirmedGuests, 'vegan'),
    gf: countBy(confirmedGuests, 'gf'),
    df: countBy(confirmedGuests, 'df'),
  };
  const maybeByFlag: Record<FlagKey, number> = {
    veg: countBy(maybeGuests, 'veg'),
    vegan: countBy(maybeGuests, 'vegan'),
    gf: countBy(maybeGuests, 'gf'),
    df: countBy(maybeGuests, 'df'),
  };
  return {
    confirmed: confirmedGuests.length,
    maybe: maybeGuests.length,
    out: guests.filter(g => g.status === 'out').length,
    // std counts confirmed guests with neither veg nor vegan, so
    // std + veg + vgn always reconciles to confirmed (baseline 4+2+1 = 7 ✓).
    std: confirmedGuests.filter(g => !g.flags.veg && !g.flags.vegan).length,
    veg: confirmedGuests.filter(g => g.flags.veg && !g.flags.vegan).length,
    vgn: confirmedGuests.filter(g => g.flags.vegan).length,
    gf: confirmedByFlag.gf,
    df: confirmedByFlag.df,
    maybeByFlag,
    confirmedByFlag,
  };
}

interface DishVariantDef {
  key: string;
  label: string;
  short: string; // meta-line token: '5 std + 2 GF planned'
  basePlanned: number;
  needs: (t: Tallies) => number;
  note?: string;
}

interface DishDef {
  id: string;
  name: string;
  variants: DishVariantDef[];
}

// Baseline planned counts equal baseline needs → under-provisioned = 0 and
// the Menu tab carries NO badge until a roster mutation moves a need.
const DISHES: DishDef[] = [
  {
    id: 'dish_skewers',
    name: 'Harissa Chicken Skewers',
    variants: [{key: 'skewers.main', label: 'Standard', short: 'std', basePlanned: 4, needs: t => t.std}],
  },
  {
    id: 'dish_cauli',
    name: 'Charred Cauliflower Steaks',
    variants: [
      // Vegan portion flagged 'no feta' — needs = veg + vgn (baseline 3).
      {key: 'cauli.main', label: 'Veg + vegan (no feta ×1)', short: 'veg', basePlanned: 3, needs: t => t.veg + t.vgn},
    ],
  },
  {
    id: 'dish_focaccia',
    name: 'Rosemary Focaccia',
    variants: [
      // Standard loaves feed the non-GF confirmed: 7−gf = 5 baseline.
      {key: 'focaccia.std', label: 'Standard loaf', short: 'std', basePlanned: 5, needs: t => t.confirmed - t.gf},
      // GF loaves feed gf confirmed: 2 baseline. Bread check 5+2 = 7 ✓.
      {key: 'focaccia.gf', label: 'GF loaf', short: 'GF', basePlanned: 2, needs: t => t.gf},
    ],
  },
  {
    id: 'dish_pilaf',
    name: 'Saffron Rice Pilaf',
    variants: [{key: 'pilaf.main', label: 'Standard', short: 'std', basePlanned: 8, needs: t => t.confirmed}],
  },
  {
    id: 'dish_posset',
    name: 'Lemon Posset',
    variants: [
      // Cream possets feed non-DF confirmed: 7−df = 5 baseline.
      {key: 'posset.cream', label: 'Cream', short: 'cream', basePlanned: 5, needs: t => t.confirmed - t.df},
      // Coconut possets feed df confirmed: 2. Posset check 5+2 = 7 ✓.
      {key: 'posset.coconut', label: 'Coconut', short: 'coconut', basePlanned: 2, needs: t => t.df},
    ],
  },
];

interface DishProjection {
  id: string;
  name: string;
  plannedTotal: number;
  needsTotal: number;
  shortfall: number; // per-variant Σ max(0, needs − planned)
  metaLine: string;
  variants: Array<{key: string; label: string; short: string; planned: number; needs: number; note?: string}>;
}

function plannedFor(overrides: Record<string, number>, variant: DishVariantDef): number {
  return overrides[variant.key] ?? variant.basePlanned;
}

function selectDishes(tallies: Tallies, overrides: Record<string, number>): DishProjection[] {
  return DISHES.map(dish => {
    const variants = dish.variants.map(v => ({
      key: v.key,
      label: v.label,
      short: v.short,
      planned: plannedFor(overrides, v),
      needs: v.needs(tallies),
      note: v.note,
    }));
    const plannedTotal = variants.reduce((s, v) => s + v.planned, 0);
    const needsTotal = variants.reduce((s, v) => s + v.needs, 0);
    // Shortfall is PER-VARIANT (a spare standard loaf cannot cover a
    // missing GF loaf), so the signature ripple's focaccia reads
    // '5 std + 2 GF planned · needs 4 + 3' and flags 'Short 1'.
    const shortfall = variants.reduce((s, v) => s + Math.max(0, v.needs - v.planned), 0);
    const metaLine =
      variants.length === 1
        ? \`\${variants[0].planned} planned · needs \${variants[0].needs}\`
        : \`\${variants.map(v => \`\${v.planned} \${v.short}\`).join(' + ')} planned · needs \${variants
            .map(v => v.needs)
            .join(' + ')}\`;
    return {id: dish.id, name: dish.name, plannedTotal, needsTotal, shortfall, metaLine, variants};
  });
}

interface ShoppingLine {
  id: string;
  item: string;
  qty: string;
}

// Nine lines, formulas in comments; quantities re-derive on every roster
// mutation and the reducer diffs before/after to mark 'updated' rows.
function selectShopping(guests: Guest[], overrides: Record<string, number>): ShoppingLine[] {
  const t = selectTallies(guests);
  const pilafPlanned = plannedFor(overrides, DISHES[3].variants[0]);
  // Soy sauce swaps to GF tamari when any CONFIRMED non-veg/non-vegan guest
  // is gluten-free (baseline false: gf confirmed g1,g7 are both veg; the
  // signature ripple flips it true via Marcus).
  const meatEaterNeedsGf = guests.some(
    g => g.status === 'confirmed' && g.flags.gf && !g.flags.veg && !g.flags.vegan,
  );
  return [
    // 4 std × 150 g = 600 g baseline.
    {id: 'sh_chicken', item: 'Chicken thighs', qty: \`\${t.std * 150} g\`},
    // ceil((veg 2 + vgn 1)/2) = 2 heads baseline; ceil(0/2) = 0 ✓.
    {id: 'sh_cauliflower', item: 'Cauliflower', qty: \`\${Math.ceil((t.veg + t.vgn) / 2)} heads\`},
    // Pilaf planned 8 × 75 g = 600 g baseline (follows the dish stepper).
    {id: 'sh_rice', item: 'Basmati rice', qty: \`\${pilafPlanned * 75} g\`},
    // gf 2 × 120 g = 240 g baseline; ripple → 3 × 120 = 360 g ✓.
    {id: 'sh_gf_flour', item: 'GF flour blend', qty: \`\${t.gf * 120} g\`},
    {id: 'sh_soy', item: meatEaterNeedsGf ? 'GF tamari' : 'Soy sauce', qty: '1 bottle'},
    // (7 − df 2) × 80 ml = 400 ml baseline.
    {id: 'sh_cream', item: 'Double cream', qty: \`\${(t.confirmed - t.df) * 80} ml\`},
    // df 2 × 100 ml = 200 ml baseline.
    {id: 'sh_coconut', item: 'Coconut cream', qty: \`\${t.df * 100} ml\`},
    // ceil(7/2) = 4 baseline.
    {id: 'sh_lemons', item: 'Lemons', qty: \`\${Math.ceil(t.confirmed / 2)}\`},
    {id: 'sh_saffron', item: 'Saffron', qty: '1 pack'},
  ];
}

function selectNudgeQueue(guests: Guest[], nudged: string[]): Guest[] {
  return guests.filter(
    g => g.status === 'maybe' && g.invitedDaysAgo > DECAY_THRESHOLD_DAYS && !nudged.includes(g.id),
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — guestRosterReducer. Single mutation path: every domain
// action snapshots the prior domain slice so UNDO restores it in one
// assignment (toast → 'Restored'). Toasts: ONE at a time, no timers —
// persist until Undo, the next mutation, or an explicit dismiss (they
// deliberately survive tab switches: stress fixture 6 presses Undo from
// Shopping).
// ---------------------------------------------------------------------------

type TabId = 'guests' | 'menu' | 'shopping';

interface DomainSlice {
  guests: Guest[];
  plannedOverrides: Record<string, number>;
  nudged: string[];
  updatedLineIds: string[];
}

type SheetState =
  | null
  | {kind: 'guest'; guestId: string; detent: 'medium' | 'large'}
  | {kind: 'nudge'; detent: 'medium' | 'large'};

interface RosterState extends DomainSlice {
  snapshot: DomainSlice | null;
  activeTab: TabId;
  menuScreen: 'root' | string; // dish id when pushed (screenByTab for menu)
  scrollByTab: Record<TabId, number>;
  sheet: SheetState;
  toast: {seq: number; text: string; undoable: boolean} | null;
  sortFlaggedFirstBy: FlagKey | null;
  refreshed: boolean;
}

const INITIAL_STATE: RosterState = {
  guests: GUESTS,
  plannedOverrides: {},
  nudged: [],
  updatedLineIds: [],
  snapshot: null,
  activeTab: 'guests',
  menuScreen: 'root',
  scrollByTab: {guests: 0, menu: 0, shopping: 0},
  sheet: null,
  toast: null,
  sortFlaggedFirstBy: null,
  refreshed: false,
};

type RosterAction =
  | {type: 'TOGGLE_FLAG'; guestId: string; flag: FlagKey}
  | {type: 'SET_STATUS'; guestId: string; status: GuestStatus}
  | {type: 'SET_PLANNED'; variantKey: string; planned: number}
  | {type: 'NUDGE'; guestId: string}
  | {type: 'UNDO'}
  | {type: 'SET_TAB'; tab: TabId; savedScrollTop: number}
  | {type: 'RETAP_TAB'}
  | {type: 'PUSH_DISH'; dishId: string; savedScrollTop: number}
  | {type: 'POP_MENU'}
  | {type: 'OPEN_SHEET'; sheet: NonNullable<SheetState>}
  | {type: 'CLOSE_SHEET'}
  | {type: 'SET_DETENT'; detent: 'medium' | 'large'}
  | {type: 'TOGGLE_SORT'; flag: FlagKey}
  | {type: 'REFRESH'};

let toastSeq = 0;

function domainOf(state: RosterState): DomainSlice {
  return {
    guests: state.guests,
    plannedOverrides: state.plannedOverrides,
    nudged: state.nudged,
    updatedLineIds: state.updatedLineIds,
  };
}

/** Commit a domain mutation: diff shopping before/after for the 'updated'
 * dots, snapshot the prior slice for one-assignment Undo, post the toast. */
function commitMutation(state: RosterState, next: Partial<DomainSlice>, toastText: string): RosterState {
  const prior = domainOf(state);
  const merged: DomainSlice = {...prior, ...next, updatedLineIds: prior.updatedLineIds};
  const beforeLines = selectShopping(prior.guests, prior.plannedOverrides);
  const afterLines = selectShopping(merged.guests, merged.plannedOverrides);
  const updatedLineIds = afterLines
    .filter((line, i) => line.qty !== beforeLines[i].qty || line.item !== beforeLines[i].item)
    .map(line => line.id);
  toastSeq += 1;
  return {
    ...state,
    ...merged,
    updatedLineIds,
    snapshot: prior,
    toast: {seq: toastSeq, text: toastText, undoable: true},
  };
}

function guestRosterReducer(state: RosterState, action: RosterAction): RosterState {
  switch (action.type) {
    case 'TOGGLE_FLAG': {
      const guest = state.guests.find(g => g.id === action.guestId);
      if (guest == null || guest.status === 'out') return state;
      const nowOn = !guest.flags[action.flag];
      const label = FLAG_COLS.find(c => c.key === action.flag)?.label.toLowerCase() ?? action.flag;
      const guests = state.guests.map(g =>
        g.id === action.guestId ? {...g, flags: {...g.flags, [action.flag]: nowOn}} : g,
      );
      return commitMutation(
        state,
        {guests},
        \`\${guest.name} \${nowOn ? 'marked' : 'unmarked'} \${label}\`,
      );
    }
    case 'SET_STATUS': {
      const guest = state.guests.find(g => g.id === action.guestId);
      if (guest == null || guest.status === action.status) return state;
      const statusWord = action.status === 'confirmed' ? 'Confirmed' : action.status === 'maybe' ? 'Maybe' : 'Out';
      const guests = state.guests.map(g => (g.id === action.guestId ? {...g, status: action.status} : g));
      return commitMutation(state, {guests}, \`\${guest.name} marked \${statusWord}\`);
    }
    case 'SET_PLANNED': {
      const clamped = Math.max(0, Math.min(PLANNED_MAX, action.planned));
      const dish = DISHES.find(d => d.variants.some(v => v.key === action.variantKey));
      const variant = dish?.variants.find(v => v.key === action.variantKey);
      if (dish == null || variant == null) return state;
      const current = plannedFor(state.plannedOverrides, variant);
      if (clamped === current) return state;
      return commitMutation(
        state,
        {plannedOverrides: {...state.plannedOverrides, [action.variantKey]: clamped}},
        \`\${dish.name} — \${variant.label} planned \${current} → \${clamped}\`,
      );
    }
    case 'NUDGE': {
      const guest = state.guests.find(g => g.id === action.guestId);
      if (guest == null || state.nudged.includes(action.guestId)) return state;
      return commitMutation(state, {nudged: [...state.nudged, action.guestId]}, \`Nudge sent to \${guest.name}\`);
    }
    case 'UNDO': {
      if (state.snapshot == null) return state;
      toastSeq += 1;
      // ONE assignment: the whole prior domain slice comes back — tallies,
      // rollers, badge, shopping lines, and dot markers all revert.
      return {
        ...state,
        ...state.snapshot,
        snapshot: null,
        toast: {seq: toastSeq, text: 'Restored', undoable: false},
      };
    }
    case 'SET_TAB': {
      if (action.tab === state.activeTab) return state;
      // Per-tab persistence: record outgoing scroll; overlays close (an
      // overlay belongs to its moment), the toast dock persists.
      return {
        ...state,
        activeTab: action.tab,
        scrollByTab: {...state.scrollByTab, [state.activeTab]: action.savedScrollTop},
        sheet: null,
      };
    }
    case 'RETAP_TAB':
      // The one legal reset: re-tapping the active tab pops to root
      // (scroll-to-top happens in the component, where the scroller lives).
      return state.activeTab === 'menu' ? {...state, menuScreen: 'root'} : state;
    case 'PUSH_DISH':
      return {
        ...state,
        menuScreen: action.dishId,
        scrollByTab: {...state.scrollByTab, menu: action.savedScrollTop},
      };
    case 'POP_MENU':
      return {...state, menuScreen: 'root'};
    case 'OPEN_SHEET':
      return {...state, sheet: action.sheet};
    case 'CLOSE_SHEET':
      return {...state, sheet: null};
    case 'SET_DETENT':
      return state.sheet == null ? state : {...state, sheet: {...state.sheet, detent: action.detent}};
    case 'TOGGLE_SORT':
      return {
        ...state,
        sortFlaggedFirstBy: state.sortFlaggedFirstBy === action.flag ? null : action.flag,
      };
    case 'REFRESH': {
      toastSeq += 1;
      // Synchronous by law: no skeleton, no timer — a static caption plus
      // one polite announcement through the single toastDock region.
      return {...state, refreshed: true, toast: {seq: toastSeq, text: 'Updated just now', undoable: false}};
    }
    default:
      return state;
  }
}

/** Flagged-first column sort — stable: flagged guests in fixture order,
 * then the rest in fixture order (deterministic secondary sort). */
function sortGuests(guests: Guest[], by: FlagKey | null): Guest[] {
  if (by == null) return guests;
  return [...guests.filter(g => g.flags[by]), ...guests.filter(g => !g.flags[by])];
}

// ---------------------------------------------------------------------------
// SHARED HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage. */
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

/** Nearest scrollable ancestor of the shell (the demo's .preview-wrap owns
 * page scroll) — per-tab scrollTop persistence + active-tab-re-tap pop. */
function getScroller(from: HTMLElement | null): HTMLElement | null {
  let node = from?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
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
// PLATE MARK — 28px Feastly brand mark: a dinner-plate circle split into
// four wedges at 100/66/33/0 fill-opacity of BRAND_ACCENT, the fullest
// wedge translated 2px outward along its bisector (up-right at 45°:
// +1.41, −1.41). aria-hidden in the navBar leading slot.
// ---------------------------------------------------------------------------

function PlateMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx={14} cy={14} r={12.5} stroke={BRAND_ACCENT} strokeWidth={1.5} fill="none" />
        {/* NE wedge — fullest (100%), translated 2px along its bisector. */}
        <path
          d="M14 14 L14 3.5 A10.5 10.5 0 0 1 24.5 14 Z"
          fill={BRAND_ACCENT}
          fillOpacity={1}
          transform="translate(1.41 -1.41)"
        />
        {/* SE wedge — 66%. */}
        <path d="M14 14 L24.5 14 A10.5 10.5 0 0 1 14 24.5 Z" fill={BRAND_ACCENT} fillOpacity={0.66} />
        {/* SW wedge — 33%. */}
        <path d="M14 14 L14 24.5 A10.5 10.5 0 0 1 3.5 14 Z" fill={BRAND_ACCENT} fillOpacity={0.33} />
        {/* NW wedge — 0% fill, hairline edge only. */}
        <path d="M14 14 L3.5 14 A10.5 10.5 0 0 1 14 3.5 Z" fill="none" stroke={BRAND_ACCENT} strokeWidth={1} strokeOpacity={0.4} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// NUMBER ROLLER — shared 20px-high (height-prop) overflow-hidden digit
// window: old value rolls up and out, new value rolls in (transform only,
// 200ms; the keyframe animates FROM translateY(0) TO the inline resting
// transform, so reduced-motion collapses to an instant swap). Value changes
// are announced ONLY via the single toastDock region — the roller is
// aria-hidden and every consumer pairs it with visually-hidden text.
// ---------------------------------------------------------------------------

interface RollerFrame {
  current: string;
  prev: string;
  key: number;
}

function NumberRoller({value, height = 20}: {value: string; height?: number}) {
  const [frame, setFrame] = useState<RollerFrame>({current: value, prev: value, key: 0});
  if (value !== frame.current) {
    // Derived-during-render (sanctioned React pattern): the previous value
    // is captured from the LIVE frame, so back-to-back toggles roll from
    // the current on-screen digit, never a stale snapshot (stress 5).
    setFrame({current: value, prev: frame.current, key: frame.key + 1});
  }
  const line: CSSProperties = {display: 'block', height, lineHeight: \`\${height}px\`};
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', height, verticalAlign: 'bottom'}} aria-hidden>
      <span
        key={frame.key}
        className={frame.key > 0 ? 'fst-roll' : undefined}
        style={{display: 'block', transform: \`translateY(-\${height}px)\`}}>
        <span style={line}>{frame.prev}</span>
        <span style={line}>{frame.current}</span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// MAYBE DECAY CHIP — 16px SVG ring, strokeDasharray fraction =
// invitedDaysAgo/7 (2d ≈ 29%, 5d ≈ 71%, 6d ≈ 86%); ring color flips from
// RING_REST to BRAND_ACCENT past the 4-day threshold. Static under reduced
// motion by construction (no animation exists; state is color + label).
// ---------------------------------------------------------------------------

const RING_R = 6;
const RING_C = 2 * Math.PI * RING_R; // ≈ 37.70

function MaybeDecayChip({days, nudgedLabel}: {days: number; nudgedLabel?: boolean}) {
  const frac = Math.min(days / 7, 1);
  const over = days > DECAY_THRESHOLD_DAYS;
  return (
    <span style={styles.decayChip}>
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
        {/* Remainder track — meaningful rest fill, REST_BOUNDARY ≥3:1. */}
        <circle cx={8} cy={8} r={RING_R} stroke={REST_BOUNDARY} strokeWidth={2} fill="none" opacity={0.55} />
        <circle
          cx={8}
          cy={8}
          r={RING_R}
          stroke={over ? BRAND_ACCENT : RING_REST}
          strokeWidth={2}
          fill="none"
          strokeDasharray={\`\${(frac * RING_C).toFixed(2)} \${RING_C.toFixed(2)}\`}
          strokeLinecap="round"
          transform="rotate(-90 8 8)"
        />
      </svg>
      <span style={styles.decayChipLabel}>{nudgedLabel ? 'Nudged' : \`\${days}d\`}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SHEET — two detents (medium 55% / large calc(100% − 56px)); 24px grabber
// zone with a real 36×5 pill button toggling detents, 52px header with a
// 44×44 X, focus-trapped, focus({preventScroll:true}) handled by the page.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  footer?: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, footer, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fst-sheet-in"
      style={{...styles.sheet, ...(detent === 'medium' ? styles.sheetMedium : styles.sheetLarge)}}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <button
        type="button"
        className="fst-btn fst-focusable"
        style={styles.grabberZone}
        aria-label={\`Resize sheet — \${detent === 'medium' ? 'expand' : 'collapse'}\`}
        onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
        <span style={styles.grabberPill} />
      </button>
      <div style={styles.sheetHeader}>
        <span />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="fst-btn fst-focusable" style={styles.iconBtn} aria-label="Close" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DIETARY MATRIX — dual-sticky pivot grid. Header row (44px) sticks at
// top:52 and the tally row (32px) at top:96, both z15 on the card's own
// background with a bottom hairline, so the 56px guest rows slide under
// two pinned rows ('above the fold' tallies). Every cell is a real
// <button aria-pressed> named '<flag> — <guest>'; column labels are real
// sort buttons (flagged-first, deterministic fixture-order secondary).
// ---------------------------------------------------------------------------

const STATUS_WORD: Record<GuestStatus, string> = {confirmed: 'Confirmed', maybe: 'Maybe', out: 'Out'};

interface DietaryMatrixProps {
  guests: Guest[];
  tallies: Tallies;
  sortBy: FlagKey | null;
  nudged: string[];
  onToggleSort: (flag: FlagKey) => void;
  onToggleFlag: (guestId: string, flag: FlagKey) => void;
  onOpenGuest: (guestId: string, opener: HTMLElement) => void;
}

function DietaryMatrix({guests, tallies, sortBy, nudged, onToggleSort, onToggleFlag, onOpenGuest}: DietaryMatrixProps) {
  return (
    <div style={styles.matrixCard} role="grid" aria-label="Guest dietary matrix">
      <div role="row" style={{...styles.matrixGridRow, ...styles.matrixHeaderRow}}>
        <div role="columnheader" style={styles.matrixHeadBlank}>
          <span className="fst-vh">Guest</span>
        </div>
        {FLAG_COLS.map(col => (
          <div
            key={col.key}
            role="columnheader"
            aria-sort={sortBy === col.key ? 'descending' : 'none'}
            style={{display: 'grid'}}>
            <button
              type="button"
              className="fst-btn fst-focusable"
              style={{...styles.colSortBtn, ...(sortBy === col.key ? styles.colSortBtnActive : null)}}
              aria-label={\`\${col.label} — sort flagged guests first\${sortBy === col.key ? ', active' : ''}\`}
              onClick={() => onToggleSort(col.key)}>
              {col.short}
            </button>
          </div>
        ))}
      </div>
      <div role="row" style={{...styles.matrixGridRow, ...styles.matrixTallyRow}}>
        <div role="cell" style={styles.tallyName}>
          Tally
        </div>
        {FLAG_COLS.map(col => {
          const confirmedCount = tallies.confirmedByFlag[col.key];
          const maybeCount = tallies.maybeByFlag[col.key];
          return (
            <div
              key={col.key}
              role="cell"
              aria-label={\`\${col.label}: \${confirmedCount} confirmed plus \${maybeCount} maybe\`}
              style={styles.tallyCell}>
              <NumberRoller value={String(confirmedCount)} />
              {maybeCount > 0 ? <span style={styles.tallyMaybe}>+{maybeCount}</span> : null}
            </div>
          );
        })}
      </div>
      {guests.map((guest, index) => {
        const isOut = guest.status === 'out';
        return (
          <div key={guest.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div
              role="row"
              style={{
                ...styles.matrixGridRow,
                ...styles.matrixGuestRow,
                ...(isOut ? styles.matrixGuestRowOut : null),
              }}>
              <div role="gridcell" style={{display: 'grid', minWidth: 0}}>
                <button
                  type="button"
                  className="fst-btn fst-focusable"
                  style={styles.nameCellBtn}
                  aria-label={\`\${guest.name}, \${STATUS_WORD[guest.status]} — guest details\`}
                  onClick={event => onOpenGuest(guest.id, event.currentTarget)}>
                  <span style={styles.guestName}>{guest.name}</span>
                  <span style={styles.guestStatusLine}>
                    <span>{STATUS_WORD[guest.status]}</span>
                    {guest.status === 'maybe' ? (
                      <MaybeDecayChip days={guest.invitedDaysAgo} nudgedLabel={nudged.includes(guest.id)} />
                    ) : null}
                  </span>
                </button>
              </div>
              {FLAG_COLS.map(col => {
                const on = guest.flags[col.key];
                return (
                  <div key={col.key} role="gridcell" style={{display: 'grid'}}>
                    <button
                      type="button"
                      className="fst-btn fst-focusable"
                      style={styles.cellBtn}
                      aria-pressed={on}
                      aria-label={\`\${col.label} — \${guest.name}\`}
                      disabled={isOut}
                      onClick={() => onToggleFlag(guest.id, col.key)}>
                      {on ? (
                        <span style={styles.cellBoxOn}>
                          <Icon icon={CheckIcon} size="sm" color="inherit" />
                        </span>
                      ) : (
                        <span style={styles.cellBoxOff} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SERVINGS RECALC BAR — sticky bottom:64 derived-aggregate strip; five
// NumberRoller cells, PURE selector over the roster: std = confirmed − veg
// − vgn (4+2+1 = 7 = confirmed ✓); GF/DF are OVERLAY counts, labeled so.
// Value changes announce ONLY via the single toastDock (undo-toast copy).
// ---------------------------------------------------------------------------

function ServingsRecalcBar({tallies}: {tallies: Tallies}) {
  const cells = [
    {label: 'STD', full: 'standard', value: tallies.std},
    {label: 'VEG', full: 'vegetarian', value: tallies.veg},
    {label: 'VGN', full: 'vegan', value: tallies.vgn},
    {label: 'GF OVL', full: 'gluten-free overlap', value: tallies.gf},
    {label: 'DF OVL', full: 'dairy-free overlap', value: tallies.df},
  ];
  return (
    <div style={styles.recalcBar} role="group" aria-label="Servings to cook">
      <span className="fst-vh">
        Servings: {cells.map(cell => \`\${cell.value} \${cell.full}\`).join(', ')}
      </span>
      {cells.map(cell => (
        <div key={cell.label} style={styles.recalcCell}>
          <span style={styles.recalcValue}>
            <NumberRoller value={String(cell.value)} />
          </span>
          <span style={styles.recalcLabel}>{cell.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GUEST SHEET BODY — status radiogroup (arrow keys), whole-row switches
// (the visible non-gesture toggle path for every matrix cell), and the
// invite section for maybes.
// ---------------------------------------------------------------------------

const STATUS_ORDER: GuestStatus[] = ['confirmed', 'maybe', 'out'];

interface GuestSheetBodyProps {
  guest: Guest;
  nudged: boolean;
  onSetStatus: (status: GuestStatus) => void;
  onToggleFlag: (flag: FlagKey) => void;
}

function GuestSheetBody({guest, nudged, onSetStatus, onToggleFlag}: GuestSheetBodyProps) {
  const onSegKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : STATUS_ORDER.length - 1;
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(guest.status) + delta) % STATUS_ORDER.length];
    onSetStatus(next);
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
    buttons[STATUS_ORDER.indexOf(next)]?.focus();
  };
  return (
    <div>
      <div role="radiogroup" aria-label="RSVP status" style={styles.segTrack} onKeyDown={onSegKeyDown}>
        {STATUS_ORDER.map(status => {
          const checked = guest.status === status;
          return (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              className="fst-btn fst-focusable"
              style={{...styles.segBtn, ...(checked ? styles.segBtnActive : null)}}
              onClick={() => onSetStatus(status)}>
              {STATUS_WORD[status]}
            </button>
          );
        })}
      </div>
      <h3 style={{...styles.sectionHeader, paddingInline: 16}}>Dietary flags</h3>
      <div style={{...styles.listCard, marginInline: 0}}>
        {FLAG_COLS.map((col, index) => {
          const on = guest.flags[col.key];
          return (
            <div key={col.key}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                role="switch"
                aria-checked={on}
                className="fst-btn fst-focusable"
                style={styles.switchRow}
                disabled={guest.status === 'out'}
                onClick={() => onToggleFlag(col.key)}>
                <span style={styles.switchRowLabel}>{col.label}</span>
                <span style={{...styles.switchTrack, ...(on ? styles.switchTrackOn : null)}} aria-hidden>
                  <span
                    style={{
                      ...styles.switchThumb,
                      transform: on ? 'translateX(20px)' : 'none',
                    }}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {guest.status === 'maybe' ? (
        <>
          <h3 style={{...styles.sectionHeader, paddingInline: 16}}>Invite</h3>
          <div style={{...styles.listCard, marginInline: 0}}>
            <div style={styles.utilityRow}>
              <span style={styles.utilityRowLabel}>
                Invited {guest.invitedDaysAgo} {guest.invitedDaysAgo === 1 ? 'day' : 'days'} ago
              </span>
              <MaybeDecayChip days={guest.invitedDaysAgo} nudgedLabel={nudged} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NUDGE QUEUE SHEET BODY — maybes past the 4-day decay threshold (g9, g10);
// 'Send nudge' is a 36px secondary button per row; sent state stays listed
// so Undo has somewhere visible to land.
// ---------------------------------------------------------------------------

interface NudgeSheetBodyProps {
  queue: Guest[];
  nudged: string[];
  onNudge: (guestId: string) => void;
}

function NudgeSheetBody({queue, nudged, onNudge}: NudgeSheetBodyProps) {
  return (
    <div>
      <p style={{margin: '4px 0 8px', fontSize: 13, color: 'var(--color-text-secondary)'}}>
        Maybes invited more than {DECAY_THRESHOLD_DAYS} days ago — a gentle reminder before the shop.
      </p>
      <div style={{...styles.listCard, marginInline: 0}}>
        {queue.map((guest, index) => {
          const sent = nudged.includes(guest.id);
          return (
            <div key={guest.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.nudgeRow}>
                <span style={styles.initialsDisc} aria-hidden>
                  {guest.initials}
                </span>
                <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
                  <span style={styles.guestName}>{guest.name}</span>
                  <span style={styles.guestStatusLine}>
                    <MaybeDecayChip days={guest.invitedDaysAgo} />
                  </span>
                </div>
                {sent ? (
                  <span style={styles.nudgedTag}>
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                    Nudged
                  </span>
                ) : (
                  <button
                    type="button"
                    className="fst-btn fst-focusable"
                    style={styles.secondaryBtn}
                    onClick={() => onNudge(guest.id)}>
                    Send nudge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePartyHeadcountGridTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;

  const [state, dispatch] = useReducer(guestRosterReducer, INITIAL_STATE);

  // Focus + scroll plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const largeTitleRef = useRef<HTMLDivElement | null>(null);
  const [compactTitle, setCompactTitle] = useState(false);

  // DERIVED — Menu and Shopping are pure projections of the roster, so a
  // matrix toggle shows consequences on other tabs with zero extra wiring.
  // SIGNATURE RIPPLE (demo script): tap the GF cell for Marcus (g2) →
  // gf tally rolls 2→3 (+1); recalc bar GF roller 2→3; Focaccia needs flip
  // to 4 std / 3 GF vs planned 5/2 → 'Short 1' → Menu tab badge '1';
  // Shopping regenerates exactly two lines — GF flour 240 g→360 g (3×120 ✓)
  // and Soy sauce→GF tamari (g2 is now a non-veg GF meat-eater) — both
  // dotted 'updated'; toast 'Marcus Webb marked gluten-free · Undo'. Undo
  // restores the snapshot in one assignment and the toast reads 'Restored'.
  const tallies = selectTallies(state.guests);
  const dishes = selectDishes(tallies, state.plannedOverrides);
  const shopping = selectShopping(state.guests, state.plannedOverrides);
  const nudgeQueueAll = state.guests.filter(
    g => g.status === 'maybe' && g.invitedDaysAgo > DECAY_THRESHOLD_DAYS,
  );
  const nudgeQueueOpen = selectNudgeQueue(state.guests, state.nudged);
  const sortedGuests = sortGuests(state.guests, state.sortFlaggedFirstBy);
  const menuBadge = dishes.filter(d => d.shortfall > 0).length;
  const activeDish = state.menuScreen === 'root' ? null : dishes.find(d => d.id === state.menuScreen) ?? null;
  const sheetGuest =
    state.sheet?.kind === 'guest' ? state.guests.find(g => g.id === state.sheet?.guestId) ?? null : null;

  // Large-title collapse — IntersectionObserver sentinel: the navBar center
  // title fades in once the largeTitle row has scrolled under the 52px bar.
  useEffect(() => {
    const element = largeTitleRef.current;
    if (element == null || state.activeTab !== 'guests') {
      setCompactTitle(state.activeTab !== 'guests');
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => setCompactTitle(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-53px 0px 0px 0px', threshold: 0},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [state.activeTab]);

  // Sheet focus lifecycle — focus({preventScroll:true}) into the opening
  // sheet (plain .focus() would scroll-reveal the animating sheet inside
  // the locked overflow-hidden column); restore to the opener on EVERY
  // close path (X, scrim, Escape, tab switch).
  const sheetIdent = state.sheet == null ? null : state.sheet.kind === 'guest' ? \`guest:\${state.sheet.guestId}\` : 'nudge';
  const hadSheetRef = useRef(false);
  useEffect(() => {
    if (sheetIdent != null) {
      hadSheetRef.current = true;
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    } else if (hadSheetRef.current) {
      hadSheetRef.current = false;
      sheetOpenerRef.current?.focus();
    }
  }, [sheetIdent]);

  // Escape closes the topmost (only) overlay — the sheet.
  useEffect(() => {
    if (state.sheet == null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch({type: 'CLOSE_SHEET'});
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.sheet]);

  // PER-TAB PERSISTENCE — restore the incoming tab's saved scrollTop after
  // its content commits (screenByTab already keeps Menu's pushed detail).
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = state.scrollByTab[state.activeTab];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTab]);

  const handleSelectTab = useCallback(
    (tab: TabId) => {
      const scroller = getScroller(shellRef.current);
      if (tab === state.activeTab) {
        // The one legal reset: re-tap pops to root + scrolls to top
        // (keyboard-reachable — the tabItem is a real button).
        dispatch({type: 'RETAP_TAB'});
        if (scroller != null) scroller.scrollTop = 0;
        return;
      }
      dispatch({type: 'SET_TAB', tab, savedScrollTop: scroller?.scrollTop ?? 0});
    },
    [state.activeTab],
  );

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const tabs: TabId[] = ['guests', 'menu', 'shopping'];
    const delta = event.key === 'ArrowRight' ? 1 : tabs.length - 1;
    const next = tabs[(tabs.indexOf(state.activeTab) + delta) % tabs.length];
    handleSelectTab(next);
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
    buttons[tabs.indexOf(next)]?.focus();
  };

  const openGuestSheet = (guestId: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'OPEN_SHEET', sheet: {kind: 'guest', guestId, detent: 'medium'}});
  };
  const openNudgeSheet = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'OPEN_SHEET', sheet: {kind: 'nudge', detent: 'medium'}});
  };
  const openDish = (dishId: string) => {
    const scroller = getScroller(shellRef.current);
    dispatch({type: 'PUSH_DISH', dishId, savedScrollTop: scroller?.scrollTop ?? 0});
    if (scroller != null) scroller.scrollTop = 0;
  };
  const popMenu = () => {
    const saved = state.scrollByTab.menu;
    dispatch({type: 'POP_MENU'});
    const scroller = getScroller(shellRef.current);
    requestAnimationFrame(() => {
      if (scroller != null) scroller.scrollTop = saved;
    });
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // toastDock: sticky-in-flow (bottom 124 Guests root / 76 elsewhere);
  // absolute z45 only while the shell is scroll-locked under a sheet.
  const dockStyle =
    state.sheet != null
      ? styles.toastAnchorLocked
      : state.activeTab === 'guests'
        ? styles.toastAnchorGuests
        : styles.toastAnchorOther;

  const isDishDetail = state.activeTab === 'menu' && activeDish != null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FEASTLY_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {isDishDetail ? (
              <button
                type="button"
                className="fst-btn fst-focusable"
                style={styles.backBtn}
                aria-label="Back to Menu"
                onClick={popMenu}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Menu</span>
              </button>
            ) : (
              <PlateMark />
            )}
          </div>
          {state.activeTab === 'guests' ? (
            <span
              className="fst-fade"
              style={{...styles.navTitle, opacity: compactTitle ? 1 : 0}}
              aria-hidden={!compactTitle}>
              Headcount
            </span>
          ) : isDishDetail ? (
            <span style={styles.navTitle}>{activeDish.name}</span>
          ) : (
            <h1 style={styles.navTitle}>{state.activeTab === 'menu' ? 'Menu' : 'Shopping'}</h1>
          )}
          <div style={styles.navTrailing}>
            {state.activeTab === 'guests' ? (
              <button
                type="button"
                className="fst-btn fst-focusable"
                style={styles.iconBtn}
                aria-label="Refresh RSVPs"
                onClick={() => dispatch({type: 'REFRESH'})}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : null}
          </div>
        </header>

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {state.activeTab === 'guests' ? (
            <>
              <div ref={largeTitleRef} style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>{EVENT.title}</h1>
              </div>
              <div style={styles.countStrip}>
                <div style={styles.countBlocks}>
                  {(
                    [
                      {label: 'Confirmed', value: tallies.confirmed},
                      {label: 'Maybe', value: tallies.maybe},
                      {label: 'Out', value: tallies.out},
                    ] as const
                  ).map(block => (
                    <div key={block.label} style={styles.countBlock}>
                      <span style={styles.countNum}>
                        <NumberRoller value={String(block.value)} height={24} />
                        <span className="fst-vh">{\`\${block.value} \${block.label}\`}</span>
                      </span>
                      <span style={styles.countLabel}>{block.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="fst-btn fst-focusable"
                  style={styles.nudgeChipHit}
                  aria-label={\`Nudge queue — \${nudgeQueueOpen.length} waiting\`}
                  onClick={event => openNudgeSheet(event.currentTarget)}>
                  <span style={styles.nudgeChip}>
                    <Icon icon={BellRingIcon} size="xs" color="inherit" />
                    {nudgeQueueOpen.length > 0 ? \`Nudge \${nudgeQueueOpen.length}\` : 'Nudged'}
                  </span>
                </button>
              </div>
              {state.refreshed ? <div style={styles.refreshCaption}>Updated just now</div> : null}
              <DietaryMatrix
                guests={sortedGuests}
                tallies={tallies}
                sortBy={state.sortFlaggedFirstBy}
                nudged={state.nudged}
                onToggleSort={flag => dispatch({type: 'TOGGLE_SORT', flag})}
                onToggleFlag={(guestId, flag) => dispatch({type: 'TOGGLE_FLAG', guestId, flag})}
                onOpenGuest={openGuestSheet}
              />
              <div style={styles.terminalCaption}>{state.guests.length} guests invited</div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {state.activeTab === 'menu' && activeDish == null ? (
            <>
              <h2 style={styles.screenSectionTitle}>
                Saturday · {dishes.length} dishes
              </h2>
              <div style={styles.listCard}>
                {dishes.map((dish, index) => (
                  <div key={dish.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="fst-btn fst-focusable"
                      style={{...styles.dishRow, width: '100%'}}
                      aria-label={\`\${dish.name}, \${dish.metaLine}\${dish.shortfall > 0 ? \`, short \${dish.shortfall}\` : ''} — adjust portions\`}
                      onClick={() => openDish(dish.id)}>
                      <span style={styles.dishText}>
                        <span style={styles.dishName}>{dish.name}</span>
                        <span style={styles.dishMeta}>{dish.metaLine}</span>
                      </span>
                      {dish.shortfall > 0 ? (
                        <span style={styles.shortPill}>
                          <Icon icon={CircleAlertIcon} size="xs" color="inherit" />
                          Short {dish.shortfall}
                        </span>
                      ) : (
                        <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}} aria-hidden>
                          <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.terminalCaption}>{EVENT.date}</div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {isDishDetail && activeDish != null ? (
            <>
              <h1 style={styles.screenSectionTitle}>{activeDish.name}</h1>
              <h3 style={styles.sectionHeader}>Planned portions</h3>
              <div style={styles.listCard}>
                {activeDish.variants.map((variant, index) => {
                  const atMin = variant.planned <= 0;
                  const atMax = variant.planned >= PLANNED_MAX;
                  return (
                    <div key={variant.key}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.variantRow}>
                        <span style={styles.variantText}>
                          <span style={styles.dishName}>{variant.label}</span>
                          <span style={styles.dishMeta}>
                            needs {variant.needs}
                            {variant.planned < variant.needs ? \` · short \${variant.needs - variant.planned}\` : ''}
                          </span>
                        </span>
                        <span style={styles.stepperGroup}>
                          <span style={styles.stepper}>
                            <button
                              type="button"
                              className="fst-btn fst-focusable"
                              style={{...styles.stepperHalf, ...(atMin ? styles.stepperHalfDisabled : null)}}
                              disabled={atMin}
                              aria-label={\`Decrease \${variant.label} portions\`}
                              onClick={() =>
                                dispatch({type: 'SET_PLANNED', variantKey: variant.key, planned: variant.planned - 1})
                              }>
                              <Icon icon={MinusIcon} size="sm" color="inherit" />
                            </button>
                            <span style={styles.stepperRule} />
                            <button
                              type="button"
                              className="fst-btn fst-focusable"
                              style={{...styles.stepperHalf, ...(atMax ? styles.stepperHalfDisabled : null)}}
                              disabled={atMax}
                              aria-label={\`Increase \${variant.label} portions\`}
                              onClick={() =>
                                dispatch({type: 'SET_PLANNED', variantKey: variant.key, planned: variant.planned + 1})
                              }>
                              <Icon icon={PlusIcon} size="sm" color="inherit" />
                            </button>
                          </span>
                          <span
                            tabIndex={0}
                            role="spinbutton"
                            aria-valuenow={variant.planned}
                            aria-valuemin={0}
                            aria-valuemax={PLANNED_MAX}
                            aria-label={\`\${variant.label} planned portions\`}
                            className="fst-focusable"
                            style={styles.stepperValue}
                            onKeyDown={event => {
                              if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                              event.preventDefault();
                              dispatch({
                                type: 'SET_PLANNED',
                                variantKey: variant.key,
                                planned: variant.planned + (event.key === 'ArrowUp' ? 1 : -1),
                              });
                            }}>
                            <NumberRoller value={String(variant.planned)} />
                            <span className="fst-vh">{variant.planned}</span>
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={styles.terminalCaption}>Raising planned clears the shortfall badge</div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {state.activeTab === 'shopping' ? (
            <>
              <h2 style={styles.screenSectionTitle}>
                {EVENT.date} · {tallies.confirmed} confirmed
              </h2>
              <div style={styles.listCard}>
                {shopping.map((line, index) => {
                  const updated = state.updatedLineIds.includes(line.id);
                  return (
                    <div key={line.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.utilityRow}>
                        <span style={styles.shopDotSlot} aria-hidden>
                          {updated ? <span style={styles.shopDot} /> : null}
                        </span>
                        <span style={styles.utilityRowLabel}>{line.item}</span>
                        {updated ? <span style={styles.shopUpdated}>updated</span> : null}
                        <span style={styles.utilityRowValue}>{line.qty}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={styles.terminalCaption}>All {shopping.length} items</div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}
        </main>

        {/* The single polite live region — sticky-in-flow toastDock. */}
        <div style={dockStyle} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="fst-fade">
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.undoable ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="fst-btn fst-focusable"
                    style={styles.toastUndoBtn}
                    onClick={() => dispatch({type: 'UNDO'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {state.activeTab === 'guests' ? <ServingsRecalcBar tallies={tallies} /> : null}

        <nav style={styles.tabBar} role="tablist" aria-label="Feastly sections" onKeyDown={onTabKeyDown}>
          {(
            [
              {id: 'guests' as TabId, label: 'Guests', icon: UsersIcon, badge: 0},
              {id: 'menu' as TabId, label: 'Menu', icon: UtensilsCrossedIcon, badge: menuBadge},
              {id: 'shopping' as TabId, label: 'Shopping', icon: ShoppingCartIcon, badge: 0},
            ] as const
          ).map(tab => {
            const active = state.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="fst-btn fst-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => handleSelectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.badge > 0 ? (
                    <span style={styles.tabBadge}>
                      <NumberRoller value={String(tab.badge)} height={13} />
                      <span className="fst-vh">{\`\${tab.badge} dishes short\`}</span>
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {state.sheet != null ? (
          <div style={styles.sheetScrim} onClick={() => dispatch({type: 'CLOSE_SHEET'})} aria-hidden />
        ) : null}
        {state.sheet?.kind === 'guest' && sheetGuest != null ? (
          <Sheet
            titleId="fst-guest-sheet-title"
            title={sheetGuest.name}
            detent={state.sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
            sheetRef={sheetRef}
            footer={
              sheetGuest.status === 'maybe' && !state.nudged.includes(sheetGuest.id) ? (
                <button
                  type="button"
                  className="fst-btn fst-focusable"
                  style={styles.primaryBtn}
                  onClick={() => dispatch({type: 'NUDGE', guestId: sheetGuest.id})}>
                  Send nudge
                </button>
              ) : undefined
            }>
            <GuestSheetBody
              guest={sheetGuest}
              nudged={state.nudged.includes(sheetGuest.id)}
              onSetStatus={status => dispatch({type: 'SET_STATUS', guestId: sheetGuest.id, status})}
              onToggleFlag={flag => dispatch({type: 'TOGGLE_FLAG', guestId: sheetGuest.id, flag})}
            />
          </Sheet>
        ) : null}
        {state.sheet?.kind === 'nudge' ? (
          <Sheet
            titleId="fst-nudge-sheet-title"
            title="Nudge queue"
            detent={state.sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
            sheetRef={sheetRef}>
            <NudgeSheetBody
              queue={nudgeQueueAll}
              nudged={state.nudged}
              onNudge={guestId => dispatch({type: 'NUDGE', guestId})}
            />
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}

`;export{e as default};