// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Glowline's creator-analytics day,
 *   frozen at 11:00 PM: viewsByHour (24 values summing to exactly 17,980),
 *   followerDeltaByHour (24 values summing to +264; 48,000 start → 48,264
 *   now), three posts whose view counts reconstruct the daily total
 *   (4,120 + 6,480 + 7,380 = 17,980), three spike annotations (7 AM post,
 *   4 PM collab mention, 7 PM reel), two alerts both linked to the 7 PM
 *   spike, and six 4-hour audience buckets (+2 +9 +30 +31 +103 +89 = 264).
 *   No Date.now(), no Math.random(), no network media — thumbnails are
 *   id-derived SVG gradient compositions.
 * @output Glowline — Creator Pulse: a 390px MOBILE creator-vitals surface
 *   where TIME is the primary control. A 244px PulseScrubCard holds a 120px
 *   area sparkline of the 24 hourly view counts with a draggable playhead
 *   (role=slider, 0–23) and three magnetized spike dots; scrubbing retimes
 *   the navBar subtitle ('7:14 PM — reel posted'), every DeltaStack
 *   SplitPill (cumulative-at-playhead | now), the top-post thumbnail+title
 *   by hour bucket, and the highlighted post row — landing on 7 PM clears
 *   both alerts and the tab badge 2→0. A two-detent metric-detail sheet
 *   lists all 24 hourly rows (playhead hour tinted), a RefreshCw press
 *   swaps the DeltaStack for deterministic skeleton rows until the next
 *   user tap, and the 4-tab shell (Pulse / Posts / Audience / Alerts)
 *   keeps per-tab scroll with swipe-to-review alert rows + Undo.
 * @position Page template; emitted by `astryx template mobile-creator-pulse`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, anchored menus)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the metric sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and the toast dock switches sticky→absolute (the
 *   sticky dock is the amendment-correct rest state: absolute bottom pins
 *   to the DOCUMENT bottom on tall scrolling views). Stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Glowline coral #FF5470 — the demo --color-brand is the
 *   demo logo blue, so the spec hex is quarantined per house rule); every
 *   derived brand text/fill/boundary pair carries its contrast math at the
 *   declaration. Interactive boundaries and meaningful rest fills use
 *   explicit light-dark() pairs at ≥3:1 against their ACTUAL surface
 *   (SplitPill split vs both half-fills, playhead line vs the 16% brand
 *   chart wash) — hairline/muted tokens are reserved for passive dividers.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', center title fades in via
 *   IntersectionObserver on the 52px largeTitle row → 104px total large
 *   header); PulseScrubCard 244px = 16 + 20 header + 8 + 120 chart + 16
 *   axis + 8 + 40 controls + 16; DeltaStack 218px = 3×72 rows + 2×1px
 *   dividers; rows 44px utility / 60px two-line / 72px media (48px thumb,
 *   12px radius); sectionHeader 13/600 uppercase 0.06em at 32px (16 gutter
 *   + 16 card pad), 20px top / 8px bottom; tabBar 64px sticky bottom z20
 *   (4 tabItems, 24px icon over 11/500 label, 4px gap; 16px-min brand
 *   badge pill); toastDock sticky bottom 76 (64 tabBar + 12) z30; sheet
 *   detents 55% medium / calc(100% − 56px) large, 24px grabber zone with
 *   36×5 pill, 52px sheet header. TYPE (Figtree via --font-family-body):
 *   28/700 large title · 17/600 nav+sheet titles · 16/400–500 row primary
 *   · 13/400 secondary · 11/500 overlines+tab labels · 10/600 badge
 *   numeral (foundations chrome spec); tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; every gesture has a visible button path
 *   (playhead scrub → ±1h chips + slider keys + dot buttons + Jump to
 *   spike; sheet drag → grabber button + X + Escape; alert swipe → 44×44
 *   ellipsis menu).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width:390 literals: the chart plot width is the
 *   MEASURED card inner width (ResizeObserver); x(h) = h/23 × width — the
 *   14px/interval figure is the 390 reference only. At 320 the plot is
 *   256px (11.13px/hour); the spike magnet radius stays 8px ABSOLUTE so
 *   the adjacent h16/h19 dots (3 intervals ≈ 33px apart) never
 *   double-capture. Hour axis renders 5 fixed labels (12A/6A/12P/6P/11P)
 *   spaced by percentage. SplitPills are flex:none; metric names flex:1
 *   minWidth:0 ellipsis; under 360px measured width the Jump button drops
 *   to icon+'Spike'. tabBar labels never truncate (4 × flex:1 ≥ 80px at
 *   320).
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the scrub-card anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ActivityIcon,
  BellIcon,
  CheckIcon,
  LayoutGridIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with its
// contrast math. BRAND_ACCENT is THE quarantined brand literal.
// ---------------------------------------------------------------------------

// Glowline coral. Used only for washes/fills that never carry text.
const BRAND_ACCENT = 'light-dark(#FF5470, #FF7A93)';
// Brand-on-card text + high-contrast brand fills (badge, swipe block, dots,
// playhead). #C41E45 on #FFFFFF ≈ 5.6:1 (passes 4.5:1); #FF8FA3 on the dark
// card (~#1A1A1A) ≈ 7.9:1.
const BRAND_DEEP = 'light-dark(#C41E45, #FF8FA3)';
// Text over a BRAND_DEEP fill: #FFFFFF on #C41E45 ≈ 5.8:1; #4A0A18 on
// #FF8FA3 ≈ 7.3:1 — both clear 4.5:1 at the 10px badge / 13px block sizes.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #4A0A18)';
// SplitPill right-half tint (a REST FILL that carries text — explicit pair,
// not a muted token). Light: color-mix 18% #FF5470 into white ≈ #FFE0E6.
// Dark: 24% #FF7A93 into #1A1A1A ≈ #512832.
const PILL_TINT =
  'light-dark(color-mix(in srgb, #FF5470 18%, #FFFFFF), color-mix(in srgb, #FF7A93 24%, #1A1A1A))';
// Text on PILL_TINT: #7A1128 on ≈#FFE0E6 ≈ 8.1:1; #FFD1DA on ≈#512832 ≈
// 9.3:1 (spec math, verified against WCAG luminance by hand).
const PILL_TINT_TEXT = 'light-dark(#7A1128, #FFD1DA)';
// INTERACTIVE BOUNDARY: the 1px split between SplitPill halves must read
// ≥3:1 against BOTH actual half-fills (muted ≈ #F2F0EE L≈0.87 / tint
// ≈ #FFE0E6 L≈0.82 in light; ≈ #2A2A2C / ≈ #512832 in dark). #B24258
// (L≈0.14) → ≈4.6–4.9:1 light; #E9AEB9 (L≈0.51) → ≈5–7:1 dark.
const PILL_SPLIT = 'light-dark(#B24258, #E9AEB9)';
// Playhead line + sparkline stroke vs their ACTUAL surface — the card
// under a 16% brand wash (light ≈ #FFE9ED L≈0.84; dark ≈ #2E2226 L≈0.05):
// #C41E45 (L≈0.13) ≈ 4.9:1; #FF8FA3 (L≈0.44) ≈ 5.1:1 — both ≥3:1.
// (Same values as BRAND_DEEP; named separately because the surface differs.)
const CHART_STROKE = 'light-dark(#C41E45, #FF8FA3)';
// 16% brand wash under the sparkline (decorative fill, carries no text).
const CHART_FILL = `color-mix(in srgb, ${BRAND_ACCENT} 16%, transparent)`;
// Brand washes for selected/highlight states (text on them stays
// --color-text-primary; 12%/8% washes shift contrast by < 0.4:1).
const TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const TINT_8 = `color-mix(in srgb, ${BRAND_ACCENT} 8%, transparent)`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Skeleton shimmer highlight (removed entirely under reduced motion).
const SHIMMER = 'light-dark(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.07))';
// Id-derived thumbnail gradients (p1 golden-hour warm / p2 studio cool /
// p3 night-reel dusk). Decorative aria-hidden art; shapes stroke with
// --color-text-primary, so light sides stay light and dark sides dark.
const P1_GRAD_A = 'light-dark(#FFE3B0, #7C4A12)';
const P1_GRAD_B = 'light-dark(#FFAD7A, #A34A20)';
const P2_GRAD_A = 'light-dark(#D6E4FF, #23345C)';
const P2_GRAD_B = 'light-dark(#B7C9F2, #3C4F82)';
const P3_GRAD_A = 'light-dark(#C9B8E8, #2A1F3F)';
const P3_GRAD_B = 'light-dark(#8E7BC0, #4C3A6B)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the pill/dot ticks,
// skeleton shimmer, sheet slide-in; ALL collapse under prefers-reduced-motion
// (snap behavior and static colors persist).
// ---------------------------------------------------------------------------

