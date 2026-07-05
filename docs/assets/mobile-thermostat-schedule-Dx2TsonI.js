var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Emberline home frozen at
 *   FIXTURE_NOW 'Tuesday 3:12 PM' (NOW_MIN 912; rendered strings only, no
 *   Date()): indoor 66°, outdoor '41°F, Overcast'; Tuesday's five schedule
 *   blocks sum to exactly 1440 min (360+150+540+270+120 ✓ — Night 12:00
 *   AM–6:00 AM 62°/78°, Morning 6:00–8:30 AM 70°/76°, Away 8:30 AM–5:30 PM
 *   64°/80°, Evening 5:30–10:00 PM 71°/75°, Wind-down 10:00 PM–12:00 AM
 *   66°/77°); weekend variant days re-sum to 1440 (360+240+360+360+120 ✓);
 *   duty table 20/40/10/40/30% → 72+60+54+108+36 = 330 min = 'Est. runtime
 *   5h 30m' ✓; energy week 9.2+8.6+10.4+7.8+9.6+11.2+10.2 = 67.0 kWh ✓,
 *   breakdown 41.8+12.6+8.2+4.4 = 67.0 ✓, 67.0/72.8 = 0.9203 → '−8% vs
 *   last week' ✓; sensors (66+64+68+59)/4 = 64.25 → 'Avg 64.3°' (rounding
 *   noted at the fixture).
 * @output Emberline — Thermostat Schedule: a 390px MOBILE weekly
 *   thermostat editor. Four-tab shell (Home / Schedule / Energy /
 *   Settings): Home is a hero dial card (200×200 SVG arc, 44px '66°',
 *   'Holding · Away until 5:30 PM', nextChangeChip, DualSetpointStepper
 *   hold row, runtimeBadge) over a mode segmented control and a 3-row
 *   today summary; Schedule is the WeekHeatStrip (7 radiogroup day chips
 *   with 3-band mini heatmaps) over a 768px SetpointTimeline (32px/hour,
 *   30-min = 16px snap) of temperature-tinted draggable blocks and a
 *   ComfortCurvePreview card; Energy is a 7-bar week chart + 60px
 *   breakdown rows with a navBar RefreshCw-driven skeleton; Settings is
 *   44px utility rows with a Sensors push screen. SIGNATURE DRAG: the
 *   Away block's bottom resizeHandle writes through resizeBlock mid-drag
 *   so FOUR surfaces move in the same frame — the Away/Evening minute
 *   swap, the comfort-curve ramps, the hero 'Next change' chip, and the
 *   runtime badge (Away 570×10% = 57, Evening 240×40% = 96 → 72+60+57+96+
 *   36 = 321 min = 5h 21m). Pointerup commits with an Undo toast; the
 *   editor sheet's 30-min spinbutton steppers are the button path to the
 *   same boundaries.
 * @position Page template; emitted by \`astryx template mobile-thermostat-schedule\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, anchored menus,
 *   toast) are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While the editor sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. Stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Emberline ember — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined per house rule). Sanctioned
 *   non-brand literals, each with contrast math at the declaration:
 *   BRAND_TEXT (brand-tinted SMALL text — spec's '#D9480F on white =
 *   5.0:1' recomputes to 4.30:1, so text drops to #C2410C at 4.81:1;
 *   deviation noted), COOL_ACCENT, the scheme-invariant block-fill mix
 *   anchors EMBER_MIX/COOL_MIX, SWITCH_OFF (foundations' translucent OFF
 *   track ≈1.25:1 on white fails the ≥3:1 interactive-rest amendment),
 *   BLOCK_TEXT white, and the scrim pair.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', blur surface, always-on
 *   hairline — noted choice); largeTitle row 52px (28px/700) → 104px
 *   total header; tabBar exactly 64px sticky bottom z20 (4 tabItems, 24px
 *   icon over 11px/500 label); rows 44px utility / 60px two-line energy
 *   breakdown; sectionHeader 13px/600 uppercase 0.06em at 32px, 20px top /
 *   8px bottom; SCHEDULE TRACK 32px per hour = 768px, 30-min snap = 16px,
 *   44px hour gutter, hour hairlines every 32px; hero dial 200×200 SVG;
 *   week strip chips flex:1 ≥56px tall (whole-chip merged buttons); sheet
 *   detents 55% / calc(100% − 56px), 24px grabber zone, 52px header, 48px
 *   footer primary; toastDock rides a sticky dock 12px above the 64px
 *   tabBar (bottom:76), absolute-in-shell only during sheet scroll-lock.
 *   TYPE (Figtree via --font-family-body): 44/700 dial numeral (the one
 *   sanctioned oversize) · 28/700 large titles · 22/700 · 17/600 nav &
 *   sheet titles · 16/400 body · 13/400 secondary · 11/500 floor;
 *   tabular-nums on every temperature, time, and kWh.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' backstop
 *   only). Track blocks = flex column next to the fixed 44px hour gutter
 *   (302px wide at 390, 232px at 320 — labels ellipsize, '62° / 78°'
 *   never wraps). ComfortCurvePreview SVG width 100%, fixed viewBox
 *   0 0 358 120. Week chips flex:1 (~38px wide at 320 but each a single
 *   ≥56px-tall whole-chip button — legal under the merge clause). Hero
 *   dial fixed 200×200 centered (200+32 = 232 < 320 ✓). Energy bars 7
 *   columns flex:1, 8px gaps.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered 430px phone column (maxWidth 430, marginInline
 *   auto, hairline borderInline). No adaptive relayout; the anatomy is
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
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  GripHorizontalIcon,
  HouseIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  PowerIcon,
  RefreshCwIcon,
  SettingsIcon,
  Trash2Icon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Emberline ember). Used for FILLS, arcs,
// rings, and ≥17px/600 accents only: #D9480F on #FFFFFF = 4.30:1 (≥3:1
// non-text/large ✓ — the spec's claimed 5.0:1 recomputes to 4.30:1, so
// SMALL brand text moves to BRAND_TEXT below; deviation noted in-file).
// #FFA94D on the dark card (~#1C1C1E, L 0.0117) = 8.94:1 ✓.
const BRAND_ACCENT = 'light-dark(#D9480F, #FFA94D)';
// Brand-tinted SMALL text (11–16px): #C2410C on #FFFFFF = 4.81:1 ✓;
// #FFA94D on the dark card = 8.94:1 ✓. (Brand fill vs brand text are
// different values per house rule.)
const BRAND_TEXT = 'light-dark(#C2410C, #FFA94D)';
// Cool anchor for accents / cool stepper glyphs: #0E7490 on #FFFFFF =
// 5.36:1 ✓; #22D3EE on the dark card = 9.7:1 ✓.
const COOL_ACCENT = 'light-dark(#0E7490, #22D3EE)';
// Brand wash for selected chips / active-tab tint backgrounds.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;

// BLOCK-FILL MIX ANCHORS — deliberately scheme-invariant (same hex both
// sides): every mix of these two anchors must simultaneously carry white
// text at ≥4.5:1 AND read ≥3:1 against BOTH actual surfaces (white card
// L 1.0 / dark card L 0.0117) per the interactive-rest-fill amendment.
// EMBER_MIX #C2410C: L 0.168 → white text 4.81:1 ✓ · vs white card 4.81:1
// ✓ · vs dark card 3.55:1 ✓. COOL_MIX #0E7490: L 0.146 → white text
// 5.36:1 ✓ · vs white card 5.36:1 ✓ · vs dark card 3.18:1 ✓. Mixes
// interpolate between those luminances, so every tint from 62° (14%) to
// 71° (79%) stays inside [3.18, 5.36] vs surfaces and [4.81, 5.36] under
// white text in BOTH schemes. (Spec floated light-dark(#0E7490,#155E75);
// #155E75 vs the dark card is 2.35:1 — fails the ≥3:1 amendment — so the
// dark side stays at the light anchors. Deviation noted.)
const EMBER_MIX = 'light-dark(#C2410C, #C2410C)';
const COOL_MIX = 'light-dark(#0E7490, #0E7490)';
// Text over block fills — solid white both schemes (math above).
const BLOCK_TEXT = '#FFFFFF';
// resizeHandle affordance over block fills: spec's white/40% pill blends
// to ≈1.9:1 vs the ember fill — fails the ≥3:1 interactive-boundary
// amendment — so the pill is SOLID white (4.81:1 vs the darkest mix, ✓
// both schemes) with a 1px shadow for the light extreme. Deviation noted.
const HANDLE_PILL = '#FFFFFF';
// Switch OFF track at rest: foundations' rgba(21,17,12,0.14) composites
// to ≈1.25:1 on the white card — fails the ≥3:1 interactive-rest
// amendment — so the OFF track is opaque: #82796F on #FFFFFF = 4.27:1 ✓;
// #757069 on the dark card = 3.47:1 ✓. White 27px thumb reads on both.
const SWITCH_OFF = 'light-dark(#82796F, #757069)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// skeleton shimmer, and the reduced-motion guard (transitions collapse,
// shimmer REMOVED — static muted blocks still encode 'loading').
// ---------------------------------------------------------------------------

const EMBER_CSS = \`
.emb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.emb-btn:disabled { cursor: default; }
.emb-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.emb-anim { transition: transform 200ms ease, opacity 200ms ease; }
.emb-fade { transition: opacity 200ms ease; }
@keyframes emb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.emb-sheet-in { animation: emb-sheet-in 200ms ease; }
@keyframes emb-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.emb-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 55%, transparent), transparent);
  animation: emb-shimmer 1.6s linear infinite;
}
.emb-input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px \${BRAND_ACCENT};
}
.emb-vh {
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
  .emb-anim, .emb-fade { transition: none; }
  .emb-sheet-in { animation: none; }
  .emb-shimmer::after { animation: none; content: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — mobile density grid verbatim: 16px gutter · 12px card gaps ·
// 24px section gaps · 8px chip gaps · 44px rows · 32px per track hour.
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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (noted).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center'},
  // Center title fades in when the largeTitle scrolls under (IO sentinel).
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
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
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
  },
  backBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 4,
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LARGE TITLE — 52px row below the 52px navBar (104px total header).
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
  },
  largeTitle: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.1},
  outdoorChip: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sentinel: {height: 1, width: 1},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
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
  cardGap: {height: 12},
  sectionGap: {height: 24},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  row44: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // HERO DIAL CARD (Home).
  heroCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  dialWrap: {position: 'relative', width: 200, height: 200},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center'},
  // 44px/700 — the one sanctioned oversize numeral.
  dialNumeral: {fontSize: 44, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums'},
  // Caption renders as up to two centered lines (split on ' · ') so
  // 'Holding · Away until 5:30 PM' fits the ~150px dial interior.
  dialCaption: {
    fontSize: 13,
    lineHeight: 1.3,
    color: 'var(--color-text-secondary)',
    maxWidth: 140,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dialCaptionLine: {
    maxWidth: 140,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nextChangeChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  runtimeBadge: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // DualSetpointStepper — two 96×32 tracks, values adjacent, caption
  // between/below.
  setpointRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  setpointGroup: {display: 'flex', flexDirection: 'column', gap: 4},
  setpointOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  setpointValueRow: {display: 'flex', alignItems: 'center', gap: 8},
  setpointValue: {
    minWidth: 36,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    borderRadius: 6,
  },
  stepperTrack: {
    width: 96,
    height: 32,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Glyphs (Minus/Plus at --color-text-secondary ≥4.5:1) are the visible
  // interactive signifier on the muted track; halves get 44×44 effective
  // hits via the parent row's padding per the foundations stepper contract.
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  stepperRule: {width: 1, background: 'var(--color-border)'},
  gapCaption: {
    width: '100%',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // Mode segmented control — 36px track, active pill 10px inside 12px.
  segTrack: {
    marginInline: 16,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  segItem: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segItemActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // WEEK STRIP — 7 flex:1 chips, 4px gaps; each chip is ONE whole button
  // ≥56px tall (merged-target clause; ~38px wide at 320 is legal).
  weekStrip: {
    display: 'flex',
    gap: 4,
    paddingInline: 16,
  },
  dayChip: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  dayChipSelected: {boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`, borderColor: 'transparent'},
  dayInitial: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  dayInitialSelected: {color: BRAND_TEXT, fontWeight: 600},
  bandCol: {
    width: 16,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 4,
    overflow: 'hidden',
  },
  band: {height: 8, width: '100%'},
  // SCHEDULE TRACK — 1 hour = 32px → 768px; 44px hour gutter.
  trackCard: {
    marginInline: 16,
    padding: '12px 12px 12px 0',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  trackFlex: {display: 'flex'},
  hourGutter: {position: 'relative', width: 44, flexShrink: 0, height: 768},
  hourLabel: {
    position: 'absolute',
    right: 6,
    transform: 'translateY(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  trackArea: {position: 'relative', flex: 1, minWidth: 0, height: 768},
  hourLine: {
    position: 'absolute',
    insetInline: 0,
    height: 1,
    background: 'var(--color-border)',
  },
  // Blocks — 8px radius, 2px vertical inset from neighbors, white text
  // (contrast math at the mix anchors above).
  block: {
    position: 'absolute',
    insetInline: 0,
    borderRadius: 8,
    color: BLOCK_TEXT,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '6px 12px',
    overflow: 'hidden',
  },
  // flexShrink 0 + fixed line-heights: in a fixed-height flex column the
  // one child with overflow:hidden otherwise absorbs ALL the shrink and
  // squishes to nothing (the 62px Wind-down block lost its label to
  // exactly this). 6+16+20+13+6 = 61 ≤ 62 → all three lines fit the
  // shortest fixture block; shorter drag results gate lines by height.
  blockLabel: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '16px',
    flexShrink: 0,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  blockTemps: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  blockDur: {fontSize: 11, fontWeight: 500, lineHeight: '13px', flexShrink: 0, whiteSpace: 'nowrap'},
  blockEllipsis: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BLOCK_TEXT,
    zIndex: 2,
  },
  // resizeHandle — 44px hit zone straddling the boundary; solid-white
  // 36×5 pill + grip glyph (≥3:1 amendment; math at HANDLE_PILL).
  handleZone: {
    position: 'absolute',
    left: '20%',
    width: '60%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 3,
    touchAction: 'none',
    cursor: 'ns-resize',
    borderRadius: 12,
  },
  handlePill: {
    width: 36,
    height: 5,
    borderRadius: 999,
    background: HANDLE_PILL,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
  },
  handleGrip: {color: HANDLE_PILL, display: 'inline-flex', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))'},
  dragBubble: {
    position: 'absolute',
    right: 8,
    transform: 'translateY(-50%)',
    zIndex: 4,
    padding: '4px 8px',
    borderRadius: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  dragBubbleClamp: {fontWeight: 600},
  // Anchored block menu — z30, below the sheet scrim's z40.
  anchoredMenu: {
    position: 'absolute',
    right: 8,
    zIndex: 30,
    minWidth: 220,
    maxWidth: 'calc(100% - 16px)',
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
  menuRowDanger: {color: 'var(--color-error)'},
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ComfortCurvePreview card.
  curveCard: {
    marginInline: 16,
    padding: '12px 16px 8px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  curveTitle: {fontSize: 13, fontWeight: 600, marginBottom: 4},
  curveSvg: {width: '100%', height: 'auto', display: 'block'},
  // ENERGY tab.
  energyHeader: {
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  energyStat: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  energySub: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  barRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    padding: '8px 16px 12px',
    height: 148,
  },
  barCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    height: '100%',
  },
  barValue: {fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)'},
  bar: {width: '100%', maxWidth: 28, borderRadius: 4, background: BRAND_ACCENT},
  barDay: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  barDayToday: {color: BRAND_TEXT, fontWeight: 600},
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  row60Text: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  row60Primary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row60Secondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row60Meta: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  skeletonRow: {height: 60, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelStack: {flex: 1, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {
    position: 'relative',
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  // Switches — 51×31 track; OFF math at SWITCH_OFF.
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
  // Empty state (Off mode) — exactly one action.
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
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  // Sticky dock: toast rides 12px above the 64px tabBar so the one live
  // region stays viewport-visible on tall pages (position:fixed banned;
  // shell-absolute pins to the DOCUMENT bottom — the amendment's bug).
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20, marginTop: 24},
  toastRegion: {
    position: 'absolute',
    bottom: 76,
    insetInline: 16,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // Absolute variant — ONLY while the sheet scroll-locks the shell.
  toastRegionLocked: {
    position: 'absolute',
    bottom: 76,
    insetInline: 16,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastCard: {
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
  toastAction: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  tabBar: {
    display: 'flex',
    height: 64,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  // Active tab carries the quarantined ember TEXT pair, not
  // var(--color-brand) (the demo-logo blue would break the accent law).
  tabItemActive: {color: BRAND_TEXT},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // SHEET — scrim z40 + sheet z41, absolute inside shell.
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM, border: 'none', padding: 0},
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  saveBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    // White on #D9480F = 4.54:1 ✓; dark side flips to near-black ember —
    // #2E1503 on #FFA94D = 9.4:1 ✓ (white on #FFA94D fails at ~1.9:1).
    color: 'light-dark(#FFFFFF, #2E1503)',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  timePill: {
    height: 36,
    paddingInline: 16,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  timePillDisabled: {opacity: 0.45},
  timePanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: '8px 16px 12px',
  },
  timeStepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  timeReadout: {
    minWidth: 96,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 6,
  },
  formField: {display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px 4px'},
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
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  sheetSection: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates. The
// suite's frozen "now": FIXTURE_NOW = Tuesday 3:12 PM = minute 912. No
// Date(), no Math.random().
// ---------------------------------------------------------------------------

const NOW_MIN = 912; // 3:12 PM
const FIXTURE_NOW = 'Tuesday 3:12 PM';
const OUTDOOR = '41°F, Overcast';
const INDOOR_TEMP = 66; // within the Away deadband: 64 ≤ 66 ≤ 80 ✓ → Holding

type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
const DAY_ORDER: DayId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<DayId, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};
const DAY_INITIAL: Record<DayId, string> = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S',
};
const TODAY: DayId = 'tue';

interface Block {
  id: string;
  startMin: number;
  endMin: number;
  heat: number;
  cool: number;
  label: string;
  // Fixture duty table (fraction of the block the system actually runs):
  // Night 20% · Morning 40% · Away 10% · Evening 40% · Wind-down 30%.
  dutyPct: number;
}

// WEEKDAY canonical five blocks — Σ(end−start) = 360+150+540+270+120 =
// 1440 ✓ (the invariant resizeBlock preserves forever). Deadband gaps:
// 16, 6, 16, 4, 11 — all ≥2° ✓. Runtime: 360×0.20=72 · 150×0.40=60 ·
// 540×0.10=54 · 270×0.40=108 · 120×0.30=36 → 330 min = 5h 30m ✓.
const WEEKDAY_BLOCKS = [
  {start: 0, end: 360, heat: 62, cool: 78, label: 'Night', duty: 20},
  {start: 360, end: 510, heat: 70, cool: 76, label: 'Morning', duty: 40},
  {start: 510, end: 1050, heat: 64, cool: 80, label: 'Away', duty: 10},
  {start: 1050, end: 1320, heat: 71, cool: 75, label: 'Evening', duty: 40},
  {start: 1320, end: 1440, heat: 66, cool: 77, label: 'Wind-down', duty: 30},
];
// WEEKEND variant (Sat/Sun) — Morning extended to 10:00 AM, Away
// shortened to 10:00 AM–4:00 PM, Evening starts 4:00 PM: Σ = 360+240+
// 360+360+120 = 1440 ✓ (stress fixture 5: per-day arrays render
// independently; Sat's heatmap bands differ from Tue's).
const WEEKEND_BLOCKS = [
  {start: 0, end: 360, heat: 62, cool: 78, label: 'Night', duty: 20},
  {start: 360, end: 600, heat: 70, cool: 76, label: 'Morning', duty: 40},
  {start: 600, end: 960, heat: 64, cool: 80, label: 'Away', duty: 10},
  {start: 960, end: 1320, heat: 71, cool: 75, label: 'Evening', duty: 40},
  {start: 1320, end: 1440, heat: 66, cool: 77, label: 'Wind-down', duty: 30},
];

function buildDay(day: DayId): Block[] {
  const rows = day === 'sat' || day === 'sun' ? WEEKEND_BLOCKS : WEEKDAY_BLOCKS;
  return rows.map((row, index) => ({
    id: \`\${day}_b\${index}\`,
    startMin: row.start,
    endMin: row.end,
    heat: row.heat,
    cool: row.cool,
    label: row.label,
    dutyPct: row.duty,
  }));
}

type Week = Record<DayId, Block[]>;

const INITIAL_WEEK: Week = {
  mon: buildDay('mon'),
  tue: buildDay('tue'),
  wed: buildDay('wed'),
  thu: buildDay('thu'),
  fri: buildDay('fri'),
  sat: buildDay('sat'),
  sun: buildDay('sun'),
};

// ENERGY — daily kWh (dual fields: kwh number + rendered label). Weekly
// total derives live from the rows: 9.2+8.6+10.4+7.8+9.6+11.2+10.2 =
// 67.0 kWh ✓; last week 72.8 → 67.0/72.8 = 0.9203 → −8% ✓.
const ENERGY_DAYS = [
  {day: 'mon' as DayId, kwh: 9.2, label: '9.2'},
  {day: 'tue' as DayId, kwh: 8.6, label: '8.6'},
  {day: 'wed' as DayId, kwh: 10.4, label: '10.4'},
  {day: 'thu' as DayId, kwh: 7.8, label: '7.8'},
  {day: 'fri' as DayId, kwh: 9.6, label: '9.6'},
  {day: 'sat' as DayId, kwh: 11.2, label: '11.2'},
  {day: 'sun' as DayId, kwh: 10.2, label: '10.2'},
];
const LAST_WEEK_KWH = 72.8;
// Breakdown rows — 41.8+12.6+8.2+4.4 = 67.0 ✓ (shares 62+19+12+7 = 100).
const ENERGY_BREAKDOWN = [
  {id: 'heating', label: 'Heating', kwh: '41.8', share: '62% of use'},
  {id: 'fan', label: 'Fan', kwh: '12.6', share: '19% of use'},
  {id: 'cooling', label: 'Cooling', kwh: '8.2', share: '12% of use'},
  {id: 'aux', label: 'Aux heat', kwh: '4.4', share: '7% of use'},
];

// SENSORS — (66+64+68+59)/4 = 64.25 → displayed 'Avg 64.3°' (banker's
// rounding not used; plain half-up, noted per fixture plan).
const SENSORS = [
  {id: 'living', name: 'Living Room', temp: 66},
  {id: 'bedroom', name: 'Bedroom', temp: 64},
  {id: 'nursery', name: 'Nursery', temp: 68},
  {id: 'basement', name: 'Basement', temp: 59},
];
const SENSOR_AVG_LABEL = '64.3°';

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — pure functions of the week store.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '5:30 PM' (1440 wraps to 12:00 AM). */
function fmtClock(minRaw: number): string {
  const min = ((minRaw % 1440) + 1440) % 1440;
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

/** Duration minutes → '5h 30m' / '45m'. */
function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return \`\${m}m\`;
  return \`\${h}h \${m}m\`;
}

/** Temperature → block tint percent: clamp((heat−60)/14×100). 62→14,
 * 64→29, 66→43, 70→71, 71→79 (matches the spec table). */
function pctFor(heat: number): number {
  return Math.round(Math.max(0, Math.min(100, ((heat - 60) / 14) * 100)));
}

/** Temperature-interpolated fill — mixes the two contrast-verified
 * anchors (math at EMBER_MIX/COOL_MIX). */
function mixFor(heat: number): string {
  const pct = pctFor(heat);
  return \`color-mix(in srgb, \${EMBER_MIX} \${pct}%, \${COOL_MIX} \${100 - pct}%)\`;
}

/** Block containing \`min\` (day is a sorted, gap-free partition of 1440). */
function blockAt(blocks: Block[], min: number): Block {
  return blocks.find(block => min >= block.startMin && min < block.endMin) ?? blocks[blocks.length - 1];
}

/** Next boundary strictly after \`now\` → {min, heat}. 3:12 PM (912) falls
 * inside Away (510–1050) → boundary 1050 = 5:30 PM, target heat 71
 * (Evening) → chip 'Next change 5:30 PM → 71°'. After the last boundary
 * it wraps to tomorrow's Night (12:00 AM → 62°). */
function nextChange(blocks: Block[], now: number): {min: number; heat: number} {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].endMin > now && i + 1 < blocks.length) {
      return {min: blocks[i].endMin, heat: blocks[i + 1].heat};
    }
  }
  return {min: 1440, heat: blocks[0].heat};
}

/** Σ duration×duty — Tue fixture: 72+60+54+108+36 = 330 = '5h 30m'.
 * After the signature +30 drag on Away's end: Away 570×10% = 57, Evening
 * 240×40% = 96 → 72+60+57+96+36 = 321 = '5h 21m'. */
function runtimeMin(blocks: Block[]): number {
  return Math.round(blocks.reduce((sum, block) => sum + (block.endMin - block.startMin) * (block.dutyPct / 100), 0));
}

/** Time-weighted average heat over [from, to) for the heatmap bands. */
function periodAvgHeat(blocks: Block[], from: number, to: number): number {
  let weighted = 0;
  for (const block of blocks) {
    const lo = Math.max(from, block.startMin);
    const hi = Math.min(to, block.endMin);
    if (hi > lo) weighted += block.heat * (hi - lo);
  }
  return weighted / (to - from);
}

/** Night 12AM–6AM · Day 6AM–5PM · Evening 5PM–12AM band temps. */
function bandTemps(blocks: Block[]): number[] {
  return [periodAvgHeat(blocks, 0, 360), periodAvgHeat(blocks, 360, 1020), periodAvgHeat(blocks, 1020, 1440)];
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage. */
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

/** Nearest scrollable ancestor (the demo's .preview-wrap owns page
 * scroll); falls back to the document scroller. Used for per-tab scroll
 * persistence and the active-tab re-tap pop-to-top. */
function getScrollParent(node: HTMLElement | null): HTMLElement {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input, [role="spinbutton"], [role="slider"]',
  );
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
// SETPOINT MATH — the 2° deadband law, in ONE place. Raising heat to
// within 2° of cool pushes cool up (heat 74 + cool 75 → cool 76 — stress
// fixture 2: Evening 71/75 is exactly at gap 4; +1 → 72/75 gap 3 ok, +2
// more → 74 pushes cool to 76); lowering cool pushes heat down
// symmetrically. Hard range 50–90.
// ---------------------------------------------------------------------------

interface SetpointResult {
  heat: number;
  cool: number;
  pushed: 'heat' | 'cool' | null;
}

function stepSetpoint(kind: 'heat' | 'cool', delta: number, heat: number, cool: number): SetpointResult {
  if (kind === 'heat') {
    const nextHeat = Math.max(50, Math.min(88, heat + delta));
    if (nextHeat + 2 > cool) {
      return {heat: nextHeat, cool: Math.min(90, nextHeat + 2), pushed: 'cool'};
    }
    return {heat: nextHeat, cool, pushed: null};
  }
  const nextCool = Math.max(52, Math.min(90, cool + delta));
  if (nextCool - 2 < heat) {
    return {heat: Math.max(50, nextCool - 2), cool: nextCool, pushed: 'heat'};
  }
  return {heat, cool: nextCool, pushed: null};
}

// ---------------------------------------------------------------------------
// DIAL GEOMETRY — 270° gauge, 0° at 12 o'clock, clockwise positive.
// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, r: number, deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad)};
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const from = polar(cx, cy, r, fromDeg);
  const to = polar(cx, cy, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${r} \${r} 0 \${large} 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}

// ---------------------------------------------------------------------------
// DualSetpointStepper — two linked 96×32 tracks (heat left, ember; cool
// right, teal); values are role='spinbutton' (ArrowUp/Down = 1°); halves
// are real buttons; a pushed value flashes weight 600 for one render
// (cleared on the next interaction, no timer).
// ---------------------------------------------------------------------------

interface DualSetpointStepperProps {
  heat: number;
  cool: number;
  flash: 'heat' | 'cool' | null;
  idPrefix: string;
  onStep: (kind: 'heat' | 'cool', delta: number) => void;
}

function DualSetpointStepper({heat, cool, flash, idPrefix, onStep}: DualSetpointStepperProps) {
  const group = (kind: 'heat' | 'cool') => {
    const value = kind === 'heat' ? heat : cool;
    const atMin = kind === 'heat' ? value <= 50 : value <= 52;
    const atMax = kind === 'heat' ? value >= 88 : value >= 90;
    const tint = kind === 'heat' ? BRAND_TEXT : COOL_ACCENT;
    const name = kind === 'heat' ? 'Heat setpoint' : 'Cool setpoint';
    return (
      <div style={styles.setpointGroup}>
        <span style={{...styles.setpointOverline, color: tint}}>{kind === 'heat' ? 'Heat' : 'Cool'}</span>
        <div style={styles.setpointValueRow}>
          <span
            id={\`\${idPrefix}-\${kind}\`}
            role="spinbutton"
            tabIndex={0}
            className="emb-focusable"
            aria-label={name}
            aria-valuenow={value}
            aria-valuemin={kind === 'heat' ? 50 : 52}
            aria-valuemax={kind === 'heat' ? 88 : 90}
            aria-valuetext={\`\${value} degrees\`}
            style={{...styles.setpointValue, fontWeight: flash === kind ? 600 : 400}}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onStep(kind, 1);
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                onStep(kind, -1);
              }
            }}>
            {value}°
          </span>
          <div style={styles.stepperTrack}>
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={{...styles.stepperHalf, ...(atMin ? {opacity: 0.35} : null)}}
              aria-label={\`Decrease \${name.toLowerCase()}\`}
              disabled={atMin}
              onClick={() => onStep(kind, -1)}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.stepperRule} aria-hidden />
            <button
              type="button"
              className="emb-btn emb-focusable"
              style={{...styles.stepperHalf, ...(atMax ? {opacity: 0.35} : null)}}
              aria-label={\`Increase \${name.toLowerCase()}\`}
              disabled={atMax}
              onClick={() => onStep(kind, 1)}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div style={styles.setpointRow}>
      {group('heat')}
      {group('cool')}
      <span style={styles.gapCaption}>2° minimum gap</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HERO DIAL — 200×200 SVG, 270° arc: 12px muted track, progress arc in the
// temperature-interpolated mix color; HTML center overlay carries the 44px
// numeral. role='img'; the toast dock is the single announcer.
// ---------------------------------------------------------------------------

interface HeroDialProps {
  indoor: number;
  caption: string;
}

function HeroDial({indoor, caption}: HeroDialProps) {
  // 50–90°F maps onto the 270° sweep: 66° → (66−50)/40 = 0.4 → 108°.
  const frac = Math.max(0, Math.min(1, (indoor - 50) / 40));
  const endDeg = -135 + frac * 270;
  return (
    <div style={styles.dialWrap} role="img" aria-label={\`Indoor \${indoor} degrees. \${caption}\`}>
      <svg width={200} height={200} viewBox="0 0 200 200" fill="none" aria-hidden>
        <path d={arcPath(100, 100, 82, -135, 135)} stroke="var(--color-background-muted)" strokeWidth={12} strokeLinecap="round" />
        <path d={arcPath(100, 100, 82, -135, endDeg)} stroke={mixFor(indoor)} strokeWidth={12} strokeLinecap="round" className="emb-fade" />
        <circle {...(() => {
          const p = polar(100, 100, 82, endDeg);
          return {cx: p.x, cy: p.y};
        })()} r={4} fill="var(--color-text-primary)" />
      </svg>
      <div style={styles.dialCenter}>
        <div style={styles.dialStack}>
          <span style={styles.dialNumeral}>{indoor}°</span>
          <span style={styles.dialCaption}>
            {caption.split(' · ').map((line, index) => (
              <span key={index} style={styles.dialCaptionLine}>
                {line}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WeekHeatStrip — 7 flex:1 day chips, each ONE whole ≥56px-tall button
// (merge clause) with a 3-band mini heatmap (night/day/evening average
// heat → same mix formula). role='radiogroup', roving tabIndex, arrow
// keys move days. Editing Tuesday retints its bands live (same store).
// ---------------------------------------------------------------------------

interface WeekHeatStripProps {
  week: Week;
  selectedDay: DayId;
  onSelect: (day: DayId) => void;
}

function WeekHeatStrip({week, selectedDay, onSelect}: WeekHeatStripProps) {
  const refs = useRef<Partial<Record<DayId, HTMLButtonElement | null>>>({});
  const move = (dir: 1 | -1) => {
    const index = DAY_ORDER.indexOf(selectedDay);
    const next = DAY_ORDER[(index + dir + 7) % 7];
    onSelect(next);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label="Day of week"
      style={styles.weekStrip}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          move(1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          move(-1);
        }
      }}>
      {DAY_ORDER.map(day => {
        const selected = day === selectedDay;
        const temps = bandTemps(week[day]);
        return (
          <button
            key={day}
            ref={node => {
              refs.current[day] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="emb-btn emb-focusable"
            style={{...styles.dayChip, ...(selected ? styles.dayChipSelected : null)}}
            aria-label={\`\${DAY_LABEL[day]}\${day === TODAY ? ', today' : ''}\`}
            onClick={() => onSelect(day)}>
            <span style={{...styles.dayInitial, ...(selected ? styles.dayInitialSelected : null)}}>
              {DAY_INITIAL[day]}
            </span>
            <span style={styles.bandCol} aria-hidden>
              {temps.map((temp, index) => (
                <span key={index} style={{...styles.band, background: mixFor(Math.round(temp))}} />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ComfortCurvePreview — 358×120 SVG (width 100%): stepped-ramp polyline
// anchored at each block boundary — horizontal at each block's heat, then
// a 45-min ramp (11.2px) at each transition. Recomputes from
// week[selectedDay] every render, mid-drag included. x = min×(358/1440);
// y maps 58–82° onto 108–12. Annotations mark the two largest ramps —
// derived live: Tue renders '+8° by 6:45 AM' (Night 62 → Morning 70; the
// spec's '+6°' example didn't reconcile with its own fixture — deviation
// noted) and '−6° by 9:15 AM' (Morning 70 → Away 64).
// ---------------------------------------------------------------------------

const CURVE_X = (min: number) => (min * 358) / 1440;
const CURVE_Y = (temp: number) => 108 - ((temp - 58) / 24) * 96;

function ComfortCurvePreview({blocks}: {blocks: Block[]}) {
  const heats = blocks.map(block => block.heat);
  const minHeat = Math.min(...heats);
  const maxHeat = Math.max(...heats);
  let path = \`M 0 \${CURVE_Y(blocks[0].heat).toFixed(1)}\`;
  const dots: Array<{x: number; y: number}> = [];
  const ramps: Array<{boundary: number; delta: number; fromY: number; toY: number}> = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const boundary = blocks[i].endMin;
    const fromY = CURVE_Y(blocks[i].heat);
    const toY = CURVE_Y(blocks[i + 1].heat);
    const rampEnd = Math.min(boundary + 45, 1440);
    path += \` L \${CURVE_X(boundary).toFixed(1)} \${fromY.toFixed(1)} L \${CURVE_X(rampEnd).toFixed(1)} \${toY.toFixed(1)}\`;
    dots.push({x: CURVE_X(boundary), y: fromY});
    ramps.push({boundary, delta: blocks[i + 1].heat - blocks[i].heat, fromY, toY});
  }
  path += \` L 358 \${CURVE_Y(blocks[blocks.length - 1].heat).toFixed(1)}\`;
  const topRamps = [...ramps].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 2);
  return (
    <div
      style={styles.curveCard}
      role="img"
      aria-label={\`Predicted indoor temperature, \${minHeat} to \${maxHeat} degrees across \${blocks.length} blocks\`}>
      <div style={styles.curveTitle}>Comfort curve</div>
      <svg viewBox="0 0 358 120" style={styles.curveSvg} aria-hidden>
        <line x1={0} y1={CURVE_Y(60)} x2={358} y2={CURVE_Y(60)} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={0} y1={CURVE_Y(70)} x2={358} y2={CURVE_Y(70)} stroke="var(--color-border)" strokeWidth={1} />
        <text x={2} y={CURVE_Y(70) - 3} fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
          70°
        </text>
        <text x={2} y={CURVE_Y(60) - 3} fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
          60°
        </text>
        <path d={path} stroke={BRAND_ACCENT} strokeWidth={2} fill="none" strokeLinejoin="round" />
        {dots.map((dot, index) => (
          <circle key={index} cx={dot.x} cy={dot.y} r={4} fill={BRAND_ACCENT} />
        ))}
        {topRamps.map((ramp, index) => {
          const label = \`\${ramp.delta > 0 ? '+' : '−'}\${Math.abs(ramp.delta)}° by \${fmtClock(ramp.boundary + 45)}\`;
          const x = Math.max(6, Math.min(255, CURVE_X(ramp.boundary) + 8));
          const y = Math.max(11, Math.min(ramp.fromY, ramp.toY) - 8);
          return (
            <text key={index} x={x} y={y} fontSize={11} fontWeight={500} fill="var(--color-text-primary)">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SetpointTimeline — vertical 24h track, 768px (32px/hour, 30-min snap =
// 16px). Blocks are real <button>s ('Edit Away, 8:30 AM to 5:30 PM')
// opening the editor sheet; each non-final block's bottom boundary
// carries a resizeHandle (44px hit zone, role='slider', ArrowUp/Down =
// 30-min) whose pointer drag WRITES THROUGH the store mid-drag. Long-
// press (450ms, cancel at 8px) opens the anchored menu; the visible
// 44×44 ellipsis on each tall-enough block is the mandatory button path.
// ---------------------------------------------------------------------------

const PX_PER_MIN = 32 / 60;
const HOUR_LABELS = [0, 180, 360, 540, 720, 900, 1080, 1260];

interface TimelineProps {
  dayId: DayId;
  blocks: Block[];
  menuBlockId: string | null;
  menuRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  onBlockOpen: (blockId: string, opener: HTMLElement) => void;
  onMenuToggle: (blockId: string | null, opener: HTMLElement | null) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onResize: (blockId: string, newEndMin: number) => void;
  onDragStart: (blockId: string) => void;
  onDragCommit: (blockId: string) => void;
}

interface DragLocal {
  blockId: string;
  startY: number;
  origEndMin: number;
  clamped: boolean;
  moved: boolean;
}

function SetpointTimeline({
  dayId,
  blocks,
  menuBlockId,
  menuRef,
  reducedMotion,
  onBlockOpen,
  onMenuToggle,
  onDuplicate,
  onDelete,
  onResize,
  onDragStart,
  onDragCommit,
}: TimelineProps) {
  const [drag, setDrag] = useState<DragLocal | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const pressOrigin = useRef({x: 0, y: 0});

  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (blockId: string, index: number) => (event: ReactPointerEvent<HTMLElement>) => {
    const block = blocks[index];
    pressOrigin.current = {x: event.clientX, y: event.clientY};
    setDrag({blockId, startY: event.clientY, origEndMin: block.endMin, clamped: false, moved: false});
    onDragStart(blockId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (index: number) => (event: ReactPointerEvent<HTMLElement>) => {
    setDrag(prev => {
      if (prev == null) return prev;
      const block = blocks[index];
      const next = blocks[index + 1];
      const dy = event.clientY - prev.startY;
      const moved = prev.moved || Math.abs(dy) > 4;
      // 30-min snap: 16px per tick.
      const desired = prev.origEndMin + Math.round((dy / PX_PER_MIN) / 30) * 30;
      const lo = block.startMin + 30;
      const hi = next.endMin - 30;
      const clampedEnd = Math.max(lo, Math.min(hi, desired));
      if (clampedEnd !== block.endMin) onResize(prev.blockId, clampedEnd);
      return {...prev, moved, clamped: desired !== clampedEnd};
    });
  };

  const handlePointerUp = () => {
    if (drag == null) return;
    if (drag.moved) onDragCommit(drag.blockId);
    setDrag(null);
  };

  const handleKeyResize = (index: number) => (event: ReactKeyboardEvent<HTMLElement>) => {
    const block = blocks[index];
    const next = blocks[index + 1];
    let delta = 0;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') delta = 30;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') delta = -30;
    else return;
    event.preventDefault();
    const lo = block.startMin + 30;
    const hi = next.endMin - 30;
    onResize(block.id, Math.max(lo, Math.min(hi, block.endMin + delta)));
  };

  const menuIndex = blocks.findIndex(block => block.id === menuBlockId);
  const nextDay = DAY_ORDER[(DAY_ORDER.indexOf(dayId) + 1) % 7];

  return (
    <div style={styles.trackCard}>
      <div style={styles.trackFlex}>
        <div style={styles.hourGutter} aria-hidden>
          {HOUR_LABELS.map(min => (
            <span key={min} style={{...styles.hourLabel, top: min * PX_PER_MIN}}>
              {fmtClock(min).replace(':00', '')}
            </span>
          ))}
        </div>
        <div style={styles.trackArea}>
          {Array.from({length: 23}, (_, i) => (
            <span key={i} style={{...styles.hourLine, top: (i + 1) * 32}} aria-hidden />
          ))}
          {blocks.map(block => {
            const top = block.startMin * PX_PER_MIN + 1;
            const height = (block.endMin - block.startMin) * PX_PER_MIN - 2;
            const duration = block.endMin - block.startMin;
            // Height-gated lines (see blockLabel comment): a clamped
            // 30-min block (14px) keeps only its aria-label.
            const showLabel = height >= 26;
            const showTemps = height >= 52;
            const showDur = height >= 61;
            const showEllipsis = height >= 48;
            return (
              <div key={block.id}>
                <button
                  type="button"
                  className="emb-btn emb-focusable"
                  style={{
                    ...styles.block,
                    top,
                    height,
                    background: mixFor(block.heat),
                    transition: drag != null || reducedMotion ? 'none' : 'top 120ms ease, height 120ms ease',
                  }}
                  aria-label={\`Edit \${block.label}, \${fmtClock(block.startMin)} to \${fmtClock(block.endMin)}\`}
                  onPointerDown={event => {
                    pressOrigin.current = {x: event.clientX, y: event.clientY};
                    longPressFired.current = false;
                    clearLongPress();
                    const target = event.currentTarget;
                    longPressTimer.current = window.setTimeout(() => {
                      longPressFired.current = true;
                      onMenuToggle(block.id, target);
                    }, 450);
                  }}
                  onPointerMove={event => {
                    const dx = event.clientX - pressOrigin.current.x;
                    const dy = event.clientY - pressOrigin.current.y;
                    if (Math.hypot(dx, dy) > 8) clearLongPress();
                  }}
                  onPointerUp={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onClick={event => {
                    if (longPressFired.current) {
                      longPressFired.current = false;
                      return;
                    }
                    onBlockOpen(block.id, event.currentTarget);
                  }}>
                  {showLabel ? <span style={styles.blockLabel}>{block.label}</span> : null}
                  {showTemps ? (
                    <span style={styles.blockTemps}>
                      {block.heat}° / {block.cool}°
                    </span>
                  ) : null}
                  {showDur ? <span style={styles.blockDur}>{fmtDur(duration)}</span> : null}
                </button>
                {showEllipsis ? (
                  <button
                    type="button"
                    className="emb-btn emb-focusable"
                    style={{...styles.blockEllipsis, top: top + 2}}
                    aria-label={\`Actions for \${block.label}\`}
                    aria-expanded={menuBlockId === block.id}
                    onClick={event => onMenuToggle(menuBlockId === block.id ? null : block.id, event.currentTarget)}>
                    <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
                  </button>
                ) : null}
              </div>
            );
          })}
          {blocks.slice(0, -1).map((block, index) => {
            const boundaryY = block.endMin * PX_PER_MIN;
            const dragging = drag?.blockId === block.id;
            return (
              <span
                key={\`handle-\${block.id}\`}
                role="slider"
                tabIndex={0}
                className="emb-focusable"
                style={{...styles.handleZone, top: boundaryY - 22}}
                aria-label={\`Resize \${block.label}\`}
                aria-orientation="vertical"
                aria-valuenow={block.endMin}
                aria-valuemin={block.startMin + 30}
                aria-valuemax={blocks[index + 1].endMin - 30}
                aria-valuetext={\`\${block.label} ends \${fmtClock(block.endMin)}\`}
                onPointerDown={handlePointerDown(block.id, index)}
                onPointerMove={handlePointerMove(index)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyResize(index)}>
                <span style={styles.handlePill} aria-hidden />
                <span style={styles.handleGrip} aria-hidden>
                  <Icon icon={GripHorizontalIcon} size="sm" color="inherit" />
                </span>
              </span>
            );
          })}
          {drag != null
            ? (() => {
                const block = blocks.find(candidate => candidate.id === drag.blockId);
                if (block == null) return null;
                // Resistance state at the 30-min clamp (stress fixture 1):
                // the bubble flips to 600 weight with a 'Min 30m' caption.
                return (
                  <span
                    style={{
                      ...styles.dragBubble,
                      ...(drag.clamped ? styles.dragBubbleClamp : null),
                      top: block.endMin * PX_PER_MIN,
                    }}
                    aria-hidden>
                    {drag.clamped ? \`Min 30m · \${fmtClock(block.endMin)}\` : fmtClock(block.endMin)}
                  </span>
                );
              })()
            : null}
          {menuIndex >= 0 ? (
            <div
              ref={menuRef}
              role="menu"
              aria-label={\`Actions for \${blocks[menuIndex].label}\`}
              style={{...styles.anchoredMenu, top: blocks[menuIndex].startMin * PX_PER_MIN + 8}}
              onKeyDown={event => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                event.preventDefault();
                const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
                const active = items.indexOf(document.activeElement as HTMLElement);
                const next = event.key === 'ArrowDown' ? active + 1 : active - 1;
                items[(next + items.length) % items.length]?.focus();
              }}>
              <button
                type="button"
                role="menuitem"
                className="emb-btn emb-focusable"
                style={styles.menuRow}
                onClick={() => onDuplicate(blocks[menuIndex].id)}>
                <Icon icon={CopyIcon} size="sm" color="secondary" />
                <span style={styles.menuRowText}>Copy setpoints to {DAY_LABEL[nextDay]}</span>
              </button>
              <div style={styles.rowDivider} />
              <button
                type="button"
                role="menuitem"
                className="emb-btn emb-focusable"
                style={{...styles.menuRow, ...styles.menuRowDanger}}
                onClick={() => onDelete(blocks[menuIndex].id)}>
                <Icon icon={Trash2Icon} size="sm" color="inherit" />
                <span style={styles.menuRowText}>Delete block</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber (real 'Resize sheet' button: click toggles
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

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="emb-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="emb-btn emb-focusable"
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
        <button type="button" className="emb-btn emb-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Switch row — the ENTIRE 44px utility row is the role='switch' button;
// the 51×31 track never stands alone. ON = ember fill; OFF = SWITCH_OFF
// (≥3:1 rest-state math at the declaration).
// ---------------------------------------------------------------------------

interface SwitchRowProps {
  label: string;
  checked: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
}

function SwitchRow({label, checked, reducedMotion, onToggle}: SwitchRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="emb-btn emb-focusable"
      style={styles.row44}
      onClick={onToggle}>
      <span style={styles.rowLabel}>{label}</span>
      <span
        style={{...styles.switchTrack, background: checked ? BRAND_ACCENT : SWITCH_OFF}}
        aria-hidden>
        <span
          style={{
            ...styles.switchThumb,
            transform: checked ? 'translateX(20px)' : undefined,
            transition: reducedMotion ? 'none' : 'transform 200ms ease',
          }}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useAppState(): every surface reads it; the mutation
// surface is update(patch) + updateBlock/resizeBlock/deleteBlock in the
// page. resizeBlock writes BOTH the block's endMin and the next block's
// startMin in one setState — invariant: Σ(end−start) over a day is
// ALWAYS 1440 (every mutation moves minutes between neighbors, never
// creates or destroys them).
// ---------------------------------------------------------------------------

type Tab = 'home' | 'schedule' | 'energy' | 'settings';

interface SheetDraft {
  startMin: number;
  endMin: number;
  heat: number;
  cool: number;
  label: string;
}

interface SheetState {
  open: boolean;
  detent: 'medium' | 'large';
  blockId: string | null;
  draft: SheetDraft | null;
  expanded: 'start' | 'end' | null;
  labelError: boolean;
}

interface ToastState {
  seq: number;
  msg: string;
  // Undo restores the exact prior week arrays (positions, minutes,
  // scroll untouched). Null = informational toast, no Undo button.
  undoWeek: Week | null;
}

interface AppState {
  tab: Tab;
  settingsScreen: 'root' | 'sensors';
  week: Week;
  selectedDay: DayId;
  hold: {active: boolean; heat: number; cool: number};
  mode: 'auto' | 'heat' | 'cool' | 'off';
  sheet: SheetState;
  menuBlockId: string | null;
  toast: ToastState | null;
  energySkeleton: boolean;
  energyUpdated: boolean;
  // Pushed-setpoint flash — weight 600 for ONE render, cleared by the
  // next interaction (update() nulls it unless a patch re-sets it).
  flash: 'heat' | 'cool' | null;
  switches: {eco: boolean; remote: boolean; filter: boolean};
}

const INITIAL_STATE: AppState = {
  tab: 'home',
  settingsScreen: 'root',
  week: INITIAL_WEEK,
  selectedDay: TODAY,
  hold: {active: false, heat: 71, cool: 75},
  mode: 'auto',
  sheet: {open: false, detent: 'medium', blockId: null, draft: null, expanded: null, labelError: false},
  menuBlockId: null,
  toast: null,
  energySkeleton: false,
  energyUpdated: false,
  flash: null,
  switches: {eco: true, remote: true, filter: false},
};

const MODES: Array<{id: AppState['mode']; label: string}> = [
  {id: 'auto', label: 'Auto'},
  {id: 'heat', label: 'Heat'},
  {id: 'cool', label: 'Cool'},
  {id: 'off', label: 'Off'},
];

const TABS: Array<{id: Tab; label: string; icon: typeof HouseIcon}> = [
  {id: 'home', label: 'Home', icon: HouseIcon},
  {id: 'schedule', label: 'Schedule', icon: CalendarClockIcon},
  {id: 'energy', label: 'Energy', icon: ZapIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

// 28px Emberline flame mark in a 44×44 non-button nav slot.
function EmberMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 1.5c.4 2.2-.9 3.4-2.1 4.7C4.6 7.6 3.5 9 3.5 10.7a4.5 4.5 0 0 0 9 0c0-2.6-1.7-3.9-2.4-5.9-.4.9-.3 1.9.1 2.8-1.3-.4-2.4-2.7-2.2-6.1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileThermostatScheduleTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<AppState>(INITIAL_STATE);
  // Every update() clears the one-render setpoint flash unless the patch
  // re-sets it — 'cleared on next interaction', no timer.
  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({...prev, flash: null, ...patch}));
  }, []);

  // Latest-week ref for drag snapshots (transient pointer state only).
  const weekRef = useRef(state.week);
  weekRef.current = state.week;

  const toastSeqRef = useRef(0);
  const makeToast = (msg: string, undoWeek: Week | null = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undoWeek};
  };

  // Focus plumbing — opener restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const labelInputRef = useRef<HTMLInputElement | null>(null);
  const dragSnapshotRef = useRef<Week | null>(null);
  const scrollTopsRef = useRef<Record<Tab, number>>({home: 0, schedule: 0, energy: 0, settings: 0});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [titleCompact, setTitleCompact] = useState(false);

  // ---- STORE MUTATORS ------------------------------------------------------

  /** Snap to 30-min, clamp to [start+30, next.end−30], write BOTH edges
   * in one setState. Day total stays 1440 by construction. */
  const resizeBlock = (dayId: DayId, blockId: string, newEndMin: number) => {
    setState(prev => {
      const blocks = prev.week[dayId];
      const index = blocks.findIndex(block => block.id === blockId);
      if (index < 0 || index >= blocks.length - 1) return prev;
      const block = blocks[index];
      const next = blocks[index + 1];
      const snapped = Math.round(newEndMin / 30) * 30;
      const clamped = Math.max(block.startMin + 30, Math.min(next.endMin - 30, snapped));
      if (clamped === block.endMin) return prev;
      const nextBlocks = blocks.slice();
      nextBlocks[index] = {...block, endMin: clamped};
      nextBlocks[index + 1] = {...next, startMin: clamped};
      return {...prev, flash: null, week: {...prev.week, [dayId]: nextBlocks}};
    });
  };

  const onDragStart = () => {
    dragSnapshotRef.current = weekRef.current;
  };

  /** Pointerup commit: if the drag changed anything, execute-with-Undo
   * (undoOverConfirm — no confirm dialogs, no toast timers). */
  const onDragCommit = (blockId: string) => {
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    if (snapshot == null) return;
    setState(prev => {
      const blocks = prev.week[prev.selectedDay];
      const block = blocks.find(candidate => candidate.id === blockId);
      const before = snapshot[prev.selectedDay].find(candidate => candidate.id === blockId);
      if (block == null || before == null || block.endMin === before.endMin) return prev;
      const verb = block.endMin > before.endMin ? 'extended' : 'shortened';
      return {...prev, flash: null, toast: makeToast(\`\${block.label} \${verb} to \${fmtClock(block.endMin)}\`, snapshot)};
    });
  };

  /** Delete merges the block's minutes into its previous neighbor (next
   * neighbor when deleting the first block) so the day still sums to
   * 1440 — stress fixture 7: deleting Morning (150m) grows Night to
   * 12:00 AM–8:30 AM = 510m; 510+540+270+120 = 1440 ✓. Undo restores the
   * exact five-block array. */
  const deleteBlock = (dayId: DayId, blockId: string) => {
    setState(prev => {
      const blocks = prev.week[dayId];
      if (blocks.length <= 2) return {...prev, toast: makeToast('A day needs at least two blocks')};
      const index = blocks.findIndex(block => block.id === blockId);
      if (index < 0) return prev;
      const snapshot = prev.week;
      const block = blocks[index];
      const nextBlocks = blocks.slice();
      nextBlocks.splice(index, 1);
      if (index > 0) {
        nextBlocks[index - 1] = {...nextBlocks[index - 1], endMin: block.endMin};
      } else {
        nextBlocks[0] = {...nextBlocks[0], startMin: block.startMin};
      }
      return {
        ...prev,
        flash: null,
        week: {...prev.week, [dayId]: nextBlocks},
        menuBlockId: null,
        sheet: {...prev.sheet, open: false, blockId: null, draft: null},
        toast: makeToast(\`\${block.label} deleted\`, snapshot),
      };
    });
    sheetOpenerRef.current = null; // opener block is gone
  };

  /** Anchored-menu duplicate: copies this block's setpoints + label onto
   * the same-index block of the NEXT day (times untouched, so the target
   * day's 1440 invariant holds; its heatmap bands retint live). */
  const duplicateBlock = (dayId: DayId, blockId: string) => {
    setState(prev => {
      const blocks = prev.week[dayId];
      const index = blocks.findIndex(block => block.id === blockId);
      const targetDay = DAY_ORDER[(DAY_ORDER.indexOf(dayId) + 1) % 7];
      const targetBlocks = prev.week[targetDay];
      if (index < 0 || index >= targetBlocks.length) return {...prev, menuBlockId: null};
      const source = blocks[index];
      const snapshot = prev.week;
      const nextTarget = targetBlocks.slice();
      nextTarget[index] = {...nextTarget[index], heat: source.heat, cool: source.cool, label: source.label, dutyPct: source.dutyPct};
      return {
        ...prev,
        flash: null,
        week: {...prev.week, [targetDay]: nextTarget},
        menuBlockId: null,
        toast: makeToast(\`\${source.label} setpoints copied to \${DAY_LABEL[targetDay]}\`, snapshot),
      };
    });
    menuOpenerRef.current?.focus();
  };

  const undoToast = () => {
    setState(prev => {
      if (prev.toast?.undoWeek == null) return prev;
      return {...prev, flash: null, week: prev.toast.undoWeek, toast: makeToast('Restored')};
    });
  };

  // ---- SHEET ---------------------------------------------------------------

  const openSheetFor = (blockId: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    setState(prev => {
      const block = prev.week[prev.selectedDay].find(candidate => candidate.id === blockId);
      if (block == null) return prev;
      return {
        ...prev,
        flash: null,
        menuBlockId: null,
        sheet: {
          open: true,
          detent: 'medium',
          blockId,
          draft: {startMin: block.startMin, endMin: block.endMin, heat: block.heat, cool: block.cool, label: block.label},
          expanded: null,
          labelError: false,
        },
      };
    });
  };

  const closeSheet = () => {
    update({sheet: {...state.sheet, open: false, blockId: null, draft: null, expanded: null, labelError: false}});
    sheetOpenerRef.current?.focus();
  };

  /** Draft boundary steppers — the BUTTON PATH to the same minutes the
   * drag handle edits (30-min steps, clamped ±30 from the committed
   * neighbors; day-edge boundaries are locked). */
  const stepDraftTime = (edge: 'start' | 'end', delta: number) => {
    setState(prev => {
      const {sheet} = prev;
      if (!sheet.open || sheet.draft == null || sheet.blockId == null) return prev;
      const blocks = prev.week[prev.selectedDay];
      const index = blocks.findIndex(block => block.id === sheet.blockId);
      if (index < 0) return prev;
      const draft = sheet.draft;
      if (edge === 'start') {
        if (index === 0) return prev;
        const lo = blocks[index - 1].startMin + 30;
        const hi = draft.endMin - 30;
        const next = Math.max(lo, Math.min(hi, draft.startMin + delta));
        return {...prev, flash: null, sheet: {...sheet, draft: {...draft, startMin: next}}};
      }
      if (index === blocks.length - 1) return prev;
      const lo = draft.startMin + 30;
      const hi = blocks[index + 1].endMin - 30;
      const next = Math.max(lo, Math.min(hi, draft.endMin + delta));
      return {...prev, flash: null, sheet: {...sheet, draft: {...draft, endMin: next}}};
    });
  };

  const stepDraftSetpoint = (kind: 'heat' | 'cool', delta: number) => {
    setState(prev => {
      const {sheet} = prev;
      if (!sheet.open || sheet.draft == null) return prev;
      const result = stepSetpoint(kind, delta, sheet.draft.heat, sheet.draft.cool);
      const patch: Partial<AppState> = {
        flash: result.pushed,
        sheet: {...sheet, draft: {...sheet.draft, heat: result.heat, cool: result.cool}},
      };
      if (result.pushed === 'cool') {
        patch.toast = makeToast(\`Cool raised to \${result.cool}° to keep 2° gap\`);
      } else if (result.pushed === 'heat') {
        patch.toast = makeToast(\`Heat lowered to \${result.heat}° to keep 2° gap\`);
      }
      return {...prev, flash: null, ...patch};
    });
  };

  /** Save writes the draft through the store in one setState: prev
   * neighbor's endMin ← draft.start, next neighbor's startMin ←
   * draft.end, block gets times + setpoints + label. Label validates on
   * blur/save only (never per keystroke). */
  const saveSheet = () => {
    if (state.sheet.draft != null && state.sheet.draft.label.trim() === '') {
      update({sheet: {...state.sheet, labelError: true}});
      labelInputRef.current?.focus();
      return;
    }
    setState(prev => {
      const {sheet} = prev;
      if (!sheet.open || sheet.draft == null || sheet.blockId == null) return prev;
      const blocks = prev.week[prev.selectedDay];
      const index = blocks.findIndex(block => block.id === sheet.blockId);
      if (index < 0) return prev;
      const draft = sheet.draft;
      const nextBlocks = blocks.slice();
      if (index > 0) nextBlocks[index - 1] = {...nextBlocks[index - 1], endMin: draft.startMin};
      if (index < blocks.length - 1) nextBlocks[index + 1] = {...nextBlocks[index + 1], startMin: draft.endMin};
      nextBlocks[index] = {
        ...nextBlocks[index],
        startMin: draft.startMin,
        endMin: draft.endMin,
        heat: draft.heat,
        cool: draft.cool,
        label: draft.label.trim(),
      };
      return {
        ...prev,
        flash: null,
        week: {...prev.week, [prev.selectedDay]: nextBlocks},
        sheet: {...sheet, open: false, blockId: null, draft: null, expanded: null, labelError: false},
        toast: makeToast(\`\${draft.label.trim()} updated · \${fmtClock(draft.startMin)}–\${fmtClock(draft.endMin)}\`),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // ---- HOLD / MODE ---------------------------------------------------------

  const stepHold = (kind: 'heat' | 'cool', delta: number) => {
    setState(prev => {
      const result = stepSetpoint(kind, delta, prev.hold.heat, prev.hold.cool);
      const patch: Partial<AppState> = {
        flash: result.pushed,
        hold: {active: true, heat: result.heat, cool: result.cool},
      };
      if (result.pushed === 'cool') patch.toast = makeToast(\`Cool raised to \${result.cool}° to keep 2° gap\`);
      else if (result.pushed === 'heat') patch.toast = makeToast(\`Heat lowered to \${result.heat}° to keep 2° gap\`);
      return {...prev, flash: null, ...patch};
    });
  };

  // ---- MENU ----------------------------------------------------------------

  const toggleMenu = (blockId: string | null, opener: HTMLElement | null) => {
    if (blockId != null) menuOpenerRef.current = opener;
    update({menuBlockId: blockId});
    if (blockId == null) menuOpenerRef.current?.focus();
  };

  // ---- TABS + SCROLL PERSISTENCE --------------------------------------------

  const handleTab = (next: Tab) => {
    const scroller = getScrollParent(wrapRef.current);
    if (next === state.tab) {
      // The one legal reset: re-tapping the active tab pops its stack to
      // root and scrolls to top (also the keyboard user's fast exit).
      update({settingsScreen: 'root'});
      scroller.scrollTop = 0;
      return;
    }
    scrollTopsRef.current[state.tab] = scroller.scrollTop;
    // Tab switch closes overlays ONLY (sheet, menu); per-tab state —
    // selectedDay, settings push depth, switches, scroll — persists.
    // The toast dock persists too. A pending energy skeleton resolves
    // (user action = the deterministic resolution trigger).
    update({
      tab: next,
      menuBlockId: null,
      sheet: {...state.sheet, open: false, blockId: null, draft: null},
      energySkeleton: false,
      energyUpdated: state.energySkeleton ? true : state.energyUpdated,
    });
  };

  useEffect(() => {
    const scroller = getScrollParent(wrapRef.current);
    scroller.scrollTop = scrollTopsRef.current[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  // Large-title collapse: navBar center title fades in once the sentinel
  // above the largeTitle scrolls under the 52px navBar (IO, user-driven).
  useEffect(() => {
    const node = sentinelRef.current;
    if (node == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setTitleCompact(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-64px 0px 0px 0px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [state.tab, state.settingsScreen]);

  // Focus into the opening sheet with preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (binding amendment).
  useEffect(() => {
    if (state.sheet.open) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheet.open]);
  useEffect(() => {
    if (state.menuBlockId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.menuBlockId]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menuBlockId != null) {
        update({menuBlockId: null});
        menuOpenerRef.current?.focus();
      } else if (state.sheet.open) {
        update({sheet: {...state.sheet, open: false, blockId: null, draft: null}});
        sheetOpenerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.menuBlockId, state.sheet.open]);

  // ---- DERIVED (pure functions of week — mid-drag included) -----------------

  const todayBlocks = state.week[TODAY];
  const activeBlock = blockAt(todayBlocks, NOW_MIN);
  const change = nextChange(todayBlocks, NOW_MIN);
  const runtime = runtimeMin(todayBlocks);
  const dayBlocks = state.week[state.selectedDay];
  const dayTotal = dayBlocks.reduce((sum, block) => sum + (block.endMin - block.startMin), 0);
  const weeklyKwh = ENERGY_DAYS.reduce((sum, row) => sum + row.kwh, 0); // 67.0 ✓
  const vsLastWeek = Math.round((1 - weeklyKwh / LAST_WEEK_KWH) * 100); // 8 ✓
  const dialCaption =
    state.mode === 'heat'
      ? \`Heating to \${state.hold.heat}°\`
      : state.mode === 'cool'
        ? \`Cooling to \${state.hold.cool}°\`
        : state.hold.active
          ? \`Hold \${state.hold.heat}°–\${state.hold.cool}°\`
          : \`Holding · \${activeBlock.label} until \${fmtClock(activeBlock.endMin)}\`;
  const activeIndex = todayBlocks.indexOf(activeBlock);
  const summaryRows = todayBlocks.slice(Math.min(activeIndex, Math.max(0, todayBlocks.length - 3)), activeIndex + 3);

  const sheetBlock =
    state.sheet.blockId != null ? state.week[state.selectedDay].find(block => block.id === state.sheet.blockId) ?? null : null;
  const sheetIndex = sheetBlock != null ? state.week[state.selectedDay].indexOf(sheetBlock) : -1;

  const onSensorsScreen = state.tab === 'settings' && state.settingsScreen === 'sensors';
  const navTitleText = onSensorsScreen ? 'Sensors' : 'Emberline';
  const navTitleVisible = onSensorsScreen || titleCompact;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet.open ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // The single polite live region — docked (sticky above the tabBar) in
  // normal flow; absolute-in-shell ONLY while the sheet scroll-locks.
  const toastNode = (
    <div style={state.sheet.open ? styles.toastRegionLocked : styles.toastRegion} aria-live="polite" role="status">
      {state.toast != null ? (
        <div key={state.toast.seq} style={styles.toastCard} className="emb-fade">
          <span style={styles.toastMsg}>{state.toast.msg}</span>
          {state.toast.undoWeek != null ? (
            <>
              <span style={styles.toastRule} aria-hidden />
              <button type="button" className="emb-btn emb-focusable" style={styles.toastAction} onClick={undoToast}>
                Undo
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="emb-btn emb-focusable"
            style={{...styles.iconBtn, width: 36}}
            aria-label="Dismiss message"
            onClick={() => update({toast: null})}>
            <Icon icon={XIcon} size="sm" color="inherit" />
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{EMBER_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — 52px sticky z20; back button on the Sensors push. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {onSensorsScreen ? (
              <button
                type="button"
                className="emb-btn emb-focusable"
                style={styles.backBtn}
                onClick={() => update({settingsScreen: 'root'})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Settings</span>
              </button>
            ) : (
              <EmberMark />
            )}
          </div>
          <h2 className="emb-fade" style={{...styles.navTitle, opacity: navTitleVisible ? 1 : 0}} aria-hidden={!navTitleVisible}>
            {navTitleText}
          </h2>
          <div style={styles.navTrailing}>
            {state.tab === 'energy' ? (
              <button
                type="button"
                className="emb-btn emb-focusable"
                style={styles.iconBtn}
                aria-label="Refresh energy data"
                onClick={() => {
                  if (state.energySkeleton) {
                    update({energySkeleton: false, energyUpdated: true, toast: makeToast('Updated just now')});
                  } else {
                    // Deterministic skeleton: appears on this press,
                    // resolves on the NEXT user action (second press or
                    // tab switch) — never on a timer.
                    update({energySkeleton: true, energyUpdated: false, toast: makeToast('Loading')});
                  }
                }}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : (
              <span style={{width: 44, height: 44}} aria-hidden />
            )}
          </div>
        </header>

        <main style={styles.main}>
          {/* HOME ------------------------------------------------------- */}
          {state.tab === 'home' ? (
            <>
              <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Home</h1>
                <span style={styles.outdoorChip}>{OUTDOOR}</span>
              </div>
              {state.mode === 'off' ? (
                <div style={styles.heroCard}>
                  {/* FILTERED-EMPTY analog (stress fixture 6): exactly one action. */}
                  <div style={styles.emptyState}>
                    <span style={styles.emptyCircle}>
                      <Icon icon={PowerIcon} size="lg" color="inherit" />
                    </span>
                    <h2 style={styles.emptyTitle}>Thermostat is off</h2>
                    <p style={styles.emptyBody}>Schedules resume when you pick a mode.</p>
                    <button
                      type="button"
                      className="emb-btn emb-focusable"
                      style={styles.emptyAction}
                      onClick={() => update({mode: 'auto', toast: makeToast('Auto mode on · schedule resumed')})}>
                      Turn on Auto
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.heroCard}>
                  <HeroDial indoor={INDOOR_TEMP} caption={dialCaption} />
                  <div style={styles.nextChangeChip}>
                    <Icon icon={ClockIcon} size="sm" color="secondary" />
                    <span>
                      Next change {fmtClock(change.min)} → {change.heat}°
                    </span>
                  </div>
                  <DualSetpointStepper
                    heat={state.hold.heat}
                    cool={state.hold.cool}
                    flash={state.flash}
                    idPrefix="emb-hold"
                    onStep={stepHold}
                  />
                  <span style={styles.runtimeBadge}>Est. runtime {fmtDur(runtime)}</span>
                </div>
              )}
              <div style={styles.sectionGap} />
              <div
                role="radiogroup"
                aria-label="Thermostat mode"
                style={styles.segTrack}
                onKeyDown={event => {
                  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                  event.preventDefault();
                  const index = MODES.findIndex(mode => mode.id === state.mode);
                  const dir = event.key === 'ArrowRight' ? 1 : -1;
                  const next = MODES[(index + dir + MODES.length) % MODES.length];
                  update({mode: next.id});
                }}>
                {MODES.map(mode => {
                  const active = state.mode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      className="emb-btn emb-focusable"
                      style={{...styles.segItem, ...(active ? styles.segItemActive : null)}}
                      onClick={() => update({mode: mode.id})}>
                      {mode.label}
                    </button>
                  );
                })}
              </div>
              <h2 style={styles.sectionHeader}>Today&rsquo;s schedule</h2>
              <div style={styles.listCard}>
                {summaryRows.map((block, index) => (
                  <div key={block.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="emb-btn emb-focusable"
                      style={styles.row44}
                      aria-label={\`\${block.label}, \${fmtClock(block.startMin)} to \${fmtClock(block.endMin)} — open Schedule\`}
                      onClick={() => handleTab('schedule')}>
                      <span style={styles.rowLabel}>
                        {block.label}
                        {block === activeBlock ? ' · Now' : ''}
                      </span>
                      <span style={styles.rowValue}>
                        {fmtClock(block.startMin)}–{fmtClock(block.endMin)} · {block.heat}°/{block.cool}°
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {/* SCHEDULE --------------------------------------------------- */}
          {state.tab === 'schedule' ? (
            <>
              <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Schedule</h1>
                <span style={styles.outdoorChip}>{DAY_LABEL[state.selectedDay]}</span>
              </div>
              <WeekHeatStrip
                week={state.week}
                selectedDay={state.selectedDay}
                onSelect={day => update({selectedDay: day, menuBlockId: null})}
              />
              <div style={styles.cardGap} />
              <SetpointTimeline
                dayId={state.selectedDay}
                blocks={dayBlocks}
                menuBlockId={state.menuBlockId}
                menuRef={menuRef}
                reducedMotion={reducedMotion}
                onBlockOpen={openSheetFor}
                onMenuToggle={toggleMenu}
                onDuplicate={blockId => duplicateBlock(state.selectedDay, blockId)}
                onDelete={blockId => deleteBlock(state.selectedDay, blockId)}
                onResize={(blockId, newEnd) => resizeBlock(state.selectedDay, blockId, newEnd)}
                onDragStart={onDragStart}
                onDragCommit={onDragCommit}
              />
              <div style={styles.terminalCaption}>
                All {dayBlocks.length} blocks · {fmtDur(dayTotal)}
              </div>
              <div style={styles.cardGap} />
              <ComfortCurvePreview blocks={dayBlocks} />
            </>
          ) : null}

          {/* ENERGY ------------------------------------------------------ */}
          {state.tab === 'energy' ? (
            <>
              <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Energy</h1>
              </div>
              <div style={styles.listCard} role="img" aria-label={\`This week \${weeklyKwh.toFixed(1)} kilowatt hours, down \${vsLastWeek} percent versus last week\`}>
                <div style={styles.energyHeader}>
                  <span style={styles.energyStat}>This week {weeklyKwh.toFixed(1)} kWh</span>
                  <span style={styles.energySub}>
                    −{vsLastWeek}% vs last week ({LAST_WEEK_KWH.toFixed(1)} kWh)
                  </span>
                </div>
                <div style={styles.barRow} aria-hidden>
                  {ENERGY_DAYS.map(row => (
                    <div key={row.day} style={styles.barCol}>
                      <span style={styles.barValue}>{row.label}</span>
                      <span style={{...styles.bar, height: (row.kwh / 11.2) * 96}} />
                      <span style={{...styles.barDay, ...(row.day === TODAY ? styles.barDayToday : null)}}>
                        {DAY_INITIAL[row.day]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Breakdown</h2>
              <div style={styles.listCard} aria-busy={state.energySkeleton}>
                {state.energySkeleton
                  ? // Deterministic skeleton — 3 rows at the SAME 60px
                    // geometry, staggered widths 60/45/70% and 40/55/30%
                    // (never random); shimmer removed under reduced motion.
                    [0, 1, 2].map(index => (
                      <div key={index}>
                        {index > 0 ? <div style={styles.rowDivider} /> : null}
                        <div style={styles.skeletonRow} aria-hidden>
                          <div style={styles.skelStack}>
                            <div className="emb-shimmer" style={{...styles.skelBar, width: \`\${[60, 45, 70][index]}%\`}} />
                            <div className="emb-shimmer" style={{...styles.skelBar, width: \`\${[40, 55, 30][index]}%\`}} />
                          </div>
                        </div>
                      </div>
                    ))
                  : ENERGY_BREAKDOWN.map((row, index) => (
                      <div key={row.id}>
                        {index > 0 ? <div style={styles.rowDivider} /> : null}
                        <div style={styles.row60}>
                          <div style={styles.row60Text}>
                            <span style={styles.row60Primary}>{row.label}</span>
                            <span style={styles.row60Secondary}>{row.share}</span>
                          </div>
                          <span style={styles.row60Meta}>{row.kwh} kWh</span>
                        </div>
                      </div>
                    ))}
              </div>
              {state.energyUpdated && !state.energySkeleton ? (
                <div style={styles.terminalCaption}>Updated just now</div>
              ) : null}
            </>
          ) : null}

          {/* SETTINGS ---------------------------------------------------- */}
          {state.tab === 'settings' && state.settingsScreen === 'root' ? (
            <>
              <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Settings</h1>
              </div>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="emb-btn emb-focusable"
                  style={styles.row44}
                  onClick={() => {
                    update({settingsScreen: 'sensors'});
                    getScrollParent(wrapRef.current).scrollTop = 0;
                  }}>
                  <span style={styles.rowLabel}>Sensors</span>
                  <span style={styles.rowValue}>4 · Avg {SENSOR_AVG_LABEL}</span>
                  <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                </button>
              </div>
              <h2 style={styles.sectionHeader}>Preferences</h2>
              <div style={styles.listCard}>
                <SwitchRow
                  label="Eco mode"
                  checked={state.switches.eco}
                  reducedMotion={reducedMotion}
                  onToggle={() => update({switches: {...state.switches, eco: !state.switches.eco}})}
                />
                <div style={styles.rowDivider} />
                <SwitchRow
                  label="Remote sensors"
                  checked={state.switches.remote}
                  reducedMotion={reducedMotion}
                  onToggle={() => update({switches: {...state.switches, remote: !state.switches.remote}})}
                />
                <div style={styles.rowDivider} />
                <SwitchRow
                  label="Filter reminder"
                  checked={state.switches.filter}
                  reducedMotion={reducedMotion}
                  onToggle={() => update({switches: {...state.switches, filter: !state.switches.filter}})}
                />
              </div>
              <div style={styles.terminalCaption}>Emberline · {FIXTURE_NOW}</div>
            </>
          ) : null}
          {onSensorsScreen ? (
            <>
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Sensors</h1>
              </div>
              <div style={styles.listCard}>
                {SENSORS.map((sensor, index) => (
                  <div key={sensor.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.row44}>
                      <span style={styles.rowLabel}>{sensor.name}</span>
                      <span style={styles.rowValue}>{sensor.temp}°</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* (66+64+68+59)/4 = 64.25, displayed rounded half-up. */}
              <div style={styles.terminalCaption}>Avg {SENSOR_AVG_LABEL} across 4 sensors</div>
            </>
          ) : null}
        </main>

        {/* Sticky dock: toast rides 12px above the 64px tabBar. */}
        <div style={styles.dockWrap}>
          {!state.sheet.open ? toastNode : null}
          <nav style={styles.tabBar} aria-label="Emberline views">
            {TABS.map(tab => {
              const active = state.tab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="emb-btn emb-focusable"
                  style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => handleTab(tab.id)}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {state.sheet.open ? toastNode : null}

        {/* EDITOR SHEET — the gesture's button path: spinbutton steppers
            edit the same boundaries the drag handle writes. */}
        {state.sheet.open ? <button type="button" style={styles.sheetScrim} aria-label="Close sheet" onClick={closeSheet} /> : null}
        {state.sheet.open && state.sheet.draft != null && sheetBlock != null ? (
          <Sheet
            titleId="emb-sheet-title"
            title={\`Edit \${sheetBlock.label}\`}
            detent={state.sheet.detent}
            onDetentChange={detent => update({sheet: {...state.sheet, detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="emb-btn emb-focusable" style={styles.saveBtn} onClick={saveSheet}>
                Save block
              </button>
            }>
            <div style={styles.sheetSection}>
              {(['start', 'end'] as const).map((edge, index) => {
                const draft = state.sheet.draft as SheetDraft;
                const locked = edge === 'start' ? sheetIndex === 0 : sheetIndex === dayBlocks.length - 1;
                const value = edge === 'start' ? draft.startMin : draft.endMin;
                const expanded = state.sheet.expanded === edge;
                return (
                  <div key={edge}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.row44}>
                      <span style={styles.rowLabel}>{edge === 'start' ? 'Starts' : 'Ends'}</span>
                      <button
                        type="button"
                        className="emb-btn emb-focusable"
                        style={{...styles.timePill, ...(locked ? styles.timePillDisabled : null)}}
                        aria-label={\`\${edge === 'start' ? 'Start' : 'End'} time \${fmtClock(value)}\${locked ? ', day boundary' : ''}\`}
                        aria-expanded={expanded}
                        disabled={locked}
                        onClick={() => update({sheet: {...state.sheet, expanded: expanded ? null : edge}})}>
                        {fmtClock(value)}
                      </button>
                    </div>
                    {expanded && !locked ? (
                      <div style={styles.timePanel}>
                        <button
                          type="button"
                          className="emb-btn emb-focusable"
                          style={styles.timeStepBtn}
                          aria-label={\`\${edge === 'start' ? 'Start' : 'End'} 30 minutes earlier\`}
                          onClick={() => stepDraftTime(edge, -30)}>
                          <Icon icon={MinusIcon} size="md" color="inherit" />
                        </button>
                        <span
                          role="spinbutton"
                          tabIndex={0}
                          className="emb-focusable"
                          style={styles.timeReadout}
                          aria-label={\`\${edge === 'start' ? 'Start' : 'End'} time\`}
                          aria-valuenow={value}
                          aria-valuetext={fmtClock(value)}
                          onKeyDown={event => {
                            if (event.key === 'ArrowUp') {
                              event.preventDefault();
                              stepDraftTime(edge, 30);
                            } else if (event.key === 'ArrowDown') {
                              event.preventDefault();
                              stepDraftTime(edge, -30);
                            }
                          }}>
                          {fmtClock(value)}
                        </span>
                        <button
                          type="button"
                          className="emb-btn emb-focusable"
                          style={styles.timeStepBtn}
                          aria-label={\`\${edge === 'start' ? 'Start' : 'End'} 30 minutes later\`}
                          onClick={() => stepDraftTime(edge, 30)}>
                          <Icon icon={PlusIcon} size="md" color="inherit" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div style={{...styles.sheetSection, padding: 16}}>
              <DualSetpointStepper
                heat={state.sheet.draft.heat}
                cool={state.sheet.draft.cool}
                flash={state.flash}
                idPrefix="emb-sheet"
                onStep={stepDraftSetpoint}
              />
            </div>
            {/* Delete is a menu row separated from the sticky Save footer
                by the label field below (undoOverConfirm: executes
                immediately with an Undo toast, no confirm dialog). */}
            <div style={styles.sheetSection}>
              <button
                type="button"
                className="emb-btn emb-focusable"
                style={{...styles.menuRow, ...styles.menuRowDanger}}
                onClick={() => deleteBlock(state.selectedDay, sheetBlock.id)}>
                <Icon icon={Trash2Icon} size="sm" color="inherit" />
                <span style={styles.menuRowText}>Delete block</span>
              </button>
            </div>
            <div style={styles.formField}>
              <label style={styles.fieldLabel} htmlFor="emb-block-label">
                Block name
              </label>
              <input
                id="emb-block-label"
                ref={labelInputRef}
                className="emb-input"
                style={{
                  ...styles.fieldInput,
                  ...(state.sheet.labelError ? {boxShadow: 'inset 0 0 0 2px var(--color-error)'} : null),
                }}
                value={state.sheet.draft.label}
                aria-invalid={state.sheet.labelError}
                aria-describedby={state.sheet.labelError ? 'emb-label-error' : undefined}
                onChange={event => {
                  const label = event.target.value;
                  // Error clears the moment the value becomes valid while
                  // typing (reward the fix immediately); validation
                  // itself fires on blur/save only.
                  update({
                    sheet: {
                      ...state.sheet,
                      draft: {...(state.sheet.draft as SheetDraft), label},
                      labelError: state.sheet.labelError && label.trim() === '',
                    },
                  });
                }}
                onBlur={() => {
                  if ((state.sheet.draft?.label ?? '').trim() === '') {
                    update({sheet: {...state.sheet, labelError: true}});
                  }
                }}
              />
              {state.sheet.labelError ? (
                <span id="emb-label-error" style={styles.fieldError}>
                  <Icon icon={CircleAlertIcon} size="sm" color="inherit" />
                  Enter a block name
                </span>
              ) : null}
            </div>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};