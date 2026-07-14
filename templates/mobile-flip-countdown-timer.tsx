// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Flipfocus focus timer frozen at
 *   TODAY 'Thu, Jul 9': the session starts at the 25:00 Pomodoro fixture
 *   (presets Pomodoro 25:00 / Break 5:00 / Deep 50:00), today's base stats
 *   are 2 sessions · 50 min (each completion derives +1 session and
 *   +round(total/60) min from the SAME store — no parallel literals), and
 *   the streak strip is M/T/W filled, Thu = today (fills on completion),
 *   Fri empty. No Date.now(), no Math.random(), no network media; the only
 *   timers are the 1s tick interval while running and CSS choreography —
 *   both cleaned up, never wall-clock reads.
 * @output Flipfocus — Flip Countdown Timer: a 390px MOBILE motion-first
 *   focus timer. NavBar (52px, flap mark · 'Flipfocus' · 44×44 Reset) over
 *   a 300px dial: an SVG session-progress arc (r=140, stroke-dashoffset
 *   synced to remaining/total, 1s linear sweep while ticking) wrapping four
 *   SPLIT-FLAP digits (MM:SS). Each digit is a two-half 42×62 card under
 *   perspective: on change the top flap rotates rotateX 0→−90 (150ms
 *   ease-in) revealing the next value beneath, then the bottom flap
 *   completes −90→0 (170ms decelerate), across a 1px crease hairline;
 *   flips chain via animationend and catch up if the target moved. Digits
 *   tick on a 1s interval while running. Controls: a 64px play/pause morph
 *   button (icons crossfade/scale-swap; a ring pulses while running),
 *   −5:00 / +5:00 chips whose multi-digit changes CASCADE-FLIP left→right
 *   with a 60ms stagger per affected digit, a Pomodoro 25 / Break 5 /
 *   Deep 50 preset row (aria-pressed chips), and a dashed 'Skip to last 5s'
 *   demo chip. At 00:00 the arc completes, a gentle three-pulse halo plays
 *   around the dial (3 keyframe iterations, removed on animationend), and a
 *   'Session complete · 25 min' card slides up with the 5-dot streak row —
 *   today's dot fills with an overshoot pop — plus a 'Start another'
 *   restart. The Today stat strip (Sessions / Focus / Streak, tabular)
 *   re-derives 2→3 · 50→75 · 3→4 on completion. Every control is a plain
 *   ≥44×44 button (no gestures), and every outcome lands in the ONE polite
 *   toast dock. Reduced motion: flips become instant digit swaps, the
 *   pulse/halo loops are REMOVED (not slowed), the arc steps discretely,
 *   and the completion card appears with opacity only.
 * @position Page template; emitted by `astryx template mobile-flip-countdown-timer`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px sticky
 *   navBar at y=0 is the first pixel). No sheets/scrims here, so the shell
 *   never scroll-locks; position:fixed is banned regardless. The single
 *   polite toast live region rides a sticky bottom:0 dock at bottom:16
 *   (no tabBar on this surface); one toast at a time, a new toast REPLACES
 *   the old, dismiss is a real 44×44 button.
 * Animation policy (batch contract): transform/opacity only, plus SVG
 *   stroke-dashoffset on the progress arc; all keyframes/transitions live
 *   in the FCT_CSS <style> constant under the unique `fct-` prefix;
 *   overshoot = cubic-bezier(0.34,1.56,0.64,1), decelerate =
 *   cubic-bezier(0.22,1,0.36,1); phases chain on animationend; stagger via
 *   per-digit animationDelay. prefers-reduced-motion is read once via
 *   matchMedia in a useEffect (with change listener); a CSS media block is
 *   the backstop (flap durations collapse to 1ms so animationend still
 *   commits, loops are removed entirely).
 * Color policy: token-pure chrome. THE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#C2410C, #FDBA74) — white 16px+ text/icons
 *   on #C2410C ≈ 5.2:1; near-black #201207 on #FDBA74 ≈ 10.7:1; as a bare
 *   arc/ring fill: #C2410C on the white body ≈ 5.2:1 and #FDBA74 on the
 *   ~#141414 dark body ≈ 9.8:1 — all ≥3:1. Sanctioned non-brand literals
 *   (math at each declaration): the split-flap digit card pair
 *   DIGIT_BG/DIGIT_TEXT (specimen art, ≈13.8:1 light / ≈17:1 dark), the
 *   flap CREASE hairline (decorative, rides the dark card), and TRACK_REST
 *   for the un-swept arc (meaningful rest-state fill ≥3:1 vs the body
 *   surface, NOT a hairline token). Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px section
 *   gaps · 8px chip gaps; navBar 52px sticky top z20 (paddingInline 8,
 *   grid '1fr auto 1fr', always-on hairline); dial zone 300×300 centered
 *   (digits 42×62, colon 14, row ≈ 210 < the 264px chord at the digit
 *   band); controls row 64px play + 44px chips; preset chips 52px;
 *   stat strip 3 hairline-split cells. TYPE (Figtree via
 *   --font-family-body): 32/700 flap digits · 22/700 stat values · 17/600
 *   nav + card titles · 16/400 body · 13/400 meta · 11/500 overlines;
 *   nothing under 11px; tabular-nums on every count. Touch law: every
 *   interactive target ≥44×44.
 *
 * Responsive contract:
 * - Fluid 320–430: the dial is fixed 300 centered (300 + 2×16 = 332 > 320,
 *   so the dial shrinks to min(300, width−32) via a measured scale
 *   transform? No — simpler and layout-safe: the dial column is 300 wide
 *   with marginInline:auto and the shell clips overflow-x at 320 by ≤6px
 *   per side on the arc's outer 4px; digits/controls/preset rows all fit
 *   at 320 (preset chips flex:1 minWidth 0, labels ellipsize).
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — the inline demo stage never fires viewport
 *   queries) — ≥560px renders the standard centered 430px phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline) on a
 *   var(--color-background-muted) backdrop. Never a stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  CheckIcon,
  FastForwardIcon,
  FlameIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  TimerIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each with contrast math.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Flipfocus ember). White text/icons on
