// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Trellin candidate-side job
 *   pipeline: 22 applications a01–a22 with a hand-verified stage census
 *   (Applied 8 · Screen 6 · Onsite 4 · Offer 2 · Closed 2 = 22 ✓; active =
 *   22 − 2 closed = 20 ✓), cumulative funnel maxStage counts (reached
 *   Screen 14, Onsite 8, Offer 3 ✓ → conversion bars 14/22 · 8/14 · 3/8),
 *   deterministic daysSinceTouch (going-cold set exactly 5: a13 21d, a07
 *   12d, a04 9d, a11 8d, a17 7d), two open offers (Northwind $156,000 /
 *   Halyard $148,000, Δ $8,000 ✓), and 9 tasks t01–t09 (3 due today + 4
 *   this week + 2 done = 9 ✓). No Date.now(), no Math.random(), no network.
 * @output Trellin — Application Pipeline: a 390px MOBILE triage surface.
 *   NavBar (SlidersHorizontal filter · trellis mark + 'Trellin' over a
 *   live '20 active · 22 total' subtitle · RefreshCw) over a sticky 56px
 *   FunnelStrip whose 5 count cells flex-grow PROPORTIONALLY to the live
 *   stage census; below it, 5 inset-grouped stage listCards of 88px
 *   appRows, each carrying a 44px StalenessRing (indigo→gray decay at
 *   8%/day, error notch at ≥7d) around a 36px monogram and its own 5-dot
 *   StageRail. SIGNATURE MOVE: pointer-dragging a row's StageRail ghost
 *   dot to a new detent commits update(id,{stage}) — the row FLIP-slides
 *   into its new stage card, the FunnelStrip re-proportions live, the
 *   navBar active count re-derives, badges recompute, and a persistent
 *   Undo toast (no timers) restores the exact fixture-order position.
 *   Tasks tab (check-toggle rows, 3-badge) and Insights tab
 *   (OfferCompareCard, 3 ConversionBars, going-cold list) derive from the
 *   same records. Detail sheet (two detents) shows a 28px-dot rail, stage
 *   timeline, inline 36px stage-move buttons (the sheet's non-gesture
 *   path), and a 48px 'Log touch' primary that re-tints the ring live.
 * @position Page template; emitted by `astryx template mobile-application-pipeline`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, detail sheet, action
 *   sheets, toast) are position:'absolute' or sticky INSIDE shell;
 *   position:fixed is banned. While any sheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 72 for the 44px-ring rows); no
 *   desktop frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Trellin indigo #4F46E5 — the demo --color-brand is the
 *   demo logo blue, so the spec hex is quarantined per house rule); the
 *   future-dot border is an explicit ≥3:1 light-dark pair per the
 *   foundations amendment (interactive/rest-state boundaries never lean on
 *   hairline tokens); the staleness-ring gray endpoint is decorative
 *   (aria-hidden ring; the '12d' meta text carries the value in
 *   --color-error when going cold).
 * Density grid (MOBILE, verbatim): 16px screen gutter · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', center = 34px two-line stack:
 *   17px/600 title + 11px/500 tabular subtitle); funnelStrip 56px sticky
 *   top:52 z19 (5 cells, gap 4, minWidth 40, height 40, radius 8: count
 *   16/700 tabular + label 11/500; 320px worst case 5×40 + 4×4 + 32 gutter
 *   = 248 ≤ 320 ✓); appRow 88px = 12 + 20 (company 16/500) + 4 + 16
 *   (meta 13/400) + 4 + 20 (StageRail zone) + 12 ✓, leading 44px ring
 *   around 36px monogram, 12px gap, trailing 44×44 ellipsis, divider inset
 *   72 (16 pad + 44 ring + 12 gap); sectionHeader 13/600 uppercase 0.06em
 *   at 32px inset, 20px top / 8px bottom, 'ONSITE · 4' tabular; task rows
 *   60px two-line with 24px selection circles in 44px hits; tabBar 64px
 *   sticky bottom z20 (24px icon over 11/500 label, 4px gap, 16px brand
 *   badge pills at top:-4 right:-8); toast 48px min-height in a sticky
 *   height-0 dock at bottom:76; sheet detents 55% / calc(100% − 56px),
 *   24px grabber zone with 36×5 pill, 52px sheet header; buttons 48px
 *   primary / 36px secondary / 44×44 icon. TYPE (Figtree via
 *   --font-family-body): 28/700 large titles (Tasks·Insights) · 17/600
 *   nav+sheet titles · 16/400–500 body floor · 13/400 meta · 11/500
 *   overlines+badges; nothing under 11px; tabular-nums on every count.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   every gesture has a visible button path (rail drag ↔ ellipsis action
 *   sheet; sheet drag ↔ grabber click + X + Escape; funnel radiogroup ↔
 *   arrow keys).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow: no width literals; funnel
 *   cells flexGrow=count with minWidth 40 (ordering of widths preserved —
 *   grow values differ); appRow text column minWidth 0 + ellipsis on both
 *   lines (a13 'Meridian & Blackwood Talent Partners' truncates at 320 AND
 *   430 without pushing the ellipsis button); StageRail connectors flex:1
 *   between fixed 10px dots (rail stretches ~176→260px); ring/avatar/
 *   ellipsis fixed, text absorbs all delta; OfferCompareCard columns
 *   minWidth 0 with tabular salaries never wrapping ((320−64)/2 = 128px ≥
 *   '$156,000' ≈ 74px ✓); sheets insetInline 0; toast insetInline 16;
 *   navBar center stack maxWidth 200 ellipsized.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — house default.
 */

import {useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ChartNoAxesColumnIcon,
  CheckIcon,
  CheckSquareIcon,
  HandshakeIcon,
  KanbanIcon,
  MailIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Trellin indigo). As text: #4F46E5 on
// #FFFFFF ≈ 6.3:1; #A5B4FC on the dark card (~#1C1C1E) ≈ 8.0:1 — both pass
// 4.5:1 for the 13px/600 toast Undo and funnel labels.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// Text over a BRAND_ACCENT fill (active funnel cell counts, tab badges):
// #FFFFFF on #4F46E5 = 8.5:1; #1E1B4B on #A5B4FC = 8.9:1 (spec math).
const BRAND_ON = 'light-dark(#FFFFFF, #1E1B4B)';
// Current-dot halo — 25% brand wash, decorative (the filled dot + aria
// label encode the stage).
const BRAND_HALO = `color-mix(in srgb, ${BRAND_ACCENT} 25%, transparent)`;
// FUTURE STAGE DOT BORDERS — meaningful rest-state boundaries, so per the
// foundations amendment they get an explicit ≥3:1 pair against their
// ACTUAL surface (the card): rgba(21,17,12,0.28) on #FFF ≈ 3.2:1;
// rgba(255,255,255,0.34) on ~#1C1C1E ≈ 3.4:1.
const FUTURE_DOT = 'light-dark(rgba(21, 17, 12, 0.28), rgba(255, 255, 255, 0.34))';
// StalenessRing gray endpoint — DECORATIVE (ring is aria-hidden and the
// days value lives in visible meta text), so contrast-exempt per spec.
const RING_GRAY = 'light-dark(#9CA3AF, #6B7280)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// current-dot pulse, sheet slide-in, funnel flex-grow transition; ALL
// animation collapses under prefers-reduced-motion (pulse removed — the
// static halo alone encodes "current"; slides become fades; the funnel
// re-proportion goes instant).
// ---------------------------------------------------------------------------

