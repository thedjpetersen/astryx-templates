// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Moonpip's baby-care day for Juniper
 *   (born Apr 9, 2026 → exactly 77 days = 11w 0d), frozen at NOW_MIN 838
 *   ('1:58 PM', Thursday Jun 25, 2026). FEEDS f1–f5 (nursing 16+17+18+18 =
 *   69 m, one 90 ml bottle; start intervals 155+165+160+160 = 640 → avg
 *   160 m → next due 1:55 PM → overdue 3 m). SLEEPS s1–s5
 *   (105+90+60+80+75 = 410 m = 6 h 50 m). Trends week Fri 19→Thu 25:
 *   feeds 7,8,7,8,7,8,(5 today) — completed sum 45, avg 45/6 = 7.5; sleep
 *   870+825+855+900+810+840 = 5,100 → avg 850 m = 14 h 10 m; bottles
 *   2+1+2+2+2+2+1 = 12 · 200+90+190+220+160+190+90 = 1,140 ml · avg
 *   1140/12 = 95 ml. Care team: Maya (you), Dan, Rosa Quinn (night doula).
 *   No Date.now(), no Math.random(), no network media.
 * @output Moonpip — Baby Care Log: the 3am app on a 390px MOBILE shell.
 *   A 52px navBar (crescent-and-pip mark · 'Juniper · 11w 0d' identity h1
 *   button · RefreshCw) over four tabs: LOG = 44px NextFeedBanner
 *   (overdue/upcoming/nursing states) + 36px statChipRow (Feeds 5 ·
 *   Nursing 69m · Sleep 6h 50m, all derived live) + the DualRailDayline —
 *   a 1,104px 24-hour canvas, feed pills left of a 40px time spine, sleep
 *   blocks right, a hatched gap-alert band 1:55→1:58 PM, and a 2px NOW
 *   rule — + a sticky actionDock ('Start feed' / 'Quick log'). TRENDS =
 *   28px large title with sentinel-faded compact title, segmented
 *   Feeds/Sleep/Bottles charts. CARE TEAM = full-bleed handoff stream of
 *   today's 10 events + members card. SETTINGS = profile, ml/oz units,
 *   reminder switch, expected-interval stepper, sign-out action sheet.
 *   Signature move: the two-channel SideToggleTimer docks under the
 *   navBar on ALL tabs; tapping L/R swaps accumulation; 'End' cascades
 *   ONE store write into the timeline pill, the cleared gap band, the
 *   recomputed prediction (intervals 155+165+160+160+163 = 803 → avg
 *   160.6 → 'Next feed likely ~4:40 PM'), the stat chips (Feeds 5→6),
 *   Trends' hatched today bar, a prepended Care-team HandoffLine, and a
 *   persistent 'Feed logged · Undo' toast that reverses all of it in one
 *   snapshot restore.
 * @position Page template; emitted by `astryx template mobile-baby-care-log`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrims, sheets, action sheet,
 *   alert, entry menus, toast) are position:'absolute' or sticky INSIDE
 *   shell; position:fixed is banned. While any sheet/alert is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close.
 *   The toast dock is STICKY-IN-FLOW (bottom 76, height 0) per the batch-2
 *   amendment — shell-absolute would pin to the document bottom on the
 *   1,104px timeline. Focus moves into opening sheets with
 *   {preventScroll: true} so the locked column never scroll-beaches them.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); the
 *   Care-team handoff stream is the one full-bleed list (feeds
 *   convention); no desktop frames, asides, or multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Moonpip indigo). Sanctioned non-brand literals, each
 *   with contrast math at the declaration: nursing pill fill/edge, sleep
 *   block fill/edge (meaningful rest fill — explicit ≥3:1 edge vs the
 *   body surface per the amendment, NOT bare background-muted), gap-band
 *   hatch/text/edge, switch OFF track and control edges (interactive
 *   boundaries ≥3:1 vs their actual surface), avatar pastels, scrim.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline always-on —
 *   declared choice); liveSessionStrip 56px sticky top 52 z19 while a
 *   session runs; nextFeedBanner 44px in-flow; statChips 36px;
 *   DualRailDayline 24 h × 44px/hour = 1,056px + 24px top/bottom pad =
 *   1,104px, columns 16 | 1fr | 40px spine | 1fr | 16 (159px rails @390,
 *   124px @320); feed pills min-height 24, sleep height = minutes × 44/60
 *   (s1 105 m → 77px), radius 8; actionDock sticky bottom 64 z20, 72px
 *   (48px buttons + 12px block pad); tabBar 64px sticky bottom 0 z20,
 *   4 tabs, 24px icon over 11px/500 label; sheet detents 55% /
 *   calc(100% − 56px), 24px grabber zone with 36×5 pill, 52px header;
 *   rows 44/60/72; sectionHeader 13px/600 uppercase 0.06em at 32px;
 *   toast dock sticky bottom 76 z30. TYPE (Figtree via
 *   --font-family-body): 28/700 Trends large title · 17/600 nav+card
 *   titles · 16/400 body · 13/400 meta · 11/500 tab labels+overlines;
 *   nothing under 11px; tabular-nums on every timer, time, ml, and count.
 *   Touch: every target ≥44×44 (small dayline pills get invisible padded
 *   hits) with ≥8px clearance or full-row merge.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: dayline rails are 1fr around
 *   the fixed 40px spine (159px @390 / 124px @320 / 179px @430); nursing
 *   pill meta compacts 'L 8m · R 10m' → 'L 8 · R 10' when rails < 140px;
 *   statChips wrap 3→2+1 ≤340; GloveStepper track min(240px, 100%−32px);
 *   dock buttons flex; navBar title maxWidth 200 ellipsized.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered 430px phone column with hairline borderInline; sticky chrome
 *   and absolute overlays stay inside because they anchor to shell.
 * - Deviations from spec, noted: (1) spec states '#5B54D9 on #FFF =
 *   6.9:1'; recomputed WCAG ratio is ≈5.7:1 — still passes 4.5:1, the
 *   corrected math is kept in the literals below. (2) screenByTab is
 *   folded to activeTab + scrollByTab — every tab is a single root screen
 *   in v1 (no push stack to persist), so a per-tab screen string would be
 *   dead state. (3) The gap-alert band hides while a nursing session is
 *   live — the running timer already covers the window, and 'Feed window
 *   passed' beside a running feed timer would be a false alarm.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  BarChart3Icon,
  ChevronRightIcon,
  ClipboardListIcon,
  MailIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math beside it.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Moonpip indigo). #5B54D9 on #FFFFFF ≈
// 5.7:1 (recomputed; the spec's stated 6.9:1 overshoots — 5.7 still clears
// 4.5:1). #A8A3F2 on the dark card #1C1A2E ≈ 7.4:1.
const BRAND_ACCENT = 'light-dark(#5B54D9, #A8A3F2)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #5B54D9 ≈ 5.7:1. Dark:
// white on #A8A3F2 fails (≈2.4:1), so the dark side flips to deep indigo —
// #1B1846 on #A8A3F2 ≈ 7.3:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1B1846)';
// Brand-tinted wash for chips/pills (12%) — decorative fill only; the text
// on it stays token text-primary.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Nursing pill: tinted card fill + a 1px brand edge. Edge #5B54D9 vs the
// white body ≈ 5.7:1 (≥3:1 ✓); #A8A3F2 vs the dark body ≈ 8.9:1 ✓.
const NURSE_FILL = 'light-dark(#EEEDFB, #2A2653)';
// Sleep block: a MEANINGFUL rest fill (amendment: never bare
// background-muted). Fill is a muted indigo; the 1px edge carries the
// ≥3:1 boundary vs the ACTUAL body surface: #6F68C8 on #FFFFFF ≈ 4.7:1 ✓;
// #928BE0 on the dark body (~#141218) ≈ 5.4:1 ✓.
const SLEEP_FILL = 'light-dark(#E9E7FA, #312C5B)';
const SLEEP_EDGE = 'light-dark(#6F68C8, #928BE0)';
// Gap-alert band per spec: 45° hatch + 1px error edge + label text.
// Label #8C1D1D over the hatch-on-white ≈ 6.9:1; #FFB3B3 over the dark
// hatch ≈ 7.6:1 — both clear 4.5:1 at 11px/500.
const GAP_HATCH_A = 'light-dark(rgba(217,72,72,0.16), rgba(255,120,120,0.20))';
const GAP_HATCH_B = 'light-dark(rgba(217,72,72,0.04), rgba(255,120,120,0.06))';
const GAP_TEXT = 'light-dark(#8C1D1D, #FFB3B3)';
// Error strong (band edge, delete rows, overdue banner tint text).
// #C92A2A on white ≈ 5.5:1; #FF8787 on the dark card ≈ 7.4:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
const ERROR_TINT_12 = `color-mix(in srgb, ${ERROR_STRONG} 12%, transparent)`;
// INTERACTIVE BOUNDARIES (amendment): switch OFF track and control edges
// need ≥3:1 against their actual surface — hairline/muted tokens are for
// passive separators only. OFF track #8A8696 on the white card ≈ 3.5:1 ✓;
// #8F8BA4 on the dark card ≈ 4.9:1 ✓. Control edge #767185 on white ≈
// 4.7:1 ✓; #9B95B8 on the dark card ≈ 5.6:1 ✓.
const OFF_TRACK = 'light-dark(#8A8696, #8F8BA4)';
const CONTROL_EDGE = 'light-dark(#767185, #9B95B8)';
// Inactive timer half — muted rest fill with the CONTROL_EDGE boundary.
const TIMER_IDLE_FILL = 'light-dark(#EFEDF6, #2B2840)';
// Switch thumb: white in both schemes per the input contract.
const SWITCH_THUMB = '#FFFFFF';
// Avatar pastels (deterministic per member; initials render in
// text-primary, which passes on these low-chroma fills in both schemes).
const AV_MAYA = 'light-dark(#E4E2F8, #3A3566)';
const AV_DAN = 'light-dark(#D9EDE7, #244A40)';
const AV_ROSA = 'light-dark(#F5E7D6, #4E3A22)';
// Sheet/alert scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Blur chrome surface (navBar, dock, tabBar, live strip).
const CHROME_SURFACE =
  'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the visually-hidden
// helper, the timer pulse + skeleton shimmer, and the reduced-motion guard
// (transitions collapse; pulse and shimmer are REMOVED — static fill alone
// encodes the state).
// ---------------------------------------------------------------------------

