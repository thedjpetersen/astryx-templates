// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Zerohour Spring 2026 study plan
 *   frozen at TODAY = Mon May 11, 2026 (no Date.now, no Math.random, no
 *   network media). Three exams converge as hard stops: Chemistry 201
 *   (Thu May 14 · 9:00 AM, 3d out, target 750m, done 450m, scheduled 270m
 *   → readiness 96%), Calculus II (Mon May 18 · 1:30 PM, 7d, 960/240/480
 *   → 75%), Microeconomics 110 (Fri May 22 · 9:00 AM, 11d, 600/75/405 →
 *   80%). Twelve-day table cross-checked to the minute: total scheduled
 *   1155m = sum of day loads; capacity 1860m; slack 705m; completed 765m
 *   ('12h 45m studied'); last-7-days bars [60,90,45,90,60,0,75] = 420m.
 * @output Zerohour — Exam Countdown Planner: a 390px MOBILE study planner
 *   built on one premise: skipped time has to go somewhere. A
 *   CountdownSpine renders every remaining day (May 12–22) as a capacity
 *   bar with allocated session blocks converging on immovable exam
 *   hard-stop rows. Tapping Skip on today's Chemistry 90m mounts a
 *   ReplanDiffStrip showing exactly which future days absorb the
 *   displaced minutes as +45m chips — Tue 12 lands at exactly 180/180
 *   (full, teal) and Wed 13 overflows by 30 (amber past the capacity
 *   tick) because the Thu hard stop leaves only two absorbing days.
 *   Accepting ripples through ONE planStore reducer pass: Chem readiness
 *   96→92, the chip rail flips amber, the Stats streak tile 9→0, skips
 *   2→3, and the sticky toastDock offers Undo (exact restore, then
 *   'Restored'). A two-detent LoadBalancer sheet rebalances per-subject
 *   minutes via drag handles mirrored by steppers; a SessionEditor sheet
 *   edits duration/start and deletes via undo-over-confirm.
 * @position Page template; emitted by `astryx template
 *   mobile-exam-countdown-planner`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheets,
 *   menus) are position:'absolute' INSIDE shell; position:fixed is
 *   banned. While a sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 after leading rings); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Zerohour teal); the sanctioned non-brand literals are
 *   the CALC violet pair, the MICRO rose pair, and OVERLOAD_AMBER — each
 *   a light-dark() pair with contrast math at the declaration, all
 *   ≥3:1 against the muted capacity-bar track they rest on (amendment:
 *   rest fills are measured against their ACTUAL surface).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', scroll-wired hairline
 *   + title fade via IntersectionObserver sentinel — declared choice);
 *   largeTitle row 52px (28/700 at 16px gutter; total large header
 *   104px); chipRail 64px snap rail (44px chips, radius 999, ≥24px
 *   peek); rows 44px utility / 60px two-line session (16/500 + 13/400,
 *   2px gap) / 72px exam media (48px ReadinessRing); sectionHeader
 *   13/600 uppercase 0.06em at 32px, 20px top / 8px bottom; tabBar
 *   exactly 64px sticky bottom z20 (4 tabs, 24px icon over 11/500
 *   label); toastDock STICKY-IN-FLOW at bottom:76 above the tab bar
 *   (shell-absolute only while a sheet has scroll-locked the shell);
 *   sheets 55% medium / calc(100% − 56px) large, 24px grabber zone with
 *   36×5 pill, 52px sheet header, 48px sheet-footer primary. TYPE
 *   (Figtree via --font-family-body): 28/700 large title · 22/700
 *   section titles + countdown numerals · 17/600 nav+card titles ·
 *   16/400 body floor · 13/400 meta · 11/500 chips+tab labels; nothing
 *   under 11px; tabular-nums on every minute/percent/countdown numeral.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   Skip is a 36px secondary inside a 44px padded hit; every gesture
 *   (sheet drag, balancer handle drag) has a visible button path.
 *
 * Responsive contract:
 * - Fluid 320–430px: zero width literals; capacity-bar geometry is
 *   percentage-of-track (minutes / max(load, capacity)); chip rail and
 *   StatsBarChart overflow horizontally with snap + ≥24px peek instead
 *   of shrinking below 44px targets; session rows keep 60px and
 *   ellipsize ('Microeconomics 110' is the stress string); spine left
 *   rail fixed 44px, bar column flex:1 minWidth:0.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — the spine anatomy is
 *   deliberately phone geometry.
 */

import {useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  BarChart3Icon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  FlagIcon,
  GripVerticalIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SettingsIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. Amendment honored: subject rest fills are checked against
// the muted bar track (their ACTUAL surface), not just the body background.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Zerohour teal). #0E7C86 on #FFFFFF = 5.4:1;
// #5EEAD4 on the dark card (~#1C1917) = 9.8:1. Against the light muted track
// (~#F5F5F4) #0E7C86 ≈ 4.9:1 and against the dark muted track (~#292524)
// #5EEAD4 ≈ 8.9:1 — both clear the ≥3:1 rest-fill floor.
const BRAND_ACCENT = 'light-dark(#0E7C86, #5EEAD4)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #0E7C86 = 5.4:1; dark side flips
// to near-black teal — #042F33 on #5EEAD4 ≈ 10.2:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #042F33)';
// Subject palette. CHEM = BRAND_ACCENT (above).
// CALC violet: #6D28D9 on #FFF ≈ 6.6:1, vs light muted track ≈ 6.0:1;
// #C4B5FD on dark card ≈ 8.6:1, vs dark muted track ≈ 7.8:1. All ≥3:1.
const CALC_COLOR = 'light-dark(#6D28D9, #C4B5FD)';
// MICRO rose: #BE185D on #FFF ≈ 5.9:1, vs light muted track ≈ 5.4:1;
// #F9A8D4 on dark card ≈ 9.3:1, vs dark muted track ≈ 8.4:1. All ≥3:1.
const MICRO_COLOR = 'light-dark(#BE185D, #F9A8D4)';
// Overload amber: #B45309 on the white card ≈ 4.6:1 (passes 4.5:1 for the
// 11px '30m over' suffix); #FCD34D on the dark card ≈ 10.9:1. Vs the light
// muted track ≈ 4.2:1 and the dark muted track ≈ 9.9:1 — both ≥3:1 as an
// overflow-segment fill.
const OVERLOAD_AMBER = 'light-dark(#B45309, #FCD34D)';
// Text over an OVERLOAD_AMBER fill: #FFFFFF on #B45309 ≈ 4.6:1; #3D2A00 on
// #FCD34D ≈ 9.6:1.
const AMBER_FILL_TEXT = 'light-dark(#FFFFFF, #3D2A00)';
// 12% washes for chip fills / active tints (decorative, behind ≥4.5:1 text).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const AMBER_TINT_12 = `color-mix(in srgb, ${OVERLOAD_AMBER} 12%, transparent)`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Switch OFF track — foundations inputControls literal, repeated verbatim.
const SWITCH_OFF = 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))';

