var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Switchback go/no-go instrument
 *   for Cascade Pass (t-cascade: trailhead 2,400 ft, summit 5,600 ft,
 *   4.8 mi one way). Six condition segments whose gains cross-check the
 *   profile exactly (400+500+600+700+600+400 = 3,200 = 5,600−2,400 ✓;
 *   miles 1.0+0.8+0.8+0.8+0.8+0.6 = 4.8 ✓), ten hiker reports whose
 *   confidence derives verbatim from conf = max(20, 100 − 3×ageHours),
 *   a 5-item base pack plus 3 condition-triggered items, and two static
 *   saved trails. No Date.now(), no Math.random(), no network media —
 *   every age is a fixture int, every mini-profile is inline SVG.
 * @output Switchback — Trail Conditions Scout: a 390px MOBILE trail
 *   go/no-go surface. Trails tab loads pushed onto the Cascade Pass
 *   detail: a large-title collapsing header ('Cascade Pass' 28/700 over
 *   an IntersectionObserver sentinel) with a live verdict pill
 *   ('CAUTION · icy above 3.4 mi' + 'Est 5h 48m' chip), an SVG
 *   ElevationConditionRibbon whose mud/snow/ice/clear bands paint under
 *   the elevation curve and dim to 30% past the flag, a draggable
 *   TurnaroundFlag riding the curve (stepper + sheet button fallbacks),
 *   and a freshness-weighted ReportFreshnessStack with decay-ring
 *   avatars. Signature move: ONE turnaroundMile assignment re-dims the
 *   bands, recomputes the time estimate, flips CAUTION↔GO at mi 3.4,
 *   grows/shrinks the Pack tab (badge 8→7→5), and rewrites the
 *   Trails-root card meta — five derived reads in the same render.
 *   Tab bar: Trails / Pack / Reports; two-detent segment sheet with
 *   'Set turnaround here'; sticky-in-flow toast dock with pack Undo.
 * @position Page template; emitted by \`astryx template mobile-trail-conditions-scout\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet,
 *   toast-in-lock) are position:'absolute' INSIDE shell; position:fixed
 *   is banned. While the segment sheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. The
 *   stage clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for avatar-led report
 *   rows); no desktop Layout frames, no asides, no data tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Switchback fir green). Condition band fills, condition
 *   text pairs, the CAUTION amber pair, and the switch OFF track are the
 *   sanctioned non-brand literals — each declared once with contrast
 *   math. DEVIATION (binding amendment over spec): the spec's pastel
 *   band pairs (#DCEBD6/#C9A87C/#C7DAF2/#9FC4D8) measure only ~1.2–1.5:1
 *   against the card surface; meaningful rest fills need ≥3:1 vs their
 *   ACTUAL surface, so the shipped pairs below are deepened to pass
 *   (math at each declaration) while keeping the mud/snow/ice/clear hue
 *   family readable.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', blur surface
 *   color-mix 86% + blur(12px), borderBottom hairline ALWAYS ON — this
 *   template does not wire scroll-under, noted per contract); largeTitle
 *   row 52px in flow (28/700 at the 16px gutter; total large header
 *   104px); tabBar 64px sticky bottom z20 (3 tabItems flex:1, 24px icon
 *   over 11/500 label, 4px gap; Pack badge 16px-min brand pill 10/600 at
 *   top:−4 right:−8); rows 44px utility (turnaround stepper) / 60px
 *   two-line (pack) / 72px media (reports, 40px decay-ring avatar;
 *   trails, 48px thumb); sectionHeader 13/600 uppercase 0.06em at 32px,
 *   20/8 margins; searchBar 52px with 36px searchField; segmented track
 *   36px. TYPE (Figtree via --font-family-body): 28/700 large title ·
 *   22/700 section · 17/600 nav+sheet titles · 16/400–600 body · 13/400
 *   meta · 11/500 overlines; nothing under 11px; tabular-nums on every
 *   mileage, elevation, %, and time figure. Buttons: 48px primary
 *   full-width r12 · 36px secondary · 44×44 icon. Touch: every target
 *   ≥44×44 with ≥8px clearance or merged into a full-row button; every
 *   gesture (flag drag, ribbon scrub, sheet drag) has a visible button
 *   path (±0.2 stepper + spinbutton, slider-role ribbon, grabber + X).
 * Corner map: stage clips at 16 — shell paints square. Sheet 16/16/0/0.
 *   Cards/thumbnails/searchField/toast 12. Segmented track 12, active
 *   pill 8. Stepper/chips/value pills 8. Verdict pill, badges, switch
 *   track, grabber 999. Decay rings: perfect SVG circles. No FAB.
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals. Ribbon SVG: viewBox
 *   '0 0 358 140' + width:'100%' height:'auto' (uniform scaling; pointer
 *   mile derives from getBoundingClientRect at pointer time, so drag
 *   math is width-agnostic). Verdict row wraps below ~360px (flexWrap,
 *   8px gap, time chip drops under the pill). Trail-card meta ellipsizes
 *   to one line. Stepper row never wraps (label ellipsizes; stepper +
 *   value are fixed 96+8+64). Lens card clamps 8px inside the ribbon.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — ≥720px renders the
 *   phone experience as a centered column (maxWidth 430, marginInline
 *   auto, borderInline hairline). No adaptive relayout.
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
  BackpackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagTriangleRightIcon,
  MapIcon,
  MessagesSquareIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Switchback fir green). #3F7A4E on #FFFFFF
// ≈ 5.0:1 (passes 4.5:1 for the 13px/600 GO pill text inverse and 3:1 as a
// fill); #7FC08F on the dark body (~#1a1712) ≈ 7.5:1.
const BRAND_ACCENT = 'light-dark(#3F7A4E, #7FC08F)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #3F7A4E ≈ 5.0:1. Dark:
// white on #7FC08F fails (~1.7:1), so the dark side flips to a near-black
// fir — #14291A on #7FC08F ≈ 8.6:1. (Spec said "white text on the pill";
// deviation on the dark side only, per house contrast rule.)
const BRAND_ON = 'light-dark(#FFFFFF, #14291A)';
// 12% brand wash for the brand mark tile + active segment tint.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Verdict CAUTION amber fill. #FFFFFF on #B45309 ≈ 4.6:1 (13px/600 pill
// text, passes 4.5:1); dark pill #F5A94E carries #3A2308 text ≈ 8.9:1.
const CAUTION_FILL = 'light-dark(#B45309, #F5A94E)';
const CAUTION_ON = 'light-dark(#FFFFFF, #3A2308)';
// Switch OFF track — an interactive control boundary at rest, so it needs
// ≥3:1 against the CARD surface (binding amendment; the foundations'
// 14%/22% alpha tracks measure ~1.3:1 and were the batch-2 finding class).
// #8D8D92 vs #FFFFFF ≈ 3.3:1 ✓; #74747B vs the dark card ≈ 3.4:1 ✓.
const SWITCH_OFF_TRACK = 'light-dark(#8D8D92, #74747B)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// CONDITION BAND FILLS — meaningful rest fills painted under the elevation
// curve, so each needs ≥3:1 vs the CARD surface it sits on (the 30% dim
// past the flag is the clip feedback; a pastel base would make the dimmed
// state vanish). Approx WCAG ratios, light vs #FFFFFF / dark vs ~#232120:
//   clear #4E8A5F 4.1:1 ✓ / #6FA97E 5.9:1 ✓
//   mud   #8A6A3B 5.0:1 ✓ / #C29A63 6.2:1 ✓
//   snow  #4A7AB5 4.4:1 ✓ / #8FB4E3 7.5:1 ✓
//   ice   #2F6C8A 5.8:1 ✓ / #7CC3DE 8.1:1 ✓
const BAND_CLEAR = 'light-dark(#4E8A5F, #6FA97E)';
const BAND_MUD = 'light-dark(#8A6A3B, #C29A63)';
const BAND_SNOW = 'light-dark(#4A7AB5, #8FB4E3)';
const BAND_ICE = 'light-dark(#2F6C8A, #7CC3DE)';

// CONDITION TEXT PAIRS — darker/lighter than the band fills so 13px/600
// conf% meta and 11px chips pass 4.5:1 on the card (light vs #FFFFFF /
// dark vs ~#232120):
//   clear #2F6B40 6.4:1 ✓ / #8FD0A0 9.4:1 ✓
//   mud   #77531F 6.9:1 ✓ / #D9B071 7.9:1 ✓
//   snow  #2F5C94 6.8:1 ✓ / #A9C6EE 8.9:1 ✓
//   ice   #1D5A75 7.6:1 ✓ / #8FD0E8 9.5:1 ✓  (spec's example pair)
const TEXT_CLEAR = 'light-dark(#2F6B40, #8FD0A0)';
const TEXT_MUD = 'light-dark(#77531F, #D9B071)';
const TEXT_SNOW = 'light-dark(#2F5C94, #A9C6EE)';
const TEXT_ICE = 'light-dark(#1D5A75, #8FD0E8)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet slide-in, reduced-motion guard. Transitions animate transform /
// opacity / color only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const SWB_CSS = \`
.swb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.swb-btn:disabled { cursor: default; }
.swb-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.swb-fade { transition: opacity 200ms ease; }
@keyframes swb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.swb-sheet-in { animation: swb-sheet-in 240ms ease; }
.swb-vh {
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
  .swb-fade { transition: none; }
  .swb-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — the desktop stage is ~1045px inside a 1440px window,
  // so only container width (ResizeObserver) can tell the stages apart.
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
  // Scroll lock while the segment sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline ALWAYS ON.
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    margin: 0,
  },
  // Detail navBar center title starts opacity 0; fades in when the
  // IntersectionObserver sentinel scrolls under the bar.
  navTitleHidden: {opacity: 0},
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LARGE TITLE — 52px row in flow below the sticky navBar (detail only).
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sentinel: {height: 1},
  // VERDICT PILL ROW — in flow, part of the collapsing header block; wraps
  // below ~360px (flexWrap, 8px gap; the time chip drops under the pill).
  verdictRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    marginBottom: 12,
  },
  // 32px pill visual inside a 44px-tall hit (8px block padding merged into
  // the button so the target clears 44 while the pill reads 32).
  verdictPillHit: {paddingBlock: 6, borderRadius: 999, display: 'flex', minWidth: 0},
  verdictPill: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  verdictGo: {background: BRAND_ACCENT, color: BRAND_ON},
  verdictCaution: {background: CAUTION_FILL, color: CAUTION_ON},
  timeChip: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // RIBBON CARD — 16px padding + 24px mile-axis row (≈200px total).
  ribbonCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
  ribbonStage: {position: 'relative', touchAction: 'none'},
  ribbonSvg: {display: 'block', width: '100%', height: 'auto'},
  // Transparent overlay band buttons — full-height hit areas per segment
  // (≥44px tall at every width; s6 is ~41px wide at 390, merged-target
  // clause: the whole band column is one target with no neighbor inside
  // 8px vertically).
  bandHit: {position: 'absolute', top: 0, bottom: 0, borderRadius: 4},
  pinHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 999,
  },
  flagHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    color: BRAND_ACCENT,
    touchAction: 'none',
    cursor: 'grab',
  },
  // Scrub lens — 120×44 card pinned above the touch point, clamped 8px
  // inside the ribbon bounds.
  lensLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    background: 'var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  lensCard: {
    position: 'absolute',
    top: -48,
    width: 120,
    height: 44,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingInline: 10,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 5,
  },
  axisRow: {position: 'relative', height: 24, marginTop: 4},
  axisLabel: {
    position: 'absolute',
    top: 6,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TURNAROUND ROW — 44px utility row; stepper 96×32 (−/+ 0.2), value
  // trailing 16/400 tabular. Label ellipsizes; stepper+value never wrap.
  turnRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    marginTop: 12,
  },
  turnLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Each 48×32 half's hit extends to 44px tall via the 44px row (merged
  // full-height targets; the parent row supplies the vertical padding).
  stepHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepHalfDisabled: {opacity: 0.35},
  stepDivider: {width: 1, background: 'var(--color-border)'},
  stepValue: {
    width: 64,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 8,
  },
  // SECTION HEADERS — 13/600 uppercase 0.06em at 32px, 20/8 margins.
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    margin: '20px 0 8px',
    paddingInline: 32,
  },
  sectionHeader: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  updatedCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
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
  // REPORT ROWS — 72px media rows, 40px decay-ring avatar.
  reportRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  reportRowPast: {opacity: 0.55},
  ringWrap: {width: 40, height: 40, flexShrink: 0},
  initialsText: {
    fontSize: 11,
    fontWeight: 600,
    fill: 'var(--color-text-primary)',
  },
  reportText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  pastFlagOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  reportPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  reportSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  confMeta: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETONS — 72px rows matching the report geometry exactly; widths are
  // the fixed 60/45/70/60 · 40/55/30/40 stagger, never random. No shimmer
  // anywhere (reduced-motion law: static muted blocks alone encode it).
  skeletonRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // PACK ROWS — 60px two-line rows; whole row is the switch button.
  packRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  packText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  packPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  packSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  condRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  condChip: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    borderRadius: 8,
    padding: '1px 6px',
    whiteSpace: 'nowrap',
  },
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
  },
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
  // EMPTY STATES — per the emptyAndSkeleton contract.
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
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
  },
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // SEARCH — 52px bar below nav, 36px muted field.
  searchBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 12,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    background: 'none',
    font: 'inherit',
    fontSize: 16,
    color: 'var(--color-text-primary)',
    outline: 'none',
    padding: 0,
  },
  searchClear: {
    width: 44,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    borderRadius: 12,
  },
  searchCancel: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 16,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TRAILS ROOT rows — 72px media rows with 48px SVG mini-profile thumbs.
  trailRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  trailThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    overflow: 'hidden',
    display: 'block',
  },
  trailText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  trailChevron: {color: 'var(--color-text-secondary)', flexShrink: 0, display: 'inline-flex'},
  // SEGMENTED FILTER — 36px track, muted fill, active card pill (r8).
  segmentedRow: {paddingInline: 16, paddingBlock: 8},
  segmentedTrack: {
    display: 'flex',
    height: 36,
    padding: 3,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  segmentedBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
  },
  segmentedBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
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
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT, fontWeight: 600},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom even mid-scroll on tall views (binding amendment;
  // absolute would anchor to the DOCUMENT bottom). While the sheet locks
  // the shell at 100dvh it flips to absolute bottom:76 z30 — the one case
  // shell-absolute is correct. Always mounted for aria-live.
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
    zIndex: 30,
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
  toastUndo: {
    height: 48,
    minWidth: 44,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41 (absolute inside shell).
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  surfaceChip: {
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    borderRadius: 8,
    padding: '3px 8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sheetSection: {
    margin: '12px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  miniReportRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingBlock: 6,
  },
  miniReportText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetCta: {
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
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — dual-field identity consts, deterministic by law. CROSS-CHECK
// LEDGER (verified by hand): segment gains 400+500+600+700+600+400 = 3,200
// = 5,600−2,400 ✓; segment miles 1.0+0.8+0.8+0.8+0.8+0.6 = 4.8 ✓; report
// ages → conf: 3×2=6→94, 3×5=15→85, 3×11=33→67, 3×19=57→43, 3×26=78→22,
// 3×30=90→10→clamped 20 ✓; pack counts 4.8→5+3=8, 3.4→5+2=7, 1.0→5+0=5 ✓.
// ---------------------------------------------------------------------------

type Condition = 'clear' | 'mud' | 'snow' | 'ice';

interface ConditionMeta {
  id: Condition;
  label: string;
  fill: string; // band fill pair (≥3:1 vs card — see COLOR LITERALS)
  text: string; // text pair (≥4.5:1 vs card)
}

const CONDITIONS: Record<Condition, ConditionMeta> = {
  clear: {id: 'clear', label: 'Clear', fill: BAND_CLEAR, text: TEXT_CLEAR},
  mud: {id: 'mud', label: 'Mud', fill: BAND_MUD, text: TEXT_MUD},
  snow: {id: 'snow', label: 'Snow', fill: BAND_SNOW, text: TEXT_SNOW},
  ice: {id: 'ice', label: 'Ice', fill: BAND_ICE, text: TEXT_ICE},
};

const TRAIL = {
  id: 't-cascade',
  name: 'Cascade Pass',
  trailheadFt: 2400,
  summitFt: 5600,
  oneWayMi: 4.8,
};

interface Segment {
  id: string;
  miStart: number;
  miEnd: number;
  gainFt: number;
  condition: Condition;
  gradePct: number; // gainFt / (lengthMi × 5280) × 100, precomputed
}

// gradePct cross-check: s1 400/5280=7.6 ✓ · s2 500/4224=11.8 ✓ ·
// s3 600/4224=14.2 ✓ · s4 700/4224=16.6 ✓ · s5 600/4224=14.2 ✓ ·
// s6 400/3168=12.6 ✓.
const SEGMENTS: Segment[] = [
  {id: 's1', miStart: 0.0, miEnd: 1.0, gainFt: 400, condition: 'clear', gradePct: 7.6},
  {id: 's2', miStart: 1.0, miEnd: 1.8, gainFt: 500, condition: 'mud', gradePct: 11.8},
  {id: 's3', miStart: 1.8, miEnd: 2.6, gainFt: 600, condition: 'clear', gradePct: 14.2},
  {id: 's4', miStart: 2.6, miEnd: 3.4, gainFt: 700, condition: 'snow', gradePct: 16.6},
  {id: 's5', miStart: 3.4, miEnd: 4.2, gainFt: 600, condition: 'ice', gradePct: 14.2},
  {id: 's6', miStart: 4.2, miEnd: 4.8, gainFt: 400, condition: 'snow', gradePct: 12.6},
];

// Elevation profile — 7 fixture points (mile, ft); the curve between them
// is piecewise linear and segment boundaries land exactly on points.
const ELEV_POINTS: Array<{mi: number; ft: number}> = [
  {mi: 0.0, ft: 2400},
  {mi: 1.0, ft: 2800},
  {mi: 1.8, ft: 3300},
  {mi: 2.6, ft: 3900},
  {mi: 3.4, ft: 4600},
  {mi: 4.2, ft: 5200},
  {mi: 4.8, ft: 5600},
];

// CONFIDENCE FORMULA (spec verbatim, used for every report):
//   conf = max(20, 100 − 3×ageHours)
function confFor(ageHours: number): number {
  return Math.max(20, 100 - 3 * ageHours);
}

interface Report {
  id: string;
  hiker: string;
  initials: string;
  mile: number;
  condition: Condition;
  text: string;
  ageHours: number;
  ageLabel: string;
  conf: number; // = confFor(ageHours), asserted at module init below
}

// r4's 73-char text is the single-line-ellipsis stress (row stays 72px).
const REPORTS_BATCH_1: Report[] = [
  {id: 'r1', hiker: 'Maya K.', initials: 'MK', mile: 1.4, condition: 'mud', text: 'Deep mud after the creek crossing', ageHours: 2, ageLabel: '2h ago', conf: 94},
  {id: 'r2', hiker: 'Jordan P.', initials: 'JP', mile: 3.0, condition: 'snow', text: 'Snowline starts ~2.8, well packed', ageHours: 5, ageLabel: '5h ago', conf: 85},
  {id: 'r3', hiker: 'Sam R.', initials: 'SR', mile: 3.8, condition: 'ice', text: 'Hard ice on the switchbacks — spikes needed', ageHours: 11, ageLabel: '11h ago', conf: 67},
  {id: 'r4', hiker: 'Elena V.', initials: 'EV', mile: 4.6, condition: 'snow', text: 'Summit ridge windblown, knee-deep drifts north of the last cairn field', ageHours: 19, ageLabel: '19h ago', conf: 43},
  {id: 'r5', hiker: 'Chris B.', initials: 'CB', mile: 2.2, condition: 'clear', text: 'Clear and fast up to the snowline', ageHours: 26, ageLabel: '26h ago', conf: 22},
  {id: 'r6', hiker: 'Dana W.', initials: 'DW', mile: 0.6, condition: 'clear', text: 'Blowdown at 0.6 cleared by trail crew', ageHours: 30, ageLabel: '30h ago', conf: 20},
];

// loadMoreRow batch — ages 34/41/48/60h → all conf clamped to 20.
const REPORTS_BATCH_2: Report[] = [
  {id: 'r7', hiker: 'Priya N.', initials: 'PN', mile: 1.2, condition: 'mud', text: 'Boardwalk section muddy but passable', ageHours: 34, ageLabel: '34h ago', conf: 20},
  {id: 'r8', hiker: 'Owen T.', initials: 'OT', mile: 4.4, condition: 'snow', text: 'Drifts filling in on the upper switchbacks', ageHours: 41, ageLabel: '41h ago', conf: 20},
  {id: 'r9', hiker: 'Leah M.', initials: 'LM', mile: 0.3, condition: 'clear', text: 'Trailhead lot plowed, dry to the creek', ageHours: 48, ageLabel: '48h ago', conf: 20},
  {id: 'r10', hiker: 'Noor A.', initials: 'NA', mile: 3.6, condition: 'ice', text: 'Old ice under a fresh dusting near the overlook', ageHours: 60, ageLabel: '60h ago', conf: 20},
];

const ALL_REPORTS: Report[] = [...REPORTS_BATCH_1, ...REPORTS_BATCH_2];

// The stored conf fields are asserted against the formula at module init —
// a drifted fixture throws in dev rather than shipping a wrong ring.
for (const report of ALL_REPORTS) {
  if (report.conf !== confFor(report.ageHours)) {
    throw new Error(\`conf drift on \${report.id}\`);
  }
}

// Reports render sorted by confidence desc; the conf-20 tail keeps fixture
// order (r6, r7, r8, r9, r10) via stable sort.
const REPORTS_SORTED: Report[] = [...ALL_REPORTS].sort((a, b) => b.conf - a.conf);

interface PackItem {
  id: string;
  label: string;
  note: string;
}

const BASE_PACK: PackItem[] = [
  {id: 'p-water', label: 'Water 2L', note: 'One bottle per 5 trail miles'},
  {id: 'p-map', label: 'Map + GPS', note: 'Cell coverage ends at mi 1.8'},
  {id: 'p-firstaid', label: 'First aid kit', note: 'Blister care + wrap'},
  {id: 'p-headlamp', label: 'Headlamp', note: 'Turnaround buffer after 3 PM'},
  {id: 'p-shell', label: 'Rain shell', note: 'Pass weather turns fast'},
];

interface ConditionalPackItem extends PackItem {
  trigger: (miles: ConditionMiles) => boolean;
  chip: string; // 11px overline naming the trigger
  condition: Condition;
}

interface ConditionMiles {
  mud: number;
  snow: number;
  ice: number;
}

const CONDITIONAL_PACK: ConditionalPackItem[] = [
  {id: 'c-spikes', label: 'Microspikes', note: 'Hard ice on the s5 switchbacks', trigger: miles => miles.ice > 0, chip: 'ICE ABOVE MI 3.4', condition: 'ice'},
  {id: 'c-gaiters', label: 'Gaiters', note: 'Knee-deep drifts reported', trigger: miles => miles.snow > 0, chip: 'SNOW ABOVE MI 2.6', condition: 'snow'},
  {id: 'c-poles', label: 'Trekking poles', note: 'Slick mud and packed snow', trigger: miles => miles.mud + miles.snow > 0, chip: 'MUD FROM MI 1.0', condition: 'mud'},
];

// Other saved trails — static strings, no recompute (fixture law: only the
// Cascade card derives live).
interface SavedTrail {
  id: string;
  name: string;
  meta: string;
  profile: number[]; // normalized 0–1 elevation samples for the 48px thumb
  hue: [string, string]; // id-derived light-dark thumb wash
}

const OTHER_TRAILS: SavedTrail[] = [
  {
    id: 't-mirror',
    name: 'Mirror Tarn Loop',
    meta: 'Est 1h 52m · 4.2 mi RT',
    profile: [0.2, 0.45, 0.35, 0.6, 0.5, 0.3, 0.25],
    hue: ['#DCE8F2', '#2E3E4E'],
  },
  {
    id: 't-boulder',
    name: 'Boulder Gap',
    meta: 'Est 3h 30m · 7.0 mi RT',
    profile: [0.1, 0.3, 0.55, 0.8, 0.65, 0.9, 0.7],
    hue: ['#EAE2D4', '#443B2C'],
  },
];

// ---------------------------------------------------------------------------
// GEOMETRY — ribbon viewBox '0 0 358 140'. x = mi/4.8 × 358. y maps
// 2,400 ft → 128 and 5,600 ft → 12: scale = 116px / 3,200 ft = 0.03625
// px/ft, so y = 128 − (ft − 2,400) × 0.03625.
// ---------------------------------------------------------------------------

const VB_W = 358;
const VB_H = 140;
const BASE_Y = 128;
const FT_SCALE = 116 / 3200; // 0.03625 px/ft

function mileToX(mi: number): number {
  return (mi / TRAIL.oneWayMi) * VB_W;
}

function ftToY(ft: number): number {
  return BASE_Y - (ft - TRAIL.trailheadFt) * FT_SCALE;
}

/** Piecewise-linear elevation between the 7 fixture points. */
function elevAt(mi: number): number {
  const clamped = Math.min(Math.max(mi, 0), TRAIL.oneWayMi);
  for (let i = 1; i < ELEV_POINTS.length; i++) {
    const prev = ELEV_POINTS[i - 1];
    const next = ELEV_POINTS[i];
    if (clamped <= next.mi) {
      const t = (clamped - prev.mi) / (next.mi - prev.mi);
      return prev.ft + t * (next.ft - prev.ft);
    }
  }
  return TRAIL.summitFt;
}

function curveYAt(mi: number): number {
  return ftToY(elevAt(mi));
}

/** Under-curve area path for the mile range [a, b] (closed to the base). */
function areaPath(a: number, b: number): string {
  if (b - a <= 0.001) return '';
  const points: Array<{x: number; y: number}> = [{x: mileToX(a), y: curveYAt(a)}];
  for (const point of ELEV_POINTS) {
    if (point.mi > a && point.mi < b) {
      points.push({x: mileToX(point.mi), y: ftToY(point.ft)});
    }
  }
  points.push({x: mileToX(b), y: curveYAt(b)});
  const line = points.map(p => \`\${p.x.toFixed(2)} \${p.y.toFixed(2)}\`).join(' L ');
  return \`M \${line} L \${mileToX(b).toFixed(2)} \${BASE_Y} L \${mileToX(a).toFixed(2)} \${BASE_Y} Z\`;
}

/** Full elevation polyline points attr. */
const CURVE_POINTS = ELEV_POINTS.map(p => \`\${mileToX(p.mi).toFixed(2)},\${ftToY(p.ft).toFixed(2)}\`).join(' ');

// ---------------------------------------------------------------------------
// DERIVATIONS — all pure; ONE turnaroundMile assignment drives five reads
// (band dim, time estimate, verdict, pack list + badge, trails-root card).
// ---------------------------------------------------------------------------

/** Snap to 0.2 mi, clamp [1.0, 4.8], normalize float noise to 1 decimal. */
function snapMile(raw: number): number {
  const snapped = Math.round(raw * 5) / 5;
  return Number(Math.min(Math.max(snapped, 1.0), TRAIL.oneWayMi).toFixed(1));
}

function fmtMile(mi: number): string {
  return mi.toFixed(1);
}

/** Traversed miles per non-clear condition up to turnaround t (one way). */
function conditionMiles(t: number): ConditionMiles {
  const miles: ConditionMiles = {mud: 0, snow: 0, ice: 0};
  for (const segment of SEGMENTS) {
    if (segment.condition === 'clear') continue;
    const span = Math.max(0, Math.min(t, segment.miEnd) - segment.miStart);
    miles[segment.condition] += span;
  }
  return miles;
}

/** Cumulative gain (ft) to turnaround t — linear within each segment. */
function cumGainFt(t: number): number {
  let gain = 0;
  for (const segment of SEGMENTS) {
    const span = Math.max(0, Math.min(t, segment.miEnd) - segment.miStart);
    gain += (span / (segment.miEnd - segment.miStart)) * segment.gainFt;
  }
  return gain;
}

/**
 * TIME FORMULA (spec verbatim): minutes = 20×(2×turnaroundMi) +
 * 3×(cumGainFt/100) + Σ over traversed condition miles ×2 (round trip) ×
 * penalty {mud:5, snow:10, ice:15}.
 * VERIFIED VALUES — 4.8: 192+96+8+28+24 = 348 = '5h 48m'; 4.2:
 * 168+84+8+16+24 = 300 = '5h 00m'; 3.4: 136+66+8+16+0 = 226 = '3h 46m';
 * 1.0: 40+12+0 = 52 = '52m'.
 */
const PENALTY: Record<Exclude<Condition, 'clear'>, number> = {mud: 5, snow: 10, ice: 15};

function estimateMinutes(t: number): number {
  const miles = conditionMiles(t);
  const penalty =
    miles.mud * 2 * PENALTY.mud + miles.snow * 2 * PENALTY.snow + miles.ice * 2 * PENALTY.ice;
  return Math.round(20 * (2 * t) + 3 * (cumGainFt(t) / 100) + penalty);
}

/** 348 → '5h 48m' · 300 → '5h 00m' · 52 → '52m'. */
function fmtDuration(minutes: number): string {
  if (minutes < 60) return \`\${minutes}m\`;
  return \`\${Math.floor(minutes / 60)}h \${String(minutes % 60).padStart(2, '0')}m\`;
}

/**
 * VERDICT RULE (spec verbatim): route includes ice miles AND max ice-report
 * conf ≥ 50 → CAUTION; else GO. Default 4.8 → CAUTION (ice conf 67);
 * 3.4 → GO (no ice miles traversed).
 */
function verdictFor(t: number): 'go' | 'caution' {
  const iceMiles = conditionMiles(t).ice;
  if (iceMiles <= 0) return 'go';
  const maxIceConf = ALL_REPORTS.filter(r => r.condition === 'ice').reduce(
    (max, r) => Math.max(max, r.conf),
    0,
  );
  return maxIceConf >= 50 ? 'caution' : 'go';
}

/** Conditional pack items triggered at turnaround t. */
function conditionalItemsFor(t: number): ConditionalPackItem[] {
  const miles = conditionMiles(t);
  return CONDITIONAL_PACK.filter(item => item.trigger(miles));
}

function segmentAt(mi: number): Segment {
  const found = SEGMENTS.find(s => mi >= s.miStart && mi < s.miEnd);
  return found ?? SEGMENTS[SEGMENTS.length - 1];
}

function segmentById(id: string): Segment {
  return SEGMENTS.find(s => s.id === id) ?? SEGMENTS[0];
}

// ---------------------------------------------------------------------------
// HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

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
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px zigzag-S-in-peak Switchback glyph.
// ---------------------------------------------------------------------------

function SwitchbackMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M1.5 14.5 8 2l6.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 11h4l-3 2.4h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ELEVATION CONDITION RIBBON — SVG profile with condition bands clipped
// under the curve (100% opacity to the flag, 30% past it — the dim IS the
// clip feedback), report pins, a scrub lens (pointer + slider-role keyboard
// path), and the draggable TurnaroundFlag whose track is the curve itself.
// ---------------------------------------------------------------------------

interface RibbonProps {
  turnaroundMile: number;
  onScrubTurnaround: (mile: number) => void; // per-move, cheap pure derives
  onCommitTurnaround: (mile: number) => void; // pointerup → toast announce
  onOpenSegment: (segmentId: string, opener: HTMLElement) => void;
}

function ElevationConditionRibbon({turnaroundMile, onScrubTurnaround, onCommitTurnaround, onOpenSegment}: RibbonProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Transient presentation state only — the turnaround itself lives in the
  // single state owner upstream.
  const [scrubMile, setScrubMile] = useState<number | null>(null);
  const draggingFlagRef = useRef(false);
  const scrubbingRef = useRef(false);
  const movedRef = useRef(false);

  const mileFromClientX = (clientX: number): number => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return turnaroundMile;
    const frac = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return frac * TRAIL.oneWayMi;
  };

  // Scrub lens — pointer path (bubbles up from band/pin buttons; a >8px
  // move suppresses their click via movedRef guard).
  const onStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingFlagRef.current) return;
    scrubbingRef.current = true;
    movedRef.current = false;
    setScrubMile(Number(mileFromClientX(event.clientX).toFixed(1)));
  };
  const onStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingFlagRef.current) {
      onScrubTurnaround(snapMile(mileFromClientX(event.clientX)));
      return;
    }
    if (!scrubbingRef.current) return;
    movedRef.current = true;
    setScrubMile(Number(mileFromClientX(event.clientX).toFixed(1)));
  };
  const endStagePointer = () => {
    scrubbingRef.current = false;
    setScrubMile(null);
  };

  // Flag drag — pointer capture on the 44×44 hit that rides the curve.
  const onFlagPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    draggingFlagRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onFlagPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingFlagRef.current) return;
    event.stopPropagation();
    onScrubTurnaround(snapMile(mileFromClientX(event.clientX)));
  };
  const onFlagPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingFlagRef.current) return;
    draggingFlagRef.current = false;
    event.stopPropagation();
    onCommitTurnaround(snapMile(mileFromClientX(event.clientX)));
  };

  // Keyboard scrub — the ribbon stage is one slider-role control;
  // ArrowLeft/Right move the lens by 0.2 mi and read out grade+condition.
  const onStageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const base = scrubMile ?? turnaroundMile;
    const next = Number(
      Math.min(Math.max(base + (event.key === 'ArrowRight' ? 0.2 : -0.2), 0), TRAIL.oneWayMi).toFixed(1),
    );
    setScrubMile(next);
  };

  const guardedOpen = (segmentId: string) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onOpenSegment(segmentId, event.currentTarget);
  };

  const lensMile = scrubMile;
  const lensSegment = lensMile != null ? segmentAt(lensMile) : null;
  const flagX = mileToX(turnaroundMile);
  const flagY = curveYAt(turnaroundMile);
  const pctX = (mi: number) => \`\${((mi / TRAIL.oneWayMi) * 100).toFixed(3)}%\`;
  const pctY = (y: number) => \`\${((y / VB_H) * 100).toFixed(3)}%\`;
  const scrubValuetext =
    lensMile != null && lensSegment != null
      ? \`mile \${fmtMile(lensMile)}, \${lensSegment.gradePct.toFixed(1)} percent grade, \${CONDITIONS[lensSegment.condition].label.toLowerCase()}\`
      : \`mile \${fmtMile(turnaroundMile)}, turnaround\`;

  return (
    <div style={styles.ribbonCard}>
      <div
        ref={stageRef}
        style={styles.ribbonStage}
        role="slider"
        tabIndex={0}
        className="swb-focusable"
        aria-label="Elevation and conditions scrubber"
        aria-valuemin={0}
        aria-valuemax={TRAIL.oneWayMi}
        aria-valuenow={lensMile ?? turnaroundMile}
        aria-valuetext={scrubValuetext}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={endStagePointer}
        onPointerLeave={endStagePointer}
        onBlur={endStagePointer}
        onKeyDown={onStageKeyDown}>
        <svg viewBox={\`0 0 \${VB_W} \${VB_H}\`} style={styles.ribbonSvg} aria-hidden>
          {/* Condition bands: full opacity to the flag, 30% past it. */}
          {SEGMENTS.map(segment => {
            const meta = CONDITIONS[segment.condition];
            const fullEnd = Math.min(segment.miEnd, Math.max(segment.miStart, turnaroundMile));
            const fullPath = areaPath(segment.miStart, fullEnd);
            const dimPath = areaPath(Math.max(segment.miStart, turnaroundMile), segment.miEnd);
            return (
              <g key={segment.id}>
                {fullPath !== '' ? <path d={fullPath} fill={meta.fill} className="swb-fade" /> : null}
                {dimPath !== '' ? <path d={dimPath} fill={meta.fill} opacity={0.3} className="swb-fade" /> : null}
              </g>
            );
          })}
          {/* Elevation curve. */}
          <polyline
            points={CURVE_POINTS}
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Report pins — 10px circles at (mile, curveY−8), card stroke. */}
          {ALL_REPORTS.map(report => (
            <circle
              key={report.id}
              cx={mileToX(report.mile)}
              cy={curveYAt(report.mile) - 8}
              r={5}
              fill={CONDITIONS[report.condition].fill}
              stroke="var(--color-background-card)"
              strokeWidth={2}
            />
          ))}
          {/* Turnaround pole — 3px, from the curve down to the base. */}
          <line
            x1={flagX}
            y1={flagY}
            x2={flagX}
            y2={BASE_Y}
            stroke="var(--color-text-primary)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>

        {/* Transparent segment hit rects (full ribbon height ≥110px). */}
        {SEGMENTS.map(segment => {
          const meta = CONDITIONS[segment.condition];
          return (
            <button
              key={segment.id}
              type="button"
              className="swb-btn swb-focusable"
              style={{
                ...styles.bandHit,
                left: pctX(segment.miStart),
                width: \`\${(((segment.miEnd - segment.miStart) / TRAIL.oneWayMi) * 100).toFixed(3)}%\`,
              }}
              aria-label={\`\${meta.label} segment, mile \${fmtMile(segment.miStart)} to \${fmtMile(segment.miEnd)}\`}
              onClick={guardedOpen(segment.id)}
            />
          );
        })}
        {/* 44×44 pin hits above the band rects. */}
        {ALL_REPORTS.map(report => (
          <button
            key={report.id}
            type="button"
            className="swb-btn swb-focusable"
            style={{
              ...styles.pinHit,
              left: pctX(report.mile),
              top: pctY(curveYAt(report.mile) - 8),
            }}
            aria-label={\`Report pin: \${report.hiker}, mile \${fmtMile(report.mile)}, \${CONDITIONS[report.condition].label.toLowerCase()}\`}
            onClick={guardedOpen(segmentAt(report.mile).id)}
          />
        ))}
        {/* TurnaroundFlag — 44×44 hit riding the curve; the visible glyph
            is the button path indicator itself (plus stepper + sheet CTA
            as non-gesture paths). */}
        <button
          type="button"
          className="swb-btn swb-focusable"
          style={{...styles.flagHit, left: pctX(turnaroundMile), top: pctY(flagY)}}
          aria-label={\`Turnaround flag at mile \${fmtMile(turnaroundMile)} — drag along the profile, or use the stepper below\`}
          onPointerDown={onFlagPointerDown}
          onPointerMove={onFlagPointerMove}
          onPointerUp={onFlagPointerUp}
          onClick={event => event.stopPropagation()}>
          <Icon icon={FlagTriangleRightIcon} size="md" color="inherit" />
        </button>

        {/* Scrub lens — hairline + 120×44 card clamped 8px inside. */}
        {lensMile != null && lensSegment != null ? (
          <>
            <div style={{...styles.lensLine, left: pctX(lensMile)}} aria-hidden />
            <div
              style={{
                ...styles.lensCard,
                left: \`clamp(8px, calc(\${pctX(lensMile)} - 60px), calc(100% - 128px))\`,
              }}
              aria-hidden>
              <span style={{fontWeight: 600}}>
                mi {fmtMile(lensMile)} · {lensSegment.gradePct.toFixed(1)}%
              </span>
              <span style={{color: CONDITIONS[lensSegment.condition].text, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em'}}>
                {CONDITIONS[lensSegment.condition].label.toUpperCase()}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* X-axis — 6 mile labels at 0/1/2/3/4/4.8. */}
      <div style={styles.axisRow} aria-hidden>
        {[0, 1, 2, 3, 4, 4.8].map(mi => (
          <span
            key={mi}
            style={{
              ...styles.axisLabel,
              left: \`\${((mi / TRAIL.oneWayMi) * 100).toFixed(2)}%\`,
              ...(mi === 0 ? {transform: 'none'} : null),
              ...(mi === 4.8 ? {transform: 'translateX(-100%)'} : null),
            }}>
            {mi === 4.8 ? '4.8' : mi}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DECAY RING AVATAR — 40px SVG: 28px initials disc centered, 3px ring arc
// whose sweep = conf% of 360° in the condition color, remainder in
// --color-border; ring opacity = max(0.35, conf/100) so old reports fade.
// ---------------------------------------------------------------------------

const RING_R = 18.5;
const RING_C = 2 * Math.PI * RING_R; // ≈116.24

function DecayRing({report}: {report: Report}) {
  const sweep = (report.conf / 100) * RING_C;
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" style={{display: 'block'}} aria-hidden>
      <circle cx={20} cy={20} r={RING_R} fill="none" stroke="var(--color-border)" strokeWidth={3} />
      <circle
        cx={20}
        cy={20}
        r={RING_R}
        fill="none"
        stroke={CONDITIONS[report.condition].fill}
        strokeWidth={3}
        strokeDasharray={\`\${sweep.toFixed(2)} \${RING_C.toFixed(2)}\`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        opacity={Math.max(0.35, report.conf / 100)}
      />
      <circle cx={20} cy={20} r={14} fill="var(--color-background-muted)" />
      <text x={20} y={24} textAnchor="middle" style={styles.initialsText}>
        {report.initials}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// REPORT FRESHNESS STACK — 72px media rows sorted by confidence desc; rows
// past the turnaround render at 55% with a PAST FLAG overline; the whole
// row is one button opening that mile's segment sheet.
// ---------------------------------------------------------------------------

interface ReportStackProps {
  reports: Report[];
  turnaroundMile: number;
  onOpenSegment: (segmentId: string, opener: HTMLElement) => void;
  trailing?: ReactNode; // loadMoreRow slot
  firstNewRowId?: string | null; // focus target after Show 4 more
}

function ReportFreshnessStack({reports, turnaroundMile, onOpenSegment, trailing, firstNewRowId}: ReportStackProps) {
  return (
    <div style={styles.listCard}>
      {reports.map((report, index) => {
        const meta = CONDITIONS[report.condition];
        const isPast = report.mile > turnaroundMile;
        return (
          <div key={report.id}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            <button
              type="button"
              id={report.id === firstNewRowId ? 'swb-first-new-report' : undefined}
              className="swb-btn swb-focusable"
              style={{...styles.reportRow, ...(isPast ? styles.reportRowPast : null)}}
              aria-label={\`\${report.hiker}: \${report.text} — mile \${fmtMile(report.mile)}, \${meta.label.toLowerCase()}, \${report.ageLabel}, confidence \${report.conf} percent\${isPast ? ', past your flag' : ''}\`}
              onClick={event => onOpenSegment(segmentAt(report.mile).id, event.currentTarget)}>
              <span style={styles.ringWrap}>
                <DecayRing report={report} />
              </span>
              <span style={styles.reportText}>
                {isPast ? <span style={styles.pastFlagOverline}>PAST FLAG</span> : null}
                <span style={styles.reportPrimary}>{report.text}</span>
                <span style={styles.reportSecondary}>
                  mi {fmtMile(report.mile)} · {meta.label.toLowerCase()} · {report.ageLabel} · {report.hiker}
                </span>
              </span>
              <span style={{...styles.confMeta, color: meta.text}}>{report.conf}%</span>
            </button>
          </div>
        );
      })}
      {trailing}
    </div>
  );
}

// SKELETON ROWS — deterministic 60/45/70/60 · 40/55/30/40 widths.
const SKELETON_WIDTHS: Array<[number, number]> = [
  [60, 40],
  [45, 55],
  [70, 30],
  [60, 40],
];

function SkeletonReportCard() {
  return (
    <div style={styles.listCard} aria-busy="true">
      {SKELETON_WIDTHS.map(([primary, secondary], index) => (
        <div key={index}>
          {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <span style={styles.skelCircle} />
            <span style={styles.skelBars}>
              <span style={{...styles.skelBar, width: \`\${primary}%\`}} />
              <span style={{...styles.skelBar, width: \`\${secondary}%\`}} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SEGMENT SHEET — two detents (medium 55% / large calc(100%−56px)); grabber
// click toggles, drag is garnish; X / scrim / Escape close and restore
// focus to the opener; 'Set turnaround here' hits the same single setter.
// ---------------------------------------------------------------------------

interface SegmentSheetProps {
  segment: Segment;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onSetTurnaround: () => void;
}

function SegmentSheet({segment, detent, reducedMotion, sheetRef, onDetentChange, onClose, onSetTurnaround}: SegmentSheetProps) {
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);
  const meta = CONDITIONS[segment.condition];
  const inSegment = REPORTS_SORTED.filter(r => r.mile >= segment.miStart && r.mile < segment.miEnd);
  const targetMile = snapMile(segment.miStart);

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

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="swb-sheet-title"
      tabIndex={-1}
      className="swb-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="swb-btn swb-focusable"
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
        <h2 id="swb-sheet-title" style={styles.sheetTitle}>
          {meta.label} · mi {fmtMile(segment.miStart)}–{fmtMile(segment.miEnd)}
        </h2>
        <button type="button" className="swb-btn swb-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.statRow}>
          <span style={styles.statValue}>{segment.gradePct.toFixed(1)}%</span>
          <span style={styles.statLabel}>avg grade · climbs {segment.gainFt} ft over {(segment.miEnd - segment.miStart).toFixed(1)} mi</span>
          <span
            style={{
              ...styles.surfaceChip,
              color: meta.text,
              // 14% same-hue wash over the card barely moves the surface
              // luminance, so the ≥4.5:1 text pair still clears it.
              background: \`color-mix(in srgb, \${meta.fill} 14%, transparent)\`,
            }}>
            {meta.label.toUpperCase()}
          </span>
        </div>
        <h3 style={styles.sheetSection}>In-segment reports</h3>
        {inSegment.length === 0 ? (
          <div style={{...styles.miniReportRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
            No reports in this segment yet.
          </div>
        ) : (
          inSegment.map(report => (
            <div key={report.id} style={styles.miniReportRow}>
              <span style={{...styles.confMeta, color: CONDITIONS[report.condition].text}}>{report.conf}%</span>
              <span style={styles.miniReportText}>
                {report.text} — {report.hiker}, mi {fmtMile(report.mile)}
              </span>
            </div>
          ))
        )}
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="swb-btn swb-focusable" style={styles.sheetCta} onClick={onSetTurnaround}>
          Set turnaround here · mi {fmtMile(targetMile)}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SMALL PIECES — switch row, empty state, trail thumb.
// ---------------------------------------------------------------------------

function SwitchVisual({on}: {on: boolean}) {
  return (
    <span
      style={{
        ...styles.switchTrack,
        // ON = brand; OFF = SWITCH_OFF_TRACK (≥3:1 vs card, see literals).
        background: on ? BRAND_ACCENT : SWITCH_OFF_TRACK,
      }}
      aria-hidden>
      <span style={{...styles.switchThumb, transform: on ? 'translateX(20px)' : undefined}} />
    </span>
  );
}

interface EmptyStateProps {
  icon: typeof SearchXIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({icon, title, body, actionLabel, onAction}: EmptyStateProps) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>
        <Icon icon={icon} size="lg" color="inherit" />
      </span>
      <h3 style={styles.emptyTitle}>{title}</h3>
      <p style={styles.emptyBody}>{body}</p>
      {actionLabel != null && onAction != null ? (
        <button type="button" className="swb-btn swb-focusable" style={styles.emptyAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

/** 48px SVG mini-profile thumbnail (id-derived wash, no photos). */
function TrailThumb({profile, hue}: {profile: number[]; hue: [string, string]}) {
  const points = profile
    .map((v, i) => \`\${((i / (profile.length - 1)) * 48).toFixed(1)},\${(44 - v * 36).toFixed(1)}\`)
    .join(' ');
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" style={styles.trailThumb} aria-hidden>
      <rect width={48} height={48} fill={\`light-dark(\${hue[0]}, \${hue[1]})\`} />
      <polyline points={points} fill="none" stroke={BRAND_ACCENT} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — the spec's shape verbatim plus the pack/undo, filter,
// loadMore, and refresh flags. update(patch) is the single setter; every
// surface calls it. SIGNATURE CHAIN: one {turnaroundMile: x} patch drives
// five pure reads in the same render — (1) band dim past x, (2)
// estimateMinutes(x) → time chip + trail card, (3) verdictFor(x) →
// CAUTION↔GO pill flip exactly at 3.4, (4) conditionalItemsFor(x) → Pack
// rows + tab badge (8→7 crossing 3.4, silently — undoOverConfirm applies
// only to the user-verb switch removals), (5) the Trails-root Cascade
// card meta.
// ---------------------------------------------------------------------------

type Tab = 'trails' | 'pack' | 'reports';
type ReportFilter = 'all' | 'mud' | 'snow' | 'ice';

interface ScoutToast {
  seq: number;
  text: string;
  undoItemId: string | null; // pack-item undo target
}

interface ScoutState {
  tab: Tab;
  screenByTab: {trails: 'root' | 'detail'};
  turnaroundMile: number;
  sheet: {segmentId: string} | null;
  sheetDetent: 'medium' | 'large';
  toast: ScoutToast | null;
  searchQuery: string;
  searchFocused: boolean;
  reportFilter: ReportFilter;
  reportsExpanded: boolean;
  removedPack: string[];
  refreshPhase: 'idle' | 'loading' | 'updated';
  scrollByTab: Record<Tab, number>;
}

const INITIAL_STATE: ScoutState = {
  tab: 'trails',
  // Default screen is the pushed DETAIL (root reachable via back).
  screenByTab: {trails: 'detail'},
  turnaroundMile: 4.8,
  sheet: null,
  sheetDetent: 'medium',
  toast: null,
  searchQuery: '',
  searchFocused: false,
  reportFilter: 'all',
  reportsExpanded: false,
  removedPack: [],
  refreshPhase: 'idle',
  scrollByTab: {trails: 0, pack: 0, reports: 0},
};

const TAB_META: Array<{id: Tab; label: string; icon: typeof MapIcon}> = [
  {id: 'trails', label: 'Trails', icon: MapIcon},
  {id: 'pack', label: 'Pack', icon: BackpackIcon},
  {id: 'reports', label: 'Reports', icon: MessagesSquareIcon},
];

const FILTERS: Array<{id: ReportFilter; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'mud', label: 'Mud'},
  {id: 'snow', label: 'Snow'},
  {id: 'ice', label: 'Ice'},
];

// Cascade thumb profile — normalized straight from the elevation fixture.
const CASCADE_PROFILE = ELEV_POINTS.map(p => (p.ft - TRAIL.trailheadFt) / (TRAIL.summitFt - TRAIL.trailheadFt));
const CASCADE_HUE: [string, string] = ['#DEEADF', '#2C3D30'];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileTrailConditionsScoutTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<ScoutState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<ScoutState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const ribbonAnchorRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const toastSeqRef = useRef(0);
  // navBar center-title fade — presentation mirror of the sentinel only.
  const [navTitleShown, setNavTitleShown] = useState(false);

  const t = state.turnaroundMile;

  // DERIVED — all pure reads of the one owner (no effects).
  const estMinutes = estimateMinutes(t);
  const estLabel = fmtDuration(estMinutes);
  const verdict = verdictFor(t);
  const conditionals = conditionalItemsFor(t);
  const basePresent = BASE_PACK.filter(item => !state.removedPack.includes(item.id));
  const packCount = basePresent.length + conditionals.length;
  const detailReports = state.reportsExpanded ? REPORTS_SORTED : REPORTS_SORTED.slice(0, 6);
  const filteredReports =
    state.reportFilter === 'all'
      ? REPORTS_SORTED
      : REPORTS_SORTED.filter(r => r.condition === state.reportFilter);
  const trailQuery = state.searchQuery.trim().toLowerCase();
  const savedTrails = [
    {id: TRAIL.id, name: TRAIL.name, meta: \`Est \${estLabel} · \${(2 * t).toFixed(1)} mi RT\`, profile: CASCADE_PROFILE, hue: CASCADE_HUE},
    ...OTHER_TRAILS,
  ];
  const visibleTrails = trailQuery === '' ? savedTrails : savedTrails.filter(trail => trail.name.toLowerCase().includes(trailQuery));

  const toastPatch = (text: string, undoItemId: string | null = null): Partial<ScoutState> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undoItemId}};
  };

  // TURNAROUND — scrub writes per move (cheap pure derives); the announce
  // toast fires only on pointerup / step / sheet CTA, never per pixel.
  const announceTurnaround = (mile: number): Partial<ScoutState> => {
    const v = verdictFor(mile);
    return toastPatch(
      \`Turnaround mi \${fmtMile(mile)} · verdict \${v === 'go' ? 'GO' : 'CAUTION'} · est \${fmtDuration(estimateMinutes(mile))}\`,
    );
  };
  const scrubTurnaround = (mile: number) => update({turnaroundMile: mile});
  const commitTurnaround = (mile: number) => update({turnaroundMile: mile, ...announceTurnaround(mile)});
  const stepTurnaround = (delta: number) => {
    const next = snapMile(t + delta);
    if (next !== t) commitTurnaround(next);
  };

  // SHEET lifecycle — focus into the sheet with preventScroll (a plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen); restore on close.
  const openSegmentSheet = (segmentId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({sheet: {segmentId}, sheetDetent: 'medium'});
  };
  const closeSheet = () => {
    update({sheet: null, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };
  const setTurnaroundFromSheet = () => {
    if (state.sheet == null) return;
    const mile = snapMile(segmentById(state.sheet.segmentId).miStart);
    update({
      turnaroundMile: mile,
      sheet: null,
      sheetDetent: 'medium',
      ...toastPatch(\`Turnaround set to mi \${fmtMile(mile)}\`),
    });
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [state.sheet]);

  // TABS — per-tab state persists (screenByTab + scrollByTab); switching
  // closes any open sheet; re-tapping the active Trails tab pops
  // detail→root and scrolls to top (the one legal reset).
  const selectTab = (next: Tab) => {
    const scroller = getScrollParent(wrapRef.current);
    if (next === state.tab) {
      if (next === 'trails' && state.screenByTab.trails === 'detail') {
        update({screenByTab: {trails: 'root'}});
      }
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    update({
      tab: next,
      sheet: null,
      sheetDetent: 'medium',
      scrollByTab: {...state.scrollByTab, [state.tab]: scroller?.scrollTop ?? 0},
    });
  };
  useEffect(() => {
    const scroller = getScrollParent(wrapRef.current);
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab];
    // Restore is keyed to tab arrival only — scrollByTab reads latest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TAB_META.findIndex(tab => tab.id === state.tab);
    const next = TAB_META[(index + (event.key === 'ArrowRight' ? 1 : -1) + TAB_META.length) % TAB_META.length];
    selectTab(next.id);
    document.getElementById(\`swb-tab-\${next.id}\`)?.focus();
  };

  // PACK — reversible removal executes immediately with Undo (never a
  // confirm); Undo restores the exact original index because the list
  // renders BASE_PACK order filtered by removedPack.
  const removePackItem = (item: PackItem) => {
    update({removedPack: [...state.removedPack, item.id], ...toastPatch(\`\${item.label} removed\`, item.id)});
  };
  const undoPackRemoval = () => {
    const itemId = state.toast?.undoItemId;
    if (itemId == null) return;
    const item = BASE_PACK.find(p => p.id === itemId);
    update({
      removedPack: state.removedPack.filter(id => id !== itemId),
      ...toastPatch(\`\${item?.label ?? 'Item'} restored\`),
    });
  };

  // REFRESH — press one shows 4 deterministic skeleton rows (aria-busy,
  // 'Loading' announced once); the next press resolves them. No timers.
  const pressRefresh = () => {
    if (state.refreshPhase === 'loading') {
      update({refreshPhase: 'updated', ...toastPatch('Updated just now')});
    } else {
      update({refreshPhase: 'loading', ...toastPatch('Loading reports')});
    }
  };

  const loadMoreReports = () => {
    update({reportsExpanded: true, ...toastPatch('4 more reports loaded')});
  };
  useEffect(() => {
    if (state.reportsExpanded) {
      document.getElementById('swb-first-new-report')?.focus({preventScroll: true});
    }
  }, [state.reportsExpanded]);

  const setFilter = (filter: ReportFilter) => {
    const count =
      filter === 'all' ? REPORTS_SORTED.length : REPORTS_SORTED.filter(r => r.condition === filter).length;
    update({
      reportFilter: filter,
      ...toastPatch(\`\${count} \${filter === 'all' ? '' : \`\${filter} \`}report\${count === 1 ? '' : 's'}\`),
    });
  };

  // ESCAPE — topmost overlay only: sheet, then search.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.sheet != null) {
        closeSheet();
      } else if (state.searchFocused && state.searchQuery !== '') {
        update({searchQuery: ''});
      } else if (state.searchFocused) {
        update({searchFocused: false});
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sheet, state.searchFocused, state.searchQuery]);

  // Large-title collapse — the 1px sentinel after the largeTitle row drives
  // the navBar center-title fade (user-scroll driven, deterministic).
  const onDetail = state.tab === 'trails' && state.screenByTab.trails === 'detail';
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!onDetail || sentinel == null) {
      setNavTitleShown(!onDetail ? false : true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => setNavTitleShown(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-53px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onDetail]);

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const verdictText = verdict === 'caution' ? 'CAUTION · icy above 3.4 mi' : 'GO · clear to turnaround';
  const openSegment = state.sheet != null ? segmentById(state.sheet.segmentId) : null;

  // -------------------------------------------------------------------------
  // NAV BAR per screen
  // -------------------------------------------------------------------------

  const renderNavBar = () => {
    if (state.tab === 'trails' && state.screenByTab.trails === 'detail') {
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="swb-btn swb-focusable"
              style={styles.backBtn}
              onClick={() => update({screenByTab: {trails: 'root'}})}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Trails</span>
            </button>
          </div>
          <div style={{...styles.navTitle, ...(navTitleShown ? null : styles.navTitleHidden)}} className="swb-fade" aria-hidden={!navTitleShown}>
            {TRAIL.name}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="swb-btn swb-focusable"
              style={styles.iconBtn}
              aria-label={state.refreshPhase === 'loading' ? 'Finish refreshing reports' : 'Refresh reports'}
              onClick={pressRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
      );
    }
    const title = state.tab === 'trails' ? 'Trails' : state.tab === 'pack' ? 'Pack' : 'Reports';
    return (
      <header style={styles.navBar}>
        <div style={styles.navLeading}>
          <SwitchbackMark />
        </div>
        <h1 style={styles.navTitle}>{title}</h1>
        <div style={styles.navTrailing}>
          {state.tab === 'reports' ? (
            <button
              type="button"
              className="swb-btn swb-focusable"
              style={{...styles.iconBtn, ...(state.reportFilter !== 'all' ? {color: BRAND_ACCENT} : null)}}
              aria-label="Reset report filter"
              onClick={() => setFilter('all')}>
              <Icon icon={SlidersHorizontalIcon} size="md" color="inherit" />
            </button>
          ) : null}
        </div>
      </header>
    );
  };

  // -------------------------------------------------------------------------
  // TRAILS — root (search + saved trails) and pushed detail.
  // -------------------------------------------------------------------------

  const renderTrailsRoot = () => (
    <>
      <div style={styles.searchBar}>
        <div style={styles.searchField}>
          <Icon icon={SearchIcon} size="sm" color="inherit" />
          <input
            ref={searchInputRef}
            type="search"
            style={styles.searchInput}
            placeholder="Search trails"
            aria-label="Search trails"
            value={state.searchQuery}
            onChange={event => update({searchQuery: event.target.value})}
            onFocus={() => update({searchFocused: true})}
          />
          {state.searchQuery !== '' ? (
            <button
              type="button"
              className="swb-btn swb-focusable"
              style={styles.searchClear}
              aria-label="Clear search"
              onClick={() => {
                update({searchQuery: ''});
                searchInputRef.current?.focus();
              }}>
              <Icon icon={XCircleIcon} size="sm" color="inherit" />
            </button>
          ) : null}
        </div>
        {state.searchFocused ? (
          <button
            type="button"
            className="swb-btn swb-focusable"
            style={styles.searchCancel}
            onClick={() => {
              update({searchQuery: '', searchFocused: false});
              searchInputRef.current?.blur();
            }}>
            Cancel
          </button>
        ) : null}
      </div>
      <h2 style={{...styles.sectionHeader, ...{margin: '20px 0 8px', paddingInline: 32}}}>Saved trails</h2>
      {visibleTrails.length === 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title={\`No results for “\${state.searchQuery.trim()}”\`}
          body="Check the spelling or browse your saved trails."
          actionLabel="Clear search"
          onAction={() => {
            update({searchQuery: ''});
            searchInputRef.current?.focus();
          }}
        />
      ) : (
        <div style={styles.listCard}>
          {visibleTrails.map((trail, index) => (
            <div key={trail.id}>
              {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
              <button
                type="button"
                className="swb-btn swb-focusable"
                style={styles.trailRow}
                aria-label={\`\${trail.name}, \${trail.meta}\`}
                onClick={() => {
                  if (trail.id === TRAIL.id) {
                    update({screenByTab: {trails: 'detail'}});
                    const scroller = getScrollParent(wrapRef.current);
                    if (scroller != null) scroller.scrollTop = 0;
                  } else {
                    update(toastPatch(\`\${trail.name} — static demo trail; open Cascade Pass for live conditions\`));
                  }
                }}>
                <TrailThumb profile={trail.profile} hue={trail.hue} />
                <span style={styles.trailText}>
                  <span style={styles.reportPrimary}>{trail.name}</span>
                  <span style={styles.reportSecondary}>{trail.meta}</span>
                </span>
                <span style={styles.trailChevron}>
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderTrailDetail = () => {
    const minusDisabled = t <= 1.0;
    const plusDisabled = t >= TRAIL.oneWayMi;
    return (
      <>
        <div style={styles.largeTitleRow}>
          <h1 style={styles.largeTitle}>{TRAIL.name}</h1>
        </div>
        <div ref={sentinelRef} style={styles.sentinel} aria-hidden />

        {/* Verdict pill (a button — it scrolls the ribbon into view). */}
        <div style={styles.verdictRow}>
          <button
            type="button"
            className="swb-btn swb-focusable"
            style={styles.verdictPillHit}
            aria-label={\`Verdict: \${verdictText} — show the conditions ribbon\`}
            onClick={() =>
              ribbonAnchorRef.current?.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start',
              })
            }>
            <span style={{...styles.verdictPill, ...(verdict === 'caution' ? styles.verdictCaution : styles.verdictGo)}}>
              {verdictText}
            </span>
          </button>
          <span style={styles.timeChip}>Est {estLabel}</span>
        </div>

        <div ref={ribbonAnchorRef} style={{scrollMarginTop: 64}}>
          <ElevationConditionRibbon
            turnaroundMile={t}
            onScrubTurnaround={scrubTurnaround}
            onCommitTurnaround={commitTurnaround}
            onOpenSegment={openSegmentSheet}
          />
        </div>

        {/* Turnaround stepper — the flag's mandatory button path. */}
        <div style={styles.turnRow}>
          <span style={styles.turnLabel}>Turnaround</span>
          <span style={styles.stepper}>
            <button
              type="button"
              className="swb-btn swb-focusable"
              style={{...styles.stepHalf, ...(minusDisabled ? styles.stepHalfDisabled : null)}}
              aria-label="Decrease turnaround by 0.2 miles"
              disabled={minusDisabled}
              onClick={() => stepTurnaround(-0.2)}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.stepDivider} aria-hidden />
            <button
              type="button"
              className="swb-btn swb-focusable"
              style={{...styles.stepHalf, ...(plusDisabled ? styles.stepHalfDisabled : null)}}
              aria-label="Increase turnaround by 0.2 miles"
              disabled={plusDisabled}
              onClick={() => stepTurnaround(0.2)}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </span>
          <span
            style={styles.stepValue}
            className="swb-focusable"
            role="spinbutton"
            tabIndex={0}
            aria-label="Turnaround mile"
            aria-valuenow={t}
            aria-valuemin={1}
            aria-valuemax={TRAIL.oneWayMi}
            aria-valuetext={\`mile \${fmtMile(t)}\`}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                stepTurnaround(0.2);
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                stepTurnaround(-0.2);
              }
            }}>
            mi {fmtMile(t)}
          </span>
        </div>

        <div style={styles.sectionHeaderRow}>
          <h2 style={styles.sectionHeader}>Reports (freshest first)</h2>
          {state.refreshPhase === 'updated' ? <span style={styles.updatedCaption}>Updated just now</span> : null}
        </div>
        {state.refreshPhase === 'loading' ? (
          <SkeletonReportCard />
        ) : (
          <ReportFreshnessStack
            reports={detailReports}
            turnaroundMile={t}
            onOpenSegment={openSegmentSheet}
            firstNewRowId={state.reportsExpanded ? REPORTS_SORTED[6]?.id : null}
            trailing={
              !state.reportsExpanded ? (
                <>
                  <div style={styles.rowDivider} />
                  <button type="button" className="swb-btn swb-focusable" style={styles.loadMoreRow} onClick={loadMoreReports}>
                    Show 4 more
                  </button>
                </>
              ) : null
            }
          />
        )}
        {state.reportsExpanded && state.refreshPhase !== 'loading' ? (
          <p style={styles.terminalCaption}>All 10 reports</p>
        ) : null}
      </>
    );
  };

  // -------------------------------------------------------------------------
  // PACK — base rows are whole-row switches (remove executes + Undo);
  // conditional rows derive from the turnaround, no confirm, no switch.
  // -------------------------------------------------------------------------

  const renderPack = () => (
    <>
      <h2 style={{...styles.sectionHeader, margin: '20px 0 8px', paddingInline: 32}}>Always</h2>
      <div style={styles.listCard}>
        {basePresent.length === 0 ? (
          <div style={{...styles.packRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
            All base items removed — Undo from the toast.
          </div>
        ) : (
          basePresent.map((item, index) => (
            <div key={item.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                role="switch"
                aria-checked="true"
                className="swb-btn swb-focusable"
                style={styles.packRow}
                aria-label={\`\${item.label} — packed; toggle to remove\`}
                onClick={() => removePackItem(item)}>
                <span style={styles.packText}>
                  <span style={styles.packPrimary}>{item.label}</span>
                  <span style={styles.packSecondary}>{item.note}</span>
                </span>
                <SwitchVisual on />
              </button>
            </div>
          ))
        )}
      </div>

      <h2 style={{...styles.sectionHeader, margin: '20px 0 8px', paddingInline: 32}}>Conditions add</h2>
      {conditionals.length === 0 ? (
        <div style={styles.listCard}>
          <EmptyState icon={BackpackIcon} title="Nothing extra needed" body="Clear trail to your turnaround." />
        </div>
      ) : (
        <div style={styles.listCard}>
          {conditionals.map((item, index) => {
            const meta = CONDITIONS[item.condition];
            return (
              <div key={item.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.condRow}>
                  <span style={{...styles.packText, gap: 4}}>
                    <span
                      style={{
                        ...styles.condChip,
                        color: meta.text,
                        // Same-hue 14% wash barely shifts the card surface;
                        // the ≥4.5:1 text pair still clears it (amendment:
                        // tinted washes count as the actual surface).
                        background: \`color-mix(in srgb, \${meta.fill} 14%, transparent)\`,
                      }}>
                      {item.chip}
                    </span>
                    <span style={styles.packPrimary}>{item.label}</span>
                    <span style={styles.packSecondary}>{item.note}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // -------------------------------------------------------------------------
  // REPORTS — segmented filter over the full 10-row stack.
  // -------------------------------------------------------------------------

  const renderReports = () => (
    <>
      <div style={styles.segmentedRow} role="radiogroup" aria-label="Filter reports by condition">
        <div style={styles.segmentedTrack}>
          {FILTERS.map(filter => {
            const active = state.reportFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="radio"
                aria-checked={active}
                className="swb-btn swb-focusable"
                style={{...styles.segmentedBtn, ...(active ? styles.segmentedBtnActive : null)}}
                onClick={() => setFilter(filter.id)}
                onKeyDown={event => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  const index = FILTERS.findIndex(f => f.id === state.reportFilter);
                  const next = FILTERS[(index + (event.key === 'ArrowRight' ? 1 : -1) + FILTERS.length) % FILTERS.length];
                  setFilter(next.id);
                }}>
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title={\`No \${state.reportFilter} reports\`}
          body="Nothing matches this condition filter."
          actionLabel="Show all"
          onAction={() => setFilter('all')}
        />
      ) : (
        <ReportFreshnessStack reports={filteredReports} turnaroundMile={t} onOpenSegment={openSegmentSheet} />
      )}
      <p style={styles.terminalCaption}>
        {state.reportFilter === 'all' ? 'All 10 reports' : \`\${filteredReports.length} of 10 reports\`}
      </p>
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SWB_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {renderNavBar()}

        <main style={styles.main}>
          {state.tab === 'trails' && state.screenByTab.trails === 'root' ? renderTrailsRoot() : null}
          {state.tab === 'trails' && state.screenByTab.trails === 'detail' ? renderTrailDetail() : null}
          {state.tab === 'pack' ? renderPack() : null}
          {state.tab === 'reports' ? renderReports() : null}
          <div style={styles.bottomSpacer} />
        </main>

        {/* THE one polite live region — sticky-in-flow above the tabBar;
            absolute only while the sheet locks the shell (binding note). */}
        <div style={state.sheet != null ? styles.toastAnchorLocked : styles.toastAnchor} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="swb-fade">
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.undoItemId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="swb-btn swb-focusable" style={styles.toastUndo} onClick={undoPackRemoval}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 3 tabs, arrow-key tablist; Pack badge derives
            live from packCount (8 default). */}
        <nav style={styles.tabBar} role="tablist" aria-label="Switchback sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`swb-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="swb-btn swb-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                aria-label={tab.id === 'pack' ? \`Pack, \${packCount} items\` : tab.label}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'pack' ? <span style={styles.tabBadge}>{packCount}</span> : null}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {state.sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {openSegment != null ? (
          <SegmentSheet
            segment={openSegment}
            detent={state.sheetDetent}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeSheet}
            onSetTurnaround={setTurnaroundFromSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};