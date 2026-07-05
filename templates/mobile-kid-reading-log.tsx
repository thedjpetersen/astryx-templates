// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Wrenling family reading log
 *   frozen at TONIGHT 'Fri, Jul 3' over a 14-night window (Jun 20 – Jul 3,
 *   Jul 3 pending). Two fully independent kids: Maya (goal 80 min/wk — 10
 *   logged / 3 missed / 1 pending, window total 200 min over 10 nights =
 *   avg 20 exactly, week 20+15+25 = 60, streak 0 current / 5 best) and
 *   Theo (goal 60 — 8 logged / 5 missed / 1 pending, window 120 over 8 =
 *   avg 15, week 10+10+10+15 = 45, streak 5 current / 5 best). Every night
 *   stores dual fields {minutes, pages} with pages = minutes × 0.6 exactly
 *   (PAGES_PER_MIN declared once). Books carry lifetime pagesRead beside
 *   the windowed minutes ledger (both labeled — the split is honest). No
 *   Date.now(), no Math.random(), no network media: covers are id-derived
 *   solid blocks, the garden is a pure djb2-hashed SVG.
 * @output Wrenling — Family Reading Log: a 390px MOBILE surface. NavBar
 *   (wren-on-book mark · Maya/Theo segmented kidSwitcher · Refresh) over
 *   four tabs (Tonight/Books/Garden/Family). Tonight: 'Tonight' large
 *   title, tonightCard (GoalRing 72px, 60-of-80 text, streak line,
 *   goal-met banner), 5-row Mon–Fri weekStrip, StreakGarden SVG (14 slots
 *   at 23px pitch), BookSpineProgress scroll-snap shelf, sticky-footer
 *   'Log tonight'. Signature move: the two-detent logSheet's MinuteDial
 *   (5-min detents, 270°) plus book radio writes ONE pending log; 'Log it
 *   · 20 min' grows plant 11 (scaleY 320ms), raises the Wild Robot spine
 *   fill 60→64px, closes the ring 75%→100% with a 'Weekly goal met'
 *   banner, mints the Garden tab badge '1', recomputes Family rows
 *   (60→80 / 105→125 / 7→8 nights), and posts one Undo toast — Undo
 *   reverts every surface in one snapshot assignment. Kid switch
 *   cross-fades to Theo's independent state (8 plants / ring 45-of-60 /
 *   Dog Man shelf / badge '5').
 * @position Page template; emitted by `astryx template mobile-kid-reading-log`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, anchored menus,
 *   toast) are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While the logSheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} (toastDock flips shell-absolute for the lock;
 *   otherwise it is a sticky-in-flow dock — absolute would pin to the
 *   DOCUMENT bottom on tall tabs). Stage clips to --radius-container;
 *   shell paints full-bleed square, no own radius.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   hairline border, rowDividers inset 16 / 68 after thumbs); no desktop
 *   Layout frames, no asides, no tables — comparisons are 60/72px rows.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Wrenling green — raw spec #4C9F70 fails 4.5:1 under
 *   white text, so light darkens to #3E8A5C; math at the declaration).
 *   Interactive boundaries and meaningful rest fills (spine borders, dial
 *   ticks, ring track, missed sprouts) get explicit light-dark() pairs at
 *   ≥3:1 vs their ACTUAL surface — hairline tokens are for passive
 *   separators only. Spec's suggested spine-border pair measured ~1.6:1
 *   vs the muted fill, corrected here (deviation, math at declarations).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', blur 86% + 12px, hairline
 *   always-on — declared choice); kidSwitcher 36px, segments minWidth 72
 *   paddingInline 12 (~168px total < 200 center max; 44+168+44 = 256 ≤
 *   320−16 slack at the narrow edge); tabBar 64px sticky bottom z20, 4
 *   tabs, 24px icon over 11px/500 label, Garden badge 16px brand pill
 *   10px/600 at top −4 / right −8; rows 44px utility (weekStrip) / 60px
 *   two-line (nights, done pile, book radios, teacher goals) / 72px media
 *   (books, family — 48px thumb / 40px avatar); sectionHeader 13px/600
 *   uppercase 0.06em at 32px, 20px top / 8px bottom; sticky footer 16px
 *   padding + 48px brand button at bottom 64 (above the tabBar); sheet
 *   detents 55% / calc(100% − 56px), 24px grabber zone (36×5 pill), 52px
 *   header; toastDock sticky bottom 76 (156 on Tonight, above the
 *   footer). TYPE (Figtree only): 28/700 large title · 22/700 card
 *   titles · 17/600 nav+sheet titles · 16/400 body floor · 13/400 meta ·
 *   11/500 overlines+tab labels; nothing under 11px; tabular-nums on
 *   every minute/page/streak numeral. Touch: every target ≥44×44 with
 *   ≥8px clearance or merged full-row; every gesture has a visible
 *   button path (swipe rows → 44×44 ellipsis; dial → ±5 buttons + slider
 *   keys; carousel → 24px peek + 44px dot hits + arrow keys; sheet →
 *   grabber click/X/Escape; kid switch → segmented radiogroup).
 *
 * Responsive contract:
 * - Fluid 320–430: shell width 100%, no width:390 literals; garden SVG
 *   scales via viewBox (preserveAspectRatio meet); MinuteDial is 200px
 *   with its ± buttons in a row BELOW at ALL widths (200 < 320−32); the
 *   spine rail is overflow-x scroll-snap so extra spines never widen the
 *   shell (48px spines guarantee a ≥24px peek at 320); weekStrip trailing
 *   text and book titles ellipsize at min-width 0.
 * - Desktop stage (~1045px): useElementWidth ResizeObserver on the
 *   wrapper (container width, not viewport) — at ≥720px the shell renders
 *   as a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; sticky chrome and
 *   absolute overlays anchor to shell inside the column.
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
  BookOpenIcon,
  CheckIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  SproutIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. House law: interactive boundaries and meaningful rest
// fills need explicit ≥3:1 pairs vs their ACTUAL surface.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Wrenling green). Spec raw #4C9F70 carries
// white text at only ~3.1:1, so light darkens to #3E8A5C: #FFFFFF on
// #3E8A5C ≈ 4.9:1 ✓. Dark side #8FD4AC on the dark card (~#1C1C1E) ≈
// 9.6:1 ✓ as text/fill.
const BRAND_ACCENT = 'light-dark(#3E8A5C, #8FD4AC)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #3E8A5C ≈ 4.9:1 ✓.
// Dark: near-black green #14241B on #8FD4AC ≈ 8.2:1 ✓.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #14241B)';
// Brand-tinted TEXT on the card / goal-met band: #2F6B4A on white ≈
// 6.3:1 ✓; #A5DFC0 on the dark card ≈ 10.9:1 ✓ (band is a 12% tint of
// brand over card, which barely moves either ratio).
const BRAND_TEXT = 'light-dark(#2F6B4A, #A5DFC0)';
// 12% brand wash for banners/avatars/active chips.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Spine progress fill — brand at 80% mixed with the card surface.
const SPINE_FILL = `color-mix(in srgb, ${BRAND_ACCENT} 80%, var(--color-background-card))`;
// MinuteDial detent ticks + dial outline + tonight's dashed pending
// circle — meaningful marks on the CARD surface: #5C554B on white ≈
// 6.6:1 ✓ ≥3:1; #B8AFA2 on ~#1C1C1E ≈ 7.6:1 ✓.
const DIAL_TICK = 'light-dark(#5C554B, #B8AFA2)';
// Interactive-boundary edge for spine borders (on the MUTED fill) and the
// GoalRing rest track (on the card). Spec suggested
// light-dark(#C7BFB2, #4A4438) but that measures ~1.6:1 on the light
// muted fill and ~1.5:1 on the dark — corrected (deviation): #8A8171 on
// the light muted (~#F1EDE6) ≈ 3.2:1 ✓ and on white ≈ 3.6:1 ✓;
// #8D8677 on the dark muted (~#2A2A2C) ≈ 3.9:1 ✓ and on the dark card
// ≈ 4.5:1 ✓.
const CONTROL_EDGE = 'light-dark(#8A8171, #8D8677)';
// Missed-night sprout — meaningful rest-state glyph, so it gets a full
// ≥3:1 pair instead of the spec's text-secondary @ 60% (deviation for
// the contrast amendment): #6E6759 on white ≈ 4.9:1 ✓; #9B9384 on the
// dark card ≈ 5.4:1 ✓. Honest, not shaming.
const SPROUT_MUTED = 'light-dark(#6E6759, #9B9384)';
// Companion garden greens (stems ≥3:1 vs card): #2F6B4F ≈ 6.4:1 /
// #7BBFA0 ≈ 7.6:1 ✓; #55703A ≈ 5.9:1 / #A9C185 ≈ 8.5:1 ✓.
const GREEN_DEEP = 'light-dark(#2F6B4F, #7BBFA0)';
const GREEN_MOSS = 'light-dark(#55703A, #A9C185)';
// Decorative bloom accent for flower heads (≥3:1 vs card: #B0563A ≈
// 4.5:1; #E5A08B ≈ 8.0:1).
const BLOOM = 'light-dark(#B0563A, #E5A08B)';
// Id-derived cover blocks — solid fills that carry a white 17/700
// initial: #3B6EA8 ≈ 4.7:1, #8C4F2B ≈ 5.6:1, #6B4FA0 ≈ 6.3:1, #2F6D7D ≈
// 5.4:1 under #FFFFFF in light; dark sides are the same hue kept deep so
// white still clears 4.5:1 (#345E8C ≈ 6.0:1, #7A4526 ≈ 6.8:1, #5B4488 ≈
// 7.3:1, #295E6C ≈ 6.4:1).
const COVER_INKS = [
  'light-dark(#3B6EA8, #345E8C)',
  'light-dark(#8C4F2B, #7A4526)',
  'light-dark(#6B4FA0, #5B4488)',
  'light-dark(#2F6D7D, #295E6C)',
];
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1s,
// and the animation classes. Transitions animate transform/opacity only —
// except the GoalRing's spec-mandated 300ms stroke-dashoffset sweep — and
// ALL of them collapse under prefers-reduced-motion (shimmer removed
// entirely; static muted blocks still read as loading).
// ---------------------------------------------------------------------------

