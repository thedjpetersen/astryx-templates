// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Dart Courier order #D-4127 frozen
 *   mid-delivery: a 390×360 schematic city (20 token-tinted blocks, two
 *   tinted specials Fountain Sq / Alder Park, streets Ninth Ave + Alder
 *   St), a 5-waypoint route Cedar Kitchen (52,306) → (52,218) → (170,218)
 *   → detour (258,218) → (258,92) → drop-off (332,92), four dot legs
 *   sampled 40 points each into CSS keyframes at module scope (pure math,
 *   ease-out cubic baked into sample spacing — no rAF, no Math.random()),
 *   a 7-row route-update feed with fixed clock labels 6:12–6:26 PM, driver
 *   Mateo Reyes ★4.9 · 1,208 deliveries, ETA seed 8:20 (500s) + the one
 *   scripted +2:00 reroute, order 3 items · $32.80. No Date.now(), no
 *   network media (map art is SVG rects + monogram avatar).
 * @output Dart — Live Route Tracking: a 390px MOBILE courier-tracking
 *   screen. NavBar (Orders back · 'Order #D-4127' · Replay) over a 46dvh
 *   schematic map whose route polyline draws in on mount
 *   (pathLength=100 stroke-dashoffset), a pulsing pickup pin, and a
 *   courier dot with a heading-rotated chevron that EASES leg-by-leg
 *   along precomputed keyframes on staged timers. Passing each waypoint
 *   pops a checkpoint row into the Route updates card below (overshoot
 *   pop-in, newest first). The scripted leg-3 event flips rerouted=true:
 *   the remaining polyline goes dashed-abandoned, a detour segment draws
 *   in, the ETA jumps +2:00 under an amber double-flash overlay, and the
 *   toast dock announces 'Rerouted +2 min'. Bottom cards: ticking m:ss
 *   ETA (1s interval), 4-step progress timeline (Picked up → In transit
 *   → Nearby → Delivered) whose ACTIVE segment carries a
 *   background-position sheen loop, driver row with 44×44 Call/Message
 *   buttons, delivery details, and a 44px 'Simulate arrival' demo chip
 *   that fast-forwards to Delivered: the map dims, the LIVE pill flips,
 *   and a delivered sheet slides up with an SVG ring+check draw-on.
 *   Replay (navBar) restarts the whole choreography via a runId key.
 * @position Page template; emitted by `astryx template mobile-route-tracking-live`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no fake OS chrome — the 52px
 *   sticky navBar at y=0 is the first pixel). All overlays (mapDim,
 *   scrim, delivered sheet) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While the delivered sheet is open the
 *   shell locks to {height:'100dvh', overflow:'hidden'} and restores on
 *   close. ONE polite toast dock (aria-live) rides a sticky bottom:0
 *   zero-height dock at bottom:16 (no tabBar on this push-stack screen);
 *   a new toast REPLACES the old.
 * Animation contract: transform/opacity only, plus the two sanctioned
 *   extras — SVG stroke-dashoffset (route draw-on, ring+check draw-on)
 *   and background-position (active-step sheen). Dot motion = per-leg
 *   @keyframes with 40 samples each (decelerate ease baked into sample
 *   spacing, animation-timing-function linear); legs advance on staged
 *   setTimeout choreography (cleaned up in effects); chip pops use
 *   cubic-bezier(0.34, 1.56, 0.64, 1); draws use
 *   cubic-bezier(0.22, 1, 0.36, 1). No gesture surfaces — every
 *   interaction is already a ≥44×44 button, and outcomes are announced
 *   through the toast live region. REDUCED MOTION (matchMedia read in a
 *   useEffect with a change listener): polyline renders complete, the
 *   dot JUMPS between waypoints (inline transform, no keyframe class),
 *   pulse/blink/sheen/flash/confetti-free, chips appear instantly, the
 *   delivered ring+check render complete — loops are REMOVED, not
 *   slowed.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#1D4ED8, #93C5FD) — white on #1D4ED8 ≈
 *   6.7:1; near-black #0B1B3A on #93C5FD ≈ 9.4:1; as a route/fill vs the
 *   white card ≈ 6.7:1 and vs ~#141414 ≈ 10.2:1, all ≥3:1. Map tints are
 *   color-mix() washes of DS tokens (success/warning into muted —
 *   decorative block fills, never text). Scrim literal per the suite
 *   idiom. Never var(--color-text).
 * Density grid (MOBILE, verbatim): 16px screen inset · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky z20 hairline;
 *   inset-grouped listCards (12px radius, 1px border, hairline dividers
 *   inset 16); 44px utility rows · 48px update rows · 40px avatar; 28/700
 *   ETA display · 17/600 nav title · 16/400-600 row primary · 13/400
 *   meta · 11/500-600 overlines + map labels; nothing under 11px;
 *   tabular-nums on every count/clock. Touch: every target ≥44×44.
 * Responsive contract:
 * - Fluid 320–430: map SVG scales via preserveAspectRatio slice (route
 *   x-span 52–332 survives the crop); cards are inset 16 with minWidth 0
 *   ellipsis; step labels are 11px and never wrap. overflowX:'clip'.
 * - Desktop stage: useElementWidth ResizeObserver on the wrapper —
 *   container width >560px renders the shell as a centered 430px phone
 *   column (borderInline hairline, shadow) on a muted backdrop; never a
 *   stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  CheckIcon,
  ChevronLeftIcon,
  FastForwardIcon,
  MapPinIcon,
  MessageCircleIcon,
  PackageIcon,
  PhoneIcon,
  RefreshCwIcon,
  StarIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — the ONE quarantined brand literal + suite scrim.