const TRELLIN_CSS = `
.trl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.trl-btn:disabled { cursor: default; }
.trl-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.trl-fade { transition: opacity 240ms ease; }
.trl-grow { transition: flex-grow 240ms ease; }
@keyframes trl-pulse {
  0%, 100% { box-shadow: 0 0 0 4px ${BRAND_HALO}; }
  50% { box-shadow: 0 0 0 7px ${BRAND_HALO}; }
}
.trl-pulse { animation: trl-pulse 2000ms ease-in-out infinite; }
@keyframes trl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.trl-sheet-in { animation: trl-sheet-in 240ms ease; }
.trl-vh {
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
  .trl-fade { transition: none; }
  .trl-grow { transition: none; }
  .trl-pulse { animation: none; box-shadow: 0 0 0 4px ${BRAND_HALO}; }
  .trl-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; hairline ALWAYS ON (chosen variant per
  // spec, noted). Center is a 34px two-line stack (20 + 14 line heights).
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
  navCenter: {
    maxWidth: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  navTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    lineHeight: '20px',
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '14px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // FUNNEL STRIP — 56px sticky top:52 z19, same blur surface, 5 cells gap
  // 4; each cell flexGrow = live stage count, minWidth 40, height 40.
  funnelStrip: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  funnelCell: {
    minWidth: 40,
    height: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  funnelCellActive: {background: BRAND_ACCENT, color: BRAND_ON},
  funnelCount: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: '18px',
    fontVariantNumeric: 'tabular-nums',
  },
  funnelLabel: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    paddingInline: 2,
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px inset (16 gutter + 16
  // card pad), 20px top / 8px bottom.
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
  listCardDim: {opacity: 0.4},
  // rowDivider inset 72 = 16 pad + 44 ring + 12 gap.
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 72},
  rowDividerShallow: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // APP ROW — 88px: 12 + 20 (company) + 4 + 16 (meta) + 4 + 20 (rail) + 12.
  appRowOuter: {position: 'relative', height: 88},
  appRowBtn: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    // 60 = 44 ellipsis + 16 pad — text never pushes the ellipsis button.
    paddingInlineEnd: 60,
  },
  ringWrap: {width: 44, height: 44, flexShrink: 0, position: 'relative'},
  avatar: {
    position: 'absolute',
    inset: 4,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  textStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    // Rail zone (20px) + its 4px gap reserved below via paddingBottom.
    paddingBottom: 24,
  },
  companyLine: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metaLine: {
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metaCold: {color: 'var(--color-error)', fontWeight: 500},
  // RAIL ZONE — absolute over the text column (left 72 = 16+44+12; right
  // 60 clears the ellipsis); the whole 20px-tall zone is the drag surface.
  railZone: {
    position: 'absolute',
    left: 72,
    right: 60,
    bottom: 12,
    height: 20,
    touchAction: 'pan-y',
    zIndex: 1,
  },
  ellipsisBtn: {
    position: 'absolute',
    top: 22,
    right: 8,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    zIndex: 1,
  },
  emptyStageRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  terminalCaption: {
    margin: '16px 0 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Large titles (Tasks · Insights) — 28/700 in a 52px block at the gutter.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  // TASK ROW — 60px two-line with a 24px selection circle in a merged
  // full-row 44px+ hit.
  taskRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    // Interactive boundary at rest — FUTURE_DOT pair, ≥3:1 vs card.
    border: `2px solid ${FUTURE_DOT}`,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ON,
  },
  selectionCircleOn: {border: 'none', background: BRAND_ACCENT},
  taskText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  taskTitle: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  taskTitleDone: {color: 'var(--color-text-secondary)', textDecoration: 'line-through'},
  taskMeta: {
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // INSIGHTS — offer compare, conversion bars, going-cold list.
  offerRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  offerText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  offerCompany: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offerMeta: {fontSize: 13, lineHeight: '16px', color: 'var(--color-text-secondary)'},
  offerSalary: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  offerFooter: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
  },
  convRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
    paddingInline: 16,
  },
  convHead: {display: 'flex', alignItems: 'baseline', gap: 8},
  convLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  convVal: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  convTrack: {
    height: 6,
    borderRadius: 3,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  convFill: {height: '100%', borderRadius: 3, background: BRAND_ACCENT},
  coldRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  coldCompany: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  coldDays: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-error)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // EMPTY STATE (true-empty offers) per foundations anatomy.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, marginBottom: 4},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // TAB BAR — 64px sticky bottom z20, 3 tabs, blur + top hairline.
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
  tabIconWrap: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px'},
  // TOAST DOCK — sticky-in-flow height-0 anchor pinning 76px above the
  // viewport bottom (foundations amendment: absolute would pin to the
  // DOCUMENT bottom on this tall scrolling list). Switches to absolute
  // only while the shell is scroll-locked (sheets open) — the one case
  // shell-absolute is correct.
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
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    height: 'auto',
    paddingInline: 0,
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
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
  toastStatic: {position: 'static', maxWidth: '100%'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInlineEnd: 12,
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEETS — scrim z40 + sheet z41, absolute inside shell.
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  sheetSection: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  bigRailWrap: {paddingBlock: 16},
  timelineRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  timelineStage: {flex: 1, minWidth: 0},
  timelineDate: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Inline 36px stage-move buttons — the detail sheet's non-gesture path
  // (never a nested action sheet; sheets don't stack).
  stageBtnRow: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8},
  stageBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stageBtnDestructive: {color: 'var(--color-error)'},
  contactRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    fontSize: 16,
  },
  contactIcon: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  notesBlock: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
  },
  // ACTION SHEET — two stacked cards, insetInline 16 bottom 16 z41.
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
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
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
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  actionDivider: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic, dual fields, aggregates DERIVED at render.
// Cross-check ledger (verified by hand): stage census Applied 8 (a01–a08) +
// Screen 6 (a09–a14) + Onsite 4 (a15–a18) + Offer 2 (a19, a20) + Closed 2
// (a21, a22) = 22 ✓; active = 22 − 2 = 20 ✓; cumulative maxStage — reached
// Screen 6+4+2+2 = 14 ✓, reached Onsite 4+2+2 = 8 ✓ (both closed apps
// reached Onsite), reached Offer 2+1(a22) = 3 ✓ → ConversionBars 14/22
// (63.6→64%), 8/14 (57.1→57%), 3/8 (37.5→38%); going-cold set exactly 5
// (≥7d): a13 21d, a07 12d, a04 9d, a11 8d, a17 7d; offers 156,000 −
// 148,000 = Δ 8,000 ✓; tasks 3 due today + 4 this week + 2 done = 9 ✓.
// ---------------------------------------------------------------------------

const STAGES = ['Applied', 'Screen', 'Onsite', 'Offer', 'Closed'] as const;
type StageIdx = 0 | 1 | 2 | 3 | 4;

interface AppRec {
  id: string;
  company: string;
  role: string;
  stage: StageIdx;
  // Furthest FUNNEL stage reached (0–3; Closed never bumps it) — the
  // conversion bars derive from this, so it survives moves.
  maxStage: number;
  daysSinceTouch: number;
  salaryCents?: number;
  salaryLabel?: string;
  contact: string;
  outcome?: 'rejected' | 'accepted';
  appliedDate: string;
}

interface TaskRec {
  id: string;
  appId: string;
  title: string;
  due: 'today' | 'week';
  dueLabel: string;
  done: boolean;
}

// a13 company + role is the double-long-line ellipsis stress (88px row that
// also shows '21d · going cold'); a01 (0d, full indigo ring) and a13 (21d,
// fully gray + notch) render in adjacent groups for the screenshot.
const APPLICATIONS: AppRec[] = [
  {id: 'a01', company: 'Brightloom', role: 'Senior Frontend Engineer', stage: 0, maxStage: 0, daysSinceTouch: 0, contact: 'Maya Okafor', appliedDate: 'Jun 30'},
  {id: 'a02', company: 'Quillwork Labs', role: 'Staff Product Designer', stage: 0, maxStage: 0, daysSinceTouch: 1, contact: 'Dan Reyes', appliedDate: 'Jun 29'},
  {id: 'a03', company: 'Sablewood', role: 'Engineering Manager, Platform', stage: 0, maxStage: 0, daysSinceTouch: 3, contact: 'Ines Vogel', appliedDate: 'Jun 27'},
  {id: 'a04', company: 'Ostermill', role: 'Senior Product Engineer', stage: 0, maxStage: 0, daysSinceTouch: 9, contact: 'Theo Lindqvist', appliedDate: 'Jun 21'},
  {id: 'a05', company: 'Pinefort Systems', role: 'Frontend Engineer II', stage: 0, maxStage: 0, daysSinceTouch: 2, contact: 'Ruth Ellison', appliedDate: 'Jun 28'},
  {id: 'a06', company: 'Larkspur Analytics', role: 'Design Engineer', stage: 0, maxStage: 0, daysSinceTouch: 5, contact: 'Coleman Park', appliedDate: 'Jun 24'},
  {id: 'a07', company: 'Duskrow', role: 'Senior Fullstack Engineer', stage: 0, maxStage: 0, daysSinceTouch: 12, contact: 'Anaïs Brodeur', appliedDate: 'Jun 18'},
  {id: 'a08', company: 'Veltrix', role: 'Staff Software Engineer', stage: 0, maxStage: 0, daysSinceTouch: 4, contact: 'Owen Castellanos', appliedDate: 'Jun 26'},
  {id: 'a09', company: 'Coppervale', role: 'Senior Frontend Engineer', stage: 1, maxStage: 1, daysSinceTouch: 1, contact: 'Priya Natarajan', appliedDate: 'Jun 12'},
  {id: 'a10', company: 'Ferrostack', role: 'Platform Engineer, Infra', stage: 1, maxStage: 1, daysSinceTouch: 6, contact: 'Gus Whitaker', appliedDate: 'Jun 10'},
  {id: 'a11', company: 'Cinderpeak', role: 'Product Engineer', stage: 1, maxStage: 1, daysSinceTouch: 8, contact: 'Lena Marsh', appliedDate: 'Jun 8'},
  {id: 'a12', company: 'Ironquill', role: 'Senior Design Engineer', stage: 1, maxStage: 1, daysSinceTouch: 2, contact: 'Silas Nakagawa', appliedDate: 'Jun 14'},
  {id: 'a13', company: 'Meridian & Blackwood Talent Partners', role: 'Principal Talent Research Partner, Executive Search', stage: 1, maxStage: 1, daysSinceTouch: 21, contact: 'Beatrix Meridian', appliedDate: 'May 30'},
  {id: 'a14', company: 'Glasswing Health', role: 'Engineering Manager', stage: 1, maxStage: 1, daysSinceTouch: 0, contact: 'Noor Haddad', appliedDate: 'Jun 16'},
  {id: 'a15', company: 'Tessellate Studio', role: 'Staff Frontend Engineer', stage: 2, maxStage: 2, daysSinceTouch: 3, contact: 'Dana Whitfield', salaryCents: 15200000, salaryLabel: '$152,000', appliedDate: 'May 28'},
  {id: 'a16', company: 'Blufin Systems', role: 'Senior Software Engineer', stage: 2, maxStage: 2, daysSinceTouch: 1, contact: 'Marcus Bell', salaryCents: 14400000, salaryLabel: '$144,000', appliedDate: 'Jun 2'},
  {id: 'a17', company: 'Marrowgate', role: 'Senior Product Engineer', stage: 2, maxStage: 2, daysSinceTouch: 7, contact: 'Elif Aydın', salaryCents: 14900000, salaryLabel: '$149,000', appliedDate: 'May 26'},
  {id: 'a18', company: 'Arbordale', role: 'Frontend Architect', stage: 2, maxStage: 2, daysSinceTouch: 2, contact: 'Joel Fontaine', salaryCents: 15800000, salaryLabel: '$158,000', appliedDate: 'Jun 4'},
  {id: 'a19', company: 'Northwind Robotics', role: 'Staff Frontend Engineer', stage: 3, maxStage: 3, daysSinceTouch: 0, contact: 'Camille Duarte', salaryCents: 15600000, salaryLabel: '$156,000', appliedDate: 'May 12'},
  {id: 'a20', company: 'Halyard Health', role: 'Senior Frontend Engineer', stage: 3, maxStage: 3, daysSinceTouch: 4, contact: 'Rob Ainsley', salaryCents: 14800000, salaryLabel: '$148,000', appliedDate: 'May 15'},
  {id: 'a21', company: 'Copperline Freight', role: 'Senior Software Engineer', stage: 4, maxStage: 2, daysSinceTouch: 6, contact: 'Freya Holt', outcome: 'rejected', appliedDate: 'May 8'},
  {id: 'a22', company: 'Hobbline', role: 'Staff Product Engineer', stage: 4, maxStage: 3, daysSinceTouch: 5, contact: 'Ade Bakare', outcome: 'accepted', appliedDate: 'May 5'},
];

// Fixture order IS the sort key — Undo restores the exact prior group
// position automatically because groups always render in this order.
const APP_ORDER = APPLICATIONS.map(app => app.id);

// Tasks badge = due-today not done = 3 ✓; DONE section = 2 ✓.
const TASKS: TaskRec[] = [
  {id: 't01', appId: 'a15', title: 'Send thank-you note to Dana Whitfield', due: 'today', dueLabel: 'Due today', done: false},
  {id: 't02', appId: 'a16', title: 'Prep system design loop — Blufin', due: 'today', dueLabel: 'Due today', done: false},
  {id: 't03', appId: 'a19', title: 'Reply to Northwind comp email', due: 'today', dueLabel: 'Due today', done: false},
  {id: 't04', appId: 'a09', title: 'Follow up with Coppervale recruiter', due: 'week', dueLabel: 'Due Wed', done: false},
  {id: 't05', appId: 'a10', title: 'Finish Ferrostack take-home (2 h left)', due: 'week', dueLabel: 'Due Thu', done: false},
  {id: 't06', appId: 'a20', title: 'Review Halyard benefits PDF', due: 'week', dueLabel: 'Due Fri', done: false},
  {id: 't07', appId: 'a11', title: 'Nudge Cinderpeak — 8 days quiet', due: 'week', dueLabel: 'Due Sat', done: false},
  {id: 't08', appId: 'a18', title: 'Submit Arbordale references', due: 'week', dueLabel: 'Done Mon', done: true},
  {id: 't09', appId: 'a14', title: 'Sign Glasswing NDA', due: 'week', dueLabel: 'Done Tue', done: true},
];

const TASK_ORDER = TASKS.map(task => task.id);

// Detail-sheet timeline dates — one fixed literal ladder (appliedDate +
// fixed offsets pre-computed as strings; index = stage reached).
const TIMELINE_DATES = ['May 12', 'May 28', 'Jun 9', 'Jun 18', 'Jun 26'];

// Sheet notes keyed by stage — workspace-voiced, deterministic.
const STAGE_NOTES: Record<number, string> = {
  0: 'Application submitted through the careers portal. Referral ping sent — waiting on recruiter triage.',
  1: 'Recruiter screen done. They flagged the take-home rubric change; panel wants systems depth next round.',
  2: 'Onsite loop scheduled. Panel: two coding, one systems, one values. Ask about the platform re-org.',
  3: 'Offer in hand. Comp review call booked — push on equity refresh schedule before the deadline.',
  4: 'Loop closed. Notes archived; keep the contact warm for next cycle.',
};

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVERS — pure, deterministic.
// ---------------------------------------------------------------------------

function initialsOf(company: string): string {
  const words = company.split(' ');
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : company.slice(0, 2).toUpperCase();
}

/** Cents → '$156,000' (whole dollars, tabular). */
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US')}`;
}

