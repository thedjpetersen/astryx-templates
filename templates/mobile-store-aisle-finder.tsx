// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Fieldstone Market 'Weeknight
 *   Run' list: exactly 12 items across 5 aisles (Aisle 2 Produce 3 · 4
 *   Bakery 2 · 7 Pantry 3 · 9 Dairy 2 · 11 Frozen 2 → 3+2+3+2+2 = 12),
 *   status ledger 3 done + 1 skipped + 8 todo = 12, units 27 = 11 done
 *   (4+1+6) + 1 skipped + 15 todo; ETA law ETA_SECONDS = todo×20 +
 *   remainingAisles×40 → 8×20 + 4×40 = 320 → ceil(320/60) = 6 → 'est. 6
 *   min left'. Three stores, four deals + three chips, four account rows.
 *   No Date.now(), no Math.random(), no network media — the map is pure
 *   SVG, no real cartography.
 * @output Fieldstone Market — Aisle Finder: a 390px MOBILE in-store
 *   shopping companion. NavBar (28px F-monogram storefront mark ·
 *   routeChip with a 12-segment ProgressRingChip + 'Next: Aisle 4' ·
 *   44×44 RefreshCw) over a STICKY stylized AisleStripMap (five rounded
 *   strips for aisles 2/4/7/9/11, one brand pin per todo item, a dotted
 *   marching-ants pick-path polyline that serpentines entrance→aisles),
 *   a 32px routeFooter ('4 stops · 8 items · est. 6 min left'), then the
 *   PickPathRail: walk-order aisle listCards of 60px check rows, a dashed
 *   SKIPPED end-of-trip group, and collapsed 44px PICKED rows. Signature
 *   move: checking a row collapses its map pin, re-routes the polyline
 *   (parity flip = the path visibly enters the next aisle 'the other
 *   way'), advances the routeChip, fills one ring segment, decrements the
 *   List tab badge, and re-derives the ETA footer — all from ONE items
 *   array in one render, announced by the single Undo toast.
 * @position Page template; emitted by `astryx template mobile-store-aisle-finder`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet, action
 *   sheet) are position:'absolute' INSIDE shell; position:fixed is
 *   banned. While the item sheet or action sheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close; the
 *   toastDock is sticky-in-flow (bottom 76, above the 64px tabBar + 12)
 *   and switches to shell-absolute ONLY during that scroll lock, per the
 *   foundations amendment.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 72 past the 44px check zone); the
 *   sticky mapDock is the only full-width block above the list; no
 *   desktop Layout frames, no side asides, no inner vertical scroller
 *   outside the open sheet.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Fieldstone green): #15803D on the light card #FFFFFF ≈
 *   5.0:1; #4ADE80 on the dark body ≈ 9.3:1 — both clear 4.5:1 for
 *   brand-tinted text. Text/glyphs over a brand fill use BRAND_FILL_TEXT
 *   (#FFFFFF on #15803D ≈ 5.0:1; #052E16 on #4ADE80 ≈ 8.5:1). Per the
 *   ≥3:1 interactive-boundary amendment, the unchecked check-circle
 *   border and the map strip strokes are explicit light-dark() pairs
 *   (math at each declaration), NOT the passive hairline token.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', blur surface + always-on
 *   hairline — this template does not wire scroll-under; noted); mapDock
 *   sticky top 52 z15 (SVG viewBox '0 0 358 268' at marginInline 16 +
 *   32px routeFooter); rows 60px two-line (44×44 check hit, 16px/500
 *   primary + 13px/400 meta, trailing 44×44 ellipsis with ≥8px
 *   clearance) / 44px collapsed done rows; sectionHeader 13px/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; tabBar exactly 64px (4 tabs, 24px icon over 11px/500 label,
 *   16px badge pill); toastDock sticky bottom 76 z30; sheet detents 55%
 *   medium / calc(100% − 56px) large, 24px grabber zone with 36×5 pill,
 *   52px sheet header, 48px sticky-footer button. TYPE (Figtree via
 *   --font-family-body): 17/600 nav+sheet titles · 16/400–500 row
 *   primary · 13/400 meta · 11/500 tab labels + map aisle numbers;
 *   nothing under 11px; tabular-nums on every counter. Touch: every
 *   target ≥44×44 or merged full-row; every gesture has a button path —
 *   there is NO swipe on rows, the visible 44×44 ellipsis IS the row's
 *   action path.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is
 *   backstop only). NO width:390 literals — shell and mapDock are width
 *   '100%'; the map scales via viewBox + aspectRatio '358/268' (288px
 *   wide at a 320 stage; its 11px aisle numerals scale slightly smaller
 *   visually but stay aria-hidden duplicates of the sectionHeaders).
 *   routeChip max-width 200px ellipsizes; row text ellipsizes one line;
 *   the trailing ellipsis button never wraps (flex none).
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the sticky map anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject} from 'react';

import {
  CheckCircle2Icon,
  CheckIcon,
  ChevronRightIcon,
  ListChecksIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  TagIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Fieldstone green). #15803D on the light
// card #FFFFFF ≈ 5.0:1 (passes 4.5:1); #4ADE80 on the dark body ≈ 9.3:1.
const BRAND_ACCENT = 'light-dark(#15803D, #4ADE80)';
// Glyphs/text over a BRAND_ACCENT fill. Light: #FFFFFF on #15803D ≈ 5.0:1.
// Dark: white on #4ADE80 fails (~1.7:1), so the dark side flips to a
// near-black green — #052E16 on #4ADE80 ≈ 8.5:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #052E16)';
// 12% brand wash for the active tab press/selected tints.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Map strip fill — a meaningful rest fill (the aisle shelves), NOT a
// passive separator, so it carries its own explicit stroke pair below.
const STRIP_FILL = 'light-dark(#F1F5F1, #1F2A22)';
// Strip stroke — ≥3:1 vs the ACTUAL surface (the body background the map
// sits on): #64766B on #FFFFFF ≈ 4.8:1; #7E9683 on the dark body ≈ 5.3:1.
const STRIP_STROKE = 'light-dark(#64766B, #7E9683)';
// Unchecked check-circle boundary — an INTERACTIVE control boundary per
// the amendment, so not var(--color-border): #6F7B72 on the white card ≈
// 4.4:1; #8B9990 on the dark card ≈ 5.0:1 — both ≥3:1.
const CHECK_BORDER = 'light-dark(#6F7B72, #8B9990)';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Blur chrome surface shared by navBar / tabBar.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// pin tick / path fade / sheet slide keyframes, marching ants, skeleton
// shimmer. Every animation is transform/opacity (plus the SVG
// stroke-dashoffset ants) and is REMOVED under prefers-reduced-motion —
// static dots still encode the route, static muted blocks still encode
// loading.
// ---------------------------------------------------------------------------