const SUBJECT_COLOR: Record<SubjId, string> = {
  chem: BRAND_ACCENT,
  calc: CALC_COLOR,
  micro: MICRO_COLOR,
};

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, focus-visible ring, visually-hidden, and the
// reduced-motion guard. Transitions animate transform/opacity/color only and
// collapse to instant under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const ZH_CSS = `
.zh-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.zh-btn:disabled { cursor: default; }
.zh-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.zh-anim { transition: transform 240ms ease, opacity 240ms ease; }
.zh-fade { transition: opacity 200ms ease; }
.zh-grow { transition: height 200ms ease; }
@keyframes zh-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.zh-sheet-in { animation: zh-sheet-in 240ms ease; }
@keyframes zh-strip-in {
  from { transform: translateY(-6px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.zh-strip-in { animation: zh-strip-in 240ms ease; }
.zh-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.zh-rail { scrollbar-width: none; }
.zh-rail::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .zh-anim, .zh-fade, .zh-grow { transition: none; }
  .zh-sheet-in, .zh-strip-in { animation: none; }
}
`;

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
  // NAV BAR — 52px sticky top z20; hairline + center title are SCROLL-WIRED
  // via the IntersectionObserver sentinel under the large title.
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
    borderBottom: '1px solid transparent',
  },
  navBarScrolled: {borderBottom: '1px solid var(--color-border)'},
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
    opacity: 0,
  },
  navTitleOn: {opacity: 1},
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
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
  brandSlot: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // LARGE TITLE — 52px row below navBar, 28/700 at the 16px gutter.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // CHIP RAIL — 64px block, horizontal snap, 44px chips, radius 999.
  chipRail: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
  },
  examChip: {
    height: 44,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // TODAY CARD header — 17/600 date + 13 tabular planned meta.
  todayHeader: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  todayTitle: {fontSize: 17, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  todayMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // 60px two-line session row: row button + trailing Skip + 44×44 ellipsis.
  sessionRowWrap: {position: 'relative', display: 'flex', alignItems: 'center', paddingInlineEnd: 4},
  sessionRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  sessionPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sessionSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subjectDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  replanTag: {
    fontSize: 11,
    fontWeight: 600,
    color: OVERLOAD_AMBER,
    flexShrink: 0,
  },
  // 36px secondary inline button inside a 44px-tall padded hit.
  secondaryBtnHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  secondaryBtnBrand: {color: BRAND_ACCENT, borderColor: BRAND_ACCENT},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  cardFooterRow: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingInline: 16,
  },
  // Anchored ellipsis menu — 12px radius card, 44px rows, z30 (< scrim z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    top: 54,
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
  // REPLAN DIFF STRIP — in-flow card below TodayCard.
  diffStrip: {
    marginInline: 16,
    marginTop: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  diffStripAmber: {border: `1px solid ${OVERLOAD_AMBER}`},
  diffTitle: {fontSize: 16, fontWeight: 500},
  diffChips: {display: 'flex', flexWrap: 'wrap', gap: 8},
  diffChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  diffPreviewRow: {display: 'flex', flexDirection: 'column', gap: 8},
  diffPreviewLine: {display: 'flex', alignItems: 'center', gap: 8},
  diffPreviewLabel: {
    width: 56,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  diffFooter: {display: 'flex', alignItems: 'center', gap: 16},
  // COUNTDOWN SPINE — left rail 44px joined by 2px spine line; bar col flex.
  spine: {marginInline: 16, display: 'flex', flexDirection: 'column'},
  spineRow: {position: 'relative', display: 'flex', gap: 12},
  spineRail: {
    width: 44,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
    gap: 0,
  },
  spineDow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  spineNum: {fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2},
  spineLine: {
    position: 'absolute',
    left: 21,
    top: 0,
    bottom: 0,
    width: 2,
    background: 'var(--color-border)',
  },
  spineRailInner: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--color-background-body)',
    paddingBlock: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dayBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
    paddingBlock: 10,
    paddingInlineEnd: 4,
    borderRadius: 8,
  },
  dayHeaderLine: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    minWidth: 0,
  },
  dayLabel: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  dayLoad: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  dayLoadOver: {color: OVERLOAD_AMBER, fontWeight: 600},
  // DayCapacityBar — 12px track, radius 6, blocks clipped by the track.
  capTrack: {
    position: 'relative',
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    display: 'flex',
  },
  capBlock: {height: '100%', flexShrink: 0},
  capTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    background: 'var(--color-text-primary)',
  },
  ghostBlock: {
    height: '100%',
    flexShrink: 0,
    boxSizing: 'border-box',
    background: 'transparent',
  },
  // Hard-stop row — 44px, 3px leading subject border, no bar.
  hardStopRow: {
    flex: 1,
    minWidth: 0,
    height: 44,
    marginBlock: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
  hardStopText: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dayExpand: {display: 'flex', flexDirection: 'column'},
  // EXAM CARDS — 72px media rows with 48px ReadinessRing.
  examRowBtn: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  examText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  examName: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  examDate: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  examCountdown: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  detailStatRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  detailStatLabel: {color: 'var(--color-text-secondary)', fontSize: 16},
  detailStatValue: {fontVariantNumeric: 'tabular-nums', fontWeight: 500},
  miniSpineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    paddingInline: 16,
  },
  miniSpineLabel: {
    width: 56,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  miniSpineMin: {
    width: 44,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // STATS — tiles + bar chart + split bars.
  tileGrid: {
    marginInline: 16,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  tile: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  tileValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2},
  tileLabel: {fontSize: 13, color: 'var(--color-text-secondary)'},
  tileCaptionAmber: {fontSize: 11, fontWeight: 600, color: OVERLOAD_AMBER},
  chartWrap: {
    padding: '16px 16px 8px',
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
  },
  chartBarBtn: {
    minWidth: 44,
    flex: 1,
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderRadius: 8,
    paddingBlock: 4,
  },
  chartValue: {fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)'},
  chartCol: {
    width: 24,
    borderRadius: '4px 4px 0 0',
    background: BRAND_ACCENT,
  },
  chartDay: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  splitRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  splitName: {
    width: 96,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  splitTrack: {
    flex: 1,
    minWidth: 0,
    height: 8,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  splitMin: {
    width: 48,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // SETTINGS — 44px utility rows.
  utilityRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left'},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 52,
    textAlign: 'right',
  },
  stepperTrack: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperDividerV: {width: 1, background: 'var(--color-border)', flexShrink: 0},
  pillBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  inlinePanel: {
    padding: '8px 16px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    position: 'relative',
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: 999,
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
  },
  // TAB BAR — exactly 64px, sticky bottom z20.
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
  tabItemActive: {color: 'var(--color-brand)'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — STICKY-IN-FLOW at bottom 76 above the 64px tabBar
  // (amendment: shell-absolute pins to the DOCUMENT bottom on tall scrolling
  // views; sticky stays in the viewport). Shell-absolute variant used only
  // while a sheet has scroll-locked the shell.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    insetInline: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
    minHeight: 0,
  },
  toastDockAbsolute: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    pointerEvents: 'auto',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-brand)',
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
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetFooterMeta: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  primaryBtn: {
    height: 48,
    paddingInline: 24,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  primaryBtnFull: {width: '100%'},
  // LOAD BALANCER rows — 72px per subject.
  balancerRow: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 8,
  },
  balancerText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  balancerName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  balancerMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  allocTrackWrap: {display: 'flex', alignItems: 'center', gap: 4},
  allocTrack: {
    flex: 1,
    minWidth: 0,
    height: 10,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  dragHandle: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    touchAction: 'none',
    flexShrink: 0,
  },
  flagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    fontSize: 13,
    fontWeight: 500,
    color: OVERLOAD_AMBER,
    fontVariantNumeric: 'tabular-nums',
  },
  editorField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingBlock: 8,
  },
  destructiveBtn: {
    width: '100%',
    height: 44,
    marginTop: 16,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-error)',
    border: '1px solid var(--color-border)',
  },
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionSpacer: {height: 24},
  cardGap: {height: 12},
};

// ---------------------------------------------------------------------------
// FIXTURES — frozen clock: TODAY = Mon May 11, 2026 ('Spring 2026' term).
// Cross-check ledger (verified by hand): Chem scheduled 90+90+90 = 270 ✓;
// Calc 60+75+105+120+120 = 480 ✓; Micro 45+90+90+90+60+30 = 405 ✓; total
// 1155 = day loads 150+135+165+105+210+210+90+60+30 ✓; capacity 3×180 + 180
// + 2×300 + 3×180 = 1860; slack 1860−1155 = 705 = 30+45+15+75+90+90+90+120+
// 150 ✓; completed 450+240+75 = 765 = '12h 45m studied'; readiness
// (450+270)/750 = 96% · (240+480)/960 = 75% · (75+405)/600 = 80%.
// ---------------------------------------------------------------------------

type SubjId = 'chem' | 'calc' | 'micro';
type Tab = 'plan' | 'exams' | 'stats' | 'settings';

interface Subject {
  id: SubjId;
  name: string;
  short: string;
  examDay: string; // MMDD key
  examLabel: string; // 'Thu May 14 · 9:00 AM'
  examTime: string;
  daysOut: number;
  targetMin: number;
  completedMin: number;
}

const SUBJECTS: Record<SubjId, Subject> = {
  chem: {
    id: 'chem',
    name: 'Chemistry 201',
    short: 'CHEM',
    examDay: '0514',
    examLabel: 'Thu May 14 · 9:00 AM',
    examTime: '9:00 AM',
    daysOut: 3,
    targetMin: 750,
    completedMin: 450,
  },
  calc: {
    id: 'calc',
    name: 'Calculus II',
    short: 'CALC',
    examDay: '0518',
    examLabel: 'Mon May 18 · 1:30 PM',
    examTime: '1:30 PM',
    daysOut: 7,
    targetMin: 960,
    completedMin: 240,
  },
  micro: {
    id: 'micro',
    name: 'Microeconomics 110', // the 320px truncation stress string
    short: 'MICRO',
    examDay: '0522',
    examLabel: 'Fri May 22 · 9:00 AM',
    examTime: '9:00 AM',
    daysOut: 11,
    targetMin: 600,
    completedMin: 75,
  },
};

const SUBJECT_ORDER: SubjId[] = ['chem', 'calc', 'micro'];

interface DayMeta {
  key: string; // '0511'
  dow: string; // 'Mon'
  num: number; // 11
  label: string; // 'Mon May 11'
  shortLabel: string; // 'Tue 12'
  weekend: boolean;
  exam: SubjId | null;
}

const TODAY_KEY = '0511';
const TODAY_LONG = 'Monday, May 11';

const DAYS: DayMeta[] = [
  {key: '0511', dow: 'Mon', num: 11, label: 'Mon May 11', shortLabel: 'Mon 11', weekend: false, exam: null},
  {key: '0512', dow: 'Tue', num: 12, label: 'Tue May 12', shortLabel: 'Tue 12', weekend: false, exam: null},
  {key: '0513', dow: 'Wed', num: 13, label: 'Wed May 13', shortLabel: 'Wed 13', weekend: false, exam: null},
  {key: '0514', dow: 'Thu', num: 14, label: 'Thu May 14', shortLabel: 'Thu 14', weekend: false, exam: 'chem'},
  {key: '0515', dow: 'Fri', num: 15, label: 'Fri May 15', shortLabel: 'Fri 15', weekend: false, exam: null},
  {key: '0516', dow: 'Sat', num: 16, label: 'Sat May 16', shortLabel: 'Sat 16', weekend: true, exam: null},
  {key: '0517', dow: 'Sun', num: 17, label: 'Sun May 17', shortLabel: 'Sun 17', weekend: true, exam: null},
  {key: '0518', dow: 'Mon', num: 18, label: 'Mon May 18', shortLabel: 'Mon 18', weekend: false, exam: 'calc'},
  {key: '0519', dow: 'Tue', num: 19, label: 'Tue May 19', shortLabel: 'Tue 19', weekend: false, exam: null},
  {key: '0520', dow: 'Wed', num: 20, label: 'Wed May 20', shortLabel: 'Wed 20', weekend: false, exam: null},
  {key: '0521', dow: 'Thu', num: 21, label: 'Thu May 21', shortLabel: 'Thu 21', weekend: false, exam: null},
  {key: '0522', dow: 'Fri', num: 22, label: 'Fri May 22', shortLabel: 'Fri 22', weekend: false, exam: 'micro'},
];

const DAY_BY_KEY: Record<string, DayMeta> = Object.fromEntries(DAYS.map(d => [d.key, d]));

interface Session {
  id: string;
  subj: SubjId;
  day: string;
  min: number;
  time: string; // 'H:MM AM' — deterministic fixture string
  replanned?: boolean;
}

// DAY TABLE (capacity | sessions | load | slack), every number cross-checked
// in the ledger above. Thu May 21's 30m session is the smallest block
// (30/180 = 16.7% — stress 6); Sat/Sun 300m vs weekday 180m test
// proportional widths in one spine (stress 5).
const INITIAL_SESSIONS: Session[] = [
  {id: 'chem-0511', subj: 'chem', day: '0511', min: 90, time: '4:00 PM'},
  {id: 'calc-0511', subj: 'calc', day: '0511', min: 60, time: '7:30 PM'},
  {id: 'chem-0512', subj: 'chem', day: '0512', min: 90, time: '5:00 PM'},
  {id: 'micro-0512', subj: 'micro', day: '0512', min: 45, time: '8:00 PM'},
  {id: 'chem-0513', subj: 'chem', day: '0513', min: 90, time: '4:00 PM'},
  {id: 'calc-0513', subj: 'calc', day: '0513', min: 75, time: '7:00 PM'},
  {id: 'calc-0515', subj: 'calc', day: '0515', min: 105, time: '3:30 PM'},
  {id: 'calc-0516', subj: 'calc', day: '0516', min: 120, time: '10:00 AM'},
  {id: 'micro-0516', subj: 'micro', day: '0516', min: 90, time: '2:00 PM'},
  {id: 'calc-0517', subj: 'calc', day: '0517', min: 120, time: '10:00 AM'},
  {id: 'micro-0517', subj: 'micro', day: '0517', min: 90, time: '2:00 PM'},
  {id: 'micro-0519', subj: 'micro', day: '0519', min: 90, time: '6:30 PM'},
  {id: 'micro-0520', subj: 'micro', day: '0520', min: 60, time: '6:30 PM'},
  {id: 'micro-0521', subj: 'micro', day: '0521', min: 30, time: '5:00 PM'},
];

// STATS fixtures — last 7 days Mon May 4 – Sun May 10; 60+90+45+90+60+0+75
// = 420m = '7h 00m this week' ✓. Sat May 9 = 0m renders a 2px baseline stub
// and does NOT break the 9-day streak (no sessions were planned — stress 7).
const WEEK_BARS = [
  {id: 'w0504', day: 'M 4', full: 'Mon May 4', min: 60},
  {id: 'w0505', day: 'T 5', full: 'Tue May 5', min: 90},
  {id: 'w0506', day: 'W 6', full: 'Wed May 6', min: 45},
  {id: 'w0507', day: 'T 7', full: 'Thu May 7', min: 90},
  {id: 'w0508', day: 'F 8', full: 'Fri May 8', min: 60},
  {id: 'w0509', day: 'S 9', full: 'Sat May 9', min: 0},
  {id: 'w0510', day: 'S 10', full: 'Sun May 10', min: 75},
];
// Completed sessions: Chem 5×90 = 450 ✓ · Calc 60+90+90 = 240 ✓ · Micro
// 45+30 = 75 ✓ → 10 sessions, 765m total; 765−420 = 345m studied before
// May 4 (term since Apr 20).
const COMPLETED_SESSIONS = 10;
const COMPLETED_TOTAL_LABEL = '12h 45m';
const WEEK_TOTAL_LABEL = '7h 00m';

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — every aggregate recomputes from the session rows.
// ---------------------------------------------------------------------------

interface CapSettings {
  weekdayCap: number;
  weekendCap: number;
}

function capacityFor(day: DayMeta, caps: CapSettings): number {
  if (day.exam != null) return 0; // zero-capacity hard stop (stress 4)
  return day.weekend ? caps.weekendCap : caps.weekdayCap;
}

interface DayComputed {
  meta: DayMeta;
  sessions: Session[];
  load: number;
  cap: number;
  slack: number; // max(0, cap − load)
  overflow: number; // max(0, load − cap)
  trims: Record<string, number>; // sessionId → minutes over capacity
}

interface PlanComputed {
  byDay: Record<string, DayComputed>;
  overloadedDays: string[];
  scheduledBySubj: Record<SubjId, number>;
  feasibleBySubj: Record<SubjId, number>;
  readinessBySubj: Record<SubjId, number>;
  overAffected: Record<SubjId, boolean>;
  totalSlack: number;
}

/**
 * The one derivation pass every surface reads. Feasible planned minutes
 * count only up to each day's capacity — overflow trims the LAST session in
 * the day's list (the replanned block lands last, so the +45 on Wed 13 is
 * the one trimmed by 30 → Chem feasible 240 → readiness 92%).
 */
function computePlan(sessions: Session[], caps: CapSettings): PlanComputed {
  const byDay: Record<string, DayComputed> = {};
  const scheduledBySubj: Record<SubjId, number> = {chem: 0, calc: 0, micro: 0};
  const feasibleBySubj: Record<SubjId, number> = {chem: 0, calc: 0, micro: 0};
  const overAffected: Record<SubjId, boolean> = {chem: false, calc: false, micro: false};
  const overloadedDays: string[] = [];
  let totalSlack = 0;
  for (const meta of DAYS) {
    const daySessions = sessions.filter(s => s.day === meta.key);
    const load = daySessions.reduce((sum, s) => sum + s.min, 0);
    const cap = capacityFor(meta, caps);
    const overflow = meta.exam != null ? 0 : Math.max(0, load - cap);
    const slack = meta.exam != null ? 0 : Math.max(0, cap - load);
    const trims: Record<string, number> = {};
    let toTrim = overflow;
    for (let i = daySessions.length - 1; i >= 0 && toTrim > 0; i--) {
      const s = daySessions[i];
      const trim = Math.min(s.min, toTrim);
      trims[s.id] = trim;
      overAffected[s.subj] = true;
      toTrim -= trim;
    }
    if (overflow > 0) overloadedDays.push(meta.key);
    totalSlack += slack;
    for (const s of daySessions) {
      scheduledBySubj[s.subj] += s.min;
      feasibleBySubj[s.subj] += s.min - (trims[s.id] ?? 0);
    }
    byDay[meta.key] = {meta, sessions: daySessions, load, cap, slack, overflow, trims};
  }
  const readinessBySubj = Object.fromEntries(
    SUBJECT_ORDER.map(id => {
      const subj = SUBJECTS[id];
      return [id, Math.round(((subj.completedMin + feasibleBySubj[id]) / subj.targetMin) * 100)];
    }),
  ) as Record<SubjId, number>;
  return {byDay, overloadedDays, scheduledBySubj, feasibleBySubj, readinessBySubj, overAffected, totalSlack};
}

/**
 * REPLAN MATH — absorbing days are strictly after today and strictly before
 * the subject's exam (the hard stop truncates: skipping Chem 90 finds only
 * Tue 12 and Wed 13 — stress 3). Minutes split as 15m chunks round-robin
 * oldest-first → equal 45m chips: Tue 135+45 = 180/180 exactly full (the
 * boundary case, full but NOT amber — stress 2); Wed 165+45 = 210/180 →
 * 30 over (stress 1).
 */
function computeReplanAdds(
  sessions: Session[],
  caps: CapSettings,
  session: Session,
): {adds: {day: string; min: number}[]; overloadedDays: string[]} {
  const plan = computePlan(sessions, caps);
  const absorbing = DAYS.filter(
    d => d.key > TODAY_KEY && d.key < SUBJECTS[session.subj].examDay && d.exam == null,
  );
  const addByDay: Record<string, number> = {};
  const chunks = Math.floor(session.min / 15);
  if (absorbing.length > 0) {
    for (let i = 0; i < chunks; i++) {
      const day = absorbing[i % absorbing.length];
      addByDay[day.key] = (addByDay[day.key] ?? 0) + 15;
    }
  }
  const adds = absorbing
    .filter(d => addByDay[d.key] != null)
    .map(d => ({day: d.key, min: addByDay[d.key]}));
  const overloadedDays = adds
    .filter(a => plan.byDay[a.day].load - (a.day === session.day ? session.min : 0) + a.min > plan.byDay[a.day].cap)
    .map(a => a.day);
  return {adds, overloadedDays};
}

function fmtM(min: number): string {
  return `${min}m`;
}

function parseTime(time: string): {h: number; m: number; pm: boolean} {
  const [clock, suffix] = time.split(' ');
  const [h, m] = clock.split(':').map(Number);
  return {h, m, pm: suffix === 'PM'};
}

function fmtClock(h: number, m: number, pm: boolean): string {
  return `${h}:${String(m).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — planStore useReducer. Single source for sessions, caps,
// pendingReplan, undoSnapshot, streak/skips, tab + screenByTab + scrollByTab
// + expandedDays persistence, open sheet, toast. One dispatch path.
// ---------------------------------------------------------------------------

interface PendingReplan {
  sessionId: string;
  subj: SubjId;
  removedMin: number;
  adds: {day: string; min: number}[];
  overloadedDays: string[];
}

interface Snapshot {
  sessions: Session[];
  streak: number;
  skips: number;
  skipsCaption: string;
}

type SheetState =
  | {kind: 'balancer'}
  | {
      kind: 'editor';
      sessionId: string;
      draftMin: number;
      draftH: number;
      draftM: number;
      draftPm: boolean;
      timePanelOpen: boolean;
    };

interface PlanState {
  sessions: Session[];
  streak: number;
  skips: number;
  skipsCaption: string;
  weekdayCap: number;
  weekendCap: number;
  defaultLen: number;
  overloadWarnings: boolean;
  tab: Tab;
  examScreen: SubjId | null; // exams tab push stack (persists across tabs)
  expandedDays: Record<string, boolean>;
  scrollByTab: Record<Tab, number>;
  pendingReplan: PendingReplan | null;
  undoSnapshot: Snapshot | null;
  sheet: SheetState | null;
  detent: 'medium' | 'large';
  menuSessionId: string | null;
  lenPanelOpen: boolean;
  toast: {seq: number; text: string; undoable: boolean} | null;
  toastSeq: number;
}

const INITIAL_STATE: PlanState = {
  sessions: INITIAL_SESSIONS,
  streak: 9,
  skips: 2,
  skipsCaption: 'last May 1',
  weekdayCap: 180,
  weekendCap: 300,
  defaultLen: 90,
  overloadWarnings: true,
  tab: 'plan',
  examScreen: null,
  expandedDays: {},
  scrollByTab: {plan: 0, exams: 0, stats: 0, settings: 0},
  pendingReplan: null,
  undoSnapshot: null,
  sheet: null,
  detent: 'medium',
  menuSessionId: null,
  lenPanelOpen: false,
  toast: null,
  toastSeq: 0,
};

type Action =
  | {type: 'SET_TAB'; tab: Tab; savedScroll: number}
  | {type: 'RETAP_TAB'}
  | {type: 'PUSH_EXAM'; subj: SubjId; savedScroll?: number}
  | {type: 'POP_EXAM'}
  | {type: 'TOGGLE_DAY'; day: string}
  | {type: 'SKIP_SESSION'; sessionId: string}
  | {type: 'ACCEPT_REPLAN'}
  | {type: 'CANCEL_REPLAN'}
  | {type: 'UNDO'}
  | {type: 'ADJUST_SUBJECT'; subj: SubjId; delta: 15 | -15}
  | {type: 'OPEN_BALANCER'}
  | {type: 'OPEN_EDITOR'; sessionId: string}
  | {type: 'EDIT_DRAFT'; patch: Partial<Extract<SheetState, {kind: 'editor'}>>}
  | {type: 'SAVE_SESSION'}
  | {type: 'DELETE_SESSION'}
  | {type: 'CLOSE_SHEET'}
  | {type: 'SET_DETENT'; detent: 'medium' | 'large'}
  | {type: 'TOGGLE_MENU'; sessionId: string | null}
  | {type: 'SET_CAP'; key: 'weekdayCap' | 'weekendCap'; value: number}
  | {type: 'SET_DEFAULT_LEN'; value: number}
  | {type: 'TOGGLE_LEN_PANEL'}
  | {type: 'TOGGLE_WARNINGS'};

function withToast(state: PlanState, text: string, undoable = false): PlanState {
  const seq = state.toastSeq + 1;
  // ONE toast law: a new mutation replaces the old — the prior undo window
  // simply ends (stress 9).
  return {...state, toastSeq: seq, toast: {seq, text, undoable}};
}

function caps(state: PlanState): CapSettings {
  return {weekdayCap: state.weekdayCap, weekendCap: state.weekendCap};
}

function planReducer(state: PlanState, action: Action): PlanState {
  switch (action.type) {
    case 'SET_TAB': {
      // Per-tab persistence: screenByTab/expandedDays survive; open sheets
      // close (an overlay belongs to its moment); scroll is recorded.
      return {
        ...state,
        tab: action.tab,
        sheet: null,
        menuSessionId: null,
        scrollByTab: {...state.scrollByTab, [state.tab]: action.savedScroll},
      };
    }
    case 'RETAP_TAB': {
      // The one legal reset: re-tapping the active tab pops to root.
      return {
        ...state,
        examScreen: state.tab === 'exams' ? null : state.examScreen,
        scrollByTab: {...state.scrollByTab, [state.tab]: 0},
      };
    }
    case 'PUSH_EXAM':
      return {
        ...state,
        tab: 'exams',
        examScreen: action.subj,
        sheet: null,
        menuSessionId: null,
        scrollByTab:
          action.savedScroll != null
            ? {...state.scrollByTab, [state.tab]: action.savedScroll}
            : state.scrollByTab,
      };
    case 'POP_EXAM':
      return {...state, examScreen: null};
    case 'TOGGLE_DAY':
      return {
        ...state,
        expandedDays: {...state.expandedDays, [action.day]: !state.expandedDays[action.day]},
      };
    case 'SKIP_SESSION': {
      const session = state.sessions.find(s => s.id === action.sessionId);
      if (session == null) return state;
      const {adds, overloadedDays} = computeReplanAdds(state.sessions, caps(state), session);
      return {
        ...state,
        menuSessionId: null,
        pendingReplan: {
          sessionId: session.id,
          subj: session.subj,
          removedMin: session.min,
          adds,
          overloadedDays,
        },
      };
    }
    case 'ACCEPT_REPLAN': {
      const pending = state.pendingReplan;
      if (pending == null) return state;
      const snapshot: Snapshot = {
        sessions: state.sessions,
        streak: state.streak,
        skips: state.skips,
        skipsCaption: state.skipsCaption,
      };
      let sessions = state.sessions.filter(s => s.id !== pending.sessionId);
      for (const add of pending.adds) {
        const existing = sessions.find(s => s.subj === pending.subj && s.day === add.day);
        if (existing != null) {
          // Tue 12: +45 appended to chem-0512 → 135m.
          sessions = sessions.map(s => (s.id === existing.id ? {...s, min: s.min + add.min} : s));
        } else {
          // Wed 13: new 45m block tagged '+45m replanned' (stress 11).
          sessions = [
            ...sessions,
            {
              id: `${pending.subj}-${add.day}-r`,
              subj: pending.subj,
              day: add.day,
              min: add.min,
              time: '8:00 PM',
              replanned: true,
            },
          ];
        }
      }
      const next: PlanState = {
        ...state,
        sessions,
        pendingReplan: null,
        undoSnapshot: snapshot,
        streak: 0, // adherence streak breaks on a skip
        skips: state.skips + 1,
        skipsCaption: 'last today',
      };
      return withToast(next, 'Plan updated', true);
    }
    case 'CANCEL_REPLAN':
      return {...state, pendingReplan: null};
    case 'UNDO': {
      const snapshot = state.undoSnapshot;
      if (snapshot == null) return state;
      // Exact restore: row order, streak, skips, chip colors all revert.
      const next: PlanState = {
        ...state,
        sessions: snapshot.sessions,
        streak: snapshot.streak,
        skips: snapshot.skips,
        skipsCaption: snapshot.skipsCaption,
        undoSnapshot: null,
      };
      return withToast(next, 'Restored');
    }
    case 'ADJUST_SUBJECT': {
      const subj = SUBJECTS[action.subj];
      const plan = computePlan(state.sessions, caps(state));
      if (action.delta > 0) {
        // +15 lands on the latest pre-exam day with the most slack (+15 Calc
        // → Sun 17, slack 90 ties Sat 16 but latest wins).
        const candidates = DAYS.filter(
          d => d.key >= TODAY_KEY && d.key < subj.examDay && d.exam == null && plan.byDay[d.key].slack >= 15,
        );
        if (candidates.length === 0) return state;
        let target = candidates[0];
        for (const d of candidates) {
          if (plan.byDay[d.key].slack >= plan.byDay[target.key].slack) target = d;
        }
        const existing = state.sessions.find(s => s.subj === action.subj && s.day === target.key);
        const sessions =
          existing != null
            ? state.sessions.map(s => (s.id === existing.id ? {...s, min: s.min + 15} : s))
            : [
                ...state.sessions,
                {
                  id: `${action.subj}-${target.key}-b`,
                  subj: action.subj,
                  day: target.key,
                  min: 15,
                  time: '7:00 PM',
                },
              ];
        return withToast({...state, sessions}, `Rebalanced: ${subj.name} +15m (${DAY_BY_KEY[target.key].shortLabel})`);
      }
      // −15 trims the subject's latest session; removed at 0 (scheduled
      // cannot go below 0 — the minus half disables there, stress 8).
      const own = state.sessions.filter(s => s.subj === action.subj && s.day < subj.examDay);
      if (own.length === 0) return state;
      const latest = own.reduce((a, b) => (b.day >= a.day ? b : a));
      const sessions =
        latest.min <= 15
          ? state.sessions.filter(s => s.id !== latest.id)
          : state.sessions.map(s => (s.id === latest.id ? {...s, min: s.min - 15} : s));
      return withToast({...state, sessions}, `Rebalanced: ${subj.name} −15m (${DAY_BY_KEY[latest.day].shortLabel})`);
    }
    case 'OPEN_BALANCER':
      return {...state, sheet: {kind: 'balancer'}, detent: 'medium', menuSessionId: null};
    case 'OPEN_EDITOR': {
      const session = state.sessions.find(s => s.id === action.sessionId);
      if (session == null) return state;
      const t = parseTime(session.time);
      return {
        ...state,
        menuSessionId: null,
        detent: 'medium',
        sheet: {
          kind: 'editor',
          sessionId: session.id,
          draftMin: session.min,
          draftH: t.h,
          draftM: t.m,
          draftPm: t.pm,
          timePanelOpen: false,
        },
      };
    }
    case 'EDIT_DRAFT': {
      if (state.sheet?.kind !== 'editor') return state;
      return {...state, sheet: {...state.sheet, ...action.patch}};
    }
    case 'SAVE_SESSION': {
      if (state.sheet?.kind !== 'editor') return state;
      const {sessionId, draftMin, draftH, draftM, draftPm} = state.sheet;
      const sessions = state.sessions.map(s =>
        s.id === sessionId ? {...s, min: draftMin, time: fmtClock(draftH, draftM, draftPm)} : s,
      );
      const session = state.sessions.find(s => s.id === sessionId);
      const next = {...state, sessions, sheet: null};
      return withToast(next, `Session updated · ${SUBJECTS[session?.subj ?? 'chem'].name} ${fmtM(draftMin)}`);
    }
    case 'DELETE_SESSION': {
      // undoOverConfirm: executes immediately + Undo toast, never a confirm.
      if (state.sheet?.kind !== 'editor') return state;
      const {sessionId} = state.sheet;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session == null) return {...state, sheet: null};
      const snapshot: Snapshot = {
        sessions: state.sessions,
        streak: state.streak,
        skips: state.skips,
        skipsCaption: state.skipsCaption,
      };
      const next: PlanState = {
        ...state,
        sessions: state.sessions.filter(s => s.id !== sessionId),
        sheet: null,
        undoSnapshot: snapshot,
      };
      return withToast(next, `Session deleted · ${SUBJECTS[session.subj].name} ${fmtM(session.min)}`, true);
    }
    case 'CLOSE_SHEET':
      return {...state, sheet: null, detent: 'medium'};
    case 'SET_DETENT':
      return {...state, detent: action.detent};
    case 'TOGGLE_MENU':
      return {...state, menuSessionId: action.sessionId};
    case 'SET_CAP': {
      const value = Math.max(60, Math.min(480, action.value));
      if (value === state[action.key]) return state;
      return withToast(
        {...state, [action.key]: value},
        `${action.key === 'weekdayCap' ? 'Weekday' : 'Weekend'} capacity ${fmtM(value)}`,
      );
    }
    case 'SET_DEFAULT_LEN':
      return {...state, defaultLen: Math.max(30, Math.min(180, action.value))};
    case 'TOGGLE_LEN_PANEL':
      return {...state, lenPanelOpen: !state.lenPanelOpen};
    case 'TOGGLE_WARNINGS':
      return withToast(
        {...state, overloadWarnings: !state.overloadWarnings},
        state.overloadWarnings ? 'Overload warnings off' : 'Overload warnings on',
      );
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// HOOKS — container width (grid-feeder-console ResizeObserver pattern) and
// the large-title sentinel (IntersectionObserver drives navBar title fade +
// hairline — the declared scroll-wired choice).
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

/**
 * Large-title collapse: a 1px sentinel sits under the large title; the
 * IntersectionObserver's rootMargin is offset by the navBar's viewport
 * bottom so 'sentinel above that line' = 'large title scrolled under the
 * sticky navBar' → compact title fades in, hairline turns on. User-driven,
 * deterministic.
 */
function useTitleCollapsed(
  sentinelRef: RefObject<HTMLDivElement | null>,
  navRef: RefObject<HTMLElement | null>,
  activeKey: string,
): boolean {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const nav = navRef.current;
    if (sentinel == null || nav == null) return undefined;
    const navBottom = Math.max(0, Math.round(nav.getBoundingClientRect().bottom));
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        if (entry != null) setCollapsed(!entry.isIntersecting && entry.boundingClientRect.top < navBottom);
      },
      {rootMargin: `-${navBottom}px 0px 0px 0px`, threshold: 0},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, navRef, activeKey]);
  return collapsed;
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
// BRAND MARK — 28px Zerohour hourglass-zero glyph in a 44×44 nav slot.
// ---------------------------------------------------------------------------

function ZerohourMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
          <ellipse cx="9" cy="9" rx="5.5" ry="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.5 4.5 12.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// CAP BAR — the shared 12px capacity-track primitive. Segments are laid
// flex; width% = minutes / max(load, capacity); the 6px track's
// overflow:hidden clips outer corners (cornerMap). A 1px capacity tick
// renders whenever load exceeds capacity. Rest fills are the subject
// light-dark pairs (≥3:1 vs the muted track — math at the declarations).
// ---------------------------------------------------------------------------

interface CapSegment {
  id: string;
  min: number;
  color: string;
  ghost?: boolean; // dashed outline preview (pendingReplan)
}

interface CapBarProps {
  segments: CapSegment[];
  cap: number;
  ariaLabel: string;
  height?: number;
}

function CapBar({segments, cap, ariaLabel, height}: CapBarProps) {
  const load = segments.reduce((sum, s) => sum + s.min, 0);
  const denom = Math.max(load, cap, 1);
  // Split every segment at the capacity boundary: the portion past capacity
  // paints OVERLOAD_AMBER (solid) or dashes amber (ghost preview).
  const pieces: {id: string; pct: number; color: string; ghost: boolean}[] = [];
  let cursor = 0;
  for (const seg of segments) {
    const start = cursor;
    const end = cursor + seg.min;
    cursor = end;
    const within = Math.max(0, Math.min(end, cap) - start);
    const over = Math.max(0, end - Math.max(start, cap));
    if (within > 0) pieces.push({id: `${seg.id}-in`, pct: (within / denom) * 100, color: seg.color, ghost: seg.ghost === true});
    if (over > 0) pieces.push({id: `${seg.id}-over`, pct: (over / denom) * 100, color: OVERLOAD_AMBER, ghost: seg.ghost === true});
  }
  const showTick = load > cap && cap > 0;
  return (
    <div
      style={height != null ? {...styles.capTrack, height, borderRadius: height / 2} : styles.capTrack}
      role="img"
      aria-label={ariaLabel}>
      {pieces.map(piece => (
        <span
          key={piece.id}
          style={
            piece.ghost
              ? {...styles.ghostBlock, width: `${piece.pct}%`, border: `2px dashed ${piece.color}`}
              : {...styles.capBlock, width: `${piece.pct}%`, background: piece.color}
          }
          aria-hidden
        />
      ))}
      {showTick ? <span style={{...styles.capTick, left: `${(cap / denom) * 100}%`}} aria-hidden /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// READINESS RING — 48px SVG, 4px --color-border track, subject-color arc,
// center percent 13/600 tabular. Text alternative via aria-label.
// ---------------------------------------------------------------------------

function ReadinessRing({subj, pct}: {subj: SubjId; pct: number}) {
  const r = 20;
  const c = 2 * Math.PI * r; // 125.66
  const arc = Math.min(1, Math.max(0, pct / 100)) * c;
  return (
    <span
      role="img"
      aria-label={`${SUBJECTS[subj].name} readiness ${pct} percent`}
      style={{position: 'relative', width: 48, height: 48, flexShrink: 0, display: 'grid', placeItems: 'center'}}>
      <svg width={48} height={48} viewBox="0 0 48 48" fill="none" aria-hidden style={{position: 'absolute', inset: 0}}>
        <circle cx={24} cy={24} r={r} stroke="var(--color-border)" strokeWidth={4} />
        <circle
          cx={24}
          cy={24}
          r={r}
          stroke={SUBJECT_COLOR[subj]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${arc.toFixed(2)} ${c.toFixed(2)}`}
          transform="rotate(-90 24 24)"
          className="zh-fade"
        />
      </svg>
      <span style={{fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}} aria-hidden>
        {pct}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// EXAM COUNTDOWN CHIP RAIL — 64px snap rail, 3×44px chips (legal merged
// targets), subject-color border + text on card fill; amber when a feeding
// day is over capacity (and warnings are on). Chip color changes are
// duplicated in text ('· over capacity'). Arrow keys move chip focus.
// ---------------------------------------------------------------------------

interface ChipRailProps {
  readiness: Record<SubjId, number>;
  overAffected: Record<SubjId, boolean>;
  warnings: boolean;
  onChip: (subj: SubjId, opener: HTMLElement) => void;
}

function ExamCountdownChipRail({readiness, overAffected, warnings, onChip}: ChipRailProps) {
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const chips = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
    const index = chips.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'ArrowRight' ? index + 1 : index - 1;
    chips[(next + chips.length) % chips.length]?.focus();
  };
  return (
    <div style={styles.chipRail} className="zh-rail" role="group" aria-label="Exam countdowns" onKeyDown={onKeyDown}>
      {SUBJECT_ORDER.map(id => {
        const subj = SUBJECTS[id];
        const amber = warnings && overAffected[id];
        const color = amber ? OVERLOAD_AMBER : SUBJECT_COLOR[id];
        return (
          <button
            key={id}
            type="button"
            className="zh-btn zh-focusable"
            style={{...styles.examChip, color, border: `1px solid ${color}`}}
            aria-label={`${subj.name}: ${subj.daysOut} days out, readiness ${readiness[id]} percent${amber ? ', over capacity' : ''} — open exam`}
            onClick={event => onChip(id, event.currentTarget)}>
            <strong style={{fontWeight: 700, letterSpacing: '0.06em'}}>{subj.short}</strong>
            <span aria-hidden>·</span>
            <span>{subj.daysOut}d</span>
            <span aria-hidden>·</span>
            <span>{readiness[id]}%</span>
            {amber ? <span style={{fontWeight: 700}}>· over</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SESSION ROW — 60px two-line row (16/500 + 13/400); the row button opens
// the SessionEditor; trailing 36px Skip secondary (inside a 44px hit —
// destructive-ish, never the bottom-right primary slot) + 44×44 ellipsis
// opening the Edit/Skip anchored menu (visible button path).
// ---------------------------------------------------------------------------

interface SessionRowProps {
  session: Session;
  showSkip: boolean;
  menuOpen: boolean;
  menuUp?: boolean;
  isLast: boolean;
  trimmedBy?: number;
  onEdit: (opener: HTMLElement) => void;
  onSkip: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
}

function SessionRow({session, showSkip, menuOpen, menuUp, isLast, trimmedBy, onEdit, onSkip, onToggleMenu}: SessionRowProps) {
  const subj = SUBJECTS[session.subj];
  return (
    <div style={{position: 'relative'}}>
      <div style={styles.sessionRowWrap}>
        <button
          type="button"
          className="zh-btn zh-focusable"
          style={styles.sessionRowBtn}
          aria-label={`${subj.name}, ${session.min} minutes at ${session.time} — edit session`}
          onClick={event => onEdit(event.currentTarget)}>
          <span style={styles.sessionPrimary}>
            <span style={{...styles.subjectDot, background: SUBJECT_COLOR[session.subj]}} aria-hidden />
            <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'}}>{subj.name}</span>
            {session.replanned === true ? <span style={styles.replanTag}>+{session.min}m replanned</span> : null}
          </span>
          <span style={styles.sessionSecondary}>
            {fmtM(session.min)} · {session.time}
            {trimmedBy != null && trimmedBy > 0 ? ` · ${trimmedBy}m over capacity` : ''}
          </span>
        </button>
        {showSkip ? (
          <span style={styles.secondaryBtnHit}>
            <button type="button" className="zh-btn zh-focusable" style={styles.secondaryBtn} onClick={onSkip}>
              Skip
            </button>
          </span>
        ) : null}
        <button
          type="button"
          className="zh-btn zh-focusable"
          style={styles.iconBtn}
          aria-label={`More actions for ${subj.name} ${session.time}`}
          aria-expanded={menuOpen}
          onClick={event => onToggleMenu(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      {menuOpen ? (
        <div
          role="menu"
          aria-label={`Actions for ${subj.name}`}
          style={{...styles.anchoredMenu, ...(menuUp === true ? {top: 'auto', bottom: 54} : null)}}
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
            className="zh-btn zh-focusable"
            style={styles.menuRow}
            onClick={event => onEdit(event.currentTarget)}>
            Edit session
          </button>
          <div style={styles.rowDivider} />
          <button type="button" role="menuitem" className="zh-btn zh-focusable" style={styles.menuRow} onClick={onSkip}>
            Skip session
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COUNTDOWN SPINE — vertical day timeline May 12–22. Left rail 44px
// (weekday 11/500 over day-number 17/600 tabular) joined by a 2px
// --color-border spine line; each day row is a <button aria-expanded>
// expanding inline to that day's 60px session rows (expansion persists per
// tab). Exam days render HardStopRow instead of a bar (capacity 0 never
// draws a 0-width track — stress 4).
// ---------------------------------------------------------------------------

interface SpineProps {
  plan: PlanComputed;
  pending: PendingReplan | null;
  expandedDays: Record<string, boolean>;
  warnings: boolean;
  onToggleDay: (day: string) => void;
  onEditSession: (id: string, opener: HTMLElement) => void;
}

function CountdownSpine({plan, pending, expandedDays, warnings, onToggleDay, onEditSession}: SpineProps) {
  return (
    <div style={styles.spine}>
      {DAYS.filter(d => d.key > TODAY_KEY).map(meta => {
        const day = plan.byDay[meta.key];
        if (meta.exam != null) {
          const subj = SUBJECTS[meta.exam];
          return (
            <div key={meta.key} style={styles.spineRow}>
              <span style={styles.spineLine} aria-hidden />
              <div style={styles.spineRail}>
                <span style={styles.spineRailInner}>
                  <span style={styles.spineDow}>{meta.dow}</span>
                  <span style={{...styles.spineNum, color: SUBJECT_COLOR[meta.exam]}}>{meta.num}</span>
                </span>
              </div>
              <div
                style={{...styles.hardStopRow, borderInlineStart: `3px solid ${SUBJECT_COLOR[meta.exam]}`}}
                role="img"
                aria-label={`${subj.name} exam, ${meta.label} at ${subj.examTime}. No study capacity.`}>
                <span style={{color: SUBJECT_COLOR[meta.exam], display: 'inline-flex', flexShrink: 0}} aria-hidden>
                  <Icon icon={FlagIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.hardStopText}>
                  {subj.name.toUpperCase()} — EXAM · {subj.examTime}
                </span>
              </div>
            </div>
          );
        }
        const ghostAdd = pending?.adds.find(a => a.day === meta.key);
        const segments: CapSegment[] = day.sessions.map(s => ({
          id: s.id,
          min: s.min,
          color: SUBJECT_COLOR[s.subj],
        }));
        if (ghostAdd != null && pending != null) {
          segments.push({id: `ghost-${meta.key}`, min: ghostAdd.min, color: SUBJECT_COLOR[pending.subj], ghost: true});
        }
        const previewLoad = day.load + (ghostAdd?.min ?? 0);
        const over = previewLoad > day.cap;
        const expanded = expandedDays[meta.key] === true;
        return (
          <div key={meta.key} style={styles.spineRow}>
            <span style={styles.spineLine} aria-hidden />
            <div style={styles.spineRail}>
              <span style={styles.spineRailInner}>
                <span style={styles.spineDow}>{meta.dow}</span>
                <span style={styles.spineNum}>{meta.num}</span>
              </span>
            </div>
            <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
              <button
                type="button"
                className="zh-btn zh-focusable"
                style={styles.dayBtn}
                aria-expanded={expanded}
                aria-label={`${meta.label}: ${day.load} of ${day.cap} minutes planned${over && warnings ? ', over capacity' : ''} — ${expanded ? 'collapse' : 'expand'} sessions`}
                onClick={() => onToggleDay(meta.key)}>
                <span style={styles.dayHeaderLine}>
                  <span style={styles.dayLabel}>{meta.label}</span>
                  <span style={{...styles.dayLoad, ...(over && warnings ? styles.dayLoadOver : null)}}>
                    {ghostAdd != null ? `${previewLoad}/${day.cap}m` : `${day.load}/${day.cap}m`}
                  </span>
                </span>
                <CapBar
                  segments={segments}
                  cap={day.cap}
                  ariaLabel={`${meta.label}: ${previewLoad} of ${day.cap} minutes planned`}
                />
              </button>
              {expanded ? (
                <div style={styles.dayExpand} className="zh-strip-in">
                  {day.sessions.length === 0 ? (
                    <span style={{...styles.sessionSecondary, paddingBlock: 8}}>No sessions planned</span>
                  ) : (
                    day.sessions.map((s, index) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        showSkip={false}
                        menuOpen={false}
                        isLast={index === day.sessions.length - 1}
                        trimmedBy={day.trims[s.id]}
                        onEdit={opener => onEditSession(s.id, opener)}
                        onSkip={() => undefined}
                        onToggleMenu={opener => onEditSession(s.id, opener)}
                      />
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// REPLAN DIFF STRIP — in-flow card shown while pendingReplan exists; the
// strip itself is the visible affordance (no gesture). Chips: '+45m Tue 12'
// (subject fill, fits — the exact-180/180 boundary case) and '+45m Wed 13'
// (amber fill + '30m over' suffix). Mini preview bars show both days
// post-accept. Footer: Accept replan (brand secondary) · Keep session,
// separated by 16px.
// ---------------------------------------------------------------------------

interface DiffStripProps {
  pending: PendingReplan;
  plan: PlanComputed;
  warnings: boolean;
  onAccept: () => void;
  onKeep: () => void;
}

function ReplanDiffStrip({pending, plan, warnings, onAccept, onKeep}: DiffStripProps) {
  const subj = SUBJECTS[pending.subj];
  const anyOver = pending.overloadedDays.length > 0;
  return (
    <div
      style={{...styles.diffStrip, ...(anyOver && warnings ? styles.diffStripAmber : null)}}
      className="zh-strip-in"
      role="group"
      aria-label="Replan preview">
      <span style={styles.diffTitle}>
        Skipped: {subj.name} · {fmtM(pending.removedMin)} today
      </span>
      <div style={styles.diffChips}>
        {pending.adds.map(add => {
          const day = plan.byDay[add.day];
          const newLoad = day.load + add.min;
          const over = newLoad - day.cap;
          const isOver = over > 0;
          return (
            <span
              key={add.day}
              style={{
                ...styles.diffChip,
                background: isOver && warnings ? OVERLOAD_AMBER : SUBJECT_COLOR[pending.subj],
                color: isOver && warnings ? AMBER_FILL_TEXT : BRAND_FILL_TEXT,
              }}>
              +{add.min}m {DAY_BY_KEY[add.day].shortLabel}
              {isOver ? <span style={{fontWeight: 500}}>· {over}m over</span> : null}
            </span>
          );
        })}
      </div>
      <div style={styles.diffPreviewRow}>
        {pending.adds.map(add => {
          const day = plan.byDay[add.day];
          const segments: CapSegment[] = day.sessions.map(s => ({id: s.id, min: s.min, color: SUBJECT_COLOR[s.subj]}));
          segments.push({id: `p-${add.day}`, min: add.min, color: SUBJECT_COLOR[pending.subj]});
          return (
            <div key={add.day} style={styles.diffPreviewLine}>
              <span style={styles.diffPreviewLabel}>{DAY_BY_KEY[add.day].shortLabel}</span>
              <div style={{flex: 1, minWidth: 0}}>
                <CapBar
                  segments={segments}
                  cap={day.cap}
                  height={8}
                  ariaLabel={`${DAY_BY_KEY[add.day].label} after replan: ${day.load + add.min} of ${day.cap} minutes`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.diffFooter}>
        <button
          type="button"
          className="zh-btn zh-focusable"
          style={{...styles.secondaryBtn, ...styles.secondaryBtnBrand}}
          onClick={onAccept}>
          Accept replan
        </button>
        <button type="button" className="zh-btn zh-focusable" style={styles.secondaryBtn} onClick={onKeep}>
          Keep session
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEPPER — 96×32 muted track split by a center hairline; halves are real
// buttons whose hits extend to 44px via row padding; the value is a
// role=spinbutton (ArrowUp/Down step it). Exhausted halves disable at 35%.
// ---------------------------------------------------------------------------

interface StepperProps {
  label: string;
  value: number;
  valueLabel: string;
  canMinus: boolean;
  canPlus: boolean;
  min: number;
  max: number;
  onDelta: (delta: 15 | -15) => void;
}

function Stepper({label, value, valueLabel, canMinus, canPlus, min, max, onDelta}: StepperProps) {
  return (
    <>
      <span
        role="spinbutton"
        tabIndex={0}
        className="zh-focusable"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueLabel}
        style={styles.stepperValue}
        onKeyDown={event => {
          if (event.key === 'ArrowUp' && canPlus) {
            event.preventDefault();
            onDelta(15);
          } else if (event.key === 'ArrowDown' && canMinus) {
            event.preventDefault();
            onDelta(-15);
          }
        }}>
        {valueLabel}
      </span>
      <span style={styles.stepperTrack}>
        <button
          type="button"
          className="zh-btn zh-focusable"
          style={{...styles.stepperHalf, ...(canMinus ? null : styles.stepperHalfDisabled)}}
          aria-label={`Decrease ${label}`}
          disabled={!canMinus}
          onClick={() => onDelta(-15)}>
          <Icon icon={MinusIcon} size="sm" color="inherit" />
        </button>
        <span style={styles.stepperDividerV} aria-hidden />
        <button
          type="button"
          className="zh-btn zh-focusable"
          style={{...styles.stepperHalf, ...(canPlus ? null : styles.stepperHalfDisabled)}}
          aria-label={`Increase ${label}`}
          disabled={!canPlus}
          onClick={() => onDelta(15)}>
          <Icon icon={PlusIcon} size="sm" color="inherit" />
        </button>
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — two detents (55% / calc(100% − 56px)); grabber is a real
// 'Resize sheet' button (click toggles; drag is garnish, >120px past medium
// closes); 52px header with 44×44 X; focus trapped; focus enters via
// focus({preventScroll:true}) per the binding amendment.
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
      className="zh-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="zh-btn zh-focusable"
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
        <button type="button" className="zh-btn zh-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOAD BALANCER BODY — one 72px row per subject: name + 'scheduled 270m /
// needs 300m' 13px tabular, allocation bar with a visible 44×44
// GripVertical drag handle (pointer drag = ±15m per 24px step) MIRRORED by
// the stepper; over-capacity days list amber flag rows. Footer (in the
// sheet chrome): 'Slack remaining: 705m' + 48px Done.
// ---------------------------------------------------------------------------

interface BalancerBodyProps {
  plan: PlanComputed;
  warnings: boolean;
  onAdjust: (subj: SubjId, delta: 15 | -15) => void;
}

function LoadBalancerBody({plan, warnings, onAdjust}: BalancerBodyProps) {
  const dragRef = useRef<{subj: SubjId; startX: number; applied: number} | null>(null);
  const onHandlePointerDown = (subj: SubjId) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragRef.current = {subj, startX: event.clientX, applied: 0};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onHandlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    const steps = Math.trunc((event.clientX - drag.startX) / 24);
    while (dragRef.current != null && dragRef.current.applied < steps) {
      dragRef.current = {...dragRef.current, applied: dragRef.current.applied + 1};
      onAdjust(drag.subj, 15);
    }
    while (dragRef.current != null && dragRef.current.applied > steps) {
      dragRef.current = {...dragRef.current, applied: dragRef.current.applied - 1};
      onAdjust(drag.subj, -15);
    }
  };
  const onHandlePointerUp = () => {
    dragRef.current = null;
  };
  return (
    <div>
      {SUBJECT_ORDER.map((id, index) => {
        const subj = SUBJECTS[id];
        const scheduled = plan.scheduledBySubj[id];
        const needs = subj.targetMin - subj.completedMin;
        const preExamSlack = DAYS.filter(d => d.key >= TODAY_KEY && d.key < subj.examDay && d.exam == null).reduce(
          (sum, d) => sum + plan.byDay[d.key].slack,
          0,
        );
        const canPlus = preExamSlack >= 15;
        const canMinus = scheduled > 0;
        return (
          <div key={id}>
            {index > 0 ? <div style={{...styles.rowDivider, marginInlineStart: 0}} /> : null}
            <div style={styles.balancerRow}>
              <div style={styles.balancerText}>
                <span style={styles.balancerName}>
                  <span style={{...styles.subjectDot, background: SUBJECT_COLOR[id], display: 'inline-block', marginInlineEnd: 8}} aria-hidden />
                  {subj.name}
                </span>
                <span style={styles.balancerMeta}>
                  scheduled {fmtM(scheduled)} / needs {fmtM(needs)}
                </span>
                <div style={styles.allocTrackWrap}>
                  <div style={styles.allocTrack}>
                    <span
                      style={{
                        display: 'block',
                        height: '100%',
                        width: `${Math.min(100, (scheduled / Math.max(needs, 1)) * 100).toFixed(1)}%`,
                        background: SUBJECT_COLOR[id],
                      }}
                      aria-hidden
                    />
                  </div>
                  <button
                    type="button"
                    className="zh-btn zh-focusable"
                    style={styles.dragHandle}
                    aria-label={`Drag to rebalance ${subj.name} minutes (15 minute steps)`}
                    onPointerDown={onHandlePointerDown(id)}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}>
                    <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
                  </button>
                </div>
              </div>
              <Stepper
                label={`${subj.name} minutes`}
                value={scheduled}
                valueLabel={fmtM(scheduled)}
                canMinus={canMinus}
                canPlus={canPlus}
                min={0}
                max={needs + 300}
                onDelta={delta => onAdjust(id, delta)}
              />
            </div>
          </div>
        );
      })}
      {warnings && plan.overloadedDays.length > 0 ? (
        <div style={{paddingTop: 8}}>
          {plan.overloadedDays.map(dayKey => (
            <div key={dayKey} style={styles.flagRow}>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
              <span>
                {DAY_BY_KEY[dayKey].label} · {plan.byDay[dayKey].overflow}m over capacity
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SESSION EDITOR BODY — duration stepper (15m steps, 30–180, spinbutton),
// start-time pill + inline hour/minute stepper panel (never a native
// picker), 'Delete session' via undoOverConfirm (executes + Undo toast,
// no confirm dialogs anywhere in this template).
// ---------------------------------------------------------------------------

interface EditorBodyProps {
  sheet: Extract<SheetState, {kind: 'editor'}>;
  session: Session;
  onDraft: (patch: Partial<Extract<SheetState, {kind: 'editor'}>>) => void;
  onDelete: () => void;
}

function SessionEditorBody({sheet, session, onDraft, onDelete}: EditorBodyProps) {
  const subj = SUBJECTS[session.subj];
  const timeLabel = fmtClock(sheet.draftH, sheet.draftM, sheet.draftPm);
  return (
    <div>
      <div style={styles.editorField}>
        <span style={{fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'}}>Subject</span>
        <span style={{fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8}}>
          <span style={{...styles.subjectDot, background: SUBJECT_COLOR[session.subj]}} aria-hidden />
          {subj.name} · {DAY_BY_KEY[session.day].label}
        </span>
      </div>
      <div style={{...styles.utilityRow, paddingInline: 0}}>
        <span style={styles.utilityLabel}>Duration</span>
        <Stepper
          label="Session duration"
          value={sheet.draftMin}
          valueLabel={fmtM(sheet.draftMin)}
          canMinus={sheet.draftMin > 30}
          canPlus={sheet.draftMin < 180}
          min={30}
          max={180}
          onDelta={delta => onDraft({draftMin: Math.max(30, Math.min(180, sheet.draftMin + delta))})}
        />
      </div>
      <div style={{...styles.utilityRow, paddingInline: 0}}>
        <span style={styles.utilityLabel}>Starts</span>
        <button
          type="button"
          className="zh-btn zh-focusable"
          style={styles.pillBtn}
          aria-expanded={sheet.timePanelOpen}
          aria-label={`Start time ${timeLabel} — edit`}
          onClick={() => onDraft({timePanelOpen: !sheet.timePanelOpen})}>
          {timeLabel}
        </button>
      </div>
      {sheet.timePanelOpen ? (
        <div style={{...styles.inlinePanel, paddingInline: 0}} className="zh-strip-in">
          <span
            role="spinbutton"
            tabIndex={0}
            className="zh-focusable"
            aria-label="Start hour"
            aria-valuenow={sheet.draftH}
            aria-valuemin={1}
            aria-valuemax={12}
            style={styles.stepperValue}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onDraft({draftH: sheet.draftH === 12 ? 1 : sheet.draftH + 1});
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                onDraft({draftH: sheet.draftH === 1 ? 12 : sheet.draftH - 1});
              }
            }}>
            {sheet.draftH}h
          </span>
          <span style={styles.stepperTrack}>
            <button
              type="button"
              className="zh-btn zh-focusable"
              style={styles.stepperHalf}
              aria-label="Decrease start hour"
              onClick={() => onDraft({draftH: sheet.draftH === 1 ? 12 : sheet.draftH - 1})}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.stepperDividerV} aria-hidden />
            <button
              type="button"
              className="zh-btn zh-focusable"
              style={styles.stepperHalf}
              aria-label="Increase start hour"
              onClick={() => onDraft({draftH: sheet.draftH === 12 ? 1 : sheet.draftH + 1})}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </span>
          <span
            role="spinbutton"
            tabIndex={0}
            className="zh-focusable"
            aria-label="Start minutes"
            aria-valuenow={sheet.draftM}
            aria-valuemin={0}
            aria-valuemax={45}
            style={styles.stepperValue}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onDraft({draftM: (sheet.draftM + 15) % 60});
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                onDraft({draftM: (sheet.draftM + 45) % 60});
              }
            }}>
            :{String(sheet.draftM).padStart(2, '0')}
          </span>
          <span style={styles.stepperTrack}>
            <button
              type="button"
              className="zh-btn zh-focusable"
              style={styles.stepperHalf}
              aria-label="Earlier by 15 minutes"
              onClick={() => onDraft({draftM: (sheet.draftM + 45) % 60})}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.stepperDividerV} aria-hidden />
            <button
              type="button"
              className="zh-btn zh-focusable"
              style={styles.stepperHalf}
              aria-label="Later by 15 minutes"
              onClick={() => onDraft({draftM: (sheet.draftM + 15) % 60})}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </span>
          <button
            type="button"
            className="zh-btn zh-focusable"
            style={{...styles.pillBtn, fontWeight: 600}}
            aria-label={`Toggle AM or PM, currently ${sheet.draftPm ? 'PM' : 'AM'}`}
            onClick={() => onDraft({draftPm: !sheet.draftPm})}>
            {sheet.draftPm ? 'PM' : 'AM'}
          </button>
        </div>
      ) : null}
      <button type="button" className="zh-btn zh-focusable" style={styles.destructiveBtn} onClick={onDelete}>
        Delete session
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATS BAR CHART — 7 fixed bars (Mon May 4–Sun May 10), heights =
// minutes/90 × 72px max, 11px tabular values on ≥44px-wide focusable bar
// buttons; the Sat May 9 zero-day renders a 2px baseline stub (stress 7).
// Deterministic, no random.
// ---------------------------------------------------------------------------

function StatsBarChart() {
  return (
    <div style={styles.chartWrap} className="zh-rail" role="group" aria-label="Study minutes, last 7 days">
      {WEEK_BARS.map(bar => (
        <button
          key={bar.id}
          type="button"
          className="zh-btn zh-focusable"
          style={styles.chartBarBtn}
          aria-label={`${bar.full}: ${bar.min} minutes studied`}>
          <span style={styles.chartValue}>{bar.min}</span>
          <span
            style={{
              ...styles.chartCol,
              height: bar.min === 0 ? 2 : Math.round((bar.min / 90) * 72),
              ...(bar.min === 0 ? {background: 'var(--color-border)'} : null),
            }}
            aria-hidden
          />
          <span style={styles.chartDay}>{bar.day}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCROLL PLUMBING — the demo's .preview-wrap owns page scroll; per-tab
// scroll persistence records/restores its scrollTop (per-tab state law).
// ---------------------------------------------------------------------------

function getScrollParent(el: HTMLElement | null): Element | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node != null) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return document.scrollingElement;
}

const TABS: {id: Tab; label: string; icon: typeof CalendarRangeIcon}[] = [
  {id: 'plan', label: 'Plan', icon: CalendarRangeIcon},
  {id: 'exams', label: 'Exams', icon: FlagIcon},
  {id: 'stats', label: 'Stats', icon: BarChart3Icon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

const NAV_TITLES: Record<Tab, string> = {
  plan: 'Plan',
  exams: 'Exams',
  stats: 'Stats',
  settings: 'Settings',
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileExamCountdownPlannerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(planReducer, INITIAL_STATE);
  const plan = computePlan(state.sessions, {weekdayCap: state.weekdayCap, weekendCap: state.weekendCap});

  const shellRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const undoBtnRef = useRef<HTMLButtonElement | null>(null);

  const screenKey = `${state.tab}:${state.examScreen ?? 'root'}`;
  const titleCollapsed = useTitleCollapsed(sentinelRef, navRef, screenKey);

  // Per-tab scroll restore (record happens in the tab handlers below).
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  // Focus into an opening sheet — preventScroll per the binding amendment
  // (plain .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (state.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheet?.kind]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menuSessionId != null) {
        dispatch({type: 'TOGGLE_MENU', sessionId: null});
        menuOpenerRef.current?.focus();
      } else if (state.sheet != null) {
        dispatch({type: 'CLOSE_SHEET'});
        sheetOpenerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.menuSessionId, state.sheet]);

  const savedScroll = () => getScrollParent(shellRef.current)?.scrollTop ?? 0;

  const onTab = (tab: Tab) => {
    if (tab === state.tab) {
      // The one legal reset: active-tab re-tap pops to root + scrolls top.
      dispatch({type: 'RETAP_TAB'});
      const scroller = getScrollParent(shellRef.current);
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    dispatch({type: 'SET_TAB', tab, savedScroll: savedScroll()});
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = TABS.findIndex(t => t.id === state.tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    onTab(next.id);
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
    buttons[TABS.findIndex(t => t.id === next.id)]?.focus();
  };

  const openEditor = (sessionId: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'OPEN_EDITOR', sessionId});
  };
  const openBalancer = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'OPEN_BALANCER'});
  };
  const closeSheet = () => {
    dispatch({type: 'CLOSE_SHEET'});
    sheetOpenerRef.current?.focus();
  };
  const onChip = (subj: SubjId, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'PUSH_EXAM', subj, savedScroll: savedScroll()});
  };
  const onAcceptReplan = () => {
    dispatch({type: 'ACCEPT_REPLAN'});
    // Move focus to the Undo affordance the accept just created.
    requestAnimationFrame(() => undoBtnRef.current?.focus());
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const today = plan.byDay[TODAY_KEY];
  const editorSheet = state.sheet != null && state.sheet.kind === 'editor' ? state.sheet : null;
  const editorSession =
    editorSheet != null ? state.sessions.find(s => s.id === editorSheet.sessionId) ?? null : null;
  const isExamDetail = state.tab === 'exams' && state.examScreen != null;
  const detailSubj = state.examScreen != null ? SUBJECTS[state.examScreen] : null;
  const largeTitleText = isExamDetail && detailSubj != null ? detailSubj.name : NAV_TITLES[state.tab];

  const warnings = state.overloadWarnings;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{ZH_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — hairline + compact title fade are scroll-wired. */}
        <header
          ref={navRef}
          style={{...styles.navBar, ...(titleCollapsed ? styles.navBarScrolled : null)}}>
          <div style={styles.navLeading}>
            {isExamDetail ? (
              <button
                type="button"
                className="zh-btn zh-focusable"
                style={styles.backBtn}
                aria-label="Back to Exams"
                onClick={() => dispatch({type: 'POP_EXAM'})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Exams</span>
              </button>
            ) : (
              <ZerohourMark />
            )}
          </div>
          <div style={{...styles.navTitle, ...(titleCollapsed ? styles.navTitleOn : null)}} className="zh-fade" aria-hidden>
            {largeTitleText}
          </div>
          <div style={styles.navTrailing} />
        </header>

        <main style={styles.main}>
          {/* LARGE TITLE (h1 per screen) + collapse sentinel. */}
          <div style={styles.largeTitle}>
            <h1 style={styles.largeTitleText}>{largeTitleText}</h1>
          </div>
          <div ref={sentinelRef} style={{height: 1}} aria-hidden />

          {(state.tab === 'plan' || (state.tab === 'exams' && !isExamDetail)) && (
            <ExamCountdownChipRail
              readiness={plan.readinessBySubj}
              overAffected={plan.overAffected}
              warnings={warnings}
              onChip={onChip}
            />
          )}

          {state.tab === 'plan' ? (
            <>
              {/* TODAY CARD */}
              <div style={styles.listCard}>
                <div style={styles.todayHeader}>
                  <h2 style={styles.todayTitle}>{TODAY_LONG}</h2>
                  <span style={styles.todayMeta}>
                    {today.load}/{today.cap}m planned
                  </span>
                </div>
                <div style={styles.rowDivider} />
                {today.sessions.map((session, index) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    showSkip
                    menuOpen={state.menuSessionId === session.id}
                    menuUp={index === today.sessions.length - 1 && index > 0}
                    isLast={index === today.sessions.length - 1}
                    onEdit={opener => openEditor(session.id, opener)}
                    onSkip={() => {
                      const menuWasOpen = state.menuSessionId === session.id;
                      dispatch({type: 'SKIP_SESSION', sessionId: session.id});
                      if (menuWasOpen) menuOpenerRef.current?.focus();
                    }}
                    onToggleMenu={opener => {
                      menuOpenerRef.current = opener;
                      dispatch({
                        type: 'TOGGLE_MENU',
                        sessionId: state.menuSessionId === session.id ? null : session.id,
                      });
                    }}
                  />
                ))}
                {today.sessions.length === 0 ? (
                  <div style={{...styles.sessionSecondary, padding: 16}}>No sessions left today</div>
                ) : null}
                <div style={styles.rowDivider} />
                <div style={styles.cardFooterRow}>
                  <button
                    type="button"
                    className="zh-btn zh-focusable"
                    style={{...styles.secondaryBtn, ...styles.secondaryBtnBrand}}
                    onClick={event => openBalancer(event.currentTarget)}>
                    Rebalance
                  </button>
                </div>
              </div>

              {state.pendingReplan != null ? (
                <ReplanDiffStrip
                  pending={state.pendingReplan}
                  plan={plan}
                  warnings={warnings}
                  onAccept={onAcceptReplan}
                  onKeep={() => dispatch({type: 'CANCEL_REPLAN'})}
                />
              ) : null}

              <h2 style={styles.sectionHeader}>Next 11 days</h2>
              <CountdownSpine
                plan={plan}
                pending={state.pendingReplan}
                expandedDays={state.expandedDays}
                warnings={warnings}
                onToggleDay={day => dispatch({type: 'TOGGLE_DAY', day})}
                onEditSession={openEditor}
              />
              <div style={styles.sectionSpacer} />
            </>
          ) : null}

          {state.tab === 'exams' && !isExamDetail ? (
            <>
              <h2 style={styles.sectionHeader}>Spring 2026 · 3 exams</h2>
              <div style={styles.listCard}>
                {SUBJECT_ORDER.map((id, index) => {
                  const subj = SUBJECTS[id];
                  return (
                    <div key={id}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <button
                        type="button"
                        className="zh-btn zh-focusable"
                        style={styles.examRowBtn}
                        aria-label={`${subj.name}, ${subj.examLabel}, ${subj.daysOut} days out, readiness ${plan.readinessBySubj[id]} percent — open detail`}
                        onClick={event => {
                          sheetOpenerRef.current = event.currentTarget;
                          dispatch({type: 'PUSH_EXAM', subj: id});
                        }}>
                        <ReadinessRing subj={id} pct={plan.readinessBySubj[id]} />
                        <span style={styles.examText}>
                          <span style={styles.examName}>{subj.name}</span>
                          <span style={styles.examDate}>{subj.examLabel}</span>
                        </span>
                        <span style={styles.examCountdown}>{subj.daysOut}d</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={styles.sectionSpacer} />
            </>
          ) : null}

          {isExamDetail && detailSubj != null ? (
            <>
              <div style={styles.listCard}>
                <div style={{...styles.utilityRow, minHeight: 72}}>
                  <ReadinessRing subj={detailSubj.id} pct={plan.readinessBySubj[detailSubj.id]} />
                  <span style={styles.examText}>
                    <span style={styles.examName}>
                      {plan.readinessBySubj[detailSubj.id] >= 80 ? 'On track' : 'Behind'} ·{' '}
                      {plan.readinessBySubj[detailSubj.id]}%
                    </span>
                    <span style={styles.examDate}>{detailSubj.examLabel}</span>
                  </span>
                  <span style={styles.examCountdown}>{detailSubj.daysOut}d</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.detailStatRow}>
                  <span style={styles.detailStatLabel}>Target</span>
                  <span style={styles.detailStatValue}>{fmtM(detailSubj.targetMin)}</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.detailStatRow}>
                  <span style={styles.detailStatLabel}>Completed</span>
                  <span style={styles.detailStatValue}>{fmtM(detailSubj.completedMin)}</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.detailStatRow}>
                  <span style={styles.detailStatLabel}>Scheduled</span>
                  <span style={styles.detailStatValue}>{fmtM(plan.scheduledBySubj[detailSubj.id])}</span>
                </div>
                {warnings && plan.feasibleBySubj[detailSubj.id] < plan.scheduledBySubj[detailSubj.id] ? (
                  <>
                    <div style={styles.rowDivider} />
                    <div style={{...styles.detailStatRow, color: OVERLOAD_AMBER}}>
                      <span style={{fontSize: 16}}>Feasible</span>
                      <span style={styles.detailStatValue}>
                        {fmtM(plan.feasibleBySubj[detailSubj.id])} ·{' '}
                        {plan.scheduledBySubj[detailSubj.id] - plan.feasibleBySubj[detailSubj.id]}m over capacity
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
              <h2 style={styles.sectionHeader}>Per-day allocation</h2>
              <div style={{...styles.listCard, paddingBlock: 8}}>
                {DAYS.filter(d => d.key >= TODAY_KEY && d.key < detailSubj.examDay && d.exam == null).map(meta => {
                  const day = plan.byDay[meta.key];
                  const subjMin = day.sessions
                    .filter(s => s.subj === detailSubj.id)
                    .reduce((sum, s) => sum + s.min, 0);
                  return (
                    <div key={meta.key} style={styles.miniSpineRow}>
                      <span style={styles.miniSpineLabel}>{meta.shortLabel}</span>
                      <div style={{flex: 1, minWidth: 0}}>
                        <CapBar
                          segments={
                            subjMin > 0
                              ? [{id: `${detailSubj.id}-${meta.key}`, min: subjMin, color: SUBJECT_COLOR[detailSubj.id]}]
                              : []
                          }
                          cap={day.cap}
                          height={8}
                          ariaLabel={`${meta.label}: ${subjMin} ${detailSubj.name} minutes of ${day.cap} capacity`}
                        />
                      </div>
                      <span style={styles.miniSpineMin}>{subjMin > 0 ? fmtM(subjMin) : '—'}</span>
                    </div>
                  );
                })}
              </div>
              <div style={styles.sectionSpacer} />
            </>
          ) : null}

          {state.tab === 'stats' ? (
            <>
              <div style={styles.tileGrid}>
                <div style={styles.tile}>
                  <span style={styles.tileValue}>{state.streak} days</span>
                  <span style={styles.tileLabel}>Adherence streak</span>
                  {state.streak === 0 ? <span style={styles.tileCaptionAmber}>Streak broken</span> : null}
                </div>
                <div style={styles.tile}>
                  <span style={styles.tileValue}>{COMPLETED_TOTAL_LABEL}</span>
                  <span style={styles.tileLabel}>Studied this term</span>
                </div>
                <div style={styles.tile}>
                  <span style={styles.tileValue}>{state.skips} skips</span>
                  <span style={styles.tileLabel}>This term · {state.skipsCaption}</span>
                </div>
                <div style={styles.tile}>
                  <span style={styles.tileValue}>{COMPLETED_SESSIONS}</span>
                  <span style={styles.tileLabel}>Sessions completed</span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Last 7 days · {WEEK_TOTAL_LABEL}</h2>
              <div style={styles.listCard}>
                <StatsBarChart />
              </div>
              <h2 style={styles.sectionHeader}>Subject split · {COMPLETED_TOTAL_LABEL}</h2>
              <div style={{...styles.listCard, paddingBlock: 4}}>
                {SUBJECT_ORDER.map(id => {
                  const subj = SUBJECTS[id];
                  return (
                    <div key={id} style={styles.splitRow}>
                      <span style={styles.splitName}>{subj.name}</span>
                      <div style={styles.splitTrack}>
                        <span
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${((subj.completedMin / 450) * 100).toFixed(1)}%`,
                            background: SUBJECT_COLOR[id],
                          }}
                          aria-hidden
                        />
                      </div>
                      <span style={styles.splitMin}>{fmtM(subj.completedMin)}</span>
                    </div>
                  );
                })}
              </div>
              <div style={styles.sectionSpacer} />
            </>
          ) : null}

          {state.tab === 'settings' ? (
            <>
              <h2 style={styles.sectionHeader}>Plan capacity</h2>
              <div style={styles.listCard}>
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Weekday capacity</span>
                  <Stepper
                    label="Weekday capacity"
                    value={state.weekdayCap}
                    valueLabel={fmtM(state.weekdayCap)}
                    canMinus={state.weekdayCap > 60}
                    canPlus={state.weekdayCap < 480}
                    min={60}
                    max={480}
                    onDelta={delta => dispatch({type: 'SET_CAP', key: 'weekdayCap', value: state.weekdayCap + delta})}
                  />
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Weekend capacity</span>
                  <Stepper
                    label="Weekend capacity"
                    value={state.weekendCap}
                    valueLabel={fmtM(state.weekendCap)}
                    canMinus={state.weekendCap > 60}
                    canPlus={state.weekendCap < 480}
                    min={60}
                    max={480}
                    onDelta={delta => dispatch({type: 'SET_CAP', key: 'weekendCap', value: state.weekendCap + delta})}
                  />
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Default session length</span>
                  <button
                    type="button"
                    className="zh-btn zh-focusable"
                    style={styles.pillBtn}
                    aria-expanded={state.lenPanelOpen}
                    aria-label={`Default session length ${fmtM(state.defaultLen)} — edit`}
                    onClick={() => dispatch({type: 'TOGGLE_LEN_PANEL'})}>
                    {fmtM(state.defaultLen)}
                  </button>
                </div>
                {state.lenPanelOpen ? (
                  <div style={styles.inlinePanel} className="zh-strip-in">
                    <Stepper
                      label="Default session length"
                      value={state.defaultLen}
                      valueLabel={fmtM(state.defaultLen)}
                      canMinus={state.defaultLen > 30}
                      canPlus={state.defaultLen < 180}
                      min={30}
                      max={180}
                      onDelta={delta => dispatch({type: 'SET_DEFAULT_LEN', value: state.defaultLen + delta})}
                    />
                  </div>
                ) : null}
                <div style={styles.rowDivider} />
                {/* Whole 44px row is the role=switch button (foundations). */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.overloadWarnings}
                  className="zh-btn zh-focusable"
                  style={styles.utilityRow}
                  onClick={() => dispatch({type: 'TOGGLE_WARNINGS'})}>
                  <span style={styles.utilityLabel}>Overload warnings</span>
                  <span
                    style={{
                      ...styles.switchTrack,
                      background: state.overloadWarnings ? 'var(--color-brand)' : SWITCH_OFF,
                    }}
                    aria-hidden>
                    <span
                      className="zh-anim"
                      style={{
                        ...styles.switchThumb,
                        transform: state.overloadWarnings ? 'translateX(20px)' : undefined,
                      }}
                    />
                  </span>
                </button>
              </div>
              <div style={styles.sectionSpacer} />
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region. Sticky-in-flow above the
            tab bar; shell-absolute only while a sheet has locked the shell. */}
        <div
          style={state.sheet != null ? styles.toastDockAbsolute : styles.toastDock}
          aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="zh-fade">
              <span style={styles.toastMsg}>{state.toast.text}</span>
              {state.toast.undoable && state.undoSnapshot != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button
                    type="button"
                    ref={undoBtnRef}
                    className="zh-btn zh-focusable"
                    style={styles.toastUndo}
                    onClick={() => dispatch({type: 'UNDO'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 4 tabs, arrow keys move selection. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Zerohour sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="zh-btn zh-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => onTab(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SHEETS — scrim + one sheet at a time; never stacked. */}
        {state.sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheet?.kind === 'balancer' ? (
          <Sheet
            titleId="zh-balancer-title"
            title="Rebalance hours"
            detent={state.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <>
                <span style={styles.sheetFooterMeta}>Slack remaining: {fmtM(plan.totalSlack)}</span>
                <button type="button" className="zh-btn zh-focusable" style={styles.primaryBtn} onClick={closeSheet}>
                  Done
                </button>
              </>
            }>
            <LoadBalancerBody
              plan={plan}
              warnings={warnings}
              onAdjust={(subj, delta) => dispatch({type: 'ADJUST_SUBJECT', subj, delta})}
            />
          </Sheet>
        ) : null}
        {editorSheet != null && editorSession != null ? (
          <Sheet
            titleId="zh-editor-title"
            title="Edit session"
            detent={state.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button
                type="button"
                className="zh-btn zh-focusable"
                style={{...styles.primaryBtn, ...styles.primaryBtnFull}}
                onClick={() => {
                  dispatch({type: 'SAVE_SESSION'});
                  sheetOpenerRef.current?.focus();
                }}>
                Save
              </button>
            }>
            <SessionEditorBody
              sheet={editorSheet}
              session={editorSession}
              onDraft={patch => dispatch({type: 'EDIT_DRAFT', patch})}
              onDelete={() => {
                dispatch({type: 'DELETE_SESSION'});
                sheetOpenerRef.current?.focus();
              }}
            />
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
