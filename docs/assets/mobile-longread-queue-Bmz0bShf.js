var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Spool read-it-later queue:
 *   nine articles (a1–a9) with dual fields (totalParas/readParas beside
 *   the derived remainingMin at WPM 200 · 100 words/para → 0.5 min/para);
 *   remaining minutes 14+6+9+18+22+28+31+26+38 = 192 = '3h 12m across
 *   9 pieces' (the navBar total derives live from the rows); a 44-entry
 *   EXCERPTS const for a1's paragraph ticker; week bars [12,18,9,22,14,
 *   11,0] summing 86 = '1h 26m'. No Date.now(), no Math.random(), no
 *   network media.
 * @output Spool — Long-read Queue: a 390px MOBILE reading-backlog
 *   surface. NavBar (24px SpoolMark · live '3h 12m across 9 pieces'
 *   total · RefreshCw + Moon) over a 52px 'Your queue' large-title row,
 *   then ProgressSpineCards (88px, 116px active variant) with book-style
 *   bottom-up spine fill and ceil(remainingMin/12) session pips, grouped
 *   into ALMOST DONE ≤10 / TONIGHT 11–25 / LONGER SITS >25 sections that
 *   re-sort live; an 88px ResumeScrubberBar (sticky bottom:64) whose
 *   thumb streams the actual paragraph first-clause into an excerpt
 *   ticker and commits readParas on release; and a two-detent
 *   TonightPlannerSheet whose greedy packer bin-packs whole pieces
 *   ascending plus one hatched partial into a 15/25/40-min window.
 *   Signature move: one scrub-commit (16→32 of 44 paras) recomputes the
 *   navBar total 192→184 = '3h 04m', drops a1's pips 2→1, and re-sorts
 *   it out of TONIGHT into ALMOST DONE (section counts 2/3/4 → 3/2/4) —
 *   all derived from the single readParas write.
 * @position Page template; emitted by \`astryx template mobile-longread-queue\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheet, menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the planner sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the stage clips to
 *   --radius-container, shell paints full-bleed square.
 * Container policy: inset-grouped mobile cards (12px radius, 1px border,
 *   hairline rowDividers); no desktop Layout frames, no side asides, no
 *   multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Spool teal). Foundations amendment applied: the spine
 *   rest track, scrubber rest track, switch OFF track, and zero-day
 *   chart stub are meaningful rest fills / interactive boundaries and
 *   carry explicit light-dark() pairs at ≥3:1 vs their ACTUAL surface
 *   with the math at each declaration — the spec's rgba(…,0.16)/(…,0.20)
 *   washes measured ~1.2:1/1.6:1 and were deepened (deviation, noted).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   between cards · 24px between sections · navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — this
 *   template does not wire scroll-under; noted per contract) ·
 *   largeTitle row 52px ('Your queue' 28/700) · tabBar 64px sticky
 *   bottom z20 (3 tabs, 24px icon over 11px/500 label, 4px gap) ·
 *   resumeBar 88px sticky bottom:64 z19 (20px ticker row + 44×44
 *   prev/next flanking a flex-1 8px track with a 28px thumb in a 44px
 *   hit) · toastDock sticky bottom:156 z18 in flow (shell-absolute
 *   insetInline 16 only while the sheet scroll-lock is active) ·
 *   ProgressSpineCard 88px (116px active variant), 16px padding, 6px
 *   left spine radius 3, pips 6px dots at 6px gap · sectionHeader
 *   13px/600 uppercase 0.06em at 32px inset, 20px top / 8px bottom ·
 *   44px utility rows · 51×31 switches · sheet detents 55% / calc(100% −
 *   56px), 24px grabber zone with 36×5 pill, 52px sheet header, 48px
 *   footer button · segmented control 36px · PackedWindowBar 32px.
 *   TYPE (Figtree via --font-family-body): 28/700 large title · 22/700
 *   active-card title · 17/600 nav+sheet titles · 16/400–500 body floor
 *   · 13/400 meta · 11/500 pip labels + tab labels; nothing under 11px;
 *   tabular-nums on every updating numeral. Touch: every target ≥44×44
 *   with ≥8px clearance or merged into a full-row button; every gesture
 *   (swipe-reveal, scrub, sheet drag) has a visible button path (44×44
 *   ellipsis per card, prev/next steppers, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow: no width:390 literals;
 *   cards fluid with 16px gutters; PackedWindowBar percentage-based;
 *   scrubber track flex-1 between fixed 44px buttons; titles 2-line
 *   clamp; navBar total ellipsizes at 200px max. Sticky stack arithmetic
 *   is fixed-height and width-independent: tabBar 0–64, resumeBar
 *   64–152, toastDock 156.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport — the demo stage is ~1045px inside a
 *   1440px window) — at ≥720px the shell becomes a centered phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline) on
 *   --color-background-body. No adaptive relayout.
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
  ArchiveIcon,
  ArrowUpIcon,
  BarChart3Icon,
  BookMarkedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerDownRightIcon,
  MoonIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  Settings2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Spool teal). #0F766E on #FFFFFF ≈ 6.0:1
// (passes 4.5:1 as text and 3:1 as fill); #5EEAD4 on the ~#111 dark card
// ≈ 12.4:1.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text/glyphs over a BRAND_ACCENT fill. Light: #FFFFFF on #0F766E ≈ 6.0:1.
// Dark: white on #5EEAD4 fails (~1.6:1), so the dark side flips to a deep
// teal — #042F2E on #5EEAD4 ≈ 9.8:1.
const BRAND_ON = 'light-dark(#FFFFFF, #042F2E)';
// 12% brand wash for the active segment pill ring + brand mark chip; text
// never sits on it alone.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// SPINE / SCRUBBER REST TRACK — a meaningful rest fill (the unread
// remainder), so ≥3:1 vs its ACTUAL surface per the binding amendment
// (the spec's rgba(15,118,110,0.16)/rgba(94,234,212,0.20) measured only
// ~1.2:1/~1.6:1 — deviation, deepened): #5F9C95 vs the #FFFFFF card ≈
// 3.15:1 ✓; #4E7E78 vs the ~#1C1C1E dark card ≈ 3.7:1 ✓.
const SPINE_TRACK = 'light-dark(#5F9C95, #4E7E78)';
// SPINE READ FILL — must also clear 3:1 against the track it abuts:
// light side deepens past the brand hex to #09443F (≈11.0:1 vs the white
// card, ≈3.5:1 vs the #5F9C95 track); dark side keeps #5EEAD4 (≈12.4:1
// vs the dark card, ≈3.1:1 vs the #4E7E78 track).
const SPINE_FILL = 'light-dark(#09443F, #5EEAD4)';
// Switch OFF track — interactive boundary at rest (amendment class):
// #8D8D92 vs #FFFFFF ≈ 3.3:1 ✓; #74747B vs the dark card ≈ 3.4:1 ✓.
const SWITCH_OFF_TRACK = 'light-dark(#8D8D92, #74747B)';
// Archive swipe block + destructive fills. #C92A2A on white ≈ 5.5:1;
// #FF8787 on the dark card ≈ 7.4:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
// Text over an ERROR_STRONG fill: #FFFFFF on #C92A2A ≈ 5.5:1; #300808 on
// #FF8787 ≈ 7.8:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// 45° hatch stripe over a partial planner block (sits on BRAND_ACCENT;
// decorative texture — the legend's 11px 'partial' tag is the readable
// encoding).
const HATCH_STRIPE = \`repeating-linear-gradient(45deg, transparent 0 5px, color-mix(in srgb, \${BRAND_ON} 45%, transparent) 5px 8px)\`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// 2-line clamp, and the reduced-motion guard (transitions animate
// transform/opacity only and collapse to instant under
// prefers-reduced-motion; no shimmer anywhere — skeletons are omitted
// entirely, see the Refresh handler comment).
// ---------------------------------------------------------------------------

const SPOOL_CSS = \`
.spl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.spl-btn:disabled { cursor: default; }
.spl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.spl-anim { transition: transform 240ms ease, opacity 240ms ease; }
.spl-fade { transition: opacity 240ms ease; }
.spl-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes spl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.spl-sheet-in { animation: spl-sheet-in 240ms ease; }
.spl-vh {
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
  .spl-anim, .spl-fade { transition: none; }
  .spl-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur ALWAYS
  // ON (scroll-under not wired; the always-on choice is legal per the
  // chrome contract and noted here).
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
  // Live total — 17px/600 tabular-nums, ellipsized at 200px max.
  navTitle: {
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
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
  iconBtnDisabled: {opacity: 0.35},
  // LARGE-TITLE ROW — 52px, 28/700 at the 16px gutter; scrolls away while
  // the navBar stays sticky.
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
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
  // PROGRESS SPINE CARD — 88px (116px active), inset 16, 12px radius,
  // 12px between stacked cards.
  cardOuter: {position: 'relative', marginInline: 16, marginBottom: 12},
  cardShell: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // 72px swipe-reveal Archive block behind the row content.
  archiveAction: {
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
    background: ERROR_STRONG,
    color: ERROR_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  cardContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  // 6px full-height spine at the card's left edge, radius 3; the read
  // fill rises bottom-up (height = readParas/totalParas).
  spine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
    borderRadius: 3,
    background: SPINE_TRACK,
    overflow: 'hidden',
  },
  spineFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: SPINE_FILL,
  },
  cardBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    padding: 16,
    paddingLeft: 18, // 6px spine + 12 — keeps text clear of the spine
  },
  cardBtnActive: {minHeight: 116},
  cardTitle: {fontSize: 16, fontWeight: 500, lineHeight: 1.25},
  cardTitleActive: {fontSize: 22, fontWeight: 700, lineHeight: 1.15},
  cardMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pipsRow: {display: 'flex', alignItems: 'center', gap: 6, minHeight: 12},
  pip: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  pipsLabel: {
    marginLeft: 2,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 11px/600 UP NEXT chip planted by the 'Read next' menu row.
  nextChip: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    border: \`1px solid \${BRAND_ACCENT}\`,
    borderRadius: 999,
    padding: '1px 7px',
    flexShrink: 0,
  },
  // Trailing 44×44 ellipsis — the mandatory visible path for the swipe
  // gesture; sits OUTSIDE the card button (sibling, never nested), with
  // ≥8px clearance from the pips row.
  ellipsisWrap: {
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 8,
    flexShrink: 0,
  },
  // Anchored menu z30 (below the sheet scrim's z40); 44px rows.
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    top: 52,
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // Invisible outside-tap catcher for open menus (z29, under the menu).
  clickCatcher: {position: 'absolute', inset: 0, zIndex: 29},
  terminalCaption: {
    margin: '4px 0 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // RESUME SCRUBBER BAR — 88px sticky bottom:64 z19, blur surface + top
  // hairline; row1 20px ticker, row2 44px controls.
  resumeBar: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 88,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingTop: 8,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  ticker: {
    height: 20,
    fontSize: 13,
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  scrubRow: {display: 'flex', alignItems: 'center', gap: 4},
  // 44px-tall hit area wrapping the 8px track (radius 999); role=slider.
  scrubHit: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    touchAction: 'none',
    position: 'relative',
  },
  scrubTrack: {
    position: 'relative',
    width: '100%',
    height: 8,
    borderRadius: 999,
    background: SPINE_TRACK,
  },
  scrubFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    background: SPINE_FILL,
  },
  // 28px thumb inside the 44px hit; centered on the progress edge.
  scrubThumb: {
    position: 'absolute',
    top: '50%',
    width: 28,
    height: 28,
    marginLeft: -14,
    transform: 'translateY(-50%)',
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: \`2px solid \${BRAND_ON}\`,
    boxShadow: '0 1px 4px var(--color-shadow)',
    pointerEvents: 'none',
  },
  // TOAST DOCK — sticky-in-flow height-0 anchor at bottom:156 (above
  // tabBar 64 + resumeBar 88 + 4), z18; shell-absolute is a scroll-lock-
  // only mode (see toastDockLocked). Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 156,
    zIndex: 18,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  // Stats/Settings tabs have no resumeBar — dock rides at 76 there.
  toastAnchorNoResume: {bottom: 76},
  // While the sheet scroll-lock is active the shell is 100dvh/hidden, so
  // sticky degrades to static — flip to shell-absolute per the amendment.
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 156,
    zIndex: 18,
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    maxWidth: 'calc(100% - 32px)',
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastStatic: {position: 'relative', maxWidth: '100%'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    minWidth: 44,
    alignSelf: 'stretch',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TAB BAR — 64px sticky bottom z20, blur + top hairline; 3 tabItems.
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
  // LIST CARD (stats/settings) — inset-grouped.
  listCard: {
    marginInline: 16,
    marginBottom: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
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
  },
  utilValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // WEEK CHART — 7 bars, 4px radius, brand fill, 11px day initials.
  chartCard: {padding: 16},
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 96,
  },
  barCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    height: '100%',
  },
  bar: {width: '100%', maxWidth: 28, borderRadius: 4, background: BRAND_ACCENT},
  barZero: {height: 3, background: SPINE_TRACK},
  dayInitial: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  chartCaption: {
    marginTop: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SETTINGS — whole 44px row is the switch button.
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    background: SWITCH_OFF_TRACK,
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
  switchThumbOn: {transform: 'translateX(20px)'},
  // SHEET — scrim z40 + planner z41, absolute inside shell.
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
  startBtn: {
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
  // SEGMENTED CONTROL — 36px muted track radius 12, active pill radius 10.
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: \`inset 0 0 0 1px \${BRAND_TINT_12}\`,
    color: 'var(--color-text-primary)',
  },
  // PACKED WINDOW BAR — 32px stacked horizontal blocks; width% =
  // blockMin/windowMin; first block 6px left radii, last 6px right,
  // middles 0 (one continuous packed bar, 2px gaps show card surface).
  packedBar: {
    display: 'flex',
    gap: 2,
    height: 32,
    marginTop: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  packedBlock: {
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 11,
    fontWeight: 600,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  legendRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  legendTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legendMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  partialTag: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    border: \`1px dashed \${BRAND_ACCENT}\`,
    borderRadius: 999,
    padding: '1px 7px',
    flexShrink: 0,
  },
  plannerCaption: {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts first; every duration is DERIVED from paragraph
// counts, never stored. WPM 200 · 100 words/para → 1 paragraph = 0.5 min;
// remainingMin(a) = (a.totalParas − a.readParas) / 2. CROSS-CHECK (verified
// by hand): 14+6+9+18+22+28+31+26+38 = 192 min = '3h 12m across 9 pieces'
// (the navBar total). Sections at rest: ALMOST DONE ≤10 → a2(6), a3(9) = 2
// cards; TONIGHT 11–25 → a1(14), a4(18), a5(22) = 3; LONGER SITS >25 →
// a8(26), a6(28), a7(31), a9(38) ascending = 4. 2+3+4 = 9 ✓. Pips
// ceil(remaining/12): a1 2 · a2 1 · a3 1 · a4 2 · a5 2 · a6 3 · a7 3 ·
// a8 3 · a9 4 (the 320px no-wrap stress). Fixed strings only — no
// Date.now().
// ---------------------------------------------------------------------------

const WPM = 200;
const WORDS_PER_PARA = 100; // → 0.5 min per paragraph at 200 wpm
const SESSION_MIN = 12; // one reading session ≈ 12 min → pips

interface Article {
  id: string;
  title: string;
  source: string;
  totalParas: number;
  readParas: number;
  addedLabel: string; // pre-computed relative string, never a clock read
}

const ARTICLES: Article[] = [
  {id: 'a1', title: 'The Quiet Economics of Repair', source: 'The Meridian', totalParas: 44, readParas: 16, addedLabel: 'Added Mon'},
  {id: 'a2', title: 'What Ferries Know About Waiting', source: 'Harbor', totalParas: 24, readParas: 12, addedLabel: 'Added Tue'},
  {id: 'a3', title: 'A Field Guide to Unfinished Books', source: 'Longhand', totalParas: 18, readParas: 0, addedLabel: 'Added Tue'},
  {id: 'a4', title: 'The Cartographers of Small Talk', source: 'Sift Weekly', totalParas: 60, readParas: 24, addedLabel: 'Added Wed'},
  {id: 'a5', title: 'Night Trains and the Case for Slowness', source: 'Slow Build', totalParas: 44, readParas: 0, addedLabel: 'Added Wed'},
  {id: 'a6', title: 'How Concrete Learned to Heal Itself', source: 'The Gradient Review', totalParas: 80, readParas: 24, addedLabel: 'Added Thu'},
  {id: 'a7', title: 'The Last Great Newspaper Morgue', source: 'Paper Trail', totalParas: 62, readParas: 0, addedLabel: 'Added Thu'},
  // a8's title + 'Field Notes Quarterly' source is the 320px two-line
  // clamp + meta-ellipsis stress (fixture 5).
  {id: 'a8', title: 'Weather Reports From the Deep Ocean', source: 'Field Notes Quarterly', totalParas: 52, readParas: 0, addedLabel: 'Added Fri'},
  {id: 'a9', title: 'An Oral History of the Dial Tone', source: 'Antenna', totalParas: 76, readParas: 0, addedLabel: 'Added Fri'},
];

const ARTICLE_ORDER = ARTICLES.map(article => article.id);

// a1's paragraph ticker — EXACTLY 44 authored first-clauses, indexed by
// paragraph (EXCERPTS[i] = ¶(i+1)). The scrubber streams these live.
const EXCERPTS: string[] = [
  '¶1 — The hinge failed on a Tuesday, the way hinges do',
  '¶2 — Nobody teaches you to listen for the second squeak',
  '¶3 — Repair begins as an argument with replacement',
  '¶4 — The warranty card was still in the drawer, unsigned',
  "¶5 — A city's hum is mostly things not yet broken",
  "¶6 — Ida ran the counter with a jeweler's patience",
  '¶7 — Every fix starts by naming what actually failed',
  '¶8 — The manual lied politely, the way manuals do',
  '¶9 — Screws strip because we hurry; so do afternoons',
  '¶10 — A part costs pennies until nobody stocks it',
  "¶11 — The distributor's catalog read like a eulogy",
  '¶12 — Planned obsolescence is a rumor with receipts',
  '¶13 — Glue is a promise; a bolt is a contract',
  '¶14 — The apprentice learned torque before arithmetic',
  '¶15 — What the spec sheet calls tolerance, hands call feel',
  "¶16 — The shop's ledger held forty years of small saves",
  '¶17 — The shop on Delancey kept a drawer of orphaned screws',
  '¶18 — Each orphan matched a machine that outlived its maker',
  "¶19 — Thrift is a skill the price tag can't see",
  "¶20 — The toaster's second life began with a paperclip",
  '¶21 — Economists count purchases, not resurrections',
  '¶22 — A repaired thing carries its scar like a signature',
  '¶23 — The landfill charges nothing up front, which is the trick',
  "¶24 — Ida's rule: never buy what you haven't opened",
  '¶25 — The right-to-repair hearing ran long past dinner',
  '¶26 — Lobbyists spoke of safety; the mechanics laughed once',
  '¶27 — A sealed case is a business model, not a design',
  '¶28 — The teardown video had two million quiet students',
  '¶29 — Somewhere a schematic is always going out of print',
  "¶30 — The co-op's tool library lent hope by the hour",
  '¶31 — Saturday mornings smelled of flux and burnt coffee',
  '¶32 — A stripped thread will forgive you exactly once',
  "¶33 — The insurance form had no box for 'mended'",
  '¶34 — Repair cafés run on cake and stubbornness',
  "¶35 — The boy brought a radio his grandfather couldn't",
  '¶36 — Half of fixing is holding still long enough to see',
  '¶37 — New is a feeling; working is a fact',
  '¶38 — The spreadsheet finally priced the drawer of screws',
  '¶39 — It came to less than one replacement hinge',
  '¶40 — What we keep repairs us back, Ida said, closing up',
  '¶41 — The Delancey lease renews in March, rent doubling',
  '¶42 — A neighborhood is a machine with replaceable parts',
  "¶43 — Except it isn't, and everyone on the block knows",
  '¶44 — The hinge holds; the argument, for now, is won',
];

// Stats tab — week bars sum 86 min = '1h 26m' (the This-week row derives
// from these, never a stored total): 12+18+9+22+14+11+0 = 86 ✓.
const WEEK_BARS = [
  {day: 'M', min: 12},
  {day: 'T', min: 18},
  {day: 'W', min: 9},
  {day: 'T', min: 22},
  {day: 'F', min: 14},
  {day: 'S', min: 11},
  {day: 'S', min: 0}, // zero-day renders a 3px SPINE_TRACK stub, not a gap
];
const STREAK_LABEL = '6 days';

type SettingId = 'cellular' | 'autoArchive' | 'serif' | 'digest';
const SETTING_ROWS: Array<{id: SettingId; label: string}> = [
  {id: 'cellular', label: 'Sync over cellular'},
  {id: 'autoArchive', label: 'Auto-archive finished pieces'},
  {id: 'serif', label: 'Serif reader font'},
  {id: 'digest', label: 'Nightly digest at 9 PM'},
];

// ---------------------------------------------------------------------------
// DERIVATIONS — pure, deterministic; aggregates are computed in render from
// the article rows, never stored.
// ---------------------------------------------------------------------------

/** remainingMin law: (totalParas − readParas) / 2 at 200 wpm · 100 w/para. */
function remainingMinOf(article: Article): number {
  return (article.totalParas - article.readParas) / (WPM / WORDS_PER_PARA);
}

/** Sessions-to-finish pips: ceil(remainingMin / 12). */
function sessionsOf(remainingMin: number): number {
  return Math.ceil(remainingMin / SESSION_MIN);
}

/** Minutes → '3h 12m' (zero-padded minutes so 184 → '3h 04m') or '48m'. */
function fmtTotal(min: number): string {
  if (min < 60) return \`\${min}m\`;
  return \`\${Math.floor(min / 60)}h \${String(min % 60).padStart(2, '0')}m\`;
}

type SectionId = 'almost' | 'tonight' | 'longer';

/**
 * Partition the live (non-archived) queue by remainingMin — ≤10 ALMOST
 * DONE · 11–25 TONIGHT · >25 LONGER SITS — each sorted ascending (fixture
 * order breaks ties). At rest: 2 / 3 / 4; after the a1 scrub-commit
 * (remaining 14→6) the same derivation yields 3 / 2 / 4 (stress 1).
 */
function sectionize(articles: Record<string, Article>, archived: string[]): Record<SectionId, Article[]> {
  const archivedSet = new Set(archived);
  const live = ARTICLE_ORDER.filter(id => !archivedSet.has(id)).map(id => articles[id]);
  const ascending = [...live].sort((a, b) => {
    const diff = remainingMinOf(a) - remainingMinOf(b);
    return diff !== 0 ? diff : ARTICLE_ORDER.indexOf(a.id) - ARTICLE_ORDER.indexOf(b.id);
  });
  return {
    almost: ascending.filter(article => remainingMinOf(article) <= 10),
    tonight: ascending.filter(article => remainingMinOf(article) > 10 && remainingMinOf(article) <= 25),
    longer: ascending.filter(article => remainingMinOf(article) > 25),
  };
}

interface PackedBlock {
  id: string;
  title: string;
  min: number;
  isPartial: boolean;
  ofMin: number; // full remaining minutes (partial blocks show '10 of 14')
}

/**
 * Deterministic greedy packer: whole pieces ascending by remainingMin,
 * then ONE trailing partial chunk to fill the window exactly. Verified
 * against the rest fixtures: 15-min → a2(6)+a3(9) = 15 exact, no partial;
 * 25-min → a2(6)+a3(9)+a1 partial 10 of 14 = 25 (widths 24%/36%/40%,
 * sums 100%); 40-min → a2(6)+a3(9)+a1(14)+a4 partial 11 of 18 = 40
 * (stress 3).
 */
function packWindow(windowMin: number, articles: Record<string, Article>, archived: string[]): PackedBlock[] {
  const archivedSet = new Set(archived);
  const candidates = ARTICLE_ORDER.filter(id => !archivedSet.has(id))
    .map(id => articles[id])
    .filter(article => remainingMinOf(article) > 0)
    .sort((a, b) => {
      const diff = remainingMinOf(a) - remainingMinOf(b);
      return diff !== 0 ? diff : ARTICLE_ORDER.indexOf(a.id) - ARTICLE_ORDER.indexOf(b.id);
    });
  const blocks: PackedBlock[] = [];
  let budget = windowMin;
  for (const article of candidates) {
    if (budget <= 0) break;
    const remaining = remainingMinOf(article);
    if (remaining <= budget) {
      blocks.push({id: article.id, title: article.title, min: remaining, isPartial: false, ofMin: remaining});
      budget -= remaining;
    } else {
      blocks.push({id: article.id, title: article.title, min: budget, isPartial: true, ofMin: remaining});
      budget = 0;
    }
  }
  return blocks;
}

/**
 * Ticker line for a paragraph position. a1 carries the authored EXCERPTS
 * (fixture plan); other actives fall back to a derived '¶N — title' line
 * (the spec authors excerpts for a1 only — noted, not a fixture change).
 */
function excerptAt(article: Article, para: number): string {
  if (para <= 0) return \`From the top — \${article.totalParas} paragraphs on the spool\`;
  if (article.id === 'a1') return EXCERPTS[Math.min(para, EXCERPTS.length) - 1];
  return \`¶\${para} — \${article.title}\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — the root component holds a single SpoolState; articles
// mutate ONLY through update(id, patch) (the scrubber commit, prev/next
// steps, and every menu action all route through it); UI facts live beside
// them and every aggregate (navBar total, section counts, pips, packing,
// week total) derives in render.
// ---------------------------------------------------------------------------

type TabId = 'queue' | 'stats' | 'settings';
type WindowMin = 15 | 25 | 40;

interface Toast {
  seq: number;
  msg: string;
  undo: {id: string; prevActiveId: string; prevNextUpId: string | null} | null;
}

interface SpoolState {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  articles: Record<string, Article>;
  archived: string[];
  activeId: string;
  nextUpId: string | null;
  scrubPreviewPara: number | null;
  plannerOpen: boolean;
  plannerDetent: 'medium' | 'large';
  windowMin: WindowMin;
  openSwipeId: string | null;
  menuForId: string | null;
  settings: Record<SettingId, boolean>;
  toast: Toast | null;
}

const INITIAL_STATE: SpoolState = {
  tab: 'queue',
  scrollByTab: {queue: 0, stats: 0, settings: 0},
  articles: Object.fromEntries(ARTICLES.map(article => [article.id, article])),
  archived: [],
  activeId: 'a1',
  nextUpId: null,
  scrubPreviewPara: null,
  plannerOpen: false,
  plannerDetent: 'medium',
  windowMin: 25,
  openSwipeId: null,
  menuForId: null,
  settings: {cellular: false, autoArchive: true, serif: true, digest: false},
  toast: null,
};

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

// Sheet focus trap — Tab cycles within; Escape handled at the page level.
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
// SPOOL MARK — 24px end-on spool: full rest-track ring (SPINE_TRACK, the
// amendment-checked pair — 3.15:1/3.7:1 vs the body surface) under a 270°
// wound-thread arc in BRAND_ACCENT (dasharray 42.4 of C = 2π·9 ≈ 56.5),
// 4px center dot in --color-text-primary (never var(--color-text)).
// ---------------------------------------------------------------------------

function SpoolMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke={SPINE_TRACK} strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={BRAND_ACCENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="42.4 56.5"
          transform="rotate(-90 12 12)"
        />
        <circle cx="12" cy="12" r="2" fill="var(--color-text-primary)" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SESSION PIPS — passive 6px dots at 6px gap (no hit area needed; the whole
// card is the button). Count = ceil(remainingMin/12); a9's 4 pips + '4
// sessions' label must not wrap at 320px (stress 4). Pips are brand-filled
// on the card: #0F766E vs #FFFFFF 6.0:1 · #5EEAD4 vs the dark card 12.4:1.
// ---------------------------------------------------------------------------

function SessionPips({remainingMin}: {remainingMin: number}) {
  const sessions = sessionsOf(remainingMin);
  if (sessions === 0) {
    return (
      <span style={styles.pipsRow}>
        <span style={styles.pipsLabel}>Finished — ready to archive</span>
      </span>
    );
  }
  return (
    <span style={styles.pipsRow}>
      {Array.from({length: sessions}, (_, index) => (
        <span key={index} style={styles.pip} aria-hidden />
      ))}
      <span style={styles.pipsLabel}>
        {sessions} {sessions === 1 ? 'session' : 'sessions'}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS SPINE CARD — 88px (116px active variant): 6px left spine fills
// bottom-up (readParas/totalParas), title 16/500 2-line clamp (22/700
// active), meta '14 min left · The Meridian', pips row. Swipe-to-reveal
// Archive (−72px ERROR_STRONG block) with the MANDATORY visible 44×44
// ellipsis fallback OUTSIDE the card button (sibling, never nested).
// ---------------------------------------------------------------------------

interface SpineCardProps {
  article: Article;
  isActive: boolean; // NOW READING variant (116px, 22/700)
  isNextUp: boolean;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onCardTap: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onMoveToTop: () => void;
  onReadNext: () => void;
  onArchive: () => void;
}

function ProgressSpineCard({
  article,
  isActive,
  isNextUp,
  isSwipeOpen,
  isMenuOpen,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onCardTap,
  onToggleMenu,
  onMoveToTop,
  onReadNext,
  onArchive,
}: SpineCardProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

  const remainingMin = remainingMinOf(article);
  const fillPct = (article.readParas / article.totalParas) * 100;

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

  return (
    <div style={styles.cardOuter}>
      <div style={styles.cardShell}>
        <button
          type="button"
          className="spl-btn"
          style={styles.archiveAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onArchive}>
          <Icon icon={ArchiveIcon} size="md" color="inherit" />
          Archive
        </button>
        <div
          style={{
            ...styles.cardContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          {/* Book-style vertical spine: rest track + bottom-up read fill.
              Contrast math at the SPINE_TRACK/SPINE_FILL declarations. */}
          <span style={styles.spine} aria-hidden>
            <span
              style={{...styles.spineFill, height: \`\${fillPct}%\`}}
              className={reducedMotion ? undefined : 'spl-fade'}
            />
          </span>
          <button
            type="button"
            className="spl-btn spl-focusable"
            style={{...styles.cardBtn, ...(isActive ? styles.cardBtnActive : null)}}
            aria-label={article.title}
            onClick={guardClick(() => onCardTap())}>
            <span
              className="spl-clamp2"
              style={isActive ? styles.cardTitleActive : styles.cardTitle}>
              {article.title}
            </span>
            <span style={styles.cardMeta}>
              {remainingMin === 0 ? 'Finished' : \`\${remainingMin} min left\`} · {article.source} · {article.addedLabel}
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
              <SessionPips remainingMin={remainingMin} />
              {isNextUp ? <span style={styles.nextChip}>UP NEXT</span> : null}
            </span>
          </button>
          <span style={styles.ellipsisWrap}>
            <button
              type="button"
              className="spl-btn spl-focusable"
              style={styles.iconBtn}
              aria-label={\`Actions for \${article.title}\`}
              aria-expanded={isMenuOpen}
              onClick={guardClick(onToggleMenu)}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          </span>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${article.title}\`}
          style={styles.anchoredMenu}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="spl-btn spl-focusable" style={styles.menuRow} onClick={onMoveToTop}>
            <Icon icon={ArrowUpIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Move to top</span>
          </button>
          <div style={styles.rowDivider} />
          <button type="button" role="menuitem" className="spl-btn spl-focusable" style={styles.menuRow} onClick={onReadNext}>
            <Icon icon={CornerDownRightIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Read next</span>
          </button>
          <div style={styles.rowDivider} />
          {/* Destructive LAST, --color-error text (ergonomics ranking a). */}
          <button
            type="button"
            role="menuitem"
            className="spl-btn spl-focusable"
            style={{...styles.menuRow, ...styles.menuRowDanger}}
            onClick={onArchive}>
            <Icon icon={ArchiveIcon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Archive</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RESUME SCRUBBER BAR — 88px sticky bottom:64 z19. Row 1: 20px italic
// excerpt ticker. Row 2: 44×44 prev · flex-1 slider (8px track, 28px thumb
// in the 44px hit) · 44×44 next. Pointer drag maps x → paragraph 0..total
// into scrubPreviewPara (nothing committed); pointerup commits through the
// SAME update(activeId, {readParas}) path the buttons and arrow keys use.
// ---------------------------------------------------------------------------

interface ResumeScrubberBarProps {
  article: Article;
  previewPara: number | null;
  onPreview: (para: number | null) => void;
  onCommit: (para: number) => void;
  onStep: (delta: number) => void;
}

function ResumeScrubberBar({article, previewPara, onPreview, onCommit, onStep}: ResumeScrubberBarProps) {
  const hitRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const shownPara = previewPara ?? article.readParas;
  const pct = (shownPara / article.totalParas) * 100;
  const ticker = excerptAt(article, shownPara);

  const paraFromClientX = (clientX: number): number => {
    const rect = hitRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return shownPara;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(article.totalParas, Math.round(ratio * article.totalParas)));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onPreview(paraFromClientX(event.clientX));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onPreview(paraFromClientX(event.clientX));
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onCommit(paraFromClientX(event.clientX));
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onStep(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onStep(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onCommit(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onCommit(article.totalParas);
    }
  };

  const atStart = shownPara <= 0;
  const atEnd = shownPara >= article.totalParas;
  return (
    <div style={styles.resumeBar}>
      <div style={styles.ticker} aria-hidden>
        {ticker}
      </div>
      <div style={styles.scrubRow}>
        <button
          type="button"
          className="spl-btn spl-focusable"
          style={{...styles.iconBtn, ...(atStart ? styles.iconBtnDisabled : null)}}
          aria-label="Previous paragraph"
          disabled={atStart}
          onClick={() => onStep(-1)}>
          <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
        </button>
        <div
          ref={hitRef}
          role="slider"
          tabIndex={0}
          className="spl-focusable"
          style={styles.scrubHit}
          aria-label={\`Reading position in \${article.title}\`}
          aria-valuemin={0}
          aria-valuemax={article.totalParas}
          aria-valuenow={shownPara}
          aria-valuetext={\`Paragraph \${shownPara} of \${article.totalParas} — \${ticker}\`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}>
          <div style={styles.scrubTrack}>
            <div style={{...styles.scrubFill, width: \`\${pct}%\`}} />
            <div style={{...styles.scrubThumb, left: \`\${pct}%\`}} />
          </div>
        </div>
        <button
          type="button"
          className="spl-btn spl-focusable"
          style={{...styles.iconBtn, ...(atEnd ? styles.iconBtnDisabled : null)}}
          aria-label="Next paragraph"
          disabled={atEnd}
          onClick={() => onStep(1)}>
          <Icon icon={ChevronRightIcon} size="md" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TONIGHT PLANNER SHEET — two detents (55% / calc(100% − 56px), navBar
// peeks 56px at large). Grabber is a real 'Resize sheet' button (click
// toggles detents; drag is garnish, >120px down past medium closes).
// Segments recompute the packing synchronously — the PackedWindowBar,
// legend, and footer label all derive from packWindow() in render.
// ---------------------------------------------------------------------------

interface PlannerSheetProps {
  detent: 'medium' | 'large';
  windowMin: WindowMin;
  blocks: PackedBlock[];
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onWindowChange: (windowMin: WindowMin) => void;
  onStart: () => void;
  onClose: () => void;
}

const WINDOW_OPTIONS: WindowMin[] = [15, 25, 40];

function TonightPlannerSheet({
  detent,
  windowMin,
  blocks,
  reducedMotion,
  sheetRef,
  onDetentChange,
  onWindowChange,
  onStart,
  onClose,
}: PlannerSheetProps) {
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
  const onSegKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = WINDOW_OPTIONS.indexOf(windowMin);
    const next =
      event.key === 'ArrowRight'
        ? WINDOW_OPTIONS[(index + 1) % WINDOW_OPTIONS.length]
        : WINDOW_OPTIONS[(index + WINDOW_OPTIONS.length - 1) % WINDOW_OPTIONS.length];
    onWindowChange(next);
    document.getElementById(\`spl-seg-\${next}\`)?.focus();
  };

  const packedMin = blocks.reduce((sum, block) => sum + block.min, 0);
  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spl-planner-title"
      tabIndex={-1}
      className="spl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="spl-btn spl-focusable"
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
        <h2 id="spl-planner-title" style={styles.sheetTitle}>
          Tonight Planner
        </h2>
        <button
          type="button"
          className="spl-btn spl-focusable"
          style={styles.iconBtn}
          aria-label="Close planner"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div role="radiogroup" aria-label="Reading window" style={styles.segTrack} onKeyDown={onSegKeyDown}>
          {WINDOW_OPTIONS.map(option => {
            const on = option === windowMin;
            return (
              <button
                key={option}
                id={\`spl-seg-\${option}\`}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                className="spl-btn spl-focusable"
                style={{...styles.segBtn, ...(on ? styles.segBtnOn : null)}}
                onClick={() => onWindowChange(option)}>
                {option} min
              </button>
            );
          })}
        </div>
        {/* PackedWindowBar — width% = blockMin/windowMin (25-min window:
            6/9/10 → 24%/36%/40%, sums 100%). First block 6px left radii,
            last 6px right, middles 0; partials get the 45° hatch. */}
        <div
          style={styles.packedBar}
          role="img"
          aria-label={\`\${windowMin}-minute window packed with \${blocks.length} pieces: \${blocks
            .map(block => \`\${block.title} \${block.isPartial ? \`\${block.min} of \${block.ofMin}\` : block.min} minutes\`)
            .join(', ')}\`}>
          {blocks.map((block, index) => {
            // First block 6px left radii, last 6px right, middles 0.
            const radius =
              blocks.length === 1
                ? '6px'
                : index === 0
                  ? '6px 0 0 6px'
                  : index === blocks.length - 1
                    ? '0 6px 6px 0'
                    : '0';
            return (
              <span
                key={block.id}
                style={{
                  ...styles.packedBlock,
                  width: \`\${(block.min / windowMin) * 100}%\`,
                  borderRadius: radius,
                  backgroundImage: block.isPartial ? HATCH_STRIPE : undefined,
                }}>
                {block.min}m
              </span>
            );
          })}
        </div>
        <div>
          {blocks.map(block => (
            <div key={block.id} style={styles.legendRow}>
              <span
                style={{...styles.legendSwatch, backgroundImage: block.isPartial ? HATCH_STRIPE : undefined}}
                aria-hidden
              />
              <span style={styles.legendTitle}>{block.title}</span>
              {block.isPartial ? <span style={styles.partialTag}>partial</span> : null}
              <span style={styles.legendMeta}>
                {block.isPartial ? \`\${block.min} of \${block.ofMin} min\` : \`\${block.min} min\`}
              </span>
            </div>
          ))}
        </div>
        <div style={styles.plannerCaption}>
          {packedMin} of {windowMin} min packed · whole pieces first, shortest to longest, one partial to fill
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="spl-btn spl-focusable" style={styles.startBtn} onClick={onStart}>
          Start session
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof BookMarkedIcon}> = [
  {id: 'queue', label: 'Queue', icon: BookMarkedIcon},
  {id: 'stats', label: 'Stats', icon: BarChart3Icon},
  {id: 'settings', label: 'Settings', icon: Settings2Icon},
];

export default function MobileLongreadQueueTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ONE STATE OWNER + the single article mutator.
  const [state, setState] = useState<SpoolState>(INITIAL_STATE);
  const update = useCallback((id: string, patch: Partial<Article>) => {
    setState(prev => ({...prev, articles: {...prev.articles, [id]: {...prev.articles[id], ...patch}}}));
  }, []);
  const patchUi = useCallback((patch: Partial<SpoolState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const moonBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — every aggregate computes from the rows, never stored.
  const archivedSet = new Set(state.archived);
  const liveIds = ARTICLE_ORDER.filter(id => !archivedSet.has(id));
  const totalRemaining = liveIds.reduce((sum, id) => sum + remainingMinOf(state.articles[id]), 0);
  const pieceCount = liveIds.length;
  const sections = sectionize(state.articles, state.archived);
  const blocks = packWindow(state.windowMin, state.articles, state.archived);
  const weekSum = WEEK_BARS.reduce((sum, bar) => sum + bar.min, 0); // 86
  const active = archivedSet.has(state.activeId) ? null : state.articles[state.activeId] ?? null;
  // navBar total — '3h 12m across 9 pieces' at rest; 184 → '3h 04m' after
  // the scrub commit; 183 → '3h 03m across 8 pieces' after archiving a3.
  const navTotal = \`\${fmtTotal(totalRemaining)} across \${pieceCount} \${pieceCount === 1 ? 'piece' : 'pieces'}\`;

  const makeToast = (msg: string, undo: Toast['undo'] = null): Toast => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };

  // Demo-page scroller (the shell does NOT own scroll) — nearest scrollable
  // ancestor of the wrapper, falling back to the document.
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

  // PER-TAB STATE PERSISTENCE — scroll saved on exit, restored on entry;
  // open overlays close (they belong to their moment); re-tapping the
  // active tab scrolls to top (the one legal reset).
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setState(prev => ({
      ...prev,
      tab: next,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      plannerOpen: false,
      plannerDetent: 'medium',
      openSwipeId: null,
      menuForId: null,
      scrubPreviewPara: null,
    }));
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const current = order.indexOf(state.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(\`spl-tab-\${next}\`)?.focus();
  };

  // PLANNER LIFECYCLE — focus({preventScroll: true}) into the sheet on
  // open (plain .focus() scroll-reveals the animating sheet inside the
  // locked overflow-hidden column — foundations amendment); restore to the
  // Moon button on every close path (X, scrim, Escape, Start session).
  const openPlanner = () => {
    patchUi({plannerOpen: true, plannerDetent: 'medium', openSwipeId: null, menuForId: null});
  };
  const closePlanner = () => {
    patchUi({plannerOpen: false, plannerDetent: 'medium'});
    moonBtnRef.current?.focus();
  };
  useEffect(() => {
    if (state.plannerOpen) sheetRef.current?.focus({preventScroll: true});
  }, [state.plannerOpen]);
  useEffect(() => {
    if (state.menuForId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.menuForId]);

  const closeMenu = () => {
    patchUi({menuForId: null});
    menuOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST layer only: anchored menu > planner sheet >
  // open swipe row.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menuForId != null) closeMenu();
      else if (state.plannerOpen) closePlanner();
      else if (state.openSwipeId != null) patchUi({openSwipeId: null});
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.menuForId, state.plannerOpen, state.openSwipeId]);

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // (1) SCRUB COMMIT — one readParas write; the spine %, meta minutes,
  // pips, navBar total, and section membership all re-derive (2/3/4 →
  // 3/2/4 when a1 lands at 32 of 44).
  const commitScrub = (para: number) => {
    if (active == null) return;
    setState(prev => ({
      ...prev,
      articles: {...prev.articles, [active.id]: {...prev.articles[active.id], readParas: para}},
      scrubPreviewPara: null,
    }));
  };
  const stepPara = (delta: number) => {
    if (active == null) return;
    const next = Math.max(0, Math.min(active.totalParas, active.readParas + delta));
    update(active.id, {readParas: next});
  };

  // (2) ARCHIVE — undoOverConfirm: executes immediately, Undo restores the
  // exact prior state (list position is derived, so un-archiving restores
  // it by law). Archiving a3 recomputes 192−9 = 183 → '3h 03m across 8
  // pieces' (stress 2). One toast at a time; a new mutation replaces it.
  const archiveArticle = (id: string) => {
    setState(prev => {
      const undo = {id, prevActiveId: prev.activeId, prevNextUpId: prev.nextUpId};
      const archived = [...prev.archived, id];
      const stillLive = ARTICLE_ORDER.filter(articleId => !archived.includes(articleId));
      const nextActive =
        prev.activeId === id
          ? [...stillLive].sort((a, b) => remainingMinOf(prev.articles[a]) - remainingMinOf(prev.articles[b]))[0] ?? ''
          : prev.activeId;
      return {
        ...prev,
        archived,
        activeId: nextActive,
        nextUpId: prev.nextUpId === id ? null : prev.nextUpId,
        openSwipeId: null,
        menuForId: null,
        toast: makeToast(\`Archived · \${prev.articles[id].title}\`, undo),
      };
    });
  };
  const undoArchive = () => {
    setState(prev => {
      if (prev.toast?.undo == null) return prev;
      const {id, prevActiveId, prevNextUpId} = prev.toast.undo;
      return {
        ...prev,
        archived: prev.archived.filter(articleId => articleId !== id),
        activeId: prevActiveId,
        nextUpId: prevNextUpId,
        toast: makeToast('Restored'),
      };
    });
  };

  // (3) REFRESH — explicit navBar button, fixed post-refresh string, no
  // clock reads. No skeleton theater: skeletons are omitted entirely
  // (the spec sanctions omission when no demonstrable loading state
  // exists), so no shimmer needs a reduced-motion guard.
  const refresh = () => patchUi({toast: makeToast('Updated just now')});

  // (4) PLANNER COMMIT — 'Start session' promotes the first packed block
  // to NOW READING and announces through the one live region.
  const startSession = () => {
    const first = blocks[0];
    setState(prev => ({
      ...prev,
      plannerOpen: false,
      plannerDetent: 'medium',
      activeId: first != null ? first.id : prev.activeId,
      nextUpId: blocks.length > 1 && blocks[1] != null ? blocks[1].id : prev.nextUpId,
      toast: makeToast(\`Planned \${prev.windowMin} min · \${blocks.length} \${blocks.length === 1 ? 'piece' : 'pieces'}\`),
    }));
    moonBtnRef.current?.focus();
  };

  // (5) MENU VERBS — Move to top = becomes NOW READING; Read next plants
  // the UP NEXT chip; both observable without a toast.
  const moveToTop = (id: string) => {
    setState(prev => ({
      ...prev,
      activeId: id,
      nextUpId: prev.nextUpId === id ? null : prev.nextUpId,
      menuForId: null,
      openSwipeId: null,
    }));
    menuOpenerRef.current?.focus();
  };
  const readNext = (id: string) => {
    setState(prev => ({
      ...prev,
      nextUpId: id === prev.activeId ? prev.nextUpId : id,
      menuForId: null,
      openSwipeId: null,
    }));
    menuOpenerRef.current?.focus();
  };

  const cardHandlers = (article: Article, instanceKey: string) => ({
    isSwipeOpen: state.openSwipeId === instanceKey,
    isMenuOpen: state.menuForId === instanceKey,
    reducedMotion,
    menuRef,
    onSwipeOpen: () => patchUi({openSwipeId: instanceKey, menuForId: null}),
    onSwipeClose: () => {
      if (state.openSwipeId === instanceKey) patchUi({openSwipeId: null});
    },
    onCardTap: () => {
      if (state.openSwipeId != null) {
        patchUi({openSwipeId: null});
        return;
      }
      moveToTop(article.id);
    },
    onToggleMenu: (opener: HTMLElement) => {
      menuOpenerRef.current = opener;
      patchUi({menuForId: state.menuForId === instanceKey ? null : instanceKey, openSwipeId: null});
    },
    onMoveToTop: () => moveToTop(article.id),
    onReadNext: () => readNext(article.id),
    onArchive: () => archiveArticle(article.id),
  });

  const renderSection = (title: string, list: Article[], keyPrefix: string) =>
    list.length === 0 ? null : (
      <section key={keyPrefix}>
        <h2 style={styles.sectionHeader}>
          {title} · {list.length}
        </h2>
        {list.map(article => (
          <ProgressSpineCard
            key={\`\${keyPrefix}:\${article.id}\`}
            article={article}
            isActive={false}
            isNextUp={state.nextUpId === article.id}
            {...cardHandlers(article, \`\${keyPrefix}:\${article.id}\`)}
          />
        ))}
      </section>
    );

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.plannerOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SPOOL_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SpoolMark />
          </div>
          <div style={styles.navTitle} aria-label={\`Queue total: \${navTotal}\`}>
            {navTotal}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="spl-btn spl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh queue"
              onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
            <button
              type="button"
              ref={moonBtnRef}
              className="spl-btn spl-focusable"
              style={styles.iconBtn}
              aria-label="Open Tonight Planner"
              aria-expanded={state.plannerOpen}
              onClick={openPlanner}>
              <Icon icon={MoonIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'queue' ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Your queue</h1>
              </div>
              {active != null ? (
                <section>
                  <h2 style={styles.sectionHeader}>Now reading</h2>
                  <ProgressSpineCard
                    article={active}
                    isActive
                    isNextUp={false}
                    {...cardHandlers(active, \`now:\${active.id}\`)}
                  />
                </section>
              ) : null}
              {renderSection('Almost done — under 10 min', sections.almost, 'almost')}
              {renderSection('Tonight — 11–25 min', sections.tonight, 'tonight')}
              {renderSection('Longer sits', sections.longer, 'longer')}
              {/* Terminal count caption (listExtras convention) — derives
                  with the navBar total: '8 pieces · 3h 03m' after archive. */}
              <div style={styles.terminalCaption}>
                {pieceCount === 0
                  ? 'The spool is empty — everything archived'
                  : \`\${pieceCount} \${pieceCount === 1 ? 'piece' : 'pieces'} · \${fmtTotal(totalRemaining)} on the spool\`}
              </div>
            </>
          ) : null}

          {state.tab === 'stats' ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Stats</h1>
              </div>
              <h2 style={styles.sectionHeader}>Reading</h2>
              <div style={styles.listCard}>
                <div style={styles.utilRow}>
                  <span style={styles.utilLabel}>Reading speed</span>
                  <span style={styles.utilValue}>{WPM} wpm</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.utilRow}>
                  <span style={styles.utilLabel}>This week</span>
                  <span style={styles.utilValue}>{fmtTotal(weekSum)}</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.utilRow}>
                  <span style={styles.utilLabel}>Streak</span>
                  <span style={styles.utilValue}>{STREAK_LABEL}</span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>This week · {weekSum} min</h2>
              <div style={{...styles.listCard, ...styles.chartCard}}>
                <div
                  style={styles.chartBars}
                  role="img"
                  aria-label={\`Reading minutes this week: \${WEEK_BARS.map(bar => \`\${bar.min}\`).join(', ')} — total \${weekSum} minutes\`}>
                  {WEEK_BARS.map((bar, index) => (
                    <div key={index} style={styles.barCol}>
                      <span
                        style={{
                          ...styles.bar,
                          height: (bar.min / 22) * 72,
                          ...(bar.min === 0 ? styles.barZero : null),
                        }}
                        aria-hidden
                      />
                      <span style={styles.dayInitial}>{bar.day}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.chartCaption}>
                  {weekSum} min read = {fmtTotal(weekSum)} · best day Thu · 22 min
                </div>
              </div>
            </>
          ) : null}

          {state.tab === 'settings' ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Settings</h1>
              </div>
              <h2 style={styles.sectionHeader}>Reader</h2>
              <div style={styles.listCard}>
                {SETTING_ROWS.map((row, index) => {
                  const on = state.settings[row.id];
                  return (
                    <div key={row.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      {/* Whole 44px row IS the switch (inputControls). */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        className="spl-btn spl-focusable"
                        style={styles.utilRow}
                        onClick={() =>
                          patchUi({settings: {...state.settings, [row.id]: !on}})
                        }>
                        <span style={styles.utilLabel}>{row.label}</span>
                        <span style={{...styles.switchTrack, ...(on ? styles.switchTrackOn : null)}} aria-hidden>
                          <span
                            className={reducedMotion ? undefined : 'spl-anim'}
                            style={{...styles.switchThumb, ...(on ? styles.switchThumbOn : null)}}
                          />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </main>

        {state.tab === 'queue' && active != null ? (
          <ResumeScrubberBar
            article={active}
            previewPara={state.scrubPreviewPara}
            onPreview={para => patchUi({scrubPreviewPara: para})}
            onCommit={commitScrub}
            onStep={stepPara}
          />
        ) : null}

        {/* THE one polite live region — sticky-in-flow height-0 dock at
            bottom:156 (76 without the resumeBar), flipping to
            shell-absolute ONLY while the sheet scroll-lock is active
            (foundations amendment: absolute pins to the DOCUMENT bottom
            on tall scrolling views). Always mounted; no auto-dismiss
            timers — Undo persists until replaced. */}
        <div
          aria-live="polite"
          style={
            state.plannerOpen
              ? styles.toastDockLocked
              : {
                  ...styles.toastAnchor,
                  ...(state.tab !== 'queue' || active == null ? styles.toastAnchorNoResume : null),
                }
          }>
          {state.toast != null ? (
            <div
              key={state.toast.seq}
              role="status"
              className="spl-fade"
              style={{...styles.toast, ...(state.plannerOpen ? styles.toastStatic : null)}}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button type="button" className="spl-btn spl-focusable" style={styles.undoBtn} onClick={undoArchive}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Spool sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const isOn = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`spl-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isOn}
                tabIndex={isOn ? 0 : -1}
                className="spl-btn spl-focusable"
                style={{...styles.tabItem, ...(isOn ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(isOn ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Outside-tap catcher for open card menus (z29, under the z30
            menu; menus also close on Escape). */}
        {state.menuForId != null ? (
          <div style={styles.clickCatcher} onClick={closeMenu} aria-hidden />
        ) : null}

        {state.plannerOpen ? (
          <>
            <div style={styles.sheetScrim} onClick={closePlanner} aria-hidden />
            <TonightPlannerSheet
              detent={state.plannerDetent}
              windowMin={state.windowMin}
              blocks={blocks}
              reducedMotion={reducedMotion}
              sheetRef={sheetRef}
              onDetentChange={detent => patchUi({plannerDetent: detent})}
              onWindowChange={windowMin => patchUi({windowMin})}
              onStart={startSession}
              onClose={closePlanner}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};