// #C2410C ≈ 5.2:1; near-black #201207 on #FDBA74 ≈ 10.7:1. As a bare
// arc/ring/dot fill: #C2410C on the white body ≈ 5.2:1; #FDBA74 on the
// ~#141414 dark body ≈ 9.8:1 — all clear the ≥3:1 bar for meaningful fills.
const BRAND_ACCENT = 'light-dark(#C2410C, #FDBA74)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #201207)';
// Brand-tinted wash for the selected preset chip / streak seat.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// SPLIT-FLAP CARD — specimen art (the whole point of the template), kept
// dark in BOTH schemes like a real departure board. #F7F8FC digits on
// #232838 ≈ 13.8:1 (light scheme) and on #10131B ≈ 17:1 (dark scheme).
const DIGIT_BG = 'light-dark(#232838, #10131B)';
const DIGIT_TEXT = '#F7F8FC';
// Crease hairline across the flap card — decorative shading ON the dark
// art card (not chrome), so a translucent black literal is sanctioned.
const CREASE = 'rgba(0, 0, 0, 0.45)';
// Un-swept remainder of the session arc — a meaningful rest-state fill, so
// an explicit pair at ≥3:1 against its ACTUAL surface (the body background)
// at FULL opacity: #8E8E96 on ~#FFFFFF ≈ 3.3:1; #77777F on ~#141414 ≈ 4.2:1.
// NOT the hairline token.
const TRACK_REST = 'light-dark(#8E8E96, #77777F)';

// ---------------------------------------------------------------------------
// INJECTED CSS — unique `fct-` prefix. Transform/opacity (+ SVG
// stroke-dashoffset via inline style) only. Reduced-motion backstop:
// flap animations collapse to 1ms (so animationend still commits state);
// pulse/halo/pop loops are REMOVED entirely; transitions go instant.
// ---------------------------------------------------------------------------

const FLIP_TOP_MS = 150;
const FLIP_BOTTOM_MS = 170;