const MOONPIP_CSS = `
.mpp-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mpp-btn:disabled { cursor: default; }
.mpp-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.mpp-anim { transition: transform 200ms ease, opacity 200ms ease; }
.mpp-fade { transition: opacity 200ms ease; }
@keyframes mpp-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.mpp-sheet-in { animation: mpp-sheet-in 200ms ease; }
@keyframes mpp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
}
.mpp-pulse { animation: mpp-pulse 2s ease-in-out infinite; }
@keyframes mpp-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.mpp-shimmer-bar { position: relative; overflow: hidden; }
.mpp-shimmer-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent,
    color-mix(in srgb, var(--color-background-card) 60%, transparent),
    transparent);
  animation: mpp-shimmer 1.6s ease infinite;
}
.mpp-vh {
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
  .mpp-anim, .mpp-fade { transition: none; }
  .mpp-sheet-in { animation: none; }
  .mpp-pulse { animation: none; }
  .mpp-shimmer-bar::after { animation: none; content: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, sheetGrabber, listCard, row, rowDivider, sectionHeader.
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
  // Scroll lock while a sheet/alert is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage (≥720px container): centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (declared
  // choice; no scroll-under wiring).
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
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  navTitleH1: {margin: 0, minWidth: 0, font: 'inherit'},
  // Identity button — name 17/600 + 11/500 age chip in a muted pill;
  // maxWidth 200 ellipsized (long-name stress: 'Persephone Wilhelmina').
  navTitleBtn: {
    maxWidth: 200,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 8,
    borderRadius: 12,
  },
  navTitleName: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  ageChip: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-muted)',
    borderRadius: 999,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
  },
  // Compact Trends title crossfaded over the identity via sentinel.
  navCompactTitle: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LIVE SESSION STRIP — 56px sticky top 52 z19, persists across ALL tabs
  // while a session runs. Blur surface + bottom hairline.
  liveStrip: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 56,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    gap: 8,
    paddingInline: 8,
    paddingBlock: 6,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  // SideToggleTimer halves — real buttons ≥44px tall. Active = brand fill
  // (BRAND_FILL_TEXT, math at the literal); inactive = TIMER_IDLE_FILL
  // with the ≥3:1 CONTROL_EDGE boundary vs the strip surface.
  timerHalf: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    background: TIMER_IDLE_FILL,
    border: `1px solid ${CONTROL_EDGE}`,
    color: 'var(--color-text-primary)',
  },
  timerHalfActive: {
    background: BRAND_ACCENT,
    border: `1px solid ${BRAND_ACCENT}`,
    color: BRAND_FILL_TEXT,
  },
  timerSideLetter: {fontSize: 22, fontWeight: 700, lineHeight: 1},
  timerHalfClock: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  timerCenter: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
    paddingInline: 2,
  },
  timerTotal: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  timerCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  timerEndBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: `1px solid ${CONTROL_EDGE}`,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  updatedCaption: {
    paddingInline: 16,
    paddingTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // NEXT FEED BANNER — 44px in-flow row, listCard-styled.
  nextFeedBanner: {
    margin: '12px 16px 0',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  nextFeedBannerOverdue: {background: ERROR_TINT_12, borderColor: ERROR_STRONG},
  nextFeedBannerBrand: {background: BRAND_TINT_12, borderColor: BRAND_ACCENT},
  bannerIcon: {flexShrink: 0, display: 'inline-flex', color: BRAND_ACCENT},
  bannerIconOverdue: {color: ERROR_STRONG},
  // Wraps to two lines inside the minHeight-44 banner rather than
  // ellipsizing the '· 3m ago' tail (verified at 390 in the shoot pass).
  bannerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '20px',
    paddingBlock: 6,
  },
  bannerInlineBtn: {
    flexShrink: 0,
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  // STAT CHIPS — 36px, 8px gaps, wrap 3→2+1 at ≤340.
  statChipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '12px 16px 0',
  },
  statChip: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statChipStrong: {fontWeight: 600},
  // DUAL-RAIL DAYLINE — 1,056px canvas + 24px top/bottom pad = 1,104px.
  daylineWrap: {
    position: 'relative',
    marginTop: 12,
    height: 1104,
  },
  hourTick: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 1,
    background: 'var(--color-border)',
  },
  hourLabel: {
    position: 'absolute',
    left: 'calc(50% - 20px)',
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-body)',
    lineHeight: '14px',
  },
  // Small entries get an invisible padded hit: the button is ≥44px tall
  // and transparent; the visual pill centers inside it.
  entryHit: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 8,
  },
  feedPill: {
    borderRadius: 8,
    border: `1px solid ${BRAND_ACCENT}`,
    background: NURSE_FILL,
    padding: '3px 8px',
    minHeight: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1,
    overflow: 'hidden',
  },
  feedPillTime: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  feedPillMeta: {
    fontSize: 13,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bottlePill: {
    borderRadius: 8,
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  sleepBlock: {
    borderRadius: 8,
    border: `1px solid ${SLEEP_EDGE}`,
    background: SLEEP_FILL,
    padding: '3px 8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  sleepLabel: {
    fontSize: 13,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Gap-alert band — spans BOTH rails; the band itself is a ≥44px button.
  gapBand: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: `1px solid ${ERROR_STRONG}`,
    background: `repeating-linear-gradient(45deg, ${GAP_HATCH_A} 0 6px, ${GAP_HATCH_B} 6px 12px)`,
  },
  gapLabel: {
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: GAP_TEXT,
    whiteSpace: 'nowrap',
  },
  nowLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 2,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  nowTag: {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
    background: 'var(--color-background-card)',
    border: `1px solid ${BRAND_ACCENT}`,
    borderRadius: 999,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  terminalCaption: {
    padding: '16px 16px 8px',
    textAlign: 'center',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // ACTION DOCK — sticky bottom 64 z20, 72px (48px buttons + 12px pad).
  actionDock: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    display: 'flex',
    gap: 12,
    padding: '12px 16px',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  dockPrimary: {
    flex: 1.3,
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dockPrimaryLabel: {fontSize: 16, fontWeight: 600, lineHeight: 1.1},
  dockPrimaryCaption: {
    fontSize: 11,
    fontWeight: 500,
    opacity: 0.85,
    whiteSpace: 'nowrap',
  },
  dockSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    border: `1px solid ${CONTROL_EDGE}`,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // TRENDS.
  largeTitle: {
    margin: 0,
    padding: '12px 16px 0',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: '34px',
  },
  segmented: {
    margin: '12px 16px 0',
    height: 36,
    display: 'flex',
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
  },
  segment: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segmentActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  chartCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
  },
  chartTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  chartSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 2,
  },
  chartPlot: {
    position: 'relative',
    marginTop: 16,
    height: 120,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  chartBar: {
    flex: 1,
    borderRadius: '6px 6px 2px 2px',
    background: BRAND_ACCENT,
    minHeight: 2,
  },
  chartBarHatched: {
    background: `repeating-linear-gradient(45deg, ${BRAND_ACCENT} 0 5px, ${BRAND_TINT_12} 5px 10px)`,
  },
  chartAvgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTop: '2px dashed var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  chartAvgTag: {
    position: 'absolute',
    right: 0,
    transform: 'translateY(-100%)',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-card)',
    paddingInline: 4,
  },
  chartXRow: {display: 'flex', gap: 8, marginTop: 6},
  chartXLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  bottleStatRow: {display: 'flex', marginTop: 12},
  bottleStatCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    textAlign: 'center',
  },
  bottleStatValue: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // LIST LANGUAGE.
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
  sectionHeaderBleed: {paddingInline: 16},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowDividerFull: {height: 1, background: 'var(--color-border)'},
  // CARE TEAM — full-bleed 72px media rows (feed-stream convention).
  handoffRow: {
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
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  handoffText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  handoffPrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  handoffSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  handoffMeta: {
    flexShrink: 0,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  memberRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  memberText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  memberName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  memberRole: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  youChip: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    color: BRAND_ACCENT,
    border: `1px solid ${BRAND_ACCENT}`,
    borderRadius: 999,
    padding: '2px 8px',
  },
  // SETTINGS rows.
  row44: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowLabel: {
    fontSize: 16,
    fontWeight: 400,
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
    flexShrink: 0,
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chevron: {flexShrink: 0, display: 'inline-flex', color: 'var(--color-text-secondary)'},
  // Inline mini segmented (units row) — 28px inside the 44px row.
  miniSegmented: {
    flexShrink: 0,
    height: 28,
    display: 'flex',
    padding: 2,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
  },
  miniSegment: {
    minWidth: 44,
    borderRadius: 6,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    paddingInline: 8,
    color: 'var(--color-text-secondary)',
  },
  miniSegmentActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // Switch — 51×31 track; OFF track is the amendment-compliant ≥3:1
  // OFF_TRACK literal, never a hairline token.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    background: OFF_TRACK,
    position: 'relative',
  },
  switchTrackOn: {background: BRAND_ACCENT},
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: SWITCH_THUMB,
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
  },
  switchThumbOn: {transform: 'translateX(20px)'},
  // Interval stepper — 96×32 track, halves split by center hairline; hit
  // extends to 44px via row padding.
  stepper: {
    flexShrink: 0,
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperRule: {width: 1, background: CONTROL_EDGE},
  // GLOVE STEPPER — 240×64 track, full-half taps, 34px readout above.
  gloveValue: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '40px',
  },
  gloveTrack: {
    width: 'min(240px, calc(100% - 32px))',
    height: 64,
    marginInline: 'auto',
    marginTop: 8,
    display: 'flex',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    overflow: 'hidden',
  },
  gloveHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  gloveRule: {width: 1, background: CONTROL_EDGE},
  glovePips: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  glovePip: {
    width: 64,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  glovePipOn: {
    border: `2px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // Sheet time rows (quick log) — 44px utility row + pill value button.
  timePill: {
    flexShrink: 0,
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  inlinePanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBlock: 8,
  },
  inlineStepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${CONTROL_EDGE}`,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  inlineStepValue: {
    minWidth: 96,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  saveBtn: {
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
  sheetFooter: {
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // FORM FIELD (invite sheet).
  formField: {display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  fieldInput: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    boxShadow: `inset 0 0 0 1px ${CONTROL_EDGE}`,
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: ERROR_STRONG,
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
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
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
  sheetSegmented: {
    height: 36,
    display: 'flex',
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    marginTop: 4,
  },
  // ACTION SHEET — two stacked cards, options + Cancel.
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
  actionContext: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
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
  actionRowDestructive: {color: ERROR_STRONG},
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // CENTERED ALERT (sign-out — blocking choice) — scrim z60, alert z61.
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(280px, calc(100% - 64px))',
    zIndex: 61,
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  alertBody: {padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  // ENTRY MENU — anchored card inside the dayline; click-catcher below.
  clickCatcher: {position: 'absolute', inset: 0, zIndex: 24},
  entryMenu: {
    position: 'absolute',
    zIndex: 25,
    minWidth: 180,
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
    color: 'var(--color-text-primary)',
  },
  menuRowDestructive: {color: ERROR_STRONG},
  // SKELETON — 72px rows, deterministic staggered widths.
  skeletonRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
  },
  skeletonLines: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // TOAST DOCK — STICKY-IN-FLOW (amendment): height 0, bottom 76 z30, so
  // it pins above the tabBar even mid-scroll on the 1,104px timeline.
  toastAnchor: {
    position: 'sticky',
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
    flexShrink: 0,
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
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
    flexShrink: 0,
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
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock, dual fields everywhere ({startMin, startLabel})
// so no runtime date math. Cross-check ledger (verified by hand):
// nursing 16+17+18+18 = 69 m ✓ · sleep 105+90+60+80+75 = 410 m = 6 h 50 m ✓ ·
// feed-start intervals 155+165+160+160 = 640 → avg 160 → next 675+160 = 835 =
// 1:55 PM < NOW 838 → overdue 3 m ✓ · post-End intervals +163 = 803 → avg
// 160.6 → round5 160 → 838+160 = 998 → display round5 = 1000 = 4:40 PM ✓ ·
// trends feeds 7+8+7+8+7+8 = 45, 45/6 = 7.5 ✓ · sleep week 5,100/6 = 850 m =
// 14 h 10 m ✓ · bottles 12 · 1,140 ml · 1140/12 = 95 ml ✓ · born Apr 9 →
// Jun 25 = 21+31+25 = 77 days = 11 w 0 d ✓ · 'All 10 events' = 5 + 5 ✓.
// ---------------------------------------------------------------------------

// The suite's frozen "now": 838 minutes since midnight = 1:58 PM, Thu Jun 25.
const NOW_MIN = 838;
const NOW_LABEL = '1:58 PM';
const PX_PER_MIN = 44 / 60;
const DAY_PAD = 24; // dayline top/bottom padding

const BABY = {
  id: 'baby_juniper',
  name: 'Juniper',
  bornLabel: 'Apr 9, 2026',
  ageDays: 77,
  ageLabel: '11w 0d',
  weightLabel: '5.9 kg · Jun 22 checkup',
};

interface Member {
  id: string;
  name: string;
  initials: string;
  role: string;
  isYou: boolean;
  avatarBg: string;
}

const MEMBERS: Member[] = [
  {id: 'm_maya', name: 'Maya Ellison', initials: 'MA', role: 'Parent · you', isYou: true, avatarBg: AV_MAYA},
  {id: 'm_dan', name: 'Dan Ellison', initials: 'DA', role: 'Parent', isYou: false, avatarBg: AV_DAN},
  {id: 'm_rosa', name: 'Rosa Quinn', initials: 'RQ', role: 'Night doula · 10 PM–6 AM', isYou: false, avatarBg: AV_ROSA},
];

interface FeedEntry {
  id: string;
  kind: 'nursing' | 'bottle';
  startMin: number;
  startLabel: string;
  leftMin: number; // nursing only
  rightMin: number; // nursing only
  ml: number; // bottle only
  endedSide: 'L' | 'R' | null;
  memberId: string;
}

// FEEDS today (5). f5 ended L → side memory proposes starting on R.
const FEEDS: FeedEntry[] = [
  {id: 'f1', kind: 'nursing', startMin: 35, startLabel: '12:35 AM', leftMin: 9, rightMin: 7, ml: 0, endedSide: 'R', memberId: 'm_rosa'},
  {id: 'f2', kind: 'nursing', startMin: 190, startLabel: '3:10 AM', leftMin: 11, rightMin: 6, ml: 0, endedSide: 'R', memberId: 'm_rosa'},
  {id: 'f3', kind: 'bottle', startMin: 355, startLabel: '5:55 AM', leftMin: 0, rightMin: 0, ml: 90, endedSide: null, memberId: 'm_dan'},
  {id: 'f4', kind: 'nursing', startMin: 515, startLabel: '8:35 AM', leftMin: 8, rightMin: 10, ml: 0, endedSide: 'R', memberId: 'm_dan'},
  {id: 'f5', kind: 'nursing', startMin: 675, startLabel: '11:15 AM', leftMin: 6, rightMin: 12, ml: 0, endedSide: 'L', memberId: 'm_maya'},
];

interface SleepEntry {
  id: string;
  startMin: number;
  startLabel: string;
  endMin: number;
  endLabel: string;
  memberId: string;
}

// SLEEP today (5): 105+90+60+80+75 = 410 m. The 5:30–7:20 AM gap has no
// feed but s2/s3 bracket it — NOT an alert (stress fixture 5).
const SLEEPS: SleepEntry[] = [
  {id: 's1', startMin: 65, startLabel: '1:05 AM', endMin: 170, endLabel: '2:50 AM', memberId: 'm_rosa'},
  {id: 's2', startMin: 240, startLabel: '4:00 AM', endMin: 330, endLabel: '5:30 AM', memberId: 'm_rosa'},
  {id: 's3', startMin: 440, startLabel: '7:20 AM', endMin: 500, endLabel: '8:20 AM', memberId: 'm_dan'},
  {id: 's4', startMin: 580, startLabel: '9:40 AM', endMin: 660, endLabel: '11:00 AM', memberId: 'm_dan'},
  {id: 's5', startMin: 730, startLabel: '12:10 PM', endMin: 805, endLabel: '1:25 PM', memberId: 'm_maya'},
];

// TRENDS week, Fri Jun 19 → Thu Jun 25 (today last). Completed-day sums
// are consts; today's bars derive live from feeds/sleeps.
const WEEK_LABELS = ['F', 'S', 'S', 'M', 'T', 'W', 'T'];
const FEEDS_PER_DAY_PAST = [7, 8, 7, 8, 7, 8]; // sum 45, avg 7.5
const SLEEP_MIN_PER_DAY_PAST = [870, 825, 855, 900, 810, 840]; // 5,100 → 850
// Bottles: Sat has 1 vs Fri 2 (stress 8 — mini-bars keep a 2px floor).
const BOTTLES_PER_DAY = [2, 1, 2, 2, 2, 2, 1]; // sum 12
const BOTTLE_ML_PER_DAY = [200, 90, 190, 220, 160, 190, 90]; // sum 1,140

const TAB_IDS = ['log', 'trends', 'careteam', 'settings'] as const;
type TabId = (typeof TAB_IDS)[number];

const TAB_META: Array<{id: TabId; label: string; icon: typeof ClipboardListIcon}> = [
  {id: 'log', label: 'Log', icon: ClipboardListIcon},
  {id: 'trends', label: 'Trends', icon: BarChart3Icon},
  {id: 'careteam', label: 'Care team', icon: UsersIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

// ---------------------------------------------------------------------------
// FORMATTERS + PREDICTION — pure, deterministic.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '1:58 PM'. */
function fmtTime(min: number): string {
  const clamped = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(clamped / 60);
  const m = clamped % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Duration minutes → '6h 50m' / '45m' / '2h'. */
function fmtDur(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Elapsed seconds → 'm:ss' or 'h:mm:ss' (marathon 3807 → '1:03:27'). */
function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Bottle ml → display per units (fixture convention: 30 ml = 1 oz). */
function fmtAmount(ml: number, units: 'ml' | 'oz'): string {
  if (units === 'ml') return `${ml} ml`;
  const oz = ml / 30;
  return `${Number.isInteger(oz) ? oz : oz.toFixed(1)} oz`;
}

function round5(value: number): number {
  return Math.round(value / 5) * 5;
}

/**
 * Next-feed prediction from feed starts: avg interval rounded to 5, added
 * to the last start, display rounded to 5. Baseline: 640/4 = 160 → 675+160
 * = 835 (1:55 PM). Post-End: 803/5 = 160.6 → 160 → 838+160 = 998 → 1000 =
 * 4:40 PM. An intervalOverride (Settings stepper) replaces the average.
 */
function predictNextFeed(feeds: FeedEntry[], intervalOverride: number | null): {
  nextMin: number;
  intervalMin: number;
} {
  const sorted = [...feeds].sort((a, b) => a.startMin - b.startMin);
  let avg = 160;
  if (sorted.length >= 2) {
    let sum = 0;
    for (let i = 1; i < sorted.length; i++) sum += sorted[i].startMin - sorted[i - 1].startMin;
    avg = sum / (sorted.length - 1);
  }
  const interval = intervalOverride ?? round5(avg);
  const last = sorted.length > 0 ? sorted[sorted.length - 1].startMin : NOW_MIN;
  return {nextMin: round5(last + interval), intervalMin: interval};
}

function nursingMinutes(feed: FeedEntry): number {
  return feed.leftMin + feed.rightMin;
}

function feedDayline(feed: FeedEntry): {time: string; meta: string; compactMeta: string} {
  if (feed.kind === 'bottle') {
    return {time: feed.startLabel, meta: '', compactMeta: ''};
  }
  // Present sides in nursing order (started side first = opposite of end
  // side for two-side feeds; fixtures store L/R minutes explicitly).
  const first = feed.endedSide === 'L' ? 'R' : 'L';
  const second = feed.endedSide === 'L' ? 'L' : 'R';
  const firstMin = first === 'L' ? feed.leftMin : feed.rightMin;
  const secondMin = second === 'L' ? feed.leftMin : feed.rightMin;
  return {
    time: feed.startLabel,
    meta: `${first} ${firstMin}m · ${second} ${secondMin}m`,
    compactMeta: `${first} ${firstMin} · ${second} ${secondMin}`,
  };
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useCareStore(): entity map + one update(id, patch).
// The nursing interval lives here too (single owner ticks elapsed by
// activeSide; +1 s per tick, never Date.now()).
// ---------------------------------------------------------------------------

type SheetId = null | 'quicklog' | 'baby' | 'invite';
type QuickPane = 'bottle' | 'sleep' | 'nursingEdit';

interface SessionState {
  running: boolean;
  activeSide: 'L' | 'R';
  elapsedLSec: number;
  elapsedRSec: number;
  startLabel: string;
}

interface UiState {
  activeTab: TabId;
  scrollByTab: Record<TabId, number>;
  sheetId: SheetId;
  sheetDetent: 'medium' | 'large';
  quickPane: QuickPane;
  editEntryId: string | null; // feed/sleep id when the sheet is in edit mode
  entryMenuId: string | null;
  actionSheetOpen: boolean;
  signOutAlertOpen: boolean;
  toast: {seq: number; text: string; undoable: boolean} | null;
  trendsSegment: 'feeds' | 'sleep' | 'bottles';
  trendsCompactTitle: boolean;
  units: 'ml' | 'oz';
  reminderOn: boolean;
  intervalOverride: number | null; // Settings stepper; null = live average
  refreshState: 'idle' | 'loading' | 'updated';
  // Quick-log draft (sheet-scoped, survives detent flips, not tab switches).
  draftMl: number;
  draftBottleMin: number;
  draftSleepStartMin: number;
  draftSleepEndMin: number;
  draftOpenTimeField: 'bottle' | 'sleepStart' | 'sleepEnd' | null;
  draftEditL: number;
  draftEditR: number;
  babyName: string;
  draftBabyName: string;
  inviteEmail: string;
  inviteError: string | null;
}

interface CareEntities {
  session: SessionState;
  feeds: {byId: Record<string, FeedEntry>; order: string[]; nextSeq: number};
  sleeps: {byId: Record<string, SleepEntry>; order: string[]; nextSeq: number};
  ui: UiState;
}

const INITIAL_ENTITIES: CareEntities = {
  session: {running: false, activeSide: 'R', elapsedLSec: 0, elapsedRSec: 0, startLabel: NOW_LABEL},
  feeds: {
    byId: Object.fromEntries(FEEDS.map(feed => [feed.id, feed])),
    order: FEEDS.map(feed => feed.id),
    nextSeq: 6,
  },
  sleeps: {
    byId: Object.fromEntries(SLEEPS.map(sleep => [sleep.id, sleep])),
    order: SLEEPS.map(sleep => sleep.id),
    nextSeq: 6,
  },
  ui: {
    activeTab: 'log',
    scrollByTab: {log: 0, trends: 0, careteam: 0, settings: 0},
    sheetId: null,
    sheetDetent: 'medium',
    quickPane: 'bottle',
    editEntryId: null,
    entryMenuId: null,
    actionSheetOpen: false,
    signOutAlertOpen: false,
    toast: null,
    trendsSegment: 'feeds',
    trendsCompactTitle: false,
    units: 'ml',
    reminderOn: true,
    intervalOverride: null,
    refreshState: 'idle',
    draftMl: 90,
    draftBottleMin: NOW_MIN,
    draftSleepStartMin: 730,
    draftSleepEndMin: 805,
    draftOpenTimeField: null,
    draftEditL: 0,
    draftEditR: 0,
    babyName: BABY.name,
    draftBabyName: BABY.name,
    inviteEmail: '',
    inviteError: null,
  },
};

function useCareStore() {
  const [entities, setEntities] = useState<CareEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof CareEntities>(id: K, patch: Partial<CareEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  // THE store-owned tick: one setInterval while a session runs; +1 s into
  // the active side. Digits still update under reduced motion (content,
  // not decoration) — only the pulse is removed.
  const running = entities.session.running;
  useEffect(() => {
    if (!running) return undefined;
    const handle = window.setInterval(() => {
      setEntities(prev => {
        if (!prev.session.running) return prev;
        const side = prev.session.activeSide;
        return {
          ...prev,
          session: {
            ...prev.session,
            elapsedLSec: prev.session.elapsedLSec + (side === 'L' ? 1 : 0),
            elapsedRSec: prev.session.elapsedRSec + (side === 'R' ? 1 : 0),
          },
        };
      });
    }, 1000);
    return () => window.clearInterval(handle);
  }, [running]);
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

/** Focus the first focusable inside an opening overlay with
 * {preventScroll: true} — plain .focus() scroll-reveals the animating
 * sheet inside the locked column and beaches it mid-screen (amendment). */
function focusFirst(container: HTMLElement | null): void {
  if (container == null) return;
  const target = container.querySelector<HTMLElement>('button:not([disabled]), input');
  target?.focus({preventScroll: true});
}

// ---------------------------------------------------------------------------
// BRAND MARK — crescent moon cradling one seed-dot pip. Stroke uses
// --color-text-primary (never --color-text); the pip fills BRAND_ACCENT.
// Decorative, aria-hidden, in a 44×44 non-button slot.
// ---------------------------------------------------------------------------

function MoonpipMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path
          d="M20.5 17.9a8.4 8.4 0 0 1-10.4-10.4 8.4 8.4 0 1 0 10.4 10.4Z"
          stroke="var(--color-text-primary)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <circle cx={17.4} cy={16.4} r={2.6} fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SIDE TOGGLE TIMER — the docked live strip. Two flex halves (real buttons,
// 44px tall): active = brand fill (+pulse, removed under reduced motion —
// the static fill alone encodes it), inactive = TIMER_IDLE_FILL with the
// ≥3:1 CONTROL_EDGE boundary. Tapping the inactive half swaps accumulation.
// ---------------------------------------------------------------------------

interface SideToggleTimerProps {
  session: SessionState;
  reducedMotion: boolean;
  onSwapSide: (side: 'L' | 'R') => void;
  onEnd: () => void;
}

function SideToggleTimer({session, reducedMotion, onSwapSide, onEnd}: SideToggleTimerProps) {
  const totalSec = session.elapsedLSec + session.elapsedRSec;
  const sideLabel = session.activeSide === 'L' ? 'left' : 'right';
  const half = (side: 'L' | 'R') => {
    const isActive = session.activeSide === side;
    const sec = side === 'L' ? session.elapsedLSec : session.elapsedRSec;
    return (
      <button
        type="button"
        className={`mpp-btn mpp-focusable${isActive && !reducedMotion ? ' mpp-pulse' : ''}`}
        style={isActive ? {...styles.timerHalf, ...styles.timerHalfActive} : styles.timerHalf}
        aria-pressed={isActive}
        aria-label={isActive ? `${side === 'L' ? 'Left' : 'Right'} side active` : `Switch to ${side === 'L' ? 'left' : 'right'} side`}
        onClick={() => {
          if (!isActive) onSwapSide(side);
        }}>
        <span style={styles.timerSideLetter}>{side}</span>
        <span style={styles.timerHalfClock}>{fmtClock(sec)}</span>
      </button>
    );
  };
  return (
    <div
      style={styles.liveStrip}
      role="timer"
      aria-label={`Nursing timer, ${sideLabel} side active, total ${fmtClock(totalSec)}`}>
      {half('L')}
      <div style={styles.timerCenter}>
        <span style={styles.timerTotal}>{fmtClock(totalSec)}</span>
        <span style={styles.timerCaption}>Nursing · started {session.startLabel}</span>
      </div>
      {half('R')}
      <button
        type="button"
        className="mpp-btn mpp-focusable"
        style={styles.timerEndBtn}
        onClick={onEnd}
        aria-label="End nursing session and log the feed">
        End
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NEXT FEED BANNER — 44px in-flow row with three computed states:
// overdue (error tint) · upcoming (brand tint) · nursing-live (brand tint,
// no inline verb — the strip owns End).
// ---------------------------------------------------------------------------

interface NextFeedBannerProps {
  nextMin: number;
  running: boolean;
  startLabel: string;
  onStartFeed: () => void;
}

function NextFeedBanner({nextMin, running, startLabel, onStartFeed}: NextFeedBannerProps) {
  if (running) {
    return (
      <div style={{...styles.nextFeedBanner, ...styles.nextFeedBannerBrand}}>
        <span style={styles.bannerIcon}>
          <Icon icon={MoonIcon} size="sm" color="inherit" />
        </span>
        <span style={styles.bannerText}>Nursing now · started {startLabel}</span>
      </div>
    );
  }
  const overdue = nextMin < NOW_MIN;
  return (
    <div style={{...styles.nextFeedBanner, ...(overdue ? styles.nextFeedBannerOverdue : styles.nextFeedBannerBrand)}}>
      <span style={overdue ? {...styles.bannerIcon, ...styles.bannerIconOverdue} : styles.bannerIcon}>
        <Icon icon={MoonIcon} size="sm" color="inherit" />
      </span>
      <span style={styles.bannerText}>
        {overdue
          ? `Next feed was due ~${fmtTime(nextMin)} · ${NOW_MIN - nextMin}m ago`
          : `Next feed likely ~${fmtTime(nextMin)}`}
      </span>
      <button type="button" className="mpp-btn mpp-focusable" style={styles.bannerInlineBtn} onClick={onStartFeed}>
        Start feed
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DUAL-RAIL DAYLINE — 1,056px 24 h canvas + 24px pads. Columns: 16 gutter |
// feed rail 1fr | 40px spine | sleep rail 1fr | 16 gutter, built with calc()
// absolutes so the rails stay fluid (159px @390 / 124px @320). top =
// DAY_PAD + minutes × 44/60. Every entry is a real ≥44px-hit button (small
// pills get an invisible padded hit) opening the anchored entryMenu.
// ---------------------------------------------------------------------------

const FEED_RAIL: CSSProperties = {left: 16, right: 'calc(50% + 24px)'};
const SLEEP_RAIL: CSSProperties = {left: 'calc(50% + 24px)', right: 16};

function topFor(min: number): number {
  return DAY_PAD + min * PX_PER_MIN;
}

interface DaylineProps {
  feeds: FeedEntry[];
  sleeps: SleepEntry[];
  units: 'ml' | 'oz';
  compactRails: boolean;
  gapStartMin: number | null; // hatched band start; null = no alert
  entryMenuId: string | null;
  onEntryTap: (id: string) => void;
  onMenuClose: () => void;
  onMenuEdit: (id: string) => void;
  onMenuDelete: (id: string) => void;
  onGapTap: () => void;
}

function DualRailDayline(props: DaylineProps) {
  const {feeds, sleeps, units, compactRails, gapStartMin, entryMenuId, onEntryTap, onMenuClose, onMenuEdit, onMenuDelete, onGapTap} = props;
  const hours: ReactNode[] = [];
  for (let h = 0; h <= 24; h++) {
    const y = topFor(h * 60);
    hours.push(<div key={`tick-${h}`} style={{...styles.hourTick, top: y}} aria-hidden />);
    if (h % 3 === 0 && h < 24) {
      hours.push(
        <span key={`label-${h}`} style={{...styles.hourLabel, top: y + 3}} aria-hidden>
          {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
        </span>,
      );
    }
  }

  const menuFor = (id: string, anchorTop: number, side: 'feed' | 'sleep'): ReactNode =>
    entryMenuId === id ? (
      <>
        <button
          type="button"
          className="mpp-btn"
          style={styles.clickCatcher}
          aria-label="Close entry menu"
          onClick={onMenuClose}
        />
        <div
          role="menu"
          aria-label="Entry actions"
          style={{
            ...styles.entryMenu,
            top: Math.min(anchorTop, 1104 - 112),
            ...(side === 'feed' ? {left: 16} : {right: 16}),
          }}>
          <button type="button" role="menuitem" className="mpp-btn mpp-focusable" style={styles.menuRow} onClick={() => onMenuEdit(id)}>
            <Icon icon={PencilIcon} size="sm" color="inherit" />
            Edit
          </button>
          <div style={styles.rowDividerFull} />
          <button
            type="button"
            role="menuitem"
            className="mpp-btn mpp-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={() => onMenuDelete(id)}>
            <Icon icon={Trash2Icon} size="sm" color="inherit" />
            Delete
          </button>
        </div>
      </>
    ) : null;

  return (
    <div style={styles.daylineWrap} aria-label="Today's feed and sleep timeline">
      {hours}
      {/* Sleep blocks — right rail, height ∝ duration (s1 105 m → 77px). */}
      {sleeps.map(sleep => {
        const height = (sleep.endMin - sleep.startMin) * PX_PER_MIN;
        const top = topFor(sleep.startMin);
        const durLabel = fmtDur(sleep.endMin - sleep.startMin);
        return (
          <div key={sleep.id}>
            <button
              type="button"
              className="mpp-btn mpp-focusable"
              style={{...styles.entryHit, ...SLEEP_RAIL, top, minHeight: Math.max(44, height)}}
              aria-label={`Sleep ${sleep.startLabel} to ${sleep.endLabel}, ${durLabel} — entry actions`}
              aria-haspopup="menu"
              aria-expanded={entryMenuId === sleep.id}
              onClick={() => onEntryTap(sleep.id)}>
              <span style={{...styles.sleepBlock, height: Math.max(24, height)}}>
                <span style={styles.sleepLabel}>
                  {compactRails ? `${durLabel}` : `${sleep.startLabel.replace(' ', ' ')}–${sleep.endLabel.replace(' ', ' ')}`}
                </span>
                {!compactRails && height >= 40 ? <span style={styles.sleepLabel}>{durLabel}</span> : null}
              </span>
            </button>
            {menuFor(sleep.id, top + Math.max(44, height) + 4, 'sleep')}
          </div>
        );
      })}
      {/* Feed pills — left rail, right-aligned to the spine. */}
      {feeds.map(feed => {
        const top = topFor(feed.startMin);
        const line = feedDayline(feed);
        const label =
          feed.kind === 'bottle'
            ? `Bottle ${fmtAmount(feed.ml, units)} at ${feed.startLabel} — entry actions`
            : `Nursing ${nursingMinutes(feed)} minutes at ${feed.startLabel} — entry actions`;
        return (
          <div key={feed.id}>
            <button
              type="button"
              className="mpp-btn mpp-focusable"
              style={{...styles.entryHit, ...FEED_RAIL, top: top - 8, minHeight: 44, alignItems: 'stretch'}}
              aria-label={label}
              aria-haspopup="menu"
              aria-expanded={entryMenuId === feed.id}
              onClick={() => onEntryTap(feed.id)}>
              {feed.kind === 'bottle' ? (
                <span style={styles.bottlePill}>Bottle {fmtAmount(feed.ml, units)}</span>
              ) : (
                <span style={styles.feedPill}>
                  <span style={styles.feedPillTime}>{feed.startLabel}</span>
                  <span style={styles.feedPillMeta}>{compactRails ? line.compactMeta : line.meta}</span>
                </span>
              )}
            </button>
            {menuFor(feed.id, top + 44, 'feed')}
          </div>
        );
      })}
      {/* Gap-alert band — both rails, expected-feed time → NOW; itself a
          44px button opening the quick-log sheet. */}
      {gapStartMin != null ? (
        <button
          type="button"
          className="mpp-btn mpp-focusable"
          style={{...styles.gapBand, top: topFor(gapStartMin)}}
          onClick={onGapTap}>
          <span style={styles.gapLabel}>Feed window passed · {NOW_MIN - gapStartMin}m — log a feed</span>
        </button>
      ) : null}
      {/* NOW line + spine tag. */}
      <div style={{...styles.nowLine, top: topFor(NOW_MIN)}} aria-hidden />
      <span style={{...styles.nowTag, top: topFor(NOW_MIN)}} aria-hidden>
        Now {NOW_LABEL}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GLOVE STEPPER — oversized one-thumb ml stepper. 240×64 track split into
// minus/plus halves (full-half taps), 34px readout above, shortcut pips
// 30/60/90 that SET the value. role=spinbutton on the value; ArrowUp/Down
// step ±10; exhausted half disabled at 35% opacity. No drag anywhere.
// ---------------------------------------------------------------------------

interface GloveStepperProps {
  valueMl: number;
  units: 'ml' | 'oz';
  onChange: (ml: number) => void;
}

const GLOVE_MIN = 0;
const GLOVE_MAX = 240;
const GLOVE_STEP = 10;
const GLOVE_PIPS = [30, 60, 90];

function GloveStepper({valueMl, units, onChange}: GloveStepperProps) {
  const minusDisabled = valueMl <= GLOVE_MIN;
  const plusDisabled = valueMl >= GLOVE_MAX;
  return (
    <div>
      <div
        style={styles.gloveValue}
        role="spinbutton"
        tabIndex={0}
        className="mpp-focusable"
        aria-label="Bottle amount"
        aria-valuenow={valueMl}
        aria-valuemin={GLOVE_MIN}
        aria-valuemax={GLOVE_MAX}
        aria-valuetext={fmtAmount(valueMl, units)}
        onKeyDown={event => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            onChange(Math.min(GLOVE_MAX, valueMl + GLOVE_STEP));
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(Math.max(GLOVE_MIN, valueMl - GLOVE_STEP));
          }
        }}>
        {fmtAmount(valueMl, units)}
      </div>
      <div style={styles.gloveTrack}>
        <button
          type="button"
          className="mpp-btn mpp-focusable"
          style={{...styles.gloveHalf, ...(minusDisabled ? {opacity: 0.35} : null)}}
          disabled={minusDisabled}
          aria-label="Decrease amount by 10 ml"
          onClick={() => onChange(Math.max(GLOVE_MIN, valueMl - GLOVE_STEP))}>
          <Icon icon={MinusIcon} size="lg" color="inherit" />
        </button>
        <div style={styles.gloveRule} aria-hidden />
        <button
          type="button"
          className="mpp-btn mpp-focusable"
          style={{...styles.gloveHalf, ...(plusDisabled ? {opacity: 0.35} : null)}}
          disabled={plusDisabled}
          aria-label="Increase amount by 10 ml"
          onClick={() => onChange(Math.min(GLOVE_MAX, valueMl + GLOVE_STEP))}>
          <Icon icon={PlusIcon} size="lg" color="inherit" />
        </button>
      </div>
      <div style={styles.glovePips}>
        {GLOVE_PIPS.map(pip => (
          <button
            key={pip}
            type="button"
            className="mpp-btn mpp-focusable"
            style={valueMl === pip ? {...styles.glovePip, ...styles.glovePipOn} : styles.glovePip}
            aria-pressed={valueMl === pip}
            aria-label={`Set amount to ${fmtAmount(pip, units)}`}
            onClick={() => onChange(pip)}>
            {fmtAmount(pip, units)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HANDOFF LINE — Care-team 72px media row: 40px initials avatar (fixed bg
// per member), primary event line, secondary attribution, trailing time.
// ---------------------------------------------------------------------------

interface HandoffItem {
  id: string;
  memberId: string;
  primary: string;
  secondary: string;
  timeLabel: string;
  sortMin: number;
}

function handoffItems(feeds: FeedEntry[], sleeps: SleepEntry[], units: 'ml' | 'oz'): HandoffItem[] {
  const memberName = (id: string) => MEMBERS.find(member => member.id === id)?.name.split(' ')[0] ?? '—';
  const items: HandoffItem[] = [];
  for (const feed of feeds) {
    const who = memberName(feed.memberId);
    if (feed.kind === 'bottle') {
      items.push({
        id: `h-${feed.id}`,
        memberId: feed.memberId,
        primary: `Bottle ${feed.startLabel} · ${fmtAmount(feed.ml, units)}`,
        secondary: `${who} · bottle feed`,
        timeLabel: feed.startLabel,
        sortMin: feed.startMin,
      });
    } else {
      const startedSide = feed.endedSide === 'L' ? 'R' : 'L';
      items.push({
        id: `h-${feed.id}`,
        memberId: feed.memberId,
        primary: `Feed ${feed.startLabel} · ${nursingMinutes(feed)}m · ended ${feed.endedSide ?? '—'}`,
        secondary: `${who} · nursing ${startedSide}→${feed.endedSide ?? '—'}`,
        timeLabel: feed.startLabel,
        sortMin: feed.startMin,
      });
    }
  }
  for (const sleep of sleeps) {
    const who = memberName(sleep.memberId);
    items.push({
      id: `h-${sleep.id}`,
      memberId: sleep.memberId,
      primary: `Sleep ${sleep.startLabel}–${sleep.endLabel} · ${fmtDur(sleep.endMin - sleep.startMin)}`,
      secondary: `${who} · logged sleep`,
      timeLabel: sleep.startLabel,
      sortMin: sleep.startMin,
    });
  }
  return items.sort((a, b) => b.sortMin - a.sortMin);
}

function HandoffLine({item}: {item: HandoffItem}) {
  const member = MEMBERS.find(candidate => candidate.id === item.memberId);
  return (
    <div style={styles.handoffRow}>
      <span style={{...styles.avatar, background: member?.avatarBg ?? AV_MAYA}} aria-hidden>
        {member?.initials ?? '—'}
      </span>
      <span style={styles.handoffText}>
        <span style={styles.handoffPrimary}>{item.primary}</span>
        <span style={styles.handoffSecondary}>{item.secondary}</span>
      </span>
      <span style={styles.handoffMeta}>{item.timeLabel}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET — the generic two-detent bottom sheet: scrim + grabber-button +
// 52px header with 44×44 X + scrolling body (the one legal inner
// scroller). Focus moves in with {preventScroll: true} on mount; the
// caller restores focus to the opener on every close path.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, children, footer}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    focusFirst(sheetRef.current);
  }, []);
  return (
    <>
      <div style={styles.sheetScrim} className="mpp-fade" onClick={onClose} aria-hidden />
      <div
        ref={sheetRef}
        className="mpp-sheet-in"
        style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        onKeyDown={event => trapTabKey(event, sheetRef.current)}>
        <div style={styles.grabberZone}>
          <button
            type="button"
            className="mpp-btn mpp-focusable"
            style={{width: 64, height: 16, display: 'grid', placeItems: 'center', borderRadius: 8}}
            aria-label={`Resize sheet to ${detent === 'medium' ? 'large' : 'medium'}`}
            onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
            <span style={styles.sheetGrabber} aria-hidden />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <span aria-hidden />
          <h2 id={titleId} style={styles.sheetTitle}>
            {title}
          </h2>
          <button type="button" className="mpp-btn mpp-focusable" style={styles.iconBtn} aria-label="Close" onClick={onClose}>
            <Icon icon={XIcon} size="sm" color="inherit" />
          </button>
        </div>
        <div style={styles.sheetBody}>{children}</div>
        {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
      </div>
    </>
  );
}

// Inline time stepper (datePanel-lite): a 44px row whose trailing pill
// expands ±5-minute spinbutton steppers inline — never a native picker.
interface TimeRowProps {
  label: string;
  valueMin: number;
  open: boolean;
  onToggle: () => void;
  onChange: (min: number) => void;
}

function TimeRow({label, valueMin, open, onToggle, onChange}: TimeRowProps) {
  return (
    <div>
      <div style={styles.row44}>
        <span style={{...styles.rowLabel, flex: 1}}>{label}</span>
        <button
          type="button"
          className="mpp-btn mpp-focusable"
          style={styles.timePill}
          aria-expanded={open}
          aria-label={`${label} time, ${fmtTime(valueMin)}`}
          onClick={onToggle}>
          {fmtTime(valueMin)}
        </button>
      </div>
      {open ? (
        <div style={styles.inlinePanel}>
          <button
            type="button"
            className="mpp-btn mpp-focusable"
            style={styles.inlineStepBtn}
            aria-label={`${label} 5 minutes earlier`}
            disabled={valueMin <= 0}
            onClick={() => onChange(Math.max(0, valueMin - 5))}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <span
            style={styles.inlineStepValue}
            role="spinbutton"
            tabIndex={0}
            className="mpp-focusable"
            aria-label={`${label} time`}
            aria-valuenow={valueMin}
            aria-valuemin={0}
            aria-valuemax={NOW_MIN}
            aria-valuetext={fmtTime(valueMin)}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onChange(Math.min(NOW_MIN, valueMin + 5));
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                onChange(Math.max(0, valueMin - 5));
              }
            }}>
            {fmtTime(valueMin)}
          </span>
          <button
            type="button"
            className="mpp-btn mpp-focusable"
            style={styles.inlineStepBtn}
            aria-label={`${label} 5 minutes later`}
            disabled={valueMin >= NOW_MIN}
            onClick={() => onChange(Math.min(NOW_MIN, valueMin + 5))}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

// Deterministic skeleton rows — 72px, widths staggered 60/45/70/60 +
// 40/55/30/40, never random. Shimmer removed under reduced motion.
const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

function SkeletonStream() {
  return (
    <div aria-busy>
      {SKELETON_PRIMARY.map((primary, index) => (
        <div key={primary + index}>
          {index > 0 ? <div style={styles.rowDividerFull} aria-hidden /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <span className="mpp-shimmer-bar" style={styles.skeletonAvatar} />
            <span style={styles.skeletonLines}>
              <span className="mpp-shimmer-bar" style={{...styles.skeletonBar, width: primary}} />
              <span className="mpp-shimmer-bar" style={{...styles.skeletonBar, width: SKELETON_SECONDARY[index]}} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function MobileBabyCareLogTemplate() {
  const {entities, update, setEntities} = useCareStore();
  const {session, feeds, sleeps, ui} = entities;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(wrapRef);
  // Viewport query is first-frame fallback only; container width decides.
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : viewportWide;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const shellWidth = isDesktop ? 430 : containerWidth > 0 ? containerWidth : 390;
  // Rails = 50% − 40px each side; compact meta form below 140px rails.
  const compactRails = shellWidth / 2 - 40 < 140;

  const feedList = feeds.order.map(id => feeds.byId[id]).sort((a, b) => a.startMin - b.startMin);
  const sleepList = sleeps.order.map(id => sleeps.byId[id]).sort((a, b) => a.startMin - b.startMin);

  // Derived aggregates — always from the rows, never cached.
  const nursingTodayMin = feedList.reduce((sum, feed) => sum + (feed.kind === 'nursing' ? nursingMinutes(feed) : 0), 0);
  const sleepTodayMin = sleepList.reduce((sum, sleep) => sum + (sleep.endMin - sleep.startMin), 0);
  const prediction = predictNextFeed(feedList, ui.intervalOverride);
  const lastNursing = [...feedList].reverse().find(feed => feed.kind === 'nursing' && feed.endedSide != null);
  const memorySide: 'L' | 'R' = lastNursing?.endedSide === 'L' ? 'R' : 'L';

  // Gap-alert law (stress 5): band only when the window is past AND no
  // feed has started since AND no sleep covers expected→NOW AND reminders
  // are on AND no live session (deviation 3 in the header).
  const feedCovers = feedList.some(feed => feed.startMin >= prediction.nextMin);
  const sleepCovers = sleepList.some(sleep => sleep.startMin <= prediction.nextMin && sleep.endMin >= NOW_MIN);
  const gapStartMin =
    !session.running && ui.reminderOn && prediction.nextMin < NOW_MIN && !feedCovers && !sleepCovers
      ? prediction.nextMin
      : null;

  const snapshotRef = useRef<CareEntities | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const uiRef = useRef(ui);
  uiRef.current = ui;

  const nextToast = useCallback(
    (text: string, undoable: boolean) => ({seq: (uiRef.current.toast?.seq ?? 0) + 1, text, undoable}),
    [],
  );

  const announce = useCallback(
    (text: string, undoable = false) => {
      update('ui', {toast: nextToast(text, undoable)});
    },
    [update, nextToast],
  );

  const rememberOpener = useCallback(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, []);

  const restoreOpener = useCallback(() => {
    openerRef.current?.focus({preventScroll: true});
    openerRef.current = null;
  }, []);

  // --- overlay close paths (each restores focus) ---
  const closeSheet = useCallback(() => {
    update('ui', {sheetId: null, editEntryId: null, draftOpenTimeField: null, inviteError: null});
    restoreOpener();
  }, [update, restoreOpener]);

  const closeActionSheet = useCallback(() => {
    update('ui', {actionSheetOpen: false});
    restoreOpener();
  }, [update, restoreOpener]);

  const closeAlert = useCallback(() => {
    update('ui', {signOutAlertOpen: false});
    restoreOpener();
  }, [update, restoreOpener]);

  const closeEntryMenu = useCallback(() => {
    update('ui', {entryMenuId: null});
    menuOpenerRef.current?.focus({preventScroll: true});
    menuOpenerRef.current = null;
  }, [update]);

  // Escape closes the TOPMOST overlay only: alert > action sheet > sheet >
  // entry menu.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const u = uiRef.current;
      if (u.signOutAlertOpen) closeAlert();
      else if (u.actionSheetOpen) closeActionSheet();
      else if (u.sheetId != null) closeSheet();
      else if (u.entryMenuId != null) closeEntryMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeAlert, closeActionSheet, closeSheet, closeEntryMenu]);

  // --- session flow ---
  const startFeed = useCallback(() => {
    if (uiRef.current.sheetId != null) closeSheet();
    setEntities(prev => {
      if (prev.session.running) return prev;
      const sorted = prev.feeds.order.map(id => prev.feeds.byId[id]).sort((a, b) => a.startMin - b.startMin);
      const last = [...sorted].reverse().find(feed => feed.kind === 'nursing' && feed.endedSide != null);
      const side: 'L' | 'R' = last?.endedSide === 'L' ? 'R' : 'L';
      return {
        ...prev,
        session: {running: true, activeSide: side, elapsedLSec: 0, elapsedRSec: 0, startLabel: NOW_LABEL},
      };
    });
  }, [setEntities, closeSheet]);

  // 'End' executes immediately (undoOverConfirm — End is reversible): ONE
  // setEntities write lands the timeline pill, clears the gap band,
  // recomputes the banner (163 joins the intervals → ~4:40 PM), bumps the
  // chips and Trends' today bar, prepends the HandoffLine, and raises the
  // persistent Undo toast.
  const endSession = useCallback(() => {
    setEntities(prev => {
      if (!prev.session.running) return prev;
      snapshotRef.current = prev;
      const leftMin = Math.ceil(prev.session.elapsedLSec / 60);
      const rightMin = Math.ceil(prev.session.elapsedRSec / 60);
      const id = `f${prev.feeds.nextSeq}`;
      const feed: FeedEntry = {
        id,
        kind: 'nursing',
        startMin: NOW_MIN,
        startLabel: NOW_LABEL,
        leftMin,
        rightMin,
        ml: 0,
        endedSide: prev.session.activeSide,
        memberId: 'm_maya',
      };
      return {
        ...prev,
        session: {...prev.session, running: false, elapsedLSec: 0, elapsedRSec: 0},
        feeds: {
          byId: {...prev.feeds.byId, [id]: feed},
          order: [...prev.feeds.order, id],
          nextSeq: prev.feeds.nextSeq + 1,
        },
        ui: {...prev.ui, toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Feed logged', undoable: true}},
      };
    });
  }, [setEntities]);

  const undo = useCallback(() => {
    const snapshot = snapshotRef.current;
    if (snapshot == null) return;
    snapshotRef.current = null;
    setEntities(prev => ({
      // Exact prior data state; the CURRENT ui (tab, scroll, segments)
      // stays untouched per the persistence law.
      session: snapshot.session,
      feeds: snapshot.feeds,
      sleeps: snapshot.sleeps,
      ui: {...prev.ui, toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Restored', undoable: false}},
    }));
  }, [setEntities]);

  // --- entry menu / edit / delete ---
  const onEntryTap = useCallback(
    (id: string) => {
      menuOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      update('ui', {entryMenuId: uiRef.current.entryMenuId === id ? null : id});
    },
    [update],
  );

  const onMenuEdit = useCallback(
    (id: string) => {
      rememberOpener();
      const feed = entities.feeds.byId[id];
      const sleep = entities.sleeps.byId[id];
      if (feed != null && feed.kind === 'bottle') {
        update('ui', {
          entryMenuId: null,
          sheetId: 'quicklog',
          sheetDetent: 'large',
          quickPane: 'bottle',
          editEntryId: id,
          draftMl: feed.ml,
          draftBottleMin: feed.startMin,
          draftOpenTimeField: null,
        });
      } else if (feed != null) {
        update('ui', {
          entryMenuId: null,
          sheetId: 'quicklog',
          sheetDetent: 'large',
          quickPane: 'nursingEdit',
          editEntryId: id,
          draftEditL: feed.leftMin,
          draftEditR: feed.rightMin,
        });
      } else if (sleep != null) {
        update('ui', {
          entryMenuId: null,
          sheetId: 'quicklog',
          sheetDetent: 'large',
          quickPane: 'sleep',
          editEntryId: id,
          draftSleepStartMin: sleep.startMin,
          draftSleepEndMin: sleep.endMin,
          draftOpenTimeField: null,
        });
      }
    },
    [update, entities.feeds.byId, entities.sleeps.byId, rememberOpener],
  );

  // Delete executes immediately + Undo (no confirm dialog). Undo restores
  // the exact timeline position via the full snapshot (stress 9).
  const onMenuDelete = useCallback(
    (id: string) => {
      setEntities(prev => {
        snapshotRef.current = prev;
        const isFeed = prev.feeds.byId[id] != null;
        return {
          ...prev,
          feeds: isFeed
            ? {
                ...prev.feeds,
                byId: Object.fromEntries(Object.entries(prev.feeds.byId).filter(([key]) => key !== id)),
                order: prev.feeds.order.filter(key => key !== id),
              }
            : prev.feeds,
          sleeps: !isFeed
            ? {
                ...prev.sleeps,
                byId: Object.fromEntries(Object.entries(prev.sleeps.byId).filter(([key]) => key !== id)),
                order: prev.sleeps.order.filter(key => key !== id),
              }
            : prev.sleeps,
          ui: {
            ...prev.ui,
            entryMenuId: null,
            toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Entry deleted', undoable: true},
          },
        };
      });
      menuOpenerRef.current = null;
    },
    [setEntities],
  );

  // --- quick log ---
  const openQuickLog = useCallback(
    (pane: QuickPane) => {
      rememberOpener();
      update('ui', {
        sheetId: 'quicklog',
        sheetDetent: 'medium',
        quickPane: pane,
        editEntryId: null,
        draftMl: 90,
        draftBottleMin: NOW_MIN,
        draftSleepStartMin: 730,
        draftSleepEndMin: 805,
        draftOpenTimeField: null,
      });
    },
    [update, rememberOpener],
  );

  const saveBottle = useCallback(() => {
    setEntities(prev => {
      snapshotRef.current = prev;
      const editing = prev.ui.editEntryId;
      if (editing != null && prev.feeds.byId[editing] != null) {
        const patched: FeedEntry = {
          ...prev.feeds.byId[editing],
          ml: prev.ui.draftMl,
          startMin: prev.ui.draftBottleMin,
          startLabel: fmtTime(prev.ui.draftBottleMin),
        };
        return {
          ...prev,
          feeds: {...prev.feeds, byId: {...prev.feeds.byId, [editing]: patched}},
          ui: {
            ...prev.ui,
            sheetId: null,
            editEntryId: null,
            toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Bottle updated', undoable: true},
          },
        };
      }
      const id = `f${prev.feeds.nextSeq}`;
      const feed: FeedEntry = {
        id,
        kind: 'bottle',
        startMin: prev.ui.draftBottleMin,
        startLabel: fmtTime(prev.ui.draftBottleMin),
        leftMin: 0,
        rightMin: 0,
        ml: prev.ui.draftMl,
        endedSide: null,
        memberId: 'm_maya',
      };
      return {
        ...prev,
        feeds: {
          byId: {...prev.feeds.byId, [id]: feed},
          order: [...prev.feeds.order, id],
          nextSeq: prev.feeds.nextSeq + 1,
        },
        ui: {
          ...prev.ui,
          sheetId: null,
          toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Bottle logged', undoable: true},
        },
      };
    });
    restoreOpener();
  }, [setEntities, restoreOpener]);

  const saveSleep = useCallback(() => {
    if (uiRef.current.draftSleepEndMin <= uiRef.current.draftSleepStartMin) {
      announce('End time must be after start');
      return;
    }
    setEntities(prev => {
      snapshotRef.current = prev;
      const startMin = prev.ui.draftSleepStartMin;
      const endMin = prev.ui.draftSleepEndMin;
      const editing = prev.ui.editEntryId;
      if (editing != null && prev.sleeps.byId[editing] != null) {
        const patched: SleepEntry = {
          ...prev.sleeps.byId[editing],
          startMin,
          startLabel: fmtTime(startMin),
          endMin,
          endLabel: fmtTime(endMin),
        };
        return {
          ...prev,
          sleeps: {...prev.sleeps, byId: {...prev.sleeps.byId, [editing]: patched}},
          ui: {
            ...prev.ui,
            sheetId: null,
            editEntryId: null,
            toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Sleep updated', undoable: true},
          },
        };
      }
      const id = `s${prev.sleeps.nextSeq}`;
      const sleep: SleepEntry = {
        id,
        startMin,
        startLabel: fmtTime(startMin),
        endMin,
        endLabel: fmtTime(endMin),
        memberId: 'm_maya',
      };
      return {
        ...prev,
        sleeps: {
          byId: {...prev.sleeps.byId, [id]: sleep},
          order: [...prev.sleeps.order, id],
          nextSeq: prev.sleeps.nextSeq + 1,
        },
        ui: {
          ...prev.ui,
          sheetId: null,
          toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Sleep logged', undoable: true},
        },
      };
    });
    restoreOpener();
  }, [setEntities, restoreOpener, announce]);

  const saveNursingEdit = useCallback(() => {
    setEntities(prev => {
      const editing = prev.ui.editEntryId;
      if (editing == null || prev.feeds.byId[editing] == null) return prev;
      snapshotRef.current = prev;
      const patched: FeedEntry = {
        ...prev.feeds.byId[editing],
        leftMin: prev.ui.draftEditL,
        rightMin: prev.ui.draftEditR,
      };
      return {
        ...prev,
        feeds: {...prev.feeds, byId: {...prev.feeds.byId, [editing]: patched}},
        ui: {
          ...prev.ui,
          sheetId: null,
          editEntryId: null,
          toast: {seq: (prev.ui.toast?.seq ?? 0) + 1, text: 'Feed updated', undoable: true},
        },
      };
    });
    restoreOpener();
  }, [setEntities, restoreOpener]);

  // --- refresh / skeleton (demonstrable only via user action; resolves on
  // the NEXT tap, never on a timer) ---
  const onRefresh = useCallback(() => {
    const u = uiRef.current;
    if (u.refreshState === 'loading') {
      update('ui', {refreshState: 'updated', toast: nextToast('Updated just now', false)});
      return;
    }
    if (u.activeTab === 'careteam') {
      update('ui', {refreshState: 'loading', toast: nextToast('Loading', false)});
    } else {
      update('ui', {refreshState: 'updated', toast: nextToast('Updated just now', false)});
    }
  }, [update, nextToast]);

  // --- tabs: per-tab scroll persistence + the one legal reset ---
  const scroller = () => (typeof document === 'undefined' ? null : document.scrollingElement);
  const selectTab = useCallback(
    (tab: TabId) => {
      const u = uiRef.current;
      if (tab === u.activeTab) {
        // Re-tap active tab: pop to root = scroll to top (iOS convention).
        scroller()?.scrollTo({top: 0});
        return;
      }
      const currentScroll = scroller()?.scrollTop ?? 0;
      update('ui', {
        activeTab: tab,
        scrollByTab: {...u.scrollByTab, [u.activeTab]: currentScroll},
        // Open overlays close on tab switch; the toast dock persists.
        sheetId: null,
        editEntryId: null,
        entryMenuId: null,
        actionSheetOpen: false,
        signOutAlertOpen: false,
        refreshState: u.refreshState === 'loading' ? 'updated' : u.refreshState,
      });
    },
    [update],
  );

  // Restore the entering tab's scroll position after the view swaps.
  const activeTab = ui.activeTab;
  useEffect(() => {
    const saved = uiRef.current.scrollByTab[activeTab] ?? 0;
    scroller()?.scrollTo({top: saved});
  }, [activeTab]);

  const onTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const index = TAB_IDS.indexOf(uiRef.current.activeTab);
      const nextIndex =
        event.key === 'ArrowRight' ? (index + 1) % TAB_IDS.length : (index + TAB_IDS.length - 1) % TAB_IDS.length;
      selectTab(TAB_IDS[nextIndex]);
      const button = document.getElementById(`mpp-tab-${TAB_IDS[nextIndex]}`);
      button?.focus({preventScroll: true});
    },
    [selectTab],
  );

  // Trends large-title sentinel → compact navBar title (user-scroll driven,
  // deterministic; opacity swap only under reduced motion via CSS).
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (activeTab !== 'trends') return undefined;
    const element = sentinelRef.current;
    if (element == null || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first != null) update('ui', {trendsCompactTitle: !first.isIntersecting});
      },
      {rootMargin: '-64px 0px 0px 0px'},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [activeTab, update]);

  const anyOverlayOpen = ui.sheetId != null || ui.actionSheetOpen || ui.signOutAlertOpen;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(anyOverlayOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  const handoffs = handoffItems(feedList, sleepList, ui.units);
  const intervalDisplay = ui.intervalOverride ?? prediction.intervalMin;

  // ---------------------------------------------------------------- render
  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{MOONPIP_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — 52px, grid '1fr auto 1fr', hairline always on. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <MoonpipMark />
          </div>
          {activeTab === 'trends' && ui.trendsCompactTitle ? (
            <h1 style={{...styles.navTitleH1, ...styles.navCompactTitle}} className="mpp-fade">
              Trends
            </h1>
          ) : (
            <h1 style={styles.navTitleH1}>
              <button
                type="button"
                className="mpp-btn mpp-focusable"
                style={styles.navTitleBtn}
                aria-label={`${ui.babyName}, ${BABY.ageLabel} old — open baby profile`}
                onClick={() => {
                  rememberOpener();
                  update('ui', {sheetId: 'baby', sheetDetent: 'medium', draftBabyName: ui.babyName});
                }}>
                <span style={styles.navTitleName}>{ui.babyName}</span>
                <span style={styles.ageChip}>{BABY.ageLabel}</span>
              </button>
            </h1>
          )}
          <div style={styles.navTrailing}>
            {activeTab === 'careteam' ? (
              <button
                type="button"
                className="mpp-btn mpp-focusable"
                style={styles.iconBtn}
                aria-label="Invite a caregiver"
                onClick={() => {
                  rememberOpener();
                  update('ui', {sheetId: 'invite', sheetDetent: 'medium', inviteEmail: '', inviteError: null});
                }}>
                <Icon icon={UserPlusIcon} size="sm" color="inherit" />
              </button>
            ) : (
              <button
                type="button"
                className="mpp-btn mpp-focusable"
                style={styles.iconBtn}
                aria-label="Refresh"
                onClick={onRefresh}>
                <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
              </button>
            )}
          </div>
        </header>

        {/* LIVE SESSION STRIP — persists across ALL tabs while running. */}
        {session.running ? (
          <SideToggleTimer
            session={session}
            reducedMotion={reducedMotion}
            onSwapSide={side => update('session', {activeSide: side})}
            onEnd={endSession}
          />
        ) : null}

        <main style={styles.main}>
          {/* ============================== LOG ============================== */}
          {activeTab === 'log' ? (
            <>
              {ui.refreshState === 'updated' ? (
                <div style={styles.updatedCaption} role="status">
                  Updated just now
                </div>
              ) : null}
              <NextFeedBanner
                nextMin={prediction.nextMin}
                running={session.running}
                startLabel={session.startLabel}
                onStartFeed={startFeed}
              />
              <div style={styles.statChipRow}>
                <span style={styles.statChip}>
                  Feeds <span style={styles.statChipStrong}>{feedList.length}</span>
                </span>
                {/* Spec form is raw minutes — 'Nursing 69m', not '1h 9m'. */}
                <span style={styles.statChip}>
                  Nursing <span style={styles.statChipStrong}>{nursingTodayMin}m</span>
                </span>
                <span style={styles.statChip}>
                  Sleep <span style={styles.statChipStrong}>{fmtDur(sleepTodayMin)}</span>
                </span>
              </div>
              <DualRailDayline
                feeds={feedList}
                sleeps={sleepList}
                units={ui.units}
                compactRails={compactRails}
                gapStartMin={gapStartMin}
                entryMenuId={ui.entryMenuId}
                onEntryTap={onEntryTap}
                onMenuClose={closeEntryMenu}
                onMenuEdit={onMenuEdit}
                onMenuDelete={onMenuDelete}
                onGapTap={() => openQuickLog('bottle')}
              />
              <div style={styles.terminalCaption}>All {feedList.length + sleepList.length} events</div>
              {/* ACTION DOCK — primary verb in the right thumb arc. */}
              <div style={styles.actionDock}>
                <button
                  type="button"
                  className="mpp-btn mpp-focusable"
                  style={styles.dockSecondary}
                  onClick={() => openQuickLog('bottle')}>
                  Quick log
                </button>
                <button
                  type="button"
                  className="mpp-btn mpp-focusable"
                  style={styles.dockPrimary}
                  onClick={session.running ? endSession : startFeed}>
                  <span style={styles.dockPrimaryLabel}>{session.running ? 'End feed' : 'Start feed'}</span>
                  {!session.running && lastNursing != null ? (
                    <span style={styles.dockPrimaryCaption}>
                      Last ended {lastNursing.endedSide} → start {memorySide}
                    </span>
                  ) : null}
                </button>
              </div>
            </>
          ) : null}

          {/* ============================ TRENDS ============================ */}
          {activeTab === 'trends' ? (
            <>
              <div ref={sentinelRef} aria-hidden />
              <h2 style={styles.largeTitle}>Trends</h2>
              <div style={styles.segmented} role="radiogroup" aria-label="Trend metric">
                {(['feeds', 'sleep', 'bottles'] as const).map(segment => (
                  <button
                    key={segment}
                    type="button"
                    role="radio"
                    aria-checked={ui.trendsSegment === segment}
                    className="mpp-btn mpp-focusable"
                    style={ui.trendsSegment === segment ? {...styles.segment, ...styles.segmentActive} : styles.segment}
                    onClick={() => update('ui', {trendsSegment: segment})}
                    onKeyDown={event => {
                      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                      event.preventDefault();
                      const order = ['feeds', 'sleep', 'bottles'] as const;
                      const index = order.indexOf(uiRef.current.trendsSegment);
                      const next =
                        order[event.key === 'ArrowRight' ? (index + 1) % 3 : (index + 2) % 3];
                      update('ui', {trendsSegment: next});
                    }}>
                    {segment === 'feeds' ? 'Feeds' : segment === 'sleep' ? 'Sleep' : 'Bottles'}
                  </button>
                ))}
              </div>
              {ui.trendsSegment === 'feeds' ? (
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Feeds per day</h3>
                  <div style={styles.chartSub}>Fri Jun 19 – Thu Jun 25 · avg 7.5 across completed days</div>
                  <div
                    style={styles.chartPlot}
                    role="img"
                    aria-label={`Feeds per day: 7, 8, 7, 8, 7, 8, and ${feedList.length} so far today; completed-day average 7.5`}>
                    {[...FEEDS_PER_DAY_PAST, feedList.length].map((count, index) => (
                      <div
                        key={`fb-${index}`}
                        style={{
                          ...styles.chartBar,
                          ...(index === 6 ? styles.chartBarHatched : null),
                          height: Math.max(2, count * 12),
                        }}
                      />
                    ))}
                    {/* avg 7.5 → 7.5 × 12 = 90px from the baseline. */}
                    <div style={{...styles.chartAvgLine, bottom: 90}} />
                    <span style={{...styles.chartAvgTag, bottom: 90}}>avg 7.5</span>
                  </div>
                  <div style={styles.chartXRow} aria-hidden>
                    {WEEK_LABELS.map((label, index) => (
                      <span key={`fx-${index}`} style={styles.chartXLabel}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <div style={styles.chartSub}>Today's bar is hatched — day in progress ({feedList.length} feeds)</div>
                </div>
              ) : null}
              {ui.trendsSegment === 'sleep' ? (
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Sleep per day</h3>
                  <div style={styles.chartSub}>Completed days avg 850m = 14h 10m</div>
                  <div
                    style={styles.chartPlot}
                    role="img"
                    aria-label={`Sleep per day in minutes: 870, 825, 855, 900, 810, 840, and ${sleepTodayMin} so far today; average 14 hours 10 minutes`}>
                    {[...SLEEP_MIN_PER_DAY_PAST, sleepTodayMin].map((minutes, index) => (
                      <div
                        key={`sb-${index}`}
                        style={{
                          ...styles.chartBar,
                          ...(index === 6 ? styles.chartBarHatched : null),
                          height: Math.max(2, minutes * 0.12),
                        }}
                      />
                    ))}
                    {/* avg 850 m × 0.12 = 102px from the baseline. */}
                    <div style={{...styles.chartAvgLine, bottom: 102}} />
                    <span style={{...styles.chartAvgTag, bottom: 102}}>14h 10m</span>
                  </div>
                  <div style={styles.chartXRow} aria-hidden>
                    {WEEK_LABELS.map((label, index) => (
                      <span key={`sx-${index}`} style={styles.chartXLabel}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {ui.trendsSegment === 'bottles' ? (
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Bottles this week</h3>
                  {/* Arithmetically locked: 2+1+2+2+2+2+1 = 12 · 200+90+190+
                      220+160+190+90 = 1,140 ml · 1140/12 = 95 ml. */}
                  <div style={styles.bottleStatRow}>
                    <span style={styles.bottleStatCell}>
                      <span style={styles.bottleStatValue}>{BOTTLES_PER_DAY.reduce((a, b) => a + b, 0)}</span>
                      <span style={styles.overline}>Bottles</span>
                    </span>
                    <span style={styles.bottleStatCell}>
                      <span style={styles.bottleStatValue}>
                        {fmtAmount(BOTTLE_ML_PER_DAY.reduce((a, b) => a + b, 0), ui.units)}
                      </span>
                      <span style={styles.overline}>Total</span>
                    </span>
                    <span style={styles.bottleStatCell}>
                      <span style={styles.bottleStatValue}>
                        {fmtAmount(
                          BOTTLE_ML_PER_DAY.reduce((a, b) => a + b, 0) / BOTTLES_PER_DAY.reduce((a, b) => a + b, 0),
                          ui.units,
                        )}
                      </span>
                      <span style={styles.overline}>Avg / bottle</span>
                    </span>
                  </div>
                  <div
                    style={{...styles.chartPlot, height: 60, marginTop: 20}}
                    role="img"
                    aria-label="Bottles per day: 2, 1, 2, 2, 2, 2, 1">
                    {BOTTLES_PER_DAY.map((count, index) => (
                      // 2px floor so a low count never renders invisible.
                      <div key={`bb-${index}`} style={{...styles.chartBar, height: Math.max(2, count * 24)}} />
                    ))}
                  </div>
                  <div style={styles.chartXRow} aria-hidden>
                    {WEEK_LABELS.map((label, index) => (
                      <span key={`bx-${index}`} style={styles.chartXLabel}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div style={{height: 24}} />
            </>
          ) : null}

          {/* =========================== CARE TEAM ========================== */}
          {activeTab === 'careteam' ? (
            <>
              {ui.refreshState === 'updated' ? (
                <div style={styles.updatedCaption} role="status">
                  Updated just now
                </div>
              ) : null}
              <h2 style={{...styles.sectionHeader, ...styles.sectionHeaderBleed}}>Today · handoff</h2>
              {/* Full-bleed stream (feed convention: full-width dividers). */}
              {ui.refreshState === 'loading' ? (
                <SkeletonStream />
              ) : (
                <div>
                  {handoffs.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 ? <div style={styles.rowDividerFull} aria-hidden /> : null}
                      <HandoffLine item={item} />
                    </div>
                  ))}
                </div>
              )}
              <h2 style={styles.sectionHeader}>Members</h2>
              <div style={styles.listCard}>
                {MEMBERS.map((member, index) => (
                  <div key={member.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
                    <div style={styles.memberRow}>
                      <span style={{...styles.avatar, background: member.avatarBg}} aria-hidden>
                        {member.initials}
                      </span>
                      <span style={styles.memberText}>
                        <span style={styles.memberName}>{member.name}</span>
                        <span style={styles.memberRole}>{member.role}</span>
                      </span>
                      {member.isYou ? <span style={styles.youChip}>You</span> : null}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{height: 24}} />
            </>
          ) : null}

          {/* =========================== SETTINGS =========================== */}
          {activeTab === 'settings' ? (
            <>
              <h2 style={styles.sectionHeader}>Baby</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="mpp-btn mpp-focusable"
                  style={{...styles.row60, width: '100%'}}
                  onClick={() => {
                    rememberOpener();
                    update('ui', {sheetId: 'baby', sheetDetent: 'medium', draftBabyName: ui.babyName});
                  }}>
                  <span style={styles.rowText}>
                    <span style={{...styles.rowLabel, fontWeight: 500}}>{ui.babyName}</span>
                    <span style={styles.rowSecondary}>Born {BABY.bornLabel}</span>
                  </span>
                  <span style={styles.chevron}>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
                <div style={styles.rowDivider} aria-hidden />
                <div style={styles.row44}>
                  <span style={{...styles.rowLabel, flex: 1}}>Units</span>
                  <div style={styles.miniSegmented} role="radiogroup" aria-label="Bottle units">
                    {(['ml', 'oz'] as const).map(unit => (
                      <button
                        key={unit}
                        type="button"
                        role="radio"
                        aria-checked={ui.units === unit}
                        className="mpp-btn mpp-focusable"
                        style={ui.units === unit ? {...styles.miniSegment, ...styles.miniSegmentActive} : styles.miniSegment}
                        onClick={() => update('ui', {units: unit})}>
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Feeding</h2>
              <div style={styles.listCard}>
                {/* Whole row is the switch (role=switch, aria-checked). */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={ui.reminderOn}
                  className="mpp-btn mpp-focusable"
                  style={{...styles.row44, width: '100%'}}
                  onClick={() => update('ui', {reminderOn: !ui.reminderOn})}>
                  <span style={{...styles.rowLabel, flex: 1}}>Feed reminder window</span>
                  <span
                    style={ui.reminderOn ? {...styles.switchTrack, ...styles.switchTrackOn} : styles.switchTrack}
                    aria-hidden>
                    <span
                      className="mpp-anim"
                      style={ui.reminderOn ? {...styles.switchThumb, ...styles.switchThumbOn} : styles.switchThumb}
                    />
                  </span>
                </button>
                <div style={styles.rowDivider} aria-hidden />
                <div style={styles.row44}>
                  <span style={{...styles.rowLabel, flex: 1}}>Expected interval</span>
                  <span
                    style={{...styles.rowValue, marginRight: 8}}
                    role="spinbutton"
                    tabIndex={0}
                    className="mpp-focusable"
                    aria-label="Expected feed interval"
                    aria-valuenow={intervalDisplay}
                    aria-valuemin={90}
                    aria-valuemax={300}
                    aria-valuetext={fmtDur(intervalDisplay)}
                    onKeyDown={event => {
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        update('ui', {intervalOverride: Math.min(300, intervalDisplay + 5)});
                      } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        update('ui', {intervalOverride: Math.max(90, intervalDisplay - 5)});
                      }
                    }}>
                    {fmtDur(intervalDisplay)}
                  </span>
                  <div style={styles.stepper}>
                    <button
                      type="button"
                      className="mpp-btn mpp-focusable"
                      style={{...styles.stepperHalf, ...(intervalDisplay <= 90 ? {opacity: 0.35} : null)}}
                      disabled={intervalDisplay <= 90}
                      aria-label="Decrease expected interval by 5 minutes"
                      onClick={() => update('ui', {intervalOverride: Math.max(90, intervalDisplay - 5)})}>
                      <Icon icon={MinusIcon} size="sm" color="inherit" />
                    </button>
                    <div style={styles.stepperRule} aria-hidden />
                    <button
                      type="button"
                      className="mpp-btn mpp-focusable"
                      style={{...styles.stepperHalf, ...(intervalDisplay >= 300 ? {opacity: 0.35} : null)}}
                      disabled={intervalDisplay >= 300}
                      aria-label="Increase expected interval by 5 minutes"
                      onClick={() => update('ui', {intervalOverride: Math.min(300, intervalDisplay + 5)})}>
                      <Icon icon={PlusIcon} size="sm" color="inherit" />
                    </button>
                  </div>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Account</h2>
              <div style={styles.listCard}>
                <div style={styles.row44}>
                  <span style={styles.rowText}>
                    <span style={styles.rowLabel}>Maya Ellison</span>
                  </span>
                  <span style={styles.rowValue}>maya@ellison.family</span>
                  <button
                    type="button"
                    className="mpp-btn mpp-focusable"
                    style={{...styles.iconBtn, marginRight: -12}}
                    aria-haspopup="dialog"
                    aria-label="Account actions"
                    onClick={() => {
                      rememberOpener();
                      update('ui', {actionSheetOpen: true});
                    }}>
                    <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
                  </button>
                </div>
              </div>
              <div style={{height: 24}} />
            </>
          ) : null}
        </main>

        {/* THE one polite live region — STICKY dock above the tabBar. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {ui.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undoable ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="mpp-btn mpp-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 4 tabs, arrow-key tablist. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Moonpip sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mpp-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="mpp-btn mpp-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="lg" color="inherit" />
                <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ======================= OVERLAYS (absolute) ===================== */}
        {ui.sheetId === 'quicklog' ? (
          <Sheet
            titleId="mpp-quicklog-title"
            title={ui.editEntryId != null ? 'Edit entry' : 'Quick log'}
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            footer={
              ui.quickPane === 'bottle' ? (
                <button type="button" className="mpp-btn mpp-focusable" style={styles.saveBtn} onClick={saveBottle}>
                  {ui.editEntryId != null ? 'Save changes' : 'Save bottle'}
                </button>
              ) : ui.quickPane === 'sleep' ? (
                <button type="button" className="mpp-btn mpp-focusable" style={styles.saveBtn} onClick={saveSleep}>
                  {ui.editEntryId != null ? 'Save changes' : 'Save sleep'}
                </button>
              ) : (
                <button type="button" className="mpp-btn mpp-focusable" style={styles.saveBtn} onClick={saveNursingEdit}>
                  Save changes
                </button>
              )
            }>
            {ui.quickPane !== 'nursingEdit' && ui.editEntryId == null ? (
              <div style={styles.sheetSegmented} role="radiogroup" aria-label="Quick log type">
                {(['bottle', 'sleep'] as const).map(pane => (
                  <button
                    key={pane}
                    type="button"
                    role="radio"
                    aria-checked={ui.quickPane === pane}
                    className="mpp-btn mpp-focusable"
                    style={ui.quickPane === pane ? {...styles.segment, ...styles.segmentActive} : styles.segment}
                    onClick={() => update('ui', {quickPane: pane})}>
                    {pane === 'bottle' ? 'Bottle' : 'Sleep'}
                  </button>
                ))}
              </div>
            ) : null}
            {ui.quickPane === 'bottle' ? (
              <div style={{paddingTop: 16}}>
                <GloveStepper valueMl={ui.draftMl} units={ui.units} onChange={ml => update('ui', {draftMl: ml})} />
                <div style={{marginTop: 16}}>
                  <TimeRow
                    label="Time"
                    valueMin={ui.draftBottleMin}
                    open={ui.draftOpenTimeField === 'bottle'}
                    onToggle={() =>
                      update('ui', {draftOpenTimeField: ui.draftOpenTimeField === 'bottle' ? null : 'bottle'})
                    }
                    onChange={min => update('ui', {draftBottleMin: min})}
                  />
                </div>
              </div>
            ) : null}
            {ui.quickPane === 'sleep' ? (
              <div style={{paddingTop: 8}}>
                <TimeRow
                  label="Fell asleep"
                  valueMin={ui.draftSleepStartMin}
                  open={ui.draftOpenTimeField === 'sleepStart'}
                  onToggle={() =>
                    update('ui', {draftOpenTimeField: ui.draftOpenTimeField === 'sleepStart' ? null : 'sleepStart'})
                  }
                  onChange={min => update('ui', {draftSleepStartMin: min})}
                />
                <div style={styles.rowDividerFull} aria-hidden />
                <TimeRow
                  label="Woke up"
                  valueMin={ui.draftSleepEndMin}
                  open={ui.draftOpenTimeField === 'sleepEnd'}
                  onToggle={() =>
                    update('ui', {draftOpenTimeField: ui.draftOpenTimeField === 'sleepEnd' ? null : 'sleepEnd'})
                  }
                  onChange={min => update('ui', {draftSleepEndMin: min})}
                />
                <div style={styles.rowSecondary}>
                  Duration {fmtDur(Math.max(0, ui.draftSleepEndMin - ui.draftSleepStartMin))}
                </div>
              </div>
            ) : null}
            {ui.quickPane === 'nursingEdit' ? (
              <div style={{paddingTop: 8}}>
                {(['L', 'R'] as const).map(side => {
                  const value = side === 'L' ? ui.draftEditL : ui.draftEditR;
                  const patchKey = side === 'L' ? 'draftEditL' : 'draftEditR';
                  return (
                    <div key={side} style={styles.row44}>
                      <span style={{...styles.rowLabel, flex: 1}}>{side === 'L' ? 'Left side' : 'Right side'}</span>
                      <span
                        style={{...styles.rowValue, marginRight: 8}}
                        role="spinbutton"
                        tabIndex={0}
                        className="mpp-focusable"
                        aria-label={`${side === 'L' ? 'Left' : 'Right'} side minutes`}
                        aria-valuenow={value}
                        aria-valuemin={0}
                        aria-valuemax={60}
                        aria-valuetext={`${value} minutes`}
                        onKeyDown={event => {
                          if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            update('ui', {[patchKey]: Math.min(60, value + 1)} as Partial<UiState>);
                          } else if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            update('ui', {[patchKey]: Math.max(0, value - 1)} as Partial<UiState>);
                          }
                        }}>
                        {value}m
                      </span>
                      <div style={styles.stepper}>
                        <button
                          type="button"
                          className="mpp-btn mpp-focusable"
                          style={{...styles.stepperHalf, ...(value <= 0 ? {opacity: 0.35} : null)}}
                          disabled={value <= 0}
                          aria-label={`Decrease ${side === 'L' ? 'left' : 'right'} minutes`}
                          onClick={() => update('ui', {[patchKey]: Math.max(0, value - 1)} as Partial<UiState>)}>
                          <Icon icon={MinusIcon} size="sm" color="inherit" />
                        </button>
                        <div style={styles.stepperRule} aria-hidden />
                        <button
                          type="button"
                          className="mpp-btn mpp-focusable"
                          style={{...styles.stepperHalf, ...(value >= 60 ? {opacity: 0.35} : null)}}
                          disabled={value >= 60}
                          aria-label={`Increase ${side === 'L' ? 'left' : 'right'} minutes`}
                          onClick={() => update('ui', {[patchKey]: Math.min(60, value + 1)} as Partial<UiState>)}>
                          <Icon icon={PlusIcon} size="sm" color="inherit" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </Sheet>
        ) : null}

        {ui.sheetId === 'baby' ? (
          <Sheet
            titleId="mpp-baby-title"
            title="Baby profile"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            footer={
              <button
                type="button"
                className="mpp-btn mpp-focusable"
                style={styles.saveBtn}
                onClick={() => {
                  const trimmed = uiRef.current.draftBabyName.trim();
                  if (trimmed.length === 0) {
                    announce('Enter a name');
                    return;
                  }
                  update('ui', {babyName: trimmed, sheetId: null, toast: nextToast('Profile updated', false)});
                  restoreOpener();
                }}>
                Save profile
              </button>
            }>
            <div style={styles.formField}>
              <label style={styles.fieldLabel} htmlFor="mpp-baby-name">
                Name
              </label>
              {/* Long-name stress: 'Persephone Wilhelmina' must ellipsize
                  in the 200px navBar title, chip stays one line. */}
              <input
                id="mpp-baby-name"
                style={styles.fieldInput}
                className="mpp-focusable"
                value={ui.draftBabyName}
                onChange={event => update('ui', {draftBabyName: event.target.value})}
              />
            </div>
            <div style={{marginTop: 8}}>
              <div style={styles.row44}>
                <span style={{...styles.rowLabel, flex: 1}}>Born</span>
                <span style={styles.rowValue}>{BABY.bornLabel}</span>
              </div>
              <div style={styles.rowDividerFull} aria-hidden />
              <div style={styles.row44}>
                <span style={{...styles.rowLabel, flex: 1}}>Age</span>
                <span style={styles.rowValue}>
                  {BABY.ageLabel} · {BABY.ageDays} days
                </span>
              </div>
              <div style={styles.rowDividerFull} aria-hidden />
              <div style={styles.row44}>
                <span style={{...styles.rowLabel, flex: 1}}>Weight</span>
                <span style={styles.rowValue}>{BABY.weightLabel}</span>
              </div>
            </div>
          </Sheet>
        ) : null}

        {ui.sheetId === 'invite' ? (
          <Sheet
            titleId="mpp-invite-title"
            title="Invite caregiver"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            footer={
              <button
                type="button"
                className="mpp-btn mpp-focusable"
                style={styles.saveBtn}
                onClick={() => {
                  const email = uiRef.current.inviteEmail.trim();
                  if (!email.includes('@') || email.length < 5) {
                    update('ui', {inviteError: 'Enter a valid email'});
                    return;
                  }
                  update('ui', {
                    sheetId: null,
                    inviteError: null,
                    toast: nextToast(`Invite sent to ${email}`, false),
                  });
                  restoreOpener();
                }}>
                Send invite
              </button>
            }>
            <div style={styles.formField}>
              <label style={styles.fieldLabel} htmlFor="mpp-invite-email">
                Email
              </label>
              <input
                id="mpp-invite-email"
                type="email"
                inputMode="email"
                placeholder="caregiver@example.com"
                style={{
                  ...styles.fieldInput,
                  ...(ui.inviteError != null ? {boxShadow: `inset 0 0 0 2px ${ERROR_STRONG}`} : null),
                }}
                className="mpp-focusable"
                value={ui.inviteEmail}
                aria-invalid={ui.inviteError != null}
                aria-describedby={ui.inviteError != null ? 'mpp-invite-error' : undefined}
                onChange={event => {
                  const value = event.target.value;
                  update('ui', {
                    inviteEmail: value,
                    // Reward the fix immediately; validation itself fires
                    // on blur/submit, never per keystroke.
                    inviteError:
                      uiRef.current.inviteError != null && value.includes('@') && value.length >= 5
                        ? null
                        : uiRef.current.inviteError,
                  });
                }}
                onBlur={() => {
                  const email = uiRef.current.inviteEmail.trim();
                  if (email.length > 0 && (!email.includes('@') || email.length < 5)) {
                    update('ui', {inviteError: 'Enter a valid email'});
                  }
                }}
              />
              {ui.inviteError != null ? (
                <span id="mpp-invite-error" style={styles.fieldError}>
                  <Icon icon={MailIcon} size="sm" color="inherit" />
                  {ui.inviteError}
                </span>
              ) : null}
            </div>
            <div style={{...styles.rowSecondary, marginTop: 12}}>
              Invited caregivers can log feeds and sleep and see the handoff stream.
            </div>
          </Sheet>
        ) : null}

        {/* ACTION SHEET — sign-out lives behind one intent step; Cancel is
            its own card; focus lands on Cancel (safe default). */}
        {ui.actionSheetOpen ? (
          <ActionSheetAccount
            onExport={() => {
              update('ui', {actionSheetOpen: false, toast: nextToast('Week exported · 10 events', false)});
              restoreOpener();
            }}
            onSignOut={() => update('ui', {actionSheetOpen: false, signOutAlertOpen: true})}
            onCancel={closeActionSheet}
          />
        ) : null}

        {/* CENTERED ALERT — blocking, verb-labeled buttons; scrim click
            does NOT dismiss. Confirming resets the demo fixtures. */}
        {ui.signOutAlertOpen ? (
          <SignOutAlert
            onCancel={closeAlert}
            onConfirm={() => {
              snapshotRef.current = null;
              setEntities({
                ...INITIAL_ENTITIES,
                ui: {...INITIAL_ENTITIES.ui, toast: {seq: (ui.toast?.seq ?? 0) + 1, text: 'Signed out · demo fixtures reset', undoable: false}},
              });
              openerRef.current = null;
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET + ALERT — split out so mount effects own their focus.
// ---------------------------------------------------------------------------

interface ActionSheetAccountProps {
  onExport: () => void;
  onSignOut: () => void;
  onCancel: () => void;
}

function ActionSheetAccount({onExport, onSignOut, onCancel}: ActionSheetAccountProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    cancelRef.current?.focus({preventScroll: true});
  }, []);
  return (
    <>
      <div style={styles.sheetScrim} className="mpp-fade" onClick={onCancel} aria-hidden />
      <div
        ref={wrapRef}
        style={styles.actionSheetWrap}
        className="mpp-sheet-in"
        role="dialog"
        aria-modal
        aria-label="Account actions"
        onKeyDown={event => trapTabKey(event, wrapRef.current)}>
        <div style={styles.actionCard}>
          <div style={styles.actionContext}>Signed in as maya@ellison.family</div>
          <div style={styles.rowDividerFull} aria-hidden />
          <button type="button" className="mpp-btn mpp-focusable" style={styles.actionRow} onClick={onExport}>
            Export this week (CSV)
          </button>
          <div style={styles.rowDividerFull} aria-hidden />
          <button
            type="button"
            className="mpp-btn mpp-focusable"
            style={{...styles.actionRow, ...styles.actionRowDestructive}}
            onClick={onSignOut}>
            Sign out
          </button>
        </div>
        <div style={styles.actionCard}>
          <button ref={cancelRef} type="button" className="mpp-btn mpp-focusable" style={styles.actionCancel} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

interface SignOutAlertProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function SignOutAlert({onCancel, onConfirm}: SignOutAlertProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    cancelRef.current?.focus({preventScroll: true});
  }, []);
  return (
    <>
      <div style={styles.alertScrim} aria-hidden />
      <div
        ref={alertRef}
        style={styles.alert}
        role="alertdialog"
        aria-modal
        aria-labelledby="mpp-signout-title"
        aria-describedby="mpp-signout-body"
        onKeyDown={event => trapTabKey(event, alertRef.current)}>
        <div style={styles.alertBody}>
          <h3 id="mpp-signout-title" style={styles.alertTitle}>
            Sign out?
          </h3>
          <p id="mpp-signout-body" style={styles.alertText}>
            This signs Maya out and resets the demo fixtures.
          </p>
        </div>
        <div style={styles.alertBtnRow}>
          <button ref={cancelRef} type="button" className="mpp-btn mpp-focusable" style={styles.alertBtn} onClick={onCancel}>
            Cancel
          </button>
          <div style={styles.alertBtnRule} aria-hidden />
          <button
            type="button"
            className="mpp-btn mpp-focusable"
            style={{...styles.alertBtn, fontWeight: 600, color: ERROR_STRONG}}
            onClick={onConfirm}>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}


