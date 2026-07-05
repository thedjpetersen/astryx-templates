var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Forkful "Today" log frozen
 *   mid-afternoon: TARGETS {kcal 2110, protein 140g, carbs 230g, fat 70g}
 *   (cross-check 4·140+4·230+9·70 = 560+920+630 = 2110 ✓); a 16-food
 *   CATALOG (4 per meal) whose every kcal is ARITHMETICALLY DERIVED as
 *   4P+4C+9F (spot-checks: f04 Grilled Chicken Bowl 152+120+81 = 353 ✓,
 *   f10 Salmon and Rice 136+164+117 = 417 ✓); 5 seeded loggedItems at
 *   1.0 servings with fixed clock strings (8:05 AM / 12:40 PM / 3:15 PM)
 *   summing to 1,106 kcal eaten (245+155+353+183+170), macros 77P/105C/42F
 *   (kcal cross-check 308+420+378 = 1,106 ✓), remaining 2,110−1,106 =
 *   1,004. No Date.now(), no Math.random(), no network media.
 * @output Forkful — Today's Meal Quick-Add Log: a 390px MOBILE
 *   meal-logging surface built for repetition speed. A large-title
 *   'Today' header collapses into the sticky navBar (IO sentinel wires
 *   the hairline + compact-title fade); a concentric three-arc macro
 *   dial (protein/carbs/fat, 270° arcs, shared 32px calorie numeral,
 *   error end-ticks on overshoot); a meal rail of calorie-sized dot
 *   anchors (Breakfast 21px / Lunch 24px / Snack 16px / Dinner 12px
 *   empty ring); per-meal 2-column quick-add tile grids that accumulate
 *   ×N count badges; swipe-to-delete logged rows with mandatory 44×44
 *   ellipsis menus; a sticky-in-flow Undo toast dock; and a sticky
 *   64px summary footer showing kcal remaining instead of a tab bar.
 *   SIGNATURE RIPPLE: one tile tap appends a loggedItem and — in the
 *   same frame — the tile badge increments, the dial arcs animate, the
 *   meal's rail dot re-derives its diameter, the sectionHeader kcal
 *   updates, a row appends, the footer remaining recomputes, and the
 *   one polite toast announces. Demo paths documented below: 3× Protein
 *   Shake → protein 77+90 = 167g (119% of 140) → clamped arc + error
 *   tick + '27g over' chip, eaten 1,619, footer '491 kcal left'
 *   (2110−1619 ✓); Salmon and Rice ×3 via the portion sheet = 1,251
 *   kcal (408+492+351 ✓) → eaten 2,357 → footer flips to '247 kcal
 *   over' in error (2357−2110 ✓); Almond Handful ×0.5 → 85 kcal row
 *   with '2.5 g' one-decimal readout (12+10+63 = 85 ✓).
 * @position Page template; emitted by \`astryx template mobile-meal-quickadd-log\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel; no notch, home indicator, or
 *   bezel). All overlays (scrim, PortionSheet, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toastDock is
 *   sticky-in-flow (bottom 76, above the 64px footer + 12) per the
 *   batch-1 amendment — shell-absolute would pin to the DOCUMENT
 *   bottom on this tall scrolling view.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); 2-col quick-add tile grids;
 *   no desktop Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Forkful ember — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule).
 *   Companion non-token literals each carry contrast math at the
 *   declaration: BRAND_TEXT (4.5:1+ brand-tinted text), BRAND_FILL_TEXT
 *   (badge text on brand pills — white fails at 3.3:1 so both schemes
 *   use a near-black ember), REST_RING (the Dinner empty-ring dot — an
 *   INTERACTIVE rest-state boundary, so ≥3:1 against the body surface
 *   per the batch-2 amendment, NOT the hairline token), and the scrim.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px between meal sections · 8px chip gaps; navBar 52px
 *   sticky top z20 (paddingInline 8, grid '1fr auto 1fr', blur surface,
 *   hairline wired to appear only after content scrolls under — this
 *   template wires scroll state via an IO sentinel); largeTitle 52px
 *   block below navBar (total large header 104px) that scrolls away;
 *   NO tabBar — summaryFooter replaces it: sticky bottom 0 z20, 64px,
 *   same blur surface, borderTop hairline, paddingInline 16. Rows: 60px
 *   two-line logged rows (16px/500 + 13px/400, 2px gap, 16px inline
 *   padding, full-width <button>); 44px compact empty row; tiles 116px
 *   in 2-col grids (gap 12); meal rail 56px (28px dot zone + 4 +
 *   11px/500 label); sectionHeader 13px/600 uppercase 0.06em at 32px
 *   from the stage edge, 20px top / 8px bottom. TYPE (Figtree via
 *   --font-family-body): 28/700 large title · 32/700 dial center (the
 *   sanctioned numeral exemption) · 17/600 nav + sheet titles · 16/400
 *   body floor · 13/400 meta · 11/500 rail labels + 11/600 badges;
 *   nothing under 11px; tabular-nums on every updating numeral (dial
 *   center, footer remaining, badges, kcal metas). Touch: 44×44 min
 *   everywhere with 8px clearance or merged full-row targets; the
 *   primary verb (tile tapping) lives in the body, the footer owns the
 *   running total; destructive only behind swipe/ellipsis menus. Sheet
 *   detents 55% MEDIUM / calc(100% − 56px) LARGE, 24px grabber zone
 *   with 36×5 pill button, 52px sheet header.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow: tile columns are '1fr
 *   1fr' (at 320px each tile is (320−32−12)/2 = 138px — names clamp to
 *   2 lines, kcal never wraps: nowrap + tabular); dial sizes via
 *   useElementWidth on the hero block — svg size = min(width − 32, 224),
 *   arcs scale by viewBox; rail buttons flex:1 (≈85px at 390, ≈72px at
 *   320 — labels ellipsize, dots never shrink below formula sizes);
 *   footer numeral + caption truncate before the jump button wraps.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered phone column (maxWidth 430, marginInline
 *   auto, borderInline hairlines); sticky navBar/footer/toast constrain
 *   to the same column because they anchor to shell. No media queries
 *   against the browser viewport, no width:390 literals anywhere.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Forkful ember, per spec). Used for FILLS
// and ≥3:1 graphics only: #E8663C on the white body ≈ 3.3:1 (passes the
// 3:1 non-text/boundary law, NOT 4.5:1 text); #F08B63 on the dark body
// (~#1C1C1E) ≈ 7.0:1.
const BRAND_ACCENT = 'light-dark(#E8663C, #F08B63)';
// Brand-tinted TEXT (active rail label, Undo button, legend accents,
// compact-title tint). #B8431C on #FFFFFF ≈ 5.5:1 ✓; #F0906A on the dark
// body ≈ 7.3:1 ✓ — both clear 4.5:1 where BRAND_ACCENT itself would fail
// in light scheme (3.3:1).
const BRAND_TEXT = 'light-dark(#B8431C, #F0906A)';
// Text over a BRAND_ACCENT fill (count badges, sheet confirm button). The
// spec's corner map said white badge text, but #FFF on #E8663C ≈ 3.3:1 —
// fails 4.5:1 at 11px/600 — so per the spec's own a11y note both schemes
// use near-black ember: #4A1505 on #E8663C ≈ 4.6:1 ✓; #401103 on #F08B63
// ≈ 6.6:1 ✓. (Deviation from the corner-map prose, sanctioned by the
// a11yPlan's explicit 4.5:1 requirement.)
const BRAND_FILL_TEXT = 'light-dark(#4A1505, #401103)';
// 8% brand wash behind counted tiles; the 1.5px BRAND_ACCENT border on
// that wash still reads ≈ 3.2:1 light / ≈ 5.9:1 dark (≥3:1 ✓).
const BRAND_TINT_8 = \`color-mix(in srgb, \${BRAND_ACCENT} 8%, var(--color-background-card))\`;
// Carbs arc stroke — spec-verbatim mix. Against the muted track it lands
// ≈ 3.6:1 light / ≈ 4.1:1 dark (mix pulls toward text-primary, the
// highest-contrast token on each surface) — ≥3:1 in both schemes ✓.
const CARB_ARC = \`color-mix(in srgb, \${BRAND_ACCENT} 62%, var(--color-text-primary))\`;
// Fat arc stroke — spec-verbatim mix toward text-secondary; ≈ 3.1:1
// light / ≈ 3.4:1 dark against the muted track ✓.
const FAT_ARC = \`color-mix(in srgb, \${BRAND_ACCENT} 45%, var(--color-text-secondary))\`;
// Dinner's EMPTY rail ring — an interactive rest-state boundary, so it
// gets an explicit ≥3:1 pair against the BODY surface per the batch-2
// amendment (the hairline --color-border token is for passive separators
// only): #8A7F73 on #FFFFFF ≈ 3.9:1 ✓; #8F857B on ~#1C1C1E ≈ 4.7:1 ✓.
const REST_RING = 'light-dark(#8A7F73, #8F857B)';
// Filled rail dots are BRAND_ACCENT fills: 3.3:1 light / 7.0:1 dark
// against the body — ≥3:1 for meaningful rest-state fills ✓ (math at the
// BRAND_ACCENT declaration).
// Text over the var(--color-error) delete block. The repo error token is
// a ~#C33-class red in light (white ≈ 4.9:1 ✓) and a 300-weight red in
// dark, where white fails — the dark side flips to near-black red:
// #2E0505 on a ~#F08080-class fill ≈ 7.5:1 ✓.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #2E0505)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, transitions (all
// collapse under prefers-reduced-motion), and the visually-hidden helper.
// ---------------------------------------------------------------------------

const FORKFUL_CSS = \`
.fkl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fkl-btn:disabled { cursor: default; }
.fkl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.fkl-fade { transition: opacity 200ms ease; }
.fkl-anim { transition: transform 240ms ease, opacity 240ms ease; }
.fkl-arc { transition: stroke-dashoffset 300ms ease; }
@keyframes fkl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fkl-sheet-in { animation: fkl-sheet-in 240ms ease; }
@media (prefers-reduced-motion: reduce) {
  .fkl-fade, .fkl-anim, .fkl-arc { transition: none; }
  .fkl-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
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
  // Scroll lock while the portion sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 buttons
  // optically align glyphs to the 16px gutter. Hairline + compact title
  // are WIRED to the IO sentinel (appear only after the large title
  // scrolls under) — noted per contract.
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
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    maxWidth: 200,
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
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  // LARGE TITLE — 52px block below the navBar; scrolls away while the
  // navBar stays sticky. Total large header = 104px.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  largeTitleH1: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  largeTitleCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // IO sentinel — 1px, sits above the largeTitle row; when it passes
  // under the 52px navBar, titleCollapsed flips.
  sentinel: {height: 1, marginBottom: -1},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // DIAL HERO — paddingInline 16 / paddingBlock 12 per spec.
  dialHero: {
    paddingInline: 16,
    paddingBlock: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  dialWrap: {position: 'relative'},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialCenterStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
  },
  // 32px/700 — the sanctioned dial-center numeral exemption; tabular so
  // 1,106 → 1,619 never shifts the caption.
  dialKcal: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  dialCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // Legend — three 44px-tall chip buttons, 8px gaps; wraps below ~430px
  // so 'Protein 77/140g' (and the longer '· 27g over' overshoot text)
  // never truncates at the 390px stage.
  legendRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  legendChip: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 12,
    minWidth: 0,
  },
  legendDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  legendText: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legendCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    minHeight: 18,
  },
  // MEAL RAIL — four flex:1 buttons, 56px tall (28px dot zone + 4px gap +
  // 11px/500 label). Plain in-flow, not sticky.
  mealRail: {
    display: 'flex',
    paddingInline: 16,
    marginBottom: 4,
  },
  railBtn: {
    flex: 1,
    minWidth: 0,
    height: 56,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
  },
  railDotZone: {
    height: 28,
    display: 'grid',
    placeItems: 'center',
  },
  railLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  // Active rail label: 600 weight BRAND_TEXT (≥4.5:1 pair, math at the
  // declaration).
  railLabelActive: {fontWeight: 600, color: BRAND_TEXT},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; kcal is live + tabular.
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
  // QUICK-ADD TILES — 2-col grid, gap 12, 116px tiles, at the 16px gutter.
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    paddingInline: 16,
    marginBottom: 12,
  },
  tileWrap: {position: 'relative'},
  // 8px block padding: 8+36 circle+4 gap+38.4 two-line name+17 kcal+8 =
  // 111.4 ≤ 116, so the second clamped line renders whole, never shorn.
  tileBtn: {
    width: '100%',
    height: 116,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: '8px 12px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  // Counted tile: 1.5px brand border (≈3.2:1 on the 8% wash — math at the
  // BRAND_TINT_8 declaration) + wash; padding drops 0.5px to keep the
  // 116px geometry from shifting.
  tileBtnOn: {
    border: \`1.5px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_8,
    padding: '7.5px 11.5px',
  },
  tileCircle: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  tileName: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.2,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  tileKcal: {
    marginTop: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    // Clears the 44×44 ellipsis hit in the tile's bottom-right corner.
    paddingRight: 36,
  },
  // Count badge — top −6 / right −6, min-width 20px brand pill, 11px/600
  // BRAND_FILL_TEXT (4.6:1 light / 6.6:1 dark — math at the declaration).
  tileBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    paddingInline: 6,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
  },
  tileEllipsis: {
    position: 'absolute',
    right: 0,
    bottom: 0,
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
  // LOGGED ROW — 60px two-line swipeable row.
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  // 72px delete block revealed at −72px. var(--color-error) fill;
  // ERROR_FILL_TEXT pair carries the contrast math.
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
    gap: 2,
    background: 'var(--color-error)',
    color: ERROR_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
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
  rowKcal: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Compact empty row (Dinner true-empty; tiles above are the affordance,
  // so no full emptyState block — one per contract).
  emptyRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // TOAST DOCK — sticky-in-flow per the batch-1 amendment: the shell
  // grows with content, so absolute bottom pins to the DOCUMENT bottom;
  // sticky bottom 76 rides 12px above the 64px footer instead.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    paddingInlineEnd: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
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
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
    borderRadius: 12,
  },
  // SUMMARY FOOTER — sticky bottom 0 z20, 64px, blur surface; replaces
  // the tab bar on this single-screen surface.
  summaryFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  footerStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  footerNumeral: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 11px/500 macro caption — --color-text-secondary is a body-text token
  // ≥4.5:1 on the body surface in both schemes per the token contract.
  footerCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 36px secondary jump button — safe verb only in this corner.
  jumpBtn: {
    height: 36,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // ANCHORED MENUS — absolute cards, 12px radius, 44px rows, z30; a
  // transparent backdrop at z29 makes tap-elsewhere-closes real.
  menuBackdrop: {position: 'absolute', inset: 0, zIndex: 29},
  anchoredMenu: {
    position: 'absolute',
    zIndex: 30,
    minWidth: 200,
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
    paddingInline: 14,
    fontSize: 16,
  },
  menuRowDestructive: {color: 'var(--color-error)'},
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // PORTION SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  // The ONE legal inner scroller — sheet content only.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooterArea: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  confirmBtn: {
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
  },
  // Serving stepper — 96×32 muted track, hairline-split halves whose hit
  // areas extend to 44×44 via the row's padding; value trailing as
  // role='spinbutton'.
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    paddingBlock: 6,
  },
  stepperLabel: {fontSize: 16},
  stepperGroup: {display: 'flex', alignItems: 'center', gap: 12},
  stepperTrack: {
    width: 96,
    height: 32,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperSplit: {width: 1, background: 'var(--color-border)', flexShrink: 0},
  stepperValue: {
    minWidth: 44,
    textAlign: 'right',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 8,
  },
  // Live macro readout — 3 utility rows in a card.
  sheetCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background-card)',
    overflow: 'hidden',
    marginBlock: 8,
  },
  sheetCardRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  sheetCardValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 4-segment meal picker — 36px muted track, active card pill (radiogroup
  // with arrow keys per the segmented-control contract).
  segLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6},
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    marginBottom: 8,
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — every kcal ARITHMETICALLY DERIVED: kcal = 4·protein +
// 4·carbs + 9·fat, exact for every food (kcalOf() below is the single
// source; the stored kcal field is the cross-checked dual). Identity
// consts; fixed clock strings; no dates beyond 'Today'.
// ---------------------------------------------------------------------------

// Cross-check: 4·140 + 4·230 + 9·70 = 560 + 920 + 630 = 2,110 ✓.
const TARGETS = {kcal: 2110, protein: 140, carbs: 230, fat: 70} as const;

type MealId = 'breakfast' | 'lunch' | 'snack' | 'dinner';

const MEAL_ORDER: MealId[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABEL: Record<MealId, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

type GlyphId =
  | 'bowl'
  | 'egg'
  | 'wrap'
  | 'shake'
  | 'fish'
  | 'soup'
  | 'apple'
  | 'nut'
  | 'yogurt'
  | 'square'
  | 'skillet'
  | 'plate';

interface Food {
  id: string;
  name: string;
  glyph: GlyphId;
  mealId: MealId;
  protein: number; // grams per serving
  carbs: number;
  fat: number;
  kcal: number; // dual field — always 4P+4C+9F (verified per row)
}

/** The one kcal law: 4P + 4C + 9F, exact. */
function kcalOf(food: {protein: number; carbs: number; fat: number}): number {
  return 4 * food.protein + 4 * food.carbs + 9 * food.fat;
}

// CATALOG — 16 foods, 4 per meal. Spot-checks: f04 = 152+120+81 = 353 ✓;
// f10 = 136+164+117 = 417 ✓. f11's 51-char name is the tile 2-line-clamp
// + 60px-row truncation stress fixture.
const CATALOG: Food[] = [
  // Breakfast
  {id: 'f01', name: 'Greek Yogurt Cup', glyph: 'yogurt', mealId: 'breakfast', protein: 17, carbs: 9, fat: 4, kcal: 140},
  {id: 'f02', name: 'Berry Oat Bowl', glyph: 'bowl', mealId: 'breakfast', protein: 8, carbs: 42, fat: 5, kcal: 245},
  {id: 'f03', name: 'Scrambled Eggs', glyph: 'egg', mealId: 'breakfast', protein: 13, carbs: 1, fat: 11, kcal: 155},
  {id: 'f12', name: 'Cottage Cheese Bowl', glyph: 'bowl', mealId: 'breakfast', protein: 22, carbs: 8, fat: 5, kcal: 165},
  // Lunch
  {id: 'f04', name: 'Grilled Chicken Bowl', glyph: 'bowl', mealId: 'lunch', protein: 38, carbs: 30, fat: 9, kcal: 353},
  {id: 'f05', name: 'Turkey Avocado Wrap', glyph: 'wrap', mealId: 'lunch', protein: 24, carbs: 33, fat: 10, kcal: 318},
  {id: 'f06', name: 'Lentil Soup', glyph: 'soup', mealId: 'lunch', protein: 12, carbs: 27, fat: 3, kcal: 183},
  {id: 'f14', name: 'Miso Tofu Rice Plate', glyph: 'plate', mealId: 'lunch', protein: 18, carbs: 45, fat: 9, kcal: 333},
  // Snack
  {id: 'f07', name: 'Almond Handful', glyph: 'nut', mealId: 'snack', protein: 6, carbs: 5, fat: 14, kcal: 170},
  {id: 'f08', name: 'Apple + Peanut Butter', glyph: 'apple', mealId: 'snack', protein: 5, carbs: 24, fat: 8, kcal: 188},
  {id: 'f09', name: 'Protein Shake', glyph: 'shake', mealId: 'snack', protein: 30, carbs: 6, fat: 3, kcal: 171},
  {id: 'f13', name: 'Dark Chocolate Square', glyph: 'square', mealId: 'snack', protein: 1, carbs: 7, fat: 4, kcal: 68},
  // Dinner
  {id: 'f10', name: 'Salmon and Rice', glyph: 'fish', mealId: 'dinner', protein: 34, carbs: 41, fat: 13, kcal: 417},
  // 51 chars — tile clamp + row truncation stress.
  {id: 'f11', name: 'Slow-Roasted Sweet Potato & Black Bean Quinoa Bowl', glyph: 'bowl', mealId: 'dinner', protein: 15, carbs: 58, fat: 12, kcal: 400},
  {id: 'f15', name: 'Chicken Fajita Skillet', glyph: 'skillet', mealId: 'dinner', protein: 36, carbs: 22, fat: 14, kcal: 358},
  {id: 'f16', name: 'Roasted Veggie Plate', glyph: 'plate', mealId: 'dinner', protein: 7, carbs: 28, fat: 6, kcal: 194},
];

const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(CATALOG.map(food => [food.id, food]));

interface LoggedItem {
  id: string;
  foodId: string;
  mealId: MealId;
  servings: number; // 0.5 steps, 0.5–3.0
  time: string; // fixed clock string; new entries use 'Just now'
}

// SEEDED loggedItems — 5 entries, all servings 1.0, fixed times.
// Aggregates (all constructible): eaten 245+155+353+183+170 = 1,106;
// protein 8+13+38+12+6 = 77g; carbs 42+1+30+27+5 = 105g; fat 5+11+9+3+14
// = 42g; cross-check 4·77+4·105+9·42 = 308+420+378 = 1,106 ✓; remaining
// 2110−1106 = 1,004; per-meal Breakfast 400 / Lunch 536 / Snack 170 /
// Dinner 0, sum = 1,106 ✓. Tile badges: f02 ×1, f03 ×1, f04 ×1, f06 ×1,
// f07 ×1. Rail dots (12 + round(16·min(kcal/700,1))): 21/24/16/12px.
const SEEDED_ITEMS: LoggedItem[] = [
  {id: 'li1', foodId: 'f02', mealId: 'breakfast', servings: 1, time: '8:05 AM'},
  {id: 'li2', foodId: 'f03', mealId: 'breakfast', servings: 1, time: '8:05 AM'},
  {id: 'li3', foodId: 'f04', mealId: 'lunch', servings: 1, time: '12:40 PM'},
  {id: 'li4', foodId: 'f06', mealId: 'lunch', servings: 1, time: '12:40 PM'},
  {id: 'li5', foodId: 'f07', mealId: 'snack', servings: 1, time: '3:15 PM'},
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** 1004 → '1,004'. */
function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Grams with exact-half display: 3 → '3', 2.5 → '2.5'. */
function fmtGrams(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** 0.5 → '0.5 servings', 1 → '1 serving', 2 → '2 servings'. */
function fmtServings(n: number): string {
  const value = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return \`\${value} \${n === 1 ? 'serving' : 'servings'}\`;
}

/** Exact kcal for an item (internal sums stay exact; display rounds). */
function itemKcal(item: LoggedItem): number {
  return kcalOf(FOOD_BY_ID[item.foodId]) * item.servings;
}

interface MacroTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

function totalsOf(items: LoggedItem[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (acc, item) => {
      const food = FOOD_BY_ID[item.foodId];
      return {
        kcal: acc.kcal + kcalOf(food) * item.servings,
        protein: acc.protein + food.protein * item.servings,
        carbs: acc.carbs + food.carbs * item.servings,
        fat: acc.fat + food.fat * item.servings,
      };
    },
    {kcal: 0, protein: 0, carbs: 0, fat: 0},
  );
}

/** Rail dot diameter: 12 + round(16 × min(mealKcal/700, 1)). Seeded:
 * Breakfast 12+round(16·400/700) = 21; Lunch 12+round(16·536/700) = 24;
 * Snack 12+round(16·170/700) = 16; Dinner 12 (empty ring). Stress 5:
 * four Dark Chocolate Squares → snack 170+272 = 442 → 12+round(16·442/
 * 700) = 12+10 = 22 ✓. */
function railDotSize(mealKcal: number): number {
  return 12 + Math.round(16 * Math.min(mealKcal / 700, 1));
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — the root component holds {loggedItems, nextId, sheet,
// menu, openSwipeId, activeMeal, toast, refreshed, titleCollapsed,
// legendMacro} plus update(id, patch) mapping over loggedItems. Every
// mutation flows through setState on this owner; all other surfaces are
// pure derivations (totals, per-meal kcal, per-tile counts, arc
// fractions, dot sizes, remaining).
// ---------------------------------------------------------------------------

type MacroKey = 'protein' | 'carbs' | 'fat';

interface SheetState {
  foodId: string;
  mealId: MealId;
  servings: number;
  editingItemId?: string;
  detent: 'medium' | 'large';
}

interface MenuState {
  kind: 'tile' | 'row';
  id: string; // foodId for tiles, loggedItem id for rows
}

interface ToastState {
  seq: number;
  msg: string;
  undoSnapshot?: {item: LoggedItem; index: number};
}

interface ForkfulState {
  loggedItems: LoggedItem[];
  nextId: number; // 6 after the 5 seeded items
  sheet: SheetState | null;
  menu: MenuState | null;
  openSwipeId: string | null;
  activeMeal: MealId;
  toast: ToastState | null;
  refreshed: boolean;
  titleCollapsed: boolean;
  legendMacro: MacroKey | null;
}

const INITIAL_STATE: ForkfulState = {
  loggedItems: SEEDED_ITEMS,
  nextId: 6,
  sheet: null,
  menu: null,
  openSwipeId: null,
  activeMeal: 'breakfast',
  toast: null,
  refreshed: false,
  titleCollapsed: false,
  legendMacro: null,
};

/**
 * Container-width hook (grid-feeder-console pattern): only a
 * ResizeObserver on the wrapper can tell the 390px mobile stage from the
 * ~1045px desktop stage inside the same 1440px window.
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

// Sheets trap focus while open; Escape closes the topmost overlay only;
// focus restores to the opener on every close path.
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [role="spinbutton"]');
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
// FORKMARK — inline SVG 24×24: three vertical rounded-cap tine bars of
// ascending height acting as bar-chart bars (x-centers 7.5/11.5/15.5,
// width 3, rx 1.5, tops y=9/6.5/4, bottoms meeting the collar at y=13),
// joined by a rounded handle stem (3.5-wide, rx 1.75, x-center 11.5,
// y 13→21). Single currentColor fill: BRAND_ACCENT in the navBar (3.3:1
// on the light body ≥3:1 graphics law ✓), text-primary elsewhere.
// ---------------------------------------------------------------------------

interface ForkMarkProps {
  size: number;
}

function ForkMark({size}: ForkMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x={6} y={9} width={3} height={5.5} rx={1.5} />
      <rect x={10} y={6.5} width={3} height={8} rx={1.5} />
      <rect x={14} y={4} width={3} height={10.5} rx={1.5} />
      <rect x={9.75} y={13} width={3.5} height={8} rx={1.75} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FOOD GLYPHS — 12 tiny inline 24×24 stroke paths keyed by food.glyph
// (emoji-free), rendered at 22px inside the 36px muted tile circle.
// ---------------------------------------------------------------------------

const GLYPH_PATHS: Record<GlyphId, ReactNode> = {
  bowl: (
    <>
      <path d="M4 12h16a8 8 0 0 1-16 0Z" />
      <path d="M8 8c0-1.5 1.5-2 1.5-3.5M13 8c0-1.5 1.5-2 1.5-3.5" />
    </>
  ),
  egg: <path d="M12 4c3.2 0 6 4.6 6 8.4a6 6 0 0 1-12 0C6 8.6 8.8 4 12 4Z" />,
  wrap: (
    <>
      <path d="M5 15 15 5l4 4L9 19H5v-4Z" />
      <path d="m12 8 4 4" />
    </>
  ),
  shake: (
    <>
      <path d="M7 8h10l-1.2 12H8.2L7 8Z" />
      <path d="M10 8l3-5" />
    </>
  ),
  fish: (
    <>
      <path d="M4 12c3-4 8-5 12-2 2 1.4 3 2 4 2-1 0-2 .6-4 2-4 3-9 2-12-2Z" />
      <path d="M16 12h.01" />
    </>
  ),
  soup: (
    <>
      <path d="M5 13h14a7 7 0 0 1-14 0Z" />
      <path d="M9 9V6M15 9V6" />
    </>
  ),
  apple: (
    <>
      <path d="M12 8c-4-2-7 1-6 5s3.5 7 6 7 5-3 6-7-2-7-6-5Z" />
      <path d="M12 8c0-2 1-3 3-4" />
    </>
  ),
  nut: (
    <>
      <path d="m12 4 6 3.5v7L12 20l-6-5.5v-7L12 4Z" />
      <path d="M12 10v4" />
    </>
  ),
  yogurt: (
    <>
      <path d="M7 6h10l-1 14H8L7 6Z" />
      <path d="M7 10h10" />
    </>
  ),
  square: (
    <>
      <rect x={5} y={5} width={14} height={14} rx={2} />
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  skillet: (
    <>
      <circle cx={10} cy={12} r={6} />
      <path d="M16 12h5" />
    </>
  ),
  plate: (
    <>
      <circle cx={12} cy={12} r={8} />
      <circle cx={12} cy={12} r={4} />
    </>
  ),
};

interface FoodGlyphProps {
  glyph: GlyphId;
}

function FoodGlyph({glyph}: FoodGlyphProps) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden>
      {GLYPH_PATHS[glyph]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CONCENTRIC MACRO DIAL — viewBox '0 0 224 224', center 112,112. Three
// 270° arcs (gap opening at bottom: dash start rotated +135° from
// 3 o'clock = the 7:30 position, sweeping clockwise to 4:30), strokeWidth
// 12, round caps, tracks var(--color-background-muted). Arc lengths
// (0.75 × 2πr): protein r=100 → 471.2, carbs r=84 → 395.8, fat r=68 →
// 320.4. Fill fraction min(value/target, 1) via strokeDasharray/
// dashoffset (300ms dashoffset transition, instant under reduced
// motion). Overshoot clamps the fill and renders a 3×16 rounded
// var(--color-error) end tick at the 270° end angle. role='img' with a
// composed label; NOT a live region — the toastDock is the announcer.
// ---------------------------------------------------------------------------

const DIAL_CENTER = 112;
const ARC_SWEEP = 0.75; // 270° of the full circle

interface DialArcSpec {
  key: MacroKey;
  radius: number;
  stroke: string;
}

const DIAL_ARCS: DialArcSpec[] = [
  {key: 'protein', radius: 100, stroke: BRAND_ACCENT}, // arclen 471.2
  {key: 'carbs', radius: 84, stroke: CARB_ARC}, // arclen 395.8
  {key: 'fat', radius: 68, stroke: FAT_ARC}, // arclen 320.4
];

const MACRO_LABEL: Record<MacroKey, string> = {protein: 'Protein', carbs: 'Carbs', fat: 'Fat'};

interface ConcentricMacroDialProps {
  size: number; // rendered px; arcs scale by viewBox
  totals: MacroTotals;
}

function ConcentricMacroDial({size, totals}: ConcentricMacroDialProps) {
  const eaten = Math.round(totals.kcal);
  const label =
    \`\${fmtInt(eaten)} of \${fmtInt(TARGETS.kcal)} calories eaten. \` +
    DIAL_ARCS.map(arc => {
      const value = totals[arc.key];
      const target = TARGETS[arc.key];
      const over = value > target ? \`, \${fmtGrams(value - target)} grams over target\` : '';
      return \`\${MACRO_LABEL[arc.key]} \${fmtGrams(value)} of \${target} grams\${over}\`;
    }).join('. ') +
    '.';
  return (
    <div style={{...styles.dialWrap, width: size, height: size}} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 224 224" fill="none" aria-hidden>
        {DIAL_ARCS.map(arc => {
          const circumference = 2 * Math.PI * arc.radius;
          const arcLen = circumference * ARC_SWEEP;
          const value = totals[arc.key];
          const target = TARGETS[arc.key];
          const fraction = Math.min(value / target, 1);
          const overshoot = value > target;
          return (
            <g key={arc.key}>
              {/* Track — passive gauge remainder, muted per spec; the
                  value strokes carry the ≥3:1 math at their declarations. */}
              <circle
                cx={DIAL_CENTER}
                cy={DIAL_CENTER}
                r={arc.radius}
                stroke="var(--color-background-muted)"
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={\`\${arcLen} \${circumference}\`}
                transform={\`rotate(135 \${DIAL_CENTER} \${DIAL_CENTER})\`}
              />
              <circle
                className="fkl-arc"
                cx={DIAL_CENTER}
                cy={DIAL_CENTER}
                r={arc.radius}
                stroke={arc.stroke}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={\`\${arcLen} \${circumference}\`}
                strokeDashoffset={arcLen * (1 - fraction)}
                transform={\`rotate(135 \${DIAL_CENTER} \${DIAL_CENTER})\`}
              />
              {/* Overshoot end tick — the arc ends at +45° (135° start +
                  270° sweep); a 12-o'clock rect rotated +135° lands there. */}
              {overshoot ? (
                <g transform={\`rotate(135 \${DIAL_CENTER} \${DIAL_CENTER})\`}>
                  <rect
                    x={DIAL_CENTER - 1.5}
                    y={DIAL_CENTER - arc.radius - 8}
                    width={3}
                    height={16}
                    rx={1.5}
                    fill="var(--color-error)"
                  />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={styles.dialCenter}>
        <div style={styles.dialCenterStack}>
          <span style={styles.dialKcal}>{fmtInt(eaten)}</span>
          <span style={styles.dialCaption}>of {fmtInt(TARGETS.kcal)} kcal</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MEAL RAIL DOTS — four labeled flex:1 dot buttons doubling as scroll
// anchors; diameter re-derives on every add (formula at railDotSize).
// Dinner's empty state is a 2px REST_RING ring (≥3:1 boundary law).
// ---------------------------------------------------------------------------

interface MealRailDotsProps {
  mealKcals: Record<MealId, number>;
  activeMeal: MealId;
  onJump: (mealId: MealId) => void;
}

function MealRailDots({mealKcals, activeMeal, onJump}: MealRailDotsProps) {
  return (
    <div style={styles.mealRail}>
      {MEAL_ORDER.map(mealId => {
        const kcal = Math.round(mealKcals[mealId]);
        const diameter = railDotSize(kcal);
        const isEmpty = kcal === 0;
        const isActive = mealId === activeMeal;
        return (
          <button
            key={mealId}
            type="button"
            className="fkl-btn fkl-focusable"
            style={styles.railBtn}
            aria-label={\`\${MEAL_LABEL[mealId]}, \${fmtInt(kcal)} calories logged, jump to section\`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onJump(mealId)}>
            <span style={styles.railDotZone} aria-hidden>
              <span
                className="fkl-anim"
                style={{
                  width: diameter,
                  height: diameter,
                  borderRadius: 999,
                  background: isEmpty ? 'transparent' : BRAND_ACCENT,
                  border: isEmpty ? \`2px solid \${REST_RING}\` : 'none',
                }}
              />
            </span>
            <span style={{...styles.railLabel, ...(isActive ? styles.railLabelActive : null)}}>
              {MEAL_LABEL[mealId]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUICK-ADD TILE — the whole tile is the add <button> ('Add Berry Oat
// Bowl, 245 calories'); a SIBLING 44×44 MoreHorizontal button opens the
// anchored menu (the mandatory visible path); long-press 450ms (cancel on
// 8px move) opens the portion sheet. Count badge appears at count ≥ 1.
// ---------------------------------------------------------------------------

interface QuickAddTileProps {
  food: Food;
  count: number;
  isMenuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onAdd: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onAdjust: () => void;
  onMenuAddOne: () => void;
  onLongPress: () => void;
}

function QuickAddTile({
  food,
  count,
  isMenuOpen,
  menuRef,
  onAdd,
  onToggleMenu,
  onAdjust,
  onMenuAddOne,
  onLongPress,
}: QuickAddTileProps) {
  const timerRef = useRef<number | null>(null);
  const originRef = useRef({x: 0, y: 0});
  const firedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    firedRef.current = false;
    originRef.current = {x: event.clientX, y: event.clientY};
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, 450);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const dx = event.clientX - originRef.current.x;
    const dy = event.clientY - originRef.current.y;
    if (Math.hypot(dx, dy) > 8) clearTimer();
  };
  const onTileClick = () => {
    clearTimer();
    if (firedRef.current) {
      firedRef.current = false;
      return; // long-press already opened the sheet
    }
    onAdd();
  };

  return (
    <div style={styles.tileWrap}>
      <button
        type="button"
        className="fkl-btn fkl-focusable"
        style={{...styles.tileBtn, ...(count >= 1 ? styles.tileBtnOn : null)}}
        aria-label={\`Add \${food.name}, \${fmtInt(food.kcal)} calories\${count >= 1 ? \`, logged \${count} times today\` : ''}\`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clearTimer}
        onPointerCancel={clearTimer}
        onClick={onTileClick}>
        <span style={styles.tileCircle} aria-hidden>
          <FoodGlyph glyph={food.glyph} />
        </span>
        <span style={styles.tileName}>{food.name}</span>
        <span style={styles.tileKcal}>{fmtInt(food.kcal)} kcal</span>
      </button>
      {count >= 1 ? (
        <span style={styles.tileBadge} aria-hidden>
          ×{count}
        </span>
      ) : null}
      <button
        type="button"
        className="fkl-btn fkl-focusable"
        style={styles.tileEllipsis}
        aria-label={\`More options for \${food.name}\`}
        aria-expanded={isMenuOpen}
        onClick={event => onToggleMenu(event.currentTarget)}>
        <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
      </button>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Options for \${food.name}\`}
          style={{...styles.anchoredMenu, right: 4, bottom: 40}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="fkl-btn fkl-focusable" style={styles.menuRow} onClick={onAdjust}>
            <span style={styles.menuRowText}>Adjust portion…</span>
          </button>
          <div style={styles.rowDivider} />
          <button type="button" role="menuitem" className="fkl-btn fkl-focusable" style={styles.menuRow} onClick={onMenuAddOne}>
            <span style={styles.menuRowText}>Add 1 serving</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOGGED ROW — 60px swipeable two-line row: pointer drag snaps open at
// −72px revealing the var(--color-error) Delete block; one row open at a
// time; the MANDATORY trailing 44×44 ellipsis opens the same actions as
// an anchored menu ('Edit portion' + destructive 'Delete'). Delete
// executes immediately + Undo toast (undoOverConfirm — no confirms).
// ---------------------------------------------------------------------------

interface LoggedRowProps {
  item: LoggedItem;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function LoggedRow({
  item,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onToggleMenu,
  onEdit,
  onDelete,
}: LoggedRowProps) {
  const food = FOOD_BY_ID[item.foodId];
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-72, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -36) onSwipeOpen();
      else onSwipeClose();
    }
  };
  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  const displayKcal = Math.round(itemKcal(item));
  return (
    <div style={styles.rowOuter}>
      <div style={styles.rowClip}>
        <button
          type="button"
          className="fkl-btn"
          style={styles.deleteAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onDelete}>
          <Icon icon={Trash2Icon} size="sm" color="inherit" />
          Delete
        </button>
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="fkl-btn fkl-focusable"
            style={styles.rowBtn}
            aria-label={\`\${food.name}, \${fmtServings(item.servings)}, \${fmtInt(displayKcal)} calories — edit portion\`}
            onClick={guardClick(() => {
              if (isSwipeOpen) {
                onSwipeClose();
                return;
              }
              onEdit();
            })}>
            <span style={styles.rowText}>
              <span style={styles.rowPrimary}>{food.name}</span>
              <span style={styles.rowSecondary}>
                {fmtServings(item.servings)} · {item.time}
              </span>
            </span>
            <span style={styles.rowKcal}>{fmtInt(displayKcal)}</span>
          </button>
          <button
            type="button"
            className="fkl-btn fkl-focusable"
            style={styles.iconBtn}
            aria-label={\`Actions for \${food.name}\`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${food.name}\`}
          style={{...styles.anchoredMenu, right: 12, top: 52}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="fkl-btn fkl-focusable" style={styles.menuRow} onClick={onEdit}>
            <span style={styles.menuRowText}>Edit portion</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="fkl-btn fkl-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={onDelete}>
            <Icon icon={Trash2Icon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Delete</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PORTION SHEET — MEDIUM-default (55%) bottom sheet with the 0.5-step
// serving stepper (spinbutton 0.5–3.0), live macro readout card, 4-segment
// meal picker (radiogroup, arrow keys), and a sticky 48px brand confirm.
// Grabber is a real 'Resize sheet' button toggling MEDIUM/LARGE; drag
// between detents is garnish (>120px past medium closes). Fractional
// path wired exactly: Almond Handful ×0.5 → 85 kcal (170/2), macros
// 3 / 2.5 / 7 g, check 12+10+63 = 85 ✓ — internals keep exact halves,
// display rounds kcal only.
// ---------------------------------------------------------------------------

interface PortionSheetProps {
  sheet: SheetState;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  onServings: (servings: number) => void;
  onMealId: (mealId: MealId) => void;
  onDetent: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onConfirm: () => void;
}

function PortionSheet({sheet, sheetRef, reducedMotion, onServings, onMealId, onDetent, onClose, onConfirm}: PortionSheetProps) {
  const food = FOOD_BY_ID[sheet.foodId];
  const atMin = sheet.servings <= 0.5;
  const atMax = sheet.servings >= 3;
  const exactKcal = kcalOf(food) * sheet.servings;
  const isEditing = sheet.editingItemId != null;

  // Transient pointer-drag delta only — the detent lives in the owner.
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
    if (!movedRef.current) return; // plain click → onClick toggle
    if (dy > 120 && sheet.detent === 'medium') onClose();
    else if (dy > 60 && sheet.detent === 'large') onDetent('medium');
    else if (dy < -60 && sheet.detent === 'medium') onDetent('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetent(sheet.detent === 'medium' ? 'large' : 'medium');
  };

  const step = (delta: number) => {
    onServings(Math.min(3, Math.max(0.5, sheet.servings + delta)));
  };
  const onSpinKey = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      step(0.5);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      step(-0.5);
    }
  };
  const onSegKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = MEAL_ORDER.indexOf(sheet.mealId);
    const next = MEAL_ORDER[(index + (event.key === 'ArrowRight' ? 1 : -1) + MEAL_ORDER.length) % MEAL_ORDER.length];
    onMealId(next);
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
    buttons[MEAL_ORDER.indexOf(next)]?.focus();
  };

  const macroRows: Array<{key: MacroKey; grams: number}> = [
    {key: 'protein', grams: food.protein * sheet.servings},
    {key: 'carbs', grams: food.carbs * sheet.servings},
    {key: 'fat', grams: food.fat * sheet.servings},
  ];
  const confirmLabel = isEditing
    ? 'Update portion'
    : \`Add \${fmtServings(sheet.servings)} · \${fmtInt(Math.round(exactKcal))} kcal\`;
  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fkl-sheet-title"
      tabIndex={-1}
      className="fkl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="fkl-btn fkl-focusable"
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
        <h2 id="fkl-sheet-title" style={styles.sheetTitle}>
          {food.name}
        </h2>
        <button
          type="button"
          className="fkl-btn fkl-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        {/* Serving stepper — 96×32 muted track, hairline-split halves;
            hit areas extend to 44px via the row's paddingBlock (input
            contract verbatim); exhausted half disabled at 35% opacity. */}
        <div style={styles.stepperRow}>
          <span style={styles.stepperLabel}>Servings</span>
          <div style={styles.stepperGroup}>
            <div style={styles.stepperTrack}>
              <button
                type="button"
                className="fkl-btn fkl-focusable"
                style={{...styles.stepperHalf, ...(atMin ? styles.stepperHalfDisabled : null)}}
                aria-label="Decrease servings"
                disabled={atMin}
                onClick={() => step(-0.5)}>
                <Icon icon={MinusIcon} size="sm" color="inherit" />
              </button>
              <span style={styles.stepperSplit} aria-hidden />
              <button
                type="button"
                className="fkl-btn fkl-focusable"
                style={{...styles.stepperHalf, ...(atMax ? styles.stepperHalfDisabled : null)}}
                aria-label="Increase servings"
                disabled={atMax}
                onClick={() => step(0.5)}>
                <Icon icon={PlusIcon} size="sm" color="inherit" />
              </button>
            </div>
            <span
              className="fkl-focusable"
              style={styles.stepperValue}
              role="spinbutton"
              tabIndex={0}
              aria-label="Servings"
              aria-valuenow={sheet.servings}
              aria-valuemin={0.5}
              aria-valuemax={3}
              aria-valuetext={fmtServings(sheet.servings)}
              onKeyDown={onSpinKey}>
              {Number.isInteger(sheet.servings) ? sheet.servings : sheet.servings.toFixed(1)}
            </span>
          </div>
        </div>
        {/* Live macro readout — grams × servings, halves to one decimal
            ('2.5 g' at Almond ×0.5). */}
        <div style={styles.sheetCard}>
          {macroRows.map((row, index) => (
            <div key={row.key}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.sheetCardRow}>
                <span>{MACRO_LABEL[row.key]}</span>
                <span style={styles.sheetCardValue}>{fmtGrams(row.grams)} g</span>
              </div>
            </div>
          ))}
        </div>
        {/* 4-segment meal picker — preset to the source meal. */}
        <div style={styles.segLabel} id="fkl-meal-label">
          Meal
        </div>
        <div role="radiogroup" aria-labelledby="fkl-meal-label" style={styles.segTrack} onKeyDown={onSegKey}>
          {MEAL_ORDER.map(mealId => {
            const isOn = mealId === sheet.mealId;
            return (
              <button
                key={mealId}
                type="button"
                role="radio"
                aria-checked={isOn}
                tabIndex={isOn ? 0 : -1}
                className="fkl-btn fkl-focusable"
                style={{...styles.segBtn, ...(isOn ? styles.segBtnOn : null)}}
                onClick={() => onMealId(mealId)}>
                {MEAL_LABEL[mealId]}
              </button>
            );
          })}
        </div>
      </div>
      <div style={styles.sheetFooterArea}>
        <button type="button" className="fkl-btn fkl-focusable" style={styles.confirmBtn} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileMealQuickaddLogTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); the viewport query is only the
  // first-frame fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ONE STATE OWNER + the item-level update(id, patch) the spec names.
  const [state, setState] = useState<ForkfulState>(INITIAL_STATE);
  const update = useCallback((id: string, patch: Partial<LoggedItem>) => {
    setState(prev => ({
      ...prev,
      loggedItems: prev.loggedItems.map(item => (item.id === id ? {...item, ...patch} : item)),
    }));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const tileMenuRef = useRef<HTMLDivElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<MealId, HTMLHeadingElement | null>>({
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null,
  });
  const toastSeqRef = useRef(0);

  // DERIVED — every surface below is a pure derivation of loggedItems.
  const totals = totalsOf(state.loggedItems);
  const remaining = TARGETS.kcal - totals.kcal; // seeded 2110−1106 = 1,004
  const mealKcals = MEAL_ORDER.reduce<Record<MealId, number>>(
    (acc, mealId) => {
      acc[mealId] = state.loggedItems
        .filter(item => item.mealId === mealId)
        .reduce((sum, item) => sum + itemKcal(item), 0);
      return acc;
    },
    {breakfast: 0, lunch: 0, snack: 0, dinner: 0},
  );
  const tileCount = (food: Food): number =>
    state.loggedItems.filter(item => item.foodId === food.id && item.mealId === food.mealId).length;
  const firstEmptyMeal = MEAL_ORDER.find(mealId => mealKcals[mealId] === 0) ?? 'dinner';

  // Dial sizing per the responsive contract: svg = min(width − 32, 224),
  // measured on the hero block (arcs scale by viewBox — no recalcs).
  const heroWidth = useElementWidth(heroRef);
  const dialSize = heroWidth > 0 ? Math.min(heroWidth - 32, 224) : 224;

  // Large-title collapse — IO sentinel above the largeTitle row; when it
  // scrolls under the 52px navBar, the compact title fades in and the
  // navBar hairline appears (scroll-under wiring, noted per contract).
  useEffect(() => {
    const element = sentinelRef.current;
    if (element == null || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry == null) return;
        const collapsed = !entry.isIntersecting && entry.boundingClientRect.top < 60;
        setState(prev => (prev.titleCollapsed === collapsed ? prev : {...prev, titleCollapsed: collapsed}));
      },
      {rootMargin: '-53px 0px 0px 0px', threshold: 0},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Focus into an opening sheet uses preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen; the scrollTop reset is the belt to
  // that suspender.
  useEffect(() => {
    if (state.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheet != null]); // eslint-disable-line react-hooks/exhaustive-deps
  // Anchored menus focus their first item on open.
  useEffect(() => {
    if (state.menu == null) return;
    const container = state.menu.kind === 'tile' ? tileMenuRef.current : rowMenuRef.current;
    container?.querySelector('button')?.focus({preventScroll: true});
  }, [state.menu]);

  // TOAST — one polite region, replacement semantics, NO timers.
  const nextToast = (msg: string, undoSnapshot?: {item: LoggedItem; index: number}): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undoSnapshot};
  };

  // SIGNATURE RIPPLE — one tap appends an item; badge, dial, rail dot,
  // sectionHeader kcal, row, footer, and toast all re-derive in the same
  // frame. Deterministic demo paths: (a) Protein Shake ×3 → protein
  // 77+3·30 = 167g = 119% of 140 → clamped arc + error tick, chip
  // 'Protein 167/140g · 27g over', eaten 1106+3·171 = 1,619, footer
  // '491 kcal left' (2110−1619 ✓). (b) Salmon and Rice ×3 via sheet =
  // 1,251 kcal (4·102+4·123+9·39 = 408+492+351 ✓) → eaten 2,357 →
  // footer '247 kcal over' (2357−2110 ✓).
  const addItem = (foodId: string, mealId: MealId, servings: number) => {
    setState(prev => {
      const food = FOOD_BY_ID[foodId];
      const before = totalsOf(prev.loggedItems);
      const item: LoggedItem = {id: \`li\${prev.nextId}\`, foodId, mealId, servings, time: 'Just now'};
      const items = [...prev.loggedItems, item];
      const after = totalsOf(items);
      // First-overshoot frame announces the exceeded target instead of
      // the add line (one toast, replacement semantics).
      const crossed = (['protein', 'carbs', 'fat'] as MacroKey[]).find(
        key => before[key] <= TARGETS[key] && after[key] > TARGETS[key],
      );
      const left = TARGETS.kcal - after.kcal;
      const msg =
        crossed != null
          ? \`\${MACRO_LABEL[crossed]} target exceeded — \${fmtGrams(after[crossed] - TARGETS[crossed])}g over\`
          : left >= 0
            ? \`Added \${food.name} · \${fmtInt(left)} kcal left\`
            : \`Added \${food.name} · \${fmtInt(-left)} kcal over\`;
      return {
        ...prev,
        loggedItems: items,
        nextId: prev.nextId + 1,
        menu: null,
        openSwipeId: null,
        toast: nextToast(msg),
      };
    });
  };

  // DELETE — executes immediately + Undo (undoOverConfirm; no dialogs).
  const deleteItem = (id: string) => {
    setState(prev => {
      const index = prev.loggedItems.findIndex(item => item.id === id);
      if (index < 0) return prev;
      const item = prev.loggedItems[index];
      return {
        ...prev,
        loggedItems: prev.loggedItems.filter(entry => entry.id !== id),
        menu: null,
        openSwipeId: null,
        toast: nextToast(\`Removed \${FOOD_BY_ID[item.foodId].name}\`, {item, index}),
      };
    });
  };
  // Undo splices the snapshot back at its original index.
  const undoDelete = () => {
    setState(prev => {
      const snapshot = prev.toast?.undoSnapshot;
      if (snapshot == null) return prev;
      const items = [...prev.loggedItems];
      items.splice(Math.min(snapshot.index, items.length), 0, snapshot.item);
      return {...prev, loggedItems: items, toast: nextToast('Restored')};
    });
  };

  // SHEET LIFECYCLE ----------------------------------------------------------

  const openSheet = (sheet: Omit<SheetState, 'detent'>, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setState(prev => ({...prev, sheet: {...sheet, detent: 'medium'}, menu: null, openSwipeId: null}));
  };
  const closeSheet = () => {
    setState(prev => ({...prev, sheet: null}));
    sheetOpenerRef.current?.focus();
  };
  const confirmSheet = () => {
    const sheet = state.sheet;
    if (sheet == null) return;
    if (sheet.editingItemId != null) {
      // Edit path routes through update(id, patch) per the spec.
      update(sheet.editingItemId, {servings: sheet.servings, mealId: sheet.mealId});
      setState(prev => ({
        ...prev,
        sheet: null,
        toast: nextToast(\`Portion updated — \${FOOD_BY_ID[sheet.foodId].name}\`),
      }));
    } else {
      addItem(sheet.foodId, sheet.mealId, sheet.servings);
      setState(prev => ({...prev, sheet: null}));
    }
    sheetOpenerRef.current?.focus();
  };

  const closeMenu = () => {
    setState(prev => ({...prev, menu: null}));
    menuOpenerRef.current?.focus();
  };
  const toggleMenu = (menu: MenuState, opener: HTMLElement) => {
    menuOpenerRef.current = opener;
    setState(prev => ({
      ...prev,
      menu: prev.menu != null && prev.menu.kind === menu.kind && prev.menu.id === menu.id ? null : menu,
      openSwipeId: null,
    }));
  };

  // Escape closes the TOPMOST overlay only: anchored menu → sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menu != null) closeMenu();
      else if (state.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.menu, state.sheet]);

  // NAVIGATION HELPERS ---------------------------------------------------------

  const jumpToMeal = (mealId: MealId) => {
    setState(prev => ({...prev, activeMeal: mealId, menu: null, openSwipeId: null}));
    sectionRefs.current[mealId]?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  };
  const jumpToDial = () => {
    heroRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'center'});
  };
  const onRefresh = () => {
    // Fixed string, no data change, no clock read — role=status region.
    setState(prev => ({...prev, refreshed: true, toast: nextToast('Updated just now')}));
  };
  const onLegendChip = (key: MacroKey) => {
    setState(prev => ({...prev, legendMacro: prev.legendMacro === key ? null : key}));
    jumpToDial();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const footerOver = remaining < 0;
  const legendCaption =
    state.legendMacro == null
      ? null
      : (() => {
          const key = state.legendMacro;
          const value = totals[key];
          const target = TARGETS[key];
          return value > target
            ? \`\${MACRO_LABEL[key]}: \${fmtGrams(value)}g of \${target}g — \${fmtGrams(value - target)}g over target\`
            : \`\${MACRO_LABEL[key]}: \${fmtGrams(value)}g of \${target}g — \${fmtGrams(target - value)}g to go (\${Math.round((value / target) * 100)}%)\`;
        })();

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FORKFUL_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header
          style={{
            ...styles.navBar,
            // Hairline appears only after content scrolls under (wired).
            borderBottom: \`1px solid \${state.titleCollapsed ? 'var(--color-border)' : 'transparent'}\`,
          }}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="fkl-btn fkl-focusable"
              style={styles.brandBtn}
              aria-label="Forkful — back to top"
              onClick={jumpToDial}>
              <ForkMark size={28} />
            </button>
          </div>
          {/* Compact title — duplicate of the h1, decorative for SR. */}
          <span
            className="fkl-fade"
            style={{...styles.navTitle, opacity: state.titleCollapsed ? 1 : 0}}
            aria-hidden>
            Today
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fkl-btn fkl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh log"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
          <div style={styles.largeTitle}>
            <h1 style={styles.largeTitleH1}>Today</h1>
            <span style={styles.largeTitleCaption}>{fmtInt(TARGETS.kcal)} kcal target</span>
          </div>

          <div ref={heroRef} style={styles.dialHero}>
            <ConcentricMacroDial size={dialSize} totals={totals} />
            <div style={styles.legendRow}>
              {DIAL_ARCS.map(arc => {
                const value = totals[arc.key];
                const target = TARGETS[arc.key];
                const over = value > target;
                const text = over
                  ? \`\${MACRO_LABEL[arc.key]} \${fmtGrams(value)}/\${target}g · \${fmtGrams(value - target)}g over\`
                  : \`\${MACRO_LABEL[arc.key]} \${fmtGrams(value)}/\${target}g\`;
                return (
                  <button
                    key={arc.key}
                    type="button"
                    className="fkl-btn fkl-focusable"
                    style={styles.legendChip}
                    aria-pressed={state.legendMacro === arc.key}
                    aria-label={\`\${MACRO_LABEL[arc.key]}, \${fmtGrams(value)} of \${target} grams\${over ? \`, \${fmtGrams(value - target)} grams over\` : ''} — show details\`}
                    onClick={() => onLegendChip(arc.key)}>
                    <span style={{...styles.legendDot, background: arc.stroke}} aria-hidden />
                    <span
                      style={{
                        ...styles.legendText,
                        ...(over ? {color: 'var(--color-error)', fontWeight: 600} : null),
                      }}>
                      {text}
                    </span>
                  </button>
                );
              })}
            </div>
            {legendCaption != null ? <div style={styles.legendCaption}>{legendCaption}</div> : null}
          </div>

          <MealRailDots mealKcals={mealKcals} activeMeal={state.activeMeal} onJump={jumpToMeal} />

          {MEAL_ORDER.map(mealId => {
            const foods = CATALOG.filter(food => food.mealId === mealId);
            const items = state.loggedItems.filter(item => item.mealId === mealId);
            return (
              <section key={mealId} aria-label={MEAL_LABEL[mealId]}>
                <h2
                  ref={element => {
                    sectionRefs.current[mealId] = element;
                  }}
                  style={{...styles.sectionHeader, scrollMarginTop: 60}}>
                  {MEAL_LABEL[mealId]} · {fmtInt(mealKcals[mealId])} kcal
                </h2>
                <div style={styles.tileGrid}>
                  {foods.map(food => (
                    <QuickAddTile
                      key={food.id}
                      food={food}
                      count={tileCount(food)}
                      isMenuOpen={state.menu?.kind === 'tile' && state.menu.id === food.id}
                      menuRef={tileMenuRef}
                      onAdd={() => addItem(food.id, food.mealId, 1)}
                      onToggleMenu={opener => toggleMenu({kind: 'tile', id: food.id}, opener)}
                      onAdjust={() =>
                        openSheet({foodId: food.id, mealId: food.mealId, servings: 1}, menuOpenerRef.current)
                      }
                      onMenuAddOne={() => addItem(food.id, food.mealId, 1)}
                      onLongPress={() => openSheet({foodId: food.id, mealId: food.mealId, servings: 1}, null)}
                    />
                  ))}
                </div>
                <div style={{...styles.listCard, marginBottom: mealId === 'dinner' ? 24 : 0}}>
                  {items.length === 0 ? (
                    <div style={styles.emptyRow}>Nothing logged for {MEAL_LABEL[mealId].toLowerCase()} yet</div>
                  ) : (
                    items.map((item, index) => (
                      <LoggedRow
                        key={item.id}
                        item={item}
                        isSwipeOpen={state.openSwipeId === item.id}
                        isMenuOpen={state.menu?.kind === 'row' && state.menu.id === item.id}
                        isLast={index === items.length - 1}
                        reducedMotion={reducedMotion}
                        menuRef={rowMenuRef}
                        onSwipeOpen={() => setState(prev => ({...prev, openSwipeId: item.id, menu: null}))}
                        onSwipeClose={() =>
                          setState(prev => (prev.openSwipeId === item.id ? {...prev, openSwipeId: null} : prev))
                        }
                        onToggleMenu={opener => toggleMenu({kind: 'row', id: item.id}, opener)}
                        onEdit={() =>
                          openSheet(
                            {
                              foodId: item.foodId,
                              mealId: item.mealId,
                              servings: item.servings,
                              editingItemId: item.id,
                            },
                            menuOpenerRef.current,
                          )
                        }
                        onDelete={() => deleteItem(item.id)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}

          {/* TOAST DOCK — sticky-in-flow (bottom 76, z30) per the batch-1
              amendment; one toast, replacement semantics, no timers. */}
          <div style={styles.toastDock} role="status" aria-live="polite">
            {state.toast != null ? (
              <div key={state.toast.seq} style={styles.toast} className="fkl-fade">
                <span style={styles.toastMsg}>{state.toast.msg}</span>
                {state.toast.undoSnapshot != null ? (
                  <>
                    <span style={styles.toastRule} aria-hidden />
                    <button type="button" className="fkl-btn fkl-focusable" style={styles.toastUndo} onClick={undoDelete}>
                      Undo
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>

        {/* SUMMARY FOOTER — owns remaining = 2110 − Σ(exact kcal); the
            numeral is NOT live (the toastDock announces). */}
        <footer style={styles.summaryFooter}>
          <div style={styles.footerStack}>
            <span
              style={{
                ...styles.footerNumeral,
                ...(footerOver ? {color: 'var(--color-error)'} : null),
              }}>
              {footerOver ? \`\${fmtInt(-remaining)} kcal over\` : \`\${fmtInt(remaining)} kcal left\`}
            </span>
            <span style={styles.footerCaption}>
              {fmtGrams(totals.protein)}P · {fmtGrams(totals.carbs)}C · {fmtGrams(totals.fat)}F logged
            </span>
          </div>
          <button
            type="button"
            className="fkl-btn fkl-focusable"
            style={styles.jumpBtn}
            aria-label={\`Jump to \${MEAL_LABEL[firstEmptyMeal]}\`}
            onClick={() => jumpToMeal(firstEmptyMeal)}>
            {MEAL_LABEL[firstEmptyMeal]} ↓
          </button>
        </footer>

        {/* Tap-elsewhere-closes for anchored menus (z29, under the z30
            menus, above all content). */}
        {state.menu != null ? <div style={styles.menuBackdrop} onClick={closeMenu} aria-hidden /> : null}

        {state.sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheet != null ? (
          <PortionSheet
            sheet={state.sheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            onServings={servings => setState(prev => (prev.sheet == null ? prev : {...prev, sheet: {...prev.sheet, servings}}))}
            onMealId={mealId => setState(prev => (prev.sheet == null ? prev : {...prev, sheet: {...prev.sheet, mealId}}))}
            onDetent={detent => setState(prev => (prev.sheet == null ? prev : {...prev, sheet: {...prev.sheet, detent}}))}
            onClose={closeSheet}
            onConfirm={confirmSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};