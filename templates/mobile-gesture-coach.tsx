// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Skylark mail inbox frozen at
 *   TODAY 'Sun, Jul 13': 9 seeded messages (2 promos, 3 unread, times
 *   spanning 8:47 AM → Jul 10) plus ONE refresh-inserted message (Rosa
 *   Delgado, 9:02 AM) that appears exactly once; a 4-step coach script
 *   (swipe-left archive on Crestline Deals · long-press pin on Field &
 *   Fern · pull-down refresh · two-finger pinch to compact), each step
 *   carrying a 3-phase reduced-motion caption script. No Date.now(), no
 *   Math.random(), no network media (art = hue-derived gradient tiles +
 *   initial monograms).
 * @output Skylark — Gesture Coach: a 390px MOBILE gesture-tutorial
 *   overlay. A mock inbox (52px navBar with a working Refresh button,
 *   44px section header with a density toggle, inset-grouped listCard of
 *   72px message rows) sits beneath a coach layer that teaches 4 gestures
 *   in steps. Each step renders an animated DEMO GHOST — a 44px
 *   translucent finger dot replaying the gesture path on a CSS-keyframe
 *   loop (swipe arc across the row, growing long-press ring, pull-down
 *   rubber-band, twin dots pinching — transform/opacity only) — plus a
 *   soft pulsing halo on the target and a bottom step card naming the
 *   gesture. The user must PERFORM the gesture on the real surface with
 *   the same pointer handlers production rows use (setPointerCapture
 *   drag-follow, 450ms press timer with an SVG dashoffset ring, damped
 *   pull with a 64px armed threshold, two-pointer distance-ratio pinch);
 *   performing it fires the row's ACTUAL effect (archive slide-out, pin
 *   pop, staged row insert, compact re-render) + a success pop + a
 *   horizontal card-turn to the next step. A 4-dot progress row fills;
 *   'Skip gesture' (44px) advances honestly and marks the step skipped.
 *   Finishing lifts the coach (opacity + slight zoom) into a completion
 *   card with an SVG check draw-on, a derived 'N of 4 gestures' summary,
 *   and 'Practice again' (full reset). All four gestures stay live in the
 *   inbox after the coach ends.
 * @position Page template; emitted by `astryx template mobile-gesture-coach`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px sticky
 *   navBar at y=0 is the first pixel). All overlays (ghosts, halos, pops,
 *   the anchored row menu + its click catcher, the toast) are
 *   position:'absolute' INSIDE shell or inside in-flow seats;
 *   position:fixed is banned. No bottom sheet opens here, so the shell
 *   never scroll-locks. The single polite toast live region rides the
 *   sticky bottom coach dock, absolutely seated at bottom:'100%' + 8px
 *   above the step/completion card (the dock plays the tabBar's role in
 *   this template).
 * Mandatory button paths (every gesture commits through the SAME state
 *   update as a visible ≥44×44 button): 'Skip gesture' is the honest
 *   coach path (marks the step skipped, per spec); beyond it, each row's
 *   44×44 ellipsis menu Archives/Pins through commitArchive/togglePin
 *   (completing the swipe/press steps when aimed at their targets), the
 *   navBar Refresh button runs the same refresh choreography as the pull
 *   (completing the pull step), and the section header's density toggle
 *   commits the same compact update as the pinch (completing the pinch
 *   step). Outcomes are announced through the aria-live toast dock.
 * Animation contract: transform + opacity only (plus SVG
 *   stroke-dashoffset for the press ring and the completion check).
 *   Springy settles use cubic-bezier(0.34,1.56,0.64,1); decelerates use
 *   cubic-bezier(0.22,1,0.36,1). Gesture physics are pointer-event
 *   driven (inline transforms during drag, transition-based settle on
 *   release); phase chaining uses transitionend for the archive
 *   slide-out (with a fallback timer) and staged setTimeout choreography
 *   elsewhere (all cleaned up on unmount). Reduced motion (read once via
 *   the matchMedia-backed useMediaQuery hook, change-listened): ghost
 *   loops are REMOVED and replaced by static SVG diagram arrows with a
 *   'Show me' 3-phase step-through button; halos render static; card
 *   turns, pops, slide-outs, and the rubber-band hold become instant
 *   state changes; the refresh spinner loop is removed. A CSS
 *   prefers-reduced-motion block is the backstop for every mgc- class.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white 13px/600 text on
 *   #0F766E ≈ 6.4:1; near-black #06201D on #5EEAD4 ≈ 12.3:1; as a bare
 *   fill it reads ≈ 6.4:1 vs the white card and ≈ 9.0:1 vs the ~#1C1C1E
 *   dark card — all clear the ≥3:1 bar for meaningful fills. Ghost dots
 *   derive from it via color-mix (decorative, aria-hidden). Monogram
 *   tiles use hue-derived hsl() gradient literals (fixture art, white
 *   monograms on 40%/26%-lightness stops ≈ 4.6:1+ in both schemes).
 *   Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky z20 with hairline;
 *   inset-grouped listCard (12px radius, 1px border, hairline dividers
 *   inset 68 comfortable / 56 compact); rows 72px comfortable · 56px
 *   compact; every touch target ≥44×44 (row ellipsis 44×44, Skip 44px,
 *   Show me 44px, density toggle 44px, toast dismiss 44×44). TYPE:
 *   17/600 nav + step titles · 16/500 senders · 13/400 meta · 11/600
 *   eyebrows/chips; tabular-nums on counts; nothing under 11px.
 *
 * Responsive contract:
 * - Fluid 320–430: rows are flex with minWidth 0 ellipsis on sender and
 *   subject; the time + ellipsis trailing cluster never shrinks; the
 *   step card's Skip button never shrinks while the target chip
 *   ellipsizes; ghost paths use fixed offsets that fit 320 (swipe arc
 *   -136px inside a 288px row). overflowX:'clip' backstop.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport) — >560px renders the standard centered phone
 *   column (maxWidth 430, marginInline auto, borderInline hairline) on a
 *   var(--color-background-muted) backdrop. Never a stretched relayout.
 */

import {useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  TransitionEvent as ReactTransitionEvent,
} from 'react';

import {
  ArchiveIcon,
  ArrowDownIcon,
  CheckIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  GraduationCapIcon,
  MoreHorizontalIcon,
  PinIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Skylark teal). White 13px/600 text on
// #0F766E ≈ 6.4:1; near-black #06201D on #5EEAD4 ≈ 12.3:1. As a bare fill:
// #0F766E vs the white card ≈ 6.4:1 and #5EEAD4 vs the ~#1C1C1E dark card
// ≈ 9.0:1 — both clear the ≥3:1 bar for meaningful rest-state fills
// (progress dots, halo strokes, pinned glyphs, archive under-layer).
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #06201D)';
// Brand-tinted washes — decorative halo glow / coach seat backgrounds.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const BRAND_TINT_22 = `color-mix(in srgb, ${BRAND_ACCENT} 22%, transparent)`;
// Demo-ghost finger fill — translucent brand mix; purely decorative
// (aria-hidden, pointerEvents none), always paired with a 2px solid
// BRAND_ACCENT outline so it stays visible on both schemes.
const GHOST_FILL = `color-mix(in srgb, ${BRAND_ACCENT} 40%, transparent)`;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the four ghost loops,
// halo pulse, success pop, card turn, press-ring fill, check draw-on,
// spinner, settle transitions. Transform/opacity (+ SVG dashoffset) only.
// The prefers-reduced-motion block collapses every one of them.
// ---------------------------------------------------------------------------

