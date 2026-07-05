var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Firstlight morning briefing for
 *   Friday, July 4: 11 stories across World / Local / Markets / One Good
 *   Read, each with dual depth costs (summaryMin, fullMin; a headline scan
 *   is always 0), an editorial rank order (g1, w1, m1, w2, m2, l1, m3, l3,
 *   w3, l2, w4 — Σ summaryMin = 18), a fixed START_TIME of 8:00, PRESETS
 *   [5, 10, 15, 20], and three saved stories (w3, g1, l2). No Date.now(),
 *   no Math.random(), no network media; 'Updated just now' is a fixed
 *   string.
 * @output Firstlight — Morning Briefing: a 390px MOBILE time-budgeted news
 *   digest. NavBar (Firstlight half-risen-sun mark · fade-in compact title
 *   · Timer + Refresh) over a 52px large title, dateline, a 64px
 *   BudgetSummaryStrip ('15-min briefing · 9 of 11 stories · done by
 *   8:14'), four sections of fixed-height DepthToggleStoryRows (headline
 *   56px / summary 116px / full 172px — zero-shift depth chips), a 48px
 *   BudgetBurndownBar sticky above the 64px tabBar, and a two-detent
 *   budget sheet holding the 240×140 semicircular TimeBudgetDial. The
 *   signature move: rotating the dial (or tapping a 44px preset chip)
 *   recomposes every story's depth in place via one pure greedy selector —
 *   rows collapse/expand, section fit-badges re-count, the strip and
 *   burndown re-project the finish time, and the dial's inner cost arc
 *   tracks the composed cost. Checking stories off burns the budget down
 *   and fires persistent Undo toasts; per-story depth-chip overrides may
 *   exceed the budget and flip the burndown/dial into a '+N min over'
 *   state with a 'Reset to auto' path in the sheet.
 * @position Page template; emitted by \`astryx template mobile-morning-briefing\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays are position:'absolute' inside
 *   shell; position:fixed is banned. While the sheet is open, shell locks
 *   to {height:'100dvh', overflow:'hidden'} and restores on close. The
 *   toast dock and burndown bar are STICKY-IN-FLOW (bottom 112 / 64), not
 *   shell-absolute, so they pin to the viewport on tall scrolls.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 — story rows have no avatar);
 *   no desktop frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Firstlight amber, light-dark(#B45309, #FBBF24)) — the
 *   spec's over-budget warning pair is deliberately the SAME pair (single
 *   amber system), aliased WARN_TEXT. REST_CONTROL is the sanctioned
 *   non-brand literal for interactive rest boundaries/fills (unchecked
 *   check circles, switch off-track, dial + burndown tracks) at ≥3:1
 *   against their actual surfaces per the mobile amendment — the spec's
 *   #E7E0D5/#EDE6DA track pairs measured ≈1.3:1 and were corrected (math
 *   at the declaration; noted as deviation).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); largeTitle 52px (28px/700
 *   at the 16px gutter) — total large header 104px; BudgetSummaryStrip
 *   64px card; sectionHeader 13px/600 uppercase 0.06em at 32px from the
 *   stage edge (16 gutter + 16 pad), 20px top / 8px bottom, trailing
 *   fit-badge pill 11px/600 min-width 16; DepthToggleStoryRow heights
 *   EXACT: headline 56 / summary 116 / full 172 (16px inline padding,
 *   1px divider inset 16, none on the last row); BudgetBurndownBar 48px
 *   sticky bottom:64 z19 (4px track flush at its top edge + 44px content
 *   row 13px/600 tabular); tabBar 64px sticky bottom:0 z20, four flex:1
 *   tabItems (24px icon over 11px/500 label, 4px gap, 16px-min brand
 *   badge at top:-4 right:-8); toastDock sticky bottom:112 z30 (64 tabBar
 *   + 48 burndown; 76 on tabs without the burndown), toast min-height 48
 *   radius 12; sheet grabber zone 24px (36×5 pill 8px from top, real
 *   button), sheet header 52px, detents 55% / calc(100% − 56px);
 *   TimeBudgetDial 240×140 SVG (180° arc r96 stroke 12, cost arc r78
 *   stroke 6, 16 ticks 12° apart, 34px/700 center readout); preset chips
 *   44px tall, 8px gap. TYPE (Figtree via --font-family-body): 28/700 ·
 *   22/700 · 17/600 · 16/400 body floor · 13/400 meta · 11/500 overlines;
 *   nothing under 11px; tabular-nums on every updating numeral. Touch:
 *   ≥44×44 everywhere with ≥8px clearance — the depth chip and the
 *   row-body check toggle are SEPARATE named buttons.
 *
 * Responsive contract:
 * - Fluid 320–430px: no width literals; dial scales via width:100% +
 *   maxWidth 240 in a centered column; preset chips stay 4-up (4×~66 +
 *   3×8 = 288 ≤ 320−32); burndown center segment gets minWidth 0 +
 *   ellipsis while leading/trailing never truncate; headline titles
 *   1-line-ellipsize (w3 is the 320px stress); strip subtitle ellipsizes.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the briefing is phone geometry.
 *
 * Deviations from spec (aggregates all reconcile — none corrected):
 * - Dek clamps to 2 lines and full-state excerpt to 2 lines (spec said
 *   3-line dek / 4-line excerpt): with a 2-line title the exact 116/172px
 *   row heights cannot hold more, and the zero-shift height law wins.
 * - REST_CONTROL replaces the spec's #E7E0D5/#EDE6DA track pairs and the
 *   --color-border unchecked check-circle border (≈1.3:1 measured) per
 *   the binding ≥3:1 interactive-rest amendment.
 * - Stress fixture 2 ('tap g1 chip twice → full') lands in ONE tap: the
 *   chip cycles from the DISPLAYED depth (summary at budget 5), so the
 *   first tap reaches full / '+7 min over'. Same over-budget state.
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
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  CompassIcon,
  RefreshCwIcon,
  SunriseIcon,
  TimerIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Firstlight amber). #B45309 on #FFFFFF ≈
// 4.8:1 (passes 4.5:1 for 13px/600 brand text); #FBBF24 on the dark card
// (~#1C1917) ≈ 10.9:1.
const BRAND_ACCENT = 'light-dark(#B45309, #FBBF24)';
// The spec's over-budget warning pair light-dark(#B45309, #FBBF24) is the
// SAME pair — a deliberate single-amber system; aliased for intent.
const WARN_TEXT = BRAND_ACCENT;
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #B45309 ≈ 5.9:1 light;
// #1F1B16 on #FBBF24 ≈ 9.8:1 dark — both pass 4.5:1 at 11px/600.
const BRAND_ON = 'light-dark(#FFFFFF, #1F1B16)';
// Interactive REST boundaries/fills (unchecked check-circle border, switch
// off-track, dial budget track, burndown track) — the mobile amendment
// requires ≥3:1 against the ACTUAL surface, and hairline/muted tokens are
// for passive separators only. Math: #94908A vs #FFFFFF card = 3.2:1;
// #6F6A5E vs ~#1C1917 dark card = 3.3:1 (body surfaces are within a few
// percent of the cards in both schemes).
const REST_CONTROL = 'light-dark(#94908A, #6F6A5E)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Blur chrome surface shared by navBar, burndown bar, and tabBar.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';
// 12% brand wash for the strip icon tile (decorative fill behind a brand
// glyph — not an interactive boundary, so tint weight is fine).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, the button reset, the visually
// hidden h1 helper, morph transitions, and the reduced-motion guard.
// Transitions collapse to instant under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const FLB_CSS = \`
.flb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.flb-btn:disabled { cursor: default; }
.flb-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.flb-row { transition: height 200ms ease; }
.flb-anim { transition: transform 200ms ease, opacity 200ms ease; }
.flb-fade { transition: opacity 200ms ease; }
.flb-fill { transition: width 200ms ease; }
@keyframes flb-block-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.flb-block-in { animation: flb-block-in 200ms ease; }
@keyframes flb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.flb-sheet-in { animation: flb-sheet-in 200ms ease; }
.flb-vh {
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
  .flb-row, .flb-anim, .flb-fade, .flb-fill { transition: none; }
  .flb-block-in, .flb-sheet-in { animation: none; }
}
\`;

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
  // Scroll lock while the sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, paddingInline 8, grid '1fr auto 1fr';
  // hairline + blur ALWAYS ON (this template's chosen variant, noted).
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
  // Compact center title — starts opacity 0, fades in when the large
  // title's sentinel scrolls under the navBar (IntersectionObserver).
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // LARGE TITLE — 52px block below the sticky navBar; scrolls away.
  largeTitle: {height: 52, display: 'flex', alignItems: 'center', paddingInline: 16},
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.15, margin: 0},
  // Dateline caption 4px under the title, 16px bottom margin.
  dateline: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingInline: 16,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  updatedNote: {fontSize: 13, fontWeight: 500, color: BRAND_ACCENT},
  // BUDGET SUMMARY STRIP — 64px full-width listCard button.
  summaryStrip: {
    width: 'calc(100% - 32px)',
    marginInline: 16,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  stripIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  stripText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  stripTitle: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stripSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stripChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // SECTION HEADER row — text at 32px from the stage edge (16 gutter +
  // 16 pad), 20px top / 8px bottom, trailing fit badge.
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    margin: '20px 16px 8px',
    paddingInline: 16,
  },
  sectionHeaderText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  fitBadge: {
    minWidth: 16,
    height: 18,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
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
  // DEPTH-TOGGLE STORY ROW — fixed heights 56/116/172, height animates
  // 200ms via .flb-row (instant under reduced motion). Two SEPARATE
  // buttons: row body (check-off toggle, named by the title) + depth chip.
  storyRow: {display: 'flex', alignItems: 'stretch', overflow: 'hidden'},
  rowBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    paddingInlineStart: 16,
    paddingBlock: 9,
  },
  // 24px check circle; the whole row body is the ≥44px hit. Unchecked
  // border uses REST_CONTROL (≥3:1 vs the card — see COLOR LITERALS).
  checkCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    marginTop: 4,
    borderRadius: '50%',
    border: \`2px solid \${REST_CONTROL}\`,
    display: 'grid',
    placeItems: 'center',
    color: 'transparent',
  },
  checkCircleOn: {
    border: \`2px solid transparent\`,
    background: BRAND_ACCENT,
    color: BRAND_ON,
  },
  storyText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  kicker: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  titleOne: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '21px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  titleTwo: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '21px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  dek: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  fullOverline: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  excerpt: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: '18px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  // Depth chip — a second 44×44 button; 8px clearance from the row body
  // via the column's paddingInlineStart.
  chipCol: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingInlineStart: 8,
    paddingInlineEnd: 8,
    paddingTop: 6,
  },
  chipBtn: {minWidth: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 8},
  chipFace: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    border: '1px solid transparent',
    borderRadius: 6,
    padding: '5px 10px',
    whiteSpace: 'nowrap',
  },
  chipFaceOverride: {border: \`1px solid \${BRAND_ACCENT}\`, color: BRAND_ACCENT},
  chipFaceDisabled: {opacity: 0.45},
  // BURNDOWN BAR — 48px sticky bottom:64 z19 (4px track + 44px row); one
  // full-width button opening the budget sheet.
  burndownBar: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    width: '100%',
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // 4px track flush at the bar's top edge — REST_CONTROL (≥3:1 vs the
  // blur chrome over body; the spec's #EDE6DA measured ≈1.3:1).
  burnTrack: {height: 4, width: '100%', background: REST_CONTROL},
  burnFill: {height: 4, background: BRAND_ACCENT},
  burnRow: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  burnLead: {fontWeight: 600, whiteSpace: 'nowrap'},
  burnLeadOver: {fontWeight: 600, whiteSpace: 'nowrap', color: WARN_TEXT},
  burnDot: {color: 'var(--color-text-secondary)', flexShrink: 0},
  burnMid: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    color: 'var(--color-text-secondary)',
  },
  burnTrail: {whiteSpace: 'nowrap', color: 'var(--color-text-secondary)'},
  // TOAST DOCK — sticky-in-flow (height 0) so it pins above the bottom
  // chrome even mid-scroll; shell-absolute would anchor to the DOCUMENT
  // bottom on tall views (mobile amendment). Always mounted for aria-live.
  toastDock: {
    position: 'sticky',
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 12,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
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
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  toastNoUndo: {paddingInlineEnd: 16},
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    minWidth: 44,
    height: 48,
    paddingInline: 16,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // TAB BAR — exactly 64px, four flex:1 tabItems.
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
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // 16px-min brand badge; text is BRAND_ON (5.9:1 / 9.8:1 — see literals).
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
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell, 16px top corners.
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
  sheetMarkSlot: {display: 'grid', placeItems: 'center', width: 44, height: 44},
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  // TIME BUDGET DIAL — 240×140, centered, fluid below 320.
  dialBox: {display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8},
  dialWrap: {position: 'relative', width: '100%', maxWidth: 240, borderRadius: 12},
  dialSvg: {width: '100%', height: 'auto', display: 'block'},
  dialReadout: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    pointerEvents: 'none',
  },
  dialNum: {display: 'flex', alignItems: 'baseline', gap: 4},
  dialNumText: {fontSize: 34, fontWeight: 700, lineHeight: '36px', fontVariantNumeric: 'tabular-nums'},
  dialNumUnit: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  dialCap: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  dialCapOver: {fontSize: 13, fontWeight: 600, color: WARN_TEXT, fontVariantNumeric: 'tabular-nums'},
  // Preset chips — four 44px chips, 8px gap; exact match = filled, nearest
  // within ±2 min = 1px brand outline (no integer budget ties exist
  // between adjacent presets: midpoints 7.5/12.5/17.5 are non-integer).
  presetRow: {display: 'flex', gap: 8, marginTop: 16},
  presetChip: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    border: '1px solid transparent',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  presetChipNear: {border: \`1px solid \${BRAND_ACCENT}\`, color: BRAND_ACCENT},
  presetChipOn: {background: BRAND_ACCENT, border: '1px solid transparent', color: BRAND_ON},
  sheetSectionHeader: {
    margin: '20px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  compCard: {border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden'},
  compRow: {height: 44, display: 'flex', alignItems: 'center', gap: 8, paddingInline: 16},
  compName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  compMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  resetBtn: {
    marginTop: 12,
    height: 36,
    paddingInline: 14,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  prioRow: {height: 44, display: 'flex', alignItems: 'center', gap: 8, paddingInlineStart: 16},
  prioRank: {
    width: 20,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  prioTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EMPTY STATE (Explore) — the foundations block, verbatim geometry.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  emptyTitle: {marginTop: 16, fontSize: 17, fontWeight: 600},
  emptyBody: {marginTop: 4, fontSize: 13, lineHeight: '18px', color: 'var(--color-text-secondary)'},
  emptyBtn: {
    marginTop: 16,
    height: 36,
    paddingInline: 14,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
  },
  // SAVED rows — 60px two-line rows + trailing 44×44 unsave button.
  savedRowWrap: {display: 'flex', alignItems: 'center'},
  savedRow: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  savedSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  savedUnsave: {marginInline: 8, color: BRAND_ACCENT},
  // ME rows — 44px utility rows; the reminder row is the whole-row switch.
  utilRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  utilValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  utilChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex'},
  // 51×31 switch — OFF track is REST_CONTROL (≥3:1 vs the card; the
  // foundations' 14%-alpha off-track fails the binding amendment).
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    background: REST_CONTROL,
    flexShrink: 0,
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// Σ all summaryMin = 2+2+2+2+2+2+1+1+1+1+2 = 18 (rank order below).
// PRE-VERIFIED compositions (recomputed by hand against compose()):
//   budget 15 (default): summaries g1,w1,m1,w2,m2,l1,m3,l3,w3 (cumulative
//     2,4,5,7,8,10,11,12,14; l2/w4 would hit 16 — skip); pass 2 cheapest
//     upgrade is +2 → 16, none fit. Cost 14, done by 8:14; badges World
//     3 of 4, Local 2 of 3, Markets 3 of 3, Read 1 of 1 → 9 of 11; sheet
//     breakdown 6+3+3+2 = 14 ✓.
//   budget 8: g1,w1,m1,w2,m2 → cost 8, done by 8:08, 5 of 11 (4+0+2+2) ✓.
//   budget 10: + l1 → cost 10 (4+2+2+2), 6 of 11, done by 8:10 ✓.
//   budget 5: g1,w1,m1 → cost 5 (2+0+1+2), 3 of 11 ✓.
//   budget 20: pass 1 all 11 = 18; pass 2 upgrades l1 to FULL (+2 → 20),
//     all others skip. Cost 20 (World 8, Local 7, Markets 3, Read 2),
//     11 of 11, done by 8:20 ✓.
// SIGNATURE MORPH 15→8: l1, m3, l3, w3 collapse summary→headline; World
// badge 3→2, Local 2→0, Markets 3→2; strip re-reads '5 of 11 stories ·
// done by 8:08'; chip 10 gains the nearest-outline.
// ---------------------------------------------------------------------------

// START_TIME 8:00 = 480 minutes; doneBy = 8:00 + composedCost.
const START_TIME_MIN = 480;
const START_TIME_LABEL = '8:00';
const PRESETS = [5, 10, 15, 20];
const MIN_BUDGET = 5;
const MAX_BUDGET = 20;

type Depth = 'headline' | 'summary' | 'full';
type SectionId = 'world' | 'local' | 'markets' | 'read';
type TabId = 'today' | 'explore' | 'saved' | 'me';

// Fixed-height row states — the zero-shift law for depth chips.
const ROW_HEIGHTS: Record<Depth, number> = {headline: 56, summary: 116, full: 172};

interface Story {
  id: string;
  section: SectionId;
  rank: number; // editorial upgrade priority, 1 = first
  source: string;
  title: string;
  dek: string;
  excerpt: string;
  summaryMin: number;
  fullMin: number;
}

// Fictional outlets only (fixture-plan law). w3's title is the 320px
// one-line-ellipsis stress beside its depth chip.
const STORIES: Story[] = [
  {
    id: 'w1',
    section: 'world',
    rank: 2,
    source: 'Meridian Wire',
    title: 'Monsoon accord signed by nine basin states',
    dek: 'Nine states along the Sarpa basin agreed to share reservoir releases during failed-rain years, ending a four-year standoff with a downstream flow floor and a joint monitoring corps that begins patrols in October.',
    excerpt: "Delegates signed at dawn after an all-night session; the flow floor — 210 cubic meters a second at the Varda gauge — is the number negotiators fought over until the final hour.",
    summaryMin: 2,
    fullMin: 6,
  },
  {
    id: 'w2',
    section: 'world',
    rank: 4,
    source: 'The Continental',
    title: 'Cease-fire monitors deploy to the Kavel corridor',
    dek: 'An eighty-observer mission moved into the corridor overnight, the first neutral presence since spring, as both armies pulled armor back six kilometers under the watch of drone teams.',
    excerpt: "Monitors file daily line-of-contact reports; the mandate runs ninety days with automatic renewal unless either side objects in writing.",
    summaryMin: 2,
    fullMin: 5,
  },
  {
    id: 'w3',
    section: 'world',
    rank: 9,
    source: 'Meridian Wire',
    title: 'Deep-sea mining pact stalls over royalty split',
    dek: 'Talks recessed without a formula for splitting seabed royalties between sponsoring states and the international fund — the last open chapter in a decade of drafting.',
    excerpt: 'The sticking point is a two-point spread: island states want 6 percent of gross value, sponsors hold at 4 — a gap worth billions over a mine’s life.',
    summaryMin: 2,
    fullMin: 7,
  },
  {
    id: 'w4',
    section: 'world',
    rank: 11,
    source: 'Northlight Desk',
    title: 'Grain corridor reopens after 11-day closure',
    dek: 'The first four bulk carriers cleared the strait this morning after inspections resumed, easing a backlog of ninety loaded ships and calming wheat futures.',
    excerpt: 'Insurers restored standard war-risk terms at noon; port officials say the anchorage queue should clear within two weeks at the current pace.',
    summaryMin: 2,
    fullMin: 4,
  },
  {
    id: 'l1',
    section: 'local',
    rank: 6,
    source: 'The Ledger Local',
    title: 'Transit board approves the Ashford loop',
    dek: 'The board voted 6–1 to fund the downtown Ashford loop, adding four stations and a river crossing; construction bids open in September and service is projected for 2031.',
    excerpt: 'The lone no vote objected to the Fenwick alignment, which routes the crossing beside the old mill instead of the cheaper Dock Street option.',
    summaryMin: 2,
    fullMin: 4,
  },
  {
    id: 'l2',
    section: 'local',
    rank: 10,
    source: 'The Ledger Local',
    title: 'Harborfront zoning vote moves to June ballot',
    dek: 'Council sent the harborfront height-limit question to voters after petitioners cleared the signature bar by 412 names; the measure caps new towers at twelve stories.',
    excerpt: 'Developers of the two pending pier projects say the cap forces redesigns; the port authority has stayed neutral so far.',
    summaryMin: 2,
    fullMin: 4,
  },
  {
    id: 'l3',
    section: 'local',
    rank: 8,
    source: 'Civic Brief',
    title: 'Library late fines end citywide Monday',
    dek: 'All twelve branches drop overdue fines Monday and clear existing balances, joining a national shift that has raised return rates elsewhere.',
    excerpt: 'About 9,000 cardholders with blocked accounts regain borrowing at open; lost-item fees still apply.',
    summaryMin: 1,
    fullMin: 4,
  },
  {
    id: 'm1',
    section: 'markets',
    rank: 3,
    source: 'Tape & Ticker',
    title: 'Chips rally on Helion fab announcement',
    dek: 'Chipmakers led the market after Helion said its Ridgeline fab will reach volume production two quarters early, easing the supply squeeze forecast for spring.',
    excerpt: 'Foundry peers rose in sympathy, equipment makers hardest — an early ramp implies pulled-forward tool orders as soon as this quarter.',
    summaryMin: 1,
    fullMin: 4,
  },
  {
    id: 'm2',
    section: 'markets',
    rank: 5,
    source: 'Tape & Ticker',
    title: 'Freight rates fall a fourth straight week',
    dek: 'Trans-ocean container rates slid another 4 percent, the longest slide since 2023, as new vessel capacity outruns cargo demand on the main east–west lanes.',
    excerpt: 'Analysts see one more leg down before carriers blank sailings; contract shippers are already reopening annual rate talks.',
    summaryMin: 1,
    fullMin: 4,
  },
  {
    id: 'm3',
    section: 'markets',
    rank: 7,
    source: 'Tape & Ticker',
    title: 'Rate desk holds; statement drops one word',
    dek: "The central bank held the policy rate and deleted 'firmly' from its inflation language — a one-word edit traders read as the first step toward a spring cut.",
    excerpt: 'Futures now price a 62 percent chance of a cut by April, up from 41 before the statement.',
    summaryMin: 1,
    fullMin: 4,
  },
  {
    id: 'g1',
    section: 'read',
    rank: 1,
    source: 'Firstlight Features',
    title: 'The cartographer who mapped a city that never existed',
    dek: 'For thirty years, Edda Voss drew transit maps, census tracts, and zoning plans for Merrow — a city she invented at her kitchen table and kept consistent to the street.',
    excerpt: 'Her heirs found 214 hand-inked sheets in a cedar chest, each dated, each agreeing with the others down to the one-way streets — a fictional city with a working bus schedule.',
    summaryMin: 2,
    fullMin: 9,
  },
];

const STORY_BY_ID: Record<string, Story> = Object.fromEntries(
  STORIES.map(story => [story.id, story]),
);

// Editorial rank order (upgrade priority): g1, w1, m1, w2, m2, l1, m3,
// l3, w3, l2, w4.
const RANK_ORDER: string[] = [...STORIES].sort((a, b) => a.rank - b.rank).map(story => story.id);

const SECTIONS: Array<{id: SectionId; label: string}> = [
  {id: 'world', label: 'World'},
  {id: 'local', label: 'Local'},
  {id: 'markets', label: 'Markets'},
  {id: 'read', label: 'One Good Read'},
];

const DATELINE = 'Friday, July 4 · 11 stories';
// Saved tab fixture: w3, g1, l2.
const INITIAL_SAVED_IDS = ['w3', 'g1', 'l2'];

const TABS: Array<{id: TabId; label: string}> = [
  {id: 'today', label: 'Today'},
  {id: 'explore', label: 'Explore'},
  {id: 'saved', label: 'Saved'},
  {id: 'me', label: 'Me'},
];

// ---------------------------------------------------------------------------
// COMPOSITION ALGORITHM (spec, verbatim): start every story at headline
// (cost 0); PASS 1 in rank order, upgrade headline→summary while
// cost+summaryMin ≤ budget; PASS 2 in rank order over summaries, upgrade
// summary→full while cost+(fullMin−summaryMin) ≤ budget; per-story
// overrideDepth (user chip taps) wins over the computed depth and may
// exceed budget. Pure selector — called in render, NEVER stored, so the
// dial, rows, badges, strip, burndown, and tab badge can never disagree.
// ---------------------------------------------------------------------------

function costOf(story: Story, depth: Depth): number {
  return depth === 'summary' ? story.summaryMin : depth === 'full' ? story.fullMin : 0;
}

interface Composition {
  depthById: Record<string, Depth>;
  autoCost: number;
  composedCost: number;
}

function compose(budget: number, overrides: Record<string, Depth>): Composition {
  const auto: Record<string, Depth> = {};
  for (const story of STORIES) auto[story.id] = 'headline';
  let cost = 0;
  for (const id of RANK_ORDER) {
    const story = STORY_BY_ID[id];
    if (cost + story.summaryMin <= budget) {
      auto[id] = 'summary';
      cost += story.summaryMin;
    }
  }
  for (const id of RANK_ORDER) {
    const story = STORY_BY_ID[id];
    if (auto[id] === 'summary' && cost + (story.fullMin - story.summaryMin) <= budget) {
      auto[id] = 'full';
      cost += story.fullMin - story.summaryMin;
    }
  }
  const depthById: Record<string, Depth> = {};
  let composedCost = 0;
  for (const story of STORIES) {
    const depth = overrides[story.id] ?? auto[story.id];
    depthById[story.id] = depth;
    composedCost += costOf(story, depth);
  }
  return {depthById, autoCost: cost, composedCost};
}

/** Depth-chip cycle: headline → summary → full → headline. */
function nextDepth(depth: Depth): Depth {
  return depth === 'headline' ? 'summary' : depth === 'summary' ? 'full' : 'headline';
}

/** Minutes-since-midnight → '8:14' (24h-free morning label; max cost 55). */
function fmtClock(min: number): string {
  return \`\${Math.floor(min / 60)}:\${String(min % 60).padStart(2, '0')}\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useBriefingState(): the spec's shape verbatim, with a
// single update(patch) plus updateStory(id, patch) for depth overrides.
// Every surface reads compose(budget, overrides) fresh each render.
// ---------------------------------------------------------------------------

interface ToastState {
  seq: number;
  msg: string;
  // Undo restores this exact snapshot (readIds AND savedIds — list
  // position is derived from fixture order, so restore is exact).
  undo: null | {readIds: string[]; savedIds: string[]};
}

interface BriefingState {
  budget: number;
  overrides: Record<string, Depth>;
  readIds: string[];
  savedIds: string[];
  tab: TabId;
  screenByTab: Record<TabId, string>;
  scrollByTab: Record<TabId, number>;
  sheet: null | 'medium' | 'large';
  overrideJustSet: string | null;
  toast: ToastState | null;
  reminderOn: boolean;
  updated: boolean;
}

const INITIAL_STATE: BriefingState = {
  budget: 15,
  overrides: {},
  readIds: [],
  savedIds: INITIAL_SAVED_IDS,
  tab: 'today',
  screenByTab: {today: 'root', explore: 'root', saved: 'root', me: 'root'},
  scrollByTab: {today: 0, explore: 0, saved: 0, me: 0},
  sheet: null,
  overrideJustSet: null,
  toast: null,
  reminderOn: true,
  updated: false,
};

function useBriefingState() {
  const [state, setState] = useState<BriefingState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<BriefingState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  const updateStory = useCallback((id: string, patch: {override: Depth | null}) => {
    setState(prev => {
      const overrides = {...prev.overrides};
      if (patch.override == null) delete overrides[id];
      else overrides[id] = patch.override;
      return {...prev, overrides, overrideJustSet: patch.override == null ? null : id};
    });
  }, []);
  return {state, update, updateStory, setState};
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns the page
 * scroll; per-tab scrollTop persistence reads/writes it. */
function findScroller(from: HTMLElement | null): HTMLElement | null {
  let node = from?.parentElement ?? null;
  while (node != null) {
    if (node.scrollHeight > node.clientHeight + 4) {
      const overflowY = getComputedStyle(node).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — the sheet traps focus; Escape closes the topmost
// overlay; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [role="slider"][tabindex="0"]');
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
// FIRSTLIGHT MARK — half-risen sun: brand semicircle whose flat bottom
// edge is a 2px fold line the full mark width, five 2px ray ticks fanned
// above at 30° increments. Fold line uses --color-text-primary (there is
// no --color-text token). Rendered at 28px in the navBar, 20px in the
// sheet header.
// ---------------------------------------------------------------------------

function FirstlightMark({size}: {size: number}) {
  // Rays at 30/60/90/120/150° from the horizon center, radius 10.5 → 13.
  const rays = [30, 60, 90, 120, 150].map(deg => {
    const rad = (deg * Math.PI) / 180;
    return {
      x1: 14 + 10.5 * Math.cos(rad),
      y1: 19 - 10.5 * Math.sin(rad),
      x2: 14 + 13 * Math.cos(rad),
      y2: 19 - 13 * Math.sin(rad),
    };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M 6.5 19 A 7.5 7.5 0 0 1 21.5 19 Z" fill={BRAND_ACCENT} />
      {rays.map(ray => (
        <line
          key={\`\${ray.x2}-\${ray.y2}\`}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke={BRAND_ACCENT}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      <line x1={2} y1={19} x2={26} y2={19} stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TIME BUDGET DIAL — 240×140 semicircular thumb-arc dial, 5–20 min in
// 1-min steps. ONE focusable control: role=slider, ArrowLeft/Right ±1,
// Home 5 / End 20; pointer drag maps atan2 angle → minute snap and
// announces on pointerup only (never per degree). The 44px preset chips
// below are the mandatory button path. Geometry: cx 120, cy 126; budget
// track r96 stroke 12 in REST_CONTROL (≥3:1 — meaningful rest fill, see
// COLOR LITERALS); budget fill arc BRAND_ACCENT round-cap; inner cost arc
// r78 stroke 6 in --color-text-secondary, flipping to WARN_TEXT and
// sweeping past the budget arc in the over-budget override state; 16 tick
// marks 12° apart double as sun rays (echoes the mark); 24px thumb circle
// at the budget angle.
// ---------------------------------------------------------------------------

const DIAL_CX = 120;
const DIAL_CY = 126;
const DIAL_R_BUDGET = 96;
const DIAL_R_COST = 78;

/** Fraction f ∈ [0,1] of the 5–20 scale → point on radius r (f 0 = left
 * end of the 180° arc, f 1 = right end, sweeping over the top). */
function dialPoint(f: number, r: number): {x: number; y: number} {
  return {x: DIAL_CX - r * Math.cos(f * Math.PI), y: DIAL_CY - r * Math.sin(f * Math.PI)};
}

function dialArc(f0: number, f1: number, r: number): string {
  const from = dialPoint(f0, r);
  const to = dialPoint(f1, r);
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${r} \${r} 0 0 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}

function fractionFor(minutes: number): number {
  return (minutes - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET);
}

interface TimeBudgetDialProps {
  budget: number;
  composedCost: number;
  over: boolean;
  overBy: number;
  onBudgetChange: (budget: number) => void;
  onBudgetCommit: (budget: number) => void;
}

function TimeBudgetDial({budget, composedCost, over, overBy, onBudgetChange, onBudgetCommit}: TimeBudgetDialProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const minuteFromPointer = (event: ReactPointerEvent<SVGSVGElement>): number => {
    const svg = svgRef.current;
    if (svg == null) return budget;
    const rect = svg.getBoundingClientRect();
    const scale = 240 / rect.width;
    const x = (event.clientX - rect.left) * scale - DIAL_CX;
    const y = DIAL_CY - (event.clientY - rect.top) * scale;
    if (y <= 0) return x < 0 ? MIN_BUDGET : MAX_BUDGET; // below the horizon → clamp by side
    const deg = (Math.atan2(y, x) * 180) / Math.PI; // 180 at left end … 0 at right
    const f = (180 - deg) / 180;
    return Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, MIN_BUDGET + Math.round(f * 15)));
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onBudgetChange(minuteFromPointer(event));
  };
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const minute = minuteFromPointer(event);
    if (minute !== budget) onBudgetChange(minute);
  };
  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onBudgetCommit(minuteFromPointer(event));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(MIN_BUDGET, budget - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(MAX_BUDGET, budget + 1);
    else if (event.key === 'Home') next = MIN_BUDGET;
    else if (event.key === 'End') next = MAX_BUDGET;
    if (next == null) return;
    event.preventDefault();
    if (next !== budget) onBudgetChange(next);
  };

  const budgetF = fractionFor(budget);
  // Cost arc on the same 5–20 scale, clamped to the dial's range.
  const costF = Math.min(1, Math.max(0, fractionFor(composedCost)));
  const thumb = dialPoint(budgetF, DIAL_R_BUDGET);
  const ticks = Array.from({length: 16}, (_, i) => i / 15);

  return (
    <div
      className="flb-focusable"
      style={styles.dialWrap}
      role="slider"
      tabIndex={0}
      aria-label="Time budget"
      aria-valuemin={MIN_BUDGET}
      aria-valuemax={MAX_BUDGET}
      aria-valuenow={budget}
      aria-valuetext={\`\${budget} minutes, briefing costs \${composedCost}\`}
      onKeyDown={onKeyDown}>
      <svg
        ref={svgRef}
        style={{...styles.dialSvg, touchAction: 'none', cursor: 'pointer'}}
        viewBox="0 0 240 140"
        fill="none"
        aria-hidden
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}>
        {/* Budget track — meaningful rest fill at ≥3:1 (REST_CONTROL). */}
        <path d={dialArc(0, 1, DIAL_R_BUDGET)} stroke={REST_CONTROL} strokeWidth={12} strokeLinecap="round" />
        {/* 16 tick marks (5–20, 1-min steps, 12° apart) double as rays. */}
        {ticks.map(f => {
          const inner = dialPoint(f, 84);
          const outer = dialPoint(f, 90);
          return (
            <line
              key={f}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--color-border)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        {/* Budget fill 5 → current budget. */}
        {budgetF > 0.001 ? (
          <path d={dialArc(0, budgetF, DIAL_R_BUDGET)} stroke={BRAND_ACCENT} strokeWidth={12} strokeLinecap="round" />
        ) : null}
        {/* Inner cost arc — sweeps past the budget arc when over. */}
        {costF > 0.001 ? (
          <path
            d={dialArc(0, costF, DIAL_R_COST)}
            stroke={over ? WARN_TEXT : 'var(--color-text-secondary)'}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ) : null}
        {/* 24px thumb at the budget angle. */}
        <circle
          cx={thumb.x}
          cy={thumb.y}
          r={12}
          fill="var(--color-background-card)"
          stroke="var(--color-border)"
          strokeWidth={1}
          style={{filter: 'drop-shadow(0 1px 3px var(--color-shadow))'}}
        />
      </svg>
      <div style={styles.dialReadout}>
        <span style={styles.dialNum}>
          <span style={styles.dialNumText}>{budget}</span>
          <span style={styles.dialNumUnit}>min</span>
        </span>
        {over ? (
          <span style={styles.dialCapOver}>+{overBy} min over</span>
        ) : (
          <span style={styles.dialCap}>fits {composedCost} min</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DEPTH-TOGGLE STORY ROW — one component, three fixed-height states
// (56/116/172, height transition 200ms, instant under reduced motion).
// TWO buttons: the row body toggles read (accessible name = title,
// aria-pressed) and the depth chip cycles headline→summary→full→headline
// as a per-story override ('Set depth for <title>'). Checked rows keep
// legible secondary text (no strikethrough) and a disabled chip.
// ---------------------------------------------------------------------------

interface StoryRowProps {
  story: Story;
  depth: Depth;
  isRead: boolean;
  hasOverride: boolean;
  isLast: boolean;
  onToggleRead: () => void;
  onCycleDepth: () => void;
}

function StoryRow({story, depth, isRead, hasOverride, isLast, onToggleRead, onCycleDepth}: StoryRowProps) {
  const chipLabel = depth === 'headline' ? 'Scan' : depth === 'summary' ? \`\${story.summaryMin} min\` : \`\${story.fullMin} min\`;
  return (
    <div>
      <div className="flb-row" style={{...styles.storyRow, height: ROW_HEIGHTS[depth]}}>
        <button
          type="button"
          className="flb-btn flb-focusable"
          style={{...styles.rowBody, ...(isRead ? {color: 'var(--color-text-secondary)'} : null)}}
          aria-pressed={isRead}
          aria-label={\`\${story.title}\${isRead ? ' — read' : ''}\`}
          onClick={onToggleRead}>
          {/* Checked: white glyph on #B45309 = 5.9:1 light; #1F1B16 glyph
              on #FBBF24 = 9.8:1 dark (BRAND_ON). */}
          <span style={{...styles.checkCircle, ...(isRead ? styles.checkCircleOn : null)}} aria-hidden>
            {isRead ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
          </span>
          <span style={styles.storyText}>
            <span style={styles.kicker}>{story.source}</span>
            <span style={depth === 'headline' ? styles.titleOne : styles.titleTwo}>{story.title}</span>
            {depth !== 'headline' ? (
              <span className="flb-block-in" style={styles.dek}>
                {story.dek}
              </span>
            ) : null}
            {depth === 'full' ? (
              <span className="flb-block-in">
                <span style={styles.fullOverline}>Full read · {story.fullMin} min</span>
                <span style={styles.excerpt}>{story.excerpt}</span>
              </span>
            ) : null}
          </span>
        </button>
        <span style={styles.chipCol}>
          <button
            type="button"
            className="flb-btn flb-focusable"
            style={styles.chipBtn}
            aria-label={\`Set depth for \${story.title} — now \${depth}\`}
            disabled={isRead}
            onClick={onCycleDepth}>
            <span
              style={{
                ...styles.chipFace,
                ...(hasOverride ? styles.chipFaceOverride : null),
                ...(isRead ? styles.chipFaceDisabled : null),
              }}>
              {chipLabel}
            </span>
          </button>
        </span>
      </div>
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; drag between detents is garnish, >120px past medium
// closes), 52px header with the 20px mark and a 44×44 X, focus-trapped
// dialog. Focus enters with preventScroll (the locked overflow-hidden
// shell would otherwise scroll-reveal the animating sheet mid-screen).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
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

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="flb-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease, height 200ms ease',
      }}>
      <button
        type="button"
        className="flb-btn flb-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span style={styles.sheetMarkSlot} aria-hidden>
          <FirstlightMark size={20} />
        </span>
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="flb-btn flb-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileMorningBriefingTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, update, updateStory, setState} = useBriefingState();

  // Focus + scroll plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollRef = useRef<number | null>(null);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const toastSeqRef = useRef(0);
  // Large-title collapse — transient scroll-derived UI, not owner data.
  const [titleCompact, setTitleCompact] = useState(false);

  // THE pure selector — called in render, never stored, so every consumer
  // (dial, rows, badges, strip, burndown, tab badge) recomputes in one
  // commit and can never disagree.
  const comp = compose(state.budget, state.overrides);
  const readSet = new Set(state.readIds);
  const minutesRead = state.readIds.reduce(
    (sum, id) => sum + costOf(STORY_BY_ID[id], comp.depthById[id]),
    0,
  );
  const minutesLeft = Math.max(0, comp.composedCost - minutesRead);
  const over = comp.composedCost > state.budget;
  const overBy = comp.composedCost - state.budget;
  // doneBy = START_TIME 8:00 + composedCost — recomputed only when budget
  // or overrides change (compose inputs), per spec.
  const doneLabel = fmtClock(START_TIME_MIN + comp.composedCost);
  const sectionStats = SECTIONS.map(section => {
    const rows = STORIES.filter(story => story.section === section.id);
    const fit = rows.filter(story => comp.depthById[story.id] !== 'headline').length;
    const minutes = rows.reduce((sum, story) => sum + costOf(story, comp.depthById[story.id]), 0);
    return {...section, total: rows.length, fit, minutes};
  });
  const fitTotal = sectionStats.reduce((sum, section) => sum + section.fit, 0);
  const unread = STORIES.length - state.readIds.length;
  const burnPct = comp.composedCost > 0 ? Math.min(100, (minutesRead / comp.composedCost) * 100) : 0;

  const makeToast = (msg: string, undo: ToastState['undo'] = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };
  const showToast = (msg: string) => update({toast: makeToast(msg)});

  // BUDGET — dial drag recomposes live; the ANNOUNCE lands on pointerup /
  // preset tap only (never per degree of drag).
  const commitBudget = (budget: number) => {
    const cost = compose(budget, state.overrides).composedCost;
    update({budget, toast: makeToast(\`Budget set to \${budget} minutes — briefing now \${cost} minutes\`)});
  };

  // READ CHECK-OFF — reversible, so it executes immediately with Undo
  // (never a confirm). Undo restores the exact prior snapshot.
  const toggleRead = (id: string) => {
    setState(prev => {
      const wasRead = prev.readIds.includes(id);
      const readIds = wasRead ? prev.readIds.filter(readId => readId !== id) : [...prev.readIds, id];
      toastSeqRef.current += 1;
      return {
        ...prev,
        readIds,
        toast: {
          seq: toastSeqRef.current,
          msg: wasRead ? 'Marked as unread' : 'Marked as read',
          undo: wasRead ? null : {readIds: prev.readIds, savedIds: prev.savedIds},
        },
      };
    });
  };

  const undoToast = () => {
    setState(prev => {
      if (prev.toast?.undo == null) return prev;
      toastSeqRef.current += 1;
      return {
        ...prev,
        readIds: prev.toast.undo.readIds,
        savedIds: prev.toast.undo.savedIds,
        toast: {seq: toastSeqRef.current, msg: 'Restored', undo: null},
      };
    });
  };

  const unsave = (id: string) => {
    setState(prev => {
      toastSeqRef.current += 1;
      return {
        ...prev,
        savedIds: prev.savedIds.filter(savedId => savedId !== id),
        toast: {
          seq: toastSeqRef.current,
          msg: 'Removed from Saved',
          undo: {readIds: prev.readIds, savedIds: prev.savedIds},
        },
      };
    });
  };

  // DEPTH OVERRIDE — cycles from the DISPLAYED depth; may exceed budget
  // (the burndown/dial flip to '+N min over' and the sheet grows a
  // 'Reset to auto' path).
  const cycleDepth = (id: string) => {
    updateStory(id, {override: nextDepth(comp.depthById[id])});
  };
  const resetOverrides = () => {
    const autoCost = compose(state.budget, {}).composedCost;
    update({
      overrides: {},
      overrideJustSet: null,
      toast: makeToast(\`Depth reset to auto — briefing now \${autoCost} minutes\`),
    });
  };

  // SHEET lifecycle — focus enters with preventScroll, restores to the
  // opener on every close path (X, scrim, Escape).
  const openSheet = (opener: HTMLElement | null, detent: 'medium' | 'large' = 'medium') => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({sheet: detent});
  };
  const closeSheet = () => {
    update({sheet: null});
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheet]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sheet]);

  // PER-TAB PERSISTENCE — scroll saved on exit, restored on entry;
  // overlays close on switch (the toast dock persists); re-tapping the
  // active Today tab pops to top (the one legal reset).
  const selectTab = (tab: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (tab === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    pendingScrollRef.current = state.scrollByTab[tab] ?? 0;
    update({
      tab,
      sheet: null,
      scrollByTab: {...state.scrollByTab, [state.tab]: scroller?.scrollTop ?? 0},
    });
  };
  useEffect(() => {
    if (pendingScrollRef.current == null) return;
    const scroller = findScroller(shellRef.current);
    if (scroller != null) scroller.scrollTop = pendingScrollRef.current;
    pendingScrollRef.current = null;
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tabDef => tabDef.id === state.tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    selectTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  // Large-title collapse — IntersectionObserver sentinel above the large
  // title; the compact navBar title fades in once it scrolls under.
  useEffect(() => {
    if (state.tab !== 'today') return undefined;
    const element = sentinelRef.current;
    if (element == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setTitleCompact(!entry.isIntersecting);
      },
      {rootMargin: '-64px 0px 0px 0px'},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [state.tab]);

  const onPresetKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    // Nearest preset at or after the current budget, then step.
    const current = PRESETS.reduce(
      (best, preset) =>
        Math.abs(preset - state.budget) < Math.abs(best - state.budget) ? preset : best,
      PRESETS[0],
    );
    const index = PRESETS.indexOf(current);
    const next =
      PRESETS[Math.min(PRESETS.length - 1, Math.max(0, index + (event.key === 'ArrowRight' ? 1 : -1)))];
    commitBudget(next);
    const chips = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
    chips[PRESETS.indexOf(next)]?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const tabTitles: Record<TabId, string> = {
    today: 'Morning Briefing',
    explore: 'Explore',
    saved: 'Saved',
    me: 'Me',
  };
  const hasExactPreset = PRESETS.includes(state.budget);
  // Nearest-preset outline when the dial sits within ±2 min of it (tie
  // rule: exact preset match = filled, nearest = outlined; adjacent-preset
  // midpoints 7.5/12.5/17.5 are non-integer, so no integer budget ties).
  const nearestPreset = PRESETS.reduce(
    (best, preset) => (Math.abs(preset - state.budget) < Math.abs(best - state.budget) ? preset : best),
    PRESETS[0],
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FLB_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="flb-btn flb-focusable"
              style={styles.brandBtn}
              aria-label="Firstlight — back to top"
              onClick={() => selectTab('today')}>
              <FirstlightMark size={28} />
            </button>
          </div>
          <span
            className="flb-fade"
            style={{...styles.navTitle, opacity: state.tab !== 'today' || titleCompact ? 1 : 0}}
            aria-hidden={state.tab === 'today' && !titleCompact}>
            {state.tab === 'today' ? 'Firstlight' : tabTitles[state.tab]}
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="flb-btn flb-focusable"
              style={styles.iconBtn}
              aria-label={\`Time budget — \${state.budget} minutes\`}
              onClick={event => openSheet(event.currentTarget)}>
              <Icon icon={TimerIcon} size="md" color="inherit" />
            </button>
            <button
              type="button"
              className="flb-btn flb-focusable"
              style={styles.iconBtn}
              aria-label="Refresh briefing"
              onClick={() => update({updated: true})}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'today' ? (
            <>
              <div ref={sentinelRef} style={{height: 1}} aria-hidden />
              <div style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>Morning Briefing</h1>
              </div>
              <div style={styles.dateline}>
                <span>{DATELINE}</span>
                {/* role=status announces the fixed post-refresh string. */}
                <span role="status" style={styles.updatedNote}>
                  {state.updated ? 'Updated just now' : ''}
                </span>
              </div>

              <button
                type="button"
                className="flb-btn flb-focusable"
                style={styles.summaryStrip}
                aria-label={\`\${state.budget}-minute briefing, \${fitTotal} of 11 stories, done by \${doneLabel} — open time budget\`}
                onClick={event => openSheet(event.currentTarget)}>
                <span style={styles.stripIcon} aria-hidden>
                  <Icon icon={SunriseIcon} size="md" color="inherit" />
                </span>
                <span style={styles.stripText}>
                  <span style={styles.stripTitle}>{state.budget}-min briefing</span>
                  <span style={styles.stripSub}>
                    {fitTotal} of 11 stories · done by {doneLabel}
                  </span>
                </span>
                <span style={styles.stripChevron} aria-hidden>
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </span>
              </button>

              {sectionStats.map(section => (
                <section key={section.id}>
                  <div style={styles.sectionHeaderRow}>
                    <h2 style={styles.sectionHeaderText}>{section.label}</h2>
                    <span style={styles.fitBadge}>
                      {section.fit} of {section.total} fit
                    </span>
                  </div>
                  <div style={styles.listCard}>
                    {STORIES.filter(story => story.section === section.id).map((story, index, rows) => (
                      <StoryRow
                        key={story.id}
                        story={story}
                        depth={comp.depthById[story.id]}
                        isRead={readSet.has(story.id)}
                        hasOverride={state.overrides[story.id] != null}
                        isLast={index === rows.length - 1}
                        onToggleRead={() => toggleRead(story.id)}
                        onCycleDepth={() => cycleDepth(story.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : null}

          {state.tab === 'explore' ? (
            <>
              <div style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>Explore</h1>
              </div>
              {/* TRUE-EMPTY state — foundations anatomy, one action. */}
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>
                  <Icon icon={CompassIcon} size="lg" color="inherit" />
                </span>
                <span style={styles.emptyTitle}>Nothing to explore yet</span>
                <span style={styles.emptyBody}>Topics you follow appear here.</span>
                <button
                  type="button"
                  className="flb-btn flb-focusable"
                  style={styles.emptyBtn}
                  onClick={() => showToast("Topics arrive with tomorrow's edition")}>
                  Browse topics
                </button>
              </div>
            </>
          ) : null}

          {state.tab === 'saved' ? (
            <>
              <div style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>Saved</h1>
              </div>
              {state.savedIds.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>
                    <Icon icon={BookmarkIcon} size="lg" color="inherit" />
                  </span>
                  <span style={styles.emptyTitle}>No saved stories</span>
                  <span style={styles.emptyBody}>Stories you bookmark appear here.</span>
                </div>
              ) : (
                <div style={{...styles.listCard, marginTop: 16}}>
                  {state.savedIds.map((id, index) => {
                    const story = STORY_BY_ID[id];
                    return (
                      <div key={id}>
                        <div style={styles.savedRowWrap}>
                          <button
                            type="button"
                            className="flb-btn flb-focusable"
                            style={styles.savedRow}
                            aria-label={\`\${story.title} — view in briefing\`}
                            onClick={() => selectTab('today')}>
                            <span style={styles.savedTitle}>{story.title}</span>
                            <span style={styles.savedSub}>
                              {story.source} · {story.fullMin} min read
                            </span>
                          </button>
                          <button
                            type="button"
                            className="flb-btn flb-focusable"
                            style={{...styles.iconBtn, ...styles.savedUnsave}}
                            aria-label={\`Remove \${story.title} from Saved\`}
                            onClick={() => unsave(id)}>
                            <Icon icon={BookmarkIcon} size="md" color="inherit" />
                          </button>
                        </div>
                        {index === state.savedIds.length - 1 ? null : <div style={styles.rowDivider} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}

          {state.tab === 'me' ? (
            <>
              <div style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>Me</h1>
              </div>
              <div style={{...styles.listCard, marginTop: 16}}>
                {/* Whole 44px row IS the switch (role=switch, aria-checked). */}
                <button
                  type="button"
                  className="flb-btn flb-focusable"
                  style={styles.utilRow}
                  role="switch"
                  aria-checked={state.reminderOn}
                  onClick={() =>
                    update({
                      reminderOn: !state.reminderOn,
                      toast: makeToast(
                        state.reminderOn ? 'Daily reminder off' : 'Daily reminder on — 7:45 tomorrow',
                      ),
                    })
                  }>
                  <span style={styles.utilLabel}>Daily briefing reminder</span>
                  <span
                    style={{...styles.switchTrack, ...(state.reminderOn ? styles.switchTrackOn : null)}}
                    aria-hidden>
                    <span
                      className="flb-anim"
                      style={{
                        ...styles.switchThumb,
                        transform: state.reminderOn ? 'translateX(20px)' : undefined,
                      }}
                    />
                  </span>
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="flb-btn flb-focusable"
                  style={styles.utilRow}
                  aria-label={\`Time budget, \${state.budget} minutes — change\`}
                  onClick={event => openSheet(event.currentTarget)}>
                  <span style={styles.utilLabel}>Time budget</span>
                  <span style={styles.utilValue}>{state.budget} min</span>
                  <span style={styles.utilChevron} aria-hidden>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="flb-btn flb-focusable"
                  style={styles.utilRow}
                  onClick={() => showToast('Firstlight · Edition 214 · fixture build')}>
                  <span style={styles.utilLabel}>About Firstlight</span>
                  <span style={styles.utilValue}>Edition 214</span>
                  <span style={styles.utilChevron} aria-hidden>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
              </div>
            </>
          ) : null}
        </main>

        {/* THE one polite live region — sticky-in-flow toast dock. */}
        <div
          style={{...styles.toastDock, bottom: state.tab === 'today' ? 112 : 76}}
          aria-live="polite">
          {state.toast != null ? (
            <div
              key={state.toast.seq}
              className="flb-fade"
              style={{...styles.toast, ...(state.toast.undo == null ? {paddingInlineEnd: 16} : null)}}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="flb-btn flb-focusable" style={styles.undoBtn} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {state.tab === 'today' ? (
          <button
            type="button"
            className="flb-btn flb-focusable"
            style={styles.burndownBar}
            aria-label={
              over
                ? \`Briefing progress: \${overBy} minutes over budget, done by \${doneLabel}\`
                : \`Briefing progress: \${minutesLeft} minutes left, done by \${doneLabel}\`
            }
            onClick={event => openSheet(event.currentTarget)}>
            <span style={styles.burnTrack} aria-hidden>
              <span className="flb-fill" style={{...styles.burnFill, width: \`\${burnPct}%\`, display: 'block'}} />
            </span>
            <span style={styles.burnRow}>
              {/* Over-budget: WARN_TEXT pair (4.8:1 light / 10.9:1 dark vs
                  the chrome-over-body surfaces — see COLOR LITERALS). */}
              <span style={over ? styles.burnLeadOver : styles.burnLead}>
                {over ? \`+\${overBy} min over\` : \`\${minutesLeft} min left\`}
              </span>
              <span style={styles.burnDot} aria-hidden>
                ·
              </span>
              <span style={styles.burnMid}>done by {doneLabel}</span>
              <span style={styles.burnTrail}>
                {state.readIds.length} of 11 read
              </span>
            </span>
          </button>
        ) : null}

        <nav style={styles.tabBar} role="tablist" aria-label="Firstlight tabs" onKeyDown={onTabKeyDown}>
          {TABS.map(tabDef => {
            const isActive = state.tab === tabDef.id;
            const TabGlyph =
              tabDef.id === 'today'
                ? SunriseIcon
                : tabDef.id === 'explore'
                  ? CompassIcon
                  : tabDef.id === 'saved'
                    ? BookmarkIcon
                    : UserIcon;
            return (
              <button
                key={tabDef.id}
                ref={element => {
                  tabRefs.current[tabDef.id] = element;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="flb-btn flb-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                aria-label={
                  tabDef.id === 'today' && unread > 0 ? \`Today, \${unread} unread\` : tabDef.label
                }
                onClick={() => selectTab(tabDef.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={TabGlyph} size="md" color="inherit" />
                  {/* Badge removed (not '0') at zero unread. */}
                  {tabDef.id === 'today' && unread > 0 ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {unread}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>
                  {tabDef.label}
                </span>
              </button>
            );
          })}
        </nav>

        {state.sheet != null ? (
          <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        ) : null}
        {state.sheet != null ? (
          <Sheet
            titleId="flb-budget-title"
            title="Time budget"
            detent={state.sheet}
            onDetentChange={detent => update({sheet: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <div style={styles.dialBox}>
              <TimeBudgetDial
                budget={state.budget}
                composedCost={comp.composedCost}
                over={over}
                overBy={overBy}
                onBudgetChange={budget => update({budget})}
                onBudgetCommit={commitBudget}
              />
            </div>
            <div style={styles.presetRow} role="radiogroup" aria-label="Budget presets" onKeyDown={onPresetKeyDown}>
              {PRESETS.map(preset => {
                const isOn = state.budget === preset;
                const isNear = !isOn && !hasExactPreset && nearestPreset === preset && Math.abs(state.budget - preset) <= 2;
                return (
                  <button
                    key={preset}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    tabIndex={isOn || (!hasExactPreset && preset === nearestPreset) ? 0 : -1}
                    className="flb-btn flb-focusable"
                    style={{
                      ...styles.presetChip,
                      ...(isNear ? styles.presetChipNear : null),
                      ...(isOn ? styles.presetChipOn : null),
                    }}
                    aria-label={\`\${preset} minute budget\`}
                    onClick={() => commitBudget(preset)}>
                    {preset} min
                  </button>
                );
              })}
            </div>

            <h3 style={styles.sheetSectionHeader}>Composition</h3>
            <div style={styles.compCard}>
              {/* Section minutes sum EXACTLY to the composed cost — both
                  derive from the same compose() call. */}
              {sectionStats.map((section, index) => (
                <div key={section.id}>
                  <div style={styles.compRow}>
                    <span style={styles.compName}>{section.label}</span>
                    <span style={styles.compMeta}>
                      {section.fit} of {section.total} · {section.minutes} min
                    </span>
                  </div>
                  {index === sectionStats.length - 1 ? null : <div style={styles.rowDivider} />}
                </div>
              ))}
            </div>
            {over ? (
              <button type="button" className="flb-btn flb-focusable" style={styles.resetBtn} onClick={resetOverrides}>
                Reset to auto
              </button>
            ) : null}

            {state.sheet === 'large' ? (
              <>
                <h3 style={styles.sheetSectionHeader}>Priority order</h3>
                <div style={styles.compCard}>
                  {RANK_ORDER.map((id, index) => {
                    const story = STORY_BY_ID[id];
                    const depth = comp.depthById[id];
                    const chipLabel =
                      depth === 'headline' ? 'Scan' : depth === 'summary' ? \`\${story.summaryMin} min\` : \`\${story.fullMin} min\`;
                    return (
                      <div key={id}>
                        <div style={styles.prioRow}>
                          <span style={styles.prioRank}>{index + 1}</span>
                          <span style={styles.prioTitle}>{story.title}</span>
                          <button
                            type="button"
                            className="flb-btn flb-focusable"
                            style={{...styles.chipBtn, marginInlineEnd: 4}}
                            aria-label={\`Set depth for \${story.title} — now \${depth}\`}
                            disabled={readSet.has(id)}
                            onClick={() => cycleDepth(id)}>
                            <span
                              style={{
                                ...styles.chipFace,
                                ...(state.overrides[id] != null ? styles.chipFaceOverride : null),
                                ...(readSet.has(id) ? styles.chipFaceDisabled : null),
                              }}>
                              {chipLabel}
                            </span>
                          </button>
                        </div>
                        {index === RANK_ORDER.length - 1 ? null : <div style={styles.rowDivider} />}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};