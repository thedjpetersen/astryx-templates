// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Milemark, an hours-plus-mileage
 *   logger for delivery/trade contractors, frozen at NOW_MIN 945
 *   (Thu Jul 2 2026, 3:45 PM). One timesheet store: week Mon Jun 29 –
 *   Sun Jul 5, rates $24.00/hr (= 40¢/min) and $0.60/mi (= 6¢/tenth).
 *   Mon: two worked segments (360 m) + two trips (42.5 mi) + $10 bonus =
 *   $179.50 submitted; Tue: 330 m + 38.0 mi = $154.80; Wed: off; Thu
 *   (today): closed 9:00–12:00 + OPEN segment {startMin 780, durMin 165}
 *   ending exactly at NOW + 24.5 mi + $5 bonus = $157.70; Fri–Sun empty.
 *   Odometer chain is continuous by construction 048150.0 → 048255.0 =
 *   105.0 mi (the spec's own CORRECTION applied: Thu Trip A
 *   048230.5→048244.7, Trip B 048244.7→048255.0; stepper draft
 *   [0,4,8,2,5,5,0]). Cross-checks verified in-fixture: week minutes
 *   1035 = 17h 15m, miles 105.0, weekCents 41400+6300+1500 = 49200 =
 *   $492.00 = Σ per-day; unsubmitted Tue+Thu = $312.50. No Date.now(),
 *   no Math.random(), no network media.
 * @output Milemark — Hours & Mileage Log: a 390px MOBILE shell. 52px
 *   navBar (odometer-digit brand mark · 'Milemark' · live 'Wk $492.00'
 *   pill) over four tabs (Week / Trips / Rates / Export, 64px tabBar,
 *   Export badge '2'). Week tab: TODAY hero card with the DayShiftBar
 *   (44px track + 12px mileage-tick lane, worked fills vs striped drive
 *   segments, dashed 'now' rule, draggable open-segment edge handle),
 *   3-col stat row, ±15m stepper (the handle's visible button path),
 *   32px RateDisc + legend, 'Log odometer' → MEDIUM sheet with the
 *   7-cell OdometerStepper; seven 88/60px day rows with 40px RateDiscs
 *   and compact bars → LARGE day-edit sheet (120px RateDisc + legend,
 *   editable segment rows with anchored menus + Undo deletes). Trips:
 *   swipe-to-reveal delete (44×44 ellipsis fallback + long-press
 *   garnish). Export: live unsubmitted rollup + 'Export 2 days' with
 *   Undo. SIGNATURE: setOpenDur() is the single choke point — dragging
 *   the handle or stepping ±15m re-derives, in the same frame, the
 *   navBar week pill, hero stats, RateDisc angles, the week list's
 *   compact bar + trailing earnings, the week caption, and the Export
 *   tab's unsubmitted total.
 * @position Page template; emitted by `astryx template mobile-hours-mileage-log`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative',
 *   flex column, width:'100%', minHeight:'100dvh', overflowX:'clip'};
 *   the 390px stage IS the phone viewport (no simulated OS chrome: no
 *   status bar, notch, home indicator, or bezel — the navBar at y=0 is
 *   the first pixel). All overlays (scrim, sheets, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. The toastDock is sticky-in-flow (bottom 76,
 *   above the 64px tabBar) so it pins to the VIEWPORT bottom on tall
 *   scrolling tabs; it switches to shell-absolute only while the shell
 *   is scroll-locked by an open sheet. Stage clips to --radius-container;
 *   shell paints full-bleed square, no own radius.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, or 68 for disc-led day rows);
 *   no desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Milemark blue — the demo --color-brand is the demo
 *   logo color, so the spec hex is quarantined here per house rule).
 *   Sanctioned non-brand literals, each with contrast math at the
 *   declaration: worked/drive segment fills, open-shift chip wash,
 *   bonus slice, success icon green, stepper rest edge (amendment:
 *   interactive boundaries ≥3:1 vs their actual surface), scrim.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr'); tabBar 64px sticky
 *   bottom z20, four flex-1 tabItems (24px icon over 11px/500 label,
 *   4px gap); rows 44px utility / 60px two-line / 72px trip media (48px
 *   thumb, 12px radius) / 88px day rows (40px RateDisc + compact bar) /
 *   60px empty-day rows; sectionHeader 13px/600 uppercase 0.06em at
 *   32px (16 gutter + 16 card pad), 20px top / 8px bottom; DayShiftBar
 *   hero 44px track + 12px tick lane, compact 12px + 4px; stepper
 *   96×32; sheet detents 55% medium / calc(100% − 56px) large, 24px
 *   grabber zone with 36×5 pill, 52px sheet header; toastDock sticky
 *   bottom 76 z30. TYPE (Figtree via --font-family-body): 22/700 sheet
 *   RateDisc numeral · 17/600 nav & card titles, 17/700 tabular values
 *   · 16/400–500 body & row primary (16 is the floor) · 13/400
 *   secondary · 11/500 tab labels, overlines, tick captions; nothing
 *   under 11px (10px only on the 16px badge pill per the foundations'
 *   badge spec); tabular-nums on every mutating numeral. Touch: every
 *   target ≥44×44 with ≥8px clearance or merged full-row; every gesture
 *   (handle drag, swipe rows, sheet drag) has a visible button path
 *   (stepper halves, per-row 44×44 ellipsis, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: DayShiftBar percentages are width-relative so bars
 *   scale losslessly; at ≤350px the hero stat row keeps 3 columns with
 *   values at 16px/700 and the navBar pill drops 'Wk'; OdometerStepper
 *   cells go clamp(32px…44px) wide and below 390px container width the
 *   chevrons keep 44px height (cells grow to 72px tall to host them —
 *   fallback per spec); tabBar labels never wrap; trip-row trailing
 *   meta minWidth 72 with the two-line stack ellipsizing first.
 *   overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   div (container width, not viewport — the demo stage is ~1045px in a
 *   1440px window). At ≥720px the shell renders as a centered phone
 *   column (maxWidth 430, marginInline auto, borderInline hairline) on
 *   the page background; no adaptive relayout — the anatomy is
 *   deliberately phone geometry.
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
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleDollarSignIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RouteIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Milemark blue). #1971C2 on #FFFFFF = 5.2:1
// (passes 4.5:1 for the navBar pill + chip text); #74C0FC on the dark card
// (~#1F1B16) ≈ 7.8:1.
const BRAND_ACCENT = 'light-dark(#1971C2, #74C0FC)';
// Worked-segment / primary-button fill. Light #1971C2 vs the muted track
// (~#F1EDE7) ≈ 3.9:1; dark #3B82C4 vs the dark muted track ≈ 3.4:1 — both
// clear the 3:1 non-text bar for meaningful rest fills vs their ACTUAL
// surface (foundations amendment).
const WORKED_FILL = 'light-dark(#1971C2, #3B82C4)';
// Text over a WORKED_FILL surface. Light: #FFFFFF on #1971C2 = 5.2:1. Dark:
// white on #3B82C4 ≈ 4.2:1 (fails 4.5), so the dark side flips to a deep
// navy — #06233B on #3B82C4 ≈ 5.0:1. (Spec said 'white' labels; deviation
// for dark-scheme 4.5:1, math here.)
const FILL_TEXT = 'light-dark(#FFFFFF, #06233B)';
// Drive-segment fill (distinct from worked by 45° stripes, 24px inset
// geometry, AND hue — differing by more than hue per spec). The stripe
// alternation carries internal ≥3:1 structure: light #94C2E8 vs its 40%
// mix ≈ white; dark #1E4E7C vs its mix toward the dark track.
const DRIVE_FILL = 'light-dark(#94C2E8, #1E4E7C)';
const DRIVE_SOFT = `color-mix(in srgb, ${DRIVE_FILL} 45%, transparent)`;
// Open-shift status chip wash. Contrast is carried by the TEXT, not the
// wash: #1971C2 on #E7F0FA ≈ 4.8:1 light; #74C0FC on #12314F ≈ 6.5:1 dark.
// (Spec claimed 'fill vs card 3.2:1' — the wash is actually ~1.1:1 vs the
// white card; corrected here, text carries the 4.5:1, noted as deviation.)
const OPEN_CHIP_FILL = 'light-dark(#E7F0FA, #12314F)';
// Bonus RateDisc slice: #B07D1F on the white card ≈ 3.4:1; #E8C06A on the
// dark card ≈ 8.0:1 — both clear 3:1 for non-text slices (spec pair).
const BONUS_COLOR = 'light-dark(#B07D1F, #E8C06A)';
// Success check icon (16px graphic, needs 3:1 not 4.5): #2F9E44 on white ≈
// 3.5:1; #69DB7C on the dark card ≈ 9.6:1. The 'Matches Trip B' TEXT next
// to it stays --color-text-primary (green 13px text would fail 4.5:1 in
// light — deviation from spec's green text, math here).
const SUCCESS_ICON = 'light-dark(#2F9E44, #69DB7C)';
// Stepper/odometer-cell rest EDGE — foundations amendment: interactive
// control boundaries need ≥3:1 vs their actual surface. #8C8578 on the
// white hero card ≈ 3.1:1; #86807A on the dark card (~#1F1B16) ≈ 3.2:1.
const CONTROL_EDGE = 'light-dark(#8C8578, #86807A)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Brand-tinted wash for the 12% brand surfaces (brand mark chip, active
// swatches). Decorative only; adjacent text carries contrast.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// reduced-motion guard. Transitions animate transform/opacity (plus the
// spec-sanctioned 120ms DayShiftBar width) and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const MMK_CSS = `
.mmk-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mmk-btn:disabled { cursor: default; }
.mmk-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.mmk-anim { transition: transform 240ms ease, opacity 240ms ease; }
.mmk-fade { transition: opacity 200ms ease; }
/* Spec-sanctioned: DayShiftBar width changes at 120ms (width is the datum). */
.mmk-bar { transition: width 120ms ease; }
@keyframes mmk-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.mmk-sheet-in { animation: mmk-sheet-in 240ms ease; }
.mmk-vh {
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
  .mmk-anim, .mmk-fade, .mmk-bar { transition: none; }
  .mmk-sheet-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width.
  wrap: {width: '100%'},
  // THE SHELL CONTRACT (mobile foundations, verbatim). No width literals.
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
  // Scroll lock while a sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur ALWAYS
  // ON (chosen: always-on, noted per contract).
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end', paddingInlineEnd: 8},
  navTitle: {fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap'},
  // 44×44 non-button brand slot holding the 24px odometer-digit mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Week-earnings pill — 32px tall, muted fill, BRAND_ACCENT tabular text.
  weekPill: {
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // TAB BAR — exactly 64px, sticky bottom z20, four flex-1 tabItems.
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 64,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // Badge: 16px min pill; fill stays the saturated blue in BOTH schemes so
  // the 10px numeral keeps ≥4.5:1 (white on #1971C2 = 5.2:1; FILL_TEXT
  // handles the dark side at 5.0:1 on #3B82C4).
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
    background: WORKED_FILL,
    color: FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px, 20px top / 8px bottom.
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
  // TODAY HERO card — inset 16, padding 16.
  heroCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  heroHeader: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  heroTitle: {fontSize: 17, fontWeight: 600},
  openChip: {
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: OPEN_CHIP_FILL,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  statRow: {display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8},
  statCell: {display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0},
  statLabel: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  statValue: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statValueNarrow: {fontSize: 16},
  // 36px control row: stepper + trailing tabular value.
  stepperRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  stepperLabel: {flex: 1, minWidth: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  // STEPPER — 96×32 track split into minus/plus halves; rest edge at ≥3:1
  // vs the hero card per the interactive-boundary amendment (CONTROL_EDGE).
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperHalf: {
    width: 47,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperSplit: {width: 1, background: CONTROL_EDGE},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  heroLegendRow: {display: 'flex', alignItems: 'center', gap: 12, minHeight: 32},
  legendInline: {display: 'flex', flexWrap: 'wrap', gap: 8, rowGap: 4, minWidth: 0},
  legendItem: {display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, whiteSpace: 'nowrap'},
  legendSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  legendAmount: {color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // 48px full-width secondary button (the primary verb stays bottom-third
  // via the tabBar; this is deliberately secondary-styled).
  secondaryBtn: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 600,
  },
  // DAY ROWS — 88px with data (two-line + compact bar), 60px empty.
  dayRow: {
    width: '100%',
    minHeight: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 10,
  },
  dayRowEmpty: {minHeight: 60, paddingBlock: 8},
  dayLeading: {width: 40, height: 40, flexShrink: 0, display: 'grid', placeItems: 'center'},
  // Passive placeholder (not an interactive boundary — separator class):
  // 40px dashed --color-border circle for empty days.
  emptyDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1px dashed var(--color-border)',
  },
  dayBody: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4},
  dayLabelRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  todayDot: {width: 8, height: 8, borderRadius: '50%', background: BRAND_ACCENT, flexShrink: 0},
  dayLabel: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dayMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dayTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  dayEarnings: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // DAY SHIFT BAR — hero: 44px track + 12px tick lane; compact: 12px + 4px.
  barTrack: {
    position: 'relative',
    height: 44,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'visible',
  },
  barTrackCompact: {height: 12, borderRadius: 4},
  barOffLabel: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  workedSeg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    background: WORKED_FILL,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  workedSegCompact: {borderRadius: 3},
  // Open segment: 6px left corners, square right where the handle butts on
  // (segment + handle read as one 6px capsule).
  workedSegOpen: {borderRadius: '6px 0 0 6px'},
  // Duration label rides ABOVE the drive-stripe layer on a small solid
  // WORKED_FILL chip so it keeps its 4.5:1 (FILL_TEXT math above) even
  // where a striped drive band crosses the fill.
  segLabel: {
    position: 'relative',
    zIndex: 2,
    fontSize: 13,
    fontWeight: 600,
    color: FILL_TEXT,
    background: WORKED_FILL,
    paddingInline: 4,
    borderRadius: 4,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  driveSeg: {
    position: 'absolute',
    top: '50%',
    height: 24,
    marginTop: -12,
    borderRadius: 6,
    background: `repeating-linear-gradient(45deg, ${DRIVE_FILL} 0px, ${DRIVE_FILL} 2px, ${DRIVE_SOFT} 2px, ${DRIVE_SOFT} 4px)`,
  },
  driveSegCompact: {height: 8, marginTop: -4, borderRadius: 3},
  // Edge handle — 20px visual grabber inside a 44×44 hit button.
  handleHit: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginTop: -22,
    display: 'grid',
    placeItems: 'center',
    touchAction: 'none',
    zIndex: 2,
  },
  handleGrab: {
    width: 20,
    height: 44,
    borderRadius: '0 6px 6px 0',
    background: WORKED_FILL,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  handleBar: {width: 2, height: 16, borderRadius: 1, background: FILL_TEXT},
  nowRule: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 0,
    borderLeft: `1px dashed ${BRAND_ACCENT}`,
    zIndex: 1,
  },
  nowFlag: {
    position: 'absolute',
    top: -16,
    left: -12,
    fontSize: 11,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  tickLane: {position: 'relative', height: 12, marginTop: 4},
  tickLaneCompact: {height: 4, marginTop: 2},
  tick: {
    position: 'absolute',
    top: 2,
    width: 2,
    height: 8,
    background: 'var(--color-text-secondary)',
  },
  tickCompact: {top: 0, height: 4},
  tickCaption: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '12px',
  },
  // TRIPS TAB — 72px media rows.
  tripRowOuter: {position: 'relative', overflow: 'hidden'},
  tripRevealBlock: {
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
    background: 'var(--color-error)',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  tripRowInner: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 72,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  tripThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  tripBody: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  tripName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tripOdo: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tripTrailing: {
    minWidth: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  tripMiles: {fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  tripEarn: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Anchored menu (swipe/long-press fallback + segment menus).
  menuCard: {
    position: 'absolute',
    right: 12,
    top: 60,
    zIndex: 35,
    minWidth: 180,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 44,
    paddingInline: 16,
    fontSize: 16,
  },
  menuRowDanger: {color: 'var(--color-error)'},
  // UTILITY ROWS (Rates / Export) — 44px.
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  utilityChevron: {color: 'var(--color-text-secondary)', display: 'grid', placeItems: 'center'},
  // EXPORT sticky footer — final block of the tab content, sticky above the
  // 64px tabBar.
  exportFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 15,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    background: WORKED_FILL,
    color: FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  primaryBtnDisabled: {opacity: 0.35},
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom mid-scroll; switches to shell-absolute ONLY while the
  // shell is scroll-locked by an open sheet (amendment).
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
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastLockedInner: {position: 'static'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // SHEETS.
  sheetScrim: {position: 'absolute', inset: 0, background: SCRIM, zIndex: 40},
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
  sheetGrabberZone: {
    height: 24,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 8,
    flexShrink: 0,
  },
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 16,
    paddingInlineEnd: 8,
    flexShrink: 0,
  },
  sheetTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetClose: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  sheetContent: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, paddingTop: 4},
  sheetFooter: {padding: 16, paddingTop: 8, flexShrink: 0, borderTop: '1px solid var(--color-border)'},
  // ODOMETER STEPPER.
  odoRow: {display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6},
  odoCellCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: '1 1 0',
    minWidth: 32,
    maxWidth: 44,
  },
  odoChevron: {
    height: 28,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  odoChevronTall: {minHeight: 44},
  odoCell: {
    height: 56,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    border: `1px solid ${CONTROL_EDGE}`,
    borderRadius: 8,
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  odoCellTall: {height: 72},
  // Tenths cell: BRAND_ACCENT 2px bottom rule echoing the tire-tread motif.
  odoCellTenths: {borderBottom: `2px solid ${BRAND_ACCENT}`},
  odoDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--color-text-primary)',
    alignSelf: 'flex-end',
    marginBottom: 26,
    flexShrink: 0,
  },
  deltaRow: {
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    flexWrap: 'wrap',
  },
  deltaMatch: {display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-text-primary)', fontWeight: 500},
  deltaError: {marginTop: 8, fontSize: 13, color: 'var(--color-error)', fontVariantNumeric: 'tabular-nums'},
  // DAY-EDIT SHEET.
  discCenterWrap: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBlock: 8},
  segRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingInline: 16,
  },
  segBody: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  segPrimary: {fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  segMeta: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  segEditRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBottom: 12,
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
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptySheetNote: {
    paddingBlock: 32,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  personalGapCaption: {
    margin: '8px 32px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic BY LAW. Fixed 'now' = Thu Jul 2 2026, 3:45 PM.
// Rates: $24.00/hr = 40¢/min; $0.60/mi = 6¢/tenth. All money DERIVED, never
// stored. Odometer chain continuous by construction: 048150.0 → 048255.0 =
// 105.0 mi (spec's own CORRECTION applied — Thu Trip A 048230.5→048244.7,
// Trip B 048244.7→048255.0; no personal-mileage gap caption needed).
// CROSS-CHECKS (verified): week minutes 360+330+345 = 1035 = 17h 15m; miles
// 42.5+38.0+24.5 = 105.0; hourly 1035×40¢ = $414.00; mileage 1050×6¢ =
// $63.00; bonuses $15.00; weekCents 41400+6300+1500 = 49200 = $492.00 =
// Σ per-day (17950+15480+0+15770). Unsubmitted Tue+Thu = $312.50.
// ---------------------------------------------------------------------------

const NOW_MIN = 945; // 3:45 PM as minutes-from-midnight — never Date.now()
const DAY_START = 360; // 6:00 AM
const DAY_END = 1200; // 8:00 PM
const DAY_SPAN = DAY_END - DAY_START; // 840 min timeline span
const CENT_PER_MIN = 40; // $24.00/hr
const CENT_PER_TENTH = 6; // $0.60/mi
const OPEN_MIN_FLOOR = 15;
const OPEN_MIN_CAP = 420;
const OPEN_SEG_START = 780; // today's open segment starts 1:00 PM

// Identity consts — the signed-in contractor.
const CURRENT_USER = 'Ray Delgado';
const VEHICLE = '2019 Transit — 6ft bed';

type TabId = 'week' | 'trips' | 'rates' | 'export';
type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type SheetId = 'odometer' | 'dayEdit';

interface Seg {
  id: string;
  startMin: number;
  durMin: number; // the open segment's durMin is THE single mutable integer
}

interface Trip {
  id: string;
  name: string;
  // Bar-span fixture minutes (garnish geometry for the DayShiftBar).
  startMin: number;
  durMin: number;
  odoStartTenths: number;
  odoEndTenths: number; // distTenths = end − start, exact by construction
}

interface Day {
  id: DayId;
  label: string; // 'Mon Jun 29'
  editLabel: string; // 'Mon, Jun 29' (sheet title)
  segs: Seg[];
  trips: Trip[];
  bonusCents: number;
  bonusLabel: string | null;
  submitted: boolean;
  openSegId: string | null; // only Thu carries the open segment
}

const INITIAL_DAYS: Day[] = [
  {
    id: 'mon',
    label: 'Mon Jun 29',
    editLabel: 'Mon, Jun 29',
    // Two worked segments — stress fixture 2 (multi-segment layout; the
    // 11:30–12:30 gap reads as bare track between fills).
    segs: [
      {id: 'mon_s1', startMin: 480, durMin: 210}, // 8:00–11:30
      {id: 'mon_s2', startMin: 750, durMin: 150}, // 12:30–3:00
    ],
    trips: [
      {
        // Stress fixture 5 — the long trip name ellipsizes at the two-line
        // stack; trailing meta (minWidth 72) stays intact.
        id: 'mon_t1',
        name: 'Trip A — Northside loop & depot double-back',
        startMin: 495,
        durMin: 120,
        odoStartTenths: 481500, // 048150.0
        odoEndTenths: 481720, // 048172.0 = 22.0 mi
      },
      {
        id: 'mon_t2',
        name: 'Trip B — Depot return',
        startMin: 765,
        durMin: 105,
        odoStartTenths: 481720,
        odoEndTenths: 481925, // 048192.5 = 20.5 mi
      },
    ],
    bonusCents: 1000,
    bonusLabel: 'Multi-stop + early-start',
    submitted: true,
    openSegId: null,
  },
  {
    id: 'tue',
    label: 'Tue Jun 30',
    editLabel: 'Tue, Jun 30',
    segs: [{id: 'tue_s1', startMin: 540, durMin: 330}], // 9:00–2:30
    trips: [
      {
        id: 'tue_t1',
        name: 'Trip A — Harbor circuit',
        startMin: 560,
        durMin: 130,
        odoStartTenths: 481925,
        odoEndTenths: 482110, // 048211.0 = 18.5 mi
      },
      {
        id: 'tue_t2',
        name: 'Trip B — Return leg',
        startMin: 715,
        durMin: 140,
        odoStartTenths: 482110,
        odoEndTenths: 482305, // 048230.5 = 19.5 mi
      },
    ],
    bonusCents: 0,
    bonusLabel: null,
    submitted: false,
    openSegId: null,
  },
  {
    // Stress fixture 1 — fully absent day: bare 'Off' track, dashed disc,
    // 60px row.
    id: 'wed',
    label: 'Wed Jul 1',
    editLabel: 'Wed, Jul 1',
    segs: [],
    trips: [],
    bonusCents: 0,
    bonusLabel: null,
    submitted: false,
    openSegId: null,
  },
  {
    id: 'thu',
    label: 'Thu Jul 2',
    editLabel: 'Thu, Jul 2',
    segs: [
      {id: 'thu_s1', startMin: 540, durMin: 180}, // 9:00–12:00 closed
      {id: 'thu_open', startMin: OPEN_SEG_START, durMin: 165}, // OPEN → ends 3:45 PM = NOW
    ],
    trips: [
      {
        id: 'thu_t1',
        name: 'Trip A — Morning route',
        startMin: 555,
        durMin: 150,
        odoStartTenths: 482305,
        odoEndTenths: 482447, // 048244.7 = 14.2 mi
      },
      {
        // Trip B ships already saved (048244.7→048255.0 = 10.3 mi); the
        // odometer sheet re-opens it for editing.
        id: 'thu_t2',
        name: 'Trip B — Afternoon run',
        startMin: 800,
        durMin: 120,
        odoStartTenths: 482447,
        odoEndTenths: 482550, // 048255.0 = 10.3 mi
      },
    ],
    bonusCents: 500,
    bonusLabel: 'Multi-stop',
    submitted: false,
    openSegId: 'thu_open',
  },
  {id: 'fri', label: 'Fri Jul 3', editLabel: 'Fri, Jul 3', segs: [], trips: [], bonusCents: 0, bonusLabel: null, submitted: false, openSegId: null},
  {id: 'sat', label: 'Sat Jul 4', editLabel: 'Sat, Jul 4', segs: [], trips: [], bonusCents: 0, bonusLabel: null, submitted: false, openSegId: null},
  {id: 'sun', label: 'Sun Jul 5', editLabel: 'Sun, Jul 5', segs: [], trips: [], bonusCents: 0, bonusLabel: null, submitted: false, openSegId: null},
];

// The odometer sheet edits Thu Trip B: last reading = Trip B's start.
const ODO_LAST_TENTHS = 482447; // 048244.7
const ODO_EXPECT_TENTHS = 103; // Trip B expects 10.3 mi
// Draft digits for 048255.0 — [0,4,8,2,5,5,0] per the corrected chain.
const INITIAL_ODO_DRAFT: number[] = [0, 4, 8, 2, 5, 5, 0];

const RATE_ROWS: Array<{id: string; label: string; value: string}> = [
  {id: 'hourly', label: 'Hourly', value: '$24.00 /hr'},
  {id: 'mile', label: 'Per mile', value: '$0.60 /mi'},
  {id: 'weekend', label: 'Weekend bonus', value: '$10.00 /day'},
  {id: 'multistop', label: 'Multi-stop bonus', value: '$5.00 /day'},
];

interface ToastState {
  msg: string;
  // Exact-restore snapshot per undoOverConfirm — one assignment restores
  // days (list positions, submitted flags) precisely.
  restoreDays: Day[] | null;
  restoredMsg: string | null;
}

interface Store {
  tab: TabId;
  days: Day[];
  sheet: SheetId | null;
  sheetDetent: 'medium' | 'large';
  dayEditId: DayId | null;
  editingSegId: string | null; // inline 'Edit times' target in the day-edit sheet
  segMenuId: string | null; // anchored menu open on a segment row
  odoDraft: number[];
  odoError: string | null;
  scrollByTab: Record<TabId, number>;
  toast: ToastState | null;
  swipeOpenTripId: string | null;
  tripMenuId: string | null; // anchored ellipsis/long-press menu on a trip row
}

const INITIAL_STORE: Store = {
  tab: 'week',
  days: INITIAL_DAYS,
  sheet: null,
  sheetDetent: 'medium',
  dayEditId: null,
  editingSegId: null,
  segMenuId: null,
  odoDraft: INITIAL_ODO_DRAFT,
  odoError: null,
  scrollByTab: {week: 0, trips: 0, rates: 0, export: 0},
  toast: null,
  swipeOpenTripId: null,
  tripMenuId: null,
};

// ---------------------------------------------------------------------------
// DERIVATIONS — every number on screen recomputes from the days array.
// ---------------------------------------------------------------------------

function dayWorkedMin(day: Day): number {
  return day.segs.reduce((sum, seg) => sum + seg.durMin, 0);
}

function tripDistTenths(trip: Trip): number {
  return trip.odoEndTenths - trip.odoStartTenths;
}

function dayDistTenths(day: Day): number {
  return day.trips.reduce((sum, trip) => sum + tripDistTenths(trip), 0);
}

interface DayCents {
  hour: number;
  mile: number;
  bonus: number;
  total: number;
}

function dayCents(day: Day): DayCents {
  const hour = dayWorkedMin(day) * CENT_PER_MIN;
  const mile = dayDistTenths(day) * CENT_PER_TENTH;
  return {hour, mile, bonus: day.bonusCents, total: hour + mile + day.bonusCents};
}

function weekCents(days: Day[]): number {
  return days.reduce((sum, day) => sum + dayCents(day).total, 0);
}

function weekWorkedMin(days: Day[]): number {
  return days.reduce((sum, day) => sum + dayWorkedMin(day), 0);
}

function weekDistTenths(days: Day[]): number {
  return days.reduce((sum, day) => sum + dayDistTenths(day), 0);
}

function unsubmittedDays(days: Day[]): Day[] {
  return days.filter(day => !day.submitted && dayCents(day).total > 0);
}

// ---------------------------------------------------------------------------
// FORMATTERS — dual-field discipline: integers drive math, these render it.
// ---------------------------------------------------------------------------

function fmtUsd(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

function fmtDur(min: number): string {
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`;
}

function fmtDurLong(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} hour${h === 1 ? '' : 's'} ${m} minute${m === 1 ? '' : 's'}`;
}

function fmtClock(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function fmtMiles(tenths: number): string {
  const sign = tenths < 0 ? '-' : '';
  const abs = Math.abs(tenths);
  return `${sign}${Math.floor(abs / 10)}.${abs % 10}`;
}

function fmtOdo(tenths: number): string {
  return `${String(Math.floor(tenths / 10)).padStart(6, '0')}.${tenths % 10}`;
}

function odoDraftTenths(digits: number[]): number {
  // Six integer digits + one tenths digit → integer tenths.
  let intPart = 0;
  for (let i = 0; i < 6; i++) intPart = intPart * 10 + digits[i];
  return intPart * 10 + digits[6];
}

function clampOpenDur(next: number): number {
  const snapped = Math.round(next / 15) * 15;
  return Math.min(OPEN_MIN_CAP, Math.max(OPEN_MIN_FLOOR, snapped));
}

// x-mapping for the DayShiftBar: left% = (startMin − 360)/840.
function pctOf(min: number): number {
  return ((min - DAY_START) / DAY_SPAN) * 100;
}

// ---------------------------------------------------------------------------
// HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

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

// Nearest scroll parent — the demo's .preview-wrap scrolls the page; per-tab
// scroll positions are read from / restored to it.
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// Focus trap — sheets trap Tab while open; Escape layering handled at page
// level (topmost only); focus restores to the opener on every close path.
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
// BRAND MARK — 24px odometer digit cell: 20×24 rounded-3 rect with a '7'
// numeral and a 4-notch tire-tread tick row along its bottom edge, drawn in
// currentColor (--color-text-primary).
// ---------------------------------------------------------------------------

function MilemarkMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{color: 'var(--color-text-primary)'}}>
        <rect x={2} y={0.5} width={20} height={23} rx={3} stroke="currentColor" strokeWidth={1.6} />
        <path d="M8.5 6h7l-4.4 10" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        {/* 4-notch tire-tread tick row */}
        <path d="M5.5 20.5v-2M10 20.5v-2M14 20.5v-2M18.5 20.5v-2" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// RATE DISC — SVG donut; slice angles derive from cents so they always sum
// to 360°. Slices: hourly BRAND_ACCENT, per-mile DRIVE_FILL, bonus
// BONUS_COLOR. 3px stroke gap at row sizes (32/40), 4px at 120. Row sizes
// are aria-hidden — the row text carries the numbers.
// ---------------------------------------------------------------------------

function polarPoint(cx: number, cy: number, r: number, deg: number): {x: number; y: number} {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function donutArc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const from = polarPoint(cx, cy, r, fromDeg);
  const to = polarPoint(cx, cy, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

interface RateDiscProps {
  cents: DayCents;
  size: 32 | 40 | 120;
}

function RateDisc({cents, size}: RateDiscProps) {
  const stroke = size === 120 ? 14 : 6;
  const r = size / 2 - stroke / 2;
  const c = size / 2;
  const gapPx = size === 120 ? 4 : 3;
  const circumference = 2 * Math.PI * r;
  const gapDeg = (gapPx / circumference) * 360;
  const slices = [
    {key: 'hour', value: cents.hour, color: BRAND_ACCENT},
    {key: 'mile', value: cents.mile, color: DRIVE_FILL},
    {key: 'bonus', value: cents.bonus, color: BONUS_COLOR},
  ].filter(slice => slice.value > 0);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let cursor = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
      {total === 0 ? (
        <circle cx={c} cy={c} r={r} stroke="var(--color-border)" strokeWidth={stroke} strokeDasharray="3 4" />
      ) : slices.length === 1 ? (
        <circle cx={c} cy={c} r={r} stroke={slices[0].color} strokeWidth={stroke} />
      ) : (
        slices.map(slice => {
          const sweep = (slice.value / total) * 360;
          const from = cursor + gapDeg / 2;
          const to = cursor + sweep - gapDeg / 2;
          cursor += sweep;
          return <path key={slice.key} d={donutArc(c, c, r, from, Math.max(from + 1, to))} stroke={slice.color} strokeWidth={stroke} strokeLinecap="butt" className="mmk-fade" />;
        })
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DAY SHIFT BAR — hero: 44px track + 12px tick lane, open-segment edge
// handle + dashed 'now' rule; compact: 12px track + 4px ticks, no labels,
// no handle. Worked fills vs 45°-striped drive fills (24px inset) so the
// two segment kinds differ by more than hue. Width changes animate 120ms
// (spec-sanctioned) and collapse under reduced motion via .mmk-bar.
// ---------------------------------------------------------------------------

interface DayShiftBarProps {
  day: Day;
  variant: 'hero' | 'compact';
  trackWidth: number; // measured px — gates the ≥56px duration labels
  openEndMin?: number;
  onHandlePointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleRef?: RefObject<HTMLButtonElement | null>;
}

function DayShiftBar({day, variant, trackWidth, onHandlePointerDown, handleRef}: DayShiftBarProps) {
  const hero = variant === 'hero';
  const distTenths = dayDistTenths(day);
  const isOff = day.segs.length === 0 && day.trips.length === 0;
  return (
    <div>
      <div style={{...styles.barTrack, ...(hero ? null : styles.barTrackCompact)}}>
        {isOff ? <span style={styles.barOffLabel}>Off</span> : null}
        {day.segs.map(seg => {
          const isOpen = seg.id === day.openSegId;
          const widthPct = (seg.durMin / DAY_SPAN) * 100;
          // 13px/600 duration label only when the fill is ≥56px wide on the
          // MEASURED track (hero only).
          const showLabel = hero && trackWidth > 0 && (widthPct / 100) * trackWidth >= 56;
          return (
            <span
              key={seg.id}
              className="mmk-bar"
              style={{
                ...styles.workedSeg,
                ...(hero ? null : styles.workedSegCompact),
                ...(isOpen && hero ? styles.workedSegOpen : null),
                left: `${pctOf(seg.startMin)}%`,
                width: `${widthPct}%`,
              }}>
              {showLabel ? <span style={styles.segLabel}>{fmtDur(seg.durMin)}</span> : null}
            </span>
          );
        })}
        {/* Drive segments paint ABOVE worked fills — driving happens while
            on shift, and the 24px-inset striped band must stay visible over
            a 44px worked fill (light stripes on the worked blue read
            clearly; the two kinds differ by stripe structure + inset
            geometry, not hue alone). */}
        {day.trips.map(trip => (
          <span
            key={trip.id}
            className="mmk-bar"
            style={{
              ...styles.driveSeg,
              ...(hero ? null : styles.driveSegCompact),
              left: `${pctOf(trip.startMin)}%`,
              width: `${(trip.durMin / DAY_SPAN) * 100}%`,
            }}
          />
        ))}
        {hero ? (
          <span style={{...styles.nowRule, left: `${pctOf(NOW_MIN)}%`}} aria-hidden>
            <span style={styles.nowFlag}>now</span>
          </span>
        ) : null}
        {hero && day.openSegId != null
          ? day.segs
              .filter(seg => seg.id === day.openSegId)
              .map(seg => {
                const endMin = seg.startMin + seg.durMin;
                return (
                  <button
                    key="handle"
                    ref={handleRef}
                    type="button"
                    className="mmk-btn mmk-focusable"
                    aria-label={`Adjust shift end, currently ${fmtClock(endMin)}`}
                    style={{...styles.handleHit, left: `calc(${pctOf(endMin)}% - 12px)`}}
                    onPointerDown={onHandlePointerDown}>
                    <span style={styles.handleGrab}>
                      <span style={styles.handleBar} />
                      <span style={styles.handleBar} />
                    </span>
                  </button>
                );
              })
          : null}
      </div>
      {/* Tick lane — one 2×8 tick per whole 5 mi of each trip, positioned
          along the trip's span; right-aligned total caption. */}
      <div style={{...styles.tickLane, ...(hero ? null : styles.tickLaneCompact)}} aria-hidden>
        {day.trips.flatMap(trip => {
          const dist = tripDistTenths(trip);
          const marks: ReactNode[] = [];
          for (let mi = 50; mi <= dist; mi += 50) {
            const frac = mi / dist;
            marks.push(
              <span
                key={`${trip.id}_${mi}`}
                style={{
                  ...styles.tick,
                  ...(hero ? null : styles.tickCompact),
                  left: `${pctOf(trip.startMin) + (trip.durMin / DAY_SPAN) * 100 * frac}%`,
                }}
              />,
            );
          }
          return marks;
        })}
        {hero && distTenths > 0 ? <span style={styles.tickCaption}>{fmtMiles(distTenths)} mi</span> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ODOMETER STEPPER — seven digit cells (six integer + tenths), 6px gaps,
// chevron buttons above/below each cell (44-wide × 28 hit, tiled
// edge-to-edge per spec; below 390px container width the chevrons keep
// minHeight 44 and cells grow to 72px — the responsiveContract fallback).
// Each cell is role=spinbutton 0–9 wrap-around; ArrowUp/Down step it.
// ---------------------------------------------------------------------------

const ODO_CELL_NAMES = ['digit 1', 'digit 2', 'digit 3', 'digit 4', 'digit 5', 'digit 6', 'tenths'];

interface OdometerStepperProps {
  digits: number[];
  narrow: boolean; // container < 390px
  onStep: (index: number, delta: 1 | -1) => void;
}

function OdometerStepper({digits, narrow, onStep}: OdometerStepperProps) {
  return (
    <div style={styles.odoRow}>
      {digits.map((digit, index) => (
        <div key={index} style={{display: 'contents'}}>
          {index === 6 ? <span style={styles.odoDot} aria-hidden /> : null}
          <div style={styles.odoCellCol}>
            <button
              type="button"
              className="mmk-btn mmk-focusable"
              style={{...styles.odoChevron, ...(narrow ? styles.odoChevronTall : null)}}
              aria-label={`Increase ${ODO_CELL_NAMES[index]}`}
              onClick={() => onStep(index, 1)}>
              <Icon icon={ChevronUpIcon} size="sm" />
            </button>
            <div
              role="spinbutton"
              tabIndex={0}
              className="mmk-focusable"
              aria-label={`Odometer ${ODO_CELL_NAMES[index]}`}
              aria-valuenow={digit}
              aria-valuemin={0}
              aria-valuemax={9}
              style={{
                ...styles.odoCell,
                ...(narrow ? styles.odoCellTall : null),
                ...(index === 6 ? styles.odoCellTenths : null),
              }}
              onKeyDown={event => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  onStep(index, 1);
                } else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  onStep(index, -1);
                }
              }}>
              {digit}
            </div>
            <button
              type="button"
              className="mmk-btn mmk-focusable"
              style={{...styles.odoChevron, ...(narrow ? styles.odoChevronTall : null)}}
              aria-label={`Decrease ${ODO_CELL_NAMES[index]}`}
              onClick={() => onStep(index, -1)}>
              <Icon icon={ChevronDownIcon} size="sm" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET — two detents (MEDIUM 55%, LARGE calc(100% − 56px)); 24px grabber
// zone with a real 36×5 pill button toggling detents; 52px header with
// 44×44 X; content is the ONE legal inner scroller; scrim click + Escape
// close; focus({preventScroll:true}) in, restored to opener on all closes.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onToggleDetent: () => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  footer?: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onToggleDetent, onClose, sheetRef, footer, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="mmk-sheet-in"
      style={{...styles.sheet, ...(detent === 'medium' ? styles.sheetMedium : styles.sheetLarge)}}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.sheetGrabberZone}>
        <button type="button" className="mmk-btn mmk-focusable" aria-label="Resize sheet" style={{padding: '8px 24px', margin: -8}} onClick={onToggleDetent}>
          <span style={{...styles.sheetGrabber, display: 'block'}} />
        </button>
      </div>
      <div style={styles.sheetHeader}>
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="mmk-btn mmk-focusable" aria-label="Close" style={styles.sheetClose} onClick={onClose}>
          <Icon icon={XIcon} size="sm" />
        </button>
      </div>
      <div style={styles.sheetContent}>{children}</div>
      {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRIP ROW — 72px media row with swipe-to-reveal delete (snap −72px, one
// open at a time), the MANDATORY 44×44 ellipsis fallback opening the same
// action as an anchored menu, and long-press (450ms, cancel at 8px move)
// as garnish for the same menu.
// ---------------------------------------------------------------------------

interface TripRowProps {
  trip: Trip;
  swipeOpen: boolean;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeChange: (open: boolean) => void;
  onMenuToggle: (opener: HTMLElement | null) => void;
  onDelete: () => void;
}

function TripRow({trip, swipeOpen, menuOpen, menuRef, onSwipeChange, onMenuToggle, onDelete}: TripRowProps) {
  const [dragDx, setDragDx] = useState<number | null>(null);
  const gestureRef = useRef<{startX: number; startY: number; timer: number | null; moved: boolean} | null>(null);
  const ellipsisRef = useRef<HTMLButtonElement>(null);
  const dist = tripDistTenths(trip);
  const translate = dragDx ?? (swipeOpen ? -72 : 0);

  const clearGesture = () => {
    const gesture = gestureRef.current;
    if (gesture?.timer != null) window.clearTimeout(gesture.timer);
    gestureRef.current = null;
  };

  return (
    <div style={styles.tripRowOuter}>
      {/* Revealed action block — 72px --color-error Delete (white 13px/600
          on the error fill; the DS error token holds ≥4.5:1 vs white in
          both schemes). */}
      <button type="button" className="mmk-btn mmk-focusable" style={styles.tripRevealBlock} tabIndex={swipeOpen ? 0 : -1} aria-hidden={!swipeOpen} onClick={onDelete}>
        <Icon icon={Trash2Icon} size="sm" />
        Delete
      </button>
      <div
        className={dragDx == null ? 'mmk-anim' : undefined}
        style={{...styles.tripRowInner, transform: `translateX(${translate}px)`}}
        onPointerDown={event => {
          if (event.button !== 0) return;
          const startX = event.clientX;
          const startY = event.clientY;
          gestureRef.current = {
            startX,
            startY,
            moved: false,
            // Long-press garnish — same anchored menu as the ellipsis.
            timer: window.setTimeout(() => {
              gestureRef.current = null;
              setDragDx(null);
              onMenuToggle(ellipsisRef.current);
            }, 450),
          };
        }}
        onPointerMove={event => {
          const gesture = gestureRef.current;
          if (gesture == null) return;
          const dx = event.clientX - gesture.startX;
          const dy = event.clientY - gesture.startY;
          if (!gesture.moved && Math.hypot(dx, dy) > 8) {
            gesture.moved = true;
            if (gesture.timer != null) window.clearTimeout(gesture.timer);
            gesture.timer = null;
          }
          if (gesture.moved && Math.abs(dx) > Math.abs(dy)) {
            setDragDx(Math.max(-72, Math.min(0, (swipeOpen ? -72 : 0) + dx)));
          }
        }}
        onPointerUp={() => {
          const gesture = gestureRef.current;
          clearGesture();
          if (gesture?.moved && dragDx != null) {
            onSwipeChange(dragDx < -36);
          } else if (swipeOpen) {
            onSwipeChange(false);
          }
          setDragDx(null);
        }}
        onPointerCancel={() => {
          clearGesture();
          setDragDx(null);
        }}>
        <span style={styles.tripThumb} aria-hidden>
          <Icon icon={RouteIcon} size="sm" />
        </span>
        <span style={styles.tripBody}>
          <span style={styles.tripName}>{trip.name}</span>
          <span style={styles.tripOdo}>
            {fmtOdo(trip.odoStartTenths)} → {fmtOdo(trip.odoEndTenths)}
          </span>
        </span>
        <span style={styles.tripTrailing}>
          <span style={styles.tripMiles}>{fmtMiles(dist)} mi</span>
          <span style={styles.tripEarn}>{fmtUsd(dist * CENT_PER_TENTH)}</span>
        </span>
        <button
          ref={ellipsisRef}
          type="button"
          className="mmk-btn mmk-focusable"
          aria-label={`Actions for ${trip.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={styles.ellipsisBtn}
          onClick={event => {
            event.stopPropagation();
            onMenuToggle(event.currentTarget);
          }}>
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </button>
      </div>
      {menuOpen ? (
        <div ref={menuRef} role="menu" aria-label={`Actions for ${trip.name}`} style={styles.menuCard} onClick={event => event.stopPropagation()}>
          <button type="button" role="menuitem" className="mmk-btn mmk-focusable" style={{...styles.menuRow, ...styles.menuRowDanger}} onClick={onDelete}>
            <Icon icon={Trash2Icon} size="sm" />
            Delete trip
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof CalendarDaysIcon}> = [
  {id: 'week', label: 'Week', icon: CalendarDaysIcon},
  {id: 'trips', label: 'Trips', icon: RouteIcon},
  {id: 'rates', label: 'Rates', icon: CircleDollarSignIcon},
  {id: 'export', label: 'Export', icon: UploadIcon},
];

const TAB_TITLES: Record<TabId, string> = {
  week: 'Week',
  trips: 'Trips',
  rates: 'Rates',
  export: 'Export',
};

export default function MobileHoursMileageLogTemplate() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const odoErrorRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{rect: DOMRect; startDur: number} | null>(null);
  const [store, setStore] = useState<Store>(INITIAL_STORE);

  // Container width (NOT viewport) decides mobile vs desktop stage; the
  // viewport query is first-frame fallback only.
  const wrapWidth = useElementWidth(wrapRef);
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const desktop = wrapWidth > 0 ? wrapWidth >= 720 : viewportWide;
  const shellWidth = desktop ? 430 : wrapWidth > 0 ? Math.min(wrapWidth, 430) : 390;
  const narrow = shellWidth <= 350; // hero stat values 16px, pill drops 'Wk'
  const odoNarrow = shellWidth < 390; // OdometerStepper tall-chevron fallback
  // Hero bar track px = shell − 32 gutter − 32 card padding.
  const trackWidth = shellWidth - 64;

  const {days, tab, sheet, toast} = store;
  const thu = days.find(day => day.id === 'thu') as Day;
  const openSeg = thu.segs.find(seg => seg.id === thu.openSegId) ?? null;
  const openDur = openSeg?.durMin ?? 0;
  const openEndMin = openSeg != null ? openSeg.startMin + openSeg.durMin : NOW_MIN;
  const thuCents = dayCents(thu);
  const weekTotal = weekCents(days);
  const weekMin = weekWorkedMin(days);
  const weekTenths = weekDistTenths(days);
  const unsubmitted = unsubmittedDays(days);
  const unsubmittedTotal = unsubmitted.reduce((sum, day) => sum + dayCents(day).total, 0);
  const editDay = store.dayEditId != null ? days.find(day => day.id === store.dayEditId) ?? null : null;

  // -------------------------------------------------------------------------
  // SIGNATURE — setOpenDur is the single choke point: drag the hero handle
  // OR press the stepper halves / ArrowUp/Down; ONE state write re-derives
  // the navBar pill, hero stats, RateDisc angles, today's compact bar +
  // trailing earnings, the week caption, and the Export unsubmitted total
  // IN THE SAME RENDER. Committed changes announce via the toastDock.
  // -------------------------------------------------------------------------

  const setOpenDur = useCallback((nextRaw: number, announce: boolean) => {
    setStore(prev => {
      const next = clampOpenDur(nextRaw);
      const prevThu = prev.days.find(day => day.id === 'thu') as Day;
      const prevOpen = prevThu.segs.find(seg => seg.id === prevThu.openSegId);
      if (prevOpen == null || (next === prevOpen.durMin && !announce)) return prev;
      const nextDays = prev.days.map(day =>
        day.id === 'thu'
          ? {...day, segs: day.segs.map(seg => (seg.id === day.openSegId ? {...seg, durMin: next} : seg))}
          : day,
      );
      const nextToast: ToastState | null =
        announce && next !== prevOpen.durMin
          ? {
              msg: `Shift ${next > prevOpen.durMin ? 'extended' : 'shortened'} to ${fmtClock(OPEN_SEG_START + next)} · week ${fmtUsd(weekCents(nextDays))}`,
              restoreDays: null,
              restoredMsg: null,
            }
          : prev.toast;
      return {...prev, days: nextDays, toast: nextToast};
    });
  }, []);

  // Handle drag — pointermove x→minutes snapped to 15, clamped [15,420];
  // the stepper row is the visible non-gesture path (contract).
  const onHandlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const track = event.currentTarget.parentElement;
      if (track == null) return;
      event.preventDefault();
      dragRef.current = {rect: track.getBoundingClientRect(), startDur: openDur};
      const onMove = (move: PointerEvent) => {
        const drag = dragRef.current;
        if (drag == null || drag.rect.width === 0) return;
        const minute = DAY_START + ((move.clientX - drag.rect.left) / drag.rect.width) * DAY_SPAN;
        setOpenDur(minute - OPEN_SEG_START, false);
      };
      const onUp = (up: PointerEvent) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        const drag = dragRef.current;
        dragRef.current = null;
        if (drag == null || drag.rect.width === 0) return;
        const minute = DAY_START + ((up.clientX - drag.rect.left) / drag.rect.width) * DAY_SPAN;
        setOpenDur(minute - OPEN_SEG_START, true); // commit announces
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [openDur, setOpenDur],
  );

  // -------------------------------------------------------------------------
  // TABS — per-tab scroll persist via the demo scroller; switching closes
  // overlays/swipe; re-tapping the active tab scrolls to top (the one legal
  // reset).
  // -------------------------------------------------------------------------

  const selectTab = (next: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (next === store.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setStore(prev => ({
      ...prev,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      tab: next,
      sheet: null,
      swipeOpenTripId: null,
      tripMenuId: null,
      segMenuId: null,
      editingSegId: null,
    }));
  };

  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = store.scrollByTab[store.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tab]);

  const onTabBarKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(entry => entry.id === store.tab);
    const nextIndex = (index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    selectTab(TABS[nextIndex].id);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
    buttons[nextIndex]?.focus();
  };

  // -------------------------------------------------------------------------
  // SHEETS — odometer opens MEDIUM, dayEdit opens LARGE; focus moves in
  // with preventScroll (the locked overflow-hidden column would otherwise
  // scroll-reveal the animating sheet) and restores to the opener on every
  // close path.
  // -------------------------------------------------------------------------

  const openSheet = (id: SheetId, dayEditId: DayId | null, opener: HTMLElement | null) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setStore(prev => ({
      ...prev,
      sheet: id,
      sheetDetent: id === 'dayEdit' ? 'large' : 'medium',
      dayEditId: id === 'dayEdit' ? dayEditId : prev.dayEditId,
      odoDraft: INITIAL_ODO_DRAFT,
      odoError: null,
      editingSegId: null,
      segMenuId: null,
      swipeOpenTripId: null,
      tripMenuId: null,
    }));
  };

  const closeSheet = () => {
    setStore(prev => ({...prev, sheet: null, segMenuId: null, editingSegId: null, odoError: null}));
    openerRef.current?.focus();
  };

  useEffect(() => {
    if (store.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [store.sheet]);

  useEffect(() => {
    if (store.odoError != null) odoErrorRef.current?.focus({preventScroll: true});
  }, [store.odoError]);

  useEffect(() => {
    if (store.segMenuId != null || store.tripMenuId != null) {
      menuRef.current?.querySelector('button')?.focus({preventScroll: true});
    }
  }, [store.segMenuId, store.tripMenuId]);

  // Escape closes the TOPMOST layer only: anchored menu → sheet → swipe.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.segMenuId != null || store.tripMenuId != null) {
        setStore(prev => ({...prev, segMenuId: null, tripMenuId: null}));
        openerRef.current?.focus();
      } else if (store.sheet != null) {
        closeSheet();
      } else if (store.swipeOpenTripId != null) {
        setStore(prev => ({...prev, swipeOpenTripId: null}));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.segMenuId, store.tripMenuId, store.sheet, store.swipeOpenTripId]);

  // -------------------------------------------------------------------------
  // MUTATIONS — undo-over-confirm: reversible actions execute immediately
  // with an exact-restore snapshot; NO timers, toast persists until
  // replaced/Undo (deterministic fixtures forbid racing the reader).
  // -------------------------------------------------------------------------

  const undo = () => {
    setStore(prev =>
      prev.toast?.restoreDays != null
        ? {
            ...prev,
            days: prev.toast.restoreDays,
            toast: {msg: prev.toast.restoredMsg ?? 'Restored', restoreDays: null, restoredMsg: null},
          }
        : prev,
    );
  };

  const deleteTrip = (dayId: DayId, tripId: string) => {
    setStore(prev => {
      const snapshot = prev.days;
      const nextDays = prev.days.map(day => (day.id === dayId ? {...day, trips: day.trips.filter(trip => trip.id !== tripId)} : day));
      // Stress fixture 7 verified: deleting Thu Trip B (−10.3 mi = −$6.18)
      // → week $485.82; Undo → $492.00, row back at its exact position.
      return {
        ...prev,
        days: nextDays,
        swipeOpenTripId: null,
        tripMenuId: null,
        toast: {msg: `Trip deleted · week ${fmtUsd(weekCents(nextDays))}`, restoreDays: snapshot, restoredMsg: 'Trip restored'},
      };
    });
  };

  const deleteSeg = (dayId: DayId, segId: string) => {
    setStore(prev => {
      const snapshot = prev.days;
      const nextDays = prev.days.map(day =>
        day.id === dayId
          ? {...day, segs: day.segs.filter(seg => seg.id !== segId), openSegId: day.openSegId === segId ? null : day.openSegId}
          : day,
      );
      const target = nextDays.find(day => day.id === dayId) as Day;
      return {
        ...prev,
        days: nextDays,
        segMenuId: null,
        editingSegId: null,
        toast: {
          msg: `Segment deleted · ${target.label.slice(0, 3)} ${fmtUsd(dayCents(target).total)}`,
          restoreDays: snapshot,
          restoredMsg: 'Segment restored',
        },
      };
    });
  };

  const adjustSeg = (dayId: DayId, segId: string, delta: number) => {
    setStore(prev => {
      const nextDays = prev.days.map(day =>
        day.id === dayId
          ? {
              ...day,
              segs: day.segs.map(seg =>
                seg.id === segId ? {...seg, durMin: Math.min(600, Math.max(15, seg.durMin + delta))} : seg,
              ),
            }
          : day,
      );
      const target = nextDays.find(day => day.id === dayId) as Day;
      const seg = target.segs.find(entry => entry.id === segId);
      if (seg == null) return prev;
      return {
        ...prev,
        days: nextDays,
        toast: {
          msg: `Segment ${fmtClock(seg.startMin)} – ${fmtClock(seg.startMin + seg.durMin)} · ${target.label.slice(0, 3)} ${fmtUsd(dayCents(target).total)}`,
          restoreDays: null,
          restoredMsg: null,
        },
      };
    });
  };

  const onOdoStep = (index: number, delta: 1 | -1) => {
    setStore(prev => {
      const digits = prev.odoDraft.slice();
      digits[index] = (digits[index] + 10 + delta) % 10; // wrap-around 0–9
      return {...prev, odoDraft: digits, odoError: null};
    });
  };

  const saveOdo = () => {
    const draft = odoDraftTenths(store.odoDraft);
    const delta = draft - ODO_LAST_TENTHS;
    if (delta !== ODO_EXPECT_TENTHS) {
      // Stress fixture 4 — validation on Save press (not per tap); Save is
      // blocked and focus moves to the error line.
      setStore(prev => ({
        ...prev,
        odoError:
          delta < 0
            ? `Reading is before last ${fmtOdo(ODO_LAST_TENTHS)}`
            : `Delta ${fmtMiles(delta)} mi — Trip B expects ${fmtMiles(ODO_EXPECT_TENTHS)} mi`,
      }));
      return;
    }
    setStore(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === 'thu' ? {...day, trips: day.trips.map(trip => (trip.id === 'thu_t2' ? {...trip, odoEndTenths: draft} : trip))} : day,
      ),
      sheet: null,
      odoError: null,
      toast: {msg: `Trip B saved · ${fmtMiles(delta)} mi`, restoreDays: null, restoredMsg: null},
    }));
    openerRef.current?.focus();
  };

  const exportDays = () => {
    setStore(prev => {
      const snapshot = prev.days;
      const eligible = unsubmittedDays(prev.days);
      if (eligible.length === 0) return prev;
      const total = eligible.reduce((sum, day) => sum + dayCents(day).total, 0);
      const ids = new Set(eligible.map(day => day.id));
      return {
        ...prev,
        days: prev.days.map(day => (ids.has(day.id) ? {...day, submitted: true} : day)),
        toast: {
          msg: `Exported ${eligible.length} day${eligible.length === 1 ? '' : 's'} · ${fmtUsd(total)}`,
          restoreDays: snapshot,
          restoredMsg: 'Export undone',
        },
      };
    });
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  const stepperDisabledMinus = openDur <= OPEN_MIN_FLOOR;
  const stepperDisabledPlus = openDur >= OPEN_MIN_CAP;
  const tripDays = days.filter(day => day.trips.length > 0);

  const renderWeekTab = () => (
    <>
      {/* TODAY HERO */}
      <section style={styles.heroCard} aria-label="Today">
        <div style={styles.heroHeader}>
          <h2 style={styles.heroTitle}>Today · Thu, Jul 2</h2>
          {openSeg != null ? <span style={styles.openChip}>Open shift</span> : null}
        </div>
        <DayShiftBar
          day={thu}
          variant="hero"
          trackWidth={trackWidth}
          onHandlePointerDown={onHandlePointerDown}
          handleRef={handleRef}
        />
        <div style={styles.statRow}>
          <div style={styles.statCell}>
            <span style={styles.statLabel}>Worked</span>
            <span style={{...styles.statValue, ...(narrow ? styles.statValueNarrow : null)}}>{fmtDur(dayWorkedMin(thu))}</span>
          </div>
          <div style={styles.statCell}>
            <span style={styles.statLabel}>Miles</span>
            <span style={{...styles.statValue, ...(narrow ? styles.statValueNarrow : null)}}>{fmtMiles(dayDistTenths(thu))}</span>
          </div>
          <div style={styles.statCell}>
            <span style={styles.statLabel}>Earned</span>
            <span style={{...styles.statValue, ...(narrow ? styles.statValueNarrow : null)}}>{fmtUsd(thuCents.total)}</span>
          </div>
        </div>
        {openSeg != null ? (
          <div style={styles.stepperRow}>
            <span style={styles.stepperLabel} id="mmk-open-shift-label">
              Adjust open shift
            </span>
            <div style={styles.stepper}>
              <button
                type="button"
                className="mmk-btn mmk-focusable"
                aria-label="Decrease open shift by 15 minutes"
                disabled={stepperDisabledMinus}
                style={{...styles.stepperHalf, ...(stepperDisabledMinus ? styles.stepperHalfDisabled : null)}}
                onClick={() => setOpenDur(openDur - 15, true)}>
                <Icon icon={MinusIcon} size="sm" />
              </button>
              <span style={styles.stepperSplit} aria-hidden />
              <button
                type="button"
                className="mmk-btn mmk-focusable"
                aria-label="Increase open shift by 15 minutes"
                disabled={stepperDisabledPlus}
                style={{...styles.stepperHalf, ...(stepperDisabledPlus ? styles.stepperHalfDisabled : null)}}
                onClick={() => setOpenDur(openDur + 15, true)}>
                <Icon icon={PlusIcon} size="sm" />
              </button>
            </div>
            <span
              role="spinbutton"
              tabIndex={0}
              className="mmk-focusable"
              aria-labelledby="mmk-open-shift-label"
              aria-valuenow={openDur}
              aria-valuemin={OPEN_MIN_FLOOR}
              aria-valuemax={OPEN_MIN_CAP}
              aria-valuetext={fmtDurLong(openDur)}
              style={styles.stepperValue}
              onKeyDown={event => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setOpenDur(openDur + 15, true);
                } else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setOpenDur(openDur - 15, true);
                }
              }}>
              {fmtDur(openDur)}
            </span>
          </div>
        ) : null}
        <div style={styles.heroLegendRow}>
          <RateDisc cents={thuCents} size={32} />
          <div style={styles.legendInline}>
            <span style={styles.legendItem}>
              <span style={{...styles.legendSwatch, background: BRAND_ACCENT}} aria-hidden />
              Hourly <span style={styles.legendAmount}>{fmtUsd(thuCents.hour)}</span>
            </span>
            <span style={styles.legendItem}>
              <span style={{...styles.legendSwatch, background: DRIVE_FILL}} aria-hidden />
              Mileage <span style={styles.legendAmount}>{fmtUsd(thuCents.mile)}</span>
            </span>
            {thuCents.bonus > 0 ? (
              <span style={styles.legendItem}>
                <span style={{...styles.legendSwatch, background: BONUS_COLOR}} aria-hidden />
                Bonus <span style={styles.legendAmount}>{fmtUsd(thuCents.bonus)}</span>
              </span>
            ) : null}
          </div>
        </div>
        <button type="button" className="mmk-btn mmk-focusable" style={styles.secondaryBtn} onClick={event => openSheet('odometer', null, event.currentTarget)}>
          Log odometer
        </button>
      </section>

      <h2 style={styles.sectionHeader}>This week</h2>
      <div style={styles.listCard}>
        {days.map((day, index) => {
          const cents = dayCents(day);
          const hasData = day.segs.length > 0 || day.trips.length > 0;
          const meta = hasData ? `${fmtDur(dayWorkedMin(day))} · ${fmtMiles(dayDistTenths(day))} mi` : 'No shifts logged';
          return (
            <div key={day.id}>
              {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
              <button
                type="button"
                className="mmk-btn mmk-focusable"
                style={{...styles.dayRow, ...(hasData ? null : styles.dayRowEmpty)}}
                aria-label={hasData ? `${day.label}, ${meta}, ${fmtUsd(cents.total)}` : `${day.label}, no shifts logged`}
                onClick={event => openSheet('dayEdit', day.id, event.currentTarget)}>
                <span style={styles.dayLeading} aria-hidden>
                  {hasData ? <RateDisc cents={cents} size={40} /> : <span style={styles.emptyDisc} />}
                </span>
                <span style={styles.dayBody}>
                  <span style={styles.dayLabelRow}>
                    {day.id === 'thu' ? <span style={styles.todayDot} aria-hidden /> : null}
                    <span style={styles.dayLabel}>{day.label}</span>
                  </span>
                  <span style={styles.dayMeta}>{meta}</span>
                  {hasData ? <DayShiftBar day={day} variant="compact" trackWidth={0} /> : null}
                </span>
                <span style={styles.dayTrailing}>
                  {hasData ? <span style={styles.dayEarnings}>{fmtUsd(cents.total)}</span> : null}
                  <Icon icon={ChevronRightIcon} size="sm" />
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <p style={styles.terminalCaption}>
        Week of Jun 29 · {fmtDur(weekMin)} · {fmtMiles(weekTenths)} mi
      </p>
    </>
  );

  const renderTripsTab = () => (
    <>
      {tripDays.map(day => (
        <div key={day.id}>
          <h2 style={styles.sectionHeader}>{day.label}</h2>
          <div style={styles.listCard}>
            {day.trips.map((trip, index) => (
              <div key={trip.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
                <TripRow
                  trip={trip}
                  swipeOpen={store.swipeOpenTripId === trip.id}
                  menuOpen={store.tripMenuId === trip.id}
                  menuRef={menuRef}
                  onSwipeChange={open =>
                    setStore(prev => ({...prev, swipeOpenTripId: open ? trip.id : prev.swipeOpenTripId === trip.id ? null : prev.swipeOpenTripId}))
                  }
                  onMenuToggle={opener => {
                    openerRef.current = opener;
                    setStore(prev => ({...prev, tripMenuId: prev.tripMenuId === trip.id ? null : trip.id, swipeOpenTripId: null}));
                  }}
                  onDelete={() => deleteTrip(day.id, trip.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <p style={styles.terminalCaption}>
        Odometer chain {fmtOdo(481500)} → {fmtOdo(482550)} · {fmtMiles(weekTenths)} mi billed
      </p>
    </>
  );

  const renderRatesTab = () => (
    <>
      <h2 style={styles.sectionHeader}>Rates</h2>
      <div style={styles.listCard}>
        {RATE_ROWS.map((rate, index) => (
          <div key={rate.id}>
            {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
            <button
              type="button"
              className="mmk-btn mmk-focusable"
              style={styles.utilityRow}
              onClick={() =>
                setStore(prev => ({...prev, toast: {msg: `${rate.label} rate is set by dispatch — ${rate.value.trim()}`, restoreDays: null, restoredMsg: null}}))
              }>
              <span style={styles.utilityLabel}>{rate.label}</span>
              <span style={styles.utilityValue}>{rate.value}</span>
              <span style={styles.utilityChevron} aria-hidden>
                <Icon icon={ChevronRightIcon} size="sm" />
              </span>
            </button>
          </div>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>Profile</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Driver</span>
          <span style={styles.utilityValue}>{CURRENT_USER}</span>
        </div>
        <div style={styles.rowDivider} aria-hidden />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Vehicle</span>
          <span style={styles.utilityValue}>{VEHICLE}</span>
        </div>
      </div>
    </>
  );

  const renderExportTab = () => (
    <>
      <h2 style={styles.sectionHeader}>Timesheet export</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Unsubmitted days</span>
          <span style={styles.utilityValue}>{unsubmitted.length}</span>
        </div>
        <div style={styles.rowDivider} aria-hidden />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Unsubmitted total</span>
          <span style={styles.utilityValue}>{fmtUsd(unsubmittedTotal)}</span>
        </div>
        <div style={styles.rowDivider} aria-hidden />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Period</span>
          <span style={styles.utilityValue}>Jun 29 – Jul 5</span>
        </div>
      </div>
      {/* Sticky footer — the tab content's final block, pinned above the
          64px tabBar; count + amount derive from the store. */}
      <div style={{flex: 1}} />
      <div style={styles.exportFooter}>
        <button
          type="button"
          className="mmk-btn mmk-focusable"
          style={{...styles.primaryBtn, ...(unsubmitted.length === 0 ? styles.primaryBtnDisabled : null)}}
          disabled={unsubmitted.length === 0}
          onClick={exportDays}>
          <Icon icon={UploadIcon} size="sm" />
          {unsubmitted.length === 0 ? 'All days submitted' : `Export ${unsubmitted.length} day${unsubmitted.length === 1 ? '' : 's'} · ${fmtUsd(unsubmittedTotal)}`}
        </button>
      </div>
    </>
  );

  const editDayCents = editDay != null ? dayCents(editDay) : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{MMK_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(sheet != null ? styles.shellLocked : null),
          ...(desktop ? styles.shellDesktop : null),
        }}
        onClick={() => {
          if (store.swipeOpenTripId != null || store.tripMenuId != null || store.segMenuId != null) {
            setStore(prev => ({...prev, swipeOpenTripId: null, tripMenuId: null, segMenuId: null}));
          }
        }}>
        <h1 className="mmk-vh">Milemark — {TAB_TITLES[tab]}</h1>
        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <MilemarkMark />
          </div>
          <span style={styles.navTitle} aria-hidden>
            Milemark
          </span>
          <div style={styles.navTrailing}>
            {/* Week-earnings pill — announced via the toastDock, not here;
                ≤350px drops the 'Wk' prefix. */}
            <span style={styles.weekPill}>{narrow ? fmtUsd(weekTotal) : `Wk ${fmtUsd(weekTotal)}`}</span>
          </div>
        </header>

        <main style={styles.main}>
          {tab === 'week' ? renderWeekTab() : null}
          {tab === 'trips' ? renderTripsTab() : null}
          {tab === 'rates' ? renderRatesTab() : null}
          {tab === 'export' ? renderExportTab() : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow above the
            tabBar (shell-absolute only while a sheet scroll-locks the
            shell). No auto-dismiss timers. */}
        <div style={sheet != null ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div style={{...styles.toast, ...(sheet != null ? styles.toastLockedInner : null)}}>
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.restoreDays != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="mmk-btn mmk-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR */}
        <nav style={styles.tabBar} role="tablist" aria-label="Milemark sections" onKeyDown={onTabBarKeyDown}>
          {TABS.map(entry => {
            const active = tab === entry.id;
            const badge = entry.id === 'export' ? unsubmitted.length : 0;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="mmk-btn mmk-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(entry.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={entry.icon} size="sm" />
                  {badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{entry.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SHEETS */}
        {sheet != null ? (
          <>
            <div className="mmk-fade" style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            {sheet === 'odometer' ? (
              <Sheet
                titleId="mmk-odo-title"
                title="Odometer — Thu Jul 2"
                detent={store.sheetDetent}
                onToggleDetent={() => setStore(prev => ({...prev, sheetDetent: prev.sheetDetent === 'medium' ? 'large' : 'medium'}))}
                onClose={closeSheet}
                sheetRef={sheetRef}
                footer={
                  <button type="button" className="mmk-btn mmk-focusable" style={styles.primaryBtn} onClick={saveOdo}>
                    Save reading
                  </button>
                }>
                <p style={{fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px'}}>
                  Trip B — Afternoon run · {VEHICLE}
                </p>
                <OdometerStepper digits={store.odoDraft} narrow={odoNarrow} onStep={onOdoStep} />
                {(() => {
                  const draft = odoDraftTenths(store.odoDraft);
                  const delta = draft - ODO_LAST_TENTHS;
                  return (
                    <div style={styles.deltaRow}>
                      <span>
                        New reading {fmtOdo(draft)} − last {fmtOdo(ODO_LAST_TENTHS)} = {fmtMiles(delta)} mi
                      </span>
                      {delta === ODO_EXPECT_TENTHS ? (
                        <span style={styles.deltaMatch}>
                          <span style={{color: SUCCESS_ICON, display: 'inline-flex'}} aria-hidden>
                            <Icon icon={CheckCircle2Icon} size="sm" />
                          </span>
                          Matches Trip B
                        </span>
                      ) : null}
                    </div>
                  );
                })()}
                {store.odoError != null ? (
                  <div ref={odoErrorRef} tabIndex={-1} className="mmk-focusable" style={styles.deltaError} role="alert">
                    {store.odoError}
                  </div>
                ) : null}
              </Sheet>
            ) : null}
            {sheet === 'dayEdit' && editDay != null && editDayCents != null ? (
              <Sheet
                titleId="mmk-day-title"
                title={editDay.editLabel}
                detent={store.sheetDetent}
                onToggleDetent={() => setStore(prev => ({...prev, sheetDetent: prev.sheetDetent === 'medium' ? 'large' : 'medium'}))}
                onClose={closeSheet}
                sheetRef={sheetRef}>
                {editDayCents.total === 0 ? (
                  <p style={styles.emptySheetNote}>No shifts logged for {editDay.editLabel}.</p>
                ) : (
                  <>
                    <div style={styles.discCenterWrap}>
                      <div style={{position: 'relative', width: 120, height: 120}}>
                        <RateDisc cents={editDayCents} size={120} />
                        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center'}}>
                          <div>
                            <div style={{fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{fmtUsd(editDayCents.total)}</div>
                            <div style={{fontSize: 13, color: 'var(--color-text-secondary)'}}>{editDay.label.slice(0, 3)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={styles.sheetCard}>
                      {[
                        {key: 'hour', label: 'Hourly', color: BRAND_ACCENT, cents: editDayCents.hour},
                        {key: 'mile', label: 'Mileage', color: DRIVE_FILL, cents: editDayCents.mile},
                        {key: 'bonus', label: editDay.bonusLabel != null ? `Bonus · ${editDay.bonusLabel}` : 'Bonus', color: BONUS_COLOR, cents: editDayCents.bonus},
                      ]
                        .filter(entry => entry.cents > 0)
                        .map((entry, index) => (
                          <div key={entry.key}>
                            {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
                            <div style={styles.utilityRow}>
                              <span style={{...styles.legendSwatch, width: 12, height: 12, background: entry.color}} aria-hidden />
                              <span style={styles.utilityLabel}>{entry.label}</span>
                              <span style={styles.utilityValue}>{fmtUsd(entry.cents)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                    {editDay.segs.length > 0 ? (
                      <>
                        <h3 style={styles.sheetSectionLabel}>Worked segments</h3>
                        <div style={styles.sheetCard}>
                          {editDay.segs.map((seg, index) => {
                            const isOpen = seg.id === editDay.openSegId;
                            const menuOpen = store.segMenuId === seg.id;
                            const editing = store.editingSegId === seg.id;
                            return (
                              <div key={seg.id} style={{position: 'relative'}}>
                                {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
                                <div style={styles.segRow}>
                                  <span style={styles.segBody}>
                                    <span style={styles.segPrimary}>
                                      {fmtClock(seg.startMin)} – {fmtClock(seg.startMin + seg.durMin)}
                                      {isOpen ? ' · Open' : ''}
                                    </span>
                                    <span style={styles.segMeta}>{fmtDur(seg.durMin)}</span>
                                  </span>
                                  <button
                                    type="button"
                                    className="mmk-btn mmk-focusable"
                                    aria-label={`Actions for segment ${fmtClock(seg.startMin)}`}
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpen}
                                    style={styles.ellipsisBtn}
                                    onClick={event => {
                                      event.stopPropagation();
                                      openerRef.current = event.currentTarget;
                                      setStore(prev => ({...prev, segMenuId: prev.segMenuId === seg.id ? null : seg.id}));
                                    }}>
                                    <Icon icon={MoreHorizontalIcon} size="sm" />
                                  </button>
                                </div>
                                {editing ? (
                                  <div style={styles.segEditRow}>
                                    <span style={{...styles.stepperLabel}}>Adjust end time</span>
                                    <div style={styles.stepper}>
                                      <button
                                        type="button"
                                        className="mmk-btn mmk-focusable"
                                        aria-label="Shorten segment by 15 minutes"
                                        disabled={seg.durMin <= 15}
                                        style={{...styles.stepperHalf, ...(seg.durMin <= 15 ? styles.stepperHalfDisabled : null)}}
                                        onClick={() => adjustSeg(editDay.id, seg.id, -15)}>
                                        <Icon icon={MinusIcon} size="sm" />
                                      </button>
                                      <span style={styles.stepperSplit} aria-hidden />
                                      <button
                                        type="button"
                                        className="mmk-btn mmk-focusable"
                                        aria-label="Extend segment by 15 minutes"
                                        disabled={seg.durMin >= 600}
                                        style={{...styles.stepperHalf, ...(seg.durMin >= 600 ? styles.stepperHalfDisabled : null)}}
                                        onClick={() => adjustSeg(editDay.id, seg.id, 15)}>
                                        <Icon icon={PlusIcon} size="sm" />
                                      </button>
                                    </div>
                                    <span style={styles.stepperValue}>{fmtDur(seg.durMin)}</span>
                                  </div>
                                ) : null}
                                {menuOpen ? (
                                  <div ref={menuRef} role="menu" aria-label="Segment actions" style={{...styles.menuCard, top: 48}} onClick={event => event.stopPropagation()}>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="mmk-btn mmk-focusable"
                                      style={styles.menuRow}
                                      onClick={() => setStore(prev => ({...prev, segMenuId: null, editingSegId: seg.id}))}>
                                      Edit times
                                    </button>
                                    <div style={{height: 1, background: 'var(--color-border)'}} aria-hidden />
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="mmk-btn mmk-focusable"
                                      style={{...styles.menuRow, ...styles.menuRowDanger}}
                                      onClick={() => deleteSeg(editDay.id, seg.id)}>
                                      <Icon icon={Trash2Icon} size="sm" />
                                      Delete segment
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </Sheet>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