// ---------------------------------------------------------------------------

// Dart route blue. White text/glyphs on #1D4ED8 ≈ 6.7:1; near-black
// #0B1B3A on #93C5FD ≈ 9.4:1. As a bare fill (route stroke, courier dot,
// avatar): #1D4ED8 vs the white card ≈ 6.7:1 and #93C5FD vs ~#141414 ≈
// 10.2:1 — both clear the ≥3:1 bar for meaningful fills.
const BRAND_ACCENT = 'light-dark(#1D4ED8, #93C5FD)';
// Text/glyphs over a BRAND_ACCENT fill (math above).
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #0B1B3A)';
// Suite scrim idiom (delivered sheet + map dim).
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// Decorative map washes — token mixes, never used for text.
const MAP_BASE =
  'color-mix(in srgb, var(--color-background-muted) 45%, var(--color-background-body))';
const PARK_FILL =
  'color-mix(in srgb, var(--color-success) 14%, var(--color-background-muted))';
const PLAZA_FILL =
  'color-mix(in srgb, var(--color-warning) 10%, var(--color-background-muted))';
const FLASH_FILL = 'color-mix(in srgb, var(--color-warning) 40%, transparent)';
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// ---------------------------------------------------------------------------
// ROUTE GEOMETRY — viewBox 390×360. Streets centered at x 52/170/258/332
// and y 92/218/306 (16px wide); the route rides street centerlines.
// ---------------------------------------------------------------------------

type Pt = readonly [number, number];

const PICKUP: Pt = [52, 306]; // Cedar Kitchen
const W1: Pt = [52, 218]; // Ninth & Fountain
const W2: Pt = [170, 218]; // Fountain Square corner — reroute fires here
const W3_ORIGINAL: Pt = [170, 92]; // abandoned corner (road closure)
const W3_DETOUR: Pt = [258, 92]; // Alder & Third
const DROPOFF: Pt = [332, 92]; // 118 Alder St

const ORIGINAL_ROUTE = '52,306 52,218 170,218 170,92 332,92';
const TRAVELED_ROUTE = '52,306 52,218 170,218';
const ABANDONED_ROUTE = '170,218 170,92 332,92';
const DETOUR_ROUTE = '170,218 258,218 258,92 332,92';

// City blocks: [x, width] per column · [y, height] per row around the
// street grid. col2/row1 = Alder Park, col1/row1 = Fountain Sq plaza.
const BLOCK_XS: ReadonlyArray<readonly [number, number]> = [
  [8, 36],
  [60, 102],
  [178, 72],
  [266, 58],
  [340, 42],
];
const BLOCK_YS: ReadonlyArray<readonly [number, number]> = [
  [10, 74],
  [100, 110],
  [226, 72],
  [314, 38],
];

interface MapBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

const MAP_BLOCKS: MapBlock[] = BLOCK_YS.flatMap(([y, h], row) =>
  BLOCK_XS.map(([x, w], col) => ({
    id: `b${row}${col}`,
    x,
    y,
    w,
    h,
    fill:
      row === 1 && col === 2
        ? PARK_FILL
        : row === 1 && col === 1
          ? PLAZA_FILL
          : 'var(--color-background-muted)',
  })),
);

// ---------------------------------------------------------------------------
// LEG KEYFRAMES — 40 sampled points per leg, precomputed at module scope
// into the <style> constant. Decelerate ease is baked into the sample
// spacing (u → 1-(1-u)^3), so the animation itself runs linear. Each
// sample carries the segment heading so the chevron rotates with travel
// (continuity-adjusted to avoid ±360° spins at corners).
// ---------------------------------------------------------------------------

function headingDeg(a: Pt, b: Pt): number {
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

function pointAlong(pts: readonly Pt[], dist: number): {x: number; y: number; deg: number} {
  let remaining = dist;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (remaining <= len || i === pts.length - 2) {
      const t = len === 0 ? 0 : Math.min(1, remaining / len);
      return {
        x: a[0] + (b[0] - a[0]) * t,
        y: a[1] + (b[1] - a[1]) * t,
        deg: headingDeg(a, b),
      };
    }
    remaining -= len;
  }
  const last = pts[pts.length - 1];
  return {x: last[0], y: last[1], deg: 0};
}

const LEG_SAMPLES = 40;

