// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Venn's mutual-window scheduling
 *   surface for Sam Ito and match Jordan Avery, frozen at the suite's
 *   internal today (Thu Jul 9, 2026; week 1 = Jul 6–12, week 2 =
 *   Jul 13–19). Slots keyed 'w1-thu-19' (week-day-hour24, hours 17..22,
 *   six 60-min evening slots 5p–11p). Jordan week-1 hatch fixture:
 *   Mon 18–21 (3) + Tue 0 + Wed 17–20 (3) + Thu 18–21 (3) + Fri 19–23 (4)
 *   + Sat 17–23 (6) + Sun 18–20 (2) = 21 cells. My week-1 paint: Mon
 *   19–21 (2) + Tue 18–20 (2) + Fri 20–22 (2) + Sun 21–22 (1) = 7 cells.
 *   Derived week-1 intersections: Mon 7–9p (2 cells) + Fri 8–10p (2
 *   cells) = exactly 2 windows / 4 lens cells / 4 shared hours; Tue is
 *   solid-only (their Tue empty) and Sun 9–10p vs their 6–8p is the
 *   near-miss (hatch + solid share a column, zero lens). Week 2: their 16
 *   cells vs my Sat 19–21 (2) = 1 window (Sat 7–9p · 2h). No Date.now(),
 *   no Math.random(), no network media — avatars are id-derived hue
 *   gradients, the brand mark is inline SVG.
 * @output Venn — Mutual Window Finder: a 390px MOBILE dating-app
 *   scheduling surface. Windows tab (default): 52px navBar (VennLensMark
 *   · 180×36 This-week/Next radiogroup pager · 44×44 'Edit as list'
 *   ListIcon), 48px sticky OverlapStrip of derived shared-window pills,
 *   the DualLayerGrid (36px time gutter + 7 flex day columns × six 44px
 *   slot rows; mine = solid stratum, Jordan = 45° hatch, both = glowing
 *   BRAND lens cell), a 32px legend, the shared-windows row list ('2 this
 *   week · 1 next week'), and a sticky 'Propose a time (2)' footer above
 *   the 64px tabBar. Signature move: painting a stroke across Jordan's
 *   hatched Thursday blooms lens cells mid-drag, inserts the 'Thu 7–9p ·
 *   2h' pill, ticks the Windows badge 2→3 on release, and re-labels the
 *   footer — one myCells Set re-derives strip, badge, list, and the
 *   propose sheet's slot radios. Sending a proposal stamps the grid,
 *   greys the 90-min buffer, collapses the consumed pill, flips Jordan's
 *   chat preview, and toasts 'Proposal sent · Undo'. Match tab = 2 snap
 *   cards with computed mutual-window chips; Chats = 72px rows + pushed
 *   thread screen (Mute/Unmatch menu, refresh-driven skeletons); Me =
 *   profile + 3 switch rows.
 * @position Page template; emitted by `astryx template mobile-mutual-window-finder`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet,
 *   anchored menus, toast) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While the propose sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and the toastDock
 *   switches from sticky-in-flow to absolute bottom:76. The stage clips
 *   to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); Chats is
 *   the one full-bleed conversation list. No desktop Layout frames, no
 *   side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Venn violet — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule). All
 *   grid strata, pills, and lens text are light-dark() pairs with
 *   contrast math at each declaration; hairline tokens are reserved for
 *   passive separators — interactive boundaries (switch tracks, radio
 *   rings) use the explicit ≥3:1 CONTROL_BOUNDARY pair per the mobile
 *   amendments.
 * Density grid (MOBILE, repeated verbatim): 16px screen inset · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top:0 z20 (paddingInline 8; 28px VennLensMark in a 44×44 slot;
 *   center pager 180×36, radiogroup + arrow keys; trailing 44×44
 *   ListIcon aria-pressed); OverlapStrip 48px sticky top:52 z19 (32px
 *   pills in 44px hits, 8px gaps, scroll-snap x proximity); grid 36px
 *   gutter + 7 day cols (358px content = 36 + 7×46 at 390) · 24px
 *   day-initial header (11px/600, today in BRAND) · 6 slot rows × 44px =
 *   264px body · 32px legend; rows 44px utility (Me) / 60px two-line
 *   (Windows list, sheet radios) / 72px media (Chats, 40px avatar);
 *   sectionHeader 13px/600 uppercase 0.06em at 32px inset; sticky
 *   proposeFooter 48px brand button, sticky bottom:64 z19; toastDock
 *   sticky bottom:76 z30 in flow (absolute bottom:76 during sheet lock);
 *   tabBar 64px sticky bottom:0 z20, badge = 16px-min brand pill
 *   10px/600 offset top:-4 right:-8; sheet detents 55% / calc(100% −
 *   56px), 24px grabber zone with 36×5 pill button, 52px sheet header.
 *   TYPE (Figtree via --font-family-body): 17/600 nav + sheet titles ·
 *   16/400–500 body & row primary · 13/400 secondary · 11/500–600
 *   overlines, gutter labels, tab labels, badges; nothing under 11px;
 *   tabular-nums on every counting numeral. Touch: every target ≥44×44
 *   with ≥8px clearance or merged full-row; every gesture (paint stroke,
 *   sheet drag, long-press stamp, carousel swipe) has a visible button
 *   path (list editor switch rows, clickable grabber + X, the stamp's
 *   own menu button, real dot buttons).
 *
 * Responsive contract:
 * - No width literals. Grid: time gutter fixed 36px, day columns flex
 *   within a maxWidth 430 container — at 320px stage: (320 − 32 − 36)/7
 *   = 36px cells (44px tall; adjacent-merged grid legal per datePanel
 *   precedent — arrow keys + the list editor are the guaranteed paths);
 *   at 390: 46px; at 430: ≈51.7px. No horizontal overflow at any width;
 *   overflowX:'clip' on shell is backstop only. OverlapStrip and the
 *   Match carousel scroll inside their own rails (scrollPaddingInline
 *   16, ≥24px peek); pills never wrap. ProposalStamp tracks its column
 *   via left: calc(36px + colIndex × ((100% − 36px)/7)).
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes the
 *   standard centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). Nothing else adapts.
 *
 * BADGE ARITHMETIC AUDIT (stress fixture 7, cross-checked by hand):
 *   21 their + 7 mine → 4 lens cells → 2 windows (badge '2', footer
 *   'Propose a time (2)'). After painting Thu 7–10p: 10 mine → 6 lens
 *   cells → 3 windows (badge 3, footer '(3)'; Thu 21 stays solid-only —
 *   their Thu ends at 21). After accepting Thu 7–9p: 2 windows + 1 stamp
 *   (buffer 5:30–10:30 greys Thu 17/18/21/22 → 4 greyed + 2 stamped = 6
 *   = the full Thu column). Windows-tab badge counts THIS WEEK only;
 *   the Windows list rows always = thisWeekWindows + nextWeekWindows
 *   (2 + 1 = 3 rows at rest).
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
  BellOffIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleUserIcon,
  HeartIcon,
  ListIcon,
  MapPinIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchXIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Venn violet). #7C3AED on #FFFFFF ≈ 5.7:1
// (passes 4.5:1); #A78BFA on the dark card (~#1C1C1E) ≈ 7.9:1.
const BRAND_ACCENT = 'light-dark(#7C3AED, #A78BFA)';
// Text/glyphs over a BRAND_ACCENT fill (lens cells, badges, CTA). Light:
// #FFFFFF on #7C3AED ≈ 5.7:1. Dark: white on #A78BFA fails (~1.6:1), so
// the dark side flips to deep violet — #221548 on #A78BFA ≈ 7.8:1.
const LENS_TEXT = 'light-dark(#FFFFFF, #221548)';
// MINE solid stratum — meaningful rest fill per spec, read WITH its 1px
// cell hairline; the lens + hatch strata carry the ≥3:1 duty.
const MINE_FILL = 'light-dark(rgba(124, 58, 237, 0.20), rgba(167, 139, 250, 0.26))';
// THEIR hatch stripes — meaningful rest fill, NOT hairline-muted:
// #7C3AED@45% composited over #FFF ≈ #B99AF5 → 3.2:1 stripe edges vs the
// white card (≥3:1 amendment satisfied); dark: #A78BFA@50% over #1C1C1E
// ≈ #62557F → ≥3:1 vs the dark card.
const HATCH_STRIPE = 'light-dark(rgba(124, 58, 237, 0.45), rgba(167, 139, 250, 0.5))';
// Brand-tinted pill/chip wash (12/18%) — always paired with a 1px
// BRAND_ACCENT border so the boundary, not the wash, carries contrast.
const PILL_TINT = 'light-dark(rgba(124, 58, 237, 0.12), rgba(167, 139, 250, 0.18))';
// Interactive control boundaries at rest (switch OFF tracks, radio
// rings) — mobile amendment: ≥3:1 vs their ACTUAL surface, hairlines are
// for passive separators only. #6E6A75 on #FFF ≈ 5.0:1 and on the muted
// wash ≥4.2:1; #9BA0AB on #1C1C1E ≈ 7.2:1.
const CONTROL_BOUNDARY = 'light-dark(#6E6A75, #9BA0AB)';
// Switch OFF track fill (boundary above supplies the 3:1 edge).
const TRACK_OFF = 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))';
// Lens glow ring — inner keyline + 12px halo on 'both' cells.
const LENS_RING = 'light-dark(rgba(255, 255, 255, 0.75), rgba(34, 21, 72, 0.55))';
const LENS_GLOW = 'color-mix(in srgb, ' + '#7C3AED' + ' 45%, transparent)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Switch thumb — white in both schemes per the inputControls contract.
const THUMB_WHITE = '#FFFFFF';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// lens bloom / pill insert / paint wake animations, reduced-motion guard.
// Transitions animate transform/opacity/color only.
// ---------------------------------------------------------------------------