const FCT_CSS = `
.fct-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fct-btn:disabled { cursor: default; }
.fct-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.fct-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.fct-anim { transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease; }
.fct-fade { transition: opacity 200ms ease; }
/* Split-flap halves. Top flap folds down 0 -> -90 (ease-in: gravity),
   bottom flap completes -90 -> 0 (decelerate: landing). */
@keyframes fct-flap-top {
  from { transform: rotateX(0deg); }
  to { transform: rotateX(-90deg); }
}
.fct-flap-top {
  animation: fct-flap-top ${FLIP_TOP_MS}ms cubic-bezier(0.55, 0, 1, 0.45) forwards;
}
@keyframes fct-flap-bottom {
  from { transform: rotateX(-90deg); }
  to { transform: rotateX(0deg); }
}
.fct-flap-bottom {
  animation: fct-flap-bottom ${FLIP_BOTTOM_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
/* Ring pulse while running — a loop, so REMOVED under reduced motion. */
@keyframes fct-pulse {
  from { transform: scale(1); opacity: 0.55; }
  to { transform: scale(1.28); opacity: 0; }
}
.fct-pulse { animation: fct-pulse 1800ms cubic-bezier(0.22, 1, 0.36, 1) infinite; }
/* Completion halo — exactly three gentle pulses, removed on animationend. */
@keyframes fct-halo {
  0% { transform: scale(0.94); opacity: 0.5; }
  60% { transform: scale(1.06); opacity: 0.22; }
  100% { transform: scale(1.1); opacity: 0; }
}
.fct-halo { animation: fct-halo 640ms ease-out 3; }
/* Completion card slide-up + streak-dot overshoot pop. */
@keyframes fct-rise {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.fct-rise { animation: fct-rise 320ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes fct-pop {
  0% { transform: scale(0); }
  70% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
.fct-pop { animation: fct-pop 360ms cubic-bezier(0.34, 1.56, 0.64, 1) 240ms backwards; }
@media (prefers-reduced-motion: reduce) {
  /* Flaps must still fire animationend to commit — 1ms, no delay. */
  .fct-flap-top, .fct-flap-bottom {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
  }
  .fct-pulse, .fct-halo, .fct-pop { animation: none; }
  .fct-rise { animation: fct-rise 1ms linear; }
  .fct-anim, .fct-fade { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const DIGIT_W = 42;
const DIGIT_H = 62;
const DIGIT_HALF = DIGIT_H / 2; // 31
const DIAL = 300;
const ARC_R = 140;
const ARC_C = 2 * Math.PI * ARC_R; // ≈ 879.6 — dasharray/offset both derive

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {background: 'var(--color-background-muted)', minHeight: '100dvh'},
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, always-on hairline.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSeat: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // DIAL — 300×300 arc + halo + centered flap clock.
  dialSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 24,
  },
  dialZone: {position: 'relative', width: DIAL, height: DIAL, flexShrink: 0},
  dialSvg: {display: 'block', width: DIAL, height: DIAL},
  halo: {
    position: 'absolute',
    inset: 4,
    borderRadius: '50%',
    border: `3px solid ${BRAND_ACCENT}`,
    opacity: 0,
    pointerEvents: 'none',
  },
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
  },
  clockStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12},
  digitsRow: {display: 'flex', alignItems: 'center', gap: 6},
  // SPLIT-FLAP DIGIT — 42×62 two-half card under perspective; flaps are
  // absolute halves that rotate around the crease line.
  digit: {
    position: 'relative',
    width: DIGIT_W,
    height: DIGIT_H,
    perspective: '260px',
    flexShrink: 0,
  },
  digitHalfTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: DIGIT_HALF,
    overflow: 'hidden',
    background: DIGIT_BG,
    borderRadius: '6px 6px 0 0',
    zIndex: 1,
  },
  digitHalfBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DIGIT_HALF,
    overflow: 'hidden',
    background: DIGIT_BG,
    borderRadius: '0 0 6px 6px',
    zIndex: 1,
  },
  flapTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: DIGIT_HALF,
    overflow: 'hidden',
    background: DIGIT_BG,
    borderRadius: '6px 6px 0 0',
    zIndex: 2,
    transformOrigin: 'bottom',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  },
  flapBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DIGIT_HALF,
    overflow: 'hidden',
    background: DIGIT_BG,
    borderRadius: '0 0 6px 6px',
    zIndex: 2,
    transformOrigin: 'top',
    transform: 'rotateX(-90deg)', // holds folded through its stagger delay
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  },
  // Full-height glyph clipped by each half; bottom halves pull it up 31px.
  digitGlyph: {
    display: 'block',
    width: '100%',
    height: DIGIT_H,
    lineHeight: `${DIGIT_H}px`,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: DIGIT_TEXT,
  },
  digitGlyphLower: {marginTop: -DIGIT_HALF},
  digitCrease: {
    position: 'absolute',
    top: DIGIT_HALF,
    left: 0,
    right: 0,
    height: 1,
    background: CREASE,
    zIndex: 3,
  },
  colon: {
    width: 14,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  colonDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--color-text-secondary)',
  },
  sessionLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // CONTROLS — [−5:00] · 64px play/pause · [+5:00].
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
    paddingInline: 16,
  },
  adjustChip: {
    height: 44,
    paddingInline: 14,
    borderRadius: 22,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  adjustChipDisabled: {opacity: 0.35},
  playWrap: {position: 'relative', width: 64, height: 64, flexShrink: 0},
  playBtn: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    zIndex: 1,
  },
  playIconSeat: {position: 'relative', width: 24, height: 24},
  playIconLayer: {position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'},
  pulseRing: {
    position: 'absolute',
    inset: -7,
    borderRadius: '50%',
    border: `2px solid ${BRAND_ACCENT}`,
    pointerEvents: 'none',
  },
  // PRESETS — 3 aria-pressed chips, 8px gaps, flex:1 minWidth 0.
  presetRow: {
    display: 'flex',
    gap: 8,
    paddingInline: 16,
    marginTop: 24,
  },
  presetChip: {
    flex: 1,
    minWidth: 0,
    height: 52,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  presetChipActive: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
  },
  presetName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    paddingInline: 6,
  },
  presetTime: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // DEMO CHIP — dashed affordance, still a ≥44px target.
  demoRow: {display: 'flex', justifyContent: 'center', marginTop: 12},
  demoChip: {
    height: 44,
    paddingInline: 14,
    borderRadius: 22,
    border: '1px dashed var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  // COMPLETION CARD — slides up at 00:00.
  completeCard: {
    marginInline: 16,
    marginTop: 24,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  completeHeader: {display: 'flex', alignItems: 'center', gap: 12},
  completeSeat: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  completeText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  completeTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  completeSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  streakRow: {display: 'flex', justifyContent: 'center', gap: 16},
  streakDay: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4},
  streakDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid var(--color-border)',
    color: BRAND_FILL_TEXT,
  },
  streakDotFilled: {background: BRAND_ACCENT, border: `1px solid ${BRAND_ACCENT}`},
  streakDayLabel: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  startAnotherBtn: {
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    width: '100%',
  },
  // TODAY STATS — 3 hairline-split cells in an inset-grouped card.
  sectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 32,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  statCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    display: 'flex',
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '14px 8px',
  },
  statHairline: {width: 1, background: 'var(--color-border)'},
  statValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
  statCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  // TOAST — the single polite live region, sticky dock at bottom:16
  // (no tabBar on this surface).
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
    insetInline: 16,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  toastDismiss: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// DATA =============
// Deterministic fixtures: TODAY 'Thu, Jul 9'; the clock starts at the
// Pomodoro 25:00 fixture; base stats 2 sessions · 50 min · 3-day streak
// (M/T/W filled, Thu = today, Fri empty). Every on-screen count derives
// from ONE store — completion adds +1 session, +round(totalSec/60) min,
// and fills today's dot; there are no parallel literals.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Thu, Jul 9';
const BASE_SESSIONS = 2;
const BASE_MINUTES = 50;
const BASE_STREAK = 3;

type PresetId = 'pomodoro' | 'break' | 'deep';

interface Preset {
  id: PresetId;
  name: string;
  sec: number;
}

const PRESETS: Preset[] = [
  {id: 'pomodoro', name: 'Pomodoro', sec: 25 * 60},
  {id: 'break', name: 'Break', sec: 5 * 60},
  {id: 'deep', name: 'Deep', sec: 50 * 60},
];

const PRESET_BY_ID: Record<PresetId, Preset> = {
  pomodoro: PRESETS[0],
  break: PRESETS[1],
  deep: PRESETS[2],
};

// Streak strip — Mon/Tue/Wed done (fixture), Thu is today, Fri open.
const STREAK_DAYS = [
  {id: 'mon', label: 'M', done: true},
  {id: 'tue', label: 'T', done: true},
  {id: 'wed', label: 'W', done: true},
  {id: 'thu', label: 'T', done: false, isToday: true},
  {id: 'fri', label: 'F', done: false},
];

const ADJUST_SEC = 5 * 60;
const MAX_SEC = 95 * 60; // keeps MM at two digits with headroom
const SKIP_TO_SEC = 5;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/** 1500 → '25:00'. Every clock/toast string derives from this. */
function formatTime(sec: number): string {
  return `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;
}

