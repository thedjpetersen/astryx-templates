var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Splitshift tonight pool #12
 *   (ROUND_INDEX 12, rotation start 12 % 6 = 0): POOL_CENTS 56703; six
 *   teammates with dual-field hours/weights (Maya 1.00×6.5, Diego 1.00×6.0,
 *   Priya 1.25×6.5, Sam 0.70×5.0, Lena 0.60×4.5, Jordan 0.85×5.5 →
 *   weight-hours 6.5+6.0+8.125+3.5+2.7+4.675 = 31.5 exactly, hours 34.0);
 *   floored payouts floor(56703·wh/31.5) = 11700+10800+14625+6300+4860+8415
 *   = 56700¢, remainder 3¢ → +1¢ to tm-maya/tm-diego/tm-priya; finals
 *   $117.01+$108.01+$146.26+$63.00+$48.60+$84.15 = $567.03 = the pool, to
 *   the cent. History: Jul 1 $432.18 + Jul 2 $511.40 + Jul 3 $598.75 =
 *   $1,542.33 · 3 pools; 8 June rows behind loadMoreRow → 'All 11 closed
 *   pools' (tonight is #12 ✓). No Date.now, no Math.random; 'Updated just
 *   now' is a fixed string.
 * @output Splitshift — Tip Pool Split: a 390px MOBILE role-weighted
 *   tip-pool splitter for restaurant closers. NavBar (coin/shift-slash
 *   mark · 'Tonight's Pool' h1 · RefreshCw) over a 36px balanceStrip
 *   ($567.03 pool + Balanced/Over pill), a sticky PoolFlow mini-sankey
 *   (116px SVG, ribbon stroke = max(2, round(share·48))px), a PennyStrip
 *   of reassignable cent-chips, and six 64px WeightRows whose sliders,
 *   steppers, and lock toggles all write ONE pool store. Signature move:
 *   dragging any weight slider live-redistributes every unlocked payout
 *   (300ms rAF count-ups), re-thickens the sankey ribbons (240ms
 *   stroke-width), re-derives which teammates absorb the 3¢ remainder, and
 *   flips the balancePill to 'Over by $32.97' when locks over-commit the
 *   pool. History/Roles/Team tabs persist scroll + expansion per tab.
 * @position Page template; emitted by \`astryx template mobile-tip-pool-split\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, pennySheet, teammate
 *   actionSheet, toast) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While an overlay is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and the toastDock switches from
 *   sticky-in-flow (bottom 76, above the 64px tabBar) to shell-absolute;
 *   it restores on close. Stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome; quarantined BRAND_ACCENT
 *   light-dark(#2F9E44, #69DB7C) per spec (fills/ribbons/lock glyphs:
 *   #2F9E44 on the white card ≈ 3.45:1 ≥ 3:1 for interactive fills;
 *   #69DB7C on dark card #1C1917 ≈ 9.7:1). Brand-tinted TEXT uses the
 *   darker BRAND_TEXT pair (≈5.4:1 light) because #2F9E44 misses 4.5:1.
 *   Every other literal is declared in the COLOR LITERALS block with its
 *   contrast math (chip fills, over fills, track rest, detent ticks).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top 0 z20
 *   (paddingInline 8, grid '1fr auto 1fr'); balanceStrip 36px in flow;
 *   PoolFlow sticky top 52 z15, height 148 = 12 pad + 116 SVG + 20
 *   caption; PennyStrip 56px; WeightRow 64px (6×64 + 5 dividers = 389px
 *   card); History rows 72px; Roles rows 60px (96×32 stepper); Team media
 *   rows 72px (40px avatar); tabBar 64px sticky bottom z20; toastDock
 *   sticky bottom 76 z30 (absolute during scroll-lock); sheet detents 55%
 *   / calc(100% − 56px), 24px grabber zone with 36×5 pill, 52px sheet
 *   header; actionSheet insetInline 16 bottom 16, 56px rows. TYPE
 *   (Figtree): 22/700 pool figure · 17/600 nav+sheet titles · 17/700
 *   payouts · 16/400–500 body · 13/400 secondary · 11/500 overlines, tab
 *   labels, chips; nothing under 11px; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 (44px hits wrap the 28px
 *   cent-chips, slider thumbs, stepper halves) or merges into a full-row
 *   button; every gesture (slider drag, sheet grabber) has a visible
 *   button path (±0.05 steppers, grabber click + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals. WeightRow line 2: the slider
 *   track is the only flexible element (flex 1, minWidth 96; at 320:
 *   320−32 gutter−32 card pad−44 lock−44 minus−44 plus−24 gaps = 100 ≥ 96
 *   ✓); teammate name maxWidth 140 → 104 at ≤340 container. PoolFlow SVG:
 *   width 100%, fixed viewBox 358×116 with preserveAspectRatio 'none' so
 *   ribbons stretch fluidly. PennyStrip chips wrap to a second line inside
 *   an auto-height (min 56) strip. balanceStrip figure 22 → 20px under
 *   340. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, hairline
 *   borderInline). No adaptive relayout; overlays stay inside because they
 *   anchor to shell.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CheckIcon,
  CircleDollarSignIcon,
  ClockIcon,
  CoinsIcon,
  LockIcon,
  LockOpenIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Splitshift green). Used for FILLS and
// glyphs only: #2F9E44 on the white card ≈ 3.45:1 (≥3:1, interactive
// fill/glyph vs its actual surface); #69DB7C on the dark card #1C1917 ≈
// 9.7:1. Payout text stays --color-text-primary per spec.
const BRAND_ACCENT = 'light-dark(#2F9E44, #69DB7C)';
// Brand-tinted TEXT (13px 'Details', drag readout): #2F9E44 on #FCFCFC is
// only 3.9:1, so text drops to #217A34 ≈ 5.4:1 on the white card; #69DB7C
// on #1C1917 ≈ 9.7:1.
const BRAND_TEXT = 'light-dark(#217A34, #69DB7C)';
// Balanced pill + cent-chip surfaces: #1B6E30 on #E6F4EA ≈ 5.6:1;
// #69DB7C on #12351C ≈ 7.9:1 — both vs their OWN fills, not the body.
const CHIP_FILL = 'light-dark(#E6F4EA, #12351C)';
const CHIP_TEXT = 'light-dark(#1B6E30, #69DB7C)';
// Over-committed pill fill; its text is var(--color-error) (≥4.5:1 on
// these washes by token contract; the fill itself is a status wash).
const OVER_FILL = 'light-dark(#FDECEC, #3A1414)';
// Slider track REST fill — passive separator-class per spec (the filled
// brand portion is the indicator; ticks below carry the 3:1 boundary).
const TRACK_REST = 'light-dark(#E7E4DD, #33302A)';
// Detent ticks: #B9B4A9 vs #E7E4DD track ≈ 1.5... measured against BOTH
// track fills per the amendment: #B9B4A9 on the white card ≈ 2.0:1 is
// irrelevant — the tick sits ON the track; #B9B4A9 vs #E7E4DD ≈ 1.6:1
// fails, so ticks use the darker pair below: #8A857A vs #E7E4DD ≈ 3.1:1
// and #6E6A62 vs #33302A ≈ 3.1:1 (deviation from spec's #B9B4A9/#57534E,
// which only hit 3.2:1 vs the CARD, not the track they sit on).
const TICK = 'light-dark(#8A857A, #6E6A62)';
// Role chip muted fill (passive, text is --color-text-secondary).
const ROLE_CHIP_FILL = 'light-dark(#F0EEE9, #2A2721)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden,
// ribbon stroke-width tween, sheet/toast entrances, reduced-motion guard.
// ---------------------------------------------------------------------------

const TPS_CSS = \`
.tps-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tps-btn:disabled { cursor: default; }
.tps-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
/* Ribbon re-thicken: stroke-width tween (240ms ease-out) on a static path
   — the d attribute never re-tessellates; only the stroke animates. */
.tps-ribbon { transition: stroke-width 240ms ease-out, stroke-opacity 240ms ease-out; }
.tps-fade { transition: opacity 200ms ease; }
@keyframes tps-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.tps-sheet-in { animation: tps-sheet-in 200ms ease; }
.tps-vh {
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
  .tps-ribbon, .tps-fade { transition: none; }
  .tps-sheet-in { animation: none; }
}
\`;

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
  // NAV BAR — 52px sticky top z20; hairline + blur always on (scroll-under
  // is not wired; noted per contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
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
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  // BALANCE STRIP — 36px subheader, in flow (scrolls away; PoolFlow sticks
  // at top 52, NOT 88 — the strip is not part of the sticky stack).
  balanceStrip: {
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  balanceFigure: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  balanceFigureNarrow: {fontSize: 20},
  balanceCaption: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  balancePill: {
    marginLeft: 'auto',
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  balancePillOk: {background: CHIP_FILL, color: CHIP_TEXT},
  balancePillOver: {background: OVER_FILL, color: 'var(--color-error)'},
  // POOLFLOW — sticky top 52 z15; 148px = 12 pad + 116 SVG + 20 caption.
  poolFlow: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    height: 148,
    flexShrink: 0,
    paddingTop: 12,
    paddingInline: 16,
    background: 'var(--color-background-body)',
  },
  poolFlowSvg: {display: 'block', width: '100%', height: 116},
  poolFlowCaption: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // PENNY STRIP — min 56px; the label+chip zone wraps, 'Details' stays
  // trailing on line 1 (it sits outside the wrapping flex zone).
  pennyStrip: {
    minHeight: 56,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    paddingInline: 16,
    paddingBlock: 6,
  },
  pennyChipZone: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pennyLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  pennyIcon: {color: BRAND_TEXT, display: 'inline-flex'},
  // 28px pill visual inside a 44px-tall padded hit button.
  centChipBtn: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  centChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: CHIP_FILL,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  pennyClean: {fontSize: 13, color: 'var(--color-text-secondary)'},
  pennyWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-error)',
  },
  detailsBtn: {
    marginLeft: 'auto',
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  // Inset-grouped listCard + sectionHeader (13/600 uppercase 0.06em at
  // 32px = 16 gutter + 16 card pad; 20px top / 8px bottom margins).
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
  // WEIGHT ROW — exactly 64px: line1 24 + gap 8 + line2 28, centered.
  weightRow: {
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
  },
  wrLine1: {height: 24, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  // Name zone is a real button; 44px hit via negative block margins (DOM
  // order resolves the sliver of overlap with line 2's stepper hits).
  nameBtn: {
    height: 44,
    marginBlock: -10,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 0,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 140,
  },
  nameTextNarrow: {maxWidth: 104},
  roleChip: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: ROLE_CHIP_FILL,
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  hoursText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  payout: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  lockGlyph: {display: 'inline-flex', color: 'var(--color-text-secondary)'},
  wrLine2: {height: 28, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  wrLine2Locked: {opacity: 0.35},
  // 44×44 hits on 28px-line controls via negative block margins.
  stepBtn: {
    width: 44,
    height: 44,
    marginBlock: -8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  stepBtnDisabled: {opacity: 0.35},
  sliderTrack: {
    position: 'relative',
    flex: 1,
    minWidth: 96,
    height: 28,
    touchAction: 'none',
  },
  sliderRest: {
    position: 'absolute',
    insetInline: 0,
    top: 10,
    height: 8,
    borderRadius: 999,
    background: TRACK_REST,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 10,
    height: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  sliderTick: {
    position: 'absolute',
    top: 10,
    width: 2,
    height: 8,
    background: TICK,
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#FFFFFF',
    border: '1px solid var(--color-border)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  dragReadout: {
    position: 'absolute',
    top: -18,
    transform: 'translateX(-50%)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  lockBtn: {
    width: 44,
    height: 44,
    marginBlock: -8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  lockBtnOn: {color: BRAND_ACCENT},
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  spacer24: {height: 24, flexShrink: 0},
  // SKELETON — 64px rows at exact WeightRow geometry; deterministic widths.
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // HISTORY.
  summaryCard: {
    marginInline: 16,
    height: 72,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  overline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  summaryFigure: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  historyRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  historyText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  historyDate: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyAmount: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_TEXT,
  },
  // ROLES — 60px rows with a 96×32 stepper + adjacent value.
  roleRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  roleText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rolePrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  roleMeta: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    minWidth: 52,
    textAlign: 'right',
  },
  stepper: {
    width: 96,
    height: 32,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperRule: {width: 1, background: 'var(--color-border)'},
  stepperHalfDisabled: {opacity: 0.35},
  // TEAM — 72px media rows.
  teamRow: {
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
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: CHIP_FILL,
    color: CHIP_TEXT,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  teamPayout: {
    marginLeft: 'auto',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
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
  tabItemActive: {color: 'var(--color-brand)'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow above the tabBar (bottom 76 = 64 + 12);
  // switches to shell-absolute ONLY while the shell is scroll-locked.
  toastDockSticky: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockAbsolute: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
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
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // OVERLAYS — scrim z40, sheet/actionSheet z41, absolute inside shell.
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
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  pennyRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  pennyRowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  pennyRowName: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  pennyRowShare: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  pennyBase: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  pennyBadge: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    background: CHIP_FILL,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  pennyFinal: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', minWidth: 72, textAlign: 'right'},
  mathRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    borderTop: '1px solid var(--color-border)',
  },
  sheetBtnRow: {display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap'},
  secondaryBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  // ACTION SHEET — insetInline 16 bottom 16 z41; two stacked cards 8px
  // apart; centered-no-icons rows.
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
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionDividerFull: {height: 1, background: 'var(--color-border)'},
  cancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// ARITHMETIC CROSS-CHECK (verified by hand): weight-hours = weight·hours =
// 6.5+6.0+8.125+3.5+2.7+4.675 = 31.5 exactly; hours 6.5+6.0+6.5+5.0+4.5+5.5
// = 34.0. Floored payouts floor(56703·wh/31.5) = 11700+10800+14625+6300+
// 4860+8415 = 56700¢; remainder 56703−56700 = 3¢ → rotation from index 0
// (ROUND_INDEX 12 % 6) gives +1¢ to tm-maya, tm-diego, tm-priya. Finals
// $117.01+$108.01+$146.26+$63.00+$48.60+$84.15 = $567.03 = pool, to the
// cent. Ribbon thicknesses round(share·48): 10/9/12/5/4/7px.
// ---------------------------------------------------------------------------

const POOL_CENTS = 56703;
// Stress fixture 4 (zero remainder): 56700/31.5 = 1800¢ per weight-hour
// exactly → floors sum to 56700, remainder 0 → 'Splits clean' PennyStrip.
const POOL_CENTS_CLEAN = 56700;
// Tonight is pool #12; remainder rotation starts at ROUND_INDEX % 6 = 0.
const ROUND_INDEX = 12;

interface Teammate {
  id: string;
  name: string;
  initials: string;
  role: string;
  roleDefault: number;
  hours: number;
}

// Stress fixture 2 (long name): swap tm-lena's name for
// 'Alexandria Konstantinopoulos-Reyes' to exercise the 140px ellipsis and
// the actionSheet header's two-line wrap.
const TEAM: Teammate[] = [
  {id: 'tm-maya', name: 'Maya Okafor', initials: 'MO', role: 'Server', roleDefault: 1.0, hours: 6.5},
  {id: 'tm-diego', name: 'Diego Reyes', initials: 'DR', role: 'Server', roleDefault: 1.0, hours: 6.0},
  {id: 'tm-priya', name: 'Priya Natarajan', initials: 'PN', role: 'Bartender', roleDefault: 1.25, hours: 6.5},
  {id: 'tm-sam', name: 'Sam Whitaker', initials: 'SW', role: 'Busser', roleDefault: 0.7, hours: 5.0},
  {id: 'tm-lena', name: 'Lena Kowalski', initials: 'LK', role: 'Host', roleDefault: 0.6, hours: 4.5},
  {id: 'tm-jordan', name: 'Jordan Ellis', initials: 'JE', role: 'Runner', roleDefault: 0.85, hours: 5.5},
];

const TEAM_BY_ID: Record<string, Teammate> = Object.fromEntries(TEAM.map(mate => [mate.id, mate]));

// ROLES member counts: Server 2 + Bartender 1 + Busser 1 + Host 1 +
// Runner 1 = 6 = TEAM.length ✓.
const ROLE_ORDER = ['Server', 'Bartender', 'Runner', 'Busser', 'Host'];

const ROLE_MEMBER_COUNT: Record<string, number> = ROLE_ORDER.reduce<Record<string, number>>(
  (acc, role) => ({...acc, [role]: TEAM.filter(mate => mate.role === role).length}),
  {},
);

interface ClosedPool {
  id: string;
  dateLabel: string;
  cents: number;
  meta: string;
  note: string;
}

// July header '$1,542.33 · 3 pools' derives live: 43218+51140+59875 =
// 154233¢ ✓. June rows carry no shown aggregate (no cross-check owed);
// terminal caption 'All 11 closed pools' = 3 + 8 ✓ and tonight is #12,
// tying to ROUND_INDEX ✓.
const HISTORY_JULY: ClosedPool[] = [
  {id: 'pool-11', dateLabel: 'Fri, Jul 3', cents: 59875, meta: '6 teammates · settled', note: 'Pool #11 · settled to the cent · 1¢ remainder rotated'},
  {id: 'pool-10', dateLabel: 'Thu, Jul 2', cents: 51140, meta: '6 teammates · settled', note: 'Pool #10 · settled to the cent · no remainder'},
  {id: 'pool-09', dateLabel: 'Wed, Jul 1', cents: 43218, meta: '5 teammates · settled', note: 'Pool #9 · settled to the cent · 2¢ remainder rotated'},
];

const HISTORY_JUNE: ClosedPool[] = [
  {id: 'pool-08', dateLabel: 'Tue, Jun 30', cents: 40122, meta: '6 teammates · settled', note: 'Pool #8 · settled to the cent · 3¢ remainder rotated'},
  {id: 'pool-07', dateLabel: 'Sat, Jun 27', cents: 45512, meta: '6 teammates · settled', note: 'Pool #7 · settled to the cent · 1¢ remainder rotated'},
  {id: 'pool-06', dateLabel: 'Fri, Jun 26', cents: 48690, meta: '6 teammates · settled', note: 'Pool #6 · settled to the cent · no remainder'},
  {id: 'pool-05', dateLabel: 'Thu, Jun 25', cents: 52204, meta: '6 teammates · settled', note: 'Pool #5 · settled to the cent · 4¢ remainder rotated'},
  {id: 'pool-04', dateLabel: 'Wed, Jun 24', cents: 38960, meta: '5 teammates · settled', note: 'Pool #4 · settled to the cent · 2¢ remainder rotated'},
  {id: 'pool-03', dateLabel: 'Sat, Jun 20', cents: 47735, meta: '6 teammates · settled', note: 'Pool #3 · settled to the cent · 1¢ remainder rotated'},
  {id: 'pool-02', dateLabel: 'Fri, Jun 19', cents: 50811, meta: '6 teammates · settled', note: 'Pool #2 · settled to the cent · no remainder'},
  {id: 'pool-01', dateLabel: 'Thu, Jun 18', cents: 44187, meta: '5 teammates · settled', note: 'Pool #1 · settled to the cent · 2¢ remainder rotated'},
];

// Stress fixture 1 (over-committed): $200.00 + $250.00 + $150.00 = $600.00
// > $567.03 → over by $32.97 (60000 − 56703 = 3297¢ ✓). Pin-current locks
// can never arithmetically exceed the pool (each pin equals its derived
// share), so the demo seeds this state from the pennySheet fixture button.
const OVER_COMMIT_LOCKS: Record<string, number> = {
  'tm-maya': 20000,
  'tm-priya': 25000,
  'tm-diego': 15000,
};

// Skeleton bar widths — deterministic cycles per the foundations.
const SKEL_PRIMARY = ['60%', '45%', '70%'];
const SKEL_SECONDARY = ['40%', '55%', '30%'];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Cents → '$117.01'. */
function fmtUsd(cents: number): string {
  return \`$\${(cents / 100).toFixed(2)}\`;
}

/** Cents → '$1,542.33' (thousands grouping for History aggregates). */
function fmtUsdGrouped(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return \`$\${dollars.toLocaleString('en-US')}.\${rest}\`;
}

/** Weight → '1.00×'. */
function fmtWeight(weight: number): string {
  return \`\${weight.toFixed(2)}×\`;
}

/** Round a stepped weight to 2 decimals (kills 0.8500000000001 drift). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const WEIGHT_MIN = 0.5;
const WEIGHT_MAX = 1.5;
const WEIGHT_STEP = 0.05;

function clampWeight(value: number): number {
  return round2(Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, value)));
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER + PURE DERIVATION — everything on screen renders from
// derive(state); every mutation is one setState.
// ---------------------------------------------------------------------------

type TabId = 'tonight' | 'history' | 'roles' | 'team';

type Overlay = null | {type: 'penny'} | {type: 'action'; id: string};

/** Restorable core — Undo snapshots exactly these slices. */
interface PoolCore {
  weights: Record<string, number>;
  locks: Record<string, number>;
  hours: Record<string, number>;
  removed: Record<string, boolean>;
  rotationStart: number;
  centShifts: Record<number, number>;
  roleDefaults: Record<string, number>;
  cleanPool: boolean;
}

interface Toast {
  seq: number;
  text: string;
  restore: PoolCore | null;
}

interface PoolState extends PoolCore {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  overlay: Overlay;
  sheetDetent: 'medium' | 'large';
  toast: Toast | null;
  historyExpanded: boolean;
  refreshing: boolean;
}

const INITIAL_STATE: PoolState = {
  tab: 'tonight',
  scrollByTab: {tonight: 0, history: 0, roles: 0, team: 0},
  weights: Object.fromEntries(TEAM.map(mate => [mate.id, mate.roleDefault])),
  locks: {},
  hours: Object.fromEntries(TEAM.map(mate => [mate.id, mate.hours])),
  removed: {},
  rotationStart: ROUND_INDEX % TEAM.length,
  centShifts: {},
  roleDefaults: Object.fromEntries(TEAM.map(mate => [mate.role, mate.roleDefault])),
  cleanPool: false,
  overlay: null,
  sheetDetent: 'medium',
  toast: null,
  historyExpanded: false,
  refreshing: false,
};

function snapshotCore(state: PoolState): PoolCore {
  return {
    weights: state.weights,
    locks: state.locks,
    hours: state.hours,
    removed: state.removed,
    rotationStart: state.rotationStart,
    centShifts: state.centShifts,
    roleDefaults: state.roleDefaults,
    cleanPool: state.cleanPool,
  };
}

interface Derived {
  status: 'balanced' | 'over';
  overByCents: number;
  poolCents: number;
  payouts: Record<string, number>;
  floors: Record<string, number>;
  /** One entry per remainder cent, in cent order: the absorbing id. */
  absorbers: string[];
  remainder: number;
  lockedCents: number;
  unlockedPool: number;
  activeIds: string[];
  unlockedIds: string[];
  totalWeightHours: number;
  totalHours: number;
}

/**
 * PURE DERIVATION. lockedCents = Σ locks; unlockedPool = pool − lockedCents;
 * negative → 'over' (unlocked payouts clamp to $0.00). Otherwise distribute
 * unlockedPool by weight-hours over unlocked ids: floor each, then assign
 * the remainder +1¢-per-cent starting at rotationStart in fixture id order
 * (cent i may be advanced further by centShifts[i] — the cent-chip verb).
 * Zero-hours guard (stress fixture 5): totalWeightHours 0 → even split
 * floors, so a 0-hour teammate renders '$0.00', never blank.
 */
function derive(state: PoolState): Derived {
  const poolCents = state.cleanPool ? POOL_CENTS_CLEAN : POOL_CENTS;
  const activeIds = TEAM.filter(mate => !state.removed[mate.id]).map(mate => mate.id);
  const unlockedIds = activeIds.filter(id => state.locks[id] == null);
  const lockedCents = activeIds.reduce((sum, id) => sum + (state.locks[id] ?? 0), 0);
  const unlockedPool = poolCents - lockedCents;
  const totalHours = activeIds.reduce((sum, id) => sum + state.hours[id], 0);
  const totalWeightHours = activeIds.reduce((sum, id) => sum + state.weights[id] * state.hours[id], 0);
  const payouts: Record<string, number> = {};
  const floors: Record<string, number> = {};
  for (const id of activeIds) {
    if (state.locks[id] != null) payouts[id] = state.locks[id];
  }
  if (unlockedPool < 0) {
    for (const id of unlockedIds) {
      payouts[id] = 0;
      floors[id] = 0;
    }
    return {
      status: 'over',
      overByCents: -unlockedPool,
      poolCents,
      payouts,
      floors,
      absorbers: [],
      remainder: 0,
      lockedCents,
      unlockedPool,
      activeIds,
      unlockedIds,
      totalWeightHours,
      totalHours,
    };
  }
  const unlockedWh = unlockedIds.reduce((sum, id) => sum + state.weights[id] * state.hours[id], 0);
  let floorSum = 0;
  for (const id of unlockedIds) {
    const share =
      unlockedWh > 0
        ? Math.floor((unlockedPool * state.weights[id] * state.hours[id]) / unlockedWh)
        : Math.floor(unlockedPool / Math.max(1, unlockedIds.length));
    floors[id] = share;
    payouts[id] = share;
    floorSum += share;
  }
  const remainder = unlockedIds.length > 0 ? unlockedPool - floorSum : 0;
  const absorbers: string[] = [];
  for (let cent = 0; cent < remainder; cent++) {
    const shift = state.centShifts[cent] ?? 0;
    const id = unlockedIds[(state.rotationStart + cent + shift) % unlockedIds.length];
    absorbers.push(id);
    payouts[id] += 1;
  }
  return {
    status: 'balanced',
    overByCents: 0,
    poolCents,
    payouts,
    floors,
    absorbers,
    remainder,
    lockedCents,
    unlockedPool,
    activeIds,
    unlockedIds,
    totalWeightHours,
    totalHours,
  };
}

// ---------------------------------------------------------------------------
// HOOKS — container width (grid-feeder-console ResizeObserver pattern).
// ---------------------------------------------------------------------------

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

/** Focus trap — Tab cycles within the open overlay's buttons. */
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
// BRAND MARK — a coin bisected by a diagonal shift-slash, halves offset 2px.
// ---------------------------------------------------------------------------

function SplitshiftMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Upper-left coin half, nudged 1px up-left; lower-right half 1px
          down-right — a 2px total offset across the shift-slash. */}
      <g style={{color: 'var(--color-text-primary)'}}>
        <path
          d="M18.4 4.6 A 8.5 8.5 0 0 0 4.6 14.4"
          stroke={BRAND_ACCENT}
          strokeWidth={2.4}
          strokeLinecap="round"
          transform="translate(-1 -1)"
        />
        <path
          d="M5.6 19.4 A 8.5 8.5 0 0 0 19.4 9.6"
          stroke={BRAND_ACCENT}
          strokeWidth={2.4}
          strokeLinecap="round"
          transform="translate(1 1)"
        />
        <path d="M19.5 3.5 4.5 20.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ANIMATED CENTS — 300ms rAF count-up from the previously rendered value;
// instant under reduced motion. Transient tween value lives outside the
// store (refs), per the transient-pointer-delta exemption.
// ---------------------------------------------------------------------------

function AnimatedCents({cents, reduced}: {cents: number; reduced: boolean}) {
  const [display, setDisplay] = useState(cents);
  const fromRef = useRef(cents);
  const rafRef = useRef(0);
  useEffect(() => {
    if (reduced) {
      fromRef.current = cents;
      setDisplay(cents);
      return undefined;
    }
    const from = fromRef.current;
    if (from === cents) return undefined;
    fromRef.current = cents;
    const started = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - started) / 300);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(from + (cents - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cents, reduced]);
  return <>{fmtUsd(reduced ? cents : display)}</>;
}

// ---------------------------------------------------------------------------
// POOLFLOW — sticky mini-sankey. 116px SVG, viewBox '0 0 358 116',
// preserveAspectRatio 'none' (ribbons stretch fluidly 320–430). Source bar
// 8px full-width at y0; 6 cubic ribbons to terminal bars at y100 (width
// 358/6 − 6, 4px tall, rx 2); initials 11px/600 below. Ribbon thickness =
// max(2, round(share·48)) — tonight 10/9/12/5/4/7px — rendered as STROKE
// width with a 240ms CSS tween (deviation from the spec's scaleY groups:
// scaling a source-anchored group would drag the terminal endpoints off
// their nodes; stroke-width tweens without re-tessellating the path).
// Locked ribbons render at full stroke opacity (vs 32%) — the solid band
// plus the row's LockIcon carry the pinned state (deviation: a stroked
// ribbon cannot also carry a 1px edge stroke). Ribbons aria-hidden; the
// caption row and WeightRow payouts carry the data.
// ---------------------------------------------------------------------------

interface PoolFlowMember {
  id: string;
  initials: string;
  locked: boolean;
  payoutCents: number;
}

interface PoolFlowProps {
  members: PoolFlowMember[];
  poolCents: number;
  caption: string;
}

function PoolFlow({members, poolCents, caption}: PoolFlowProps) {
  const n = Math.max(1, members.length);
  const slot = 358 / n;
  return (
    <div style={styles.poolFlow}>
      <svg style={styles.poolFlowSvg} viewBox="0 0 358 116" preserveAspectRatio="none" aria-hidden>
        {members.map((member, index) => {
          const sourceX = n > 1 ? 45 + (index * 268) / (n - 1) : 179;
          const terminalX = index * slot + slot / 2;
          const share = poolCents > 0 ? member.payoutCents / poolCents : 0;
          const thickness = Math.max(2, Math.round(share * 48));
          return (
            <path
              key={member.id}
              className="tps-ribbon"
              d={\`M \${sourceX.toFixed(1)} 8 C \${sourceX.toFixed(1)} 46, \${terminalX.toFixed(1)} 64, \${terminalX.toFixed(1)} 100\`}
              stroke={BRAND_ACCENT}
              strokeOpacity={member.locked ? 1 : 0.32}
              strokeWidth={thickness}
              fill="none"
            />
          );
        })}
        <rect x={0} y={0} width={358} height={8} rx={4} fill={BRAND_ACCENT} />
        {/* Pool label sits just under the source bar (spec said above-left;
            above y0 is outside the viewBox — noted deviation). */}
        <text x={4} y={24} fontSize={13} fontWeight={700} fill="var(--color-text-primary)">
          {fmtUsd(poolCents)}
        </text>
        {members.map((member, index) => {
          const terminalX = index * slot + slot / 2;
          return (
            <g key={member.id}>
              <rect x={index * slot + 3} y={100} width={slot - 6} height={4} rx={2} fill={BRAND_ACCENT} />
              <text
                x={terminalX}
                y={114}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--color-text-secondary)">
                {member.initials}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={styles.poolFlowCaption}>{caption}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WEIGHT ROW — 64px, two lines. Line 1: name <button> (opens the teammate
// actionSheet — the visible per-row verb path) + roleChip + hours + live
// payout. Line 2: minus · slider (flex 1, minWidth 96) · plus · lock. The
// steppers ARE the slider's button path (±0.05); thumb release snaps to a
// role-default detent within ±0.02; ArrowLeft/Right ±0.05 on the thumb.
// ---------------------------------------------------------------------------

interface WeightRowProps {
  mate: Teammate;
  weight: number;
  hours: number;
  lockedCents: number | null;
  payoutCents: number;
  ticks: number[];
  narrow: boolean;
  reduced: boolean;
  onOpenSheet: (id: string, opener: HTMLElement) => void;
  onWeight: (id: string, value: number) => void;
  onToggleLock: (id: string) => void;
}

function WeightRow({
  mate,
  weight,
  hours,
  lockedCents,
  payoutCents,
  ticks,
  narrow,
  reduced,
  onOpenSheet,
  onWeight,
  onToggleLock,
}: WeightRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const isLocked = lockedCents != null;
  const pct = ((weight - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100;
  const thumbLeft = \`calc((100% - 24px) * \${(pct / 100).toFixed(4)})\`;
  const fillWidth = \`calc((100% - 24px) * \${(pct / 100).toFixed(4)} + 12px)\`;

  const valueFromClientX = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return weight;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return clampWeight(WEIGHT_MIN + frac * (WEIGHT_MAX - WEIGHT_MIN));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isLocked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    onWeight(mate.id, valueFromClientX(event.clientX));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || isLocked) return;
    onWeight(mate.id, valueFromClientX(event.clientX));
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    // Snap to a role-default detent when released within ±0.02.
    const snap = ticks.find(tick => Math.abs(tick - weight) <= 0.02);
    if (snap != null && snap !== weight) onWeight(mate.id, snap);
  };
  const onThumbKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onWeight(mate.id, clampWeight(weight - WEIGHT_STEP));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onWeight(mate.id, clampWeight(weight + WEIGHT_STEP));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onWeight(mate.id, WEIGHT_MIN);
    } else if (event.key === 'End') {
      event.preventDefault();
      onWeight(mate.id, WEIGHT_MAX);
    }
  };

  return (
    <div style={styles.weightRow}>
      <div style={styles.wrLine1}>
        <button
          type="button"
          className="tps-btn tps-focusable"
          style={styles.nameBtn}
          onClick={event => onOpenSheet(mate.id, event.currentTarget)}>
          <span style={{...styles.nameText, ...(narrow ? styles.nameTextNarrow : null)}}>{mate.name}</span>
        </button>
        <span style={styles.roleChip}>{mate.role}</span>
        <span style={styles.hoursText}>{hours.toFixed(1)}h</span>
        <span style={styles.payout}>
          {isLocked ? (
            <span style={styles.lockGlyph} aria-hidden>
              <Icon icon={LockIcon} size="sm" color="inherit" />
            </span>
          ) : null}
          <AnimatedCents cents={payoutCents} reduced={reduced} />
        </span>
      </div>
      <div style={styles.wrLine2}>
          <button
            type="button"
            className="tps-btn tps-focusable"
            style={{
              ...styles.stepBtn,
              ...(isLocked || weight <= WEIGHT_MIN ? styles.stepBtnDisabled : null),
            }}
            disabled={isLocked || weight <= WEIGHT_MIN}
            aria-label={\`Decrease \${mate.name}'s weight\`}
            onClick={() => onWeight(mate.id, clampWeight(weight - WEIGHT_STEP))}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <div
            ref={trackRef}
            style={{...styles.sliderTrack, ...(isLocked ? styles.wrLine2Locked : null)}}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}>
            <div style={styles.sliderRest} />
            <div style={{...styles.sliderFill, width: fillWidth}} />
            {ticks.map(tick => {
              const tickPct = (tick - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN);
              return (
                <div
                  key={tick}
                  style={{
                    ...styles.sliderTick,
                    left: \`calc((100% - 24px) * \${tickPct.toFixed(4)} + 11px)\`,
                  }}
                />
              );
            })}
            {dragging ? (
              <span style={{...styles.dragReadout, left: \`calc((100% - 24px) * \${(pct / 100).toFixed(4)} + 12px)\`}}>
                {fmtWeight(weight)}
              </span>
            ) : null}
            <div
              className="tps-focusable"
              role="slider"
              tabIndex={isLocked ? -1 : 0}
              aria-valuemin={WEIGHT_MIN}
              aria-valuemax={WEIGHT_MAX}
              aria-valuenow={weight}
              aria-valuetext={\`\${weight.toFixed(2)} times, \${mate.role} default \${mate.roleDefault.toFixed(2)}\`}
              aria-label={\`\${mate.name}'s weight\`}
              aria-disabled={isLocked || undefined}
              style={{...styles.sliderThumb, left: thumbLeft}}
              onKeyDown={onThumbKeyDown}
            />
          </div>
          <button
            type="button"
            className="tps-btn tps-focusable"
            style={{
              ...styles.stepBtn,
              ...(isLocked || weight >= WEIGHT_MAX ? styles.stepBtnDisabled : null),
            }}
            disabled={isLocked || weight >= WEIGHT_MAX}
            aria-label={\`Increase \${mate.name}'s weight\`}
            onClick={() => onWeight(mate.id, clampWeight(weight + WEIGHT_STEP))}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        <button
          type="button"
          className="tps-btn tps-focusable"
          style={{...styles.lockBtn, ...(isLocked ? styles.lockBtnOn : null)}}
          aria-pressed={isLocked}
          aria-label={\`Lock \${mate.name}'s payout\`}
          onClick={() => onToggleLock(mate.id)}>
          <Icon icon={isLocked ? LockIcon : LockOpenIcon} size="md" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEAMMATE ACTION SHEET — verb picker per the primitive contract: scrim
// z40, two stacked cards insetInline 16 bottom 16 z41, centered-no-icons
// 56px rows, one destructive LAST, separate Cancel card. Focus lands on
// Cancel (preventScroll), Tab is trapped, Escape/scrim/any row closes.
// ---------------------------------------------------------------------------

interface ActionSheetProps {
  mate: Teammate;
  weight: number;
  hours: number;
  lockedCents: number | null;
  payoutCents: number;
  roleDefault: number;
  onLockToggle: () => void;
  onReset: () => void;
  onAddHalfHour: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function TeammateActionSheet({
  mate,
  weight,
  hours,
  lockedCents,
  payoutCents,
  roleDefault,
  onLockToggle,
  onReset,
  onAddHalfHour,
  onRemove,
  onClose,
}: ActionSheetProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // preventScroll — plain .focus() would scroll-reveal the animating
    // sheet inside the locked overflow-hidden column.
    cancelRef.current?.focus({preventScroll: true});
  }, []);
  return (
    <>
      <div className="tps-fade" style={styles.sheetScrim} onClick={onClose} />
      <div
        ref={wrapRef}
        className="tps-sheet-in"
        style={styles.actionSheetWrap}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tps-action-header"
        onKeyDown={event => trapTabKey(event, wrapRef.current)}>
        <div style={styles.actionCard}>
          <div id="tps-action-header" style={styles.actionHeader}>
            {mate.name} · {mate.role} · {hours.toFixed(1)} hrs · {fmtWeight(weight)}
          </div>
          <button type="button" className="tps-btn tps-focusable" style={styles.actionRow} onClick={onLockToggle}>
            {lockedCents != null
              ? \`Unlock payout (\${fmtUsd(lockedCents)} pinned)\`
              : \`Lock payout at \${fmtUsd(payoutCents)}\`}
          </button>
          <div style={styles.actionDividerFull} />
          <button type="button" className="tps-btn tps-focusable" style={styles.actionRow} onClick={onReset}>
            Reset to role default ({roleDefault.toFixed(2)})
          </button>
          <div style={styles.actionDividerFull} />
          <button type="button" className="tps-btn tps-focusable" style={styles.actionRow} onClick={onAddHalfHour}>
            Add 0.5 hr (stayed late)
          </button>
          <div style={styles.actionDividerFull} />
          <button
            type="button"
            className="tps-btn tps-focusable"
            style={{...styles.actionRow, ...styles.actionRowDestructive}}
            onClick={onRemove}>
            Remove from pool
          </button>
        </div>
        <div style={styles.actionCard}>
          <button ref={cancelRef} type="button" className="tps-btn tps-focusable" style={styles.cancelRow} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PENNY SHEET — medium-detent bottom sheet (grabber button toggles 55% /
// calc(100% − 56px)); the sheet body is the ONE legal inner scroller.
// Rows: floored base + '+n¢' badge where absorbed + final; footer math row
// keeps the cross-check law exact on screen.
// ---------------------------------------------------------------------------

interface PennySheetProps {
  derived: Derived;
  locks: Record<string, number>;
  detent: 'medium' | 'large';
  cleanPool: boolean;
  onToggleDetent: () => void;
  onRotateAll: () => void;
  onToggleClean: () => void;
  onSeedOver: () => void;
  onClose: () => void;
}

function PennySheet({
  derived,
  locks,
  detent,
  cleanPool,
  onToggleDetent,
  onRotateAll,
  onToggleClean,
  onSeedOver,
  onClose,
}: PennySheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    closeRef.current?.focus({preventScroll: true});
  }, []);
  const absorbedCount: Record<string, number> = {};
  for (const id of derived.absorbers) absorbedCount[id] = (absorbedCount[id] ?? 0) + 1;
  const flooredUnlocked = derived.unlockedIds.reduce((sum, id) => sum + (derived.floors[id] ?? 0), 0);
  return (
    <>
      <div className="tps-fade" style={styles.sheetScrim} onClick={onClose} />
      <div
        ref={sheetRef}
        className="tps-sheet-in"
        style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tps-penny-title"
        onKeyDown={event => trapTabKey(event, sheetRef.current)}>
        <div style={styles.grabberZone}>
          <button
            type="button"
            className="tps-btn tps-focusable"
            aria-label="Resize sheet"
            style={{height: 16, paddingInline: 12, display: 'grid', placeItems: 'center', borderRadius: 999}}
            onClick={onToggleDetent}>
            <span style={styles.grabberPill} />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <span />
          <h2 id="tps-penny-title" style={styles.sheetTitle}>
            Penny reconciliation
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="tps-btn tps-focusable"
            style={styles.iconBtn}
            aria-label="Close penny reconciliation"
            onClick={onClose}>
            <Icon icon={XIcon} size="md" color="inherit" />
          </button>
        </div>
        <div style={styles.sheetBody}>
          {derived.activeIds.map((id, index) => {
            const mate = TEAM_BY_ID[id];
            const isLocked = locks[id] != null;
            const payout = derived.payouts[id] ?? 0;
            const sharePct = derived.poolCents > 0 ? ((payout / derived.poolCents) * 100).toFixed(1) : '0.0';
            const extra = absorbedCount[id] ?? 0;
            return (
              <div key={id}>
                {index > 0 ? <div style={styles.actionDividerFull} /> : null}
                <div style={styles.pennyRow}>
                  <div style={styles.pennyRowText}>
                    <span style={styles.pennyRowName}>{mate.name}</span>
                    <span style={styles.pennyRowShare}>share {sharePct}% · rounded</span>
                  </div>
                  <span style={styles.pennyBase}>
                    {isLocked ? 'pinned' : fmtUsd(derived.floors[id] ?? 0)}
                  </span>
                  {extra > 0 ? <span style={styles.pennyBadge}>+{extra}¢</span> : null}
                  <span style={styles.pennyFinal}>{fmtUsd(payout)}</span>
                </div>
              </div>
            );
          })}
          <div style={styles.mathRow}>
            {derived.status === 'over'
              ? \`Locks \${fmtUsd(derived.lockedCents)} exceed pool \${fmtUsd(derived.poolCents)} by \${fmtUsd(derived.overByCents)}\`
              : derived.lockedCents > 0
                ? \`Floored \${fmtUsd(flooredUnlocked)} + remainder \${fmtUsd(derived.remainder)} + locked \${fmtUsd(derived.lockedCents)} = \${fmtUsd(derived.poolCents)}\`
                : \`Floored \${fmtUsd(flooredUnlocked)} + remainder \${fmtUsd(derived.remainder)} = \${fmtUsd(derived.poolCents)}\`}
          </div>
          <div style={styles.sheetBtnRow}>
            <button
              type="button"
              className="tps-btn tps-focusable"
              style={{...styles.secondaryBtn, ...(derived.remainder === 0 ? {opacity: 0.35} : null)}}
              disabled={derived.remainder === 0}
              onClick={onRotateAll}>
              Rotate all
            </button>
            <button type="button" className="tps-btn tps-focusable" style={styles.secondaryBtn} onClick={onToggleClean}>
              {cleanPool ? 'Demo: 3¢ pool' : 'Demo: clean pool'}
            </button>
            <button type="button" className="tps-btn tps-focusable" style={styles.secondaryBtn} onClick={onSeedOver}>
              Demo: over-commit locks
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Splitshift, the one state owner.
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof CoinsIcon}> = [
  {id: 'tonight', label: 'Tonight', icon: CoinsIcon},
  {id: 'history', label: 'History', icon: ClockIcon},
  {id: 'roles', label: 'Roles', icon: ShieldIcon},
  {id: 'team', label: 'Team', icon: UsersIcon},
];

export default function MobileTipPoolSplit() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(wrapRef);
  // First-frame fallback is the viewport query; the ResizeObserver takes
  // over once it fires (container width, not viewport — the desktop stage
  // is ~1045px inside a 1440px window).
  const viewportDesktop = useMediaQuery('(min-width: 720px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : viewportDesktop;
  const narrow = containerWidth > 0 && containerWidth <= 340;
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<PoolState>(INITIAL_STATE);
  const toastSeqRef = useRef(0);
  const openerRef = useRef<HTMLElement | null>(null);
  const justExpandedRef = useRef(false);
  const firstJuneRef = useRef<HTMLButtonElement | null>(null);

  const derived = derive(state);

  // ONE mutation helper: every user action lands as one setState; any user
  // action also resolves a pending refresh-skeleton (deterministic — no
  // timers). A toastText replaces the previous toast (one at a time);
  // undoable actions snapshot the restorable core BEFORE the patch.
  const act = useCallback(
    (patch: (prev: PoolState) => Partial<PoolState>, toastText?: string, undoable = false) => {
      setState(prev => {
        const next: PoolState = {...prev, refreshing: false, ...patch(prev)};
        if (toastText != null) {
          toastSeqRef.current += 1;
          next.toast = {
            seq: toastSeqRef.current,
            text: toastText,
            restore: undoable ? snapshotCore(prev) : null,
          };
        }
        return next;
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.toast?.restore == null) return prev;
      toastSeqRef.current += 1;
      return {
        ...prev,
        ...prev.toast.restore,
        toast: {seq: toastSeqRef.current, text: 'Restored', restore: null},
      };
    });
  }, []);

  // Balance-pill flips announce through the single polite dock; the Undo
  // handle of the mutation that caused the flip is preserved.
  const statusRef = useRef(derived.status);
  useEffect(() => {
    if (statusRef.current === derived.status) return;
    statusRef.current = derived.status;
    const text =
      derived.status === 'over' ? \`Pool over-committed by \${fmtUsd(derived.overByCents)}\` : 'Pool balanced';
    setState(prev => {
      toastSeqRef.current += 1;
      return {...prev, toast: {seq: toastSeqRef.current, text, restore: prev.toast?.restore ?? null}};
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derived.status]);

  // Demo-page scroller (the shell does NOT own scroll) — nearest scrollable
  // ancestor of the wrapper, falling back to the document.
  const findScroller = (): Element | null => {
    let element: HTMLElement | null = wrapRef.current;
    while (element != null) {
      const overflowY = getComputedStyle(element).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return document.scrollingElement;
  };

  // PER-TAB STATE PERSISTENCE — scroll saved on exit, restored on entry;
  // historyExpanded and all pool state survive; open overlays do NOT
  // (an overlay belongs to its moment). Re-tap of the active tab scrolls
  // to top (the one legal reset).
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    act(prev => ({
      tab: next,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      overlay: null,
      sheetDetent: 'medium',
    }));
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === state.tab);
    const nextIndex = (index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    selectTab(TABS[nextIndex].id);
  };

  // OVERLAYS — one at a time; Escape closes the topmost only; focus
  // restores to the opener on every close path (with preventScroll).
  const closeOverlay = useCallback(() => {
    act(() => ({overlay: null, sheetDetent: 'medium'}));
    openerRef.current?.focus({preventScroll: true});
    openerRef.current = null;
  }, [act]);
  useEffect(() => {
    if (state.overlay == null) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlay();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state.overlay, closeOverlay]);

  const openActionSheet = (id: string, opener: HTMLElement) => {
    openerRef.current = opener;
    act(() => ({overlay: {type: 'action', id}}));
  };
  const openPennySheet = (opener: HTMLElement) => {
    openerRef.current = opener;
    act(() => ({overlay: {type: 'penny'}, sheetDetent: 'medium'}));
  };

  // MUTATIONS — all one-setState, all consequences derived.
  const setWeight = (id: string, value: number) => {
    act(prev => ({weights: {...prev.weights, [id]: value}}));
  };
  const toggleLock = (id: string, viaSheet = false) => {
    const mate = TEAM_BY_ID[id];
    if (state.locks[id] != null) {
      act(
        prev => {
          const locks = {...prev.locks};
          delete locks[id];
          return {locks, ...(viaSheet ? {overlay: null as Overlay} : null)};
        },
        'Payout unlocked',
        true,
      );
    } else {
      const cents = derived.payouts[id] ?? 0;
      act(
        prev => ({locks: {...prev.locks, [id]: cents}, ...(viaSheet ? {overlay: null as Overlay} : null)}),
        \`\${mate.name.split(' ')[0]}'s payout locked at \${fmtUsd(cents)}\`,
        true,
      );
    }
    if (viaSheet) {
      openerRef.current?.focus({preventScroll: true});
      openerRef.current = null;
    }
  };
  const resetWeight = (id: string) => {
    const mate = TEAM_BY_ID[id];
    const fallback = state.roleDefaults[mate.role] ?? mate.roleDefault;
    act(
      prev => ({weights: {...prev.weights, [id]: fallback}, overlay: null}),
      \`Weight reset to \${fmtWeight(fallback)}\`,
      true,
    );
    openerRef.current?.focus({preventScroll: true});
    openerRef.current = null;
  };
  const addHalfHour = (id: string) => {
    const mate = TEAM_BY_ID[id];
    const nextHours = state.hours[id] + 0.5;
    act(
      prev => ({hours: {...prev.hours, [id]: prev.hours[id] + 0.5}, overlay: null}),
      \`Added 0.5 hr — \${mate.name.split(' ')[0]} at \${nextHours.toFixed(1)} hrs\`,
      true,
    );
    openerRef.current?.focus({preventScroll: true});
    openerRef.current = null;
  };
  const removeFromPool = (id: string) => {
    const mate = TEAM_BY_ID[id];
    act(
      prev => ({removed: {...prev.removed, [id]: true}, overlay: null}),
      \`\${mate.name.split(' ')[0]} removed from pool\`,
      true,
    );
    // Opener row unmounts with the removal; focus falls back to the shell
    // scroll context (the toast Undo is the recovery affordance).
    openerRef.current = null;
  };
  const reassignCent = (centIndex: number) => {
    act(
      prev => ({centShifts: {...prev.centShifts, [centIndex]: (prev.centShifts[centIndex] ?? 0) + 1}}),
      'Cent reassigned',
      true,
    );
  };
  const rotateAll = () => {
    act(prev => ({rotationStart: prev.rotationStart + 1}), 'Rotation advanced', true);
  };
  const toggleCleanPool = () => {
    act(
      prev => ({cleanPool: !prev.cleanPool}),
      state.cleanPool ? \`Demo pool restored to \${fmtUsd(POOL_CENTS)}\` : \`Demo pool set to \${fmtUsd(POOL_CENTS_CLEAN)} — splits clean\`,
    );
  };
  const seedOverCommit = () => {
    act(() => ({locks: {...OVER_COMMIT_LOCKS}, overlay: null}), 'Demo locks seeded — $600.00 pinned', true);
    openerRef.current?.focus({preventScroll: true});
    openerRef.current = null;
  };
  const onRefresh = () => {
    setState(prev => {
      toastSeqRef.current += 1;
      return {
        ...prev,
        refreshing: true,
        toast: {seq: toastSeqRef.current, text: 'Updated just now', restore: null},
      };
    });
  };
  const showMoreHistory = () => {
    justExpandedRef.current = true;
    act(() => ({historyExpanded: true}), '8 more loaded');
  };
  useEffect(() => {
    if (state.historyExpanded && justExpandedRef.current) {
      justExpandedRef.current = false;
      firstJuneRef.current?.focus({preventScroll: true});
    }
  }, [state.historyExpanded]);
  const bumpRoleDefault = (role: string, delta: number) => {
    act(prev => ({
      roleDefaults: {...prev.roleDefaults, [role]: clampWeight((prev.roleDefaults[role] ?? 1) + delta)},
    }));
  };

  // Detent ticks derive from the CURRENT role defaults (Roles-tab steppers
  // move every slider's ticks — the observable cross-surface consequence).
  const ticks = [...new Set(Object.values(state.roleDefaults))].sort((a, b) => a - b);

  const overlayOpen = state.overlay != null;
  const julyCents = HISTORY_JULY.reduce((sum, pool) => sum + pool.cents, 0);
  const activeMate = state.overlay?.type === 'action' ? TEAM_BY_ID[state.overlay.id] : null;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TPS_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — 52px sticky top z20; hairline always on. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="tps-btn tps-focusable"
              style={styles.brandBtn}
              aria-label="Splitshift — scroll to top"
              onClick={() => {
                const scroller = findScroller();
                if (scroller != null) scroller.scrollTop = 0;
              }}>
              <SplitshiftMark />
            </button>
          </div>
          <h1 style={styles.navTitle}>Tonight&rsquo;s Pool</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="tps-btn tps-focusable"
              style={styles.iconBtn}
              aria-label="Refresh pool totals"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* BALANCE STRIP — 36px, in flow (scrolls away; PoolFlow sticks at
            top 52, not 88). */}
        <div style={styles.balanceStrip}>
          <span style={{...styles.balanceFigure, ...(narrow ? styles.balanceFigureNarrow : null)}}>
            {fmtUsd(derived.poolCents)}
          </span>
          <span style={styles.balanceCaption}>pool · #{ROUND_INDEX}</span>
          <span
            style={{
              ...styles.balancePill,
              ...(derived.status === 'over' ? styles.balancePillOver : styles.balancePillOk),
            }}>
            <Icon icon={derived.status === 'over' ? TriangleAlertIcon : CheckIcon} size="xsm" color="inherit" />
            {derived.status === 'over' ? \`Over by \${fmtUsd(derived.overByCents)}\` : 'Balanced'}
          </span>
        </div>

        {state.tab === 'tonight' ? (
          <main>
            <h2 className="tps-vh">Tonight&rsquo;s split</h2>
            <PoolFlow
              members={derived.activeIds.map(id => ({
                id,
                initials: TEAM_BY_ID[id].initials,
                locked: state.locks[id] != null,
                payoutCents: derived.payouts[id] ?? 0,
              }))}
              poolCents={derived.poolCents}
              caption={\`\${derived.activeIds.length} teammates · \${derived.totalHours.toFixed(1)} hrs · \${derived.totalWeightHours.toFixed(1)} weight-hrs\`}
            />

            {/* PENNY STRIP — 56px min; chips are 44px-hit buttons. */}
            <div style={styles.pennyStrip}>
              <div style={styles.pennyChipZone}>
                {derived.status === 'over' ? (
                  <span style={styles.pennyWarning}>
                    <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                    Unlock a payout to rebalance
                  </span>
                ) : derived.remainder === 0 ? (
                  <span style={styles.pennyClean}>Splits clean — no remainder</span>
                ) : (
                  <>
                    <span style={styles.pennyLabel}>
                      <span style={styles.pennyIcon}>
                        <Icon icon={CircleDollarSignIcon} size="sm" color="inherit" />
                      </span>
                      {derived.remainder}¢ remainder
                    </span>
                    {derived.absorbers.map((id, centIndex) => (
                      <button
                        // Cent index is the identity; the same teammate may
                        // absorb two cents.
                        // eslint-disable-next-line react/no-array-index-key
                        key={centIndex}
                        type="button"
                        className="tps-btn tps-focusable"
                        style={styles.centChipBtn}
                        aria-label={\`Reassign this cent (currently \${TEAM_BY_ID[id].name})\`}
                        onClick={() => reassignCent(centIndex)}>
                        <span style={styles.centChip}>1¢ → {TEAM_BY_ID[id].initials}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
              <button
                type="button"
                className="tps-btn tps-focusable"
                style={styles.detailsBtn}
                onClick={event => openPennySheet(event.currentTarget)}>
                Details
              </button>
            </div>

            <div style={styles.sectionHeader}>Teammates</div>
            <div style={styles.listCard} aria-busy={state.refreshing || undefined}>
              {state.refreshing
                ? TEAM.map((mate, index) => (
                    <div key={mate.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      {/* Skeleton at EXACT WeightRow geometry (64px) —
                          deterministic widths, no shimmer under reduced
                          motion (no shimmer at all: static muted blocks). */}
                      <div style={styles.weightRow} aria-hidden>
                        <div style={{...styles.skelBar, width: SKEL_PRIMARY[index % 3]}} />
                        <div style={{...styles.skelBar, width: SKEL_SECONDARY[index % 3]}} />
                      </div>
                    </div>
                  ))
                : derived.activeIds.map((id, index) => (
                    <div key={id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <WeightRow
                        mate={TEAM_BY_ID[id]}
                        weight={state.weights[id]}
                        hours={state.hours[id]}
                        lockedCents={state.locks[id] ?? null}
                        payoutCents={derived.payouts[id] ?? 0}
                        ticks={ticks}
                        narrow={narrow}
                        reduced={reduced}
                        onOpenSheet={openActionSheet}
                        onWeight={setWeight}
                        onToggleLock={toggleLock}
                      />
                    </div>
                  ))}
            </div>
            <div style={styles.terminalCaption}>
              {derived.status === 'over'
                ? 'Locks exceed the pool — unlock a payout to rebalance'
                : \`Payouts reconcile to \${fmtUsd(derived.poolCents)}\`}
            </div>
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {state.tab === 'history' ? (
          <main>
            <h2 className="tps-vh">Closed pools</h2>
            <div style={{...styles.summaryCard, marginTop: 20}}>
              <span style={styles.overline}>July so far</span>
              <span style={styles.summaryFigure}>
                {fmtUsdGrouped(julyCents)} · {HISTORY_JULY.length} pools
              </span>
            </div>
            <div style={styles.sectionHeader}>Closed pools</div>
            <div style={styles.listCard}>
              {[...HISTORY_JULY, ...(state.historyExpanded ? HISTORY_JUNE : [])].map((pool, index) => (
                <div key={pool.id}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <button
                    ref={pool.id === HISTORY_JUNE[0].id ? firstJuneRef : undefined}
                    type="button"
                    className="tps-btn tps-focusable"
                    style={styles.historyRow}
                    onClick={() => act(() => ({}), pool.note)}>
                    <span style={styles.historyText}>
                      <span style={styles.historyDate}>{pool.dateLabel}</span>
                      <span style={styles.historyMeta}>{pool.meta}</span>
                    </span>
                    <span style={styles.historyAmount}>{fmtUsd(pool.cents)}</span>
                  </button>
                </div>
              ))}
              {!state.historyExpanded ? (
                <>
                  <div style={styles.rowDivider} />
                  <button type="button" className="tps-btn tps-focusable" style={styles.loadMoreRow} onClick={showMoreHistory}>
                    Show {HISTORY_JUNE.length} more
                  </button>
                </>
              ) : null}
            </div>
            {state.historyExpanded ? (
              <div style={styles.terminalCaption}>All {HISTORY_JULY.length + HISTORY_JUNE.length} closed pools</div>
            ) : null}
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {state.tab === 'roles' ? (
          <main>
            <h2 className="tps-vh">Role default weights</h2>
            <div style={styles.sectionHeader}>Default weights</div>
            <div style={styles.listCard}>
              {ROLE_ORDER.map((role, index) => {
                const value = state.roleDefaults[role] ?? 1;
                const count = ROLE_MEMBER_COUNT[role];
                return (
                  <div key={role}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.roleRow}>
                      <span style={styles.roleText}>
                        <span style={styles.rolePrimary}>{role}</span>
                        <span style={styles.roleMeta}>
                          {count} member{count === 1 ? '' : 's'}
                        </span>
                      </span>
                      <span
                        style={styles.stepperValue}
                        className="tps-focusable"
                        role="spinbutton"
                        tabIndex={0}
                        aria-valuenow={value}
                        aria-valuemin={WEIGHT_MIN}
                        aria-valuemax={WEIGHT_MAX}
                        aria-label={\`\${role} default weight\`}
                        onKeyDown={event => {
                          if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            bumpRoleDefault(role, WEIGHT_STEP);
                          } else if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            bumpRoleDefault(role, -WEIGHT_STEP);
                          }
                        }}>
                        {value.toFixed(2)}
                      </span>
                      <div style={styles.stepper}>
                        <button
                          type="button"
                          className="tps-btn tps-focusable"
                          style={{...styles.stepperHalf, ...(value <= WEIGHT_MIN ? styles.stepperHalfDisabled : null)}}
                          disabled={value <= WEIGHT_MIN}
                          aria-label={\`Decrease \${role} default weight\`}
                          onClick={() => bumpRoleDefault(role, -WEIGHT_STEP)}>
                          <Icon icon={MinusIcon} size="sm" color="inherit" />
                        </button>
                        <div style={styles.stepperRule} />
                        <button
                          type="button"
                          className="tps-btn tps-focusable"
                          style={{...styles.stepperHalf, ...(value >= WEIGHT_MAX ? styles.stepperHalfDisabled : null)}}
                          disabled={value >= WEIGHT_MAX}
                          aria-label={\`Increase \${role} default weight\`}
                          onClick={() => bumpRoleDefault(role, WEIGHT_STEP)}>
                          <Icon icon={PlusIcon} size="sm" color="inherit" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={styles.terminalCaption}>Defaults seed new pools and the slider detents</div>
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {state.tab === 'team' ? (
          <main>
            <h2 className="tps-vh">Teammates</h2>
            <div style={styles.sectionHeader}>Tonight&rsquo;s crew</div>
            <div style={styles.listCard}>
              {TEAM.map((mate, index) => {
                const isRemoved = state.removed[mate.id] === true;
                return (
                  <div key={mate.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    {isRemoved ? (
                      <div style={{...styles.teamRow, opacity: 0.6}}>
                        <span style={styles.avatar} aria-hidden>
                          {mate.initials}
                        </span>
                        <span style={styles.historyText}>
                          <span style={styles.historyDate}>{mate.name}</span>
                          <span style={styles.historyMeta}>Not in tonight&rsquo;s pool</span>
                        </span>
                        <span style={styles.teamPayout}>—</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="tps-btn tps-focusable"
                        style={styles.teamRow}
                        onClick={event => openActionSheet(mate.id, event.currentTarget)}>
                        <span style={styles.avatar} aria-hidden>
                          {mate.initials}
                        </span>
                        <span style={styles.historyText}>
                          <span style={styles.historyDate}>{mate.name}</span>
                          <span style={styles.historyMeta}>
                            {mate.role} · {state.hours[mate.id].toFixed(1)} hrs
                          </span>
                        </span>
                        <span style={styles.teamPayout}>{fmtUsd(derived.payouts[mate.id] ?? 0)}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={styles.terminalCaption}>
              All {TEAM.length} teammates · {TEAM.reduce((sum, mate) => sum + state.hours[mate.id], 0).toFixed(1)} hrs
              tonight
            </div>
            <div style={styles.spacer24} />
          </main>
        ) : null}

        {/* TOAST DOCK — the single polite live region. Sticky-in-flow above
            the tabBar (bottom 76); shell-absolute (and above the overlay
            scrim, z45 — deviation from spec z30 so sheet-born Undo toasts
            stay visible, matching the parking exemplar) while locked. */}
        <div
          style={overlayOpen ? {...styles.toastDockAbsolute, zIndex: 45} : styles.toastDockSticky}
          role="status"
          aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast}>
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.restore != null ? (
                <>
                  <span style={styles.toastRule} />
                  <button type="button" className="tps-btn tps-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px sticky bottom z20. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Splitshift sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="tps-btn tps-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="lg" color="inherit" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* OVERLAYS — absolute in shell; shell is scroll-locked while open. */}
        {state.overlay?.type === 'penny' ? (
          <PennySheet
            derived={derived}
            locks={state.locks}
            detent={state.sheetDetent}
            cleanPool={state.cleanPool}
            onToggleDetent={() =>
              act(prev => ({sheetDetent: prev.sheetDetent === 'medium' ? 'large' : 'medium'}))
            }
            onRotateAll={rotateAll}
            onToggleClean={toggleCleanPool}
            onSeedOver={seedOverCommit}
            onClose={closeOverlay}
          />
        ) : null}
        {activeMate != null ? (
          <TeammateActionSheet
            mate={activeMate}
            weight={state.weights[activeMate.id]}
            hours={state.hours[activeMate.id]}
            lockedCents={state.locks[activeMate.id] ?? null}
            payoutCents={derived.payouts[activeMate.id] ?? 0}
            roleDefault={state.roleDefaults[activeMate.role] ?? activeMate.roleDefault}
            onLockToggle={() => toggleLock(activeMate.id, true)}
            onReset={() => resetWeight(activeMate.id)}
            onAddHalfHour={() => addHalfHour(activeMate.id)}
            onRemove={() => removeFromPool(activeMate.id)}
            onClose={closeOverlay}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};