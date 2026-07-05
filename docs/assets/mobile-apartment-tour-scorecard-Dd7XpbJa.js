var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — four toured units (u12 / u4b / u7a /
 *   u2c; u7a ships the long-name stress 'Unit PH-2 · The Wexford at Barrow
 *   Crossing'), six weighted criteria (ΣW = 2+3+1+2+2+1 = 11, maxPts =
 *   5×11 = 55), ratings that cross-check to composites 82 / 80 / 69 / 71
 *   (u2c vetoed 'Mold smell' → semantic 0), notes for u12 (2) and u4b (1)
 *   with u7a and u2c true-empty. No Date.now(), no Math.random(), no
 *   network media — swatches are fixed id-derived CSS gradients.
 * @output Tourmark — Apartment Tour Scorecard: a 390px MOBILE one-thumb
 *   scorecard. NavBar (Tourmark clipboard-ajar mark · 'Unit 4B' + 28px
 *   compositePill '80' · SlidersHorizontal + RefreshCw), three tabs
 *   (Tour / Compare / Notes). Tour: 60px LeaderBanner (crossfades on rank
 *   flips), 36px unit chips in 44px hits, six 96px WeightedCriterionRows
 *   (five 44×44 rating radios + a WeightTickStrip readout button), three
 *   VetoChip switches, live '6 criteria · 44 / 55 pts' caption. A sticky
 *   bottom-64 CompareStrip re-ranks four gradient-capped chips with 200ms
 *   transform swaps. Signature move: the two-detent weight sheet's 128px
 *   snap-drag tick tracks (+ stepper + spinbutton button path) write ONE
 *   weights map — dragging Natural light 2x→3x flips u4b past u12 live in
 *   the SheetLeaderboardMirror, recounts the compositePill 80→82→83 (at
 *   4x), and the single toastDock announces the settled composite. Vetoes
 *   execute immediately with exact-prior-state Undo; refresh swaps six
 *   96px skeletons that resolve on the next user interaction, never a
 *   timer.
 * @position Page template; emitted by \`astryx template
 *   mobile-apartment-tour-scorecard\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, toast-in-lock)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the weight sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables — comparison is the sticky
 *   CompareStrip plus 72px leaderboard rows.
 * Color policy: token-pure chrome. ONE quarantined brand hex family:
 *   BRAND_ACCENT light-dark(#C4552D, #E8916B) for fills, with separate
 *   BRAND_TEXT / BRAND_FILL_TEXT pairs (contrast math at each
 *   declaration, per the brand-fill-vs-brand-text house rule). Sanctioned
 *   non-brand literals: ERROR_FILL_TEXT over var(--color-error) veto
 *   fills, SWITCH_REST_BORDER for rest-state switch boundaries (≥3:1 vs
 *   their actual card surface, per the mobile amendments), and the
 *   standard SCRIM pair.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', blur 86% + hairline ALWAYS
 *   ON — declared choice, no scroll wiring); leaderBanner 60px; unit chip
 *   rail 52px block (36px chips in 44px hits); sectionHeader 13/600
 *   uppercase 0.06em at 32px inset, 20px top / 8px bottom; criterion rows
 *   96px (pad 12/16: 20px line1 + 8px gap + 44px RatingTapStrip);
 *   dealbreaker chips 36px in 44px hits; CompareStrip sticky bottom 64
 *   z19 84px; tabBar sticky bottom 0 z20 exactly 64px (24px icon over
 *   11/500 label, 4px gap); toastDock sticky-in-flow height-0 anchor
 *   (bottom 160 above the Tour strip / 76 elsewhere, marginInline 16) —
 *   shell-absolute bottom 76 ONLY during sheet scroll-lock; sheet detents
 *   55% / calc(100% − 56px), 24px grabber zone with 36×5 pill, 52px
 *   header, 56px SheetLeaderboardMirror, 64px weight rows. TYPE (Figtree
 *   via --font-family-body): 22/700 tab titles · 17/600 nav title + pill
 *   · 16/400–500 body floor · 13 secondary · 11/500 floor; tabular-nums
 *   on every score, weight, and pts. Touch: every target ≥44×44 with
 *   ≥8px clearance or merged full-row; every gesture (tick-track drag,
 *   sheet drag) has a visible button path (stepper + spinbutton, grabber
 *   click + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: rating strip = five flex '1 1
 *   0' minWidth-44 buttons (236px at 320 inside 300px of card ✓); the
 *   inline WeightTickStrip readout wraps below the strip (row 96→116px)
 *   under 352px of CONTAINER width via a flexWrap guard; CompareStrip
 *   chips flex:1 minWidth 64 (4×64+3×8+32 = 312 ≤ 320 ✓); sheet weight
 *   rows are a fixed 128+96+40+16-gap = 312px cluster that centers wider;
 *   navBar title ellipsizes at maxWidth 200 (the pill never shrinks).
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport — the demo stage is ~1045px inside a
 *   1440px window). At ≥720px the shell becomes a centered 430px phone
 *   column (marginInline auto, borderInline hairline); no adaptive
 *   relayout — the scorecard anatomy is deliberately phone geometry.
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
  BarChart3Icon,
  ClipboardCheckIcon,
  CrownIcon,
  MinusIcon,
  OctagonXIcon,
  PlusIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  StickyNoteIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math in-line (mobile amendment: interactive boundaries and
// meaningful fills are checked against their ACTUAL surface).
// ---------------------------------------------------------------------------

// THE quarantined brand hex (Tourmark clay, per spec). As a FILL:
// #C4552D vs the white card ≈ 4.5:1 and vs the #EFF4FB body ≈ 4.3:1 (both
// clear the ≥3:1 boundary law); #E8916B vs the dark #1F1F22 card ≈ 6.8:1.
const BRAND_ACCENT = 'light-dark(#C4552D, #E8916B)';
// Brand-tinted TEXT (13px '10 pts' labels, pill numerals, active tab) —
// the fill hex alone is marginal for 13px text, so the light side deepens
// one step: #B44E29 on the white card ≈ 5.2:1, on the #EFF4FB body ≈
// 4.7:1; #E8916B on #1F1F22 ≈ 6.8:1. Doubles as the compositePill border
// (5.2:1 ≥ 3:1 vs its card surface).
const BRAND_TEXT = 'light-dark(#B44E29, #E8916B)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #C4552D ≈ 4.5:1 (spec's
// 4.6:1 claim, recomputed). Dark: white on #E8916B fails (~2.4:1), so the
// dark side flips to near-black clay — #2B1108 on #E8916B ≈ 7.2:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #2B1108)';
// 12% brand wash for the brand mark tile — decorative, behind an
// accent-colored glyph that itself passes.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Text/icon over a var(--color-error) fill (house error =
// light-dark(#E3193B, #F5394F)): #FFFFFF on #E3193B ≈ 4.7:1; white on
// #F5394F fails (~3.8:1), so dark flips to #2B0505 ≈ 4.8:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #2B0505)';
// Rest-state boundary for the OFF VetoChip (role=switch) — the amendment
// class: hairline/muted tokens are too faint for an interactive boundary.
// #8A8177 vs the white card ≈ 3.8:1; #A59A8C vs the dark #1F1F22 card ≈
// 6.0:1 — both ≥3:1 against the chip's actual card surface.
const SWITCH_REST_BORDER = 'light-dark(#8A8177, #A59A8C)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// Deterministic id-derived gradient swatches — fixed consts, no runtime
// hashing (spec's GradientSwatch table verbatim).
const UNIT_GRADIENTS: Record<string, string> = {
  u12: 'linear-gradient(135deg, #C4552D, #E8B44A)',
  u4b: 'linear-gradient(135deg, #2D6FC4, #4AC4A8)',
  u7a: 'linear-gradient(135deg, #7A4AC4, #C44A9E)',
  u2c: 'linear-gradient(135deg, #4A8C3F, #B0C44A)',
};

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings (2px var(--color-brand)
// offset 2 per the a11y plan), the visually-hidden h1, the shared 1.6s
// shimmer sweep, 200ms crossfade/slide, all collapsed under
// prefers-reduced-motion (shimmer REMOVED entirely, not just frozen).
// ---------------------------------------------------------------------------

const TOURMARK_CSS = \`
.tmk-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tmk-btn:disabled { cursor: default; }
.tmk-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.tmk-swap { transition: transform 200ms ease; }
.tmk-fade { transition: opacity 200ms ease; }
@keyframes tmk-cross {
  from { opacity: 0; }
  to { opacity: 1; }
}
.tmk-cross { animation: tmk-cross 200ms ease; }
@keyframes tmk-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.tmk-sheet-in { animation: tmk-sheet-in 240ms ease; }
@keyframes tmk-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(300%); }
}
.tmk-shimmer {
  position: relative;
  overflow: hidden;
}
.tmk-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 50%;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-text-secondary) 12%, transparent), transparent);
  animation: tmk-shimmer 1.6s linear infinite;
}
.tmk-vh {
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
  .tmk-swap, .tmk-fade { transition: none; }
  .tmk-cross, .tmk-sheet-in { animation: none; }
  .tmk-shimmer::after { display: none; animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — plain CSSProperties records; the binding mobile vocabulary
// (shell, navBar, tabBar, tabItem, sheetScrim, sheet, listCard, rowDivider,
// sectionHeader) keeps its standard names.
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
  // Scroll lock while the weight sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px CONTAINER width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, paddingInline 8, '1fr auto 1fr' grid,
  // blur surface, hairline ALWAYS ON (declared choice, no scroll wiring).
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
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  // 17/600 title, ellipsized at 200px max — the long-name stress unit
  // truncates HERE first; the pill never shrinks.
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // compositePill — 28px, radius 999, BRAND_TEXT border (≈5.2:1 vs card,
  // ≥3:1 boundary law), 17/700 tabular numeral.
  compositePill: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 10,
    borderRadius: 999,
    border: \`1px solid \${BRAND_TEXT}\`,
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_TEXT,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  pillStruck: {
    textDecoration: 'line-through',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // 22/700 visible tab titles (Compare / Notes); Tour's h1 is clipped —
  // the navBar unit title already owns that screen's first line.
  tabTitle: {
    margin: '16px 16px 0',
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  // LEADER BANNER — 60px listCard; content crossfades (tmk-cross) when the
  // derived leader flips.
  leaderBanner: {
    marginTop: 12,
    marginInline: 16,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  leaderIcon: {color: BRAND_TEXT, display: 'inline-flex', flexShrink: 0},
  leaderText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  leaderCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  leaderValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  leaderEmptyBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // UNIT CHIP RAIL — 52px block: 36px chips inside 44px-tall hits, 8px
  // gaps, horizontal scroll if the long-name chip overflows at 320.
  chipRail: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    marginTop: 12,
    overflowX: 'auto',
  },
  // Chips keep their intrinsic width (the long-name chip caps at 148 and
  // ellipsizes); the rail itself scrolls horizontally when four chips
  // exceed the stage, with the fourth chip peeking as the affordance.
  chipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
  },
  unitChip: {
    height: 36,
    display: 'block',
    lineHeight: '34px',
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border-emphasized, var(--color-border))',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    maxWidth: 148,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Active chip — BRAND_ACCENT fill + BRAND_FILL_TEXT (≈4.5:1 light /
  // 7.2:1 dark, math at the const).
  unitChipOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px inset (16 gutter + 16
  // card pad), 20px top / 8px bottom.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // WEIGHTED CRITERION ROW — 96px (pad 12/16): 20px line1 + 8px gap + 44px
  // line2; grows to ~116px when the readout wraps under 352px container.
  critRow: {
    minHeight: 96,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  critLine1: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  critLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Live contribution 'r×w = N pts' — 13/600 BRAND_TEXT tabular.
  critPts: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  critLine2: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // RatingTapStrip — five 44×44 real buttons (flex '1 1 0' minWidth 44).
  ratingGroup: {
    display: 'flex',
    gap: 4,
    flex: '1 1 auto',
    minWidth: 0,
  },
  ratingBtn: {
    flex: '1 1 0',
    minWidth: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
  },
  // Visible 36px pill inside the 44px hit; unselected = muted bg with the
  // 16/600 primary-text glyph carrying the ≥4.5:1 contrast (the fill is
  // passive; the numeral is the affordance).
  ratingPill: {
    width: '100%',
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  ratingPillOn: {
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // WeightTickStrip mini readout — a ≥44px button (bars 8×16 radius 2, 4px
  // gaps; filled ≤ weight in BRAND_ACCENT, rest muted — spec-declared
  // passive fill) + 11/500 '2x'.
  tickReadout: {
    minWidth: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 6,
    borderRadius: 10,
    flexShrink: 0,
  },
  tickBars: {display: 'flex', alignItems: 'flex-end', gap: 4},
  tickBar: {width: 8, height: 16, borderRadius: 2, background: 'var(--color-background-muted)'},
  tickBarOn: {background: BRAND_ACCENT},
  tickValue: {
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // DEALBREAKERS — 36px VetoChips in 44px hits, 8px gaps.
  vetoRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    paddingInline: 16,
  },
  vetoChip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: \`1px solid \${SWITCH_REST_BORDER}\`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // ON — var(--color-error) fill; text/icon ERROR_FILL_TEXT (4.7:1 light /
  // 4.8:1 dark, math at the const). Never color-alone: the OctagonX glyph
  // plus struck scores elsewhere carry the state.
  vetoChipOn: {
    border: '1px solid var(--color-error)',
    background: 'var(--color-error)',
    color: ERROR_FILL_TEXT,
  },
  // Terminal caption — 13/400 secondary, centered, 16px below the card.
  caption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETON — 96px rows with identical 12/16 padding (zero shift): 12px
  // label bar + 36px rating bar, muted bg radius 6, deterministic width
  // cycles 60/45/70 and 40/55/30.
  skeletonRow: {
    height: 96,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 12,
  },
  skeletonLabel: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skeletonStrip: {height: 36, borderRadius: 6, background: 'var(--color-background-muted)'},
  // COMPARE STRIP — sticky bottom 64 (on the tabBar), z19, 84px, blur +
  // top hairline; chips animate rank swaps via 200ms translateX.
  compareStrip: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 84,
    paddingInline: 16,
    display: 'flex',
    alignItems: 'center',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  compareLane: {position: 'relative', width: '100%', height: 64},
  // Each chip is absolutely positioned at lane-left and translated to its
  // rank slot: translateX(rank·100% + rank·8px) with width (100% − 24px)/4.
  compareChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'calc((100% - 24px) / 4)',
    minWidth: 64,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 12,
    paddingInline: 6,
  },
  chipCap: {height: 6, borderRadius: 2, width: '100%'},
  chipLabel: {
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipScore: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  },
  chipBarTrack: {
    height: 4,
    borderRadius: 2,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  chipBarFill: {height: '100%', borderRadius: 2, background: BRAND_ACCENT},
  // TAB BAR — sticky bottom 0, z20, exactly 64px; 24px icon over 11/500
  // label, 4px gap; active = BRAND_TEXT + 600.
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
  tabItemOn: {color: BRAND_TEXT, fontWeight: 600},
  // COMPARE TAB — 72px leaderboard rows.
  boardRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  boardRank: {
    width: 24,
    flexShrink: 0,
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  boardSwatch: {width: 40, height: 40, borderRadius: 12, flexShrink: 0},
  boardText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  boardName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  boardAddr: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  boardTrailing: {
    width: 72,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  boardScore: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  },
  boardBarTrack: {
    width: 64,
    height: 6,
    borderRadius: 2,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  struck: {textDecoration: 'line-through', color: 'var(--color-text-secondary)'},
  // NOTES TAB.
  noteRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  noteText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteMeta: {fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0},
  addNoteRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_TEXT,
  },
  // EMPTY STATE — maxWidth 280, centered, paddingBlock 48.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
  emptyTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 260,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 4,
  },
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16},
  emptyAction: {
    height: 36,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
  },
  // TOAST DOCK — sticky-in-flow height-0 anchor (the shell grows with
  // content, so shell-absolute would pin to the DOCUMENT bottom); pins 160
  // above the viewport bottom on Tour (64 tabBar + 84 strip + 12) and 76
  // elsewhere. Switches to shell-absolute bottom 76 ONLY while the sheet
  // scroll-locks the shell (then z45 so the announcement clears the z40
  // scrim — deviation from the spec's z30, which would bury it).
  toastAnchor: {
    position: 'sticky',
    zIndex: 30,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
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
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastLockedInner: {position: 'static'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInlineEnd: 16,
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
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
  // SheetLeaderboardMirror — 56px pinned under the header (the medium
  // detent covers the real strip); same rank selector, same 200ms swaps.
  mirror: {
    height: 56,
    flexShrink: 0,
    paddingInline: 16,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border)',
  },
  mirrorLane: {position: 'relative', width: '100%', height: 44},
  mirrorChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'calc((100% - 24px) / 4)',
    minWidth: 64,
    height: 44,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 10,
    paddingInline: 6,
  },
  mirrorCap: {height: 4, borderRadius: 2, width: '100%'},
  mirrorLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 0,
  },
  mirrorLabel: {
    fontSize: 11,
    fontWeight: 600,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mirrorScore: {
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  // Weight row — 64px: 13/600 label line over the 32px control cluster
  // (128px track + 96px stepper + 40px value + 16px gaps = 312px fixed,
  // space-between centers it wider).
  weightRow: {
    height: 64,
    paddingInline: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 5,
  },
  weightLabel: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  weightControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  // Drag track — four 32px snap zones (24×20 bars, radius 2, 4px gaps);
  // pointer drag is garnish, the stepper + spinbutton are the contract.
  // Four 32px zones × 32 = 128px; the 24×20 bar centers in each zone so
  // the visual 4px gaps come from the zone padding.
  weightTrack: {
    width: 128,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    touchAction: 'none',
    flexShrink: 0,
  },
  weightZoneBar: {
    width: 24,
    height: 20,
    borderRadius: 2,
    background: 'var(--color-background-muted)',
  },
  weightZoneBarOn: {background: BRAND_ACCENT},
  // 96×32 stepper — Minus/Plus halves (44×44 effective hits via padding),
  // exhausted half at 35% opacity.
  stepper: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperRule: {width: 1, background: 'var(--color-border)', marginBlock: 6},
  spinValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
    borderRadius: 6,
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual/derivable fields, cross-checked by hand:
// ΣW = 2+3+1+2+2+1 = 11, maxPts = 5×11 = 55. Ratings [light,noise,water,
// storage,kitchen,signal]: u12 [3,5,4,4,4,4] → 6+15+4+8+8+4 = 45 →
// round(45/55×100) = 82; u4b [5,4,3,4,4,3] → 10+12+3+8+8+3 = 44 → 80;
// u7a [4,3,5,3,3,4] → 8+9+5+6+6+4 = 38 → 69; u2c [3,4,2,5,3,3] →
// 6+12+2+10+6+3 = 39 → 71 raw, vetoed ('Mold smell' ON) → composite 0.
// Default ranking u12 82 › u4b 80 › u7a 69 › u2c 0 (struck 71);
// currentUnitId 'u4b' → navBar pill '80', caption '6 criteria · 44 / 55
// pts'. SIGNATURE MATH (weight sheet, light 2x→3x): ΣW = 12, max = 60 —
// u12 9+15+4+8+8+4 = 48 → 80; u4b 15+12+3+8+8+3 = 49 → round(81.67) = 82
// (u4b overtakes u12 mid-drag at 3x). At 4x: ΣW = 13, max = 65 — u12 51 →
// round(78.46) = 78; u4b 54 → round(83.08) = 83; u7a 46 → round(70.77) =
// 71; u2c raw 45 → 69 (still 0, vetoed). All-1x stress: ΣW = 6, max = 30 —
// u12 24 → 80; u4b 23 → round(76.67) = 77; u7a 22 → round(73.33) = 73;
// u2c raw 20 → round(66.67) = 67 (the spec's own recheck; its first '23'
// draft didn't reconcile — corrected here, law kept exact).
// ---------------------------------------------------------------------------

interface UnitFixture {
  id: string;
  name: string;
  bldg: string;
  addr: string;
}

// Stress fixture 1 — u7a ships the long name LIVE (per the stress plan; the
// fixture-plan's short 'Unit 7A' is superseded) to exercise the navBar
// 200px ellipsis, the 11px CompareChip label, and leaderboard truncation.
const U7A_LONG_NAME = 'Unit PH-2 · The Wexford at Barrow Crossing';

const UNITS: UnitFixture[] = [
  {id: 'u12', name: 'Unit 12', bldg: 'Maple Court', addr: '118 Maple Ct'},
  {id: 'u4b', name: 'Unit 4B', bldg: 'Maple Court', addr: '204 Birchline Ave'},
  {id: 'u7a', name: U7A_LONG_NAME, bldg: 'The Foundry', addr: '77 Cannery Row'},
  {id: 'u2c', name: 'Unit 2C', bldg: 'Garwood Flats', addr: '9 Garwood Pl'},
];
const UNIT_BY_ID: Record<string, UnitFixture> = Object.fromEntries(UNITS.map(unit => [unit.id, unit]));

interface Criterion {
  id: string;
  label: string;
  room: string;
  defaultWeight: number;
}

const CRITERIA: Criterion[] = [
  {id: 'light', label: 'Natural light', room: 'Living room', defaultWeight: 2},
  {id: 'noise', label: 'Street noise', room: 'Living room', defaultWeight: 3},
  {id: 'water', label: 'Water pressure', room: 'Bathroom', defaultWeight: 1},
  {id: 'storage', label: 'Closet storage', room: 'Bedroom', defaultWeight: 2},
  {id: 'kitchen', label: 'Kitchen condition', room: 'Kitchen', defaultWeight: 2},
  {id: 'signal', label: 'Cell signal', room: 'Whole unit', defaultWeight: 1},
];

const INITIAL_RATINGS: Record<string, Record<string, number>> = {
  u12: {light: 3, noise: 5, water: 4, storage: 4, kitchen: 4, signal: 4},
  u4b: {light: 5, noise: 4, water: 3, storage: 4, kitchen: 4, signal: 3},
  u7a: {light: 4, noise: 3, water: 5, storage: 3, kitchen: 3, signal: 4},
  u2c: {light: 3, noise: 4, water: 2, storage: 5, kitchen: 3, signal: 3},
};

interface VetoOption {
  id: string;
  label: string;
}

const VETO_OPTIONS: VetoOption[] = [
  {id: 'mold', label: 'Mold smell'},
  {id: 'pests', label: 'Pests'},
  {id: 'deadbolt', label: 'Broken deadbolt'},
];

const INITIAL_VETOES: Record<string, Record<string, boolean>> = {
  u12: {},
  u4b: {},
  u7a: {},
  u2c: {mold: true},
};

const INITIAL_NOTES: Record<string, string[]> = {
  u12: ['South-facing living room, sun until 4pm', 'Dishwasher is new — Bosch'],
  u4b: ['Train audible with windows open'],
  u7a: [],
  u2c: [],
};

// Fixed fixture string appended by 'Add note' — deterministic by law.
const NOTE_STAMP = 'Added during tour — edit later';

// Deterministic skeleton width cycles (never Math.random()).
const SKELETON_LABEL_W = ['60%', '45%', '70%', '60%', '45%', '70%'];
const SKELETON_STRIP_W = ['40%', '55%', '30%', '40%', '55%', '30%'];

const RANK_WORDS = ['first', 'second', 'third', 'fourth'];

type TabId = 'tour' | 'compare' | 'notes';

const TABS: Array<{id: TabId; label: string}> = [
  {id: 'tour', label: 'Tour'},
  {id: 'compare', label: 'Compare'},
  {id: 'notes', label: 'Notes'},
];

// ---------------------------------------------------------------------------
// DERIVED SELECTORS — pure functions of the data slice; every surface
// (pill, rows, strip, mirror, leaderboard, banner, caption) reads THESE,
// never a cached copy.
// ---------------------------------------------------------------------------

interface ScoreData {
  ratings: Record<string, Record<string, number>>;
  weights: Record<string, number>;
  vetoes: Record<string, Record<string, boolean>>;
  notes: Record<string, string[]>;
}

function weightSum(weights: Record<string, number>): number {
  return CRITERIA.reduce((sum, crit) => sum + weights[crit.id], 0);
}

function pointsFor(data: ScoreData, unitId: string): number {
  return CRITERIA.reduce((sum, crit) => sum + data.ratings[unitId][crit.id] * data.weights[crit.id], 0);
}

function isVetoed(data: ScoreData, unitId: string): boolean {
  return VETO_OPTIONS.some(option => data.vetoes[unitId]?.[option.id] === true);
}

/** Raw normalized score, veto ignored — the struck '71' beside the 0. */
function rawCompositeFor(data: ScoreData, unitId: string): number {
  return Math.round((pointsFor(data, unitId) / (5 * weightSum(data.weights))) * 100);
}

/** composite(u) = veto ? 0 : round(Σ(r×w) / (5ΣW) × 100). */
function compositeFor(data: ScoreData, unitId: string): number {
  return isVetoed(data, unitId) ? 0 : rawCompositeFor(data, unitId);
}

/** Ranking: composite desc, tie-break name asc. */
function rankingOf(data: ScoreData): string[] {
  return UNITS.map(unit => unit.id).sort((a, b) => {
    const diff = compositeFor(data, b) - compositeFor(data, a);
    return diff !== 0 ? diff : UNIT_BY_ID[a].name.localeCompare(UNIT_BY_ID[b].name);
  });
}

/** Leader = top-ranked non-vetoed unit; null when every unit is vetoed. */
function leaderOf(data: ScoreData): string | null {
  const top = rankingOf(data).find(id => !isVetoed(data, id));
  return top ?? null;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useScorecard(): {data, ui, undoSnapshot} behind a single
// update(id, patch); undo restores the EXACT prior data slice in one
// assignment (undoOverConfirm law).
// ---------------------------------------------------------------------------

interface UiState {
  tab: TabId;
  currentUnitId: string;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  focusCrit: string | null;
  syncing: boolean;
  toast: {seq: number; text: string; undoable: boolean} | null;
  scrollByTab: Record<TabId, number>;
}

interface ScorecardStore {
  data: ScoreData;
  ui: UiState;
  undoSnapshot: ScoreData | null;
}

const INITIAL_STORE: ScorecardStore = {
  data: {
    ratings: INITIAL_RATINGS,
    weights: Object.fromEntries(CRITERIA.map(crit => [crit.id, crit.defaultWeight])),
    vetoes: INITIAL_VETOES,
    notes: INITIAL_NOTES,
  },
  ui: {
    tab: 'tour',
    currentUnitId: 'u4b',
    sheetOpen: false,
    sheetDetent: 'medium',
    focusCrit: null,
    syncing: false,
    toast: null,
    scrollByTab: {tour: 0, compare: 0, notes: 0},
  },
  undoSnapshot: null,
};

function useScorecard() {
  const [store, setStore] = useState<ScorecardStore>(INITIAL_STORE);
  const update = useCallback(
    <K extends keyof ScorecardStore>(id: K, patch: Partial<ScorecardStore[K]>) => {
      setStore(prev => ({...prev, [id]: {...(prev[id] as object), ...patch} as ScorecardStore[K]}));
    },
    [],
  );
  return {store, update, setStore};
}

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

/**
 * The demo's .preview-wrap owns page scroll (the shell never scrolls
 * itself) — walk up to the nearest scrollable ancestor for the per-tab
 * scroll save/restore contract.
 */
function findScroller(start: HTMLElement | null): HTMLElement | null {
  let element = start?.parentElement ?? null;
  while (element != null) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
      return element;
    }
    element = element.parentElement;
  }
  return document.scrollingElement as HTMLElement | null;
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
// BRAND MARK — 28px clipboard whose top-right corner folds open like a door
// ajar (accent-filled flap), tick-shaped door handle; strokes in
// currentColor = var(--color-text-primary).
// ---------------------------------------------------------------------------

function TourmarkMark() {
  return (
    <span style={{...styles.brandMark, color: 'var(--color-text-primary)'}} aria-hidden>
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
        {/* Clipboard body with the top-right corner cut away… */}
        <path
          d="M4.5 4.5 h6.5 l4.5 4.5 v6.5 a1.5 1.5 0 0 1 -1.5 1.5 h-8 a1.5 1.5 0 0 1 -1.5 -1.5 v-9.5 a1.5 1.5 0 0 1 1.5 -1.5 Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* …and the fold swung open like a door ajar (BRAND_ACCENT fill). */}
        <path d="M11 4.5 L16.5 2.5 L15.5 9 Z" fill={BRAND_ACCENT} />
        {/* Clip tab. */}
        <rect x="6.5" y="3" width="4" height="2.6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
        {/* Tick-shaped door handle. */}
        <path d="M7 12.2 l1.9 1.9 3.4 -3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// WEIGHTED CRITERION ROW — 96px: label + live 'r×w = N pts' contribution
// over a five-radio RatingTapStrip and the WeightTickStrip readout button
// (the gesture-free path into the weight sheet, scrolled to this
// criterion). Under 352px container width the readout wraps below (row
// 96→~116px) via the flexWrap guard.
// ---------------------------------------------------------------------------

interface CriterionRowProps {
  crit: Criterion;
  rating: number;
  weight: number;
  narrow: boolean;
  onRate: (critId: string, value: number) => void;
  onOpenWeights: (critId: string, opener: HTMLElement) => void;
}

function CriterionRow({crit, rating, weight, narrow, onRate, onOpenWeights}: CriterionRowProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const onGroupKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? Math.min(5, rating + 1) : Math.max(1, rating - 1);
    if (next !== rating) {
      onRate(crit.id, next);
    }
    const radios = groupRef.current?.querySelectorAll<HTMLButtonElement>('button');
    radios?.[next - 1]?.focus();
  };
  return (
    <div style={styles.critRow}>
      <div style={styles.critLine1}>
        <span style={styles.critLabel}>{crit.label}</span>
        <span style={styles.critPts}>
          {rating}×{weight} = {rating * weight} pts
        </span>
      </div>
      <div style={{...styles.critLine2, flexWrap: narrow ? 'wrap' : 'nowrap'}}>
        <div
          ref={groupRef}
          role="radiogroup"
          aria-label={\`Rate \${crit.label.toLowerCase()} (\${crit.room})\`}
          style={styles.ratingGroup}
          onKeyDown={onGroupKeyDown}>
          {[1, 2, 3, 4, 5].map(value => {
            const filled = value <= rating;
            const selected = value === rating;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                className="tmk-btn tmk-focusable"
                style={styles.ratingBtn}
                aria-label={\`\${value} of 5\`}
                onClick={() => onRate(crit.id, value)}>
                <span style={{...styles.ratingPill, ...(filled ? styles.ratingPillOn : null)}}>{value}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="tmk-btn tmk-focusable"
          style={styles.tickReadout}
          aria-label={\`Weight for \${crit.label.toLowerCase()}: \${weight}x — tune weights\`}
          onClick={event => onOpenWeights(crit.id, event.currentTarget)}>
          <span style={styles.tickBars} aria-hidden>
            {[1, 2, 3, 4].map(tick => (
              <span key={tick} style={{...styles.tickBar, ...(tick <= weight ? styles.tickBarOn : null)}} />
            ))}
          </span>
          <span style={styles.tickValue}>{weight}x</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPARE CHIP LANE — shared by the sticky CompareStrip and the sheet's
// SheetLeaderboardMirror: chips render in FIXED unit order and translate to
// their rank slot (translateX(rank·100% + rank·8px)), so a rank flip is a
// 200ms transform swap (instant reorder under reduced motion). Every chip
// is a ≥44px button that sets currentUnitId.
// ---------------------------------------------------------------------------

interface CompareLaneProps {
  data: ScoreData;
  currentUnitId: string;
  mini: boolean;
  onPick: (unitId: string) => void;
}

function CompareLane({data, currentUnitId, mini, onPick}: CompareLaneProps) {
  const ranking = rankingOf(data);
  return (
    <div style={mini ? styles.mirrorLane : styles.compareLane} aria-label="Live unit ranking" role="group">
      {UNITS.map(unit => {
        const rank = ranking.indexOf(unit.id);
        const vetoed = isVetoed(data, unit.id);
        const composite = compositeFor(data, unit.id);
        const isCurrent = unit.id === currentUnitId;
        const chipStyle: CSSProperties = {
          ...(mini ? styles.mirrorChip : styles.compareChip),
          transform: \`translateX(calc(\${rank} * 100% + \${rank * 8}px))\`,
          ...(isCurrent ? {background: BRAND_TINT_12} : null),
        };
        const label = vetoed
          ? \`\${unit.name}, dealbreaker set, score 0, ranked \${RANK_WORDS[rank]}\`
          : \`\${unit.name}, score \${composite}, ranked \${RANK_WORDS[rank]}\`;
        return (
          <button
            key={unit.id}
            type="button"
            className="tmk-btn tmk-focusable tmk-swap"
            style={chipStyle}
            aria-label={label}
            aria-current={isCurrent ? 'true' : undefined}
            onClick={() => onPick(unit.id)}>
            <span
              style={{...(mini ? styles.mirrorCap : styles.chipCap), background: UNIT_GRADIENTS[unit.id]}}
              aria-hidden
            />
            {mini ? (
              <span style={styles.mirrorLine}>
                <span style={{...styles.mirrorLabel, ...(vetoed ? styles.struck : null)}}>{unit.name}</span>
                <span style={styles.mirrorScore}>{composite}</span>
              </span>
            ) : (
              <>
                <span style={{...styles.chipLabel, ...(vetoed ? styles.struck : null)}}>{unit.name}</span>
                <span style={styles.chipScore}>{composite}</span>
                {/* Track always renders — a vetoed 0-width fill never
                    collapses the chip height (stress fixture 2). */}
                <span style={styles.chipBarTrack} aria-hidden>
                  <span style={{...styles.chipBarFill, width: \`\${composite}%\`}} className="tmk-swap" />
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WEIGHT ROW (sheet edition) — 64px: 13/600 label over the 312px control
// cluster: 128px four-zone snap-drag track (garnish; pointer-only), 96×32
// Minus/Plus stepper with 44px effective hits, and the 16/400 tabular
// value as a role=spinbutton (ArrowUp/Down) — the mandated non-gesture
// path. Drag announces the settled composite on pointerup only, never
// per-snap.
// ---------------------------------------------------------------------------

interface WeightRowProps {
  crit: Criterion;
  weight: number;
  onSet: (critId: string, weight: number, announce: boolean) => void;
}

function WeightRow({crit, weight, onSet}: WeightRowProps) {
  const draggingRef = useRef(false);
  const zoneFromX = (event: ReactPointerEvent<HTMLDivElement>): number => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    return Math.max(1, Math.min(4, 1 + Math.floor(x / 32)));
  };
  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const zone = zoneFromX(event);
    if (zone !== weight) onSet(crit.id, zone, false);
  };
  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const zone = zoneFromX(event);
    if (zone !== weight) onSet(crit.id, zone, false);
  };
  const onTrackPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onSet(crit.id, weight, true);
  };
  const onSpinKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const next = event.key === 'ArrowUp' ? Math.min(4, weight + 1) : Math.max(1, weight - 1);
    if (next !== weight) onSet(crit.id, next, true);
  };
  return (
    <div style={styles.weightRow} data-crit-id={crit.id}>
      <span style={styles.weightLabel} id={\`tmk-wl-\${crit.id}\`}>
        {crit.label} · {crit.room}
      </span>
      <div style={styles.weightControls}>
        {/* Drag track — pointer garnish only; aria-hidden because the
            stepper + spinbutton beside it are the accessible path. */}
        <div
          style={styles.weightTrack}
          aria-hidden
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}>
          {[1, 2, 3, 4].map(zone => (
            <span
              key={zone}
              style={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
              }}>
              <span style={{...styles.weightZoneBar, ...(zone <= weight ? styles.weightZoneBarOn : null)}} />
            </span>
          ))}
        </div>
        <div style={styles.stepper}>
          {/* 44px-tall halves overhang the 32px track (marginBlock −6) so
              the effective hit is 48×44 with the row's padding. */}
          <button
            type="button"
            className="tmk-btn tmk-focusable"
            style={{...styles.stepperHalf, height: 44, marginBlock: -6, ...(weight === 1 ? styles.stepperHalfDisabled : null)}}
            aria-label={\`Decrease weight for \${crit.label.toLowerCase()}\`}
            disabled={weight === 1}
            onClick={() => onSet(crit.id, weight - 1, true)}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <span style={styles.stepperRule} aria-hidden />
          <button
            type="button"
            className="tmk-btn tmk-focusable"
            style={{...styles.stepperHalf, height: 44, marginBlock: -6, ...(weight === 4 ? styles.stepperHalfDisabled : null)}}
            aria-label={\`Increase weight for \${crit.label.toLowerCase()}\`}
            disabled={weight === 4}
            onClick={() => onSet(crit.id, weight + 1, true)}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </div>
        <span
          role="spinbutton"
          tabIndex={0}
          className="tmk-focusable"
          style={styles.spinValue}
          aria-valuenow={weight}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-label={\`Weight for \${crit.label.toLowerCase()}\`}
          aria-valuetext={\`\${weight}x\`}
          onKeyDown={onSpinKeyDown}>
          {weight}x
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber (real 'Resize sheet' button: click toggles
// medium/large, drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X (first focus, preventScroll), focus
// trapped; the body is the one legal inner scroller.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, closeBtnRef, reducedMotion, children}: SheetProps) {
  // Transient pointer-drag delta only — the detent lives in the one owner.
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
    if (!movedRef.current) return; // plain click → toggle handled by onClick
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
      className="tmk-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="tmk-btn tmk-focusable"
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
          ref={closeBtnRef}
          className="tmk-btn tmk-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_ICONS = {tour: ClipboardCheckIcon, compare: BarChart3Icon, notes: StickyNoteIcon} as const;

export default function MobileApartmentTourScorecardTemplate() {
  // Container-width decisions: ≥720px of WRAPPER width → centered 430px
  // phone column (desktop stage); <352px → criterion readout wraps below
  // the rating strip. Viewport query is the first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const narrow = wrapWidth > 0 && wrapWidth < 352;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, update, setStore} = useScorecard();
  const {data, ui} = store;
  const storeRef = useRef(store);
  storeRef.current = store;

  // Focus plumbing — opener restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetBodyRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const dealbreakersRef = useRef<HTMLHeadingElement | null>(null);
  const tabListRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  const nextToast = (text: string, undoable: boolean) => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undoable};
  };

  // Derived — every surface reads the same pure selectors.
  const currentUnit = UNIT_BY_ID[ui.currentUnitId];
  const sumW = weightSum(data.weights);
  const maxPts = 5 * sumW;
  const currentPts = pointsFor(data, ui.currentUnitId);
  const currentVetoed = isVetoed(data, ui.currentUnitId);
  const currentComposite = compositeFor(data, ui.currentUnitId);
  const currentRaw = rawCompositeFor(data, ui.currentUnitId);
  const leaderId = leaderOf(data);
  const ranking = rankingOf(data);
  const vetoedCount = UNITS.filter(unit => isVetoed(data, unit.id)).length;
  const currentNotes = data.notes[ui.currentUnitId];

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // (1) Rating tap — one write; row contribution, caption, CompositePill,
  // CompareStrip order, leaderboard, and LeaderBanner all re-derive; the
  // toastDock announces the settled composite. A new mutation replaces any
  // pending undo window (stress fixture 5).
  const setRating = (critId: string, value: number) => {
    setStore(prev => {
      const unitId = prev.ui.currentUnitId;
      const nextData: ScoreData = {
        ...prev.data,
        ratings: {...prev.data.ratings, [unitId]: {...prev.data.ratings[unitId], [critId]: value}},
      };
      return {
        data: nextData,
        ui: {...prev.ui, toast: nextToast(\`\${UNIT_BY_ID[unitId].name} is now \${compositeFor(nextData, unitId)}\`, false)},
        undoSnapshot: null,
      };
    });
  };

  // (3) Weight write — steppers, ArrowUp/Down, and drag snaps produce the
  // IDENTICAL write; drags announce only on pointerup (never per-snap).
  const setWeight = (critId: string, weight: number, announce: boolean) => {
    setStore(prev => {
      const nextData: ScoreData = {...prev.data, weights: {...prev.data.weights, [critId]: weight}};
      if (!announce) {
        return {...prev, data: nextData};
      }
      const unitId = prev.ui.currentUnitId;
      return {
        data: nextData,
        ui: {...prev.ui, toast: nextToast(\`\${UNIT_BY_ID[unitId].name} is now \${compositeFor(nextData, unitId)}\`, false)},
        undoSnapshot: null,
      };
    });
  };

  // (4) Veto — undoOverConfirm: reversible, executes immediately. ON saves
  // the exact prior data slice for Undo; OFF is one assignment.
  const toggleVeto = (vetoId: string) => {
    setStore(prev => {
      const unitId = prev.ui.currentUnitId;
      const wasOn = prev.data.vetoes[unitId]?.[vetoId] === true;
      const nextData: ScoreData = {
        ...prev.data,
        vetoes: {...prev.data.vetoes, [unitId]: {...prev.data.vetoes[unitId], [vetoId]: !wasOn}},
      };
      if (!wasOn) {
        return {
          data: nextData,
          ui: {...prev.ui, toast: nextToast(\`Dealbreaker set on \${UNIT_BY_ID[unitId].name}\`, true)},
          undoSnapshot: prev.data,
        };
      }
      return {
        data: nextData,
        ui: {
          ...prev.ui,
          toast: nextToast(\`Dealbreaker cleared — \${UNIT_BY_ID[unitId].name} is now \${compositeFor(nextData, unitId)}\`, false),
        },
        undoSnapshot: null,
      };
    });
  };

  const undoLast = () => {
    setStore(prev =>
      prev.undoSnapshot == null
        ? prev
        : {data: prev.undoSnapshot, ui: {...prev.ui, toast: nextToast('Restored', false)}, undoSnapshot: null},
    );
  };

  // (8) Notes — fixed fixture string; execute + Undo.
  const addNote = (unitId: string) => {
    setStore(prev => ({
      data: {...prev.data, notes: {...prev.data.notes, [unitId]: [...prev.data.notes[unitId], NOTE_STAMP]}},
      ui: {...prev.ui, toast: nextToast('Note added', true)},
      undoSnapshot: prev.data,
    }));
  };

  // (7) Refresh — skeleton in, resolved by the NEXT user interaction in
  // the body or a second refresh press. Never a timer.
  const resolveSyncing = () => {
    setStore(prev =>
      prev.ui.syncing
        ? {...prev, ui: {...prev.ui, syncing: false, toast: nextToast('Updated just now', false)}}
        : prev,
    );
  };
  const onRefresh = () => {
    setStore(prev =>
      prev.ui.syncing
        ? {...prev, ui: {...prev.ui, syncing: false, toast: nextToast('Updated just now', false)}}
        : {...prev, ui: {...prev.ui, syncing: true, toast: nextToast('Loading', false)}, undoSnapshot: null},
    );
  };
  const onMainInteract = () => {
    if (storeRef.current.ui.syncing) resolveSyncing();
  };

  // (6) Tabs — per-tab scroll persists via scrollByTab; overlays close on
  // switch (the toast dock persists); re-tapping the active tab scrolls to
  // top (the one legal reset).
  const selectTab = (tab: TabId) => {
    const scroller = findScroller(wrapRef.current);
    if (tab === storeRef.current.ui.tab) {
      scroller?.scrollTo({top: 0});
      return;
    }
    const top = scroller?.scrollTop ?? 0;
    setStore(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        tab,
        sheetOpen: false,
        focusCrit: null,
        scrollByTab: {...prev.ui.scrollByTab, [prev.ui.tab]: top},
      },
    }));
  };
  useEffect(() => {
    const scroller = findScroller(wrapRef.current);
    scroller?.scrollTo({top: storeRef.current.ui.scrollByTab[ui.tab] ?? 0});
  }, [ui.tab]);

  const onTabListKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === storeRef.current.ui.tab);
    const nextIndex = (index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    selectTab(TABS[nextIndex].id);
    tabListRef.current?.querySelectorAll<HTMLButtonElement>('button')[nextIndex]?.focus();
  };

  // (2) Weight sheet lifecycle — focus in with preventScroll (the locked
  // overflow-hidden shell would otherwise scroll-reveal the animating
  // sheet and beach it mid-screen), scrolled to the opening criterion,
  // restored to the opener on every close path.
  const openSheet = (focusCrit: string | null, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update('ui', {sheetOpen: true, sheetDetent: 'medium', focusCrit});
  };
  const closeSheet = useCallback(() => {
    update('ui', {sheetOpen: false, focusCrit: null});
    sheetOpenerRef.current?.focus();
  }, [update]);

  useEffect(() => {
    if (!ui.sheetOpen) return;
    sheetCloseRef.current?.focus({preventScroll: true});
    const focusCrit = storeRef.current.ui.focusCrit;
    const body = sheetBodyRef.current;
    if (focusCrit != null && body != null) {
      const row = body.querySelector<HTMLElement>(\`[data-crit-id="\${focusCrit}"]\`);
      if (row != null) body.scrollTop = row.offsetTop - body.offsetTop;
    }
  }, [ui.sheetOpen]);

  // Escape closes the topmost overlay — the sheet is the only layer.
  useEffect(() => {
    if (!ui.sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui.sheetOpen, closeSheet]);

  const pickUnit = (unitId: string) => update('ui', {currentUnitId: unitId});

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // Unit chip rail — shared by Tour and Notes.
  const chipRail = (
    <div style={styles.chipRail} role="group" aria-label="Choose unit">
      {UNITS.map(unit => {
        const active = unit.id === ui.currentUnitId;
        return (
          <button
            key={unit.id}
            type="button"
            className="tmk-btn tmk-focusable"
            style={styles.chipHit}
            aria-pressed={active}
            aria-label={\`\${unit.name}, score \${compositeFor(data, unit.id)}\`}
            onClick={() => pickUnit(unit.id)}>
            <span style={{...styles.unitChip, ...(active ? styles.unitChipOn : null)}}>{unit.name}</span>
          </button>
        );
      })}
    </div>
  );

  // TOUR TAB -----------------------------------------------------------------
  const tourView = (
    <>
      <h1 className="tmk-vh">Tourmark apartment tour scorecard</h1>
      {/* LeaderBanner — crossfades on rank flips; all-veto empty variant. */}
      <div style={styles.leaderBanner}>
        {leaderId != null ? (
          <div key={leaderId} className="tmk-cross" style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1}}>
            <span style={styles.leaderIcon}>
              <Icon icon={CrownIcon} size="sm" color="inherit" />
            </span>
            <span style={styles.leaderText}>
              <span style={styles.leaderCaption}>Current leader</span>
              <span style={styles.leaderValue}>
                {UNIT_BY_ID[leaderId].name} — {compositeFor(data, leaderId)}
              </span>
            </span>
          </div>
        ) : (
          <div key="no-leader" className="tmk-cross" style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1}}>
            <span style={{...styles.leaderIcon, color: 'var(--color-error)'}}>
              <Icon icon={OctagonXIcon} size="sm" color="inherit" />
            </span>
            <span style={styles.leaderText}>
              <span style={styles.leaderCaption}>{vetoedCount} units vetoed</span>
              <span style={styles.leaderValue}>No eligible leader — {vetoedCount} units vetoed</span>
            </span>
            <button
              type="button"
              className="tmk-btn tmk-focusable"
              style={styles.leaderEmptyBtn}
              onClick={() => dealbreakersRef.current?.scrollIntoView({block: 'center'})}>
              Review dealbreakers
            </button>
          </div>
        )}
      </div>
      {chipRail}
      <h2 style={styles.sectionHeader}>Rate this unit</h2>
      <div style={styles.listCard} aria-busy={ui.syncing || undefined}>
        {ui.syncing
          ? SKELETON_LABEL_W.map((labelWidth, index) => (
              <div key={index}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.skeletonRow} aria-hidden>
                  <span className="tmk-shimmer" style={{...styles.skeletonLabel, width: labelWidth}} />
                  <span className="tmk-shimmer" style={{...styles.skeletonStrip, width: SKELETON_STRIP_W[index]}} />
                </div>
              </div>
            ))
          : CRITERIA.map((crit, index) => (
              <div key={crit.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <CriterionRow
                  crit={crit}
                  rating={data.ratings[ui.currentUnitId][crit.id]}
                  weight={data.weights[crit.id]}
                  narrow={narrow}
                  onRate={setRating}
                  onOpenWeights={(critId, opener) => openSheet(critId, opener)}
                />
              </div>
            ))}
      </div>
      <h2 ref={dealbreakersRef} style={styles.sectionHeader}>
        Dealbreakers
      </h2>
      <div style={styles.vetoRow}>
        {VETO_OPTIONS.map(option => {
          const on = data.vetoes[ui.currentUnitId]?.[option.id] === true;
          return (
            <button
              key={option.id}
              type="button"
              role="switch"
              aria-checked={on}
              className="tmk-btn tmk-focusable"
              style={styles.chipHit}
              aria-label={\`\${option.label} — dealbreaker for \${currentUnit.name}\`}
              onClick={() => toggleVeto(option.id)}>
              <span style={{...styles.vetoChip, ...(on ? styles.vetoChipOn : null), display: 'flex'}}>
                {on ? <Icon icon={OctagonXIcon} size="sm" color="inherit" /> : null}
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Terminal caption — derives live: 44 / 55 at the shipped fixture. */}
      <div style={styles.caption}>
        6 criteria · {currentPts} / {maxPts} pts
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  // COMPARE TAB ----------------------------------------------------------------
  const compareView = (
    <>
      <h1 style={styles.tabTitle}>Compare</h1>
      <div style={{...styles.listCard, marginTop: 12}}>
        {ranking.map((unitId, index) => {
          const unit = UNIT_BY_ID[unitId];
          const vetoed = isVetoed(data, unitId);
          const composite = compositeFor(data, unitId);
          const raw = rawCompositeFor(data, unitId);
          return (
            <div key={unitId}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                className="tmk-btn tmk-focusable"
                style={styles.boardRow}
                aria-label={
                  vetoed
                    ? \`\${unit.name}, dealbreaker set, score 0, ranked \${RANK_WORDS[index]}\`
                    : \`\${unit.name}, score \${composite}, ranked \${RANK_WORDS[index]}\`
                }
                aria-current={unitId === ui.currentUnitId ? 'true' : undefined}
                onClick={() => pickUnit(unitId)}>
                <span style={styles.boardRank}>{index + 1}</span>
                <span style={{...styles.boardSwatch, background: UNIT_GRADIENTS[unitId]}} aria-hidden />
                <span style={styles.boardText}>
                  <span style={{...styles.boardName, ...(vetoed ? styles.struck : null)}}>{unit.name}</span>
                  <span style={styles.boardAddr}>
                    {unit.bldg} · {unit.addr}
                  </span>
                </span>
                <span style={styles.boardTrailing}>
                  <span style={styles.boardScore}>
                    {vetoed ? (
                      <>
                        {/* Semantic override, never color-alone: struck raw
                            beside the literal 0. */}
                        <s style={{...styles.struck, fontSize: 16, fontWeight: 600, marginRight: 4}}>{raw}</s>0
                      </>
                    ) : (
                      composite
                    )}
                  </span>
                  <span style={styles.boardBarTrack} aria-hidden>
                    <span style={{...styles.chipBarFill, width: \`\${composite}%\`}} className="tmk-swap" />
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div style={styles.caption}>4 units · weighted composite out of 100 · ties rank by name</div>
      <div style={styles.bottomSpacer} />
    </>
  );

  // NOTES TAB ------------------------------------------------------------------
  const notesView = (
    <>
      <h1 style={styles.tabTitle}>Notes</h1>
      {chipRail}
      {currentNotes.length > 0 ? (
        <>
          <h2 style={styles.sectionHeader}>{currentUnit.name}</h2>
          <div style={styles.listCard}>
            {currentNotes.map((note, index) => (
              <div key={\`\${index}-\${note}\`}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.noteRow}>
                  <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0}}>
                    <Icon icon={StickyNoteIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.noteText}>{note}</span>
                </div>
              </div>
            ))}
            <div style={styles.rowDivider} />
            <button type="button" className="tmk-btn tmk-focusable" style={styles.addNoteRow} onClick={() => addNote(ui.currentUnitId)}>
              Add note
            </button>
          </div>
          <div style={styles.caption}>
            {currentNotes.length} {currentNotes.length === 1 ? 'note' : 'notes'} on {currentUnit.name}
          </div>
        </>
      ) : (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={StickyNoteIcon} size="lg" color="inherit" />
          </span>
          <span style={styles.emptyTitle}>No notes for {currentUnit.name}</span>
          <span style={styles.emptyBody}>Things you notice on the tour land here.</span>
          <button type="button" className="tmk-btn tmk-focusable" style={styles.emptyAction} onClick={() => addNote(ui.currentUnitId)}>
            Add note
          </button>
        </div>
      )}
      <div style={styles.bottomSpacer} />
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TOURMARK_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="tmk-btn tmk-focusable"
              style={styles.brandBtn}
              aria-label="Tourmark — back to Tour"
              onClick={() => selectTab('tour')}>
              <TourmarkMark />
            </button>
          </div>
          <div style={styles.navCenter}>
            <span style={styles.navTitle}>{currentUnit.name}</span>
            <span style={styles.compositePill} aria-label={\`Composite score \${currentComposite}\`}>
              {currentVetoed ? (
                <>
                  <s style={styles.pillStruck}>{currentRaw}</s>0
                </>
              ) : (
                currentComposite
              )}
            </span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="tmk-btn tmk-focusable"
              style={styles.iconBtn}
              aria-label="Tune weights"
              aria-expanded={ui.sheetOpen}
              onClick={event => openSheet(null, event.currentTarget)}>
              <Icon icon={SlidersHorizontalIcon} size="md" color="inherit" />
            </button>
            <button
              type="button"
              className="tmk-btn tmk-focusable"
              style={styles.iconBtn}
              aria-label={ui.syncing ? 'Finish refresh' : 'Refresh scores'}
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main} onPointerDownCapture={onMainInteract} onKeyDownCapture={onMainInteract}>
          {ui.tab === 'tour' ? tourView : ui.tab === 'compare' ? compareView : notesView}
        </main>

        {/* THE single polite live region — sticky-in-flow dock (bottom 160
            above the Tour strip / 76 elsewhere); shell-absolute bottom 76
            only while the sheet scroll-locks the shell. One toast, no
            timers, latest mutation wins. */}
        <div
          style={
            ui.sheetOpen
              ? styles.toastLocked
              : {...styles.toastAnchor, bottom: ui.tab === 'tour' ? 160 : 76}
          }
          aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="tmk-fade">
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undoable && store.undoSnapshot != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="tmk-btn tmk-focusable" style={styles.toastUndo} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* CompareStrip — Tour only; sticky bottom 64 on the tabBar. */}
        {ui.tab === 'tour' ? (
          <div style={styles.compareStrip}>
            <CompareLane data={data} currentUnitId={ui.currentUnitId} mini={false} onPick={pickUnit} />
          </div>
        ) : null}

        <nav
          ref={tabListRef}
          style={styles.tabBar}
          role="tablist"
          aria-label="Tourmark sections"
          onKeyDown={onTabListKeyDown}>
          {TABS.map(tab => {
            const active = tab.id === ui.tab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="tmk-btn tmk-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemOn : null)}}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={TAB_ICONS[tab.id]} size="md" color="inherit" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {ui.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {ui.sheetOpen ? (
          <Sheet
            titleId="tmk-weights-title"
            title="Tune weights"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseRef}
            reducedMotion={reducedMotion}>
            {/* SheetLeaderboardMirror — the medium detent covers the real
                strip, so mid-drag re-ranks stay visible in here. */}
            <div style={styles.mirror}>
              <CompareLane data={data} currentUnitId={ui.currentUnitId} mini onPick={pickUnit} />
            </div>
            <div ref={sheetBodyRef} style={styles.sheetBody}>
              {CRITERIA.map((crit, index) => (
                <div key={crit.id}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <WeightRow crit={crit} weight={data.weights[crit.id]} onSet={setWeight} />
                </div>
              ))}
              <div style={{...styles.caption, marginTop: 8}}>
                ΣW = {sumW} · scores normalize to {maxPts} pts
              </div>
            </div>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};