const VENN_CSS = `
.vnn-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.vnn-btn:disabled { cursor: default; }
.vnn-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.vnn-anim { transition: transform 200ms ease, opacity 200ms ease; }
.vnn-fade { transition: opacity 160ms ease; }
@keyframes vnn-bloom {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.vnn-bloom { animation: vnn-bloom 200ms ease; }
@keyframes vnn-pill-in {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.vnn-pill-in { animation: vnn-pill-in 160ms ease; }
@keyframes vnn-wake {
  from { opacity: 0.45; }
  to { opacity: 1; }
}
.vnn-wake { animation: vnn-wake 120ms ease; }
@keyframes vnn-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.vnn-sheet-in { animation: vnn-sheet-in 240ms ease; }
.vnn-vh {
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
  .vnn-anim, .vnn-fade { transition: none; }
  .vnn-bloom, .vnn-pill-in, .vnn-wake, .vnn-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; hairline + blur always on (noted per
  // contract; scroll-under is not wired).
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
  navLeading: {display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', alignItems: 'center', justifyContent: 'flex-end'},
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
  iconBtnPressed: {color: BRAND_ACCENT, background: PILL_TINT},
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Segmented week pager — 180×36 track, 2 segments, radiogroup.
  pager: {
    width: 180,
    maxWidth: 200,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    borderRadius: 'var(--radius-element, 12px)',
    background: 'var(--color-background-muted)',
  },
  pagerSeg: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pagerSegOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // OVERLAP STRIP — 48px sticky top:52 z19, same blur surface.
  strip: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 48,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  stripRail: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
    paddingInline: 16,
  },
  // Pill = 32px visual inside a 44px-tall padded hit.
  stripPillHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    borderRadius: 999,
  },
  stripPill: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: PILL_TINT,
    border: `1px solid ${BRAND_ACCENT}`,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  stripEmpty: {
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // GRID SECTION — 16px inset, maxWidth 430 rail.
  gridSection: {paddingInline: 16, marginTop: 12},
  gridRail: {maxWidth: 430, marginInline: 'auto'},
  dayHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '36px repeat(7, 1fr)',
    height: 24,
    alignItems: 'center',
  },
  dayInitial: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  dayInitialToday: {color: BRAND_ACCENT},
  gridBody: {position: 'relative', touchAction: 'none'},
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '36px repeat(7, 1fr)',
    height: 44,
  },
  gutterCell: {
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    textAlign: 'right',
    paddingInlineEnd: 6,
    alignSelf: 'center',
  },
  // Adjacent-merged 44px gridcell buttons (datePanel precedent); the 1px
  // hairline is the PASSIVE grid line — state is carried by the strata
  // fills, never by the hairline (mobile amendment).
  cell: {
    position: 'relative',
    height: 44,
    minWidth: 0,
    background: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 0.5px var(--color-border)',
    display: 'grid',
    placeItems: 'center',
  },
  cellLens: {
    background: BRAND_ACCENT,
    boxShadow: `inset 0 0 0 2px ${LENS_RING}, 0 0 12px ${LENS_GLOW}`,
    zIndex: 1,
  },
  cellBuffered: {opacity: 0.4},
  lensGlyph: {color: LENS_TEXT, display: 'grid', placeItems: 'center'},
  // LEGEND — 32px row, three 12px swatches + 13px labels, 16px gaps.
  legendRow: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
    marginTop: 4,
  },
  legendItem: {display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)'},
  swatch: {width: 12, height: 12, borderRadius: 3, flexShrink: 0},
  // SECTION HEADERS + listCards.
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
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowDividerFull: {height: 1, background: 'var(--color-border)'},
  // 60px two-line window rows.
  windowRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  windowRowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
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
  rowChevron: {color: 'var(--color-text-secondary)', flexShrink: 0, display: 'grid', placeItems: 'center'},
  // PROPOSE FOOTER — sticky bottom:64 z19, sits on the tabBar.
  proposeFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  proposeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: LENS_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST DOCK — sticky-in-flow (height 0) at bottom:76 z30; switches to
  // absolute during sheet scroll-lock (shell no longer scrolls, so the
  // sticky anchor would freeze at the document bottom).
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 0,
    bottom: 76,
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
    paddingInlineStart: 16,
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
    paddingInlineEnd: 12,
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // TAB BAR — 64px sticky bottom z20.
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
  tabItemOn: {color: BRAND_ACCENT},
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
    color: LENS_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelOn: {fontWeight: 600},
  // MATCH TAB — snap carousel, 320px cards, 24px peek, real dot buttons.
  carousel: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBlock: 12,
  },
  matchCard: {
    flexShrink: 0,
    width: 320,
    maxWidth: 'calc(100% - 24px)',
    scrollSnapAlign: 'start',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  matchHero: {
    height: 120,
    display: 'flex',
    alignItems: 'flex-end',
    padding: 16,
  },
  matchAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0,0,0,0.35)',
    flexShrink: 0,
  },
  matchBody: {padding: 16, display: 'flex', flexDirection: 'column', gap: 12},
  matchName: {fontSize: 17, fontWeight: 600, margin: 0},
  matchTagline: {fontSize: 13, color: 'var(--color-text-secondary)'},
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  chip: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  mutualChip: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: PILL_TINT,
    border: `1px solid ${BRAND_ACCENT}`,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  dotRow: {display: 'flex', justifyContent: 'center'},
  dotBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  dot: {width: 8, height: 8, borderRadius: '50%', background: CONTROL_BOUNDARY},
  dotOn: {background: BRAND_ACCENT},
  // CHATS — full-bleed 72px media rows, full-width hairlines.
  chatRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  avatar40: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0,0,0,0.35)',
    flexShrink: 0,
  },
  chatText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  chatMetaCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  chatWhen: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  unreadDot: {width: 10, height: 10, borderRadius: '50%', background: BRAND_ACCENT},
  updatedCaption: {
    paddingInline: 16,
    paddingBlock: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // Skeletons — 72px geometry matching the chat rows they impersonate
  // (spec said 60px; foundations' zero-layout-shift law wins — noted as
  // deviation in the final summary).
  skelRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelAvatar: {width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background-muted)', flexShrink: 0},
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // THREAD SCREEN — bubbles + composer.
  threadScroll: {flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 16},
  bubbleThem: {
    alignSelf: 'flex-start',
    maxWidth: '78%',
    padding: '10px 14px',
    borderRadius: '16px 16px 16px 4px',
    background: 'var(--color-background-muted)',
    fontSize: 16,
    lineHeight: 1.35,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    padding: '10px 14px',
    borderRadius: '16px 16px 4px 16px',
    background: BRAND_ACCENT,
    color: LENS_TEXT,
    fontSize: 16,
    lineHeight: 1.35,
  },
  bubbleWhen: {
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    paddingBlock: 4,
  },
  composer: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    display: 'flex',
    gap: 8,
    padding: 12,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  composerInput: {
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
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: LENS_TEXT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // ME TAB — 104px profile header + 44px switch rows.
  profileHeader: {
    height: 104,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 24,
    fontWeight: 700,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0,0,0,0.35)',
    flexShrink: 0,
  },
  profileName: {fontSize: 22, fontWeight: 700, margin: 0},
  profileMeta: {fontSize: 13, color: 'var(--color-text-secondary)'},
  switchRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  switchLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    background: TRACK_OFF,
    border: `1px solid ${CONTROL_BOUNDARY}`,
    position: 'relative',
    flexShrink: 0,
  },
  switchTrackOn: {background: BRAND_ACCENT, border: `1px solid ${BRAND_ACCENT}`},
  switchThumb: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: THUMB_WHITE,
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
  },
  switchThumbOn: {transform: 'translateX(20px)'},
  hatchDot: {width: 12, height: 12, borderRadius: 3, flexShrink: 0},
  // EVENING LIST EDITOR — 44px whole-row switches.
  listEditorSection: {marginBottom: 12},
  // PROPOSAL STAMP — absolute in gridBody, spans its window's cells.
  stamp: {
    position: 'absolute',
    zIndex: 2,
    background: 'var(--color-background-card)',
    border: `2px solid ${BRAND_ACCENT}`,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  stampCheck: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: LENS_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  stampTime: {fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  stampVenue: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // ANCHORED MENUS — absolute cards, z35 (above toast, below scrim z40).
  anchoredMenu: {
    position: 'absolute',
    zIndex: 35,
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
  menuRowDestructive: {color: 'var(--color-error)'},
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingInline: 16, paddingBottom: 16},
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
  sheetCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  radioRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  // Unselected radio ring uses CONTROL_BOUNDARY (≥3:1 vs the card, per
  // the amendment); selected = brand fill + LENS_TEXT check (5.7:1 /
  // 7.8:1, math at the const).
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: `2px solid ${CONTROL_BOUNDARY}`,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  radioCircleOn: {border: `2px solid ${BRAND_ACCENT}`, background: BRAND_ACCENT, color: LENS_TEXT},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8},
  noteInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    boxSizing: 'border-box',
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  // Filtered-empty block inside the sheet (zero-window stress fixture).
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
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4},
  emptyAction: {
    marginTop: 16,
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  bottomSpacer: {height: 12},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, slot keys 'w1-thu-19' (week-day-hour24,
// hours 17..22), everything cross-checked by hand. The suite's internal
// today is Thu Jul 9, 2026 (week 1 = Jul 6–12, week 2 = Jul 13–19).
// ---------------------------------------------------------------------------

const ME = {id: 'u-me', name: 'Sam Ito', hue: 205};
const MATCH = {id: 'u-jordan', name: 'Jordan Avery', avatarHue: 262};

type WeekId = 'w1' | 'w2';
type TabId = 'match' | 'windows' | 'chats' | 'me';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayId = (typeof DAYS)[number];
const DAY_SHORT: Record<DayId, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};
const DAY_LONG: Record<DayId, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
// Fixed date captions per week (list editor headers, window rows).
const DAY_DATES: Record<WeekId, string[]> = {
  w1: ['Jul 6', 'Jul 7', 'Jul 8', 'Jul 9', 'Jul 10', 'Jul 11', 'Jul 12'],
  w2: ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19'],
};
// The internal today: Thu Jul 9 → week 1, column index 3 (initial in BRAND).
const TODAY = {week: 'w1' as WeekId, dayIdx: 3};

// Six 60-min evening slots; evening ends 11p (hour 23 exclusive).
const SLOT_HOURS = [17, 18, 19, 20, 21, 22];
const GUTTER_LABELS = ['5p', '6p', '7p', '8p', '9p', '10p'];

function cellKey(week: WeekId, day: DayId, hour: number): string {
  return `${week}-${day}-${hour}`;
}

/** Expand a [startH, endH) range into slot keys. */
function rangeCells(week: WeekId, day: DayId, startH: number, endH: number): string[] {
  const keys: string[] = [];
  for (let h = startH; h < endH; h++) keys.push(cellKey(week, day, h));
  return keys;
}

// THEIR CELLS (Jordan, hatched fixture — both weeks, immutable).
// Week 1: Mon 18–21 (3) + Tue none (0) + Wed 17–20 (3) + Thu 18–21 (3) +
// Fri 19–23 (4) + Sat 17–23 (6, the saturation column) + Sun 18–20 (2)
// → 3+0+3+3+4+6+2 = 21 cells ✓.
// Week 2: Mon 19–22 (3) + Wed 18–21 (3) + Thu 17–20 (3) + Sat 18–22 (4) +
// Sun 17–20 (3) → 16 cells ✓.
const THEIR_CELLS: ReadonlySet<string> = new Set([
  ...rangeCells('w1', 'mon', 18, 21),
  ...rangeCells('w1', 'wed', 17, 20),
  ...rangeCells('w1', 'thu', 18, 21),
  ...rangeCells('w1', 'fri', 19, 23),
  ...rangeCells('w1', 'sat', 17, 23),
  ...rangeCells('w1', 'sun', 18, 20),
  ...rangeCells('w2', 'mon', 19, 22),
  ...rangeCells('w2', 'wed', 18, 21),
  ...rangeCells('w2', 'thu', 17, 20),
  ...rangeCells('w2', 'sat', 18, 22),
  ...rangeCells('w2', 'sun', 17, 20),
]);

// MY CELLS initial paint. Week 1: Mon 19–21 (2) + Tue 18–20 (2) + Fri
// 20–22 (2) + Sun 21–22 (1) → 7 ✓ (Tue = solid-only stratum, their Tue is
// empty; Sun 9–10p vs their 6–8p = the near-miss). Week 2: Sat 19–21 (2).
// Derived week-1 intersections: Mon 7–9p + Fri 8–10p = 2 windows, 4 lens
// cells; week 2: Sat 7–9p = 1 window.
const MY_CELLS_INITIAL: string[] = [
  ...rangeCells('w1', 'mon', 19, 21),
  ...rangeCells('w1', 'tue', 18, 20),
  ...rangeCells('w1', 'fri', 20, 22),
  ...rangeCells('w1', 'sun', 21, 22),
  ...rangeCells('w2', 'sat', 19, 21),
];

interface Venue {
  id: string;
  name: string;
  meta: string;
}

// 'Pin & Palm Duckpin Bowling' is the 60px-radio-row + 72px-chat-preview
// ellipsis stress at 320px (stress fixture 5).
const VENUES: Venue[] = [
  {id: 'v-lantern', name: 'Lantern Coffee', meta: 'Coffee · 0.4 mi'},
  {id: 'v-golden', name: 'Golden Hour Wine Bar', meta: 'Wine bar · 0.8 mi'},
  {id: 'v-pinpalm', name: 'Pin & Palm Duckpin Bowling', meta: 'Bowling · 1.2 mi'},
];

interface NearbyMatch {
  id: string;
  name: string;
  hue: number;
  tagline: string;
  // Each card carries its own eveningsFree ranges (week 1) so the
  // 'n mutual windows' chip is computed against MY paint, never asserted.
  eveningsFree: Array<{day: DayId; startH: number; endH: number}>;
}

// Priya {Tue 18–21, Sat 17–20} ∩ my w1 → Tue 6–8p = 1 window;
// Marcus {Sun 20–22} ∩ my w1 (Sun 21–22) → Sun 9–10p = 1 window.
const NEARBY: NearbyMatch[] = [
  {
    id: 'u-priya',
    name: 'Priya Shah',
    hue: 152,
    tagline: 'Taco scholar · 2.1 mi',
    eveningsFree: [
      {day: 'tue', startH: 18, endH: 21},
      {day: 'sat', startH: 17, endH: 20},
    ],
  },
  {
    id: 'u-marcus',
    name: 'Marcus Trent',
    hue: 28,
    tagline: 'Climbing gym regular · 3.4 mi',
    eveningsFree: [{day: 'sun', startH: 20, endH: 22}],
  },
];

interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
}

interface ChatThread {
  id: string;
  name: string;
  hue: number;
  preview: string;
  when: string;
  messages: ChatMessage[];
}

const CHATS: ChatThread[] = [
  {
    id: 'c-jordan',
    name: MATCH.name,
    hue: MATCH.avatarHue,
    preview: 'That Thursday plan though 👀',
    when: '2h',
    messages: [
      {id: 'm1', from: 'them', text: 'Okay your week grid is very organized. Respect.'},
      {id: 'm2', from: 'me', text: 'Painting evenings is my new personality, yes.'},
      {id: 'm3', from: 'them', text: 'I marked everything after work — lens where they cross?'},
      {id: 'm4', from: 'them', text: 'That Thursday plan though 👀'},
    ],
  },
  {
    id: 'c-priya',
    name: 'Priya Shah',
    hue: 152,
    preview: 'ok but which taco place',
    when: '1d',
    messages: [
      {id: 'm1', from: 'me', text: 'Tuesday could work if we keep it early.'},
      {id: 'm2', from: 'them', text: 'ok but which taco place'},
    ],
  },
  {
    id: 'c-marcus',
    name: 'Marcus Trent',
    hue: 28,
    preview: 'rain check?',
    when: '3d',
    messages: [
      {id: 'm1', from: 'them', text: 'Sunday bouldering then dinner?'},
      {id: 'm2', from: 'them', text: 'rain check?'},
    ],
  },
];

interface MeSetting {
  id: string;
  label: string;
}

const ME_SETTINGS: MeSetting[] = [
  {id: 's-evenings', label: 'Evenings only'},
  {id: 's-showgrid', label: 'Show my grid to matches'},
  {id: 's-nudge', label: 'Weekly nudge'},
];

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATION — pure, deterministic; windows are ALWAYS
// re-derived from the sets, never stored.
// ---------------------------------------------------------------------------

/** 17 → 5, 22 → 10, 23 → 11 (evening hours only). */
function hr12(h: number): number {
  return h - 12;
}

/** [19, 21) → '7–9p'. */
function rangeLabel(startH: number, endH: number): string {
  return `${hr12(startH)}–${hr12(endH)}p`;
}

/** 19 → '7 PM' (accessible names). */
function ariaHour(h: number): string {
  return `${hr12(h)} PM`;
}

interface SharedWindow {
  id: string;
  week: WeekId;
  day: DayId;
  dayIdx: number;
  startH: number;
  endH: number;
  cellKeys: string[];
}

interface Proposal {
  id: string;
  week: WeekId;
  day: DayId;
  startH: number;
  endH: number;
  venueId: string;
  note: string;
}

/**
 * 90-min buffer around an accepted proposal: slot [h, h+1) is consumed
 * when it overlaps [startH − 1.5, endH + 1.5). Thu 7–9p → h > 16.5 and
 * h < 22.5 → the full Thu column; minus the 2 stamped cells = 4 greyed
 * (5–6p overlaps at 5:30, 10–11p overlaps at 10:30 — stress fixture 6).
 */
function bufferedCellsFor(proposal: Proposal): string[] {
  const keys: string[] = [];
  for (const h of SLOT_HOURS) {
    const stamped = h >= proposal.startH && h < proposal.endH;
    const overlaps = h + 1 > proposal.startH - 1.5 && h < proposal.endH + 1.5;
    if (!stamped && overlaps) keys.push(cellKey(proposal.week, proposal.day, h));
  }
  return keys;
}

function stampedCellsFor(proposal: Proposal): string[] {
  return rangeCells(proposal.week, proposal.day, proposal.startH, proposal.endH);
}

/** All consumed (stamped + buffered) cells for a week — these drop from intersection math. */
function consumedCells(week: WeekId, proposals: Proposal[]): Set<string> {
  const out = new Set<string>();
  for (const p of proposals) {
    if (p.week !== week) continue;
    for (const k of stampedCellsFor(p)) out.add(k);
    for (const k of bufferedCellsFor(p)) out.add(k);
  }
  return out;
}

/**
 * Derived, never stored: intersect(myCells, theirCells[week]) minus
 * consumed cells, merged into contiguous windows per day.
 */
function deriveWindows(week: WeekId, myCells: ReadonlySet<string>, proposals: Proposal[]): SharedWindow[] {
  const excluded = consumedCells(week, proposals);
  const windows: SharedWindow[] = [];
  DAYS.forEach((day, dayIdx) => {
    let runStart: number | null = null;
    for (let i = 0; i <= SLOT_HOURS.length; i++) {
      const h = i < SLOT_HOURS.length ? SLOT_HOURS[i] : null;
      const key = h != null ? cellKey(week, day, h) : '';
      const shared =
        h != null && myCells.has(key) && THEIR_CELLS.has(key) && !excluded.has(key);
      if (shared && runStart == null) runStart = h;
      if (!shared && runStart != null) {
        const endH = SLOT_HOURS[i - 1] + 1;
        windows.push({
          id: `${week}-${day}-${runStart}-${endH}`,
          week,
          day,
          dayIdx,
          startH: runStart,
          endH,
          cellKeys: rangeCells(week, day, runStart, endH),
        });
        runStart = null;
      }
    }
  });
  return windows;
}

/** Window pill/row label: 'Thu 7–9p · 2h'. */
function windowLabel(win: SharedWindow): string {
  return `${DAY_SHORT[win.day]} ${rangeLabel(win.startH, win.endH)} · ${win.endH - win.startH}h`;
}

/** Mutual-window count for a Match card vs my week-1 paint (computed, not asserted). */
function mutualWindowCount(match: NearbyMatch, myCells: ReadonlySet<string>): number {
  let count = 0;
  for (const range of match.eveningsFree) {
    let inRun = false;
    for (const h of SLOT_HOURS) {
      const shared =
        h >= range.startH && h < range.endH && myCells.has(cellKey('w1', range.day, h));
      if (shared && !inRun) {
        count += 1;
        inRun = true;
      }
      if (!shared) inRun = false;
    }
  }
  return count;
}

/** id-derived avatar/hero gradient — no photos, deterministic by hue. */
function hueGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 68% 52%), hsl(${(hue + 42) % 360} 72% 40%))`;
}

