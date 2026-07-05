var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Whirlet home map: six zones
 *   (Kitchen 180 · Hallway 90 · Living Room 320 · Bedroom 210 · Office 160
 *   · Bathroom 60 sq ft; 180+90+320+210+160+60 = 1,020 asserted at the
 *   terminal caption) with fixed floorplan centroids and the dock at
 *   (322,204). Initial run queue kitchen→hallway→living→bedroom with
 *   Kitchen on Max: (10+2)×1 + 6 + 14 + 8 = 40 min, binStops
 *   floor(4/2) = 2 (+1 min each) → 42 min. No Date.now(), no
 *   Math.random(), no network media — the map is stylized inline SVG.
 * @output Whirlet — Zone Runner: a 390px MOBILE robot-vacuum mission
 *   planner. NavBar (36px Whirlet spiral mark · 'Zone Runner' · 44×44
 *   RefreshCw) over a STICKY 256px floorplanPane — six hit-tested SVG
 *   rooms with id-derived pastel fills, numbered run-order badges at zone
 *   centroids, an animated dotted RoutePathTracer that detours to the
 *   dock after every 2nd zone, and a live etaChip pill ('~42 min · 2 bin
 *   stops') — above a scrolling 68px runQueueRail of reorderable chips
 *   (chip index IS the badge number), the ZONES listCard of six 60px
 *   toggle rows, a sticky 'Clean 4 zones' footer, and a 3-tab bar.
 *   Signature move: ONE RunPlanStore order array rules everything —
 *   dragging the Kitchen chip to position 3 fires one
 *   update('plan',{order}) and the map badges renumber in place, the
 *   route re-traces through the new centroid sequence, the etaChip holds
 *   at 42 (sum is order-independent — demoed honestly), and the Start
 *   label stays 'Clean 4 zones'; TOGGLING Office ON from map, row, or
 *   sheet checklist is what moves the ETA (→ '~51 min').
 * @position Page template; emitted by \`astryx template mobile-vacuum-zone-runner\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet,
 *   locked toast dock) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While the zone-options sheet is open,
 *   shell locks to {height:'100dvh', overflow:'hidden'} and restores on
 *   close. The stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables. The floorplan is a sticky
 *   in-flow pane (top:52, z15) under the sticky navBar — not an inner
 *   scroller.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Whirlet teal — the demo's --color-brand stays on the
 *   tab bar per foundations; the spec hex is quarantined here per house
 *   rule). BRAND_TEXT is the darker/lighter text-safe sibling (brand
 *   FILL and brand TEXT are different values per house law). Six room
 *   pastel pairs + explicit ≥3:1 interactive-boundary pairs (chip
 *   border, unchecked key-dot ring, OFF switch track ring) carry their
 *   contrast math at the declaration — the foundations amendment says
 *   hairline/muted tokens are for passive separators only.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   this template does not wire scroll-under; noted per contract);
 *   floorplanPane sticky top:52 z15, 12px paddingBlock + 232px SVG =
 *   256px; runQueueRail 68px (12 + 44px chips + 12), snap-x, 8px gaps;
 *   sectionHeader 13px/600 uppercase 0.06em at 32px (16 gutter + 16 card
 *   pad), 20px top / 8px bottom; six 60px two-line zone rows (16px/500 +
 *   13px/400, 2px gap), dividers inset 16; stickyFooter bottom:64 z19,
 *   16px padding + 48px Start button = 80px; tabBar 64px sticky bottom
 *   z20, 3 tabs, 24px icons over 11px/500 labels. TYPE (Figtree via
 *   --font-family-body): 17/600 nav & sheet titles · 16/400–500 body &
 *   row primary · 13/400 secondary · 11/500 overlines, tab labels, SVG
 *   room labels; nothing under 11px; tabular-nums on every count and
 *   minute. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; every gesture has a visible button path
 *   (chip drag → edit-mode 44×44 chevrons; SVG room taps → the 60px
 *   zone rows + sheet checklist; sheet drag → clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: NO width:390 literals. The floorplan SVG is
 *   width:'100%' against its 358-unit viewBox, so rooms scale
 *   proportionally; the smallest room (Bathroom, 70×52 units ≈ 56×42px
 *   at 320) carries a transparent expanded hit rect padded to ≥44px
 *   effective (as does the 54-unit-wide Hallway corridor). Chip rail
 *   overflows with a ≥24px next-chip peek; etaChip maxWidth
 *   calc(100% − 48px) single-line ellipsis; footer button full-width
 *   fluid. overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   (container width, not viewport — the demo stage is ~1045px inside a
 *   1440px window). At ≥720px the shell becomes a centered phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline). No
 *   adaptive relayout — the sticky-map anatomy is deliberately phone
 *   geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BotIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GripVerticalIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration (foundations amendment: interactive
// boundaries and meaningful rest fills need explicit ≥3:1 pairs against
// their ACTUAL surface; hairline/muted tokens are passive-separator-only).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Whirlet teal) — fills, strokes, route,
// badges (non-text uses need ≥3:1): #0D9488 on white body ≈ 3.6:1 ✓ (3:1
// graphics bar); #2DD4BF on the dark body (~#131316) ≈ 9.6:1 ✓.
const BRAND_ACCENT = 'light-dark(#0D9488, #2DD4BF)';
// Brand TEXT is a different value per house law — 4.5:1 required. Light
// #0F766E on #FFFFFF ≈ 5.3:1 ✓; dark #5EEAD4 on ~#1C1C1E card ≈ 12.3:1 ✓.
// (Deviation from spec's single BRAND_ACCENT-for-text: #0D9488 on white is
// ~3.6:1, which fails 4.5:1 for 13–17px text; split per house rule.)
const BRAND_TEXT = 'light-dark(#0F766E, #5EEAD4)';
// Text/numerals over a BRAND_ACCENT fill (badges, Start button, chip
// discs): #FFFFFF on #0D9488 ≈ 4.6:1 ✓; #042F2E on #2DD4BF ≈ 8.9:1 ✓.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #042F2E)';
// 12% brand wash for selected checklist rows / active segment tint.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// INTERACTIVE BOUNDARY pair (amendment-compliant): chip borders, unchecked
// key-dot rings, OFF switch-track ring, stepper outline. #64748B on the
// white card ≈ 4.8:1 ✓ (≥3:1); #94A3B8 on the dark card (~#1C1C1E) ≈
// 7.0:1 ✓. (Deviation: spec asked chip borders light-dark(#99F6E4,
// #115E59) "3.2:1 light" — #99F6E4 on white is actually ~1.2:1, an
// amendment violation, so the boundary pair below is used instead.)
const BOUNDARY = 'light-dark(#64748B, #94A3B8)';
// OFF switch-track fill (foundations value; the ≥3:1 boundary above rings
// it so the rest state reads against the sheet card).
const SWITCH_OFF_FILL = 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// Room pastels (id-derived, fixed map — no random hues). Room labels are
// 11px/500 var(--color-text-primary): near-black on each light pastel ≥
// 12:1 ✓; near-white on each dark deep fill ≥ 7:1 ✓ (worst pair: white-ish
// on #453411 ≈ 9.7:1; black-ish on #CCFBF1 ≈ 17:1). Badge circles are
// BRAND_ACCENT fills with BRAND_FILL_TEXT numerals (math above), and every
// pastel differs from BRAND_ACCENT by ≥3:1 in both schemes so a stamped
// badge reads against its room.
const ROOM_FILLS: Record<string, string> = {
  kitchen: 'light-dark(#CCFBF1, #134E4A)',
  hallway: 'light-dark(#FEF3C7, #453411)',
  living: 'light-dark(#E0E7FF, #312E5F)',
  bedroom: 'light-dark(#FCE7F3, #4A2039)',
  office: 'light-dark(#DCFCE7, #14432A)',
  bath: 'light-dark(#DBEAFE, #1E3A5F)',
};

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// route trace + badge stamp + shimmer keyframes, reduced-motion guard.
// Transitions animate transform/opacity only and collapse under
// prefers-reduced-motion (static color still encodes every state).
// ---------------------------------------------------------------------------

const WZR_CSS = \`
.wzr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.wzr-btn:disabled { cursor: default; }
.wzr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.wzr-room:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.wzr-anim { transition: transform 200ms ease, opacity 200ms ease; }
.wzr-fade { transition: opacity 200ms ease; }
@keyframes wzr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.wzr-sheet-in { animation: wzr-sheet-in 240ms ease; }
/* Route re-trace: the dotted path (dasharray 2 7) marches its offset
   600→0 over 600ms on every order/selection change (keyed remount). */
@keyframes wzr-trace {
  from { stroke-dashoffset: 600; }
  to { stroke-dashoffset: 0; }
}
.wzr-trace { animation: wzr-trace 600ms ease; }
/* Run-order badge stamps 0.6→1 over 200ms (transform-only). */
@keyframes wzr-stamp {
  from { transform: scale(0.6); }
  to { transform: scale(1); }
}
.wzr-stamp {
  animation: wzr-stamp 200ms ease;
  transform-box: fill-box;
  transform-origin: center;
}
/* One shared skeleton shimmer sweep. */
@keyframes wzr-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.wzr-shimmer { animation: wzr-shimmer 1.6s linear infinite; }
.wzr-vh {
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
  .wzr-anim, .wzr-fade { transition: none; }
  .wzr-sheet-in, .wzr-trace, .wzr-stamp { animation: none; }
  .wzr-shimmer { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — plain CSSProperties records (house idiom).
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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (unwired
  // scroll-under; noted per contract).
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
  navTitle: {fontSize: 17, fontWeight: 600, margin: 0, whiteSpace: 'nowrap'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // FLOORPLAN PANE — sticky top:52 z15 (under the z20 navBar); 12px
  // paddingBlock + 232px SVG = 256px total.
  floorplanPane: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    background: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
    paddingBlock: 12,
    paddingInline: 16,
  },
  floorplanSvg: {display: 'block', width: '100%', height: 'auto'},
  // etaChip — 32px pill over the SVG, bottom-left of the pane.
  etaChip: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    height: 32,
    maxWidth: 'calc(100% - 48px)',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // RUN QUEUE RAIL — 68px block (12 + 44px chips + 12), snap-x, 8px gaps,
  // ≥24px next-chip peek at 390.
  runQueueRail: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 12,
    paddingInline: 16,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
  },
  chip: {
    scrollSnapAlign: 'start',
    flexShrink: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 10,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    // Interactive boundary — BOUNDARY pair (≥3:1 vs card, math at decl).
    border: \`1px solid \${BOUNDARY}\`,
  },
  chipDisc: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  chipName: {
    fontSize: 13,
    fontWeight: 600,
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipMin: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  gripBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    color: 'var(--color-text-secondary)',
    touchAction: 'none',
  },
  chevBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    color: BRAND_TEXT,
  },
  chevBtnDisabled: {opacity: 0.35},
  editChip: {
    flexShrink: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_TEXT,
  },
  railCaption: {
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px, 20 top / 8 bottom.
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
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  zoneRowWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  zoneRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  // 24px color-key dot doubling as the selection circle. Unselected ring =
  // BOUNDARY pair (amendment: ≥3:1 vs the white/dark card, math at decl);
  // selected ring = 2px BRAND_ACCENT + CheckIcon in --color-text-primary
  // (near-black on light pastels ≥12:1, near-white on dark fills ≥7:1).
  keyDot: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    border: \`2px solid \${BOUNDARY}\`,
  },
  keyDotSelected: {border: \`2px solid \${BRAND_ACCENT}\`},
  keyDotCheck: {display: 'grid', placeItems: 'center', color: 'var(--color-text-primary)'},
  zoneRowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  zoneRowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  zoneRowSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  terminalCaption: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETON — 60px rows matching the zone rows exactly (zero layout
  // shift); deterministic staggered widths, one shared shimmer.
  skeletonRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    paddingInlineEnd: 16,
  },
  skeletonCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
  },
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skeletonShimmerClip: {position: 'relative', overflow: 'hidden'},
  skeletonShimmer: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 60%, transparent), transparent)',
    pointerEvents: 'none',
  },
  // STICKY FOOTER — bottom:64 z19 (above the 64px tabBar), blur surface,
  // 16px padding + 48px button = 80px.
  stickyFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  startBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  startBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // TAB BAR — 64px sticky bottom z20, 3 tabs.
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
    fontSize: 11,
    fontWeight: 500,
  },
  tabItemActive: {color: 'var(--color-brand)', fontWeight: 600},
  // TOAST DOCK — sticky-in-flow above the 80px footer + 64px tabBar
  // (144 + 12 = bottom 156) per the foundations amendment; flips to
  // absolute bottom:76 z30 ONLY while the shell is scroll-locked by the
  // open sheet (the one case shell-absolute is correct).
  toastDockSticky: {
    position: 'sticky',
    bottom: 156,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
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
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
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
  // SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  sheetSectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Switch row — whole 44px row is the role="switch" button.
  switchRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  switchLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  // 51×31 track; OFF fill per foundations + BOUNDARY ring (amendment ≥3:1
  // vs the sheet card, math at decl); ON = BRAND_ACCENT.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    background: SWITCH_OFF_FILL,
    boxShadow: \`inset 0 0 0 1.5px \${BOUNDARY}\`,
    position: 'relative',
  },
  switchTrackOn: {background: BRAND_ACCENT, boxShadow: 'none'},
  // 27px thumb, white in both schemes, 2px inset, travels 20px.
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: 999,
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  // Segmented control — 36px track, muted fill, radius 12.
  segTrack: {
    marginInline: 16,
    height: 36,
    display: 'flex',
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
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    fontWeight: 600,
  },
  // Stepper — 96×32 track split by a hairline; value trailing outside.
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
    minHeight: 44,
  },
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  stepperTrack: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stepHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepHalfDisabled: {opacity: 0.35},
  stepDividerV: {width: 1, background: 'var(--color-border)'},
  // Sheet checklist rows — 44px, role=checkbox.
  checklistRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  checklistRowSelected: {background: BRAND_TINT_12},
  checklistName: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  checklistMin: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // History / Robot fixture screens.
  historyRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
  },
  robotRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  robotValue: {
    marginLeft: 'auto',
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields (name + sqft on rows, name +
// minutes on chips), all aggregates derived by derive() from these consts.
// Cross-check ledger (verified by hand): initial order kitchen/hallway/
// living/bedroom with Kitchen on Max → (10+2)×1 + (6+0)×1 + (14+0)×1 +
// (8+0)×1 = 40; binStops floor(4/2) = 2 (+1 min each) → 42 → '~42 min ·
// 2 bin stops' + 'Clean 4 zones'. Queued area 180+90+320+210 = 800 sq ft.
// All-zone caption 180+90+320+210+160+60 = 1,020 sq ft (asserted here —
// the one hand-typed total, per spec).
// ---------------------------------------------------------------------------

type ZoneId = 'kitchen' | 'hallway' | 'living' | 'bedroom' | 'office' | 'bath';
type Suction = 'eco' | 'standard' | 'max';

interface Zone {
  id: ZoneId;
  name: string;
  sqft: number;
  baseMin: number;
  centroid: [number, number];
  /** Floorplan rect in the 358×232 viewBox: [x, y, w, h]; 2px gaps = walls. */
  rect: [number, number, number, number];
}

const ZONES: Zone[] = [
  {id: 'kitchen', name: 'Kitchen', sqft: 180, baseMin: 10, centroid: [62, 58], rect: [2, 2, 136, 112]},
  {id: 'hallway', name: 'Hallway', sqft: 90, baseMin: 6, centroid: [179, 116], rect: [140, 2, 54, 228]},
  {id: 'living', name: 'Living Room', sqft: 320, baseMin: 14, centroid: [268, 64], rect: [196, 2, 160, 120]},
  {id: 'bedroom', name: 'Bedroom', sqft: 210, baseMin: 8, centroid: [76, 178], rect: [2, 116, 136, 114]},
  {id: 'office', name: 'Office', sqft: 160, baseMin: 9, centroid: [214, 182], rect: [196, 124, 88, 106]},
  {id: 'bath', name: 'Bathroom', sqft: 60, baseMin: 5, centroid: [318, 150], rect: [286, 124, 70, 52]},
];

const ZONE_BY_ID: Record<ZoneId, Zone> = Object.fromEntries(ZONES.map(zone => [zone.id, zone])) as Record<
  ZoneId,
  Zone
>;

/** Dock/bin point — the route detours here after every 2nd zone. */
const DOCK: [number, number] = [322, 204];

const SUCTION_ADJ: Record<Suction, number> = {eco: -2, standard: 0, max: 2};
const SUCTION_LABEL: Record<Suction, string> = {eco: 'Eco', standard: 'Standard', max: 'Max'};
const SUCTION_ORDER: Suction[] = ['eco', 'standard', 'max'];

// ALL_SQFT = 180+90+320+210+160+60 = 1,020 (assert: matches the terminal
// caption 'All 1,020 sq ft mapped · 6 zones').
const ALL_SQFT = ZONES.reduce((sum, zone) => sum + zone.sqft, 0);

interface ZoneSettings {
  suction: Suction;
  passes: number; // 1–3
}

type Tab = 'clean' | 'history' | 'robot';

interface Toast {
  seq: number;
  text: string;
  /** Present only on removals — Undo restores the exact prior index. */
  undo?: {id: ZoneId; index: number};
}

interface PlanUi {
  order: ZoneId[];
  editMode: boolean;
  sheetZoneId: ZoneId | null;
  sheetDetent: 'medium' | 'large';
  screenTab: Tab;
  toast: Toast | null;
  loading: boolean;
}

interface RunPlanStore {
  plan: PlanUi;
  zones: Record<ZoneId, ZoneSettings>;
}

const INITIAL_STORE: RunPlanStore = {
  plan: {
    order: ['kitchen', 'hallway', 'living', 'bedroom'],
    editMode: false,
    sheetZoneId: null,
    sheetDetent: 'medium',
    screenTab: 'clean',
    toast: null,
    loading: false,
  },
  zones: {
    kitchen: {suction: 'max', passes: 1},
    hallway: {suction: 'standard', passes: 1},
    living: {suction: 'standard', passes: 1},
    bedroom: {suction: 'standard', passes: 1},
    office: {suction: 'standard', passes: 1},
    bath: {suction: 'eco', passes: 1},
  },
};

// History fixture (cross-checked against the same derive law): Jul 3 full
// home all-Standard 1 pass = 10+6+14+8+9+5 = 52, +3 stops (floor(6/2)) =
// 55; Jul 2 = the shipped initial plan = 40+2 = 42; Jun 30 Kitchen Max +
// Bathroom Eco = 12+3 = 15, +1 stop (floor(2/2)) = 16.
const HISTORY_RUNS = [
  {id: 'run_0703', when: 'Thu Jul 3 · 9:02 AM', detail: '6 zones · Full home · Standard', minutes: 55},
  {id: 'run_0702', when: 'Wed Jul 2 · 9:00 AM', detail: '4 zones · Morning loop · Kitchen Max', minutes: 42},
  {id: 'run_0630', when: 'Mon Jun 30 · 6:31 PM', detail: '2 zones · Kitchen + Bathroom', minutes: 16},
];

const ROBOT_FACTS = [
  {id: 'battery', label: 'Battery', value: '82%'},
  {id: 'bin', label: 'Bin fill', value: '40%'},
  {id: 'filter', label: 'Filter life', value: '120 h'},
  {id: 'brush', label: 'Side brush', value: '310 h'},
  {id: 'firmware', label: 'Firmware', value: 'v4.2.1'},
];

// ---------------------------------------------------------------------------
// DERIVE — the pure function every dependent renders from: map badges,
// RoutePathTracer, etaChip, and the Start label all read this, never their
// own copies. zoneMin = (baseMin + suctionAdj) × passes; binStops =
// floor(order.length / 2), +1 min each.
// ---------------------------------------------------------------------------

function zoneMinutes(id: ZoneId, zones: Record<ZoneId, ZoneSettings>): number {
  const zone = ZONE_BY_ID[id];
  const settings = zones[id];
  return (zone.baseMin + SUCTION_ADJ[settings.suction]) * settings.passes;
}

interface Derived {
  minutes: number;
  binStops: number;
  eta: number;
  queuedSqft: number;
  etaLabel: string;
  startLabel: string;
}

function derive(order: ZoneId[], zones: Record<ZoneId, ZoneSettings>): Derived {
  const minutes = order.reduce((sum, id) => sum + zoneMinutes(id, zones), 0);
  const binStops = Math.floor(order.length / 2);
  const eta = minutes + binStops;
  const queuedSqft = order.reduce((sum, id) => sum + ZONE_BY_ID[id].sqft, 0);
  const stopsLabel = binStops === 0 ? 'No bin stops' : binStops === 1 ? '1 bin stop' : \`\${binStops} bin stops\`;
  const etaLabel = order.length === 0 ? 'No zones selected' : \`~\${eta} min · \${stopsLabel}\`;
  const startLabel =
    order.length === 0 ? 'Select zones' : order.length === 1 ? 'Clean 1 zone' : \`Clean \${order.length} zones\`;
  return {minutes, binStops, eta, queuedSqft, etaLabel, startLabel};
}

/** Route waypoints: selected centroids in order, dock inserted after every
 * 2nd zone (after 0-based indices 1, 3, 5 — floor(n/2) dock visits, which
 * is exactly the binStops law). */
function routePoints(order: ZoneId[]): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  order.forEach((id, index) => {
    points.push(ZONE_BY_ID[id].centroid);
    if (index % 2 === 1) points.push(DOCK);
  });
  return points;
}

// ---------------------------------------------------------------------------
// HOOKS — container width (grid-feeder-console pattern) + scroll-parent
// lookup for per-tab scroll persistence.
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

/** The demo's outer scroller owns the page scroll; find it so tab switches
 * can record/restore scrollTop (per-tab state persistence law). */
function findScrollParent(element: HTMLElement | null): HTMLElement | null {
  let parent = element?.parentElement ?? null;
  while (parent != null) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
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
// WHIRLET MARK — 36px spiral sweep-path coiling into a rounded square,
// stroke BRAND_ACCENT, inside the 44×44 nav slot.
// ---------------------------------------------------------------------------

function WhirletMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={36} height={36} viewBox="0 0 36 36" fill="none" aria-hidden>
        <rect x={3} y={3} width={30} height={30} rx={9} stroke={BRAND_ACCENT} strokeWidth={2} />
        <path
          d="M18 10c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3-6.5 6-6.5 5 2.2 5 5-1.8 4-4 4"
          stroke={BRAND_ACCENT}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ZONE FLOORPLAN SVG — 358×232 viewBox, six rooms as rounded rects with
// 2px gaps reading as walls. Each room <g> is a real role="button"
// (tabIndex 0, Enter/Space toggles) — the map's tap path; the 60px zone
// rows below are the mandatory 44px-row button path for the identical
// toggles. Selected rooms get a 2px BRAND_ACCENT stroke plus a 24px
// run-order badge at the centroid (badge numeral = order.indexOf(id)+1).
// Bathroom (70×52 units ≈ 56×42px at 320) and the Hallway corridor
// (54 units ≈ 43px wide at 320) carry transparent expanded hit rects so
// every room stays ≥44px effective at 320 (responsive contract).
// ---------------------------------------------------------------------------

interface FloorplanProps {
  order: ZoneId[];
  onToggle: (id: ZoneId, opener?: HTMLElement | null) => void;
  reducedMotion: boolean;
}

function ZoneFloorplanSVG({order, onToggle, reducedMotion}: FloorplanProps) {
  const points = routePoints(order);
  const routeD = points.map(([x, y], index) => \`\${index === 0 ? 'M' : 'L'} \${x} \${y}\`).join(' ');
  const routeKey = order.join('-');
  return (
    <svg viewBox="0 0 358 232" style={styles.floorplanSvg} preserveAspectRatio="xMidYMid meet" role="group" aria-label="Home floorplan — tap a room to queue it">
      {ZONES.map(zone => {
        const [x, y, w, h] = zone.rect;
        const selected = order.includes(zone.id);
        const badgeNo = order.indexOf(zone.id) + 1;
        const [cx, cy] = zone.centroid;
        // Expanded transparent hit rects for the two sub-44px rooms.
        const hitPad = zone.id === 'bath' ? {x: 284, y: 118, w: 74, h: 66} : zone.id === 'hallway' ? {x: 138, y: 2, w: 58, h: 228} : null;
        return (
          <g
            key={zone.id}
            className="wzr-room"
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={\`\${zone.name}, \${zone.sqft} square feet\`}
            style={{cursor: 'pointer'}}
            onClick={event => onToggle(zone.id, event.currentTarget as unknown as HTMLElement)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggle(zone.id, event.currentTarget as unknown as HTMLElement);
              }
            }}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={8}
              fill={ROOM_FILLS[zone.id]}
              stroke={selected ? BRAND_ACCENT : 'transparent'}
              strokeWidth={2}
            />
            {hitPad != null ? (
              <rect x={hitPad.x} y={hitPad.y} width={hitPad.w} height={hitPad.h} fill="transparent" />
            ) : null}
            <text
              x={zone.id === 'hallway' ? 167 : x + 10}
              y={y + 18}
              textAnchor={zone.id === 'hallway' ? 'middle' : 'start'}
              fontSize={11}
              fontWeight={500}
              fill="var(--color-text-primary)"
              style={{pointerEvents: 'none'}}>
              {zone.name}
            </text>
            {selected ? (
              <g className={reducedMotion ? undefined : 'wzr-stamp'} key={\`badge-\${badgeNo}\`} style={{pointerEvents: 'none'}}>
                <circle cx={cx} cy={cy} r={12} fill={BRAND_ACCENT} />
                {/* 13/700 badge numeral — BRAND_FILL_TEXT (math at decl). */}
                <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill={BRAND_FILL_TEXT}>
                  {badgeNo}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      {/* Dock nook — muted pad + 16px rounded-square charger glyph at
          (322,204); the route detours here for bin stops. */}
      <rect x={286} y={178} width={70} height={52} rx={8} fill="var(--color-background-muted)" />
      <g style={{pointerEvents: 'none'}} aria-hidden>
        <rect x={314} y={196} width={16} height={16} rx={4} stroke="var(--color-text-secondary)" strokeWidth={1.5} fill="none" />
        <path d="M322.8 198.5 319.5 204h2.6l-1 3.6 3.4-5.6h-2.6l1-3.5Z" fill="var(--color-text-secondary)" />
      </g>
      {/* ROUTE PATH TRACER — decorative (aria-hidden; the queue rail is the
          accessible order). Dotted brand polyline through the ordered
          centroids + dock detours; keyed remount re-runs the 600ms
          dashoffset march; fully drawn instantly under reduced motion. */}
      {points.length > 1 ? (
        <path
          key={routeKey}
          className={reducedMotion ? undefined : 'wzr-trace'}
          d={routeD}
          stroke={BRAND_ACCENT}
          strokeWidth={2.5}
          strokeDasharray="2 7"
          strokeLinecap="round"
          fill="none"
          aria-hidden
          style={{pointerEvents: 'none'}}
        />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RUN QUEUE CHIPS — horizontal snap rail where chip index IS the badge
// number. Pointer drag on the visible 44×44 grip handle reorders (swap
// when the pointer crosses a sibling chip's box); Edit mode swaps the grip
// for paired 44×44 ChevronLeft/Right buttons — the mandatory non-gesture
// path (gesture-with-button-path law). Reordering fires ONE
// update('plan',{order}); badges, route, etaChip, Start label re-derive.
// ---------------------------------------------------------------------------

interface RunQueueChipsProps {
  order: ZoneId[];
  zones: Record<ZoneId, ZoneSettings>;
  editMode: boolean;
  queuedSqft: number;
  onToggleEdit: () => void;
  onMove: (from: number, to: number) => void;
}

function RunQueueChips({order, zones, editMode, queuedSqft, onToggleEdit, onMove}: RunQueueChipsProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  // Transient pointer-drag state only — the order itself lives in the
  // single state owner (refs, not state: no re-render per pointermove).
  const dragIndexRef = useRef<number | null>(null);

  const onGripPointerDown = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragIndexRef.current = index;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGripPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const from = dragIndexRef.current;
    const rail = railRef.current;
    if (from == null || rail == null) return;
    const chips = Array.from(rail.querySelectorAll<HTMLElement>('[data-wzr-chip]'));
    for (let j = 0; j < chips.length; j++) {
      if (j === from) continue;
      const rect = chips[j].getBoundingClientRect();
      // Swap at midpoint crossing of the hovered sibling.
      if (event.clientX > rect.left + rect.width * 0.25 && event.clientX < rect.left + rect.width * 0.75) {
        onMove(from, j);
        dragIndexRef.current = j;
        break;
      }
    }
  };
  const onGripPointerUp = () => {
    dragIndexRef.current = null;
  };

  return (
    <div ref={railRef} style={styles.runQueueRail} role="list" aria-label="Run queue, in order">
      {order.map((id, index) => {
        const zone = ZONE_BY_ID[id];
        const minutes = zoneMinutes(id, zones);
        return (
          <div key={id} role="listitem" data-wzr-chip style={styles.chip}>
            <span style={styles.chipDisc} aria-hidden>
              {index + 1}
            </span>
            <span style={styles.chipName}>{zone.name}</span>
            <span style={styles.chipMin}>{minutes}m</span>
            {editMode ? (
              <>
                <button
                  type="button"
                  className="wzr-btn wzr-focusable"
                  style={{...styles.chevBtn, ...(index === 0 ? styles.chevBtnDisabled : null)}}
                  aria-label={\`Move \${zone.name} earlier\`}
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}>
                  <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                </button>
                <button
                  type="button"
                  className="wzr-btn wzr-focusable"
                  style={{...styles.chevBtn, ...(index === order.length - 1 ? styles.chevBtnDisabled : null)}}
                  aria-label={\`Move \${zone.name} later\`}
                  disabled={index === order.length - 1}
                  onClick={() => onMove(index, index + 1)}>
                  <Icon icon={ChevronRightIcon} size="md" color="inherit" />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="wzr-btn wzr-focusable"
                style={styles.gripBtn}
                aria-label={\`Reorder \${zone.name} — use Edit for button reordering\`}
                onPointerDown={onGripPointerDown(index)}
                onPointerMove={onGripPointerMove}
                onPointerUp={onGripPointerUp}
                onClick={onToggleEdit}>
                <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
              </button>
            )}
          </div>
        );
      })}
      <button type="button" className="wzr-btn wzr-focusable" style={styles.editChip} onClick={onToggleEdit}>
        {editMode ? 'Done' : 'Edit'}
      </button>
      {/* Queued-area caption — 800 sq ft on the shipped fixture
          (180+90+320+210); the empty state invites the map. */}
      <span style={styles.railCaption}>
        {order.length === 0 ? 'Tap rooms on the map to queue them' : \`\${queuedSqft.toLocaleString('en-US')} sq ft queued\`}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ZONE OPTIONS SHEET — medium-detent (55%) bottom sheet per zone: grabber
// (real 'Resize sheet' button toggling 55% / calc(100% − 56px)), 52px
// header with 44×44 X, inner overflowY auto (the one legal inner
// scroller). Include-in-run switch row (whole row role="switch"), SUCTION
// segmented radiogroup with arrow keys, PASSES 96×32 stepper (spinbutton,
// min 1 / max 3, exhausted half at 35% opacity), and the RUN CHECKLIST —
// all six zones as 44px checkbox rows calling the SAME toggleZone the map
// and rows call. Focus enters via focus({preventScroll: true}) (plain
// .focus() would scroll-reveal the animating sheet inside the locked
// overflow-hidden shell and beach it mid-screen) and restores to the
// opening SlidersHorizontal on every close path.
// ---------------------------------------------------------------------------

interface ZoneOptionsSheetProps {
  zoneId: ZoneId;
  order: ZoneId[];
  zones: Record<ZoneId, ZoneSettings>;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onToggleZone: (id: ZoneId) => void;
  onSetSuction: (id: ZoneId, suction: Suction) => void;
  onSetPasses: (id: ZoneId, passes: number) => void;
}

function ZoneOptionsSheet({
  zoneId,
  order,
  zones,
  detent,
  reducedMotion,
  sheetRef,
  onDetentChange,
  onClose,
  onToggleZone,
  onSetSuction,
  onSetPasses,
}: ZoneOptionsSheetProps) {
  const zone = ZONE_BY_ID[zoneId];
  const settings = zones[zoneId];
  const included = order.includes(zoneId);
  const dragYRef = useRef<number | null>(null);
  const movedRef = useRef(false);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragYRef.current = event.clientY;
    movedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragYRef.current == null) return;
    if (Math.abs(event.clientY - dragYRef.current) > 8) movedRef.current = true;
  };
  const onGrabberPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragYRef.current == null) return;
    const dy = event.clientY - dragYRef.current;
    dragYRef.current = null;
    if (!movedRef.current) return; // plain click handled by onClick
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
    const current = SUCTION_ORDER.indexOf(settings.suction);
    const next = event.key === 'ArrowRight' ? Math.min(current + 1, 2) : Math.max(current - 1, 0);
    onSetSuction(zoneId, SUCTION_ORDER[next]);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
    buttons[next]?.focus({preventScroll: true});
  };

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wzr-sheet-title"
      tabIndex={-1}
      className="wzr-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="wzr-btn wzr-focusable"
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
        <h2 id="wzr-sheet-title" style={styles.sheetTitle}>
          {zone.name} options
        </h2>
        <button type="button" className="wzr-btn wzr-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        {/* Include-in-run — whole 44px row IS the switch. */}
        <button
          type="button"
          role="switch"
          aria-checked={included}
          className="wzr-btn wzr-focusable"
          style={styles.switchRow}
          onClick={() => onToggleZone(zoneId)}>
          <span style={styles.switchLabel}>Include in run</span>
          <span style={{...styles.switchTrack, ...(included ? styles.switchTrackOn : null)}} aria-hidden>
            <span
              className="wzr-anim"
              style={{...styles.switchThumb, transform: included ? 'translateX(20px)' : undefined}}
            />
          </span>
        </button>

        <h3 style={styles.sheetSectionHeader}>Suction</h3>
        <div role="radiogroup" aria-label={\`Suction for \${zone.name}\`} style={styles.segTrack} onKeyDown={onSegKeyDown}>
          {SUCTION_ORDER.map(suction => {
            const active = settings.suction === suction;
            return (
              <button
                key={suction}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                className="wzr-btn wzr-focusable"
                style={{...styles.segBtn, ...(active ? styles.segBtnActive : null)}}
                onClick={() => onSetSuction(zoneId, suction)}>
                {SUCTION_LABEL[suction]}
              </button>
            );
          })}
        </div>

        <h3 style={styles.sheetSectionHeader}>Passes</h3>
        <div style={styles.stepperRow}>
          <span
            role="spinbutton"
            aria-valuenow={settings.passes}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-label={\`Passes for \${zone.name}\`}
            tabIndex={0}
            className="wzr-focusable"
            style={styles.stepperValue}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onSetPasses(zoneId, Math.min(3, settings.passes + 1));
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                onSetPasses(zoneId, Math.max(1, settings.passes - 1));
              }
            }}>
            {settings.passes} {settings.passes === 1 ? 'pass' : 'passes'}
          </span>
          <div style={styles.stepperTrack}>
            <button
              type="button"
              className="wzr-btn wzr-focusable"
              style={{...styles.stepHalf, ...(settings.passes <= 1 ? styles.stepHalfDisabled : null)}}
              aria-label={\`Decrease passes for \${zone.name}\`}
              disabled={settings.passes <= 1}
              onClick={() => onSetPasses(zoneId, settings.passes - 1)}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.stepDividerV} aria-hidden />
            <button
              type="button"
              className="wzr-btn wzr-focusable"
              style={{...styles.stepHalf, ...(settings.passes >= 3 ? styles.stepHalfDisabled : null)}}
              aria-label={\`Increase passes for \${zone.name}\`}
              disabled={settings.passes >= 3}
              onClick={() => onSetPasses(zoneId, settings.passes + 1)}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </div>
        </div>

        {/* RUN CHECKLIST — the sheet-checklist path: identical toggleZone
            calls as SVG room taps and the 60px rows (path parity). */}
        <h3 style={styles.sheetSectionHeader}>Run checklist</h3>
        {ZONES.map(item => {
          const selected = order.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              className="wzr-btn wzr-focusable"
              style={{...styles.checklistRow, ...(selected ? styles.checklistRowSelected : null)}}
              onClick={() => onToggleZone(item.id)}>
              <span style={{...styles.keyDot, ...(selected ? styles.keyDotSelected : null), background: ROOM_FILLS[item.id]}} aria-hidden>
                {selected ? (
                  <span style={styles.keyDotCheck}>
                    <Icon icon={CheckIcon} size="xsm" color="inherit" />
                  </span>
                ) : null}
              </span>
              <span style={styles.checklistName}>{item.name}</span>
              <span style={styles.checklistMin}>{zoneMinutes(item.id, zones)}m</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — RunPlanStore is the single owner; update('plan', patch) or
// update(zoneId, patch) is the only write path. Four dependents render
// from derive() alone: map badges, RoutePathTracer, etaChip, Start label.
// ---------------------------------------------------------------------------

export default function MobileVacuumZoneRunnerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<RunPlanStore>(INITIAL_STORE);
  const {plan, zones} = store;

  // ONE update(id, patch): 'plan' patches the plan/ui slab; a zone id
  // patches zones[id] ({suction} | {passes}).
  const update = useCallback((id: 'plan' | ZoneId, patch: Partial<PlanUi> & Partial<ZoneSettings>) => {
    setStore(prev =>
      id === 'plan'
        ? {...prev, plan: {...prev.plan, ...(patch as Partial<PlanUi>)}}
        : {...prev, zones: {...prev.zones, [id]: {...prev.zones[id], ...(patch as Partial<ZoneSettings>)}}},
    );
  }, []);

  const toastSeqRef = useRef(0);
  const toastPatch = (text: string, undo?: Toast['undo']): Partial<PlanUi> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  // Focus plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  // Per-tab scroll persistence (ergonomics law) — demo scroller scrollTop
  // keyed by tab, recorded on exit, restored on entry.
  const scrollTopsRef = useRef<Record<Tab, number>>({clean: 0, history: 0, robot: 0});

  const derived = derive(plan.order, zones);

  // ---- Skeleton lifecycle: RefreshCw press is the ONLY trigger; resolves
  // on the NEXT user action (second Refresh press or any zone toggle) —
  // never on a timer. 'Loading zones' announces once via the toast dock.
  const onRefresh = () => {
    if (plan.loading) {
      update('plan', {loading: false, ...toastPatch('Updated just now')});
    } else {
      update('plan', {loading: true, ...toastPatch('Loading zones')});
    }
  };

  // ---- toggleZone — the ONE toggle path shared by SVG rooms, 60px rows,
  // and the sheet checklist. Deselection executes immediately and offers
  // Undo (undoOverConfirm — no confirm dialogs anywhere); Undo restores
  // the exact prior order index.
  const toggleZone = (id: ZoneId) => {
    const zone = ZONE_BY_ID[id];
    const index = plan.order.indexOf(id);
    const loadingPatch = plan.loading ? {loading: false} : null;
    if (index >= 0) {
      const order = plan.order.filter(existing => existing !== id);
      update('plan', {order, ...loadingPatch, ...toastPatch(\`\${zone.name} removed from run\`, {id, index})});
    } else {
      const order = [...plan.order, id];
      update('plan', {order, ...loadingPatch, ...toastPatch(\`\${zone.name} added to run\`)});
    }
  };

  const undoRemove = () => {
    const undo = plan.toast?.undo;
    if (undo == null) return;
    const order = [...plan.order];
    order.splice(Math.min(undo.index, order.length), 0, undo.id);
    update('plan', {order, ...toastPatch('Restored')});
  };

  // ---- Reorder (chips drag or edit-mode chevrons): ONE order write;
  // announce on settle, never per drag frame.
  const moveZone = (from: number, to: number) => {
    if (to < 0 || to >= plan.order.length || from === to) return;
    const order = [...plan.order];
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    update('plan', {order, ...toastPatch(\`\${ZONE_BY_ID[moved].name} moved to position \${to + 1}\`)});
  };

  // ---- Sheet lifecycle: opener recorded; focus restored on EVERY close
  // path (X, scrim, Escape, tab switch).
  const openSheet = (zoneId: ZoneId, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('plan', {sheetZoneId: zoneId, sheetDetent: 'medium'});
  };
  const closeSheet = () => {
    update('plan', {sheetZoneId: null, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };

  // focus({preventScroll: true}) — plain .focus() scroll-reveals the
  // animating sheet inside the locked overflow-hidden shell.
  useEffect(() => {
    if (plan.sheetZoneId != null) {
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [plan.sheetZoneId]);

  // Escape closes the topmost overlay only (the sheet is the only layer).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && plan.sheetZoneId != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.sheetZoneId]);

  // ---- Tabs: per-tab scroll persistence + the one legal reset (re-tap
  // active tab pops to top). Sheets close on tab switch; toast persists.
  const selectTab = (tab: Tab) => {
    const scroller = findScrollParent(shellRef.current);
    if (tab === plan.screenTab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    if (scroller != null) scrollTopsRef.current[plan.screenTab] = scroller.scrollTop;
    update('plan', {screenTab: tab, sheetZoneId: null, editMode: false});
    requestAnimationFrame(() => {
      const target = findScrollParent(shellRef.current);
      if (target != null) target.scrollTop = scrollTopsRef.current[tab];
    });
  };

  const onStart = () => {
    if (plan.order.length === 0) return;
    update('plan', toastPatch(\`Mission started · \${derived.startLabel.replace('Clean ', '')} · ~\${derived.eta} min\`));
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(plan.sheetZoneId != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const navTitle = plan.screenTab === 'clean' ? 'Zone Runner' : plan.screenTab === 'history' ? 'History' : 'Robot';

  // Deterministic staggered skeleton widths (never Math.random()).
  const skeletonPrimary = ['60%', '45%', '70%', '60%', '45%', '70%'];
  const skeletonSecondary = ['40%', '55%', '30%', '40%', '55%', '30%'];

  const toastNode =
    plan.toast != null ? (
      <div key={plan.toast.seq} style={styles.toast} className="wzr-fade">
        <span style={styles.toastText}>{plan.toast.text}</span>
        {plan.toast.undo != null ? (
          <>
            <span style={styles.toastRule} aria-hidden />
            <button type="button" className="wzr-btn wzr-focusable" style={styles.toastUndo} onClick={undoRemove}>
              Undo
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{WZR_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <WhirletMark />
          </div>
          <h1 style={styles.navTitle}>{navTitle}</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="wzr-btn wzr-focusable"
              style={styles.iconBtn}
              aria-label="Refresh zones"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {plan.screenTab === 'clean' ? (
          <main style={styles.main}>
            <span className="wzr-vh">Whirlet Zone Runner</span>

            {/* FLOORPLAN — sticky top:52 z15; 12 + 232 + 12 = 256px. */}
            <div style={styles.floorplanPane}>
              <ZoneFloorplanSVG order={plan.order} onToggle={id => toggleZone(id)} reducedMotion={reducedMotion} />
              <div style={styles.etaChip} role="status">
                {derived.etaLabel}
              </div>
            </div>

            {/* RUN QUEUE RAIL — 68px, snap-x. */}
            <RunQueueChips
              order={plan.order}
              zones={zones}
              editMode={plan.editMode}
              queuedSqft={derived.queuedSqft}
              onToggleEdit={() => update('plan', {editMode: !plan.editMode})}
              onMove={moveZone}
            />

            <h2 style={styles.sectionHeader}>Zones</h2>
            <div style={styles.listCard} aria-busy={plan.loading || undefined}>
              {plan.loading
                ? ZONES.map((zone, index) => (
                    <div key={zone.id}>
                      <div style={styles.skeletonRow} aria-hidden className="wzr-skeleton">
                        <span style={styles.skeletonCircle} />
                        <span style={styles.skeletonBars}>
                          <span style={{...styles.skeletonBar, width: skeletonPrimary[index], ...styles.skeletonShimmerClip}}>
                            <span className="wzr-shimmer" style={styles.skeletonShimmer} />
                          </span>
                          <span style={{...styles.skeletonBar, width: skeletonSecondary[index], ...styles.skeletonShimmerClip}}>
                            <span className="wzr-shimmer" style={styles.skeletonShimmer} />
                          </span>
                        </span>
                      </div>
                      {index < ZONES.length - 1 ? <div style={styles.rowDivider} /> : null}
                    </div>
                  ))
                : ZONES.map((zone, index) => {
                    const selected = plan.order.includes(zone.id);
                    const settings = zones[zone.id];
                    return (
                      <div key={zone.id}>
                        <div style={styles.zoneRowWrap}>
                          <button
                            type="button"
                            className="wzr-btn wzr-focusable"
                            style={styles.zoneRowBtn}
                            aria-pressed={selected}
                            aria-label={\`\${zone.name}, \${zone.sqft} square feet\${selected ? ', in run' : ''}\`}
                            onClick={() => toggleZone(zone.id)}>
                            <span
                              style={{...styles.keyDot, ...(selected ? styles.keyDotSelected : null), background: ROOM_FILLS[zone.id]}}
                              aria-hidden>
                              {selected ? (
                                <span style={styles.keyDotCheck}>
                                  <Icon icon={CheckIcon} size="xsm" color="inherit" />
                                </span>
                              ) : null}
                            </span>
                            <span style={styles.zoneRowText}>
                              <span style={styles.zoneRowPrimary}>{zone.name}</span>
                              <span style={styles.zoneRowSecondary}>
                                {zone.sqft} sq ft · {SUCTION_LABEL[settings.suction]} ·{' '}
                                {settings.passes} {settings.passes === 1 ? 'pass' : 'passes'}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="wzr-btn wzr-focusable"
                            style={styles.iconBtn}
                            aria-label={\`Options for \${zone.name}\`}
                            onClick={event => openSheet(zone.id, event.currentTarget)}>
                            <Icon icon={SlidersHorizontalIcon} size="sm" color="inherit" />
                          </button>
                        </div>
                        {index < ZONES.length - 1 ? <div style={styles.rowDivider} /> : null}
                      </div>
                    );
                  })}
            </div>
            {/* Terminal caption — All 1,020 sq ft mapped (asserted at the
                ALL_SQFT declaration). */}
            <div style={styles.terminalCaption}>All {ALL_SQFT.toLocaleString('en-US')} sq ft mapped · {ZONES.length} zones</div>
          </main>
        ) : plan.screenTab === 'history' ? (
          <main style={styles.main}>
            <span className="wzr-vh">Whirlet run history</span>
            <h2 style={styles.sectionHeader}>Recent runs</h2>
            <div style={styles.listCard}>
              {HISTORY_RUNS.map((run, index) => (
                <div key={run.id}>
                  <div style={styles.historyRow}>
                    <span style={styles.zoneRowPrimary}>{run.when}</span>
                    <span style={styles.zoneRowSecondary}>
                      {run.detail} · {run.minutes} min
                    </span>
                  </div>
                  {index < HISTORY_RUNS.length - 1 ? <div style={styles.rowDivider} /> : null}
                </div>
              ))}
            </div>
            <div style={styles.terminalCaption}>All 3 runs this week</div>
          </main>
        ) : (
          <main style={styles.main}>
            <span className="wzr-vh">Whirlet robot status</span>
            <h2 style={styles.sectionHeader}>Whirlet S6</h2>
            <div style={styles.listCard}>
              {ROBOT_FACTS.map((fact, index) => (
                <div key={fact.id}>
                  <div style={styles.robotRow}>
                    <span>{fact.label}</span>
                    <span style={styles.robotValue}>{fact.value}</span>
                  </div>
                  {index < ROBOT_FACTS.length - 1 ? <div style={styles.rowDivider} /> : null}
                </div>
              ))}
            </div>
            <div style={styles.terminalCaption}>Docked · charging complete</div>
          </main>
        )}

        {/* TOAST DOCK — the single polite live region. Sticky-in-flow above
            the footer+tabBar (bottom 156) normally; absolute bottom:76 z30
            ONLY while the sheet scroll-lock is active. */}
        <div
          style={plan.sheetZoneId != null ? styles.toastDockLocked : styles.toastDockSticky}
          aria-live="polite">
          {toastNode}
        </div>

        {plan.screenTab === 'clean' ? (
          <footer style={styles.stickyFooter}>
            <button
              type="button"
              className="wzr-btn wzr-focusable"
              style={{...styles.startBtn, ...(plan.order.length === 0 ? styles.startBtnDisabled : null)}}
              aria-disabled={plan.order.length === 0}
              onClick={onStart}>
              {derived.startLabel}
            </button>
          </footer>
        ) : null}

        <nav style={styles.tabBar} aria-label="Whirlet sections">
          {(
            [
              {tab: 'clean' as Tab, label: 'Clean', icon: SparklesIcon},
              {tab: 'history' as Tab, label: 'History', icon: ClockIcon},
              {tab: 'robot' as Tab, label: 'Robot', icon: BotIcon},
            ]
          ).map(item => {
            const active = plan.screenTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                className="wzr-btn wzr-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-current={active ? 'page' : undefined}
                onClick={() => selectTab(item.tab)}>
                <Icon icon={item.icon} size="md" color="inherit" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {plan.sheetZoneId != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <ZoneOptionsSheet
              zoneId={plan.sheetZoneId}
              order={plan.order}
              zones={zones}
              detent={plan.sheetDetent}
              reducedMotion={reducedMotion}
              sheetRef={sheetRef}
              onDetentChange={detent => update('plan', {sheetDetent: detent})}
              onClose={closeSheet}
              onToggleZone={toggleZone}
              onSetSuction={(id, suction) => update(id, {suction})}
              onSetPasses={(id, passes) => update(id, {passes})}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};