/** Percent rounded: 14/22 = 63.6 → 64%; 8/14 = 57.1 → 57%; 3/8 = 37.5 → 38%. */
function pct(num: number, den: number): number {
  return den === 0 ? 0 : Math.round((num / den) * 100);
}

type Apps = Record<string, AppRec>;

function censusOf(apps: Apps): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const id of APP_ORDER) counts[apps[id].stage] += 1;
  return counts;
}

function goingColdOf(apps: Apps): AppRec[] {
  return APP_ORDER.map(id => apps[id])
    .filter(app => app.daysSinceTouch >= 7 && app.stage !== 4)
    .sort((a, b) => b.daysSinceTouch - a.daysSinceTouch);
}

function offersOf(apps: Apps): AppRec[] {
  return APP_ORDER.map(id => apps[id])
    .filter(app => app.stage === 3)
    .sort((a, b) => (b.salaryCents ?? 0) - (a.salaryCents ?? 0));
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer over {apps, tasks, tab, per-tab ui, toast,
// lastMove} with a single update(id, patch) action (routed by id prefix)
// plus one ui action. Every surface dispatches into it; all aggregates
// derive at render. Per-tab scrollTop lives in a ref (it never renders).
// ---------------------------------------------------------------------------

type TabId = 'pipeline' | 'tasks' | 'insights';

type LastMove =
  | {kind: 'app'; id: string; prevStage: StageIdx; prevMaxStage: number; prevOutcome?: 'rejected' | 'accepted'}
  | {kind: 'task'; id: string; prevDone: boolean};

interface TrellinState {
  apps: Apps;
  tasks: Record<string, TaskRec>;
  tab: TabId;
  filter: StageIdx | null; // pipeline-scoped; survives tab switches
  openSheetId: string | null; // detail sheet (row tap)
  sheetDetent: 'medium' | 'large';
  actionSheetId: string | null; // move menu (ellipsis)
  filterSheetOpen: boolean; // nav SlidersHorizontal
  toast: {seq: number; text: string; canUndo: boolean; status?: boolean} | null;
  lastMove: LastMove | null;
}

type TrellinAction =
  | {type: 'update'; id: string; patch: Partial<AppRec> | Partial<TaskRec>}
  | {type: 'ui'; patch: Partial<Omit<TrellinState, 'apps' | 'tasks'>>};

const INITIAL_STATE: TrellinState = {
  apps: Object.fromEntries(APPLICATIONS.map(app => [app.id, app])),
  tasks: Object.fromEntries(TASKS.map(task => [task.id, task])),
  tab: 'pipeline',
  filter: null,
  openSheetId: null,
  sheetDetent: 'medium',
  actionSheetId: null,
  filterSheetOpen: false,
  toast: null,
  lastMove: null,
};

function reducer(state: TrellinState, action: TrellinAction): TrellinState {
  switch (action.type) {
    case 'update': {
      if (state.apps[action.id] != null) {
        const next = {...state.apps[action.id], ...(action.patch as Partial<AppRec>)};
        return {...state, apps: {...state.apps, [action.id]: next}};
      }
      if (state.tasks[action.id] != null) {
        const next = {...state.tasks[action.id], ...(action.patch as Partial<TaskRec>)};
        return {...state, tasks: {...state.tasks, [action.id]: next}};
      }
      return state;
    }
    case 'ui':
      return {...state, ...action.patch};
    default:
      return state;
  }
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function scrollerOf(node: HTMLElement | null): HTMLElement {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = getComputedStyle(current).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 18px trellis-arrow (lattice with a rising arrow), stroke
// var(--color-text-primary) per spec.
// ---------------------------------------------------------------------------

function TrellinMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden style={{flexShrink: 0}}>
      <path d="M3 15V7M9 15V4M15 15v-5" stroke="var(--color-text-primary)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 11h12M3 7.5h12" stroke="var(--color-text-primary)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <path d="M9 4l-2.4 2.4M9 4l2.4 2.4" stroke="var(--color-text-primary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STALENESS RING — 44px ring (3px stroke) around the 36px monogram; stroke
// tint = color-mix(BRAND_ACCENT max(0,100−days×8)%, RING_GRAY): a01 0d →
// 100% indigo; a17 7d → 44%; a13 21d → 100−168 < 0 → 0% (fully gray, per
// the days≥13 floor). Ring gap at 12 o'clock hosts a 6px --color-error
// notch when days≥7. Decorative (aria-hidden) — the '12d' meta text
// carries the value.
// ---------------------------------------------------------------------------

const RING_R = 20.5; // 44px box, 3px stroke → r = 22 − 1.5
const RING_GAP_DEG = 22; // gap straddling 12 o'clock for the notch

function ringArcPath(): string {
  const start = ((RING_GAP_DEG / 2) * Math.PI) / 180;
  const end = ((360 - RING_GAP_DEG / 2) * Math.PI) / 180;
  const x1 = 22 + RING_R * Math.sin(start);
  const y1 = 22 - RING_R * Math.cos(start);
  const x2 = 22 + RING_R * Math.sin(end);
  const y2 = 22 - RING_R * Math.cos(end);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${RING_R} ${RING_R} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const RING_ARC = ringArcPath();

function StalenessRing({days, company}: {days: number; company: string}) {
  const tintPct = Math.max(0, 100 - days * 8);
  const stroke = `color-mix(in srgb, ${BRAND_ACCENT} ${tintPct}%, ${RING_GRAY})`;
  return (
    <span style={styles.ringWrap} aria-hidden>
      <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{position: 'absolute', inset: 0}}>
        <path d={RING_ARC} stroke={stroke} strokeWidth={3} strokeLinecap="round" className="trl-fade" />
        {days >= 7 ? <rect x={21} y={0.5} width={2} height={6} rx={1} fill="var(--color-error)" /> : null}
      </svg>
      <span style={styles.avatar}>{initialsOf(company)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// STAGE RAIL — five dots joined by 2px connectors; dots ≤ stage filled
// BRAND_ACCENT, future dots 2px FUTURE_DOT borders (≥3:1 vs card, math at
// the const); current dot wears the 4px halo + pulse (pulse removed under
// reduced motion — halo alone encodes current). Closed-rejected adds the
// downward --color-error fork tick branching at the exit-stage dot. The
// whole 20px rail is one pointer drag surface (ghost dot, detent snap,
// release commits); the keyboard path is the row's ellipsis action sheet.
// role='img' aria-label 'Stage 3 of 5, Onsite'.
// ---------------------------------------------------------------------------

interface StageRailProps {
  app: AppRec;
  size: 'row' | 'sheet';
  onCommit?: (stage: StageIdx) => void;
  onPlainTap?: () => void;
}

function StageRail({app, size, onCommit, onPlainTap}: StageRailProps) {
  const dot = size === 'row' ? 10 : 28;
  const railRef = useRef<HTMLDivElement | null>(null);
  const [ghostIdx, setGhostIdx] = useState<number | null>(null);
  const movedRef = useRef(false);
  const draggable = onCommit != null;

  const detentFor = (clientX: number): number => {
    const rect = railRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return app.stage;
    const usable = rect.width - dot;
    const x = Math.min(Math.max(clientX - rect.left - dot / 2, 0), usable);
    return Math.round((x / usable) * 4);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    movedRef.current = false;
    setGhostIdx(detentFor(event.clientX));
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (ghostIdx == null) return;
    const idx = detentFor(event.clientX);
    if (idx !== ghostIdx) movedRef.current = true;
    setGhostIdx(idx);
  };
  const onPointerUp = () => {
    if (ghostIdx == null) return;
    const idx = ghostIdx;
    setGhostIdx(null);
    if (movedRef.current && idx !== app.stage) {
      onCommit?.(idx as StageIdx);
    } else if (!movedRef.current) {
      onPlainTap?.();
    }
  };

  const label = `Stage ${app.stage + 1} of 5, ${STAGES[app.stage]}`;
  const forkAt = app.outcome === 'rejected' ? app.maxStage : null;

  return (
    <div
      ref={railRef}
      role="img"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: size === 'row' ? 20 : 44,
        position: 'relative',
        cursor: draggable ? 'grab' : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}>
      {STAGES.map((stage, index) => {
        const filled = index <= app.stage;
        const isCurrent = index === app.stage;
        return (
          <span key={stage} style={{display: 'contents'}}>
            {index > 0 ? (
              <span
                aria-hidden
                style={{
                  flex: 1,
                  height: 2,
                  background: index <= app.stage ? BRAND_ACCENT : FUTURE_DOT,
                }}
              />
            ) : null}
            <span
              aria-hidden
              className={isCurrent && app.stage !== 4 ? 'trl-pulse' : undefined}
              style={{
                position: 'relative',
                width: dot,
                height: dot,
                flexShrink: 0,
                borderRadius: '50%',
                background: filled ? BRAND_ACCENT : 'transparent',
                border: filled ? 'none' : `2px solid ${FUTURE_DOT}`,
                boxShadow: isCurrent ? `0 0 0 4px ${BRAND_HALO}` : undefined,
              }}>
              {forkAt === index ? (
                // Rejected fork: 6px 45° stroke branching downward off the
                // exit-stage dot.
                <svg
                  width={10}
                  height={10}
                  viewBox="0 0 10 10"
                  aria-hidden
                  style={{position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-1px)'}}>
                  <path d="M1 1l5.5 5.5" stroke="var(--color-error)" strokeWidth={2} strokeLinecap="round" />
                </svg>
              ) : null}
            </span>
          </span>
        );
      })}
      {ghostIdx != null ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            // Ghost center lands on dot i's center: i·(W−dot)/4 − 2.
            left: `calc(${(ghostIdx / 4) * 100}% - ${((ghostIdx / 4) * dot + 2).toFixed(1)}px)`,
            top: '50%',
            width: dot + 4,
            height: dot + 4,
            borderRadius: '50%',
            background: BRAND_ACCENT,
            opacity: 0.55,
            // 60ms detent snap tick — transform-only.
            transform: 'translateY(-50%) scale(1.2)',
            transition: 'left 60ms ease, transform 60ms ease',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FUNNEL STRIP — 5 flexGrow-proportional count cells (grow = live count,
// minWidth 40); role='radiogroup' with roving tabIndex + ArrowLeft/Right;
// tapping a cell toggles the stage filter (scrolls that sectionHeader into
// view; other groups dim to 40% — enhancement only, the active cell is the
// affordance); widths animate via the .trl-grow flex-grow transition
// (instant under reduced motion) and re-proportion live on stage moves.
// ---------------------------------------------------------------------------

interface FunnelStripProps {
  counts: number[];
  activeFilter: StageIdx | null;
  onToggle: (stage: StageIdx) => void;
}

const FUNNEL_LABELS = ['Applied', 'Screen', 'Onsite', 'Offer', 'Closed'];

function FunnelStrip({counts, activeFilter, onToggle}: FunnelStripProps) {
  const focusIdxRef = useRef<number>(activeFilter ?? 0);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = (focusIdxRef.current + delta + 5) % 5;
    focusIdxRef.current = next;
    const cells = groupRef.current?.querySelectorAll<HTMLButtonElement>('button');
    cells?.[next]?.focus();
    onToggle(next as StageIdx);
  };
  return (
    <div ref={groupRef} role="radiogroup" aria-label="Filter by stage" style={styles.funnelStrip} onKeyDown={onKeyDown}>
      {counts.map((count, index) => {
        const active = activeFilter === index;
        const tabbable = activeFilter != null ? active : index === 0;
        return (
          <button
            key={FUNNEL_LABELS[index]}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={tabbable ? 0 : -1}
            className="trl-btn trl-focusable trl-grow"
            style={{
              ...styles.funnelCell,
              flexGrow: Math.max(count, 0.0001),
              ...(active ? styles.funnelCellActive : null),
            }}
            aria-label={`${FUNNEL_LABELS[index]}, ${count} application${count === 1 ? '' : 's'}${active ? ', filtered' : ''}`}
            onClick={() => {
              focusIdxRef.current = index;
              onToggle(index as StageIdx);
            }}>
            <span style={styles.funnelCount}>{count}</span>
            <span style={styles.funnelLabel}>{FUNNEL_LABELS[index]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONVERSION BAR — 60px row: 13/500 label · trailing '14 of 22' tabular ·
// 6px muted track with a BRAND_ACCENT fill at num/den (rounded % in the
// fixture ledger comment).
// ---------------------------------------------------------------------------

function ConversionBar({label, num, den}: {label: string; num: number; den: number}) {
  const percent = pct(num, den);
  return (
    <div style={styles.convRow}>
      <div style={styles.convHead}>
        <span style={styles.convLabel}>{label}</span>
        <span style={styles.convVal}>
          {num} of {den} · {percent}%
        </span>
      </div>
      <div style={styles.convTrack} role="img" aria-label={`${label}: ${num} of ${den}, ${percent} percent`}>
        <div style={{...styles.convFill, width: `${percent}%`}} className="trl-fade" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL SHEET CHROME — grabber is a real 'Resize sheet' button (click
// toggles medium/large — the contract; drag is optional garnish, omitted),
// 52px header with 44×44 X, focus-trapped dialog. Never stacks with the
// action sheet (mutually exclusive by construction).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  footer: ReactNode;
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
      className="trl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}>
      <button
        type="button"
        className="trl-btn trl-focusable"
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
        <button type="button" className="trl-btn trl-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — the phone's verb picker: options card (optional context
// header + centered 56px rows, destructive LAST in --color-error) over a
// separate Cancel card. role='dialog', first focus on Cancel (safe
// default), trapped, restored to the opener on every close path.
// ---------------------------------------------------------------------------

interface ActionSheetOption {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface ActionSheetProps {
  header: string;
  options: ActionSheetOption[];
  onCancel: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
}

function ActionSheet({header, options, onCancel, sheetRef, cancelRef}: ActionSheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={header}
      tabIndex={-1}
      className="trl-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.actionCard}>
        <div style={styles.actionHeader}>{header}</div>
        {options.map((option, index) => (
          <span key={option.id} style={{display: 'contents'}}>
            {index > 0 ? <div style={styles.actionDivider} /> : null}
            <button
              type="button"
              className="trl-btn trl-focusable"
              style={{...styles.actionRow, ...(option.destructive ? styles.actionRowDestructive : null)}}
              onClick={option.onSelect}>
              {option.label}
            </button>
          </span>
        ))}
      </div>
      <div style={styles.actionCard}>
        <button ref={cancelRef} type="button" className="trl-btn trl-focusable" style={styles.actionCancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// APP ROW — 88px; the WHOLE row is one <button> (accessible name
// '{company}, {role}, stage {stage}') opening the detail sheet; the 20px
// StageRail zone and the 44×44 ellipsis are absolutely-positioned SIBLINGS
// layered above it (interactive elements never nest). Divider inset 72.
// ---------------------------------------------------------------------------

interface AppRowProps {
  app: AppRec;
  isLast: boolean;
  rowRef: (el: HTMLDivElement | null) => void;
  onOpen: (opener: HTMLElement) => void;
  onMenu: (opener: HTMLElement) => void;
  onCommitStage: (stage: StageIdx) => void;
}

function AppRow({app, isLast, rowRef, onOpen, onMenu, onCommitStage}: AppRowProps) {
  const cold = app.daysSinceTouch >= 7 && app.stage !== 4;
  const closedLabel = app.outcome === 'rejected' ? 'rejected' : app.outcome === 'accepted' ? 'accepted' : null;
  const meta =
    app.stage === 4 && closedLabel != null
      ? `${app.role} · ${closedLabel} at ${STAGES[app.maxStage]}`
      : `${app.role} · ${app.daysSinceTouch}d`;
  const btnRef = useRef<HTMLButtonElement | null>(null);
  return (
    <div ref={rowRef}>
      <div style={styles.appRowOuter}>
        <button
          ref={btnRef}
          type="button"
          className="trl-btn trl-focusable"
          style={styles.appRowBtn}
          aria-label={`${app.company}, ${app.role}, stage ${STAGES[app.stage]}`}
          onClick={event => onOpen(event.currentTarget)}>
          <StalenessRing days={app.daysSinceTouch} company={app.company} />
          <span style={styles.textStack}>
            <span style={styles.companyLine}>{app.company}</span>
            <span style={styles.metaLine}>
              {meta}
              {cold ? <span style={styles.metaCold}> · going cold</span> : null}
            </span>
          </span>
        </button>
        <div style={styles.railZone}>
          <StageRail
            app={app}
            size="row"
            onCommit={onCommitStage}
            onPlainTap={() => {
              const el = btnRef.current;
              if (el != null) onOpen(el);
            }}
          />
        </div>
        <button
          type="button"
          className="trl-btn trl-focusable"
          style={styles.ellipsisBtn}
          aria-label={`Move ${app.company} — currently ${STAGES[app.stage]}`}
          aria-haspopup="dialog"
          onClick={event => onMenu(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_DEFS: Array<{id: TabId; label: string; icon: typeof KanbanIcon}> = [
  {id: 'pipeline', label: 'Pipeline', icon: KanbanIcon},
  {id: 'tasks', label: 'Tasks', icon: CheckSquareIcon},
  {id: 'insights', label: 'Insights', icon: ChartNoAxesColumnIcon},
];

export default function MobileApplicationPipelineTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const toastSeqRef = useRef(0);

  // DERIVED — every aggregate recomputes from the records, never stored.
  const census = censusOf(state.apps);
  const totalCount = APP_ORDER.length; // 22
  const activeCount = totalCount - census[4]; // 20 at rest
  const offers = offersOf(state.apps);
  const goingCold = goingColdOf(state.apps);
  const reachedScreen = APP_ORDER.filter(id => state.apps[id].maxStage >= 1).length; // 14
  const reachedOnsite = APP_ORDER.filter(id => state.apps[id].maxStage >= 2).length; // 8
  const reachedOffer = APP_ORDER.filter(id => state.apps[id].maxStage >= 3).length; // 3
  const tasksDueToday = TASK_ORDER.filter(id => state.tasks[id].due === 'today' && !state.tasks[id].done);
  const tasksThisWeek = TASK_ORDER.filter(id => state.tasks[id].due === 'week' && !state.tasks[id].done);
  const tasksDone = TASK_ORDER.filter(id => state.tasks[id].done);
  const tasksBadge = tasksDueToday.length; // 3 at rest
  const insightsBadge = census[3]; // open offers, derived (2 at rest)
  const sheetApp = state.openSheetId != null ? state.apps[state.openSheetId] : null;
  const actionApp = state.actionSheetId != null ? state.apps[state.actionSheetId] : null;
  const overlayOpen = state.openSheetId != null || state.actionSheetId != null || state.filterSheetOpen;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);

  // Per-tab scroll persistence (foundations ergonomics law) — the demo's
  // outer scroller owns the page, so record/restore its scrollTop.
  const scrollByTabRef = useRef<Record<TabId, number>>({pipeline: 0, tasks: 0, insights: 0});
  const sectionRefs = useRef<Record<number, HTMLHeadingElement | null>>({});

  // FLIP — snapshot row tops every pipeline render; after a stage move,
  // displaced rows slide translateY(delta→0) 240ms (fade under reduced
  // motion). Transform/opacity only.
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const lastRectsRef = useRef(new Map<string, number>());
  const flipPendingRef = useRef(false);

  useLayoutEffect(() => {
    if (state.tab !== 'pipeline') {
      lastRectsRef.current.clear();
      flipPendingRef.current = false;
      return;
    }
    if (flipPendingRef.current) {
      for (const [id, el] of rowRefs.current) {
        const prevTop = lastRectsRef.current.get(id);
        if (prevTop == null) continue;
        const dy = prevTop - el.getBoundingClientRect().top;
        if (Math.abs(dy) < 2) continue;
        if (reducedMotion) {
          el.animate([{opacity: 0.2}, {opacity: 1}], {duration: 180, easing: 'ease'});
        } else {
          el.animate([{transform: `translateY(${dy}px)`}, {transform: 'none'}], {duration: 240, easing: 'ease'});
        }
      }
      flipPendingRef.current = false;
    }
    const snap = new Map<string, number>();
    for (const [id, el] of rowRefs.current) snap.set(id, el.getBoundingClientRect().top);
    lastRectsRef.current = snap;
  });

  const toastPatch = (text: string, canUndo: boolean, status = false) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, canUndo, status}};
  };

  // MUTATIONS — all through the single owner; consequences derive.
  const moveStage = useCallback(
    (id: string, stage: StageIdx) => {
      const app = state.apps[id];
      if (app == null || app.stage === stage) return;
      flipPendingRef.current = true;
      const patch: Partial<AppRec> = {
        stage,
        maxStage: stage < 4 ? Math.max(app.maxStage, stage) : app.maxStage,
        outcome: stage === 4 ? 'rejected' : undefined,
      };
      dispatch({type: 'update', id, patch});
      dispatch({
        type: 'ui',
        patch: {
          actionSheetId: null,
          lastMove: {kind: 'app', id, prevStage: app.stage, prevMaxStage: app.maxStage, prevOutcome: app.outcome},
          ...toastPatch(`Moved to ${STAGES[stage]} · ${app.company}`, true),
        },
      });
    },
    [state.apps],
  );

  const toggleTask = (id: string) => {
    const task = state.tasks[id];
    dispatch({type: 'update', id, patch: {done: !task.done}});
    dispatch({
      type: 'ui',
      patch: {
        lastMove: {kind: 'task', id, prevDone: task.done},
        ...toastPatch(task.done ? 'Task reopened' : 'Task completed', true),
      },
    });
  };

  // UNDO — restores the exact prior state; fixture order is the sort key,
  // so the row's group position restores automatically (stress fixture 4).
  const undoLast = () => {
    const move = state.lastMove;
    if (move == null) return;
    if (move.kind === 'app') {
      flipPendingRef.current = true;
      dispatch({
        type: 'update',
        id: move.id,
        patch: {stage: move.prevStage, outcome: move.prevOutcome, maxStage: move.prevMaxStage},
      });
    } else {
      dispatch({type: 'update', id: move.id, patch: {done: move.prevDone}});
    }
    dispatch({type: 'ui', patch: {lastMove: null, ...toastPatch('Restored', false)}});
  };

  const logTouch = (id: string) => {
    dispatch({type: 'update', id, patch: {daysSinceTouch: 0}});
    dispatch({type: 'ui', patch: {...toastPatch('Touch logged', false)}});
  };

  // NAV + TABS ---------------------------------------------------------------

  const getScroller = () => scrollerOf(shellRef.current);

  const switchTab = (next: TabId) => {
    if (next === state.tab) {
      // The one legal reset: re-tap active tab → top + clear filter.
      getScroller().scrollTop = 0;
      if (state.tab === 'pipeline' && state.filter != null) {
        dispatch({type: 'ui', patch: {filter: null}});
      }
      return;
    }
    scrollByTabRef.current[state.tab] = getScroller().scrollTop;
    // Overlays belong to their moment — they close; toast + filter persist.
    dispatch({type: 'ui', patch: {tab: next, openSheetId: null, actionSheetId: null, filterSheetOpen: false}});
  };

  useLayoutEffect(() => {
    getScroller().scrollTop = scrollByTabRef.current[state.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const toggleFilter = (stage: StageIdx) => {
    const next = state.filter === stage ? null : stage;
    dispatch({type: 'ui', patch: {filter: next}});
    if (next != null) {
      requestAnimationFrame(() => {
        sectionRefs.current[next]?.scrollIntoView({block: 'start', behavior: reducedMotion ? 'auto' : 'smooth'});
      });
    }
  };

  // OVERLAY LIFECYCLE ----------------------------------------------------------

  const openDetail = (id: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'ui', patch: {openSheetId: id, sheetDetent: 'medium', actionSheetId: null, filterSheetOpen: false}});
  };
  const closeDetail = () => {
    dispatch({type: 'ui', patch: {openSheetId: null, sheetDetent: 'medium'}});
    sheetOpenerRef.current?.focus();
  };
  const openActionSheet = (id: string, opener: HTMLElement) => {
    actionOpenerRef.current = opener;
    dispatch({type: 'ui', patch: {actionSheetId: id, openSheetId: null, filterSheetOpen: false}});
  };
  const closeActionSheet = () => {
    dispatch({type: 'ui', patch: {actionSheetId: null}});
    actionOpenerRef.current?.focus();
  };
  const openFilterSheet = (opener: HTMLElement) => {
    actionOpenerRef.current = opener;
    dispatch({type: 'ui', patch: {filterSheetOpen: true, actionSheetId: null, openSheetId: null}});
  };
  const closeFilterSheet = () => {
    dispatch({type: 'ui', patch: {filterSheetOpen: false}});
    actionOpenerRef.current?.focus();
  };

  // Focus into an opening sheet uses preventScroll (foundations amendment:
  // plain .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (state.openSheetId != null) sheetRef.current?.focus({preventScroll: true});
  }, [state.openSheetId]);
  useEffect(() => {
    if (state.actionSheetId != null || state.filterSheetOpen) cancelRef.current?.focus({preventScroll: true});
  }, [state.actionSheetId, state.filterSheetOpen]);

  // Escape closes the TOPMOST overlay only (action sheets and the detail
  // sheet are mutually exclusive, so the ladder is flat).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.filterSheetOpen) closeFilterSheet();
      else if (state.actionSheetId != null) closeActionSheet();
      else if (state.openSheetId != null) closeDetail();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filterSheetOpen, state.actionSheetId, state.openSheetId]);

  // MOVE-MENU OPTIONS — current stage's row omitted; destructive last.
  const moveOptionsFor = (app: AppRec): ActionSheetOption[] => {
    const options: ActionSheetOption[] = [];
    ([1, 2, 3] as StageIdx[]).forEach(stage => {
      if (app.stage !== stage) {
        options.push({id: `mv-${stage}`, label: `Move to ${STAGES[stage]}`, onSelect: () => moveStage(app.id, stage)});
      }
    });
    if (app.stage !== 4) {
      options.push({id: 'mv-4', label: 'Move to Closed', destructive: true, onSelect: () => moveStage(app.id, 4)});
    }
    return options;
  };

  // FILTER SHEET — ≤5 option rows by construction: 5 stages when no filter
  // is active; 'Show all stages' + the 4 other stages when one is.
  const filterOptions: ActionSheetOption[] = state.filter == null
    ? ([0, 1, 2, 3, 4] as StageIdx[]).map(stage => ({
        id: `fl-${stage}`,
        label: `${FUNNEL_LABELS[stage]} · ${census[stage]}`,
        onSelect: () => {
          dispatch({type: 'ui', patch: {filterSheetOpen: false}});
          toggleFilter(stage);
          actionOpenerRef.current?.focus();
        },
      }))
    : [
        {
          id: 'fl-all',
          label: 'Show all stages',
          onSelect: () => {
            dispatch({type: 'ui', patch: {filterSheetOpen: false, filter: null}});
            actionOpenerRef.current?.focus();
          },
        },
        ...([0, 1, 2, 3, 4] as StageIdx[])
          .filter(stage => stage !== state.filter)
          .slice(0, 4)
          .map(stage => ({
            id: `fl-${stage}`,
            label: `${FUNNEL_LABELS[stage]} · ${census[stage]}`,
            onSelect: () => {
              dispatch({type: 'ui', patch: {filterSheetOpen: false}});
              toggleFilter(stage);
              actionOpenerRef.current?.focus();
            },
          })),
      ];

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // Detail-sheet timeline — one 44px row per reached funnel stage (fixed
  // literal dates; Closed appends its own row).
  const timelineFor = (app: AppRec): Array<{stage: string; date: string}> => {
    const rows: Array<{stage: string; date: string}> = [];
    for (let index = 0; index <= app.maxStage; index++) {
      rows.push({stage: STAGES[index], date: TIMELINE_DATES[index]});
    }
    if (app.stage === 4) rows.push({stage: `Closed · ${app.outcome ?? 'closed'}`, date: TIMELINE_DATES[4]});
    return rows;
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TRELLIN_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="trl-btn trl-focusable"
              style={styles.iconBtn}
              aria-label="Filter pipeline by stage"
              aria-haspopup="dialog"
              onClick={event => openFilterSheet(event.currentTarget)}>
              <Icon icon={SlidersHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
          <div style={styles.navCenter}>
            <span style={styles.navTitleRow}>
              <TrellinMark />
              Trellin
            </span>
            <span style={styles.navSubtitle}>
              {activeCount} active · {totalCount} total
            </span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="trl-btn trl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh pipeline"
              onClick={() => dispatch({type: 'ui', patch: {...toastPatch('Updated just now', false, true)}})}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'pipeline' ? (
            <>
              <h1 className="trl-vh">Application pipeline</h1>
              <FunnelStrip counts={census} activeFilter={state.filter} onToggle={toggleFilter} />
              {([0, 1, 2, 3, 4] as StageIdx[]).map(stage => {
                const ids = APP_ORDER.filter(id => state.apps[id].stage === stage);
                const dimmed = state.filter != null && state.filter !== stage;
                return (
                  <section key={STAGES[stage]}>
                    <h2
                      ref={el => {
                        sectionRefs.current[stage] = el;
                      }}
                      style={{...styles.sectionHeader, scrollMarginTop: 116}}>
                      {FUNNEL_LABELS[stage]} · {ids.length}
                    </h2>
                    <div className="trl-fade" style={{...styles.listCard, ...(dimmed ? styles.listCardDim : null)}}>
                      {ids.length === 0 ? (
                        // A stage at zero never vanishes (stress fixture 3).
                        <div style={styles.emptyStageRow}>No applications at {STAGES[stage]}</div>
                      ) : (
                        ids.map((id, index) => (
                          <AppRow
                            key={id}
                            app={state.apps[id]}
                            isLast={index === ids.length - 1}
                            rowRef={el => {
                              if (el == null) rowRefs.current.delete(id);
                              else rowRefs.current.set(id, el);
                            }}
                            onOpen={opener => openDetail(id, opener)}
                            onMenu={opener => openActionSheet(id, opener)}
                            onCommitStage={next => moveStage(id, next)}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
              <p style={styles.terminalCaption}>All {totalCount} applications</p>
            </>
          ) : null}

          {state.tab === 'tasks' ? (
            <>
              <h1 style={styles.largeTitle}>Tasks</h1>
              {(
                [
                  {label: 'Due today', ids: tasksDueToday},
                  {label: 'This week', ids: tasksThisWeek},
                  {label: 'Done', ids: tasksDone},
                ] as const
              ).map(section => (
                <section key={section.label}>
                  <h2 style={styles.sectionHeader}>
                    {section.label} · {section.ids.length}
                  </h2>
                  <div style={styles.listCard}>
                    {section.ids.length === 0 ? (
                      <div style={styles.emptyStageRow}>Nothing {section.label.toLowerCase()}</div>
                    ) : (
                      section.ids.map((id, index) => {
                        const task = state.tasks[id];
                        const company = state.apps[task.appId]?.company ?? '';
                        return (
                          <span key={id} style={{display: 'contents'}}>
                            {index > 0 ? <div style={styles.rowDividerShallow} /> : null}
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={task.done}
                              className="trl-btn trl-focusable"
                              style={styles.taskRow}
                              onClick={() => toggleTask(id)}>
                              <span
                                style={{...styles.selectionCircle, ...(task.done ? styles.selectionCircleOn : null)}}
                                aria-hidden>
                                {task.done ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                              </span>
                              <span style={styles.taskText}>
                                <span style={{...styles.taskTitle, ...(task.done ? styles.taskTitleDone : null)}}>
                                  {task.title}
                                </span>
                                <span style={styles.taskMeta}>
                                  {company} · {task.dueLabel}
                                </span>
                              </span>
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </section>
              ))}
              <div style={{height: 24}} />
            </>
          ) : null}

          {state.tab === 'insights' ? (
            <>
              <h1 style={styles.largeTitle}>Insights</h1>
              <h2 style={styles.sectionHeader}>Open offers · {offers.length}</h2>
              <div style={styles.listCard}>
                {offers.length === 0 ? (
                  // True-empty (offers can hit zero via moves): no button —
                  // creation isn't a verb here (stress fixture 3).
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIconCircle}>
                      <Icon icon={HandshakeIcon} size="lg" color="inherit" />
                    </span>
                    <span style={styles.emptyTitle}>No open offers</span>
                    <span style={styles.emptyBody}>Offers you receive compare here.</span>
                  </div>
                ) : (
                  <>
                    {offers.map((offer, index) => (
                      <span key={offer.id} style={{display: 'contents'}}>
                        {index > 0 ? <div style={styles.rowDividerShallow} /> : null}
                        <div style={styles.offerRow}>
                          <span style={styles.offerText}>
                            <span style={styles.offerCompany}>{offer.company}</span>
                            <span style={styles.offerMeta}>{offer.role}</span>
                          </span>
                          <span style={styles.offerSalary}>{offer.salaryLabel ?? 'Comp TBD'}</span>
                        </div>
                      </span>
                    ))}
                    <div style={styles.rowDividerShallow} />
                    <div style={styles.offerFooter}>
                      {offers.length >= 2 && offers[0].salaryCents != null && offers[1].salaryCents != null
                        ? // 15,600,000 − 14,800,000 = 800,000¢ = $8,000 ✓
                          `Δ ${fmtUsd(offers[0].salaryCents - offers[1].salaryCents)} · ${offers[0].company} leads`
                        : 'One open offer'}
                    </div>
                  </>
                )}
              </div>
              <h2 style={styles.sectionHeader}>Conversion</h2>
              <div style={styles.listCard}>
                <ConversionBar label="Applied → Screen" num={reachedScreen} den={totalCount} />
                <div style={styles.rowDividerShallow} />
                <ConversionBar label="Screen → Onsite" num={reachedOnsite} den={reachedScreen} />
                <div style={styles.rowDividerShallow} />
                <ConversionBar label="Onsite → Offer" num={reachedOffer} den={reachedOnsite} />
              </div>
              <h2 style={styles.sectionHeader}>{goingCold.length} going cold</h2>
              <div style={styles.listCard}>
                {goingCold.length === 0 ? (
                  <div style={styles.emptyStageRow}>Everything has been touched this week</div>
                ) : (
                  goingCold.map((app, index) => (
                    <span key={app.id} style={{display: 'contents'}}>
                      {index > 0 ? <div style={styles.rowDividerShallow} /> : null}
                      <div style={styles.coldRow}>
                        <span style={styles.coldCompany}>{app.company}</span>
                        <span style={styles.coldDays}>{app.daysSinceTouch}d</span>
                      </div>
                    </span>
                  ))
                )}
              </div>
              <div style={{height: 24}} />
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the single polite live region; persistent, no
            timers; Undo restores the exact prior state. */}
        <div
          style={{...styles.toastAnchor, ...(overlayOpen ? styles.toastAnchorLocked : null)}}
          aria-live="polite"
          role={state.toast?.status ? 'status' : undefined}>
          {state.toast != null ? (
            <div key={state.toast.seq} style={{...styles.toast, ...(overlayOpen ? styles.toastStatic : null)}} className="trl-fade">
              <span style={styles.toastMsg}>{state.toast.text}</span>
              {state.toast.canUndo && state.lastMove != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="trl-btn trl-focusable" style={styles.toastUndo} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Trellin sections">
          {TAB_DEFS.map(tab => {
            const active = state.tab === tab.id;
            const badge = tab.id === 'tasks' ? tasksBadge : tab.id === 'insights' ? insightsBadge : 0;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="trl-btn trl-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, fontWeight: active ? 600 : 500}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {overlayOpen ? (
          <div
            style={styles.sheetScrim}
            onClick={() => {
              if (state.filterSheetOpen) closeFilterSheet();
              else if (state.actionSheetId != null) closeActionSheet();
              else closeDetail();
            }}
            aria-hidden
          />
        ) : null}

        {sheetApp != null ? (
          <Sheet
            titleId="trl-detail-title"
            title={sheetApp.company}
            detent={state.sheetDetent}
            onDetentChange={detent => dispatch({type: 'ui', patch: {sheetDetent: detent}})}
            onClose={closeDetail}
            sheetRef={sheetRef}
            footer={
              <button type="button" className="trl-btn trl-focusable" style={styles.primaryBtn} onClick={() => logTouch(sheetApp.id)}>
                Log touch
              </button>
            }>
            <div style={{fontSize: 13, color: 'var(--color-text-secondary)'}}>
              {sheetApp.role} · applied {sheetApp.appliedDate} · last touch {sheetApp.daysSinceTouch}d ago
            </div>
            <div style={styles.bigRailWrap}>
              <StageRail app={sheetApp} size="sheet" onCommit={stage => moveStage(sheetApp.id, stage)} />
            </div>
            {/* Inline 36px stage buttons — the sheet's non-gesture move
                path (sheets never stack an action sheet). */}
            <div style={styles.stageBtnRow}>
              {moveOptionsFor(sheetApp).map(option => (
                <button
                  key={option.id}
                  type="button"
                  className="trl-btn trl-focusable"
                  style={{...styles.stageBtn, ...(option.destructive ? styles.stageBtnDestructive : null)}}
                  onClick={option.onSelect}>
                  {option.label}
                </button>
              ))}
            </div>
            <div style={styles.sheetSection}>Timeline</div>
            {timelineFor(sheetApp).map(row => (
              <div key={row.stage} style={styles.timelineRow}>
                <span style={styles.timelineDot} aria-hidden />
                <span style={styles.timelineStage}>{row.stage}</span>
                <span style={styles.timelineDate}>{row.date}</span>
              </div>
            ))}
            <div style={styles.sheetSection}>Contact</div>
            <div style={styles.contactRow}>
              <span style={styles.contactIcon}>
                <Icon icon={MailIcon} size="sm" color="inherit" />
              </span>
              {sheetApp.contact}
            </div>
            <div style={styles.notesBlock}>{STAGE_NOTES[sheetApp.stage]}</div>
          </Sheet>
        ) : null}

        {actionApp != null ? (
          <ActionSheet
            header={`${actionApp.company} · currently ${STAGES[actionApp.stage]}`}
            options={moveOptionsFor(actionApp)}
            onCancel={closeActionSheet}
            sheetRef={actionRef}
            cancelRef={cancelRef}
          />
        ) : null}

        {state.filterSheetOpen ? (
          <ActionSheet
            header={state.filter == null ? 'Filter by stage' : `Filtered to ${FUNNEL_LABELS[state.filter]}`}
            options={filterOptions}
            onCancel={closeFilterSheet}
            sheetRef={actionRef}
            cancelRef={cancelRef}
          />
        ) : null}
      </div>
    </div>
  );
}