const FSM_CSS = `
.fsm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fsm-btn:disabled { cursor: default; }
.fsm-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.fsm-fade { transition: opacity 200ms ease; }
@keyframes fsm-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fsm-sheet-in { animation: fsm-sheet-in 200ms ease; }
@keyframes fsm-tick {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0); opacity: 0; }
}
.fsm-tick { animation: fsm-tick 200ms ease forwards; }
@keyframes fsm-path-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fsm-path-in { animation: fsm-path-in 200ms ease; }
@keyframes fsm-ants {
  to { stroke-dashoffset: -16; }
}
.fsm-ants { animation: fsm-ants 1.2s linear infinite; }
@keyframes fsm-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.fsm-shimmer { animation: fsm-shimmer 1.6s linear infinite; }
.fsm-vh {
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
  .fsm-fade { transition: none; }
  .fsm-sheet-in, .fsm-tick, .fsm-path-in { animation: none; }
  .fsm-ants { animation: none; }
  .fsm-shimmer { animation: none; display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar,
// tabItem, sheetScrim, sheet, listCard, row, rowDivider, sectionHeader.
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
  // Scroll lock while sheet/action sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; always-on hairline.
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // routeChip — 36px pill; role='status' but NOT live (toastDock is the
  // single announcer); max-width 200 ellipsizes at 320.
  routeChip: {
    height: 36,
    maxWidth: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
  },
  routeChipLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
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
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // MAP DOCK — sticky under the navBar (top 52) z15; the list scrolls
  // under it via the demo's outer page scroller (NO inner scroller).
  mapDock: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    background: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  mapSvg: {
    width: 'calc(100% - 32px)',
    marginInline: 16,
    aspectRatio: '358 / 268',
    display: 'block',
  },
  routeFooter: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  updatedCaption: {
    paddingInline: 16,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  footerSkeletonBar: {
    width: 96,
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
  },
  // LIST — inset-grouped cards, sectionHeaders at 32px.
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
  listCardDashed: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: `1px dashed ${CHECK_BORDER}`,
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // ROW — 60px two-line; three sibling targets: 44×44 check hit, flex-1
  // middle button (opens the shelf sheet), 44×44 ellipsis. ≥8px clearance
  // between hits comes from the middle button's own width.
  row: {
    display: 'flex',
    alignItems: 'center',
    height: 60,
    paddingInline: 8,
  },
  checkHit: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    border: `2px solid ${CHECK_BORDER}`,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    color: 'transparent',
  },
  checkCircleDone: {
    border: `2px solid ${BRAND_ACCENT}`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  checkCircleSkipped: {
    border: `2px dashed ${CHECK_BORDER}`,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 8,
    borderRadius: 12,
  },
  rowName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowNameDone: {textDecoration: 'line-through', opacity: 0.6},
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // rowDivider — inset 72 (44px check zone + 16 pad + 12 gap), none last.
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 72},
  // Collapsed PICKED row — 44px.
  doneRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  doneRowIcon: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  addBackBtn: {
    height: 36,
    paddingInline: 12,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  // SKELETON — same 60px geometry as live rows (zero layout shift).
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 60,
    paddingInline: 16,
  },
  skeletonCircle: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
  },
  skeletonLines: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skeletonShimmerHost: {position: 'relative', overflow: 'hidden'},
  skeletonShimmer: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 55%, transparent), transparent)',
    pointerEvents: 'none',
  },
  // EMPTY STATE (trip complete).
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
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // TAB BAR — exactly 64px, 4 tabs flex:1.
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
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0 anchor) 76px above the viewport
  // bottom, per the amendment; absolute variant only under scroll lock.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40, sheet z41, absolute inside shell.
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
  markPickedBtn: {
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
  shelfCaption: {
    marginTop: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  },
  bayStrip: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
  },
  baySquare: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `1px solid ${STRIP_STROKE}`,
    background: STRIP_FILL,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  baySquareActive: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // ACTION SHEET — two cards, insetInline 16 bottom 16.
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
    color: 'var(--color-text-primary)',
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionRowRule: {height: 1, background: 'var(--color-border)'},
  cancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // STORES / DEALS / ACCOUNT tabs.
  storeRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  storeText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  chipRow: {display: 'flex', gap: 8, paddingInline: 16, marginTop: 20, flexWrap: 'wrap'},
  chip: {
    height: 32,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  chipOn: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  dealRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 72,
    paddingInline: 16,
  },
  dealThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 700,
  },
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // 51×31 switch on a full-row role='switch' button.
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
    // OFF track pair per the inputControls contract.
    background: 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))',
  },
  switchTrackOn: {background: BRAND_ACCENT},
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: 999,
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    transition: 'transform 200ms ease',
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, exactly 12 dual-field items, every aggregate
// cross-checked. ARITHMETIC (assert): 3+2+3+2+2 = 12 items; 3 done + 1
// skipped + 8 todo = 12; units 27 = 11 done (4+1+6) + 1 skipped + 15 todo
// (1+6+2+1+2+1+1+1); ring = 3 solid + 1 dashed + 8 empty of 12; tab badge
// = 8; remaining aisles = 4 (4/7/9/11); ETA_SECONDS = todo×20 + aisles×40
// = 8×20 + 4×40 = 160+160 = 320 → ceil(320/60) = 6 → 'est. 6 min left';
// footer '4 stops · 8 items · est. 6 min left'. After checking b1: 7 todo,
// 4 aisles → ceil(300/60) = 5 min; after b2 too: 6 todo, 3 aisles →
// ceil(240/60) = 4 min, chip 'Next: Aisle 7', badge 6, ring 5 solid.
// ---------------------------------------------------------------------------

const STORE = 'Fieldstone Market · Cedar Falls';
const LIST_NAME = 'Weeknight Run';
const UPDATED = 'Updated just now';

type ItemStatus = 'todo' | 'done' | 'skipped' | 'removed';

interface Aisle {
  num: number;
  dept: string;
  x: number; // strip x in the 358-wide viewBox
  cx: number; // strip center = x + 23
}

// Strip geometry cross-check: 5×46 strips (230) + 4×32 gaps (128) = 358 ✓.
const AISLES: Aisle[] = [
  {num: 2, dept: 'Produce', x: 0, cx: 23},
  {num: 4, dept: 'Bakery', x: 78, cx: 101},
  {num: 7, dept: 'Pantry', x: 156, cx: 179},
  {num: 9, dept: 'Dairy', x: 234, cx: 257},
  {num: 11, dept: 'Frozen', x: 312, cx: 335},
];
const AISLE_BY_NUM = Object.fromEntries(AISLES.map(aisle => [aisle.num, aisle]));

interface GroceryItem {
  id: string;
  name: string;
  qty: number;
  aisle: number;
  bay: number;
  shelf: number; // 1 = bottom of the 4-shelf bay
  slot: number; // fixed 0-based walk-order position within the aisle
  status: ItemStatus;
  metaLabel: string; // pre-derived 'Bay 3 · Shelf 2 · Qty 2' (dual field)
}

// b2's rendered name is the LONG-NAME truncation stress (fixture 1).
const ITEMS_FIXTURE: GroceryItem[] = [
  {id: 'a1', name: 'Honeycrisp Apples', qty: 4, aisle: 2, bay: 1, shelf: 3, slot: 0, status: 'done', metaLabel: 'Bay 1 · Shelf 3 · Qty 4'},
  {id: 'a2', name: 'Baby Spinach', qty: 1, aisle: 2, bay: 2, shelf: 2, slot: 1, status: 'done', metaLabel: 'Bay 2 · Shelf 2 · Qty 1'},
  {id: 'a3', name: 'Roma Tomatoes', qty: 6, aisle: 2, bay: 4, shelf: 1, slot: 2, status: 'done', metaLabel: 'Bay 4 · Shelf 1 · Qty 6'},
  {id: 'b1', name: 'Sourdough Boule', qty: 1, aisle: 4, bay: 1, shelf: 2, slot: 0, status: 'todo', metaLabel: 'Bay 1 · Shelf 2 · Qty 1'},
  {id: 'b2', name: 'Everything Bagels — Bakery Fresh 6-Pack (Sesame Blend)', qty: 6, aisle: 4, bay: 3, shelf: 3, slot: 1, status: 'todo', metaLabel: 'Bay 3 · Shelf 3 · Qty 6'},
  {id: 'c1', name: 'Marinara Sauce', qty: 2, aisle: 7, bay: 3, shelf: 2, slot: 0, status: 'todo', metaLabel: 'Bay 3 · Shelf 2 · Qty 2'},
  {id: 'c2', name: 'Orecchiette Pasta', qty: 1, aisle: 7, bay: 3, shelf: 4, slot: 1, status: 'skipped', metaLabel: 'Bay 3 · Shelf 4 · Qty 1'},
  {id: 'c3', name: 'Olive Oil 500ml', qty: 1, aisle: 7, bay: 4, shelf: 3, slot: 2, status: 'todo', metaLabel: 'Bay 4 · Shelf 3 · Qty 1'},
  {id: 'd1', name: 'Greek Yogurt', qty: 2, aisle: 9, bay: 2, shelf: 1, slot: 0, status: 'todo', metaLabel: 'Bay 2 · Shelf 1 · Qty 2'},
  {id: 'd2', name: 'Sharp Cheddar', qty: 1, aisle: 9, bay: 2, shelf: 2, slot: 1, status: 'todo', metaLabel: 'Bay 2 · Shelf 2 · Qty 1'},
  {id: 'e1', name: 'Frozen Peas', qty: 1, aisle: 11, bay: 1, shelf: 3, slot: 0, status: 'todo', metaLabel: 'Bay 1 · Shelf 3 · Qty 1'},
  {id: 'e2', name: 'Vanilla Ice Cream', qty: 1, aisle: 11, bay: 2, shelf: 2, slot: 1, status: 'todo', metaLabel: 'Bay 2 · Shelf 2 · Qty 1'},
];

interface StoreRow {
  id: string;
  name: string;
  distance: string;
  hours: string;
}

const STORES: StoreRow[] = [
  {id: 'st1', name: 'Cedar Falls', distance: '0.4 mi', hours: 'Open until 10 PM'},
  {id: 'st2', name: 'Maple Row', distance: '2.1 mi', hours: 'Open until 9 PM'},
  {id: 'st3', name: 'Downtown', distance: '3.8 mi', hours: 'Open until 11 PM'},
];

interface Deal {
  id: string;
  title: string;
  save: string;
  tag: string; // matches a DEAL_CHIPS entry
  mark: string; // 2-char thumb monogram
}

const DEAL_CHIPS = ['Produce', 'Pantry', 'Frozen'];
const DEALS: Deal[] = [
  {id: 'dl1', title: 'Honeycrisp Apples · 3 lb bag', save: 'Save $1.50', tag: 'Produce', mark: 'PR'},
  {id: 'dl2', title: 'San Marzano Tomatoes · 28 oz', save: '2 for $6', tag: 'Pantry', mark: 'PA'},
  {id: 'dl3', title: 'Cold-Pressed Olive Oil · 500 ml', save: 'Save $2.00', tag: 'Pantry', mark: 'PA'},
  {id: 'dl4', title: 'Vanilla Bean Ice Cream · pint', save: 'Buy 2 get 1', tag: 'Frozen', mark: 'FR'},
];

const ACCOUNT_ROWS = ['Order history', 'Payment methods', 'Notifications', 'Help & support'];

// ---------------------------------------------------------------------------
// PURE DERIVES — everything below is a function of the items array; nothing
// is stored twice (grouping, route, chip, ring, badge, ETA all re-derive).
// ---------------------------------------------------------------------------

const walkSort = (a: GroceryItem, b: GroceryItem) => a.aisle - b.aisle || a.slot - b.slot;

function liveItems(items: GroceryItem[]): GroceryItem[] {
  return items.filter(item => item.status !== 'removed');
}

function todoItems(items: GroceryItem[]): GroceryItem[] {
  return items.filter(item => item.status === 'todo');
}

/** Aisle numbers (ascending) that still hold ≥1 todo item. */
function remainingAisles(items: GroceryItem[]): number[] {
  return AISLES.map(aisle => aisle.num).filter(num =>
    items.some(item => item.aisle === num && item.status === 'todo'),
  );
}

/** ETA law: todo×20s + remainingAisles×40s, ceil to minutes. */
function etaMinutes(items: GroceryItem[]): number {
  const todo = todoItems(items).length;
  const stops = remainingAisles(items).length;
  return Math.ceil((todo * 20 + stops * 40) / 60);
}

/** Pin cy: 36 + slot×40 → slots 0–3 land at 36/76/116/156 (inside 16–216). */
function pinCy(slot: number): number {
  return 36 + slot * 40;
}

const ENTRANCE: [number, number] = [23, 244];

/**
 * routePoints — the serpentine pick path. From the entrance dot the
 * polyline walks the bottom walkway (y=244) to the first remaining aisle,
 * traverses it to the top corridor (y=8), crosses to the next aisle, and
 * alternates by stop parity — so clearing an aisle FLIPS the entry side of
 * every later stop and the route visibly rewires 'the other way' (the
 * spec's alternate-direction rule; the intermediate topmost-pin waypoint
 * is collinear with the traversal so the segment renders straight).
 */
function routePoints(items: GroceryItem[]): string {
  const stops = remainingAisles(items);
  if (stops.length === 0) return '';
  const pts: Array<[number, number]> = [ENTRANCE];
  let corridor = 244;
  for (const num of stops) {
    const cx = AISLE_BY_NUM[num].cx;
    pts.push([cx, corridor]);
    corridor = corridor === 244 ? 8 : 244;
    pts.push([cx, corridor]);
  }
  return pts.map(pt => pt.join(',')).join(' ');
}

interface AisleGroup {
  aisle: Aisle;
  rows: GroceryItem[]; // todo + done rows in slot order (aisle not finished)
  skippedCount: number;
}

interface RailModel {
  activeGroups: AisleGroup[]; // aisles with ≥1 todo (or done-but-blocked)
  skipped: GroceryItem[]; // terminal end-of-trip group
  picked: Array<{aisle: Aisle; count: number}>; // fully-done collapse rows
}

/**
 * Walk-order rail derive: ascending aisle → slot. An aisle collapses to a
 * PICKED row only when EVERY live item in it is done; a pending skipped
 * item blocks the collapse (stress fixture 2) and surfaces as '· 1
 * SKIPPED' in the sectionHeader while the skipped row itself lives in the
 * terminal SKIPPED group.
 */
function deriveRail(items: GroceryItem[]): RailModel {
  const live = liveItems(items);
  const activeGroups: AisleGroup[] = [];
  const picked: Array<{aisle: Aisle; count: number}> = [];
  for (const aisle of AISLES) {
    const inAisle = live.filter(item => item.aisle === aisle.num).sort(walkSort);
    if (inAisle.length === 0) continue;
    if (inAisle.every(item => item.status === 'done')) {
      picked.push({aisle, count: inAisle.length});
      continue;
    }
    activeGroups.push({
      aisle,
      rows: inAisle.filter(item => item.status !== 'skipped'),
      skippedCount: inAisle.filter(item => item.status === 'skipped').length,
    });
  }
  return {
    activeGroups,
    skipped: live.filter(item => item.status === 'skipped').sort(walkSort),
    picked,
  };
}

/** 'bottom shelf' / 'second from bottom' / … for the shelf caption. */
function shelfWords(shelf: number): string {
  if (shelf === 1) return 'bottom shelf';
  if (shelf === 2) return 'second from bottom';
  if (shelf === 3) return 'third from bottom';
  return 'top shelf';
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useShoppingApp: one items array + ui slice, one
// update(id, patch) item mutator + one uiPatch. Walk-order groups, route
// polyline, next aisle, ring fills, badge, and ETA are ALL derived pure
// functions of items — nothing stored twice. (Spec's screenByTab is
// omitted: no tab pushes a sub-screen here, so the only per-tab state is
// the scroll map — noted as a deviation.)
// ---------------------------------------------------------------------------

type TabId = 'list' | 'stores' | 'deals' | 'account';

interface ToastState {
  seq: number;
  text: string;
  undoId: string | null;
  undoPrev: ItemStatus | null;
}

interface UiState {
  tab: TabId;
  sheetItemId: string | null;
  sheetDetent: 'medium' | 'large';
  actionSheetItemId: string | null;
  toast: ToastState | null;
  loading: boolean;
  refreshed: boolean;
  storeId: string;
  dealChip: string | null;
  routeFromProduce: boolean;
}

const INITIAL_UI: UiState = {
  tab: 'list',
  sheetItemId: null,
  sheetDetent: 'medium',
  actionSheetItemId: null,
  toast: null,
  loading: false,
  refreshed: false,
  storeId: 'st1',
  dealChip: null,
  routeFromProduce: true,
};

function useShoppingApp() {
  const [items, setItems] = useState<GroceryItem[]>(ITEMS_FIXTURE);
  const [ui, setUi] = useState<UiState>(INITIAL_UI);
  const toastSeq = useRef(0);
  // THE single item mutator — check, skip, remove, add back, undo all
  // route through here; the base array order never changes, so Undo
  // restores the exact walk-order slot by status alone (stress fixture 4).
  const update = useCallback((id: string, patch: Partial<GroceryItem>) => {
    setItems(prev => prev.map(item => (item.id === id ? {...item, ...patch} : item)));
  }, []);
  const uiPatch = useCallback((patch: Partial<UiState>) => {
    setUi(prev => ({...prev, ...patch}));
  }, []);
  const showToast = useCallback(
    (text: string, undoId: string | null = null, undoPrev: ItemStatus | null = null) => {
      toastSeq.current += 1;
      setUi(prev => ({...prev, toast: {seq: toastSeq.current, text, undoId, undoPrev}}));
    },
    [],
  );
  const resetItems = useCallback(() => setItems(ITEMS_FIXTURE), []);
  return {items, ui, update, uiPatch, showToast, resetItems};
}

/** Container-width hook (grid-feeder-console pattern). */
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
 * FLIP re-sequencing for rail rows/groups: capture rects keyed by id,
 * apply a transform-only inversion on order change, play 200ms; instant
 * under reduced motion (the layout snap alone).
 */
function useFlip(orderKey: string, enabled: boolean) {
  const nodes = useRef(new Map<string, HTMLElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el == null) {
        nodes.current.delete(id);
      } else {
        nodes.current.set(id, el);
      }
    },
    [],
  );
  useLayoutEffect(() => {
    const next = new Map<string, DOMRect>();
    nodes.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const prev = rects.current.get(id);
      if (enabled && prev != null) {
        const dy = prev.top - rect.top;
        if (Math.abs(dy) > 1) {
          el.style.transition = 'none';
          el.style.transform = `translateY(${dy}px)`;
          requestAnimationFrame(() => {
            el.style.transition = 'transform 200ms ease';
            el.style.transform = '';
          });
        }
      }
      next.set(id, rect);
    });
    rects.current = next;
  }, [orderKey, enabled]);
  return register;
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
// BRAND MARK — 28px rounded-8 storefront square, four vertical bars with
// one gap reading as a stylized F, in a 44×44 non-interactive nav slot.
// ---------------------------------------------------------------------------

function FieldstoneMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x={1.5} y={2} width={2.4} height={12} rx={1.2} fill="currentColor" />
          <rect x={5.5} y={2} width={2.4} height={2.6} rx={1.2} fill="currentColor" />
          <rect x={5.5} y={6.8} width={2.4} height={2.6} rx={1.2} fill="currentColor" />
          <rect x={9.5} y={2} width={2.4} height={2.6} rx={1.2} fill="currentColor" />
          <rect x={13.1} y={2} width={1.4} height={2.6} rx={0.7} fill="currentColor" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS RING CHIP — 24px SVG, 12 segments (one per fixture item; a
// comment-level assert: SEGMENT_COUNT === ITEMS_FIXTURE.length === 12, and
// at all-done the ring reads 11 solid + 1 dashed = 12 — never a 13th).
// Solid brand per DONE, dashed per SKIPPED, boundary-pair remainder
// (segments are meaningful rest fills, so CHECK_BORDER ≥3:1, not the
// hairline token). aria-hidden — the chip's text carries the words.
// ---------------------------------------------------------------------------

const SEGMENT_COUNT = ITEMS_FIXTURE.length; // 12 exactly

function ringArc(index: number): string {
  // 30° per segment: 24° of arc + 6° gap; radius 9 around center (12,12).
  const start = ((index * 30 + 3 - 90) * Math.PI) / 180;
  const end = ((index * 30 + 27 - 90) * Math.PI) / 180;
  const sx = (12 + 9 * Math.cos(start)).toFixed(2);
  const sy = (12 + 9 * Math.sin(start)).toFixed(2);
  const ex = (12 + 9 * Math.cos(end)).toFixed(2);
  const ey = (12 + 9 * Math.sin(end)).toFixed(2);
  return `M ${sx} ${sy} A 9 9 0 0 1 ${ex} ${ey}`;
}

function ProgressRingChip({items}: {items: GroceryItem[]}) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden style={{flexShrink: 0}}>
      {ITEMS_FIXTURE.map((fixture, index) => {
        const current = items.find(item => item.id === fixture.id);
        const status = current?.status ?? 'removed';
        const solid = status === 'done';
        const dashed = status === 'skipped';
        return (
          <path
            key={fixture.id}
            d={ringArc(index)}
            stroke={solid || dashed ? BRAND_ACCENT : CHECK_BORDER}
            strokeOpacity={status === 'removed' ? 0.35 : 1}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={dashed ? '1.5 2.5' : undefined}
            className="fsm-fade"
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AISLE STRIP MAP — pure SVG plan view, viewBox '0 0 358 268'. Pins and
// path are aria-hidden decoration; the PickPathRail below is the
// interactive surface (gesture-with-button-path law). A visually hidden
// sentence derived from the same store summarizes the route for AT.
// ---------------------------------------------------------------------------

interface AisleStripMapProps {
  items: GroceryItem[];
  loading: boolean;
  tickingIds: ReadonlySet<string>;
  onTickEnd: (id: string) => void;
  reducedMotion: boolean;
}

function AisleStripMap({items, loading, tickingIds, onTickEnd, reducedMotion}: AisleStripMapProps) {
  const points = routePoints(items);
  return (
    <svg viewBox="0 0 358 268" style={styles.mapSvg} aria-hidden>
      {/* Walkway band y=228–260. */}
      <rect x={0} y={228} width={358} height={32} rx={12} fill={STRIP_FILL} opacity={0.55} />
      {/* Five aisle strips — meaningful rest fills with ≥3:1 strokes. */}
      {AISLES.map(aisle => (
        <rect
          key={aisle.num}
          x={aisle.x}
          y={16}
          width={46}
          height={200}
          rx={12}
          fill={STRIP_FILL}
          stroke={loading ? 'transparent' : STRIP_STROKE}
          strokeWidth={1}
        />
      ))}
      {!loading ? (
        <>
          {/* Entrance dot — bottom-left of the walkway, nudged off the
              aisle-2 numeral (the polyline still starts at 23,244). */}
          <circle cx={8} cy={252} r={5} fill="var(--color-text-secondary)" />
          {/* Dotted pick path — marching ants removed under reduced
              motion (static dots still encode the route); keyed by its
              points so a re-route crossfades in via fsm-path-in. */}
          {points !== '' ? (
            <polyline
              key={points}
              points={points}
              fill="none"
              stroke={BRAND_ACCENT}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="2 6"
              className="fsm-ants fsm-path-in"
            />
          ) : null}
          {/* One pin per todo item; done pins play a 200ms scale-to-0
              tick then unmount (instant under reduced motion); skipped
              pins render hollow dashed. */}
          {items.map(item => {
            const ticking = tickingIds.has(item.id);
            if (item.status === 'removed' || item.status === 'done') {
              if (!ticking || reducedMotion) return null;
            }
            const cx = AISLE_BY_NUM[item.aisle].cx;
            const cy = pinCy(item.slot);
            if (item.status === 'skipped' && !ticking) {
              return (
                <circle
                  key={item.id}
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill="none"
                  stroke={BRAND_ACCENT}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              );
            }
            return (
              <g
                key={item.id}
                className={ticking ? 'fsm-tick' : undefined}
                style={{transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box'}}
                onAnimationEnd={ticking ? () => onTickEnd(item.id) : undefined}>
                <circle cx={cx} cy={cy} r={8} fill={BRAND_ACCENT} stroke="var(--color-background-card)" strokeWidth={2} />
                {ticking ? (
                  <path
                    d={`M ${cx - 3.5} ${cy} l 2.5 2.5 l 4.5 -5`}
                    stroke={BRAND_FILL_TEXT}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ) : null}
              </g>
            );
          })}
        </>
      ) : null}
      {/* Aisle numerals paint LAST so the walkway path never strikes
          through them; they aria-hidden-duplicate the sectionHeaders. */}
      {AISLES.map(aisle => (
        <text
          key={aisle.num}
          x={aisle.cx}
          y={248}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="var(--color-text-primary)">
          {aisle.num}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SHELF LOCATOR DIAGRAM — in-sheet SVG elevation of one bay, viewBox
// '0 0 326 200'; 4 shelf slabs (shelf 1 = bottom at y=150, then 106/62/18);
// the target slab + 56×34 product block are brand-filled. Values come
// straight from the item record — no free text.
// ---------------------------------------------------------------------------

const SHELF_Y = [150, 106, 62, 18]; // index = shelf − 1

function ShelfLocatorDiagram({item}: {item: GroceryItem}) {
  const shelfY = SHELF_Y[item.shelf - 1];
  return (
    <div>
      <svg viewBox="0 0 326 200" style={{width: '100%', display: 'block'}} aria-hidden>
        <rect x={2} y={2} width={322} height={196} rx={8} fill={STRIP_FILL} stroke={STRIP_STROKE} strokeWidth={1} />
        {SHELF_Y.map((y, index) => (
          <rect
            key={y}
            x={14}
            y={y}
            width={298}
            height={10}
            rx={3}
            fill={index === item.shelf - 1 ? BRAND_ACCENT : 'var(--color-background-card)'}
            stroke={index === item.shelf - 1 ? 'none' : STRIP_STROKE}
            strokeWidth={0.75}
          />
        ))}
        <rect x={135} y={shelfY - 34} width={56} height={34} rx={4} fill={BRAND_ACCENT} />
      </svg>
      <div style={styles.shelfCaption}>
        Aisle {item.aisle} · Bay {item.bay} · Shelf {item.shelf} ({shelfWords(item.shelf)})
      </div>
      <div style={styles.bayStrip} aria-hidden>
        {[1, 2, 3, 4].map(bay => (
          <span key={bay} style={{...styles.baySquare, ...(bay === item.bay ? styles.baySquareActive : null)}}>
            {bay}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Fieldstone Market · Aisle Finder.
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof ListChecksIcon}> = [
  {id: 'list', label: 'List', icon: ListChecksIcon},
  {id: 'stores', label: 'Stores', icon: MapPinIcon},
  {id: 'deals', label: 'Deals', icon: TagIcon},
  {id: 'account', label: 'Account', icon: UserIcon},
];

const H1_BY_TAB: Record<TabId, string> = {
  list: LIST_NAME,
  stores: 'Stores',
  deals: 'Deals',
  account: 'Account',
};

// Fixed skeleton width pattern — never random.
const SKELETON_WIDTHS: Array<[number, number]> = [
  [60, 40],
  [45, 55],
  [70, 30],
  [60, 40],
];

export default function MobileStoreAisleFinder() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});

  const width = useElementWidth(wrapRef);
  const viewportWide = useMediaQuery('(min-width: 900px)'); // first-frame fallback
  const isDesktop = width > 0 ? width >= 720 : viewportWide;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {items, ui, update, uiPatch, showToast, resetItems} = useShoppingApp();
  const [tickingIds, setTickingIds] = useState<ReadonlySet<string>>(new Set());

  // ---- Pure derives — the whole surface re-agrees from `items` alone.
  const live = liveItems(items);
  const todo = todoItems(items);
  const stops = remainingAisles(items);
  const eta = etaMinutes(items);
  const rail = deriveRail(items);
  const doneCount = live.filter(item => item.status === 'done').length;
  const nextAisle = stops[0] ?? null;
  const allPicked = live.length > 0 && live.every(item => item.status === 'done');
  const overlayOpen = ui.sheetItemId != null || ui.actionSheetItemId != null;
  const sheetItem = ui.sheetItemId != null ? items.find(item => item.id === ui.sheetItemId) ?? null : null;
  const actionItem =
    ui.actionSheetItemId != null ? items.find(item => item.id === ui.actionSheetItemId) ?? null : null;

  const chipText = nextAisle != null ? `Next: Aisle ${nextAisle}` : allPicked ? 'Trip complete' : 'No stops left';
  const chipA11y =
    nextAisle != null
      ? `Next stop Aisle ${nextAisle}, ${doneCount} of ${SEGMENT_COUNT} picked`
      : `${doneCount} of ${SEGMENT_COUNT} picked`;
  const footerText =
    todo.length === 0
      ? '0 stops · 0 items · done'
      : `${stops.length} stops · ${todo.length} items · est. ${eta} min left`;

  // FLIP over group order (aisle groups FLIP into SKIPPED/PICKED zones).
  const orderKey = [
    rail.activeGroups.map(group => `a${group.aisle.num}:${group.rows.length}`).join('|'),
    rail.skipped.map(item => item.id).join('|'),
    rail.picked.map(entry => `p${entry.aisle.num}`).join('|'),
  ].join('~');
  const registerFlip = useFlip(orderKey, !reducedMotion);

  // ---- Scroll persistence (the demo's .preview-wrap owns page scroll).
  const getScroller = useCallback((): HTMLElement | null => {
    let el: HTMLElement | null = shellRef.current?.parentElement ?? null;
    while (el != null) {
      const css = window.getComputedStyle(el);
      if ((css.overflowY === 'auto' || css.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return (document.scrollingElement as HTMLElement | null) ?? null;
  }, []);

  const switchTab = useCallback(
    (next: TabId) => {
      const scroller = getScroller();
      if (next === ui.tab) {
        // The one legal reset: re-tapping the active tab scrolls to top.
        scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
        return;
      }
      if (scroller != null) {
        scrollByTabRef.current[ui.tab] = scroller.scrollTop;
      }
      // Overlays close on tab switch; the toast dock persists.
      uiPatch({tab: next, sheetItemId: null, actionSheetItemId: null});
    },
    [getScroller, reducedMotion, ui.tab, uiPatch],
  );

  useEffect(() => {
    const scroller = getScroller();
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[ui.tab] ?? 0;
    }
  }, [getScroller, ui.tab]);

  const onTabKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index + tabs.length - 1) % tabs.length;
    tabs[next].focus();
  }, []);

  // ---- Mutations (all through the one update + one toast dock).
  const onTickEnd = useCallback((id: string) => {
    setTickingIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const checkItem = useCallback(
    (item: GroceryItem) => {
      if (item.status === 'done') {
        // role='checkbox' toggles honestly: unchecking returns the item.
        update(item.id, {status: 'todo'});
        showToast(`${item.name} moved back to the list`, item.id, 'done');
        return;
      }
      update(item.id, {status: 'done'});
      if (!reducedMotion) {
        setTickingIds(prev => new Set(prev).add(item.id));
      }
      showToast(`${item.name} picked`, item.id, item.status);
    },
    [reducedMotion, showToast, update],
  );

  const closeActionSheet = useCallback(
    (restoreFocus = true) => {
      uiPatch({actionSheetItemId: null});
      if (restoreFocus) {
        openerRef.current?.focus({preventScroll: true});
      }
    },
    [uiPatch],
  );

  const closeSheet = useCallback(() => {
    uiPatch({sheetItemId: null, sheetDetent: 'medium'});
    openerRef.current?.focus({preventScroll: true});
  }, [uiPatch]);

  const openSheet = useCallback(
    (item: GroceryItem, opener: HTMLElement | null) => {
      if (opener != null) {
        openerRef.current = opener;
      }
      // Never two sheets: the action sheet closes before the item sheet opens.
      uiPatch({actionSheetItemId: null, sheetItemId: item.id, sheetDetent: 'medium'});
    },
    [uiPatch],
  );

  const openActionSheet = useCallback(
    (item: GroceryItem, opener: HTMLElement) => {
      openerRef.current = opener;
      uiPatch({actionSheetItemId: item.id});
    },
    [uiPatch],
  );

  const skipItem = useCallback(
    (item: GroceryItem) => {
      update(item.id, {status: 'skipped'});
      closeActionSheet();
      showToast(`Skipped ${item.name} — route updated`, item.id, item.status);
    },
    [closeActionSheet, showToast, update],
  );

  // Remove is REVERSIBLE → executes immediately + Undo (undoOverConfirm;
  // no alert). The base array keeps its slot, so Undo restores the exact
  // walk-order position (stress fixture 4).
  const removeItem = useCallback(
    (item: GroceryItem) => {
      update(item.id, {status: 'removed'});
      closeActionSheet();
      showToast(`Removed ${item.name}`, item.id, item.status);
    },
    [closeActionSheet, showToast, update],
  );

  const addBack = useCallback(
    (item: GroceryItem) => {
      update(item.id, {status: 'todo'});
      showToast(`${item.name} added back to the route`, item.id, 'skipped');
    },
    [showToast, update],
  );

  const undo = useCallback(() => {
    const toast = ui.toast;
    if (toast?.undoId == null || toast.undoPrev == null) return;
    update(toast.undoId, {status: toast.undoPrev});
    showToast('Restored');
  }, [showToast, ui.toast, update]);

  const markPickedFromSheet = useCallback(() => {
    if (sheetItem == null) return;
    checkItem(sheetItem);
    closeSheet();
  }, [checkItem, closeSheet, sheetItem]);

  // ---- Refresh → skeleton; the NEXT user tap (captured) resolves it.
  const refresh = useCallback(() => {
    uiPatch({loading: true});
    showToast('Loading');
  }, [showToast, uiPatch]);

  const onShellClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!ui.loading) return;
      event.preventDefault();
      event.stopPropagation();
      uiPatch({loading: false, refreshed: true});
      showToast(UPDATED);
    },
    [showToast, ui.loading, uiPatch],
  );

  // ---- Overlay focus: into the opening layer with preventScroll (the
  // amendment — plain .focus() beaches the animating sheet), restored to
  // the opener on every close path.
  useEffect(() => {
    if (ui.actionSheetItemId != null) {
      cancelRef.current?.focus({preventScroll: true});
    } else if (ui.sheetItemId != null) {
      sheetCloseRef.current?.focus({preventScroll: true});
    }
  }, [ui.actionSheetItemId, ui.sheetItemId]);

  const onShellKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape') return;
      // Escape closes the TOPMOST overlay only (action sheet > sheet).
      if (ui.actionSheetItemId != null) {
        event.stopPropagation();
        closeActionSheet();
      } else if (ui.sheetItemId != null) {
        event.stopPropagation();
        closeSheet();
      }
    },
    [closeActionSheet, closeSheet, ui.actionSheetItemId, ui.sheetItemId],
  );

  // ---- Row renderer (active aisle groups).
  const renderRow = (item: GroceryItem, isLast: boolean) => {
    const done = item.status === 'done';
    return (
      <div key={item.id}>
        <div style={styles.row}>
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={`${item.name}, aisle ${item.aisle}`}
            className="fsm-btn fsm-focusable"
            style={styles.checkHit}
            onClick={() => checkItem(item)}>
            <span style={{...styles.checkCircle, ...(done ? styles.checkCircleDone : null)}} aria-hidden>
              {done ? <Icon icon={CheckIcon} size="sm" /> : null}
            </span>
          </button>
          <button
            type="button"
            className="fsm-btn fsm-focusable"
            style={styles.rowMain}
            aria-label={`${item.name}, ${item.metaLabel} — view shelf location`}
            onClick={event => openSheet(item, event.currentTarget)}>
            <span style={{...styles.rowName, ...(done ? styles.rowNameDone : null)}}>{item.name}</span>
            <span style={styles.rowMeta}>{item.metaLabel}</span>
          </button>
          <button
            type="button"
            className="fsm-btn fsm-focusable"
            style={styles.ellipsisBtn}
            aria-label={`More options, ${item.name}`}
            aria-haspopup="dialog"
            onClick={event => openActionSheet(item, event.currentTarget)}>
            <Icon icon={MoreHorizontalIcon} size="sm" />
          </button>
        </div>
        {!isLast ? <div style={styles.rowDivider} /> : null}
      </div>
    );
  };

  // ---- Screens.
  const listScreen = (
    <>
      {/* MAP DOCK — sticky under the navBar; list scrolls under it. */}
      <div style={styles.mapDock}>
        <AisleStripMap
          items={items}
          loading={ui.loading}
          tickingIds={tickingIds}
          onTickEnd={onTickEnd}
          reducedMotion={reducedMotion}
        />
        <div style={styles.routeFooter} aria-hidden={ui.loading || undefined}>
          {ui.loading ? <span style={styles.footerSkeletonBar} /> : footerText}
        </div>
        {ui.refreshed && !ui.loading ? <div style={styles.updatedCaption}>{UPDATED}</div> : null}
        {/* AT summary for the aria-hidden map — same derive as the path. */}
        <p className="fsm-vh">
          {stops.length > 0 ? `Route visits aisles ${stops.join(', ')}` : 'No stops remaining'}
        </p>
      </div>

      {ui.loading ? (
        <div aria-busy="true">
          <h2 style={styles.sectionHeader} aria-hidden>
            Loading list
          </h2>
          <div style={{...styles.listCard, ...styles.skeletonShimmerHost}} aria-hidden>
            {SKELETON_WIDTHS.map(([primary, secondary], index) => (
              <div key={primary * 100 + secondary}>
                <div style={styles.skeletonRow}>
                  <span style={styles.skeletonCircle} />
                  <span style={styles.skeletonLines}>
                    <span style={{...styles.skeletonBar, width: `${primary}%`}} />
                    <span style={{...styles.skeletonBar, width: `${secondary}%`}} />
                  </span>
                </div>
                {index < SKELETON_WIDTHS.length - 1 ? <div style={styles.rowDivider} /> : null}
              </div>
            ))}
            <span style={styles.skeletonShimmer} className="fsm-shimmer" />
          </div>
        </div>
      ) : allPicked ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={CheckCircle2Icon} size="lg" />
          </span>
          <h2 style={styles.emptyTitle}>Trip complete</h2>
          <p style={styles.emptyBody}>All {live.length} items picked. Nice run.</p>
          <button type="button" className="fsm-btn fsm-focusable" style={styles.secondaryBtn} onClick={() => {
            resetItems();
            showToast('Demo list reset');
          }}>
            Reset demo list
          </button>
        </div>
      ) : (
        <>
          {rail.activeGroups.map(group => (
            <section key={group.aisle.num} ref={registerFlip(`g${group.aisle.num}`)}>
              <h2 style={styles.sectionHeader}>
                Aisle {group.aisle.num} · {group.aisle.dept}
                {group.skippedCount > 0 ? ` · ${group.skippedCount} skipped` : ''}
              </h2>
              <div style={styles.listCard}>
                {group.rows.map((item, index) => renderRow(item, index === group.rows.length - 1))}
              </div>
            </section>
          ))}

          {rail.skipped.length > 0 ? (
            <section ref={registerFlip('skipped')}>
              <h2 style={styles.sectionHeader}>Skipped — end of trip</h2>
              <div style={styles.listCardDashed}>
                {rail.skipped.map((item, index) => (
                  <div key={item.id}>
                    <div style={{...styles.row, paddingInlineEnd: 16}}>
                      <span style={styles.checkHit} aria-hidden>
                        <span style={{...styles.checkCircle, ...styles.checkCircleSkipped}} />
                      </span>
                      <span style={{...styles.rowMain, pointerEvents: 'none'}}>
                        <span style={styles.rowName}>{item.name}</span>
                        <span style={styles.rowMeta}>
                          Aisle {item.aisle} · {item.metaLabel}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="fsm-btn fsm-focusable"
                        style={styles.addBackBtn}
                        onClick={() => addBack(item)}>
                        Add back
                      </button>
                    </div>
                    {index < rail.skipped.length - 1 ? <div style={styles.rowDivider} /> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {rail.picked.length > 0 ? (
            <section ref={registerFlip('picked')}>
              <h2 style={styles.sectionHeader}>Picked</h2>
              <div style={styles.listCard}>
                {rail.picked.map((entry, index) => (
                  <div key={entry.aisle.num}>
                    <div style={styles.doneRow}>
                      <span style={styles.doneRowIcon} aria-hidden>
                        <Icon icon={CheckCircle2Icon} size="sm" />
                      </span>
                      Aisle {entry.aisle.num} · {entry.count} of {entry.count} picked
                    </div>
                    {index < rail.picked.length - 1 ? <div style={styles.rowDivider} /> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
      <div style={styles.bottomSpacer} />
    </>
  );

  const storesScreen = (
    <>
      <h2 style={styles.sectionHeader}>Nearby stores</h2>
      <div style={styles.listCard}>
        {STORES.map((store, index) => {
          const active = store.id === ui.storeId;
          return (
            <div key={store.id}>
              <button
                type="button"
                className="fsm-btn fsm-focusable"
                style={styles.storeRow}
                aria-pressed={active}
                onClick={() => {
                  uiPatch({storeId: store.id});
                  showToast(`${store.name} set as your store`);
                }}>
                <span style={styles.storeText}>
                  <span style={styles.rowName}>{store.name}</span>
                  <span style={styles.rowMeta}>
                    {store.distance} · {store.hours}
                  </span>
                </span>
                {active ? (
                  <span style={styles.doneRowIcon} aria-hidden>
                    <Icon icon={CheckIcon} size="sm" />
                  </span>
                ) : null}
              </button>
              {index < STORES.length - 1 ? <div style={{...styles.rowDivider, marginInlineStart: 16}} /> : null}
            </div>
          );
        })}
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const visibleDeals = ui.dealChip == null ? DEALS : DEALS.filter(deal => deal.tag === ui.dealChip);
  const dealsScreen = (
    <>
      <div style={styles.chipRow}>
        {DEAL_CHIPS.map(chipLabel => {
          const on = ui.dealChip === chipLabel;
          return (
            <button
              key={chipLabel}
              type="button"
              className="fsm-btn fsm-focusable"
              style={{...styles.chip, ...(on ? styles.chipOn : null)}}
              aria-pressed={on}
              onClick={() => uiPatch({dealChip: on ? null : chipLabel})}>
              {chipLabel}
            </button>
          );
        })}
      </div>
      <h2 style={styles.sectionHeader}>This week</h2>
      <div style={styles.listCard}>
        {visibleDeals.map((deal, index) => (
          <div key={deal.id}>
            <div style={styles.dealRow}>
              {/* Stylized deterministic thumb — no photos by law. */}
              <span style={{...styles.dealThumb, background: BRAND_ACCENT}} aria-hidden>
                {deal.mark}
              </span>
              <span style={styles.storeText}>
                <span style={styles.rowName}>{deal.title}</span>
                <span style={{...styles.rowMeta, color: BRAND_ACCENT, fontWeight: 600}}>{deal.save}</span>
              </span>
            </div>
            {index < visibleDeals.length - 1 ? <div style={{...styles.rowDivider, marginInlineStart: 76}} /> : null}
          </div>
        ))}
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const accountScreen = (
    <>
      <h2 style={styles.sectionHeader}>Account</h2>
      <div style={styles.listCard}>
        {ACCOUNT_ROWS.map(label => (
          <div key={label}>
            <button
              type="button"
              className="fsm-btn fsm-focusable"
              style={styles.utilityRow}
              onClick={() => showToast(`${label} — not part of this demo`)}>
              <span style={styles.utilityLabel}>{label}</span>
              <span style={styles.chevron} aria-hidden>
                <Icon icon={ChevronRightIcon} size="sm" />
              </span>
            </button>
            <div style={{...styles.rowDivider, marginInlineStart: 16}} />
          </div>
        ))}
        {/* Full-row switch — the ENTIRE 44px row is the role='switch'. */}
        <button
          type="button"
          role="switch"
          aria-checked={ui.routeFromProduce}
          className="fsm-btn fsm-focusable"
          style={styles.utilityRow}
          onClick={() => {
            uiPatch({routeFromProduce: !ui.routeFromProduce});
            showToast('Route preference saved');
          }}>
          <span style={styles.utilityLabel}>Route from produce first</span>
          <span
            style={{...styles.switchTrack, ...(ui.routeFromProduce ? styles.switchTrackOn : null)}}
            aria-hidden>
            <span
              style={{
                ...styles.switchThumb,
                transform: ui.routeFromProduce ? 'translateX(20px)' : 'none',
                transition: reducedMotion ? 'none' : styles.switchThumb.transition,
              }}
            />
          </span>
        </button>
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const screenByTab: Record<TabId, ReactNode> = {
    list: listScreen,
    stores: storesScreen,
    deals: dealsScreen,
    account: accountScreen,
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FSM_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(overlayOpen ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}
        onKeyDown={onShellKeyDown}
        onClickCapture={onShellClickCapture}>
        {/* One h1 per screen — compact-title layout, so it is visually
            hidden (largeTitle-free by contract; noted). */}
        <h1 className="fsm-vh">{H1_BY_TAB[ui.tab]}</h1>
        <p className="fsm-vh">{STORE}</p>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <FieldstoneMark />
          </div>
          {/* role='status' names the route state for AT, but count
              mutations announce ONLY via the toastDock — aria-live is
              explicitly off here to avoid double announcements. */}
          <div style={styles.routeChip} role="status" aria-live="off">
            <ProgressRingChip items={items} />
            <span style={styles.routeChipLabel} aria-hidden>
              {chipText}
            </span>
            <span className="fsm-vh">{chipA11y}</span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fsm-btn fsm-focusable"
              style={styles.iconBtn}
              aria-label="Refresh list"
              onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="sm" />
            </button>
          </div>
        </header>

        <main style={styles.main}>{screenByTab[ui.tab]}</main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow above
            the tabBar, absolute only while the shell is scroll-locked. */}
        <div
          style={overlayOpen ? styles.toastAnchorLocked : styles.toastAnchor}
          role="status"
          aria-live="polite">
          {ui.toast != null ? (
            <div style={styles.toast} key={ui.toast.seq}>
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undoId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="fsm-btn fsm-focusable" style={styles.undoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR */}
        <nav style={styles.tabBar} role="tablist" aria-label="Fieldstone sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="fsm-btn fsm-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" />
                  {tab.id === 'list' && todo.length > 0 ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {todo.length}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ITEM SHEET — medium 55% ↔ large calc(100% − 56px); the sheet
            body is the ONE legal inner scroller. */}
        {sheetItem != null && actionItem == null ? (
          <>
            <button
              type="button"
              className="fsm-btn"
              style={styles.sheetScrim}
              aria-label="Close shelf location"
              onClick={closeSheet}
            />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${sheetItem.name} shelf location`}
              className="fsm-sheet-in"
              style={{...styles.sheet, ...(ui.sheetDetent === 'large' ? styles.sheetLarge : styles.sheetMedium)}}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="fsm-btn fsm-focusable"
                  aria-label="Resize sheet"
                  aria-expanded={ui.sheetDetent === 'large'}
                  style={{height: 24, paddingInline: 16, display: 'grid', placeItems: 'center'}}
                  onClick={() => uiPatch({sheetDetent: ui.sheetDetent === 'medium' ? 'large' : 'medium'})}>
                  <span style={styles.grabberPill} aria-hidden />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span aria-hidden />
                <h2 style={styles.sheetTitle}>{sheetItem.name}</h2>
                <button
                  ref={sheetCloseRef}
                  type="button"
                  className="fsm-btn fsm-focusable"
                  style={styles.iconBtn}
                  aria-label="Close"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="sm" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <ShelfLocatorDiagram item={sheetItem} />
              </div>
              <div style={styles.sheetFooter}>
                <button
                  type="button"
                  className="fsm-btn fsm-focusable"
                  style={styles.markPickedBtn}
                  onClick={markPickedFromSheet}>
                  {sheetItem.status === 'done' ? 'Move back to list' : 'Mark as picked'}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* ACTION SHEET (SkipActionSheet) — two cards, Cancel always the
            bottommost element, first focus on Cancel. */}
        {actionItem != null ? (
          <>
            <button
              type="button"
              className="fsm-btn"
              style={styles.sheetScrim}
              aria-label="Close options"
              onClick={() => closeActionSheet()}
            />
            <div
              ref={actionSheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Options for ${actionItem.name}`}
              className="fsm-sheet-in"
              style={styles.actionSheetWrap}
              onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
              <div style={styles.actionCard}>
                <div style={styles.actionHeader}>
                  {actionItem.name} · Aisle {actionItem.aisle}
                </div>
                <button
                  type="button"
                  className="fsm-btn fsm-focusable"
                  style={styles.actionRow}
                  onClick={() => openSheet(actionItem, null)}>
                  View shelf location
                </button>
                <div style={styles.actionRowRule} />
                {actionItem.status === 'todo' ? (
                  <button
                    type="button"
                    className="fsm-btn fsm-focusable"
                    style={styles.actionRow}
                    onClick={() => skipItem(actionItem)}>
                    Skip for now
                  </button>
                ) : (
                  <button
                    type="button"
                    className="fsm-btn fsm-focusable"
                    style={styles.actionRow}
                    onClick={() => {
                      checkItem(actionItem);
                      closeActionSheet();
                    }}>
                    Move back to list
                  </button>
                )}
                <div style={styles.actionRowRule} />
                <button
                  type="button"
                  className="fsm-btn fsm-focusable"
                  style={{...styles.actionRow, ...styles.actionRowDestructive}}
                  onClick={() => removeItem(actionItem)}>
                  Remove from list
                </button>
              </div>
              <div style={styles.actionCard}>
                <button
                  ref={cancelRef}
                  type="button"
                  className="fsm-btn fsm-focusable"
                  style={styles.cancelRow}
                  onClick={() => closeActionSheet()}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


