var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Cadenza creator week of Mon Jul
 *   6 – Sun Jul 12, 2026 (the suite's frozen "today" is Sat Jul 4, which
 *   belongs to the PRIOR week — so the 'Today' chip scrolls to Monday, the
 *   week's first day, and no strip letter gets today styling; deliberate,
 *   see TODAY note at the DAYS fixture). 15 scheduled posts (per-day
 *   3+2+0+4+3+1+2 = 15 = navBar '· 15 posts' = Queue badge = strip dots),
 *   per-platform Lens 5 + Pulse 4 + Echo 4 + Boards 2 = 15 (Settings rows
 *   derive the same counts live), 7 best-time heat windows (exactly 5
 *   posts sit inside their day's window), 14 idea rows (6 + 8 = 14). No
 *   Date.now(), no Math.random(), no network media — thumbnails are
 *   id-derived gradient blocks.
 * @output Cadenza — Week Planner: a 390px MOBILE weekly publish planner.
 *   NavBar (7-tick brand mark · 'Jul 6–12 · 15 posts' · Today chip) over a
 *   pinned 64px WeekDensityStrip — 7 merged column buttons stacking up to
 *   4 platform-colored 6px dots over best-time heat shading — then 7 day
 *   sections of 72px SlotCard media rows with a ConflictRibbon replacing
 *   the divider between Thu's 9:00/9:20 pair, a 4-tab tabBar (Queue badge
 *   15), and a sticky toast dock. Signature move: long-press-dragging a
 *   SlotCard between day sections lifts a dragLayer clone, leaves a dashed
 *   ReslotGhost at the origin, renders a badge-carrying landing outline
 *   (best-time halo when the landing time falls in the hover day's heat
 *   window), and live-rebalances the pinned strip's projected dots
 *   mid-gesture; the drop commits ONE store update that moves strip dots,
 *   rewrites both day headers' counts, re-sorts the Queue tab, and
 *   unmounts the ribbon if a conflict member moved — with a full
 *   non-gesture path (ellipsis → action sheet → two-detent MoveSheet)
 *   through the identical update call.
 * @position Page template; emitted by \`astryx template mobile-post-week-strip\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheets, action sheet, dragLayer) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close. The toast dock is STICKY-IN-FLOW (bottom 76, above
 *   the 64px tabBar + 12) per the foundations amendment — shell-absolute
 *   would pin to the document bottom on this tall scrolling surface.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 76 for 48px-thumb media rows);
 *   no desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Cadenza violet — the spec hex #7C5CFF is quarantined to
 *   this pair's derivation comment); sanctioned non-brand literals are the
 *   four platform dot/pill pairs, the conflict-ribbon pair, the dashed
 *   ghost-outline pair, and the switch OFF-track pair — every one with
 *   contrast math at the declaration (≥3:1 interactive-boundary rule from
 *   the foundations amendment).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — chosen
 *   variant, no scroll-under wiring); WeekDensityStrip 64px sticky top:52
 *   z19 (same blur surface, 7 flex:1 merged column buttons, 4px gaps, 40px
 *   dot zone, 6px dots at 2px gap, 11/500 day letters); rows 44px utility
 *   (settings/empty-day) / 60px two-line (queue, ideas) / 72px media
 *   (48px thumb radius 12, 12px gap, divider inset 76 = 16 pad + 48 thumb
 *   + 12 gap); sectionHeader 13/600 uppercase 0.06em at 32px inset, 20px
 *   top / 8px bottom; ConflictRibbon 32px replacing exactly one divider;
 *   tabBar 64px sticky bottom z20 (24px icon over 11/500 label, 4px gap,
 *   badge pill min-width 16 at top −4 right −8); toastDock sticky bottom
 *   76 z30; sheet detents 55% medium / calc(100% − 56px) large, 24px
 *   grabber zone with 36×5 pill, 52px sheet header, sticky 48px Move
 *   button; actionSheet insetInline 16 bottom 16, 56px verb rows, Cancel
 *   its own card. TYPE (Figtree via --font-family-body): 17/600 nav+sheet
 *   titles · 16/500 row primaries · 16/400 body · 13/400 secondary ·
 *   11/500 overlines, tab labels, strip letters · 10/600 badge + platform
 *   pills; nothing under 11px except the two sanctioned 10px pill styles
 *   per the badge contract; tabular-nums on every mutating numeral.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row /
 *   full-column (strip columns ≈38px wide at 320 but 64px tall single
 *   merged buttons; ribbon is one full-card-width merged button); every
 *   gesture has a visible button path (ellipsis → Move to… sheet mirrors
 *   the drag; grabber click + X + Escape mirror sheet drag).
 *
 * Responsive contract:
 * - Fluid 320–430px: strip columns flex:1 (≈37.7px at 320 — legal, merged
 *   64px-tall buttons); SlotCard titles ellipsize single-line; meta lines
 *   ellipsize with badge pills flex-shrink:0; ribbon text truncates before
 *   its 'Space out' button shrinks (min-width 44); MoveSheet day chips
 *   wrap below ~360px; navBar '· 15 posts' suffix hides below 350px
 *   CONTAINER width (title alone remains). overflowX:'clip' is backstop.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline); sticky chrome and absolute overlays stay inside the column
 *   because they anchor to shell. No adaptive relayout.
 * - All motion is transform/opacity; prefers-reduced-motion kills the
 *   sheet slide (fade), drag-clone scale, and best-time halo glow — the
 *   dashed outline alone still encodes the target.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CalendarRangeIcon,
  LightbulbIcon,
  ListOrderedIcon,
  MoreHorizontalIcon,
  Settings2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. The spec brand #7C5CFF fails 4.5:1 on white (≈3.9:1), so
// the quarantined pair shifts each side toward its scheme's readable end —
// that derivation is the ONLY place the raw spec hex appears.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Cadenza violet, derived from #7C5CFF).
// #6C4BF4 on #FFFFFF ≈ 5.3:1 (passes 4.5:1 as text); #A78BFF on the dark
// card (~#1C1C1E) ≈ 6.3:1.
const BRAND_ACCENT = 'light-dark(#6C4BF4, #A78BFF)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #6C4BF4 ≈ 5.3:1. Dark:
// white on #A78BFF fails (~1.9:1), so the dark side flips to near-black
// violet — #221643 on #A78BFF ≈ 6.2:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #221643)';
// Best-time heat band — PASSIVE decorative shading only (the dots carry
// the load data), so the passive-separator exemption applies; it is never
// an interactive boundary.
const HEAT_FILL = 'light-dark(rgba(108, 75, 244, 0.14), rgba(167, 139, 255, 0.20))';
// Dashed ReslotGhost / landing outline — an INTERACTIVE boundary, so the
// amendment's ≥3:1-vs-actual-surface rule applies: #8B7BD8 on the white
// card ≈ 3.6:1; #7E6BD0 on the dark card (~#1C1C1E) ≈ 4.0:1.
const GHOST_DASH = 'light-dark(#8B7BD8, #7E6BD0)';
// Best-time halo around the landing outline — decorative glow on top of
// the already-≥3:1 dashed outline; removed entirely under reduced motion.
const HALO = 'light-dark(rgba(108, 75, 244, 0.25), rgba(167, 139, 255, 0.30))';
// Platform dot/pill pairs — dots render on the strip's blur surface (≈
// body background) and pills on cards; all four pass 3:1 on BOTH:
// Lens   #C2337A on #FFF ≈ 5.2:1 · #F27AB8 on #1C1C1E ≈ 6.7:1
// Pulse  #1D6FD1 on #FFF ≈ 4.9:1 · #6FB1F5 on #1C1C1E ≈ 7.5:1
// Echo   #0E7A6C on #FFF ≈ 5.2:1 · #4FD1BE on #1C1C1E ≈ 9.1:1
// Boards #9A5B00 on #FFF ≈ 5.4:1 · #F0A73C on #1C1C1E ≈ 8.4:1
const LENS = 'light-dark(#C2337A, #F27AB8)';
const PULSE = 'light-dark(#1D6FD1, #6FB1F5)';
const ECHO = 'light-dark(#0E7A6C, #4FD1BE)';
const BOARDS = 'light-dark(#9A5B00, #F0A73C)';
// ConflictRibbon fill + text: #B3261E on #FDECEC ≈ 5.7:1; #F2B8B5 on
// #3A1F22 ≈ 8.8:1 — both clear 4.5:1 for the 11px label.
const RIBBON_BG = 'light-dark(#FDECEC, #3A1F22)';
const RIBBON_TEXT = 'light-dark(#B3261E, #F2B8B5)';
// Switch OFF track — a rest-state interactive fill, so ≥3:1 vs its actual
// surface (the white/dark card) per the amendment: rgba(21,17,12,0.48)
// over #FFF ≈ #8F8D8C ≈ 3.2:1; rgba(255,255,255,0.42) over #1C1C1E ≈
// #7B7B7D ≈ 4.0:1. (The foundations' lighter wash fails ≈1.2:1 — that is
// exactly the batch-2 finding class; corrected here with the math.)
const SWITCH_OFF_TRACK = 'light-dark(rgba(21, 17, 12, 0.48), rgba(255, 255, 255, 0.42))';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Brand-tinted washes for chips / marks.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet slide-in, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse to instant under reduced motion.
// ---------------------------------------------------------------------------

const CADENZA_CSS = \`
.cdz-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cdz-btn:disabled { cursor: default; }
.cdz-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.cdz-anim { transition: transform 240ms ease, opacity 240ms ease; }
.cdz-fade { transition: opacity 240ms ease; }
@keyframes cdz-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.cdz-sheet-in { animation: cdz-sheet-in 240ms ease; }
.cdz-vh {
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
  .cdz-anim, .cdz-fade { transition: none; }
  .cdz-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, listCard, rowDivider, sectionHeader, toastDock.
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
  // Scroll lock while a sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44px slots
  // optically align content to the 16px gutter. Hairline ALWAYS ON.
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  navTitleWrap: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navTitle: {fontSize: 17, fontWeight: 600},
  navTitleSuffix: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 'Today' chip — 32px pill inside a 44px-tall hit.
  todayChipHit: {height: 44, display: 'flex', alignItems: 'center', paddingInline: 4},
  todayChip: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // WEEK DENSITY STRIP — 64px sticky top:52 z19, same blur surface as the
  // navBar, 7 flex:1 merged column buttons with 4px gaps.
  strip: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 64,
    display: 'flex',
    gap: 4,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  // One merged 64px-tall column button — legal at 320px (≈37.7px wide)
  // because height ≥44 and the whole column is a single target.
  stripCol: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 8,
  },
  // 2px BRAND inset ring on the drag hover target column.
  stripColHover: {boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`},
  stripLetter: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    zIndex: 1,
  },
  // 40px dot zone below the letter; heat band anchors to its bottom.
  stripDotZone: {
    position: 'relative',
    width: '100%',
    height: 40,
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 3,
  },
  stripHeatBand: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    background: HEAT_FILL,
    borderRadius: '4px 4px 0 0',
    pointerEvents: 'none',
  },
  stripDot: {width: 6, height: 6, borderRadius: '50%', flexShrink: 0, zIndex: 1},
  // 6px '+' overflow glyph — stress-only (fixture caps at 4 dots; reach it
  // by duplicating a Thu post).
  stripPlusDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    zIndex: 1,
    display: 'grid',
    placeItems: 'center',
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1,
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // sectionHeader — 13/600 uppercase 0.06em at 32px inset (16 gutter + 16
  // card pad), 20px top / 8px bottom; trailing count 13/400 tabular.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeaderText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sectionHeaderCount: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
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
  // Media-row divider inset 76 = 16 pad + 48 thumb + 12 gap.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 76},
  // SLOT CARD — 72px media row; ellipsis is a SIBLING 44×44 button.
  slotWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  slotRow: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    touchAction: 'pan-y',
  },
  // ReslotGhost — origin row at 40% opacity with the dashed ≥3:1 outline.
  slotGhost: {opacity: 0.4, outline: \`1.5px dashed \${GHOST_DASH}\`, outlineOffset: -4, borderRadius: 12},
  thumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
  },
  slotText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  slotTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slotMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  bestDot: {width: 6, height: 6, borderRadius: '50%', background: BRAND_ACCENT, flexShrink: 0},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Landing outline — 56px dashed row carrying the dragged post's pills;
  // halo added when the landing time falls inside the hover day's window.
  landingRow: {
    height: 56,
    margin: 8,
    borderRadius: 12,
    outline: \`1.5px dashed \${GHOST_DASH}\`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
  },
  landingHalo: {boxShadow: \`0 0 0 4px \${HALO}\`},
  // 16px platform/time pills, 10/600 (sanctioned badge size).
  pill: {
    height: 16,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
    color: BRAND_FILL_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Empty-day inline row — 44px utility row inside the listCard.
  emptyRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 8,
  },
  emptyRowText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  addBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // CONFLICT RIBBON — 32px band replacing exactly one rowDivider; the
  // whole full-card-width band is ONE merged <button> (merge clause: a
  // single full-row target), with a 2px left rule in the ribbon text
  // color and the trailing 'Space out' verb (min-width 44).
  conflictRibbon: {
    width: '100%',
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 14,
    paddingInlineEnd: 16,
    background: RIBBON_BG,
    borderInlineStart: \`2px solid \${RIBBON_TEXT}\`,
  },
  ribbonLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: 500,
    color: RIBBON_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'start',
  },
  ribbonAction: {
    minWidth: 44,
    fontSize: 13,
    fontWeight: 600,
    color: RIBBON_TEXT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // QUEUE — 32px in-card day subheaders + 60px two-line rows.
  queueGroupHeader: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-muted)',
  },
  twoLineRow: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  twoLineText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  // IDEAS.
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SETTINGS — 44px utility rows; whole row is the switch target.
  settingsRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  settingsLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'start',
  },
  settingsMeta: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  platformDot: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
  },
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
  // TAB BAR — exactly 64px, 4 tabs flex:1, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
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
  // TOAST DOCK — STICKY-IN-FLOW (foundations amendment): height 0 anchor
  // pinned 76px above the viewport bottom (64px tabBar + 12), z30. The
  // spec said absolute; on this tall scrolling surface absolute would pin
  // to the DOCUMENT bottom — deviation noted in the final summary.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
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
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // MOVE SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  moveBtn: {
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
  sheetSectionLabel: {
    margin: '12px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Day radiogroup — 36px chips, 8px gap, wraps below ~360px.
  dayChipsRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  dayChip: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  dayChipOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // Time utility row + inline panel with 96×32 steppers.
  timeRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  timeRowLabel: {fontSize: 16, fontWeight: 400},
  timePill: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
  },
  timePanel: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: '4px 12px',
    marginTop: 4,
  },
  stepRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  stepLabel: {flex: 1, minWidth: 0, fontSize: 16, fontWeight: 400},
  stepTrack: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  stepHairline: {width: 1, background: 'var(--color-border)'},
  stepValue: {
    minWidth: 64,
    textAlign: 'end',
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // ACTION SHEET — insetInline 16 bottom 16 z41 (sheet layer), two cards
  // 8px apart, 56px verb rows, destructive last, Cancel its own card.
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
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
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
  // DRAG LAYER — absolute z35 clone while dragging (transform-only).
  dragLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 35,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  dragClone: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 72,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 8px 32px var(--color-shadow)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen week, dual fields everywhere ({timeMin, timeLabel}).
// CROSS-CHECK LEDGER (verified by hand): per-day 3+2+0+4+3+1+2 = 15 posts =
// navBar '· 15 posts' = Queue badge = sum of strip dots. Per-platform Lens
// 5 + Pulse 4 + Echo 4 + Boards 2 = 15 (Settings derives the same counts
// from the live rows). Exactly 5 posts sit inside their day's best-time
// window: Mon 6:15 PM (1095 ∈ 1020–1200), Thu 6:30 PM (1110 ∈ 1020–1200),
// Fri 12:30 PM (750 ∈ 660–780), Sat 10:00 AM (600 ∈ 540–660), Sun 8:00 PM
// (1200 ∈ 1140–1260). Ideas: 6 rendered + 8 on load-more = 14. Thu's
// 9:00/9:20 pair (Δ20 ≤ 30 min) is the live ConflictRibbon.
// ---------------------------------------------------------------------------

type PlatformId = 'lens' | 'pulse' | 'echo' | 'boards';

const PLATFORMS: Record<PlatformId, {name: string; color: string}> = {
  lens: {name: 'Lens', color: LENS},
  pulse: {name: 'Pulse', color: PULSE},
  echo: {name: 'Echo', color: ECHO},
  boards: {name: 'Boards', color: BOARDS},
};

const PLATFORM_ORDER: PlatformId[] = ['lens', 'pulse', 'echo', 'boards'];

interface DayMeta {
  idx: number;
  letter: string;
  chip: string; // MoveSheet radiogroup chip
  header: string; // 'MON JUL 6'
  long: string; // 'Monday'
  toastName: string; // 'Mon' for toast strings
  heatScore: number; // 0–100 → band height % of the 40px dot zone
  windowStart: number; // minutes since midnight, inclusive
  windowEnd: number; // inclusive
  windowLabel: string; // 'best time 6–9 PM'
  windowAria: string; // 'best time 6 to 9 PM'
}

// TODAY NOTE: the suite's frozen "today" is Sat Jul 4, 2026 — the week
// BEFORE this planner's Mon Jul 6 – Sun Jul 12 range. Deliberate: the
// 'Today' chip therefore scrolls to Monday (the week's first day) and NO
// strip letter carries today styling; heat and load stay the only two
// channels in the strip.
const DAYS: DayMeta[] = [
  {idx: 0, letter: 'M', chip: 'Mon', header: 'MON JUL 6', long: 'Monday', toastName: 'Mon', heatScore: 55, windowStart: 1020, windowEnd: 1200, windowLabel: '5–8 PM', windowAria: '5 to 8 PM'},
  {idx: 1, letter: 'T', chip: 'Tue', header: 'TUE JUL 7', long: 'Tuesday', toastName: 'Tue', heatScore: 40, windowStart: 720, windowEnd: 840, windowLabel: '12–2 PM', windowAria: '12 to 2 PM'},
  // Wed: zero posts + the WEEK'S TALLEST band (80) — heat and load are
  // independent channels (stress fixture 2); canonical drag target.
  {idx: 2, letter: 'W', chip: 'Wed', header: 'WED JUL 8', long: 'Wednesday', toastName: 'Wed', heatScore: 80, windowStart: 1080, windowEnd: 1260, windowLabel: '6–9 PM', windowAria: '6 to 9 PM'},
  {idx: 3, letter: 'T', chip: 'Thu', header: 'THU JUL 9', long: 'Thursday', toastName: 'Thu', heatScore: 70, windowStart: 1020, windowEnd: 1200, windowLabel: '5–8 PM', windowAria: '5 to 8 PM'},
  {idx: 4, letter: 'F', chip: 'Fri', header: 'FRI JUL 10', long: 'Friday', toastName: 'Fri', heatScore: 60, windowStart: 660, windowEnd: 780, windowLabel: '11 AM–1 PM', windowAria: '11 AM to 1 PM'},
  // Sat: single-post day over the week's SHORTEST band (35) — ribbon logic
  // must never fire on singletons (stress fixture 4).
  {idx: 5, letter: 'S', chip: 'Sat', header: 'SAT JUL 11', long: 'Saturday', toastName: 'Sat', heatScore: 35, windowStart: 540, windowEnd: 660, windowLabel: '9–11 AM', windowAria: '9 to 11 AM'},
  {idx: 6, letter: 'S', chip: 'Sun', header: 'SUN JUL 12', long: 'Sunday', toastName: 'Sun', heatScore: 45, windowStart: 1140, windowEnd: 1260, windowLabel: '7–9 PM', windowAria: '7 to 9 PM'},
];

interface Post {
  id: string;
  title: string;
  dayIdx: number;
  timeMin: number; // minutes since midnight — single source for ordering
  timeLabel: string; // dual field, always fmtTime(timeMin)
  platform: PlatformId;
  thumbSeed: number; // drives the deterministic gradient thumbnail
}

const POSTS: Post[] = [
  // Mon ×3
  {id: 'post_mon_a', title: 'Warm-up loop breakdown', dayIdx: 0, timeMin: 450, timeLabel: '7:30 AM', platform: 'pulse', thumbSeed: 3},
  {id: 'post_mon_b', title: 'Studio tour pt 1', dayIdx: 0, timeMin: 720, timeLabel: '12:00 PM', platform: 'lens', thumbSeed: 7},
  {id: 'post_mon_c', title: 'Chord voicing Q&A', dayIdx: 0, timeMin: 1095, timeLabel: '6:15 PM', platform: 'echo', thumbSeed: 11},
  // Tue ×2
  {id: 'post_tue_a', title: 'Gear shelf pinboard', dayIdx: 1, timeMin: 540, timeLabel: '9:00 AM', platform: 'boards', thumbSeed: 2},
  {id: 'post_tue_b', title: 'Practice-room reel', dayIdx: 1, timeMin: 1065, timeLabel: '5:45 PM', platform: 'lens', thumbSeed: 9},
  // Wed ×0 — empty-day inline row.
  // Thu ×4 — densest day, dots at the strip's 4-dot cap; 9:00/9:20 is the
  // conflict pair (Δ20 min ≤ 30).
  {id: 'post_thu_a', title: 'Metronome myths', dayIdx: 3, timeMin: 540, timeLabel: '9:00 AM', platform: 'pulse', thumbSeed: 5},
  {id: 'post_thu_b', title: 'Duet stitch: Aria M.', dayIdx: 3, timeMin: 560, timeLabel: '9:20 AM', platform: 'lens', thumbSeed: 1},
  {id: 'post_thu_c', title: 'Loop pack teaser', dayIdx: 3, timeMin: 780, timeLabel: '1:00 PM', platform: 'echo', thumbSeed: 8},
  {id: 'post_thu_d', title: 'Live riff — best-time slot', dayIdx: 3, timeMin: 1110, timeLabel: '6:30 PM', platform: 'lens', thumbSeed: 4},
  // Fri ×3
  {id: 'post_fri_a', title: 'Friday finger drills', dayIdx: 4, timeMin: 495, timeLabel: '8:15 AM', platform: 'echo', thumbSeed: 10},
  {id: 'post_fri_b', title: 'Mix before/after', dayIdx: 4, timeMin: 750, timeLabel: '12:30 PM', platform: 'pulse', thumbSeed: 6},
  {id: 'post_fri_c', title: 'Setlist mood board', dayIdx: 4, timeMin: 1140, timeLabel: '7:00 PM', platform: 'boards', thumbSeed: 0},
  // Sat ×1 — the delete-with-Undo four-way-consistency fixture (stress 6).
  {id: 'post_sat_a', title: 'Saturday session vlog', dayIdx: 5, timeMin: 600, timeLabel: '10:00 AM', platform: 'pulse', thumbSeed: 12},
  // Sun ×2
  {id: 'post_sun_a', title: 'Week recap carousel', dayIdx: 6, timeMin: 690, timeLabel: '11:30 AM', platform: 'lens', thumbSeed: 13},
  {id: 'post_sun_b', title: 'Sunday unwind set', dayIdx: 6, timeMin: 1200, timeLabel: '8:00 PM', platform: 'echo', thumbSeed: 14},
];

// 58-char alt title — the 320px single-line ellipsis stress (fixture 3);
// rendered as idea_01 so the narrowest stage exercises truncation.
const TITLE_STRESS_58 = 'Duet stitch: Aria M. — layered harmony pass, room mics on';

interface Idea {
  id: string;
  title: string;
  tag: string;
}

// 14 ideas: 6 rendered + 'Show 8 more' → terminal 'All 14 ideas' (6+8=14).
const IDEAS: Idea[] = [
  {id: 'idea_01', title: TITLE_STRESS_58, tag: 'Duet · 45s'},
  {id: 'idea_02', title: 'Pedalboard signal-chain walkthrough', tag: 'Longform · 6 min'},
  {id: 'idea_03', title: 'One chord, five genres', tag: 'Reel · 30s'},
  {id: 'idea_04', title: 'Room-mic vs DI shootout', tag: 'Comparison · 90s'},
  {id: 'idea_05', title: 'Practice journal, week 27', tag: 'Carousel · 8 slides'},
  {id: 'idea_06', title: 'Fan riff challenge picks', tag: 'Compilation · 2 min'},
  {id: 'idea_07', title: 'Tuning by ear, no pedal', tag: 'Tutorial · 60s'},
  {id: 'idea_08', title: 'Setlist teardown: Rooftop set', tag: 'Longform · 9 min'},
  {id: 'idea_09', title: 'Broken-string save, slow-mo', tag: 'Clip · 15s'},
  {id: 'idea_10', title: 'Chord substitutions cheat sheet', tag: 'Carousel · 6 slides'},
  {id: 'idea_11', title: 'Warm-up routine with a metronome app', tag: 'Reel · 45s'},
  {id: 'idea_12', title: 'Studio cable management, honestly', tag: 'Clip · 30s'},
  {id: 'idea_13', title: 'Q&A: switching to heavier gauge', tag: 'Live · 20 min'},
  {id: 'idea_14', title: 'Loop pack v2 preview', tag: 'Teaser · 20s'},
];

// Deterministic muted gradient pairs for thumbnails — indexed thumbSeed %
// 5, angle from the seed; no external images anywhere.
const THUMB_GRADS: string[] = [
  \`linear-gradient(135deg, light-dark(#D9CFF7, #3A2E63), light-dark(#B7A6EE, #574593))\`,
  \`linear-gradient(160deg, light-dark(#F2D3E2, #55283F), light-dark(#E0A9C7, #7C3F60))\`,
  \`linear-gradient(120deg, light-dark(#CFE3F5, #23405C), light-dark(#A9C9EA, #38618A))\`,
  \`linear-gradient(145deg, light-dark(#CFEDE7, #1F4A44), light-dark(#A5D8CE, #2F6B62))\`,
  \`linear-gradient(150deg, light-dark(#F4E3C8, #4E3A1B), light-dark(#E5C795, #74562A))\`,
];

function thumbStyle(seed: number): CSSProperties {
  return {...styles.thumb, background: THUMB_GRADS[seed % THUMB_GRADS.length]};
}

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVED SELECTORS — pure, deterministic; aggregates are
// NEVER stored, always derived from \`posts\` in render.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '6:30 PM'. Wraps within one day. */
function fmtTime(min: number): string {
  const clamped = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(clamped / 60);
  const m = clamped % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

function postCount(n: number): string {
  return n === 1 ? '1 post' : \`\${n} posts\`;
}

/** Posts of one day, sorted by time (ties by id for determinism). */
function postsForDay(posts: Post[], dayIdx: number): Post[] {
  return posts
    .filter(post => post.dayIdx === dayIdx)
    .sort((a, b) => a.timeMin - b.timeMin || a.id.localeCompare(b.id));
}

/** Per-day counts 0..6 — the strip dots, headers, and aria all read this. */
function perDayCounts(posts: Post[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const post of posts) counts[post.dayIdx] += 1;
  return counts;
}

/** True when a post sits inside its own day's best-time window. */
function inBestTime(post: Post): boolean {
  const day = DAYS[post.dayIdx];
  return post.timeMin >= day.windowStart && post.timeMin <= day.windowEnd;
}

/**
 * Conflict pairs: ADJACENT same-day posts (sorted by time) ≤30 min apart.
 * Fixture: exactly one — Thu 9:00/9:20 (Δ20). Sat's singleton can never
 * pair (stress fixture 4). Returned as [earlierId, laterId, gapMin].
 */
function conflictPairs(posts: Post[]): Array<{earlier: Post; later: Post; gapMin: number}> {
  const pairs: Array<{earlier: Post; later: Post; gapMin: number}> = [];
  for (const day of DAYS) {
    const dayPosts = postsForDay(posts, day.idx);
    for (let i = 0; i < dayPosts.length - 1; i++) {
      const gapMin = dayPosts[i + 1].timeMin - dayPosts[i].timeMin;
      if (gapMin <= 30) pairs.push({earlier: dayPosts[i], later: dayPosts[i + 1], gapMin});
    }
  }
  return pairs;
}

/** Per-platform counts — Settings' trailing meta derives these live. */
function perPlatformCounts(posts: Post[]): Record<PlatformId, number> {
  const counts: Record<PlatformId, number> = {lens: 0, pulse: 0, echo: 0, boards: 0};
  for (const post of posts) counts[post.platform] += 1;
  return counts;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer store in the root component. \`posts\` is the
// single source of truth; EVERY aggregate on screen (strip dots, day
// counts, Queue badge, navBar suffix, platform rows, ribbon) derives from
// it in render. Two actions: a shallow 'patch' and the post-mutation
// 'update' (the update(id, patch) helper) — the drag drop, the MoveSheet
// Move button, 'Space out', delete, duplicate, and Undo ALL route through
// the same reducer.
// ---------------------------------------------------------------------------

type TabId = 'week' | 'queue' | 'ideas' | 'settings';

const TAB_ORDER: TabId[] = ['week', 'queue', 'ideas', 'settings'];

interface DragState {
  postId: string;
  originDay: number;
  hoverDay: number | null;
}

type UndoSnapshot =
  | {kind: 'move'; postId: string; dayIdx: number; timeMin: number}
  | {kind: 'remove'; post: Post; index: number}
  | {kind: 'add'; postId: string};

interface ToastState {
  seq: number;
  msg: string;
  undo: UndoSnapshot | null;
}

interface CadenzaState {
  posts: Post[];
  activeTab: TabId;
  // Push-stack slot per the per-tab persistence contract — this surface is
  // root-only on all four tabs, so every entry stays 'root'.
  screenByTab: Record<TabId, 'root'>;
  scrollByTab: Record<TabId, number>;
  drag: DragState | null;
  openSheet: null | 'move' | 'actions';
  sheetDetent: 'medium' | 'large';
  sheetPostId: string | null;
  moveDraft: {dayIdx: number; timeMin: number};
  timePanelOpen: boolean;
  toast: ToastState | null;
  ideasShown: 6 | 14;
  settings: {bestTimeHints: boolean; conflictAlerts: boolean; weeklyDigest: boolean};
}

const INITIAL_STATE: CadenzaState = {
  posts: POSTS,
  activeTab: 'week',
  screenByTab: {week: 'root', queue: 'root', ideas: 'root', settings: 'root'},
  scrollByTab: {week: 0, queue: 0, ideas: 0, settings: 0},
  drag: null,
  openSheet: null,
  sheetDetent: 'medium',
  sheetPostId: null,
  moveDraft: {dayIdx: 0, timeMin: 540},
  timePanelOpen: false,
  toast: null,
  ideasShown: 6,
  settings: {bestTimeHints: true, conflictAlerts: true, weeklyDigest: false},
};

type CadenzaAction =
  | {type: 'patch'; patch: Partial<CadenzaState>}
  | {type: 'updatePost'; id: string; patch: Partial<Pick<Post, 'dayIdx' | 'timeMin'>>}
  | {type: 'insertPost'; post: Post; index: number}
  | {type: 'removePost'; id: string};

function cadenzaReducer(state: CadenzaState, action: CadenzaAction): CadenzaState {
  switch (action.type) {
    case 'patch':
      return {...state, ...action.patch};
    case 'updatePost':
      // THE one mutation path — drag drop and MoveSheet both land here.
      // timeLabel is recomputed so the dual fields can never diverge.
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.id
            ? {
                ...post,
                ...action.patch,
                timeLabel: fmtTime(action.patch.timeMin ?? post.timeMin),
              }
            : post,
        ),
      };
    case 'insertPost': {
      const posts = state.posts.slice();
      posts.splice(Math.min(action.index, posts.length), 0, action.post);
      return {...state, posts};
    }
    case 'removePost':
      return {...state, posts: state.posts.filter(post => post.id !== action.id)};
    default:
      return state;
  }
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the shell
 * wrapper can tell the 390px mobile stage from the desktop stage.
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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — sheets trap focus while open; Escape closes the topmost
// overlay only; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

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

/** The demo's page scroller (.preview-wrap) — per-tab scroll restore. */
function getScroller(shell: HTMLElement | null): HTMLElement | null {
  return (shell?.closest('.preview-wrap') as HTMLElement | null) ?? (document.scrollingElement as HTMLElement | null);
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px Cadenza glyph in the 44×44 nav slot: seven ascending
// 2px ticks, the 7th replaced by a play triangle; stroke follows text.
// ---------------------------------------------------------------------------

function CadenzaMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line
            key={i}
            x1={2.5 + i * 3}
            y1={20}
            x2={2.5 + i * 3}
            y2={16 - i * 2}
            stroke="var(--color-text-primary)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <path d="M20 6.5 L20 20 L23.5 13.25 Z" fill="var(--color-text-primary)" transform="translate(-2.5 -1)" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// WEEK DENSITY STRIP — 7 merged column buttons. Dots stack bottom-up in
// slot-time order (column-reverse); heat band height = heatScore% of the
// 40px dot zone. During a drag the PROJECTED counts render (origin −1,
// hover +1) — derived only, committed on drop.
// ---------------------------------------------------------------------------

interface WeekDensityStripProps {
  posts: Post[];
  drag: DragState | null;
  showHeat: boolean;
  conflictDays: Set<number>;
  onColumnTap: (dayIdx: number) => void;
}

function WeekDensityStrip({posts, drag, showHeat, conflictDays, onColumnTap}: WeekDensityStripProps) {
  const counts = perDayCounts(posts);
  const projected = counts.slice();
  if (drag != null && drag.hoverDay != null) {
    projected[drag.originDay] -= 1;
    projected[drag.hoverDay] += 1;
  }
  return (
    <div style={styles.strip} role="group" aria-label="Week density, Monday July 6 to Sunday July 12">
      {DAYS.map(day => {
        const count = projected[day.idx];
        // Dots render in slot-time order bottom-up; during a hover
        // projection the moved post is approximated by the dragged post's
        // platform appended at the top of the hover stack.
        const dayPosts = postsForDay(posts, day.idx);
        let dotPlatforms = dayPosts.map(post => post.platform);
        if (drag != null && drag.hoverDay != null) {
          const dragged = posts.find(post => post.id === drag.postId);
          if (drag.originDay === day.idx) {
            dotPlatforms = dotPlatforms.filter((_, i) => dayPosts[i].id !== drag.postId);
          }
          if (drag.hoverDay === day.idx && dragged != null && drag.originDay !== day.idx) {
            dotPlatforms = [...dotPlatforms, dragged.platform];
          }
        }
        const overflow = dotPlatforms.length > 4; // stress-only: fixture caps at 4
        const visible = overflow ? dotPlatforms.slice(0, 3) : dotPlatforms;
        const conflictSuffix = conflictDays.has(day.idx) ? ', 1 conflict' : '';
        const isHover = drag != null && drag.hoverDay === day.idx;
        return (
          <button
            key={day.idx}
            type="button"
            className="cdz-btn cdz-focusable"
            style={isHover ? {...styles.stripCol, ...styles.stripColHover} : styles.stripCol}
            aria-label={\`\${day.long}, \${postCount(count)}, best time \${day.windowAria}\${conflictSuffix}\`}
            onClick={() => onColumnTap(day.idx)}>
            <span style={styles.stripLetter} aria-hidden>
              {day.letter}
            </span>
            <span style={styles.stripDotZone} aria-hidden>
              {showHeat ? (
                <span style={{...styles.stripHeatBand, height: \`\${(day.heatScore / 100) * 40}px\`}} />
              ) : null}
              {visible.map((platform, i) => (
                <span key={i} style={{...styles.stripDot, background: PLATFORMS[platform].color}} />
              ))}
              {overflow ? <span style={styles.stripPlusDot}>+</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SLOT CARD — 72px media row <button> (accessible name = title) with the
// SIBLING 44×44 ellipsis. Long-press 450ms (cancelled by 8px movement or
// pointerup) lifts the dragLayer clone; the origin row stays in flow as
// the 40%-opacity dashed ReslotGhost. Row tap (no drag) opens the same
// action sheet as the ellipsis — the gesture never gates anything.
// ---------------------------------------------------------------------------

interface SlotCardProps {
  post: Post;
  isGhost: boolean;
  showBestDot: boolean;
  onOpenActions: (postId: string, opener: HTMLElement) => void;
  onDragStart: (postId: string, originDay: number, x: number, y: number, grabDX: number, grabDY: number, width: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (commit: boolean) => void;
  dragActive: boolean;
}

function SlotCard({post, isGhost, showBestDot, onOpenActions, onDragStart, onDragMove, onDragEnd, dragActive}: SlotCardProps) {
  const timerRef = useRef<number | null>(null);
  const startRef = useRef({x: 0, y: 0});
  const liftedRef = useRef(false);
  const movedRef = useRef(false);
  const rowRef = useRef<HTMLButtonElement | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startRef.current = {x: event.clientX, y: event.clientY};
    movedRef.current = false;
    liftedRef.current = false;
    const target = event.currentTarget;
    const pointerId = event.pointerId;
    const rect = target.getBoundingClientRect();
    const grabDX = startRef.current.x - rect.left;
    const grabDY = startRef.current.y - rect.top;
    clearTimer();
    // 450ms long-press per the gesture contract; 8px movement cancels.
    timerRef.current = window.setTimeout(() => {
      liftedRef.current = true;
      target.setPointerCapture(pointerId);
      onDragStart(post.id, post.dayIdx, startRef.current.x, startRef.current.y, grabDX, grabDY, rect.width);
    }, 450);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    if (!liftedRef.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        movedRef.current = true;
        clearTimer();
      }
      return;
    }
    onDragMove(event.clientX, event.clientY);
  };
  const onPointerUp = () => {
    clearTimer();
    if (liftedRef.current) {
      liftedRef.current = false;
      movedRef.current = true; // suppress the click that follows pointerup
      onDragEnd(true);
    }
  };
  const onPointerCancel = () => {
    clearTimer();
    if (liftedRef.current) {
      liftedRef.current = false;
      onDragEnd(false);
    }
  };
  const onClick = (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onOpenActions(post.id, event.currentTarget);
  };

  const day = DAYS[post.dayIdx];
  const ghostStyle = isGhost || dragActive ? styles.slotGhost : null;
  return (
    <div style={{...styles.slotWrap, ...ghostStyle}}>
      <button
        ref={rowRef}
        type="button"
        className="cdz-btn cdz-focusable"
        style={styles.slotRow}
        aria-label={\`\${post.title}, \${day.toastName} \${post.timeLabel}, \${PLATFORMS[post.platform].name}\${showBestDot ? ', in best-time window' : ''}\`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}>
        <span style={thumbStyle(post.thumbSeed)} aria-hidden />
        <span style={styles.slotText}>
          <span style={styles.slotTitle}>{post.title}</span>
          <span style={styles.slotMeta}>
            {showBestDot ? <span style={styles.bestDot} aria-hidden /> : null}
            {post.timeLabel} · {PLATFORMS[post.platform].name}
          </span>
        </span>
      </button>
      <button
        type="button"
        className="cdz-btn cdz-focusable"
        style={styles.iconBtn}
        aria-label={\`Actions for \${post.title}\`}
        aria-haspopup="dialog"
        onClick={event => onOpenActions(post.id, event.currentTarget)}>
        <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONFLICT RIBBON — 32px band replacing exactly one rowDivider between two
// same-day posts ≤30 min apart. The WHOLE band is one merged <button>
// (full-card-width single target per the merge clause); its accessible
// name states the full consequence; the visible label is aria-hidden.
// 'Space out' moves the LATER post to its own time + 60 min (the spec's
// worked example 9:20 → 10:20 appears three times, so that law wins over
// the once-stated 'earlier + 60' phrasing — noted as spec reconciliation).
// ---------------------------------------------------------------------------

interface ConflictRibbonProps {
  gapMin: number;
  laterLabel: string;
  spacedLabel: string;
  onSpaceOut: () => void;
}

function ConflictRibbon({gapMin, laterLabel, spacedLabel, onSpaceOut}: ConflictRibbonProps) {
  return (
    <button
      type="button"
      className="cdz-btn cdz-focusable"
      style={styles.conflictRibbon}
      aria-label={\`Space out — move \${laterLabel} post to \${spacedLabel}\`}
      onClick={onSpaceOut}>
      <span style={styles.ribbonLabel} aria-hidden>
        {gapMin} min apart
      </span>
      <span style={styles.ribbonAction} aria-hidden>
        Space out
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// MOVE SHEET — the two-detent bottom sheet (55% / calc(100% − 56px)) per
// the sheet contract: 24px grabber zone with the 36×5 pill as a real
// 'Resize sheet' button (click toggles detents — drag-between-detents is
// optional garnish and deliberately not wired), 52px header with 44×44 X,
// content = the ONE legal inner scroller (7-chip day radiogroup with
// arrow keys + a 44px time utility row whose 36px pill toggles an inline
// panel of hour/minute stepper tracks — no drum wheels, no native
// pickers), sticky 48px BRAND 'Move' footer. Confirm routes through the
// IDENTICAL commitMove the drag path uses — one code path, two entrances.
// ---------------------------------------------------------------------------

interface MoveSheetProps {
  post: Post;
  draft: {dayIdx: number; timeMin: number};
  detent: 'medium' | 'large';
  timePanelOpen: boolean;
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDraft: (draft: {dayIdx: number; timeMin: number}) => void;
  onTogglePanel: () => void;
  onToggleDetent: () => void;
  onClose: () => void;
  onCommit: () => void;
}

function MoveSheet({post, draft, detent, timePanelOpen, reducedMotion, sheetRef, onDraft, onTogglePanel, onToggleDetent, onClose, onCommit}: MoveSheetProps) {
  const onChipKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = (draft.dayIdx + delta + 7) % 7;
    onDraft({...draft, dayIdx: next});
    const chips = event.currentTarget.querySelectorAll<HTMLElement>('button[role="radio"]');
    chips[next]?.focus();
  };
  const stepTime = (delta: number) => {
    onDraft({...draft, timeMin: ((draft.timeMin + delta) % 1440 + 1440) % 1440});
  };
  const onSpinKeyDown = (step: number) => (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      stepTime(step);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      stepTime(-step);
    }
  };
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cdz-move-title"
      tabIndex={-1}
      className={reducedMotion ? 'cdz-fade' : 'cdz-sheet-in'}
      onKeyDown={event => {
        trapTabKey(event, sheetRef.current);
        if (event.key === 'Escape') {
          event.stopPropagation();
          // Escape collapses the inline time panel first, then the sheet.
          if (timePanelOpen) onTogglePanel();
          else onClose();
        }
      }}
      style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}>
      <button
        type="button"
        className="cdz-btn cdz-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={onToggleDetent}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="cdz-move-title" style={styles.sheetTitle}>
          Move post
        </h2>
        <button type="button" className="cdz-btn cdz-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.sheetSectionLabel}>Day</div>
        <div style={styles.dayChipsRow} role="radiogroup" aria-label="Target day" onKeyDown={onChipKeyDown}>
          {DAYS.map(day => {
            const checked = draft.dayIdx === day.idx;
            return (
              <button
                key={day.idx}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                className="cdz-btn cdz-focusable"
                style={checked ? {...styles.dayChip, ...styles.dayChipOn} : styles.dayChip}
                onClick={() => onDraft({...draft, dayIdx: day.idx})}>
                {day.chip}
              </button>
            );
          })}
        </div>
        <div style={styles.timeRow}>
          <span style={styles.timeRowLabel}>Time</span>
          <button
            type="button"
            className="cdz-btn cdz-focusable"
            style={styles.timePill}
            aria-expanded={timePanelOpen}
            aria-label={\`Time, \${fmtTime(draft.timeMin)}\`}
            onClick={onTogglePanel}>
            {fmtTime(draft.timeMin)}
          </button>
        </div>
        {timePanelOpen ? (
          <div style={styles.timePanel}>
            <div style={styles.stepRow}>
              <span style={styles.stepLabel}>Hour</span>
              <span style={styles.stepTrack}>
                <button type="button" className="cdz-btn cdz-focusable" style={styles.stepHalf} aria-label="Decrease hour" onClick={() => stepTime(-60)}>
                  −
                </button>
                <span style={styles.stepHairline} aria-hidden />
                <button type="button" className="cdz-btn cdz-focusable" style={styles.stepHalf} aria-label="Increase hour" onClick={() => stepTime(60)}>
                  +
                </button>
              </span>
              <span
                style={styles.stepValue}
                role="spinbutton"
                tabIndex={0}
                className="cdz-focusable"
                aria-label="Hour"
                aria-valuenow={Math.floor(draft.timeMin / 60)}
                aria-valuemin={0}
                aria-valuemax={23}
                aria-valuetext={fmtTime(draft.timeMin)}
                onKeyDown={onSpinKeyDown(60)}>
                {fmtTime(draft.timeMin).split(':')[0]} {draft.timeMin >= 720 ? 'PM' : 'AM'}
              </span>
            </div>
            <div style={{height: 1, background: 'var(--color-border)'}} />
            <div style={styles.stepRow}>
              <span style={styles.stepLabel}>Minutes</span>
              <span style={styles.stepTrack}>
                <button type="button" className="cdz-btn cdz-focusable" style={styles.stepHalf} aria-label="Decrease minutes by 15" onClick={() => stepTime(-15)}>
                  −
                </button>
                <span style={styles.stepHairline} aria-hidden />
                <button type="button" className="cdz-btn cdz-focusable" style={styles.stepHalf} aria-label="Increase minutes by 15" onClick={() => stepTime(15)}>
                  +
                </button>
              </span>
              <span
                style={styles.stepValue}
                role="spinbutton"
                tabIndex={0}
                className="cdz-focusable"
                aria-label="Minutes, steps of 15"
                aria-valuenow={draft.timeMin % 60}
                aria-valuemin={0}
                aria-valuemax={59}
                onKeyDown={onSpinKeyDown(15)}>
                :{String(draft.timeMin % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        ) : null}
        <div style={{...styles.sheetSectionLabel, marginTop: 16}}>Moving</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, minHeight: 24, flexWrap: 'wrap'}}>
          <span style={{...styles.pill, background: PLATFORMS[post.platform].color}}>{PLATFORMS[post.platform].name}</span>
          <span style={{fontSize: 13, color: 'var(--color-text-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {post.title}
          </span>
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="cdz-btn cdz-focusable" style={styles.moveBtn} onClick={onCommit}>
          Move
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ROW ACTION SHEET — the verb picker per the actionSheet contract: two
// stacked cards 8px apart at insetInline 16 / bottom 16; card one holds
// the context header + 56px centered verb rows (destructive LAST, no
// icons); card two is the lone Cancel row. Focus lands on Cancel (safe
// default), Tab is trapped, every close path restores the opener.
// ---------------------------------------------------------------------------

interface RowActionSheetProps {
  post: Post;
  sheetRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  onMoveTo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

function RowActionSheet({post, sheetRef, cancelRef, onMoveTo, onDuplicate, onDelete, onCancel}: RowActionSheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={\`Actions for \${post.title}\`}
      tabIndex={-1}
      className="cdz-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => {
        trapTabKey(event, sheetRef.current);
        if (event.key === 'Escape') {
          event.stopPropagation();
          onCancel();
        }
      }}>
      <div style={styles.actionCard}>
        <div style={styles.actionHeader}>
          {post.title} · {DAYS[post.dayIdx].toastName} {post.timeLabel}
        </div>
        <div style={styles.actionDivider} />
        <button type="button" className="cdz-btn cdz-focusable" style={styles.actionRow} onClick={onMoveTo}>
          Move to…
        </button>
        <div style={styles.actionDivider} />
        <button type="button" className="cdz-btn cdz-focusable" style={styles.actionRow} onClick={onDuplicate}>
          Duplicate
        </button>
        <div style={styles.actionDivider} />
        <button
          type="button"
          className="cdz-btn cdz-focusable"
          style={{...styles.actionRow, ...styles.actionRowDestructive}}
          onClick={onDelete}>
          Delete
        </button>
      </div>
      <div style={styles.actionCard}>
        <button ref={cancelRef} type="button" className="cdz-btn cdz-focusable" style={styles.actionCancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Cadenza Week Planner.
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: TabId; label: string; icon: typeof CalendarRangeIcon}> = [
  {id: 'week', label: 'Week', icon: CalendarRangeIcon},
  {id: 'queue', label: 'Queue', icon: ListOrderedIcon},
  {id: 'ideas', label: 'Ideas', icon: LightbulbIcon},
  {id: 'settings', label: 'Settings', icon: Settings2Icon},
];

const H1_BY_TAB: Record<TabId, string> = {
  week: 'Cadenza — Week of July 6',
  queue: 'Cadenza — Queue',
  ideas: 'Cadenza — Ideas',
  settings: 'Cadenza — Settings',
};

export default function MobilePostWeekStripTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports. <350px hides the navBar
  // '· 15 posts' suffix (container-safe conditional, not viewport).
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const hideSuffix = wrapWidth > 0 && wrapWidth < 350;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(cadenzaReducer, INITIAL_STATE);
  const patch = useCallback((p: Partial<CadenzaState>) => dispatch({type: 'patch', patch: p}), []);
  // THE update(id, patch) helper — every post mutation funnels through it.
  const updatePost = useCallback(
    (id: string, p: Partial<Pick<Post, 'dayIdx' | 'timeMin'>>) => dispatch({type: 'updatePost', id, patch: p}),
    [],
  );

  // Transient drag pointer position — React state for render, but the
  // geometry (grab offset, clone width, shell origin) lives in a ref
  // (rerender-use-ref-transient-values: only x/y need to paint).
  const [dragPos, setDragPos] = useState({x: 0, y: 0});
  const dragMetaRef = useRef({grabDX: 0, grabDY: 0, width: 0, shellLeft: 0, shellTop: 0});

  // Focus + geometry plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dayRefs = useRef<Array<HTMLElement | null>>([null, null, null, null, null, null, null]);
  const toastSeqRef = useRef(0);
  const dupSeqRef = useRef(0);
  const pendingDayScrollRef = useRef<number | null>(null);
  const firstNewIdeaRef = useRef<HTMLButtonElement | null>(null);
  const hoverDayRef = useRef<number | null>(null);

  const {posts, activeTab, drag, openSheet, toast, settings} = state;

  // DERIVED — never stored (rerender-derived-state-no-effect).
  const counts = perDayCounts(posts);
  const queueBadge = posts.length; // = navBar suffix; move keeps it at 15
  const conflicts = settings.conflictAlerts ? conflictPairs(posts) : [];
  const conflictDays = new Set(conflicts.map(pair => pair.earlier.dayIdx));
  const platformCounts = perPlatformCounts(posts);
  const sheetPost = state.sheetPostId != null ? posts.find(post => post.id === state.sheetPostId) ?? null : null;
  const draggedPost = drag != null ? posts.find(post => post.id === drag.postId) ?? null : null;

  const showToast = useCallback(
    (msg: string, undo: UndoSnapshot | null = null) => {
      toastSeqRef.current += 1;
      patch({toast: {seq: toastSeqRef.current, msg, undo}});
    },
    [patch],
  );

  // SCROLL HELPERS — the demo's .preview-wrap owns page scroll; day jumps
  // offset by the 116px sticky stack (52 navBar + 64 strip).
  const scrollToDay = useCallback((dayIdx: number) => {
    const section = dayRefs.current[dayIdx];
    const scroller = getScroller(shellRef.current);
    if (section == null || scroller == null) return;
    const scrollerTop = scroller.getBoundingClientRect == null ? 0 : scroller.getBoundingClientRect().top;
    const delta = section.getBoundingClientRect().top - scrollerTop - 124;
    scroller.scrollTop += delta;
  }, []);

  // TAB SWITCH — per-tab persistence: record the scroller's scrollTop on
  // exit, restore on entry; open sheets close (an overlay belongs to its
  // moment); re-tapping the active tab scrolls to top (the one legal
  // reset).
  const selectTab = useCallback(
    (tab: TabId) => {
      const scroller = getScroller(shellRef.current);
      if (tab === activeTab) {
        if (scroller != null) scroller.scrollTop = 0;
        return;
      }
      const scrollPatch = {...state.scrollByTab, [activeTab]: scroller?.scrollTop ?? 0};
      patch({activeTab: tab, scrollByTab: scrollPatch, openSheet: null, sheetPostId: null, timePanelOpen: false, drag: null});
      requestAnimationFrame(() => {
        const nextScroller = getScroller(shellRef.current);
        if (nextScroller == null) return;
        nextScroller.scrollTop = scrollPatch[tab] ?? 0;
        const pendingDay = pendingDayScrollRef.current;
        if (pendingDay != null && tab === 'week') {
          pendingDayScrollRef.current = null;
          scrollToDay(pendingDay);
        }
      });
    },
    [activeTab, patch, scrollToDay, state.scrollByTab],
  );

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = TAB_ORDER.indexOf(activeTab);
    const next = TAB_ORDER[(index + (event.key === 'ArrowRight' ? 1 : -1) + 4) % 4];
    selectTab(next);
    document.getElementById(\`cdz-tab-\${next}\`)?.focus();
  };

  // SHEET LIFECYCLE — focus moves in with preventScroll (amendment: plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (openSheet === 'move') sheetRef.current?.focus({preventScroll: true});
    else if (openSheet === 'actions') actionCancelRef.current?.focus({preventScroll: true});
    if (openSheet != null && shellRef.current != null) shellRef.current.scrollTop = 0;
  }, [openSheet]);

  const closeSheet = useCallback(() => {
    patch({openSheet: null, sheetPostId: null, timePanelOpen: false});
    openerRef.current?.focus();
  }, [patch]);

  const openActions = useCallback(
    (postId: string, opener: HTMLElement) => {
      openerRef.current = opener;
      patch({openSheet: 'actions', sheetPostId: postId});
    },
    [patch],
  );

  // MUTATIONS — every path lands in updatePost / insertPost / removePost,
  // and every consequence elsewhere (strip dots, day counts, Queue badge
  // and order, ribbon, Settings platform rows) is derived in render.
  // NOTE: a MOVE keeps queueBadge at 15 — move, not delete.
  const commitMove = useCallback(
    (post: Post, dayIdx: number, timeMin: number) => {
      const undo: UndoSnapshot = {kind: 'move', postId: post.id, dayIdx: post.dayIdx, timeMin: post.timeMin};
      updatePost(post.id, {dayIdx, timeMin});
      showToast(\`Moved to \${DAYS[dayIdx].toastName} \${fmtTime(timeMin)}\`, undo);
    },
    [showToast, updatePost],
  );

  const onMoveTo = useCallback(() => {
    if (sheetPost == null) return;
    patch({openSheet: 'move', sheetDetent: 'medium', timePanelOpen: false, moveDraft: {dayIdx: sheetPost.dayIdx, timeMin: sheetPost.timeMin}});
  }, [patch, sheetPost]);

  const onMoveCommit = useCallback(() => {
    if (sheetPost == null) return;
    commitMove(sheetPost, state.moveDraft.dayIdx, state.moveDraft.timeMin);
    closeSheet();
  }, [closeSheet, commitMove, sheetPost, state.moveDraft]);

  const onDuplicate = useCallback(() => {
    if (sheetPost == null) return;
    dupSeqRef.current += 1;
    const copy: Post = {
      ...sheetPost,
      id: \`\${sheetPost.id}_copy\${dupSeqRef.current}\`,
      timeMin: sheetPost.timeMin + 30,
      timeLabel: fmtTime(sheetPost.timeMin + 30),
    };
    const index = posts.findIndex(post => post.id === sheetPost.id) + 1;
    dispatch({type: 'insertPost', post: copy, index});
    showToast(\`Duplicated — \${posts.length + 1} posts this week\`, {kind: 'add', postId: copy.id});
    closeSheet();
  }, [closeSheet, posts, sheetPost, showToast]);

  // Delete executes IMMEDIATELY with Undo (undoOverConfirm) — badge,
  // strip dot, and day header all drop by 1 and restore together
  // (stress fixture 6, the four-way consistency check).
  const onDelete = useCallback(() => {
    if (sheetPost == null) return;
    const index = posts.findIndex(post => post.id === sheetPost.id);
    dispatch({type: 'removePost', id: sheetPost.id});
    showToast(\`Deleted “\${sheetPost.title}”\`, {kind: 'remove', post: sheetPost, index});
    patch({openSheet: null, sheetPostId: null});
    // The opener row is gone; focus returns to the day's strip column.
    openerRef.current = null;
  }, [patch, posts, sheetPost, showToast]);

  const onUndo = useCallback(() => {
    const undo = toast?.undo;
    if (undo == null) return;
    if (undo.kind === 'move') {
      updatePost(undo.postId, {dayIdx: undo.dayIdx, timeMin: undo.timeMin});
      showToast('Restored');
    } else if (undo.kind === 'remove') {
      dispatch({type: 'insertPost', post: undo.post, index: undo.index});
      showToast('Restored');
    } else {
      dispatch({type: 'removePost', id: undo.postId});
      showToast('Removed');
    }
  }, [showToast, toast, updatePost]);

  // 'Space out' — later post moves to ITS OWN time + 60 (9:20 → 10:20; the
  // spec's thrice-repeated worked example wins over the once-stated
  // 'earlier + 60' phrasing).
  const onSpaceOut = useCallback(
    (later: Post) => {
      const undo: UndoSnapshot = {kind: 'move', postId: later.id, dayIdx: later.dayIdx, timeMin: later.timeMin};
      updatePost(later.id, {timeMin: later.timeMin + 60});
      showToast(\`Spaced out — moved to \${fmtTime(later.timeMin + 60)}\`, undo);
    },
    [showToast, updatePost],
  );

  // Empty-day 'Add' / idea-row scheduling — appends the idea as a post at
  // the target day's window start + 30 (deterministic), with add-Undo.
  const scheduleIdea = useCallback(
    (idea: Idea, ideaIndex: number, dayIdx: number | null) => {
      let target = dayIdx;
      if (target == null) {
        // Idea rows pick the emptiest day (ties → earliest).
        const liveCounts = perDayCounts(posts);
        target = liveCounts.indexOf(Math.min(...liveCounts));
      }
      const day = DAYS[target];
      const timeMin = day.windowStart + 30;
      dupSeqRef.current += 1;
      const post: Post = {
        id: \`post_idea_\${idea.id}_\${dupSeqRef.current}\`,
        title: idea.title,
        dayIdx: target,
        timeMin,
        timeLabel: fmtTime(timeMin),
        platform: PLATFORM_ORDER[ideaIndex % 4],
        thumbSeed: ideaIndex,
      };
      dispatch({type: 'insertPost', post, index: posts.length});
      showToast(\`Scheduled for \${day.toastName} · \${fmtTime(timeMin)}\`, {kind: 'add', postId: post.id});
    },
    [posts, showToast],
  );

  const onLoadMoreIdeas = useCallback(() => {
    patch({ideasShown: 14});
    showToast('8 more ideas loaded');
    requestAnimationFrame(() => firstNewIdeaRef.current?.focus({preventScroll: false}));
  }, [patch, showToast]);

  // DRAG WIRING — SlotCard owns the 450ms lift; the page owns hover-day
  // hit-testing against the 7 day-section rects and the commit.
  const onDragStart = useCallback(
    (postId: string, originDay: number, x: number, y: number, grabDX: number, grabDY: number, width: number) => {
      const shellRect = shellRef.current?.getBoundingClientRect();
      dragMetaRef.current = {grabDX, grabDY, width, shellLeft: shellRect?.left ?? 0, shellTop: shellRect?.top ?? 0};
      hoverDayRef.current = null;
      setDragPos({x, y});
      patch({drag: {postId, originDay, hoverDay: null}});
    },
    [patch],
  );
  const onDragMove = useCallback(
    (x: number, y: number) => {
      setDragPos({x, y});
      let hover: number | null = null;
      for (const day of DAYS) {
        const section = dayRefs.current[day.idx];
        if (section == null) continue;
        const rect = section.getBoundingClientRect();
        if (y >= rect.top && y < rect.bottom) {
          hover = day.idx;
          break;
        }
      }
      if (hover !== hoverDayRef.current) {
        hoverDayRef.current = hover;
        // Crossing a boundary re-derives the strip's projected dots.
        patch({drag: state.drag == null ? null : {...state.drag, hoverDay: hover}});
      }
    },
    [patch, state.drag],
  );
  const onDragEnd = useCallback(
    (commit: boolean) => {
      const current = state.drag;
      patch({drag: null});
      hoverDayRef.current = null;
      if (!commit || current == null || current.hoverDay == null || current.hoverDay === current.originDay) return;
      const post = posts.find(p => p.id === current.postId);
      if (post == null) return;
      // Day moves KEEP the slot time — Thu 6:30 PM → Wed lands at 6:30 PM,
      // inside Wed's 6–9 PM window (the halo demo).
      commitMove(post, current.hoverDay, post.timeMin);
    },
    [commitMove, patch, posts, state.drag],
  );

  // Escape cancels an in-flight drag (clone returns; instant — the clone
  // simply unmounts, transform/opacity only).
  useEffect(() => {
    if (drag == null) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hoverDayRef.current = null;
        patch({drag: null});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drag, patch]);

  // RENDER HELPERS -----------------------------------------------------------

  const renderWeek = () => (
    <>
      {DAYS.map(day => {
        const dayPosts = postsForDay(posts, day.idx);
        const isLandingDay = drag != null && drag.hoverDay === day.idx && draggedPost != null;
        const landingIndex = isLandingDay
          ? dayPosts.filter(post => post.id !== draggedPost.id && post.timeMin < draggedPost.timeMin).length
          : -1;
        const landingInWindow =
          isLandingDay && draggedPost.timeMin >= day.windowStart && draggedPost.timeMin <= day.windowEnd;
        const rows: ReactNode[] = [];
        const visiblePosts = dayPosts;
        visiblePosts.forEach((post, index) => {
          if (isLandingDay && index === landingIndex && draggedPost.id !== post.id) {
            rows.push(
              <div
                key={\`landing-\${day.idx}\`}
                style={{...styles.landingRow, ...(landingInWindow && !reducedMotion ? styles.landingHalo : null)}}
                aria-hidden>
                <span style={{...styles.pill, background: PLATFORMS[draggedPost.platform].color}}>
                  {PLATFORMS[draggedPost.platform].name}
                </span>
                <span style={{...styles.pill, background: 'var(--color-background-muted)', color: 'var(--color-text-primary)'}}>
                  {draggedPost.timeLabel}
                </span>
              </div>,
            );
          }
          if (index > 0) {
            const prev = visiblePosts[index - 1];
            const pair = conflicts.find(c => c.earlier.id === prev.id && c.later.id === post.id);
            if (pair != null) {
              // The ribbon REPLACES exactly this one rowDivider.
              rows.push(
                <ConflictRibbon
                  key={\`ribbon-\${prev.id}\`}
                  gapMin={pair.gapMin}
                  laterLabel={pair.later.timeLabel}
                  spacedLabel={fmtTime(pair.later.timeMin + 60)}
                  onSpaceOut={() => onSpaceOut(pair.later)}
                />,
              );
            } else {
              rows.push(<div key={\`div-\${post.id}\`} style={styles.rowDividerDeep} />);
            }
          }
          rows.push(
            <SlotCard
              key={post.id}
              post={post}
              isGhost={false}
              dragActive={drag != null && drag.postId === post.id}
              showBestDot={settings.bestTimeHints && inBestTime(post)}
              onOpenActions={openActions}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
            />,
          );
        });
        if (isLandingDay && landingIndex >= visiblePosts.length) {
          rows.push(
            <div
              key={\`landing-\${day.idx}\`}
              style={{...styles.landingRow, ...(landingInWindow && !reducedMotion ? styles.landingHalo : null)}}
              aria-hidden>
              <span style={{...styles.pill, background: PLATFORMS[draggedPost.platform].color}}>
                {PLATFORMS[draggedPost.platform].name}
              </span>
              <span style={{...styles.pill, background: 'var(--color-background-muted)', color: 'var(--color-text-primary)'}}>
                {draggedPost.timeLabel}
              </span>
            </div>,
          );
        }
        return (
          <section
            key={day.idx}
            ref={el => {
              dayRefs.current[day.idx] = el;
            }}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionHeaderText}>{day.header}</h2>
              <span style={styles.sectionHeaderCount}>{postCount(counts[day.idx])}</span>
            </div>
            <div style={styles.listCard}>
              {rows.length > 0 ? (
                rows
              ) : (
                <div style={styles.emptyRow}>
                  <span style={styles.emptyRowText}>No posts — best time {day.windowLabel}</span>
                  <button
                    type="button"
                    className="cdz-btn cdz-focusable"
                    style={styles.addBtn}
                    aria-label={\`Add a post to \${day.long}\`}
                    onClick={() => scheduleIdea(IDEAS[0], 0, day.idx)}>
                    Add
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );

  const renderQueue = () => {
    const ordered = DAYS.flatMap(day => postsForDay(posts, day.idx));
    return (
      <>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionHeaderText}>This week</h2>
          <span style={styles.sectionHeaderCount}>{postCount(queueBadge)}</span>
        </div>
        <div style={styles.listCard}>
          {DAYS.filter(day => counts[day.idx] > 0).map((day, groupIndex) => (
            <div key={day.idx}>
              {groupIndex > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.queueGroupHeader}>{day.header}</div>
              {postsForDay(posts, day.idx).map((post, index) => (
                <div key={post.id}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <button
                    type="button"
                    className="cdz-btn cdz-focusable"
                    style={styles.twoLineRow}
                    aria-label={\`\${post.title}, \${day.toastName} \${post.timeLabel} — show in week\`}
                    onClick={() => {
                      pendingDayScrollRef.current = post.dayIdx;
                      selectTab('week');
                    }}>
                    <span style={styles.twoLineText}>
                      <span style={styles.slotTitle}>{post.title}</span>
                      <span style={styles.slotMeta}>
                        {settings.bestTimeHints && inBestTime(post) ? <span style={styles.bestDot} aria-hidden /> : null}
                        {post.timeLabel} · {PLATFORMS[post.platform].name}
                      </span>
                    </span>
                    <span style={{...styles.pill, background: PLATFORMS[post.platform].color}}>
                      {PLATFORMS[post.platform].name}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderIdeas = () => (
    <>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionHeaderText}>Idea backlog</h2>
        <span style={styles.sectionHeaderCount}>{state.ideasShown} of 14</span>
      </div>
      <div style={styles.listCard}>
        {IDEAS.slice(0, state.ideasShown).map((idea, index) => (
          <div key={idea.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              ref={index === 6 ? firstNewIdeaRef : undefined}
              type="button"
              className="cdz-btn cdz-focusable"
              style={styles.twoLineRow}
              aria-label={\`Schedule idea: \${idea.title}\`}
              onClick={() => scheduleIdea(idea, index, null)}>
              <span style={styles.twoLineText}>
                <span style={styles.slotTitle}>{idea.title}</span>
                <span style={styles.slotMeta}>{idea.tag}</span>
              </span>
            </button>
          </div>
        ))}
        {state.ideasShown === 6 ? (
          <>
            <div style={styles.rowDivider} />
            <button type="button" className="cdz-btn cdz-focusable" style={styles.loadMoreRow} onClick={onLoadMoreIdeas}>
              Show 8 more
            </button>
          </>
        ) : null}
      </div>
      {state.ideasShown === 14 ? <div style={styles.terminalCaption}>All 14 ideas</div> : null}
    </>
  );

  const renderSettings = () => (
    <>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionHeaderText}>Connected platforms</h2>
        <span style={styles.sectionHeaderCount}>{postCount(queueBadge)}</span>
      </div>
      <div style={styles.listCard}>
        {PLATFORM_ORDER.map((platformId, index) => (
          <div key={platformId}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="cdz-btn cdz-focusable"
              style={styles.settingsRow}
              aria-label={\`\${PLATFORMS[platformId].name}, \${platformCounts[platformId]} scheduled this week\`}
              onClick={() => showToast(\`\${PLATFORMS[platformId].name}: \${platformCounts[platformId]} scheduled this week\`)}>
              <span style={{...styles.platformDot, background: PLATFORMS[platformId].color}} aria-hidden />
              <span style={styles.settingsLabel}>{PLATFORMS[platformId].name}</span>
              <span style={styles.settingsMeta}>{platformCounts[platformId]} scheduled</span>
            </button>
          </div>
        ))}
      </div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionHeaderText}>Planner</h2>
        <span aria-hidden />
      </div>
      <div style={styles.listCard}>
        {(
          [
            {key: 'bestTimeHints', label: 'Best-time hints'},
            {key: 'conflictAlerts', label: 'Conflict warnings'},
            {key: 'weeklyDigest', label: 'Weekly digest email'},
          ] as const
        ).map((row, index) => {
          const checked = settings[row.key];
          return (
            <div key={row.key}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                className="cdz-btn cdz-focusable"
                style={styles.settingsRow}
                onClick={() => patch({settings: {...settings, [row.key]: !checked}})}>
                <span style={styles.settingsLabel}>{row.label}</span>
                <span
                  style={{...styles.switchTrack, background: checked ? BRAND_ACCENT : SWITCH_OFF_TRACK}}
                  aria-hidden>
                  <span
                    className="cdz-anim"
                    style={{...styles.switchThumb, transform: checked ? 'translateX(20px)' : undefined}}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  // ---------------------------------------------------------------------------

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(openSheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{CADENZA_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <h1 className="cdz-vh">{H1_BY_TAB[activeTab]}</h1>

        {/* NAV BAR — 52px sticky, hairline always on. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <CadenzaMark />
          </div>
          <div style={styles.navTitleWrap}>
            <span style={styles.navTitle}>Jul 6–12</span>
            {hideSuffix ? null : <span style={styles.navTitleSuffix}>· {postCount(queueBadge)}</span>}
          </div>
          <div style={styles.navTrailing}>
            <span style={styles.todayChipHit}>
              <button
                type="button"
                className="cdz-btn cdz-focusable"
                style={styles.todayChip}
                // TODAY (Sat Jul 4) is in the prior week → jump to Monday,
                // the week's first day (see TODAY NOTE at DAYS).
                aria-label="Jump to Monday, the first day of this week"
                onClick={() => {
                  if (activeTab !== 'week') {
                    pendingDayScrollRef.current = 0;
                    selectTab('week');
                  } else {
                    scrollToDay(0);
                  }
                }}>
                Today
              </button>
            </span>
          </div>
        </header>

        {/* WEEK DENSITY STRIP — pinned under the navBar on every tab so
            the drag projection is always in the same sightline. */}
        <WeekDensityStrip
          posts={posts}
          drag={drag}
          showHeat={settings.bestTimeHints}
          conflictDays={conflictDays}
          onColumnTap={dayIdx => {
            if (activeTab !== 'week') {
              pendingDayScrollRef.current = dayIdx;
              selectTab('week');
            } else {
              scrollToDay(dayIdx);
            }
          }}
        />

        <main style={styles.main}>
          {activeTab === 'week'
            ? renderWeek()
            : activeTab === 'queue'
              ? renderQueue()
              : activeTab === 'ideas'
                ? renderIdeas()
                : renderSettings()}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow 76px
            above the viewport bottom; no auto-dismiss timers (a new
            mutation replaces it, ending the prior undo window). */}
        <div style={styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="cdz-btn cdz-focusable" style={styles.toastUndo} onClick={onUndo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 4 tabs, arrow-key tablist, Queue badge derives
            from posts.length (delete 15→14, Undo →15). */}
        <nav style={styles.tabBar} role="tablist" aria-label="Cadenza sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`cdz-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="cdz-btn cdz-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'queue' ? (
                    <span style={styles.tabBadge} aria-label={\`\${queueBadge} queued posts\`}>
                      {queueBadge}
                    </span>
                  ) : null}
                </span>
                <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* DRAG LAYER — absolute z35 clone, transform-only follow; scale
            1.02 dropped under reduced motion. */}
        {drag != null && draggedPost != null ? (
          <div style={styles.dragLayer} aria-hidden>
            <div
              style={{
                ...styles.dragClone,
                width: dragMetaRef.current.width,
                transform: \`translate(\${dragPos.x - dragMetaRef.current.shellLeft - dragMetaRef.current.grabDX}px, \${
                  dragPos.y - dragMetaRef.current.shellTop - dragMetaRef.current.grabDY
                }px)\${reducedMotion ? '' : ' scale(1.02)'}\`,
              }}>
              <span style={thumbStyle(draggedPost.thumbSeed)} />
              <span style={styles.slotText}>
                <span style={styles.slotTitle}>{draggedPost.title}</span>
                <span style={styles.slotMeta}>
                  {draggedPost.timeLabel} · {PLATFORMS[draggedPost.platform].name}
                </span>
              </span>
            </div>
          </div>
        ) : null}

        {/* OVERLAYS — scrim + one sheet at a time; scrim click closes. */}
        {openSheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {openSheet === 'actions' && sheetPost != null ? (
          <RowActionSheet
            post={sheetPost}
            sheetRef={sheetRef}
            cancelRef={actionCancelRef}
            onMoveTo={onMoveTo}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onCancel={closeSheet}
          />
        ) : null}
        {openSheet === 'move' && sheetPost != null ? (
          <MoveSheet
            post={sheetPost}
            draft={state.moveDraft}
            detent={state.sheetDetent}
            timePanelOpen={state.timePanelOpen}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDraft={draft => patch({moveDraft: draft})}
            onTogglePanel={() => patch({timePanelOpen: !state.timePanelOpen})}
            onToggleDetent={() => patch({sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'})}
            onClose={closeSheet}
            onCommit={onMoveCommit}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};