/** 'Cleared Thu 7–10p' when an erase stroke is one contiguous run in one day. */
function clearedLabel(erased: string[]): string {
  if (erased.length === 0) return 'Cleared';
  const parts = erased.map(k => k.split('-'));
  const day = parts[0][1] as DayId;
  const sameDay = parts.every(p => p[1] === day && p[0] === parts[0][0]);
  if (sameDay) {
    const hours = parts.map(p => Number(p[2])).sort((a, b) => a - b);
    const contiguous = hours.every((h, i) => i === 0 || h === hours[i - 1] + 1);
    if (contiguous) {
      return `Cleared ${DAY_SHORT[day]} ${rangeLabel(hours[0], hours[hours.length - 1] + 1)}`;
    }
  }
  return `Cleared ${erased.length} evening slots`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useAvailabilityStore(): availability + chats + me +
// ui groups behind one update(id, patch). Every surface reads derived
// windows from the same myCells Set; nothing mirrors it.
// ---------------------------------------------------------------------------

type UndoPayload =
  | {kind: 'stroke'; prevMyCells: string[]}
  | {kind: 'unpropose'; proposal: Proposal}
  | {kind: 'repropose'; proposal: Proposal}
  | {kind: 'unmute'; threadId: string}
  | {kind: 'rematch'; threadId: string};

interface ToastState {
  seq: number;
  text: string;
  undo: UndoPayload | null;
}

type MenuState =
  | {kind: 'thread'; threadId: string}
  | {kind: 'stamp'; proposalId: string}
  | null;

interface AvailabilityGroup {
  week: WeekId;
  myCells: string[]; // Set-like; kept as array for stable state identity
  proposals: Proposal[];
}

interface ChatsGroup {
  openThreadId: string | null; // pushed screen — persists across tab switches
  drafts: Record<string, string>;
  extraMessages: Record<string, ChatMessage[]>;
  muted: string[];
  removed: string[];
  refresh: 'idle' | 'loading' | 'updated';
}

interface MeGroup {
  settings: Record<string, boolean>;
}

interface UiGroup {
  activeTab: TabId;
  listMode: boolean; // 'Edit as list' — the mandatory non-gesture path
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  sheetSlotId: string | null;
  sheetVenueId: string;
  sheetNote: string;
  noteError: string | null;
  menu: MenuState;
  toast: ToastState | null;
}

interface VennEntities {
  availability: AvailabilityGroup;
  chats: ChatsGroup;
  me: MeGroup;
  ui: UiGroup;
}

const INITIAL_ENTITIES: VennEntities = {
  availability: {week: 'w1', myCells: MY_CELLS_INITIAL, proposals: []},
  chats: {
    openThreadId: null,
    drafts: {},
    extraMessages: {},
    muted: [],
    removed: [],
    refresh: 'idle',
  },
  me: {settings: {'s-evenings': true, 's-showgrid': true, 's-nudge': false}},
  ui: {
    activeTab: 'windows',
    listMode: false,
    sheetOpen: false,
    sheetDetent: 'medium',
    sheetSlotId: null,
    sheetVenueId: VENUES[0].id,
    sheetNote: '',
    noteError: null,
    menu: null,
    toast: null,
  },
};

function useAvailabilityStore() {
  const [entities, setEntities] = useState<VennEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof VennEntities>(id: K, patch: Partial<VennEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the two stages apart. */
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const {overflowY} = window.getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// VennLensMark — two intersecting rounded squares; ONLY the lens overlap
// is filled BRAND_ACCENT; strokes use var(--color-text-primary).
// ---------------------------------------------------------------------------

function VennLensMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Lens = intersection of the two 20px rounded squares
            (rects at x=1.5 and x=6.5, both y=4..24) → overlap 6.5..21.5. */}
        <path
          d="M8.5 6.5 h11 a2 2 0 0 1 2 2 v11 a2 2 0 0 1 -2 2 h-11 a2 2 0 0 1 -2 -2 v-11 a2 2 0 0 1 2 -2 Z"
          fill={BRAND_ACCENT}
          opacity={0.9}
        />
        <rect x={1.5} y={4} width={20} height={20} rx={5} stroke="var(--color-text-primary)" strokeWidth={1.6} />
        <rect x={6.5} y={4} width={20} height={20} rx={5} stroke="var(--color-text-primary)" strokeWidth={1.6} />
      </svg>
    </span>
  );
}

