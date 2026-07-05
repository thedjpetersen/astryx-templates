var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — two competing job offers frozen from
 *   the June 2026 recruiter decks: OFFER_A Halyard Systems (Series D, base
 *   215,000 · bonus target 26,000 · grant 80,000/4 yr · sign-on 10,000,
 *   Austin HQ) vs OFFER_B Cinderbloom (Series B, base 160,000 · bonus
 *   target 20,000 · grant 280,000/4 yr · sign-on 25,000, remote). NOTHING
 *   derived is stored: total(offer, g, b) = base + bonusTarget×b/100 +
 *   (grant/4)×(1 + g/100), closed forms A = 235,000 + 260b + 200g and
 *   B = 230,000 + 200b + 700g, crossover g* = 10 + 0.12b (b=100 → 22 ✓,
 *   b=0 → 10, b=85 → 20.2). Cross-checked aggregates: defaults g=12 b=100
 *   Austin → A 263,400 vs B 258,400 (Δ +5,000, seam 54.5%); stated g=15 →
 *   264,000 vs 260,500; EXACT tie at g=22 → both 265,400; g=0 → Δ 11,000
 *   seam 59.9%; g=60 → Δ −19,000 seam 32.9%; b=0 g=12 → Δ −1,000 seam
 *   49.1%. City purchasing-power factors multiply BOTH totals (Austin 1.00
 *   / Seattle 0.90 / NYC 0.80 / Boise 1.05 — ranking is city-invariant);
 *   every total stays a whole dollar because bonus steps of 5% give
 *   increments of 1,300 (A) / 1,000 (B) and all components are multiples
 *   of 20. No Date.now(), no Math.random(), no network media.
 * @output Paritas — Offer Comparison Sliders: a 390px MOBILE total-comp
 *   truth machine. A three-layer sticky header stack (52px navBar with the
 *   tilting-equals mark and a verdictTicker, a 44px tug-of-war tugBar whose
 *   3px seam sits at 50% + clamp(Δ/50,000, −1, 1)×45%, and a 76px
 *   offerHeader with two live-total cards, leader ringed) floats over a
 *   Compare body of three scenarioSliderRows (equity growth 0–60, bonus
 *   attainment 0–150 step 5, 4-detent city), two vestStrip SVG bands with
 *   Y1–Y4 yearScrubbers, and two compStackCards. Signature move: dragging
 *   the growth slider re-derives BOTH comp stacks in the same commit — the
 *   seam crosses the midline at the derived 22%-growth crossover, a
 *   tugFlipAnnotation pill pins at g* on the track, the navBar verdict,
 *   Offers-tab leader badge, offerHeader ring, and the breakdown sheet's
 *   winner-first section order all flip together. Notes tab carries
 *   swipe-to-delete recruiter questions with exact-position Undo, a
 *   refresh-press skeleton state, and a true-empty state.
 * @position Page template; emitted by \`astryx template
 *   mobile-offer-comparison-sliders\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, breakdown sheet, action sheet, anchored
 *   note menu, toast) are position:'absolute' INSIDE shell; position:fixed
 *   is banned. While the breakdown sheet or an action sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close;
 *   the toast dock is sticky-in-flow (bottom 76 above the 64px tabBar) and
 *   switches to absolute insetInline 16 bottom 76 z30 ONLY while the lock
 *   is active. Focus into opening sheets uses focus({preventScroll: true}).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables — comparison is the tug bar, the
 *   paired cards, and the winner-first sheet.
 * Color policy: token-pure chrome. Quarantined offer literals with math at
 *   each declaration: OFFER_A_COLOR teal (the Paritas brand; light side
 *   deepened one step from the spec's #0D9488 — see DEVIATION note at the
 *   constant) and OFFER_B_COLOR amber, plus their on-fill text pairs, the
 *   slider rest-track pair (interactive rest fills need ≥3:1 vs their
 *   ACTUAL surface — hairline tokens are for passive separators only), and
 *   the seam pair. navBar hairline is ALWAYS ON (noted choice — no
 *   scroll-under wiring).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps. STICKY STACK = 52px navBar
 *   (top 0, z20, paddingInline 8, grid '1fr auto 1fr') + 44px tugBar (top
 *   52, z19, 20px inner bar radius 6) + 76px offerHeader (top 96, z18, two
 *   60px flex:1 cards) = 172px chrome on Compare. Rows: 44px utility ·
 *   60px two-line note · 72px offer media (48px mark tile); sectionHeader
 *   13px/600 uppercase 0.06em at 32px inset (16 gutter + 16 card pad),
 *   20px top / 8px bottom; scenarioSliderRow = 88px content stack (label
 *   16 + 28px-thumb slider + 32px stepper line) inside 16px card padding
 *   (120px box — see DEVIATION); vestStrip = 20px title + 56px SVG band +
 *   44px yearScrubber; compStack bar 28px + 44px legend rows; tabBar 64px
 *   sticky bottom z20. TYPE (Figtree via --font-family-body): 17/600 sheet
 *   titles · 16/400–700 body & live totals · 13/400–600 meta, verdict, and
 *   legend · 11/500–600 overlines, drift chips, tab labels; nothing under
 *   11px; fontVariantNumeric tabular-nums on every derived number. Touch:
 *   every target ≥44×44 (stepper halves via row padding, 44×44 ellipsis
 *   and year segments, full-row buttons) with ≥8px clearance; every
 *   gesture has a visible button path (swipe rows carry 44×44 ellipsis;
 *   the draggable-feeling sliders ARE native inputs with stepper + preset
 *   parity; the sheet grabber is a real button).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: offerHeader cards flex:1
 *   minWidth 0 with ellipsized names; tugBar fills width minus the 32px
 *   gutter with the seam positioned in %; vestStrip SVG sits in a fluid
 *   wrapper (width 100%, height 56, viewBox '0 0 358 56', xMidYMid meet —
 *   preserveAspectRatio 'none' is banned). Slider-row worst case at 320:
 *   320 − 32 gutter − 32 card padding = 256 content; control line =
 *   96 stepper + 8 + 52 value + 8 + 44 ellipsis = 208 ≤ 256 ✓.
 * - Desktop stage (~1045px container): measured via useElementWidth on the
 *   shell wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — the tug-of-war anatomy
 *   is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BriefcaseIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  ScaleIcon,
  StickyNoteIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration (WCAG relative-luminance arithmetic).
// ---------------------------------------------------------------------------

// THE quarantined brand literal = OFFER_A teal. DEVIATION from spec: the
// spec's light hex #0D9488 claims '4.6:1 vs #FFF' but computes to L≈0.230
// → white-on-fill and teal-on-white are both 1.05/0.280 = 3.7:1, FAILING
// 4.5:1 for the 11px/600 tug initials and the 13px/600 verdict ticker.
// Deepened one Tailwind step to #0F766E (teal-700, L≈0.160): white on
// #0F766E = 1.05/0.210 = 5.0:1 ✓ and #0F766E on the white body/card =
// 5.0:1 ✓. Dark side #2DD4BF per spec (L≈0.514): on the dark card
// (~#1C1C1E, L≈0.012) = 0.564/0.062 = 9.1:1 ✓.
const OFFER_A_COLOR = 'light-dark(#0F766E, #2DD4BF)';
// Text over an OFFER_A fill: #FFFFFF on #0F766E = 5.0:1; white on #2DD4BF
// fails (~1.9:1) so the dark side flips to near-black teal — #042F2E
// (L≈0.023) on #2DD4BF = 0.564/0.073 = 7.8:1.
const ON_OFFER_A = 'light-dark(#FFFFFF, #042F2E)';
// OFFER_B amber. #B45309 (L≈0.159): white-on-fill 1.05/0.209 = 5.0:1 ✓ and
// #B45309 on the white body = 5.0:1 ✓ (spec's claimed 5.0:1 verifies).
// Dark side #FBBF24 (L≈0.579) on the dark card = 0.629/0.062 = 10.2:1 ✓.
const OFFER_B_COLOR = 'light-dark(#B45309, #FBBF24)';
// Text over an OFFER_B fill: #FFFFFF on #B45309 = 5.0:1; dark side flips
// to #451A03 (L≈0.020) on #FBBF24 = 0.629/0.070 = 9.0:1.
const ON_OFFER_B = 'light-dark(#FFFFFF, #451A03)';
// Offer tints for mark tiles and rest washes (decorative).
const A_TINT_12 = \`color-mix(in srgb, \${OFFER_A_COLOR} 12%, transparent)\`;
const B_TINT_12 = \`color-mix(in srgb, \${OFFER_B_COLOR} 12%, transparent)\`;
// Slider REST track — an interactive rest fill, so hairline/muted tokens
// are banned (they read as passive separators): #767676 (L≈0.231) on the
// white card = 1.05/0.281 = 3.7:1… recomputed: 1.05/0.281 = 3.74 ≥ 3:1 ✓
// (graphical boundary requirement); #8B8B8B (L≈0.258) on the dark card =
// 0.308/0.062 = 5.0:1 ✓.
const TRACK_REST = 'light-dark(#767676, #8B8B8B)';
// Tug seam line + chevron nub, drawn OVER the two offer fills. Light:
// #FFFFFF vs #0F766E = 5.0:1 and vs #B45309 = 5.0:1. Dark fills are
// bright (#2DD4BF / #FBBF24), so the seam flips dark: #0F172A (L≈0.009)
// vs #2DD4BF = 9.6:1 and vs #FBBF24 = 10.7:1.
const SEAM_COLOR = 'light-dark(#FFFFFF, #0F172A)';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the styled native
// range input (28px thumb on a 6px track; fill % via CSS custom props), the
// single shared shimmer sweep, visually-hidden h1, and the reduced-motion
// guard (kills seam slide, sheet slide, thumb/selection transitions, and
// removes the shimmer ENTIRELY — static muted blocks alone encode loading).
// ---------------------------------------------------------------------------

const PTS_CSS = \`
.pts-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pts-btn:disabled { cursor: default; }
.pts-focusable:focus-visible {
  outline: 2px solid \${OFFER_A_COLOR};
  outline-offset: 2px;
}
.pts-anim { transition: transform 200ms ease, opacity 200ms ease; }
.pts-fade { transition: opacity 200ms ease; }
.pts-seam { transition: transform 180ms ease-out; }
.pts-range {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 44px;
  margin: 0;
  padding: 0;
  background: transparent;
}
.pts-range::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--pts-fill-color) var(--pts-fill),
    var(--pts-rest) var(--pts-fill)
  );
}
.pts-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-background-card);
  border: 2px solid var(--pts-fill-color);
  box-shadow: 0 1px 4px var(--color-shadow);
  margin-top: -11px;
  transition: transform 120ms ease;
}
.pts-range:active::-webkit-slider-thumb { transform: scale(1.08); }
.pts-range::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: var(--pts-rest);
}
.pts-range::-moz-range-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--pts-fill-color);
}
.pts-range::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-background-card);
  border: 2px solid var(--pts-fill-color);
  box-shadow: 0 1px 4px var(--color-shadow);
}
.pts-range:focus-visible {
  outline: 2px solid var(--pts-fill-color);
  outline-offset: 2px;
}
@keyframes pts-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.pts-sheet-in { animation: pts-sheet-in 200ms ease; }
@keyframes pts-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.pts-shimmer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 20%,
    color-mix(in srgb, var(--color-text-primary) 6%, transparent) 50%,
    transparent 80%
  );
  animation: pts-shimmer 1.6s linear infinite;
}
.pts-vh {
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
  .pts-anim, .pts-fade, .pts-seam { transition: none; }
  .pts-sheet-in { animation: none; }
  .pts-shimmer { display: none; }
  .pts-range::-webkit-slider-thumb { transition: none; }
  .pts-range:active::-webkit-slider-thumb { transform: none; }
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
  // Scroll lock while the breakdown sheet or an action sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top 0 z20; hairline + blur ALWAYS ON (noted).
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // verdictTicker — two stacked center lines, max 200px, ellipsized.
  verdictTicker: {
    maxWidth: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },
  tickerBrand: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.04em',
  },
  tickerVerdict: {
    maxWidth: 200,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // TUG BAR — 44px sticky block at top 52 z19, same blur surface.
  tugBlock: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  tugWrap: {position: 'relative', width: '100%', height: 20},
  // Midline tick — 1px --color-border above/below the bar (passive
  // separator, so the hairline token is correct here).
  tugMidTickTop: {
    position: 'absolute',
    left: '50%',
    top: -4,
    width: 1,
    height: 4,
    background: 'var(--color-border)',
  },
  tugMidTickBottom: {
    position: 'absolute',
    left: '50%',
    bottom: -4,
    width: 1,
    height: 4,
    background: 'var(--color-border)',
  },
  tugBar: {
    position: 'relative',
    width: '100%',
    height: 20,
    borderRadius: 6,
    overflow: 'hidden',
    // Right side (OFFER_B) is the base coat; the A fill scales over it so
    // the seam animates via transform only.
    background: OFFER_B_COLOR,
  },
  tugFillA: {
    position: 'absolute',
    inset: 0,
    background: OFFER_A_COLOR,
    transformOrigin: 'left center',
  },
  // Full-width carrier translated by (seam − 50)% — % transforms resolve
  // against the carrier's own (== bar) width, so the seam lands exactly at
  // seam% while animating transform, never left/width.
  tugSeamCarrier: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  tugSeamLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 3,
    marginLeft: -1.5,
    background: SEAM_COLOR,
  },
  tugSeamNub: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    transform: 'rotate(45deg)',
    borderRadius: 2,
    background: SEAM_COLOR,
  },
  tugInitial: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  // OFFER HEADER — 76px sticky at top 96 z18; two 60px flex:1 cards.
  offerHeader: {
    position: 'sticky',
    top: 96,
    zIndex: 18,
    height: 76,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  offerCard: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  offerCardBar: {width: 4, height: 24, borderRadius: 999, flexShrink: 0},
  offerCardText: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  offerCardName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offerCardTotal: {
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionHeaderTrail: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'none',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // Media rows lead with a 48px tile at the 16px pad → text edge at 76.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 76},
  // SCENARIO SLIDER ROW — 88px content stack (16 label + 28-thumb slider +
  // 32 stepper line + 2×6 gaps) inside 16px padding (120px box). DEVIATION:
  // the spec's '88px tall, padding 16' does not reconcile (16+28+32 + gaps
  // already exceeds 88 − 32 padding); 88 is honored as the CONTENT height.
  sliderRow: {padding: 16, display: 'flex', flexDirection: 'column', gap: 6},
  sliderTopLine: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driftChip: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-muted)',
    borderRadius: 999,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sliderTrackZone: {position: 'relative', minWidth: 88},
  // ghostTick — 2×12px tick at the recruiter's stated assumption; aligned
  // to the thumb-center travel (14px inset each end), aria-hidden garnish
  // (the driftChip text IS the accessible drift signal).
  ghostTick: {
    position: 'absolute',
    top: '50%',
    width: 2,
    height: 12,
    marginTop: -6,
    borderRadius: 1,
    background: 'var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  // tugFlipAnnotation — 24px pill pinned above the growth track at the
  // derived crossover position; also rendered as static text below.
  flipPill: {
    position: 'absolute',
    top: -26,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  flipStatic: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  sliderControlLine: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // STEPPER — 96×32 muted track split by a center hairline (inputControls
  // contract verbatim); each half's hit extends to 44×44 via padding.
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperHalf: {
    width: 48,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperHairline: {width: 1, background: 'var(--color-border)', marginBlock: 6},
  sliderValue: {
    flex: 1,
    minWidth: 52,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // VEST STRIP — 20px title row + 56px SVG band + 44px yearScrubber.
  vestCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  vestTitleRow: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  vestDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  vestName: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  vestTrail: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  vestSvgWrap: {width: '100%', height: 56},
  // yearScrubber — 36px segmented track inside a 44px zone; active pill is
  // a card-bg 8px-radius pill with hairline (segmented-control contract).
  scrubberZone: {height: 44, display: 'flex', alignItems: 'center'},
  scrubberTrack: {
    width: '100%',
    height: 36,
    display: 'flex',
    gap: 2,
    padding: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  scrubberSeg: {
    flex: 1,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  scrubberSegOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // COMP STACK CARD — 28px pure-CSS stacked bar + 44px legend rows.
  stackCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
  },
  stackTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stackBar: {
    display: 'flex',
    width: '100%',
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
  },
  legendRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  legendLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  cityCaption: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // OFFERS TAB — 72px media rows + 44px utility row.
  offerMediaRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  offerMarkTile: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 700,
  },
  offerMediaText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  offerMediaName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offerMediaMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offerMediaTotal: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // NOTES — swipeable 60px two-line rows.
  noteOuter: {position: 'relative', overflow: 'hidden'},
  noteDeleteBlock: {
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
    // White label on --color-error: the token is the house destructive red
    // (≈#C43D3D light / dark side darkened), white ≥4.5:1 per token design.
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  noteContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  noteRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  notePrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteEllipsisWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  // Anchored note menu — absolute card, 12px radius, 44px rows, z30.
  anchoredMenu: {
    position: 'absolute',
    right: 12,
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
  // SKELETON — 4×60px rows, blocks muted radius 6; deterministic widths.
  skeletonRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
  },
  skeletonBar: {
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
  },
  updatedCaption: {
    margin: '8px 16px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // EMPTY STATE — centered between chrome, maxWidth 280.
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
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    margin: '4px 0 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // TAB BAR — 64px sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    flexShrink: 0,
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
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
    fontSize: 10,
    fontWeight: 600,
  },
  // TOAST DOCK — sticky-in-flow (height 0, bottom 76 above the 64px
  // tabBar) so it pins to the VIEWPORT bottom mid-scroll; absolute-in-shell
  // would anchor to the document bottom on tall tabs. Switches to absolute
  // insetInline 16 bottom 76 z30 ONLY while the sheet scroll-lock is
  // active (shell is exactly 100dvh then). Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 0,
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
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastLocked: {position: 'static'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: OFFER_A_COLOR,
    flexShrink: 0,
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  sheetSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '12px 0 0',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  sheetRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
  },
  sheetRowLabel: {
    flex: 1,
    minWidth: 0,
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetRowValue: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sheetTotalRow: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  sheetCaption: {
    marginTop: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ACTION SHEET — two stacked cards, absolute insetInline 16 bottom 16.
  actionSheetWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionSheetCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionSheetHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  actionSheetRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  actionSheetCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  actionSheetHairline: {height: 1, background: 'var(--color-border)'},
  spacer24: {height: 24},
  spacer12: {height: 12},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts; NOTHING derived is stored. Closed forms
// (cross-checked by hand): A(g,b) = 215,000 + 260b + 20,000 + 200g =
// 235,000 + 260b + 200g; B(g,b) = 160,000 + 200b + 70,000 + 700g =
// 230,000 + 200b + 700g. Setting A = B → 5,000 + 60b = 500g → g* = 10 +
// 0.12b (b=100 → 22 ✓; b=0 → 10; b=150 → 28; b=85 → 20.2). Defaults g=12
// b=100 Austin: A = 215,000 + 26,000 + 22,400 = 263,400 (equity 20,000 ×
// 1.12 = 22,400); B = 160,000 + 20,000 + 78,400 = 258,400 (70,000 × 1.12);
// Δ = +5,000 → seam 54.5%. EXACT tie g=22: both 265,400 (24,400 / 85,400).
// ---------------------------------------------------------------------------

type OfferId = 'halyard' | 'cinderbloom';

interface Offer {
  id: OfferId;
  name: string;
  /** Ticker/verdict name — 'Halyard leads by $5.0k' per spec. */
  shortName: string;
  /** Offers-tab display name — OFFER_B's is the 320px ellipsis stress. */
  legalName: string;
  stage: string;
  city: string;
  initial: string;
  color: string;
  onColor: string;
  base: number;
  bonusTarget: number;
  grant: number;
  signOn: number;
}

const OFFER_A: Offer = {
  id: 'halyard',
  name: 'Halyard Systems',
  shortName: 'Halyard',
  legalName: 'Halyard Systems',
  stage: 'Series D',
  city: 'Austin HQ / remote-ok',
  initial: 'H',
  color: OFFER_A_COLOR,
  onColor: ON_OFFER_A,
  base: 215000,
  bonusTarget: 26000,
  grant: 80000,
  signOn: 10000,
};

const OFFER_B: Offer = {
  id: 'cinderbloom',
  name: 'Cinderbloom',
  shortName: 'Cinderbloom',
  // Stress fixture 7 — long-name truncation in the Offers media row.
  legalName: 'Cinderbloom Bio-Manufacturing',
  stage: 'Series B',
  city: 'Remote',
  initial: 'C',
  color: OFFER_B_COLOR,
  onColor: ON_OFFER_B,
  base: 160000,
  bonusTarget: 20000,
  grant: 280000,
  signOn: 25000,
};

const OFFERS: Offer[] = [OFFER_A, OFFER_B];

interface City {
  id: string;
  /** Readout-pill label. */
  short: string;
  /** aria-valuetext name. */
  name: string;
  factor: number;
  factorLabel: string;
}

// Purchasing-power factor applies to BOTH totals — ranking is
// city-invariant (Δ scales by the factor but never changes sign). Totals
// stay whole dollars: bonus steps of 5% give increments of 1,300 (A) /
// 1,000 (B), every component is a multiple of 20, and ×0.90 / ×0.80 /
// ×1.05 keep multiples of 20 whole (263,400 × 0.90 = 237,060; × 0.80 =
// 210,720; × 1.05 = 276,570; B: 232,560 / 206,720 / 271,320).
const CITIES: City[] = [
  {id: 'austin', short: 'Austin', name: 'Austin', factor: 1.0, factorLabel: '1.00'},
  {id: 'seattle', short: 'Seattle', name: 'Seattle', factor: 0.9, factorLabel: '0.90'},
  {id: 'nyc', short: 'NYC', name: 'New York', factor: 0.8, factorLabel: '0.80'},
  {id: 'boise', short: 'Boise', name: 'Boise', factor: 1.05, factorLabel: '1.05'},
];

// Recruiter-stated assumptions (the ghostTick positions).
const STATED_GROWTH = 15;
const STATED_BONUS = 100;
const STATED_CITY_IDX = 0;

interface Note {
  id: string;
  title: string;
  body: string;
}

const NOTES_FIXTURE: Note[] = [
  {id: 'note_refreshers', title: 'Ask Halyard about refreshers', body: 'Recruiter said annual, get it in writing'},
  {id: 'note_409a', title: 'Cinderbloom 409A date', body: 'Last valuation Mar 2026'},
  {id: 'note_bonusfloor', title: 'Verify Halyard bonus floor', body: 'Is 50% guaranteed?'},
  {id: 'note_relo', title: 'Relocation stipend?', body: 'Neither offer states one'},
];

// Deterministic skeleton bar widths (percent), cycling per the contract.
const SKELETON_PRIMARY = [60, 45, 70, 60];
const SKELETON_SECONDARY = [40, 55, 30, 40];

// ---------------------------------------------------------------------------
// DERIVATIONS — pure functions of (g, b, cityIdx); computed in render,
// never stored. All Math.round calls only guard float dust (every product
// is whole-dollar by construction — see CITIES comment).
// ---------------------------------------------------------------------------

/** total(offer, g, b) = base + bonusTarget×b/100 + (grant/4)×(1 + g/100). */
function rawTotal(offer: Offer, g: number, b: number): number {
  return Math.round(offer.base + (offer.bonusTarget * b) / 100 + (offer.grant / 4) * (1 + g / 100));
}

function adjust(amount: number, factor: number): number {
  return Math.round(amount * factor);
}

/** Crossover law: A = B → 5,000 + 60b = 500g → g* = 10 + 0.12b. */
function crossoverG(b: number): number {
  return Math.round((10 + 0.12 * b) * 10) / 10;
}

/** vestedValue(N) = (grant/4) × N × (1 + g/100) — city factor NOT applied. */
function vestedValue(offer: Offer, yearN: number, g: number): number {
  return Math.round((offer.grant / 4) * yearN * (1 + g / 100));
}

/**
 * Seam position: 50% + clamp(Δ/50,000, −1, 1) × 45%. Δ=+5,000 → 54.5%;
 * Δ=+11,000 → 59.9%; Δ=−19,000 → 32.9%; Δ=−1,000 → 49.1%; tie → 50%.
 */
function seamPercent(delta: number): number {
  const clamped = Math.max(-1, Math.min(1, delta / 50000));
  return 50 + clamped * 45;
}

/** '$263,400'. */
function fmtUsd(amount: number): string {
  return \`$\${amount.toLocaleString('en-US')}\`;
}

/** Exact-integer Δ → '$5.0k' (one decimal, from Δ/1000). */
function fmtK(amount: number): string {
  return \`$\${(Math.abs(amount) / 1000).toFixed(1)}k\`;
}

/** Growth % display: integers bare ('22'), fractional one decimal ('20.2'). */
function fmtG(g: number): string {
  return Number.isInteger(g) ? String(g) : g.toFixed(1);
}

/** Ticker/toast verdict — leader name + Δ, or the dead-heat line. */
function verdictText(delta: number, g: number): string {
  if (delta === 0) return \`Dead heat at \${fmtG(g)}% growth\`;
  const leader = delta > 0 ? OFFER_A : OFFER_B;
  return \`\${leader.shortName} leads by \${fmtK(delta)}\`;
}

/** tugBar wrapper aria-label, kept in sync (NOT a live region). */
function tugAriaLabel(delta: number, g: number): string {
  if (delta === 0) return \`Comp delta: dead heat at \${fmtG(g)}% growth\`;
  const leader = delta > 0 ? OFFER_A : OFFER_B;
  return \`Comp delta: \${leader.shortName} leads by \${fmtUsd(Math.abs(delta))}\`;
}

// ---------------------------------------------------------------------------
// HOOKS & UTILITIES
// ---------------------------------------------------------------------------

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
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])');
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
// BRAND MARK — 24px 'equals sign tilting into a greater-than': the right
// ends of the two bars converge while the left ends stay open.
// ---------------------------------------------------------------------------

function ParitasMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 8.4 L19 10.6" stroke={OFFER_A_COLOR} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M5 16.4 L19 13.8" stroke={OFFER_A_COLOR} strokeWidth={2.6} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// TUG BAR — fluid 20px bar; OFFER_B amber is the base coat and the OFFER_A
// teal fill scales to seam% (solid color, so scaleX cannot distort). The
// seam (3px line + 12px diamond nub) rides a full-width carrier translated
// by (seam − 50)% so it animates transform-only (180ms ease-out, instant
// under reduced motion). Decorative output: the wrapper carries the synced
// aria-label; the toastDock announces settled verdicts.
// ---------------------------------------------------------------------------

interface TugBarProps {
  seamPct: number;
  delta: number;
  growthPct: number;
}

function TugBar({seamPct, delta, growthPct}: TugBarProps) {
  return (
    <div style={styles.tugBlock} role="img" aria-label={tugAriaLabel(delta, growthPct)}>
      <div style={styles.tugWrap}>
        <span style={styles.tugMidTickTop} aria-hidden />
        <span style={styles.tugMidTickBottom} aria-hidden />
        <div style={styles.tugBar} aria-hidden>
          <span
            className="pts-seam"
            style={{...styles.tugFillA, transform: \`scaleX(\${(seamPct / 100).toFixed(4)})\`}}
          />
          <span
            className="pts-seam"
            style={{...styles.tugSeamCarrier, transform: \`translateX(\${(seamPct - 50).toFixed(2)}%)\`}}>
            <span style={styles.tugSeamLine} />
            <span style={styles.tugSeamNub} />
          </span>
          <span style={{...styles.tugInitial, left: 8, color: ON_OFFER_A}}>H</span>
          <span style={{...styles.tugInitial, right: 8, color: ON_OFFER_B}}>C</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCENARIO SLIDER ROW — native <input type=range> (28px thumb, 6px track,
// fill % via CSS custom props) + 96×32 stepper + spinbutton readout +
// 44×44 ellipsis opening the 'Set value' action sheet. The ghostTick marks
// the recruiter's stated assumption (aria-hidden; the driftChip text IS
// the accessible drift signal). Note: growthPct may hold a fractional
// crossover preset (e.g. 20.2 at bonus 85); the range keeps step 1 for
// drag/arrow parity — the ≤0.5-unit thumb offset is sub-pixel at 326px.
// ---------------------------------------------------------------------------

interface SliderRowProps {
  id: string;
  label: string;
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  ghostValue: number;
  driftText: string;
  valueText: string;
  ariaValueText?: string;
  flipAnnotation?: {leftPct: number; text: string} | null;
  onInput: (value: number) => void;
  onCommit: () => void;
  onOpenPresets: (opener: HTMLElement) => void;
}

function ScenarioSliderRow({
  id,
  label,
  ariaLabel,
  value,
  min,
  max,
  step,
  ghostValue,
  driftText,
  valueText,
  ariaValueText,
  flipAnnotation,
  onInput,
  onCommit,
  onOpenPresets,
}: SliderRowProps) {
  const ghostFrac = (ghostValue - min) / (max - min);
  const fillFrac = (value - min) / (max - min);
  const rangeVars = {
    '--pts-fill': \`\${(fillFrac * 100).toFixed(2)}%\`,
    '--pts-fill-color': OFFER_A_COLOR,
    '--pts-rest': TRACK_REST,
  } as CSSProperties;
  const spinKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'ArrowUp' && value < max) {
      event.preventDefault();
      onInput(Math.min(max, Math.round((value + step) / step) * step));
      onCommit();
    } else if (event.key === 'ArrowDown' && value > min) {
      event.preventDefault();
      onInput(Math.max(min, Math.round((value - step) / step) * step));
      onCommit();
    }
  };
  return (
    <div style={styles.sliderRow}>
      <div style={styles.sliderTopLine}>
        <span style={styles.sliderLabel} id={\`pts-label-\${id}\`}>
          {label}
        </span>
        <span style={styles.driftChip}>{driftText}</span>
      </div>
      <div style={styles.sliderTrackZone}>
        {flipAnnotation != null ? (
          <span
            style={{
              ...styles.flipPill,
              left: \`clamp(0px, calc(\${flipAnnotation.leftPct.toFixed(1)}% - 60px), calc(100% - 130px))\`,
            }}
            aria-hidden>
            {flipAnnotation.text}
          </span>
        ) : null}
        <input
          type="range"
          className="pts-range"
          style={rangeVars}
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          aria-valuetext={ariaValueText}
          onChange={event => onInput(Number(event.target.value))}
          onPointerUp={onCommit}
          onKeyUp={event => {
            if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') onCommit();
          }}
        />
        <span
          style={{...styles.ghostTick, left: \`calc(14px + (100% - 28px) * \${ghostFrac.toFixed(4)})\`}}
          aria-hidden
        />
      </div>
      <div style={styles.sliderControlLine}>
        <div style={styles.stepper}>
          <button
            type="button"
            className="pts-btn pts-focusable"
            style={{...styles.stepperHalf, ...(value <= min ? styles.stepperHalfDisabled : null)}}
            disabled={value <= min}
            aria-label={\`Decrease \${label.toLowerCase()}\`}
            onClick={() => {
              onInput(Math.max(min, Math.round((value - step) / step) * step));
              onCommit();
            }}>
            <Icon icon={MinusIcon} size="sm" />
          </button>
          <span style={styles.stepperHairline} aria-hidden />
          <button
            type="button"
            className="pts-btn pts-focusable"
            style={{...styles.stepperHalf, ...(value >= max ? styles.stepperHalfDisabled : null)}}
            disabled={value >= max}
            aria-label={\`Increase \${label.toLowerCase()}\`}
            onClick={() => {
              onInput(Math.min(max, Math.round((value + step) / step) * step));
              onCommit();
            }}>
            <Icon icon={PlusIcon} size="sm" />
          </button>
        </div>
        <span
          style={styles.sliderValue}
          role="spinbutton"
          tabIndex={0}
          className="pts-focusable"
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={ariaValueText ?? valueText}
          onKeyDown={spinKeyDown}>
          {valueText}
        </span>
        <button
          type="button"
          className="pts-btn pts-focusable"
          style={styles.iconBtn}
          aria-label={\`Set \${label.toLowerCase()} from presets\`}
          aria-haspopup="dialog"
          onClick={event => onOpenPresets(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VEST STRIP — per-offer SVG band, viewBox '0 0 358 56' in a fluid wrapper
// (xMidYMid meet; preserveAspectRatio 'none' banned). 12px rounded track
// at y=22 (TRACK_REST — an interactive rest fill, ≥3:1 vs the card), cliff
// notch 2×20 at 25% (x=89.5), 16 quarterly ticks every 22.375 units, fill
// to the scrubbed year, floating 13px/600 tabular readout. The 44px
// yearScrubber radiogroup below IS the button path (band drag is garnish
// we skip). SVG text uses --color-text-primary (never --color-text).
// ---------------------------------------------------------------------------

interface VestStripProps {
  offer: Offer;
  yearN: number;
  growthPct: number;
  onYear: (yearN: number) => void;
}

function VestStrip({offer, yearN, growthPct, onYear}: VestStripProps) {
  const fillWidth = 356 * (yearN / 4);
  const vested = vestedValue(offer, yearN, growthPct);
  // Readout hugs the fill edge, clamped so Y1 (89px) and Y4 (356px) both
  // keep the text inside the viewBox.
  const readoutX = Math.max(64, Math.min(fillWidth, 354));
  const scrubberKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onYear(Math.min(4, yearN + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onYear(Math.max(1, yearN - 1));
    }
  };
  return (
    <div style={styles.vestCard}>
      <div style={styles.vestTitleRow}>
        <span style={{...styles.vestDot, background: offer.color}} aria-hidden />
        <span style={styles.vestName}>{offer.name}</span>
        <span style={styles.vestTrail}>value at year {yearN}</span>
      </div>
      <div style={styles.vestSvgWrap}>
        <svg
          width="100%"
          height={56}
          viewBox="0 0 358 56"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={\`\${offer.name} vesting: \${fmtUsd(vested)} vested by year \${yearN} at \${fmtG(growthPct)} percent growth; 25 percent cliff at year 1\`}>
          <rect x={1} y={22} width={356} height={12} rx={6} fill={TRACK_REST} opacity={0.35} />
          <rect x={1} y={22} width={Math.max(fillWidth - 1, 12)} height={12} rx={6} fill={offer.color} />
          {/* Cliff notch at 25% width (x = 89.5 of 358). */}
          <rect x={88.5} y={18} width={2} height={20} fill="var(--color-text-primary)" />
          {/* 16 quarterly ticks, one per 22.375 viewBox units. */}
          {Array.from({length: 16}, (_, i) => (
            <rect
              key={i}
              x={Math.min((i + 1) * 22.375, 356.5)}
              y={40}
              width={1}
              height={6}
              fill="var(--color-border)"
            />
          ))}
          <text
            x={readoutX}
            y={14}
            textAnchor="end"
            fontSize={13}
            fontWeight={600}
            style={{fontVariantNumeric: 'tabular-nums'}}
            fill="var(--color-text-primary)">
            {fmtUsd(vested)}
          </text>
        </svg>
      </div>
      <div style={styles.scrubberZone}>
        <div
          style={styles.scrubberTrack}
          role="radiogroup"
          aria-label={\`\${offer.name} vested year\`}
          onKeyDown={scrubberKeyDown}>
          {[1, 2, 3, 4].map(year => (
            <button
              key={year}
              type="button"
              role="radio"
              aria-checked={yearN === year}
              className="pts-btn pts-focusable"
              style={{...styles.scrubberSeg, ...(yearN === year ? styles.scrubberSegOn : null)}}
              onClick={() => onYear(year)}>
              Y{year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMP STACK CARD — pure-CSS 28px stacked bar; segment widths =
// component/rawTotal × 100% (city-invariant: Halyard default 215,000 /
// 263,400 = 81.6%, bonus 9.9%, equity 8.5%); opacities 100/70/45. Legend
// rows carry the exact ADJUSTED dollars so the bar needs no labels <11px.
// ---------------------------------------------------------------------------

interface CompStackCardProps {
  offer: Offer;
  growthPct: number;
  bonusPct: number;
  city: City;
}

function CompStackCard({offer, growthPct, bonusPct, city}: CompStackCardProps) {
  const base = offer.base;
  const bonus = Math.round((offer.bonusTarget * bonusPct) / 100);
  const equity = Math.round((offer.grant / 4) * (1 + growthPct / 100));
  const total = base + bonus + equity;
  const segments = [
    {id: 'base', label: 'Base salary', amount: base, opacity: 1},
    {id: 'bonus', label: \`Bonus at \${fmtG(bonusPct)}%\`, amount: bonus, opacity: 0.7},
    {id: 'equity', label: \`Equity per yr at \${fmtG(growthPct)}%\`, amount: equity, opacity: 0.45},
  ];
  return (
    <div style={styles.stackCard}>
      <div style={styles.stackTitleRow}>
        <span style={{...styles.vestDot, background: offer.color}} aria-hidden />
        <span style={styles.vestName}>{offer.name}</span>
        <span style={styles.vestTrail}>{fmtUsd(adjust(total, city.factor))}</span>
      </div>
      <div style={styles.stackBar} role="img" aria-label={\`\${offer.name} mix: base \${fmtUsd(base)}, bonus \${fmtUsd(bonus)}, equity \${fmtUsd(equity)} per year\`}>
        {segments.map(segment => (
          <span
            key={segment.id}
            style={{
              width: \`\${((segment.amount / total) * 100).toFixed(1)}%\`,
              background: offer.color,
              opacity: segment.opacity,
            }}
          />
        ))}
      </div>
      {segments.map(segment => (
        <div key={segment.id} style={styles.legendRow}>
          <span style={{...styles.legendSwatch, background: offer.color, opacity: segment.opacity}} aria-hidden />
          <span style={styles.legendLabel}>{segment.label}</span>
          <span style={styles.legendValue}>{fmtUsd(adjust(segment.amount, city.factor))}</span>
        </div>
      ))}
      {city.factor !== 1 ? (
        <div style={styles.cityCaption}>adjusted for {city.short} ({city.factorLabel})</div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NOTE ROW — swipeable 60px two-line row: pointer drag snaps open at −72px
// over the --color-error Delete block, with the MANDATORY visible 44×44
// ellipsis fallback opening the same action as an anchored menu. Row tap
// toggles the reveal (plain-tap parity); tap-elsewhere close is handled by
// the shell's capture handler. Delete executes immediately + Undo toast —
// never a confirm (undoOverConfirm).
// ---------------------------------------------------------------------------

interface NoteRowProps {
  note: Note;
  isLast: boolean;
  isOpen: boolean;
  menuOpen: boolean;
  onSetOpen: (open: boolean) => void;
  onToggleMenu: (open: boolean) => void;
  onDelete: () => void;
}

function NoteRow({note, isLast, isOpen, menuOpen, onSetOpen, onToggleMenu, onDelete}: NoteRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startRef = useRef<{x: number; base: number} | null>(null);
  const ellipsisRef = useRef<HTMLButtonElement | null>(null);
  const menuFirstRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (menuOpen) menuFirstRef.current?.focus({preventScroll: true});
  }, [menuOpen]);
  const offset = dragX ?? (isOpen ? -72 : 0);
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startRef.current = {x: event.clientX, base: isOpen ? -72 : 0};
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (start == null) return;
    const dx = event.clientX - start.x;
    if (dragX == null) {
      if (Math.abs(dx) < 6) return;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragX(Math.max(-72, Math.min(0, start.base + dx)));
  };
  const handlePointerEnd = () => {
    if (startRef.current == null) return;
    const settled = dragX;
    startRef.current = null;
    setDragX(null);
    if (settled != null) onSetOpen(settled <= -36);
  };
  return (
    <div style={{position: 'relative'}} data-pts-note={note.id}>
      <div style={styles.noteOuter}>
        <button
          type="button"
          className="pts-btn pts-focusable"
          style={styles.noteDeleteBlock}
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={onDelete}>
          <Icon icon={Trash2Icon} size="sm" />
          Delete
        </button>
        <div
          className={dragX == null ? 'pts-anim' : undefined}
          style={{...styles.noteContent, transform: \`translateX(\${offset}px)\`}}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}>
          <button
            type="button"
            className="pts-btn pts-focusable"
            style={styles.noteRowBtn}
            aria-label={note.title}
            onClick={() => onSetOpen(!isOpen)}>
            <span style={styles.notePrimary}>{note.title}</span>
            <span style={styles.noteSecondary}>{note.body}</span>
          </button>
          <span style={styles.noteEllipsisWrap}>
            <button
              ref={ellipsisRef}
              type="button"
              className="pts-btn pts-focusable"
              style={styles.iconBtn}
              aria-label={\`Actions for \${note.title}\`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => onToggleMenu(!menuOpen)}>
              <Icon icon={MoreHorizontalIcon} size="sm" />
            </button>
          </span>
        </div>
      </div>
      {menuOpen ? (
        <div
          style={{...styles.anchoredMenu, top: 52}}
          role="menu"
          aria-label={\`Actions for \${note.title}\`}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              onToggleMenu(false);
              ellipsisRef.current?.focus();
            }
          }}>
          <button
            ref={menuFirstRef}
            type="button"
            role="menuitem"
            className="pts-btn pts-focusable"
            style={{...styles.menuRow, color: 'var(--color-error)'}}
            onClick={onDelete}>
            <Icon icon={Trash2Icon} size="sm" />
            <span>Delete note</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — everything below is a pure derivation of this record;
// no total, delta, seam %, vest value, badge, or section order is stored.
// ---------------------------------------------------------------------------

type TabId = 'compare' | 'offers' | 'notes';
type SliderId = 'growth' | 'bonus' | 'city';

interface ToastUndo {
  note: Note;
  index: number;
}

interface AppState {
  tab: TabId;
  growthPct: number;
  bonusPct: number;
  cityIdx: number;
  yearN: Record<OfferId, number>;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  actionSheetFor: SliderId | null;
  notes: Note[];
  notesLoading: boolean;
  refreshed: boolean;
  toast: {seq: number; msg: string; undo: ToastUndo | null} | null;
  lastFlip: {gStar: number} | null;
  scrollByTab: Record<TabId, number>;
  openSwipeRow: string | null;
  noteMenuFor: string | null;
}

const INITIAL_STATE: AppState = {
  tab: 'compare',
  growthPct: 12,
  bonusPct: 100,
  cityIdx: 0,
  yearN: {halyard: 4, cinderbloom: 4},
  sheetOpen: false,
  sheetDetent: 'medium',
  actionSheetFor: null,
  notes: NOTES_FIXTURE,
  notesLoading: false,
  refreshed: false,
  toast: null,
  lastFlip: null,
  scrollByTab: {compare: 0, offers: 0, notes: 0},
  openSwipeRow: null,
  noteMenuFor: null,
};

/** Adjusted Δ for a scenario snapshot (city factor scales both totals). */
function deltaFor(state: Pick<AppState, 'growthPct' | 'bonusPct' | 'cityIdx'>): number {
  const factor = CITIES[state.cityIdx].factor;
  return (
    adjust(rawTotal(OFFER_A, state.growthPct, state.bonusPct), factor) -
    adjust(rawTotal(OFFER_B, state.growthPct, state.bonusPct), factor)
  );
}

// Note appended by the true-empty state's one action (deterministic).
const ADDED_NOTE: Note = {
  id: 'note_added',
  title: 'Follow up with both recruiters',
  body: 'Confirm equity growth assumptions in writing',
};

export default function MobileOfferComparisonSlidersTemplate() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const refreshBtnRef = useRef<HTMLButtonElement | null>(null);
  // Sign of the last NONZERO Δ — flip detection survives landing exactly
  // on the dead heat and continuing through it.
  const lastSignRef = useRef(1);
  const flippedSinceCommitRef = useRef(false);

  const containerWidth = useElementWidth(wrapRef);
  const vpWide = useMediaQuery('(min-width: 900px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : vpWide;

  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const pushToast = useCallback((msg: string, undo: ToastUndo | null = null) => {
    setState(prev => ({...prev, toast: {seq: (prev.toast?.seq ?? 0) + 1, msg, undo}}));
  }, []);

  // -- Derivations (all in render; nothing stored) --------------------------
  const {growthPct, bonusPct, cityIdx} = state;
  const city = CITIES[cityIdx];
  const totalA = adjust(rawTotal(OFFER_A, growthPct, bonusPct), city.factor);
  const totalB = adjust(rawTotal(OFFER_B, growthPct, bonusPct), city.factor);
  const delta = totalA - totalB;
  const seamPct = seamPercent(delta);
  const gStar = crossoverG(bonusPct);
  const leader = delta > 0 ? OFFER_A : delta < 0 ? OFFER_B : null;
  const verdict = verdictText(delta, growthPct);
  const winner = delta >= 0 ? OFFER_A : OFFER_B;
  const runnerUp = winner.id === 'halyard' ? OFFER_B : OFFER_A;
  const locked = state.sheetOpen || state.actionSheetFor != null;

  // -- Scenario writes: EVERY input event re-derives every surface ----------
  const applyScenario = useCallback(
    (patch: Partial<Pick<AppState, 'growthPct' | 'bonusPct' | 'cityIdx'>>) => {
      setState(prev => {
        const next = {...prev, ...patch};
        const nextDelta = deltaFor(next);
        const nextSign = Math.sign(nextDelta);
        let lastFlip = next.lastFlip;
        if (nextSign !== 0 && nextSign !== lastSignRef.current) {
          lastSignRef.current = nextSign;
          flippedSinceCommitRef.current = true;
          lastFlip = {gStar: crossoverG(next.bonusPct)};
        }
        return {...next, lastFlip};
      });
    },
    [],
  );

  // Commit (pointerup / stepper tap / preset): announce the settled verdict
  // through the ONE polite region; the flip annotation persists through the
  // commit where it happened and clears on the next flip-free commit.
  const commitScenario = useCallback(() => {
    setState(prev => {
      const settled = deltaFor(prev);
      const flipped = flippedSinceCommitRef.current;
      flippedSinceCommitRef.current = false;
      const message = flipped
        ? \`Ranking flipped at \${fmtG(prev.lastFlip?.gStar ?? crossoverG(prev.bonusPct))}% growth — \${verdictText(settled, prev.growthPct)}\`
        : verdictText(settled, prev.growthPct);
      return {
        ...prev,
        lastFlip: flipped ? prev.lastFlip : null,
        toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: message, undo: null},
      };
    });
  }, []);

  // -- Sheet (breakdown) -----------------------------------------------------
  const openSheet = useCallback(
    (opener: HTMLElement) => {
      sheetOpenerRef.current = opener;
      update({sheetOpen: true, sheetDetent: 'medium'});
    },
    [update],
  );
  const closeSheet = useCallback(() => {
    update({sheetOpen: false});
    sheetOpenerRef.current?.focus({preventScroll: true});
    sheetOpenerRef.current = null;
  }, [update]);
  useEffect(() => {
    // preventScroll — plain .focus() scroll-reveals the animating sheet
    // inside the locked overflow-hidden column and beaches it mid-screen.
    if (state.sheetOpen) sheetCloseRef.current?.focus({preventScroll: true});
  }, [state.sheetOpen]);

  // -- Action sheet ('Set value' presets) ------------------------------------
  const openActionSheet = useCallback(
    (sliderId: SliderId, opener: HTMLElement) => {
      actionOpenerRef.current = opener;
      update({actionSheetFor: sliderId});
    },
    [update],
  );
  const closeActionSheet = useCallback(() => {
    update({actionSheetFor: null});
    actionOpenerRef.current?.focus({preventScroll: true});
    actionOpenerRef.current = null;
  }, [update]);
  useEffect(() => {
    // Focus lands on Cancel — the safe default per the actionSheet contract.
    if (state.actionSheetFor != null) actionCancelRef.current?.focus({preventScroll: true});
  }, [state.actionSheetFor]);
  const commitPreset = (sliderId: SliderId, value: number) => {
    applyScenario(
      sliderId === 'growth' ? {growthPct: value} : sliderId === 'bonus' ? {bonusPct: value} : {cityIdx: value},
    );
    commitScenario();
    closeActionSheet();
  };

  // -- Notes ------------------------------------------------------------------
  const deleteNote = (id: string) => {
    setState(prev => {
      const index = prev.notes.findIndex(note => note.id === id);
      if (index < 0) return prev;
      const note = prev.notes[index];
      const notes = prev.notes.filter(candidate => candidate.id !== id);
      return {
        ...prev,
        notes,
        openSwipeRow: null,
        noteMenuFor: null,
        toast: {
          seq: (prev.toast?.seq ?? 0) + 1,
          msg: \`Note deleted · \${notes.length} \${notes.length === 1 ? 'note' : 'notes'}\`,
          undo: {note, index},
        },
      };
    });
  };
  const undoDelete = () => {
    setState(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      // Exact prior state: the row returns to its original list position.
      const notes = [...prev.notes];
      notes.splice(Math.min(undo.index, notes.length), 0, undo.note);
      return {
        ...prev,
        notes,
        toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: \`Restored · \${notes.length} notes\`, undo: null},
      };
    });
  };

  // -- Refresh → skeleton (Notes only; Compare is pure synchronous math) -----
  const handleRefresh = () => {
    if (state.tab === 'notes') {
      setState(prev => ({
        ...prev,
        notesLoading: true,
        refreshed: false,
        toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: 'Loading', undo: null},
      }));
    } else {
      pushToast('Totals derive on-device — nothing to refresh');
    }
  };
  // Skeletons resolve on the NEXT user tap (never a timer); the capture
  // phase also closes an open swipe row on tap-elsewhere.
  const handleShellClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as Node;
    if (state.notesLoading && !(refreshBtnRef.current?.contains(target) ?? false)) {
      setState(prev => (prev.notesLoading ? {...prev, notesLoading: false, refreshed: true} : prev));
    }
    if (state.openSwipeRow != null) {
      const rowHost = (event.target as HTMLElement).closest?.(\`[data-pts-note="\${state.openSwipeRow}"]\`);
      if (rowHost == null) update({openSwipeRow: null});
    }
  };

  // -- Tabs: per-tab scroll persistence; overlays close, toast persists ------
  const selectTab = (next: TabId) => {
    const scroller = findScroller(wrapRef.current);
    if (next === state.tab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      scroller?.scrollTo({top: 0});
      return;
    }
    const top = scroller?.scrollTop ?? 0;
    setState(prev => ({
      ...prev,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: top},
      tab: next,
      sheetOpen: false,
      actionSheetFor: null,
      openSwipeRow: null,
      noteMenuFor: null,
    }));
  };
  useEffect(() => {
    const scroller = findScroller(wrapRef.current);
    scroller?.scrollTo({top: state.scrollByTab[state.tab] ?? 0});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore only on tab change
  }, [state.tab]);
  const tabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order: TabId[] = ['compare', 'offers', 'notes'];
    const index = order.indexOf(state.tab);
    const next = order[(index + (event.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
    selectTab(next);
  };

  // -- Preset config (crossover preset is DERIVED, never hardcoded) ----------
  const presetConfig: Record<SliderId, {title: string; header: string; options: {label: string; value: number}[]}> = {
    growth: {
      title: 'equity growth',
      header: 'Set equity growth — annual growth applied to both grants',
      options: [
        {label: '0% — flat', value: 0},
        {label: '10%', value: 10},
        {label: \`\${STATED_GROWTH}% — stated\`, value: STATED_GROWTH},
        {label: \`\${fmtG(gStar)}% — crossover\`, value: gStar},
        {label: '40%', value: 40},
      ],
    },
    bonus: {
      title: 'bonus attainment',
      header: 'Set bonus attainment — payout as a share of target',
      options: [
        {label: '50%', value: 50},
        {label: \`\${STATED_BONUS}% — stated\`, value: STATED_BONUS},
        {label: '120%', value: 120},
        {label: '150%', value: 150},
      ],
    },
    city: {
      title: 'cost-of-living city',
      header: 'Set city — purchasing-power factor applies to both offers',
      options: CITIES.map((candidate, index) => ({
        label: \`\${candidate.name} — \${candidate.factorLabel} factor\`,
        value: index,
      })),
    },
  };

  // -- Sheet section rows (winner-first; reorders live if the ranking flips
  //    while the sheet is open — stress fixture 10) --------------------------
  const renderSheetSection = (offer: Offer, leads: boolean) => {
    const bonus = Math.round((offer.bonusTarget * bonusPct) / 100);
    const equity = Math.round((offer.grant / 4) * (1 + growthPct / 100));
    const total = adjust(offer.base + bonus + equity, city.factor);
    return (
      <section aria-label={\`\${offer.name} breakdown\`}>
        <h3 style={{...styles.sheetSectionTitle, color: offer.color}}>
          <span style={{...styles.vestDot, background: offer.color}} aria-hidden />
          {offer.name}
          {leads && delta !== 0 ? ' · leads' : ''}
        </h3>
        <div style={styles.sheetRow}>
          <span style={styles.sheetRowLabel}>Base</span>
          <span style={styles.sheetRowValue}>{fmtUsd(adjust(offer.base, city.factor))}</span>
        </div>
        <div style={styles.sheetRow}>
          <span style={styles.sheetRowLabel}>Bonus at {fmtG(bonusPct)}%</span>
          <span style={styles.sheetRowValue}>{fmtUsd(adjust(bonus, city.factor))}</span>
        </div>
        <div style={styles.sheetRow}>
          <span style={styles.sheetRowLabel}>Equity per yr at {fmtG(growthPct)}%</span>
          <span style={styles.sheetRowValue}>{fmtUsd(adjust(equity, city.factor))}</span>
        </div>
        <div style={styles.sheetTotalRow}>
          <span style={{flex: 1}}>Adjusted total{city.factor !== 1 ? \` · \${city.short} (\${city.factorLabel})\` : ''}</span>
          <span>{fmtUsd(total)}</span>
        </div>
        <div style={styles.rowDivider} />
      </section>
    );
  };

  // -- Render ------------------------------------------------------------------
  return (
    <div ref={wrapRef} style={styles.wrap}>
      <div
        style={{
          ...styles.shell,
          ...(locked ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}
        onClickCapture={handleShellClickCapture}>
        <style>{PTS_CSS}</style>
        <h1 className="pts-vh">Paritas offer comparison</h1>

        {/* NAV BAR — brand mark · verdictTicker · Refresh. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <ParitasMark />
          </div>
          <div style={styles.verdictTicker} aria-hidden>
            <span style={styles.tickerBrand}>Paritas</span>
            <span style={{...styles.tickerVerdict, color: leader?.color ?? 'var(--color-text-primary)'}}>
              {verdict}
            </span>
          </div>
          <div style={styles.navTrailing}>
            <button
              ref={refreshBtnRef}
              type="button"
              className="pts-btn pts-focusable"
              style={styles.iconBtn}
              aria-label="Refresh notes"
              onClick={handleRefresh}>
              <Icon icon={RefreshCwIcon} size="sm" />
            </button>
          </div>
        </header>

        {state.tab === 'compare' ? (
          <>
            <TugBar seamPct={seamPct} delta={delta} growthPct={growthPct} />
            {/* OFFER HEADER — two live-total cards; leader gets the 2px
                inset ring (suppressed at the dead heat — neutral state). */}
            <div style={styles.offerHeader}>
              {OFFERS.map(offer => (
                <button
                  key={offer.id}
                  type="button"
                  className="pts-btn pts-focusable"
                  style={{
                    ...styles.offerCard,
                    ...(leader?.id === offer.id ? {boxShadow: \`inset 0 0 0 2px \${offer.color}\`} : null),
                  }}
                  aria-label={\`\${offer.name}: \${fmtUsd(offer.id === 'halyard' ? totalA : totalB)} total — open breakdown\`}
                  onClick={event => openSheet(event.currentTarget)}>
                  <span style={{...styles.offerCardBar, background: offer.color}} aria-hidden />
                  <span style={styles.offerCardText}>
                    <span style={styles.offerCardName}>{offer.name}</span>
                    <span style={styles.offerCardTotal}>
                      {fmtUsd(offer.id === 'halyard' ? totalA : totalB)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        <main style={styles.main}>
          {state.tab === 'compare' ? (
            <>
              <h2 style={styles.sectionHeader}>Scenario sliders</h2>
              <div style={styles.listCard}>
                <ScenarioSliderRow
                  id="growth"
                  label="Equity growth"
                  ariaLabel="Equity growth percent"
                  value={growthPct}
                  min={0}
                  max={60}
                  step={1}
                  ghostValue={STATED_GROWTH}
                  driftText={\`\${growthPct - STATED_GROWTH >= 0 ? '+' : '−'}\${fmtG(Math.abs(growthPct - STATED_GROWTH))} pts vs stated\`}
                  valueText={\`\${fmtG(growthPct)}%\`}
                  flipAnnotation={
                    state.lastFlip != null
                      ? {
                          leftPct: (state.lastFlip.gStar / 60) * 100,
                          text: \`Ranking flipped at \${fmtG(state.lastFlip.gStar)}% growth\`,
                        }
                      : null
                  }
                  onInput={value => applyScenario({growthPct: value})}
                  onCommit={commitScenario}
                  onOpenPresets={opener => openActionSheet('growth', opener)}
                />
                {state.lastFlip != null ? (
                  // Static twin of the flip pill — screenshots and screen
                  // readers get it without hover or animation.
                  <div style={{padding: '0 16px 12px'}}>
                    <span style={styles.flipStatic}>
                      Ranking flipped at {fmtG(state.lastFlip.gStar)}% growth (g* = 10 + 0.12 × bonus)
                    </span>
                  </div>
                ) : null}
                <div style={styles.rowDivider} />
                <ScenarioSliderRow
                  id="bonus"
                  label="Bonus attainment"
                  ariaLabel="Bonus attainment percent"
                  value={bonusPct}
                  min={0}
                  max={150}
                  step={5}
                  ghostValue={STATED_BONUS}
                  driftText={\`\${bonusPct - STATED_BONUS >= 0 ? '+' : '−'}\${Math.abs(bonusPct - STATED_BONUS)} pts vs stated\`}
                  valueText={\`\${bonusPct}%\`}
                  onInput={value => applyScenario({bonusPct: value})}
                  onCommit={commitScenario}
                  onOpenPresets={opener => openActionSheet('bonus', opener)}
                />
                <div style={styles.rowDivider} />
                <ScenarioSliderRow
                  id="city"
                  label="Cost-of-living city"
                  ariaLabel="Cost-of-living city"
                  value={cityIdx}
                  min={0}
                  max={3}
                  step={1}
                  ghostValue={STATED_CITY_IDX}
                  driftText={cityIdx === STATED_CITY_IDX ? 'stated city' : 'stated: Austin'}
                  valueText={city.short}
                  ariaValueText={\`\${city.name} — \${city.factorLabel} factor\`}
                  onInput={value => applyScenario({cityIdx: value})}
                  onCommit={commitScenario}
                  onOpenPresets={opener => openActionSheet('city', opener)}
                />
              </div>

              <h2 style={styles.sectionHeader}>
                Vesting
                <span style={styles.sectionHeaderTrail}>at {fmtG(growthPct)}% growth</span>
              </h2>
              <VestStrip
                offer={OFFER_A}
                yearN={state.yearN.halyard}
                growthPct={growthPct}
                onYear={yearN => update({yearN: {...state.yearN, halyard: yearN}})}
              />
              <div style={styles.spacer12} />
              <VestStrip
                offer={OFFER_B}
                yearN={state.yearN.cinderbloom}
                growthPct={growthPct}
                onYear={yearN => update({yearN: {...state.yearN, cinderbloom: yearN}})}
              />

              <h2 style={styles.sectionHeader}>Comp mix</h2>
              <CompStackCard offer={OFFER_A} growthPct={growthPct} bonusPct={bonusPct} city={city} />
              <div style={styles.spacer12} />
              <CompStackCard offer={OFFER_B} growthPct={growthPct} bonusPct={bonusPct} city={city} />
              <div style={styles.spacer24} />
            </>
          ) : null}

          {state.tab === 'offers' ? (
            <>
              <h2 style={styles.sectionHeader}>Offers</h2>
              <div style={styles.listCard}>
                {OFFERS.map((offer, index) => (
                  <div key={offer.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    <button
                      type="button"
                      className="pts-btn pts-focusable"
                      style={styles.offerMediaRow}
                      aria-label={\`\${offer.legalName}: \${fmtUsd(offer.id === 'halyard' ? totalA : totalB)} total — open breakdown\`}
                      onClick={event => openSheet(event.currentTarget)}>
                      <span
                        style={{
                          ...styles.offerMarkTile,
                          background: offer.id === 'halyard' ? A_TINT_12 : B_TINT_12,
                          color: offer.color,
                        }}
                        aria-hidden>
                        {offer.initial}
                      </span>
                      <span style={styles.offerMediaText}>
                        <span style={styles.offerMediaName}>{offer.legalName}</span>
                        <span style={styles.offerMediaMeta}>
                          {offer.stage} · {offer.city}
                        </span>
                      </span>
                      <span style={{...styles.offerMediaTotal, color: offer.color}}>
                        {fmtUsd(offer.id === 'halyard' ? totalA : totalB)}
                      </span>
                    </button>
                  </div>
                ))}
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="pts-btn pts-focusable"
                  style={styles.utilityRow}
                  onClick={() =>
                    pushToast('Stated assumptions: 15% growth · 100% bonus · Austin (recruiter decks, Jun 2026)')
                  }>
                  Assumptions source: recruiter decks, Jun 2026
                </button>
              </div>
              <div style={styles.spacer24} />
            </>
          ) : null}

          {state.tab === 'notes' ? (
            <>
              <h2 style={styles.sectionHeader}>
                Recruiter questions
                <span style={styles.sectionHeaderTrail}>
                  {state.notes.length} {state.notes.length === 1 ? 'note' : 'notes'}
                </span>
              </h2>
              {state.notesLoading ? (
                // 4 skeletonRows at the notes' exact 60px geometry — zero
                // layout shift on resolve; ONE shared shimmer sweep,
                // removed entirely under prefers-reduced-motion.
                <div style={{...styles.listCard, position: 'relative'}} aria-busy="true">
                  {SKELETON_PRIMARY.map((width, index) => (
                    <div key={index}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.skeletonRow} aria-hidden="true">
                        <span style={{...styles.skeletonBar, width: \`\${width}%\`}} />
                        <span style={{...styles.skeletonBar, width: \`\${SKELETON_SECONDARY[index]}%\`}} />
                      </div>
                    </div>
                  ))}
                  <div className="pts-shimmer" aria-hidden />
                </div>
              ) : state.notes.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={StickyNoteIcon} size="md" />
                  </span>
                  <h3 style={styles.emptyTitle}>No notes</h3>
                  <p style={styles.emptyBody}>Questions for recruiters land here.</p>
                  <button
                    type="button"
                    className="pts-btn pts-focusable"
                    style={styles.emptyAction}
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        notes: [ADDED_NOTE],
                        toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: 'Note added · 1 note', undo: null},
                      }));
                    }}>
                    Add note
                  </button>
                </div>
              ) : (
                <div style={styles.listCard}>
                  {state.notes.map((note, index) => (
                    <NoteRow
                      key={note.id}
                      note={note}
                      isLast={index === state.notes.length - 1}
                      isOpen={state.openSwipeRow === note.id}
                      menuOpen={state.noteMenuFor === note.id}
                      onSetOpen={open => update({openSwipeRow: open ? note.id : null})}
                      onToggleMenu={open => update({noteMenuFor: open ? note.id : null})}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              )}
              {state.refreshed && !state.notesLoading ? (
                <p style={styles.updatedCaption} role="status">
                  Updated just now
                </p>
              ) : null}
              <div style={styles.spacer24} />
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow above
            the tabBar, absolute-in-shell only while scroll-locked. */}
        <div
          style={{...(locked ? styles.toastAnchorLocked : styles.toastAnchor), pointerEvents: 'none'}}
          aria-live="polite">
          {state.toast != null ? (
            <div
              className="pts-fade"
              style={{...styles.toast, ...(locked ? styles.toastLocked : null), pointerEvents: 'auto'}}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button type="button" className="pts-btn pts-focusable" style={styles.toastUndo} onClick={undoDelete}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — Compare · Offers (leader-initial badge) · Notes. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Paritas sections" onKeyDown={tabKeyDown}>
          {(
            [
              {id: 'compare' as TabId, label: 'Compare', icon: ScaleIcon},
              {id: 'offers' as TabId, label: 'Offers', icon: BriefcaseIcon},
              {id: 'notes' as TabId, label: 'Notes', icon: StickyNoteIcon},
            ]
          ).map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="pts-btn pts-focusable"
                style={{
                  ...styles.tabItem,
                  ...(active ? {color: OFFER_A_COLOR} : null),
                }}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="sm" />
                  {tab.id === 'offers' && leader != null ? (
                    <span
                      style={{...styles.tabBadge, background: leader.color, color: leader.onColor}}
                      aria-hidden>
                      {leader.initial}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? {fontWeight: 600} : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* BREAKDOWN SHEET — winner section FIRST; reorders live. */}
        {state.sheetOpen ? (
          <>
            <div className="pts-fade" style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              className="pts-sheet-in"
              style={{
                ...styles.sheet,
                height: state.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pts-sheet-title"
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  closeSheet();
                } else {
                  trapTabKey(event, sheetRef.current);
                }
              }}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="pts-btn pts-focusable"
                  style={{width: 44, height: 16, display: 'grid', placeItems: 'center'}}
                  aria-label="Resize sheet"
                  onClick={() => update({sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'})}>
                  <span style={styles.grabberPill} aria-hidden />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span aria-hidden />
                <h2 id="pts-sheet-title" style={styles.sheetTitle}>
                  Comp breakdown
                </h2>
                <button
                  ref={sheetCloseRef}
                  type="button"
                  className="pts-btn pts-focusable"
                  style={styles.iconBtn}
                  aria-label="Close breakdown"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="sm" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                {renderSheetSection(winner, true)}
                {renderSheetSection(runnerUp, false)}
                <h3 style={{...styles.sheetSectionTitle, color: 'var(--color-text-secondary)'}}>One-time</h3>
                {OFFERS.map(offer => (
                  <div key={offer.id} style={styles.sheetRow}>
                    <span style={styles.sheetRowLabel}>
                      {offer.name} sign-on · one-time (excluded from run-rate)
                    </span>
                    <span style={styles.sheetRowValue}>{fmtUsd(offer.signOn)}</span>
                  </div>
                ))}
                <p style={styles.sheetCaption}>
                  Crossover law: the ranking flips at g* = 10 + 0.12 × bonus attainment — at {fmtG(bonusPct)}%
                  attainment that is {fmtG(gStar)}% growth. City factors scale both offers, so the leader never
                  changes with the city.
                </p>
              </div>
            </div>
          </>
        ) : null}

        {/* ACTION SHEET — 'Set value' presets; Cancel card below. */}
        {state.actionSheetFor != null ? (
          <>
            <div className="pts-fade" style={styles.sheetScrim} onClick={closeActionSheet} aria-hidden />
            <div
              ref={actionSheetRef}
              className="pts-sheet-in"
              style={styles.actionSheetWrap}
              role="dialog"
              aria-modal="true"
              aria-label={\`Set \${presetConfig[state.actionSheetFor].title}\`}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  closeActionSheet();
                } else {
                  trapTabKey(event, actionSheetRef.current);
                }
              }}>
              <div style={styles.actionSheetCard}>
                <div style={styles.actionSheetHeader}>{presetConfig[state.actionSheetFor].header}</div>
                {presetConfig[state.actionSheetFor].options.map(option => (
                  <div key={option.label}>
                    <div style={styles.actionSheetHairline} />
                    <button
                      type="button"
                      className="pts-btn pts-focusable"
                      style={styles.actionSheetRow}
                      onClick={() => commitPreset(state.actionSheetFor as SliderId, option.value)}>
                      {option.label}
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.actionSheetCard}>
                <button
                  ref={actionCancelRef}
                  type="button"
                  className="pts-btn pts-focusable"
                  style={styles.actionSheetCancel}
                  onClick={closeActionSheet}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};