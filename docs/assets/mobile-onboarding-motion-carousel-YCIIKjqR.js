var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Switchback hiking-companion
 *   onboarding frozen mid-flow: 4 pages (Discover / Plan / Hike /
 *   Celebrate) each with eyebrow + headline + body copy and a composed
 *   illustration built from 3 layered token-tinted shape groups; 6 fixed
 *   confetti dots on the summit page (const array — no Math.random());
 *   the pace gauge shows a fixed 70% arc and a '9:42 /mi' chip. No
 *   Date.now(), no network media, no real logos.
 * @output Switchback — Onboarding Motion Carousel: a 390px MOBILE 4-page
 *   onboarding flow. NavBar (mountain mark + 'Switchback' wordmark ·
 *   Skip) over a 3px progress hairline whose fill scaleX tracks overall
 *   scroll progress. The pager is a horizontal scroll-snap carousel
 *   (native touch swipe; mouse drag via pointer capture that suspends
 *   snap during the drag and settles to the nearest page on release —
 *   >48px flicks advance one page). Each page's illustration is 3 layer
 *   groups that PARALLAX against per-page scroll offset at +8 / −16 /
 *   −24 px, plus ONE looping idle animation per page: floating pin bob,
 *   slow satellite orbit around the sun, pace-halo pulse, and pennant
 *   sway. Copy fades/rises in when its page becomes the scroll-derived
 *   active index (staggered 80/160ms delays). Page dots morph — the
 *   active dot stretches into a 20px pill with an overshoot spring. On
 *   the last page the Next button widens and crossfades its label into
 *   'Get started', which raises a checkmark draw-on overlay (SVG ring
 *   480ms stroke-dashoffset, check 320ms, overshoot pop) then posts a
 *   toast "You're in". Done dismisses the overlay and the footer primary
 *   becomes 'Start over' (full replay). The 44px Back and 48px Next
 *   buttons are the mandatory button path for the swipe gesture; dots
 *   are presentational indicators (no sub-44px hits exist).
 * @position Page template; emitted by \`astryx template mobile-onboarding-motion-carousel\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the 52px
 *   navBar at y=0 is the first pixel). The completion scrim + card are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the overlay is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. ONE polite toast dock
 *   (aria-live) rides the sticky footer dock at bottom:100 (12px above
 *   the 88px footer — the tab-bar analog here); one toast at a time, a
 *   new toast REPLACES the old.
 * Animation contract: transform/opacity only (plus SVG
 *   stroke-dashoffset for the ring/check draw-on). Overshoot spring =
 *   cubic-bezier(0.34, 1.56, 0.64, 1); decelerate =
 *   cubic-bezier(0.22, 1, 0.36, 1). Two SANCTIONED tiny-control width
 *   transitions, both spec-mandated morphs on sub-200px chrome: the
 *   active page dot (8→20px pill) and the Next→'Get started' primary
 *   (104→148px with label crossfade). Parallax + the progress hairline
 *   read scrollLeft in the pager's onScroll and bind transforms
 *   directly. Reduced motion (matchMedia read once in a useEffect with
 *   a change listener): idle loops and parallax are REMOVED entirely
 *   (classes not applied, transforms skipped), paging is instant
 *   (behavior:'auto'), dots and the button morph swap without
 *   transition, copy swaps opacity-only, and the ring/check render
 *   complete behind a plain crossfade.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white 16px text on
 *   #0F766E ≈ 5.5:1; near-black #04211D on #5EEAD4 ≈ 11:1. As a bare
 *   fill: #0F766E on the white body ≈ 5.5:1 and #5EEAD4 on the ~#1C1C1E
 *   dark card ≈ 11:1 — both clear the ≥3:1 bar for meaningful fills
 *   (active dot, pin, orbiter, gauge arc, pennant). Illustration washes
 *   are color-mix tints of BRAND_ACCENT over tokens (decorative, never
 *   state-bearing). The scrim literal is sanctioned. Never
 *   var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20, grid
 *   '1fr auto 1fr', hairline border; progress hairline 3px sticky
 *   top:52 z19; footer 88px sticky bottom z20 (44px Back · dots · 48px
 *   primary); illustration stage 240px radius 24 inside the 16px inset.
 *   TYPE (Figtree via --font-family-body): 28/700 headlines · 17/600
 *   nav wordmark · 16/400 body · 13/400 meta · 11/600 eyebrows; nothing
 *   under 11px; tabular-nums on the pace chip. Touch: every target
 *   ≥44×44 (dots are 8–20px glyphs centered in 44×44 buttons).
 *
 * Responsive contract:
 * - Fluid 320–430: pages are width:100% snap children; copy maxWidth
 *   300 centered; the illustration stage is fluid (shapes are inset-
 *   positioned, overflow clipped). overflowX:'clip' backstop on shell.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — the demo's inline stage never fires viewport
 *   queries); >560px renders the centered 430px phone column on a
 *   var(--color-background-muted) backdrop. Never a stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
  UIEvent as ReactUIEvent,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GaugeIcon,
  MapPinIcon,
  MountainIcon,
  SunIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Switchback evergreen). White text on
// #0F766E ≈ 5.5:1; near-black #04211D on #5EEAD4 ≈ 11:1. As a bare fill:
// #0F766E on the white body ≈ 5.5:1; #5EEAD4 on the ~#1C1C1E dark card
// ≈ 11:1 — both ≥3:1 for meaningful fills (dot, pin, arc, pennant).
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text/glyphs over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #04211D)';
// Decorative illustration washes — tints of the one brand literal over
// tokens; never state-bearing, so no contrast floor applies.
const BRAND_TINT_10 = \`color-mix(in srgb, \${BRAND_ACCENT} 10%, transparent)\`;
const BRAND_TINT_16 = \`color-mix(in srgb, \${BRAND_ACCENT} 16%, transparent)\`;
const BRAND_TINT_26 = \`color-mix(in srgb, \${BRAND_ACCENT} 26%, transparent)\`;
// Sanctioned scrim literal behind the completion card.
const SCRIM = 'light-dark(rgba(16, 22, 20, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, hidden scrollbar,
// the four idle loops (transform-only keyframes), ring/check draw-on
// transitions, overlay/toast entries, and a reduced-motion guard that
// kills every loop and transition (belt-and-suspenders on top of the
// state-driven class removal).
// ---------------------------------------------------------------------------

const OMC_CSS = \`
.omc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.omc-btn:disabled { cursor: default; }
.omc-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.omc-pager { scrollbar-width: none; }
.omc-pager::-webkit-scrollbar { display: none; }
.omc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes omc-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.omc-loop-bob { animation: omc-bob 3200ms ease-in-out infinite; }
@keyframes omc-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.omc-loop-orbit { animation: omc-orbit 10s linear infinite; }
@keyframes omc-pulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.14); opacity: 0.5; }
}
.omc-loop-pulse { animation: omc-pulse 2600ms ease-in-out infinite; }
@keyframes omc-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(4deg); }
}
.omc-loop-sway {
  animation: omc-sway 3400ms ease-in-out infinite;
  transform-origin: left 90%;
}
.omc-ring { transition: stroke-dashoffset 480ms cubic-bezier(0.22, 1, 0.36, 1); }
.omc-check { transition: stroke-dashoffset 320ms cubic-bezier(0.22, 1, 0.36, 1) 500ms; }
@keyframes omc-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.omc-pop { animation: omc-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes omc-card-in {
  from { transform: translateY(12px) scale(0.96); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.omc-card-in { animation: omc-card-in 240ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes omc-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.omc-fade-in { animation: omc-fade-in 200ms ease; }
@keyframes omc-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.omc-toast-in { animation: omc-toast-in 220ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) {
  .omc-loop-bob, .omc-loop-orbit, .omc-loop-pulse, .omc-loop-sway,
  .omc-pop, .omc-card-in, .omc-fade-in, .omc-toast-in { animation: none; }
  .omc-ring, .omc-check { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapWide: {background: 'var(--color-background-muted)', minHeight: '100dvh'},
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
  // NAV BAR — 52px sticky top z20, grid '1fr auto 1fr', hairline.
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
  navLeading: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, paddingInlineStart: 8},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  brandMark: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_16,
    color: BRAND_ACCENT,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  skipBtn: {
    height: 44,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // PROGRESS HAIRLINE — 3px track under the navBar; fill is scaleX-bound
  // to overall scroll progress (transform-only).
  progressTrack: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 3,
    background: 'var(--color-background-muted)',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    background: BRAND_ACCENT,
    transformOrigin: 'left center',
  },
  main: {flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'},
  // PAGER — horizontal scroll-snap carousel; snap suspends during mouse
  // drag (inline scrollSnapType swap).
  pager: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'pan-x pan-y',
  },
  page: {
    flex: '0 0 100%',
    width: '100%',
    minWidth: 0,
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
    padding: '8px 16px 24px',
  },
  // ILLUSTRATION STAGE — 240px rounded tile; 3 parallax layer groups.
  illoStage: {
    position: 'relative',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    background: \`color-mix(in srgb, \${BRAND_ACCENT} 7%, var(--color-background-muted))\`,
    flexShrink: 0,
  },
  illoLayer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  // Page 1 — trails.
  hillA: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: BRAND_TINT_16,
    left: -70,
    bottom: -150,
  },
  hillB: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: '50%',
    background: BRAND_TINT_10,
    right: -120,
    bottom: -220,
  },
  trailSvg: {position: 'absolute', insetInline: 0, bottom: 0, width: '100%', height: 150},
  pinWrap: {position: 'absolute', left: 'calc(50% - 28px)', top: 58, width: 56},
  pin: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    boxShadow: '0 6px 16px var(--color-shadow)',
  },
  pinShadow: {
    position: 'absolute',
    left: 'calc(50% - 14px)',
    top: 128,
    width: 28,
    height: 7,
    borderRadius: 999,
    background: 'color-mix(in srgb, var(--color-text-primary) 16%, transparent)',
  },
  // Page 2 — forecast.
  horizon: {
    position: 'absolute',
    width: 440,
    height: 260,
    borderRadius: '50%',
    background: BRAND_TINT_10,
    left: -30,
    bottom: -180,
  },
  cloud: {
    position: 'absolute',
    height: 30,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
  orbitWrap: {position: 'absolute', left: 'calc(50% - 75px)', top: 28, width: 150, height: 150},
  orbitRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '1px dashed var(--color-border-emphasized)',
  },
  sun: {
    position: 'absolute',
    left: 'calc(50% - 36px)',
    top: 'calc(50% - 36px)',
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_26,
    border: \`2px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
  },
  orbiter: {position: 'absolute', inset: 0},
  orbiterDot: {
    position: 'absolute',
    left: 'calc(50% - 9px)',
    top: -9,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: '3px solid var(--color-background-card)',
  },
  // Page 3 — pace.
  paceSoftRing: {
    position: 'absolute',
    left: 'calc(50% - 110px)',
    top: 10,
    width: 220,
    height: 220,
    borderRadius: '50%',
    border: \`18px solid \${BRAND_TINT_10}\`,
  },
  gaugeSvg: {position: 'absolute', left: 'calc(50% - 70px)', top: 50, width: 140, height: 140},
  paceHalo: {
    position: 'absolute',
    left: 'calc(50% - 42px)',
    top: 78,
    width: 84,
    height: 84,
    borderRadius: '50%',
    background: BRAND_TINT_16,
  },
  paceChip: {
    position: 'absolute',
    left: 'calc(50% - 46px)',
    top: 92,
    width: 92,
    height: 56,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: BRAND_ACCENT,
    boxShadow: '0 4px 12px var(--color-shadow)',
  },
  paceValue: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Page 4 — summit.
  farPeak: {
    position: 'absolute',
    left: -24,
    bottom: 0,
    width: 220,
    height: 150,
    background: BRAND_TINT_10,
    clipPath: 'polygon(50% 0, 0 100%, 100% 100%)',
  },
  mainPeak: {
    position: 'absolute',
    right: 9,
    bottom: 0,
    width: 260,
    height: 190,
    background: \`color-mix(in srgb, \${BRAND_ACCENT} 24%, var(--color-background-muted))\`,
    clipPath: 'polygon(50% 0, 0 100%, 100% 100%)',
  },
  snowCap: {
    position: 'absolute',
    left: 177,
    top: 50,
    width: 84,
    height: 58,
    background: 'var(--color-background-card)',
    clipPath: 'polygon(50% 0, 0 100%, 100% 100%)',
  },
  flagPole: {
    position: 'absolute',
    left: 217,
    top: 8,
    width: 3,
    height: 46,
    borderRadius: 2,
    background: 'var(--color-text-secondary)',
  },
  pennant: {
    position: 'absolute',
    left: 220,
    top: 8,
    width: 44,
    height: 24,
    background: BRAND_ACCENT,
    clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
  },
  confettiDot: {position: 'absolute', borderRadius: '50%'},
  // COPY BLOCK — centered, fade/rise on activation.
  copy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    textAlign: 'center',
    maxWidth: 300,
    marginInline: 'auto',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: BRAND_ACCENT,
  },
  headline: {fontSize: 28, fontWeight: 700, lineHeight: 1.15, margin: 0},
  body: {fontSize: 16, lineHeight: 1.45, color: 'var(--color-text-secondary)', margin: 0},
  // FOOTER DOCK — sticky bottom z20; toast rides 12px above the 88px bar.
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20},
  footer: {
    height: 88,
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  backBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  backBtnDisabled: {opacity: 0.35},
  // Dots are presentational indicators (aria-hidden) — Back / Next /
  // swipe are the navigation paths, so no sub-44px hits exist. Footer
  // math at 390: 16+44+12+~68+12+148+16 = 316 ✓ (fits 320 too).
  dotRow: {display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8},
  dot: {height: 8, borderRadius: 999},
  // Primary — 48px; width transitions between 104 / 148 / 132 (sanctioned
  // tiny-control morph, noted in the header). Labels crossfade absolutely.
  nextBtn: {
    position: 'relative',
    height: 48,
    borderRadius: 14,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    overflow: 'hidden',
  },
  nextLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // TOAST — the single polite live region, 12px above the footer.
  toastRegion: {
    position: 'absolute',
    bottom: 100,
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
  },
  toastDismiss: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  // COMPLETION OVERLAY — scrim z40, card z41, absolute inside shell.
  scrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  overlayCenter: {
    position: 'absolute',
    inset: 0,
    zIndex: 41,
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    pointerEvents: 'none',
  },
  overlayCard: {
    pointerEvents: 'auto',
    width: 260,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 20,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 8px 32px var(--color-shadow)',
  },
  overlayTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  overlaySub: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center'},
  overlayDone: {
    width: '100%',
    height: 48,
    marginTop: 4,
    borderRadius: 14,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures.
// ---------------------------------------------------------------------------

type LoopKind = 'bob' | 'orbit' | 'pulse' | 'sway';

interface OnboardPage {
  id: string;
  eyebrow: string;
  headline: string;
  body: string;
  loop: LoopKind; // one idle animation per page
}

const PAGES: OnboardPage[] = [
  {
    id: 'discover',
    eyebrow: 'Discover',
    headline: 'Find trails that fit',
    body: 'Filter 42,000 routes by distance, climb, and how much daylight you have left.',
    loop: 'bob',
  },
  {
    id: 'plan',
    eyebrow: 'Plan',
    headline: 'Forecasts for the trail',
    body: 'Hour-by-hour weather read at the ridge line — not the parking lot below it.',
    loop: 'orbit',
  },
  {
    id: 'hike',
    eyebrow: 'Hike',
    headline: 'Pace that keeps up',
    body: 'Live splits and a glanceable pace ring, even with your phone in your pocket.',
    loop: 'pulse',
  },
  {
    id: 'celebrate',
    eyebrow: 'Celebrate',
    headline: 'Summit, then share',
    body: 'One tap turns the day into a story card your crew can cheer from home.',
    loop: 'sway',
  },
];

const PAGE_COUNT = PAGES.length; // 4
const LAST_INDEX = PAGE_COUNT - 1;

// Deterministic "randomness" — fixed confetti field on the summit page.
// Colors rotate through token/brand fills; never state-bearing.
interface ConfettiSpec {
  left: number;
  top: number;
  size: number;
  color: string;
}

const CONFETTI: ConfettiSpec[] = [
  {left: 58, top: 34, size: 8, color: BRAND_ACCENT},
  {left: 96, top: 72, size: 6, color: 'var(--color-success)'},
  {left: 138, top: 26, size: 7, color: 'var(--color-accent)'},
  {left: 262, top: 88, size: 6, color: BRAND_ACCENT},
  {left: 296, top: 40, size: 8, color: 'var(--color-success)'},
  {left: 322, top: 108, size: 6, color: 'var(--color-accent)'},
];

// SVG draw-on geometry — ring r=44 ⇒ C = 2π·44 ≈ 276.5; check path
// M31 50 L44 63 L66 37 ⇒ 18.4 + 34.1 ≈ 52.5, rounded up to 53.
const RING_LEN = 276.5;
const CHECK_LEN = 53;

// Parallax depths per layer group (px shift at a full page of offset):
// back drifts WITH the swipe, mid/front run against it — brief's ±24/16/8.
const DEPTH_BACK = 8;
const DEPTH_MID = -16;
const DEPTH_FRONT = -24;

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const DECEL = 'cubic-bezier(0.22, 1, 0.36, 1)';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ---------------------------------------------------------------------------
// SHARED HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the demo's inline desktop stage is ~1045px in a
 * 1440px window, so only a ResizeObserver on the wrapper can tell the two
 * stages apart. */
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

/** prefers-reduced-motion, read once via matchMedia with a change
 * listener (batch animation contract). */
function usePrefersReducedMotion(): boolean {
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
// ILLUSTRATIONS — 3 parallax layer groups per page + one idle loop.
// Layer transforms are bound to the per-page scroll offset; when reduced,
// transforms are skipped and loop classes are never applied.
// ---------------------------------------------------------------------------

function layerStyle(depth: number, offset: number, reduced: boolean): CSSProperties {
  if (reduced) {
    return styles.illoLayer;
  }
  return {...styles.illoLayer, transform: \`translateX(\${(offset * depth).toFixed(1)}px)\`};
}

function PageArt({
  page,
  offset,
  reduced,
}: {
  page: OnboardPage;
  offset: number;
  reduced: boolean;
}): ReactNode {
  const loopClass = (kind: string) => (reduced ? undefined : \`omc-loop-\${kind}\`);
  return (
    <div style={styles.illoStage} aria-hidden>
      {page.id === 'discover' ? (
        <>
          <div style={layerStyle(DEPTH_BACK, offset, reduced)}>
            <div style={styles.hillA} />
            <div style={styles.hillB} />
          </div>
          <div style={layerStyle(DEPTH_MID, offset, reduced)}>
            <svg style={styles.trailSvg} viewBox="0 0 358 150" preserveAspectRatio="none">
              <path
                d="M -10 120 C 70 60, 140 150, 220 92 S 330 42, 400 78"
                fill="none"
                stroke={BRAND_ACCENT}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 11"
                opacity={0.55}
              />
            </svg>
          </div>
          <div style={layerStyle(DEPTH_FRONT, offset, reduced)}>
            <div style={styles.pinShadow} />
            <div style={styles.pinWrap} className={loopClass('bob')}>
              <div style={styles.pin}>
                <Icon icon={MapPinIcon} size="md" color="inherit" />
              </div>
            </div>
          </div>
        </>
      ) : null}
      {page.id === 'plan' ? (
        <>
          <div style={layerStyle(DEPTH_BACK, offset, reduced)}>
            <div style={styles.horizon} />
          </div>
          <div style={layerStyle(DEPTH_MID, offset, reduced)}>
            <div style={{...styles.cloud, width: 84, left: 28, top: 52}} />
            <div style={{...styles.cloud, width: 56, right: 40, top: 118}} />
          </div>
          <div style={layerStyle(DEPTH_FRONT, offset, reduced)}>
            <div style={styles.orbitWrap}>
              <div style={styles.orbitRing} />
              <div style={styles.sun}>
                <Icon icon={SunIcon} size="md" color="inherit" />
              </div>
              <div style={styles.orbiter} className={loopClass('orbit')}>
                <div style={styles.orbiterDot} />
              </div>
            </div>
          </div>
        </>
      ) : null}
      {page.id === 'hike' ? (
        <>
          <div style={layerStyle(DEPTH_BACK, offset, reduced)}>
            <div style={styles.paceSoftRing} />
          </div>
          <div style={layerStyle(DEPTH_MID, offset, reduced)}>
            <svg style={styles.gaugeSvg} viewBox="0 0 140 140">
              <circle
                cx={70}
                cy={70}
                r={58}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={12}
              />
              {/* Fixed 70% arc — 2π·58 ≈ 364.4, offset 364.4 × 0.3. */}
              <circle
                cx={70}
                cy={70}
                r={58}
                fill="none"
                stroke={BRAND_ACCENT}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray="364.4"
                strokeDashoffset="109.3"
                transform="rotate(-90 70 70)"
              />
            </svg>
          </div>
          <div style={layerStyle(DEPTH_FRONT, offset, reduced)}>
            <div style={styles.paceHalo} className={loopClass('pulse')} />
            <div style={styles.paceChip}>
              <Icon icon={GaugeIcon} size="sm" color="inherit" />
              <span style={styles.paceValue}>9:42 /mi</span>
            </div>
          </div>
        </>
      ) : null}
      {page.id === 'celebrate' ? (
        <>
          <div style={layerStyle(DEPTH_BACK, offset, reduced)}>
            <div style={styles.farPeak} />
          </div>
          <div style={layerStyle(DEPTH_MID, offset, reduced)}>
            <div style={styles.mainPeak} />
            <div style={styles.snowCap} />
            {CONFETTI.map((dot, index) => (
              <div
                key={index}
                style={{
                  ...styles.confettiDot,
                  left: dot.left,
                  top: dot.top,
                  width: dot.size,
                  height: dot.size,
                  background: dot.color,
                }}
              />
            ))}
          </div>
          <div style={layerStyle(DEPTH_FRONT, offset, reduced)}>
            <div style={styles.flagPole} />
            <div style={styles.pennant} className={loopClass('sway')} />
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

type OverlayPhase = 'hidden' | 'drawing' | 'done';

export default function MobileOnboardingMotionCarouselTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktopColumn = wrapWidth > 560;
  const reduced = usePrefersReducedMotion();

  const pagerRef = useRef<HTMLDivElement | null>(null);
  const pageWidth = useElementWidth(pagerRef);
  const [scrollX, setScrollX] = useState(0);

  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startLeft: number;
    startIndex: number;
  } | null>(null);

  const [overlay, setOverlay] = useState<OverlayPhase>('hidden');
  const [drawn, setDrawn] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);
  const toastSeqRef = useRef(0);
  const overlayTimerRef = useRef<number | null>(null);
  const doneBtnRef = useRef<HTMLButtonElement | null>(null);

  const rawProgress = pageWidth > 0 ? scrollX / pageWidth : 0;
  const activeIndex = clamp(Math.round(rawProgress), 0, LAST_INDEX);
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  // Keep the current page aligned across stage/orientation resizes.
  useEffect(() => {
    const element = pagerRef.current;
    if (element != null && pageWidth > 0) {
      element.scrollLeft = indexRef.current * pageWidth;
    }
  }, [pageWidth]);

  const goTo = useCallback(
    (index: number) => {
      const element = pagerRef.current;
      if (element == null || pageWidth <= 0) {
        return;
      }
      element.scrollTo({
        left: clamp(index, 0, LAST_INDEX) * pageWidth,
        // Reduced motion: pages change instantly.
        behavior: reduced ? 'auto' : 'smooth',
      });
    },
    [pageWidth, reduced],
  );

  const showToast = useCallback((text: string) => {
    toastSeqRef.current += 1;
    setToast({seq: toastSeqRef.current, text});
  }, []);

  // Mouse drag → scrollLeft follows the pointer; snap suspends during the
  // drag, then release settles to the nearest page (>48px flicks advance).
  // Touch swipes use the native scroll-snap physics untouched.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }
    const element = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: element.scrollLeft,
      startIndex: pageWidth > 0 ? clamp(Math.round(element.scrollLeft / pageWidth), 0, LAST_INDEX) : 0,
    };
    element.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    event.currentTarget.scrollLeft = drag.startLeft - (event.clientX - drag.startX);
  };

  const settleDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
    if (pageWidth <= 0) {
      return;
    }
    const delta = event.clientX - drag.startX;
    let target = Math.round(event.currentTarget.scrollLeft / pageWidth);
    if (target === drag.startIndex && Math.abs(delta) > 48) {
      target = drag.startIndex + (delta < 0 ? 1 : -1);
    }
    goTo(clamp(target, 0, LAST_INDEX));
  };

  const onScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    setScrollX(event.currentTarget.scrollLeft);
  };

  // Completion choreography: Get started → ring draws (480ms) → check
  // strokes in (320ms, 500ms delay) → pop + toast. Reduced: everything
  // renders complete behind a plain crossfade, toast posts immediately.
  const startCelebration = useCallback(() => {
    if (overlay !== 'hidden') {
      return;
    }
    if (reduced) {
      setDrawn(true);
      setOverlay('done');
      showToast("You're in");
      return;
    }
    setDrawn(false);
    setOverlay('drawing');
    overlayTimerRef.current = window.setTimeout(() => {
      setOverlay('done');
      showToast("You're in");
      overlayTimerRef.current = null;
    }, 950);
  }, [overlay, reduced, showToast]);

  // Kick the dashoffset transitions one tick after the overlay mounts.
  useEffect(() => {
    if (overlay !== 'drawing' || drawn) {
      return undefined;
    }
    const timer = window.setTimeout(() => setDrawn(true), 40);
    return () => window.clearTimeout(timer);
  }, [overlay, drawn]);

  useEffect(() => {
    if (overlay === 'done') {
      doneBtnRef.current?.focus();
    }
  }, [overlay]);

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current != null) {
        window.clearTimeout(overlayTimerRef.current);
      }
    };
  }, []);

  const dismissOverlay = useCallback(() => {
    setOverlay('hidden');
    setDrawn(false);
    setCompleted(true);
  }, []);

  const restart = useCallback(() => {
    setCompleted(false);
    setToast(null);
    goTo(0);
  }, [goTo]);

  const onPrimary = () => {
    if (completed) {
      restart();
    } else if (activeIndex < LAST_INDEX) {
      goTo(activeIndex + 1);
    } else {
      startCelebration();
    }
  };

  const onLastPage = activeIndex === LAST_INDEX;
  const overlayOpen = overlay !== 'hidden';
  const progress = clamp(rawProgress / LAST_INDEX, 0, 1);

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // Copy fade/rise — active page copy rises in with staggered delays;
  // inactive copy sits faded. Reduced: opacity-only instant swap.
  const copyStyle = (active: boolean, delayMs: number): CSSProperties => ({
    opacity: active ? 1 : 0,
    transform: reduced || active ? 'none' : 'translateY(14px)',
    transition: reduced
      ? 'none'
      : \`opacity 360ms \${DECEL} \${delayMs}ms, transform 420ms \${DECEL} \${delayMs}ms\`,
  });

  // Active dot stretches into a 20px pill with a spring; reduced swaps
  // instantly (no stretch).
  const dotStyle = (active: boolean): CSSProperties => ({
    ...styles.dot,
    width: active ? 20 : 8,
    background: active ? BRAND_ACCENT : 'var(--color-border-emphasized)',
    transition: reduced ? 'none' : \`width 260ms \${SPRING}, background-color 200ms ease\`,
  });

  const primaryLabel = completed ? 'Start over' : onLastPage ? 'Get started' : 'Next';
  const primaryWidth = completed ? 132 : onLastPage ? 148 : 104;
  const labelFade = (visible: boolean): CSSProperties => ({
    ...styles.nextLabel,
    opacity: visible ? 1 : 0,
    transition: reduced ? 'none' : 'opacity 200ms ease',
  });

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapWide : null)}}>
      <style>{OMC_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandMark} aria-hidden>
              <Icon icon={MountainIcon} size="sm" color="inherit" />
            </span>
            <h1 style={styles.wordmark}>Switchback</h1>
          </div>
          <span aria-hidden />
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="omc-btn omc-focusable"
              style={{
                ...styles.skipBtn,
                opacity: onLastPage ? 0 : 1,
                pointerEvents: onLastPage ? 'none' : 'auto',
                transition: reduced ? 'none' : 'opacity 200ms ease',
              }}
              tabIndex={onLastPage ? -1 : 0}
              onClick={() => goTo(LAST_INDEX)}>
              Skip
            </button>
          </div>
        </header>

        {/* Progress hairline — fill scaleX tracks overall scroll progress. */}
        <div style={styles.progressTrack} aria-hidden>
          <div style={{...styles.progressFill, transform: \`scaleX(\${progress.toFixed(4)})\`}} />
        </div>

        <main style={styles.main}>
          <div
            ref={pagerRef}
            className="omc-pager"
            role="region"
            aria-roledescription="carousel"
            aria-label="Switchback onboarding"
            style={{
              ...styles.pager,
              scrollSnapType: dragging ? 'none' : 'x mandatory',
              cursor: dragging ? 'grabbing' : 'grab',
            }}
            onScroll={onScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={settleDrag}
            onPointerCancel={settleDrag}>
            {PAGES.map((page, index) => {
              // Per-page parallax offset in [-1, 1] pages.
              const offset = pageWidth > 0 ? clamp(rawProgress - index, -1, 1) : 0;
              const active = index === activeIndex;
              return (
                <section
                  key={page.id}
                  style={styles.page}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={\`Page \${index + 1} of \${PAGE_COUNT}: \${page.headline}\`}
                  aria-hidden={active ? undefined : true}>
                  <PageArt page={page} offset={offset} reduced={reduced} />
                  <div style={styles.copy}>
                    <span style={{...styles.eyebrow, ...copyStyle(active, 80)}}>{page.eyebrow}</span>
                    <h2 style={{...styles.headline, ...copyStyle(active, 80)}}>{page.headline}</h2>
                    <p style={{...styles.body, ...copyStyle(active, 160)}}>{page.body}</p>
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        {/* Footer dock — Back · morphing dots · morphing primary; the
            toast live region rides 12px above it. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast} className="omc-toast-in">
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  type="button"
                  className="omc-btn omc-focusable"
                  style={styles.toastDismiss}
                  aria-label="Dismiss message"
                  onClick={() => setToast(null)}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>
          <footer style={styles.footer}>
            <button
              type="button"
              className="omc-btn omc-focusable"
              style={{...styles.backBtn, ...(activeIndex === 0 ? styles.backBtnDisabled : null)}}
              aria-label="Previous page"
              disabled={activeIndex === 0}
              onClick={() => goTo(activeIndex - 1)}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
            </button>
            <div style={styles.dotRow} aria-hidden>
              {PAGES.map((page, index) => (
                <span key={page.id} style={dotStyle(index === activeIndex)} />
              ))}
            </div>
            <span className="omc-vh">{\`Page \${activeIndex + 1} of \${PAGE_COUNT}\`}</span>
            <button
              type="button"
              className="omc-btn omc-focusable"
              style={{
                ...styles.nextBtn,
                width: primaryWidth,
                transition: reduced ? 'none' : \`width 320ms \${SPRING}\`,
              }}
              onClick={onPrimary}>
              {/* Crossfading visual labels are aria-hidden; the vh span
                  is the single accessible name. */}
              <span style={labelFade(primaryLabel === 'Next')} aria-hidden>
                Next
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              </span>
              <span style={labelFade(primaryLabel === 'Get started')} aria-hidden>
                Get started
              </span>
              <span style={labelFade(primaryLabel === 'Start over')} aria-hidden>
                Start over
              </span>
              <span className="omc-vh">{primaryLabel}</span>
            </button>
          </footer>
        </div>

        {/* COMPLETION OVERLAY — ring + check draw-on, then Done. */}
        {overlayOpen ? (
          <>
            <div
              style={styles.scrim}
              className={reduced ? undefined : 'omc-fade-in'}
              aria-hidden
              onClick={() => {
                if (overlay === 'done') {
                  dismissOverlay();
                }
              }}
            />
            <div style={styles.overlayCenter}>
              <div
                style={styles.overlayCard}
                className={reduced ? undefined : 'omc-card-in'}
                role="dialog"
                aria-modal="true"
                aria-label="Account ready">
                <svg
                  width={96}
                  height={96}
                  viewBox="0 0 96 96"
                  aria-hidden
                  className={overlay === 'done' && !reduced ? 'omc-pop' : undefined}>
                  <circle
                    cx={48}
                    cy={48}
                    r={44}
                    fill="none"
                    stroke={BRAND_TINT_16}
                    strokeWidth={6}
                  />
                  <circle
                    className="omc-ring"
                    cx={48}
                    cy={48}
                    r={44}
                    fill="none"
                    stroke={BRAND_ACCENT}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={RING_LEN}
                    strokeDashoffset={drawn ? 0 : RING_LEN}
                    transform="rotate(-90 48 48)"
                  />
                  <path
                    className="omc-check"
                    d="M31 50 L44 63 L66 37"
                    fill="none"
                    stroke={BRAND_ACCENT}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={CHECK_LEN}
                    strokeDashoffset={drawn ? 0 : CHECK_LEN}
                  />
                </svg>
                <h2 style={styles.overlayTitle}>Trail account ready</h2>
                <p style={styles.overlaySub}>Your first hike is waiting — boots on.</p>
                <button
                  ref={doneBtnRef}
                  type="button"
                  className="omc-btn omc-focusable"
                  style={{
                    ...styles.overlayDone,
                    opacity: overlay === 'done' ? 1 : 0.35,
                  }}
                  disabled={overlay !== 'done'}
                  onClick={dismissOverlay}>
                  Done
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