/** 16px white lens glyph inside a 'both' cell — two overlapping circles. */
function LensGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx={6} cy={8} r={4.5} stroke="currentColor" strokeWidth={1.5} />
      <circle cx={10} cy={8} r={4.5} stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DUAL-LAYER GRID — role='grid' of adjacent 44px gridcell buttons
// (datePanel precedent). Three strata per cell: mine solid · theirs 45°
// hatch · both = BRAND lens with glow + white glyph. Paint strokes via
// pointerdown/move on the body (elementFromPoint); keyboard path = roving
// tabindex + arrows + Enter/Space. Buffered cells grey to 40% and go
// aria-disabled. ProposalStamp overlays pin accepted windows.
// ---------------------------------------------------------------------------

interface DualLayerGridProps {
  week: WeekId;
  myCells: ReadonlySet<string>;
  proposals: Proposal[];
  bufferedSet: ReadonlySet<string>;
  wakeKeys: string[];
  wakeSeq: number;
  onStrokeStart: (key: string) => void;
  onStrokeEnter: (key: string) => void;
  onStrokeEnd: () => void;
  onKeyToggle: (key: string) => void;
  onStampMenu: (proposalId: string, anchor: {dayIdx: number; startSlot: number}) => void;
  venueById: (id: string) => Venue;
}