function legKeyframes(name: string, pts: readonly Pt[]): string {
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  }
  const frames: string[] = [];
  let prevDeg: number | null = null;
  for (let i = 0; i <= LEG_SAMPLES; i++) {
    const u = i / LEG_SAMPLES;
    const eased = 1 - (1 - u) ** 3;
    const p = pointAlong(pts, eased * total);
    let deg = p.deg;
    if (prevDeg != null) {
      while (deg - prevDeg > 180) deg -= 360;
      while (deg - prevDeg < -180) deg += 360;
    }
    prevDeg = deg;
    frames.push(
      `  ${(u * 100).toFixed(2)}% { transform: translate(${p.x.toFixed(2)}px, ${p.y.toFixed(
        2,
      )}px) rotate(${deg.toFixed(1)}deg); }`,
    );
  }
  return `@keyframes ${name} {\n${frames.join('\n')}\n}`;
}

interface LegSpec {
  keyframes: string;
  className: string;
  pts: readonly Pt[];
  ms: number;
}

const LEGS: LegSpec[] = [
  {keyframes: 'rtl-leg1', className: 'rtl-dot-leg1', pts: [PICKUP, W1], ms: 2400},
  {keyframes: 'rtl-leg2', className: 'rtl-dot-leg2', pts: [W1, W2], ms: 2200},
  {
    keyframes: 'rtl-leg3',
    className: 'rtl-dot-leg3',
    pts: [W2, [258, 218], W3_DETOUR],
    ms: 3400,
  },
  {keyframes: 'rtl-leg4', className: 'rtl-dot-leg4', pts: [W3_DETOUR, DROPOFF], ms: 2000},
];

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, focus rings, visually-hidden, all
// keyframes (transform/opacity + stroke-dashoffset + background-position
// only), the four precomputed leg tracks, and a belt-and-braces
// reduced-motion guard (JSX already omits motion classes when reduced).
// ---------------------------------------------------------------------------