const WREN_CSS = `
.wrn-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.wrn-btn:disabled { cursor: default; }
.wrn-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.wrn-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.wrn-anim { transition: transform 240ms ease, opacity 240ms ease; }
.wrn-fade { transition: opacity 240ms ease; }
/* MinuteDial detent physics: snap + a 60ms transform tick. */
.wrn-thumb { transition: transform 60ms linear; }
/* GoalRing sweep — spec-mandated dashoffset transition (deviation from
   the transform/opacity-only law, collapsed under reduced motion). */
.wrn-ring-arc { transition: stroke-dashoffset 300ms ease; }
@keyframes wrn-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.wrn-sheet-in { animation: wrn-sheet-in 240ms ease; }
/* New plant grows from the ground origin (transform-origin set inline). */
@keyframes wrn-grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
.wrn-grow { animation: wrn-grow 320ms ease; }
/* Kid switch — 200ms opacity-only cross-fade on the keyed body. */
@keyframes wrn-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.wrn-kidfade { animation: wrn-fade-in 200ms ease; }
/* Finishing spine tips onto the done pile. */
@keyframes wrn-finish {
  to { transform: rotate(90deg) translate(18px, -14px); opacity: 0; }
}
.wrn-finish { animation: wrn-finish 240ms ease forwards; }
/* One shared shimmer sweep across the skeleton card. */
@keyframes wrn-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.wrn-shimmer { animation: wrn-shimmer 1.6s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .wrn-anim, .wrn-fade, .wrn-thumb, .wrn-ring-arc { transition: none; }
  .wrn-sheet-in, .wrn-grow, .wrn-kidfade, .wrn-finish { animation: none; }
  .wrn-finish { opacity: 0; }
  .wrn-shimmer { animation: none; display: none; }
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
  // NAV BAR — 52px sticky top z20, paddingInline 8, grid '1fr auto 1fr',
  // blur surface, hairline ALWAYS ON (declared choice).
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  brandMark: {
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  // kidSwitcher — 36px segmented radiogroup, 2 segments minWidth 72,
  // track muted 12px radius, active pill card + hairline.
  kidSwitcher: {
    display: 'flex',
    height: 36,
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  kidSegment: {
    minWidth: 72,
    paddingInline: 12,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  kidSegmentOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // TAB BAR — 64px sticky bottom z20, 4 flex-1 items, 24px icon over
  // 11px/500 label, 4px gap.
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
  tabItemOn: {color: BRAND_ACCENT, fontWeight: 600},
  tabIconWrap: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
  // Garden streak badge — 16px-min brand pill, 10px/600, top −4 right −8.
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Large title — 52px block at the 16px gutter (ships static; the navBar
  // center slot is the kidSwitcher, so there is no compact title to fade).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
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
  // TONIGHT CARD — 16px padding: date 22/700, sub 13, ring row, streak.
  tonightCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  tonightDate: {fontSize: 22, fontWeight: 700, margin: 0, fontVariantNumeric: 'tabular-nums'},
  tonightSub: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  ringRow: {display: 'flex', alignItems: 'center', gap: 16},
  ringText: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4},
  ringValue: {fontSize: 16, fontVariantNumeric: 'tabular-nums'},
  streakLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Goal-met banner — brand-tinted band, 13/600 BRAND_TEXT (math above).
  goalBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    paddingInline: 12,
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  // weekStrip — 44px utility rows.
  weekRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  weekDay: {flexShrink: 0, width: 44, fontSize: 16},
  weekBook: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  weekMeta: {
    flexShrink: 0,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  weekMetaQuiet: {
    flexShrink: 0,
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Garden card — SVG + caption + 36px secondary button.
  gardenCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  gardenFigure: {margin: 0},
  gardenCaptionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  legendRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  legendChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  legendDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // SHELF — horizontal scroll-snap rail, 48×96 spine buttons, 8px gaps,
  // ≥24px peek at 320.
  rail: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBlock: 4,
  },
  spineBtn: {
    position: 'relative',
    width: 48,
    height: 96,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    borderRadius: '4px 4px 2px 2px',
    background: 'var(--color-background-muted)',
    // Interactive boundary on the muted fill — CONTROL_EDGE math above.
    border: `1px solid ${CONTROL_EDGE}`,
    overflow: 'hidden',
  },
  spineFillRect: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    background: SPINE_FILL,
  },
  // Solid 16px title band — vertical writing-mode label reads against the
  // CARD surface, never the split fill/unfilled regions.
  spineBand: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: '50%',
    width: 16,
    marginLeft: -8,
    borderRadius: 3,
    background: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spineTitle: {
    writingMode: 'vertical-rl',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    maxHeight: 84,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingTop: 2,
  },
  // Done pile at the rail end — flat 4px-radius books, one 48×96 button.
  donePileBtn: {
    position: 'relative',
    width: 48,
    height: 96,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 3,
    borderRadius: 4,
  },
  doneFlatBook: {
    width: 48,
    height: 18,
    borderRadius: 4,
    border: `1px solid ${CONTROL_EDGE}`,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    paddingInline: 4,
  },
  dotRow: {display: 'flex', justifyContent: 'center'},
  dotHit: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  dot: {width: 8, height: 8, borderRadius: 999, background: CONTROL_EDGE},
  dotOn: {background: BRAND_ACCENT},
  // Sticky footer — bottom 64 rests exactly on the 64px tabBar.
  stickyFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  primaryBtn: {
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
  primaryBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  helperText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    marginBottom: 8,
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom even mid-scroll on tall tabs; flips shell-absolute
  // only while the sheet scroll-locks the shell.
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
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41 inside shell.
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
  // 24px visual grabber zone; the button hit extends to 44px via extra
  // height pulled back with a negative margin (it overlaps the header's
  // empty top strip, never its controls), so layout keeps the 24 + 52 grid.
  grabberZone: {
    width: '100%',
    height: 44,
    marginBottom: -20,
    position: 'relative',
    zIndex: 1,
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
  // MINUTE DIAL — 200px circle; ± buttons in a row BELOW at all widths.
  dialBlock: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 8},
  dialFace: {position: 'relative', width: 200, height: 200, borderRadius: '50%', touchAction: 'none'},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialCenterStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0},
  dialReadout: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  dialUnit: {fontSize: 13, color: 'var(--color-text-secondary)'},
  dialBtnRow: {display: 'flex', gap: 12},
  dialBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  dialBtnDisabled: {opacity: 0.35},
  pipsWrap: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6},
  // pagePips — 4px dots, 4px gap; 36 pips at 60 min = 284px, fits 326.
  pipsRow: {display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, maxWidth: 288},
  pip: {width: 4, height: 4, borderRadius: 999, background: BRAND_ACCENT, flexShrink: 0},
  pipsCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // Book picker — 60px radio rows with 24px selection circles.
  pickerCard: {
    marginTop: 16,
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
  radioCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    // Unchecked interactive boundary — CONTROL_EDGE ≥3:1 vs card.
    border: `2px solid ${CONTROL_EDGE}`,
    display: 'grid',
    placeItems: 'center',
  },
  radioCircleOn: {
    border: 'none',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  radioText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  radioTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  radioMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // BOOKS TAB — 72px media rows with swipe-reveal Log + 44×44 ellipsis.
  bookOuter: {position: 'relative'},
  bookClip: {position: 'relative', overflow: 'hidden'},
  logAction: {
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
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  bookContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  bookRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  coverThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 700,
  },
  bookText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  bookTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bookMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bookPct: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Done rows — 60px with a badge chip.
  doneRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  badgeChip: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Anchored ellipsis menu — 12px radius card, 44px rows, z30 (< scrim 40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 210,
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
  // GARDEN TAB nights — 60px two-line rows + loadMoreRow + terminal caption.
  nightRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  nightIcon: {flexShrink: 0, display: 'grid', placeItems: 'center', color: SPROUT_MUTED},
  nightText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // FAMILY TAB — 72px rows with 40px avatars, 44px total row, 60px goal
  // rows with 32px mini rings; skeleton rows at identical geometry.
  familyRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
    fontSize: 16,
    fontWeight: 700,
  },
  totalRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  goalRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  statusCaption: {
    margin: '8px 32px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  skelWrap: {position: 'relative', overflow: 'hidden'},
  skelRow: {
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
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  shimmerOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 65%, transparent), transparent)',
    pointerEvents: 'none',
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// Ledger (verified by hand): MAYA 10 logged + 3 missed + 1 pending = 14 ✓;
// prior-week sum 20+15+20+25+10+30+20 = 140 ✓; week (Mon Jun 29 – Fri Jul 3)
// 20+15+25 = 60 ✓; window 140+60 = 200 over 10 nights = avg 20 exactly ✓;
// streak current 0 (Jul 2 missed), best 5 (Jun 27 – Jul 1) ✓. THEO 8 + 5 +
// 1 = 14 ✓; prior sum 20+20+15+20 = 75 ✓; week 10+10+10+15 = 45 ✓; window
// 75+45 = 120 over 8 = avg 15 ✓; streak current 5 (Jun 28 – Jul 2, no gap
// vs missed list ✓), best 5. FAMILY: 60+45 = 105 ✓, week nights 3+4 = 7 ✓.
// POST-LOG (dial 20, Wild Robot): Maya week 60→80 (ring 75%→100%), family
// 105→125 = 80+45 ✓, nights 7→8, plants 10→11 (11+3 = 14 ✓), Wild Robot
// 180→192 (fill 60→64px; 192/288 = 2/3 ✓), streak 0→1, badge '1' appears.
// ---------------------------------------------------------------------------

/** Pages read per minute — every night's pages = minutes × 0.6 exactly
 * (20→12, 25→15, 15→9, 10→6, 30→18); declared ONCE. */
const PAGES_PER_MIN = 0.6;

const TONIGHT = 'Fri, Jul 3';
const TONIGHT_DATE = 'Jul 3';

type KidId = 'kid-maya' | 'kid-theo';

const KIDS: Array<{id: KidId; name: string; goalMin: number}> = [
  {id: 'kid-maya', name: 'Maya', goalMin: 80},
  {id: 'kid-theo', name: 'Theo', goalMin: 60},
];

interface NightEntry {
  dateStr: string; // 'Jun 20'
  dayShort: string; // 'Sat'
  weekday: string; // 'Saturday'
  status: 'logged' | 'missed' | 'pending';
  minutes: number; // 0 unless logged; always a multiple of 5
  pages: number; // minutes × PAGES_PER_MIN exactly
  bookId: string | null;
}

interface KidBook {
  id: string;
  title: string;
  totalPages: number;
  pagesRead: number; // LIFETIME pages — the minutes ledger is windowed
  status: 'reading' | 'done';
  finished: string | null; // 'Finished Jun 18'
}

interface KidState {
  nights: NightEntry[];
  books: KidBook[];
  streakBest: number;
}

const night = (
  dateStr: string,
  dayShort: string,
  weekday: string,
  minutes: number | null,
  bookId: string | null,
): NightEntry =>
  minutes == null
    ? {dateStr, dayShort, weekday, status: 'missed', minutes: 0, pages: 0, bookId: null}
    : {dateStr, dayShort, weekday, status: 'logged', minutes, pages: minutes * PAGES_PER_MIN, bookId};

const pendingNight = (dateStr: string, dayShort: string, weekday: string): NightEntry => ({
  dateStr,
  dayShort,
  weekday,
  status: 'pending',
  minutes: 0,
  pages: 0,
  bookId: null,
});

// 14-night window Jun 20 (Sat) – Jul 3 (Fri); indices 9–13 are the school
// week Mon Jun 29 – Fri Jul 3.
const WEEK_START_INDEX = 9;

const MAYA_NIGHTS: NightEntry[] = [
  night('Jun 20', 'Sat', 'Saturday', 20, 'wild-robot'),
  night('Jun 21', 'Sun', 'Sunday', null, null),
  night('Jun 22', 'Mon', 'Monday', 15, 'wild-robot'),
  night('Jun 23', 'Tue', 'Tuesday', 20, 'wild-robot'),
  night('Jun 24', 'Wed', 'Wednesday', 25, 'wild-robot'),
  night('Jun 25', 'Thu', 'Thursday', 10, 'mercy-watson'),
  night('Jun 26', 'Fri', 'Friday', null, null),
  night('Jun 27', 'Sat', 'Saturday', 30, 'wild-robot'),
  night('Jun 28', 'Sun', 'Sunday', 20, 'wild-robot'),
  night('Jun 29', 'Mon', 'Monday', 20, 'wild-robot'),
  night('Jun 30', 'Tue', 'Tuesday', 15, 'mercy-watson'),
  night('Jul 1', 'Wed', 'Wednesday', 25, 'wild-robot'),
  night('Jul 2', 'Thu', 'Thursday', null, null),
  pendingNight('Jul 3', 'Fri', 'Friday'),
];

const THEO_NIGHTS: NightEntry[] = [
  night('Jun 20', 'Sat', 'Saturday', null, null),
  night('Jun 21', 'Sun', 'Sunday', null, null),
  night('Jun 22', 'Mon', 'Monday', 20, 'dog-man'),
  night('Jun 23', 'Tue', 'Tuesday', 20, 'dog-man'),
  night('Jun 24', 'Wed', 'Wednesday', null, null),
  night('Jun 25', 'Thu', 'Thursday', null, null),
  night('Jun 26', 'Fri', 'Friday', 15, 'bad-guys'),
  night('Jun 27', 'Sat', 'Saturday', null, null),
  night('Jun 28', 'Sun', 'Sunday', 20, 'dog-man'),
  night('Jun 29', 'Mon', 'Monday', 10, 'dog-man'),
  night('Jun 30', 'Tue', 'Tuesday', 10, 'bad-guys'),
  night('Jul 1', 'Wed', 'Wednesday', 10, 'dog-man'),
  night('Jul 2', 'Thu', 'Thursday', 15, 'dog-man'),
  pendingNight('Jul 3', 'Fri', 'Friday'),
];

// Spine fill heights are exact: round(pagesRead/total × 96) — Wild Robot
// 180/288 → 60px (post-log 192/288 → 64px); Mercy Watson 20/80 → 24px;
// Dog Man 180/240 → 72px; Bad Guys 36/144 → 24px; the long-titled Last
// Kids 15/304 → 5px sliver (min-fill + spine/row truncation stress — it
// has 0 minutes inside the 14-night window: pagesRead is lifetime, the
// minutes ledger is windowed, so Theo's aggregates stay untouched).
const MAYA_BOOKS: KidBook[] = [
  {id: 'wild-robot', title: 'The Wild Robot', totalPages: 288, pagesRead: 180, status: 'reading', finished: null},
  {
    id: 'mercy-watson',
    title: 'Mercy Watson to the Rescue',
    totalPages: 80,
    pagesRead: 20,
    status: 'reading',
    finished: null,
  },
  {
    id: 'zoey',
    title: 'Zoey and Sassafras',
    totalPages: 96,
    pagesRead: 96,
    status: 'done',
    finished: 'Finished Jun 18',
  },
];

const THEO_BOOKS: KidBook[] = [
  {
    id: 'dog-man',
    title: 'Dog Man: Grime and Punishment',
    totalPages: 240,
    pagesRead: 180,
    status: 'reading',
    finished: null,
  },
  {id: 'bad-guys', title: 'The Bad Guys', totalPages: 144, pagesRead: 36, status: 'reading', finished: null},
  {
    id: 'last-kids',
    title: 'The Last Kids on Earth and the Doomsday Race',
    totalPages: 304,
    pagesRead: 15,
    status: 'reading',
    finished: null,
  },
  {
    id: 'frog-toad',
    title: 'Frog and Toad Are Friends',
    totalPages: 64,
    pagesRead: 64,
    status: 'done',
    finished: 'Finished Jun 25',
  },
];

// ---------------------------------------------------------------------------
// PURE HELPERS — deterministic; djb2 is the ONLY entropy in the garden.
// ---------------------------------------------------------------------------

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function bookById(kid: KidState, id: string | null): KidBook | null {
  if (id == null) return null;
  return kid.books.find(book => book.id === id) ?? null;
}

/** Week minutes — Mon Jun 29 – Fri Jul 3 logged minutes. */
function weekMinutes(kid: KidState): number {
  return kid.nights
    .slice(WEEK_START_INDEX)
    .reduce((sum, entry) => sum + (entry.status === 'logged' ? entry.minutes : 0), 0);
}

function weekNightsLogged(kid: KidState): number {
  return kid.nights.slice(WEEK_START_INDEX).filter(entry => entry.status === 'logged').length;
}

/** Current streak — consecutive logged nights counting back from the most
 * recent non-pending night (Maya: Jul 2 missed → 0; post-log Jul 3 → 1;
 * Theo: Jun 28 – Jul 2 → 5). */
function currentStreak(kid: KidState): number {
  let streak = 0;
  for (let i = kid.nights.length - 1; i >= 0; i--) {
    const entry = kid.nights[i];
    if (entry.status === 'pending') continue;
    if (entry.status === 'missed') break;
    streak += 1;
  }
  return streak;
}

function loggedCount(kid: KidState): number {
  return kid.nights.filter(entry => entry.status === 'logged').length;
}

function missedCount(kid: KidState): number {
  return kid.nights.filter(entry => entry.status === 'missed').length;
}

function windowMinutes(kid: KidState): number {
  return kid.nights.reduce((sum, entry) => sum + entry.minutes, 0);
}

function spineFillPx(book: KidBook): number {
  return Math.round((book.pagesRead / book.totalPages) * 96);
}

function pctRead(book: KidBook): number {
  return Math.floor((book.pagesRead / book.totalPages) * 100);
}

function coverInk(bookId: string): string {
  return COVER_INKS[djb2(bookId) % COVER_INKS.length];
}

/**
 * Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell
 * the two stages apart.
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns scroll. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]');
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
// BRAND MARK — 24px wren-on-book glyph inside the 44×44 leading button.
// ---------------------------------------------------------------------------

function WrenMark() {
  return (
    <span style={styles.brandMark} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* open book */}
        <path
          d="M3 18.5c2.6-1.2 5.4-1.2 9 0 3.6-1.2 6.4-1.2 9 0V8.8c-2.6-1.2-5.4-1.2-9 0-3.6-1.2-6.4-1.2-9 0v9.7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 8.8v9.7" stroke="currentColor" strokeWidth="1.2" />
        {/* perched wren: body, cocked tail, beak */}
        <circle cx="12" cy="5.4" r="2.3" fill="currentColor" />
        <path d="M13.8 4.2l2.4-1.6-1 2.5" fill="currentColor" />
        <circle cx="11.2" cy="4.9" r="0.5" fill="var(--color-background-card)" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// GOAL RING — SVG 72×72, r=32, strokeWidth 8. RING_C = 2π×32 = 201.06;
// dashoffset = RING_C × (1 − min(weekMin/goal, 1)): Maya pre 60/80 → 50.27
// (75%), post 80/80 → 0; Theo 45/60 → 50.27. Decorative-redundant — the
// adjacent 'Maya: 60 of 80 min this week' text carries the value.
// ---------------------------------------------------------------------------

const RING_C = 201.06;

function GoalRing({weekMin, goal, size = 72}: {weekMin: number; goal: number; size?: number}) {
  const ratio = Math.min(weekMin / goal, 1);
  const c = size === 72 ? RING_C : 2 * Math.PI * 12; // mini 32px ring: r=12, C=75.40
  const r = size === 72 ? 32 : 12;
  const sw = size === 72 ? 8 : 4;
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
      {/* Rest track — meaningful remaining-portion fill on the card:
          CONTROL_EDGE ≥3:1 (math at declaration). */}
      <circle cx={mid} cy={mid} r={r} stroke={CONTROL_EDGE} strokeWidth={sw} opacity={0.55} />
      <circle
        cx={mid}
        cy={mid}
        r={r}
        stroke={BRAND_ACCENT}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c.toFixed(2)}
        strokeDashoffset={(c * (1 - ratio)).toFixed(2)}
        transform={`rotate(-90 ${mid} ${mid})`}
        className="wrn-ring-arc"
      />
      {size === 72 ? (
        <>
          <text
            x={mid}
            y={mid + 1}
            textAnchor="middle"
            fontSize={17}
            fontWeight={700}
            fill="var(--color-text-primary)"
            style={{fontVariantNumeric: 'tabular-nums'}}>
            {weekMin}
          </text>
          <text
            x={mid}
            y={mid + 14}
            textAnchor="middle"
            fontSize={11}
            fontWeight={500}
            fill="var(--color-text-secondary)"
            style={{fontVariantNumeric: 'tabular-nums'}}>
            / {goal}
          </text>
        </>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STREAK GARDEN — pure SVG. 14 slots at 23px pitch (14×23 = 322 + 2px
// margins = 326), ground line at groundY. Determinism contract: hash =
// djb2(dateStr + ':' + kidId); species = hash % 5; height = 40 +
// (minutes/5)×4 capped 88 (20 min → 56px); sway = (hash % 7) − 3 deg.
// Missed = 14px two-leaf sprout (SPROUT_MUTED ≥3:1, honest not shaming);
// tonight pending = dashed 12px circle. NO Math.random anywhere.
// ---------------------------------------------------------------------------

const PLANT_COLORS = [BRAND_ACCENT, GREEN_DEEP, GREEN_MOSS];

function plantHead(species: number, color: string): ReactNode {
  switch (species) {
    case 0: // tulip
      return <path d="M-4 0 C-4 -8 -1.5 -11 0 -11 C1.5 -11 4 -8 4 0 Z" fill={BLOOM} />;
    case 1: // fern
      return (
        <g stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round">
          <path d="M0 0 C-6 -3 -8 -8 -5 -13" />
          <path d="M0 0 C6 -3 8 -8 5 -13" />
          <path d="M0 0 L0 -9" />
        </g>
      );
    case 2: // daisy
      return (
        <g>
          <circle cx={0} cy={-4} r={2} fill={BLOOM} />
          <circle cx={-4} cy={-4} r={2} fill={color} />
          <circle cx={4} cy={-4} r={2} fill={color} />
          <circle cx={0} cy={-8} r={2} fill={color} />
          <circle cx={0} cy={0} r={2} fill={color} />
        </g>
      );
    case 3: // bell
      return <path d="M-4 -10 Q0 -15 4 -10 L4 -3 Q0 1 -4 -3 Z" fill={color} />;
    default: // reed
      return (
        <g stroke={color} strokeWidth={1.5} strokeLinecap="round">
          <path d="M-3 0 L-3 -8" />
          <path d="M0 0 L0 -12" />
          <path d="M3 0 L3 -7" />
          <ellipse cx={0} cy={-14} rx={1.8} ry={3.5} fill={color} stroke="none" />
        </g>
      );
  }
}

interface StreakGardenProps {
  nights: NightEntry[];
  kidId: KidId;
  tall?: boolean; // Garden tab: viewBox 326×200
  grownDateStr?: string | null; // the just-logged slot gets the 320ms grow
  label: string;
}

function StreakGarden({nights, kidId, tall = false, grownDateStr = null, label}: StreakGardenProps) {
  const height = tall ? 200 : 140;
  const groundY = tall ? 176 : 120;
  return (
    <figure style={styles.gardenFigure} aria-label={label}>
      <svg
        viewBox={`0 0 326 ${height}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden>
        <line x1={0} y1={groundY} x2={326} y2={groundY} stroke="var(--color-border)" strokeWidth={1} />
        {nights.map((entry, index) => {
          const x = 2 + index * 23 + 11.5; // 23px pitch, 2px margins
          const hash = djb2(`${entry.dateStr}:${kidId}`);
          if (entry.status === 'pending') {
            return (
              <circle
                key={entry.dateStr}
                cx={x}
                cy={groundY - 8}
                r={6}
                stroke={DIAL_TICK}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            );
          }
          if (entry.status === 'missed') {
            // 14px two-leaf sprout.
            return (
              <g key={entry.dateStr} transform={`translate(${x} ${groundY})`} fill={SPROUT_MUTED}>
                <path d="M0 0 C-1 -4 -6 -6 -7 -11 C-2 -10 0 -6 0 -2 Z" />
                <path d="M0 0 C1 -4 6 -6 7 -11 C2 -10 0 -6 0 -2 Z" />
                <path d="M-0.75 0 L-0.75 -3 L0.75 -3 L0.75 0 Z" />
              </g>
            );
          }
          const species = hash % 5;
          const sway = (hash % 7) - 3;
          const h = Math.min(40 + (entry.minutes / 5) * 4, 88);
          const color = PLANT_COLORS[hash % 3];
          const isGrown = grownDateStr === entry.dateStr;
          return (
            <g
              key={entry.dateStr}
              className={isGrown ? 'wrn-grow' : undefined}
              style={
                isGrown
                  ? {transformOrigin: `${x}px ${groundY}px`, transformBox: 'view-box'}
                  : undefined
              }
              transform={`translate(${x} ${groundY}) rotate(${sway})`}>
              <path d={`M0 0 L0 ${-h}`} stroke={color} strokeWidth={2} strokeLinecap="round" />
              <path
                d={`M0 ${-h * 0.45} C-5 ${-h * 0.45 - 4} -6 ${-h * 0.45 - 9} -3 ${-h * 0.45 - 11}`}
                stroke={color}
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
              />
              <g transform={`translate(0 ${-h})`}>{plantHead(species, color)}</g>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// MINUTE DIAL — 200px circle, role='slider', 5-min detents 0–60 over 270°
// (−135° → +135°). 13 detent ticks: majors every 15 min (2×12), minors
// (1.5×8), DIAL_TICK ≥3:1 vs card (math at declaration). Pointer path
// snaps LIVE to the nearest detent (snap + 60ms transform tick = the
// detent physics); mandatory button path: ±5 44×44 buttons below,
// disabled at 0/60 at 35% opacity. Keyboard: arrows ±5, Home 0, End 60.
// ---------------------------------------------------------------------------

const DIAL_MAX = 60;
const DIAL_STEP = 5;
const DIAL_START_DEG = -135;
const DIAL_SWEEP = 270;

function dialDeg(minutes: number): number {
  return DIAL_START_DEG + (minutes / DIAL_MAX) * DIAL_SWEEP;
}

interface MinuteDialProps {
  minutes: number;
  onChange: (minutes: number) => void;
}

function MinuteDial({minutes, onChange}: MinuteDialProps) {
  const faceRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const applyPointer = useCallback(
    (clientX: number, clientY: number) => {
      const face = faceRef.current;
      if (face == null) return;
      const rect = face.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      // 0° at 12 o'clock, clockwise positive; clamp to the 270° sweep.
      const deg = Math.max(-135, Math.min(135, (Math.atan2(dx, -dy) * 180) / Math.PI));
      const raw = ((deg - DIAL_START_DEG) / DIAL_SWEEP) * DIAL_MAX;
      onChange(Math.max(0, Math.min(DIAL_MAX, Math.round(raw / DIAL_STEP) * DIAL_STEP)));
    },
    [onChange],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    applyPointer(event.clientX, event.clientY);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    applyPointer(event.clientX, event.clientY);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = Math.min(DIAL_MAX, minutes + DIAL_STEP);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = Math.max(0, minutes - DIAL_STEP);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = DIAL_MAX;
    if (next != null) {
      event.preventDefault();
      onChange(next);
    }
  };

  const ticks: ReactNode[] = [];
  for (let m = 0; m <= DIAL_MAX; m += DIAL_STEP) {
    const deg = dialDeg(m);
    const rad = (deg * Math.PI) / 180;
    const major = m % 15 === 0;
    const rOuter = 92;
    const rInner = major ? 80 : 84;
    ticks.push(
      <line
        key={m}
        x1={100 + rInner * Math.sin(rad)}
        y1={100 - rInner * Math.cos(rad)}
        x2={100 + rOuter * Math.sin(rad)}
        y2={100 - rOuter * Math.cos(rad)}
        stroke={DIAL_TICK}
        strokeWidth={major ? 2 : 1.5}
        strokeLinecap="round"
      />,
    );
  }

  const pips = Math.round(minutes * PAGES_PER_MIN);

  return (
    <div style={styles.dialBlock}>
      <div
        ref={faceRef}
        role="slider"
        tabIndex={0}
        className="wrn-focusable"
        aria-label="Minutes read tonight"
        aria-valuemin={0}
        aria-valuemax={DIAL_MAX}
        aria-valuenow={minutes}
        aria-valuetext={`${minutes} minutes`}
        style={styles.dialFace}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}>
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" aria-hidden>
          {/* dial boundary — interactive control edge, DIAL_TICK ≥3:1 */}
          <circle cx={100} cy={100} r={98} stroke={DIAL_TICK} strokeWidth={1} opacity={0.6} />
          {ticks}
          {/* 28px brand thumb at the current detent; 60ms transform tick */}
          <g
            className="wrn-thumb"
            style={{
              transform: `rotate(${dialDeg(minutes)}deg)`,
              transformOrigin: '100px 100px',
              transformBox: 'view-box',
            }}>
            <circle cx={100} cy={100 - 62} r={14} fill={BRAND_ACCENT} />
            <circle cx={100} cy={100 - 62} r={4} fill={BRAND_FILL_TEXT} />
          </g>
        </svg>
        <div style={styles.dialCenter}>
          <div style={styles.dialCenterStack}>
            <span style={styles.dialReadout}>{minutes}</span>
            <span style={styles.dialUnit}>minutes</span>
          </div>
        </div>
      </div>
      <div style={styles.dialBtnRow}>
        <button
          type="button"
          className="wrn-btn wrn-focusable"
          style={{...styles.dialBtn, ...(minutes === 0 ? styles.dialBtnDisabled : null)}}
          aria-label="Minus 5 minutes"
          disabled={minutes === 0}
          onClick={() => onChange(Math.max(0, minutes - DIAL_STEP))}>
          <Icon icon={MinusIcon} size="md" color="inherit" />
        </button>
        <button
          type="button"
          className="wrn-btn wrn-focusable"
          style={{...styles.dialBtn, ...(minutes === DIAL_MAX ? styles.dialBtnDisabled : null)}}
          aria-label="Plus 5 minutes"
          disabled={minutes === DIAL_MAX}
          onClick={() => onChange(Math.min(DIAL_MAX, minutes + DIAL_STEP))}>
          <Icon icon={PlusIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.pipsWrap}>
        <div style={styles.pipsRow} aria-hidden>
          {Array.from({length: pips}, (_, index) => (
            <span key={index} style={styles.pip} />
          ))}
        </div>
        <span style={styles.pipsCaption}>about {pips} pages</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button; click toggles
// medium/large, drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X, focus-trapped dialog.
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

function Sheet({
  titleId,
  title,
  detent,
  onDetentChange,
  onClose,
  sheetRef,
  reducedMotion,
  footer,
  children,
}: SheetProps) {
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
      className="wrn-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="wrn-btn wrn-focusable"
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
          className="wrn-btn wrn-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOOK ROW — 72px media row; pointer drag reveals the −72px brand 'Log'
// block (one open at a time) WITH the mandatory trailing 44×44 ellipsis
// opening the identical anchored menu (Log tonight / Mark finished). The
// row is a single <button>; the ellipsis is a SIBLING, never nested.
// ---------------------------------------------------------------------------

interface BookRowProps {
  book: KidBook;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  isFinishing: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onLog: (opener: HTMLElement) => void;
  onFinish: () => void;
}

function BookRow({
  book,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  isFinishing,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onToggleMenu,
  onLog,
  onFinish,
}: BookRowProps) {
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

  const guardClick =
    (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
      if (movedRef.current) {
        movedRef.current = false;
        return;
      }
      handler(event.currentTarget);
    };

  return (
    <div style={styles.bookOuter} className={isFinishing ? 'wrn-finish' : undefined}>
      <div style={styles.bookClip}>
        <button
          type="button"
          className="wrn-btn"
          style={styles.logAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={guardClick(onLog)}>
          <Icon icon={MoonIcon} size="md" color="inherit" />
          Log
        </button>
        <div
          style={{
            ...styles.bookContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="wrn-btn wrn-focusable"
            style={styles.bookRowBtn}
            aria-label={`${book.title}, ${book.pagesRead} of ${book.totalPages} pages — log tonight`}
            onClick={guardClick(onLog)}>
            <span style={{...styles.coverThumb, background: coverInk(book.id)}} aria-hidden>
              {book.title.charAt(0)}
            </span>
            <span style={styles.bookText}>
              <span style={styles.bookTitle}>{book.title}</span>
              <span style={styles.bookMeta}>
                {book.pagesRead} of {book.totalPages} pages
              </span>
            </span>
            <span style={styles.bookPct}>{pctRead(book)}%</span>
          </button>
          <button
            type="button"
            className="wrn-btn wrn-focusable"
            style={styles.iconBtn}
            aria-label={`Actions for ${book.title}`}
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
          aria-label={`Actions for ${book.title}`}
          style={{...styles.anchoredMenu, top: 60}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button
            type="button"
            role="menuitem"
            className="wrn-btn wrn-focusable"
            style={styles.menuRow}
            onClick={event => onLog(event.currentTarget)}>
            <Icon icon={MoonIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Log tonight</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="wrn-btn wrn-focusable"
            style={styles.menuRow}
            onClick={onFinish}>
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Mark finished</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — familyLog: ui + kids keyed by kid id; updateKid(kidId,
// patch) merges kid-scoped patches; every derived value (weekMin, streak,
// plants, fills, familyTotal) is computed, never stored twice. Kid
// selection is GLOBAL, not per-tab (declared).
// ---------------------------------------------------------------------------

type TabId = 'tonight' | 'books' | 'garden' | 'family';

interface ToastState {
  seq: number;
  msg: string;
  undo: boolean;
}

interface SheetState {
  detent: 'medium' | 'large';
  minutes: number;
  bookId: string;
}

interface Snapshot {
  kidId: KidId;
  kid: KidState;
  revertMsg: string;
}

interface FamilyLog {
  activeKidId: KidId;
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  sheet: SheetState | null;
  bookMenuId: string | null;
  swipeOpenId: string | null;
  gardenShownAll: Record<KidId, boolean>;
  familyLoad: 'idle' | 'loading' | 'updated';
  toast: ToastState | null;
  lastSnapshot: Snapshot | null;
  grown: {kidId: KidId; dateStr: string} | null;
  finishingBookId: string | null;
  kids: Record<KidId, KidState>;
}

const INITIAL_LOG: FamilyLog = {
  activeKidId: 'kid-maya',
  tab: 'tonight',
  scrollByTab: {tonight: 0, books: 0, garden: 0, family: 0},
  sheet: null,
  bookMenuId: null,
  swipeOpenId: null,
  gardenShownAll: {'kid-maya': false, 'kid-theo': false},
  familyLoad: 'idle',
  toast: null,
  lastSnapshot: null,
  grown: null,
  finishingBookId: null,
  kids: {
    'kid-maya': {nights: MAYA_NIGHTS, books: MAYA_BOOKS, streakBest: 5},
    'kid-theo': {nights: THEO_NIGHTS, books: THEO_BOOKS, streakBest: 5},
  },
};

const TAB_DEFS: Array<{id: TabId; label: string; icon: typeof MoonIcon}> = [
  {id: 'tonight', label: 'Tonight', icon: MoonIcon},
  {id: 'books', label: 'Books', icon: BookOpenIcon},
  {id: 'garden', label: 'Garden', icon: SproutIcon},
  {id: 'family', label: 'Family', icon: UsersIcon},
];

// Deterministic skeleton widths — primary bars cycle 60/45/70, secondary
// 40/55/30; never Math.random().
const SKEL_WIDTHS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileKidReadingLogTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<FamilyLog>(INITIAL_LOG);
  const toastSeqRef = useRef(0);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const bookMenuRef = useRef<HTMLDivElement | null>(null);
  const switcherRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const nightsListRef = useRef<HTMLDivElement | null>(null);
  const [shelfDot, setShelfDot] = useState(0);

  // The spec's kid-scoped merge helper — every kid mutation routes here.
  const updateKid = useCallback((kidId: KidId, patch: Partial<KidState>) => {
    setStore(prev => ({...prev, kids: {...prev.kids, [kidId]: {...prev.kids[kidId], ...patch}}}));
  }, []);
  void updateKid; // reserved for callers below that inline their snapshot bookkeeping

  const nextToast = (msg: string, undo = false): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };

  // DERIVED — computed, never stored twice.
  const kidMeta = KIDS.find(entry => entry.id === store.activeKidId) ?? KIDS[0];
  const kid = store.kids[store.activeKidId];
  const weekMin = weekMinutes(kid);
  const weekLogged = weekNightsLogged(kid);
  const streak = currentStreak(kid);
  const plants = loggedCount(kid);
  const sprouts = missedCount(kid);
  const avgMin = plants > 0 ? Math.round(windowMinutes(kid) / plants) : 0;
  const tonight = kid.nights[kid.nights.length - 1];
  const tonightPending = tonight.status === 'pending';
  const readingBooks = kid.books.filter(book => book.status === 'reading');
  const doneBooks = kid.books.filter(book => book.status === 'done');
  const goalMet = weekMin >= kidMeta.goalMin;
  const familyTotal = KIDS.reduce((sum, entry) => sum + weekMinutes(store.kids[entry.id]), 0);
  const familyNights = KIDS.reduce((sum, entry) => sum + weekNightsLogged(store.kids[entry.id]), 0);
  const gardenLabel = `Streak garden: ${plants} plants, ${sprouts} missed nights`;
  const grownDateStr = store.grown != null && store.grown.kidId === store.activeKidId ? store.grown.dateStr : null;

  // TAB PERSISTENCE — scrollTop recorded on exit / restored on entry;
  // overlays close on switch, the toast dock persists; re-tapping the
  // active tab scrolls to top (the one legal reset).
  const switchTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === store.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setStore(prev => ({
      ...prev,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      tab,
      sheet: null,
      bookMenuId: null,
      swipeOpenId: null,
    }));
  };
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = store.scrollByTab[store.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tab]);

  // KID SWITCH — whole body swaps in one 200ms opacity cross-fade (keyed
  // wrapper); open overlays close, the toast persists, selection is global.
  const selectKid = (id: KidId) => {
    setStore(prev =>
      prev.activeKidId === id
        ? prev
        : {...prev, activeKidId: id, sheet: null, bookMenuId: null, swipeOpenId: null, grown: null},
    );
  };
  const onSwitcherKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const other = store.activeKidId === 'kid-maya' ? 'kid-theo' : 'kid-maya';
    selectKid(other);
    const radios = switcherRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    radios?.[other === 'kid-maya' ? 0 : 1]?.focus();
  };

  // SHEET LIFECYCLE — focus in with preventScroll (a plain .focus() would
  // scroll-reveal the animating sheet inside the locked overflow-hidden
  // column and beach it mid-screen); restored to opener on every close.
  const openLogSheet = (opener: HTMLElement | null, bookId?: string) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setStore(prev => {
      const activeKid = prev.kids[prev.activeKidId];
      const firstReading = activeKid.books.find(book => book.status === 'reading');
      return {
        ...prev,
        sheet: {detent: 'medium', minutes: 20, bookId: bookId ?? firstReading?.id ?? ''},
        bookMenuId: null,
        swipeOpenId: null,
      };
    });
  };
  const closeSheet = () => {
    setStore(prev => ({...prev, sheet: null}));
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (store.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [store.sheet != null]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeBookMenu = () => {
    setStore(prev => ({...prev, bookMenuId: null}));
    menuOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (store.bookMenuId != null) {
      bookMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
    }
  }, [store.bookMenuId]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.bookMenuId != null) closeBookMenu();
      else if (store.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.bookMenuId, store.sheet != null]);

  // SIGNATURE COMMIT — one beat: night 14 flips to logged, the book's
  // lifetime pages advance (fill 60→64px), the ring closes, the plant
  // grows, the badge mints, Family recomputes, and ONE Undo toast posts.
  // Snapshot-first so Undo reverts every surface in one assignment.
  const commitLog = () => {
    const sheet = store.sheet;
    if (sheet == null || sheet.minutes === 0 || sheet.bookId === '') return;
    setStore(prev => {
      const kidId = prev.activeKidId;
      const activeKid = prev.kids[kidId];
      const idx = activeKid.nights.length - 1;
      const prevNight = activeKid.nights[idx];
      const pages = sheet.minutes * PAGES_PER_MIN;
      let books = activeKid.books;
      // Re-logging tonight first reverts the earlier entry's pages.
      if (prevNight.status === 'logged' && prevNight.bookId != null) {
        books = books.map(book =>
          book.id === prevNight.bookId
            ? {...book, pagesRead: Math.max(0, book.pagesRead - prevNight.pages)}
            : book,
        );
      }
      books = books.map(book =>
        book.id === sheet.bookId
          ? {...book, pagesRead: Math.min(book.totalPages, book.pagesRead + pages)}
          : book,
      );
      const nights = activeKid.nights.map((entry, i) =>
        i === idx
          ? {...entry, status: 'logged' as const, minutes: sheet.minutes, pages, bookId: sheet.bookId}
          : entry,
      );
      return {
        ...prev,
        kids: {...prev.kids, [kidId]: {...activeKid, nights, books}},
        sheet: null,
        lastSnapshot: {kidId, kid: activeKid, revertMsg: 'Log removed'},
        grown: {kidId, dateStr: TONIGHT_DATE},
        toast: nextToast(`Tonight logged · ${sheet.minutes} min`, true),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // MARK FINISHED — reversible, so it executes immediately (undoOverConfirm);
  // the spine tips onto the done pile over 240ms (fade-only removal under
  // reduced motion), then the done row mints its badge chip.
  const finalizeFinish = useCallback((bookId: string) => {
    setStore(prev => {
      const kidId = prev.activeKidId;
      const activeKid = prev.kids[kidId];
      const book = activeKid.books.find(entry => entry.id === bookId);
      if (book == null || book.status === 'done') return {...prev, finishingBookId: null};
      toastSeqRef.current += 1;
      return {
        ...prev,
        kids: {
          ...prev.kids,
          [kidId]: {
            ...activeKid,
            books: activeKid.books.map(entry =>
              entry.id === bookId
                ? {...entry, status: 'done' as const, pagesRead: entry.totalPages, finished: `Finished ${TONIGHT_DATE}`}
                : entry,
            ),
          },
        },
        finishingBookId: null,
        bookMenuId: null,
        swipeOpenId: null,
        lastSnapshot: {kidId, kid: activeKid, revertMsg: `${book.title} is back on the shelf`},
        toast: {seq: toastSeqRef.current, msg: `${book.title} finished — badge earned`, undo: true},
      };
    });
  }, []);
  const finishTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (finishTimerRef.current != null) window.clearTimeout(finishTimerRef.current);
    },
    [],
  );
  const markFinished = (bookId: string) => {
    if (reducedMotion) {
      finalizeFinish(bookId);
      return;
    }
    setStore(prev => ({...prev, finishingBookId: bookId, bookMenuId: null, swipeOpenId: null}));
    finishTimerRef.current = window.setTimeout(() => finalizeFinish(bookId), 240);
  };

  // UNDO — restores the snapshot in ONE assignment: plant, spine fill,
  // ring, banner, badge, family rows, and weekStrip all revert together.
  const undoLast = () => {
    setStore(prev => {
      if (prev.lastSnapshot == null) return prev;
      return {
        ...prev,
        kids: {...prev.kids, [prev.lastSnapshot.kidId]: prev.lastSnapshot.kid},
        lastSnapshot: null,
        grown: null,
        toast: nextToast(prev.lastSnapshot.revertMsg),
      };
    });
  };

  // REFRESH — explicit navBar button (pull-to-refresh is banned). On the
  // Family tab it demonstrates the skeleton; 'Loading' announces once via
  // the toast dock, and the NEXT press of any control resolves it (the
  // click-capture below) to a static 'Updated just now' status.
  const onRefresh = () => {
    setStore(prev =>
      prev.tab === 'family'
        ? {...prev, familyLoad: 'loading', toast: nextToast('Loading')}
        : {...prev, toast: nextToast('Up to date — synced Fri, Jul 3')},
    );
  };
  const onShellClickCapture = () => {
    setStore(prev => (prev.familyLoad === 'loading' ? {...prev, familyLoad: 'updated'} : prev));
  };

  // GARDEN load-more — appends the next 7 fixture nights, focuses the
  // first new row, announces via the one toast dock.
  const showAllNights = () => {
    setStore(prev => ({
      ...prev,
      gardenShownAll: {...prev.gardenShownAll, [prev.activeKidId]: true},
      toast: nextToast('7 more loaded'),
    }));
  };
  const gardenShownAll = store.gardenShownAll[store.activeKidId];
  useEffect(() => {
    if (gardenShownAll) {
      const rows = nightsListRef.current?.querySelectorAll<HTMLElement>('[data-night-row]');
      rows?.[7]?.focus({preventScroll: true});
    }
  }, [gardenShownAll]);

  // SHELF — dots + arrow keys are the carousel's button path.
  const onRailScroll = () => {
    const rail = railRef.current;
    if (rail != null) setShelfDot(Math.min(readingBooks.length, Math.round(rail.scrollLeft / 56)));
  };
  const scrollShelfTo = (index: number) => {
    railRef.current?.scrollTo({left: index * 56, behavior: reducedMotion ? 'auto' : 'smooth'});
  };
  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollShelfTo(Math.min(readingBooks.length, shelfDot + 1));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollShelfTo(Math.max(0, shelfDot - 1));
    }
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(store.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const sheetMinutes = store.sheet?.minutes ?? 0;
  const sheetPages = Math.round(sheetMinutes * PAGES_PER_MIN);
  const nightsNewestFirst = kid.nights.slice().reverse();
  const visibleNights = gardenShownAll ? nightsNewestFirst : nightsNewestFirst.slice(0, 7);
  // toastDock — sticky-in-flow above the tabBar (76); above the Tonight
  // sticky footer too (64 tabBar + 80 footer + 12 = 156); shell-absolute
  // ONLY while the sheet scroll-locks the shell.
  const toastAnchorStyle: CSSProperties =
    store.sheet != null
      ? styles.toastAnchorLocked
      : {...styles.toastAnchor, bottom: store.tab === 'tonight' ? 156 : 76};

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{WREN_CSS}</style>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div ref={shellRef} style={shellStyle} onClickCapture={onShellClickCapture}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="wrn-btn wrn-focusable"
              style={styles.iconBtn}
              aria-label="Wrenling — back to top"
              onClick={() => {
                const scroller = getScrollParent(shellRef.current);
                if (scroller != null) scroller.scrollTop = 0;
              }}>
              <WrenMark />
            </button>
          </div>
          <div
            ref={switcherRef}
            role="radiogroup"
            aria-label="Choose child"
            style={styles.kidSwitcher}
            onKeyDown={onSwitcherKeyDown}>
            {KIDS.map(entry => {
              const isOn = entry.id === store.activeKidId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  tabIndex={isOn ? 0 : -1}
                  className="wrn-btn wrn-focusable"
                  style={{...styles.kidSegment, ...(isOn ? styles.kidSegmentOn : null)}}
                  onClick={() => selectKid(entry.id)}>
                  {entry.name}
                </button>
              );
            })}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="wrn-btn wrn-focusable"
              style={styles.iconBtn}
              aria-label="Refresh"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* Keyed wrapper — the 200ms kid cross-fade (opacity only). */}
        <main key={store.activeKidId} className={reducedMotion ? undefined : 'wrn-kidfade'} style={styles.main}>
          {store.tab === 'tonight' ? (
            <>
              <h1 style={styles.largeTitle}>Tonight</h1>
              <div style={styles.tonightCard}>
                <div>
                  <h2 style={styles.tonightDate}>{TONIGHT}</h2>
                  <div style={styles.tonightSub}>
                    Night {weekLogged + (tonightPending ? 1 : 0)} of {kidMeta.name}&rsquo;s week
                  </div>
                </div>
                <div style={styles.ringRow}>
                  <GoalRing weekMin={weekMin} goal={kidMeta.goalMin} />
                  <div style={styles.ringText}>
                    <span style={styles.ringValue}>
                      {kidMeta.name}: {weekMin} of {kidMeta.goalMin} min this week
                    </span>
                    <span style={styles.streakLine}>
                      {streak} night streak · best {kid.streakBest}
                    </span>
                  </div>
                </div>
                {goalMet ? (
                  <div style={styles.goalBanner}>
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                    Weekly goal met
                  </div>
                ) : null}
              </div>

              <h2 style={styles.sectionHeader}>This week</h2>
              <div style={styles.listCard}>
                {kid.nights.slice(WEEK_START_INDEX).map((entry, index) => {
                  const book = bookById(kid, entry.bookId);
                  const name =
                    entry.status === 'logged'
                      ? `${entry.weekday}, ${entry.minutes} minutes${book != null ? `, ${book.title}` : ''}`
                      : entry.status === 'missed'
                        ? `${entry.weekday}, missed`
                        : `${entry.weekday}, not logged yet`;
                  return (
                    <div key={entry.dateStr}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        className="wrn-btn wrn-focusable"
                        style={styles.weekRow}
                        aria-label={`${name} — see all nights`}
                        onClick={() => switchTab('garden')}>
                        <span style={styles.weekDay}>{entry.dayShort}</span>
                        <span style={styles.weekBook}>{book != null ? book.title : ''}</span>
                        {entry.status === 'logged' ? (
                          <span style={styles.weekMeta}>
                            {entry.minutes} min · {entry.pages} pages
                          </span>
                        ) : (
                          <span style={styles.weekMetaQuiet}>
                            {entry.status === 'missed' ? 'Missed' : 'Not logged yet'}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <h2 style={styles.sectionHeader}>Streak garden</h2>
              <div style={styles.gardenCard}>
                <StreakGarden
                  nights={kid.nights}
                  kidId={store.activeKidId}
                  grownDateStr={grownDateStr}
                  label={gardenLabel}
                />
                <div style={styles.gardenCaptionRow}>
                  <span style={{flex: 1}}>
                    {plants} plants · {sprouts} sprouts
                  </span>
                  <button
                    type="button"
                    className="wrn-btn wrn-focusable"
                    style={styles.secondaryBtn}
                    onClick={() => switchTab('garden')}>
                    View all nights
                  </button>
                </div>
              </div>

              <h2 style={styles.sectionHeader}>On the shelf</h2>
              <div
                ref={railRef}
                role="group"
                tabIndex={0}
                className="wrn-focusable"
                aria-label={`${kidMeta.name}'s bookshelf`}
                style={styles.rail}
                onScroll={onRailScroll}
                onKeyDown={onRailKeyDown}>
                {readingBooks.map(book => {
                  const fill = spineFillPx(book);
                  return (
                    <button
                      key={book.id}
                      type="button"
                      className="wrn-btn wrn-focusable"
                      style={styles.spineBtn}
                      aria-label={`${book.title}, ${book.pagesRead} of ${book.totalPages} pages`}
                      onClick={event => openLogSheet(event.currentTarget, book.id)}>
                      <span style={{...styles.spineFillRect, height: fill}} aria-hidden />
                      <span style={styles.spineBand} aria-hidden>
                        <span style={styles.spineTitle}>{book.title}</span>
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="wrn-btn wrn-focusable"
                  style={styles.donePileBtn}
                  aria-label={`Done pile: ${doneBooks.map(book => book.title).join(', ') || 'empty'}`}
                  onClick={() => switchTab('books')}>
                  {doneBooks.map(book => (
                    <span key={book.id} style={styles.doneFlatBook}>
                      {book.title}
                    </span>
                  ))}
                </button>
              </div>
              <div style={styles.dotRow}>
                {[...readingBooks.map(book => book.title), 'Done pile'].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className="wrn-btn wrn-focusable"
                    style={styles.dotHit}
                    aria-label={`Go to ${label}`}
                    onClick={() => scrollShelfTo(index)}>
                    <span style={{...styles.dot, ...(index === shelfDot ? styles.dotOn : null)}} aria-hidden />
                  </button>
                ))}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {store.tab === 'books' ? (
            <>
              <h1 className="wrn-vh">Books</h1>
              <h2 style={styles.sectionHeader}>Reading now</h2>
              <div style={styles.listCard}>
                {readingBooks.map((book, index) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    isSwipeOpen={store.swipeOpenId === book.id}
                    isMenuOpen={store.bookMenuId === book.id}
                    isLast={index === readingBooks.length - 1}
                    isFinishing={store.finishingBookId === book.id}
                    reducedMotion={reducedMotion}
                    menuRef={bookMenuRef}
                    onSwipeOpen={() =>
                      setStore(prev => ({...prev, swipeOpenId: book.id, bookMenuId: null}))
                    }
                    onSwipeClose={() =>
                      setStore(prev =>
                        prev.swipeOpenId === book.id ? {...prev, swipeOpenId: null} : prev,
                      )
                    }
                    onToggleMenu={opener => {
                      menuOpenerRef.current = opener;
                      setStore(prev => ({
                        ...prev,
                        bookMenuId: prev.bookMenuId === book.id ? null : book.id,
                        swipeOpenId: null,
                      }));
                    }}
                    onLog={opener => openLogSheet(opener, book.id)}
                    onFinish={() => markFinished(book.id)}
                  />
                ))}
              </div>
              <h2 style={styles.sectionHeader}>Done pile</h2>
              <div style={styles.listCard}>
                {doneBooks.map((book, index) => (
                  <div key={book.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.doneRow}>
                      <span style={{...styles.coverThumb, width: 32, height: 32, fontSize: 13, borderRadius: 8, background: coverInk(book.id)}} aria-hidden>
                        {book.title.charAt(0)}
                      </span>
                      <span style={styles.bookText}>
                        <span style={styles.bookTitle}>{book.title}</span>
                        <span style={styles.bookMeta}>{book.totalPages} pages</span>
                      </span>
                      <span style={styles.badgeChip}>{book.finished}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {store.tab === 'garden' ? (
            <>
              <h1 className="wrn-vh">Streak garden</h1>
              <h2 style={styles.sectionHeader}>14 nights</h2>
              <div style={styles.gardenCard}>
                <StreakGarden
                  nights={kid.nights}
                  kidId={store.activeKidId}
                  tall
                  grownDateStr={grownDateStr}
                  label={gardenLabel}
                />
                <div style={styles.legendRow}>
                  <span style={styles.legendChip}>
                    <span style={{...styles.legendDot, background: BRAND_ACCENT}} aria-hidden />
                    Logged night
                  </span>
                  <span style={styles.legendChip}>
                    <span style={{...styles.legendDot, background: SPROUT_MUTED}} aria-hidden />
                    Missed
                  </span>
                  <span style={styles.legendChip}>
                    <span
                      style={{...styles.legendDot, background: 'transparent', border: `1.5px dashed ${DIAL_TICK}`}}
                      aria-hidden
                    />
                    Tonight
                  </span>
                </div>
                <div style={styles.gardenCaptionRow}>
                  <span>
                    {plants} plants · {sprouts} sprouts · Avg {avgMin} min
                  </span>
                </div>
              </div>

              <h2 style={styles.sectionHeader}>Nights</h2>
              <div style={styles.listCard} ref={nightsListRef}>
                {visibleNights.map((entry, index) => {
                  const book = bookById(kid, entry.bookId);
                  return (
                    <div key={entry.dateStr}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.nightRow} data-night-row tabIndex={-1}>
                        {entry.status === 'missed' ? (
                          <span style={styles.nightIcon} aria-hidden>
                            <Icon icon={SproutIcon} size="sm" color="inherit" />
                          </span>
                        ) : null}
                        <span style={styles.nightText}>
                          <span style={styles.bookTitle}>
                            {entry.dayShort} {entry.dateStr}
                          </span>
                          <span style={styles.bookMeta}>
                            {entry.status === 'logged'
                              ? `${entry.minutes} min · ${book != null ? book.title : ''}`
                              : entry.status === 'missed'
                                ? 'Missed'
                                : 'Not logged yet'}
                          </span>
                        </span>
                        {entry.status === 'logged' ? (
                          <span style={styles.bookPct}>{entry.pages} pages</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {!gardenShownAll ? (
                  <>
                    <div style={styles.rowDivider} />
                    <button
                      type="button"
                      className="wrn-btn wrn-focusable"
                      style={styles.loadMoreRow}
                      onClick={showAllNights}>
                      Show 7 more
                    </button>
                  </>
                ) : null}
              </div>
              {gardenShownAll ? <p style={styles.terminalCaption}>All 14 nights</p> : null}
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {store.tab === 'family' ? (
            <>
              <h1 className="wrn-vh">Family</h1>
              <h2 style={styles.sectionHeader}>This week</h2>
              {store.familyLoad === 'loading' ? (
                <div style={{...styles.listCard, ...styles.skelWrap}} aria-busy="true">
                  {SKEL_WIDTHS.map(([primary, secondary], index) => (
                    <div key={primary}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <div style={styles.skelRow} aria-hidden="true">
                        <span style={styles.skelCircle} />
                        <span style={styles.skelBars}>
                          <span style={{...styles.skelBar, width: primary}} />
                          <span style={{...styles.skelBar, width: secondary}} />
                        </span>
                      </div>
                    </div>
                  ))}
                  <div style={styles.shimmerOverlay} className="wrn-shimmer" aria-hidden="true" />
                </div>
              ) : (
                <div style={styles.listCard}>
                  {KIDS.map((entry, index) => {
                    const entryKid = store.kids[entry.id];
                    const min = weekMinutes(entryKid);
                    const nightsN = weekNightsLogged(entryKid);
                    return (
                      <div key={entry.id}>
                        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                        <button
                          type="button"
                          className="wrn-btn wrn-focusable"
                          style={styles.familyRow}
                          aria-label={`${entry.name}: ${min} of ${entry.goalMin} minutes, ${nightsN} nights — switch to ${entry.name}`}
                          onClick={() => selectKid(entry.id)}>
                          <span style={styles.avatar} aria-hidden>
                            {entry.name.charAt(0)}
                          </span>
                          <span style={styles.bookText}>
                            <span style={styles.bookTitle}>{entry.name}</span>
                            <span style={styles.bookMeta}>
                              {min} of {entry.goalMin} min · {nightsN} nights
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                  <div style={styles.rowDivider} />
                  <div style={styles.totalRow}>
                    <span style={{flex: 1}}>Family total</span>
                    <span>
                      {familyTotal} min · {familyNights} nights
                    </span>
                  </div>
                </div>
              )}
              {store.familyLoad === 'updated' ? (
                <p style={styles.statusCaption} role="status">
                  Updated just now
                </p>
              ) : null}

              <h2 style={styles.sectionHeader}>Teacher goals</h2>
              <div style={styles.listCard}>
                {KIDS.map((entry, index) => {
                  const entryKid = store.kids[entry.id];
                  const min = weekMinutes(entryKid);
                  return (
                    <div key={entry.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.goalRow}>
                        <GoalRing weekMin={min} goal={entry.goalMin} size={32} />
                        <span style={styles.bookText}>
                          <span style={styles.bookTitle}>{entry.name}</span>
                          <span style={styles.bookMeta}>
                            {min} of {entry.goalMin} min this week
                          </span>
                        </span>
                        <span style={styles.bookPct}>
                          {Math.min(100, Math.round((min / entry.goalMin) * 100))}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}
        </main>

        {store.tab === 'tonight' ? (
          <div style={styles.stickyFooter}>
            <button
              type="button"
              className="wrn-btn wrn-focusable"
              style={styles.primaryBtn}
              onClick={event => openLogSheet(event.currentTarget)}>
              {tonightPending ? 'Log tonight' : `Adjust tonight · ${tonight.minutes} min`}
            </button>
          </div>
        ) : null}

        {/* The ONE polite live region — always mounted. */}
        <div style={toastAnchorStyle} aria-live="polite">
          {store.toast != null ? (
            <div key={store.toast.seq} style={styles.toast} className="wrn-fade">
              <span style={styles.toastMsg}>{store.toast.msg}</span>
              {store.toast.undo ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="wrn-btn wrn-focusable" style={styles.toastUndo} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Tabs">
          {TAB_DEFS.map(tabDef => {
            const isOn = store.tab === tabDef.id;
            const showBadge = tabDef.id === 'garden' && streak >= 1;
            return (
              <button
                key={tabDef.id}
                type="button"
                className="wrn-btn wrn-focusable"
                style={{...styles.tabItem, ...(isOn ? styles.tabItemOn : null)}}
                aria-current={isOn ? 'page' : undefined}
                aria-label={
                  showBadge ? `${tabDef.label} — ${streak} night streak` : tabDef.label
                }
                onClick={() => switchTab(tabDef.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tabDef.icon} size="md" color="inherit" />
                  {showBadge ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {streak}
                    </span>
                  ) : null}
                </span>
                {tabDef.label}
              </button>
            );
          })}
        </nav>

        {store.sheet != null ? (
          <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        ) : null}
        {store.sheet != null ? (
          <Sheet
            titleId="wrn-log-title"
            title="Log tonight"
            detent={store.sheet.detent}
            onDetentChange={detent =>
              setStore(prev =>
                prev.sheet != null ? {...prev, sheet: {...prev.sheet, detent}} : prev,
              )
            }
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <>
                {sheetMinutes === 0 ? (
                  <div style={styles.helperText} id="wrn-log-helper">
                    Pick at least 5 minutes
                  </div>
                ) : null}
                <button
                  type="button"
                  className="wrn-btn wrn-focusable"
                  style={{...styles.primaryBtn, ...(sheetMinutes === 0 ? styles.primaryBtnDisabled : null)}}
                  disabled={sheetMinutes === 0}
                  aria-describedby={sheetMinutes === 0 ? 'wrn-log-helper' : undefined}
                  onClick={commitLog}>
                  {sheetMinutes === 0 ? 'Log it' : `Log it · ${sheetMinutes} min`}
                </button>
              </>
            }>
            <MinuteDial
              minutes={sheetMinutes}
              onChange={minutes =>
                setStore(prev =>
                  prev.sheet != null ? {...prev, sheet: {...prev.sheet, minutes}} : prev,
                )
              }
            />
            <div
              role="radiogroup"
              aria-label="Which book?"
              style={styles.pickerCard}
              onKeyDown={event => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                event.preventDefault();
                const radios = Array.from(
                  event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'),
                );
                const index = radios.indexOf(document.activeElement as HTMLElement);
                const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
                const target = radios[(next + radios.length) % radios.length];
                target?.focus();
                target?.click();
              }}>
              {readingBooks.map((book, index) => {
                const isOn = store.sheet?.bookId === book.id;
                return (
                  <div key={book.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isOn}
                      tabIndex={isOn ? 0 : -1}
                      className="wrn-btn wrn-focusable"
                      style={styles.radioRow}
                      onClick={() =>
                        setStore(prev =>
                          prev.sheet != null
                            ? {...prev, sheet: {...prev.sheet, bookId: book.id}}
                            : prev,
                        )
                      }>
                      <span style={{...styles.radioCircle, ...(isOn ? styles.radioCircleOn : null)}} aria-hidden>
                        {isOn ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                      </span>
                      <span style={styles.radioText}>
                        <span style={styles.radioTitle}>{book.title}</span>
                        <span style={styles.radioMeta}>
                          {book.pagesRead} of {book.totalPages} pages
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
            {sheetMinutes > 0 ? (
              <p style={{...styles.pipsCaption, textAlign: 'center', marginTop: 12}}>
                {sheetMinutes} min ≈ {sheetPages} pages tonight
              </p>
            ) : null}
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