const GLOWLINE_CSS = `
.glp-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.glp-btn:disabled { cursor: default; }
.glp-focusable:focus-visible {
  outline: 2px solid ${BRAND_DEEP};
  outline-offset: 2px;
}
.glp-fade { transition: opacity 200ms ease; }
.glp-move { transition: transform 240ms ease; }
@keyframes glp-pill-tick {
  from { opacity: 0.35; }
  to { opacity: 1; }
}
.glp-pill-tick { animation: glp-pill-tick 120ms ease; }
@keyframes glp-dot-tick {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.glp-dot-tick { animation: glp-dot-tick 90ms ease; }
@keyframes glp-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.glp-sheet-in { animation: glp-sheet-in 240ms ease; }
@keyframes glp-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.glp-shimmer {
  animation: glp-shimmer 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .glp-fade, .glp-move { transition: none; }
  .glp-pill-tick, .glp-dot-tick, .glp-sheet-in { animation: none; }
  .glp-shimmer { animation: none; display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // cannot tell the stages apart).
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
  // Scroll lock while the metric sheet is open; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44px slots
  // optically align to the 16px gutter. Hairline + blur always on.
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 200,
    minWidth: 0,
  },
  // Compact title starts opacity 0; fades in when the large title scrolls
  // under the bar (IntersectionObserver sentinel — user-driven).
  navTitle: {fontSize: 17, fontWeight: 600, lineHeight: '20px', whiteSpace: 'nowrap'},
  // Playhead-context subtitle — always visible, ellipsized at the 200px
  // center max ('4:00 PM — collab mention by @wavetable' is the stress).
  navSubtitle: {
    maxWidth: 200,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: TINT_12,
    color: BRAND_DEEP,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LARGE TITLE — 52px in-flow row below the sticky navBar (104px total
  // large header); scrolls away while the navBar stays.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: '34px'},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // PULSE SCRUB CARD — 244px = 16 + 20 header + 8 + 120 chart + 16 axis +
  // 8 + 40 controls + 16 (grid verbatim from the spec).
  pulseCard: {
    marginInline: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  cardHeaderRow: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  nowCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Chart area — 120px tall; inner 2px side margins per spec so the
  // 2px-wide playhead line never clips at h0/h23.
  chartArea: {
    position: 'relative',
    height: 120,
    marginInline: 2,
    touchAction: 'none',
    cursor: 'ew-resize',
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    background: CHART_STROKE,
    pointerEvents: 'none',
  },
  // 44×44 slider hit around the 28px visual thumb.
  thumbBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
  },
  thumbDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: BRAND_DEEP,
    boxShadow: '0 0 0 2px var(--color-background-card), 0 2px 8px var(--color-shadow)',
  },
  // Spike dots — 10px glyphs inside transparent 44×44 hit buttons; 1.5px
  // card-background ring lifts them off the brand wash.
  dotBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
  },
  dotGlyph: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: BRAND_DEEP,
    boxShadow: '0 0 0 1.5px var(--color-background-card)',
  },
  // Hour axis — 16px row, 5 fixed labels spaced by percentage.
  axisRow: {position: 'relative', height: 16, marginInline: 2},
  axisLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Control row — 40px: ±1h chips (44-wide × 36 visual inside 44 hits) +
  // trailing Jump-to-spike 36px secondary button; gap 8, wrap banned.
  controlRow: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  stepChipHit: {
    width: 44,
    height: 44,
    marginBlock: -2,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    flexShrink: 0,
  },
  stepChip: {
    width: 44,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  chipDisabled: {opacity: 0.35},
  controlSpacer: {flex: 1},
  jumpBtn: {
    height: 36,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_DEEP,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Inset-grouped listCard.
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
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // DELTA STACK — 72px rows; name column flex 1 minWidth 0, pill flex none.
  deltaRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  deltaText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  metricName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metricCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SPLIT PILL — 24px two-segment 999 pill; left at-playhead on muted,
  // right now-value on the brand tint; 1px PILL_SPLIT boundary between.
  splitPill: {
    display: 'flex',
    alignItems: 'stretch',
    height: 24,
    borderRadius: 999,
    overflow: 'hidden',
    flex: 'none',
  },
  pillLeft: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  pillSplit: {width: 1, background: PILL_SPLIT},
  pillRight: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    background: PILL_TINT,
    color: PILL_TINT_TEXT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  thumb48: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // POSTS — 72px media rows; the playhead-matched row gets the 8% wash +
  // 3px BRAND_DEEP inset-start bar.
  postRow: {
    position: 'relative',
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  postRowActive: {background: TINT_8},
  highlightBar: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: 3,
    background: BRAND_DEEP,
    pointerEvents: 'none',
  },
  postText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  postTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  postMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  postViews: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 60px two-line rows (audience snapshot, alerts).
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  row60Text: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
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
  rowValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 44px utility rows (audience buckets, post engagement, sheet hours).
  row44: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  row44Label: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row44Value: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ALERT rows — swipe-to-reveal 72px 'Mark reviewed' brand block +
  // mandatory 44×44 ellipsis fallback.
  alertOuter: {position: 'relative'},
  alertClip: {position: 'relative', overflow: 'hidden'},
  alertAction: {
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
    background: BRAND_DEEP,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  alertContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  alertRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 220,
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
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SKELETON — 72px rows impersonating the DeltaStack exactly (zero layout
  // shift on resolve); deterministic staggered widths.
  skelRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skelShimmerWrap: {position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'},
  skelShimmer: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(105deg, transparent 30%, ${SHIMMER} 50%, transparent 70%)`,
  },
  // TAB BAR — 64px sticky bottom z20; 4 flex-1 tabItems.
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
  tabItemActive: {color: BRAND_DEEP},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // 16px-min brand badge pill, 10/600, offset top −4 / right −8 (chrome
  // foundations verbatim).
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_DEEP,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom mid-scroll (amendment: absolute would pin to the
  // DOCUMENT bottom on tall tabs). Switches to absolute ONLY while the
  // shell is scroll-locked at 100dvh (sheet open). Always mounted.
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
  toastAnchorLocked: {position: 'absolute', insetInline: 0, bottom: 76, height: 'auto'},
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
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
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_DEEP,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell; detents 55% /
  // calc(100% − 56px).
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
  // The ONE legal inner scroller — the sheet's own hourly list.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  hourRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  hourRowActive: {background: TINT_12, fontWeight: 600},
  hourLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  hourValue: {fontSize: 16, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  hourValueMuted: {color: 'var(--color-text-secondary)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates. All
// verified by hand before shipping; the headline aggregates DERIVE from the
// hourly arrays in render, so the laws cannot drift.
// ---------------------------------------------------------------------------

// The frozen "now" hour (11 PM) — the playhead's default.
const NOW_HOUR = 23;

// Hourly views. SUM = 17,980 (running total: 560, 780, 960, 1140, 1340,
// 1680, 2160, 2730, 3380, 4080, 4840, 5650, 6420, 7150, 7840, 8670, 9620,
// 10860, 13040, 14910, 16330, 17390, 17980). viewsCumulative(19) = 13,040.
const VIEWS_BY_HOUR = [
  300, 260, 220, 180, 180, 200, 340, 480, 570, 650, 700, 760, 810, 770, 730, 690, 830, 950, 1240,
  2180, 1870, 1420, 1060, 590,
];

// Hourly follower deltas. SUM = +264 (running: 3 at h5, 24 at h9, 51 at
// h12, 72 at h15, 111 at h18, 175 at h19, 216 at h20, 258 at h22, 264 at
// h23). h2 = 0 and h3 = −1 are the zero/negative sheet-row stress.
const FOLLOWER_DELTA_BY_HOUR = [
  2, 1, 0, -1, 0, 1, 3, 5, 6, 7, 8, 9, 10, 8, 7, 6, 9, 12, 18, 64, 41, 27, 15, 6,
];

const FOLLOWERS_START = 48000;

/** Inclusive prefix sums — cumulative value AT hour h. */
function prefix(values: number[]): number[] {
  const out: number[] = [];
  let sum = 0;
  for (const value of values) {
    sum += value;
    out.push(sum);
  }
  return out;
}

const VIEWS_CUM = prefix(VIEWS_BY_HOUR); // VIEWS_CUM[23] = 17,980
const FOLLOWER_CUM = prefix(FOLLOWER_DELTA_BY_HOUR); // FOLLOWER_CUM[23] = 264
// Derived headline anchors (cross-check law: these EQUAL the array sums).
const VIEWS_TODAY = VIEWS_CUM[23]; // 17,980
const FOLLOWERS_NOW = FOLLOWERS_START + FOLLOWER_CUM[23]; // 48,264
// followersAt(19) = 48,000 + 175 = 48,175; followersAt(12) = 48,051.

interface Post {
  id: string;
  title: string; // p2's is the one-line ellipsis stress (spec stress 1)
  views: number;
  viewsLabel: string;
  postedLabel: string;
  topForStart: number; // inclusive hour bucket this post is 'top' for
  topForEnd: number;
  likes: number;
  comments: number;
}

// 4,120 + 6,480 + 7,380 = 17,980 = the daily views total (constructible).
const POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Golden hour warmup',
    views: 4120,
    viewsLabel: '4,120',
    postedLabel: 'Posted 6:58 AM',
    topForStart: 0,
    topForEnd: 8,
    likes: 388,
    comments: 24,
  },
  {
    id: 'p2',
    title: "Studio collab teaser (extended director's cut, part 2)",
    views: 6480,
    viewsLabel: '6,480',
    postedLabel: 'Posted 9:12 AM',
    topForStart: 9,
    topForEnd: 18,
    likes: 512,
    comments: 41,
  },
  {
    id: 'p3',
    title: 'Night reel: pulse check',
    views: 7380,
    viewsLabel: '7,380',
    postedLabel: 'Posted 7:14 PM',
    topForStart: 19,
    topForEnd: 23,
    likes: 640,
    comments: 57,
  },
];

interface Spike {
  hour: number;
  label: string; // event-naming aria copy: 'Spike: reel posted, 7 PM'
  subtitle: string; // navBar subtitle when the playhead sits here
}

// The h16/h19 adjacency (3 intervals apart) is the magnet single-capture
// stress; h16's subtitle is the 200px-ellipsis stress (spec stress 1).
const SPIKES: Spike[] = [
  {hour: 7, label: 'Spike: morning post went out, 7 AM', subtitle: '7:00 AM — post went out'},
  {
    hour: 16,
    label: 'Spike: collab mention by @wavetable, 4 PM',
    subtitle: '4:00 PM — collab mention by @wavetable',
  },
  {hour: 19, label: 'Spike: reel posted, 7 PM', subtitle: '7:14 PM — reel posted'},
];
const SPIKE_HOURS = SPIKES.map(spike => spike.hour);

interface Alert {
  id: string;
  title: string;
  detail: string;
}

// Both alerts link to the s3 (h19) spike: landing the playhead on 7 PM
// clears both together (badge 2→0, 'Alerts reviewed' announced).
const ALERTS: Alert[] = [
  {id: 'a1', title: 'Unusual view spike at 7 PM', detail: 'Views jumped to 2,180 in one hour'},
  {id: 'a2', title: 'Follower growth +64 in one hour', detail: '7 PM — linked to Night reel'},
];

interface AudienceBucket {
  id: string;
  label: string;
  delta: number; // 4-hour follower delta
  cumEnd: number; // followers at the bucket's last hour
}

// Buckets of 4 h from FOLLOWER_DELTA_BY_HOUR: +2 +9 +30 +31 +103 +89 = 264
// ✓ (the spec's own recompute; its first-draft list did not reconcile).
// cumEnd chain: 48,002 / 48,011 / 48,041 / 48,072 / 48,175 / 48,264 —
// bucket 5 ends at h19 = followersAt(19) = 48,175 ✓, bucket 6 at
// FOLLOWERS_NOW ✓.
const AUDIENCE_BUCKETS: AudienceBucket[] = [
  {id: 'b0', label: '12 AM – 4 AM', delta: 2, cumEnd: 48002},
  {id: 'b1', label: '4 AM – 8 AM', delta: 9, cumEnd: 48011},
  {id: 'b2', label: '8 AM – 12 PM', delta: 30, cumEnd: 48041},
  {id: 'b3', label: '12 PM – 4 PM', delta: 31, cumEnd: 48072},
  {id: 'b4', label: '4 PM – 8 PM', delta: 103, cumEnd: 48175},
  {id: 'b5', label: '8 PM – 12 AM', delta: 89, cumEnd: 48264},
];

// Deterministic skeleton bar widths (primary 60/45/70, secondary 40/55/30).
const SKELETON_WIDTHS: Array<{primary: string; secondary: string}> = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
];