const RTL_CSS = `
.rtl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.rtl-btn:disabled { cursor: default; }
.rtl-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.rtl-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes rtl-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
.rtl-draw { animation: rtl-draw 900ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.rtl-draw-detour { animation: rtl-draw 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes rtl-fade-in { from { opacity: 0; } to { opacity: 1; } }
.rtl-fade-in { animation: rtl-fade-in 320ms ease both; }
@keyframes rtl-pulse {
  from { transform: scale(1); opacity: 0.45; }
  to { transform: scale(2.1); opacity: 0; }
}
.rtl-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: rtl-pulse 1600ms ease-out infinite;
}
@keyframes rtl-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.rtl-blink { animation: rtl-blink 1400ms ease-in-out infinite; }
@keyframes rtl-chip-in {
  from { transform: translateY(-6px) scale(0.96); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.rtl-chip-in { animation: rtl-chip-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes rtl-flash {
  0%, 40%, 80%, 100% { opacity: 0; }
  20%, 60% { opacity: 1; }
}
.rtl-flash { animation: rtl-flash 1200ms ease-out both; }
.rtl-sheen {
  background-image: linear-gradient(100deg, transparent 32%, rgba(255, 255, 255, 0.5) 50%, transparent 68%);
  background-size: 240% 100%;
  animation: rtl-sheen 1800ms linear infinite;
}
@keyframes rtl-sheen {
  from { background-position: 120% 0; }
  to { background-position: -120% 0; }
}
@keyframes rtl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.rtl-sheet-in { animation: rtl-sheet-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.rtl-ring { animation: rtl-draw 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.rtl-check { animation: rtl-draw 320ms cubic-bezier(0.22, 1, 0.36, 1) 480ms both; }
@keyframes rtl-pop { from { transform: scale(0.9); } to { transform: scale(1); } }
.rtl-pop { animation: rtl-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 700ms both; }
${LEGS.map(leg => legKeyframes(leg.keyframes, leg.pts)).join('\n')}
${LEGS.map(leg => `.${leg.className} { animation: ${leg.keyframes} ${leg.ms}ms linear both; }`).join('\n')}
@media (prefers-reduced-motion: reduce) {
  .rtl-draw, .rtl-draw-detour, .rtl-fade-in, .rtl-pulse, .rtl-blink, .rtl-chip-in,
  .rtl-flash, .rtl-sheet-in, .rtl-ring, .rtl-check, .rtl-pop,
  .rtl-dot-leg1, .rtl-dot-leg2, .rtl-dot-leg3, .rtl-dot-leg4 { animation: none; }
  .rtl-sheen { background-image: none; animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapFramed: {background: 'var(--color-background-muted)', minHeight: '100dvh'},
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
  shellFramed: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
    boxShadow: '0 4px 24px var(--color-shadow)',
  },
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // NAV BAR — 52px sticky top z20, always-on hairline.
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
    fontVariantNumeric: 'tabular-nums',
  },
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    color: BRAND_ACCENT,
    paddingInlineEnd: 8,
  },
  backLabel: {fontSize: 16, fontWeight: 400, whiteSpace: 'nowrap'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // MAP — top 46% of the shell; SVG slice-scales, overlays absolute.
  mapWrap: {
    position: 'relative',
    height: '46dvh',
    minHeight: 300,
    maxHeight: 430,
    flexShrink: 0,
    background: MAP_BASE,
    borderBottom: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  mapSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  mapDim: {position: 'absolute', inset: 0, background: SCRIM, pointerEvents: 'none'},
  livePill: {
    position: 'absolute',
    top: 12,
    left: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingInline: 10,
    borderRadius: 999,
    background: 'color-mix(in srgb, var(--color-background-card) 88%, transparent)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
  },
  liveDot: {width: 6, height: 6, borderRadius: '50%', background: BRAND_ACCENT},
  liveDotDone: {background: 'var(--color-success)'},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 12},
  sectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cardGap: {marginTop: 12},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // ETA CARD.
  etaTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: '14px 16px 0',
  },
  etaBlock: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  etaOverline: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  etaBig: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  etaSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusChip: {
    position: 'relative',
    flexShrink: 0,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // Amber recalc flash — an opacity-animated overlay, never a bg tween.
  flashOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    background: FLASH_FILL,
    opacity: 0,
    pointerEvents: 'none',
  },
  stepsRow: {display: 'flex', gap: 6, padding: '14px 16px 16px'},
  step: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  stepBar: {height: 6, borderRadius: 3, background: 'var(--color-background-muted)'},
  stepBarDone: {background: BRAND_ACCENT},
  stepLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stepLabelOn: {color: 'var(--color-text-primary)', fontWeight: 600},
  // DRIVER CARD.
  driverRow: {display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px'},
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  driverText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  driverName: {
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driverMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  contactBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    color: BRAND_ACCENT,
  },
  // ROUTE UPDATES — checkpoint chips pop in newest-first.
  updateRow: {minHeight: 48, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px'},
  updateGlyph: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  updateGlyphWarn: {
    background: 'color-mix(in srgb, var(--color-warning) 16%, transparent)',
    color: 'var(--color-warning)',
  },
  updateGlyphDone: {
    background: 'color-mix(in srgb, var(--color-success) 14%, transparent)',
    color: 'var(--color-success)',
  },
  updateText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  updateTime: {
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // DELIVERY DETAILS — 44px utility rows.
  utilityRow: {minHeight: 44, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  utilityGlyph: {color: 'var(--color-text-secondary)', display: 'grid', placeItems: 'center'},
  utilityLabel: {width: 72, flexShrink: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  utilityValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  demoRow: {display: 'flex', justifyContent: 'center', marginTop: 24, paddingInline: 16},
  demoChip: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  demoChipDisabled: {opacity: 0.4},
  spacer: {height: 32},
  // TOAST DOCK — sticky bottom:0 zero-height dock; toast at bottom:16.
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20, height: 0},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
    insetInline: 16,
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
    paddingInline: 16,
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
  // DELIVERED SHEET — scrim z40, sheet z41, absolute inside shell.
  scrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '28px 16px 16px',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  ringWrap: {width: 72, height: 72, marginBottom: 8},
  sheetTitle: {fontSize: 22, fontWeight: 700, margin: 0},
  sheetSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: 0,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  sheetBtnRow: {display: 'flex', gap: 12, width: '100%', marginTop: 20},
  rateBtn: {
    height: 48,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  doneBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
};

// ---------------------------------------------------------------------------
// DATA =============
// ---------------------------------------------------------------------------

const ORDER_NO = 'D-4127';
const DRIVER_NAME = 'Mateo Reyes';
const DRIVER_MONO = 'MR';
const ETA_START_SECONDS = 500; // 8:20 fixture seed
const ETA_FLOOR_SECONDS = 15;
const REROUTE_PENALTY_SECONDS = 120; // the one scripted recalculation

type UpdateKind = 'ok' | 'warn' | 'done';

interface RouteUpdate {
  id: string;
  text: string;
  time: string;
  kind: UpdateKind;
}

// Fixed clock labels — the feed is a scripted fixture, never wall-clock.
const UPDATES: RouteUpdate[] = [
  {id: 'pickup', text: 'Picked up from Cedar Kitchen', time: '6:12 PM', kind: 'ok'},
  {id: 'w1', text: 'Heading north on Ninth Ave', time: '6:14 PM', kind: 'ok'},
  {id: 'w2', text: 'Passed Fountain Square', time: '6:16 PM', kind: 'ok'},
  {id: 'reroute', text: 'Rerouted via Alder St — road closure', time: '6:17 PM', kind: 'warn'},
  {id: 'w3', text: 'Back on route at Alder & Third', time: '6:19 PM', kind: 'ok'},
  {id: 'nearby', text: 'Courier is nearby — heading to your door', time: '6:22 PM', kind: 'ok'},
  {id: 'delivered', text: 'Delivered — left with your doorman', time: '6:26 PM', kind: 'done'},
];

// ---------------------------------------------------------------------------
// PHASE MACHINE — staged timers advance the choreography; Simulate
// arrival and Replay jump it. Every visual (dot rest position, chips,
// steps, status text, remaining distance) derives from `phase`.
// ---------------------------------------------------------------------------

type Phase =
  | 'drawing'
  | 'leg1'
  | 'wait1'
  | 'leg2'
  | 'wait2'
  | 'reroute'
  | 'leg3'
  | 'wait3'
  | 'leg4'
  | 'nearby'
  | 'delivered';

const NEXT_PHASE: Partial<Record<Phase, Phase>> = {
  drawing: 'leg1',
  leg1: 'wait1',
  wait1: 'leg2',
  leg2: 'wait2',
  wait2: 'reroute',
  reroute: 'leg3',
  leg3: 'wait3',
  wait3: 'leg4',
  leg4: 'nearby',
};

// Leg durations mirror the keyframe tracks; waits are waypoint dwells.
const PHASE_MS: Partial<Record<Phase, number>> = {
  drawing: 900,
  leg1: 2400,
  wait1: 700,
  leg2: 2200,
  wait2: 900,
  reroute: 1000,
  leg3: 3400,
  wait3: 700,
  leg4: 2000,
};

const LEG_CLASS_BY_PHASE: Partial<Record<Phase, string>> = {
  leg1: 'rtl-dot-leg1',
  leg2: 'rtl-dot-leg2',
  leg3: 'rtl-dot-leg3',
  leg4: 'rtl-dot-leg4',
};

// Dot rest pose per phase (start of the leg while a leg animates; the
// keyframe fill holds the endpoint until the phase advances).
const REST_BY_PHASE: Record<Phase, {pt: Pt; deg: number}> = {
  drawing: {pt: PICKUP, deg: -90},
  leg1: {pt: PICKUP, deg: -90},
  wait1: {pt: W1, deg: 0},
  leg2: {pt: W1, deg: 0},
  wait2: {pt: W2, deg: 0},
  reroute: {pt: W2, deg: 0},
  leg3: {pt: W2, deg: 0},
  wait3: {pt: W3_DETOUR, deg: 0},
  leg4: {pt: W3_DETOUR, deg: 0},
  nearby: {pt: DROPOFF, deg: 0},
  delivered: {pt: DROPOFF, deg: 0},
};

const MI_BY_PHASE: Record<Phase, string> = {
  drawing: '0.9 mi away',
  leg1: '0.9 mi away',
  wait1: '0.7 mi away',
  leg2: '0.7 mi away',
  wait2: '0.5 mi away',
  reroute: '0.5 mi away',
  leg3: '0.5 mi away',
  wait3: '0.2 mi away',
  leg4: '0.2 mi away',
  nearby: '400 ft away',
  delivered: 'at your door',
};

function formatEta(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// HOOKS — container-width helper (demo stage never fires viewport media
// queries; the phone artboard iframe does) + the mandated reduced-motion
// matchMedia read with a change listener.
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
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileRouteTrackingLiveTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isViewportWide = useMediaQuery('(min-width: 561px)');
  const isFramed = wrapWidth > 0 ? wrapWidth > 560 : isViewportWide;
  const reducedMotion = useReducedMotion();

  const [runId, setRunId] = useState(0);
  const [phase, setPhase] = useState<Phase>('drawing');
  const [chips, setChips] = useState<string[]>(['pickup']);
  const [rerouted, setRerouted] = useState(false);
  const [detourAnim, setDetourAnim] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(ETA_START_SECONDS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);

  const delivered = phase === 'delivered';

  const showToast = useCallback((text: string) => {
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, text}));
  }, []);

  const addChip = useCallback((id: string) => {
    setChips(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  // Phase advance + its scripted side effects (chips, reroute, toasts).
  const goTo = useCallback(
    (next: Phase) => {
      setPhase(next);
      if (next === 'wait1') {
        addChip('w1');
      } else if (next === 'wait2') {
        addChip('w2');
      } else if (next === 'reroute') {
        setRerouted(true);
        setDetourAnim(!reducedMotion);
        setEtaSeconds(seconds => seconds + REROUTE_PENALTY_SECONDS);
        addChip('reroute');
        showToast('Rerouted +2 min — road closure on Ninth Ave');
      } else if (next === 'wait3') {
        addChip('w3');
      } else if (next === 'nearby') {
        addChip('nearby');
        setEtaSeconds(seconds => Math.min(seconds, 150));
        showToast('Mateo is nearby — meet at the door');
      }
    },
    [addChip, reducedMotion, showToast],
  );

  // Staged choreography timers — one pending timeout, cleaned on change.
  useEffect(() => {
    const next = NEXT_PHASE[phase];
    const ms = PHASE_MS[phase];
    if (next == null || ms == null) {
      return undefined;
    }
    const timer = setTimeout(() => goTo(next), ms);
    return () => clearTimeout(timer);
  }, [phase, goTo, runId]);

  // Ticking ETA — 1s interval, floor 0:15, stops when delivered.
  useEffect(() => {
    if (delivered) {
      return undefined;
    }
    const interval = setInterval(() => {
      setEtaSeconds(seconds => Math.max(ETA_FLOOR_SECONDS, seconds - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [delivered, runId]);

  // Toast auto-replace/clear (UI timing, not fixture data).
  useEffect(() => {
    if (toast == null) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Delivered sheet: Escape closes; focus lands on Done.
  const doneRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!sheetOpen) {
      return undefined;
    }
    doneRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSheetOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const simulateArrival = useCallback(() => {
    setPhase('delivered');
    setRerouted(true);
    setDetourAnim(false);
    setChips(UPDATES.map(update => update.id));
    setEtaSeconds(0);
    setSheetOpen(true);
    showToast('Delivered · Left with your doorman');
  }, [showToast]);

  const replay = useCallback(() => {
    setRunId(id => id + 1);
    setPhase('drawing');
    setChips(['pickup']);
    setRerouted(false);
    setDetourAnim(false);
    setEtaSeconds(ETA_START_SECONDS);
    setSheetOpen(false);
    setToast(null);
  }, []);

  // Derived render state.
  const rest = REST_BY_PHASE[phase];
  const legClass = reducedMotion ? undefined : LEG_CLASS_BY_PHASE[phase];
  const arriveLabel = rerouted ? '6:26 PM' : '6:24 PM';
  const statusText = delivered
    ? 'DELIVERED'
    : phase === 'leg4' || phase === 'nearby'
      ? 'NEARBY'
      : phase === 'reroute' || phase === 'leg3'
        ? 'REROUTED +2 MIN'
        : 'IN TRANSIT';
  const nearbyActive = phase === 'leg4' || phase === 'nearby';
  const steps: Array<{id: string; label: string; on: boolean; active: boolean}> = [
    {id: 'picked', label: 'Picked up', on: true, active: false},
    {id: 'transit', label: 'In transit', on: true, active: !nearbyActive && !delivered},
    {id: 'near', label: 'Nearby', on: nearbyActive || delivered, active: nearbyActive},
    {id: 'deliv', label: 'Delivered', on: delivered, active: false},
  ];
  const visibleUpdates = UPDATES.filter(update => chips.includes(update.id)).reverse();
  const waypointMarks: Array<{id: string; pt: Pt}> = [
    {id: 'w1', pt: W1},
    {id: 'w2', pt: W2},
    {id: 'w3', pt: rerouted ? W3_DETOUR : W3_ORIGINAL},
  ];

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isFramed ? styles.wrapFramed : null)}}>
      <style>{RTL_CSS}</style>
      <div
        style={{
          ...styles.shell,
          ...(isFramed ? styles.shellFramed : null),
          ...(sheetOpen ? styles.shellLocked : null),
        }}>
        <h1 className="rtl-vh">Dart — live route tracking for order {ORDER_NO}</h1>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button type="button" className="rtl-btn rtl-focusable" style={styles.backBtn} onClick={() => {}}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Orders</span>
            </button>
          </div>
          <p style={styles.navTitle}>Order #{ORDER_NO}</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="rtl-btn rtl-focusable"
              style={styles.iconBtn}
              aria-label="Replay tracking demo"
              onClick={replay}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* SCHEMATIC MAP — top 46% */}
        <div style={styles.mapWrap}>
          <svg
            key={runId}
            viewBox="0 0 390 360"
            preserveAspectRatio="xMidYMid slice"
            style={styles.mapSvg}
            role="img"
            aria-label="Schematic map: courier route from Cedar Kitchen north on Ninth Avenue, rerouted via Alder Street to 118 Alder St">
            <rect x={0} y={0} width={390} height={360} fill={MAP_BASE} />
            {MAP_BLOCKS.map(block => (
              <rect
                key={block.id}
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx={5}
                fill={block.fill}
                stroke="var(--color-border)"
                strokeOpacity={0.5}
              />
            ))}
            {/* Map labels — 11px floor, halo stroke for legibility. */}
            <text
              x={111}
              y={158}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              letterSpacing={1}
              fill="var(--color-text-secondary)">
              FOUNTAIN SQ
            </text>
            <text
              x={214}
              y={158}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              letterSpacing={1}
              fill="var(--color-text-secondary)">
              ALDER PARK
            </text>
            <text
              transform="rotate(-90 44 276)"
              x={44}
              y={276}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              letterSpacing={1}
              fill="var(--color-text-secondary)">
              NINTH AVE
            </text>
            <text
              transform="rotate(-90 250 168)"
              x={250}
              y={168}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              letterSpacing={1}
              fill="var(--color-text-secondary)">
              ALDER ST
            </text>

            {/* ROUTE — draw-on via pathLength/dashoffset; the reroute swaps
                the remainder for a dashed abandoned ghost + detour draw. */}
            {!rerouted ? (
              <polyline
                points={ORIGINAL_ROUTE}
                fill="none"
                stroke={BRAND_ACCENT}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                strokeDasharray={100}
                className={reducedMotion ? undefined : 'rtl-draw'}
              />
            ) : (
              <>
                <polyline
                  points={ABANDONED_ROUTE}
                  fill="none"
                  stroke="var(--color-text-secondary)"
                  strokeOpacity={0.4}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="3 8"
                  className={detourAnim ? 'rtl-fade-in' : undefined}
                />
                <polyline
                  points={TRAVELED_ROUTE}
                  fill="none"
                  stroke={BRAND_ACCENT}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={DETOUR_ROUTE}
                  fill="none"
                  stroke={BRAND_ACCENT}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={100}
                  strokeDasharray={100}
                  className={detourAnim ? 'rtl-draw-detour' : undefined}
                />
              </>
            )}

            {/* Waypoint beads — fill once passed. */}
            {waypointMarks.map(mark => {
              const passed = chips.includes(mark.id);
              return (
                <circle
                  key={mark.id}
                  cx={mark.pt[0]}
                  cy={mark.pt[1]}
                  r={4.5}
                  fill={passed ? BRAND_ACCENT : 'var(--color-background-card)'}
                  stroke={BRAND_ACCENT}
                  strokeWidth={2}
                />
              );
            })}

            {/* Pickup pin — pulsing halo (removed under reduced motion). */}
            {!reducedMotion && !delivered && (
              <circle
                cx={PICKUP[0]}
                cy={PICKUP[1]}
                r={11}
                fill={BRAND_ACCENT}
                opacity={0.45}
                className="rtl-pulse"
              />
            )}
            <circle
              cx={PICKUP[0]}
              cy={PICKUP[1]}
              r={7}
              fill={BRAND_ACCENT}
              stroke="var(--color-background-card)"
              strokeWidth={2}
            />
            <text
              x={66}
              y={311}
              fontSize={11}
              fontWeight={600}
              fill="var(--color-text-primary)"
              paintOrder="stroke"
              stroke="var(--color-background-card)"
              strokeWidth={3}>
              Cedar Kitchen
            </text>

            {/* Drop-off pin + label. */}
            <circle
              cx={DROPOFF[0]}
              cy={DROPOFF[1]}
              r={9}
              fill="var(--color-background-card)"
              stroke={BRAND_ACCENT}
              strokeWidth={2.5}
            />
            <circle cx={DROPOFF[0]} cy={DROPOFF[1]} r={3.5} fill={BRAND_ACCENT} />
            <text
              x={348}
              y={72}
              textAnchor="end"
              fontSize={11}
              fontWeight={600}
              fill="var(--color-text-primary)"
              paintOrder="stroke"
              stroke="var(--color-background-card)"
              strokeWidth={3}>
              You · Apt 4B
            </text>

            {/* COURIER DOT — heading-rotated chevron; keyframed per leg,
                inline rest pose otherwise (reduced motion: jumps). */}
            <g
              className={legClass}
              style={{
                transform: `translate(${rest.pt[0]}px, ${rest.pt[1]}px) rotate(${rest.deg}deg)`,
              }}>
              <circle r={8.5} fill={BRAND_ACCENT} stroke="var(--color-background-card)" strokeWidth={2} />
              <path d="M -2.5 -4.5 L 6 0 L -2.5 4.5 Z" fill={BRAND_ON_ACCENT} />
            </g>
          </svg>

          {delivered && (
            <div style={styles.mapDim} className={reducedMotion ? undefined : 'rtl-fade-in'} />
          )}
          <div style={styles.livePill}>
            <span
              aria-hidden
              className={!reducedMotion && !delivered ? 'rtl-blink' : undefined}
              style={{...styles.liveDot, ...(delivered ? styles.liveDotDone : null)}}
            />
            {delivered ? 'DELIVERED' : 'LIVE'}
          </div>
        </div>

        <main style={styles.main}>
          {/* ETA + PROGRESS TIMELINE */}
          <section style={styles.listCard} aria-label="Arrival estimate">
            <div style={styles.etaTopRow}>
              <div style={styles.etaBlock}>
                <span style={styles.etaOverline}>{delivered ? 'Delivered' : 'Arriving in'}</span>
                <span style={styles.etaBig}>{delivered ? arriveLabel : formatEta(etaSeconds)}</span>
                <span style={styles.etaSub}>
                  {delivered
                    ? 'Left with your doorman'
                    : `Estimated ${arriveLabel} · ${MI_BY_PHASE[phase]}`}
                </span>
              </div>
              <span style={styles.statusChip}>
                {statusText}
                <span
                  aria-hidden
                  style={styles.flashOverlay}
                  className={rerouted && !reducedMotion ? 'rtl-flash' : undefined}
                />
              </span>
            </div>
            <div style={styles.stepsRow}>
              {steps.map(step => (
                <div key={step.id} style={styles.step}>
                  <div
                    className={step.active && !reducedMotion ? 'rtl-sheen' : undefined}
                    style={{...styles.stepBar, ...(step.on ? styles.stepBarDone : null)}}
                  />
                  <span style={{...styles.stepLabel, ...(step.on ? styles.stepLabelOn : null)}}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* DRIVER CARD */}
          <section style={{...styles.listCard, ...styles.cardGap}} aria-label="Your courier">
            <div style={styles.driverRow}>
              <span style={styles.avatar} aria-hidden>
                {DRIVER_MONO}
              </span>
              <div style={styles.driverText}>
                <span style={styles.driverName}>{DRIVER_NAME}</span>
                <span style={styles.driverMeta}>
                  <Icon icon={StarIcon} size="xsm" color="warning" />
                  4.9 · 1,208 deliveries · Cargo e-bike
                </span>
              </div>
              <button
                type="button"
                className="rtl-btn rtl-focusable"
                style={styles.contactBtn}
                aria-label={`Call ${DRIVER_NAME}`}
                onClick={() => showToast('Calling Mateo…')}>
                <Icon icon={PhoneIcon} size="md" color="inherit" />
              </button>
              <button
                type="button"
                className="rtl-btn rtl-focusable"
                style={styles.contactBtn}
                aria-label={`Message ${DRIVER_NAME}`}
                onClick={() => showToast('Message sent: “Leave at the door, thanks!”')}>
                <Icon icon={MessageCircleIcon} size="md" color="inherit" />
              </button>
            </div>
          </section>

          {/* ROUTE UPDATES — checkpoint chips pop in newest-first. */}
          <h2 style={styles.sectionHeader}>Route updates</h2>
          <section style={styles.listCard} aria-label="Route updates">
            <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
              {visibleUpdates.map((update, index) => (
                <li key={update.id} className={reducedMotion ? undefined : 'rtl-chip-in'}>
                  {index > 0 && <div style={styles.rowDivider} aria-hidden />}
                  <div style={styles.updateRow}>
                    <span
                      style={{
                        ...styles.updateGlyph,
                        ...(update.kind === 'warn' ? styles.updateGlyphWarn : null),
                        ...(update.kind === 'done' ? styles.updateGlyphDone : null),
                      }}
                      aria-hidden>
                      <Icon
                        icon={update.kind === 'warn' ? TriangleAlertIcon : CheckIcon}
                        size="xsm"
                        color="inherit"
                      />
                    </span>
                    <span style={styles.updateText}>{update.text}</span>
                    <span style={styles.updateTime}>{update.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* DELIVERY DETAILS */}
          <h2 style={styles.sectionHeader}>Delivery details</h2>
          <section style={styles.listCard} aria-label="Delivery details">
            <div style={styles.utilityRow}>
              <span style={styles.utilityGlyph} aria-hidden>
                <Icon icon={MapPinIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.utilityLabel}>Pickup</span>
              <span style={styles.utilityValue}>Cedar Kitchen · 421 Ninth Ave</span>
            </div>
            <div style={styles.rowDivider} aria-hidden />
            <div style={styles.utilityRow}>
              <span style={styles.utilityGlyph} aria-hidden>
                <Icon icon={MapPinIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.utilityLabel}>Drop-off</span>
              <span style={styles.utilityValue}>118 Alder St · Apt 4B</span>
            </div>
            <div style={styles.rowDivider} aria-hidden />
            <div style={styles.utilityRow}>
              <span style={styles.utilityGlyph} aria-hidden>
                <Icon icon={PackageIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.utilityLabel}>Order</span>
              <span style={styles.utilityValue}>3 items · $32.80 · Paid</span>
            </div>
          </section>

          {/* DEMO FAST-FORWARD */}
          <div style={styles.demoRow}>
            <button
              type="button"
              className="rtl-btn rtl-focusable"
              style={{...styles.demoChip, ...(delivered ? styles.demoChipDisabled : null)}}
              disabled={delivered}
              onClick={simulateArrival}>
              <Icon icon={FastForwardIcon} size="sm" color="inherit" />
              Simulate arrival
            </button>
          </div>
          <div style={styles.spacer} aria-hidden />
        </main>

        {/* TOAST DOCK — the single polite live region. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite">
            {toast != null && (
              <div key={toast.seq} style={styles.toast} className={reducedMotion ? undefined : 'rtl-chip-in'}>
                <span style={styles.toastText}>{toast.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* DELIVERED SHEET — absolute inside shell; shell scroll-locked. */}
        {sheetOpen && (
          <>
            <div
              style={styles.scrim}
              className={reducedMotion ? undefined : 'rtl-fade-in'}
              onClick={() => setSheetOpen(false)}
              aria-hidden
            />
            <section
              style={styles.sheet}
              className={reducedMotion ? undefined : 'rtl-sheet-in'}
              role="dialog"
              aria-modal="true"
              aria-label="Delivery complete">
              <div style={styles.ringWrap} className={reducedMotion ? undefined : 'rtl-pop'}>
                <svg viewBox="0 0 72 72" width={72} height={72} aria-hidden>
                  <circle
                    cx={36}
                    cy={36}
                    r={32}
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth={4}
                    pathLength={100}
                    strokeDasharray={100}
                    className={reducedMotion ? undefined : 'rtl-ring'}
                  />
                  <polyline
                    points="22,37 32,47 50,27"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={100}
                    strokeDasharray={100}
                    className={reducedMotion ? undefined : 'rtl-check'}
                  />
                </svg>
              </div>
              <h2 style={styles.sheetTitle}>Delivered</h2>
              <p style={styles.sheetSub}>
                6:26 PM · Left with your doorman · Order #{ORDER_NO}
              </p>
              <div style={styles.sheetBtnRow}>
                <button
                  type="button"
                  className="rtl-btn rtl-focusable"
                  style={styles.rateBtn}
                  onClick={() => showToast('Rating saved — 5 stars for Mateo')}>
                  Rate Mateo
                </button>
                <button
                  type="button"
                  ref={doneRef}
                  className="rtl-btn rtl-focusable"
                  style={styles.doneBtn}
                  onClick={() => setSheetOpen(false)}>
                  Done
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