/** The four flap glyphs (colon excluded): 1500 → ['2','5','0','0']. */
function digitsOf(sec: number): [string, string, string, string] {
  const text = formatTime(sec);
  return [text.charAt(0), text.charAt(1), text.charAt(3), text.charAt(4)];
}

const ZERO_DELAYS: [number, number, number, number] = [0, 0, 0, 0];

/**
 * Cascade stagger for programmatic jumps (+5:00 / −5:00 / presets / skip):
 * changed digits flip left→right at 60ms intervals; unchanged digits hold.
 */
function cascadeDelays(fromSec: number, toSec: number): [number, number, number, number] {
  const from = digitsOf(fromSec);
  const to = digitsOf(toSec);
  let order = 0;
  return [0, 1, 2, 3].map(index =>
    from[index] === to[index] ? 0 : order++ * 60,
  ) as [number, number, number, number];
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — timerStore. The tick interval, the chips, the presets,
// the demo skip, and the completion choreography all mutate this single
// object; stats/streak/toast strings derive from it.
// ---------------------------------------------------------------------------

interface TimerStore {
  presetId: PresetId;
  totalSec: number; // session length (grows/shrinks with ±5:00)
  remainingSec: number;
  running: boolean;
  completed: boolean;
  doneSessions: number; // starts at BASE_SESSIONS, +1 per completion
  doneMinutes: number; // starts at BASE_MINUTES, +round(totalSec/60)
  todayFilled: boolean; // today's streak dot
  celebrateSeq: number; // keys the halo + streak pop per completion
  flipDelays: [number, number, number, number];
  toast: {seq: number; text: string} | null;
}

const INITIAL_STORE: TimerStore = {
  presetId: 'pomodoro',
  totalSec: PRESET_BY_ID.pomodoro.sec,
  remainingSec: PRESET_BY_ID.pomodoro.sec,
  running: false,
  completed: false,
  doneSessions: BASE_SESSIONS,
  doneMinutes: BASE_MINUTES,
  todayFilled: false,
  celebrateSeq: 0,
  flipDelays: ZERO_DELAYS,
  toast: null,
};

function nextToastSeq(prev: TimerStore): number {
  return (prev.toast?.seq ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// HOOKS — container width (the inline demo stage never fires viewport
// queries) and prefers-reduced-motion via matchMedia with a change listener.
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

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// FLIP DIGIT — a two-half card. On value change (and !reducedMotion) it
// stages {from, to}: the top flap folds 0→−90 revealing `to` beneath, then
// the bottom flap lands −90→0; animationend commits and chains a catch-up
// flip if the target moved mid-flight. Stagger arrives via delayMs.
// ---------------------------------------------------------------------------

interface FlipState {
  from: string;
  to: string;
  delay: number;
}

function FlipDigit({
  value,
  delayMs,
  reducedMotion,
}: {
  value: string;
  delayMs: number;
  reducedMotion: boolean;
}) {
  const shownRef = useRef(value);
  const targetRef = useRef(value);
  const [shown, setShown] = useState(value);
  const [flip, setFlip] = useState<FlipState | null>(null);

  useEffect(() => {
    targetRef.current = value;
    if (value === shownRef.current) {
      return;
    }
    if (reducedMotion) {
      // Instant digit swap — the reduced-motion contract.
      shownRef.current = value;
      setShown(value);
      setFlip(null);
      return;
    }
    setFlip({from: shownRef.current, to: value, delay: delayMs});
  }, [value, delayMs, reducedMotion]);

  const commitFlip = useCallback(() => {
    setFlip(current => {
      if (current == null) {
        return null;
      }
      shownRef.current = current.to;
      setShown(current.to);
      // Catch up without stagger if the target moved during the flip.
      return targetRef.current !== current.to
        ? {from: current.to, to: targetRef.current, delay: 0}
        : null;
    });
  }, []);

  return (
    <span style={styles.digit} aria-hidden>
      {/* Static top: the NEXT value waits under the falling flap. */}
      <span style={styles.digitHalfTop}>
        <span style={styles.digitGlyph}>{flip?.to ?? shown}</span>
      </span>
      {/* Static bottom: the OLD value holds until the bottom flap lands. */}
      <span style={styles.digitHalfBottom}>
        <span style={{...styles.digitGlyph, ...styles.digitGlyphLower}}>
          {flip?.from ?? shown}
        </span>
      </span>
      {flip != null ? (
        <>
          <span
            key={`t-${flip.from}-${flip.to}`}
            className="fct-flap-top"
            style={{...styles.flapTop, animationDelay: `${flip.delay}ms`}}>
            <span style={styles.digitGlyph}>{flip.from}</span>
          </span>
          <span
            key={`b-${flip.from}-${flip.to}`}
            className="fct-flap-bottom"
            style={{...styles.flapBottom, animationDelay: `${flip.delay + FLIP_TOP_MS}ms`}}
            onAnimationEnd={commitFlip}>
            <span style={{...styles.digitGlyph, ...styles.digitGlyphLower}}>{flip.to}</span>
          </span>
        </>
      ) : null}
      <span style={styles.digitCrease} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileFlipCountdownTimerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktopColumn = wrapWidth > 560;
  const reducedMotion = useReducedMotion();

  const [store, setStore] = useState<TimerStore>(INITIAL_STORE);
  // The halo renders while celebrateSeq is ahead of haloSeq; its 3rd
  // animationend (or reduced motion) retires it.
  const [haloSeq, setHaloSeq] = useState(0);

  // THE 1s TICK — the only recurring timer; cleaned up on pause/unmount.
  useEffect(() => {
    if (!store.running) {
      return undefined;
    }
    const id = setInterval(() => {
      setStore(prev => {
        if (!prev.running) {
          return prev;
        }
        const nextRemaining = Math.max(0, prev.remainingSec - 1);
        if (nextRemaining === 0) {
          // COMPLETION — one transaction: stop, celebrate, derive stats.
          const minutes = Math.round(prev.totalSec / 60);
          return {
            ...prev,
            remainingSec: 0,
            running: false,
            completed: true,
            doneSessions: prev.doneSessions + 1,
            doneMinutes: prev.doneMinutes + minutes,
            todayFilled: true,
            celebrateSeq: prev.celebrateSeq + 1,
            flipDelays: ZERO_DELAYS,
            toast: {seq: nextToastSeq(prev), text: `Session complete · ${minutes} min`},
          };
        }
        return {...prev, remainingSec: nextRemaining, flipDelays: ZERO_DELAYS};
      });
    }, 1000);
    return () => clearInterval(id);
  }, [store.running]);

  // VERBS ---------------------------------------------------------------

  const toggleRun = useCallback(() => {
    setStore(prev => {
      if (prev.completed) {
        // Fresh session of the current preset — the replay path.
        const base = PRESET_BY_ID[prev.presetId];
        return {
          ...prev,
          totalSec: base.sec,
          remainingSec: base.sec,
          running: true,
          completed: false,
          flipDelays: cascadeDelays(prev.remainingSec, base.sec),
          toast: {seq: nextToastSeq(prev), text: `New session · ${formatTime(base.sec)}`},
        };
      }
      return {...prev, running: !prev.running};
    });
  }, []);

  const adjust = useCallback((deltaSec: number) => {
    setStore(prev => {
      if (prev.completed) {
        return prev;
      }
      const nextRemaining = Math.min(
        MAX_SEC,
        Math.max(0, prev.remainingSec + deltaSec),
      );
      if (nextRemaining === prev.remainingSec || nextRemaining === 0) {
        return prev;
      }
      const applied = nextRemaining - prev.remainingSec;
      return {
        ...prev,
        remainingSec: nextRemaining,
        // The session grows/shrinks with the clock so the arc stays honest.
        totalSec: Math.max(nextRemaining, prev.totalSec + applied),
        flipDelays: cascadeDelays(prev.remainingSec, nextRemaining),
        toast: {
          seq: nextToastSeq(prev),
          text: `${applied > 0 ? '+5:00' : '−5:00'} · ${formatTime(nextRemaining)} on the clock`,
        },
      };
    });
  }, []);

  const selectPreset = useCallback((presetId: PresetId) => {
    setStore(prev => {
      const preset = PRESET_BY_ID[presetId];
      if (presetId === prev.presetId && prev.remainingSec === preset.sec && !prev.completed) {
        return prev;
      }
      return {
        ...prev,
        presetId,
        totalSec: preset.sec,
        remainingSec: preset.sec,
        running: false,
        completed: false,
        flipDelays: cascadeDelays(prev.remainingSec, preset.sec),
        toast: {seq: nextToastSeq(prev), text: `${preset.name} · ${formatTime(preset.sec)} ready`},
      };
    });
  }, []);

  const skipToLastFive = useCallback(() => {
    setStore(prev => {
      if (prev.completed || prev.remainingSec <= SKIP_TO_SEC) {
        return prev;
      }
      return {
        ...prev,
        remainingSec: SKIP_TO_SEC,
        running: true,
        flipDelays: cascadeDelays(prev.remainingSec, SKIP_TO_SEC),
        toast: {seq: nextToastSeq(prev), text: 'Skipping ahead · 00:05 left'},
      };
    });
  }, []);

  const reset = useCallback(() => {
    setStore(prev => {
      const base = PRESET_BY_ID[prev.presetId];
      return {
        ...prev,
        totalSec: base.sec,
        remainingSec: base.sec,
        running: false,
        completed: false,
        flipDelays: cascadeDelays(prev.remainingSec, base.sec),
        toast: {seq: nextToastSeq(prev), text: `Reset · ${formatTime(base.sec)} ready`},
      };
    });
  }, []);

  // DERIVED ---------------------------------------------------------------

  const preset = PRESET_BY_ID[store.presetId];
  const digits = digitsOf(store.remainingSec);
  const timeLabel = formatTime(store.remainingSec);
  // Arc: dasharray C, offset C·(remaining/total) → full circle at 00:00.
  const arcOffset = ARC_C * (store.totalSec > 0 ? store.remainingSec / store.totalSec : 0);
  const stateLabel = store.completed ? 'complete' : store.running ? 'running' : 'paused';
  const streakCount = BASE_STREAK + (store.todayFilled ? 1 : 0);
  const sessionMinutes = Math.round(store.totalSec / 60);
  const celebrating = store.celebrateSeq > haloSeq;

  return (
    <div
      ref={wrapRef}
      style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{FCT_CSS}</style>
      <div style={{...styles.shell, ...(isDesktopColumn ? styles.shellDesktop : null)}}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat} aria-hidden>
              <Icon icon={TimerIcon} size="lg" color="inherit" />
            </span>
          </div>
          <p style={styles.navTitle}>Flipfocus</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fct-btn fct-focusable"
              style={styles.iconBtn}
              aria-label={`Reset session to ${formatTime(preset.sec)}`}
              onClick={reset}>
              <Icon icon={RotateCcwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="fct-vh">Flipfocus — split-flap focus timer</h1>

          {/* DIAL — progress arc wrapping the split-flap clock. */}
          <section style={styles.dialSection} aria-label="Session clock">
            <div style={styles.dialZone}>
              <svg style={styles.dialSvg} viewBox={`0 0 ${DIAL} ${DIAL}`} aria-hidden>
                <circle
                  cx={DIAL / 2}
                  cy={DIAL / 2}
                  r={ARC_R}
                  fill="none"
                  style={{stroke: TRACK_REST}}
                  strokeWidth={6}
                />
                <circle
                  cx={DIAL / 2}
                  cy={DIAL / 2}
                  r={ARC_R}
                  fill="none"
                  style={{
                    stroke: BRAND_ACCENT,
                    // Discrete steps under reduced motion; 1s linear sweep
                    // between ticks while running; decelerate on jumps.
                    transition: reducedMotion
                      ? 'none'
                      : store.running
                        ? 'stroke-dashoffset 1000ms linear'
                        : 'stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={ARC_C}
                  strokeDashoffset={arcOffset}
                  transform={`rotate(-90 ${DIAL / 2} ${DIAL / 2})`}
                />
              </svg>
              {/* Three-pulse completion halo — removed after its 3rd pass;
                  never rendered under reduced motion. */}
              {celebrating && !reducedMotion ? (
                <div
                  key={store.celebrateSeq}
                  className="fct-halo"
                  style={styles.halo}
                  onAnimationEnd={() => setHaloSeq(store.celebrateSeq)}
                  aria-hidden
                />
              ) : null}
              <div style={styles.dialCenter}>
                <div
                  style={styles.clockStack}
                  role="timer"
                  aria-label={`${timeLabel} remaining of ${formatTime(store.totalSec)} — ${preset.name} ${stateLabel}`}>
                  <div style={styles.digitsRow}>
                    <FlipDigit value={digits[0]} delayMs={store.flipDelays[0]} reducedMotion={reducedMotion} />
                    <FlipDigit value={digits[1]} delayMs={store.flipDelays[1]} reducedMotion={reducedMotion} />
                    <span style={styles.colon} aria-hidden>
                      <span style={styles.colonDot} />
                      <span style={styles.colonDot} />
                    </span>
                    <FlipDigit value={digits[2]} delayMs={store.flipDelays[2]} reducedMotion={reducedMotion} />
                    <FlipDigit value={digits[3]} delayMs={store.flipDelays[3]} reducedMotion={reducedMotion} />
                  </div>
                  <span style={styles.sessionLabel}>
                    {preset.name} · {sessionMinutes} min · {stateLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CONTROLS — −5:00 · play/pause morph · +5:00. */}
          <div style={styles.controlsRow}>
            <button
              type="button"
              className="fct-btn fct-focusable"
              style={{
                ...styles.adjustChip,
                ...(store.completed || store.remainingSec <= ADJUST_SEC
                  ? styles.adjustChipDisabled
                  : null),
              }}
              disabled={store.completed || store.remainingSec <= ADJUST_SEC}
              aria-label="Subtract five minutes"
              onClick={() => adjust(-ADJUST_SEC)}>
              <Icon icon={MinusIcon} size="sm" color="inherit" />
              5:00
            </button>
            <div style={styles.playWrap}>
              {store.running && !reducedMotion ? (
                <span className="fct-pulse" style={styles.pulseRing} aria-hidden />
              ) : null}
              <button
                type="button"
                className="fct-btn fct-focusable"
                style={styles.playBtn}
                aria-label={
                  store.completed
                    ? `Start a new ${preset.name} session`
                    : store.running
                      ? 'Pause session'
                      : 'Start session'
                }
                onClick={toggleRun}>
                <span style={styles.playIconSeat} aria-hidden>
                  <span
                    className="fct-anim"
                    style={{
                      ...styles.playIconLayer,
                      opacity: store.running ? 0 : 1,
                      transform: store.running ? 'scale(0.5) rotate(-45deg)' : 'none',
                    }}>
                    <Icon icon={PlayIcon} size="lg" color="inherit" />
                  </span>
                  <span
                    className="fct-anim"
                    style={{
                      ...styles.playIconLayer,
                      opacity: store.running ? 1 : 0,
                      transform: store.running ? 'none' : 'scale(0.5) rotate(45deg)',
                    }}>
                    <Icon icon={PauseIcon} size="lg" color="inherit" />
                  </span>
                </span>
              </button>
            </div>
            <button
              type="button"
              className="fct-btn fct-focusable"
              style={{
                ...styles.adjustChip,
                ...(store.completed || store.remainingSec >= MAX_SEC
                  ? styles.adjustChipDisabled
                  : null),
              }}
              disabled={store.completed || store.remainingSec >= MAX_SEC}
              aria-label="Add five minutes"
              onClick={() => adjust(ADJUST_SEC)}>
              <Icon icon={PlusIcon} size="sm" color="inherit" />
              5:00
            </button>
          </div>

          {/* PRESETS. */}
          <div style={styles.presetRow} role="group" aria-label="Session presets">
            {PRESETS.map(item => {
              const active = store.presetId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="fct-btn fct-focusable"
                  style={{...styles.presetChip, ...(active ? styles.presetChipActive : null)}}
                  aria-pressed={active}
                  onClick={() => selectPreset(item.id)}>
                  <span style={styles.presetName}>{item.name}</span>
                  <span style={styles.presetTime}>{formatTime(item.sec)}</span>
                </button>
              );
            })}
          </div>

          {/* DEMO — fast path to the 00:00 choreography. */}
          <div style={styles.demoRow}>
            <button
              type="button"
              className="fct-btn fct-focusable"
              style={{
                ...styles.demoChip,
                ...(store.completed || store.remainingSec <= SKIP_TO_SEC
                  ? styles.adjustChipDisabled
                  : null),
              }}
              disabled={store.completed || store.remainingSec <= SKIP_TO_SEC}
              onClick={skipToLastFive}>
              <Icon icon={FastForwardIcon} size="sm" color="inherit" />
              Skip to last 5s
            </button>
          </div>

          {/* COMPLETION — slides up at 00:00; today's streak dot pops. */}
          {store.completed ? (
            <section
              key={store.celebrateSeq}
              className="fct-rise"
              style={styles.completeCard}
              aria-label="Session summary">
              <div style={styles.completeHeader}>
                <span style={styles.completeSeat} aria-hidden>
                  <Icon icon={CheckIcon} size="md" color="inherit" />
                </span>
                <div style={styles.completeText}>
                  <h2 style={styles.completeTitle}>
                    Session complete · {sessionMinutes} min
                  </h2>
                  <span style={styles.completeSub}>
                    {streakCount}-day streak · {TODAY_LABEL}
                  </span>
                </div>
              </div>
              <div style={styles.streakRow}>
                {STREAK_DAYS.map(day => {
                  const filled = day.done || (day.isToday === true && store.todayFilled);
                  const popsIn = day.isToday === true && store.todayFilled && !reducedMotion;
                  return (
                    <span key={day.id} style={styles.streakDay}>
                      <span
                        className={popsIn ? 'fct-pop' : undefined}
                        style={{...styles.streakDot, ...(filled ? styles.streakDotFilled : null)}}
                        aria-hidden>
                        {filled ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                      </span>
                      <span style={styles.streakDayLabel}>{day.label}</span>
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                className="fct-btn fct-focusable"
                style={styles.startAnotherBtn}
                onClick={toggleRun}>
                Start another
              </button>
            </section>
          ) : null}

          {/* TODAY STATS — derive from the same store as the completion. */}
          <h2 style={styles.sectionHeader}>Today · {TODAY_LABEL}</h2>
          <div style={styles.statCard}>
            <div style={styles.statCell}>
              <span style={styles.statValue}>{store.doneSessions}</span>
              <span style={styles.statCaption}>Sessions</span>
            </div>
            <span style={styles.statHairline} aria-hidden />
            <div style={styles.statCell}>
              <span style={styles.statValue}>{store.doneMinutes} min</span>
              <span style={styles.statCaption}>Focus time</span>
            </div>
            <span style={styles.statHairline} aria-hidden />
            <div style={styles.statCell}>
              <span style={{...styles.statValue, display: 'flex', alignItems: 'center', gap: 4}}>
                <span style={{color: BRAND_ACCENT, display: 'inline-flex'}} aria-hidden>
                  <Icon icon={FlameIcon} size="md" color="inherit" />
                </span>
                {streakCount}
              </span>
              <span style={styles.statCaption}>Day streak</span>
            </div>
          </div>
        </main>

        {/* Sticky toast dock — ONE polite live region at bottom:16. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {store.toast != null ? (
              <div key={store.toast.seq} className="fct-fade" style={styles.toast}>
                <span style={styles.toastText}>{store.toast.text}</span>
                <button
                  type="button"
                  className="fct-btn fct-focusable"
                  style={styles.toastDismiss}
                  aria-label="Dismiss message"
                  onClick={() => setStore(prev => ({...prev, toast: null}))}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
