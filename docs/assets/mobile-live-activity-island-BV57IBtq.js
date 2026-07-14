var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a lock-ish phone home surface frozen
 *   at the classic 9:41 on Fri, Jul 4: one Fernway Couriers delivery
 *   (order #48213 from Verdant Grocer, 3 items, placed 8:54 AM, picked up
 *   9:12 AM, drop-off 24 Alder Ln Apt 3), driver Marta Villanueva ★4.9 in
 *   a silver van (7KD 482), route total 12 min, and two glass home widgets
 *   (72° Partly sunny · H 78 L 63; 11:00 Design sync · Loft B). Demo time
 *   is COMPRESSED: an interval drops the ETA 1 min every 3 s (no
 *   Date.now(), no Math.random(), no network media — art is hue-gradient
 *   tiles + monograms).
 * @output Live Activity Island — a 390px MOBILE motion demo of a morphing
 *   live-activity capsule pinned below the 52px navBar over a dimmed
 *   wallpaper hero (64px \`9:41\` clock fixture). Four states, all driven by
 *   ONE \`mode\` string: COMPACT (120×36 pill — courier monogram, ETA
 *   \`12 min\` ticking down, pulsing live dot) ⇄ tap ⇄ EXPANDED (358×132
 *   card — route progress bar with a translateX-eased moving dot, driver
 *   row, two 44px Track / Message actions) ⇄ ALERT (auto-fires when the
 *   ETA hits 2 min: warning-tint flash overlay, \`Driver arriving\` copy,
 *   one shake keyframe) ⇄ ENDED (collapses to a 64px checkmark pill, then
 *   fades out). A SegmentedControl in the Demo controls card forces each
 *   of the four states through the SAME setMode update (the mandatory
 *   button path for every capsule gesture); a Replay row and navBar
 *   button restart the staged timeline; every outcome lands in the single
 *   polite toast dock.
 * @position Page template; emitted by \`astryx template mobile-live-activity-island\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no fake OS status bar/notch — the 52px
 *   sticky navBar at y=0 is the first pixel; the \`9:41\` clock is wallpaper
 *   FIXTURE TEXT, not simulated chrome). The capsule rides a sticky
 *   islandZone (top:52, z15, pointer-events:none except the capsule) so it
 *   stays pinned below the navBar while the surface scrolls; the wallpaper
 *   hero paints behind it via a negative-margin overlap. No sheets on this
 *   surface, so the scroll-lock clause is n/a; there is no position:fixed
 *   anywhere. ONE polite toast dock (aria-live) sticky at bottom:16 (no
 *   tabBar on this surface); a new toast replaces the old.
 * Animation contract: transitions/keyframes live in the LAI_CSS string
 *   (unique \`lai-\` prefix); overshoot morphs use cubic-bezier(0.34, 1.56,
 *   0.64, 1), settles use cubic-bezier(0.22, 1, 0.36, 1). Everything
 *   animates transform/opacity ONLY — progress fill is scaleX, the route
 *   dot is translateX, the alert flash is an opacity-keyframed warning
 *   overlay, the shake is a one-shot translateX keyframe — EXCEPT the
 *   capsule itself, which transitions width/height/border-radius for the
 *   compact⇄expanded⇄alert⇄ended morph. That is this spec's single
 *   sanctioned exception (the capsule is a tiny ~120–358px element, per
 *   the batch-3 brief), and it applies to the capsule ONLY. Reduced
 *   motion (matchMedia read once in an effect, with a change listener):
 *   state changes become plain opacity crossfades; the pulse loop, shake,
 *   and flash keyframes are REMOVED entirely (static warning tint), and
 *   the progress dot jumps.
 * Container policy: inset-grouped listCards (12px radius, 1px border,
 *   hairline dividers inset 16); glass widget tiles only on the wallpaper
 *   hero. No desktop frames, no side asides, no tables.
 * Color policy: token-pure chrome on the body surface. ONE quarantined
 *   brand literal BRAND_ACCENT = light-dark(#0F7B5A, #4ADE9D) — white
 *   13px/600 text never sits on it; it is used as text/glyph color where
 *   #0F7B5A on the white card ≈ 5.9:1 and #4ADE9D on the ~#1C1C1E dark
 *   card ≈ 10.2:1. Sanctioned FIXTURE-ART literals (the wallpaper is art,
 *   identical in both schemes, math at each declaration): the dusk
 *   wallpaper gradient stops, WALL_TEXT/WALL_TEXT_DIM over it, the glass
 *   widget surface, the near-black ISLAND_SURFACE capsule with
 *   ISLAND_TEXT/ISLAND_TEXT_DIM/ISLAND_ACCENT (a real live-activity
 *   capsule is black in both schemes), and hue-gradient monogram tiles.
 *   Alert tint uses var(--color-warning). Never var(--color-text).
 * Density grid (MOBILE, verbatim): 16px screen inset · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky top z20 with
 *   always-on hairline (grid '1fr auto 1fr', paddingInline 8); islandZone
 *   148px sticky top:52 z15; capsule geometry 120×36 r18 / 358×132 r24 /
 *   200×40 r20 / 64×36 r18; rows 60px two-line / 44px utility; buttons
 *   44px actions / 44×44 icon. TYPE (via --font-family-body): 64/700
 *   clock fixture · 22/700 widget values · 17/600 nav title · 16/400 row
 *   primary · 15/700 capsule ETA · 13/400 meta · 11/500-700 overlines +
 *   monograms; nothing under 11px; tabular-nums on every count. Touch:
 *   every interactive target ≥44×44 (compact/alert layers are full-pill
 *   buttons ≥44 wide with the zone's padding giving vertical clearance;
 *   the expanded card carries a 44×44 collapse chevron and 44px
 *   Track/Message buttons; the SegmentedControl is the keyboard/button
 *   path for all capsule states).
 *
 * Responsive contract:
 * - Fluid 320–430: expanded capsule width = min(358, container − 32),
 *   derived from a ResizeObserver measure (no 358 literal against a
 *   narrow stage); driver name ellipsizes before the 44px action buttons
 *   shrink; widget tiles are a 1fr 1fr grid; overflowX:'clip' backstop.
 * - Desktop stage (~1045px in the demo): useElementWidth on the wrapper
 *   (container width, NOT viewport) — >560px renders the shell as a
 *   centered 430px column with hairline borders on a
 *   var(--color-background-muted) backdrop; never a stretched relayout.
 */

import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  CalendarIcon,
  CheckIcon,
  ChevronUpIcon,
  CloudSunIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PackageIcon,
  RotateCcwIcon,
  SmartphoneIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each with contrast math.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Fernway evergreen). Used only as
// text/glyph/fill-accent color on token surfaces: #0F7B5A on the white
// card ≈ 5.9:1; #4ADE9D on the ~#1C1C1E dark card ≈ 10.2:1. Never a text
// seat for white copy.
const BRAND_ACCENT = 'light-dark(#0F7B5A, #4ADE9D)';
// Brand-tinted wash for the navBar brand seat.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// FIXTURE ART — the dimmed dusk wallpaper, identical in both schemes (it
// is a photo-stand-in, not chrome). Stops #343064 → #1C1B33 → #101322.
const WALLPAPER =
  'linear-gradient(180deg, #343064 0%, #1C1B33 55%, #101322 100%)';
// Text over the wallpaper: #F4F5FF on the lightest stop #343064 ≈ 9.8:1;
// the 72% dim ≈ 6.9:1 — both clear 4.5:1 at every stop below it too.
const WALL_TEXT = '#F4F5FF';
const WALL_TEXT_DIM = 'rgba(244, 245, 255, 0.72)';
// Glass widget tile on the wallpaper: effective surface ≈ #23233E at the
// lightest stop; WALL_TEXT on it ≈ 12:1, WALL_TEXT_DIM ≈ 8:1.
const WALL_GLASS = 'rgba(18, 20, 38, 0.44)';
const WALL_GLASS_BORDER = '1px solid rgba(244, 245, 255, 0.16)';
// The live-activity capsule — near-black in BOTH schemes like the real
// thing (it floats over the wallpaper, then over body cards when stuck).
// ISLAND_TEXT #F5F6FA on #0B0C12 ≈ 17.6:1; the 66% dim ≈ 11.3:1;
// ISLAND_ACCENT #4ADE9D on #0B0C12 ≈ 10.9:1. The 14% white action-button
// wash yields ≈ #2C2D33 under ISLAND_TEXT ≈ 12.4:1.
const ISLAND_SURFACE = '#0B0C12';
const ISLAND_TEXT = '#F5F6FA';
const ISLAND_TEXT_DIM = 'rgba(245, 246, 250, 0.66)';
const ISLAND_ACCENT = '#4ADE9D';
const ISLAND_BUTTON_WASH = 'rgba(245, 246, 250, 0.14)';
const ISLAND_TRACK_REST = 'rgba(245, 246, 250, 0.22)';
// Monogram gradient tiles (fixture art): white 11px/700 glyphs on
// hsl(H 62% 42%) ≈ 4.9:1 or better at both stops for each hue used.
function hueTile(hue: number): string {
  return \`linear-gradient(135deg, hsl(\${hue} 62% 42%), hsl(\${hue + 38} 58% 34%))\`;
}

// ---------------------------------------------------------------------------
// INJECTED CSS — unique \`lai-\` prefix. Transform/opacity only, EXCEPT
// .lai-capsule which transitions width/height/border-radius (the single
// sanctioned exception for this spec — see the header). Reduced motion
// collapses morphs to opacity crossfades and removes every loop/one-shot
// keyframe entirely.
// ---------------------------------------------------------------------------

const OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const DECEL = 'cubic-bezier(0.22, 1, 0.36, 1)';

const LAI_CSS = \`
.lai-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.lai-btn:disabled { cursor: default; }
.lai-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.lai-focusable-light:focus-visible {
  outline: 2px solid \${ISLAND_TEXT};
  outline-offset: 2px;
}
.lai-capsule {
  transition:
    width 420ms \${OVERSHOOT},
    height 420ms \${OVERSHOOT},
    border-radius 420ms \${OVERSHOOT},
    opacity 520ms \${DECEL};
}
.lai-layer {
  transition: opacity 240ms \${DECEL}, visibility 240ms;
}
.lai-dot { transition: transform 640ms \${DECEL}; }
.lai-fill { transition: transform 640ms \${DECEL}; }
@keyframes lai-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}
.lai-pulse { animation: lai-pulse 1.6s ease-in-out infinite; }
@keyframes lai-shake {
  0%, 100% { transform: none; }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
.lai-shake { animation: lai-shake 480ms ease; }
@keyframes lai-flash {
  0% { opacity: 0; }
  18% { opacity: 0.5; }
  36% { opacity: 0.14; }
  54% { opacity: 0.44; }
  100% { opacity: 0.24; }
}
.lai-flash { animation: lai-flash 900ms ease forwards; }
@keyframes lai-pop {
  0% { transform: scale(0.4); opacity: 0; }
  60% { transform: scale(1.18); opacity: 1; }
  100% { transform: none; opacity: 1; }
}
.lai-pop { animation: lai-pop 360ms \${OVERSHOOT}; }
@keyframes lai-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.lai-toast-in { animation: lai-toast-in 200ms \${DECEL}; }
.lai-vh {
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
  .lai-capsule { transition: opacity 200ms ease; }
  .lai-layer { transition: opacity 200ms ease, visibility 200ms; }
  .lai-dot, .lai-fill { transition: none; }
  .lai-pulse, .lai-shake, .lai-pop, .lai-toast-in { animation: none; }
  .lai-flash { animation: none; opacity: 0.24; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapWide: {background: 'var(--color-background-muted)'},
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
  // NAV BAR — 52px sticky top z20; always-on hairline.
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
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  brandSeat: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
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
  // ISLAND ZONE — 148px sticky strip below the navBar; the capsule is the
  // only hit target inside it (zone itself is pointer-transparent).
  islandZone: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    height: 148,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    pointerEvents: 'none',
  },
  capsule: {
    position: 'relative',
    pointerEvents: 'auto',
    background: ISLAND_SURFACE,
    color: ISLAND_TEXT,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  },
  shakeWrap: {position: 'absolute', inset: 0},
  flashOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'var(--color-warning)',
    borderRadius: 'inherit',
    pointerEvents: 'none',
  },
  // Content layers — each authored at its own state's fixed geometry,
  // anchored top-center, crossfading while the capsule morphs around them.
  layerCompact: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 120,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
  },
  layerAlert: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 200,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 12,
  },
  layerEnded: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 64,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    color: ISLAND_ACCENT,
  },
  layerExpanded: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 132,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '10px 12px 12px',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: ISLAND_ACCENT,
    flexShrink: 0,
  },
  warnDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--color-warning)',
    flexShrink: 0,
  },
  monoTile20: {
    width: 20,
    height: 20,
    borderRadius: 6,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  compactEta: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  alertText: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  alertEta: {
    fontSize: 13,
    color: ISLAND_TEXT_DIM,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Expanded card anatomy — 24px header + 22px route zone + 44px driver
  // row + 2×8px gaps = 106 inside 132−22 padding.
  expHeader: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingRight: 40,
  },
  monoTile24: {
    width: 24,
    height: 24,
    borderRadius: 7,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  expCourier: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: 500,
    color: ISLAND_TEXT_DIM,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  expEta: {
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  collapseBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: ISLAND_TEXT_DIM,
    borderRadius: 14,
  },
  routeZone: {position: 'relative', height: 22, display: 'flex', alignItems: 'center'},
  routeTrack: {
    position: 'relative',
    width: '100%',
    height: 6,
    borderRadius: 999,
    background: ISLAND_TRACK_REST,
  },
  routeFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    background: ISLAND_ACCENT,
    transformOrigin: 'left center',
  },
  routeDot: {
    position: 'absolute',
    top: '50%',
    left: 0,
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: ISLAND_ACCENT,
    border: \`2px solid \${ISLAND_SURFACE}\`,
  },
  driverRow: {height: 44, display: 'flex', alignItems: 'center', gap: 8},
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  driverText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1},
  driverName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driverVehicle: {
    fontSize: 11,
    color: ISLAND_TEXT_DIM,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  islandAction: {
    height: 44,
    paddingInline: 10,
    borderRadius: 14,
    background: ISLAND_BUTTON_WASH,
    color: ISLAND_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // WALLPAPER HERO — pulled up behind the sticky islandZone.
  hero: {
    position: 'relative',
    zIndex: 0,
    marginTop: -148,
    padding: '170px 16px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: WALLPAPER,
  },
  clock: {
    fontSize: 64,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: WALL_TEXT,
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
  },
  heroDate: {marginTop: 8, fontSize: 15, fontWeight: 500, color: WALL_TEXT_DIM},
  heroHint: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: WALL_TEXT_DIM,
  },
  widgetGrid: {
    width: '100%',
    marginTop: 28,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  widgetTile: {
    minHeight: 88,
    borderRadius: 16,
    border: WALL_GLASS_BORDER,
    background: WALL_GLASS,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    color: WALL_TEXT,
  },
  widgetHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: WALL_TEXT_DIM,
  },
  widgetValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  widgetCaption: {
    fontSize: 11,
    color: WALL_TEXT_DIM,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // BODY SECTIONS — inset-grouped cards on the token body surface.
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  sectionHeader: {
    margin: '24px 0 8px',
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  row60: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
  },
  rowSeat: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  rowText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowTrailing: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--color-success)',
    flexShrink: 0,
  },
  segmentedRow: {padding: '12px 16px'},
  replayRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    color: BRAND_ACCENT,
    fontSize: 16,
    fontWeight: 500,
  },
  replaySpacer: {flex: 1},
  captionRow: {
    padding: '10px 16px 12px',
    fontSize: 13,
    lineHeight: 1.45,
    color: 'var(--color-text-secondary)',
  },
  stateLine: {
    padding: '10px 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST — the single polite live region, sticky at bottom:16 (no tabBar).
  toastDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
    marginTop: 24,
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
};

// ============= DATA =============

const CLOCK_FIXTURE = '9:41';
const DATE_FIXTURE = 'Friday, July 4';
const ROUTE_TOTAL_MIN = 12;
const ETA_START_MIN = 12;
const ALERT_AT_MIN = 2;
/** Compressed demo time: the ETA drops 1 min every TICK_MS. */
const TICK_MS = 3000;

const COURIER = {
  name: 'Fernway Couriers',
  monogram: 'F',
  hue: 158,
};

const DRIVER = {
  name: 'Marta Villanueva',
  shortName: 'Marta V. · ★ 4.9',
  monogram: 'MV',
  hue: 292,
  vehicle: 'Silver van · 7KD 482',
};

const DELIVERY_ROWS = [
  {
    id: 'order',
    icon: PackageIcon,
    primary: 'Verdant Grocer · 3 items',
    secondary: 'Order #48213 · placed 8:54 AM',
    trailing: '$41.86',
  },
  {
    id: 'pickup',
    icon: NavigationIcon,
    primary: 'Picked up 9:12 AM',
    secondary: 'Verdant Grocer · Pike & 3rd',
    trailing: 'Done',
    done: true,
  },
  {
    id: 'dropoff',
    icon: MapPinIcon,
    primary: '24 Alder Ln, Apt 3',
    secondary: 'Leave at door · Gate code 4415',
    trailing: 'Next',
  },
] as const;

const WIDGETS = [
  {
    id: 'weather',
    icon: CloudSunIcon,
    head: 'Weather',
    value: '72°',
    caption: 'Partly sunny · H 78 L 63',
  },
  {
    id: 'upnext',
    icon: CalendarIcon,
    head: 'Up next',
    value: '11:00',
    caption: 'Design sync · Loft B',
  },
] as const;

type IslandMode = 'compact' | 'expanded' | 'alert' | 'ended';

const MODE_OPTIONS: ReadonlyArray<{value: IslandMode; label: string}> = [
  {value: 'compact', label: 'Compact'},
  {value: 'expanded', label: 'Expanded'},
  {value: 'alert', label: 'Alert'},
  {value: 'ended', label: 'Ended'},
];

const MODE_LABEL: Record<IslandMode, string> = {
  compact: 'Compact',
  expanded: 'Expanded',
  alert: 'Alert',
  ended: 'Ended',
};

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the desktop demo stage is ~1045px inside a
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
 * listener (batch-3 animation contract). */
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
// PAGE
// ---------------------------------------------------------------------------

export default function MobileLiveActivityIslandTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWide = wrapWidth > 560;
  const reducedMotion = useReducedMotion();

  const [mode, setMode] = useState<IslandMode>('compact');
  const [etaMin, setEtaMin] = useState(ETA_START_MIN);
  const [alertFired, setAlertFired] = useState(false);
  const [alertSeq, setAlertSeq] = useState(0);
  const [endedGone, setEndedGone] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);

  const postToast = (text: string) =>
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, text}));

  // Compressed ETA tick — only while the capsule is live and above the
  // alert threshold. Cleaned up on every re-arm.
  useEffect(() => {
    if ((mode !== 'compact' && mode !== 'expanded') || etaMin <= ALERT_AT_MIN) {
      return undefined;
    }
    const timer = setTimeout(() => setEtaMin(current => current - 1), TICK_MS);
    return () => clearTimeout(timer);
  }, [mode, etaMin]);

  // Staged ALERT — auto-fires exactly once when the ETA reaches 2 min.
  useEffect(() => {
    if (
      etaMin === ALERT_AT_MIN &&
      !alertFired &&
      (mode === 'compact' || mode === 'expanded')
    ) {
      setAlertFired(true);
      setAlertSeq(seq => seq + 1);
      setMode('alert');
      postToast('Driver arriving · 2 min away');
    }
  }, [etaMin, alertFired, mode]);

  // ENDED — the check pill holds ~1.1s, then fades out (opacity only).
  useEffect(() => {
    if (mode !== 'ended') {
      return undefined;
    }
    const timer = setTimeout(() => setEndedGone(true), 1100);
    return () => clearTimeout(timer);
  }, [mode]);

  // One toast at a time; auto-clears (timer cleaned up on replace).
  useEffect(() => {
    if (toast == null) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // The mandatory button path: forces every capsule state through the
  // SAME setMode update the gestures use.
  const forceMode = (value: string) => {
    const next = value as IslandMode;
    setEndedGone(false);
    setMode(next);
    if (next === 'alert') {
      setAlertFired(true);
      setAlertSeq(seq => seq + 1);
      setEtaMin(current => Math.min(current, ALERT_AT_MIN));
      postToast('Driver arriving · 2 min away');
    } else if (next === 'ended') {
      postToast('Delivered · live activity dismissed');
    }
  };

  const replay = () => {
    setMode('compact');
    setEtaMin(ETA_START_MIN);
    setAlertFired(false);
    setEndedGone(false);
    postToast(\`Demo restarted · ETA \${ETA_START_MIN} min\`);
  };

  // Capsule geometry per state — the single sanctioned width/height
  // exception (see header). Expanded width tracks the container.
  const shellWidth = isWide ? Math.min(430, wrapWidth) : wrapWidth;
  const expandedWidth =
    wrapWidth === 0 ? 358 : Math.max(260, Math.min(358, shellWidth - 32));
  const geometry: Record<IslandMode, {w: number; h: number; r: number}> = {
    compact: {w: 120, h: 36, r: 18},
    expanded: {w: expandedWidth, h: 132, r: 24},
    alert: {w: 200, h: 40, r: 20},
    ended: {w: 64, h: 36, r: 18},
  };
  const geo = geometry[mode];

  const progress = Math.min(
    1,
    Math.max(0, (ROUTE_TOTAL_MIN - etaMin) / ROUTE_TOTAL_MIN),
  );
  const trackWidth = expandedWidth - 24;
  const dotOffset = progress * Math.max(0, trackWidth - 12);
  const etaLabel = \`\${etaMin} min\`;

  const layerVisibility = (active: boolean): CSSProperties => ({
    opacity: active ? 1 : 0,
    visibility: active ? 'visible' : 'hidden',
  });

  const collapseTarget: IslandMode = alertFired ? 'alert' : 'compact';

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isWide ? styles.wrapWide : null)}}>
      <style>{LAI_CSS}</style>
      <div style={{...styles.shell, ...(isWide ? styles.shellDesktop : null)}}>
        {/* NAV BAR — first pixel at y=0; no fake OS chrome. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="lai-btn lai-focusable"
              style={styles.brandBtn}
              aria-label="Fernway home surface"
              onClick={() => postToast('Fernway home · demo surface')}>
              <span style={styles.brandSeat}>
                <Icon icon={SmartphoneIcon} size="sm" color="inherit" />
              </span>
            </button>
          </div>
          <h1 style={styles.navTitle}>Home</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="lai-btn lai-focusable"
              style={styles.iconBtn}
              aria-label="Replay demo timeline"
              onClick={replay}>
              <Icon icon={RotateCcwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* ISLAND ZONE — sticky capsule pinned below the navBar. */}
        <div style={styles.islandZone}>
          <div
            className="lai-capsule"
            style={{
              ...styles.capsule,
              width: geo.w,
              height: geo.h,
              borderRadius: geo.r,
              opacity: mode === 'ended' && endedGone ? 0 : 1,
              pointerEvents: mode === 'ended' && endedGone ? 'none' : 'auto',
            }}>
            <div
              key={alertSeq}
              style={styles.shakeWrap}
              className={mode === 'alert' && !reducedMotion ? 'lai-shake' : undefined}>
              {/* Warning tint flash — opacity keyframe only; static tint
                  under reduced motion (CSS guard + no class). */}
              {mode === 'alert' ? (
                <div
                  style={{
                    ...styles.flashOverlay,
                    ...(reducedMotion ? {opacity: 0.24} : null),
                  }}
                  className={reducedMotion ? undefined : 'lai-flash'}
                  aria-hidden="true"
                />
              ) : null}

              {/* COMPACT layer — full-pill button (120×36 ≥44w). */}
              <button
                type="button"
                className="lai-btn lai-layer lai-focusable-light"
                style={{...styles.layerCompact, ...layerVisibility(mode === 'compact')}}
                aria-label={\`Delivery live activity — driver \${etaLabel} away. Expand details\`}
                onClick={() => setMode('expanded')}>
                <span
                  style={{...styles.monoTile20, background: hueTile(COURIER.hue)}}
                  aria-hidden="true">
                  {COURIER.monogram}
                </span>
                <span style={styles.compactEta}>{etaLabel}</span>
                <span
                  style={styles.liveDot}
                  className={reducedMotion ? undefined : 'lai-pulse'}
                  aria-hidden="true"
                />
              </button>

              {/* ALERT layer — full-pill button. */}
              <button
                type="button"
                className="lai-btn lai-layer lai-focusable-light"
                style={{...styles.layerAlert, ...layerVisibility(mode === 'alert')}}
                aria-label="Driver arriving — expand delivery details"
                onClick={() => setMode('expanded')}>
                <span style={styles.warnDot} aria-hidden="true" />
                <span style={styles.alertText}>Driver arriving</span>
                <span style={styles.alertEta}>2 min</span>
              </button>

              {/* ENDED layer — non-interactive check pill. */}
              <div
                className="lai-layer"
                style={{...styles.layerEnded, ...layerVisibility(mode === 'ended')}}>
                <span className={mode === 'ended' && !reducedMotion ? 'lai-pop' : undefined}>
                  <Icon icon={CheckIcon} size="md" color="inherit" />
                </span>
              </div>

              {/* EXPANDED layer — 358×132 card content. */}
              <div
                className="lai-layer"
                style={{
                  ...styles.layerExpanded,
                  width: expandedWidth,
                  ...layerVisibility(mode === 'expanded'),
                }}
                role="group"
                aria-label="Delivery details">
                <div style={styles.expHeader}>
                  <span
                    style={{...styles.monoTile24, background: hueTile(COURIER.hue)}}
                    aria-hidden="true">
                    {COURIER.monogram}
                  </span>
                  <span style={styles.expCourier}>{COURIER.name}</span>
                  <span style={styles.expEta}>
                    {alertFired && etaMin <= ALERT_AT_MIN ? 'Arriving · 2 min' : etaLabel}
                  </span>
                </div>
                <div style={styles.routeZone} aria-hidden="true">
                  <div style={styles.routeTrack}>
                    <div
                      className="lai-fill"
                      style={{...styles.routeFill, transform: \`scaleX(\${progress})\`}}
                    />
                    <div
                      className="lai-dot"
                      style={{...styles.routeDot, transform: \`translateX(\${dotOffset}px)\`}}
                    />
                  </div>
                </div>
                <div style={styles.driverRow}>
                  <span
                    style={{...styles.driverAvatar, background: hueTile(DRIVER.hue)}}
                    aria-hidden="true">
                    {DRIVER.monogram}
                  </span>
                  <span style={styles.driverText}>
                    <span style={styles.driverName}>{DRIVER.shortName}</span>
                    <span style={styles.driverVehicle}>{DRIVER.vehicle}</span>
                  </span>
                  <button
                    type="button"
                    className="lai-btn lai-focusable-light"
                    style={styles.islandAction}
                    onClick={() => postToast('Live map opened · order #48213')}>
                    <Icon icon={NavigationIcon} size="sm" color="inherit" />
                    Track
                  </button>
                  <button
                    type="button"
                    className="lai-btn lai-focusable-light"
                    style={styles.islandAction}
                    onClick={() => postToast(\`Message sent to \${DRIVER.name.split(' ')[0]}\`)}>
                    <Icon icon={MessageCircleIcon} size="sm" color="inherit" />
                    Message
                  </button>
                </div>
                <button
                  type="button"
                  className="lai-btn lai-focusable-light"
                  style={styles.collapseBtn}
                  aria-label="Collapse live activity"
                  onClick={() => setMode(collapseTarget)}>
                  <Icon icon={ChevronUpIcon} size="sm" color="inherit" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main style={styles.main}>
          {/* WALLPAPER HERO — dimmed gradient, clock fixture, glass widgets. */}
          <section style={styles.hero} aria-label="Home wallpaper">
            <p style={styles.clock}>{CLOCK_FIXTURE}</p>
            <p style={styles.heroDate}>{DATE_FIXTURE}</p>
            <p style={styles.heroHint}>Tap the capsule to expand it</p>
            <div style={styles.widgetGrid}>
              {WIDGETS.map(widget => (
                <div key={widget.id} style={styles.widgetTile}>
                  <span style={styles.widgetHead}>
                    <Icon icon={widget.icon} size="sm" color="inherit" />
                    {widget.head}
                  </span>
                  <span style={styles.widgetValue}>{widget.value}</span>
                  <span style={styles.widgetCaption}>{widget.caption}</span>
                </div>
              ))}
            </div>
          </section>

          {/* DELIVERY DETAILS */}
          <h2 style={styles.sectionHeader}>Delivery</h2>
          <div style={styles.listCard}>
            {DELIVERY_ROWS.map((row, index) => (
              <div key={row.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.row60}>
                  <span style={styles.rowSeat}>
                    <Icon icon={row.icon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{row.primary}</span>
                    <span style={styles.rowSecondary}>{row.secondary}</span>
                  </span>
                  {'done' in row && row.done ? (
                    <span style={styles.successDot} aria-hidden="true" />
                  ) : null}
                  <span style={styles.rowTrailing}>{row.trailing}</span>
                </div>
              </div>
            ))}
            <div style={styles.rowDivider} />
            <div style={styles.row60}>
              <span style={{...styles.driverAvatar, background: hueTile(DRIVER.hue)}}>
                {DRIVER.monogram}
              </span>
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{DRIVER.name} · ★ 4.9</span>
                <span style={styles.rowSecondary}>{DRIVER.vehicle}</span>
              </span>
              <span style={styles.rowTrailing}>{etaLabel}</span>
            </div>
          </div>

          {/* DEMO CONTROLS — the mandatory button path for every state. */}
          <h2 style={styles.sectionHeader}>Demo controls</h2>
          <div style={styles.listCard}>
            <div style={styles.segmentedRow}>
              <SegmentedControl
                value={mode}
                onChange={forceMode}
                label="Force island state"
                layout="fill">
                {MODE_OPTIONS.map(option => (
                  <SegmentedControlItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                  />
                ))}
              </SegmentedControl>
            </div>
            <div style={styles.rowDivider} />
            <button
              type="button"
              className="lai-btn lai-focusable"
              style={styles.replayRow}
              onClick={replay}>
              <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
              Replay timeline
              <span style={styles.replaySpacer} />
              <span style={styles.rowTrailing}>ETA {ETA_START_MIN} min</span>
            </button>
            <div style={styles.rowDivider} />
            <div style={styles.stateLine}>
              Capsule: {MODE_LABEL[mode]} · ETA {etaLabel}
              {alertFired ? ' · arrival alert fired' : ''}
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.captionRow}>
              Demo time is compressed — the ETA drops 1 min every 3 s and the
              arrival alert auto-fires at 2 min. Ended collapses the capsule to
              a checkmark, then fades it out.
            </div>
          </div>

          {/* TOAST DOCK — one polite live region; a new toast replaces the old. */}
          <div style={styles.toastDock} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast} className="lai-toast-in">
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  type="button"
                  className="lai-btn lai-focusable"
                  style={styles.toastClose}
                  aria-label="Dismiss notification"
                  onClick={() => setToast(null)}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
`;export{e as default};