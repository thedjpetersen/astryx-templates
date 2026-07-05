var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — three Selo journal days (d0 'Mon,
 *   Jun 15' 3 entries · d1 'Tue, Jun 16' 8 entries · d2 'Wed, Jun 17'
 *   empty), each entry {id, region, startMin+startLabel dual fields,
 *   durationMin, severity 1-10, factors[], note}. Cross-check ledger
 *   (verified by hand): d1 severity sum 3+5+6+2+7+2+4+5 = 34 → ring
 *   34/50 = 68%; 8 entries = head 3 + gut 2 + chest 1 + joints 1 + skin 1;
 *   region maxes head 6 / chest 4 / gut 7 / joints 2 / skin 2; factor tag
 *   instances 9 = coffee 3 + stress 3 + poor-sleep 2 + screen-time 1
 *   (maxCount 3); worst hour h14 = e5(7)+e6(2) = 9 → '2 PM'. d0 sum 12 →
 *   24%, worst hour 7 PM load 5. No Date.now(), no Math.random(), no
 *   network media.
 * @output Selo — Symptom Day Journal: a 390px MOBILE single-day pain
 *   diary rendered as an instrument. NavBar (prev/next day · date title +
 *   24px DayLoadRing arc = min(sum,50)/50) over a 5-cell
 *   RegionIntensityStrip (64px filter-button cells tinted by region max
 *   via the SEV ramp at 18%), a 768px 24h DaySpine (32px/hour) of
 *   severity beads (diameter 12+sev×2) with duration tails
 *   (durationMin×32/60) and a lane-2 +28px collision shift, a
 *   FactorChipMatrix with live co-occurrence bars, and a terminal
 *   caption. Signature move: press-and-slide on a bead — 8px slop then
 *   12px per detent — live-resizes/recolors the bead, refills the ring,
 *   retints the region cell, and recomputes the worst-hour caption on
 *   every detent crossing, committing on pointerup through the one
 *   update() path that the sheet's SeverityStepper mirrors exactly.
 *   Delete is undoOverConfirm: immediate, with an untimed Undo toast that
 *   restores the exact array position.
 * @position Page template; emitted by \`astryx template mobile-symptom-day-journal\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. FAB + toastDock are
 *   STICKY-IN-FLOW (bottom 16) per the foundations amendment — the shell
 *   grows ~1.4k px tall, so shell-absolute bottom pins would land
 *   off-viewport at the document bottom.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Selo violet); the SEV_RAMP severity pairs are
 *   sanctioned data-encoding literals, each with ≥3:1-vs-card contrast
 *   math at the declaration (they are meaningful rest fills, not
 *   hairlines, per the batch-2 amendment).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', always-on hairline —
 *   noted per contract); RegionIntensityStrip 64px cells flex:1 gap 8
 *   ((320−32−32)/5 = 51.2px min ✓); sectionHeader 13px/600 uppercase
 *   0.06em at 32px inset, 24px top / 8px bottom; spine 768px = 24h ×
 *   32px/hour (0.5333px/min), hour-label col 44px, rail 2px at x=52,
 *   beads 12+sev×2 in 44×44 buttons, lane-2 +28px when centers <24px
 *   apart; chips 36px in 44px hit wrappers; FAB 56×56; toast min 48px;
 *   88px bottom content padding. TYPE (Figtree via --font-family-body):
 *   17/600 nav+sheet titles · 16/400-500 body floor · 13 secondary ·
 *   11/500 overlines; nothing under 11px; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 (bead buttons, cells, chips via
 *   wrappers, stepper halves via padded hits); every gesture has a
 *   button path (press-and-slide ↔ SeverityStepper; sheet drag ↔ grabber
 *   click + X).
 *
 * Responsive contract:
 * - Fluid 320-430px: zero width literals; strip cells flex:1 (51px at
 *   320 — 22px glyph + single-word 11px labels fit); spine label blocks
 *   flex to remaining width with minWidth 0 + ellipsis (lane-2 max:
 *   44+2+28+32 = 106px, leaves 150px+ at 320); chips wrap.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the spine is deliberately phone
 *   geometry.
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
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Selo violet). White on #7C5CE0 ≈ 4.7:1
// (passes 4.5:1); #A78BFA on the dark card (~#1C1C1E) ≈ 7.2:1. As a fill
// vs the light card (#FFFFFF) #7C5CE0 ≈ 4.6:1 — clears the ≥3:1
// interactive-boundary bar for the ring arc and co-occurrence bars.
const BRAND_ACCENT = 'light-dark(#7C5CE0, #A78BFA)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #7C5CE0 ≈ 4.7:1.
// Dark: white on #A78BFA fails (~1.9:1), so the dark side flips to a
// near-black violet — #1B1533 on #A78BFA ≈ 8.0:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1B1533)';
// SEV_RAMP — severity 1-10 bead/tail fills and 18% region-cell tints.
// These are MEANINGFUL REST FILLS (batch-2 amendment): every pair is
// ≥3:1 against var(--color-background-card) in its own scheme.
//   teal  #0F766E on #FFF ≈ 5.9:1 · #2DD4BF on #1C1C1E ≈ 9.2:1
//   amber #B45309 on #FFF ≈ 4.7:1 · #FBBF24 on #1C1C1E ≈ 10.3:1
//   reds  #DC2626 ≈ 4.6:1 → #991B1B ≈ 8.0:1 on #FFF;
//         #F87171 ≈ 6.4:1 → #FCA5A5 ≈ 8.4:1 on #1C1C1E — all clear 3:1.
const SEV_RAMP: string[] = [
  'light-dark(#0F766E, #2DD4BF)', // sev 1
  'light-dark(#0F766E, #2DD4BF)', // sev 2
  'light-dark(#0F766E, #2DD4BF)', // sev 3
  'light-dark(#B45309, #FBBF24)', // sev 4
  'light-dark(#B45309, #FBBF24)', // sev 5
  'light-dark(#B45309, #FBBF24)', // sev 6
  'light-dark(#DC2626, #F87171)', // sev 7
  'light-dark(#C42222, #F98282)', // sev 8
  'light-dark(#AE1F1F, #FB9393)', // sev 9
  'light-dark(#991B1B, #FCA5A5)', // sev 10
];
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

/** 18% severity tint over the card surface (region cells). */
function sevTint(sev: number): string {
  return \`color-mix(in srgb, \${SEV_RAMP[sev - 1]} 18%, var(--color-background-card))\`;
}

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// reduced-motion guard. Transitions animate transform/opacity/color only
// and collapse to instant under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const SELO_CSS = \`
.slo-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.slo-btn:disabled { cursor: default; }
.slo-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.slo-anim { transition: transform 200ms ease, opacity 200ms ease; }
.slo-fade { transition: opacity 200ms ease; }
.slo-ring-arc { transition: stroke-dashoffset 200ms ease; }
@keyframes slo-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.slo-sheet-in { animation: slo-sheet-in 200ms ease; }
.slo-vh {
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
  .slo-anim, .slo-fade, .slo-ring-arc { transition: none; }
  .slo-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const HOUR_PX = 32; // 32px per hour → 768px spine, 0.5333px/min
const RAIL_X = 53; // rail center: 44px hour col + 2px rail at x=52
const LANE2_OFFSET = 28;

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
  // NAV BAR — 52px sticky top z20; always-on hairline + blur (this
  // template does not wire scroll-under; noted per contract).
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
    color: 'var(--color-text-primary)',
  },
  iconBtnDisabled: {opacity: 0.35},
  navCenter: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // REGION INTENSITY STRIP — 5 flex:1 64px filter-button cells, 8px gaps,
  // 16px gutter; (320−32−32)/5 = 51.2px min cell ✓.
  strip: {
    display: 'flex',
    gap: 8,
    paddingInline: 16,
    paddingTop: 12,
  },
  regionCell: {
    flex: 1,
    minWidth: 0,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // aria-pressed filter ring — 2px brand inset (≥3:1 vs card, see
  // BRAND_ACCENT math above).
  regionCellOn: {boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`},
  regionGlyph: {height: 22, display: 'grid', placeItems: 'center', color: 'var(--color-text-primary)'},
  regionLabel: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  regionMax: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px inset, 24px top /
  // 8px bottom (24px section gap).
  sectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 12,
  },
  // DAY SPINE — 768px = 24h × 32px/hour inside the card's 12px padding.
  spine: {position: 'relative', height: 24 * HOUR_PX},
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 52,
    width: 2,
    background: 'var(--color-border)',
    borderRadius: 1,
  },
  hourLabel: {
    position: 'absolute',
    left: 0,
    width: 44,
    paddingRight: 10,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '12px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  hourTick: {
    position: 'absolute',
    left: 48,
    width: 10,
    height: 1,
    background: 'var(--color-border)',
  },
  // Duration tail — 4px rounded bar below the bead, length =
  // durationMin × 32/60 (90m→48px · 120m→64px · 60m→32px · 45m→24px ·
  // 30m→16px). SEV_RAMP fill (≥3:1 vs card — see ramp math).
  tail: {position: 'absolute', width: 4, borderRadius: 2},
  // Bead — 12+sev×2 px circle centered on the rail inside a 44×44
  // absolute button; the severity numeral NEVER renders inside the bead.
  beadBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    touchAction: 'none',
  },
  bead: {borderRadius: '50%'},
  entryLabel: {
    position: 'absolute',
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transform: 'translateY(-50%)',
  },
  entryText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1},
  entryRegion: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  entryTime: {
    fontSize: 13,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  entrySev: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  // FACTOR CHIP MATRIX — 36px chips inside 44px-tall hit wrappers
  // (paddingBlock 4; spec said 8px block padding which would make 52px —
  // trimmed to keep the 44px wrapper the spec also names; noted).
  chipsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: 8,
    paddingInline: 16,
  },
  chipHit: {paddingBlock: 4, borderRadius: 999},
  chip: {
    height: 36,
    minWidth: 96,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 3,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  chipDim: {opacity: 0.4},
  chipTop: {display: 'flex', alignItems: 'baseline', gap: 6},
  chipLabel: {fontSize: 13, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap'},
  chipCount: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  chipBarTrack: {
    height: 4,
    borderRadius: 2,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  chipBarFill: {height: '100%', borderRadius: 2, background: BRAND_ACCENT},
  // Terminal caption — 13/400 centered, 16px below the chips.
  caption: {
    marginTop: 16,
    paddingInline: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 88px bottom padding so the sticky FAB never covers the last chip row.
  bottomPad: {height: 88},
  // FAB — STICKY dock (amendment: shell-absolute bottom pins to the
  // document bottom on this ~1.4k px surface). pointerEvents none on the
  // dock so the spine stays tappable beneath it.
  fabDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 25,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingInline: 16,
    height: 0,
    pointerEvents: 'none',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
    transform: 'translateY(-100%)',
  },
  // TOAST DOCK — the single polite live region; sticky-in-flow (bottom
  // 16), right padding 88 so an open toast clears the 56px FAB + 16px
  // gutter (deviation from the spec's insetInline 16 — collision fix).
  toastDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    paddingInlineStart: 16,
    paddingInlineEnd: 88,
    display: 'flex',
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 48,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  toastRule: {width: 1, alignSelf: 'stretch', marginBlock: 8, background: 'var(--color-border)'},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    borderRadius: 12,
  },
  // EMPTY STATE (d2) — 64px muted circle + 28px icon, one promoted CTA
  // (creation IS this screen's primary verb).
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
  emptyTitle: {fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap'},
  emptyBody: {marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)'},
  emptyCta: {
    marginTop: 16,
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  primaryBtn: {
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
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  fieldBlock: {marginTop: 16},
  // Region picker — the same 5-cell strip anatomy, radiogroup.
  pickerRow: {display: 'flex', gap: 8},
  // SeverityStepper — 96×32 track split minus|plus, value spinbutton
  // adjacent (never inside the track); halves get 44px hits via padding.
  stepperRow: {display: 'flex', alignItems: 'center', gap: 12},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 56,
    borderRadius: 8,
    paddingBlock: 4,
    textAlign: 'center',
  },
  stepperHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
  },
  stepper: {
    width: 96,
    height: 32,
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
  stepperDivider: {width: 1, background: 'var(--color-border)', marginBlock: 4},
  // 44px utility rows — label leading, 36px value pill trailing.
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  utilityLabel: {fontSize: 16},
  pillBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  inlinePanel: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  inlinePanelRow: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  inlinePanelLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // Factor toggle chips (sheet) — 36px, aria-pressed.
  factorToggle: {
    height: 36,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 500,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    background: 'var(--color-background-card)',
  },
  factorToggleOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  noteInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  readoutRow: {
    marginTop: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Delete — ABOVE the footer with 24px dead space (destructive away
  // from the thumb's Save target, never adjacent).
  deleteBtn: {
    marginTop: 24,
    height: 36,
    width: '100%',
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-error)',
  },
  deleteSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts + display strings (dual fields: startMin +
// startLabel). All aggregates are COMPUTED IN RENDER from the entry
// arrays — never stored — so the fixtures cannot drift from the sums.
// ---------------------------------------------------------------------------

type RegionId = 'head' | 'chest' | 'gut' | 'joints' | 'skin';
type FactorId = 'coffee' | 'stress' | 'poor-sleep' | 'screen-time';

const REGION_ORDER: RegionId[] = ['head', 'chest', 'gut', 'joints', 'skin'];
const REGION_LABEL: Record<RegionId, string> = {
  head: 'Head',
  chest: 'Chest',
  gut: 'Gut',
  joints: 'Joints',
  skin: 'Skin',
};

const FACTOR_ORDER: FactorId[] = ['coffee', 'stress', 'poor-sleep', 'screen-time'];
const FACTOR_LABEL: Record<FactorId, string> = {
  coffee: 'Coffee',
  stress: 'Stress',
  'poor-sleep': 'Poor sleep',
  'screen-time': 'Screen time',
};

interface JournalEntry {
  id: string;
  region: RegionId;
  startMin: number; // minutes since midnight — top = startMin × 32/60
  startLabel: string;
  durationMin: number; // tail length = durationMin × 32/60
  severity: number; // 1-10 — bead diameter = 12 + severity × 2
  factors: FactorId[];
  note: string;
}

type DayId = 'd0' | 'd1' | 'd2';

const DAY_ORDER: DayId[] = ['d0', 'd1', 'd2'];
const DAY_LABEL: Record<DayId, string> = {
  d0: 'Mon, Jun 15',
  d1: 'Tue, Jun 16',
  d2: 'Wed, Jun 17',
};

// DAY d1 (default, 8 entries). CROSS-CHECKS: severity sum
// 3+5+6+2+7+2+4+5 = 34 → ring 68%; head 3 + gut 2 + chest 1 + joints 1 +
// skin 1 = 8; region maxes head 6 / chest 4 / gut 7 / joints 2 / skin 2;
// factor instances 9 → coffee 3 · stress 3 · poor-sleep 2 · screen-time 1
// (maxCount 3); worst hour h14 = e5(7)+e6(2) = 9. e5 (450px) vs e6
// (466px) are 16px apart → the lane-2 collision demo. e3's 58-char note
// is the sheet's single-line ellipsis stress.
const D1_ENTRIES: JournalEntry[] = [
  {id: 'e1', region: 'head', startMin: 390, startLabel: '6:30 AM', durationMin: 90, severity: 3, factors: ['poor-sleep'], note: ''},
  {id: 'e2', region: 'gut', startMin: 490, startLabel: '8:10 AM', durationMin: 45, severity: 5, factors: ['coffee'], note: ''},
  {
    id: 'e3',
    region: 'head',
    startMin: 580,
    startLabel: '9:40 AM',
    durationMin: 120,
    severity: 6,
    factors: ['coffee', 'stress'],
    note: 'Throbbing behind left eye, worse when standing up quickly',
  },
  {id: 'e4', region: 'joints', startMin: 735, startLabel: '12:15 PM', durationMin: 0, severity: 2, factors: [], note: ''},
  {id: 'e5', region: 'gut', startMin: 845, startLabel: '2:05 PM', durationMin: 60, severity: 7, factors: ['coffee', 'stress'], note: ''},
  {id: 'e6', region: 'skin', startMin: 875, startLabel: '2:35 PM', durationMin: 0, severity: 2, factors: [], note: ''},
  {id: 'e7', region: 'chest', startMin: 1125, startLabel: '6:45 PM', durationMin: 30, severity: 4, factors: ['stress'], note: ''},
  {id: 'e8', region: 'head', startMin: 1280, startLabel: '9:20 PM', durationMin: 0, severity: 5, factors: ['poor-sleep', 'screen-time'], note: ''},
];

// DAY d0 (3 entries): sum 4+3+5 = 12 → ring 24%; maxes head 4 / gut 3 /
// joints 5, chest+skin 0 (untinted cells, '–' numerals); worst hour 7 PM
// load 5; coffee/stress/poor-sleep 1 each, screen-time 0 (muted track).
const D0_ENTRIES: JournalEntry[] = [
  {id: 'f1', region: 'head', startMin: 470, startLabel: '7:50 AM', durationMin: 60, severity: 4, factors: ['poor-sleep'], note: ''},
  {id: 'f2', region: 'gut', startMin: 810, startLabel: '1:30 PM', durationMin: 30, severity: 3, factors: ['coffee'], note: ''},
  {id: 'f3', region: 'joints', startMin: 1150, startLabel: '7:10 PM', durationMin: 0, severity: 5, factors: ['stress'], note: ''},
];

const RING_CAP = 50; // ring arc = min(daySeveritySum, 50) / 50

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVED — pure fns over the entry array; every surface
// (ring, cells, chips, caption, sheet readout) derives from the same set.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '2:05 PM'. */
function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

/** Hour index → '2 PM' (worst-hour readouts). */
function fmtHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return \`\${h12} \${suffix}\`;
}

function daySum(entries: JournalEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.severity, 0);
}

function regionMaxMap(entries: JournalEntry[]): Record<RegionId, number> {
  const map: Record<RegionId, number> = {head: 0, chest: 0, gut: 0, joints: 0, skin: 0};
  for (const entry of entries) {
    if (entry.severity > map[entry.region]) map[entry.region] = entry.severity;
  }
  return map;
}

function factorCounts(entries: JournalEntry[]): Record<FactorId, number> {
  const map: Record<FactorId, number> = {coffee: 0, stress: 0, 'poor-sleep': 0, 'screen-time': 0};
  for (const entry of entries) {
    for (const factor of entry.factors) map[factor] += 1;
  }
  return map;
}

/**
 * Worst hour = the hour whose intersecting-entry severities sum highest.
 * An entry spans [startMin, startMin + durationMin) with an EXCLUSIVE
 * end — e1 (6:30 + 90m) ends exactly 8:00, so h8's load is 5 (e2 only),
 * not 8 (stress fixture 7). Zero-duration entries load only their start
 * hour. Ties resolve to the earliest hour (deterministic).
 */
function worstHour(entries: JournalEntry[]): {hour: number; load: number} | null {
  if (entries.length === 0) return null;
  let best = {hour: 0, load: 0};
  for (let hour = 0; hour < 24; hour++) {
    const from = hour * 60;
    const to = from + 60;
    let load = 0;
    for (const entry of entries) {
      const end = entry.startMin + Math.max(entry.durationMin, 1);
      if (entry.startMin < to && end > from) load += entry.severity;
    }
    if (load > best.load) best = {hour, load};
  }
  return best.load > 0 ? best : null;
}

/** Sort by start time, then assign collision lanes (<24px → lane 2). */
function spineLayout(entries: JournalEntry[]): Array<{entry: JournalEntry; top: number; lane: 1 | 2}> {
  const sorted = [...entries].sort((a, b) => a.startMin - b.startMin);
  const out: Array<{entry: JournalEntry; top: number; lane: 1 | 2}> = [];
  for (const entry of sorted) {
    const top = (entry.startMin * HOUR_PX) / 60;
    const prev = out[out.length - 1];
    const lane: 1 | 2 = prev != null && top - prev.top < 24 && prev.lane === 1 ? 2 : 1;
    out.push({entry, top, lane});
  }
  return out;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — journalStore: one useState in App with exactly one
// mutator update(entryId, patch) for entries, plus setters for ui fields.
// ---------------------------------------------------------------------------

interface DraftEntry {
  region: RegionId;
  severity: number;
  startMin: number;
  durationMin: number;
  factors: FactorId[];
  note: string;
}

interface SheetState {
  open: boolean;
  detent: 'medium' | 'large';
  mode: 'create' | 'edit';
  entryId: string | null;
  draft: DraftEntry;
  timePanelOpen: boolean;
  durationPanelOpen: boolean;
}

interface ToastState {
  seq: number;
  msg: string;
  // Undo snapshot restores the exact array position (splice back at index).
  undo: {dayId: DayId; index: number; entry: JournalEntry} | null;
}

interface DragState {
  entryId: string;
  startSev: number;
  sev: number; // live detent value — every surface derives from it
}

interface JournalStore {
  dayId: DayId;
  entriesByDay: Record<DayId, JournalEntry[]>;
  // Screen-state persistence law analog: the filter is keyed per day.
  regionFilterByDay: Record<DayId, RegionId | null>;
  sheet: SheetState;
  toast: ToastState | null;
  drag: DragState | null;
  newCount: number; // deterministic ids for created entries (n1, n2, …)
}

const EMPTY_DRAFT: DraftEntry = {
  region: 'head',
  severity: 5,
  startMin: 540,
  durationMin: 0,
  factors: [],
  note: '',
};

const INITIAL_STORE: JournalStore = {
  dayId: 'd1',
  entriesByDay: {d0: D0_ENTRIES, d1: D1_ENTRIES, d2: []},
  regionFilterByDay: {d0: null, d1: null, d2: null},
  sheet: {
    open: false,
    detent: 'medium',
    mode: 'create',
    entryId: null,
    draft: EMPTY_DRAFT,
    timePanelOpen: false,
    durationPanelOpen: false,
  },
  toast: null,
  drag: null,
  newCount: 0,
};

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
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

// ---------------------------------------------------------------------------
// REGION GLYPHS — stylized 22px body-region strokes (no photos/real
// anatomy art); stroke follows the cell's currentColor
// (var(--color-text-primary), never --color-text).
// ---------------------------------------------------------------------------

const REGION_PATH: Record<RegionId, ReactNode> = {
  head: (
    <>
      <circle cx="11" cy="9" r="5.5" />
      <path d="M8 18.5c0-2 1.3-3 3-3s3 1 3 3" />
    </>
  ),
  chest: (
    <>
      <path d="M6 5.5h10l-1.5 9a3.5 3.5 0 0 1-7 0Z" />
      <path d="M11 5.5v4" />
    </>
  ),
  gut: (
    <>
      <ellipse cx="11" cy="11" rx="5.5" ry="6.5" />
      <path d="M8 11c2-1.5 4 1.5 6 0" />
    </>
  ),
  joints: (
    <>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="15" cy="15" r="2.5" />
      <path d="M9 9l4 4" />
    </>
  ),
  skin: (
    <>
      <path d="M5 6.5c4-3 8-3 12 0v9c-4 3-8 3-12 0Z" />
      <path d="M9 10.5h.01M13 12.5h.01" />
    </>
  ),
};

interface RegionGlyphProps {
  region: RegionId;
}

function RegionGlyph({region}: RegionGlyphProps) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {REGION_PATH[region]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DAY LOAD RING — 24px SVG in the navBar center slot; arc =
// min(daySum, 50)/50 in BRAND_ACCENT over a var(--color-border) track.
// 200ms stroke transition (instant under reduced motion). role=img with
// exact numbers; NOT a live region — the toastDock is the announcer.
// ---------------------------------------------------------------------------

const RING_R = 10.5; // 24px box, strokeWidth 3 → r = (24 − 3) / 2
const RING_C = 2 * Math.PI * RING_R; // ≈ 65.97

interface DayLoadRingProps {
  sum: number;
}

function DayLoadRing({sum}: DayLoadRingProps) {
  const pct = Math.min(sum, RING_CAP) / RING_CAP;
  return (
    <span role="img" aria-label={\`Day load \${Math.min(sum, RING_CAP)} of \${RING_CAP}\`} style={{display: 'grid', placeItems: 'center', flexShrink: 0}}>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx={12} cy={12} r={RING_R} stroke="var(--color-border)" strokeWidth={3} />
        <circle
          cx={12}
          cy={12}
          r={RING_R}
          stroke={BRAND_ACCENT}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - pct)}
          transform="rotate(-90 12 12)"
          className="slo-ring-arc"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// REGION INTENSITY STRIP — 5 flex:1 64px filter-button cells; fill
// tinted by region max via the SEV ramp at 18% over the card; the whole
// 64px cell is the filter button (≥44px ✓, aria-pressed).
// ---------------------------------------------------------------------------

interface RegionStripProps {
  maxMap: Record<RegionId, number>;
  activeFilter: RegionId | null;
  onToggle: (region: RegionId) => void;
}

function RegionIntensityStrip({maxMap, activeFilter, onToggle}: RegionStripProps) {
  return (
    <div style={styles.strip} role="group" aria-label="Filter by body region">
      {REGION_ORDER.map(region => {
        const max = maxMap[region];
        const pressed = activeFilter === region;
        return (
          <button
            key={region}
            type="button"
            className="slo-btn slo-focusable"
            aria-pressed={pressed}
            aria-label={\`\${REGION_LABEL[region]}, max severity \${max > 0 ? max : 'none'} — filter\`}
            style={{
              ...styles.regionCell,
              ...(max > 0 ? {background: sevTint(max)} : null),
              ...(pressed ? styles.regionCellOn : null),
            }}
            onClick={() => onToggle(region)}>
            <span style={styles.regionGlyph}>
              <RegionGlyph region={region} />
            </span>
            <span style={styles.regionLabel}>{REGION_LABEL[region]}</span>
            <span style={styles.regionMax}>{max > 0 ? max : '–'}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DAY SPINE — 768px 24h rail. Beads are 44×44 buttons; press-and-slide
// (8px slop, 12px/detent) live-retunes severity through onDragSev; a
// plain tap (no slop exceeded) opens the edit sheet. Every bead's
// gesture has the SeverityStepper as its non-gesture mirror in the sheet.
// ---------------------------------------------------------------------------

const HOUR_MARKS = [0, 3, 6, 9, 12, 15, 18, 21];
const HOUR_MARK_LABEL: Record<number, string> = {
  0: '12A',
  3: '3',
  6: '6',
  9: '9',
  12: '12P',
  15: '3',
  18: '6',
  21: '9',
};

interface BeadButtonProps {
  entry: JournalEntry;
  top: number;
  lane: 1 | 2;
  liveSev: number;
  dimmed: boolean;
  onTap: (entryId: string, opener: HTMLElement) => void;
  onDragSev: (entryId: string, startSev: number, sev: number) => void;
  onDragCommit: (entryId: string) => void;
}

function BeadButton({entry, top, lane, liveSev, dimmed, onTap, onDragSev, onDragCommit}: BeadButtonProps) {
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const laneOffset = lane === 2 ? LANE2_OFFSET : 0;
  const diameter = 12 + liveSev * 2; // sev2 → 16px … sev10 → 32px
  const fill = SEV_RAMP[liveSev - 1];

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startYRef.current = event.clientY;
    draggingRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dy = startYRef.current - event.clientY; // up = positive = +sev
    // 8px pre-slop before capture so plain taps still open the sheet.
    if (!draggingRef.current && Math.abs(dy) <= 8) return;
    draggingRef.current = true;
    const detents = Math.trunc((dy - Math.sign(dy) * 8) / 12); // 12px per detent
    const sev = Math.max(1, Math.min(10, entry.severity + detents));
    if (sev !== liveSev) onDragSev(entry.id, entry.severity, sev);
  };
  const onPointerUp = () => {
    if (draggingRef.current) onDragCommit(entry.id);
  };
  const onClick = (event: {currentTarget: HTMLElement}) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      return;
    }
    onTap(entry.id, event.currentTarget);
  };

  return (
    <button
      type="button"
      className="slo-btn slo-focusable"
      aria-label={\`\${REGION_LABEL[entry.region]}, severity \${liveSev}, \${entry.startLabel}\`}
      aria-hidden={dimmed || undefined}
      tabIndex={dimmed ? -1 : 0}
      style={{
        ...styles.beadBtn,
        left: RAIL_X + laneOffset - 22,
        top: top - 22,
        opacity: dimmed ? 0.2 : 1,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}>
      <span
        className="slo-anim"
        style={{...styles.bead, width: diameter, height: diameter, background: fill}}
        aria-hidden
      />
    </button>
  );
}

interface DaySpineProps {
  layout: Array<{entry: JournalEntry; top: number; lane: 1 | 2}>;
  liveSevFor: (entry: JournalEntry) => number;
  regionFilter: RegionId | null;
  onTap: (entryId: string, opener: HTMLElement) => void;
  onDragSev: (entryId: string, startSev: number, sev: number) => void;
  onDragCommit: (entryId: string) => void;
}

function DaySpine({layout, liveSevFor, regionFilter, onTap, onDragSev, onDragCommit}: DaySpineProps) {
  // Label collision pass: the lane-2 bead shift disambiguates beads, but
  // two-line label blocks (~37px tall) still overlap when bead centers
  // are <40px apart (e5 450px vs e6 466px) — colliding labels keep the
  // +28px lane indent AND stack with a 40px minimum vertical separation.
  const labelTops: number[] = [];
  for (const item of layout) {
    const prev = labelTops[labelTops.length - 1];
    labelTops.push(prev != null && item.top - prev < 40 ? prev + 40 : item.top);
  }
  // A lane-2 bead (44×44 hit at x≈81) reaches into the x=76 label
  // column, so every label in its vertical neighborhood indents with the
  // cluster (spec: 'label indents with it').
  const labelLefts = layout.map(({lane}, index) =>
    lane === 2 || layout.some((other, j) => j !== index && other.lane === 2 && Math.abs(labelTops[index] - other.top) < 40)
      ? 76 + LANE2_OFFSET
      : 76,
  );
  return (
    <div style={styles.spine}>
      {HOUR_MARKS.map(hour => (
        <span key={hour} aria-hidden>
          <span style={{...styles.hourLabel, top: hour * HOUR_PX - (hour === 0 ? 0 : 6)}}>
            {HOUR_MARK_LABEL[hour]}
          </span>
          <span style={{...styles.hourTick, top: hour * HOUR_PX}} />
        </span>
      ))}
      <span style={styles.rail} aria-hidden />
      {/* Tails under beads under labels — tails first so beads overlay. */}
      {layout.map(({entry, top, lane}) => {
        const dimmed = regionFilter != null && entry.region !== regionFilter;
        const laneOffset = lane === 2 ? LANE2_OFFSET : 0;
        const tailLen = (entry.durationMin * HOUR_PX) / 60; // 90m→48px etc.
        return tailLen > 0 ? (
          <span
            key={\`tail-\${entry.id}\`}
            aria-hidden
            style={{
              ...styles.tail,
              left: RAIL_X + laneOffset - 2,
              top,
              height: tailLen,
              background: SEV_RAMP[liveSevFor(entry) - 1],
              opacity: dimmed ? 0.2 : 1,
            }}
          />
        ) : null;
      })}
      {layout.map(({entry, top, lane}) => (
        <BeadButton
          key={entry.id}
          entry={entry}
          top={top}
          lane={lane}
          liveSev={liveSevFor(entry)}
          dimmed={regionFilter != null && entry.region !== regionFilter}
          onTap={onTap}
          onDragSev={onDragSev}
          onDragCommit={onDragCommit}
        />
      ))}
      {layout.map(({entry}, index) => {
        const dimmed = regionFilter != null && entry.region !== regionFilter;
        // Label block at x=76 (collision clusters indent to 104).
        const left = labelLefts[index];
        return (
          <span
            key={\`label-\${entry.id}\`}
            style={{...styles.entryLabel, left, top: labelTops[index], opacity: dimmed ? 0.2 : 1}}
            aria-hidden>
            <span style={styles.entryText}>
              <span style={styles.entryRegion}>{REGION_LABEL[entry.region]}</span>
              <span style={styles.entryTime}>{entry.startLabel}</span>
            </span>
            <span style={styles.entrySev}>{liveSevFor(entry)}</span>
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FACTOR CHIP MATRIX — chips with live count + proportional 4px
// co-occurrence bar (width = count/maxCount of the VISIBLE entry set).
// Chips that never co-occur with the active region filter drop to 40%
// opacity + aria-disabled (filter 'chest' → only Stress stays lit).
// ---------------------------------------------------------------------------

interface FactorChipMatrixProps {
  counts: Record<FactorId, number>;
  visibleTotal: number;
  filterActive: boolean;
  onChipTap: (factor: FactorId) => void;
}

function FactorChipMatrix({counts, visibleTotal, filterActive, onChipTap}: FactorChipMatrixProps) {
  const maxCount = Math.max(1, ...FACTOR_ORDER.map(factor => counts[factor]));
  return (
    <div style={styles.chipsWrap}>
      {FACTOR_ORDER.map(factor => {
        const count = counts[factor];
        const dimmed = filterActive && count === 0;
        return (
          <span key={factor} style={styles.chipHit}>
            <button
              type="button"
              className="slo-btn slo-focusable"
              aria-disabled={dimmed}
              aria-label={\`\${FACTOR_LABEL[factor]}, \${count} of \${visibleTotal} entries\`}
              style={{...styles.chip, ...(dimmed ? styles.chipDim : null)}}
              onClick={() => {
                if (!dimmed) onChipTap(factor);
              }}>
              <span style={styles.chipTop}>
                <span style={styles.chipLabel}>{FACTOR_LABEL[factor]}</span>
                <span style={styles.chipCount}>{count}</span>
              </span>
              <span style={styles.chipBarTrack} aria-hidden>
                {count > 0 ? (
                  <span
                    className="slo-anim"
                    style={{...styles.chipBarFill, width: \`\${(count / maxCount) * 100}%\`, display: 'block'}}
                  />
                ) : null}
              </span>
            </button>
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEPPER — 96×32 minus|plus track + adjacent spinbutton value (the
// mandatory non-gesture mirror of press-and-slide when used for
// severity). Halves get 44px hits via the wrapper's block padding;
// ArrowUp/ArrowDown step the focused value.
// ---------------------------------------------------------------------------

interface StepperProps {
  label: string;
  valueText: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}

function Stepper({label, valueText, value, min, max, step, onChange}: StepperProps) {
  const canDec = value - step >= min;
  const canInc = value + step <= max;
  const clamp = (next: number) => Math.max(min, Math.min(max, next));
  return (
    <span style={styles.stepperRow}>
      <span
        role="spinbutton"
        tabIndex={0}
        className="slo-focusable"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        style={styles.stepperValue}
        onKeyDown={event => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            onChange(clamp(value + step));
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(clamp(value - step));
          }
        }}>
        {valueText}
      </span>
      <span style={styles.stepperHit}>
        <span style={styles.stepper}>
          <button
            type="button"
            className="slo-btn"
            aria-label={\`Decrease \${label.toLowerCase()}\`}
            disabled={!canDec}
            style={{...styles.stepperHalf, ...(canDec ? null : styles.stepperHalfDisabled)}}
            onClick={() => onChange(clamp(value - step))}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <span style={styles.stepperDivider} aria-hidden />
          <button
            type="button"
            className="slo-btn"
            aria-label={\`Increase \${label.toLowerCase()}\`}
            disabled={!canInc}
            style={{...styles.stepperHalf, ...(canInc ? null : styles.stepperHalfDisabled)}}
            onClick={() => onChange(clamp(value + step))}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag is garnish, >120px past medium closes),
// 52px header with 44×44 X, focus-trapped dialog.
// ---------------------------------------------------------------------------

interface SheetShellProps {
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

function SheetShell({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetShellProps) {
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
      className="slo-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="slo-btn slo-focusable"
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
        <button type="button" className="slo-btn slo-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileSymptomDayJournalTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // SINGLE STATE OWNER — journalStore.
  const [store, setStore] = useState<JournalStore>(INITIAL_STORE);
  const {dayId, sheet, toast, drag} = store;

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  const toastOf = (msg: string, undo: ToastState['undo'] = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };

  // THE ONE ENTRY MUTATOR — every severity commit, sheet save, and undo
  // restore flows through here (or through the delete/insert splices
  // that snapshot for it).
  const update = useCallback((entryId: string, patch: Partial<JournalEntry>) => {
    setStore(prev => ({
      ...prev,
      entriesByDay: {
        ...prev.entriesByDay,
        [prev.dayId]: prev.entriesByDay[prev.dayId].map(entry =>
          entry.id === entryId ? {...entry, ...patch} : entry,
        ),
      },
    }));
  }, []);

  // DERIVED — pure fns over entriesByDay[dayId]; the drag override is
  // applied FIRST so ring, cells, labels, and caption all retune on
  // every detent crossing.
  const rawEntries = store.entriesByDay[dayId];
  const entries =
    drag == null ? rawEntries : rawEntries.map(entry => (entry.id === drag.entryId ? {...entry, severity: drag.sev} : entry));
  const regionFilter = store.regionFilterByDay[dayId];
  const visibleEntries = regionFilter == null ? entries : entries.filter(entry => entry.region === regionFilter);
  const sum = daySum(entries);
  const maxMap = regionMaxMap(entries);
  const counts = factorCounts(visibleEntries);
  const worst = worstHour(entries);
  const layout = spineLayout(entries);
  const dayIndex = DAY_ORDER.indexOf(dayId);
  const liveSevFor = (entry: JournalEntry) => entry.severity;

  // Sheet-draft projection — the live readout row recomputes worst hour
  // with the draft applied (mid-step, mid-drag).
  const draftEntries =
    !sheet.open
      ? entries
      : sheet.mode === 'edit' && sheet.entryId != null
        ? entries.map(entry =>
            entry.id === sheet.entryId
              ? {...entry, ...sheet.draft, startLabel: fmtTime(sheet.draft.startMin)}
              : entry,
          )
        : [...entries, {id: 'draft', ...sheet.draft, startLabel: fmtTime(sheet.draft.startMin)}];
  const draftWorst = worstHour(draftEntries);
  const draftSum = daySum(draftEntries);

  // FOCUS — into the sheet on open with preventScroll (amendment: plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (sheet.open) sheetRef.current?.focus({preventScroll: true});
  }, [sheet.open]);

  // Escape closes the topmost overlay — the sheet is the only layer.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (sheet.open) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet.open]);

  // HANDLERS ------------------------------------------------------------

  const setSheet = (patch: Partial<SheetState>) => setStore(prev => ({...prev, sheet: {...prev.sheet, ...patch}}));

  const goDay = (delta: number) => {
    const next = DAY_ORDER[dayIndex + delta];
    if (next == null) return;
    // regionFilter is per-day keyed — switching days never resets it.
    setStore(prev => ({...prev, dayId: next, drag: null}));
  };

  const toggleFilter = (region: RegionId) => {
    setStore(prev => {
      const current = prev.regionFilterByDay[prev.dayId];
      const next = current === region ? null : region;
      const dayEntries = prev.entriesByDay[prev.dayId];
      const shown = next == null ? dayEntries.length : dayEntries.filter(entry => entry.region === next).length;
      return {
        ...prev,
        regionFilterByDay: {...prev.regionFilterByDay, [prev.dayId]: next},
        toast: toastOf(
          next == null
            ? \`Filter cleared — \${shown} entries shown\`
            : \`\${shown} \${REGION_LABEL[next].toLowerCase()} \${shown === 1 ? 'entry' : 'entries'} shown\`,
        ),
      };
    });
  };

  // Press-and-slide — live detents write drag; pointerup commits via
  // update(entryId, {severity}) and the toast announces.
  const onDragSev = (entryId: string, startSev: number, sev: number) => {
    setStore(prev => ({...prev, drag: {entryId, startSev, sev}}));
  };
  const onDragCommit = (entryId: string) => {
    setStore(prev => {
      if (prev.drag == null || prev.drag.entryId !== entryId) return {...prev, drag: null};
      const sev = prev.drag.sev;
      const entry = prev.entriesByDay[prev.dayId].find(item => item.id === entryId);
      return {
        ...prev,
        drag: null,
        entriesByDay: {
          ...prev.entriesByDay,
          [prev.dayId]: prev.entriesByDay[prev.dayId].map(item => (item.id === entryId ? {...item, severity: sev} : item)),
        },
        toast: toastOf(\`\${entry == null ? 'Entry' : REGION_LABEL[entry.region]} severity set to \${sev}\`),
      };
    });
  };

  const openCreateSheet = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    setSheet({
      open: true,
      detent: 'medium',
      mode: 'create',
      entryId: null,
      draft: EMPTY_DRAFT,
      timePanelOpen: false,
      durationPanelOpen: false,
    });
  };

  const openEditSheet = (entryId: string, opener: HTMLElement) => {
    const entry = rawEntries.find(item => item.id === entryId);
    if (entry == null) return;
    sheetOpenerRef.current = opener;
    setSheet({
      open: true,
      detent: 'medium',
      mode: 'edit',
      entryId,
      draft: {
        region: entry.region,
        severity: entry.severity,
        startMin: entry.startMin,
        durationMin: entry.durationMin,
        factors: entry.factors,
        note: entry.note,
      },
      timePanelOpen: false,
      durationPanelOpen: false,
    });
  };

  // Focus restores to the opener on EVERY close path (X, scrim, Escape,
  // save, delete).
  const closeSheet = () => {
    setSheet({open: false, timePanelOpen: false, durationPanelOpen: false});
    sheetOpenerRef.current?.focus();
  };

  const setDraft = (patch: Partial<DraftEntry>) => setSheet({draft: {...sheet.draft, ...patch}});

  const commitSheet = () => {
    setStore(prev => {
      const draft = prev.sheet.draft;
      const startLabel = fmtTime(draft.startMin);
      if (prev.sheet.mode === 'edit' && prev.sheet.entryId != null) {
        const id = prev.sheet.entryId;
        return {
          ...prev,
          sheet: {...prev.sheet, open: false},
          entriesByDay: {
            ...prev.entriesByDay,
            [prev.dayId]: prev.entriesByDay[prev.dayId].map(entry =>
              entry.id === id ? {...entry, ...draft, startLabel} : entry,
            ),
          },
          toast: toastOf(\`\${REGION_LABEL[draft.region]} entry saved · severity \${draft.severity}\`),
        };
      }
      const nextCount = prev.newCount + 1;
      const created: JournalEntry = {id: \`n\${nextCount}\`, ...draft, startLabel};
      const nextEntries = [...prev.entriesByDay[prev.dayId], created];
      return {
        ...prev,
        newCount: nextCount,
        sheet: {...prev.sheet, open: false},
        entriesByDay: {...prev.entriesByDay, [prev.dayId]: nextEntries},
        toast: toastOf(\`Entry logged — day load \${Math.min(daySum(nextEntries), RING_CAP)} of \${RING_CAP}\`),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // DELETE — reversible → executes immediately (undoOverConfirm, no
  // confirm dialog); the untimed Undo snapshot restores the exact array
  // position and every aggregate re-derives.
  const deleteEntry = () => {
    setStore(prev => {
      const id = prev.sheet.entryId;
      if (id == null) return prev;
      const dayEntries = prev.entriesByDay[prev.dayId];
      const index = dayEntries.findIndex(entry => entry.id === id);
      if (index < 0) return prev;
      const entry = dayEntries[index];
      return {
        ...prev,
        sheet: {...prev.sheet, open: false},
        entriesByDay: {...prev.entriesByDay, [prev.dayId]: dayEntries.filter(item => item.id !== id)},
        toast: toastOf('Entry deleted', {dayId: prev.dayId, index, entry}),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  const undoDelete = () => {
    setStore(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      const dayEntries = [...prev.entriesByDay[undo.dayId]];
      dayEntries.splice(undo.index, 0, undo.entry);
      return {
        ...prev,
        entriesByDay: {...prev.entriesByDay, [undo.dayId]: dayEntries},
        toast: toastOf('Restored'),
      };
    });
  };

  const chipTap = (factor: FactorId) => {
    setStore(prev => {
      const filter = prev.regionFilterByDay[prev.dayId];
      const dayEntries = prev.entriesByDay[prev.dayId];
      const visible = filter == null ? dayEntries : dayEntries.filter(entry => entry.region === filter);
      const count = visible.filter(entry => entry.factors.includes(factor)).length;
      return {...prev, toast: toastOf(\`\${FACTOR_LABEL[factor]} tagged on \${count} of \${visible.length} entries\`)};
    });
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheet.open ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const sheetSaveLabel = sheet.mode === 'edit' ? 'Save' : 'Add entry';

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SELO_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="slo-btn slo-focusable"
              style={{...styles.iconBtn, ...(dayIndex === 0 ? styles.iconBtnDisabled : null)}}
              aria-label="Previous day"
              disabled={dayIndex === 0}
              onClick={() => goDay(-1)}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
            </button>
          </div>
          <div style={styles.navCenter}>
            <h1 style={styles.navTitle}>
              <span className="slo-vh">Selo symptom journal — </span>
              {DAY_LABEL[dayId]}
            </h1>
            <DayLoadRing sum={sum} />
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="slo-btn slo-focusable"
              style={{...styles.iconBtn, ...(dayIndex === DAY_ORDER.length - 1 ? styles.iconBtnDisabled : null)}}
              aria-label="Next day"
              disabled={dayIndex === DAY_ORDER.length - 1}
              onClick={() => goDay(1)}>
              <Icon icon={ChevronRightIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <RegionIntensityStrip maxMap={maxMap} activeFilter={regionFilter} onToggle={toggleFilter} />

          <h2 style={styles.sectionHeader}>Day spine</h2>
          <div style={styles.listCard}>
            {entries.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyCircle}>
                  <Icon icon={ActivityIcon} size="lg" color="inherit" />
                </span>
                <span style={styles.emptyTitle}>No symptoms logged</span>
                <span style={styles.emptyBody}>Entries you log appear on the day spine.</span>
                <button
                  type="button"
                  className="slo-btn slo-focusable"
                  style={styles.emptyCta}
                  onClick={event => openCreateSheet(event.currentTarget)}>
                  Log symptom
                </button>
              </div>
            ) : (
              <DaySpine
                layout={layout}
                liveSevFor={liveSevFor}
                regionFilter={regionFilter}
                onTap={openEditSheet}
                onDragSev={onDragSev}
                onDragCommit={onDragCommit}
              />
            )}
          </div>

          <h2 style={styles.sectionHeader}>Factors</h2>
          <FactorChipMatrix
            counts={counts}
            visibleTotal={visibleEntries.length}
            filterActive={regionFilter != null}
            onChipTap={chipTap}
          />

          {entries.length > 0 && worst != null ? (
            <p style={styles.caption}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · worst hour {fmtHour(worst.hour)}
            </p>
          ) : null}
          <div style={styles.bottomPad} />
        </main>

        {/* Sticky FAB dock — the create verb lives in the thumb zone. */}
        <div style={styles.fabDock}>
          <button
            type="button"
            className="slo-btn slo-focusable"
            style={styles.fab}
            aria-label="Log symptom"
            onClick={event => openCreateSheet(event.currentTarget)}>
            <Icon icon={PlusIcon} size="md" color="inherit" />
          </button>
        </div>

        {/* The single polite live region — announces every mutation,
            severity commit, and filter result. Undo persists untimed. */}
        <div style={styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast} className="slo-fade">
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="slo-btn slo-focusable" style={styles.toastUndo} onClick={undoDelete}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {sheet.open ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {sheet.open ? (
          <SheetShell
            titleId="slo-sheet-title"
            title={sheet.mode === 'edit' ? 'Edit symptom' : 'Log symptom'}
            detent={sheet.detent}
            onDetentChange={detent => setSheet({detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="slo-btn slo-focusable" style={styles.primaryBtn} onClick={commitSheet}>
                {sheetSaveLabel}
              </button>
            }>
            {/* Region picker — same 5-cell strip anatomy, radiogroup. */}
            <div
              role="radiogroup"
              aria-label="Body region"
              style={styles.pickerRow}
              onKeyDown={event => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                event.preventDefault();
                const index = REGION_ORDER.indexOf(sheet.draft.region);
                const next = REGION_ORDER[(index + (event.key === 'ArrowRight' ? 1 : REGION_ORDER.length - 1)) % REGION_ORDER.length];
                setDraft({region: next});
              }}>
              {REGION_ORDER.map(region => {
                const checked = sheet.draft.region === region;
                return (
                  <button
                    key={region}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    className="slo-btn slo-focusable"
                    tabIndex={checked ? 0 : -1}
                    style={{
                      ...styles.regionCell,
                      ...(checked ? {background: sevTint(sheet.draft.severity), ...styles.regionCellOn} : null),
                    }}
                    onClick={() => setDraft({region})}>
                    <span style={styles.regionGlyph}>
                      <RegionGlyph region={region} />
                    </span>
                    <span style={styles.regionLabel}>{REGION_LABEL[region]}</span>
                    <span style={styles.regionMax}>{checked ? sheet.draft.severity : ''}</span>
                  </button>
                );
              })}
            </div>

            {/* SeverityStepper — the identical update path as the bead
                press-and-slide gesture. */}
            <div style={styles.fieldBlock}>
              <span style={styles.fieldLabel} id="slo-sev-label">
                Severity
              </span>
              <Stepper
                label="Severity"
                valueText={String(sheet.draft.severity)}
                value={sheet.draft.severity}
                min={1}
                max={10}
                step={1}
                onChange={severity => setDraft({severity})}
              />
            </div>

            <div style={styles.fieldBlock}>
              <div style={styles.utilityRow}>
                <span style={styles.utilityLabel}>Time</span>
                <button
                  type="button"
                  className="slo-btn slo-focusable"
                  style={styles.pillBtn}
                  aria-expanded={sheet.timePanelOpen}
                  onClick={() => setSheet({timePanelOpen: !sheet.timePanelOpen, durationPanelOpen: false})}>
                  {fmtTime(sheet.draft.startMin)}
                </button>
              </div>
              {sheet.timePanelOpen ? (
                <div style={styles.inlinePanel}>
                  <div style={styles.inlinePanelRow}>
                    <span style={styles.inlinePanelLabel}>Hour</span>
                    <Stepper
                      label="Hour"
                      valueText={fmtHour(Math.floor(sheet.draft.startMin / 60))}
                      value={Math.floor(sheet.draft.startMin / 60)}
                      min={0}
                      max={23}
                      step={1}
                      onChange={hour => setDraft({startMin: hour * 60 + (sheet.draft.startMin % 60)})}
                    />
                  </div>
                  <div style={styles.inlinePanelRow}>
                    <span style={styles.inlinePanelLabel}>Minutes</span>
                    <Stepper
                      label="Minutes"
                      valueText={String(sheet.draft.startMin % 60).padStart(2, '0')}
                      value={sheet.draft.startMin % 60}
                      min={0}
                      max={55}
                      step={5}
                      onChange={minute => setDraft({startMin: Math.floor(sheet.draft.startMin / 60) * 60 + minute})}
                    />
                  </div>
                </div>
              ) : null}
              <div style={styles.utilityRow}>
                <span style={styles.utilityLabel}>Duration</span>
                <button
                  type="button"
                  className="slo-btn slo-focusable"
                  style={styles.pillBtn}
                  aria-expanded={sheet.durationPanelOpen}
                  onClick={() => setSheet({durationPanelOpen: !sheet.durationPanelOpen, timePanelOpen: false})}>
                  {sheet.draft.durationMin === 0 ? 'Momentary' : \`\${sheet.draft.durationMin} min\`}
                </button>
              </div>
              {sheet.durationPanelOpen ? (
                <div style={styles.inlinePanel}>
                  <div style={styles.inlinePanelRow}>
                    <span style={styles.inlinePanelLabel}>Duration</span>
                    <Stepper
                      label="Duration"
                      valueText={sheet.draft.durationMin === 0 ? '0 min' : \`\${sheet.draft.durationMin} min\`}
                      value={sheet.draft.durationMin}
                      min={0}
                      max={240}
                      step={15}
                      onChange={durationMin => setDraft({durationMin})}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div style={styles.fieldBlock}>
              <span style={styles.fieldLabel}>Factors</span>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                {FACTOR_ORDER.map(factor => {
                  const pressed = sheet.draft.factors.includes(factor);
                  return (
                    <button
                      key={factor}
                      type="button"
                      className="slo-btn slo-focusable"
                      aria-pressed={pressed}
                      style={{...styles.factorToggle, ...(pressed ? styles.factorToggleOn : null)}}
                      onClick={() =>
                        setDraft({
                          factors: pressed
                            ? sheet.draft.factors.filter(item => item !== factor)
                            : [...sheet.draft.factors, factor],
                        })
                      }>
                      {FACTOR_LABEL[factor]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel} htmlFor="slo-note">
                Note
              </label>
              {/* e3's 58-char note single-line ellipsizes here (stress 2). */}
              <input
                id="slo-note"
                style={styles.noteInput}
                type="text"
                value={sheet.draft.note}
                placeholder="What did it feel like?"
                onChange={event => setDraft({note: event.target.value})}
              />
            </div>

            {/* Live readout — recomputes mid-drag and mid-step from the
                same derived fns as the caption. */}
            <p style={styles.readoutRow}>
              {draftWorst != null ? \`Worst hour: \${fmtHour(draftWorst.hour)} · load \${draftWorst.load}\` : 'No entries yet'}
              {\` · day load \${Math.min(draftSum, RING_CAP)} of \${RING_CAP}\`}
            </p>

            {sheet.mode === 'edit' ? (
              <>
                {/* 24px dead space — destructive is never adjacent to Save. */}
                <div style={styles.deleteSpacer} aria-hidden />
                <button type="button" className="slo-btn slo-focusable" style={styles.deleteBtn} onClick={deleteEntry}>
                  Delete entry
                </button>
              </>
            ) : null}
          </SheetShell>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};