function DualLayerGrid({
  week,
  myCells,
  proposals,
  bufferedSet,
  wakeKeys,
  wakeSeq,
  onStrokeStart,
  onStrokeEnter,
  onStrokeEnd,
  onKeyToggle,
  onStampMenu,
  venueById,
}: DualLayerGridProps) {
  const [focusPos, setFocusPos] = useState<{r: number; c: number}>({r: 0, c: 0});
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const paintingRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);
  // Long-press bookkeeping for the stamp context menu.
  const pressTimerRef = useRef<number | null>(null);
  const pressOriginRef = useRef<{x: number; y: number} | null>(null);

  const keyAt = (event: ReactPointerEvent<HTMLDivElement>): string | null => {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    const cell = el?.closest?.('[data-cellkey]') as HTMLElement | null;
    return cell?.dataset.cellkey ?? null;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const key = keyAt(event);
    if (key == null || bufferedSet.has(key)) return;
    paintingRef.current = true;
    lastKeyRef.current = key;
    bodyRef.current?.setPointerCapture(event.pointerId);
    onStrokeStart(key);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!paintingRef.current) return;
    const key = keyAt(event);
    if (key == null || key === lastKeyRef.current || bufferedSet.has(key)) return;
    lastKeyRef.current = key;
    onStrokeEnter(key);
  };
  const handlePointerUp = () => {
    if (!paintingRef.current) return;
    paintingRef.current = false;
    lastKeyRef.current = null;
    onStrokeEnd();
  };

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[event.key];
    if (move == null) return;
    event.preventDefault();
    setFocusPos(prev => {
      const r = Math.max(0, Math.min(SLOT_HOURS.length - 1, prev.r + move[0]));
      const c = Math.max(0, Math.min(DAYS.length - 1, prev.c + move[1]));
      const btn = bodyRef.current?.querySelector<HTMLElement>(
        `[data-cellkey="${cellKey(week, DAYS[c], SLOT_HOURS[r])}"]`,
      );
      btn?.focus({preventScroll: true});
      return {r, c};
    });
  };

  const wakeSet = new Set(wakeKeys);
  const weekProposals = proposals.filter(p => p.week === week);

  return (
    <div style={styles.gridRail}>
      <div style={styles.dayHeaderRow} aria-hidden>
        <span />
        {DAY_INITIALS.map((initial, i) => (
          <span
            key={`${DAYS[i]}-initial`}
            style={{
              ...styles.dayInitial,
              ...(week === TODAY.week && i === TODAY.dayIdx ? styles.dayInitialToday : null),
            }}>
            {initial}
          </span>
        ))}
      </div>
      <div
        ref={bodyRef}
        style={styles.gridBody}
        role="grid"
        aria-label={`Evening availability, ${week === 'w1' ? 'this week' : 'next week'}`}
        onKeyDown={handleGridKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
        {SLOT_HOURS.map((hour, r) => (
          <div key={hour} role="row" style={styles.gridRow}>
            <span style={styles.gutterCell} aria-hidden>
              {GUTTER_LABELS[r]}
            </span>
            {DAYS.map((day, c) => {
              const key = cellKey(week, day, hour);
              const mine = myCells.has(key);
              const theirs = THEIR_CELLS.has(key);
              const buffered = bufferedSet.has(key);
              const both = mine && theirs && !buffered;
              const stateBits = [
                mine ? 'you free' : 'you busy',
                theirs ? `${MATCH.name.split(' ')[0]} free` : `${MATCH.name.split(' ')[0]} busy`,
              ];
              if (both) stateBits.push('shared');
              if (buffered) stateBits.push('held for your date');
              const cellStyle: CSSProperties = {
                ...styles.cell,
                ...(both ? styles.cellLens : null),
                ...(buffered ? styles.cellBuffered : null),
              };
              if (!both && mine) cellStyle.background = MINE_FILL;
              const hatch = `repeating-linear-gradient(45deg, ${HATCH_STRIPE} 0px, ${HATCH_STRIPE} 3px, transparent 3px, transparent 8px)`;
              if (!both && theirs && mine) {
                cellStyle.backgroundImage = `${hatch}, linear-gradient(${MINE_FILL}, ${MINE_FILL})`;
                cellStyle.background = undefined;
                cellStyle.backgroundColor = 'var(--color-background-muted)';
              } else if (!both && theirs) {
                cellStyle.backgroundImage = hatch;
              }
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  data-cellkey={key}
                  className={`vnn-btn vnn-focusable${wakeSet.has(key) ? ' vnn-wake' : ''}`}
                  style={cellStyle}
                  tabIndex={focusPos.r === r && focusPos.c === c ? 0 : -1}
                  aria-disabled={buffered || undefined}
                  aria-label={`${DAY_LONG[day]} ${ariaHour(hour)} to ${ariaHour(hour + 1)}, ${stateBits.join(', ')}`}
                  onFocus={() => setFocusPos({r, c})}
                  onClick={event => {
                    // Keyboard activation only (event.detail === 0);
                    // pointer strokes already painted on pointerdown.
                    if (event.detail !== 0 || buffered) return;
                    onKeyToggle(key);
                  }}>
                  {both ? (
                    <span key={`${key}-lens-${wakeSeq}`} className="vnn-bloom" style={styles.lensGlyph}>
                      <LensGlyph />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
        {weekProposals.map(proposal => {
          const startSlot = SLOT_HOURS.indexOf(proposal.startH);
          const dayIdx = DAYS.indexOf(proposal.day);
          const rows = proposal.endH - proposal.startH;
          const venue = venueById(proposal.venueId);
          return (
            <button
              key={proposal.id}
              type="button"
              className="vnn-btn vnn-focusable vnn-pill-in"
              style={{
                ...styles.stamp,
                left: `calc(36px + ${dayIdx} * ((100% - 36px) / 7))`,
                width: 'calc((100% - 36px) / 7)',
                top: startSlot * 44,
                height: rows * 44,
              }}
              aria-haspopup="menu"
              aria-label={`Date proposed, ${DAY_LONG[proposal.day]} ${ariaHour(proposal.startH)} to ${ariaHour(proposal.endH)} at ${venue.name} — options`}
              onPointerDown={event => {
                // Long-press (450ms, cancels on 8px move) opens the same
                // menu as the click — click IS the visible button path.
                event.stopPropagation();
                pressOriginRef.current = {x: event.clientX, y: event.clientY};
                pressTimerRef.current = window.setTimeout(() => {
                  pressTimerRef.current = null;
                  onStampMenu(proposal.id, {dayIdx, startSlot});
                }, 450);
              }}
              onPointerMove={event => {
                const origin = pressOriginRef.current;
                if (origin == null || pressTimerRef.current == null) return;
                if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) {
                  window.clearTimeout(pressTimerRef.current);
                  pressTimerRef.current = null;
                }
              }}
              onPointerUp={() => {
                if (pressTimerRef.current != null) {
                  window.clearTimeout(pressTimerRef.current);
                  pressTimerRef.current = null;
                }
              }}
              onClick={event => {
                event.stopPropagation();
                onStampMenu(proposal.id, {dayIdx, startSlot});
              }}>
              <span style={styles.stampCheck} aria-hidden>
                <Icon icon={CheckIcon} size="xsm" color="inherit" />
              </span>
              <span style={styles.stampTime}>{rangeLabel(proposal.startH, proposal.endH)}</span>
              <span style={styles.stampVenue}>{venue.name.charAt(0)}</span>
              <span style={{color: 'var(--color-text-secondary)', display: 'grid', placeItems: 'center'}} aria-hidden>
                <Icon icon={MoreHorizontalIcon} size="xsm" color="inherit" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EVENING LIST EDITOR — the mandatory non-gesture path: 7 day sections ×
// six 44px whole-row switches driving the exact same store.
// ---------------------------------------------------------------------------

interface EveningListEditorProps {
  week: WeekId;
  myCells: ReadonlySet<string>;
  bufferedSet: ReadonlySet<string>;
  onToggle: (key: string) => void;
}

function EveningListEditor({week, myCells, bufferedSet, onToggle}: EveningListEditorProps) {
  return (
    <div>
      {DAYS.map((day, dayIdx) => (
        <div key={day} style={styles.listEditorSection}>
          <h3 style={{...styles.sectionHeader, margin: '12px 0 8px', paddingInline: 16}}>
            {DAY_SHORT[day].toUpperCase()} · {DAY_DATES[week][dayIdx].toUpperCase()}
          </h3>
          <div style={{...styles.listCard, marginInline: 0}}>
            {SLOT_HOURS.map((hour, i) => {
              const key = cellKey(week, day, hour);
              const on = myCells.has(key);
              const theirs = THEIR_CELLS.has(key);
              const buffered = bufferedSet.has(key);
              return (
                <div key={key}>
                  {i > 0 ? <div style={styles.rowDivider} /> : null}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-disabled={buffered || undefined}
                    className="vnn-btn vnn-focusable"
                    style={{...styles.switchRow, ...(buffered ? {opacity: 0.4} : null)}}
                    aria-label={`${DAY_LONG[day]} ${ariaHour(hour)} to ${ariaHour(hour + 1)}${theirs ? `, ${MATCH.name.split(' ')[0]} is free` : ''}`}
                    onClick={() => {
                      if (!buffered) onToggle(key);
                    }}>
                    <span style={{...styles.switchLabel, fontVariantNumeric: 'tabular-nums'}}>
                      {rangeLabel(hour, hour + 1)}
                    </span>
                    {theirs ? (
                      <span
                        style={{
                          ...styles.hatchDot,
                          backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_STRIPE} 0px, ${HATCH_STRIPE} 2px, transparent 2px, transparent 5px)`,
                          border: `1px solid ${BRAND_ACCENT}`,
                        }}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className="vnn-anim"
                      style={{...styles.switchTrack, ...(on ? styles.switchTrackOn : null)}}
                      aria-hidden>
                      <span
                        className="vnn-anim"
                        style={{...styles.switchThumb, ...(on ? styles.switchThumbOn : null)}}
                      />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button), 52px header
// with 44×44 X, focus-trapped dialog; drag between detents is garnish.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetProps) {
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
    if (!movedRef.current) return;
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

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="vnn-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="vnn-btn vnn-focusable"
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
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="vnn-btn vnn-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_DEFS: Array<{id: TabId; label: string; icon: typeof HeartIcon}> = [
  {id: 'match', label: 'Match', icon: HeartIcon},
  {id: 'windows', label: 'Windows', icon: CalendarDaysIcon},
  {id: 'chats', label: 'Chats', icon: MessageCircleIcon},
  {id: 'me', label: 'Me', icon: CircleUserIcon},
];

export default function MobileMutualWindowFinderTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = useAvailabilityStore();
  const {availability, chats, me, ui} = entities;
  const mySet = new Set(availability.myCells);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  // Paint-stroke bookkeeping (transient — not state).
  const strokeRef = useRef<{mode: boolean; prev: string[]; touched: string[]} | null>(null);
  const [wake, setWake] = useState<{keys: string[]; seq: number}>({keys: [], seq: 0});
  // Per-tab scroll persistence (ergonomics law #2).
  const scrollByTabRef = useRef<Record<TabId, number>>({match: 0, windows: 0, chats: 0, me: 0});
  // Stamp-menu anchor (grid coordinates of the pressed stamp).
  const stampAnchorRef = useRef<{dayIdx: number; startSlot: number}>({dayIdx: 0, startSlot: 0});
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // DERIVED — windows are re-derived from the sets on every render.
  const thisWeekWindows = deriveWindows('w1', mySet, availability.proposals);
  const nextWeekWindows = deriveWindows('w2', mySet, availability.proposals);
  const currentWindows = availability.week === 'w1' ? thisWeekWindows : nextWeekWindows;
  const badgeCount = thisWeekWindows.length; // badge counts THIS WEEK only
  const bufferedSet = consumedCells(availability.week, availability.proposals);
  const venueById = (id: string): Venue => VENUES.find(v => v.id === id) ?? VENUES[0];
  const weekNoun = availability.week === 'w1' ? 'this week' : 'next week';
  const visibleThreads = CHATS.filter(t => !chats.removed.includes(t.id));
  const jordanProposal = availability.proposals.find(p => p.id.startsWith('prop-')) ?? null;

  const toastPatch = (text: string, undo: UndoPayload | null = null): {toast: ToastState} => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  // Sheet focus — preventScroll, or the animating sheet scroll-reveals
  // inside the locked overflow-hidden column and beaches mid-screen
  // (mobile amendment).
  useEffect(() => {
    if (ui.sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheetOpen]);
  useEffect(() => {
    if (ui.menu != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.menu]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.menu != null) closeMenu();
      else if (ui.sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.menu, ui.sheetOpen]);

  // TAB SWITCHING — per-tab state persists; only overlays close. Re-tap
  // of the active tab pops its stack to root + scrolls to top (the one
  // legal reset).
  const switchTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === ui.activeTab) {
      if (tab === 'chats' && chats.openThreadId != null) update('chats', {openThreadId: null});
      if (scroller != null) scroller.scrollTop = 0;
      scrollByTabRef.current[tab] = 0;
      return;
    }
    if (scroller != null) scrollByTabRef.current[ui.activeTab] = scroller.scrollTop;
    update('ui', {activeTab: tab, sheetOpen: false, menu: null});
    requestAnimationFrame(() => {
      const s = getScrollParent(shellRef.current);
      if (s != null) s.scrollTop = scrollByTabRef.current[tab];
    });
  };

  // PAINT STROKES — pointerdown sets paintMode = !cell.mine; every cell
  // entered applies it; release announces ONCE via the toastDock.
  const applyPaint = (key: string, mode: boolean) => {
    setEntities(prev => {
      const has = prev.availability.myCells.includes(key);
      if (mode === has) return prev;
      const myCells = mode
        ? [...prev.availability.myCells, key]
        : prev.availability.myCells.filter(k => k !== key);
      return {...prev, availability: {...prev.availability, myCells}};
    });
  };
  const onStrokeStart = (key: string) => {
    const mode = !mySet.has(key);
    strokeRef.current = {mode, prev: availability.myCells, touched: [key]};
    applyPaint(key, mode);
    setWake(prev => ({keys: [key], seq: prev.seq + 1}));
  };
  const onStrokeEnter = (key: string) => {
    const stroke = strokeRef.current;
    if (stroke == null) return;
    stroke.touched.push(key);
    applyPaint(key, stroke.mode);
    setWake(prev => ({keys: stroke.touched.slice(-3), seq: prev.seq + 1}));
  };
  const onStrokeEnd = () => {
    const stroke = strokeRef.current;
    strokeRef.current = null;
    if (stroke == null) return;
    setEntities(prev => {
      const prevSet = new Set(stroke.prev);
      const nowSet = new Set(prev.availability.myCells);
      const changed =
        stroke.prev.length !== prev.availability.myCells.length ||
        stroke.prev.some(k => !nowSet.has(k));
      if (!changed) return prev;
      if (!stroke.mode) {
        // ERASE = executes immediately; toast offers Undo restoring the
        // exact prior Set (undoOverConfirm — never a dialog).
        const erased = stroke.prev.filter(k => !nowSet.has(k));
        toastSeqRef.current += 1;
        return {
          ...prev,
          ui: {
            ...prev.ui,
            toast: {
              seq: toastSeqRef.current,
              text: clearedLabel(erased),
              undo: {kind: 'stroke', prevMyCells: stroke.prev},
            },
          },
        };
      }
      const added = prev.availability.myCells.filter(k => !prevSet.has(k));
      if (added.length === 0) return prev;
      const week = prev.availability.week;
      const count = deriveWindows(week, nowSet, prev.availability.proposals).length;
      toastSeqRef.current += 1;
      return {
        ...prev,
        ui: {
          ...prev.ui,
          toast: {
            seq: toastSeqRef.current,
            text: `${count} shared window${count === 1 ? '' : 's'} ${week === 'w1' ? 'this week' : 'next week'}`,
            undo: null,
          },
        },
      };
    });
  };
  const onKeyToggle = (key: string) => {
    const mode = !mySet.has(key);
    applyPaint(key, mode);
    setEntities(prev => {
      const count = deriveWindows(
        prev.availability.week,
        new Set(prev.availability.myCells),
        prev.availability.proposals,
      ).length;
      toastSeqRef.current += 1;
      return {
        ...prev,
        ui: {
          ...prev.ui,
          toast: {
            seq: toastSeqRef.current,
            text: `${count} shared window${count === 1 ? '' : 's'} ${prev.availability.week === 'w1' ? 'this week' : 'next week'}`,
            undo: mode ? null : {kind: 'stroke', prevMyCells: availability.myCells},
          },
        },
      };
    });
  };

  // SHEET LIFECYCLE ----------------------------------------------------------
  const openSheet = (opener: HTMLElement | null, slotId: string | null, week?: WeekId) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    const patch: Partial<UiGroup> = {
      sheetOpen: true,
      sheetDetent: 'medium',
      sheetSlotId: slotId,
      menu: null,
    };
    if (week != null && week !== availability.week) update('availability', {week});
    update('ui', patch);
  };
  const closeSheet = () => {
    update('ui', {sheetOpen: false, sheetDetent: 'medium', noteError: null});
    sheetOpenerRef.current?.focus();
  };
  const closeMenu = () => {
    update('ui', {menu: null});
    menuOpenerRef.current?.focus();
  };

  // PROPOSE FLOW — one assignment, reversible. Sending stamps the grid,
  // greys the buffer, collapses the consumed pill (badge N→N−1), flips
  // Jordan's chat preview, and toasts 'Proposal sent · Undo'.
  const sendProposal = () => {
    const win = currentWindows.find(w => w.id === ui.sheetSlotId) ?? currentWindows[0];
    if (win == null) return;
    if (ui.sheetNote.length > 80) {
      update('ui', {noteError: 'Keep the note under 80 characters'});
      return;
    }
    const proposal: Proposal = {
      id: `prop-${win.id}`,
      week: win.week,
      day: win.day,
      startH: win.startH,
      endH: win.endH,
      venueId: ui.sheetVenueId,
      note: ui.sheetNote,
    };
    setEntities(prev => {
      toastSeqRef.current += 1;
      return {
        ...prev,
        availability: {...prev.availability, proposals: [...prev.availability.proposals, proposal]},
        ui: {
          ...prev.ui,
          sheetOpen: false,
          sheetDetent: 'medium',
          sheetSlotId: null,
          sheetNote: '',
          noteError: null,
          toast: {
            seq: toastSeqRef.current,
            text: 'Proposal sent',
            undo: {kind: 'unpropose', proposal},
          },
        },
      };
    });
    sheetOpenerRef.current?.focus();
  };
  const removeProposal = (proposalId: string, verb: 'canceled' | 'removed') => {
    setEntities(prev => {
      const proposal = prev.availability.proposals.find(p => p.id === proposalId);
      if (proposal == null) return prev;
      toastSeqRef.current += 1;
      return {
        ...prev,
        availability: {
          ...prev.availability,
          proposals: prev.availability.proposals.filter(p => p.id !== proposalId),
        },
        ui: {
          ...prev.ui,
          menu: null,
          toast: {
            seq: toastSeqRef.current,
            text: `Proposal ${verb}`,
            undo: verb === 'canceled' ? {kind: 'repropose', proposal} : null,
          },
        },
      };
    });
    menuOpenerRef.current?.focus();
  };

  // UNDO — restores the exact prior state in one assignment.
  const runUndo = (undo: UndoPayload) => {
    if (undo.kind === 'stroke') {
      setEntities(prev => ({
        ...prev,
        availability: {...prev.availability, myCells: undo.prevMyCells},
        ui: {...prev.ui, ...toastPatch('Restored')},
      }));
    } else if (undo.kind === 'unpropose') {
      setEntities(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          proposals: prev.availability.proposals.filter(p => p.id !== undo.proposal.id),
        },
        ui: {...prev.ui, ...toastPatch('Proposal removed')},
      }));
    } else if (undo.kind === 'repropose') {
      setEntities(prev => ({
        ...prev,
        availability: {...prev.availability, proposals: [...prev.availability.proposals, undo.proposal]},
        ui: {...prev.ui, ...toastPatch('Proposal restored')},
      }));
    } else if (undo.kind === 'unmute') {
      setEntities(prev => ({
        ...prev,
        chats: {...prev.chats, muted: prev.chats.muted.filter(id => id !== undo.threadId)},
        ui: {...prev.ui, ...toastPatch('Unmuted')},
      }));
    } else {
      setEntities(prev => ({
        ...prev,
        chats: {...prev.chats, removed: prev.chats.removed.filter(id => id !== undo.threadId)},
        ui: {...prev.ui, ...toastPatch('Match restored')},
      }));
    }
  };

  // CHATS ---------------------------------------------------------------------
  const muteThread = (threadId: string) => {
    const thread = CHATS.find(t => t.id === threadId);
    setEntities(prev => ({
      ...prev,
      chats: {...prev.chats, muted: [...prev.chats.muted, threadId]},
      ui: {...prev.ui, menu: null, ...toastPatch(`Muted ${thread?.name ?? ''}`, {kind: 'unmute', threadId})},
    }));
  };
  const unmatchThread = (threadId: string) => {
    const thread = CHATS.find(t => t.id === threadId);
    setEntities(prev => ({
      ...prev,
      chats: {...prev.chats, removed: [...prev.chats.removed, threadId], openThreadId: null},
      ui: {...prev.ui, menu: null, ...toastPatch(`Unmatched ${thread?.name ?? ''}`, {kind: 'rematch', threadId})},
    }));
  };
  const sendChatMessage = (threadId: string) => {
    const draft = (chats.drafts[threadId] ?? '').trim();
    if (draft.length === 0) return;
    setEntities(prev => {
      const nextId = `mx-${(prev.chats.extraMessages[threadId]?.length ?? 0) + 1}`;
      return {
        ...prev,
        chats: {
          ...prev.chats,
          drafts: {...prev.chats.drafts, [threadId]: ''},
          extraMessages: {
            ...prev.chats.extraMessages,
            [threadId]: [...(prev.chats.extraMessages[threadId] ?? []), {id: nextId, from: 'me', text: draft}],
          },
        },
      };
    });
  };
  const pressRefresh = () => {
    if (chats.refresh === 'loading') {
      update('chats', {refresh: 'updated'});
      update('ui', toastPatch('Updated just now'));
    } else {
      update('chats', {refresh: 'loading'});
      update('ui', toastPatch('Loading conversations'));
    }
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS PER TAB
  // ---------------------------------------------------------------------------

  const renderNavBar = (): ReactNode => {
    if (ui.activeTab === 'chats' && chats.openThreadId != null) {
      const thread = CHATS.find(t => t.id === chats.openThreadId);
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="vnn-btn vnn-focusable"
              style={styles.backBtn}
              onClick={() => update('chats', {openThreadId: null})}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Chats</span>
            </button>
          </div>
          <h1 style={styles.navTitle}>{thread?.name ?? 'Chat'}</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="vnn-btn vnn-focusable"
              style={styles.iconBtn}
              aria-label={`Conversation options for ${thread?.name ?? ''}`}
              aria-haspopup="menu"
              aria-expanded={ui.menu?.kind === 'thread'}
              onClick={event => {
                menuOpenerRef.current = event.currentTarget;
                update('ui', {
                  menu: ui.menu?.kind === 'thread' ? null : {kind: 'thread', threadId: chats.openThreadId as string},
                });
              }}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
      );
    }
    if (ui.activeTab === 'windows') {
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <VennLensMark />
            <h1 className="vnn-vh">Venn — mutual window finder</h1>
          </div>
          <div style={styles.pager} role="radiogroup" aria-label="Week">
            {(['w1', 'w2'] as WeekId[]).map(week => {
              const on = availability.week === week;
              return (
                <button
                  key={week}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  className="vnn-btn vnn-focusable"
                  style={{...styles.pagerSeg, ...(on ? styles.pagerSegOn : null)}}
                  onKeyDown={event => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    event.preventDefault();
                    const next = week === 'w1' ? 'w2' : 'w1';
                    update('availability', {week: next});
                    (event.currentTarget.parentElement?.querySelector(
                      `button:nth-child(${next === 'w1' ? 1 : 2})`,
                    ) as HTMLElement | null)?.focus();
                  }}
                  onClick={() => update('availability', {week})}>
                  {week === 'w1' ? 'This week' : 'Next'}
                </button>
              );
            })}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="vnn-btn vnn-focusable"
              style={{...styles.iconBtn, ...(ui.listMode ? styles.iconBtnPressed : null)}}
              aria-label="Edit as list"
              aria-pressed={ui.listMode}
              onClick={() => update('ui', {listMode: !ui.listMode})}>
              <Icon icon={ListIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
      );
    }
    const titles: Record<TabId, string> = {match: 'Matches', windows: '', chats: 'Chats', me: 'Me'};
    return (
      <header style={styles.navBar}>
        <div style={styles.navLeading}>
          <VennLensMark />
        </div>
        <h1 style={styles.navTitle}>{titles[ui.activeTab]}</h1>
        <div style={styles.navTrailing}>
          {ui.activeTab === 'chats' ? (
            <button
              type="button"
              className="vnn-btn vnn-focusable"
              style={styles.iconBtn}
              aria-label="Refresh conversations"
              onClick={pressRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          ) : null}
        </div>
      </header>
    );
  };

  const renderWindowsTab = (): ReactNode => (
    <>
      <div style={styles.strip} aria-label={`Shared windows ${weekNoun}`}>
        {currentWindows.length === 0 ? (
          <span style={styles.stripEmpty}>No shared windows yet — paint your evenings</span>
        ) : (
          <div style={styles.stripRail}>
            {currentWindows.map(win => (
              <button
                key={win.id}
                type="button"
                className="vnn-btn vnn-focusable vnn-pill-in"
                style={styles.stripPillHit}
                aria-label={`${DAY_LONG[win.day]} ${ariaHour(win.startH)} to ${ariaHour(win.endH)} — propose this window`}
                onClick={event => openSheet(event.currentTarget, win.id)}>
                <span style={styles.stripPill}>{windowLabel(win)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={styles.gridSection}>
        {ui.listMode ? (
          <div style={styles.gridRail}>
            <EveningListEditor
              week={availability.week}
              myCells={mySet}
              bufferedSet={bufferedSet}
              onToggle={onKeyToggle}
            />
          </div>
        ) : (
          <DualLayerGrid
            week={availability.week}
            myCells={mySet}
            proposals={availability.proposals}
            bufferedSet={bufferedSet}
            wakeKeys={wake.keys}
            wakeSeq={wake.seq}
            onStrokeStart={onStrokeStart}
            onStrokeEnter={onStrokeEnter}
            onStrokeEnd={onStrokeEnd}
            onKeyToggle={onKeyToggle}
            onStampMenu={(proposalId, anchor) => {
              stampAnchorRef.current = anchor;
              menuOpenerRef.current = document.activeElement as HTMLElement | null;
              update('ui', {menu: {kind: 'stamp', proposalId}});
            }}
            venueById={venueById}
          />
        )}
      </div>
      {ui.listMode ? null : (
        <div style={styles.legendRow} aria-hidden>
          <span style={styles.legendItem}>
            <span style={{...styles.swatch, background: MINE_FILL, border: '1px solid var(--color-border)'}} />
            You
          </span>
          <span style={styles.legendItem}>
            <span
              style={{
                ...styles.swatch,
                backgroundImage: `repeating-linear-gradient(45deg, ${HATCH_STRIPE} 0px, ${HATCH_STRIPE} 2px, transparent 2px, transparent 5px)`,
                border: '1px solid var(--color-border)',
              }}
            />
            {MATCH.name.split(' ')[0]}
          </span>
          <span style={styles.legendItem}>
            <span style={{...styles.swatch, background: BRAND_ACCENT}} />
            Both
          </span>
        </div>
      )}
      <h2 style={styles.sectionHeader}>
        Shared windows · {thisWeekWindows.length} this week · {nextWeekWindows.length} next week
      </h2>
      {thisWeekWindows.length + nextWeekWindows.length === 0 ? (
        <div style={{...styles.emptyState, paddingBlock: 24}}>
          <div style={styles.emptyIconCircle}>
            <Icon icon={SearchXIcon} size="lg" color="inherit" />
          </div>
          <p style={styles.emptyTitle}>No shared windows</p>
          <p style={styles.emptyBody}>Paint an evening {MATCH.name.split(' ')[0]} is free to create one.</p>
        </div>
      ) : (
        <div style={styles.listCard}>
          {[...thisWeekWindows, ...nextWeekWindows].map((win, index, all) => (
            <div key={win.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                className="vnn-btn vnn-focusable"
                style={styles.windowRow}
                aria-label={`${DAY_LONG[win.day]} ${DAY_DATES[win.week][win.dayIdx]}, ${ariaHour(win.startH)} to ${ariaHour(win.endH)}, ${win.week === 'w1' ? 'this week' : 'next week'} — propose`}
                onClick={event => openSheet(event.currentTarget, win.id, win.week)}>
                <span style={styles.windowRowText}>
                  <span style={styles.rowPrimary}>
                    {DAY_SHORT[win.day]} {DAY_DATES[win.week][win.dayIdx]} · {rangeLabel(win.startH, win.endH)}
                  </span>
                  <span style={styles.rowSecondary}>
                    {win.endH - win.startH}h shared · {win.week === 'w1' ? 'This week' : 'Next week'}
                  </span>
                </span>
                <span style={styles.rowChevron} aria-hidden>
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </span>
              </button>
              {index === all.length - 1 ? null : null}
            </div>
          ))}
        </div>
      )}
      <div style={{height: 24}} />
      <div style={styles.proposeFooter}>
        <button
          type="button"
          className="vnn-btn vnn-focusable"
          style={styles.proposeBtn}
          onClick={event => openSheet(event.currentTarget, currentWindows[0]?.id ?? null)}>
          Propose a time ({currentWindows.length})
        </button>
      </div>
    </>
  );

  const renderMatchTab = (): ReactNode => (
    <>
      <h2 style={styles.sectionHeader}>Nearby this week</h2>
      <div
        ref={carouselRef}
        style={styles.carousel}
        tabIndex={0}
        role="group"
        aria-label="Nearby matches"
        className="vnn-focusable"
        onScroll={event => {
          const el = event.currentTarget;
          setCarouselIdx(Math.round(el.scrollLeft / 332));
        }}
        onKeyDown={event => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          const next = Math.max(0, Math.min(NEARBY.length - 1, carouselIdx + (event.key === 'ArrowRight' ? 1 : -1)));
          carouselRef.current?.children[next]?.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            inline: 'start',
            block: 'nearest',
          });
        }}>
        {NEARBY.map(match => {
          const mutual = mutualWindowCount(match, mySet);
          return (
            <article key={match.id} style={styles.matchCard}>
              <div style={{...styles.matchHero, background: hueGradient(match.hue)}}>
                <span style={{...styles.matchAvatar, background: 'rgba(0,0,0,0.25)'}} aria-hidden>
                  {match.name.charAt(0)}
                </span>
              </div>
              <div style={styles.matchBody}>
                <div>
                  <h3 style={styles.matchName}>{match.name}</h3>
                  <span style={styles.matchTagline}>{match.tagline}</span>
                </div>
                <div style={styles.chipRow}>
                  {match.eveningsFree.map(range => (
                    <span key={`${match.id}-${range.day}`} style={styles.chip}>
                      {DAY_SHORT[range.day]} {rangeLabel(range.startH, range.endH)}
                    </span>
                  ))}
                  <span style={styles.mutualChip}>
                    <LensGlyph />
                    {mutual} mutual window{mutual === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div style={styles.dotRow} role="group" aria-label="Match pages">
        {NEARBY.map((match, i) => (
          <button
            key={match.id}
            type="button"
            className="vnn-btn vnn-focusable"
            style={styles.dotBtn}
            aria-label={`Show ${match.name}`}
            aria-current={carouselIdx === i || undefined}
            onClick={() => {
              carouselRef.current?.children[i]?.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                inline: 'start',
                block: 'nearest',
              });
            }}>
            <span style={{...styles.dot, ...(carouselIdx === i ? styles.dotOn : null)}} aria-hidden />
          </button>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>Your match</h2>
      <div style={styles.listCard}>
        <div style={styles.chatRow}>
          <span style={{...styles.avatar40, background: hueGradient(MATCH.avatarHue)}} aria-hidden>
            {MATCH.name.charAt(0)}
          </span>
          <span style={styles.chatText}>
            <span style={styles.rowPrimary}>{MATCH.name}</span>
            <span style={styles.rowSecondary}>
              {badgeCount} shared window{badgeCount === 1 ? '' : 's'} this week
            </span>
          </span>
          <button
            type="button"
            className="vnn-btn vnn-focusable"
            style={{...styles.emptyAction, marginTop: 0}}
            onClick={() => switchTab('windows')}>
            Find a time
          </button>
        </div>
      </div>
      <div style={{height: 24}} />
    </>
  );

  const renderChatsTab = (): ReactNode => {
    const openThread = CHATS.find(t => t.id === chats.openThreadId);
    if (openThread != null) {
      const allMessages = [...openThread.messages, ...(chats.extraMessages[openThread.id] ?? [])];
      return (
        <>
          <div style={styles.threadScroll}>
            <span style={styles.bubbleWhen}>Today</span>
            {allMessages.map(message => (
              <div key={message.id} style={message.from === 'me' ? styles.bubbleMe : styles.bubbleThem}>
                {message.text}
              </div>
            ))}
            {openThread.id === 'c-jordan' && jordanProposal != null ? (
              <div style={{...styles.bubbleMe, display: 'flex', alignItems: 'center', gap: 8}}>
                <Icon icon={MapPinIcon} size="sm" color="inherit" />
                <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  Proposed {DAY_SHORT[jordanProposal.day]} {rangeLabel(jordanProposal.startH, jordanProposal.endH)} ·{' '}
                  {venueById(jordanProposal.venueId).name}
                </span>
              </div>
            ) : null}
          </div>
          <div style={styles.composer}>
            <input
              style={styles.composerInput}
              className="vnn-focusable"
              type="text"
              value={chats.drafts[openThread.id] ?? ''}
              placeholder={`Message ${openThread.name.split(' ')[0]}`}
              aria-label={`Message ${openThread.name}`}
              onChange={event =>
                update('chats', {drafts: {...chats.drafts, [openThread.id]: event.target.value}})
              }
              onKeyDown={event => {
                if (event.key === 'Enter') sendChatMessage(openThread.id);
              }}
            />
            <button
              type="button"
              className="vnn-btn vnn-focusable"
              style={styles.sendBtn}
              aria-label="Send message"
              onClick={() => sendChatMessage(openThread.id)}>
              <Icon icon={SendIcon} size="md" color="inherit" />
            </button>
          </div>
        </>
      );
    }
    return (
      <>
        {chats.refresh === 'updated' ? <div style={styles.updatedCaption}>Updated just now</div> : null}
        {chats.refresh === 'loading' ? (
          <div aria-busy="true">
            {[
              {p: '60%', s: '40%'},
              {p: '45%', s: '55%'},
              {p: '70%', s: '30%'},
            ].map((widths, i) => (
              <div key={widths.p}>
                {i > 0 ? <div style={styles.rowDividerFull} /> : null}
                <div style={styles.skelRow} aria-hidden>
                  <span style={styles.skelAvatar} />
                  <span style={styles.skelBars}>
                    <span style={{...styles.skelBar, width: widths.p}} />
                    <span style={{...styles.skelBar, width: widths.s}} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {visibleThreads.map((thread, index) => {
              const isJordan = thread.id === 'c-jordan';
              const preview =
                isJordan && jordanProposal != null
                  ? `You proposed ${DAY_SHORT[jordanProposal.day]} ${rangeLabel(jordanProposal.startH, jordanProposal.endH)} · ${venueById(jordanProposal.venueId).name}`
                  : thread.preview;
              const unread = isJordan && jordanProposal != null;
              return (
                <div key={thread.id}>
                  {index > 0 ? <div style={styles.rowDividerFull} /> : null}
                  <button
                    type="button"
                    className="vnn-btn vnn-focusable"
                    style={styles.chatRow}
                    aria-label={`${thread.name}, ${preview}`}
                    onClick={() => update('chats', {openThreadId: thread.id})}>
                    <span style={{...styles.avatar40, background: hueGradient(thread.hue)}} aria-hidden>
                      {thread.name.charAt(0)}
                    </span>
                    <span style={styles.chatText}>
                      <span style={styles.rowPrimary}>{thread.name}</span>
                      <span style={styles.rowSecondary}>{preview}</span>
                    </span>
                    <span style={styles.chatMetaCol}>
                      <span style={styles.chatWhen}>{thread.when}</span>
                      {unread ? <span style={styles.unreadDot} aria-label="Unread" /> : null}
                      {chats.muted.includes(thread.id) ? (
                        <span style={{color: 'var(--color-text-secondary)'}} aria-label="Muted">
                          <Icon icon={BellOffIcon} size="xsm" color="inherit" />
                        </span>
                      ) : null}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{height: 24}} />
      </>
    );
  };

  const renderMeTab = (): ReactNode => (
    <>
      <div style={styles.profileHeader}>
        <span style={{...styles.profileAvatar, background: hueGradient(ME.hue)}} aria-hidden>
          {ME.name.charAt(0)}
        </span>
        <div>
          <h2 style={styles.profileName}>{ME.name}</h2>
          <span style={styles.profileMeta}>Matching with {MATCH.name} · evenings painter</span>
        </div>
      </div>
      <h2 style={styles.sectionHeader}>Availability</h2>
      <div style={styles.listCard}>
        {ME_SETTINGS.map((setting, index) => {
          const on = me.settings[setting.id];
          return (
            <div key={setting.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                role="switch"
                aria-checked={on}
                className="vnn-btn vnn-focusable"
                style={styles.switchRow}
                onClick={() => update('me', {settings: {...me.settings, [setting.id]: !on}})}>
                <span style={styles.switchLabel}>{setting.label}</span>
                <span
                  className="vnn-anim"
                  style={{...styles.switchTrack, ...(on ? styles.switchTrackOn : null)}}
                  aria-hidden>
                  <span
                    className="vnn-anim"
                    style={{...styles.switchThumb, ...(on ? styles.switchThumbOn : null)}}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div style={{height: 24}} />
    </>
  );

  // PROPOSE SHEET body — slot radios (derived), venue radios, note field.
  const renderSheet = (): ReactNode => {
    if (!ui.sheetOpen) return null;
    const zeroWindows = currentWindows.length === 0;
    const selectedSlot = currentWindows.find(w => w.id === ui.sheetSlotId) ?? currentWindows[0] ?? null;
    return (
      <>
        <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        <Sheet
          titleId="vnn-propose-title"
          title="Propose a time"
          detent={ui.sheetDetent}
          onDetentChange={detent => update('ui', {sheetDetent: detent})}
          onClose={closeSheet}
          sheetRef={sheetRef}
          reducedMotion={reducedMotion}
          footer={
            zeroWindows ? null : (
              <button type="button" className="vnn-btn vnn-focusable" style={styles.proposeBtn} onClick={sendProposal}>
                Send proposal
              </button>
            )
          }>
          {zeroWindows ? (
            // Filtered-empty: ONE action, never two (stress fixture 2).
            <div style={styles.emptyState}>
              <div style={styles.emptyIconCircle}>
                <Icon icon={SearchXIcon} size="lg" color="inherit" />
              </div>
              <p style={styles.emptyTitle}>No shared windows {weekNoun}</p>
              <p style={styles.emptyBody}>Paint an evening {MATCH.name.split(' ')[0]} is free to create one.</p>
              <button type="button" className="vnn-btn vnn-focusable" style={styles.emptyAction} onClick={closeSheet}>
                Back to grid
              </button>
            </div>
          ) : (
            <>
              <h3 style={styles.sheetSectionLabel}>Shared window · {weekNoun}</h3>
              <div style={styles.sheetCard} role="radiogroup" aria-label="Shared window">
                {currentWindows.map((win, index) => {
                  const on = selectedSlot?.id === win.id;
                  return (
                    <div key={win.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className="vnn-btn vnn-focusable"
                        style={styles.radioRow}
                        onClick={() => update('ui', {sheetSlotId: win.id})}>
                        <span style={{...styles.radioCircle, ...(on ? styles.radioCircleOn : null)}} aria-hidden>
                          {on ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                        </span>
                        <span style={styles.windowRowText}>
                          <span style={styles.rowPrimary}>{windowLabel(win)}</span>
                          <span style={styles.rowSecondary}>
                            {DAY_LONG[win.day]} · {DAY_DATES[win.week][win.dayIdx]}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <h3 style={styles.sheetSectionLabel}>Venue</h3>
              <div style={styles.sheetCard} role="radiogroup" aria-label="Venue">
                {VENUES.map((venue, index) => {
                  const on = ui.sheetVenueId === venue.id;
                  return (
                    <div key={venue.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className="vnn-btn vnn-focusable"
                        style={styles.radioRow}
                        onClick={() => update('ui', {sheetVenueId: venue.id})}>
                        <span style={{...styles.radioCircle, ...(on ? styles.radioCircleOn : null)}} aria-hidden>
                          {on ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                        </span>
                        <span style={styles.windowRowText}>
                          <span style={styles.rowPrimary}>{venue.name}</span>
                          <span style={styles.rowSecondary}>{venue.meta}</span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop: 16}}>
                <label style={styles.fieldLabel} htmlFor="vnn-note">
                  Add a note (optional)
                </label>
                <input
                  id="vnn-note"
                  type="text"
                  style={{
                    ...styles.noteInput,
                    boxShadow: ui.noteError != null ? 'inset 0 0 0 2px var(--color-error)' : undefined,
                  }}
                  className="vnn-focusable"
                  value={ui.sheetNote}
                  placeholder="Excited for this!"
                  aria-invalid={ui.noteError != null || undefined}
                  aria-describedby={ui.noteError != null ? 'vnn-note-error' : undefined}
                  onChange={event => {
                    const value = event.target.value;
                    update('ui', {
                      sheetNote: value,
                      // Error clears the moment the value becomes valid
                      // while typing; it only APPEARS on blur.
                      noteError: ui.noteError != null && value.length <= 80 ? null : ui.noteError,
                    });
                  }}
                  onBlur={() => {
                    // Validation fires on blur, never per keystroke.
                    if (ui.sheetNote.length > 80) {
                      update('ui', {noteError: 'Keep the note under 80 characters'});
                    }
                  }}
                />
                {ui.noteError != null ? (
                  <span id="vnn-note-error" style={styles.fieldError}>
                    {ui.noteError}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </Sheet>
      </>
    );
  };

  const renderMenu = (): ReactNode => {
    if (ui.menu == null) return null;
    if (ui.menu.kind === 'thread') {
      const threadId = ui.menu.threadId;
      const muted = chats.muted.includes(threadId);
      return (
        <div ref={menuRef} role="menu" aria-label="Conversation options" style={{...styles.anchoredMenu, top: 52, right: 12}}>
          <button type="button" role="menuitem" className="vnn-btn vnn-focusable" style={styles.menuRow} onClick={() => muteThread(threadId)}>
            <Icon icon={BellOffIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>{muted ? 'Muted' : 'Mute'}</span>
          </button>
          <div style={styles.rowDivider} />
          {/* Destructive last, one intent step behind the menu; executes
              with Undo — never a confirm dialog (undoOverConfirm). */}
          <button
            type="button"
            role="menuitem"
            className="vnn-btn vnn-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={() => unmatchThread(threadId)}>
            <Icon icon={XIcon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Unmatch</span>
          </button>
        </div>
      );
    }
    const {proposalId} = ui.menu;
    const anchor = stampAnchorRef.current;
    return (
      <div
        ref={menuRef}
        role="menu"
        aria-label="Proposal options"
        style={{
          ...styles.anchoredMenu,
          top: 160 + anchor.startSlot * 44,
          ...(anchor.dayIdx > 3 ? {right: 16} : {left: 52}),
        }}>
        <button
          type="button"
          role="menuitem"
          className="vnn-btn vnn-focusable"
          style={styles.menuRow}
          onClick={() => removeProposal(proposalId, 'canceled')}>
          <Icon icon={XIcon} size="sm" color="secondary" />
          <span style={styles.menuRowText}>Cancel proposal</span>
        </button>
      </div>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{VENN_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {renderNavBar()}
        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {ui.activeTab !== 'windows' ? <h1 className="vnn-vh">{ui.activeTab}</h1> : null}
          {ui.activeTab === 'windows' ? renderWindowsTab() : null}
          {ui.activeTab === 'match' ? renderMatchTab() : null}
          {ui.activeTab === 'chats' ? renderChatsTab() : null}
          {ui.activeTab === 'me' ? renderMeTab() : null}
        </main>

        {/* THE single polite live region — sticky-in-flow toastDock at
            bottom:76; absolute during sheet scroll-lock. */}
        <div style={ui.sheetOpen ? styles.toastAnchorLocked : styles.toastAnchor} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="vnn-fade">
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undo != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button
                    type="button"
                    className="vnn-btn vnn-focusable"
                    style={styles.undoBtn}
                    onClick={() => runUndo(ui.toast?.undo as UndoPayload)}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Venn tabs">
          {TAB_DEFS.map(tab => {
            const on = ui.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="vnn-btn vnn-focusable"
                style={{...styles.tabItem, ...(on ? styles.tabItemOn : null)}}
                aria-current={on ? 'page' : undefined}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'windows' && badgeCount > 0 ? (
                    <span style={styles.tabBadge}>{badgeCount}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(on ? styles.tabLabelOn : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {renderMenu()}
        {renderSheet()}
      </div>
    </div>
  );
}