const MGC_CSS = `
.mgc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mgc-btn:disabled { cursor: default; }
.mgc-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.mgc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Row dimming while the coach spotlights a target. */
.mgc-dim { transition: opacity 240ms ease; }
/* GHOST 1 — swipe-left arc across the target row. */
@keyframes mgc-ghost-swipe {
  0% { transform: translate(0, 0); opacity: 0; }
  14% { transform: translate(-6px, -1px); opacity: 1; }
  68% { transform: translate(-136px, -6px); opacity: 1; }
  82%, 100% { transform: translate(-136px, -6px); opacity: 0; }
}
.mgc-ghost-swipe { animation: mgc-ghost-swipe 2400ms cubic-bezier(0.22, 1, 0.36, 1) infinite; }
/* GHOST 2 — long-press: dot settles, ring grows around it. */
@keyframes mgc-ghost-hold {
  0% { transform: scale(0.85); opacity: 0; }
  12%, 78% { transform: scale(1); opacity: 1; }
  92%, 100% { transform: scale(1); opacity: 0; }
}
.mgc-ghost-hold { animation: mgc-ghost-hold 1800ms ease-in-out infinite; }
@keyframes mgc-ghost-ring {
  0%, 12% { transform: scale(0.35); opacity: 0; }
  24% { opacity: 0.9; }
  72% { transform: scale(1); opacity: 0.9; }
  86%, 100% { transform: scale(1.12); opacity: 0; }
}
.mgc-ghost-ring { animation: mgc-ghost-ring 1800ms ease-out infinite; }
/* GHOST 3 — pull-down with a rubber-band hold at the bottom. */
@keyframes mgc-ghost-pull {
  0% { transform: translateY(0); opacity: 0; }
  12% { opacity: 1; }
  55% { transform: translateY(64px); }
  70% { transform: translateY(56px); opacity: 1; }
  85%, 100% { transform: translateY(56px); opacity: 0; }
}
.mgc-ghost-pull { animation: mgc-ghost-pull 2200ms cubic-bezier(0.22, 1, 0.36, 1) infinite; }
/* GHOST 4 — twin dots pinching toward each other. */
@keyframes mgc-ghost-pinch-l {
  0% { transform: translateX(0); opacity: 0; }
  15% { opacity: 1; }
  62% { transform: translateX(36px); opacity: 1; }
  82%, 100% { transform: translateX(36px); opacity: 0; }
}
.mgc-ghost-pinch-l { animation: mgc-ghost-pinch-l 2000ms cubic-bezier(0.22, 1, 0.36, 1) infinite; }
@keyframes mgc-ghost-pinch-r {
  0% { transform: translateX(0); opacity: 0; }
  15% { opacity: 1; }
  62% { transform: translateX(-36px); opacity: 1; }
  82%, 100% { transform: translateX(-36px); opacity: 0; }
}
.mgc-ghost-pinch-r { animation: mgc-ghost-pinch-r 2000ms cubic-bezier(0.22, 1, 0.36, 1) infinite; }
/* Target halo pulse (opacity only; static under reduced motion). */
@keyframes mgc-halo {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
.mgc-halo { animation: mgc-halo 1800ms ease-in-out infinite; }
/* Success pop — overshoot in, fade out; node removed on animation end. */
@keyframes mgc-pop {
  0% { transform: scale(0.3); opacity: 0; }
  55% { transform: scale(1.15); opacity: 1; }
  75% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
.mgc-pop { animation: mgc-pop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
/* Refresh-inserted row entrance. */
@keyframes mgc-row-in {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.mgc-row-in { animation: mgc-row-in 280ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Step card horizontal turn — out phase (transition) then keyed in phase. */
@keyframes mgc-card-in {
  from { transform: perspective(700px) rotateY(64deg); opacity: 0; }
  to { transform: perspective(700px) rotateY(0deg); opacity: 1; }
}
.mgc-card-in { animation: mgc-card-in 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.mgc-card-out {
  transform: perspective(700px) rotateY(-64deg);
  opacity: 0;
  transition: transform 200ms ease-in, opacity 200ms ease-in;
}
/* Completion card lift-in (the coach layer's zoom-lift counterpart). */
@keyframes mgc-lift-in {
  from { transform: scale(0.94); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.mgc-lift-in { animation: mgc-lift-in 320ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Long-press progress ring — SVG dashoffset fill over the 450ms hold. */
@keyframes mgc-press-fill {
  from { stroke-dashoffset: 69.1; }
  to { stroke-dashoffset: 0; }
}
.mgc-press-fill { animation: mgc-press-fill 450ms linear forwards; }
/* Completion check draw-on. */
.mgc-check-path {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  transition: stroke-dashoffset 420ms cubic-bezier(0.22, 1, 0.36, 1) 160ms;
}
.mgc-check-drawn { stroke-dashoffset: 0; }
/* Refresh spinner. */
@keyframes mgc-spin { to { transform: rotate(360deg); } }
.mgc-spin { animation: mgc-spin 800ms linear infinite; }
/* Settle transitions — springy release / decelerate returns. */
.mgc-settle { transition: transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.mgc-slide { transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease; }
.mgc-fade { transition: opacity 200ms ease; }
@media (prefers-reduced-motion: reduce) {
  .mgc-ghost-swipe, .mgc-ghost-hold, .mgc-ghost-ring, .mgc-ghost-pull,
  .mgc-ghost-pinch-l, .mgc-ghost-pinch-r, .mgc-halo, .mgc-pop,
  .mgc-row-in, .mgc-card-in, .mgc-lift-in, .mgc-press-fill, .mgc-spin {
    animation: none;
  }
  .mgc-card-out, .mgc-check-path, .mgc-settle, .mgc-slide, .mgc-dim, .mgc-fade {
    transition: none;
  }
  .mgc-check-path { stroke-dashoffset: 0; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {width: '100%', background: 'var(--color-background-muted)'},
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
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSeat: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandTile: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Section header — 44px eyebrow row with the density-toggle button path.
  sectionHeaderRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px 0',
  },
  sectionEyebrow: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  densityBtn: {
    height: 44,
    paddingInline: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // PULL ZONE — position anchor for the refresh indicator + ghosts + pops.
  pullZone: {position: 'relative', marginTop: 4},
  pullIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    zIndex: 5,
  },
  pullIndicatorArmed: {
    border: `1px solid ${BRAND_ACCENT}`,
    boxShadow: `0 0 0 4px ${BRAND_TINT_22}`,
    color: BRAND_ACCENT,
  },
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    position: 'relative',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowDividerCompact: {height: 1, background: 'var(--color-border)', marginInlineStart: 56},
  rowOuter: {position: 'relative'},
  // Archive under-layer revealed by the swipe (behind the sliding content).
  archiveUnder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingInlineEnd: 24,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  archiveUnderLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowContentCompact: {minHeight: 56},
  monogram: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  monogramCompact: {width: 28, height: 28, borderRadius: 8, fontSize: 11},
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  senderRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  unreadDot: {width: 8, height: 8, borderRadius: '50%', background: BRAND_ACCENT, flexShrink: 0},
  sender: {
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  senderUnread: {fontWeight: 600},
  pinGlyph: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  subject: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowTrailing: {display: 'flex', alignItems: 'center', flexShrink: 0},
  timeText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  moreBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Target halo — pointerEvents none, brand stroke + tint glow.
  halo: {
    position: 'absolute',
    inset: 2,
    borderRadius: 10,
    border: `2px solid ${BRAND_ACCENT}`,
    boxShadow: `0 0 0 4px ${BRAND_TINT_22}`,
    pointerEvents: 'none',
    zIndex: 3,
  },
  haloCard: {
    position: 'absolute',
    inset: -2,
    borderRadius: 14,
    border: `2px solid ${BRAND_ACCENT}`,
    boxShadow: `0 0 0 4px ${BRAND_TINT_22}`,
    pointerEvents: 'none',
    zIndex: 3,
  },
  // DEMO GHOSTS — 44px translucent finger dots, decorative only.
  ghostDot: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: GHOST_FILL,
    border: `2px solid ${BRAND_ACCENT}`,
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  ghostSwipeSeat: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 4,
    overflow: 'hidden',
  },
  ghostSwipeDot: {position: 'absolute', right: 20, top: '50%', marginTop: -22},
  ghostHoldSeat: {
    position: 'absolute',
    left: '56%',
    top: '50%',
    width: 0,
    height: 0,
    pointerEvents: 'none',
    zIndex: 4,
  },
  ghostHoldDot: {position: 'absolute', left: -22, top: -22},
  ghostHoldRing: {
    position: 'absolute',
    left: -32,
    top: -32,
    width: 64,
    height: 64,
    borderRadius: '50%',
    border: `2px solid ${BRAND_ACCENT}`,
  },
  ghostPullSeat: {
    position: 'absolute',
    top: 6,
    left: '50%',
    marginLeft: -22,
    pointerEvents: 'none',
    zIndex: 6,
  },
  ghostPinchSeat: {
    position: 'absolute',
    top: 110,
    left: '50%',
    width: 0,
    height: 0,
    pointerEvents: 'none',
    zIndex: 6,
  },
  ghostPinchL: {position: 'absolute', left: -84, top: -22},
  ghostPinchR: {position: 'absolute', left: 40, top: -22},
  // Success pop check circle.
  popRowSeat: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    zIndex: 5,
  },
  popListSeat: {
    position: 'absolute',
    top: 96,
    left: '50%',
    marginLeft: -22,
    pointerEvents: 'none',
    zIndex: 7,
  },
  popCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // Long-press progress ring seat (trailing side of the pressed row).
  pressRingSeat: {
    position: 'absolute',
    right: 56,
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    pointerEvents: 'none',
    zIndex: 4,
  },
  listCaption: {
    margin: '12px 32px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  spacer24: {height: 24},
  // COACH DOCK — sticky bottom card dock; the toast live region rides it
  // absolutely, 8px above the card (this template's tabBar-equivalent).
  dockWrap: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    marginTop: 16,
    padding: '0 16px 16px',
  },
  toastRegion: {
    position: 'absolute',
    insetInline: 16,
    bottom: '100%',
    marginBottom: 8,
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
    gap: 4,
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
  toastClose: {
    width: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  // STEP CARD.
  stepCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    boxShadow: '0 8px 24px var(--color-shadow)',
    padding: '14px 16px 12px',
  },
  stepHeader: {display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10},
  coachSeat: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  stepEyebrow: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dotsRow: {display: 'flex', gap: 8, flexShrink: 0},
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
  },
  progressDotDone: {background: BRAND_ACCENT, border: `1px solid ${BRAND_ACCENT}`},
  progressDotSkipped: {background: 'var(--color-background-muted)'},
  progressDotActive: {border: `2px solid ${BRAND_ACCENT}`},
  skipMark: {
    width: 6,
    height: 1.5,
    borderRadius: 1,
    background: 'var(--color-text-secondary)',
    transform: 'rotate(-45deg)',
  },
  stepTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  stepInstruction: {
    fontSize: 13,
    lineHeight: 1.45,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 0',
  },
  // Reduced-motion diagram row (static SVG arrows + Show me step-through).
  diagramRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  diagramSvgSeat: {color: BRAND_ACCENT, display: 'grid', placeItems: 'center', flexShrink: 0},
  phaseCaption: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 1.4,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  showMeBtn: {
    height: 44,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  stepFooter: {display: 'flex', alignItems: 'center', gap: 8, marginTop: 8},
  targetChip: {
    minWidth: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '4px 10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footerSpacer: {flex: 1},
  skipBtn: {
    height: 44,
    paddingInline: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // COMPLETION CARD.
  doneCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    boxShadow: '0 8px 24px var(--color-shadow)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  doneCircleSeat: {width: 56, height: 56, marginBottom: 8, color: BRAND_ACCENT},
  doneTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  doneSummary: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    margin: '4px 0 0',
    fontVariantNumeric: 'tabular-nums',
  },
  doneCaption: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 12px'},
  practiceBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // ANCHORED ROW MENU — shell-absolute, z30 over a transparent catcher z29.
  menuCatcher: {position: 'absolute', inset: 0, zIndex: 29, background: 'transparent'},
  menu: {
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
  menuHairline: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. TODAY is Sun, Jul 13 (2026); 'Yesterday'
// rows are Jul 12; the refresh insert is a fixed 9:02 AM message.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Sun, Jul 13';

interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  time: string;
  unread: boolean;
  hue: number; // hue-derived gradient tile — no network media
  mono: string; // precomputed monogram (deterministic)
}

const MESSAGES: InboxMessage[] = [
  {id: 'm1', sender: 'Harbor Transit', subject: 'Your July pass renews on Friday', time: '8:47 AM', unread: true, hue: 210, mono: 'HT'},
  {id: 'm2', sender: 'Crestline Deals', subject: 'Weekend flash — 30% off patio sets', time: '8:12 AM', unread: false, hue: 24, mono: 'CD'},
  {id: 'm3', sender: 'Maya Lindqvist', subject: 'Re: Saturday ferry timing', time: '7:58 AM', unread: true, hue: 150, mono: 'ML'},
  {id: 'm4', sender: 'Field & Fern', subject: 'Order #4821 has shipped', time: '7:31 AM', unread: false, hue: 96, mono: 'FF'},
  {id: 'm5', sender: 'Jonah Petak', subject: 'Draft agenda for Tuesday standup', time: 'Yesterday', unread: false, hue: 264, mono: 'JP'},
  {id: 'm6', sender: 'Cityline Utilities', subject: 'Your June statement is ready', time: 'Yesterday', unread: false, hue: 196, mono: 'CU'},
  {id: 'm7', sender: 'Priya Raman', subject: 'Photos from the lake weekend', time: 'Yesterday', unread: true, hue: 330, mono: 'PR'},
  {id: 'm8', sender: 'The Sunday Skim', subject: 'Issue 214 — slow mornings, fast reads', time: 'Jul 11', unread: false, hue: 44, mono: 'TS'},
  {id: 'm9', sender: 'Alder & Vine', subject: 'Table for two confirmed for Jul 18', time: 'Jul 10', unread: false, hue: 288, mono: 'AV'},
];

// The single refresh-inserted message (appears once; second refresh says
// "You're all caught up").
const NEW_MESSAGE: InboxMessage = {
  id: 'm0',
  sender: 'Rosa Delgado',
  subject: 'Landed! See you at baggage claim',
  time: '9:02 AM',
  unread: true,
  hue: 8,
  mono: 'RD',
};

// Fixture art gradient — white monogram on 40%/26%-lightness stops reads
// ≈ 4.6:1+ in both schemes (poster art, not chrome).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

// COACH SCRIPT — 4 steps; the swipe/press steps aim at fixed target rows.
type StepId = 'swipe' | 'press' | 'pull' | 'pinch';
type StepStatus = 'pending' | 'done' | 'skipped';

interface CoachStep {
  id: StepId;
  title: string;
  instruction: string;
  targetLabel: string;
  /** Reduced-motion 'Show me' step-through captions (3 phases). */
  phases: [string, string, string];
}

const SWIPE_TARGET_ID = 'm2'; // Crestline Deals — the promo row
const PRESS_TARGET_ID = 'm4'; // Field & Fern — the shipping update

const STEPS: CoachStep[] = [
  {
    id: 'swipe',
    title: 'Swipe left to archive',
    instruction:
      'Drag the highlighted promo row to the left. Once the archive mark is fully revealed, let go — the row files itself.',
    targetLabel: 'Crestline Deals',
    phases: [
      "1 of 3 · Touch down on the row's right half.",
      '2 of 3 · Drag left until the archive mark is fully revealed.',
      '3 of 3 · Lift your finger — the row slides away.',
    ],
  },
  {
    id: 'press',
    title: 'Long-press to pin',
    instruction:
      'Press and hold the shipping update for about half a second. The ring fills as you hold; the message pins when it closes.',
    targetLabel: 'Field & Fern',
    phases: [
      '1 of 3 · Touch down anywhere on the row and stay put.',
      '2 of 3 · Hold still while the ring fills (about half a second).',
      '3 of 3 · Keep holding to the top — the pin pops in.',
    ],
  },
  {
    id: 'pull',
    title: 'Pull down to refresh',
    instruction:
      'From the top of the list, drag downward until the arrow flips, then release to check for new mail.',
    targetLabel: 'Whole inbox',
    phases: [
      '1 of 3 · Touch down on the list while it sits at the top.',
      '2 of 3 · Drag down — the arrow rotates as you go.',
      '3 of 3 · Past the flip point, release to refresh.',
    ],
  },
  {
    id: 'pinch',
    title: 'Pinch to compact',
    instruction:
      'Place two fingers on the list and draw them together to switch the inbox to the dense single-line view.',
    targetLabel: 'Whole inbox',
    phases: [
      '1 of 3 · Rest two fingers on the message list.',
      '2 of 3 · Draw them toward each other.',
      '3 of 3 · Past three-quarters closed, compact view commits.',
    ],
  },
];

const INITIAL_STATUSES: Record<StepId, StepStatus> = {
  swipe: 'pending',
  press: 'pending',
  pull: 'pending',
  pinch: 'pending',
};

// Gesture thresholds (px / ratios) — mirrored in the copy above.
const SWIPE_COMMIT_PX = 96;
const SWIPE_MAX_PX = 140;
const PRESS_HOLD_MS = 450;
const PULL_ARM_PX = 64;
const PULL_MAX_PX = 110;
const PULL_HOLD_PX = 56;
const PINCH_COMMIT_RATIO = 0.75;
const PINCH_EXPAND_RATIO = 1.35;

// ---------------------------------------------------------------------------
// LOCAL RESPONSIVE HELPER — container width, not viewport (demo stage rule).
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

// ---------------------------------------------------------------------------
// REDUCED-MOTION DIAGRAMS — static SVG arrows replacing the ghost loops.
// ---------------------------------------------------------------------------

function StepDiagram({stepId}: {stepId: StepId}) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width={72} height={40} viewBox="0 0 72 40" aria-hidden="true">
      {stepId === 'swipe' ? (
        <>
          <path d="M62 20 H16" {...stroke} />
          <path d="M24 12 L14 20 L24 28" {...stroke} />
        </>
      ) : null}
      {stepId === 'press' ? (
        <>
          <circle cx={36} cy={20} r={16} {...stroke} strokeDasharray="3 5" />
          <circle cx={36} cy={20} r={9} {...stroke} />
          <circle cx={36} cy={20} r={3} fill="currentColor" stroke="none" />
        </>
      ) : null}
      {stepId === 'pull' ? (
        <>
          <path d="M36 6 V30" {...stroke} />
          <path d="M28 24 L36 33 L44 24" {...stroke} />
        </>
      ) : null}
      {stepId === 'pinch' ? (
        <>
          <path d="M6 20 H24" {...stroke} />
          <path d="M18 13 L26 20 L18 27" {...stroke} />
          <path d="M66 20 H48" {...stroke} />
          <path d="M54 13 L46 20 L54 27" {...stroke} />
        </>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

interface RowDragState {
  rowId: string;
  startX: number;
  startY: number;
  pointerId: number;
  mode: 'idle' | 'swipe' | 'cancelled';
  canSwipe: boolean;
}

export default function MobileGestureCoachTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktop = wrapWidth > 560;
  // The mandated matchMedia read (change-listened) lives inside this hook.
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ----- coach state -----
  const [statuses, setStatuses] = useState<Record<StepId, StepStatus>>(INITIAL_STATUSES);
  const [stepIndex, setStepIndex] = useState(0); // 0..3, 4 = complete
  const [cardLeaving, setCardLeaving] = useState(false);
  const [demoPhase, setDemoPhase] = useState(0);
  const [checkDrawn, setCheckDrawn] = useState(false);

  // ----- inbox state (the real effects the coach fires) -----
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [hasNewRow, setHasNewRow] = useState(false);
  const [compact, setCompact] = useState(false);

  // ----- gesture state -----
  const [swipeRowId, setSwipeRowId] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeSettling, setSwipeSettling] = useState(false);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [pull, setPull] = useState(0);
  const [pullPhase, setPullPhase] = useState<'idle' | 'drag' | 'settle' | 'refreshing'>('idle');
  const [pinchScale, setPinchScale] = useState(1);
  const [pinchActive, setPinchActive] = useState(false);

  // ----- furniture -----
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);
  const [pop, setPop] = useState<{key: number; rowId: string | null} | null>(null);
  const [menu, setMenu] = useState<{rowId: string; top: number} | null>(null);

  // ----- refs (timers + gesture bookkeeping; all timers cleaned up) -----
  const stepIndexRef = useRef(0);
  const hasNewRowRef = useRef(false);
  const dragRef = useRef<RowDragState | null>(null);
  const gestureClaimRef = useRef<'row' | 'list' | null>(null);
  const pullDragRef = useRef<{startY: number; active: boolean} | null>(null);
  const pinchPointsRef = useRef<Map<number, {x: number; y: number}>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const flipTimerRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const swipeSettleTimerRef = useRef<number | null>(null);
  const leaveFallbackTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const popSeqRef = useRef(0);
  const toastSeqRef = useRef(0);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    setDemoPhase(0);
  }, [stepIndex]);

  // Unmount: clear every staged timer.
  useEffect(
    () => () => {
      for (const ref of [
        pressTimerRef,
        flipTimerRef,
        refreshTimerRef,
        settleTimerRef,
        swipeSettleTimerRef,
        leaveFallbackTimerRef,
        toastTimerRef,
      ]) {
        if (ref.current != null) {
          window.clearTimeout(ref.current);
        }
      }
    },
    [],
  );

  // Escape closes the anchored row menu.
  useEffect(() => {
    if (menu == null) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const coachDone = stepIndex >= STEPS.length;
  const activeStep = coachDone ? null : STEPS[stepIndex];

  // Completion check draw-on (delayed a frame so the transition runs).
  useEffect(() => {
    if (!coachDone) {
      setCheckDrawn(false);
      return undefined;
    }
    if (reducedMotion) {
      setCheckDrawn(true);
      return undefined;
    }
    const t = window.setTimeout(() => setCheckDrawn(true), 80);
    return () => window.clearTimeout(t);
  }, [coachDone, reducedMotion]);

  // ----- derived rows -----
  const base = hasNewRow ? [NEW_MESSAGE, ...MESSAGES] : MESSAGES;
  const live = base.filter(m => !archivedIds.includes(m.id));
  const rows = [
    ...live.filter(m => pinnedIds.includes(m.id)),
    ...live.filter(m => !pinnedIds.includes(m.id)),
  ];
  const doneCount = STEPS.filter(s => statuses[s.id] === 'done').length;
  const skippedCount = STEPS.filter(s => statuses[s.id] === 'skipped').length;

  // ----- shared choreography helpers -----

  const showToast = (text: string) => {
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastSeqRef.current += 1;
    setToast({seq: toastSeqRef.current, text});
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3800);
  };

  const firePop = (rowId: string | null) => {
    if (reducedMotion) {
      return; // outcomes still announced through the toast
    }
    popSeqRef.current += 1;
    setPop({key: popSeqRef.current, rowId});
  };

  /** Marks the step and turns the card — only if `stepId` is the live step. */
  const completeStep = (stepId: StepId, outcome: 'done' | 'skipped') => {
    const idx = stepIndexRef.current;
    if (idx >= STEPS.length || STEPS[idx].id !== stepId) {
      return;
    }
    setStatuses(prev => ({...prev, [stepId]: outcome}));
    if (reducedMotion) {
      stepIndexRef.current = idx + 1;
      setStepIndex(idx + 1);
      return;
    }
    setCardLeaving(true);
    if (flipTimerRef.current != null) {
      window.clearTimeout(flipTimerRef.current);
    }
    flipTimerRef.current = window.setTimeout(() => {
      setCardLeaving(false);
      stepIndexRef.current = idx + 1;
      setStepIndex(idx + 1);
    }, 210);
  };

  // ----- the four real effects (gesture AND button paths both land here) -----

  const finalizeArchive = (rowId: string) => {
    setArchivedIds(prev => (prev.includes(rowId) ? prev : [...prev, rowId]));
    setLeavingId(null);
    setSwipeRowId(null);
    setSwipeX(0);
    setSwipeSettling(false);
  };

  const commitArchive = (row: InboxMessage) => {
    if (leavingId != null || archivedIds.includes(row.id)) {
      return;
    }
    firePop(row.id);
    showToast(`Archived · ${row.sender}`);
    if (row.id === SWIPE_TARGET_ID) {
      completeStep('swipe', 'done');
    }
    if (reducedMotion) {
      finalizeArchive(row.id);
      return;
    }
    setLeavingId(row.id);
    // transitionend chains the removal; this timer is only the safety net.
    if (leaveFallbackTimerRef.current != null) {
      window.clearTimeout(leaveFallbackTimerRef.current);
    }
    leaveFallbackTimerRef.current = window.setTimeout(() => finalizeArchive(row.id), 420);
  };

  const togglePin = (row: InboxMessage) => {
    const isPinned = pinnedIds.includes(row.id);
    setPinnedIds(prev => (isPinned ? prev.filter(id => id !== row.id) : [...prev, row.id]));
    if (isPinned) {
      showToast(`Unpinned · ${row.sender}`);
      return;
    }
    firePop(row.id);
    showToast(`Pinned · ${row.sender}`);
    if (row.id === PRESS_TARGET_ID) {
      completeStep('press', 'done');
    }
  };

  const startRefresh = () => {
    if (pullPhase === 'refreshing') {
      return;
    }
    const wasStepPull = activeStep?.id === 'pull';
    setPullPhase('refreshing');
    setPull(reducedMotion ? 0 : PULL_HOLD_PX);
    if (refreshTimerRef.current != null) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(
      () => {
        if (!hasNewRowRef.current) {
          hasNewRowRef.current = true;
          setHasNewRow(true);
          showToast(`1 new message · ${NEW_MESSAGE.sender}`);
        } else {
          showToast("You're all caught up");
        }
        setPull(0);
        setPullPhase('settle');
        if (settleTimerRef.current != null) {
          window.clearTimeout(settleTimerRef.current);
        }
        settleTimerRef.current = window.setTimeout(() => setPullPhase('idle'), 380);
        if (wasStepPull) {
          completeStep('pull', 'done');
        }
      },
      reducedMotion ? 240 : 1300,
    );
  };

  const commitCompact = () => {
    if (compact) {
      return;
    }
    setCompact(true);
    firePop(null);
    showToast('Compact view on');
    completeStep('pinch', 'done');
  };

  const toggleCompact = () => {
    if (compact) {
      setCompact(false);
      showToast('Comfortable view restored');
      return;
    }
    commitCompact();
  };

  const resetAll = () => {
    setStatuses(INITIAL_STATUSES);
    stepIndexRef.current = 0;
    setStepIndex(0);
    setCardLeaving(false);
    setDemoPhase(0);
    setCheckDrawn(false);
    setArchivedIds([]);
    setLeavingId(null);
    setPinnedIds([]);
    hasNewRowRef.current = false;
    setHasNewRow(false);
    setCompact(false);
    setSwipeRowId(null);
    setSwipeX(0);
    setSwipeSettling(false);
    setPressingId(null);
    setPull(0);
    setPullPhase('idle');
    setPinchScale(1);
    setPinchActive(false);
    setToast(null);
    setPop(null);
    setMenu(null);
    dragRef.current = null;
    pullDragRef.current = null;
    pinchPointsRef.current.clear();
    pinchStartDistRef.current = null;
    gestureClaimRef.current = null;
  };

  // ----- gesture enablement (coach spotlights one gesture at a time) -----

  const swipeEnabledFor = (row: InboxMessage) =>
    coachDone ? true : activeStep?.id === 'swipe' && row.id === SWIPE_TARGET_ID;
  const pressEnabledFor = (row: InboxMessage) =>
    coachDone ? true : activeStep?.id === 'press' && row.id === PRESS_TARGET_ID;
  const pullEnabled = coachDone || activeStep?.id === 'pull';
  const pinchEnabled = coachDone || activeStep?.id === 'pinch';

  // ----- row pointer handlers (swipe drag-follow + long-press timer) -----

  const cancelPress = () => {
    if (pressTimerRef.current != null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressingId(null);
  };

  const onRowPointerDown = (event: ReactPointerEvent<HTMLDivElement>, row: InboxMessage) => {
    if (menu != null) {
      setMenu(null);
    }
    const canSwipe = swipeEnabledFor(row) && leavingId == null;
    const canPress = pressEnabledFor(row);
    if (!canSwipe && !canPress) {
      return;
    }
    dragRef.current = {
      rowId: row.id,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
      mode: 'idle',
      canSwipe,
    };
    if (canPress) {
      setPressingId(row.id);
      if (pressTimerRef.current != null) {
        window.clearTimeout(pressTimerRef.current);
      }
      pressTimerRef.current = window.setTimeout(() => {
        pressTimerRef.current = null;
        setPressingId(null);
        if (dragRef.current?.rowId === row.id && dragRef.current.mode === 'idle') {
          dragRef.current.mode = 'cancelled';
          togglePin(row);
        }
      }, PRESS_HOLD_MS);
    }
  };

  const onRowPointerMove = (event: ReactPointerEvent<HTMLDivElement>, row: InboxMessage) => {
    const drag = dragRef.current;
    if (drag == null || drag.rowId !== row.id) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.mode === 'idle') {
      if (drag.canSwipe && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        drag.mode = 'swipe';
        gestureClaimRef.current = 'row';
        event.currentTarget.setPointerCapture(drag.pointerId);
        cancelPress();
        setSwipeRowId(row.id);
        setSwipeSettling(false);
      } else if (Math.hypot(dx, dy) > 10) {
        drag.mode = 'cancelled';
        cancelPress();
      }
    }
    if (drag.mode === 'swipe') {
      setSwipeX(Math.max(-SWIPE_MAX_PX, Math.min(0, dx)));
    }
  };

  const onRowPointerEnd = (event: ReactPointerEvent<HTMLDivElement>, row: InboxMessage) => {
    cancelPress();
    const drag = dragRef.current;
    dragRef.current = null;
    if (gestureClaimRef.current === 'row') {
      gestureClaimRef.current = null;
    }
    if (drag == null || drag.rowId !== row.id || drag.mode !== 'swipe') {
      return;
    }
    const dx = Math.max(-SWIPE_MAX_PX, Math.min(0, event.clientX - drag.startX));
    if (dx <= -SWIPE_COMMIT_PX) {
      commitArchive(row);
      return;
    }
    // Spring back (mgc-settle overshoot bezier), then release the reveal.
    setSwipeSettling(true);
    setSwipeX(0);
    if (swipeSettleTimerRef.current != null) {
      window.clearTimeout(swipeSettleTimerRef.current);
    }
    swipeSettleTimerRef.current = window.setTimeout(
      () => {
        setSwipeRowId(null);
        setSwipeSettling(false);
      },
      reducedMotion ? 0 : 360,
    );
  };

  const onRowTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>, row: InboxMessage) => {
    if (leavingId === row.id && event.propertyName === 'transform') {
      if (leaveFallbackTimerRef.current != null) {
        window.clearTimeout(leaveFallbackTimerRef.current);
        leaveFallbackTimerRef.current = null;
      }
      finalizeArchive(row.id);
    }
  };

  // ----- list-zone pointer handlers (pull-down + two-pointer pinch) -----

  const atTop = () => (document.scrollingElement?.scrollTop ?? 0) < 4;

  const pinchDistance = () => {
    const points = [...pinchPointsRef.current.values()];
    if (points.length < 2) {
      return null;
    }
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  };

  const onListPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pinchPointsRef.current.set(event.pointerId, {x: event.clientX, y: event.clientY});
    if (pinchPointsRef.current.size === 2 && pinchEnabled) {
      pinchStartDistRef.current = pinchDistance();
      setPinchActive(true);
      pullDragRef.current = null;
      if (pullPhase === 'drag') {
        setPull(0);
        setPullPhase('idle');
      }
      gestureClaimRef.current = 'list';
      return;
    }
    if (
      pinchPointsRef.current.size === 1 &&
      pullEnabled &&
      pullPhase === 'idle' &&
      gestureClaimRef.current == null &&
      atTop()
    ) {
      pullDragRef.current = {startY: event.clientY, active: false};
    }
  };

  const onListPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pinchPointsRef.current.has(event.pointerId)) {
      pinchPointsRef.current.set(event.pointerId, {x: event.clientX, y: event.clientY});
    }
    // Two-pointer pinch.
    if (pinchStartDistRef.current != null && pinchPointsRef.current.size >= 2) {
      const dist = pinchDistance();
      if (dist == null || pinchStartDistRef.current === 0) {
        return;
      }
      const ratio = dist / pinchStartDistRef.current;
      setPinchScale(1 - Math.min(0.06, Math.max(0, 1 - ratio) * 0.24));
      if (!compact && ratio < PINCH_COMMIT_RATIO) {
        commitCompact();
        pinchStartDistRef.current = null;
        setPinchActive(false);
        setPinchScale(1);
      } else if (coachDone && compact && ratio > PINCH_EXPAND_RATIO) {
        setCompact(false);
        showToast('Comfortable view restored');
        pinchStartDistRef.current = null;
        setPinchActive(false);
        setPinchScale(1);
      }
      return;
    }
    // Single-pointer pull (skipped while a row owns the gesture).
    if (gestureClaimRef.current === 'row') {
      return;
    }
    const pd = pullDragRef.current;
    if (pd == null || pullPhase === 'refreshing') {
      return;
    }
    const dy = event.clientY - pd.startY;
    if (!pd.active) {
      if (dy > 8 && atTop()) {
        pd.active = true;
        gestureClaimRef.current = 'list';
        event.currentTarget.setPointerCapture(event.pointerId);
        setPullPhase('drag');
      } else {
        return;
      }
    }
    setPull(Math.min(PULL_MAX_PX, Math.max(0, dy * 0.5)));
  };

  const onListPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pinchPointsRef.current.delete(event.pointerId);
    if (pinchPointsRef.current.size < 2 && pinchStartDistRef.current != null) {
      pinchStartDistRef.current = null;
      setPinchActive(false);
      setPinchScale(1);
    }
    const pd = pullDragRef.current;
    pullDragRef.current = null;
    if (gestureClaimRef.current === 'list') {
      gestureClaimRef.current = null;
    }
    if (pd?.active !== true || pullPhase === 'refreshing') {
      return;
    }
    if (pull >= PULL_ARM_PX) {
      startRefresh();
      return;
    }
    setPull(0);
    setPullPhase('settle');
    if (settleTimerRef.current != null) {
      window.clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = window.setTimeout(() => setPullPhase('idle'), 380);
  };

  // ----- anchored row menu (the archive/pin button path) -----

  const openMenu = (event: ReactMouseEvent<HTMLButtonElement>, rowId: string) => {
    const shell = shellRef.current;
    if (shell == null) {
      return;
    }
    if (menu?.rowId === rowId) {
      setMenu(null);
      return;
    }
    const btnRect = event.currentTarget.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const top = Math.max(60, Math.min(btnRect.bottom - shellRect.top + 4, shell.offsetHeight - 130));
    setMenu({rowId, top});
  };

  const menuRow = menu == null ? null : rows.find(r => r.id === menu.rowId) ?? null;

  // ----- render helpers -----

  const armed = pull >= PULL_ARM_PX;
  const pullVisible = pullPhase !== 'idle' && (pull > 0 || pullPhase === 'refreshing');
  const arrowAngle = Math.min(180, (pull / PULL_ARM_PX) * 180);
  const listTransform =
    reducedMotion
      ? undefined
      : `translateY(${pull}px) scale(${pinchScale})`;
  const listSettles = pullPhase === 'settle' || pullPhase === 'refreshing';

  const dimRowsStep = activeStep?.id === 'swipe' || activeStep?.id === 'press';
  const targetRowId =
    activeStep?.id === 'swipe' ? SWIPE_TARGET_ID : activeStep?.id === 'press' ? PRESS_TARGET_ID : null;
  const cardHalo = activeStep?.id === 'pull' || activeStep?.id === 'pinch';

  const renderRow = (row: InboxMessage, index: number) => {
    const isTarget = targetRowId === row.id;
    const dimmed = dimRowsStep && !isTarget;
    const isSwiping = swipeRowId === row.id;
    const isLeaving = leavingId === row.id;
    const isPinned = pinnedIds.includes(row.id);
    const isNew = row.id === NEW_MESSAGE.id;
    const showUnder = isSwiping || isLeaving;
    const revealProgress = Math.min(1, -swipeX / SWIPE_COMMIT_PX);
    const contentClass = [
      'mgc-dim',
      isLeaving ? 'mgc-slide' : isSwiping && swipeSettling ? 'mgc-settle' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div key={row.id}>
        {index > 0 ? (
          <div style={compact ? styles.rowDividerCompact : styles.rowDivider} aria-hidden="true" />
        ) : null}
        <div style={styles.rowOuter} className={isNew && !reducedMotion ? 'mgc-row-in' : undefined}>
          {showUnder ? (
            <div style={{...styles.archiveUnder, opacity: isLeaving ? 1 : revealProgress}} aria-hidden="true">
              <div style={styles.archiveUnderLabel}>
                <Icon icon={ArchiveIcon} size="sm" color="inherit" />
                Archive
              </div>
            </div>
          ) : null}
          <div
            className={contentClass}
            style={{
              ...styles.rowContent,
              ...(compact ? styles.rowContentCompact : null),
              transform: isLeaving
                ? 'translateX(-110%)'
                : isSwiping
                  ? `translateX(${swipeX}px)`
                  : undefined,
              opacity: isLeaving ? 0 : dimmed ? 0.45 : 1,
            }}
            onPointerDown={e => onRowPointerDown(e, row)}
            onPointerMove={e => onRowPointerMove(e, row)}
            onPointerUp={e => onRowPointerEnd(e, row)}
            onPointerCancel={e => onRowPointerEnd(e, row)}
            onTransitionEnd={e => onRowTransitionEnd(e, row)}>
            <div
              style={{
                ...styles.monogram,
                ...(compact ? styles.monogramCompact : null),
                background: artGradient(row.hue),
              }}
              aria-hidden="true">
              {row.mono}
            </div>
            <div style={styles.rowText}>
              <div style={styles.senderRow}>
                {row.unread ? <span style={styles.unreadDot} aria-label="Unread" /> : null}
                <span style={{...styles.sender, ...(row.unread ? styles.senderUnread : null)}}>
                  {row.sender}
                </span>
                {isPinned ? (
                  <span style={styles.pinGlyph} aria-label="Pinned">
                    <Icon icon={PinIcon} size="sm" color="inherit" />
                  </span>
                ) : null}
                {compact ? <span style={styles.subject}>— {row.subject}</span> : null}
              </div>
              {!compact ? <div style={styles.subject}>{row.subject}</div> : null}
            </div>
            <div style={styles.rowTrailing}>
              <span style={styles.timeText}>{row.time}</span>
              <button
                type="button"
                className="mgc-btn mgc-focusable"
                style={styles.moreBtn}
                aria-label={`Actions for ${row.sender}`}
                aria-haspopup="menu"
                aria-expanded={menu?.rowId === row.id}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => openMenu(e, row.id)}>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </button>
            </div>
          </div>
          {/* Coach halo on the spotlighted row. */}
          {isTarget && !isLeaving ? (
            <div
              style={{...styles.halo, ...(reducedMotion ? {opacity: 0.8} : null)}}
              className={reducedMotion ? undefined : 'mgc-halo'}
              aria-hidden="true"
            />
          ) : null}
          {/* DEMO GHOST — swipe arc replay (removed under reduced motion). */}
          {isTarget && activeStep?.id === 'swipe' && !reducedMotion && !isSwiping && !isLeaving ? (
            <div style={styles.ghostSwipeSeat} aria-hidden="true">
              <div style={{...styles.ghostDot, ...styles.ghostSwipeDot}} className="mgc-ghost-swipe" />
            </div>
          ) : null}
          {/* DEMO GHOST — long-press dot + growing ring. */}
          {isTarget && activeStep?.id === 'press' && !reducedMotion && pressingId !== row.id ? (
            <div style={styles.ghostHoldSeat} aria-hidden="true">
              <div style={styles.ghostHoldRing} className="mgc-ghost-ring" />
              <div style={{...styles.ghostDot, ...styles.ghostHoldDot}} className="mgc-ghost-hold" />
            </div>
          ) : null}
          {/* Live long-press progress ring (SVG dashoffset over the hold). */}
          {pressingId === row.id && !reducedMotion ? (
            <div style={styles.pressRingSeat} aria-hidden="true">
              <svg width={28} height={28} viewBox="0 0 28 28">
                <circle cx={14} cy={14} r={11} fill="none" stroke="var(--color-border)" strokeWidth={2.5} />
                <circle
                  className="mgc-press-fill"
                  cx={14}
                  cy={14}
                  r={11}
                  fill="none"
                  stroke={BRAND_ACCENT}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={69.1}
                  strokeDashoffset={69.1}
                  transform="rotate(-90 14 14)"
                />
              </svg>
            </div>
          ) : null}
          {/* Success pop anchored to this row. */}
          {pop != null && pop.rowId === row.id ? (
            <div key={pop.key} style={styles.popRowSeat} aria-hidden="true">
              <div style={styles.popCircle} className="mgc-pop" onAnimationEnd={() => setPop(null)}>
                <Icon icon={CheckIcon} size="md" color="inherit" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // ----- step card / completion card -----

  const renderProgressDots = () => (
    <div
      style={styles.dotsRow}
      role="img"
      aria-label={`Progress: ${doneCount} done, ${skippedCount} skipped, ${
        STEPS.length - doneCount - skippedCount
      } remaining`}>
      {STEPS.map((step, i) => {
        const status = statuses[step.id];
        const isActive = i === stepIndex;
        return (
          <span
            key={step.id}
            style={{
              ...styles.progressDot,
              ...(status === 'done'
                ? styles.progressDotDone
                : status === 'skipped'
                  ? styles.progressDotSkipped
                  : null),
              ...(isActive ? styles.progressDotActive : null),
            }}>
            {status === 'skipped' ? <span style={styles.skipMark} /> : null}
          </span>
        );
      })}
    </div>
  );

  const renderStepCard = (step: CoachStep) => (
    <div
      key={stepIndex}
      style={styles.stepCard}
      className={reducedMotion ? undefined : cardLeaving ? 'mgc-card-out' : 'mgc-card-in'}>
      <div style={styles.stepHeader}>
        <span style={styles.coachSeat} aria-hidden="true">
          <Icon icon={GraduationCapIcon} size="sm" color="inherit" />
        </span>
        <span style={styles.stepEyebrow}>
          Gesture coach · Step {stepIndex + 1} of {STEPS.length}
        </span>
        {renderProgressDots()}
      </div>
      <h2 style={styles.stepTitle}>{step.title}</h2>
      <p style={styles.stepInstruction}>{step.instruction}</p>
      {reducedMotion ? (
        <div style={styles.diagramRow}>
          <span style={styles.diagramSvgSeat}>
            <StepDiagram stepId={step.id} />
          </span>
          <span style={styles.phaseCaption} aria-live="polite">
            {step.phases[demoPhase]}
          </span>
          <button
            type="button"
            className="mgc-btn mgc-focusable"
            style={styles.showMeBtn}
            onClick={() => setDemoPhase(prev => (prev + 1) % 3)}>
            Show me
          </button>
        </div>
      ) : null}
      <div style={styles.stepFooter}>
        <span style={styles.targetChip}>Target · {step.targetLabel}</span>
        <span style={styles.footerSpacer} />
        <button
          type="button"
          className="mgc-btn mgc-focusable"
          style={styles.skipBtn}
          onClick={() => completeStep(step.id, 'skipped')}>
          <Icon icon={SkipForwardIcon} size="sm" color="inherit" />
          Skip gesture
        </button>
      </div>
    </div>
  );

  const renderDoneCard = () => (
    <div style={styles.doneCard} className={reducedMotion ? undefined : 'mgc-lift-in'}>
      <div style={styles.doneCircleSeat} aria-hidden="true">
        <svg width={56} height={56} viewBox="0 0 56 56">
          <circle cx={28} cy={28} r={25} fill="none" stroke={BRAND_TINT_22} strokeWidth={4} />
          <circle cx={28} cy={28} r={25} fill="none" stroke={BRAND_ACCENT} strokeWidth={4} strokeLinecap="round" />
          <path
            className={`mgc-check-path${checkDrawn ? ' mgc-check-drawn' : ''}`}
            d="M17 29 L25 37 L40 21"
            fill="none"
            stroke={BRAND_ACCENT}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 style={styles.doneTitle}>Coach complete</h2>
      <p style={styles.doneSummary}>
        {doneCount + skippedCount} of {STEPS.length} gestures
        {skippedCount > 0 ? ` — ${skippedCount} skipped` : ' — all performed'}
      </p>
      <p style={styles.doneCaption}>Every gesture stays live in the inbox — keep practicing.</p>
      <button type="button" className="mgc-btn mgc-focusable" style={styles.practiceBtn} onClick={resetAll}>
        <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
        Practice again
      </button>
    </div>
  );

  // ----- page -----

  return (
    <div ref={wrapRef} style={isDesktop ? styles.wrapDesktop : styles.wrap}>
      <style>{MGC_CSS}</style>
      <div ref={shellRef} style={{...styles.shell, ...(isDesktop ? styles.shellDesktop : null)}}>
        <h1 className="mgc-vh">Skylark Inbox — Gesture Coach</h1>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat} aria-hidden="true">
              <span style={styles.brandTile}>S</span>
            </span>
          </div>
          <p style={styles.navTitle}>Inbox</p>
          <div style={styles.navTrailing}>
            {/* Button path for the pull gesture — same refresh choreography. */}
            <button
              type="button"
              className="mgc-btn mgc-focusable"
              style={styles.iconBtn}
              aria-label="Refresh inbox"
              onClick={startRefresh}>
              <span className={pullPhase === 'refreshing' && !reducedMotion ? 'mgc-spin' : undefined} style={{display: 'grid', placeItems: 'center'}}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* SECTION HEADER + density toggle (pinch button path). */}
          <div style={styles.sectionHeaderRow}>
            <span style={styles.sectionEyebrow}>
              Inbox · {TODAY_LABEL} · {rows.length} messages
            </span>
            <button
              type="button"
              className="mgc-btn mgc-focusable"
              style={styles.densityBtn}
              aria-pressed={compact}
              onClick={toggleCompact}>
              <Icon icon={compact ? ChevronsUpDownIcon : ChevronsDownUpIcon} size="sm" color="inherit" />
              {compact ? 'Comfortable' : 'Compact'}
            </button>
          </div>

          {/* PULL ZONE — indicator + listCard + list-level ghosts/pops. */}
          <div
            style={{
              ...styles.pullZone,
              touchAction: activeStep?.id === 'pull' || activeStep?.id === 'pinch' ? 'none' : 'pan-y',
            }}
            onPointerDown={onListPointerDown}
            onPointerMove={onListPointerMove}
            onPointerUp={onListPointerEnd}
            onPointerCancel={onListPointerEnd}>
            <div
              style={{
                ...styles.pullIndicator,
                ...(armed || pullPhase === 'refreshing' ? styles.pullIndicatorArmed : null),
                opacity: pullVisible ? 1 : 0,
                transform: reducedMotion ? undefined : `translateY(${pull - 32}px)`,
              }}
              className={listSettles && !reducedMotion ? 'mgc-settle' : undefined}
              aria-hidden="true">
              {pullPhase === 'refreshing' ? (
                <span className={reducedMotion ? undefined : 'mgc-spin'} style={{display: 'grid', placeItems: 'center'}}>
                  <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
                </span>
              ) : (
                <span style={{display: 'grid', placeItems: 'center', transform: `rotate(${arrowAngle}deg)`}}>
                  <Icon icon={ArrowDownIcon} size="sm" color="inherit" />
                </span>
              )}
            </div>

            <div
              style={{...styles.listCard, transform: listTransform}}
              className={listSettles && !reducedMotion && !pinchActive ? 'mgc-settle' : undefined}>
              {rows.map((row, index) => renderRow(row, index))}
              {/* Card-level coach halo (pull + pinch steps). */}
              {cardHalo ? (
                <div
                  style={{...styles.haloCard, ...(reducedMotion ? {opacity: 0.8} : null)}}
                  className={reducedMotion ? undefined : 'mgc-halo'}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            {/* DEMO GHOST — pull-down rubber-band replay. */}
            {activeStep?.id === 'pull' && !reducedMotion && pullPhase === 'idle' ? (
              <div style={styles.ghostPullSeat} aria-hidden="true">
                <div style={styles.ghostDot} className="mgc-ghost-pull" />
              </div>
            ) : null}
            {/* DEMO GHOST — twin dots pinching. */}
            {activeStep?.id === 'pinch' && !reducedMotion && !pinchActive ? (
              <div style={styles.ghostPinchSeat} aria-hidden="true">
                <div style={{...styles.ghostDot, ...styles.ghostPinchL}} className="mgc-ghost-pinch-l" />
                <div style={{...styles.ghostDot, ...styles.ghostPinchR}} className="mgc-ghost-pinch-r" />
              </div>
            ) : null}
            {/* List-level success pop (pinch / refresh outcomes). */}
            {pop != null && pop.rowId == null ? (
              <div key={pop.key} style={styles.popListSeat} aria-hidden="true">
                <div style={styles.popCircle} className="mgc-pop" onAnimationEnd={() => setPop(null)}>
                  <Icon icon={CheckIcon} size="md" color="inherit" />
                </div>
              </div>
            ) : null}
          </div>

          <p style={styles.listCaption}>
            {coachDone
              ? 'Swipe, hold, pull, and pinch anywhere — the coach signed off.'
              : 'Perform the highlighted gesture on the inbox to advance.'}
          </p>
          <div style={styles.spacer24} />
        </main>

        {/* COACH DOCK — sticky bottom card + the single polite toast above. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  type="button"
                  className="mgc-btn mgc-focusable"
                  style={styles.toastClose}
                  aria-label="Dismiss notification"
                  onClick={() => setToast(null)}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>
          {activeStep != null ? renderStepCard(activeStep) : renderDoneCard()}
        </div>

        {/* ANCHORED ROW MENU — the archive/pin ≥44×44 button path. */}
        {menu != null && menuRow != null ? (
          <>
            <button
              type="button"
              className="mgc-btn"
              style={styles.menuCatcher}
              aria-label="Close menu"
              onClick={() => setMenu(null)}
            />
            <div style={{...styles.menu, top: menu.top}} role="menu" aria-label={`Actions for ${menuRow.sender}`}>
              <button
                type="button"
                role="menuitem"
                className="mgc-btn mgc-focusable"
                style={styles.menuRow}
                onClick={() => {
                  setMenu(null);
                  commitArchive(menuRow);
                }}>
                <Icon icon={ArchiveIcon} size="sm" color="inherit" />
                Archive
              </button>
              <div style={styles.menuHairline} aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className="mgc-btn mgc-focusable"
                style={styles.menuRow}
                onClick={() => {
                  setMenu(null);
                  togglePin(menuRow);
                }}>
                <Icon icon={PinIcon} size="sm" color="inherit" />
                {pinnedIds.includes(menuRow.id) ? 'Unpin' : 'Pin'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