// Fixed hour-axis labels, spaced by percentage (h0/h6/h12/h18/h23).
const AXIS_LABELS: Array<{hour: number; text: string}> = [
  {hour: 0, text: '12A'},
  {hour: 6, text: '6A'},
  {hour: 12, text: '12P'},
  {hour: 18, text: '6P'},
  {hour: 23, text: '11P'},
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** 19 → '7 PM' (sheet hour rows, axis-adjacent copy). */
function fmtHourShort(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${suffix}`;
}

/** 19 → '7:00 PM' (slider valuetext, captions, subtitle fallback). */
function fmtHourLong(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${suffix}`;
}

/** 48264 → '48,264'. */
function fmtInt(value: number): string {
  return value.toLocaleString('en-US');
}

/** Signed delta with a TRUE minus (U+2212), never a hyphen: −1, 0, +64. */
function fmtDelta(value: number): string {
  if (value > 0) return `+${fmtInt(value)}`;
  if (value < 0) return `−${fmtInt(Math.abs(value))}`;
  return '0';
}

/** navBar subtitle for the playhead hour (spike hours get event copy). */
function subtitleFor(hour: number): string {
  if (hour === NOW_HOUR) return '11:00 PM — now';
  const spike = SPIKES.find(entry => entry.hour === hour);
  if (spike != null) return spike.subtitle;
  return fmtHourLong(hour);
}

/** The top post for an hour: h0–8 → p1, h9–18 → p2, h19–23 → p3. */
function topPostAt(hour: number): Post {
  const found = POSTS.find(post => hour >= post.topForStart && hour <= post.topForEnd);
  return found ?? POSTS[POSTS.length - 1];
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePulseStore(): one flat state record + one
// update(id, patch). Every input path (scrub, chips, dots, slider keys,
// sheet rows, tabs, swipes) funnels through it; every surface derives.
// ---------------------------------------------------------------------------

type TabId = 'pulse' | 'posts' | 'audience' | 'alerts';
type MetricId = 'followers' | 'views' | 'topPost';

interface ToastState {
  seq: number;
  text: string;
  /** role=status for refresh results; plain polite text otherwise. */
  isStatus: boolean;
  /** Exact-prior-state Undo payload (stress fixture 7). */
  undo: {reviewedAlerts: string[]; seenSpikes: number[]} | null;
}

interface PulseState {
  playheadHour: number;
  activeTab: TabId;
  screenByTab: Record<TabId, 'root'>;
  scrollByTab: Partial<Record<TabId, number>>;
  sheet: {metricId: MetricId; detent: 'medium' | 'large'} | null;
  seenSpikes: number[]; // Set-as-array
  // Deviation (noted): the spec's boolean `alertsCleared` became this
  // per-alert array — stress fixture 7 (Undo the SECOND review → a2
  // unreviewed, badge exactly 1) needs per-alert restore. `alertsCleared`
  // derives: reviewed(a) = reviewedAlerts ∋ a.id || seenSpikes ∋ 19.
  reviewedAlerts: string[];
  refreshState: 'idle' | 'skeleton' | 'updated';
  openSwipeAlertId: string | null;
  alertMenuId: string | null;
  toast: ToastState | null;
}

const INITIAL_STATE: PulseState = {
  playheadHour: NOW_HOUR,
  activeTab: 'pulse',
  screenByTab: {pulse: 'root', posts: 'root', audience: 'root', alerts: 'root'},
  scrollByTab: {},
  sheet: null,
  seenSpikes: [],
  reviewedAlerts: [],
  refreshState: 'idle',
  openSwipeAlertId: null,
  alertMenuId: null,
  toast: null,
};

function usePulseStore() {
  const [state, setState] = useState<PulseState>(INITIAL_STATE);
  const update = useCallback(<K extends keyof PulseState>(id: K, patch: PulseState[K]) => {
    setState(prev => ({...prev, [id]: patch}));
  }, []);
  return {state, update, setState};
}

/**
 * Container-width hook (grid-feeder-console pattern): the demo's desktop
 * stage is ~1045px inside a 1440px window, so only a ResizeObserver can
 * tell the 390px mobile stage from the desktop stage.
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

/** Nearest scroll parent (the demo's .preview-wrap owns page scroll). */
function findScroller(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return document.scrollingElement as HTMLElement | null;
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
// BRAND MARK — 28px Glowline heartbeat-arrow glyph in the 44×44 nav slot.
// ---------------------------------------------------------------------------

function GlowlineMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M1.5 9.5h3l1.8-4.5 2.6 8 2.1-6 1.2 2.5h2.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 6.5 16.5 9.5l-3 .6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// POST THUMB — 48px id-derived SVG gradient+shape composition (no photos).
// p1 sun-over-horizon, p2 overlapping collab circles, p3 night pulse line;
// strokes are --color-text-primary at reduced opacity, decorative.
// ---------------------------------------------------------------------------

function PostThumb({postId}: {postId: string}) {
  const grads: Record<string, [string, string]> = {
    p1: [P1_GRAD_A, P1_GRAD_B],
    p2: [P2_GRAD_A, P2_GRAD_B],
    p3: [P3_GRAD_A, P3_GRAD_B],
  };
  const [from, to] = grads[postId] ?? grads.p3;
  return (
    <span
      style={{...styles.thumb48, background: `linear-gradient(135deg, ${from}, ${to})`}}
      aria-hidden>
      <svg width={48} height={48} viewBox="0 0 48 48" fill="none" aria-hidden>
        {postId === 'p1' ? (
          <g stroke="var(--color-text-primary)" strokeWidth={2} opacity={0.65} strokeLinecap="round">
            <circle cx={24} cy={22} r={7} fill="none" />
            <path d="M8 34h32" />
            <path d="M24 9v3M35 13l-2 2M13 13l2 2" />
          </g>
        ) : postId === 'p2' ? (
          <g stroke="var(--color-text-primary)" strokeWidth={2} opacity={0.65}>
            <circle cx={19} cy={24} r={9} fill="none" />
            <circle cx={29} cy={24} r={9} fill="none" />
          </g>
        ) : (
          <g stroke="var(--color-text-primary)" strokeWidth={2} opacity={0.65} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 28h8l3-9 6 14 4-11 2 6h11" fill="none" />
            <circle cx={38} cy={12} r={3.5} fill="none" />
          </g>
        )}
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SPLIT PILL — value-at-playhead | value-now. The left half re-mounts per
// scrub (keyed) so the 120ms opacity tick fires; the animation is removed
// under prefers-reduced-motion by the CSS guard.
// ---------------------------------------------------------------------------

interface SplitPillProps {
  atLabel: string;
  nowLabel: string;
  tickKey: number;
  atAria: string;
  nowAria: string;
}

function SplitPill({atLabel, nowLabel, tickKey, atAria, nowAria}: SplitPillProps) {
  return (
    <span style={styles.splitPill} aria-label={`${atAria}, ${nowAria}`}>
      <span key={tickKey} className="glp-pill-tick" style={styles.pillLeft} aria-hidden>
        {atLabel}
      </span>
      <span style={styles.pillSplit} aria-hidden />
      <span style={styles.pillRight} aria-hidden>
        {nowLabel}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PULSE SCRUB CARD — the signature control. 120px measured-width area
// sparkline, draggable playhead (role=slider 0–23, ±8px ABSOLUTE spike
// magnet), spike-dot buttons, ±1h chips, Jump-to-spike. Every gesture has
// the visible button path; the slider announces valuetext itself.
// ---------------------------------------------------------------------------

const CHART_H = 120;
const CHART_MAX = 2180; // max(VIEWS_BY_HOUR) at h19
const CHART_PAD_TOP = 6;
const CHART_PAD_BOTTOM = 4;

function chartY(views: number): number {
  const usable = CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  return CHART_PAD_TOP + (1 - views / CHART_MAX) * usable;
}

interface PulseScrubCardProps {
  playheadHour: number;
  narrow: boolean;
  dotTick: {hour: number; seq: number} | null;
  onScrub: (hour: number, viaPointer: boolean) => void;
}

function PulseScrubCard({playheadHour, narrow, dotTick, onScrub}: PulseScrubCardProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotWidth = useElementWidth(chartRef);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);

  // x(h) = h/23 of the MEASURED width (fluid; 14px/interval only at 390).
  const xFor = (hour: number): number => (plotWidth > 0 ? (hour / 23) * plotWidth : 0);

  /** clientX → hour, with the ±8px ABSOLUTE spike magnet (single-capture:
   * adjacent dots h16/h19 sit ≈33px apart even at the 320px stage). */
  const hourForClientX = (clientX: number): number => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return playheadHour;
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    for (const spikeHour of SPIKE_HOURS) {
      if (Math.abs(x - (spikeHour / 23) * rect.width) <= 8) return spikeHour;
    }
    return Math.round((x / rect.width) * 23);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    movedRef.current = false;
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(hourForClientX(event.clientX), true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    if (Math.abs(event.clientX - startXRef.current) > 4) movedRef.current = true;
    onScrub(hourForClientX(event.clientX), true);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onSliderKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = playheadHour - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = playheadHour + 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 23;
    if (next == null) return;
    event.preventDefault();
    onScrub(Math.min(23, Math.max(0, next)), false);
  };

  // 'Jump to spike' cycles 7 → 16 → 19 → 7 from the current playhead.
  const nextSpike = SPIKE_HOURS.find(hour => hour > playheadHour) ?? SPIKE_HOURS[0];

  // Sparkline paths from the measured width.
  const points = VIEWS_BY_HOUR.map((views, hour) => `${xFor(hour).toFixed(1)},${chartY(views).toFixed(1)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${plotWidth.toFixed(1)},${CHART_H} L 0,${CHART_H} Z`;

  const playheadX = xFor(playheadHour);
  const playheadY = chartY(VIEWS_BY_HOUR[playheadHour]);

  return (
    <section style={styles.pulseCard} aria-label="24-hour pulse">
      <div style={styles.cardHeaderRow}>
        <span style={styles.overline}>Today</span>
        <span style={styles.nowCaption}>Now 11:00 PM</span>
      </div>
      <div
        ref={chartRef}
        style={styles.chartArea}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}>
        {plotWidth > 0 ? (
          <>
            <svg
              width="100%"
              height={CHART_H}
              viewBox={`0 0 ${Math.max(plotWidth, 1)} ${CHART_H}`}
              preserveAspectRatio="none"
              aria-hidden
              style={{position: 'absolute', inset: 0, display: 'block'}}>
              <path d={areaPath} fill={CHART_FILL} />
              <path d={linePath} stroke={CHART_STROKE} strokeWidth={2} fill="none" strokeLinejoin="round" />
            </svg>
            <span style={{...styles.playheadLine, left: playheadX - 1}} aria-hidden />
            {SPIKES.map(spike => (
              <button
                key={spike.hour}
                type="button"
                className="glp-btn glp-focusable"
                style={{
                  ...styles.dotBtn,
                  left: xFor(spike.hour) - 22,
                  top: chartY(VIEWS_BY_HOUR[spike.hour]) - 22,
                }}
                aria-label={spike.label}
                onClick={() => {
                  if (movedRef.current) {
                    movedRef.current = false;
                    return;
                  }
                  onScrub(spike.hour, false);
                }}>
                <span
                  key={dotTick != null && dotTick.hour === spike.hour ? dotTick.seq : -1}
                  className="glp-dot-tick"
                  style={styles.dotGlyph}
                  aria-hidden
                />
              </button>
            ))}
            <button
              type="button"
              className="glp-btn glp-focusable"
              role="slider"
              aria-label="Playhead hour"
              aria-valuemin={0}
              aria-valuemax={23}
              aria-valuenow={playheadHour}
              aria-valuetext={fmtHourLong(playheadHour)}
              style={{...styles.thumbBtn, left: playheadX - 22, top: playheadY - 22}}
              onKeyDown={onSliderKeyDown}
              onClick={() => {
                movedRef.current = false;
              }}>
              <span style={styles.thumbDot} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
      <div style={styles.axisRow} aria-hidden>
        {AXIS_LABELS.map(label => (
          <span
            key={label.hour}
            style={{
              ...styles.axisLabel,
              ...(label.hour === 0
                ? {left: 0}
                : label.hour === 23
                  ? {right: 0}
                  : {left: `${((label.hour / 23) * 100).toFixed(2)}%`, transform: 'translateX(-50%)'}),
            }}>
            {label.text}
          </span>
        ))}
      </div>
      <div style={styles.controlRow}>
        <button
          type="button"
          className="glp-btn glp-focusable"
          style={{...styles.stepChipHit, ...(playheadHour === 0 ? styles.chipDisabled : null)}}
          aria-label="Back one hour"
          disabled={playheadHour === 0}
          onClick={() => onScrub(playheadHour - 1, false)}>
          <span style={styles.stepChip}>{'−1h'}</span>
        </button>
        <button
          type="button"
          className="glp-btn glp-focusable"
          style={{...styles.stepChipHit, ...(playheadHour === 23 ? styles.chipDisabled : null)}}
          aria-label="Forward one hour"
          disabled={playheadHour === 23}
          onClick={() => onScrub(playheadHour + 1, false)}>
          <span style={styles.stepChip}>+1h</span>
        </button>
        <span style={styles.controlSpacer} />
        <button
          type="button"
          className="glp-btn glp-focusable"
          style={styles.jumpBtn}
          aria-label={`Jump to spike, next ${fmtHourLong(nextSpike)}`}
          onClick={() => onScrub(nextSpike, false)}>
          <Icon icon={ZapIcon} size="sm" color="inherit" />
          {narrow ? 'Spike' : 'Jump to spike'}
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// METRIC SHEET — two detents; 24 × 44px hour rows (each a real button that
// moves the playhead), playhead row tinted 12% + 600 weight. The sheet body
// is the ONE legal inner scroller (stress 6: large detent at 320×568).
// ---------------------------------------------------------------------------

const METRIC_TITLES: Record<MetricId, string> = {
  followers: 'Followers',
  views: 'Views',
  topPost: 'Top post',
};

function hourValueFor(metricId: MetricId, hour: number): {label: string; muted: boolean} {
  if (metricId === 'followers') {
    const delta = FOLLOWER_DELTA_BY_HOUR[hour];
    // ≤0 renders '0' / '−1' (true minus) in text-secondary — NOT error red
    // (stress fixture 3).
    return {label: fmtDelta(delta), muted: delta <= 0};
  }
  if (metricId === 'views') {
    return {label: fmtInt(VIEWS_BY_HOUR[hour]), muted: false};
  }
  return {label: topPostAt(hour).id === 'p2' ? 'Studio collab teaser' : topPostAt(hour).title, muted: false};
}

interface MetricSheetProps {
  metricId: MetricId;
  detent: 'medium' | 'large';
  playheadHour: number;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  onDetentToggle: () => void;
  onClose: () => void;
  onPickHour: (hour: number) => void;
}

function MetricSheet({
  metricId,
  detent,
  playheadHour,
  sheetRef,
  reducedMotion,
  onDetentToggle,
  onClose,
  onPickHour,
}: MetricSheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="glp-sheet-title"
      tabIndex={-1}
      className={reducedMotion ? undefined : 'glp-sheet-in'}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}>
      <button
        type="button"
        className="glp-btn glp-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={onDetentToggle}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="glp-sheet-title" style={styles.sheetTitle}>
          {METRIC_TITLES[metricId]} by hour
        </h2>
        <button
          type="button"
          className="glp-btn glp-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        {VIEWS_BY_HOUR.map((_, hour) => {
          const value = hourValueFor(metricId, hour);
          const isPlayhead = hour === playheadHour;
          return (
            <button
              key={hour}
              type="button"
              className="glp-btn glp-focusable"
              style={{...styles.hourRow, ...(isPlayhead ? styles.hourRowActive : null)}}
              aria-label={`${fmtHourShort(hour)}, ${value.label}${isPlayhead ? ', playhead' : ''} — move playhead here`}
              aria-current={isPlayhead ? 'true' : undefined}
              onClick={() => onPickHour(hour)}>
              <span style={styles.hourLabel}>{fmtHourShort(hour)}</span>
              <span
                style={{
                  ...styles.hourValue,
                  ...(value.muted ? styles.hourValueMuted : null),
                  ...(isPlayhead ? {fontWeight: 600} : null),
                }}>
                {value.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ALERT ROW — 60px two-line row with swipe-to-reveal (−72px snap, brand
// 'Mark reviewed' block) + the MANDATORY 44×44 ellipsis anchored-menu
// fallback. Reviewed rows show the 'Reviewed' caption and lose the swipe.
// ---------------------------------------------------------------------------

interface AlertRowProps {
  alert: Alert;
  reviewed: boolean;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onRowTap: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onMarkReviewed: () => void;
  onJumpToSpike: () => void;
}

function AlertRow({
  alert,
  reviewed,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onRowTap,
  onToggleMenu,
  onMarkReviewed,
  onJumpToSpike,
}: AlertRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reviewed) return; // nothing to reveal
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
    <div style={styles.alertOuter}>
      <div style={styles.alertClip}>
        <button
          type="button"
          className="glp-btn"
          style={styles.alertAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onMarkReviewed}>
          <Icon icon={CheckIcon} size="md" color="inherit" />
          Mark reviewed
        </button>
        <div
          style={{
            ...styles.alertContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="glp-btn glp-focusable"
            style={styles.alertRowBtn}
            aria-label={`${alert.title}${reviewed ? ', reviewed' : ''} — jump to the 7 PM spike`}
            onClick={guardClick(() => onRowTap())}>
            <span style={styles.row60Text}>
              <span style={styles.rowPrimary}>{alert.title}</span>
              <span style={styles.rowSecondary}>{reviewed ? 'Reviewed' : alert.detail}</span>
            </span>
          </button>
          <button
            type="button"
            className="glp-btn glp-focusable"
            style={styles.iconBtn}
            aria-label={`Actions for ${alert.title}`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${alert.title}`}
          style={{...styles.anchoredMenu, top: 52}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          {reviewed ? null : (
            <>
              <button
                type="button"
                role="menuitem"
                className="glp-btn glp-focusable"
                style={styles.menuRow}
                onClick={onMarkReviewed}>
                <Icon icon={CheckIcon} size="sm" color="secondary" />
                <span style={styles.menuRowText}>Mark reviewed</span>
              </button>
              <div style={styles.rowDivider} />
            </>
          )}
          <button
            type="button"
            role="menuitem"
            className="glp-btn glp-focusable"
            style={styles.menuRow}
            onClick={onJumpToSpike}>
            <Icon icon={ZapIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Jump to 7 PM spike</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DELTA STACK — three 72px rows (Followers / Views / Top post), all reading
// the single playheadHour atom; 218px card = 3×72 + 2×1px dividers. The
// refresh skeleton impersonates the exact geometry (zero layout shift).
// ---------------------------------------------------------------------------

// Post-row jump targets (the spike each post is associated with).
const POST_JUMP: Record<string, number> = {p1: 7, p2: 16, p3: 19};

interface DeltaStackProps {
  playheadHour: number;
  onOpenSheet: (metricId: MetricId, opener: HTMLElement) => void;
}

function DeltaStack({playheadHour, onOpenSheet}: DeltaStackProps) {
  const atCaption = `at ${fmtHourLong(playheadHour)}`;
  const followersAt = FOLLOWERS_START + FOLLOWER_CUM[playheadHour];
  const viewsAt = VIEWS_CUM[playheadHour];
  const topPost = topPostAt(playheadHour);
  const topPostNow = topPostAt(NOW_HOUR);
  return (
    <div style={styles.listCard}>
      <button
        type="button"
        className="glp-btn glp-focusable"
        style={styles.deltaRow}
        aria-label={`Followers, ${fmtInt(followersAt)} ${atCaption}, ${fmtInt(FOLLOWERS_NOW)} now — open hourly detail`}
        onClick={event => onOpenSheet('followers', event.currentTarget)}>
        <span style={styles.deltaText}>
          <span style={styles.metricName}>Followers</span>
          <span style={styles.metricCaption}>{atCaption}</span>
        </span>
        <SplitPill
          atLabel={fmtInt(followersAt)}
          nowLabel={fmtInt(FOLLOWERS_NOW)}
          tickKey={playheadHour}
          atAria={`${fmtInt(followersAt)} ${atCaption}`}
          nowAria={`${fmtInt(FOLLOWERS_NOW)} now`}
        />
      </button>
      <div style={styles.rowDivider} />
      <button
        type="button"
        className="glp-btn glp-focusable"
        style={styles.deltaRow}
        aria-label={`Views, ${fmtInt(viewsAt)} ${atCaption}, ${fmtInt(VIEWS_TODAY)} today — open hourly detail`}
        onClick={event => onOpenSheet('views', event.currentTarget)}>
        <span style={styles.deltaText}>
          <span style={styles.metricName}>Views</span>
          <span style={styles.metricCaption}>{atCaption}</span>
        </span>
        <SplitPill
          atLabel={fmtInt(viewsAt)}
          nowLabel={fmtInt(VIEWS_TODAY)}
          tickKey={playheadHour}
          atAria={`${fmtInt(viewsAt)} ${atCaption}`}
          nowAria={`${fmtInt(VIEWS_TODAY)} today`}
        />
      </button>
      <div style={styles.rowDividerDeep} />
      <button
        type="button"
        className="glp-btn glp-focusable"
        style={styles.deltaRow}
        aria-label={`Top post ${atCaption}: ${topPost.title}, ${topPost.viewsLabel} views — open hourly detail`}
        onClick={event => onOpenSheet('topPost', event.currentTarget)}>
        <PostThumb postId={topPost.id} />
        <span style={styles.deltaText}>
          <span style={styles.metricName}>{topPost.title}</span>
          <span style={styles.metricCaption}>Top post {atCaption}</span>
        </span>
        <SplitPill
          atLabel={topPost.viewsLabel}
          nowLabel={topPostNow.viewsLabel}
          tickKey={playheadHour}
          atAria={`${topPost.viewsLabel} views ${atCaption}`}
          nowAria={`${topPostNow.viewsLabel} views now`}
        />
      </button>
    </div>
  );
}

function DeltaStackSkeleton() {
  return (
    <div style={{...styles.listCard, position: 'relative'}} aria-busy="true" aria-label="Loading hourly metrics">
      {SKELETON_WIDTHS.map((widths, index) => (
        <div key={widths.primary}>
          {index > 0 ? <div style={index === 2 ? styles.rowDividerDeep : styles.rowDivider} aria-hidden /> : null}
          <div style={styles.skelRow} aria-hidden>
            <span style={styles.skelThumb} />
            <span style={styles.skelBars}>
              <span style={{...styles.skelBar, width: widths.primary}} />
              <span style={{...styles.skelBar, width: widths.secondary}} />
            </span>
          </div>
        </div>
      ))}
      {/* One shared shimmer sweep — removed ENTIRELY under reduced motion
          (CSS guard); the static muted blocks alone encode 'loading'. */}
      <span style={styles.skelShimmerWrap} aria-hidden>
        <span className="glp-shimmer" style={styles.skelShimmer} />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: TabId; label: string; icon: typeof ActivityIcon}> = [
  {id: 'pulse', label: 'Pulse', icon: ActivityIcon},
  {id: 'posts', label: 'Posts', icon: LayoutGridIcon},
  {id: 'audience', label: 'Audience', icon: UsersIcon},
  {id: 'alerts', label: 'Alerts', icon: BellIcon},
];

export default function MobileCreatorPulseTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column; viewport query is the first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  // Under 360px measured width the Jump button drops to icon+'Spike'.
  const narrow = wrapWidth > 0 && wrapWidth < 360;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, setState} = usePulseStore();

  // Focus plumbing — every overlay restores focus to its opener.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const alertMenuRef = useRef<HTMLDivElement | null>(null);
  const largeTitleRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  const dotSeqRef = useRef(0);

  // Transient dot-snap tick (visual garnish; playhead truth lives in the
  // store). Reduced motion removes the animation, the snap still occurs.
  const [dotTick, setDotTick] = useState<{hour: number; seq: number} | null>(null);
  // Large-title collapse — IntersectionObserver sentinel, user-driven.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const element = largeTitleRef.current;
    if (element == null || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setCollapsed(!entry.isIntersecting);
      },
      {rootMargin: '-53px 0px 0px 0px', threshold: 0},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Derived — badge/reviewed state derives from the two arrays; the spec's
  // `alertsCleared` boolean is this derivation.
  const isReviewed = (alertId: string): boolean =>
    state.reviewedAlerts.includes(alertId) || state.seenSpikes.includes(19);
  const badgeCount = ALERTS.filter(alert => !isReviewed(alert.id)).length;
  const subtitle = subtitleFor(state.playheadHour);

  const nextToastSeq = (): number => {
    toastSeqRef.current += 1;
    return toastSeqRef.current;
  };

  // PLAYHEAD — every input path (drag, chips, dots, slider keys, sheet
  // rows, post rows, bucket rows, alert rows) funnels here.
  const setPlayhead = (rawHour: number) => {
    const hour = Math.min(23, Math.max(0, rawHour));
    if (hour !== state.playheadHour && SPIKE_HOURS.includes(hour)) {
      dotSeqRef.current += 1;
      setDotTick({hour, seq: dotSeqRef.current});
    }
    const seq = nextToastSeq();
    setState(prev => {
      if (hour === prev.playheadHour) return prev;
      const isSpike = SPIKE_HOURS.includes(hour);
      const seenSpikes =
        isSpike && !prev.seenSpikes.includes(hour) ? [...prev.seenSpikes, hour] : prev.seenSpikes;
      // Landing on h19 clears both alerts together (badge 2→0) — announced
      // once through the single polite dock.
      const clearsNow =
        hour === 19 &&
        !prev.seenSpikes.includes(19) &&
        ALERTS.some(alert => !prev.reviewedAlerts.includes(alert.id));
      return {
        ...prev,
        playheadHour: hour,
        seenSpikes,
        toast: clearsNow ? {seq, text: 'Alerts reviewed', isStatus: false, undo: null} : prev.toast,
      };
    });
  };

  // REFRESH — skeleton on press; resolves on the NEXT user tap in main or
  // a second press. No timers (deterministic by law).
  const pressRefresh = () => {
    const seq = nextToastSeq();
    setState(prev =>
      prev.refreshState === 'skeleton'
        ? {...prev, refreshState: 'updated', toast: {seq, text: 'Updated just now', isStatus: true, undo: null}}
        : {...prev, refreshState: 'skeleton', toast: {seq, text: 'Loading', isStatus: true, undo: null}},
    );
  };
  const resolveRefreshOnTap = () => {
    if (state.refreshState !== 'skeleton') return;
    const seq = nextToastSeq();
    setState(prev =>
      prev.refreshState === 'skeleton'
        ? {...prev, refreshState: 'updated', toast: {seq, text: 'Updated just now', isStatus: true, undo: null}}
        : prev,
    );
  };

  // ALERT REVIEW — undo-over-confirm: executes immediately, Undo restores
  // the EXACT prior state (stress 7: undoing the second review returns a2
  // to unreviewed and the badge to exactly 1).
  const markReviewed = (alertId: string, viaMenu: boolean) => {
    const seq = nextToastSeq();
    setState(prev => {
      if (prev.reviewedAlerts.includes(alertId) || prev.seenSpikes.includes(19)) {
        return {...prev, openSwipeAlertId: null, alertMenuId: null};
      }
      return {
        ...prev,
        reviewedAlerts: [...prev.reviewedAlerts, alertId],
        openSwipeAlertId: null,
        alertMenuId: null,
        toast: {
          seq,
          text: 'Alert reviewed',
          isStatus: false,
          undo: {reviewedAlerts: prev.reviewedAlerts, seenSpikes: prev.seenSpikes},
        },
      };
    });
    if (viaMenu) menuOpenerRef.current?.focus();
  };
  const undoFromToast = () => {
    const seq = nextToastSeq();
    setState(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      return {
        ...prev,
        reviewedAlerts: undo.reviewedAlerts,
        seenSpikes: undo.seenSpikes,
        toast: {seq, text: 'Restored', isStatus: false, undo: null},
      };
    });
  };

  // SHEET lifecycle — scroll lock + preventScroll focus + opener restore.
  const openSheet = (metricId: MetricId, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    setState(prev => ({
      ...prev,
      sheet: {metricId, detent: 'medium'},
      openSwipeAlertId: null,
      alertMenuId: null,
    }));
  };
  const closeSheet = () => {
    setState(prev => ({...prev, sheet: null}));
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheet != null) {
      // preventScroll: a plain .focus() scroll-reveals the animating sheet
      // inside the locked overflow-hidden column and beaches it mid-screen
      // (foundations amendment).
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheet]);
  useEffect(() => {
    if (state.alertMenuId != null) {
      alertMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
    }
  }, [state.alertMenuId]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.alertMenuId != null) {
        setState(prev => ({...prev, alertMenuId: null}));
        menuOpenerRef.current?.focus();
      } else if (state.sheet != null) {
        closeSheet();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.alertMenuId, state.sheet]);

  // TABS — per-tab scroll persists; overlays close (toast persists);
  // re-tapping the active tab scrolls to top (the one legal reset).
  const selectTab = (tab: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (tab === state.activeTab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    const fromTab = state.activeTab;
    const fromScroll = scroller?.scrollTop ?? 0;
    setState(prev => ({
      ...prev,
      activeTab: tab,
      screenByTab: {...prev.screenByTab, [tab]: 'root'},
      scrollByTab: {...prev.scrollByTab, [fromTab]: fromScroll},
      sheet: null,
      openSwipeAlertId: null,
      alertMenuId: null,
    }));
  };
  useEffect(() => {
    const scroller = findScroller(shellRef.current);
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.activeTab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTab]);
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const ids = TAB_META.map(tab => tab.id);
    const at = ids.indexOf(state.activeTab);
    const next = ids[(at + (event.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
    selectTab(next);
    document.getElementById(`glp-tab-${next}`)?.focus();
  };

  // Alert-row helpers.
  const jumpToAlertSpike = () => {
    selectTab('pulse');
    setPlayhead(19);
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // ---- per-tab main content ----------------------------------------------

  const pulseTab = (
    <>
      <PulseScrubCard
        playheadHour={state.playheadHour}
        narrow={narrow}
        dotTick={dotTick}
        onScrub={hour => setPlayhead(hour)}
      />
      <h2 style={styles.sectionHeader}>At this hour</h2>
      {state.refreshState === 'skeleton' ? (
        <DeltaStackSkeleton />
      ) : (
        <DeltaStack playheadHour={state.playheadHour} onOpenSheet={openSheet} />
      )}
      <h2 style={styles.sectionHeader}>Posts</h2>
      <div style={styles.listCard}>
        {POSTS.map((post, index) => {
          const isActive =
            state.playheadHour >= post.topForStart && state.playheadHour <= post.topForEnd;
          return (
            <div key={post.id}>
              {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
              <button
                type="button"
                className="glp-btn glp-focusable"
                style={{...styles.postRow, ...(isActive ? styles.postRowActive : null)}}
                aria-label={`${post.title}, ${post.viewsLabel} views${isActive ? ', top at the playhead hour' : ''} — jump playhead to ${fmtHourLong(POST_JUMP[post.id])}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setPlayhead(POST_JUMP[post.id])}>
                {isActive ? <span style={styles.highlightBar} aria-hidden /> : null}
                <PostThumb postId={post.id} />
                <span style={styles.postText}>
                  <span style={styles.postTitle}>{post.title}</span>
                  <span style={styles.postMeta}>{post.postedLabel}</span>
                </span>
                <span style={styles.postViews}>{post.viewsLabel}</span>
              </button>
            </div>
          );
        })}
      </div>
      {/* Terminal count caption — loadMoreRow is banned at 3 fixtures. */}
      <div style={styles.terminalCaption}>All 3 posts today</div>
      <h2 style={styles.sectionHeader}>Audience snapshot</h2>
      <div style={styles.listCard}>
        <button
          type="button"
          className="glp-btn glp-focusable"
          style={styles.row60}
          aria-label={`Followers now, ${fmtInt(FOLLOWERS_NOW)} — open Audience tab`}
          onClick={() => selectTab('audience')}>
          <span style={styles.row60Text}>
            <span style={styles.rowPrimary}>Followers now</span>
            <span style={styles.rowSecondary}>{fmtDelta(FOLLOWER_CUM[23])} today</span>
          </span>
          <span style={styles.rowValue}>{fmtInt(FOLLOWERS_NOW)}</span>
        </button>
      </div>
    </>
  );

  const postsTab = (
    <>
      <h2 style={styles.sectionHeader}>All posts — today</h2>
      <div style={styles.listCard}>
        {POSTS.map((post, index) => {
          const isActive =
            state.playheadHour >= post.topForStart && state.playheadHour <= post.topForEnd;
          return (
            <div key={post.id}>
              {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
              <button
                type="button"
                className="glp-btn glp-focusable"
                style={{...styles.postRow, ...(isActive ? styles.postRowActive : null)}}
                aria-label={`${post.title}, ${post.viewsLabel} views — jump playhead to ${fmtHourLong(POST_JUMP[post.id])}`}
                onClick={() => {
                  selectTab('pulse');
                  setPlayhead(POST_JUMP[post.id]);
                }}>
                {isActive ? <span style={styles.highlightBar} aria-hidden /> : null}
                <PostThumb postId={post.id} />
                <span style={styles.postText}>
                  <span style={styles.postTitle}>{post.title}</span>
                  <span style={styles.postMeta}>{post.postedLabel}</span>
                </span>
                <span style={styles.postViews}>{post.viewsLabel}</span>
              </button>
              <div style={styles.rowDividerDeep} />
              <div style={styles.row44}>
                <span style={{...styles.row44Label, color: 'var(--color-text-secondary)', fontSize: 13}}>
                  Engagement
                </span>
                <span style={{...styles.row44Value, fontSize: 13}}>
                  {fmtInt(post.likes)} likes · {post.comments} comments
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.terminalCaption}>All 3 posts today</div>
    </>
  );

  const audienceTab = (
    <>
      <h2 style={styles.sectionHeader}>Followers — 4-hour buckets</h2>
      <div style={styles.listCard}>
        <div style={styles.row60}>
          <span style={styles.row60Text}>
            <span style={styles.rowPrimary}>Start of day</span>
            <span style={styles.rowSecondary}>{fmtDelta(FOLLOWER_CUM[23])} across 24 h</span>
          </span>
          <span style={styles.rowValue}>{fmtInt(FOLLOWERS_START)}</span>
        </div>
        {AUDIENCE_BUCKETS.map(bucket => {
          const endHour = AUDIENCE_BUCKETS.indexOf(bucket) * 4 + 3;
          return (
            <div key={bucket.id}>
              <div style={styles.rowDivider} />
              <button
                type="button"
                className="glp-btn glp-focusable"
                style={styles.row44}
                aria-label={`${bucket.label}, ${fmtDelta(bucket.delta)} followers, ${fmtInt(bucket.cumEnd)} total — move playhead to ${fmtHourLong(endHour)}`}
                onClick={() => {
                  selectTab('pulse');
                  setPlayhead(endHour);
                }}>
                <span style={styles.row44Label}>{bucket.label}</span>
                <span style={{fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: BRAND_DEEP}}>
                  {fmtDelta(bucket.delta)}
                </span>
                <span style={{...styles.row44Value, fontSize: 13}}>{fmtInt(bucket.cumEnd)}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div style={styles.terminalCaption}>+2 +9 +30 +31 +103 +89 = +264</div>
    </>
  );

  const alertsTab = (
    <>
      <h2 style={styles.sectionHeader}>Alerts</h2>
      <div style={styles.listCard}>
        {ALERTS.map((alert, index) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            reviewed={isReviewed(alert.id)}
            isSwipeOpen={state.openSwipeAlertId === alert.id}
            isMenuOpen={state.alertMenuId === alert.id}
            isLast={index === ALERTS.length - 1}
            reducedMotion={reducedMotion}
            menuRef={alertMenuRef}
            onSwipeOpen={() =>
              setState(prev => ({...prev, openSwipeAlertId: alert.id, alertMenuId: null}))
            }
            onSwipeClose={() =>
              setState(prev =>
                prev.openSwipeAlertId === alert.id ? {...prev, openSwipeAlertId: null} : prev,
              )
            }
            onRowTap={jumpToAlertSpike}
            onToggleMenu={opener => {
              menuOpenerRef.current = opener;
              setState(prev => ({
                ...prev,
                alertMenuId: prev.alertMenuId === alert.id ? null : alert.id,
                openSwipeAlertId: null,
              }));
            }}
            onMarkReviewed={() => markReviewed(alert.id, state.alertMenuId === alert.id)}
            onJumpToSpike={() => {
              setState(prev => ({...prev, alertMenuId: null}));
              jumpToAlertSpike();
            }}
          />
        ))}
      </div>
      <div style={styles.terminalCaption}>
        {badgeCount === 0 ? 'All alerts reviewed' : `${badgeCount} unreviewed`}
      </div>
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{GLOWLINE_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <GlowlineMark />
          </div>
          <div style={styles.navCenter}>
            <span className="glp-fade" style={{...styles.navTitle, opacity: collapsed ? 1 : 0}} aria-hidden={!collapsed}>
              Pulse
            </span>
            <span style={styles.navSubtitle}>{subtitle}</span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="glp-btn glp-focusable"
              style={styles.iconBtn}
              aria-label={state.refreshState === 'skeleton' ? 'Finish refresh' : 'Refresh metrics'}
              onClick={pressRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <div ref={largeTitleRef} style={styles.largeTitle}>
          <h1 style={styles.largeTitleText}>Pulse</h1>
        </div>

        <main style={styles.main} onPointerDownCapture={resolveRefreshOnTap}>
          {state.activeTab === 'pulse'
            ? pulseTab
            : state.activeTab === 'posts'
              ? postsTab
              : state.activeTab === 'audience'
                ? audienceTab
                : alertsTab}
        </main>

        {/* THE single polite live region — sticky-in-flow dock 76px above
            the viewport bottom; absolute only while the shell is locked. */}
        <div
          style={{
            ...styles.toastAnchor,
            ...(state.sheet != null ? styles.toastAnchorLocked : null),
          }}
          aria-live="polite">
          {state.toast != null ? (
            <div
              key={state.toast.seq}
              className="glp-fade"
              style={styles.toast}
              role={state.toast.isStatus ? 'status' : undefined}>
              <span style={styles.toastMsg}>{state.toast.text}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="glp-btn glp-focusable" style={styles.undoBtn} onClick={undoFromToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Glowline sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = state.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`glp-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="glp-btn glp-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'alerts' && badgeCount > 0 ? (
                    <span style={styles.badge} aria-label={`${badgeCount} unreviewed alerts`}>
                      {badgeCount}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {state.sheet != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <MetricSheet
              metricId={state.sheet.metricId}
              detent={state.sheet.detent}
              playheadHour={state.playheadHour}
              sheetRef={sheetRef}
              reducedMotion={reducedMotion}
              onDetentToggle={() =>
                setState(prev =>
                  prev.sheet == null
                    ? prev
                    : {
                        ...prev,
                        sheet: {
                          ...prev.sheet,
                          detent: prev.sheet.detent === 'medium' ? 'large' : 'medium',
                        },
                      },
                )
              }
              onClose={closeSheet}
              onPickHour={hour => setPlayhead(hour)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}


